import { sweepTarget, overlapsTarget } from '../carrier-physics.js';
import { ejectBall } from '../clearance.js';
import { RAM, BALL_R, BACK_WARD, paddleBounce, tickRam, ramThrough } from './ram.js';
import { hpLeft } from '../near-miss.js';
import { tagSpecials, brickSpecial, armourOutright } from '../castle-specials.js';

const STEP = 1 / 240;
// Inscribed alpha>=128 circles, measured at3px/u from the retained Korr poses.
export const KORR_BODIES = {"idle":[[9.66667,-59,39.56097],[-16.33333,-49,33.40422],[-12.33333,-25,21.95019],[29.66667,-39,20.60042],[-40.33333,-43,19.46566],[-14.33333,-73,16.13549],[37.66667,-51,16],[3.66667,-31,14.46156],[35.66667,-69,14.40136],[-38.33333,-57,13.82843],[17.66667,-31,13.53109],[-4.33333,-83,13.34958],[-22.33333,-13,12.49026],[33.66667,-25,12.40332],[5.66667,-87,12.33333],[23.66667,-83,12.31578],[-26.33333,-71,11.59236],[39.66667,-13,11.27605],[15.66667,-87,11.01959],[31.66667,-79,10.29681],[-54.33333,-15,10],[-48.33333,-29,9.71654],[63.66667,-41,2],[57.66667,-31,1.77485],[55.66667,-5,2.07037],[9.66667,-7,2],[55.66667,-39,2.33333],[51.66667,-79,1.69425],[61.66667,-35,1.90273],[51.66667,-31,3],[61.66667,-45,1.69425],[7.66667,-11,3],[53.66667,-9,2.09337],[3.66667,-7,2.09337],[57.66667,-35,5.09294],[-60.33333,-35,1.80104],[51.66667,-5,2.66667],[-32.33333,-3,2],[51.66667,-39,4.15121],[-46.33333,-7,3.33333],[-62.33333,-7,2.82894],[59.66667,-41,2.27008],[47.66667,-79,1.69425],[49.66667,-77,3.34845],[-60.33333,-39,2.73985],[-6.33333,-3,1.69425],[-26.33333,-85,2.02369],[-58.33333,-25,2.49509],[51.66667,-11,2.49509]],"windup":[[7.66667,-63,36.47397],[-16.33333,-53,26.38537],[21.66667,-85,23.09742],[-32.33333,-43,19.1745],[-2.33333,-39,16.74166],[25.66667,-43,16.69605],[5.66667,-89,15.47805],[33.66667,-57,15.40056],[-16.33333,-73,14.98913],[33.66667,-73,13.68253],[31.66667,-31,12.07186],[37.66667,-13,11.89141],[-38.33333,-29,11.44706],[-6.33333,-27,11.37137],[39.66667,-81,11.27605],[-8.33333,-83,11.2377],[9.66667,-37,10.66162],[-46.33333,-15,10.26017],[17.66667,-101,10.04827],[35.66667,-23,9.37348],[-4.33333,-15,9.28725],[-26.33333,-69,9.05934],[53.66667,-3,2.64809],[55.66667,-89,2.07037],[7.66667,-7,1.90273],[55.66667,-81,2.20526],[-56.33333,-5,2.20526],[-0.33333,-107,1.77485],[51.66667,-9,2.27008],[21.66667,-113,2.02369],[-38.33333,-5,3],[53.66667,-85,4.93713],[47.66667,-3,2.35409],[3.66667,-7,2.66667],[-12.33333,-7,1.90273],[47.66667,-47,1.90273],[-52.33333,-37,2.20526],[5.66667,-11,1.77485],[-52.33333,-5,3.01663],[-56.33333,-9,2.02369],[51.66667,-77,2.20526],[25.66667,-109,2.02369],[-50.33333,-33,2.02369],[1.66667,-105,2.35409],[-52.33333,-41,2.20526],[29.66667,-3,2],[23.66667,-111,1.80104],[53.66667,-91,2.66667]],"release":[[5.66667,-55,39.24219],[-22.33333,-49,27.21259],[29.66667,-41,24.3536],[-4.33333,-29,24.34234],[33.66667,-59,20],[-40.33333,-41,18.2528],[-0.33333,-11,16.22632],[27.66667,-73,15.50263],[-18.33333,-69,15.03257],[35.66667,-25,13.82843],[15.66667,-81,13.14917],[5.66667,-83,12.16111],[-4.33333,-81,11.74971],[15.66667,-29,11.63422],[-46.33333,-29,11.61563],[41.66667,-17,11.29518],[-22.33333,-29,11.04403],[43.66667,-31,10.04827],[-30.33333,-67,10.03757],[-54.33333,-15,9.69441],[9.66667,-5,9.65555],[-12.33333,-79,9.40205],[61.66667,-3,2.02369],[63.66667,-35,1.69425],[53.66667,-77,2.33333],[63.66667,-43,1.77485],[53.66667,-3,2.35409],[59.66667,-29,2.02369],[57.66667,-9,2.49509],[57.66667,-35,2.35409],[47.66667,-3,3],[-62.33333,-5,3],[-46.33333,-5,2.4154],[39.66667,-3,2.33333],[61.66667,-39,2.49509],[-60.33333,-35,1.90273],[-56.33333,-3,1.66667],[55.66667,-27,2],[-4.33333,7,2.20526],[51.66667,-73,3.72184],[51.66667,-7,6.72987],[55.66667,-31,5.79493],[-60.33333,-39,2.4154],[-60.33333,-43,1.66667],[-50.33333,-5,3.33333],[-58.33333,-5,3.66667],[43.66667,-3,2.82894],[-58.33333,-33,2.64809],[53.66667,-15,2.02369],[5.66667,5,1.77485],[59.66667,-5,3]],"stagger":[[-8.33333,-55,37.92311],[15.66667,-67,34.46769],[-32.33333,-41,21.01041],[27.66667,-45,18.34523],[-34.33333,-61,16.80985],[-20.33333,-31,16.48266],[-4.33333,-83,16.24309],[37.66667,-57,14.93464],[-2.33333,-29,14.72581],[-42.33333,-29,14.05802],[23.66667,-91,14.0155],[-28.33333,-73,12.98749],[35.66667,-33,12.80271],[5.66667,-89,12.77307],[13.66667,-39,12.49026],[-16.33333,-81,11.74511],[43.66667,-13,11.50352],[39.66667,-21,11.50352],[33.66667,-85,11.50352],[39.66667,-71,11.06842],[-50.33333,-13,10.42667],[1.66667,-13,9.69441],[59.66667,-61,1.77485],[59.66667,-5,3.09854],[57.66667,-53,2.64809],[-60.33333,-1,2],[-40.33333,-1,1.66667],[13.66667,-5,1.66667],[43.66667,-97,2.33333],[53.66667,-49,2.94962],[57.66667,-11,1.80104],[-0.33333,-103,2.82894],[-44.33333,-1,2.51467],[-54.33333,-1,2.73985],[-60.33333,-5,2.82894],[55.66667,-57,3.09854],[9.66667,-5,2],[-48.33333,-1,2.66667],[55.66667,-7,5.66667],[43.66667,-93,2],[35.66667,-3,1.66667],[29.66667,-105,1.77485],[-56.33333,-35,1.77485],[-54.33333,-39,2.35409],[11.66667,-9,2.53411],[53.66667,-53,5.86703],[59.66667,-57,1.69425],[-42.33333,-5,2.73985],[49.66667,-47,2.33333]]};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const BELLFORGE_MODES = {
  easy: { hp: 24, interval: 10, bellCap: 1, mistakes: 8, coreHits: 18 },
  medium: { hp: 32, interval: 8.5, bellCap: 1, mistakes: 6, coreHits: 22 },
  hard: { hp: 40, interval: 7.5, bellCap: 2, mistakes: 5, coreHits: 26 },
};
export const BELLFORGE_ENDING = { stagger: .45, slump: .65, settle: .5, escape: 1.8 };
const BELL_R = 14;
// Round-3 castle specials (src/castle-specials.js), [row, col] of the wall's six columns by six rows: armour (two hits; a ram
// still breaks it outright) hugs Korr's side of the top rows, two mines sit in clusters mid-wall (a blast reaches the bricks
// above, below and beside it: MINE_R is a hair over one column pitch and never touches the ramp pins), coins pay a bonus.
export const BELLFORGE_SPECIALS = { armour: [[0, 0], [0, 2], [1, 0], [2, 1]], mine: [[3, 1], [4, 4]], coin: [[5, 0], [2, 3], [5, 5]] };
const MINE_R = 52, blastable = b => b.type === 'brick';
const RESCUE_DELAY = BELLFORGE_ENDING.stagger + BELLFORGE_ENDING.slump + BELLFORGE_ENDING.settle;
const RESCUE_DURATION = RESCUE_DELAY + BELLFORGE_ENDING.escape;
const smooth = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
export function rampPose(ramp, fraction = 1) {
  const angle = ramp.previousAngle + (ramp.angle - ramp.previousAngle) * fraction;
  const c = Math.cos(angle), s = Math.sin(angle), offset = ramp.contactOffset || { x: 0, y: 0 };
  const a = { x: ramp.pivot.x + c * offset.x - s * offset.y, y: ramp.pivot.y + s * offset.x + c * offset.y };
  return { a, b: { x: a.x + c * ramp.length, y: a.y + s * ramp.length }, angle };
}
function rampSlice(ramp, start, end = 1) {
  const delta = ramp.angle - ramp.previousAngle;
  return { ...ramp, previousAngle: ramp.previousAngle + delta * start, angle: ramp.previousAngle + delta * end };
}
export const lerpPoint = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
function closest(x, y, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y, u = clamp(((x - a.x) * dx + (y - a.y) * dy) / (dx * dx + dy * dy || 1), 0, 1);
  return { x: a.x + dx * u, y: a.y + dy * u, u };
}
// Conservative advancement uses a Lipschitz bound for the rotating end point.
export function sweepMovingSegment(from, to, radius, ramp, duration) {
  const arm = ramp.length + Math.hypot(ramp.contactOffset?.x || 0, ramp.contactOffset?.y || 0);
  const bound = Math.hypot(to.x - from.x, to.y - from.y) + Math.abs(ramp.angle - ramp.previousAngle) * arm;
  const reach = radius + ramp.thickness / 2;
  let t = 0;
  for (let i = 0; i < 64 && t <= 1; i++) {
    const pose = rampPose(ramp, t), x = from.x + (to.x - from.x) * t, y = from.y + (to.y - from.y) * t;
    const q = closest(x, y, pose.a, pose.b), d = Math.hypot(x - q.x, y - q.y), gap = d - reach;
    if (gap <= .001) {
      let nx = d > 1e-8 ? (x - q.x) / d : Math.sin(pose.angle), ny = d > 1e-8 ? (y - q.y) / d : -Math.cos(pose.angle);
      const omega = duration > 0 ? (ramp.angle - ramp.previousAngle) / duration : 0;
      const svx = -omega * (q.y - ramp.pivot.y), svy = omega * (q.x - ramp.pivot.x);
      if (d < 1e-8 && ((to.x - from.x) * nx + (to.y - from.y) * ny) > 0) { nx *= -1; ny *= -1; }
      return { t, nx, ny, x: q.x, y: q.y, svx, svy, depth: Math.max(0, -gap) };
    }
    if (bound < 1e-9) return null;
    t += Math.max(1e-7, gap / bound * .95);
  }
  return null;
}
export function circleSweep(from, to, radius, a, b, targetRadius) {
  const x = from.x - a.x, y = from.y - a.y, dx = to.x - from.x - (b.x - a.x), dy = to.y - from.y - (b.y - a.y);
  const r = radius + targetRadius, c = x * x + y * y - r * r, aa = dx * dx + dy * dy;
  let t = 0;
  if (c > 0) {
    if (aa < 1e-12) return null;
    const bb = 2 * (x * dx + y * dy), disc = bb * bb - 4 * aa * c;
    if (disc < 0) return null;
    t = (-bb - Math.sqrt(disc)) / (2 * aa);
    if (t < 0 || t > 1) return null;
  }
  const nx = x + dx * t, ny = y + dy * t, len = Math.hypot(nx, ny) || 1;
  return { t, nx: nx / len, ny: ny / len, depth: Math.max(0, r - Math.hypot(x, y)) };
}
export function reflect(body, hit, restitution = 1) {
  const vn = (body.vx - (hit.svx || 0)) * hit.nx + (body.vy - (hit.svy || 0)) * hit.ny;
  if (vn < 0) { body.vx -= (1 + restitution) * vn * hit.nx; body.vy -= (1 + restitution) * vn * hit.ny; }
}

