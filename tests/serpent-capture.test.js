import test from 'node:test';
import assert from 'node:assert/strict';
import { createSerpentCapture, sampleSerpentCapture, SERPENT_CAPTURE } from '../src/serpent-capture.js';

const length = points => points.slice(1).reduce((n, p, i) => n + Math.hypot(p.x - points[i].x, p.y - points[i].y), 0);
const delta = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const mirror = (p, side) => ({ x: 180 + (p.x - 180) * side, y: p.y });
const source = [
  { x: 143, y: 170 }, { x: 128, y: 168 }, { x: 112, y: 168 }, { x: 112, y: 152 },
  { x: 112, y: 136 }, { x: 128, y: 136 }, { x: 144, y: 136 }, { x: 160, y: 136 },
  { x: 176, y: 136 }, { x: 192, y: 136 }, { x: 208, y: 136 }, { x: 224, y: 136 }
];
const fixture = (side = 1) => createSerpentCapture({ points: source.map(p => mirror(p, side)), x: 180 + side * 20,
  centerX: 180 + side * 16, feet: 191, side, rotation: side * .15 });

test('handover reproduces every existing Catmull control point and the complete extended tail', () => {
  for (const side of [1, -1]) {
    const capture = fixture(side), start = sampleSerpentCapture(capture, 1.22);
    assert.deepEqual(start.points, capture.source.points);
    for (let i = 0; i < source.length; i++) assert.deepEqual(start.points[i * 8], mirror(source[i], side));
    const a = mirror(source.at(-1), side), b = mirror(source.at(-2), side);
    assert.deepEqual(start.points.at(-1), { x: a.x + (a.x - b.x) * .6, y: a.y + (a.y - b.y) * .6 });
    assert.deepEqual(start.head, mirror(source[0], side));
    assert.equal(start.x, 180 + side * 20); assert.equal(start.feet, 191); assert.equal(start.lift, 0);
    assert.equal(start.rotation, side * .15); assert.equal(start.laugh, 0); assert.deepEqual(start.frontPaths, []);
  }
});

test('sampled timeline conserves full body length, with a continuous head-led path and no distant joins', () => {
  for (const side of [1, -1]) {
    const c = fixture(side);
    let previous = sampleSerpentCapture(c, 1.22);
    for (let frame = 1; frame <= 180; frame++) {
      const pose = sampleSerpentCapture(c, 1.22 + frame / 60);
      assert(Math.abs(length(pose.points) - c.source.length) < 1e-8, 'no body growth or disappearing tail');
      assert(pose.travelled >= previous.travelled);
      assert(delta(pose.head, previous.head) < 4, 'no head teleport between phone frames');
      assert(delta(pose.points.at(-1), previous.points.at(-1)) < 4, 'tail follows instead of morphing');
      assert(Math.abs(pose.rotation - previous.rotation) < .8, 'no facing/rotation flip');
      for (let i = 1; i < pose.points.length; i++) assert(delta(pose.points[i], pose.points[i - 1]) < 4.1);
      previous = pose;
    }
  }
});

test('body follows actual earlier head positions instead of all points moving toward a final coil', () => {
  const c = fixture(), pose = sampleSerpentCapture(c, 1.65);
  const travelled = pose.travelled;
  assert(travelled > 0 && travelled < c.source.length);
  for (let i = 1; i < c.source.points.length; i++) {
    if (c.source.arc[i] < c.source.length - travelled) {
      assert(pose.points.some(p => delta(p, c.source.points[i]) < 1e-9), 'unreached original body remains exactly on its path');
    }
  }
  const later = sampleSerpentCapture(c, 1.9);
  assert(later.points.some(p => delta(p, pose.head) < 1.7), 'later body passes through the earlier head position');
});

test('front paths are true travelled lower arcs; face and crown remain above all front occlusion', () => {
  for (const side of [1, -1]) {
    const c = fixture(side);
    for (let time = 1.22; time <= 4.2; time += 1 / 120) {
      const pose = sampleSerpentCapture(c, time);
      for (const path of pose.frontPaths) {
        assert(path.length >= 2);
        for (const p of path) {
          assert(p.y >= c.coilY - 1e-8 && p.y <= c.coilY + c.ry + 1e-8);
          assert(Math.abs(p.x - c.centerX) <= c.rx + 1e-8);
          assert(p.y - 4 > pose.feet - 29, 'front ribbon cannot cover Lumi face');
        }
      }
    }
    const held = sampleSerpentCapture(c, 2.85);
    assert.equal(held.frontPaths.length, 1); assert(length(held.frontPaths[0]) > 45);
    assert(Math.abs(held.head.x - held.x) >= 34, 'head beside, rather than over, Lumi face');
    assert.equal(held.feet, 183); assert.equal(held.settle, 1);
  }
});

