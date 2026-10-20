import { serpentRibbon } from './serpent-capture.js';

const copy = p => ({ x: p.x, y: p.y });
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const ease = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
const mix = (a, b, t) => a + (b - a) * t;

function measure(points) {
  const arc = [0];
  for (let i = 1; i < points.length; i++) arc.push(arc[i - 1] + distance(points[i - 1], points[i]));
  return { points, arc, length: arc.at(-1) };
}

function at(path, s) {
  s = Math.max(0, Math.min(path.length, s));
  let i = 1;
  while (i < path.arc.length - 1 && path.arc[i] < s) i++;
  const d = path.arc[i] - path.arc[i - 1], t = d ? (s - path.arc[i - 1]) / d : 0;
  return { x: mix(path.points[i - 1].x, path.points[i].x, t), y: mix(path.points[i - 1].y, path.points[i].y, t) };
}

function push(points, p) {
  if (!points.length || distance(points.at(-1), p) > 1e-7) points.push(copy(p));
}

function line(points, end) {
  const start = points.at(-1), n = Math.max(1, Math.ceil(distance(start, end) / 2));
  for (let i = 1; i <= n; i++) push(points, { x: mix(start.x, end.x, i / n), y: mix(start.y, end.y, i / n) });
}

function curve(points, a, b, c, d) {
  const n = Math.max(12, Math.ceil((distance(a, b) + distance(b, c) + distance(c, d)) / 1.5));
  for (let i = 1; i <= n; i++) {
    const t = i / n, u = 1 - t;
    push(points, { x: u ** 3 * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t ** 3 * d.x,
      y: u ** 3 * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t ** 3 * d.y });
  }
}

// Round only inside a three-unit neighbourhood of the already travelled corridor.
function roundCorridor(points) {
  const out = [copy(points[0])];
  for (let i = 1; i < points.length - 1; i++) {
    const a = points[i - 1], b = points[i], c = points[i + 1], ab = distance(a, b), bc = distance(b, c);
    if (ab < 1e-7 || bc < 1e-7) continue;
    const cut = Math.min(3, ab / 3, bc / 3);
    const start = { x: b.x + (a.x - b.x) * cut / ab, y: b.y + (a.y - b.y) * cut / ab };
    const end = { x: b.x + (c.x - b.x) * cut / bc, y: b.y + (c.y - b.y) * cut / bc };
    line(out, start);
    const n = Math.max(2, Math.ceil(cut * 2));
    for (let j = 1; j <= n; j++) {
      const t = j / n, u = 1 - t;
      push(out, { x: u * u * start.x + 2 * u * t * b.x + t * t * end.x,
        y: u * u * start.y + 2 * u * t * b.y + t * t * end.y });
    }
  }
  line(out, points.at(-1));
  return out;
}

function toMouth(points, tunnel) {
  const out = [copy(points[0])];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i];
    if (a.y >= tunnel.y && b.y <= tunnel.y && b.y < a.y) {
      const t = (tunnel.y - a.y) / (b.y - a.y), x = mix(a.x, b.x, t);
      if (Math.abs(x - tunnel.x) <= 15) { push(out, { x, y: tunnel.y }); return out; }
    }
    push(out, b);
    if (b.y < tunnel.y && Math.abs(b.x - tunnel.x) <= 15) return out;
  }
  throw new Error('Retreat body/history does not reach the original tunnel');
}

