import { ART } from '../vault-art.js';
import { SPR, ready, cached, text, loadImg } from '../gfx.js';
import { drawCastleWindow } from '../castle-window.js';
import { RIVAL_LUNGE, RIVALS_FLOORS, RIVALS_TIMING } from './rivals.js';
import { glow, sparks, chips, dust, rnd, clamp01, smooth, gBanner, gPaddle, gBall, gWard, skinFor, CLIMB } from './render.js';
import { EMERALD, drawBody, lbrick, star, lantern, ledge, wallDressing } from './lumi-render.js';

// Serpent Rivals. Same window kit, tapered tube bodies and head-sheet path as Lumi Breaks Out (lumi-render.js), with Gnash emerald from the
// left wall and Mooncoil violet from the right. The rendered props (assets/rivals) sit on the model rects: `contact` is the collider.
const WS = 44 / 60, HALF = 16 * WS, HEAD = 1.5;
const GN = '#6af0c8', MC = '#b49cff', GOLD = '#ffe3a1';
const VIOLET = { base: '#7050c4', dark: '#43298f', mid: '#7e5fd2', belly: '#d9ccff', seam: 'rgba(60,40,130,.38)', scaleDark: 'rgba(28,14,86,.55)', scaleRim: 'rgba(214,200,255,.36)', under: 'rgba(22,10,64,.34)', hi1: 'rgba(206,188,255,.2)', hi2: 'rgba(240,232,255,.35)', hi3: 'rgba(255,246,255,.65)', outline: '#1d1050' };
const PAL = { gnash: EMERALD, mooncoil: VIOLET }, COL = { gnash: GN, mooncoil: MC };
const sheet = s => s ? { ...s, img: loadImg(s.url) } : null;
const SN = { gnash: sheet(ART.snakeEmerald), mooncoil: sheet(ART.snake) };
const RS = Object.fromEntries(Object.entries(ART.rivals?.sprites || {}).map(([k, v]) => [k, { ...v, img: loadImg(v.url) }]));
const WP = Object.fromEntries(Object.entries(ART.castleWindow || {}).map(([k, v]) => [k, { ...v, img: loadImg(v.url) }]));
const SLOTS = ART.rivals?.wardSlots || [];
const BRICK = { t: 't', v: 'v', c: 'c', y: 'y', b: 'b', gold: 'y' };
const ease = t => smooth(t);
const alpha = ctx => typeof ctx.globalAlpha === 'number' ? ctx.globalAlpha : 1;
// A rendered prop at drawSize with its anchor on (x, y).
function put(ctx, key, x, y, k = 1, a = 1, rot = 0) {
  const s = RS[key] || WP[key]; if (!s || !ready(s)) return false;
  const o = alpha(ctx); ctx.globalAlpha = o * a;
  if (rot) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.drawImage(s.img, -s.anchor[0] * k, -s.anchor[1] * k, s.uw * k, s.uh * k); ctx.restore(); }
  else ctx.drawImage(s.img, x - s.anchor[0] * k, y - s.anchor[1] * k, s.uw * k, s.uh * k);
  ctx.globalAlpha = o; return true;
}
const add = (ctx, fn) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; fn(); ctx.restore(); };
// ---------- hall ----------
function wallTile() {
  return cached('rivals-wall', 360, 88, c => {
    c.fillStyle = '#161a2a'; c.fillRect(0, 0, 360, 88);
    for (let row = 0; row < 4; row++) for (let i = -1; i < 9; i++) {
      const w = 44, x = i * w + (row % 2 ? w / 2 : 0), y = row * 22, n = rnd(row * 11 + i, 5), side = x + w < 52 || x > 308;
      const l = side ? 14 + n * 4 : 19 + n * 6;
      c.fillStyle = `hsl(${232 + n * 14} ${side ? 18 : 18}% ${l}%)`; c.fillRect(x + 1, y + 1, w - 2, 20);
      c.fillStyle = '#ffffff0c'; c.fillRect(x + 1, y + 1, w - 2, 1.4); c.fillStyle = '#00000044'; c.fillRect(x + 1, y + 19, w - 2, 2);
      if (n > .7) { c.fillStyle = '#0000002a'; c.fillRect(x + 6 + n * 12, y + 5, 10, 8); }
    }
    c.fillStyle = '#080a14'; for (const x of [0, 308]) c.fillRect(x, 0, 52, 88);
    for (const x of [0, 308]) for (let row = 0; row < 4; row++) for (let i = 0; i < 2; i++) {
      const n = rnd(row * 5 + i + x, 9), bx = x + i * 26, by = row * 22; c.fillStyle = `hsl(${x ? 262 + n * 8 : 176 + n * 8} 22% ${11 + n * 4}%)`; c.fillRect(bx + 1, by + 1, 24, 20);
      c.fillStyle = '#ffffff10'; c.fillRect(bx + 1, by + 1, 24, 1.3); c.fillStyle = '#00000066'; c.fillRect(bx + 1, by + 19, 24, 2);
    }
    c.fillStyle = '#4fd6b466'; c.fillRect(51, 0, 1.4, 88); c.fillStyle = '#9a80ff66'; c.fillRect(307.6, 0, 1.4, 88);
    c.fillStyle = '#00000055'; c.fillRect(52, 0, 6, 88); c.fillRect(302, 0, 6, 88);
  });
}
function vignette(W, H) {
  return cached(`rivals-vig-${W}-${H}`, W, H, c => { const g = c.createRadialGradient(W / 2, H * .46, H * .25, W / 2, H * .46, H * .78); g.addColorStop(0, '#0000'); g.addColorStop(1, '#03040c99'); c.fillStyle = g; c.fillRect(0, 0, W, H); });
}
// A recess between two cornices: the hatch (floor 1) and the Twin Seal (floors 2-3) both sit in one.
function gateFrame(ctx, g, y0, y1) {
  ledge(ctx, 0, y0 - 18, g.width, 16); ledge(ctx, 0, y1, g.width, 14);
  ctx.fillStyle = '#06070f'; ctx.fillRect(0, y0 - 2, g.width, y1 - y0 + 2);
  const gr = ctx.createLinearGradient(0, y0 - 2, 0, y1); gr.addColorStop(0, '#00000099'); gr.addColorStop(1, '#0000'); ctx.fillStyle = gr; ctx.fillRect(0, y0 - 2, g.width, y1 - y0 + 2);
  const sh = ctx.createLinearGradient(0, y1 + 14, 0, y1 + 34); sh.addColorStop(0, '#0009'); sh.addColorStop(1, '#0000'); ctx.fillStyle = sh; ctx.fillRect(0, y1 + 14, g.width, 20);
}
function hatchBars(ctx, g) {
  const all = g.bricks.filter(b => b.type === 'bar'); if (!all.length) return;
  for (const b of all) if (b.hp > 0) {
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
  const total = all.reduce((s, b) => s + b.maxHP, 0), done = total - all.reduce((s, b) => s + Math.max(0, b.hp), 0);
  if (g.phase === 'play' || g.phase === 'serve') text(ctx, `HATCH ${done} / ${total}`, 180, all[0].y - 10, 10.5, '#f3dca8', 'center');
}
// ---------- Twin Seal ----------
const stageKey = (g, s) => { const f = s.hp / s.maxHP; return g.phase === 'shatter' || f <= .25 ? 'seal_shattered' : f > .75 ? 'seal_intact' : f > .5 ? 'seal_crack1' : 'seal_crack2'; };
const sealC = s => ({ x: s.x + s.w / 2, y: s.y + s.h / 2 });
const slotAt = (s, i) => { const c = sealC(s), p = SLOTS[i] || [20 + i * 20, 22]; return { x: c.x - 76 + p[0], y: c.y - 22 + p[1] }; };
const plateKey = i => i % 3 === 2 ? 'ward_plate_gilt' : 'ward_plate_iron';
function drawSeal(ctx, g, st) {
  const s = g.seal; if (!s) return;
  const c = sealC(s), hit = g.effects.filter(e => e.kind === 'seal-hit'), flash = hit.reduce((m, e) => Math.max(m, (1 - e.age / e.life) ** 2 * (e.source === 'clash' ? 1 : .7)), 0);
  const dx = flash > .02 ? Math.sin(g.time * 120) * 2.2 * flash : 0;
  ctx.save(); ctx.translate(dx, 0);
  const t = g.phase === 'shatter' ? RIVALS_TIMING.shatter - g.transition : -1;
  glow(ctx, c.x - 56, c.y, 50, GN, .1 + .18 * (1 - s.hp / s.maxHP)); glow(ctx, c.x + 56, c.y, 50, MC, .1 + .18 * (1 - s.hp / s.maxHP));
  if (t >= 0) { sealPieces(ctx, g, s, c, t, st); ctx.restore(); return; }
  put(ctx, stageKey(g, s), c.x, c.y);
  if (stageKey(g, s) === 'seal_shattered') {
    // The broken right panel shows the furnace behind it: shade the gap's edges, add a flickering bloom and drifting embers so it reads as light, not a flat plate.
    const gx = c.x - 76 + 88, gy = c.y - 22 + 9, gw = 52, gh = 26, fl = .75 + .25 * Math.sin(st.clock * 9);
    ctx.save(); ctx.beginPath(); ctx.rect(gx, gy, gw, gh); ctx.clip();
    for (const [y0, y1] of [[gy, gy + 8], [gy + gh, gy + gh - 8]]) { const gr = ctx.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, 'rgba(60,18,8,.7)'); gr.addColorStop(1, 'rgba(60,18,8,0)'); ctx.fillStyle = gr; ctx.fillRect(gx, Math.min(y0, y1), gw, 8); }
    const sd = ctx.createLinearGradient(gx + gw, 0, gx + gw - 16, 0); sd.addColorStop(0, 'rgba(60,18,8,.6)'); sd.addColorStop(1, 'rgba(60,18,8,0)'); ctx.fillStyle = sd; ctx.fillRect(gx + gw - 16, gy, 16, gh);
    add(ctx, () => { glow(ctx, gx + gw * .45, gy + gh * .5, 34, '#ff9a4a', .5 * fl); glow(ctx, gx + gw * .3, gy + gh * .45, 16, '#ffd9a0', .35 * fl); });
    ctx.restore();
    for (let i = 0; i < 4; i++) { const t = (st.clock * .45 + i / 4) % 1; add(ctx, () => glow(ctx, gx + 8 + rnd(i, 3) * 40 + Math.sin(t * 6 + i) * 3, gy + gh - t * 34, 3.6, '#ffc27a', Math.sin(Math.PI * t) * .9)); }
  }
  if (flash > .02) add(ctx, () => { glow(ctx, c.x, c.y, 90, '#fff0cc', flash * .55); put(ctx, stageKey(g, s), c.x, c.y, 1, flash * .45); });
  // Ward plates: one per ward point; a plate still flying in from a meal is not seated yet.
  for (let i = 0; i < s.ward; i++) {
    const feed = g.effects.find(e => e.kind === 'seal-feed' && e.ward === i + 1), q = feed ? feed.age / feed.life : 1; if (q < .78) continue;
    const p = slotAt(s, i), pop = feed ? Math.sin(Math.PI * clamp01((q - .78) / .22)) : 0, bump = 1 + .22 * pop;
    glow(ctx, p.x, p.y, 15 + 10 * pop, i % 3 === 2 ? '#ffd88a' : '#b9d0ee', .22 + .4 * pop);
    put(ctx, plateKey(i), p.x, p.y, bump);
  }
  ctx.restore();
  if (g.phase === 'play' || g.phase === 'serve') {
    const bw = 104, bx = c.x - bw / 2, by = s.y + s.h + 12, f = clamp01(s.hp / s.maxHP);
    ctx.fillStyle = '#05060dcc'; ctx.beginPath(); ctx.roundRect(bx - 1.5, by - 1.5, bw + 3, 7, 3.5); ctx.fill();
    const gr = ctx.createLinearGradient(bx, 0, bx + bw, 0); gr.addColorStop(0, '#5ee6bd'); gr.addColorStop(.5, '#e8d890'); gr.addColorStop(1, '#a98cff');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.roundRect(bx, by, Math.max(4, bw * f), 4, 2); ctx.fill();
    ctx.fillStyle = '#ffffff55'; ctx.fillRect(bx + 2, by + .8, Math.max(0, bw * f - 4), .8);
  }
}
// The final hit: the shattered door breaks into eight slabs that fly apart and fall, the plates go with them, and the way beyond lights up.
function sealPieces(ctx, g, s, c, t, st) {
  const S = RS.seal_shattered, N = 8; if (!S || !ready(S)) return;
  const iw = S.img.naturalWidth, ih = S.img.naturalHeight, sw = iw / N, k = S.uw / iw, dw = S.uw / N;
  for (let i = 0; i < N; i++) {
    const d = .1 + .12 * rnd(i, 5), u = Math.max(0, t - d), vx = (i - (N - 1) / 2) * 24 + (rnd(i, 1) - .5) * 20, vy = -80 - 70 * rnd(i, 2);
    const x = c.x - S.anchor[0] + i * dw + dw / 2 + vx * u, y = c.y + vy * u + 210 * u * u, a = 1 - clamp01((u - .45) / .9);
    if (a <= 0) continue; ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate((rnd(i, 3) - .5) * 3.2 * u);
    ctx.drawImage(S.img, i * sw, 0, sw + 1, ih, -dw / 2, -S.anchor[1], dw + .4, S.uh); ctx.restore();
  }
  for (let i = 0; i < g.seal.ward; i++) { const p = slotAt(g.seal, i); flyPlate(ctx, p.x, p.y, (i - 2.5) * 40, -120 - i * 14, Math.max(0, t - .1), plateKey(i)); }
}
function doorLight(ctx, g, ft, fb, t) {
  const L = smooth((t - .15) / .9), end = 1 - smooth((t - 2) / .4) * .2; if (L <= 0) return;
  ctx.save(); ctx.beginPath(); ctx.rect(0, ft - 2, g.width, fb - ft + 2); ctx.clip();
  ctx.globalAlpha = .5 * L * end; ctx.fillStyle = '#c98f45'; ctx.fillRect(0, ft - 2, g.width, fb - ft + 2); ctx.globalAlpha = 1;
  ctx.save(); ctx.translate(180, (ft + fb) / 2); ctx.scale(1.9, .55); glow(ctx, 0, 0, 150, '#fff3c8', .95 * L * end); ctx.restore();
  ctx.restore();
  add(ctx, () => {
    glow(ctx, 180, (ft + fb) / 2, 190, '#ffe9b0', .4 * L);
    for (const [k, a] of [[1, .1], [.72, .1], [.46, .1]]) {
      const sh = ctx.createLinearGradient(0, fb, 0, fb + 330); sh.addColorStop(0, '#fff0c0'); sh.addColorStop(1, '#fff0c000'); ctx.globalAlpha = a * L * end; ctx.fillStyle = sh;
      ctx.beginPath(); ctx.moveTo(180 - 120 * k, fb); ctx.lineTo(180 + 120 * k, fb); ctx.lineTo(180 + 200 * k, fb + 330); ctx.lineTo(180 - 200 * k, fb + 330); ctx.fill();
    }
  });
}
// ---------- windows, serpents ----------
function windowLight(ctx, g, w, l) {
  const col = COL[w.snake];
  glow(ctx, w.originX + w.dir * 5, w.y, 28, col, l ? .24 + .12 * Math.sin(g.time * 6) : .07);
}
function drawShutter(ctx, g, s, st) {
  const x = s.originX, y = s.y, blink = (st.clock * .55 + s.row * .37) % 1 < .06;
  ctx.save(); ctx.translate(x, y); ctx.scale(WS, WS);
  put(ctx, 'window_back', 0, 0); put(ctx, 'shutter_eyes', 0, 0, 1, blink ? .15 : .55 + .35 * Math.sin(st.clock * 2.4 + s.row)); put(ctx, 'window_front_shuttered', 0, 0);
  ctx.restore();
}
const moodOf = (g, l) => {
  const t = g.time;
  switch (l.mood) {
    case 'blink': { if (l.stage !== 'peek') return 'idle'; const k = Math.floor(t * 2.2 + l.id) % 4; return k === 3 ? 'blink' : k === 1 ? 'taste' : 'idle'; }
    case 'hiss': { const q = l.t / l.tell; return q < .4 ? 'hunt' : q > .8 && Math.floor(t * 14) % 2 ? 'snarl' : 'hiss'; }
    case 'chew': return Math.floor(t * 8) % 2 ? 'chew1' : 'chew0';
    case 'taste': return Math.floor(t * 4 + l.id) % 3 ? 'taste' : 'idle';
    case 'hurt': return 'ouch';
    case 'strike': case 'grin': case 'ouch': case 'dizzy': case 'snarl': case 'shock': return l.mood;
    default: return 'idle';
  }
};
// The head sits at the model's head point, drawn back into the recess while it is still inside the lip (no collider there).
function drawHead(ctx, g, l) {
  const S = SN[l.snake]; if (!S || !ready({ img: S.img })) return;
  const w = l.win, p = l.points[0], d = Math.abs(p.x - w.originX), hide = d < 16 ? 14 * (1 - ease(d / 16)) : 0;
  const retreat = l.stage === 'retreat', turn = retreat ? clamp01(l.t / .16) : 0, sx = retreat ? Math.cos(Math.PI * turn) * w.dir : w.dir, side = sx > 0 ? 'r' : 'l';
  const nx = l.points[1], tilt = !retreat && nx ? Math.max(-.45, Math.min(.45, Math.atan2(p.y - nx.y, (p.x - nx.x) * w.dir))) * w.dir : 0;
  const ex = moodOf(g, l), size = S.unit * HEAD, c = S.cell, bob = l.stage === 'hiss' ? -1.1 : 0;
  ctx.save(); ctx.translate(p.x - w.dir * hide, p.y + bob + Math.sin(g.time * 3.2 + l.id) * .5);
  ctx.rotate(tilt + (l.mood === 'dizzy' ? Math.sin(g.time * 5 + l.id) * .14 : 0)); ctx.scale(Math.max(.05, Math.abs(sx)), 1);
  if (l.stage === 'clash') ctx.translate(Math.sin(g.time * 90) * .9, 0);
  ctx.drawImage(S.img, S.expr[ex] * c, S.dir[side] * c, c, c, -size / 2, -size / 2, size, size); ctx.restore();
}
function drawLunge(ctx, g, l) { drawBody(ctx, l, g.time, PAL[l.snake]); drawHead(ctx, g, l); }
function biteBand(ctx, g, w, a) {
  if (a <= .01) return; const x0 = w.originX + w.dir * 12, x1 = w.originX + w.dir * (w.reach + RIVAL_LUNGE.headR + 8), pulse = .75 + .25 * Math.sin(g.time * (10 + 14 * a));
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const v = ctx.createLinearGradient(0, w.y - 15, 0, w.y + 15); v.addColorStop(0, '#ff5a4a00'); v.addColorStop(.5, `rgba(255,96,86,${(.16 + .5 * a) * pulse})`); v.addColorStop(1, '#ff5a4a00');
  ctx.fillStyle = v; ctx.fillRect(Math.min(x0, x1), w.y - 15, Math.abs(x1 - x0), 30);
  glow(ctx, w.originX + w.dir * 16, w.y, 46, '#ff6a4a', (.2 + .55 * a) * pulse);
  ctx.restore(); ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; const span = Math.abs(x1 - x0), gap = 30, off = (g.time * (60 + 120 * a)) % gap;
  for (let s = off - gap; s < span; s += gap) {
    const x = x0 + w.dir * s, f = clamp01(s / 24) * clamp01((span - s) / 40); if (f <= 0) continue;
    ctx.globalAlpha = f * (.35 + .6 * a); ctx.beginPath(); ctx.moveTo(x - w.dir * 6, w.y - 8); ctx.lineTo(x + w.dir * 3, w.y); ctx.lineTo(x - w.dir * 6, w.y + 8);
    ctx.strokeStyle = '#ff5a6a88'; ctx.lineWidth = 6; ctx.stroke(); ctx.strokeStyle = '#ffd0d8'; ctx.lineWidth = 2.2; ctx.stroke();
  }
  ctx.restore();
}
// ---------- lures ----------
function drawLure(ctx, g, l, st) {
  const cx = l.x + l.w / 2, cy = l.y + l.h / 2, col = COL[l.snake], call = g.effects.find(e => e.kind === 'lure-call' && e.snake === l.snake);
  if (l.lit) { const p = .5 + .5 * Math.sin(st.clock * 3.4 + (l.snake === 'gnash' ? 0 : 1.6)); add(ctx, () => { glow(ctx, cx, cy, 36 + 5 * p, col, .34 + .26 * p); glow(ctx, cx, cy, 16, '#fff', .12 + .1 * p); }); }
  put(ctx, `lure_${l.snake}_${l.lit ? 'lit' : 'dim'}`, cx, cy);
  if (call) add(ctx, () => { const q = call.age / call.life; glow(ctx, cx, cy, 44, '#fff', (1 - q) * .55); glow(ctx, cx, cy, 70 * (.6 + q), col, (1 - q) * .6); });
}
// ---------- effects ----------
const crumbs = (ctx, e, n, spread, col) => { chips(ctx, e.x, e.y, e.age, e.life, n, spread * 2, .55, 4, .6); if (col) dust(ctx, e.x, e.y, e.age, e.life, 3, 14, 7, col); };
function flyPlate(ctx, x, y, vx, vy, t, key, k = 1) { put(ctx, key, x + vx * t, y + vy * t + 300 * t * t, k, clamp01(1 - t / .65), t * 9 * (vx > 0 ? 1 : -1)); }
function rEffects(ctx, g, art, pre) {
  for (const e of g.effects) {
    if ((e.kind === 'chomp') !== !!pre) continue;
    const q = e.age / e.life, a = 1 - q, col = COL[e.snake] || GOLD; ctx.save(); ctx.globalAlpha = a;
    switch (e.kind) {
      case 'window-peek': { const w = g.windows.find(w => Math.abs(w.originX - e.x) < 1 && Math.abs(w.y - e.y) < 1); if (w) { ctx.globalAlpha = 1; glow(ctx, w.originX + w.dir * 5, w.y, 32, col, (e.lured ? .7 : .45) * Math.sin(Math.PI * q)); } break; }
      case 'bite-warning': case 'paddle': break;
      case 'chomp': { const k = 1 - q * .35; ctx.save(); ctx.translate(e.x, e.y); ctx.scale(k, k); lbrick(ctx, { x: -e.w / 2, y: -e.h / 2, w: e.w, h: e.h, colour: e.colour }); ctx.restore(); ctx.globalAlpha = a; crumbs(ctx, e, 4, 34, e.snake === 'mooncoil' ? '#7a68b8' : '#4f9a86'); break; }
      case 'brick-break': {
        if (e.type === 'bar') { for (let n = 0; n < 4; n++) { const t = e.age, x = e.x + (n - 1.5) * (7 + t * 40), y = e.y - 40 * t + 260 * t * t; ctx.save(); ctx.translate(x, y); ctx.rotate((n - 1.5) * t * 6); ctx.fillStyle = '#9aa2bc'; ctx.fillRect(-1.3, -8, 2.6, 16); ctx.fillStyle = '#e4e8f6'; ctx.fillRect(-1.3, -8, .9, 16); ctx.restore(); } sparks(ctx, e.x, e.y, e.age, 6, 60, [], 1.6, 3); break; }
        const s = SPR[`brick_${BRICK[e.colour] || 'v'}_2_0`]; if (!ready(s)) break;
        for (let n = 0; n < 3; n++) { const t = e.age, x = e.x + (n - 1) * (8 + t * 45), y = e.y - 45 * t + 180 * t * t, iw = s.img.naturalWidth, ih = s.img.naturalHeight, m = iw * .1; ctx.save(); ctx.translate(x, y); ctx.rotate((n - 1) * t * 5);
          ctx.drawImage(s.img, m + n * (iw - 2 * m) / 3, ih * .17, (iw - 2 * m) / 3, ih * .66, -e.w / 6, -e.h / 2, e.w / 3, e.h); ctx.restore(); }
        break; }
      case 'brick-hit': sparks(ctx, e.x, e.y, e.age, e.type === 'bar' ? 8 : 5, e.type === 'bar' ? 70 : 34, [], 1.5, 3); break;
      case 'lure-call': { ctx.globalAlpha = 1; sparks(ctx, e.x, e.y, e.age, 8, 90, [], 2, 51); const w = g.windows.find(w => w.snake === e.snake && w.row === g.lures.find(l => l.snake === e.snake)?.lane); if (w) { const k = ease(q), x = e.x + (w.originX - e.x) * k, y = e.y + (w.y - e.y) * k; add(ctx, () => { glow(ctx, x, y, 30, col, .8 * a); glow(ctx, x, y, 12, '#fff', .8 * a); }); } break; }
      case 'lure-dim': ctx.globalAlpha = 1; glow(ctx, e.x, e.y, 26, '#7a7a9a', .35 * a); dust(ctx, e.x, e.y, e.age, e.life, 3, 12, 6, '#6b6a86'); break;
      case 'clash': {
        ctx.globalAlpha = 1; const f = e.age < .08 ? 0 : e.age < .18 ? 1 : e.age < .3 ? 2 : -1;
        add(ctx, () => { glow(ctx, e.x, e.y, 96, '#fff3d0', .6 * a * a); for (const h of e.heads || []) glow(ctx, (h.x + e.x) / 2, h.y, 52, h.x < e.x ? GN : MC, .65 * a); });
        if (f >= 0) put(ctx, `clash_${f}`, e.x, e.y, 1.25 + .05 * f);
        sparks(ctx, e.x, e.y, e.age, 14, 150, [], 2.3, 61); chips(ctx, e.x, e.y, e.age, e.life, 6, 150, .5, 7, .7);
        break; }
      case 'seal-feed': {
        ctx.globalAlpha = 1; const k = ease(clamp01(q / .78)); if (q > .8) break;
        const sx = e.x, sy = e.y, tx = e.to.x, ty = e.to.y, cx = (sx + tx) / 2 + (e.snake === 'gnash' ? -34 : 34), cy = Math.min(sy, ty) - 14;
        const at = u => ({ x: (1 - u) * (1 - u) * sx + 2 * (1 - u) * u * cx + u * u * tx, y: (1 - u) * (1 - u) * sy + 2 * (1 - u) * u * cy + u * u * ty });
        add(ctx, () => { for (let i = 0; i < 7; i++) { const p = at(Math.max(0, k - i * .035)); glow(ctx, p.x, p.y, 13 - i, col, (1 - i / 7) * .7); } });
        const p = at(k); put(ctx, plateKey(e.ward - 1), p.x, p.y, .45 + .55 * k, 1, k * 5); break; }
      case 'ward-chip': { ctx.globalAlpha = 1; const s = g.seal; if (!s) break; const p = slotAt(s, e.ward); glow(ctx, p.x, p.y, 30, '#cfe0ff', a * .6); flyPlate(ctx, p.x, p.y, e.ward % 2 ? 60 : -60, -120, e.age, plateKey(e.ward)); chips(ctx, p.x, p.y, e.age, e.life, 6, 100, .5, 11, .8); sparks(ctx, p.x, p.y, e.age, 6, 90, [], 1.8, 13); break; }
      case 'ward-shatter': { ctx.globalAlpha = 1; const s = g.seal; if (!s) break; for (let i = 0; i < (e.plates || 0); i++) { const p = slotAt(s, i); glow(ctx, p.x, p.y, 26, '#cfe0ff', a * .5); flyPlate(ctx, p.x, p.y, (i - 2.5) * 34, -110 - i * 12, e.age, plateKey(i)); chips(ctx, p.x, p.y, e.age, e.life, 3, 90, .5, 17 + i, .8); } break; }
      case 'seal-hit': { ctx.globalAlpha = 1; const s = g.seal; if (!s) break; const c = sealC(s), big = e.source === 'clash'; glow(ctx, c.x, c.y, big ? 120 : 80, '#ffe0a0', a * (big ? .6 : .45));
        chips(ctx, c.x, c.y + 6, e.age, e.life, big ? 12 : 6, big ? 190 : 120, .65, 19, .8); sparks(ctx, c.x + (rnd(e.age > 0 ? 3 : 1, 7) - .5) * 60, c.y, e.age, big ? 14 : 7, big ? 160 : 100, [], 2.1, 21); dust(ctx, c.x, c.y + 12, e.age, e.life, 4, 50, 9, '#8a8398'); break; }
      case 'dizzy-hit': ctx.globalAlpha = 1; glow(ctx, e.x, e.y, 46, GOLD, .7 * a); for (let i = 0; i < 5; i++) { const t = e.age * 9 + i * 1.26; star(ctx, e.x + Math.cos(t) * (14 + e.age * 50), e.y - 12 - e.age * 30 + Math.sin(t) * 6, 4.4 * a + 1, t, i % 2 ? '#ffe08f' : '#fff'); } sparks(ctx, e.x, e.y, e.age, 8, 100, [], 2, 23); break;
      case 'swallow': { ctx.globalAlpha = 1; const s = 1 - q; glow(ctx, e.x, e.y, 30 * (1 + q), '#ff4a5a', .5 * a); if (art.images.ball) ctx.drawImage(art.images.ball, e.x - 10 * s, e.y - 10 * s, 20 * s, 20 * s); star(ctx, e.x, e.y - 16 - q * 14, 4 * a + 1, q * 6, '#ffd0d8'); break; }
      case 'snake-hurt': { ctx.globalAlpha = 1; glow(ctx, e.x, e.y, 36, '#fff4c8', .7 * a); for (let i = 0; i < 4; i++) { const t = g.time * 7 + i * Math.PI / 2; star(ctx, e.x + Math.cos(t) * 20, e.y - 18 + Math.sin(t) * 6, 4.2, t, i % 2 ? '#ffe08f' : '#fff'); } break; }
      case 'hatch-open': { ctx.globalAlpha = 1; const k = Math.sin(Math.PI * clamp01(q)), y0 = e.y; const gr = ctx.createLinearGradient(0, y0, 0, y0 + 250); gr.addColorStop(0, '#ffe9b8'); gr.addColorStop(1, '#ffe9b800'); ctx.save(); ctx.globalAlpha = .26 * k; ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(70, y0); ctx.lineTo(290, y0); ctx.lineTo(340, y0 + 250); ctx.lineTo(20, y0 + 250); ctx.fill(); ctx.restore(); glow(ctx, 180, y0 + 4, 160, '#ffe3a0', .55 * k); dust(ctx, 180, y0 + 10, e.age, e.life, 8, 120, 16, '#c9b8a0'); sparks(ctx, 180, y0, e.age, 10, 120, [], 2.2, 29); break; }
      case 'seal-open': { ctx.globalAlpha = 1; const k = Math.sin(Math.PI * clamp01(q)), y0 = e.y; const gr = ctx.createLinearGradient(0, y0, 0, y0 + 260); gr.addColorStop(0, '#fff0c0'); gr.addColorStop(1, '#ffe3a000'); ctx.save(); ctx.globalAlpha = .3 * k; ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(100, y0); ctx.lineTo(260, y0); ctx.lineTo(350, y0 + 260); ctx.lineTo(10, y0 + 260); ctx.fill(); ctx.restore(); glow(ctx, 180, y0, 170, '#ffe3a0', .6 * k); chips(ctx, 180, y0, e.age, e.life, 10, 200, .6, 31, .8); sparks(ctx, 180, y0, e.age, 12, 140, [], 2.3, 33); break; }
      case 'seal-shatter': { ctx.globalAlpha = 1; const k = Math.sin(Math.PI * clamp01(q * 1.1)), y0 = e.y;
        glow(ctx, 180, y0, 230, '#fff0c0', .5 * k * k); add(ctx, () => { glow(ctx, 110, y0, 90, GN, .5 * k); glow(ctx, 250, y0, 90, MC, .5 * k); });
        for (let i = 0; i < 3; i++) { const t = e.age - i * .18; if (t < 0) continue; const x = 180 + (i - 1) * 56; chips(ctx, x, y0, t, 1.6, 10, 190, .8, 41 + i, .85); sparks(ctx, x, y0, t, 12, 180, [], 2.4, 47 + i); dust(ctx, x, y0 + 8, t, 1.6, 4, 60, 10, '#8a8398'); }
        break; }
      case 'volley': ctx.globalAlpha = 1; glow(ctx, e.x, e.y, 40, '#e3c6d1', a * .5); sparks(ctx, e.x, e.y, e.age, 5, 70, [], 1.8, 53); break;
      case 'arrow-hit': ctx.globalAlpha = 1; glow(ctx, e.x, e.y, 18, GOLD, a * .6); sparks(ctx, e.x, e.y, e.age, 5, 80, [], 1.6, 57); break;
      case 'ward-deploy': ctx.globalAlpha = 1; glow(ctx, e.x, e.y, 120, '#9fd0ff', a * .35); sparks(ctx, e.x, e.y, e.age, 8, 120, [], 2, 59); break;
      case 'ward-bounce': ctx.globalAlpha = 1; glow(ctx, e.x, e.y, 24, '#cfeaff', a * .6); sparks(ctx, e.x, e.y, e.age, 4, 100, [], 1.6, 29); break;
      case 'capsule-multi': case 'capsule-ram': case 'capsule-wide': { ctx.globalAlpha = 1; const c = { 'capsule-multi': '#7fe0a0', 'capsule-ram': '#ffc98a', 'capsule-wide': '#7fc4ff' }[e.kind]; glow(ctx, e.x, e.y, 50, c, a * .6); sparks(ctx, e.x, e.y, e.age, 8, 100, [], 2, 61); break; }
      default: ctx.globalAlpha = 1; sparks(ctx, e.x, e.y, e.age, 5, 50, [], 1.6);
    }
    ctx.restore();
  }
}
const CAP = { multi: ['cap_split', '#7fe0a0'], ram: ['cap_laser', '#ffc98a'], wide: ['cap_wide', '#7fc4ff'] };
function rCapsule(ctx, g, c) {
  const [key, col] = CAP[c.kind] || CAP.multi, s = SPR[key], t = g.time * 6 + c.id;
  glow(ctx, c.x, c.y, 28, col, .4 + .1 * Math.sin(t));
  for (let i = 1; i < 4; i++) { ctx.globalAlpha = .5 / i; star(ctx, c.x + Math.sin(t + i) * 3, c.y - i * 7, 1.8, t, '#fff4cc'); } ctx.globalAlpha = 1;
  if (ready(s)) ctx.drawImage(s.img, c.x - 17, c.y - 9, 34, 18.4);
}
function rArrows(ctx, g) {
  const p = g.paddle;
  if (g.volley) {
    ctx.save(); ctx.translate(p.x, p.y - 12); ctx.lineCap = 'round';
    ctx.strokeStyle = '#382e24'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-22, 3); ctx.quadraticCurveTo(0, -13, 22, 3); ctx.stroke();
    ctx.strokeStyle = '#e1cba1'; ctx.lineWidth = 2; ctx.stroke(); ctx.strokeStyle = '#e1dfd4'; ctx.lineWidth = .8;
    ctx.beginPath(); ctx.moveTo(-22, 3); ctx.lineTo(0, 9); ctx.lineTo(22, 3); ctx.stroke(); ctx.restore();
  }
  for (const s of g.shots) {
    glow(ctx, s.x, s.y + 4, 20, '#ffe3a1', .35);
    const tr = ctx.createLinearGradient(0, s.y, 0, s.y + 40); tr.addColorStop(0, '#ffe3a1aa'); tr.addColorStop(1, '#ffe3a100'); ctx.fillStyle = tr; ctx.fillRect(s.x - 1, s.y, 2, 40);
    ctx.save(); ctx.translate(s.x, s.y);
    ctx.fillStyle = '#433122'; ctx.fillRect(-1.5, -4, 3, 20); ctx.fillStyle = '#ecd5ac'; ctx.fillRect(-1.5, -4, 1.1, 20);
    ctx.fillStyle = '#d9e7e8'; ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(-4.2, -3); ctx.lineTo(0, -5.5); ctx.lineTo(4.2, -3); ctx.closePath(); ctx.fill();
    for (const side of [-1, 1]) { ctx.fillStyle = '#e0a98f'; ctx.beginPath(); ctx.moveTo(0, 11); ctx.lineTo(side * 4.4, 15); ctx.lineTo(side * 4.4, 20); ctx.lineTo(0, 17); ctx.fill(); }
    ctx.restore();
  }
}
function powerBars(ctx, g) {
  const p = g.paddle, rows = [[g.ward ? g.ward.remaining / RIVALS_TIMING.ward : 0, '#9fd0ff'], [g.volley ? (g.volley.remaining + g.shots.length) / RIVALS_TIMING.arrows : 0, '#e3c6d1'], [p.wide / RIVALS_TIMING.wide, '#7fc4ff']].filter(r => r[0] > 0);
  rows.forEach(([f, col], i) => { const y = p.y + p.h + 12 + i * 5; ctx.fillStyle = '#0c1018cc'; ctx.beginPath(); ctx.roundRect(p.x - 28, y, 56, 3.4, 2); ctx.fill(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(p.x - 28, y, 56 * clamp01(f), 3.4, 2); ctx.fill(); });
}
function shake(g) {
  let a = 0; const amp = { clash: [0, 2.6, .32], 'seal-shatter': [0, 4, .8], 'seal-open': [0, 2, .4], swallow: [0, 1.4, .2] };
  for (const e of g.effects) { const s = amp[e.kind]; if (!s || (e.kind === 'clash' && e.teaching)) continue; const t = e.age - s[0]; if (t >= 0 && t < s[2]) a = Math.max(a, s[1] * (1 - t / s[2])); }
  return a ? { x: Math.sin(g.time * 95) * a, y: Math.cos(g.time * 83) * a } : { x: 0, y: 0 };
}
const STATE = new WeakMap();
export function renderRivals(ctx, g, art) {
  const st = STATE.get(g) || STATE.set(g, { clock: 0, last: typeof performance !== 'undefined' ? performance.now() : 0 }).get(g), W = g.width, H = g.height;
  const now = typeof performance !== 'undefined' ? performance.now() : 0; st.clock += Math.min(.05, Math.max(0, (now - st.last) / 1000)); st.last = now;
  const climb = g.phase === 'climb', arrive = g.floor > 0 && !climb && g.phase !== 'shatter' && g.floorTime < .7;
  const pan = climb ? smooth(1 - g.transition / RIVALS_TIMING.climb) * CLIMB : arrive ? -(1 - smooth(g.floorTime / .7)) * CLIMB : 0, fade = climb || arrive ? 1 - .85 * Math.abs(pan) / CLIMB : 1;
  const T = 88, tile = wallTile(); for (let y = ((pan % T) + T) % T - T; y < H + 60; y += T) ctx.drawImage(tile, 0, y, 360, T + .5);
  ctx.drawImage(vignette(W, H), 0, 0, W, H);
  const sh = shake(g); ctx.save(); ctx.translate(sh.x, sh.y);
  ctx.save(); ctx.translate(0, pan); ctx.globalAlpha = fade;
  const seal = g.seal, bar0 = g.bricks.find(b => b.type === 'bar'), top = seal ? seal.y : bar0 ? bar0.y : 100, ft = seal ? seal.y - 6 : top - 6, fb = seal ? seal.y + 38 : top + 26;
  const busy = [...g.windows, ...g.shutters].map(w => w.y);
  for (let i = 0, y = ft - 54; y < g.paddle.y; y += 74, i++) { if (y < 20 || busy.some(b => Math.abs(b - y) < 46)) continue; lantern(ctx, g, i % 2 ? 334 : 26, y); }
  // Hall light: emerald down the left pillar, violet down the right, brighter where a serpent is out.
  for (const w of g.windows) windowLight(ctx, g, w, g.lunges.some(l => l.win === w));
  wallDressing(ctx, g, 4, ft);
  gateFrame(ctx, g, ft, fb);
  if (g.phase === 'shatter') doorLight(ctx, g, ft, fb, RIVALS_TIMING.shatter - g.transition);
  if (g.chamber) drawChamber(ctx, g, st);
  // Windows: back recess, serpent clipped to the opening, front arch. Mooncoil's shuttered windows are scenery on floor 1.
  for (const s of g.shutters) drawShutter(ctx, g, s, st);
  for (const w of g.windows) {
    const l = g.lunges.find(l => l.win === w), x = w.originX, y = w.y;
    ctx.save(); ctx.translate(x, y); ctx.scale(WS, WS);
    drawCastleWindow(ctx, 0, 0, l ? gi => { gi.save(); gi.scale(1 / WS, 1 / WS); gi.translate(-x, -y); glow(gi, x + w.dir * 4, y, 24, COL[w.snake], .22); drawLunge(gi, g, l); gi.restore(); } : null);
    ctx.restore();
  }
  for (const b of g.bricks) if (b.hp > 0 && b.type === 'brick') lbrick(ctx, b);
  for (const l of g.lures) drawLure(ctx, g, l, st);
  hatchBars(ctx, g); drawSeal(ctx, g, st);
  rEffects(ctx, g, art, true);
  for (const e of g.effects) if (e.kind === 'bite-warning') { const w = g.windows.find(w => w.row === e.row && w.side === e.side); if (w) biteBand(ctx, g, w, clamp01(e.age / e.life) ** 1.3); }
  for (const l of g.lunges) if (l.stage === 'strike' || l.stage === 'chew') biteBand(ctx, g, l.win, l.stage === 'strike' ? .9 : Math.max(0, .5 - l.t));
  // Emerged serpents: the same path, beyond the opening edge, in front of the frame.
  for (const l of g.lunges) {
    const w = l.win; ctx.save(); ctx.beginPath(); if (w.dir > 0) ctx.rect(w.originX + HALF, -60, W, H + 120); else ctx.rect(w.originX - HALF - W, -60, W, H + 120); ctx.clip(); drawLunge(ctx, g, l); ctx.restore();
    if (l.stage === 'dizzy') { const h = l.points[0]; if (h) { glow(ctx, h.x, h.y, 44, GOLD, .22 + .14 * Math.sin(g.time * 8)); for (let i = 0; i < 3; i++) { const t = g.time * 5 + i * 2.1 + l.id; star(ctx, h.x + Math.cos(t) * 18, h.y - 22 + Math.sin(t) * 5, 4, t, i % 2 ? '#ffe08f' : '#fff'); } } }
  }
  let said = false; for (const l of g.lunges) if (l.teaching && l.stage === 'hiss' && !said) { said = true; const w = l.win, tw = 124; ctx.save(); ctx.fillStyle = '#0b0a18cc'; ctx.beginPath(); ctx.roundRect(180 - tw / 2, w.y - 40, tw, 17, 8); ctx.fill(); text(ctx, 'SAFE THIS TIME', 180, w.y - 31, 11, '#ffd0d8', 'center'); ctx.restore(); }
  if (g.effects.some(e => e.kind === 'clash' && e.teaching)) st.taught = g.time;
  if (st.taught !== undefined && g.chamber && g.time - st.taught < 3.6) {
    const c = g.chamber, u = g.time - st.taught, k = clamp01(u * 4) * clamp01((3.6 - u) * 2);
    ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = '#0b0a18f0'; ctx.beginPath(); ctx.roundRect(180 - 80, c.y + c.h + 7, 160, 18, 9); ctx.fill();
    ctx.strokeStyle = '#d6a35f88'; ctx.lineWidth = .8; ctx.stroke(); text(ctx, 'STRIKE A RUNE TO BAIT IT', 180, c.y + c.h + 16.5, 10.5, GOLD, 'center'); ctx.restore();
  }
  for (const c of g.capsules) rCapsule(ctx, g, c);
  rEffects(ctx, g, art);
  ctx.restore();
  gWard(ctx, g, art);
  gPaddle(ctx, g, art, skinFor(art, 'kit'), 'pip_gold'); powerBars(ctx, g); rArrows(ctx, g);
  for (const b of g.balls) if (!b.dead) gBall(ctx, g, art, b);
  ctx.restore();
  // Floor chip and banner.
  const n = g.floor + 1 + (climb ? 1 : 0); ctx.save(); ctx.globalAlpha = .85; ctx.fillStyle = '#0b0d18cc'; ctx.beginPath(); ctx.roundRect(W / 2 - 40, 6, 80, 17, 8.5); ctx.fill(); ctx.strokeStyle = '#d6a35f88'; ctx.lineWidth = .8; ctx.stroke(); ctx.restore();
  text(ctx, `FLOOR ${Math.min(3, n)} / 3`, W / 2, 15, 10.5, '#f3dca8', 'center');
  if (climb) gBanner(ctx, g, `FLOOR ${n} / 3 · ${RIVALS_FLOORS[Math.min(2, n - 1)].toUpperCase()}`, Math.min(1, (1 - g.transition / RIVALS_TIMING.climb) * 4));
  else if (g.floorTime < 1.6 && g.phase !== 'shatter' && g.state === 'play') gBanner(ctx, g, `FLOOR ${n} / 3 · ${RIVALS_FLOORS[g.floor].toUpperCase()}`, g.floor ? Math.min(1, (1.6 - g.floorTime) * 1.6) : 1);
}
// The Clash Chamber: the rendered floor plate, lit by whichever serpent waits on it (emerald from the left, violet from the right).
function drawChamber(ctx, g, st) {
  const c = g.chamber, cx = c.x + c.w / 2, cy = c.y + c.h / 2;
  put(ctx, 'chamber_floor', cx, cy);
  const waiting = g.lunges.filter(l => l.win.cross && (l.stage === 'prowl' || l.stage === 'strike' || l.stage === 'clash' || l.stage === 'recoil' || l.stage === 'dizzy'));
  for (const l of waiting) { const k = l.stage === 'prowl' || l.stage === 'strike' ? .22 + .1 * Math.sin(st.clock * 7) : .3; add(ctx, () => glow(ctx, cx + l.win.dir * -30, cy, 56, COL[l.snake], k)); }
}
// Shared with the Hoard renderer (hoard-render.js).
export { rCapsule, rArrows };
