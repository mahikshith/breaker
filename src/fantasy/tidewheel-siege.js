// Tidewheel Siege: Tidewheel Citadel as four stages that build to Nerra (design/phase2/stages-v2.md section 6).
//   1 Low Tide (hook): Nerra scuttles in, hauls the hoist until the refuge chain snaps (Lumi drops a notch), then walks
//     off and jumps into the surf. A slow tide rises. Pearls bank a shield for stage 4.
//   2 Floodworks (build): the brass sluice house. Nerra peeks from either wall and fires water. Each valve shut lowers
//     stage 4's starting water by a third. Her HP is capped at 85%: reaching it knocks her down and she dives away.
//   3 The Wheel (clash): Nerra fights on the hub; two wheel pits open and shut with swinging spokes. At 40% she leaps
//     into the water and escapes.
//   4 The Refuge (showdown): the full fight under a rising flood, with caged chests on the rafts. Fury at 30%.
// The flood is the clock in every stage: the tide creeps toward the refuge from the first serve (FLOOD_CLOCK), and only
// valves, Kit's anchor and a continue push it back. Special bricks matter: sea-mines blast their neighbours (and Nerra,
// and barnacle plate), chests drop a big power, pearls bank the shield (stage 1) or pay loot, 2-hit bricks wear armour,
// and barnacle plate only gives to big powers. From stage 2 on Nerra sits behind brick and steel that grows back.
// The fight machinery, water, rafts, powers and collision contract are the Tidewheel model's (tidewheel.js); this layer
// adds the stage flow, the static boards (bricks, brass bars, spokes, prizes), drops, carry-overs and Nerra's director.
import { Tidewheel, raftPoint, REFUGE_LIP_OFFSET, CRUSHER_WATER_TIP } from './tidewheel.js';
import { overlapsTarget, sweepTarget } from '../carrier-physics.js';
import { ejectBall, paddleRoom } from '../clearance.js';
import { RAM, BALL_R, endRam, powerTitle } from './ram.js';
import { STAR_R } from './tidewheel.js';
import { difficulty } from '../difficulty.js';
import { hpLeft, plural } from '../near-miss.js';
import { VillainPool, stageLabel } from './stages.js';
import { STAGES, STAGE_COUNT, siegePlan, stageBoard } from './tidewheel-stages.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), mix = (a, b, t) => a + (b - a) * clamp(t, 0, 1);
const smooth = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
const pick = (list, i) => ['easy', 'medium', 'hard'].indexOf(i) < 0 ? list[1] : list[['easy', 'medium', 'hard'].indexOf(i)];
export const SIEGE_HP = 1.25;
export const SPOKE_PERIOD = [2.4, 3.4];   // seconds a spoke stays shut, then open
export const SIEGE_TIMING = { card: 1.2, clear: 2.4, notch: 10, spokeTell: .8, crackAfter: 25, selfBreak: 6, dull: 4, dullTurn: .3, chain: .09 };
// Seconds from a stage's opening water to the refuge on medium if nothing pushes the tide back (easy x1.3, hard x0.85).
// Stages 1-2 split it between a steady creep and surges; in 3-4 the creep carries most of it and Nerra's hauls add more.
export const FLOOD_CLOCK = { seconds: [40, 62, 58, 40], creep: [.6, .6, .8, .8], danger: .7 };
// Sea-mine blast radius, damage to Nerra; barnacle plate takes three laser bolts (blasts do not move it); shield bricks
// grow back after (s). A plain ball hurts Nerra once per return: it is armed by the paddle and spent by the hit, so she
// is never juggled from above. Laser bolts glance off her shell; the titan, a ram and mine blasts are not limited.
export const MINE = { radius: 46, nerra: 2 };
export const PLATE_BOLTS = 3;
export const REGROW = { easy: 18, medium: 14, hard: 10 };
const PRIZES = ['pearl', 'chest', 'valve'];
const BIG = ['split', 'fire', 'laser', 'titan'];
// Nerra's pose vocabulary. Each maps onto the art that exists today (the v2 keyposes and the fury reaction) plus code
// motion in tidewheel-stages-render.js; the 3D toy rebuild maps its own clips onto the same names.
export const NERRA_POSES = { idle: 'idle', walk: 'step', turn: 'step', look: 'idle', furious: 'fury', jump: 'step', slam: 'pull', snap: 'pull', hurt: 'hurt', dizzy: 'hurt', defeated: 'hurt' };
// Capsule powers (the stage plan's cumulative pool), seconds where timed.
export const SIEGE_POWERS = { wide: 12, slow: 8, shield: 10, fire: 8, laser: 7 };
const POWER_TIPS = { wide: 'WIDE: a longer paddle', slow: 'SLOW: the tide ball slows down', split: 'SPLIT: every ball becomes three', shield: 'SHIELD: a ward under the paddle',
  fire: 'FIRE: bricks break in one hit', laser: 'LASER: the paddle fires bolts', burst: 'BURST: three more balls', titan: 'TITAN: a piercing star ball' };

export class TidewheelSiege extends Tidewheel {
  constructor(opts = {}) {
    super(opts);
    // Nerra's HP is one pool for the whole siege, half again today's one-screen fight: the showdown still meets 40% of it.
    this.rules.hp = Math.round(this.rules.hp * SIEGE_HP); this.villain.hp = this.villain.maxHP = this.rules.hp;
    this.baseRules = { ...this.rules };
    this.plan = siegePlan(this.difficulty);
    this.pool = new VillainPool(this.rules.hp, this.plan);
    this.siege = true; this.stageCount = STAGE_COUNT; this.stagesCleared = 0;
    this.knockdowns = 0; this.pearls = 0; this.pearlsTotal = 0; this.valvesShut = 0; this.pearlGuard = null;
    this.capsules = []; this.bolts = []; this.powersSeen = new Set(); this.tip = null; this.banner = null;
    this.timers = { wide: 0, slow: 0, fire: 0, laser: 0, laserCd: 0 };
    this.stageLog = []; this.ballsLost = 0; this.floodMinS4 = Infinity; this.ballsLostS4 = 0;
    this.cine = null; this.nerraGone = false; this.peek = null; this.fury = false;
    this.villain.facing = 1; this.villain.act = { pose: 'idle', t: 0, gaze: null };
    this.buildStage(clamp(opts.stage | 0, 0, STAGE_COUNT - 1));
  }
  get stageInfo() { return STAGES[this.stage]; }
  get stageLabel() { return stageLabel(this.stage, STAGE_COUNT); }

