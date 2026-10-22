import test from 'node:test';
import assert from 'node:assert/strict';
import { LAYOUT, BANKS, MODE, POCKET, bankFor } from '../src/mooncoil-layout.js';

const inside = (c, r) => c >= POCKET.c0 && c <= POCKET.c1 && r >= POCKET.r0 && r <= POCKET.r1;
const breakable = s => 'bcvtg'.includes(s);
const neighbour = k => {
  const c = k % 20, r = Math.floor(k / 20);
  return [[c, r + 1], [c + 1, r], [c - 1, r], [c, r - 1]].filter(([x, y]) => x >= 0 && x < 20 && y >= 0 && y < 20).map(([x, y]) => y * 20 + x);
};
function shortest(cost) {
  const start = 1 * 20 + 16; // streamingCells() starts the head at(16,1).
  const distance = Array(400).fill(Infinity), queue = [start]; distance[start] = 0;
  while (queue.length) {
    queue.sort((a, b) => distance[a] - distance[b]);
    const k = queue.shift(), c = k % 20, r = Math.floor(k / 20);
    if (inside(c, r)) return distance[k];
    for (const n of neighbour(k)) {
      const s = LAYOUT[Math.floor(n / 20)][n % 20];
      if (s === '#') continue;
      const next = distance[k] + cost(s);
      if (next < distance[n]) { distance[n] = next; if (!queue.includes(n)) queue.push(n); }
    }
  }
  return Infinity;
}

test('Mooncoil map has exact pocket, three24-cell access clusters and only meaningful guard bricks', () => {
  assert.equal(LAYOUT.length, 20);
  LAYOUT.forEach(row => assert.match(row, /^[.#=bcvtg]{20}$/));
  assert.deepEqual(POCKET, { c0: 1, c1: 6, r0: 6, r1: 8 });
  const count = [0, 0, 0]; let guards = 0, gold = 0;
  LAYOUT.forEach((row, r) => [...row].forEach((s, c) => {
    assert.equal(s === '=', inside(c, r));
    if (!breakable(s)) return;
    const bank = bankFor(c, r);
    if (bank >= 0) { count[bank]++; assert(s === BANKS[bank].color || s === 'g'); }
    else {
      assert.equal(s, 'v'); guards++;
      assert(([2, 8, 12].includes(r) && c >= 9) || (c === 7 && r >= 6 && r <= 8) || (r === 9 && c >= 1 && c <= 7));
    }
    if (s === 'g') gold++;
  }));
  assert.deepEqual(count, [24, 24, 24]); assert.equal(guards, 43); assert.equal(gold, 3);
  assert.deepEqual(Object.values(MODE).map(m => m.cageHP), [6, 8, 10]);
  assert.deepEqual(Object.values(MODE).map(m => m.charge), [10, 12, 14]);
  for (const m of Object.values(MODE)) assert.equal(m.quota, undefined);
});

test('Fresh snake must wind31steps around spine and chew five real cells', () => {
  assert.equal(shortest(() => 1), 31);
  assert.equal(shortest(s => breakable(s) ? 1 : 0), 5);
  const seconds = shortest(s => s === 'v' || s === 't' ? 3.45 : breakable(s) ? 2.1 : .32);
  assert(seconds / MODE.easy.speed >= 55, `fresh Easy path cost ${seconds / MODE.easy.speed}s`);
  assert(Number.isFinite(seconds));
  assert.equal(shortest(s => breakable(s) ? Infinity : 1), Infinity);
});

test('Each bank has a broad normal-ball approach after visible guard breakage, with no granite tunnel', () => {
  // Radius6 circle,2u flood: only the declared checkpoint bricks are removed.
  // Other banks/cage/granite remain solid. This proves progressive access, not a victory policy.
  const solids = [];
  LAYOUT.forEach((row, r) => [...row].forEach((s, c) => {
    if (s !== '.' && !(s === 'v' && bankFor(c, r) < 0)) solids.push({ c, r, x: 20 + c * 16, y: 96 + r * 16 });
  }));
  const clear = (x, y) => !solids.some(b => Math.hypot(x - Math.max(b.x, Math.min(b.x + 16, x)), y - Math.max(b.y, Math.min(b.y + 16, y))) < 5.999);
  const width = 155, height = 166, seen = new Uint8Array(width * height), q = [];
  for (let x = 0; x < width; x++) { const k = (height - 1) * width + x; seen[k] = 1; q.push(k); }
  for (let i = 0; i < q.length; i++) {
    const k = q[i], x = k % width, y = Math.floor(k / width);
    for (const [xx, yy] of [[x + 1, y], [x - 1, y], [x, y - 1], [x, y + 1]]) {
      const n = yy * width + xx;
      if (xx < 0 || xx >= width || yy < 0 || yy >= height || seen[n] || !clear(26 + xx * 2, 102 + yy * 2)) continue;
      seen[n] = 1; q.push(n);
    }
  }
  BANKS.forEach((b, i) => {
    let exposed = 0;
    for (let c = b.c0; c <= b.c1; c++) {
      const x = 20 + c * 16 + 8, y = 96 + (b.r1 + 1) * 16 + 6;
      if (seen[((y - 102) / 2) * width + (x - 26) / 2]) exposed++;
    }
    assert(exposed >= 6, `bank${i} exposes only${exposed} bottom cells`);
  });
  assert(LAYOUT.slice(18).every(row => row === '.'.repeat(20)));
});

test('Cleared access clusters and apron connect left Lumi pocket to the lower return lane', () => {
  const start = 8 * 20 + 3, q = [start], seen = new Set(q);
  for (let i = 0; i < q.length; i++) for (const n of neighbour(q[i])) {
    const s = LAYOUT[Math.floor(n / 20)][n % 20];
    if (s === '#' || seen.has(n)) continue;
    seen.add(n); q.push(n);
  }
  assert([...seen].some(k => Math.floor(k / 20) === 19));
  assert.equal(bankFor(3, 9), -1, 'left rescue apron is distinct from access clusters');
});

test('A straight central serve meets real armour before any cage access', () => {
  const c = 10, first = [...LAYOUT].map((row, r) => ({ s: row[c], r })).reverse().find(p => p.s !== '.');
  assert.deepEqual(first, { s: 'v', r: 12 });
  assert(c > POCKET.c1, 'central launch is horizontally outside Lumi’s left cage');
});
