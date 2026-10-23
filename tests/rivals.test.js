import test from 'node:test';
import assert from 'node:assert/strict';
import { SerpentRivals, RIVALS_MODES, RIVALS_FLOORS, RIVAL_LUNGE, RIVALS_LAYOUT, RIVALS_TIMING, CAPSULE_KINDS } from '../src/fantasy/rivals.js';
import { RAM } from '../src/fantasy/ram.js';

const STEP = 1 / 240;
const hall = (difficulty = 'medium', floor = 1, height = 729) => {
  const m = new SerpentRivals({ height, difficulty, paddleY: height - 96, floor }); m.launch(-Math.PI / 2); m.nextLunge = Infinity; m.teachClash = false; return m;
};
const park = m => { const b = m.balls[0]; Object.assign(b, { x: 180, y: m.paddle.y - 40, vx: 0, vy: 0, caught: true }); };
const run = (m, until, cap = 6000) => { for (let i = 0; i < cap && !until(); i++) { park(m); m.step(STEP); } };
const win = (m, snake, cross) => m.windows.find(w => w.snake === snake && w.cross === cross);
const kinds = m => m.effects.map(e => e.kind);
const live = (m, x, y, vx, vy) => { const b = m.balls[0]; Object.assign(b, { caught: false, dead: false, x, y, px: x, py: y, vx, vy, r: 6 }); b.contacts.clear(); m.phase = 'play'; return b; };

test('three floors, a dense board with open side lanes, lane mouths and lures beside their windows', () => {
  assert.deepEqual(RIVALS_FLOORS, ['Lure hall', 'The crossing', 'Twin Seal']);
  for (const mode of Object.keys(RIVALS_MODES)) for (const floor of [0, 1, 2]) {
    const m = hall(mode, floor), bricks = m.bricks.filter(b => b.type === 'brick');
    assert(bricks.length >= 55, `floor ${floor}: ${bricks.length} bricks, about twice a Lumi tower floor`);
    for (const b of [...bricks, ...m.lures]) assert(b.x >= 56 && b.x + b.w <= 304, 'both 56u side lanes stay open');
    for (const w of m.windows) {
      const edge = w.side ? RIVALS_LAYOUT.cols - 1 : 0;
      assert(!bricks.some(b => b.row === w.row && b.col === edge), 'each window row keeps its lane mouth open');
      assert(!m.lures.some(l => l.row === w.row), 'no lure sits in a lane');
      assert.equal(w.originX, w.side ? 360 - RIVAL_LUNGE.wall : RIVAL_LUNGE.wall);
    }
    for (const l of m.lures) { assert(m.windows.some(w => w.snake === l.snake && w.row === l.lane && l.row === l.lane - 1), 'lure beside its window'); assert.equal(l.w, 32); assert.equal(l.h, 18); }
    if (floor === 0) { assert(m.windows.every(w => w.snake === 'gnash')); assert.equal(m.shutters.length, 2); assert.equal(m.bricks.filter(b => b.type === 'bar').length, 6); assert.equal(m.seal, null); }
    else {
      assert.deepEqual(m.windows.filter(w => w.cross).map(w => w.snake).sort(), ['gnash', 'mooncoil']);
      const c = m.chamber; assert(c.w > 100 && c.h >= 60, 'the chamber is a roomy pocket');
      for (const b of bricks) assert(!(b.x < c.x + c.w && b.x + b.w > c.x && b.y < c.y + c.h && b.y + b.h > c.y), 'no brick inside the chamber');
      assert.equal(m.seal.hp, floor === 1 ? RIVALS_MODES[mode].seal2 : RIVALS_MODES[mode].seal);
      assert(m.seal.y + m.seal.h + 20 <= Math.min(...bricks.map(b => b.y)), 'the ball can pass between Seal and board');
    }
  }
  assert.throws(() => new SerpentRivals({ height: 600 }), RangeError);
});

