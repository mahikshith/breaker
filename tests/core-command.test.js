import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { makeBall, stepBall } from '../src/physics.js';

globalThis.Image = class { complete = true; naturalWidth = 1; width = 512; height = 768; decode() { return Promise.resolve(); } };
const prefs = new Map();
globalThis.localStorage = { getItem: k => prefs.get(k) ?? null, setItem: (k, v) => prefs.set(k, v) };
// Vault's module creates one cached bar canvas; these tests exercise its real Ward input, not rendering.
const gradient = { addColorStop() {} }, context = new Proxy({}, { get: (_, k) => k === 'createLinearGradient' ? () => gradient : () => {} });
globalThis.document = { createElement: () => ({ getContext: () => context }) };
const { Arena } = await import('../src/arena.js');
const { Carrier } = await import('../src/carrier.js');
const { Vault } = await import('../src/vault.js');
const { companionFrame, nixExpression, spacePowerLayout, spacePowerAt } = await import('../src/space-companions.js');
const { families } = JSON.parse(readFileSync(new URL('../assets/space-companions/manifest.json', import.meta.url), 'utf8'));

function manual() { const l = new Arena(360, 729, { ballRadius: 7.5 }); l.coreMode = 'manual'; l.paddle.charge = 1; return l; }
const snapshot = l => ({ charge: l.paddle.charge, castAt: l.coreCastAt, balls: l.balls.map(b => ({ ...b, trail: b.trail.slice() })), fx: l.fx.rings.length });

test('manual command rejects unavailable resources and terminal/wrong modes without spending or changing a ball', () => {
  const cases = [
    ['no charge', l => { l.paddle.charge = 0; }],
    ['partial charge', l => { l.paddle.charge = .999; }],
    ['no balls', l => { l.balls = []; }],
    ['only dead balls', l => { l.balls[0].dead = true; }],
    ['lost', l => { l.state = 'lost'; }],
    ['won', l => { l.state = 'won'; }],
    ['automatic mode', l => { l.coreMode = 'titan'; }],
    ['Ward mode', l => { l.coreMode = 'ward'; }],
    ['another live TITAN', l => { const b = makeBall(50, 300, 0, -345, 10); b.titan = 2; l.balls.push(b); }],
  ];
  for (const [name, arrange] of cases) {
    const l = manual(); arrange(l); const before = snapshot(l);
    assert.equal(l.canUseCorePower(), false, name); assert.equal(l.activateCorePower(), false, name);
    assert.deepEqual(snapshot(l), before, name);
  }
});

test('a caught live ball has priority over a lower moving ball and dead caught balls', () => {
  const l = manual(), dead = makeBall(40, 650, 0, -345, 7.5), low = makeBall(80, 600, 0, -345, 7.5), caught = makeBall(180, 400, 0, -345, 7.5);
  dead.dead = dead.caught = true; caught.caught = true; l.balls = [dead, low, caught]; l.kitTime = 12.375;
  assert(l.activateCorePower()); assert.equal(l.paddle.charge, 0); assert.equal(l.coreCastAt, 12.375);
  assert.equal(caught.titan, 7); assert.equal(caught.r, 10); assert(caught.caught, 'command does not release aim');
  assert.equal(low.titan, undefined); assert.equal(low.r, 7.5); assert.equal(dead.titan, undefined);
  assert.equal(l.balls.filter(b => b.titan > 0).length, 1);
});

test('without a catch, the lowest live ball receives the sole seven-second command', () => {
  const l = manual(); l.aim = null;
  const upper = makeBall(40, 250, 0, -345, 7.5), lower = makeBall(120, 520, 0, -345, 7.5), dead = makeBall(200, 650, 0, -345, 7.5);
  dead.dead = true; l.balls = [upper, dead, lower];
  assert(l.activateCorePower()); assert.equal(lower.titan, 7); assert.equal(lower.r, 10);
  assert.equal(upper.titan, undefined); assert.equal(dead.titan, undefined); assert.equal(l.balls.length, 3);
});

test('repeated K presses cannot double-spend, refresh TITAN or overwrite the cast timestamp', () => {
  const l = manual(); l.kitTime = 2; l.key('K', true); const b = l.balls[0];
  assert.equal(b.titan, 7); assert.equal(l.paddle.charge, 0); assert.equal(l.coreCastAt, 2);
  b.titan = 5; l.kitTime = 4; l.paddle.charge = 1;
  for (let i = 0; i < 5; i++) { l.key('k', true); l.key('k', false); }
  assert.equal(b.titan, 5); assert.equal(l.paddle.charge, 1); assert.equal(l.coreCastAt, 2); assert.equal(l.fx.rings.length, 1);
});

