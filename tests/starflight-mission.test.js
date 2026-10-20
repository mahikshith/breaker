import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Starflight } from '../src/starflight/model.js';
import { SHIPS, shipPoint, shipCircles } from '../src/starflight/geometry.js';
import { StarflightMission, MISSION_POWERS, MISSION_PLAYER_NOSE, STORM_WINGS, wingPoint, droneMuzzle } from '../src/starflight/mission.js';

const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-6, `${a} != ${b}`);
function advance(m, seconds) { for (let i = 0; i < Math.round(seconds * 120); i++) m.update(1 / 120); }
class NoFire extends StarflightMission { firePlayer() {} }
function rock(m, x, y, r = 2) {
  const h = { id: ++m.serial, kind: 'asteroid', x, y, px: x, py: y, vx: 0, vy: 0, r, hp: 30, maxHP: 30, angle: 0, spin: 0, hurt: 0 };
  m.hazards.push(h); return h;
}

test('the mission is separate from the lab and exposes nine bounded manual choices', () => {
  assert.equal(new Starflight({ difficulty: 'easy' }).player.hp, 5);
  assert.deepEqual(['easy', 'medium', 'hard'].map(difficulty => new StarflightMission({ difficulty }).player.hp), [6, 5, 4]);
  const m = new StarflightMission();
  assert.equal(m.mission.id, 'gatebreak'); assert.equal(m.world.gate.locked, true);
  assert.equal(m.mission.group, -1); assert.equal(m.world.blockade.remaining, 3);
  assert.deepEqual(Object.keys(MISSION_POWERS), ['laser', 'stasis', 'hyper', 'seeker', 'spiral', 'drones', 'nova', 'storm', 'ricochet']);
  assert.ok(Object.values(m.stocks).every(n => n === 0));
  assert.equal(m.canActivate('__proto__'), false);
});

test('stocks precede reactor charge, paused eligibility is read-only, and activation remains strict', () => {
  const m = new StarflightMission(); m.stocks.storm = 1; m.charge = 100; m.chargeBank = 10;
  m.pause(true); const before = JSON.stringify(m);
  assert.equal(m.canActivate('storm'), false); assert.equal(m.canActivate('storm', { ignorePause: true }), true);
  assert.equal(m.activate('storm'), false); assert.equal(JSON.stringify(m), before);
  m.pause(false); assert.equal(m.activate('storm'), true);
  assert.equal(m.stocks.storm, 0); assert.equal(m.charge, 100); assert.equal(m.chargeBank, 10);
  assert.equal(m.activate('storm'), false); assert.equal(m.charge, 100);
  assert.equal(m.activate('ricochet'), false); assert.equal(m.charge, 100);
  m.updateStorm(MISSION_POWERS.storm); assert.equal(m.storm, null);
  assert.equal(m.activate('ricochet'), true); assert.equal(m.charge, 0); assert.equal(m.chargeBank, 0);
  m.mission.restRemaining = 1; m.stocks.laser = 1;
  assert.equal(m.canActivate('laser', { ignorePause: true }), false);
});

test('waiting and passive dodging without firing cannot clear the required patrol or win', () => {
  const m = new NoFire({ height: 613, difficulty: 'easy' }); m.player.invuln = Infinity;
  for (let i = 0; i < 120 * 220; i++) { m.setTarget(180 + Math.sin(i / 120) * 110, 550); m.update(1 / 120); }
  assert.equal(m.state, 'play'); assert.equal(m.mission.group, 0); assert.equal(m.mission.progress, 0);
  assert.equal(m.requiredEnemies.size, 2); assert.equal(m.enemies.length, 1);
  assert.deepEqual(m.enemies[0].objectiveIds, [...m.requiredEnemies]); assert.equal(m.mission.combinations, 1);
  assert.equal(m.world.gate.locked, true); assert.equal(m.completedSectors, 0);
  assert.ok(m.enemies.every(e => e.hp > 0 && e.x > 0 && e.x < m.width && e.y > 0 && e.y < m.height));
});

