import { test } from 'node:test';
import assert from 'node:assert/strict';

globalThis.Image = class { complete = true; naturalWidth = 1; width = 512; height = 768; decode() { return Promise.resolve(); } };
const prefs = new Map();
globalThis.localStorage = { getItem: k => prefs.get(k) ?? null, setItem: (k, v) => prefs.set(k, v) };
const gradient = { addColorStop() {} }, context = new Proxy({}, { get: (_, k) => k === 'createLinearGradient' ? () => gradient : () => {} });
globalThis.document = { createElement: () => ({ getContext: () => context }) };
const { Mooncoil } = await import('../src/mooncoil.js');
const { MODE, RIVAL } = await import('../src/mooncoil-layout.js');

function rescue(mode = 'easy') {
  const l = new Mooncoil(360, 729, 1, mode);
  l.state = 'play'; l.phase = 'rescue'; l.serve?.();
  return l;
}
const run = (l, secs) => { for (let i = 0; i < secs * 120; i++) l.updateLevel(1 / 120, 1 / 120); };
const untilGnash = l => { for (let i = 0; i < 90 * 120 && !l.gnash && l.state === 'play'; i++) l.updateLevel(1 / 120, 1 / 120); assert.ok(l.gnash, 'Gnash arrived'); };

test('Gnash is warned a full tell before he drops in, behind Mooncoil, from his own tunnel', () => {
  for (const mode of ['easy', 'medium', 'hard']) {
    const l = rescue(mode), { rivalAt } = MODE[mode];
    run(l, rivalAt - RIVAL.tell - .1);
    assert.equal(l.gnashWarnAt, null, `${mode}: no warning yet`);
    let warnedAt = null;
    for (let i = 0; i < 60 * 120 && !l.gnash; i++) {
      l.updateLevel(1 / 120, 1 / 120);
      if (warnedAt === null && l.gnashWarnAt !== null) warnedAt = l.rescueT;
    }
    assert.ok(l.gnash, `${mode}: arrived within a minute`);
    assert.ok(l.rescueT - warnedAt >= RIVAL.tell - 1e-6, `${mode}: warning comes a full tell first`);
    assert.equal(l.gnash.cells[0][0], RIVAL.column);
    assert.ok(!l.mooncoil.cells.some(([c, r]) => Math.abs(c - RIVAL.column) <= 1 && r <= 2), `${mode}: drops only once his mouth is clear`);
    assert.ok(Number.isFinite(l.gnash.start), `${mode}: he has a route to the cage`);
  }
});

test('a serpent blocked behind the other one waits instead of fighting', () => {
  const l = rescue();
  l.mooncoil.cells = [[9, 8], [9, 7], [9, 6], [9, 5]];
  l.gnash = l.newSnake([[9, 4], [9, 3], [9, 2], [9, 1]]);
  assert.equal(l.checkClash(), false, 'follower head next to the leader’s tail is not a clash');
  l.mooncoil.cells = [[10, 5], [10, 6], [10, 7]]; l.mooncoil.dir = l.gnash.dir = Math.PI / 2;
  l.gnash.cells = [[9, 5], [9, 4], [9, 3]];
  assert.equal(l.checkClash(), false, 'side by side in a wide gallery is not a clash');
});

test('a recoil that drives the leader back onto the follower starts a fight', () => {
  const l = rescue();
  l.mooncoil.cells = [[9, 6], [9, 5], [9, 4], [9, 3]]; l.mooncoil.dir = Math.PI / 2;
  l.gnash = Object.assign(l.newSnake([[9, 4], [9, 3], [9, 2]]), { dir: Math.PI / 2 });
  assert.equal(l.checkClash(), true);
});

test('each serpent plans around the other one’s body', () => {
  const l = rescue();
  l.gnash = Object.assign(l.newSnake(Array.from({ length: 12 }, (_, i) => [RIVAL.column, 1 - i])), { start: 1 });
  const blocked = new Set(l.mooncoil.cells.map(([c, r]) => `${c},${r}`));
  const path = l.withSnake(l.gnash, () => l.snakePlan().path);
  for (const k of path) assert.ok(!blocked.has(`${k % 20},${Math.floor(k / 20)}`), 'Gnash never routes through Mooncoil');
});

test('heads that meet clash: both reel back dizzy, a power-up drops, and the cooldown holds', () => {
  const l = rescue();
  // Gnash heading right meets Mooncoil heading left.
  l.gnash = Object.assign(l.newSnake([[12, 10], [11, 10], [10, 10], [9, 10]]), { dir: 0 }); l.gnash.hist = [[9, 9], [9, 8], [9, 7]];
  l.mooncoil.cells = [[13, 10], [14, 10], [15, 10], [16, 10]]; l.mooncoil.hist = [[17, 10], [18, 10], [19, 10]]; l.mooncoil.dir = Math.PI;
  const drops = l.drops.length;
  assert.equal(l.checkClash(), true);
  for (const s of [l.mooncoil, l.gnash]) assert.ok(s.stun >= RIVAL.clashStun - 1e-9, 'both dizzy');
  assert.notDeepEqual(l.mooncoil.cells[0], [13, 10], 'Mooncoil knocked back');
  assert.equal(l.drops.length, drops + 1, 'the fight sheds a power-up');
  for (const s of [l.mooncoil, l.gnash]) s.stun = 0;
  l.mooncoil.cells = [[13, 10], [14, 10]];
  assert.equal(l.checkClash(), false, 'cooldown prevents an immediate second clash');
});

test('breaking the cage sends both serpents home, head first', () => {
  const l = rescue();
  untilGnash(l);
  l.cageHP = 0; l.checkBreach();
  assert.equal(l.phase, 'escape');
  for (const s of l.rivals()) assert.ok(s.retreat, 'retreating');
});

test('Continue after a capture resets the cage and throws both serpents back', () => {
  const l = rescue();
  untilGnash(l);
  l.snake = l.gnash; l.gnash.attack = { t: 2, struck: 2 }; l.phase = 'caught';
  l.continueRun();
  assert.equal(l.phase, 'rescue');
  for (const s of l.rivals()) { assert.equal(s.attack, null); assert.ok(s.stun > 0); }
});
