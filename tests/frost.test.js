import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { makeBall, stepBall } from '../src/physics.js';

globalThis.Image = class { complete = true; naturalWidth = 1; decode() { return Promise.resolve(); } };
const { Frost, FROST_MODES } = await import('../src/frost.js');
// A deterministic projection fixture. Shipping geometry is measured from the real rendered rig.
const clips = Object.fromEntries(['idle', 'walk', 'windup', 'strike', 'recover', 'hurt', 'victory'].map((id, i) => [id, { start: i * 4, n: 4, fps: 10 }]));
const xs = [22, 23, 24, 22, 22, 23, 24, 22, 22, 18, 12, 8, 8, 26, 43, 48, 48, 35, 25, 22, 20, 18, 17, 18, 22, 22, 22, 22];
const art = { cell: [256, 228], columns: 7, rows: 4, unit: [144, 128], pivot: [.5, .90625], clips,
  anchors: xs.map(x => ({ fist: { x, y: -44, r: 9 }, body: { x: -17, y: -78, w: 36, h: 72 } })) };
const level = (mode = 'easy', H = 729, s = 393 / 360) => new Frost(360, H, s, mode, art);
const tick = (l, seconds, full = false) => { for (let i = 0; i < Math.round(seconds * 120); i++) full ? l.update(1 / 120) : l.updateLevel(1 / 120); };
const parked = mode => { const l = level(mode); l.release(); l.aim = null; l.balls[0].caught = true; return l; };

test('first serve has no siege progress or opening attack; auto serve is bounded and starts the mission', () => {
  const l = level(); tick(l, 7.9, true);
  assert.equal(l.clock, 0); assert.equal(l.stage, 'idle'); assert.equal(l.punchCount, 0); assert(l.aim?.serve);
  tick(l, .15, true); assert(l.started); assert(!l.aim); assert(l.clock < .1); assert.equal(l.stage, 'idle');
});

test('all modes keep equal coloured bricks, open flank routes and full lower reaction space', () => {
  for (const mode of Object.keys(FROST_MODES)) for (const [H, s] of [[729, 393 / 360], [785, 412 / 360]]) {
    const l = level(mode, H, s);
    assert.equal(l.bricks.length, 36); assert(l.bricks.every(b => b.w === 36 && b.h === 18 && b.hp === b.maxHP && b.hp >= 1 && b.hp <= 2));
    assert.equal(l.bricks.filter(b => b.hp === 2).length, 5); assert.equal(l.bricks.filter(b => b.type === 'mine').length, 2);
    assert.equal(Math.max(...l.bricks.map(b => b.y + b.h)), 414);
    assert(l.paddle.y - 414 >= 190); assert(l.bricks[0].x - l.left >= 40);
    assert(l.right - (l.bricks[5].x + l.bricks[5].w) >= 40);
    assert(l.bricks.filter(b => b.payload).every(b => ['wide', 'shield', 'split', 'slow', 'fire', 'laser'].includes(b.payload)));
  }
});

test('ordinary high-speed broad torso shot damages once per episode and a distinct return is productive', () => {
  const l = parked(), q = l.pose().body, hp = l.warden.hp;
  const b = makeBall(q.x + q.w / 2, q.y + q.h + 30, 0, -1400, 6);
  const w = l.world(); w.targets = w.targets.filter(t => t.id === 'warden');
  stepBall(b, .06, w); assert.equal(l.warden.hp, hp - 1); assert(b.vy > 0);
  stepBall(b, .08, w); assert.equal(l.warden.hp, hp - 1);
  b.x = q.x + q.w / 2; b.y = q.y + q.h + 30; b.vx = 0; b.vy = -1400;
  stepBall(b, .03, w); assert.equal(l.warden.hp, hp - 2);
});

test('measured hand sweep contacts the dedicated post once; score bricks/rewards remain intact', () => {
  for (const mode of Object.keys(FROST_MODES)) {
    const l = parked(mode), d = l.defences[0], before = l.bricks.map(b => b.hp), score = l.score;
    l.startWindup(); tick(l, l.rules.windup + l.rules.strike + .05);
    assert.equal(l.punchCount, 1); assert.equal(d.hp, d.maxHP - 1);
    assert.deepEqual(l.bricks.map(b => b.hp), before); assert.equal(l.score, score);
    assert.equal(l.bricksBroken, 0); assert.equal(l.drops.length, 0); assert.equal(l.coreChargeBank, 0);
    assert.equal(l.resolvePunch(l.pose().fist, l.pose().fist), false);
  }
});

