// Shared gameplay for every level: paddle, balls, serve and Focus aim, power-ups, lives, combo, juice.
import { makeBall, stepBall, cellAt } from './physics.js';
import { FX, drawBall, capsule, POWER, rrect, shade, text, NUM, SHADOW, SPR, ready } from './gfx.js';
import { sfx } from './audio.js';
import { store } from './prefs.js';

const BALL_SPEED = 345;
const FOCUS_SLOW = 0.25;
const RALLY_MAX = 1.28;      // balls pick up a little speed on every paddle hit, up to this much
const DRAG_GAIN = 1.15;      // paddle travel per unit of thumb travel
const CORE_HALF = 7;         // half-width of the paddle's sweet spot
const CORE_BRICKS = 12;      // bricks to break to charge it

// The paddle sits well above the thumb: the bottom quarter of the screen is a control deck you drag on.
export function paddleY(H, minY = 0) { return Math.round(Math.max(minY, H - Math.max(150, Math.min(210, H * 0.25)))); }

export class Arena {
  constructor(W, H, opt = {}) {
    this.W = W; this.H = H;
    this.accent = opt.accent || '#3fa8f5';
    this.left = opt.left ?? 12; this.right = W - (opt.right ?? 12); this.top = opt.top ?? 70;
    this.paddle = { x: W / 2, y: paddleY(H, opt.minPaddleY), w: 74, h: 12, vx: 0, baseW: 74, wideT: 0, shrinkT: 0, laserT: 0, laserCd: 0, stun: 0, charge: 0 };
    this.deckY = this.paddle.y + 34; this.drainY = this.paddle.y + 46; this.shieldY = this.paddle.y + 28;
    this.speed = BALL_SPEED * (opt.speed || 1);
    this.balls = []; this.drops = []; this.shots = []; this.fx = new FX();
    this.score = 0; this.combo = 0; this.bestCombo = 0; this.lives = 3; this.focus = 2; this.focusMax = 3; this.focusFill = 0;
    this.trauma = 0; this.hitStop = 0; this.timeScale = 1; this.fireT = 0; this.slowT = 0; this.shield = 0; this.shieldT = 0;
    this.state = 'play'; this.t = 0; this.bricksBroken = 0; this.breaks = [];
    this.hudY = 0; this.inB = 0; // set by main: where the top HUD bar sits, and the home-indicator strip below H
    this.ptr = { down: false, x: W / 2, y: 0, stillT: 0, lastX: W / 2 };
    this.keys = {};
    this.aim = null; // { ball, angle, serve, t }
    this.coach = store.get('aimCoach') || 0; this.coreCoach = store.get('coreCoach') || 0;
    this.serve();
  }

  // ---------- input (world coordinates) ----------
  pointerDown(x, y) {
    Object.assign(this.ptr, { down: true, x, y, stillT: 0, lastX: x, anchor: x, padAnchor: this.paddle.x });
    if (this.aim) this.aim.anchorX = x;
  }
  pointerMove(x, y) { this.ptr.x = x; this.ptr.y = y; }
  pointerUp() { this.ptr.down = false; if (this.aim) this.release(); }
  key(k, down) { this.keys[k] = down; if (k === ' ' && !down && this.aim) this.release(); }

  serve() {
    const p = this.paddle, b = makeBall(p.x, p.y - 6, 0, -this.speed, 6);
    b.caught = true; this.balls.push(b);
    this.aim = { ball: b, angle: 0, serve: true, t: 0, anchorX: this.ptr.x };
  }
  release() {
    const a = this.aim; if (!a) return;
    const b = a.ball, s = a.serve ? this.speed : Math.max(this.speed, Math.hypot(b.vx, b.vy));
    b.caught = false; b.vx = Math.sin(a.angle) * s; b.vy = -Math.cos(a.angle) * s; b.spin = 0;
    if (!a.serve) this.focus = Math.max(0, this.focus - 1);
    this.aim = null; this.timeScale = 1; sfx.paddle();
  }

  // ---------- hooks for levels ----------
  world() { return { grid: this.grid, left: this.left, right: this.right, top: this.top, bottom: this.drainY, paddle: this.paddle.stun > 0 ? null : this.paddle }; }
  hitCell(/* c, r, ball */) {}
  updateLevel(/* dt */) {}
  shotHit(/* shot */) { return false; } // a laser shot reached something the level owns (boss, serpent): true consumes it

