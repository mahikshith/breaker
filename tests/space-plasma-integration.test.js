import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ART } from '../src/vault-art.js';
import { circuitData } from '../tools/relay-circuit/data.mjs';
globalThis.Image = class { complete = true; naturalWidth = 256; naturalHeight = 256; decode() { return Promise.resolve(); } };
ART.spaceWeapons = { shot: 'shot', impact: 'impact' };
const { Relay } = await import('../src/relay.js'), { Orbital } = await import('../src/orbital.js');
const forge = JSON.parse(readFileSync(new URL('../assets/orbital-forge/manifest.json', import.meta.url)));
const make = (kind, mode, H, s) => kind === 'circuit' ? new Relay(360, H, s, mode, circuitData()) : new Orbital(360, H, s, mode, forge);
function fire(l, kind) {
  l.started = true; l.clock = 12; l.weaponRandom = l.volleyRandom = () => 0;
  if (kind === 'circuit') { l.nextAttack = l.clock; l.updateCircuit(0); } else { l.teachDone = true; l.warn(); }
  assert(l.attack); l.clock = (l.attack.started ?? l.attack.at) + l.attack.warning + .000001;
  if (kind === 'circuit') l.updateCircuit(0); else l.fire();
  return l.bolts[0];
}
const context = () => { const calls = [], g = new Proxy({ globalAlpha: 1 }, { get: (o, k) => o[k] ?? ((...a) => calls.push([k, ...a])), set: (o, k, v) => (o[k] = v, true) }); return { g, calls }; };

test('actual Circuit and Forge launches use selected heavy circle, real muzzle/clock and separate ship colours', () => {
  for (const kind of ['circuit', 'forge']) for (const mode of ['easy', 'medium', 'hard']) for (const [H, s] of [[729, 393 / 360], [785, 412 / 360]]) {
    const l = make(kind, mode, H, s), b = fire(l, kind); assert(b); assert.equal(l.bolts.length, 1); assert.equal(b.r, 9); assert.equal(b.kind, 'heavy'); assert.equal(b.colour, kind); assert.equal(b.bornAt, l.clock);
    assert(Math.hypot(b.x - b.from.x, b.y - b.from.y) <= b.r + 1e-8); assert.equal(Math.round(Math.hypot(b.vx, b.vy)), { easy: 440, medium: 520, hard: 600 }[mode]);
    const target = l.targets().find(t => t.id === b.id); assert(target); assert.equal(target.shapes[0].r, 9); assert.equal(target.solid, false);
  }
});

test('live Circuit and Forge bolt drawers use packed raster sprites without mutating combat or rendering flat stamps', () => {
  for (const kind of ['circuit', 'forge']) {
    const l = make(kind, 'easy', 729, 393 / 360), b = fire(l, kind), before = JSON.stringify(l.inspect()), { g, calls } = context();
    l.drawEnemyBolts(g); assert(calls.some(c => c[0] === 'drawImage')); assert(calls.some(c => c[0] === 'translate' && c[1] === b.x && c[2] === b.y)); assert(calls.some(c => c[0] === 'clip'));
    assert(!calls.some(c => ['arc', 'lineTo', 'createLinearGradient'].includes(c[0]))); assert.equal(JSON.stringify(l.inspect()), before);
  }
});
