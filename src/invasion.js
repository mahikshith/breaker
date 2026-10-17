// Level 1: Invasion. A marching formation of candy bricks and toy robots steps down toward your line.
// Clear it before it lands, then take down the mothership.
import { Arena } from './arena.js';
import { makeGrid } from './physics.js';
import { brick, cached, text, vignette, drawGrain, rrect, shade, SHADOW } from './gfx.js';
import { drawInvader, drawMothership } from './characters.js';
import { sfx } from './audio.js';

const COLS = 11, ROWS = 9, CW = 28, CH = 18;
const EMPTY = 0, CANDY = 1, ARMOR = 2, POWERB = 3, BOT = 4;
const ROW_COLORS = ['#ff5d8f', '#ff8a3d', '#ffd23f', '#5ccf6a', '#2ec4b6', '#3fa8f5', '#7b6cf6', '#c46bf0', '#ff5d8f'];
const HP = { [CANDY]: 1, [ARMOR]: 3, [POWERB]: 1, [BOT]: 2 };
const DROPS = ['split', 'fire', 'burst', 'wide', 'split', 'focus'];
// 'c' candy, 'a' armor, 'p' power, 'b' robot, '.' empty
const LAYOUT = [
  '..bbbbbbb..',
  '.ccpcccpcc.',
  'ccbcbcbcbcc',
  'ccccccccccc',
  'aacaaaaacaa',
  'cbccbcbccbc',
  'ccpccccpccc',
  '.ccccccccc.',
  '..c.c.c.c..',
];
const BOSS_HP = 30;

export class Invasion extends Arena {
  constructor(W, H) {
    super(W, H, { accent: '#ff5d8f', top: 64, left: 10, right: 10 });
    this.name = 'Invasion'; this.subtitle = 'Clear the formation before it lands';
    this.homeX = (W - COLS * CW) / 2;
    this.grid = makeGrid(COLS, ROWS, CW, CH, this.homeX, 92);
    this.color = new Array(COLS * ROWS);
    LAYOUT.forEach((row, r) => [...row].forEach((ch, c) => {
      const v = { c: CANDY, a: ARMOR, p: POWERB, b: BOT }[ch] || EMPTY, k = r * COLS + c;
      this.grid.cells[k] = v; this.grid.hp[k] = HP[v] || 0;
      this.color[k] = v === ARMOR ? '#8d97b3' : v === POWERB ? '#f4c542' : ROW_COLORS[r];
    }));
    this.total = this.alive();
    this.march = { t: 1.2, dir: 1, frame: 0 };
    this.dangerY = this.paddle.y - 64;
    this.bolts = []; this.boltT = 2.5; this.hurt = new Float32Array(COLS * ROWS);
    this.phase = 'formation'; this.boss = null;
  }
  previewRect() { return { x: this.homeX - 6, y: this.grid.oy - 14, w: COLS * CW + 12, h: ROWS * CH + 70 }; }
  alive() { let n = 0; for (const v of this.grid.cells) if (v) n++; return n; }
  lowestY() {
    const G = this.grid;
    for (let r = ROWS - 1; r >= 0; r--) for (let c = 0; c < COLS; c++) if (G.cells[r * COLS + c]) return G.oy + (r + 1) * CH;
    return 0;
  }

  // ---------- rules ----------
  hitCell(c, r, b) {
    const G = this.grid, k = r * COLS + c, v = G.cells[k];
    if (!v) return;
    const x = G.ox + c * CW, y = G.oy + r * CH;
    G.hp[k] = b.fire ? 0 : G.hp[k] - 1;
    if (G.hp[k] > 0) { sfx.tough(); this.hurt[k] = 0.12; this.fx.shatter(x, y, CW, CH, this.color[k], 2, 0.5); this.bump(0.04); return; }
    G.cells[k] = EMPTY;
    this.fx.shatter(x, y, CW, CH, this.color[k], v === BOT ? 9 : 7, v === ARMOR ? 1.3 : 1);
    this.brokeBrick();
    this.addScore(v === BOT ? 60 : v === ARMOR ? 40 : 15, x + CW / 2, y);
    if (v === POWERB || (v === BOT && Math.random() < 0.2)) this.dropPower(x + CW / 2, y + CH, DROPS[(c * 7 + r) % DROPS.length]);
    if (v === BOT) { sfx.zap(); this.bump(0.12, 0.03); this.fx.ring(x + CW / 2, y + CH / 2, '#6ff7ff', 22); }
    else this.bump(0.05);
    if (this.phase === 'formation' && !this.alive()) this.startBoss();
  }

