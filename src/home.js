// Home (hero + one PLAY button) and the chapter map. Canvas only; main.js owns the loop, input and save data and hands
// this module an `env` (see createHome). Chapter progress rules are plain functions so tests can run them without a DOM.
import { text, rrect, shade, cached, FONT, NUM, loadImg, glazedBar } from './gfx.js';
import { ART } from './vault-art.js';
import { r3, r3ok } from './fantasy/r3.js';
import { HOME_ART } from './home-art.js';
import { store } from './prefs.js';
import { DIFFICULTY_IDS, difficulty } from './difficulty.js';

// ---------- story order and progress (pure) ----------
// The campaign as the menu shows it: LEVELS slots in story order. Save slots never move; the space chapters
// (0 Carrier, 2 Circuit, 3 Forge) keep their slots and ?level=N but are not listed.
export const STORY = [1, 4, 5, 6, 7, 8, 9, 10, 11];
const starsOf = (best, id, slot) => best?.[id]?.[slot] | 0;
// A chapter counts as cleared once any difficulty has a star on it; stars shown are the selected difficulty's.
export const cleared = (best, slot) => DIFFICULTY_IDS.some(id => starsOf(best, id, slot) > 0);
// Chapters open up to one past the furthest cleared chapter, so nothing already played ever shows a lock.
export function unlockedCount(best, unlockAll = false) {
  if (unlockAll) return STORY.length;
  let far = -1; STORY.forEach((slot, n) => { if (cleared(best, slot)) far = n; });
  return Math.min(STORY.length, far + 2);
}
// What PLAY starts: the first chapter not yet cleared; with everything cleared, the first one under three stars; else chapter 1.
export function playTarget(best, diff) {
  const open = STORY.findIndex(slot => !cleared(best, slot)); if (open >= 0) return open;
  const rest = STORY.findIndex(slot => starsOf(best, diff, slot) < 3); return rest >= 0 ? rest : 0;
}
export const starTotal = (best, diff) => STORY.reduce((a, slot) => a + starsOf(best, diff, slot), 0);
export const clearedCount = best => STORY.filter(slot => cleared(best, slot)).length;

// ---------- palette ----------
const NAVY = '#0a0c1c', COBALT = '#3f74e8', COBALT_D = '#1d3a9a', ICE = '#8fb2ff', STEEL = '#cfdcf5', PLAY_C = '#2fbf71';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = t => 1 - (1 - t) ** 3;

// ---------- small drawing helpers ----------
function spacing(g, px) { if ('letterSpacing' in g) g.letterSpacing = `${px}px`; }
function wrap(g, str, maxW, size, font, maxLines = 2) {
  g.font = `${size}px ${font}`; const words = str.split(' '), lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); return lines.slice(0, maxLines);
}
function star(g, x, y, r, on) {
  g.save(); g.translate(x, y);
  const path = () => { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.5 : r; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.closePath(); };
  g.fillStyle = 'rgba(0,0,0,0.4)'; g.translate(0, 1.6); path(); g.fill(); g.translate(0, -1.6);
  if (on) { const gr = g.createLinearGradient(0, -r, 0, r); gr.addColorStop(0, '#fff1b8'); gr.addColorStop(0.5, '#f6c244'); gr.addColorStop(1, '#c98a1d'); g.fillStyle = gr; }
  else g.fillStyle = 'rgba(40,48,86,0.9)';
  path(); g.fill(); g.lineJoin = 'round'; g.strokeStyle = on ? 'rgba(120,70,10,0.8)' : 'rgba(8,10,24,0.9)'; g.lineWidth = 1; g.stroke();
  if (on) { g.fillStyle = 'rgba(255,255,255,0.65)'; g.beginPath(); g.ellipse(-r * 0.25, -r * 0.38, r * 0.24, r * 0.11, -0.5, 0, 7); g.fill(); }
  g.restore();
}
function lockIcon(g, x, y, s, color = STEEL) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.strokeStyle = color; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.arc(0, -3, 6.5, Math.PI, 0); g.lineTo(6.5, 2); g.moveTo(-6.5, -3); g.lineTo(-6.5, 2); g.stroke();
  const gr = g.createLinearGradient(0, 0, 0, 14); gr.addColorStop(0, shade(color, 0.1)); gr.addColorStop(1, shade(color, -0.35));
  g.fillStyle = gr; rrect(g, -9, 1, 18, 13, 3.5); g.fill();
  g.fillStyle = 'rgba(10,14,36,0.85)'; g.beginPath(); g.arc(0, 6.5, 2, 0, 7); g.fill(); g.fillRect(-1, 6.5, 2, 4);
  g.restore();
}
function sparkle(g, x, y, r, a = 1, tint = '#fff6d0') { // a small four-point glint
  g.save(); g.translate(x, y); g.globalAlpha *= a; g.fillStyle = tint;
  g.beginPath(); for (let i = 0; i < 8; i++) { const ang = i * Math.PI / 4 - Math.PI / 2, rr = i % 2 ? r * 0.22 : r; g.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr); } g.closePath(); g.fill(); g.restore();
}

