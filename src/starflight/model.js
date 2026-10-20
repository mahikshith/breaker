// Direct-flight combat; rendering and input-device bindings live in the caller.
import { SHIPS, PLAYER_EDGE, shipPoint, shipCircles } from './geometry.js';
const STEP = 1 / 120, TAU = Math.PI * 2;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export const STARFLIGHT_MODES = {
  easy: { hp: 5, enemyHP: 1.15, speed: 185, warning: 1.15, cooldown: 2.8, bossHP: 220, shotCap: 30, chargeRate: 3.3 },
  medium: { hp: 4, enemyHP: 1.5, speed: 220, warning: 1, cooldown: 2.4, bossHP: 280, shotCap: 38, chargeRate: 3 },
  hard: { hp: 3, enemyHP: 1.8, speed: 250, warning: .9, cooldown: 2.1, bossHP: 340, shotCap: 48, chargeRate: 2.7 },
};
export const STARFLIGHT_POWERS = { laser: 4, stasis: 4.5, hyper: 2.5, seeker: 6, spiral: 5, drones: 6, nova: .65 };
const WAVES = [2, 7, 13, 20, 27, 34, 40];
const ASTEROIDS = [9, 18, 29, 38];
const shipKind = enemy => SHIPS[enemy.ship] ? enemy.ship : enemy.kind;

// Relative swept circles also catch a moving ship crossing a fast projectile.
export function sweptCircle(ax, ay, bx, by, cx, cy, dx, dy, radius) {
  const x = ax - cx, y = ay - cy, vx = bx - ax - (dx - cx), vy = by - ay - (dy - cy);
  const c = x * x + y * y - radius * radius;
  if (c <= 0) return 0;
  const a = vx * vx + vy * vy;
  if (a < 1e-12) return null;
  const b = 2 * (x * vx + y * vy), disc = b * b - 4 * a * c;
  if (disc < 0) return null;
  const t = (-b - Math.sqrt(disc)) / (2 * a);
  return t >= 0 && t <= 1 ? t : null;
}

function enemyContact(ax, ay, bx, by, radius, enemy) {
  const old = enemy.previousBody || shipCircles(shipKind(enemy), enemy.px, enemy.py, enemy.previousAngle || 0);
  const now = enemy.body || shipCircles(shipKind(enemy), enemy.x, enemy.y, enemy.angle);
  let first = null;
  for (let i = 0; i < now.length; i++) {
    const t = sweptCircle(ax, ay, bx, by, old[i].x, old[i].y, now[i].x, now[i].y, radius + now[i].r);
    if (t !== null && (first === null || t < first)) first = t;
  }
  return first;
}

