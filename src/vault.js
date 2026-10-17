// Level 2: Vault rescue. Carve a tunnel to the fox before the serpent chews its way there.
import { Arena } from './arena.js';
import { makeGrid, cellAt, floodEmpty, makeBall } from './physics.js';
import { brick, cached, text, vignette, drawGrain, rrect, shade, NUM } from './gfx.js';
import { drawFox, drawSerpent } from './characters.js';
import { sfx } from './audio.js';

const COLS = 20, ROWS = 28, CW = 16, CH = 12;
const EMPTY = 0, SAND = 1, TEAL = 2, GOLD = 3, ROCK = 9;
const COLORS = { [SAND]: '#e7b97a', [TEAL]: '#2aa198', [GOLD]: '#f4c542', [ROCK]: '#4a4f6a' };
const HP = { [SAND]: 1, [TEAL]: 2, [GOLD]: 1 };
const CHEW = { [EMPTY]: 0.42, [SAND]: 3.2, [TEAL]: 5.5, [GOLD]: 3.2 }; // seconds the serpent needs per cell
const POCKET = { c0: 8, c1: 11, r0: 3, r1: 5 };
const DROPS = ['split', 'fire', 'wide', 'focus', 'burst', 'split'];

export class Vault extends Arena {
  constructor(W, H) {
    super(W, H, { accent: '#f4c542', top: 70 });
    this.name = 'The Vault'; this.subtitle = 'Free the fox before the serpent gets there';
    const ox = (W - COLS * CW) / 2;
    this.grid = makeGrid(COLS, ROWS, CW, CH, ox, 84);
    this.left = ox; this.right = ox + COLS * CW;
    this.paddle.y = Math.min(H - 104, this.grid.oy + ROWS * CH + 250);
    this.paddle.baseW = this.paddle.w = 68;
    this.balls[0].y = this.paddle.y - 7;
    this.build();
    // serpent: list of cells, head first
    this.snake = { cells: [[17, 1], [18, 1], [18, 2], [17, 2], [16, 2]], chew: 0, chewing: null, prog: 0, stun: 0, dir: Math.PI, path: [], open: 0 };
    this.snakeStart = this.pathCost();
    this.phase = 'rescue'; this.foxT = 0; this.frenzyT = 0; this.beatT = 0; this.collapseDirty = false; this.collapseT = 0;
  }

