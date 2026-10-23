// Review shots of Tidewheel Siege from the built game (dist/breach.html) on an iPhone-sized touch viewport.
//   PW_MODULE=/path/to/playwright/index.mjs node tools/playtest/tidewheel-siege-shots.mjs <out dir> [html]
// Staged with the model's own calls (skip the card, step the sim, strike Nerra to a cap); nothing is drawn by hand.
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(process.env.PW_MODULE || 'playwright');
const [OUT = 'out/tidewheel-siege', HTML = 'dist/breach.html'] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
const shots = [];
try {
  const page = await browser.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, hasTouch: true }), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => { window.requestAnimationFrame = fn => { window.__nextFrame = fn; return 1; }; });
  await page.goto(pathToFileURL(resolve(HTML)).href + '?safe=59,34&difficulty=medium');
  await page.waitForFunction(() => window.__breach?.ready, null, { timeout: 120000, polling: 100 }).catch(e => { throw Error(e.message + '\n' + errors.join('\n')); });
  await page.evaluate(async () => {
    await document.fonts.ready;
    let clock = performance.now();
    const draw = () => { const l = __breach.level, u = l.update; l.update = () => {}; __nextFrame(clock += 1e3 / 60); l.update = u; };
    const level = () => __breach.level, model = () => __breach.level.m;
    const step = (s, each) => { const l = level(); for (let i = 0; i < Math.round(s * 120); i++) { l.update(1 / 120); if (each?.(l.m)) break; } draw(); };
    const begin = stage => { __breach.start(7); const l = level(); l.drawCoach = () => {}; if (stage) l.m.buildStage(stage); draw(); return l.m; };
    // A paddle that follows the ball and serves, so stages play on naturally between staged beats.
    const play = (s, until) => { const l = level(); for (let i = 0; i < Math.round(s * 120); i++) { const m = l.m; if ((m.phase === 'serve' || m.phase === 'hook') && m.balls.some(b => b.caught)) m.launch(-Math.PI / 2 + .35); const b = m.balls.find(b => !b.caught && !b.dead); if (b) m.setTarget(b.x + 18); l.update(1 / 120); if (until?.(m)) break; } draw(); };
    const strike = n => { const m = model(), v = m.villain; for (let i = 0; i < n && !m.pool.down; i++) { v.ghost = false; v.hidden = false; m.cine = null; m.balls[0].spent = false; m.hitNerra({ kind: 'shell', id: 'shell' }, m.balls[0]); } };
    window.SH = { draw, step, begin, play, strike, model, level };
  });
  const snap = async (name, what, clip) => { await page.evaluate(what); const path = `${OUT}/${name}.png`; await page.screenshot({ path, ...(clip ? { clip } : {}) }); shots.push(name); };
  await snap('01-stage-card', () => { SH.begin(0); SH.step(.5); });
  await snap('02-pip-track', () => { const m = SH.begin(2); m.stagesCleared = 2; m.skipCard(); SH.step(1.2); }, { x: 96, y: 54, width: 200, height: 44 });
  await snap('03-hook-chain-snap', () => { const m = SH.begin(0); m.skipCard(); SH.step(3.5, m => m.effects.some(e => e.kind === 'chain-snap' && e.age > .12)); });
  await snap('04-hook-dive', () => { const m = SH.begin(0); m.skipCard(); SH.step(7, m => m.cine?.beats?.[m.cine.i]?.pose === 'jump' && m.cine.t > .3); });
  await snap('05-stage1-opening', () => { const m = SH.begin(0); m.skipCard(); SH.step(6.2); });
  await snap('06-stage2-opening', () => { const m = SH.begin(1); m.skipCard(); SH.step(.4); });
  await snap('07-stage2-peek', () => { const m = SH.begin(1); m.skipCard(); SH.play(20, m => m.peek?.state === 'aim' && m.peek.t > .5); });
  await snap('08-stage3-opening', () => { const m = SH.begin(2); m.skipCard(); SH.step(2); });
  await snap('09-steel-chamber-gap', () => { const m = SH.begin(2); m.skipCard(); SH.step(2); for (const s of m.spokes) { s.pose = 1; s.shown = 1; s.next = Infinity; s.tell = 0; } m.spokes[1].pose = m.spokes[1].shown = 0; m.spokes[1].tell = .9; SH.draw(); }, { x: 0, y: 380, width: 393, height: 200 });
  await snap('10-escape-leap', () => { const m = SH.begin(2); m.skipCard(); SH.play(2.5); SH.strike(80); SH.step(1.25); });
  await snap('11-stage4-opening', () => { const m = SH.begin(3); m.skipCard(); SH.step(2); });
  await snap('12-stage4-cage-close', () => { const m = SH.begin(3); m.skipCard(); SH.step(2); m.rafts[0].steel[1].cracked = true; SH.draw(); }, { x: 20, y: 300, width: 360, height: 180 });
  await snap('13-stage-clear-banner', () => { const m = SH.begin(0); m.skipCard(); SH.step(6.2); for (const b of m.blocks) if (b.prize) m.hitBlock(b, m.balls[0]); for (const b of [...m.blocks, ...m.bricks]) if (b.hp > 0 && !b.prize) { b.hp = 1; b.raft === undefined ? m.hitBlock(b, m.balls[0]) : m.hitRaftBrick(b, m.balls[0]); } SH.step(.3); });
  await snap('14-mine-blast', () => { const m = SH.begin(0); m.skipCard(); SH.step(6.2); const mine = m.blocks.find(b => b.type === 'mine'); m.hitBlock(mine, m.balls[0]); SH.step(.2); });
  await snap('15-flood-danger', () => { const m = SH.begin(1); m.skipCard(); SH.play(3); m.water.target = m.water.y = m.water.limit + (m.water.initial - m.water.limit) * .22; SH.play(.6); });
  await snap('16-stage3-dome-plate-fire', () => { const m = SH.begin(2); m.skipCard(); SH.play(2); m.timers.fire = 6; for (const b of m.blocks.filter(b => b.regrow).slice(0, 3)) { b.hp = 0; b.downAt = m.time; } SH.step(.05); }, { x: 0, y: 150, width: 393, height: 290 });
  await snap('17-barnacle-regrow', () => { const m = SH.begin(3); m.skipCard(); SH.step(2); const plug = m.blocks.find(b => b.regrow); m.effects.push({ kind: 'barnacle-grow', x: plug.x + plug.w / 2, y: plug.y + plug.h / 2, w: plug.w, h: plug.h, age: .25, life: .6 }); SH.draw(); }, { x: 0, y: 200, width: 393, height: 260 });
  await snap('18-special-bricks', () => { const m = SH.begin(1); m.skipCard(); SH.step(.4); for (const b of m.blocks.filter(b => b.maxHP > 1).slice(0, 2)) b.hp = 1; SH.draw(); }, { x: 0, y: 120, width: 393, height: 330 });
  if (errors.length) throw Error(errors.join('\n'));
  console.log(shots.join('\n'));
} finally { await browser.close(); }
