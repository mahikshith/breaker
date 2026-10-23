// Round-3 castle specials: the painted bricks and effects (rules in src/castle-specials.js). Sprites come from r3('bricks', key)
// and r3('fx', 'ice_n'); every draw returns quietly until the sprite has decoded, so the level keeps drawing its plain brick.
import { r3, r3ok } from './fantasy/r3.js';
import { cached } from './gfx.js';
import { BLAST_LIFE } from './castle-specials.js';

const SPRITE = { armour: ['castle_armour', 'castle_armour_cracked'], chest: ['castle_chest', 'castle_chest_cracked'], mine: ['castle_mine'], coin: ['castle_coin'] };
const alpha = g => typeof g.globalAlpha === 'number' ? g.globalAlpha : 1;
const now = () => (typeof performance !== 'undefined' ? performance.now() : 0) / 1000;

// The sprite a special brick wears (the cracked one once armour or a chest has taken a hit), or null until it decodes.
export function specialSprite(b) {
  const set = b.sp && SPRITE[b.sp]; if (!set) return null;
  const s = r3('bricks', set[b.hp < b.maxHP && set[1] ? 1 : 0]);
  return r3ok(s) ? s : null;
}
function glint(g, x, y, r, a) {
  g.save(); g.globalAlpha = alpha(g) * a; g.translate(x, y); g.fillStyle = '#fff6cf';
  g.beginPath(); g.moveTo(0, -r); g.lineTo(r * .22, -r * .22); g.lineTo(r, 0); g.lineTo(r * .22, r * .22); g.lineTo(0, r); g.lineTo(-r * .22, r * .22); g.lineTo(-r, 0); g.lineTo(-r * .22, -r * .22); g.closePath(); g.fill(); g.restore();
}
// A mine breathes a warm glow and a coin throws a slow glint across its face (nothing for the other specials).
export function specialShine(g, b, t = now(), x = b.x, y = b.y) {
  const cx = x + b.w / 2, cy = y + b.h / 2;
  if (b.sp === 'mine') {
    const a = .3 + .25 * Math.sin(t * 6 + b.x * .7), gr = g.createRadialGradient(cx, cy, 0, cx, cy, b.w * .42);
    gr.addColorStop(0, `rgba(255,150,50,${a})`); gr.addColorStop(1, 'rgba(255,150,50,0)'); g.fillStyle = gr; g.fillRect(x, y - 2, b.w, b.h + 4);
  } else if (b.sp === 'coin') {
    const k = (t * .55 + b.x * .013 + b.y * .007) % 1; if (k < .3) glint(g, x + b.w * (.2 + k * 2.2), y + b.h * .3, 2.6, Math.sin(k / .3 * Math.PI));
  }
}
// Draw a special brick on its rect (x, y default to the brick's own; the sprite sits one unit proud, with a soft shadow).
// Returns false when the sprite is not ready (draw the plain brick).
export function drawSpecial(g, b, t = now(), x = b.x, y = b.y) {
  const sp = specialSprite(b); if (!sp) return false;
  g.save(); g.shadowColor = '#000000a0'; g.shadowBlur = 4; g.shadowOffsetY = 2; g.drawImage(sp, x - 1, y - 1, b.w + 2, b.h + 2); g.restore();
  specialShine(g, b, t, x, y);
  return true;
}
// The painted ice shatter, tinted ember-orange for a mine (6 frames over `life`); k is game units per source pixel.
export function drawBlast(g, x, y, age, life = BLAST_LIFE, k = .7) {
  const q = age / life; if (q < 0 || q >= 1) return;
  const i = Math.min(5, Math.floor(q * 6)), img = r3('fx', 'ice_' + i); if (!r3ok(img)) return;
  const w = img.fw * k, h = img.fh * k;
  const tint = cached(`castle-blast-${i}-${k}`, w, h, c => { c.drawImage(img, 0, 0, w, h); c.globalCompositeOperation = 'source-atop'; c.fillStyle = 'rgba(255,128,32,.55)'; c.fillRect(0, 0, w, h); });
  g.save(); g.globalAlpha = alpha(g) * (1 - q * q * .6); g.drawImage(tint, x - w / 2, y - h * .6, w, h); g.restore();
}
// A coin brick's pop: three small glints drifting up and fading.
export function drawCoinPop(g, x, y, age, life = .7) {
  const q = age / life; if (q < 0 || q >= 1) return;
  g.save(); for (let i = 0; i < 3; i++) glint(g, x + (i - 1) * 9, y - 6 - q * (14 + i * 5), 3.4 - i * .5, Math.sin(Math.min(1, q * 1.2) * Math.PI)); g.restore();
}
// The fantasy models' effect list, drawn over the encounter in model space.
export function drawCastleFx(g, effects) {
  for (const e of effects) { if (e.kind === 'mine-blast') drawBlast(g, e.x, e.y, e.age, e.life); else if (e.kind === 'coin-pop') drawCoinPop(g, e.x, e.y, e.age, e.life); }
}
