// Dragon's Hoard (chapter 12): layout, the Wake eye and Hush Chimes, Ember's tells, molten gold, the greed choice, the
// avalanche, Continue, Ember's face mapping, ram rules and a seeded ordinary bot.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DragonsHoard, HOARD_MODES, HOARD_LAYOUT, HOARD_TIMING, GREED, RAGE, LOOT } from '../src/fantasy/hoard.js';
import { RAM, BACK_WARD } from '../src/fantasy/ram.js';
import { overlapsTarget } from '../src/carrier-physics.js';

const PHONES = [[700, 584.6], [751, 641]];   // 393x852 and 412x915 (fantasyWorld in the audit adapters)
const make = (o = {}) => new DragonsHoard({ height: 700, paddleY: 584.6, difficulty: 'easy', ...o });
const live = m => m.bricks.filter(b => b.hp > 0);
const inside = (m, ball) => live(m).filter(b => overlapsTarget({ x: ball.x, y: ball.y, r: ball.r - .01 }, b.shape));
const run = (m, s) => { for (let i = 0; i < Math.round(s * 240); i++) m.update(1 / 240); };
const park = m => { m.launch(); const b = m.balls[0]; Object.assign(b, { x: 10, y: m.paddle.y - 60, vx: 0, vy: 0 }); m.paddle.targetX = m.paddle.x = 300; return b; };

test('every floor fits the 28u side lanes, never overlaps, clears the ledge and leaves a ball-wide gap under the weights', () => {
  for (const [height, paddleY] of PHONES) for (let f = 0; f < 3; f++) {
    const m = make({ height, paddleY, floor: f }), field = live(m).filter(b => b.field);
    for (const b of field) { assert(b.x >= 28 - 1e-9 && b.x + b.w <= 332 + 1e-9, `${b.id} in the lanes`); assert(b.y > m.ceiling + 2 * 6, `${b.id} below the ledge`); }
    for (const a of live(m)) for (const b of live(m)) if (a !== b) assert(!(a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h), `${a.id} overlaps ${b.id}`);
    assert(Math.max(...field.map(b => b.y + b.h)) <= paddleY - HOARD_LAYOUT.gap[f] + 1e-9, 'bottom row gap');
    if (f === 1) for (const w of live(m).filter(b => b.kind === 'weight')) assert(Math.min(...field.map(b => b.y)) - (w.y + w.h) >= 12, 'a ball fits between a weight and the hoard');
    if (f === 2) assert.deepEqual([m.gate.x, m.gate.w, m.gate.y + m.gate.h], [HOARD_LAYOUT.gate.x, HOARD_LAYOUT.gate.w, m.ceiling]);
  }
  // Gold stays an accent: at most a sixth of each floor.
  for (let f = 0; f < 3; f++) { const m = make({ floor: f }), field = live(m).filter(b => b.field); assert(field.filter(b => b.kind === 'coin' || b.kind === 'chest').length / field.length < 1 / 6); }
});

test('the Crown chest collider is the drawn chest: one 3x3 block, the manifest contact rect in both damage states', () => {
  const m = make(), c = m.bricks.find(b => b.kind === 'crown'), man = JSON.parse(readFileSync(new URL('../assets/hoard/manifest.json', import.meta.url), 'utf8')).sprites;
  assert.deepEqual([c.w, c.h], [2 * HOARD_LAYOUT.pitch + HOARD_LAYOUT.bw, 2 * HOARD_LAYOUT.rowPitch + HOARD_LAYOUT.bh]);
  for (const k of ['crown_chest', 'crown_chest_cracked']) { assert.deepEqual(man[k].contact, [0, 0, c.w, c.h]); assert.deepEqual(man[k].drawSize, [c.w, c.h]); }
  for (const e of ['idle', 'taunt', 'windup', 'attack', 'hurt', 'stagger', 'panic', 'defeat']) assert.equal(man[`ember_${e}`].solid, false, 'Ember is scenery');
  // Weights: the Gatehouse housing contract (ring on the ledge, body under it), drawn on the full rect.
  const w = make({ floor: 1 }).bricks.find(b => b.kind === 'weight');
  assert.equal(w.shape.shapes[1].y, m.ceiling); assert.equal(w.shape.shapes[0].y + w.shape.shapes[0].h, w.y + w.h);
});

