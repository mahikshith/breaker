import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

globalThis.Image = class { complete = true; naturalWidth = 256; naturalHeight = 256; width = 256; height = 256; decode() { return Promise.resolve(); } };
globalThis.document = { createElement: () => ({ getContext: () => ctx(), width: 0, height: 0 }) };
const ctx = () => { const f = new Proxy(function () {}, { get: (_, k) => k === 'addColorStop' ? () => {} : f, apply: () => f, set: () => true }); return f; };
const { FantasyChapter } = await import('../src/fantasy/chapter.js');

// main.js owns the DOM; read its chapter table and menu order from source.
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const names = [...main.matchAll(/^  \{ make: .*?name: '([^']+)'.*?(?:next: (\d+))?.*$/gm)].map(m => m[1]);
const nexts = [...main.matchAll(/^  \{ make: .*$/gm)].map(m => m[0].match(/next: (\d+)/)?.[1]);

test('chapter slots are append-only and the menu lists all eight', () => {
  assert.deepEqual(names, ['Carrier Breakout', 'The Vault', 'Circuit Breakout', 'Shutter Forge', 'Frost Warden', 'Mooncoil Reliquary', 'Bellforge Run', 'Tidewheel Citadel']);
  assert.match(main, /\[0, 2, 3, 1, 4, 5, 6, 7\]\.filter/);
  const release = JSON.parse(readFileSync(new URL('../config/mobile-preview.json', import.meta.url), 'utf8'));
  assert.deepEqual(release.saveSlots, names); assert.deepEqual(release.menuOrder, [0, 2, 3, 1, 4, 5, 6, 7]);
});

test('next links walk Frost to Mooncoil to Bellforge to Tidewheel, which ends the campaign', () => {
  assert.deepEqual(nexts.map(n => n === undefined ? n : +n), [2, 4, 3, undefined, 5, 6, 7, undefined]);
});

for (const key of ['bellforge', 'tidewheel']) for (const mode of ['easy', 'medium', 'hard']) for (const [H, s] of [[814, 393 / 360], [949, 412 / 360], [634, 1]]) {
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
  for (const key of ['bellforge', 'tidewheel']) {
    const l = new FantasyChapter(key, 360, 814, 1, 'easy');
    for (let n = 0; n < 2; n++) { l.m.state = 'lost'; l.m.lives = 0; l.continueRun(); assert.equal(l.state, 'play'); assert(l.lives >= 1); l.update(1 / 120); }
  }
});