test('short real fist reach owns stance and numeric global clip frames own both art and anchors', () => {
  const short = structuredClone(art);
  short.clips.strike = { frames: [15, 14, 13, 12], fps: 12 };
  for (let f = 12; f <= 15; f++) short.anchors[f].fist = { x: 9 + f - 12, y: -44, r: 5 };
  const l = new Frost(360, 729, 393 / 360, 'easy', short);
  assert.equal(l.reach().x, 12); l.release(); l.startWindup();
  tick(l, l.rules.windup + l.rules.strike + .05);
  assert.equal(l.defences[0].hp, l.rules.postHP - 1);
  l.setStage('strike'); assert.equal(l.pose().globalFrame, 15); assert.equal(l.pose().fist.x, l.stance(0).x + 12 * l.artScale);
});

test('one continuous powered overlap does not farm body HP, Kit credit or windup interruption', () => {
  const l = parked('medium'); l.startWindup(); const q = l.pose().body, hp = l.warden.hp;
  const b = makeBall(q.x + q.w / 2, q.y + q.h + 25, 0, -600, 10); b.titan = 6;
  stepBall(b, .1, l.world()); assert.equal(l.warden.hp, hp - 3); assert.equal(l.coreChargeBank, 0); assert.equal(l.windHits, 0);
  const normal = { x: 40, y: 160, r: 6 };
  l.hitTarget('warden', normal); assert.equal(l.stage, 'windup');
  l.hitTarget('warden', normal); assert.equal(l.stage, 'stun'); assert.equal(l.punchCount, 0);
});

test('Kit earned credit fills only over active time; a modal freezes every local clock', () => {
  const l = parked(); for (let i = 0; i < 50; i++) l.chargeCore();
  assert.equal(l.paddle.charge, 0); assert.equal(l.coreChargeBank, 1);
  l.update(1); assert(Math.abs(l.paddle.charge - 1 / 18) < 1e-8);
  l.powerMenuOpen = true; const before = [l.clock, l.t, l.kitTime, l.coreChargeBank, l.paddle.charge];
  l.update(10); assert.deepEqual([l.clock, l.t, l.kitTime, l.coreChargeBank, l.paddle.charge], before);
});

test('full-charge ward spends once, protects one real swept punch and does not heal or free-refill', () => {
  const l = parked(), d = l.defences[0]; l.startWindup(); l.paddle.charge = 1; l.coreChargeBank = .4;
  assert(l.useKitPower()); assert(!l.useKitPower()); assert.equal(l.paddle.charge, 0); assert.equal(l.coreChargeBank, 0);
  tick(l, l.rules.windup + l.rules.strike + .05);
  assert.equal(d.hp, d.maxHP); assert.equal(l.blockedPunches, 1); assert.equal(l.ward, null); assert.equal(l.kitWardResult, 'held');
  l.startWindup(); tick(l, l.rules.windup + l.rules.strike + .05); assert.equal(d.hp, d.maxHP - 1);
});

test('defences remain physical for FIRE/TITAN and player arrows without friendly damage', () => {
  const l = parked(), d = l.defences[0];
  for (const extra of [{}, { fire: true }, { titan: 7 }]) {
    const b = Object.assign(makeBall(d.x + d.w / 2, d.y + d.h + 20, 0, -1200, 6), extra), w = l.world();
    w.targets = w.targets.filter(t => t.id === d.id); stepBall(b, .05, w);
    assert(b.vy > 0); assert.equal(d.hp, d.maxHP);
  }
  const s = { x: d.x + d.w / 2, y: d.y + d.h - 4, vy: -560, r: 2 };
  assert(l.shotHit(s, d.y + d.h + 30, .06)); assert.equal(d.hp, d.maxHP);
});

test('last legal body contact owns the outcome before same-tick drain and breach; terminal clocks freeze', () => {
  const l = parked(); l.warden.hp = 1; l.hitTarget('warden', { x: 60, y: 150, r: 6 });
  assert.equal(l.phase, 'rescue'); const lives = l.lives; l.loseBall(); assert.equal(l.lives, lives);
  assert.equal(l.resolvePunch(l.pose().fist, l.pose().fist), false); tick(l, 1.7, true); assert.equal(l.state, 'won');
  const before = l.inspect(); l.update(10); assert.deepEqual(l.inspect(), before); assert.equal(l.shots.length, 0);
});

test('final barrier breach has a visible terminal beat; Continue restores failed defence without resetting earned progress', () => {
  const l = parked(); l.activeDefence = 2; l.defences[0].hp = l.defences[1].hp = 0; l.defences[2].hp = 1;
  l.warden.hp -= 9; l.bricks[2].hp = 0; l.score = 900; l.startWindup();
  tick(l, l.rules.windup + l.rules.strike + .05); assert.equal(l.phase, 'breach'); assert.equal(l.state, 'play');
  tick(l, 1); assert.equal(l.state, 'lost'); const at = l.clock; l.update(10); assert.equal(l.clock, at);
  l.continueRun(); assert.equal(l.state, 'play'); assert.equal(l.phase, 'siege'); assert.equal(l.warden.hp, l.rules.hp - 9);
  assert.equal(l.bricks[2].hp, 0); assert.equal(l.score, 900); assert.equal(l.defences[2].hp, 2);
  assert(l.aim?.serve); assert(l.enemyGraceUntil > l.clock + 4); assert.equal(l.shield, 2);
});

