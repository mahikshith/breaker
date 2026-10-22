// Sweet-Spot Ram, shared by the castle chapters: three centre-third paddle hits in a row arm the ram; the next centre hit
// launches a giant ball that ploughs through ordinary bricks for RAM.time seconds or RAM.bricks bricks, whichever ends first.
// An off-centre hit resets an unarmed streak; once armed, the ram waits for its centre hit.
export const SPEED = 345;
export const RAM = { r: 13.2, time: 2.5, bricks: 14, damage: 3 };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function paddleBounce(level, b) {
  const p = level.paddle, offset = clamp((b.x - p.x) / (p.w / 2), -.95, .95), centre = Math.abs(offset) < 1 / 3;
  const speed = Math.min(SPEED * 1.28, Math.hypot(b.vx, b.vy) * 1.012), a = offset * 1.08;
  b.vx = Math.sin(a) * speed; b.vy = -Math.cos(a) * speed; level.effect(b.x, b.y, 'paddle', .12);
  if (!centre) { if (!p.armed) p.streak = 0; return; }
  if (p.armed && !(b.ram > 0)) {
    p.armed = false; p.streak = 0; b.ram = RAM.time; b.ramBricks = RAM.bricks; b.y -= RAM.r - b.r; b.r = RAM.r;
    level.effect(b.x, b.y, 'ram-launch', .5); return;
  }
  if (!p.armed && ++p.streak >= 3) { p.armed = true; level.effect(p.x, p.y, 'ram-armed', .6); }
}
export function endRam(level, b) { if (b.r !== 6) { b.r = 6; b.ram = 0; b.ramBricks = 0; level.effect(b.x, b.y, 'ram-end', .3); } }
// Called before a ball's sweep each step; true while the ram is live.
export function tickRam(level, b, dt) { if (b.ram > 0 && (b.ram -= dt) <= 0) endRam(level, b); return b.ram > 0; }
// A ram contact with an ordinary brick: break it and keep the flight unchanged. Returns true when the hit was consumed.
export function ramThrough(level, b, brick) {
  if (!(b.ram > 0) || brick.type !== 'brick') return false;
  brick.hp = 1; level.hitBrick(brick, b);
  if (--b.ramBricks <= 0) endRam(level, b);
  return true;
}
