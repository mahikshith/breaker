import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Bellforge, BELLFORGE_MODES, BELLFORGE_ENDING, rampPose, sweepMovingSegment } from '../src/fantasy/bellforge.js';
import { sweepTarget } from '../src/carrier-physics.js';

const tick = (game, seconds) => { for (let left = seconds; left > 1e-9; left -= 1 / 120) game.update(Math.min(left, 1 / 120)); };
const quietFixture = () => { const g = new Bellforge(); g.launch(); g.moveBall = () => {}; return g; };
const near = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) <= eps, `${a} != ${b}`);
const underside = (g, x = 80) => Math.max(...g.villain.body.filter(s => Math.abs(s.x - x) < s.r + 6).map(s => s.y + Math.sqrt((s.r + 6) ** 2 - (s.x - x) ** 2)));

test('Bellforge world metrics preserve normal input sizes, return runway and finite mode pressure', () => {
  for (const height of [700, 760]) for (const mode of Object.keys(BELLFORGE_MODES)) {
    const g = new Bellforge({ height, difficulty: mode });
    assert.equal(g.paddle.y, height - 90); assert.equal(g.paddle.w, 100); assert.equal(g.balls[0].r, 6);
    assert.equal(Math.max(...g.bricks.filter(b => b.type === 'brick').map(b => b.y + b.h)), g.paddle.y - 210);
    assert.ok(g.bricks.filter(b => b.type === 'brick').every(b => b.w === 36 && b.h === 18 && b.x >= 42 && b.x + b.w <= 318));
    g.setTarget(-100); assert.equal(g.paddle.targetX, 56); g.setTarget(1000); assert.equal(g.paddle.targetX, 304);
  }
  assert.throws(() => new Bellforge({ height: 600 }), RangeError);
  assert.throws(() => new Bellforge({ width: 320 }), RangeError);
});

test('full normal/cosmic diameter fits the authored ramp gaps and flanks at every stop', () => {
  const g = new Bellforge();
  const pointSegment = (p, a, b) => { const dx = b.x - a.x, dy = b.y - a.y; const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy))); return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy); };
  for (let bits = 0; bits < 8; bits++) {
    const poses = g.ramps.map((r, i) => rampPose({ ...r, previousAngle: bits & (1 << i) ? -.32 : r.angle, angle: bits & (1 << i) ? -.32 : r.angle }));
    for (const p of poses) { assert.ok(Math.min(p.a.x, p.b.x) - 4 >= 42); assert.ok(Math.max(p.a.x, p.b.x) + 4 <= 318); }
    for (let i = 0; i < poses.length; i++) for (let j = i + 1; j < poses.length; j++) {
      const p = poses[i], q = poses[j], gap = Math.min(pointSegment(p.a, q.a, q.b), pointSegment(p.b, q.a, q.b), pointSegment(q.a, p.a, p.b), pointSegment(q.b, p.a, p.b)) - 8;
      assert.ok(gap >= 32, `ramp ${i}/${j}, pose ${bits}, gap ${gap}`);
    }
  }
});

test('six-row phone layout adds thirty full bricks without obstructing pins, ramps or the ratchet', () => {
  for (const [height, paddleY] of [[780.4580152671756, 665.0381679389313], [799.5145631067961, 689.4174757281553]]) {
    const g = new Bellforge({ height, paddleY }), bricks = g.bricks.filter(b => b.type === 'brick'), pins = g.bricks.filter(b => b.type === 'pin');
    assert.equal(bricks.length, 30); assert.equal(new Set(bricks.map(b => b.id.split('-')[1])).size, 6);
    for (const b of bricks) {
      assert.ok(b.y + b.h <= g.paddle.y - 210 + 1e-8); assert.equal(b.w, 36); assert.equal(b.h, 18);
      for (const p of pins) assert.ok(b.x + b.w <= p.x || p.x + p.w <= b.x || b.y + b.h <= p.y || p.y + p.h <= b.y);
      for (const r of g.ramps) for (const angle of [r.angle, -.32]) assert.equal(sweepMovingSegment(
        { x: b.x + 18, y: b.y + 9 }, { x: b.x + 18, y: b.y + 9 }, Math.hypot(36, 18) / 2, { ...r, previousAngle: angle, angle }, 0), null);
    }
  }
});

