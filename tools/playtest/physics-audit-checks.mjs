// Deterministic physics audit, no browser: node tools/playtest/physics-audit-checks.mjs [--quick]
// Each check is a small fn (L, quick) => { pass, ...details }. To audit another level, change LEVEL and add/replace checks in CHECKS.
import { overlapsTarget } from '../../src/carrier-physics.js';

const LEVEL = { name: 'gatehouse', module: '../../src/fantasy/gatehouse.js', cls: 'Gatehouse', floors: [0, 1, 2], bellFloors: [1, 2] };
const quick = process.argv.includes('--quick'), DT = 1 / 240;
const { [LEVEL.cls]: Game } = await import(LEVEL.module);
const L = { ...LEVEL, Game };

const rng = seed => () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
const segDist = (x, y, a, b) => { const dx = b.x - a.x, dy = b.y - a.y, u = Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / (dx * dx + dy * dy))); return Math.hypot(x - a.x - dx * u, y - a.y - dy * u); };
const ball = (x, y, vx, vy, r = 6) => ({ id: 999, x, y, px: x, py: y, vx, vy, r, caught: false, dead: false, ram: r > 6 ? 2.5 : 0, ramBricks: 0, contacts: new Set() });
// Live game with play started and warnings off, so only what the check injects moves.
const arena = (opts, floor) => { const g = new L.Game({ ...opts, floor }); g.phase = 'play'; g.active = true; g.nextWarning = Infinity; return g; };

// 1. Tunnelling: random launches in free air; a ball may never sit >1.5u inside a solid, brick, housing, wheel, Korr or ramp.
function tunnelling() {
  const rnd = rng(4242), runs = quick ? 25 : 120, budgetMs = quick ? 4000 : 55000, t0 = Date.now(), speeds = [345, 442, 663, 700];
  let pen = 0, steps = 0, truncated = false; const kinds = {};
  outer: for (const floor of L.floors) for (const r of [6, 13.2]) for (const sp of speeds) for (let n = 0; n < runs; n++) {
    if (Date.now() - t0 > budgetMs) { truncated = true; break outer; }
    const g = arena({ difficulty: 'hard' }, floor); g.lives = 9; g.paddle.x = g.paddle.targetX = 120 + rnd() * 120;
    let x, y, tries = 0;
    do { x = 20 + rnd() * 320; y = 20 + rnd() * 560; tries++; } while (tries < 200 && (g.targets().some(t => t.kind !== 'villain' && overlapsTarget({ x, y, r: r + 6 }, t)) || g.villain.body.some(c => Math.hypot(x - c.x, y - c.y) < c.r + r + 6) || g.ramps.some(q => segDist(x, y, q.a, q.b) < r + 10) || (floor === 1 && y < 150 + r)));
    const a = rnd() * Math.PI * 2, b = ball(x, y, Math.cos(a) * sp, Math.sin(a) * sp, r); g.balls = [b];
    for (let i = 0; i < 240 && !b.dead && g.phase === 'play'; i++) {
      g.step(DT); if (b.dead) break; steps++;
      const deep = { ...b, r: b.r - 1.5 };
      for (const c of g.villain.body) if (Math.hypot(b.x - c.x, b.y - c.y) < b.r + c.r - 1.5) { pen++; kinds.korr = (kinds.korr || 0) + 1; }
      for (const t of g.targets()) if (t.kind !== 'villain' && t.item?.hp !== 0 && !(t.kind === 'brick' && b.ram > 0) && overlapsTarget(deep, t)) { pen++; kinds[t.id] = (kinds[t.id] || 0) + 1; }
      for (const q of g.ramps) if (segDist(b.x, b.y, q.a, q.b) < b.r + 2.5) { pen++; kinds[q.id] = (kinds[q.id] || 0) + 1; }
    }
  }
  return { pass: pen === 0, penetrations: pen, steps, truncated, where: kinds };
}

