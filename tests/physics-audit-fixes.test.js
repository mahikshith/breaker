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
const { Tidewheel, GATE_LIFT } = await import('../src/fantasy/tidewheel.js');
const { TidewheelSiege } = await import('../src/fantasy/tidewheel-siege.js');
const { overlapsTarget } = await import('../src/carrier-physics.js');
const { Vault } = await import('../src/vault.js');
const { Mooncoil } = await import('../src/mooncoil.js');
const { Frost, NOTCH } = await import('../src/frost.js');
const { BALL_R } = await import('../src/fantasy/ram.js');
const { ART } = await import('../src/vault-art.js');
const { overlapsAny, closeNotches } = await import('../src/clearance.js');

// a Vault/Mooncoil ball overlaps no solid grid cell (masonry or bars)
const fits = (l, b) => { const G = l.grid; for (let r = 0; r < G.rows; r++) for (let c = 0; c < G.cols; c++) if (G.cells[r * G.cols + c]) {
  const x0 = G.ox + c * G.cw, y0 = G.oy + r * G.ch; if (Math.hypot(b.x - Math.max(x0, Math.min(x0 + G.cw, b.x)), b.y - Math.max(y0, Math.min(y0 + G.ch, b.y))) < b.r - 1e-6) return false;
} return true; };
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
  for (const q of l.balls.filter(q => !q.dead && !q.caught)) assert.ok(fits(l, q), `ball inside masonry at ${q.x},${q.y}`);
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
  assert.ok(fits(l, b));
});

test('Frost: a stagger mid-windup that swaps the fist onto a ball pushes it clear instead of pinning it', () => {
  // audit repro: hard 393x852 bot --seed 19 @14.45, measured Warden rig (v1); the stun keypose lands the fist on the ball
  const l = new Frost(360, 729, 393 / 360, 'hard', ART.frostWarden); l.release(); l.aim = null; l.clock = 14;
  l.setStage('windup'); l.stageAt = l.clock - 1.217;
  const warden = () => l.targets().filter(t => t.id === 'warden').flatMap(t => t.shapes || [t]);
  // A ball spot the stun keypose covers but the windup pose leaves clear (measured on whichever rig ships).
  const b = l.balls[0], windup = warden(); l.setStage('stun'); const stun = warden(); l.setStage('windup'); l.stageAt = l.clock - 1.217;
  let spot = null;
  for (let y = 120; y < 260 && !spot; y += 1) for (let x = 20; x < 340 && !spot; x += 1) if (overlapsAny(x, y, b.r, stun) && !overlapsAny(x, y, b.r, windup) && !overlapsAny(x, y, b.r + 8, windup)) spot = { x, y };
  assert.ok(spot, 'the stagger swaps the Warden onto new space');
  Object.assign(b, { ...spot, vx: -8, vy: 362 });
  assert.ok(!overlapsAny(b.x, b.y, b.r, warden()), 'clear of the windup pose');
  l.setStage('stun');
  assert.ok(overlapsAny(b.x, b.y, b.r, warden()), 'the stun pose lands on the ball');
  let path = 0;
  for (let i = 0; i < 6; i++) {
    const x = b.x, y = b.y; l.update(1 / 120); path += Math.hypot(b.x - x, b.y - y);
    assert.ok(!overlapsAny(b.x, b.y, b.r - 1e-6, warden()), `ball inside the Warden after step ${i}`);
  }
  assert.equal(l.stage, 'stun'); assert.ok(path > 12, `ball moves on (${path.toFixed(1)} px)`);
});

// Notches in a stack of bands: rows between two bands closer than gap that do not cover what both of those bands cover.
function bandNotches(shapes, gap) {
  const r = shapes.filter(v => v.type !== 'circle').sort((u, v) => u.y - v.y), found = [];
  for (let i = 0; i < r.length; i++) for (let k = i + 2; k < r.length; k++) {
    const h = r[k].y - (r[i].y + r[i].h); if (h >= gap) break;
    const lo = Math.max(r[i].x, r[k].x), hi = Math.min(r[i].x + r[i].w, r[k].x + r[k].w);
    for (let j = i + 1; j < k; j++) if (hi > lo && (r[j].x > lo + 1e-6 || r[j].x + r[j].w < hi - 1e-6)) found.push({ h, y: r[j].y });
  }
  return found;
}

