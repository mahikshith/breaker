// Discrete collider changes (a keypose swap, a knock-back, a rebuilt cell) can land a solid on a ball between
// steps, where no sweep sees it. clearance() finds the shortest push that takes a ball of radius r clear of a set
// of solid shapes (circles and axis-aligned rects, as drawn); ejectBall() moves the ball out along that normal.
const DIRS = 64, EPS = 1e-7;

// Minkowski sum with the ball: circles grow by r, a rect becomes two slabs plus four corner circles.
function grow(shapes, r) {
  const out = [];
  for (const s of shapes) {
    if (s.type === 'circle') out.push({ c: true, x: s.x, y: s.y, r: s.r + r });
    else if (s.type === 'rect') {
      out.push({ c: false, x0: s.x - r, y0: s.y, x1: s.x + s.w + r, y1: s.y + s.h }, { c: false, x0: s.x, y0: s.y - r, x1: s.x + s.w, y1: s.y + s.h + r });
      for (const [x, y] of [[s.x, s.y], [s.x + s.w, s.y], [s.x, s.y + s.h], [s.x + s.w, s.y + s.h]]) out.push({ c: true, x, y, r });
    }
  }
  return out;
}
const inside = (p, x, y) => p.c ? (x - p.x) ** 2 + (y - p.y) ** 2 < p.r * p.r - EPS : x > p.x0 + EPS && x < p.x1 - EPS && y > p.y0 + EPS && y < p.y1 - EPS;
function exit(p, x, y, nx, ny) { // distance along (nx, ny) from an inside point to p's boundary
  if (p.c) { const b = (x - p.x) * nx + (y - p.y) * ny, c = (x - p.x) ** 2 + (y - p.y) ** 2 - p.r * p.r; return -b + Math.sqrt(Math.max(0, b * b - c)); }
  return Math.min(nx > EPS ? (p.x1 - x) / nx : nx < -EPS ? (p.x0 - x) / nx : Infinity, ny > EPS ? (p.y1 - y) / ny : ny < -EPS ? (p.y0 - y) / ny : Infinity);
}

export const overlapsAny = (x, y, r, shapes) => grow(shapes, r).some(p => inside(p, x, y));

// { nx, ny, depth } for the shortest clearing push (preferring end points that satisfy ok(x, y)), or null when clear.
export function clearance(x, y, r, shapes, ok) {
  const parts = grow(shapes, r);
  if (!parts.some(p => inside(p, x, y))) return null;
  const dirs = [];
  for (let i = 0; i < DIRS; i++) dirs.push([Math.cos(i / DIRS * 2 * Math.PI), Math.sin(i / DIRS * 2 * Math.PI)]);
  for (const p of parts) if (p.c && inside(p, x, y)) { const d = Math.hypot(x - p.x, y - p.y); if (d > EPS) dirs.push([(x - p.x) / d, (y - p.y) / d]); }
  let best = null, any = null;
  for (const [nx, ny] of dirs) {
    let s = 0;
    for (let k = 0; k < 256; k++) { // step out of each shape the ray is still inside, until it is inside none
      let moved = false;
      for (const p of parts) if (inside(p, x + nx * s, y + ny * s)) { s += exit(p, x + nx * s, y + ny * s, nx, ny) + EPS; moved = true; }
      if (!moved) break;
    }
    const c = { nx, ny, depth: s };
    if (!any || s < any.depth) any = c;
    if ((!ok || ok(x + nx * s, y + ny * s)) && (!best || s < best.depth)) best = c;
  }
  return best || any;
}

// Push the ball out to its radius plus eps; reflect its velocity only if it is moving into the solid.
export function ejectBall(ball, shapes, { ok, eps = .05 } = {}) {
  const c = clearance(ball.x, ball.y, ball.r, shapes, ok);
  if (!c) return null;
  ball.x += c.nx * (c.depth + eps); ball.y += c.ny * (c.depth + eps);
  const vn = ball.vx * c.nx + ball.vy * c.ny;
  c.reflected = vn < 0; // it was moving into the solid: a genuine contact
  if (c.reflected) { ball.vx -= 2 * vn * c.nx; ball.vy -= 2 * vn * c.ny; }
  return c;
}

// Paddle growth (WIDE): the widest half-width, up to want, a paddle centred at x with its body spanning y0..y1 can take
// without its ends landing on a ball that is beside it now. A ball already within reach of the current paddle is left to
// the paddle's own contact; one beside it waits until it has dropped past or moved off, and the paddle grows around it then.
export function paddleRoom(x, half, want, y0, y1, balls) {
  let room = want;
  if (want <= half) return want;
  for (const b of balls || []) {
    if (b.dead || b.caught || b.y + b.r <= y0 || b.y - b.r >= y1) continue;
    const gap = Math.abs(b.x - x) - b.r;
    if (gap < half) continue;
    room = Math.min(room, Math.max(half, gap - .5));
  }
  return room;
}