  // ---------- stage build ----------
  buildStage(i) {
    const B = stageBoard(i, { paddleY: this.paddle.y, difficulty: this.difficulty }), p = B.plan, info = STAGES[i];
    this.stage = i; this.board = B; this.stageClock = 0; this.pool.stage = i;
    this.stageStart = { time: this.time, lives: this.lives, knockdowns: this.knockdowns };
    const rest = Math.min(380, this.paddle.y - 265);
    this.rafts = B.rafts.map(r => ({ id: 'raft' + r.i, x: r.x, y: rest, px: r.x, py: rest, baseX: r.x, vx: 0, vy: 0, angle: 0, previousAngle: 0, omega: 0, initial: rest, stop: rest - 20,
      braceHP: 2, maxBraceHP: 2, steel: r.steel.map(s => ({ ...s, broken: false, cracked: false })), chamber: r.chamber ? { ...r.chamber, idle: 0, cracked: false, crack: 'postR' } : null }));
    let k = 0;
    this.bricks = B.rafts.flatMap(r => [...r.cells, ...r.prizes].map(c => ({ id: 'brick' + k++, raft: r.i, lx: c.lx, ly: c.ly, w: c.w, h: c.h, hp: c.hp, maxHP: c.hp, type: c.type, colour: k % 2, prize: PRIZES.includes(c.type) })));
    k = 0;
    const counts = {};
    this.blocks = [...B.blocks, ...B.prizes].map(b => { const n = counts[b.type] = (counts[b.type] || 0) + 1; return { id: 'blk' + k++, name: PRIZES.includes(b.type) ? b.type + (n - 1) : null, x: b.x, y: b.y, w: b.w, h: b.h, hp: b.hp, maxHP: b.hp, type: b.type, colour: (k + i) % 2, prize: PRIZES.includes(b.type), bonus: !!b.bonus || !!b.regrow, regrow: !!b.regrow }; });
    if (i === 0) this.pearlsTotal = this.blocks.filter(b => b.type === 'pearl').length;   // the pearl shield banks stage 1's pearls
    this.bars = B.bars.map(b => ({ ...b, broken: false, cracked: false, ...(b.power ? { hp: PLATE_BOLTS } : {}) }));
    this.blasts = []; this.floodWarned = false;
    this.spokes = B.spokes.map((s, n) => ({ ...s, pose: 0, shown: 0, next: Infinity, period: SPOKE_PERIOD, phase: n * .9 }));
    this.chambers = B.chambers.filter(c => !c.via).map(c => ({ ...c, idle: 0, cracked: false }));
    this.gates = B.gates.map((g, n) => ({ id: 'gate' + n, x: g.x, y: g.y, w: 24, h: 34, hp: 2, open: 0, angle: 0, until: 0 }));
    this.capsules = []; this.bolts = []; this.pulses = []; this.pulseWarning = null; this.shots = []; this.effects = this.effects.filter(e => e.keep);
    this.clearPowers(); this.ward = null; this.backHold = false;
    for (const key of Object.keys(this.timers)) this.timers[key] = 0;
    this.paddle.w = 100; this.paddle.streak = 0; this.paddle.armed = false;
    // Ball speed and Nerra's cadence for this stage.
    this.stageSpeed = 345 * p.speed; this.speed = this.stageSpeed;
    const a = p.attack ?? 1, R = this.baseRules;
    this.rules = { ...R, interval: R.interval * a, pulseInterval: R.pulseInterval * a, tideGap: pick([12, 10.5, 9], this.difficulty) };
    // Water: each stage starts at its own level; stage 4 starts raised unless the sluice valves were shut in stage 2.
    const headroom = this.water.initial - (this.lumi.baseY + REFUGE_LIP_OFFSET);
    const raised = [0, .06, .12, .45 * (1 - this.valvesShut / 3)][i] * headroom;
    this.water.y = this.water.target = this.water.initial - raised; this.water.current = 0;
    for (const r of this.rafts) { r.y = r.py = clamp(this.water.y - 38, r.stop, r.initial); }
    // The flood clock: the stage's opening headroom over FLOOD_CLOCK seconds, as a creep plus (stages 1-2) tide surges.
    const left = this.water.y - (this.lumi.baseY + (i === 0 ? SIEGE_TIMING.notch : 0) + REFUGE_LIP_OFFSET), rate = left / (FLOOD_CLOCK.seconds[i] * pick([1.3, 1, .85], this.difficulty));
    this.rules.tideRise = rate * FLOOD_CLOCK.creep[i]; this.rules.tideSurge = i <= 1 ? rate * (1 - FLOOD_CLOCK.creep[i]) * this.rules.tideGap : 0;
    this.nextTide = Infinity;
    // Nerra for this stage.
    const v = this.villain;
    Object.assign(v, { stage: 'idle', stageTime: 0, anger: 0, enraged: false, fury: 0, furyPulse: 0, emission: null, stunUntil: 0, clawHits: 0, patrolClock: 0, defeat: null });
    this.nerraGone = false; this.peek = null; this.cine = null; this.chain.released = false;
    if (info.nerra === 'hook') this.play('hook');
    else if (info.nerra === 'peek') { this.hideNerra(); this.peek = { state: 'away', t: 0, side: -1, wait: 4 }; }
    else this.play('enter');
    if (i === 3) {
      // Knocked down earlier: she comes back enraged, one attack faster.
      if (this.knockdowns > 0) { this.rules.interval *= .85; this.rules.pulseInterval *= .85; }
      this.pearlGuard = this.pearls >= this.pearlsTotal && this.pearlsTotal > 0 ? { y: this.paddle.y + 24 } : null;
    }
    this.started = false; this.teachingDone = i === 3 ? false : true; this.nextSurge = Infinity; this.nextPulse = Infinity; this.attackGrace = 0;
    this.serve(); this.phase = 'card'; this.card = { t: 0 };
    this.syncAnatomy();
  }
  // A tap skips the card; its release can serve at once (Nerra's opening beat plays on as a ghost the ball passes through).
  skipCard() { if (this.phase !== 'card') return false; this.endCard(); return true; }
  endCard() { this.phase = this.cine?.hold ? 'hook' : 'serve'; this.card = null; }
  // The first launch of a stage schedules its threats from that moment (base launch), so a stage never opens on an attack.
  launch(angle) {
    if (this.phase === 'card' || this.phase === 'clear') return false;
    if (this.phase === 'hook') this.phase = 'serve';
    const was = this.started, ok = super.launch(angle);
    if (ok && !was) {
      if (this.stage <= 1) this.nextTide = this.time + this.rules.tideGap;
      if (this.stage >= 2 && this.nerraOnHub()) { this.nextSurge = this.time + (this.stage === 3 ? 9 : 7); this.nextPulse = this.time + (this.stage === 3 ? 15 : 12); }
      else { this.nextSurge = this.nextPulse = Infinity; }
      for (const s of this.spokes) s.next = this.time + s.period[0] + s.phase;
    }
    return ok;
  }
  // Kit's powers work from the serve on, including while Nerra's opening beat plays.
  canActivate(kind, o = {}) { const p = this.phase; if (p === 'hook') this.phase = 'serve'; const ok = super.canActivate(kind, o); this.phase = p; return ok; }
  activate(kind) { if (this.phase === 'hook' && this.canActivate(kind)) this.phase = 'serve'; return super.activate(kind); }
  nerraOnHub() { const v = this.villain; return !this.nerraGone && !v.hidden && !this.cine && (this.stage === 2 || this.stage === 3); }

