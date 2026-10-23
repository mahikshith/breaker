import { ART } from '../vault-art.js';
import { SPR, ready, cached, text, loadImg } from '../gfx.js';
import { HOARD_FLOORS, HOARD_TIMING, HOARD_LAYOUT, GREED, RAGE } from './hoard.js';
import { glow, sparks, chips, dust, rnd, clamp01, smooth, gBanner, gPaddle, gBall, gWard, skinFor, slab, pips, CLIMB } from './render.js';
import { lbrick, star } from './lumi-render.js';
import { rCapsule, rArrows } from './rivals-render.js';

// Dragon's Hoard. Ember is a lit bust behind the cave ledge (scenery, no collider): his eight rendered expressions crossfade
// as the model's emberFace() changes. Every solid is drawn on its model rect: glazed bricks on the 32x16 cells, the Crown chest
// fitted to its 100x52 block, the Gatehouse counterweight art on each weight's housing rect, and the cave gate's two leaves on
// the ceiling span the ball strikes. Tells are filled light (a heat column for a roar, a glowing row for a breath), never rings.
const HS = Object.fromEntries(Object.entries(ART.hoard || {}).map(([k, v]) => [k, { ...v, img: loadImg(v.url) }]));
const EMBER = { x: 96, y: 147 }, EYE = { x: 306, y: 40, hw: 28, hh: 13 }, CHIP = 228, GOLD = '#ffe3a1', FIRE = '#ff8a3a';
const COUNTERWEIGHT = [19, 21, 281, 311];
const add = (ctx, fn) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; fn(); ctx.restore(); };
const alpha = ctx => typeof ctx.globalAlpha === 'number' ? ctx.globalAlpha : 1;
function put(ctx, key, x, y, k = 1, a = 1, rot = 0) {
  const s = HS[key]; if (!s || !ready(s)) return false;
  const o = alpha(ctx); ctx.globalAlpha = o * a;
  if (rot) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.drawImage(s.img, -s.anchor[0] * k, -s.anchor[1] * k, s.uw * k, s.uh * k); ctx.restore(); }
  else ctx.drawImage(s.img, x - s.anchor[0] * k, y - s.anchor[1] * k, s.uw * k, s.uh * k);
  ctx.globalAlpha = o; return true;
}
function pool(ctx, x, y, rx, ry, colour, a) { ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx); glow(ctx, 0, 0, rx, colour, a); ctx.restore(); }

// ---------- buttons (model space; chapter.js hit-tests them) ----------
export function hoardButtons(g) {
  if (g.state !== 'play') return {};
  if (g.phase === 'greed') return { run: { x: 44, y: 352, w: 130, h: 58 }, stay: { x: 186, y: 352, w: 130, h: 58 } };
  if (g.greed && !g.greed.caught && g.floor === 1 && (g.phase === 'play' || g.phase === 'serve')) return { flee: { x: g.width - 98, y: g.height - 52, w: 86, h: 34 } };
  return {};
}

