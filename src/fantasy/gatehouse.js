import { sweepTarget, overlapsTarget } from '../carrier-physics.js';
import { KORR_BODIES, rampPose, sweepMovingSegment, circleSweep, reflect, lerpPoint } from './bellforge.js';

// Gatehouse Siege: Kit storms three floors of the Menagerie gatehouse. Floor 1 drops the drawbridge (two counterweight
// housings), floor 2 winches the portcullis while Korr drops bells through a murder hole, floor 3 is the duel with Korr.
// Lives, score and Kit charge carry between floors; Continue keeps the current floor's progress.
const STEP = 1 / 240, SPEED = 345, RAM = { r: 13.2, time: 2.5, bricks: 14, damage: 3 };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const GATEHOUSE_MODES = {
  easy: { hp: 24, housing: 4, notches: 8, interval: 10, tell: 1.8, bellCap: 1, coreHits: 18 },
  medium: { hp: 32, housing: 5, notches: 9, interval: 8.5, tell: 1.6, bellCap: 1, coreHits: 22 },
  hard: { hp: 40, housing: 6, notches: 10, interval: 7.5, tell: 1.4, bellCap: 2, coreHits: 26 },
};
export const GATEHOUSE_FLOORS = ['Drawbridge', 'Murder holes', 'Inner gate'];
export const GATEHOUSE_TIMING = { crash: 1.1, climb: 1.2, defeat: 2.4, stun: .8, ward: 6 };
// Static ramps: a bell rolls down them and drops off the low end; balls rebound from them.
const ramp = (id, x, y, length, angle) => {
  const r = { id, pivot: { x, y }, contactOffset: { x: 0, y: 0 }, length, angle, previousAngle: angle, thickness: 8 };
  return Object.assign(r, rampPose(r));
};