test('replacement serve and hit-stop use real mission time while Focus cannot freeze the warning', () => {
  const l = parked(); l.startWindup(); l.timeScale = .25; l.slowT = 5; l.hitStop = .3;
  const at = l.clock; tick(l, .25, true); assert(Math.abs(l.clock - at - .25) < .001);
  l.loseBall(); assert(l.aim?.serve); const epoch = l.inputEpoch; tick(l, 3.05, true);
  assert(!l.aim); assert.equal(l.inputEpoch, epoch); assert(l.enemyGraceUntil >= l.clock + 2.9);
});

test('actual princess metadata without fps still yields finite visible source rectangles', () => {
  const l = level(), calls = [], g = { drawImage: (...args) => calls.push(args) };
  for (const phase of ['siege', 'rescue', 'breach']) { l.phase = phase; l.drawPrincess(g); }
  assert.equal(calls.length, 3);
  for (const args of calls) { assert(args.slice(1).every(Number.isFinite)); assert.equal(args.length, 9); assert(args[7] >= 56); }
});

test('shipping rig anchors sweep into each of the three posts once across modes and phone geometries', () => {
  const measured = JSON.parse(readFileSync(new URL('../assets/frost-warden/manifest.json', import.meta.url)));
  assert.equal(measured.forwardHand, 'R'); assert.equal(measured.anchors.length, measured.columns * measured.rows);
  assert(measured.anchors.every(a => a.bodyShapes?.length && a.bodyShapes.every(s => s.w > 0 && s.h > 0)));
  for (const mode of Object.keys(FROST_MODES)) for (const [H, s] of [[729, 393 / 360], [785, 412 / 360]]) for (let post = 0; post < 3; post++) {
    const l = new Frost(360, H, s, mode, measured); l.release(); l.balls[0].caught = true; l.aim = null; l.activeDefence = post;
    const before = l.defences.map(d => d.hp), bricks = l.bricks.map(b => b.hp);
    assert(l.startWindup()); tick(l, l.rules.windup + l.rules.strike + .02);
    assert.equal(l.punchCount, 1); assert.equal(l.defences[post].hp, before[post] - 1);
    assert(l.defences.every((d, i) => i === post || d.hp === before[i]));
    assert.deepEqual(l.bricks.map(b => b.hp), bricks); assert.equal(l.records[0].post, 'defence' + post);
    assert.equal(l.drops.length, 0); assert.equal(l.coreChargeBank, 0);
    const at = l.records[0]; assert(Number.isFinite(at.from.x + at.from.y + at.to.x + at.to.y));
    assert(l.pose().otherHands.length === 1, 'the visible other hand is also a productive collision surface');
  }
});

test('real incoming ordinary ball can stagger before the measured windup deadline; a late hit still hurts but does not cancel the punch', () => {
  const measured = JSON.parse(readFileSync(new URL('../assets/frost-warden/manifest.json', import.meta.url)));
  for (const late of [false, true]) {
    const l = new Frost(360, 729, 393 / 360, 'easy', measured); l.release(); l.balls[0].caught = true; l.aim = null;
    l.startWindup(); tick(l, l.rules.windup + (late ? .025 : -.05));
    const q = l.pose().body, ball = makeBall(q.x + q.w / 2, q.y + q.h + 14, 0, -1200, 6), hp = l.warden.hp;
    const w = l.world(); w.targets = w.targets.filter(t => t.id === 'warden'); stepBall(ball, .03, w);
    assert(l.warden.hp < hp);
    if (late) { assert.equal(l.stage, 'strike'); tick(l, l.rules.strike + .05); assert.equal(l.defences[0].hp, l.rules.postHP - 1); }
    else { assert.equal(l.stage, 'stun'); tick(l, .6); assert.equal(l.defences[0].hp, l.rules.postHP); assert.equal(l.punchCount, 0); }
  }
});

test('round-3 specials: rime armour takes two hits, a frost mine shatters its neighbours', () => {
  const l = level('medium', 729, 393 / 360);
  const a = l.bricks.find(b => b.maxHP === 2);
  assert.equal(l.hitTarget(a.id, { x: 0, y: 0 }), true); assert.equal(a.hp, 1);
  assert.equal(l.hitTarget(a.id, { x: 0, y: 0 }), false); assert.equal(a.hp, 0);
  const m = l.bricks.find(b => b.type === 'mine'), near = l.bricks.filter(b => b !== m && Math.hypot(b.x - m.x, b.y - m.y) <= 46);
  assert.ok(near.length >= 2); l.hitTarget(m.id, { x: 0, y: 0 });
  assert.ok(near.every(b => b.hp === 0), 'every brick within the blast shatters');
});
