import { chromium } from "playwright-core";

const browser = await chromium.connectOverCDP("http://127.0.0.1:9223");
const context = browser.contexts()[0];
const page = context.pages()[0] ?? (await context.newPage());
const homeUrl = "http://localhost:3000";
const productUrl = `${homeUrl}/products/classic-spindle?category=king-beds`;
const mobileNavForFullPage = ".mobile-nav{position:relative!important;bottom:auto!important;left:auto!important;right:auto!important;width:100%!important}";

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(homeUrl, { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.removeItem("homefinds-cart-v1"));
await page.reload({ waitUntil: "networkidle" });
await page.addStyleTag({ content: mobileNavForFullPage });
await page.screenshot({ path: "qa/home-mobile.png", fullPage: true });
await page.setViewportSize({ width: 1440, height: 1000 });
await page.goto(homeUrl, { waitUntil: "networkidle" });
await page.screenshot({ path: "qa/home-desktop.png", fullPage: true });

const captures = [
  { name: "product-mobile.png", width: 390, height: 844 },
  { name: "product-tablet.png", width: 768, height: 1024 },
  { name: "product-desktop.png", width: 1440, height: 1000 },
];
const overflowIssues = [];
for (const capture of captures) {
  await page.setViewportSize({ width: capture.width, height: capture.height });
  await page.goto(productUrl, { waitUntil: "networkidle" });
  if (capture.width < 761) await page.addStyleTag({ content: mobileNavForFullPage });
  await page.screenshot({ path: `qa/${capture.name}`, fullPage: true });
}

// Check page width at every planned breakpoint on the home, product and checkout routes.
for (const width of [320, 360, 375, 390, 430, 768, 1024, 1280, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  for (const url of [homeUrl, productUrl, `${homeUrl}/checkout`]) {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(120);
    const dimensions = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
    }));
    if (dimensions.document > dimensions.viewport || dimensions.body > dimensions.viewport) {
      overflowIssues.push({ width, url, ...dimensions });
    }
  }
  console.log(`${width}px responsive route check complete`);
}

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(productUrl, { waitUntil: "networkidle" });
await page.addStyleTag({ content: mobileNavForFullPage });
await page.getByRole("button", { name: "Queen Beds", exact: true }).click();
if (!(await page.getByRole("heading", { name: "Square Grid Metallic Bed" }).isVisible())) {
  throw new Error("Selecting Queen did not update the product in place.");
}
await page.getByRole("button", { name: /King Beds/ , exact: true }).click();
await page.getByRole("button", { name: /Choose your design/ }).click();
const visibleDesigns = await page.locator(".design-option-name").allTextContents();
if (visibleDesigns.length !== 3 || !visibleDesigns.includes("Arched Rail")) {
  throw new Error(`Double category design picker is incomplete: ${visibleDesigns.join(", ")}`);
}
await page.screenshot({ path: "qa/design-picker-mobile.png", fullPage: true });
await page.locator(".design-option").filter({ hasText: "Classic Spindle" }).click();
if (!(await page.getByRole("heading", { name: "Classic Spindle Metallic Bed" }).isVisible())) {
  throw new Error("Choosing a design did not update the current product.");
}

const designs = [
  { category: "King Beds", model: "Classic Spindle", design: "classic-spindle" },
  { category: "King Beds", model: "Square Grid", design: "square-grid" },
  { category: "Bunk Beds", model: "Arched Rail", design: "arched-rail" },
];
const finishes = ["Matte Black", "White", "Graphite Grey", "Antique Bronze", "Deep Navy"];
const finishSlugs = ["matte-black", "white", "graphite-grey", "antique-bronze", "deep-navy"];
for (const variant of designs) {
  await page.getByRole("button", { name: variant.category, exact: true }).click();
  await page.getByRole("button", { name: /Choose your design/ }).click();
  await page.locator(".design-option").filter({ hasText: variant.model }).click();
  for (let index = 0; index < finishes.length; index++) {
    await page.getByRole("button", { name: finishes[index], exact: true }).click();
    const frameSuffix = `${variant.design}-${finishSlugs[index]}-frame.webp`;
    const dressedSuffix = `${variant.design}-${finishSlugs[index]}-dressed.webp`;
    await page.waitForFunction(({ frameSuffix: frameEnd, dressedSuffix: dressedEnd }) =>
      document.querySelector(".frame-image")?.getAttribute("src")?.endsWith(frameEnd) &&
      document.querySelector(".dressed-image")?.getAttribute("src")?.endsWith(dressedEnd),
    { frameSuffix, dressedSuffix });
  }
}
console.log("All 15 design/finish image pairs verified.");

// Price selection is carried into the saved cart line and checkout.
await page.locator(".size-choice button").first().click();
await page.getByRole("button", { name: /Add to Bag/ }).click();
await page.locator(".cart-drawer").waitFor({ state: "visible" });
await page.locator(".cart-drawer-backdrop").waitFor({ state: "visible" });
await page.waitForTimeout(450);
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: "qa/cart-mobile.png" });

// Re-adding the same option increments only its matching line.
await page.getByRole("button", { name: "Continue shopping" }).click();
await page.getByRole("button", { name: "Increase quantity" }).click();
await page.getByRole("button", { name: /Add to Bag/ }).click();
const oneLine = page.locator(".cart-drawer-item");
if (await oneLine.count() !== 1 || (await oneLine.locator(".cart-quantity span").innerText()) !== "3") {
  throw new Error("Adding the same configuration did not increment its own quantity.");
}
await page.getByRole("button", { name: "Continue shopping" }).click();

// A different design/finish remains a separate, stable cart line.
await page.getByRole("button", { name: "King Beds", exact: true }).click();
await page.getByRole("button", { name: /Choose your design/ }).click();
await page.locator(".design-option").filter({ hasText: "Square Grid" }).click();
await page.getByRole("button", { name: "White", exact: true }).click();
await page.getByRole("button", { name: /Add to Bag/ }).click();
if (await page.locator(".cart-drawer-item").count() !== 2) {
  throw new Error("A different design/finish overwrote an existing cart line.");
}
await page.setViewportSize({ width: 1440, height: 1000 });
await page.waitForTimeout(450);
await page.screenshot({ path: "qa/cart-desktop.png" });
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(450);
await page.screenshot({ path: "qa/cart-mobile.png" });

await page.getByRole("link", { name: /Continue to checkout/ }).click();
await page.waitForURL(/checkout/);
if ((await page.locator(".checkout-item").count()) !== 2) {
  throw new Error("Checkout did not retain both saved cart configurations.");
}
if ((await page.locator(".checkout-grand-total strong").innerText()) !== "UGX 2,400,000") {
  throw new Error("Checkout total does not match the saved line quantities and prices.");
}
await page.addStyleTag({ content: mobileNavForFullPage });
await page.screenshot({ path: "qa/checkout-mobile.png", fullPage: true });
await page.setViewportSize({ width: 1440, height: 1000 });
await page.screenshot({ path: "qa/checkout-desktop.png", fullPage: true });

if (overflowIssues.length) throw new Error(`Horizontal overflow: ${JSON.stringify(overflowIssues)}`);
console.log("Category picker, 15 image pairs, cart lines, checkout totals and responsive widths verified.");
await browser.close();

