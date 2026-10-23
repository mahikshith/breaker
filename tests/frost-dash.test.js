import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

globalThis.Image = class { complete = true; naturalWidth = 1; decode() { return Promise.resolve(); } };
const { Frost, FROST_MODES, DASH } = await import('../src/frost.js');
// The shipping Warden atlas (M365 round-3 redesign) with anchors measured from each frame's alpha.
const art = JSON.parse(readFileSync(new URL('../assets/frost-warden/manifest.json', import.meta.url)));
const tick = (l, seconds) => { for (let i = 0; i < Math.round(seconds * 120); i++) l.updateLevel(1 / 120); };
const parked = mode => { const l = new Frost(360, 729, 393 / 360, mode, art); l.release(); l.aim = null; l.balls[0].caught = true; return l; };
const untilStage = (l, stage, max = 30) => { for (let i = 0; i < max * 120 && l.stage !== stage; i++) l.updateLevel(1 / 120); return l.stage === stage; };

test('every third attack is a dash, and the crouch warning always runs its full time first', () => {
  for (const mode of Object.keys(FROST_MODES)) {
    const l = parked(mode), r = l.rules;
    l.attacks = DASH.every - 1; l.nextStrike = 0;
    tick(l, 1 / 60);
    assert.equal(l.stage, 'crouch', `${mode}: the third attack is a dash`);
    const crouchAt = l.clock;
    assert.ok(untilStage(l, 'dash'), `${mode}: the charge follows`);
    assert.ok(l.clock - crouchAt >= r.crouch - 1e-9, `${mode}: warned for the full crouch`);
    const back = l.pose('crouch', r.crouch).x;
    assert.ok(back >= DASH.minX - 1e-9, `${mode}: he stays on screen while backing off`);
  }
});

test('the smash lands on the post for DASH.damage, then a dazed punish window doubles ball damage', () => {
  for (const mode of Object.keys(FROST_MODES)) {
    const l = parked(mode), d = l.defences[0], before = d.hp;
    l.attacks = DASH.every - 1; l.nextStrike = 0;
    assert.ok(untilStage(l, 'smash'), `${mode}: the charge connects`);
    assert.equal(d.hp, Math.max(0, before - DASH.damage), `${mode}: two post damage`);
    assert.ok(l.defences.slice(1).every(p => p.hp === p.maxHP), `${mode}: only the target post`);
    assert.ok(untilStage(l, 'dazed'), `${mode}: dazed after the smash`);
    const hp = l.warden.hp; l.hitTarget('warden', { x: 100, y: 180 });
    assert.equal(hp - l.warden.hp, DASH.dazedHit, `${mode}: a dazed hit counts double`);
  }
});

test('Kit’s ward holds a dash: no post damage, the Warden bounces off staggered', () => {
  const l = parked('medium'), d = l.defences[0], before = d.hp;
  l.attacks = DASH.every - 1; l.nextStrike = 0; tick(l, 1 / 60);
  l.paddle.charge = 1; assert.ok(l.useKitPower(), 'ward can be cast during the crouch');
  assert.ok(untilStage(l, 'stun'), 'bounced off the ward');
  assert.equal(d.hp, before); assert.equal(l.blockedPunches, 1);
});

test('hitting the Warden during the crouch staggers him before he charges', () => {
  const l = parked('easy');
  l.attacks = DASH.every - 1; l.nextStrike = 0; tick(l, 1 / 60);
  for (let i = 0; i < l.rules.interrupt; i++) l.hitTarget('warden', { x: 100, y: 180 });
  assert.equal(l.stage, 'stun');
  assert.equal(l.defences[0].hp, l.defences[0].maxHP);
});
