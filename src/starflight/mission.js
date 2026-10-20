import { Starflight, STARFLIGHT_POWERS, sweptCircle } from './model.js';
import { SHIPS, PLAYER_EDGE, shipPoint, shipCircles } from './geometry.js';

const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const MISSION_POWERS = { ...STARFLIGHT_POWERS, storm: 5.15, ricochet: 5.2 };
export const MISSION_PLAYER_NOSE = [.5, 20 / 288];
export const STORM_TIPS = { left: [...SHIPS.player.muzzles[0]], right: [...SHIPS.player.muzzles[1]] };
export const STORM_WINGS = [
  { side: -1, pivot: [.40625, .5694444444444444], neutralOffset: [-4.875, 3.25], tipOffset: [-3.0225, -15.984019370460048], engineOffset: [-4.7775, 12.801694915254238] },
  { side: 1, pivot: [.59375, .5694444444444444], neutralOffset: [4.875, 3.25], tipOffset: [3.2175, -15.984019370460048], engineOffset: [3.705, 12.801694915254238] },
];
export function wingPoint(pose, offset) {
  return { x: pose.x + offset[0] * Math.cos(pose.angle) - offset[1] * Math.sin(pose.angle),
    y: pose.y + offset[0] * Math.sin(pose.angle) + offset[1] * Math.cos(pose.angle) };
}
export function droneMuzzle(drone) {
  return wingPoint({ x: drone.x, y: drone.y, angle: -Math.PI / 2 + Math.sin(drone.angle) * .12 }, [5.28, 1.2]);
}
const SUPPLIES = ['storm', 'ricochet', 'seeker', 'spiral', 'drones', 'laser', 'hyper', 'stasis', 'nova'];
const GROUPS = [
  { beat: 'approach', title: 'The blocked gate', objective: 'Break the patrol', actors: ['scout', 'scout'] },
  { beat: 'approach', title: 'Interceptors regroup', objective: 'Clear the interceptors', actors: ['beetle', 'beetle', 'beetle', 'beetle'] },
  { beat: 'approach', title: 'Missile escort', objective: 'Break the escort', actors: ['scout', 'frigate', 'frigate', 'scout'] },
  { beat: 'approach', title: 'The crossing screen', objective: 'Break the returning flank', actors: ['beetle', 'scout', 'beetle', 'scout', 'beetle'] },
  { beat: 'debris', title: 'Wreck corridor', objective: 'Clear the debris guards', actors: ['beetle', 'frigate', 'beetle'], rocks: 3 },
  { beat: 'debris', title: 'Armed recovery tugs', objective: 'Clear the recovery lane', actors: ['beetle', 'gunship', 'gunship', 'beetle'], rocks: 2 },
  { beat: 'debris', title: 'Recovery pocket', objective: 'Break the second patrol', actors: ['frigate', 'beetle', 'frigate'], rocks: 3 },
  { beat: 'battery', title: 'Interdiction leaders', objective: 'Silence the missile racks', actors: ['scout', 'captain', 'captain', 'scout'] },
  { beat: 'battery', title: 'Gate batteries', objective: 'Disable the three batteries', actors: ['battery', 'battery', 'battery'] },
  { beat: 'command', title: 'Command ship', objective: 'Break command and open the gate', actors: ['command'] },
];

function firstContact(s, enemy, segment = { x1: s.px, y1: s.py, x2: s.x, y2: s.y, t0: 0, t1: 1 }) {
  const old = enemy.previousBody, now = enemy.body;
  let first = null;
  for (let i = 0; i < now.length; i++) {
    const a = old[i], b = now[i], t = sweptCircle(segment.x1, segment.y1, segment.x2, segment.y2,
      a.x + (b.x - a.x) * segment.t0, a.y + (b.y - a.y) * segment.t0,
      a.x + (b.x - a.x) * segment.t1, a.y + (b.y - a.y) * segment.t1, s.r + b.r);
    if (t !== null && (first === null || t < first)) first = t;
  }
  return first;
}

// A moving horizontal capsule: linear strip inequalities plus both swept end caps.
function bandContact(band, previous, current, radius) {
  let lo = 0, hi = 1;
  const clip = (a, b) => {
    if (a < 0 && b < 0) return false;
    if (a < 0) lo = Math.max(lo, a / (a - b));
    else if (b < 0) hi = Math.min(hi, a / (a - b));
    return lo <= hi;
  };
  const r = radius + band.r, y0 = previous.y - band.py, y1 = current.y - band.y;
  const strip = clip(r - y0, r - y1) && clip(r + y0, r + y1)
    && clip(previous.x - band.px1, current.x - band.x1) && clip(band.px2 - previous.x, band.x2 - current.x);
  return strip || sweptCircle(previous.x, previous.y, current.x, current.y, band.px1, band.py, band.x1, band.y, r) !== null
    || sweptCircle(previous.x, previous.y, current.x, current.y, band.px2, band.py, band.x2, band.y, r) !== null;
}

export class StarflightMission extends Starflight {
  constructor(options = {}) {
    super(options);
    const mode = this.difficulty === 'easy' ? 0 : this.difficulty === 'hard' ? 2 : 1;
    this.missionMode = mode;
    this.rules = { ...this.rules, hp: [6, 5, 4][mode], speed: [175, 205, 235][mode], warning: [1.4, 1.2, 1.05][mode], cooldown: [3.6, 3.1, 2.7][mode], shotCap: [18, 24, 30][mode] };
    this.player.hp = this.player.maxHP = this.rules.hp;
    this.stocks = Object.fromEntries(Object.keys(MISSION_POWERS).map(id => [id, 0]));
    this.timers.storm = 0; this.timers.ricochet = 0; this.storm = null;
    this.mission = { id: 'gatebreak', beat: 'approach', title: 'The blocked gate', objective: 'Break the patrol', group: -1,
      progress: 0, required: 2, elapsed: 0, restRemaining: 0, kills: 0, suppliesEarned: 0, comboSpent: false, combinations: 0, events: [] };
    this.world = { gate: { x: this.width / 2, y: 70, r: 72, open: 0, locked: true },
      blockade: { remaining: 3, batteries: [], disabled: [] }, routeProgress: 0 };
    this.requiredEnemies = new Set(); this.completedEnemies = new Set();
    this.eligibleDestructions = 0; this.capsuleIndex = 0; this.firstRockSupply = false;
    this.groupCleared = false; this.nextGroupAt = .8;
    this.combination = null; this.salvoAt = 0;
  }