// ---------- cave ----------
// TODO(art): the cave plate was never rendered. This is a calm placeholder: cool dark rock strata, a faint warm bloom
// where the hoard sits, no yellow wash. Swap in assets/hoard/cave.png (drawn at width x height) when it lands.
function cave(W, H) {
  return cached(`hoard-cave-${W}-${H}`, W, H, c => {
    const gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#16121c'); gr.addColorStop(.35, '#120f18'); gr.addColorStop(1, '#09080d'); c.fillStyle = gr; c.fillRect(0, 0, W, H);
    // Rock strata: low-contrast slanted slabs.
    for (let i = 0; i < 26; i++) {
      const y = rnd(i, 1) * H, x = rnd(i, 2) * W - 60, w = 80 + rnd(i, 3) * 160, h = 18 + rnd(i, 4) * 40, l = 8 + rnd(i, 5) * 5;
      c.fillStyle = `hsl(${250 + rnd(i, 6) * 30} 14% ${l}%)`; c.beginPath(); c.moveTo(x, y + h * .3); c.lineTo(x + w * .2, y); c.lineTo(x + w, y + h * .15); c.lineTo(x + w * .9, y + h); c.lineTo(x + w * .1, y + h * .9); c.closePath(); c.fill();
      c.fillStyle = '#ffffff08'; c.fillRect(x + w * .25, y + 1, w * .5, 1.2);
    }
    // The hoard's warm bounce under the ledge, very soft.
    const wb = c.createRadialGradient(W * .3, 150, 10, W * .3, 150, 260); wb.addColorStop(0, '#ff9a4a1c'); wb.addColorStop(1, '#ff9a4a00'); c.fillStyle = wb; c.fillRect(0, 0, W, H);
    const vg = c.createRadialGradient(W / 2, H * .46, H * .25, W / 2, H * .46, H * .8); vg.addColorStop(0, '#0000'); vg.addColorStop(1, '#03020699'); c.fillStyle = vg; c.fillRect(0, 0, W, H);
  });
}
// The ledge Ember lies behind; on floor 3 the gate takes the middle-right span.
function ledgeSlab(ctx, g, art) {
  const C = g.ceiling, gt = g.gate, y = C - 16;
  const pieces = gt ? [[0, gt.x - 10], [gt.x + gt.w + 10, g.width]] : [[0, g.width]];
  for (const [a, b] of pieces) if (b > a) slab(ctx, art, a, y, b - a, 16);
  const sh = ctx.createLinearGradient(0, C, 0, C + 22); sh.addColorStop(0, '#000a'); sh.addColorStop(1, '#0000'); ctx.fillStyle = sh; ctx.fillRect(0, C, g.width, 22);
}
// The pile of gold in front of Ember's bust, sparkling; it thins as Kit loots.
function coinPile(ctx, g, st) {
  const k = 1 - .35 * clamp01(g.loot / 600), y = g.ceiling - 14;
  for (let i = 0; i < 9; i++) {
    const x = 26 + i * 20 + (rnd(i, 3) - .5) * 6, key = i % 2 ? 'coin_chips_a' : 'coin_chips_b', s = (.62 + .25 * rnd(i, 4)) * k;
    put(ctx, key, x, y + 2 - 6 * s * Math.sin(Math.PI * (i + .5) / 9), s);
  }
  for (let i = 0; i < 6; i++) { const t = (st.clock * .7 + i * .37) % 1, x = 30 + rnd(i, 9) * 160, yy = y - 4 - rnd(i, 10) * 8; add(ctx, () => star(ctx, x, yy, 2.6 * Math.sin(Math.PI * t), t * 4, '#fff6d0')); }
}
// ---------- Ember ----------
function drawEmber(ctx, g, st) {
  const face = g.emberFace();
  if (face !== st.face) { st.prev = st.face; st.face = face; st.faceAt = st.clock; }
  const q = clamp01((st.clock - st.faceAt) / .14), e = g.ember, t = st.clock;
  let dx = 0, dy = Math.sin(t * 1.6) * 1.2, k = 1 + .012 * Math.sin(t * 1.6), rot = 0;
  if (face === 'windup') { const w = clamp01((g.floorTime - e.at) / g.rules.tell); dx = 3 * w; k *= 1 + .05 * w; dy -= 3 * w; }
  else if (face === 'attack') { dx = 4; k *= 1.06; dy -= 4; }
  else if (face === 'hurt' || face === 'stagger') { dx = Math.sin(t * 40) * 1.6 * (1 - clamp01((st.clock - st.faceAt) / .5)); rot = face === 'stagger' ? Math.sin(t * 5) * .05 : 0; }
  else if (face === 'panic') { dx = Math.sin(t * 31) * .9; }
  else if (face === 'defeat') { dy += 5; }
  // Lit villain: a warm key light behind his head, a fire glow during tells, a soft shadow on the rock.
  const hx = EMBER.x + dx, hy = EMBER.y - 72, heat = face === 'windup' ? .3 + .4 * clamp01((g.floorTime - e.at) / g.rules.tell) : face === 'attack' ? .65 : 0;
  pool(ctx, EMBER.x + 10, EMBER.y - 50, 70, 60, '#000', .45);
  glow(ctx, hx - 6, hy, 92, '#ffb46a', .16 + .06 * Math.sin(t * 1.3));
  if (heat) add(ctx, () => glow(ctx, hx + 30, hy + 22, 80, FIRE, heat * (.8 + .2 * Math.sin(t * 22))));
  if (g.floorTime < e.calm) add(ctx, () => glow(ctx, hx, hy, 70, '#7fd7ff', .2 * clamp01(e.calm - g.floorTime)));
  ctx.save(); ctx.translate(EMBER.x + dx, EMBER.y + dy); ctx.rotate(rot); ctx.scale(k, k);
  if (st.prev && q < 1) put(ctx, `ember_${st.prev}`, 0, 0, 1, 1 - q);
  put(ctx, `ember_${face}`, 0, 0, 1, st.prev ? q : 1);
  ctx.restore();
  // Snoring: drifting Z's while the eye is shut on floor 1.
  if (face === 'idle' && g.wake < 30 && g.floor === 0) for (let i = 0; i < 2; i++) { const u = (t * .35 + i * .5) % 1; ctx.save(); ctx.globalAlpha = Math.sin(Math.PI * u) * .75; text(ctx, 'z', EMBER.x + 56 + u * 18, EMBER.y - 108 - u * 26, 9 + u * 6, '#cfe6ff', 'center'); ctx.restore(); }
}
// The Wake eye: an almond socket whose lid lifts as the eye opens; a slim bar under it for the exact level.
function wakeEye(ctx, g, st) {
  const f = g.floor === 2 ? 1 : clamp01(g.wake / 100), e = g.ember, hot = e.stage === 'windup' || e.stage === 'release' || g.floor === 2, t = st.clock;
  const { x, y, hw, hh } = EYE, calm = g.floorTime < e.calm, almond = () => { ctx.beginPath(); ctx.moveTo(x - hw, y); ctx.quadraticCurveTo(x, y - hh * 2, x + hw, y); ctx.quadraticCurveTo(x, y + hh * 2, x - hw, y); ctx.closePath(); };
  ctx.save(); ctx.fillStyle = '#0b0910cc'; ctx.beginPath(); ctx.roundRect(x - hw - 8, y - hh - 8, hw * 2 + 16, hh * 2 + 26, 12); ctx.fill(); ctx.strokeStyle = '#d6a35f66'; ctx.lineWidth = .8; ctx.stroke(); ctx.restore();
  glow(ctx, x, y, 40, calm ? '#7fd7ff' : hot ? '#ff5a2a' : '#ff9a4a', (calm ? .25 : .12) + .45 * f * f);
  ctx.save(); almond(); ctx.fillStyle = '#1a0c08'; ctx.fill(); ctx.clip();
  const ix = x + (g.balls[0] ? clamp01(g.balls[0].x / g.width) - .5 : 0) * 8, ir = hh * 1.05;
  const iris = ctx.createRadialGradient(ix - 2, y - 3, 1, ix, y, ir); iris.addColorStop(0, '#fff2b0'); iris.addColorStop(.35, hot ? '#ff9a2a' : '#ffc84a'); iris.addColorStop(1, hot ? '#7a1406' : '#7a3a08');
  ctx.fillStyle = iris; ctx.beginPath(); ctx.arc(ix, y, ir, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#120604'; ctx.beginPath(); ctx.ellipse(ix, y, 1.6 + 1.6 * (1 - f), ir * .82, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffffb0'; ctx.beginPath(); ctx.ellipse(ix - 4, y - 4, 2.2, 1.4, -.5, 0, Math.PI * 2); ctx.fill();
  // Lids: the upper lid hangs down to the opening, the lower lid rises a little; scale-coloured with a dark lash band.
  const open = .08 + .92 * f, top = y - hh, lid = top + (1 - open) * hh * 1.9 + (g.floor < 2 && f < .99 ? Math.sin(t * 2.2) * .6 : 0);
  const lg = ctx.createLinearGradient(0, top - 4, 0, lid); lg.addColorStop(0, '#4b4466'); lg.addColorStop(1, '#2a2440'); ctx.fillStyle = lg; ctx.fillRect(x - hw, top - 6, hw * 2, lid - top + 6);
  ctx.fillStyle = '#0c0812'; ctx.fillRect(x - hw, lid - 1.6, hw * 2, 2.2);
  const low = y + hh - (1 - open) * hh * .5; ctx.fillStyle = '#2a2440'; ctx.fillRect(x - hw, low, hw * 2, hh + 6);
  ctx.restore();
  // Bar: teal (asleep) to amber to red; the floor-3 rage marks sit at 40 and 75.
  const bw = hw * 2, bx = x - hw, by = y + hh + 5;
  ctx.fillStyle = '#05060dcc'; ctx.beginPath(); ctx.roundRect(bx - 1.5, by - 1.5, bw + 3, 7, 3.5); ctx.fill();
  const gr = ctx.createLinearGradient(bx, 0, bx + bw, 0); gr.addColorStop(0, '#6fd6c8'); gr.addColorStop(.5, '#ffc84a'); gr.addColorStop(1, '#ff4a2a');
  ctx.fillStyle = gr; ctx.beginPath(); ctx.roundRect(bx, by, Math.max(4, bw * f), 4, 2); ctx.fill();
  if (g.floor === 1) for (const a of RAGE.at) { ctx.fillStyle = '#0b0910'; ctx.fillRect(bx + bw * a / 100 - .6, by - 1, 1.2, 6); }
  if (g.greed && !g.greed.caught && g.floor === 1 && f > .7) add(ctx, () => glow(ctx, x, y, 46, '#ff3a1a', (f - .7) * 1.6 * (.6 + .4 * Math.sin(t * 12))));
}
function lootPill(ctx, g) {
  const x = CHIP, y = 34, w = 84, mult = g.mult > 1 ? ` ×${g.mult}` : '';
  ctx.save(); ctx.globalAlpha = .9; ctx.fillStyle = '#0b0d18cc'; ctx.beginPath(); ctx.roundRect(x - w / 2, y - 8.5, w, 17, 8.5); ctx.fill(); ctx.strokeStyle = '#d6a35f88'; ctx.lineWidth = .8; ctx.stroke(); ctx.restore();
  put(ctx, 'coin', x - w / 2 + 10, y, .85);
  text(ctx, `${g.loot}${mult}`, x + 6, y + .5, 10.5, g.mult > 1 ? '#ffd27a' : '#f3dca8', 'center');
}
// ---------- props ----------
const tileCache = (key, w, h) => cached(`hoard-tile-${key}-${w}-${h}`, w + 12, h + 14, c => {
  const s = SPR[key], P = 6, k = w / 32;
  c.save(); c.shadowColor = '#000000a0'; c.shadowBlur = 5; c.shadowOffsetX = 1.2; c.shadowOffsetY = 2.6; c.drawImage(s.img, P - 4 * k, P - 4 * k, 40 * k, 24 * k); c.restore();
  c.save(); c.beginPath(); c.roundRect(P + 1.6, P + 1.2, w - 3.2, h * .46, [3.2, 3.2, 1.5, 1.5]); c.clip();
  const gl = c.createLinearGradient(0, P, 0, P + h * .5); gl.addColorStop(0, '#ffffff55'); gl.addColorStop(.55, '#ffffff14'); gl.addColorStop(1, '#ffffff00'); c.fillStyle = gl; c.fillRect(P, P, w, h); c.restore();
});
function tile(ctx, key, b, a = 1) {
  if (!ready(SPR[key])) { ctx.fillStyle = '#a07a2a'; ctx.fillRect(b.x, b.y, b.w, b.h); return; }
  const o = alpha(ctx); ctx.globalAlpha = o * a; ctx.drawImage(tileCache(key, b.w, b.h), b.x - 6, b.y - 6, b.w + 12, b.h + 14); ctx.globalAlpha = o;
}
function drawBrick(ctx, g, b, st) {
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  switch (b.kind) {
    case 'brick': return lbrick(ctx, b);
    case 'coin': if (b.spilled) glow(ctx, cx, cy, 20, GOLD, .14); return tile(ctx, 'brick_coin_2_0', b);
    case 'chest': return tile(ctx, b.hp < b.maxHP ? 'brick_chest_2_1' : 'brick_chest_2_0', b);
    case 'molten': {
      const left = clamp01(b.molten / (b.moltenFor || 1)), p = .5 + .5 * Math.sin(st.clock * 9 + b.col);
      add(ctx, () => glow(ctx, cx, cy + 2, 26, FIRE, (.25 + .3 * p) * (.4 + .6 * left)));
      tile(ctx, 'brick_gold_2_0', b);
      add(ctx, () => { ctx.globalAlpha = (.35 + .25 * p) * left; ctx.fillStyle = '#ff6a1a'; ctx.beginPath(); ctx.roundRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2, 3); ctx.fill(); });
      // A drip forming under the brick while it is still soft.
      const d = (st.clock * .8 + b.col * .3) % 1; ctx.save(); ctx.globalAlpha = left * Math.sin(Math.PI * d); ctx.fillStyle = '#ffb24a'; ctx.beginPath(); ctx.ellipse(b.x + 8 + (b.col * 7) % 16, b.y + b.h + 2 + d * 4, 1.6, 2.2 + d * 1.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      return;
    }
    case 'hard': return tile(ctx, b.hp < b.maxHP ? 'brick_gold_2_2' : 'brick_gold_2_1', b);
    case 'chime': {
      const lit = b.lit, p = .5 + .5 * Math.sin(st.clock * 3 + b.col);
      if (lit) add(ctx, () => glow(ctx, cx, cy, 30, '#7fe8ff', .22 + .18 * p));
      tile(ctx, 'brick_t_2_x', b, lit ? 1 : .55);
      bellIcon(ctx, cx, cy, lit ? 1 : .45, lit ? Math.sin(st.clock * 4 + b.col) * .12 : 0);
      if (!lit && b.cool > 0) { const f = 1 - b.cool / HOARD_TIMING.chimeCool; ctx.fillStyle = '#05060dcc'; ctx.fillRect(b.x + 4, b.y + b.h - 3.5, b.w - 8, 2.2); ctx.fillStyle = '#7fe8ff'; ctx.fillRect(b.x + 4, b.y + b.h - 3.5, (b.w - 8) * f, 2.2); }
      return;
    }
    case 'crown': {
      const hit = g.effects.find(e => e.kind === 'crown-hit' && e.age < .25), sx = hit ? Math.sin(hit.age * 80) * 2 * (1 - hit.age / .25) : 0;
      add(ctx, () => glow(ctx, cx, cy, 70, GOLD, .14 + .06 * Math.sin(st.clock * 2)));
      pool(ctx, cx + 2, b.y + b.h + 1, b.w * .5, 4, '#000', .5);
      if (!put(ctx, b.hp <= b.maxHP / 2 ? 'crown_chest_cracked' : 'crown_chest', cx + sx, cy)) { ctx.fillStyle = '#6a3f22'; ctx.fillRect(b.x, b.y, b.w, b.h); }
      pips(ctx, cx, b.y + b.h + 7, b.maxHP, b.hp, { gap: 8.6, scale: .8 });
      return;
    }
    case 'weight': return drawWeight(ctx, g, b);
  }
}
// A small rendered-style bell for the Hush Chime: filled bronze body, lip and clapper; no outline.
function bellIcon(ctx, x, y, a, rot) {
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y - 1); ctx.rotate(rot);
  const g = ctx.createLinearGradient(-5, 0, 5, 0); g.addColorStop(0, '#7a5a26'); g.addColorStop(.4, '#ffe7a0'); g.addColorStop(1, '#8a6224');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-1.6, -5); ctx.quadraticCurveTo(-4.4, -4.6, -4.6, 1); ctx.lineTo(-6, 3.4); ctx.lineTo(6, 3.4); ctx.lineTo(4.6, 1); ctx.quadraticCurveTo(4.4, -4.6, 1.6, -5); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#5a3e16'; ctx.beginPath(); ctx.ellipse(0, 4.4, 1.6, 1.4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffffaa'; ctx.fillRect(-2.6, -2.6, 1, 3.4);
  ctx.restore();
}
function drawWeight(ctx, g, h) {
  const art = drawWeight.art, img = art?.images['tidewheel/counterweight'], m = art?.manifest.tidewheel.counterweight;
  const hit = g.effects.find(e => (e.kind === 'weight-hit') && Math.abs(e.x - (h.x + h.w / 2)) < 1 && e.age < .3), sx = hit ? Math.sin(hit.age * 70) * 3 * (1 - hit.age / .3) : 0, x = h.x + sx;
  pool(ctx, h.x + h.w / 2 + 3, h.y + h.h + 3, h.w * .45, 4, '#000', .45);
  if (img && m) { const k = img.width / m.size[0]; ctx.drawImage(img, COUNTERWEIGHT[0] * k, COUNTERWEIGHT[1] * k, COUNTERWEIGHT[2] * k, COUNTERWEIGHT[3] * k, x, h.y, h.w, h.h); }
  else { ctx.fillStyle = '#4a4a52'; ctx.fillRect(x, h.y + 11, h.w, h.h - 11); }
  for (let i = 0; i < h.maxHP - h.hp; i++) {
    const rx = h.w * (.25 + .5 * rnd(i, Math.round(h.x) + 1)), ry = h.y + 14 + h.h * .5 * rnd(i, Math.round(h.x) + 2);
    ctx.fillStyle = '#0e0b09'; ctx.beginPath(); ctx.moveTo(x + rx, ry); ctx.lineTo(x + rx + 4, ry + 9); ctx.lineTo(x + rx + 1.2, ry + 9.6); ctx.lineTo(x + rx - 2, ry + 17); ctx.lineTo(x + rx + 2.6, ry + 9); ctx.lineTo(x + rx - .8, ry + 8.6); ctx.closePath(); ctx.fill();
  }
  pips(ctx, h.x + h.w / 2, h.y + h.h + 8, h.maxHP, h.hp, { gap: 8.6, scale: .8 });
}
// Floor 3's cave gate: two iron-banded leaves fitted to the ceiling span; daylight leaks through as it weakens.
function drawGate(ctx, g, art, st) {
  const d = g.gate; if (!d) return;
  const x = d.x, y = d.y, w = d.w, h = d.h, f = 1 - d.hp / d.maxHP, esc = g.phase === 'escape' ? 1 - g.transition / HOARD_TIMING.escape : 0;
  const hit = g.effects.find(e => e.kind === 'gate-hit' && e.age < .25), sx = hit ? Math.sin(hit.age * 90) * 1.6 * (1 - hit.age / .25) : 0;
  // Recess and daylight behind the leaves.
  ctx.fillStyle = '#07060a'; ctx.fillRect(x - 10, y - 8, w + 20, h + 8);
  const day = ctx.createLinearGradient(0, y, 0, y + h); day.addColorStop(0, '#fff0c8'); day.addColorStop(1, '#ffc87a'); ctx.save(); ctx.globalAlpha = clamp01(.15 + f * .5 + esc); ctx.fillStyle = day; ctx.fillRect(x, y, w, h); ctx.restore();
  const img = art.images['tidewheel/gate'], m = art.manifest.tidewheel.gate, open = smooth(esc * 1.6);
  for (const side of [0, 1]) {
    const lw = w / 2, lx = x + side * lw, sw = lw * (1 - .92 * open);
    ctx.save(); ctx.beginPath(); ctx.rect(side ? x + w - sw : lx, y, sw, h); ctx.clip();
    if (img && m) {
      const a = m.anchors.panelTopLeft, z = m.anchors.panelBottomRight, fw = sw / (z[0] - a[0]), fh = h / (z[1] - a[1]);
      ctx.drawImage(img, (side ? x + w - sw : lx) - a[0] * fw + sx, y - a[1] * fh, fw, fh);
    } else { ctx.fillStyle = '#5a3a22'; ctx.fillRect(lx, y, lw, h); }
    // Cracks: dark filled slivers, more with damage.
    for (let i = 0; i < Math.round(f * 6); i++) { const cx = (side ? x + w - sw : lx) + sw * (.2 + .6 * rnd(i, side + 3)), cy = y + h * (.15 + .6 * rnd(i, side + 5)); ctx.fillStyle = '#120a06'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + 5, cy + 9); ctx.lineTo(cx + 1, cy + 9.5); ctx.lineTo(cx - 2, cy + 18); ctx.lineTo(cx + 3.4, cy + 8.6); ctx.lineTo(cx - .6, cy + 8); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  }
  if (f > .3 && !esc) add(ctx, () => { ctx.globalAlpha = (f - .3) * .5 * (.8 + .2 * Math.sin(st.clock * 3)); ctx.fillStyle = '#ffe2a0'; ctx.fillRect(x + w / 2 - 1.2, y + 3, 2.4, h - 6); });
  // Posts and lintel.
  slab(ctx, art, x - 12, y - 10, w + 24, 12);
  for (const px of [x - 10, x + w]) { const pg = ctx.createLinearGradient(px, 0, px + 10, 0); pg.addColorStop(0, '#2a2630'); pg.addColorStop(.4, '#6a6270'); pg.addColorStop(1, '#1c1a22'); ctx.fillStyle = pg; ctx.fillRect(px, y - 2, 10, h + 2); }
  if (!esc) {
    const bw = 96, bx = x + w / 2 - bw / 2, by = y - 18, ff = clamp01(d.hp / d.maxHP);
    ctx.fillStyle = '#05060dcc'; ctx.beginPath(); ctx.roundRect(bx - 1.5, by - 1.5, bw + 3, 7, 3.5); ctx.fill();
    const gr = ctx.createLinearGradient(bx, 0, bx + bw, 0); gr.addColorStop(0, '#c98a5b'); gr.addColorStop(1, '#ffe3a1'); ctx.fillStyle = gr; ctx.beginPath(); ctx.roundRect(bx, by, Math.max(4, bw * ff), 4, 2); ctx.fill();
  } else add(ctx, () => { glow(ctx, x + w / 2, y + h, 160, '#fff0c8', .5 * open); });
}
// ---------- tells ----------
function tells(ctx, g, st) {
  const e = g.ember, p = g.paddle; if (e.stage !== 'windup' && e.stage !== 'release') return;
  const wind = e.stage === 'windup', q = wind ? clamp01((g.floorTime - e.at) / g.rules.tell) : 1 - clamp01((e.until - g.floorTime) / HOARD_TIMING.release), pulse = .75 + .25 * Math.sin(st.clock * (10 + 14 * q));
  const col = e.teaching ? '#9fd6ff' : FIRE;
  if (e.stripe) {
    const x = e.stripe.x, hw = e.stripe.w / 2, y0 = g.ceiling, y1 = p.y + p.h + 8;
    add(ctx, () => {
      const v = ctx.createLinearGradient(x - hw, 0, x + hw, 0), a = wind ? (.06 + .26 * q) * pulse : .55 * (1 - q);
      v.addColorStop(0, '#0000'); v.addColorStop(.5, e.teaching ? `rgba(140,200,255,${a})` : `rgba(255,120,50,${a})`); v.addColorStop(1, '#0000');
      ctx.fillStyle = v; ctx.fillRect(x - hw, y0, hw * 2, y1 - y0);
      pool(ctx, x, p.y + p.h / 2, hw, 7, col, (wind ? .25 + .5 * q : .8 * (1 - q)) * pulse);
    });
    if (!wind && !e.teaching) { sparks(ctx, x, p.y, q * .42, 10, 140, [], 2.2, 71); }
  }
  if (e.row !== null) {
    const ry = g.rowY(e.row), h = 22;
    add(ctx, () => {
      const v = ctx.createLinearGradient(0, ry - h, 0, ry + h), a = wind ? (.08 + .3 * q) * pulse : .6 * (1 - q);
      v.addColorStop(0, '#0000'); v.addColorStop(.5, e.teaching ? `rgba(140,200,255,${a})` : `rgba(255,130,40,${a})`); v.addColorStop(1, '#0000');
      ctx.fillStyle = v; ctx.fillRect(0, ry - h, g.width, h * 2);
    });
    if (!wind) {
      // The breath sweeps across the row from Ember's side.
      const fx = -40 + q * (g.width + 80);
      add(ctx, () => { for (let i = 0; i < 6; i++) glow(ctx, fx - i * 26, ry + Math.sin(st.clock * 30 + i) * 3, 26 - i * 2.5, i < 2 ? '#ffe2a0' : FIRE, (e.teaching ? .25 : .55) * (1 - i / 6)); });
    }
  }
}
// ---------- effects ----------
const BRICK = { t: 't', v: 'v', c: 'c', b: 'b' };
function shards(ctx, e, key) {
  const s = SPR[key]; if (!ready(s)) return;
  for (let n = 0; n < 3; n++) {
    const t = e.age, x = e.x + (n - 1) * (8 + t * 45), y = e.y - 45 * t + 180 * t * t, iw = s.img.naturalWidth, ih = s.img.naturalHeight, m = iw * .1;
    ctx.save(); ctx.translate(x, y); ctx.rotate((n - 1) * t * 5);
    ctx.drawImage(s.img, m + n * (iw - 2 * m) / 3, ih * .17, (iw - 2 * m) / 3, ih * .66, -(e.w || 32) / 6, -(e.h || 16) / 2, (e.w || 32) / 3, e.h || 16); ctx.restore();
  }
}
const keyOf = e => e.kind === 'coin' ? 'brick_coin_2_0' : e.kind === 'chest' ? 'brick_chest_2_1' : e.kind === 'molten' || e.kind === 'hard' ? 'brick_gold_2_2' : e.kind === 'chime' ? 'brick_t_2_x' : `brick_${BRICK[e.colour] || 'v'}_2_0`;
function coinsFly(ctx, e, n, to) {
  for (let i = 0; i < n; i++) {
    const d = i * .05, u = smooth(clamp01((e.age - d) / (e.life - d - .05))); if (u <= 0 || u >= 1) continue;
    const cx = (e.x + to.x) / 2 + (rnd(i, 5) - .5) * 60, cy = Math.min(e.y, to.y) - 30 - rnd(i, 6) * 30;
    const x = (1 - u) ** 2 * e.x + 2 * (1 - u) * u * cx + u * u * to.x, y = (1 - u) ** 2 * e.y + 2 * (1 - u) * u * cy + u * u * to.y;
    add(ctx, () => glow(ctx, x, y, 9, GOLD, .5 * (1 - u * .5)));
    put(ctx, 'coin', x, y, .8 - .25 * u, 1, u * 8 + i);
  }
}
function hEffects(ctx, g, st) {
  for (const e of g.effects) {
    const q = e.age / e.life, a = 1 - q; ctx.save(); ctx.globalAlpha = a;
    switch (e.kind) {
      case 'brick-break': ctx.globalAlpha = 1; shards(ctx, e, keyOf(e)); if (e.kind === 'chest') chips(ctx, e.x, e.y, e.age, e.life, 5, 80, .5, 3, .8); break;
      case 'brick-hit': ctx.globalAlpha = 1; sparks(ctx, e.x, e.y, e.age, 5, 40, [], 1.5, 3); break;
      case 'loot': ctx.globalAlpha = 1; coinsFly(ctx, e, e.loot >= 30 ? 6 : e.loot >= 10 ? 3 : 2, { x: CHIP - 32, y: 34 }); break;
      case 'spill': ctx.globalAlpha = 1; add(ctx, () => glow(ctx, e.x, e.y, 26, GOLD, .6 * a)); sparks(ctx, e.x, e.y, e.age, 5, 60, [], 1.6, 9); break;
      case 'melt': ctx.globalAlpha = 1; add(ctx, () => glow(ctx, e.x, e.y, 30, FIRE, .7 * a)); sparks(ctx, e.x, e.y - 4, e.age, 4, 50, [], 1.4, 13); break;
      case 'harden': ctx.globalAlpha = 1; dust(ctx, e.x, e.y - 6, e.age, e.life, 3, 12, 6, '#b9a88a'); break;
      case 'chime': { ctx.globalAlpha = 1; add(ctx, () => { glow(ctx, e.x, e.y, 60 * (.6 + q), '#9fe8ff', .6 * a); glow(ctx, e.x, e.y, 16, '#fff', .6 * a); });
        // The lullaby drifts up to Ember as a few soft notes.
        for (let i = 0; i < 3; i++) { const u = clamp01(q * 1.4 - i * .12), x = e.x + (EMBER.x + 30 - e.x) * u + Math.sin(u * 9 + i) * 8, y = e.y + (EMBER.y - 70 - e.y) * u; ctx.globalAlpha = Math.sin(Math.PI * u); text(ctx, '♪', x, y, 11, '#cfefff', 'center'); }
        break; }
      case 'chime-dim': ctx.globalAlpha = 1; dust(ctx, e.x, e.y, e.age, e.life, 2, 10, 5, '#6b7a86'); break;
      case 'chime-ready': ctx.globalAlpha = 1; add(ctx, () => glow(ctx, e.x, e.y, 30, '#9fe8ff', .5 * Math.sin(Math.PI * q))); break;
      case 'hush': ctx.globalAlpha = 1; add(ctx, () => glow(ctx, EMBER.x, EMBER.y - 70, 90, '#7fd7ff', .35 * a)); break;
      case 'crown-hit': case 'weight-hit': ctx.globalAlpha = 1; sparks(ctx, e.x, e.y, e.age, 8, 90, [], 2, 17); chips(ctx, e.x, e.y, e.age, e.life, 4, 90, .5, 19, .8); break;
      case 'crown-break': case 'crown-grab': { ctx.globalAlpha = 1; add(ctx, () => glow(ctx, e.x, e.y, 110, GOLD, .55 * a)); coinsFly(ctx, { ...e, life: Math.min(e.life, 1.1) }, 8, { x: CHIP - 32, y: 34 }); sparks(ctx, e.x, e.y, e.age, 14, 160, [], 2.3, 23); chips(ctx, e.x, e.y, e.age, e.life, 8, 150, .7, 29, .8); break; }
      case 'weight-break': { ctx.globalAlpha = 1; const t = e.age; for (let n = 0; n < 3; n++) { const x = e.x + (n - 1) * (10 + t * 30), y = e.y + 220 * t * t; ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate((n - 1) * t * 3); ctx.fillStyle = '#5a5660'; ctx.fillRect(-7, -9, 14, 18); ctx.fillStyle = '#ffffff22'; ctx.fillRect(-7, -9, 14, 2); ctx.restore(); } chips(ctx, e.x, e.y, e.age, e.life, 8, 140, .7, 31, .8); dust(ctx, e.x, e.y, e.age, e.life, 4, 40, 10, '#8a8398'); break; }
      case 'exit-open': ctx.globalAlpha = 1; { const k = Math.sin(Math.PI * clamp01(q)), gr = ctx.createLinearGradient(0, e.y, 0, e.y + 280); gr.addColorStop(0, '#fff0c0'); gr.addColorStop(1, '#ffe3a000'); ctx.save(); ctx.globalAlpha = .26 * k; ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(130, e.y); ctx.lineTo(230, e.y); ctx.lineTo(300, e.y + 280); ctx.lineTo(60, e.y + 280); ctx.fill(); ctx.restore(); glow(ctx, 180, e.y, 140, '#ffe3a0', .45 * k); } break;
      case 'gate-hit': ctx.globalAlpha = 1; sparks(ctx, e.x, e.y, e.age, 7, 90, [], 2, 37); chips(ctx, e.x, e.y + 2, e.age, e.life, 4, 90, .55, 41, .8); break;
      case 'gate-break': case 'escape': ctx.globalAlpha = 1; { const gt = g.gate; if (gt) { add(ctx, () => glow(ctx, gt.x + gt.w / 2, gt.y + gt.h, 200, '#fff0c8', .55 * Math.sin(Math.PI * clamp01(q)))); chips(ctx, gt.x + gt.w / 2, gt.y + gt.h, e.age, e.life, 12, 190, .8, 43, .85); } } break;
      case 'scorch': ctx.globalAlpha = 1; add(ctx, () => glow(ctx, e.x, e.y, 50, FIRE, .7 * a)); dust(ctx, e.x, e.y - 6, e.age, e.life, 5, 30, 8, '#3a3036'); break;
      case 'avalanche': ctx.globalAlpha = 1; dust(ctx, e.x, e.y, e.age, e.life, 9, 160, 18, '#8a7a66'); chips(ctx, e.x, e.y, e.age, e.life, 12, 200, .8, 47, .7); break;
      case 'slide': ctx.globalAlpha = 1; dust(ctx, e.x, e.y + 4, e.age, e.life, 6, 150, 9, '#7a6a58'); break;
      case 'row-clear': ctx.globalAlpha = 1; add(ctx, () => { ctx.globalAlpha = .4 * a; const v = ctx.createLinearGradient(0, e.y - 12, 0, e.y + 12); v.addColorStop(0, '#0000'); v.addColorStop(.5, '#ffe3a1'); v.addColorStop(1, '#0000'); ctx.fillStyle = v; ctx.fillRect(0, e.y - 12, g.width, 24); }); break;
      case 'ball-lost': ctx.globalAlpha = 1; add(ctx, () => glow(ctx, e.x, e.y, 40, '#ff6a5a', .4 * a)); break;
      case 'run': case 'stay': case 'caught': case 'roar-warning': case 'breath-warning': case 'roar': case 'breath': case 'yawn': case 'paddle': break;
      case 'arrow-hit': ctx.globalAlpha = 1; glow(ctx, e.x, e.y, 18, GOLD, a * .6); sparks(ctx, e.x, e.y, e.age, 5, 80, [], 1.6, 57); break;
      case 'volley': ctx.globalAlpha = 1; glow(ctx, e.x, e.y, 40, '#e3c6d1', a * .5); sparks(ctx, e.x, e.y, e.age, 5, 70, [], 1.8, 53); break;
      case 'ward-deploy': ctx.globalAlpha = 1; glow(ctx, e.x, e.y, 120, '#9fd0ff', a * .35); sparks(ctx, e.x, e.y, e.age, 8, 120, [], 2, 59); break;
      case 'ward-bounce': ctx.globalAlpha = 1; glow(ctx, e.x, e.y, 24, '#cfeaff', a * .6); sparks(ctx, e.x, e.y, e.age, 4, 100, [], 1.6, 29); break;
      case 'capsule-multi': case 'capsule-ram': case 'capsule-wide': { ctx.globalAlpha = 1; const c = { 'capsule-multi': '#7fe0a0', 'capsule-ram': '#ffc98a', 'capsule-wide': '#7fc4ff' }[e.kind]; glow(ctx, e.x, e.y, 50, c, a * .6); sparks(ctx, e.x, e.y, e.age, 8, 100, [], 2, 61); break; }
      case 'ram-armed': ctx.globalAlpha = 1; pool(ctx, e.x, e.y + 7, 64, 14, '#ffd8a0', a * .6); sparks(ctx, e.x, e.y + 4, e.age, 6, 150, [], 2, 35); break;
      case 'ram-launch': ctx.globalAlpha = 1; glow(ctx, e.x, e.y, 60 + e.age * 60, '#9ed1ff', a * .7); sparks(ctx, e.x, e.y, e.age, 10, 230, [], 2.4, 37); break;
      case 'ram-end': ctx.globalAlpha = 1; glow(ctx, e.x, e.y, 26, '#c9dff0', a * .5); break;
      default: ctx.globalAlpha = 1; sparks(ctx, e.x, e.y, e.age, 4, 50, [], 1.6);
    }
    ctx.restore();
  }
}
function powerBars(ctx, g) {
  const p = g.paddle, rows = [[g.ward ? g.ward.remaining / HOARD_TIMING.ward : 0, '#9fd0ff'], [g.volley ? (g.volley.remaining + g.shots.length) / HOARD_TIMING.arrows : 0, '#e3c6d1'], [p.wide / HOARD_TIMING.wide, '#7fc4ff'], [p.scorch / HOARD_TIMING.scorch, FIRE]].filter(r => r[0] > 0);
  rows.forEach(([f, col], i) => { const y = p.y + p.h + 12 + i * 5; ctx.fillStyle = '#0c1018cc'; ctx.beginPath(); ctx.roundRect(p.x - 28, y, 56, 3.4, 2); ctx.fill(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(p.x - 28, y, 56 * clamp01(f), 3.4, 2); ctx.fill(); });
}
function shake(g) {
  let a = 0; const amp = { roar: [0, 2.4, .35], avalanche: [0, 4, .6], 'gate-break': [0, 4, .7], 'crown-break': [0, 3, .4], 'weight-break': [0, 2.4, .3], slide: [0, 1, .3], caught: [0, 3, .5], 'ram-launch': [0, 1.6, .18] };
  for (const e of g.effects) { const s = amp[e.kind]; if (!s || e.teaching) continue; const t = e.age - s[0]; if (t >= 0 && t < s[2]) a = Math.max(a, s[1] * (1 - t / s[2])); }
  return a ? { x: Math.sin(g.time * 95) * a, y: Math.cos(g.time * 83) * a } : { x: 0, y: 0 };
}
// ---------- cards ----------
function label(ctx, msg, x, y, col = GOLD, w = 150) { ctx.save(); ctx.fillStyle = '#0b0a18e8'; ctx.beginPath(); ctx.roundRect(x - w / 2, y - 9, w, 18, 9); ctx.fill(); ctx.strokeStyle = '#d6a35f88'; ctx.lineWidth = .8; ctx.stroke(); text(ctx, msg, x, y + .5, 10.5, col, 'center'); ctx.restore(); }
function button(ctx, r, title, sub, col, hot) {
  ctx.save(); ctx.fillStyle = '#000a'; ctx.beginPath(); ctx.roundRect(r.x + 2, r.y + 4, r.w, r.h, 14); ctx.fill();
  const gr = ctx.createLinearGradient(0, r.y, 0, r.y + r.h); gr.addColorStop(0, hot ? '#5a3a1a' : '#24304a'); gr.addColorStop(1, hot ? '#2a1808' : '#121a2c'); ctx.fillStyle = gr; ctx.beginPath(); ctx.roundRect(r.x, r.y, r.w, r.h, 14); ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = 1.4; ctx.stroke();
  const gl = ctx.createLinearGradient(0, r.y, 0, r.y + r.h * .5); gl.addColorStop(0, '#ffffff22'); gl.addColorStop(1, '#ffffff00'); ctx.fillStyle = gl; ctx.beginPath(); ctx.roundRect(r.x + 2, r.y + 2, r.w - 4, r.h * .45, 12); ctx.fill();
  text(ctx, title, r.x + r.w / 2, r.y + r.h * .38, 17, col, 'center'); text(ctx, sub, r.x + r.w / 2, r.y + r.h * .72, 9.5, '#e8dcc0', 'center');
  ctx.restore();
}
function greedCard(ctx, g, st) {
  const B = hoardButtons(g), k = smooth(clamp01((st.clock - (st.greedAt ?? st.clock)) / .25));
  ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = '#05040acc'; ctx.fillRect(0, g.ceiling, g.width, g.height - g.ceiling);
  ctx.fillStyle = '#0d0b16f2'; ctx.beginPath(); ctx.roundRect(24, 262, 312, 166, 20); ctx.fill(); ctx.strokeStyle = '#d6a35f'; ctx.lineWidth = 1.4; ctx.stroke();
  text(ctx, 'THE WAY OUT IS OPEN', 180, 286, 16, GOLD, 'center');
  text(ctx, `Loot ${g.loot}. Bank it now, or stay greedy.`, 180, 308, 11, '#d8cfe6', 'center');
  text(ctx, 'Staying opens his eye. If it opens, you lose the bonus.', 180, 326, 9.5, '#b9aed0', 'center');
  button(ctx, B.run, 'RUN', `Bank ${g.loot} ×1`, '#9fe0c8', false);
  button(ctx, B.stay, 'STAY', `Loot up to ×${GREED.mult[2]}`, '#ffc46a', true);
  ctx.restore();
}
function fleePill(ctx, g, st) {
  const r = hoardButtons(g).flee; if (!r) return;
  const hot = g.wake > 70, p = .5 + .5 * Math.sin(st.clock * (hot ? 10 : 4));
  if (hot) add(ctx, () => glow(ctx, r.x + r.w / 2, r.y + r.h / 2, 60, '#ff6a3a', .25 + .25 * p));
  ctx.save(); ctx.fillStyle = '#000a'; ctx.beginPath(); ctx.roundRect(r.x + 2, r.y + 3, r.w, r.h, r.h / 2); ctx.fill();
  const gr = ctx.createLinearGradient(0, r.y, 0, r.y + r.h); gr.addColorStop(0, '#3a5a4a'); gr.addColorStop(1, '#16281f'); ctx.fillStyle = gr; ctx.beginPath(); ctx.roundRect(r.x, r.y, r.w, r.h, r.h / 2); ctx.fill();
  ctx.strokeStyle = '#9fe0c8'; ctx.lineWidth = 1.3; ctx.stroke();
  text(ctx, `RUN ×${g.mult}`, r.x + r.w / 2, r.y + r.h / 2 + .5, 13, '#e6fff4', 'center'); ctx.restore();
  const next = GREED.steps.find(s => g.greed.gold < s);
  if (next) text(ctx, `${next - g.greed.gold} gold to ×${GREED.mult[GREED.steps.indexOf(next) + 1]}`, r.x + r.w / 2, r.y - 8, 9.5, '#ffd27a', 'center');
}
// ---------- frame ----------
const STATE = new WeakMap();
export function renderHoard(ctx, g, art) {
  drawWeight.art = art;
  const st = STATE.get(g) || STATE.set(g, { clock: 0, last: typeof performance !== 'undefined' ? performance.now() : 0, face: 'idle', prev: null, faceAt: -9 }).get(g), W = g.width, H = g.height;
  const now = typeof performance !== 'undefined' ? performance.now() : 0; st.clock += Math.min(.05, Math.max(0, (now - st.last) / 1000)); st.last = now;
  if (g.phase === 'greed' && st.greedAt === undefined) st.greedAt = st.clock; if (g.phase !== 'greed') st.greedAt = undefined;
  const climb = g.phase === 'climb', arrive = g.floor > 0 && !climb && g.phase !== 'escape' && g.floorTime < .7;
  const pan = climb ? smooth(1 - g.transition / HOARD_TIMING.climb) * CLIMB : arrive ? -(1 - smooth(g.floorTime / .7)) * CLIMB : 0, fade = climb || arrive ? 1 - .85 * Math.abs(pan) / CLIMB : 1;
  ctx.drawImage(cave(W, H), 0, pan * .3, W, H); if (pan) ctx.drawImage(cave(W, H), 0, pan * .3 - H, W, H);
  const sh = shake(g); ctx.save(); ctx.translate(sh.x, sh.y);
  ctx.save(); ctx.translate(0, pan); ctx.globalAlpha = fade;
  drawEmber(ctx, g, st); ledgeSlab(ctx, g, art); coinPile(ctx, g, st); drawGate(ctx, g, art, st);
  // Floor 3: the crash line glows hotter as the hoard nears it.
  if (g.floor === 2 && g.phase !== 'escape') {
    const near = clamp01(1 - (g.dangerY - g.fieldBottom()) / 90), y = g.dangerY;
    add(ctx, () => { const v = ctx.createLinearGradient(0, y - 10, 0, y + 10); v.addColorStop(0, '#0000'); v.addColorStop(.5, `rgba(255,90,50,${.12 + .4 * near * (.7 + .3 * Math.sin(st.clock * 8))})`); v.addColorStop(1, '#0000'); ctx.fillStyle = v; ctx.fillRect(0, y - 10, W, 20); });
  }
  for (const b of g.bricks) if (b.hp > 0) drawBrick(ctx, g, b, st);
  tells(ctx, g, st);
  for (const c of g.capsules) rCapsule(ctx, g, c);
  hEffects(ctx, g, st);
  const e = g.ember;
  if (e.teaching && (e.stage === 'windup' || e.stage === 'release')) label(ctx, e.kind === 'breath' ? 'JUST A YAWN · WATCH THE ROW' : 'JUST A YAWN · MOVE NEXT TIME', 180, g.ceiling + 22, '#cfe6ff', 196);
  else if (g.floor === 0 && g.floorTime < 6 && g.state === 'play' && !climb) label(ctx, 'GOLD WAKES HIM · CHIMES HUSH HIM', 180, g.ceiling + 22, GOLD, 214);
  if (g.effects.some(f => f.kind === 'caught')) label(ctx, 'CAUGHT! THE BONUS IS GONE', 180, g.ceiling + 22, '#ffb0a0', 196);
  ctx.restore();
  gWard(ctx, g, art);
  gPaddle(ctx, g, art, skinFor(art, 'kit'), 'pip_gold');
  if (g.paddle.scorch > 0) add(ctx, () => pool(ctx, g.paddle.x, g.paddle.y + 6, g.paddle.w * .55, 9, FIRE, .35 + .15 * Math.sin(st.clock * 20)));
  powerBars(ctx, g); rArrows(ctx, g);
  for (const b of g.balls) if (!b.dead) gBall(ctx, g, art, b);
  ctx.restore();
  // HUD inside the playfield: floor chip, loot pill, the Wake eye, the RUN pill.
  const n = g.floor + 1 + (climb ? 1 : 0); ctx.save(); ctx.globalAlpha = .85; ctx.fillStyle = '#0b0d18cc'; ctx.beginPath(); ctx.roundRect(CHIP - 42, 6, 84, 17, 8.5); ctx.fill(); ctx.strokeStyle = '#d6a35f88'; ctx.lineWidth = .8; ctx.stroke(); ctx.restore();
  text(ctx, `FLOOR ${Math.min(3, n)} / 3`, CHIP, 15, 10.5, '#f3dca8', 'center');
  lootPill(ctx, g); wakeEye(ctx, g, st); fleePill(ctx, g, st);
  if (g.phase === 'greed') greedCard(ctx, g, st);
  if (climb) gBanner(ctx, g, `FLOOR ${n} / 3 · ${HOARD_FLOORS[Math.min(2, n - 1)].toUpperCase()}`, Math.min(1, (1 - g.transition / HOARD_TIMING.climb) * 4));
  else if (g.phase === 'escape') gBanner(ctx, g, g.mult > 1 ? `ESCAPED · ${g.banked} LOOT (×${g.mult})` : `ESCAPED · ${g.banked} LOOT`, Math.min(1, (1 - g.transition / HOARD_TIMING.escape) * 3));
  else if (g.floorTime < 1.6 && g.state === 'play' && g.phase !== 'greed') gBanner(ctx, g, `FLOOR ${n} / 3 · ${HOARD_FLOORS[g.floor].toUpperCase()}`, g.floor ? Math.min(1, (1.6 - g.floorTime) * 1.6) : 1);
}
export { HOARD_LAYOUT };