test('a real manual-mode centre paddle bounce keeps its charge and ordinary radius', () => {
  const l = manual(), b = makeBall(l.paddle.x, l.paddle.y - 24, 0, 345, 7.5); l.balls = [b]; l.aim = null;
  const world = l.world(); world.onPaddle = ball => l.onPaddle(ball); stepBall(b, .1, world);
  assert(b.vy < 0); assert.equal(b.titan, undefined); assert.equal(b.r, 7.5); assert.equal(l.paddle.charge, 1); assert.equal(l.coreCastAt, -Infinity);
});

test('SPLIT widens coverage without copying an active manual TITAN or its enlarged radius', () => {
  const l = manual(); l.release(); const original = l.balls[0]; assert(l.activateCorePower());
  l.applyPower('split'); assert.equal(l.balls.length, 3); assert.equal(original.titan, 7); assert.equal(original.r, 10);
  for (const b of l.balls.filter(b => b !== original)) { assert.equal(b.r, 7.5); assert(!(b.titan > 0)); assert.equal(b.caught, false); assert(Math.abs(Math.hypot(b.vx, b.vy) - l.speed) < 1e-7); }
  assert.equal(l.paddle.charge, 0);
});

test('TITAN expiry returns to the configured ordinary radius', () => {
  for (const radius of [6, 7.5]) {
    const l = new Arena(360, 729, { ballRadius: radius }); l.coreMode = 'manual'; l.paddle.charge = 1; l.release();
    assert(l.activateCorePower()); const b = l.balls[0]; b.titan = .001; l.hitStop = 0;
    l.update(1 / 120); assert.equal(b.titan, 0); assert.equal(b.r, radius);
  }
});

test('Carrier escape cannot spend an otherwise full and usable manual charge', () => {
  const l = new Carrier(360, 729, 393 / 360); l.paddle.charge = 1; assert(l.canUseCorePower());
  for (const c of l.crew) while(c.hp>0) l.hitTarget(c.id, {});
  assert.equal(l.phase, 'escape'); const before = snapshot(l); l.key('K', true);
  assert.equal(l.canUseCorePower(), false); assert.deepEqual(snapshot(l), before);
});

test('Vault Quick Volley K opens four choices and Brick Ward preserves its real shield target', () => {
  const l = new Vault(360, 729, 393 / 360); l.phase = 'rescue'; l.paddle.charge = 1; l.t = 12;
  l.venom.phase = 'warn'; l.venom.t = 0; l.venom.target = { br: { id: 77 } };
  l.key('K', true);
  assert(l.powerMenuOpen); assert.equal(l.paddle.charge, 1); assert.equal(l.venom.ward, null);
  l.key('1', true);
  assert.equal(l.coreMode, 'ward'); assert.equal(l.paddle.charge, 0); assert.equal(l.venom.ward.id, 77); assert.equal(l.kitCastAt, 12);
  assert(!(l.balls[0].titan > 0)); assert.equal(l.balls[0].r, 6);
});

test('Kit menu fits four single-row phone targets and keeps the face clear', () => {
  for (const [H, scale] of [[729, 393 / 360], [785, 412 / 360]]) {
    const l = new Vault(360, H, scale), a = spacePowerLayout(l);
    assert.deepEqual(a.choices.map(c => c.id), ['shield', 'arrows', 'titan', 'five']);
    assert(a.choices.every(c => c.w * scale >= 44 && c.h * scale >= 44 && c.y === a.choices[0].y));
    assert(a.y > 44 / scale && a.x + a.w <= l.W && a.y + a.h < l.kitAnchor().y - l.kitAnchor().r);
    for (const c of a.choices) assert.equal(spacePowerAt(l, c.x + c.w / 2, c.y + c.h / 2), c.id);
  }
});

test('Kit menu freezes the world, rejects unavailable Ward and cancels without spending', () => {
  const l = new Vault(360, 729); l.phase = 'rescue'; l.paddle.charge = 1;
  assert(l.activateKitPower()); const before = [l.t, l.kitTime, l.snake.chew, l.balls[0].y];
  l.update(10); assert.deepEqual([l.t, l.kitTime, l.snake.chew, l.balls[0].y], before);
  assert.equal(l.chooseSpacePower('shield'), false); assert(l.powerMenuOpen); assert.equal(l.paddle.charge, 1);
  l.closePowerMenu(); assert.equal(l.paddle.charge, 1); assert(l.balls[0].caught);
  for (const phase of ['intro', 'caught', 'escape']) { l.phase = phase; assert.equal(l.activateKitPower(), false); }
});