test('every lunge starts inside its window, the body never teleports, and the retreat ends back home', () => {
  for (const w0 of hall('medium', 2).windows) {
    const m = hall('medium', 2), w = m.windows.find(q => q.id === w0.id); park(m);
    const l = m.makeLunge(w); m.lunges = [l];
    assert.equal(l.points[0].x, w.originX, 'the head starts at the window centre, inside the recess');
    assert.equal(m.snakeTargets().length, 0, 'nothing collides while the serpent is inside the window');
    let maxStep = 0, maxReach = 0, last = l.points.map(p => ({ ...p }));
    for (let i = 0; i < 4000 && !l.done; i++) {
      park(m); m.advanceLunge(l, STEP);
      l.points.forEach((p, k) => { if (last[k]) maxStep = Math.max(maxStep, Math.hypot(p.x - last[k].x, p.y - last[k].y)); });
      maxReach = Math.max(maxReach, Math.abs(l.points[0].x - w.originX)); last = l.points.map(p => ({ ...p }));
    }
    assert(l.done, 'the lunge finishes');
    assert(maxStep < 4, `${w.id}: no point moved more than ${maxStep.toFixed(2)}u in one step`);
    assert(Math.abs(maxReach - w.reach) < 1, `${w.id} reaches its authored distance`);
    for (const p of last) assert(Math.abs(p.x - w.originX) < 1, 'everything is back in the window');
  }
});

test('a clash freezes, recoils and sways without teleporting, and a dizzy head can fade out early', () => {
  const m = hall('medium', 2); park(m);
  const a = m.makeLunge(win(m, 'gnash', true)), b = m.makeLunge(win(m, 'mooncoil', true)); m.lunges = [a, b];
  let maxStep = 0, last = [a, b].map(l => l.points.map(p => ({ ...p })));
  for (let i = 0; i < 6000 && m.lunges.length; i++) {
    park(m); m.step(STEP);
    [a, b].forEach((l, j) => { l.points.forEach((p, k) => { const q = last[j][k]; if (q) maxStep = Math.max(maxStep, Math.hypot(p.x - q.x, p.y - q.y)); }); last[j] = l.points.map(p => ({ ...p })); });
    if (a.stage === 'dizzy' && a.t > .7 && !a.swayFrom) m.retreat(a, true);   // hurt while swaying: the sway fades, never snaps
  }
  assert.equal(m.clashes, 1); assert(maxStep < 4, `max step ${maxStep.toFixed(2)}u`);
});

test('the clash window: heads that meet within it clash; a late rival finds the chamber empty', () => {
  for (const [delay, expect] of [[0, 1], [RIVALS_MODES.medium.window - .15, 1], [RIVALS_MODES.medium.window + .4, 0]]) {
    const m = hall('medium', 2); park(m);
    const a = m.makeLunge(win(m, 'gnash', true)); m.lunges = [a];
    run(m, () => a.t >= delay - 1e-9 || a.done, Math.round(delay / STEP) + 1);
    const b = m.makeLunge(win(m, 'mooncoil', true)); m.lunges.push(b);
    const ward = m.seal.ward = 3, hp = m.seal.hp;
    run(m, () => !m.lunges.length);
    assert.equal(m.clashes, expect, `delay ${delay}`);
    if (expect) {
      assert.equal(m.seal.ward, 0, 'the clash shatters the ward'); assert.equal(m.seal.hp, hp - RIVALS_MODES.medium.clash);
      assert.equal(m.score, 200); assert(ward > 0);
    } else assert.equal(m.seal.hp, hp);
  }
  // The chamber holds the clash shape: both heads inside, facing each other, then both dizzy for the authored time.
  const m = hall('medium', 2); park(m);
  const a = m.makeLunge(win(m, 'gnash', true)), b = m.makeLunge(win(m, 'mooncoil', true)); m.lunges = [a, b];
  run(m, () => a.stage === 'clash');
  assert.equal(b.stage, 'clash'); assert(m.inChamber(a.head) && m.inChamber(b.head)); assert(a.head.x < b.head.x);
  assert.equal(m.capsules.length, 1); assert(CAPSULE_KINDS.includes(m.capsules[0].kind));
  run(m, () => a.stage === 'dizzy'); const t0 = m.floorTime;
  assert(m.inChamber(a.head) && m.inChamber(b.head), 'dizzy heads sway inside the chamber, where the ball can reach them');
  run(m, () => a.stage === 'retreat'); assert(Math.abs(m.floorTime - t0 - RIVAL_LUNGE.dizzy) < .02);
});

