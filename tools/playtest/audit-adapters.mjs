// Headless adapters for tools/playtest/physics-audit.mjs: one small wrapper per level so the audit can drive
// every chapter through the same surface (step, balls, paddle, serve, solid geometry, progress, outcome).
// The game code is imported unchanged; nothing here alters level rules except what the audit baseline needs
// (no power-ups collected, no Focus catch, no Kit/companion powers, coach overlays pre-acknowledged).
globalThis.Image ??= class { complete = true; naturalWidth = 1; width = 1024; height = 768; decode() { return Promise.resolve(); } };
// Offscreen canvases (gfx.cached) get a do-nothing 2D context; prefs fall back to memory.
const nullContext = () => { const f = new Proxy(function () {}, { get: () => f, apply: () => f, set: () => true }); return f; };
globalThis.document ??= { createElement: () => ({ getContext: nullContext, width: 0, height: 0 }) };

const SRC = new URL('../../src/', import.meta.url);
const load = async (file, name) => (await import(new URL(file, SRC)))[name];

// Phone geometry as the existing tests derive it: level H = playable height + LIFT, uiScale = CSS width / 360.
export const PHONES = [
  { id: '393x852', H: 729, scale: 393 / 360 },
  { id: '412x915', H: 785, scale: 412 / 360 },
];

// ---------- shared geometry ----------
const segDist = (x, y, ax, ay, bx, by) => {
  const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy || 1, u = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / l2));
  return Math.hypot(x - ax - dx * u, y - ay - dy * u);
};
function inLoop(x, y, p) {
  let inside = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [ax, ay] = p[i], [bx, by] = p[j];
    if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) inside = !inside;
  }
  return inside;
}
const BOX = new WeakMap();
function box(s) {
  let q = BOX.get(s); if (q) return q;
  q = [Infinity, Infinity, -Infinity, -Infinity];
  for (const [x, y] of s.points) { if (x < q[0]) q[0] = x; if (y < q[1]) q[1] = y; if (x > q[2]) q[2] = x; if (y > q[3]) q[3] = y; }
  BOX.set(s, q); return q;
}
// Depth of point (x,y) inside a solid shape (0 when outside). Shapes use the carrier-physics vocabulary plus capsules.
export function depthIn(s, x, y) {
  if (s.type === 'circle') return Math.max(0, s.r - Math.hypot(x - s.x, y - s.y));
  if (s.type === 'rect') return x > s.x && x < s.x + s.w && y > s.y && y < s.y + s.h ? Math.min(x - s.x, s.x + s.w - x, y - s.y, s.y + s.h - y) : 0;
  if (s.type === 'capsule') return Math.max(0, s.r - segDist(x, y, s.a.x, s.a.y, s.b.x, s.b.y));
  const q = box(s); if (x <= q[0] || x >= q[2] || y <= q[1] || y >= q[3]) return 0;
  const loops = [s.points, ...(s.holes || [])];
  if (!inLoop(x, y, s.points) || (s.holes || []).some(h => inLoop(x, y, h))) return 0;
  let d = Infinity;
  for (const p of loops) for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; d = Math.min(d, segDist(x, y, a[0], a[1], b[0], b[1])); }
  return d;
}
// Depth inside the union of solid grid cells: distance to the nearest face whose neighbour is open.
function gridDepth(G, x, y, solid) {
  const c = Math.floor((x - G.ox) / G.cw), r = Math.floor((y - G.oy) / G.ch);
  const at = (c, r) => c >= 0 && r >= 0 && c < G.cols && r < G.rows ? G.cells[r * G.cols + c] : 0;
  const v = at(c, r); if (!v || !solid(v)) return 0;
  const x0 = G.ox + c * G.cw, y0 = G.oy + r * G.ch, open = (dc, dr) => { const n = at(c + dc, r + dr); return !n || !solid(n); };
  let d = Infinity;
  if (open(-1, 0)) d = Math.min(d, x - x0);
  if (open(1, 0)) d = Math.min(d, x0 + G.cw - x);
  if (open(0, -1)) d = Math.min(d, y - y0);
  if (open(0, 1)) d = Math.min(d, y0 + G.ch - y);
  return d === Infinity ? Math.min(G.cw, G.ch) : d; // fully enclosed cell: deep inside the wall
}
// Snapshot = { grid?, ramCell?, shapes: [{ id, s, dx?, dy?, pierceable, ram }] } (dx/dy: the shape advanced along its velocity);
// returns deepest containment for a ball centre. Fire/TITAN balls pass through pierceable shapes; a live Sweet-Spot Ram only
// through what its level calls an ordinary brick (shape.ram / snap.ramCell), so armour, props, walls stay solid to it.
export function deepest(snap, b) {
  const powered = b.fire || b.titan > 0, ram = b.ram > 0;
  let best = null;
  if (snap.grid) {
    const G = snap.grid, d = gridDepth(G, b.x, b.y, v => (!powered || G.unpierceable?.includes(v)) && !(ram && snap.ramCell?.(v)));
    if (d > 0) best = { id: 'grid', depth: d };
  }
  for (const e of snap.shapes) {
    if (powered && e.pierceable !== false) continue;
    if (ram && e.ram) continue;
    const d = depthIn(e.s, b.x - (e.dx || 0), b.y - (e.dy || 0));
    if (d > 0 && (!best || d > best.depth)) best = { id: e.id, depth: d };
  }
  return best;
}
const shapesOf = (t, ram = false) => (t.shapes || [t]).map(s => ({ id: t.id ?? '?', s, pierceable: t.pierceable, ram }));
const liveSolid = t => t.active !== false && !(t.hp !== undefined && t.hp <= 0) && t.solid !== false;

