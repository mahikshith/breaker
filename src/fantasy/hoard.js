import { sweepTarget, overlapsTarget } from '../carrier-physics.js';
import { reflect } from './bellforge.js';
import { SPEED, BALL_R, RAM, BACK_WARD, paddleBounce, tickRam, ramThrough, powerTitle } from './ram.js';
import { plural, hpLeft } from '../near-miss.js';
import { Sitter } from './creatures/sitter.js';
import { EMBER } from './creatures/ember.js';
import { ejectBall, paddleRoom } from '../clearance.js';

// Dragon's Hoard: Kit robs Ember, a vain dragon asleep on his hoard behind the cave ledge (scenery: the ledge is the
// ceiling, Ember never collides). Gold opens Ember's Wake eye; Hush Chimes close it. Floor 1 hides the Crown chest in the
// coin mound, floor 2 ends on the greed choice (run now, or stay and loot for x1.5/x2 while the eye creeps open), floor 3
// is the avalanche: the hoard slides down a row at a time while Kit breaks the cave gate in the ceiling.
// Ember is the first "big sitter" boss (src/fantasy/creatures/sitter.js, skin src/fantasy/creatures/ember.js): his tells,
// poses and moods run on the shared archetype; this file owns what is Ember's job here (the eye, greed, the hoard).
// Design: design/phase2/dragons-hoard.md (merged spec at the top).
const STEP = 1 / 240;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// wakeAt: gold units (coin 1, chest 2) from a closed eye to 100. chime: eye points a lit Hush Chime takes back.
// Ember's tell, release and calm are his skin's numbers. roar: floor-2 roar interval. hazard: floor-3 breath/roar interval. march: floor-3 slide interval.
// crown / weight / gate: goal HP. molten: seconds before molten gold hardens. stay: eye points per second while greedy.
export const HOARD_MODES = {
  easy: { wakeAt: 12, chime: 25, roar: 9.5, hazard: 7.5, march: 5.6, crown: 5, weight: 4, gate: 12, molten: 5, stay: 1.6, coreHits: 18 },
  medium: { wakeAt: 10, chime: 25, roar: 8.5, hazard: 6.5, march: 4.4, crown: 6, weight: 5, gate: 18, molten: 4, stay: 2.2, coreHits: 22 },
  hard: { wakeAt: 8, chime: 20, roar: 7.5, hazard: 5.5, march: 3.9, crown: 7, weight: 6, gate: 23, molten: 3.2, stay: 2.8, coreHits: 26 },
};
export const HOARD_FLOORS = ['Coin mound', 'Ember stirs', 'Avalanche'];
export const HOARD_TIMING = { climb: 1.2, escape: 2.6, ward: 6, volley: 2.5, arrows: 5, wide: 8, chimeCool: 8, scorch: 3, stripe: 72,
  reset: 40, yawn: 6, slide: .35, lift: .6, liftRows: 3, firstHazard: 5 };
// Greed: gold units collected after choosing to stay -> multiplier. Rage on floor 3 from the eye at the end of floor 2.
export const GREED = { steps: [4, 8], mult: [1, 1.5, 2], spill: 10 };
export const RAGE = { at: [40, 75], march: [1, .88, .76], rows: [0, 1, 2] };
export const LOOT = { coin: 10, chest: 30, molten: 5 };
// Kit's menu ids -> model powers, for src/fantasy/chapter.js `kinds`.
export const HOARD_KINDS = { shield: 'ward', arrows: 'volley' };
export const CAPSULE_KINDS = ['multi', 'ram', 'wide'];
// Board: nine 32x16 columns on a 34u pitch leave 28u side lanes; 18u rows. `ceiling` is the cave ledge's underside.
// gap: the bottom row's distance above the paddle per floor. danger: floor 3's crash line above the paddle.
export const HOARD_LAYOUT = {
  cols: 9, pitch: 34, bw: 32, bh: 16, rowPitch: 18, ceiling: 150, gap: [186, 186, 230], danger: 120,
  // Floor 2: two counterweights hang under the ledge (the Gatehouse housing shapes: a body and its ring).
  weights: [58, 258], weight: { w: 44, h: 50, ring: 11 },
  // Floor 3: the cave gate is the ceiling span under the drawn double door.
  gate: { x: 196, w: 140, h: 62 },
};
// Maps, top row first. Ordinary glaze colours c v t b; g coin, G chest brick (2 hits, drops a capsule), h Hush Chime,
// K the Crown chest (one 3x3 block). Gold stays near 12% of a floor (yellow is an accent).
export const HOARD_MAPS = [
  ['.cvtbtvc.',
    'cgvbcbvgc',
    'tvbKKKbvt',
    'bchKKKhcb',
    'vtcKKKctv',
    'cbvgtgvbc',
    '.tcbGbct.',
    'gvtc.ctvg',
    'bcvtgtvcb',
    'tb.vGv.bt',
    'cvgbtbgvc',
    '.ctv.vtc.'],
  ['ctvb.bvtc',
    'vgcthtcgv',
    'bcvgGgvcb',
    't.bcvcb.t',
    'cvgtbtgvc',
    'hbvc.cvbh',
    'tcbvgvbct',
    'vg.tct.gv',
    'cbvbGbvbc',
    '.tcv.vct.'],
  ['cvtbgbtvc',
    'bGcvtvcGb',
    'tvgbcbgvt',
    'cbvtGtvbc',
    'vtcgbgctv',
    'gcbvtvbcg',
    'bvtcgctvb',
    'ctbvcvbtc',
    '.vcbtbcv.'],
];
const ORDINARY = new Set(['brick', 'coin', 'molten']);   // what a live Ram ploughs through
const MELTS = new Set(['brick', 'coin']);

