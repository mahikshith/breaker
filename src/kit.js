export function kitExpression(level = {}) {
  if (level.state === 'won') return 'Cheer';
  if (level.state === 'lost' || level.t < level.kitShockUntil) return 'Shock';
  if (level.phase === 'escape' || level.phase === 'frenzy') return 'Cheer';
  if (level.paddle?.stun > 0) return 'Hurt';
  if (level.balls?.some(b => !b.dead && b.titan > 0)) return 'Laugh';
  if (level.coreMode === 'ward') {
    if (level.t - level.kitCastAt < 0.65 || level.canUseKitPower?.()) return 'Focus';
    if (level.t - level.kitReactionAt < 0.85) return level.kitWardResult === 'held' ? 'Cheer' : 'Worried';
  }
  const danger = level.danger ?? (level.phase === 'landed' ? 1 : level.phase === 'formation' && level.lowestY ? Math.max(0, 1 - (level.dangerY - level.lowestY()) / 140) : 0);
  if (danger >= 0.7) return 'Worried';
  if (level.aim && !level.aim.serve) return 'Focus';
  if (level.paddle?.charge >= 1 && (level.kitTime ?? level.t) - level.kitBodyAt < 0.9) return 'Grin';
  return level.combo >= 5 ? 'Grin' : 'Idle';
}

export function updateKitPresence(level) {
  const now = level.kitTime ?? level.t, full = level.paddle.charge >= 1, cast = level.kitCastAt ?? -Infinity;
  const newCharge = full && !level.kitWasFull, newCast = cast > (level.kitSeenCastAt ?? -Infinity);
  if (newCharge || (newCast && !(level.kitBodyUntil > now))) {
    level.kitBodyAt = now; level.kitBodyUntil = now + 12;
  }
  if (newCharge) { level.kitFullAt = now; globalThis.navigator?.vibrate?.([25, 70, 25]); }
  level.kitWasFull = full; level.kitSeenCastAt = cast;
}

// Power ready: when the ring fills, the face orb double-beats ("doop doop") with a glow for READY.beatFor seconds,
// then keeps a soft glow until the power is spent, so the player always knows it can be used.
export const READY = Object.freeze({ beatFor: 5, period: .9 });
export function chargePulse(level) {
  if (!(level.paddle?.charge >= 1) || level.kitFullAt == null) return { beat: 0, glow: 0 };
  const age = (level.kitTime ?? level.t) - level.kitFullAt;
  if (age > READY.beatFor) return { beat: 0, glow: .35 };
  const p = age % READY.period, bump = (a, b) => p >= a && p < b ? Math.sin((p - a) / (b - a) * Math.PI) : 0;
  const beat = Math.max(bump(0, .14), .7 * bump(.2, .34));
  return { beat, glow: .55 + .45 * beat };
}
// Call before drawing the orb; returns the scale to draw the orb at (it swells on each beat).
export function drawChargeReady(g, level, orb) {
  const { beat, glow } = chargePulse(level);
  if (!glow) return 1;
  const s = level.kitUIScale || 1;
  g.save(); g.globalCompositeOperation = 'lighter';
  const halo = g.createRadialGradient(orb.x, orb.y, orb.r * .7, orb.x, orb.y, orb.r * (1.6 + .3 * beat));
  halo.addColorStop(0, `rgba(255,190,225,${.5 * glow})`); halo.addColorStop(1, 'rgba(255,150,200,0)');
  g.fillStyle = halo; g.beginPath(); g.arc(orb.x, orb.y, orb.r * 1.9, 0, Math.PI * 2); g.fill();
  if (beat > 0) {
    g.strokeStyle = `rgba(255,228,242,${.85 * beat})`; g.lineWidth = 2 / s;
    g.beginPath(); g.arc(orb.x, orb.y, orb.r + (4 + 10 * (1 - beat)) / s, 0, Math.PI * 2); g.stroke();
  }
  g.restore();
  return 1 + .08 * beat;
}

export function kitLayout(level) {
  const s = level.kitUIScale || 1;
  return { x: 38 / s, y: level.H - 30 / s, r: 26 / s };
}

export const kitOrbContains = (orb, x, y) => Math.hypot(x - orb.x, y - orb.y) <= orb.r;

export function kitTap(press, x, y, clientX, clientY, orb) {
  return !press.cancelled && kitOrbContains(orb, press.x, press.y) && kitOrbContains(orb, x, y)
    && Math.hypot(clientX - press.clientX, clientY - press.clientY) <= 8;
}