/** History uses Vault's oldest-to-newest order, converted to world coordinates. */
export function createSerpentRetreat({ points, history = [], heading, faceLeft, tunnel = { x: 284, y: 88 }, duration = 4, turnSide = 1 }) {
  if (points.length < 2 || !points.concat(history).every(p => Number.isFinite(p.x) && Number.isFinite(p.y))) throw new Error('Retreat needs a finite body/history');
  const source = serpentRibbon(points), head = source.points[0];
  heading ??= Math.atan2(head.y - source.points[1].y, head.x - source.points[1].x);
  faceLeft ??= Math.cos(heading) < 0;
  const f = { x: Math.cos(heading), y: Math.sin(heading) }, side = turnSide < 0 ? -1 : 1;
  const n = { x: -f.y * side, y: f.x * side }, route = [copy(head)], radius = 6;
  for (let i = 1; i <= 36; i++) {
    const theta = Math.PI * i / 36;
    push(route, { x: head.x + f.x * radius * Math.sin(theta) + n.x * radius * (1 - Math.cos(theta)),
      y: head.y + f.y * radius * Math.sin(theta) + n.y * radius * (1 - Math.cos(theta)) });
  }
  const joinS = Math.min(24, source.length * .2), join = at(source, joinS), next = at(source, Math.min(source.length, joinS + 2));
  const d = distance(join, next) || 1, back = { x: (next.x - join.x) / d, y: (next.y - join.y) / d };
  const last = route.at(-1);
  curve(route, last, { x: last.x - f.x * 8, y: last.y - f.y * 8 },
    { x: join.x - back.x * 6, y: join.y - back.y * 6 }, join);
  const turnLength = measure(route).length, corridor = [join];
  for (let i = 1; i < source.points.length; i++) if (source.arc[i] > joinS) push(corridor, source.points[i]);
  for (const p of history.slice().reverse()) push(corridor, p);
  const clear = roundCorridor(toMouth(corridor, tunnel));
  for (const p of clear.slice(1)) push(route, p);
  const mouthDistance = measure(route).length;
  line(route, { x: tunnel.x, y: tunnel.y - 16 });
  line(route, { x: tunnel.x, y: tunnel.y - source.length - 48 });
  const travel = measure(route), angles = [heading];
  for (let i = 1; i < route.length; i++) {
    const a = route[i - 1], b = route[Math.min(route.length - 1, i + 1)];
    const raw = Math.atan2(b.y - a.y, b.x - a.x), previous = angles.at(-1);
    angles.push(previous + Math.atan2(Math.sin(raw - previous), Math.cos(raw - previous)));
  }
  const faces = [faceLeft ? 1 : 0];
  let goal = faces[0], from = goal, changedAt = 0;
  for (let i = 1; i < route.length; i++) {
    const s = travel.arc[i], cosine = Math.cos(angles[i]);
    const desired = cosine > .1 ? 0 : cosine < -.1 ? 1 : goal;
    let current = mix(from, goal, ease((s - changedAt) / 6));
    if (desired !== goal) { from = current; goal = desired; changedAt = s; }
    current = mix(from, goal, ease((s - changedAt) / 6));
    faces.push(current);
  }
  duration = Math.max(4, Math.min(5, Math.max(duration, travel.length / (.9 * 180))));
  return { source, travel, angles, faces, heading, faceLeft, tunnel: copy(tunnel), duration, turnLength, mouthDistance,
    peakSpeed: travel.length / (.9 * duration) };
}

function progress(t) {
  if (t < .1) return t * t / .18;
  if (t > .9) return 1 - (1 - t) ** 2 / .18;
  return (t - .05) / .9;
}

/** Pure, already-smoothed head-first ribbon; keep alpha one and let the real tunnel occlude it. */
export function sampleSerpentRetreat(retreat, elapsed) {
  const r = retreat, t = Math.max(0, Math.min(1, elapsed / r.duration)), travelled = r.travel.length * progress(t);
  const lo = Math.max(0, travelled - r.source.length), points = [at(r.travel, travelled)];
  for (let i = r.travel.points.length - 2; i > 0; i--) if (r.travel.arc[i] < travelled && r.travel.arc[i] > lo) push(points, r.travel.points[i]);
  if (travelled > 0) push(points, at(r.travel, lo));
  if (travelled < r.source.length) {
    const tail = r.source.length - travelled;
    for (let i = 1; i < r.source.points.length; i++) if (r.source.arc[i] < tail) push(points, r.source.points[i]);
    push(points, at(r.source, tail));
  }
  if (!travelled) points.splice(0, points.length, ...r.source.points.map(copy));
  let i = 0;
  while (i < r.travel.arc.length - 2 && r.travel.arc[i + 1] < travelled) i++;
  const span = r.travel.arc[i + 1] - r.travel.arc[i], f = span ? (travelled - r.travel.arc[i]) / span : 0;
  const heading = mix(r.angles[i], r.angles[i + 1], f), cosine = Math.cos(heading), sine = Math.sin(heading);
  const faceBlend = mix(r.faces[i], r.faces[i + 1], f);
  const rightRotation = Math.atan2(sine, cosine), leftRotation = Math.atan2(-sine, -cosine);
  return { points, head: points[0], heading, headAngle: heading, faceBlend, faceLeft: faceBlend >= .5,
    facing: faceBlend >= .5 ? 'l' : 'r', rightRotation, leftRotation,
    rotation: faceBlend >= .5 ? leftRotation : rightRotation, alpha: 1, travelled,
    bodyLength: r.source.length, duration: r.duration, done: elapsed >= r.duration,
    insideTunnel: points.every(p => p.y < r.tunnel.y - 12) };
}
