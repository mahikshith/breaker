// Native Vault/Kit integration checks. Usage: node tools/playtest/venom.mjs <out> [html]
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PW_MODULE || 'playwright');
const [OUT = 'out/venom-final', HTML = 'dist/breach.html'] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const hash = () => createHash('sha256').update(readFileSync(HTML)).digest('hex'), report = { testedBuildSha256: hash(), devices: {} };
const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
try {
  for (const [device, d] of Object.entries({ ios: { width: 393, height: 852, safe: '59,34' }, android: { width: 412, height: 915, safe: '32,24' } })) {
    const page = await browser.newPage({ viewport: d, deviceScaleFactor: 2, hasTouch: true }), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(() => { window.requestAnimationFrame = fn => { window.__nextFrame = fn; return 1; }; });
    await page.goto(`${pathToFileURL(resolve(HTML)).href}?safe=${d.safe}`); await page.waitForTimeout(1700);
    await page.evaluate(async () => { await Promise.all([document.fonts.load('16px "Lilita One"'), document.fonts.load('600 16px Rubik')]); await document.fonts.ready; });
    await page.evaluate(() => {
      let clock = performance.now();
      const draw = () => { const l = window.__breach.level, update = l.update; l.update = () => {}; window.__nextFrame(clock += 1000 / 60); l.update = update; };
      const advance = (l, seconds) => { for (let i = 0; i < Math.round(seconds * 120); i++) l.update(1 / 120); draw(); };
      const fresh = () => { window.__breach.start(1); return window.__breach.level; };
      const settled = () => { const l = fresh(); l.wardCoachSeen = true; l.skipIntro(); for (let i = 0; i < 240 && l.phase === 'intro'; i++) l.update(1 / 120); return l; };
      const hit = (l, body = false, fire = false) => {
        const b = l.balls[0], pts = l.snakePoints(), p = body ? pts.find((p, i) => i > 0 && p.y >= 96) : pts[0];
        l.aim = null; Object.assign(b, { caught: false, x: p.x + (body ? 9 : 0), y: p.y - (body ? 0 : 16), vx: body ? -220 : 0, vy: body ? 0 : 220, fire }); l.ballVsSnake();
        Object.assign(b, { caught: true, x: l.paddle.x, y: l.paddle.y - 7 }); l.ballVsSnake(); l.aim = { ball: b, angle: 0, serve: true, t: 0, anchorX: l.ptr.x };
      };
      const prepare = empty => { const l = settled(); advance(l, 8); l.paddle.charge = empty ? 0 : 1; draw(); hit(l); advance(l, 1); hit(l); const stun = l.snake.stun; let ticks = 0; while (l.venom.phase === 'queued' && ticks++ < 1800) l.update(1 / 120); advance(l, 0.4); return { stun, queuedSeconds: ticks / 120 }; };
      window.__venomTest = { draw, advance, fresh, settled, hit, prepare };
    });
    const shot = name => page.screenshot({ path: `${OUT}/${device}-${name}.png` });
    const opening = await page.evaluate(() => { const T = window.__venomTest, l = T.fresh(); T.advance(l, 2.2); return { phase: l.phase, hits: l.venom.contacts.hits, fury: l.venom.phase }; });
    assert.equal(opening.hits, 0); assert.equal(opening.fury, 'idle'); await shot('00-top-entry');
    const contacts = await page.evaluate(() => {
      const T = window.__venomTest, l = T.settled(), b = l.balls[0], hidden = l.snakePoints().find(p => p.y < 96);
      Object.assign(b, { caught: false, x: hidden.x, y: hidden.y - 9, vx: 0, vy: 200 }); l.ballVsSnake(); const hiddenHits = l.venom.contacts.hits;
      Object.assign(b, { caught: true }); l.ballVsSnake(); T.hit(l, true); const first = l.venom.contacts.hits; T.advance(l, 0.5); T.hit(l, true);
      const body = { first, second: l.venom.contacts.hits, stun: l.snake.stun, flinch: l.snake.flinch };
      const powered = T.settled(); T.advance(powered, 2); T.hit(powered, false, true); const fireStun = powered.snake.stun;
      powered.knockBack(99); return { hiddenHits, body, fireStun, recoilHead: powered.snake.cells[0], recoilCost: powered.snakePlan().cost };
    });
    assert.equal(contacts.hiddenHits, 0); assert.equal(contacts.body.first, 1); assert.equal(contacts.body.second, 2); assert.equal(contacts.body.stun, 0); assert(contacts.body.flinch > 0); assert(contacts.fireStun >= 5); assert(contacts.recoilHead[1] >= 0 && Number.isFinite(contacts.recoilCost));
    const cases = {};
    for (const mode of ['ward', 'empty', 'missed', 'late', 'drag']) {
      const setup = await page.evaluate(mode => window.__venomTest.prepare(mode === 'empty'), mode); assert(setup.stun >= 3 && setup.queuedSeconds >= 3); await shot(`${mode}-01-warning`);
      const orb = await page.evaluate(safe => { const l = window.__breach.level, a = l.kitAnchor(), scale = l.kitUIScale; return { x: a.x * scale, y: safe + (a.y - 34) * scale, r: a.r * scale }; }, Number(d.safe.split(',')[0])); assert(Math.abs(orb.r * 2 - 52) < 0.01);
      if (mode === 'ward' || mode === 'empty') { await page.mouse.click(orb.x, orb.y); await page.mouse.click(orb.x, orb.y); }
      if (mode === 'late') { await page.evaluate(() => window.__venomTest.advance(window.__breach.level, 0.875)); await page.mouse.click(orb.x, orb.y); }
      if (mode === 'drag') {
        await page.mouse.move(orb.x - 70, orb.y); await page.mouse.down(); await page.mouse.move(orb.x, orb.y, { steps: 6 }); await page.mouse.up();
        await page.mouse.move(orb.x, orb.y); await page.mouse.down(); await page.mouse.move(orb.x + 20, orb.y + 3, { steps: 5 }); await page.mouse.up();
        await page.evaluate(() => { const l = window.__breach.level, b = l.balls[0]; Object.assign(b, { caught: true, x: l.paddle.x, y: l.paddle.y - 7 }); l.ptr.down = false; l.aim = { ball: b, angle: 0, serve: true, t: 0, anchorX: l.ptr.x }; });
      }
      const afterTap = await page.evaluate(() => { const l = window.__breach.level; return { charge: l.paddle.charge, ward: !!l.venom.ward, castAt: Number.isFinite(l.kitCastAt) ? l.kitCastAt : null }; });
      assert.equal(afterTap.ward, mode === 'ward'); assert.equal(afterTap.charge, mode === 'ward' || mode === 'empty' ? 0 : 1);
      await page.evaluate(() => { const T = window.__venomTest, l = window.__breach.level; let ticks = 0; while (l.venom.phase === 'warn' && ticks++ < 600) T.advance(l, 1 / 120); T.advance(l, 0.2); }); await shot(`${mode}-02-spray`);
      await page.evaluate(() => window.__venomTest.advance(window.__breach.level, 0.175)); await shot(`${mode}-03-impact`);
      const measured = await page.evaluate(() => { const l = window.__breach.level, q = l.venom.target; return { ...l.venom.record, bars: [...l.grid.cells].filter(v => v === 8).length, targetGone: !!q.br.gone, phase: l.phase, result: l.kitWardResult, frame: l.bricks.filter(b => b.kind === 9 && ((b.r === 2 && b.c >= 6 && b.c <= 13) || (b.r >= 3 && b.r <= 5 && (b.c === 6 || b.c === 13)))).every(b => !b.gone) }; });
      assert.equal(measured.directlyMelted, mode === 'ward' ? 0 : 1); assert.equal(measured.guarded, mode === 'ward'); assert.equal(measured.bars, 18); assert.equal(measured.frame, true); assert.equal(measured.phase, 'rescue'); assert.equal(measured.extraCollapse, 0);
      if (mode === 'ward') assert.equal(measured.before.cost, measured.after.cost); else assert(measured.after.cost < measured.before.cost);
      await page.evaluate(() => window.__venomTest.advance(window.__breach.level, 0.5)); await shot(`${mode}-04-recovery`); cases[mode] = { setup, orb, afterTap, measured };
    }
    const terminal = await page.evaluate(() => {
      const T = window.__venomTest; T.prepare(true); const l = window.__breach.level, before = { timer: l.venom.t, cells: JSON.stringify(l.snake.cells), grid: [...l.grid.cells], gone: !!l.venom.target.br.gone };
      l.fail('Out of balls'); T.advance(l, 3);
      return { before, after: { timer: l.venom.t, cells: JSON.stringify(l.snake.cells), grid: [...l.grid.cells], gone: !!l.venom.target.br.gone }, state: l.state, record: l.venom.record };
    }); assert.deepEqual(terminal.after, terminal.before); assert.equal(terminal.state, 'lost'); assert.equal(terminal.record, null);
    for (const kind of ['pointer', 'space']) {
      await page.evaluate(() => { window.__venomTest.fresh(); window.__venomTest.draw(); });
      if (kind === 'pointer') { await page.mouse.move(d.width * 0.6, d.height * 0.8); await page.mouse.down(); }
      else await page.keyboard.down('Space');
      await page.evaluate(() => window.__venomTest.advance(window.__breach.level, 0.25));
      if (kind === 'pointer') await page.mouse.up(); else await page.keyboard.up('Space');
      const skip = await page.evaluate(() => { const l = window.__breach.level; return { phase: l.phase, caught: l.balls[0].caught, serve: !!l.aim?.serve, hits: l.venom.contacts.hits }; });
      assert.equal(skip.phase, 'rescue'); assert.equal(skip.caught, true); assert.equal(skip.serve, true); assert.equal(skip.hits, 0);
    }
    const coachSetup = await page.evaluate(() => {
      localStorage.setItem('breach.wardCoachAck', 'false');
      const T = window.__venomTest, first = T.fresh(), initialAck = first.wardCoachSeen, l = T.settled(); l.wardCoachSeen = false;
      while (l.bricksBroken < 12) { const br = l.bricks.find(b => !b.gone && b.kind === 6); l.hitCell(br.c, br.r, { x: br.x + 8, y: br.y + 8, vx: 0, vy: -345, r: 6 }); T.advance(l, 0.01); }
      T.advance(l, 8); T.hit(l); T.advance(l, 1); T.hit(l); let n = 0; while (!l.wardCoach && n++ < 1800) l.update(1 / 120); T.draw();
      const snapshot = () => ({ t: l.t, timer: l.venom.t, cells: JSON.stringify(l.snake.cells), balls: l.balls.map(b => [b.x, b.y]), lives: l.lives, score: l.score, grid: [...l.grid.cells] });
      const before = snapshot(), kitBefore = l.kitTime; T.advance(l, 5); return { initialAck, earnedBreaks: l.bricksBroken, charge: l.paddle.charge, active: l.wardCoach, hits: l.venom.contacts.hits, before, after: snapshot(), kitBefore, kitAfter: l.kitTime };
    });
    assert.equal(coachSetup.initialAck, false); assert(coachSetup.earnedBreaks >= 12); assert.equal(coachSetup.charge, 1); assert.equal(coachSetup.active, true); assert.equal(coachSetup.hits, 2); assert.deepEqual(coachSetup.before, coachSetup.after); assert(coachSetup.kitAfter > coachSetup.kitBefore); await shot('coach-01-paused-practice');
    const coachOrb = await page.evaluate(safe => { const l = window.__breach.level, a = l.kitAnchor(); return { x: a.x * l.kitUIScale, y: safe + (a.y - 34) * l.kitUIScale }; }, Number(d.safe.split(',')[0])); await page.mouse.click(coachOrb.x, coachOrb.y);
    const coachResult = await page.evaluate(() => { const T = window.__venomTest, l = window.__breach.level; const active = l.wardCoach, charge = l.paddle.charge; T.advance(l, 1.9); const held = l.venom.record?.guarded; const next = T.fresh(); return { active, charge, held, savedAck: next.wardCoachSeen, nextHits: next.venom.contacts.hits }; });
    assert.equal(coachResult.active, false); assert.equal(coachResult.charge, 0); assert.equal(coachResult.held, true); assert.equal(coachResult.savedAck, true); assert.equal(coachResult.nextHits, 0);
    assert.deepEqual(errors, []); report.devices[device] = { opening, contacts, cases, terminal, coachSetup, coachResult, errors }; console.log(device, JSON.stringify(report.devices[device])); await page.close();
  }
  assert.equal(hash(), report.testedBuildSha256); writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
} finally { await browser.close(); }