test('moving-segment CCD catches a fast crossing and a rotating tip using actual angular velocity', () => {
  const still = { pivot: { x: 50, y: 100 }, length: 100, previousAngle: 0, angle: 0, thickness: 8 };
  const hit = sweepMovingSegment({ x: 100, y: 20 }, { x: 100, y: 180 }, 6, still, .1);
  assert.ok(hit); near(hit.t, 70 / 160, .00002); assert.equal(hit.ny, -1);
  const rotating = { ...still, previousAngle: -.4, angle: .4 };
  const tip = sweepMovingSegment({ x: 147, y: 100 }, { x: 147, y: 100 }, 6, rotating, .1);
  assert.ok(tip && tip.t > 0 && tip.t < 1); assert.ok(Math.abs(tip.svy) > 500);
  assert.equal(sweepMovingSegment({ x: 180, y: 20 }, { x: 180, y: 180 }, 6, still, .1), null);
});

test('first teaching bell physically touches all ramps without moving Lumi; harmful route docks once', () => {
  const g = quietFixture(), seen = new Set();
  for (let i = 0; i < 120 * 11.9; i++) { g.update(1 / 120); for (const b of g.bells) if (b.rampId) seen.add(b.rampId); assert.ok(g.bells.every(b => b.teaching)); }
  assert.deepEqual([...seen].sort(), ['ramp-0', 'ramp-1', 'ramp-2']); assert.equal(g.lumi.steps, 0);
  tick(g, .12); assert.ok(g.lastRelease >= 12); assert.ok(g.bells.some(b => !b.teaching));
  tick(g, 3); assert.equal(g.lumi.steps, 1); near(g.lumi.y, g.lumi.baseY + 12);
  tick(g, 2); assert.equal(g.lumi.steps, 1);
});

test('pin destruction drives the same real ramp smoothly rather than moving a collider instantly', () => {
  const g = quietFixture(), pin = g.bricks.find(b => b.rampId), r = g.ramps[0], a = r.angle;
  g.hitBrick(pin, g.balls[0]); assert.equal(r.targetAngle, a);
  g.hitBrick(pin, g.balls[0]); assert.equal(r.targetAngle, -.32); assert.equal(r.angle, a);
  const pivot = { ...r.pivot };
  tick(g, .1); assert.ok(r.angle < a && r.angle > -.32); near(r.pivot.x, pivot.x); near(r.pivot.y, pivot.y);
  near(r.a.x, r.pivot.x + Math.cos(r.angle) * r.contactOffset.x - Math.sin(r.angle) * r.contactOffset.y);
  near(r.b.y, r.a.y + Math.sin(r.angle) * r.length);
  assert.ok(Math.abs(r.omega) <= .850001); tick(g, 1); near(r.angle, -.32);
});

test('raster hinge/contact anchors and each measured Korr anatomy pose stay in the physics frame', () => {
  const data = JSON.parse(readFileSync(new URL('../assets/fantasy-machinery/manifest.json', import.meta.url), 'utf8')).bellforge;
  const g = new Bellforge(), m = data.ramp, a = m.anchors.contactA, z = m.anchors.contactB, hinge = m.anchors.hinge;
  const span = (z[0] - a[0]) * m.size[0];
  for (const r of g.ramps) { near(r.contactOffset.x / r.length, (a[0] - hinge[0]) * m.size[0] / span, 1e-8); near(r.contactOffset.y / r.length, (a[1] - hinge[1]) * m.size[1] / span, 1e-8); }
  for (const stage of ['idle', 'windup', 'release', 'stagger']) {
    g.villain.stage = stage; g.updateBody(); const expected = data.korr.collisions[stage];
    assert.equal(g.villain.body.length, expected.length);
    g.villain.body.forEach((s, i) => { near(s.x - g.villain.foot.x, expected[i].x); near(s.y - g.villain.foot.y, expected[i].y); near(s.r, expected[i].r); });
  }
});