test('gold opens the eye by 100 / wakeAt per unit; a lit Hush Chime takes it back, calms him 3 s, then cools', () => {
  for (const [mode, r] of Object.entries(HOARD_MODES)) {
    const m = make({ difficulty: mode }); park(m); m.floorTime = 1;
    const coin = m.bricks.find(b => b.kind === 'coin'); m.hitBrick(coin, {});
    assert.ok(Math.abs(m.wake - 100 / r.wakeAt) < 1e-9, mode); assert.equal(m.loot, LOOT.coin);
    m.wake = 50; const chime = m.bricks.find(b => b.kind === 'chime');
    assert.equal(m.strikeChime(chime), true); assert.equal(m.wake, 50 - r.chime); assert.equal(chime.lit, false);
    const before = m.wake; m.hitBrick(m.bricks.find(b => b.kind === 'coin' && b.hp > 0), {}); assert.equal(m.wake, before, 'calm: gold adds nothing');
    assert.equal(m.strikeChime(chime), false, 'a dim chime does nothing'); assert.equal(m.wake, before);
    chime.cool = .01; run(m, .02); assert.equal(chime.lit, true, 'relit after cooling');
  }
});

test('a full eye winds up the wake roar: tell, then the paddle stripe scorches and the lowest gold row melts; the eye resets to 40', () => {
  const m = make(); park(m); m.taught.roar = true; m.floorTime = 10; m.wake = 100;
  m.updateEmber(); assert.equal(m.ember.stage, 'windup'); assert.equal(m.emberFace(), 'windup'); assert.ok(m.ember.payload.stripe && m.ember.payload.row !== null);
  const row = m.ember.payload.row; m.paddle.x = m.ember.payload.stripe.x; m.floorTime = m.ember.until; m.updateEmber();
  assert.equal(m.ember.stage, 'release'); assert.equal(m.emberFace(), 'breath', 'the wake roar lands as his breath pose'); assert.ok(m.paddle.scorch > 0, 'scorched');
  assert.ok(m.bricks.some(b => b.row === row && b.kind === 'molten'), 'row melted'); assert.equal(m.wake, HOARD_TIMING.reset); assert.equal(m.wakes, 1);
});

test('the first roar and the first breath are yawns (no scorch, no melt); a chime during a tell hushes it', () => {
  const m = make({ floor: 1 }); park(m); m.floorTime = 20; m.nextHazard = 0;
  m.updateEmber(); assert.equal(m.ember.kind, 'roar'); assert.ok(m.ember.teaching);
  m.paddle.x = m.ember.payload.stripe.x; m.floorTime = m.ember.until; m.updateEmber(); assert.equal(m.emberFace(), 'sweep', 'the paddle roar is his tail sweep'); assert.equal(m.paddle.scorch, 0); assert.ok(m.effects.some(e => e.kind === 'yawn'));
  m.ember.stage = 'idle'; m.nextHazard = 0; m.updateEmber(); assert.equal(m.ember.teaching, false);
  m.strikeChime(m.bricks.find(b => b.kind === 'chime' && b.lit)); assert.equal(m.ember.stage, 'idle', 'hushed'); assert.ok(m.nextHazard >= m.floorTime + 3);
  const f3 = make({ floor: 2 }); park(f3); f3.floorTime = 20; f3.nextHazard = 0; f3.hazardTurn = 0; f3.updateEmber();
  assert.equal(f3.ember.kind, 'breath'); assert.ok(f3.ember.teaching); const row = f3.ember.payload.row; f3.floorTime = f3.ember.until; f3.updateEmber();
  assert.ok(!f3.bricks.some(b => b.row === row && b.kind === 'molten'), 'the first breath melts nothing');
});