test('striking a lit lure calls its serpent onto the lane after a short tell; a dim lure only deflects', () => {
  const m = hall('medium', 2), lure = m.lures.find(l => l.snake === 'mooncoil');
  m.step(STEP); assert(lure.lit, 'the lure glows while Mooncoil is home');
  const b = live(m, lure.x + lure.w / 2, lure.y + lure.h + 12, 0, -345);
  for (let i = 0; i < 60 && !m.lunges.length; i++) m.step(STEP);
  const l = m.lunges[0]; assert(l, 'the lure called a lunge'); assert.equal(l.snake, 'mooncoil'); assert(l.lured); assert(l.win.cross);
  assert.equal(l.peek, RIVAL_LUNGE.lurePeek); assert.equal(l.tell, RIVALS_MODES.medium.lureTell); assert(kinds(m).includes('lure-call'));
  assert(b.vy > 0, 'the ball rebounds off the rune stone'); assert.equal(lure.lit, false);
  const before = m.lunges.length; assert.equal(m.strikeLure(lure), false); assert.equal(m.lunges.length, before, 'a dim lure calls nobody');
  // The lured lunge still warns: its hiss carries a bite-warning before the strike.
  run(m, () => l.stage === 'hiss'); assert(m.effects.some(e => e.kind === 'bite-warning' && e.snake === 'mooncoil' && e.cross));
});

test('baiting: lure the rival while the first serpent hisses on the Crossing and they clash', () => {
  const m = hall('medium', 2); park(m);
  const a = m.makeLunge(win(m, 'gnash', true)); m.lunges = [a];
  run(m, () => a.stage === 'hiss' && a.t > .3);
  assert(m.strikeLure(m.lures.find(l => l.snake === 'mooncoil')));
  run(m, () => m.clashes > 0 || !m.lunges.length);
  assert.equal(m.clashes, 1);
});

test('scheduled lunges never send both serpents onto the Crossing, so every clash is the player’s doing', () => {
  for (const mode of ['easy', 'medium', 'hard']) {
    const m = hall(mode, 2); m.nextLunge = 1; let both = 0, lunges = 0, ids = new Set();
    for (let i = 0; i < 240 * 120; i++) {
      park(m); m.step(STEP);
      for (const l of m.lunges) ids.add(l.id);
      if (m.lunges.filter(l => l.win.cross).length > 1) both++;
      assert(m.lunges.length <= RIVALS_MODES[mode].chain, 'the chain cap holds');
    }
    lunges = ids.size;
    assert.equal(both, 0); assert.equal(m.clashes, 0); assert(lunges >= .75 * 120 / RIVALS_MODES[mode].interval, `${mode}: ${lunges} lunges`);
  }
});

test('the bite eats only ordinary bricks on its own row, quietly, and each meal feeds the Seal ward up to its cap', () => {
  for (const [snake, cross] of [['gnash', false], ['mooncoil', false], ['gnash', true], ['mooncoil', true]]) {
    const m = hall('medium', 2); park(m); const w = win(m, snake, cross), score = m.score, bank = m.chargeBank;
    const lures = m.lures.map(l => ({ ...l }));
    m.lunges = [m.makeLunge(w)]; run(m, () => !m.lunges.length);
    const eaten = m.bricks.filter(b => b.hp === 0);
    assert(eaten.length >= (cross ? 1 : 5), `${snake} ${cross ? 'crossing' : 'home'} bite clears its row (${eaten.length})`);
    for (const b of eaten) assert.equal(b.row, w.row, 'only its own row');
    if (cross) for (const b of eaten) assert(w.side ? b.x > 180 : b.x < 180, 'a crossing bite stays on its own half');
    assert.equal(m.score, score); assert.equal(m.chargeBank, bank); assert.equal(m.lures.length, lures.length);
    assert.equal(m.seal.ward, Math.min(eaten.length, RIVALS_MODES.medium.wardCap));
    assert(!kinds(m).includes('brick-break'), 'eaten bricks vanish as chomps, not breaks');
  }
});