  startBoss() {
    this.phase = 'boss';
    this.boss = { x: this.W / 2, y: -40, ty: 130, hp: BOSS_HP, t: 0, hurt: 0, bombT: 2.2, w: 120, h: 34 };
    this.bolts.length = 0;
    this.fx.pop(this.W / 2, 220, 'MOTHERSHIP!', '#ff8fb1', 30);
    sfx.breach(); this.bump(0.4);
  }

  updateLevel(dt) {
    for (let i = 0; i < this.hurt.length; i++) if (this.hurt[i] > 0) this.hurt[i] -= dt;
    if (this.phase === 'formation') this.updateMarch(dt);
    if (this.phase === 'boss') this.updateBoss(dt);
    // bolts and bombs
    const p = this.paddle;
    for (const s of this.bolts) {
      s.y += s.vy * dt; s.t += dt;
      if (!s.dead && s.y + s.r > p.y && s.y - s.r < p.y + p.h && Math.abs(s.x - p.x) < p.w / 2 + s.r) {
        s.dead = true;
        if (!this.aim) { p.stun = s.bomb ? 1.1 : 0.7; sfx.hurt(); this.bump(s.bomb ? 0.55 : 0.3, 0.04); this.fx.shatter(s.x - 6, p.y - 4, 12, 8, s.bomb ? '#ff8a3d' : '#ff4d5e', 6, 0.8); this.fx.pop(p.x, p.y - 22, 'ZAPPED', '#ff7a8a', 13); }
      }
      // balls knock bolts out of the sky
      for (const b of this.balls) if (!s.dead && !b.caught && Math.hypot(b.x - s.x, b.y - s.y) < b.r + s.r + 1) { s.dead = true; this.addScore(20, s.x, s.y); this.fx.shatter(s.x - 4, s.y - 4, 8, 8, '#ff4d5e', 4, 0.6); sfx.tough(); }
    }
    this.bolts = this.bolts.filter(s => !s.dead && s.y < this.H + 20);
  }

  updateMarch(dt) {
    const G = this.grid, m = this.march, n = this.alive();
    m.t -= dt;
    if (m.t <= 0) {
      // fewer invaders, faster march (the Space Invaders rule)
      m.t = 0.25 + 0.8 * (n / this.total);
      m.frame ^= 1;
      const nx = G.ox + m.dir * 7, range = 14;
      if (Math.abs(nx - this.homeX) > range) { m.dir *= -1; G.oy += 14; this.bump(0.05); sfx.beat(); }
      else { G.ox = nx; sfx.chew(); }
      // keep balls from being swallowed by a step: push any ball that is now inside a brick out below it
      for (const b of this.balls) {
        if (b.caught) continue;
        const c = Math.floor((b.x - G.ox) / CW), r = Math.floor((b.y - G.oy) / CH);
        if (c >= 0 && r >= 0 && c < COLS && r < ROWS && G.cells[r * COLS + c]) { b.y = G.oy + (r + 1) * CH + b.r + 0.5; b.vy = Math.abs(b.vy); }
      }
    }
    if (this.lowestY() >= this.dangerY) { this.fx.pop(this.W / 2, this.dangerY - 20, 'THEY LANDED', '#ff4d5e', 24); sfx.hurt(); this.bump(0.9); this.fail('The formation landed'); }
    // robots fire, more often as the formation shrinks
    this.boltT -= dt;
    if (this.boltT <= 0) {
      this.boltT = 1.1 + 1.8 * (n / this.total) + Math.random() * 0.8;
      const shooters = [];
      for (let c = 0; c < COLS; c++) for (let r = ROWS - 1; r >= 0; r--) {
        const v = G.cells[r * COLS + c];
        if (!v) continue;
        if (v === BOT) shooters.push([c, r]);
        break; // only the lowest brick in a column has a clear shot
      }
      if (shooters.length) {
        // prefer the robot nearest above the paddle so bolts feel aimed
        shooters.sort((a, b) => Math.abs(G.ox + a[0] * CW - this.paddle.x) - Math.abs(G.ox + b[0] * CW - this.paddle.x));
        const [c, r] = shooters[Math.random() < 0.6 ? 0 : (Math.random() * shooters.length) | 0];
        this.bolts.push({ x: G.ox + c * CW + CW / 2, y: G.oy + (r + 1) * CH, vy: 170, r: 3.5, t: 0 });
        sfx.zap();
      }
    }
  }

