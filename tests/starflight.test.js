import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Starflight, STARFLIGHT_MODES, STARFLIGHT_POWERS, sweptCircle } from '../src/starflight/model.js';
import { SHIPS, PLAYER_EDGE, shipPoint, shipCircles } from '../src/starflight/geometry.js';

function advance(model, seconds, dt = 1 / 120) { for (let i = 0; i < Math.round(seconds / dt); i++) model.update(dt); }
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-7, `${a} != ${b}`);

test('direct flight responds with bounded inertia, lower-field bounds and release damping', () => {
  const m = new Starflight();
  assert.equal(m.setTarget(Infinity, 4), false);
  close(m.player.y, m.height * .9);
  m.setTarget(1e4, -100); advance(m, 1);
  assert.ok(m.player.x > 300 && m.player.x <= m.width - PLAYER_EDGE);
  assert.ok(m.player.y >= 780 * .35 && m.player.y < 420);
  assert.ok(Math.hypot(m.player.vx, m.player.vy) <= 480 + 1e-7);
  m.setMoving(false); advance(m, .6);
  assert.ok(Math.hypot(m.player.vx, m.player.vy) < .05);
  assert.equal(m.player.r, 7);
});

test('relative swept circles catch both crossing directions and reject parallel misses', () => {
  assert.notEqual(sweptCircle(0, 0, 100, 0, 100, 0, 0, 0, 2), null);
  assert.equal(sweptCircle(0, 0, 100, 0, 0, 8, 100, 8, 2), null);
  assert.equal(sweptCircle(0, 0, 0, 0, 0, 0, 0, 0, 2), 0);
});

test('a fast player projectile hits the first crossed physical enemy instead of tunnelling', () => {
  const m = new Starflight(), a = m.spawnEnemy('scout', 180, 120), b = m.spawnEnemy('scout', 180, 50);
  const firstHP = a.hp, secondHP = b.hp;
  m.addShot(180, 200, -Math.PI / 2, 24000, 3.4, 'player', 'pulse');
  m.update(1 / 120);
  assert.equal(a.hp, firstHP - 1); assert.equal(b.hp, secondHP);
  close(m.charge, 0); close(m.chargeBank, .8);
});

test('fast hostile crossing damages once and invulnerability prevents a same-frame pile-up', () => {
  const m = new Starflight(), p = m.player; p.invuln = 0;
  for (let i = 0; i < 3; i++) m.addShot(p.x, p.y - 100, Math.PI / 2, 24000, 4, 'enemy', 'heavy');
  m.update(1 / 120);
  assert.equal(p.hp, p.maxHP - 1);
  assert.equal(m.shots.filter(s => s.side === 'enemy').length, 0);
});

test('pause freezes every simulation clock and invalid or excessive dt is bounded', () => {
  const m = new Starflight(); advance(m, 3); m.pause(true);
  const frozen = JSON.stringify(m);
  m.update(100); m.update(NaN); m.update(Infinity); m.update(-2);
  assert.equal(JSON.stringify(m), frozen);
  m.pause(false); const t = m.time; m.update(1000); close(m.time - t, .1);
  const stable = JSON.stringify(m); for (const dt of [NaN, Infinity, -1, 0]) m.update(dt);
  assert.equal(JSON.stringify(m), stable);
});

test('identical seeds and fixed-step subdivisions reproduce authored waves and combat', () => {
  const a = new Starflight({ seed: 42 }), b = new Starflight({ seed: 42 });
  a.player.invuln = b.player.invuln = 1000;
  advance(a, 20, 1 / 60); advance(b, 20, 1 / 120);
  assert.deepEqual(a, b);
  const c = new Starflight({ seed: 43 }); advance(c, 3);
  assert.notEqual(a.enemies[0]?.wobble, c.enemies[0]?.wobble);
});

