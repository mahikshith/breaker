// Shared gameplay for every level: paddle, balls, serve and Focus aim, power-ups, lives, combo, juice.
import { makeBall, stepBall, cellAt } from './physics.js';
import { FX, drawBall, capsule, POWER, rrect, shade, text, NUM, SHADOW } from './gfx.js';
import { sfx } from './audio.js';

const BALL_SPEED = 330;
const FOCUS_SLOW = 0.25;

export class Arena {
  constructor(W, H, opt = {}) {
    this.W = W; this.H = H;
    this.accent = opt.accent || '#3fa8f5';
    this.left = opt.left ?? 12; this.right = W - (opt.right ?? 12); this.top = opt.top ?? 70;
    this.paddle = { x: W / 2, y: H - 104, w: 74, h: 12, vx: 0, baseW: 74, wideT: 0, stun: 0 };
    this.balls = []; this.drops = []; this.fx = new FX();
    this.score = 0; this.combo = 0; this.bestCombo = 0; this.lives = 3; this.focus = 2; this.focusMax = 3; this.focusFill = 0;
    this.trauma = 0; this.hitStop = 0; this.timeScale = 1; this.fireT = 0;
    this.state = 'play'; this.t = 0; this.bricksBroken = 0;
    this.ptr = { down: false, x: W / 2, y: 0, stillT: 0, lastX: W / 2 };
    this.keys = {};
    this.aim = null; // { ball, angle, serve, t }
    this.serve();
  }

  // ---------- input (world coordinates) ----------
  pointerDown(x, y) { Object.assign(this.ptr, { down: true, x, y, stillT: 0, lastX: x, downX: x, off: this.paddle.x - x }); if (this.aim) this.aim.anchorX = x; }
  pointerMove(x, y) { this.ptr.x = x; this.ptr.y = y; }
  pointerUp() { this.ptr.down = false; if (this.aim) this.release(); }
  key(k, down) { this.keys[k] = down; if (k === ' ' && !down && this.aim) this.release(); }

  serve() {
    const p = this.paddle, b = makeBall(p.x, p.y - 6, 0, -BALL_SPEED, 6);
    b.caught = true; this.balls.push(b);
    this.aim = { ball: b, angle: 0, serve: true, t: 0, anchorX: this.ptr.x };
  }
  release() {
    const a = this.aim; if (!a) return;
    const b = a.ball, s = a.serve ? BALL_SPEED : Math.max(BALL_SPEED, Math.hypot(b.vx, b.vy));
    b.caught = false; b.vx = Math.sin(a.angle) * s; b.vy = -Math.cos(a.angle) * s; b.spin = 0;
    if (!a.serve) this.focus = Math.max(0, this.focus - 1);
    this.aim = null; this.timeScale = 1; sfx.paddle();
  }

  // ---------- hooks for levels ----------
  world() { return { grid: this.grid, left: this.left, right: this.right, top: this.top, bottom: this.H + 30, paddle: this.paddle.stun > 0 ? null : this.paddle }; }
  hitCell(/* c, r, ball */) {}
  updateLevel(/* dt */) {}

  addScore(n, x, y) {
    const pts = Math.round(n * (1 + Math.min(this.combo, 20) * 0.1)); // multiplier caps at ×3
    this.score += pts;
    // a few readable numbers beat a wall of them
    if (x !== undefined && this.combo >= 3 && this.fx.pops.length < 4) this.fx.pop(x, y, `${pts}`, '#ffe9a8', 11);
  }
  bump(trauma, stop = 0) { if (trauma >= 0.3) navigator.vibrate?.(Math.round(trauma * 30)); this.trauma = Math.min(1, this.trauma + trauma); this.hitStop = Math.max(this.hitStop, stop); }
  brokeBrick() {
    this.combo++; this.bestCombo = Math.max(this.bestCombo, this.combo); this.bricksBroken++;
    this.focusFill += 1; if (this.focusFill >= 14 && this.focus < this.focusMax) { this.focusFill = 0; this.focus++; this.fx.pop(this.paddle.x, this.paddle.y - 24, 'AIM +1', '#e3b6ff', 13); }
    sfx.hit(this.combo);
  }
  dropPower(x, y, kind) { this.drops.push({ x, y, kind, vy: 60 }); }
  applyPower(kind) {
    const p = this.paddle;
    sfx.power(); this.fx.pop(p.x, p.y - 26, POWER[kind].label, '#fff', 16);
    if (kind === 'split') {
      const add = [];
      for (const b of this.balls) if (!b.dead && !b.caught) for (const da of [-0.35, 0.35]) {
        const c = Math.cos(da), s = Math.sin(da), nb = makeBall(b.x, b.y, b.vx * c - b.vy * s, b.vx * s + b.vy * c, b.r);
        nb.fire = b.fire; add.push(nb);
      }
      this.balls.push(...add.slice(0, 60));
    } else if (kind === 'burst') {
      for (const a of [-0.4, 0, 0.4]) this.balls.push(makeBall(p.x, p.y - 8, Math.sin(a) * BALL_SPEED, -Math.cos(a) * BALL_SPEED, 6));
    } else if (kind === 'fire') { this.fireT = 8; }
    else if (kind === 'wide') { p.wideT = 12; }
    else if (kind === 'focus') { this.focus = Math.min(this.focusMax, this.focus + 1); }
  }

