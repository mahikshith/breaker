import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGrid, makeBall, stepBall, collideGrid, collidePaddle, floodEmpty } from '../src/physics.js';

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

test('powered balls respect declared solid materials while piercing breakables', () => {
  for (const power of ['fire', 'titan']) for (const kind of [77, 88, 2]) {
    const G = wallRow();
    G.cells.fill(0);
    for (let c = 0; c < G.cols; c++) G.cells[10 * G.cols + c] = kind;
    G.unpierceable = [77, 88];
    const b = makeBall(200, 150, 0, -3000, power === 'titan' ? 10 : 6);
    b[power] = power === 'fire' ? true : 7;
    const hits = [];
    const previewGrid = { ...G, cells: G.cells.slice() };
    for (let i = 0; i < 3; i++) stepBall(b, 1 / 120, world(previewGrid, { onHit: (c, r) => hits.push([c, r]) }));
    assert.ok(hits.length, `${power} reported material ${kind}`);
    assert.ok(kind === 2 ? b.vy < 0 && b.y < 100 : b.vy > 0 && b.y > 110, `${power} material ${kind}`);
    assert.equal(G.cells[10 * G.cols + 20], kind, 'physics never destroys a cell');
  }
});

test('a grid without declared solid materials keeps armour pierceable', () => {
  for (const power of ['fire', 'titan']) {
    const G = wallRow();
    G.cells = G.cells.map(v => v ? 2 : 0);
    const b = makeBall(200, 150, 0, -3000, 6);
    b[power] = power === 'fire' ? true : 7;
    for (let i = 0; i < 3; i++) stepBall(b, 1 / 120, world(G));
    assert.ok(b.vy < 0 && b.y < 100, `${power} pierces undeclared armour`);
  }
});

test('a pierced neighbour does not flatten a solid corner bounce', () => {
  for (const power of ['fire', 'titan']) {
    const G = makeGrid(2, 1, 10, 10);
    G.cells.set([77, 2]); G.unpierceable = [77];
    const b = makeBall(10.5, 10.5, -100, -100, 3);
    b[power] = power === 'fire' ? true : 7;
    collideGrid(b, G);
    assert.ok(b.vx > 0 && b.vy > 0, `${power} reflects from the exposed corner`);
  }
});
