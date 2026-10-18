// Mixed Vault checks and phone captures. Usage: node tools/playtest/vault-v2.mjs <out> [html]
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PW_MODULE || 'playwright');
const [OUT = 'out/vault-v2', HTML = 'dist/breach.html'] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
const testedBuildSha256 = createHash('sha256').update(readFileSync(HTML)).digest('hex'), report = { testedBuildSha256 };
try {
  for (const [device, d] of Object.entries({ ios: { width: 393, height: 852, safe: '59,34' }, android: { width: 412, height: 915, safe: '32,24' } })) {
    const page = await browser.newPage({ viewport: d, deviceScaleFactor: 2, hasTouch: true });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(() => { window.requestAnimationFrame = fn => { window.__nextFrame = fn; return 1; }; });
    await page.goto(`${pathToFileURL(resolve(HTML)).href}?safe=${d.safe}`);
    await page.waitForTimeout(1700);
    await page.evaluate(async () => { await Promise.all([document.fonts.load('16px "Lilita One"'), document.fonts.load('600 16px Rubik')]); await document.fonts.ready; });
    await page.evaluate(() => {
      let clock = performance.now();
      const fresh = () => { window.__breach.start(1); const l = window.__breach.level; l.wardCoachSeen = true; l.skipIntro(); for (let i = 0; i < 240 && l.phase === 'intro'; i++) l.update(1 / 120); return l; };
      const draw = (frames = 1) => { const l = window.__breach.level, update = l.update; l.update = () => {}; for (let i = 0; i < frames; i++) window.__nextFrame(clock += 1000 / 60); l.update = update; };
      const advance = (l, seconds) => { for (let i = 0; i < Math.round(seconds * 120); i++) l.update(1 / 120); };
      const seed = n => { Math.random = () => { n = (Math.imul(n, 1664525) + 1013904223) >>> 0; return n / 4294967296; }; };
      const steer = (l, angle, phase) => {
        if (l.canUseKitPower?.() && l.useKitPower()) l.testWardCasts = (l.testWardCasts || 0) + 1;
        if (l.venom?.record && l.venom.record !== l.testLastVenom) { l.testLastVenom = l.venom.record; l.testVenomVolleys = (l.testVenomVolleys || 0) + 1; if (l.venom.record.guarded) l.testWardHeld = (l.testWardHeld || 0) + 1; }
        if (l.aim) { l.aim.angle = angle; l.release(); }
        const b = l.balls.filter(b => !b.caught && b.vy > 0).sort((a, b) => b.y - a.y)[0] || l.balls[0];
        if (b) { l.ptr.down = true; l.ptr.anchor = 0; l.ptr.x = 0; l.ptr.padAnchor = b.x + Math.sin(l.t * 2.7 + phase) * 11; l.ptr.stillT = 0; }
      };
      window.__vaultTest = { fresh, draw, advance, seed, steer };
    });
    const ev = (fn, arg) => page.evaluate(fn, arg);
    const shot = name => page.screenshot({ path: `${OUT}/${device}-${name}.png` });
    await ev(() => { window.__breach.start(1); const T = window.__vaultTest, l = window.__breach.level; T.advance(l, 2.1); T.draw(); });
    await shot('00-intro-jade');
    const initial = await ev(() => {
      const T = window.__vaultTest, l = T.fresh(); l.checkBreach(); const before = l.bricks.filter(b => b.gone).length; l.collapse();
      const plan = l.snakePlan(); T.draw();
      return { phase: l.phase, initialCollapse: l.bricks.filter(b => b.gone).length - before, bricks: l.bricks.length, gems: l.bricks.filter(b => b.kind === 5).length,
        normalHP: l.bricks.reduce((n, b) => n + b.hp, 0), snakeLength: l.snake.cells.length, snakeCost: plan.cost, snakeSteps: plan.path.length,
        snakePath: plan.path.map(k => [k % 20, Math.floor(k / 20)]), solidKinds: l.grid.unpierceable, paddleY: l.paddle.y, deckY: l.deckY };
    });
    assert.equal(initial.phase, 'rescue'); assert.equal(initial.initialCollapse, 0); assert.equal(initial.snakeLength, 12);
    assert(initial.bricks > 200 && initial.gems >= 18 && initial.snakeSteps >= 30 && Number.isFinite(initial.snakeCost));
    assert.deepEqual(initial.solidKinds, [9, 8]);
    await shot('01-opening');
    const caches = [];
    for (const [name, c, r, power] of [['left', 2, 8, 'split'], ['right', 16, 10, 'fire']]) {
      const result = await ev(({ c, r }) => {
        const T = window.__vaultTest, l = T.fresh(), br = l.brickAt(c, r); l.t++; l.hitCell(c, r, { x: br.x + 8, y: br.y + 16, vx: 0, vy: -345, r: 6 });
        const before = l.bricks.filter(b => b.gone).length, drop = l.drops[0]?.kind; l.collapse(); const fallen = l.bricks.filter(b => b.gone).length - before;
        T.advance(l, 0.35); T.draw(); return { fallen, drop };
      }, { c, r });
      assert(result.fallen >= 6); assert.equal(result.drop, power); caches.push({ name, ...result }); await shot(`02-${name}-collapse`);
    }
    const combos = [];
    for (const mode of ['fire', 'titan']) {
      const result = await ev(mode => {
        const T = window.__vaultTest, l = T.fresh(), b = l.balls[0]; l.aim = null;
        l.applyPower('wide'); l.applyPower('shield'); l.applyPower('slow');
        if (mode === 'fire') l.applyPower('fire'); else { b.titan = 7; b.r = 10; }
        Object.assign(b, { caught: false, x: 92, y: 244, vx: 0, vy: -600 });
        T.advance(l, 0.14); T.draw(); return { vy: b.vy, granite: l.grid.cells[7 * 20 + 4], shield: l.shield, finite: Number.isFinite(b.y) };
      }, mode);
      assert(result.vy > 0 && result.granite === 9 && result.shield > 0 && result.finite); combos.push({ mode, ...result }); await shot(`03-${mode}-shield-slow-wide`);
    }
    const rallies = []; let capturedWin = false;
    for (const [run, angle] of [-0.5, 0.18, 0.5].entries()) {
      await ev(({ run }) => { const T = window.__vaultTest; T.seed(20181018 + run); const l = T.fresh(); l.coach = l.coreCoach = 9; l.testReturns = 0; const original = l.onPaddle.bind(l); l.onPaddle = b => { l.testReturns++; original(b); }; }, { run });
      await ev(({ angle, run }) => { const T = window.__vaultTest, l = window.__breach.level; for (let i = 0; i < 960 && l.state === 'play'; i++) { T.steer(l, angle, run); l.update(1 / 120); } T.draw(); }, { angle, run });
      if (run === 0) await shot('04-rally-8s');
      const result = await ev(({ angle, run }) => {
        const T = window.__vaultTest, l = window.__breach.level;
        for (let i = 960; i < 18000 && l.state === 'play'; i++) { T.steer(l, angle, run); l.update(1 / 120); }
        T.draw(l.state === 'play' ? 1 : 150);
        return { angle, seconds: l.t, returns: l.testReturns, broken: l.bricksBroken, score: l.score, lives: l.lives, state: l.state, phase: l.phase, reason: l.reason || null,
          stars: l.state === 'won' ? l.result().stars : null, wardCasts: l.testWardCasts || 0, wardHeld: l.testWardHeld || 0, venomVolleys: l.testVenomVolleys || 0, finite: l.balls.every(b => Number.isFinite(b.x) && Number.isFinite(b.y)) };
      }, { angle, run });
      assert(result.finite); rallies.push(result);
      if (result.state === 'won' && !capturedWin) { await shot('05-earned-win'); capturedWin = true; }
      if (result.state === 'lost') await shot(`06-rally-${run}-loss`);
    }
    const idle = await ev(() => {
      const T = window.__vaultTest, l = T.fresh(); let attackAt = null;
      for (let i = 0; i < 24000 && l.state === 'play'; i++) { l.update(1 / 120); if (attackAt === null && l.snake.attack) attackAt = l.t; }
      T.draw(150); return { attackAt, lossAt: l.t, state: l.state, reason: l.reason, phase: l.phase };
    });
    assert.equal(idle.state, 'lost'); assert.equal(idle.reason, 'The serpent got the princess'); await shot('07-serpent-loss-continue');
    assert.deepEqual(errors, []); report[device] = { initial, caches, combos, rallies, hasEarnedWin: capturedWin, idle, errors }; await page.close();
    console.log(device, JSON.stringify(report[device]));
  }
  assert.equal(createHash('sha256').update(readFileSync(HTML)).digest('hex'), testedBuildSha256);
  writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
} finally { await browser.close(); }
