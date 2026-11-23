import { chromium } from "playwright-core";

const browser = await chromium.connectOverCDP("http://127.0.0.1:9223");
const context = browser.contexts()[0];
const page = context.pages()[0] ?? (await context.newPage());
const homeUrl = "http://localhost:3000";
const productUrl = `${homeUrl}/products/classic-spindle?category=king-beds`;
const staticMobileNav = ".mobile-nav{position:relative!important;bottom:auto!important;left:auto!important;right:auto!important;width:100%!important}";
const categories = [
  { name: "King Beds", heading: "King Bed Models" },
  { name: "Queen Beds", heading: "Queen Bed Models" },
  { name: "Double Beds", heading: "Double Bed Models" },
  { name: "Triple Beds", heading: "Triple Bed Models" },
  { name: "Kids’ Beds", heading: "Kids’ Bed Models" },
  { name: "Bunk Beds", heading: "Bunk Bed Models" },
];
const designIds = {
  "Classic Spindle": "classic-spindle",
  "Square Grid": "square-grid",
  "Arched Rail": "arched-rail",
};

async function assertNoOverflow(width, url) {
  await page.waitForTimeout(80);
  const result = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  if (result.document > result.viewport || result.body > result.viewport) {
    throw new Error(`Horizontal overflow at ${width}px for ${url}: ${JSON.stringify(result)}`);
  }
}

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(homeUrl, { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.removeItem("homefinds-cart-v1"));
await page.reload({ waitUntil: "networkidle" });
await page.addStyleTag({ content: staticMobileNav });
await page.screenshot({ path: "qa/home-mobile.png", fullPage: true });
await page.setViewportSize({ width: 1440, height: 1000 });
await page.goto(homeUrl, { waitUntil: "networkidle" });
await page.screenshot({ path: "qa/home-desktop.png", fullPage: true });

// Capture the product page with the picker both closed and open on each viewport.
for (const viewport of [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 1000 },
]) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.goto(productUrl, { waitUntil: "networkidle" });
  if (viewport.width < 761) await page.addStyleTag({ content: staticMobileNav });
  await page.screenshot({ path: `qa/product-${viewport.name}.png`, fullPage: true });
  await page.getByRole("button", { name: /Choose your design/ }).click();
  await page.waitForTimeout(150);
  await page.screenshot({ path: `qa/design-picker-open-${viewport.name}.png`, fullPage: true });
  await page.getByRole("button", { name: /Choose your design/ }).click();
  if (await page.locator(".design-picker-panel").count()) throw new Error("Picker did not close.");
}

// Exercise every category, every design option in each list, and the two view modes.
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(productUrl, { waitUntil: "networkidle" });
const originalPath = new URL(page.url()).pathname;
const categoryButtons = page.locator(".category-chip-rail button");
if (await categoryButtons.count() !== categories.length) throw new Error("Category chip count is incorrect.");
for (let categoryIndex = 0; categoryIndex < categories.length; categoryIndex++) {
  await categoryButtons.nth(categoryIndex).click();
  const actualHeading = await page.locator(".model-selector > strong").innerText();
  if (actualHeading.trim().toLowerCase() !== categories[categoryIndex].heading.toLowerCase()) {
    throw new Error(`Incorrect model heading for ${categories[categoryIndex].name}: ${actualHeading}.`);
  }
  await page.getByRole("button", { name: /Choose your design/ }).click();
  const choices = page.locator(".design-option");
  const choiceCount = await choices.count();
  if (!choiceCount) throw new Error(`No design options for ${categories[categoryIndex].name}.`);
  const names = await page.locator(".design-option-name").allTextContents();
  for (const name of names) {
    await page.locator(".design-option").filter({ hasText: name }).click();
    if (new URL(page.url()).pathname !== originalPath) throw new Error("Design selection navigated away from the configurator.");
    if (await page.getByRole("button", { name: /Choose your design/ }).getAttribute("aria-expanded") !== "false") {
      throw new Error("Selecting a model did not close the design picker.");
    }
    const designId = designIds[name];
    if (!designId) throw new Error(`Unexpected model card: ${name}`);
    const frameSrc = await page.locator(".frame-image").getAttribute("src");
    const dressedSrc = await page.locator(".dressed-image").getAttribute("src");
    if (!frameSrc?.includes(`${designId}-`) || !frameSrc.endsWith("-frame.webp") || !dressedSrc?.includes(`${designId}-`) || !dressedSrc.endsWith("-dressed.webp")) {
      throw new Error(`Frame/dressed previews did not update for ${name}.`);
    }
    await page.getByRole("button", { name: /Choose your design/ }).click();
  }
  await page.getByRole("button", { name: /Choose your design/ }).click();
  await page.getByRole("button", { name: "Frame Only", exact: true }).click();
  if (await page.locator(".dressed-image").count()) throw new Error("Frame Only still displays bedding.");
  await page.getByRole("button", { name: "Fully Dressed", exact: true }).click();
  if (!(await page.locator(".dressed-image").isVisible())) throw new Error("Fully Dressed preview is missing.");
}