  resize(width, height) {
    if (!Number.isFinite(width) || !Number.isFinite(height) || width < 260 || height < 360) return false;
    const sx = width / this.width, sy = height / this.height;
    const point = p => { if (!p) return; if (Number.isFinite(p.x)) p.x *= sx; if (Number.isFinite(p.y)) p.y *= sy;
      if (Number.isFinite(p.px)) p.px *= sx; if (Number.isFinite(p.py)) p.py *= sy; };
    const direction = a => Math.atan2(Math.sin(a) * sy, Math.cos(a) * sx);
    this.width = width; this.height = height;
    const p = this.player, moving = p.moving; point(p); p.targetX *= sx; p.targetY *= sy;
    p.x = clamp(p.x, PLAYER_EDGE, width - PLAYER_EDGE); p.y = clamp(p.y, height * .35, height - 38); p.px = p.x; p.py = p.y;
    for (const e of this.enemies) {
      point(e); e.baseX *= sx; point(e.entryFrom);
      if (Number.isFinite(e.commitX)) e.commitX *= sx; if (Number.isFinite(e.commitY)) e.commitY *= sy;
      e.body = shipCircles(e.ship, e.x, e.y, e.angle); e.previousBody = shipCircles(e.ship, e.px, e.py, e.previousAngle);
      if (e.warning) {
        e.warning.targetX *= sx; e.warning.targetY *= sy;
        for (const s of e.warning.sources) { s.from = shipPoint(e.ship, e.x, e.y, e.angle, SHIPS[e.ship].muzzles[s.port]); s.angle = direction(s.angle); s.angles = s.angles.map(direction); }
        Object.assign(e.warning, { from: e.warning.sources[0].from, angle: e.warning.sources[0].angle, angles: e.warning.sources[0].angles });
      }
    }
    for (const list of [this.hazards, this.pickups, this.drones, this.fields, this.effects]) for (const item of list) point(item);
    for (const s of this.shots) {
      point(s); point(s.from); for (const t of s.trail || []) point(t);
      for (const q of s.segments || []) { q.x1 *= sx; q.x2 *= sx; q.y1 *= sy; q.y2 *= sy; }
    }
    if (this.storm) {
      point(this.storm.origin); for (const q of this.storm.returnFrom || []) point(q);
      for (let i = 0; i < 2; i++) { const w = this.storm.wings[i]; point(w); w.tip = wingPoint(w, STORM_WINGS[i].tipOffset); }
      const [a, b] = this.storm.wings;
      if (this.storm.band) Object.assign(this.storm.band, { x1: a.tip.x, x2: b.tip.x, y: (a.tip.y + b.tip.y) / 2,
        px1: wingPoint({ x: a.px, y: a.py, angle: a.angle }, STORM_WINGS[0].tipOffset).x,
        px2: wingPoint({ x: b.px, y: b.py, angle: b.angle }, STORM_WINGS[1].tipOffset).x,
        py: (wingPoint({ x: a.px, y: a.py, angle: a.angle }, STORM_WINGS[0].tipOffset).y + wingPoint({ x: b.px, y: b.py, angle: b.angle }, STORM_WINGS[1].tipOffset).y) / 2 });
    }
    point(this.combination); for (const q of this.combination?.sourcePoses || []) point(q);
    for (const event of this.mission.events) point(event);
    point(this.world.gate);
    if (this.controlReserve) this.setControlReserve({ x: this.controlReserve.x * sx, y: this.controlReserve.y * sy, r: this.controlReserve.r * Math.min(sx, sy) });
    this.setTarget(p.targetX, p.targetY); p.moving = moving;
    return true;
  }

  canActivate(id, { ignorePause = false } = {}) {
    const afterNova = this.shots.filter(s => s.side !== 'enemy' || Math.hypot(s.x - this.player.x, s.y - this.player.y) > 150).length;
    const capacity = id === 'nova' ? afterNova <= 160 : id === 'ricochet' ? this.shots.length < 180
      : id === 'spiral' ? this.shots.length <= 177 && this.shots.filter(s => s.kind === 'salvo').length <= 6
        : id === 'seeker' ? this.shots.length <= 178 && this.shots.filter(s => s.kind === 'seeker').length < 6
          : id === 'laser' || id === 'hyper' ? this.shots.length <= (id === 'hyper' ? 175 : 178) : true;
    return Object.hasOwn(MISSION_POWERS, id) && (ignorePause || !this.paused) && this.state === 'play' && this.phase !== 'jump'
      && this.mission.restRemaining <= 0 && !this.storm && this.timers[id] <= 0
      && (id !== 'storm' || !Object.keys(MISSION_POWERS).some(key => key !== 'storm' && this.timers[key] > 0))
      && !(id === 'laser' && this.timers.hyper > 0 || id === 'hyper' && this.timers.laser > 0) && capacity
      && (this.stocks[id] > 0 || this.charge >= 100 - 1e-7);
  }
  activate(id) {
    if (!this.canActivate(id)) return false;
    if (this.stocks[id]) this.stocks[id]--; else { this.charge = 0; this.chargeBank = 0; }
    this.timers[id] = MISSION_POWERS[id];
    const p = this.player;
    if (id === 'seeker') this.seekerCooldown = 0;
    if (id === 'spiral') this.salvoAt = this.time;
    if (id === 'drones') this.drones = [0, 1].map(i => ({ id: ++this.serial, x: p.x, y: p.y, px: p.x, py: p.y, r: 6, hp: 2, maxHP: 2, age: 0, angle: i * Math.PI, fireAt: this.time + .3 + i * .22 }));
    if (id === 'nova') {
      this.shots = this.shots.filter(s => s.side !== 'enemy' || Math.hypot(s.x - p.x, s.y - p.y) > 150);
      for (let i = 0; i < 20 && this.shots.length < 180; i++) this.addShot(p.x, p.y, i * TAU / 20, 470, 5, 'player', 'nova', 3, true, 2);
    }
    if (id === 'storm') {
      this.shots = this.shots.filter(s => s.side !== 'player'); this.drones = [];
      this.fireCooldown = .16; this.seekerCooldown = .85;
      this.storm = { age: 0, life: MISSION_POWERS.storm, stage: 'split', origin: { x: p.x, y: p.y, angle: p.angle },
        wings: STORM_WINGS.map(meta => { const q = wingPoint(p, meta.neutralOffset); return { side: meta.side, ...q, px: q.x, py: q.y, angle: p.angle }; }), hit: new Set(), band: null };
    }
    if (id === 'ricochet' && this.shots.length < 180) {
      const from = shipPoint('player', p.x, p.y, p.angle, MISSION_PLAYER_NOSE);
      const shot = this.addShot(from.x, from.y, -Math.PI / 2 + p.angle + (this.random() < .5 ? -.66 : .66), 740, 6, 'player', 'ricochet', 3, true, 1);
      Object.assign(shot, { from, owner: 'player', port: 'nose', life: MISSION_POWERS.ricochet, bounces: 0, maxBounces: 8, hitTimes: new Map(), damageByTarget: new Map(), touching: new Set(), segments: [], trail: [] });
    }
    this.effect(p.x, p.y, id, .55); return true;
  }