test('difficulty has explicit pressure and health differences without changing the hitbox', () => {
  const modes = ['easy', 'medium', 'hard'].map(difficulty => new Starflight({ difficulty }));
  assert.deepEqual(modes.map(m => m.player.hp), [5, 4, 3]);
  assert.deepEqual(modes.map(m => m.player.r), [7, 7, 7]);
  assert.ok(STARFLIGHT_MODES.easy.warning > STARFLIGHT_MODES.hard.warning);
  assert.ok(STARFLIGHT_MODES.hard.speed > STARFLIGHT_MODES.easy.speed);
  assert.equal(new Starflight({ difficulty: 'wrong' }).difficulty, 'medium');
  assert.throws(() => new Starflight({ width: NaN }), RangeError);
  assert.throws(() => new Starflight({ width: 240 }), RangeError);
});

test('productive ordinary damage earns capped charge; powered damage cannot farm its replacement', () => {
  const m = new Starflight(), enemy = m.spawnEnemy('boss', 180, 125);
  m.fireCooldown = 100;
  m.damageEnemy(enemy, 20, false); assert.equal(m.charge, 0);
  assert.equal(m.chargeBank, 0);
  m.damageEnemy(enemy, 10, true); assert.equal(m.charge, 0); assert.equal(m.chargeBank, 8);
  m.damageEnemy(enemy, 0, true); assert.equal(m.chargeBank, 8);
  advance(m, .5); close(m.charge, 1.5); close(m.chargeBank, 6.5);
  m.charge = 99; m.damageEnemy(enemy, 1, true); assert.equal(m.chargeBank, 1);
  advance(m, .5); assert.equal(m.charge, 100); assert.equal(m.chargeBank, 0);
});

test('full charge grants one bounded ability, rejects recast without spending, and freezes on pause/jump', () => {
  const m = new Starflight(); m.charge = 100;
  assert.equal(m.activate('laser'), true); assert.equal(m.charge, 0); assert.equal(m.timers.laser, 4);
  m.charge = 100; assert.equal(m.activate('laser'), false); assert.equal(m.charge, 100);
  assert.equal(m.activate('unknown'), false);
  advance(m, .5); close(m.timers.laser, 3.5);
  m.pause(true); m.update(.1); close(m.timers.laser, 3.5); m.pause(false);
  m.beginJump(); advance(m, 1); close(m.timers.laser, 3.5);
  assert.equal(m.activate('stasis'), false); assert.equal(m.charge, 100);
});

test('stasis slows hostile flight while player projectiles retain their speed', () => {
  const m = new Starflight(); m.charge = 100; m.activate('stasis');
  const hostile = m.addShot(50, 80, Math.PI / 2, 200, 4, 'enemy', 'pulse');
  const friendly = m.addShot(50, 200, -Math.PI / 2, 200, 4, 'player', 'pulse');
  m.update(.1);
  close(hostile.y, 80 + 20 * .32); close(friendly.y, 180);
});

test('a locked visible warning precedes actual fire and preserves a bounded volley', () => {
  const m = new Starflight(), e = m.spawnEnemy('gunship', 80, 95); e.fireAt = 0;
  m.update(1 / 120);
  assert.ok(e.warning); assert.equal(e.warning.angles.length, 3);
  const targetX = e.warning.targetX;
  m.setTarget(340, 600); advance(m, .5);
  assert.equal(e.warning.targetX, targetX);
  assert.equal(m.shots.filter(s => s.side === 'enemy').length, 0);
  advance(m, .6);
  assert.ok(m.shots.some(s => s.side === 'enemy'));
  assert.ok(m.shots.filter(s => s.side === 'enemy').length <= m.rules.shotCap);
});

test('boss progression offers eight quiet seconds then three distinct sectors and an endless cycle', () => {
  const m = new Starflight(); m.player.invuln = 10000;
  advance(m, 44.9); assert.equal(m.enemies.some(e => e.kind === 'boss'), false);
  advance(m, .2); const boss = m.enemies.find(e => e.kind === 'boss'); assert.ok(boss);
  m.damageEnemy(boss, boss.hp, true);
  assert.equal(m.phase, 'jump'); assert.equal(m.completedSectors, 1); assert.equal(m.shots.length, 0);
  advance(m, 7.9); assert.equal(m.sector, 1); assert.equal(m.enemies.length, 0);
  advance(m, .1); assert.equal(m.sector, 2); assert.equal(m.phase, 'combat');
  for (let i = 0; i < 2; i++) { const b = m.spawnEnemy('boss', 180, 125); m.damageEnemy(b, b.hp, true); advance(m, 8); }
  assert.equal(m.sector, 1); assert.equal(m.cycle, 1); assert.equal(m.completedSectors, 3);
});