  addScore(n, x, y) {
    const pts = Math.round(n * (1 + Math.min(this.combo, 20) * 0.1)); // multiplier caps at ×3
    this.score += pts;
    // a few readable numbers beat a wall of them
    if (x !== undefined && this.combo >= 3 && this.fx.pops.length < 4) this.fx.pop(x, y, `${pts}`, '#ffe9a8', 11);
  }
  bump(trauma, stop = 0) { if (trauma >= 0.3) navigator.vibrate?.(Math.round(trauma * 30)); this.trauma = Math.min(1, this.trauma + trauma); this.hitStop = Math.max(this.hitStop, stop); }
  brokeBrick() {
    this.combo++; this.bestCombo = Math.max(this.bestCombo, this.combo); this.bricksBroken++; this.breaks.push(this.t);
    this.focusFill += 1; if (this.focusFill >= 14 && this.focus < this.focusMax) { this.focusFill = 0; this.focus++; this.fx.pop(this.paddle.x, this.paddle.y - 24, 'AIM +1', '#e3b6ff', 13); }
    const p = this.paddle;
    if (p.charge < 1) {
      p.charge = Math.min(1, p.charge + 1 / CORE_BRICKS);
      if (p.charge >= 1) { sfx.power(); this.fx.pop(p.x, p.y - 30, this.coreCoach < 3 ? 'CORE READY · hit it dead centre' : 'CORE READY', '#ff9ef0', 13); this.coreCoach++; store.set('coreCoach', this.coreCoach); }
    }
    sfx.hit(this.combo);
  }
  // a big crash (chain, fireball, titan) earns full physics debris; a lone brick just cracks and fades
  bigCrash(ball) {
    this.breaks = this.breaks.filter(t => this.t - t < 0.3);
    return this.breaks.length >= 4 || ball?.titan > 0 || ball?.fire;
  }
  dropPower(x, y, kind) { this.drops.push({ x, y, kind, vy: 60 }); }
  applyPower(kind) {
    const p = this.paddle, P = POWER[kind];
    if (P.bad) { sfx.hurt(); this.bump(0.2); } else sfx.power();
    this.fx.pop(p.x, p.y - 26, P.label, P.bad ? '#ff8a8a' : '#fff', 16);
    if (kind === 'split') {
      const add = [];
      for (const b of this.balls) if (!b.dead && !b.caught) for (const da of [-0.35, 0.35]) {
        const c = Math.cos(da), s = Math.sin(da), nb = makeBall(b.x, b.y, b.vx * c - b.vy * s, b.vx * s + b.vy * c, 6);
        add.push(nb);
      }
      this.balls.push(...add.slice(0, 60));
    } else if (kind === 'burst') {
      for (const a of [-0.4, 0, 0.4]) this.balls.push(makeBall(p.x, p.y - 8, Math.sin(a) * this.speed, -Math.cos(a) * this.speed, 6));
    } else if (kind === 'fire') this.fireT = 8;
    else if (kind === 'wide') { p.wideT = 12; p.shrinkT = 0; }
    else if (kind === 'shrink') { p.shrinkT = 9; p.wideT = 0; }
    else if (kind === 'focus') this.focus = Math.min(this.focusMax, this.focus + 1);
    else if (kind === 'laser') { p.laserT = 7; p.laserCd = 0; }
    else if (kind === 'shield') { this.shield = 2; this.shieldT = 16; }
    else if (kind === 'slow') this.slowT = 8;
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
    const tw = p.baseW * (p.wideT > 0 ? 1.55 : 1) * (p.shrinkT > 0 ? 0.62 : 1);
    p.w += (tw - p.w) * Math.min(1, dtReal * 10);
    for (const k of ['wideT', 'shrinkT', 'laserT']) if (p[k] > 0) p[k] -= dt;
    if (p.stun > 0) p.stun -= dt;
    const lo = this.left + p.w / 2, hi = this.right - p.w / 2;
    if (this.aim) {
      const a = this.aim; a.t += dtReal;
      if (ptr.down) a.angle = Math.max(-1.15, Math.min(1.15, (ptr.x - a.anchorX) * 0.012 + (a.base || 0)));
      if (this.keys.ArrowLeft) a.angle = Math.max(-1.15, a.angle - dtReal * 1.6);
      if (this.keys.ArrowRight) a.angle = Math.min(1.15, a.angle + dtReal * 1.6);
      a.ball.x = p.x + Math.sin(a.angle) * 2; a.ball.y = p.y - a.ball.r - 1;
      if (!a.serve && a.t > 1.6) this.release(); // Focus can't freeze the game forever
    } else if (p.stun <= 0) {
      let tx = p.x;
      if (ptr.down) {
        tx = ptr.padAnchor + (ptr.x - ptr.anchor) * DRAG_GAIN;
        // pinned against a wall: re-anchor so the paddle comes straight back when the thumb reverses
        if (tx < lo || tx > hi) { tx = Math.max(lo, Math.min(hi, tx)); ptr.padAnchor = tx; ptr.anchor = ptr.x; }
      }
      if (this.keys.ArrowLeft) tx = p.x - 460 * dtReal;
      if (this.keys.ArrowRight) tx = p.x + 460 * dtReal;
      p.x += (tx - p.x) * Math.min(1, dtReal * 45);
    }
    p.x = Math.max(lo, Math.min(hi, p.x));
    p.vx = (p.x - prevX) / Math.max(dtReal, 1e-4);

    if (this.fireT > 0) this.fireT -= dt;
    if (this.slowT > 0) this.slowT -= dt;
    if (this.shieldT > 0 && (this.shieldT -= dt) <= 0) this.shield = 0;
    const fire = this.fireT > 0, ballDt = dt * (this.slowT > 0 ? 0.68 : 1);
    const world = this.world();
    world.onHit = (c, r, b) => this.hitCell(c, r, b);
    world.onWall = () => sfx.wall();
    world.onPaddle = b => this.onPaddle(b);
    world.onLost = b => this.fx.ring(b.x, this.drainY, '#ff4d5e', 16);
    for (const b of this.balls) {
      if (b.caught) continue;
      b.fire = fire;
      if (b.titan > 0 && (b.titan -= dt) <= 0) { b.titan = 0; b.r = 6; }
      stepBall(b, ballDt, world);
      if (this.shield > 0 && !b.dead && b.vy > 0 && b.y + b.r >= this.shieldY) { // the shield saves the ball once per charge
        b.y = this.shieldY - b.r; b.vy = -Math.abs(b.vy); this.shield--; if (!this.shield) this.shieldT = 0;
        this.fx.ring(b.x, this.shieldY, '#7ff5e6', 26); sfx.tough(); this.bump(0.1);
      }
    }
    const before = this.balls.length;
    this.balls = this.balls.filter(b => !b.dead);
    if (before && !this.balls.length && this.state === 'play') this.loseBall();

    this.updateShots(dt);
    for (const d of this.drops) {
      d.vy += 120 * dt; d.y += d.vy * dt;
      if (d.y > p.y - 8 && d.y < p.y + p.h + 6 && Math.abs(d.x - p.x) < p.w / 2 + 16) { d.got = true; this.applyPower(d.kind); }
    }
    this.drops = this.drops.filter(d => !d.got && d.y < this.drainY + 10);

    this.updateLevel(dt, dtReal);
    this.fx.update(dt, this.drainY);
    this.trauma = Math.max(0, this.trauma - dtReal * 1.6);
  }
  updateShots(dt) {
    const p = this.paddle;
    if (p.laserT > 0 && p.stun <= 0 && !this.aim && (p.laserCd -= dt) <= 0) {
      p.laserCd = 0.3;
      for (const sx of [-1, 1]) this.shots.push({ x: p.x + sx * (p.w / 2 - 7), y: p.y - 4, vy: -560 });
      sfx.zap();
    }
    const G = this.grid;
    for (const s of this.shots) {
      s.y += s.vy * dt;
      if (s.y < this.top) { s.dead = true; continue; }
      if (this.shotHit(s)) { s.dead = true; continue; }
      if (G) {
        const c = Math.floor((s.x - G.ox) / G.cw), r = Math.floor((s.y - G.oy) / G.ch);
        if (cellAt(G, c, r)) { s.dead = true; this.fx.ring(s.x, s.y, '#ff8fa3', 8); this.hitCell(c, r, { x: s.x, y: s.y, vx: 0, vy: s.vy, r: 2, shot: true }); }
      }
    }
    this.shots = this.shots.filter(s => !s.dead);
  }