  step(dt) {
    const parkedRapid = this.storm ? this.timers.rapid : null;
    if (this.mission.restRemaining > 0) {
      this.time += dt; this.movePlayer(dt); this.movePickups(dt); this.updateDrones(dt, false);
      this.timers.storm = Math.max(0, this.timers.storm - dt); this.updateStorm(dt, false);
      for (const e of this.effects) e.age += dt;
      this.effects = this.effects.filter(e => e.age < e.life);
      this.mission.restRemaining = Math.max(0, this.mission.restRemaining - dt);
      if (!this.mission.restRemaining) this.startGroup(this.mission.group + 1);
    } else {
      if (this.phase === 'jump') this.updateStorm(dt, false);
      super.step(dt);
      if (this.state === 'play' && this.phase !== 'jump') this.finishCombination();
    }
    if (parkedRapid !== null) this.timers.rapid = Math.max(this.timers.rapid, parkedRapid);
    this.mission.elapsed = this.time;
    this.world.routeProgress = clamp((this.mission.group + this.mission.progress / Math.max(1, this.mission.required)) / GROUPS.length, 0, 1);
    if (this.phase === 'jump') this.world.gate.open = Math.min(1, this.world.gate.open + dt * .7);
  }

  schedule() {
    if (this.mission.group < 0) { if (this.time >= this.nextGroupAt) this.startGroup(0); return; }
    if (!this.groupCleared || this.phase === 'jump') return;
    this.groupCleared = false; this.shots = []; this.warnings = []; this.hazards = []; this.fields = [];
    this.mission.restRemaining = 2.2;
    this.mission.objective = this.world.blockade.remaining === 0 ? 'The blockade is down' : 'Route cleared';
    this.effect(this.width / 2, 100, 'jump', .8);
  }

  startGroup(index) {
    const group = GROUPS[index];
    if (!group) return;
    this.mission.group = index; this.mission.beat = group.beat; this.mission.title = group.title; this.mission.objective = group.objective;
    this.mission.progress = 0; this.mission.required = group.actors.length; this.requiredEnemies.clear();
    this.mission.comboSpent = false; this.combination = null;
    this.phase = group.beat === 'command' ? 'boss' : 'combat';
    for (let i = 0; i < group.actors.length; i++) {
      const type = group.actors[i], kind = type === 'command' ? 'boss' : ['frigate', 'battery', 'gunship', 'captain'].includes(type) ? 'gunship' : 'scout';
      const x = group.actors.length === 1 ? this.width / 2 : (i + .7) * this.width / (group.actors.length + .4);
      const family = type === 'command' ? 'crescent' : type === 'battery' || type === 'captain' ? 'frigate' : type;
      const e = this.spawnEnemy(kind, x, -SHIPS[family].height / 2 - i * 24, i, family);
      const hp = type === 'command' ? [360, 440, 520][this.missionMode] : type === 'battery' ? [64, 78, 92][this.missionMode]
        : type === 'captain' ? [48, 58, 68][this.missionMode] : type === 'frigate' || type === 'gunship' ? [36, 44, 52][this.missionMode]
          : type === 'beetle' ? [15, 18, 21][this.missionMode] : [12, 14, 17][this.missionMode];
      Object.assign(e, { hp, maxHP: hp, missionType: type, motionAge: 0, entryFrom: { x: e.x, y: e.y }, disabledPorts: [], capability: 'full',
        flightStage: 'entry', maneuverAt: this.time, crossSide: i % 2 ? -1 : 1, fireAt: this.time + 3 + i * .45, objectiveIds: [e.id], lastHitAt: this.time });
      this.requiredEnemies.add(e.id);
      if (type === 'battery') this.world.blockade.batteries.push(e.id);
    }
    for (let i = 0; i < (group.rocks || 0); i++) {
      const r = 17 + i * 4, hp = [10, 12, 14][this.missionMode], x = (i + 1) * this.width / (group.rocks + 1);
      this.hazards.push({ id: ++this.serial, kind: 'asteroid', x, y: -50 - i * 100, px: x, py: -50 - i * 100, vx: i % 2 ? -12 : 12, vy: 48, r, hp, maxHP: hp, angle: this.random() * TAU, spin: .25 * (i % 2 ? -1 : 1), hurt: 0 });
    }
  }

