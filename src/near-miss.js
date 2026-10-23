// "So close" copy for the loss / continue panel. Every chapter's level has a nearMiss() hook that returns
// { line, progress, stage? }: line names what is left in words, progress is how far the run got (0..1), and the
// optional stage is ['FLOOR' | 'WAVE', n, of]. soClose() turns that into the panel's title, line and detail.
export const plural = (n, one, many = one + 'S') => `${n} ${n === 1 ? one : many}`;
// A villain on a lost run always has at least 1 HP left (at 0 the chapter is already won).
export const hpLeft = (name, hp) => `${name} HAS ${Math.max(1, Math.ceil(hp))} HP LEFT`;
export const clamp01 = v => Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0));
export const CLOSE_AT = .5; // from here on the panel says SO CLOSE!
export const FUSE_SECS = 8;  // the continue panel's fuse

// Soft timeout: the fuse drains over FUSE_SECS (heat 0..1 over its last 2 s) and then stays spent. Nothing here, or in
// the panel, declines the offer on its own: only the player's No thanks does.
export function fuse(t) {
  const left = Math.max(0, FUSE_SECS - (t > 0 ? t : 0)); // NaN or negative: a fresh fuse
  return { left, frac: left / FUSE_SECS, heat: left < 2 ? (2 - left) / 2 : 0, spent: left <= 0 };
}

export function soClose(level) {
  let n = null;
  try { n = level?.nearMiss?.() || null; } catch { n = null; } // copy must never break the loss screen
  if (!n?.line) return { title: 'CONTINUE?', line: '', detail: '', progress: 0 };
  const progress = clamp01(n.progress), pct = Math.min(99, Math.floor(progress * 100)); // never 100% on a loss
  const stage = n.stage ? `${n.stage[0]} ${n.stage[1]} / ${n.stage[2]} · ` : '';
  return { title: progress >= CLOSE_AT ? 'SO CLOSE!' : 'CONTINUE?', line: String(n.line).toUpperCase(), detail: `${stage}${pct}% CLEARED`, progress };
}