test('scouts commit a snapshot lane, turn continuously and regroup instead of exiting', () => {
  const m = new NoFire({ height: 613 }); m.player.invuln = Infinity;
  m.startGroup(0); m.mission.comboSpent = true;
  let scout, committed, returned = false;
  for (let i = 0; i < 120 * 18; i++) {
    m.setTarget(i < 500 ? 70 : 290, 550);
    const old = scout && { x: scout.x, y: scout.y, angle: scout.angle };
    m.update(1 / 120); scout ||= m.enemies[0];
    if (!scout) continue;
    if (scout.flightStage === 'commit' && committed === undefined) committed = scout.commitX;
    if (scout.flightStage === 'dive' && committed !== undefined) { close(scout.commitX, committed); returned = true; }
    if (scout.flightStage === 'return') committed = undefined;
    if (old) {
      assert.ok(Math.hypot(scout.x - old.x, scout.y - old.y) <= 132 / 120 + 1e-6);
      assert.ok(Math.abs(scout.angle - old.angle) <= 2.8 / 120 + 1e-6);
    }
  }
  assert.equal(returned, true); assert.equal(m.enemies.length, 2);
});

test('finite required deaths gate the next encounter and relief freezes combat resources', () => {
  const m = new NoFire(); advance(m, 1);
  const ids = m.enemies.map(e => e.id); advance(m, 8); assert.equal(m.mission.group, 0);
  for (const e of m.enemies) m.damageEnemy(e, e.hp, true);
  assert.equal(m.mission.progress, 2); assert.equal(m.requiredEnemies.size, 0);
  m.update(1 / 120); assert.ok(m.mission.restRemaining > 2);
  const charge = m.charge, bank = m.chargeBank; advance(m, 1);
  close(m.charge, charge); close(m.chargeBank, bank);
  advance(m, 1.3); assert.equal(m.mission.group, 1); assert.equal(m.enemies.length, 4);
  assert.ok(m.enemies.every(e => !ids.includes(e.id))); assert.equal(m.completedEnemies.size, 2);
});

test('productive broad battery damage removes a real rack and cancels its pending work', () => {
  const m = new NoFire(); m.startGroup(8); const e = m.enemies[0];
  e.warning = { sources: [{ port: 4 }] };
  m.damageEnemy(e, e.hp / 2, true);
  assert.equal(e.capability, 'damaged'); assert.deepEqual(e.disabledPorts, [3, 4, 5]); assert.equal(e.warning, null);
  assert.ok(e.fireAt >= m.time + 1.79); assert.ok(m.chargeBank > 0);
  const bank = m.chargeBank; m.damageEnemy(e, 1, false); assert.equal(m.chargeBank, bank);
  m.damageEnemy(e, 999, false); assert.equal(m.world.blockade.remaining, 2);
  assert.ok(m.effects.some(f => f.kind === 'wreck' && f.ship === e.ship && Number.isFinite(f.vx)));
});

test('early earned capsules are Storm then Ricochet and invalid/enemy kills cannot farm supplies', () => {
  const m = new StarflightMission(); m.startGroup(0);
  for (const e of m.enemies) m.damageEnemy(e, e.hp, true);
  assert.equal(m.pickups.length, 1); assert.equal(m.pickups[0].power, 'storm');
  const old = m.pickups.length; m.damageEnemy(m.enemies[0], 100, true); assert.equal(m.pickups.length, old);
  const h = rock(m, 180, 200); m.damageHazard(h, h.hp, false); assert.equal(m.pickups.length, old);
  const owned = rock(m, 100, 200); m.damageHazard(owned, owned.hp, true);
  assert.equal(m.pickups.at(-1).power, 'ricochet');
  for (let i = 0; i < 20; i++) { const h = rock(m, 100, 200); m.damageHazard(h, h.hp, true); }
  assert.ok(m.pickups.length <= 6); assert.ok(m.pickups.filter(p => p.kind === 'power').length <= 2);
  assert.ok(m.pickups.filter(p => p.kind !== 'power').length <= 2);
  const cadence = new StarflightMission();
  for (let i = 1; i <= 12; i++) {
    const h = rock(cadence, 80, 120); cadence.earnedDrop(h, false);
    const support = cadence.pickups.filter(p => p.kind !== 'power');
    assert.equal(support.length, i % 4 === 0 ? 1 : 0, `support cadence at destruction${i}`);
    cadence.pickups = [];
  }
});