  moveEnemies(dt) {
    this.prepareCombination();
    let charging = this.enemies.filter(e => e.warning).length;
    for (const e of this.enemies) {
      if (e.hp <= 0) continue;
      e.px = e.x; e.py = e.y; e.previousAngle = e.angle; e.previousBody = e.body;
      e.motionAge += dt; e.hurt = Math.max(0, e.hurt - dt);
      const boss = e.kind === 'boss', gun = e.kind === 'gunship', shape = SHIPS[e.ship], entry = 2 + e.route * .28;
      const holdY = boss ? 123 : gun ? this.height * .17 + e.route % 2 * 43 : this.height * .17;
      let targetX = e.baseX, targetY = holdY;
      if (e.motionAge < entry) {
        const t = e.motionAge / entry, ease = t * t * (3 - 2 * t);
        targetY = e.entryFrom.y + (holdY - e.entryFrom.y) * ease;
      } else {
        e.entered = true;
        const a = (e.motionAge - entry) * (boss ? .55 : gun ? .75 : .75 + e.route * .035), ramp = Math.min(1, (e.motionAge - entry) / .6);
        if (gun || boss) {
          targetX += Math.sin(a) * (boss ? this.width * .18 : 18) * ramp; targetY += Math.sin(a * .7) * 9;
          e.flightStage = 'hold';
        } else if (e.ship === 'scout') {
          if (e.flightStage === 'entry') { e.flightStage = 'rally'; e.maneuverAt = this.time; }
          if (e.flightStage === 'rally' && this.time - e.maneuverAt >= 1.1 + e.route % 2 * .2) {
            e.flightStage = 'commit'; e.maneuverAt = this.time; e.commitX = clamp(this.player.x, 38, this.width - 38); e.commitY = this.height * .55;
          }
          if (e.flightStage === 'commit' && this.time - e.maneuverAt >= .65) { e.flightStage = 'dive'; e.maneuverAt = this.time; }
          if (e.flightStage === 'dive') {
            targetX = e.commitX; targetY = e.commitY;
            if (Math.hypot(targetX - e.x, targetY - e.y) < 18 || this.time - e.maneuverAt > 3.8) { e.flightStage = 'return'; e.maneuverAt = this.time; }
          }
          if (e.flightStage === 'return') {
            targetX = e.commitX < this.width / 2 ? 38 : this.width - 38;
            if (this.time - e.maneuverAt > 3.5) { e.flightStage = 'rally'; e.maneuverAt = this.time; }
          }
        } else {
          if (e.flightStage === 'entry') { e.flightStage = 'cross'; e.maneuverAt = this.time; }
          targetX = this.width / 2 + e.crossSide * (this.width / 2 - 38);
          targetY = e.flightStage === 'cross' ? this.height * (.31 + e.route % 2 * .075) : holdY;
          if (e.flightStage === 'cross' && (Math.hypot(targetX - e.x, targetY - e.y) < 16 || this.time - e.maneuverAt > 4)) {
            e.flightStage = 'regroup'; e.maneuverAt = this.time;
          } else if (e.flightStage === 'regroup' && this.time - e.maneuverAt > 2.2) {
            e.crossSide *= -1; e.flightStage = 'cross'; e.maneuverAt = this.time;
          }
        }
      }
      const margin = boss ? shape.width * .51 + 5 : gun ? shape.width * .56 + 6 : 31;
      if (this.combination && ['warning', 'dock'].includes(this.combination.stage) && this.combination.ids.includes(e.id)) {
        const side = this.combination.ids.indexOf(e.id) ? 1 : -1;
        targetX = this.combination.x + side * (this.combination.stage === 'warning' ? 35 : 12); targetY = this.combination.y;
        e.flightStage = this.combination.stage === 'warning' ? 'combineWarning' : 'combining'; e.warning = null; e.fireAt = this.time + 2;
      }
      targetX = clamp(targetX, margin, this.width - margin);
      e.vx += ((targetX - e.x) * 26 - e.vx * 10) * dt; e.vy += ((targetY - e.y) * 26 - e.vy * 10) * dt;
      const speed = Math.hypot(e.vx, e.vy), max = boss ? 68 : gun ? 80 : 132;
      if (speed > max) { e.vx *= max / speed; e.vy *= max / speed; }
      e.x += e.vx * dt; e.y += e.vy * dt;
      const facing = !gun && !boss && speed > 8 ? Math.atan2(e.vy, e.vx) - Math.PI / 2 : clamp(e.vx * .0025, -.24, .24);
      e.angle += clamp(Math.atan2(Math.sin(facing - e.angle), Math.cos(facing - e.angle)), -dt * 2.8, dt * 2.8);
      e.body = shipCircles(e.ship, e.x, e.y, e.angle);
      const inside = e.body.every(c => c.x - c.r > 0 && c.x + c.r < this.width && c.y - c.r > 0 && c.y + c.r < this.height * .65);
      if (e.warning) {
        e.warning.age += dt;
        for (const source of e.warning.sources) source.from = shipPoint(e.ship, e.x, e.y, e.angle, shape.muzzles[source.port]);
        e.warning.from = e.warning.sources[0].from;
        if (!inside || !gun && !boss && Math.cos(e.angle) <= .4 || e.warning.sources.some(s => e.disabledPorts.includes(s.port))) { e.warning = null; charging--; e.fireAt = this.time + 1; }
        else if (e.warning.age >= e.warning.life) { this.fireEnemy(e); e.warning = null; charging--; e.fireAt = this.time + this.rules.cooldown + (e.capability === 'damaged' ? .7 : 0); }
      } else if (inside && e.entered && this.time >= e.fireAt && charging < (this.mission.group < 2 ? 1 : 2) && (gun || boss || Math.cos(e.angle) > .4)) {
        const enabled = shape.muzzles.map((_, i) => i).filter(i => !e.disabledPorts.includes(i));
        const port = enabled[e.volley % enabled.length];
        if (port === undefined) continue;
        const from = shipPoint(e.ship, e.x, e.y, e.angle, shape.muzzles[port]), angle = Math.atan2(this.player.y - from.y, this.player.x - from.x);
        const missile = e.ship === 'frigate' && e.capability === 'full' || boss && e.capability === 'full' && e.volley % 3 === 0;
        const offsets = missile || !gun && !boss ? [0] : e.capability === 'damaged' ? [-.22, .22] : [-.3, 0, .3];
        const angles = offsets.map(a => angle + a), sources = [{ port, from, angle, angles }];
        e.warning = { kind: missile ? 'missile' : boss || gun ? 'fan' : 'aim', age: 0, life: this.rules.warning + (missile ? .3 : 0), sources,
          from, angle, angles, targetX: this.player.x, targetY: this.player.y };
        charging++;
      }
    }
    if (this.combination && ['warning', 'dock'].includes(this.combination.stage)) this.combination.sourcePoses = this.combination.ids.map(id => {
      const e = this.enemies.find(e => e.id === id); return e && { id, ship: e.ship, x: e.x, y: e.y, angle: e.angle };
    }).filter(Boolean);
  }