// Round glass icon button: dark glass, cobalt rim, vector glyph. 44 units is the floor for a touch target.
const ICONS = {
  sound(g, on) {
    g.fillStyle = STEEL; g.beginPath(); g.moveTo(-9, -4); g.lineTo(-4, -4); g.lineTo(2, -9); g.lineTo(2, 9); g.lineTo(-4, 4); g.lineTo(-9, 4); g.closePath(); g.fill();
    g.strokeStyle = STEEL; g.lineWidth = 2; g.lineCap = 'round';
    if (on) { g.beginPath(); g.arc(3, 0, 5, -0.9, 0.9); g.stroke(); g.beginPath(); g.arc(3, 0, 9.5, -0.9, 0.9); g.stroke(); }
    else { g.strokeStyle = '#ff8a96'; g.beginPath(); g.moveTo(6, -5); g.lineTo(13, 5); g.moveTo(13, -5); g.lineTo(6, 5); g.stroke(); }
  },
  full(g) { g.strokeStyle = STEEL; g.lineWidth = 2.4; g.lineCap = 'round'; g.lineJoin = 'round'; for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { g.beginPath(); g.moveTo(sx * 4, sy * 10); g.lineTo(sx * 10, sy * 10); g.lineTo(sx * 10, sy * 4); g.stroke(); } },
  back(g) { g.strokeStyle = STEEL; g.lineWidth = 3.2; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(3, -9); g.lineTo(-5, 0); g.lineTo(3, 9); g.stroke(); },
  help(g) { text(g, '?', 0, 1, 22, STEEL, 'center'); }, // reserved for the How to play entry (see topIcons)
};
function iconButton(g, env, icon, x, y, fn, arg, d = 44) {
  env.buttons().push({ x, y, w: d, h: d, fn });
  const cx = x + d / 2, cy = y + d / 2, r = d / 2 - 1;
  g.fillStyle = 'rgba(0,0,0,0.4)'; g.beginPath(); g.arc(cx + 1, cy + 3, r, 0, 7); g.fill();
  const gr = g.createLinearGradient(0, y, 0, y + d); gr.addColorStop(0, 'rgba(48,62,120,0.95)'); gr.addColorStop(1, 'rgba(16,22,52,0.95)');
  g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill();
  g.strokeStyle = 'rgba(143,178,255,0.45)'; g.lineWidth = 1.5; g.beginPath(); g.arc(cx, cy, r - 0.75, 0, 7); g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.14)'; g.beginPath(); g.ellipse(cx, y + d * 0.28, d * 0.3, d * 0.13, 0, 0, 7); g.fill();
  g.save(); g.translate(cx, cy); ICONS[icon](g, arg); g.restore();
}
// A glossy pill. `tone` is the face colour; `h` >= 44 for a touch target.
function pill(g, env, label, x, y, w, h, tone, fn, o = {}) {
  env.buttons().push({ x, y, w, h, fn });
  const r = h / 2, press = o.pulse || 0;
  g.save(); if (press) { g.translate(x + w / 2, y + h / 2); g.scale(1 + press, 1 + press); g.translate(-x - w / 2, -y - h / 2); }
  g.fillStyle = 'rgba(0,0,0,0.45)'; rrect(g, x + 1, y + 6, w, h, r); g.fill();
  g.fillStyle = shade(tone, -0.55); rrect(g, x, y + 4, w, h, r); g.fill();
  const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, shade(tone, 0.32)); gr.addColorStop(0.5, tone); gr.addColorStop(1, shade(tone, -0.22));
  g.fillStyle = gr; rrect(g, x, y, w, h, r); g.fill();
  if (o.rim) { g.strokeStyle = o.rim; g.lineWidth = 1.5; rrect(g, x + 0.75, y + 0.75, w - 1.5, h - 1.5, r - 0.75); g.stroke(); }
  g.fillStyle = 'rgba(255,255,255,0.42)'; rrect(g, x + h * 0.38, y + 3, w - h * 0.76, h * 0.2, h * 0.1); g.fill();
  if (o.shine != null) { // a soft light sweeping across the face
    g.save(); rrect(g, x, y, w, h, r); g.clip(); const sx = x - 60 + (w + 120) * o.shine, sg = g.createLinearGradient(sx - 30, 0, sx + 30, 0);
    sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,0.4)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = sg; g.transform(1, 0, -0.35, 1, 0, 0); g.fillRect(sx - 30 + 0.35 * (y + h / 2), y, 60, h); g.restore();
  }
  if (label) { spacing(g, o.track || 0); text(g, label, x + w / 2 + (o.track || 0) / 2, y + h / 2 + 1, o.size || 19, '#fff', 'center'); spacing(g, 0); }
  g.restore();
}

