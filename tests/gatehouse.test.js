import test from 'node:test';
import assert from 'node:assert/strict';
import { Gatehouse, GATEHOUSE_MODES, GATEHOUSE_FLOORS, GATEHOUSE_TIMING } from '../src/fantasy/gatehouse.js';

const tick = (g, seconds) => { for (let left = seconds; left > 1e-9; left -= 1 / 120) g.update(Math.min(left, 1 / 120)); };
const park = g => { g.balls = [{ id: ++g.serial, x: 20, y: 300, px: 20, py: 300, vx: 0, vy: 0, r: 6, caught: true, dead: false, ram: 0, ramBricks: 0, contacts: new Set() }]; };
const live = (g, floor = g.floor) => { if (g.floor !== floor) g.buildFloor(floor); g.lives = 9; g.phase = 'play'; g.active = true; g.bricks = []; park(g); return g; };
// One ball dropped straight onto the paddle at `dx` from its centre; returns after it has bounced back up.
const drop = (g, dx = 0) => {
  const p = g.paddle, b = { id: ++g.serial, x: p.x + dx, y: p.y - 24, px: p.x + dx, py: p.y - 24, vx: 0, vy: 300, r: 6, caught: false, dead: false, ram: 0, ramBricks: 0, contacts: new Set() };
  g.balls = [b]; for (let i = 0; i < 90 && b.vy > 0; i++) g.update(1 / 120); return b;
};
const kinds = g => g.effects.map(e => e.kind);

test('three floors: each mode scales housings, notches and Korr HP, and the floors go in order', () => {
  assert.deepEqual(GATEHOUSE_FLOORS, ['Drawbridge', 'Murder holes', 'Inner gate']);
  for (const [mode, rules] of Object.entries(GATEHOUSE_MODES)) {
    const g = new Gatehouse({ difficulty: mode });
    assert.equal(g.floor, 0); assert.equal(g.housings.length, 2); assert(g.housings.every(h => h.hp === rules.housing && h.maxHP === rules.housing));
    assert.equal(g.drawbridge.down, 0); assert(g.solids.some(s => s.id === 'drawbridge'));
    g.buildFloor(1); assert.equal(g.gate.need, rules.notches); assert.equal(g.wheel.notches, 0); assert.equal(g.holes.length, 1); assert.equal(g.ramps.length, 1);
    g.buildFloor(2); assert.equal(g.villain.hp, rules.hp); assert.equal(g.villain.maxHP, rules.hp); assert(g.villain.body.length > 0); assert.equal(g.holes.length, 2); assert.equal(g.ramps.length, 2);
    assert(g.bricks.filter(b => b.type === 'armour').every(b => b.hp === 2) && g.bricks.some(b => b.type === 'armour'));
  }
  assert.throws(() => new Gatehouse({ height: 600 }), RangeError);
});

test('floor 1 breaks both housings, the bridge crashes, then the climb builds floor 2', () => {
  const g = live(new Gatehouse({ difficulty: 'easy' }), 0), [a, b] = g.housings;
  g.hitHousing(a, 99); assert.equal(g.phase, 'play'); assert.equal(a.hp, 0); assert.equal(g.floor, 0);
  g.hitHousing(b, 1); assert.equal(g.phase, 'play'); assert.equal(b.hp, b.maxHP - 1);
  g.hitHousing(b, 99); assert.equal(g.phase, 'crash'); assert(kinds(g).includes('drawbridge-crash')); assert.equal(g.solids.length, 0);
  tick(g, GATEHOUSE_TIMING.crash / 2); assert(g.drawbridge.down > .4 && g.drawbridge.down < .6);
  tick(g, GATEHOUSE_TIMING.crash / 2 + .05); assert.equal(g.phase, 'climb'); assert.equal(g.drawbridge.down, 1);
  tick(g, GATEHOUSE_TIMING.climb + .05); assert.equal(g.floor, 1); assert.equal(g.phase, 'serve'); assert.equal(g.state, 'play');
});

test('housing goal: ordinary ball hits chip a housing one HP at a time', () => {
  const g = live(new Gatehouse({ difficulty: 'easy' }), 0), h = g.housings[0], hp = h.hp;
  g.balls = [{ id: 99, x: h.x + h.w / 2, y: h.y + h.h + 40, px: 0, py: 0, vx: 0, vy: -300, r: 6, caught: false, dead: false, ram: 0, ramBricks: 0, contacts: new Set() }];
  tick(g, .4); assert.equal(h.hp, hp - 1); assert(kinds(g).includes('housing-hit'));
});

