import { sweepTarget, overlapsTarget } from '../carrier-physics.js';
import { circleSweep, reflect } from './bellforge.js';
import { SPEED, RAM, BACK_WARD, paddleBounce, tickRam, ramThrough } from './ram.js';
import { plural, hpLeft } from '../near-miss.js';
import { LUNGE } from './lumitower.js';
import { tagSpecials, brickSpecial, armourOutright } from '../castle-specials.js';

// Serpent Rivals: Kit climbs the twin-serpent hall. Gnash (emerald) lunges from the left-wall windows, Mooncoil (violet)
// from the right. Each serpent owns its lane rows; both own one window on the Crossing row, which ends in the Clash
// Chamber, a brick-free pocket mid-board. Heads that reach the chamber within the clash window snap at each other:
// both recoil, sway dizzy, a capsule drops and the Twin Seal cracks. Striking a serpent's rune lure (a solid rune stone
// beside its window) calls that serpent onto the Crossing early, after a short tell, so the player can bait clashes.
// Every lunge reuses the Lumi tower lunge rules: a fixed origin inside the window recess, a body of circles sampled
// along the drawn row, nothing collides inside the opening, and the head never moves more than ~2.5u per 1/240 s step.
const STEP = 1 / 240;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };

// hatch: HP per floor-1 bar. seal2/seal: Seal HP on floors 2/3. wardCap: most ward plates the serpents can feed onto the
// Seal by eating bricks. clash: Seal damage per clash. dizzyHit: Seal damage per ball hit on a dizzy head.
// tell/lureTell: hiss length of a scheduled / lured lunge. window: how long a head holds in the chamber (the clash window).
// chain: scheduled lunges live at once (a lured lunge is the player's choice and ignores it). spit: Easy spits the ball back.
export const RIVALS_MODES = {
  easy: { hatch: 2, seal2: 10, seal: 16, wardCap: 2, clash: 6, dizzyHit: 3, interval: 7, tell: 1.7, lureTell: 1.1, window: 1.6, chain: 1, coreHits: 16, spit: true },
  medium: { hatch: 2, seal2: 12, seal: 20, wardCap: 4, clash: 5, dizzyHit: 3, interval: 6, tell: 1.45, lureTell: .95, window: 1.3, chain: 2, coreHits: 20 },
  hard: { hatch: 3, seal2: 14, seal: 26, wardCap: 6, clash: 5, dizzyHit: 3, interval: 5, tell: 1.2, lureTell: .8, window: 1, chain: 2, coreHits: 24 },
};
export const RIVALS_FLOORS = ['Lure hall', 'The crossing', 'Twin Seal'];
export const SERPENTS = { gnash: { side: 0, skin: 'snake-emerald', name: 'Gnash' }, mooncoil: { side: 1, skin: 'snake', name: 'Mooncoil' } };
// Lunge shape: the Lumi tower lunge (window, lip, head, segments) with rivals reaches. Distances are from the window centre.
export const RIVAL_LUNGE = { ...LUNGE, homeReach: 220, crossReach: 136, lurePeek: .3, snap: .25, recoil: .3, back: 20, dizzy: 2, bite: 14 };
export const RIVALS_TIMING = { climb: 1.2, shatter: 2.4, ward: 6, volley: 2.5, arrows: 5, lureCool: 3, teachClash: 3.5, wide: 8, chainGap: 1.2 };
export const CAPSULE_KINDS = ['multi', 'ram', 'wide'];
// Kit's menu ids -> model powers, for src/fantasy/chapter.js `kinds`.
export const RIVALS_KINDS = { shield: 'ward', arrows: 'volley' };
// Round-3 castle specials (src/castle-specials.js), [row, col] of each floor's wall. Armour (two hits; a ram breaks it outright)
// screens the hatch bars (floor 1) and the Twin Seal (floors 2-3) from below, and a serpent's jaw skips it, so it never feeds the
// Seal a ward plate (so it keeps off the window rows). Mines sit in clusters (MINE_R reaches the bricks beside, above and below, never the bars, lures or Seal);
// coins pay a bonus. Cells that the chamber, shaft or a window mouth open are skipped.
export const RIVALS_SPECIALS = [
  { armour: [[0, 2], [0, 3], [0, 4], [2, 1], [2, 5]], mine: [[3, 2], [6, 4]], coin: [[2, 3], [5, 5], [8, 3]] },
  { armour: [[0, 2], [0, 3], [0, 4], [1, 1], [1, 5]], mine: [[3, 2], [7, 4]], coin: [[4, 5], [6, 1], [9, 5]] },
  { armour: [[0, 2], [0, 3], [0, 4], [3, 0], [3, 6], [4, 3]], mine: [[3, 2], [8, 4]], coin: [[4, 1], [8, 5], [11, 0]] },
];
const MINE_R = 40, blastable = b => b.type === 'brick';
// Board: seven 32u columns on a 36u pitch keep both 56u side lanes open; 22u rows. Floors 2-3 carve the chamber
// (3x3 cells round the centre column) and a one-column shaft from it down to the bottom row. Every window row keeps its
// edge cell open (the lane mouth), so the head can push out to its hiss lip without trapping a ball against a brick.
export const RIVALS_LAYOUT = {
  cols: 7, pitch: 36, bw: 32, bh: 18, rowPitch: 22, gapBelow: 190,
  rows: [9, 11, 12],
  // Window rows per floor and side; `cross` marks the Crossing row (both serpents' chamber lane).
  windows: [{ gnash: [1, 4, 7], mooncoil: [] }, { gnash: [2, 5], mooncoil: [5, 8] }, { gnash: [1, 6, 9], mooncoil: [2, 6, 10] }],
  // lane: the window row a lure calls (floor 1 Gnash's middle window, then the Crossing). The rune stone sits in the edge
  // column one row above it, beside the window, never in a lane: a hissing head must never press the ball against it.
  cross: [null, 5, 6], lane: [4, 5, 6],
  // Floor 1 shows Mooncoil's shuttered windows as scenery only.
  shutters: [[2, 6], [], []],
};

