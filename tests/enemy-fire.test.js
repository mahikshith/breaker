import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { circuitData } from '../tools/relay-circuit/data.mjs';
globalThis.Image = class { complete = true; naturalWidth = 256; naturalHeight = 256; decode() { return Promise.resolve(); } };
const { Carrier } = await import('../src/carrier.js'), { Orbital } = await import('../src/orbital.js'), { Relay } = await import('../src/relay.js');
const forge = JSON.parse(readFileSync(new URL('../assets/orbital-forge/manifest.json', import.meta.url)));
const phones = [[729, 393 / 360], [785, 412 / 360]], make = (kind, mode = 'easy', [H, s] = phones[0]) => kind === 'carrier' ? new Carrier(360, H, s, mode) : kind === 'circuit' ? new Relay(360, H, s, mode, circuitData()) : new Orbital(360, H, s, mode, forge);
const field = l => JSON.stringify({ bricks: l.bricks.map(b => [b.id, b.hp, b.payload]), housing: l.crew?.map(c => [c.id, c.hp, c.releasedAt, c.secured]), drops: l.drops, breaks: l.bricksBroken, charge: l.paddle.charge, bank: l.coreChargeBank });
const advance = (l, seconds) => { for (let i = 0; i < Math.round(seconds * 120); i++) l.updateLevel(1 / 120); };

test('fast enemy shots traverse the complete intact field and hit or miss the actual paddle without changing any cover/reward', () => {
  for (const kind of ['carrier', 'circuit', 'forge']) for (const phone of phones) for (const dodge of [false, true]) {
    const l = make(kind, 'easy', phone); l.balls = []; l.aim = null; l.started = true; l.paddle.x = dodge ? l.left + l.paddle.w / 2 : 230; l.paddle.vx = 0;
    const before = field(l), lives = l.lives;
    l.bolts = [{ id: 'invariance-shot', x: 230, y: 100, vx: 0, vy: 1200, r: 9, colour: kind }]; l.updateBolts(1);
    assert.equal(field(l), before, `${kind}: enemy fire never changes cover HP/payloads or earns charge`);
    assert.equal(l.lives, lives - (dodge ? 0 : 1)); assert.equal(l.bolts.length, 0); assert.equal(l.state, 'play');
  }
});

test('Carrier aerial boarding reaches extraction through an entirely intact field without a breach projectile', () => {
  for (const phone of phones) {
    const l = make('carrier', 'easy', phone); l.release(); l.aim = null; l.balls[0].caught = true; for (const g of l.guns) g.hp = 0;
    const before = field(l); for (let i = 0; i < 50 * 120 && l.raid?.stage !== 'extract'; i++) l.updateLevel(1 / 120);
    assert.equal(l.raid?.stage, 'extract'); assert.equal(l.raid.blockerId, null); assert.equal(l.bolts.length, 0); assert.equal(field(l), before);
    assert(l.clock >= l.rules.firstSquad + 5); assert(l.inspect().raid.remaining >= 13.99);
    const target = l.crew.find(c => c.id === l.raid.targetId); assert(target.hp > 0 && !target.secured);
    const attacker = l.fighters.find(f => f.id === l.raid.fighterId); while (attacker.hp > 0) l.hitTarget(attacker.id, {});
    assert.equal(l.raid, null); assert(target.hp > 0 && !target.secured, 'interrupting a raid is distinct from rescuing its locked crew');
  }
});

test('Carrier batteries independently warn before staggered shots and rest when current WIDE has no escape', () => {
  for (const mode of ['easy', 'medium', 'hard']) {
    const l = make('carrier', mode); l.release(); l.nextAttack = 0; let n = 0; l.weaponRandom = () => [ .6, 0 ][n++] ?? 0; l.updateAttack();
    const a = l.attack; assert.equal(a.pattern, 'both'); assert.equal(a.sources[1].started - a.sources[0].started, .85);
    l.clock = a.started + a.warning; l.updateAttack(); assert.equal(l.bolts.length, 1); const first = l.bolts[0];
    l.clock += .84; l.updateAttack(); assert.equal(l.bolts.length, 1); l.clock += .02; l.updateAttack(); assert.equal(l.bolts.length, 2);
    l.guns[0].hp = 0; l.updateAttack(); assert(l.bolts.includes(first), 'source shutdown does not erase already launched fire');
    const wide = make('carrier', mode); wide.release(); wide.paddle.w = 324; wide.paddle.x = 180; wide.weaponRandom = () => 0; wide.nextAttack = 0; wide.updateAttack(); assert.equal(wide.attack, null); assert.equal(wide.bolts.length, 0); assert(wide.nextAttack > wide.clock);
  }
});

test('Forge both-gun salvos preserve delayed launch, full cleanup and paused/terminal clock invariants', () => {
  const l = make('forge'); l.started = true; l.teachDone = true; let n = 0; l.weaponRandom = () => [ .6, .9 ][n++] ?? 0; l.warn(); const a = l.attack; assert.equal(a.kind, 'salvo');
  l.clock = a.at + a.warning + .28; l.fire(); assert.equal(l.bolts.length, 3); l.clock += .85; l.fire(); assert.equal(l.bolts.length, 6);
  l.powerMenuOpen = true; const before = JSON.stringify(l.inspect()); l.update(20); assert.equal(JSON.stringify(l.inspect()), before); l.powerMenuOpen = false;
  l.lives = 1; l.loseBall(); assert.equal(l.state, 'lost'); assert.equal(l.bolts.length, 0); assert.equal(l.enemyImpacts.length, 0); const frozen = JSON.stringify(l.inspect()); l.updateBolts(5); l.update(5); assert.equal(JSON.stringify(l.inspect()), frozen);
  l.continueRun(); assert.equal(l.state, 'play'); assert.equal(l.bolts.length, 0); assert.equal(l.attack, null); assert(l.aim?.serve); assert.equal(l.serveLimit, 3);
});