  fireEnemy(e) {
    if (!e.warning || e.warning.sources.some(s => s.from.x < 0 || s.from.x > this.width || s.from.y < 0 || s.from.y > this.height * .65)) return;
    super.fireEnemy(e);
  }

  missionEvent(kind, extra = {}) {
    this.mission.events.push({ kind, at: this.time, ...extra });
    this.mission.events = this.mission.events.slice(-12);
  }
  cancelCombination() {
    const c = this.combination;
    c.stage = 'cancelled'; c.at = this.time; c.progress = 0;
    for (const e of this.enemies) if (c.ids.includes(e.id)) { e.flightStage = 'rally'; e.maneuverAt = this.time; }
    this.missionEvent('combine-interrupted', { ids: [...c.ids], x: c.x, y: c.y });
  }
  prepareCombination() {
    const c = this.combination;
    if (c) {
      if (c.stage === 'cancelled') { if (this.time - c.at > .7) this.combination = null; return; }
      if (c.stage === 'merged') { c.progress = Math.min(1, (this.time - c.at) / .6); return; }
      const parents = c.ids.map(id => this.enemies.find(e => e.id === id && e.hp > 0));
      if (parents.some(e => !e)) { this.cancelCombination(); return; }
      c.progress = Math.min(1, (this.time - c.at) / (c.stage === 'warning' ? 1.2 : 4));
      if (c.stage === 'warning' && this.time - c.at >= 1.2) {
        c.stage = 'dock'; c.at = this.time; c.progress = 0; this.missionEvent('combine-docking', { ids: [...c.ids], x: c.x, y: c.y });
      }
      return;
    }
    if (this.mission.comboSpent || this.mission.restRemaining || this.phase !== 'combat') return;
    const scouts = this.enemies.filter(e => e.ship === 'scout' && e.hp >= e.maxHP * .65 && e.entered && this.time - e.lastHitAt >= 10).slice(0, 2);
    if (scouts.length !== 2) return;
    this.mission.comboSpent = true;
    this.combination = { stage: 'warning', ids: scouts.map(e => e.id), x: clamp((scouts[0].x + scouts[1].x) / 2, 75, this.width - 75),
      y: this.height * .22, at: this.time, progress: 0, sourcePoses: scouts.map(e => ({ id: e.id, ship: e.ship, x: e.x, y: e.y, angle: e.angle })) };
    for (const e of scouts) { e.warning = null; e.fireAt = this.time + 2; }
    this.missionEvent('combine-warning', { ids: scouts.map(e => e.id), x: this.combination.x, y: this.combination.y });
  }
  finishCombination() {
    const c = this.combination;
    if (!c || !['warning', 'dock'].includes(c.stage)) return;
    const parents = c.ids.map(id => this.enemies.find(e => e.id === id && e.hp > 0));
    if (parents.some(e => !e)) { this.cancelCombination(); return; }
    if (c.stage !== 'dock' || this.time - c.at < 1.8 || parents.some((e, i) => Math.hypot(e.x - c.x - (i ? 12 : -12), e.y - c.y) > 16)) return;
    const hp = parents.reduce((sum, e) => sum + e.hp, 0) + [8, 10, 12][this.missionMode];
    const objectiveIds = parents.flatMap(e => e.objectiveIds || [e.id]);
    const child = this.spawnEnemy('gunship', c.x, c.y, 0, 'gunship');
    Object.assign(child, { hp, maxHP: hp, missionType: 'combined', motionAge: 3, entryFrom: { x: c.x, y: c.y }, entered: true,
      disabledPorts: [], capability: 'full', flightStage: 'hold', maneuverAt: this.time, fireAt: this.time + 2,
      lastHitAt: this.time, objectiveIds, mergedFrom: [...c.ids], assemblyUntil: this.time + .6 });
    this.enemies = this.enemies.filter(e => !c.ids.includes(e.id));
    c.stage = 'merged'; c.at = this.time; c.progress = 0; c.heavyId = child.id; c.hp = hp; c.armour = [8, 10, 12][this.missionMode];
    this.mission.combinations++; this.missionEvent('combined', { ids: [...c.ids], heavyId: child.id, hp, x: c.x, y: c.y });
  }

