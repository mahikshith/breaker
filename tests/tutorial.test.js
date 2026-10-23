// The ball-control tutorial (src/tutorial.js): each step ends when the player does the thing, in order; Skip and the
// finish are remembered; the Vault holds its serpent and forgives a dropped ball while it runs. Purpose cards (src/purpose.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';

globalThis.Image ??= class { complete = true; naturalWidth = 256; naturalHeight = 256; width = 256; height = 256; decode() { return Promise.resolve(); } };
const stub = () => { const f = new Proxy(function () {}, { get: (_, k) => k === 'addColorStop' ? () => {} : f, apply: () => f, set: () => true }); return f; };
globalThis.document ??= { createElement: () => ({ getContext: () => stub(), width: 0, height: 0 }) };
globalThis.Path2D ??= class { moveTo() {} lineTo() {} quadraticCurveTo() {} };
const prefs = new Map();
globalThis.localStorage = { getItem: k => prefs.get(k) ?? null, setItem: (k, v) => prefs.set(k, String(v)) };
const fresh = () => prefs.clear();

const { Tutorial, STEPS, TUT, tutorialDone } = await import('../src/tutorial.js');
const { Coach } = await import('../src/coach.js');
const { Vault } = await import('../src/vault.js');
const { PURPOSE, PURPOSE_AT, openPurpose, SHOWN } = await import('../src/purpose.js');

const play = { serveWaiting: false, holding: false, paddleX: 180, drops: 0, blocked: false };

test('steps run aim, serve, move, edge, centre, ram, capsule, done', () => {
  assert.deepEqual(STEPS.map(s => s.id), ['aim', 'serve', 'move', 'edge', 'centre', 'ram', 'capsule', 'done']);
});

test('aim: holding on the waiting ball long enough advances; a short tap-and-lift serves through both steps', () => {
  fresh(); const t = new Tutorial();
  t.feed(TUT.hold / 2, { ...play, serveWaiting: true, holding: true }); assert.equal(t.id, 'aim');
  t.feed(.1, { ...play, serveWaiting: true, holding: false }); t.feed(TUT.hold / 2, { ...play, serveWaiting: true, holding: true });
  assert.equal(t.id, 'aim', 'letting go resets the hold');
  t.feed(TUT.hold, { ...play, serveWaiting: true, holding: true }); assert.equal(t.id, 'serve');
  t.served(); assert.equal(t.id, 'move');
  const quick = new Tutorial(); quick.served(); assert.equal(quick.id, 'move', 'a tap that serves skips aim and serve');
});

test('move needs real paddle travel, not just a touch', () => {
  const t = new Tutorial(); t.served();
  t.feed(.016, { ...play, paddleX: 180 }); t.feed(.016, { ...play, paddleX: 200 }); assert.equal(t.id, 'move');
  t.feed(.016, { ...play, paddleX: 180 + TUT.move }); assert.equal(t.id, 'edge');
});

test('edge and centre hits advance only their own step', () => {
  const t = new Tutorial(); t.served(); t.i = 3;
  t.hit(0); assert.equal(t.id, 'edge', 'a centre hit does not count as an edge hit');
  t.hit(.3); assert.equal(t.id, 'edge');
  t.hit(-TUT.edge); assert.equal(t.id, 'centre');
  t.hit(.9); assert.equal(t.id, 'centre', 'an edge hit does not count as centre');
  t.hit(.2); assert.equal(t.id, 'ram');
});

test('ram ends on the launch, the capsule step asks for a drop and ends on the catch, then the closing chip times out', () => {
  fresh(); const t = new Tutorial(); t.i = 5;
  t.caught(); assert.equal(t.id, 'ram', 'a capsule does not end the ram step');
  t.ramLaunched(); assert.equal(t.id, 'capsule');
  t.feed(.016, { ...play }); assert.equal(t.takeDrop(), true); assert.equal(t.takeDrop(), false, 'one request per drop');
  t.feed(.016, { ...play, drops: 1 }); assert.equal(t.takeDrop(), false, 'no second capsule while one is falling');
  t.feed(TUT.dropGap + .1, { ...play, drops: 0 }); assert.equal(t.takeDrop(), true, 'a missed capsule is dropped again');
  t.caught(); assert.equal(t.id, 'done');
  t.feed(TUT.doneFor + .1, play); assert.equal(t.active, false); assert.equal(tutorialDone(), true);
});

