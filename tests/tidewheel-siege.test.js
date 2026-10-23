import { test } from 'node:test';
import assert from 'node:assert/strict';

globalThis.Image = class { complete = true; naturalWidth = 256; naturalHeight = 256; width = 256; height = 256; decode() { return Promise.resolve(); } };
globalThis.document = { createElement: () => ({ getContext: () => ctx(), width: 0, height: 0 }) };
globalThis.Path2D = class { moveTo() {} lineTo() {} quadraticCurveTo() {} };
const ctx = () => { const f = new Proxy(function () {}, { get: (_, k) => k === 'addColorStop' ? () => {} : f, apply: () => f, set: () => true }); return f; };

const { TidewheelSiege, SIEGE_TIMING, SPOKE_PERIOD, FLOOD_CLOCK, MINE, PLATE_BOLTS, REGROW } = await import('../src/fantasy/tidewheel-siege.js');
const { STAGES, STAGE_COUNT, stageBoard, judgeStage, reachCases, REACH_RULES } = await import('../src/fantasy/tidewheel-stages.js');
const { chamberReach } = await import('../src/fantasy/reach.js');
const { chapterKind } = await import('../src/fantasy/stages.js');
const { FantasyChapter } = await import('../src/fantasy/chapter.js');
const { overlapsTarget } = await import('../src/carrier-physics.js');

const PHONES = { ios: { height: 700, paddleY: 584.6 }, android: { height: 751, paddleY: 641 } };
const MODES = ['easy', 'medium', 'hard'];
const make = (stage = 0, difficulty = 'medium', phone = PHONES.ios) => new TidewheelSiege({ width: 360, ...phone, difficulty, stage });
const run = (m, s, dt = 1 / 120) => { for (let i = 0; i < Math.round(s / dt); i++) m.update(dt); };
const ball = m => m.balls[0];
const required = m => [...m.blocks.filter(b => b.hp > 0 && !b.prize && !b.bonus).map(b => ['block', b]), ...m.bricks.filter(b => b.hp > 0 && !b.prize).map(b => ['raft', b])];
// Break every required brick of the stage through the model's own hit path (the last one triggers the clear).
function finish(m) { for (const [kind, b] of required(m)) { b.hp = 1; kind === 'block' ? m.hitBlock(b, ball(m)) : m.hitRaftBrick(b, ball(m)); } }
const nerraTarget = { kind: 'shell', id: 'shell' };
function strike(m, n) { const v = m.villain; for (let i = 0; i < n && !m.pool.down && !m.pool.defeated; i++) { v.ghost = false; v.hidden = false; m.cine = null; ball(m).spent = false; m.hitNerra(nerraTarget, ball(m)); } }
// A plain tracking paddle that re-serves: enough to keep a stage running.
function track(m, s, each) { for (let i = 0; i < Math.round(s * 240); i++) { if (m.phase === 'serve' && m.balls.some(b => b.caught)) m.launch(); const b = m.balls.find(b => !b.caught && !b.dead); if (b) m.setTarget(b.x); m.update(1 / 240); if (each?.()) return true; } return false; }

// ---------- the boards ----------
test('every Tidewheel stage layout passes the chamber reach check on both phones in every mode', () => {
  for (const [name, phone] of Object.entries(PHONES)) for (const difficulty of MODES) for (let i = 0; i < STAGE_COUNT; i++) {
    const verdicts = judgeStage(i, { paddleY: phone.paddleY, difficulty });
    if (i > 0) assert.ok(verdicts.length > 0, `stage ${i + 1} has steel chambers`);
    for (const v of verdicts) assert.ok(v.pass, `${name} ${difficulty} stage ${i + 1} ${v.chamber} (lift ${v.lift}): reachable ${v.reachable}, span ${v.span}, gap ${v.gap}`);
  }
});