test('power capsules remain manual, stock caps hold and full stock never silently consumes a capsule', () => {
  const m = new StarflightMission(), p = m.player;
  for (const power of ['storm', 'ricochet', 'seeker', 'nova']) m.pickups.push({ id: ++m.serial, x: p.x, y: p.y, r: 12, age: 0, kind: 'power', power });
  m.movePickups(1 / 120);
  assert.equal(Object.values(m.stocks).reduce((a, b) => a + b), 3); assert.equal(m.storm, null);
  assert.equal(m.pickups.length, 1); assert.equal(m.pickups[0].power, 'nova');
  assert.equal(m.activate('storm'), true); m.movePickups(1 / 120);
  assert.equal(m.stocks.nova, 1); assert.equal(m.pickups.length, 0);
});

test('Storm attachment pivots, neutral assembly and lightning tips match the real wing manifest', () => {
  const manifest = JSON.parse(readFileSync(new URL('../assets/starflight-storm/manifest.json', import.meta.url)));
  for (let i = 0; i < 2; i++) {
    const part = manifest.parts[i ? 'wing-right' : 'wing-left'], meta = STORM_WINGS[i];
    assert.deepEqual(meta.pivot, part.pivot);
    meta.neutralOffset.forEach((n, j) => close(n, part.neutralOffset[j])); meta.tipOffset.forEach((n, j) => close(n, part.tipOffset[j]));
  }
  for (const angle of [-.28, 0, .28]) {
    const m = new StarflightMission(); m.player.angle = angle; m.stocks.storm = 1; m.activate('storm');
    for (let i = 0; i < 2; i++) {
      const tip = wingPoint(m.storm.wings[i], STORM_WINGS[i].tipOffset), original = shipPoint('player', m.player.x, m.player.y, angle, SHIPS.player.muzzles[i]);
      close(tip.x, original.x); close(tip.y, original.y);
    }
    m.updateStorm(.8); m.firePlayer();
    assert.equal(m.shots.length, 0); assert.equal(m.effects.some(f => f.kind === 'muzzle'), false);
    assert.equal(m.player.r, 7);
  }
});

test('the upward Storm band sweeps actual targets once, has bounded boss damage and returns to moving sockets', () => {
  const m = new StarflightMission(), boss = m.spawnEnemy('boss', 180, 240, 0, 'crescent');
  m.stocks.storm = 1; m.activate('storm'); m.updateStorm(.45); m.updateStorm(3.4);
  assert.equal(boss.hp, boss.maxHP - 80); assert.equal(m.chargeBank, 0);
  m.updateStorm(.45); assert.equal(boss.hp, boss.maxHP - 80);
  const storm = m.storm; m.setTarget(300, 600); for (let i = 0; i < 120 && m.storm; i++) { m.movePlayer(1 / 120); m.updateStorm(1 / 120); }
  assert.equal(m.storm, null);
  for (let i = 0; i < 2; i++) { const neutral = wingPoint(m.player, STORM_WINGS[i].neutralOffset); close(storm.wings[i].x, neutral.x); close(storm.wings[i].y, neutral.y); }
});

test('Storm destroys physically crossed Hard ordinary hulls and rocks without replacement charge or drops', () => {
  for (const group of [1, 8]) {
    const m = new StarflightMission({ difficulty: 'hard' }); m.startGroup(group);
    for (const e of m.enemies) {
      e.y = e.py = 260; e.body = shipCircles(e.ship, e.x, e.y, e.angle); e.previousBody = e.body;
      assert.equal(e.hp, group === 1 ? 21 : 92);
    }
    const crossed = [...m.enemies], outside = m.spawnEnemy('scout', -100, 260), outsideHP = outside.hp;
    const h = rock(m, 180, 320); h.hp = h.maxHP = 100;
    m.stocks.storm = 1; m.activate('storm'); m.updateStorm(.45); m.updateStorm(3.4);
    assert.ok(crossed.every(e => e.hp === 0)); assert.equal(h.hp, 0); assert.equal(outside.hp, outsideHP);
    assert.equal(m.charge, 0); assert.equal(m.chargeBank, 0); assert.equal(m.eligibleDestructions, 0);
    assert.equal(m.pickups.length, 0); assert.equal(m.mission.suppliesEarned, 0);
  }
});

