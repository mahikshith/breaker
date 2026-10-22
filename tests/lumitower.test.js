import test from 'node:test';
import assert from 'node:assert/strict';
import { LumiTower, LUNGE, LUMI_MODES } from '../src/fantasy/lumitower.js';

const tower = (difficulty = 'medium', floor = 1, height = 729) => {
  const m = new LumiTower({ height, difficulty, paddleY: height - 96, floor }); m.launch(-Math.PI / 2); return m;
};
const park = m => { const b = m.balls[0]; b.x = 180; b.y = m.paddle.y - 40; b.vx = 0; b.vy = 0; b.caught = true; };
const runLunge = (m, until, dt = 1 / 240, cap = 4000) => { for (let i = 0; i < cap && !until(); i++) { park(m); m.step(dt); } };

test('every lunge starts inside its window recess and the head moves continuously', () => {
  for (const side of [0, 1]) {
    const m = tower(); park(m); const win = m.windows.find(w => w.side === side);
    const l = m.makeLunge(win); m.lunges = [l]; m.nextLunge = Infinity;
    assert.equal(l.points[0].x, win.originX, 'the head starts at the window centre, inside the recess');
    assert.equal(m.snakeTargets().length, 0, 'nothing collides while the serpent is still inside the window');
    let last = l.points[0].x, maxStep = 0, maxReach = 0;
    runLunge(m, () => !m.lunges.length, 1 / 240);
    for (let i = 0, k = m.makeLunge(win); i < 2000 && !k.done; i++) {
      m.lunges = [k]; park(m); m.advanceLunge(k, 1 / 240);
      const x = k.points[0]?.x ?? win.originX; maxStep = Math.max(maxStep, Math.abs(x - last)); last = x;
      maxReach = Math.max(maxReach, side ? win.originX - x : x - win.originX);
    }
    assert(maxStep < 4, `no teleport: head moved at most ${maxStep.toFixed(2)}u in one 1/240 s step`);
    assert(Math.abs(maxReach - LUNGE.reach) < 1, 'the strike reaches its authored distance');
    assert.equal(Math.round(last), Math.round(win.originX), 'the retreat ends back at the origin');
  }
});

test('body segments trail along the window row and only parts outside the wall collide', () => {
  const m = tower(); park(m); const win = m.windows[0], l = m.makeLunge(win); m.lunges = [l]; m.nextLunge = Infinity;
  runLunge(m, () => l.stage === 'chew');
  for (const p of l.points) assert(Math.abs(p.y - win.y) <= 5.01, 'segments stay on the bite row');
  for (const s of m.snakeTargets()) assert(Math.abs(s.b.x - win.originX) >= LUNGE.opening);
  assert(l.points.length > 10, 'a long visible body follows the head');
});

test('the strike eats only bricks on its row, with no score or charge', () => {
  const m = tower(); park(m); const win = m.windows[0], before = m.score, bank = m.chargeBank;
  m.lunges = [m.makeLunge(win)]; m.nextLunge = Infinity;
  runLunge(m, () => !m.lunges.length);
  const eaten = m.bricks.filter(b => b.type === 'brick' && b.hp === 0);
  assert(eaten.length >= 4, 'the bite clears a stretch of its row');
  for (const b of eaten) assert(b.y < win.y && b.y + b.h > win.y);
  assert.equal(m.score, before); assert.equal(m.chargeBank, bank);
});

test('a ball in the strike path is swallowed on Medium, spat back on Easy, and safe from the teaching lunge', () => {
  for (const [mode, teaching, expectLives] of [['medium', false, 2], ['easy', false, 3], ['medium', true, 3]]) {
    const m = tower(mode); const win = m.windows[0], l = m.makeLunge(win, teaching); m.lunges = [l]; m.nextLunge = Infinity;
    runLunge(m, () => l.stage === 'strike');
    const b = m.balls[0]; Object.assign(b, { caught: false, x: 200, y: win.y, vx: 0, vy: -1, r: 6 });
    for (let i = 0; i < 200 && m.lives === 3 && l.stage === 'strike'; i++) { b.vx = 0; b.vy = -1; m.step(1 / 240); }
    for (let i = 0; i < 2000 && m.phase === 'play' && !m.balls.length; i++) m.step(1 / 240);
    assert.equal(m.lives, expectLives, `${mode} teaching=${teaching}`);
    if (!teaching) assert.equal(m.bites, 1);
  }
});