test('last legal boss hit beats an incoming lethal hit in the same tick', () => {
  const m = new Starflight(), p = m.player, boss = m.spawnEnemy('boss', 180, 125);
  m.phase = 'boss'; p.hp = 1; p.invuln = 0; boss.hp = 1;
  m.addShot(180, 180, -Math.PI / 2, 12000, 4, 'player', 'pulse');
  m.addShot(p.x, p.y - 50, Math.PI / 2, 12000, 4, 'enemy', 'heavy');
  m.update(1 / 120);
  assert.equal(m.phase, 'jump'); assert.equal(m.state, 'play'); assert.equal(p.hp, 1);
});

test('pickups repair only to max, grant one shield and stay bounded', () => {
  const m = new Starflight(), p = m.player;
  m.pickups = ['repair', 'shield', 'rapid', 'charge'].map((kind, id) => ({ id, x: p.x, y: p.y, r: 12, age: 0, kind }));
  m.update(1 / 120);
  assert.equal(p.hp, p.maxHP); assert.equal(m.shieldCharges, 1); close(m.charge + m.chargeBank, 25); assert.equal(m.pickups.length, 0);
  p.invuln = 0; m.hurtPlayer(p.x, p.y); assert.equal(p.hp, p.maxHP); assert.equal(m.shieldCharges, 0);
  for (let i = 0; i < 200; i++) m.effect(1, 1, 'hit', .2);
  assert.equal(m.effects.length, 100);
  advance(m, .3); assert.ok(m.effects.length < 100);
});

test('a piercing laser damages two distinct swept enemies and cannot repeat one contact', () => {
  const m = new Starflight(), first = m.spawnEnemy('scout', 180, 100), second = m.spawnEnemy('scout', 180, 70);
  const hp = first.hp;
  m.addShot(180, 150, -Math.PI / 2, 12000, 5, 'player', 'laser', 2, true, 2);
  m.moveShots(1 / 120);
  assert.equal(first.hp, hp - 2); assert.equal(second.hp, hp - 2);
  assert.equal(m.shots.length, 0); assert.equal(m.charge, 0);
  m.moveShots(1 / 120); assert.equal(first.hp, hp - 2);
});

test('ordinary auto-fire has an input-only first-gate route without spending a charge ability', () => {
  const m = new Starflight({ difficulty: 'easy', seed: 7 });
  while (m.time < 70 && m.state === 'play' && m.completedSectors === 0) {
    const target = m.enemies.find(e => e.kind === 'boss') || m.enemies.filter(e => e.hp > 0 && e.y > 0 && e.y < m.player.y - 45).sort((a, b) => b.y - a.y)[0];
    let x = target?.x ?? 180 + Math.sin(m.time * .8) * 95, y = 620 + Math.sin(m.time * .6) * 45;
    for (const s of m.shots.filter(s => s.side === 'enemy' && s.vy > 0)) {
      const t = (y - s.y) / s.vy;
      if (t > 0 && t < .65) { const shotX = s.x + s.vx * t; if (Math.abs(shotX - x) < 28) x = shotX < 180 ? shotX + 44 : shotX - 44; }
    }
    m.setTarget(x, y); m.update(1 / 120);
  }
  assert.equal(m.state, 'play'); assert.equal(m.completedSectors, 1);
  assert.ok(m.time > 45 && m.time < 70); assert.equal(m.weapon, 'twin');
});

test('runtime hardpoints and aspects match the actual ship manifest at one shared draw size', () => {
  const a = JSON.parse(readFileSync(new URL('../assets/starflight/manifest.json', import.meta.url))), b = JSON.parse(readFileSync(new URL('../assets/starflight-v2/manifest.json', import.meta.url)));
  const manifest = { ships: { ...a.ships, ...b.ships } };
  for (const [kind, ship] of Object.entries(SHIPS)) {
    const source = manifest.ships[kind];
    assert.deepEqual(ship.muzzles, source.muzzles); assert.deepEqual(ship.engines, source.engines);
    assert.deepEqual(ship.solidBounds, source.solidBounds); assert.deepEqual(ship.pivot, source.pivot);
    close(ship.height / ship.width, source.size[1] / source.size[0]);
    const uv = ship.muzzles[0], p = shipPoint(kind, 100, 200, Math.PI / 2, uv);
    close(p.x, 100 - (uv[1] - .5) * ship.height); close(p.y, 200 + (uv[0] - .5) * ship.width);
  }
});