test('Ricochet collides along the real reflected segments rather than the diagonal endpoint chord', () => {
  const m = new StarflightMission(); m.stocks.ricochet = 1; m.activate('ricochet'); const s = m.shots[0];
  Object.assign(s, { x: 340, y: 200, vx: 400, vy: 400 });
  const actual = rock(m, 345, 215), ghost = rock(m, 330, 215);
  m.moveRicochet(s, .1);
  assert.equal(s.segments.length, 2); close(s.segments[0].x2, 350); assert.equal(s.bounces, 1);
  assert.equal(actual.hp, 27); assert.equal(ghost.hp, 30); assert.equal(m.chargeBank, 0);
  assert.ok(s.trail.length > 0 && s.trail.length <= 80);
});

test('a last Storm kill returns wings harmlessly during relief before the next encounter', () => {
  const m = new StarflightMission({ height: 613 }); advance(m, .9);
  const [first, last] = m.enemies;
  m.damageEnemy(first, first.hp, false); Object.assign(last, { hp: 1, x: 180, y: 240, px: 180, py: 240 });
  last.body = shipCircles(last.ship, last.x, last.y, last.angle); last.previousBody = last.body;
  m.stocks.storm = 1; m.activate('storm'); m.updateStorm(.45);
  const storm = m.storm;
  m.updateStorm(3.4); assert.equal(last.hp, 0); m.update(1 / 120);
  assert.ok(m.mission.restRemaining > 2); assert.equal(m.mission.group, 0);
  const charge = m.charge, bank = m.chargeBank, supplies = m.mission.suppliesEarned;
  // An otherwise valid overlapping target must remain untouched by the return.
  const witness = m.spawnEnemy('gunship', 180, 260, 0, 'frigate'), hp = witness.hp;
  m.setTarget(280, 550);
  for (let i = 0; i < 120 && m.storm; i++) m.update(1 / 120);
  assert.equal(m.storm, null); assert.equal(m.timers.storm, 0);
  assert.equal(m.shots.filter(s => s.side === 'player').length, 0);
  assert.ok(m.mission.restRemaining > 1); assert.equal(witness.hp, hp);
  assert.equal(storm.band.active, false);
  for (let i = 0; i < 2; i++) { const q = wingPoint(m.player, STORM_WINGS[i].neutralOffset); close(storm.wings[i].x, q.x); close(storm.wings[i].y, q.y); }
  close(m.charge, charge); close(m.chargeBank, bank); assert.equal(m.mission.suppliesEarned, supplies);
  assert.equal(m.stocks.storm, 0);
});

test('Ricochet cannot farm continuous overlap and must exit before a later contact episode', () => {
  const m = new StarflightMission(), e = m.spawnEnemy('boss', 180, 220, 0, 'crescent');
  m.stocks.ricochet = 1; m.activate('ricochet'); const s = m.shots[0], c = e.body[0];
  Object.assign(s, { x: c.x, y: c.y, vx: 0, vy: 0 }); m.moveRicochet(s, .01);
  assert.equal(e.hp, e.maxHP - 3); m.time += .5; m.moveRicochet(s, .01); assert.equal(e.hp, e.maxHP - 3);
  s.x = 30; s.y = 500; m.moveRicochet(s, .01); m.time += .5; s.x = c.x; s.y = c.y; m.moveRicochet(s, .01);
  assert.equal(e.hp, e.maxHP - 6); assert.equal(m.chargeBank, 0);
});

test('Ricochet lifetime, bounce count and trail budgets stay finite and pause freezes all new families', () => {
  const m = new StarflightMission(); m.stocks.ricochet = 1; m.activate('ricochet');
  advance(m, .3); m.pause(true); const frozen = JSON.stringify(m); advance(m, 3); assert.equal(JSON.stringify(m), frozen);
  m.pause(false); const s = m.shots.find(s => s.kind === 'ricochet');
  for (let i = 0; i < 120 * 6 && m.shots.includes(s); i++) m.moveShots(1 / 120);
  assert.equal(m.shots.includes(s), false); assert.ok(s.bounces <= s.maxBounces + 1); assert.ok(s.trail.length <= 80);
});