test('blocked moments (cut-scenes, panels) never advance a step', () => {
  const t = new Tutorial();
  t.feed(5, { ...play, serveWaiting: true, holding: true, blocked: true }); assert.equal(t.id, 'aim');
});

test('a ball waiting to be served again shows the aim chip without losing progress', () => {
  const t = new Tutorial(); t.i = 4;
  assert.equal(t.shown({ serveWaiting: true }), 'aim'); assert.equal(t.shown({ serveWaiting: false }), 'centre'); assert.equal(t.id, 'centre');
});

test('skip ends it for good and is remembered', () => {
  fresh(); assert.equal(tutorialDone(), false);
  const t = new Tutorial(); t.skip(); assert.equal(t.active, false); assert.equal(tutorialDone(), true);
  t.hit(0); t.served(); assert.equal(t.id, null);
});

test('Coach: the tutorial owns the chip, then reports its end once', () => {
  fresh(); const c = new Coach(); c.startTutorial();
  c.update(.1, { ...play, serveWaiting: true }); assert.equal(c.kind, 'tut-aim');
  c.served(); c.update(.1, play); assert.equal(c.kind, 'tut-move');
  c.update(.1, { ...play, serveWaiting: true }); assert.equal(c.kind, 'tut-aim', 're-serve asks for the aim again');
  c.skipTutorial(); c.update(.1, play); assert.equal(c.tutEnded, true); c.tutEnded = false; c.update(.1, play); assert.equal(c.tutEnded, false, 'reported once');
  const quiet = new Coach(); quiet.startTutorial(); quiet.update(.1, { ...play, blocked: true }); assert.equal(quiet.kind, null);
});

test('Vault: while the tutorial runs the serpent waits and a dropped ball is free; skipping releases both', () => {
  fresh();
  const v = new Vault(360, 774, 393 / 360, 'medium', { tutorial: true });
  assert(v.coach.tutorial); v.skipIntro(); for (let i = 0; i < 600; i++) v.update(1 / 60);
  assert.equal(v.phase, 'rescue');
  const cost = v.snake.cost; for (let i = 0; i < 300; i++) v.update(1 / 60);
  assert.equal(v.snake.cost, cost, 'the serpent has not moved');
  v.loseBall(); assert.equal(v.lives, 3, 'a dropped ball is free');
  v.coach.skipTutorial(); v.loseBall(); assert.equal(v.lives, 2);
  const plain = new Vault(360, 774, 393 / 360, 'medium'); assert.equal(plain.coach.tutorial, null, 'no tutorial unless asked');
});

test('purpose cards: every chapter has two short lines, a villain, and a real chapter behind it', () => {
  for (const [i, id] of Object.entries(PURPOSE_AT)) {
    const c = PURPOSE[id]; assert(c, `card for level ${i}`);
    assert.equal(c.lines.length, 2); for (const l of c.lines) assert(l.length <= 40, `"${l}" is ${l.length} chars`);
    assert(c.villains.length >= 1 && c.keep && c.win && c.title);
  }
  assert.deepEqual(Object.values(PURPOSE_AT).sort(), ['bellforge', 'frost', 'gatehouse', 'hoard', 'lumitower', 'mooncoil', 'rivals', 'tidewheel', 'vault']);
});

test('purpose cards open for the first few starts of a chapter, then stay out of the way', () => {
  fresh();
  for (let n = 0; n < SHOWN; n++) assert(openPurpose(1), `start ${n + 1}`);
  assert.equal(openPurpose(1), null); assert(openPurpose(1, { force: true }));
  assert.equal(openPurpose(0), null, 'chapters without a card show nothing');
});