test('player shots emerge from the rotated actual twin barrels, including Hyper fan fire', () => {
  const m = new Starflight(); m.player.angle = .23;
  for (const hyper of [false, true]) {
    m.shots = []; m.timers.hyper = hyper ? 2 : 0; m.firePlayer();
    assert.equal(m.shots.length, hyper ? 5 : 2);
    for (const s of m.shots) {
      const from = shipPoint('player', m.player.x, m.player.y, m.player.angle, SHIPS.player.muzzles[s.port]);
      close(s.x, from.x); close(s.y, from.y); assert.deepEqual(s.from, from);
    }
  }
});

test('gunship and boss volleys cycle left, right and paired real moving cannon ports', () => {
  for (const kind of ['gunship', 'boss']) for (let volley = 0; volley < 3; volley++) {
    const m = new Starflight(), e = m.spawnEnemy(kind, 180, kind === 'boss' ? 125 : 95);
    e.volley = volley; e.fireAt = 0; m.update(1 / 120);
    const expected = kind === 'boss' ? [[0], [2], [0, 2]][volley] : [[0], [1], [0, 1]][volley];
    assert.deepEqual(e.warning.sources.map(s => s.port), expected);
    const source = e.warning.sources[0], point = shipPoint(kind, e.x, e.y, e.angle, SHIPS[kind].muzzles[source.port]);
    assert.deepEqual(source.from, point);
    m.fireEnemy(e);
    const shots = m.shots.filter(s => s.side === 'enemy'); assert.ok(shots.length);
    for (const s of shots) {
      const muzzle = e.warning.sources.find(p => p.port === s.port);
      assert.deepEqual(s.from, muzzle.from); close(s.x, muzzle.from.x); close(s.y, muzzle.from.y);
    }
  }
});

test('the broad guardian wings accept ordinary damage and overlapping hull pieces charge once', () => {
  for (const x of [90, 180, 270]) {
    const m = new Starflight(), e = m.spawnEnemy('boss', 180, 125), hp = e.hp;
    m.addShot(x, 230, -Math.PI / 2, 24000, 3.4, 'player', 'pulse');
    m.moveShots(1 / 120);
    assert.equal(e.hp, hp - 1); close(m.charge, 0); close(m.chargeBank, .8);
    close(m.effects.find(f => f.kind === 'hit').x, x);
  }
});

test('all seven choices have bounded durations and a slow earned bank cannot refill passively', () => {
  assert.deepEqual(Object.keys(STARFLIGHT_POWERS), ['laser', 'stasis', 'hyper', 'seeker', 'spiral', 'drones', 'nova']);
  for (const kind of Object.keys(STARFLIGHT_POWERS)) {
    const m = new Starflight(); m.charge = 100; m.chargeBank = 40;
    assert.equal(m.activate(kind), true); assert.equal(m.charge, 0); assert.equal(m.chargeBank, 0);
    assert.equal(m.timers[kind], STARFLIGHT_POWERS[kind]);
  }
  const m = new Starflight(); m.fireCooldown = 100;
  advance(m, 5); assert.equal(m.charge, 0);
  m.bankCharge(100); advance(m, 1); close(m.charge, 3); close(m.chargeBank, 97);
  m.pause(true); const frozen = JSON.stringify(m); m.update(.1); assert.equal(JSON.stringify(m), frozen);
  m.pause(false); m.phase = 'jump'; m.jumpRemaining = 2; advance(m, 1); close(m.charge, 3);
  assert.equal(m.activate('__proto__'), false); assert.equal(new Starflight({ difficulty: 'toString' }).difficulty, 'medium');
  m.phase = 'combat'; m.kills = 19; const enemy = m.spawnEnemy('scout', 100, 100); m.damageEnemy(enemy, enemy.hp, false);
  assert.equal(m.pickups.at(-1).kind, 'shield');
});

