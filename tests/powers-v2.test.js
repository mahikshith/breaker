// Powers v2: power-up physics in the princess chapters (shared Arena code for The Vault, Frost and Mooncoil; the castle
// models' own paddles) and the "right power" each villain takes extra damage from (difficulty.js powers).
import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.Image = class { complete = true; naturalWidth = 1; width = 1024; height = 768; decode() { return Promise.resolve(); } };
const gradient = { addColorStop() {} }, context = new Proxy({}, { get: (_, k) => k === 'createLinearGradient' ? () => gradient : () => {} });
globalThis.document ??= { createElement: () => ({ getContext: () => context }) };
const prefs = new Map();
globalThis.localStorage ??= { getItem: k => prefs.get(k) ?? null, setItem: (k, v) => prefs.set(k, v) };

const { Arena } = await import('../src/arena.js');
const { makeBall, cellAt } = await import('../src/physics.js');
const { Vault } = await import('../src/vault.js');
const { Frost } = await import('../src/frost.js');
const { Mooncoil } = await import('../src/mooncoil.js');
const { overlapsTarget } = await import('../src/carrier-physics.js');
const { paddleRoom } = await import('../src/clearance.js');
const { difficulty } = await import('../src/difficulty.js');
const { RAM, powerTitle } = await import('../src/fantasy/ram.js');
const { SerpentRivals } = await import('../src/fantasy/rivals.js');
const { LumiTower } = await import('../src/fantasy/lumitower.js');
const { TidewheelSiege } = await import('../src/fantasy/tidewheel-siege.js');
const { STAR_R } = await import('../src/fantasy/tidewheel.js');
const { Bellforge } = await import('../src/fantasy/bellforge.js');

const live = l => { l.aim = null; l.balls = []; return l; };
const vaultLayout = rows => Array.from({ length: 20 }, (_, r) => Array.from({ length: 20 }, (_, c) => rows(c, r)).join(''));
// A Frost siege in play with the Warden idle, so only what a test injects moves.
const frost = (mode = 'easy') => { const l = live(new Frost(360, 729, 393 / 360, mode)); l.started = true; l.nextAttack = Infinity; return l; };
const wardenParts = l => l.targets().filter(t => t.id === 'warden');
const inWarden = (l, b, slack = .5) => wardenParts(l).some(t => overlapsTarget({ x: b.x, y: b.y, r: b.r - slack }, t));
// The deepest point of his body (the point a ball could shrink inside of with the most room), checked by the tests.
const wardenCentre = l => {
  const body = wardenParts(l).find(t => t.type === 'rect'); let best = null;
  for (let x = body.x; x <= body.x + body.w; x += 2) for (let y = body.y; y <= body.y + body.h; y += 2) {
    let r = 0; while (r < 40 && wardenParts(l).some(t => overlapsTarget({ x, y, r: 0 }, t)) && [0, 1, 2, 3, 4, 5, 6, 7].every(k => wardenParts(l).some(t => overlapsTarget({ x: x + Math.cos(k * Math.PI / 4) * r, y: y + Math.sin(k * Math.PI / 4) * r, r: 0 }, t)))) r++;
    if (!best || r > best.r) best = { x, y, r };
  }
  return best;
};

test('shield: a fast ball on a long 50 ms frame is still caught (the floor is checked every substep)', () => {
  const l = live(new Arena(360, 729)), p = l.paddle;
  l.shield = 2; l.shieldT = 16; l.shieldMax = 16;
  const b = makeBall(40, l.shieldY - l.ballRadius - 2, 0, 442, l.ballRadius); l.balls = [b];
  l.update(0.05);
  assert.equal(b.dead, false, 'the ball survives'); assert(b.vy < 0, 'and rebounds off the shield');
  assert.equal(l.shield, 1); assert(b.y + b.r <= l.shieldY + 1e-6); assert.equal(l.lives, 3);
  void p;
});

test('laser / arrows: a bolt on a long frame hits the first brick row it passes, where it is drawn', () => {
  const l = live(new Vault(360, 729, 393 / 360, 'easy', { layout: vaultLayout((c, r) => r === 12 && c === 9 ? 'c' : '.') }));
  const G = l.grid, x = G.ox + 9.5 * G.cw, below = G.oy + 13 * G.ch + 2;
  // 560 px/s over 50 ms is 28 px: from just under row 12 to above it, a point check would skip the brick.
  l.shots = [{ x, y: below, vy: -560, kind: 'laser', vx: 0, r: 2 }];
  l.updateShots(0.05);
  assert.equal(cellAt(G, 9, 12), 0, 'the coral brick broke'); assert.equal(l.shots.length, 0, 'the bolt stopped on it');
});