export class Starflight {
  constructor({ width = 360, height = 780, difficulty = 'medium', seed = 1, controlReserve = null } = {}) {
    if (!Number.isFinite(width) || !Number.isFinite(height) || width < 260 || height < 360) throw new RangeError('Invalid flight arena');
    this.width = width; this.height = height;
    this.difficulty = Object.hasOwn(STARFLIGHT_MODES, difficulty) ? difficulty : 'medium';
    this.rules = STARFLIGHT_MODES[this.difficulty];
    this.seed = (Number.isFinite(seed) ? seed : 1) >>> 0;
    this.player = { x: width / 2, y: height * .9, px: width / 2, py: height * .9, vx: 0, vy: 0, r: 7,
      hp: this.rules.hp, maxHP: this.rules.hp, invuln: 1.5, angle: 0, targetX: width / 2, targetY: height * .9, moving: false };
    this.enemies = []; this.shots = []; this.pickups = []; this.effects = []; this.warnings = [];
    this.hazards = []; this.fields = []; this.drones = []; this.bodyContacts = new Set(); this.rocksBroken = 0;
    this.score = 0; this.kills = 0; this.time = 0; this.sector = 1; this.cycle = 0; this.completedSectors = 0;
    this.sectorTime = 0; this.jumpRemaining = 0; this.phase = 'combat'; this.state = 'play'; this.paused = false;
    this.charge = 0; this.chargeBank = 0; this.weapon = 'twin'; this.timers = Object.fromEntries([...Object.keys(STARFLIGHT_POWERS), 'rapid', 'shield'].map(k => [k, 0]));
    this.shieldCharges = 0; this.fireCooldown = .15; this.waveIndex = 0; this.serial = 0; this.bossSpawned = false;
    this.asteroidIndex = 0; this.fieldSpawned = false; this.seekerCooldown = 0;
    this.controlReserve = null; this.setControlReserve(controlReserve);
  }
  random() { this.seed = (Math.imul(1664525, this.seed) + 1013904223) >>> 0; return this.seed / 4294967296; }
  setTarget(x, y) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
    const p = this.player;
    const target = this.reserveTarget(clamp(x, PLAYER_EDGE, this.width - PLAYER_EDGE), clamp(y, this.height * .35, this.height - 38));
    p.targetX = target.x; p.targetY = target.y;
    p.moving = true; return true;
  }
  setControlReserve(reserve = null) {
    if (reserve !== null && (typeof reserve !== 'object' || !Number.isFinite(reserve.x) || !Number.isFinite(reserve.y) || !Number.isFinite(reserve.r) || reserve.r <= 0)) return false;
    this.controlReserve = reserve ? { x: reserve.x, y: reserve.y, r: reserve.r } : null;
    const p = this.player, target = this.reserveTarget(p.targetX, p.targetY); p.targetX = target.x; p.targetY = target.y;
    return true;
  }
  reserveTarget(x, y) {
    const c = this.controlReserve;
    if (!c || Math.hypot(x - c.x, y - c.y) >= c.r + 1) return { x, y };
    const angle = Math.atan2(y - c.y, x - c.x), candidates = [];
    for (let i = 0; i < 17; i++) {
      const a = i === 0 ? angle : (i - 1) * TAU / 16, q = { x: c.x + Math.cos(a) * (c.r + 1), y: c.y + Math.sin(a) * (c.r + 1) };
      if (q.x >= PLAYER_EDGE && q.x <= this.width - PLAYER_EDGE && q.y >= this.height * .35 && q.y <= this.height - 38) candidates.push(q);
    }
    return candidates.sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0] || { x: this.width - PLAYER_EDGE, y: this.height * .35 };
  }
  setMoving(moving) { this.player.moving = !!moving; }
  pause(paused) { this.paused = !!paused; }
  activate(kind) {
    const duration = STARFLIGHT_POWERS[kind];
    if (!Number.isFinite(duration) || this.paused || this.state !== 'play' || this.phase === 'jump' || this.charge < 100 - 1e-7 || this.timers[kind] > 0) return false;
    this.charge = 0; this.chargeBank = 0; this.timers[kind] = duration;
    if (kind === 'seeker') this.seekerCooldown = 0;
    if (kind === 'drones') this.drones = [0, 1].map(i => ({ id: ++this.serial, x: this.player.x, y: this.player.y, px: this.player.x, py: this.player.y, r: 6, hp: 2, maxHP: 2, age: 0, angle: i * Math.PI, fireAt: this.time + .3 + i * .22 }));
    if (kind === 'nova') {
      this.shots = this.shots.filter(s => s.side !== 'enemy' || Math.hypot(s.x - this.player.x, s.y - this.player.y) > 150);
      for (let i = 0; i < 20 && this.shots.length < 180; i++) this.addShot(this.player.x, this.player.y, i * TAU / 20, 470, 5, 'player', 'nova', 3, true, 2);
    }
    this.effect(this.player.x, this.player.y, kind, .55);
    return true;
  }
  update(dt) {
    if (this.paused || this.state !== 'play' || !Number.isFinite(dt) || dt <= 0) return;
    let remaining = Math.min(dt, .1);
    while (remaining > 1e-9 && this.state === 'play') { const step = Math.min(STEP, remaining); this.step(step); remaining -= step; }
  }
  step(dt) {
    this.time += dt;
    this.updateFields(dt);
    this.movePlayer(dt);
    for (const e of this.effects) e.age += dt;
    this.effects = this.effects.filter(e => e.age < e.life);
    this.movePickups(dt);
    if (this.phase === 'jump') {
      this.updateDrones(dt, false);
      this.jumpRemaining = Math.max(0, this.jumpRemaining - dt);
      if (this.jumpRemaining <= 1e-9) this.nextSector();
      return;
    }
    this.sectorTime += dt;
    const p = this.player; p.invuln = Math.max(0, p.invuln - dt);
    for (const k of Object.keys(this.timers)) this.timers[k] = Math.max(0, this.timers[k] - dt);
    const earned = Math.min(this.chargeBank, this.rules.chargeRate * dt, 100 - this.charge);
    this.charge += earned; this.chargeBank -= earned;
    if (this.charge >= 100 - 1e-7) { this.charge = 100; this.chargeBank = 0; }
    if (!this.timers.shield) this.shieldCharges = 0;
    this.weapon = this.timers.hyper > 0 ? 'hyper' : this.timers.laser > 0 ? 'laser' : this.timers.spiral > 0 ? 'spiral' : 'twin';
    this.schedule();
    this.moveEnemies(dt);
    this.moveHazards(dt);
    this.updateDrones(dt);
    this.fireCooldown -= dt;
    if (this.fireCooldown <= 0) this.firePlayer();
    if (this.timers.seeker > 0 && (this.seekerCooldown -= dt) <= 0) this.fireSeekers();
    this.moveShots(dt);
    if (this.phase === 'jump' || this.state !== 'play') return;
    const contacts = new Set();
    for (const e of this.enemies) {
      if (e.hp <= 0 || e.y < 0) continue;
      if (enemyContact(p.px, p.py, p.x, p.y, p.r, e) !== null) {
        contacts.add(e.id);
        if (!this.bodyContacts.has(e.id)) { this.hurtPlayer(p.x, p.y); if (e.kind !== 'boss') this.damageEnemy(e, 3, false); }
      }
    }
    for (const h of this.hazards) if (h.hp > 0 && sweptCircle(p.px, p.py, p.x, p.y, h.px, h.py, h.x, h.y, p.r + h.r) !== null) {
      contacts.add(h.id);
      if (!this.bodyContacts.has(h.id)) { this.hurtPlayer(p.x, p.y); this.damageHazard(h, 3, false); }
    }
    this.bodyContacts = contacts;
    this.enemies = this.enemies.filter(e => e.hp > 0 && e.y < this.height + 80);
    this.warnings = this.enemies.filter(e => e.warning).map(e => e.warning);
  }
  movePlayer(dt) {
    const p = this.player; p.px = p.x; p.py = p.y;
    if (p.moving) {
      p.vx += ((p.targetX - p.x) * 140 - p.vx * 23) * dt;
      p.vy += ((p.targetY - p.y) * 140 - p.vy * 23) * dt;
    } else { p.vx *= Math.exp(-16 * dt); p.vy *= Math.exp(-16 * dt); }
    const pull = this.gravity(p.x, p.y); p.vx += pull.x * dt; p.vy += pull.y * dt;
    const reserve = this.controlReserve, distance = reserve ? Math.hypot(p.x - reserve.x, p.y - reserve.y) : Infinity;
    if (reserve && distance < reserve.r) {
      const nx = distance > .01 ? (p.x - reserve.x) / distance : 1, ny = distance > .01 ? (p.y - reserve.y) / distance : 0;
      const push = Math.min(1800, 500 + (reserve.r - distance) * 60); p.vx += nx * push * dt; p.vy += ny * push * dt;
    }
    const speed = Math.hypot(p.vx, p.vy);
    if (speed > 480) { p.vx *= 480 / speed; p.vy *= 480 / speed; }
    p.x = clamp(p.x + p.vx * dt, PLAYER_EDGE, this.width - PLAYER_EDGE);
    p.y = clamp(p.y + p.vy * dt, this.height * .35, this.height - 38);
    if (reserve && distance >= reserve.r - 1e-7) {
      const t = sweptCircle(p.px, p.py, p.x, p.y, reserve.x, reserve.y, reserve.x, reserve.y, reserve.r);
      if (t !== null) {
        const x = p.px + (p.x - p.px) * t, y = p.py + (p.y - p.py) * t, len = Math.hypot(x - reserve.x, y - reserve.y);
        const nx = (x - reserve.x) / len, ny = (y - reserve.y) / len, inward = Math.min(0, p.vx * nx + p.vy * ny);
        p.vx -= nx * inward; p.vy -= ny * inward;
        p.x = clamp(x + p.vx * dt * (1 - t), PLAYER_EDGE, this.width - PLAYER_EDGE); p.y = clamp(y + p.vy * dt * (1 - t), this.height * .35, this.height - 38);
        // A world-edge clamp can cut a tangent back through the control. Keep
        // the reached contact instead of projecting or teleporting the ship.
        if (Math.hypot(p.x - reserve.x, p.y - reserve.y) < reserve.r - 1e-7) { p.x = x; p.y = y; }
      }
    }
    if (p.x === PLAYER_EDGE || p.x === this.width - PLAYER_EDGE) p.vx = 0;
    if (p.y === this.height * .35 || p.y === this.height - 38) p.vy = 0;
    p.angle += (clamp(p.vx * .00065, -.28, .28) - p.angle) * Math.min(1, dt * 12);
  }
  bankCharge(points) { if (Number.isFinite(points) && points > 0) this.chargeBank = Math.min(Math.max(0, 100 - this.charge), this.chargeBank + points); }
  spawnAsteroids(index) {
    const count = this.sector === 1 ? 2 : 3;
    for (let i = 0; i < count && this.hazards.length < 6; i++) {
      const r = 16 + (index + i) % 3 * 5, x = (i + 1) * this.width / (count + 1), hp = Math.ceil((r / 4) * this.rules.enemyHP);
      this.hazards.push({ id: ++this.serial, kind: 'asteroid', x, y: -40 - i * 55, px: x, py: -40 - i * 55,
        vx: Math.sin(index * 2 + i) * 30, vy: 65 + this.sector * 9, r, hp, maxHP: hp, angle: this.random() * TAU, spin: (i % 2 ? -1 : 1) * .35, hurt: 0 });
    }
  }
  moveHazards(dt) {
    for (const h of this.hazards) {
      h.px = h.x; h.py = h.y; h.hurt = Math.max(0, h.hurt - dt); h.angle += h.spin * dt;
      const force = this.gravity(h.x, h.y), rate = this.timers.stasis > 0 ? .45 : 1;
      h.vx = clamp(h.vx + force.x * dt * .12, -65, 65); h.vy = clamp(h.vy + force.y * dt * .12, 45, 150);
      h.x += h.vx * dt * rate; h.y += h.vy * dt * rate;
      if (h.x < h.r || h.x > this.width - h.r) { h.x = clamp(h.x, h.r, this.width - h.r); h.vx *= -1; }
    }
    this.hazards = this.hazards.filter(h => h.hp > 0 && h.y < this.height + h.r + 20);
  }
  spawnField() {
    if (this.fields.length) return;
    const p = this.player, points = [[90, this.height * .42], [this.width - 90, this.height * .42], [90, this.height * .62], [this.width - 90, this.height * .62]];
    points.sort((a, b) => Math.hypot(b[0] - p.x, b[1] - p.y) - Math.hypot(a[0] - p.x, a[1] - p.y));
    const [x, y] = points[0], r = Math.min(80, Math.hypot(x - p.x, y - p.y) - 36);
    this.fields.push({ id: ++this.serial, kind: 'gravity', visual: 'wormhole', x, y, r, coreR: r * .3, age: 0, warning: 2, life: 7, strength: 360 });
  }
  updateFields(dt) { for (const f of this.fields) f.age += dt; this.fields = this.fields.filter(f => f.age < f.life); }
  gravity(x, y) {
    let ax = 0, ay = 0;
    for (const f of this.fields) {
      if (f.age < f.warning) continue;
      const dx = f.x - x, dy = f.y - y, distance = Math.hypot(dx, dy);
      if (distance <= .01 || distance >= f.r) continue;
      const fade = Math.min(1, (f.age - f.warning) / .4, (f.life - f.age) / .5), force = f.strength * (1 - distance / f.r) * fade;
      ax += dx / distance * force; ay += dy / distance * force;
    }
    return { x: ax, y: ay };
  }
  updateDrones(dt, fire = true) {
    if (this.timers.drones <= 0) { this.drones = []; return; }
    for (let i = 0; i < this.drones.length; i++) {
      const d = this.drones[i]; d.px = d.x; d.py = d.y; d.angle += dt * 3.2; d.age += dt;
      const radius = 33 * Math.min(1, d.age / .25);
      d.x = this.player.x + Math.cos(d.angle) * radius; d.y = this.player.y + Math.sin(d.angle) * radius;
      if (fire && d.hp > 0 && this.time >= d.fireAt && this.shots.length < 180) {
        const s = this.addShot(d.x, d.y, -Math.PI / 2, 760, 3.4, 'player', 'drone', 1, true);
        s.owner = d.id; s.from = { x: d.x, y: d.y }; d.fireAt = this.time + .6;
      }
    }
    this.drones = this.drones.filter(d => d.hp > 0);
  }
  fireSeekers() {
    this.seekerCooldown += .85;
    const live = this.shots.filter(s => s.kind === 'seeker').length, p = this.player;
    for (let i = 0; i < Math.min(2, 6 - live) && this.shots.length < 180; i++) {
      const from = shipPoint('player', p.x, p.y, p.angle, SHIPS.player.muzzles[i]);
      const s = this.addShot(from.x, from.y, -Math.PI / 2 + p.angle + (i ? .15 : -.15), 420, 5, 'player', 'seeker', 3, true);
      Object.assign(s, { from, owner: 'player', port: i, turnRate: 2.8, homingTime: 4 });
    }
  }
  schedule() {
    if (this.phase !== 'combat') return;
    if (this.waveIndex < WAVES.length && this.sectorTime >= WAVES[this.waveIndex]) this.spawnWave(this.waveIndex++);
    if (this.asteroidIndex < ASTEROIDS.length && this.sectorTime >= ASTEROIDS[this.asteroidIndex]) this.spawnAsteroids(this.asteroidIndex++);
    if (this.sector > 1 && !this.fieldSpawned && this.sectorTime >= (this.sector === 2 ? 22 : 16)) { this.fieldSpawned = true; this.spawnField(); }
    if (!this.bossSpawned && this.sectorTime >= 45) {
      this.bossSpawned = true; this.phase = 'boss';
      this.spawnEnemy('boss', this.width / 2, -75, 0);
    }
  }
  spawnWave(index) {
    const count = this.difficulty === 'easy' ? 3 : this.difficulty === 'hard' ? 5 : 4;
    for (let i = 0; i < count && this.enemies.length < 12; i++) {
      const side = index % 2 ? -1 : 1;
      let x = (i + 1) * this.width / (count + 1);
      if (this.sector === 2) x = side < 0 ? 45 + i * 32 : this.width - 45 - i * 32;
      const kind = this.sector === 3 && i % 3 === 0 || index % 3 === 2 && i === 0 ? 'gunship' : 'scout';
      const family = this.sector === 1 && index >= 2 && (i + index) % 2 === 0 ? (kind === 'gunship' ? 'frigate' : 'beetle') : null;
      this.spawnEnemy(kind, x, -45 - i * 32, index + i, family);
    }
  }
  spawnEnemy(kind, x, y, route = 0, family = null) {
    const boss = kind === 'boss', gun = kind === 'gunship', scale = 1 + this.cycle * .18;
    const hp = Math.ceil((boss ? this.rules.bossHP : gun ? 14 : 5) * (boss ? scale : this.rules.enemyHP * scale));
    const ship = family || (this.sector > 1 ? ({ scout: 'beetle', gunship: 'frigate', boss: 'crescent' }[kind]) : kind);
    const e = { id: ++this.serial, kind, variant: this.sector, x, y, px: x, py: y, baseX: x, route, bornAt: this.time,
      ship, role: boss ? 'guardian' : gun ? (ship === 'frigate' ? 'missile' : 'battery') : ship === 'beetle' ? 'interceptor' : 'scout',
      vx: 0, vy: 0, r: boss ? 48 : gun ? 21 : 14, hp, maxHP: hp, angle: 0, previousAngle: 0, hurt: 0, warning: null,
      wobble: this.random() * TAU, fireAt: this.time + 1.7 + route % 3 * .35, volley: 0, entered: false };
    e.body = shipCircles(shipKind(e), x, y); e.previousBody = e.body;
    this.enemies.push(e); return e;
  }
  moveEnemies(dt) {
    let warningCount = this.enemies.filter(e => e.warning).length;
    for (const e of this.enemies) {
      e.px = e.x; e.py = e.y; e.previousAngle = e.angle; e.hurt = Math.max(0, e.hurt - dt);
      const geometry = shipKind(e);
      e.previousBody = shipCircles(geometry, e.x, e.y, e.angle);
      const age = this.time - e.bornAt, boss = e.kind === 'boss', gun = e.kind === 'gunship';
      if (boss || gun) {
        const holdY = boss ? 125 : 95 + e.route % 2 * 58;
        e.y = Math.min(holdY, e.y + (boss ? 100 : 95) * dt);
        const half = SHIPS[geometry].width * .5;
        if (e.y >= holdY) {
          e.entered = true;
          const targetX = clamp(e.baseX + Math.sin(age * (boss ? .65 : .9) + e.wobble) * (boss ? this.width * .23 : 26), half + 10, this.width - half - 10);
          e.x += (targetX - e.x) * Math.min(1, dt * 4);
        }
      } else {
        e.y += (78 + this.sector * 13 + (e.role === 'interceptor' ? 16 : 0) + this.cycle * 5) * dt;
        e.x = clamp(e.baseX + Math.sin(age * 1.65 + e.wobble) * (this.sector === 2 ? 42 : 23), 20, this.width - 20);
        e.entered = e.y > 45;
      }
      e.vx = (e.x - e.px) / dt; e.vy = (e.y - e.py) / dt;
      e.angle = clamp(e.vx * .0015, -.3, .3);
      e.body = shipCircles(geometry, e.x, e.y, e.angle);
      if (e.warning) {
        e.warning.age += dt;
        // Lock the aim, while keeping the warning attached to the actual moving muzzle.
        for (const source of e.warning.sources) source.from = shipPoint(geometry, e.x, e.y, e.angle, SHIPS[geometry].muzzles[source.port]);
        e.warning.from = e.warning.sources[0].from;
        if (e.warning.age >= e.warning.life) { this.fireEnemy(e); e.warning = null; warningCount--; e.fireAt = this.time + this.rules.cooldown + (boss ? -.6 : .25); }
      } else if (e.entered && e.y < this.height * .38 && this.time >= e.fireAt && warningCount < 2) {
        const tube = Math.floor(e.volley / 3) % 3;
        const ports = e.kind === 'scout' ? [e.volley % SHIPS[geometry].muzzles.length]
          : geometry === 'frigate' ? (e.volley % 3 === 2 ? [tube, 3 + tube] : [tube + (e.volley % 3 ? 3 : 0)])
          : e.volley % (boss ? 4 : 3) === 2 ? (boss ? [0, 2] : [0, 1]) : [boss ? [0, 2, 0, 1][e.volley % 4] : e.volley % 3];
        const kind = boss ? (this.sector === 2 && e.volley % 2 ? 'lanes' : 'fan') : e.role === 'missile' ? 'missile' : gun ? 'fan' : 'aim';
        const offsets = kind === 'aim' ? [0] : boss ? (this.sector === 3 ? [-.48, -.24, .24, .48] : [-.32, -.16, 0, .16, .32]) : [-.2, 0, .2];
        const sources = ports.map(port => {
          const from = shipPoint(geometry, e.x, e.y, e.angle, SHIPS[geometry].muzzles[port]), angle = Math.atan2(this.player.y - from.y, this.player.x - from.x);
          const angles = kind === 'missile' ? [angle] : ports.length > 1 ? (boss ? [angle - .18, angle + .18] : [angle]) : kind === 'lanes' ? [Math.PI / 2 - .42, Math.PI / 2, Math.PI / 2 + .42] : offsets.map(a => angle + a);
          return { port, from, angle, angles };
        });
        e.warning = { kind, age: 0, life: this.rules.warning + (boss || kind === 'missile' ? .3 : 0), sources, from: sources[0].from, angle: sources[0].angle, angles: sources[0].angles, targetX: this.player.x, targetY: this.player.y };
        warningCount++;
      }
    }
  }
  firePlayer() {
    const p = this.player, hyper = this.timers.hyper > 0, laser = !hyper && this.timers.laser > 0, spiral = !hyper && !laser && this.timers.spiral > 0;
    this.fireCooldown += hyper ? .1 : spiral ? .12 : this.timers.rapid > 0 ? .105 : laser ? .14 : .16;
    const angles = hyper ? [-.24, -.12, 0, .12, .24] : [0, 0];
    for (let i = 0; i < angles.length; i++) {
      if (this.shots.length >= 180) break;
      const port = i % 2, from = shipPoint('player', p.x, p.y, p.angle, SHIPS.player.muzzles[port]), a = -Math.PI / 2 + p.angle + angles[i];
      const shot = this.addShot(from.x, from.y, a, 860, laser ? 5 : hyper || spiral ? 4 : 3.4, 'player', laser ? 'laser' : hyper ? 'hyper' : spiral ? 'spiral' : 'pulse', laser ? 2 : spiral ? 1.4 : 1, laser || hyper || spiral, laser ? 2 : 1);
      Object.assign(shot, { from, owner: 'player', port });
      if (spiral) shot.wavePhase = i * Math.PI;
      if (i < 2) Object.assign(this.effect(from.x, from.y, 'muzzle', .08), { owner: 'player', port });
    }
  }
  fireEnemy(e) {
    const active = this.shots.filter(s => s.side === 'enemy').length;
    const w = e.warning;
    const count = w?.sources.reduce((n, s) => n + s.angles.length, 0) || 0;
    if (!w || active + count > this.rules.shotCap || this.shots.length + count > 180) return;
    for (const source of w.sources) {
      for (const a of source.angles) {
        const missile = w.kind === 'missile';
        const shot = this.addShot(source.from.x, source.from.y, a, this.rules.speed + this.cycle * 8 - (missile ? 35 : 0), e.kind === 'boss' || missile ? 5 : 4,
          'enemy', missile ? 'missile' : e.kind === 'boss' ? 'plasma' : e.kind === 'gunship' ? 'heavy' : 'pulse', 1);
        Object.assign(shot, { from: { ...source.from }, owner: e.id, port: source.port });
        if (missile) Object.assign(shot, { turnRate: .9, homingTime: 1.8 });
      }
      Object.assign(this.effect(source.from.x, source.from.y, 'enemyMuzzle', .15), { owner: e.id, port: source.port });
    }
    e.volley++;
  }
  addShot(x, y, angle, speed, r, side, kind, damage = 1, powered = false, pierce = 1) {
    const shot = { id: ++this.serial, x, y, px: x, py: y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      r, side, kind, damage, age: 0, powered, pierce, hit: new Set(), heading: angle, baseHeading: angle, speed };
    this.shots.push(shot); return shot;
  }
  moveShots(dt) {
    for (const s of this.shots) {
      s.px = s.x; s.py = s.y; s.age += dt;
      if (s.turnRate && s.age < s.homingTime) {
        const target = s.side === 'enemy' ? this.player : this.enemies.find(e => e.id === s.targetId && e.hp > 0)
          || this.enemies.filter(e => e.hp > 0 && e.y < s.y + 30).sort((a, b) => Math.hypot(a.x - s.x, a.y - s.y) - Math.hypot(b.x - s.x, b.y - s.y))[0];
        if (target) {
          s.targetId = target.id;
          const desired = Math.atan2(target.y - s.y, target.x - s.x), delta = Math.atan2(Math.sin(desired - s.heading), Math.cos(desired - s.heading));
          s.heading += clamp(delta, -s.turnRate * dt, s.turnRate * dt);
          s.vx = Math.cos(s.heading) * s.speed; s.vy = Math.sin(s.heading) * s.speed;
        }
      } else if (s.kind === 'spiral') {
        s.heading = s.baseHeading + Math.sin(s.age * 9 + s.wavePhase) * .38;
        s.vx = Math.cos(s.heading) * s.speed; s.vy = Math.sin(s.heading) * s.speed;
      }
      const force = this.gravity(s.x, s.y); s.vx += force.x * dt; s.vy += force.y * dt;
      const speed = Math.hypot(s.vx, s.vy), cap = s.speed * 1.35;
      if (speed > cap) { s.vx *= cap / speed; s.vy *= cap / speed; }
      const rate = s.side === 'enemy' && this.timers.stasis > 0 ? .32 : 1;
      s.x += s.vx * dt * rate; s.y += s.vy * dt * rate;
    }
    // A final legal boss hit clears danger before an incoming same-tick hit.
    for (const s of this.shots.filter(s => s.side === 'player')) {
      const hits = this.enemies.filter(e => e.hp > 0 && !s.hit.has(e.id)).map(e => ({ e, t: enemyContact(s.px, s.py, s.x, s.y, s.r, e) }))
        .concat(this.hazards.filter(h => h.hp > 0 && !s.hit.has(h.id)).map(h => ({ h, t: sweptCircle(s.px, s.py, s.x, s.y, h.px, h.py, h.x, h.y, s.r + h.r) })))
        .filter(h => h.t !== null).sort((a, b) => a.t - b.t || (a.e || a.h).id - (b.e || b.h).id);
      for (const { e, h, t } of hits) {
        const target = e || h;
        if (s.pierce <= 0) break;
        if (target.hp <= 0) continue;
        s.hit.add(target.id); s.pierce--;
        const contact = { x: s.px + (s.x - s.px) * t, y: s.py + (s.y - s.py) * t };
        if (e) this.damageEnemy(e, s.damage, !s.powered, contact); else this.damageHazard(h, s.damage, !s.powered, contact);
        if (this.phase === 'jump') return;
      }
    }
    const p = this.player;
    for (const s of this.shots.filter(s => s.side === 'enemy')) {
      const hits = [{ type: 'player', t: sweptCircle(s.px, s.py, s.x, s.y, p.px, p.py, p.x, p.y, s.r + p.r) }]
        .concat(this.hazards.filter(h => h.hp > 0).map(h => ({ type: 'hazard', h, t: sweptCircle(s.px, s.py, s.x, s.y, h.px, h.py, h.x, h.y, s.r + h.r) })))
        .concat(this.drones.filter(d => d.hp > 0).map(d => ({ type: 'drone', d, t: sweptCircle(s.px, s.py, s.x, s.y, d.px, d.py, d.x, d.y, s.r + d.r) })))
        .filter(h => h.t !== null).sort((a, b) => a.t - b.t);
      const hit = hits[0];
      if (hit) {
        s.pierce = 0;
        if (hit.type === 'hazard') this.damageHazard(hit.h, s.damage, false);
        else if (hit.type === 'drone') { hit.d.hp--; this.effect(hit.d.x, hit.d.y, 'shield', .25); }
        else this.hurtPlayer(s.px + (s.x - s.px) * hit.t, s.py + (s.y - s.py) * hit.t);
      }
    }
    this.shots = this.shots.filter(s => s.pierce > 0 && s.age < 8 && s.x > -60 && s.x < this.width + 60 && s.y > -100 && s.y < this.height + 80);
  }
  damageEnemy(e, damage, productive = true, contact = e) {
    if (e.hp <= 0 || !Number.isFinite(damage) || damage <= 0) return;
    const dealt = Math.min(e.hp, damage); e.hp -= dealt; e.hurt = .12; this.score += dealt * 5;
    if (productive) this.bankCharge(dealt * .8);
    this.effect(contact.x, contact.y, 'hit', .18);
    if (e.hp > 0) return;
    this.kills++; this.score += e.kind === 'boss' ? 2000 : e.kind === 'gunship' ? 250 : 100;
    if (productive) this.bankCharge(e.kind === 'boss' ? 12 : 4);
    this.effect(e.x, e.y, 'explosion', e.kind === 'boss' ? 1.1 : .55);
    if (e.kind === 'boss') { this.beginJump(); return; }
    if (this.kills % 5 === 0 && this.pickups.length < 8) {
      let kind = ['repair', 'rapid', 'shield', 'charge'][(Math.floor(this.kills / 5) - 1) % 4];
      if (kind === 'charge' && !productive) kind = 'shield';
      this.pickups.push({ id: ++this.serial, x: e.x, y: e.y, r: 12, kind, age: 0 });
    }
  }
  damageHazard(h, damage, productive = true, contact = h) {
    if (h.hp <= 0 || !Number.isFinite(damage) || damage <= 0) return;
    const dealt = Math.min(h.hp, damage); h.hp -= dealt; h.hurt = .15; this.score += dealt * 2;
    if (productive) this.bankCharge(dealt * .8);
    this.effect(contact.x, contact.y, 'rockHit', .2);
    if (h.hp <= 0) { this.rocksBroken++; this.score += 30; this.effect(h.x, h.y, 'rockBreak', .65).size = h.r * 3; }
  }
  hurtPlayer(x, y) {
    const p = this.player;
    if (p.invuln > 0 || this.state !== 'play' || this.phase === 'jump') return false;
    if (this.shieldCharges > 0) { this.shieldCharges--; this.effect(p.x, p.y, 'shield', .4); p.invuln = .35; return false; }
    p.hp = Math.max(0, p.hp - 1); p.invuln = 1.25; this.effect(x, y, 'hurt', .45);
    if (!p.hp) { this.state = 'lost'; this.reason = 'Ship disabled'; this.player.moving = false; }
    return true;
  }
  movePickups(dt) {
    const p = this.player;
    for (const item of this.pickups) {
      const oldY = item.y; item.age += dt; item.y += 75 * dt;
      if (sweptCircle(item.x, oldY, item.x, item.y, p.px, p.py, p.x, p.y, item.r + p.r + 7) !== null) {
        if (item.kind === 'repair') p.hp = Math.min(p.maxHP, p.hp + 1);
        else if (item.kind === 'charge') this.bankCharge(25);
        else if (item.kind === 'shield') { this.shieldCharges = 1; this.timers.shield = 10; }
        else if (item.kind === 'rapid') this.timers.rapid = Math.min(12, this.timers.rapid + 6);
        item.collected = true; this.score += 50; this.effect(item.x, item.y, 'pickup', .4).pickupKind = item.kind;
      }
    }
    this.pickups = this.pickups.filter(i => !i.collected && i.y < this.height + 30 && i.age < 14);
  }
  beginJump() {
    this.phase = 'jump'; this.jumpRemaining = 8; this.completedSectors++;
    this.enemies = []; this.shots = []; this.warnings = [];
    this.hazards = []; this.fields = []; this.bodyContacts.clear();
    this.player.invuln = 2; this.score = Math.round(this.score);
    this.effect(this.width / 2, 120, 'jump', 1.6);
  }
  nextSector() {
    this.sector++; if (this.sector > 3) { this.sector = 1; this.cycle++; }
    this.phase = 'combat'; this.sectorTime = 0; this.waveIndex = 0; this.bossSpawned = false; this.fireCooldown = .25;
    this.asteroidIndex = 0; this.fieldSpawned = false;
    this.player.invuln = 1.5; this.player.hp = Math.min(this.player.maxHP, this.player.hp + 1);
  }
  effect(x, y, kind, life) {
    const effect = { x, y, kind, age: 0, life, seed: this.serial }; this.effects.push(effect);
    if (this.effects.length > 100) this.effects.shift();
    return effect;
  }
}
