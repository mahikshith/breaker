// Edge-to-edge layout check on phone sizes: menu, both levels in play (with WIDE active), top/bottom insets.
// Usage: node tools/playtest/layout.mjs <outDir>. Env: PW_MODULE, PW_CHROMIUM (see polish.mjs).
import { mkdirSync } from 'node:fs';
const { chromium } = await import(process.env.PW_MODULE || 'playwright');
const OUT = process.argv[2] || 'shots'; mkdirSync(OUT, { recursive: true });
const DEVICES = { ios: { w: 393, h: 852, safe: '59,34' }, android: { w: 412, h: 915, safe: '32,24' } };
const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
const errs = [];
for (const [dev, D] of Object.entries(DEVICES)) {
  const page = await browser.newPage({ viewport: { width: D.w, height: D.h }, deviceScaleFactor: 2, hasTouch: true });
  page.on('pageerror', e => errs.push(dev + ': ' + (e.stack || e)));
  await page.goto(`file://${process.cwd()}/dist/breach.html?safe=${D.safe}`); await page.waitForTimeout(1500);
  for (const lv of [0, 1]) {
    await page.evaluate(lv => { window.__breach.start(lv); window.__breach.level.skipIntro?.(); }, lv);
    await page.waitForTimeout(500);
    await page.evaluate(() => { const l = window.__breach.level; l.applyPower('wide'); l.paddle.charge = 0.6; l.aim.angle = -0.3; l.release(); l.dropPower(l.W / 2 - 60, l.paddle.y - 140, 'shield'); });
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/layout-${dev}-${lv ? 'vault' : 'invasion'}.png` });
  }
  await page.close();
}
console.log('errors', errs.length ? errs : 'none');
await browser.close();
