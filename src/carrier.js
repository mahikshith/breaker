import { Arena } from './arena.js';
import { ART } from './vault-art.js';
import { cached, loadImg, ready, text, drawBall, drawStretchPaddle, softRing, drawGem, drawCapsule } from './gfx.js';
import { sweepTarget, overlapsTarget } from './carrier-physics.js';
import { sfx } from './audio.js';
import { RAM } from './fantasy/ram.js';
import { drawNixControl, drawTickSecure } from './space-companions.js';
import { difficulty } from './difficulty.js';
import { drawEnemyBolt, drawEnemyImpact, drawWeaponCharge, drawWeaponMuzzle, nextEnemyVolley, enemyEscapeLane } from './space-weapons.js';
import { plural } from './near-miss.js';

const DATA = ART.carrier;
const PARTS = {};
for (const [id, p] of Object.entries(DATA?.parts || {})) PARTS[id] = { ...p, img: loadImg(p.url) };
const TAU = Math.PI * 2, WAVE = 12, WARNING = 1.2, REBUILD = 3.6, RETREAT = 1.6;
const RESISTANCE = { easy: { hull: 45, lock: 5 }, medium: { hull: 60, lock: 6 }, hard: { hull: 78, lock: 7 } };
const RAID_PACE = { easy: { firstSquad: 20, extractSeconds: 14, raidRecovery: 6 }, medium: { firstSquad: 16, extractSeconds: 11, raidRecovery: 4 }, hard: { firstSquad: 12, extractSeconds: 9, raidRecovery: 3 } };
const clamp = v => Math.max(0, Math.min(1, v));
const ease = v => { v = clamp(v); return v * v * (3 - 2 * v); };
const mix = (a, b, t) => a + (b - a) * t;
const turn = (a, b, t) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * clamp(t);
const nose = p => ({ x: p.x - Math.sin(p.angle) * p.h * .4, y: p.y + Math.cos(p.angle) * p.h * .4 });
const ellipse = (x, y, rx, ry, n = 18) => Array.from({ length: n }, (_, i) => [x + Math.cos(i * TAU / n) * rx, y + Math.sin(i * TAU / n) * ry]);
export function carrierArcPoint(curve, t) {
  t = clamp(t); const u = 1 - t;
  return { x: u * u * curve.from.x + 2 * u * t * curve.control.x + t * t * curve.to.x, y: u * u * curve.from.y + 2 * u * t * curve.control.y + t * t * curve.to.y };
}
const arcTangent = (c, t) => ({ x: 2 * ((1 - t) * (c.control.x - c.from.x) + t * (c.to.x - c.control.x)), y: 2 * ((1 - t) * (c.control.y - c.from.y) + t * (c.to.y - c.control.y)) });
const panelRect = ([x, y, w, h]) => [x + (w - 40) / 2, y + (h - 23) / 2, 40, 23];
// Delivered hull alpha contour, simplified at about2u; thin antennae are decoration.
const OUTLINE = [[.005,.49],[.04,.42],[.14,.33],[.18,.29],[.20,.25],[.24,.25],[.26,.19],[.32,.23],[.34,.18],[.41,.18],[.43,.127],[.572,.127],[.59,.18],[.65,.18],[.68,.23],[.75,.22],[.81,.28],[.86,.34],[.95,.42],[.995,.49],[.995,.60],[.975,.67],[.967,.75],[.99,.83],[.978,.936],[.95,.96],[.82,.96],[.795,.99],[.70,.99],[.68,.96],[.64,.96],[.63,.98],[.37,.98],[.36,.96],[.316,.96],[.3,.99],[.205,.99],[.19,.96],[.05,.96],[.022,.936],[.011,.83],[.033,.75],[.022,.68],[.005,.60]];
const BAY_HOLE = [[.38889,.61905],[.37222,.65079],[.37778,.84127],[.61111,.84127],[.62778,.8254],[.62778,.65079],[.61667,.61905]];
const FIGHTER = [[.5,.04],[.66,.22],[.98,.46],[.9,.65],[.65,.69],[.5,.98],[.35,.69],[.1,.65],[.02,.46],[.34,.22]];

function part(g, id, x, y, w, h, angle = 0, alpha = 1) {
  const p = PARTS[id]; if (!ready(p) || alpha <= 0) return;
  [w, h] = w === undefined ? p.display : [w, h];
  g.save(); g.translate(x, y); g.rotate(angle); g.globalAlpha *= alpha;
  g.drawImage(p.img, -p.pivot[0] * w, -p.pivot[1] * h, w, h); g.restore();
}
function fit(id, rect) {
  const p = PARTS[id], [x, y, w, h] = rect, b = p.artBounds;
  const k = Math.min(w / (p.display[0] * b[2]), h / (p.display[1] * b[3]));
  const fw = p.display[0] * k, fh = p.display[1] * k, aw = b[2] * fw, ah = b[3] * fh;
  return { x: x + w / 2 - (b[0] + b[2] / 2 - p.pivot[0]) * fw, y: y + h / 2 - (b[1] + b[3] / 2 - p.pivot[1]) * fh, w: fw, h: fh, rect: { x: x + (w - aw) / 2, y: y + (h - ah) / 2, w: aw, h: ah } };
}
function clip(g, x, y, w, h, draw) { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); draw(); g.restore(); }
function transform(points, x, y, w, h, angle = 0, pivot = [.5, .5]) {
  const c = Math.cos(angle), s = Math.sin(angle);
  return points.map(([u, v]) => { const dx = (u - pivot[0]) * w, dy = (v - pivot[1]) * h; return [x + dx * c - dy * s, y + dx * s + dy * c]; });
}
function clipPolygon(points, boundary) {
  let area = 0; for (let i = 0; i < boundary.length; i++) { const a = boundary[i], b = boundary[(i + 1) % boundary.length]; area += a[0] * b[1] - b[0] * a[1]; }
  const sign = area < 0 ? -1 : 1;
  for (let i = 0; i < boundary.length && points.length; i++) {
    const a = boundary[i], b = boundary[(i + 1) % boundary.length], side = p => ((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0])) * sign, next = [];
    for (let j = 0; j < points.length; j++) { const p = points[j], q = points[(j + 1) % points.length], sp = side(p), sq = side(q); if (sp >= 0) next.push(p); if ((sp >= 0) !== (sq >= 0)) { const t = sp / (sp - sq); next.push([mix(p[0], q[0], t), mix(p[1], q[1], t)]); } }
    points = next;
  }
  return points;
}