// 2. Stuck hazard: kick a falling bell in a random direction; alive >8 s or still for >3 s is stuck.
function stuckHazard() {
  const rnd = rng(7), n = quick ? 40 : 300, stuck = []; let trials = 0;
  for (const floor of L.bellFloors) for (let i = 0; i < n; i++) {
    const g = arena({ difficulty: 'easy' }, floor); g.balls = [{ ...ball(30, 300, 0, 0), caught: true }];
    g.villain.hole = g.holes[i % g.holes.length]; const b = g.releaseBell(false); b.teaching = false;
    const kickAt = rnd() * 2.5, a = rnd() * Math.PI * 2, imp = 150 + rnd() * 140; let kicked = false, anchor = { x: b.x, y: b.y, t: 0 }, why = '', t = 0;
    for (trials++; t < 8 && !b.dead && !why; t += DT) {
      if (!kicked && t >= kickAt) { kicked = true; b.vx += Math.cos(a) * imp; b.vy += Math.sin(a) * imp; b.returning = b.vy < 0; }
      g.paddle.stun = 0; g.step(DT);
      if (Math.hypot(b.x - anchor.x, b.y - anchor.y) > 2) anchor = { x: b.x, y: b.y, t }; else if (t - anchor.t > 3) why = 'still>3s';
    }
    if (!b.dead) stuck.push({ floor, hole: i % g.holes.length, x: +b.x.toFixed(0), y: +b.y.toFixed(0), why: why || 'alive>8s' });
  }
  const at = {}; for (const s of stuck) { const k = `f${s.floor} ${s.x},${s.y} ${s.why}`; at[k] = (at[k] || 0) + 1; }
  return { pass: !stuck.length, stuck: stuck.length, trials, where: at };
}

// 3. Ward vs bell: with Ward up, a bell dropping onto the paddle x must break on the ward, never stun the paddle.
function wardVsBell() {
  const rnd = rng(99), cases = quick ? 4 : 12; let stuns = 0;
  for (const floor of L.bellFloors) for (let i = 0; i < cases; i++) {
    const g = arena({ difficulty: 'easy' }, floor); g.balls = [{ ...ball(30, 300, 0, 0), caught: true }];
    g.paddle.x = g.paddle.targetX = 60 + rnd() * 240; g.charge = 100;
    if (!g.activate('ward')) return { pass: false, error: 'ward would not activate' };
    g.bells.push({ id: 50, x: g.paddle.x, y: 380 + rnd() * 80, px: g.paddle.x, py: 400, vx: 0, vy: 100 + rnd() * 200, r: 14, hp: 2, angle: 0, spin: 0, returning: false, teaching: false, dead: false });
    for (let k = 0; k < 480 && g.bells.length; k++) { g.step(DT); if (g.paddle.stun > 0) { stuns++; break; } }
  }
  return { pass: stuns === 0, stuns, cases: cases * L.bellFloors.length };
}

// 4. Clearable: bot tracks the ball with seeded aim error; every floor must clear in time, no 30 s without score/floor progress.
function clearable() {
  const seeds = quick ? [1] : [1, 2, 3, 4], limit = 400, runs = [];
  for (const difficulty of ['easy', 'hard']) for (const sd of seeds) {
    const rnd = rng(sd * 77), g = new L.Game({ difficulty }); g.lives = 99;
    let o = (rnd() - .5) * 70, last = g.score, lastFloor = g.floor, lastT = 0, gap = 0;
    for (let i = 0; i < limit * 240 && g.state === 'play'; i++) {
      if (g.phase === 'serve') g.launch(-Math.PI / 2 + (rnd() - .5) * 1.2);
      const b = g.balls[0]; if (b && !b.caught) { if (rnd() < .01) o = (rnd() - .5) * 70; g.setTarget(b.x + o); }
      g.step(DT);
      if (g.score !== last || g.floor !== lastFloor) { last = g.score; lastFloor = g.floor; lastT = g.time; }
      gap = Math.max(gap, g.time - lastT);
    }
    runs.push({ difficulty, seed: sd, state: g.state, floor: g.floor, time: +g.time.toFixed(1), maxGap: +gap.toFixed(1), ok: g.state === 'won' && gap < 30 });
  }
  return { pass: runs.every(r => r.ok), limit, runs: runs.filter(r => !r.ok).length ? runs : runs.map(({ difficulty, seed, time, maxGap }) => ({ difficulty, seed, time, maxGap })) };
}

const CHECKS = { tunnelling, 'stuck-hazard': stuckHazard, 'ward-vs-bell': wardVsBell, clearable };
const report = { level: L.name, quick, pass: true, checks: [] };
for (const [name, fn] of Object.entries(CHECKS)) {
  const t0 = Date.now(); let r; try { r = fn(); } catch (e) { r = { pass: false, error: String(e.stack || e) }; }
  report.checks.push({ name, ms: Date.now() - t0, ...r }); report.pass &&= r.pass;
}
console.log(JSON.stringify(report, null, 1));
for (const c of report.checks) console.log(`${c.pass ? 'PASS' : 'FAIL'} ${c.name} (${(c.ms / 1000).toFixed(1)}s)`);
process.exit(report.pass ? 0 : 1);