const HP_OBJECTS = ['carrier', 'hull', 'core', 'warden'], HP_LISTS = ['bricks', 'nodes', 'guns', 'crew', 'fighters', 'stations', 'defences'];

// ---------- Arena chapters (src/*.js levels extending Arena) ----------
function arena(name, file, cls, extra = {}) {
  let C;
  return {
    name, kind: 'arena',
    async init() { C ||= await load(file, cls); },
    make(phone, difficulty) {
      const l = new C(360, phone.H, phone.scale, difficulty);
      l.wardCoachSeen = true; l.aimReadySeen = true; // coach overlays would pause the sim waiting for a tap
      const nominal = l.speed, proto = Object.getPrototypeOf(l);
      // Capture the exact world each Arena.update resolves against (no second targets() build), and check
      // live balls against it before they move: a collider that appeared or jumped onto a ball ("engulfed").
      let caps = [], engulfed = [];
      const ramCell = v => l.ramPierce({ cell: v }), ramOf = t => !!l.ramPierce(t);
      const solidsOf = w => { const shapes = []; for (const t of w.targets || []) if (liveSolid(t)) shapes.push(...shapesOf(t, ramOf(t))); extra.shapes?.(l, shapes); return { grid: w.grid, ramCell, shapes }; };
      l.world = function () {
        const w = proto.world.call(this), snap = solidsOf(w);
        caps.push({ w, scale: this.timeScale * (this.slowT > 0 ? .68 : 1) });
        for (const b of this.balls) if (!b.dead && !b.caught) { const h = deepest(snap, b); if (h) engulfed.push({ b, h, x: b.x, y: b.y }); }
        return w;
      };
      return {
        level: l, dt: 1 / 120, nominal,
        step() {
          l.drops.length = 0; l.queuedPowers && (l.queuedPowers.length = 0); // baseline: power-ups are never collected
          l.focus = 0; // baseline: no Focus catch / slow-mo aim on returns
          caps = []; engulfed = [];
          l.update(this.dt);
        },
        engulfed() { return engulfed; },
        threats() { return l.bolts?.filter(b => !b.dead) || []; }, // enemy fire that costs a ball on paddle contact
        timeFactor() { return l.hitStop > 0 || l.powerMenuOpen ? 0 : l.timeScale * (l.slowT > 0 ? .68 : 1); }, // ball time per real second
        get state() { return l.state; }, get lives() { return l.lives; }, get time() { return l.t; },
        balls() { return l.balls; },
        active(b) { return !b.dead && !b.caught; },
        bounds() { return { left: l.left, right: l.right, top: l.top, bottom: l.H }; },
        paddle() { const p = l.paddle; return { x: p.x, top: p.y, w: p.w, h: p.h, stunned: p.stun > 0 }; },
        serving() { return !!l.aim?.serve && l.state === 'play'; },
        serve(angle) { if (l.aim) { l.aim.angle = angle; l.ptr.down = false; l.release(); } },
        control(x) {
          const p = l.ptr;
          if (x === null || l.aim) { p.down = false; return; }
          Object.assign(p, { down: true, x, lastX: x, y: l.paddle.y, anchor: x, padAnchor: x });
        },
        progress() { // score plus every hit-point pool the level owns: any damage moves it
          let n = l.score + (l.hp || 0) + (l.cageHP || 0);
          for (const k of HP_OBJECTS) if (l[k]?.hp > 0) n += l[k].hp;
          for (const k of HP_LISTS) if (Array.isArray(l[k])) for (const o of l[k]) if (o.hp > 0) n += o.hp;
          if (l.grid) for (const v of l.grid.cells) if (v) n++;
          return n;
        },
        continue() { l.continueRun(); },
        // End-of-step geometry as the physics modelled it: the last world, each target advanced by its own velocity.
        snapshot() {
          const c = caps.at(-1); if (!c) return null; // no ball physics ran this tick (cut-scene / flight phases)
          const time = this.dt / caps.length * c.scale, shapes = [];
          for (const t of c.w.targets || []) if (liveSolid(t)) for (const e of shapesOf(t, ramOf(t))) shapes.push(time && (t.vx || t.vy) ? { ...e, dx: (t.vx || 0) * time, dy: (t.vy || 0) * time } : e);
          extra.shapes?.(l, shapes);
          return { grid: l.grid, ramCell, shapes };
        },
      };
    },
  };
}
// Vault / Mooncoil: the serpent is a chain of solid circles while it hunts (ballVsSnake in src/vault.js).
const serpent = (l, out) => {
  if (l.phase !== 'rescue' || !l.snakePoints) return;
  const pts = l.snakePoints(), g = l.growth();
  pts.forEach((p, i) => { if (p.y >= l.grid.oy) out.push({ id: i ? 'serpent' : 'serpent-head', s: { type: 'circle', x: p.x, y: p.y, r: (i === 0 ? 11 : Math.max(4, 8 - i * 0.5)) * g } }); });
};