export class Carrier extends Arena {
  constructor(W, H, uiScale = 1, difficultyId = 'easy') {
    super(W, H, { accent: '#68d8ed', top: 68, left: 10, right: 10, minPaddleY: 470, uiScale, paddleWidth: 125, paddleHeight: 17, ballRadius: 7.5 });
    if (!DATA) throw new Error('Carrier artwork must be packed before starting this level');
    this.difficulty = difficulty(difficultyId); const resistance = RESISTANCE[this.difficulty.id]; this.rules = { ...this.difficulty.carrier, ...RAID_PACE[this.difficulty.id], lockHP: resistance.lock };
    this.name = 'Carrier Breakout'; this.subtitle = this.rules.waves > 1 ? 'Rescue both manifests before the carrier jumps.' : 'Stop the raiders. Rescue all five crew.';
    this.phase = 'carrier'; this.clock = 0; this.carrier = { id: 'carrier', hp: resistance.hull, maxHP: resistance.hull, hurt: 0 };
    this.assembly = DATA.assembly; this.motion = DATA.motion;
    this.encounterWave = 1; this.archivedCrew = []; this.waveRemaining = this.rules.waveSeconds; this.waveLaunched = false;
    this.makeManifest();
    this.guns = PARTS.aCannonBarrel.mounts.map((p, i) => ({ id: `cannon${i}`, hp: 4, maxHP: 4, x: p[0], y: p[1], hurt: 0, aim: 0 }));
    this.fighters = []; this.bolts = []; this.enemyImpacts = []; this.attack = null; this.nextAttack = 3.2; this.attackIndex = 0; this.wave = -1; this.serial = 0;
    this.raid = null; this.nextSquad = Infinity; this.nextBoarder = 0; this.squadBorn = -Infinity; this.enemyGraceUntil = 0;
    this.pressureClock = 0; this.serveAge = 0; this.serveLimit = 8; this.coreMode = 'manual'; this.coreHits = this.difficulty.companionHits; this.spacePowers = true;
    this.companionId = 'nix'; this.volleyPattern = null; this.weaponRandom = Math.random;
    this.debugGeometry = false; this.started = false; this.shipEpisodes = new WeakSet();
  }
  makeManifest() {
    if (this.encounterWave === 1) {
      this.bricks = this.assembly.bricks.map(b => { const rect = panelRect(b.rect); return { ...b, rect, hp: 1, maxHP: 1, hurt: 0, art: fit(b.part, rect), payload: DATA.payloads?.[b.id] || null }; });
      this.crew = this.assembly.pods.map((p, i) => this.makeCrew(p.id || `aCrewCell${i}`, p.referenceRect));
      return;
    }
    const pods = [[60,228,40,26],[260,228,40,26],[57,310,46,26],[157,268,46,26],[257,310,46,26]];
    this.crew = pods.map((r, i) => this.makeCrew(`w2-crew${i}`, r));
    const rows = [
      [228, [[4,46],[106,46],[158,44],[208,46],[310,46]]],
      [268, [[4,46],[56,46],[108,44],[208,44],[260,46],[312,44]]],
      [310, [[4,46],[108,44],[160,44],[208,44],[312,44]]],
    ];
    this.bricks = rows.flatMap(([y, cells], row) => cells.map(([x, w], i) => {
      const part = row === 1 ? 'aBrickPink' : 'aBrickCyan';
      const payload = row === 2 ? ({ 0: 'laser', 2: 'split', 4: 'shield' }[i] || null) : null;
      const rect = panelRect([x, y, w, 23]);
      return { id: `w2-panel${row}-${i}`, part, rect, hp: 1, maxHP: 1, hurt: 0, art: fit(part, rect), payload };
    }));
  }
  makeCrew(id, referenceRect) { return { id, referenceRect, hp: this.rules.lockHP, maxHP: this.rules.lockHP, hurt: 0, releasedAt: null, securedAt: null, secured: false, captured: false, art: fit('aPod', referenceRect) }; }
  pointerDown(x, y) { if (this.state === 'play' && this.phase === 'carrier') super.pointerDown(x, y); }
  pointerMove(x, y) { if (this.state === 'play' && this.phase === 'carrier') super.pointerMove(x, y); }
  pointerUp() { if (this.state === 'play' && this.phase === 'carrier' && this.ptr.down) super.pointerUp(); else this.ptr.down = false; }
  key(k, down) {
    if (k === ' ' && this.suppressedSpace) { if (!down) this.suppressedSpace = false; return; }
    if (this.state !== 'play' || this.phase !== 'carrier') { if (k === ' ' && down) this.suppressedSpace = true; this.keys[k] = false; return; }
    if (k === ' ' && !down && !this.keys[k]) return;
    super.key(k, down);
  }
  bossPose(at = this.clock) {
    const idle = this.carrier.hp > 0 ? { x: Math.sin(at * .8) * 2, y: Math.sin(at * 1.1) * 1.3 } : { x: 0, y: 0 };
    if (this.phase === 'rebuild') {
      const t = this.transitionAge, boost = Math.sin(Math.PI * clamp(t / 2));
      return { x: idle.x - 14 * boost, y: idle.y - 12 * boost };
    }
    if (this.phase === 'retreat') {
      const t = this.transitionAge;
      return this.carrier.hp > 0 ? { x: idle.x - 65 * ease((t - .35) / 1.25), y: idle.y - (this.assembly.hull.y + 100) * ease((t - .35) / 1.25) } : { x: 8 * ease(t / RETREAT), y: 22 * ease(t / RETREAT) };
    }
    if (this.carrier.hp <= 0) return { x: 0, y: 0 };
    const age = at - (this.carrier.impactAt ?? -Infinity), recoil = age >= 0 && age < .16 ? Math.sin(Math.PI * age / .16) * 1.5 : 0;
    return { x: idle.x, y: idle.y - recoil };
  }
  bayPose(at = this.clock) { const p = this.bossPose(at); return { ...this.assembly.hangar, x: this.assembly.hangar.x + p.x, y: this.assembly.hangar.y + p.y, mouthY: this.assembly.hangar.mouthY + p.y }; }
  hullPose(at = this.clock) { const p = this.bossPose(at); return { x: this.assembly.hull.x + p.x, y: this.assembly.hull.y + p.y }; }
  canUseCorePower() { return this.state === 'play' && this.phase === 'carrier' && super.canUseCorePower(); }
  spacePowerAvailable() { return this.state === 'play' && this.phase === 'carrier'; }
  coachLive() { return this.phase === 'carrier'; }
  serve() { super.serve(); this.serveAge = 0; this.serveLimit = this.started ? 3 : 8; }
  release() {
    if (this.state !== 'play' || this.phase !== 'carrier') return;
    const serve = this.aim?.serve;
    super.release();
    if (!serve || this.aim) return;
    if (this.waveServe) {
      const angle = Math.atan2(this.balls[0].vx, -this.balls[0].vy);
      for (let i = 1; i < this.balls.length; i++) { const b = this.balls[i], a = angle + (i % 2 ? 1 : -1) * Math.min(.3, Math.ceil(i / 2) * .07); b.caught = false; b.vx = Math.sin(a) * this.speed; b.vy = -Math.cos(a) * this.speed; }
      this.waveServe = false;
    }
    const firstWaveLaunch = !this.waveLaunched; this.waveLaunched = true;
    if (!this.started) { this.started = true; this.nextSquad = this.clock + this.rules.firstSquad; this.nextAttack = this.clock + 3.2; }
    else { this.enemyGraceUntil = this.clock + 3; if (this.carrier.hp > 0 && !this.fighters.length) this.nextSquad = this.clock + 6; this.nextAttack = this.clock + 3; }
    if (this.continued) { this.enemyGraceUntil = this.clock + 6; this.nextSquad = this.carrier.hp > 0 ? this.clock + 6 : Infinity; this.continued = false; }
    else if (firstWaveLaunch && this.encounterWave > 1) { this.enemyGraceUntil = this.clock + 3; this.nextSquad = this.clock + this.rules.firstSquad; }
    this.serveAge = 0;
  }
  previewRect() { return { x: 0, y: 78, w: this.W, h: 285 }; }
  world() {
    const targets = this.targets(1 / Math.max(.001, this.timeScale * (this.slowT > 0 ? .68 : 1)));
    const ship = targets.filter(t => t.id === 'carrier' || this.guns.some(c => c.id === t.id));
    // A cannon and its surrounding hull rim are one physical ship contact, even when
    // a full-radius ball touches both contours. Re-arm only after leaving the ship.
    for (const ball of this.balls) if (!ship.some(t => overlapsTarget({ ...ball, r: ball.r + .02 }, t))) this.shipEpisodes.delete(ball);
    return { ...super.world(), targets, onTarget: (id, ball, target) => {
      if (ship.some(t => t.id === id)) { if (this.shipEpisodes.has(ball)) return true; this.shipEpisodes.add(ball); }
      const live = this.hitTarget(id, ball, target);
      if (!live) for (const t of targets) if (t.id === id) t.active = false;
      return live;
    } };
  }
  doorPose(at = this.clock) {
    if (this.carrier.hp <= 0) return 1;
    const born = this.nextSquad < Infinity && at >= this.nextSquad - .65 ? this.nextSquad : this.squadBorn;
    if (born > -Infinity) return ease((at - born + .65) / .65) * (1 - ease((at - born - 2.4) / .65));
    const t = at % WAVE, m = this.motion.doors;
    return ease((t - m.start) / m.openDuration) * (1 - ease((t - m.closeStart) / m.closeDuration));
  }
  fighterPose(f, at = this.clock) {
    const age = at - f.born, path = f.path, bay = this.bayPose(at), u = ease(age / 1.1);
    let x = mix(bay.x, path.end[0], u), y = mix(bay.y - 9, path.end[1], u), angle = Math.atan2(path.end[1] - bay.y + 9, path.end[0] - bay.x) - Math.PI / 2;
    const t = at - f.stageAt, edge = f.side < 0 ? -28 : this.W + 28, dockY = this.paddle.y - 220;
    if (f.stage === 'bank') {
      // Clear the top of the panels before banking outside, then descend offscreen.
      x = mix(f.from.x, edge, ease((t - .35) / .65));
      y = t < .35 ? mix(f.from.y, 214, ease(t / .35)) : mix(214, dockY, ease((t - 1) / .5));
      angle = t < .35 ? turn(f.from.angle, Math.PI, ease(t / .25)) : t < 1 ? turn(Math.PI, -f.side * Math.PI / 2, ease((t - .35) / .3)) : turn(-f.side * Math.PI / 2, 0, ease((t - 1) / .3));
    }
    else if (f.stage === 'edge') { x = edge; y = dockY; angle = turn(0, f.side * Math.PI / 2, ease(t / .3)); }
    else if (['approach', 'hold', 'breach', 'extract', 'captured'].includes(f.stage)) {
      const k = f.stage === 'approach' ? ease(t / 2) : 1;
      x = mix(edge, f.dockX, k); y = dockY;
      if (f.stage !== 'approach' && f.stage !== 'breach') { const ramp = f.hoverAt === undefined ? 1 : ease((at - f.hoverAt) / .45); x += mix(f.hoverFrom?.x || 0, this.rules.hover * Math.sin((at - f.born) * .75), ramp); y += mix(f.hoverFrom?.y || 0, Math.sin((at - f.born) * 1.1) * 2, ramp); }
      if (f.stage === 'breach' && f.lockPose) { x = f.lockPose.x; y = f.lockPose.y; }
      const target = this.crew.find(c => c.id === this.raid?.targetId), p = target ? this.centre(target) : { x, y: y - 100 };
      const facing = Math.atan2(p.y - y, p.x - x) - Math.PI / 2;
      angle = f.stage === 'approach' ? turn(f.side * Math.PI / 2, facing, ease((t - 1.3) / .7)) : turn(f.turnFrom ?? facing, facing, f.turnAt === undefined ? 1 : ease((at - f.turnAt) / .35));
    }
    else if (f.stage === 'depart') { const k = ease(t / 1.05); x = mix(f.from.x, edge, k); y = f.from.y - 80 * ease((t - 1.05) / .45); angle = turn(f.from.angle, -f.side * Math.PI / 2, ease(t / .3)); }
    return { x, y, angle, w: 48, h: 40, age };
  }
  fighterOffscreen(f, p = this.fighterPose(f)) {
    if (p.age < 0) return false;
    const b = PARTS.aFighter.artBounds, corners = transform([[b[0],b[1]],[b[0]+b[2],b[1]],[b[0]+b[2],b[1]+b[3]],[b[0],b[1]+b[3]]], p.x, p.y, p.w, p.h, p.angle);
    return corners.every(([x]) => x < 0) || corners.every(([x]) => x > this.W) || corners.every(([, y]) => y > this.playClipY);
  }
  cannonPose(c, at = this.clock) {
    const base = this.bossPose(at), x = c.x + base.x, y = c.y + base.y;
    const active = c.hp > 0 && this.carrier.hp > 0 ? this.attack?.sources?.find(s => s.id === c.id && !s.cancelled) : null, age = active ? at - active.started : -1;
    const targetTurn = active ? Math.atan2(active.targetX - x, active.targetY - y) : 0;
    const warning = this.attack?.warning || WARNING, last = warning + (this.attack?.shots?.at(-1) || 0);
    const aim = age < 0 ? 0 : targetTurn * (age < last + .2 ? ease(age / .35) : 1 - ease((age - last - .2) / .9));
    const recoil = active ? this.attack.shots.reduce((sum, shot) => { const t = age - warning - shot; return sum + (t >= 0 && t < .24 ? Math.sin(t / .24 * Math.PI) * (this.attack.kind === 'heavy' ? 8 : 5.5) : 0); }, 0) : 0;
    return { x: x - Math.sin(aim) * recoil, y: y - Math.cos(aim) * recoil, angle: -aim, age, active };
  }
  targets(rate = 1) {
    const out = [], add = (actor, shapes, extra = {}) => out.push({ id: actor.id, hp: actor.hp, active: actor.hp > 0, shapes, ...extra });
    for (const b of this.bricks) if (b.hp > 0) add(b, [{ type: 'rect', ...b.art.rect }]);
    // shortcut: released housing shells are presentation only; add measured moving frame colliders when shell contact becomes part of the level rules.
    for (const c of this.crew) if (c.hp > 0) add(c, [{ type: 'rect', ...c.art.rect }]);
    const hull = this.hullPose(), future = this.bossPose(this.clock + .001), now = this.bossPose(), velocity = { vx: (future.x - now.x) / .001 * rate, vy: (future.y - now.y) / .001 * rate }, [hw, hh] = PARTS.aHull.display;
    const bayHole = transform(BAY_HOLE, hull.x, hull.y, hw, hh), hullBody = transform(OUTLINE, hull.x, hull.y, hw, hh);
    if (this.carrier.hp > 0) {
      const holes = [bayHole, ...this.guns.map(c => { const p = this.cannonPose(c); return ellipse(p.x, p.y, 22, 20); })];
      add(this.carrier, [{ type: 'polygon', points: hullBody, holes }], velocity);
      const bay = this.bayPose(), pw = bay.w / 2, open = this.doorPose(), next = this.doorPose(this.clock + .001);
      for (const sign of [-1, 1]) {
        const cx = bay.x + sign * (bay.w / 4 + open * bay.doorTravel), x = Math.max(bay.x - bay.w / 2, cx - pw / 2), right = Math.min(bay.x + bay.w / 2, cx + pw / 2);
        if (right - x > .05) add(this.carrier, [{ type: 'rect', x, y: bay.y - bay.h / 2, w: right - x, h: bay.h }], { vx: velocity.vx + sign * (next - open) * bay.doorTravel / .001 * rate, vy: velocity.vy });
      }
    } else out.push({ id: 'disabled-carrier', active: true, pierceable: false, shapes: [{ type: 'polygon', points: hullBody, holes: [bayHole] }] });
    for (const c of this.guns) if (this.carrier.hp > 0) {
      const p = this.cannonPose(c), q = this.cannonPose(c, this.clock + .001), shape = { type: 'polygon', points: transform(ellipse(.5, .5, .5, .5), p.x, p.y, 36, 32, p.angle) };
      if (c.hp > 0) add(c, [shape], { vx: (q.x - p.x) / .001 * rate, vy: (q.y - p.y) / .001 * rate });
      else add(this.carrier, [shape], { pierceable: false });
    }
    for (const f of this.fighters) if (f.hp > 0) {
      const p = this.fighterPose(f); if (p.age < 0 || this.fighterOffscreen(f, p)) continue;
      const q = this.fighterPose(f, this.clock + .001);
      const body = transform(FIGHTER, p.x, p.y, p.w, p.h, p.angle), bay = this.bayPose();
      const rear = clipPolygon(body, transform(BAY_HOLE, hull.x, hull.y, hw, hh)), front = clipPolygon(body, [[-100,bay.mouthY],[this.W+100,bay.mouthY],[this.W+100,this.H],[-100,this.H]]);
      add(f, [rear, front].filter(p => p.length >= 3).map(points => ({ type: 'polygon', points })), { vx: (q.x - p.x) / .001 * rate, vy: (q.y - p.y) / .001 * rate });
    }
    for (const b of this.bolts) if (!b.dead) out.push({ id: b.id, active: true, solid: false, vx: b.vx * rate, vy: b.vy * rate, shapes: [{ type: 'circle', x: b.x, y: b.y, r: b.r }] });
    return out;
  }
  // Sweet-Spot Ram: the panel bricks plough; crew pods, hull, cannons and fighters bounce it (villain parts take RAM.damage).
  ramPierce(t) { return !!t && this.bricks.some(b => b.id === t.id); }
  hitTarget(id, b) {
    if (this.state !== 'play' || this.phase !== 'carrier') return false;
    if (id.startsWith('disabled-')) {
      if (this.carrier.hp > 0 && this.guns.some(c => `disabled-${c.id}` === id)) id = 'carrier';
      else { sfx.wall(); return true; }
    }
    const bolt = this.bolts.find(s => s.id === id);
    if (bolt) { if (!bolt.dead) { bolt.dead = true; this.addScore(20); this.enemyImpact(bolt, bolt); sfx.tough(); } return false; }
    const obj = id === 'carrier' ? this.carrier : [...this.bricks, ...this.crew, ...this.guns, ...this.fighters].find(o => o.id === id);
    if (!obj || obj.hp <= 0) return false;
    const brick = this.bricks.includes(obj), crew = this.crew.includes(obj);
    const damage = Math.min(obj.hp, brick || crew ? b.fire && !b.shot ? obj.hp : crew && b.titan > 0 ? 2 : 1 : b.shot ? 1 : b.titan > 0 ? 4 : b.fire ? 3 : b.ram > 0 ? RAM.damage : 1);
    const pulled = crew && this.raid?.targetId === obj.id ? this.workerPose(obj) : null;
    obj.hp -= damage; obj.hurt = obj === this.carrier ? .1 : .14;
    this.chargeSpacePower(b);
    if (this.guns.includes(obj)) { this.carrier.hp = Math.max(0, this.carrier.hp - damage); this.carrier.hurt = .1; }
    if (obj === this.carrier || this.guns.includes(obj)) { this.carrier.impact = { x: b.x, y: b.y }; this.carrier.impactAt = this.clock; }
    this.addScore(brick ? 15 : crew ? 35 : 60); sfx.tough(); this.bump(brick ? .04 : .11, brick ? 0 : .018);
    this.fx.ring(b.x, b.y, brick ? '#8ce8f8' : '#f1a1d4', brick ? 10 : 15);
    if (obj.hp <= 0) {
      if (brick || crew) this.brokeBrick();
      if (brick) { const r = obj.art.rect, pink = obj.part === 'aBrickPink'; this.fx.shatter(r.x, r.y, r.w, r.h, pink ? '#e2459b' : '#1aa6e0', 5, .8, pink ? 'pink' : 'cyan'); }
      if (brick && obj.payload) this.dropPower(obj.art.rect.x + obj.art.rect.w / 2, obj.art.rect.y + obj.art.rect.h, obj.payload);
      if (crew) { obj.releasedAt = this.clock; if (pulled?.pull) obj.rescueFrom = { x: pulled.x, y: pulled.y }; sfx.power(); if (this.raid?.targetId === obj.id) this.endRaid(); }
      if (this.raid?.fighterId === obj.id) this.endRaid();
      if (this.fighters.includes(obj)) { const p = this.fighterPose(obj); this.fx.shatter(p.x - 14, p.y - 9, 28, 18, '#bd9ac8', 6, 1, 'hull'); sfx.boom(); }
      if (this.attack?.id === id && !this.attack.sources) this.attack = null;
    }
    if (this.carrier.hp <= 0 && !this.shutdown) this.disableCarrier();
    this.checkGoal(); return obj.hp > 0;
  }
  disableCarrier() {
    this.shutdown = true; this.endRaid(); this.attack = null; this.bolts.length = 0; this.nextSquad = Infinity;
    for (const f of this.fighters) this.departFighter(f);
    this.fx.pop(this.W / 2, 225, 'CARRIER DISABLED', '#c6dcf0', 20); sfx.boom(); this.bump(.5, .06);
  }
  shotHit(s, previousY = s.y, dt = 0) {
    let first = null;
    for (const target of this.targets(1 / Math.max(.001, this.timeScale))) {
      const hit = sweepTarget({ x: s.x, y: previousY }, s, s.r || 2, target, 0, dt);
      if (hit && (!first || hit.t < first.hit.t)) first = { target, hit };
    }
    if (!first) return false;
    this.hitTarget(first.target.id, { x: first.hit.x, y: first.hit.y, shot: true }); return true;
  }
  updateShots(dt) { if (this.state === 'play' && this.phase === 'carrier') super.updateShots(dt); else this.shots.length = 0; }
  applyPower(kind) { if (this.state === 'play' && this.phase === 'carrier') super.applyPower(kind); }
  onPaddle(b) { if (this.state === 'play' && this.phase === 'carrier') super.onPaddle(b); }
  checkGoal() {
    if (this.phase === 'carrier' && this.crew.every(c => c.hp <= 0)) {
      this.phase = 'escape'; this.endRaid(); this.attack = null; this.bolts.length = this.shots.length = 0; this.aim = null;
      this.suppressedSpace = !!this.keys[' ']; this.ptr.down = false; this.keys = {};
      for (const b of this.balls) b.caught = true;
      this.addScore(1800 + this.lives * 300); this.fx.pop(this.W / 2, 235, 'CREW RELEASED!', '#a5f1ef', 24); sfx.win();
    }
  }
  finishManifest() {
    if (this.encounterWave < this.rules.waves && this.carrier.hp > 0) {
      this.archivedCrew.push(...this.crew.map(c => ({ ...c })));
      this.encounterWave++; this.phase = 'rebuild'; this.transitionAge = 0;
      this.clearThreats(); this.makeManifest();
      // Each arrival is a new module; this never changes the persistent hull HP.
      this.guns = PARTS.aCannonBarrel.mounts.map((p, i) => ({ id: `w${this.encounterWave}-cannon${i}`, hp: 4, maxHP: 4, x: p[0], y: p[1], hurt: 0, aim: 0 }));
      this.waveRemaining = this.rules.waveSeconds; this.waveLaunched = false;
    } else { this.phase = 'retreat'; this.transitionAge = 0; this.clearThreats(); }
  }
  finishRebuild() {
    this.phase = 'carrier'; this.waveServe = true;
    this.balls = this.balls.filter(b => !b.dead);
    if (!this.balls.length) super.serve(); else this.inputEpoch++;
    for (const b of this.balls) { b.caught = true; b.x = this.paddle.x; b.y = this.paddle.y - b.r - 1; b.trail.length = 0; }
    this.aim = { ball: this.balls[0], angle: 0, serve: true, t: 0, anchorX: this.ptr.x };
    this.serveAge = 0; this.serveLimit = 3; this.hitStop = 0; this.timeScale = 1;
    this.ptr.down = false; this.keys = {}; this.nextSquad = Infinity;
  }
  update(dtReal) {
    if (this.state !== 'play' || this.powerMenuOpen) return;
    if (this.phase === 'escape') { this.clock += dtReal; this.pressureClock = this.clock; this.updateCrew(); this.fx.update(dtReal, this.drainY); if (this.crew.every(c => c.secured && this.clock - c.releasedAt >= 1.95)) this.finishManifest(); return; }
    if (this.phase === 'rebuild' || this.phase === 'retreat') {
      this.transitionAge += dtReal;
      if (this.phase === 'rebuild' && this.transitionAge >= REBUILD) this.finishRebuild();
      else if (this.phase === 'retreat' && this.transitionAge >= RETREAT) this.win();
      return;
    }
    this.levelUpdated = false;
    super.update(dtReal);
    // Arena's visual hit-stop must not become a way to stall an extraction.
    if (!this.levelUpdated && this.state === 'play' && this.phase === 'carrier') this.updateLevel(0, dtReal);
  }
  updateLevel(dt, dtReal = dt) {
    this.levelUpdated = true;
    if (this.state !== 'play' || this.phase !== 'carrier') return;
    if (this.aim?.serve && !this.backHold) { this.serveAge += dtReal; if (this.serveAge >= this.serveLimit) this.release(); }
    if (!this.started || this.backHold) return; // back in action: the jump clock and the guns wait for the serve
    this.clock += dtReal; this.pressureClock = this.clock;
    this.enemyImpacts = this.enemyImpacts.filter(h => this.clock - h.at < .32);
    for (const o of [this.carrier, ...this.guns, ...this.bricks, ...this.crew, ...this.fighters]) o.hurt = Math.max(0, o.hurt - dtReal);
    this.updateCrew();
    if (this.waveLaunched && this.carrier.hp > 0 && Number.isFinite(this.waveRemaining)) {
      this.waveRemaining = Math.max(0, this.waveRemaining - dtReal);
      if (this.waveRemaining <= 0) { this.clearThreats(); this.fail('Carrier jumped'); return; }
    }
    this.updateBolts(dtReal, dtReal);
    if (this.state !== 'play') return;
    this.updateRaid();
    if (this.state !== 'play') return;
    this.updateAttack();
  }
  updateCrew() {
    for (const c of this.crew) {
      if (c.releasedAt !== null && !c.secured && this.clock - c.releasedAt >= .8) { c.secured = true; c.securedAt = c.releasedAt + .8; }
      if (c.returning && this.clock - c.returning.at >= .35) c.returning = null;
    }
  }
  departFighter(f) {
    if (f.hp <= 0 || f.stage === 'depart') return;
    f.from = this.fighterPose(f); f.stage = 'depart'; f.stageAt = this.clock;
  }
  endRaid() {
    const raid = this.raid; if (!raid) return;
    const c = this.crew.find(c => c.id === raid.targetId), f = this.fighters.find(f => f.id === raid.fighterId);
    if (c?.hp > 0 && !c.captured && raid.stage === 'extract' && this.clock - raid.extractAt > this.rules.extractSeconds - 2) c.returning = { ...this.workerPose(c), at: this.clock };
    if (f) this.departFighter(f);
    if (this.attack?.id === raid.fighterId) this.attack = null;
    this.bolts = this.bolts.filter(b => b.sourceId !== raid.fighterId);
    this.raid = null; this.nextBoarder = this.clock + this.rules.raidRecovery; this.nextAttack = Math.max(this.nextAttack, this.clock + .6);
  }
  centre(o) { const r = o.art.rect; return { x: r.x + r.w / 2, y: r.y + r.h / 2 }; }
  coverTargets() {
    const out = [...this.bricks, ...this.crew].filter(o => o.hp > 0).map(o => ({ id: o.id, actor: o, shapes: [{ type: 'rect', ...o.art.rect }] }));
    for (const t of this.targets()) if (t.id === 'carrier' && t.shapes.some(s => s.type === 'rect')) out.push(t);
    return out;
  }
  routeTo(c, from) {
    const to = this.centre(c); let blocker = null;
    for (const t of this.coverTargets()) {
      if (t.id === c.id) continue;
      // The boarding tractor travels above panels; another captive housing still excludes this route.
      if (this.bricks.includes(t.actor)) continue;
      const hit = sweepTarget(from, to, this.ballRadius, t);
      if (!hit) continue;
      if (!this.bricks.includes(t.actor)) return null;
      if (!blocker || hit.t < blocker.hit.t) blocker = { actor: t.actor, hit };
    }
    return { to, blocker: blocker?.actor || null };
  }
  chooseRaidTarget(from) {
    return this.crew.filter(c => c.hp > 0 && !c.secured && !c.captured).map(c => ({ c, route: this.routeTo(c, from) }))
      .filter(o => o.route).sort((a, b) => Math.hypot(a.route.to.x - from.x, a.route.to.y - from.y) - Math.hypot(b.route.to.x - from.x, b.route.to.y - from.y))[0]?.c || null;
  }
  updateRaid() {
    this.fighters = this.fighters.filter(f => f.hp > 0 && !(f.stage === 'depart' && this.clock - f.stageAt >= 1.5));
    if (this.carrier.hp <= 0) return;
    if (!this.fighters.length && this.clock >= this.nextSquad && this.clock >= this.enemyGraceUntil) {
      this.wave++; this.squadBorn = this.clock; this.nextSquad = Infinity;
      for (const [i, path] of this.assembly.fighterPaths.entries()) this.fighters.push({ id: `fighter${this.wave}-${i}`, born: this.clock + i * .4, path, hp: this.rules.raiderHP, maxHP: this.rules.raiderHP, hurt: 0, stage: 'queued', stageAt: this.clock, side: i === 2 ? 1 : -1, dockX: [138, 181, 222][i] });
    }
    for (const f of this.fighters) {
      const age = this.clock - f.stageAt;
      if (f.stage === 'bank' && age >= 1.5) { f.stage = 'edge'; f.stageAt = this.clock; }
      else if (f.stage === 'edge' && age >= 1) { f.stage = 'approach'; f.stageAt = this.clock; }
      else if (f.stage === 'approach' && age >= 2) { const p = this.fighterPose(f); f.hoverFrom = { x: p.x - f.dockX, y: p.y - this.paddle.y + 220 }; f.hoverAt = this.clock; f.stage = 'hold'; f.stageAt = this.clock; }
    }
    if (!this.raid && this.clock >= this.nextBoarder && this.clock >= this.enemyGraceUntil) {
      const f = this.fighters.find(f => f.stage === 'queued' && this.clock - f.born >= 1.1);
      const lowest = Math.max(0, ...[...this.bricks, ...this.crew].filter(o => o.hp > 0).map(o => o.art.rect.y + o.art.rect.h));
      if (f && this.paddle.y - 220 - 24 > lowest + this.ballRadius) {
        f.from = this.fighterPose(f); f.stage = 'bank'; f.stageAt = this.clock;
        this.raid = { fighterId: f.id, targetId: null, stage: 'approach', extractAt: null, blockerId: null };
        if (this.attack && !this.attack.fired) this.attack = null;
      }
    }
    const raid = this.raid; if (!raid) {
      if (!this.fighters.length && this.nextSquad === Infinity) this.nextSquad = this.clock + 6;
      return;
    }
    const f = this.fighters.find(f => f.id === raid.fighterId && f.hp > 0);
    if (!f) { this.endRaid(); return; }
    if (!['hold', 'breach', 'extract'].includes(f.stage)) return;
    const from = this.fighterPose(f);
    let c = this.crew.find(c => c.id === raid.targetId);
    if (c && (c.hp <= 0 || c.secured)) { this.endRaid(); return; }
    if (!c) { c = this.chooseRaidTarget(from); if (c) { f.turnFrom = from.angle; f.turnAt = this.clock; raid.targetId = c.id; } }
    if (!c) return;
    const route = this.routeTo(c, from);
    if (!route) { raid.targetId = null; raid.blockerId = null; return; }
    if (raid.stage === 'extract') {
      if (this.clock - raid.extractAt >= this.rules.extractSeconds) { c.captured = true; raid.stage = f.stage = 'captured'; this.attack = null; this.bolts.length = 0; this.fail('Crew taken'); }
      return;
    }
    raid.blockerId = null;
    if (this.clock < this.enemyGraceUntil || this.attack || this.bolts.length || this.clock < this.nextAttack) return;
    if (this.waveRemaining >= this.rules.extractSeconds + 1) { const p = this.fighterPose(f); f.hoverFrom = { x: p.x - f.dockX, y: p.y - this.paddle.y + 220 }; f.hoverAt = this.clock; raid.stage = f.stage = 'extract'; raid.extractAt = this.clock; raid.arcBend = this.chooseTractorBend(c, f); }
  }
  beginAttack(id, target, mode = 'paddle', blockerId = null, plan = nextEnemyVolley(this.difficulty.id, this.volleyPattern, this.weaponRandom), ids = [id]) {
    const pose = this.actorPose(id); if (!pose) return;
    this.attack = { ...plan, id, mode, blockerId: null, started: this.clock, from: { x: pose.x, y: pose.y }, targetX: target.x, targetY: target.y, fired: false,
      sources: ids.map((id, i) => ({ id, started: this.clock + i * .85, targetX: i ? null : target.x, targetY: target.y, next: 0 })) };
  }
  updateAttack() {
    if (this.carrier.hp <= 0 || this.clock < this.enemyGraceUntil) return;
    if (!this.attack && !this.bolts.length && !this.raid && this.clock >= this.nextAttack) {
      const plan = nextEnemyVolley(this.difficulty.id, this.volleyPattern, this.weaponRandom); this.volleyPattern = plan.pattern;
      const guns = this.guns.filter((c, i) => c.hp > 0 && (plan.pattern === 'both' || plan.pattern === (i ? 'right' : 'left')));
      if (plan.pattern !== 'quiet' && guns.length) this.beginAttack(guns[0].id, { x: this.paddle.x, y: this.paddle.y }, 'paddle', null, plan, guns.map(g => g.id));
      else this.nextAttack = this.clock + plan.cooldown;
    }
    const a = this.attack; if (!a) return;
    for (const source of a.sources) {
      if (source.cancelled || this.clock < source.started) continue;
      if (source.targetX === null) source.targetX = this.paddle.x;
      const from = this.actorPose(source.id);
      if (!from || !enemyEscapeLane(this.paddle, this.left, this.right, source.targetX, a.r)) { source.cancelled = true; continue; }
      source.from = from;
      while (source.next < a.shots.length && this.clock - source.started + 1e-9 >= a.warning + a.shots[source.next]) {
        const dx = source.targetX - from.x, dy = source.targetY - from.y, n = Math.max(1, Math.hypot(dx, dy)), vx = dx / n * a.speed, vy = dy / n * a.speed;
        this.bolts.push({ id: `bolt${this.serial++}`, sourceId: source.id, x: from.x - dx / n * a.r, y: from.y - dy / n * a.r, vx, vy, r: a.r, kind: a.kind, colour: 'carrier', from: { ...from }, bornAt: this.clock, muzzleFlash: false, dead: false });
        source.next++; source.firedAt = this.clock; sfx.zap();
      }
    }
    a.fired = a.sources.every(s => s.cancelled || s.next >= a.shots.length);
    if (a.fired && !this.bolts.length) { this.attack = null; this.nextAttack = this.clock + a.cooldown; }
  }
  actorPose(id) {
    const c = this.guns.find(c => c.id === id && c.hp > 0); if (c) { const p = this.cannonPose(c); return { x: p.x - Math.sin(p.angle) * 6, y: p.y + Math.cos(p.angle) * 6 }; }
    const f = this.fighters.find(f => f.id === id && f.hp > 0); if (!f) return null;
    const p = this.fighterPose(f); return p.age >= 0 && !this.fighterOffscreen(f, p) ? nose(p) : null;
  }
  enemyImpact(bolt, point) {
    this.enemyImpacts.push({ x: point.x, y: point.y, vx: bolt.vx, vy: bolt.vy, r: bolt.r, colour: 'carrier', at: this.clock });
    if (this.enemyImpacts.length > 8) this.enemyImpacts.shift();
  }
  updateBolts(dt, dtReal = dt) {
    if (!(dt > 0) || this.state !== 'play' || this.phase !== 'carrier') return;
    for (const s of this.bolts) {
      if (s.dead) continue;
      const from = { x: s.x, y: s.y }, to = { x: s.x + s.vx * dt, y: s.y + s.vy * dt };
      let first = null;
      const probe = (target, kind, actor) => { const hit = sweepTarget(from, to, s.r, target, 0, dt); if (hit && (!first || hit.t < first.hit.t)) first = { hit, kind, actor }; };
      // Enemy fire is aerial: only player balls and the moving paddle can intercept it.
      for (const b of this.balls) if (!b.dead && (b.caught || this.hitStop > 0)) probe({ vx: b.caught ? this.paddle.vx * dtReal / dt : 0, shapes: [{ type: 'circle', x: b.x - (b.caught ? this.paddle.vx * dtReal : 0), y: b.y, r: b.r }] }, 'ball', b);
      const p = this.paddle;
      probe({ vx: p.vx * dtReal / dt, shapes: [{ type: 'rect', x: p.x - p.vx * dtReal - p.w / 2, y: p.y, w: p.w, h: p.h }] }, 'paddle');
      s.x = to.x; s.y = to.y;
      if (first) {
        s.dead = true; const { hit, kind } = first;
        if (kind === 'ball') { this.enemyImpact(s, hit); this.addScore(20); sfx.tough(); }
        else if (kind === 'paddle') { this.loseBall(); if (this.state === 'play') this.enemyImpact(s, { x: hit.x, y: this.paddle.y }); break; }
      }
      if (s.y - s.r > this.drainY || s.y + s.r < this.top || s.x < -20 || s.x > this.W + 20) s.dead = true;
    }
    this.bolts = this.bolts.filter(s => !s.dead);
  }
  clearThreats() {
    this.endRaid(); this.fighters.length = this.bolts.length = this.shots.length = this.enemyImpacts.length = 0; this.attack = null;
    this.nextSquad = Infinity; this.nextAttack = this.clock + 3; this.enemyGraceUntil = this.clock + 3;
  }
  loseBall() {
    if (this.state !== 'play' || this.phase !== 'carrier') return;
    this.clearThreats(); this.balls.length = 0; this.aim = null; this.timeScale = 1;
    super.loseBall();
  }
  continueRun() {
    if (this.state !== 'lost') return;
    for (const c of this.crew) c.captured = false;
    this.clearThreats(); this.balls.length = 0; this.aim = null; this.fireT = 0;
    super.continueRun(); this.serveLimit = 3; this.continued = true;
    if (this.carrier.hp > 0 && Number.isFinite(this.waveRemaining)) this.waveRemaining = Math.min(this.rules.waveSeconds, Math.max(30, this.waveRemaining));
  }

