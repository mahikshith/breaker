// Rendering helpers. Light always comes from the top-left; every object casts a soft shadow down-right.

import { ART } from './vault-art.js';
import { softRing } from './glow.js';
export { softRing };

export const SHADOW = { dx: 3, dy: 5, a: 0.35 };
// Blender-rendered sprites (ball, paddle, capsules, bricks...), shared by both levels; code-drawn fallbacks stay in place
const pending = [];
const images = new Map();
export const loadImg = url => {
  if (images.has(url)) return images.get(url);
  const i = new Image(); i.src = url; images.set(url, i); pending.push(i.decode().catch(() => {})); return i;
};
export const artLoaded = () => Promise.all(pending);   // resolves once every rendered image has decoded
export const SPR = {};
for (const [k, s] of Object.entries(ART?.sprites || {})) SPR[k] = { img: loadImg(s.url), ...s };
// Glaze v2 bricks replace the Vault brick sprites key for key; ?glaze=v1 keeps the old set for side-by-side shots.
const GLAZE_V1 = typeof location !== 'undefined' && /[?&]glaze=v1\b/.test(location.search);
if (!GLAZE_V1) for (const [k, s] of Object.entries(ART?.glaze2 || {})) SPR[k] = { img: loadImg(s.url), ...s };
export const ready = s => !!(s && s.img.complete && s.img.naturalWidth);
export function drawStretchPaddle(g, part, p) {
  if (!ready(part)) return;
  const img = part.img, iw = img.naturalWidth, ih = img.naturalHeight;
  const [bx, by, bw, bh] = part.artBounds || [0, 0, 1, 1], scale = p.h / (bh * ih);
  const end = Math.min(bh * ih * 1.1, bw * iw * .25), cutL = bx * iw + end, cutR = (bx + bw) * iw - end;
  const dwL = cutL * scale, dwR = (iw - cutR) * scale, x0 = p.x - p.w / 2 - bx * iw * scale;
  const x1 = p.x + p.w / 2 + (1 - bx - bw) * iw * scale, y = p.y - by * ih * scale, h = ih * scale;
  g.drawImage(img, 0, 0, cutL, ih, x0, y, dwL, h);
  g.drawImage(img, cutL, 0, cutR - cutL, ih, x0 + dwL, y, Math.max(0, x1 - x0 - dwL - dwR), h);
  g.drawImage(img, cutR, 0, iw - cutR, ih, x1 - dwR, y, dwR, h);
}
const KIT = ART?.kit ? { ...ART.kit, img: loadImg(ART.kit.url) } : null;
const KIT_FACES = KIT?.faces ? { ...KIT.faces, img: loadImg(KIT.faces.url) } : null;
const LUMI_FACES = ART?.lumiFaces ? { ...ART.lumiFaces, img: loadImg(ART.lumiFaces.url) } : null;
export function drawKitFace(g, x, y, size, clip = 'Idle', who) {
  if (who === 'lumi' && ready(LUMI_FACES)) { const c = LUMI_FACES.cell; g.drawImage(LUMI_FACES.img, (LUMI_FACES.expr[clip] ?? 0) * c, 0, c, c, x - size / 2, y - size / 2, size, size); return; }
  if (!ready(KIT_FACES)) return;
  const c = KIT_FACES.cell, col = (KIT.anims[clip] || KIT.anims.Idle).row;
  g.drawImage(KIT_FACES.img, col * c, 0, c, c, x - size / 2, y - size / 2, size, size);
}
export function drawKit(g, x, feetY, clip, t, scale = 1) {
  if (!ready(KIT)) return;
  const a = KIT.anims[clip] || KIT.anims.Idle, cell = KIT.cell, u = KIT.unit * scale;
  const frame = Math.max(0, Math.floor(t * a.fps)), f = a.loop ? frame % a.n : Math.min(frame, a.n - 1);
  g.drawImage(KIT.img, f * cell, a.row * cell, cell, cell, x - u / 2, feetY - u + KIT.feet * scale, u, u);
}
const KIT_CAST = ART?.kitCast ? { ...ART.kitCast, img: loadImg(ART.kitCast.url) } : null;
export function drawKitCastFlight(g, from, to, age, scale = 1) {
  if (!ready(KIT_CAST) || age < 0 || age >= KIT_CAST.timing.arrival) return;
  const { anticipation, arrival } = KIT_CAST.timing, a = KIT_CAST.anims.Spin, cell = KIT_CAST.cell;
  const p = Math.max(0, (age - anticipation) / (arrival - anticipation)), u = p * p * (3 - 2 * p);
  const sx = from.x + from.r + 14 / scale, sy = from.y - 10 / scale;
  const cx = sx + 30 / scale, cy = (sy + to.y) / 2 - 36 / scale;
  const x = (1 - u) ** 2 * sx + 2 * (1 - u) * u * cx + u * u * to.x;
  const y = (1 - u) ** 2 * sy + 2 * (1 - u) * u * cy + u * u * to.y;
  const size = 32 / scale * (1 - u) + to.size * (2.8 / 3.4) * u;
  const f = Math.min(a.n - 1, Math.floor(p * a.n));
  g.drawImage(KIT_CAST.img, f * cell, a.row * cell, cell, cell, x - size / 2, y - size / 2, size, size);
}
export function drawKitBrickArmour(g, x, y, age, size = 40, alpha = 1) {
  if (!ready(KIT_CAST) || age < KIT_CAST.timing.arrival || alpha <= 0) return;
  const { arrival, settled } = KIT_CAST.timing, a = KIT_CAST.anims.Armour, cell = KIT_CAST.cell;
  const f = Math.min(a.n - 1, Math.floor((age - arrival) / (settled - arrival) * a.n));
  g.save(); g.globalAlpha *= alpha;
  g.drawImage(KIT_CAST.img, f * cell, a.row * cell, cell, cell, x - size / 2, y - size / 2, size, size);
  g.restore();
}
let DPR = 1;
export const setDPR = d => { DPR = d; cache.clear(); };

