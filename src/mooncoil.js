import { Vault } from './vault.js';
import { makeBall, stepBall } from './physics.js';
import { ART } from './vault-art.js';
import { text, rrect, cached, loadImg, ready, softRing } from './gfx.js';
import { sfx } from './audio.js';
import { hpLeft } from './near-miss.js';
import { themedArt } from './themed-bricks.js';
// Themed bricks (src/themed-bricks.js): moonstone, rose moonstone, lunar silver and starlit violet by kind; slate is a
// lunar-silver bar. The cache keeps its Blender render; the Blender moonstone set stays as the fallback.
const MOON_MAT = { 6: 'moonstone', 2: 'rosemoon', 4: 'silver', 3: 'starlit', 9: 'bar' };

const MOON_BACKGROUND = ART.mooncoil?.background ? loadImg(ART.mooncoil.background) : null;
const MOON_BRICKS = Object.fromEntries(Object.entries(ART.mooncoil?.bricks || {}).map(([k, s]) => [k, { ...s, img: loadImg(s.url) }]));

import { LAYOUT as MOONCOIL_LAYOUT, MODE as MOONCOIL_MODES, POCKET, RIVAL, bankFor } from './mooncoil-layout.js';
const GNASH_X = 20 + RIVAL.column * 16 + 8; // his tunnel mouth, beside Mooncoil's at x284
export { MOONCOIL_LAYOUT, MOONCOIL_MODES };

