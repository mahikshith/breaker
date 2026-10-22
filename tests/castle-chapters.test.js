import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

globalThis.Image = class { complete = true; naturalWidth = 256; naturalHeight = 256; width = 256; height = 256; decode() { return Promise.resolve(); } };
globalThis.document = { createElement: () => ({ getContext: () => ctx(), width: 0, height: 0 }) };
globalThis.Path2D = class { moveTo() {} lineTo() {} quadraticCurveTo() {} };
const ctx = () => { const f = new Proxy(function () {}, { get: (_, k) => k === 'addColorStop' ? () => {} : f, apply: () => f, set: () => true }); return f; };
const { FantasyChapter } = await import('../src/fantasy/chapter.js');

// main.js owns the DOM; read its chapter table and menu order from source.
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const names = [...main.matchAll(/^  \{ make: .*?name: '([^']+)'.*?(?:next: (\d+))?.*$/gm)].map(m => m[1]);
const nexts = [...main.matchAll(/^  \{ make: .*$/gm)].map(m => m[0].match(/next: (\d+)/)?.[1]);

test('chapter slots are append-only and the menu lists all ten', () => {
  assert.deepEqual(names, ['Carrier Breakout', 'The Vault', 'Circuit Breakout', 'Shutter Forge', 'Frost Warden', 'Mooncoil Reliquary', 'Bellforge Run', 'Tidewheel Citadel', 'Gatehouse Siege', 'Lumi Breaks Out']);
  assert.match(main, /\[0, 2, 3, 1, 4, 5, 6, 7, 8, 9\]\.filter/);
  const release = JSON.parse(readFileSync(new URL('../config/mobile-preview.json', import.meta.url), 'utf8'));
  assert.deepEqual(release.saveSlots, names); assert.deepEqual(release.menuOrder, [0, 2, 3, 1, 4, 5, 6, 7, 8, 9]);
});

test('next links walk Frost to Mooncoil to Bellforge to Tidewheel to Gatehouse Siege to Lumi Breaks Out, which ends the campaign', () => {
  assert.deepEqual(nexts.map(n => n === undefined ? n : +n), [2, 4, 3, undefined, 5, 6, 7, 8, 9, undefined]);
});

for (const key of ['bellforge', 'tidewheel', 'gatehouse', 'lumitower']) for (const mode of ['easy', 'medium', 'hard']) for (const [H, s] of [[814, 393 / 360], [949, 412 / 360], [634, 1]]) {
  test(`${key} ${mode} loads at ${H} and plays frames through the shared contract`, () => {
    const l = new FantasyChapter(key, 360, H, s, mode);
    assert.equal(l.W, 360); assert.equal(l.H, H); assert.equal(l.state, 'play'); assert(l.m.paddle.y <= l.m.height - 30);
    l.pointerDown(180); l.pointerMove(120); l.pointerUp();
    assert(l.m.balls.some(b => !b.caught), 'tap launches');
    for (let i = 0; i < 600; i++) l.update(1 / 120);
    assert(['play', 'won', 'lost'].includes(l.state));
    l.draw(ctx()); l.background();
    assert.equal(l.activateKitPower(), false); assert(l.hint);
    assert.equal(l.result().stars, 0);
  });
}

test('Kit orb opens the power menu only on a full charge; choosing spends it', () => {
  const l = new FantasyChapter('tidewheel', 360, 814, 1, 'easy');
  l.m.charge = 100; assert(l.activateKitPower()); assert(l.powerMenuOpen);
  assert.deepEqual(l.powerChoices.map(p => p.id), ['anchor', 'arrows', 'titan']);
  const t = l.t; l.update(1 / 120); assert.equal(l.t, t, 'menu pauses play');
  assert(l.chooseSpacePower('arrows')); assert(!l.powerMenuOpen); assert.equal(l.m.charge, 0);
});

test('a lost run offers repeatable shared continues', () => {
  for (const key of ['bellforge', 'tidewheel', 'gatehouse', 'lumitower']) {
    const l = new FantasyChapter(key, 360, 814, 1, 'easy');
    for (let n = 0; n < 2; n++) { l.m.state = 'lost'; l.m.lives = 0; l.continueRun(); assert.equal(l.state, 'play'); assert(l.lives >= 1); l.update(1 / 120); }
  }
});

test('Gatehouse Siege: Ward maps to the model, floors/stuns feed stars and results, every phase draws', () => {
  const l = new FantasyChapter('gatehouse', 360, 814, 1, 'easy');
  assert.equal(l.name, 'Gatehouse Siege'); assert.deepEqual(l.powerChoices.map(p => p.id), ['shield']);
  l.m.charge = 100; assert(l.activateKitPower()); assert(l.chooseSpacePower('shield')); assert(l.m.ward); assert.equal(l.m.charge, 0);
  assert.equal(new FantasyChapter('bellforge', 360, 814, 1, 'easy').kind('shield'), 'echo');
  const m = l.m; l.draw(ctx());
  for (const floor of [0, 1, 2]) {
    m.buildFloor(floor); m.lives = 9; m.launch(); m.paddle.armed = true; m.paddle.streak = 3; m.charge = 100;
    for (let i = 0; i < 240; i++) { l.update(1 / 120); if (i % 40 === 0) l.draw(ctx()); }
    m.paddle.stun = .5; m.releaseBell(false); m.balls[0].ram = 1; m.balls[0].r = 13.2; l.draw(ctx());
  }
  m.buildFloor(0); m.hitHousing(m.housings[0], 9); m.hitHousing(m.housings[1], 9);
  for (let i = 0; i < 400; i++) { l.update(1 / 120); if (i % 20 === 0) l.draw(ctx()); }   // crash, climb banner, arrival on floor 2
  assert.equal(m.floor, 1);
  m.turnWheel(99, 1); for (let i = 0; i < 200; i++) { l.update(1 / 120); if (i % 20 === 0) l.draw(ctx()); }
  assert.equal(m.floor, 2); m.hitVillain(999, false); for (let i = 0; i < 400; i++) { l.update(1 / 120); if (i % 25 === 0) l.draw(ctx()); }
  assert.equal(l.state, 'won'); l.draw(ctx());
  l.stuns = 0; m.lives = 3; assert.equal(l.result().stars, 3); l.stuns = 2; assert.equal(l.result().stars, 2); m.lives = 1; assert.equal(l.result().stars, 1);
  assert.deepEqual(l.result().lines.map(x => x[0]), ['Score', 'Floors', 'Balls left']); assert.equal(l.result().lines[1][1], '3 / 3');
});

test('Gatehouse Siege counts paddle stuns from bells and reports the lost-run reason', () => {
  const l = new FantasyChapter('gatehouse', 360, 814, 1, 'easy'), m = l.m;
  m.buildFloor(1); m.launch(); m.nextWarning = Infinity; const p = m.paddle, bell = m.releaseBell(false); Object.assign(bell, { x: p.x, y: p.y - 40, px: p.x, py: p.y - 40, vy: 120 });
  m.balls[0].caught = true; for (let i = 0; i < 90; i++) l.update(1 / 120);
  assert.equal(l.stuns, 1); assert.equal(l.paddle.stun > 0 || m.paddle.stun >= 0, true); assert(l.danger >= 0 && l.danger <= 1);
  m.lose('No balls remaining'); assert.equal(l.reason, 'No balls remaining'); assert.equal(l.result().stars, 0);
});

test('Lumi Breaks Out: songs map 1:1 to the model, Lumi owns the orb, every floor and lunge stage draws', () => {
  const l = new FantasyChapter('lumitower', 360, 814, 1, 'medium'), m = l.m;
  assert.equal(l.name, 'Lumi Breaks Out'); assert.equal(l.kitFace, 'lumi'); assert.equal(l.menuTitle, 'LUMI’S SONGS');
  assert.deepEqual(l.powerChoices.map(p => p.id), ['lullaby', 'starlight', 'songshield']);
  for (const id of ['lullaby', 'starlight', 'songshield']) assert.equal(l.kind(id), id);
  assert.equal(new FantasyChapter('gatehouse', 360, 814, 1, 'easy').kitFace, undefined, 'Kit chapters keep Kit’s face');
  m.charge = 100; assert(l.activateKitPower()); assert(l.chooseSpacePower('starlight')); assert(m.notes > 0); assert.equal(m.charge, 0);
  l.draw(ctx());
  for (const floor of [0, 1, 2]) {
    m.buildFloor(floor); m.lives = 9; m.launch(); m.paddle.armed = true; m.paddle.streak = 3;
    for (let i = 0; i < 1500; i++) { l.update(1 / 120); if (i % 60 === 0) l.draw(ctx()); }   // lunges peek, hiss, strike, chew, retreat on floors with windows
    m.charge = 100; m.calm = 0; m.notes = 0; m.shield = null; m.phase = 'play'; assert(m.activate(['starlight', 'lullaby', 'songshield'][floor]));
    m.balls[0].ram = 1; m.balls[0].r = 13.2; m.capsules.push({ id: 99, kind: 'ram', x: 180, y: 300, dead: false }); l.draw(ctx());
  }
  m.buildFloor(1); m.launch(); m.nextLunge = 0; m.shield = { remaining: 5, used: false };
  for (const win of m.windows) { m.lunges = [m.makeLunge(win, true)]; for (let i = 0; i < 900; i++) { l.update(1 / 120); if (i % 45 === 0) l.draw(ctx()); } }
  m.calm = 3; m.lunges = []; l.draw(ctx());
  m.buildFloor(0); for (const b of m.bricks.filter(b => b.type === 'bar')) m.hitBrick(b, null); m.hitBrick(m.bricks.find(b => b.type === 'bar' && b.hp > 0) || m.bricks[0], null);
  for (let i = 0; i < 400; i++) { l.update(1 / 120); if (i % 25 === 0) l.draw(ctx()); }   // hatch opens, climb banner, arrival on floor 2
  assert.equal(m.floor, 1); m.buildFloor(2); m.active = true; m.launch();
  for (let n = 0; n < m.bell.need; n++) m.ringBell(m.balls[0]);
  assert.equal(m.phase, 'escape'); for (let i = 0; i < 360; i++) { l.update(1 / 120); if (i % 30 === 0) l.draw(ctx()); }
  assert.equal(l.state, 'won'); l.draw(ctx());
});

test('Lumi Breaks Out: stars come from lives and bites, results list Score, Floors, Bites, and the reason shows on a loss', () => {
  const l = new FantasyChapter('lumitower', 360, 814, 1, 'easy'), m = l.m;
  m.state = 'won'; m.lives = 3; m.bites = 0; assert.equal(l.result().stars, 3); m.bites = 2; assert.equal(l.result().stars, 2); m.lives = 1; assert.equal(l.result().stars, 1);
  assert.deepEqual(l.result().lines.map(x => x[0]), ['Score', 'Floors', 'Bites']); assert.equal(l.result().lines[1][1], '3 / 3'); assert.equal(l.result().lines[2][1], 2);
  m.state = 'play'; m.lose('No balls remaining'); assert.equal(l.reason, 'No balls remaining'); assert.equal(l.result().stars, 0);
});