test('hitting the head during the hiss drives Gnash back with a hurt face', () => {
  const m = tower(); const win = m.windows[0], l = m.makeLunge(win); m.lunges = [l]; m.nextLunge = Infinity;
  runLunge(m, () => l.stage === 'hiss' && Math.abs(l.points[0].x - win.originX) > 22);
  const h = l.points[0], b = m.balls[0]; Object.assign(b, { caught: false, x: h.x + 40, y: h.y, vx: -345, vy: 0 });
  for (let i = 0; i < 120 && l.stage !== 'retreat'; i++) m.step(1 / 240);
  assert.equal(l.stage, 'retreat'); assert.equal(l.mood, 'hurt'); assert.equal(m.headHits, 1);
  assert(b.vx > 0, 'the ball rebounds off the head');
});

test('Lullaby calms Gnash, Song Shield blocks exactly one bite, Starlight drops six notes', () => {
  const m = tower(); park(m); m.charge = 100;
  const l = m.makeLunge(m.windows[0]); m.lunges = [l];
  assert(m.activate('lullaby')); assert.equal(l.stage, 'retreat'); assert.equal(l.mood, 'dizzy');
  m.step(1 / 240); assert.equal(m.lunges.length <= 1, true);
  const s = tower(); park(s); s.charge = 100; assert(s.activate('songshield'));
  const k = s.makeLunge(s.windows[1]); s.lunges = [k]; s.nextLunge = Infinity;
  runLunge(s, () => !s.lunges.length);
  assert.equal(s.shield === null || s.shield.used, true); assert.equal(s.bricks.filter(b => b.hp === 0).length, 0, 'the shielded bite eats nothing');
  const n = tower(); n.charge = 100; assert(n.activate('starlight'));
  for (const b of n.bricks.filter(b => b.type === 'brick').slice(0, 8)) n.hitBrick(b, n.balls[0]);
  assert.equal(n.capsules.length, 6); assert.equal(n.notes, 0);
});

test('floors climb in order: cell bars, then serpent hatch, then the roof bell', () => {
  const m = new LumiTower({ height: 729, difficulty: 'hard', paddleY: 633 }); m.launch();
  assert.equal(m.windows.length, 0, 'the cell has no serpent');
  for (const b of m.bricks.filter(b => b.type === 'bar')) while (b.hp > 0) m.hitBrick(b, m.balls[0]);
  assert.equal(m.phase, 'climb'); for (let i = 0; i < 400; i++) m.step(1 / 240);
  assert.equal(m.floor, 1); assert.equal(m.windows.length, 4);
  for (const b of m.bricks.filter(b => b.type === 'bar')) { assert.equal(b.hp, LUMI_MODES.hard.hatch); while (b.hp > 0) m.hitBrick(b, m.balls[0]); }
  for (let i = 0; i < 400; i++) m.step(1 / 240);
  assert.equal(m.floor, 2); assert(m.bell);
  for (let i = 0; i < LUMI_MODES.hard.rings; i++) m.ringBell();
  for (let i = 0; i < 1000 && m.state === 'play'; i++) m.step(1 / 240);
  assert.equal(m.state, 'won');
});

test('after Lullaby the calm ends with a gap before the next peek, and a retreating head gives no score', () => {
  const m = tower(); park(m); m.charge = 100; m.nextLunge = 0;
  assert(m.activate('lullaby')); m.lunges = [];
  let peekAt = null;
  for (let i = 0; i < 240 * 8 && peekAt === null; i++) { park(m); m.step(1 / 240); if (m.lunges.length) peekAt = m.floorTime; }
  assert(peekAt === null || peekAt >= 4 + 1.5 - 1e-6, `next lunge waits past the calm (${peekAt})`);
  const r = tower(); const win = r.windows[0], l = r.makeLunge(win); r.lunges = [l]; r.nextLunge = Infinity;
  runLunge(r, () => l.stage === 'retreat'); runLunge(r, () => Math.abs(l.points[0].x - win.originX) > 60 || l.done, 1 / 240, 1);
  r.bricks = []; const h = l.points[0], b = r.balls[0], score = r.score, hits = r.headHits;
  Object.assign(b, { caught: false, x: h.x + 30, y: h.y, vx: -345, vy: 0 });
  for (let i = 0; i < 40; i++) r.step(1 / 240);
  assert.equal(r.score, score); assert.equal(r.headHits, hits);
});
