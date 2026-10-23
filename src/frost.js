// A separate siege encounter. Brum remains an ally; the Frost Warden is a hostile Yeti.
import { Arena } from './arena.js';
import { ART } from './vault-art.js';
import { difficulty } from './difficulty.js';
import { sweepTarget } from './carrier-physics.js';
import { ejectBall, overlapsAny } from './clearance.js';
import { drawThemed, drawThemedBar, themedChip, themedBreak } from './themed-bricks.js';
import { brick, cached, loadImg, ready, text, rrect, SPR, drawKitCastFlight, drawKitBrickArmour, drawShard, shardPalette, glazedBar } from './gfx.js';
import { sfx } from './audio.js';
import { RAM } from './fantasy/ram.js';
import { hpLeft } from './near-miss.js';
import { R3 } from './round3-art.js';
import { r3, r3ok } from './fantasy/r3.js';

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
export const FROST_MODES = {
  easy: { hp: 40, postHP: 5, first: 7, windup: 1.8, strike: .48, recover: 3.5, stun: 2.1, advance: 1.35, interrupt: 1, charge: 18 },
  medium: { hp: 52, postHP: 4, first: 5.5, windup: 1.5, strike: .42, recover: 2.8, stun: 1.6, advance: 1.15, interrupt: 2, charge: 22 },
  hard: { hp: 66, postHP: 4, first: 4.5, windup: 1.25, strike: .36, recover: 2.3, stun: 1.25, advance: 1, interrupt: 2, charge: 26 },
};
const COLORS = ['#4f9dff', '#8f5cf0', '#22c4b0', '#ff6f91', '#4f9dff', '#b785ef'];
// Themed bricks (src/themed-bricks.js): rime-frosted ice glass, frozen blue and frost violet by row; steel is frost-rimed iron.
const FROST_ROWS = ['ice', 'blue', 'violet', 'ice', 'blue', 'violet'];
const frostMat = b => FROST_ROWS[Math.floor((b.y - 266) / 26)] || 'ice';
const PAYLOADS = new Map([[2, 'wide'], [8, 'shield'], [14, 'split'], [21, 'slow'], [27, 'fire'], [33, 'laser']]);
// Round-3 specials (assets/round3/bricks, frost row): rime-armoured 2-hit bricks guard the top rows, and two frost mines
// burst the bricks around them. Payload bricks wear the frost chest.
const ARMOUR = new Set([0, 3, 5, 7, 10]), MINES = new Set([16, 25]), MINE_R = 46;
const PLATE = ART?.plate ? loadImg(ART.plate) : null;
// Fallback before the rampart plate decodes: the keep hall graded cold. Collision sizes and positions are unchanged.
const KEEP = ART?.keepBackdrop ? loadImg(ART.keepBackdrop) : null;
const PRINCESS = ART?.princess ? { ...ART.princess, img: loadImg(ART.princess.url) } : null;
// Premium pass (art/premium/premium.py): the night rampart plate (walk, Lumi's ledge and alcove baked in at the collider
// coordinates below) and three rendered ward-post states. Rendered gems from the shared fx kit mark post health and payloads.
const PREM = ART?.premium?.frost || {};
const RAMPART = PREM.backdrop ? { ...PREM.backdrop, img: loadImg(PREM.backdrop.url) } : null;
const POSTS = [0, 1, 2].map(k => PREM['post_' + k] && { ...PREM['post_' + k], img: loadImg(PREM['post_' + k].url) });
const GEMS = Object.fromEntries(['pip_blue', 'pip_empty', 'pip_gold'].filter(k => ART?.fxKit?.[k]).map(k => [k, { ...ART.fxKit[k], img: loadImg(ART.fxKit[k].url) }]));
const rampart = () => ready(RAMPART);
function gem(g, key, x, y, scale = 1) { const p = GEMS[key]; if (!ready(p)) return; const w = p.uw * scale, h = p.uh * scale; g.drawImage(p.img, x - w / 2, y - h / 2, w, h); }
function softGlow(g, x, y, rx, ry, colour, a) {
  if (a <= 0) return; g.save(); g.globalAlpha *= Math.min(1, a); g.translate(x, y); g.scale(1, ry / rx);
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx); gr.addColorStop(0, colour); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(-rx, -rx, rx * 2, rx * 2); g.restore();
}

// Round-3 Warden (the M365 sheet, assets/round3/warden): idle breathing, a frost-gathering crouch as the tell, a
// shoulder-first dash that ends in a wall smash against the post, dazed with stars when Kit's ward holds. The collision
// comes from the frames themselves (art/round3/fit_shapes.py): circles in the body, the leading fist or shoulder as the
// punch. WK: world units per source pixel before artScale. ?warden=v1 brings back the old sheet.
const WK = .3;
const WARDEN_V1 = typeof location !== 'undefined' && /[?&]warden=v1\b/.test(location.search);
const R3_CLIPS = { idle: ['idle_0', 'idle_1', 'idle_2', 'idle_3'], windup: ['dash_r_crouch'], strike: ['dash_r_0', 'dash_r_2', 'smash_r', 'smash_r'],
  recover: ['smash_r', 'recover'], stun: ['dazed_r'], advance: ['dash_r_0', 'dash_r_1', 'dash_r_2', 'dash_r_3'], defeated: ['defeated'] };
function r3Warden() {
  const S = R3?._shapes?.warden;
  if (WARDEN_V1 || !S || !R3?.warden) return null;
  const k = v => Math.round(v * WK * 100) / 100;
  const anchors = key => ({ fist: S[key].lead.map(k), body: S[key].body.map(k), bodyShapes: S[key].circles.map(([x, y, r]) => ({ type: 'circle', x: k(x), y: k(y), r: k(r) })) });
  const clips = Object.fromEntries(Object.entries(R3_CLIPS).map(([id, keys]) => [id, { n: keys.length, keys, fps: id === 'idle' ? 5 : 10, anchors: keys.map(anchors) }]));
  // The idle body's right edge: the stance keeps it clear of the post, and the strike lunges the rest of the way.
  const idleRight = Math.max(...S.idle_0.circles.map(([x, , r]) => x + r)) * WK;
  return { r3: true, clips, idleRight };
}

