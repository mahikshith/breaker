import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

globalThis.Image = class { complete = true; naturalWidth = 256; naturalHeight = 256; width = 256; height = 256; decode() { return Promise.resolve(); } };
globalThis.location = { search: '' };
const ctx = new Proxy({}, {
  get: (t, k) => k === 'measureText' ? s => ({ width: String(s).length * 8 }) : k === 'createLinearGradient' || k === 'createRadialGradient' ? () => ({ addColorStop() {} }) : k in t ? t[k] : () => {},
  set: (t, k, v) => { t[k] = v; return true; },
});
globalThis.document = { createElement: () => ({ getContext: () => ctx, width: 0, height: 0 }) };
const home = await import('../src/home.js');
const { STORY, cleared, unlockedCount, playTarget, starTotal, clearedCount, createHome } = home;

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const names = [...main.matchAll(/^  \{ make: .*?name: '([^']+)'/gm)].map(m => m[1]);
const blank = () => ({ easy: Array(12).fill(0), medium: Array(12).fill(0), hard: Array(12).fill(0) });

test('the menu lists the nine princess chapters in story order; the space chapters keep their slots but are hidden', () => {
  assert.deepEqual(STORY.map(i => names[i]), ['The Vault', 'Frost Warden', 'Mooncoil Reliquary', 'Bellforge Run', 'Tidewheel Citadel', 'Gatehouse Siege', 'Lumi Breaks Out', 'Serpent Rivals', 'Dragon’s Hoard']);
  for (const hidden of [0, 2, 3]) assert(!STORY.includes(hidden), names[hidden] + ' is not in the menu');
  assert.equal(names.length, 12, 'slots are append-only');
  // the story order is the chain of `next` links that starts at the Vault
  const next = [...main.matchAll(/^  \{ make: .*$/gm)].map(m => m[0].match(/next: (\d+)/)?.[1]);
  let i = 1; const walk = [i]; while (next[i] !== undefined) { i = +next[i]; walk.push(i); }
  assert.deepEqual(walk, STORY);
  const release = JSON.parse(readFileSync(new URL('../config/mobile-preview.json', import.meta.url), 'utf8'));
  assert.deepEqual(release.menuOrder, STORY);
});

test('PLAY continues the first chapter that has no star yet; progress in any difficulty counts', () => {
  const best = blank();
  assert.equal(playTarget(best, 'medium'), 0, 'first launch: chapter 1');
  best.medium[1] = 2; assert.equal(playTarget(best, 'medium'), 1);
  best.easy[4] = 1; best.hard[5] = 3;
  assert.equal(playTarget(best, 'hard'), 3, 'Vault, Frost and Mooncoil are cleared, so Bellforge is next');
  for (const slot of STORY) best.medium[slot] = 2;
  assert.equal(playTarget(best, 'medium'), 0, 'all cleared: replay the first chapter under three stars');
  for (const slot of STORY) best.medium[slot] = 3;
  assert.equal(playTarget(best, 'medium'), 0);
  best.medium[STORY[4]] = 1; assert.equal(playTarget(best, 'medium'), 4);
  assert.equal(clearedCount(best), 9); assert.equal(starTotal(best, 'medium'), 3 * 8 + 1);
});

test('chapters open one past the furthest cleared chapter; unlock-all opens every one; nothing already played is ever locked', () => {
  const best = blank();
  assert.equal(unlockedCount(best), 1);
  best.medium[1] = 1; assert.equal(unlockedCount(best), 2);
  best.hard[11] = 1; assert.equal(unlockedCount(best), 9, 'Dragon’s Hoard played: everything before it is open');
  assert.equal(unlockedCount(blank(), true), 9);
  assert(cleared(best, 11) && !cleared(best, 4));
  // junk in the save never crashes it
  assert.equal(playTarget({ easy: [Infinity, 'x'], medium: null }, 'easy'), 0);
});

function makeEnv(H, view, best = blank(), over = {}) {
  const env = {
    W: 360, H: () => H, t: () => 1.3, LEVELS: names.map((name, i) => ({ name, sub: 'Goal for ' + name, color: '#8fb2ff', stages: i === 7 ? 4 : undefined })),
    best: () => best, diff: () => 'medium', selectDifficulty() {}, play() {}, buttons: () => env.list, preview: () => ({}), hasPreview: () => true, tap() {},
    isMuted: () => false, toggleSound() {}, canFull: () => true, goFull() {}, native: () => false, locked() {}, list: [], ...over,
  };
  const h = createHome(env); h.open(view); return { env, h };
}

for (const H of [560, 640, 695, 740, 800]) for (const view of ['home', 'chapters']) {
  test(`${view} at ${H} units draws, keeps every control inside the safe area and every touch target at least 44 units`, () => {
    const { env, h } = makeEnv(H, view, Object.assign(blank(), { medium: [0, 3, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0] }));
    for (const scroll of view === 'chapters' ? [0, 300, 99999] : [0]) {
      h.scroll = scroll; env.list = []; h.draw(ctx);
      assert(env.list.length >= (view === 'home' ? 6 : 5));
      for (const b of env.list) {
        assert(b.x >= 0 && b.x + b.w <= 360 && b.y >= 0 && b.y + b.h <= H + 0.01, `button ${JSON.stringify(b)} is inside the playable area`);
        if (!b.card) assert(b.w >= 44 && b.h >= 44, `target ${b.w}x${b.h} is at least 44`);
        else assert(b.h >= 8);
      }
    }
  });
}

test('native app: no Full screen control; a browser that can go full screen gets one icon, never a text button', () => {
  const count = native => { const { env, h } = makeEnv(695, 'home', blank(), { native: () => native }); h.draw(ctx); return env.list.filter(b => b.w === 44 && b.h === 44).length; };
  assert.equal(count(true) + 1, count(false), 'one extra icon outside the native app');
  assert.doesNotMatch(readFileSync(new URL('../src/home.js', import.meta.url), 'utf8'), /'Full screen'|"Full screen"/);
});

test('the chapter list taps on release and a drag scrolls instead of starting a chapter', () => {
  const played = [];
  const { env, h } = makeEnv(695, 'chapters', blank(), { play: s => played.push(s) });
  h.draw(ctx); const card = env.list.find(b => b.card);
  h.down(1, 100, card.y + 10, card); assert.deepEqual(played, [], 'nothing fires on press');
  h.up(1); assert.deepEqual(played, [STORY[0]]);
  h.draw(ctx); const c2 = env.list.find(b => b.card);
  h.down(2, 100, 400, c2); h.move(2, 300); h.up(2); assert.deepEqual(played, [STORY[0]], 'a drag is not a tap');
  assert(h.scroll > 50);
  h.down(3, 100, 400, c2); h.up(3, true); assert.deepEqual(played, [STORY[0]], 'a cancelled touch is not a tap');
});

test('main.js leaves a clean menu seam: one PLAY entry, no Full screen label, and the old twelve-card list is gone', () => {
  assert.doesNotMatch(main, /'Full screen'|'Sound: o/);
  assert.match(main, /play: i => start\(i, \{ card: true \}\)/);   // every chapter opens on its purpose card
  assert.doesNotMatch(main, /\[0, 2, 3, 1, 4, 5, 6, 7, 8, 9, 10, 11\]\.filter/);
});
