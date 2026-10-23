// Character portraits for cards and chips: the game's own rendered art (Kit and Lumi faces, the villains' sprite sheets)
// cropped into a round, glazed medallion. Nothing here is a placeholder shape: if an image has not decoded yet the
// medallion simply shows its enamel until it does.
import { ART } from './vault-art.js';
import { loadImg, ready, drawKitFace, shade } from './gfx.js';

const TAU = Math.PI * 2;
const sheet = (data, extra = {}) => data?.url ? { img: loadImg(data.url), ...extra } : null;
const A = ART || {};
const S = {
  emerald: sheet(A.snakeEmerald), violet: sheet(A.snake),
  warden: sheet(A.frostWarden), nerra: sheet(A.fantasy?.nerra?.nerraBody), korr: sheet(A.fantasy?.bellforge?.korr),
  ember: sheet(A.hoard?.['ember/sleep']), coin: sheet(A.hoard?.coin),
};

// One entry per portrait: which sheet, which cell (col/row) and the crop inside that cell, in cell fractions
// [x, y, w, h] (square crops sit best in the round frame). tint is the medallion's glow.
export const PORTRAITS = {
  serpent: { s: 'emerald', cell: [256, 256], col: 10, row: 0, crop: [.16, .17, .62, .5], tint: '#58d6b0' },
  serpentGrin: { s: 'emerald', cell: [256, 256], col: 12, row: 0, crop: [.16, .17, .62, .5], tint: '#58d6b0' },
  mooncoil: { s: 'violet', cell: [176, 176], col: 12, row: 0, crop: [.16, .15, .62, .5], tint: '#b79af0' },
  warden: { s: 'warden', cell: [256, 228], col: 0, row: 0, crop: [.2, .1, .6, .68], tint: '#7fc7ff' },
  nerra: { s: 'nerra', cell: [640, 576], col: 0, row: 0, crop: [.22, .22, .62, .68], tint: '#ff7d6a' },
  korr: { s: 'korr', cell: [512, 448], col: 0, row: 0, crop: [.3, .02, .62, .72], tint: '#ff8a9a' },
  ember: { s: 'ember', whole: true, crop: [.04, .0, .82, .82], tint: '#ffbf6a' },
  coin: { s: 'coin', whole: true, crop: [0, 0, 1, 1], tint: '#ffd36a' },
};
const FACE = { kit: { who: undefined, clip: 'Focus', tint: '#7fb6ff' }, lumi: { who: 'lumi', clip: 'Nervous', tint: '#ff9ec8' } };

// A brass-rimmed medallion with the portrait inside; (cx, cy) centre, r radius. t drives a faint breathing glow.
export function drawPortrait(g, id, cx, cy, r, t = 0, { dim = 1 } = {}) {
  const f = FACE[id], p = PORTRAITS[id], tint = f?.tint || p?.tint || '#9fb3e8';
  g.save();
  // soft coloured halo behind the ring
  const halo = g.createRadialGradient(cx, cy, r * .7, cx, cy, r * 1.55);
  halo.addColorStop(0, tint + 'aa'); halo.addColorStop(1, tint + '00');
  g.globalAlpha *= .55 + .15 * Math.sin(t * 2.2); g.fillStyle = halo; g.fillRect(cx - r * 1.6, cy - r * 1.6, r * 3.2, r * 3.2); g.restore();
  g.save();
  g.fillStyle = 'rgba(0,0,0,0.38)'; g.beginPath(); g.arc(cx + 1.5, cy + 4, r + 1, 0, TAU); g.fill();
  const rim = g.createLinearGradient(0, cy - r, 0, cy + r); rim.addColorStop(0, '#fff1c4'); rim.addColorStop(.45, '#d6a35f'); rim.addColorStop(1, '#5a3a14');
  g.fillStyle = rim; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill();
  const ri = r - Math.max(2, r * .075);
  g.save(); g.beginPath(); g.arc(cx, cy, ri, 0, TAU); g.clip();
  const bg = g.createRadialGradient(cx, cy - ri * .35, 0, cx, cy, ri); bg.addColorStop(0, shade(tint, -.25)); bg.addColorStop(1, '#0b1020');
  g.fillStyle = bg; g.fillRect(cx - ri, cy - ri, ri * 2, ri * 2);
  g.globalAlpha *= dim;
  if (f) drawKitFace(g, cx, cy + ri * .06, ri * 2.12, f.clip, f.who);
  else if (p) drawCrop(g, p, cx, cy, ri);
  g.globalAlpha = 1;
  const gloss = g.createLinearGradient(0, cy - ri, 0, cy + ri * .1); gloss.addColorStop(0, 'rgba(255,255,255,0.28)'); gloss.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gloss; g.beginPath(); g.ellipse(cx, cy - ri * .5, ri * .8, ri * .46, 0, 0, TAU); g.fill();
  g.restore();
  g.strokeStyle = 'rgba(50,28,6,0.55)'; g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, ri, 0, TAU); g.stroke();
  g.restore();
}

function drawCrop(g, p, cx, cy, ri) {
  const sh = S[p.s]; if (!ready(sh)) return;
  const iw = sh.img.naturalWidth, ih = sh.img.naturalHeight;
  let cw = iw, ch = ih, ox = 0, oy = 0;
  if (!p.whole) { [cw, ch] = p.cell; ox = p.col * cw; oy = p.row * ch; }
  const [fx, fy, fw, fh] = p.crop, sx = ox + fx * cw, sy = oy + fy * ch, sw = fw * cw, sw2 = fh * ch, side = ri * 2.1;
  const k = Math.min(side / sw, side / sw2);
  g.drawImage(sh.img, sx, sy, sw, sw2, cx - sw * k / 2, cy - sw2 * k / 2, sw * k, sw2 * k);
}