test('the reach check fails a chamber that is sealed or only reachable through a narrow slot', () => {
  const field = { left: 12, right: 348, top: 67 }, from = [{ x: 180, y: 570 }];
  const box = { x: 150, y: 150, w: 60, h: 40 }, sealed = [{ x: 140, y: 140, w: 80, h: 7 }, { x: 140, y: 190, w: 80, h: 7 }, { x: 140, y: 140, w: 7, h: 57 }, { x: 213, y: 140, w: 7, h: 57 }];
  assert.equal(chamberReach({ field, bars: sealed, chamber: box, from, bounces: REACH_RULES.bounces }).reachable, false);
  const slot = [{ x: 140, y: 140, w: 80, h: 7 }, { x: 140, y: 140, w: 7, h: 57 }, { x: 213, y: 140, w: 7, h: 57 }, { x: 140, y: 190, w: 34, h: 7 }, { x: 186, y: 190, w: 34, h: 7 }];
  const r = chamberReach({ field, bars: slot, chamber: box, from, bounces: REACH_RULES.bounces });
  assert.ok(!r.reachable || r.span < REACH_RULES.minSpan, 'a 12u slot is not a fair gap');
});

test('the boards escalate: more bricks, more 2-hit bricks and more steel each stage; harder modes carry more', () => {
  const count = (i, d) => { const B = stageBoard(i, { paddleY: 584.6, difficulty: d }), all = [...B.blocks, ...B.rafts.flatMap(r => r.cells)];
    return { bricks: all.length, twoHit: all.filter(c => c.hp > 1).length, steel: B.bars.length + B.spokes.length + B.rafts.reduce((n, r) => n + r.steel.length, 0) }; };
  for (const d of MODES) for (let i = 1; i < STAGE_COUNT; i++) {
    const a = count(i - 1, d), b = count(i, d);
    assert.ok(b.bricks >= a.bricks && b.twoHit >= a.twoHit, `${d} stage ${i + 1}: ${JSON.stringify(a)} -> ${JSON.stringify(b)}`);
    assert.ok(b.steel > 0 || i === 0);
  }
  for (let i = 0; i < STAGE_COUNT; i++) {
    const [e, m, h] = MODES.map(d => count(i, d));
    assert.ok(e.bricks <= m.bricks && m.bricks <= h.bricks && e.twoHit <= m.twoHit && m.twoHit <= h.twoHit, `stage ${i + 1} scales with difficulty`);
  }
  assert.equal(count(0, 'medium').steel, 0, 'Low Tide teaches the tide with no steel');
  assert.equal(chapterKind(STAGE_COUNT), 'Siege');
});

test('steel bars are unbreakable bounce targets until a chamber cracks', () => {
  const m = make(1); m.skipCard();
  const steel = m.targets(0).filter(t => t.steel);
  assert.ok(steel.length >= 6 && steel.every(t => !t.kind), 'board bars carry no kind: they only bounce');
  const bar = m.bars.find(b => b.id === 'floorL'); bar.cracked = true;
  const t = m.targets(0).find(t => t.id === 'floorL'); assert.equal(t.kind, 'bar');
  const b = ball(m); m.hitBar(t, b); assert.ok(!bar.broken, 'an ordinary ball only knocks');
  b.fire = 1; m.hitBar(t, b); assert.ok(bar.broken, 'fire breaks a cracked bar');
});

// ---------- the stage flow ----------
test('each stage opens on a skippable 1.2 s card naming the stage and its stake', () => {
  assert.equal(SIEGE_TIMING.card, 1.2);
  const m = make(0); assert.equal(m.phase, 'card'); assert.equal(m.stageLabel, 'STAGE 1 OF 4');
  assert.equal(m.launch(), false, 'no serve under the card');
  run(m, 1.25); assert.notEqual(m.phase, 'card');
  const n = make(2); assert.ok(n.skipCard()); assert.notEqual(n.phase, 'card'); assert.equal(n.skipCard(), false);
  assert.deepEqual(STAGES.map(s => s.name), ['Low Tide', 'Floodworks', 'The Wheel', 'The Refuge']);
  for (const s of STAGES) assert.ok(s.stake.length > 10 && s.stake.length < 60, s.stake);
});

test('clearing a stage banks it, shows the clear banner and builds the next stage', () => {
  const m = make(0); m.skipCard(); m.launch();
  finish(m); assert.equal(m.phase, 'clear'); assert.equal(m.stagesCleared, 1); assert.equal(m.banner.text, 'STAGE CLEAR');
  run(m, SIEGE_TIMING.clear + .05); assert.equal(m.stage, 1); assert.equal(m.phase, 'card'); assert.equal(m.stageLabel, 'STAGE 2 OF 4');
  assert.equal(m.stageLog.length, 1); assert.ok(m.stageLog[0].time >= 0);
});

