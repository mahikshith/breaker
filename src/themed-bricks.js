// Themed bricks (art/themed-bricks/build.py): each princess chapter's own brick set at glaze-v2 quality (frost ice glass,
// heraldic enamel, bell bronze, tower stone and serpent scale, moonstone, vault iron), packed as ART.themedBricks.
// Sprites are keyed by chapter, material, cells (1 square, 2 wide) and state (0 intact, 1 cracked, 2 breaking); each
// carries the glaze-v2 4-unit margin round its face. Every draw returns false while a sprite is missing or decoding,
// so each chapter keeps its current art as the fallback. ?themed=0 turns the sets off for side-by-side shots.
// The break and hit effects cut their pieces and chips from the brick's own sprites and throw a spray baked once per
// material (rime glitter, gilt flecks, forge embers, rune motes, moon glints). Every particle is closed-form in the
// effect's age with a seeded hash: nothing is allocated per frame.
import { ART } from './vault-art.js';
import { loadImg } from './gfx.js';

const OFF = typeof location !== 'undefined' && /[?&]themed=0\b/.test(location.search);
const TAU = Math.PI * 2;
const hash = (i, s) => { const v = Math.sin(i * 127.1 + s * 311.7 + 1.7) * 43758.5453; return v - Math.floor(v); };
// SETS[chapter][material] = { palette, cells: { 1: [s0, s1, s2], 2: [s0, s1, s2] }, fx }
const SETS = {};
if (!OFF) for (const [ch, set] of Object.entries(ART?.themedBricks || {})) {
  const out = SETS[ch] = {};
  for (const [key, s] of Object.entries(set.sprites)) {
    const [mat, cells, state] = key.split('_'), m = out[mat] ||= { palette: set.palette[mat], cells: {}, fx: null };
    (m.cells[cells] ||= [])[+state] = { ...s, img: loadImg(s.url), vault: null };
  }
}
const ok = s => !!(s && s.img.complete && s.img.naturalWidth);
// The sprite for a material, cells and state; a missing cracked or breaking frame falls back to the intact one.
export function themed(ch, mat, cells = 2, state = 0) {
  const c = SETS[ch]?.[mat]?.cells[cells]; if (!c) return null;
  const s = c[state]; return ok(s) ? s : state && ok(c[0]) ? c[0] : null;
}
export const hasThemed = (ch, mat) => !!SETS[ch]?.[mat];
// The sprite as a Vault art record (units: margin offset and full drawn size), for the Vault-grid chapters.
export function themedArt(ch, mat, cells, state = 0) {
  const s = themed(ch, mat, cells, state); if (!s) return null;
  return s.vault ||= { img: s.img, ox: s.margin, oy: s.margin, iw: s.uw, ih: s.uh };
}
function put(g, s, x, y, w, h) {
  const m = s.margin, kx = w / (s.uw - 2 * m), ky = h / (s.uh - 2 * m);
  g.drawImage(s.img, x - m * kx, y - m * ky, s.uw * kx, s.uh * ky);
}
// A brick's face fitted to its collider rect (x, y, w, h); cells follows the rect's shape unless given.
export function drawThemed(g, ch, mat, x, y, w, h, state = 0, cells = w > h * 1.4 ? 2 : 1) {
  const s = themed(ch, mat, cells, state) || themed(ch, mat, 3 - cells, state); if (!s) return false;
  put(g, s, x, y, w, h); return true;
}
// An unbreakable bar of any length: wide rects tile 2-cell segments (and one 1-cell end when the count is odd); tall
// rects stack 1-cell blocks.
export function drawThemedBar(g, ch, x, y, w, h) {
  const one = themed(ch, 'bar', 1), two = themed(ch, 'bar', 2); if (!one || !two) return false;
  if (h > w * 1.4) { const n = Math.max(1, Math.round(h / w)), k = h / n; for (let i = 0; i < n; i++) put(g, one, x, y + i * k, w, k); return true; }
  const n = Math.max(1, Math.round(w / h)), k = w / n;
  let i = 0; for (; i + 2 <= n; i += 2) put(g, two, x + i * k, y, k * 2, h);
  if (i < n) put(g, one, x + i * k, y, k, h);
  return true;
}

