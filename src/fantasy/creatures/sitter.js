import { ejectBall } from '../../clearance.js';

// The "big sitter" boss archetype: a large creature that stays on one spot (its pivot) and fights with telegraphed moves.
// Built once, reused by skin: a new sitter is a skin descriptor plus numbers, never new physics.
//
// Skin descriptor (plain data; see src/fantasy/creatures/ember.js for the first one):
//   name      display name
//   pivot     [x, y] model point every pose is anchored on (each pose sprite's own `anchor` lands here)
//   scale     drawn and collision scale (1 = the manifest's units)
//   solid     false: scenery (no collider at all); true: the current pose's circles are solid
//   rest      pose shown when nothing else applies (a game can pass its own resting pose per moment)
//   poses     { pose: { art: [preferred sprite keys..., fallback], circles: [[dx, dy, r], ...] } } in skin units from the pivot
//   attacks   { attack kind: pose shown while that attack lands }
//   tellPose  pose shown during every wind-up
//   moods     [[mood, pose, seconds], ...] in priority order: a mood felt within `seconds` shows that pose
//   numbers   { easy|medium|hard: { tell, release, calm, hp? } } seconds (and HP, for a sitter that can be beaten)
//
// The state machine: idle -> windup (tell seconds) -> release (release seconds) -> idle. hush() cancels a wind-up and
// calms the sitter for `calm` seconds. Pose swaps on a solid skin push any ball the new pose lands on out of it
// (src/clearance.js), so a change of art can never trap a ball.
export class Sitter {
  constructor(skin, difficulty = 'medium') {
    this.skin = skin; this.n = skin.numbers[difficulty] || skin.numbers.medium;
    this.hp = this.n.hp ?? null; this.maxHP = this.hp;
    this.stage = 'idle'; this.kind = ''; this.at = 0; this.until = 0; this.teaching = false; this.calm = -Infinity; this.payload = {};
    this.moods = {}; this.pose = skin.rest; this.ejections = 0;
  }
  get busy() { return this.stage !== 'idle'; }
  // Start a telegraphed move. payload carries the game's own aim (a stripe, a row...) for the release and the renderer.
  windup(kind, now, payload = {}, teaching = false) {
    this.stage = 'windup'; this.kind = kind; this.at = now; this.until = now + this.n.tell; this.payload = payload; this.teaching = teaching;
  }
  // Advance the state machine to `now`. Returns 'release' on the frame the move lands and 'settle' when it is over.
  tick(now) {
    if (this.stage === 'windup' && now >= this.until) { this.stage = 'release'; this.at = now; this.until = now + this.n.release; return 'release'; }
    if (this.stage === 'release' && now >= this.until) { this.reset(); return 'settle'; }
    return null;
  }
  // 0..1 through the current stage (the renderer's heat, lean and tell strength).
  progress(now) { return this.stage === 'idle' ? 0 : Math.max(0, Math.min(1, (now - this.at) / Math.max(1e-6, this.until - this.at))); }
  reset() { this.stage = 'idle'; this.kind = ''; this.payload = {}; this.teaching = false; }
  // A lullaby: calm for `calm` seconds; a wind-up in progress fizzles. True when it cancelled one.
  hush(now) { this.calm = now + this.n.calm; if (this.stage !== 'windup') return false; this.reset(); return true; }
  calmAt(now) { return now < this.calm; }
  feel(mood, t) { this.moods[mood] = t; }
  hurt(n = 1) { if (this.hp === null) return 0; const d = Math.min(this.hp, n); this.hp -= d; return d; }
  // Which pose shows: the game's override, then the move under way, then the most urgent recent mood, then rest.
  choose({ t, override = null, rest = this.skin.rest } = {}) {
    if (override) return override;
    if (this.stage === 'windup') return this.skin.tellPose;
    if (this.stage === 'release') return this.skin.attacks[this.kind] || this.skin.tellPose;
    for (const [mood, pose, secs] of this.skin.moods) if (t - (this.moods[mood] ?? -Infinity) < secs) return pose;
    return rest;
  }
  // The pose's collision circles in model units (none for scenery).
  shapes(pose = this.pose) {
    if (!this.skin.solid) return [];
    const [px, py] = this.skin.pivot, k = this.skin.scale ?? 1;
    return (this.skin.poses[pose]?.circles || []).map(([dx, dy, r]) => ({ type: 'circle', x: px + dx * k, y: py + dy * k, r: r * k }));
  }
  // Swap to a pose; on a solid skin, push out any ball the new silhouette lands on. Returns how many balls moved.
  setPose(pose, balls = [], ok) {
    if (!this.skin.poses[pose] || pose === this.pose) return 0;
    this.pose = pose; let moved = 0;
    const shapes = this.shapes(pose);
    if (shapes.length) for (const b of balls) if (!b.dead && !b.caught && ejectBall(b, shapes, { ok })) moved++;
    this.ejections += moved; return moved;
  }
}

// Build a sitter skin from manifest data (poses with art keys and measured circles) plus the creature's own numbers.
export function sitterSkin(art, rules) {
  const poses = {};
  for (const [pose, p] of Object.entries(art.poses)) poses[pose] = { art: p.art, circles: p.circles || [] };
  return { ...rules, poses, solid: rules.solid ?? !!art.solid };
}