test('stage 1 hook: Nerra scuttles in, snaps the refuge chain (Lumi drops a notch), walks off and jumps into the surf', () => {
  const m = make(0), y0 = m.lumi.baseY; m.skipCard();
  assert.equal(m.villain.ghost, true, 'she never blocks the ball in the hook');
  let snap = null; for (let i = 0; i < 360 && !snap; i++) { m.update(1 / 120); snap = m.effects.find(e => e.kind === 'chain-snap'); }
  assert.ok(snap, 'the chain snaps on screen'); run(m, .5); assert.ok(m.snapped); assert.equal(m.lumi.baseY, y0 + SIEGE_TIMING.notch);
  run(m, 4); assert.ok(m.villain.hidden, 'gone into the surf'); assert.ok(m.nerraGone);
  assert.ok(m.targets(0).every(t => t.kind !== 'shell' && t.kind !== 'claw'));
});

test('stage 2: Nerra peeks from the walls, mirrored on the left; the build cap knocks her down at 85%', () => {
  const m = make(1); m.skipCard(); m.launch();
  let peeked = null; track(m, 30, () => { if (m.peek.state === 'look') peeked = { side: m.peek.side, facing: m.villain.facing, x: m.villain.footX }; return peeked; });
  assert.ok(peeked, 'a peek comes'); assert.equal(peeked.facing, peeked.side < 0 ? -1 : 1);
  assert.ok(peeked.side < 0 ? peeked.x < 0 : peeked.x > 360, 'her feet stay off the board; only the claws and shell reach in');
  const before = m.pool.hp; strike(m, 40);
  assert.equal(m.pool.hp, Math.ceil(m.pool.maxHP * .85)); assert.ok(before > m.pool.hp);
  assert.equal(m.knockdowns, 1); assert.equal(m.banner.text, 'KNOCKED DOWN!');
  assert.ok(m.capsules.some(c => c.kind === 'chest') && m.capsules.length >= 2, 'a drop and a chest');
  const v = m.villain; v.ghost = v.hidden = false; m.hitNerra(nerraTarget, ball(m)); assert.equal(m.pool.hp, Math.ceil(m.pool.maxHP * .85), 'no damage past the cap');
});

test('stage 3: the clash cap at 40% sends Nerra leaping into the water; her HP carries into the showdown', () => {
  const m = make(2); m.skipCard(); m.launch(); run(m, 2);
  strike(m, 60); const cap = Math.ceil(m.pool.maxHP * .4);
  assert.equal(m.pool.hp, cap); assert.equal(m.cine?.name, 'escape');
  run(m, 2.5); assert.ok(m.villain.hidden);
  finish(m); run(m, SIEGE_TIMING.clear + .05); assert.equal(m.stage, 3);
  assert.equal(m.pool.hp, cap); assert.equal(m.villain.hp, cap);
  assert.ok(m.rules.interval < m.baseRules.interval * (m.board.plan.attack ?? 1) - 1e-9, 'knocked down earlier: she comes back enraged');
});

test('the Wheel clears only with its rows broken and Nerra knocked off the hub; the pits are a bonus run', () => {
  const m = make(2); m.skipCard(); m.launch(); run(m, 2);
  const pits = m.blocks.filter(b => b.bonus && !b.regrow); assert.equal(pits.length, 6); assert.equal(m.blocks.filter(b => b.regrow).length, 10, 'the dome');
  for (const b of pits) b.hp = b.maxHP;
  finish(m); assert.equal(m.requiredLeft(), 0); assert.ok(pits.every(b => b.hp > 0), 'pit bricks are not required'); assert.notEqual(m.phase, 'clear', 'bricks alone do not clear it');
  assert.match(m.nearMiss().line, /^KNOCK NERRA OFF THE WHEEL: \d+ HITS?$/);
  strike(m, 99); assert.ok(m.pool.down); assert.equal(m.phase, 'clear');
});

test('stage 4 is the full fight: Nerra falls only here, with fury at 30%', () => {
  const m = make(3); m.skipCard(); m.launch(); run(m, 2);
  strike(m, Math.ceil(m.pool.maxHP * .71)); run(m, .02); assert.ok(m.fury); assert.equal(m.villain.anger, 3);
  strike(m, m.pool.maxHP); assert.equal(m.phase, 'rescue'); assert.equal(m.pool.hp, 0);
  run(m, 6); assert.equal(m.state, 'won');
});