test('ratchet motion is bounded, fatal descent finishes safely, and broken-brick metadata keeps real dimensions', () => {
  const g = quietFixture(); g.lumi.steps = 7; g.ramps = [];
  const bell = g.releaseBell(false); Object.assign(bell, { x: 310, px: 310, y: 297.8, py: 297.8, vx: 0, vy: 250 });
  g.update(1 / 120); assert.equal(g.lumi.steps, 8); assert.equal(g.lumi.targetY, 201); assert.equal(g.phase, 'breach');
  const before = g.lumi.y; tick(g, .1); near(g.lumi.y - before, 3); assert.equal(g.state, 'play');
  assert.equal(g.canActivate(), false); tick(g, 3.2); assert.equal(g.state, 'lost'); near(g.lumi.y, 201);
  const h = quietFixture(), brick = h.bricks[0]; Object.assign(h.balls[0], { vx: 200, vy: -300 }); h.hitBrick(brick, h.balls[0]);
  const fx = h.effects.find(e => e.kind === 'brick-break'); assert.ok(fx); assert.equal(fx.colour, brick.colour); assert.equal(fx.w, 36); assert.equal(fx.h, 18); assert.equal(fx.vx, 24); assert.equal(fx.vy, -24);
});

test('fast normal ball cannot tunnel through a brick or double-credit held Korr contact', () => {
  const g = new Bellforge(); g.launch(); const b = g.balls[0], target = g.bricks.find(v => v.type === 'brick');
  g.bricks = [target];
  Object.assign(b, { x: target.x + 18, y: target.y + 40, vx: 0, vy: -5000 }); g.moveBall(b, .02);
  assert.equal(target.hp, 0); assert.equal(g.chargeBank, 1); assert.ok(b.vy > 0);
  Object.assign(b, { x: 80, y: underside(g) + .1, vx: 0, vy: -345 }); b.contacts.clear(); const hp = g.villain.hp;
  g.moveBall(b, .001); assert.equal(g.villain.hp, hp - 1);
  b.vx = b.vy = 0; g.moveBall(b, .001); assert.equal(g.villain.hp, hp - 1);
  Object.assign(b, { x: 200, y: 100 }); g.moveBall(b, .001);
  Object.assign(b, { x: 80, y: underside(g) + 1, vx: 0, vy: -345 }); g.moveBall(b, .01); assert.equal(g.villain.hp, hp - 2);
  assert.equal(g.chargeBank, 1, 'boss hits never refill Echo');
});

test('one normal bell contact imparts momentum, held overlap cannot farm HP, separated hit shatters', () => {
  const g = new Bellforge(); g.launch(); const b = g.balls[0], bell = g.releaseBell(false);
  Object.assign(bell, { x: 200, px: 200, y: 450, py: 450, vx: 10, vy: 0 });
  Object.assign(b, { x: 200, y: 470, vx: 0, vy: -345 }); g.moveBall(b, .001);
  assert.equal(bell.hp, 1); assert.ok(bell.vy < -150); assert.equal(bell.returning, true);
  b.vx = b.vy = 0; g.moveBall(b, .001); assert.equal(bell.hp, 1);
  Object.assign(b, { x: 240, y: 450 }); g.moveBall(b, .001);
  Object.assign(b, { x: 200, y: 471, vx: 0, vy: -345 }); g.moveBall(b, .01);
  assert.equal(bell.hp, 0); assert.equal(bell.dead, true); assert.equal(g.chargeBank, 0);
});

test('a real first-hit reversal before dock contact cancels arrival; later contact cannot undo the ratchet', () => {
  for (const [bellY, ballY, expected] of [[297.8, 318.1, 0], [297.9, 319, 1]]) {
    const g = new Bellforge(); g.launch(); g.ramps = []; g.bricks = [];
    const bell = g.releaseBell(false); Object.assign(bell, { x: 310, px: 310, y: bellY, py: bellY, vx: 0, vy: 100 });
    Object.assign(g.balls[0], { x: 310, y: ballY, vx: 0, vy: -345 });
    g.update(1 / 240); assert.equal(g.lumi.steps, expected); assert.equal(bell.hp, 1); assert.ok(bell.vy < 0);
    if (!expected) { assert.equal(bell.docked, false); assert.ok(bell.y < 298); }
  }
});

