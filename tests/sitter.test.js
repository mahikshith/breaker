// The "big sitter" boss archetype (src/fantasy/creatures/sitter.js), tested on a dummy solid skin so the physics is the
// archetype's, not Ember's; then Ember's skin is checked against the packed art.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Sitter, sitterSkin } from '../src/fantasy/creatures/sitter.js';
import { EMBER } from '../src/fantasy/creatures/ember.js';

// A second skin: a solid, scaled-up toad that sits at (180, 100) with one circle per pose.
const TOAD = sitterSkin({ solid: true, poses: { squat: { art: ['toad/squat'], circles: [[0, -10, 20]] }, puff: { art: ['toad/puff'], circles: [[0, -10, 30]] },
  lick: { art: ['toad/lick'], circles: [[10, -10, 20]] }, sulk: { art: ['toad/sulk'], circles: [[0, -10, 20]] } } }, {
  name: 'Toad', pivot: [180, 100], scale: 2, rest: 'squat', tellPose: 'puff', attacks: { tongue: 'lick' }, moods: [['poked', 'sulk', 1]],
  numbers: { easy: { tell: 2, release: .5, calm: 4, hp: 12 }, medium: { tell: 1.5, release: .5, calm: 3, hp: 16 } } });
const ball = (x, y, vx = 0, vy = 0) => ({ x, y, vx, vy, r: 5 });

test('a sitter winds up for its tell, releases once, settles; numbers come from the difficulty', () => {
  const s = new Sitter(TOAD, 'easy'); assert.equal(s.hp, 12); assert.equal(new Sitter(TOAD, 'hard').n.tell, 1.5, 'unknown mode falls back to medium');
  s.windup('tongue', 10, { row: 3 }); assert.ok(s.busy); assert.equal(s.stage, 'windup'); assert.equal(s.progress(11), .5);
  assert.equal(s.tick(11.9), null); assert.equal(s.tick(12), 'release'); assert.equal(s.payload.row, 3);
  assert.equal(s.tick(12.2), null); assert.equal(s.tick(12.5), 'settle'); assert.equal(s.busy, false); assert.deepEqual(s.payload, {});
  assert.equal(s.hurt(5), 5); assert.equal(s.hurt(99), 7); assert.equal(s.hp, 0);
});

test('hush calms it and cancels a wind-up, but not a release that already landed', () => {
  const s = new Sitter(TOAD, 'easy'); s.windup('tongue', 0);
  assert.equal(s.hush(1), true); assert.equal(s.busy, false); assert.ok(s.calmAt(4.9)); assert.ok(!s.calmAt(5));
  s.windup('tongue', 6); s.tick(8); assert.equal(s.stage, 'release'); assert.equal(s.hush(8.1), false); assert.equal(s.stage, 'release');
});

test('pose priority: the game override, then the tell, then the attack, then a recent mood, then rest', () => {
  const s = new Sitter(TOAD, 'easy');
  assert.equal(s.choose({ t: 0 }), 'squat'); assert.equal(s.choose({ t: 0, rest: 'sulk' }), 'sulk');
  s.feel('poked', 5); assert.equal(s.choose({ t: 5.5 }), 'sulk'); assert.equal(s.choose({ t: 6.1 }), 'squat', 'moods fade');
  s.windup('tongue', 5); assert.equal(s.choose({ t: 5.5 }), 'puff'); s.tick(7); assert.equal(s.choose({ t: 7 }), 'lick');
  assert.equal(s.choose({ t: 7, override: 'sulk' }), 'sulk');
});

test('collision circles scale about the pivot; a pose swap ejects a ball the new silhouette lands on', () => {
  const s = new Sitter(TOAD, 'easy');
  assert.deepEqual(s.shapes('squat'), [{ type: 'circle', x: 180, y: 80, r: 40 }]); assert.deepEqual(s.shapes('puff'), [{ type: 'circle', x: 180, y: 80, r: 60 }]);
  const inside = ball(180 + 48, 80, -100, 0), clear = ball(180, 200, 0, 50), b = [inside, clear];
  assert.equal(s.setPose('puff', b), 1); assert.equal(s.ejections, 1);
  assert.ok(Math.hypot(inside.x - 180, inside.y - 80) >= 60 + inside.r - 1e-6, 'out of the puffed body');
  assert.ok(inside.vx > 0, 'moving into the body: reflected out'); assert.deepEqual([clear.x, clear.y], [180, 200], 'a clear ball is untouched');
  assert.equal(s.setPose('puff', b), 0, 'same pose: nothing'); assert.equal(s.setPose('nope', b), 0, 'unknown pose ignored'); assert.equal(s.pose, 'puff');
  // The game's `ok` keeps an ejection inside the playfield: blocked one way, the ball goes another.
  const edge = ball(180, 80 + 50, 0, 0); s.setPose('squat', [edge]); s.setPose('puff', [edge], (x, y) => y < 200);
  assert.ok(Math.hypot(edge.x - 180, edge.y - 80) >= 65 - 1e-6 && edge.y < 200);
});

test('Ember is scenery on the sitter archetype: no shapes, every pose drawn from packed or fallback art', () => {
  const man = JSON.parse(readFileSync(new URL('../assets/hoard/manifest.json', import.meta.url), 'utf8')), e = new Sitter(EMBER, 'hard');
  assert.equal(EMBER.solid, false); assert.deepEqual(e.shapes('breath'), []); assert.equal(e.setPose('breath', [ball(EMBER.pivot[0], EMBER.pivot[1] - 40)]), 0);
  assert.equal(e.n.tell, 1.4); assert.equal(e.hp, null);
  for (const [pose, p] of Object.entries(EMBER.poses)) {
    assert.ok(p.art.some(k => man.sprites[k]), `${pose} has art`); assert.ok(p.circles.length >= 2, `${pose} has body circles`);
  }
  for (const pose of [EMBER.rest, EMBER.tellPose, ...Object.values(EMBER.attacks), ...EMBER.moods.map(m => m[1])]) assert.ok(EMBER.poses[pose], pose);
  // R01's full-body poses are the preferred art, all at one scale (the tallest is 126 units) and anchored on the ledge line.
  for (const k of ['sleep', 'stir', 'windup', 'breath', 'sweep', 'defeat']) {
    const s = man.sprites[`ember/${k}`]; assert.equal(EMBER.poses[k].art[0], `ember/${k}`); assert.ok(s.drawSize[1] <= 126 && s.anchor[1] === s.drawSize[1]);
  }
});