test('Kit Arrows uses physical twin shots, spends once and can resume the venom coach', () => {
  const l = new Vault(360, 729); l.phase = 'rescue'; l.paddle.charge = 1; l.wardCoach = true;
  assert(l.activateKitPower()); l.key('2', true);
  assert.equal(l.powerMenuOpen, false); assert.equal(l.paddle.charge, 0); assert.equal(l.paddle.laserT, 10);
  assert.equal(l.wardCoach, false); assert(l.wardCoachSeen); assert.equal(l.venom.ward, null);
  assert.equal(l.chooseSpacePower('arrows'), false);
  l.release(); l.updateShots(1 / 120);
  assert.equal(l.shots.length, 2); assert(l.shots.every(s => s.kind === 'arrow' && s.vy === -560));
  const shot = l.shots[0]; shot.x = 28; shot.y = 405; l.updateShots(1 / 120);
  assert(!l.shots.includes(shot), 'the real granite cell stops an arrow');
});

test('Kit Cosmic and Ball Fan retain canonical power rules and never become automatic centre casts', () => {
  const l = new Vault(360, 729); l.phase = 'rescue'; l.paddle.charge = 1;
  const original = l.balls[0]; l.onPaddle(original); assert(!(original.titan > 0)); assert.equal(l.paddle.charge, 1);
  assert(l.activateKitPower()); l.key('3', true);
  assert.equal(original.titan, 10); assert.equal(original.r, 10); assert.equal(l.paddle.charge, 0);
  l.paddle.charge = 1; assert(l.activateKitPower()); l.key('4', true);
  assert.equal(l.balls.length, 5); assert.equal(l.balls.filter(b => b.titan > 0).length, 1); assert(l.balls.every(b => !b.caught));
  assert.deepEqual(l.grid.unpierceable, [9, 8], 'protected granite and cage bars retain their approved collision rule');
});

test('Kit offensive powers still score real brick breaks without charging their own replacements', () => {
  const l = new Vault(360, 729); l.phase = 'rescue';
  for (const power of [{ shot: true }, { titan: 3 }, {}]) {
    const br = l.bricks.find(br => !br.gone && br.kind === 6 && br.hp === 1);
    l.hitCell(br.c, br.r, { x: br.x + 4, y: br.y + 4, ...power });
  }
  assert.equal(l.bricksBroken, 3); assert.equal(l.combo, 3); assert.equal(l.paddle.charge, 1 / 12);
});

test('companion frames use authored fps, start at negative age and clamp an ending action', () => {
  assert.equal(companionFrame(families.nix, 'command', -.2), 6);
  assert.equal(companionFrame(families.nix, 'command', .099), 6);
  assert.equal(companionFrame(families.nix, 'command', .1), 7);
  assert.equal(companionFrame(families.nix, 'command', .4), 10);
  assert.equal(companionFrame(families.nix, 'command', .5), 0);
  assert.equal(companionFrame(families.nix, 'command', 12), 0);
  assert.equal(companionFrame(families.tick, 'secure', .7), 7);
  assert.equal(companionFrame(families.tick, 'secure', .8), 7);
  assert.equal(companionFrame(families.nix, 'unknown', 100), 0, 'missing action falls back to authored idle');
  const family = { clips: { idle: { frames: [2, 4, 6], fps: 4, loop: true } } };
  assert.equal(companionFrame(family, 'idle', .249), 2); assert.equal(companionFrame(family, 'idle', .25), 4);
  assert.equal(companionFrame(family, 'idle', .5), 6); assert.equal(companionFrame(family, 'idle', .75), 2); assert.equal(companionFrame(family, 'idle', 1), 4);
});

test('Nix gives terminal, command, raid and securing reactions priority over ready/idle', () => {
  const l = manual(); l.clock = 10; l.kitTime = 10; l.coreCastAt = 9.8; l.phase = 'carrier';
  l.crew = [{ securedAt: 9.7 }]; l.raid = { stage: 'extract' };
  l.state = 'lost'; assert.equal(nixExpression(l), 'loss');
  l.state = 'won'; assert.equal(nixExpression(l), 'win');
  l.state = 'play'; l.phase = 'escape'; assert.equal(nixExpression(l), 'win');
  l.phase = 'retreat'; assert.equal(nixExpression(l), 'win');
  l.phase = 'carrier'; assert.equal(nixExpression(l), 'command');
  l.kitTime = 11; assert.equal(nixExpression(l), 'warning');
  l.raid.stage = 'breach'; assert.equal(nixExpression(l), 'secured');
  l.clock = 11; assert.equal(nixExpression(l), 'ready');
  l.paddle.charge = .99; assert.equal(nixExpression(l), 'idle');
});

test('a full charge while TITAN is active shows idle rather than an unusable ready command', () => {
  const l = manual(); l.clock = l.kitTime = 10; l.crew = []; l.balls[0].titan = 4;
  assert.equal(l.canUseCorePower(), false); assert.equal(nixExpression(l), 'idle');
  l.balls[0].dead = true; l.balls.push(makeBall(50, 400, 0, -345, 7.5));
  assert(l.canUseCorePower()); assert.equal(nixExpression(l), 'ready', 'a dead TITAN does not block a different live ball');
  l.balls = []; assert.equal(nixExpression(l), 'idle');
});
