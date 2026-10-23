// First-time coaching (src/coach.js): when each coach shows and when it stops for good, in the Arena and the castle
// chapters, plus the Ward/shield timers that replaced the stray capsule sprite.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

globalThis.Image ??= class { complete = true; naturalWidth = 256; naturalHeight = 256; width = 256; height = 256; decode() { return Promise.resolve(); } };
const stub = () => { const f = new Proxy(function () {}, { get: (_, k) => k === 'addColorStop' ? () => {} : f, apply: () => f, set: () => true }); return f; };
globalThis.document ??= { createElement: () => ({ getContext: () => stub(), width: 0, height: 0 }) };
globalThis.Path2D ??= class { moveTo() {} lineTo() {} quadraticCurveTo() {} };
const prefs = new Map();
globalThis.localStorage = { getItem: k => prefs.get(k) ?? null, setItem: (k, v) => prefs.set(k, String(v)) };
const fresh = () => { for (const k of [...prefs.keys()]) if (k.startsWith('breach.coach')) prefs.delete(k); };

const { COACH, pickCoach, landIn, coachProgress, Coach } = await import('../src/coach.js');
const { Arena } = await import('../src/arena.js');
const { FantasyChapter } = await import('../src/fantasy/chapter.js');
const { gWard } = await import('../src/fantasy/render.js');

const moment = (o = {}) => ({ blocked: false, serveWaiting: false, focusAim: false, focusReady: false, landIn: Infinity, streak: 0, armed: false, ...o });
const none = { serves: 0, catches: 0, ram: false };

test('pickCoach: serve until three serves, Focus until two catches, ram until one launch; blocked shows nothing', () => {
  assert.equal(pickCoach(moment({ serveWaiting: true }), none), 'serve');
  assert.equal(pickCoach(moment({ serveWaiting: true }), { ...none, serves: COACH.serves - 1 }), 'serve');
  assert.equal(pickCoach(moment({ serveWaiting: true }), { ...none, serves: COACH.serves }), null);
  assert.equal(pickCoach(moment({ focusReady: true, landIn: .5 }), none), 'focus-hold');
  assert.equal(pickCoach(moment({ focusReady: true, landIn: COACH.landSoon + .1 }), none), null, 'only as the ball comes down');
  assert.equal(pickCoach(moment({ focusReady: false, landIn: .5 }), none), null, 'no AIM charge, no hold-still');
  assert.equal(pickCoach(moment({ focusReady: true, landIn: .5 }), { ...none, catches: COACH.catches }), null);
  assert.equal(pickCoach(moment({ focusAim: true }), { ...none, catches: COACH.catches }), 'focus-aim', 'the second catch still gets its aim line');
  assert.equal(pickCoach(moment({ focusAim: true }), { ...none, catches: COACH.catches + 1 }), null);
  assert.equal(pickCoach(moment({ streak: 1 }), none), 'ram-streak');
  assert.equal(pickCoach(moment({ armed: true }), none), 'ram-armed');
  assert.equal(pickCoach(moment({ streak: 2 }), { ...none, ram: true }), null);
  assert.equal(pickCoach(moment({ streak: 0 }), none), null, 'nothing before the first pip lights');
  for (const o of [{ serveWaiting: true }, { focusAim: true }, { focusReady: true, landIn: .1 }, { armed: true }]) assert.equal(pickCoach(moment({ ...o, blocked: true }), none), null);
  // priority: the aim being held, then the serve, then the catch window, then the ram
  assert.equal(pickCoach(moment({ serveWaiting: true, streak: 2 }), none), 'serve');
  assert.equal(pickCoach(moment({ focusReady: true, landIn: .3, armed: true }), none), 'focus-hold');
});

test('landIn: seconds until the first falling ball meets the paddle top', () => {
  assert.equal(landIn([{ x: 0, y: 500, r: 6, vx: 0, vy: 200 }, { y: 300, r: 6, vy: 300 }], 606), .5);
  assert.equal(landIn([{ y: 500, r: 6, vy: -200 }, { y: 500, r: 6, vy: 200, caught: true }], 606), Infinity);
});

test('a chip lingers briefly after its moment, fades out, and hides at once when play is blocked', () => {
  fresh(); const c = new Coach();
  c.update(.5, moment({ streak: 1 })); assert.equal(c.kind, 'ram-streak'); assert.equal(c.ramPulse, true);
  c.update(COACH.linger * .5, moment()); assert.equal(c.kind, 'ram-streak');
  for (let i = 0; i < 20; i++) c.update(.1, moment());
  assert.equal(c.kind, null); assert.equal(c.ramPulse, false);
  c.update(.5, moment({ serveWaiting: true })); assert(c.a > 0);
  c.update(.5, moment({ serveWaiting: true, blocked: true })); assert.equal(c.a, 0); assert.equal(c.kind, null);
});