test('molten gold is worth loot while soft and hardens into 2-hit gold after its timer', () => {
  for (const [mode, r] of Object.entries(HOARD_MODES)) {
    const m = make({ difficulty: mode }); park(m); const row = m.lowestRow(); m.melt(row);
    const soft = m.bricks.filter(b => b.kind === 'molten'); assert.ok(soft.length >= 3);
    m.hitBrick(soft[0], {}); assert.equal(soft[0].hp, 0); assert.equal(m.loot, LOOT.molten);
    run(m, r.molten + .05); assert.ok(soft.slice(1).every(b => b.kind === 'hard' && b.hp === 2), mode);
    m.hitBrick(soft[1], {}); assert.equal(soft[1].hp, 1);
  }
});

test('floor 2: the weights open the way out and freeze play on the greed card; RUN climbs with rage from the eye', () => {
  for (const [wake, rage] of [[10, 0], [RAGE.at[0], 1], [RAGE.at[1], 2]]) {
    const m = make({ floor: 1 }), b = park(m); b.vx = 100; b.vy = -200; m.wake = wake;
    for (const w of m.bricks.filter(q => q.kind === 'weight')) while (w.hp > 0) m.hitBrick(w, {});
    assert.equal(m.phase, 'greed');
    const at = { x: b.x, y: b.y }; run(m, 1); assert.deepEqual({ x: b.x, y: b.y }, at, 'frozen'); assert.equal(m.emberFace(), 'panic');
    assert.equal(m.choose('run'), true); assert.equal(m.phase, 'climb'); assert.equal(m.rage, rage);
    run(m, HOARD_TIMING.climb + .01); assert.equal(m.floor, 2); assert.equal(m.wake, 100);
  }
});

test('STAY spills gold to a full vein, earns x1.5 at 4 gold and x2 at 8; RUN banks it; the creeping eye can catch Kit', () => {
  const m = make({ floor: 1 }); park(m); m.balls[0].vy = -1;
  for (const w of m.bricks.filter(q => q.kind === 'weight')) while (w.hp > 0) m.hitBrick(w, {});
  for (const c of m.bricks.filter(q => q.kind === 'coin' || q.kind === 'chest')) c.hp = 0;   // picked over before the card
  m.choose('stay'); assert.equal(m.phase, 'play'); assert.ok(m.goldLeft() >= GREED.spill, 'spilled'); assert.ok(m.bricks.some(b => b.spilled));
  for (const b of m.bricks.filter(q => q.spilled)) for (const ball of m.balls) assert.equal(inside(m, ball).length, 0);
  const gold = () => m.bricks.find(q => q.kind === 'coin' && q.hp > 0);
  for (let i = 0; i < 4; i++) { m.ember.calm = 0; m.wake = 0; m.hitBrick(gold(), {}); } assert.equal(m.mult, GREED.mult[1]);
  for (let i = 0; i < 4; i++) { m.wake = 0; m.hitBrick(gold(), {}); } assert.equal(m.mult, GREED.mult[2]);
  assert.equal(m.run(), true); assert.equal(m.phase, 'climb');
  // Caught: the passive creep reaches 100.
  const c = make({ floor: 1 }); park(c); c.balls[0].vy = -1;
  for (const w of c.bricks.filter(q => q.kind === 'weight')) while (w.hp > 0) c.hitBrick(w, {});
  c.choose('stay'); c.greed.gold = 5; c.mult = 1.5; c.wake = 99.9; c.floorTime = 50; c.addWake(1, true);
  assert.equal(c.phase, 'climb'); assert.equal(c.mult, 1); assert.equal(c.rage, 2); assert.equal(c.wakes, 1); assert.equal(c.emberFace(), 'breath');
});

test('floor 3 banks loot x multiplier when the gate breaks, and the escape wins', () => {
  const m = make({ floor: 2 }); park(m); m.loot = 200; m.mult = 2;
  m.hitGate(m.gate.hp); assert.equal(m.phase, 'escape'); assert.equal(m.banked, 400); assert.equal(m.score >= 400, true); assert.equal(m.emberFace(), 'defeat');
  run(m, HOARD_TIMING.escape + .05); assert.equal(m.state, 'won');
  // The ceiling contact under the door is a gate hit.
  const g = make({ floor: 2 }), b = park(g), hp = g.gate.hp; Object.assign(b, { x: g.gate.x + 40, y: g.ceiling + 30, vx: 0, vy: -345 });
  for (const q of g.bricks) q.hp = 0; g.march.next = Infinity; run(g, .2); assert.equal(g.gate.hp, hp - 1);
});

