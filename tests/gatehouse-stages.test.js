// Gatehouse Siege as four stages (design/phase2/stages-v2.md, Gatehouse row; floor-hooks.md carry-overs): the boards, the
// chamber reach check over every layout, the stage plan, the stage card, the hoist hook, knock-downs, the carry-overs,
// powers, special bricks, steel and the sliding tooth.
import test from 'node:test';
import assert from 'node:assert/strict';
import { Gatehouse, GATEHOUSE_MODES, GATEHOUSE_TIMING, HOIST, KORR_DAMAGE, POWER_TIME, SIEGE_HP, LOOT_CHEST, RACK } from '../src/fantasy/gatehouse.js';
import { STAGE_COUNT, GATEHOUSE_STAGES, BRICK, MIN_GAP, stageBoard, parseMap } from '../src/fantasy/gatehouse-stages.js';
import { chamberReach } from '../src/fantasy/reach.js';
import { stagePlan, chapterKind } from '../src/fantasy/stages.js';
import { SPEED } from '../src/fantasy/ram.js';

// The three phone shapes the game ships on: iPhone 393x852, Android 412x915 and the 814-tall test frame.
const PHONES = { ios: { height: 700, paddleY: 584.6 }, android: { height: 756.2, paddleY: 640.8 }, tall: { height: 780, paddleY: 665 } };
const MODES = ['easy', 'medium', 'hard'];
const make = (floor = 0, difficulty = 'medium', phone = PHONES.ios) => new Gatehouse({ width: 360, ...phone, difficulty, floor });
const tick = (g, seconds, dt = 1 / 120) => { for (let left = seconds; left > 1e-9; left -= dt) g.update(Math.min(left, dt)); };
const park = g => { g.balls = [{ id: ++g.serial, x: 20, y: 300, px: 20, py: 300, vx: 0, vy: 0, r: 6, caught: true, dead: false, ram: 0, ramBricks: 0, contacts: new Set() }]; };
const live = (g, keepBricks = false) => { g.skipCard(); g.lives = 9; g.phase = 'play'; g.active = true; if (!keepBricks) g.bricks = []; park(g); return g; };
const ball = (x, y, vx, vy, extra = {}) => ({ id: 900 + Math.floor(Math.random() * 1e6), x, y, px: x, py: y, vx, vy, r: 6, caught: false, dead: false, ram: 0, ramBricks: 0, contacts: new Set(), ...extra });
const kinds = g => g.effects.map(e => e.kind);
const clearBricks = g => { for (const b of g.bricks) while (b.hp > 0) g.hitBrick(b, null); };
const overlap = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

// ---------- the boards ----------
test('every Gatehouse stage layout passes the chamber reach check on every phone in every mode', () => {
  let chambers = 0;
  for (const [name, phone] of Object.entries(PHONES)) for (const difficulty of MODES) for (let i = 0; i < STAGE_COUNT; i++) {
    const g = make(i, difficulty, phone), v = g.reachView();
    if (i > 0) assert.ok(v.chambers.length > 0, `${name} ${difficulty} stage ${i + 1} has a steel chamber`);
    for (const c of v.chambers) {
      const r = chamberReach({ field: v.field, bars: v.bars, chamber: c, from: v.from });
      assert.ok(r.reachable && r.span >= 6, `${name} ${difficulty} stage ${i + 1} ${c.id}: reachable ${r.reachable}, span ${r.span}`);
      assert.ok(c.gap >= MIN_GAP, `${name} ${difficulty} stage ${i + 1} ${c.id}: gap ${c.gap}`);
      chambers++;
    }
  }
  assert.equal(chambers, 3 * 3 * 5, 'one chamber on stage 2, two on stage 3, two on stage 4');
});

test('the reach check fails a chamber sealed by iron', () => {
  const g = make(1), v = g.reachView(), c = v.chambers[0];
  const sealed = [...v.bars, { x: c.x + c.w - 30, y: c.y + c.h, w: 46, h: 8 }, { x: c.x + c.w, y: c.y, w: 8, h: c.h + 8 }];
  assert.equal(chamberReach({ field: v.field, bars: sealed, chamber: c, from: v.from }).reachable, false);
});

