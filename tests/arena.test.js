import { test } from 'node:test';
import assert from 'node:assert/strict';

globalThis.Image = class { complete = true; naturalWidth = 1; decode() { return Promise.resolve(); } };
const prefs = new Map();
globalThis.localStorage = { getItem: key => prefs.get(key) ?? null, setItem: (key, value) => prefs.set(key, value) };
const { Arena, paddleY } = await import('../src/arena.js');

test('lower geometry includes the full TITAN halo and keeps shield before drain', () => {
  for (const [H, s, expected] of [[729, 393 / 360, 614], [785, 915 / 800, 675]]) {
    const l = new Arena(360, H, { uiScale: s });
    assert.equal(l.paddle.y, expected);
    assert.equal(l.balls[0].y, l.paddle.y - l.ballRadius, 'serve uses final geometry');
    assert.equal(l.drainY - l.paddle.y, 20); assert.equal(l.shieldY - l.paddle.y, 18);
    const orb = l.kitAnchor();
    assert((orb.y - orb.r - (l.drainY + 10 + 21)) * s >= 8, 'last-live TITAN halo clears Kit');
    assert((orb.y - orb.r - l.playClipY) * s >= 8 - 1e-9);
  }
  assert.equal(paddleY(600, 520, 1), 520, 'short-screen level guard survives');
});

test('Aim ready requires a real press, clears on release and persists into another run', () => {
  prefs.delete('breach.aimReadySeen');
  const l = new Arena(360, 729);
  l.showAimReady(); assert.equal(l.aimReadySeen, false, 'passive initial serve is silent');
  l.pointerDown(180, 690); assert.equal(l.aimReadySeen, true); assert.equal(l.aimReadyUntil, 1);
  assert.equal(prefs.get('breach.aimReadySeen'), 'true');
  l.pointerUp(); assert.equal(l.aimReadyUntil, 0); assert.equal(l.aim, null);
  l.serve(); l.pointerDown(180, 690); assert.equal(l.aimReadyUntil, 0, 'next catch cannot resurrect the hint');
  const next = new Arena(360, 729); next.pointerDown(180, 690);
  assert.equal(next.aimReadyUntil, 0, 'new runs keep the acknowledgement');
});

test('a held-input Focus collision can teach once, while cancel never launches', () => {
  prefs.delete('breach.aimReadySeen');
  const l = new Arena(360, 729), b = l.balls[0];
  l.aim = null; b.caught = false; b.vx = 0; b.vy = -345;
  l.pointerDown(180, 690); l.ptr.stillT = 0.2; l.onPaddle(b);
  assert(b.caught && !l.aim.serve && l.aimReadySeen);
  l.pointerCancel(); assert.equal(l.aimReadyUntil, 0); assert.equal(b.caught, true); assert.equal(l.focus, 2);
});

test('compact top HUD uses the game font for scores and shows five lives above play', () => {
  const l = new Arena(360, 729, { uiScale: 393 / 360 }); l.hudY = 34; l.lives = 5;
  const labels = [], images = [], gradient = { addColorStop() {} };
  const g = new Proxy({ globalAlpha: 1 }, {
    get: (target, key) => key in target ? target[key] : key === 'fillText' ? (str, x, y) => labels.push({ str, x, y, font: target.font }) : key === 'drawImage' ? (...args) => images.push(args) : key.startsWith('create') ? () => gradient : () => {},
  });
  for (const score of [999999, 9999999, Number.MAX_SAFE_INTEGER]) {
    labels.length = images.length = 0; l.score = score; l.drawHUDBase(g);
    // The AIM sockets are rendered gems too (x >= 140); the lives sit left of them.
    assert.equal(new Set(images.filter(args => args[1] < 140).map(args => args[1])).size, 5, 'all five life positions draw');
    const value = labels.filter(p => p.str !== 'AIM').at(-1);
    assert(value.font.includes('Lilita One') && !value.font.includes('Rubik'));
    assert(value.y < 60, 'score lives in the top HUD');
    assert.equal(value.str, score === 999999 ? '999,999' : score === 9999999 ? '10M' : '9010T');
  }
});

test('Invasion has no Kit control or K action while its earned centre-return Titan remains', () => {
  const l = new Arena(360, 729), b = l.balls[0];
  l.paddle.charge = 1;
  l.drawDeck(new Proxy({}, { get() { throw new Error('Invasion tried to draw Kit'); } }));
  const pops = l.fx.pops.length;
  assert.equal(l.activateKitPower(), false);
  l.activateKitPower = () => { throw new Error('Invasion routed K to Kit'); };
  l.key('K', true);
  assert.equal(l.paddle.charge, 1); assert.equal(l.fx.pops.length, pops);
  l.aim = null; Object.assign(b, { caught: false, x: l.paddle.x, vx: 0, vy: -345 });
  l.onPaddle(b);
  assert.equal(l.paddle.charge, 0); assert.equal(b.titan, 7);
});

test('levels without a core keep brick and Focus rewards without a phantom ready charge', () => {
  const l = new Arena(360, 729); l.coreMode = 'none'; l.focus = 0;
  for (let i = 0; i < 14; i++) l.brokeBrick();
  assert.equal(l.bricksBroken, 14); assert.equal(l.focus, 1); assert.equal(l.paddle.charge, 0);
  assert(l.fx.pops.every(p => !p.text?.includes('CORE READY')));
});