  // ---------- Nerra's director: scripted moves through the pose interface ----------
  // A script is a list of beats {pose, dur, to:{x,y}, arc, facing, ghost, at(t), end()}. While one runs Nerra is moved
  // by it; her fight machinery takes over again when it ends (stages 3 and 4) or she stays away (hidden).
  play(name) {
    const v = this.villain, hub = { x: this.width / 2, y: 232 }, surf = side => ({ x: side < 0 ? -40 : this.width + 40, y: this.water.y + 46 });
    const beats = {
      hook: [
        { pose: 'walk', dur: 1.6, from: { x: this.width + 110, y: 232 }, to: hub, facing: 1, ghost: true },
        { pose: 'idle', dur: .25, ghost: true },
        { pose: 'snap', dur: 1.05, ghost: true, start: () => { v.stage = 'pull'; v.stageTime = 0; }, at: t => { v.stageTime = t; if (t >= .4 && !this.snapped) this.snapChain(); }, end: () => { v.stage = 'idle'; this.chain.released = true; } },
        { pose: 'look', dur: .75, ghost: true, gaze: true, release: true },
        { pose: 'turn', dur: .3, ghost: true, flip: -1 },
        { pose: 'walk', dur: 1.15, to: { x: 46, y: 232 }, ghost: true },
        { pose: 'jump', dur: .75, to: surf(-1), arc: 70, ghost: true, end: () => this.splash(24, 1.4) },
      ],
      enter: [
        { pose: 'jump', dur: .85, from: surf(1), to: hub, arc: 120, facing: 1, ghost: true, hidden: false },
        { pose: 'slam', dur: .35, ghost: true, start: () => this.effects.push({ kind: 'nerra-slam', x: hub.x, y: hub.y, age: 0, life: .5 }) },
        ...(this.stage === 3 && this.knockdowns > 0 ? [{ pose: 'furious', dur: .7, ghost: true, start: () => this.effects.push({ kind: 'nerra-roar', x: hub.x, y: hub.y - 90, age: 0, life: .7 }) }] : [{ pose: 'look', dur: .45, ghost: true, gaze: true }]),
        { pose: 'idle', dur: .05, release: true, end: () => { v.footX = v.x = hub.x; v.footY = 232; v.patrolClock = 0; v.ghost = false; } },
      ],
      escape: [
        { pose: 'hurt', dur: .3, ghost: true },
        { pose: 'dizzy', dur: .75, ghost: true },
        { pose: 'jump', dur: .85, to: surf(this.villain.footX < this.width / 2 ? -1 : 1), arc: 90, ghost: true, end: () => this.splash(this.villain.footX < this.width / 2 ? 30 : this.width - 30, 1.6) },
      ],
      dive: [
        { pose: 'dizzy', dur: .6, ghost: true },
        { pose: 'jump', dur: .7, to: { x: v.footX + (v.footX < this.width / 2 ? -70 : 70), y: this.water.y + 90 }, arc: 30, ghost: true, end: () => this.splash(v.footX < this.width / 2 ? 30 : this.width - 30, 1.2) },
      ],
    }[name];
    v.hidden = false; v.ghost = true; this.nerraGone = false;
    this.cine = { name, beats, i: -1, t: 0, hold: name === 'hook' || name === 'enter' };
    this.nextBeat();
  }
  nextBeat() {
    const c = this.cine, v = this.villain; c.i++; c.t = 0;
    if (c.i >= c.beats.length) { const name = c.name; this.cine = null; if (name === 'hook' || name === 'escape' || name === 'dive') this.hideNerra(); else v.ghost = false; if (this.phase === 'hook') this.phase = 'serve'; return; }
    const b = c.beats[c.i];
    if (b.from) { v.footX = b.from.x; v.footY = b.from.y; }
    if (b.facing) v.facing = b.facing;
    b.origin = { x: v.footX, y: v.footY, facing: v.facing };
    v.ghost = b.ghost !== false; v.act = { pose: b.pose, t: 0, dur: b.dur, gaze: b.gaze ? { x: this.paddle.x, y: this.paddle.y } : null, arc: b.arc || 0, from: b.origin, to: b.to || null, flip: b.flip || 0 };
    b.start?.();
  }
  direct(dt) {
    const c = this.cine; if (!c) return;
    const v = this.villain;
    if (c.i < 0) this.nextBeat();
    let b = c.beats[c.i]; c.t += dt; v.act.t = c.t;
    const q = clamp(c.t / b.dur, 0, 1);
    if (b.to) { const e = b.pose === 'jump' ? q : smooth(q); v.footX = mix(b.origin.x, b.to.x, e); v.footY = mix(b.origin.y, b.to.y, e) - (b.arc || 0) * 4 * q * (1 - q); }
    if (b.flip && q >= .5) v.facing = b.flip;
    if (b.release && this.cine.hold) { this.cine.hold = false; if (this.phase === 'hook') this.phase = 'serve'; }
    b.at?.(c.t);
    v.x = v.footX;
    v.pose = b.pose === 'walk' ? (Math.floor(c.t * 6) % 2 ? 'step' : 'idle') : NERRA_POSES[b.pose] || 'idle';
    if (q >= 1) { b.end?.(); this.nextBeat(); }
  }
  hideNerra() { const v = this.villain; v.hidden = true; v.ghost = true; v.act = { pose: 'idle', t: 0, gaze: null }; this.nerraGone = this.stage !== 1 || this.peek?.state === 'gone'; v.stage = 'idle'; this.pulseWarning = null; }
  snapChain() {
    this.snapped = true; const L = this.lumi; L.baseY += SIEGE_TIMING.notch; L.targetY += SIEGE_TIMING.notch; L.worried = true;
    this.effects.push({ kind: 'chain-snap', x: L.x + 25, y: L.y + 6, age: 0, life: .9 }, { kind: 'refuge-drop', x: L.x, y: L.y + 33, age: 0, life: .6 });
  }
  splash(x, size = 1) { this.effects.push({ kind: 'nerra-splash', x, y: this.water.y, size, age: 0, life: .9 }); }

  // ---------- anatomy: facing mirrors the measured body and claws about the supporting foot ----------
  syncAnatomy() {
    const v = this.villain, flip = (v.facing ?? 1) < 0;
    for (const c of this.claws) if (c.own) { c.angle = c.own.angle; c.previousAngle = c.own.previousAngle; c.mirror = c.own.mirror; }
    super.syncAnatomy();
    for (const c of this.claws) c.own = { angle: c.angle, previousAngle: c.previousAngle, mirror: c.mirror };
    if (flip) {
      const circles = this.mirrored(this.body.circles), pb = this.previousBody;
      this.body = { x: v.footX, y: v.footY, circles };
      for (const c of this.claws) {
        c.root = { x: 2 * v.footX - c.root.x, y: c.root.y }; c.previousRoot = { x: 2 * pb.x - c.previousRoot.x, y: c.previousRoot.y };
        c.angle = -c.angle; c.previousAngle = -c.previousAngle; c.mirror = !c.mirror;
        c.grip = clawAt(c, c.gripLocal || { x: 0, y: 0 });
        if (c.side < 0) c.muzzle = clawAt(c, MUZZLE);
      }
      if (this.pulseWarning) { const m = this.claws[0].muzzle; this.pulseWarning.from = { ...m }; this.pulseWarning.source = { ...m }; this.pulseWarning.angle = Math.atan2(this.pulseWarning.target.y - m.y, this.pulseWarning.target.x - m.x); }
    }
    // The hoist chain only follows her gripper while she holds the hub; otherwise it hangs slack from the wheel.
    const holds = !v.hidden && !flip && Math.abs(v.footY - 232) < 2 && Math.abs(v.footX - this.width / 2) < 30 && !(this.chain.released && this.cine);
    if (!holds) { this.chain.hand = { x: 310, y: 292 }; this.chain.route = [{ ...this.chain.hand }, { ...this.chain.pulley }, { x: 327, y: 244 }, { x: 327, y: 282 }]; }
  }
  mirrored(circles) { this.mirrorCache ||= new WeakMap(); let m = this.mirrorCache.get(circles); if (!m) { m = circles.map(c => ({ ...c, x: -c.x })); this.mirrorCache.set(circles, m); } return m; }

