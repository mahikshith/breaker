// Regressions for tools/playtest/physics-audit.mjs findings: discrete collider changes (keyposes, knock-backs,
// spawns, rebuilt cells) must never leave a ball inside a solid or pinned there.
import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.Image ??= class { complete = true; naturalWidth = 1; width = 512; height = 768; decode() { return Promise.resolve(); } };
const gradient = { addColorStop() {} }, context = new Proxy({}, { get: (_, k) => k === 'createLinearGradient' ? () => gradient : () => {} });
globalThis.document ??= { createElement: () => ({ getContext: () => context }) };
const prefs = new Map();
globalThis.localStorage ??= { getItem: k => prefs.get(k) ?? null, setItem: (k, v) => prefs.set(k, v) };

const { Bellforge, KORR_BODIES } = await import('../src/fantasy/bellforge.js');
const { Tidewheel } = await import('../src/fantasy/tidewheel.js');
const { Vault } = await import('../src/vault.js');
const { Mooncoil } = await import('../src/mooncoil.js');
const { Frost } = await import('../src/frost.js');
const { overlapsAny } = await import('../src/clearance.js');

const circlesDepth = (b, circles) => Math.max(0, ...circles.map(c => c.r + b.r - Math.hypot(b.x - c.x, b.y - c.y)));
// first grid point (scan order) where a ball of radius r overlaps `after` by at least `min` and is clear of `before`
function landing(after, before, r, { x0, x1, y0, y1, min = 2, ok = () => true }) {
  for (let y = y0; y <= y1; y += .5) for (let x = x0; x <= x1; x += .5) {
    const b = { x, y, r };
    if (circlesDepth(b, after) >= min && !overlapsAny(x, y, r + .5, before) && ok(x, y)) return { x, y };
  }
  return null;
}

test('Bellforge: a Korr keypose swap that lands on a ball pushes it clear instead of pinning it', () => {
  const g = new Bellforge({ height: 751, paddleY: 641 }); g.launch();
  const at = pose => KORR_BODIES[pose].map(([x, y, r]) => ({ type: 'circle', x: g.villain.foot.x + x, y: g.villain.foot.y + y, r }));
  const spot = landing(at('stagger'), at('idle'), 6, { x0: 20, x1: 170, y0: 40, y1: 175, min: 3 });
  assert.ok(spot, 'a point the stagger pose covers but idle does not');
  const b = g.balls[0]; Object.assign(b, { ...spot, vx: 0, vy: 345 });
  const hp = g.villain.hp;
  Object.assign(g.villain, { stage: 'stagger', stageAt: g.time, until: g.time + 1.5 });
  g.update(1 / 240);
  assert.ok(circlesDepth(b, g.villain.body) <= 1e-6, `ball left inside Korr by ${circlesDepth(b, g.villain.body)}`);
  assert.ok(g.villain.hp >= hp - 1, 'at most one ordinary contact'); assert.ok(Math.abs(Math.hypot(b.vx, b.vy) - 345) < 1e-6);
  let path = 0; for (let i = 0; i < 60; i++) { const x = b.x, y = b.y; g.update(1 / 240); path += Math.hypot(b.x - x, b.y - y); }
  assert.ok(path > 60, `ball travels freely afterwards (${path.toFixed(1)} px in .25 s)`);
});

test('Bellforge: a bell is not released onto a ball passing its cradle', () => {
  const g = new Bellforge({ height: 751, paddleY: 641, difficulty: 'hard' }); g.launch(); g.teachingDone = true;
  Object.assign(g.villain, { stage: 'windup', stageAt: g.time, until: g.time });
  const b = g.balls[0]; Object.assign(b, { x: g.bellSource.x - 3, y: g.bellSource.y - 3, vx: 345, vy: -60 });
  const hp = g.villain.hp;
  g.update(1 / 240);
  assert.equal(g.bells.length, 0, 'held while the ball is in the cradle'); assert.equal(g.villain.stage, 'windup');
  Object.assign(b, { x: 250, y: 420, vx: 0, vy: 345 });
  g.update(1 / 240);
  assert.equal(g.bells.length, 1); assert.equal(g.villain.stage, 'release');
  const bell = g.bells[0]; assert.equal(bell.hp, 2); assert.equal(bell.returning, false); assert.equal(g.villain.hp, hp);
});

test('Tidewheel: a claw socket jump between keyposes (fury -> hurt) cannot engulf or drag a ball', () => {
  const make = () => { const g = new Tidewheel({ height: 751, paddleY: 641, difficulty: 'hard' }); g.launch(); g.villain.anger = 3; g.update(1 / 240); return g; };
  const boss = g => g.targets().filter(t => t.kind === 'shell' || t.kind === 'claw');
  const g = make(), twin = make();
  assert.equal(g.villain.pose, 'fury');
  // where the hurt pose puts the crusher claw one step later (the twin's ball is parked out of the way)
  Object.assign(twin.balls[0], { x: 180, y: 560, vx: 0, vy: 1 }); twin.villain.stunUntil = twin.time + 1; twin.update(1 / 240);
  assert.equal(twin.villain.pose, 'hurt');
  const claw = boss(twin).filter(t => t.kind === 'claw' && t.clawSide < 0);
  const spot = landing(claw, boss(g), 6, { x0: 60, x1: 200, y0: 120, y1: 260, min: 3, ok: (x, y) => y > 67 + 6 && !overlapsAny(x, y, 6.5, boss(twin).filter(t => t.kind === 'shell')) });
  assert.ok(spot, 'a point the hurt crusher covers but fury does not');
  const b = g.balls[0]; Object.assign(b, { ...spot, vx: 0, vy: -345 });
  g.villain.stunUntil = g.time + 1; g.update(1 / 240);
  assert.equal(g.villain.pose, 'hurt');
  assert.ok(circlesDepth(b, boss(g)) <= 1e-6, `ball left inside Nerra by ${circlesDepth(b, boss(g))}`);
  assert.ok(Math.abs(Math.hypot(b.vx, b.vy) - 345) < 1e-6, 'rebounds at normal speed');
  for (let i = 0; i < 24; i++) { g.update(1 / 240); assert.ok(circlesDepth(b, boss(g)) <= 1e-6); }
});

