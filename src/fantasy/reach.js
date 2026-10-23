// Steel-chamber fairness check (design/phase2/stages-v2.md section 5). Traces the ball's centre from the paddle across the
// aim cone, reflecting off the field walls and the unbreakable bars (each grown by the ball radius), and reports which
// launches enter a chamber within the allowed bounces. Breakable bricks are ignored: they go, the steel stays.

// Ray against an axis-aligned box: the entry distance and the face normal, or null.
function hitBox(x, y, dx, dy, b) {
  let t0 = -Infinity, t1 = Infinity, nx = 0, ny = 0;
  for (const [p, d, lo, hi, ax] of [[x, dx, b.x, b.x + b.w, 1], [y, dy, b.y, b.y + b.h, 0]]) {
    if (Math.abs(d) < 1e-12) { if (p <= lo || p >= hi) return null; continue; }
    let a = (lo - p) / d, c = (hi - p) / d, n = -Math.sign(d);
    if (a > c) [a, c] = [c, a];
    if (a > t0) { t0 = a; nx = ax ? n : 0; ny = ax ? 0 : n; }
    t1 = Math.min(t1, c);
  }
  return t0 > 1e-6 && t0 < t1 ? { t: t0, nx, ny } : null;
}

const inside = (x, y, b) => x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h;

// field: {left, right, top}; bars and chamber: {x, y, w, h}; from: launch points [{x, y}]. A chamber is entered when the
// path crosses into its box. Returns every launch [x, angle in degrees from straight up] that enters, and the widest
// contiguous run of angles (degrees) at any one launch point.
export function chamberReach({ field, bars, chamber, from, r = 6, cone = 60, step = .25, bounces = 2, reach = 2000 }) {
  const grown = bars.map(b => ({ x: b.x - r, y: b.y - r, w: b.w + 2 * r, h: b.h + 2 * r }));
  const walls = { left: field.left + r, right: field.right - r, top: field.top + r };
  const hits = [];
  let span = 0;
  for (const p of from) {
    let run = 0;
    for (let a = -cone; a <= cone + 1e-9; a += step) {
      const ok = trace(p.x, p.y, Math.sin(a * Math.PI / 180), -Math.cos(a * Math.PI / 180), walls, grown, chamber, bounces, reach);
      if (ok) { hits.push([p.x, a]); run += step; span = Math.max(span, run); } else run = 0;
    }
  }
  return { hits, span, reachable: hits.length > 0 };
}

function trace(x, y, dx, dy, walls, boxes, chamber, bounces, reach) {
  for (let n = 0; n <= bounces && reach > 0; n++) {
    let best = { t: reach, nx: 0, ny: 0 };
    if (dx < 0) best = pick(best, (walls.left - x) / dx, 1, 0);
    if (dx > 0) best = pick(best, (walls.right - x) / dx, -1, 0);
    if (dy < 0) best = pick(best, (walls.top - y) / dy, 0, 1);
    for (const b of boxes) { const h = hitBox(x, y, dx, dy, b); if (h && h.t < best.t) best = h; }
    const into = hitBox(x, y, dx, dy, chamber);
    if (inside(x, y, chamber) || (into && into.t <= best.t)) return true;
    if (best.t >= reach) return false;
    x += dx * best.t; y += dy * best.t; reach -= best.t;
    if (best.nx) dx = -dx; else dy = -dy;
  }
  return false;
}
function pick(best, t, nx, ny) { return t > 1e-6 && t < best.t ? { t, nx, ny } : best; }