test('seeker missiles turn toward live targets at a capped rate and never exceed six live rounds', () => {
  const m = new Starflight(), e = m.spawnEnemy('gunship', 270, 250); m.charge = 100; m.activate('seeker');
  for (let i = 0; i < 5; i++) m.fireSeekers();
  const shots = m.shots.filter(s => s.kind === 'seeker'); assert.equal(shots.length, 6);
  const s = shots[0], old = s.heading; m.moveShots(.1);
  assert.equal(s.targetId, e.id); assert.ok(s.heading > old); assert.ok(s.heading - old <= .28 + 1e-7);
  assert.ok(shots.every(s => s.powered && s.damage === 3)); assert.equal(m.chargeBank, 0);
});

test('spiral fire follows real alternating curved trajectories rather than a visual-only trail', () => {
  const m = new Starflight(); m.charge = 100; m.activate('spiral'); m.firePlayer();
  const [a, b] = m.shots; m.moveShots(.08);
  assert.equal(a.kind, 'spiral'); assert.equal(b.kind, 'spiral');
  assert.ok(a.vx > 100 && b.vx < -100); assert.ok(a.vy < 0 && b.vy < 0);
  assert.equal(a.powered, true); assert.equal(b.powered, true);
});

test('defensive drones orbit, consume two actual intercepts each and do not grant reactor credit', () => {
  const m = new Starflight(); m.charge = 100; m.activate('drones'); advance(m, .3);
  assert.equal(m.drones.length, 2); const d = m.drones[0];
  close(Math.hypot(d.x - m.player.x, d.y - m.player.y), 33);
  for (let i = 0; i < 2; i++) {
    m.addShot(d.x, d.y - 30, Math.PI / 2, 6000, 4, 'enemy', 'pulse'); m.moveShots(1 / 120);
  }
  assert.equal(d.hp, 0); assert.equal(m.player.hp, m.player.maxHP); assert.equal(m.chargeBank, 0);
  m.updateDrones(1 / 120); assert.equal(m.drones.length, 1);
  m.timers.drones = 0; m.updateDrones(1 / 120); assert.equal(m.drones.length, 0);
});

test('nova clears only nearby danger, emits a bounded radial burst and cannot erase a full guardian', () => {
  const m = new Starflight(), p = m.player, e = m.spawnEnemy('boss', 180, 125); m.charge = 100;
  m.addShot(p.x, p.y - 80, Math.PI / 2, 200, 4, 'enemy', 'pulse');
  m.addShot(p.x, p.y - 220, Math.PI / 2, 200, 4, 'enemy', 'pulse');
  m.activate('nova'); assert.equal(m.shots.filter(s => s.kind === 'nova').length, 20);
  assert.equal(m.shots.filter(s => s.side === 'enemy').length, 1);
  m.fireCooldown = 100; advance(m, 1.5);
  assert.ok(e.hp > e.maxHP * .7); assert.equal(m.charge, 0); assert.equal(m.chargeBank, 0);
});

test('moving asteroids receive swept player hits and absorb hostile shots without granting credit', () => {
  const m = new Starflight(); m.spawnAsteroids(0); const h = m.hazards[0];
  Object.assign(h, { x: 180, px: 180, y: 300, py: 300 });
  const hp = h.hp;
  m.addShot(180, 350, -Math.PI / 2, 12000, 4, 'player', 'pulse'); m.moveShots(1 / 120);
  assert.equal(h.hp, hp - 1); close(m.chargeBank, .8);
  const bank = m.chargeBank;
  m.addShot(180, 250, Math.PI / 2, 12000, 4, 'enemy', 'pulse'); m.moveShots(1 / 120);
  assert.equal(h.hp, hp - 2); assert.equal(m.chargeBank, bank);
  m.damageHazard(h, 999, false); assert.equal(m.rocksBroken, 1);
  m.damageHazard(h, 999, true); assert.equal(m.rocksBroken, 1); assert.equal(m.chargeBank, bank);
});