test('Mooncoil: a continue never rebuilds the cage over a live ball (no rescue from inside the bars)', () => {
  const l = new Mooncoil(360, 785, 412 / 360, 'medium');
  l.phase = 'caught'; l.state = 'lost'; l.burstCage(true);
  const { c0, c1, r0, r1 } = l.pocket, b = l.balls[0];
  Object.assign(b, { caught: false, x: 20 + (c0 + c1 + 1) * 8, y: 96 + (r0 + 1) * 16 + 8, vx: 200, vy: -300 });
  const cage = l.cageHP;
  l.continueRun();
  assert.equal(l.phase, 'rescue'); assert.equal(l.grid.cells[r0 * 20 + c0], 8);
  for (const q of l.balls.filter(q => !q.dead && !q.caught)) assert.ok(l.ballFits(q.x, q.y, q.r), `ball inside masonry at ${q.x},${q.y}`);
  l.update(1 / 120);
  assert.equal(l.cageHP, cage, 'the rebuilt cage takes no damage from inside');
  assert.equal(l.phase, 'rescue');
});

test('Vault: a serpent knock-back that lands the head on a ball pushes the ball clear', () => {
  const l = new Vault(360, 785, 412 / 360, 'hard'); l.phase = 'rescue';
  const C = 10, cx = 20 + C * 16 + 8, cy = r => 96 + r * 16 + 8;
  for (let r = 0; r < 12; r++) for (let c = C - 2; c <= C + 2; c++) l.grid.cells[r * 20 + c] = 0; // an open shaft
  Object.assign(l.snake, { cells: Array.from({ length: 12 }, (_, i) => [C, 9 - i]).filter(([, r]) => r >= -2), hist: [[C, -3], [C, -4]], prog: 1, lunge: 0, dir: Math.PI / 2 });
  const body = () => l.snakePoints().map((p, i) => ({ type: 'circle', x: p.x, y: p.y, r: (i ? Math.max(4, 8 - i * .5) : 11) * l.growth() })).filter(c => c.y >= 96);
  const b = l.balls[0]; Object.assign(b, { caught: false, x: cx + 15.5, y: cy(8), vx: 0, vy: 345 });
  assert.equal(circlesDepth(b, body()), 0, 'clear of the serpent before the recoil');
  l.knockBack(1);
  assert.deepEqual(l.snake.cells[0], [C, 8], 'head recoiled one cell onto the ball');
  assert.ok(circlesDepth(b, body()) <= 1e-6, `ball left inside the serpent by ${circlesDepth(b, body())}`);
  assert.ok(l.ballFits(b.x, b.y, b.r));
});

test('Frost: a stagger mid-windup that swaps the fist onto a ball pushes it clear before it moves', () => {
  const clips = Object.fromEntries(['idle', 'walk', 'windup', 'strike', 'recover', 'hurt', 'victory'].map((id, i) => [id, { start: i * 4, n: 4, fps: 10 }]));
  const xs = [22, 23, 24, 22, 22, 23, 24, 22, 22, 18, 12, 8, 8, 26, 43, 48, 48, 35, 25, 22, 20, 18, 17, 18, 22, 22, 22, 22];
  const art = { cell: [256, 228], columns: 7, rows: 4, unit: [144, 128], pivot: [.5, .90625], clips,
    anchors: xs.map((x, i) => ({ fist: { x, y: i >= 20 && i < 24 ? -20 : -44, r: 9 }, body: { x: -17, y: -78, w: 36, h: 72 } })) };
  const l = new Frost(360, 729, 393 / 360, 'hard', art); l.release(); l.aim = null;
  l.setStage('windup');
  const warden = () => l.targets().filter(t => t.id === 'warden').flatMap(t => t.shapes || [t]);
  const before = warden(); l.stage = 'stun'; const after = warden(); l.stage = 'windup';
  const fist = after.find(s => s.type === 'circle');
  const spot = landing([fist], before, 6, { x0: fist.x - 20, x1: fist.x + 20, y0: fist.y - 20, y1: fist.y + 20, min: 3 });
  assert.ok(spot, 'a point the stagger fist covers but the windup pose does not');
  const b = l.balls[0]; Object.assign(b, { ...spot, vx: 0, vy: 345 });
  l.setStage('stun'); l.update(1 / 120);
  assert.equal(l.stage, 'stun');
  assert.ok(!overlapsAny(b.x, b.y, b.r - 1e-6, warden()), 'ball clear of the Warden after the swap');
});