  // ---------- collision world ----------
  targets(dt = 0) {
    let T = super.targets(dt);
    const v = this.villain;
    if (v.ghost || v.hidden) T = T.filter(t => t.kind !== 'shell' && t.kind !== 'claw');
    for (const r of this.rafts) for (const s of r.steel || []) {
      if (s.broken) continue;
      const old = dt ? { x: r.px, y: r.py, angle: r.previousAngle } : r, c = { x: s.lx + s.w / 2, y: s.ly + s.h / 2 }, before = raftPoint(old, c.x, c.y), after = raftPoint(r, c.x, c.y);
      const pts = [[s.lx, s.ly], [s.lx + s.w, s.ly], [s.lx + s.w, s.ly + s.h], [s.lx, s.ly + s.h]].map(([x, y]) => { const q = raftPoint(old, x, y); return [q.x, q.y]; });
      T.push({ id: `steel:${r.id}:${s.id}`, kind: s.cracked ? 'bar' : undefined, steel: true, type: 'poly', points: pts, vx: dt ? (after.x - before.x) / dt : 0, vy: dt ? (after.y - before.y) / dt : 0 });
    }
    for (const b of this.blocks) if (b.hp > 0) T.push({ id: b.id, kind: 'brick', hp: b.hp, type: 'rect', x: b.x, y: b.y, w: b.w, h: b.h });
    for (const b of this.bars) if (!b.broken) T.push({ id: b.id, kind: b.cracked || b.power ? 'bar' : undefined, steel: true, type: 'rect', x: b.x, y: b.y, w: b.w, h: b.h });
    for (const s of this.spokes) { const q = s.poses[s.pose]; T.push({ id: s.id, steel: true, type: 'rect', x: q.x, y: q.y, w: q.w, h: q.h }); }
    if (this.pearlGuard) T.push({ id: 'pearlGuard', kind: 'guard', type: 'rect', x: 12, y: this.pearlGuard.y, w: this.width - 24, h: 4 });
    return T;
  }
  // Nerra's eject also keeps clear of the board's steel and bricks.
  clearNerra(b, targets) {
    const v = this.villain; if (v.ghost || v.hidden || b.titan > 0 || b.pierceExit?.has('nerra')) return;
    const solids = targets.filter(t => t.type === 'rect' && (t.steel || t.id?.startsWith('blk') || t.id?.startsWith('gate')));   // a spent gate panel is still metal
    const ok = (x, y) => x >= 12 + b.r && x <= this.width - 12 - b.r && y >= 67 + b.r && !solids.some(t => overlapsTarget({ x, y, r: b.r }, t));
    const boss = targets.filter(t => t.kind === 'shell' || t.kind === 'claw');
    const touched = boss.map(t => ({ t, d: t.r + b.r - Math.hypot(b.x - t.x, b.y - t.y) })).sort((p, q) => q.d - p.d)[0];
    const c = ejectBall(b, boss, { ok }); if (!c) return;
    this.normalize(b);
    if (c.reflected && !b.contacts.has('nerra') && this.time - (b.lastNerraHit ?? -Infinity) >= .1) { b.contacts.add('nerra'); b.lastNerraHit = this.time; this.hit(touched.t, b); }
  }

