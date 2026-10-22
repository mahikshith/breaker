// Sweet-Spot Ram, shared by every level: three centre-third paddle hits in a row arm the ram; the next centre hit
// launches a giant ball that ploughs through ordinary bricks for RAM.time seconds or RAM.bricks bricks, whichever ends first.
// An off-centre hit resets an unarmed streak; once armed, the ram waits for its centre hit. A level decides what is an
// ordinary brick with ramPierce(brick) (default: type === 'brick'); everything else takes a normal hit and the ram bounces.
export const SPEED = 345;
export const RAM = { r: 13.2, time: 2.5, bricks: 14, damage: 3 };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// Level feedback: castle levels have effect(x, y, kind, life); the Arena routes through ramEffect; Tidewheel keeps a plain list.
function fx(level, x, y, kind, life) {
  if (level.ramEffect) level.ramEffect(kind, x, y, life);
  else if (level.effect) level.effect(x, y, kind, life);
  else level.effects?.push({ kind, x, y, age: 0, life });
}

// The castle return: angle from where the ball meets the paddle, a little rally speed, then the streak.
export function paddleBounce(level, b) {
  const p = level.paddle, offset = clamp((b.x - p.x) / (p.w / 2), -.95, .95);
  const speed = Math.min(SPEED * 1.28, Math.hypot(b.vx, b.vy) * 1.012), a = offset * 1.08;
  b.vx = Math.sin(a) * speed; b.vy = -Math.cos(a) * speed; fx(level, b.x, b.y, 'paddle', .12);
  ramStreak(level, b, offset);
}
// The streak alone, for levels that keep their own bounce. offset is -1..1 across the paddle. True when this hit launched the ram.
// A TITAN/cosmic ball never becomes a ram: an armed paddle simply waits for the next plain ball.
export function ramStreak(level, b, offset) {
  const p = level.paddle, centre = Math.abs(offset) < 1 / 3;
  if (!centre) { if (!p.armed) p.streak = 0; return false; }
  if (p.armed && !(b.ram > 0) && !(b.titan > 0)) { launchRam(level, b); return true; }
  if (!p.armed && (p.streak = (p.streak || 0) + 1) >= 3) { p.armed = true; fx(level, p.x, p.y, 'ram-armed', .6); }
  return false;
}
export function launchRam(level, b) {
  const p = level.paddle; p.armed = false; p.streak = 0;
  b.ramBaseR = b.r; b.ram = RAM.time; b.ramBricks = RAM.bricks; b.y -= RAM.r - b.r; b.r = RAM.r;
  fx(level, b.x, b.y, 'ram-launch', .5);
}
export function endRam(level, b) {
  if (!(b.ram > 0) && b.r !== RAM.r) return;
  b.r = b.ramBaseR || 6; b.ram = 0; b.ramBricks = 0; delete b.ramBaseR;
  fx(level, b.x, b.y, 'ram-end', .3);
}
// Called before a ball's sweep each step; true while the ram is live.
export function tickRam(level, b, dt) { if (b.ram > 0 && (b.ram -= dt) <= 0) endRam(level, b); return b.ram > 0; }
// Is this an ordinary brick the live ram ploughs through?
export function ramPierces(level, b, brick) {
  return b.ram > 0 && !!brick && (level.ramPierce ? !!level.ramPierce(brick) : brick.type === 'brick');
}
// One ploughed brick off the ram's budget.
export function ramCount(level, b) { if (b.ram > 0 && --b.ramBricks <= 0) endRam(level, b); }
// A ram contact with an ordinary brick: break it and keep the flight unchanged. Returns true when the hit was consumed.
// hit() breaks the brick the level's way; the default sets it to its last point and calls level.hitBrick.
export function ramThrough(level, b, brick, hit) {
  if (!ramPierces(level, b, brick)) return false;
  if (hit) hit(); else { brick.hp = 1; level.hitBrick(brick, b); }
  ramCount(level, b);
  return true;
}