test('Arena: serve coach until three lifetime serves, persisted across runs', () => {
  fresh();
  for (let n = 0; n < COACH.serves; n++) {
    const l = new Arena(360, 729); l.update(1 / 60);
    assert.equal(l.coach.kind, 'serve', `serve ${n + 1}`);
    l.pointerDown(180, 690); l.pointerUp();
    assert.equal(coachProgress().serves, n + 1);
  }
  const l = new Arena(360, 729); l.update(1 / 60);
  assert.equal(l.coach.kind, null, 'the fourth serve is quiet');
});

test('Arena: hold-still shows as a ball comes down with an AIM charge, the caught aim line follows, both stop after two catches', () => {
  fresh(); prefs.set('breach.coachServes', '9');
  const run = () => {
    const l = new Arena(360, 729), b = l.balls[0]; l.aim = null; b.caught = false;
    b.x = l.paddle.x; b.y = l.paddle.y - 80; b.vx = 0; b.vy = 200; // lands in ~0.37 s
    l.coach.update(1 / 60, l.coachMoment()); return [l, b];
  };
  let [l, b] = run();
  assert.equal(l.coach.kind, 'focus-hold'); assert.equal(l.coach.aimPulse, true);
  assert(l.coach.aimHudUntil > l.coach.time, 'first time: the HUD AIM label flashes');
  assert.equal(prefs.get('breach.coachAimHud'), 'true');
  l.focus = 0; l.coach = new Coach(); l.coach.update(1 / 60, l.coachMoment()); assert.equal(l.coach.kind, null, 'no AIM charge, no coach');
  for (let n = 1; n <= COACH.catches; n++) {
    [l, b] = run(); assert.equal(l.coach.kind, 'focus-hold');
    assert.equal(l.coach.aimHudUntil, 0, 'the HUD label is a one-time flash');
    l.pointerDown(180, 690); l.ptr.stillT = .2; l.onPaddle(b);
    assert(b.caught && !l.aim.serve);
    assert.equal(coachProgress().catches, n);
    l.coach.update(1 / 60, l.coachMoment()); assert.equal(l.coach.kind, 'focus-aim');
  }
  [l, b] = run(); assert.equal(l.coach.kind, null, 'two Focus catches end the Focus coaching');
});

test('Arena: ram coach from the first lit pip until the first ram launch; the wardCoach and the continue hold block coaching', () => {
  fresh(); prefs.set('breach.coachServes', '9'); prefs.set('breach.coachCatches', '9');
  const l = new Arena(360, 729), b = l.balls[0], tick = () => l.coach.update(1 / 60, l.coachMoment()); l.aim = null; b.caught = false; b.vy = -345;
  tick(); assert.equal(l.coach.kind, null);
  for (let i = 0; i < 3; i++) { l.onPaddle(Object.assign(b, { x: l.paddle.x, vy: -345 })); tick(); assert.equal(l.coach.kind, i < 2 ? 'ram-streak' : 'ram-armed'); }
  l.wardCoach = true; l.update(1 / 60); assert.equal(l.coach.a, 0, 'the Ward coach owns the screen'); l.wardCoach = false;
  l.onPaddle(Object.assign(b, { x: l.paddle.x, vy: -345 })); assert(b.ram > 0, 'launched');
  assert.equal(coachProgress().ram, true);
  tick(); assert.notEqual(l.coach.kind, 'ram-armed');
  const next = new Arena(360, 729); next.aim = null; next.paddle.streak = 2; next.coach.update(1 / 60, next.coachMoment()); assert.equal(next.coach.kind, null, 'the ram coach is done for good');
  fresh(); const c = new Arena(360, 729); c.fail('fixture'); c.continueRun(); c.update(1 / 60);
  assert(c.backHold); assert.equal(c.coach.kind, null, 'back in action: its own banner teaches the serve');
});