// ---------- carry-overs ----------
test('every stage 1 pearl banks the stage 4 pearl shield; one missed pearl loses it', () => {
  for (const all of [true, false]) {
    const m = make(0); m.skipCard(); m.launch();
    const pearls = m.blocks.filter(b => b.type === 'pearl'); assert.equal(pearls.length, 3);
    for (const p of all ? pearls : pearls.slice(1)) m.hitBlock(p, ball(m));
    m.buildStage(3); assert.equal(!!m.pearlGuard, all);
  }
  const m = make(2); m.blocks.find(b => b.type === 'pearl').hp = 0; m.broken({ type: 'pearl' }, 0, 0); assert.equal(m.pearls, 0, 'only stage 1 pearls count');
});

test('each sluice valve shut in stage 2 lowers the showdown starting water by a third', () => {
  const start = n => { const m = make(1); m.valvesShut = n; m.buildStage(3); return m.water.y; };
  const w = [0, 1, 2, 3].map(start), step = w[1] - w[0];
  assert.ok(step > 0); assert.ok(Math.abs(w[2] - w[1] - step) < 1e-6 && Math.abs(w[3] - w[2] - step) < 1e-6);
  const m = make(1); assert.equal(w[3], m.water.initial, 'all shut: the showdown starts at low water');
  const valves = m.blocks.filter(b => b.type === 'valve'); assert.equal(valves.length, 2);
  for (const v of valves) { m.hitBlock(v, ball(m)); m.hitBlock(v, ball(m)); } assert.equal(m.valvesShut, 2);
});

test('continue keeps the stage and its progress', () => {
  const m = make(1); m.skipCard(); m.launch();
  const broken = m.blocks.filter(b => !b.prize).slice(0, 3); for (const b of broken) m.hitBlock(b, ball(m)), m.hitBlock(b, ball(m));
  const left = m.requiredLeft(); m.lives = 1; m.loseBall('balls'); assert.equal(m.state, 'lost');
  m.continued = false; assert.ok(m.continue()); assert.equal(m.state, 'play'); assert.equal(m.stage, 1); assert.equal(m.requiredLeft(), left);
});

// ---------- machinery ----------
test('a spoke never swings onto a ball; it swings once the way is clear', () => {
  const m = make(2); m.skipCard(); m.launch();
  const s = m.spokes[0]; s.pose = s.shown = 1; s.next = m.time;
  const q = s.poses[0], b = ball(m); Object.assign(b, { x: q.x + q.w / 2, y: q.y + q.h / 2, px: q.x + q.w / 2, py: q.y + q.h / 2, vx: 0, vy: 0, caught: false });
  m.updateSpokes(0); assert.equal(s.pose, 1, 'held open over the ball');
  Object.assign(b, { x: 180, y: 500 }); m.updateSpokes(0); assert.equal(s.pose, 0);
  assert.ok(overlapsTarget({ x: q.x + 2, y: q.y + 2, r: 1 }, m.targets(0).find(t => t.id === s.id)), 'the shut pose is solid');
  assert.deepEqual(SPOKE_PERIOD.length, 2);
});

test('facing mirrors Nerra about her foot: body circles and claw roots', () => {
  const m = make(1), v = m.villain; m.skipCard();
  Object.assign(v, { hidden: false, ghost: false, footX: 40, footY: 210, x: 40, facing: 1, pose: 'idle', stage: 'idle' }); m.syncAnatomy();
  const right = { body: m.body.circles.map(c => c.x), roots: m.claws.map(c => c.root.x), angles: m.claws.map(c => c.angle) };
  v.facing = -1; m.syncAnatomy();
  assert.deepEqual(m.body.circles.map(c => c.x), right.body.map(x => -x));
  m.claws.forEach((c, i) => { assert.ok(Math.abs(c.root.x - (80 - right.roots[i])) < 1e-9); assert.ok(Math.abs(c.angle + right.angles[i]) < 1e-9); });
  v.facing = 1; m.syncAnatomy(); assert.deepEqual(m.claws.map(c => c.root.x), right.roots, 'and back');
});

