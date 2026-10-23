import { sweepTarget, overlapsTarget } from '../carrier-physics.js';
import { KORR_BODIES, rampPose, sweepMovingSegment, circleSweep, reflect, lerpPoint } from './bellforge.js';
import { SPEED, RAM, BACK_WARD, paddleBounce, tickRam, ramThrough, launchRam } from './ram.js';
import { plural, hpLeft } from '../near-miss.js';
import { VillainPool, stageLabel } from './stages.js';
import { STAGE_COUNT, GATEHOUSE_STAGES, siegePlan, stageBoard, reachView } from './gatehouse-stages.js';

// Gatehouse Siege: Kit storms the Menagerie gatehouse in four stages that build to Korr (design/phase2/stages-v2.md).
//   1 The Hoist (hook): Korr strides onto the battlements and cranks Lumi's lift up the portcullis, then leaves the winch
//     ratcheting: one notch every `notch` seconds. Clear the arch before she reaches the top and Lumi jams her hairpin in
//     the hoist; stage 2 then opens with Korr's winch pinned (his first crank jams by itself).
//   2 Drawbridge (build): two counterweight housings. Korr cranks the winch on the battlements: if no housing has been hit
//     for crankIdle seconds he winds a damaged (never a destroyed) housing back up by 1 HP after a crankTell telegraph; a
//     housing hit during the telegraph jams the crank (and hurts him). Dropping the bridge inside par smashes his bell rack:
//     stage 3 bells come RACK.slow times slower, and the smash knocks Korr down (the stage's 15% cap).
//   3 Murder holes (clash): winch the portcullis up while Korr drops bells through a murder hole. Korr peers through the
//     hole: a ball in its iron pocket strikes him, a bell knocked back up into it strikes harder. At 40% he flees the
//     gallery. Raise the gate before his third bell and the portcullis jams one dais vent: stage 4 has one bell vent.
//   4 Inner gate (showdown): the duel with Korr on his dais behind a brick wall, fury at 30%.
// Korr has one HP pool for the whole siege (stages.js VillainPool): before the showdown a cap turns a knockout into a
// knock-down (he escapes, a bonus drop and a loot chest fall, the HP carries) and he returns enraged. Lives, score, Kit
// charge and banked carry-overs persist between stages; Continue keeps the current stage and its progress.
// `floor` is the stage index (0-3); buildFloor(n) builds stage n.
const STEP = 1 / 240;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const GATEHOUSE_MODES = {
  easy: { hp: 24, housing: 4, notches: 8, interval: 10, tell: 1.8, bellCap: 1, coreHits: 18, crankIdle: 7, crankTell: 1.8, crankCap: 2, par: 26, notch: 10 },
  medium: { hp: 32, housing: 5, notches: 9, interval: 8.5, tell: 1.6, bellCap: 1, coreHits: 22, crankIdle: 6, crankTell: 1.5, crankCap: 3, par: 30, notch: 8.5 },
  hard: { hp: 40, housing: 6, notches: 10, interval: 7.5, tell: 1.4, bellCap: 2, coreHits: 26, crankIdle: 5, crankTell: 1.2, crankCap: 4, par: 36, notch: 7.5 },
};
// Korr's siege HP pool is this much of the old one-floor duel, so the showdown still meets 40% of it at least.
export const SIEGE_HP = 1.4;
// Battlements (stages 1-2): Korr, his winch and his bell rack stand on the parapet walk (top..bottom), above the ball's ceiling.
export const PARAPET = { top: 54, bottom: 72 };
// The portcullis Lumi is hoisted up in stage 1 (a solid) and her hoist: she starts at notch 0, Korr's crank takes her to
// `start`, then the ratchet climbs one notch every rules.notch seconds until `top`.
export const PORTCULLIS = { x: 120, y: PARAPET.bottom, w: 120, h: 104 };
export const HOIST = { start: 2, top: 6, step: 15 };
// A smashed bell rack: stage 3 bells come this many times slower, and the first one this much later.
export const RACK = { slow: 1.5, delay: 4, x: 112 };
export const GEM_SCORE = 50;
export const LOOT_CHEST = 150;
export const DULL = { after: 4, turn: .14 };
// Korr's damage from afar: a jammed crank, the smashed rack, a ball in the murder hole (more during his windup) and a bell
// knocked back up into the hole.
export const KORR_DAMAGE = { jam: 2, rack: 99, slot: 1, slotWindup: 3, bell: 4 };
export const GATEHOUSE_FLOORS = GATEHOUSE_STAGES.map(s => s.name);
export const GATEHOUSE_TIMING = { card: 1.2, crash: 1.1, climb: 1.2, defeat: 2.4, stun: .8, ward: 6, hook: 4.4, escape: 1.6, crack: 25, selfBreak: 6, tooth: 3.4, toothTell: .8 };
// Capsule powers: seconds where timed; drop chance per broken brick is the stage plan's times the mode's.
export const POWER_TIME = { wide: 12, slow: 8, shield: 10, fire: 8, laser: 7 };
export const DROP_MULT = { easy: 1.25, medium: 1, hard: .85 };
export const POWER_TIPS = { wide: 'WIDE: a longer paddle', slow: 'SLOW: the ball slows down', split: 'SPLIT: every ball becomes three', shield: 'SHIELD: a ward under the paddle',
  fire: 'FIRE: the ball burns through bricks and cracked iron', laser: 'LASER: the paddle fires bolts', burst: 'BURST: three more balls', titan: 'TITAN: the ball becomes a ram' };
export const MAX_BALLS = 8;
// The showdown's sliding tooth breaks off when this share of Korr's brick wall is left.
export const TOOTH_FALLS = .25;
// Static ramps: a bell rolls down them and drops off the low end; balls rebound from them.
// The art is anchored on the measured top-face line a..b and scales with its length; the collider (body) is the whole beam
// as drawn. For a 74u ramp that is 13.5u deep with the top face 1.2u above that line, starting at the hinge roller 11u
// before a; shorter ramps scale the same proportions, so the collider always matches the drawn beam.
export const RAMP_BODY = { length: 74, back: 11, drop: 5.55, thickness: 13.5 };
const ramp = (id, x, y, length, angle) => {
  const r = { id, pivot: { x, y }, contactOffset: { x: 0, y: 0 }, length, angle, previousAngle: angle, thickness: 8 };
  const k = length / RAMP_BODY.length;
  r.body = { pivot: r.pivot, contactOffset: { x: -RAMP_BODY.back * k, y: RAMP_BODY.drop * k }, length: length + RAMP_BODY.back * k, angle, previousAngle: angle, thickness: RAMP_BODY.thickness * k };
  return Object.assign(r, rampPose(r));
};
const BELL_R = 11.5, BELL_LIFE = 7;
// Korr's murder hole on stage 3: a slot in the gallery underside, 2u proud of the ceiling.
export const SLOT = { x: 284, y: 138, w: 32, h: 8 };