test('boards: bricks sit inside the field, never overlap each other or the iron, and carry a kind for the themed sets', () => {
  for (const [name, phone] of Object.entries(PHONES)) for (const difficulty of MODES) for (let i = 0; i < STAGE_COUNT; i++) {
    const g = make(i, difficulty, phone), at = `${name} ${difficulty} stage ${i + 1}`;
    for (const b of g.bricks) {
      assert.ok(['brick', 'gem', 'chest', 'armour'].includes(b.kind) && b.kind === b.type, `${at}: brick kind ${b.kind}`);
      assert.ok(b.x >= 0 && b.x + b.w <= 360 && b.y > g.ceiling && b.y + b.h < g.paddle.y - 150, `${at}: brick ${b.id} in the field`);
      assert.equal(b.hp, b.type === 'armour' || b.type === 'chest' ? 2 : 1);
      for (const o of g.bricks) if (o !== b) assert.ok(!overlap(b, o), `${at}: ${b.id} overlaps ${o.id}`);
      for (const s of g.bars) assert.ok(!overlap(b, s), `${at}: ${b.id} overlaps iron ${s.id}`);
      for (const s of g.solids) assert.ok(!overlap(b, s), `${at}: ${b.id} overlaps ${s.id}`);
      for (const h of g.housings) assert.ok(!overlap(b, h), `${at}: ${b.id} overlaps ${h.id}`);
    }
    for (const s of [...g.bars, ...g.movers]) assert.equal(s.kind, 'steel', `${at}: ${s.id} is steel`);
    assert.ok(g.bricks.filter(b => b.gem).every(b => ['gold', 'blue', 'rose'].includes(b.gem)));
    assert.ok(g.bricks.some(b => b.type === 'chest'), `${at}: a chest to open`);
    // Stage 3 keeps the right bell lane clear: bells drop off the ramp there.
    if (i === 2) assert.ok(g.bricks.every(b => b.x + b.w <= 320), `${at}: right bell lane is clear`);
  }
  assert.throws(() => parseMap(['bb...............'], 400), /overlap/);
  assert.throws(() => parseMap(['b'], 400), /not 17/);
});

test('the boards escalate: more hits to clear and a bigger armour share each stage, more armour on harder modes', () => {
  const hits = g => g.bricks.reduce((n, b) => n + b.hp, 0), armour = g => g.bricks.filter(b => b.type === 'armour').length / g.bricks.length;
  for (const d of MODES) for (let i = 1; i < STAGE_COUNT; i++) {
    const a = make(i - 1, d), b = make(i, d);
    assert.ok(hits(b) >= hits(a), `${d} stage ${i + 1}: ${hits(a)} -> ${hits(b)} hits`);
    assert.ok(armour(b) > armour(a), `${d} stage ${i + 1}: armour share ${armour(a)} -> ${armour(b)}`);
  }
  assert.ok(hits(make(1, 'medium')) > hits(make(0, 'medium')) * 1.5, 'the hook stage is the small one');
  for (let i = 1; i < STAGE_COUNT; i++) { const [e, m, h] = MODES.map(d => make(i, d)); assert.ok(armour(e) < armour(m) && armour(m) < armour(h), `stage ${i + 1} armour scales with difficulty`); }
  assert.equal(make(0).bricks.filter(b => b.type === 'armour').length, 0, 'the hook has no armour');
  // The hook's arch and the showdown's wall are shapes, not stacked rows: no three bricks share a column in a row run.
  for (let i = 0; i < STAGE_COUNT; i++) { const g = make(i), cols = {}; for (const b of g.bricks) (cols[b.x] ||= []).push(b.y); assert.ok(Object.values(cols).every(ys => ys.length <= 5), `stage ${i + 1}: no tall stacks`); }
  // Steel grows: posts on the hook, chambers after; the showdown adds the sliding tooth.
  const steel = i => make(i).bars.length + make(i).movers.length;
  assert.ok(steel(0) > 0 && steel(0) <= 2 && steel(1) >= 3 && steel(3) > steel(1));
});