  // ---------- update ----------
  update(dtReal) {
    this.t += dtReal;
    if (this.hitStop > 0) { this.hitStop -= dtReal; return; }
    const p = this.paddle, ptr = this.ptr;
    // steady thumb detection for Focus aim
    ptr.stillT = Math.abs(ptr.x - ptr.lastX) < 1.2 ? ptr.stillT + dtReal : 0; ptr.lastX = ptr.x;

    const dt = dtReal * this.timeScale;
    // paddle
    const prevX = p.x;
    p.w += ((p.wideT > 0 ? p.baseW * 1.55 : p.baseW) - p.w) * Math.min(1, dtReal * 10);
    if (p.wideT > 0) p.wideT -= dt;
    if (p.stun > 0) p.stun -= dt;
    if (this.aim) {
      const a = this.aim; a.t += dtReal;
      if (ptr.down) a.angle = Math.max(-1.15, Math.min(1.15, (ptr.x - a.anchorX) * 0.012 + (a.base || 0)));
      if (this.keys.ArrowLeft) a.angle = Math.max(-1.15, a.angle - dtReal * 1.6);
      if (this.keys.ArrowRight) a.angle = Math.min(1.15, a.angle + dtReal * 1.6);
      a.ball.x = p.x + Math.sin(a.angle) * 2; a.ball.y = p.y - a.ball.r - 1;
      if (!a.serve && a.t > 1.6) this.release(); // Focus can't freeze the game forever
    } else if (p.stun <= 0) {
      let tx = p.x;
      if (ptr.down) tx = ptr.x + (ptr.off || 0);
      if (this.keys.ArrowLeft) tx = p.x - 420 * dtReal;
      if (this.keys.ArrowRight) tx = p.x + 420 * dtReal;
      p.x += (tx - p.x) * Math.min(1, dtReal * 22);
    }
    p.x = Math.max(this.left + p.w / 2, Math.min(this.right - p.w / 2, p.x));
    p.vx = (p.x - prevX) / Math.max(dtReal, 1e-4);

    if (this.fireT > 0) this.fireT -= dt;
    const fire = this.fireT > 0;
    const world = this.world();
    world.onHit = (c, r, b) => this.hitCell(c, r, b);
    world.onWall = () => sfx.wall();
    world.onPaddle = b => this.onPaddle(b);
    for (const b of this.balls) {
      if (b.caught) continue;
      b.fire = fire;
      stepBall(b, dt, world);
    }
    const before = this.balls.length;
    this.balls = this.balls.filter(b => !b.dead);
    if (before && !this.balls.length && this.state === 'play') this.loseBall();

    for (const d of this.drops) {
      d.vy += 120 * dt; d.y += d.vy * dt;
      if (d.y > p.y - 8 && d.y < p.y + p.h + 6 && Math.abs(d.x - p.x) < p.w / 2 + 16) { d.got = true; this.applyPower(d.kind); }
    }
    this.drops = this.drops.filter(d => !d.got && d.y < this.H + 20);

    this.updateLevel(dt, dtReal);
    this.fx.update(dt, this.H - 40);
    this.trauma = Math.max(0, this.trauma - dtReal * 1.6);
  }

  onPaddle(b) {
    const p = this.paddle, ptr = this.ptr;
    this.combo = 0; sfx.paddle();
    this.fx.ring(b.x, p.y, this.accent, 18);
    const steady = (ptr.down && ptr.stillT > 0.12) || this.keys[' '];
    if (steady && this.focus >= 1 && !this.aim) { // Focus aim: catch the ball, slow time, let the player aim
      b.caught = true;
      const base = Math.atan2(b.vx, -b.vy);
      this.aim = { ball: b, angle: base, base, serve: false, t: 0, anchorX: ptr.x };
      this.timeScale = FOCUS_SLOW;
    }
  }
  loseBall() {
    this.lives--; sfx.lose(); this.bump(0.5); this.combo = 0; this.fireT = 0;
    if (this.lives <= 0) { this.fail('Out of balls'); return; }
    this.serve();
  }
  fail(reason) { if (this.state !== 'play') return; this.state = 'lost'; this.reason = reason; this.timeScale = 1; this.aim = null; }
  win() { if (this.state !== 'play') return; this.state = 'won'; this.timeScale = 1; this.aim = null; }