export class Gatehouse {
  constructor({ width = 360, height = 700, difficulty = 'easy', paddleY = height - 90, floor = 0 } = {}) {
    if (!Number.isFinite(width) || !Number.isFinite(height) || width < 360 || height < 700 || !Number.isFinite(paddleY) || paddleY > height - 30 || paddleY < 580) throw new RangeError('Gatehouse needs its full portrait playfield');
    this.width = width; this.height = height; this.difficulty = Object.hasOwn(GATEHOUSE_MODES, difficulty) ? difficulty : 'medium';
    this.rules = GATEHOUSE_MODES[this.difficulty]; this.time = 0; this.serial = 0; this.lives = 3; this.score = 0;
    this.state = 'play'; this.paused = false; this.continued = false; this.reason = ''; this.effects = [];
    this.charge = 0; this.chargeBank = 0; this.ward = null; this.gems = 0; this.rackSmashed = false;
    this.plan = siegePlan(); this.stageCount = STAGE_COUNT; this.siege = true;
    this.pool = new VillainPool(Math.round(this.rules.hp * SIEGE_HP), this.plan);
    this.knockdowns = 0; this.hairpin = false; this.ventJammed = false; this.hauled = false; this.ballsLost = 0; this.stageLog = [];
    this.capsules = []; this.bolts = []; this.powersSeen = new Set(); this.tip = null; this.timers = { wide: 0, slow: 0, fire: 0, laser: 0, laserCd: 0 };
    this.paddle = { x: width / 2, px: width / 2, y: paddleY, w: 100, baseW: 100, h: 14, targetX: width / 2, vx: 0, stun: 0, streak: 0, armed: false };
    this.buildFloor(clamp(floor | 0, 0, STAGE_COUNT - 1));
  }
  get stage() { return this.floor; }
  get stageInfo() { return GATEHOUSE_STAGES[this.floor]; }
  get stageLabel() { return stageLabel(this.floor, STAGE_COUNT); }
  get stagePlan() { return this.plan[this.floor]; }
  get stagesCleared() { return this.state === 'won' ? STAGE_COUNT : this.floor; }
  buildStage(n) { return this.buildFloor(n); }
  buildFloor(n) {
    const W = this.width, rules = this.rules, plan = this.plan[n];
    this.floor = n; this.floorTime = 0; this.active = false; this.phase = 'card'; this.card = { t: 0 }; this.transition = 0;
    this.bells = []; this.solids = []; this.housings = []; this.wheel = null; this.ramps = []; this.holes = []; this.gate = null; this.dais = null;
    this.capsules = []; this.bolts = []; this.ward = null; this.tip = null; this.bellCount = 0; this.stageGems = 0;
    for (const k of Object.keys(this.timers)) this.timers[k] = 0;
    this.paddle.w = this.paddle.baseW; this.paddle.streak = 0; this.paddle.armed = false;
    this.pool.stage = n; this.ballSpeed = SPEED * plan.speed; this.attack = plan.attack ?? 1;
    this.villain = { x: 180, y: 100, foot: { x: 180, y: 100 }, hp: this.pool.hp, maxHP: this.pool.maxHP, stage: 'idle', stageAt: 0, until: 0, body: [], solid: false, defeat: null, gone: false, walk: null };
    this.nextWarning = 6; this.teachingDone = false; this.nextTeaching = false;
    this.stageStart = { time: this.time, lives: this.ballsLost, knockdowns: this.knockdowns, score: this.score };
    // The stage board: bricks (kind brick, gem, chest, armour), riveted iron bars, chambers and the sliding tooth.
    const board = stageBoard(n, { paddleY: this.paddle.y, difficulty: this.difficulty });
    this.board = board;
    this.bricks = board.cells.map((c, i) => ({ id: `brick-${n}-${i}`, x: c.x, y: c.y, w: c.w, h: c.h, type: c.type, kind: c.kind, gem: c.gem,
      hp: c.type === 'armour' || c.type === 'chest' ? 2 : 1, maxHP: c.type === 'armour' || c.type === 'chest' ? 2 : 1, colour: ['coral', 'ivory', 'sage'][(c.row + c.slot + 9) % 3] }));
    this.bars = board.bars.map(b => ({ ...b, cracked: false, broken: false, crackedAt: 0 }));
    this.chambers = board.chambers.map(c => ({ ...c, idle: 0, cracked: false }));
    this.movers = board.movers.map((m, i) => ({ ...m, pose: 0, x: m.poses[0].x, y: m.poses[0].y, kind: 'steel', next: Infinity, tellAt: Infinity, phase: i * .9 }));
    this.winch = null; this.rack = null; this.hoist = null; this.drawbridge = null; this.slot = null; this.hook = null;
    if (n === 0) {
      // The battlements over the portcullis: Korr walks in, cranks Lumi's lift up two notches and walks off (the hook).
      this.solids.push({ id: 'parapet', type: 'rect', x: 0, y: PARAPET.top, w: W, h: PARAPET.bottom - PARAPET.top });
      this.solids.push({ id: 'portcullis', type: 'rect', ...PORTCULLIS });
      Object.assign(this.villain, { x: 420, foot: { x: 420, y: PARAPET.top + 2 }, solid: false, gone: false });
      this.winch = { x: 222, y: PARAPET.top, idle: 0, stage: 'idle', at: 0, until: 0, target: null, heals: 0, hoist: true };
      this.hoist = { level: 0, shown: 0, wait: 0, lost: false, jammed: false };
      this.hook = { t: 0 };
    }
    if (n === 1) {
      this.drawbridge = { x: 96, y: 116, w: 168, h: 24, down: 0 };
      this.solids.push({ id: 'parapet', type: 'rect', x: 0, y: PARAPET.top, w: W, h: PARAPET.bottom - PARAPET.top });
      this.solids.push({ id: 'drawbridge', type: 'rect', x: 96, y: 116, w: 168, h: 24 });
      for (const [i, x] of [[0, 26], [1, 278]]) this.housings.push({ id: `housing-${i}`, x, y: 142, w: 56, h: 50, hp: rules.housing, maxHP: rules.housing });
      // Korr on the parapet walk (scenery above the ceiling: no collider), cranking the winch at his left.
      Object.assign(this.villain, { x: 268, y: 30, foot: { x: 268, y: PARAPET.top + 2 }, solid: false });
      this.winch = { x: 222, y: PARAPET.top, idle: 0, stage: 'idle', at: 0, until: 0, target: null, heals: 0, pinned: this.hairpin };
      this.rack = { x: RACK.x, y: PARAPET.top, state: 'loaded', at: 0 };
    }
    if (n === 2) {
      // The gallery ledge spans the whole width, so the ball never climbs behind Korr.
      this.solids.push({ id: 'ledge', type: 'rect', x: 0, y: 118, w: W, h: 26 });
      this.gate = { posts: [{ x: 130, y: 150, w: 14, h: 112 }, { x: 216, y: 150, w: 14, h: 112 }], lintel: { x: 130, y: 150, w: 100, h: 14 },
        door: { x: 144, top: 164, bottom: 262, y: 262 }, need: rules.notches };
      for (const r of [...this.gate.posts, this.gate.lintel]) this.solids.push({ id: `gate-${this.solids.length}`, type: 'rect', ...r });
      this.wheel = { x: 62, y: 206, r: 26, hitR: 28, notches: 0, angle: 0, spin: 0 };
      this.holes = [{ x: 300, y: 158 }];
      // Bells roll outward and drop down the right lane, which the board keeps clear.
      this.ramps = [ramp('ramp-r', 278, 224, 40, .3)];
      Object.assign(this.villain, { x: 300, y: 76, foot: { x: 300, y: 118 }, solid: false });
      // Korr's bell rack stands on the gallery (above the ceiling); smashed on stage 2, it slows his bells here.
      this.rack = { x: 70, y: 118, state: this.rackSmashed ? 'smashed' : 'loaded', at: 0 };
      if (this.rackSmashed) this.nextWarning += RACK.delay;
      this.slot = { ...SLOT };
    }
    if (n === 3) {
      // Korr stands on a recessed dais (scenery, no collider, so his whole body stays hittable) and kicks bells off its ends.
      // The floor 1/2 payoffs show on the dais: the wrecked rack beside it, and the portcullis jammed in the right vent.
      Object.assign(this.villain, { x: 180, y: 150, foot: { x: 180, y: 206 }, solid: true });
      this.dais = { x: 120, y: 206, w: 120, h: 16 };
      this.holes = this.ventJammed ? [{ x: 100, y: 214 }] : [{ x: 100, y: 214 }, { x: 260, y: 214 }];
      this.ramps = [ramp('ramp-l', 116, 236, 74, Math.PI - .2), ramp('ramp-r', 244, 236, 74, .2)];
      this.nextWarning = 5;
      this.enraged = this.knockdowns > 0;
      if (this.enraged) this.effect(180, 120, 'korr-roar', 1.2);
    }
    this.updateBody(); this.makeServe(); this.phase = 'card';
  }
  // The ball's top bound: the parapet underside (stages 1-2), the gallery ledge (stage 3) or the vault roof (stage 4).
  get ceiling() { return this.floor <= 1 ? PARAPET.bottom : this.floor === 2 ? 144 : 12; }
  // Stage 2 par: seconds left to drop the bridge on Korr's bell rack (0 once missed).
  get parLeft() { return this.floor === 1 && this.rack?.state === 'loaded' ? Math.max(0, this.rules.par - this.floorTime) : 0; }
  // Fixed colliders other than the board's iron, for the chamber reach check.
  reachView() {
    const solids = this.solids.filter(s => s.id !== 'parapet' && s.id !== 'ledge');
    if (this.gate) solids.push({ x: this.gate.door.x, y: this.gate.door.top, w: 72, h: this.gate.door.bottom - this.gate.door.top });
    for (const h of this.housings) solids.push({ x: h.x, y: h.y, w: h.w, h: h.h });
    return reachView({ bars: this.bars, chambers: this.chambers }, { paddleY: this.paddle.y, ceiling: this.ceiling, solids, width: this.width, paddleW: this.paddle.baseW });
  }
  setTarget(x) { if (!Number.isFinite(x)) return false; this.paddle.targetX = clamp(x, this.paddle.w / 2 + 6, this.width - this.paddle.w / 2 - 6); return true; }
  pause(value) { this.paused = !!value; }
  makeServe() {
    this.phase = 'serve'; this.serveTime = 0;
    this.balls = [{ id: ++this.serial, x: this.paddle.x, y: this.paddle.y - 8, px: this.paddle.x, py: this.paddle.y - 8, vx: 0, vy: 0, r: 6, caught: true, dead: false, ram: 0, ramBricks: 0, contacts: new Set() }];
  }
  // A tap skips the stage card; its release serves as usual.
  skipCard() { if (this.phase !== 'card') return false; this.phase = 'serve'; this.card = null; return true; }
  launch(angle = -Math.PI / 2) {
    if (this.paused || this.state !== 'play' || this.phase !== 'serve' || !Number.isFinite(angle)) return false;
    const a = clamp(angle, -Math.PI + .25, -.25), b = this.balls.find(q => q.caught) || this.balls[0];
    b.caught = false; b.vx = Math.cos(a) * this.ballSpeed; b.vy = Math.sin(a) * this.ballSpeed;
    this.phase = 'play'; this.active = true; this.backHold = false; return true;
  }
  canActivate(id = 'ward', { ignorePause = false } = {}) {
    return ['ward', 'echo'].includes(id) && (ignorePause || !this.paused) && this.state === 'play' && ['play', 'serve', 'card'].includes(this.phase) && this.charge >= 100 - 1e-7 && !this.ward;
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
    if (this.tip && (this.tip.t += dt) > 2.6) this.tip = null;
    if (this.phase === 'crash' || this.phase === 'climb' || this.phase === 'defeat') return this.updateTransition(dt);
    if (this.phase === 'card') {
      for (const b of this.balls) if (b.caught) { b.px = b.x; b.py = b.y; b.x = p.x; b.y = p.y - 8; }
      if ((this.card.t += dt) >= GATEHOUSE_TIMING.card) this.skipCard();
      return;
    }
    this.updateScript(dt);
    if (this.phase === 'serve') {
      const b = this.balls.find(q => q.caught) || this.balls[0]; b.px = b.x; b.py = b.y; b.x = p.x; b.y = p.y - 8;
      if (!this.backHold) { this.serveTime += dt; if (this.serveTime >= (this.active ? 3 : 8)) this.launch(-Math.PI / 2 + .15); } // after a Continue the serve waits for the player
    }
    if (!this.active) return;
    this.time += dt; this.floorTime += dt;
    const credit = Math.min(this.chargeBank, dt, (100 - this.charge) * this.rules.coreHits / 100);
    this.chargeBank -= credit; this.charge = Math.min(100, this.charge + credit / this.rules.coreHits * 100);
    if (this.charge > 100 - 1e-7) { this.charge = 100; this.chargeBank = 0; }
    if (this.ward && (this.ward.remaining -= dt) <= 0) this.ward = null;
    this.updatePowers(dt);
    if (this.gate) { const d = this.gate.door, target = d.bottom - (d.bottom - d.top) * Math.min(1, this.wheel.notches / this.gate.need); d.y += clamp(target - d.y, -70 * dt, 70 * dt); }
    if (this.wheel) { this.wheel.spin *= Math.exp(-3 * dt); this.wheel.angle += this.wheel.spin * dt; }
    this.updateHoist(dt); this.updateVillain(); this.updateWinch(dt); this.updateBody(); this.updateIron(dt);
    for (const b of this.bells) this.moveBell(b, dt);
    this.bells = this.bells.filter(b => !b.dead);
    this.updateCapsules(dt); this.updateBolts(dt);
    if (this.phase !== 'play' && this.phase !== 'serve') return;
    const slow = this.timers.slow > 0 ? .72 : 1;
    for (const b of this.balls) if (!b.caught && !b.dead) { this.moveBall(b, dt * slow); if (this.phase !== 'play') return; }
    this.balls = this.balls.filter(b => !b.dead);
    if (!this.balls.length) { this.lives--; this.ballsLost++; p.streak = 0; if (this.lives <= 0) this.lose('No balls remaining'); else this.makeServe(); }
  }
  // ---------- Korr's scripted moves: the stage 1 hook and every escape ----------
  updateScript(dt) {
    const v = this.villain, h = this.hook;
    if (h && !h.done) {
      const t = (h.t += dt), T = GATEHOUSE_TIMING.hook, hz = this.hoist;
      if (t < 1) { v.foot.x = 420 - 158 * smooth(t); v.walk = 1; v.stage = 'idle'; }
      else if (t < 2.6) { v.foot.x = 262; v.walk = null; if (v.stage !== 'windup') { v.stage = 'windup'; v.stageAt = this.time; this.effect(this.winch.x, PARAPET.top - 10, 'hoist-crank', 1.6); } hz.level = HOIST.start * smooth((t - 1) / 1.6); }
      else if (t < 3.2) { hz.level = HOIST.start; if (v.stage !== 'release') { v.stage = 'release'; v.stageAt = this.time; this.effect(v.foot.x, v.foot.y - 40, 'korr-gloat', .9); } }
      else if (t < T) { v.stage = 'idle'; v.walk = -1; v.foot.x = 262 + 170 * smooth((t - 3.2) / (T - 3.2)); }
      else { h.done = true; v.gone = true; v.walk = null; hz.level = HOIST.start; }
      hz.shown = hz.level;
    }
    const e = v.escape;
    if (e) {
      e.t += dt; const k = smooth((e.t - .5) / (GATEHOUSE_TIMING.escape - .5));
      v.stage = e.t < .5 ? 'stagger' : 'idle'; v.walk = e.t < .5 ? null : e.dir;
      if (e.t >= .5) v.foot.x = e.from + e.dir * 260 * k;
      if (e.t >= GATEHOUSE_TIMING.escape) { v.escape = null; v.gone = true; v.walk = null; v.body = []; }
    }
  }
  // Stage 1: the hoist ratchets Lumi up one notch every rules.notch s once Korr has left; at the top he hauls her in.
  updateHoist(dt) {
    const h = this.hoist; if (!h || !this.hook?.done || h.lost || h.jammed) return;
    h.wait += dt;
    if (h.wait >= this.rules.notch) {
      h.wait = 0; h.level = Math.min(HOIST.top, Math.round(h.level) + 1);
      this.effect(PORTCULLIS.x + PORTCULLIS.w / 2, this.liftY(), 'hoist-notch', .5);
      if (h.level >= HOIST.top) { h.lost = true; this.hauled = true; this.effect(180, PARAPET.top, 'hoist-top', 1.6); }
    }
    h.shown += clamp(h.level - h.shown, -dt * 4, dt * 4);
  }
  // Lumi's lift floor (stage 1): from the portcullis foot up to the battlements.
  liftY() { const h = this.hoist; return PORTCULLIS.y + PORTCULLIS.h - 4 - (h ? h.shown : 0) * HOIST.step; }
  get hoistLeft() { const h = this.hoist; return h && !h.lost && !h.jammed ? (HOIST.top - h.level - 1) * this.rules.notch + (this.rules.notch - h.wait) : 0; }
  // Stage clear: freeze play, show the crash, the jammed hoist or Korr's defeat, then climb to the next stage.
  finishFloor() {
    this.bells = []; this.ward = null; this.nextWarning = Infinity; this.capsules = []; this.bolts = [];
    for (const b of this.balls) { b.vx = 0; b.vy = 0; b.caught = true; b.ram = 0; b.r = 6; }
    this.stageLog.push({ stage: this.floor, time: +(this.time - this.stageStart.time).toFixed(2), ballsLost: this.ballsLost - this.stageStart.lives, knockdowns: this.knockdowns - this.stageStart.knockdowns });
    const v = this.villain;
    if (this.floor === 3) { this.phase = 'defeat'; this.transition = GATEHOUSE_TIMING.defeat; v.stage = 'defeated'; v.body = []; v.defeat = { age: 0 }; this.effect(v.x, v.y, 'korr-defeat', GATEHOUSE_TIMING.defeat); return; }
    this.phase = this.floor === 1 ? 'crash' : 'climb';
    this.transition = this.floor === 1 ? GATEHOUSE_TIMING.crash : GATEHOUSE_TIMING.climb;
    if (this.stageGems && this.floor !== 1) { this.score += this.stageGems * GEM_SCORE; this.effect(180, 300, 'loot-shower', 1.6, { n: this.stageGems }); }
    if (this.floor === 0) {
      const h = this.hoist;
      // Cleared before Lumi reached the top: she jams her hairpin in the hoist, and Korr's stage 2 winch starts pinned.
      if (!h.lost) { h.jammed = true; this.hairpin = true; this.effect(180, this.liftY(), 'hoist-jam', GATEHOUSE_TIMING.climb + .6, { keep: true }); }
      return;
    }
    if (this.floor === 1) {
      const db = this.drawbridge, w = this.winch;
      this.solids = this.solids.filter(s => s.id !== 'drawbridge'); this.effect(180, db.y + 12, 'drawbridge-crash', GATEHOUSE_TIMING.crash);
      w.stage = 'idle'; w.target = null; if (!v.gone && !v.escape) v.stage = this.rack.state === 'loaded' ? 'stagger' : 'release';   // smashed rack: Korr reels
      // Under par the falling bridge rips the hoist chain off Korr's bell rack; the banked gems shower out of the crash.
      if (this.rack.state === 'loaded') { this.rackSmashed = true; this.rack.state = 'smashed'; this.rack.at = this.time; this.effect(this.rack.x, this.rack.y - 18, 'rack-smash', 1.6); this.hurtKorr(KORR_DAMAGE.rack, false); }
      this.stageLog[this.stageLog.length - 1].knockdowns = this.knockdowns - this.stageStart.knockdowns;   // the smash's knock-down counts for this stage
      if (this.stageGems) { this.score += this.stageGems * GEM_SCORE; this.effect(180, db.y + 214, 'loot-shower', 1.6, { n: this.stageGems }); }
      return;
    }
    // Stage 3: the gate is up. Before Korr's third bell the portcullis jams one of his dais vents for the showdown.
    if (this.bellCount < 3) { this.ventJammed = true; this.effect(180, 200, 'vent-jam', GATEHOUSE_TIMING.climb + .6, { keep: true }); }
    this.effect(180, 200, 'gate-open', GATEHOUSE_TIMING.climb);
  }
  updateTransition(dt) {
    this.time += dt; this.transition = Math.max(0, this.transition - dt);
    if (this.phase === 'crash' || this.phase === 'climb') this.updateScript(dt);   // a knocked-down Korr keeps fleeing over the crash
    if (this.phase === 'crash') { this.drawbridge.down = 1 - this.transition / GATEHOUSE_TIMING.crash; if (!this.transition) { this.phase = 'climb'; this.transition = GATEHOUSE_TIMING.climb; } return; }
    if (this.phase === 'defeat') { this.villain.defeat.age += dt; if (!this.transition) this.state = 'won'; return; }
    if (this.hoist?.jammed) this.hoist.shown = this.hoist.level;
    if (!this.transition) { this.buildFloor(this.floor + 1); this.active = true; }
  }
  // Seconds between bells: stage 3 runs at the clash cadence (slower after the rack was smashed); the showdown at its own,
  // one attack faster when Korr returns enraged and faster again in fury.
  get fury() { return this.floor === 3 && this.pool.hp <= this.pool.maxHP * .3; }
  get bellInterval() {
    if (this.floor === 2) return this.rules.interval * this.attack * (this.rackSmashed ? RACK.slow : 1);
    if (this.floor === 3) return this.rules.interval * (this.fury ? .7 : 1) * (this.enraged ? .85 : 1);
    return this.rules.interval;
  }
  updateVillain() {
    const v = this.villain; if (this.floor <= 1 || v.hp <= 0 || v.gone || v.escape) return;
    if (['stagger', 'recover', 'release'].includes(v.stage)) {
      if (this.time < v.until) return;
      if (v.stage === 'release') { v.stage = 'recover'; v.stageAt = this.time; v.until = this.time + .85; return; }
      v.stage = 'idle'; v.stageAt = this.time;
    }
    if (v.stage === 'windup') {
      if (this.time < v.until) return;
      this.releaseBell(this.nextTeaching); v.stage = 'release'; v.stageAt = this.time; v.until = this.time + .45;
      // Scheduled on the floor clock (it was the run clock, which starved later floors of bells after the teaching one).
      this.nextWarning = this.floorTime + (this.nextTeaching ? 4 : this.bellInterval - this.rules.tell); this.teachingDone = true; return;
    }
    if (this.floorTime >= this.nextWarning && this.bells.length < this.rules.bellCap) {
      this.nextTeaching = !this.teachingDone; v.stage = 'windup'; v.stageAt = this.time; v.until = this.time + this.rules.tell;
      v.hole = this.holes[this.serial % this.holes.length];
      this.effect(v.hole.x, v.hole.y, 'bell-warning', this.rules.tell);
    }
  }
  // Korr's winch (stage 2 only): the idle clock fills while a damaged housing stands and nothing hits a housing.
  updateWinch(dt) {
    const w = this.winch, v = this.villain; if (!w || w.hoist || this.phase !== 'play' && this.phase !== 'serve') return;
    if (this.rack.state === 'loaded' && this.floorTime >= this.rules.par) {
      this.rack.state = 'gone'; this.rack.at = this.time; this.effect(this.rack.x, this.rack.y - 18, 'par-missed', 1.2);
      if (w.stage === 'idle' && !v.gone && !v.escape) { v.stage = 'release'; v.until = this.time + .6; }
    }
    if (v.gone || v.escape) { w.stage = 'idle'; w.target = null; return; }   // knocked down: Korr has left his winch
    if (w.stage === 'idle' && ['release', 'stagger'].includes(v.stage) && this.time >= v.until) v.stage = 'idle';
    if (w.stage === 'crank') {
      if (!(w.target.hp > 0)) { w.stage = 'idle'; w.target = null; v.stage = 'idle'; return; }   // never winds a destroyed housing
      if (this.floorTime < w.until) return;
      const h = w.target; h.hp = Math.min(h.maxHP, h.hp + 1); w.heals++; w.stage = 'idle'; w.target = null; w.idle = 0;
      v.stage = 'release'; v.until = this.time + .6;
      this.effect(h.x + h.w / 2, h.y + h.h + 7.5, 'housing-heal', .9, { pip: h.hp - 1, n: h.maxHP }); return;
    }
    const target = w.heals < this.rules.crankCap && this.housings.filter(h => h.hp > 0 && h.hp < h.maxHP).sort((a, b) => a.hp / a.maxHP - b.hp / b.maxHP)[0];
    if (!target) { w.idle = 0; return; }
    w.idle += dt;
    if (w.idle < this.rules.crankIdle * this.attack) return;
    // Lumi's hairpin (stage 1 payoff) is still in the hoist: Korr's first crank jams by itself.
    if (w.pinned) { w.pinned = false; w.idle = 0; this.jamCrank('hairpin'); return; }
    w.stage = 'crank'; w.target = target; w.at = this.floorTime; w.until = this.floorTime + this.rules.crankTell;
    v.stage = 'windup'; v.stageAt = this.time;
    this.effect(target.x + target.w / 2, target.y + target.h / 2, 'winch-tell', this.rules.crankTell, { housing: target.id });
  }
  jamCrank(cause = 'hit') {
    const w = this.winch, v = this.villain;
    w.stage = 'idle'; w.target = null; v.stage = 'stagger'; v.until = this.time + .7; this.score += 25;
    this.effect(w.x, w.y - 18, 'crank-jam', .9, { cause });
    this.hurtKorr(KORR_DAMAGE.jam, false);
  }
  updateBody() {
    const v = this.villain;
    const pose = v.stage === 'recover' ? 'stagger' : v.stage;
    v.body = v.solid && v.hp > 0 && !v.gone ? (KORR_BODIES[pose] || KORR_BODIES.idle).map(([x, y, r]) => ({ type: 'circle', x: v.foot.x + x, y: v.foot.y + y, r })) : [];
    if (v.pose !== pose) { v.pose = pose; for (const b of this.balls || []) if (!b.caught) this.eject(b, v.body); }
  }
  // A keypose swap must never leave a ball inside Korr: push it out along the deepest circle's normal, turning it away.
  // In a crease between two circles that can ping-pong, so after a few tries the ball is pushed straight away from the
  // centre of Korr's biggest circle until it is clear of every circle.
  eject(b, shapes) {
    const deepest = () => {
      let worst = null;
      for (const c of shapes) { const d = Math.hypot(b.x - c.x, b.y - c.y), depth = c.r + b.r - d; if (depth > 0 && (!worst || depth > worst.depth)) worst = { c, d, depth }; }
      return worst;
    };
    for (let i = 0; i < 6; i++) {
      const worst = deepest(); if (!worst) return;
      const nx = worst.d > 1e-6 ? (b.x - worst.c.x) / worst.d : 0, ny = worst.d > 1e-6 ? (b.y - worst.c.y) / worst.d : 1;
      b.x += nx * (worst.depth + .05); b.y += ny * (worst.depth + .05); reflect(b, { nx, ny });
    }
    if (!deepest()) return;
    const core = shapes.reduce((a, c) => c.r > a.r ? c : a), d = Math.hypot(b.x - core.x, b.y - core.y);
    const nx = d > 1e-6 ? (b.x - core.x) / d : 0, ny = d > 1e-6 ? (b.y - core.y) / d : 1;
    for (let i = 0; i < 200 && deepest(); i++) { b.x += nx; b.y += ny; }
    b.x += nx * .05; b.y += ny * .05; reflect(b, { nx, ny });
  }
  // ---------- iron: the chambers' safety valve and the sliding tooth ----------
  updateIron(dt) {
    // A chamber no ball has entered for GATEHOUSE_TIMING.crack s shows a hairline crack in its gap bar: fire or a ram breaks
    // it, and on the showdown it breaks by itself GATEHOUSE_TIMING.selfBreak s later. Nobody stays stuck.
    for (const c of this.chambers) {
      if (this.balls.some(b => !b.caught && !b.dead && b.x > c.x && b.x < c.x + c.w && b.y > c.y && b.y < c.y + c.h)) { c.idle = 0; continue; }
      if (c.cracked || (c.idle += dt) < GATEHOUSE_TIMING.crack) continue;
      const bar = this.bars.find(b => !b.broken && b.glint && this.nearChamber(b, c));
      c.cracked = true; if (!bar) continue;
      bar.cracked = true; bar.crackedAt = this.floorTime; this.effect(bar.x + bar.w / 2, bar.y + bar.h / 2, 'bar-crack', .8);
    }
    if (this.floor === 3) for (const b of this.bars) if (b.cracked && !b.broken && this.floorTime - b.crackedAt >= GATEHOUSE_TIMING.selfBreak) this.breakBar(b);
    // The tooth is part of Korr's wall: once a quarter of the wall is left it breaks off and Korr stands open.
    for (const m of this.movers) if (!m.broken && this.bricksLeft <= this.board.cells.length * TOOTH_FALLS) this.breakBar(m);
    for (const m of this.movers) {
      if (m.broken) continue;
      if (m.next === Infinity) { m.next = this.floorTime + GATEHOUSE_TIMING.tooth + m.phase; continue; }
      m.tell = this.floorTime >= m.next - GATEHOUSE_TIMING.toothTell;
      if (this.floorTime < m.next) continue;
      m.pose = 1 - m.pose; m.x = m.poses[m.pose].x; m.y = m.poses[m.pose].y; m.next = this.floorTime + GATEHOUSE_TIMING.tooth; m.tell = false;
      this.effect(m.x + m.w / 2, m.y, 'tooth-slide', .3);
      for (const b of [...this.balls, ...this.bells]) if (!b.caught && !b.dead) this.pushOut(b, m);
    }
  }
  nearChamber(b, c) { return b.x < c.x + c.w + 1 && b.x + b.w > c.x - 1 && b.y < c.y + c.h + 1 && b.y + b.h > c.y - 1; }
  // Move a ball (or bell) that a snapped bar landed on out through the nearest face, turning it away from the bar.
  pushOut(b, r) {
    const l = b.x + b.r - r.x, rt = r.x + r.w - (b.x - b.r), u = b.y + b.r - r.y, d = r.y + r.h - (b.y - b.r);
    if (l <= 0 || rt <= 0 || u <= 0 || d <= 0) return;
    const m = Math.min(l, rt, u, d);
    if (m === u) { b.y -= u + .05; if (b.vy > 0) b.vy = -b.vy; } else if (m === d) { b.y += d + .05; if (b.vy < 0) b.vy = -b.vy; }
    else if (m === l) { b.x -= l + .05; if (b.vx > 0) b.vx = -b.vx; } else { b.x += rt + .05; if (b.vx < 0) b.vx = -b.vx; }
  }
  breakBar(bar) { if (bar.broken) return; bar.broken = true; this.score += 40; this.effect(bar.x + bar.w / 2, bar.y + bar.h / 2, 'bar-break', .9, { w: bar.w, h: bar.h }); }
  releaseBell(teaching = false) {
    const h = this.villain.hole || this.holes[0];
    if (!h || this.bells.length >= this.rules.bellCap) return false;
    const b = { id: ++this.serial, x: h.x, y: h.y, px: h.x, py: h.y, vx: 0, vy: 40, r: BELL_R, hp: 2, age: 0, angle: 0, spin: 0, returning: false, teaching, dead: false };
    this.bellCount++;
    this.bells.push(b); this.effect(b.x, b.y, 'bell-release', .3); return b;
  }
  targets() {
    const t = this.bricks.filter(b => b.hp > 0).map(b => ({ id: b.id, kind: 'brick', item: b, type: 'rect', x: b.x, y: b.y, w: b.w, h: b.h }));
    for (const b of this.bars) if (!b.broken) t.push({ id: b.id, kind: 'steel', item: b, type: 'rect', x: b.x, y: b.y, w: b.w, h: b.h });
    for (const m of this.movers) if (!m.broken) t.push({ id: m.id, kind: 'steel', item: m, type: 'rect', x: m.x, y: m.y, w: m.w, h: m.h });
    for (const h of this.housings) if (h.hp > 0) t.push({ id: h.id, kind: 'housing', item: h, shapes: [{ type: 'rect', x: h.x, y: h.y + 11, w: h.w, h: h.h - 11 }, { type: 'rect', x: h.x + 21, y: h.y, w: 14, h: 11 }] });
    for (const s of this.solids) t.push({ id: s.id, kind: 'solid', type: 'rect', x: s.x, y: s.y, w: s.w, h: s.h });
    if (this.gate) { const d = this.gate.door; if (d.y - d.top > 1) t.push({ id: 'door', kind: 'solid', type: 'rect', x: d.x, y: d.top, w: 72, h: d.y - d.top }); }
    if (this.wheel) t.push({ id: 'wheel', kind: 'wheel', item: this.wheel, type: 'circle', x: this.wheel.x, y: this.wheel.y, r: this.wheel.hitR });
    if (this.slot && !this.villain.gone && !this.villain.escape) t.push({ id: 'slot', kind: 'slot', item: this.slot, type: 'rect', ...this.slot });
    if (this.villain.body.length) t.push({ id: 'korr', kind: 'villain', shapes: this.villain.body });
    return t;
  }
  moveBall(b, dt) {
    b.px = b.x; b.py = b.y;
    const targets = this.targets(), p = this.paddle, fire = this.timers.fire > 0;
    for (const id of b.contacts) {
      const bell = typeof id === 'number' && this.bells.find(v => v.id === id), target = !bell && targets.find(t => t.id === id);
      if (bell ? Math.hypot(b.x - bell.x, b.y - bell.y) > b.r + bell.r + .1 : !target || !overlapsTarget({ ...b, r: b.r + .1 }, target)) b.contacts.delete(id);
    }
    tickRam(this, b, dt); b.dull = (b.dull || 0) + dt; b.fire = fire;
    let left = dt;
    for (let pass = 0; pass < 8 && left > 1e-8 && !b.dead; pass++) {
      const from = { x: b.x, y: b.y }, to = { x: b.x + b.vx * left, y: b.y + b.vy * left }, hits = [], elapsed = 1 - left / dt;
      const add = (hit, kind, item) => { if (hit) hits.push({ ...hit, kind, item }); };
      const ceiling = this.ceiling + b.r;
      if (b.vx < 0 && to.x < b.r) add({ t: (b.r - b.x) / (to.x - b.x), nx: 1, ny: 0 }, 'wall');
      if (b.vx > 0 && to.x > this.width - b.r) add({ t: (this.width - b.r - b.x) / (to.x - b.x), nx: -1, ny: 0 }, 'wall');
      if (b.vy < 0 && to.y < ceiling) add({ t: Math.max(0, (ceiling - b.y) / (to.y - b.y)), nx: 0, ny: 1 }, 'wall');
      for (const t of targets) if (t.item?.hp !== 0 && !t.item?.broken) add(sweepTarget(from, to, b.r, t), t.kind, t);
      for (const r of this.ramps) add(sweepMovingSegment(from, to, b.r, r.body, left), 'ramp', r);
      for (const bell of this.bells) if (!bell.dead) add(circleSweep(from, to, b.r, lerpPoint({ x: bell.px, y: bell.py }, bell, elapsed), bell, bell.r), 'bell', bell);
      if (this.ward && b.vy > 0 && to.y > this.ward.y - b.r) add({ t: Math.max(0, (this.ward.y - b.r - b.y) / (to.y - b.y)), nx: 0, ny: -1 }, 'ward');
      if (b.vy > 0 && b.y <= p.y + b.r) add(sweepTarget(from, to, b.r, { type: 'rect', x: p.px - p.w / 2, y: p.y, w: p.w, h: p.h, vx: p.vx }, elapsed * dt, left), 'paddle', p);
      hits.sort((a, q) => a.t - q.t); const hit = hits[0];
      if (!hit) { b.x = to.x; b.y = to.y; break; }
      b.x += (to.x - from.x) * hit.t; b.y += (to.y - from.y) * hit.t;
      // A ram ball ploughs through ordinary bricks (not armour or chests); a fire ball burns through every brick; either
      // breaks a cracked iron bar. The flight continues unchanged.
      if (hit.kind === 'brick' && ramThrough(this, b, hit.item.item)) { left *= 1 - hit.t; continue; }
      if (hit.kind === 'brick' && fire && !(b.ram > 0)) { const br = hit.item.item; while (br.hp > 0) this.hitBrick(br, b); if (this.phase !== 'play') return; left *= 1 - hit.t; continue; }
      if (hit.kind === 'steel' && hit.item.item.cracked && (fire || b.ram > 0)) { this.breakBar(hit.item.item); left *= 1 - hit.t; continue; }
      b.x += hit.nx * ((hit.depth || 0) + .015); b.y += hit.ny * ((hit.depth || 0) + .015);
      if (hit.kind === 'paddle') { paddleBounce(this, b); b.dull = 0; }
      else {
        const speed = Math.hypot(b.vx, b.vy); reflect(b, hit);
        const next = Math.hypot(b.vx, b.vy); if (next > 0) { b.vx *= speed / next; b.vy *= speed / next; }
        if (['brick', 'housing', 'wheel', 'villain', 'bell', 'slot'].includes(hit.kind)) b.dull = 0;
        else if (b.dull > DULL.after) this.unloop(b, hit);
        const key = hit.kind === 'bell' ? hit.item.id : hit.item?.id, fresh = key !== undefined && !b.contacts.has(key);
        if (fresh) b.contacts.add(key);
        if (fresh && hit.kind === 'brick') this.hitBrick(hit.item.item, b);
        if (fresh && hit.kind === 'housing') this.hitHousing(hit.item.item, b.ram > 0 ? 2 : 1);
        if (fresh && hit.kind === 'wheel') this.turnWheel(b.ram > 0 ? 2 : 1, hit.nx);
        if (fresh && hit.kind === 'villain') this.hitVillain(b.ram > 0 ? RAM.damage : 1, b.ram > 0 && this.villain.stage === 'windup');
        if (fresh && hit.kind === 'slot') this.hitSlot(b);
        if (fresh && hit.kind === 'bell') this.hitBell(hit.item, hit, speed);
        if (fresh && hit.kind === 'steel') this.effect(b.x, b.y, 'iron-hit', .2);
        if (hit.kind === 'ward') this.effect(b.x, b.y, 'ward-bounce', .2);
      }
      if (this.phase !== 'play') return;
      left *= 1 - hit.t; if (hit.t < 1e-6) left = Math.max(0, left - 1e-5);
    }
    const speed = Math.hypot(b.vx, b.vy);
    if (speed && Math.abs(b.vy) < speed * .22) { b.vy = Math.sign(b.vy || 1) * speed * .22; b.vx = Math.sign(b.vx || 1) * Math.sqrt(speed * speed - b.vy * b.vy); }
    if (b.y - b.r > this.height) b.dead = true;
  }
  // Anti-loop: a ball that has gone DULL.after s without touching the paddle or anything it can damage (a billiard orbit in
  // a scenery pocket, e.g. above the stage 3 ramp or inside an iron chamber) leaves each wall, ledge, bar or ramp bounce
  // turned DULL.turn rad downward, in uneven steps, as long as it still leaves the surface.
  unloop(b, hit) {
    const speed = Math.hypot(b.vx, b.vy); if (!speed) return;
    const k = DULL.turn * [1, 1.8, .55][(b.nudges = (b.nudges || 0) + 1) % 3];   // uneven steps, so no new orbit settles
    const a = Math.atan2(b.vy, b.vx), turn = Math.cos(a) >= 0 ? k : -k, vx = Math.cos(a + turn) * speed, vy = Math.sin(a + turn) * speed;
    if (vx * hit.nx + vy * hit.ny > speed * .2) { b.vx = vx; b.vy = vy; }
  }
  // A breakable brick is the board's goal on stage 1, and pays out everywhere: gems bank loot, chests drop the stage's
  // big power, any brick can drop a capsule from the stage's power pool.
  get bricksLeft() { return this.bricks.filter(b => b.hp > 0).length; }
  hitBrick(brick, ball) {
    if (brick.hp <= 0) return;
    brick.hp--; this.score += brick.type === 'chest' ? 20 : 10;
    const cx = brick.x + brick.w / 2, cy = brick.y + brick.h / 2;
    if (!brick.hp && brick.gem) { this.gems++; this.stageGems++; this.effect(cx, cy, 'gem-pop', .8, { gem: brick.gem }); }
    if (this.balls.includes(ball) && !(ball.ram > 0)) this.chargeBank = Math.min((100 - this.charge) * this.rules.coreHits / 100, this.chargeBank + 1);
    this.effect(cx, cy, brick.hp ? 'brick-hit' : 'brick-break', brick.hp ? .35 : .7,
      { colour: brick.colour, type: brick.type, w: brick.w, h: brick.h, vx: (ball?.vx || 0) * .12, vy: (ball?.vy || 0) * .08 });
    if (!brick.hp) {
      if (brick.type === 'chest') { this.effect(cx, cy, 'chest-open', 1); this.dropPower(cx, cy, this.bigPower()); }
      else if (Math.random() < this.stagePlan.drop * DROP_MULT[this.difficulty]) this.dropPower(cx, cy, this.poolPower());
    }
    if (this.floor === 0 && (this.phase === 'play' || this.phase === 'serve') && !this.bricksLeft) this.finishFloor();
  }
  // ---------- capsule powers (the stage plan's cumulative pool) ----------
  poolPower() { const P = this.stagePlan.powers; return P[Math.floor(Math.random() * P.length) % P.length]; }
  bigPower() { const A = this.stagePlan.adds; return A[Math.floor(Math.random() * A.length) % A.length]; }
  dropPower(x, y, kind) {
    if (!kind || this.capsules.length >= 4) return null;
    const c = { id: ++this.serial, x: clamp(x, 20, this.width - 20), y, vy: 105, kind };
    this.capsules.push(c); return c;
  }
  updateCapsules(dt) {
    const p = this.paddle;
    for (const c of this.capsules) {
      c.y += c.vy * dt;
      if (c.y + 9 >= p.y && c.y - 9 <= p.y + p.h && Math.abs(c.x - p.x) <= p.w / 2 + 17) { c.dead = true; this.applyPower(c.kind); }
      else if (c.y - 10 > this.height) c.dead = true;
    }
    this.capsules = this.capsules.filter(c => !c.dead);
  }
  applyPower(kind) {
    const p = this.paddle, T = this.timers, live = this.balls.filter(b => !b.dead && !b.caught);
    if (!this.powersSeen.has(kind)) { this.powersSeen.add(kind); this.tip = { text: POWER_TIPS[kind], t: 0, kind }; }
    this.effect(p.x, p.y - 26, 'power', .9, { power: kind });
    if (kind === 'wide' || kind === 'slow' || kind === 'fire') T[kind] = Math.max(0, T[kind]) + POWER_TIME[kind];
    else if (kind === 'laser') { T.laser = Math.max(0, T.laser) + POWER_TIME.laser; T.laserCd = 0; }
    else if (kind === 'shield') this.ward = { y: p.y + 24, remaining: Math.max(this.ward?.remaining || 0, POWER_TIME.shield) };
    else if (kind === 'split') {
      for (const b of live) for (const da of [-.35, .35]) {
        if (this.balls.length >= MAX_BALLS) break;
        const c = Math.cos(da), s = Math.sin(da);
        this.balls.push({ id: ++this.serial, x: b.x, y: b.y, px: b.x, py: b.y, vx: b.vx * c - b.vy * s, vy: b.vx * s + b.vy * c, r: 6, caught: false, dead: false, ram: 0, ramBricks: 0, contacts: new Set(b.contacts) });
      }
    } else if (kind === 'burst') {
      for (const a of [-.4, 0, .4]) {
        if (this.balls.length >= MAX_BALLS) break;
        this.balls.push({ id: ++this.serial, x: p.x, y: p.y - 8, px: p.x, py: p.y - 8, vx: Math.sin(a) * this.ballSpeed, vy: -Math.cos(a) * this.ballSpeed, r: 6, caught: false, dead: false, ram: 0, ramBricks: 0, contacts: new Set() });
      }
      if (this.phase === 'serve') { this.phase = 'play'; this.active = true; this.backHold = false; }
    } else if (kind === 'titan') { for (const b of live) if (!(b.ram > 0)) launchRam(this, b); if (!live.length) { p.armed = true; p.streak = 3; } }
  }
  updatePowers(dt) {
    const T = this.timers, p = this.paddle;
    for (const k of ['wide', 'slow', 'fire', 'laser']) T[k] = Math.max(0, T[k] - dt);
    const w = p.baseW * (T.wide > 0 ? 1.4 : 1); p.w += clamp(w - p.w, -120 * dt, 120 * dt);
    if (T.laser > 0 && this.phase === 'play' && (T.laserCd -= dt) <= 0) {
      T.laserCd = .38;
      for (const s of [-1, 1]) this.bolts.push({ id: ++this.serial, x: p.x + s * (p.w / 2 - 8), y: p.y - 4, vy: -620 });
      this.effect(p.x, p.y, 'laser-fire', .15);
    }
  }
  updateBolts(dt) {
    if (!this.bolts.length) return;
    const targets = this.targets();
    for (const s of this.bolts) {
      const from = { x: s.x, y: s.y }; s.y += s.vy * dt;
      if (s.y < this.ceiling) { s.dead = true; continue; }
      const hit = targets.filter(t => t.item?.hp !== 0 && !t.item?.broken).map(t => ({ t, h: sweepTarget(from, s, 2, t) })).filter(q => q.h).sort((a, b) => a.h.t - b.h.t)[0];
      if (!hit) continue;
      s.dead = true; const t = hit.t;
      this.effect(s.x, s.y, 'laser-hit', .25);
      if (t.kind === 'brick') this.hitBrick(t.item, null);
      else if (t.kind === 'housing') this.hitHousing(t.item, 1);
      else if (t.kind === 'wheel') this.turnWheel(1, 0);
      else if (t.kind === 'villain') this.hitVillain(1, false);
      else if (t.kind === 'slot') this.hitSlot(null);
      if (this.phase !== 'play' && this.phase !== 'serve') return;
    }
    this.bolts = this.bolts.filter(s => !s.dead);
  }
  hitHousing(h, damage) {
    h.hp = Math.max(0, h.hp - damage); this.score += 25;
    const w = this.winch;
    if (w && !w.hoist) {
      w.idle = 0;
      // A housing hit during the crank telegraph jams the winch: Korr staggers, gets hurt and loses that crank.
      if (w.stage === 'crank') this.jamCrank('hit');
    }
    this.effect(h.x + h.w / 2, h.y + h.h / 2, h.hp ? 'housing-hit' : 'housing-break', h.hp ? .3 : .9);
    if (this.housings.every(q => q.hp <= 0)) this.finishFloor();
  }
  turnWheel(notches, nx) {
    const w = this.wheel; w.notches = Math.min(this.gate.need, w.notches + notches); w.spin += 6 * notches * (nx >= 0 ? 1 : -1); this.score += 15;
    this.effect(w.x, w.y, 'ratchet', .3);
    if (w.notches >= this.gate.need) this.finishFloor();
  }
  // Stage 3: a ball in the murder hole strikes Korr peering through it, harder while he leans in to drop a bell.
  hitSlot(ball) {
    const v = this.villain; if (v.gone || v.escape) return;
    const windup = v.stage === 'windup';
    this.effect(this.slot.x + this.slot.w / 2, this.slot.y + this.slot.h, 'slot-hit', .4);
    if (windup) { v.stage = 'stagger'; v.until = this.time + 1.1; this.nextWarning = Math.max(this.nextWarning, this.floorTime + 1.5); this.effect(v.foot.x, v.foot.y - 30, 'stagger', 1.1); }
    this.hurtKorr(windup ? KORR_DAMAGE.slotWindup : (ball?.ram > 0 ? RAM.damage : KORR_DAMAGE.slot), false);
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
    // A bell that never reaches the paddle (wedged or resting) cracks apart instead of blocking the next tell.
    if ((b.age += dt) > BELL_LIFE) { b.dead = true; this.effect(b.x, b.y, 'bell-break', .6); return; }
    const solids = this.targets().filter(t => t.kind !== 'villain' && t.kind !== 'slot');
    let left = dt;
    for (let pass = 0; pass < 6 && left > 1e-8; pass++) {
      const from = { x: b.x, y: b.y }, to = { x: b.x + b.vx * left, y: b.y + b.vy * left }, hits = [];
      if (!b.returning) for (const r of this.ramps) { const c = sweepMovingSegment(from, to, b.r, r.body, left); if (c) hits.push(c); }
      // Bells bounce off bricks, iron, the gate, the wheel and housings (approaching contacts only, so a bell leaving a surface is free).
      for (const t of solids) { const c = sweepTarget(from, to, b.r, t); if (c && b.vx * c.nx + b.vy * c.ny < 0) hits.push({ ...c, solid: true }); }
      hits.sort((a, c) => a.t - c.t); const hit = hits[0];
      if (!hit) { b.x = to.x; b.y = to.y; break; }
      b.x += (to.x - from.x) * hit.t + hit.nx * ((hit.depth || 0) + .02); b.y += (to.y - from.y) * hit.t + hit.ny * ((hit.depth || 0) + .02);
      // Landing on top of a brick or prop cracks the bell (it can never come to rest on the field); side and underside hits bounce.
      if (hit.solid && hit.ny < -.5) { b.dead = true; this.effect(b.x, b.y, 'bell-break', .6); return; }
      reflect(b, hit, hit.solid ? .3 : .06); left *= 1 - hit.t; if (hit.t < 1e-6) left = Math.max(0, left - 1e-5);
    }
    if (b.x < b.r) { b.x = b.r; b.vx = Math.abs(b.vx) * .55; }
    if (b.x > this.width - b.r) { b.x = this.width - b.r; b.vx = -Math.abs(b.vx) * .55; }
    b.spin += (b.vx / b.r - b.spin) * Math.min(1, dt * 8); b.angle += b.spin * dt;
    // A bell that comes to rest anywhere (wedged against a post, balanced on a cap) cracks after half a second.
    b.rest = Math.hypot(b.vx, b.vy) < 20 ? (b.rest || 0) + dt : 0;
    if (b.rest > .5) { b.dead = true; this.effect(b.x, b.y, 'bell-break', .6); return; }
    if (b.returning) {
      // A bell knocked back up can strike Korr (stage 4 body, stage 3 murder hole) or shatters on the ceiling ledge.
      if (this.villain.body.length && sweepTarget(motionFrom, b, b.r, { shapes: this.villain.body })) { b.dead = true; this.hitVillain(KORR_DAMAGE.bell, true); this.effect(b.x, b.y, 'bell-shoulder', .6); return; }
      const top = this.ceiling + b.r + .5;   // the ledge underside stops a bell a hair short of the ceiling line
      if (b.y < top || b.vy > 0) b.returning = false;
      if (b.y < top) {
        b.dead = true; this.effect(b.x, b.y, 'bell-break', .6);
        const s = this.slot; if (s && !this.villain.gone && !this.villain.escape && b.x > s.x - 14 && b.x < s.x + s.w + 14) { this.effect(b.x, b.y, 'bell-shoulder', .6); this.hurtKorr(KORR_DAMAGE.bell, true); }
        return;
      }
    }
    const p = this.paddle;
    // The Ward bar shields the whole paddle line: a bell reaching it shatters before it can stun.
    if (this.ward && b.y + b.r >= p.y) { b.dead = true; this.effect(b.x, p.y, 'bell-break', .5); return; }
    if (b.y + b.r >= p.y) {
      b.dead = true;
      if (!b.teaching && Math.abs(b.x - p.x) < p.w / 2 + b.r) { p.stun = GATEHOUSE_TIMING.stun; this.effect(p.x, p.y, 'paddle-stun', GATEHOUSE_TIMING.stun); }
      else this.effect(b.x, p.y, 'bell-break', .5);
    }
  }
  // Damage to Korr through the siege pool: before the showdown a stage's cap makes the last hit a knock-down.
  hurtKorr(damage, stagger) {
    const v = this.villain; if (this.state !== 'play' || v.gone || v.escape || this.pool.defeated) return 0;
    const { dealt, knockdown } = this.pool.hit(damage); v.hp = this.pool.hp; this.score += dealt * 25;
    if (knockdown) { this.knockDown(); return dealt; }
    if (this.floor === 3 && this.pool.defeated) { this.finishFloor(); return dealt; }
    if (dealt && stagger && this.floor === 3) { v.stage = 'stagger'; v.stageAt = this.time; v.until = this.time + 1.5; this.nextWarning = Math.max(this.nextWarning, this.floorTime + 1.5); }
    if (dealt && this.floor === 3) this.effect(v.x, v.y, stagger ? 'stagger' : 'korr-hit', stagger ? 1.5 : .2);
    return dealt;
  }
  hitVillain(damage, stagger) { return this.hurtKorr(damage, stagger); }
  // Knock-down: Korr staggers and escapes (along the battlements or the gallery), a bonus capsule and a loot chest fall,
  // and the stage carries on without him. His HP carries; he comes back enraged for the showdown.
  knockDown() {
    const v = this.villain; this.knockdowns++;
    v.escape = { t: 0, from: v.foot.x, dir: v.foot.x < this.width / 2 ? -1 : 1 }; v.stage = 'stagger'; v.body = [];
    this.nextWarning = Infinity; if (this.winch) { this.winch.stage = 'idle'; this.winch.target = null; }
    this.score += LOOT_CHEST;
    this.effect(v.foot.x, v.foot.y - 30, 'knockdown', 1.6);
    this.effect(clamp(v.foot.x, 60, this.width - 60), this.ceiling + 30, 'loot-shower', 1.6, { n: 3, loot: LOOT_CHEST });
    if (this.phase === 'play' || this.phase === 'serve') this.dropPower(clamp(v.foot.x, 30, this.width - 30), this.ceiling + 14, this.bigPower());
  }
  lose(reason) { if (this.state !== 'play') return; this.state = 'lost'; this.reason = reason; }
  continue() {
    if (this.continued || this.state !== 'lost') return false;
    this.continued = true; this.state = 'play'; this.reason = ''; this.lives = Math.max(2, this.lives);
    this.bells = []; this.capsules = []; this.bolts = []; this.paddle.stun = 0; this.nextWarning = this.floorTime + 3; if (!this.villain.gone && !this.villain.escape) this.villain.stage = 'idle'; this.makeServe();
    if (this.winch) Object.assign(this.winch, { idle: 0, stage: 'idle', target: null });
    this.ward = { y: this.paddle.y + 24, remaining: BACK_WARD }; this.active = false; this.backHold = true; return true;
  }
  // Stars past the clear: Lumi's hoist jammed on stage 1, and Korr knocked down on both stages 2 and 3.
  starFlags() { return { hoist: this.hairpin, knockdown: this.knockdowns >= 2, balls: this.lives >= 2 }; }
  // Continue panel copy: what is left of this stage's goal; progress runs over all four stages.
  nearMiss() {
    const f = this.floor, sum = (list, k) => list.reduce((n, o) => n + Math.max(0, o[k]), 0);
    let line, part;
    if (f === 0) { const left = Math.max(1, this.bricksLeft); line = `${plural(left, 'BRICK')} TO ${this.hoist && !this.hoist.lost ? 'JAM KORR’S HOIST' : 'CLEAR THE ARCH'}`; part = 1 - left / Math.max(1, this.bricks.length); }
    else if (f === 1) { const left = Math.max(1, sum(this.housings, 'hp')); line = `${plural(left, 'HIT')} TO ${this.parLeft > 0 ? 'CRUSH KORR’S BELL RACK' : 'DROP THE DRAWBRIDGE'}`; part = 1 - left / Math.max(1, sum(this.housings, 'maxHP')); }
    else if (f === 2) { const left = Math.max(1, this.gate.need - this.wheel.notches); line = `${plural(left, 'WINCH HIT')} TO RAISE THE GATE`; part = 1 - left / this.gate.need; }
    else { line = hpLeft('KORR', this.pool.hp); part = 1 - this.pool.hp / this.pool.maxHP; }
    return { line, progress: (f + clamp(part, 0, 1)) / STAGE_COUNT, stage: ['STAGE', f + 1, STAGE_COUNT] };
  }
  effect(x, y, kind, life, details = {}) {
    const fx = { x, y, kind, age: 0, life, ...details }; this.effects.push(fx); if (this.effects.length > 80) this.effects.shift(); return fx;
  }
}
function smooth(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
