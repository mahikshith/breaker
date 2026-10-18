// Level 2: The Vault. A cutaway castle tower: carve a path up to the princess before the serpent
// chews its way down to her. Bricks that lose their hold on the tower fall out as rigid bodies.
import { Arena } from './arena.js';
import { makeGrid, makeBall } from './physics.js';
import { brick, cached, text, vignette, drawGrain, rrect, shade, NUM, SPR, ready, loadImg } from './gfx.js';
import { drawSerpent } from './characters.js';
import { Debris } from './debris.js';
import { ART } from './vault-art.js';
import { sfx } from './audio.js';

const COLS = 20, ROWS = 20, CELL = 16, OX = 20, OY = 96;
const EMPTY = 0, SUN = 1, CORAL = 2, VIOLET = 3, TEAL = 4, GOLD = 5, BLUE = 6, BARS = 8, GRANITE = 9;
const KIND = { y: SUN, c: CORAL, v: VIOLET, t: TEAL, b: BLUE, g: GOLD, '#': GRANITE, '=': BARS };
const LETTER = { [SUN]: 'y', [CORAL]: 'c', [VIOLET]: 'v', [TEAL]: 't', [BLUE]: 'b', [GOLD]: 'gold', [GRANITE]: 'granite' };
const COLORS = { [SUN]: '#ffc73d', [CORAL]: '#ff6f61', [VIOLET]: '#8f5cf0', [TEAL]: '#22c4b0', [BLUE]: '#4f9dff', [GOLD]: '#f4c542', [GRANITE]: '#4a4f6e' };
const HP = { [SUN]: 1, [CORAL]: 1, [VIOLET]: 2, [TEAL]: 2, [BLUE]: 1, [GOLD]: 1 };
const CHEW = { [EMPTY]: 0.32, [BARS]: 0.32, [SUN]: 2.1, [CORAL]: 2.1, [VIOLET]: 3.45, [TEAL]: 3.45, [BLUE]: 2.1, [GOLD]: 2.1 }; // serpent seconds per cell
const POCKET = { c0: 7, c1: 12, r0: 3, r1: 5 };
const PR_X = OX + 10 * CELL, FLOOR_Y = OY + 6 * CELL; // the princess's spot in the cage
const DROPS = ['wide', 'split', 'laser', 'shrink', 'fire', 'shield', 'wide', 'burst', 'slow', 'focus', 'split'];
const LAYOUT = [
  'tttttttttttttttt....',
  'tttttttttttttttt....',
  'tttttt########tttttt',
  'tttttt#======#tttttt',
  'ttgttt#======#tttgtt',
  'tttttt#======#tttttt',
  'vvvvvvvvvvvvvvvvvvvv',
  'vvvvvvvvvvvvvvvvvvvv',
  'vvv##vvvvgvvvvvv##vv',
  'vvvvvvvvvvvvvvvvvvvv',
  'cccccccccccccccccccc',
  'ccccccccc..ccccccccc',
  'ccgcccccc..cccccgccc',
  'cccc###cc..cc###cccc',
  'yyyyyyyyy..yyyyyyyyy',
  'yyyyy......yyyyyyyyy',
  'bbbbb..bbbbbbbbbbbbb',
  'bbbbb..bbbgbbbbbb..b',
  'bbbbb..bbbbbbbbbb..b',
  'bbbbb..bbbbbbbbbb..b',
];

// ---------- art: rendered sprites when packed, code-drawn fallbacks otherwise ----------
const load = loadImg;
const IMG = SPR;
const PLATE = ART?.plate ? load(ART.plate) : null;
const BARS_IMG = ART?.bars ? load(ART.bars) : null;
const PRINCESS = ART?.princess ? { ...ART.princess, img: load(ART.princess.url) } : null;
const SNAKE = ART?.snake ? { ...ART.snake, img: load(ART.snake.url) } : null;
function brickArt(kind, cells, dmg) {
  const s = IMG[`brick_${LETTER[kind]}_${cells}_${kind === GOLD || kind === GRANITE ? 0 : dmg}`];
  if (ready(s)) return { img: s.img, ox: s.margin, oy: s.margin, iw: s.uw, ih: s.uh };
  const w = cells * CELL, h = CELL;
  const cv = brick(COLORS[kind], w - 1, h - 1, { depth: 4, crack: dmg, metal: kind === GRANITE, glyph: kind === GRANITE ? 'rivet' : kind === GOLD ? 'gem' : '' });
  return { img: cv, ox: -0.5, oy: -0.5, iw: w - 1, ih: h + 3 };
}
const BAR_ART = (() => { // one iron bar, for when the cage bursts
  const cv = cached('bar', 4, 48, g => { const gr = g.createLinearGradient(0, 0, 4, 0); gr.addColorStop(0, '#20232f'); gr.addColorStop(0.35, '#a3abc2'); gr.addColorStop(0.6, '#4a5066'); gr.addColorStop(1, '#171a24'); g.fillStyle = gr; g.fillRect(0, 0, 4, 48); });
  return { img: cv, ox: 0, oy: 0, iw: 4, ih: 48 };
});

export class Vault extends Arena {
  constructor(W, H) {
    super(W, H, { accent: '#f4c542', top: OY, left: OX, right: W - OX - COLS * CELL, minPaddleY: OY + ROWS * CELL + 80 });
    this.name = 'The Vault'; this.subtitle = 'Free the princess before the serpent gets there';
    this.grid = makeGrid(COLS, ROWS, CELL, CELL, OX, OY);
    this.left = OX; this.right = OX + COLS * CELL; this.top = OY;
    this.paddle.baseW = this.paddle.w = 70;
    this.debris = new Debris({ left: this.left, right: this.right, floor: H + 200, killY: this.paddle.y + 70, onPaddleHit: () => this.brickOnPaddle() });
    this.build();
    this.snake = { cells: [[16, 1], [17, 1], [18, 1], [19, 1], [19, 0]], hist: [], chew: 0, chewing: null, prog: 1, stun: 0, dir: Math.PI, look: Math.PI, faceLeft: true, path: [], open: 0, hits: [], flinch: 0, mood: null, moodT: 0, alpha: 1, fleeT: 0, eaten: 0, gulp: 0, lunge: 0 };
    this.snakeStart = this.snakePlan().cost;
    this.phase = 'intro'; this.introT = 0; this.peakDanger = 0; this.foxT = 0; this.frenzyT = 0; this.beatT = 0; this.collapseDirty = false; this.collapseT = 0;
    this.bubble = null; this.barsWob = 0; this.zc = { z: 1, ax: W / 2, ay: this.paddle.y };
    this.pr = { anim: 'Idle', t: 0, loop: true, flip: false, x: PR_X, pace: 1, pause: 0, th: 0, fps: 14 };
    this.motes = Array.from({ length: 18 }, (_, i) => ({ x: Math.random() * W, y: OY + Math.random() * (H - OY), s: 0.6 + Math.random() * 1.2, p: i }));
  }
  previewRect() { return { x: OX - 14, y: OY - 30, w: COLS * CELL + 28, h: 230 }; }

