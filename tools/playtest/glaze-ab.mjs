// Glaze v2 A/B: each brick chapter at the serve, old bricks (?glaze=v1) beside glaze v2.
// Usage: PW_MODULE=... node tools/playtest/glaze-ab.mjs <out> [html]
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
const { chromium } = await import(process.env.PW_MODULE || "playwright");
const [OUT = "out/glaze-ab", HTML = "dist/breach.html"] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const LEVELS = { vault: 1, frost: 4, lumi: 9, rivals: 10 };
const browser = await chromium.launch();
const errors = [];
for (const look of ["v1", "v2"]) {
  const page = await browser.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, hasTouch: true });
  page.on("pageerror", (e) => errors.push(`${look}: ${e.message}`));
  await page.goto(pathToFileURL(resolve(HTML)).href + `?safe=59,34${look === "v1" ? "&glaze=v1" : ""}`);
  await page.waitForFunction(() => window.__breach?.ready, null, { timeout: 60000, polling: 250 });
  await page.evaluate(() => document.fonts.ready);
  for (const [name, idx] of Object.entries(LEVELS)) {
    await page.evaluate((i) => __breach.start(i), idx);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT}/${name}-${look}.png` });
  }
  await page.close();
}
await browser.close();
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log("ok", OUT);
