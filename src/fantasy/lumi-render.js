import { ART } from '../vault-art.js';
import { SPR, ready, cached, text, drawKit, loadImg } from '../gfx.js';
import { drawCastleWindow } from '../castle-window.js';
import { LUMI_FLOORS, LUNGE, LUMI_TIMING } from './lumitower.js';
import { glow, sparks, chips, pips, dust, rnd, clamp01, smooth, gBanner, gPaddle, hoistChain, sprite, skinFor, CLIMB } from './render.js';

// Lumi Breaks Out. Windows are the layered castle-window kit scaled to 44u; the serpent is one sampled path drawn twice:
// first clipped to the opening (behind the front arch), then beyond the opening edge in front of the frame, so the neck visibly
// passes through the window. Body is the Vault's tapered, scaled tube; heads are the emerald sheet; the collider circles are the drawn width.
const WS = 44 / 60, HALF = 16 * WS, HEAD = 1.5, RX = 322, LEDGE = 112, ROPE_TOP = 92;
const SN = ART.snakeEmerald ? { ...ART.snakeEmerald, img: loadImg(ART.snakeEmerald.url) } : null;
const BRICK = { t: 't', v: 'v', c: 'c', y: 'y', b: 'b', gold: 'y' };
const ease = t => smooth(t);
const note = (ctx, x, y, s, col) => {
  ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x, y, s * .34, s * .26, -.5, 0, 7); ctx.fill(); ctx.fillRect(x + s * .26, y - s * .95, s * .12, s * .95);
  ctx.beginPath(); ctx.moveTo(x + s * .38, y - s * .95); ctx.quadraticCurveTo(x + s * .95, y - s * .72, x + s * .64, y - s * .28); ctx.quadraticCurveTo(x + s * .78, y - s * .6, x + s * .38, y - s * .6); ctx.fill();
};
const star = (ctx, x, y, r, a, col) => { ctx.fillStyle = col; ctx.beginPath(); for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * .45 : r, t = a + i * Math.PI / 5 - Math.PI / 2; i ? ctx.lineTo(x + Math.cos(t) * rr, y + Math.sin(t) * rr) : ctx.moveTo(x + Math.cos(t) * rr, y + Math.sin(t) * rr); } ctx.closePath(); ctx.fill(); };
// A soft expanding pool of light (filled radial glow); never a stroked ring.
function wave(ctx, x, y, r, thick, col, a, sy = 1) {
  if (a <= 0 || r <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(1, sy); glow(ctx, 0, 0, r + thick * .5, col, Math.min(1, a * .75)); ctx.restore();
}
// ---------- backdrop: dark purple stone, side pillars, lanterns; the roof opens onto a night sky ----------
function wallTile() {
  return cached('lumi-wall', 360, 88, c => {
    c.fillStyle = '#1d1730'; c.fillRect(0, 0, 360, 88);
    for (let row = 0; row < 4; row++) for (let i = -1; i < 9; i++) {
      const w = 44, x = i * w + (row % 2 ? w / 2 : 0), y = row * 22, n = rnd(row * 11 + i, 3), side = x + w < 52 || x > 308;
      const l = side ? 15 + n * 4 : 21 + n * 6;
      c.fillStyle = `hsl(${268 + n * 14} ${side ? 22 : 26}% ${l}%)`; c.fillRect(x + 1, y + 1, w - 2, 20);
      c.fillStyle = '#ffffff0b'; c.fillRect(x + 1, y + 1, w - 2, 1.4); c.fillStyle = '#00000044'; c.fillRect(x + 1, y + 19, w - 2, 2);
      if (n > .7) { c.fillStyle = '#0000002a'; c.fillRect(x + 6 + n * 12, y + 5, 10, 8); }
    }
    c.fillStyle = '#0a0714'; for (const x of [0, 308]) c.fillRect(x, 0, 52, 88);
    for (const x of [0, 308]) for (let row = 0; row < 4; row++) for (let i = 0; i < 2; i++) {
      const n = rnd(row * 5 + i + x, 9), bx = x + i * 26, by = row * 22; c.fillStyle = `hsl(${262 + n * 10} 20% ${11 + n * 4}%)`; c.fillRect(bx + 1, by + 1, 24, 20);
      c.fillStyle = '#ffffff10'; c.fillRect(bx + 1, by + 1, 24, 1.3); c.fillStyle = '#00000066'; c.fillRect(bx + 1, by + 19, 24, 2);
    }
    c.fillStyle = '#8b73c455'; c.fillRect(51, 0, 1.4, 88); c.fillRect(307.6, 0, 1.4, 88);
    c.fillStyle = '#00000055'; c.fillRect(52, 0, 6, 88); c.fillRect(302, 0, 6, 88);
  });
}
function skyPlate(W, H) {
  return cached(`lumi-sky-${W}-${H}`, W, H, c => {
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#070a1e'); g.addColorStop(.5, '#1a1840'); g.addColorStop(.8, '#392a5c'); g.addColorStop(1, '#52386a'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 90; i++) { const x = rnd(i, 1) * W, y = rnd(i, 2) * H * .7, s = .5 + rnd(i, 3) * 1.1; c.fillStyle = `rgba(255,${235 + rnd(i, 4) * 20 | 0},${210 + rnd(i, 5) * 45 | 0},${.25 + rnd(i, 6) * .6})`; c.fillRect(x, y, s, s); }
    const mg = c.createRadialGradient(262, 112, 4, 262, 112, 120); mg.addColorStop(0, '#fff6dd'); mg.addColorStop(.08, '#fff0cc'); mg.addColorStop(.1, '#c9d2ff55'); mg.addColorStop(.45, '#8d9be522'); mg.addColorStop(1, '#0000'); c.fillStyle = mg; c.fillRect(100, 0, 320, 260);
    c.fillStyle = '#fff4d8'; c.beginPath(); c.arc(262, 112, 15, 0, 7); c.fill(); c.fillStyle = '#dcd0b0'; for (const [x, y, r] of [[257, 108, 3.4], [268, 118, 2.4], [264, 104, 1.8]]) { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
    for (let i = 0; i < 6; i++) { const x = rnd(i, 21) * W, y = 160 + rnd(i, 22) * 220, cg = c.createRadialGradient(x, y, 2, x, y, 90); cg.addColorStop(0, '#6a589a30'); cg.addColorStop(1, '#0000'); c.save(); c.translate(x, y); c.scale(2.2, .5); c.translate(-x, -y); c.fillStyle = cg; c.fillRect(x - 90, y - 90, 180, 180); c.restore(); }
    const hz = H * .68; c.fillStyle = '#120d24';
    for (let x = 40, i = 0; x < 320; x += 20 + rnd(i, 30) * 26, i++) { const w = 16 + rnd(i, 31) * 22, h = 18 + rnd(i, 32) * 46; c.fillRect(x, hz - h, w, h + 4); if (i % 2) { c.beginPath(); c.moveTo(x - 2, hz - h); c.lineTo(x + w / 2, hz - h - 14); c.lineTo(x + w + 2, hz - h); c.fill(); } else for (let k = 0; k < w; k += 6) c.fillRect(x + k, hz - h - 4, 3.4, 4); }
    const gg = c.createLinearGradient(0, hz, 0, H); gg.addColorStop(0, '#120d24'); gg.addColorStop(1, '#0a0716'); c.fillStyle = gg; c.fillRect(0, hz, W, H - hz);
  });
}
function vignette(W, H) {
  return cached(`lumi-vig-${W}-${H}`, W, H, c => { const g = c.createRadialGradient(W / 2, H * .46, H * .25, W / 2, H * .46, H * .78); g.addColorStop(0, '#0000'); g.addColorStop(1, '#02010a99'); c.fillStyle = g; c.fillRect(0, 0, W, H); });
}
function lantern(ctx, g, x, y) {
  const s = SPR.lantern, fl = .7 + .3 * Math.sin(g.time * 7 + x + y);
  glow(ctx, x, y + 6, 46, '#ff9a4a', .3 * fl); glow(ctx, x, y + 6, 18, '#ffd49a', .5 * fl);
  if (ready(s)) ctx.drawImage(s.img, x - 8 - s.margin * 0, y - 6, 16, 24);
}
// ---------- floor scenery ----------
// A dark stone cornice in the wall's own courses, so the hatch beams belong to the tower.
function ledge(ctx, x, y, w, h) {
  const gr = ctx.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#4a3f66'); gr.addColorStop(.18, '#352d4d'); gr.addColorStop(1, '#171227'); ctx.fillStyle = gr; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#00000044'; for (let bx = x - ((x + 20) % 44), r = 0; bx < x + w; bx += 44, r++) ctx.fillRect(Math.max(x, bx + (Math.floor(y) % 2 ? 22 : 0)), y + 2, 1.6, h - 3);
  ctx.fillStyle = '#ffffff22'; ctx.fillRect(x, y, w, 1.5); ctx.fillStyle = '#0008'; ctx.fillRect(x, y + h - 2, w, 2);
}
function hatchFrame(ctx, art, g) {
  ledge(ctx, 0, 70, g.width, 20); ledge(ctx, 0, 160, g.width, 20);
  ctx.fillStyle = '#07050f'; ctx.fillRect(0, 90, g.width, 70);
  const gr = ctx.createLinearGradient(0, 90, 0, 160); gr.addColorStop(0, '#00000099'); gr.addColorStop(1, '#0000'); ctx.fillStyle = gr; ctx.fillRect(0, 90, g.width, 70);
  const sh = ctx.createLinearGradient(0, 180, 0, 204); sh.addColorStop(0, '#0009'); sh.addColorStop(1, '#0000'); ctx.fillStyle = sh; ctx.fillRect(0, 180, g.width, 24);
}
function floorCell(ctx, art, g) {
  hatchFrame(ctx, art, g); const open = g.phase === 'climb';
  glow(ctx, 180, 128, 120, '#ffb0c8', .12 + .03 * Math.sin(g.time * 2)); glow(ctx, 180, 110, 60, '#ffd6a0', .12);
  const clip = open ? 'Cheer' : g.lunges.length ? 'Nervous' : 'Idle';
  if (!open) charSprite(ctx, art, clip, g.time, 180, 150, { size: 66 });
}
function floorSerpent(ctx, art, g) {
  hatchFrame(ctx, art, g); glow(ctx, 180, 120, 150, '#ffd6a0', .05); const open = g.phase === 'climb';
  if (open) glow(ctx, 180, 130, 140, '#ffe3b0', .35);
}
function charSprite(ctx, art, clip, t, x, feetY, { size = 62, flip = false } = {}) {
  const L = art.lumi, a = L.anims[clip] || L.anims.Idle, f = Math.floor(t * 16) % a.n, k = size / L.unit;
  ctx.save(); ctx.translate(x, feetY); if (flip) ctx.scale(-1, 1); ctx.fillStyle = '#0006'; ctx.beginPath(); ctx.ellipse(0, 1, 12 * k, 3 * k, 0, 0, 7); ctx.fill();
  ctx.drawImage(L.img, f * L.cell, a.row * L.cell, L.cell, L.cell, -size / 2, -size + L.feet * k, size, size); ctx.restore();
}
function hatchBars(ctx, g) {
  const bars = g.bricks.filter(b => b.type === 'bar' && b.hp > 0);
  for (const b of g.bricks) if (b.type === 'bar' && b.hp > 0) {
    const hurt = b.hp < b.maxHP, x = b.x, y = b.y, w = b.w, h = b.h;
    for (const [ry, rh] of [[y, 3.4], [y + h - 3.4, 3.4]]) {
      ctx.fillStyle = '#0006'; ctx.fillRect(x + 1, ry + 2, w, rh);
      const rg = ctx.createLinearGradient(0, ry, 0, ry + rh); rg.addColorStop(0, '#c4cade'); rg.addColorStop(.45, '#5b627c'); rg.addColorStop(1, '#1c1f2b'); ctx.fillStyle = rg; ctx.fillRect(x, ry, w, rh);
    }
    for (let i = 0; i < 3; i++) {
      const bx = x + w * (i + .5) / 3 + (hurt ? Math.sin(g.time * 40 + i) * .3 : 0), bg = ctx.createLinearGradient(bx - 1.3, 0, bx + 1.5, 0);
      bg.addColorStop(0, '#20232f'); bg.addColorStop(.35, '#b4bcd2'); bg.addColorStop(.6, '#4a5066'); bg.addColorStop(1, '#171a24'); ctx.fillStyle = '#0005'; ctx.fillRect(bx + 1.2, y + 3, 2.2, h - 4); ctx.fillStyle = bg; ctx.fillRect(bx - 1.3, y + 2, 2.8, h - 3);
    }
    if (hurt) { ctx.strokeStyle = '#ffd78a'; ctx.lineWidth = .9; ctx.beginPath(); ctx.moveTo(x + w * .3, y + 1); ctx.lineTo(x + w * .45, y + h * .5); ctx.lineTo(x + w * .36, y + h - 1); ctx.stroke(); }
  }
  const all = g.bricks.filter(b => b.type === 'bar'); if (!all.length) return;
  const total = all.reduce((s, b) => s + b.maxHP, 0), done = total - all.reduce((s, b) => s + Math.max(0, b.hp), 0);
  if (bars.length || g.phase === 'play' || g.phase === 'serve') text(ctx, `HATCH ${done} / ${total}`, 180, 193, 11, '#f3dca8', 'center');
}
export function lbrick(ctx, b) {
  const s = SPR[`brick_${BRICK[b.colour] || 'v'}_2_0`], k = b.w / 32;
  if (ready(s)) ctx.drawImage(s.img, b.x - 4 * k, b.y - 4 * k, 40 * k, 24 * k);
  else { ctx.fillStyle = '#6a5bb0'; ctx.fillRect(b.x, b.y, b.w, b.h); }
  if (b.colour === 'gold') { const cx = b.x + b.w / 2, cy = b.y + b.h / 2; glow(ctx, cx, cy, 11, '#ff5a6a', .55); ctx.fillStyle = '#ff3d55'; ctx.beginPath(); ctx.moveTo(cx, cy - 5); ctx.lineTo(cx + 6, cy); ctx.lineTo(cx, cy + 5); ctx.lineTo(cx - 6, cy); ctx.fill(); ctx.fillStyle = '#ffd0d6aa'; ctx.beginPath(); ctx.moveTo(cx - 1, cy - 3.5); ctx.lineTo(cx + 2.5, cy - 1); ctx.lineTo(cx - 1, cy); ctx.fill(); }
}
// Roof: the signal bell swings in its cradle; Kit's rope lowers a stage with every ring.
function floorRoof(ctx, art, g) {
  const b = g.bell, q = b.rings / b.need, sw = Math.sin(g.time * 13) * b.swing * .2;
  glow(ctx, 180, 150, 120, '#ffc87a', .12);
  sprite(ctx, art, 'bellforge', 'bellCradle', 180, 118, { width: 128 });
  hoistChain(ctx, art, { x: b.x + 2, y: 94 }, { x: b.x + 4, y: b.y - 27 }, 0);
  ctx.save(); ctx.translate(b.x + 3, b.y - 22); ctx.rotate(sw); ctx.translate(-b.x - 3, -b.y + 22); sprite(ctx, art, 'bellforge', 'bell', b.x, b.y, { width: 52 }); ctx.restore();
  pips(ctx, 180, 174, b.need, b.rings, { key: 'pip_rose', gap: 12, scale: .95, bloom: '#ff9ec0' });
  // Kit on the ledge, the rope dropping from his hands.
  ledge(ctx, 296, LEDGE, 64, 16);
  const esc = g.phase === 'escape' ? 1 - g.transition / LUMI_TIMING.escape : 0, t = esc * LUMI_TIMING.escape, p = g.phase === 'escape' ? 1 : q;
  let end = ROPE_TOP + 24 + (g.paddle.y - 24 - ROPE_TOP - 24) * ease(p);
  if (g.phase === 'escape' && t > 1.2) end = ROPE_TOP + 24 + (g.paddle.y - 24 - ROPE_TOP - 24) * (1 - ease((t - 1.2) / 1.2));
  if (g.state === 'won') end = ROPE_TOP + 20;
  const sway = Math.sin(g.time * 2.2) * 2.5 * (1 - p * .6);
  ctx.strokeStyle = '#2a1d14'; ctx.lineWidth = 3.4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(RX - 6, ROPE_TOP); ctx.quadraticCurveTo(RX - 6 + sway, (ROPE_TOP + end) / 2, RX - 6 + sway * 1.6, end); ctx.stroke();
  ctx.strokeStyle = '#c9a678'; ctx.lineWidth = 1.8; ctx.setLineDash([3, 2]); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#8c6a46'; ctx.beginPath(); ctx.ellipse(RX - 6 + sway * 1.6, end + 2, 3.4, 4.4, 0, 0, 7); ctx.fill();
  const cheer = g.phase === 'escape' || g.state === 'won' || g.effects.some(e => e.kind === 'bell-ring' && e.age < .7);
  drawKit(ctx, RX + 12, LEDGE + 2, cheer ? 'Cheer' : g.lunges.length ? 'Worried' : 'Idle', g.time, .95);
}
// ---------- the serpent ----------
function bodyPath(l, ext) {
  const pts = l.points.map(p => ({ ...p })), n = pts.length, last = pts[n - 1], dir = l.win.dir;
  const neck = pts[1]?.r ?? 8;
  pts[0].w = neck * .94; for (let i = 1; i < n; i++) pts[i].w = pts[i].r * .94;
  for (let i = 1; i <= ext; i++) pts.push({ x: last.x - dir * 12 * i, y: l.win.y, w: Math.max(2.6, last.w * (1 - i / (ext + 2)) || 4) });
  return pts;
}
// Body colours; Lumi's tower serpent is emerald, Serpent Rivals passes its own palette for Mooncoil.
export const EMERALD = { base: '#168f83', dark: '#0a635f', mid: '#239c89', belly: '#c9e8d2', seam: 'rgba(55,105,90,.38)', scaleDark: 'rgba(3,55,52,.55)', scaleRim: 'rgba(174,232,199,.36)', under: 'rgba(3,35,38,.34)', hi1: 'rgba(160,227,202,.2)', hi2: 'rgba(224,255,236,.35)', hi3: 'rgba(255,249,219,.65)', outline: '#052d31' };
export function drawBody(ctx, l, t, C0 = EMERALD) {
  const P = bodyPath(l, 6), C = [], K = C0;
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (let j = 0; j < 6; j++) { const u = j / 6, u2 = u * u, u3 = u2 * u; C.push({ w: p1.w + (p2.w - p1.w) * u,
      x: .5 * (2 * p1.x + (-p0.x + p2.x) * u + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * u2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * u3),
      y: .5 * (2 * p1.y + (-p0.y + p2.y) * u + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * u2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * u3) }); }
  }
  C.push(P[P.length - 1]); if (C.length < 2) return;
  let len = 0; const arc = [0]; for (let i = 1; i < C.length; i++) { len += Math.hypot(C[i].x - C[i - 1].x, C[i].y - C[i - 1].y); arc.push(len); }
  const belly = l.win.dir > 0 ? 1 : -1;
  const S = C.map((p, i) => { const q = C[Math.min(C.length - 1, i + 1)], o = C[Math.max(0, i - 1)]; let tx = o.x - q.x, ty = o.y - q.y; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl; return { x: p.x, y: p.y, nx: -ty * belly, ny: tx * belly, tx, ty, w: p.w, a: arc[i] }; });
  const edge = k => S.map(p => [p.x + p.nx * p.w * k, p.y + p.ny * p.w * k]);
  const band = (k0, k1) => { const A = edge(k0), B = edge(k1).reverse(); ctx.beginPath(); A.concat(B).forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); };
  const along = (ox, oy, wk, col) => { const A = S.map(p => [p.x + ox * p.w + p.nx * p.w * wk, p.y + oy * p.w + p.ny * p.w * wk]), B = S.map(p => [p.x + ox * p.w - p.nx * p.w * wk, p.y + oy * p.w - p.ny * p.w * wk]).reverse(); ctx.beginPath(); A.concat(B).forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); };
  ctx.save(); ctx.translate(2.5, 4); band(-1, 1); ctx.fillStyle = '#0006'; ctx.fill(); ctx.restore();
  ctx.save(); band(-1, 1); ctx.fillStyle = K.base; ctx.fill(); ctx.clip();
  band(-1, -.45); ctx.fillStyle = K.dark; ctx.fill(); band(-.45, .38); ctx.fillStyle = K.mid; ctx.fill(); band(.42, 1.05); ctx.fillStyle = K.belly; ctx.fill();
  ctx.strokeStyle = K.seam; ctx.lineWidth = .7; ctx.beginPath();
  for (let i = 0, next = 0; i < S.length; i++) if (S[i].a >= next) { next += 3.2; const p = S[i]; ctx.moveTo(p.x + p.nx * p.w * .44, p.y + p.ny * p.w * .44); ctx.lineTo(p.x + p.nx * p.w * 1.05, p.y + p.ny * p.w * 1.05); }
  ctx.stroke();
  const scales = new Path2D(), rims = new Path2D();
  for (let i = 0, next = 3; i < S.length; i++) if (S[i].a >= next) { next += 3.3; const p = S[i];
    for (const across of [-.65, -.12, .28]) { const cx = p.x + p.nx * p.w * across, cy = p.y + p.ny * p.w * across, r = p.w * .27;
      scales.moveTo(cx - p.nx * r, cy - p.ny * r); scales.quadraticCurveTo(cx - p.tx * 2.3, cy - p.ty * 2.3, cx + p.nx * r, cy + p.ny * r);
      rims.moveTo(cx - p.nx * r - .3, cy - p.ny * r - .4); rims.quadraticCurveTo(cx - p.tx * 1.8 - .3, cy - p.ty * 1.8 - .4, cx + p.nx * r - .3, cy + p.ny * r - .4); } }
  ctx.strokeStyle = K.scaleDark; ctx.lineWidth = .55; ctx.stroke(scales); ctx.strokeStyle = K.scaleRim; ctx.lineWidth = .4; ctx.stroke(rims);
  along(.5, .65, .75, K.under); along(-.3, -.4, .4, K.hi1); along(-.38, -.5, .14, K.hi2); along(-.42, -.53, .04, K.hi3);
  ctx.restore(); band(-1, 1); ctx.strokeStyle = K.outline; ctx.lineWidth = .7; ctx.stroke();
}
const MOODS = (g, l) => {
  const t = g.time, tell = g.rules.tell;
  switch (l.mood) {
    case 'blink': { if (l.stage !== 'peek') return 'idle'; const k = Math.floor(t * 2.2 + l.id) % 4; return k === 3 ? 'blink' : k === 1 ? 'taste' : 'idle'; }
    case 'hiss': { const q = l.t / tell; return q < .4 ? 'hunt' : q > .8 && Math.floor(t * 14) % 2 ? 'snarl' : 'hiss'; }
    case 'strike': return 'strike';
    case 'chew': return Math.floor(t * 8) % 2 ? 'chew1' : 'chew0';
    case 'grin': return 'grin'; case 'hurt': return 'ouch'; case 'dizzy': return 'dizzy';
    default: return 'idle';
  }
};
// The head sits at the model's head point, drawn back into the recess while it is still inside the lip (no collider there).
function drawHead(ctx, g, l) {
  if (!SN || !ready({ img: SN.img })) return; const w = l.win, p = l.points[0], d = Math.abs(p.x - w.originX);
  const hide = d < 16 ? 14 * (1 - ease(d / 16)) : 0, retreat = l.stage === 'retreat', turn = retreat ? clamp01(l.t / .16) : 0;
  const sx = retreat ? Math.cos(Math.PI * turn) * w.dir : w.dir, side = sx > 0 ? 'r' : 'l';
  const nx = l.points[1], tilt = !retreat && nx ? Math.max(-.45, Math.min(.45, Math.atan2(p.y - nx.y, (p.x - nx.x) * w.dir))) * w.dir : 0;
  const ex = l.expr || MOODS(g, l), size = SN.unit * HEAD, c = SN.cell, bob = l.stage === 'hiss' ? -1.1 : 0;
  ctx.save(); ctx.translate(p.x - w.dir * hide, p.y + bob + Math.sin(g.time * 3.2 + l.id) * .5); ctx.rotate(tilt + (l.mood === 'dizzy' ? Math.sin(g.time * 5) * .12 : 0)); ctx.scale(Math.max(.05, Math.abs(sx)), 1);
  ctx.drawImage(SN.img, SN.expr[ex] * c, SN.dir[side] * c, c, c, -size / 2, -size / 2, size, size); ctx.restore();
}
function drawLunge(ctx, g, l) { drawBody(ctx, l, g.time); drawHead(ctx, g, l); }
function biteBand(ctx, g, w, a, t) {
  if (a <= .01) return; const x0 = w.originX + w.dir * 12, x1 = w.originX + w.dir * (LUNGE.reach + LUNGE.headR + 8), pulse = .75 + .25 * Math.sin(g.time * (10 + 14 * a));
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const v = ctx.createLinearGradient(0, w.y - 15, 0, w.y + 15); v.addColorStop(0, '#ff5a4a00'); v.addColorStop(.5, `rgba(255,96,86,${(.16 + .5 * a) * pulse})`); v.addColorStop(1, '#ff5a4a00');
  const h = ctx.createLinearGradient(x0, 0, x1, 0); h.addColorStop(0, '#ff8a6a'); h.addColorStop(1, '#ff4a6a'); ctx.fillStyle = v; ctx.fillRect(Math.min(x0, x1), w.y - 15, Math.abs(x1 - x0), 30);
  glow(ctx, w.originX + w.dir * 16, w.y, 46, '#ff6a4a', (.2 + .55 * a) * pulse);
  ctx.restore(); ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; const span = Math.abs(x1 - x0), gap = 30, off = (g.time * (60 + 120 * a)) % gap;
  for (let s = off - gap; s < span; s += gap) { const x = x0 + w.dir * s, f = clamp01(s / 24) * clamp01((span - s) / 40); if (f <= 0) continue;
    ctx.globalAlpha = f * (.35 + .6 * a); ctx.beginPath(); ctx.moveTo(x - w.dir * 6, w.y - 8); ctx.lineTo(x + w.dir * 3, w.y); ctx.lineTo(x - w.dir * 6, w.y + 8);
    ctx.strokeStyle = '#ff5a6a88'; ctx.lineWidth = 6; ctx.stroke(); ctx.strokeStyle = '#ffd0d8'; ctx.lineWidth = 2.2; ctx.stroke(); }
  ctx.restore();
}
function roseArc(ctx, x, y, dir, a, g) {
  if (a <= .01) return; const h = 36, bulge = 16 * dir, pulse = .85 + .15 * Math.sin(g.time * 6 + x);
  glow(ctx, x + bulge * .6, y, 52, '#ff9ec0', .5 * a * pulse);
  ctx.save(); ctx.globalAlpha = Math.min(1, a);
  const gr = ctx.createLinearGradient(0, y - h, 0, y + h); gr.addColorStop(0, '#ffd9e6e0'); gr.addColorStop(.5, '#ff8fb8d0'); gr.addColorStop(1, '#ffd9e6e0');
  ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(x, y - h); ctx.quadraticCurveTo(x + bulge * 2.6, y, x, y + h); ctx.quadraticCurveTo(x + bulge * 1.2, y, x, y - h); ctx.fill();
  ctx.fillStyle = '#fff6'; ctx.beginPath(); ctx.moveTo(x + bulge * .3, y - h * .8); ctx.quadraticCurveTo(x + bulge * 1.8, y - h * .1, x + bulge * .9, y + h * .1); ctx.quadraticCurveTo(x + bulge * 1.4, y - h * .2, x + bulge * .3, y - h * .8); ctx.fill();
  note(ctx, x + bulge * 1.6, y + 4, 9, '#ffe6a8'); ctx.restore();
}
// ---------- effects ----------
// Crumbs are the rendered stone chips, small.
function crumbs(ctx, e, n, spread) { chips(ctx, e.x, e.y, e.age, e.life, n, spread * 2, .55, 4, .6); }
function lEffects(ctx, g, art, pre) {
  for (const e of g.effects) {
    if ((e.kind === 'chomp') !== !!pre) continue;
    const q = e.age / e.life, a = 1 - q; ctx.save(); ctx.globalAlpha = a;
    switch (e.kind) {
      case 'window-peek': { const w = g.windows.find(w => Math.abs(w.originX - e.x) < 1 && Math.abs(w.y - e.y) < 1); if (w) { ctx.globalAlpha = 1; glow(ctx, w.originX + w.dir * 4, w.y, 26, '#a6f0a0', .4 * Math.sin(Math.PI * q)); } break; }
      case 'bite-warning': case 'paddle': break;
      case 'chomp': { const k = 1 - q * .35; ctx.save(); ctx.translate(e.x, e.y); ctx.scale(k, k); lbrick(ctx, { x: -e.w / 2, y: -e.h / 2, w: e.w, h: e.h, colour: e.colour }); ctx.restore(); ctx.globalAlpha = a; crumbs(ctx, e, 4, 34); dust(ctx, e.x, e.y, e.age, e.life, 3, 14, 7, '#9a8fb8'); break; }
      case 'brick-break': {
        if (e.type === 'bar') { for (let n = 0; n < 4; n++) { const t = e.age, x = e.x + (n - 1.5) * (7 + t * 40), y = e.y - 40 * t + 260 * t * t; ctx.save(); ctx.translate(x, y); ctx.rotate((n - 1.5) * t * 6); ctx.fillStyle = '#9aa2bc'; ctx.fillRect(-1.3, -8, 2.6, 16); ctx.fillStyle = '#e4e8f6'; ctx.fillRect(-1.3, -8, .9, 16); ctx.restore(); } sparks(ctx, e.x, e.y, e.age, 6, 60, ['#ffe3a1', '#fff'], 1.6, 3); break; }
        const s = SPR[`brick_${BRICK[e.colour] || 'v'}_2_0`]; if (!ready(s)) break;
        for (let n = 0; n < 3; n++) { const t = e.age, x = e.x + (n - 1) * (8 + t * 45), y = e.y - 45 * t + 180 * t * t, iw = s.img.naturalWidth, ih = s.img.naturalHeight, m = iw * .1; ctx.save(); ctx.translate(x, y); ctx.rotate((n - 1) * t * 5);
          ctx.drawImage(s.img, m + n * (iw - 2 * m) / 3, ih * .17, (iw - 2 * m) / 3, ih * .66, -e.w / 6, -e.h / 2, e.w / 3, e.h); ctx.restore(); }
        break; }
      case 'brick-hit': sparks(ctx, e.x, e.y, e.age, e.type === 'bar' ? 8 : 5, e.type === 'bar' ? 70 : 34, ['#fff2c8', '#e7c77f'], 1.5, 3); break;
      case 'swallow': { ctx.globalAlpha = 1; const s = 1 - q; glow(ctx, e.x, e.y, 30 * (1 + q), '#ff4a5a', .5 * a); if (art.images.ball) ctx.drawImage(art.images.ball, e.x - 10 * s, e.y - 10 * s, 20 * s, 20 * s); star(ctx, e.x, e.y - 16 - q * 14, 4 * a + 1, q * 6, '#ffd0d8'); break; }
      case 'snake-hurt': { ctx.globalAlpha = 1; glow(ctx, e.x, e.y, 36, '#fff4c8', .7 * a); for (let i = 0; i < 4; i++) { const t = g.time * 7 + i * Math.PI / 2; star(ctx, e.x + Math.cos(t) * 20, e.y - 18 + Math.sin(t) * 6, 4.2, t, i % 2 ? '#ffe08f' : '#fff'); } break; }
      case 'shield-block': { ctx.globalAlpha = 1; glow(ctx, e.x, e.y, 56, '#ffb0cc', .7 * a); for (let i = 0; i < 9; i++) { const ang = -Math.PI * (.1 + .8 * rnd(i, 3)) * 2 + Math.PI * .5, v = 90 * (.4 + rnd(i, 4)), t = e.age; ctx.save(); ctx.translate(e.x + Math.cos(ang) * v * t, e.y + Math.sin(ang) * v * t + 120 * t * t); ctx.rotate(t * 8 * (rnd(i, 5) - .5)); ctx.globalAlpha = a; ctx.fillStyle = i % 2 ? '#ffd0e0' : '#ff8fb8'; ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(3.4, 3); ctx.lineTo(-3, 4); ctx.fill(); ctx.restore(); } break; }
      case 'lullaby': { ctx.globalAlpha = 1; for (let i = 0; i < 2; i++) { const k = clamp01(q * 1.2 - i * .18); wave(ctx, g.width / 2, 330, 60 + k * 300, 60, '#a89cf0', (1 - k) * .5, .75); } for (let i = 0; i < 6; i++) note(ctx, 60 + i * 48 + Math.sin(e.age * 4 + i) * 6, 360 - e.age * 70 - (i % 3) * 22, 11, i % 2 ? '#f6c7e6' : '#c9bcff'); break; }
      case 'songshield': ctx.globalAlpha = 1; wave(ctx, e.x, e.y - 6, 14 + e.age * 120, 22, '#ff9ec0', a * .6, .35); sparks(ctx, e.x, e.y, e.age, 10, 90, ['#ffd0e0', '#ffe6a8'], 2, 17); break;
      case 'starlight': ctx.globalAlpha = 1; for (let i = 0; i < 12; i++) { const x = e.x + (rnd(i, 1) - .5) * 120, y = e.y - e.age * (80 + 120 * rnd(i, 2)); star(ctx, x, y, 2.5 + 2.5 * rnd(i, 3), e.age * 3, i % 2 ? '#ffe6a8' : '#fff8dd'); } glow(ctx, e.x, e.y, 60, '#ffe6a8', a * .5); break;
      case 'note-wide': case 'note-multi': case 'note-ram': { ctx.globalAlpha = 1; const col = { 'note-wide': '#7fc4ff', 'note-multi': '#7fe0a0', 'note-ram': '#ff9ec0' }[e.kind]; glow(ctx, e.x, e.y, 44, col, a * .6); sparks(ctx, e.x, e.y, e.age, 8, 70, [col, '#fff'], 2, 23); note(ctx, e.x, e.y - 8 - e.age * 30, 11, '#fff4cc'); break; }
      case 'bell-ring': { ctx.globalAlpha = 1; for (let i = 0; i < 2; i++) wave(ctx, e.x, e.y, 22 + (q - i * .12) * 120, 20, '#ffd883', Math.max(0, a - i * .2) * .7); sparks(ctx, e.x, e.y, e.age, 12, 110, ['#ffe3a1', '#fff'], 2, 31); for (let i = 0; i < 3; i++) note(ctx, e.x - 26 + i * 26, e.y - 20 - e.age * (50 + 12 * i), 10, '#fff0c8'); break; }
      case 'hatch-open': { ctx.globalAlpha = 1; const k = Math.sin(Math.PI * clamp01(q)); const gr = ctx.createLinearGradient(0, 130, 0, 380); gr.addColorStop(0, '#ffe9b8'); gr.addColorStop(1, '#ffe9b800'); ctx.save(); ctx.globalAlpha = .26 * k; ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(70, 130); ctx.lineTo(290, 130); ctx.lineTo(340, 380); ctx.lineTo(20, 380); ctx.fill(); ctx.restore(); glow(ctx, 180, 132, 160, '#ffe3a0', .55 * k); dust(ctx, 180, 140, e.age, e.life, 8, 120, 16, '#c9b8a0'); break; }
      case 'ram-armed': ctx.globalAlpha = 1; wave(ctx, e.x, e.y + 7, 18 + e.age * 80, 14, '#ffd0e0', a * .8, .35); glow(ctx, e.x, e.y + 7, 50, '#ff9ec0', a * .5); break;
      case 'ram-launch': ctx.globalAlpha = 1; wave(ctx, e.x, e.y, 12 + e.age * 130, 22, '#ffc0dc', a * .8); glow(ctx, e.x, e.y, 60, '#ff9ec0', a * .7); for (let i = 0; i < 4; i++) note(ctx, e.x - 30 + i * 20, e.y - e.age * 90 - i * 8, 10, '#fff0c8'); sparks(ctx, e.x, e.y, e.age, 16, 200, ['#ffd0e0', '#ffe2a0', '#fff'], 2.4, 37); break;
      case 'ram-end': ctx.globalAlpha = 1; glow(ctx, e.x, e.y, 30, '#ff9ec0', a * .5); sparks(ctx, e.x, e.y, e.age, 6, 60, ['#ffd0e0'], 1.8, 41); break;
      default: sparks(ctx, e.x, e.y, e.age, 6, 40, ['#f0e0b4'], 1.6);
    }
    ctx.restore();
  }
}
function lBall(ctx, g, art, b) {
  const ram = b.ram > 0, sp = Math.hypot(b.vx, b.vy) || 1, ux = b.vx / sp, uy = b.vy / sp;
  if (!ram) { if (!b.caught) { const tr = ctx.createLinearGradient(b.x, b.y, b.x - ux * 22, b.y - uy * 22); tr.addColorStop(0, '#eaf8ff99'); tr.addColorStop(1, '#eaf8ff00'); ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = tr; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x - ux * 22, b.y - uy * 22); ctx.stroke(); ctx.restore(); } ctx.drawImage(art.images.ball, b.x - 10, b.y - 10, 20, 20); return; }
  // Song-note sphere: a rose-glass orb with a gold note, a pink halo that drains over its 2.5 s and a trail of drifting notes.
  const r = b.r, x = b.x, y = b.y, left = clamp01(b.ram / 2.5), ang = Math.atan2(b.vy, b.vx);
  glow(ctx, x, y, r * (2 + 1.6 * left), '#ff8fc0', .5 + .1 * Math.sin(g.time * 14));
  if (!b.caught) { ctx.save(); ctx.translate(x, y); ctx.rotate(ang); const L = 58, tg = ctx.createLinearGradient(0, 0, -L, 0); tg.addColorStop(0, '#ffc0dccc'); tg.addColorStop(1, '#ffc0dc00'); ctx.fillStyle = tg; ctx.beginPath(); ctx.moveTo(0, -r * .9); ctx.lineTo(-L, -r * .2); ctx.lineTo(-L, r * .2); ctx.lineTo(0, r * .9); ctx.fill(); ctx.restore();
    for (let i = 0; i < 3; i++) { const t = (g.time * 2 + i / 3) % 1; ctx.globalAlpha = (1 - t) * .8; note(ctx, x - ux * (14 + t * 40) + Math.sin(t * 9 + i) * 5, y - uy * (14 + t * 40) - t * 12, 8, '#fff0c8'); } ctx.globalAlpha = 1; }
  const sg = ctx.createRadialGradient(x - r * .35, y - r * .4, r * .1, x, y, r); sg.addColorStop(0, '#fff'); sg.addColorStop(.28, '#ffd0e4'); sg.addColorStop(.65, '#e8709f'); sg.addColorStop(1, '#6a1f4a'); ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  note(ctx, x - r * .12, y + r * .22, r * .95, '#f6cf7a'); ctx.fillStyle = '#ffffffcc'; ctx.beginPath(); ctx.ellipse(x - r * .38, y - r * .44, r * .2, r * .11, -.6, 0, 7); ctx.fill();
}
function lCapsule(ctx, g, c) {
  const key = { wide: 'cap_wide', multi: 'cap_split', ram: 'cap_laser' }[c.kind], col = { wide: '#7fc4ff', multi: '#7fe0a0', ram: '#ff9ec0' }[c.kind], s = SPR[key], t = g.time * 6 + c.id;
  glow(ctx, c.x, c.y, 26, col, .4 + .1 * Math.sin(t));
  for (let i = 1; i < 4; i++) { ctx.globalAlpha = .5 / i; star(ctx, c.x + Math.sin(t + i) * 3, c.y - i * 7, 1.8, t, '#fff4cc'); } ctx.globalAlpha = 1;
  if (ready(s)) ctx.drawImage(s.img, c.x - 17, c.y - 9, 34, 18.4);
  note(ctx, c.x - 2.5, c.y + 3.6, 9, '#fff4d0');
}
function songBars(ctx, g) {
  const p = g.paddle, rows = [[g.calm / LUMI_TIMING.calm, '#b9a8ef'], [g.shield ? g.shield.remaining / LUMI_TIMING.shield : 0, g.shield?.used ? '#8a6a7a' : '#f0a7c4'], [p.wide / LUMI_TIMING.wide, '#7fc4ff'], [g.notes / 6, '#f4d98c']].filter(r => r[0] > 0);
  rows.forEach(([f, col], i) => { const y = p.y + p.h + 12 + i * 5; ctx.fillStyle = '#0c0a18cc'; ctx.beginPath(); ctx.roundRect(p.x - 28, y, 56, 3.4, 2); ctx.fill(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(p.x - 28, y, 56 * clamp01(f), 3.4, 2); ctx.fill(); });
}
const dozeFor = (g, st) => {
  if (g.calm <= 0 || !g.windows.length) { st.doze = null; return null; }
  if (!st.doze || !g.windows.includes(st.doze)) { const lw = g.lunges[0]?.win, ball = g.balls.find(b => !b.caught) || g.paddle; st.doze = lw || g.windows.reduce((a, w) => Math.abs(w.y - ball.y) < Math.abs(a.y - ball.y) ? w : a); }
  return st.doze;
};
const STATE = new WeakMap();
export function renderLumi(ctx, g, art) {
  const st = STATE.get(g) || STATE.set(g, {}).get(g), W = g.width, H = g.height;
  const climb = g.phase === 'climb', arrive = g.floor > 0 && !climb && g.phase !== 'escape' && g.floorTime < .7;
  const pan = climb ? smooth(1 - g.transition / LUMI_TIMING.climb) * CLIMB : arrive ? -(1 - smooth(g.floorTime / .7)) * CLIMB : 0, alpha = climb || arrive ? 1 - .85 * Math.abs(pan) / CLIMB : 1;
  // Wall (scrolling with the camera) and, on the roof, the night sky between the pillars.
  const T = 88, tile = wallTile(); for (let y = ((pan % T) + T) % T - T; y < H + 60; y += T) ctx.drawImage(tile, 0, y, 360, T + .5);
  const sky = g.floor === 2 || g.phase === 'escape' ? 1 : g.floor === 1 && climb ? ease(1 - g.transition / LUMI_TIMING.climb) : 0;
  if (sky > 0) { ctx.save(); ctx.globalAlpha = sky; ctx.beginPath(); ctx.rect(52, -60, 256, H + 60); ctx.clip(); ctx.drawImage(skyPlate(W, H + 60), 0, -60, W, H + 60); ctx.restore(); }
  ctx.drawImage(vignette(W, H), 0, 0, W, H);
  ctx.save(); ctx.translate(0, pan); ctx.globalAlpha = alpha;
  for (const [x, y] of [[26, 210], [334, 250], [26, 540], [334, 580]]) lantern(ctx, g, x, y);
  if (g.floor === 0) floorCell(ctx, art, g); else if (g.floor === 1) floorSerpent(ctx, art, g); else floorRoof(ctx, art, g);
  // Windows: back recess, serpent clipped to the opening, front arch. The dozing Gnash peeks from one window under Lullaby.
  const doze = dozeFor(g, st), dz = doze && !g.lunges.some(l => l.win === doze) ? { win: doze, id: 7, stage: 'doze', mood: 'dizzy', t: 0, points: [{ x: doze.originX + doze.dir * (7 + Math.sin(g.time * 1.6) * 2), y: doze.y + Math.sin(g.time * 1.3) * 1.5, r: LUNGE.headR }], expr: 'dizzy' } : null;
  const live = [...g.lunges, ...(dz ? [dz] : [])], warm = g.shield && !g.shield.used;
  for (const w of g.windows) {
    const l = live.find(l => l.win === w), x = w.originX, y = w.y;
    ctx.save(); ctx.translate(x, y); ctx.scale(WS, WS);
    drawCastleWindow(ctx, 0, 0, l ? gi => { gi.save(); gi.scale(1 / WS, 1 / WS); gi.translate(-x, -y); glow(gi, x + w.dir * 4, y, 24, '#9fe8a0', .18); drawLunge(gi, g, l); gi.restore(); } : null);
    ctx.restore();
    if (warm) glow(ctx, x + w.dir * 2, y, 44, '#ff9ec0', .3 + .1 * Math.sin(g.time * 5));
  }
  for (const b of g.bricks) if (b.hp > 0 && b.type === 'brick') lbrick(ctx, b);
  hatchBars(ctx, g);
  lEffects(ctx, g, art, true);
  for (const e of g.effects) if (e.kind === 'bite-warning') { const w = g.windows.find(w => w.row === e.row && w.side === e.side); if (w) biteBand(ctx, g, w, clamp01(e.age / e.life) ** 1.3, e.age); }
  for (const l of g.lunges) if (l.stage === 'strike' || l.stage === 'chew') biteBand(ctx, g, l.win, l.stage === 'strike' ? .9 : Math.max(0, .5 - l.t), 1);
  // Emerged serpent: the same path, beyond the opening edge, in front of the frame.
  for (const l of live) { const w = l.win, dir = w.dir; ctx.save(); ctx.beginPath(); if (dir > 0) ctx.rect(w.originX + HALF, -60, W, H + 120); else ctx.rect(w.originX - HALF - W, -60, W, H + 120); ctx.clip(); drawLunge(ctx, g, l); ctx.restore(); }
  for (const l of g.lunges) if (l.teaching && l.stage === 'hiss') { const w = l.win; ctx.save(); ctx.fillStyle = '#0b0a18cc'; ctx.beginPath(); ctx.roundRect(180 - 60, w.y - 40, 120, 17, 8); ctx.fill(); text(ctx, 'SAFE THIS TIME', 180, w.y - 31, 11, '#ffd0d8', 'center'); ctx.restore(); }
  if (g.shield) for (const w of g.windows) { const l = g.lunges.find(l => l.win === w), primed = l && !g.shield.used && (l.stage === 'hiss' || l.stage === 'strike'), a = g.shield.used ? 0 : primed ? 1 : .34; roseArc(ctx, w.originX + w.dir * (LUNGE.out + 61), w.y, w.dir, a, g); }
  if (doze) for (let i = 0; i < 3; i++) { const t = (g.time * .5 + i / 3) % 1; ctx.globalAlpha = Math.sin(Math.PI * t) * clamp01(g.calm); text(ctx, 'z', doze.originX + doze.dir * (26 + i * 9), doze.y - 18 - t * 34, 11 + i * 3, '#d9ccff', 'center'); ctx.globalAlpha = 1; }
  for (const c of g.capsules) lCapsule(ctx, g, c);
  lEffects(ctx, g, art);
  ctx.restore();
  // Climb: Lumi runs in place while the tower scrolls past.
  if (climb) charSprite(ctx, art, 'Running_A', g.time, 180, 330 - 26 * Math.sin(Math.PI * clamp01(1 - g.transition / LUMI_TIMING.climb)), { size: 62 });
  // Escape: she leaves the paddle, runs to the rope, jumps for it and is hoisted to Kit.
  let paddleA = 1;
  if (g.phase === 'escape' || g.state === 'won') {
    const t = g.state === 'won' ? LUMI_TIMING.escape : (1 - g.transition / LUMI_TIMING.escape) * LUMI_TIMING.escape, p = g.paddle, rx = RX - 6, start = p.x, endY = p.y;
    paddleA = 1 - smooth(t / .4);
    if (g.state === 'won') charSprite(ctx, art, 'Cheer', g.time, rx - 18, LEDGE + 2, { size: 56 });
    else if (t < .9) { const k = ease(t / .9); charSprite(ctx, art, 'Running_A', g.time, start + (rx - start) * k, endY + 6, { size: 56, flip: rx < start }); }
    else if (t < 1.2) charSprite(ctx, art, 'Jump_Full_Short', t - .9, rx, endY + 6 - 12 * Math.sin(Math.PI * (t - .9) / .3), { size: 56 });
    else charSprite(ctx, art, 'Cheer', g.time, rx, endY + 6 - (endY - 24 - (LEDGE + 2)) * ease((t - 1.2) / 1.2), { size: 56 });
  }
  // Lumi's rose-pearl skin, chosen over the older pink-gold render: less yellow and the same family as Kit's enamel.
  if (paddleA > .02) { ctx.save(); ctx.globalAlpha = paddleA; gPaddle(ctx, g, art, skinFor(art, 'lumi'), 'pip_rose'); songBars(ctx, g); ctx.restore(); }
  if (g.phase !== 'escape' && g.state !== 'won') for (const b of g.balls) if (!b.dead) lBall(ctx, g, art, b);
  // Floor chip and banner.
  const n = g.floor + 1 + (climb ? 1 : 0); ctx.save(); ctx.globalAlpha = .85; ctx.fillStyle = '#0b0a18cc'; ctx.beginPath(); ctx.roundRect(W / 2 - 40, 6, 80, 17, 8.5); ctx.fill(); ctx.strokeStyle = '#d6a35f88'; ctx.lineWidth = .8; ctx.stroke(); ctx.restore();
  text(ctx, `FLOOR ${Math.min(3, n)} / 3`, W / 2, 15, 10.5, '#f3dca8', 'center');
  if (climb) gBanner(ctx, g, `FLOOR ${n} / 3 · ${LUMI_FLOORS[Math.min(2, n - 1)].toUpperCase()}`, Math.min(1, (1 - g.transition / LUMI_TIMING.climb) * 4));
  else if (g.floorTime < 1.6 && g.phase !== 'escape' && g.state === 'play') gBanner(ctx, g, `FLOOR ${n} / 3 · ${LUMI_FLOORS[g.floor].toUpperCase()}`, g.floor ? Math.min(1, (1.6 - g.floorTime) * 1.6) : 1);
}
// Shared with the Serpent Rivals renderer (rivals-render.js).
export { star, wave, note, lantern, ledge };