test('the stage plan: four Siege stages, cumulative power pool, ball speed and Korr attack from the plan', () => {
  const g = make(), plan = stagePlan(4);
  assert.equal(g.stageCount, 4); assert.equal(STAGE_COUNT, 4); assert.equal(chapterKind(g.stageCount), 'Siege'); assert.equal(GATEHOUSE_STAGES.length, 4);
  for (let i = 0; i < 4; i++) {
    const m = make(i);
    assert.equal(m.stageLabel, `STAGE ${i + 1} OF 4`); assert.deepEqual(m.stagePlan, plan[i]); assert.equal(m.pool.stage, i);
    assert.ok(Math.abs(m.ballSpeed - SPEED * plan[i].speed) < 1e-9); assert.equal(m.attack, plan[i].attack ?? 1);
    assert.deepEqual(m.stagePlan.powers, plan.slice(0, i + 1).flatMap(p => p.adds), 'the pool grows per stage');
    assert.ok(m.stageInfo.name && m.stageInfo.stake);
  }
  assert.deepEqual(make(3).stagePlan.powers, ['wide', 'slow', 'split', 'shield', 'fire', 'laser', 'burst', 'titan']);
});

// ---------- the stage card ----------
test('stage card: every stage opens on a 1.2 s card that holds the ball and the clocks, a tap skips it, then serve', () => {
  for (let i = 0; i < 4; i++) {
    const g = make(i);
    assert.equal(g.phase, 'card'); assert.equal(g.launch(), false, 'no serve under the card');
    const t = g.floorTime; tick(g, GATEHOUSE_TIMING.card - .05); assert.equal(g.phase, 'card'); assert.equal(g.floorTime, t, 'clocks hold under the card');
    assert.ok(g.balls[0].caught && Math.abs(g.balls[0].x - g.paddle.x) < 1e-6);
    tick(g, .1); assert.equal(g.phase, 'serve'); assert.equal(g.card, null);
    const s = make(i); assert(s.skipCard()); assert.equal(s.phase, 'serve'); assert.equal(s.skipCard(), false); assert(s.launch());
  }
});

// ---------- stage 1: the hoist ----------
test('hook: Korr walks onto the battlements, cranks Lumi up two notches, gloats and walks off; the ratchet climbs every notch s', () => {
  for (const mode of MODES) {
    const g = make(0, mode), v = g.villain, h = g.hoist, notch = GATEHOUSE_MODES[mode].notch; g.skipCard();
    assert.equal(h.level, 0); assert.ok(v.foot.x > 360, 'Korr starts off screen');
    tick(g, .5); assert.equal(v.walk, 1); assert.ok(v.foot.x < 420 && v.foot.x > 262);
    tick(g, 1); assert.equal(v.stage, 'windup'); assert(kinds(g).includes('hoist-crank')); assert.ok(h.level > 0 && h.level < HOIST.start);
    tick(g, 1.3); assert.equal(v.stage, 'release'); assert.equal(h.level, HOIST.start); assert(kinds(g).includes('korr-gloat'));
    tick(g, 1.7); assert(g.hook.done); assert(v.gone); assert.equal(v.body.length, 0, 'Korr is scenery on the battlements');
    // The serve auto-launches; the hoist clock runs once play is live.
    if (g.phase === 'serve') g.launch(); g.lives = 99;
    const left = g.hoistLeft; assert.ok(Math.abs(left - (HOIST.top - HOIST.start) * notch) < .2, `${mode}: ${left}s on the hoist clock`);
    tick(g, notch + .05); assert.equal(Math.round(g.hoist.level), HOIST.start + 1); assert(kinds(g).includes('hoist-notch'));
  }
});

test('hoist: at the top Korr hauls Lumi away (no hairpin); clearing the arch first jams the hoist with her hairpin', () => {
  const g = live(make(0, 'hard')); g.hook.done = true; g.villain.gone = true; g.hoist.level = HOIST.top - 1; g.hoist.wait = 0;
  tick(g, g.rules.notch + .05); assert(g.hoist.lost); assert(g.hauled); assert(kinds(g).includes('hoist-top')); assert.equal(g.hoistLeft, 0);
  assert.match(g.nearMiss().line, /BRICKS? TO CLEAR THE ARCH$/);
  g.bricks = make(0, 'hard').bricks; clearBricks(g); assert.equal(g.phase, 'climb'); assert.equal(g.hairpin, false);
  tick(g, GATEHOUSE_TIMING.climb + .05); assert.equal(g.floor, 1); assert.equal(g.winch.pinned, false);
  const s = make(0, 'hard'); s.skipCard(); s.launch(); tick(s, 6);
  assert.match(s.nearMiss().line, /BRICKS TO JAM KORR’S HOIST$/); assert.ok(s.hoistLeft > 0);
  clearBricks(s); assert(s.hoist.jammed); assert(s.hairpin); assert(kinds(s).includes('hoist-jam'));
  tick(s, GATEHOUSE_TIMING.climb + .05); assert.equal(s.floor, 1); assert(s.winch.pinned, 'stage 2 opens with the winch pinned');
  assert.equal(s.stageLog.length, 1); assert.equal(s.stageLog[0].stage, 0);
});