test('Seal progress: ball hits strip ward first, ram hits for three, dizzy heads and clashes hit hard', () => {
  const m = hall('medium', 2), s = m.seal; s.ward = 2;
  const hp = s.hp, hit = () => { const b = live(m, 180, s.y + s.h + 20, 0, -345); for (let i = 0; i < 40 && b.vy < 0; i++) m.step(STEP); return b; };
  hit(); assert.equal(s.ward, 1); assert.equal(s.hp, hp); hit(); assert.equal(s.ward, 0); hit(); assert.equal(s.hp, hp - 1);
  const b = m.balls[0]; Object.assign(b, { ram: 1, ramBricks: 5, r: RAM.r }); m.balls = [b]; const h2 = s.hp;
  Object.assign(b, { x: 180, y: s.y + s.h + 30, vx: 0, vy: -345 }); b.contacts.clear(); for (let i = 0; i < 40 && b.vy < 0; i++) m.step(STEP);
  assert.equal(s.hp, h2 - RAM.damage);
  // A dizzy head is bound to the Seal: one ball hit deals dizzyHit straight through the ward.
  park(m); const a = m.makeLunge(win(m, 'gnash', true)), c = m.makeLunge(win(m, 'mooncoil', true)); m.lunges = [a, c];
  run(m, () => a.stage === 'dizzy'); s.ward = 3; const h3 = s.hp;
  const head = a.points[0], ball = live(m, head.x, head.y + 34, 0, -345);
  for (let i = 0; i < 60 && a.stage === 'dizzy'; i++) m.step(STEP);
  assert.equal(a.stage, 'retreat'); assert.equal(a.mood, 'ouch'); assert.equal(s.hp, h3 - RIVALS_MODES.medium.dizzyHit); assert.equal(s.ward, 3);
  assert(ball.vy > 0, 'the ball rebounds off the dizzy head');
});

test('a striking jaw swallows the ball on Medium, spits it back on Easy (serve resumes), and a teaching lunge is harmless', () => {
  for (const [mode, teaching, lives] of [['medium', false, 2], ['easy', false, 3], ['medium', true, 3]]) {
    const m = hall(mode, 2), w = win(m, 'gnash', false), l = m.makeLunge(w, { teaching }); m.lunges = [l];
    run(m, () => l.stage === 'strike');
    const b = live(m, 200, w.y, 0, -1);
    for (let i = 0; i < 200 && l.stage === 'strike' && !b.dead; i++) { if (!b.dead) { b.vx = 0; b.vy = -1; } m.step(STEP); }
    for (let i = 0; i < 2400 && !(m.phase === 'play' && m.balls.some(q => !q.caught)); i++) m.step(STEP);
    assert.equal(m.lives, lives, `${mode} teaching=${teaching}`); assert.equal(m.bites, teaching ? 0 : 1);
    assert(m.balls.some(q => !q.caught && !q.dead), 'play resumes with a live ball');
  }
});

test('a head emerging onto a ball ejects it: the ball never ends a step inside a serpent', () => {
  for (const side of [0, 1]) for (const dy of [-10, 0, 10]) {
    const m = hall('medium', 2), w = m.windows.find(q => q.side === side && !q.cross); park(m);
    const l = m.makeLunge(w); m.lunges = [l];
    const x = side ? 360 - 46 : 46, b = live(m, x, w.y + dy, side ? -40 : 40, -345);
    for (let i = 0; i < 600 && l.stage !== 'strike' && !b.dead; i++) {
      b.vx = side ? -40 : 40; b.vy = (i % 2 ? 1 : -1) * 345; b.y = w.y + dy; m.step(STEP);
      for (const s of m.snakeTargets()) assert(Math.hypot(b.x - s.b.x, b.y - s.b.y) >= b.r + s.r - .5, `side ${side} dy ${dy}: inside a body circle`);
    }
  }
});