test('floor 2 winch: eight rim hits open the gate, the door rises with the notches, the floor clears', () => {
  const g = live(new Gatehouse({ difficulty: 'easy' }), 1), w = g.wheel, d = g.gate.door;
  assert.equal(g.gate.need, 8); assert.equal(d.y, 262);
  for (let i = 0; i < 4; i++) g.turnWheel(1, 1); assert.equal(w.notches, 4); assert(kinds(g).includes('ratchet'));
  tick(g, 1); assert(d.y < 262 && d.y > d.top, 'door is half open'); assert(Math.abs(d.y - 213) < 2);
  for (let i = 0; i < 3; i++) g.turnWheel(1, 1); assert.equal(g.phase, 'play');
  g.turnWheel(1, -1); assert.equal(w.notches, 8); assert.equal(g.phase, 'climb'); assert(kinds(g).includes('gate-open'));
  tick(g, GATEHOUSE_TIMING.climb + .05); assert.equal(g.floor, 2); assert.equal(g.villain.hp, GATEHOUSE_MODES.easy.hp);
});

test('floor 3 duel: Korr HP to zero starts the defeat, then the run is won', () => {
  const g = live(new Gatehouse({ difficulty: 'easy' }), 2), v = g.villain;
  g.hitVillain(10, false); assert.equal(v.hp, 14); assert.equal(g.phase, 'play');
  g.hitVillain(3, true); assert.equal(v.stage, 'stagger'); assert(kinds(g).includes('stagger'));
  g.hitVillain(99, false); assert.equal(g.phase, 'defeat'); assert.equal(v.stage, 'defeated'); assert.equal(v.body.length, 0); assert(kinds(g).includes('korr-defeat'));
  tick(g, GATEHOUSE_TIMING.defeat + .05); assert.equal(g.state, 'won');
});

test('ram: three centre hits arm the ring, the next centre hit launches a 2.2x ball', () => {
  const g = live(new Gatehouse({ difficulty: 'easy' }), 2); g.villain.solid = false; g.updateBody();
  for (let i = 1; i <= 3; i++) { drop(g, i % 2 ? 3 : -4); assert.equal(g.paddle.streak, i, `hit ${i}`); assert.equal(g.paddle.armed, i === 3); }
  assert(kinds(g).includes('ram-armed'));
  const b = drop(g, 2); assert(b.ram > 0 && b.ram <= 2.5); assert.equal(b.r, 13.2); assert.equal(b.ramBricks, 14); assert.equal(g.paddle.armed, false); assert.equal(g.paddle.streak, 0); assert(kinds(g).includes('ram-launch'));
});

test('ram: an off-centre hit resets the streak, but never while the ring is armed', () => {
  const g = live(new Gatehouse({ difficulty: 'easy' }), 2); g.villain.solid = false; g.updateBody();
  drop(g, 0); drop(g, 1); assert.equal(g.paddle.streak, 2); drop(g, 40); assert.equal(g.paddle.streak, 0); assert.equal(g.paddle.armed, false);
  drop(g, 0); drop(g, 0); drop(g, 0); assert(g.paddle.armed); drop(g, 40); assert(g.paddle.armed, 'armed ring survives a stray hit');
});

test('ram: ploughs through at most 14 bricks, then shrinks back to r=6', () => {
  const g = live(new Gatehouse({ difficulty: 'easy' }), 0);
  g.bricks = Array.from({ length: 20 }, (_, i) => ({ id: `col-${i}`, type: 'brick', x: g.paddle.x - 18, y: 520 - i * 22, w: 36, h: 18, hp: 1, maxHP: 1, colour: 'coral' }));
  const b = { id: 99, x: g.paddle.x, y: 560, px: g.paddle.x, py: 560, vx: 0, vy: -345, r: 13.2, caught: false, dead: false, ram: 2.5, ramBricks: 14, contacts: new Set() }; g.balls = [b]; const seen = new Set(), fx = g.effect.bind(g); g.effect = (x, y, kind, ...r) => { seen.add(kind); return fx(x, y, kind, ...r); };
  tick(g, 1.2); assert.equal(g.bricks.filter(x => x.hp > 0).length, 20 - 14 - 1, '14 ploughed, then the plain ball breaks one and rebounds'); assert.equal(b.r, 6); assert.equal(b.ram, 0); assert(seen.has('ram-end'));
});

