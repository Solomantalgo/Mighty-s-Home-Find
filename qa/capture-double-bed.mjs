import { chromium } from "playwright-core";

const browser = await chromium.connectOverCDP("http://127.0.0.1:9223");
const context = browser.contexts()[0];
const page = context.pages()[0] ?? (await context.newPage());
const url = "http://localhost:3000/products/double-lowline?category=double-beds";

for (const viewport of [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile", width: 390, height: 844 },
]) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.goto(url, { waitUntil: "networkidle" });
  if (viewport.width < 761) {
    await page.addStyleTag({
      content:
        ".mobile-nav{position:relative!important;bottom:auto!important;left:auto!important;right:auto!important;width:100%!important}",
    });
  }
  if (!(await page.getByRole("heading", { name: "Lowline Platform Double Bed" }).isVisible())) {
    throw new Error("The Double category did not load its unique Lowline bed.");
  }
  const names = await page.locator(".design-option-name").allTextContents();
  await page.getByRole("button", { name: /Choose your design/ }).click();
  const modelNames = await page.locator(".design-option-name").allTextContents();
  if (!modelNames.includes("Lowline Platform") || !modelNames.includes("Arched Rail")) {
    throw new Error(`Unexpected Double designs: ${modelNames.join(", ") || names.join(", ")}`);
  }
  await page.getByRole("button", { name: /Choose your design/ }).click();
  for (const finish of ["Matte Black", "White", "Graphite Grey", "Antique Bronze", "Deep Navy"]) {
    await page.getByRole("button", { name: finish, exact: true }).click();
    const finishId = finish.toLowerCase().replaceAll(" ", "-");
    const frame = await page.locator(".frame-image").getAttribute("src");
    const dressed = await page.locator(".dressed-image").getAttribute("src");
    if (!frame?.includes(`double-lowline-${finishId}-frame.png`) || !dressed?.includes(`double-lowline-${finishId}-dressed.png`)) {
      throw new Error(`${finish} did not load its matched Lowline images.`);
    }
  }
  await page.getByRole("button", { name: "Matte Black", exact: true }).click();
  await page.getByRole("button", { name: "Frame Only", exact: true }).click();
  if (await page.locator(".dressed-image").count()) throw new Error("Frame Only shows bedding.");
  await page.getByRole("button", { name: "Fully Dressed", exact: true }).click();
  if (!(await page.locator(".dressed-image").isVisible())) throw new Error("Dressed preview is missing.");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(100);
  await page.screenshot({ path: `qa/double-bed-${viewport.name}.png`, fullPage: viewport.width > 760 });
}
console.log("Double category design, five finishes, and both preview states passed.");
await browser.close();