test('the avalanche slides the hoard a row at a time and pushes out any ball it lands on; a crash costs a ball and lifts the pile', () => {
  for (const [height, paddleY] of PHONES) {
    const m = make({ height, paddleY, floor: 2 }), b = park(m); m.nextHazard = Infinity;
    const low = m.bricks.filter(q => q.field && q.hp > 0).reduce((a, q) => q.y > a.y ? q : a);
    Object.assign(b, { x: low.x + low.w / 2, y: low.y + low.h + b.r + .5, vx: 0, vy: 1 });   // just under the bottom row, nearly still
    const y0 = low.y; m.startSlide(HOARD_LAYOUT.rowPitch, HOARD_TIMING.slide);
    for (let i = 0; i < 240 && m.slide; i++) { m.updateSlide(1 / 240); assert.equal(inside(m, b).length, 0, 'never inside a brick'); }
    assert.ok(Math.abs(low.y - y0 - HOARD_LAYOUT.rowPitch) < 1e-6); assert.ok(b.y - b.r >= low.y + low.h - 1e-6, 'pushed down');
    // Crash: march the pile down to the line.
    const lives = m.lives; m.march.next = 0; let n = 0; while (m.lives === lives && n++ < 60 * 240) m.update(1 / 240);
    assert.equal(m.lives, lives - 1); assert.ok(m.effects.some(e => e.kind === 'avalanche')); run(m, HOARD_TIMING.lift + .05);
    assert.ok(m.fieldBottom() <= m.dangerY - 2 * HOARD_LAYOUT.rowPitch, 'lifted');
    m.lives = 1; m.march.next = 0; n = 0; while (m.state === 'play' && n++ < 60 * 240) { m.balls[0].vy = Math.min(m.balls[0].vy, 0); m.update(1 / 240); }
    assert.equal(m.state, 'lost'); assert.equal(m.reason, 'The hoard buried Kit');
  }
});

test('rage marches faster and starts the hoard lower', () => {
  const calm = make({ floor: 2 }), mad = make(); mad.rage = 2; mad.buildFloor(2);
  assert.ok(Math.min(...live(mad).filter(b => b.field).map(b => b.y)) - Math.min(...live(calm).filter(b => b.field).map(b => b.y)) === RAGE.rows[2] * HOARD_LAYOUT.rowPitch);
  assert.ok(mad.march.next < calm.march.next);
});

test('Continue keeps the floor, holds the serve with a Ward, freezes every clock until the tap, and caps the eye', () => {
  const m = make({ floor: 1 }); park(m); m.wake = 98; m.loot = 120; m.floorTime = 30; m.nextHazard = 31; m.lose('fixture');
  assert.equal(m.continue(), true); assert.equal(m.state, 'play'); assert.equal(m.floor, 1); assert.equal(m.loot, 120);
  assert.ok(m.backHold && m.phase === 'serve'); assert.deepEqual(m.ward, { y: m.paddle.y + 24, remaining: BACK_WARD });
  assert.equal(m.wake, 100 - HOARD_MODES.easy.chime); assert.ok(m.nextHazard >= 33);
  const t = m.floorTime; run(m, 12); assert.equal(m.floorTime, t); assert.equal(m.phase, 'serve');
  m.launch(); assert.equal(m.backHold, false); run(m, BACK_WARD + .1); assert.equal(m.ward, null);
  m.lose('again'); assert.equal(m.continue(), false);
  const f3 = make({ floor: 2 }); park(f3); f3.lose('x'); f3.continue(); const next = f3.march.next, dy = f3.fieldDy; run(f3, 10); assert.equal(f3.march.next, next); assert.equal(f3.fieldDy, dy);
});

test('the continue panel names what is left on each floor', () => {
  const a = make(); a.bricks.find(b => b.kind === 'crown').hp = 2; assert.equal(a.nearMiss().line, 'THE CROWN CHEST HAS 2 HP LEFT');
  const b = make({ floor: 1 }); const w = b.bricks.filter(q => q.kind === 'weight'); w[0].hp = 0; w[1].hp = 1; assert.equal(b.nearMiss().line, '1 HIT TO DROP THE COUNTERWEIGHTS');
  const c = make({ floor: 2 }); c.gate.hp = 3; assert.equal(c.nearMiss().line, 'THE CAVE GATE HAS 3 HP LEFT'); assert.deepEqual(c.nearMiss().stage, ['FLOOR', 3, 3]); assert.ok(c.nearMiss().progress > 2 / 3 && c.nearMiss().progress < 1);
});