test('ram: a ram that finds no bricks ends after 2.5 s', () => {
  const g = live(new Gatehouse({ difficulty: 'easy' }), 0);
  const b = { id: 99, x: 180, y: 400, px: 180, py: 400, vx: 120, vy: -300, r: 13.2, caught: false, dead: false, ram: 2.5, ramBricks: 14, contacts: new Set() }; g.balls = [b];
  tick(g, 2.3); assert.equal(b.r, 13.2); tick(g, .4); assert.equal(b.r, 6); assert.equal(b.ram, 0);
});

test('ram: housings take 2, Korr takes 3 and a ram in the windup staggers him', () => {
  const g = live(new Gatehouse({ difficulty: 'easy' }), 2), v = g.villain, hp = v.hp, sx = v.foot.x - 30, sy = v.foot.y - 60;
  const shot = () => { const b = { id: ++g.serial, x: sx, y: sy + 120, px: sx, py: sy + 120, vx: 0, vy: -300, r: 13.2, caught: false, dead: false, ram: 2.5, ramBricks: 14, contacts: new Set() }; g.balls = [b]; tick(g, .35); return b; };
  shot(); assert.equal(v.hp, hp - 3); assert.notEqual(v.stage, 'stagger');
  v.stage = 'windup'; v.until = g.time + 1; shot(); assert.equal(v.hp, hp - 6); assert.equal(v.stage, 'stagger');
});

test('a bell that reaches the paddle stuns it for 0.8 s instead of costing a ball', () => {
  const g = live(new Gatehouse({ difficulty: 'easy' }), 1), p = g.paddle; g.nextWarning = Infinity; g.teachingDone = true;
  const bell = g.releaseBell(false); Object.assign(bell, { x: p.x + 20, y: p.y - 60, px: p.x + 20, py: p.y - 60, vx: 0, vy: 150 });
  g.balls = [{ id: 98, x: 20, y: 300, px: 20, py: 300, vx: 0, vy: 0, r: 6, caught: true, dead: false, ram: 0, ramBricks: 0, contacts: new Set() }];
  const lives = g.lives; tick(g, .5);
  assert(p.stun > 0 && p.stun <= GATEHOUSE_TIMING.stun); assert(kinds(g).includes('paddle-stun')); assert.equal(g.lives, lives); assert.equal(g.bells.length, 0);
  const x = p.x; g.setTarget(x + 80); tick(g, .2); assert.equal(p.x, x, 'stunned paddle cannot move'); tick(g, .5); assert.equal(p.stun, 0); tick(g, .2); assert(p.x > x);
});

test('the teaching bell (the first bell on a floor) never stuns', () => {
  const g = live(new Gatehouse({ difficulty: 'easy' }), 1), p = g.paddle; g.nextWarning = Infinity;
  const bell = g.releaseBell(true); Object.assign(bell, { x: p.x, y: p.y - 60, px: p.x, py: p.y - 60, vx: 0, vy: 150 }); assert(bell.teaching);
  g.balls = [{ id: 98, x: 20, y: 300, px: 20, py: 300, vx: 0, vy: 0, r: 6, caught: true, dead: false, ram: 0, ramBricks: 0, contacts: new Set() }];
  tick(g, .6); assert.equal(p.stun, 0); assert(!kinds(g).includes('paddle-stun')); assert.equal(g.bells.length, 0);
});

test('the first bell of a floor is a teaching bell and comes after a visible warning of the mode tell length', () => {
  for (const mode of ['easy', 'hard']) {
    const g = live(new Gatehouse({ difficulty: mode }), 1); g.floorTime = g.nextWarning;
    g.update(1 / 120); const warn = g.effects.find(e => e.kind === 'bell-warning'); assert(warn, 'warning'); assert.equal(warn.life, GATEHOUSE_MODES[mode].tell); assert.equal(g.villain.stage, 'windup'); assert.equal(g.bells.length, 0);
    tick(g, GATEHOUSE_MODES[mode].tell + .1); assert.equal(g.bells.length, 1); assert(g.bells[0].teaching); assert(kinds(g).includes('bell-release'));
  }
});