test('Frost: the Warden body bands leave no notch a ball only just fits in (no rattling in place under his arm)', () => {
  // audit repro: hard 393x852 bot --seed 2 @27.3: on the second post, idle frame 0 (late in the recover clip) has a
  // notch 14.9 tall between the arm band and the foot band; a pose swap ejected a ball (r 7) into it and it crawled there.
  const l = new Frost(360, 729, 393 / 360, 'hard', ART.frostWarden); l.release(); l.aim = null; l.clock = 26;
  l.defences[0].hp = 0; l.activeDefence = 1; l.setStage('recover'); l.stageAt = l.clock - 1.242;
  const p = l.pose(), s = l.artScale, scaled = v => ({ x: p.x + v.x * s, y: p.y + v.y * s, w: v.w * s, h: v.h * s, type: 'rect' });
  const raw = ART.frostWarden.anchors[p.globalFrame].bodyShapes.map(scaled), b = l.balls[0];
  Object.assign(b, { x: 130.06, y: 196.15, vx: -15.1, vy: -383.8 });
  assert.ok(!overlapsAny(b.x, b.y, b.r, raw) && overlapsAny(b.x, b.y - 1, b.r, raw) && overlapsAny(b.x, b.y + 1, b.r, raw), 'the measured bands box the ball in');
  assert.ok(bandNotches(raw, NOTCH).length, 'the measured frame has the notch');
  assert.ok(NOTCH > 2 * BALL_R);
  assert.deepEqual(bandNotches(p.bodyShapes, NOTCH), [], 'the collider closes it');
  const ext = q => [Math.min(...q.map(v => v.x)), Math.max(...q.map(v => v.x + v.w)), Math.min(...q.map(v => v.y)), Math.max(...q.map(v => v.y + v.h))];
  ext(p.bodyShapes).forEach((v, i) => assert.ok(Math.abs(v - ext(raw)[i]) < 1e-9, 'outer extents (dash front, reach) unchanged'));
  for (const a of ART.frostWarden.anchors) assert.deepEqual(bandNotches(closeNotches(a.bodyShapes.map(scaled), NOTCH), NOTCH), [], `frame ${a.index}`);
  // the ball is pushed out of the closed notch and moves on at its speed, never back inside the body
  const body = () => l.targets().filter(t => t.id === 'warden').flatMap(t => t.shapes || [t]);
  let path = 0;
  for (let i = 0; i < 14; i++) {
    const x = b.x, y = b.y; l.update(1 / 120); path += Math.hypot(b.x - x, b.y - y);
    assert.ok(!overlapsAny(b.x, b.y, b.r - 1e-6, body()), `ball inside the Warden after step ${i}`);
  }
  assert.equal(l.stage, 'recover'); assert.ok(Math.abs(Math.hypot(b.vx, b.vy) - 383.8) < 1);
  assert.ok(path > 30, `ball travels freely (${path.toFixed(1)} px in 0.12 s)`);
});

// Tidewheel Siege, The Wheel (Nerra on the hub), after the card and her entrance.
function wheel() {
  const g = new TidewheelSiege({ width: 360, height: 751, paddleY: 641, difficulty: 'easy', stage: 2 });
  g.skipCard(); g.launch(-Math.PI / 2);
  for (let i = 0; i < 600 && g.cine; i++) g.update(1 / 120);
  return g;
}

test('Tidewheel: an open gate panel parks clear of Nerra (no funnel at her gate claw, no sealed pocket above it)', () => {
  // audit repros: tidewheel-s3 easy 412x915 ram --seed 1 @123.5, a ball (r 7) rattled 0.4 s between the gate claw and the
  // spent panel's face (gap 14-16 px); tidewheel-s2 medium 412x915 bot --seed 3 @82.9, a spent ball circled 12 s in the
  // pocket above the claw, whose only way down was that funnel. Both came from the panel parking beside the claw (32 px lift).
  const g = wheel(), v = g.villain;
  const clear = (lift, gate, disks) => {
    const x0 = gate.x - gate.w / 2, y0 = gate.y - lift - gate.h / 2;
    return Math.min(...disks.map(c => Math.hypot(Math.max(x0 - c.x, 0, c.x - x0 - gate.w), Math.max(y0 - c.y, 0, c.y - y0 - gate.h)) - c.r));
  };
  let now = Infinity, funnel = false;
  for (const pose of ['idle', 'step', 'pull', 'hurt', 'fury']) for (const stage of ['idle', 'pullWindup', 'pull', 'recover', 'pulseWindup', 'pulse'])
    for (const t of [0, .2, .4, .6, 1, 2]) for (let foot = 168; foot <= 192; foot += 2) {
      Object.assign(v, { footX: foot, x: foot, pose, stage, stageTime: t });
      for (let k = 0; k < 3; k++) g.syncAnatomy();
      const disks = g.targets(0).filter(q => q.kind === 'shell' || q.kind === 'claw');
      for (const gate of g.gates) {
        now = Math.min(now, clear(GATE_LIFT, gate, disks));
        const old = clear(32, gate, disks); if (old > 2 * BALL_R && old < 2 * BALL_R + 3) funnel = true;
      }
    }
  assert.ok(funnel, 'parked at the old 32 px lift, a panel left a ball-sized gap against Nerra');
  assert.ok(now >= 2 * BALL_R + 8, `an open panel stays ${now.toFixed(1)} px clear of Nerra in every pose`);
  // the column below a raised spent panel is open: a ball drops past where the panel used to park, untouched
  const w = wheel(); Object.assign(w.gates[1], { hp: 0, until: Infinity, open: 1 }); w.update(1 / 120);
  const panel = w.targets(0).find(t => t.id === 'gate1'), b = w.balls[0];
  assert.ok(panel.y - 67 >= 2 * BALL_R + 8 && panel.y + panel.h < 152, 'parked above her reach with room under the ceiling');
  Object.assign(b, { x: w.gates[1].x, y: panel.y + panel.h + b.r + 2, vx: 0, vy: 345, spent: true });
  let deepest = b.y;
  for (let i = 0; i < 40; i++) { w.update(1 / 120); deepest = Math.max(deepest, b.y); }
  assert.ok(deepest > w.gates[1].y + b.r, `ball falls through the old parking band and the gate opening (${deepest.toFixed(1)})`);
});