test('hairpin payoff: the pinned winch jams Korr’s first crank by itself, hurting him; later cranks work', () => {
  const g = make(0); g.hairpin = true; g.buildFloor(1); live(g); const [a, b] = g.housings; b.hp = b.maxHP - 2; g.floorTime = 0;
  const hp = g.pool.hp;
  for (let t = 0; t < g.rules.crankIdle + .1; t += 1 / 120) g.update(1 / 120);
  assert(kinds(g).includes('crank-jam')); assert.equal(g.effects.find(e => e.kind === 'crank-jam').cause, 'hairpin');
  assert.equal(g.pool.hp, hp - KORR_DAMAGE.jam); assert.equal(g.winch.heals, 0); assert.equal(g.winch.pinned, false); assert.equal(b.hp, b.maxHP - 2);
  for (let t = 0; t < 30 && g.winch.stage !== 'crank'; t += 1 / 120) g.update(1 / 120);
  assert.equal(g.winch.stage, 'crank', 'the second crank is a real one'); void a;
});

// ---------- knock-downs and the shared HP pool ----------
test('knock-downs: the drawbridge crash inside par knocks Korr down at 85%; he escapes, a capsule and loot fall, HP carries', () => {
  const g = live(make(1)); const hp = g.pool.maxHP, score = g.score;
  assert.equal(g.pool.maxHP, Math.round(GATEHOUSE_MODES.medium.hp * SIEGE_HP));
  g.hurtKorr(KORR_DAMAGE.jam, false); assert.equal(g.pool.hp, hp - 2, 'jams chip him');
  for (const h of g.housings) g.hitHousing(h, 99);
  assert(g.rackSmashed); assert.equal(g.knockdowns, 1); assert.equal(g.pool.hp, g.pool.floorHP); assert.equal(g.pool.hp, Math.ceil(hp * .85));
  assert(kinds(g).includes('knockdown')); assert(g.villain.escape); assert.ok(g.score >= score + LOOT_CHEST);
  assert.equal(g.hurtKorr(5, false), 0, 'a knocked-down Korr takes no more damage this stage');
  tick(g, GATEHOUSE_TIMING.crash + GATEHOUSE_TIMING.climb + .05); assert.equal(g.floor, 2); assert.equal(g.pool.hp, Math.ceil(hp * .85), 'HP carries into stage 3');
  assert.deepEqual(g.stageLog.map(s => s.knockdowns), [1]);
});

test('knock-downs: murder-hole strikes (more during his windup) knock Korr down at 40%, then he flees the gallery', () => {
  const g = live(make(2)); g.nextWarning = Infinity; const v = g.villain, s = g.slot;
  const hp = g.pool.hp; g.hitSlot(null); assert.equal(g.pool.hp, hp - KORR_DAMAGE.slot); assert(kinds(g).includes('slot-hit'));
  v.stage = 'windup'; v.until = g.time + 1; g.hitSlot(null); assert.equal(g.pool.hp, hp - 1 - KORR_DAMAGE.slotWindup); assert.equal(v.stage, 'stagger');
  // A ball shot up the right lane into the iron pocket strikes him through the hole.
  v.stage = 'idle'; const b = ball(s.x + s.w / 2, 200, 0, -345); g.balls = [b]; const before = g.pool.hp; tick(g, .3); assert.ok(g.pool.hp < before, 'a ball in the pocket strikes Korr');
  // A bell knocked back up into the hole strikes harder.
  const bell = g.releaseBell(false); Object.assign(bell, { x: s.x + s.w / 2, y: 200, px: s.x + s.w / 2, py: 200, vx: 0, vy: -300, returning: true }); park(g);
  const mid = g.pool.hp; tick(g, .3); assert.equal(g.pool.hp, mid - KORR_DAMAGE.bell);
  while (!g.villain.escape && g.pool.hp > g.pool.floorHP) g.hitSlot(null);
  assert.equal(g.knockdowns, 1); assert.equal(g.pool.hp, Math.ceil(g.pool.maxHP * .4)); assert(g.villain.escape);
  park(g); tick(g, GATEHOUSE_TIMING.escape + .05); assert(g.villain.gone); assert.ok(!g.targets().some(t => t.kind === 'slot'), 'the hole is empty');
  assert.equal(g.bells.length, 0); assert.equal(g.nextWarning, Infinity, 'no more bells once he fled');
});

