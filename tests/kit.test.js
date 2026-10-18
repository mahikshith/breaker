import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kitExpression, updateKitPresence, kitLayout, kitOrbContains, kitTap } from '../src/kit.js';

test('Kit reacts to player moments and ignores expired or dead-ball events', () => {
  for (const [level, clip] of [
    [{ aim: { serve: true } }, 'Idle'],
    [{ aim: { serve: false } }, 'Focus'],
    [{ combo: 5 }, 'Grin'],
    [{ t: 10, kitShockUntil: 11 }, 'Shock'],
    [{ danger: 0.7 }, 'Worried'],
    [{ state: 'won' }, 'Cheer'],
    [{ phase: 'escape', danger: 1 }, 'Cheer'],
    [{ phase: 'frenzy', danger: 1 }, 'Cheer'],
    [{ paddle: { stun: 0.1 } }, 'Hurt'],
    [{ balls: [{ titan: 1 }] }, 'Laugh'],
    [{ t: 11, kitShockUntil: 11 }, 'Idle'],
    [{ balls: [{ titan: 4, dead: true }] }, 'Idle'],
    [{ phase: 'formation', dangerY: 500, lowestY: () => 470 }, 'Worried'],
    [{ phase: 'formation', dangerY: 500, lowestY: () => 300 }, 'Idle'],
    [{ phase: 'landed' }, 'Worried'],
  ]) assert.equal(kitExpression(level), clip);
  assert.equal(kitExpression(), 'Idle');
});

test('terminal and urgent reactions take priority over rewards and aiming', () => {
  const l = { state: 'won', t: 10, kitShockUntil: 11, paddle: { stun: 1 }, balls: [{ titan: 1 }], danger: 1, aim: { serve: false }, combo: 8 };
  assert.equal(kitExpression(l), 'Cheer');
  l.state = 'lost'; assert.equal(kitExpression(l), 'Shock');
  l.state = 'play'; assert.equal(kitExpression(l), 'Shock');
  l.t = 11; assert.equal(kitExpression(l), 'Hurt');
  l.paddle.stun = 0; assert.equal(kitExpression(l), 'Laugh');
  l.balls[0].titan = 0; assert.equal(kitExpression(l), 'Worried');
  l.danger = 0.69; assert.equal(kitExpression(l), 'Focus');
  l.aim = null; assert.equal(kitExpression(l), 'Grin');
});

test('full charge and a later cast each open one window; a live window does not refresh', () => {
  const l = { t: 10, paddle: { charge: 1 }, kitCastAt: -Infinity };
  updateKitPresence(l); assert.equal(l.kitBodyUntil, 22);
  l.t = 12; updateKitPresence(l); assert.equal(l.kitBodyUntil, 22);
  l.kitCastAt = 12; l.paddle.charge = 0; updateKitPresence(l); assert.equal(l.kitBodyUntil, 22);
  l.t = 25; updateKitPresence(l); assert.equal(l.kitBodyUntil, 22);
  l.kitCastAt = 25; updateKitPresence(l); assert.equal(l.kitBodyUntil, 37);
  l.t = 26; updateKitPresence(l); assert.equal(l.kitBodyUntil, 37);
  assert.equal(l.paddle.charge, 0);
});

test('presentation can expire while the coaching world clock stays frozen', () => {
  const l = { t: 10, kitTime: 10, paddle: { charge: 1 } };
  updateKitPresence(l); assert.equal(l.kitBodyUntil, 22);
  l.kitTime = 40; updateKitPresence(l);
  assert.equal(l.t, 10); assert.equal(l.kitBodyUntil, 22); assert.equal(l.paddle.charge, 1);
  assert.equal(kitExpression(l), 'Idle');
  l.paddle.charge = 0; l.kitCastAt = 10; updateKitPresence(l);
  assert.equal(l.kitBodyAt, 40); assert.equal(l.kitBodyUntil, 52);
});

test('the face orb stays at the safe bottom-left without a body or visible track layout', () => {
  for (const [H, s] of [[729, 393 / 360], [785, 915 / 800]]) {
    const orb = kitLayout({ H, kitUIScale: s });
    assert.equal(orb.r * 2 * s, 52);
    assert(Math.abs((orb.x - orb.r) * s - 12) < 1e-9);
    assert(Math.abs((H - orb.y - orb.r) * s - 4) < 1e-9);
    assert.deepEqual(Object.keys(orb), ['x', 'y', 'r']);
  }
});

test('Kit needs a deliberate orb tap; crossing, dragging out and back, and corners do not fire', () => {
  const orb = { x: 64, y: 700, r: 26 }, press = { x: 64, y: 700, clientX: 64, clientY: 700 };
  assert(kitTap(press, 65, 701, 65, 701, orb));
  assert(!kitTap({ ...press, x: 120, clientX: 120 }, 64, 700, 64, 700, orb));
  assert(!kitTap({ ...press, cancelled: true }, 64, 700, 64, 700, orb));
  assert(!kitTap(press, 64, 700, 73, 700, orb));
  assert(!kitOrbContains(orb, 88, 724));
});

test('cast and short ward feedback remain readable, then live danger returns', () => {
  const l = { coreMode: 'ward', t: 10, kitCastAt: 9, kitReactionAt: 9.5, kitWardResult: 'held', canUseKitPower: () => false };
  assert.equal(kitExpression(l), 'Cheer');
  l.danger = 0.8; assert.equal(kitExpression(l), 'Cheer');
  l.t = 11; assert.equal(kitExpression(l), 'Worried');
  l.kitCastAt = 10.9; assert.equal(kitExpression(l), 'Focus');
  l.kitCastAt = 9; l.danger = 0; assert.equal(kitExpression(l), 'Idle');
  l.canUseKitPower = () => true; assert.equal(kitExpression(l), 'Focus');
});