test('earned charge banks only productive brick HP and fills at one active credit per second', () => {
  const g = quietFixture();
  for (const brick of g.bricks.filter(v => v.type === 'brick').slice(0, 18)) { g.hitBrick(brick, g.balls[0]); g.hitBrick(brick, g.balls[0]); }
  assert.equal(g.chargeBank, 18); assert.equal(g.charge, 0);
  tick(g, .5); near(g.charge, 100 / 36); near(g.chargeBank, 17.5);
  g.pause(true); const snapshot = JSON.stringify(g); tick(g, 5); assert.equal(JSON.stringify(g), snapshot);
  g.pause(false); tick(g, 17.5); assert.equal(g.charge, 100); assert.equal(g.chargeBank, 0);
  assert.equal(g.activate(), false, 'no live bell warning holds full charge'); assert.equal(g.charge, 100);
});

test('enemy, arrow and active cosmic damage cannot refill their replacement power', () => {
  const g = quietFixture(), bricks = g.bricks.filter(v => v.type === 'brick'), b = g.balls[0];
  g.hitBrick(bricks[0], { source: 'enemy' }); assert.equal(g.chargeBank, 0);
  b.source = 'arrow'; g.hitBrick(bricks[1], b); assert.equal(g.chargeBank, 0);
  b.source = 'ordinary'; b.titan = 3; g.hitBrick(bricks[2], b); assert.equal(g.chargeBank, 0);
  b.titan = 0; g.hitBrick(bricks[3], b); assert.equal(g.chargeBank, 1);
});

test('invalid delta cannot advance and one stalled frame is bounded to .1s', () => {
  const g = quietFixture(); for (const dt of [NaN, Infinity, -1, 0]) g.update(dt); assert.equal(g.time, 0);
  g.update(10); near(g.time, .1); assert.ok(g.effects.length <= 80);
});

test('Echo Guard makes a physical one-use reflection into Korr and never remote damage', () => {
  const g = quietFixture(); tick(g, 10.81); g.charge = 100;
  assert.equal(g.activate(), true); assert.equal(g.charge, 0); assert.equal(g.villain.hp, 24);
  let reflected = false; for (let i = 0; i < 120 * 3; i++) { g.update(1 / 120); reflected ||= g.bells.some(b => b.returning); }
  assert.ok(reflected); assert.equal(g.villain.hp, 20); assert.ok(g.effects.some(v => v.kind === 'stagger') || g.villain.stage === 'stagger');
  assert.equal(g.lumi.steps, 0); assert.equal(g.chargeBank, 0); assert.equal(g.activate(), false);
});

test('warning/physics pause together and serve cannot be used as an indefinite threat freeze', () => {
  const g = new Bellforge(); tick(g, 7.9); assert.equal(g.time, 0); assert.equal(g.bells.length, 0);
  tick(g, .11); assert.equal(g.active, true); tick(g, 2); assert.equal(g.villain.stage, 'windup');
  g.pause(true); const snapshot = JSON.stringify(g); tick(g, 20); assert.equal(JSON.stringify(g), snapshot);
  g.pause(false); g.makeServe(); const before = g.time; tick(g, 3.01); assert.equal(g.phase, 'play'); assert.ok(g.time > before + 3);
});

test('final broad-body collision wins before simultaneous dock, last-life drain and future hazards', () => {
  const g = new Bellforge(); g.launch(); g.villain.hp = 1; g.lumi.steps = 7; g.lives = 1; g.ramps = [];
  const b = g.balls[0]; Object.assign(b, { x: 80, y: underside(g) + 1, vx: 0, vy: -345 });
  const bell = g.releaseBell(false); Object.assign(bell, { x: 310, px: 310, y: 297.5, py: 297.5, vx: 0, vy: 250 });
  g.balls.push({ ...b, id: 999, x: 350, y: 720, py: 720, vx: 0, vy: 345, contacts: new Set() });
  g.update(1 / 60); assert.equal(g.phase, 'rescue'); assert.equal(g.state, 'play'); assert.equal(g.lumi.steps, 7); assert.equal(g.lives, 1);
  tick(g, 3.5); assert.equal(g.state, 'won'); assert.equal(g.bells.length, 0); assert.equal(g.continue(), false);
  const snapshot = JSON.stringify(g); tick(g, 5); assert.equal(JSON.stringify(g), snapshot);
});