test('Storm is exclusive with every manual power and rejected choices preserve all earned resources', () => {
  for (const id of Object.keys(MISSION_POWERS).filter(id => id !== 'storm')) {
    const m = new StarflightMission(); m.stocks[id] = 1; m.stocks.storm = 1; m.charge = 100;
    assert.equal(m.activate(id), true); const before = JSON.stringify(m);
    assert.equal(m.canActivate('storm', { ignorePause: true }), false); assert.equal(m.activate('storm'), false);
    assert.equal(JSON.stringify(m), before, `rejected Storm spent/changed ${id}`);
    const other = new StarflightMission(); other.stocks.storm = 1; other.stocks[id] = 1; other.charge = 100;
    other.activate('storm'); const detached = JSON.stringify(other);
    assert.equal(other.canActivate(id, { ignorePause: true }), false); assert.equal(other.activate(id), false);
    assert.equal(JSON.stringify(other), detached, `detached ${id} cast spent a resource`);
  }
});

test('only thunder attacks throughout split, sweep and return; existing bullets clear and ordinary fire resumes without backlog', () => {
  const m = new StarflightMission({ height: 613 }); m.startGroup(9); m.stocks.storm = 1; m.timers.rapid = 3;
  m.firePlayer(); assert.ok(m.shots.some(s => s.side === 'player'));
  const enemy = m.addShot(20, 20, Math.PI / 2, 40, 4, 'enemy', 'pulse');
  m.activate('storm'); assert.deepEqual(m.shots.map(s => s.id), [enemy.id]);
  const stages = new Set();
  for (let i = 0; i < 120 * 6 && m.storm; i++) {
    stages.add(m.storm.stage); m.fireSeekers(); m.updateDrones(1 / 120, true); m.update(1 / 120);
    assert.equal(m.shots.some(s => s.side === 'player'), false);
    assert.ok(m.fireCooldown >= 0); close(m.timers.rapid, 3);
  }
  assert.deepEqual([...stages].sort(), ['return', 'split', 'sweep']); assert.equal(m.storm, null);
  assert.ok(m.shots.some(s => s.side === 'enemy'), 'enemy fire remains active');
  advance(m, .1); assert.equal(m.shots.some(s => s.side === 'player'), false);
  advance(m, .1); assert.equal(m.shots.filter(s => s.side === 'player').length, 2);
  assert.ok(m.fireCooldown > 0); assert.ok(m.timers.rapid < 3 && m.timers.rapid > 2.7);
});

test('last command damage clears same-tick lethal fire, extraction is bounded and won is terminal', () => {
  const m = new NoFire({ difficulty: 'easy' }); m.startGroup(9); const boss = m.enemies[0], p = m.player;
  boss.hp = 1; p.hp = 1; p.invuln = 0; const c = boss.body[0];
  m.addShot(c.x, c.y + 45, -Math.PI / 2, 12000, 3.4, 'player', 'pulse');
  m.addShot(p.x, p.y - 45, Math.PI / 2, 12000, 4, 'enemy', 'pulse');
  m.update(1 / 120); assert.equal(m.phase, 'jump'); assert.equal(p.hp, 1); assert.equal(m.world.gate.locked, false);
  assert.equal(m.shots.length, 0); m.pause(true); const frozen = JSON.stringify(m); advance(m, 1); assert.equal(JSON.stringify(m), frozen);
  m.pause(false); advance(m, 3.1); assert.equal(m.state, 'won'); assert.equal(m.phase, 'complete');
  assert.equal(m.world.gate.open, 1); assert.equal(m.canActivate('laser'), false);
  const complete = JSON.stringify(m); advance(m, 10); assert.equal(JSON.stringify(m), complete);
});

test('ordinary public flight inputs can complete the finite Easy mission at both phone-height fields', () => {
  for (const height of [613, 656]) {
    const m = new StarflightMission({ height, difficulty: 'easy', seed: 7 });
    for (let i = 0; i < 120 * 260 && m.state === 'play'; i++) {
      const enemy = m.enemies.filter(e => e.hp > 0).sort((a, b) => b.y - a.y)[0];
      let x = enemy ? enemy.x : m.width / 2, y = m.height * .83;
      const hazard = m.shots.filter(s => s.side === 'enemy' && s.vy > 0).map(s => ({ s, t: (y - s.y) / s.vy }))
        .filter(q => q.t > 0 && q.t < .7).sort((a, b) => a.t - b.t)[0];
      if (hazard && Math.abs(hazard.s.x + hazard.s.vx * hazard.t - x) < 35) x += x < 180 ? 60 : -60;
      m.setTarget(x, y); m.update(1 / 120);
    }
    assert.equal(m.state, 'won', `${height}: ${m.state}, group${m.mission.group}, t${m.time}`);
    assert.equal(m.mission.group, 9); assert.equal(m.world.gate.locked, false);
    assert.ok(m.time > 60 && m.time < 260); assert.ok(m.player.hp > 0);
  }
});