export class Frost extends Arena {
  constructor(W, H, uiScale = 1, modeId = 'easy', artData = r3Warden() || ART?.frostWarden) {
    super(W, H, { uiScale, top: 78, minPaddleY: 500, paddleWidth: 100, paddleHeight: 14, ballRadius: 6, accent: '#92cce0' });
    this.difficulty = difficulty(modeId).id; this.rules = FROST_MODES[this.difficulty];
    this.name = 'Frost Warden'; this.subtitle = 'Break the siege. Protect Lumi.';
    this.coreMode = 'ward'; this.kitPowers = true; this.coreHits = this.rules.charge;
    this.art = artData ? { ...artData, img: artData.img || (artData.url ? loadImg(artData.url) : null) } : null;
    this.artScale = artData?.scale || 1.2;
    this.clock = 0; this.started = false; this.phase = 'siege'; this.stage = 'idle'; this.stageAt = 0;
    this.warden = { hp: this.rules.hp, maxHP: this.rules.hp };
    this.defences = [148, 192, 236].map((x, i) => ({ id: 'defence' + i, x, y: 146, w: 18, h: 68, hp: this.rules.postHP, maxHP: this.rules.postHP }));
    this.activeDefence = 0; this.windHits = 0; this.strikeResolved = false; this.punchCount = 0; this.blockedPunches = 0;
    this.ward = null; this.wardTarget = null; this.kitWardResult = null;
    this.bricks = Array.from({ length: 36 }, (_, i) => ({ id: 'brick' + i, x: 54 + i % 6 * 42, y: 266 + Math.floor(i / 6) * 26, w: 36, h: 18, hp: ARMOUR.has(i) ? 2 : 1, maxHP: ARMOUR.has(i) ? 2 : 1, type: MINES.has(i) ? 'mine' : undefined, color: COLORS[Math.floor(i / 6)], payload: PAYLOADS.get(i) }));
    this.blasts = [];
    this.fragments = []; this.records = []; this.nextStrike = this.rules.first; this.enemyGraceUntil = 0;
    this.walkFrom = this.stance(0); this.walkTo = this.walkFrom; this.lastFist = this.pose().fist;
  }
  previewRect() { return { x: 20, y: 138, w: 320, h: 100 }; }
  get danger() { return this.defences ? 1 - this.defences.reduce((sum, d) => sum + d.hp, 0) / (this.rules.postHP * 3) : 0; }
  coachLive() { return this.phase === 'siege'; }
  serve() { super.serve(); this.autoServeAt = (this.clock || 0) + (this.started ? 3 : 8); }
  release() {
    if (this.phase && this.phase !== 'siege') return;
    const serving = !!this.aim?.serve;
    super.release();
    if (serving && !this.aim) {
      if (!this.started) { this.started = true; this.nextStrike = this.clock + this.rules.first; }
      else { this.enemyGraceUntil = this.clock + 3; this.nextStrike = Math.max(this.nextStrike, this.clock + 3); }
    }
  }
  spacePowerAvailable() { return this.state === 'play' && this.phase === 'siege'; }
  chargeCore(amount = 1 / this.coreHits) {
    this.coreChargeBank = Math.min(Math.max(0, 1 - this.paddle.charge), (this.coreChargeBank || 0) + amount);
  }
  canUseKitPower() {
    return this.spacePowerAvailable() && this.paddle.charge >= 1 && ['windup', 'strike'].includes(this.stage)
      && !this.strikeResolved && this.defences[this.activeDefence]?.hp > 0 && !this.ward;
  }
  useKitPower() {
    if (!this.canUseKitPower()) return false;
    const d = this.defences[this.activeDefence];
    this.paddle.charge = 0; this.coreChargeBank = 0; this.kitCastAt = this.t; this.kitWardResult = null;
    this.wardTarget = { x: d.x + d.w / 2, y: d.y + d.h / 2, size: 38 };
    this.ward = { targetId: d.id, until: this.clock + 10 }; return true;
  }
  clipFor(stage = this.stage) {
    const a = this.art, clips = a?.clips || a?.anims || {};
    const aliases = { idle: 'Idle', windup: 'Punch', strike: 'Punch', recover: 'Punch', stun: 'hurt', advance: 'walk', defeated: 'hurt' };
    return clips[stage] || clips[aliases[stage]] || clips.Idle || clips.idle;
  }
  // Metadata carries measured projected anchors, in world units relative to the foot pivot.
  localPose(stage = this.stage, age = this.clock - this.stageAt) {
    let c = this.clipFor(stage); const a = this.art;
    let p;
    // Warning time is readable preparation, not a slowed-down punch movie.
    if (stage === 'windup') p = clamp((age - Math.max(0, this.rules.windup - .55)) / .55, 0, 1);
    else if (stage === 'strike') p = clamp(age / this.rules.strike, 0, 1);
    else if (stage === 'recover') {
      if (age < .55) p = clamp(age / .55, 0, 1);
      else { c = this.clipFor('idle'); age -= .55; }
    } else if (stage === 'stun' || stage === 'defeated') p = clamp(age / .5, 0, 1);
    const n = c?.n || c?.frames?.length || 1;
    const f = p !== undefined ? Math.min(n - 1, Math.floor(p * (n - 1))) : Math.floor(Math.max(0, age) * (c?.fps || 10)) % n;
    const globalFrame = typeof c?.frames?.[f] === 'number' ? c.frames[f] : (c?.start || 0) + f;
    const sample = c?.anchors?.[f] || a?.anchors?.[globalFrame];
    // These conservative authoring bounds are never rendered as character artwork.
    const fist = sample?.fist || { x: stage === 'strike' ? 45 : 25, y: -44, r: 10 };
    const body = sample?.body || { x: -18, y: -79, w: 38, h: 72 };
    return { c, f, globalFrame, fist: Array.isArray(fist) ? { x: fist[0], y: fist[1], r: fist[2] } : fist,
      body: Array.isArray(body) ? { x: body[0], y: body[1], w: body[2], h: body[3] } : body, bodyShapes: sample?.bodyShapes,
      otherHands: Object.entries(sample?.hands || {}).filter(([id]) => id !== a.forwardHand).map(([, hand]) => hand) };
  }
  reach() {
    const c = this.clipFor('strike'), n = c?.n || c?.frames?.length || 1;
    if (this.art?.r3) { const [x, y, r] = c.anchors[n - 1].fist; return { x, y, r }; }   // the smash frame lands on the post
    let best = null;
    for (let f = 0; f < n; f++) {
      const frame = typeof c?.frames?.[f] === 'number' ? c.frames[f] : (c?.start || 0) + f;
      const v = c?.anchors?.[f] || this.art?.anchors?.[frame];
      if (!v?.fist) continue;
      const p = Array.isArray(v.fist) ? { x: v.fist[0], y: v.fist[1], r: v.fist[2] } : v.fist;
      if (!best || p.x + p.r > best.x + best.r) best = p;
    }
    return best || { x: 45, y: -44, r: 10 };
  }
  stance(index) {
    const d = this.defences?.[Math.min(index, 2)] || { x: 148, y: 146, h: 68 }, f = this.reach(), s = this.artScale;
    return { x: d.x - (f.x + f.r) * s + 2 - this.lunge(), y: d.y + d.h / 2 - f.y * s };
  }
  // Round-3 Warden: how far the dash carries him forward, so his idle body stands clear of the post he smashes.
  lunge() { const a = this.art; return a?.r3 ? Math.max(0, (a.idleRight - this.reach().x - this.reach().r) * this.artScale + 6) : 0; }
  pose(stage = this.stage, age = this.clock - this.stageAt) {
    const q = this.localPose(stage, age), s = this.artScale;
    let root = this.stance(this.activeDefence);
    if (stage === 'advance') { const t = clamp(age / this.rules.advance, 0, 1), u = t * t * (3 - 2 * t); root = { x: this.walkFrom.x + (this.walkTo.x - this.walkFrom.x) * u, y: this.walkFrom.y + (this.walkTo.y - this.walkFrom.y) * u }; }
    else if (stage === 'strike') root = { x: root.x + this.lunge() * clamp(age / this.rules.strike * 1.5, 0, 1), y: root.y };   // in at the smash frame
    else if (stage === 'recover' && age < .55) root = { x: root.x + this.lunge() * (1 - clamp(age / .55, 0, 1)), y: root.y };
    return { ...q, x: root.x, y: root.y, fist: { x: root.x + q.fist.x * s, y: root.y + q.fist.y * s, r: q.fist.r * s },
      body: { x: root.x + q.body.x * s, y: root.y + q.body.y * s, w: q.body.w * s, h: q.body.h * s },
      bodyShapes: q.bodyShapes?.map(v => v.type === 'circle' ? { type: 'circle', x: root.x + v.x * s, y: root.y + v.y * s, r: v.r * s } : { type: 'rect', x: root.x + v.x * s, y: root.y + v.y * s, w: v.w * s, h: v.h * s }),
      otherHands: q.otherHands.map(v => ({ x: root.x + v.x * s, y: root.y + v.y * s, r: v.r * s })) };
  }
  targets(rate = 1) {
    if (this.phase !== 'siege') return [];
    const p = this.pose(), ahead = this.pose(this.stage, this.clock - this.stageAt + 1 / 120), vx = (ahead.fist.x - p.fist.x) * 120 * rate, vy = (ahead.fist.y - p.fist.y) * 120 * rate;
    return [
      ...this.bricks.filter(b => b.hp > 0).map(b => ({ ...b, type: 'rect', pierceable: true })),
      ...this.defences.filter(d => d.hp > 0).map(d => ({ id: d.id, type: 'rect', x: d.x, y: d.y, w: d.w, h: d.h, pierceable: false })),
      { id: 'chamber-foot', type: 'rect', x: 268, y: 202, w: 60, h: 12, pierceable: false },
      { id: 'warden', hp: this.warden.hp, type: 'rect', ...p.body, ...(p.bodyShapes?.length ? { shapes: p.bodyShapes } : {}), vx: (ahead.body.x - p.body.x) * 120 * rate, vy: (ahead.body.y - p.body.y) * 120 * rate, pierceable: true },
      { id: 'warden', hp: this.warden.hp, type: 'circle', ...p.fist, vx, vy, pierceable: true },
      ...p.otherHands.map((h, i) => ({ id: 'warden', hp: this.warden.hp, type: 'circle', ...h, vx: ((ahead.otherHands[i]?.x ?? h.x) - h.x) * 120 * rate, vy: ((ahead.otherHands[i]?.y ?? h.y) - h.y) * 120 * rate, pierceable: true })),
    ];
  }
  // Sweet-Spot Ram: the siege wall bricks plough; the ice posts, the chamber foot and the Warden bounce it (the Warden takes RAM.damage).
  ramPierce(t) { return !!t && this.bricks.some(b => b.id === t.id); }
  world() {
    const w = super.world(), rate = 1 / (this.timeScale * (this.slowT > 0 ? .68 : 1));
    w.targets = this.targets(rate); w.onTarget = (id, ball) => this.hitTarget(id, ball); return w;
  }
  hitTarget(id, b = {}) {
    if (!this.spacePowerAvailable()) return true;
    const br = this.bricks.find(v => v.id === id);
    if (br) {
      if (br.hp <= 0) return false;
      br.hp = b.fire || b.titan > 0 || b.ram > 0 ? 0 : br.hp - 1;
      if (br.hp > 0) { this.addScore(30, br.x + br.w / 2, br.y); sfx.tough(); return true; }   // the rime cracks
      this.breakBrick(br, b);
      if (br.type === 'mine') this.mineBlast(br, b);
      return false;
    }
    if (id !== 'warden') return true;
    if (this.warden.hp <= 0) return false;
    this.warden.hp = Math.max(0, this.warden.hp - (b.titan > 0 ? 3 : b.ram > 0 ? RAM.damage : 1));
    this.addScore(75, b.x, b.y); this.fx.ring(b.x, b.y, '#d4f1ff', 13); sfx.tough(); this.hitFlashUntil = this.clock + .22;
    if (!b.shot && !b.pulse && !(b.titan > 0)) {
      this.chargeCore();
      if (this.stage === 'windup' && ++this.windHits >= this.rules.interrupt) {
        this.setStage('stun'); this.fx.pop(this.pose().x, 116, 'STAGGERED', '#d8e8ff', 12);
      }
    }
    if (!this.warden.hp) this.finishSiege();
    return this.warden.hp > 0;
  }
  breakBrick(br, b) {
    br.hp = 0; this.brokeBrick(b); this.addScore(90, br.x + br.w / 2, br.y);
    this.burst(br, br.color, undefined, frostMat(br)); if (br.payload) this.dropPower(br.x + br.w / 2, br.y, br.payload);
  }
  // A frost mine shatters every brick whose centre is within MINE_R of it (armour included), chaining into other mines.
  mineBlast(m, b) {
    const cx = m.x + m.w / 2, cy = m.y + m.h / 2;
    this.blasts.push({ x: cx, y: cy, at: this.clock }); this.bump(.3, .05); sfx.boom();
    for (const o of this.bricks) if (o.hp > 0 && Math.hypot(o.x + o.w / 2 - cx, o.y + o.h / 2 - cy) <= MINE_R) { this.breakBrick(o, b); if (o.type === 'mine') this.mineBlast(o, b); }
  }
  shotHit(shot, previousY = shot.y, dt = 0) {
    if (this.phase !== 'siege') return false;
    let best;
    const rate = 1 / this.timeScale;
    for (const target of this.targets(rate)) {
      const hit = sweepTarget({ x: shot.x, y: previousY }, shot, shot.r || 2, target, 0, dt);
      if (hit && (!best || hit.t < best.hit.t)) best = { target, hit };
    }
    if (!best) return false;
    this.hitTarget(best.target.id, { ...shot, x: best.hit.x, y: best.hit.y, shot: true }); return true;
  }
  // Stage changes swap the Warden's measured keypose at once (e.g. a stagger mid-windup), which can land the fist or
  // body on a ball between steps: push it clear along the contact normal before the ball moves. No hit is scored.
  clearWarden() {
    if (this.phase !== 'siege' || this.warden.hp <= 0) return;
    const targets = this.targets(), shapes = t => t.shapes || [t];
    const warden = targets.filter(t => t.id === 'warden').flatMap(shapes), others = targets.filter(t => t.id !== 'warden').flatMap(shapes);
    for (const b of this.balls) if (!b.dead && !b.caught && !(this.fireT > 0) && !(b.titan > 0))
      ejectBall(b, warden, { ok: (x, y) => x - b.r >= this.left && x + b.r <= this.right && y - b.r >= this.top && !overlapsAny(x, y, b.r, others) });
  }
  setStage(stage) { this.stage = stage; this.stageAt = this.clock; this.lastFist = this.pose().fist; }
  startWindup() {
    if (!this.spacePowerAvailable() || !this.defences[this.activeDefence]?.hp) return false;
    this.windHits = 0; this.strikeResolved = false; this.setStage('windup'); return true;
  }
  resolvePunch(from, to) {
    const d = this.defences[this.activeDefence];
    if (this.strikeResolved || !d?.hp || this.phase !== 'siege') return false;
    if (!sweepTarget(from, to, to.r, { ...d, type: 'rect' })) return false;
    this.strikeResolved = true; this.punchCount++;
    const warded = this.ward?.targetId === d.id && this.ward.until >= this.clock;
    this.records.push({ at: this.clock, post: d.id, warded, from: { ...from }, to: { ...to } });
    if (warded) { this.blockedPunches++; this.ward = null; this.kitWardResult = 'held'; this.kitReactionAt = this.t; this.fx.ring(d.x, d.y + d.h / 2, '#f2aec7', 32); sfx.power(); }
    else {
      d.hp--; this.bump(.34, .04); sfx.boom(); this.fx.ring(d.x + d.w / 2, d.y + d.h / 2, '#d6e8ff', 28);
      this.postShockUntil = this.clock + .8;
      if (!d.hp) {
        this.kitShockUntil = this.t + .85;
        this.burst(d, '#8bacc2', 'ice'); this.fx.shatter(d.x, d.y, d.w, d.h, '#cfe8ff', 6, .8, 'ice'); this.blasts.push({ x: d.x + d.w / 2, y: d.y + d.h * .7, at: this.clock, k: .6 });
        if (this.activeDefence === this.defences.length - 1) this.beginBreach();
      }
    }
    return true;
  }
  finishSiege() {
    if (this.phase !== 'siege') return;
    this.phase = 'rescue'; this.phaseAt = this.clock; this.setStage('defeated'); this.parkCombat(); this.kitWardResult = 'held'; this.kitReactionAt = this.t;
  }
  beginBreach() { this.phase = 'breach'; this.phaseAt = this.clock; this.parkCombat(); }
  parkCombat() {
    this.inputEpoch++; this.ptr.down = false; this.suppressedSpace = !!this.keys[' ']; this.keys = {}; this.aim = null;
    for (const b of this.balls) { b.caught = true; b.vx = b.vy = 0; }
    this.shots = []; this.ward = null; this.timeScale = 1;
  }
  update(dtReal) {
    if (this.powerMenuOpen || this.state !== 'play') return;
    this.levelUpdated = false;
    if (this.phase !== 'siege') { this.kitTime += dtReal; this.t += dtReal; this.updateLevel(dtReal, dtReal); this.fx.update(dtReal, this.drainY); return; }
    const gain = Math.min(this.coreChargeBank, dtReal / this.coreHits);
    if (this.started && gain > 0) { this.coreChargeBank -= gain; super.chargeCore(gain); }
    this.clearWarden();
    super.update(dtReal);
    if (!this.levelUpdated && this.state === 'play') this.updateLevel(dtReal, dtReal);
  }
  updateLevel(dt, dtReal = dt) {
    this.levelUpdated = true;
    if (this.state !== 'play' || this.powerMenuOpen) return;
    if (!this.started) {
      if (this.aim?.serve && (this.serveWait = (this.serveWait || 0) + dtReal) >= 8) this.release();
      return;
    }
    for (const f of this.fragments) { f.t += dtReal; f.x += f.vx * dtReal; f.vy += 200 * dtReal; f.y += f.vy * dtReal; }
    this.fragments = this.fragments.filter(f => f.brk ? f.t < .6 : f.t < .45 && f.y < this.playClipY - 12);
    this.blasts = this.blasts.filter(e => this.clock - e.at < .5);
    if (this.backHold) return; // back in action: the Warden waits for the serve
    this.clock += dtReal;
    if (this.phase === 'rescue') { if (this.clock - this.phaseAt >= 1.6) this.win(); return; }
    if (this.phase === 'breach') { if (this.clock - this.phaseAt >= .95) this.fail('Chamber breached'); return; }
    if (this.aim?.serve && this.clock >= this.autoServeAt) this.release();
    if (this.ward && this.clock > this.ward.until) { this.ward = null; this.kitWardResult = 'missed'; this.kitReactionAt = this.t; }
    const age = this.clock - this.stageAt;
    if (this.stage === 'idle') { if (this.clock >= Math.max(this.nextStrike, this.enemyGraceUntil) && !this.aim?.serve) this.startWindup(); }
    else if (this.stage === 'windup' && age >= this.rules.windup) this.setStage('strike');
    else if (this.stage === 'strike') {
      const fist = this.pose().fist; this.resolvePunch(this.lastFist, fist); this.lastFist = fist;
      if (this.phase === 'siege' && age >= this.rules.strike) this.setStage('recover');
    } else if ((this.stage === 'recover' && age >= this.rules.recover) || (this.stage === 'stun' && age >= this.rules.stun)) {
      if (!this.defences[this.activeDefence].hp) { this.walkFrom = this.stance(this.activeDefence); this.activeDefence++; this.walkTo = this.stance(this.activeDefence); this.setStage('advance'); }
      else { this.setStage('idle'); this.nextStrike = this.clock + .15; }
    } else if (this.stage === 'advance' && age >= this.rules.advance) { this.setStage('idle'); this.nextStrike = this.clock + .6; }
  }
  loseBall() {
    if (this.phase !== 'siege') return;
    super.loseBall();
    if (this.state === 'play') { this.setStage('recover'); this.enemyGraceUntil = this.clock + 4; this.strikeResolved = true; }
  }
  fail(reason) {
    super.fail(reason);
    if (this.state === 'lost') { this.ward = null; this.wardTarget = null; this.shots = []; this.ptr.down = false; }
  }
  updateShots(dt) { if (this.phase !== 'siege' || this.state !== 'play') { this.shots = []; return; } super.updateShots(dt); if (this.phase !== 'siege') this.shots = []; }
  continueRun() {
    if (this.state !== 'lost') return;
    if (!this.defences.some(d => d.hp > 0)) { const d = this.defences.at(-1); d.hp = Math.min(2, d.maxHP); this.activeDefence = 2; }
    this.phase = 'siege'; this.strikeResolved = true; this.ward = null; this.clock ||= 0;
    this.balls = []; super.continueRun(); this.setStage('recover'); this.enemyGraceUntil = this.clock + this.rules.recover + 4; this.nextStrike = this.enemyGraceUntil;
  }
  pointerDown(x, y) { if (this.phase === 'siege') super.pointerDown(x, y); }
  pointerMove(x, y) { if (this.phase === 'siege' && this.ptr.down) super.pointerMove(x, y); }
  pointerUp() { if (this.phase === 'siege' && this.ptr.down) super.pointerUp(); }
  key(k, down) { if (this.powerMenuOpen || this.phase === 'siege' || this.suppressedSpace) super.key(k, down); }
  burst(rect, color, palette = shardPalette(color), mat) {
    for (let i = 0; i < 7; i++) this.fragments.push({ x: rect.x + rect.w * (i + .5) / 7, y: rect.y + rect.h / 2, vx: (i - 3) * 16, vy: -25 - (i % 3) * 17, t: 0, color, palette, mat, variant: i, size: 3 + i % 3 });
    if (mat) this.fragments.push({ brk: true, mat, bx: rect.x + rect.w / 2, by: rect.y + rect.h / 2, w: rect.w, h: rect.h, x: 0, y: 0, vx: 0, vy: 0, t: 0 });
  }
  inspect() { return { state: this.state, phase: this.phase, stage: this.stage, clock: this.clock, hp: this.warden.hp, maxHP: this.warden.maxHP, defences: this.defences.map(d => ({ ...d })), activeDefence: this.activeDefence, windHits: this.windHits, ward: this.ward && { ...this.ward }, bodyPose: this.pose().body, fist: this.pose().fist, lives: this.lives, started: this.started, punches: this.punchCount, blocked: this.blockedPunches }; }
  background() {
    const keep = KEEP?.complete && KEEP.naturalWidth;
    if (rampart()) return cached('frost-rampart-' + this.W + '-' + this.H, this.W, this.H, g => this.paintRampart(g, 0, this.H));
    return cached('frost-bg-' + this.W + '-' + this.H + '-' + !!PLATE?.complete + '-' + !!keep, this.W, this.H, g => {
      g.fillStyle = '#101622'; g.fillRect(0, 0, this.W, this.H);
      if (keep) {
        // The keep hall, frozen: cover-fit, cold colour grade, darkened so the actors stay in front.
        const s = Math.max(this.W / KEEP.naturalWidth, this.H / KEEP.naturalHeight), w = KEEP.naturalWidth * s, h = KEEP.naturalHeight * s;
        g.drawImage(KEEP, (this.W - w) / 2, (this.H - h) / 2, w, h);
        g.globalCompositeOperation = 'color'; g.fillStyle = 'rgba(96,140,184,.6)'; g.fillRect(0, 0, this.W, this.H);
        g.globalCompositeOperation = 'multiply'; g.fillStyle = '#93a7c0'; g.fillRect(0, 0, this.W, this.H);
        g.globalCompositeOperation = 'source-over';
        const frost = g.createLinearGradient(0, 0, 0, this.H * .4); frost.addColorStop(0, 'rgba(190,225,255,.10)'); frost.addColorStop(1, 'rgba(190,225,255,0)');
        g.fillStyle = frost; g.fillRect(0, 0, this.W, this.H);
        const vg = g.createRadialGradient(this.W / 2, this.H * .42, this.H * .2, this.W / 2, this.H * .42, this.H * .75);
        vg.addColorStop(0, 'rgba(6,10,18,0)'); vg.addColorStop(1, 'rgba(6,10,18,.5)'); g.fillStyle = vg; g.fillRect(0, 0, this.W, this.H);
      } else if (PLATE?.complete && PLATE.naturalWidth) {
        // The moon-free side of the existing plate is a background, never an invisible wall.
        g.drawImage(PLATE, 288, 0, 432, 212, 0, 0, this.W, 180);
        g.globalAlpha = .28; g.drawImage(PLATE, 0, 440, PLATE.naturalWidth, 900, 0, 180, this.W, this.H - 180); g.globalAlpha = 1;
      }
      const v = g.createLinearGradient(0, 70, 0, this.H); v.addColorStop(0, 'rgba(14,24,38,.1)'); v.addColorStop(1, '#0a101b'); g.fillStyle = v; g.fillRect(0, 0, this.W, this.H);
    });
  }
  // The rampart plate is registered to level y = 0 (walk 6..264 at y 214-238, ledge 266,202 64x14, alcove above it): never
  // rescale it. Above it the night sky continues; below its frozen floor a mirrored band fades to the floor colour.
  paintRampart(g, top, height) {
    const img = RAMPART.img, [, , sw, sh] = RAMPART.screenRect, k = img.naturalWidth / sw;
    g.fillStyle = '#0b111b'; g.fillRect(0, 0, this.W, height + Math.max(0, top));
    if (top > 0) { const sky = g.createLinearGradient(0, 0, 0, top + 1); sky.addColorStop(0, '#070b14'); sky.addColorStop(1, '#0e1526'); g.fillStyle = sky; g.fillRect(0, 0, this.W, top + 1); }
    g.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, top, sw, sh);
    const end = top + sh;
    if (end < height) {
      const band = Math.min(height - end, 60);
      g.save(); g.translate(0, end * 2); g.scale(1, -1); g.drawImage(img, 0, (sh - band) * k, img.naturalWidth, band * k, 0, end - band, sw, band); g.restore();
      const fade = g.createLinearGradient(0, end, 0, end + band); fade.addColorStop(0, 'rgba(11,17,27,.35)'); fade.addColorStop(1, '#0b111b');
      g.fillStyle = fade; g.fillRect(0, end, this.W, height - end);
    }
  }
  drawFullBleedBackground(g, top, height) {
    if (rampart()) { this.bleed = { top, height }; this.paintRampart(g, top, height); return; }
    g.fillStyle = '#101622'; g.fillRect(0, 0, this.W, height);
  }
  drawWarden(g) {
    const a = this.art, p = this.pose();
    if (a?.r3) {
      // A hit flinches him for a beat; the collision keeps the stage's frame.
      const key = this.hitFlashUntil > this.clock && ['idle', 'advance'].includes(this.stage) ? 'flinch' : p.c?.keys?.[p.f], img = r3('warden', key);
      if (!r3ok(img)) return;
      const k = WK * this.artScale, w = img.fw * k, h = img.fh * k;
      g.save(); if (this.phase === 'rescue') g.globalAlpha *= Math.max(.25, 1 - (this.clock - this.phaseAt) * .3);
      g.drawImage(img, p.x - w / 2, p.y - h, w, h); g.restore(); return;
    }
    if (!a || !ready(a) || !p.c) return;
    const cell = Array.isArray(a.cell) ? a.cell : [a.cell, a.cell], unit = a.unit || [144, 128], u = Array.isArray(unit) ? unit : [unit, unit];
    const pivot = a.pivot || [u[0] / 2, a.feet || u[1] - 12], pw = pivot[0] <= 1 ? pivot[0] * u[0] : pivot[0], ph = pivot[1] <= 1 ? pivot[1] * u[1] : pivot[1];
    const frame = p.c.frames?.[p.f];
    const sx = frame?.[0] ?? p.globalFrame % (a.columns || p.c.n) * cell[0], sy = frame?.[1] ?? (p.c.row !== undefined ? p.c.row * cell[1] : Math.floor(p.globalFrame / (a.columns || p.c.n)) * cell[1]);
    g.save(); if (this.phase === 'rescue') g.globalAlpha *= Math.max(.25, 1 - (this.clock - this.phaseAt) * .3);
    g.drawImage(a.img, sx, sy, cell[0], cell[1], p.x - pw * this.artScale, p.y - ph * this.artScale, u[0] * this.artScale, u[1] * this.artScale); g.restore();
  }
  drawPrincess(g) {
    if (!PRINCESS || !ready(PRINCESS)) return;
    const P = PRINCESS, name = this.phase === 'rescue' ? 'Cheer' : this.phase === 'breach' || this.stage === 'strike' || this.clock < this.postShockUntil ? 'Scared' : this.stage === 'windup' ? 'Blocking' : this.danger > .7 ? 'Nervous' : 'Idle', a = P.anims[name] || P.anims.Idle;
    const f = Math.floor(this.clock * (a.fps || 14)) % a.n, size = P.unit;
    g.drawImage(P.img, f * P.cell, a.row * P.cell, P.cell, P.cell, 299 - size / 2, 202 - size + P.feet, size, size);
  }
  drawWalkway(g) {
    if (rampart()) { const p = this.pose(); softGlow(g, p.x, p.y + 1, 22, 4, 'rgba(0,0,0,.6)', 1); return; }   // the walk is baked into the plate
    // A recessed back-wall promenade: the ball crosses in the foreground, as it
    // does the castle plate. Only the posts, Warden and chamber lip are actors.
    const front = this.stance(0).y + 3, rear = 214;
    // Frosted flagstones: warm key from the top left fading into cold shadow, a lit rim and a thin snow drift.
    const slab = g.createLinearGradient(0, rear, 0, front + 5); slab.addColorStop(0, '#3c4b5e'); slab.addColorStop(.6, '#253244'); slab.addColorStop(1, '#162131');
    g.fillStyle = slab; g.beginPath(); g.moveTo(20, rear); g.lineTo(254, rear); g.lineTo(262, front); g.lineTo(8, front); g.closePath(); g.fill();
    const key = g.createLinearGradient(8, 0, 262, 0); key.addColorStop(0, 'rgba(255,219,184,.10)'); key.addColorStop(1, 'rgba(140,166,255,0)');
    g.fillStyle = key; g.fill();
    g.fillStyle = '#121b28'; g.fillRect(8, front, 254, 5);
    const drift = g.createLinearGradient(0, front - 3, 0, front + 1); drift.addColorStop(0, 'rgba(214,236,250,0)'); drift.addColorStop(1, 'rgba(214,236,250,.32)');
    g.fillStyle = drift; g.fillRect(8, front - 3, 254, 4);
    g.strokeStyle = 'rgba(207,230,245,.55)'; g.lineWidth = 1; g.beginPath(); g.moveTo(8, front); g.lineTo(262, front); g.stroke();
    g.strokeStyle = 'rgba(124,146,163,.16)';
    for (const x of [45, 91, 137, 183, 229]) { g.beginPath(); g.moveTo(x, rear + 1); g.lineTo(x - 4, front); g.stroke(); }
    const p = this.pose(); g.fillStyle = 'rgba(0,0,0,.45)'; g.beginPath(); g.ellipse(p.x, p.y + 1, 19, 3.5, 0, 0, Math.PI * 2); g.fill();
  }
  draw(g) {
    if (!rampart() || !this.bleed) g.drawImage(this.background(), 0, 0, this.W, this.H);
    g.save(); g.beginPath(); g.rect(0, 65, this.W, this.playClipY - 65); g.clip();
    const [sx, sy] = this.shakeOffset(); g.translate(sx, sy);
    this.drawWalkway(g);
    // Chamber ledge is drawn behind Lumi; its physical face is explicit.
    if (!rampart()) g.drawImage(brick('#42536e', 60, 12, { metal: true }), 268, 202, 60, 16);
    for (const b of this.bricks) if (b.hp) {
      // The Vault's glazed ceramic per row (blue, violet, teal, coral): the castle family, not Mooncoil's moonstone.
      const row = Math.floor((b.y - 266) / 26), art = SPR[`brick_${['b', 'v', 't', 'c', 'b', 'v'][row]}_2_0`];
      const special = b.type === 'mine' ? 'frost_mine' : b.payload ? 'frost_chest' : b.maxHP > 1 ? (b.hp < b.maxHP ? 'frost_armour_cracked' : 'frost_armour') : null, sp = special && r3('bricks', special);
      if (r3ok(sp)) { g.save(); g.shadowColor = '#000000a0'; g.shadowBlur = 4; g.shadowOffsetY = 2; g.drawImage(sp, b.x - 1, b.y - 1, b.w + 2, b.h + 2); g.restore();
        if (b.type === 'mine') softGlow(g, b.x + b.w / 2, b.y + b.h / 2, 12, 9, 'rgba(90,170,255,.8)', .35 + .3 * Math.sin(this.t * 5 + b.x)); continue; }
      if (b.type === 'steel' ? drawThemedBar(g, 'frost', b.x, b.y, b.w, b.h) : drawThemed(g, 'frost', frostMat(b), b.x, b.y, b.w, b.h)) { /* themed set */ }
      else if (ready(art)) { const m = art.margin || 0, scaleX = b.w / (art.uw - m * 2), scaleY = b.h / (art.uh - m * 2); g.drawImage(art.img, b.x - m * scaleX, b.y - m * scaleY, art.uw * scaleX, art.uh * scaleY); }
      else g.drawImage(brick(b.color, b.w, b.h), b.x, b.y, b.w, b.h + 4);
      if (b.payload) { if (GEMS.pip_gold) { softGlow(g, b.x + b.w / 2, b.y + b.h / 2, 12, 8, 'rgba(255,214,150,.7)', 1); gem(g, 'pip_gold', b.x + b.w / 2, b.y + b.h / 2, 1.05); }
        else { g.fillStyle = '#e8d7ed'; g.beginPath(); g.moveTo(b.x + b.w / 2, b.y + 5); g.lineTo(b.x + b.w / 2 + 3, b.y + 9); g.lineTo(b.x + b.w / 2, b.y + 13); g.lineTo(b.x + b.w / 2 - 3, b.y + 9); g.closePath(); g.fill(); } }
    }
    // Frost-mine bursts and smashed posts: the painted ice shatter (6 frames over half a second).
    for (const e of this.blasts) { const q = (this.clock - e.at) / .5; if (q < 1) { const img = r3('fx', 'ice_' + Math.min(5, Math.floor(q * 6))); if (r3ok(img)) { const w = img.fw * (e.k || .5), h = img.fh * (e.k || .5); g.drawImage(img, e.x - w / 2, e.y - h * .6, w, h); } } }
    this.drawPrincess(g);
    // A cool shadow pool behind the Warden lifts his pale fur off the frosted stone (the sheet has no rim light yet).
    if (rampart() && this.phase !== 'rescue') { const p = this.pose(); softGlow(g, p.body.x + p.body.w / 2, p.body.y + p.body.h * .45, p.body.w * 1.15, p.body.h * .7, 'rgba(4,8,18,.62)', 1); }
    this.drawWarden(g);
    for (const d of this.defences) if (d.hp) {
      const stone = SPR.brick_granite_1_0, f = d.hp / d.maxHP, post = POSTS[f > .67 ? 0 : f > .34 ? 1 : 2];
      // The Warden's next target glows a warning red behind its post (a filled bloom, no outline).
      if (this.stage === 'windup' && this.defences[this.activeDefence] === d) softGlow(g, d.x + d.w / 2, d.y + d.h / 2, 26, 48, 'rgba(255,120,130,.55)', .7 + .3 * Math.sin(this.clock * 14));
      if (ready(post)) {
        g.drawImage(post.img, d.x + d.w / 2 - post.uw / 2, d.y + d.h / 2 - post.uh / 2, post.uw, post.uh);
        for (let i = 0; i < d.maxHP; i++) gem(g, i < d.hp ? 'pip_blue' : 'pip_empty', d.x + d.w / 2 + (i - (d.maxHP - 1) / 2) * 7.6, d.y - 12, .82);
      } else if (ready(stone)) {
        const m = stone.margin || 0, xs = d.w / (stone.uw - m * 2), ys = (d.h / 4) / (stone.uh - m * 2);
        for (let i = 0; i < 4; i++) g.drawImage(stone.img, d.x - m * xs, d.y + i * d.h / 4 - m * ys, stone.uw * xs, stone.uh * ys);
      } else g.drawImage(brick('#66849a', d.w, d.h, { depth: 4, metal: true, crack: d.maxHP - d.hp }), d.x, d.y, d.w, d.h + 4);
      if (!ready(post) && d.hp < d.maxHP) { g.strokeStyle = '#202a40'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(d.x + d.w * .7, d.y + 7); g.lineTo(d.x + 6, d.y + 27); g.lineTo(d.x + d.w - 3, d.y + 39); g.lineTo(d.x + 5, d.y + 58); g.stroke(); }
      if (!ready(post)) for (let i = 0; i < d.maxHP; i++) { g.fillStyle = i < d.hp ? '#bddce8' : '#273b4a'; g.fillRect(d.x + 5, d.y + 8 + i * 11, 8, 4); }
      if (this.ward?.targetId === d.id) { g.save(); g.beginPath(); g.rect(d.x - 5, d.y - 5, d.w + 10, d.h + 10); g.clip(); drawKitBrickArmour(g, d.x + d.w / 2, d.y + d.h / 2, this.t - this.kitCastAt, 72); g.restore(); }
    }
    for (const f of this.fragments) {
      if (f.brk) { themedBreak(g, 'frost', f.mat, f.bx, f.by, f.w, f.h, f.t, .6); continue; }
      if (f.mat && themedChip(g, 'frost', f.mat, f.variant || 0, f.x, f.y, f.t * f.vx * .04 + (f.variant || 0), f.size * 2, 1 - f.t / .45)) continue;
      if (drawShard(g, f.palette, f.variant || 0, f.x, f.y, f.t * f.vx * .04 + (f.variant || 0), f.size * 2.6, 1 - f.t / .45)) continue;
      g.save(); g.globalAlpha = 1 - f.t / .45; g.translate(f.x, f.y); g.rotate(f.t * f.vx * .04); g.drawImage(brick(f.color, f.size, f.size), -f.size / 2, -f.size / 2, f.size, f.size + 2); g.restore();
    }
    this.drawDrops(g); this.drawAim(g); this.drawPaddle(g); this.drawBalls(g); this.fx.draw(g);
    g.restore();
    if (this.wardTarget) drawKitCastFlight(g, this.kitAnchor(), this.wardTarget, this.t - this.kitCastAt, this.kitUIScale);
    this.drawDeck(g); this.drawHUDBase(g);
    const x = 64 / this.kitUIScale, y = this.hudY + 35 / this.kitUIScale, w = this.W - 80 / this.kitUIScale;
    glazedBar(g, x, y, w, 5 / this.kitUIScale, this.warden.hp / this.warden.maxHP, '#d8f0ff', '#4f86b8');
    if (!this.started) text(g, 'Break the siege. Protect Lumi.', this.W / 2, 245, 14, '#d5e4ef', 'center');
    if (this.phase === 'breach') text(g, 'CHAMBER BREACHED', this.W / 2, 244, 18, '#efb5ba', 'center');
  }
  nearMiss() { return { line: hpLeft('THE FROST WARDEN', this.warden.hp), progress: 1 - this.warden.hp / this.warden.maxHP }; } // continue panel copy
  result() { return { stars: this.state === 'won' ? 1 + (this.lives >= 2) + (this.defences.filter(d => d.hp > 0).length >= 2) : 0, lines: [['Score', this.score.toLocaleString()], ['Defences standing', this.defences.filter(d => d.hp > 0).length + ' / 3'], ['Punches blocked', this.blockedPunches]] }; }
}