test('TITAN shrink-back inside the Frost Warden waits until the ball is clear, then ends', () => {
  const l = frost(), c = wardenCentre(l), b = makeBall(c.x, c.y, 0, -345, l.ballRadius);
  b.titan = .02; b.r = 10; l.balls = [b]; assert(inWarden(l, b) && c.r >= 12, 'starts deep inside him');
  let ended = false;
  for (let i = 0; i < 240 && !ended; i++) {
    const x0 = b.x, y0 = b.y; l.update(1 / 120);
    // No teleport out of him and no rebound: the pass finishes on its own line (a plain ball inside him is shoved out).
    assert(Math.hypot(b.x - x0, b.y - y0) < 345 / 120 * 1.5 + .5, `jumped ${Math.hypot(b.x - x0, b.y - y0).toFixed(1)} px`); assert(b.vy < 0, 'no rebound off his insides');
    if (!(b.titan > 0)) { ended = true; assert.equal(b.r, l.ballRadius); assert(!inWarden(l, b), `shrunk inside the Warden at ${b.x.toFixed(1)}, ${b.y.toFixed(1)}`); }
    else assert.equal(b.r, 10, 'still a full TITAN while it finishes its pass');
  }
  assert(ended, 'the TITAN ends once it is through');
});

test('fire ending inside the Frost Warden keeps burning until the ball is through, then expires cleanly', () => {
  const l = frost(), c = wardenCentre(l), b = makeBall(c.x, c.y, 0, -345, l.ballRadius); l.balls = [b];
  l.fireT = .02; b.fire = true; assert(inWarden(l, b), 'starts inside him');
  let out = false;
  for (let i = 0; i < 240 && !out; i++) {
    const x0 = b.x, y0 = b.y; l.update(1 / 120);
    assert(Math.hypot(b.x - x0, b.y - y0) < 345 / 120 * 1.5 + .5, 'no teleport out of him'); assert(b.vy < 0, 'no rebound off his insides');
    if (!b.fire) { out = true; assert(!inWarden(l, b), 'the plain ball is never left inside him'); assert.equal(b.fireHold, undefined); }
  }
  assert(out, 'fire ends once the ball is clear'); assert(l.fireT <= 0);
});

test('split off a TITAN piercing the Warden never spawns a plain ball inside him; fans are wider', () => {
  const l = frost(), c = wardenCentre(l), b = makeBall(c.x, c.y, 0, -345, l.ballRadius);
  b.titan = 5; b.r = 10; l.balls = [b];
  l.applyPower('split');
  const kids = l.balls.filter(q => q !== b);
  assert.equal(kids.length, 2);
  for (const k of kids) assert(!inWarden(l, k, 0), 'a new ball starts clear of the Warden');
  const spread = Math.abs(Math.atan2(kids[0].vx, -kids[0].vy) - Math.atan2(kids[1].vx, -kids[1].vy));
  assert(spread > .7 + 1e-9, `fan ${spread.toFixed(2)} is wider than the old 0.70`);
  for (const id of ['easy', 'medium', 'hard']) assert(difficulty(id).powers.fan > .35);
  assert(difficulty('easy').powers.fan >= difficulty('hard').powers.fan, 'Easy stays the most forgiving');
});

test('COSMIC growth beside granite pushes the ball clear instead of into the stone', () => {
  const l = live(new Vault(360, 729, 393 / 360, 'easy', { layout: vaultLayout((c, r) => r === 10 && c === 9 ? '#' : '.') }));
  l.phase = 'rescue'; const G = l.grid, face = G.oy + 11 * G.ch;
  const b = makeBall(G.ox + 9.5 * G.cw, face + l.ballRadius + .5, 30, 300, l.ballRadius); l.balls = [b];
  l.paddle.charge = 1; l.powerMenuOpen = true;
  assert(l.chooseSpacePower('titan'));
  assert.equal(b.r, 10); assert(b.titan > 0);
  assert(b.y - b.r >= face - 1e-6, 'never inside the granite');
});

test('WIDE growth never lands the paddle on a ball beside it (Arena and castle paddles)', () => {
  const l = live(new Arena(360, 729)), p = l.paddle;
  const b = makeBall(p.x + p.w / 2 + l.ballRadius + 2, p.y + 3, 0, 345, l.ballRadius); l.balls = [b];
  l.applyPower('wide');
  for (let i = 0; i < 30 && !b.dead; i++) { l.update(1 / 120); assert(b.vy > 0, 'the ball beside the paddle is not scooped up'); }
  const m = new SerpentRivals({ height: 729, difficulty: 'easy', paddleY: 633 }); m.launch(); const q = m.paddle;
  const side = { ...m.balls[0], x: q.x + 50 + 9, y: q.y + 4, vx: 0, vy: 300, caught: false, dead: false };
  m.balls = [side]; m.collect('wide');
  assert(Math.abs(side.x - q.x) - side.r >= q.w / 2 - 1e-9, 'Rivals: the paddle stops short of the ball');
  side.y = q.y + 200; m.widen(); assert.equal(q.w, 140, 'and reaches full width once the ball is past');
  const lt = new LumiTower({ height: 729, difficulty: 'easy', paddleY: 633 }); lt.launch(); const lp = lt.paddle;
  lt.balls = [{ ...lt.balls[0], x: lp.x - 50 - 9, y: lp.y + 4, vx: 0, vy: 300, caught: false, dead: false }]; lt.collect('wide');
  assert(Math.abs(lt.balls[0].x - lp.x) - lt.balls[0].r >= lp.w / 2 - 1e-9, 'Lumi tower too');
  assert.equal(paddleRoom(0, 50, 70, 0, 14, []), 70); assert.equal(paddleRoom(0, 50, 40, 0, 14, []), 40, 'shrinking is never held back');
});