  onPaddle(b) {
    const p = this.paddle, ptr = this.ptr;
    this.combo = 0; sfx.paddle();
    this.fx.ring(b.x, p.y, this.accent, 18);
    // rally: each return is a touch faster
    const s = Math.hypot(b.vx, b.vy), ns = Math.min(this.speed * RALLY_MAX, s * 1.012);
    b.vx *= ns / s; b.vy *= ns / s;
    if (p.charge >= 1 && Math.abs(b.x - p.x) <= CORE_HALF + 1) { // dead centre on a charged core: TITAN
      p.charge = 0; b.titan = 7; b.r = 10;
      this.fx.ring(b.x, p.y, '#ff6fe0', 46); this.fx.pop(p.x, p.y - 34, 'TITAN!', '#ff9ef0', 26);
      sfx.boom(); sfx.power(); this.bump(0.45, 0.06);
    }
    const steady = (ptr.down && ptr.stillT > 0.12) || this.keys[' '];
    if (steady && this.focus >= 1 && !this.aim) { // Focus aim: catch the ball, slow time, let the player aim
      b.caught = true;
      const base = Math.atan2(b.vx, -b.vy);
      this.aim = { ball: b, angle: base, base, serve: false, t: 0, anchorX: ptr.x };
      this.timeScale = FOCUS_SLOW;
      if (this.coach < 3) { this.coach++; store.set('aimCoach', this.coach); }
    }
  }
  loseBall() {
    this.lives--; sfx.lose(); this.bump(0.5); this.combo = 0; this.fireT = 0;
    if (this.lives <= 0) { this.fail('Out of balls'); return; }
    this.serve();
  }
  fail(reason) { if (this.state !== 'play') return; this.state = 'lost'; this.reason = reason; this.timeScale = 1; this.aim = null; }
  win() { if (this.state !== 'play') return; this.state = 'won'; this.timeScale = 1; this.aim = null; }
  // after a continue (ad, purchase, or free): back in play with a fresh ball; levels also undo what beat you
  continueRun() {
    this.state = 'play'; this.reason = ''; this.resultSaved = false; this.timeScale = 1;
    this.lives = Math.max(this.lives, 1); this.balls = this.balls.filter(b => !b.dead);
    if (!this.balls.length) this.serve();
    this.shield = 2; this.shieldT = 10; this.paddle.stun = 0;
    this.fx.pop(this.W / 2, this.paddle.y - 60, 'BACK IN!', '#7bf2c8', 26); sfx.power();
  }