// ---------- standalone fantasy models (src/fantasy/*.js) ----------
// World size as src/fantasy/chapter.js derives it for the main game: height = max(700, H - hudTop), paddle 90..120 above.
const fantasyWorld = phone => { const height = Math.max(700, phone.H - 34); return { width: 360, height, paddleY: height - Math.min(120, Math.max(90, 126 / phone.scale)) }; };

function bellforge() {
  let C, rampPose;
  return {
    name: 'bellforge', kind: 'fantasy',
    async init() { const m = await import(new URL('fantasy/bellforge.js', SRC)); C = m.Bellforge; rampPose = m.rampPose; },
    make(phone, difficulty) {
      const m = new C({ ...fantasyWorld(phone), difficulty });
      return {
        level: m, dt: 1 / 120, nominal: 345,
        step() { m.update(this.dt); },
        timeFactor() { return 1; },
        get state() { return m.state; }, get lives() { return m.lives; }, get time() { return m.time; },
        balls() { return m.balls; },
        active(b) { return !b.dead && !b.caught && m.phase !== 'breach'; }, // breach freezes balls without catching them
        bounds() { return { left: 0, right: m.width, top: 12, bottom: m.height }; },
        paddle() { const p = m.paddle; return { x: p.x, top: p.y, w: p.w, h: p.h, stunned: false }; },
        serving() { return m.phase === 'serve' && m.state === 'play'; },
        serve(angle) { m.launch(-Math.PI / 2 + angle); },
        control(x) { if (x !== null) m.setTarget(x); },
        continue() { m.continued = false; m.continue(); }, // as src/fantasy/chapter.js continueRun
        progress() { return m.score + m.villain.hp + m.bricks.reduce((n, b) => n + Math.max(0, b.hp), 0) + m.bells.reduce((n, b) => n + Math.max(0, b.hp), 0); },
        snapshot() {
          const shapes = [];
          for (const b of m.bricks) if (b.hp > 0) shapes.push({ id: b.id, ram: b.type === 'brick', s: { type: 'rect', x: b.x, y: b.y, w: b.w, h: b.h } }); // ramp pins stay solid to a ram
          if (m.villain.hp > 0) for (const s of m.villain.body) shapes.push({ id: 'korr', s });
          for (const r of m.ramps) { const q = rampPose(r); shapes.push({ id: r.id, s: { type: 'capsule', a: q.a, b: q.b, r: r.thickness / 2 } }); }
          for (const b of m.bells) if (!b.dead && b.hp > 0) shapes.push({ id: `bell-${b.id}`, s: { type: 'circle', x: b.x, y: b.y, r: b.r } });
          return { shapes };
        },
      };
    },
  };
}