  updateBoss(dt) {
    const B = this.boss;
    B.t += dt; B.hurt = Math.max(0, B.hurt - dt);
    B.y += (B.ty - B.y) * Math.min(1, dt * 2);
    const rage = 1 - B.hp / BOSS_HP;
    B.x = this.W / 2 + Math.sin(B.t * (0.7 + rage * 0.8)) * (this.W / 2 - 80);
    B.bombT -= dt;
    if (B.bombT <= 0 && B.y > B.ty - 10) {
      B.bombT = 1.9 - rage * 0.9;
      this.bolts.push({ x: B.x, y: B.y + 18, vy: 150 + rage * 70, r: 6, t: 0, bomb: true });
      sfx.zap();
    }
    for (const b of this.balls) {
      if (b.caught) continue;
      // saucer is an ellipse; test the ball against it in a stretched space
      const ex = 60 + b.r, ey = 18 + b.r, dx = (b.x - B.x) / ex, dy = (b.y - (B.y - 2)) / ey, d = Math.hypot(dx, dy);
      if (d >= 1 || (b.hitBoss && B.t - b.hitBoss < 0.08)) continue;
      let nx = dx / ex, ny = dy / ey; const m = Math.hypot(nx, ny) || 1; nx /= m; ny /= m;
      const vn = b.vx * nx + b.vy * ny;
      if (vn < 0) { b.vx -= 2 * vn * nx; b.vy -= 2 * vn * ny; }
      b.x = B.x + dx / d * ex * 1.01; b.y = B.y - 2 + dy / d * ey * 1.01; b.hitBoss = B.t;
      B.hp -= b.fire ? 3 : 1; B.hurt = 0.1;
      this.combo++; this.bestCombo = Math.max(this.bestCombo, this.combo); sfx.hit(this.combo);
      this.addScore(80, b.x, b.y - 10); this.bump(0.18, 0.04);
      this.fx.shatter(b.x - 6, b.y - 6, 12, 12, '#c9d1e2', 4, 0.9);
      if (B.hp % 6 === 0 && B.hp > 0) this.dropPower(B.x, B.y + 20, DROPS[(B.hp / 6) % DROPS.length]);
      if (B.hp <= 0) { this.killBoss(); return; }
    }
  }
  killBoss() {
    const B = this.boss;
    for (let i = 0; i < 6; i++) this.fx.shatter(B.x - 60 + i * 20, B.y - 14, 20, 28, ['#c9d1e2', '#ff5d8f', '#ffd23f'][i % 3], 8, 1.8);
    this.fx.ring(B.x, B.y, '#ffffff', 90);
    this.fx.pop(this.W / 2, 220, 'INVASION OVER', '#ffe08a', 30);
    this.addScore(2000 + this.lives * 500);
    sfx.boom(); sfx.win(); this.bump(1, 0.2);
    this.boss = null; this.phase = 'done'; this.bolts.length = 0;
    setTimeout(() => this.win(), 1200);
  }