test('two ball hits shatter a bell; the bell is knocked back at Korr for big damage', () => {
  const g = live(new Gatehouse({ difficulty: 'easy' }), 1); g.nextWarning = Infinity;
  const bell = g.releaseBell(false); g.hitBell(bell, { nx: 0, ny: -1 }, 300); assert.equal(bell.hp, 1); assert(!bell.dead); g.hitBell(bell, { nx: 0, ny: -1 }, 300); assert(bell.dead); assert(kinds(g).includes('bell-break'));
  const d = live(new Gatehouse({ difficulty: 'easy' }), 2), v = d.villain, hp = v.hp; d.nextWarning = Infinity;
  const r = Object.assign(d.releaseBell(false) || { }, { x: v.foot.x - 20, y: v.foot.y + 70, px: v.foot.x - 20, py: v.foot.y + 70, vx: 0, vy: -250, returning: true });
  tick(d, .5); assert.equal(v.hp, hp - 4); assert.equal(v.stage, 'stagger'); assert(kinds(d).includes('bell-shoulder'));
});

test('Ward: a full charge deploys a bar below the paddle that ends bells and bounces balls', () => {
  const g = live(new Gatehouse({ difficulty: 'easy' }), 1); g.nextWarning = Infinity;
  assert.equal(g.canActivate('ward'), false); g.charge = 100; assert(g.canActivate('ward')); assert(g.canActivate('echo'));
  assert(g.activate('ward')); assert.equal(g.charge, 0); assert(kinds(g).includes('ward-deploy')); assert.equal(g.ward.y, g.paddle.y + 24); assert.equal(g.activate('ward'), false);
  const p = g.paddle, bell = g.releaseBell(false); Object.assign(bell, { x: 40, y: p.y - 10, px: 40, py: p.y - 10, vx: 0, vy: 200 });
  g.balls = [{ id: 98, x: 300, y: p.y + 10, px: 300, py: p.y + 10, vx: 0, vy: 200, r: 6, caught: false, dead: false, ram: 0, ramBricks: 0, contacts: new Set() }];
  tick(g, .4); assert.equal(g.bells.length, 0); assert.equal(g.paddle.stun, 0); assert(g.balls[0].vy < 0, 'ball bounced off the ward'); assert.equal(g.lives, 9);
  tick(g, GATEHOUSE_TIMING.ward); assert.equal(g.ward, null);
});

test('losing the last ball ends the run; Continue keeps the floor and its progress', () => {
  const g = live(new Gatehouse({ difficulty: 'easy' }), 1); g.wheel.notches = 3; g.score = 120; g.lives = 1;
  g.balls = [{ id: 98, x: 180, y: g.height + 40, px: 180, py: g.height + 40, vx: 0, vy: 200, r: 6, caught: false, dead: false, ram: 0, ramBricks: 0, contacts: new Set() }];
  g.update(1 / 120); assert.equal(g.state, 'lost'); assert.equal(g.lives, 0); assert.equal(g.reason, 'No balls remaining');
  assert(g.continue()); assert.equal(g.state, 'play'); assert.equal(g.floor, 1); assert.equal(g.wheel.notches, 3); assert.equal(g.score, 120); assert(g.lives >= 2); assert.equal(g.phase, 'serve'); assert.equal(g.continue(), false);
  const h = live(new Gatehouse({ difficulty: 'easy' }), 0); h.housings[0].hp = 1; h.lives = 1; h.lose('x'); h.continue(); assert.equal(h.floor, 0); assert.equal(h.housings[0].hp, 1);
});

test('a lost ball costs one life and re-serves; paused and finished states are inert', () => {
  const g = new Gatehouse({ difficulty: 'easy' }); g.launch(); g.balls[0].y = g.height + 40; g.balls[0].vy = 100; g.update(1 / 120); assert.equal(g.lives, 2); assert.equal(g.phase, 'serve');
  g.pause(true); const t = g.time; g.launch(); g.update(1); assert.equal(g.time, t); assert.equal(g.phase, 'serve');
  g.pause(false); g.state = 'won'; g.update(1); assert.equal(g.time, t);
});

test('no ball or bell ever leaves the playfield or goes non-finite over a long scripted run on every floor', () => {
  for (const mode of ['easy', 'medium', 'hard']) for (const floor of [0, 1, 2]) {
    const g = new Gatehouse({ difficulty: mode, floor }); g.lives = 99; g.launch();
    for (let i = 0; i < 120 * 40; i++) {
      g.setTarget(180 + Math.sin(i / 70) * 110); g.update(1 / 120); if (g.state !== 'play') break;
      for (const b of [...g.balls, ...g.bells]) assert(Number.isFinite(b.x) && Number.isFinite(b.y) && b.x > -1 && b.x < g.width + 1, `${mode} f${floor} step ${i}`);
    }
  }
});