function tidewheel() {
  let C;
  return {
    name: 'tidewheel', kind: 'fantasy',
    async init() { C ||= await load('fantasy/tidewheel.js', 'Tidewheel'); },
    make(phone, difficulty) {
      const m = new C({ ...fantasyWorld(phone), difficulty });
      return {
        level: m, dt: 1 / 120, nominal: 345,
        step() { m.update(this.dt); },
        timeFactor() { return 1; },
        threats() { return m.pulses.filter(q => !q.reflected); },
        get state() { return m.state; }, get lives() { return m.lives; }, get time() { return m.time; },
        balls() { return m.balls; },
        active(b) { return !b.dead && !b.caught && m.phase !== 'rescue' && m.phase !== 'complete'; }, // rescue freezes balls without catching them
        bounds() { return { left: 12, right: m.width - 12, top: 67, bottom: m.height }; },
        paddle() { const p = m.paddle; return { x: p.x, top: p.y - p.h / 2, w: p.w, h: p.h, stunned: false }; },
        serving() { return m.phase === 'serve' && m.state === 'play' && m.balls.some(b => b.caught); },
        serve(angle) { m.launch(-Math.PI / 2 + angle); },
        control(x) { if (x !== null) m.setTarget(x); },
        continue() { m.continued = false; m.continue(); }, // as src/fantasy/chapter.js continueRun
        progress() { return m.score + m.villain.hp + m.bricks.reduce((n, b) => n + Math.max(0, b.hp), 0) + m.gates.reduce((n, g) => n + Math.max(0, g.hp), 0) + m.rafts.reduce((n, r) => n + Math.max(0, r.braceHP), 0); },
        snapshot() { return { shapes: m.targets(0).filter(liveSolid).flatMap(t => shapesOf(t, t.kind === 'brick')) }; }, // a ram ploughs raft bricks only
      };
    },
  };
}

function gatehouse() {
  let C, rampPose;
  return {
    name: 'gatehouse', kind: 'fantasy',
    async init() { const m = await import(new URL('fantasy/gatehouse.js', SRC)); C = m.Gatehouse; rampPose = (await import(new URL('fantasy/bellforge.js', SRC))).rampPose; },
    make(phone, difficulty) {
      const m = new C({ ...fantasyWorld(phone), difficulty });
      return {
        level: m, dt: 1 / 120, nominal: 345,
        step() { m.update(this.dt); },
        timeFactor() { return 1; },
        get state() { return m.state; }, get lives() { return m.lives; }, get time() { return m.time; },
        balls() { return m.balls; },
        active(b) { return !b.dead && !b.caught && m.phase === 'play'; },
        bounds() { return { left: 0, right: m.width, top: m.ceiling, bottom: m.height }; },
        paddle() { const p = m.paddle; return { x: p.x, top: p.y, w: p.w, h: p.h, stunned: p.stun > 0 }; },
        serving() { return m.phase === 'serve' && m.state === 'play'; },
        serve(angle) { m.launch(-Math.PI / 2 + angle); },
        control(x) { if (x !== null) m.setTarget(x); },
        continue() { m.continued = false; m.continue(); },
        progress() { return m.score + m.floor * 1000 + m.villain.hp + (m.wheel?.notches || 0) + [...m.bricks, ...m.housings, ...m.bells].reduce((n, b) => n + Math.max(0, b.hp), 0); },
        snapshot() {
          const shapes = [];
          // only ordinary bricks yield to a ram ball; armour, housings, gate, wheel and Korr stay solid
          for (const t of m.targets()) if (!(t.item?.hp <= 0)) shapes.push(...shapesOf(t, t.kind === 'brick' && t.item.type === 'brick').map(e => ({ ...e, pierceable: false })));
          for (const r of m.ramps) { const q = rampPose(r); shapes.push({ id: r.id, pierceable: false, s: { type: 'capsule', a: q.a, b: q.b, r: r.thickness / 2 } }); }
          for (const b of m.bells) if (!b.dead) shapes.push({ id: `bell-${b.id}`, pierceable: false, s: { type: 'circle', x: b.x, y: b.y, r: b.r } });
          return { shapes };
        },
      };
    },
  };
}

