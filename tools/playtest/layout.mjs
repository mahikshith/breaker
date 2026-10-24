// Edge-to-edge layout check on phone sizes: menu, all six levels with WIDE, top/bottom insets.
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
  await page.addInitScript(() => localStorage.setItem('breach.tutDone', 'true'));   // the ball-control tutorial has its own checks
  await page.goto(`file://${process.cwd()}/dist/breach.html?safe=${D.safe}`);
  await page.waitForFunction(() => window.__breach?.ready); await page.waitForTimeout(100);
  await page.screenshot({ path: `${OUT}/layout-${dev}-menu.png` });                 // the home page
  await page.evaluate(() => window.__breach.home.open('chapters')); await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/layout-${dev}-chapters.png` });             // the chapter map, scrolled to the current chapter
  await page.evaluate(() => { window.__breach.home.scroll = 1e4; }); await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/layout-${dev}-chapters-end.png` });
  await page.evaluate(() => window.__breach.home.open('home'));
  for (const lv of [0, 1, 2, 3, 4, 5]) {
    // a chapter card start: the purpose card first, then the chapter itself
    await page.evaluate(lv => window.__breach.start(lv, { card: true }), lv);
    await page.waitForTimeout(400);
    if (await page.evaluate(() => !!window.__breach.purpose)) {
      await page.screenshot({ path: `${OUT}/layout-${dev}-purpose-${lv}.png` });
      await page.touchscreen.tap(D.w / 2, D.h / 2);
    }
    await page.evaluate(() => window.__breach.level.skipIntro?.());
    await page.waitForTimeout(500);
    await page.evaluate(() => { const l = window.__breach.level; l.applyPower('wide'); l.paddle.charge = 0.6; l.aim.angle = -0.3; l.release(); l.dropPower(l.W / 2 - 60, l.paddle.y - 140, 'shield'); });
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/layout-${dev}-${['carrier','vault','circuit','forge','frost','mooncoil'][lv]}.png` });
  }
  await page.close();
}
console.log('errors', errs.length ? errs : 'none');
await browser.close();

if (errs.length) throw new Error(errs.join("\n"));
