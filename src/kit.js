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
  level.kitWasFull = full; level.kitSeenCastAt = cast;
}

export function kitLayout(level) {
  const s = level.kitUIScale || 1, r = 26 / s, x = 64, y = level.drainY + 34 / s;
  return { x, y, r, trackY: y + r + 13 / s, bodyX: x - 4.667 * 0.94, bodyFeet: y + 20.667 * 0.94 };
}

export const kitOrbContains = (orb, x, y) => Math.hypot(x - orb.x, y - orb.y) <= orb.r;

export function kitTap(press, x, y, clientX, clientY, orb) {
  return !press.cancelled && kitOrbContains(orb, press.x, press.y) && kitOrbContains(orb, x, y)
    && Math.hypot(clientX - press.clientX, clientY - press.clientY) <= 8;
}