test('Kit’s powers: Ward catches a falling ball, Arrows break bricks, call lures and chip the Seal', () => {
  const m = hall('medium', 2); m.charge = 100;
  assert(m.canActivate('ward')); assert(m.activate('ward')); assert(m.ward); assert.equal(m.charge, 0); assert.equal(m.canActivate('ward'), false);
  const b = live(m, 40, m.paddle.y + 4, 0, 345); m.paddle.x = m.paddle.targetX = 300;
  for (let i = 0; i < 60; i++) m.step(STEP); assert(b.vy < 0 && !b.dead, 'the ward bounces the ball back up');
  m.charge = 100; assert(m.activate('volley')); park(m); m.paddle.x = m.paddle.targetX = 180;
  const bricks = m.bricks.filter(q => q.hp > 0).length;
  for (let i = 0; i < 240 * 3; i++) { m.balls[0].caught = true; m.step(STEP); }
  assert.equal(m.volley, null); assert(m.bricks.filter(q => q.hp > 0).length < bricks, 'arrows break bricks');
  // An arrow stops on the first thing above it: a lit lure calls its serpent, the Seal loses ward or HP.
  m.lunges = []; m.updateLures(); const lure = m.lures[0]; assert(lure.lit);
  m.volley = { time: 1, remaining: 0, next: 1 }; m.shots = [{ id: 1, x: lure.x + 16, y: lure.y + 30, vy: -640, dead: false }];
  for (let i = 0; i < 20; i++) { m.balls[0].caught = true; m.step(STEP); } assert.equal(m.lunges[0]?.snake, lure.snake);
  const hp = m.seal.hp; m.seal.ward = 0; m.shots = [{ id: 2, x: 180, y: m.seal.y + m.seal.h + 8, vy: -640, dead: false }];
  for (let i = 0; i < 20; i++) { m.balls[0].caught = true; m.step(STEP); } assert.equal(m.seal.hp, hp - 1);
  // Capsules: wide, ram and multi.
  for (const kind of CAPSULE_KINDS) m.collect(kind);
  assert.equal(m.paddle.w, 140); assert(m.paddle.armed); assert(m.balls.length >= 2);
});

test('floors climb in order: hatch bars, the Crossing seal after a harmless teaching clash, then the Twin Seal', () => {
  const m = new SerpentRivals({ height: 729, difficulty: 'hard', paddleY: 633 }); m.launch();
  assert.equal(m.floor, 0); assert.equal(m.chamber, null);
  for (const b of m.bricks.filter(b => b.type === 'bar')) { assert.equal(b.hp, RIVALS_MODES.hard.hatch); while (b.hp > 0) m.hitBrick(b, m.balls[0]); }
  assert.equal(m.phase, 'climb'); for (let i = 0; i < 400; i++) m.step(STEP);
  assert.equal(m.floor, 1); assert(m.teachClash); assert.equal(m.seal.hp, RIVALS_MODES.hard.seal2);
  // Floor 2 opens with both serpents on the Crossing, harmless: the clash is shown, but pays nothing.
  m.launch(); for (let i = 0; i < 240 * 10 && !m.effects.some(e => e.kind === 'clash'); i++) { park(m); m.step(STEP); }
  const fx = m.effects.find(e => e.kind === 'clash'); assert(fx && fx.teaching); assert.equal(m.clashes, 0); assert.equal(m.capsules.length, 0); assert.equal(m.seal.hp, RIVALS_MODES.hard.seal2);
  assert(m.floorTime >= RIVALS_TIMING.teachClash);
  m.damageSeal(99, 'clash'); assert.equal(m.phase, 'climb'); for (let i = 0; i < 400; i++) m.step(STEP);
  assert.equal(m.floor, 2); assert.equal(m.seal.hp, RIVALS_MODES.hard.seal); assert.equal(m.teachClash, false);
  m.damageSeal(99, 'clash'); assert.equal(m.phase, 'shatter'); assert(kinds(m).includes('seal-shatter'));
  for (let i = 0; i < 240 * 3 && m.state === 'play'; i++) m.step(STEP);
  assert.equal(m.state, 'won');
});