export class SerpentRivals {
  constructor({ width = 360, height = 700, difficulty = 'easy', paddleY = height - 90, floor = 0 } = {}) {
    if (!Number.isFinite(width) || !Number.isFinite(height) || width < 360 || height < 700 || !Number.isFinite(paddleY) || paddleY > height - 30 || paddleY < 580) throw new RangeError('Serpent Rivals needs its full portrait playfield');
    this.width = width; this.height = height; this.difficulty = Object.hasOwn(RIVALS_MODES, difficulty) ? difficulty : 'medium';
    this.rules = RIVALS_MODES[this.difficulty]; this.time = 0; this.serial = 0; this.lives = 3; this.score = 0;
    this.state = 'play'; this.paused = false; this.continued = false; this.reason = ''; this.effects = [];
    this.charge = 0; this.chargeBank = 0; this.ward = null; this.volley = null; this.shots = []; this.capsules = [];
    this.bites = 0; this.headHits = 0; this.clashes = 0; this.eaten = 0; this.capsuleSerial = 0;
    this.paddle = { x: width / 2, px: width / 2, y: paddleY, w: 100, baseW: 100, wide: 0, h: 14, targetX: width / 2, vx: 0, stun: 0, streak: 0, armed: false };
    this.buildFloor(clamp(floor | 0, 0, 2));
  }
  // ---------- floors ----------
  buildFloor(n) {
    const L = RIVALS_LAYOUT, W = this.width, rows = L.rows[n], bottom = this.paddle.y - L.gapBelow, x0 = (W - (L.cols * L.pitch - (L.pitch - L.bw))) / 2;
    this.floor = n; this.floorTime = 0; this.active = false; this.phase = 'serve'; this.transition = 0;
    this.lunges = []; this.capsules = []; this.shots = []; this.nextLunge = 5; this.turn = n === 1 ? 1 : 0;
    this.rowTop = row => bottom - (rows - row) * L.rowPitch + 4;
    this.rowY = row => this.rowTop(row) + L.bh / 2;
    this.colX = col => x0 + col * L.pitch;
    const cross = L.cross[n], mid = (L.cols - 1) / 2;
    this.chamber = cross === null ? null : { x: this.colX(mid - 1) - 4, y: this.rowTop(cross - 1) - 2, w: 3 * L.pitch + 4, h: 3 * L.rowPitch, row: cross, cx: W / 2, cy: this.rowY(cross) };
    const mouth = (row, col) => (col === 0 && L.windows[n].gnash.includes(row)) || (col === L.cols - 1 && L.windows[n].mooncoil.includes(row));
    const open = (row, col) => mouth(row, col) || (this.chamber && ((Math.abs(row - cross) <= 1 && Math.abs(col - mid) <= 1) || (row > cross + 1 && col === mid)));
    const lane = L.lane[n], bricks = [], lures = [];
    for (let row = 0; row < rows; row++) for (let col = 0; col < L.cols; col++) {
      if (open(row, col)) continue;
      const x = this.colX(col), y = this.rowTop(row);
      const lure = row === lane - 1 && ((col === 0 && L.windows[n].gnash.includes(lane)) || (col === L.cols - 1 && L.windows[n].mooncoil.includes(lane)));
      if (lure) { lures.push({ id: `lure-${n}-${col ? 'mooncoil' : 'gnash'}`, type: 'lure', snake: col ? 'mooncoil' : 'gnash', x, y, w: L.bw, h: L.bh, row, lane, cool: 0, lit: false }); continue; }
      bricks.push({ id: `brick-${n}-${row}-${col}`, type: 'brick', x, y, w: L.bw, h: L.bh, hp: 1, maxHP: 1, row, col, colour: ['t', 'v', 'c', 'y', 'b', 'gold'][(row + col * 2) % 6] });
    }
    // Floor 1: the hatch above (bars). Floors 2-3: the Twin Seal, fed ward plates by the serpents' meals.
    this.seal = null;
    if (n === 0) for (let i = 0; i < 6; i++) bricks.push({ id: `bar-${n}-${i}`, type: 'bar', x: 62 + i * 40, y: this.rowTop(0) - 40, w: 36, h: 16, hp: this.rules.hatch, maxHP: this.rules.hatch });
    else { const hp = n === 1 ? this.rules.seal2 : this.rules.seal; this.seal = { id: 'seal', x: W / 2 - 70, y: this.rowTop(0) - 56, w: 140, h: 30, hp, maxHP: hp, ward: 0, cracks: 0 }; }
    tagSpecials(bricks, RIVALS_SPECIALS[n]);
    this.bricks = bricks; this.lures = lures;
    this.windows = [];
    for (const [snake, list] of Object.entries(L.windows[n])) for (const row of list) {
      const side = SERPENTS[snake].side;
      this.windows.push({ id: `win-${snake}-${row}`, snake, side, row, y: this.rowY(row), dir: side ? -1 : 1, originX: side ? W - RIVAL_LUNGE.wall : RIVAL_LUNGE.wall, cross: row === cross,
        reach: row === cross ? RIVAL_LUNGE.crossReach : RIVAL_LUNGE.homeReach });
    }
    this.shutters = L.shutters[n].map(row => ({ id: `shut-${row}`, side: 1, row, y: this.rowY(row), originX: W - RIVAL_LUNGE.wall }));
    // Each serpent's first lunge on the floor where it first appears is harmless; floor 2 opens with a harmless clash.
    this.snakes = { gnash: { name: 'gnash', taught: n > 0, mood: 'idle' }, mooncoil: { name: 'mooncoil', taught: n > 1, mood: 'idle' } };
    this.teachClash = n === 1;
    if (this.teachClash) this.nextLunge = RIVALS_TIMING.teachClash;
    this.updateLures(); this.makeServe();
  }
  setTarget(x) { if (!Number.isFinite(x)) return false; this.paddle.targetX = clamp(x, this.paddle.w / 2 + 6, this.width - this.paddle.w / 2 - 6); return true; }
  pause(value) { this.paused = !!value; }
  makeServe() { this.phase = 'serve'; this.serveTime = 0; this.balls = [this.newBall(this.paddle.x, this.paddle.y - 8, 0, 0, true)]; }
  newBall(x, y, vx, vy, caught = false) { return { id: ++this.serial, x, y, px: x, py: y, vx, vy, r: 6, caught, dead: false, ram: 0, ramBricks: 0, contacts: new Set() }; }
  launch(angle = -Math.PI / 2) {
    if (this.paused || this.state !== 'play' || this.phase !== 'serve' || !Number.isFinite(angle)) return false;
    const a = clamp(angle, -Math.PI + .25, -.25), b = this.balls[0];
    b.caught = false; b.vx = Math.cos(a) * SPEED; b.vy = Math.sin(a) * SPEED;
    this.phase = 'play'; this.active = true; this.backHold = false; return true;
  }
  // ---------- Kit's powers ----------
  canActivate(id = 'ward', { ignorePause = false } = {}) {
    if (!(ignorePause || !this.paused) || this.state !== 'play' || !['play', 'serve'].includes(this.phase) || this.charge < 100 - 1e-7) return false;
    if (id === 'ward' || id === 'echo') return !this.ward;
    return id === 'volley' && !this.volley;
  }
  activate(id = 'ward') {
    if (!this.canActivate(id)) return false;
    this.charge = 0; this.chargeBank = 0;
    if (id === 'volley') { this.volley = { time: RIVALS_TIMING.volley, remaining: RIVALS_TIMING.arrows, next: 0 }; this.effect(this.paddle.x, this.paddle.y, 'volley', .5); }
    else { this.ward = { y: this.paddle.y + 24, remaining: RIVALS_TIMING.ward }; this.effect(this.width / 2, this.ward.y, 'ward-deploy', .4); }
    return true;
  }
  update(dt) {
    if (this.paused || this.state !== 'play' || !Number.isFinite(dt) || dt <= 0) return;
    let left = Math.min(.1, dt);
    while (left > 1e-9 && this.state === 'play') { const h = Math.min(STEP, left); this.step(h); left -= h; }
  }
  step(dt) {
    const p = this.paddle; p.px = p.x;
    if (p.wide > 0 && (p.wide -= dt) <= 0) p.w = p.baseW;
    p.x += clamp(p.targetX - p.x, -900 * dt, 900 * dt); p.x = clamp(p.x, p.w / 2 + 6, this.width - p.w / 2 - 6);
    p.vx = (p.x - p.px) / dt;
    for (const fx of this.effects) fx.age += dt;
    this.effects = this.effects.filter(f => f.age < f.life);
    if (this.phase === 'climb' || this.phase === 'shatter') return this.updateTransition(dt);
    if (this.phase === 'serve') {
      const b = this.balls[0]; b.px = b.x; b.py = b.y; b.x = p.x; b.y = p.y - 8;
      if (!this.backHold) { this.serveTime += dt; if (this.serveTime >= (this.active ? 3 : 8)) this.launch(-Math.PI / 2 + .15); } // after a Continue the serve waits for the player
    }
    if (!this.active) return;
    this.time += dt; this.floorTime += dt;
    const credit = Math.min(this.chargeBank, dt, (100 - this.charge) * this.rules.coreHits / 100);
    this.chargeBank -= credit; this.charge = Math.min(100, this.charge + credit / this.rules.coreHits * 100);
    if (this.charge > 100 - 1e-7) { this.charge = 100; this.chargeBank = 0; }
    if (this.ward && (this.ward.remaining -= dt) <= 0) this.ward = null;
    for (const l of this.lures) l.cool = Math.max(0, l.cool - dt);
    this.scheduleLunges();
    for (const l of this.lunges) this.advanceLunge(l, dt);
    this.lunges = this.lunges.filter(l => !l.done);
    this.checkClash(); this.updateLures();
    for (const c of this.capsules) this.moveCapsule(c, dt);
    this.capsules = this.capsules.filter(c => !c.dead);
    this.updateVolley(dt);
    for (const b of this.balls) if (!b.caught && !b.dead) { this.moveBall(b, dt); if (this.phase !== 'play') return; }
    this.balls = this.balls.filter(b => !b.dead);
    if (!this.balls.length) { this.lives--; p.streak = 0; if (this.lives <= 0) this.lose('No balls remaining'); else this.makeServe(); }
  }
  finishFloor() {
    this.lunges = []; this.capsules = []; this.shots = []; this.volley = null; this.ward = null;
    for (const b of this.balls) { b.vx = 0; b.vy = 0; b.caught = true; b.ram = 0; b.r = 6; }
    this.balls = this.balls.slice(0, 1); this.updateLures();
    const last = this.floor === 2; this.phase = last ? 'shatter' : 'climb'; this.transition = last ? RIVALS_TIMING.shatter : RIVALS_TIMING.climb;
    this.effect(this.width / 2, this.seal ? this.seal.y + 15 : this.rowTop(0) - 32, last ? 'seal-shatter' : this.floor ? 'seal-open' : 'hatch-open', this.transition);
  }
  updateTransition(dt) {
    this.time += dt; this.transition = Math.max(0, this.transition - dt);
    if (this.transition) return;
    if (this.phase === 'shatter') { this.state = 'won'; return; }
    this.buildFloor(this.floor + 1); this.active = true;
  }
  // ---------- the serpents ----------
  lungeOf(snake) { return this.lunges.find(l => l.snake === snake); }
  scheduleLunges() {
    if (!this.windows.length || this.floorTime < this.nextLunge) return;
    if (this.teachClash) {
      // Floor 2 opens with both serpents on the Crossing at once, harmless, so the clash and its payoff are shown safely.
      const pair = this.windows.filter(w => w.cross);
      if (this.lunges.length || pair.length < 2) return;
      this.teachClash = false; for (const w of pair) { this.lunges.push(this.makeLunge(w, { teaching: true })); this.snakes[w.snake].taught = true; }
      this.nextLunge = this.floorTime + RIVAL_LUNGE.peek + this.rules.tell + 4; return;
    }
    if (this.lunges.some(l => l.stage === 'clash' || l.stage === 'recoil' || l.stage === 'dizzy')) return;
    if (this.lunges.filter(l => !l.lured).length >= this.rules.chain) return;
    const crossBusy = this.lunges.some(l => l.win.cross);
    const freeSnakes = Object.keys(SERPENTS).filter(s => !this.lungeOf(s) && this.windows.some(w => w.snake === s));
    if (!freeSnakes.length) return;
    const k = this.serial++, snake = freeSnakes.includes(['gnash', 'mooncoil'][this.turn % 2]) ? ['gnash', 'mooncoil'][this.turn % 2] : freeSnakes[0];
    // Scheduled lunges never put both serpents on the Crossing: a clash is always the player's doing.
    const free = this.windows.filter(w => w.snake === snake && !(w.cross && crossBusy));
    if (!free.length) return;
    const ball = this.balls.find(b => !b.caught);
    const win = ball && k % 2 ? free.reduce((a, w) => Math.abs(w.y - ball.y) < Math.abs(a.y - ball.y) ? w : a) : free[(k * 7) % free.length];
    const teaching = !this.snakes[snake].taught; this.snakes[snake].taught = true;
    this.lunges.push(this.makeLunge(win, { teaching })); this.turn++;
    // A chain primes the rival's window shortly after (Medium/Hard), then the hall rests for the interval.
    const other = freeSnakes.find(s => s !== snake), scheduled = this.lunges.filter(l => !l.lured).length;
    this.nextLunge = this.floorTime + (other && scheduled < this.rules.chain ? RIVALS_TIMING.chainGap : this.rules.interval);
  }
  makeLunge(win, { teaching = false, lured = false } = {}) {
    const l = { id: ++this.serial, snake: win.snake, win, teaching, lured, stage: 'peek', t: 0, mood: 'blink', done: false, swallowed: false,
      peek: lured ? RIVAL_LUNGE.lurePeek : RIVAL_LUNGE.peek, tell: lured ? this.rules.lureTell : this.rules.tell, reach: 0, from: 0, arrivedAt: null, sway: 0, swayFrom: 0, head: { x: win.originX, y: win.y }, prev: null };
    l.points = this.lungePoints(l); l.prev = l.points;
    this.effect(win.originX, win.y, 'window-peek', l.peek, { snake: l.snake, side: win.side, lured }); return l;
  }
  // Head distance from the window centre along the row, by stage.
  lungeDistance(l) {
    const { lip, out, strike, back, recoil } = RIVAL_LUNGE;
    if (l.stage === 'peek') return lip * ease(l.t / l.peek);
    if (l.stage === 'hiss') return lip + (out - lip) * ease(l.t / l.tell);
    if (l.stage === 'strike') return out + (l.reach - out) * clamp(l.t / strike, 0, 1);
    if (l.stage === 'chew' || l.stage === 'prowl' || l.stage === 'clash') return l.from;
    if (l.stage === 'recoil') return l.from - back * ease(l.t / recoil);
    if (l.stage === 'dizzy') return l.from - back;
    return l.from * (1 - ease(l.t / RIVAL_LUNGE.retreat));
  }
  // Dizzy sway: an envelope that starts and ends at zero (and fades out over 0.25 s on an early retreat), so it never jumps.
  swayAmount(l) {
    if (l.stage === 'dizzy') return Math.sin(Math.PI * clamp(l.t / RIVAL_LUNGE.dizzy, 0, 1));
    if (l.stage === 'retreat' && l.swayFrom) return l.swayFrom * Math.max(0, 1 - l.t / .25);
    return 0;
  }
  lungePoints(l) {
    const d = this.lungeDistance(l), w = l.win, pts = [], sway = this.swayAmount(l);
    for (let i = 0; i < RIVAL_LUNGE.segments; i++) {
      const s = d - i * RIVAL_LUNGE.gap; if (s < 0) break;
      const taper = clamp(s / 60, 0, 1), wobble = Math.sin(s / 18 - this.time * 8) * 5 * taper * (i ? 1 : .35);
      const dizzy = sway * 4 * Math.sin(this.time * 9 + i * .7) * taper * Math.max(0, 1 - i / 6);
      pts.push({ x: w.originX + w.dir * s, y: w.y + wobble + dizzy, r: i ? Math.max(6, 10 - i * .2) : RIVAL_LUNGE.headR });
    }
    return pts;
  }
  advanceLunge(l, dt) {
    l.t += dt; l.prev = l.points;
    const L = RIVAL_LUNGE;
    if (l.stage === 'peek' && l.t >= l.peek) { l.stage = 'hiss'; l.t = 0; l.mood = 'hiss'; this.effect(this.width / 2, l.win.y, 'bite-warning', l.tell, { row: l.win.row, side: l.win.side, snake: l.snake, cross: l.win.cross, teaching: l.teaching }); }
    else if (l.stage === 'hiss' && l.t >= l.tell) { l.stage = 'strike'; l.t = 0; l.mood = 'strike'; l.reach = l.win.reach; }
    else if (l.stage === 'strike' && l.t >= L.strike) { l.from = l.reach; l.t = 0; l.stage = l.win.cross ? 'prowl' : 'chew'; l.mood = l.swallowed ? 'grin' : l.win.cross ? 'taste' : 'chew'; }
    else if (l.stage === 'chew' && l.t >= L.chew) this.retreat(l, false);
    else if (l.stage === 'prowl' && l.t >= this.rules.window) this.retreat(l, false);
    else if (l.stage === 'clash' && l.t >= L.snap) { l.stage = 'recoil'; l.t = 0; l.mood = 'shock'; }
    else if (l.stage === 'recoil' && l.t >= L.recoil) { l.stage = 'dizzy'; l.t = 0; l.mood = 'dizzy'; }
    else if (l.stage === 'dizzy' && l.t >= L.dizzy) this.retreat(l, false);
    else if (l.stage === 'retreat' && l.t >= L.retreat) l.done = true;
    l.points = this.lungePoints(l); l.head = l.points[0] || { x: l.win.originX, y: l.win.y };
    if (l.stage === 'strike') this.chomp(l);
    // A head has arrived once its strike lands in the chamber, so a clash always starts from the full chamber pose.
    if (l.win.cross && l.arrivedAt === null && l.stage === 'prowl' && this.inChamber(l.head)) l.arrivedAt = this.time;
  }
  retreat(l, hurt) {
    if (l.stage === 'retreat') return;
    l.swayFrom = this.swayAmount(l); l.from = this.lungeDistance(l); l.stage = 'retreat'; l.t = 0; l.mood = hurt ? 'ouch' : l.swayFrom ? 'dizzy' : 'blink';
    l.points = this.lungePoints(l);
  }
  inChamber(h) { const c = this.chamber; return !!c && !!h && h.x > c.x && h.x < c.x + c.w && h.y > c.y && h.y < c.y + c.h; }
  // Two heads from rival windows in the chamber at once, arriving within the clash window of each other.
  checkClash() {
    const [a, b] = this.lunges.filter(l => l.win.cross && l.arrivedAt !== null && l.stage === 'prowl');
    if (!a || !b || a.snake === b.snake || Math.abs(a.arrivedAt - b.arrivedAt) > this.rules.window) return false;
    this.clash(a, b); return true;
  }
  clash(a, b) {
    const c = this.chamber, teaching = a.teaching && b.teaching;
    for (const l of [a, b]) { l.from = this.lungeDistance(l); l.stage = 'clash'; l.t = 0; l.mood = 'snarl'; l.teaching = true; }   // a clashing head no longer bites
    this.effect(c.cx, c.cy, 'clash', RIVAL_LUNGE.snap + RIVAL_LUNGE.recoil, { teaching, heads: [a.head, b.head].map(h => ({ x: h.x, y: h.y })) });
    this.nextLunge = Math.max(this.nextLunge, this.floorTime + RIVAL_LUNGE.snap + RIVAL_LUNGE.recoil + RIVAL_LUNGE.dizzy + RIVAL_LUNGE.retreat + 1.5);
    if (teaching) return;
    this.clashes++; this.score += 200;
    this.capsules.push({ id: ++this.serial, kind: CAPSULE_KINDS[this.capsuleSerial++ % CAPSULE_KINDS.length], x: c.cx, y: c.cy + 10, dead: false });
    if (this.seal) { if (this.seal.ward) this.effect(this.seal.x + this.seal.w / 2, this.seal.y + 15, 'ward-shatter', .6, { plates: this.seal.ward }); this.seal.ward = 0; this.damageSeal(this.rules.clash, 'clash'); }
  }
  // The open jaw eats the ordinary bricks it passes on its own row, never rows above or below, never lures or bars:
  // quiet single vanishes, no score or charge for the player. On floors 2-3 each meal feeds a ward plate onto the Seal.
  chomp(l) {
    const h = l.points[0]; if (!h) return;
    // The jaw reaches a ball's width past the head, so a brick is gone before a ball pushed ahead of a harmless head can meet it.
    const reach = h.r + RIVAL_LUNGE.bite;
    for (const b of this.bricks) if (b.hp > 0 && b.type === 'brick' && b.sp !== 'armour' && h.x + reach > b.x && h.x - reach < b.x + b.w && h.y >= b.y - 2 && h.y <= b.y + b.h + 2) {
      b.hp = 0; this.eaten++; this.effect(b.x + b.w / 2, b.y + b.h / 2, 'chomp', .45, { colour: b.colour, w: b.w, h: b.h, snake: l.snake });
      if (this.seal && this.seal.ward < this.rules.wardCap) { this.seal.ward++; this.effect(b.x + b.w / 2, b.y + b.h / 2, 'seal-feed', .7, { to: { x: this.seal.x + this.seal.w / 2, y: this.seal.y + 15 }, snake: l.snake, ward: this.seal.ward }); }
    }
  }
  // A lure glows while its serpent is home and rested; striking it calls that serpent onto its lure window now.
  updateLures() {
    const busy = this.phase === 'climb' || this.phase === 'shatter' || this.teachClash || this.lunges.some(l => l.stage === 'clash' || l.stage === 'recoil' || l.stage === 'dizzy');
    for (const l of this.lures) l.lit = !busy && l.cool <= 0 && !this.lungeOf(l.snake);
  }
  strikeLure(lure) {
    this.score += 15; this.effect(lure.x + lure.w / 2, lure.y + lure.h / 2, lure.lit ? 'lure-call' : 'lure-dim', lure.lit ? .6 : .2, { snake: lure.snake });
    if (!lure.lit) return false;
    const win = this.windows.find(w => w.snake === lure.snake && w.row === lure.lane); if (!win) return false;
    lure.lit = false; lure.cool = RIVALS_TIMING.lureCool + this.rules.lureTell + RIVAL_LUNGE.lurePeek + RIVAL_LUNGE.strike + this.rules.window + RIVAL_LUNGE.retreat;
    this.lunges.push(this.makeLunge(win, { lured: true, teaching: !this.snakes[lure.snake].taught })); this.snakes[lure.snake].taught = true;
    // Calling a serpent resets the hall's rhythm: the next scheduled lunge waits a full interval.
    this.nextLunge = Math.max(this.nextLunge, this.floorTime + this.rules.interval * .6); return true;
  }
  snakeTargets() {
    // Only the parts that have left the window opening collide: inside it the serpent is in the recess, behind the wall plane.
    const out = [];
    for (const l of this.lunges) l.points.forEach((p, i) => {
      const q = l.prev[i] || p; if (Math.abs(p.x - l.win.originX) < RIVAL_LUNGE.opening) return;
      out.push({ lunge: l, head: i === 0, a: q, b: p, r: p.r });
    });
    return out;
  }
  // ---------- ball ----------
  targets() {
    const t = this.bricks.filter(b => b.hp > 0).map(b => ({ id: b.id, kind: 'brick', item: b, type: 'rect', x: b.x, y: b.y, w: b.w, h: b.h }));
    for (const l of this.lures) t.push({ id: l.id, kind: 'lure', item: l, type: 'rect', x: l.x, y: l.y, w: l.w, h: l.h });
    if (this.seal && this.seal.hp > 0) t.push({ id: 'seal', kind: 'seal', item: this.seal, type: 'rect', x: this.seal.x, y: this.seal.y, w: this.seal.w, h: this.seal.h });
    return t;
  }
  moveBall(b, dt) {
    b.px = b.x; b.py = b.y;
    const targets = this.targets(), snake = this.snakeTargets(), p = this.paddle;
    for (const id of b.contacts) {
      const target = targets.find(t => t.id === id), seg = !target && typeof id === 'string' && id.startsWith('snake-');
      if (seg ? !snake.some(s => `snake-${s.lunge.id}` === id && Math.hypot(b.x - s.b.x, b.y - s.b.y) <= b.r + s.r + .1) : !target || !overlapsTarget({ ...b, r: b.r + .1 }, target)) b.contacts.delete(id);
    }
    tickRam(this, b, dt);
    let left = dt;
    for (let pass = 0; pass < 8 && left > 1e-8 && !b.dead; pass++) {
      const from = { x: b.x, y: b.y }, to = { x: b.x + b.vx * left, y: b.y + b.vy * left }, hits = [], elapsed = 1 - left / dt;
      const add = (hit, kind, item) => { if (hit) hits.push({ ...hit, kind, item }); };
      if (b.vx < 0 && to.x < b.r) add({ t: (b.r - b.x) / (to.x - b.x), nx: 1, ny: 0 }, 'wall');
      if (b.vx > 0 && to.x > this.width - b.r) add({ t: (this.width - b.r - b.x) / (to.x - b.x), nx: -1, ny: 0 }, 'wall');
      if (b.vy < 0 && to.y < b.r + 12) add({ t: Math.max(0, (b.r + 12 - b.y) / (to.y - b.y)), nx: 0, ny: 1 }, 'wall');
      for (const t of targets) if (t.item?.hp !== 0) add(sweepTarget(from, to, b.r, t), t.kind, t);
      for (const s of snake) {
        // Each circle sweeps from where it was to where it is: a moving body pushes the ball out (its velocity enters the
        // rebound), and a circle that has just emerged onto the ball ejects it along the contact normal.
        const a = { x: s.a.x + (s.b.x - s.a.x) * elapsed, y: s.a.y + (s.b.y - s.a.y) * elapsed };
        const hit = circleSweep(from, to, b.r, a, s.b, s.r);
        if (hit) add({ ...hit, svx: (s.b.x - a.x) / left, svy: (s.b.y - a.y) / left }, s.head ? 'head' : 'body', s);
      }
      if (this.ward && b.vy > 0 && to.y > this.ward.y - b.r) add({ t: Math.max(0, (this.ward.y - b.r - b.y) / (to.y - b.y)), nx: 0, ny: -1 }, 'ward');
      if (b.vy > 0 && b.y <= p.y + b.r) add(sweepTarget(from, to, b.r, { type: 'rect', x: p.px - p.w / 2, y: p.y, w: p.w, h: p.h, vx: p.vx }, elapsed * dt, left), 'paddle', p);
      hits.sort((a, q) => a.t - q.t); const hit = hits[0];
      if (!hit) { b.x = to.x; b.y = to.y; break; }
      b.x += (to.x - from.x) * hit.t; b.y += (to.y - from.y) * hit.t;
      if (hit.kind === 'brick' && ramThrough(this, b, hit.item.item)) { left *= 1 - hit.t; continue; }
      // A striking jaw swallows the ball, unless the lunge is a harmless teaching one.
      if (hit.kind === 'head' && hit.item.lunge.stage === 'strike' && !hit.item.lunge.teaching) { this.swallow(b, hit.item.lunge); return; }
      b.x += hit.nx * ((hit.depth || 0) + .015); b.y += hit.ny * ((hit.depth || 0) + .015);
      if (hit.kind === 'paddle') paddleBounce(this, b);
      else {
        const speed = Math.hypot(b.vx, b.vy); reflect(b, hit);
        const next = Math.hypot(b.vx, b.vy); if (next > 0) { b.vx *= speed / next; b.vy *= speed / next; }
        const key = hit.kind === 'head' || hit.kind === 'body' ? `snake-${hit.item.lunge.id}` : hit.item?.id, fresh = key !== undefined && !b.contacts.has(key);
        if (fresh) b.contacts.add(key);
        if (fresh && hit.kind === 'brick') this.hitBrick(hit.item.item, b);
        if (fresh && hit.kind === 'lure') this.strikeLure(hit.item.item);
        if (fresh && hit.kind === 'seal') this.damageSeal(b.ram > 0 ? RAM.damage : 1, 'ball');
        if (fresh && hit.kind === 'head') this.hitHead(hit.item.lunge);
        if (hit.kind === 'ward') this.effect(b.x, b.y, 'ward-bounce', .2);
      }
      if (this.phase !== 'play') return;
      left *= 1 - hit.t; if (hit.t < 1e-6) left = Math.max(0, left - 1e-5);
    }
    const speed = Math.hypot(b.vx, b.vy);
    if (speed && Math.abs(b.vy) < speed * .22) { b.vy = Math.sign(b.vy || 1) * speed * .22; b.vx = Math.sign(b.vx || 1) * Math.sqrt(speed * speed - b.vy * b.vy); }
    if (b.y - b.r > this.height) b.dead = true;
  }
  // Easy: the serpent spits the ball back onto the paddle (no life lost; streak and ram lost). Medium/Hard: the ball is gone.
  swallow(b, l) {
    b.dead = true; l.swallowed = true; l.mood = 'grin'; this.bites++; this.paddle.streak = 0;
    this.effect(b.x, b.y, 'swallow', .8, { snake: l.snake });
    // The spat ball replaces the dead ones at once: the serve reads balls[0] on the very next step.
    if (this.rules.spit && this.balls.filter(q => !q.dead).length === 0) { this.balls = [this.newBall(this.paddle.x, this.paddle.y - 8, 0, 0, true)]; this.phase = 'serve'; this.serveTime = 0; }
  }
  hitHead(l) {
    const h = l.points[0] || l.head;
    if (l.stage === 'dizzy' && this.seal) {
      // A dizzy head is bound to the Seal: the hit lands on it, through any ward.
      this.score += 75; this.effect(h.x, h.y, 'dizzy-hit', .6, { snake: l.snake }); this.retreat(l, true); this.damageSeal(this.rules.dizzyHit, 'dizzy'); return;
    }
    if (l.stage === 'retreat' || l.stage === 'clash' || l.stage === 'recoil' || l.stage === 'dizzy') return;
    this.headHits++; this.score += 50; this.chargeBank = Math.min((100 - this.charge) * this.rules.coreHits / 100, this.chargeBank + 2);
    this.effect(h.x, h.y, 'snake-hurt', .5, { snake: l.snake }); this.retreat(l, true);
    this.nextLunge = Math.max(this.nextLunge, this.floorTime + 2);
  }
  damageSeal(n, source) {
    const s = this.seal; if (!s || s.hp <= 0 || (this.phase !== 'play' && this.phase !== 'serve')) return;
    if (source === 'ball' || source === 'arrow') {
      if (s.ward > 0) { s.ward--; this.effect(s.x + s.w / 2, s.y + s.h / 2, 'ward-chip', .4, { ward: s.ward }); return; }
      this.score += 30;
    }
    s.hp = Math.max(0, s.hp - n); s.cracks++;
    this.effect(s.x + s.w / 2, s.y + s.h / 2, 'seal-hit', source === 'clash' ? .9 : .4, { damage: n, source, hp: s.hp });
    if (!s.hp) this.finishFloor();
  }
  hitBrick(brick, ball) {
    if (brick.hp <= 0) return;
    brick.hp -= brick.type === 'bar' && ball?.ram > 0 ? Math.min(brick.hp, 2) : brick.sp === 'armour' && armourOutright(ball) ? brick.hp : 1; this.score += brick.type === 'bar' ? 20 : 10;
    if (!(ball?.ram > 0) && !ball?.arrow) this.chargeBank = Math.min((100 - this.charge) * this.rules.coreHits / 100, this.chargeBank + 1);
    this.effect(brick.x + brick.w / 2, brick.y + brick.h / 2, brick.hp ? 'brick-hit' : 'brick-break', brick.hp ? .35 : .7, { colour: brick.colour, w: brick.w, h: brick.h, type: brick.type });
    if (!brick.hp && brick.sp) brickSpecial(this, brick, ball, MINE_R, blastable);
    if (!brick.hp && brick.type === 'bar' && this.bricks.every(b => b.type !== 'bar' || b.hp <= 0)) this.finishFloor();
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
      const consider = (top, bottom, x0, x1, fn) => { if (s.x >= x0 && s.x <= x1 && bottom <= s.y && bottom >= y1 && (!best || bottom > best.y)) best = { y: bottom, fn }; };
      for (const b of this.bricks) if (b.hp > 0) consider(b.y, b.y + b.h, b.x, b.x + b.w, () => this.hitBrick(b, { arrow: true }));
      for (const l of this.lures) consider(l.y, l.y + l.h, l.x, l.x + l.w, () => this.strikeLure(l));
      if (this.seal && this.seal.hp > 0) consider(this.seal.y, this.seal.y + this.seal.h, this.seal.x, this.seal.x + this.seal.w, () => this.damageSeal(1, 'arrow'));
      for (const t of this.snakeTargets()) if (Math.abs(t.b.x - s.x) < t.r) consider(0, t.b.y + Math.sqrt(t.r * t.r - (t.b.x - s.x) ** 2), t.b.x - t.r, t.b.x + t.r, () => t.head ? this.hitHead(t.lunge) : null);
      if (best) { s.dead = true; best.fn(); this.effect(s.x, best.y, 'arrow-hit', .3); if (this.phase !== 'play') return; }
      else { s.y = y1; if (s.y < 12) s.dead = true; }
    }
    this.shots = this.shots.filter(s => !s.dead);
  }
  // Clash capsules drift down and lean toward the paddle; a missed capsule fades below it.
  moveCapsule(c, dt) {
    const p = this.paddle; c.y += 95 * dt; c.x += clamp(p.x - c.x, -60 * dt, 60 * dt);
    if (c.y + 8 >= p.y && c.y - 8 <= p.y + p.h && Math.abs(c.x - p.x) <= p.w / 2 + 8) { c.dead = true; this.collect(c.kind); }
    else if (c.y > p.y + 30) c.dead = true;
  }
  collect(kind) {
    const p = this.paddle; this.effect(p.x, p.y, 'capsule-' + kind, .5);
    if (kind === 'wide') { p.w = 140; p.wide = RIVALS_TIMING.wide; }
    if (kind === 'ram') p.armed = true;
    if (kind === 'multi' && this.balls.length < 4) { const a = -Math.PI / 2 - .5; this.balls.push(this.newBall(p.x, p.y - 8, Math.cos(a) * SPEED, Math.sin(a) * SPEED)); }
  }
  lose(reason) { if (this.state !== 'play') return; this.state = 'lost'; this.reason = reason; }
  // Continue keeps the floor, its bricks, the Seal's HP and ward; the serpents go home and wait 3 s.
  continue() {
    if (this.continued || this.state !== 'lost') return false;
    this.continued = true; this.state = 'play'; this.reason = ''; this.lives = Math.max(2, this.lives);
    this.lunges = []; this.capsules = []; this.shots = []; this.volley = null; this.teachClash = false;
    this.nextLunge = this.floorTime + 3; for (const l of this.lures) l.cool = 0; this.updateLures(); this.makeServe();
    this.ward = { y: this.paddle.y + 24, remaining: BACK_WARD }; this.active = false; this.backHold = true; return true;
  }
  // Continue panel copy: floor 1's hatch bars, then the Twin Seal's HP; progress runs over all three floors.
  nearMiss() {
    let line, part;
    if (this.seal) { line = hpLeft('THE TWIN SEAL', this.seal.hp); part = 1 - this.seal.hp / this.seal.maxHP; }
    else { const bars = this.bricks.filter(b => b.type === 'bar'), left = Math.max(1, bars.reduce((n, b) => n + Math.max(0, b.hp), 0)); line = `${plural(left, 'HIT')} TO OPEN THE HATCH`; part = 1 - left / (bars.reduce((n, b) => n + b.maxHP, 0) || 1); }
    return { line, progress: (this.floor + part) / 3, stage: ['FLOOR', this.floor + 1, 3] };
  }
  effect(x, y, kind, life, details = {}) {
    const fx = { x, y, kind, age: 0, life, ...details }; this.effects.push(fx); if (this.effects.length > 80) this.effects.shift(); return fx;
  }
}