  // ---------- drawing ----------
  shakeOffset() {
    const s = this.trauma * this.trauma * 9;
    return [Math.sin(this.t * 61) * s, Math.cos(this.t * 47) * s * 0.8];
  }
  drawPaddle(g) {
    const p = this.paddle, x = p.x - p.w / 2, y = p.y, h = p.h;
    const stun = p.stun > 0 && Math.floor(this.t * 20) % 2;
    g.fillStyle = 'rgba(0,0,0,0.35)'; rrect(g, x + SHADOW.dx, y + SHADOW.dy + 2, p.w, h, h / 2); g.fill();
    // body
    const gr = g.createLinearGradient(0, y, 0, y + h + 3);
    gr.addColorStop(0, '#eef2f8'); gr.addColorStop(0.35, '#a9b2c6'); gr.addColorStop(0.55, '#4b5370'); gr.addColorStop(1, '#232840');
    g.fillStyle = '#1a1e30'; rrect(g, x, y + 3, p.w, h, h / 2); g.fill();
    g.fillStyle = gr; rrect(g, x, y, p.w, h, h / 2); g.fill();
    // accent core
    const ac = stun ? '#ff4d5e' : this.accent;
    const cg = g.createLinearGradient(0, y + 4, 0, y + 9);
    cg.addColorStop(0, shade(ac, 0.5)); cg.addColorStop(1, shade(ac, -0.2));
    g.fillStyle = cg; rrect(g, x + 10, y + 4.5, p.w - 20, 3.5, 1.75); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.75)'; rrect(g, x + 5, y + 1.2, p.w - 10, 1.6, 0.8); g.fill();
    // end caps
    for (const ex of [x + 5, x + p.w - 5]) { g.fillStyle = shade(ac, -0.1); g.beginPath(); g.arc(ex, y + h / 2, 2.2, 0, 7); g.fill(); }
  }
  drawBalls(g) { for (const b of this.balls) drawBall(g, b); }
  drawDrops(g) {
    for (const d of this.drops) {
      g.fillStyle = 'rgba(0,0,0,0.3)'; rrect(g, d.x - 20 + SHADOW.dx, d.y - 8 + SHADOW.dy, 40, 16, 8); g.fill();
      g.drawImage(capsule(d.kind), d.x - 20, d.y - 9, 40, 18);
    }
  }
  drawAim(g) {
    const a = this.aim; if (!a) return;
    // simulate the shot to show its first bounces
    const sim = makeBall(a.ball.x, a.ball.y, Math.sin(a.angle) * 300, -Math.cos(a.angle) * 300, a.ball.r);
    let bounces = 0, stop = false;
    const w = { ...this.world(), paddle: null, onWall: () => bounces++, onHit: () => { bounces++; if (bounces >= 2) stop = true; } };
    w.grid = this.grid && { ...this.grid, cells: this.grid.cells.slice() };
    const pts = [];
    for (let i = 0; i < 160 && !stop && bounces < 3 && !sim.dead; i++) { stepBall(sim, 1 / 120, w); if (i % 4 === 0) pts.push(sim.x, sim.y); }
    const pulse = 0.6 + Math.sin(this.t * 10) * 0.2;
    for (let i = 0; i < pts.length; i += 2) {
      const k = 1 - i / pts.length;
      g.globalAlpha = k * pulse; g.fillStyle = '#fff';
      g.beginPath(); g.arc(pts[i], pts[i + 1], 1.8 * k + 0.6, 0, 7); g.fill();
    }
    g.globalAlpha = 1;
    if (stop) { g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 1.5; g.beginPath(); g.arc(sim.x, sim.y, 7, 0, 7); g.stroke(); }
    if (!a.serve) { // remaining hold time
      g.strokeStyle = '#e3b6ff'; g.lineWidth = 2.5;
      g.beginPath(); g.arc(a.ball.x, a.ball.y, 12, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - a.t / 1.6)); g.stroke();
    }
  }
  drawHUDBase(g) {
    const y = this.H - 30;
    // lives as little steel balls
    for (let i = 0; i < 3; i++) drawBall(g, { x: 24 + i * 16, y, r: 5, vx: 0, vy: 0 }, i < this.lives ? 1 : 0.18);
    // Focus pips
    text(g, 'AIM', this.W - 88, y, 13, '#e3b6ff', 'right');
    for (let i = 0; i < this.focusMax; i++) {
      const x = this.W - 82 + i * 22, full = i < this.focus;
      g.fillStyle = 'rgba(0,0,0,0.4)'; rrect(g, x, y - 5, 18, 10, 5); g.fill();
      if (full) { const gr = g.createLinearGradient(0, y - 5, 0, y + 5); gr.addColorStop(0, '#f1d6ff'); gr.addColorStop(1, '#9b4fd1'); g.fillStyle = gr; rrect(g, x, y - 5, 18, 10, 5); g.fill(); }
      else if (i === this.focus) { g.fillStyle = 'rgba(196,107,240,0.5)'; rrect(g, x, y - 5, 18 * this.focusFill / 14, 10, 5); g.fill(); }
    }
    text(g, this.score.toLocaleString(), this.W - 14, 24, 22, '#fff', 'right', NUM);
    if (this.combo >= 5) text(g, `COMBO ×${this.combo}`, this.W - 14, 64, 12, '#ffd36b', 'right');
    if (this.aim?.serve && this.t < 6) text(g, 'Drag to aim · release to launch', this.W / 2, this.paddle.y + 40, 13, 'rgba(255,255,255,0.8)', 'center');
  }
}
export { cellAt };
