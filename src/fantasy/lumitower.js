import { sweepTarget, overlapsTarget } from '../carrier-physics.js';
import { circleSweep, reflect } from './bellforge.js';
import { SPEED, BALL_R, BACK_WARD, paddleBounce, tickRam, ramThrough } from './ram.js';
import { plural } from '../near-miss.js';
import { tagSpecials, brickSpecial, armourOutright } from '../castle-specials.js';
import { PurposeClock } from './purpose.js';

// Lumi Breaks Out: Lumi holds the paddle and climbs the Menagerie tower. Floor 1 is her cell (teach), floor 2 the serpent
// windows, floor 3 the roof bell. Gnash lunges out of side-wall windows: every lunge starts at a fixed origin inside the
// window recess, so the drawn body and the collision circles are the same sampled path and the serpent never teleports.
const STEP = 1 / 240;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
// Purpose clock (src/fantasy/purpose.js): Gnash coils up the tower toward Lumi. clock: seconds per floor; push: seconds back
// per hatch-bar hit, bell ring, head hit or Song Shield block; power: seconds back per song (half for a Starlight note
// caught); surge: seconds forward per bite.
export const LUMI_MODES = {
  easy: { hatch: 2, rings: 5, interval: 7, tell: 1.6, chain: 1, coreHits: 16, spit: true, clock: [60, 70, 70], push: 5, power: 18, surge: 6 },
  medium: { hatch: 2, rings: 6, interval: 6.5, tell: 1.4, chain: 2, coreHits: 20, clock: [50, 60, 60], push: 4, power: 15, surge: 7 },
  hard: { hatch: 3, rings: 7, interval: 5, tell: 1.2, chain: 2, coreHits: 24, clock: [42, 52, 52], push: 3, power: 13, surge: 8 },
};
export const LUMI_PURPOSE = { label: 'GNASH COILS UP TO LUMI', lost: 'Gnash coiled up the tower and caught Lumi' };
export const LUMI_FLOORS = ['The cell', 'Serpent windows', 'Roof race'];
// peek: eyes in the recess; hiss: the warned tell (mode length); strike: the bite along the row; chew; retreat head first.
// Windows sit in the side walls (centre 24u from the edge, drawn 44x53u from the layered window kit); bricks keep to the middle six
// columns so both 52u side lanes stay open. Distances below are measured from the window centre, the serpent's origin.
export const LUNGE = { peek: .6, strike: .35, chew: .45, retreat: .6, reach: 250, lip: 10, out: 30, headR: 13, gap: 12, segments: 22, wall: 24, opening: 12 };
export const LUMI_TIMING = { climb: 1.2, escape: 2.4, calm: 4, shield: 8, wide: 8, notes: 6 };
export const NOTE_KINDS = ['wide', 'multi', 'ram'];
// Round-3 castle specials (src/castle-specials.js), [row, col] of each floor's six-column wall. Armour (two hits; a ram breaks it
// outright; the serpent's jaw skips it, so floor 2 keeps it off the window rows) screens what the climb is for: the hatch bars above
// the top row (floors 1-2) and the roof bell (floor 3). Mines sit in clusters, MINE_R a hair over one column pitch (a blast takes
// the bricks beside, above and below, never the hatch bars); coins pay a bonus.
export const LUMI_SPECIALS = [
  { armour: [[0, 2], [0, 3]], mine: [[2, 2]], coin: [[3, 0], [3, 5]] },
  { armour: [[1, 1], [1, 2], [1, 3], [1, 4], [4, 0], [4, 5]], mine: [[1, 0], [4, 2]], coin: [[0, 3], [4, 1], [4, 4]] },
  { armour: [[0, 2], [0, 3], [1, 1], [1, 4]], mine: [[3, 1], [3, 4]], coin: [[5, 0], [5, 5], [1, 2]] },
];
const MINE_R = 48, blastable = b => b.type === 'brick';

