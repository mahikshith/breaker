// Presentation after the committed second strike; no live snake or princess state is changed.
export const SERPENT_CAPTURE = Object.freeze({ caughtAt: 1.22, wrappedAt: 2.55, laughAt: 2.65, endAt: 4.2 });

const clamp = x => Math.max(0, Math.min(1, x));
const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const mix = (a, b, t) => a + (b - a) * t;
const copy = p => ({ x: p.x, y: p.y });
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function measure(points) {
  const arc = [0];
  for (let i = 1; i < points.length; i++) arc.push(arc[i - 1] + distance(points[i - 1], points[i]));
  return { points, arc, length: arc.at(-1) };
}

function at(path, s) {
  s = Math.max(0, Math.min(path.length, s));
  let i = 1;
  while (i < path.arc.length - 1 && path.arc[i] < s) i++;
  const a = path.points[i - 1], b = path.points[i], d = path.arc[i] - path.arc[i - 1];
  const t = d ? (s - path.arc[i - 1]) / d : 0;
  return { x: mix(a.x, b.x, t), y: mix(a.y, b.y, t) };
}

function portion(path, lo, hi) {
  if (hi <= lo) return [];
  const points = [at(path, hi)];
  for (let i = path.points.length - 2; i > 0; i--) {
    if (path.arc[i] > lo && path.arc[i] < hi) points.push(copy(path.points[i]));
  }
  points.push(at(path, lo));
  return points;
}

// Same eight-sample Catmull path and final tail extension as Vault.drawSnakeBody.
function ribbon(points) {
  const p = points.map(copy), last = p.at(-1), prev = p.at(-2), out = [];
  p.push({ x: last.x + (last.x - prev.x) * .6, y: last.y + (last.y - prev.y) * .6 });
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[Math.max(0, i - 1)], b = p[i], c = p[i + 1], d = p[Math.min(p.length - 1, i + 2)];
    for (let j = 0; j < 8; j++) {
      const t = j / 8, t2 = t * t, t3 = t2 * t;
      out.push({
        x: .5 * (2 * b.x + (-a.x + c.x) * t + (2 * a.x - 5 * b.x + 4 * c.x - d.x) * t2 + (-a.x + 3 * b.x - 3 * c.x + d.x) * t3),
        y: .5 * (2 * b.y + (-a.y + c.y) * t + (2 * a.y - 5 * b.y + 4 * c.y - d.y) * t2 + (-a.y + 3 * b.y - 3 * c.y + d.y) * t3)
      });
    }
  }
  out.push(p.at(-1));
  return measure(out);
}

function addCurve(points, a, b, c, d) {
  const steps = Math.max(12, Math.ceil((distance(a, b) + distance(b, c) + distance(c, d)) / 1.5));
  for (let i = 1; i <= steps; i++) {
    const t = i / steps, u = 1 - t;
    points.push({ x: u ** 3 * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t ** 3 * d.x,
      y: u ** 3 * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t ** 3 * d.y });
  }
}

/** Call once with the full pre-capture snakePoints, at the committed 1.22s strike. */
export function createSerpentCapture({ points, x, feet, side = 1, rotation = 0, centerX = x }) {
  if (points.length < 2 || !points.every(p => Number.isFinite(p.x) && Number.isFinite(p.y))) throw new Error('Capture needs a finite body path');
  side = side < 0 ? -1 : 1;
  const source = ribbon(points), head = source.points[0], before = source.points[1];
  const coilY = feet - 23, rx = 21, ry = 10.5, route = [copy(head)];
  const entry = { x: centerX - side * rx, y: coilY }, len = distance(head, before) || 1;
  addCurve(route, head,
    { x: head.x + (head.x - before.x) / len * 10, y: head.y + (head.y - before.y) / len * 10 },
    { x: entry.x, y: entry.y + 12 }, entry);
  let frontStart = 0;
  for (let i = 1; i <= 96; i++) {
    const theta = Math.PI + Math.PI * 2 * i / 96;
    route.push({ x: centerX + side * rx * Math.cos(theta), y: coilY + ry * Math.sin(theta) });
    if (i === 48) frontStart = route.length - 1;
  }
  const frontEnd = route.length - 1, end = { x: centerX - side * 35, y: feet - 38 };
  const neckAnchor = { x: end.x - side * 18, y: end.y + 6 };
  addCurve(route, route.at(-1), { x: centerX - side * rx, y: coilY - 12 },
    { x: neckAnchor.x, y: neckAnchor.y + 8 }, neckAnchor);
  addCurve(route, neckAnchor, { x: neckAnchor.x, y: neckAnchor.y - 4 },
    { x: end.x - side * 6, y: end.y + 2 }, end);
  const travel = measure(route), base = side < 0 ? Math.PI : 0, angles = [];
  let previous = base + rotation;
  for (let i = 0; i < route.length - 1; i++) {
    const a = route[i], b = route[i + 1], raw = Math.atan2(b.y - a.y, b.x - a.x);
    previous += Math.atan2(Math.sin(raw - previous), Math.cos(raw - previous));
    angles.push(previous);
  }
  return { source, travel, angles, x, feet, side, rotation, centerX, coilY, rx, ry, neckAnchor,
    frontRange: [travel.arc[frontStart], travel.arc[frontEnd]] };
}