test('the first Gnash lunge in the Lure hall is a harmless teaching lunge', () => {
  const m = new SerpentRivals({ height: 729, difficulty: 'hard', paddleY: 633 }); m.launch();
  run(m, () => m.lunges.length > 0);
  assert(m.lunges[0].teaching); assert.equal(m.lunges[0].snake, 'gnash');
  m.lunges = []; m.nextLunge = m.floorTime; run(m, () => m.lunges.length > 0); assert.equal(m.lunges[0].teaching, false);
});

test('Continue keeps the floor, bricks, Seal and ward, and sends the serpents home', () => {
  const m = hall('medium', 2); m.seal.hp = 7; m.seal.ward = 2; m.bricks[3].hp = 0; m.score = 900;
  m.lunges = [m.makeLunge(m.windows[0])]; m.lose('fixture');
  assert(m.continue()); assert.equal(m.floor, 2); assert.equal(m.seal.hp, 7); assert.equal(m.seal.ward, 2); assert.equal(m.bricks[3].hp, 0);
  assert.equal(m.score, 900); assert.equal(m.lunges.length, 0); assert.equal(m.phase, 'serve'); assert(m.nextLunge >= m.floorTime + 3); assert(m.lives >= 2);
  m.lose('again'); assert.equal(m.continue(), false);
});

// Ordinary public-input bot: predict the landing point, add a seeded aim error, never use powers, lures on purpose or Continue.
const lcg = seed => { let s = seed >>> 0; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 2 ** 32); };
// Where a ball of radius r lands after bouncing between the walls of the 360-wide field.
const fold = (x, r = 7) => { const L = 360 - 2 * r, p = ((x - r) % (2 * L) + 2 * L) % (2 * L); return r + (p > L ? 2 * L - p : p); };
function bot(difficulty, seed, height, paddleY) {
  const previous = Math.random; Math.random = lcg(seed * 7919 + 17);
  try {
    const m = new SerpentRivals({ height, paddleY, difficulty }), r = lcg(seed * 104729 + 3); let aim = 0, was = false;
    for (let n = 0; n < 120 * 400 && m.state === 'play'; n++) {
      if (m.phase === 'serve') m.launch(-Math.PI / 2 + (r() - .5));
      let best = null; for (const b of m.balls) if (!b.caught && b.vy > 0) { const t = (m.paddle.y - b.r - b.y) / b.vy; if (t >= 0 && (!best || t < best.t)) best = { t, b }; }
      if (best && !was) aim = (r() - .5) * .6 * m.paddle.w; was = !!best;
      if (best) m.setTarget(fold(best.b.x + best.b.vx * best.t) + aim);
      m.update(1 / 120);
    }
    return m;
  } finally { Math.random = previous; }
}
// Owner 2026-10-23: levels harder, beatable with the right play. A random-aim bot (no powers) must always clear Easy and
// clear Medium more often than not; with the bigger ball (r 7) it wins 6 of these 10 Medium runs.
test('a seeded ordinary bot clears Easy and usually clears Medium on both phone heights', () => {
  let medium = 0;
  for (const difficulty of ['easy', 'medium']) for (const [height, paddleY] of [[700, 584.6], [751, 641]]) for (const seed of [1, 2, 3, 4, 5]) {
    const m = bot(difficulty, seed, height, paddleY);
    if (difficulty === 'medium') { medium += m.state === 'won'; continue; }
    assert.equal(m.state, 'won', `${difficulty} ${height} seed ${seed}: ${m.state} on floor ${m.floor}, seal ${m.seal?.hp}`);
    assert(m.time > 60 && m.time < 400, `${difficulty}: ${m.time.toFixed(0)} s`);
  }
  assert(medium >= 6, `Medium wins ${medium} of 10`);
});