export class Bellforge {
  constructor({ width = 360, height = 700, difficulty = 'easy', paddleY = height - 90, geometry = {} } = {}) {
    if (!Number.isFinite(width) || !Number.isFinite(height) || width < 360 || height < 700 || !Number.isFinite(paddleY) || paddleY > height - 30 || paddleY < 580) throw new RangeError('Bellforge needs its full portrait playfield');
    this.width = width; this.height = height; this.difficulty = Object.hasOwn(BELLFORGE_MODES, difficulty) ? difficulty : 'medium';
    this.rules = BELLFORGE_MODES[this.difficulty]; this.time = 0; this.serveTime = 0; this.active = false;
    this.state = 'play'; this.phase = 'serve'; this.paused = false; this.continued = false; this.lives = 3; this.score = 0; this.serial = 0;
    this.charge = 0; this.chargeBank = 0; this.guard = null; this.effects = []; this.bells = []; this.balls = [];
    this.paddle = { x: width / 2, px: width / 2, y: paddleY, w: 100, h: 14, targetX: width / 2, vx: 0, streak: 0, armed: false };
    this.villain = { x: 88, y: 105, foot: { x: 88, y: 161 }, w: 136, h: 112, hp: this.rules.hp, maxHP: this.rules.hp, stage: 'idle', stageTime: 0, until: 0, body: [], defeat: null };
    this.korrBodies = geometry.korrBodies || KORR_BODIES;
    this.fixedKorrBody = geometry.korrBody; this.updateBody();
    this.bellSource = { x: 164, y: 147, ...(geometry.bellSource || {}) };
    this.ramps = (geometry.ramps || [{ contactStart: { x: 123, y: 172 }, length: 72, angle: .19 }, { contactStart: { x: 174, y: 240 }, length: 78, angle: .17 }, { contactStart: { x: 245, y: 307 }, length: 68, angle: -.12 }])
      .map((r, id) => {
        // Measured ramp contactA minus hinge, relative to contactA→contactB length.
        const contactOffset = r.contactOffset || { x: r.length * .07088607594936712, y: -r.length * .08144244921989992 };
        const pivot = r.contactStart ? { x: r.contactStart.x - Math.cos(r.angle) * contactOffset.x + Math.sin(r.angle) * contactOffset.y,
          y: r.contactStart.y - Math.sin(r.angle) * contactOffset.x - Math.cos(r.angle) * contactOffset.y } : { x: r.x, y: r.y };
        return { id: `ramp-${id}`, pivot, contactOffset, length: r.length, angle: r.angle, previousAngle: r.angle, targetAngle: r.angle, omega: 0, thickness: 8 };
      });
    for (const r of this.ramps) Object.assign(r, rampPose(r));
    this.dock = { x: 294, y: 312, w: 36, h: 28, ...(geometry.dock || {}) };
    this.catchY = 365;
    this.lumi = { x: width - 55, y: 105, targetY: 105, baseY: 105, steps: 0, allowance: this.rules.mistakes, escape: 0, worried: false };
    this.bricks = [];
    const bottom = paddleY - 210, top = bottom - 143;
    for (let row = 0; row < 6; row++) for (let col = 0; col < 6; col++) {
      // Upper-right cells remain open for the bell route and visible ratchet.
      if ((row < 2 && col >= 4) || (row === 1 && (col === 2 || col === 3))) continue;
      this.bricks.push({ id: `brick-${row}-${col}`, row, col, type: 'brick', x: (width - 276) / 2 + col * 48, y: top + row * 25, w: 36, h: 18, hp: 1, maxHP: 1, colour: ['cyan', 'rose', 'plum'][(row + col) % 3] });
    }
    for (const r of this.ramps) this.bricks.push({ id: `pin-${r.id}`, type: 'pin', x: r.pivot.x + 8, y: r.pivot.y - 4, w: 30, h: 18, hp: 2, maxHP: 2, rampId: r.id });
    const pins = this.bricks.filter(b => b.type === 'pin');
    const intersects = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    this.bricks = this.bricks.filter(b => {
      if (b.type === 'pin') return true;
      if (pins.some(p => intersects(b, p)) || intersects(b, { x: 286, y: this.dock.y - 14, w: 50, h: 62 })) return false;
      const centre = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
      return !this.ramps.some(r => [r.angle, -.32].some(angle => sweepMovingSegment(centre, centre,
        Math.hypot(b.w, b.h) / 2, { ...r, previousAngle: angle, angle }, 0)));
    });
    tagSpecials(this.bricks, BELLFORGE_SPECIALS);
    this.nextWarning = 1.5; this.teachingDone = false; this.pendingDocks = []; this.lastRelease = -Infinity;
    this.rescueRemaining = 0; this.rescueDelayRemaining = 0; this.breachRemaining = 0; this.reason = ''; this.makeServe();
  }
  setTarget(x) { if (!Number.isFinite(x)) return false; this.paddle.targetX = clamp(x, this.paddle.w / 2 + 6, this.width - this.paddle.w / 2 - 6); return true; }
  pause(value) { this.paused = !!value; }
  makeServe() {
    this.phase = 'serve'; this.serveTime = 0;
    this.balls = [{ id: ++this.serial, x: this.paddle.x, y: this.paddle.y - 8, px: this.paddle.x, py: this.paddle.y - 8, vx: 0, vy: 0, r: BALL_R, caught: true, dead: false, ram: 0, ramBricks: 0, contacts: new Set() }];
  }
  launch(angle = -Math.PI / 2) {
    if (this.paused || this.state !== 'play' || this.phase !== 'serve' || !Number.isFinite(angle)) return false;
    const a = clamp(angle, -Math.PI + .25, -.25), b = this.balls[0];
    b.caught = false; b.vx = Math.cos(a) * 345; b.vy = Math.sin(a) * 345;
    this.phase = 'play'; this.active = true; this.backHold = false; return true;
  }
  canActivate(id = 'echo', { ignorePause = false } = {}) {
    return id === 'echo' && (ignorePause || !this.paused) && this.state === 'play' && ['play', 'serve'].includes(this.phase) && this.charge >= 100 - 1e-7 && !this.guard
      && (this.villain.stage === 'windup' && !this.nextTeaching || this.bells.some(b => !b.dead && !b.teaching && !b.returning && b.x <= 190 && b.y <= 235));
  }
  activate(id = 'echo') {
    if (!this.canActivate(id)) return false;
    this.charge = 0; this.chargeBank = 0;
    this.guard = { a: { x: 187, y: 205 }, b: { x: 217, y: 175 }, remaining: 3, age: 0, used: false };
    this.effect(202, 190, 'echo-deploy', .3); return true;
  }
  update(dt) {
    if (this.paused || this.state !== 'play' || !Number.isFinite(dt) || dt <= 0) return;
    let left = Math.min(.1, dt);
    while (left > 1e-9 && this.state === 'play') { const h = Math.min(STEP, left); this.step(h); left -= h; }
  }
  step(dt) {
    const p = this.paddle; p.px = p.x;
    p.x += clamp(p.targetX - p.x, -900 * dt, 900 * dt); p.vx = (p.x - p.px) / dt;
    for (const fx of this.effects) fx.age += dt;
    this.effects = this.effects.filter(f => f.age < f.life);
    if (this.phase === 'rescue') {
      this.time += dt; this.updateDefeat(dt); return;
    }
    if (this.phase === 'breach') {
      this.time += dt; this.moveLift(dt); this.breachRemaining = Math.max(0, this.breachRemaining - dt);
      if (!this.breachRemaining) this.lose('Lift reached the danger stop'); return;
    }
    if (this.phase === 'serve') {
      const b = this.balls[0]; b.px = b.x; b.py = b.y; b.x = p.x; b.y = p.y - 8;
      if (!this.backHold) { this.serveTime += dt; if (this.serveTime >= (this.active ? 3 : 8)) this.launch(-Math.PI / 2 + .15); } // after a Continue the serve waits for the player
    }
    if (!this.active) return;
    this.time += dt; this.moveLift(dt);
    const credit = Math.min(this.chargeBank, dt, (100 - this.charge) * this.rules.coreHits / 100);
    this.chargeBank -= credit; this.charge = Math.min(100, this.charge + credit / this.rules.coreHits * 100);
    if (this.charge > 100 - 1e-7) { this.charge = 100; this.chargeBank = 0; }
    if (this.guard) { this.guard.age += dt; this.guard.remaining -= dt; if (this.guard.remaining <= 0) this.guard = null; }
    if (this.ward && (this.ward.remaining -= dt) <= 0) this.ward = null;
    for (const r of this.ramps) {
      r.previousAngle = r.angle; r.angle += clamp(r.targetAngle - r.angle, -.85 * dt, .85 * dt); r.omega = (r.angle - r.previousAngle) / dt;
      Object.assign(r, rampPose(r));
    }
    this.updateVillain(); this.updateBody(); this.clearKorr(); this.pendingDocks = [];
    for (const b of this.bells) { this.moveBell(b, dt); if (this.phase === 'rescue') return; }
    if (this.phase === 'rescue') return;
    for (const b of this.balls) if (!b.caught && !b.dead) this.moveBall(b, dt);
    if (this.phase === 'rescue') return;
    for (const b of this.pendingDocks) if (!b.dead && b.hp > 0 && b.docked) {
      b.dead = true;
      if (!b.teaching) { this.lumi.steps++; this.lumi.targetY = this.lumi.baseY + this.lumi.steps * 12; this.lumi.worried = this.rules.mistakes - this.lumi.steps <= 2; }
      this.effect(this.dock.x + this.dock.w / 2, this.dock.y, b.teaching ? 'safe-catch' : 'ratchet', .6);
    }
    this.bells = this.bells.filter(b => !b.dead);
    if (this.lumi.steps >= this.rules.mistakes) {
      this.phase = 'breach'; this.breachRemaining = Math.abs(this.lumi.targetY - this.lumi.y) / 30;
      this.bells = []; this.guard = null; this.ward = null; this.villain.stage = 'disabled'; return;
    }
    this.balls = this.balls.filter(b => !b.dead);
    if (!this.balls.length) { this.lives--; p.streak = 0; if (this.lives <= 0) this.lose('No balls remaining'); else this.makeServe(); }
  }
  updateVillain() {
    const v = this.villain; v.stageTime = Math.max(0, this.time - (v.stageAt || 0));
    if (v.hp <= 0) return;
    if (v.stage === 'stagger' || v.stage === 'recover' || v.stage === 'release') {
      if (this.time < v.until) return;
      if (v.stage === 'release') { v.stage = 'recover'; v.stageAt = this.time; v.until = this.time + .85; return; }
      v.stage = 'idle'; v.stageAt = this.time;
    }
    if (v.stage === 'windup') {
      if (this.time < v.until || !this.bellSpawnClear()) return; // the bell waits until no ball sits in its cradle
      this.releaseBell(this.nextTeaching); v.stage = 'release'; v.stageAt = this.time; v.until = this.time + .45;
      this.nextWarning = this.nextTeaching ? Math.max(10.7, this.time + 4) : this.time + this.rules.interval - 1.3;
      this.teachingDone = true; return;
    }
    if (this.time >= this.nextWarning && this.bells.filter(b => !b.dead).length < this.rules.bellCap) {
      this.nextTeaching = !this.teachingDone; v.stage = 'windup'; v.stageAt = this.time; v.until = this.time + 1.3;
      if (!this.nextTeaching) v.until = Math.max(v.until, 12);
      this.effect(this.bellSource.x, this.bellSource.y, 'bell-warning', v.until - this.time);
    }
  }
  updateBody() {
    const v = this.villain, pose = this.korrBodies[v.stage] || this.korrBodies.idle;
    if (v.hp <= 0) { v.body = []; return; }
    v.body = this.fixedKorrBody || pose.map(([x, y, r]) => ({ type: 'circle', x: v.foot.x + x, y: v.foot.y + y, r }));
  }
  updateDefeat(dt) {
    const v = this.villain, d = v.defeat;
    d.age = Math.min(RESCUE_DURATION, d.age + dt); v.stageTime = d.age;
    const falling = (d.age - BELLFORGE_ENDING.stagger) / BELLFORGE_ENDING.slump;
    d.stage = d.age < BELLFORGE_ENDING.stagger ? 'stagger' : falling < 1 ? 'slump' : 'dazed';
    d.progress = clamp(d.stage === 'stagger' ? d.age / BELLFORGE_ENDING.stagger : d.stage === 'slump' ? falling : (d.age - BELLFORGE_ENDING.stagger - BELLFORGE_ENDING.slump) / BELLFORGE_ENDING.settle, 0, 1);
    const recoil = smooth(d.age / BELLFORGE_ENDING.stagger), slump = smooth(falling);
    // The raster settles around its actual supporting foot; no hovering or live collider moves.
    d.angle = -.07 * recoil + .15 * slump; d.scaleX = 1 + .04 * slump; d.scaleY = 1 - .18 * slump;
    d.daze = smooth((d.age - BELLFORGE_ENDING.stagger - BELLFORGE_ENDING.slump) / .2);
    this.rescueDelayRemaining = Math.max(0, RESCUE_DELAY - d.age);
    this.rescueRemaining = Math.max(0, RESCUE_DURATION - d.age);
    this.lumi.escape = clamp((d.age - RESCUE_DELAY) / BELLFORGE_ENDING.escape, 0, 1);
    if (!this.rescueRemaining) this.state = 'won';
  }
  // Korr's keyposes are discrete artwork, so a pose swap can land on a ball: push it clear before it moves.
  clearKorr() {
    const v = this.villain; if (v.hp <= 0 || !v.body.length) return;
    for (const b of this.balls) if (!b.caught && !b.dead && this.phase === 'play') {
      // never push it into a live bell (one can be released in the very step the pose swaps)
      const c = ejectBall(b, v.body, { ok: (x, y) => x >= b.r && x <= this.width - b.r && y >= 12 + b.r && this.bells.every(q => q.dead || Math.hypot(x - q.x, y - q.y) > b.r + q.r) });
      if (c?.reflected && !b.contacts.has('korr')) { b.contacts.add('korr'); this.hitVillain(1, false); } // moving into him: a real contact
    }
  }
  bellSpawnClear() { return this.balls.every(b => b.caught || b.dead || Math.hypot(b.x - this.bellSource.x, b.y - this.bellSource.y) > b.r + BELL_R + 2); }
  moveLift(dt) { this.lumi.y += clamp(this.lumi.targetY - this.lumi.y, -30 * dt, 30 * dt); }
  releaseBell(teaching = false) {
    if (this.state !== 'play' || this.villain.hp <= 0 || ['rescue', 'breach'].includes(this.phase)) return false;
    if (this.bells.filter(b => !b.dead).length >= this.rules.bellCap) return false;
    const b = { id: ++this.serial, x: this.bellSource.x, y: this.bellSource.y, px: this.bellSource.x, py: this.bellSource.y,
      vx: 54, vy: 0, r: BELL_R, hp: 2, angle: 0, spin: 0, returning: false, teaching, dead: false, contacts: new Set(), docked: false };
    this.bells.push(b); this.lastRelease = this.time; this.effect(b.x, b.y, 'bell-release', .3); return b;
  }
  staticTargets() {
    return this.bricks.filter(b => b.hp > 0).map(b => ({ id: b.id, kind: 'brick', item: b, type: 'rect', x: b.x, y: b.y, w: b.w, h: b.h }))
      .concat(this.villain.hp > 0 ? [{ id: 'korr', kind: 'villain', shapes: this.villain.body }] : []);
  }
  moveBall(b, dt) {
    b.px = b.x; b.py = b.y;
    const staticTargets = this.staticTargets();
    for (const id of b.contacts) {
      if (typeof id === 'string' && id.startsWith('bell-')) {
        const bell = this.bells.find(v => `bell-${v.id}` === id);
        if (!bell || bell.dead || Math.hypot(b.x - bell.px, b.y - bell.py) > b.r + bell.r + .1) b.contacts.delete(id);
        continue;
      }
      const target = staticTargets.find(t => t.id === id);
      if (!target || !overlapsTarget({ ...b, r: b.r + .1 }, target)) b.contacts.delete(id);
    }
    tickRam(this, b, dt);
    let left = dt;
    for (let pass = 0; pass < 8 && left > 1e-8 && !b.dead; pass++) {
      const from = { x: b.x, y: b.y }, to = { x: b.x + b.vx * left, y: b.y + b.vy * left }, hits = [];
      const add = (hit, kind, item) => { if (hit) hits.push({ ...hit, kind, item }); };
      if (b.vx < 0 && to.x < b.r) add({ t: (b.r - b.x) / (to.x - b.x), nx: 1, ny: 0 }, 'wall');
      if (b.vx > 0 && to.x > this.width - b.r) add({ t: (this.width - b.r - b.x) / (to.x - b.x), nx: -1, ny: 0 }, 'wall');
      if (b.vy < 0 && to.y < b.r + 12) add({ t: (b.r + 12 - b.y) / (to.y - b.y), nx: 0, ny: 1 }, 'wall');
      for (const t of staticTargets) if (t.item?.hp !== 0) add(sweepTarget(from, to, b.r, t), t.kind, t);
      const elapsed = 1 - left / dt;
      for (const r of this.ramps) add(sweepMovingSegment(from, to, b.r, rampSlice(r, elapsed), left), 'ramp', r);
      for (const bell of this.bells) if (!bell.dead && bell.hp > 0) add(circleSweep(from, to, b.r, lerpPoint({ x: bell.px, y: bell.py }, bell, elapsed), bell, bell.r), 'bell', bell);
      if (this.ward && b.vy > 0 && to.y > this.ward.y - b.r) add({ t: Math.max(0, (this.ward.y - b.r - b.y) / (to.y - b.y)), nx: 0, ny: -1 }, 'ward');
      if (b.vy > 0 && b.y <= this.paddle.y + b.r) {
        const p = this.paddle; add(sweepTarget(from, to, b.r, { type: 'rect', x: p.px - p.w / 2, y: p.y, w: p.w, h: p.h, vx: p.vx }, elapsed * dt, left), 'paddle', p);
      }
      hits.sort((a, q) => a.t - q.t); const hit = hits[0];
      if (!hit) { b.x = to.x; b.y = to.y; break; }
      b.x += (to.x - from.x) * hit.t; b.y += (to.y - from.y) * hit.t;
      // A ram ploughs through ordinary bricks (not the ramp pins): they break and the flight continues unchanged.
      if (hit.kind === 'brick' && ramThrough(this, b, hit.item.item)) { left *= 1 - hit.t; continue; }
      b.x += hit.nx * ((hit.depth || 0) + .015); b.y += hit.ny * ((hit.depth || 0) + .015);
      if (hit.kind === 'paddle') paddleBounce(this, b);
      else {
        const speed = Math.hypot(b.vx, b.vy); reflect(b, hit);
        const next = Math.hypot(b.vx, b.vy); if (next > 0) { b.vx *= speed / next; b.vy *= speed / next; }
        if (hit.kind === 'brick' && !b.contacts.has(hit.item.id)) { b.contacts.add(hit.item.id); this.hitBrick(hit.item.item, b); }
        if (hit.kind === 'villain' && !b.contacts.has('korr')) { b.contacts.add('korr'); this.hitVillain(b.ram > 0 ? RAM.damage : 1, false); }
        if (hit.kind === 'bell') {
          const bell = hit.item, key = `bell-${bell.id}`;
          if (!b.contacts.has(key)) {
            const fraction = elapsed + hit.t * left / dt;
            const bellAtContact = lerpPoint({ x: bell.px, y: bell.py }, bell, fraction);
            b.contacts.add(key); bell.hp--; const impulse = clamp(speed * .7, 150, 290);
            bell.vx -= hit.nx * impulse; bell.vy -= hit.ny * impulse; bell.returning = true;
            this.effect(bell.x, bell.y, 'bell-hit', .2);
            if (bell.hp <= 0) { bell.dead = true; this.effect(bell.x, bell.y, 'bell-break', .6); }
            else if (bell.docked && fraction <= bell.dockAt + 1e-7) {
              // A real counter before arrival supersedes the old predicted dock.
              bell.docked = false; bell.x = bellAtContact.x; bell.y = bellAtContact.y;
              this.moveBell(bell, dt * (1 - fraction), fraction, dt, true);
            }
          }
        }
      }
      if (this.phase === 'rescue') return;
      left *= 1 - hit.t; if (hit.t < 1e-6) left = Math.max(0, left - 1e-5);
    }
    const speed = Math.hypot(b.vx, b.vy);
    if (speed && Math.abs(b.vy) < speed * .22) { b.vy = Math.sign(b.vy || 1) * speed * .22; b.vx = Math.sign(b.vx || 1) * Math.sqrt(speed * speed - b.vy * b.vy); }
    if (b.y - b.r > this.height) b.dead = true;
  }
  moveBell(b, dt, startFraction = 0, frameDt = dt, continuing = false) {
    if (b.dead) return;
    const motionFrom = { x: b.x, y: b.y };
    if (!continuing) { b.px = b.x; b.py = b.y; b.vy += 220 * dt; }
    const speed = Math.hypot(b.vx, b.vy); if (speed > 360) { b.vx *= 360 / speed; b.vy *= 360 / speed; }
    let left = dt;
    for (let pass = 0; pass < 6 && left > 1e-8; pass++) {
      const from = { x: b.x, y: b.y }, to = { x: b.x + b.vx * left, y: b.y + b.vy * left }, hits = [];
      for (const r of this.ramps) {
        const c = sweepMovingSegment(from, to, b.r, rampSlice(r, startFraction + (dt - left) / frameDt, startFraction + dt / frameDt), left);
        if (c) hits.push({ ...c, kind: 'ramp', item: r });
      }
      if (this.guard && !this.guard.used && this.guard.age >= .12) {
        const a = this.guard.a, q = this.guard.b, angle = Math.atan2(q.y - a.y, q.x - a.x);
        const c = sweepMovingSegment(from, to, b.r, { pivot: a, length: Math.hypot(q.x - a.x, q.y - a.y), previousAngle: angle, angle, thickness: 8 }, dt);
        if (c && c.nx < -.2 && c.ny < -.2) hits.push({ ...c, kind: 'guard' });
      }
      hits.sort((a, c) => a.t - c.t); const hit = hits[0];
      if (!hit) { b.x = to.x; b.y = to.y; break; }
      b.x += (to.x - from.x) * hit.t; b.y += (to.y - from.y) * hit.t;
      b.x += hit.nx * ((hit.depth || 0) + .02); b.y += hit.ny * ((hit.depth || 0) + .02);
      reflect(b, hit, hit.kind === 'guard' ? .9 : .06);
      if (hit.kind === 'ramp') b.rampId = hit.item.id;
      if (hit.kind === 'guard') {
        b.vx += hit.nx * 180; b.vy += hit.ny * 180; b.returning = true;
        const reflectedSpeed = Math.hypot(b.vx, b.vy); if (reflectedSpeed > 360) { b.vx *= 360 / reflectedSpeed; b.vy *= 360 / reflectedSpeed; }
        this.guard.used = true; this.guard.remaining = .35; this.effect(b.x, b.y, 'echo-reflect', .35);
      }
      left *= 1 - hit.t; if (hit.t < 1e-6) left = Math.max(0, left - 1e-5);
    }
    if (b.x < b.r) { b.x = b.r; b.vx = Math.abs(b.vx) * .55; }
    if (b.x > this.width - b.r) { b.x = this.width - b.r; b.vx = -Math.abs(b.vx) * .55; }
    if (!continuing) { b.spin += (b.vx / b.r - b.spin) * Math.min(1, dt * 8); b.angle += b.spin * dt; }
    if (b.returning && sweepTarget(motionFrom, b, b.r, { shapes: this.villain.body })) {
      b.dead = true; this.hitVillain(4, true); this.effect(b.x, b.y, 'bell-shoulder', .6); return;
    }
    const arrival = !b.docked && sweepTarget(motionFrom, b, b.r, { type: 'rect', ...this.dock });
    if (arrival) { b.docked = true; b.dockAt = startFraction + arrival.t * dt / frameDt; this.pendingDocks.push(b); }
    if (b.y > this.catchY && !b.docked) { b.dead = true; this.effect(b.x, this.catchY, 'safe-catch', .4); }
  }
  hitBrick(brick, ball) {
    if (brick.hp <= 0) return;
    brick.hp = brick.sp === 'armour' && armourOutright(ball) ? 0 : brick.hp - 1; this.score += 10;
    if (this.balls.includes(ball) && !ball.dead && !(ball.titan > 0) && !(ball.ram > 0) && !ball.fire && ball.source !== 'arrow')
      this.chargeBank = Math.min((100 - this.charge) * this.rules.coreHits / 100, this.chargeBank + 1);
    this.effect(brick.x + brick.w / 2, brick.y + brick.h / 2, brick.hp ? 'brick-hit' : 'brick-break', brick.hp ? .35 : .7,
      { colour: brick.sp ? 'pin' : brick.colour || 'pin', w: brick.w, h: brick.h, vx: (ball?.vx || 0) * .12, vy: (ball?.vy || 0) * .08 });
    if (brick.hp === 0 && brick.sp) brickSpecial(this, brick, ball, MINE_R, blastable);
    if (brick.hp === 0 && brick.rampId) { const r = this.ramps.find(r => r.id === brick.rampId); r.targetAngle = -.32; }
  }
  hitVillain(damage, stagger) {
    if (this.villain.hp <= 0 || this.state !== 'play') return;
    const dealt = Math.min(this.villain.hp, damage);
    this.villain.hp -= dealt; this.score += dealt * 25;
    if (!this.villain.hp) {
      this.phase = 'rescue'; this.rescueRemaining = RESCUE_DURATION; this.rescueDelayRemaining = RESCUE_DELAY;
      this.bells = []; this.pendingDocks = []; this.guard = null; this.ward = null; this.nextWarning = Infinity; this.nextTeaching = false;
      Object.assign(this.villain, { stage: 'defeated', stageAt: this.time, stageTime: 0, until: this.time + RESCUE_DURATION, body: [],
        defeat: { age: 0, stage: 'stagger', progress: 0, frame: 3, offsetX: 0, offsetY: 0, angle: 0, scaleX: 1, scaleY: 1, daze: 0 } });
      this.effects = this.effects.filter(e => !['bell-warning', 'bell-release', 'echo-deploy'].includes(e.kind));
      for (const b of this.balls) { b.vx = 0; b.vy = 0; b.caught = true; b.ram = 0; b.r = BALL_R; }
      this.effect(this.villain.x, this.villain.y, 'winch-stop', 1.2); return;
    }
    if (stagger) { this.villain.stage = 'stagger'; this.villain.stageAt = this.time; this.villain.until = this.time + 1.5; this.nextWarning = Math.max(this.nextWarning, this.time + 1.5); }
    this.effect(this.villain.x, this.villain.y, stagger ? 'stagger' : 'korr-hit', stagger ? 1.5 : .2);
  }
  lose(reason) { if (this.phase === 'rescue' || this.state !== 'play') return; this.state = 'lost'; this.reason = reason; }
  continue() {
    if (this.continued || this.state !== 'lost' || this.villain.hp <= 0) return false;
    this.continued = true;
    this.state = 'play'; this.reason = ''; this.lives = Math.max(2, this.lives); this.lumi.steps = Math.max(0, this.lumi.steps - 2);
    this.lumi.y = this.lumi.targetY = this.lumi.baseY + this.lumi.steps * 12; this.lumi.worried = this.rules.mistakes - this.lumi.steps <= 2;
    this.bells = []; this.guard = null; this.nextWarning = this.time + 3; this.villain.stage = 'idle'; this.makeServe();
    this.ward = { y: this.paddle.y + 24, remaining: BACK_WARD }; this.active = false; this.backHold = true; return true;
  }
  nearMiss() { return { line: hpLeft('KORR', this.villain.hp), progress: 1 - this.villain.hp / this.villain.maxHP }; } // continue panel copy
  effect(x, y, kind, life, details = {}) {
    const fx = { x, y, kind, age: 0, life, ...details }; this.effects.push(fx); if (this.effects.length > 80) this.effects.shift(); return fx;
  }
}