test('the nearest asteroid is real cover before a player collision along the same fast ray', () => {
  const m = new Starflight(), p = m.player; p.invuln = 0; m.spawnAsteroids(0);
  Object.assign(m.hazards[0], { x: p.x, px: p.x, y: p.y - 50, py: p.y - 50 });
  m.addShot(p.x, p.y - 100, Math.PI / 2, 24000, 4, 'enemy', 'pulse'); m.moveShots(1 / 120);
  assert.equal(p.hp, p.maxHP); assert.equal(m.shots.filter(s => s.side === 'enemy').length, 0);
});

test('gravity has a two-second warning, real escape margin, bounded pull and no teleport or direct damage', () => {
  const m = new Starflight(); m.sector = 2; m.spawnField(); const f = m.fields[0], p = m.player;
  assert.ok(Math.hypot(f.x - p.x, f.y - p.y) - f.r >= 35.99);
  const inside = { x: f.x + f.r * .4, y: f.y };
  f.age = 1.99; assert.deepEqual(m.gravity(inside.x, inside.y), { x: 0, y: 0 });
  f.age = 2.5; const pull = m.gravity(inside.x, inside.y);
  assert.ok(pull.x < 0 && Math.hypot(pull.x, pull.y) <= 360);
  const oldHP = p.hp, oldX = p.x, oldY = p.y; m.update(1 / 120);
  assert.equal(p.hp, oldHP); assert.ok(Math.hypot(p.x - oldX, p.y - oldY) < 4.01);
  f.age = 7; m.updateFields(1 / 120); assert.equal(m.fields.length, 0);
});

test('new sectors use real new cannon families and the crescent forward notch stays open', () => {
  const m = new Starflight(); m.sector = 2;
  const beetle = m.spawnEnemy('scout', 80, 100), frigate = m.spawnEnemy('gunship', 180, 95), boss = m.spawnEnemy('boss', 180, 125);
  assert.equal(beetle.ship, 'beetle'); assert.equal(frigate.ship, 'frigate'); assert.equal(boss.ship, 'crescent');
  for (let volley = 0; volley < 9; volley++) {
    frigate.warning = null; frigate.volley = volley; frigate.fireAt = 0; m.moveEnemies(1 / 120);
    const ports = frigate.warning.sources.map(s => s.port), tube = Math.floor(volley / 3) % 3;
    assert.deepEqual(ports, volley % 3 === 2 ? [tube, tube + 3] : [tube + (volley % 3 ? 3 : 0)]);
  }
  const notch = shipPoint('crescent', 180, 125, 0, [.5, .86]);
  assert.ok(shipCircles('crescent', 180, 125).every(c => Math.hypot(notch.x - c.x, notch.y - c.y) > c.r + 7));
  const early = new Starflight(); early.spawnWave(0); assert.ok(early.enemies.every(e => e.ship === e.kind));
  early.enemies = []; early.spawnWave(2); assert.ok(early.enemies.some(e => e.ship === 'beetle')); assert.ok(early.enemies.some(e => e.ship === 'frigate'));
});

test('pause freezes the actual active gravity, drone, power and hazard families together', () => {
  const m = new Starflight(); m.sector = 2; m.spawnField(); m.fields[0].age = 2.5; m.spawnAsteroids(0);
  m.charge = 100; m.activate('drones'); advance(m, .3); m.pause(true);
  const frozen = JSON.stringify(m); for (let i = 0; i < 120; i++) m.update(1 / 60);
  assert.equal(JSON.stringify(m), frozen);
});

test('smaller ships retain measured aspects and the player seven-unit hurt core', () => {
  assert.deepEqual(['player', 'scout', 'gunship', 'boss', 'beetle', 'frigate', 'crescent'].map(k => SHIPS[k].width), [52, 40, 74, 196, 40, 74, 196]);
  const m = new Starflight({ height: 613 });
  assert.equal(m.player.r, 7); close(m.player.y, 613 * .9);
  close(SHIPS.crescent.height, 196 * 544 / 768);
});