const cache = new Map();
export function cached(key, w, h, draw) {
  let cv = cache.get(key);
  if (cv) return cv;
  cv = document.createElement('canvas');
  cv.width = Math.ceil(w * DPR); cv.height = Math.ceil(h * DPR);
  const g = cv.getContext('2d'); g.scale(DPR, DPR); draw(g);
  cache.set(key, cv);
  return cv;
}

export function shade(hex, f) { // f > 0 lightens towards white, f < 0 darkens towards black
  const n = parseInt(hex.slice(1), 16);
  let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const t = f < 0 ? 0 : 255, k = Math.abs(f);
  r = Math.round(r + (t - r) * k); g = Math.round(g + (t - g) * k); b = Math.round(b + (t - b) * k);
  return `rgb(${r},${g},${b})`;
}

export function rrect(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }

// A glossy block with a visible bottom face (depth) and a specular band.
export function brick(color, w, h, opt = {}) {
  const depth = opt.depth ?? Math.max(3, Math.round(h * 0.22));
  const key = `brick|${color}|${w}|${h}|${depth}|${opt.crack || 0}|${opt.metal || 0}|${opt.glyph || ''}`;
  return cached(key, w, h + depth, g => {
    const r = Math.min(4, h * 0.3);
    // bottom face
    g.fillStyle = shade(color, -0.55); rrect(g, 0, depth, w, h, r); g.fill();
    // top face
    const top = g.createLinearGradient(0, 0, 0, h);
    if (opt.metal) {
      top.addColorStop(0, shade(color, 0.55)); top.addColorStop(0.45, shade(color, 0.05));
      top.addColorStop(0.5, shade(color, -0.25)); top.addColorStop(1, shade(color, 0.1));
    } else {
      top.addColorStop(0, shade(color, 0.28)); top.addColorStop(0.55, color); top.addColorStop(1, shade(color, -0.18));
    }
    g.fillStyle = top; rrect(g, 0, 0, w, h, r); g.fill();
    // edge light (top-left) and edge dark (bottom-right)
    g.lineWidth = 1;
    g.strokeStyle = 'rgba(255,255,255,0.45)';
    g.beginPath(); g.moveTo(r, 0.5); g.lineTo(w - r, 0.5); g.moveTo(0.5, r); g.lineTo(0.5, h - r); g.stroke();
    g.strokeStyle = 'rgba(0,0,0,0.25)';
    g.beginPath(); g.moveTo(r, h - 0.5); g.lineTo(w - r, h - 0.5); g.moveTo(w - 0.5, r); g.lineTo(w - 0.5, h - r); g.stroke();
    // specular band
    const sp = g.createLinearGradient(0, 0, w, 0);
    sp.addColorStop(0, 'rgba(255,255,255,0)'); sp.addColorStop(0.25, 'rgba(255,255,255,0.55)'); sp.addColorStop(0.6, 'rgba(255,255,255,0.08)'); sp.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = sp; rrect(g, 2, 1.5, w - 4, Math.max(1.5, h * 0.22), h * 0.11); g.fill();
    if (opt.glyph === 'rivet') {
      for (const [x, y] of [[3.5, 3.5], [w - 3.5, 3.5], [3.5, h - 3.5], [w - 3.5, h - 3.5]]) {
        g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.arc(x + 0.4, y + 0.5, 1.4, 0, 7); g.fill();
        g.fillStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.arc(x, y, 1.1, 0, 7); g.fill();
      }
    }
    if (opt.glyph === 'gem') {
      const cx = w / 2, cy = h / 2, s = Math.min(w, h) * 0.32;
      g.fillStyle = 'rgba(0,0,0,0.25)'; diamond(g, cx + 0.8, cy + 1, s); g.fill();
      g.fillStyle = '#fff6d0'; diamond(g, cx, cy, s); g.fill();
      g.fillStyle = 'rgba(255,170,40,0.55)'; g.beginPath(); g.moveTo(cx, cy - s); g.lineTo(cx + s, cy); g.lineTo(cx, cy + s); g.closePath(); g.fill();
    }
    if (opt.crack) {
      g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 1.1;
      g.beginPath(); g.moveTo(w * 0.3, 0); g.lineTo(w * 0.42, h * 0.45); g.lineTo(w * 0.33, h * 0.7); g.moveTo(w * 0.42, h * 0.45); g.lineTo(w * 0.62, h * 0.55);
      if (opt.crack > 1) { g.moveTo(w * 0.75, h); g.lineTo(w * 0.68, h * 0.6); g.lineTo(w * 0.85, h * 0.35); }
      g.stroke();
    }
  });
}
function diamond(g, x, y, s) { g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + s, y); g.lineTo(x, y + s); g.lineTo(x - s, y); g.closePath(); }

