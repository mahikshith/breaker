import test from 'node:test';
import assert from 'node:assert/strict';
import { createSerpentRetreat, sampleSerpentRetreat } from '../src/serpent-retreat.js';
import { serpentRibbon } from '../src/serpent-capture.js';

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const length = points => points.slice(1).reduce((n, p, i) => n + distance(points[i], p), 0);
const ordinaryPoints = [
  [156, 168], [140, 168], [124, 168], [124, 152], [124, 136], [140, 136],
  [156, 136], [172, 136], [188, 136], [204, 136], [220, 136], [236, 136]
].map(([x, y]) => ({ x, y }));
const ordinaryHistory = [...Array.from({ length: 13 }, (_, i) => ({ x: 284, y: -56 + i * 16 })), { x: 268, y: 136 }, { x: 252, y: 136 }];
const normal = () => createSerpentRetreat({ points: ordinaryPoints, history: ordinaryHistory, heading: 0, faceLeft: false });
const intro = () => createSerpentRetreat({ points: Array.from({ length: 12 }, (_, i) => ({ x: 284, y: 120 - i * 16 })), heading: Math.PI / 2, faceLeft: true });
const long = () => createSerpentRetreat({ points: Array.from({ length: 20 }, (_, i) => ({ x: 284, y: 424 - i * 16 })),
  history: Array.from({ length: 11 }, (_, i) => ({ x: 284, y: -56 + i * 16 })), heading: Math.PI / 2, faceLeft: true, turnSide: -1 });

function atTravel(retreat, distance) {
  let lo = 0, hi = retreat.duration;
  for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (sampleSerpentRetreat(retreat, mid).travelled < distance) lo = mid; else hi = mid; }
  return sampleSerpentRetreat(retreat, (lo + hi) / 2);
}

function segmentDistance(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y, length2 = dx * dx + dy * dy;
  const t = length2 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / length2)) : 0;
  return distance(p, { x: a.x + dx * t, y: a.y + dy * t });
}

test('handover is the exact existing full ribbon including tail, heading and native atlas family', () => {
  for (const make of [normal, intro, long]) {
    const r = make(), p = sampleSerpentRetreat(r, 0);
    assert.deepEqual(p.points, r.source.points); assert.equal(p.heading, r.heading);
    assert.equal(p.faceBlend, r.faceLeft ? 1 : 0); assert.equal(p.alpha, 1); assert.equal(p.done, false);
    assert(Math.abs(length(p.points) - r.source.length) < 1e-9);
  }
  assert.deepEqual(normal().source.points, serpentRibbon(ordinaryPoints).points);
});

test('head first moves forward through a compact U-turn and then follows its own body toward the tail', () => {
  for (const make of [normal, intro, long]) {
    const r = make(), first = sampleSerpentRetreat(r, .05), h = r.source.points[0];
    assert((first.head.x - h.x) * Math.cos(r.heading) + (first.head.y - h.y) * Math.sin(r.heading) > 0);
    const joined = atTravel(r, r.turnLength + 1), original = r.source.points;
    const nearest = original.reduce((a, b) => distance(b, joined.head) < distance(a, joined.head) ? b : a);
    assert(distance(nearest, joined.head) < 3);
    const end = sampleSerpentRetreat(r, r.duration);
    assert(end.head.y < r.tunnel.y && Math.abs(end.head.x - r.tunnel.x) < 1e-9);
  }
});

test('every sampled full body conserves length and has no detached or vanishing segment', () => {
  for (const make of [normal, intro, long]) {
    const r = make();
    let previous = sampleSerpentRetreat(r, 0);
    for (let frame = 1; frame <= Math.ceil(r.duration * 120); frame++) {
      const p = sampleSerpentRetreat(r, Math.min(frame / 120, r.duration));
      assert(Math.abs(length(p.points) - r.source.length) < 1e-7);
      assert(distance(p.head, previous.head) < r.peakSpeed / 120 + .02);
      assert(distance(p.points.at(-1), previous.points.at(-1)) < r.peakSpeed / 120 + .02);
      assert(p.travelled >= previous.travelled); assert.equal(p.alpha, 1);
      assert(p.points.every(q => Number.isFinite(q.x) && Number.isFinite(q.y)));
      for (let i = 1; i < p.points.length; i++) assert(distance(p.points[i - 1], p.points[i]) < 4.1);
      previous = p;
    }
  }
});