test('supplies drift independently of the hero and only a real swept contact collects them', () => {
  const m = new StarflightMission(), p = m.player;
  const drifting = { id: ++m.serial, x: p.x - 80, y: p.y - 30, vx: 0, vy: 20, r: 12, age: 0, kind: 'power', power: 'storm' };
  m.pickups = [drifting];
  for (let i = 0; i < 120; i++) m.movePickups(1 / 120);
  close(drifting.x, p.x - 80); assert.ok(drifting.y > p.y - 10); assert.equal(m.stocks.storm, 0);
  const miss = { id: ++m.serial, x: p.x + 25, y: p.y, vx: 0, vy: 0, r: 12, age: 0, kind: 'power', power: 'ricochet' };
  m.pickups = [miss]; m.movePickups(1 / 120); assert.equal(m.pickups.length, 1); assert.equal(m.stocks.ricochet, 0);
  miss.x = p.x - 60; miss.y = p.y; miss.vx = 9000;
  m.movePickups(1 / 120); assert.equal(m.stocks.ricochet, 1); assert.equal(m.pickups.length, 0);
});

test('Trident retains the spiral ID but launches a bounded three-target guided salvo from real ports', () => {
  const m = new NoFire();
  const enemies = [80, 150, 230, 300].map(x => m.spawnEnemy('gunship', x, 200, 0, 'frigate'));
  m.stocks.spiral = 1; assert.equal(m.activate('spiral'), true); assert.equal(m.fireSalvo(), true);
  const salvo = m.shots.filter(s => s.kind === 'salvo'); assert.equal(salvo.length, 3);
  assert.equal(new Set(salvo.map(s => s.targetId)).size, 3);
  for (const s of salvo) {
    const port = shipPoint('player', m.player.x, m.player.y, m.player.angle, SHIPS.player.muzzles[s.port]);
    close(s.x, port.x); close(s.y, port.y); close(s.from.x, port.x); close(s.from.y, port.y);
    assert.equal(s.powered, true); assert.equal(s.life, 3.6);
  }
  assert.equal(m.fireSalvo(), false, 'the secondary rack obeys its own launch cooldown');
  const headings = salvo.map(s => s.heading); m.guideSalvos(.1);
  salvo.forEach((s, i) => assert.ok(Math.abs(s.heading - headings[i]) <= .22 + 1e-7));
  const lost = enemies.find(e => e.id === salvo[0].targetId); m.damageEnemy(lost, lost.hp, false); m.guideSalvos(.1);
  assert.ok(salvo.every(s => s.targetId !== lost.id)); assert.equal(new Set(salvo.map(s => s.targetId)).size, 3);
  m.time += .9; m.fireSalvo(); m.time += .9; m.fireSalvo(); assert.equal(m.shots.filter(s => s.kind === 'salvo').length, 9);
  m.time += .9; assert.equal(m.fireSalvo(), false); assert.equal(m.chargeBank, 0);
  for (const s of m.shots) s.age = 3.6; m.moveShots(1 / 120); assert.equal(m.shots.length, 0);
});

