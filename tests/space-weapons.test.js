import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ART } from '../src/vault-art.js';
import { drawEnemyBolt, drawPlayerBolt, drawEnemyImpact, drawWeaponCharge, drawPlayerMuzzle, nextEnemyVolley, enemyEscapeLane } from '../src/space-weapons.js';

globalThis.Image = class { complete = true; naturalWidth = 256; naturalHeight = 256; set src(v) { if (v === 'impact') { this.naturalWidth = 384; this.naturalHeight = 174; } } decode() { return Promise.resolve(); } };
ART.spaceWeapons = { shot: 'shot', impact: 'impact' };
const context = () => {
  const calls = [], g = new Proxy({ globalAlpha: 1 }, { get: (o, k) => o[k] ?? ((...a) => calls.push([k, ...a])), set: (o, k, v) => { calls.push(['set', k, v]); o[k] = v; return true; } });
  return { g, calls };
};

test('rendered plasma follows velocity, clips at the real muzzle plane and never mutates a projectile', () => {
  for (const [vx, vy] of [[0, 440], [300, 100], [-200, 440], [0, -560]]) {
    const b = Object.freeze({ x: 123, y: 234, vx, vy, r: 9, colour: 'forge', from: Object.freeze({ x: 120, y: 180 }) }), { g, calls } = context();
    drawEnemyBolt(g, b, .2);
    assert(calls.some(c => c[0] === 'translate' && c[1] === 123 && c[2] === 234));
    assert(calls.some(c => c[0] === 'rotate' && c[1] === Math.atan2(vy, vx) - Math.PI / 2));
    assert(calls.findIndex(c => c[0] === 'clip') < calls.findIndex(c => c[0] === 'drawImage'));
    const draw = calls.find(c => c[0] === 'drawImage'); assert.equal(draw.at(-2), 65); assert.equal(draw.at(-1), 65);
    assert(calls.some(c => c[0] === 'set' && c[1] === 'filter' && c[2] === 'hue-rotate(65deg)'));
    assert.equal(calls.filter(c => c[0] === 'save').length, calls.filter(c => c[0] === 'restore').length);
  }
});

test('source-raster muzzle and charge are short, pose-anchored effects without line or spoke substitutes', () => {
  for (const age of [-.01, 0, .139, .14, 1]) {
    const { g, calls } = context(); drawPlayerMuzzle(g, { x: 80, y: 160 }, Math.PI / 2, age);
    assert.equal(calls.filter(c => c[0] === 'drawImage').length, age >= 0 && age < .14 ? 1 : 0);
  }
  const { g, calls } = context(); drawWeaponCharge(g, { x: 80, y: 160 }, Math.PI / 2, .8, 'circuit');
  assert(calls.some(c => c[0] === 'translate' && c[1] === 80 && c[2] === 160)); assert.equal(calls.filter(c => c[0] === 'drawImage').length, 1);
  assert(!calls.some(c => ['arc', 'lineTo', 'createLinearGradient'].includes(c[0])));
});

test('paddle impact uses the approved single raster and ends at320ms; player shot keeps the approved37u source size', () => {
  for (const age of [-1, 0, .065, .319, .32, 1]) {
    const { g, calls } = context(); drawEnemyImpact(g, Object.freeze({ x: 80, y: 600, vx: 0, vy: 440, r: 9, colour: 'carrier' }), age);
    assert.equal(calls.filter(c => c[0] === 'drawImage').length, age >= 0 && age < .32 ? 1 : 0);
    assert(!calls.some(c => ['arc', 'lineTo', 'stroke'].includes(c[0])));
  }
  const { g, calls } = context(); drawPlayerBolt(g, Object.freeze({ x: 100, y: 500, vx: 0, vy: -560, r: 6.8 }), .2);
  assert.equal(calls.find(c => c[0] === 'drawImage').at(-1), 37);
});

test('random batteries include both fire types and all four patterns with bounded repeated pressure/rest', () => {
  for (const mode of ['easy', 'medium', 'hard']) {
    const patterns = new Set(), kinds = new Set(); let previous = null, seed = 73;
    const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    for (let i = 0; i < 200; i++) { const v = nextEnemyVolley(mode, previous, random); patterns.add(v.pattern); kinds.add(v.kind); if (['both', 'quiet'].includes(previous)) assert.notEqual(v.pattern, previous); assert(v.warning >= 1.1); assert(v.cooldown >= 2.5); assert.deepEqual(v.shots, v.kind === 'heavy' ? [0] : [0, .14, .28]); previous = v.pattern; }
    assert.equal(patterns.size, 4); assert.equal(kinds.size, 2);
  }
});

test('a locked enemy lane leaves a reachable current-width escape or must rest at maximum WIDE', () => {
  for (const w of [125, 125 * 1.55]) { const safe = enemyEscapeLane({ w }, 10, 350, 230, 9); assert(safe && safe.max - safe.min >= 8); assert(safe.min >= 10 + w / 2); assert(safe.max <= 350 - w / 2); }
  assert.equal(enemyEscapeLane({ w: 324 }, 10, 350, 180, 9), null);
});

const { Carrier } = await import('../src/carrier.js');
test('Carrier launch records actual muzzle, active clock and selected heavy radius without charge farming', () => {
  const l = new Carrier(360, 729, 393 / 360); l.weaponRandom = () => 0; l.release(); l.nextAttack = 0; l.updateLevel(.01);
  const a = l.attack; l.clock = a.started + a.warning; l.updateAttack(); const b = l.bolts[0]; assert(b); assert.equal(b.r, 9); assert.equal(b.bornAt, l.clock); assert.equal(b.colour, 'carrier');
  assert(Math.abs(Math.hypot(b.vx, b.vy) - 440) < 1e-8); assert(Math.abs(Math.hypot(b.x - b.from.x, b.y - b.from.y) - b.r) < 1e-8);
  l.hitTarget(b.id, {}); assert.equal(l.coreChargeBank, 0);
});

test('actual Carrier mode object selects each bounded companion budget', () => {
  for (const [mode, balls, maxTime, duration] of [['easy', 7, 12, 8], ['medium', 6, 10, 7], ['hard', 5, 8, 6]]) {
    const l = new Carrier(360, 729, 393 / 360, mode), limits = l.companionLimits(); assert.deepEqual([limits.balls, limits.cosmic, limits.maxTime, limits.duration], [balls, 1, maxTime, duration]);
  }
});

test('Carrier impact storage stays bounded and cannot award gameplay progress', () => {
  const l = new Carrier(360, 729, 393 / 360), before = JSON.stringify(l.inspect()); for (let i = 0; i < 12; i++) l.enemyImpact({ vx: 0, vy: 440, r: 9 }, { x: i, y: 200 });
  assert.equal(l.enemyImpacts.length, 8); assert.equal(l.enemyImpacts[0].x, 4); assert.equal(JSON.stringify(l.inspect()), before); assert.equal(l.coreChargeBank, 0);
});