export function drawShadowRect(g, x, y, w, h, r, a = SHADOW.a) {
  g.fillStyle = `rgba(0,0,0,${a})`; rrect(g, x + SHADOW.dx, y + SHADOW.dy, w, h, r); g.fill();
}

// Steel ball (or molten when fire). Pre-rendered at a fixed radius, scaled on draw.
function ballSprite(fire) {
  return cached('ball' + fire, 40, 40, g => {
    const c = 20, R = 18;
    const gr = g.createRadialGradient(c - 6, c - 7, 1, c, c, R);
    if (fire) { gr.addColorStop(0, '#fffbe8'); gr.addColorStop(0.3, '#ffd36b'); gr.addColorStop(0.7, '#f2701c'); gr.addColorStop(1, '#8a2205'); }
    else { gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.25, '#e9edf5'); gr.addColorStop(0.65, '#9aa3b8'); gr.addColorStop(1, '#3b4258'); }
    g.fillStyle = gr; g.beginPath(); g.arc(c, c, R, 0, 7); g.fill();
    // reflected horizon band
    g.save(); g.beginPath(); g.arc(c, c, R, 0, 7); g.clip();
    g.fillStyle = fire ? 'rgba(255,240,200,0.25)' : 'rgba(40,50,80,0.28)'; g.fillRect(0, c + 2, 40, 5);
    g.restore();
    g.fillStyle = 'rgba(255,255,255,0.95)'; g.beginPath(); g.ellipse(c - 6, c - 8, 5, 3, -0.5, 0, 7); g.fill();
  });
}
export function drawBall(g, b, alpha = 1) {
  if (b.ram > 0) { drawRamBall(g, b, alpha); return; }
  const s = b.r * 2 / 36;
  g.globalAlpha = alpha * 0.32; g.fillStyle = '#000';
  g.beginPath(); g.ellipse(b.x + SHADOW.dx, b.y + SHADOW.dy, b.r, b.r * 0.85, 0, 0, 7); g.fill();
  // short motion ghost: two faint copies behind, no glowing lines
  const sp = Math.hypot(b.vx, b.vy) || 1;
  // the rendered chrome ball is 12 units across inside a 20-unit image; the code-drawn one fills 36 of 40
  const titan = b.titan > 0, R = SPR[titan ? 'ball_titan' : b.fire ? 'ball_fire' : 'ball'], spr = ready(R) ? R.img : ballSprite(b.fire || titan), half = ready(R) ? b.r * 20 / 12 : 20 * s;
  if (titan) { // a pulsing energy halo so the big ball reads as a power, not just a bigger ball
    const pulse = 0.75 + 0.25 * Math.sin(performance.now() / 70);
    g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = alpha * 0.55 * pulse;
    const hg = g.createRadialGradient(b.x, b.y, b.r * 0.6, b.x, b.y, b.r * 2.1);
    hg.addColorStop(0, 'rgba(255,90,220,0.9)'); hg.addColorStop(0.5, 'rgba(90,200,255,0.35)'); hg.addColorStop(1, 'rgba(90,200,255,0)');
    g.fillStyle = hg; g.beginPath(); g.arc(b.x, b.y, b.r * 2.1, 0, 7); g.fill(); g.restore();
  }
  for (let i = 2; i >= 1; i--) {
    g.globalAlpha = alpha * (b.fire ? 0.22 : 0.12) / i;
    const k = i * 0.012;
    g.drawImage(spr, b.x - b.vx * k - half, b.y - b.vy * k - half, half * 2, half * 2);
  }
  g.globalAlpha = alpha;
  g.drawImage(spr, b.x - half, b.y - half, half * 2, half * 2);
  g.globalAlpha = 1;
  void sp;
}

