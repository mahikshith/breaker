import test from 'node:test';
import assert from 'node:assert/strict';
import { Gatehouse, GATEHOUSE_MODES, GATEHOUSE_FLOORS, GATEHOUSE_TIMING, PARAPET, RACK, GEM_SCORE, DULL, RAMP_BODY } from '../src/fantasy/gatehouse.js';

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
  g.hitHousing(b, 99); assert.equal(g.phase, 'crash'); assert(kinds(g).includes('drawbridge-crash')); assert(!g.solids.some(s => s.id === 'drawbridge'));
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

test('ram: ploughs through at most 14 bricks, then shrinks back to the ball radius', () => {
  const g = live(new Gatehouse({ difficulty: 'easy' }), 0);
  g.bricks = Array.from({ length: 20 }, (_, i) => ({ id: `col-${i}`, type: 'brick', x: g.paddle.x - 18, y: 520 - i * 22, w: 36, h: 18, hp: 1, maxHP: 1, colour: 'coral' }));
  const b = { id: 99, x: g.paddle.x, y: 560, px: g.paddle.x, py: 560, vx: 0, vy: -345, r: 13.2, caught: false, dead: false, ram: 2.5, ramBricks: 14, contacts: new Set() }; g.balls = [b]; const seen = new Set(), fx = g.effect.bind(g); g.effect = (x, y, kind, ...r) => { seen.add(kind); return fx(x, y, kind, ...r); };
  tick(g, 1.2); assert.equal(g.bricks.filter(x => x.hp > 0).length, 20 - 14 - 1, '14 ploughed, then the plain ball breaks one and rebounds'); assert.equal(b.r, 7); assert.equal(b.ram, 0); assert(seen.has('ram-end'));
});

