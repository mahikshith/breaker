// Round-3 painted art (src/round3-art.js, packed by tools/pack_round3.py from the M365 sheets in assets/round3/).
// r3(set, key) gives the image with its source size (fw, fh: the unit every scale constant uses); preloadR3() starts
// every decode at art setup so the first frame never draws a missing sprite.
import { loadImg } from '../gfx.js';
import { R3 } from '../round3-art.js';

const IMG = {};
export function r3(set, key) {
  const s = R3?.[set]?.[key];
  if (!s) return null;
  return IMG[set + '/' + key] ??= Object.assign(loadImg(s.url), { fw: s.w, fh: s.h });
}
export const r3ok = img => !!img && img.complete && img.naturalWidth > 0;
export function preloadR3() { for (const set in R3) if (set[0] !== '_') for (const key in R3[set]) r3(set, key); }
// Draw a sprite by its bottom centre (or centre with mid), k game units per source pixel.
export function r3draw(ctx, set, key, x, y, k, { mid = false, alpha = 1, angle = 0, mirror = false } = {}) {
  const img = r3(set, key);
  if (!r3ok(img)) return false;
  const w = img.fw * k, h = img.fh * k;
  ctx.save(); ctx.globalAlpha = (typeof ctx.globalAlpha === "number" ? ctx.globalAlpha : 1) * alpha; ctx.translate(x, y); if (angle) ctx.rotate(angle); if (mirror) ctx.scale(-1, 1);
  ctx.drawImage(img, -w / 2, mid ? -h / 2 : -h, w, h); ctx.restore();
  return true;
}