  build() {
    const G = this.grid;
    G.bid = new Int16Array(COLS * ROWS).fill(-1);
    this.bricks = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const kind = KIND[LAYOUT[r][c]] || EMPTY;
      if (kind === BARS) { G.cells[r * COLS + c] = BARS; continue; } // the cage: solid to the ball, open to the serpent
      if (!kind || G.bid[r * COLS + c] >= 0) continue;
      // running bond: glazed bricks are two cells wide, offset by one cell on alternate rows
      const wide = HP[kind] && kind !== GOLD && (c + r) % 2 === 0 && c + 1 < COLS && KIND[LAYOUT[r][c + 1]] === kind;
      const n = wide ? 2 : 1, id = this.bricks.length;
      const br = { id, kind, c, r, n, hp: HP[kind] || 0, max: HP[kind] || 0, x: OX + c * CELL, y: OY + r * CELL, w: n * CELL, h: CELL, wob: 0 };
      this.bricks.push(br);
      for (let i = 0; i < n; i++) { const k = r * COLS + c + i; G.bid[k] = id; G.cells[k] = kind; G.hp[k] = 1; }
      this.debris.addStatic(id, br.x, br.y, br.w, br.h);
    }
  }
  brickAt(c, r) { const id = this.grid.bid[r * COLS + c]; return id >= 0 ? this.bricks[id] : null; }
  art(br) { return brickArt(br.kind, br.n, br.max ? br.max - br.hp : 0); }

  // ---------- princess animation ----------
  play(anim, loop = false, fps = 14) { if (this.pr.anim !== anim || !loop) Object.assign(this.pr, { anim, t: 0, loop, fps }); else this.pr.fps = fps; }
  // a looping animation, or a stand-in when that one hasn't been rendered
  loopAnim(name, fallback, fps = 14, fbFps = fps) { if (PRINCESS?.anims[name]) this.play(name, true, fps); else this.play(fallback, true, fbFps); }
  updatePrincess(dt) {
    const p = this.pr; p.t += dt;
    const n = PRINCESS?.anims[p.anim]?.n || 12;
    if (!p.loop && p.t * p.fps >= n) this.play('Idle', true); // one-shot finished
    if (this.phase === 'rescue' || this.phase === 'caught') this.pacePrincess(dt);
  }
  // In the cage she gets more frantic as the serpent closes in: idle, then nervous pacing, then running in circles.
  pacePrincess(dt) {
    const p = this.pr, d = this.danger || 0, sn = this.snake, free = p.loop; // a one-shot (cheer, flinch) plays out first
    const lo = OX + POCKET.c0 * CELL + 14, hi = OX + (POCKET.c1 + 1) * CELL - 14, cx = (lo + hi) / 2;
    const headX = OX + sn.cells[0][0] * CELL + CELL / 2;
    const walkTo = (x, v) => { const dx = x - p.x; if (Math.abs(dx) < 1) return true; p.x += Math.sign(dx) * Math.min(Math.abs(dx), v * dt); p.flip = dx < 0; return false; };
    p.depth += (0 - (p.depth || 0)) * Math.min(1, dt * 4);
    if (sn.attack || this.phase === 'caught') { // cower on the far side, facing it
      const there = walkTo(headX < cx ? hi - 2 : lo + 2, 70);
      if (there) { p.flip = headX < p.x; if (free) this.loopAnim('Scared', 'Blocking'); } else if (free) this.loopAnim('Panic', 'Running_A', 14, 20);
      return;
    }
    if (d < 0.3) { if (walkTo(cx, 24)) { if (free && p.anim !== 'Idle') this.play('Idle', true); } else if (free) this.loopAnim('Nervous', 'Running_A', 12, 8); return; }
    if (d < 0.62) { // nervous pacing, with a pause and a scared glance toward the serpent at each end
      if (p.pause > 0) { p.pause -= dt; p.flip = headX < p.x; if (free) this.loopAnim('Scared', 'Idle'); return; }
      p.x += p.pace * 24 * dt; p.flip = p.pace < 0;
      if (p.x > hi || p.x < lo) { p.x = Math.max(lo, Math.min(hi, p.x)); p.pace *= -1; p.pause = 0.7; }
      if (free) this.loopAnim('Nervous', 'Running_A', 12, 8);
      return;
    }
    // panic: running in little circles (an ellipse seen from the side: she grows a touch as she comes forward)
    p.th = (p.th || 0) + dt * (2.2 + d * 1.6);
    const nx = cx + Math.cos(p.th) * 30;
    p.flip = nx < p.x; p.x = nx; p.depth = Math.sin(p.th);
    if (free) this.loopAnim('Panic', 'Running_A', 16, 20);
    if (!this.bubble && Math.random() < dt * 0.35) this.say(['Help!', 'Hurry!!', 'Aaah!'][Math.floor(Math.random() * 3)], 1);
  }
  drawPrincess(g, x, feetY, scale = 1) {
    if (!PRINCESS || !PRINCESS.img.complete) return;
    const P = PRINCESS, a = P.anims[this.pr.anim] || P.anims.Idle, f = Math.floor(this.pr.t * this.pr.fps) % a.n, u = P.unit * scale;
    g.save(); g.translate(x, feetY);
    if (this.pr.flip) g.scale(-1, 1);
    g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.ellipse(2, 0, 10 * scale, 2.5 * scale, 0, 0, 7); g.fill();
    g.drawImage(P.img, f * P.cell, a.row * P.cell, P.cell, P.cell, -u / 2, -u + P.feet * scale, u, u);
    g.restore();
  }

  // ---------- rules ----------
  hitCell(c, r, b) {
    if (this.grid.cells[r * COLS + c] === BARS) { this.hitBars(b); return; }
    const br = this.brickAt(c, r);
    if (!br || br.gone) return;
    if (br.hitT === this.t && br.hitBall === b) return; // a ball touching both cells of one brick hits it once
    br.hitT = this.t; br.hitBall = b; br.wob = 1;
    if (this.phase === 'intro') this.skipIntro();
    if (br.kind === GRANITE) { if (!b.fire) sfx.tough(); return; }
    br.hp = b.fire ? 0 : br.hp - 1;
    if (br.hp > 0) { sfx.tough(); this.fx.shatter(b.x - 3, b.y - 3, 6, 6, COLORS[br.kind], 1, 0.4); this.bump(0.05); return; }
    this.removeBrick(br, b);
    this.brokeBrick();
    this.addScore(br.kind === GOLD ? 50 : 10 * br.n * br.max, br.x + br.w / 2, br.y);
    if (br.kind === GOLD) this.dropPower(br.x + br.w / 2, br.y + CELL, DROPS[(c + r) % DROPS.length]);
    this.bump(0.07);
  }
  hitBars(b) {
    if (this.barsT === this.t) return; this.barsT = this.t;
    this.barsWob = 1; sfx.tough(); sfx.wall(); this.bump(0.08);
    if (this.phase === 'rescue') { this.play('Blocking'); if (!this.bubble) this.say('Careful!', 0.9); }
  }
  removeBrick(br, ball) {
    const G = this.grid;
    const art = this.art(br); // shatter shows the brick as it looked
    br.gone = true;
    for (let i = 0; i < br.n; i++) { const k = br.r * COLS + br.c + i; G.cells[k] = EMPTY; G.hp[k] = 0; G.bid[k] = -1; }
    this.debris.removeStatic(br.id);
    // a lone brick cracks and fades; only a big crash (chain, fire, titan) throws physical debris
    if (ball && this.bigCrash(ball)) this.debris.shatter(art, br.x, br.y, br.w, br.h, ball.vx, ball.vy, br.n === 2 ? 5 : 3);
    else this.debris.crumble(art, br.x, br.y, br.w, br.h, ball?.vx || 0, ball?.vy || 0, br.n === 2 ? 5 : 3);
    this.collapseDirty = true;
    if (this.phase === 'rescue') this.checkBreach();
  }
  brickOnPaddle() {
    if (this.aim) return;
    this.paddle.stun = 0.6; sfx.hurt(); this.bump(0.35, 0.04);
    this.fx.pop(this.paddle.x, this.paddle.y - 22, 'BONK', '#ffb3a1', 14);
  }
  pocketCell(c, r) { return c >= POCKET.c0 && c <= POCKET.c1 && r >= POCKET.r0 && r <= POCKET.r1; }

  // open = empty, or the cage interior; the serpent's body blocks
  flood(from, blocked) {
    const G = this.grid, seen = new Uint8Array(COLS * ROWS), q = [from], prev = new Int32Array(COLS * ROWS).fill(-1);
    seen[from] = 1;
    for (let i = 0; i < q.length; i++) {
      const k = q[i], c = k % COLS, r = (k - c) / COLS;
      for (const [dc, dr] of [[0, 1], [1, 0], [-1, 0], [0, -1]]) {
        const nc = c + dc, nr = r + dr, nk = nr * COLS + nc;
        if (nc < 0 || nr < 0 || nc >= COLS || nr >= ROWS || seen[nk] || (G.cells[nk] && G.cells[nk] !== BARS) || blocked?.has(nk)) continue;
        seen[nk] = 1; prev[nk] = k; q.push(nk);
      }
    }
    return { q, prev };
  }
  checkBreach() {
    const start = POCKET.r1 * COLS + POCKET.c0 + 2, body = new Set(this.snake.cells.map(([c, r]) => r * COLS + c));
    const { q, prev } = this.flood(start, body);
    const exit = q.find(k => Math.floor(k / COLS) === ROWS - 1);
    if (exit === undefined) return;
    const path = []; for (let k = exit; k !== -1; k = prev[k]) path.push(k);
    this.foxPath = path.reverse().map(k => ({ x: OX + (k % COLS) * CELL + CELL / 2, y: OY + Math.floor(k / COLS) * CELL + CELL / 2 }));
    this.burstCage();
    this.phase = 'escape'; this.foxT = 0; this.mood('shock', 1.4);
    sfx.breach(); this.bump(0.7, 0.12); this.timeScale = 0.35; this.slomoT = 0.8;
    this.fx.pop(this.W / 2, OY + 150, 'BREACH!', '#ffe08a', 40);
    this.play('Cheer'); this.say('Yay!', 1.4);
  }
  burstCage() { // the bars spring out of the frame as physical pieces
    const G = this.grid;
    for (let r = POCKET.r0; r <= POCKET.r1; r++) for (let c = POCKET.c0; c <= POCKET.c1; c++) G.cells[r * COLS + c] = EMPTY;
    const x0 = OX + POCKET.c0 * CELL, y0 = OY + POCKET.r0 * CELL;
    for (let i = 1; i < 6; i++) this.debris.shatter(BAR_ART(), x0 + 96 * i / 6 - 2, y0, 4, 48, (i - 3) * 60, -200, 2);
    this.cageGone = true;
  }

  // Dijkstra from the serpent's head to the chamber; bricks cost chewing time.
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
        const nk = nr * COLS + nc;
        if (G.cells[nk] === GRANITE || body.has(nk)) continue;
        const d = dist[k] + this.chewTime(nc, nr);
        if (d < dist[nk]) { if (dist[nk] === Infinity) open.push(nk); dist[nk] = d; prev[nk] = k; }
      }
    }
    return { cost: Infinity, path: [] };
  }
  chewTime(c, r) { const br = this.brickAt(c, r); return br ? CHEW[br.kind] * (br.max > 1 && br.hp === 1 ? 0.6 : 1) : CHEW[EMPTY]; }

  updateSnake(dt) {
    const s = this.snake;
    s.open = Math.max(0, s.open - dt * 4); s.flinch = Math.max(0, s.flinch - dt * 4); s.gulp = Math.max(0, (s.gulp || 0) - dt * 0.9);
    if (!s.attack) s.lunge = Math.max(0, (s.lunge || 0) - dt * 5);
    // a brick tumbling toward it gets a wide-eyed look
    for (const p of this.debris.pieces) {
      if (p.kind !== 'brick' || p.dead) continue;
      const q = p.body.getPosition(), [hc, hr] = s.cells[0], hx = OX + hc * CELL + 8, hy = OY + hr * CELL + 8;
      if (p.body.getLinearVelocity().y > 1 && q.y * 16 < hy && hy - q.y * 16 < 70 && Math.abs(q.x * 16 - hx) < 30 && !(s.moodT > 0)) this.mood('shock', 0.5);
    }
    if (s.attack) { this.updateAttack(dt); return; }
    if (s.stun > 0) { s.stun -= dt; return; }
    // it starts sluggish and gets bigger, stronger and faster with every brick it eats
    const speedK = 0.75 + Math.min(1.3, s.eaten * 0.06) + (this.danger || 0) * 0.25;
    if (s.prog < 1) { s.prog = Math.min(1, s.prog + dt * speedK / 0.3); return; }
    if (!s.chewing) {
      const plan = this.snakePlan(); s.path = plan.path; s.cost = plan.cost;
      if (!plan.path.length) return;
      const k = plan.path[0], c = k % COLS, r = (k - c) / COLS, [hc, hr] = s.cells[0];
      s.dir = Math.atan2(r - hr, c - hc);
      if (this.pocketCell(c, r)) { this.startAttack(); return; }   // at the bars: it goes for her
      // it gets hungrier, and faster, the closer it is
      s.chewing = [c, r]; s.chew = 0; s.bites = 0; s.need = this.chewTime(c, r) / speedK;
    }
    const [c, r] = s.chewing, br = this.brickAt(c, r);
    if (br?.kind === GRANITE) { s.chewing = null; return; }
    s.chew += dt;
    if (br) { // a chomp about every 0.4 s: the head lunges into the brick, which shudders and sheds chips
      const n = Math.floor(s.chew * 2.4);
      if (n !== s.bites) {
        s.bites = n; s.lunge = 1; s.open = 1; br.wob = 1; sfx.chew(); sfx.tough(); this.bump(0.04);
        const ex = OX + c * CELL + CELL / 2 - Math.cos(s.dir) * 6, ey = OY + r * CELL + CELL / 2 - Math.sin(s.dir) * 6;
        this.fx.shatter(ex - 4, ey - 4, 8, 8, COLORS[br.kind], 4, 0.6);
      }
    }
    if (s.chew >= s.need) {
      if (br && !br.gone) { this.removeBrick(br, null); this.bump(0.12); s.eaten++; s.gulp = 1; sfx.hurt(); }
      const [hc, hr] = s.cells[0];
      s.dir = Math.atan2(r - hr, c - hc);
      s.cells.unshift([c, r]); if (s.cells.length > 7 + Math.min(9, Math.floor(s.eaten / 2))) s.hist.push(s.cells.pop());
      s.prog = 0; s.chewing = null;
    }
  }
  // The cage attack: rear back, smash the bars, rear back, smash them open, lunge at the princess.
  // A head hit before the second strike drives it off (see ballVsSnake).
  startAttack() {
    const s = this.snake;
    s.attack = { t: 0, struck: 0 }; s.chewing = null; s.lunge = 0;
    this.timeScale = 0.6; sfx.hurt(); this.bump(0.3);
    this.say('No no no!', 1.4);
  }
  updateAttack(dt) {
    const s = this.snake, a = s.attack; a.t += dt;
    const ease = k => k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k);
    // lunge < 0 rears back, > 0 strikes forward along s.dir
    if (a.t < 0.6) s.lunge = -1.3 * ease(a.t / 0.5);
    else if (a.t < 0.75) s.lunge = -1.3 + 3.3 * ease((a.t - 0.6) / 0.08);
    else if (a.t < 1.2) s.lunge = 2 - 3.5 * ease((a.t - 0.75) / 0.4);
    else if (a.t < 1.3) s.lunge = -1.5 + 3.8 * ease((a.t - 1.2) / 0.08);
    else s.lunge = 2.3;
    const cageX = OX + (POCKET.c0 + 3) * CELL, cageY = OY + (POCKET.r0 + 1.5) * CELL;
    if (a.t >= 0.62 && a.struck === 0) { // strike one: the bars buckle
      a.struck = 1; this.barsWob = 1.6; sfx.boom(); this.bump(0.55, 0.06);
      this.fx.shatter(cageX - 10, cageY - 10, 20, 20, '#ffd36b', 8, 1.2); this.fx.pop(cageX, cageY - 30, 'CRACK!', '#ffb35c', 20);
      if (PRINCESS?.anims.Scared) this.play('Scared', true);
    }
    if (a.t >= 1.22 && a.struck === 1) { // strike two: they burst, there is no saving her now
      a.struck = 2; this.burstCage(); this.phase = 'caught'; sfx.boom(); sfx.hurt(); this.bump(0.85, 0.1);
      this.say('Eek!', 2);
    }
    a.reach = ease((a.t - 1.3) / 0.35);
    if (a.t >= 1.7 && !a.got) { a.got = true; this.fx.pop(this.W / 2, OY + 150, 'GOT HER!', '#ff5d6e', 38); sfx.lose(); this.bump(0.6); }
    if (a.t >= 2.7) { this.timeScale = 1; this.fail('The serpent got the princess'); }
  }
  cancelAttack() { // driven off at the last moment
    const s = this.snake; if (!s.attack || s.attack.struck >= 2) return false;
    s.attack = null; s.lunge = 0; this.timeScale = 1;
    this.fx.pop(this.W / 2, OY + 150, 'SAVED IT!', '#7bf2c8', 30); this.say('Phew!', 1.2); this.play('Cheer');
    return true;
  }
  growth() { return 1 + Math.min(0.5, this.snake.eaten * 0.03); }
  mood(name, secs) { this.snake.mood = name; this.snake.moodT = secs; }
  // which face the serpent pulls right now: reactions first, then what it is doing, with blinks and tongue flicks
  expression() {
    const s = this.snake, t = this.t, X = SNAKE?.expr || {};
    const fierce = 'strike' in X ? 'strike' : 'chew1', snarl = 'snarl' in X ? 'snarl' : 'hunt';
    if (s.attack) return s.attack.t > 1.75 ? 'grin' : fierce;
    if (s.mood && s.moodT > 0) return s.mood;
    if (s.stun > 0) return 'dizzy';
    if (this.phase === 'caught') return 'grin';
    if (s.chewing && this.brickAt(...s.chewing)) return s.lunge > 0.45 ? fierce : snarl;
    if (t % 3.1 < 0.13) return 'blink';
    if (t % 2.3 < 0.35) return 'taste';
    return this.phase === 'rescue' && this.danger > 0.15 ? snarl : 'idle';
  }
  knockBack(steps) { // the serpent recoils back along the tunnel it came from
    const s = this.snake;
    for (let i = 0; i < steps && s.hist.length; i++) { s.cells.shift(); s.cells.push(s.hist.pop()); }
    const [a, b] = s.cells; if (b) s.dir = Math.atan2(a[1] - b[1], a[0] - b[0]);
    s.chewing = null; s.prog = 1;
  }
  stunSnake(secs, label, pts, x, y) {
    const s = this.snake;
    s.stun = Math.max(s.stun, secs); s.open = 1; this.mood('ouch', 0.4);
    this.addScore(pts); this.fx.pop(Math.max(OX + 50, Math.min(OX + COLS * CELL - 50, x)), Math.max(OY + 12, y - 20), label, '#ffe27a', 15); sfx.hurt(); this.bump(0.35, 0.06); this.combo++;
    if (this.pr.anim !== 'Cheer') { this.play('Cheer'); if (Math.random() < 0.5) this.say('Ha!', 0.8); }
  }
  snakePoints() {
    const s = this.snake, ctr = ([c, r]) => ({ x: OX + c * CELL + CELL / 2, y: OY + r * CELL + CELL / 2 });
    const pts = s.cells.map(ctr), k = s.prog;
    const out = pts.map((p, i) => { const q = pts[i + 1] || p; return { x: q.x + (p.x - q.x) * k, y: q.y + (p.y - q.y) * k }; });
    const L = (s.lunge || 0) * 7, h = out[0];   // bites and strikes throw the head forward along its heading
    h.x += Math.cos(s.dir) * L; h.y += Math.sin(s.dir) * L;
    if (s.attack?.reach > 0) { const r = s.attack.reach; h.x += (this.pr.x - h.x) * r; h.y += (FLOOR_Y - 16 - h.y) * r; }
    return out;
  }
  ballVsSnake() {
    const s = this.snake; if (this.phase !== 'rescue') return;
    const pts = this.snakePoints();
    for (const b of this.balls) {
      if (b.caught) continue;
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i], rad = (i === 0 ? 11 : Math.max(4, 8 - i * 0.5)) * this.growth();
        const dx = b.x - p.x, dy = b.y - p.y, d = Math.hypot(dx, dy);
        if (d > rad + b.r || d === 0) continue;
        const nx = dx / d, ny = dy / d, vn = b.vx * nx + b.vy * ny;
        if (vn < 0) { b.vx -= 2 * vn * nx; b.vy -= 2 * vn * ny; }
        b.x = p.x + nx * (rad + b.r); b.y = p.y + ny * (rad + b.r);
        if (i === 0) { // head: dizzy, shoved back; three quick hits send it reeling
          if (this.t - (s.lastHit ?? -9) < 0.35) break; // a ball rattling against the head counts once
          s.lastHit = this.t;
          if (this.cancelAttack()) { this.knockBack(3); this.stunSnake(4, 'DRIVEN OFF!', 500, p.x, p.y); break; }
          s.hits = s.hits.filter(t => this.t - t < 6); s.hits.push(this.t);
          const big = s.hits.length >= 3; if (big) s.hits = [];
          this.knockBack(big ? 4 : 1);
          this.stunSnake(b.fire ? 5 : 3, big ? 'KNOCKED BACK!' : 'STUNNED', big ? 300 : 100, p.x, p.y);
        } else if (s.stun <= 0) { // body: a flinch costs it some chewing progress
          s.flinch = 1; s.chew *= 0.5; this.addScore(20, p.x, p.y); sfx.tough(); this.bump(0.1); this.mood('hiss', 0.5);
        }
        break;
      }
    }
  }
  crushCheck() { // falling bricks that land on the serpent stun it
    if (this.phase !== 'rescue') return;
    const pts = this.snakePoints();
    for (const p of this.debris.pieces) {
      if (p.kind !== 'brick' || p.broken || p.dead) continue;
      const pos = p.body.getPosition(), x = pos.x * 16, y = pos.y * 16, vy = p.body.getLinearVelocity().y * 16;
      if (vy < 40) continue;
      if (pts.some(q => Math.abs(q.x - x) < p.w / 2 + 6 && Math.abs(q.y - y) < p.h / 2 + 6)) {
        p.broken = true; this.debris.queue.push(p);
        this.stunSnake(4, 'CRUSHED!', 300, x, y); this.knockBack(2);
      }
    }
  }

  // Bricks hold on through their neighbours to the tower: granite, the side pillars and the cornice.
  collapse() {
    const G = this.grid, seen = new Uint8Array(COLS * ROWS), q = [];
    for (let k = 0; k < COLS * ROWS; k++) {
      const c = k % COLS, r = (k - c) / COLS, v = G.cells[k];
      if (v && (v === GRANITE || v === BARS || c === 0 || c === COLS - 1 || r === 0)) { seen[k] = 1; q.push(k); }
    }
    for (let i = 0; i < q.length; i++) {
      const k = q[i], c = k % COLS, r = (k - c) / COLS;
      for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nc = c + dc, nr = r + dr; if (nc < 0 || nr < 0 || nc >= COLS || nr >= ROWS) continue;
        const nk = nr * COLS + nc; if (!seen[nk] && G.cells[nk]) { seen[nk] = 1; q.push(nk); }
      }
    }
    let n = 0;
    for (const br of this.bricks) {
      if (br.gone || seen[br.r * COLS + br.c]) continue;
      const art = this.art(br);
      br.gone = true;
      for (let i = 0; i < br.n; i++) { const k = br.r * COLS + br.c + i; G.cells[k] = EMPTY; G.bid[k] = -1; }
      this.debris.removeStatic(br.id);
      this.debris.drop(art, br.x, br.y, br.w, br.h, { kind: br.kind, n: br.n });
      n++;
    }
    if (n) {
      this.addScore(n * 25); this.collapsePop(n * 25);
      this.bump(Math.min(0.8, 0.2 + n * 0.03), 0.05); sfx.boom();
      if (this.phase === 'rescue') this.checkBreach();
    }
  }
  collapsePop(pts) { // chain collapses add up in one label instead of stacking new ones
    const p = this.cPop;
    if (p && this.fx.pops.includes(p) && p.t < 0.6) { p.total += pts; p.text = `COLLAPSE +${p.total}`; p.t = 0.15; return; }
    this.fx.pop(this.W / 2, OY + ROWS * CELL + 24, `COLLAPSE +${pts}`, '#ffd36b', 18);
    this.cPop = this.fx.pops[this.fx.pops.length - 1]; this.cPop.total = pts;
  }

  // laser shots sting the serpent: a head shot dazes it (and can break up a cage attack), the body flinches
  shotHit(shot) {
    if (this.phase !== 'rescue') return false;
    const pts = this.snakePoints();
    for (let i = 0; i < pts.length; i++) {
      const q = pts[i]; if (Math.hypot(shot.x - q.x, shot.y - q.y) > (i ? 8 : 12)) continue;
      const s = this.snake;
      if (i === 0) { if (this.cancelAttack()) this.knockBack(2); this.stunSnake(1.2, 'ZAP!', 60, q.x, q.y); }
      else if (s.stun <= 0) { s.flinch = 1; s.chew *= 0.7; this.mood('hiss', 0.4); sfx.tough(); }
      return true;
    }
    return false;
  }
  // a continue after she was caught: the cage is rebuilt and the serpent is thrown back down its tunnel
  continueRun() {
    const s = this.snake;
    if (this.phase === 'caught' || s.attack) {
      for (let r = POCKET.r0; r <= POCKET.r1; r++) for (let c = POCKET.c0; c <= POCKET.c1; c++) this.grid.cells[r * COLS + c] = BARS;
      this.cageGone = false; s.attack = null; s.lunge = 0; this.phase = 'rescue';
      this.knockBack(6); s.stun = 3; this.mood('ouch', 0.6);
      this.pr.x = PR_X; this.pr.depth = 0; this.play('Cheer'); this.say('Phew!', 1.2);
    }
    super.continueRun();
  }
  say(text, dur = 1.6) { this.bubble = { text, t: 0, dur }; }
  skipIntro() { if (this.phase === 'intro') { this.phase = 'rescue'; this.introT = 99; } }
  pointerDown(x, y) { if (this.phase === 'intro' && this.introT < 2.8) { this.skipIntro(); return; } super.pointerDown(x, y); }
  release() { if (this.phase === 'intro') this.skipIntro(); super.release(); }

  updateLevel(dt, dtReal) {
    if (this.slomoT > 0) { this.slomoT -= dtReal; if (this.slomoT <= 0 && !this.aim) this.timeScale = 1; }
    const p = this.paddle;
    this.debris.setPaddle(p.x, p.y, p.w, p.h, p.vx);
    for (const b of this.balls) if (!b.caught) this.debris.poke(b);
    this.crushCheck();
    this.debris.step(dt, (piece, x, y, vx, vy) => {
      this.debris.shatter(piece.art, x - piece.w / 2, y - piece.h / 2, piece.w, piece.h, vx * 0.3, vy * -0.2, piece.meta.n === 2 ? 5 : 3);
      sfx.tough(); this.bump(0.12); this.addScore(15);
    });
    for (const br of this.bricks) if (br.wob > 0) br.wob = Math.max(0, br.wob - dtReal * 5);
    this.barsWob = Math.max(0, this.barsWob - dtReal * 3);
    this.updatePrincess(dtReal); this.updateZoom(dtReal);
    if (this.bubble && (this.bubble.t += dtReal) > this.bubble.dur) this.bubble = null;
    if (this.collapseDirty) { this.collapseT -= dtReal; if (this.collapseT <= 0) { this.collapseDirty = false; this.collapseT = 0.12; this.collapse(); } }
    const sn = this.snake; sn.moodT -= dtReal;
    let da = sn.dir - sn.look; da = Math.atan2(Math.sin(da), Math.cos(da)); sn.look += da * Math.min(1, dtReal * 10);
    if (Math.abs(Math.cos(sn.dir)) > 0.3) sn.faceLeft = Math.cos(sn.dir) < 0;
    if ((this.phase === 'escape' || this.phase === 'frenzy') && sn.moodT <= 0) { // the beaten serpent slinks back into its lair
      sn.open = 0; if ((sn.fleeT += dt) > 0.16) { sn.fleeT = 0; if (sn.hist.length) this.knockBack(1); else sn.alpha = Math.max(0, sn.alpha - 0.08); }
    }
    if (this.phase === 'intro') {
      this.introT += dtReal;
      if (this.introT > 0.4 && !this.saidHelp) { this.saidHelp = true; this.play('Interact'); this.say('Help!', 1.4); sfx.zap(); }
      if (this.introT > 1.9 && !this.growled) { this.growled = true; sfx.hurt(); this.snake.open = 1; this.mood('hiss', 1.1); }
      if (this.introT > 3.4) this.phase = 'rescue';
      return;
    }
    if (this.phase === 'rescue') {
      this.updateSnake(dt); this.ballVsSnake();
      const cost = this.snake.cost ?? this.snakeStart;
      this.danger = Math.max(0, Math.min(1, 1 - cost / this.snakeStart)); this.peakDanger = Math.max(this.peakDanger || 0, this.danger);
      this.beatT -= dt;
      if (this.danger > 0.55 && this.beatT <= 0) { sfx.beat(); this.beatT = 1.1 - this.danger * 0.6; }
      if (this.danger > 0.7 && !this.bubble && Math.random() < dt * 0.25) { this.say(Math.random() < 0.5 ? 'Hurry!' : 'It\'s coming!', 1.3); this.play('Interact'); }
    } else if (this.phase === 'caught') {
      this.updateSnake(dt);
    } else if (this.phase === 'escape') {
      this.foxT += dt;
      if (this.foxT > 0.5) this.play('Running_A', true);
      if (Math.floor(this.foxT * 9) >= this.foxPath.length - 1) { this.phase = 'frenzy'; this.frenzyT = 7; this.startFrenzy(); this.play('Cheer'); }
    } else if (this.phase === 'frenzy') {
      this.frenzyT -= dt; this.fireT = Math.max(this.fireT, 0.5);
      if (this.pr.anim === 'Idle') this.play('Cheer');
      if (this.frenzyT <= 0 || this.bricks.every(b => b.gone || b.kind === GRANITE)) { sfx.win(); this.win(); }
    }
  }
  startFrenzy() {
    const p = this.paddle;
    for (let i = 0; i < 12; i++) { const a = -0.9 + i * 0.16; this.balls.push(makeBall(p.x, p.y - 8, Math.sin(a) * 360, -Math.cos(a) * 360, 6)); }
    this.fx.pop(this.W / 2, OY + 160, 'FRENZY!', '#ff9a4a', 34);
    this.bump(0.5);
  }
  loseBall() { if (this.phase === 'frenzy' || this.phase === 'escape') { this.serve(); return; } super.loseBall(); }

  // ---------- drawing ----------
  // The camera leans in as the serpent closes on her: a slow push toward the cage (anchored on the paddle's line so
  // the paddle never moves), then a hard zoom onto the cage for the attack itself.
  updateZoom(dt) {
    let z = 1, ax = this.W / 2, ay = this.paddle.y;
    const cx = OX + 10 * CELL, cy = OY + 4.5 * CELL;
    if (this.snake.attack || this.phase === 'caught') { z = 1.55; ax = cx; ay = cy; }
    else if (this.phase === 'rescue' && this.danger > 0.6) { const k = (this.danger - 0.6) / 0.4; z = 1 + k * 0.1; ax = this.W / 2 + (cx - this.W / 2) * k; }
    const c = this.zc, f = Math.min(1, dt * (z > c.z + 0.2 ? 5 : 2));
    c.z += (z - c.z) * f; c.ax += (ax - c.ax) * f; c.ay += (ay - c.ay) * f;
  }
  camera() { // intro: start close on the princess, glance at the serpent's lair, then pull back to the whole tower
    if (this.phase !== 'intro') return null;
    const t = this.introT, pr = { x: OX + 10 * CELL, y: OY + 4.5 * CELL, z: 2.0 }, lair = { x: OX + 17 * CELL, y: OY + 1.5 * CELL, z: 2.2 }, all = { x: this.W / 2, y: this.H / 2, z: 1 };
    const ease = k => k < 0 ? 0 : k > 1 ? 1 : k * k * (3 - 2 * k), mix = (a, b, k) => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, z: a.z + (b.z - a.z) * k });
    if (t < 1.5) return pr;
    if (t < 2.6) return mix(pr, lair, ease((t - 1.5) / 0.5));
    return mix(lair, all, ease((t - 2.6) / 0.8));
  }
  draw(g) {
    const { W, H } = this;
    g.drawImage(this.background(), 0, 0, W, H);
    const [sx, sy] = this.shakeOffset(), cam = this.camera(), zc = this.zc;
    g.save(); g.translate(sx, sy);
    if (cam) { g.translate(W / 2, H / 2); g.scale(cam.z, cam.z); g.translate(-cam.x, -cam.y); g.drawImage(this.background(), 0, 0, W, H); }
    else if (zc.z > 1.002) { g.translate(zc.ax, zc.ay); g.scale(zc.z, zc.z); g.translate(-zc.ax, -zc.ay); g.drawImage(this.background(), 0, 0, W, H); }
    const prX = this.pr.x, floorY = FLOOR_Y, dk = this.pr.depth || 0;
    this.drawCell(g);
    if (['intro', 'rescue', 'caught'].includes(this.phase)) { this.drawPrincess(g, prX, floorY - 1 - dk * 1.5, 1 + dk * 0.07); if (!this.cageGone) this.drawBars(g); }
    // bricks: shadow pass, then sprites (top rows first so lower bricks overlap upper front faces)
    g.fillStyle = 'rgba(0,0,0,0.42)';
    for (const br of this.bricks) if (!br.gone) g.fillRect(br.x + 2.5, br.y + 4, br.w - 1, br.h - 1);
    for (const br of this.bricks) {
      if (br.gone) continue;
      const a = this.art(br), wob = br.wob ? Math.sin(br.wob * 18) * br.wob * 1.2 : 0;
      g.drawImage(a.img, br.x - a.ox + wob, br.y - a.oy, a.iw, a.ih);
    }
    if (this.snake.chewing && this.phase === 'rescue') this.drawChew(g);
    if (this.phase === 'escape') {
      const i = Math.min(this.foxPath.length - 1, this.foxT * 9), a = this.foxPath[Math.floor(i)], b = this.foxPath[Math.min(this.foxPath.length - 1, Math.floor(i) + 1)], f = i % 1;
      if (Math.abs(b.x - a.x) > 1) this.pr.flip = b.x < a.x;
      this.drawPrincess(g, a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f + 8, 0.8);
    } else if (this.phase === 'frenzy' || this.state === 'won') {
      this.drawPrincess(g, this.paddle.x, this.paddle.y, 0.75);
    }
    if (this.snake.alpha > 0 && this.state !== 'won') this.drawSnake(g);
    this.debris.draw(g);
    this.drawDrops(g); this.drawPaddle(g); this.drawBalls(g); this.fx.draw(g); this.drawAim(g);
    this.drawBubble(g, Math.max(OX + 60, Math.min(OX + COLS * CELL - 60, prX + 4)), floorY - 54);
    g.restore();
    if (this.phase !== 'intro') this.drawDeck(g);
    if (this.phase === 'rescue' && this.danger > 0.5) {
      const a = (this.danger - 0.5) * 0.7 * (0.6 + 0.4 * Math.sin(this.t * 7));
      const vg = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75);
      vg.addColorStop(0, 'rgba(160,0,30,0)'); vg.addColorStop(1, `rgba(160,0,30,${a})`); g.fillStyle = vg; g.fillRect(0, 0, W, H);
    }
    const at = this.snake.attack?.t || 0;
    if (at > 1.65) { g.fillStyle = `rgba(200,0,30,${Math.max(0, 0.45 - (at - 1.65) * 0.4)})`; g.fillRect(0, 0, W, H); }
    if (this.phase === 'intro') this.drawIntroText(g);
    else this.drawHUD(g);
  }
  // The serpent: a tapered, lit body that follows the path, under a rendered head that changes expression.
  drawSnake(g) {
    const s = this.snake, pts = this.snakePoints(), t = this.t;
    if (!SNAKE || !ready(SNAKE)) { drawSerpent(g, pts, s.dir, t, s.stun, s.open); return; }
    g.save(); g.globalAlpha = s.alpha;
    this.drawSnakeBody(g, pts);
    // head: the rendered facing nearest the direction it's looking, rotated the rest of the way
    // the head faces left or right and noses up or down at most ~55 degrees, so its face always reads
    const h = pts[0], a = s.look, L = s.faceLeft, base = L ? Math.PI : 0;
    const rot = Math.max(-0.95, Math.min(0.95, Math.atan2(Math.sin(a - base), Math.cos(a - base))));
    const best = [L ? 'l' : 'r'];
    const ex = this.expression(), shake = ex === 'ouch' || s.flinch > 0 ? Math.sin(t * 60) * 0.06 : ex === 'dizzy' ? Math.sin(t * 9) * 0.1 : Math.sin(t * 2.6) * 0.04;
    const k = 1.45 * (1 + Math.min(0.25, s.eaten * 0.015) + (s.gulp || 0) * 0.06), size = SNAKE.unit * k, cell = SNAKE.cell, col = SNAKE.expr[ex] ?? 0, row = SNAKE.dir[best[0]];
    const bob = Math.sin(t * 3.2) * 0.8 + (ex === 'hiss' ? -1.5 : 0);
    g.save(); g.translate(h.x, h.y + bob); g.rotate(rot + shake);
    g.drawImage(SNAKE.img, col * cell, row * cell, cell, cell, -size / 2, -size / 2, size, size);
    g.restore();
    const at = s.attack?.t ?? -1;   // telegraph each strike so a sharp player can still react
    if ((at >= 0 && at < 0.6) || (at > 0.8 && at < 1.2)) text(g, '!', h.x, h.y - 26 - Math.sin(t * 30) * 1.5, 22, '#ff4d5e', 'center');
    g.restore();
  }
  drawSnakeBody(g, pts) {
    const s = this.snake, t = this.t;
    // a smooth centreline through the cell centres (Catmull-Rom), extended past the last cell to a tail tip
    const P = pts.slice(), n = P.length;
    if (n < 2) return;
    const last = P[n - 1], prev = P[n - 2];
    P.push({ x: last.x + (last.x - prev.x) * 0.6, y: last.y + (last.y - prev.y) * 0.6 });
    const C = [];
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
      for (let j = 0; j < 8; j++) {
        const u = j / 8, u2 = u * u, u3 = u2 * u;
        C.push({ x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * u + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * u2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * u3),
                 y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * u + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * u2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * u3) });
      }
    }
    C.push(P[P.length - 1]);
    let len = 0; const arc = [0];
    for (let i = 1; i < C.length; i++) { len += Math.hypot(C[i].x - C[i - 1].x, C[i].y - C[i - 1].y); arc.push(len); }
    const belly = s.faceLeft ? -1 : 1, shake = s.flinch > 0 ? s.flinch * 2.2 : 0, gr = this.growth();
    const S = C.map((p, i) => {
      const q = C[Math.min(C.length - 1, i + 1)], o = C[Math.max(0, i - 1)];
      let tx = o.x - q.x, ty = o.y - q.y; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;   // tangent toward the head
      const f = arc[i] / len, nx = -ty * belly, ny = tx * belly;                                    // normal toward the belly
      const bulge = s.gulp > 0 ? Math.exp(-Math.pow((f - (1 - s.gulp)) * 7, 2)) * 3 * s.gulp : 0;   // a swallowed lump travels down the body
      const w = ((f < 0.12 ? 12 + f / 0.12 * 2 : 14 * Math.pow((1 - f) / 0.88, 0.7)) * gr + bulge) / 2 + 0.6;
      const wig = Math.sin(t * 4.5 - arc[i] * 0.22) * 1.3 * Math.min(1, f * 4) + Math.sin(t * 50 + i) * shake;
      return { x: p.x + nx * wig, y: p.y + ny * wig, nx, ny, tx, ty, w, a: arc[i] };
    });
    const edge = k => S.map(p => [p.x + p.nx * p.w * k, p.y + p.ny * p.w * k]);
    const outline = () => { const A = edge(1), B = edge(-1).reverse(); g.beginPath(); A.concat(B).forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); };
    const band = (k0, k1) => { const A = edge(k0), B = edge(k1).reverse(); g.beginPath(); A.concat(B).forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); };
    const strokeAlong = (ox, oy, wk, color) => { // a band offset in world space (fixed light), filled once so it stays smooth
      const A = S.map(p => [p.x + ox * p.w + p.nx * p.w * wk, p.y + oy * p.w + p.ny * p.w * wk]);
      const B = S.map(p => [p.x + ox * p.w - p.nx * p.w * wk, p.y + oy * p.w - p.ny * p.w * wk]).reverse();
      g.beginPath(); A.concat(B).forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fillStyle = color; g.fill();
    };
    // contact shadow
    g.save(); g.translate(2.5, 4); outline(); g.fillStyle = 'rgba(0,0,0,0.35)'; g.fill(); g.restore();
    g.save(); outline(); g.fillStyle = '#7a3ccc'; g.fill(); g.clip();
    band(0.42, 1.05); g.fillStyle = '#ffc49a'; g.fill();                                   // peach belly
    g.strokeStyle = 'rgba(150,70,60,0.35)'; g.lineWidth = 0.7;                             // belly plates
    for (let i = 0, next = 0; i < S.length; i++) if (S[i].a >= next) {
      next += 3.2; const p = S[i]; g.beginPath(); g.moveTo(p.x + p.nx * p.w * 0.44, p.y + p.ny * p.w * 0.44); g.lineTo(p.x + p.nx * p.w * 1.05, p.y + p.ny * p.w * 1.05); g.stroke();
    }
    for (let i = 0, next = 6; i < S.length; i++) if (S[i].a >= next) {                      // rose diamonds down the back
      next += 9; const p = S[i], cx = p.x - p.nx * p.w * 0.3, cy = p.y - p.ny * p.w * 0.3, L = p.w * 0.95, W = p.w * 0.42;
      g.beginPath(); g.moveTo(cx + p.tx * L, cy + p.ty * L); g.lineTo(cx - p.nx * W, cy - p.ny * W); g.lineTo(cx - p.tx * L, cy - p.ty * L); g.lineTo(cx + p.nx * W, cy + p.ny * W); g.closePath();
      g.fillStyle = '#ff6fae'; g.fill(); g.strokeStyle = '#1e0a40'; g.lineWidth = 1; g.stroke();
    }
    strokeAlong(0.5, 0.65, 0.75, 'rgba(18,4,40,0.26)');                                   // core shadow, lower right
    strokeAlong(-0.3, -0.4, 0.3, 'rgba(225,190,255,0.3)');                            // soft key light, upper left
    strokeAlong(-0.38, -0.5, 0.09, 'rgba(255,255,255,0.55)');                               // glossy coat highlight
    g.restore();
    outline(); g.strokeStyle = '#1e0a40'; g.lineWidth = 1.1; g.stroke();
  }
  // The cell: a dark, cool stone room with a soft light falling on the princess, so she is the brightest thing in it.
  drawCell(g) {
    const x = OX + POCKET.c0 * CELL, y = OY + POCKET.r0 * CELL, w = 6 * CELL, h = 3 * CELL;
    const bg = g.createLinearGradient(0, y, 0, y + h); bg.addColorStop(0, '#1b1e2e'); bg.addColorStop(1, '#10111b');
    g.fillStyle = bg; g.fillRect(x, y, w, h);
    g.strokeStyle = 'rgba(160,170,210,0.07)'; g.lineWidth = 1; g.beginPath();   // stone courses on the back wall
    for (let r = 1; r < 4; r++) { g.moveTo(x, y + r * 12 + 0.5); g.lineTo(x + w, y + r * 12 + 0.5); }
    for (let r = 0; r < 4; r++) for (let c = (r % 2) * 11; c < w; c += 22) { g.moveTo(x + c + 0.5, y + r * 12); g.lineTo(x + c + 0.5, y + r * 12 + 12); }
    g.stroke();
    g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(x, y + h - 5, w, 5);           // floor shadow
    if (this.cageGone && this.phase !== 'caught') return;   // once she's out, the empty cell stays dark
    const sx = this.pr.x;
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.globalCompositeOperation = 'lighter';
    const shaft = g.createLinearGradient(0, y, 0, y + h); shaft.addColorStop(0, 'rgba(150,180,255,0.16)'); shaft.addColorStop(1, 'rgba(150,180,255,0.02)');
    g.fillStyle = shaft; g.beginPath(); g.moveTo(sx - 7, y); g.lineTo(sx + 7, y); g.lineTo(sx + 24, y + h); g.lineTo(sx - 24, y + h); g.closePath(); g.fill();
    const pool = g.createRadialGradient(sx, y + h - 4, 1, sx, y + h - 6, 30); pool.addColorStop(0, 'rgba(190,210,255,0.3)'); pool.addColorStop(1, 'rgba(190,210,255,0)');
    g.fillStyle = pool; g.fillRect(x, y, w, h);
    g.restore();
    const ig = g.createLinearGradient(0, y, 0, y + 10); ig.addColorStop(0, 'rgba(0,0,0,0.55)'); ig.addColorStop(1, 'rgba(0,0,0,0)'); // the frame's shadow
    g.fillStyle = ig; g.fillRect(x, y, w, 10);
  }
  // Dark iron bars: a rail top and bottom and a few thin uprights, lit from the top-left like everything else.
  drawBars(g) {
    const wob = this.barsWob ? Math.sin(this.barsWob * 30) * this.barsWob * 1.5 : 0;
    const x0 = OX + POCKET.c0 * CELL, y0 = OY + POCKET.r0 * CELL, w = 6 * CELL, h = 3 * CELL;
    const n = 5;
    for (let i = 1; i <= n; i++) {
      const x = x0 + (w * i) / (n + 1) + wob * (i % 2 ? 1 : -1);
      g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(x + 1.2, y0 + 3, 2.2, h - 3);
      const bg = g.createLinearGradient(x - 1.1, 0, x + 1.3, 0);
      bg.addColorStop(0, '#20232f'); bg.addColorStop(0.35, '#a3abc2'); bg.addColorStop(0.6, '#4a5066'); bg.addColorStop(1, '#171a24');
      g.fillStyle = bg; g.fillRect(x - 1.1, y0, 2.4, h);
    }
    for (const [ry, rh] of [[y0, 3.5], [y0 + h - 3.5, 3.5]]) {
      g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(x0 + 1.5, ry + 2, w, rh);
      const rg = g.createLinearGradient(0, ry, 0, ry + rh); rg.addColorStop(0, '#b6bdd2'); rg.addColorStop(0.45, '#545a70'); rg.addColorStop(1, '#1c1f2b');
      g.fillStyle = rg; g.fillRect(x0, ry, w, rh);
      for (let i = 1; i <= n; i++) { const x = x0 + (w * i) / (n + 1); g.fillStyle = '#c9cfe0'; g.beginPath(); g.arc(x - 0.3, ry + rh / 2 - 0.3, 0.8, 0, 7); g.fill(); }
    }
  }
  drawChew(g) { // bite marks eaten out of the edge facing the serpent, deeper with every chomp
    const s = this.snake, [c, r] = s.chewing, br = this.brickAt(c, r);
    if (!br || br.kind === GRANITE) return;
    const x = OX + c * CELL, y = OY + r * CELL, k = Math.min(1, s.chew / s.need), ux = -Math.cos(s.dir), uy = -Math.sin(s.dir);
    const ex = x + CELL / 2 + ux * CELL / 2, ey = y + CELL / 2 + uy * CELL / 2, tx = -uy, ty = ux; // centre of the bitten edge, and along it
    g.save(); g.beginPath(); g.rect(x, y, CELL, CELL); g.clip();
    const n = 1 + Math.floor(k * 3);
    for (let i = 0; i < n; i++) {
      const o = (i - (n - 1) / 2) * 5, rad = 2.5 + k * 4.5, bx = ex + tx * o, by = ey + ty * o;
      g.fillStyle = 'rgba(16,6,26,0.92)'; g.beginPath(); g.arc(bx, by, rad, 0, 7); g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.25)'; g.lineWidth = 0.8; g.beginPath(); g.arc(bx, by, rad + 0.6, 0, 7); g.stroke();
    }
    g.strokeStyle = 'rgba(20,6,30,0.7)'; g.lineWidth = 1; g.beginPath(); // cracks running away from the bite
    g.moveTo(ex, ey); g.lineTo(ex - ux * 9 * k + tx * 3, ey - uy * 9 * k + ty * 3); g.moveTo(ex, ey); g.lineTo(ex - ux * 7 * k - tx * 4, ey - uy * 7 * k - ty * 4); g.stroke();
    g.restore();
  }
  drawBubble(g, x, y) {
    const b = this.bubble; if (!b || this.phase === 'escape' || this.phase === 'frenzy') return;
    const k = Math.min(1, b.t / 0.15), out = b.t > b.dur - 0.2 ? (b.dur - b.t) / 0.2 : 1, s = (0.6 + 0.4 * k + (k < 1 ? 0 : Math.sin(b.t * 10) * 0.02)) * out;
    g.save(); g.translate(x, y); g.scale(s, s);
    g.font = '15px "Lilita One", system-ui'; const w = g.measureText(b.text).width + 20;
    g.fillStyle = 'rgba(0,0,0,0.3)'; rrect(g, -w / 2 + 2, -14 + 3, w, 26, 13); g.fill();
    g.fillStyle = '#fff'; rrect(g, -w / 2, -14, w, 26, 13); g.fill();
    g.beginPath(); g.moveTo(-5, 11); g.lineTo(3, 11); g.lineTo(-3, 19); g.closePath(); g.fill();
    g.fillStyle = '#2a1830'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(b.text, 0, 0);
    g.restore();
  }
  drawMotes(g) { // dust drifting through the light, for a bit of air in the scene
    g.fillStyle = 'rgba(255,230,190,0.35)';
    for (const m of this.motes) {
      const x = (m.x + Math.sin(this.t * 0.3 + m.p) * 14 + this.W) % this.W, y = (m.y - this.t * 6 * m.s + this.H * 4) % this.H;
      g.globalAlpha = 0.25 + 0.25 * Math.sin(this.t * 1.3 + m.p); g.beginPath(); g.arc(x, y, m.s, 0, 7); g.fill();
    }
    g.globalAlpha = 1;
  }
  drawIntroText(g) {
    const t = this.introT, a = Math.min(1, t * 3) * Math.min(1, (3.4 - t) * 3);
    g.globalAlpha = Math.max(0, a);
    const line = t < 1.5 ? 'The princess is trapped!' : t < 2.6 ? 'Something is coming…' : 'Break a path up to her';
    text(g, line, this.W / 2, this.H - 150, 22, '#fff', 'center');
    text(g, 'Tap to skip', this.W / 2, this.H - 118, 12, 'rgba(255,255,255,0.7)', 'center');
    g.globalAlpha = 1;
  }
  drawHUD(g) { // how close the serpent is: no numbers, just a bar that runs green to amber to red, from serpent to princess
    const W = this.W, y = this.hudY + 27, x0 = 52, x1 = W - 120;
    text(g, 'SERPENT', x0, this.hudY + 10, 13, '#d9b8f0');
    const d = this.phase === 'rescue' ? (this.snake.attack ? 1 : this.danger || 0) : this.phase === 'caught' ? 1 : 0;
    const lerp = (a, b, k) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
    const c = d < 0.5 ? lerp([95, 211, 138], [255, 201, 71], d / 0.5) : lerp([255, 201, 71], [255, 77, 94], (d - 0.5) / 0.5);
    const light = `rgb(${c.map(v => Math.round(v + (255 - v) * 0.45))})`, dark = `rgb(${c.map(v => Math.round(v * 0.7))})`;
    g.fillStyle = 'rgba(0,0,0,0.45)'; rrect(g, x0, y - 6, x1 - x0, 12, 6); g.fill();
    const fw = Math.max(12, (x1 - x0) * d), pulse = d > 0.75 ? 0.75 + 0.25 * Math.sin(this.t * 10) : 1;
    const mg = g.createLinearGradient(0, y - 6, 0, y + 6); mg.addColorStop(0, light); mg.addColorStop(1, dark);
    g.globalAlpha = pulse; g.fillStyle = mg; rrect(g, x0, y - 6, fw, 12, 6); g.fill(); g.globalAlpha = 1;
    g.fillStyle = 'rgba(255,255,255,0.35)'; rrect(g, x0 + 4, y - 4, Math.max(4, fw - 8), 3, 1.5); g.fill();
    drawPrincessIcon(g, x1 + 14, y - 3, 30, this.t);   // the goal at the end of the bar
    if (this.phase === 'frenzy') text(g, `FRENZY ${Math.ceil(this.frenzyT)}`, W / 2, OY + ROWS * CELL + 40, 22, '#ffb35c', 'center');
    this.drawHUDBase(g);
  }
  // the sky above the playfield, under the notch: the plate extends 40 units above y = 0, then its top row stretches
  drawTopInset(g, h) {
    if (!(PLATE?.complete && PLATE.naturalWidth)) { g.fillStyle = '#1b1530'; g.fillRect(0, -h, this.W, h); return; }
    if (h > 40) g.drawImage(PLATE, 0, 0, PLATE.width, 1, 0, -h, 360, h - 39);
    g.drawImage(PLATE, 0, 0, PLATE.width, 80, 0, -40, 360, 40);
  }
  background() {
    return cached('vault2-bg' + this.W + 'x' + this.H + (PLATE?.complete ? 'p' : ''), this.W, this.H, g => {
      const { W, H } = this;
      if (PLATE?.complete && PLATE.naturalWidth) { g.drawImage(PLATE, 0, -40, 360, 820); if (H > 780) g.drawImage(PLATE, 0, PLATE.height - 2, PLATE.width, 2, 0, 780, W, H - 780); return; }
      const bg = g.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#1c2140'); bg.addColorStop(0.5, '#141831'); bg.addColorStop(1, '#0b0d1c');
      g.fillStyle = bg; g.fillRect(0, 0, W, H);
      // hollow tower interior behind the bricks, stone pillars either side, courtyard wall below
      g.fillStyle = '#120d18'; g.fillRect(OX, OY, COLS * CELL, ROWS * CELL);
      for (const x of [0, OX + COLS * CELL]) { const pg = g.createLinearGradient(x, 0, x + OX, 0); pg.addColorStop(0, '#2e3350'); pg.addColorStop(0.5, '#4a4f6e'); pg.addColorStop(1, '#262a42'); g.fillStyle = pg; g.fillRect(x, OY - 26, OX, ROWS * CELL + 34); }
      g.fillStyle = '#3a3f5c'; g.fillRect(0, OY - 10, W, 10);
      for (let i = 0; i < 10; i++) { g.fillStyle = '#3a3f5c'; g.fillRect(6 + i * 36, OY - 26, 20, 16); }
      g.fillStyle = '#6b4a2f'; g.fillRect(OX + POCKET.c0 * CELL, OY + POCKET.r0 * CELL, 6 * CELL, 3 * CELL);
      for (let y = OY + ROWS * CELL + 8, row = 0; y < H; y += 40, row++) for (let x = (row % 2) * -40; x < W; x += 80) {
        g.fillStyle = 'rgba(255,255,255,0.03)'; g.fillRect(x + 1, y + 1, 78, 38); g.strokeStyle = 'rgba(0,0,0,0.4)'; g.strokeRect(x + 0.5, y + 0.5, 79, 39);
      }
      vignette(g, W, H, 0.55);
      drawGrain(g, W, H);
    });
  }
  result() {
    // one star for the rescue, one for never letting the serpent get halfway, one for a big score
    const stars = this.state !== 'won' ? 0 : 1 + (this.peakDanger < 0.5 ? 1 : 0) + (this.score > 10000 ? 1 : 0);
    return { stars, lines: [['Score', this.score.toLocaleString()], ['Bricks broken', this.bricksBroken], ['Best combo', `×${this.bestCombo}`]] };
  }
}
export { NUM };
// the princess calling for help, for the level card on the menu
export function drawPrincessIcon(g, x, y, size, t) {
  if (!PRINCESS || !PRINCESS.img.complete) return false;
  const P = PRINCESS, a = P.anims.Interact, f = Math.floor(t * 12) % a.n;
  g.drawImage(P.img, f * P.cell, a.row * P.cell, P.cell, P.cell, x - size / 2, y - size / 2, size, size);
  return true;
}