/** Pure sample. points already include the smoothed tail: do not Catmull/extend them again. */
export function sampleSerpentCapture(capture, attackTime) {
  const c = capture, time = Math.max(SERPENT_CAPTURE.caughtAt, attackTime);
  const turn = ease((time - SERPENT_CAPTURE.caughtAt) / (SERPENT_CAPTURE.wrappedAt - SERPENT_CAPTURE.caughtAt));
  const travelled = c.travel.length * turn, remaining = c.source.length - travelled;
  let points = portion(c.travel, Math.max(0, travelled - c.source.length), travelled);
  if (remaining > 0) {
    const tail = portion(c.source, 0, Math.min(c.source.length, remaining)).reverse();
    points = points.length ? points.concat(tail.slice(1)) : tail;
  }
  // The complete original ribbon is retained at the handover, not just its first three cells.
  if (!turn) points = c.source.points.map(copy);
  const lo = Math.max(0, travelled - c.source.length, c.frontRange[0]), hi = Math.min(travelled, c.frontRange[1]);
  const frontPaths = hi > lo ? [portion(c.travel, lo, hi)] : [];
  let i = 0;
  while (i < c.travel.arc.length - 2 && c.travel.arc[i + 1] < travelled) i++;
  const tangent = c.angles[i], base = c.side < 0 ? Math.PI : 0;
  const towardLumi = tangent + Math.atan2(Math.sin(base - tangent), Math.cos(base - tangent));
  const headAngle = mix(tangent, towardLumi, ease((time - SERPENT_CAPTURE.wrappedAt) / .25));
  const lift = ease((time - 2.06) / .49), settle = ease((time - 2.45) / .2);
  const laughEnvelope = ease((time - SERPENT_CAPTURE.laughAt) / .15) * (1 - ease((time - 3.97) / .23));
  const x = mix(c.x, c.centerX, ease((time - 1.22) / .42)), feet = c.feet - 8 * lift;
  const look = ease((time - SERPENT_CAPTURE.caughtAt) / .12);
  const faceBlend = mix(c.side < 0 ? 1 : 0, ease((points[0].x - x + 6) / 12), look);
  // The side-view head yaws toward Lumi; a screen-space loop is not a full roll of the skull.
  const aim = Math.atan2(feet - 32 - points[0].y, Math.max(12, Math.abs(x - points[0].x)));
  const roll = Math.max(-.45, Math.min(.45, aim)) * (1 - 2 * faceBlend);
  const rotation = mix(Math.max(-.5, Math.min(.5, c.rotation)), roll, look);
  return {
    points, frontPaths, head: points[0], headAngle, faceBlend, faceLeft: faceBlend >= .5, facing: faceBlend >= .5 ? 'l' : 'r',
    rotation, side: c.side, turn,
    x, feet,
    scale: 1 - .035 * lift, lift, settle, bodyTilt: c.side * Math.sin(lift * Math.PI) * .07,
    coilY: c.coilY, frontClip: { x: c.centerX - c.rx - 4, y: c.coilY + .15, w: (c.rx + 4) * 2, h: c.ry + 7 },
    laugh: laughEnvelope, travelled, bodyLength: c.source.length, finished: attackTime >= SERPENT_CAPTURE.endAt
  };
}

export { ribbon as serpentRibbon };