test('the pearl shield saves one ball, then is spent', () => {
  const m = make(3); m.pearlGuard = { y: m.paddle.y + 24 }; m.skipCard(); m.launch();
  const b = ball(m); Object.assign(b, { x: 40, y: m.paddle.y + 10, px: 40, py: m.paddle.y + 10, vx: 0, vy: 345 });
  for (let i = 0; i < 40; i++) m.update(1 / 240);
  assert.ok(b.vy < 0, 'bounced'); assert.equal(m.pearlGuard, null); assert.equal(m.lives, 3);
});

// ---------- the chapter ----------
test('the chapter: Siege label in the menu, stage results and stars, every stage and phase draws', () => {
  const l = new FantasyChapter('tidewheel', 360, 814, 393 / 360, 'medium'), m = l.m;
  assert.equal(l.name, 'Tidewheel Citadel'); assert.ok(m.siege);
  for (let i = 0; i < STAGE_COUNT; i++) {
    m.buildStage(i); l.draw(ctx());   // the card
    l.pointerDown(180); l.pointerUp(); assert.notEqual(m.phase, 'card', 'a tap skips the card');
    for (let k = 0; k < 360; k++) { l.update(1 / 120); if (k % 60 === 0) l.draw(ctx()); }
    for (const kind of ['chain-snap', 'refuge-drop', 'nerra-slam', 'nerra-roar', 'nerra-splash', 'tide-surge', 'knockdown', 'pearl', 'valve-turn', 'valve-shut', 'brick-chip', 'bar-knock', 'bar-break', 'spoke-swing', 'capsule', 'bolt-hit', 'pearl-guard', 'mine-fuse', 'mine-blast', 'plate-chip', 'barnacle-grow', 'flood-danger'])
      m.effects.push({ kind, x: 180, y: 200, age: .1, life: .5 });
    for (const colour of ['chest', 'mine', 'steel', 0]) m.effects.push({ kind: 'brick-break', colour, x: 180, y: 200, age: .1, life: .5 });
    m.water.y = m.water.limit + 4; for (const b of m.blocks) if (b.regrow) b.hp = 0; m.bars.filter(b => b.power).forEach(b => { b.hp = 1; });
    m.capsules.push({ id: 1, kind: 'chest', x: 100, y: 300, vy: 0 }, { id: 2, kind: 'titan', x: 140, y: 300, vy: 0 }, { id: 3, kind: 'wide', x: 180, y: 300, vy: 0 });
    m.timers.fire = 2; m.timers.laser = 1; m.bolts.push({ x: 180, y: 400 }); m.pearlGuard = { y: m.paddle.y + 24 }; m.banner = { text: 'STAGE CLEAR', sub: 'X', t: .5, life: 2 }; m.tip = { text: 'tip', t: .5, life: 2 };
    for (const s of m.spokes) s.tell = .5; for (const b of m.bars) b.cracked = true; for (const r of m.rafts) for (const s of r.steel) s.cracked = true;
    m.villain.facing = -1; l.draw(ctx()); m.villain.facing = 1; m.capsules = []; m.bolts = []; m.banner = null;
  }
  m.knockdowns = 2; m.pool.knockdowns.push(1, 2); m.floodMinS4 = m.water.initial; m.state = 'won';
  const r = l.result(); assert.equal(r.stars, 3);
  assert.deepEqual(r.lines.map(x => x[0]), ['Score', 'Stages', 'Knock-downs', 'Flood margin']);
  assert.equal(r.lines[1][1], '4 / 4');
  m.pool.knockdowns = [2]; assert.equal(l.result().stars, 2, 'the knock-down star is the early one (Floodworks)');
  m.floodMinS4 = m.water.limit + 1; assert.equal(l.result().stars, 1);
});

test('reach cases cover every chamber, at both raft heights', () => {
  for (let i = 1; i < STAGE_COUNT; i++) {
    const cases = reachCases(i, { paddleY: 584.6 });
    assert.ok(cases.some(c => c.lift === 0) && cases.some(c => c.lift === 20));
  }
});

