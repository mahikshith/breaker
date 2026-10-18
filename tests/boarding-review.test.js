import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeBall, stepBall } from '../src/physics.js';
import { sweepTarget } from '../src/carrier-physics.js';

globalThis.Image = class { complete = true; naturalWidth = 1; width = 512; height = 768; decode() { return Promise.resolve(); } };
const { Carrier } = await import('../src/carrier.js');
const devices = [[729, 393 / 360], [785, 412 / 360]];
const advance = (l, seconds) => { for (let i = 0; i < Math.round(seconds * 120); i++) l.updateLevel(1 / 120); };
function extraction(H = 729, scale = 393 / 360) {
  const l = new Carrier(360, H, scale);
  l.release(); l.aim = null; l.balls[0].caught = true;
  for (const b of l.bricks) b.hp = 0;
  for (const g of l.guns) g.hp = 0;
  for (let i = 0; i < 6000 && l.raid?.stage !== 'extract'; i++) l.updateLevel(1 / 120);
  assert.equal(l.raid?.stage, 'extract');
  return l;
}

test('the actual last normal-ball contact beats extraction expiry and suppresses a second live ball', () => {
  for (const [H, scale] of devices) {
    const l = extraction(H, scale), target = l.crew.find(c => c.id === l.raid.targetId), r = target.art.rect;
    for (const c of l.crew) if (c !== target) { c.hp = 0; c.releasedAt = l.clock - 2; c.secured = true; c.securedAt = l.clock - 1.2; }
    target.hp = 1;
    l.clock = l.raid.extractAt + l.rules.extractSeconds - 1 / 120; l.hitStop = 0; l.lives = 1;
    const rescue = makeBall(r.x + r.w / 2, r.y + r.h + l.ballRadius + .2, 0, -345, l.ballRadius);
    const lateMiss = makeBall(l.right - 3, l.drainY + 7, 0, 345, l.ballRadius);
    l.balls = [rescue, lateMiss];
    l.update(1 / 120);
    assert.equal(target.hp, 0, 'physical contact, not a direct hit callback, releases the last lock');
    assert.equal(target.captured, false); assert.equal(l.phase, 'escape'); assert.equal(l.state, 'play');
    assert.equal(l.lives, 1, 'the later ball cannot undo the same-frame final rescue');
    assert(l.balls.every(b => b.caught && !b.dead)); assert.equal(l.raid, null);
  }
});

test('aerial fire reaches the first real ball on either side of intact housing without damaging that housing', () => {
  for (const ballFirst of [true, false]) {
    const l = new Carrier(360, 729, 393 / 360), c = l.crew[2], r = c.art.rect, x = r.x + r.w / 2;
    for (const b of l.bricks) b.hp = 0;
    const ballY = ballFirst ? r.y + r.h + 20 : r.y - 20;
    l.balls = [Object.assign(makeBall(x, ballY, 0, -345, l.ballRadius), { caught: true })];
    l.paddle.vx = 0;
    l.bolts = [{ id: 'review-bolt', x, y: r.y + r.h + 70, vx: 0, vy: -900, r: 3.5 }];
    l.updateBolts(.2);
    assert.equal(l.bolts.length, 0); assert.equal(c.hp, l.rules.lockHP); assert.equal(c.releasedAt, null);
    assert.equal(l.score, 20, 'the shot passes above housing and the actual ball intercepts it');
    assert.equal(l.coreChargeBank, 0, 'an intercepted projectile has no HP and cannot farm companion credit');
    assert.equal(l.lives, 3);
  }
});

test('a physically blocked radius route is ineligible even when its centre ray misses the friendly housing', () => {
  const l = extraction(), target = l.crew[0], obstacle = l.crew[2], r = obstacle.art.rect;
  const to = l.centre(target);
  // Find an actual native-layout grazing lane: centre ray is clear but the ordinary ball is not.
  let grazing = null;
  for (let x = l.left; x < l.right && !grazing; x += .25) {
    const from = { x, y: l.paddle.y - 220 }, t = { shapes: [{ type: 'rect', ...r }] };
    if (!sweepTarget(from, to, 0, t) && sweepTarget(from, to, l.ballRadius, t)) grazing = from;
  }
  assert(grazing, 'the measured housing arrangement supplies a grazing route');
  assert.equal(l.routeTo(target, grazing), null, 'eligibility considers the actual ball radius');
  assert.notEqual(l.chooseRaidTarget(grazing)?.id, target.id);
});

test('moving actor and bolt snapshots compensate for Focus plus SLOW without changing their real trajectory', () => {
  const l = extraction(), f = l.fighters.find(f => f.id === l.raid.fighterId);
  f.stage = 'approach'; f.stageAt = l.clock - .7;
  l.bolts = [{ id: 'review-moving-bolt', x: 200, y: 400, vx: 80, vy: 300, r: 3.5 }];
  const normal = l.targets(), actor = normal.find(t => t.id === f.id);
  assert(Math.abs(actor.vx) > 1, 'fixture is during actual fighter motion');
  l.timeScale = .25; l.slowT = 2;
  const slowed = l.world().targets, k = .25 * .68;
  for (const id of [f.id, 'review-moving-bolt']) {
    const a = normal.find(t => t.id === id), b = slowed.find(t => t.id === id);
    assert(Math.abs(a.vx - b.vx * k) < 1e-6); assert(Math.abs(a.vy - b.vy * k) < 1e-6);
    assert.deepEqual(a.shapes, b.shapes, 'the current visible shape is not moved twice');
  }
});

test('interrupting a partial pull returns continuously while preserving its locked status', () => {
  const l = extraction(); advance(l, l.rules.extractSeconds - 1);
  const c = l.crew.find(c => c.id === l.raid.targetId), f = l.fighters.find(f => f.id === l.raid.fighterId);
  const before = l.workerPose(c), p = l.fighterPose(f);
  assert(before.pull > .4 && before.pull < .6);
  for (let i = 0; i < 2; i++) stepBall(makeBall(p.x, p.y + 38, 0, -345, l.ballRadius), .12, l.world());
  const after = l.workerPose(c);
  assert(Math.hypot(before.x - after.x, before.y - after.y) < 1e-6, 'first return pose equals the interrupted pose');
  assert.equal(c.hp, l.rules.lockHP); assert.equal(c.releasedAt, null); assert.equal(c.secured, false); assert.equal(c.captured, false);
  advance(l, .36); assert.equal(l.workerPose(c).pull, 0); assert.equal(c.returning, null);
  assert.equal(l.state, 'play');
});