test('return corridor uses actual body and reversed history; corner rounding cannot cut across the field', () => {
  const r = normal(), corridor = r.source.points.concat(ordinaryHistory.slice().reverse());
  for (let s = r.turnLength; s < r.mouthDistance; s += 1) {
    const p = atTravel(r, s).head;
    const nearest = Math.min(...corridor.slice(1).map((b, i) => segmentDistance(p, corridor[i], b)));
    assert(nearest < 3.01, 'only local rounding inside the travelled corridor');
  }
  const mouth = atTravel(r, r.mouthDistance).head;
  assert(Math.abs(mouth.x - 284) <= 15 && mouth.y <= 88 + 1e-8);
});

test('head enters original tunnel before tail; no fading hides an exposed body and done waits for full exit', () => {
  for (const make of [normal, intro, long]) {
    const r = make(), entering = atTravel(r, r.mouthDistance + 1);
    assert(entering.head.y < 88); assert(entering.points.some(p => p.y >= 88));
    assert.equal(entering.done, false); assert.equal(entering.alpha, 1);
    const end = sampleSerpentRetreat(r, r.duration);
    assert(end.done && end.insideTunnel); assert(end.points.every(p => p.y < 76));
    assert.deepEqual(end, sampleSerpentRetreat(r, r.duration + 10));
  }
});

test('travel orientation is continuous and both atlas rows point exactly along actual travel', () => {
  for (const make of [normal, intro, long]) {
    const r = make();
    let previous = sampleSerpentRetreat(r, 0);
    for (let t = 1 / 240; t <= r.duration; t += 1 / 240) {
      const p = sampleSerpentRetreat(r, t);
      assert(Math.abs(p.heading - previous.heading) < .8, 'no heading snap at corridor corners');
      const error = a => Math.abs(Math.atan2(Math.sin(a - p.heading), Math.cos(a - p.heading)));
      assert(error(p.rightRotation) < 1e-10);
      assert(error(p.leftRotation + Math.PI) < 1e-10);
      assert(p.faceBlend >= 0 && p.faceBlend <= 1);
      previous = p;
    }
  }
});

test('vertical tunnel travel retains the last native facing instead of a permanent double-faced blend', () => {
  for (const make of [normal, intro, long]) {
    const r = make(), final = sampleSerpentRetreat(r, r.duration);
    assert(final.faceBlend === 0 || final.faceBlend === 1);
    let family = null;
    for (let s = r.mouthDistance + 24; s < r.travel.length; s += 1) {
      const p = atTravel(r, s);
      assert(Math.abs(Math.cos(p.heading)) < 1e-8);
      assert(p.faceBlend === 0 || p.faceBlend === 1, 'one skull on the long straight tunnel');
      assert(Math.abs(p.rotation) <= Math.PI / 2 + 1e-10, 'final native head remains upright');
      family ??= p.faceBlend;
      assert.equal(p.faceBlend, family);
    }
    for (let i = 1; i < r.travel.points.length; i++) {
      if (r.faces[i] > 0 && r.faces[i] < 1) {
        assert(r.travel.arc[i] < r.mouthDistance + 6, 'blending is limited to real facing transitions');
      }
    }
  }
});

test('snapshot/sample are pure, duration is bounded, incomplete history is explicit', () => {
  const input = JSON.stringify({ ordinaryPoints, ordinaryHistory }), r = normal(), saved = JSON.stringify(r);
  for (let t = -.2; t < 6; t += .1) sampleSerpentRetreat(r, t);
  assert.equal(JSON.stringify(r), saved); assert.equal(JSON.stringify({ ordinaryPoints, ordinaryHistory }), input);
  for (const make of [normal, intro, long]) assert(make().duration >= 4 && make().duration <= 5);
  assert.throws(() => createSerpentRetreat({ points: ordinaryPoints, heading: 0 }), /original tunnel/);
});