test('ignored scouts dock continuously into one heavier ship without healing or free objective credit', () => {
  const m = new NoFire({ height: 613, difficulty: 'easy' }); m.player.invuln = Infinity; m.startGroup(0);
  const originals = m.enemies.map(e => e.id); m.damageEnemy(m.enemies[0], 2, true);
  const sum = m.enemies.reduce((n, e) => n + e.hp, 0);
  const seen = new Set(); let launches, before;
  for (let i = 0; i < 120 * 25 && !m.enemies.some(e => e.missionType === 'combined'); i++) {
    if (m.combination) seen.add(m.combination.stage);
    if (m.combination?.stage === 'dock' && !launches) {
      launches = m.addShot(20, 10, Math.PI / 2, 1, 4, 'enemy', 'pulse'); launches.owner = originals[0];
      before = { score: m.score, kills: m.kills, charge: m.charge, bank: m.chargeBank, supplies: m.mission.suppliesEarned };
    }
    m.update(1 / 120);
  }
  const child = m.enemies.find(e => e.missionType === 'combined'); assert.ok(child);
  assert.deepEqual([...seen], ['warning', 'dock']); assert.equal(child.hp, sum + 8); assert.deepEqual(child.objectiveIds, originals);
  assert.deepEqual([...m.requiredEnemies], originals); assert.equal(m.mission.progress, 0); assert.equal(m.completedEnemies.size, 0);
  assert.equal(m.score, before.score); assert.equal(m.kills, before.kills); close(m.charge, before.charge); close(m.chargeBank, before.bank);
  assert.equal(m.mission.suppliesEarned, before.supplies); assert.ok(m.shots.some(s => s.id === launches.id));
  assert.equal(m.mission.comboSpent, true); assert.equal(m.mission.combinations, 1);
  m.damageEnemy(child, child.hp, true); assert.equal(m.requiredEnemies.size, 0); assert.equal(m.mission.progress, 2);
  assert.deepEqual([...m.completedEnemies], originals); assert.equal(m.kills, 1);
});

test('a legal last-parent hit interrupts docking before the child can appear in that tick', () => {
  const m = new NoFire({ height: 613 }); m.player.invuln = Infinity; m.startGroup(0);
  while (m.time < 25 && m.combination?.stage !== 'dock') m.update(1 / 120);
  assert.equal(m.combination.stage, 'dock'); m.combination.at = m.time - 2;
  for (let i = 0; i < 2; i++) {
    const e = m.enemies[i]; Object.assign(e, { x: m.combination.x + (i ? 12 : -12), y: m.combination.y, px: m.combination.x + (i ? 12 : -12), py: m.combination.y, vx: 0, vy: 0 });
    e.body = shipCircles(e.ship, e.x, e.y, e.angle); e.previousBody = e.body;
  }
  const e = m.enemies[0]; e.hp = 1; const c = e.body[0];
  m.addShot(c.x, c.y + 45, -Math.PI / 2, 12000, 3.4, 'player', 'pulse'); m.update(1 / 120);
  assert.equal(m.combination.stage, 'cancelled'); assert.equal(m.mission.combinations, 0);
  assert.equal(m.enemies.some(e => e.missionType === 'combined'), false); assert.equal(m.mission.progress, 1);
  assert.equal(m.requiredEnemies.size, 1);
});

test('mission resize preserves every required identity and all resources across a deep portrait shrink', () => {
  const m = new NoFire({ height: 1000 }); m.player.invuln = Infinity;
  while (m.time < 20 && !m.enemies.some(e => e.y > 500)) m.update(1 / 120);
  const ids = [...m.requiredEnemies], time = m.time, hp = m.player.hp, score = m.score;
  m.stocks.ricochet = 1; const previous = JSON.stringify(m);
  assert.equal(m.resize(200, 360), false); assert.equal(JSON.stringify(m), previous);
  assert.equal(m.resize(360, 360), true);
  close(m.time, time); assert.equal(m.player.hp, hp); assert.equal(m.score, score); assert.equal(m.stocks.ricochet, 1);
  assert.deepEqual([...m.requiredEnemies], ids); m.update(1 / 120);
  assert.ok(ids.every(id => m.enemies.some(e => (e.objectiveIds || [e.id]).includes(id))));
  assert.ok(m.enemies.every(e => e.y < m.height && e.commitY <= m.height * .55 + 1e-6));
  const storm = new StarflightMission(); storm.stocks.storm = 1; storm.activate('storm'); storm.updateStorm(.8);
  storm.resize(412, 656);
  for (let i = 0; i < 2; i++) { const w = storm.storm.wings[i], tip = wingPoint(w, STORM_WINGS[i].tipOffset); close(w.tip.x, tip.x); close(w.tip.y, tip.y); }
  close(storm.storm.band.x1, storm.storm.wings[0].tip.x); close(storm.storm.band.x2, storm.storm.wings[1].tip.x);
});