export class LumiTower {
  constructor({ width = 360, height = 700, difficulty = 'easy', paddleY = height - 90, floor = 0 } = {}) {
    if (!Number.isFinite(width) || !Number.isFinite(height) || width < 360 || height < 700 || !Number.isFinite(paddleY) || paddleY > height - 30 || paddleY < 580) throw new RangeError('Lumi tower needs its full portrait playfield');
    this.width = width; this.height = height; this.difficulty = Object.hasOwn(LUMI_MODES, difficulty) ? difficulty : 'medium';
    this.rules = LUMI_MODES[this.difficulty]; this.time = 0; this.serial = 0; this.lives = 3; this.score = 0;
    this.state = 'play'; this.paused = false; this.continued = false; this.reason = ''; this.effects = [];
    this.charge = 0; this.chargeBank = 0; this.shield = null; this.calm = 0; this.notes = 0; this.capsules = []; this.bites = 0; this.headHits = 0;
    this.paddle = { x: width / 2, px: width / 2, y: paddleY, w: 100, baseW: 100, wide: 0, h: 14, targetX: width / 2, vx: 0, stun: 0, streak: 0, armed: false };
    this.buildFloor(clamp(floor | 0, 0, 2));
  }
  buildFloor(n) {
    const W = this.width, bottom = this.paddle.y - 210, rules = this.rules;
    this.floor = n; this.floorTime = 0; this.active = false; this.phase = 'serve'; this.transition = 0; this.purpose = new PurposeClock(rules.clock[n]);
    this.lunges = []; this.capsules = []; this.bell = null; this.nextLunge = 5; this.teachingDone = n !== 1;
    const rows = n === 0 ? 4 : 6, bricks = [];
    this.rowY = row => bottom - (rows - row) * 22 + 6 + 9;
    for (let row = 0; row < rows; row++) for (let col = 0; col < 6; col++)
      bricks.push({ id: `brick-${n}-${row}-${col}`, row, col, type: 'brick', x: (W - 256) / 2 + col * 44, y: bottom - (rows - row) * 22 + 6, w: 36, h: 18, hp: 1, maxHP: 1, colour: ['t', 'v', 'c', 'y', 'b', 'gold'][(row + col * 2) % 6] });
    // The hatch above: bars that open the way up (floors 1 and 2) or the roof bell (floor 3).
    if (n < 2) for (let i = 0; i < 6; i++) bricks.push({ id: `bar-${n}-${i}`, type: 'bar', x: 62 + i * 40, y: 132, w: 36, h: 16, hp: n ? rules.hatch : 1, maxHP: n ? rules.hatch : 1 });
    else this.bell = { x: W / 2, y: 132, r: 22, rings: 0, need: rules.rings, swing: 0 };
    tagSpecials(bricks, LUMI_SPECIALS[n]);
    this.bricks = bricks;
    // Windows: three per wall on the serpent floor (alternating rows), two per wall on the roof; none in the cell.
    const rowsBySide = n === 1 ? [[0, 3], [2, 5]] : n === 2 ? [[2], [4]] : [[], []];
    this.windows = rowsBySide.flatMap((list, side) => list.map(row => ({ id: `win-${side}-${row}`, side, row, y: this.rowY(row), dir: side ? -1 : 1, originX: side ? W - LUNGE.wall : LUNGE.wall })));
    this.makeServe();
  }
  setTarget(x) { if (!Number.isFinite(x)) return false; this.paddle.targetX = clamp(x, this.paddle.w / 2 + 6, this.width - this.paddle.w / 2 - 6); return true; }
  pause(value) { this.paused = !!value; }
  makeServe() {
    this.phase = 'serve'; this.serveTime = 0;
    this.balls = [this.newBall(this.paddle.x, this.paddle.y - 8, 0, 0, true)];
  }
  newBall(x, y, vx, vy, caught = false) { return { id: ++this.serial, x, y, px: x, py: y, vx, vy, r: BALL_R, caught, dead: false, ram: 0, ramBricks: 0, contacts: new Set() }; }
  launch(angle = -Math.PI / 2) {
    if (this.paused || this.state !== 'play' || this.phase !== 'serve' || !Number.isFinite(angle)) return false;
    const a = clamp(angle, -Math.PI + .25, -.25), b = this.balls[0];
    b.caught = false; b.vx = Math.cos(a) * SPEED; b.vy = Math.sin(a) * SPEED;
    this.phase = 'play'; this.active = true; this.backHold = false; return true;
  }
  // ---------- Lumi's powers (one orb charge each) ----------
  canActivate(id, { ignorePause = false } = {}) {
    if (!(ignorePause || !this.paused) || this.state !== 'play' || !['play', 'serve'].includes(this.phase) || this.charge < 100 - 1e-7) return false;
    if (id === 'lullaby') return this.windows.length > 0 && this.calm <= 0;
    if (id === 'songshield') return this.windows.length > 0 && !this.shield;
    return id === 'starlight' && this.notes <= 0;
  }
  activate(id) {
    if (!this.canActivate(id)) return false;
    this.charge = 0; this.chargeBank = 0; this.purpose.push(this.rules.power, this.time);
    if (id === 'lullaby') { this.calm = LUMI_TIMING.calm; this.nextLunge = Math.max(this.nextLunge, this.floorTime + LUMI_TIMING.calm + 1.5); for (const l of this.lunges) this.retreat(l, false); this.effect(this.width / 2, 300, 'lullaby', .9); }
    if (id === 'songshield') { this.shield = { remaining: LUMI_TIMING.shield, used: false }; this.effect(this.paddle.x, this.paddle.y, 'songshield', .6); }
    if (id === 'starlight') { this.notes = LUMI_TIMING.notes; this.effect(this.paddle.x, this.paddle.y, 'starlight', .6); }
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
    if (this.phase === 'climb' || this.phase === 'escape') return this.updateTransition(dt);
    if (this.phase === 'serve') {
      const b = this.balls[0]; b.px = b.x; b.py = b.y; b.x = p.x; b.y = p.y - 8;
      if (!this.backHold) { this.serveTime += dt; if (this.serveTime >= (this.active ? 3 : 8)) this.launch(-Math.PI / 2 + .15); } // after a Continue the serve waits for the player
    }
    if (!this.active) return;
    this.time += dt; this.floorTime += dt;
    if (this.purpose.tick(dt)) return this.lose(LUMI_PURPOSE.lost);
    const credit = Math.min(this.chargeBank, dt, (100 - this.charge) * this.rules.coreHits / 100);
    this.chargeBank -= credit; this.charge = Math.min(100, this.charge + credit / this.rules.coreHits * 100);
    if (this.charge > 100 - 1e-7) { this.charge = 100; this.chargeBank = 0; }
    this.calm = Math.max(0, this.calm - dt);
    if (this.shield && (this.shield.remaining -= dt) <= 0) this.shield = null;
    if (this.ward && (this.ward.remaining -= dt) <= 0) this.ward = null;
    if (this.bell) this.bell.swing *= Math.exp(-2.5 * dt);
    this.scheduleLunges();
    for (const l of this.lunges) this.advanceLunge(l, dt);
    this.lunges = this.lunges.filter(l => !l.done);
    for (const c of this.capsules) this.moveCapsule(c, dt);
    this.capsules = this.capsules.filter(c => !c.dead);
    for (const b of this.balls) if (!b.caught && !b.dead) { this.moveBall(b, dt); if (this.phase !== 'play') return; }
    this.balls = this.balls.filter(b => !b.dead);
    if (!this.balls.length) { this.lives--; p.streak = 0; if (this.lives <= 0) this.lose('No balls remaining'); else this.makeServe(); }
  }
  finishFloor() {
    this.lunges = []; this.capsules = []; this.shield = null; this.ward = null;
    for (const b of this.balls) { b.vx = 0; b.vy = 0; b.caught = true; b.ram = 0; b.r = BALL_R; }
    this.balls = this.balls.slice(0, 1);
    this.phase = this.floor === 2 ? 'escape' : 'climb'; this.transition = this.floor === 2 ? LUMI_TIMING.escape : LUMI_TIMING.climb;
    this.effect(this.width / 2, 140, this.floor === 2 ? 'rope-escape' : 'hatch-open', this.transition);
  }
  updateTransition(dt) {
    this.time += dt; this.transition = Math.max(0, this.transition - dt);
    if (this.transition) return;
    if (this.phase === 'escape') { this.state = 'won'; return; }
    this.buildFloor(this.floor + 1); this.active = true;
  }
  // ---------- Gnash and the windows ----------
  scheduleLunges() {
    if (!this.windows.length || this.calm > 0 || this.floorTime < this.nextLunge) return;
    const busy = new Set(this.lunges.map(l => l.win.id)), free = this.windows.filter(w => !busy.has(w.id));
    if (this.lunges.length >= this.rules.chain || !free.length) return;
    // Pick the window whose row is nearest the live ball half the time, otherwise a random-looking rotation.
    const ball = this.balls.find(b => !b.caught), k = this.serial++;
    const win = ball && k % 2 ? free.reduce((a, w) => Math.abs(w.y - ball.y) < Math.abs(a.y - ball.y) ? w : a) : free[(k * 7) % free.length];
    const teaching = !this.teachingDone; this.teachingDone = true;
    this.lunges.push(this.makeLunge(win, teaching));
    // A chain primes a second window shortly after the first, on the other wall when possible.
    this.nextLunge = this.floorTime + (this.lunges.length < this.rules.chain ? 1.2 : this.rules.interval * this.purpose.pace);
    if (this.lunges.length >= this.rules.chain) this.nextLunge = this.floorTime + this.rules.interval * this.purpose.pace;
  }
  makeLunge(win, teaching = false) {
    const l = { id: ++this.serial, win, teaching, stage: 'peek', t: 0, mood: 'blink', done: false, swallowed: false, head: { x: win.originX, y: win.y }, reach: 0, prev: null };
    l.points = this.lungePoints(l); l.prev = l.points; this.effect(win.originX, win.y, 'window-peek', LUNGE.peek); return l;
  }
  // Head distance from the origin along the row, by stage. The row is the window's centre line; the body wiggles about it.
  lungeDistance(l) {
    const lip = LUNGE.lip, out = LUNGE.out, tell = this.rules.tell;
    if (l.stage === 'peek') return lip * ease(l.t / LUNGE.peek);
    if (l.stage === 'hiss') return lip + (out - lip) * ease(l.t / tell);
    if (l.stage === 'strike') return out + (l.reach - out) * clamp(l.t / LUNGE.strike, 0, 1);
    if (l.stage === 'chew') return l.reach;
    return l.from * (1 - ease(l.t / LUNGE.retreat));
  }
  lungePoints(l) {
    const d = this.lungeDistance(l), w = l.win, pts = [];
    for (let i = 0; i < LUNGE.segments; i++) {
      const s = d - i * LUNGE.gap; if (s < 0) break;
      const taper = clamp(s / 60, 0, 1), wobble = Math.sin(s / 18 - this.time * 8) * 5 * taper * (i ? 1 : .35);
      pts.push({ x: w.originX + w.dir * s, y: w.y + wobble, r: i ? Math.max(6, 10 - i * .2) : LUNGE.headR });
    }
    return pts;
  }
  advanceLunge(l, dt) {
    l.t += dt; l.prev = l.points;
    if (l.stage === 'peek' && l.t >= LUNGE.peek) { l.stage = 'hiss'; l.t = 0; l.mood = 'hiss'; this.effect(this.width / 2, l.win.y, 'bite-warning', this.rules.tell, { row: l.win.row, side: l.win.side }); }
    else if (l.stage === 'hiss' && l.t >= this.rules.tell) {
      l.stage = 'strike'; l.t = 0; l.mood = 'strike'; l.reach = LUNGE.reach;
      // Song Shield: the barrier stands just outside the window and stops one bite.
      if (this.shield && !this.shield.used) { l.reach = LUNGE.out + 40; l.shielded = true; }
    } else if (l.stage === 'strike' && l.t >= LUNGE.strike) {
      if (l.shielded) { this.shield.used = true; this.purpose.push(this.rules.push, this.time); this.shield.remaining = Math.min(this.shield.remaining, .4); this.effect(l.points[0].x, l.win.y, 'shield-block', .5); this.retreat(l, true); }
      else { l.stage = 'chew'; l.t = 0; l.mood = l.swallowed ? 'grin' : 'chew'; }
    } else if (l.stage === 'chew' && l.t >= LUNGE.chew) this.retreat(l, false);
    else if (l.stage === 'retreat' && l.t >= LUNGE.retreat) l.done = true;
    l.points = this.lungePoints(l); l.head = l.points[0] || { x: l.win.originX, y: l.win.y };
    if (l.stage === 'strike' && !l.shielded) this.chomp(l);
  }
  retreat(l, hurt) {
    if (l.stage === 'retreat') return;
    l.from = this.lungeDistance(l); l.stage = 'retreat'; l.t = 0; l.mood = hurt ? 'hurt' : this.calm > 0 ? 'dizzy' : 'blink';
    l.points = this.lungePoints(l);
  }
  // The open jaw eats the bricks it passes on its own row (the jaw's centre line), never the rows above or below: quiet single vanishes, no score or charge for the player.
  chomp(l) {
    const h = l.points[0]; if (!h) return;
    for (const b of this.bricks) if (b.hp > 0 && b.type === 'brick' && b.sp !== 'armour' && h.x + h.r > b.x && h.x - h.r < b.x + b.w && h.y >= b.y - 2 && h.y <= b.y + b.h + 2) {
      b.hp = 0; this.effect(b.x + b.w / 2, b.y + b.h / 2, 'chomp', .45, { colour: b.colour, w: b.w, h: b.h });
    }
  }
  snakeTargets() {
    // Only the parts that have left the window opening collide: inside it the serpent is in the recess, behind the wall plane.
    const out = [];
    for (const l of this.lunges) l.points.forEach((p, i) => {
      const q = l.prev[i] || p; if (Math.abs(p.x - l.win.originX) < LUNGE.opening) return;
      out.push({ lunge: l, head: i === 0, a: q, b: p, r: p.r });
    });
    return out;
  }
  // ---------- ball ----------
  targets() {
    const t = this.bricks.filter(b => b.hp > 0).map(b => ({ id: b.id, kind: 'brick', item: b, type: 'rect', x: b.x, y: b.y, w: b.w, h: b.h }));
    if (this.bell) t.push({ id: 'bell', kind: 'bell', item: this.bell, type: 'circle', x: this.bell.x, y: this.bell.y, r: this.bell.r });
    return t;
  }
  moveBall(b, dt) {
    b.px = b.x; b.py = b.y;
    const targets = this.targets(), snake = this.snakeTargets(), p = this.paddle;
    for (const id of b.contacts) {
      const target = targets.find(t => t.id === id), seg = !target && snake.find(s => `snake-${s.lunge.id}` === id);
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
        const a = { x: s.a.x + (s.b.x - s.a.x) * elapsed, y: s.a.y + (s.b.y - s.a.y) * elapsed };
        // The serpent's own velocity enters the rebound, so a moving body pushes the ball out instead of swallowing it.
        const hit = circleSweep(from, to, b.r, a, s.b, s.r);
        if (hit) add({ ...hit, svx: (s.b.x - a.x) / left, svy: (s.b.y - a.y) / left }, s.head ? 'head' : 'body', s);
      }
      if (this.ward && b.vy > 0 && to.y > this.ward.y - b.r) add({ t: Math.max(0, (this.ward.y - b.r - b.y) / (to.y - b.y)), nx: 0, ny: -1 }, 'ward');
      if (b.vy > 0 && b.y <= p.y + b.r) add(sweepTarget(from, to, b.r, { type: 'rect', x: p.px - p.w / 2, y: p.y, w: p.w, h: p.h, vx: p.vx }, elapsed * dt, left), 'paddle', p);
      hits.sort((a, q) => a.t - q.t); const hit = hits[0];
      if (!hit) { b.x = to.x; b.y = to.y; break; }
      b.x += (to.x - from.x) * hit.t; b.y += (to.y - from.y) * hit.t;
      if (hit.kind === 'brick' && ramThrough(this, b, hit.item.item)) { left *= 1 - hit.t; continue; }
      // The striking jaw swallows the ball, unless it is the harmless teaching lunge.
      if (hit.kind === 'head' && hit.item.lunge.stage === 'strike' && !hit.item.lunge.teaching) { this.swallow(b, hit.item.lunge); return; }
      b.x += hit.nx * ((hit.depth || 0) + .015); b.y += hit.ny * ((hit.depth || 0) + .015);
      if (hit.kind === 'paddle') paddleBounce(this, b);
      else {
        const speed = Math.hypot(b.vx, b.vy); reflect(b, hit);
        const next = Math.hypot(b.vx, b.vy); if (next > 0) { b.vx *= speed / next; b.vy *= speed / next; }
        const key = hit.kind === 'head' || hit.kind === 'body' ? `snake-${hit.item.lunge.id}` : hit.item?.id, fresh = key !== undefined && !b.contacts.has(key);
        if (fresh) b.contacts.add(key);
        if (fresh && hit.kind === 'brick') this.hitBrick(hit.item.item, b);
        if (fresh && hit.kind === 'bell') this.ringBell(b);
        // A head already retreating only deflects the ball: no score or charge to farm.
        if (fresh && hit.kind === 'head' && hit.item.lunge.stage !== 'retreat') this.hitHead(hit.item.lunge);
      }
      if (this.phase !== 'play') return;
      left *= 1 - hit.t; if (hit.t < 1e-6) left = Math.max(0, left - 1e-5);
    }
    const speed = Math.hypot(b.vx, b.vy);
    if (speed && Math.abs(b.vy) < speed * .22) { b.vy = Math.sign(b.vy || 1) * speed * .22; b.vx = Math.sign(b.vx || 1) * Math.sqrt(speed * speed - b.vy * b.vy); }
    if (b.y - b.r > this.height) b.dead = true;
  }
  // Easy: Gnash spits the ball back onto the paddle (no life lost, streak and ram lost). Medium/Hard: the ball is gone.
  swallow(b, l) {
    b.dead = true; l.swallowed = true; l.mood = 'grin'; this.bites++; this.paddle.streak = 0; this.purpose.surge(this.rules.surge, this.time);
    this.effect(b.x, b.y, 'swallow', .8);
    if (this.rules.spit && this.balls.filter(q => !q.dead).length === 0) { const r = this.newBall(this.paddle.x, this.paddle.y - 8, 0, 0, true); this.balls = [r]; /* the spat ball is the only one, so serve and launch act on it */ this.phase = 'serve'; this.serveTime = 0; }
  }
  hitHead(l) {
    this.headHits++; this.score += 50; this.purpose.push(this.rules.push, this.time); this.chargeBank = Math.min((100 - this.charge) * this.rules.coreHits / 100, this.chargeBank + 2);
    this.effect(l.points[0].x, l.points[0].y, 'snake-hurt', .5); this.retreat(l, true);
    this.nextLunge = Math.max(this.nextLunge, this.floorTime + 2);
  }
  ringBell() {
    const bell = this.bell; bell.rings++; bell.swing = 1; this.score += 40; this.purpose.push(this.rules.push, this.time);
    this.effect(bell.x, bell.y, 'bell-ring', .6, { rings: bell.rings });
    if (bell.rings >= bell.need) this.finishFloor();
  }
  hitBrick(brick, ball) {
    if (brick.hp <= 0) return;
    brick.hp = brick.sp === 'armour' && armourOutright(ball) ? 0 : brick.hp - 1; this.score += brick.type === 'bar' ? 20 : 10; if (brick.type === 'bar') this.purpose.push(this.rules.push, this.time);
    if (!(ball?.ram > 0)) this.chargeBank = Math.min((100 - this.charge) * this.rules.coreHits / 100, this.chargeBank + 1);
    this.effect(brick.x + brick.w / 2, brick.y + brick.h / 2, brick.hp ? 'brick-hit' : 'brick-break', brick.hp ? .35 : .7, { colour: brick.colour, w: brick.w, h: brick.h, type: brick.type });
    if (!brick.hp && brick.sp) brickSpecial(this, brick, ball, MINE_R, blastable);
    if (!brick.hp && brick.type === 'brick' && this.notes > 0) { this.notes--; this.capsules.push({ id: ++this.serial, kind: NOTE_KINDS[this.serial % 3], x: brick.x + brick.w / 2, y: brick.y + brick.h / 2, dead: false }); }
    if (!brick.hp && brick.type === 'bar' && this.bricks.every(b => b.type !== 'bar' || b.hp <= 0)) this.finishFloor();
  }
  // Starlight notes drift down and lean toward the paddle; a missed note simply fades below it.
  moveCapsule(c, dt) {
    const p = this.paddle; c.y += 95 * dt; c.x += clamp(p.x - c.x, -60 * dt, 60 * dt);
    if (c.y + 8 >= p.y && c.y - 8 <= p.y + p.h && Math.abs(c.x - p.x) <= p.w / 2 + 8) { c.dead = true; this.collect(c.kind); }
    else if (c.y > p.y + 30) c.dead = true;
  }
  collect(kind) {
    const p = this.paddle; this.effect(p.x, p.y, 'note-' + kind, .5); this.purpose.push(this.rules.power / 2, this.time);
    if (kind === 'wide') { p.w = 140; p.wide = LUMI_TIMING.wide; }
    if (kind === 'ram') p.armed = true;
    if (kind === 'multi' && this.balls.length < 4) { const a = -Math.PI / 2 - .5; this.balls.push(this.newBall(p.x, p.y - 8, Math.cos(a) * SPEED, Math.sin(a) * SPEED)); }
  }
  lose(reason) { if (this.state !== 'play') return; this.state = 'lost'; this.reason = reason; }
  continue() {
    if (this.continued || this.state !== 'lost') return false;
    this.continued = true; this.state = 'play'; this.reason = ''; this.lives = Math.max(2, this.lives);
    this.lunges = []; this.capsules = []; this.nextLunge = this.floorTime + 3; this.purpose.rewind(); this.makeServe();
    this.ward = { y: this.paddle.y + 24, remaining: BACK_WARD }; this.active = false; this.backHold = true; return true;
  }
  // Continue panel copy: hits left on the hatch bars, then rings left on the roof bell; progress runs over all three floors.
  nearMiss() {
    const stage = ['FLOOR', this.floor + 1, 3];
    if (this.bell) { const left = Math.max(1, this.bell.need - this.bell.rings); return { line: `LUMI IS ${plural(left, 'BELL RING')} FROM FREEDOM`, progress: (2 + 1 - left / this.bell.need) / 3, stage }; }
    const bars = this.bricks.filter(b => b.type === 'bar'), left = Math.max(1, bars.reduce((n, b) => n + Math.max(0, b.hp), 0)), max = bars.reduce((n, b) => n + b.maxHP, 0) || 1;
    return { line: `LUMI IS ${plural(left, 'HIT')} FROM FLOOR ${this.floor + 2}`, progress: (this.floor + 1 - left / max) / 3, stage };
  }
  effect(x, y, kind, life, details = {}) {
    const fx = { x, y, kind, age: 0, life, ...details }; this.effects.push(fx); if (this.effects.length > 80) this.effects.shift(); return fx;
  }
}