// ---------- Sweet-Spot Ram (src/fantasy/ram.js) in the Arena levels ----------
// Gem sockets come from the rendered fx kit (art/fx_kit), the same parts the castle chapters use; everything else is
// soft filled light. Nothing here is a stroked ring.
const FXK = Object.fromEntries(Object.entries(ART?.fxKit || {}).map(([k, v]) => [k, { img: loadImg(v.url), uw: v.uw, uh: v.uh }]));
const GEM_BLOOM = { pip_gold: '#ffc98a', pip_rose: '#ff9ec0', pip_blue: '#9fd0ff' };
function ramBloom(g, x, y, r, colour, a, rx = r, ry = r) {
  if (a <= 0 || r <= 0) return;
  g.save(); g.globalAlpha *= Math.min(1, a); g.translate(x, y); g.scale(rx / r, ry / r);
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, r); gr.addColorStop(0, colour); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(-r, -r, r * 2, r * 2); g.restore();
}
function fxPart(g, key, x, y, scale = 1) {
  const p = FXK[key]; if (!p || !ready(p)) return; const w = p.uw * scale, h = p.uh * scale;
  g.drawImage(p.img, x - w / 2, y - h / 2, w, h);
}
// Armed paddle: a warm pool under it (under = true, before the paddle art) and a glazed centre third on top.
export function drawRamGlaze(g, p, t, key = 'pip_gold', under = false) {
  if (!p.armed) return;
  const beat = .5 + .5 * Math.sin(t * 9), warm = GEM_BLOOM[key] || GEM_BLOOM.pip_gold, cy = p.y + p.h / 2;
  if (under) { ramBloom(g, p.x, cy, p.w * .55, warm, .32 + .16 * beat, p.w * .55, 20); return; }
  g.save(); g.globalCompositeOperation = 'lighter'; ramBloom(g, p.x, cy - 1, p.w / 6 + 4, warm, .45 + .3 * beat, p.w / 6 + 4, p.h * .55); g.restore();
}
// Three sockets under the paddle light 1/3, 2/3, 3/3 with the streak, then beat while the ram waits.
export function drawRamPips(g, p, t, key = 'pip_gold') {
  const lit = p.armed ? 3 : Math.min(3, p.streak || 0), pulse = p.armed ? .5 + .5 * Math.sin(t * 9) : 0, warm = GEM_BLOOM[key] || GEM_BLOOM.pip_gold;
  const y = p.y + p.h + 8, gap = 9.5, scale = .86;
  for (let i = 0; i < 3; i++) {
    const x = p.x + (i - 1) * gap, on = i < lit;
    if (on) ramBloom(g, x, y, 7 * scale + 2 * pulse, warm, .38 + .25 * pulse);
    fxPart(g, on ? key : 'pip_empty', x, y, scale * (on ? 1 + .08 * pulse : 1));
  }
}
// The ram ball: polished steel with a gold hoop, a blue-white halo that drains over its 2.5 s and a tapered slipstream.
export function drawRamBall(g, b, alpha = 1) {
  const r = b.r, x = b.x, y = b.y, ang = Math.atan2(b.vy, b.vx), t = performance.now() / 1000, left = Math.max(0, Math.min(1, b.ram / 2.5));
  g.save(); g.globalAlpha = alpha;
  ramBloom(g, x, y, r * (2 + 1.6 * left), '#8cc4ff', .55 + .1 * Math.sin(t * 14));
  if (!b.caught && (b.vx || b.vy)) {
    g.save(); g.translate(x, y); g.rotate(ang); const L = 60, tg = g.createLinearGradient(0, 0, -L, 0);
    tg.addColorStop(0, 'rgba(207,232,255,0.8)'); tg.addColorStop(1, 'rgba(207,232,255,0)');
    g.fillStyle = tg; g.beginPath(); g.moveTo(0, -r * .95); g.lineTo(-L, -r * .25); g.lineTo(-L, r * .25); g.lineTo(0, r * .95); g.closePath(); g.fill(); g.restore();
  }
  const sg = g.createRadialGradient(x - r * .35, y - r * .4, r * .1, x, y, r);
  sg.addColorStop(0, '#fff'); sg.addColorStop(.25, '#d3e0ec'); sg.addColorStop(.62, '#6f8499'); sg.addColorStop(1, '#222c38');
  g.fillStyle = sg; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  // Gold hoop: a filled band clipped to the sphere, turned along the flight.
  g.save(); g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.clip(); g.translate(x, y); g.rotate(ang + Math.PI / 2);
  const band = (rx, ry, w, colour) => { g.fillStyle = colour; g.beginPath(); g.ellipse(0, 0, rx + w, ry + w, 0, 0, Math.PI * 2); g.ellipse(0, 0, Math.max(.1, rx - w), Math.max(.1, ry - w), 0, 0, Math.PI * 2); g.fill('evenodd'); };
  band(r * 1.05, r * .34, 2, '#8a5f22'); band(r * 1.05, r * .34, 1.2, '#f0c56f'); g.restore();
  g.fillStyle = 'rgba(255,255,255,0.8)'; g.beginPath(); g.ellipse(x - r * .36, y - r * .42, r * .2, r * .11, -.6, 0, Math.PI * 2); g.fill();
  const rim = g.createRadialGradient(x, y, r * .7, x, y, r); rim.addColorStop(0, 'rgba(13,19,26,0)'); rim.addColorStop(1, 'rgba(13,19,26,0.6)');
  g.fillStyle = rim; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  g.restore();
}

