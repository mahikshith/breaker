// Playwright playtest: node tools/playtest/vault.mjs <outDir> [ios|android]. Set PW_CHROMIUM to a Chromium binary if needed.
import { chromium } from 'playwright';
const [SP, dev] = process.argv.slice(2);
const D = { ios: { w: 393, h: 852, safe: '59,34' }, android: { w: 412, h: 915, safe: '32,24' } }[dev];
const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
const page = await browser.newPage({ viewport: { width: D.w, height: D.h }, deviceScaleFactor: 2, hasTouch: true });
const errs = []; page.on('pageerror', e => errs.push(String(e.stack || e))); page.on('console', m => m.type() === 'error' && errs.push(m.text()));
await page.goto(`file://${process.cwd()}/dist/breach.html?safe=${D.safe}`); await page.waitForTimeout(1200);
const shot = n => page.screenshot({ path: `${SP}/shots/v-${dev}-${n}.png` });
const ev = f => page.evaluate(f);
const bot = () => ev(() => { clearInterval(window.__bot); window.__bot = setInterval(() => {
  const l = window.__breach.level; if (!l || l.state !== 'play') return;
  if (l.aim && l.aim.serve) { l.aim.angle = (Math.random() - 0.5) * 1.2; l.release(); }
  const bs = l.balls.filter(b => !b.caught && b.vy > 0).sort((a, b) => b.y - a.y), b = bs[0] || l.balls[0];
  if (b) { l.ptr.down = true; l.ptr.off = 0; l.ptr.x = b.x + Math.sin(l.t * 3) * 18; }
}, 16); });
const st = () => ev(() => { const l = window.__breach.level, s = l.snake; return { phase: l.phase, state: l.state, danger: +(l.danger||0).toFixed(2), head: s.cells[0], len: s.cells.length, stun: +s.stun.toFixed(2), score: l.score, debris: l.debris?.pieces.length, anim: l.pr?.anim }; });
await ev(() => window.__breach.start(1));
await page.waitForTimeout(500); await shot('1-intro-zoom');
await page.waitForTimeout(1300); await shot('2-intro-lair');
await page.waitForTimeout(1900); await shot('3-serve');
console.log('after intro', JSON.stringify(await st()));
await bot(); await page.waitForTimeout(8000); await shot('4-play');
console.log('play', JSON.stringify(await st()));
// ball on the snake head
await ev(() => { const l = window.__breach.level, p = l.snakePoints()[0]; const b = l.balls[0]; b.caught = false; l.aim = null; b.x = p.x; b.y = p.y + 30; b.vx = 0; b.vy = -400; });
await page.waitForTimeout(250); await shot('5-head-hit');
console.log('head hit', JSON.stringify(await st()));
// cage clang
await ev(() => { const l = window.__breach.level; const b = l.balls[0]; b.x = 20 + 16*9.5; b.y = 96 + 16*6 + 20; b.vx = 0; b.vy = -400; });
await page.waitForTimeout(200); await shot('6-cage-clang');
console.log('clang', JSON.stringify(await st()));
// collapse: clear a band below a block of bricks so it drops
await ev(() => { const l = window.__breach.level; for (const c of [1,2,3,4,5]) for (const r of [12]) { const br = l.brickAt(c, r); if (br) l.removeBrick(br, null); } l.collapseDirty = true; });
await page.waitForTimeout(500); await shot('7-collapse');
console.log('collapse', JSON.stringify(await st()));
// breach
await ev(() => { const l = window.__breach.level; for (let r = 6; r < 20; r++) { const br = l.brickAt(9, r); if (br && br.kind !== 9) l.removeBrick(br, null); } l.checkBreach(); });
await page.waitForTimeout(500); await shot('8-breach');
console.log('breach', JSON.stringify(await st()));
await page.waitForTimeout(1800); await shot('9-escape');
await page.waitForTimeout(2500); await shot('10-frenzy');
console.log('frenzy', JSON.stringify(await st()));
await page.waitForTimeout(7000); await shot('11-results');
console.log('end', JSON.stringify(await st()));
console.log('errors', errs.slice(0, 6));
await browser.close();
