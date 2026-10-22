// Rendering helpers. Light always comes from the top-left; every object casts a soft shadow down-right.

import { ART } from './vault-art.js';

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

// ---------- particles ----------
export class FX {
  constructor() { this.shards = []; this.dust = []; this.pops = []; this.rings = []; }
  shatter(x, y, w, h, color, n = 6, power = 1) {
    for (let i = 0; i < n; i++) {
      const sx = x + Math.random() * w, sy = y + Math.random() * h;
      const s = 2 + Math.random() * Math.min(w, h) * 0.45;
      const a = Math.random() * Math.PI * 2;
      const pts = [];
      const k = 3 + (Math.random() * 2 | 0);
      for (let j = 0; j < k; j++) { const t = j / k * Math.PI * 2 + Math.random() * 0.6; pts.push(Math.cos(t) * s * (0.6 + Math.random() * 0.5), Math.sin(t) * s * (0.6 + Math.random() * 0.5)); }
      this.shards.push({ x: sx, y: sy, vx: Math.cos(a) * (40 + Math.random() * 90) * power, vy: Math.sin(a) * 60 * power - 60 - Math.random() * 60, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 14, pts, color, light: shade(color, 0.35), dark: shade(color, -0.4), life: 1 + Math.random() * 0.5, t: 0 });
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
      for (const r of this.rings) { const [x, y] = P(r.x, r.y); bloom(g, x, y, r); }
      g.globalAlpha = 1;
      for (const p of this.pops) {
        const k = p.t / p.life, sc = k < 0.15 ? 0.6 + k / 0.15 * 0.5 : 1.1 - Math.min(0.1, (k - 0.15)), [x, y] = p.screen ? [p.x, p.y] : P(p.x, p.y);
        g.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1;
        text(g, p.text, x, y, p.size * sc, p.color, 'center');
      }
      g.globalAlpha = 1;
      return;
    }
    for (const d of this.dust) {
      g.globalAlpha = 0.18 * (1 - d.t / d.life); g.fillStyle = d.c;
      g.beginPath(); g.arc(d.x, d.y, d.r, 0, 7); g.fill();
    }
    for (const s of this.shards) {
      const a = Math.min(1, (s.life - s.t) * 3);
      g.globalAlpha = a * 0.3; g.fillStyle = '#000';
      poly(g, s.x + 2, s.y + 3, s.pts, s.rot); g.fill();
      g.globalAlpha = a;
      g.fillStyle = Math.cos(s.rot) > 0 ? s.light : s.color; poly(g, s.x, s.y, s.pts, s.rot); g.fill();
      g.strokeStyle = s.dark; g.lineWidth = 0.6; g.stroke();
    }
    for (const r of this.rings) bloom(g, r.x, r.y, r);
    g.globalAlpha = 1;
    for (const p of this.pops) {
      const k = p.t / p.life, sc = k < 0.15 ? 0.6 + k / 0.15 * 0.5 : 1.1 - Math.min(0.1, (k - 0.15));
      g.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1;
      text(g, p.text, p.x, p.y, p.size * sc, p.color, 'center');
    }
    g.globalAlpha = 1;
  }
}
// An impact 'ring' is a soft expanding bloom of light (filled, additive), never a stroked circle.
function bloom(g, x, y, r) {
  const k = r.t / r.life, R = r.r * (0.45 + 0.75 * k);
  const gr = g.createRadialGradient(x, y, 0, x, y, R); gr.addColorStop(0, r.color); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.42 * (1 - k) * (1 - k); g.fillStyle = gr; g.fillRect(x - R, y - R, R * 2, R * 2); g.restore();
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
