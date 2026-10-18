import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collideTargets, overlapsTarget, sweepTarget } from '../src/carrier-physics.js';
import { makeBall, stepBall } from '../src/physics.js';

const world = (targets, onTarget) => ({ targets, onTarget, left: -1000, right: 1000, top: -1000, bottom: 1000 });
const rect = (id, x, y, w, h, extra = {}) => ({ id, type: 'rect', x, y, w, h, ...extra });
const near = (a, b, message) => assert(Math.abs(a - b) < 1e-5, `${message}: ${a} vs ${b}`);

test('high-speed balls and moving thin targets cannot tunnel between substeps', () => {
  for (const type of ['rect', 'polygon', 'circle']) {
    const t = type === 'rect' ? rect(type, 40, 40, 120, 1) : type === 'polygon' ? { id: type, type, points: [[40, 40], [160, 40], [160, 41], [40, 41]] } : { id: type, type, x: 100, y: 40, r: 2 };
    const b = makeBall(100, 120, 0, -12000, 3), hits = [];
    stepBall(b, 1 / 30, world([t], id => hits.push(id)));
    assert(b.vy > 0 && b.y > 41, `${type}: rebound below thin target`);
    assert.equal(hits.length, 1);
    near(Math.hypot(b.vx, b.vy), 12000, 'speed preserved');
  }
  const target = rect('moving', 0, 40, 2, 20, { vx: 12000 });
  const b = makeBall(100, 50, 0, 1, 3), hits = [];
  stepBall(b, 1 / 60, world([target], id => hits.push(id)));
  assert.equal(hits.length, 1, 'a moving hull crossing a near-stationary ball is detected');
  assert(Number.isFinite(b.x + b.y + b.vx + b.vy));
});

test('compound hull leaves the real bay empty; only visible shutter leaves close it', () => {
  const hull = { id: 'hull', shapes: [rect('', 0, 0, 100, 12), rect('', 0, 12, 25, 48), rect('', 75, 12, 25, 48)] };
  const shot = () => makeBall(50, 90, 0, -300, 3);
  for (const open of [true, false]) {
    const shutter = rect('door', open ? 3 : 25, 48, open ? 18 : 50, 8, { pierceable: false });
    const b = shot(), hits = [];
    stepBall(b, .14, world([hull, shutter], id => hits.push(id)));
    assert.deepEqual(hits, open ? [] : ['door']);
    assert(open ? b.vy < 0 && b.y < 50 : b.vy > 0 && b.y > 56);
  }
  const ring = { id: 'alpha-outline', type: 'polygon', points: [[0, 0], [100, 0], [100, 100], [0, 100]], holes: [[[25, 25], [75, 25], [75, 75], [25, 75]]] };
  assert.equal(overlapsTarget({ x: 50, y: 50, r: 6 }, ring), false, 'transparent aperture is empty');
  assert.equal(overlapsTarget({ x: 27, y: 50, r: 6 }, ring), true, 'circle touching the aperture rim collides');
});

test('inside starts/corners resolve outside with finite normals and conserve speed', () => {
  for (const shape of [rect('box', 0, 0, 100, 100), { id: 'poly', type: 'polygon', points: [[0, 0], [100, 0], [100, 100], [0, 100]] }, { id: 'disk', type: 'circle', x: 50, y: 50, r: 40 }]) {
    const b = makeBall(50, 50, 12, 30, 6), speed = Math.hypot(b.vx, b.vy);
    assert(collideTargets(b, [shape]));
    assert.equal(overlapsTarget(b, shape), false, 'embedded centre fully expelled');
    near(Math.hypot(b.vx, b.vy), speed, 'embedded speed');
    assert(Number.isFinite(b.x + b.y));
  }
  const b = makeBall(-2, -2, 100, 100, 4);
  collideTargets(b, [rect('corner', 0, 0, 30, 30)]);
  assert(b.vx < 0 && b.vy < 0, 'real corner reflects both axes');
});

test('adjoining hull sectors and separate bricks have no false seam normal', () => {
  for (const grouped of [true, false]) for (const x of [49, 50, 51]) {
    const halves = [rect('left', 0, 0, 50, 50), rect('right', 50, 0, 50, 50)];
    const targets = grouped ? [{ id: 'compound', shapes: halves }] : halves;
    const b = makeBall(x, 52, 20, -100, 4);
    collideTargets(b, targets);
    near(b.vx, 20, 'flat face horizontal velocity');
    near(b.vy, 100, 'flat face rebound');
  }
  const b = makeBall(50, 25, 0, 100, 4), target = { id: 'embedded-seam', shapes: [rect('', 0, 0, 50, 50), rect('', 50, 0, 50, 50)] };
  collideTargets(b, [target]);
  assert.equal(overlapsTarget(b, target), false, 'inside a shared face exits the union, not into its neighbour');
});

test('a concave inner corner resolves both exposed faces without extra damage or speed gain', () => {
  for (const grouped of [true, false]) {
    const sectors = [rect('a', 0, 0, 100, 100), rect('b', 50, 50, 100, 100)];
    const targets = grouped ? [{ id: 'L-hull', shapes: sectors }] : sectors;
    const b = makeBall(105, 45, -100, 100, 8), speed = Math.hypot(b.vx, b.vy), hits = [];
    collideTargets(b, targets, id => hits.push(id));
    assert(targets.every(target => !overlapsTarget(b, target)), 'both faces are clear in the same substep');
    assert(b.vx > 0 && b.vy < 0, 'the two incoming components rebound away from the corner');
    near(Math.hypot(b.vx, b.vy), speed, 'corner speed remains stable');
    assert.equal(hits.length, grouped ? 1 : 2, 'solver passes never duplicate a damage episode');
  }
});

