// DOM-free circle collision against the Carrier's visible world-space geometry.
const episodes = new WeakMap();
const EPS = 1e-7, SKIN = 0.02, PROBE = 1e-4;
const live = t => t.active !== false && !(t.hp !== undefined && t.hp <= 0);
const shapes = t => t.shapes || [t];

function loops(s) {
  if (s.type === 'rect') return [[[s.x, s.y], [s.x + s.w, s.y], [s.x + s.w, s.y + s.h], [s.x, s.y + s.h]]];
  return [s.points, ...(s.holes || [])];
}
function inLoop(x, y, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [ax, ay] = points[i], [bx, by] = points[j];
    const cross = (x - ax) * (by - ay) - (y - ay) * (bx - ax);
    if (Math.abs(cross) < EPS && x >= Math.min(ax, bx) - EPS && x <= Math.max(ax, bx) + EPS && y >= Math.min(ay, by) - EPS && y <= Math.max(ay, by) + EPS) return true;
    if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) inside = !inside;
  }
  return inside;
}
function contains(s, x, y) {
  if (s.type === 'circle') return (x - s.x) ** 2 + (y - s.y) ** 2 <= s.r ** 2;
  if (s.type === 'rect') return x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h;
  return inLoop(x, y, s.points) && !(s.holes || []).some(h => inLoop(x, y, h));
}
function bounds(s) {
  if (s.type === 'circle') return [s.x - s.r, s.y - s.r, s.x + s.r, s.y + s.r];
  if (s.type === 'rect') return [s.x, s.y, s.x + s.w, s.y + s.h];
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of s.points) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  return [x0, y0, x1, y1];
}
function entries(target, time) {
  return shapes(target).map(s => ({ s, target, dx: (target.vx || 0) * time, dy: (target.vy || 0) * time }));
}
const inside = (x, y, list) => list.some(e => contains(e.s, x - e.dx, y - e.dy));
function near(b, e, r) {
  const q = bounds(e.s), x = b.x - e.dx, y = b.y - e.dy;
  return x + r >= q[0] && x - r <= q[2] && y + r >= q[1] && y - r <= q[3];
}
function edges(s, visit) {
  for (const [li, p] of loops(s).entries()) {
    let area = 0;
    for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; area += a[0] * b[1] - b[0] * a[1]; }
    const winding = (area < 0 ? -1 : 1) * (li ? -1 : 1);
    for (let i = 0; i < p.length; i++) {
      const a = p[i], b = p[(i + 1) % p.length], dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy);
      if (n > EPS) visit(a[0], a[1], b[0], b[1], winding * dy / n, -winding * dx / n);
    }
  }
}

function contact(b, list, padding = 0) {
  const radius = b.r + padding;
  if (!list.some(e => near(b, e, radius))) return null;
  const embedded = inside(b.x, b.y, list);
  let best = embedded ? Infinity : radius + EPS, result = null;
  const candidate = (x, y, ex, ey, e) => {
    const dx = b.x - x, dy = b.y - y, d = Math.hypot(dx, dy);
    if (d >= best) return;
    let nx = ex, ny = ey;
    if (d > EPS) { nx = (embedded ? -dx : dx) / d; ny = (embedded ? -dy : dy) / d; }
    // Ignore internal faces between adjoining/overlapping sectors.
    if (inside(x + nx * PROBE, y + ny * PROBE, list)) return;
    best = d; result = { nx, ny, depth: embedded ? radius + d : radius - d, x, y, target: e.target };
  };
  for (const e of list) {
    if (!embedded && !near(b, e, radius)) continue;
    const s = e.s, x = b.x - e.dx, y = b.y - e.dy;
    if (s.type === 'circle') {
      const dx = x - s.x, dy = y - s.y, n = Math.hypot(dx, dy), nx = n > EPS ? dx / n : 0, ny = n > EPS ? dy / n : -1;
      candidate(s.x + nx * s.r + e.dx, s.y + ny * s.r + e.dy, nx, ny, e);
    } else edges(s, (ax, ay, bx, by, nx, ny) => {
      const dx = bx - ax, dy = by - ay, u = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
      candidate(ax + u * dx + e.dx, ay + u * dy + e.dy, nx, ny, e);
    });
  }
  return result && result.depth >= -EPS ? result : null;
}

export function overlapsTarget(ball, target, time = 0) {
  return live(target) && !!contact(ball, entries(target, time));
}