test('castle chapters: player serves count (auto-serves do not), ram launch ends the ram coach, Continue hides coaching', () => {
  fresh();
  const l = new FantasyChapter('gatehouse', 360, 814, 393 / 360, 'medium');
  l.update(1 / 60); assert.equal(l.coach.kind, 'serve');
  l.pointerDown(180); l.pointerUp(); assert.equal(coachProgress().serves, 1);
  l.pointerUp(); assert.equal(coachProgress().serves, 1, 'no serve without a ball waiting');
  const auto = new FantasyChapter('bellforge', 360, 814, 393 / 360, 'medium');
  for (let i = 0; i < 60 * 9 && auto.m.phase === 'serve'; i++) auto.update(1 / 60);
  assert.notEqual(auto.m.phase, 'serve'); assert.equal(coachProgress().serves, 1, 'the auto-serve is not the player\'s');
  l.m.paddle.streak = 1; l.update(1 / 60); assert.equal(l.coach.kind, 'ram-streak');
  l.m.effects.push({ kind: 'ram-launch', x: 0, y: 0, age: 0, life: .5 }); l.update(1 / 60);
  assert.equal(coachProgress().ram, true);
  for (let i = 0; i < 20; i++) l.coach.update(.1, { streak: 1 });
  assert.equal(l.coach.kind, null, 'the ram coach is done for good');
  fresh();
  const c = new FantasyChapter('gatehouse', 360, 814, 393 / 360, 'medium'); c.m.lives = 0; c.m.lose('fixture'); c.continueRun(); c.update(1 / 60);
  assert(c.backHold); assert.equal(c.coach.kind, null);
});

test("Dragon's Hoard gets the same serve and ram coaching; the greed card is modal, so it hides coaching", () => {
  fresh();
  const l = new FantasyChapter('hoard', 360, 814, 393 / 360, 'medium');
  l.update(1 / 60); assert.equal(l.coach.kind, 'serve');
  l.pointerDown(180); l.pointerUp(); assert.equal(coachProgress().serves, 1); assert.equal(l.m.phase, 'play');
  l.m.paddle.streak = 1; l.update(1 / 60); assert.equal(l.coach.kind, 'ram-streak');
  l.m.phase = 'greed'; l.update(1 / 60); assert.equal(l.coach.kind, null, 'nothing over the greed card'); l.m.phase = 'play';
  l.m.effects.push({ kind: 'ram-launch', x: 0, y: 0, age: 0, life: .5 }); l.update(1 / 60);
  assert.equal(coachProgress().ram, true);
});

test('main.js draws coaching only during play, never under the continue panel or the power menu', () => {
  const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  assert.match(main, /if \(scene === 'level' && level\.state === 'play' && !level\.powerMenuOpen && !purpose\) \{[^}]*level\.drawCoach\?\.\(g\)/);
});

// A recording context: fillRect/stroke spans and drawImage calls.
function recorder() {
  const log = { images: 0, rects: [], lines: [] }, grad = { addColorStop() {} }; let path = [];
  const own = { globalAlpha: 1, createLinearGradient: () => grad, createRadialGradient: () => grad, measureText: () => ({ width: 0 }),
    fillRect: (x, y, w) => log.rects.push([x, w]), drawImage: () => log.images++, beginPath: () => { path = []; }, moveTo: x => path.push(x), lineTo: x => path.push(x), stroke: () => log.lines.push([...path]) };
  const g = new Proxy(own, { get: (t, k) => k in t ? t[k] : () => {}, set: (t, k, v) => { t[k] = v; return true; } });
  return [g, log];
}

test('the Ward line has no capsule sprite and burns inward from both edges as its time runs out', () => {
  const ward = { y: 600, remaining: 6 }, m = { ward, width: 360, time: 0 };
  let [g, log] = recorder(); gWard(g, m, { images: { shield: {} } });
  assert.equal(log.images, 0, 'no stray capsule on the Ward');
  assert.deepEqual(log.lines[0], [0, 360], 'full time: edge to edge');
  ward.remaining = 3; [g, log] = recorder(); gWard(g, m, {});
  assert.deepEqual(log.lines[0], [90, 270], 'half time: half the width, centred');
});

test('the Arena continue shield also burns inward with its time and keeps full length while the serve waits', () => {
  const l = new Arena(360, 729); l.fail('fixture'); l.continueRun();
  const span = () => { const [g, log] = recorder(); l.drawPaddle(g); return log.rects[0]; };
  assert.deepEqual(span(), [l.left, l.right - l.left], 'held: full');
  l.pointerDown(180, 690); l.pointerUp(); l.shieldT = l.shieldMax / 2;
  const [x, w] = span(); assert(Math.abs(w - (l.right - l.left) / 2) < 1e-9 && Math.abs(x - (l.left + (l.right - l.left) / 4)) < 1e-9, 'half time: half the width');
});