// ---------- special bricks, Nerra's shield, the flood clock ----------
test('every board carries the special bricks: sea-mines from stage 1, armour, chests and pearls; Nerra is shielded from stage 2', () => {
  for (const d of MODES) for (let i = 0; i < STAGE_COUNT; i++) {
    const B = stageBoard(i, { paddleY: 584.6, difficulty: d }), all = [...B.blocks, ...B.rafts.flatMap(r => r.cells)];
    assert.ok(all.some(c => c.type === 'mine'), `${d} stage ${i + 1} has a sea-mine`);
    assert.ok(all.filter(c => c.type === 'mine').every(c => c.hp === 1), 'mines are one hit');
    if (i > 0) assert.ok(all.some(c => c.hp > 1), `${d} stage ${i + 1} has armour`);
  }
  // Stage 2-4: Nerra's reach is walled off from the paddle by bricks and plate: no straight shot from the paddle line.
  for (const i of [1, 2, 3]) {
    const box = t => t.type === 'poly' ? (([xs, ys]) => ({ x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) }))([t.points.map(p => p[0]), t.points.map(p => p[1])]) : t;
    const m = make(i), solid = m.targets(0).filter(t => t.type === 'poly' || t.type === 'rect' && (t.kind === 'brick' || t.kind === 'gate' || t.steel)).map(box), hits = [];
    for (let x = 18; x <= 342; x += 6) {   // a vertical shot from the paddle: does it reach y 240 (her feet) unblocked?
      const lane = solid.filter(t => t.x - 6 < x && t.x + t.w + 6 > x && t.y < m.paddle.y);
      if (!lane.some(t => t.y + t.h > 150)) hits.push(x);
    }
    assert.deepEqual(hits, [], `stage ${i + 1}: open straight lanes at x ${hits.join(',')}`);
  }
});

test('a sea-mine blast breaks its neighbours, chains to other mines and hurts Nerra; barnacle plate shrugs it off', () => {
  const m = make(2); m.skipCard(); m.launch(); run(m, 3);
  const mine = m.blocks.find(b => b.type === 'mine' && b.x < 180), cx = mine.x + mine.w / 2, cy = mine.y + mine.h / 2;
  const near = m.blocks.filter(b => b !== mine && b.hp > 0 && Math.hypot(Math.max(b.x, Math.min(cx, b.x + b.w)) - cx, Math.max(b.y, Math.min(cy, b.y + b.h)) - cy) <= MINE.radius);
  assert.ok(near.length >= 2);
  const hp = near.map(b => b.hp), nerra = m.pool.hp;
  m.villain.ghost = false; m.villain.hidden = false; m.cine = null;
  m.hitBlock(mine, ball(m)); assert.equal(mine.hp, 0);
  run(m, SIEGE_TIMING.chain + .02);
  assert.ok(near.every((b, i) => b.hp <= hp[i] - 1), 'each neighbour takes a hit');
  assert.ok(m.effects.some(e => e.kind === 'mine-blast'));
  assert.equal(nerra - m.pool.hp, MINE.nerra, 'she is in the blast');
  assert.ok(!m.bars.find(b => b.id === 'plate').broken, 'the plate needs a big power');
  // Chain: a second mine in range goes off in turn.
  const n = make(0); n.skipCard(); n.launch(); run(n, .1);
  const mines = n.bricks.filter(b => b.type === 'mine' && b.hp > 0); assert.ok(mines.length >= 1);
  const a = n.blocks.find(b => b.type === 'mine'); a.hp = 1; n.blocks.find(b => b.type === 'mine' && b !== a).x = a.x + 30;
  const other = n.blocks.find(b => b.type === 'mine' && b !== a); other.y = a.y;
  n.hitBlock(a, ball(n)); run(n, SIEGE_TIMING.chain * 2 + .03);
  assert.equal(other.hp, 0, 'the neighbouring mine went off'); assert.ok(n.effects.filter(e => e.kind === 'mine-blast').length >= 2);
});

test('barnacle plate: a plain ball knocks, three laser bolts or one fire, titan or ram ball break it', () => {
  const m = make(2); m.skipCard(); const plate = m.bars.find(b => b.power), t = m.targets(0).find(t => t.id === plate.id);
  assert.equal(t.kind, 'bar'); assert.equal(plate.hp, PLATE_BOLTS);
  const b = ball(m); m.hitBar(t, b); assert.ok(!plate.broken);
  for (let i = 0; i < PLATE_BOLTS - 1; i++) m.hitBar(t, { x: 180, y: 250, powerShot: true }); assert.ok(!plate.broken);
  m.hitBar(t, { x: 180, y: 250, powerShot: true }); assert.ok(plate.broken, 'the third bolt breaks it');
  for (const k of ['fire', 'titan', 'ram']) { const n = make(3); n.skipCard(); const p = n.bars.find(b => b.power); n.hitBar({ id: p.id, kind: 'bar' }, { ...ball(n), [k]: 2 }); assert.ok(p.broken, k); }
});