// Geometry is sampled at tick start; vx/vy translate it within this step.
export function collideTargets(ball, targets, onTarget, time = 0) {
  let held = episodes.get(ball);
  if (!held) { held = new Set(); episodes.set(ball, held); }
  const touching = new Set(), hits = [], solid = [];
  const powered = ball.fire || ball.titan > 0;
  for (const target of targets) {
    if (!live(target)) continue;
    const list = entries(target, time), id = target.id ?? target;
    if (target.solid !== false && !(powered && target.pierceable !== false)) solid.push(...list);
    if (!contact(ball, list, SKIN)) continue;
    touching.add(id);
    if (!held.has(id) && contact(ball, list)) { held.add(id); hits.push(target); }
  }
  for (const id of held) if (!touching.has(id)) held.delete(id);

  // A normal final-HP hit rebounds just like an ordinary grid brick.
  let resolved = false;
  for (let pass = 0; pass < 4 && solid.length; pass++) {
    const c = contact(ball, solid);
    if (!c) break;
    resolved = true;
    ball.x += c.nx * (c.depth + PROBE); ball.y += c.ny * (c.depth + PROBE);
    const vx = c.target.vx || 0, vy = c.target.vy || 0, vn = (ball.vx - vx) * c.nx + (ball.vy - vy) * c.ny;
    if (vn < 0) {
      const speed = Math.hypot(ball.vx, ball.vy);
      ball.vx -= 2 * vn * c.nx; ball.vy -= 2 * vn * c.ny;
      // Moving toys change direction, not the established arcade speed ramp.
      const next = Math.hypot(ball.vx, ball.vy);
      if (next > EPS) { ball.vx *= speed / next; ball.vy *= speed / next; }
    }
  }
  for (const target of hits) {
    if (ball.dead || !live(target)) continue;
    if (onTarget?.(target.id, ball, target) === false) target.active = false;
  }
  return hits.length > 0 || resolved;
}

function rayCircle(x, y, dx, dy, cx, cy, r) {
  const a = dx * dx + dy * dy, ox = x - cx, oy = y - cy, c = ox * ox + oy * oy - r * r;
  if (c <= 0) return 0;
  if (a < EPS) return null;
  const b = 2 * (ox * dx + oy * dy), disc = b * b - 4 * a * c;
  if (disc < 0) return null;
  const t = (-b - Math.sqrt(disc)) / (2 * a);
  return t >= -EPS && t <= 1 + EPS ? Math.max(0, Math.min(1, t)) : null;
}

// Pure swept query for lasers: fraction t in [0,1], or null. No damage/contact state.
export function sweepTarget(from, to, radius, target, time = 0, duration = 0) {
  if (!live(target)) return null;
  const initial = contact({ ...from, r: radius }, entries(target, time));
  if (initial) return { t: 0, x: from.x, y: from.y, nx: initial.nx, ny: initial.ny };
  const vx = target.vx || 0, vy = target.vy || 0;
  const x = from.x - vx * time, y = from.y - vy * time;
  const dx = to.x - from.x - vx * duration, dy = to.y - from.y - vy * duration;
  const candidates = [];
  for (const s of shapes(target)) {
    if (s.type === 'circle') {
      const t = rayCircle(x, y, dx, dy, s.x, s.y, s.r + radius); if (t !== null) candidates.push(t);
    } else edges(s, (ax, ay, bx, by, nx, ny) => {
      for (const [cx, cy] of [[ax, ay], [bx, by]]) { const t = rayCircle(x, y, dx, dy, cx, cy, radius); if (t !== null) candidates.push(t); }
      const dv = dx * nx + dy * ny;
      if (Math.abs(dv) < EPS) return;
      const dist = (x - ax) * nx + (y - ay) * ny, ex = bx - ax, ey = by - ay, len2 = ex * ex + ey * ey;
      for (const side of [-1, 1]) {
        const t = (side * radius - dist) / dv;
        if (t < -EPS || t > 1 + EPS) continue;
        const u = ((x + dx * t - ax) * ex + (y + dy * t - ay) * ey) / len2;
        if (u >= -EPS && u <= 1 + EPS) candidates.push(Math.max(0, Math.min(1, t)));
      }
    });
  }
  candidates.sort((a, b) => a - b);
  for (const t of candidates) {
    const point = { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t, r: radius + PROBE };
    const c = contact(point, entries(target, time + duration * t));
    if (c) return { t, x: point.x, y: point.y, nx: c.nx, ny: c.ny };
  }
  return null;
}