// Serpent Rivals: bricks yield to a ram ball; lures, the Seal, the hatch bars and both serpents' body circles stay solid.
function rivals() {
  let C;
  return {
    name: 'rivals', kind: 'fantasy',
    async init() { C ||= await load('fantasy/rivals.js', 'SerpentRivals'); },
    make(phone, difficulty) {
      const m = new C({ ...fantasyWorld(phone), difficulty });
      return {
        level: m, dt: 1 / 120, nominal: 345,
        step() { m.update(this.dt); },
        timeFactor() { return 1; },
        get state() { return m.state; }, get lives() { return m.lives; }, get time() { return m.time; },
        balls() { return m.balls; },
        active(b) { return !b.dead && !b.caught && m.phase === 'play'; },
        bounds() { return { left: 0, right: m.width, top: 12, bottom: m.height }; },
        paddle() { const p = m.paddle; return { x: p.x, top: p.y, w: p.w, h: p.h, stunned: false }; },
        serving() { return m.phase === 'serve' && m.state === 'play'; },
        serve(angle) { m.launch(-Math.PI / 2 + angle); },
        control(x) { if (x !== null) m.setTarget(x); },
        continue() { m.continued = false; m.continue(); },
        progress() { return m.score + m.floor * 1000 + (m.seal ? m.seal.hp + m.seal.ward : 0) + m.bricks.reduce((n, b) => n + Math.max(0, b.hp), 0); },
        snapshot() {
          const shapes = [];
          for (const t of m.targets()) if (!(t.item?.hp <= 0)) shapes.push(...shapesOf(t, t.kind === 'brick' && t.item.type === 'brick').map(e => ({ ...e, pierceable: t.kind === 'brick' && t.item.type === 'brick' ? undefined : false })));
          for (const s of m.snakeTargets()) shapes.push({ id: `${s.lunge.snake}-${s.head ? 'head' : 'body'}`, pierceable: false, s: { type: 'circle', x: s.b.x, y: s.b.y, r: s.r } });
          return { shapes };
        },
      };
    },
  };
}

// Lumi Breaks Out: bricks yield to a ram ball; cage bars, the roof bell and Gnash's body circles stay solid.
function lumitower() {
  let C;
  return {
    name: 'lumitower', kind: 'fantasy',
    async init() { C ||= await load('fantasy/lumitower.js', 'LumiTower'); },
    make(phone, difficulty) {
      const m = new C({ ...fantasyWorld(phone), difficulty });
      return {
        level: m, dt: 1 / 120, nominal: 345,
        step() { m.update(this.dt); },
        timeFactor() { return 1; },
        get state() { return m.state; }, get lives() { return m.lives; }, get time() { return m.time; },
        balls() { return m.balls; },
        active(b) { return !b.dead && !b.caught && m.phase === 'play'; },
        bounds() { return { left: 0, right: m.width, top: 12, bottom: m.height }; },
        paddle() { const p = m.paddle; return { x: p.x, top: p.y, w: p.w, h: p.h, stunned: false }; },
        serving() { return m.phase === 'serve' && m.state === 'play'; },
        serve(angle) { m.launch(-Math.PI / 2 + angle); },
        control(x) { if (x !== null) m.setTarget(x); },
        continue() { m.continued = false; m.continue(); },
        progress() { return m.score + m.floor * 1000 + (m.bell ? m.bell.rings * 50 : 0) + m.bricks.reduce((n, b) => n + Math.max(0, b.hp), 0); },
        snapshot() {
          const shapes = [];
          for (const t of m.targets()) if (!(t.item?.hp <= 0)) shapes.push(...shapesOf(t, t.kind === 'brick' && t.item.type === 'brick').map(e => ({ ...e, pierceable: t.kind === 'brick' && t.item.type === 'brick' ? undefined : false })));
          for (const s of m.snakeTargets()) shapes.push({ id: `gnash-${s.head ? 'head' : 'body'}`, pierceable: false, s: { type: 'circle', x: s.b.x, y: s.b.y, r: s.r } });
          return { shapes };
        },
      };
    },
  };
}

export const ADAPTERS = [
  arena('carrier', 'carrier.js', 'Carrier'),
  arena('vault', 'vault.js', 'Vault', { shapes: serpent }),
  { ...arena('relay', 'relay.js', 'Relay'), seeds: 2 }, // its own targets() costs ~1 ms per call: ~140 ms per simulated second
  arena('orbital', 'orbital.js', 'Orbital'),
  arena('frost', 'frost.js', 'Frost'),
  arena('mooncoil', 'mooncoil.js', 'Mooncoil', { shapes: serpent }),
  bellforge(),
  tidewheel(),
  gatehouse(),
  lumitower(),
  rivals(),
];