export class Gatehouse {
  constructor({ width = 360, height = 700, difficulty = 'easy', paddleY = height - 90, floor = 0 } = {}) {
    if (!Number.isFinite(width) || !Number.isFinite(height) || width < 360 || height < 700 || !Number.isFinite(paddleY) || paddleY > height - 30 || paddleY < 580) throw new RangeError('Gatehouse needs its full portrait playfield');
    this.width = width; this.height = height; this.difficulty = Object.hasOwn(GATEHOUSE_MODES, difficulty) ? difficulty : 'medium';
    this.rules = GATEHOUSE_MODES[this.difficulty]; this.time = 0; this.serial = 0; this.lives = 3; this.score = 0;
    this.state = 'play'; this.paused = false; this.continued = false; this.reason = ''; this.effects = [];
    this.charge = 0; this.chargeBank = 0; this.ward = null;
    this.paddle = { x: width / 2, px: width / 2, y: paddleY, w: 100, h: 14, targetX: width / 2, vx: 0, stun: 0, streak: 0, armed: false };
    this.buildFloor(clamp(floor | 0, 0, 2));
  }
  buildFloor(n) {
    const W = this.width, bottom = this.paddle.y - 210, rules = this.rules;
    this.floor = n; this.floorTime = 0; this.active = false; this.phase = 'serve'; this.transition = 0;
    this.bells = []; this.solids = []; this.housings = []; this.wheel = null; this.ramps = []; this.holes = []; this.gate = null;
    this.villain = { x: 180, y: 100, foot: { x: 180, y: 100 }, hp: rules.hp, maxHP: rules.hp, stage: 'idle', stageAt: 0, until: 0, body: [], solid: false, defeat: null };
    this.nextWarning = 6; this.teachingDone = false; this.nextTeaching = false;
    const rows = [5, 4, 5][n], bricks = [];
    for (let row = 0; row < rows; row++) for (let col = 0; col < 6; col++) {
      const armour = n === 2 && row < 2;
      bricks.push({ id: `brick-${n}-${row}-${col}`, type: armour ? 'armour' : 'brick', x: (W - 256) / 2 + col * 44, y: bottom - (rows - row) * 24 + 6, w: 36, h: 18,
        hp: armour ? 2 : 1, maxHP: armour ? 2 : 1, colour: ['coral', 'ivory', 'sage'][(row + col) % 3] });
    }
    this.bricks = bricks;
    if (n === 0) {
      this.drawbridge = { x: 96, y: 92, w: 168, h: 24, down: 0 };
      this.solids.push({ id: 'drawbridge', type: 'rect', x: 96, y: 92, w: 168, h: 24 });
      for (const [i, x] of [[0, 26], [1, 278]]) this.housings.push({ id: `housing-${i}`, x, y: 118, w: 56, h: 50, hp: rules.housing, maxHP: rules.housing });
    }
    if (n === 1) {
      // The gallery ledge spans the whole width, so the ball never climbs behind Korr.
      this.solids.push({ id: 'ledge', type: 'rect', x: 0, y: 118, w: W, h: 26 });
      this.gate = { posts: [{ x: 130, y: 150, w: 14, h: 112 }, { x: 216, y: 150, w: 14, h: 112 }], lintel: { x: 130, y: 150, w: 100, h: 14 },
        door: { x: 144, top: 164, bottom: 262, y: 262 }, need: rules.notches };
      for (const r of [...this.gate.posts, this.gate.lintel]) this.solids.push({ id: `gate-${this.solids.length}`, type: 'rect', ...r });
      this.wheel = { x: 62, y: 206, r: 26, notches: 0, angle: 0, spin: 0 };
      this.holes = [{ x: 300, y: 158 }];
      // Bells roll outward and drop down a side lane, never through the brick field (which keeps to the middle six columns).
      this.ramps = [ramp('ramp-r', 262, 226, 74, .2)];
      Object.assign(this.villain, { x: 300, y: 76, foot: { x: 300, y: 118 }, solid: false });
    }
    if (n === 2) {
      // Korr stands on a recessed dais (scenery, no collider, so his whole body stays hittable) and kicks bells off its ends.
      Object.assign(this.villain, { x: 180, y: 150, foot: { x: 180, y: 206 }, solid: true });
      this.dais = { x: 120, y: 206, w: 120, h: 16 };
      this.holes = [{ x: 100, y: 214 }, { x: 260, y: 214 }];
      this.ramps = [ramp('ramp-l', 116, 236, 84, Math.PI - .2), ramp('ramp-r', 244, 236, 84, .2)];
      this.nextWarning = 5;
    }
    this.updateBody(); this.makeServe();
  }
  setTarget(x) { if (!Number.isFinite(x)) return false; this.paddle.targetX = clamp(x, this.paddle.w / 2 + 6, this.width - this.paddle.w / 2 - 6); return true; }
  pause(value) { this.paused = !!value; }
  makeServe() {
    this.phase = 'serve'; this.serveTime = 0;
    this.balls = [{ id: ++this.serial, x: this.paddle.x, y: this.paddle.y - 8, px: this.paddle.x, py: this.paddle.y - 8, vx: 0, vy: 0, r: 6, caught: true, dead: false, ram: 0, ramBricks: 0, contacts: new Set() }];
  }
  launch(angle = -Math.PI / 2) {
    if (this.paused || this.state !== 'play' || this.phase !== 'serve' || !Number.isFinite(angle)) return false;
    const a = clamp(angle, -Math.PI + .25, -.25), b = this.balls[0];
    b.caught = false; b.vx = Math.cos(a) * SPEED; b.vy = Math.sin(a) * SPEED;
    this.phase = 'play'; this.active = true; return true;
  }
  canActivate(id = 'ward', { ignorePause = false } = {}) {
    return ['ward', 'echo'].includes(id) && (ignorePause || !this.paused) && this.state === 'play' && ['play', 'serve'].includes(this.phase) && this.charge >= 100 - 1e-7 && !this.ward;
  }
  activate(id = 'ward') {
    if (!this.canActivate(id)) return false;
    this.charge = 0; this.chargeBank = 0;
    this.ward = { y: this.paddle.y + 24, remaining: GATEHOUSE_TIMING.ward };
    this.effect(this.width / 2, this.ward.y, 'ward-deploy', .4); return true;
  }
  update(dt) {
    if (this.paused || this.state !== 'play' || !Number.isFinite(dt) || dt <= 0) return;
    let left = Math.min(.1, dt);
    while (left > 1e-9 && this.state === 'play') { const h = Math.min(STEP, left); this.step(h); left -= h; }
  }
  step(dt) {
    const p = this.paddle; p.px = p.x;
    p.stun = Math.max(0, p.stun - dt);
    if (!p.stun) p.x += clamp(p.targetX - p.x, -900 * dt, 900 * dt);
    p.vx = (p.x - p.px) / dt;
    for (const fx of this.effects) fx.age += dt;
    this.effects = this.effects.filter(f => f.age < f.life);
    if (this.phase === 'crash' || this.phase === 'climb' || this.phase === 'defeat') return this.updateTransition(dt);
    if (this.phase === 'serve') {
      const b = this.balls[0]; b.px = b.x; b.py = b.y; b.x = p.x; b.y = p.y - 8;
      this.serveTime += dt; if (this.serveTime >= (this.active ? 3 : 8)) this.launch(-Math.PI / 2 + .15);
    }
    if (!this.active) return;
    this.time += dt; this.floorTime += dt;
    const credit = Math.min(this.chargeBank, dt, (100 - this.charge) * this.rules.coreHits / 100);
    this.chargeBank -= credit; this.charge = Math.min(100, this.charge + credit / this.rules.coreHits * 100);
    if (this.charge > 100 - 1e-7) { this.charge = 100; this.chargeBank = 0; }
    if (this.ward && (this.ward.remaining -= dt) <= 0) this.ward = null;
    if (this.gate) { const d = this.gate.door, target = d.bottom - (d.bottom - d.top) * Math.min(1, this.wheel.notches / this.gate.need); d.y += clamp(target - d.y, -70 * dt, 70 * dt); }
    if (this.wheel) { this.wheel.spin *= Math.exp(-3 * dt); this.wheel.angle += this.wheel.spin * dt; }
    this.updateVillain(); this.updateBody();
    for (const b of this.bells) this.moveBell(b, dt);
    this.bells = this.bells.filter(b => !b.dead);
    for (const b of this.balls) if (!b.caught && !b.dead) { this.moveBall(b, dt); if (this.phase !== 'play') return; }
    this.balls = this.balls.filter(b => !b.dead);
    if (!this.balls.length) { this.lives--; p.streak = 0; if (this.lives <= 0) this.lose('No balls remaining'); else this.makeServe(); }
  }
  // Floor clear: freeze play, show the crash or Korr's defeat, then climb to the next floor.
  finishFloor() {
    this.bells = []; this.ward = null; this.nextWarning = Infinity;
    for (const b of this.balls) { b.vx = 0; b.vy = 0; b.caught = true; b.ram = 0; b.r = 6; }
    if (this.floor === 2) { this.phase = 'defeat'; this.transition = GATEHOUSE_TIMING.defeat; this.villain.stage = 'defeated'; this.villain.body = []; this.villain.defeat = { age: 0 }; this.effect(this.villain.x, this.villain.y, 'korr-defeat', GATEHOUSE_TIMING.defeat); return; }
    this.phase = this.floor === 0 ? 'crash' : 'climb';
    this.transition = this.floor === 0 ? GATEHOUSE_TIMING.crash : GATEHOUSE_TIMING.climb;
    if (this.floor === 0) { this.solids = []; this.effect(180, 104, 'drawbridge-crash', GATEHOUSE_TIMING.crash); }
    else this.effect(180, 200, 'gate-open', GATEHOUSE_TIMING.climb);
  }
  updateTransition(dt) {
    this.time += dt; this.transition = Math.max(0, this.transition - dt);
    if (this.phase === 'crash') { this.drawbridge.down = 1 - this.transition / GATEHOUSE_TIMING.crash; if (!this.transition) { this.phase = 'climb'; this.transition = GATEHOUSE_TIMING.climb; } return; }
    if (this.phase === 'defeat') { this.villain.defeat.age += dt; if (!this.transition) this.state = 'won'; return; }
    if (!this.transition) { this.buildFloor(this.floor + 1); this.active = true; }
  }
  updateVillain() {
    const v = this.villain; if (this.floor === 0 || v.hp <= 0) return;
    if (['stagger', 'recover', 'release'].includes(v.stage)) {
      if (this.time < v.until) return;
      if (v.stage === 'release') { v.stage = 'recover'; v.stageAt = this.time; v.until = this.time + .85; return; }
      v.stage = 'idle'; v.stageAt = this.time;
    }
    if (v.stage === 'windup') {
      if (this.time < v.until) return;
      this.releaseBell(this.nextTeaching); v.stage = 'release'; v.stageAt = this.time; v.until = this.time + .45;
      this.nextWarning = this.time + (this.nextTeaching ? 4 : this.rules.interval - this.rules.tell); this.teachingDone = true; return;
    }
    if (this.floorTime >= this.nextWarning && this.bells.length < this.rules.bellCap) {
      this.nextTeaching = !this.teachingDone; v.stage = 'windup'; v.stageAt = this.time; v.until = this.time + this.rules.tell;
      v.hole = this.holes[this.serial % this.holes.length];
      this.effect(v.hole.x, v.hole.y, 'bell-warning', this.rules.tell);
    }
  }
  updateBody() {
    const v = this.villain;
    v.body = v.solid && v.hp > 0 ? (KORR_BODIES[v.stage] || KORR_BODIES.idle).map(([x, y, r]) => ({ type: 'circle', x: v.foot.x + x, y: v.foot.y + y, r })) : [];
  }
  releaseBell(teaching = false) {
    const h = this.villain.hole || this.holes[0];
    if (!h || this.bells.length >= this.rules.bellCap) return false;
    const b = { id: ++this.serial, x: h.x, y: h.y, px: h.x, py: h.y, vx: 0, vy: 40, r: 14, hp: 2, angle: 0, spin: 0, returning: false, teaching, dead: false };
    this.bells.push(b); this.effect(b.x, b.y, 'bell-release', .3); return b;
  }
  targets() {
    const t = this.bricks.filter(b => b.hp > 0).map(b => ({ id: b.id, kind: 'brick', item: b, type: 'rect', x: b.x, y: b.y, w: b.w, h: b.h }));
    for (const h of this.housings) if (h.hp > 0) t.push({ id: h.id, kind: 'housing', item: h, type: 'rect', x: h.x, y: h.y, w: h.w, h: h.h });
    for (const s of this.solids) t.push({ id: s.id, kind: 'solid', type: 'rect', x: s.x, y: s.y, w: s.w, h: s.h });
    if (this.gate) { const d = this.gate.door; if (d.y - d.top > 1) t.push({ id: 'door', kind: 'solid', type: 'rect', x: d.x, y: d.top, w: 72, h: d.y - d.top }); }
    if (this.wheel) t.push({ id: 'wheel', kind: 'wheel', item: this.wheel, type: 'circle', x: this.wheel.x, y: this.wheel.y, r: this.wheel.r });
    if (this.villain.body.length) t.push({ id: 'korr', kind: 'villain', shapes: this.villain.body });
    return t;
  }
  moveBall(b, dt) {
    b.px = b.x; b.py = b.y;
    const targets = this.targets(), p = this.paddle;
    for (const id of b.contacts) {
      const bell = typeof id === 'number' && this.bells.find(v => v.id === id), target = !bell && targets.find(t => t.id === id);
      if (bell ? Math.hypot(b.x - bell.x, b.y - bell.y) > b.r + bell.r + .1 : !target || !overlapsTarget({ ...b, r: b.r + .1 }, target)) b.contacts.delete(id);
    }
    if (b.ram > 0 && (b.ram -= dt) <= 0) this.endRam(b);
    let left = dt;
    for (let pass = 0; pass < 8 && left > 1e-8 && !b.dead; pass++) {
      const from = { x: b.x, y: b.y }, to = { x: b.x + b.vx * left, y: b.y + b.vy * left }, hits = [], elapsed = 1 - left / dt;
      const add = (hit, kind, item) => { if (hit) hits.push({ ...hit, kind, item }); };
      const ceiling = (this.floor === 1 ? 144 : 12) + b.r;
      if (b.vx < 0 && to.x < b.r) add({ t: (b.r - b.x) / (to.x - b.x), nx: 1, ny: 0 }, 'wall');
      if (b.vx > 0 && to.x > this.width - b.r) add({ t: (this.width - b.r - b.x) / (to.x - b.x), nx: -1, ny: 0 }, 'wall');
      if (b.vy < 0 && to.y < ceiling) add({ t: Math.max(0, (ceiling - b.y) / (to.y - b.y)), nx: 0, ny: 1 }, 'wall');
      for (const t of targets) if (t.item?.hp !== 0) add(sweepTarget(from, to, b.r, t), t.kind, t);
      for (const r of this.ramps) add(sweepMovingSegment(from, to, b.r, r, left), 'ramp', r);
      for (const bell of this.bells) if (!bell.dead) add(circleSweep(from, to, b.r, lerpPoint({ x: bell.px, y: bell.py }, bell, elapsed), bell, bell.r), 'bell', bell);
      if (this.ward && b.vy > 0 && to.y > this.ward.y - b.r) add({ t: Math.max(0, (this.ward.y - b.r - b.y) / (to.y - b.y)), nx: 0, ny: -1 }, 'ward');
      if (b.vy > 0 && b.y <= p.y + b.r) add(sweepTarget(from, to, b.r, { type: 'rect', x: p.px - p.w / 2, y: p.y, w: p.w, h: p.h, vx: p.vx }, elapsed * dt, left), 'paddle', p);
      hits.sort((a, q) => a.t - q.t); const hit = hits[0];
      if (!hit) { b.x = to.x; b.y = to.y; break; }
      b.x += (to.x - from.x) * hit.t; b.y += (to.y - from.y) * hit.t;
      // A ram ball ploughs through ordinary bricks: they break and the flight continues unchanged.
      if (hit.kind === 'brick' && b.ram > 0) {
        const brick = hit.item.item; brick.hp = 1; this.hitBrick(brick, b); b.ramBricks--;
        if (b.ramBricks <= 0) this.endRam(b);
        left *= 1 - hit.t; continue;
      }
      b.x += hit.nx * ((hit.depth || 0) + .015); b.y += hit.ny * ((hit.depth || 0) + .015);
      if (hit.kind === 'paddle') this.paddleHit(b);
      else {
        const speed = Math.hypot(b.vx, b.vy); reflect(b, hit);
        const next = Math.hypot(b.vx, b.vy); if (next > 0) { b.vx *= speed / next; b.vy *= speed / next; }
        const key = hit.kind === 'bell' ? hit.item.id : hit.item?.id, fresh = key !== undefined && !b.contacts.has(key);
        if (fresh) b.contacts.add(key);
        if (fresh && hit.kind === 'brick') this.hitBrick(hit.item.item, b);
        if (fresh && hit.kind === 'housing') this.hitHousing(hit.item.item, b.ram > 0 ? 2 : 1);
        if (fresh && hit.kind === 'wheel') this.turnWheel(b.ram > 0 ? 2 : 1, hit.nx);
        if (fresh && hit.kind === 'villain') this.hitVillain(b.ram > 0 ? RAM.damage : 1, b.ram > 0 && this.villain.stage === 'windup');
        if (fresh && hit.kind === 'bell') this.hitBell(hit.item, hit, speed);
        if (hit.kind === 'ward') this.effect(b.x, b.y, 'ward-bounce', .2);
      }
      if (this.phase !== 'play') return;
      left *= 1 - hit.t; if (hit.t < 1e-6) left = Math.max(0, left - 1e-5);
    }
    const speed = Math.hypot(b.vx, b.vy);
    if (speed && Math.abs(b.vy) < speed * .22) { b.vy = Math.sign(b.vy || 1) * speed * .22; b.vx = Math.sign(b.vx || 1) * Math.sqrt(speed * speed - b.vy * b.vy); }
    if (b.y - b.r > this.height) b.dead = true;
  }
  // Sweet spot: three centre-third paddle hits in a row arm the ram; the next centre hit launches it.
  paddleHit(b) {
    const p = this.paddle, offset = clamp((b.x - p.x) / (p.w / 2), -.95, .95), centre = Math.abs(offset) < 1 / 3;
    const speed = Math.min(SPEED * 1.28, Math.hypot(b.vx, b.vy) * 1.012), a = offset * 1.08;
    b.vx = Math.sin(a) * speed; b.vy = -Math.cos(a) * speed; this.effect(b.x, b.y, 'paddle', .12);
    if (!centre) { if (!p.armed) p.streak = 0; return; }
    if (p.armed && !(b.ram > 0)) {
      p.armed = false; p.streak = 0; b.ram = RAM.time; b.ramBricks = RAM.bricks; b.y -= RAM.r - b.r; b.r = RAM.r;
      this.effect(b.x, b.y, 'ram-launch', .5); return;
    }
    if (!p.armed && ++p.streak >= 3) { p.armed = true; this.effect(p.x, p.y, 'ram-armed', .6); }
  }
  endRam(b) { if (b.r !== 6) { b.r = 6; b.ram = 0; b.ramBricks = 0; this.effect(b.x, b.y, 'ram-end', .3); } }
  hitBrick(brick, ball) {
    if (brick.hp <= 0) return;
    brick.hp--; this.score += 10;
    if (this.balls.includes(ball) && !(ball.ram > 0)) this.chargeBank = Math.min((100 - this.charge) * this.rules.coreHits / 100, this.chargeBank + 1);
    this.effect(brick.x + brick.w / 2, brick.y + brick.h / 2, brick.hp ? 'brick-hit' : 'brick-break', brick.hp ? .35 : .7,
      { colour: brick.colour, w: brick.w, h: brick.h, vx: (ball?.vx || 0) * .12, vy: (ball?.vy || 0) * .08 });
  }
  hitHousing(h, damage) {
    h.hp = Math.max(0, h.hp - damage); this.score += 25;
    this.effect(h.x + h.w / 2, h.y + h.h / 2, h.hp ? 'housing-hit' : 'housing-break', h.hp ? .3 : .9);
    if (this.housings.every(q => q.hp <= 0)) this.finishFloor();
  }
  turnWheel(notches, nx) {
    const w = this.wheel; w.notches = Math.min(this.gate.need, w.notches + notches); w.spin += 6 * notches * (nx >= 0 ? 1 : -1); this.score += 15;
    this.effect(w.x, w.y, 'ratchet', .3);
    if (w.notches >= this.gate.need) this.finishFloor();
  }
  hitBell(bell, hit, speed) {
    bell.hp--; const impulse = clamp(speed * .7, 150, 290);
    bell.vx -= hit.nx * impulse; bell.vy -= hit.ny * impulse; bell.returning = bell.vy < 0;
    this.effect(bell.x, bell.y, 'bell-hit', .2);
    if (bell.hp <= 0) { bell.dead = true; this.score += 20; this.effect(bell.x, bell.y, 'bell-break', .6); }
  }
  moveBell(b, dt) {
    const motionFrom = { x: b.x, y: b.y }; b.px = b.x; b.py = b.y; b.vy += 220 * dt;
    const speed = Math.hypot(b.vx, b.vy); if (speed > 360) { b.vx *= 360 / speed; b.vy *= 360 / speed; }
    let left = dt;
    for (let pass = 0; pass < 6 && left > 1e-8; pass++) {
      const from = { x: b.x, y: b.y }, to = { x: b.x + b.vx * left, y: b.y + b.vy * left }, hits = [];
      if (!b.returning) for (const r of this.ramps) { const c = sweepMovingSegment(from, to, b.r, r, left); if (c) hits.push(c); }
      hits.sort((a, c) => a.t - c.t); const hit = hits[0];
      if (!hit) { b.x = to.x; b.y = to.y; break; }
      b.x += (to.x - from.x) * hit.t + hit.nx * ((hit.depth || 0) + .02); b.y += (to.y - from.y) * hit.t + hit.ny * ((hit.depth || 0) + .02);
      reflect(b, hit, .06); left *= 1 - hit.t; if (hit.t < 1e-6) left = Math.max(0, left - 1e-5);
    }
    if (b.x < b.r) { b.x = b.r; b.vx = Math.abs(b.vx) * .55; }
    if (b.x > this.width - b.r) { b.x = this.width - b.r; b.vx = -Math.abs(b.vx) * .55; }
    b.spin += (b.vx / b.r - b.spin) * Math.min(1, dt * 8); b.angle += b.spin * dt;
    if (b.returning) {
      // A bell knocked back up can strike Korr (floor 3) or shatters on the ceiling ledge.
      if (this.villain.body.length && sweepTarget(motionFrom, b, b.r, { shapes: this.villain.body })) { b.dead = true; this.hitVillain(4, true); this.effect(b.x, b.y, 'bell-shoulder', .6); return; }
      if (b.y < (this.floor === 1 ? 144 : 12) + b.r || b.vy > 0) b.returning = false;
      if (b.y < (this.floor === 1 ? 144 : 12) + b.r) { b.dead = true; this.effect(b.x, b.y, 'bell-break', .6); return; }
    }
    if (this.ward && b.y + b.r >= this.ward.y) { b.dead = true; this.effect(b.x, this.ward.y, 'bell-break', .5); return; }
    const p = this.paddle;
    if (b.y + b.r >= p.y) {
      b.dead = true;
      if (!b.teaching && Math.abs(b.x - p.x) < p.w / 2 + b.r) { p.stun = GATEHOUSE_TIMING.stun; this.effect(p.x, p.y, 'paddle-stun', GATEHOUSE_TIMING.stun); }
      else this.effect(b.x, p.y, 'bell-break', .5);
    }
  }
  hitVillain(damage, stagger) {
    const v = this.villain; if (v.hp <= 0 || this.state !== 'play') return;
    v.hp -= Math.min(v.hp, damage); this.score += damage * 25;
    if (!v.hp) return this.finishFloor();
    if (stagger) { v.stage = 'stagger'; v.stageAt = this.time; v.until = this.time + 1.5; this.nextWarning = Math.max(this.nextWarning, this.floorTime + 1.5); }
    this.effect(v.x, v.y, stagger ? 'stagger' : 'korr-hit', stagger ? 1.5 : .2);
  }
  lose(reason) { if (this.state !== 'play') return; this.state = 'lost'; this.reason = reason; }
  continue() {
    if (this.continued || this.state !== 'lost') return false;
    this.continued = true; this.state = 'play'; this.reason = ''; this.lives = Math.max(2, this.lives);
    this.bells = []; this.ward = null; this.paddle.stun = 0; this.nextWarning = this.floorTime + 3; this.villain.stage = 'idle'; this.makeServe(); return true;
  }
  effect(x, y, kind, life, details = {}) {
    const fx = { x, y, kind, age: 0, life, ...details }; this.effects.push(fx); if (this.effects.length > 80) this.effects.shift(); return fx;
  }
}
