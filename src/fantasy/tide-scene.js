// Tidewheel's living scene, from the round-3 painted parts (assets/round3/tidewheel-parts): flames flicker on the
// backdrop's painted sconces, a pennant waves on the left tower, a painted ripple rides the water line, and each Siege
// stage adds its own set piece: the sluices pour in Floodworks, the great wheel turns behind the bridge in The Wheel,
// and The Refuge gets a storm (rain and far lightning). Everything here is scenery: nothing collides.
import { r3, r3ok, r3draw } from './r3.js';

const P = 'tidewheel-parts';
// The backdrop's sconces in model units: [x, flame base y, size].
const SCONCES = [[31, 163, 1], [340, 152, 1], [323, 176, .8]];
const SLUICES = [[13, 1], [347, -1]];
const rnd = (i, s) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };

export function tideSceneBack(ctx, g) {
  const t = g.time, st = g.siege ? g.stage : -1;
  if (st === 2) wheel(ctx, g, t);
  ctx.save();
  SCONCES.forEach(([x, y, s], i) => {
    const f = Math.floor(t * 11 + i * 2.3) % 6, flick = .8 + .2 * Math.sin(t * 13 + i * 4) * Math.sin(t * 7.3 + i);
    ctx.globalCompositeOperation = 'lighter';
    r3draw(ctx, P, 'glow', x, y + 6 * s, .36 * s * flick, { alpha: .32 });
    ctx.globalCompositeOperation = 'source-over';
    r3draw(ctx, P, 'torch_' + f, x, y + 9 * s, .2 * s);
  });
  r3draw(ctx, P, 'flag_' + (Math.floor(t * 7) % 4), 24, 84, .46, { mirror: true });
  ctx.restore();
}

// The great wheel: the painted wheel turning slowly behind the bridge, dimmed into the night so the bricks read on top.
function wheel(ctx, g, t) {
  const img = r3(P, 'wheel'); if (!r3ok(img)) return;
  const cx = 180, cy = 112, k = .74, w = img.fw * k, h = img.fh * k;
  ctx.save(); ctx.globalAlpha = .62; ctx.translate(cx, cy); ctx.rotate(t * .32);
  ctx.drawImage(img, -w / 2, -h / 2, w, h); ctx.restore();
  ctx.save(); const shade = ctx.createRadialGradient(cx, cy, w * .15, cx, cy, w * .55);
  shade.addColorStop(0, '#06101830'); shade.addColorStop(1, '#06101800'); ctx.fillStyle = shade; ctx.fillRect(cx - w / 2, cy - h / 2, w, h); ctx.restore();
  // Spray where the paddles meet the race under the bridge.
  for (let i = 0; i < 2; i++) { const q = (t * .9 + i * .5) % 1; r3draw(ctx, P, 'spray', cx + (i ? 46 : -46), 214, .34 + .1 * q, { alpha: .45 * (1 - q) }); }
}

// Floodworks: both side grates pour into the flood, the stream stretched to wherever the water stands.
function sluices(ctx, g, t) {
  const top = 226, bottom = g.water.y + 6;   // grates in the side piers just under the bridge deck
  if (bottom - top < 16) return;
  for (const [x, side] of SLUICES) {
    const img = r3(P, 'sluice_' + (Math.floor(t * 10 + (side > 0 ? 0 : 2)) % 5)); if (!r3ok(img)) continue;
    const w = img.fw * .44, gh = img.fh * .44 * .32;   // the grate is the top third of the sprite; the pour stretches
    ctx.save(); ctx.translate(x, 0); if (side < 0) ctx.scale(-1, 1);
    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight * .32, -w / 2, top, w, gh);
    ctx.drawImage(img, 0, img.naturalHeight * .32, img.naturalWidth, img.naturalHeight * .68, -w / 2, top + gh, w, bottom - top - gh);
    ctx.restore();
    r3draw(ctx, P, 'spray', x, bottom + 2, .2 + .04 * Math.sin(t * 9 + x), { alpha: .7 });
  }
}

// Over the water: the Floodworks pours, the painted ripple tiled along the surface, then the Refuge storm.
export function tideSceneFront(ctx, g) {
  if (g.siege && g.stage === 1) sluices(ctx, g, g.time);   // over the bridge piers, so drawn with the water
  const t = g.time, y = g.water.y, img = r3(P, 'ripple_' + (Math.floor(t * 5) % 4));
  if (r3ok(img)) {
    const k = .62, w = img.fw * k, h = img.fh * k, off = (t * 7) % w;
    ctx.save(); ctx.globalAlpha = .5; ctx.beginPath(); ctx.rect(0, y - 3, g.width, h + 6); ctx.clip();
    for (let x = -off; x < g.width; x += w - 1) ctx.drawImage(img, x, y - 4, w, h);
    ctx.restore();
  }
  if (g.siege && g.stage === 3) storm(ctx, g, t);
}
function storm(ctx, g, t) {
  // Far lightning: a cold flash over the sky every few seconds, with a quick double flicker.
  const c = t % 6.5, flash = c < .09 ? 1 : c > .16 && c < .22 ? .6 : 0;
  if (flash) { ctx.save(); ctx.globalAlpha = .16 * flash; const sky = ctx.createLinearGradient(0, 0, 0, 260); sky.addColorStop(0, '#dbe9ff'); sky.addColorStop(1, '#dbe9ff00'); ctx.fillStyle = sky; ctx.fillRect(0, 0, g.width, 260); ctx.restore(); }
  // Rain: slanted streaks falling past everything, thin and faint so the ball always reads.
  ctx.save(); ctx.strokeStyle = '#b9d6ea'; ctx.lineWidth = .7; ctx.globalAlpha = .22; ctx.beginPath();
  for (let i = 0; i < 46; i++) {
    const x0 = rnd(i, 1) * (g.width + 80), sp = 420 + rnd(i, 2) * 160, yy = ((t * sp + rnd(i, 3) * 900) % 900) - 60, x = x0 - yy * .18;
    ctx.moveTo(x, yy); ctx.lineTo(x - 3.2, yy + 16);
  }
  ctx.stroke(); ctx.restore();
}

// The painted splash (8 frames) for Siege effects; q runs 0..1 over the effect.
export function paintedSplash(ctx, x, y, q, k = .4) {
  return r3draw(ctx, 'fx', 'splash_' + Math.min(7, Math.floor(q * 8)), x, y, k, { alpha: q > .8 ? (1 - q) / .2 : 1 });
}