// ---------- particles ----------
// Premium crash pieces and impact glints (art/premium/premium.py): glazed shard sprites per palette and soft star glints.
const PREM = ART?.premium || {};
const SHARD_IMG = Object.fromEntries(Object.entries(PREM.shards || {}).map(([k, urls]) => [k, urls.map(loadImg)]));
const GLINT_IMG = Object.fromEntries(Object.entries(PREM.glints || {}).map(([k, url]) => [k, loadImg(url)]));
const imgReady = i => !!(i && i.complete && i.naturalWidth);
const SHARD_PAL = { teal: [34, 196, 176], violet: [143, 92, 240], coral: [255, 111, 97], gold: [255, 199, 61], blue: [79, 157, 255], cyan: [26, 166, 224],
  pink: [226, 69, 155], sage: [85, 135, 106], ivory: [232, 209, 179], plum: [125, 79, 196], ice: [200, 230, 255], hull: [150, 150, 170] };
const rgbOf = c => { if (c[0] === '#') { const n = parseInt(c.slice(1, 7).padEnd(6, '0'), 16); return [n >> 16, n >> 8 & 255, n & 255]; } return (c.match(/[\d.]+/g) || [128, 128, 128]).slice(0, 3).map(Number); };
const SHARD_ALIAS = [['hull', [74, 79, 110]], ['hull', [60, 64, 90]]];   // Vault granite and dark iron read as gunmetal, not sage
const paletteMemo = new Map();
// The nearest shard palette to a brick colour (Vault teal/violet/coral/gold/blue, Carrier cyan/pink, hull grey, Frost ice).
export function shardPalette(color) {
  if (SHARD_PAL[color]) return color;
  let best = paletteMemo.get(color); if (best) return best;
  const v = rgbOf(color); let bd = Infinity;
  for (const [k, p] of [...Object.entries(SHARD_PAL), ...SHARD_ALIAS]) { const d = (p[0] - v[0]) ** 2 + (p[1] - v[1]) ** 2 + (p[2] - v[2]) ** 2; if (d < bd) { bd = d; best = k; } }
  paletteMemo.set(color, best); return best;
}
// Warm for gold/orange, rose for pink/magenta/red, cool for cyan, blue and white.
export function glintKind(color) {
  const [r, g, b] = rgbOf(color);
  if (r > b + 30) return g > 150 ? 'warm' : 'rose';
  return r > 200 && b > 170 && g < 185 ? 'rose' : 'cool';
}
// One glazed shard sprite centred on (x, y), turned by rot; size is the drawn edge in units.
export function drawShard(g, palette, variant, x, y, rot, size, alpha = 1) {
  const img = SHARD_IMG[palette]?.[variant % 3]; if (!imgReady(img)) return false;
  g.save(); g.globalAlpha *= alpha; g.translate(x, y); g.rotate(rot); g.drawImage(img, -size / 2, -size / 2, size, size); g.restore(); return true;
}
// An impact glint: the rendered star, additive, growing 0.7 -> 1.3 of the hit size and fading over its life.
export function drawGlint(g, x, y, r, k, color = '#fff', a = 1) {
  const img = GLINT_IMG[glintKind(color)]; if (!imgReady(img)) return false;
  const s = r * (0.7 + 0.6 * k), turn = ((x * 7 + y * 13) % 10) * 0.05 - 0.25;   // a small fixed tilt per hit, so repeats don't stamp
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha *= a * (1 - k) * (1 - k * 0.4); g.translate(x, y); g.rotate(turn); g.drawImage(img, -s, -s, s * 2, s * 2); g.restore(); return true;
}
export class FX {
  constructor() { this.shards = []; this.dust = []; this.pops = []; this.rings = []; this.nShard = 0; }
  // palette: a shard sprite family (teal, ice, hull...); by default the nearest one to the brick colour.
  shatter(x, y, w, h, color, n = 6, power = 1, palette) {
    const pal = palette || shardPalette(color);
    for (let i = 0; i < n; i++) {
      const sx = x + Math.random() * w, sy = y + Math.random() * h;
      const s = 2 + Math.random() * Math.min(w, h) * 0.45;
      const a = Math.random() * Math.PI * 2;
      const pts = [];
      const k = 3 + (Math.random() * 2 | 0);
      for (let j = 0; j < k; j++) { const t = j / k * Math.PI * 2 + Math.random() * 0.6; pts.push(Math.cos(t) * s * (0.6 + Math.random() * 0.5), Math.sin(t) * s * (0.6 + Math.random() * 0.5)); }
      this.shards.push({ x: sx, y: sy, vx: Math.cos(a) * (40 + Math.random() * 90) * power, vy: Math.sin(a) * 60 * power - 60 - Math.random() * 60, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 14, pts, color, light: shade(color, 0.35), dark: shade(color, -0.4), life: 1 + Math.random() * 0.5, t: 0,
        pal, variant: this.nShard++ % 3, size: Math.max(5, Math.min(14, s * 2.6)) });
    }
    if (this.shards.length > 420) this.shards.splice(0, this.shards.length - 420);
    if (this.dust.length < 60) for (let i = 0; i < 3; i++) this.dust.push({ x: x + w / 2 + (Math.random() - 0.5) * w, y: y + h / 2, r: 4 + Math.random() * 6, vx: (Math.random() - 0.5) * 30, vy: -10 - Math.random() * 20, life: 0.6, t: 0, c: color });
  }
  pop(x, y, text, color = '#fff', size = 14) { this.pops.push({ x, y, text, color, size, t: 0, life: 0.9 }); }
  ring(x, y, color = '#fff', r = 30) { this.rings.push({ x, y, color, r, t: 0, life: 0.35 }); }
  update(dt, floorY) {
    for (const s of this.shards) {
      s.t += dt; s.vy += 520 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.rot += s.vr * dt;
      if (s.y > floorY && s.vy > 0) { s.vy *= -0.3; s.vx *= 0.6; s.vr *= 0.5; s.y = floorY; }
    }
    this.shards = this.shards.filter(s => s.t < s.life);
    for (const d of this.dust) { d.t += dt; d.x += d.vx * dt; d.y += d.vy * dt; d.r += 14 * dt; }
    this.dust = this.dust.filter(d => d.t < d.life);
    for (const p of this.pops) { p.t += dt; p.y -= 34 * dt * (1 - p.t / p.life); }
    this.pops = this.pops.filter(p => p.t < p.life);
    for (const r of this.rings) r.t += dt;
    this.rings = this.rings.filter(r => r.t < r.life);
  }
  draw(g, P, overlay) { // overlay: only rings and score pops, projected by P (the 3D view renders debris itself)
    if (overlay) {
      for (const r of this.rings) { const [x, y] = P(r.x, r.y); impact(g, x, y, r); }
      g.globalAlpha = 1;
      for (const p of this.pops) {
        const k = p.t / p.life, sc = k < 0.15 ? 0.6 + k / 0.15 * 0.5 : 1.1 - Math.min(0.1, (k - 0.15)), [x, y] = p.screen ? [p.x, p.y] : P(p.x, p.y);
        g.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1;
        text(g, p.text, x, y, p.size * sc, p.color, 'center');
      }
      g.globalAlpha = 1;
      return;
    }
    for (const d of this.dust) { // soft puffs, no hard disc edge
      const gr = g.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r); gr.addColorStop(0, d.c); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.globalAlpha = 0.2 * (1 - d.t / d.life); g.fillStyle = gr; g.fillRect(d.x - d.r, d.y - d.r, d.r * 2, d.r * 2);
    }
    g.globalAlpha = 1;
    for (const s of this.shards) {
      const a = Math.min(1, (s.life - s.t) * 3);
      if (drawShard(g, s.pal, s.variant, s.x, s.y, s.rot, s.size, a)) continue;
      g.globalAlpha = a * 0.3; g.fillStyle = '#000';
      poly(g, s.x + 2, s.y + 3, s.pts, s.rot); g.fill();
      g.globalAlpha = a;
      g.fillStyle = Math.cos(s.rot) > 0 ? s.light : s.color; poly(g, s.x, s.y, s.pts, s.rot); g.fill();
      g.globalAlpha = 1;
    }
    for (const r of this.rings) impact(g, r.x, r.y, r);
    g.globalAlpha = 1;
    for (const p of this.pops) {
      const k = p.t / p.life, sc = k < 0.15 ? 0.6 + k / 0.15 * 0.5 : 1.1 - Math.min(0.1, (k - 0.15));
      g.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1;
      text(g, p.text, p.x, p.y, p.size * sc, p.color, 'center');
    }
    g.globalAlpha = 1;
  }
}
// An impact 'ring' is a rendered glint over a faint soft bloom (both additive), never a stroked circle.
function impact(g, x, y, r) {
  const k = r.t / r.life;
  bloom(g, x, y, r, 0.22);
  if (!drawGlint(g, x, y, Math.max(6, r.r * 0.6), k, r.color, 0.9)) bloom(g, x, y, r, 0.2);
}
function bloom(g, x, y, r, a = 0.42) {
  const k = r.t / r.life, R = r.r * (0.45 + 0.75 * k);
  const gr = g.createRadialGradient(x, y, 0, x, y, R); gr.addColorStop(0, r.color); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = a * (1 - k) * (1 - k); g.fillStyle = gr; g.fillRect(x - R, y - R, R * 2, R * 2); g.restore();
}
function poly(g, x, y, pts, rot) {
  const c = Math.cos(rot), s = Math.sin(rot);
  g.beginPath();
  for (let i = 0; i < pts.length; i += 2) {
    const px = x + pts[i] * c - pts[i + 1] * s, py = y + pts[i] * s + pts[i + 1] * c;
    i ? g.lineTo(px, py) : g.moveTo(px, py);
  }
  g.closePath();
}