  drawPaddleArt(g, p) { drawStretchPaddle(g, PARTS.aPaddle, p); }
  drawDeck(g) { drawNixControl(g, this); }
  drawBalls(g) {
    this.drawShots(g);
    for (const b of this.balls) {
      if (this.phase !== 'carrier') continue;
      if (b.titan > 0 || b.ram > 0) { drawBall(g, b); continue; }
      if (b.fire) softRing(g, b.x, b.y, b.r + 2.5, 2.2, '#f3a76e', .9);
      const a = fit('ball', [b.x - b.r, b.y - b.r, b.r * 2, b.r * 2]); part(g, 'ball', a.x, a.y, a.w, a.h);
    }
  }
  drawDrops(g) {
    for (const d of this.drops) { if (drawCapsule(g, d.kind, d.x, d.y, 36, 18)) continue; const id = `capsule_${d.kind}`; if (!PARTS[id]) continue; const a = fit(id, [d.x - 18, d.y - 9, 36, 18]); part(g, id, a.x, a.y, a.w, a.h); }
  }
  background() {
    const p = PARTS.aBackground;
    return cached(`carrier-bg${this.W}|${this.H}|${ready(p)}`, this.W, this.H, g => { if (!ready(p)) return; const k = Math.max(this.W / p.img.width, this.H / p.img.height); g.drawImage(p.img, this.W - p.img.width * k, this.H - p.img.height * k, p.img.width * k, p.img.height * k); });
  }
  paintBackground(g, y, height) {
    const p = PARTS.aBackground; if (!ready(p)) return;
    const k = Math.max(this.W / p.img.width, height / p.img.height);
    g.drawImage(p.img, this.W - p.img.width * k, y + height - p.img.height * k, p.img.width * k, p.img.height * k);
  }
  drawFullBleedBackground(g, top, height) {
    this.backgroundViewport = { top, height };
    this.paintBackground(g, 0, height);
  }
  draw(g) {
    if (this.backgroundViewport) this.paintBackground(g, -this.backgroundViewport.top, this.backgroundViewport.height);
    else g.drawImage(this.background(), 0, 0, this.W, this.H);
    if (!ready(PARTS.aHull)) return;
    const bay = this.bayPose(), hull = this.hullPose();
    for (const f of this.fighters) this.drawFighter(g, f, false);
    if (this.carrier.hp > 0) {
      const boost = this.phase === 'rebuild' || this.phase === 'retreat', urgency = Number.isFinite(this.waveRemaining) ? clamp((20 - this.waveRemaining) / 20) : 0, pulse = .85 + .15 * Math.sin(this.clock * 19 + (this.transitionAge || 0) * 30);
      for (const x of [-78, 78]) part(g, 'aThruster', hull.x + x, hull.y + 55, boost ? 20 : 6 + urgency * 2, (boost ? 68 : 12 + urgency * 7) * pulse, 0, boost ? .85 : .28 + urgency * .25);
    }
    part(g, 'aHull', hull.x, hull.y);
    const open = this.doorPose(), pw = bay.w / 2;
    clip(g, bay.x - bay.w / 2, bay.y - bay.h / 2, bay.w, bay.h, () => { part(g, 'aDoorLeft', bay.x - pw / 2 - open * bay.doorTravel, bay.y); part(g, 'aDoorRight', bay.x + pw / 2 + open * bay.doorTravel, bay.y); });
    if (this.carrier.hp <= 0) { const h = PARTS.aHull.display[1]; g.fillStyle = 'rgba(8,12,24,.88)'; g.beginPath(); g.arc(hull.x, hull.y - h * .16, 9.5, 0, TAU); g.fill(); }
    const opticY = hull.y - PARTS.aHull.display[1] * .16;
    for (let i = 0; i < 3; i++) { g.strokeStyle = '#362a43'; g.lineWidth = 1.8; g.beginPath(); g.arc(hull.x, opticY, 11, i * TAU / 3 + .12, (i + 1) * TAU / 3 - .12); g.stroke(); const fraction = clamp(this.carrier.hp / this.carrier.maxHP * 3 - i); if (fraction) { g.strokeStyle = '#e8a2d3'; g.beginPath(); g.arc(hull.x, opticY, 11, i * TAU / 3 + .12, i * TAU / 3 + .12 + (TAU / 3 - .24) * fraction); g.stroke(); } }
    if (this.carrier.hurt > 0 && this.carrier.impact) { const p = this.carrier.impact; g.strokeStyle = '#fff0fa'; g.lineWidth = 2; g.beginPath(); g.moveTo(p.x - 6, p.y); g.lineTo(p.x + 6, p.y); g.moveTo(p.x, p.y - 6); g.lineTo(p.x, p.y + 6); g.stroke(); }
    for (const f of this.fighters) this.drawFighter(g, f, true);
    for (const c of this.guns) this.drawCannon(g, c);
    for (const [i, b] of this.bricks.entries()) if (b.hp > 0) { const a = b.art, arrival = this.phase === 'rebuild' ? ease((this.transitionAge - 1.4 - i * .08) / .35) : 1; part(g, b.part, a.x, a.y - 12 * (1 - arrival), a.w, a.h, 0, arrival * (b.hurt > 0 ? .65 : 1)); if (b.payload && arrival > .99 && !drawCapsule(g, b.payload, a.rect.x + a.rect.w / 2, a.rect.y + a.rect.h / 2, 18, 9)) { const p = fit(`capsule_${b.payload}`, [a.rect.x + a.rect.w / 2 - 9, a.rect.y + a.rect.h / 2 - 4.5, 18, 9]); part(g, `capsule_${b.payload}`, p.x, p.y, p.w, p.h); } }
    for (const [i, c] of this.crew.entries()) { const arrival = this.phase === 'rebuild' ? ease((this.transitionAge - 1.8 - i * .08) / .45) : 1; if (arrival > 0) { g.save(); g.globalAlpha *= arrival; g.translate(0, -18 * (1 - arrival)); this.drawCrew(g, c); g.restore(); } }
    this.drawRaid(g); this.drawAttack(g);
    g.save(); g.beginPath(); g.rect(0, 0, this.W, this.playClipY); g.clip();
    for (const s of this.bolts) drawEnemyBolt(g, s, this.clock - s.bornAt);
    for (const hit of this.enemyImpacts) drawEnemyImpact(g, hit, this.clock - hit.at);
    this.drawDrops(g); if (this.state === 'play') this.fx.draw(g); g.restore();
    this.drawPaddle(g); this.drawBalls(g); if (this.phase === 'carrier') this.drawAim(g); this.drawDeck(g); this.drawHUD(g);
    if (this.debugGeometry) this.drawGeometry(g);
  }
  drawFighter(g, f, front) {
    const p = this.fighterPose(f); if (f.hp <= 0 || p.age < 0 || this.fighterOffscreen(f, p)) return;
    const draw = () => { for (const [u, v] of PARTS.aFighter.thrusterPorts) { const dx = (u - .5) * p.w, dy = (v - .5) * p.h, x = p.x + dx * Math.cos(p.angle) - dy * Math.sin(p.angle), y = p.y + dx * Math.sin(p.angle) + dy * Math.cos(p.angle), k = 7 * (1 + .03 * Math.sin(this.clock * 31)); part(g, 'aThruster', x, y, k, k * PARTS.aThruster.display[1] / PARTS.aThruster.display[0], Math.PI + p.angle); } part(g, 'aFighter', p.x, p.y, p.w, p.h, p.angle, f.hurt > 0 ? .6 : 1); g.save(); g.translate(p.x, p.y); g.rotate(p.angle); for (let i = 0; i < f.maxHP; i++) { g.fillStyle = i < f.hp ? '#d9e6f3' : '#4c5369'; g.fillRect(-f.maxHP * 2.5 + i * 5, 6, 3, 1.5); } g.restore(); };
    const b = this.bayPose();
    if (front) clip(g, -50, b.mouthY, this.W + 100, this.H, draw); else clip(g, b.x - b.w / 2, b.y - b.h / 2, b.w, b.h, draw);
  }
  drawAttack(g) {
    const a = this.attack; if (!a) return;
    for (const s of a.sources) {
      const age = this.clock - s.started; if (s.cancelled || age < 0 || age >= a.warning || !s.from) continue;
      g.save(); g.strokeStyle = '#e6a0c8'; g.lineWidth = 1; g.setLineDash([3, 5]); g.beginPath(); g.moveTo(s.from.x, s.from.y); g.lineTo(s.targetX, s.targetY); g.stroke(); g.setLineDash([]);
      g.lineWidth = 2; g.beginPath(); g.arc(s.targetX, s.targetY, a.r + 3, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(age / a.warning)); g.stroke(); g.restore();
      drawWeaponCharge(g, s.from, Math.atan2(s.targetY - s.from.y, s.targetX - s.from.x), age / a.warning, 'carrier');
    }
  }
  drawRaid(g) {
    const raid = this.raid, f = this.fighters.find(f => f.id === raid?.fighterId); if (!f) return;
    const pose = this.fighterPose(f);
    if (f.stage === 'edge') { const x = f.side < 0 ? 8 : this.W - 8; g.strokeStyle = '#f0b2cb'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - f.side * 4, pose.y - 8); g.lineTo(x + f.side * 2, pose.y); g.lineTo(x - f.side * 4, pose.y + 8); g.stroke(); }
    const c = this.crew.find(c => c.id === raid.targetId); if (!c || !['breach', 'extract', 'captured'].includes(raid.stage)) return;
    const p = this.centre(c), remaining = Math.max(0, this.rules.extractSeconds - (this.clock - raid.extractAt));
    g.save(); g.strokeStyle = raid.stage === 'captured' ? '#f28eae' : '#e0a6d6'; g.lineWidth = 1.6;
    g.beginPath(); g.ellipse(p.x, p.y, c.art.rect.w / 2 + 5, c.art.rect.h / 2 + 5, 0, 0, TAU); g.stroke();
    if (raid.stage === 'extract' || raid.stage === 'captured') {
      const curve = this.tractorCurve(c), worker = this.workerPose(c), t = worker.curveT, radius = u => 4 + 15 * u;
      const offset = (u, sign, fraction = 1) => {
        const q = carrierArcPoint(curve, t * u), d = arcTangent(curve, t * u), n = Math.max(1, Math.hypot(d.x, d.y)), r = radius(u) * fraction;
        return { x: q.x - sign * d.y / n * r, y: q.y + sign * d.x / n * r };
      };
      for (const [fraction, alpha] of [[1,.07],[.83,.05],[.57,.06]]) {
        g.beginPath();
        for (let i = 0; i <= 32; i++) { const q = offset(i / 32, 1, fraction); i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y); }
        for (let i = 32; i >= 0; i--) { const q = offset(i / 32, -1, fraction); g.lineTo(q.x, q.y); }
        g.closePath(); g.fillStyle = `rgba(237,145,205,${alpha})`; g.fill();
      }
      for (const sign of [-1, 1]) {
        g.beginPath(); for (let i = 0; i <= 32; i++) { const q = offset(i / 32, sign); i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y); }
        g.strokeStyle = 'rgba(244,180,224,.38)'; g.lineWidth = .8; g.stroke();
      }
      for (let i = 0; i < 7; i++) {
        const u = 1 - (this.clock * .6 + i / 7) % 1, q = carrierArcPoint(curve, t * u), d = arcTangent(curve, t * u);
        g.beginPath(); g.ellipse(q.x, q.y, radius(u) * .94, 2.3 + u * 1.3, Math.atan2(d.y, d.x) + Math.PI / 2, 0, TAU);
        g.strokeStyle = `rgba(246,189,225,${.14 + .3 * Math.sin(u * Math.PI)})`; g.lineWidth = 1.1; g.stroke();
      }
      for (let i = 0; i < 20; i++) {
        const u = 1 - (this.clock * (.45 + i % 3 * .08) + i / 20) % 1, q = offset(u, Math.sin(i * 12.989), .7), d = arcTangent(curve, t * u), n = Math.max(1, Math.hypot(d.x, d.y));
        g.beginPath(); g.moveTo(q.x, q.y); g.lineTo(q.x - d.x / n * 3, q.y - d.y / n * 3); g.strokeStyle = 'rgba(255,224,245,.65)'; g.lineWidth = .8; g.stroke();
      }
      const d = arcTangent(curve, t);
      g.beginPath(); g.ellipse(worker.x, worker.y, radius(1), 5, Math.atan2(d.y, d.x) + Math.PI / 2, 0, TAU); g.strokeStyle = 'rgba(255,210,238,.7)'; g.lineWidth = 1.4; g.stroke();
      g.beginPath(); g.arc(curve.from.x, curve.from.y, 5, 0, TAU); g.fillStyle = 'rgba(255,206,237,.27)'; g.fill();
      g.strokeStyle = '#e0a6d6'; g.lineWidth = 1.6;
      g.beginPath(); g.arc(pose.x, pose.y, 29, -Math.PI / 2, -Math.PI / 2 + TAU * remaining / this.rules.extractSeconds); g.stroke();
      text(g, `0:${String(Math.ceil(remaining)).padStart(2, '0')}`, p.x + c.art.rect.w / 2 + 8, p.y - 12, 12 / this.kitUIScale, '#efb4d1');
    }
    g.restore();
  }
  drawCannon(g, c) {
    const p = PARTS.aCannonBarrel, pose = this.cannonPose(c);
    const base = this.bossPose(), source = this.attack?.sources?.find(s => s.id === c.id && !s.cancelled), age = this.clock - (source?.firedAt ?? -Infinity);
    g.save(); g.beginPath(); g.ellipse(c.x + base.x, c.y + base.y, p.display[0] * .7, p.display[1] * .5, 0, 0, TAU); g.clip();
    if (age >= 0 && age < .14) g.filter = `brightness(${1 + .7 * (1 - age / .14)})`;
    const arrival = this.phase === 'rebuild' ? ease((this.transitionAge - 1.3) / .5) : 1;
    part(g, 'aCannonBarrel', pose.x, pose.y, undefined, undefined, pose.angle, arrival * (c.hp > 0 && this.carrier.hp > 0 ? 1 : .38)); g.restore();
    if (source) drawWeaponMuzzle(g, this.actorPose(c.id), pose.angle + Math.PI / 2, age, 'carrier');
  }
  workerHome(c) {
    const a = c.art, p = PARTS.aPod, win = p.window;
    return { x: a.x + (win[0] + win[2] / 2 - p.pivot[0]) * a.w, y: a.y + (win[1] + win[3] / 2 - p.pivot[1]) * a.h };
  }
  tractorCurve(c, at = this.clock, bend = this.raid?.arcBend) {
    const f = this.fighters.find(f => f.id === this.raid?.fighterId), pose = this.fighterPose(f, at), from = nose(pose), to = this.workerHome(c);
    const dx = to.x - from.x, dy = to.y - from.y, length = Math.max(1, Math.hypot(dx, dy));
    bend ??= f.side * 28;
    const curve = { from, to, control: { x: (from.x + to.x) / 2 - dy / length * bend, y: (from.y + to.y) / 2 + dx / length * bend }, bend };
    const safe = Math.hypot(pose.w / 2, pose.h / 2) + Math.hypot(...PARTS.aWorker.display) / 2 + 2;
    let lo = 0, hi = 1;
    for (let i = 0; i < 16; i++) { const t = (lo + hi) / 2, q = carrierArcPoint(curve, t); if (Math.hypot(q.x - pose.x, q.y - pose.y) < safe) lo = t; else hi = t; }
    return { ...curve, dockT: hi, safe };
  }
  chooseTractorBend(c, f) {
    const cover = this.coverTargets().filter(t => t.id !== c.id);
    for (const bend of [28, 18, 8, -28, -18, -8].map(v => v * f.side)) {
      const clear = [0, this.rules.extractSeconds / 2, this.rules.extractSeconds].every(age => {
        const curve = this.tractorCurve(c, this.clock + age, bend);
        for (let i = 0; i < 12; i++) { const from = carrierArcPoint(curve, i / 12), to = carrierArcPoint(curve, (i + 1) / 12); if (cover.some(t => sweepTarget(from, to, 1.5, t))) return false; }
        return true;
      });
      if (clear) return bend;
    }
    return 8 * f.side;
  }
  workerPose(c) {
    const { x, y } = this.workerHome(c);
    if (this.raid?.targetId === c.id && ['extract', 'captured'].includes(this.raid.stage)) {
      const f = this.fighters.find(f => f.id === this.raid.fighterId), pull = ease((this.clock - this.raid.extractAt - this.rules.extractSeconds + 2) / 2);
      if (f) { const curve = this.tractorCurve(c), curveT = mix(1, curve.dockT, pull); return { ...carrierArcPoint(curve, curveT), pull, curveT, curve }; }
    }
    if (c.returning) { const k = ease((this.clock - c.returning.at) / .35), p = c.returning.curve ? carrierArcPoint(c.returning.curve, mix(c.returning.curveT, 1, k)) : { x: mix(c.returning.x, x, k), y: mix(c.returning.y, y, k) }; return { ...p, pull: 1 - k }; }
    return { x, y, pull: 0 };
  }
  drawCrew(g, c) {
    const a = c.art, p = PARTS.aPod, win = p.window, age = c.releasedAt === null ? -1 : this.clock - c.releasedAt, opened = ease(age / .45), released = ease((age - .45) / 1.5);
    const wx = a.x + (win[0] - p.pivot[0]) * a.w, wy = a.y + (win[1] - p.pivot[1]) * a.h, ww = win[2] * a.w, wh = win[3] * a.h;
    const startX = wx + ww / 2, startY = wy + wh / 2, x = mix(c.rescueFrom?.x ?? startX, this.W + 30, released * released), y = (c.rescueFrom?.y ?? startY) - 75 * ease(released);
    const pulled = c.hp > 0 ? this.workerPose(c) : null;
    const worker = () => part(g, 'aWorker', pulled?.x ?? x, pulled?.y ?? y, undefined, undefined, Math.sin(released * Math.PI) * .12);
    if (!released && !pulled?.pull && !c.rescueFrom) clip(g, startX - mix(ww, a.w, opened) / 2, startY - mix(wh, a.h, opened) / 2, mix(ww, a.w, opened), mix(wh, a.h, opened), worker);
    for (const sign of [-1, 1]) clip(g, sign < 0 ? a.x - a.w / 2 : a.x, a.y - a.h / 2, a.w / 2, a.h, () => part(g, 'aPod', a.x + sign * opened * a.w * .55, a.y, a.w, a.h));
    if (c.hp > 0) { g.fillStyle = 'rgba(105,175,223,.12)'; g.fillRect(wx, wy, ww, wh); for (let i = 0; i < c.maxHP; i++) { g.fillStyle = i < c.hp ? '#c8dfef' : '#465168'; g.fillRect(a.rect.x + 4 + i * 5, a.rect.y + a.rect.h - 3, 3, 1.5); } }
    if (released > 0 || pulled?.pull || c.rescueFrom) worker();
    drawTickSecure(g, this, c);
  }
  drawHUD(g) {
    this.drawHUDBase(g);
    if (!Number.isFinite(this.rules.waveSeconds)) return;
    const s = this.kitUIScale, y = this.hudY + 41 / s, x = this.W / 2;
    for (let i = 0; i < this.rules.waves; i++) drawGem(g, i < this.encounterWave ? 'pip_rose' : 'pip_empty', x - 34 / s + i * 10 / s, y, .8 / s);   // wave gems
    const seconds = Math.ceil(this.waveRemaining), label = this.carrier.hp <= 0 ? 'DISABLED' : `JUMP ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
    text(g, label, x + 14 / s, y, 11 / s, this.waveRemaining <= 20 && this.carrier.hp > 0 ? '#f0a3bc' : '#c6c3da', 'center');
  }
  drawGeometry(g) {
    g.save(); g.strokeStyle = '#86eecb'; g.lineWidth = .7;
    for (const t of this.targets()) for (const s of t.shapes) { g.beginPath(); if (s.type === 'rect') g.rect(s.x, s.y, s.w, s.h); else if (s.type === 'circle') g.arc(s.x, s.y, s.r, 0, TAU); else for (const poly of [s.points, ...(s.holes || [])]) { poly.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); } g.stroke(); }
    g.restore();
  }
  inspect() { return { clock: this.clock, pressureClock: this.pressureClock, state: this.state, phase: this.phase, difficulty: this.difficulty.id, encounterWave: this.encounterWave, waveCount: this.rules.waves, waveRemaining: this.waveRemaining, transitionAge: this.transitionAge || 0, archivedCrew: this.archivedCrew.map(c => ({ id: c.id, secured: c.secured, securedAt: c.securedAt })), hp: this.carrier.hp, crew: this.crew.map(c => ({ id: c.id, hp: c.hp, secured: c.secured, securedAt: c.securedAt, releasedAt: c.releasedAt, captured: c.captured, escaped: c.releasedAt !== null && this.clock - c.releasedAt >= 1.95 })), raid: this.raid && { ...this.raid, remaining: this.raid.extractAt === null ? this.rules.extractSeconds : Math.max(0, this.rules.extractSeconds - this.clock + this.raid.extractAt) }, fighters: this.fighters.map(f => ({ id: f.id, hp: f.hp, stage: f.stage, ...this.fighterPose(f) })), targets: this.targets(), attack: this.attack && { ...this.attack }, paddle: { ...this.paddle }, ballRadius: this.ballRadius }; }
  // Continue panel copy: crew pods still locked this wave; progress counts every wave's crew.
  nearMiss() {
    const left = this.crew.filter(c => !c.secured && c.releasedAt === null).length, total = Math.max(1, this.crew.length * this.rules.waves);
    return { line: left ? `${plural(left, 'CREW POD')} LEFT` : 'THE CREW IS ALMOST CLEAR', progress: (this.archivedCrew.length + this.crew.length - left) / total,
      stage: this.rules.waves > 1 ? ['WAVE', this.encounterWave, this.rules.waves] : null };
  }
  result() { const stars = this.state === 'won' ? 1 + (this.lives >= 2 ? 1 : 0) + (this.carrier.hp <= 0 ? 1 : 0) : 0, safe = this.archivedCrew.length + this.crew.filter(c => c.secured).length; return { stars, lines: [['Score', this.score.toLocaleString()], ['Crew safe', `${safe} / ${this.archivedCrew.length + this.crew.length}`], ['Lives left', this.lives]] }; }
}