  firePlayer() {
    if (this.storm) { this.fireCooldown = .16; return; }
    if (this.timers.spiral > 0 && this.time >= this.salvoAt) this.fireSalvo();
    const p = this.player, hyper = this.timers.hyper > 0, laser = !hyper && this.timers.laser > 0;
    this.fireCooldown += hyper ? .1 : this.timers.rapid > 0 ? .105 : laser ? .14 : .16;
    const angles = hyper ? [-.24, -.12, 0, .12, .24] : [0, 0];
    for (let i = 0; i < angles.length && this.shots.length < 180; i++) {
      const port = i % 2, from = shipPoint('player', p.x, p.y, p.angle, SHIPS.player.muzzles[port]), a = -Math.PI / 2 + p.angle + angles[i];
      const shot = this.addShot(from.x, from.y, a, 860, laser ? 5 : hyper ? 4 : 3.4, 'player', laser ? 'laser' : hyper ? 'hyper' : 'pulse', laser ? 2 : 1, laser || hyper, laser ? 2 : 1);
      Object.assign(shot, { from, owner: 'player', port });
      if (i < 2) Object.assign(this.effect(from.x, from.y, 'muzzle', .08), { owner: 'player', port });
    }
  }
  fireSalvo() {
    if (this.storm || this.timers.spiral <= 0 || this.time < this.salvoAt || this.shots.length > 177 || this.shots.filter(s => s.kind === 'salvo').length > 6) return false;
    const p = this.player, burstId = ++this.serial;
    const targets = this.enemies.filter(e => e.hp > 0 && e.y < p.y + 20)
      .sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y));
    for (let i = 0; i < 3; i++) {
      const port = i % 2, from = shipPoint('player', p.x, p.y, p.angle, SHIPS.player.muzzles[port]);
      const shot = this.addShot(from.x, from.y, -Math.PI / 2 + p.angle + (i - 1) * .28, 540, 4.8, 'player', 'salvo', 2.5, true);
      Object.assign(shot, { from, owner: 'player', port, burstId, targetId: targets[i]?.id ?? null, guideRate: 2.2, guideFor: 3.2, life: 3.6 });
    }
    this.salvoAt = this.time + .9; return true;
  }
  guideSalvos(dt) {
    for (const s of this.shots.filter(s => s.kind === 'salvo' && s.age < s.guideFor)) {
      let target = this.enemies.find(e => e.id === s.targetId && e.hp > 0);
      if (!target) {
        const used = new Set(this.shots.filter(q => q.kind === 'salvo' && q.burstId === s.burstId && q.id !== s.id).map(q => q.targetId));
        target = this.enemies.filter(e => e.hp > 0 && e.y < s.y + 30 && !used.has(e.id))
          .sort((a, b) => Math.hypot(a.x - s.x, a.y - s.y) - Math.hypot(b.x - s.x, b.y - s.y))[0];
        s.targetId = target?.id ?? null;
      }
      if (!target) continue;
      const desired = Math.atan2(target.y - s.y, target.x - s.x), turn = Math.atan2(Math.sin(desired - s.heading), Math.cos(desired - s.heading));
      s.heading += clamp(turn, -s.guideRate * dt, s.guideRate * dt); s.vx = Math.cos(s.heading) * s.speed; s.vy = Math.sin(s.heading) * s.speed;
    }
  }
  fireSeekers() {
    if (this.storm) { this.seekerCooldown = .85; return; }
    super.fireSeekers();
  }
  updateDrones(dt, fire = true) {
    if (this.timers.drones <= 0) { this.drones = []; return; }
    for (const d of this.drones) {
      d.px = d.x; d.py = d.y; d.angle += dt * 3.2; d.age += dt;
      const radius = 33 * Math.min(1, d.age / .25);
      d.x = this.player.x + Math.cos(d.angle) * radius; d.y = this.player.y + Math.sin(d.angle) * radius; d.muzzle = droneMuzzle(d);
      if (fire && !this.storm && d.hp > 0 && this.time >= d.fireAt && this.shots.length < 180) {
        const angle = -Math.PI / 2 + Math.sin(d.angle) * .12;
        const shot = this.addShot(d.muzzle.x, d.muzzle.y, angle, 760, 3.4, 'player', 'drone', 1, true);
        Object.assign(shot, { owner: d.id, from: { ...d.muzzle }, port: 'optic' }); d.fireAt = this.time + .6;
      }
    }
    this.drones = this.drones.filter(d => d.hp > 0);
  }
  playerShotRadius() { return this.shieldCharges > 0 && this.timers.shield > 0 ? 31 : this.player.r; }
  hurtPlayer(x, y) {
    const shield = this.shieldCharges, result = super.hurtPlayer(x, y);
    if (this.shieldCharges < shield) { const fx = this.effects.at(-1); if (fx?.kind === 'shield') { fx.x = x; fx.y = y; } }
    return result;
  }

  updateStorm(dt, damaging = true) {
    const s = this.storm;
    if (!s) return;
    const oldTips = s.wings.map((w, i) => w.tip || wingPoint(w, STORM_WINGS[i].tipOffset));
    s.age += dt;
    const p = this.player;
    if (s.forceReturnAt === undefined && !damaging) { s.forceReturnAt = s.age; s.returnFrom = s.wings.map(w => ({ x: w.x, y: w.y, angle: w.angle })); }
    const returnAge = s.forceReturnAt === undefined ? s.age - 4.35 : s.age - s.forceReturnAt;
    for (let i = 0; i < 2; i++) {
      const w = s.wings[i]; w.px = w.x; w.py = w.y;
      if (returnAge >= 0) {
        if (!s.returnFrom) s.returnFrom = s.wings.map(q => ({ x: q.x, y: q.y, angle: q.angle }));
        const t = Math.min(1, returnAge / .8), ease = t * t * (3 - 2 * t), from = s.returnFrom[i];
        const target = wingPoint(p, STORM_WINGS[i].neutralOffset);
        w.x = from.x + (target.x - from.x) * ease; w.y = from.y + (target.y - from.y) * ease; w.angle = from.angle + (p.angle - from.angle) * ease; s.stage = 'return';
      } else {
        const split = Math.min(1, s.age / .45), sweep = clamp((s.age - .45) / 3.9, 0, 1), neutral = wingPoint(s.origin, STORM_WINGS[i].neutralOffset);
        w.x = neutral.x + ((w.side < 0 ? 30 : this.width - 30) - neutral.x) * split;
        w.y = neutral.y - 42 * split + (45 - (neutral.y - 42)) * sweep;
        w.angle = s.origin.angle * (1 - split); s.stage = s.age < .45 ? 'split' : 'sweep';
      }
      w.tip = wingPoint(w, STORM_WINGS[i].tipOffset);
    }
    s.band = { x1: s.wings[0].tip.x, x2: s.wings[1].tip.x, y: (s.wings[0].tip.y + s.wings[1].tip.y) / 2,
      px1: oldTips[0].x, px2: oldTips[1].x, py: (oldTips[0].y + oldTips[1].y) / 2, r: 8, active: damaging && s.stage === 'sweep' };
    if (s.band.active) {
      for (const e of this.enemies) if (e.hp > 0 && !s.hit.has(e.id) && e.body.some((c, i) => bandContact(s.band, e.previousBody[i], c, c.r))) {
        s.hit.add(e.id); this.damageEnemy(e, e.kind === 'boss' ? 80 : e.hp, false, { x: e.x, y: s.band.y });
      }
      for (const h of this.hazards) if (h.hp > 0 && !s.hit.has(h.id) && bandContact(s.band, { x: h.px, y: h.py }, h, h.r)) {
        s.hit.add(h.id); this.damageHazard(h, h.hp, false, { x: h.x, y: s.band.y });
      }
    }
    if (returnAge >= .8) { this.storm = null; this.timers.storm = 0; this.fireCooldown = .16; this.seekerCooldown = .85; }
  }

  moveRicochet(s, dt) {
    s.px = s.x; s.py = s.y; s.age += dt; s.segments = [];
    s.trail = s.trail.map(p => ({ ...p, age: p.age + dt })).filter(p => p.age < .55);
    const overlaps = target => target.body ? target.body.some(c => Math.hypot(s.x - c.x, s.y - c.y) <= c.r + s.r)
      : Math.hypot(s.x - target.x, s.y - target.y) <= target.r + s.r;
    for (const id of s.touching) {
      const target = this.enemies.find(e => e.id === id && e.hp > 0) || this.hazards.find(h => h.id === id && h.hp > 0);
      if (!target || !overlaps(target)) s.touching.delete(id);
    }
    let remaining = dt, elapsed = 0;
    const left = s.r + 4, right = this.width - s.r - 4, top = s.r + 8, bottom = this.height - 38;
    while (remaining > 1e-8 && s.bounces <= s.maxBounces) {
      const tx = s.vx > 0 ? (right - s.x) / s.vx : s.vx < 0 ? (left - s.x) / s.vx : Infinity;
      const ty = s.vy > 0 ? (bottom - s.y) / s.vy : s.vy < 0 ? (top - s.y) / s.vy : Infinity;
      const duration = Math.max(0, Math.min(remaining, tx, ty));
      const segment = { x1: s.x, y1: s.y, x2: s.x + s.vx * duration, y2: s.y + s.vy * duration, t0: elapsed / dt, t1: (elapsed + duration) / dt };
      s.segments.push(segment); s.x = segment.x2; s.y = segment.y2; remaining -= duration; elapsed += duration;
      s.trail.push({ x: s.x, y: s.y, age: 0 });
      const hits = this.enemies.filter(e => e.hp > 0 && !s.touching.has(e.id) && this.time - (s.hitTimes.get(e.id) ?? -Infinity) >= .24)
        .map(e => ({ e, t: firstContact(s, e, segment) }))
        .concat(this.hazards.filter(h => h.hp > 0 && !s.touching.has(h.id) && this.time - (s.hitTimes.get(h.id) ?? -Infinity) >= .24)
          .map(h => ({ h, t: sweptCircle(segment.x1, segment.y1, segment.x2, segment.y2,
            h.px + (h.x - h.px) * segment.t0, h.py + (h.y - h.py) * segment.t0,
            h.px + (h.x - h.px) * segment.t1, h.py + (h.y - h.py) * segment.t1, s.r + h.r) })))
        .filter(h => h.t !== null).sort((a, b) => a.t - b.t);
      for (const { e, h, t } of hits) {
        const target = e || h, dealt = s.damageByTarget.get(target.id) || 0, damage = Math.min(3, (e?.kind === 'boss' ? 24 : 18) - dealt);
        if (damage <= 0) continue;
        const contact = { x: segment.x1 + (segment.x2 - segment.x1) * t, y: segment.y1 + (segment.y2 - segment.y1) * t };
        s.hitTimes.set(target.id, this.time); s.damageByTarget.set(target.id, dealt + damage);
        if (e) this.damageEnemy(e, damage, false, contact); else this.damageHazard(h, damage, false, contact);
        if (this.phase === 'jump') return;
      }
      for (const target of this.enemies.concat(this.hazards)) if (target.hp > 0 && overlaps(target)) s.touching.add(target.id);
      if (duration >= tx - 1e-9) { s.vx *= -1; s.bounces++; }
      if (duration >= ty - 1e-9) { s.vy *= -1; s.bounces++; }
    }
    s.trail = s.trail.slice(-80);
    s.heading = Math.atan2(s.vy, s.vx);
    return s.age < s.life && s.bounces <= s.maxBounces;
  }

  moveShots(dt) {
    if (this.storm) this.shots = this.shots.filter(s => s.side !== 'player');
    this.shots = this.shots.filter(s => !s.life || s.age < s.life); this.guideSalvos(dt);
    const enemy = this.shots.filter(s => s.side === 'enemy'), special = this.shots.filter(s => s.kind === 'ricochet');
    this.shots = this.shots.filter(s => s.side === 'player' && s.kind !== 'ricochet');
    super.moveShots(dt);
    if (this.phase === 'jump') return;
    const ordinary = this.shots;
    this.updateStorm(dt);
    if (this.phase === 'jump') return;
    const ricochets = [];
    for (const s of special) { if (this.moveRicochet(s, dt)) ricochets.push(s); if (this.phase === 'jump') return; }
    this.shots = enemy; super.moveShots(dt);
    this.shots = ordinary.concat(ricochets, this.shots).filter(s => !s.life || s.age < s.life);
  }

  damageEnemy(e, damage, productive = true, contact = e) {
    if (e.hp <= 0 || !Number.isFinite(damage) || damage <= 0) return;
    const dealt = Math.min(e.hp, damage); e.hp -= dealt; e.hurt = .12; this.score += dealt * 5;
    e.lastHitAt = this.time;
    if (productive) this.bankCharge(dealt * .8);
    this.effect(contact.x, contact.y, 'hit', .18);
    if ((e.kind === 'gunship' || e.kind === 'boss') && e.hp <= e.maxHP * .5 && e.capability === 'full') {
      e.capability = 'damaged'; e.disabledPorts = e.ship === 'frigate' ? [3, 4, 5] : e.ship === 'gunship' ? [1] : [2];
      e.warning = null; e.fireAt = this.time + 1.8;
      this.effect(e.x, e.y, 'shield', .6).capabilityLost = 'right rack';
    }
    if (e.kind === 'boss' && e.hp <= e.maxHP * .25) { e.capability = 'damaged'; e.disabledPorts = [0, 2]; }
    if (e.hp > 0) return;
    this.kills++; this.mission.kills++; this.score += e.kind === 'boss' ? 2500 : e.kind === 'gunship' ? 250 : 100;
    if (productive) { this.bankCharge(e.kind === 'boss' ? 12 : 4); this.earnedDrop(e, false); }
    this.effect(e.x, e.y, 'explosion', e.kind === 'boss' ? 1.3 : .65);
    Object.assign(this.effect(e.x, e.y, 'wreck', e.kind === 'boss' ? 2 : 1.2), { ship: e.ship, angle: e.angle, vx: e.vx, vy: e.vy, role: e.role });
    for (const id of e.objectiveIds || [e.id]) if (this.requiredEnemies.delete(id)) { this.completedEnemies.add(id); this.mission.progress++; }
    if (e.missionType === 'battery') {
      this.world.blockade.remaining--; this.world.blockade.disabled.push(e.id);
    }
    if (e.kind === 'boss') { this.beginJump(); return; }
    if (!this.requiredEnemies.size) this.groupCleared = true;
  }

  damageHazard(h, damage, productive = true, contact = h) {
    const live = h.hp > 0;
    super.damageHazard(h, damage, productive, contact);
    if (live && h.hp <= 0 && productive) this.earnedDrop(h, true);
  }

  earnedDrop(target, rock) {
    this.eligibleDestructions++;
    if (this.pickups.length >= 6) return;
    const support = this.eligibleDestructions % 4 === 0;
    const capsule = !support && (rock && !this.firstRockSupply || this.eligibleDestructions === 2 || this.eligibleDestructions === 3 || this.eligibleDestructions % 3 === 0);
    if (!support && !capsule) return;
    let power;
    if (capsule && this.pickups.filter(i => i.kind === 'power').length < 2 && Object.values(this.stocks).reduce((a, b) => a + b, 0) < 3) {
      for (let i = 0; i < SUPPLIES.length; i++) {
        const candidate = SUPPLIES[(this.capsuleIndex + i) % SUPPLIES.length];
        if (!this.stocks[candidate] && !this.pickups.some(p => p.power === candidate)) { power = candidate; this.capsuleIndex = (this.capsuleIndex + i + 1) % SUPPLIES.length; break; }
      }
    }
    if (!power && !support || support && this.pickups.filter(i => i.kind !== 'power').length >= 2) return;
    if (rock && power) this.firstRockSupply = true;
    const kind = power ? 'power' : this.player.hp < this.player.maxHP ? 'repair' : 'shield';
    this.pickups.push({ id: ++this.serial, x: target.x, y: target.y, vx: clamp((target.vx || 0) * .25, -22, 22),
      vy: clamp(50 + Math.max(0, target.vy || 0) * .15, 50, 80), r: 12, kind, power, age: 0 }); this.mission.suppliesEarned++;
  }

  movePickups(dt) {
    const p = this.player;
    for (const item of this.pickups) {
      const oldX = item.x, oldY = item.y; item.age += dt;
      item.vx = (item.vx || 0) * Math.exp(-.4 * dt); item.vy = Math.min(100, (item.vy ?? 50) + 6 * dt);
      item.x += item.vx * dt; item.y += item.vy * dt;
      if (item.x < item.r || item.x > this.width - item.r) { item.x = clamp(item.x, item.r, this.width - item.r); item.vx *= -.4; }
      if (sweptCircle(oldX, oldY, item.x, item.y, p.px, p.py, p.x, p.y, item.r + p.r) === null) continue;
      if (item.kind === 'power') {
        if (this.stocks[item.power] || Object.values(this.stocks).reduce((a, b) => a + b, 0) >= 3) continue;
        this.stocks[item.power] = 1;
      } else if (item.kind === 'repair') p.hp = Math.min(p.maxHP, p.hp + 1);
      else if (item.kind === 'shield') { this.shieldCharges = 1; this.timers.shield = 12; }
      item.collected = true; this.score += 50;
      Object.assign(this.effect(item.x, item.y, 'pickup', .4), { pickupKind: item.kind, power: item.power });
    }
    this.pickups = this.pickups.filter(i => !i.collected && i.y < this.height + 30 && i.age < 22);
  }

  beginJump() {
    super.beginJump(); this.jumpRemaining = 3;
    this.mission.beat = 'extraction'; this.mission.title = 'The route is open'; this.mission.objective = 'Cross the gate';
    this.world.gate.locked = false; this.world.blockade.remaining = 0;
  }
  nextSector() {
    this.state = 'won'; this.phase = 'complete'; this.mission.beat = 'complete'; this.mission.objective = 'Evacuation route secured';
    this.player.moving = false; this.player.vx = 0; this.player.vy = 0; this.world.gate.open = 1; this.world.routeProgress = 1;
    this.storm = null; this.score = Math.round(this.score);
  }
}