test('head travel retains its tangent while side-view sprite roll stays upright and yaw faces Lumi', () => {
  for (const side of [1, -1]) {
    const c = fixture(side);
    for (let time = 1.4; time < 2.53; time += .01) {
      const a = sampleSerpentCapture(c, time), b = sampleSerpentCapture(c, time + .0001);
      const heading = Math.atan2(b.head.y - a.head.y, b.head.x - a.head.x);
      assert(Math.abs(Math.atan2(Math.sin(heading - a.headAngle), Math.cos(heading - a.headAngle))) < .12);
      assert(Math.abs(a.rotation) <= .5);
      assert(a.faceBlend >= 0 && a.faceBlend <= 1);
      if (a.head.x < a.x - 6) { assert.equal(a.faceBlend, 0); assert.equal(a.faceLeft, false); }
      if (a.head.x > a.x + 6) { assert.equal(a.faceBlend, 1); assert.equal(a.faceLeft, true); }
    }
    const held = sampleSerpentCapture(c, 2.85);
    assert(Math.cos(held.headAngle) * side > .99, 'held face looks toward the captive');
  }
});

test('final neck supports the rear skull, preserving head endpoint, finish time and upright yaw', () => {
  for (const side of [1, -1]) {
    const capture = fixture(side);
    const held = sampleSerpentCapture(capture, 2.55);
    assert.deepEqual(held.head, { x: capture.centerX - side * 35, y: 153 });
    assert.deepEqual(capture.neckAnchor, { x: held.head.x - side * 18, y: held.head.y + 6 });
    assert(held.points.some(p => delta(p, capture.neckAnchor) < 1e-9), 'rear skull has actual continuous ribbon support');
    const rearIndex = held.points.findIndex(p => delta(p, capture.neckAnchor) < 1e-9);
    const near = held.points.slice(1, rearIndex + 1).filter(p => delta(p, held.head) > 2);
    assert(near.length > 5);
    assert(near.every(p => (p.x - held.head.x) * side < 0 && p.y >= held.head.y), 'neck enters from behind, not under front jaw');
    assert(held.points.every(p => Math.abs(p.x - capture.centerX) <= 80), 'rear extension stays in the cage-side assembly');
    assert.equal(held.turn, 1); assert.equal(held.finished, false);
    assert(Math.abs(length(held.points) - capture.source.length) < 1e-8);
    let previous = sampleSerpentCapture(capture, 1.22);
    let partial = 0;
    for (let time = 1.22 + 1 / 240; time <= 4.2; time += 1 / 240) {
      const p = sampleSerpentCapture(capture, time);
      assert(Math.abs(p.rotation) <= .5, 'never rolls upside down');
      assert(Math.abs(p.rotation - previous.rotation) < .12, 'roll is smooth across atlas yaw');
      assert(Math.abs(p.faceBlend - previous.faceBlend) < .18, 'left/right transition has no hard row flip');
      if (p.faceBlend > .01 && p.faceBlend < .99) partial++;
      previous = p;
    }
    assert(partial > 10, 'renderer receives real intermediate yaw weights');
  }
});

test('lift/settle and separate laugh envelope are bounded, ending is stable and sampling is pure', () => {
  const c = fixture(), before = JSON.stringify(c);
  for (let time = 0; time <= 5; time += .005) {
    const p = sampleSerpentCapture(c, time);
    for (const value of [p.turn, p.lift, p.settle, p.laugh]) assert(value >= 0 && value <= 1);
    assert(p.scale >= .965 && p.scale <= 1); assert(Math.abs(p.bodyTilt) <= .07);
    assert(p.feet >= 183 && p.feet <= 191);
  }
  assert.equal(sampleSerpentCapture(c, 2.64).laugh, 0);
  assert.equal(sampleSerpentCapture(c, 3).laugh, 1);
  assert.equal(sampleSerpentCapture(c, 4.2).laugh, 0);
  assert.equal(sampleSerpentCapture(c, 4.19).finished, false);
  assert.equal(sampleSerpentCapture(c, SERPENT_CAPTURE.endAt).finished, true);
  assert.deepEqual(sampleSerpentCapture(c, 4.2), sampleSerpentCapture(c, 8));
  assert.equal(JSON.stringify(c), before);
});

test('mirror approaches and alternate captured body routes remain bounded with no data mutation', () => {
  for (const side of [1, -1]) {
    const points = source.map(p => mirror({ x: p.x - 9, y: p.y + 10 }, side)), input = JSON.stringify(points);
    const c = createSerpentCapture({ points, x: 180 + side * 24, centerX: 180 + side * 18, feet: 191, side });
    for (let t = 1.22; t < 4.21; t += .01) {
      const p = sampleSerpentCapture(c, t);
      assert(p.points.every(q => q.x > 85 && q.x < 275 && q.y > 120 && q.y < 200));
      assert(Math.abs(length(p.points) - c.source.length) < 1e-8);
    }
    assert.equal(JSON.stringify(points), input);
  }
});
