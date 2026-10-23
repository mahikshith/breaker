// Stages v2 rulebook (src/fantasy/stages.js): stage plans, the cumulative power pool, labels and the chapter-wide villain
// HP pool with its retreat caps (an early knockout becomes a knock-down and the HP carries over).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stagePlan, chapterKind, stageLabel, VillainPool } from '../src/fantasy/stages.js';

test('stagePlan: a Siege runs hook, build, clash, showdown; a Skirmish merges build into clash', () => {
  assert.deepEqual(stagePlan(4).map(s => s.role), ['hook', 'build', 'clash', 'showdown']);
  assert.deepEqual(stagePlan(3).map(s => s.role), ['hook', 'clash', 'showdown']);
  assert.throws(() => stagePlan(2));
  assert.deepEqual(stagePlan(4).map(s => s.last), [false, false, false, true]);
});

test('stagePlan: bricks, 2-hit share, drops and speed only go up', () => {
  for (const n of [3, 4]) {
    const p = stagePlan(n);
    for (const k of ['bricks', 'twoHit', 'drop', 'speed']) for (let i = 1; i < n; i++) assert.ok(p[i][k] > p[i - 1][k], `${k} rises at stage ${i + 1} of ${n}`);
  }
});

test('stagePlan: the power pool is cumulative and a Skirmish reaches the same final pool', () => {
  const s = stagePlan(4), k = stagePlan(3);
  assert.deepEqual(s[0].powers, ['wide', 'slow']);
  for (let i = 1; i < 4; i++) assert.ok(s[i - 1].powers.every(p => s[i].powers.includes(p)));
  assert.deepEqual([...k[2].powers].sort(), [...s[3].powers].sort());
  assert.ok(k[1].powers.includes('split') && k[1].powers.includes('fire'));
});

test('labels: the count is always visible and the length names the chapter', () => {
  assert.equal(stageLabel(1, 4), 'STAGE 2 OF 4');
  assert.equal(stageLabel(0, 3), 'STAGE 1 OF 3');
  assert.equal(chapterKind(4), 'Siege');
  assert.equal(chapterKind(3), 'Skirmish');
});

test('VillainPool: the hook stage cannot hurt the villain', () => {
  const v = new VillainPool(100, stagePlan(4));
  assert.deepEqual(v.hit(50), { dealt: 0, knockdown: false });
  assert.equal(v.hp, 100);
});

test('VillainPool: hitting a stage cap is one knock-down, later hits do nothing, HP carries over', () => {
  const v = new VillainPool(100, stagePlan(4));
  v.advance();
  assert.deepEqual(v.hit(10), { dealt: 10, knockdown: false });
  assert.deepEqual(v.hit(10), { dealt: 5, knockdown: true });
  assert.equal(v.hp, 85);
  assert.ok(v.down);
  assert.deepEqual(v.hit(10), { dealt: 0, knockdown: false });
  v.advance();
  assert.equal(v.hp, 85);
  assert.ok(!v.down);
  assert.deepEqual(v.hit(100), { dealt: 45, knockdown: true });
  assert.equal(v.hp, 40);
  assert.ok(!v.defeated);
});

test('VillainPool: only the showdown can defeat the villain, who comes back enraged after a knock-down', () => {
  const v = new VillainPool(60, stagePlan(3));
  v.advance(); v.hit(999);
  v.advance();
  assert.ok(v.enraged);
  assert.deepEqual(v.hit(999), { dealt: 24, knockdown: false });
  assert.ok(v.defeated);
  const calm = new VillainPool(60, stagePlan(3));
  calm.advance(); calm.advance();
  assert.ok(!calm.enraged);
});