  previewRect() { return { x: this.grid.ox - 8, y: this.grid.oy - 8, w: COLS * CW + 16, h: 210 }; }
  build() {
    const G = this.grid, set = (c, r, v) => { if (c >= 0 && r >= 0 && c < COLS && r < ROWS) { G.cells[r * COLS + c] = v; G.hp[r * COLS + c] = HP[v] || 0; } };
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) set(c, r, r < 9 ? TEAL : SAND);
    for (let c = 0; c < COLS; c++) set(c, 0, ROCK);
    for (let r = 0; r < ROWS - 3; r++) { set(0, r, ROCK); set(COLS - 1, r, ROCK); }
    // fox pocket
    for (let r = POCKET.r0; r <= POCKET.r1; r++) for (let c = POCKET.c0; c <= POCKET.c1; c++) set(c, r, EMPTY);
    // steel shell around the pocket: the serpent has to go round and come up from underneath
    for (let c = POCKET.c0 - 1; c <= POCKET.c1 + 1; c++) set(c, POCKET.r0 - 1, ROCK);
    for (let r = POCKET.r0 - 1; r <= POCKET.r1 + 1; r++) { set(POCKET.c0 - 1, r, ROCK); set(POCKET.c1 + 1, r, ROCK); }
    // serpent lair, top-right
    for (const [c, r] of [[16, 1], [17, 1], [18, 1], [16, 2], [17, 2], [18, 2]]) set(c, r, EMPTY);
    // the shape: a winding pre-cut channel with thin walls, like the viral "impossible shapes"
    const carve = pts => { for (let i = 0; i < pts.length - 1; i++) { let [c, r] = pts[i]; const [c1, r1] = pts[i + 1]; while (c !== c1 || r !== r1) { set(c, r, EMPTY); c += Math.sign(c1 - c); r += Math.sign(r1 - r); } set(c1, r1, EMPTY); } };
    carve([[9, 27], [9, 22], [4, 22], [4, 15], [14, 15], [14, 19]]);
    carve([[10, 27], [10, 23]]);
    carve([[15, 27], [15, 24], [17, 24]]);
    carve([[3, 27], [3, 25]]);
    // stone pillars that steer the ball (and anchor the structure)
    for (const [c, r] of [[6, 11], [13, 11], [7, 19], [12, 19], [2, 18], [17, 17]]) set(c, r, ROCK);
    // gold power bricks
    [[14, 19], [2, 12], [17, 10], [6, 24], [12, 6], [5, 6]].forEach(([c, r]) => set(c, r, GOLD));
  }

  // ---------- rules ----------
  hitCell(c, r, b) {
    const G = this.grid, k = r * COLS + c, v = G.cells[k];
    if (!v) return;
    if (v === ROCK) { if (b.fire) return; sfx.tough(); return; }
    G.hp[k] = b.fire ? 0 : G.hp[k] - 1;
    const x = G.ox + c * CW, y = G.oy + r * CH;
    if (G.hp[k] > 0) { sfx.tough(); this.fx.shatter(x, y, CW, CH, COLORS[v], 2, 0.6); return; }
    this.removeCell(c, r, true);
    this.brokeBrick();
    this.addScore(v === GOLD ? 50 : 10 * v, x + CW / 2, y);
    if (v === GOLD) this.dropPower(x + CW / 2, y + CH, DROPS[(c + r) % DROPS.length]);
    this.bump(0.06);
  }
  removeCell(c, r, byBall) {
    const G = this.grid, k = r * COLS + c, v = G.cells[k];
    G.cells[k] = EMPTY; G.hp[k] = 0;
    this.fx.shatter(G.ox + c * CW, G.oy + r * CH, CW, CH, COLORS[v], byBall ? 6 : 4);
    this.collapseDirty = true;
    if (this.phase === 'rescue') this.checkBreach();
  }
  pocketCell(c, r) { return c >= POCKET.c0 && c <= POCKET.c1 && r >= POCKET.r0 && r <= POCKET.r1; }
  snakeBlocks() { const s = new Set(this.snake.cells.map(([c, r]) => r * COLS + c)); return (c, r) => s.has(r * COLS + c); }

  checkBreach() {
    const { list } = floodEmpty(this.grid, POCKET.c0, POCKET.r1, this.snakeBlocks());
    const exit = list.find(k => Math.floor(k / COLS) === ROWS - 1);
    if (exit === undefined) return;
    // route for the fox: BFS parents back from the exit
    this.foxPath = this.bfsPath([POCKET.c0 + 1, POCKET.r1], exit);
    this.phase = 'escape'; this.foxT = 0;
    sfx.breach(); this.bump(0.7, 0.12); this.timeScale = 0.35; this.slowT = 0.8;
    this.fx.pop(this.W / 2, this.grid.oy + 120, 'BREACH!', '#ffe08a', 40);
  }
  bfsPath([sc, sr], goalK) {
    const G = this.grid, prev = new Int32Array(COLS * ROWS).fill(-1), start = sr * COLS + sc, q = [start];
    prev[start] = start;
    for (let i = 0; i < q.length; i++) {
      const k = q[i]; if (k === goalK) break;
      const c = k % COLS, r = (k - c) / COLS;
      for (const [dc, dr] of [[0, 1], [1, 0], [-1, 0], [0, -1]]) {
        const nc = c + dc, nr = r + dr, nk = nr * COLS + nc;
        if (nc < 0 || nr < 0 || nc >= COLS || nr >= ROWS || prev[nk] !== -1 || G.cells[nk]) continue;
        prev[nk] = k; q.push(nk);
      }
    }
    const out = []; let k = goalK;
    while (k !== start && k >= 0 && prev[k] !== -1) { out.push(k); k = prev[k]; }
    out.push(start); out.reverse();
    return out.map(k => ({ x: this.grid.ox + (k % COLS) * CW + CW / 2, y: this.grid.oy + Math.floor(k / COLS) * CH + CH / 2 }));
  }

  // Dijkstra from the serpent's head to the pocket; bricks cost chewing time.
  snakePlan() {
    const G = this.grid, dist = new Float32Array(COLS * ROWS).fill(Infinity), prev = new Int32Array(COLS * ROWS).fill(-1);
    const [hc, hr] = this.snake.cells[0], start = hr * COLS + hc, body = new Set(this.snake.cells.slice(1).map(([c, r]) => r * COLS + c));
    dist[start] = 0; const open = [start];
    while (open.length) {
      let bi = 0; for (let i = 1; i < open.length; i++) if (dist[open[i]] < dist[open[bi]]) bi = i;
      const k = open.splice(bi, 1)[0], c = k % COLS, r = (k - c) / COLS;
      if (this.pocketCell(c, r)) { const path = []; let j = k; while (j !== start) { path.push(j); j = prev[j]; } return { cost: dist[k], path: path.reverse() }; }
      for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nc = c + dc, nr = r + dr; if (nc < 0 || nr < 0 || nc >= COLS || nr >= ROWS) continue;
        const nk = nr * COLS + nc, v = G.cells[nk];
        if (v === ROCK || body.has(nk)) continue;
        const d = dist[k] + CHEW[v] * (v === TEAL && G.hp[nk] === 1 ? 0.6 : 1);
        if (d < dist[nk]) { if (dist[nk] === Infinity) open.push(nk); dist[nk] = d; prev[nk] = k; }
      }
    }
    return { cost: Infinity, path: [] };
  }
  pathCost() { return this.snakePlan().cost; }

  updateSnake(dt) {
    const s = this.snake;
    s.open = Math.max(0, s.open - dt * 4);
    if (s.stun > 0) { s.stun -= dt; return; }
    if (s.prog < 1) { s.prog = Math.min(1, s.prog + dt / 0.38); return; }
    if (!s.chewing) {
      const plan = this.snakePlan(); s.path = plan.path; s.cost = plan.cost;
      if (!plan.path.length) return;
      const k = plan.path[0], c = k % COLS, r = (k - c) / COLS;
      s.chewing = [c, r]; s.chew = 0;
    }
    const [c, r] = s.chewing, v = this.grid.cells[r * COLS + c];
    if (v === ROCK) { s.chewing = null; return; }
    s.chew += dt;
    if (v !== EMPTY) { s.open = 1; if (Math.floor(s.chew * 3) !== Math.floor((s.chew - dt) * 3)) { sfx.chew(); this.fx.shatter(this.grid.ox + c * CW, this.grid.oy + r * CH, CW, CH, COLORS[v], 1, 0.4); } }
    if (s.chew >= CHEW[v] * (v === TEAL && this.grid.hp[r * COLS + c] === 1 ? 0.6 : 1)) {
      if (v !== EMPTY) this.removeCell(c, r, false);
      const [hc, hr] = s.cells[0];
      s.dir = Math.atan2(r - hr, c - hc);
      s.cells.unshift([c, r]); if (s.cells.length > 7) s.cells.pop(); else if (s.cells.length < 7 && s.grow) s.grow--;
      s.prog = 0; s.chewing = null;
      if (this.pocketCell(c, r)) { this.phase = 'caught'; sfx.hurt(); this.bump(0.8, 0.1); setTimeout(() => this.fail('The serpent got the fox'), 900); }
    }
  }
  snakePoints() {
    const s = this.snake, G = this.grid, ctr = ([c, r]) => ({ x: G.ox + c * CW + CW / 2, y: G.oy + r * CH + CH / 2 });
    const pts = s.cells.map(ctr), k = s.prog;
    // ease each segment from its previous cell so the body slides instead of hopping
    return pts.map((p, i) => { const q = pts[i + 1] || p; return { x: q.x + (p.x - q.x) * k, y: q.y + (p.y - q.y) * k }; });
  }
  ballVsSnake() {
    const s = this.snake; if (this.phase !== 'rescue') return;
    const h = this.snakePoints()[0];
    for (const b of this.balls) {
      if (b.caught) continue;
      const dx = b.x - h.x, dy = b.y - h.y, d = Math.hypot(dx, dy);
      if (d > 11 + b.r || d === 0) continue;
      const nx = dx / d, ny = dy / d, vn = b.vx * nx + b.vy * ny;
      if (vn < 0) { b.vx -= 2 * vn * nx; b.vy -= 2 * vn * ny; }
      b.x = h.x + nx * (11 + b.r);
      if (s.stun <= 0) { s.stun = 3; this.addScore(100); this.fx.pop(h.x, h.y - 20, 'STUNNED', '#ffe27a', 15); sfx.hurt(); this.bump(0.35, 0.06); this.combo++; }
    }
  }

  collapse() { // bricks no longer connected to any stone fall out of the structure
    const G = this.grid, seen = new Uint8Array(COLS * ROWS), q = [];
    for (let k = 0; k < COLS * ROWS; k++) if (G.cells[k] === ROCK) { seen[k] = 1; q.push(k); }
    for (let i = 0; i < q.length; i++) {
      const k = q[i], c = k % COLS, r = (k - c) / COLS;
      for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nc = c + dc, nr = r + dr; if (nc < 0 || nr < 0 || nc >= COLS || nr >= ROWS) continue;
        const nk = nr * COLS + nc; if (!seen[nk] && G.cells[nk]) { seen[nk] = 1; q.push(nk); }
      }
    }
    let n = 0;
    for (let k = 0; k < COLS * ROWS; k++) if (G.cells[k] && !seen[k]) {
      const c = k % COLS, r = (k - c) / COLS, v = G.cells[k];
      G.cells[k] = 0; this.fx.shatter(G.ox + c * CW, G.oy + r * CH, CW, CH, COLORS[v], 5, 1.4); n++;
    }
    if (n) { this.addScore(n * 25); this.collapsePop(n * 25); this.bump(Math.min(0.8, 0.2 + n * 0.02), 0.05); sfx.boom(); if (this.phase === 'rescue') this.checkBreach(); }
  }

  collapsePop(pts) { // chain collapses add up in one label instead of stacking new ones
    const p = this.cPop;
    if (p && this.fx.pops.includes(p) && p.t < 0.6) { p.total += pts; p.text = `COLLAPSE +${p.total}`; p.t = 0.15; return; }
    this.fx.pop(this.W / 2, this.grid.oy + ROWS * CH + 20, `COLLAPSE +${pts}`, '#ffd36b', 18);
    this.cPop = this.fx.pops[this.fx.pops.length - 1]; this.cPop.total = pts;
  }
  updateLevel(dt, dtReal) {
    if (this.slowT > 0) { this.slowT -= dtReal; if (this.slowT <= 0 && !this.aim) this.timeScale = 1; }
    if (this.collapseDirty) { this.collapseT -= dtReal; if (this.collapseT <= 0) { this.collapseDirty = false; this.collapseT = 0.15; this.collapse(); } }
    if (this.phase === 'rescue') {
      this.updateSnake(dt); this.ballVsSnake();
      const cost = this.snake.cost ?? this.snakeStart;
      this.danger = Math.max(0, Math.min(1, 1 - cost / this.snakeStart));
      this.beatT -= dt;
      if (this.danger > 0.55 && this.beatT <= 0) { sfx.beat(); this.beatT = 1.1 - this.danger * 0.6; }
    } else if (this.phase === 'escape') {
      this.foxT += dt;
      const i = Math.floor(this.foxT * 9);
      if (i >= this.foxPath.length - 1) { this.phase = 'frenzy'; this.frenzyT = 7; this.startFrenzy(); }
    } else if (this.phase === 'frenzy') {
      this.frenzyT -= dt; this.fireT = Math.max(this.fireT, 0.5);
      if (this.frenzyT <= 0 || !this.grid.cells.some(v => v && v !== ROCK)) { sfx.win(); this.win(); }
    }
  }
  startFrenzy() {
    const p = this.paddle;
    for (let i = 0; i < 14; i++) { const a = -0.9 + i * 0.13; this.balls.push(makeBall(p.x, p.y - 8, Math.sin(a) * 360, -Math.cos(a) * 360, 6)); }
    this.fx.pop(this.W / 2, this.grid.oy + 140, 'FRENZY!', '#ff9a4a', 34);
    this.bump(0.5);
  }
  loseBall() { if (this.phase === 'frenzy' || this.phase === 'escape') { this.serve(); return; } super.loseBall(); }

  // ---------- drawing ----------
  draw(g) {
    const { W, H } = this, G = this.grid;
    g.drawImage(this.background(), 0, 0, W, H);
    const [sx, sy] = this.shakeOffset();
    g.save(); g.translate(sx, sy);
    // recessed vault floor behind the bricks
    const fx0 = G.ox - 6, fy0 = G.oy - 6, fw = COLS * CW + 12, fh = ROWS * CH + 12;
    const fg = g.createLinearGradient(0, fy0, 0, fy0 + fh);
    fg.addColorStop(0, '#120f22'); fg.addColorStop(1, '#1b1730');
    g.fillStyle = fg; rrect(g, fx0, fy0, fw, fh, 8); g.fill();
    // fox lantern light inside the pocket
    const px = G.ox + (POCKET.c0 + 2) * CW, py = G.oy + (POCKET.r0 + 1.5) * CH;
    const lg = g.createRadialGradient(px, py, 4, px, py, 70);
    lg.addColorStop(0, 'rgba(255,190,110,0.55)'); lg.addColorStop(1, 'rgba(255,190,110,0)');
    g.fillStyle = lg; g.fillRect(px - 80, py - 80, 160, 160);
    // shadows under bricks (visible where neighbours are missing)
    g.fillStyle = 'rgba(0,0,0,0.45)';
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (G.cells[r * COLS + c]) g.fillRect(G.ox + c * CW + 3, G.oy + r * CH + 5, CW, CH);
    // bricks, top rows first so lower rows cover upper bricks' front faces
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const k = r * COLS + c, v = G.cells[k]; if (!v) continue;
      const crack = v === TEAL && G.hp[k] === 1 ? 1 : 0;
      const sprite = brick(COLORS[v], CW - 1, CH - 1, { depth: 3, crack, glyph: v === ROCK ? 'rivet' : v === GOLD ? 'gem' : '' , metal: v === ROCK });
      g.drawImage(sprite, G.ox + c * CW + 0.5, G.oy + r * CH + 0.5, CW - 1, CH + 2);
    }
    // chewing cracks on the cell the serpent is eating
    if (this.snake.chewing && this.phase === 'rescue') {
      const [c, r] = this.snake.chewing, v = G.cells[r * COLS + c];
      if (v && v !== ROCK) { g.strokeStyle = 'rgba(30,0,20,0.7)'; g.lineWidth = 1; const x = G.ox + c * CW, y = G.oy + r * CH, k = Math.min(1, this.snake.chew / CHEW[v]); g.beginPath(); g.moveTo(x + 2, y + 2); g.lineTo(x + 2 + 12 * k, y + 10 * k); g.moveTo(x + 14, y + 3); g.lineTo(x + 14 - 10 * k, y + 3 + 7 * k); g.stroke(); }
    }
    // fox
    const t = this.t;
    if (this.phase === 'rescue' || this.phase === 'caught') {
      drawFox(g, px, py + 2, 0.95, 'scared', t);
      this.drawCage(g);
    } else if (this.phase === 'escape') {
      const i = Math.min(this.foxPath.length - 1, this.foxT * 9), a = this.foxPath[Math.floor(i)], b = this.foxPath[Math.min(this.foxPath.length - 1, Math.floor(i) + 1)], f = i % 1;
      drawFox(g, a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f, 0.9, 'run', t);
    } else {
      drawFox(g, this.paddle.x, this.paddle.y - 18, 0.75, 'happy', t);
    }
    if (this.phase === 'rescue' || this.phase === 'caught') drawSerpent(g, this.snakePoints(), this.snake.dir, t, this.snake.stun, this.snake.open);
    this.drawDrops(g); this.drawPaddle(g); this.drawBalls(g); this.fx.draw(g); this.drawAim(g);
    g.restore();
    // danger tint at the edges when the serpent is close
    if (this.phase === 'rescue' && this.danger > 0.5) {
      const a = (this.danger - 0.5) * 0.7 * (0.6 + 0.4 * Math.sin(this.t * 7));
      const vg = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75);
      vg.addColorStop(0, 'rgba(160,0,30,0)'); vg.addColorStop(1, `rgba(160,0,30,${a})`); g.fillStyle = vg; g.fillRect(0, 0, W, H);
    }
    this.drawHUD(g);
  }
  drawCage(g) {
    const G = this.grid, x0 = G.ox + POCKET.c0 * CW, y0 = G.oy + POCKET.r0 * CH, w = (POCKET.c1 - POCKET.c0 + 1) * CW, h = (POCKET.r1 - POCKET.r0 + 1) * CH;
    for (let i = 1; i < 6; i++) {
      const x = x0 + (w * i) / 6;
      g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(x + 1.5, y0 + 2, 2, h - 2);
      const bg = g.createLinearGradient(x - 1, 0, x + 1.5, 0); bg.addColorStop(0, '#fff2c0'); bg.addColorStop(0.5, '#e0a93a'); bg.addColorStop(1, '#8a5a12');
      g.fillStyle = bg; g.fillRect(x - 1, y0, 2.4, h);
    }
  }
  drawHUD(g) {
    const W = this.W;
    // threat meter: serpent ↔ fox
    const y = 44, x0 = 70, x1 = W - 150;
    text(g, 'SERPENT', 52, 24, 13, '#d9b8f0');
    g.fillStyle = 'rgba(0,0,0,0.45)'; rrect(g, 52, y - 6, x1 - 52, 12, 6); g.fill();
    const d = this.phase === 'rescue' ? this.danger || 0 : 0;
    const col = d > 0.75 ? '#ff4d5e' : d > 0.45 ? '#ffb347' : '#7bd88f';
    const mg = g.createLinearGradient(0, y - 6, 0, y + 6); mg.addColorStop(0, shade(col, 0.4)); mg.addColorStop(1, shade(col, -0.25));
    g.fillStyle = mg; rrect(g, 52, y - 6, Math.max(12, (x1 - 52) * d), 12, 6); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.35)'; rrect(g, 56, y - 4, Math.max(4, (x1 - 60) * d), 3, 1.5); g.fill();
    text(g, this.phase === 'rescue' ? `${Math.round((1 - d) * 100)}% away` : 'FOX SAFE', x1 + 8, y, 12, this.phase === 'rescue' ? '#fff' : '#7bd88f');
    if (this.phase === 'frenzy') text(g, `FRENZY ${Math.ceil(this.frenzyT)}`, W / 2, this.grid.oy + ROWS * CH + 34, 22, '#ffb35c', 'center');
    void x0;
    this.drawHUDBase(g);
  }
  background() {
    return cached('vault-bg' + this.W + 'x' + this.H, this.W, this.H, g => {
      const { W, H } = this;
      const bg = g.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#1c2140'); bg.addColorStop(0.5, '#141831'); bg.addColorStop(1, '#0b0d1c');
      g.fillStyle = bg; g.fillRect(0, 0, W, H);
      // large carved stone blocks in the temple wall
      g.lineWidth = 1;
      for (let y = 0, row = 0; y < H; y += 46, row++) for (let x = (row % 2) * -40; x < W; x += 80) {
        const sg = g.createLinearGradient(x, y, x, y + 46);
        sg.addColorStop(0, 'rgba(255,255,255,0.035)'); sg.addColorStop(1, 'rgba(0,0,0,0.12)');
        g.fillStyle = sg; g.fillRect(x + 1, y + 1, 78, 44);
        g.strokeStyle = 'rgba(0,0,0,0.35)'; g.strokeRect(x + 0.5, y + 0.5, 79, 45);
        g.strokeStyle = 'rgba(255,255,255,0.04)'; g.beginPath(); g.moveTo(x + 1.5, y + 44); g.lineTo(x + 1.5, y + 1.5); g.lineTo(x + 78, y + 1.5); g.stroke();
      }
      // light shaft from above
      const ls = g.createLinearGradient(W * 0.3, 0, W * 0.6, H * 0.6);
      ls.addColorStop(0, 'rgba(255,220,170,0.10)'); ls.addColorStop(1, 'rgba(255,220,170,0)');
      g.fillStyle = ls; g.beginPath(); g.moveTo(W * 0.25, 0); g.lineTo(W * 0.55, 0); g.lineTo(W * 0.85, H * 0.7); g.lineTo(W * 0.35, H * 0.7); g.closePath(); g.fill();
      // floor glow where the paddle lives
      const fg = g.createRadialGradient(W / 2, H - 60, 10, W / 2, H - 60, W * 0.7);
      fg.addColorStop(0, 'rgba(244,197,66,0.10)'); fg.addColorStop(1, 'rgba(244,197,66,0)');
      g.fillStyle = fg; g.fillRect(0, H * 0.5, W, H * 0.5);
      vignette(g, W, H, 0.6);
      drawGrain(g, W, H);
    });
  }
  result() {
    const stars = this.state !== 'won' ? 0 : 1 + (this.score > 4000 ? 1 : 0) + (this.score > 8000 ? 1 : 0);
    return { stars, lines: [['Score', this.score.toLocaleString()], ['Bricks broken', this.bricksBroken], ['Best combo', `×${this.bestCombo}`]] };
  }
}
export { cellAt, NUM };