// A glazed HUD bar: a recessed track and a lacquered fill with a gloss band and a soft lit tip (no flat line, no outline).
export function glazedBar(g, x, y, w, h, frac, top, bottom) {
  const r = h / 2 + 1;
  g.fillStyle = 'rgba(3,6,14,0.55)'; rrect(g, x - 1, y - 1, w + 2, h + 2, r); g.fill();
  const tr = g.createLinearGradient(0, y, 0, y + h); tr.addColorStop(0, 'rgba(0,0,0,0.5)'); tr.addColorStop(1, 'rgba(255,255,255,0.12)');
  g.fillStyle = tr; rrect(g, x, y, w, h, h / 2); g.fill();
  frac = Math.max(0, Math.min(1, frac)); if (frac <= 0) return;
  const fw = Math.max(h, w * frac), fill = g.createLinearGradient(0, y, 0, y + h);
  fill.addColorStop(0, top); fill.addColorStop(1, bottom);
  g.fillStyle = fill; rrect(g, x, y, fw, h, h / 2); g.fill();
  const gl = g.createLinearGradient(0, y, 0, y + h * 0.55); gl.addColorStop(0, 'rgba(255,255,255,0.6)'); gl.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gl; rrect(g, x + h * 0.3, y + h * 0.08, Math.max(0, fw - h * 0.6), h * 0.42, h * 0.2); g.fill();
  const tip = g.createRadialGradient(x + fw - h / 2, y + h / 2, 0, x + fw - h / 2, y + h / 2, h * 2.2);
  tip.addColorStop(0, top); tip.addColorStop(1, 'rgba(0,0,0,0)');
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.45; g.fillStyle = tip; g.fillRect(x + fw - h * 2.7, y - h * 1.7, h * 4.4, h * 4.4); g.restore();
}
// A rendered fx-kit gem (pip_gold/blue/rose/empty) centred on (x, y).
export function drawGem(g, key, x, y, scale = 1, alpha = 1) {
  const p = FXK[key]; if (!p || !ready(p) || alpha <= 0) return;
  const w = p.uw * scale, h = p.uh * scale; g.save(); g.globalAlpha *= alpha; g.drawImage(p.img, x - w / 2, y - h / 2, w, h); g.restore();
}

