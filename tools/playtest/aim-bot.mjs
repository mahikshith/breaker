// A shared aiming bot for headless playthroughs, so two chapters can be compared with the same hands.
// It reads the ball like a player: predicts where a falling ball meets the paddle line (folding off the side walls),
// picks a live target (weighted), and offsets the paddle so the bounce heads at it, with a little hand error each catch.
// It sidesteps enemy shots that are about to land. Everything chapter-specific comes in through view().
//
//   const bot = aimBot(rng);  each tick: const x = bot(view)  with
//   view = { balls: [{x, y, vx, vy, r}], paddle: {x, y, w, h}, left, right, targets: [{x, y, w}], threats: [{x, y, vx, vy, r}] }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }

export function aimBot(R, { error = 16, tilt = 1.05 } = {}) {
  let target = null, lastVy = 0, err = 0;
  return function steer(view) {
    const { balls, paddle: p, left, right, targets = [], threats = [] } = view;
    const b = balls.filter(b => b.vy > 0).sort((a, c) => (p.y - a.y) / a.vy - (p.y - c.y) / c.vy)[0] || balls[0];
    let x = p.x;
    if (b) {
      if (b.vy > 0 && lastVy <= 0 || !target) {   // a new descent: choose what to hit and how sloppy this catch is
        const sum = targets.reduce((n, t) => n + t.w, 0); let k = R() * sum;
        target = targets.find(t => (k -= t.w) <= 0) || targets[0] || null; err = (R() - .5) * error;
      }
      lastVy = b.vy;
      if (b.vy > 0) {
        const L = left + b.r, w = right - left - 2 * b.r, fold = x => { const t = ((x - L) % (2 * w) + 2 * w) % (2 * w); return L + (t > w ? 2 * w - t : t); };
        const aim = fold(b.x + b.vx * Math.max(0, (p.y - p.h / 2 - b.r - b.y) / b.vy));
        const ang = target ? Math.atan2(target.x - aim, p.y - target.y) : 0;
        x = aim - clamp(ang / tilt, -.8, .8) * p.w / 2 + err;
      } else x = clamp(b.x, left + 48, right - 48);
    }
    for (const q of threats) {   // sidestep a shot that is about to land
      if (!(q.vy > 0)) continue;
      const eta = (p.y - p.h / 2 - q.r - q.y) / q.vy;
      if (eta > 0 && eta < .45) { const lane = q.x + q.vx * eta, clear = p.w / 2 + q.r + 8; if (Math.abs(x - lane) < clear && !(b && b.vy > 0 && (p.y - b.y) / b.vy < eta + .2)) x = lane + (x < lane ? -clear : clear); }
    }
    return clamp(x, left + p.w / 2, right - p.w / 2);
  };
}