export class DragonsHoard {
  constructor({ width = 360, height = 700, difficulty = 'easy', paddleY = height - 90, floor = 0 } = {}) {
    if (!Number.isFinite(width) || !Number.isFinite(height) || width < 360 || height < 700 || !Number.isFinite(paddleY) || paddleY > height - 30 || paddleY < 580) throw new RangeError("Dragon's Hoard needs its full portrait playfield");
    this.width = width; this.height = height; this.difficulty = Object.hasOwn(HOARD_MODES, difficulty) ? difficulty : 'medium';
    this.rules = HOARD_MODES[this.difficulty]; this.time = 0; this.serial = 0; this.lives = 3; this.score = 0;
    this.state = 'play'; this.paused = false; this.continued = false; this.reason = ''; this.effects = [];
    this.charge = 0; this.chargeBank = 0; this.ward = null; this.volley = null; this.shots = []; this.capsules = [];
    this.wake = 0; this.wakes = 0; this.loot = 0; this.banked = 0; this.mult = 1; this.greed = null; this.rage = 0; this.capsuleSerial = 0;
    this.taught = { roar: false, breath: false };
    this.paddle = { x: width / 2, px: width / 2, y: paddleY, w: 100, baseW: 100, wide: 0, scorch: 0, h: 14, targetX: width / 2, vx: 0, stun: 0, streak: 0, armed: false };
    this.buildFloor(clamp(floor | 0, 0, 2));
  }
  // ---------- floors ----------
  get ceiling() { return HOARD_LAYOUT.ceiling; }
  get dangerY() { return this.paddle.y - HOARD_LAYOUT.danger; }
  colX(col) { const L = HOARD_LAYOUT; return (this.width - (L.cols * L.pitch - (L.pitch - L.bw))) / 2 + col * L.pitch; }
  buildFloor(n) {
    const L = HOARD_LAYOUT, map = HOARD_MAPS[n], rows = map.length, C = L.ceiling;
    this.floor = n; this.floorTime = 0; this.active = false; this.phase = 'serve'; this.transition = 0;
    this.capsules = []; this.shots = []; this.slide = null; this.fieldDy = 0; this.march = null; this.gate = null; this.transitionKind = '';
    this.ember = new Sitter(EMBER, this.difficulty);
    this.nextHazard = n === 0 ? Infinity : HOARD_TIMING.firstHazard + (n === 1 ? 1 : 0);
    if (n === 2) { this.wake = 100; this.march = { next: this.rules.march * RAGE.march[this.rage] }; }
    const bottom = this.paddle.y - L.gap[n] + (n === 2 ? RAGE.rows[this.rage] * L.rowPitch : 0);
    this.rowTop = row => bottom - (rows - row) * L.rowPitch + (L.rowPitch - L.bh);
    const bricks = [];
    for (let row = 0; row < rows; row++) for (let col = 0; col < L.cols; col++) {
      const ch = map[row][col], x = this.colX(col), y = this.rowTop(row);
      if (ch === '.') continue;
      if (ch === 'K') {
        if (map[row - 1]?.[col] === 'K' || map[row][col - 1] === 'K') continue;   // the block's top-left cell builds it
        bricks.push(this.makeBrick('crown', x, y, 2 * L.pitch + L.bw, 2 * L.rowPitch + L.bh, this.rules.crown, row, col, { field: true }));
        continue;
      }
      const kind = { g: 'coin', G: 'chest', h: 'chime' }[ch] || 'brick';
      bricks.push(this.makeBrick(kind, x, y, L.bw, L.bh, kind === 'chest' ? 2 : 1, row, col, { colour: kind === 'brick' ? ch : undefined, field: true, cool: 0, lit: kind === 'chime' }));
    }
    if (n === 1) for (const [i, x] of L.weights.entries()) {
      const W = L.weight, b = this.makeBrick('weight', x, C, W.w, W.h, this.rules.weight, -1, i, { field: false });
      // The Gatehouse housing contract: the ring (centred, `ring` tall) sits on the ledge, the iron-banded body hangs below it.
      b.shape = { shapes: [{ type: 'rect', x, y: C + W.ring, w: W.w, h: W.h - W.ring }, { type: 'rect', x: x + (W.w - W.ring) / 2, y: C, w: W.ring, h: W.ring }] };
      bricks.push(b);
    }
    if (n === 2) this.gate = { x: L.gate.x, y: C - L.gate.h, w: L.gate.w, h: L.gate.h, hp: this.rules.gate, maxHP: this.rules.gate };
    this.bricks = bricks; this.startTop = Math.min(...bricks.filter(b => b.field).map(b => b.y));
    this.makeServe();
  }
  makeBrick(kind, x, y, w, h, hp, row, col, extra = {}) {
    return { id: `${kind}-${this.floor}-${row}-${col}`, kind, x, y, w, h, hp, maxHP: hp, row, col, shape: { type: 'rect', x, y, w, h }, ...extra };
  }
  setTarget(x) { if (!Number.isFinite(x)) return false; this.paddle.targetX = clamp(x, this.paddle.w / 2 + 6, this.width - this.paddle.w / 2 - 6); return true; }
  pause(value) { this.paused = !!value; }
  makeServe() { this.phase = 'serve'; this.serveTime = 0; this.balls = [this.newBall(this.paddle.x, this.paddle.y - 8, 0, 0, true)]; }
  newBall(x, y, vx, vy, caught = false) { return { id: ++this.serial, x, y, px: x, py: y, vx, vy, r: BALL_R, caught, dead: false, ram: 0, ramBricks: 0, contacts: new Set() }; }
  launch(angle = -Math.PI / 2) {
    if (this.paused || this.state !== 'play' || this.phase !== 'serve' || !Number.isFinite(angle)) return false;
    const a = clamp(angle, -Math.PI + .25, -.25), b = this.balls[0];
    b.caught = false; b.vx = Math.cos(a) * SPEED; b.vy = Math.sin(a) * SPEED;
    this.phase = 'play'; this.active = true; this.backHold = false; return true;
  }
  ramPierce(brick) { return ORDINARY.has(brick?.kind); }
  // ---------- Kit's powers ----------
  canActivate(id = 'ward', { ignorePause = false } = {}) {
    if (!(ignorePause || !this.paused) || this.state !== 'play' || !['play', 'serve'].includes(this.phase) || this.charge < 100 - 1e-7) return false;
    if (id === 'ward' || id === 'echo') return !this.ward;
    return id === 'volley' && !this.volley;
  }
  activate(id = 'ward') {
    if (!this.canActivate(id)) return false;
    this.charge = 0; this.chargeBank = 0;
    if (id === 'volley') { this.volley = { time: HOARD_TIMING.volley, remaining: HOARD_TIMING.arrows, next: 0 }; this.effect(this.paddle.x, this.paddle.y, 'volley', .5); }
    else { this.ward = { y: this.paddle.y + 24, remaining: HOARD_TIMING.ward }; this.effect(this.width / 2, this.ward.y, 'ward-deploy', .4); }
    return true;
  }
  // ---------- the greed choice (floor 2) ----------
  choose(kind) {
    if (this.state !== 'play' || this.phase !== 'greed') return false;
    if (kind === 'run') { this.effect(this.width / 2, this.ceiling, 'run', .8); this.finishFloor('run'); return true; }
    if (kind !== 'stay') return false;
    this.greed = { gold: 0, at: this.time }; this.phase = 'play'; this.spill(); this.effect(this.width / 2, this.ceiling + 40, 'stay', .9); return true;
  }
  // Staying shakes loose a vein: coins fill empty cells from the top row down until the pile holds GREED.spill gold units,
  // so x2 is always within reach. A cell a ball is in (or next to) stays empty.
  spill() {
    const L = HOARD_LAYOUT, map = HOARD_MAPS[this.floor]; let gold = this.goldLeft();
    for (let row = 0; row < map.length && gold < GREED.spill; row++) for (let col = 0; col < L.cols && gold < GREED.spill; col++) {
      if (this.bricks.some(b => b.field && b.hp > 0 && b.row === row && b.col === col)) continue;
      const x = this.colX(col), y = this.rowTop(row) + this.fieldDy;
      if (this.balls.some(b => b.x > x - b.r - 2 && b.x < x + L.bw + b.r + 2 && b.y > y - b.r - 2 && b.y < y + L.bh + b.r + 2)) continue;
      const coin = this.makeBrick('coin', x, y, L.bw, L.bh, 1, row, col, { field: true, cool: 0, spilled: true }); coin.id += '-' + ++this.serial;
      this.bricks.push(coin); gold++; this.effect(x + L.bw / 2, y + L.bh / 2, 'spill', .6);
    }
  }
  goldLeft() { let n = 0; for (const b of this.bricks) if (b.hp > 0) n += this.goldUnits(b.kind); return n; }
  // Tap RUN while staying greedy: escape at the multiplier earned so far.
  run() { if (this.state !== 'play' || !this.greed || this.floor !== 1 || !['play', 'serve'].includes(this.phase)) return false; this.effect(this.width / 2, this.ceiling, 'run', .8); this.finishFloor('run'); return true; }
  // ---------- simulation ----------
  update(dt) {
    if (this.paused || this.state !== 'play' || !Number.isFinite(dt) || dt <= 0) return;
    let left = Math.min(.1, dt);
    while (left > 1e-9 && this.state === 'play') { const h = Math.min(STEP, left); this.step(h); left -= h; }
  }
  step(dt) {
    const p = this.paddle; p.px = p.x;
    if (p.wide > 0) p.wide -= dt;
    if (p.scorch > 0) p.scorch -= dt;
    const want = (p.wide > 0 ? 140 : p.baseW) * (p.scorch > 0 ? .75 : 1);   // WIDE never lands on a ball beside the paddle
    p.w = want > p.w ? 2 * paddleRoom(p.x, p.w / 2, want / 2, p.y, p.y + p.h, this.balls) : want;
    p.x += clamp(p.targetX - p.x, -900 * dt, 900 * dt); p.x = clamp(p.x, p.w / 2 + 6, this.width - p.w / 2 - 6);
    p.vx = (p.x - p.px) / dt;
    for (const fx of this.effects) fx.age += dt;
    this.effects = this.effects.filter(f => f.age < f.life);
    if (this.phase === 'climb' || this.phase === 'escape') return this.updateTransition(dt);
    if (this.phase === 'greed') { this.time += dt; return; }   // the choice card freezes play (balls hold their flight)
    if (this.phase === 'serve') {
      const b = this.balls[0]; b.px = b.x; b.py = b.y; b.x = p.x; b.y = p.y - 8;
      if (!this.backHold) { this.serveTime += dt; if (this.serveTime >= (this.active ? 3 : 8)) this.launch(-Math.PI / 2 + .15); }   // after a Continue the serve waits for the player
    }
    if (!this.active) return;
    this.time += dt; this.floorTime += dt;
    const credit = Math.min(this.chargeBank, dt, (100 - this.charge) * this.rules.coreHits / 100);
    this.chargeBank -= credit; this.charge = Math.min(100, this.charge + credit / this.rules.coreHits * 100);
    if (this.charge > 100 - 1e-7) { this.charge = 100; this.chargeBank = 0; }
    if (this.ward && (this.ward.remaining -= dt) <= 0) this.ward = null;
    for (const b of this.bricks) {
      if (b.kind === 'chime' && b.cool > 0 && (b.cool -= dt) <= 0) { b.lit = true; this.effect(b.x + b.w / 2, b.y + b.h / 2, 'chime-ready', .5); }
      if (b.kind === 'molten' && b.hp > 0 && (b.molten -= dt) <= 0) { b.kind = 'hard'; b.hp = b.maxHP = 2; this.effect(b.x + b.w / 2, b.y + b.h / 2, 'harden', .5); }
    }
    if (this.greed && this.floor === 1) { this.addWake(this.rules.stay * dt, true); if (this.phase !== 'play' && this.phase !== 'serve') return; }
    this.updateEmber();
    this.ember.setPose(this.emberFace(), this.balls, (x, y) => x >= 6 && x <= this.width - 6 && y >= this.ceiling + 6);
    if (this.floor === 2) { this.updateMarch(dt); if (this.state !== 'play') return; }
    for (const c of this.capsules) this.moveCapsule(c, dt);
    this.capsules = this.capsules.filter(c => !c.dead);
    this.updateVolley(dt);
    for (const b of this.balls) if (!b.caught && !b.dead) { this.moveBall(b, dt); if (this.phase !== 'play') return; }
    this.balls = this.balls.filter(b => !b.dead);
    if (!this.balls.length) {
      this.lives--; p.streak = 0; this.ember.feel('lost', this.time); this.effect(p.x, p.y, 'ball-lost', .6);
      if (this.lives <= 0) this.lose('Ember kept his gold'); else this.makeServe();
    }
  }
  // Floor clear: freeze play, then climb (floors 1-2) or run for the cave mouth (floor 3).
  finishFloor(kind = '') {
    this.capsules = []; this.shots = []; this.volley = null; this.ward = null; this.slide = null;
    for (const b of this.balls) { b.vx = 0; b.vy = 0; b.caught = true; b.ram = 0; b.r = BALL_R; }
    this.balls = this.balls.slice(0, 1); this.transitionKind = kind;
    if (this.floor === 2) {
      this.banked = Math.round(this.loot * this.mult); this.score += this.banked;
      this.phase = 'escape'; this.transition = HOARD_TIMING.escape; this.effect(this.gate.x + this.gate.w / 2, this.ceiling, 'escape', this.transition, { banked: this.banked, mult: this.mult }); return;
    }
    if (this.floor === 1) this.rage = kind === 'caught' ? 2 : this.wake >= RAGE.at[1] ? 2 : this.wake >= RAGE.at[0] ? 1 : 0;
    this.phase = 'climb'; this.transition = HOARD_TIMING.climb;
    if (this.floor === 0) this.effect(this.width / 2, this.ceiling + 60, 'crown-grab', this.transition);
  }
  updateTransition(dt) {
    this.time += dt; this.transition = Math.max(0, this.transition - dt);
    if (this.transition) return;
    if (this.phase === 'escape') { this.state = 'won'; return; }
    this.buildFloor(this.floor + 1); this.active = true;
  }
  // ---------- Ember ----------
  goldUnits(kind) { return kind === 'chest' ? 2 : kind === 'coin' ? 1 : 0; }
  // Gold opens the eye (floors 1-2). While a chime has him calm, gold adds nothing. passive: the greedy stay's creep.
  addWake(points, passive = false) {
    if (this.floor === 2 || points <= 0) return;
    if (!passive && this.ember.calmAt(this.floorTime)) return;
    this.wake = Math.min(100, this.wake + points);
    if (this.greed && this.wake >= 100) this.caught();
  }
  caught() {
    this.wakes++; this.mult = 1; this.greed.caught = true;
    this.effect(this.width / 2, this.ceiling, 'caught', 1.2); this.finishFloor('caught');
  }
  updateEmber() {
    const e = this.ember, ev = e.tick(this.floorTime);
    if (ev === 'release') return this.release();
    if (ev || e.busy) return;
    if (this.floor < 2 && this.wake >= 100 && !this.greed) return this.windup('wake');
    if (this.floorTime < this.nextHazard) return;
    if (this.floor === 1) return this.windup('roar');
    if (this.floor === 2) return this.windup(this.hazardTurn++ % 2 ? 'roar' : 'breath');
  }
  get hazardTurn() { return this._turn || 0; }
  set hazardTurn(v) { this._turn = v; }
  // A tell: a roar marks a scorch stripe where the paddle is now; a breath marks the row nearest the ball.
  windup(kind) {
    const e = this.ember, p = this.paddle, fire = kind === 'breath' ? 'breath' : 'roar', teaching = !this.taught[fire]; this.taught[fire] = true;
    const stripe = kind !== 'breath' ? { x: clamp(p.x, HOARD_TIMING.stripe / 2, this.width - HOARD_TIMING.stripe / 2), w: HOARD_TIMING.stripe } : null;
    const row = kind !== 'roar' ? (kind === 'breath' ? this.breathRow() : this.lowestRow()) : null;
    e.windup(kind, this.floorTime, { stripe, row }, teaching);
    this.effect(stripe ? stripe.x : this.width / 2, stripe ? p.y : this.rowY(row), kind === 'breath' ? 'breath-warning' : 'roar-warning', e.n.tell, { teaching, row, kind });
  }
  release() {
    const e = this.ember, p = this.paddle, { stripe, row } = e.payload;
    if (stripe) {
      const hit = !e.teaching && Math.abs(p.x - stripe.x) < p.w / 2 + stripe.w / 2;
      if (hit) { p.scorch = HOARD_TIMING.scorch; this.effect(p.x, p.y, 'scorch', .8); }
      this.effect(stripe.x, p.y, 'roar', .8, { teaching: e.teaching, hit });
    }
    if (row !== null && !e.teaching) this.melt(row);
    if (row !== null) this.effect(this.width / 2, this.rowY(row), 'breath', .7, { row, teaching: e.teaching });
    if (e.kind === 'wake') { this.wake = HOARD_TIMING.reset; this.wakes++; }
    else this.nextHazard = this.floorTime + e.n.release + (this.floor === 2 ? this.rules.hazard : this.rules.roar * (this.greed ? .8 : 1));
    if (e.teaching) this.effect(this.width / 2, this.ceiling + 20, 'yawn', 1.2);
  }
  rowsWith(set) { const rows = new Map(); for (const b of this.bricks) if (b.hp > 0 && b.field && set.has(b.kind)) rows.set(b.row, (rows.get(b.row) || 0) + 1); return rows; }
  rowY(row) { const b = this.bricks.find(q => q.row === row && q.field); return b ? b.y + b.h / 2 : this.ceiling + 40; }
  // The wake roar's breath lands on the lowest row with three or more meltable bricks (else the fullest one).
  lowestRow() { const rows = [...this.rowsWith(MELTS)]; if (!rows.length) return null; const full = rows.filter(([, n]) => n >= 3); return (full.length ? full : rows).reduce((a, q) => q[0] > a[0] ? q : a)[0]; }
  // Floor 3's breath tracks the ball: the meltable row nearest the lowest live ball.
  breathRow() {
    const rows = [...this.rowsWith(MELTS).keys()]; if (!rows.length) return null;
    const ball = this.balls.filter(b => !b.dead).reduce((a, b) => !a || b.y > a.y ? b : a, null), y = ball ? ball.y : this.paddle.y;
    return rows.reduce((a, r) => Math.abs(this.rowY(r) - y) < Math.abs(this.rowY(a) - y) ? r : a);
  }
  melt(row) {
    for (const b of this.bricks) if (b.row === row && b.field && b.hp > 0 && MELTS.has(b.kind)) {
      b.kind = 'molten'; b.hp = b.maxHP = 1; b.molten = this.rules.molten; b.moltenFor = this.rules.molten;
      this.effect(b.x + b.w / 2, b.y + b.h / 2, 'melt', .5);
    }
  }
  // Pure: Ember's pose now (a sitter pose name; the skin maps it to art). The Hoard's own moments override the archetype.
  emberFace() {
    const over = this.state === 'won' || this.phase === 'escape' ? 'defeat' : this.phase === 'climb' && this.transitionKind === 'caught' ? 'breath' : this.phase === 'greed' ? 'panic' : null;
    const rest = this.floor === 2 ? (this.gate && this.gate.hp / this.gate.maxHP < .35 ? 'panic' : 'stir') : this.wake >= 60 ? 'stir' : 'sleep';
    return this.ember.choose({ t: this.time, override: over, rest });
  }
  // ---------- floor 3: the avalanche ----------
  updateMarch(dt) {
    const m = this.march;
    if (this.slide) this.updateSlide(dt);
    else if (this.floorTime >= m.next) { this.startSlide(HOARD_LAYOUT.rowPitch, HOARD_TIMING.slide); m.next = this.floorTime + this.rules.march * RAGE.march[this.rage]; this.effect(this.width / 2, this.fieldBottom(), 'slide', .5); }
  }
  startSlide(dist, time) { this.slide = { left: dist, speed: Math.abs(dist) / time }; }
  updateSlide(dt) {
    const s = this.slide, d = Math.sign(s.left) * Math.min(Math.abs(s.left), s.speed * dt);
    s.left -= d; this.moveField(d);
    if (Math.abs(s.left) > 1e-9) return;
    this.slide = null;
    if (d > 0 && this.fieldBottom() >= this.dangerY) this.crash();
  }
  fieldBottom() { let y = -Infinity; for (const b of this.bricks) if (b.hp > 0 && b.field) y = Math.max(y, b.y + b.h); return y; }
  // The hoard moves in sub-unit steps; a brick that lands on a ball pushes it out along the shortest clear way.
  moveField(d) {
    this.fieldDy += d;
    for (const b of this.bricks) if (b.field) { b.y += d; b.shape.y = b.y; }
    const r0 = this.ceiling;
    for (const ball of this.balls) if (!ball.caught && !ball.dead) {
      const near = this.bricks.filter(b => b.hp > 0 && b.field && b.x - ball.r - 1 < ball.x && b.x + b.w + ball.r + 1 > ball.x && b.y - ball.r - 1 < ball.y && b.y + b.h + ball.r + 1 > ball.y).map(b => b.shape);
      if (near.length) ejectBall(ball, near, { ok: (x, y) => x >= ball.r && x <= this.width - ball.r && y >= r0 + ball.r });
    }
  }
  // The hoard reached the line: Kit loses a ball's worth of life and the pile is shoved back up three rows.
  crash() {
    this.lives--; this.ember.feel('crash', this.time); this.effect(this.width / 2, this.dangerY, 'avalanche', .9);
    if (this.lives <= 0) { this.lose('The hoard buried Kit'); return; }
    this.startSlide(-Math.min(HOARD_TIMING.liftRows * HOARD_LAYOUT.rowPitch, this.fieldDy), HOARD_TIMING.lift);
    this.march.next = Math.max(this.march.next, this.floorTime + HOARD_TIMING.lift + this.rules.march);
  }
  rowCleared(row) {
    if (this.floor !== 2 || this.bricks.some(b => b.field && b.hp > 0 && b.row === row)) return;
    const m = this.march, i = this.rules.march * RAGE.march[this.rage];
    m.next = Math.min(Math.max(m.next, this.floorTime) + i, this.floorTime + 2 * i); this.effect(this.width / 2, this.rowY(row), 'row-clear', .6);
  }
  // ---------- ball ----------
  // Everything a ball can touch, for the audit and tests (the gate is the ceiling span under the door).
  targets() {
    const t = [];
    for (const b of this.bricks) if (b.hp > 0) t.push({ id: b.id, kind: b.kind, item: b, ...b.shape });
    return t;
  }
  moveBall(b, dt) {
    b.px = b.x; b.py = b.y;
    const p = this.paddle, C = this.ceiling;
    for (const id of b.contacts) { const q = this.bricks.find(t => t.id === id); if (!q || q.hp <= 0 || !overlapsTarget({ ...b, r: b.r + .1 }, q.shape)) b.contacts.delete(id); }
    tickRam(this, b, dt);
    let left = dt;
    for (let pass = 0; pass < 8 && left > 1e-8 && !b.dead; pass++) {
      const from = { x: b.x, y: b.y }, to = { x: b.x + b.vx * left, y: b.y + b.vy * left }, hits = [], elapsed = 1 - left / dt;
      const add = (hit, kind, item) => { if (hit) hits.push({ ...hit, kind, item }); };
      if (b.vx < 0 && to.x < b.r) add({ t: (b.r - b.x) / (to.x - b.x), nx: 1, ny: 0 }, 'wall');
      if (b.vx > 0 && to.x > this.width - b.r) add({ t: (this.width - b.r - b.x) / (to.x - b.x), nx: -1, ny: 0 }, 'wall');
      if (b.vy < 0 && to.y < C + b.r) {
        const t = Math.max(0, (C + b.r - b.y) / (to.y - b.y)), x = b.x + (to.x - b.x) * t, g = this.gate;
        add({ t, nx: 0, ny: 1 }, g && g.hp > 0 && x > g.x && x < g.x + g.w ? 'gate' : 'wall', g);
      }
      // Broadphase: only bricks whose box meets the swept ball's box are swept.
      const x0 = Math.min(from.x, to.x) - b.r - 1, x1 = Math.max(from.x, to.x) + b.r + 1, y0 = Math.min(from.y, to.y) - b.r - 1, y1 = Math.max(from.y, to.y) + b.r + 1;
      for (const q of this.bricks) if (q.hp > 0 && q.x < x1 && q.x + q.w > x0 && q.y < y1 && q.y + q.h > y0) add(sweepTarget(from, to, b.r, q.shape), 'brick', q);
      if (this.ward && b.vy > 0 && to.y > this.ward.y - b.r) add({ t: Math.max(0, (this.ward.y - b.r - b.y) / (to.y - b.y)), nx: 0, ny: -1 }, 'ward');
      if (b.vy > 0 && b.y <= p.y + b.r) add(sweepTarget(from, to, b.r, { type: 'rect', x: p.px - p.w / 2, y: p.y, w: p.w, h: p.h, vx: p.vx }, elapsed * dt, left), 'paddle', p);
      hits.sort((a, q) => a.t - q.t); const hit = hits[0];
      if (!hit) { b.x = to.x; b.y = to.y; break; }
      b.x += (to.x - from.x) * hit.t; b.y += (to.y - from.y) * hit.t;
      if (hit.kind === 'brick' && ramThrough(this, b, hit.item)) { left *= 1 - hit.t; continue; }
      b.x += hit.nx * ((hit.depth || 0) + .015); b.y += hit.ny * ((hit.depth || 0) + .015);
      if (hit.kind === 'paddle') paddleBounce(this, b);
      else {
        const speed = Math.hypot(b.vx, b.vy); reflect(b, hit);
        const next = Math.hypot(b.vx, b.vy); if (next > 0) { b.vx *= speed / next; b.vy *= speed / next; }
        const key = hit.kind === 'brick' ? hit.item.id : undefined, fresh = key !== undefined && !b.contacts.has(key);
        if (fresh) b.contacts.add(key);
        if (fresh) this.hitBrick(hit.item, b);
        if (hit.kind === 'gate') { this.hitGate(b.ram > 0 ? RAM.damage : 1, b.x); if (b.ram > 0) powerTitle(this, 'RAM BREAKS THE GATE', b.x, b.y); }
        if (hit.kind === 'ward') this.effect(b.x, b.y, 'ward-bounce', .2);
      }
      if (this.phase !== 'play') return;
      left *= 1 - hit.t; if (hit.t < 1e-6) left = Math.max(0, left - 1e-5);
    }
    const speed = Math.hypot(b.vx, b.vy);
    if (speed && Math.abs(b.vy) < speed * .22) { b.vy = Math.sign(b.vy || 1) * speed * .22; b.vx = Math.sign(b.vx || 1) * Math.sqrt(speed * speed - b.vy * b.vy); }
    if (b.y - b.r > this.height) b.dead = true;
  }
  credit(n) { this.chargeBank = Math.min((100 - this.charge) * this.rules.coreHits / 100, this.chargeBank + n); }
  hitBrick(brick, ball) {
    if (brick.hp <= 0) return;
    const free = !(ball?.ram > 0) && !ball?.arrow, cx = brick.x + brick.w / 2, cy = brick.y + brick.h / 2, fx = { w: brick.w, h: brick.h, colour: brick.colour, type: brick.kind };
    if (brick.kind === 'chime') return this.strikeChime(brick);
    if (brick.kind === 'crown' || brick.kind === 'weight') {
      const n = Math.min(brick.hp, ball?.ram > 0 ? RAM.damage : 1); brick.hp -= n; this.score += 25 * n; this.ember.feel('treasure', this.time);
      if (free) this.credit(1);
      this.effect(cx, cy, brick.hp ? `${brick.kind}-hit` : `${brick.kind}-break`, brick.hp ? .4 : 1, { ...fx, hp: brick.hp, maxHP: brick.maxHP });
      if (brick.hp) return;
      if (brick.kind === 'crown') return this.finishFloor('crown');
      if (this.bricks.every(q => q.kind !== 'weight' || q.hp <= 0)) { this.ember.reset(); this.nextHazard = Math.max(this.nextHazard, this.floorTime + 3); this.phase = 'greed'; this.effect(this.width / 2, this.ceiling, 'exit-open', 1.2); }
      return;
    }
    brick.hp--;
    const gold = this.goldUnits(brick.kind);
    if (brick.hp > 0) { this.score += 5; if (free) this.credit(1); this.effect(cx, cy, 'brick-hit', .35, fx); return; }
    this.score += { coin: 30, chest: 60, molten: 40, hard: 15 }[brick.kind] || 10;
    if (free) this.credit(gold ? 2 : 1);
    if (gold || brick.kind === 'molten') {
      const loot = brick.kind === 'molten' ? LOOT.molten : LOOT[brick.kind]; this.loot += loot;
      this.effect(cx, cy, 'loot', .9, { ...fx, loot });
    }
    if (gold) {
      this.addWake(gold * 100 / this.rules.wakeAt);
      if (this.greed && this.floor === 1 && !this.greed.caught) { this.greed.gold += gold; const s = GREED.steps; this.mult = GREED.mult[this.greed.gold >= s[1] ? 2 : this.greed.gold >= s[0] ? 1 : 0]; }
    }
    // The pile picked clean: Kit runs on his own with the multiplier he earned.
    if (gold && this.greed && this.floor === 1 && !this.greed.caught && !this.goldLeft()) { this.effect(this.width / 2, this.ceiling, 'run', .8); this.effect(cx, cy, 'brick-break', .7, fx); return this.finishFloor('run'); }
    if (brick.kind === 'chest') { this.ember.feel('treasure', this.time); this.capsules.push({ id: ++this.serial, kind: CAPSULE_KINDS[this.capsuleSerial++ % CAPSULE_KINDS.length], x: cx, y: cy, dead: false }); }
    this.effect(cx, cy, 'brick-break', .7, fx);
    this.rowCleared(brick.row);
  }
  strikeChime(c) {
    this.score += 15; this.effect(c.x + c.w / 2, c.y + c.h / 2, c.lit ? 'chime' : 'chime-dim', c.lit ? 1.2 : .25);
    if (!c.lit) return false;
    c.lit = false; c.cool = HOARD_TIMING.chimeCool; this.ember.feel('chime', this.time);
    this.wake = Math.max(0, this.wake - this.rules.chime);
    // A lullaby calms him; during a tell it settles him: the roar fizzles, nothing lands.
    if (this.ember.hush(this.floorTime)) { this.nextHazard = Math.max(this.nextHazard, this.floorTime + 3); this.effect(this.width / 2, this.ceiling + 20, 'hush', 1); }
    return true;
  }
  hitGate(n, x = this.width / 2) {
    const g = this.gate; if (!g || g.hp <= 0) return;
    g.hp = Math.max(0, g.hp - n); this.score += 30 * n; this.ember.feel('treasure', this.time);
    this.effect(x, this.ceiling, g.hp ? 'gate-hit' : 'gate-break', g.hp ? .45 : 1.2, { hp: g.hp });
    if (!g.hp) this.finishFloor('gate');
  }
  // ---------- Arrows: five shots up from the paddle; each stops on the first thing it meets ----------
  updateVolley(dt) {
    const v = this.volley;
    if (v && this.phase === 'play') {
      v.time -= dt; v.next -= dt;
      if (v.remaining > 0 && v.next <= 0) { const x = this.paddle.x + (v.remaining % 2 ? 16 : -16); this.shots.push({ id: ++this.serial, x, y: this.paddle.y - 18, vy: -640, dead: false }); v.remaining--; v.next = .45; }
      if (v.time <= 0 && v.remaining <= 0) this.volley = null;
    }
    for (const s of this.shots) {
      const y1 = s.y + s.vy * dt; let best = null;
      const consider = (bottom, x0, x1, fn) => { if (s.x >= x0 && s.x <= x1 && bottom <= s.y && bottom >= y1 && (!best || bottom > best.y)) best = { y: bottom, fn }; };
      for (const b of this.bricks) if (b.hp > 0) for (const r of b.shape.shapes || [b.shape]) consider(r.y + r.h, r.x, r.x + r.w, () => this.hitBrick(b, { arrow: true }));
      if (this.gate && this.gate.hp > 0) consider(this.ceiling, this.gate.x, this.gate.x + this.gate.w, () => this.hitGate(1, s.x));
      if (best) { s.dead = true; best.fn(); this.effect(s.x, best.y, 'arrow-hit', .3); if (this.phase !== 'play') return; }
      else { s.y = y1; if (s.y < this.ceiling) s.dead = true; }
    }
    this.shots = this.shots.filter(s => !s.dead);
  }
  // Chest capsules drift down and lean toward the paddle; a missed capsule fades below it.
  moveCapsule(c, dt) {
    const p = this.paddle; c.y += 95 * dt; c.x += clamp(p.x - c.x, -60 * dt, 60 * dt);
    if (c.y + 8 >= p.y && c.y - 8 <= p.y + p.h && Math.abs(c.x - p.x) <= p.w / 2 + 8) { c.dead = true; this.collect(c.kind); }
    else if (c.y > p.y + 30) c.dead = true;
  }
  collect(kind) {
    const p = this.paddle; this.effect(p.x, p.y, 'capsule-' + kind, .5);
    if (kind === 'wide') p.wide = HOARD_TIMING.wide;
    if (kind === 'ram') p.armed = true;
    if (kind === 'multi' && this.balls.length < 4) { const a = -Math.PI / 2 - .5; this.balls.push(this.newBall(p.x, p.y - 8, Math.cos(a) * SPEED, Math.sin(a) * SPEED)); }
  }
  lose(reason) { if (this.state !== 'play') return; this.state = 'lost'; this.reason = reason; }
  // Continue keeps the floor, the bricks, the eye, the loot and the greed; Ember settles and waits 3 s. Back in action: the
  // ball waits on the paddle with a 3 s Ward under it, and every clock (march, hazards, molten timers) holds until the serve.
  continue() {
    if (this.continued || this.state !== 'lost') return false;
    this.continued = true; this.state = 'play'; this.reason = ''; this.lives = Math.max(2, this.lives);
    this.capsules = []; this.shots = []; this.volley = null; this.paddle.scorch = 0; this.slide = null;
    this.ember.reset();
    if (this.floor < 2) this.wake = Math.min(this.wake, 100 - this.rules.chime);
    this.nextHazard = Math.max(this.nextHazard, this.floorTime + 3);
    if (this.march) this.march.next = Math.max(this.march.next, this.floorTime + 3 + this.rules.march);
    this.makeServe(); this.ward = { y: this.paddle.y + 24, remaining: BACK_WARD }; this.active = false; this.backHold = true; return true;
  }
  // Continue panel copy: the Crown chest, then the counterweights (or the greed run), then the cave gate.
  nearMiss() {
    const goal = this.bricks.filter(b => b.kind === 'crown' || b.kind === 'weight'), hp = goal.reduce((n, b) => n + Math.max(0, b.hp), 0), max = goal.reduce((n, b) => n + b.maxHP, 0) || 1;
    let line, part;
    if (this.floor === 2) { line = hpLeft('THE CAVE GATE', this.gate.hp); part = 1 - this.gate.hp / this.gate.maxHP; }
    else if (this.floor === 0) { line = hpLeft('THE CROWN CHEST', hp); part = 1 - hp / max; }
    else if (hp > 0) { line = `${plural(hp, 'HIT')} TO DROP THE COUNTERWEIGHTS`; part = 1 - hp / max; }
    else { line = `RUN WITH ${this.loot} LOOT`; part = .95; }
    return { line, progress: Math.min(.99, (this.floor + part) / 3), stage: ['FLOOR', this.floor + 1, 3] };
  }
  effect(x, y, kind, life, details = {}) {
    const fx = { x, y, kind, age: 0, life, ...details }; this.effects.push(fx); if (this.effects.length > 80) this.effects.shift(); return fx;
  }
}
