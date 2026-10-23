// Review shots of Gatehouse Siege from the built game (dist/breach.html) on an iPhone-sized touch viewport, saved as JPEGs.
//   PW_MODULE=/path/to/playwright/index.mjs node tools/playtest/gatehouse-siege-shots.mjs <out dir> [html]
// Staged with the model's own calls (skip the card, step the sim, hit Korr to a cap); nothing is drawn by hand.
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(process.env.PW_MODULE || 'playwright');
const [OUT = 'out/gatehouse-siege', HTML = 'dist/breach.html'] = process.argv.slice(2);
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
    const begin = stage => { __breach.start(8); const l = level(); l.drawCoach = () => {}; if (stage) l.m.buildFloor(stage); draw(); return l.m; };
    // A paddle that follows the ball and serves, so stages play on naturally between staged beats.
    const play = (s, until, off = 14) => { const l = level(); for (let i = 0; i < Math.round(s * 120); i++) { const m = l.m; m.lives = 3; if (m.phase === 'card') m.skipCard(); if (m.phase === 'serve' && m.balls.some(b => b.caught)) m.launch(-Math.PI / 2 + .35); const b = m.balls.filter(b => !b.caught && !b.dead).sort((a, c) => c.y - a.y)[0]; if (b) m.setTarget(b.x + off); l.update(1 / 120); if (until?.(m)) break; } draw(); };
    window.SH = { draw, step, begin, play, model, level };
  });
  const snap = async (name, what, clip) => { await page.evaluate(what); await page.screenshot({ path: `${OUT}/${name}.jpg`, type: 'jpeg', quality: 82, ...(clip ? { clip } : {}) }); shots.push(name); };
  await snap('01-stage-card', () => { SH.begin(0); SH.step(.45); });
  await snap('02-hook-korr-cranks-lumi', () => { const m = SH.begin(0); m.skipCard(); SH.step(2.0); });
  await snap('03-stage1-opening-hoist', () => { const m = SH.begin(0); m.skipCard(); SH.step(4.6); m.launch(-Math.PI / 2 + .3); SH.play(1.5); });
  await snap('04-pip-track', () => { const m = SH.begin(2); m.skipCard(); SH.step(.8); }, { x: 80, y: 30, width: 233, height: 92 });
  await snap('05-stage2-opening-drawbridge', () => { const m = SH.model(); m.hairpin = true; m.buildFloor(1); m.skipCard(); SH.play(1.2); });
  await snap('06-steel-chamber-chest', () => { const m = SH.begin(1); m.skipCard(); SH.play(1.5); }, { x: 0, y: 330, width: 393, height: 260 });
  await snap('07-stage2-knockdown-escape', () => { const m = SH.begin(1); m.skipCard(); SH.play(3); for (const h of m.housings) m.hitHousing(h, 99); SH.step(.9); });
  await snap('08-stage3-opening-murder-holes', () => { const m = SH.model(); m.rackSmashed = true; m.buildFloor(2); m.skipCard(); SH.play(2.5); });
  await snap('09-stage3-korr-escape', () => { const m = SH.model(); for (let i = 0; i < 40 && !m.villain.escape; i++) m.hitSlot(null); SH.step(.9); });
  await snap('10-stage4-opening-inner-gate', () => { const m = SH.model(); m.knockdowns = 2; m.ventJammed = true; m.rackSmashed = true; m.buildFloor(3); m.skipCard(); SH.step(.5); SH.play(1.5); });
  await snap('11-stage4-dais-payoffs', () => { SH.play(1); }, { x: 0, y: 120, width: 393, height: 330 });
  await snap('12-powers-and-tip', () => { const m = SH.model(); m.dropPower(m.paddle.x + 30, m.paddle.y - 120, 'titan'); m.applyPower('wide'); m.applyPower('laser'); SH.play(.8); });
  await snap('13-hoist-jammed-stage-clear', () => { const m = SH.begin(0); m.skipCard(); SH.step(4.6); m.launch(); SH.play(4); for (const b of m.bricks) while (b.hp > 0) m.hitBrick(b, null); SH.step(.5); });
  if (errors.length) throw Error(errors.join('\n'));
  console.log(shots.join('\n'));
} finally { await browser.close(); }