  // ---------- hits ----------
  hit(target, b) {
    if (target.id?.startsWith('blk')) return this.hitBlock(this.blocks.find(q => q.id === target.id), b, target);
    if (target.kind === 'brick') return this.hitRaftBrick(this.bricks.find(q => q.id === target.id), b);
    if (target.kind === 'bar') return this.hitBar(target, b);
    if (target.kind === 'guard') { this.pearlGuard = null; this.effects.push({ kind: 'pearl-guard', x: b.x, y: b.y, age: 0, life: .7 }); return; }
    if (target.kind === 'shell' || target.kind === 'claw') return this.hitNerra(target, b);
    return super.hit(target, b);
  }
  useful(b) { if (b) b.useful = this.time; }
  damage(item, b) {
    if (!item || item.hp <= 0) return 0;
    const hard = b?.fire > 0 || b?.ram > 0 || b?.titan > 0 || this.timers.fire > 0 && !b?.powerShot;
    const before = item.hp; item.hp = hard ? 0 : item.hp - 1; return before - item.hp;
  }
  hitRaftBrick(brick, b) {
    if (!brick || brick.hp <= 0) return;
    this.effects.push({ kind: 'hit', x: b.x, y: b.y, age: 0, life: .3 });
    this.damage(brick, b); this.useful(b); this.creditHit(b);
    const r = this.rafts[brick.raft], c = raftPoint(r, brick.lx + brick.w / 2, brick.ly + brick.h / 2);
    if (brick.hp > 0) { this.score += 10; this.effects.push({ kind: 'brick-chip', x: c.x, y: c.y, w: brick.w, h: brick.h, type: brick.type, age: 0, life: .4 }); return; }
    this.score += 25;
    this.effects.push({ kind: 'brick-break', x: c.x, y: c.y, w: brick.w, h: brick.h, colour: this.breakColour(brick), vx: (b.vx || 0) * .07, vy: (b.vy || 0) * .06, age: 0, life: .65 });
    this.broken(brick, c.x, c.y);
  }
  hitBlock(blk, b) {
    if (!blk || blk.hp <= 0) return;
    this.effects.push({ kind: 'hit', x: b.x, y: b.y, age: 0, life: .3 });
    this.damage(blk, b); this.useful(b); this.creditHit(b);
    const x = blk.x + blk.w / 2, y = blk.y + blk.h / 2;
    if (blk.hp > 0) { this.score += 10; this.effects.push({ kind: blk.type === 'valve' ? 'valve-turn' : 'brick-chip', x, y, w: blk.w, h: blk.h, type: blk.type, age: 0, life: .45 }); return; }
    this.score += 25; blk.downAt = this.time;
    this.effects.push({ kind: blk.type === 'valve' ? 'valve-shut' : 'brick-break', x, y, w: blk.w, h: blk.h, colour: this.breakColour(blk), vx: (b.vx || 0) * .07, vy: (b.vy || 0) * .06, age: 0, life: blk.type === 'valve' ? .9 : .65 });
    this.broken(blk, x, y);
  }
  // What a breaking brick shatters as: armour is the steel glaze, sea-glass and coral by colour, specials by type.
  breakColour(item) { return item.type === 'brick' ? item.maxHP > 1 ? 'steel' : item.colour : item.type; }
  // A brick or prize is gone: prizes pay out, ordinary bricks roll for a drop, and the stage may be clear.
  broken(item, x, y) {
    if (item.type === 'pearl') {   // stage 1 banks the pearl shield; later pearls are loot: score and a share of Kit's charge
      if (this.stage === 0) this.pearls++; else this.chargeBank = Math.min(100 - this.charge, this.chargeBank + 25);
      this.score += 100; this.effects.push({ kind: 'pearl', x, y, age: 0, life: .9 });
    }
    else if (item.type === 'valve') { this.valvesShut++; this.score += 150; this.drain(24); }
    else if (item.type === 'chest') { this.score += 300; this.drop(x, y, true); }
    else if (item.type === 'mine') { this.score += 40; this.blasts.push({ x, y, at: this.time + SIEGE_TIMING.chain }); this.effects.push({ kind: 'mine-fuse', x, y, age: 0, life: SIEGE_TIMING.chain + .05 }); }
    else if (Math.random() < this.board.plan.drop) this.drop(x, y);
    this.checkClear();
  }
  // A sea-mine goes off: every brick, prize, mine and barnacle plate within MINE.radius takes a hit (mines chain), and
  // Nerra takes MINE.nerra if any part of her is in the blast.
  blast(x, y) {
    const R = MINE.radius, near = (cx, cy) => Math.hypot(cx - x, cy - y) <= R, src = { x, y, vx: 0, vy: 0, blast: true, powerShot: true };
    this.effects.push({ kind: 'mine-blast', x, y, r: R, age: 0, life: .75 });
    for (const blk of this.blocks) if (blk.hp > 0 && near(clamp(x, blk.x, blk.x + blk.w), clamp(y, blk.y, blk.y + blk.h))) this.hitBlock(blk, { ...src, x: blk.x + blk.w / 2, y: blk.y + blk.h / 2 });
    for (const br of this.bricks) {
      if (br.hp <= 0) continue;
      const r = this.rafts[br.raft], c = raftPoint(r, br.lx + br.w / 2, br.ly + br.h / 2);
      if (near(c.x, c.y)) this.hitRaftBrick(br, { ...src, x: c.x, y: c.y });
    }
    for (const bar of this.bars) if (!bar.broken && !bar.power && bar.cracked && near(clamp(x, bar.x, bar.x + bar.w), clamp(y, bar.y, bar.y + bar.h))) this.breakBar(bar.id);
    const v = this.villain;
    if (!v.ghost && !v.hidden && this.phase !== 'rescue') {
      const part = this.targets(0).find(t => (t.kind === 'shell' || t.kind === 'claw') && Math.hypot(t.x - x, t.y - y) <= R + t.r);
      if (part) this.hitNerra(part, { ...src, x: part.x, y: part.y });
    }
  }
  bigPower() { const pool = BIG.filter(k => this.board.plan.powers.includes(k)); return pool.length ? pool[Math.floor(Math.random() * pool.length)] : 'split'; }
  hitBar(t, b) {
    // A cracked bar or barnacle plate gives to a ram, a fire ball or the titan; plate also to three laser bolts. Ordinary
    // balls only knock on it.
    const bar = this.bars.find(q => q.id === t.id);
    if (bar?.power && b?.powerShot && !b.blast && !(b.ram > 0 || b.titan > 0)) {
      if (--bar.hp > 0) { this.effects.push({ kind: 'plate-chip', id: bar.id, x: b.x, y: b.y, age: 0, life: .35 }); return; }
      return this.breakBar(t.id);
    }
    if (!(b?.ram > 0 || b?.fire > 0 || b?.titan > 0 || this.timers.fire > 0 && !b?.powerShot)) {
      this.effects.push({ kind: 'bar-knock', x: b.x, y: b.y, age: 0, life: .3 });
      // Barnacle plate is rough: a knock kicks the ball a little off its line (alternating sides), so a ball cannot
      // ride the same paddle-to-plate line forever.
      if (bar?.power && b && !b.powerShot && this.balls.includes(b)) { const k = (bar.knocks = (bar.knocks || 0) + 1) % 2 ? .16 : -.12, c = Math.cos(k), s = Math.sin(k); [b.vx, b.vy] = [b.vx * c - b.vy * s, b.vx * s + b.vy * c]; this.normalize(b); }
      return;
    }
    this.breakBar(t.id);
  }
  breakBar(id) {
    const [kind, raftId, sid] = id.split(':'), bar = kind === 'steel' ? this.rafts.find(r => r.id === raftId)?.steel.find(s => s.id === sid) : this.bars.find(q => q.id === id);
    if (!bar || bar.broken) return;
    bar.broken = true; this.score += 50;
    const r = kind === 'steel' && this.rafts.find(r => r.id === raftId), c = r ? raftPoint(r, bar.lx + bar.w / 2, bar.ly + bar.h / 2) : { x: bar.x + bar.w / 2, y: bar.y + bar.h / 2 };
    this.effects.push({ kind: 'bar-break', x: c.x, y: c.y, w: bar.w, h: bar.h, age: 0, life: .8 });
  }
  hitNerra(target, b) {
    const v = this.villain; if (this.phase === 'rescue' || v.ghost || v.hidden) return;
    this.effects.push({ kind: 'hit', x: b.x, y: b.y, age: 0, life: .3 });
    // The right power: STARFIRE (the titan) and a FIRE ball scald her for difficulty.js powers.strong per hit.
    const power = b?.titan > 0 || (this.timers.fire > 0 && !!b && !b.powerShot && !b.blast), plain = b && !b.blast && !(b.titan > 0) && !(b.ram > 0) && !power;
    if (plain && (b.powerShot || b.spent)) { this.effects.push({ kind: 'nerra-shrug', x: b.x, y: b.y, age: 0, life: .4 }); return; }
    const r = this.pool.hit(b?.blast ? MINE.nerra : power ? difficulty(this.difficulty).powers.strong : b?.ram > 0 ? RAM.damage : 1);
    if (power && r.dealt) powerTitle(this, b.titan > 0 ? 'STARFIRE SCORCHES NERRA' : 'FIRE SCALDS NERRA', b.x, b.y); v.hp = this.pool.hp; v.maxHP = this.pool.maxHP; this.useful(b);
    if (!r.dealt) { this.effects.push({ kind: 'nerra-shrug', x: b.x, y: b.y, age: 0, life: .4 }); return; }
    if (plain) b.spent = true;
    this.score += 50; v.stunUntil = this.time + .4; v.anger = Math.min(3, v.anger + 1); this.creditHit(b);
    if (target.kind === 'claw' && ['pullWindup', 'pulseWindup'].includes(v.stage) && (target.clawSide === v.side || target.id === 'claw' + v.side) && ++v.clawHits >= 2) this.cancelSurge();
    if (this.stage >= 2 && this.teachingDone && v.anger >= 3 && v.stage === 'idle') this.nextSurge = Math.min(this.nextSurge, Math.max(this.time + 3, this.attackGrace));
    if (r.knockdown) return this.knockDown();
    if (this.pool.defeated) {
      this.phase = 'rescue'; this.rescueAt = this.time; v.stage = 'defeated'; v.pose = 'hurt'; v.act = { pose: 'defeated', t: 0 };
      v.defeat = { age: 0, stage: 'stagger', offsetX: 0, offsetY: 0, angle: 0, scaleX: 1, scaleY: 1, daze: 0 };
      this.chain.released = true; this.chain.tension = 0; this.pulses = []; this.pulseWarning = null; this.clearPowers(); this.capsules = []; this.bolts = [];
      for (const g of this.gates) g.until = Infinity;
    }
  }
  // Knock-down: the stage's HP cap is reached. She escapes (HP carries), the player gets a drop, a chest and a star.
  knockDown() {
    const v = this.villain; this.knockdowns++;
    this.effects.push({ kind: 'knockdown', x: v.footX, y: v.footY - 80, age: 0, life: 1.6, keep: true });
    this.banner = { text: 'KNOCKED DOWN!', sub: 'NERRA ESCAPES · +1 DROP · CHEST', t: 0, life: 2.2 };
    this.drop(v.footX, v.footY - 60); this.capsules.push({ id: ++this.serial, kind: 'chest', x: v.footX + 24, y: v.footY - 50, vy: 85 });
    this.pulses = []; this.pulseWarning = null; v.stage = 'idle'; v.stageTime = 0; this.nextSurge = this.nextPulse = Infinity;
    if (this.peek) this.peek.state = 'gone';
    this.play(this.stage === 1 ? 'dive' : 'escape');
    this.checkClear();
  }

