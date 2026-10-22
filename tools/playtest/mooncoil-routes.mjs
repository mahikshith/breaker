// Earned Mooncoil browser-model routes; no staged HP, bricks, seals, lives or charge.
// Usage: node tools/playtest/mooncoil-routes.mjs [out] [html] [--all-modes|--modes=medium,hard] [--cosmic-first] [--no-core|--passive]
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const { chromium } = await import(process.env.PW_MODULE || 'playwright');
const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
const out = args[0] || 'out/mooncoil-routes', html = args[1] || 'out/mooncoil-preview/breach.html';
const modeArgument = process.argv.find(a => a.startsWith('--modes='));
const modes = modeArgument ? modeArgument.slice(8).split(',') : process.argv.includes('--all-modes') ? ['easy', 'medium', 'hard'] : ['easy'];
assert(modes.every(m => ['easy', 'medium', 'hard'].includes(m)));
const passive = process.argv.includes('--passive');
const useCore = !passive && !process.argv.includes('--no-core');
const cosmicFirst = process.argv.includes('--cosmic-first');
fs.mkdirSync(out, { recursive: true });
const sha = path => crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex');
const files = [html, 'src/mooncoil.js', 'src/mooncoil-layout.js', 'src/vault.js', 'src/arena.js', 'src/physics.js'];
const seal = () => Object.fromEntries(files.map(path => [path, sha(path)]));
const report = { scope: 'One fixed seed/policy per phone/mode. Actual embedded Main and live Mooncoil; geometry-reading model input assistance through pointerDown/Move/Up, release, power menu/choice and update. Natural cache powers allowed and observed. No HP/resource/life/seal/grid/position/progress writes or Continue; not touch-only human balance or physical-device performance.',
  before: seal(), useCore, policy: passive ? 'One straight serve; then no paddle input or casts' : cosmicFirst ? 'Cosmic then Crystals then Moonbind' : 'Danger Moonbind; otherwise Crystals then Cosmic', seed: 20261020, cases: [], complete: false };