export const FONT = '"Lilita One", "Arial Rounded MT Bold", system-ui, sans-serif';
export const NUM = '"Rubik", system-ui, sans-serif';
// Chunky game text: dark outline + drop shadow + slight top highlight.
export function text(g, str, x, y, size, color = '#fff', align = 'left', font = FONT) {
  g.font = `${size}px ${font}`; g.textAlign = align; g.textBaseline = 'middle';
  g.lineJoin = 'round';
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillText(str, x + 1, y + size * 0.12);
  g.strokeStyle = 'rgba(10,12,28,0.85)'; g.lineWidth = Math.max(2, size * 0.16); g.strokeText(str, x, y);
  g.fillStyle = color; g.fillText(str, x, y);
}

// Film-grain overlay so large gradients never look flat.
export function grain(w, h) {
  return cached('grain', 128, 128, g => {
    const id = g.createImageData(Math.ceil(128 * DPR), Math.ceil(128 * DPR));
    for (let i = 0; i < id.data.length; i += 4) { const v = Math.random() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 14; }
    g.setTransform(1, 0, 0, 1, 0, 0); g.putImageData(id, 0, 0);
  });
}
export function drawGrain(g, w, h) {
  const t = grain();
  g.save(); g.globalCompositeOperation = 'overlay';
  for (let y = 0; y < h; y += 128) for (let x = 0; x < w; x += 128) g.drawImage(t, x, y, 128, 128);
  g.restore();
}