export class Mooncoil extends Vault {
  constructor(W, H, scale = 1, mode = 'easy') {
    super(W, H, scale, mode, { layout: MOONCOIL_LAYOUT, pocket: POCKET });
    this.name = 'Mooncoil Reliquary';
    this.subtitle = 'Break Lumi’s cage before Mooncoil reaches her';
    this.rules = MOONCOIL_MODES[this.difficulty];
    this.snakeSpeed = this.rules.speed;
    this.coreHits = this.rules.charge;
    this.cageHP = this.cageMax = this.rules.cageHP;
    this.cageFlash = 0;
    this.crystals = []; this.moonbindT = 0; this.moonPulseT = 0; this.moonPulses = [];
    this.powerChoices = [
      { id: 'moonbind', label: 'MOONBIND', color: '#bea6f4' },
      { id: 'ricochet', label: 'CRYSTALS', color: '#a9e7dd' },
      { id: 'titan', label: 'COSMIC', color: '#efb7e8' },
    ];
    this.wardCoachSeen = true;
    // Two serpents: violet Mooncoil leads; emerald Gnash follows from his own tunnel after a warned entrance.
    this.mooncoil = this.snake; this.mooncoil.start = this.snakeStart;
    this.gnash = null; this.gnashWarnAt = null; this.rescueT = 0; this.clashCD = 0; this.clashes = 0;
  }
  rivals() { return [this.mooncoil, this.gnash].filter(Boolean); } // empty while Vault's constructor plans the first route
  withSnake(s, fn) { const prev = this.snake; this.snake = s; try { return fn(); } finally { this.snake = prev; } }
  // The other serpent's body is a wall, and its head keeps a one-cell bubble: head sprites are wider than a cell.
  otherSnakeCells() {
    return this.rivals().filter(s => s !== this.snake && s.alpha > 0).flatMap(s => {
      const [c, r] = s.cells[0];
      return [...s.cells, [c + 1, r], [c - 1, r], [c, r + 1], [c, r - 1]].filter(([x]) => x >= 0 && x < 20);
    });
  }
  // Gnash follows in single file: he only drops once Mooncoil's body, and its route ahead, have passed his mouth.
  gnashMouthClear() {
    const m = this.mooncoil, ahead = (m.path || []).slice(0, 6).map(k => [k % 20, Math.floor(k / 20)]), [hc, hr] = m.cells[0];
    return Math.abs(hc - RIVAL.column) + Math.abs(hr - 1) > 3 && ![...m.cells, ...ahead].some(([c, r]) => Math.abs(c - RIVAL.column) <= 1 && r <= 2);
  }
  spawnGnash() {
    const cells = Array.from({ length: 12 }, (_, i) => [RIVAL.column, 1 - i]);
    this.gnash = Object.assign(this.newSnake(cells), { mouthX: GNASH_X, prog: 0 });
    this.gnash.start = this.withSnake(this.gnash, () => this.snakePlan().cost);
    this.withSnake(this.gnash, () => this.mood('hunt', 1));
    sfx.boom(); this.bump(.3, .05);
  }
  // Heads meeting, or a recoil that drives one serpent onto the other, starts a fight: both reel back dizzy and it
  // sheds a power-up. A follower simply blocked behind the leader's body waits, so idle play never earns a clash.
  checkClash() {
    const [a, b] = this.rivals();
    if (!b || this.clashCD > 0 || a.attack || b.attack || a.retreat || b.retreat || a.stun > 0 || b.stun > 0) return false;
    const [ha, hb] = [a.cells[0], b.cells[0]], same = (p, q) => p[0] === q[0] && p[1] === q[1];
    // Side by side in a wide gallery is not a fight; heads must be adjacent and facing each other.
    const headOn = Math.abs(ha[0] - hb[0]) + Math.abs(ha[1] - hb[1]) <= 1 && Math.cos(a.dir - b.dir) < -.3;
    const overrun = b.cells.slice(1).some(p => same(p, ha)) || a.cells.slice(1).some(p => same(p, hb));
    if (!headOn && !overrun) return false;
    const [pa] = this.withSnake(a, () => this.snakePoints()), [pb] = this.withSnake(b, () => this.snakePoints());
    const x = (pa.x + pb.x) / 2, y = (pa.y + pb.y) / 2;
    for (const s of [a, b]) this.withSnake(s, () => {
      this.knockBack(RIVAL.clashKnock); s.stun = Math.max(s.stun, RIVAL.clashStun); s.open = 1; s.chew = 0; this.mood('ouch', .5);
    });
    this.clashCD = RIVAL.clashCooldown; this.clashes++;
    this.dropPower(x, y, ['split', 'wide', 'fire'][this.clashes % 3]);
    this.addScore(250); this.combo++;
    this.fx.pop(Math.max(70, Math.min(this.W - 70, x)), Math.max(110, y - 22), 'CLASH!', '#c9ff9e', 20);
    this.fx.shatter(x - 8, y - 8, 16, 16, '#d9ffb8', 10, .9, 'teal'); sfx.boom(); sfx.hurt(); this.bump(.5, .07);
    this.play('Cheer'); this.say('They’re fighting!', 1.3);
    return true;
  }
  bankFor(c, r) { return bankFor(c, r); }
  art(br) {
    const themed = MOON_MAT[br.kind] && themedArt('mooncoil', MOON_MAT[br.kind], br.n, br.max ? Math.min(1, br.max - br.hp) : 0);
    if (themed) return themed;
    const sprite = MOON_BRICKS[`${br.kind}_${br.n}_${br.max ? Math.min(1, br.max - br.hp) : 0}`];
    if (!ready(sprite)) return super.art(br);
    return { img: sprite.img, ox: sprite.margin, oy: sprite.margin, iw: sprite.uw, ih: sprite.uh };
  }
  background() {
    if (!MOON_BACKGROUND?.complete || !MOON_BACKGROUND.naturalWidth) return super.background();
    return cached(`mooncoil-room-${this.W}-${this.H}`, this.W, this.H, g => {
      g.drawImage(MOON_BACKGROUND, 0, 0, this.W, this.H);
    });
  }
  drawTopInset(g, h) {
    if (!MOON_BACKGROUND?.complete || !MOON_BACKGROUND.naturalWidth) return super.drawTopInset(g, h);
    g.drawImage(MOON_BACKGROUND, 0, 0, MOON_BACKGROUND.naturalWidth, 2, 0, -h, this.W, h);
  }
  // Each bank is bolted to a visible rear rail. Individual shattered bricks retain
  // the existing rigid-body debris, but whole banks cannot fall off their mounts.
  collapse() { this.collapseDirty = false; }
  removeBrick(br, ball) {
    if (br.gone) return;
    super.removeBrick(br, ball);
    if (ball && br.kind === 3 && this.phase === 'rescue') {
      const x = br.x + br.w / 2, y = br.y + br.h / 2;
      const reached = this.rivals().some(s => this.withSnake(s, () => this.snakePoints()).some(p => Math.hypot(p.x - x, p.y - y) <= 92));
      this.moonPulses.push({ x, y, age: 0, reached });
      if (reached) { this.moonPulseT = Math.max(this.moonPulseT, 1.6); this.mood('shock', .6); }
    }
  }
  hitBars(ball) {
    if (this.phase !== 'rescue' || this.barsT === this.t || this.cageHP <= 0) return;
    this.barsT = this.t; this.barsWob = 1; this.cageFlash = .25;
    this.cageHP = Math.max(0, this.cageHP - (ball.titan > 0 ? 2 : 1));
    this.brokeBrick(ball); this.addScore(75, this.prisonX, this.floorY);
    this.fx.shatter(ball.x - 3, ball.y - 3, 6, 6, '#c9c2ef', 5, .7, 'violet');
    this.play('Cheer'); sfx.tough(); this.bump(.14, .025);
    this.checkBreach();
  }
  checkBreach() {
    if (!(this.cageHP <= 0) || this.openingGate) return;
    if (!this.gateOpen) {
      this.openingGate = true;
      // The broken cage releases the side escape chute through physical masonry.
      for (const br of this.bricks) if (!br.gone && br.r > this.pocket.r1 && br.c <= this.pocket.c0 + 3 && br.c + br.n > this.pocket.c0 + 2) super.removeBrick(br, null);
      this.gateOpen = true; this.openingGate = false;
    }
    super.checkBreach();
    if (this.phase === 'escape' && this.aim) { this.release(); this.timeScale = .35; }
  }
  updateVenom() {
    // This variant trades the granite-melting attack for a faster gallery pursuit.
    // Ball hits still interrupt it; no invisible wall damage.
    this.venom.contacts.reset(); this.venom.phase = 'idle'; this.wardCoach = false;
    return false;
  }
  updateSnake(dt) {
    const k = this.phase === 'rescue' ? this.moonbindT > 0 ? .18 : this.moonPulseT > 0 ? .35 : 1 : 1;
    const attacker = this.rivals().find(s => s.attack);
    for (const s of attacker ? [attacker] : this.rivals()) this.withSnake(s, () => super.updateSnake(dt * k * (s === this.gnash ? this.rules.rivalSpeed : 1)));
    // Whichever serpent reaches the bars becomes the one the capture, camera and Continue follow.
    this.snake = this.rivals().find(s => s.attack) || this.snake;
  }
  ballVsSnake() { for (const s of this.rivals()) this.withSnake(s, () => super.ballVsSnake()); }
  crushCheck() { for (const s of this.rivals()) this.withSnake(s, () => super.crushCheck()); }
  shotHit(shot) { return this.rivals().some(s => this.withSnake(s, () => super.shotHit(shot))); }
  beginRetreat() { for (const s of this.rivals()) this.withSnake(s, () => super.beginRetreat()); }
  // Continue panel copy: the moonstone cage's HP; once it is broken, the bricks left on her way out.
  nearMiss() { return this.cageHP > 0 ? { line: hpLeft('THE MOONSTONE', this.cageHP), progress: 1 - this.cageHP / this.cageMax } : super.nearMiss(); }
  continueRun() {
    const others = this.rivals().filter(s => s !== this.snake);
    super.continueRun();
    for (const s of others) this.withSnake(s, () => { s.attack = null; this.knockBack(6); s.stun = Math.max(s.stun, 3); });
  }
  canChoosePower(id) {
    if (id === 'moonbind') return this.canUseCorePower() && this.moonbindT <= 0;
    if (id === 'ricochet') return this.canUseCorePower() && !this.crystals.length;
    return super.canChoosePower(id);
  }
  chooseSpacePower(id) {
    if (id === 'titan') return super.chooseSpacePower(id);
    if (!this.powerMenuOpen || !['moonbind', 'ricochet'].includes(id) || !this.canChoosePower(id)) return false;
    this.closePowerMenu(); this.paddle.charge = 0;
    this.kitCastAt = this.t; this.kitReactionAt = -Infinity; this.kitWardResult = null;
    if (id === 'moonbind') this.moonbindT = 7;
    else {
      for (const vx of [-235, 235]) {
        const b = makeBall(this.paddle.x, this.paddle.y - 14, vx, -325, 6);
        Object.assign(b, { shot: true, life: 7, tint: '#c9f5ec' }); this.crystals.push(b);
      }
    }
    sfx.power(); return true;
  }
  updateLevel(dt, realDt) {
    super.updateLevel(dt, realDt);
    if (this.state !== 'play') return;
    this.moonbindT = Math.max(0, this.moonbindT - dt);
    this.moonPulseT = Math.max(0, this.moonPulseT - dt);
    for (const pulse of this.moonPulses) pulse.age += dt;
    this.moonPulses = this.moonPulses.filter(p => p.age < .6);
    this.cageFlash = Math.max(0, this.cageFlash - realDt);
    for (const s of this.rivals()) if (s !== this.snake) this.withSnake(s, () => this.tickSnakePose(dt, realDt));
    if (this.phase === 'rescue') {
      if (!this.backHold) this.rescueT += dt; this.clashCD = Math.max(0, this.clashCD - dt);
      if (!this.gnash && this.gnashWarnAt === null && this.rescueT >= this.rules.rivalAt - RIVAL.tell && this.gnashMouthClear()) {
        this.gnashWarnAt = this.rescueT; sfx.beat(); this.say('Another one!', 1.6); this.play('Interact');
      }
      if (!this.gnash && this.gnashWarnAt !== null && this.rescueT - this.gnashWarnAt >= RIVAL.tell && this.gnashMouthClear()) this.spawnGnash();
      this.checkClash();
      // Urgency follows whichever serpent is closer to her.
      this.danger = Math.max(...this.rivals().map(s => Number.isFinite(s.start) ? Math.max(0, Math.min(1, 1 - (s.cost ?? s.start) / s.start)) : 0));
      this.peakDanger = Math.max(this.peakDanger || 0, this.danger);
      this.checkBreach();
    }
    for (const b of this.crystals) {
      b.life -= dt; b.trail.push({ x: b.x, y: b.y }); if (b.trail.length > 12) b.trail.shift();
      if (this.phase !== 'rescue' || b.life <= 0) { b.dead = true; continue; }
      const steps = Math.max(1, Math.ceil(Math.hypot(b.vx, b.vy) * dt / 2));
      for (let i = 0; i < steps && !b.dead; i++) {
        stepBall(b, dt / steps, { grid: this.grid, left: this.left, right: this.right, top: this.top,
          bottom: this.paddle.y + 14, onHit: (c, r, ball) => this.hitCell(c, r, ball) });
        if (!b.dead && this.shotHit(b)) b.dead = true;
      }
    }
    this.crystals = this.crystals.filter(b => !b.dead);
  }
  drawPrincess(g, ...args) {
    g.save(); g.filter = 'none'; super.drawPrincess(g, ...args); g.restore();
  }
  drawSnake(g) {
    for (const s of this.rivals()) this.withSnake(s, () => {
      if (s.alpha <= 0) return;
      g.save(); if (s === this.mooncoil) g.filter = 'hue-rotate(115deg) saturate(.78)'; // Gnash keeps his own emerald
      super.drawSnake(g); g.restore();
      if (this.moonbindT > 0 && this.phase === 'rescue') {
        const p = this.snakePoints()[0];
        softRing(g, p.x, p.y, 22, 2.6, '#c5aaff', .7, 13, this.t);
      }
    });
  }
  drawEntrance(g) {
    super.drawEntrance(g);
    if (this.gnashWarnAt === null) return;
    super.drawEntrance(g, GNASH_X);
    if (this.gnash) return;
    // The warning: his eyes glint in the dark mouth before he drops in.
    const q = .5 + .5 * Math.sin((this.rescueT - this.gnashWarnAt) * 14);
    g.save(); g.fillStyle = `rgba(170,255,120,${.45 + .55 * q})`; g.shadowColor = '#9dff6a'; g.shadowBlur = 8;
    for (const dx of [-5, 5]) { g.beginPath(); g.ellipse(GNASH_X + dx, 86, 2.4, 1.5, 0, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  drawBars(g) {
    super.drawBars(g);
    if (this.cageGone) return;
    const x = 20 + this.pocket.c0 * 16, y = 96 + this.pocket.r0 * 16;
    const damage = 1 - this.cageHP / this.cageMax;
    g.save();
    // Chips and fractures live on the actual bars, rather than a detached counter.
    for (let i = 0; i < Math.ceil(damage * 6); i++) {
      const bx = x + 16 + i * 13, by = y + 12 + (i % 3) * 9;
      g.strokeStyle = '#d8d2ef'; g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(bx - 3, by - 4); g.lineTo(bx + 1, by); g.lineTo(bx - 2, by + 3); g.stroke();
    }
    if (this.cageFlash > 0) { g.globalAlpha = this.cageFlash * 1.2; g.fillStyle = '#e0c8ff'; g.fillRect(x, y, 96, 48); }
    g.restore();
  }
  drawBalls(g) {
    super.drawBalls(g);
    for (const pulse of this.moonPulses) {
      const radius = Math.min(92, pulse.age * 300), alpha = (1 - pulse.age / .6) * .5;
      softRing(g, pulse.x, pulse.y, radius, 4, pulse.reached ? '#d8e9ff' : '#ada0d5', alpha * 1.4);
    }
    for (const b of this.crystals) {
      g.save(); g.strokeStyle = '#a7e8df'; g.lineWidth = 3;
      g.beginPath(); b.trail.forEach((p, i) => i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)); g.stroke();
      g.translate(b.x, b.y); g.rotate(this.t * 4);
      g.shadowColor = '#bceee9'; g.shadowBlur = 12; g.fillStyle = '#ecffff';
      g.beginPath(); g.moveTo(0, -9); g.lineTo(6, 0); g.lineTo(0, 9); g.lineTo(-6, 0); g.closePath(); g.fill(); g.restore();
    }
  }
  drawHUD(g) { super.drawHUD(g); }
  drawIntroText(g) {
    text(g, 'MOONCOIL RELIQUARY', this.W / 2, this.H - 170, 23, '#e4c9ff', 'center');
    text(g, 'Break Lumi’s cage before Mooncoil arrives.', this.W / 2, this.H - 142, 13, '#e8dcec', 'center');
    text(g, 'Shatter violet armour to slow it nearby.', this.W / 2, this.H - 121, 13, '#e8dcec', 'center');
    text(g, 'A second serpent follows. Make them collide.', this.W / 2, this.H - 100, 13, '#c9ff9e', 'center');
  }
}