test('reactor reservation projects targets but never changes current player position', () => {
  const reserve = { x: 47, y: 590, r: 60 }, m = new Starflight({ height: 613, controlReserve: reserve });
  reserve.r = 500; assert.equal(m.controlReserve.r, 60);
  const p = m.player, old = { x: p.x, y: p.y };
  m.setTarget(47, 590);
  assert.ok(Math.hypot(p.targetX - 47, p.targetY - 590) >= 61 - 1e-7);
  assert.ok(p.targetX >= PLAYER_EDGE && p.targetY <= 575);
  assert.deepEqual({ x: p.x, y: p.y }, old);
  for (const bad of [{ x: NaN, y: 2, r: 5 }, { x: 2, y: 2, r: 0 }, 4, 'circle']) assert.equal(m.setControlReserve(bad), false);
  assert.equal(m.controlReserve.r, 60);
  assert.equal(m.setControlReserve(), true); assert.equal(m.controlReserve, null);
  m.setTarget(47, 590); assert.equal(p.targetX, 47); assert.equal(p.targetY, 575);
});

test('swept reactor exclusion retains smooth full-speed motion and the bottom central/right lanes', () => {
  for (const height of [613, 656]) {
    const c = { x: 47, y: height - 23, r: 60 }, m = new Starflight({ height, controlReserve: c }), p = m.player;
    const targets = [[20, height - 38], [20, height * .7], [340, height - 38], [47, height], [180, height - 38]];
    for (let repeat = 0; repeat < 3; repeat++) for (const [x, y] of targets) {
      m.setTarget(x, y);
      for (let i = 0; i < 180; i++) {
        const oldX = p.x, oldY = p.y;
        m.movePlayer(1 / 120);
        assert.ok(Math.hypot(p.x - c.x, p.y - c.y) >= c.r - 1e-6, `control overlap at ${height}: ${p.x},${p.y}`);
        assert.ok(Math.hypot(p.x - oldX, p.y - oldY) <= 4.000001);
        assert.ok(p.x >= PLAYER_EDGE && p.x <= m.width - PLAYER_EDGE && p.y >= height * .35 && p.y <= height - 38);
      }
    }
    assert.ok(Math.abs(p.x - 180) < .01 && Math.abs(p.y - (height - 38)) < .01);
  }
});

test('a newly measured reactor overlapping the ship separates gradually and pause stays frozen', () => {
  const m = new Starflight({ height: 613 }), p = m.player, c = { x: p.x - 10, y: p.y, r: 60 };
  const oldX = p.x, oldY = p.y; m.setControlReserve(c);
  assert.equal(p.x, oldX); assert.equal(p.y, oldY);
  m.movePlayer(1 / 120);
  assert.ok(Math.hypot(p.x - oldX, p.y - oldY) <= 4);
  assert.ok(Math.hypot(p.x - c.x, p.y - c.y) < c.r, 'no one-frame ejection');
  for (let i = 0; i < 600; i++) m.movePlayer(1 / 120);
  assert.ok(Math.hypot(p.x - c.x, p.y - c.y) >= c.r - 1e-6);
  m.pause(true); const frozen = JSON.stringify(m); m.update(.1); assert.equal(JSON.stringify(m), frozen);
});

test('banked player bounds use the shared hull edge for targets, motion and control feasibility', () => {
  close(PLAYER_EDGE, SHIPS.player.width * .52);
  assert.ok(PLAYER_EDGE > 25.996, 'clearance exceeds the measured rotated opaque wing extent');
  for (const width of [260, 360, 412]) {
    const m = new Starflight({ width, height: 613 }), p = m.player;
    for (const side of [-1, 1]) {
      m.setTarget(side * 1e5, p.y);
      close(p.targetX, side < 0 ? PLAYER_EDGE : width - PLAYER_EDGE);
      for (let i = 0; i < 240; i++) {
        m.movePlayer(1 / 120);
        assert.ok(p.x >= PLAYER_EDGE && p.x <= width - PLAYER_EDGE);
      }
      assert.ok(Math.abs(p.x - p.targetX) < .001 && Math.abs(p.vx) < .01);
      p.vx = side * 480; m.movePlayer(1 / 120);
      close(p.x, p.targetX); close(p.vx, 0);
    }
    m.setControlReserve({ x: PLAYER_EDGE, y: 575, r: 50 }); m.setTarget(-100, 575);
    assert.ok(p.targetX >= PLAYER_EDGE && p.targetX <= width - PLAYER_EDGE);
    assert.ok(Math.hypot(p.targetX - PLAYER_EDGE, p.targetY - 575) >= 50);
  }
});
