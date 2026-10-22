import { test } from 'node:test';
import assert from 'node:assert/strict';
import { updateKitPresence, chargePulse, READY } from '../src/kit.js';

const level = () => ({ t: 0, kitTime: 0, paddle: { charge: 0 }, kitCastAt: -Infinity });

test('a filled ring beats for five seconds, then keeps a soft ready glow until spent', () => {
  const l = level(), buzz = [];
  const had = Object.getOwnPropertyDescriptor(globalThis.navigator, 'vibrate');
  Object.defineProperty(globalThis.navigator, 'vibrate', { value: p => buzz.push(p), configurable: true });
  updateKitPresence(l);
  assert.deepEqual(chargePulse(l), { beat: 0, glow: 0 }, 'nothing while charging');
  l.paddle.charge = 1; l.kitTime = 10; updateKitPresence(l);
  assert.equal(l.kitFullAt, 10);
  assert.equal(buzz.length, 1, 'one short double buzz on filling');
  const beats = [];
  for (let t = 0; t < READY.beatFor; t += .01) { l.kitTime = 10 + t; beats.push(chargePulse(l).beat); }
  assert.ok(Math.max(...beats) > .9, 'it visibly beats');
  assert.ok(beats.filter(b => b > .5).length > 20, 'more than one beat');
  l.kitTime = 10 + READY.beatFor + .5;
  assert.deepEqual(chargePulse(l), { beat: 0, glow: .35 }, 'settles to a steady glow');
  updateKitPresence(l);
  assert.equal(buzz.length, 1, 'no repeat buzz while still full');
  l.paddle.charge = 0;
  assert.deepEqual(chargePulse(l), { beat: 0, glow: 0 }, 'spent: back to normal');
  if (had) Object.defineProperty(globalThis.navigator, 'vibrate', had); else delete globalThis.navigator.vibrate;
});
