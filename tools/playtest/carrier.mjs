// Actual bundled Carrier phone checks. Staged fixtures and input-assisted earned runs are reported separately.
// node tools/playtest/carrier.mjs <out> [html]; PW_MODULE/PW_CHROMIUM as in the other phone suites.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { overlapsTarget, sweepTarget } from '../../src/carrier-physics.js';
const { chromium } = await import(process.env.PW_MODULE || 'playwright');
const [OUT = 'out/carrier-qa', HTML = 'dist/breach.html'] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const hash = () => createHash('sha256').update(readFileSync(HTML)).digest('hex');
const report = { sha256: hash(), scope: 'Actual bundle at simulated phone sizes. Staged damage/power/lifecycle fixtures are separate from deterministic public-input assisted runs; neither proves human balance or physical-device performance.', devices: {} };
const browser = await chromium.launch({ ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}), args: ['--mute-audio'] });
try {
  for (const [name, D] of Object.entries({ ios: { width: 393, height: 852, top: 59, bottom: 34 }, android: { width: 412, height: 915, top: 32, bottom: 24 } })) {
    const page = await browser.newPage({ viewport: D, deviceScaleFactor: 2, hasTouch: true }), errors = [];
    page.on('pageerror', e => errors.push(e.stack || e.message));
    await page.addInitScript(() => { window.requestAnimationFrame = fn => { window.__nextFrame = fn; return 1; }; });
    await page.goto(`${pathToFileURL(resolve(HTML)).href}?safe=${D.top},${D.bottom}`);
    await page.waitForFunction(() => window.__breach && window.__nextFrame, null, { polling: 50 });
    await page.evaluate(async () => { await document.fonts.load('18px "Lilita One"'); await document.fonts.load('600 16px Rubik'); await document.fonts.ready; });
    await page.waitForTimeout(800);
    await page.evaluate(() => {
      let frameTime = performance.now();
      const seed = n => { Math.random = () => { n = (Math.imul(n, 1664525) + 1013904223) >>> 0; return n / 4294967296; }; };
      const fresh = (n = 20181018) => { seed(n); __breach.start(0); return __breach.level; };
      const advance = seconds => { const l = __breach.level; for (let i = 0; i < Math.round(seconds * 120); i++) l.update(1 / 120); };
      const draw = (frames = 1) => { const l = __breach.level, update = l.update; l.update = () => {}; for (let i = 0; i < frames; i++) __nextFrame(frameTime += 1000 / 60); l.update = update; };
      const state = () => { const l = __breach.level; return { ...l.inspect(), bricks: l.bricks.map(b => ({ id: b.id, hp: b.hp, payload: b.payload })), guns: l.guns.map(g => ({ id: g.id, hp: g.hp })), lives: l.lives, score: l.score, focus: l.focus, charge: l.paddle.charge }; };
      const publicAim = angle => { const l = __breach.level, a = l.aim; if (!a) return; l.pointerDown(l.paddle.x, l.H - 30); l.pointerMove(a.anchorX + (angle - (a.base || 0)) / .012, l.H - 30); l.update(1 / 120); l.pointerUp(); l.key(' ', false); };
      window.CT = { fresh, advance, draw, state, publicAim };
    });
    const ev = (f, arg) => page.evaluate(f, arg), shot = f => page.screenshot({ path: `${OUT}/${name}-${f}.png` });
    const initial = await ev(() => { const l = CT.fresh(); CT.draw(); return { ...CT.state(), name: l.name, W: l.W, H: l.H, scale: l.kitUIScale, baseRadius: l.ballRadius, paddleWidth: l.paddle.w, paddleHeight: l.paddle.h, reserve: (l.H - l.paddle.y) * l.kitUIScale, payloads: l.bricks.filter(b => b.payload).map(b => ({ id: b.id, payload: b.payload })), caught: l.balls[0].caught }; });
    assert.equal(initial.name, 'Carrier Breakout'); assert.equal(initial.hp, 36); assert.equal(initial.crew.length, 5); assert.equal(initial.bricks.length, 16);
    assert(initial.crew.every(c => c.hp === 2) && initial.guns.every(g => g.hp === 6)); assert(initial.caught);
    assert(Math.abs(initial.reserve - 126) < .6); assert.equal(initial.paddleWidth, 125); assert.equal(initial.baseRadius, 7.5);
    assert.deepEqual(initial.payloads.map(p => p.payload).sort(), ['laser', 'shield', 'split']);
    await shot('00-opening');
    const passive = await ev(() => { CT.advance(2); return CT.state(); });
    assert.equal(passive.clock, 0, 'initial caught serve does not start enemy combat');
    const aimStable = await ev(() => { const before = CT.state(); for (let i = 0; i < 6; i++) CT.draw(); return { before, after: CT.state() }; });
    assert.deepEqual(aimStable.after, aimStable.before, 'draw/aim does not damage or advance real targets');

    // Actual browser pointer input, not direct serve or paddle state writes.
    const y = D.height - D.bottom - 26;
    await page.mouse.move(D.width / 2, y); await page.mouse.down(); await page.mouse.move(D.width / 2 + 35, y);
    await ev(() => { CT.advance(.08); CT.draw(); });
    assert(await ev(() => __breach.level.aim?.angle > .1)); await shot('01-real-pointer-aim');
    await page.mouse.up(); await ev(() => CT.advance(.12));
    assert(await ev(() => !__breach.level.aim && __breach.level.balls.some(b => !b.caught && b.vy < 0)));
    await page.mouse.move(D.width / 2, y); await page.mouse.down(); await page.mouse.move(D.width / 2 - 60, y); await ev(() => CT.advance(.15));
    assert(await ev(() => __breach.level.paddle.x < 150)); await page.mouse.up();

    // Labelled display fixture: hold the served ball while the actual enemy clock runs.
    await ev(() => { const l = CT.fresh(); CT.publicAim(0); l.balls[0].caught = true; CT.advance(2.6); CT.draw(); });
    await shot('02-staged-hangar-launch');
    const visible = await ev(() => { const l = __breach.level; return { targets: l.targets(), hull: l.assembly.hull, bay: l.assembly.hangar, open: l.doorPose(), fighters: l.fighters.map(f => ({ id: f.id, ...l.fighterPose(f) })) }; });
    assert(visible.open > .99 && visible.fighters.filter(f => f.age >= 0 && f.age <= 3.4).length === 3);
    const hullTarget = visible.targets.find(t => t.id === 'carrier' && t.shapes.some(s => s.type === 'polygon'));
    assert(hullTarget && !overlapsTarget({ x: visible.bay.x, y: visible.bay.y, r: 3 }, hullTarget), 'packed hull leaves its actual bay aperture empty');
    assert(!visible.targets.some(t => t.id === 'carrier' && overlapsTarget({ x: visible.bay.x, y: visible.bay.y, r: 3 }, t)), 'fully retracted shutters leave the bay clear');
    const warning = await ev(() => { CT.advance(.75); CT.draw(); return { ...CT.state(), bolts: __breach.level.bolts.length }; });
    assert(warning.attack && !warning.attack.fired); await shot('03-staged-warning');
    const lock = warning.attack.targetX;
    await ev(() => { const l = __breach.level; l.pointerDown(90, l.H - 30); l.pointerMove(130, l.H - 30); CT.advance(.3); l.pointerUp(); });
    assert.equal(await ev(() => __breach.level.attack.targetX), lock, 'warned lane does not silently retarget');
    await ev(() => { CT.advance(.68); CT.draw(); }); await shot('04-staged-projectile');

    const combos = await ev(() => {
      const results = [];
      for (const kind of ['split', 'laser', 'shield']) {
        const l = CT.fresh(); CT.publicAim(.1); l.dropPower(l.paddle.x, l.paddle.y - 25, kind); CT.advance(.3);
        results.push({ kind, balls: l.balls.length, radii: l.balls.map(b => b.r), laser: l.paddle.laserT, shield: l.shield, drops: l.drops.length });
      }
      const l = CT.fresh(), b = l.balls[0]; l.aim = null; l.paddle.charge = 1;
      Object.assign(b, { caught: false, x: l.paddle.x, y: l.paddle.y - 30, vx: 0, vy: 300 }); CT.advance(.15);
      const titan = { radius: b.r, remaining: b.titan, charge: l.paddle.charge };
      b.titan = .001; b.caught = false; CT.advance(1 / 120);
      return { pickups: results, titan, expired: b.r };
    });
    assert.equal(combos.pickups[0].balls, 3); assert(combos.pickups[0].radii.every(r => r === 7.5));
    assert(combos.pickups[1].laser > 6 && combos.pickups[2].shield === 2);
    assert.equal(combos.titan.radius, 10); assert.equal(combos.titan.charge, 0); assert.equal(combos.expired, 7.5);
    const shield = await ev(() => {
      const cases = [];
      for (const r of [7.5, 10]) for (const speed of [345, 441.6]) {
        const l = CT.fresh(), b = l.balls[0]; l.aim = null; l.shield = 1; l.shieldT = 10;
        Object.assign(b, { caught: false, dead: false, x: l.left + 12, y: l.shieldY - r - speed / 240, vx: 0, vy: speed, r, titan: r === 10 ? 7 : 0 });
        CT.advance(.04); cases.push({ r, speed, dead: b.dead, vy: b.vy, shield: l.shield, lives: l.lives });
      }
      return cases;
    });
    assert(shield.every(s => !s.dead && s.vy < 0 && s.shield === 0 && s.lives === 3));
    const interception = await ev(() => {
      const l = CT.fresh(), b = l.balls[0]; l.aim = null;
      Object.assign(b, { caught: false, x: 180, y: 500, vx: 0, vy: -345 });
      l.bolts.push({ id: 'staged-bolt', x: 180, y: 470, vx: 0, vy: 215, r: 3.5, dead: false });
      CT.advance(.05); CT.draw(); return { bolts: l.bolts.length, score: l.score, dead: b.dead, vy: b.vy, stun: l.paddle.stun };
    });
    assert.equal(interception.bolts, 0); assert(interception.score >= 20 && !interception.dead && interception.vy < 0 && interception.stun === 0);
    await shot('05-staged-ball-interception');
    const cover = await ev(() => {
      const results = [];
      for (const kind of ['brick', 'housing']) {
        const l = CT.fresh(), c = kind === 'brick' ? l.bricks[0] : l.crew[0], r = c.art.rect;
        l.aim = null; l.balls[0].caught = true;
        l.bolts.push({ id: 'staged-cover', x: r.x + r.w / 2, y: r.y - 20, vx: 0, vy: 215, r: 3.5, dead: false });
        const hp = c.hp; CT.advance(.2); results.push({ kind, before: hp, after: c.hp, bolts: l.bolts.length, stun: l.paddle.stun });
      }
      const l = CT.fresh(); l.aim = null; l.balls[0].caught = true; l.shield = 2; l.shieldT = 10;
      l.bolts.push({ id: 'staged-stun', x: l.paddle.x + l.paddle.w * .38, y: l.paddle.y - 20, vx: 0, vy: 215, r: 3.5, dead: false });
      CT.advance(.12); return { results, shield: l.shield, stun: l.paddle.stun, bolts: l.bolts.length };
    });
    assert(cover.results.every(r => r.before === r.after && !r.bolts && !r.stun), 'opaque foreground absorbs shots without damage');
    assert(cover.shield === 2 && cover.stun > 0 && !cover.bolts, 'SHIELD retains its missed-ball-only rule');
    const disabled = await ev(() => {
      const results = [];
      for (const power of ['fire', 'titan']) {
        const l = CT.fresh(); for (let i = 0; i < 9; i++) l.hitTarget('carrier', { titan: 7 });
        const b = l.balls[0]; l.aim = null; l.hitStop = 0;
        Object.assign(b, { caught: false, x: 180, y: 250, vx: 0, vy: -1200, fire: power === 'fire', titan: power === 'titan' ? 7 : 0, r: power === 'titan' ? 10 : 7.5 });
        if (power === 'fire') l.fireT = 8;
        CT.advance(.04); results.push({ power, hp: l.carrier.hp, vy: b.vy, radius: b.r, solid: l.targets().some(t => t.id === 'disabled-carrier' && t.pierceable === false) });
      }
      CT.draw(); return results;
    });
    assert(disabled.every(r => r.hp === 0 && r.vy > 0 && r.solid), 'still-visible disabled hull blocks powered balls');
    await shot('05b-staged-disabled-solid');

    const lifecycle = await ev(() => {
      const l = CT.fresh(); l.hitTarget(l.bricks[0].id, {}); l.hitTarget(l.crew[0].id, {}); l.hitTarget('carrier', {});
      const progress = { hp: l.carrier.hp, bricks: l.bricks.map(b => b.hp), crew: l.crew.map(c => c.hp) };
      l.lives = 1; l.aim = null; Object.assign(l.balls[0], { caught: false, x: 20, y: l.drainY + 30, vx: 0, vy: 300 }); CT.advance(.03);
      const before = CT.state(); CT.advance(3); const after = CT.state(); CT.draw(110);
      return { progress, before, after };
    });
    assert.equal(lifecycle.before.state, 'lost'); assert.deepEqual(lifecycle.after, lifecycle.before, 'lost world cannot mutate under Continue');
    await shot('06-staged-loss-continue');
    const continueY = await ev(top => top + ((__breach.level.H - 34) / 2 + 19) * __breach.level.kitUIScale, D.top);
    await page.mouse.click(D.width / 2, continueY); await page.waitForFunction(() => __breach.level.state === 'play', null, { polling: 50, timeout: 6000 });
    const continued = await ev(() => { const l = __breach.level; CT.draw(); return { hp: l.carrier.hp, bricks: l.bricks.map(b => b.hp), crew: l.crew.map(c => c.hp), caught: l.balls.some(b => b.caught), bolts: l.bolts.length, attack: l.attack, grace: l.nextAttack - l.clock, shield: l.shield, shieldT: l.shieldT }; });
    assert.equal(continued.hp, lifecycle.progress.hp); assert.deepEqual(continued.bricks, lifecycle.progress.bricks); assert.deepEqual(continued.crew, lifecycle.progress.crew);
    assert(continued.caught && !continued.bolts && !continued.attack && continued.grace >= 2.99 && continued.shield === 2 && continued.shieldT === 10);
    await shot('07-actual-continue-resumed');
    const stagedWin = await ev(() => {
      const l = CT.fresh(); for (const c of l.crew) { l.hitTarget(c.id, {}); l.hitTarget(c.id, {}); } for (let i = 0; i < 9; i++) l.hitTarget('carrier', { titan: 7 });
      CT.advance(2.1); CT.draw(180); return { state: l.state, phase: l.phase, result: l.result(), escaped: l.inspect().crew.every(c => c.escaped) };
    });
    assert.equal(stagedWin.state, 'won'); assert(stagedWin.escaped); await shot('08-staged-goal-result');

    // No target/ball/HP/charge/life writes in these runs. Only public input methods + fixed updates.
    const earned = [];
    for (const seed of [20181018, 20181019, 20181020]) {
      const run = await ev(seed => {
        const l = CT.fresh(seed), actions = [], DT = 1 / 120;
        let returns = 0, casts = 0, lastVy = l.balls[0].vy, lastCharge = 0;
        const centre = o => ({ x: o.art.rect.x + o.art.rect.w / 2, y: o.art.rect.y + o.art.rect.h / 2 });
        const goal = () => {
          const cache = l.bricks.filter(b => b.hp > 0 && b.payload).sort((a, b) => ({ split: 0, laser: 1, shield: 2 }[a.payload] - { split: 0, laser: 1, shield: 2 }[b.payload]))[0];
          const c = l.crew.find(c => c.hp > 0); return cache ? centre(cache) : c ? centre(c) : { x: 180 + Math.sin(l.clock * .7) * 95, y: 170 };
        };
        const fold = (x, lo, hi) => { const w = hi - lo, z = ((x - lo) % (2 * w) + 2 * w) % (2 * w); return lo + (z > w ? 2 * w - z : z); };
        for (let frame = 0; frame < 120 * 240 && l.state === 'play'; frame++) {
          if (l.phase === 'escape') { l.update(DT); continue; }
          const g = goal(), p = l.paddle;
          if (l.aim) {
            const angle = Math.max(-1.1, Math.min(1.1, Math.atan2(g.x - l.aim.ball.x, l.aim.ball.y - g.y)));
            if (actions.length < 120) actions.push({ t: +l.t.toFixed(3), type: l.aim.serve ? 'serve' : 'earned-focus', angle: +angle.toFixed(4), target: g });
            CT.publicAim(angle);
          }
          const falling = l.balls.filter(b => !b.dead && !b.caught && b.vy > 0).map(b => ({ b, time: (p.y - b.r - b.y) / b.vy })).filter(q => q.time >= -.1).sort((a, b) => a.time - b.time)[0];
          let target = p.x;
          if (falling) {
            const b = falling.b, impact = fold(b.x + b.vx * Math.max(0, falling.time), l.left + b.r, l.right - b.r);
            const angle = Math.max(-1.05, Math.min(1.05, Math.atan2(g.x - impact, p.y - g.y)));
            target = impact - angle / (62 * Math.PI / 180) * p.w / 2;
          } else {
            const drop = l.drops.filter(d => !d.got).sort((a, b) => b.y - a.y)[0]; target = drop ? drop.x : p.laserT > 0 ? g.x : l.balls[0]?.x ?? p.x;
          }
          target = Math.max(l.left + p.w / 2, Math.min(l.right - p.w / 2, target));
          if (!l.ptr.down) l.pointerDown(p.x, l.H - 30);
          l.pointerMove(l.ptr.anchor + (target - l.ptr.padAnchor) / 1.15, l.H - 30);
          l.key(' ', true); l.update(DT);
          if (lastVy > 0 && l.balls[0]?.vy < 0) returns++;
          if (lastCharge >= 1 && p.charge === 0) casts++;
          lastVy = l.balls[0]?.vy || 0; lastCharge = p.charge;
          if (!l.balls.every(b => Number.isFinite(b.x + b.y + b.vx + b.vy))) throw Error('Nonfinite earned rally');
        }
        l.key(' ', false); l.pointerUp(); CT.draw(l.state === 'play' ? 1 : 180);
        return { seed, state: l.state, reason: l.reason || null, phase: l.phase, seconds: l.t, clock: l.clock, hp: l.carrier.hp, crew: l.inspect().crew, bricksBroken: l.bricksBroken, lives: l.lives, score: l.score, returns, titanReturns: casts, actions, result: l.state === 'won' ? l.result() : null };
      }, seed);
      earned.push(run); await shot(`earned-${seed}-${run.state}`);
      console.log(`${name} earned`, JSON.stringify({ seed, state: run.state, clock: run.clock, hp: run.hp, crew: run.crew.map(c => c.hp), lives: run.lives, broken: run.bricksBroken }));
      if (run.state === 'won') break;
    }
    assert.deepEqual(errors, []);
    report.devices[name] = { initial, passive: { clock: passive.clock }, input: 'actual browser pointer aim/release/drag passed', geometry: { openBay: true, visible }, staged: { warning, combos, shield, interception, cover, disabled, lifecycle, continued, stagedWin }, earned, hasEarnedWin: earned.some(r => r.state === 'won'), errors };
    writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2)); await page.close();
  }
  assert.equal(hash(), report.sha256, 'bundle changed during Carrier checks');
  report.sha256After = hash(); writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
} finally { await browser.close(); }