test('final hit visibly staggers, slumps at the fixed foot and settles before Lumi starts escaping', () => {
  const g = quietFixture(), foot = { ...g.villain.foot };
  g.hitVillain(g.villain.hp, false);
  assert.equal(g.phase, 'rescue'); assert.equal(g.villain.stage, 'defeated'); assert.equal(g.villain.defeat.frame, 3);
  near(g.rescueDelayRemaining, 1.6); near(g.rescueRemaining, 3.4); assert.equal(g.lumi.escape, 0);
  tick(g, BELLFORGE_ENDING.stagger / 2);
  assert.equal(g.villain.defeat.stage, 'stagger'); assert.ok(g.villain.defeat.angle < 0); near(g.villain.defeat.scaleY, 1);
  tick(g, BELLFORGE_ENDING.stagger / 2 + BELLFORGE_ENDING.slump / 2);
  assert.equal(g.villain.defeat.stage, 'slump'); assert.ok(g.villain.defeat.scaleY < 1 && g.villain.defeat.scaleY > .82);
  assert.equal(g.lumi.escape, 0); assert.deepEqual(g.villain.foot, foot);
  tick(g, BELLFORGE_ENDING.slump / 2 + .4);
  assert.equal(g.villain.defeat.stage, 'dazed'); near(g.villain.defeat.scaleY, .82); near(g.villain.defeat.scaleX, 1.04); near(g.villain.defeat.angle, .08);
  assert.equal(g.lumi.escape, 0); assert.equal(g.villain.defeat.daze, 1);
  tick(g, .2); assert.ok(g.lumi.escape > 0 && g.lumi.escape < .1); assert.equal(g.state, 'play');
  tick(g, 1.7); assert.equal(g.state, 'won'); near(g.lumi.escape, 1); near(g.rescueRemaining, 0);
  assert.equal(g.villain.defeat.stage, 'dazed'); assert.deepEqual(g.villain.foot, foot);
});

test('safe defeat clears attack work immediately and pause freezes the entire ending', () => {
  const g = quietFixture();
  const bell = g.releaseBell(false); bell.docked = true; g.pendingDocks.push(bell);
  g.guard = { remaining: 2, age: 1 }; g.effect(164, 147, 'bell-warning', 4); g.charge = 40; g.chargeBank = 3;
  const steps = g.lumi.steps, lives = g.lives;
  g.hitVillain(g.villain.hp, true);
  assert.deepEqual(g.bells, []); assert.deepEqual(g.pendingDocks, []); assert.deepEqual(g.villain.body, []); assert.equal(g.guard, null);
  assert.equal(g.nextWarning, Infinity); assert.equal(g.releaseBell(false), false); assert.equal(g.canActivate(), false);
  assert.ok(g.balls.every(b => b.caught && b.vx === 0 && b.vy === 0));
  assert.ok(g.effects.every(e => e.kind !== 'bell-warning'));
  tick(g, .8); g.pause(true); const snapshot = JSON.stringify(g); tick(g, 10); assert.equal(JSON.stringify(g), snapshot);
  g.pause(false); tick(g, 3);
  assert.equal(g.state, 'won'); assert.equal(g.lumi.steps, steps); assert.equal(g.lives, lives); assert.equal(g.charge, 40); assert.equal(g.chargeBank, 3);
  assert.equal(g.releaseBell(false), false); assert.equal(g.continue(), false);
});

test('a final reflected bell stops the same-step bell loop before another queued ratchet arrival', () => {
  const g = new Bellforge({ difficulty: 'hard', geometry: { korrBody: [{ type: 'circle', x: 80, y: 130, r: 30 }] } });
  g.launch(); g.ramps = []; g.villain.hp = 4;
  Object.assign(g.releaseBell(false), { x: 80, px: 80, y: 175, py: 175, vx: 0, vy: -300, returning: true });
  Object.assign(g.releaseBell(false), { x: 310, px: 310, y: 297.8, py: 297.8, vx: 0, vy: 200 });
  g.update(1 / 60);
  assert.equal(g.phase, 'rescue'); assert.equal(g.villain.hp, 0); assert.equal(g.lumi.steps, 0);
  assert.deepEqual(g.pendingDocks, []); assert.deepEqual(g.bells, []);
});