test('ram: a ram that finds no bricks ends after 2.5 s', () => {
  const g = live(new Gatehouse({ difficulty: 'easy' }), 0);
  const b = { id: 99, x: 180, y: 400, px: 180, py: 400, vx: 120, vy: -300, r: 13.2, caught: false, dead: false, ram: 2.5, ramBricks: 14, contacts: new Set() }; g.balls = [b];
  tick(g, 2.3); assert.equal(b.r, 13.2); tick(g, .4); assert.equal(b.r, 7); assert.equal(b.ram, 0);
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
  const p = g.paddle, bell = g.releaseBell(false); Object.assign(bell, { x: p.x, y: p.y - 30, px: p.x, py: p.y - 30, vx: 0, vy: 200 }); // right over the paddle
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

test('bells never wedge between a ramp tip and the wall: every dropped or kicked bell reaches the paddle line', () => {
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (const floor of [1, 2]) for (let k = 0; k < 60; k++) {
    const g = live(new Gatehouse({ difficulty: 'hard' }), floor); g.nextWarning = Infinity; g.balls = []; g.lives = 9;
    g.villain.hole = g.holes[k % g.holes.length]; const bell = g.releaseBell(false);
    tick(g, .4 + rnd() * .6); if (!bell.dead) Object.assign(bell, { vx: (rnd() - .5) * 500, vy: (rnd() - .4) * 300 });
    let age = 0; for (let i = 0; i < 1200 && !bell.dead; i++) { g.update(1 / 120); age = bell.age; }
    assert(bell.dead, `floor ${floor} kick ${k}: bell gone`);
    assert(age < 6.5, `floor ${floor} kick ${k}: bell reached the paddle line by itself (age ${age.toFixed(2)} s, not the failsafe)`);
  }
});

test('a kicked bell bounces off bricks and the gate instead of passing through them', () => {
  const g = live(new Gatehouse({ difficulty: 'easy' }), 1); g.nextWarning = Infinity; g.balls = [];
  g.buildFloor(1); g.phase = 'play'; g.active = true; g.balls = []; g.lives = 9;
  const brick = g.bricks[g.bricks.length - 1], bell = g.releaseBell(false); // bottom row
  Object.assign(bell, { x: brick.x + brick.w / 2, y: brick.y + brick.h + 40, px: brick.x + brick.w / 2, py: brick.y + brick.h + 40, vx: 0, vy: -260, returning: false });
  let worst = 0;
  for (let i = 0; i < 120 && !bell.dead; i++) {
    g.update(1 / 120);
    for (const b of g.bricks) if (b.hp > 0) {
      const cx = Math.max(b.x, Math.min(bell.x, b.x + b.w)), cy = Math.max(b.y, Math.min(bell.y, b.y + b.h));
      worst = Math.max(worst, bell.r - Math.hypot(bell.x - cx, bell.y - cy));
    }
  }
  assert(worst < .5, `bell overlapped a brick by ${worst.toFixed(2)}u`); assert(bell.vy > 0 || bell.dead, 'the bell came back down'); assert(g.bricks.every(b => b.hp === b.maxHP), 'bells never break bricks');
});

test('the counterweight collider leaves the empty top corners open, and Korr\'s pose swaps eject the ball', () => {
  const g = live(new Gatehouse({ difficulty: 'easy' }), 0), h = g.housings[0], hp = h.hp;
  // A ball falling through the empty top-left corner of the housing does not touch it.
  const b = { id: 77, x: h.x + 6, y: h.y - 10, px: h.x + 6, py: h.y - 10, vx: 0, vy: 200, r: 3.5, caught: false, dead: false, ram: 0, ramBricks: 0, contacts: new Set() };
  g.balls = [b]; for (let i = 0; i < 10; i++) g.update(1 / 120);
  assert.equal(h.hp, hp, 'no hit from the air above the corner'); assert(b.y > h.y + 4);
  const d = live(new Gatehouse({ difficulty: 'easy' }), 2), v = d.villain; d.nextWarning = Infinity;
  const body = v.body[0], ball = { id: 78, x: body.x, y: body.y, px: body.x, py: body.y, vx: 0, vy: 300, r: 6, caught: false, dead: false, ram: 0, ramBricks: 0, contacts: new Set() };
  d.balls = [ball]; v.stage = 'windup'; d.updateBody();
  assert(v.body.every(c => Math.hypot(ball.x - c.x, ball.y - c.y) >= c.r + ball.r - 1e-6), 'pose swap pushed the ball clear');
});

// ---------- floor 1 hooks: Korr's winch, the par payoff and the loot gems (design/phase2/floor-hooks.md) ----------
// Run until the winch telegraph starts (or `limit` seconds pass) with no ball in play.
const untilCrank = (g, limit = 30) => { for (let t = 0; t < limit && g.winch.stage !== 'crank'; t += 1 / 120) g.update(1 / 120); return g.winch.stage === 'crank'; };

test('winch: after crankIdle s without a housing hit Korr telegraphs for 1.2-1.8 s, then winds a damaged housing back 1 HP', () => {
  for (const [mode, rules] of Object.entries(GATEHOUSE_MODES)) {
    assert(rules.crankTell >= 1.2 && rules.crankTell <= 1.8, `${mode} tell`); assert(rules.crankCap >= 1 && rules.par > 0);
    const g = live(new Gatehouse({ difficulty: mode }), 0), h = g.housings[1]; h.hp = h.maxHP - 2; g.floorTime = 0;
    assert(untilCrank(g)); assert(Math.abs(g.floorTime - rules.crankIdle) < .02, `${mode}: crank after ${g.floorTime}`);
    const tell = g.effects.find(e => e.kind === 'winch-tell'); assert(tell, 'tell effect'); assert.equal(tell.life, rules.crankTell); assert.equal(tell.housing, h.id);
    assert.equal(g.winch.target, h); assert.equal(g.villain.stage, 'windup', 'Korr cranks');
    tick(g, rules.crankTell - .05); assert.equal(h.hp, h.maxHP - 2, 'no heal during the telegraph');
    tick(g, .1); assert.equal(h.hp, h.maxHP - 1, 'healed by exactly 1'); assert(kinds(g).includes('housing-heal')); assert.equal(g.winch.heals, 1); assert.equal(g.villain.stage, 'release');
    assert(g.winch.idle < .1, 'the clock restarts');
  }
});

test('winch: a housing hit resets the clock, and a hit during the telegraph jams the crank (no heal)', () => {
  const g = live(new Gatehouse({ difficulty: 'medium' }), 0), [a, b] = g.housings; b.hp = 3;
  tick(g, g.rules.crankIdle - 1); g.hitHousing(a, 1); assert.equal(g.winch.idle, 0); assert.equal(g.winch.stage, 'idle');
  assert(untilCrank(g)); const hp = b.hp; tick(g, .3); g.hitHousing(a, 1);
  assert.equal(g.winch.stage, 'idle'); assert(kinds(g).includes('crank-jam')); assert.equal(g.villain.stage, 'stagger');
  tick(g, g.rules.crankTell + .2); assert.equal(b.hp, hp, 'jammed: nothing healed'); assert.equal(g.winch.heals, 0);
});

test('winch: never heals a destroyed housing, never a full one, and stops after crankCap cranks', () => {
  const g = live(new Gatehouse({ difficulty: 'hard' }), 0), [a, b] = g.housings; a.hp = 0;
  tick(g, g.rules.crankIdle * 3); assert.equal(g.winch.stage, 'idle', 'nothing damaged-but-standing: no crank'); assert.equal(a.hp, 0);
  b.hp = 1; assert(untilCrank(g)); assert.equal(g.winch.target, b);
  b.hp = 0; tick(g, g.rules.crankTell + .1); assert.equal(b.hp, 0, 'a housing destroyed mid-telegraph stays destroyed'); assert.equal(g.winch.heals, 0);
  const h = live(new Gatehouse({ difficulty: 'hard' }), 0), [c, d] = h.housings; c.hp = 0; d.hp = 1;
  tick(h, (h.rules.crankIdle + h.rules.crankTell) * (h.rules.crankCap + 3)); assert.equal(c.hp, 0); assert.equal(h.winch.heals, h.rules.crankCap); assert.equal(d.hp, 1 + h.rules.crankCap);
});

test('floor 1: Korr and his battlements sit above the ball ceiling; the ball never climbs past the parapet', () => {
  const g = new Gatehouse({ difficulty: 'hard' }); assert.equal(g.ceiling, PARAPET.bottom); assert.equal(g.villain.body.length, 0, 'scenery: no collider');
  assert(g.villain.foot.y <= PARAPET.bottom && g.winch.y <= PARAPET.bottom && g.rack.y <= PARAPET.bottom);
  assert(g.solids.some(s => s.id === 'parapet' && s.y + s.h === PARAPET.bottom && s.w === g.width));
  g.lives = 99; g.launch(-Math.PI / 2 + .3); let top = Infinity;
  for (let i = 0; i < 120 * 60 && g.floor === 0 && g.phase !== 'crash'; i++) { g.setTarget(180 + Math.sin(i / 50) * 120); g.update(1 / 120); for (const b of g.balls) if (!b.caught) top = Math.min(top, b.y - b.r); }
  assert(top >= PARAPET.bottom - .05, `ball reached y ${top}`);
});

test('always winnable: the seeded tracking bot drops the bridge on every mode, cranks and all', () => {
  const rng = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (const mode of ['easy', 'medium', 'hard']) {
    let heals = 0;
    for (let seed = 1; seed <= 6; seed++) {
      const rnd = rng(seed * 77), g = new Gatehouse({ difficulty: mode }); g.lives = 99; let o = (rnd() - .5) * 70;
      g.purpose.seconds = Infinity;   // the crank cap alone must let ordinary play through; the purpose clock has its own tests
      for (let i = 0; i < 240 * 240 && g.floor === 0 && g.phase !== 'crash'; i++) {
        if (g.phase === 'serve') g.launch(-Math.PI / 2 + (rnd() - .5) * 1.2);
        const b = g.balls[0]; if (b && !b.caught) { if (rnd() < .01) o = (rnd() - .5) * 70; g.setTarget(b.x + o); }
        g.update(1 / 240);
      }
      assert.equal(g.phase, 'crash', `${mode} seed ${seed}: bridge dropped (t=${g.floorTime.toFixed(1)}s, heals ${g.winch.heals})`);
      assert(g.winch.heals <= g.rules.crankCap); heals += g.winch.heals;
    }
    assert(heals > 0, `${mode}: Korr cranked in at least one run`);
  }
});

test('par payoff: a drop inside par smashes the bell rack and slows floor 2 bells; over par the rack is hauled off', () => {
  const g = live(new Gatehouse({ difficulty: 'medium' }), 0); g.floorTime = g.rules.par - 1; assert(g.parLeft > 0);
  assert.match(g.nearMiss().line, /CRUSH KORR’S BELL RACK$/);
  for (const h of g.housings) g.hitHousing(h, 99);
  assert(g.rackSmashed); assert.equal(g.rack.state, 'smashed'); assert(kinds(g).includes('rack-smash')); assert.equal(g.villain.stage, 'stagger');
  tick(g, GATEHOUSE_TIMING.crash + GATEHOUSE_TIMING.climb + .1); assert.equal(g.floor, 1); assert.equal(g.rack.state, 'smashed', 'floor 2 shows the wreck');
  assert.equal(g.bellInterval, g.rules.interval * RACK.slow); assert.equal(g.nextWarning, 6 + RACK.delay);
  // Measured: the gap between two non-teaching bells on floor 2 is the slowed interval.
  g.lives = 9; g.phase = 'play'; g.active = true; g.bricks = []; park(g); g.teachingDone = true; g.nextWarning = 0; const at = [];
  for (let t = 0; t < 40 && at.length < 2; t += 1 / 120) { const n = g.bells.length; g.update(1 / 120); if (g.bells.length > n) at.push(g.floorTime); g.bells = []; g.balls = [{ id: 1, x: 20, y: 300, px: 20, py: 300, vx: 0, vy: 0, r: 6, caught: true, dead: false, ram: 0, ramBricks: 0, contacts: new Set() }]; }
  assert(Math.abs(at[1] - at[0] - g.rules.interval * RACK.slow) < .05, `bell gap ${at[1] - at[0]}`);
  const s = live(new Gatehouse({ difficulty: 'medium' }), 0); s.floorTime = s.rules.par - .01; tick(s, .05);
  assert.equal(s.rack.state, 'gone'); assert(kinds(s).includes('par-missed')); assert.equal(s.parLeft, 0); assert.match(s.nearMiss().line, /DROP THE DRAWBRIDGE$/);
  for (const h of s.housings) s.hitHousing(h, 99); assert.equal(s.rackSmashed, false); assert(!kinds(s).includes('rack-smash'));
  tick(s, GATEHOUSE_TIMING.crash + GATEHOUSE_TIMING.climb + .1); assert.equal(s.bellInterval, s.rules.interval); assert.equal(s.nextWarning, 6);
});

test('loot gems: floor-1 gem bricks bank a gem each, and the crash pays them out in a shower', () => {
  const g = new Gatehouse({ difficulty: 'easy' }), gems = g.bricks.filter(b => b.gem); assert.equal(gems.length, 6); assert.deepEqual([...new Set(gems.map(b => b.gem))].sort(), ['blue', 'gold', 'rose']);
  live(g, 0); for (const b of gems.slice(0, 4)) g.hitBrick(b, null); assert.equal(g.gems, 4); assert.equal(kinds(g).filter(k => k === 'gem-pop').length, 4);
  const score = g.score; for (const h of g.housings) g.hitHousing(h, 99);
  const shower = g.effects.find(e => e.kind === 'loot-shower'); assert(shower); assert.equal(shower.n, 4); assert.equal(g.score, score + 2 * 25 + 4 * GEM_SCORE);
  g.buildFloor(1); assert(g.bricks.every(b => !b.gem), 'gems are a floor-1 reward');
});

test('ramps: the collider scales with the drawn beam, so a short ramp is no bigger than its art', () => {
  for (const floor of [1, 2]) {
    const g = new Gatehouse({ difficulty: 'medium', floor });
    for (const r of g.ramps) {
      const k = r.length / RAMP_BODY.length;
      assert.ok(Math.abs(r.body.thickness - RAMP_BODY.thickness * k) < 1e-9, `${floor} ${r.id} thickness`);
      assert.ok(Math.abs(r.body.length - r.length - RAMP_BODY.back * k) < 1e-9, `${floor} ${r.id} hinge`);
    }
  }
});

test('anti-loop: a ball orbiting the scenery pocket above the floor-2 ramp drops out well inside the stuck limit', () => {
  const rng = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(5);
  let worst = 0;
  for (let k = 0; k < 160; k++) {
    const g = new Gatehouse({ difficulty: 'hard', floor: 1 }); g.phase = 'play'; g.active = true; g.nextWarning = Infinity; g.lives = 9;
    const a = rng() * Math.PI * 2, sp = 345 * (1 + rng() * .25);
    const b = { id: 99, x: 240 + rng() * 112, y: 152 + rng() * 60, px: 0, py: 0, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 6, caught: false, dead: false, ram: 0, ramBricks: 0, contacts: new Set() };
    b.px = b.x; b.py = b.y; g.balls = [b]; g.bricks = [];
    let t = 0; for (; t < 20 && b.y < 268 && !b.dead; t += 1 / 240) g.step(1 / 240);
    worst = Math.max(worst, t);
  }
  assert.ok(worst < 10, `worst pocket escape ${worst.toFixed(2)}s`);
});

test('anti-loop: the nudge only bends dull scenery bounces, keeps speed, and never turns the ball into the wall', () => {
  const g = new Gatehouse({ difficulty: 'medium', floor: 1 });
  for (const [vx, nx] of [[-300, -1], [300, 1]]) {   // off the right wall and off the left wall
    const b = { vx, vy: -120, nudges: 0 }, speed = Math.hypot(b.vx, b.vy);
    g.unloop(b, { nx, ny: 0 });
    assert.ok(b.vy > -120, 'turned downward, toward the paddle');
    assert.ok(Math.sign(b.vx) === Math.sign(vx), 'still leaving the wall');
    assert.ok(Math.abs(Math.hypot(b.vx, b.vy) - speed) < 1e-9, 'speed kept');
  }
  const into = { vx: 0, vy: 300, nudges: 0 }; g.unloop(into, { nx: 0, ny: -1 });
  assert.deepEqual([into.vx, into.vy], [0, 300], 'a bounce that would point into the wall is left alone');
  assert.ok(DULL.after < 12 && DULL.turn > 0 && DULL.turn < .3);
});

test('Korr pose swaps never leave a ball inside him, even in a crease between two body circles', () => {
  const poses = ['idle', 'windup', 'release', 'stagger'];
  let checked = 0;
  for (const from of poses) for (const to of poses) {
    if (from === to) continue;
    for (let x = 100; x <= 260; x += 3) for (let y = 80; y <= 230; y += 3) {
      const g = new Gatehouse({ difficulty: 'hard', floor: 2 }), v = g.villain;
      v.stage = from; g.updateBody();
      const b = { x, y, vx: 200, vy: 300, r: 6, caught: false };
      if (v.body.some(c => Math.hypot(b.x - c.x, b.y - c.y) < c.r + b.r)) continue;
      g.balls = [b]; v.stage = to; g.updateBody(); checked++;
      assert.ok(v.body.every(c => Math.hypot(b.x - c.x, b.y - c.y) >= c.r + b.r - 1e-6), `${from}->${to} at ${x},${y} left the ball inside`);
    }
  }
  assert.ok(checked > 10000);
});