// Verify repeat additions, stable line snapshots, drawer confirmation and checkout parity.
await page.getByRole("button", { name: "King Beds", exact: true }).click();
await page.getByRole("button", { name: /Choose your design/ }).click();
await page.locator(".design-option").filter({ hasText: "Classic Spindle" }).click();
await page.getByRole("button", { name: "Matte Black", exact: true }).click();
await page.locator(".size-choice button").first().click();
const addButton = page.getByRole("button", { name: /Add to Bag/ });
if (await addButton.isDisabled()) throw new Error("Add to Bag is disabled before a real pending operation.");
await addButton.click();
if (!(await page.getByRole("status").filter({ hasText: "Classic Spindle added to your bag" }).isVisible())) {
  throw new Error("Add to Bag did not show a clear confirmation.");
}
await page.waitForTimeout(350);
await page.screenshot({ path: "qa/cart-mobile.png" });
await page.getByRole("button", { name: "Close cart" }).click();
if (await addButton.isDisabled()) throw new Error("Add to Bag remained disabled after adding.");
await addButton.click();
if (await page.locator(".cart-drawer-item").count() !== 1 || await page.locator(".cart-quantity span").innerText() !== "2") {
  throw new Error("Same configuration did not increment only its cart line.");
}
await page.getByRole("button", { name: "Close cart" }).click();
await page.getByRole("button", { name: /Choose your design/ }).click();
await page.locator(".design-option").filter({ hasText: "Square Grid" }).click();
await page.getByRole("button", { name: "White", exact: true }).click();
await page.locator(".size-choice button").nth(1).click();
await page.getByRole("button", { name: /Add to Bag/ }).click();
if (await page.locator(".cart-drawer-item").count() !== 2) throw new Error("A different design/size/finish overwrote the first line.");
const cartLines = page.locator(".cart-drawer-item");
const lineOne = await cartLines.nth(0).innerText();
const lineTwo = await cartLines.nth(1).innerText();
if (!lineOne.includes("Classic Spindle") || !lineOne.includes("Matte Black") || !lineOne.includes("4×6") || !lineTwo.includes("Square Grid") || !lineTwo.includes("White") || !lineTwo.includes("5×6")) {
  throw new Error("Cart lines lost their saved design, size, or finish.");
}
await page.waitForTimeout(350);
await page.setViewportSize({ width: 1440, height: 1000 });
await page.waitForTimeout(350);
await page.screenshot({ path: "qa/cart-desktop.png" });
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(350);
await page.screenshot({ path: "qa/cart-mobile.png" });
await page.getByRole("link", { name: /Continue to checkout/ }).click();
await page.waitForURL(/checkout/);
if (await page.locator(".checkout-item").count() !== 2) throw new Error("Checkout did not retain both saved cart configurations.");
if (!(await page.locator(".checkout-grand-total strong").innerText()).includes("1,900,000")) throw new Error("Checkout total does not match the saved cart lines.");
await page.addStyleTag({ content: staticMobileNav });
await page.screenshot({ path: "qa/checkout-mobile.png", fullPage: true });
await page.setViewportSize({ width: 1440, height: 1000 });
await page.screenshot({ path: "qa/checkout-desktop.png", fullPage: true });

// Check closed pages and open picker states at every layout breakpoint.
for (const width of [320, 360, 375, 390, 430, 768, 1024, 1280, 1440]) {
  await page.setViewportSize({ width, height: width < 600 ? 760 : 900 });
  for (const url of [homeUrl, productUrl, `${homeUrl}/checkout`]) {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await assertNoOverflow(width, url);
  }
  await page.goto(productUrl, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(150);
  await page.getByRole("button", { name: /Choose your design/ }).click();
  await page.waitForSelector(".design-picker-panel", { state: "visible" });
  await assertNoOverflow(width, `${productUrl} [picker open]`);
  const bounds = await page.evaluate(() => {
    const trigger = document.querySelector(".design-picker-trigger").getBoundingClientRect();
    const panel = document.querySelector(".design-picker-panel").getBoundingClientRect();
    return { triggerLeft: trigger.left, panelLeft: panel.left, panelRight: panel.right, viewport: innerWidth };
  });
  if (Math.abs(bounds.triggerLeft - bounds.panelLeft) > 1 || bounds.panelRight > bounds.viewport + 1) {
    throw new Error(`Picker is misaligned or off-screen at ${width}px: ${JSON.stringify(bounds)}`);
  }
  console.log(`${width}px routes and picker passed`);
}

console.log("Categories, every model option, bed views, cart confirmations, saved cart lines, checkout totals and responsive layouts passed.");
await browser.close();