// ---------- break and hit effects ----------
function canvas(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); if (g) draw(g, w, h); return c; }
const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${n >> 8 & 255},${n & 255},${a})`; };
// Chips cut from the intact face (three irregular outlines from its lit upper half, darker underside), and one spray
// sprite per material kind. Baked on first use.
const CHIP = [[[.1, .2], [.95, 0], [.8, .85], [0, 1]], [[0, .1], [1, .35], [.45, 1]], [[.2, 0], [1, .2], [.9, 1], [0, .75]]];
function fxFor(m, s) {
  if (m.fx) return m.fx;
  const [light, mid, dark, kind] = m.palette, P = 32, img = s.img, iw = img.naturalWidth, ih = img.naturalHeight;
  const chips = CHIP.map((poly, k) => canvas(P, P, g => {
    const path = () => { g.beginPath(); poly.forEach(([u, v], i) => i ? g.lineTo(3 + u * (P - 6), 3 + v * (P - 6)) : g.moveTo(3 + u * (P - 6), 3 + v * (P - 6))); g.closePath(); };
    g.save(); g.translate(1.5, 2.5); path(); g.fillStyle = 'rgba(0,0,0,.45)'; g.fill(); g.restore();
    g.save(); path(); g.clip(); g.drawImage(img, iw * (.22 + k * .2), ih * .26, iw * .2, ih * .3, 0, 0, P, P);
    const sh = g.createLinearGradient(0, 0, P, P); sh.addColorStop(0, 'rgba(255,255,255,.45)'); sh.addColorStop(.45, 'rgba(255,255,255,0)'); sh.addColorStop(1, rgba(dark, .45));
    g.fillStyle = sh; g.fillRect(0, 0, P, P); g.restore();
  }));
  let spray, add = false;
  if (kind === 'ice') spray = canvas(32, 32, g => {   // a rime crystal: six soft arms and a bright core
    g.translate(16, 16); for (let i = 0; i < 6; i++) { g.rotate(TAU / 6); const l = g.createLinearGradient(0, 0, 0, -14); l.addColorStop(0, 'rgba(255,255,255,.95)'); l.addColorStop(1, rgba(light, 0)); g.fillStyle = l; g.beginPath(); g.moveTo(-1.6, 0); g.lineTo(0, -14); g.lineTo(1.6, 0); g.fill(); }
    const r = g.createRadialGradient(0, 0, 0, 0, 0, 6); r.addColorStop(0, '#fff'); r.addColorStop(1, rgba(light, 0)); g.fillStyle = r; g.fillRect(-6, -6, 12, 12);
  });
  else if (kind === 'enamel') spray = canvas(24, 24, g => {   // a gilt fleck: a tilted gold leaf with a lit edge
    g.translate(12, 12); g.rotate(.5); const l = g.createLinearGradient(-8, -5, 8, 5); l.addColorStop(0, '#fff1cc'); l.addColorStop(.4, '#d9a95c'); l.addColorStop(1, '#6a4512');
    g.fillStyle = l; g.beginPath(); g.moveTo(-9, 0); g.lineTo(0, -5); g.lineTo(9, 0); g.lineTo(0, 5); g.closePath(); g.fill();
  });
  else if (kind === 'forge' || kind === 'iron') { add = true; spray = canvas(48, 12, g => {   // a hot ember streak, white core to forge orange
    const hot = kind === 'forge' ? ['#ffb15a', '#ff6a1a'] : ['#fff2d2', '#ffb070'];
    const l = g.createLinearGradient(0, 6, 48, 6); l.addColorStop(0, rgba(hot[1], 0)); l.addColorStop(.7, rgba(hot[1], .55)); l.addColorStop(1, rgba(hot[0], 1));
    g.fillStyle = l; g.beginPath(); g.moveTo(0, 6); g.lineTo(40, 2.5); g.quadraticCurveTo(48, 6, 40, 9.5); g.closePath(); g.fill();
    const c = g.createRadialGradient(41, 6, 0, 41, 6, 5); c.addColorStop(0, '#fffaf0'); c.addColorStop(1, rgba(hot[0], 0)); g.fillStyle = c; g.fillRect(34, 0, 14, 12);
  }); }
  else { add = kind !== 'stone'; spray = canvas(32, 32, g => {   // a four-point glint (rune light, moon sparkle) or a stone grit puff
    const c = kind === 'stone' ? mid : light, r = g.createRadialGradient(16, 16, 0, 16, 16, 16); r.addColorStop(0, rgba(c, kind === 'stone' ? .7 : 1)); r.addColorStop(.35, rgba(c, .35)); r.addColorStop(1, rgba(c, 0));
    g.fillStyle = r; g.fillRect(0, 0, 32, 32);
    if (kind !== 'stone') { g.fillStyle = '#fff'; g.beginPath(); g.moveTo(16, 2); g.lineTo(17.4, 14.6); g.lineTo(30, 16); g.lineTo(17.4, 17.4); g.lineTo(16, 30); g.lineTo(14.6, 17.4); g.lineTo(2, 16); g.lineTo(14.6, 14.6); g.closePath(); g.fill(); }
  }); }
  return m.fx = { chips, spray, add, kind };
}
// One chip of a material at (x, y), turned by rot, size units across; false while the set is missing.
export function themedChip(g, ch, mat, variant, x, y, rot, size, alpha = 1) {
  const m = SETS[ch]?.[mat], s = themed(ch, mat, 2) || themed(ch, mat, 1); if (!s) return false;
  const fx = fxFor(m, s), c = fx.chips[variant % 3];
  g.save(); g.globalAlpha *= alpha; g.translate(x, y); g.rotate(rot); g.drawImage(c, -size / 2, -size / 2, size, size); g.restore(); return true;
}
function sprayAt(g, fx, cx, cy, t, life, n, speed, size, seed, vx, vy) {
  const k = 1 - t / life, sp = fx.spray;
  if (k <= 0) return;
  g.save(); if (fx.add) g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const a = -Math.PI * (.08 + .84 * hash(i, seed)), v = speed * (.45 + .8 * hash(i, seed + 1)), d = hash(i, seed + 2) * .12;
    const tt = t - d; if (tt <= 0) continue;
    const x = cx + (Math.cos(a) * v + vx) * tt, y = cy + (Math.sin(a) * v + vy) * tt + (fx.add ? 160 : 300) * tt * tt;
    const sz = size * (.55 + .7 * hash(i, seed + 3)) * (fx.kind === 'stone' ? 1 + tt * 2 : 1);
    g.globalAlpha = k * (fx.kind === 'stone' ? .5 : .95);
    if (fx.kind === 'forge' || fx.kind === 'iron') {   // streaks point along their flight
      const dx = Math.cos(a) * v + vx, dy = Math.sin(a) * v + vy + (fx.add ? 320 : 600) * tt;
      const r = Math.atan2(dy, dx); g.translate(x, y); g.rotate(r); g.drawImage(sp, -sz * 3.4, -sz * .45, sz * 4, sz); g.rotate(-r); g.translate(-x, -y);
    } else g.drawImage(sp, x - sz / 2, y - sz / 2, sz, sz);
  }
  g.restore();
}
// The breaking frame's three pieces (cut along its own gaps), in face units; the same cut as the Tidewheel sea bricks.
const PIECES = [[[-.1, -.1], [.5, -.1], [.515, .3], [.235, 1.1], [-.1, 1.1]], [[.515, .28], [.69, 1.1], [.235, 1.1]], [[.52, -.1], [1.1, -.1], [1.1, 1.1], [.69, 1.1], [.53, .28]]];
const KICK = [[-46, -70, -4.5], [4, -30, 2.5], [44, -62, 4]];
// A brick breaking, centred on (x, y): the breaking frame holds a beat, its three pieces tumble off under gravity with
// the ball's carry (vx, vy), three chips spin off the face and the material's spray bursts out. t is the effect's age.
export function themedBreak(g, ch, mat, x, y, w, h, t, life, vx = 0, vy = 0) {
  const m = SETS[ch]?.[mat], s = themed(ch, mat, 2, 2); if (!m || !s) return false;
  const intact = themed(ch, mat, 2, 0) || s, fx = fxFor(m, intact), a = Math.min(1, (life - t) / .25), hold = Math.max(0, t - .05);
  const mg = s.margin, fw = s.uw - 2 * mg, fh = s.uh - 2 * mg, kx = w / fw, ky = h / fh;
  g.save(); g.globalAlpha = (typeof g.globalAlpha === "number" ? g.globalAlpha : 1) * a;
  for (let i = 0; i < 3; i++) {
    const K = KICK[i], P = PIECES[i], px = x + (K[0] + vx) * hold, py = y + (K[1] + vy) * hold + 420 * hold * hold;
    g.save(); g.translate(px, py); g.rotate(K[2] * hold); g.translate(-w / 2, -h / 2);
    g.beginPath(); for (let k = 0; k < P.length; k++) k ? g.lineTo(P[k][0] * w, P[k][1] * h) : g.moveTo(P[k][0] * w, P[k][1] * h); g.closePath(); g.clip();
    g.drawImage(s.img, -mg * kx, -mg * ky, s.uw * kx, s.uh * ky); g.restore();
  }
  if (hold > 0) for (let i = 0; i < 3; i++) {
    const dir = i - 1 || .4, cx = x + dir * (6 + 70 * hold) + vx * hold, cy = y - 4 - (90 + 30 * i) * hold + 460 * hold * hold;
    g.save(); g.translate(cx, cy); g.rotate(dir * 9 * hold + i); const z = Math.min(w, h) * (.28 + .06 * i); g.drawImage(fx.chips[i], -z / 2, -z / 2, z, z); g.restore();
  }
  g.restore();
  sprayAt(g, fx, x, y, t, life, fx.kind === 'stone' ? 5 : 9, fx.add ? 150 : 110, fx.kind === 'forge' || fx.kind === 'iron' ? 3.2 : fx.kind === 'stone' ? 9 : 6, (Math.round(x * 3 + y) % 37) + 5, vx * .5, vy * .5);
  return true;
}
// A hit on a multi-hit brick: two small chips and a short burst of the material's spray.
export function themedHit(g, ch, mat, x, y, t, life) {
  const m = SETS[ch]?.[mat], s = themed(ch, mat, 2) || themed(ch, mat, 1); if (!m || !s) return false;
  const fx = fxFor(m, s), k = 1 - t / life;
  g.save(); g.globalAlpha *= k;
  for (let i = 0; i < 2; i++) { const dir = i ? 1 : -1; g.save(); g.translate(x + dir * (4 + 40 * t), y - 60 * t + 300 * t * t); g.rotate(dir * 7 * t); g.drawImage(fx.chips[i], -2.6, -2.6, 5.2, 5.2); g.restore(); }
  g.restore();
  sprayAt(g, fx, x, y, t, life, 5, fx.add ? 110 : 80, fx.add ? 2.6 : 4.5, (Math.round(x + y * 3) % 29) + 3, 0, 0);
  return true;
}
