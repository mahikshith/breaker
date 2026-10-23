// The villain's purpose clock (owner direction 2026-10-23): every castle chapter's villain is visibly working toward taking
// Lumi, like the Vault serpent's capture. `p` runs 0..1 over `seconds` of play; at 1 the chapter is lost with the villain's
// own line. Hitting the chapter's right targets pushes it back a little, a power pushes it back hard, and the villain's own
// successes (a bite, a crank, a wake roar) surge it forward. Past PACE.mid the villain attacks at x.85 his interval, past
// PACE.high at x.7, with a red edge vignette and a heartbeat. Pushes and surges are seconds of the clock.
export const PACE = { mid: .5, high: .8, midK: .85, highK: .7 };
export class PurposeClock {
  constructor(seconds) { this.seconds = seconds; this.p = 0; this.pushAt = -Infinity; this.surgeAt = -Infinity; }
  get left() { return Math.max(0, (1 - this.p) * this.seconds); }
  // Interval multiplier for the villain's attacks.
  get pace() { return this.p >= PACE.high ? PACE.highK : this.p >= PACE.mid ? PACE.midK : 1; }
  get danger() { return this.p >= PACE.high; }
  // Returns true once the clock has run out.
  tick(dt) { this.p = Math.min(1, this.p + dt / this.seconds); return this.p >= 1; }
  push(seconds, at = 0) { if (!(seconds > 0)) return 0; const was = this.p; this.p = Math.max(0, this.p - seconds / this.seconds); this.pushAt = at; return was - this.p; }
  surge(seconds, at = 0) { if (!(seconds > 0)) return false; this.p = Math.min(.999, this.p + seconds / this.seconds); this.surgeAt = at; return true; }
  // A Continue gives the player back at least half the clock.
  rewind(to = .5) { this.p = Math.min(this.p, to); }
}