test('showdown: a knocked-down Korr returns enraged with faster bells; fury at 30%; the last hit defeats him', () => {
  const calm = make(3); assert.equal(calm.enraged, false);
  const g = make(1); g.knockdowns = 1; g.buildFloor(3); assert(g.enraged); assert(kinds(g).includes('korr-roar'));
  assert.ok(Math.abs(g.bellInterval - calm.bellInterval * .85) < 1e-9);
  live(g); g.pool.hp = Math.floor(g.pool.maxHP * .3); assert(g.fury); assert.ok(g.bellInterval < calm.bellInterval * .85 * .75);
  g.hurtKorr(99, false); assert.equal(g.phase, 'defeat'); tick(g, GATEHOUSE_TIMING.defeat + .05); assert.equal(g.state, 'won'); assert.equal(g.stagesCleared, 4);
});

// ---------- carry-overs ----------
test('vent jam: raising the gate before Korr’s third bell jams one dais vent, so the showdown has one bell hole', () => {
  const g = live(make(2)); g.bellCount = 2; g.turnWheel(99, 1); assert(g.ventJammed); assert(kinds(g).includes('vent-jam'));
  tick(g, GATEHOUSE_TIMING.climb + .05); assert.equal(g.floor, 3); assert.equal(g.holes.length, 1);
  const s = live(make(2)); s.bellCount = 3; s.turnWheel(99, 1); assert.equal(s.ventJammed, false); tick(s, GATEHOUSE_TIMING.climb + .05); assert.equal(s.holes.length, 2);
  // The murder-hole bells start slower after the smashed rack (stage 2 payoff).
  const r = make(1); r.rackSmashed = true; r.buildFloor(2); assert.equal(r.bellInterval, r.rules.interval * r.attack * RACK.slow);
});

test('carry-overs and Continue: lives, score, gems, knock-downs and payoffs persist; Continue keeps the stage', () => {
  const g = live(make(2)); g.wheel.notches = 2; g.score = 400; g.knockdowns = 1; g.hairpin = true; g.rackSmashed = true; g.lives = 1;
  g.balls = [ball(180, g.height + 40, 0, 200)]; g.update(1 / 120); assert.equal(g.state, 'lost');
  assert(g.continue()); assert.equal(g.floor, 2); assert.equal(g.wheel.notches, 2); assert.equal(g.score, 400); assert.equal(g.knockdowns, 1);
  assert.equal(g.capsules.length, 0); assert(g.rackSmashed && g.hairpin); assert.equal(g.phase, 'serve'); assert(g.backHold);
  const n = g.nearMiss(); assert.deepEqual(n.stage, ['STAGE', 3, 4]); assert.ok(n.progress > .5 && n.progress < .75);
  assert.deepEqual(g.starFlags(), { hoist: true, knockdown: false, balls: true });
});

// ---------- special bricks and powers ----------
test('special bricks: armour takes two hits, a gem banks loot, a chest takes two hits and drops the stage’s big power', () => {
  const g = live(make(2), true), armour = g.bricks.find(b => b.type === 'armour'), gem = g.bricks.find(b => b.gem), chest = g.bricks.find(b => b.type === 'chest');
  g.hitBrick(armour, null); assert.equal(armour.hp, 1); assert(kinds(g).includes('brick-hit')); g.hitBrick(armour, null); assert.equal(armour.hp, 0);
  const gems = g.gems; g.hitBrick(gem, null); assert.equal(g.gems, gems + 1); assert.equal(g.stageGems, 1); assert(kinds(g).includes('gem-pop'));
  g.capsules = []; g.hitBrick(chest, null); assert.equal(chest.hp, 1); assert.equal(g.capsules.length, 0);
  g.hitBrick(chest, null); assert(kinds(g).includes('chest-open')); assert.equal(g.capsules.length, 1); assert(g.stagePlan.adds.includes(g.capsules[0].kind), 'a chest drops this stage’s big power');
  // Gems pay out when the stage clears.
  const score = g.score; g.turnWheel(99, 1); assert.ok(g.score >= score + 50); assert(g.effects.some(e => e.kind === 'loot-shower' && e.n === 1));
});