test('Continue preserves earned physical progress/resources and restores two lift teeth without boss refill', () => {
  const g = quietFixture(), pin = g.bricks.find(b => b.rampId); g.hitBrick(pin, g.balls[0]); g.hitBrick(pin, g.balls[0]); tick(g, 1);
  g.hitVillain(5, false); g.lumi.steps = 8; g.lumi.y = 201; g.charge = 23; g.chargeBank = 2;
  g.lose('fixture dock'); const old = { hp: g.villain.hp, score: g.score, angle: g.ramps[0].angle };
  assert.equal(g.continue(), true); assert.equal(g.lumi.steps, 6); assert.equal(g.villain.hp, old.hp); assert.equal(g.score, old.score); assert.equal(g.ramps[0].angle, old.angle);
  assert.equal(pin.hp, 0); assert.equal(g.charge, 23); assert.equal(g.chargeBank, 2); assert.equal(g.bells.length, 0); assert.equal(g.guard, null);
  assert.ok(g.nextWarning >= g.time + 3); assert.equal(g.phase, 'serve');
  assert.equal(g.continued, true); g.lose('second fixture'); assert.equal(g.continue(), false);
});

// A read-only, collision-aware aiming policy; every mutation uses launch/setTarget/update.
function forecast(g, x, offset) {
  let p = { x, y: g.paddle.y - 6.02 }, vx = Math.sin(offset / 50 * 1.08) * 345, vy = -Math.cos(offset / 50 * 1.08) * 345, time = 0;
  for (let pass = 0; pass < 18; pass++) {
    const to = { x: p.x + vx * 3, y: p.y + vy * 3 }, hits = [], add = (hit, kind) => { if (hit) hits.push({ ...hit, kind }); };
    if (to.x < 6) add({ t: (6 - p.x) / (to.x - p.x), nx: 1, ny: 0 }, 'wall');
    if (to.x > 354) add({ t: (354 - p.x) / (to.x - p.x), nx: -1, ny: 0 }, 'wall');
    if (to.y < 18) add({ t: (18 - p.y) / (to.y - p.y), nx: 0, ny: 1 }, 'wall');
    for (const t of g.staticTargets()) add(sweepTarget(p, to, 6, t), t.kind === 'villain' ? 'korr' : t.item.type);
    for (const r of g.ramps) add(sweepMovingSegment(p, to, 6, { ...r, previousAngle: r.angle }, 3), 'ramp');
    hits.sort((a, b) => a.t - b.t); const h = hits[0]; if (!h) return -100; time += h.t * 3;
    if (h.kind === 'korr') return 100 / (time + .5); if (h.kind === 'brick') return 8 / (time + .5); if (h.kind === 'pin') return 6 / (time + .5);
    p = { x: p.x + (to.x - p.x) * h.t + h.nx * .02, y: p.y + (to.y - p.y) * h.t + h.ny * .02 };
    const dot = vx * h.nx + vy * h.ny; if (dot < 0) { vx -= 2 * dot * h.nx; vy -= 2 * dot * h.ny; }
    if (p.y > g.paddle.y) return -100;
  }
  return -100;
}
test('ordinary public-input Easy policy wins both portrait world heights without Echo or Continue', () => {
  const fold = x => { const p = ((x - 6) % 696 + 696) % 696; return 6 + (p > 348 ? 696 - p : p); };
  for (const height of [700, 760]) {
    const g = new Bellforge({ height }); let casts = 0; const initial = g.activate; g.activate = (...args) => { casts++; return initial.apply(g, args); };
    for (let n = 0; n < 120 * 100 && g.state === 'play'; n++) {
      const b = g.balls[0]; if (g.phase === 'serve') g.launch(-1.9);
      if (b && !b.caught && b.vy > 0) {
        const t = Math.max(0, (g.paddle.y - b.r - b.y) / b.vy), land = fold(b.x + b.vx * t); let best = -Infinity, goal = land;
        for (let i = -19; i <= 19; i++) { const offset = i * 2.5, p = land - offset; if (p < 56 || p > 304) continue;
          const value = forecast(g, land, offset) + Math.sin(i * 3.1 + g.time * .7) * .0001; if (value > best) { best = value; goal = p; } }
        g.setTarget(goal);
      }
      g.update(1 / 120);
    }
    assert.equal(g.state, 'won', `${height}: ${g.state}, hp ${g.villain.hp}, teeth ${g.lumi.steps}`); assert.equal(g.villain.hp, 0); assert.equal(casts, 0); assert.equal(g.lives, 3);
    assert.ok(g.time > 12 && g.time < 100);
  }
});