  // ---------- drawing ----------
  draw(g) {
    const { W, H } = this, G = this.grid;
    g.drawImage(this.background(), 0, 0, W, H);
    // danger line: hazard stripes the formation must never touch
    const near = this.phase === 'formation' ? Math.max(0, 1 - (this.dangerY - this.lowestY()) / 140) : 0;
    this.drawHazard(g, this.dangerY, near);
    const [sx, sy] = this.shakeOffset();
    g.save(); g.translate(sx, sy);
    // shadows
    g.fillStyle = 'rgba(0,0,0,0.38)';
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const k = r * COLS + c, v = G.cells[k]; if (!v || v === BOT) continue;
      rrect(g, G.ox + c * CW + 1 + SHADOW.dx, G.oy + r * CH + 1 + SHADOW.dy, CW - 2, CH - 2, 4); g.fill();
    }
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const k = r * COLS + c, v = G.cells[k]; if (!v) continue;
      const x = G.ox + c * CW, y = G.oy + r * CH;
      if (v === BOT) {
        const look = Math.max(-1, Math.min(1, (this.paddle.x - (x + CW / 2)) / 120));
        g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.ellipse(x + CW / 2 + SHADOW.dx, y + CH + 1, CW * 0.35, 2.5, 0, 0, 7); g.fill();
        drawInvader(g, x, y, CW, CH, this.color[k], this.march.frame, look, this.hurt[k]);
        if (G.hp[k] === 1) { g.strokeStyle = 'rgba(20,10,30,0.6)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 8, y + 3); g.lineTo(x + 11, y + 7); g.lineTo(x + 9, y + 10); g.stroke(); }
        continue;
      }
      const crack = v === ARMOR ? 3 - G.hp[k] : 0;
      const spr = brick(this.color[k], CW - 2, CH - 4, { depth: 4, metal: v === ARMOR, glyph: v === ARMOR ? 'rivet' : v === POWERB ? 'gem' : '', crack });
      if (this.hurt[k] > 0) g.globalAlpha = 0.6;
      g.drawImage(spr, x + 1, y + 1, CW - 2, CH);
      g.globalAlpha = 1;
    }
    if (this.boss) drawMothership(g, this.boss.x, this.boss.y, this.boss.t, this.boss.hurt, this.boss.hp / BOSS_HP);
    for (const s of this.bolts) this.drawBolt(g, s);
    this.drawDrops(g); this.drawPaddle(g); this.drawBalls(g); this.fx.draw(g); this.drawAim(g);
    g.restore();
    if (near > 0.4) {
      const a = (near - 0.4) * 0.6 * (0.6 + 0.4 * Math.sin(this.t * 8));
      const vg = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75);
      vg.addColorStop(0, 'rgba(160,0,30,0)'); vg.addColorStop(1, `rgba(160,0,30,${a})`); g.fillStyle = vg; g.fillRect(0, 0, W, H);
    }
    this.drawHUD(g);
  }
  drawBolt(g, s) {
    if (s.bomb) {
      g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.arc(s.x + SHADOW.dx, s.y + SHADOW.dy, s.r, 0, 7); g.fill();
      const gr = g.createRadialGradient(s.x - 2, s.y - 2, 0.5, s.x, s.y, s.r);
      gr.addColorStop(0, '#8a90a8'); gr.addColorStop(0.6, '#2e3248'); gr.addColorStop(1, '#14162a');
      g.fillStyle = gr; g.beginPath(); g.arc(s.x, s.y, s.r, 0, 7); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.arc(s.x - 2, s.y - 2.4, 1.4, 0, 7); g.fill();
      const on = Math.floor(s.t * 12) % 2;
      g.fillStyle = on ? '#ffd23f' : '#ff8a3d'; g.beginPath(); g.arc(s.x, s.y - s.r - 1.5, on ? 2 : 1.4, 0, 7); g.fill();
      return;
    }
    // glossy red pill
    const x = s.x - 2.5, y = s.y - 7, w = 5, h = 12;
    g.fillStyle = 'rgba(0,0,0,0.3)'; rrect(g, x + 2, y + 3, w, h, 2.5); g.fill();
    const gr = g.createLinearGradient(x, 0, x + w, 0);
    gr.addColorStop(0, '#ffb3bc'); gr.addColorStop(0.45, '#ff4d5e'); gr.addColorStop(1, '#8a1022');
    g.fillStyle = gr; rrect(g, x, y, w, h, 2.5); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.7)'; rrect(g, x + 1, y + 1.5, 1.4, 5, 0.7); g.fill();
  }
  drawHazard(g, y, near) {
    const W = this.W;
    g.save(); g.beginPath(); g.rect(this.left, y - 3, this.right - this.left, 6); g.clip();
    g.fillStyle = '#1b1d2e'; g.fillRect(0, y - 3, W, 6);
    g.fillStyle = near > 0.5 && Math.floor(this.t * 6) % 2 ? '#ff4d5e' : '#f4c542';
    for (let x = -10; x < W + 10; x += 14) { g.beginPath(); g.moveTo(x, y + 3); g.lineTo(x + 7, y - 3); g.lineTo(x + 12, y - 3); g.lineTo(x + 5, y + 3); g.closePath(); g.fill(); }
    g.restore();
    g.globalAlpha = 0.5 + near * 0.4;
    g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(this.left, y + 3, this.right - this.left, 2);
    g.globalAlpha = 1;
  }
  drawHUD(g) {
    const W = this.W;
    if (this.phase === 'formation') {
      const n = this.alive();
      text(g, 'FORMATION', 52, 24, 13, '#ffb3c8');
      const x1 = W - 150, y = 44, f = n / this.total;
      g.fillStyle = 'rgba(0,0,0,0.45)'; rrect(g, 52, y - 6, x1 - 52, 12, 6); g.fill();
      const mg = g.createLinearGradient(0, y - 6, 0, y + 6); mg.addColorStop(0, '#ffa3bf'); mg.addColorStop(1, '#c2305e');
      g.fillStyle = mg; rrect(g, 52, y - 6, Math.max(12, (x1 - 52) * f), 12, 6); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.35)'; rrect(g, 56, y - 4, Math.max(4, (x1 - 60) * f), 3, 1.5); g.fill();
      text(g, `${n} left`, x1 + 8, y, 12, '#fff');
    } else if (this.boss) {
      text(g, 'MOTHERSHIP', 52, 24, 13, '#ffb3c8');
      const x1 = W - 150, y = 44, f = Math.max(0, this.boss.hp / BOSS_HP);
      g.fillStyle = 'rgba(0,0,0,0.45)'; rrect(g, 52, y - 6, x1 - 52, 12, 6); g.fill();
      const mg = g.createLinearGradient(0, y - 6, 0, y + 6); mg.addColorStop(0, '#ffe08a'); mg.addColorStop(1, '#e0602a');
      g.fillStyle = mg; rrect(g, 52, y - 6, Math.max(12, (x1 - 52) * f), 12, 6); g.fill();
      text(g, `${this.boss.hp} HP`, x1 + 8, y, 12, '#fff');
    }
    this.drawHUDBase(g);
  }
  background() {
    return cached('inv-bg' + this.W + 'x' + this.H, this.W, this.H, g => {
      const { W, H } = this;
      const bg = g.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#1a1f36'); bg.addColorStop(0.6, '#12162a'); bg.addColorStop(1, '#0a0c18');
      g.fillStyle = bg; g.fillRect(0, 0, W, H);
      // hangar window with a planet, high up behind the formation
      const wx = 30, wy = 70, ww = W - 60, wh = 210;
      const sky = g.createLinearGradient(0, wy, 0, wy + wh);
      sky.addColorStop(0, '#0c1030'); sky.addColorStop(1, '#2a1846');
      g.fillStyle = sky; rrect(g, wx, wy, ww, wh, 18); g.fill();
      g.save(); rrect(g, wx, wy, ww, wh, 18); g.clip();
      let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      for (let i = 0; i < 70; i++) { g.globalAlpha = 0.25 + rnd() * 0.6; g.fillStyle = '#fff'; g.beginPath(); g.arc(wx + rnd() * ww, wy + rnd() * wh, rnd() * 1.1 + 0.3, 0, 7); g.fill(); }
      g.globalAlpha = 1;
      const pg = g.createRadialGradient(W * 0.68, wy + wh * 0.95, 10, W * 0.75, wy + wh * 1.15, 140);
      pg.addColorStop(0, '#ff9a6b'); pg.addColorStop(0.5, '#b8456e'); pg.addColorStop(1, '#3a1846');
      g.fillStyle = pg; g.beginPath(); g.arc(W * 0.75, wy + wh * 1.15, 130, 0, 7); g.fill();
      g.fillStyle = 'rgba(255,220,200,0.25)'; g.beginPath(); g.ellipse(W * 0.66, wy + wh * 0.82, 60, 6, -0.2, 0, 7); g.fill();
      // glass reflection
      const rg = g.createLinearGradient(wx, wy, wx + ww, wy + wh);
      rg.addColorStop(0, 'rgba(255,255,255,0.08)'); rg.addColorStop(0.3, 'rgba(255,255,255,0)'); rg.addColorStop(0.55, 'rgba(255,255,255,0.05)'); rg.addColorStop(0.6, 'rgba(255,255,255,0)');
      g.fillStyle = rg; g.fillRect(wx, wy, ww, wh);
      g.restore();
      // window frame with mullions
      g.strokeStyle = '#3a415e'; g.lineWidth = 6; rrect(g, wx, wy, ww, wh, 18); g.stroke();
      g.strokeStyle = 'rgba(255,255,255,0.12)'; g.lineWidth = 1; rrect(g, wx - 3, wy - 3, ww + 6, wh + 6, 20); g.stroke();
      g.fillStyle = '#3a415e'; g.fillRect(W / 2 - 2, wy, 4, wh);
      // steel wall panels below the window
      for (let y = wy + wh + 30, row = 0; y < H; y += 58, row++) for (let x = (row % 2) * -45; x < W; x += 90) {
        const sg = g.createLinearGradient(x, y, x, y + 58);
        sg.addColorStop(0, 'rgba(255,255,255,0.04)'); sg.addColorStop(1, 'rgba(0,0,0,0.12)');
        g.fillStyle = sg; g.fillRect(x + 1, y + 1, 88, 56);
        g.strokeStyle = 'rgba(0,0,0,0.4)'; g.strokeRect(x + 0.5, y + 0.5, 89, 57);
        for (const [rx, ry] of [[6, 6], [83, 6], [6, 51], [83, 51]]) { g.fillStyle = 'rgba(255,255,255,0.1)'; g.beginPath(); g.arc(x + rx, y + ry, 1.3, 0, 7); g.fill(); }
      }
      // side rails (the walls the ball bounces off)
      for (const x of [0, W - this.left]) {
        const sg = g.createLinearGradient(x, 0, x + this.left, 0);
        sg.addColorStop(0, '#2a3048'); sg.addColorStop(0.5, '#5a6384'); sg.addColorStop(1, '#22273d');
        g.fillStyle = sg; g.fillRect(x, 0, this.left, H);
      }
      const tg = g.createLinearGradient(0, this.top - 8, 0, this.top);
      tg.addColorStop(0, '#22273d'); tg.addColorStop(1, '#5a6384');
      g.fillStyle = tg; g.fillRect(0, this.top - 8, W, 8);
      // floor glow under the paddle
      const fg = g.createRadialGradient(W / 2, H - 70, 10, W / 2, H - 70, W * 0.7);
      fg.addColorStop(0, 'rgba(255,93,143,0.10)'); fg.addColorStop(1, 'rgba(255,93,143,0)');
      g.fillStyle = fg; g.fillRect(0, H * 0.5, W, H * 0.5);
      vignette(g, W, H, 0.55);
      drawGrain(g, W, H);
    });
  }
  result() {
    const stars = this.state !== 'won' ? 0 : 1 + (this.lives >= 2 ? 1 : 0) + (this.lives >= 3 && this.bestCombo >= 12 ? 1 : 0);
    return { stars, lines: [['Score', this.score.toLocaleString()], ['Lives left', this.lives], ['Best combo', `×${this.bestCombo}`]] };
  }
}