// ---------- chapter art (existing sprites only) ----------
const img = url => loadImg(url);
function sheetDraw(g, im, cw, ch, col, row, x, y, h, mirror = false) { // bottom-centre anchored frame of a sprite sheet
  if (!im.complete || !im.naturalWidth) return;
  const w = h * cw / ch; g.save(); g.translate(x, y); if (mirror) g.scale(-1, 1);
  g.drawImage(im, col * cw, row * ch, cw, ch, -w / 2, -h, w, h); g.restore();
}
const SNAKE = ART?.snakeEmerald, JADE = ART?.snakeJade, PRIN = ART?.princess, KIT = ART?.kit, WARD = ART?.frostWarden, EMBER = ART?.hoard?.['ember/windup'];
const snakeImg = SNAKE && img(SNAKE.url), jadeImg = JADE && img(JADE.url), prinImg = PRIN && img(PRIN.url), kitImg = KIT && img(KIT.url), wardImg = WARD && img(WARD.url), emberImg = EMBER && img(EMBER.url);
const snake = (g, im, S, x, y, h, expr, mirror) => S && sheetDraw(g, im, S.cell, S.cell, S.expr[expr], 0, x, y, h * 1.15, mirror);
const r3d = (g, key, x, y, h, mirror) => { const [set, k] = key.split('/'), im = r3(set, k); if (r3ok(im)) { const w = h * im.fw / im.fh; g.save(); g.translate(x, y); if (mirror) g.scale(-1, 1); g.drawImage(im, -w / 2, -h, w, h); g.restore(); } };
// Per chapter slot: draws the chapter's face (a villain or Lumi) into a box whose bottom-centre is (x, y), h tall.
const CHAPTER_ART = {
  1: (g, x, y, h, t) => snake(g, snakeImg, SNAKE, x, y + 4, h * 0.82, 'snarl', false),
  4: (g, x, y, h) => WARD && sheetDraw(g, wardImg, WARD.cell[0], WARD.cell[1], 3, 1, x, y + 4, h * 1.0),
  5: (g, x, y, h) => { snake(g, jadeImg, JADE, x + 4, y + 4, h * 0.82, 'strike', false); },
  6: (g, x, y, h) => r3d(g, 'korr/turn_front', x, y + 2, h * 0.92),
  7: (g, x, y, h) => r3d(g, 'nerra/smug', x, y + 2, h * 0.9),
  8: (g, x, y, h) => { r3d(g, 'korr/stomp_windup', x + 12, y + 2, h * 0.82); KIT && sheetDraw(g, kitImg, KIT.cell, KIT.cell, 0, 2, x - 36, y + 4, h * 0.62); },
  9: (g, x, y, h) => PRIN && sheetDraw(g, prinImg, PRIN.cell, PRIN.cell, 0, 3, x, y + 6, h * 1.0),
  10: (g, x, y, h) => { snake(g, snakeImg, SNAKE, x - 30, y + 4, h * 0.6, 'strike', false); snake(g, jadeImg, JADE, x + 30, y + 4, h * 0.6, 'strike', true); },
  11: (g, x, y, h) => EMBER && emberImg.complete && emberImg.naturalWidth && g.drawImage(emberImg, x - h * 0.45, y - h * 1.02, h * 0.9 * EMBER.uw / EMBER.uh * 1.0, h * 1.02),
};

const heroArt = loadImg(HOME_ART.url); // at module load, so main's artLoaded() waits for it