const save = () => fs.writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 2) + '\n');
const browser = await chromium.launch({ args: ['--mute-audio'], ...(process.env.BROWSER_EXECUTABLE || process.env.PW_CHROMIUM ? { executablePath: process.env.BROWSER_EXECUTABLE || process.env.PW_CHROMIUM } : {}) });
try {
  for (const [device, width, height, safe] of [['ios', 393, 852, '59,34'], ['android', 412, 915, '32,24']]) for (const mode of modes) {
    const page = await browser.newPage({ viewport: { width, height }, hasTouch: true, deviceScaleFactor: 1 }), errors = [], http = [];
    page.on('pageerror', e => errors.push(e.stack || String(e))); page.on('response', r => { if (r.status() >= 400) http.push([r.status(), r.url()]); });
    await page.addInitScript(seed => { requestAnimationFrame = f => { window.__moonFrame = f; return 1; }; Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }; }, report.seed);
    const url = process.env.PLAYTEST_URL || pathToFileURL(resolve(html)).href;
    await page.goto(`${url}${url.includes('?') ? '&' : '?'}level=6&difficulty=${mode}&safe=${safe}`);
    await page.waitForFunction(() => window.__breach?.ready && window.__moonFrame, null, { polling: 50, timeout: 30000 });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(({ useCore, cosmicFirst, passive }) => {
      let clock = performance.now(), held = false;
      const l = __breach.level;
      const log = { firstBrick: null, firstCharge: null, firstCageHit: null, straightServe: null, tenSeconds: null, casts: [], drops: [], returns: 0, samples: [] };
      const apply = l.applyPower, paddle = l.onPaddle, remove = l.removeBrick;
      l.applyPower = function (kind) { log.drops.push({ time: this.t, kind }); return apply.call(this, kind); };
      l.onPaddle = function (ball) { log.returns++; return paddle.call(this, ball); };
      l.removeBrick = function (brick, ball) { if (ball && !brick.gone) log.firstBrick ??= this.t; return remove.call(this, brick, ball); };
      const fold = (x, lo, hi) => { const w = hi - lo, p = ((x - lo) % (w * 2) + w * 2) % (w * 2); return lo + (p > w ? w * 2 - p : p); };
      const target = () => ({ x: l.prisonX, y: l.floorY });
      const advance = frames => {
        for (let i = 0; i < frames && l.state === 'play'; i++) {
          if (l.phase === 'intro') { l.pointerDown(180, l.paddle.y + 25); l.pointerUp(); l.update(1 / 120); continue; }
          if (l.paddle.charge >= 1) log.firstCharge ??= l.t;
          if (l.cageHP < l.cageMax) log.firstCageHit ??= l.t;
          if (!log.tenSeconds && l.t >= 10) log.tenSeconds = { cageHP: l.cageHP, phase: l.phase, gateOpen: !!l.gateOpen, score: l.score };
          if (passive) {
            if (log.straightServe === null && l.aim) { l.pointerDown(180, l.paddle.y + 25); l.pointerUp(); log.straightServe = l.t; }
            l.update(1 / 120); continue;
          }
          if (useCore && l.canUseCorePower() && l.activateCorePower()) {
            const choice = cosmicFirst ? ['titan', 'ricochet', 'moonbind'].find(id => l.canChoosePower(id))
              : l.danger > .65 && l.canChoosePower('moonbind') ? 'moonbind' : l.canChoosePower('ricochet') ? 'ricochet' : l.canChoosePower('titan') ? 'titan' : 'moonbind';
            if (l.chooseSpacePower(choice)) log.casts.push({ time: l.t, choice }); else l.closePowerMenu();
            held = false;
          }
          const goal = target();
          if (l.aim) {
            const angle = Math.max(-.6, Math.min(.6, Math.atan2(goal.x - l.paddle.x, l.paddle.y - goal.y)));
            l.pointerDown(180, l.paddle.y + 25); l.pointerMove(180 + angle / .012, l.paddle.y + 25); l.update(1 / 120); l.pointerUp(); held = false; continue;
          }
          const b = l.balls.filter(b => !b.dead && !b.caught && b.vy > 0).sort((a, b) => (l.paddle.y - a.y) / a.vy - (l.paddle.y - b.y) / b.vy)[0];
          if (b) {
            const time = Math.max(0, (l.paddle.y - b.r - b.y) / b.vy), landing = fold(b.x + b.vx * time, l.left + b.r, l.right - b.r);
            const angle = Math.max(-.7, Math.min(.7, Math.atan2(goal.x - landing, l.paddle.y - goal.y)));
            const tx = Math.max(l.left + l.paddle.w / 2, Math.min(l.right - l.paddle.w / 2, landing - angle / (62 * Math.PI / 180) * l.paddle.w / 2));
            if (!held || !l.ptr.down) { l.pointerDown(180, l.paddle.y + 25); held = true; }
            l.pointerMove(l.ptr.anchor + (tx - l.ptr.padAnchor) / 1.15, l.paddle.y + 25);
          }
          l.update(1 / 120);
        }
      };
      const snapshot = () => ({ time: l.t, state: l.state, phase: l.phase, reason: l.reason || null, lives: l.lives, score: l.score,
        cageHP: l.cageHP, cageMax: l.cageMax, gateOpen: !!l.gateOpen,
        snake: { eaten: l.snake.eaten, cost: l.snake.cost, attack: l.snake.attack?.t },
        brickHP: l.bricks.reduce((n, b) => n + (b.gone ? 0 : b.hp), 0), charge: l.paddle.charge, balls: l.balls.length,
        finite: [...l.balls, ...l.crystals].every(b => Number.isFinite(b.x) && Number.isFinite(b.y)), ...log });
      const draw = () => { const update = l.update; l.update = () => {}; try { __moonFrame(clock += 1000 / 60); } finally { l.update = update; } };
      window.MQ = { advance, snapshot, draw }; draw();
    }, { useCore, cosmicFirst, passive });
    const capture = async name => { await page.evaluate(() => MQ.draw()); await page.screenshot({ path: `${out}/${device}-${mode}-${name}.png` }); };
    await capture('opening');
    let final, captured = false;
    for (let batch = 0; batch < 600; batch++) {
      await page.evaluate(() => MQ.advance(60)); final = await page.evaluate(() => MQ.snapshot());
      assert(final.finite);
      if (!captured && final.time > 18) { await capture('earned-combat'); captured = true; }
      if (final.state !== 'play') break;
    }
    await capture(`earned-${final.state}`);
    report.cases.push({ device, mode, ...final, errors, http }); save();
    console.log(device, mode, JSON.stringify(final)); assert.deepEqual(errors, []); assert.deepEqual(http, []);
    await page.close();
  }
  report.after = seal(); report.complete = true; save();
  assert.deepEqual(report.after, report.before, 'tested candidate changed during routes');
} finally { await browser.close(); }