  // ---------- drops ----------
  drop(x, y, chest = false) {
    const pool = this.board.plan.powers, kind = chest ? this.bigPower() : pool[Math.floor(Math.random() * pool.length)];
    this.capsules.push({ id: ++this.serial, kind, x: clamp(x, 24, this.width - 24), y, vy: chest ? 70 : 95 });
  }
  moveCapsules(dt) {
    const p = this.paddle;
    for (const c of this.capsules) {
      c.y += c.vy * dt; c.x += clamp(p.x - c.x, -45 * dt, 45 * dt);
      if (c.y + 9 >= p.y - p.h / 2 && c.y - 9 <= p.y + p.h / 2 && Math.abs(c.x - p.x) <= p.w / 2 + 14) { c.dead = true; this.collect(c.kind, c.x, c.y); }
      else if (c.y > p.y + 40) c.dead = true;
    }
    this.capsules = this.capsules.filter(c => !c.dead);
  }
  collect(kind, x, y) {
    this.effects.push({ kind: 'capsule', power: kind, x, y, age: 0, life: .6 });
    if (kind === 'chest') { this.score += 400; kind = this.bigPower(); }
    if (!this.powersSeen.has(kind)) { this.powersSeen.add(kind); this.tip = { text: POWER_TIPS[kind], t: 0, life: 2.6 }; }
    const live = () => this.balls.filter(b => !b.caught && !b.dead), cap = 6, p = this.paddle;
    if (kind === 'wide') this.timers.wide = SIEGE_POWERS.wide;
    else if (kind === 'slow') this.timers.slow = SIEGE_POWERS.slow;
    else if (kind === 'fire') this.timers.fire = SIEGE_POWERS.fire;
    else if (kind === 'laser') { this.timers.laser = SIEGE_POWERS.laser; this.timers.laserCd = 0; }
    else if (kind === 'shield') this.ward = { y: p.y + 20, remaining: SIEGE_POWERS.shield };
    else if (kind === 'split') {
      const fan = difficulty(this.difficulty).powers.fan;
      for (const b of live()) for (const da of [-fan, fan]) if (this.balls.filter(q => !q.dead).length < cap) {
        const c = Math.cos(da), s = Math.sin(da), nb = this.newBall(b.x, b.y, b.vx * c - b.vy * s, b.vx * s + b.vy * c);
        // A split off the star ball can start inside what it was piercing: like an ending star ball, it finishes its pass.
        const inside = this.targets().filter(t => t.kind && overlapsTarget({ ...nb, r: nb.r + 2 }, t)).map(t => ['shell', 'claw'].includes(t.kind) ? 'nerra' : t.id);
        if (inside.length) nb.pierceExit = new Set(inside);
        this.balls.push(nb);
      }
    } else if (kind === 'burst') {
      const fan = difficulty(this.difficulty).powers.fan + .05;
      for (const a of [-fan, 0, fan]) if (this.balls.filter(q => !q.dead).length < cap) this.balls.push(this.newBall(p.x, p.y - 15, Math.sin(a) * this.speed, -Math.cos(a) * this.speed));
    } else if (kind === 'titan' && !this.cosmic) {
      const b = live()[0]; if (b) { endRam(this, b); b.titan = 6; b.r = STAR_R; this.powerTimers.cosmic = 6; this.cosmic = { time: 6, maxTime: 6, ballId: b.id }; }
    }
  }
  newBall(x, y, vx, vy) { return { id: ++this.serial, x, y, px: x, py: y, vx, vy, r: BALL_R, caught: false, ram: 0, ramBricks: 0, contacts: new Set(), useful: this.time }; }
  updateTimers(dt) {
    const T = this.timers, p = this.paddle, live = this.phase === 'play';
    for (const k of ['wide', 'slow', 'fire', 'laser']) if (T[k] > 0 && live) T[k] = Math.max(0, T[k] - dt);
    let w = p.w + ((T.wide > 0 ? 150 : 100) - p.w) * Math.min(1, dt * 10);
    if (w > p.w) w = 2 * paddleRoom(p.x, p.w / 2, w / 2, p.y - p.h / 2, p.y + p.h / 2, this.balls);   // WIDE never lands on a ball beside it
    p.w = w; this.setTarget(p.targetX);
    const want = this.stageSpeed * (T.slow > 0 ? .78 : 1);
    if (Math.abs(want - this.speed) > .01) { this.speed = want; for (const b of this.balls) if (!b.caught) this.normalize(b); }
    if (T.laser > 0 && live && (T.laserCd -= dt) <= 0) {
      T.laserCd = .42;
      for (const s of [-1, 1]) { const x = p.x + s * (p.w / 2 - 8), y = p.y - 10; this.bolts.push({ id: ++this.serial, x, y, px: x, py: y, vx: 0, vy: -540, r: 2.5, age: 0, powerShot: true }); }
    }
  }
  updateBolts(dt) {
    for (const s of this.bolts) {
      s.px = s.x; s.py = s.y; s.age += dt; const end = { x: s.x, y: s.y + s.vy * dt }; let first = null;
      for (const t of this.targets(dt)) { const h = sweepTarget(s, end, s.r, t, 0, dt); if (h && (!first || h.t < first.t)) first = { ...h, target: t }; }
      if (first) { s.y = mix(s.y, end.y, first.t); s.dead = true; if (first.target.kind && first.target.kind !== 'guard') this.hit(first.target, s); this.effects.push({ kind: 'bolt-hit', x: s.x, y: s.y, age: 0, life: .2 }); if (this.phase !== 'play') break; }
      else { s.y = end.y; if (s.y < 70) s.dead = true; }
    }
    this.bolts = this.bolts.filter(s => !s.dead);
  }