test('chests drop a big power: split, fire, laser or the titan, as far as the stage pool reaches', () => {
  for (const [stage, allowed] of [[0, ['split']], [1, ['split']], [2, ['split', 'fire', 'laser']], [3, ['split', 'fire', 'laser', 'titan']]]) {
    const m = make(stage); const seen = new Set();
    for (let i = 0; i < 60; i++) { m.capsules = []; m.drop(180, 200, true); seen.add(m.capsules[0].kind); }
    assert.ok([...seen].every(k => allowed.includes(k)), `stage ${stage + 1}: ${[...seen]}`);
  }
});

test('barnacle shield grows back once no ball is near, and never holds a stage up', () => {
  const m = make(3); m.skipCard(); m.launch(); run(m, .5);
  const plug = m.blocks.find(b => b.regrow); assert.ok(plug);
  plug.hp = 1; m.hitBlock(plug, ball(m)); assert.equal(plug.hp, 0);
  m.balls[0].x = plug.x + plug.w / 2; m.balls[0].y = plug.y + plug.h + 10; m.balls[0].vx = 0; m.balls[0].vy = 0;   // parked next to it
  m.time += REGROW.medium + 1; m.updateRegrow(); assert.equal(plug.hp, 0, 'not onto a ball');
  m.balls[0].x = 180; m.balls[0].y = m.paddle.y - 40; m.updateRegrow(); assert.equal(plug.hp, plug.maxHP);
  assert.ok(m.effects.some(e => e.kind === 'barnacle-grow'));
  const w = make(2); assert.ok(w.blocks.filter(b => b.regrow).every(b => b.bonus), 'the dome is not required');
});

test('a plain ball hurts Nerra once per return: the paddle re-arms it; laser bolts glance off', () => {
  const m = make(3); m.skipCard(); m.launch(); run(m, 2);
  const v = m.villain; v.ghost = false; v.hidden = false; m.cine = null;
  const b = ball(m), hp = m.pool.hp;
  m.hitNerra(nerraTarget, b); assert.equal(m.pool.hp, hp - 1); assert.ok(b.spent);
  m.hitNerra(nerraTarget, b); assert.equal(m.pool.hp, hp - 1, 'spent until it comes back');
  m.hitNerra(nerraTarget, { x: 180, y: 200, powerShot: true }); assert.equal(m.pool.hp, hp - 1, 'a laser bolt glances off');
  m.hitNerra(nerraTarget, { ...b, titan: 3 }); assert.equal(m.pool.hp, hp - 2, 'the titan is not limited');
  // A paddle bounce re-arms the ball.
  Object.assign(b, { x: m.paddle.x, y: m.paddle.y - 14, vx: 0, vy: 300, caught: false, dead: false });
  run(m, .1); assert.ok(b.vy < 0); assert.equal(b.spent, false);
});

test('the flood is the clock from stage 1: idle water reaches the refuge near FLOOD_CLOCK, with a danger state first', () => {
  for (const i of [0, 1]) {
    const m = make(i); m.skipCard(); m.launch(); const p = m.balls[0];
    let danger = null, t0 = m.time;
    for (let k = 0; k < 240 * 200 && m.state === 'play'; k++) {
      p.x = 180; p.y = 120; p.vx = 0; p.vy = 0; p.caught = false; m.pulses = []; m.lives = 3;   // a ball parked out of the way: nothing pushes the tide back
      m.update(1 / 240); if (m.floodDanger && danger === null) danger = m.time - t0;
    }
    const took = m.time - t0, clock = FLOOD_CLOCK.seconds[i];
    assert.equal(m.loss, 'flood'); assert.ok(took > clock * .8 && took < clock * 1.25, `stage ${i + 1} flooded in ${took.toFixed(1)}s (clock ${clock})`);
    assert.ok(danger !== null && danger < took - 5, 'the danger state shows first');
  }
  const e = make(0, 'easy'), h = make(0, 'hard');
  assert.ok(e.rules.tideRise < make(0).rules.tideRise && make(0).rules.tideRise < h.rules.tideRise, 'the clock scales with difficulty');
});
