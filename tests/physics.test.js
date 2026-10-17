import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGrid, makeBall, stepBall, collidePaddle, floodEmpty } from '../src/physics.js';

const world = (grid, extra = {}) => ({ grid, left: 0, right: 400, top: 0, bottom: 1000, ...extra });
function wallRow(row = 10) {
  const G = makeGrid(40, 30, 10, 10);
  for (let c = 0; c < 40; c++) G.cells[row * 40 + c] = 1;
  return G;
}

test('flat wall of small bricks bounces like a flat wall, even across seams', () => {
  for (const x of [100, 105, 109.9, 110]) { // 110 is exactly on a seam
    const G = wallRow();
    const b = makeBall(x, 150, 60, -200, 5);
    for (let i = 0; i < 60; i++) stepBall(b, 1 / 120, world(G));
    assert.ok(b.vy > 0, `bounced back down at x=${x}`);
    assert.ok(Math.abs(b.vx - 60) < 1e-6, `horizontal speed kept at x=${x} (got ${b.vx})`);
  }
});

test('a very fast ball cannot tunnel through a one-brick wall', () => {
  const G = wallRow();
  const b = makeBall(200, 150, 0, -3000, 5);
  for (let i = 0; i < 30; i++) stepBall(b, 1 / 120, world(G));
  assert.ok(b.y > 110, 'still below the wall');
});

test('hits report each brick touched', () => {
  const G = wallRow();
  const hits = [];
  const b = makeBall(200, 150, 0, -200, 5);
  for (let i = 0; i < 60; i++) stepBall(b, 1 / 120, world(G, { onHit: (c, r) => hits.push([c, r]) }));
  assert.ok(hits.some(([c, r]) => c === 20 && r === 10));
});

test('paddle edge sends the ball out at an angle, centre straight up', () => {
  const p = { x: 200, y: 900, w: 80, h: 12, vx: 0 };
  const centre = makeBall(200, 897, 0, 300);
  collidePaddle(centre, p);
  assert.ok(Math.abs(centre.vx) < 1e-9 && centre.vy < 0);
  const edge = makeBall(238, 897, 0, 300);
  collidePaddle(edge, p);
  assert.ok(edge.vx > 200 && edge.vy < 0);
});

test('flood fill finds connected empty cells only', () => {
  const G = wallRow(5);
  const { seen } = floodEmpty(G, 0, 0);
  assert.equal(seen[4 * 40], 1);
  assert.equal(seen[6 * 40], 0);
});
