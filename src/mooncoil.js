import { Vault } from './vault.js';
import { makeBall, stepBall } from './physics.js';
import { ART } from './vault-art.js';
import { text, rrect, cached, loadImg, ready } from './gfx.js';
import { sfx } from './audio.js';

const MOON_BACKGROUND = ART.mooncoil?.background ? loadImg(ART.mooncoil.background) : null;
const MOON_BRICKS = Object.fromEntries(Object.entries(ART.mooncoil?.bricks || {}).map(([k, s]) => [k, { ...s, img: loadImg(s.url) }]));

import { LAYOUT as MOONCOIL_LAYOUT, MODE as MOONCOIL_MODES, POCKET, bankFor } from './mooncoil-layout.js';
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
  }
  bankFor(c, r) { return bankFor(c, r); }
  art(br) {
    const sprite = MOON_BRICKS[`${br.kind}_${br.n}_${br.max ? Math.min(1, br.max - br.hp) : 0}`];
    if (!ready(sprite)) return super.art(br);
    return { img: sprite.img, ox: sprite.margin, oy: sprite.margin, iw: sprite.uw, ih: sprite.uh };
  }
  background() {
    if (!MOON_BACKGROUND?.complete || !MOON_BACKGROUND.naturalWidth) return super.background();
    return cached(`mooncoil-room-${this.W}-${this.H}`, this.W, this.H, g => {
      g.drawImage(MOON_BACKGROUND, 0, 0, this.W, this.H);
      // Keep the registered masonry readable against the quiet obsidian wall.
      g.fillStyle = 'rgba(5,9,19,.22)'; g.fillRect(18, 90, 324, 332);
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
      const reached = this.snakePoints().some(p => Math.hypot(p.x - x, p.y - y) <= 92);
      this.moonPulses.push({ x, y, age: 0, reached });
      if (reached) { this.moonPulseT = Math.max(this.moonPulseT, 1.6); this.mood('shock', .6); }
    }
  }
  hitBars(ball) {
    if (this.phase !== 'rescue' || this.barsT === this.t || this.cageHP <= 0) return;
    this.barsT = this.t; this.barsWob = 1; this.cageFlash = .25;
    this.cageHP = Math.max(0, this.cageHP - (ball.titan > 0 ? 2 : 1));
    this.brokeBrick(ball); this.addScore(75, this.prisonX, this.floorY);
    this.fx.shatter(ball.x - 3, ball.y - 3, 6, 6, '#c9c2ef', 5, .7);
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
  updateSnake(dt) { super.updateSnake(dt * (this.phase === 'rescue' ? this.moonbindT > 0 ? .18 : this.moonPulseT > 0 ? .35 : 1 : 1)); }
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
    if (this.phase === 'rescue') this.checkBreach();
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
    g.save(); g.filter = 'hue-rotate(115deg) saturate(.78)';
    super.drawSnake(g); g.restore();
    if (this.moonbindT > 0 && this.phase === 'rescue') {
      const p = this.snakePoints()[0];
      g.save(); g.strokeStyle = '#c5aaff'; g.lineWidth = 2; g.globalAlpha = .65;
      g.beginPath(); g.ellipse(p.x, p.y, 22, 13, this.t, 0, Math.PI * 2); g.stroke(); g.restore();
    }
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
      g.save(); g.globalAlpha = alpha; g.strokeStyle = pulse.reached ? '#d8e9ff' : '#ada0d5'; g.lineWidth = 3;
      g.beginPath(); g.arc(pulse.x, pulse.y, radius, 0, Math.PI * 2); g.stroke(); g.restore();
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
  }
}