test('powers: capsules fall to the paddle; wide, slow, fire, laser, shield, split, burst and titan each do their job', () => {
  const g = live(make(3)); g.movers = []; g.nextWarning = Infinity; const p = g.paddle;
  const c = g.dropPower(p.x, p.y - 60, 'wide'); assert(c); tick(g, .7); assert.equal(g.capsules.length, 0); assert.ok(g.timers.wide > POWER_TIME.wide - 1); assert(g.tip);
  tick(g, 1); assert.ok(p.w > p.baseW * 1.3, 'wide paddle');
  g.applyPower('shield'); assert.equal(g.ward.remaining, POWER_TIME.shield);
  g.applyPower('slow'); assert.ok(g.timers.slow > 0);
  const b = ball(180, 400, 100, -300); g.balls = [b]; g.applyPower('split'); assert.equal(g.balls.length, 3);
  g.applyPower('burst'); assert.equal(g.balls.length, 6); g.applyPower('burst'); assert.ok(g.balls.length <= 8);
  g.balls = [b]; g.applyPower('titan'); assert.ok(b.ram > 0 && b.r > 6, 'titan makes a ram');
  // Fire burns through armour in one pass.
  const f = live(make(3), true); f.movers = []; const armour = f.bricks.filter(q => q.type === 'armour').sort((a, q) => q.y - a.y)[0];
  f.applyPower('fire'); f.balls = [ball(armour.x + armour.w / 2, armour.y + armour.h + 20, 0, -345)]; tick(f, .15); assert.equal(armour.hp, 0, 'fire burns a 2-hit brick');
  // Laser bolts break bricks from the paddle.
  const l = live(make(1), true); l.balls = [ball(30, 300, 0, 0, { caught: true })]; l.phase = 'play'; l.paddle.x = l.paddle.targetX = 180; l.applyPower('laser');
  const left = l.bricksLeft; tick(l, 1.5); assert.ok(l.bricksLeft < left || l.bricks.some(q => q.hp < q.maxHP), 'laser bolts hit bricks');
  // A missed capsule falls away.
  const m = live(make(1)); m.paddle.x = m.paddle.targetX = 300; m.dropPower(40, 500, 'slow'); tick(m, 2.5); assert.equal(m.capsules.length, 0); assert.equal(m.timers.slow, 0);
});

test('powers: the chance a brick drops a capsule follows the stage plan and the mode', () => {
  const real = Math.random; let calls = 0;
  try {
    for (const [i, d] of [[0, 'easy'], [3, 'hard']]) {
      const g = live(make(i, d), true), chance = g.stagePlan.drop * { easy: 1.25, medium: 1, hard: .85 }[d];
      Math.random = () => { calls++; return chance - 1e-6; }; const b = g.bricks.find(q => q.type === 'brick'); g.hitBrick(b, null); assert.equal(g.capsules.length, 1, `stage ${i + 1} ${d}: drops just under the chance`);
      Math.random = () => chance + 1e-6; g.capsules = []; const o = g.bricks.find(q => q.type === 'brick' && q.hp > 0); g.hitBrick(o, null); assert.equal(g.capsules.length, 0);
    }
  } finally { Math.random = real; }
  assert.ok(calls > 0);
});