test("Ember's face follows play: asleep, taunting, tells, hurt on treasure, staggered by a chime, panicking at the gate", () => {
  const m = make(); park(m);
  assert.equal(m.emberFace(), 'sleep'); m.wake = 70; assert.equal(m.emberFace(), 'stir'); m.wake = 0;
  m.time = 10; m.ember.feel('lost', 9.5); assert.equal(m.emberFace(), 'stir');
  m.ember.feel('treasure', 9.8); assert.equal(m.emberFace(), 'hurt');
  m.ember.feel('chime', 9.9); assert.equal(m.emberFace(), 'dizzy');
  const f3 = make({ floor: 2 }); assert.equal(f3.emberFace(), 'stir'); f3.gate.hp = 1; assert.equal(f3.emberFace(), 'panic');
});

test('the Ram ploughs ordinary, coin and molten bricks but bounces off chests, chimes, hard gold, the Crown chest and weights', () => {
  const m = make();
  for (const [kind, yes] of [['brick', true], ['coin', true], ['molten', true], ['chest', false], ['chime', false], ['hard', false], ['crown', false], ['weight', false]]) assert.equal(m.ramPierce({ kind }), yes, kind);
  const c = m.bricks.find(b => b.kind === 'crown'), hp = c.hp; m.hitBrick(c, { ram: 1 }); assert.equal(c.hp, hp - RAM.damage);
});

// Ordinary public-input bot (as tests/rivals.test.js): predicted landing point plus a seeded aim error, no powers, no Continue.
// The greed card is answered RUN for even seeds and STAY (then RUN at x2) for odd ones.
const lcg = seed => { let s = seed >>> 0; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 2 ** 32); };
const fold = x => { const p = ((x - 6) % 696 + 696) % 696; return 6 + (p > 348 ? 696 - p : p); };
function bot(difficulty, seed, height, paddleY) {
  const previous = Math.random; Math.random = lcg(seed * 7919 + 17);
  try {
    const m = new DragonsHoard({ height, paddleY, difficulty }), r = lcg(seed * 104729 + 3); let aim = 0, was = false;
    for (let n = 0; n < 120 * 500 && m.state === 'play'; n++) {
      if (m.phase === 'greed') m.choose(seed % 2 ? 'stay' : 'run');
      if (m.greed && !m.greed.caught && m.mult >= 2) m.run();
      if (m.phase === 'serve') m.launch(-Math.PI / 2 + (r() - .5));
      let best = null; for (const b of m.balls) if (!b.caught && b.vy > 0) { const t = (m.paddle.y - b.r - b.y) / b.vy; if (t >= 0 && (!best || t < best.t)) best = { t, b }; }
      if (best && !was) aim = (r() - .5) * .6 * m.paddle.w; was = !!best;
      if (best) m.setTarget(fold(best.b.x + best.b.vx * best.t) + aim);
      m.update(1 / 120);
    }
    return m;
  } finally { Math.random = previous; }
}
test('a seeded ordinary bot escapes on Easy at both phone heights, through both the RUN and the greedy STAY', () => {
  for (const [height, paddleY] of PHONES) for (const seed of [1, 2]) {
    const m = bot('easy', seed, height, paddleY);
    assert.equal(m.state, 'won', `easy ${height} seed ${seed}: ${m.state} on floor ${m.floor}, gate ${m.gate?.hp}`);
    assert(m.time > 60 && m.time < 400, `${m.time.toFixed(0)} s`); assert(m.banked > 0);
  }
});
test('Medium is harder but playable: the bot escapes most seeds', () => {
  let won = 0; for (const [height, paddleY] of PHONES) for (const seed of [1, 2, 3, 4]) won += bot('medium', seed, height, paddleY).state === 'won';
  assert(won >= 5, `medium ${won} / 8`);
});
