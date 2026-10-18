// Playtest of the polish pass: deck + raised paddle, power-ups, titan core, princess pacing, serpent attack,
// continue screen, Invasion landing. Usage: node tools/playtest/polish.mjs <outDir> [ios|android]
// Env: PW_MODULE (path to playwright's index.mjs if not resolvable), PW_CHROMIUM (browser binary).
import { mkdirSync } from 'node:fs';
const { chromium } = await import(process.env.PW_MODULE || 'playwright');
const [OUT = 'shots', dev = 'ios'] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const D = { ios: { w: 393, h: 852, safe: '59,34' }, android: { w: 412, h: 915, safe: '32,24' } }[dev];
const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
const page = await browser.newPage({ viewport: { width: D.w, height: D.h }, deviceScaleFactor: 2, hasTouch: true });
const errs = []; page.on('pageerror', e => errs.push(String(e.stack || e))); page.on('console', m => m.type() === 'error' && errs.push(m.text()));
await page.goto(`file://${process.cwd()}/dist/breach.html?safe=${D.safe}`);
await page.waitForFunction(() => window.__breach?.ready); await page.waitForTimeout(100);
const shot = n => page.screenshot({ path: `${OUT}/${dev}-${n}.png` });
const ev = (f, a) => page.evaluate(f, a);
const wait = ms => page.waitForTimeout(ms);
// autopilot: keep the paddle under the lowest falling ball
const bot = on => ev(on => { clearInterval(window.__bot); if (!on) return; window.__bot = setInterval(() => {
  const l = window.__breach.level; if (!l || l.state !== 'play') return;
  if (l.aim && l.aim.serve) { l.aim.angle = (Math.random() - 0.5) * 1.2; l.release(); }
  const b = l.balls.filter(b => !b.caught && b.vy > 0).sort((a, b) => b.y - a.y)[0] || l.balls[0];
  if (b) { l.ptr.down = true; l.ptr.anchor = 0; l.ptr.padAnchor = b.x + Math.sin(l.t * 3) * 14; l.ptr.x = 0; }
}, 16); }, on);

await shot('00-menu');
// ---------- Vault ----------
await ev(() => window.__breach.start(1)); await wait(400);
await ev(() => window.__breach.level.skipIntro()); await wait(600);
await shot('01-vault-serve-deck');
await bot(true); await wait(5000);
await ev(() => { const l = window.__breach.level; l.paddle.charge = 1; l.applyPower('laser'); l.applyPower('shield'); });
await wait(700); await shot('02-vault-laser-shield-core');
// titan: drop a ball dead centre onto the charged core
await ev(() => { const l = window.__breach.level, p = l.paddle; l.paddle.charge = 1; const b = l.balls[0]; Object.assign(b, { caught: false, x: p.x, y: p.y - 40, vx: 0, vy: 300 }); l.aim = null; });
await wait(450); await shot('03-vault-titan');
await bot(false);
// fast-forward the serpent to show the princess getting nervous, then panicking, then the attack
const ff = target => ev(target => { const l = window.__breach.level; l.balls.forEach(b => { b.caught = true; }); for (let i = 0; i < 4000; i++) {
  l.updateSnake(0.05); const c = l.snake.cost ?? l.snakeStart; l.danger = Math.max(0, Math.min(1, 1 - c / l.snakeStart));
  if (target === 'attack' ? l.snake.attack : l.danger >= target) break; } l.balls.forEach(b => { b.caught = false; }); return [l.danger, !!l.snake.attack]; }, target);
console.log('nervous', await ff(0.4)); await wait(900); await shot('04-vault-nervous');
console.log('panic', await ff(0.7)); await wait(900); await shot('05-vault-panic');
console.log('attack', await ff('attack'));
await wait(500); await shot('06-vault-attack-rear');
await wait(500); await shot('07-vault-attack-strike1');
await wait(900); await shot('08-vault-attack-burst');
await wait(1600); await shot('09-vault-got-her');
await wait(2500); await shot('10-vault-continue');
console.log('state', await ev(() => [window.__breach.level.state, window.__breach.level.reason]));
// ---------- Invasion ----------
await ev(() => window.__breach.start(0)); await wait(800);
await shot('11-invasion-serve');
await bot(true); await wait(6000); await shot('12-invasion-play');
const carrier = await ev(() => {
  const l = window.__breach.level;
  if (l.name === 'Carrier Breakout') {
    // Staged real out-of-balls lifecycle; Carrier has no marching-grid landing.
    l.lives = 1; l.aim = null;
    for (const b of l.balls) Object.assign(b, { caught: false, x: l.left + 8, y: l.drainY + 30, vx: 0, vy: 300 });
    return true;
  }
  l.grid.oy = l.dangerY - 9 * 18 + 2; return false;
});
await wait(900); await shot(carrier ? '13-carrier-loss-staged' : '13-invasion-landed');
await wait(2600); await shot('14-invasion-continue');
await bot(false);
console.log('errors', errs.length ? errs : 'none');
await browser.close();

if (errs.length) throw new Error(errs.join("\n"));