export function vignette(g, w, h, a = 0.55) {
  const gr = g.createRadialGradient(w / 2, h * 0.45, h * 0.25, w / 2, h * 0.5, h * 0.75);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(0,0,0,${a})`);
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
}

// Glossy capsule for power-ups.
export const POWER = {
  split: { color: '#5ccf6a', label: '×3' },
  fire: { color: '#ff8a3d', label: 'FIRE' },
  wide: { color: '#3fa8f5', label: 'WIDE' },
  focus: { color: '#c46bf0', label: 'AIM' },
  burst: { color: '#f7c948', label: '+3' },
  laser: { color: '#ff4d6d', label: 'LASER' },
  shield: { color: '#2ec4b6', label: 'SHIELD' },
  slow: { color: '#7fd6ff', label: 'SLOW' },
  shrink: { color: '#5a5f78', label: 'TINY', bad: true },
};
export function capsule(kind) {
  const p = POWER[kind];
  return cached('cap' + kind, 40, 18, g => {
    const gr = g.createLinearGradient(0, 0, 0, 16);
    gr.addColorStop(0, shade(p.color, 0.45)); gr.addColorStop(0.5, p.color); gr.addColorStop(1, shade(p.color, -0.35));
    g.fillStyle = gr; rrect(g, 1, 1, 38, 15, 7.5); g.fill();
    g.strokeStyle = shade(p.color, -0.55); g.lineWidth = 1; g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.55)'; rrect(g, 5, 3, 30, 4, 2); g.fill();
    g.font = `11px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillText(p.label, 20.5, 10);
    g.fillStyle = '#fff'; g.fillText(p.label, 20, 9.2);
  });
}
