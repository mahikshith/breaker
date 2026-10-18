import { Arena } from './arena.js';
import { ART } from './vault-art.js';
import { cached, loadImg, ready, rrect } from './gfx.js';
import { sweepTarget } from './carrier-physics.js';
import { sfx } from './audio.js';

const DATA = ART.carrier;
const PARTS = {};
for (const [id, p] of Object.entries(DATA?.parts || {})) PARTS[id] = { ...p, img: loadImg(p.url) };
const TAU = Math.PI * 2, WAVE = 12, HP = 36;
const clamp = v => Math.max(0, Math.min(1, v));
const ease = v => { v = clamp(v); return v * v * (3 - 2 * v); };
const mix = (a, b, t) => a + (b - a) * t;
const ellipse = (x, y, rx, ry, n = 18) => Array.from({ length: n }, (_, i) => [x + Math.cos(i * TAU / n) * rx, y + Math.sin(i * TAU / n) * ry]);
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
  constructor(W, H, uiScale = 1) {
    super(W, H, { accent: '#68d8ed', top: 68, left: 10, right: 10, minPaddleY: 470, uiScale, paddleWidth: 125, paddleHeight: 17, ballRadius: 7.5 });
    if (!DATA) throw new Error('Carrier artwork must be packed before starting this level');
    this.name = 'Carrier Breakout'; this.subtitle = 'Disable the carrier. Free all five crew.';
    this.phase = 'carrier'; this.clock = 0; this.carrier = { id: 'carrier', hp: HP, maxHP: HP, hurt: 0 };
    this.assembly = DATA.assembly; this.motion = DATA.motion;
    this.bricks = this.assembly.bricks.map(b => ({ ...b, hp: 1, maxHP: 1, hurt: 0, art: fit(b.part, b.rect), payload: DATA.payloads?.[b.id] || null }));
    this.crew = this.assembly.pods.map((p, i) => ({ ...p, id: p.id || `aCrewCell${i}`, hp: 2, maxHP: 2, hurt: 0, releasedAt: null, escaped: false, art: fit('aPod', p.referenceRect) }));
    this.guns = PARTS.aCannonBarrel.mounts.map((p, i) => ({ id: `cannon${i}`, hp: 6, maxHP: 6, x: p[0], y: p[1], hurt: 0, aim: 0 }));
    this.fighters = []; this.bolts = []; this.attack = null; this.nextAttack = 3.2; this.attackIndex = 0; this.wave = -1; this.serial = 0;
    this.debugGeometry = false; this.started = false;
  }
  previewRect() { return { x: 0, y: 78, w: this.W, h: 285 }; }
  world() {
    const targets = this.targets(this.slowT > 0 ? 1 / .68 : 1);
    return { ...super.world(), targets, onTarget: (id, ball, target) => {
      const live = this.hitTarget(id, ball, target);
      if (!live) for (const t of targets) if (t.id === id) t.active = false;
      return live;
    } };
  }
  doorPose(at = this.clock) {
    if (this.carrier.hp <= 0) return 1;
    const t = at % WAVE, m = this.motion.doors;
    return ease((t - m.start) / m.openDuration) * (1 - ease((t - m.closeStart) / m.closeDuration));
  }
  fighterPose(f, at = this.clock) {
    const age = at - f.born, duration = this.motion.fighterLaunch.duration, u = ease(age / duration), exit = ease((age - duration) / 2.3), path = f.path, edgeX = path.end[0] < 160 ? -40 : 400;
    const bay = this.assembly.hangar, [w, h] = path.display || PARTS.aFighter.display;
    return { x: mix(mix(bay.x, path.end[0], u), edgeX, exit), y: mix(mix(bay.y - 9, path.end[1], u), path.end[1] + 85, exit), angle: mix(path.angle * u, edgeX < 0 ? .65 : -.65, exit), w, h, age };
  }
  fighterOffscreen(f, p = this.fighterPose(f)) {
    if (p.age < 0) return false;
    const b = PARTS.aFighter.artBounds, corners = transform([[b[0],b[1]],[b[0]+b[2],b[1]],[b[0]+b[2],b[1]+b[3]],[b[0],b[1]+b[3]]], p.x, p.y, p.w, p.h, p.angle);
    return corners.every(([x]) => x < 0) || corners.every(([x]) => x > this.W) || corners.every(([, y]) => y > this.playClipY);
  }
  cannonPose(c, at = this.clock) {
    const active = this.attack?.id === c.id && c.hp > 0 && this.carrier.hp > 0 ? this.attack : null, age = active ? at - active.started : -1;
    const turn = active ? Math.max(-.25, Math.min(.25, Math.atan2(active.targetX - c.x, this.paddle.y - c.y))) : 0;
    const aim = turn * (age < 1.3 ? ease(age / .35) : 1 - ease((age - 1.3) / .9));
    const recoil = age >= 1.1 && age < 1.3 ? Math.sin((age - 1.1) / .2 * Math.PI) * 5 : 0;
    return { x: c.x - Math.sin(aim) * recoil, y: c.y - Math.cos(aim) * recoil, angle: -aim, age, active };
  }
  targets(rate = 1) {
    const out = [], add = (actor, shapes, extra = {}) => out.push({ id: actor.id, hp: actor.hp, active: actor.hp > 0, shapes, ...extra });
    for (const b of this.bricks) if (b.hp > 0) add(b, [{ type: 'rect', ...b.art.rect }]);
    for (const c of this.crew) if (c.hp > 0) add(c, [{ type: 'rect', ...c.art.rect }]);
    const hull = this.assembly.hull, [hw, hh] = PARTS.aHull.display;
    const bayHole = transform(BAY_HOLE, hull.x, hull.y, hw, hh), hullBody = transform(OUTLINE, hull.x, hull.y, hw, hh);
    if (this.carrier.hp > 0) {
      const holes = [bayHole, ...this.guns.map(c => { const p = this.cannonPose(c); return ellipse(p.x, p.y, 22, 20); })];
      add(this.carrier, [{ type: 'polygon', points: hullBody, holes }]);
      const bay = this.assembly.hangar, pw = bay.w / 2, open = this.doorPose(), next = this.doorPose(this.clock + .001);
      for (const sign of [-1, 1]) {
        const cx = bay.x + sign * (bay.w / 4 + open * bay.doorTravel), x = Math.max(bay.x - bay.w / 2, cx - pw / 2), right = Math.min(bay.x + bay.w / 2, cx + pw / 2);
        if (right - x > .05) add(this.carrier, [{ type: 'rect', x, y: bay.y - bay.h / 2, w: right - x, h: bay.h }], { vx: sign * (next - open) * bay.doorTravel / .001 * rate, vy: 0 });
      }
    } else out.push({ id: 'disabled-carrier', active: true, pierceable: false, shapes: [{ type: 'polygon', points: hullBody, holes: [bayHole] }] });
    for (const c of this.guns) if (this.carrier.hp > 0) {
      const p = this.cannonPose(c), q = this.cannonPose(c, this.clock + .001), shape = { type: 'polygon', points: transform(ellipse(.5, .5, .5, .5), p.x, p.y, 36, 32, p.angle) };
      if (c.hp > 0) add(c, [shape], { vx: (q.x - p.x) / .001 * rate, vy: (q.y - p.y) / .001 * rate });
      else out.push({ id: `disabled-${c.id}`, active: true, pierceable: false, shapes: [shape] });
    }
    for (const f of this.fighters) if (f.hp > 0) {
      const p = this.fighterPose(f); if (p.age < 0 || this.fighterOffscreen(f, p)) continue;
      const q = this.fighterPose(f, this.clock + .001);
      const body = transform(FIGHTER, p.x, p.y, p.w, p.h, p.angle), bay = this.assembly.hangar;
      const rear = clipPolygon(body, transform(BAY_HOLE, hull.x, hull.y, hw, hh)), front = clipPolygon(body, [[-100,bay.mouthY],[this.W+100,bay.mouthY],[this.W+100,this.H],[-100,this.H]]);
      add(f, [rear, front].filter(p => p.length >= 3).map(points => ({ type: 'polygon', points })), { vx: (q.x - p.x) / .001 * rate, vy: (q.y - p.y) / .001 * rate });
    }
    for (const b of this.bolts) if (!b.dead) out.push({ id: b.id, active: true, solid: false, vx: b.vx * rate, vy: b.vy * rate, shapes: [{ type: 'circle', x: b.x, y: b.y, r: b.r }] });
    return out;
  }
  hitTarget(id, b) {
    if (this.state !== 'play' || this.phase !== 'carrier') return false;
    if (id.startsWith('disabled-')) { sfx.wall(); return true; }
    const bolt = this.bolts.find(s => s.id === id);
    if (bolt) { if (!bolt.dead) { bolt.dead = true; this.addScore(20); this.fx.ring(bolt.x, bolt.y, '#ffabd6', 13); sfx.tough(); } return false; }
    const obj = id === 'carrier' ? this.carrier : [...this.bricks, ...this.crew, ...this.guns, ...this.fighters].find(o => o.id === id);
    if (!obj || obj.hp <= 0) return false;
    const brick = this.bricks.includes(obj), crew = this.crew.includes(obj);
    const damage = brick || crew ? b.fire && !b.shot ? obj.hp : 1 : b.shot ? 1 : b.titan > 0 ? 4 : b.fire ? 3 : 1;
    obj.hp = Math.max(0, obj.hp - damage); obj.hurt = .14;
    this.addScore(brick ? 15 : crew ? 35 : 60); sfx.tough(); this.bump(brick ? .04 : .11, brick ? 0 : .018);
    this.fx.ring(b.x, b.y, brick ? '#8ce8f8' : '#f1a1d4', brick ? 10 : 15);
    if (obj.hp <= 0) {
      if (brick || crew) this.brokeBrick();
      if (brick && obj.payload) this.dropPower(obj.art.rect.x + obj.art.rect.w / 2, obj.art.rect.y + obj.art.rect.h, obj.payload);
      if (crew) { obj.releasedAt = this.clock; sfx.power(); }
      if (obj === this.carrier) { this.attack = null; this.bolts.length = 0; this.fx.pop(this.W / 2, 225, 'CARRIER DISABLED', '#c6dcf0', 20); sfx.boom(); this.bump(.5, .08); }
      if (this.attack?.id === id) this.attack = null;
    }
    this.checkGoal(); return obj.hp > 0;
  }
  shotHit(s, previousY = s.y, dt = 0) {
    let first = null;
    for (const target of this.targets()) {
      const hit = sweepTarget({ x: s.x, y: previousY }, s, 2, target, 0, dt);
      if (hit && (!first || hit.t < first.hit.t)) first = { target, hit };
    }
    if (!first) return false;
    this.hitTarget(first.target.id, { x: first.hit.x, y: first.hit.y, shot: true }); return true;
  }
  checkGoal() {
    if (this.phase === 'carrier' && this.carrier.hp <= 0 && this.crew.every(c => c.hp <= 0)) {
      this.phase = 'escape'; this.attack = null; this.bolts.length = this.shots.length = 0; this.aim = null;
      for (const b of this.balls) b.caught = true;
      this.addScore(1800 + this.lives * 300); this.fx.pop(this.W / 2, 235, 'CREW RELEASED!', '#a5f1ef', 24); sfx.win();
    }
  }
  update(dtReal) {
    if (this.state !== 'play') return;
    if (this.phase === 'escape') { this.clock += dtReal; this.fx.update(dtReal, this.drainY); if (this.crew.every(c => this.clock - c.releasedAt >= 1.95)) this.win(); return; }
    super.update(dtReal);
  }
  updateLevel(dt, dtReal = dt) {
    if (this.state !== 'play' || this.phase !== 'carrier' || this.aim?.serve) return;
    if (!this.started) { this.started = true; this.fx.pop(this.W / 2, 405, 'FREE THE CREW', '#c7e9f6', 20); }
    this.clock += dt;
    for (const o of [this.carrier, ...this.guns, ...this.bricks, ...this.crew, ...this.fighters]) o.hurt = Math.max(0, o.hurt - dt);
    const wave = Math.floor(this.clock / WAVE);
    if (wave !== this.wave && this.carrier.hp > 0) { this.wave = wave; for (const [i, path] of this.assembly.fighterPaths.entries()) this.fighters.push({ id: `fighter${wave}-${i}`, born: wave * WAVE + path.delay, path, hp: 2, maxHP: 2, hurt: 0 }); }
    this.fighters = this.fighters.filter(f => f.hp > 0 && !this.fighterOffscreen(f));
    if (!this.attack && this.clock >= this.nextAttack && this.carrier.hp > 0) {
      const fighter = this.fighters.find(f => this.clock - f.born > 1.1 && this.clock - f.born < 2.1), guns = this.guns.filter(c => c.hp > 0);
      const source = fighter || guns[this.attackIndex % Math.max(1, guns.length)];
      this.nextAttack = this.clock + 4; this.attackIndex++;
      if (source) this.attack = { id: source.id, started: this.clock, targetX: this.paddle.x, fired: false };
    }
    if (this.attack) {
      const source = this.actorPose(this.attack.id);
      if (!source) this.attack = null;
      else if (!this.attack.fired && this.clock - this.attack.started >= 1.1) {
        const angle = Math.max(-.25, Math.min(.25, Math.atan2(this.attack.targetX - source.x, this.paddle.y - source.y)));
        this.bolts.push({ id: `bolt${this.serial++}`, x: source.x, y: source.y + 6, vx: Math.sin(angle) * 215, vy: Math.cos(angle) * 215, r: 3.5, dead: false });
        this.attack.fired = true; sfx.zap();
      } else if (this.attack.fired && this.clock - this.attack.started > 2.2) this.attack = null;
    }
    this.updateBolts(dt, dtReal);
  }
  actorPose(id) {
    const c = this.guns.find(c => c.id === id && c.hp > 0); if (c) return this.cannonPose(c);
    const f = this.fighters.find(f => f.id === id && f.hp > 0); if (!f) return null;
    const p = this.fighterPose(f); return p.age >= 0 && !this.fighterOffscreen(f, p) ? { x: p.x, y: p.y + p.h * .4 } : null;
  }
  updateBolts(dt, dtReal = dt) {
    for (const s of this.bolts) {
      if (s.dead) continue;
      const from = { x: s.x, y: s.y }, to = { x: s.x + s.vx * dt, y: s.y + s.vy * dt };
      let cover = null;
      const coverShapes = [...this.bricks, ...this.crew].filter(b => b.hp > 0).map(b => ({ shapes: [{ type: 'rect', ...b.art.rect }] }));
      for (const t of this.targets()) if (t.id === 'carrier' && t.shapes.some(s => s.type === 'rect')) coverShapes.push(t);
      for (const shape of coverShapes) { const hit = sweepTarget(from, to, s.r, shape); if (hit && (!cover || hit.t < cover.t)) cover = hit; }
      if (cover) { s.dead = true; this.fx.ring(cover.x, cover.y, '#c9a2c8', 8); continue; }
      // Caught balls still visibly intercept a shot before it can touch the paddle.
      let intercepted = false;
      for (const b of this.balls) if (!b.dead && b.caught && sweepTarget(from, to, s.r, { vx: this.paddle.vx * dtReal / dt, shapes: [{ type: 'circle', x: b.x - this.paddle.vx * dtReal, y: b.y, r: b.r }] }, 0, dt)) { s.dead = true; this.addScore(20); this.fx.ring(b.x, b.y, '#f3a4d5', 12); intercepted = true; break; }
      if (intercepted) continue;
      const p = this.paddle, hit = sweepTarget(from, to, s.r, { vx: p.vx * dtReal / dt, shapes: [{ type: 'rect', x: p.x - p.vx * dtReal - p.w / 2, y: p.y, w: p.w, h: p.h }] }, 0, dt);
      s.x = to.x; s.y = to.y;
      if (hit) { s.dead = true; p.stun = .7; this.fx.pop(p.x, p.y - 22, 'ZAPPED', '#f0a3c1', 13); sfx.hurt(); this.bump(.25, .03); }
      if (s.y - s.r > this.drainY || s.x < -20 || s.x > this.W + 20) s.dead = true;
    }
    this.bolts = this.bolts.filter(s => !s.dead);
  }
  loseBall() { super.loseBall(); this.bolts.length = 0; this.attack = null; this.nextAttack = this.clock + 3; }
  continueRun() { this.balls.length = 0; this.aim = null; this.bolts.length = 0; this.attack = null; this.nextAttack = this.clock + 3; super.continueRun(); }

  drawPaddleArt(g, p) { const a = fit('aPaddle', [p.x - p.w / 2, p.y, p.w, p.h]); part(g, 'aPaddle', a.x, a.y, a.w, a.h); }
  drawBalls(g) {
    this.drawShots(g);
    for (const b of this.balls) {
      if (this.phase === 'escape') continue;
      if (b.fire || b.titan > 0) { g.strokeStyle = b.fire ? '#f3a76e' : '#e6a1ec'; g.lineWidth = 2; g.beginPath(); g.arc(b.x, b.y, b.r + 3, 0, TAU); g.stroke(); }
      const a = fit('ball', [b.x - b.r, b.y - b.r, b.r * 2, b.r * 2]); part(g, 'ball', a.x, a.y, a.w, a.h);
    }
  }
  drawDrops(g) {
    for (const d of this.drops) { const id = `capsule_${d.kind}`; if (!PARTS[id]) continue; const a = fit(id, [d.x - 18, d.y - 9, 36, 18]); part(g, id, a.x, a.y, a.w, a.h); }
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
    const bay = this.assembly.hangar, hull = this.assembly.hull;
    for (const f of this.fighters) this.drawFighter(g, f, false);
    part(g, 'aHull', hull.x, hull.y);
    const open = this.doorPose(), pw = bay.w / 2;
    clip(g, bay.x - bay.w / 2, bay.y - bay.h / 2, bay.w, bay.h, () => { part(g, 'aDoorLeft', bay.x - pw / 2 - open * bay.doorTravel, bay.y); part(g, 'aDoorRight', bay.x + pw / 2 + open * bay.doorTravel, bay.y); });
    if (this.carrier.hp <= 0) { const h = PARTS.aHull.display[1]; g.fillStyle = 'rgba(8,12,24,.88)'; g.beginPath(); g.arc(hull.x, hull.y - h * .16, 9.5, 0, TAU); g.fill(); }
    for (const f of this.fighters) this.drawFighter(g, f, true);
    for (const c of this.guns) this.drawCannon(g, c);
    for (const b of this.bricks) if (b.hp > 0) { const a = b.art; part(g, b.part, a.x, a.y, a.w, a.h, 0, b.hurt > 0 ? .65 : 1); if (b.payload) { const p = fit(`capsule_${b.payload}`, [a.rect.x + a.rect.w / 2 - 9, a.rect.y + a.rect.h / 2 - 4.5, 18, 9]); part(g, `capsule_${b.payload}`, p.x, p.y, p.w, p.h); } }
    for (const c of this.crew) this.drawCrew(g, c);
    g.save(); g.beginPath(); g.rect(0, 0, this.W, this.playClipY); g.clip();
    for (const s of this.bolts) { g.strokeStyle = '#ef9acc'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(s.x, s.y - 5); g.lineTo(s.x, s.y + 5); g.stroke(); g.strokeStyle = '#fff1fa'; g.lineWidth = 1.7; g.stroke(); }
    this.drawDrops(g); if (this.state === 'play') this.fx.draw(g); g.restore();
    this.drawPaddle(g); this.drawBalls(g); this.drawAim(g); this.drawHUD(g);
    if (this.debugGeometry) this.drawGeometry(g);
  }
  drawFighter(g, f, front) {
    const p = this.fighterPose(f); if (f.hp <= 0 || p.age < 0 || this.fighterOffscreen(f, p)) return;
    const draw = () => { for (const [u, v] of PARTS.aFighter.thrusterPorts) { const dx = (u - .5) * p.w, dy = (v - .5) * p.h, x = p.x + dx * Math.cos(p.angle) - dy * Math.sin(p.angle), y = p.y + dx * Math.sin(p.angle) + dy * Math.cos(p.angle), k = 7 * (1 + .03 * Math.sin(this.clock * 31)); part(g, 'aThruster', x, y, k, k * PARTS.aThruster.display[1] / PARTS.aThruster.display[0], Math.PI + p.angle); } part(g, 'aFighter', p.x, p.y, p.w, p.h, p.angle, f.hurt > 0 ? .6 : 1); };
    const b = this.assembly.hangar;
    if (front) clip(g, -50, b.mouthY, this.W + 100, this.H, draw); else clip(g, b.x - b.w / 2, b.y - b.h / 2, b.w, b.h, draw);
    if (front && this.attack?.id === f.id && !this.attack.fired) this.drawWarning(g, p.x, p.y + p.h * .4);
  }
  drawWarning(g, x, y) { g.strokeStyle = '#f2b0d5'; g.lineWidth = 1.8; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(x - 3 - i, y + 7 + i * 5); g.lineTo(x + 3 + i, y + 7 + i * 5); g.stroke(); } }
  drawCannon(g, c) {
    const p = PARTS.aCannonBarrel, pose = this.cannonPose(c), active = pose.active;
    g.save(); g.beginPath(); g.ellipse(c.x, c.y, p.display[0] * .7, p.display[1] * .5, 0, 0, TAU); g.clip();
    part(g, 'aCannonBarrel', pose.x, pose.y, undefined, undefined, pose.angle, c.hp > 0 && this.carrier.hp > 0 ? 1 : .38); g.restore();
    if (active && !active.fired) this.drawWarning(g, pose.x, pose.y);
  }
  drawCrew(g, c) {
    const a = c.art, p = PARTS.aPod, win = p.window, age = c.releasedAt === null ? -1 : this.clock - c.releasedAt, opened = ease(age / .45), released = ease((age - .45) / 1.5);
    const wx = a.x + (win[0] - p.pivot[0]) * a.w, wy = a.y + (win[1] - p.pivot[1]) * a.h, ww = win[2] * a.w, wh = win[3] * a.h;
    const startX = wx + ww / 2, startY = wy + wh / 2, x = mix(startX, this.W + 30, released * released), y = startY - 75 * ease(released);
    const worker = () => part(g, 'aWorker', x, y, undefined, undefined, Math.sin(released * Math.PI) * .12);
    if (!released) clip(g, startX - mix(ww, a.w, opened) / 2, startY - mix(wh, a.h, opened) / 2, mix(ww, a.w, opened), mix(wh, a.h, opened), worker);
    for (const sign of [-1, 1]) clip(g, sign < 0 ? a.x - a.w / 2 : a.x, a.y - a.h / 2, a.w / 2, a.h, () => part(g, 'aPod', a.x + sign * opened * a.w * .55, a.y, a.w, a.h));
    if (c.hp > 0) { g.fillStyle = 'rgba(105,175,223,.12)'; g.fillRect(wx, wy, ww, wh); if (c.hp === 1) { g.strokeStyle = '#af88a4'; g.lineWidth = 1; g.beginPath(); g.moveTo(a.rect.x + 3, a.rect.y + 2); g.lineTo(a.rect.x + 8, a.rect.y + 5); g.lineTo(a.rect.x + 5, a.rect.y + 9); g.stroke(); } }
    if (released > 0) worker();
  }
  drawHUD(g) {
    const s = this.kitUIScale, x = 64 / s, y = this.hudY + 35 / s, w = this.W - 180 / s, h = 3 / s;
    g.fillStyle = 'rgba(255,255,255,.13)'; rrect(g, x, y - h / 2, w, h, h / 2); g.fill();
    const f = Math.max(0, this.carrier.hp / HP); if (f > 0) { g.fillStyle = '#df86b8'; rrect(g, x, y - h / 2, Math.max(h, w * f), h, h / 2); g.fill(); }
    this.drawHUDBase(g);
  }
  drawGeometry(g) {
    g.save(); g.strokeStyle = '#86eecb'; g.lineWidth = .7;
    for (const t of this.targets()) for (const s of t.shapes) { g.beginPath(); if (s.type === 'rect') g.rect(s.x, s.y, s.w, s.h); else if (s.type === 'circle') g.arc(s.x, s.y, s.r, 0, TAU); else for (const poly of [s.points, ...(s.holes || [])]) { poly.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); } g.stroke(); }
    g.restore();
  }
  inspect() { return { clock: this.clock, state: this.state, phase: this.phase, hp: this.carrier.hp, crew: this.crew.map(c => ({ id: c.id, hp: c.hp, escaped: c.releasedAt !== null && this.clock - c.releasedAt >= 1.95 })), targets: this.targets(), attack: this.attack && { ...this.attack }, paddle: { ...this.paddle }, ballRadius: this.ballRadius }; }
  result() { const stars = this.state === 'won' ? 1 + (this.lives >= 2 ? 1 : 0) + (this.lives >= 3 && this.bestCombo >= 10 ? 1 : 0) : 0; return { stars, lines: [['Score', this.score.toLocaleString()], ['Crew freed', `${this.crew.filter(c => c.hp <= 0).length} / 5`], ['Lives left', this.lives]] }; }
}