  // ---------- the flow ----------
  // Prizes and bonus bricks (the wheel pits) never hold a stage up.
  requiredLeft() { return this.blocks.filter(b => b.hp > 0 && !b.prize && !b.bonus).length + this.bricks.filter(b => b.hp > 0 && !b.prize).length; }
  // The Wheel's stake is Nerra: it clears once she is knocked off the hub as well.
  stakeMet() { return this.stage !== 2 || this.pool.down; }
  checkClear() {
    if (this.stage >= STAGE_COUNT - 1 || this.phase === 'clear' || this.state !== 'play' || this.requiredLeft() > 0 || !this.stakeMet()) return;
    this.phase = 'clear'; this.clearT = 0; this.stagesCleared = this.stage + 1;
    this.stageLog.push({ stage: this.stage, time: this.time - this.stageStart.time, lives: this.lives, ballsLost: this.stageStart.lives - this.lives, knockdowns: this.knockdowns - this.stageStart.knockdowns });
    for (const b of this.balls) b.dead = true;
    this.capsules = []; this.bolts = []; this.pulses = []; this.pulseWarning = null; this.shots = []; this.clearPowers(); this.ward = null;
    this.banner = { text: 'STAGE CLEAR', sub: this.carryLine(), t: 0, life: SIEGE_TIMING.clear };
    if (this.stage === 2 && !this.nerraGone && !this.villain.hidden && !this.cine) this.play('escape');   // she leaves anyway
    if (this.stage === 1 && this.peek && this.peek.state !== 'gone' && !this.villain.hidden) { this.peek.state = 'gone'; this.play('dive'); }
  }
  carryLine() {
    if (this.stage === 0) return this.pearls >= this.pearlsTotal ? 'PEARL SHIELD BANKED' : `PEARLS ${this.pearls} / ${this.pearlsTotal}`;
    if (this.stage === 1) return this.valvesShut ? `${plural(this.valvesShut, 'SLUICE')} SHUT · LOWER FLOOD AHEAD` : 'THE SLUICES STAY OPEN';
    return `NERRA ESCAPED · ${Math.round(this.pool.hp / this.pool.maxHP * 100)}% HP`;
  }
  // Ambient motion while play is held (card, hook, clear): water and rafts settle, effects age, the paddle follows.
  ambient(dt) {
    const p = this.paddle; p.px = p.x; p.x += clamp(p.targetX - p.x, -700 * dt, 700 * dt);
    for (const e of this.effects) e.age += dt; this.effects = this.effects.filter(e => e.age < e.life);
    this.updateWorld(dt);
    for (const b of this.balls) if (b.caught) { b.x = b.px = p.x; b.y = b.py = p.y - 15; }
  }
  step(dt) {
    if (this.banner && (this.banner.t += dt) >= this.banner.life) this.banner = null;
    if (this.tip && (this.tip.t += dt) >= this.tip.life) this.tip = null;
    if (this.phase === 'card') { this.time += dt; this.card.t += dt; this.ambient(dt); if (this.card.t >= SIEGE_TIMING.card) this.endCard(); return; }   // the stage's opening beat waits for the card
    if (this.phase === 'clear') { this.time += dt; this.clearT += dt; this.ambient(dt); this.direct(dt); this.syncAnatomy(); if (this.clearT >= SIEGE_TIMING.clear) this.buildStage(this.stage + 1); return; }
    if (this.phase === 'hook') { this.time += dt; this.ambient(dt); this.direct(dt); this.syncAnatomy(); return; }
    const before = this.balls.map(b => ({ b, vx: b.vx, vy: b.vy }));
    super.step(dt);
    if (this.state !== 'play' || this.phase === 'rescue' || this.phase === 'complete' || this.phase === 'clear') return;
    if (!this.started && !this.backHold) { this.direct(dt); this.syncAnatomy(); }   // her opening beat plays before the serve; a Continue's hold freezes it
    this.stageClock += dt;
    this.updateTimers(dt); this.moveCapsules(dt); this.updateBolts(dt);
    if (this.phase === 'play' || this.phase === 'serve') this.updateBlasts();
    if (this.phase === 'play') { this.updateSpokes(dt); this.updateChambers(dt); this.updateRegrow(); this.updateFlood(); }
    this.steerDull(before);
    if (this.stage === 3) { this.floodMinS4 = Math.min(this.floodMinS4, this.water.y); if (this.fury && !this.cine) this.villain.anger = 3; if (this.pool.hp <= this.pool.maxHP * .3 && !this.fury) { this.fury = true; this.villain.anger = 3; this.rules.interval = this.baseRules.interval * .7; this.rules.pulseInterval = this.baseRules.pulseInterval * .7; this.effects.push({ kind: 'nerra-roar', x: this.villain.footX, y: this.villain.footY - 90, age: 0, life: .7 }); } }
  }
  // Attacks by stage: the tide (1, 2), peeks (2), the hub fight (3, 4: the base machinery).
  updateAttacks(dt) {
    const v = this.villain;
    if (this.stage <= 1 && this.time >= this.nextTide && this.time >= this.attackGrace) {
      this.water.target = Math.max(this.lumi.targetY + REFUGE_LIP_OFFSET, this.water.target - this.rules.tideSurge);
      this.effects.push({ kind: 'tide-surge', x: 180, y: this.water.y, age: 0, life: 1 });
      this.nextTide = this.time + this.rules.tideGap;
    }
    // The creep runs in every stage once play starts (not during a cut-scene beat or a continue's grace).
    if (!this.cine && this.time >= this.attackGrace) this.water.target = Math.max(this.lumi.targetY + REFUGE_LIP_OFFSET, this.water.target - this.rules.tideRise * dt);
    if (this.stage === 1) { this.updatePeek(dt); if (this.peek?.state === 'aim' || this.peek?.state === 'fire') super.updateAttacks(dt); return; }
    if (this.stage === 0 || this.cine || this.nerraGone || v.hidden) return;
    super.updateAttacks(dt);
  }
  updateActor(dt) {
    if (this.cine || this.stage <= 1 || this.nerraGone || this.villain.hidden) { this.direct(dt); this.syncAnatomy(); this.emitWater(); return; }
    super.updateActor(dt);
    const v = this.villain; v.act = { pose: v.pose === 'fury' ? 'furious' : this.time < v.stunUntil ? 'hurt' : v.pose === 'pull' ? 'snap' : v.pose === 'step' ? 'walk' : 'idle', t: 0, gaze: null };
  }
  emitWater() {
    if (!this.fireWater) return;
    const v = this.villain, w = this.pulseWarning, s = this.rules.pulseSpeed, from = { ...this.claws[0].muzzle }, angle = Math.atan2(w.target.y - from.y, w.target.x - from.x);
    this.pulses.push({ id: ++this.serial, x: from.x, y: from.y, px: from.x, py: from.y, vx: Math.cos(angle) * s, vy: Math.sin(angle) * s, r: 10, age: 0, life: 3, from, dealt: false });
    v.emission = { from, angle, at: this.time, side: -1 }; this.effects.push({ kind: 'water-muzzle', x: from.x, y: from.y, angle, age: 0, life: .25 });
    this.pulseWarning = null; this.fireWater = false;
  }
  // Floodworks peeks: Nerra slides out from a side wall, takes aim with her crusher, fires one water pulse and slides back.
  updatePeek(dt) {
    const P = this.peek, v = this.villain; if (!P || P.state === 'gone') return;
    const spot = this.board.peeks.find(s => s.side === P.side), off = { x: P.side < 0 ? -170 : this.width + 170, y: spot.y };
    P.t += dt;
    const go = (state, extra = {}) => { P.state = state; P.t = 0; Object.assign(P, extra); };
    if (P.state === 'away' && P.t >= P.wait && this.time >= this.attackGrace) { v.hidden = false; v.ghost = true; v.facing = P.side < 0 ? -1 : 1; v.footX = off.x; v.footY = off.y; go('enter'); }
    else if (P.state === 'enter') { const q = smooth(P.t / .55); v.footX = mix(off.x, spot.x, q); v.footY = spot.y; v.pose = Math.floor(P.t * 8) % 2 ? 'step' : 'idle'; v.act = { pose: 'walk', t: P.t, gaze: null }; if (P.t >= .55) { v.ghost = false; go('look'); } }
    else if (P.state === 'look') { v.pose = this.time < v.stunUntil ? 'hurt' : 'idle'; v.act = { pose: this.time < v.stunUntil ? 'hurt' : 'look', t: P.t, gaze: { x: this.paddle.x, y: this.paddle.y } }; if (P.t >= .4) { this.beginPulse(); go('aim'); } }
    else if (P.state === 'aim' || P.state === 'fire') {
      v.pose = this.time < v.stunUntil ? 'hurt' : 'idle'; v.act = { pose: this.time < v.stunUntil ? 'hurt' : 'snap', t: P.t, gaze: { x: this.paddle.x, y: this.paddle.y } };
      if (P.state === 'aim' && v.stage === 'pulse') go('fire');
      if (v.stage === 'idle' || (P.state === 'fire' && P.t >= .9) || (P.state === 'aim' && P.t > 4)) { v.ghost = true; v.stage = 'idle'; this.pulseWarning = null; go('exit'); }
    } else if (P.state === 'exit') { const q = smooth(P.t / .5); v.footX = mix(spot.x, off.x, q); v.pose = Math.floor(P.t * 8) % 2 ? 'step' : 'idle'; v.act = { pose: 'walk', t: P.t, gaze: null }; if (P.t >= .5) { v.hidden = true; go('away', { side: -P.side, wait: 7.5 * (this.board.plan.attack ?? 1) }); } }
    v.x = v.footX;
  }
  updateBlasts() {
    const due = this.blasts.filter(q => this.time >= q.at); if (!due.length) return;
    this.blasts = this.blasts.filter(q => this.time < q.at);
    for (const q of due) { if (this.phase !== 'play' && this.phase !== 'serve') break; this.blast(q.x, q.y); }
  }
  // Barnacle shield grows back once no ball is near it.
  updateRegrow() {
    const after = REGROW[this.difficulty] ?? REGROW.medium;
    for (const b of this.blocks) {
      if (!b.regrow || b.hp > 0 || this.time - (b.downAt ?? this.time) < after) continue;
      const room = { type: 'rect', x: b.x - 14, y: b.y - 14, w: b.w + 28, h: b.h + 28 };
      if (this.balls.some(q => !q.dead && overlapsTarget(q, room)) || this.bolts.some(q => overlapsTarget(q, room))) continue;
      b.hp = b.maxHP; b.downAt = null; this.effects.push({ kind: 'barnacle-grow', x: b.x + b.w / 2, y: b.y + b.h / 2, w: b.w, h: b.h, age: 0, life: .6 });
    }
  }
  // How far the flood has climbed from the bottom of its column toward the refuge (0..1), and the danger beat.
  floodFrac() { const W = this.water; return clamp((W.initial - W.y) / Math.max(1, W.initial - W.limit), 0, 1); }
  floodLeft() { const W = this.water; return clamp((W.y - W.limit) / Math.max(1, W.initial - W.limit), 0, 1); }
  get floodDanger() { return this.floodLeft() <= 1 - FLOOD_CLOCK.danger; }
  updateFlood() {
    if (this.floodDanger && !this.floodWarned) { this.floodWarned = true; this.tip = { text: 'THE TIDE IS AT THE REFUGE: HURRY', t: 0, life: 2.4 }; this.effects.push({ kind: 'flood-danger', x: this.lumi.x, y: this.water.y, age: 0, life: 1.2 }); }
    else if (this.floodLeft() > 1 - FLOOD_CLOCK.danger + .08) this.floodWarned = false;
  }
  // Wheel spokes swing between their two fixed poses. The swing waits while a ball is in the way of the new pose.
  updateSpokes(dt) {
    for (const s of this.spokes) {
      s.shown += clamp(s.pose - s.shown, -dt / .18, dt / .18);
      s.tell = Math.max(0, Math.min(1, 1 - (s.next - this.time) / SIEGE_TIMING.spokeTell));
      if (this.time < s.next) continue;
      const pose = 1 - s.pose, q = s.poses[pose], rect = { type: 'rect', x: q.x, y: q.y, w: q.w, h: q.h };
      if (this.balls.some(b => !b.caught && !b.dead && overlapsTarget({ ...b, r: b.r + 3 }, rect))) continue;
      s.pose = pose; s.next = this.time + s.period[pose]; this.effects.push({ kind: 'spoke-swing', id: s.id, x: s.hinge.x, y: s.hinge.y, open: pose === 1, age: 0, life: .4 });
    }
  }
  // Chambers no ball has entered for crackAfter seconds show a hairline crack on one bar: a ram, fire or titan breaks it,
  // and in the showdown the cracked bar gives way by itself.
  updateChambers(dt) {
    const inside = (c, x, y) => x > c.x && x < c.x + c.w && y > c.y && y < c.y + c.h;
    const all = [...this.chambers.map(c => ({ c, test: b => inside(c, b.x, b.y), bar: () => this.bars.find(q => q.id === c.crack) })),
      ...this.rafts.filter(r => r.chamber).map(r => ({ c: r.chamber, test: b => { const dx = b.x - r.x, dy = b.y - r.y, ca = Math.cos(-r.angle), sa = Math.sin(-r.angle); return inside({ x: r.chamber.lx, y: r.chamber.ly, w: r.chamber.w, h: r.chamber.h }, dx * ca - dy * sa, dx * sa + dy * ca); }, bar: () => r.steel.find(s => s.id === r.chamber.crack), raft: r }))];
    for (const { c, test, bar, raft } of all) {
      const prizes = raft ? this.bricks.some(b => b.prize && b.hp > 0 && b.raft === +raft.id.at(-1)) : this.blocks.some(q => q.hp > 0 && inside(c, q.x + q.w / 2, q.y + q.h / 2));
      if (this.balls.some(b => !b.caught && !b.dead && test(b))) { c.idle = 0; c.entered = true; continue; }
      if (!prizes) continue;
      c.idle += dt;
      const b = bar();
      if (b && !b.broken && !b.cracked && c.idle >= SIEGE_TIMING.crackAfter) { b.cracked = true; b.crackedAt = this.time; this.effects.push({ kind: 'bar-crack', id: b.id, age: 0, life: 1 }); }
      if (b && b.cracked && !b.broken && this.stage === 3 && this.time - b.crackedAt >= SIEGE_TIMING.selfBreak) this.breakBar(raft ? `steel:${raft.id}:${b.id}` : b.id);
    }
  }
  // A ball that has only met walls and steel for `dull` seconds gets each such bounce turned a little toward the paddle.
  steerDull(before) {
    for (const { b, vx, vy } of before) {
      if (b.caught || b.dead || !this.balls.includes(b)) continue;
      if (vy > 0 && b.vy < 0 && b.y > this.paddle.y - 40) { b.useful = this.time; b.spent = false; continue; }   // the paddle re-arms it
      if (Math.sign(vx) === Math.sign(b.vx) && Math.sign(vy) === Math.sign(b.vy)) continue;
      if (this.time - (b.useful ?? this.time) < SIEGE_TIMING.dull) continue;
      const a = Math.atan2(b.vy, b.vx), want = Math.PI / 2, d = Math.atan2(Math.sin(want - a), Math.cos(want - a)), n = a + clamp(d, -SIEGE_TIMING.dullTurn, SIEGE_TIMING.dullTurn), s = Math.hypot(b.vx, b.vy);
      b.vx = Math.cos(n) * s; b.vy = Math.sin(n) * s;
      if (b.vy < 0 && -b.vy < s * .4) b.vy = -b.vy;   // a shallow climb (the floor of normalize would keep it) turns down instead
      this.normalize(b);
    }
  }
  // Several balls: a ball below the paddle is culled; only the last one costs a life.
  checkFallen() {
    if (this.phase === 'clear') return;
    const p = this.paddle, gone = b => !b.caught && b.y > p.y + 32;
    if (!this.balls.some(gone)) return;
    const left = this.balls.filter(b => !gone(b) && !b.dead);
    if (left.some(b => !b.caught)) { this.balls = left; return; }
    this.loseBall('balls');
  }
  loseBall(reason) {
    if (this.phase === 'rescue' || this.phase === 'clear' || this.state !== 'play') return;
    this.ballsLost++; if (this.stage === 3) this.ballsLostS4++;
    this.capsules = []; this.bolts = []; for (const k of Object.keys(this.timers)) this.timers[k] = 0;
    super.loseBall(reason);
  }
  serve() { super.serve(); if (this.balls?.[0]) this.balls[0].useful = this.time; }
  // Continue keeps the stage and its progress; Nerra's director and the board stay as they were.
  continue() {
    const ok = super.continue(); if (!ok) return ok;
    this.capsules = []; this.bolts = []; for (const k of Object.keys(this.timers)) this.timers[k] = 0;
    if (this.peek && this.peek.state !== 'gone' && this.peek.state !== 'away') { this.peek.state = 'exit'; this.peek.t = 0; this.villain.ghost = true; }
    return ok;
  }
  nearMiss() {
    const left = this.requiredLeft(), bricks = 1 - left / Math.max(1, this.board.budget), P = this.pool, cap = Math.ceil(P.maxHP * .4);
    const wheel = P.down ? 1 : clamp((P.maxHP - P.hp) / Math.max(1, P.maxHP - cap), 0, .99);
    const done = (this.stage + (this.stage === 3 ? 1 - P.hp / P.maxHP : this.stage === 2 ? (left ? (bricks + wheel) / 2 : wheel) : bricks)) / STAGE_COUNT;
    const line = this.stage === 3 ? hpLeft('NERRA', this.villain.hp) : this.stage === 2 && !left && !P.down ? `KNOCK NERRA OFF THE WHEEL: ${plural(P.hp - cap, 'HIT')}` : `${plural(left, 'BRICK')} TO STAGE ${this.stage + 2}`;
    return { line, progress: done, stage: ['STAGE', this.stage + 1, STAGE_COUNT] };
  }
  // Menu card: stage 1's board with Nerra on the hub mid-hook, the card dismissed.
  preview() { this.phase = 'serve'; this.card = null; this.cine = null; const v = this.villain; v.hidden = false; v.ghost = true; v.footX = v.x = this.width / 2; v.footY = 232; v.facing = 1; v.pose = 'pull'; v.stage = 'idle'; this.syncAnatomy(); }
  // Stars: flood margin in the showdown, no ball lost in the showdown, and an early knock-down (stage 2, from the peeks).
  starFlags() {
    const H = this.water.initial - this.water.limit, margin = (this.floodMinS4 - this.water.limit) / Math.max(1, H);
    return { flood: Number.isFinite(this.floodMinS4) && margin >= .5, clean: this.ballsLostS4 === 0, knockdown: this.pool.knockdowns.includes(1) };   // knocked down early: in the Floodworks, before the wheel
  }
}
const MUZZLE = CRUSHER_WATER_TIP;
function clawAt(c, p) { const x = p.x * c.scale * (c.mirror ? -1 : 1), y = p.y * c.scale; return { x: c.root.x + x * Math.cos(c.angle) - y * Math.sin(c.angle), y: c.root.y + x * Math.sin(c.angle) + y * Math.cos(c.angle) }; }
