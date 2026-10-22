// Ball physics: fixed-step, substepped circle vs uniform grid, walls and paddle. No DOM.
import { collideTargets } from './carrier-physics.js';

export function makeGrid(cols, rows, cw, ch, ox = 0, oy = 0) {
  return { cols, rows, cw, ch, ox, oy, cells: new Uint8Array(cols * rows), hp: new Uint8Array(cols * rows) };
}
export const cellAt = (G, c, r) => (c < 0 || r < 0 || c >= G.cols || r >= G.rows ? 0 : G.cells[r * G.cols + c]);

export function makeBall(x, y, vx, vy, r = 5) {
  return { x, y, vx, vy, r, spin: 0, fire: false, dead: false, caught: false, trail: [] };
}

const MIN_VY = 0.22; // never let a ball fly near-horizontal for long (fraction of speed)

// Optional targets/onTarget add visible irregular actors; absent in existing levels.
export function stepBall(b, dt, world) {
  if (b.dead || b.caught) return;
  const G = world.grid;
  const speed = Math.hypot(b.vx, b.vy);
  const maxMove = Math.min(G ? Math.min(G.cw, G.ch) : 8, b.r) * 0.45;
  const targetSpeed = world.targets?.reduce((m, t) => t.active === false ? m : Math.max(m, Math.hypot(t.vx || 0, t.vy || 0)), 0) || 0;
  const n = Math.max(1, Math.ceil(((speed + targetSpeed) * dt) / maxMove));
  const h = dt / n;
  for (let i = 0; i < n && !b.dead; i++) {
    if (b.spin) { // spin curves the ball: rotate velocity, then decay
      const a = b.spin * h, cs = Math.cos(a), sn = Math.sin(a);
      const vx = b.vx * cs - b.vy * sn; b.vy = b.vx * sn + b.vy * cs; b.vx = vx;
      b.spin *= Math.exp(-h / 0.7);
      if (Math.abs(b.spin) < 0.02) b.spin = 0;
    }
    b.x += b.vx * h; b.y += b.vy * h;
    if (b.x - b.r < world.left) { b.x = world.left + b.r; b.vx = Math.abs(b.vx); world.onWall?.(b); }
    if (b.x + b.r > world.right) { b.x = world.right - b.r; b.vx = -Math.abs(b.vx); world.onWall?.(b); }
    if (b.y - b.r < world.top) { b.y = world.top + b.r; b.vy = Math.abs(b.vy); world.onWall?.(b); }
    if (G) collideGrid(b, G, world.onHit, world.ramCell);
    if (world.targets) collideTargets(b, world.targets, world.onTarget, (i + 1) * h, world.ramTarget);
    if (b.dead) break;
    if (world.paddle) collidePaddle(b, world.paddle, world.onPaddle);
    if (b.y - b.r > world.bottom) { b.dead = true; world.onLost?.(b); }
  }
  keepVertical(b);
}

function keepVertical(b) {
  const s = Math.hypot(b.vx, b.vy);
  if (!s || Math.abs(b.vy) >= s * MIN_VY) return;
  b.vy = Math.sign(b.vy || 1) * s * MIN_VY;
  b.vx = Math.sign(b.vx) * Math.sqrt(s * s - b.vy * b.vy);
}

const hitBuf = [];
// ramCell(value, c, r): true for an ordinary brick a live Sweet-Spot Ram (b.ram > 0) ploughs through without bouncing.
export function collideGrid(b, G, onHit, ramCell) {
  const c0 = Math.floor((b.x - b.r - G.ox) / G.cw), c1 = Math.floor((b.x + b.r - G.ox) / G.cw);
  const r0 = Math.floor((b.y - b.r - G.oy) / G.ch), r1 = Math.floor((b.y + b.r - G.oy) / G.ch);
  let nx = 0, ny = 0, pen = 0;
  const piercing = b.fire || b.titan > 0, ram = b.ram > 0 && ramCell;
  const passes = (v, c, r) => (piercing && !G.unpierceable?.includes(v)) || (ram && ramCell(v, c, r));
  hitBuf.length = 0;
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
    const v = cellAt(G, c, r);
    if (!v) continue;
    const x0 = G.ox + c * G.cw, y0 = G.oy + r * G.ch, x1 = x0 + G.cw, y1 = y0 + G.ch;
    const px = Math.min(Math.max(b.x, x0), x1), py = Math.min(Math.max(b.y, y0), y1);
    let dx = b.x - px, dy = b.y - py;
    const d = Math.hypot(dx, dy);
    if (d >= b.r) continue;
    if (passes(v, c, r)) { hitBuf.push(c, r); continue; }
    if (d === 0) { dx = -b.vx; dy = -b.vy; }
    else if (dx && dy) {
      // Corner contact. If the neighbour along one axis is solid this is really a flat face
      // made of many small bricks, so bounce off the face instead of the seam ("ghost edge").
      const sx = Math.sign(dx), sy = Math.sign(dy);
      const alongX = cellAt(G, c + sx, r), alongY = cellAt(G, c, r + sy);
      if (alongX && !passes(alongX, c + sx, r)) dx = 0;
      else if (alongY && !passes(alongY, c, r + sy)) dy = 0;
    }
    const m = Math.hypot(dx, dy) || 1;
    nx += dx / m; ny += dy / m;
    pen = Math.max(pen, b.r - d);
    hitBuf.push(c, r);
  }
  if (!hitBuf.length) return false;
  const m = Math.hypot(nx, ny);
  if (m > 0) {
    nx /= m; ny /= m;
    b.x += nx * pen; b.y += ny * pen;
    const vn = b.vx * nx + b.vy * ny;
    if (vn < 0) { b.vx -= 2 * vn * nx; b.vy -= 2 * vn * ny; }
  }
  for (let i = 0; i < hitBuf.length; i += 2) onHit?.(hitBuf[i], hitBuf[i + 1], b);
  return true;
}

// paddle = { x (centre), y (top), w, h, vx }
export function collidePaddle(b, p, onPaddle) {
  if (b.vy <= 0) return false;
  if (b.y + b.r < p.y || b.y - b.r > p.y + p.h || b.x < p.x - p.w / 2 - b.r || b.x > p.x + p.w / 2 + b.r) return false;
  const off = Math.max(-1, Math.min(1, (b.x - p.x) / (p.w / 2)));
  const ang = off * (62 * Math.PI / 180);
  const s = Math.hypot(b.vx, b.vy);
  b.vx = s * Math.sin(ang); b.vy = -s * Math.cos(ang);
  b.y = p.y - b.r;
  b.spin = Math.max(-3, Math.min(3, -(p.vx || 0) * 0.006)); // swipe the paddle to curve the shot
  onPaddle?.(b);
  return true;
}

// Cells reachable from (c, r) through empty cells. Used for "is the creature's pocket open to the outside?".
export function floodEmpty(G, c, r, blocked) {
  const seen = new Uint8Array(G.cols * G.rows), q = [r * G.cols + c];
  seen[q[0]] = 1;
  for (let i = 0; i < q.length; i++) {
    const k = q[i], cc = k % G.cols, rr = (k - cc) / G.cols;
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nc = cc + dc, nr = rr + dr;
      if (nc < 0 || nr < 0 || nc >= G.cols || nr >= G.rows) continue;
      const nk = nr * G.cols + nc;
      if (seen[nk] || G.cells[nk] || blocked?.(nc, nr)) continue;
      seen[nk] = 1; q.push(nk);
    }
  }
  return { seen, list: q };
}