// ---------- the module ----------
// env: W, H() playable height, t() seconds, LEVELS, best() per-difficulty stars, diff(), selectDifficulty(id), play(slot),
// buttons() the frame's hit list, preview(slot, w, h) / hasPreview(slot), isMuted(), toggleSound(), canFull(), goFull(), native().
export function createHome(env) {
  const W = env.W, S = { view: 'home', scroll: 0, vel: 0, drag: null, taps: 0, tapAt: 0, built: 0, flash: 0 };
  const best = () => env.best();
  const unlockAll = () => !!store.get('unlockAll') || /[?&]unlock=1\b/.test(location.search);
  const slotOf = n => STORY[n];

  // dark calm backdrop shared by both views
  const bg = () => cached('home-bg' + env.H(), W, env.H(), g => {
    const H = env.H(), gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, '#171d3f'); gr.addColorStop(0.45, '#0f1330'); gr.addColorStop(1, '#070916');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
  });
  const BG_STOPS = [[0, [23, 29, 63]], [0.45, [15, 19, 48]], [1, [7, 9, 22]]]; // the same stops, to fade a header into the page
  const bgAt = (y, a = 1) => { const f = clamp(y / env.H(), 0, 1), i = f < 0.45 ? 0 : 1, [f0, c0] = BG_STOPS[i], [f1, c1] = BG_STOPS[i + 1], k = (f - f0) / (f1 - f0); return `rgba(${c0.map((v, j) => Math.round(v + (c1[j] - v) * k)).join(',')},${a})`; };
  // The key art, windowed on Kit, the ball and Lumi and feathered into the page so no picture edge shows.
  const hero = (h, k) => cached(`home-hero|${h}|${k.toFixed(3)}`, W, h, g => {
    if (!heroArt.complete || !heroArt.naturalWidth) return;
    const aw = HOME_ART.w * k, ah = HOME_ART.h * k, cx = 0.615 * HOME_ART.w * k; // window centre on Kit..Lumi
    g.drawImage(heroArt, W / 2 - cx, h - ah, aw, ah);
    g.globalCompositeOperation = 'destination-in';
    const top = Math.max(0, h - ah);
    let m = g.createLinearGradient(0, top, 0, h); m.addColorStop(0, 'rgba(0,0,0,0)'); m.addColorStop(0.2, 'rgba(0,0,0,1)'); m.addColorStop(0.74, 'rgba(0,0,0,1)'); m.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = m; g.fillRect(0, 0, W, h);
    m = g.createLinearGradient(0, 0, W, 0); m.addColorStop(0, 'rgba(0,0,0,0)'); m.addColorStop(0.14, 'rgba(0,0,0,1)'); m.addColorStop(0.86, 'rgba(0,0,0,1)'); m.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = m; g.fillRect(0, 0, W, h);
  });
  // BREACH in cobalt starglass chrome: a bright upper face, a dark horizon, cobalt below; the only gold is the glint.
  const logo = () => cached('home-logo', W, 92, g => {
    g.font = `66px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; spacing(g, 3);
    const x = W / 2 + 1.5, y = 46;
    g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillText('BREACH', x, y + 7);
    g.strokeStyle = '#080b26'; g.lineWidth = 12; g.strokeText('BREACH', x, y);
    g.strokeStyle = '#2a4fc0'; g.lineWidth = 7; g.strokeText('BREACH', x, y);
    g.strokeStyle = '#0c1244'; g.lineWidth = 3.5; g.strokeText('BREACH', x, y);
    const lg = g.createLinearGradient(0, y - 32, 0, y + 32);
    lg.addColorStop(0, '#ffffff'); lg.addColorStop(0.34, '#dce6fa'); lg.addColorStop(0.5, '#93aedd'); lg.addColorStop(0.53, '#4c7be0'); lg.addColorStop(0.82, '#2a55c4'); lg.addColorStop(1, '#1a3896');
    g.fillStyle = lg; g.fillText('BREACH', x, y);
    g.save(); g.beginPath(); g.rect(0, y - 32, W, 17); g.clip(); g.fillStyle = 'rgba(255,255,255,0.4)'; g.fillText('BREACH', x, y); g.restore();
    spacing(g, 0);
  });

  function open(view) { S.view = view; S.vel = 0; S.drag = null; if (view === 'chapters') S.scroll = scrollFor(playTarget(best(), env.diff())); }
  const CH = 108, GAP = 12, LIST_X = 16, LIST_W = W - 32, HEAD = 148;
  const listTop = () => HEAD, listH = () => env.H() - HEAD;
  const contentH = () => STORY.length * (CH + GAP) + 20;
  const maxScroll = () => Math.max(0, contentH() - listH());
  const scrollFor = n => clamp(n * (CH + GAP) - listH() * 0.2, 0, maxScroll());

  // ----- input (the chapter list scrolls; a tap fires on release when the finger did not travel) -----
  function down(id, x, y, b) {
    if (S.view !== 'chapters' || b && !b.card || !b && y < listTop()) return false;
    S.drag = { id, y0: y, s0: S.scroll, b: b || null, moved: false, lastY: y, lastT: performance.now(), v: 0 }; S.vel = 0;
    return true;
  }
  function move(id, y) {
    const d = S.drag; if (!d || d.id !== id) return;
    if (Math.abs(y - d.y0) > 7) d.moved = true;
    if (d.moved) { const now = performance.now(), dt = Math.max(1, now - d.lastT); d.v = 0.8 * d.v + 0.2 * ((d.lastY - y) / dt * 1000); d.lastY = y; d.lastT = now; S.scroll = clamp(d.s0 + d.y0 - y, 0, maxScroll()); }
  }
  function up(id, cancel) {
    const d = S.drag; if (!d || d.id !== id) return; S.drag = null;
    if (d.moved) S.vel = clamp(d.v, -2200, 2200); else if (d.b && !cancel) { env.tap(); d.b.fn(); }
  }
  function tick(dt) {
    if (S.view !== 'chapters' || S.drag) return;
    if (Math.abs(S.vel) > 4) { S.scroll = clamp(S.scroll + S.vel * dt, 0, maxScroll()); S.vel *= Math.exp(-3.2 * dt); if (S.scroll <= 0 || S.scroll >= maxScroll()) S.vel = 0; } else S.vel = 0;
  }

  // ----- shared pieces -----
  function topIcons(g, y) {
    const items = [];
    // HOW TO PLAY: add { icon: 'help', fn: () => ... } to this list (ICONS.help is drawn and ready); icons stack leftwards from the edge.
    if (env.canFull() && !env.native()) items.push({ icon: 'full', fn: env.goFull });
    items.push({ icon: 'sound', arg: !env.isMuted(), fn: env.toggleSound });
    items.forEach((it, i) => iconButton(g, env, it.icon, W - 14 - 44 - i * 52, y, it.fn, it.arg));
  }
  function difficultyPills(g, y, w = 96, gap = 8) {
    const total = DIFFICULTY_IDS.length * w + (DIFFICULTY_IDS.length - 1) * gap, x0 = (W - total) / 2;
    DIFFICULTY_IDS.forEach((id, i) => {
      const on = id === env.diff(), x = x0 + i * (w + gap);
      pill(g, env, difficulty(id).label, x, y, w, 44, on ? '#3f74e8' : '#2a3358', () => env.selectDifficulty(id), { size: 16, rim: on ? 'rgba(200,222,255,0.8)' : 'rgba(143,178,255,0.18)' });
    });
  }

  // ----- HOME -----
  function drawHome(g) {
    const H = env.H(), t = env.t(), b = best(), diff = env.diff();
    g.drawImage(bg(), 0, 0, W, H);
    const gl = g.createRadialGradient(W * 0.55, 270, 10, W * 0.55, 270, 300); gl.addColorStop(0, 'rgba(63,116,232,0.24)'); gl.addColorStop(1, 'rgba(63,116,232,0)'); g.fillStyle = gl; g.fillRect(0, 0, W, H);
    topIcons(g, 6);
    // wordmark; seven quick taps on it opens every chapter (a tester's switch, no visible control)
    // whatever height the phone has beyond the key art is shared between the wordmark's breathing room and the art
    const bottom = H - 14, chY = bottom - 50, dY = chY - 12 - 44, pY = dY - 16 - 72, capY = pY - 12 - 66;
    const kArt = Math.min((capY - 146) / HOME_ART.h, 0.54), shift = clamp((capY - 146 - HOME_ART.h * kArt) * 0.5, 0, 44);
    const ly = 90 + shift + Math.sin(t * 1.6) * 1.5;
    g.drawImage(logo(), 0, ly - 46, W, 92);
    env.buttons().push({ x: 60, y: 24, w: W - 120, h: 70, fn: () => { const n = performance.now(); S.taps = n - S.tapAt < 900 ? S.taps + 1 : 1; S.tapAt = n; if (S.taps >= 7) { S.taps = 0; store.set('unlockAll', !store.get('unlockAll')); S.flash = 1; } } });
    const spin = 0.75 + 0.25 * Math.sin(t * 2.4); sparkle(g, W / 2 + 122, ly - 27, 15 * spin, 1, '#ffd966'); sparkle(g, W / 2 + 122, ly - 27, 6, 1, '#ffffff');
    if (S.flash > 0) { S.flash = Math.max(0, S.flash - 0.02); g.fillStyle = `rgba(143,178,255,${S.flash * 0.3})`; g.fillRect(0, 0, W, H); }
    spacing(g, 3.2); text(g, 'BREAK IN. BREAK OUT.', W / 2 + 1.6, ly + 48, 11, '#9db4e8', 'center', NUM); spacing(g, 0);

    // the bottom stack is laid out from the bottom edge up so every phone keeps the same order
    const heroY = 146 + shift;
    const heroH = clamp(capY - heroY, 150, 340), k = Math.min(heroH / HOME_ART.h, 0.54);
    const bob = Math.sin(t * 0.7) * 2.5, zoom = 1 + 0.012 * Math.sin(t * 0.5);
    g.save(); g.translate(W / 2, heroY + heroH / 2 + bob); g.scale(zoom, zoom); g.drawImage(hero(Math.round(heroH), k), -W / 2, -heroH / 2, W, Math.round(heroH)); g.restore();
    // twinkles on the ball and the glaze chips
    const aw = HOME_ART.w * k, ah = HOME_ART.h * k, ax0 = W / 2 - 0.615 * aw, ay0 = heroY + heroH - ah + bob;
    [[0.61, 0.39], [0.885, 0.1], [0.53, 0.2], [0.72, 0.6], [0.42, 0.33]].forEach(([fx, fy], i) => { const ph = Math.sin(t * 2.2 + i * 1.9); if (ph > 0.1) sparkle(g, ax0 + fx * aw, ay0 + fy * ah, (i ? 4 : 7) + 4 * ph, ph, i % 2 ? '#cfe0ff' : '#ffffff'); });

    // which chapter PLAY starts
    const n = playTarget(b, diff), slot = slotOf(n), L = env.LEVELS[slot], first = clearedCount(b) === 0;
    spacing(g, 2.6); text(g, `CHAPTER ${n + 1}${first ? '' : ' OF ' + STORY.length}`, W / 2 + 1.3, capY + 8, 11, ICE, 'center', NUM); spacing(g, 0);
    g.font = `25px ${FONT}`; const nm = g.measureText(L.name).width; text(g, L.name, W / 2, capY + 31, nm > W - 40 ? Math.floor(25 * (W - 40) / nm) : 25, '#fff', 'center');
    g.font = `12px ${NUM}`; text(g, L.sub, W / 2, capY + 55, g.measureText(L.sub).width > W - 40 ? 11 : 12, '#aebbe6', 'center', NUM);

    const pw = 296, pulse = Math.sin(t * 2.6) * 0.008;
    pill(g, env, 'PLAY', (W - pw) / 2, pY, pw, 72, PLAY_C, () => env.play(slot), { size: 36, track: 3, pulse, shine: (t % 3.4) / 1.5, rim: 'rgba(210,255,225,0.55)' });
    difficultyPills(g, dY);
    const cw = 296, cx = (W - cw) / 2, cnt = `${clearedCount(b)} / ${STORY.length}`;
    pill(g, env, 'CHAPTERS', cx, chY, cw, 50, '#26336b', () => open('chapters'), { size: 19, track: 2, rim: 'rgba(143,178,255,0.4)' });
    g.font = `15px ${FONT}`; const cwid = g.measureText(cnt).width;
    g.fillStyle = 'rgba(8,12,34,0.7)'; rrect(g, cx + cw - 16 - cwid - 16, chY + 9, cwid + 20, 28, 14); g.fill();
    text(g, cnt, cx + cw - 16 - cwid / 2 - 6, chY + 24, 15, ICE, 'center');
  }

  // ----- CHAPTER MAP -----
  function drawChapters(g) {
    const H = env.H(), t = env.t(), b = best(), diff = env.diff(), cur = playTarget(b, diff), open_ = unlockedCount(b, unlockAll());
    g.drawImage(bg(), 0, 0, W, H);
    S.built = 0;
    const top = listTop(), vh = listH();
    // cards, clipped to the list window
    g.save(); g.beginPath(); g.rect(0, top - 6, W, vh + 6 + 40); g.clip();
    STORY.forEach((slot, n) => {
      const y = top + 10 + n * (CH + GAP) - S.scroll; if (y > H + 10 || y + CH < top - 10) return;
      card(g, n, slot, LIST_X, y, LIST_W, CH, { locked: n >= open_, far: n > open_, current: n === cur, done: cleared(b, slot), stars: starsOf(b, diff, slot), prev: n ? env.LEVELS[slotOf(n - 1)].name : '', t });
      const vy = Math.max(y, top), vb = Math.min(y + CH, H);
      if (vb - vy > 8) env.buttons().push({ x: LIST_X, y: vy, w: LIST_W, h: vb - vy, card: true, fn: () => n < open_ ? env.play(slot) : env.locked(n, env.LEVELS[slotOf(n - 1)].name) });
    });
    g.restore();
    // header sits over the list with a soft fade, so scrolling cards slide under it
    const hg = g.createLinearGradient(0, 0, 0, top + 18); hg.addColorStop(0, bgAt(0)); hg.addColorStop(0.86, bgAt(top, 0.97)); hg.addColorStop(1, bgAt(top + 18, 0));
    g.fillStyle = hg; g.fillRect(0, 0, W, top + 18);
    iconButton(g, env, 'back', 14, 6, () => open('home'));
    text(g, 'CHAPTERS', W / 2, 28, 28, '#fff', 'center');
    const total = starTotal(b, diff), cl = clearedCount(b);
    glazedBar(g, W / 2 - 80, 51, 160, 9, cl / STORY.length, '#8fb2ff', '#3f74e8');
    text(g, `${cl} of ${STORY.length} cleared`, W / 2 - 84, 74, 12, '#aebbe6', 'left', NUM);
    star(g, W / 2 + 62, 74, 6.5, true); text(g, `${total} / ${STORY.length * 3}`, W / 2 + 72, 74, 12, '#e6edff', 'left', NUM);
    iconButton(g, env, 'sound', W - 58, 6, env.toggleSound, !env.isMuted());
    difficultyPills(g, 88, 100, 8);
    // scroll hint: a slim thumb at the edge
    if (maxScroll() > 0) { const th = Math.max(30, vh * vh / contentH()), ty = top + (vh - th) * (S.scroll / maxScroll()); g.fillStyle = 'rgba(143,178,255,0.28)'; rrect(g, W - 6, ty, 3, th, 1.5); g.fill(); }
  }

  function card(g, n, slot, x, y, w, h, o) {
    const L = env.LEVELS[slot], R = 20, dim = o.far ? 0.6 : o.locked ? 0.26 : 0;
    g.fillStyle = 'rgba(0,0,0,0.5)'; rrect(g, x + 1, y + 6, w, h, R); g.fill();
    g.fillStyle = '#0c1028'; rrect(g, x, y, w, h, R); g.fill();
    g.save(); rrect(g, x, y, w, h, R); g.clip();
    // chapter art: the live scene crop behind, the chapter's face in front
    const prevOk = env.hasPreview(slot) || S.built++ < 1;
    if (prevOk) { g.globalAlpha = 0.95; g.drawImage(env.preview(slot, w, h), x, y, w, h); g.globalAlpha = 1; }
    else { const pg = g.createLinearGradient(x, y, x + w, y); pg.addColorStop(0, '#141a3c'); pg.addColorStop(1, shade(L.color, -0.6)); g.fillStyle = pg; g.fillRect(x, y, w, h); }
    g.fillStyle = 'rgba(8,10,28,0.38)'; g.fillRect(x, y, w, h); // calm the scene so the face reads
    const gl = g.createRadialGradient(x + w - 62, y + h * 0.55, 4, x + w - 62, y + h * 0.55, 90); gl.addColorStop(0, shade(L.color, 0.1)); gl.addColorStop(1, 'rgba(0,0,0,0)');
    g.globalAlpha = 0.32; g.fillStyle = gl; g.fillRect(x, y, w, h); g.globalAlpha = 1;
    g.save(); if (o.locked) g.globalAlpha = o.far ? 0.5 : 0.7;
    const art = CHAPTER_ART[slot]; if (art) { g.save(); g.shadowColor = 'rgba(0,0,0,0.55)'; g.shadowBlur = 10; g.shadowOffsetY = 4; art(g, x + w - 66, y + h - 8, h - 22, o.t); g.restore(); }
    g.restore();
    const sh = g.createLinearGradient(x, 0, x + w, 0); sh.addColorStop(0, 'rgba(7,9,24,0.97)'); sh.addColorStop(0.46, 'rgba(7,9,24,0.9)'); sh.addColorStop(0.72, 'rgba(7,9,24,0.35)'); sh.addColorStop(1, 'rgba(7,9,24,0)');
    g.fillStyle = sh; g.fillRect(x, y, w, h);
    const bt = g.createLinearGradient(0, y + h * 0.55, 0, y + h); bt.addColorStop(0, 'rgba(7,9,24,0)'); bt.addColorStop(1, 'rgba(7,9,24,0.5)'); g.fillStyle = bt; g.fillRect(x, y, w, h);
    if (dim) { g.fillStyle = `rgba(6,8,22,${dim})`; g.fillRect(x, y, w, h); }
    g.restore();
    // rim: current chapter glows cobalt, cleared are steel, locked fade
    const live = o.current;
    if (live) { g.save(); g.shadowColor = 'rgba(80,130,255,0.75)'; g.shadowBlur = 14 + 4 * Math.sin(o.t * 3); g.strokeStyle = '#7ea6ff'; g.lineWidth = 2.5; rrect(g, x, y, w, h, R); g.stroke(); g.restore(); }
    else { g.strokeStyle = o.locked ? 'rgba(143,178,255,0.14)' : 'rgba(170,196,255,0.4)'; g.lineWidth = 1.5; rrect(g, x + 0.75, y + 0.75, w - 1.5, h - 1.5, R - 1); g.stroke(); }
    g.strokeStyle = 'rgba(255,255,255,0.07)'; g.lineWidth = 1; rrect(g, x + 3, y + 3, w - 6, h - 6, R - 3); g.stroke();
    // number medallion: chrome ring, cobalt face (cleared ones go steel-blue, locked ones slate)
    const mx = x + 33, my = y + 33, mr = 21;
    const face = o.locked ? ['#59607e', '#2a3050'] : o.done ? ['#7fa6f2', '#2c55c0'] : ['#6f9bff', '#2c55c8'];
    g.fillStyle = 'rgba(0,0,0,0.45)'; g.beginPath(); g.arc(mx + 1, my + 3, mr, 0, 7); g.fill();
    let rg = g.createLinearGradient(0, my - mr, 0, my + mr); rg.addColorStop(0, '#f4f8ff'); rg.addColorStop(0.5, '#9fb2d8'); rg.addColorStop(1, '#5a6a94'); g.fillStyle = rg; g.beginPath(); g.arc(mx, my, mr, 0, 7); g.fill();
    rg = g.createLinearGradient(0, my - mr, 0, my + mr); rg.addColorStop(0, face[0]); rg.addColorStop(1, face[1]); g.fillStyle = rg; g.beginPath(); g.arc(mx, my, mr - 3.5, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.ellipse(mx - 2, my - 9, 9, 4, -0.3, 0, 7); g.fill();
    if (o.locked) lockIcon(g, mx, my - 1, 0.62, '#d8e2ff'); else text(g, String(n + 1), mx, my + 1, 23, '#fff', 'center');
    // words
    const tx = x + 66;
    g.font = `20px ${FONT}`; const nw = g.measureText(L.name).width, ns = nw > w - 150 ? Math.floor(20 * (w - 150) / nw) : 20;
    const goal = o.locked ? (o.far ? 'Locked' : `Clear ${o.prev} to unlock`) : L.sub, lines = wrap(g, goal, w - 66 - 104, 12, NUM, 2), off = o.locked ? 8 : 0;
    text(g, L.name, tx, y + 26 + off, ns, o.locked ? '#c3cbe6' : '#fff');
    lines.forEach((ln, i) => text(g, ln, tx, y + 49 + off + i * 15, 12, o.locked ? '#7f89ad' : '#b8c4ea', 'left', NUM));
    if (!o.locked) for (let s = 0; s < 3; s++) star(g, tx + 9 + s * 22, y + h - 20, 8.5, s < o.stars);
    if (live) { const bw = o.done ? 70 : 58, bx = tx + 80, by = y + h - 32; g.fillStyle = 'rgba(63,116,232,0.95)'; rrect(g, bx, by, bw, 24, 12); g.fill(); g.strokeStyle = 'rgba(200,222,255,0.7)'; g.lineWidth = 1; rrect(g, bx, by, bw, 24, 12); g.stroke(); spacing(g, 1.5); text(g, o.done ? 'REPLAY' : 'NEXT', bx + bw / 2 + 0.7, by + 12.5, 12, '#fff', 'center'); spacing(g, 0); }
    if (L.stages) { spacing(g, 1.4); text(g, `${L.stages} STAGES`, x + w - 14, y + 16, 9.5, 'rgba(220,232,255,0.8)', 'right', NUM); spacing(g, 0); }
  }

  return { get view() { return S.view; }, bg, open, down, move, up, tick, draw: g => S.view === 'chapters' ? drawChapters(g) : drawHome(g), get scroll() { return S.scroll; }, set scroll(v) { S.scroll = clamp(v, 0, maxScroll()); }, state: S };
}