test('Tidewheel siege: a split off the star ball inside a brick finishes its pass instead of sticking', () => {
  const m = new TidewheelSiege({ width: 360, height: 700, paddleY: 584.6, difficulty: 'medium', stage: 0 }); m.skipCard(); m.launch();
  const brick = m.targets().find(t => t.kind === 'brick' && t.id.startsWith('blk'));
  assert(brick, 'stage 1 has board bricks');
  const b = m.balls[0]; Object.assign(b, { x: brick.x + brick.w / 2, y: brick.y + brick.h / 2, vx: 0, vy: -300, titan: 6, r: STAR_R });
  m.cosmic = { time: 6, maxTime: 6, ballId: b.id }; m.powerTimers.cosmic = 6;
  m.collect('split');
  const kids = m.balls.filter(q => q !== b);
  assert(kids.length >= 1);
  for (const k of kids) assert(k.pierceExit?.has(brick.id), 'each child passes out of the brick it started in');
  assert.equal(STAR_R, 10, 'the star ball reads three units over the plain ball');
});

test('the right power: fire and TITAN break armour outright; Kit arrows split glaze, capsule lasers chip it', () => {
  const l = live(new Vault(360, 729, 393 / 360, 'easy', { layout: vaultLayout((c, r) => r === 12 && (c === 4 || c === 9 || c === 14) ? 'v' : '.') }));
  const G = l.grid, at = c => l.brickAt(c, 12);
  const t = makeBall(0, 0, 0, -345, l.ballRadius); t.titan = 3; l.hitCell(4, 12, t); assert(at(4) === null || at(4).gone, 'TITAN breaks two-hit violet in one');
  l.shots = [{ x: G.ox + 9.5 * G.cw, y: G.oy + 13 * G.ch + 1, vy: -560, kind: 'arrow', orb: true, vx: 0, r: 2 }]; l.updateShots(1 / 60);
  assert(at(9) === null || at(9).gone, 'Kit’s orb arrows split the glaze');
  l.shots = [{ x: G.ox + 14.5 * G.cw, y: G.oy + 13 * G.ch + 1, vy: -560, kind: 'arrow', vx: 0, r: 2 }]; l.updateShots(1 / 60);
  assert.equal(at(14).hp, 1, 'a capsule laser only chips it');
});

test('FIRE BREAKS RIME: the Frost Warden takes powers.strong from fire and COSMIC, titled on screen; HP is tougher off Easy', () => {
  const l = frost('medium'), strong = difficulty('medium').powers.strong, hp = l.warden.hp;
  l.hitTarget('warden', { x: 180, y: 150, fire: true }); assert.equal(l.warden.hp, hp - strong);
  assert(l.fx.pops.some(p => p.text === 'FIRE BREAKS RIME'));
  l.hitTarget('warden', { x: 180, y: 150, shot: true, fire: true }); assert.equal(l.warden.hp, hp - strong - 1, 'arrows do not count as fire on him');
  l.hitTarget('warden', { x: 180, y: 150 }); assert.equal(l.warden.hp, hp - strong - 2, 'a plain ball deals 1');
  assert(strong >= 3); assert(new Frost(360, 729, 1, 'hard').warden.hp > new Frost(360, 729, 1, 'medium').warden.hp);
  assert.equal(new Frost(360, 729, 1, 'easy').warden.hp, 40, 'Easy keeps its HP');
});

test('COSMIC CRACKS MOONSTONE and the Vault serpent is scalded back by fire', () => {
  const m = live(new Mooncoil(360, 729, 393 / 360, 'medium')); m.phase = 'rescue';
  const hp = m.cageHP, b = makeBall(0, 0, 0, 0, 10); b.titan = 3; m.hitBars(b);
  assert.equal(m.cageHP, hp - difficulty('medium').powers.strong); assert(m.fx.pops.some(p => p.text === 'COSMIC CRACKS MOONSTONE'));
  assert(RAM.bricks > 14); assert(RAM.damage > 3, 'the ram ploughs further and hits harder');
});

test('castle chapters: the right power posts one title effect, throttled to once every 3 s', () => {
  const g = new Bellforge({ difficulty: 'medium' });
  assert(powerTitle(g, 'RAM STAGGERS KORR', 100, 100)); assert(!powerTitle(g, 'RAM STAGGERS KORR', 100, 100));
  assert.equal(g.effects.filter(e => e.kind === 'power-title').length, 1);
  g.time += 3.1; assert(powerTitle(g, 'RAM STAGGERS KORR', 100, 100));
  assert(g.rules.hp > 32, 'Korr is tougher on Medium');
});
