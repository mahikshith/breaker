import test from 'node:test';
import assert from 'node:assert/strict';
import { FuryContacts, VENOM, cageFrame, streamingCells, safeRecoilSteps, canWard, previewPartition, venomTarget } from '../src/serpent.js';

test('fury counts separate incoming contact episodes and rejects lingering, outward and simultaneous contacts', () => {
  const contacts = new FuryContacts(), a = {}, b = {};
  assert.equal(contacts.observe(a, true, true, 1), true);
  assert.equal(contacts.observe(a, true, true, 2), false);
  assert.equal(contacts.observe(b, true, true, 1.1), false);
  assert.equal(contacts.hits, 1);
  contacts.observe(a, false, false, 2);
  assert.equal(contacts.observe(a, true, false, 2), false);
  contacts.observe(a, false, false, 2.1);
  assert.equal(contacts.observe(a, true, true, 2.1), true);
  assert.equal(contacts.hits, 2);
  contacts.reset(); contacts.observe(b, false, false, 3);
  assert.equal(contacts.observe(b, true, true, 3, false), false);
  assert.equal(contacts.hits, 0);
});

test('the cage roof and both frame sides are protected independently of partition targets', () => {
  const pocket = { c0: 7, c1: 12, r0: 3, r1: 5 };
  for (let c = 6; c <= 13; c++) assert.equal(cageFrame({ c, r: 2 }, pocket), true);
  for (let r = 3; r <= 5; r++) for (const c of [6, 13]) assert.equal(cageFrame({ c, r }, pocket), true);
  for (const [c, r] of [[13, 1], [13, 6], [5, 2], [14, 4]]) assert.equal(cageFrame({ c, r }, pocket), false);
});

test('venom chooses a useful exposed partition and never shoots through bars', () => {
  const grid = { cols: 8, rows: 5, cw: 16, ch: 16, ox: 0, oy: 0, cells: new Uint8Array(40), bid: new Int16Array(40).fill(-1) };
  const make = (id, c, r, kind = 9) => ({ id, c, r, kind, n: 1, x: c * 16, y: r * 16, w: 16, h: 16 });
  const near = make(0, 2, 3), useful = make(1, 3, 1), bars = make(2, 1, 2, 8), bricks = [near, useful, bars];
  for (const br of [near, useful]) { grid.cells[br.r * 8 + br.c] = br.kind; grid.bid[br.r * 8 + br.c] = br.id; }
  const scene = { grid, bricks, head: { x: 8, y: 56 }, brickAt: (c, r) => bricks[grid.bid[r * 8 + c]], plan: () => ({ cost: grid.cells[11] ? 10 : 6 }) };
  const pocket = { c0: 20, c1: 25, r0: 20, r1: 22 }, original = [...grid.cells], bids = [...grid.bid];
  assert.equal(venomTarget(scene, pocket, 9, 8).br, useful);
  assert.deepEqual([...grid.cells], original); assert.deepEqual([...grid.bid], bids);
  grid.cells[17] = 8; // a bar on the ray, without a breakable brick object
  assert.equal(venomTarget(scene, pocket, 9, 8), null);
});

test('partition preview restores every grid cell and owner even if planning throws', () => {
  const grid = { cols: 3, cells: new Uint8Array([9, 9, 0]), bid: new Int16Array([4, 4, -1]) }, br = { c: 0, r: 0, n: 2 };
  assert.throws(() => previewPartition(grid, br, () => { assert.deepEqual([...grid.cells], [0, 0, 0]); throw new Error('planner'); }), /planner/);
  assert.deepEqual([...grid.cells], [9, 9, 0]); assert.deepEqual([...grid.bid], [4, 4, -1]);
});

test('streaming tail is continuous and recoil cannot move the active head into virtual tunnel rows', () => {
  const cells = streamingCells(); assert.equal(cells.length, 12); assert.equal(new Set(cells.map(p => p.join(','))).size, 12);
  assert.deepEqual(cells[0], [16, 1]); assert.deepEqual(cells.at(-1), [16, -10]);
  assert.equal(safeRecoilSteps(cells, 20, 9), 1);
  assert.equal(safeRecoilSteps([[14, 3], [14, 2], [15, 2], [16, 2]], 2, 6), 2);
});

test('ward requires the full charge and enough of the marked warning for the cast', () => {
  const v = { phase: 'warn', target: { br: {} }, ward: null, t: 0.4 };
  assert.equal(canWard('rescue', v, 1), true);
  assert.equal(canWard('rescue', v, 0.99), false);
  assert.equal(canWard('intro', v, 1), false);
  assert.equal(canWard('rescue', { ...v, t: VENOM.windup - VENOM.cast + 0.001 }, 1), false);
  assert.equal(canWard('rescue', { ...v, phase: 'breath' }, 1), false);
  assert.equal(canWard('rescue', { ...v, ward: {} }, 1), false);
  assert.equal(canWard('rescue', { ...v, target: null }, 1), false);
});