  // ---------- drawing ----------
  shakeOffset() {
    const s = this.trauma * this.trauma * 9;
    return [Math.sin(this.t * 61) * s, Math.cos(this.t * 47) * s * 0.8];
  }
  // the control deck under the paddle: where the thumb lives, kept clear of the play
  drawDeck(g) {
    const { W, H } = this, y = this.deckY, p = this.paddle;
    const dg = g.createLinearGradient(0, y, 0, y + 40);
    dg.addColorStop(0, 'rgba(4,5,14,0.5)'); dg.addColorStop(1, 'rgba(4,5,14,0.78)');
    g.fillStyle = dg; g.fillRect(0, y, W, H + this.inB + 2 - y);
    g.fillStyle = 'rgba(255,255,255,0.1)'; g.fillRect(0, y, W, 1);
    // the drain: a faint red line the ball must never cross
    g.fillStyle = 'rgba(255,77,94,0.18)'; g.fillRect(this.left, this.drainY, this.right - this.left, 1);
    // a grooved track with a grip that follows the paddle, so it is obvious where to drag
    const ty = y + Math.min(62, (H - y) * 0.42);
    g.fillStyle = 'rgba(0,0,0,0.45)'; rrect(g, 24, ty - 3, W - 48, 6, 3); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.06)'; rrect(g, 24, ty + 1, W - 48, 2, 1); g.fill();
    const on = this.ptr.down, gw = 46, gx = Math.max(24, Math.min(W - 24 - gw, p.x - gw / 2));
    g.fillStyle = on ? shade(this.accent, 0.2) : 'rgba(200,210,240,0.35)'; rrect(g, gx, ty - 5, gw, 10, 5); g.fill();
    g.fillStyle = 'rgba(0,0,0,0.35)'; for (let i = -1; i <= 1; i++) g.fillRect(gx + gw / 2 - 0.6 + i * 6, ty - 2.5, 1.2, 5);
    if (this.t < 7 || (this.aim?.serve && this.t < 12)) {
      g.globalAlpha = Math.min(1, Math.max(0.35, 7 - this.t));
      text(g, 'Drag anywhere down here to move', W / 2, ty + 22, 12, 'rgba(220,226,255,0.75)', 'center');
      g.globalAlpha = 1;
    }
  }
  drawPaddle(g) {
    const p = this.paddle, x = p.x - p.w / 2, y = p.y, h = p.h, ptr = this.ptr;
    const stun = p.stun > 0 && Math.floor(this.t * 20) % 2;
    // Focus armed: thumb held still with a pip to spend; brackets show the next ball will be caught
    if (ptr.down && ptr.stillT > 0.12 && this.focus >= 1 && !this.aim && p.stun <= 0) {
      const k = Math.min(1, (ptr.stillT - 0.12) * 8);
      g.strokeStyle = `rgba(227,182,255,${0.8 * k})`; g.lineWidth = 2;
      for (const s of [-1, 1]) { const ex = p.x + s * (p.w / 2 + 5); g.beginPath(); g.moveTo(ex - s * 6, y - 9); g.lineTo(ex, y - 9); g.lineTo(ex, y + 3); g.stroke(); }
      g.globalAlpha = k * 0.9; text(g, 'CATCH READY', p.x, y - 18, 11, '#e3b6ff', 'center'); g.globalAlpha = 1;
    }
    if (this.shield > 0) { // energy barrier below the paddle, one segment per save left
      const a = 0.55 + 0.25 * Math.sin(this.t * 8), sy = this.shieldY;
      g.save(); g.globalCompositeOperation = 'lighter';
      const sg = g.createLinearGradient(0, sy - 4, 0, sy + 4); sg.addColorStop(0, 'rgba(46,196,182,0)'); sg.addColorStop(0.5, `rgba(127,245,230,${a})`); sg.addColorStop(1, 'rgba(46,196,182,0)');
      g.fillStyle = sg; g.fillRect(this.left, sy - 4, this.right - this.left, 8);
      if (this.shield > 1) { g.globalAlpha = a * 0.5; g.fillRect(this.left, sy + 3, this.right - this.left, 4); }
      g.restore();
    }
    g.fillStyle = 'rgba(0,0,0,0.35)'; rrect(g, x + SHADOW.dx, y + SHADOW.dy + 2, p.w, h, h / 2); g.fill();
    const L = SPR.paddle_l, M = SPR.paddle_m, R = SPR.paddle_r;
    if (ready(L) && ready(M) && ready(R)) { // rendered chrome paddle: two end caps and a middle stretched to the width
      g.drawImage(L.img, x - 4, y - 4, 16, 20); g.drawImage(M.img, x + 12, y - 4, p.w - 24, 20); g.drawImage(R.img, x + p.w - 12, y - 4, 16, 20);
    } else {
      const gr = g.createLinearGradient(0, y, 0, y + h + 3);
      gr.addColorStop(0, '#eef2f8'); gr.addColorStop(0.35, '#a9b2c6'); gr.addColorStop(0.55, '#4b5370'); gr.addColorStop(1, '#232840');
      g.fillStyle = '#1a1e30'; rrect(g, x, y + 3, p.w, h, h / 2); g.fill();
      g.fillStyle = gr; rrect(g, x, y, p.w, h, h / 2); g.fill();
    }
    if (p.laserT > 0) for (const s of [-1, 1]) { // twin emitters on the ends
      const ex = p.x + s * (p.w / 2 - 7), on = Math.max(0, 1 - p.laserCd / 0.3);
      g.fillStyle = '#5a1020'; rrect(g, ex - 3, y - 5, 6, 7, 2); g.fill();
      g.fillStyle = `rgba(255,${120 + on * 100},${140 + on * 80},1)`; rrect(g, ex - 1.6, y - 6.5, 3.2, 3.5, 1.5); g.fill();
    }
    this.drawCore(g, p.x, y + h / 2 - 1);
    if (p.shrinkT > 0) { g.globalAlpha = 0.25 + 0.1 * Math.sin(this.t * 10); g.fillStyle = '#ff4d5e'; rrect(g, x, y, p.w, h, h / 2); g.fill(); g.globalAlpha = 1; }
    if (stun) { g.globalAlpha = 0.45; g.fillStyle = '#ff4d5e'; rrect(g, x, y, p.w, h, h / 2); g.fill(); g.globalAlpha = 1; }
  }
  drawCore(g, cx, cy) { // the sweet spot: a gem that fills as bricks break and blazes when a centre hit will make a TITAN
    const p = this.paddle, c = p.charge, full = c >= 1, s = 4.2;
    const dia = (r) => { g.beginPath(); g.moveTo(cx, cy - r); g.lineTo(cx + r * 1.25, cy); g.lineTo(cx, cy + r); g.lineTo(cx - r * 1.25, cy); g.closePath(); };
    g.fillStyle = 'rgba(20,10,30,0.85)'; dia(s + 1.2); g.fill();
    g.save(); dia(s); g.clip();
    g.fillStyle = '#3a1640'; g.fillRect(cx - 8, cy - 8, 16, 16);
    const fg = g.createLinearGradient(0, cy + s, 0, cy - s); fg.addColorStop(0, '#ff3fd0'); fg.addColorStop(1, '#8fe9ff');
    g.fillStyle = fg; g.fillRect(cx - 8, cy + s - 2 * s * c, 16, 2 * s * c);
    g.restore();
    if (full) {
      const pulse = 0.6 + 0.4 * Math.sin(this.t * 9);
      g.save(); g.globalCompositeOperation = 'lighter';
      const hg = g.createRadialGradient(cx, cy, 1, cx, cy, 16); hg.addColorStop(0, `rgba(255,120,230,${0.8 * pulse})`); hg.addColorStop(1, 'rgba(255,120,230,0)');
      g.fillStyle = hg; g.fillRect(cx - 16, cy - 16, 32, 32);
      g.strokeStyle = `rgba(255,200,250,${0.5 * pulse})`; g.lineWidth = 1;
      g.beginPath(); g.moveTo(cx - CORE_HALF, cy - 9); g.lineTo(cx - CORE_HALF, cy - 5); g.moveTo(cx + CORE_HALF, cy - 9); g.lineTo(cx + CORE_HALF, cy - 5); g.stroke();
      g.restore();
    }
    g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.ellipse(cx - 1.2, cy - 1.6, 1.4, 0.8, -0.5, 0, 7); g.fill();
  }
  drawShots(g) {
    for (const s of this.shots) {
      g.fillStyle = 'rgba(255,77,109,0.35)'; rrect(g, s.x - 2.5, s.y - 2, 5, 14, 2.5); g.fill();
      g.fillStyle = '#ffd0da'; rrect(g, s.x - 1, s.y, 2, 10, 1); g.fill();
    }
  }
  drawBalls(g) { this.drawShots(g); for (const b of this.balls) drawBall(g, b); }
  drawDrops(g) {
    for (const d of this.drops) {
      g.fillStyle = 'rgba(0,0,0,0.3)'; rrect(g, d.x - 20 + SHADOW.dx, d.y - 8 + SHADOW.dy, 40, 16, 8); g.fill();
      const C = SPR['cap_' + d.kind], P = POWER[d.kind];
      if (ready(C)) { g.drawImage(C.img, d.x - 24, d.y - 13, 48, 26); text(g, P.label, d.x, d.y + 0.5, P.label.length > 4 ? 9.5 : 11, '#fff', 'center'); }
      else g.drawImage(capsule(d.kind), d.x - 20, d.y - 9, 40, 18);
      if (P.bad) { g.strokeStyle = `rgba(255,77,94,${0.5 + 0.4 * Math.sin(this.t * 12)})`; g.lineWidth = 1.5; rrect(g, d.x - 21, d.y - 9, 42, 18, 9); g.stroke(); }
    }
  }
  drawAim(g, P = (x, y) => [x, y]) { // P maps world to screen (identity in 2D, projection in 3D)
    this.drawCoach(g);
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
      const [x, y] = P(pts[i], pts[i + 1]);
      g.beginPath(); g.arc(x, y, 1.8 * k + 0.6, 0, 7); g.fill();
    }
    g.globalAlpha = 1;
    if (stop) { const [x, y] = P(sim.x, sim.y); g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, 7, 0, 7); g.stroke(); }
    if (!a.serve) { // remaining hold time
      g.strokeStyle = '#e3b6ff'; g.lineWidth = 2.5;
      const [bx, by] = P(a.ball.x, a.ball.y);
      g.beginPath(); g.arc(bx, by, 12, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - a.t / 1.6)); g.stroke();
      text(g, 'Slide to aim · lift to fire', this.W / 2, this.paddle.y + 22, 12, '#e3b6ff', 'center');
    }
  }
  // Teaches Focus aim until the player has used it a few times: as a ball drops toward the paddle, a callout says to hold still
  drawCoach(g) {
    if (this.coach >= 3 || this.aim || this.focus < 1 || this.state !== 'play' || this.t < 4) return;
    const p = this.paddle;
    const near = this.balls.some(b => !b.caught && b.vy > 0 && b.y > p.y - 170 && b.y < p.y);
    this.coachK = Math.max(0, Math.min(1, (this.coachK || 0) + (near ? 0.08 : -0.05)));
    if (this.coachK <= 0) return;
    const armed = this.ptr.down && this.ptr.stillT > 0.12;
    const msg = armed ? 'Keep holding… it will catch' : 'HOLD STILL as it lands to catch & aim', bx = Math.max(110, Math.min(this.W - 110, p.x)), by = p.y + 22;
    g.globalAlpha = this.coachK;
    g.font = '12px "Lilita One", system-ui'; const w = g.measureText(msg).width + 22;
    g.fillStyle = 'rgba(40,16,60,0.92)'; rrect(g, bx - w / 2, by - 11, w, 22, 11); g.fill();
    g.strokeStyle = '#c46bf0'; g.lineWidth = 1.2; g.stroke();
    text(g, msg, bx, by + 0.5, 12, '#f1d6ff', 'center');
    g.globalAlpha = 1;
  }
  drawHUDBase(g) {
    const y = this.H - 22;
    // lives as little steel balls
    for (let i = 0; i < 3; i++) drawBall(g, { x: 24 + i * 16, y, r: 5, vx: 0, vy: 0 }, i < this.lives ? 1 : 0.18);
    // active power timers
    const p = this.paddle, chips = [['fire', this.fireT, 8], ['laser', p.laserT, 7], ['wide', p.wideT, 12], ['shrink', p.shrinkT, 9], ['slow', this.slowT, 8], ['shield', this.shield ? this.shieldT : 0, 16]].filter(c => c[1] > 0);
    chips.slice(0, 3).forEach(([k, t, max], i) => {
      const x = 80 + i * 44, P = POWER[k];
      g.fillStyle = 'rgba(0,0,0,0.45)'; rrect(g, x, y - 7, 40, 14, 7); g.fill();
      g.fillStyle = shade(P.color, -0.1); rrect(g, x, y - 7, Math.max(8, 40 * Math.min(1, t / max)), 14, 7); g.fill();
      text(g, P.label, x + 20, y + 0.5, 9, '#fff', 'center');
    });
    // Focus pips
    text(g, 'AIM', this.W - 88, y, 13, '#e3b6ff', 'right');
    for (let i = 0; i < this.focusMax; i++) {
      const x = this.W - 82 + i * 22, full = i < this.focus;
      g.fillStyle = 'rgba(0,0,0,0.4)'; rrect(g, x, y - 5, 18, 10, 5); g.fill();
      if (full) { const gr = g.createLinearGradient(0, y - 5, 0, y + 5); gr.addColorStop(0, '#f1d6ff'); gr.addColorStop(1, '#9b4fd1'); g.fillStyle = gr; rrect(g, x, y - 5, 18, 10, 5); g.fill(); }
      else if (i === this.focus) { g.fillStyle = 'rgba(196,107,240,0.5)'; rrect(g, x, y - 5, 18 * this.focusFill / 14, 10, 5); g.fill(); }
    }
    const hy = this.hudY;
    text(g, this.score.toLocaleString(), this.W - 12, hy + 18, 22, '#fff', 'right', NUM);
    if (this.combo >= 5) text(g, `COMBO ×${this.combo}`, this.W - 12, hy + 42, 12, '#ffd36b', 'right');
    if (this.aim?.serve && this.t < 20) text(g, 'Slide to aim · lift to launch', this.W / 2, this.paddle.y + 22, 12, 'rgba(255,255,255,0.85)', 'center');
  }
}
export { cellAt };