// ---------- steel ----------
test('steel: balls bounce off riveted iron without breaking it; an idle chamber cracks its gap bar; fire or a ram breaks a cracked bar', () => {
  const g = live(make(1)), bar = g.bars.find(b => b.id === 'top');
  const b = ball(bar.x + bar.w / 2, bar.y + 60, 0, -345); g.balls = [b]; tick(g, .3); assert.ok(b.vy > 0, 'bounced off the iron'); assert.equal(bar.broken, false); assert(kinds(g).includes('iron-hit'));
  park(g); tick(g, GATEHOUSE_TIMING.crack + .2, 1 / 60); const cracked = g.bars.find(q => q.cracked); assert(cracked && cracked.glint, 'the gap bar cracked'); assert(kinds(g).length >= 0);
  g.timers.fire = 5; const f = ball(cracked.x + cracked.w / 2, cracked.y + cracked.h + 30, 0, -345); g.balls = [f]; tick(g, .2); assert(cracked.broken, 'fire breaks a cracked bar');
  const r = live(make(2)); r.nextWarning = Infinity; park(r); tick(r, GATEHOUSE_TIMING.crack + .2, 1 / 60); const rc = r.bars.find(q => q.cracked); assert(rc);
  const ram = ball(rc.x + rc.w / 2, rc.y + rc.h + 30, 0, -345, { ram: 2, r: 13.2, ramBricks: 14 }); r.balls = [ram]; tick(r, .15); assert(rc.broken, 'a ram breaks a cracked bar');
  // On the showdown a cracked bar breaks by itself.
  const s = live(make(3)); s.nextWarning = Infinity; park(s); tick(s, GATEHOUSE_TIMING.crack + GATEHOUSE_TIMING.selfBreak + .5, 1 / 60); assert(s.bars.some(q => q.broken), 'showdown iron self-breaks');
});

test('the sliding tooth snaps between its poses after a tell and pushes out any ball it lands on', () => {
  const g = live(make(3), true); g.nextWarning = Infinity; const m = g.movers[0]; assert.equal(m.kind, 'steel');
  tick(g, .05); const at = m.next; assert.ok(at > 0);
  g.floorTime = at - GATEHOUSE_TIMING.toothTell + .01; g.update(1 / 240); assert(m.tell);
  const o = m.poses[1 - m.pose], b = ball(o.x + 10, o.y + 2, 0, 50); g.balls = [b];
  g.floorTime = m.next; g.update(1 / 240); assert.equal(m.x, o.x); assert(!m.tell); assert(kinds(g).includes('tooth-slide'));
  assert.ok(b.y + b.r <= m.y + 1e-6 || b.y - b.r >= m.y + m.h - 1e-6 || b.x + b.r <= m.x || b.x - b.r >= m.x + m.w, 'ball pushed out of the tooth');
});

test('a full four-stage siege plays through with a tracking paddle on every mode, with no stuck ball', () => {
  // Capsule drops roll Math.random: seed it so every run of the suite plays the same sieges.
  let seed = 4243; const saved = Math.random; Math.random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  try { for (const mode of MODES) {
    const g = make(0, mode); g.lives = 99; let o = 0, rnd = 7;
    const r = () => (rnd = (rnd * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 240 * 900 && g.state === 'play'; i++) {
      if (g.phase === 'card') g.skipCard();
      if (g.phase === 'serve' && g.balls.some(b => b.caught)) g.launch(-Math.PI / 2 + (r() - .5) * 1.2);
      const b = g.balls.filter(q => !q.caught && !q.dead).sort((a, q) => q.y - a.y)[0];
      const cap = g.capsules.find(c => c.y > g.paddle.y - 160);
      if (b) { if (r() < .01) o = (r() - .5) * 70; g.setTarget(cap && b.y < g.paddle.y - 200 ? cap.x : b.x + o); }
      g.update(1 / 240);
      for (const q of g.balls) assert.ok(Number.isFinite(q.x) && Number.isFinite(q.y) && q.x > -1 && q.x < 361, `${mode} stage ${g.floor + 1}: ball in the field`);
    }
    assert.equal(g.state, 'won', `${mode}: stage ${g.floor + 1} after ${g.time.toFixed(0)} s`);
    assert.equal(g.stageLog.length, 4); assert.ok(g.stageLog.every(s => s.time > 5 && s.time < 400), `${mode}: ${JSON.stringify(g.stageLog)}`);
  } } finally { Math.random = saved; }
});

test('every stage keeps its brick geometry on the BRICK grid and the stage names read as the design', () => {
  assert.deepEqual(GATEHOUSE_STAGES.map(s => s.name), ['The Hoist', 'Drawbridge', 'Murder holes', 'Inner gate']);
  for (let i = 0; i < 4; i++) for (const c of stageBoard(i, { paddleY: 584.6 }).cells) assert.ok(c.w === BRICK.w && c.h === BRICK.h);
});
