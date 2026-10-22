import fs from 'node:fs';
import assert from 'node:assert/strict';
import { Bellforge, rampPose, sweepMovingSegment } from '../../../../src/fantasy/bellforge.js';

let seed = 0x20b311;
const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
const gap = (from, to, radius, ramp, t) => {
  const { a, b } = rampPose(ramp, t), x = from.x + (to.x - from.x) * t, y = from.y + (to.y - from.y) * t;
  const dx = b.x - a.x, dy = b.y - a.y;
  const u = Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(x - a.x - u * dx, y - a.y - u * dy) - radius - ramp.thickness / 2;
};
const g = new Bellforge(), misses = [], report = { seed: '0x20b311', scope: 'Deterministic read-only rotating-ramp CCD oracle, actual 1/240 step and .85rad/s angular limit. 3000 near-surface directions at345–5000u/s; 128 reference samples detect meaningful penetration (>.02u), not exact tangency. This is a bounded stress sample, not exhaustive proof.', cases: 3000, referenceContacts: 0, misses };
for (let i = 0; i < report.cases; i++) {
  const original = g.ramps[i % g.ramps.length], angle = -.32 + random() * .75, omega = (random() * 2 - 1) * .85, dt = 1 / 240;
  const r = { ...original, previousAngle: angle, angle: angle + omega * dt }, pose = rampPose(r, 0);
  const u = random(), x = pose.a.x + (pose.b.x - pose.a.x) * u, y = pose.a.y + (pose.b.y - pose.a.y) * u;
  const offset = (random() * 2 - 1) * 16, direction = random() * Math.PI * 2, speed = 345 + random() * 4655;
  const from = { x: x - Math.sin(angle) * offset, y: y + Math.cos(angle) * offset };
  const to = { x: from.x + Math.cos(direction) * speed * dt, y: from.y + Math.sin(direction) * speed * dt };
  let minimum = Infinity;
  for (let j = 0; j <= 128; j++) minimum = Math.min(minimum, gap(from, to, 6, r, j / 128));
  if (minimum < -.02) {
    report.referenceContacts++;
    if (!sweepMovingSegment(from, to, 6, r, dt)) misses.push({ i, from, to, r, minimum });
  }
}
const out = process.env.OUT_DIR || 'out/physics-recheck/bellforge/ccd';
fs.mkdirSync(out, { recursive: true }); fs.writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 2) + '\n');
assert.equal(misses.length, 0, 'reference contact missed by ramp CCD');
console.log(JSON.stringify({ cases: report.cases, contacts: report.referenceContacts, misses: misses.length }));