test('piercing damage counts one episode until exit/reentry and solid materials still bounce', () => {
  for (const power of ['fire', 'titan']) {
    const b = makeBall(50, 50, 0, -50, 5); b[power] = power === 'fire' ? true : 7;
    const target = rect('armour', 0, 0, 100, 100, { pierceable: true }), hits = [];
    for (let i = 0; i < 10; i++) collideTargets(b, [target], id => hits.push(id));
    assert.equal(hits.length, 1, `${power}: repeated overlap suppressed`);
    b.y = 120; collideTargets(b, [target]);
    b.y = 50; collideTargets(b, [target], id => hits.push(id));
    assert.equal(hits.length, 2, 'a full exit permits another hit');
    const guard = rect('barrier', 0, 0, 100, 10, { pierceable: false });
    Object.assign(b, { x: 50, y: 12, vx: 0, vy: -100 });
    collideTargets(b, [guard]); assert(b.vy > 0);
  }
});

test('fresh snapshots keep episode IDs and dead/trigger callbacks cannot cause extra hits', () => {
  const b = makeBall(50, 50, 0, -50, 5); b.fire = true;
  let hits = 0;
  for (let i = 0; i < 5; i++) collideTargets(b, [rect('same', 0, 0, 100, 100)], () => hits++);
  assert.equal(hits, 1, 'snapshot object identity is not the episode key');
  const dying = rect('dying', 0, 0, 100, 100), before = hits;
  collideTargets(b, [dying], (id, ball, target) => { hits++; target.active = false; return false; });
  for (let i = 0; i < 5; i++) collideTargets(b, [dying], () => hits++);
  assert.equal(hits, before + 1);
  const shot = { id: 'bolt', type: 'circle', x: 50, y: 50, r: 2, solid: false };
  b.fire = false; const vy = b.vy;
  collideTargets(b, [shot], () => false);
  assert.equal(shot.active, false); assert.equal(b.vy, vy, 'interception does not rebound the ball');
  const normal = makeBall(50, 12, 0, -100, 3), lastHP = rect('last', 0, 0, 100, 10);
  collideTargets(normal, [lastHP], () => false);
  assert(normal.vy > 0, 'lastHP normal impact still rebounds');
  assert.equal(lastHP.active, false);
});

test('swept laser queries agree with holes, moving circles and corners without side effects', () => {
  const target = rect('thin', 40, 40, 20, .1), before = structuredClone(target);
  const hit = sweepTarget({ x: 50, y: 100 }, { x: 50, y: -100 }, 2, target);
  assert(hit && hit.t > .28 && hit.t < .30 && hit.ny > 0);
  assert.deepEqual(target, before);
  assert.equal(sweepTarget({ x: 10, y: 100 }, { x: 10, y: -100 }, 2, target), null);
  const moving = { id: 'moving-circle', type: 'circle', x: 0, y: 50, r: 2, vx: 100 };
  assert(sweepTarget({ x: 50, y: 50 }, { x: 50, y: 50 }, 3, moving, 0, 1));
  const poly = { id: 'hole', type: 'polygon', points: [[0, 0], [100, 0], [100, 100], [0, 100]], holes: [[[20, 20], [80, 20], [80, 80], [20, 80]]] };
  assert.equal(sweepTarget({ x: 50, y: 30 }, { x: 50, y: 70 }, 2, poly), null, 'ray stays inside the clear opening');
  assert(sweepTarget({ x: -20, y: -20 }, { x: 10, y: 10 }, 2, rect('corner', 0, 0, 20, 20)));
});

test('callbacks can deactivate another compound target before its pending damage dispatch', () => {
  const b = makeBall(50, 50, 0, -100, 5); b.fire = true;
  const first = rect('first', 0, 0, 100, 100), second = { id: 'second', shapes: [rect('', 0, 0, 100, 100), rect('', 10, 10, 80, 80)] };
  const hits = [];
  collideTargets(b, [first, second], id => { hits.push(id); second.active = false; return false; });
  assert.deepEqual(hits, ['first']);
  collideTargets(b, [first, second, rect('zero-hp', 0, 0, 100, 100, { hp: 0 })], () => { throw new Error('dead target dispatched'); });
  assert.equal(overlapsTarget(b, second), false);
  assert.equal(sweepTarget({ x: 50, y: 150 }, { x: 50, y: 0 }, 3, second), null);
});

test('aim simulation does not mutate live targets or share live-ball episode state', async () => {
  globalThis.Image = class { complete = true; naturalWidth = 1; decode() { return Promise.resolve(); } };
  globalThis.localStorage = { getItem() { return null; }, setItem() {} };
  const { Arena } = await import('../src/arena.js');
  const level = new Arena(360, 729), target = rect('live-hp', 0, 100, 360, 10, { hp: 3, vx: 50 });
  level.balls[0].x = 180; level.balls[0].y = 200; level.aim.angle = 0;
  let hits = 0;
  level.world = () => ({ ...world([target]), onTarget: () => { hits++; target.hp--; } });
  const before = structuredClone(target), draw = new Proxy({ globalAlpha: 1 }, { get: (o, k) => k in o ? o[k] : () => {} });
  level.drawAim(draw); level.drawAim(draw);
  assert.equal(hits, 0); assert.deepEqual(target, before, 'preview cannot mutate HP, active or velocity');
  const ball = level.balls[0]; Object.assign(ball, { x: 180, y: 112, caught: false, vx: 0, vy: -100 });
  collideTargets(ball, [target], () => hits++);
  assert.equal(hits, 1, 'live ball still owns a fresh contact episode');
});
