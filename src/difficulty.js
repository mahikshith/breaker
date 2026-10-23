// powers (Kit's levels): balls/cosmic/maxTime cap the orb powers; fan is the multiball half-spread (radians), fire the
// FIRE capsule's seconds, strong the damage the chapter's "right power" deals its villain per hit (a plain ball deals 1).
const MODES = {
  easy: { id: 'easy', label: 'Easy', companionHits: 24, powers: { balls: 12, cosmic: 2, maxTime: 20, fan: .46, fire: 10, strong: 3 }, spacePowers: { balls: 7, cosmic: 1, maxTime: 12, duration: 8 }, vaultSpeed: .6, carrier: { raiderHP: 2, lockHP: 2, extractSeconds: 8, firstSquad: 6, raidRecovery: 4, hover: 0, waves: 1, waveSeconds: Infinity } },
  medium: { id: 'medium', label: 'Medium', companionHits: 30, powers: { balls: 9, cosmic: 2, maxTime: 18, fan: .44, fire: 9, strong: 3 }, spacePowers: { balls: 6, cosmic: 1, maxTime: 10, duration: 7 }, vaultSpeed: .8, carrier: { raiderHP: 3, lockHP: 3, extractSeconds: 7.5, firstSquad: 5, raidRecovery: 3, hover: 10, waves: 2, waveSeconds: 75 } },
  hard: { id: 'hard', label: 'Hard', companionHits: 36, powers: { balls: 5, cosmic: 1, maxTime: 14, fan: .42, fire: 8, strong: 3 }, spacePowers: { balls: 5, cosmic: 1, maxTime: 8, duration: 6 }, vaultSpeed: 1, carrier: { raiderHP: 4, lockHP: 4, extractSeconds: 8.5, firstSquad: 4, raidRecovery: 2.5, hover: 16, waves: 2, waveSeconds: 75 } },
};
export const DIFFICULTY_IDS = Object.keys(MODES);
export function difficulty(id) { return typeof id === 'string' && Object.hasOwn(MODES, id) ? MODES[id] : MODES.medium; }