test('payload-cap rejection and primary exclusivity cannot spend an unusable weapon stock', () => {
  for (const id of ['ricochet', 'nova', 'spiral', 'seeker', 'laser', 'hyper']) {
    const m = new StarflightMission(); m.stocks[id] = 1;
    for (let i = 0; i < 180; i++) m.addShot(100, 100, 0, 1, 1, 'player', 'pulse');
    const before = JSON.stringify(m); assert.equal(m.canActivate(id), false); assert.equal(m.activate(id), false); assert.equal(JSON.stringify(m), before);
  }
  for (const [first, blocked] of [['laser', 'hyper'], ['hyper', 'laser']]) {
    const m = new StarflightMission(); m.stocks[first] = m.stocks[blocked] = 1; m.activate(first);
    const before = JSON.stringify(m); assert.equal(m.activate(blocked), false); assert.equal(JSON.stringify(m), before);
  }
});

test('all nine abilities expire without farming energy, and drone shots are born at the real banked optic', () => {
  for (const id of Object.keys(MISSION_POWERS)) {
    const m = new NoFire(); m.startGroup(9); m.stocks[id] = 1; assert.equal(m.activate(id), true);
    m.pause(true); const frozen = JSON.stringify(m); advance(m, 1); assert.equal(JSON.stringify(m), frozen);
    m.pause(false); advance(m, MISSION_POWERS[id] + .2); assert.equal(m.timers[id], 0, `${id} expiry`);
    assert.equal(m.charge, 0); assert.equal(m.chargeBank, 0);
  }
  const m = new NoFire(), births = [], add = m.addShot;
  m.addShot = function(...args) {
    const s = add.apply(this, args);
    if (s.kind === 'drone') births.push({ shot: s, x: s.x, y: s.y, nearest: Math.min(...this.drones.map(d => { const p = droneMuzzle(d); return Math.hypot(s.x - p.x, s.y - p.y); })) });
    return s;
  };
  m.stocks.drones = 1; m.activate('drones'); advance(m, .6); assert.ok(births.length >= 2);
  for (const b of births) { close(b.nearest, 0); close(b.x, b.shot.from.x); close(b.y, b.shot.from.y); assert.equal(b.shot.powered, true); }
  for (const d of m.drones) { const from = droneMuzzle(d); close(d.muzzle.x, from.x); close(d.muzzle.y, from.y); assert.equal(d.r, 6); }
});

test('Ricochet uses the banked central nose and retains a longer bounded real path history', () => {
  const m = new StarflightMission(); m.player.angle = .28; m.stocks.ricochet = 1; m.activate('ricochet');
  const s = m.shots[0], from = shipPoint('player', m.player.x, m.player.y, .28, MISSION_PLAYER_NOSE);
  close(s.x, from.x); close(s.y, from.y); close(s.from.x, from.x); close(s.from.y, from.y);
  for (let i = 0; i < 100; i++) { m.time += 1 / 120; m.moveRicochet(s, 1 / 120); }
  assert.ok(s.trail.some(p => p.age > .4)); assert.ok(s.trail.every(p => p.age < .55)); assert.ok(s.trail.length <= 80);
});

test('the real shield intercepts at31u once, then remaining shots immediately use the normal7u core', () => {
  const m = new NoFire(), p = m.player; p.invuln = 0; m.shieldCharges = 1; m.timers.shield = 12;
  const first = m.addShot(p.x + 25, p.y - 40, Math.PI / 2, 6000, 4, 'enemy', 'pulse');
  const second = m.addShot(p.x + 25, p.y - 40, Math.PI / 2, 6000, 4, 'enemy', 'pulse');
  m.moveShots(1 / 120);
  assert.equal(m.shieldCharges, 0); assert.equal(m.playerShotRadius(), 7); assert.equal(p.r, 7); assert.equal(p.hp, p.maxHP);
  assert.equal(m.shots.some(s => s.id === first.id), false); assert.ok(m.shots.some(s => s.id === second.id));
  const hit = m.effects.find(f => f.kind === 'shield'); assert.ok(hit); close(hit.x, p.x + 25); assert.ok(hit.y < p.y);
  assert.equal(new Starflight().playerShotRadius(), 7);
});
