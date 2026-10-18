// Playwright playtest: node tools/playtest/l1.mjs <outDir> [ios|android]. Set PW_CHROMIUM to a Chromium binary if needed.
import { chromium } from 'playwright';
const SP = process.argv[2];
const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
const page = await browser.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, hasTouch: true });
const errs = []; page.on('pageerror', e => errs.push(String(e.stack || e)));
await page.goto(`file://${process.cwd()}/dist/breach.html?safe=59,34`); await page.waitForTimeout(1200);
await page.screenshot({ path: `${SP}/shots/l1-0-menu.png` });
const ev = f => page.evaluate(f);
await ev(() => window.__breach.start(0)); await page.waitForTimeout(600);
await page.screenshot({ path: `${SP}/shots/l1-1-serve.png` });
await ev(() => { clearInterval(window.__bot); window.__bot = setInterval(() => {
  const l = window.__breach.level; if (!l || l.state !== 'play') return;
  if (l.aim && l.aim.serve) { l.aim.angle = (Math.random() - 0.5) * 1.2; l.release(); }
  const bs = l.balls.filter(b => !b.caught && b.vy > 0).sort((a, b) => b.y - a.y), b = bs[0] || l.balls[0];
  if (b) { l.ptr.down = true; l.ptr.off = 0; l.ptr.x = b.x + Math.sin(l.t * 3) * 18; }
}, 16); });
await page.waitForTimeout(8000); await page.screenshot({ path: `${SP}/shots/l1-2-play.png` });
await ev(() => { const l = window.__breach.level; l.grid.cells.fill(0); l.startBoss(); }); await page.waitForTimeout(3000);
await page.screenshot({ path: `${SP}/shots/l1-3-boss.png` });
console.log('errors', errs);
await browser.close();
