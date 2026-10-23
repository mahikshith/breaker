// Steel-chamber reachability (src/fantasy/reach.js): open, banked-only and sealed chambers, plus the angle span.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chamberReach } from '../src/fantasy/reach.js';

const field = { left: 0, right: 360, top: 0 };
const from = [60, 120, 180, 240, 300].map(x => ({ x, y: 600 }));
// A 100x60 chamber at (200, 100) walled by 8-unit steel bars; open: which wall to leave out.
function box(open) {
  const c = { x: 200, y: 100, w: 100, h: 60 }, t = 8;
  const walls = { top: { x: c.x - t, y: c.y - t, w: c.w + 2 * t, h: t }, bottom: { x: c.x - t, y: c.y + c.h, w: c.w + 2 * t, h: t },
    left: { x: c.x - t, y: c.y, w: t, h: c.h }, right: { x: c.x + c.w, y: c.y, w: t, h: c.h } };
  return { chamber: c, bars: Object.entries(walls).filter(([k]) => k !== open).map(([, b]) => b) };
}

test('a chamber open at the bottom is reachable straight up', () => {
  const r = chamberReach({ field, from, ...box('bottom'), bounces: 0 });
  assert.ok(r.reachable);
  assert.ok(r.span > 6);
});

test('a sealed chamber is never reachable', () => {
  const { chamber, bars } = box('none');
  assert.ok(!chamberReach({ field, from, chamber, bars }).reachable);
});

test('a chamber open only at the top needs a bounce off the ceiling', () => {
  assert.ok(!chamberReach({ field, from, ...box('top'), bounces: 0 }).reachable);
  assert.ok(chamberReach({ field, from, ...box('top'), bounces: 1 }).reachable);
});

test('a gap narrower than the ball lets nothing in', () => {
  const c = { x: 150, y: 100, w: 60, h: 40 }, t = 8;
  const bars = [{ x: c.x - t, y: c.y - t, w: c.w + 2 * t, h: t }, { x: c.x - t, y: c.y, w: t, h: c.h }, { x: c.x + c.w, y: c.y, w: t, h: c.h },
    { x: c.x - t, y: c.y + c.h, w: 34, h: t }, { x: c.x - t + 44, y: c.y + c.h, w: c.w + 2 * t - 44, h: t }];
  assert.ok(!chamberReach({ field, from, chamber: c, bars, r: 6 }).reachable);
  assert.ok(chamberReach({ field, from, chamber: c, bars, r: 3 }).reachable);
});
