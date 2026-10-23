// Tidewheel Siege drawing (src/fantasy/tidewheel-siege.js): the stage boards, Nerra's code motion, the snapped refuge
// chain, the siege effects and the HUD (stage pips, stage card, banners, drops). render.js calls these hooks from its
// Tidewheel pass; every hook does nothing for the plain Tidewheel model (no `g.siege`), so that chapter draws as before.
//
// Steel is barnacled brass: a glossy, finished bar with a bright glint stripe on the face next to each gap the ball must
// use, so the way in reads at a glance. No effect here is a bare stroked ring or a dot spray.
import { SPR, ready, cached, text, drawCapsule, drawAt } from '../gfx.js';
import { glow, sparks, chips, pips, fxPart, dust, rnd, clamp01, smooth, sprite, hoistChain, brick, pool } from './render.js';
import { STAGES } from './tidewheel-stages.js';

const TAU = Math.PI * 2;
// One barnacle: a squat shell cone lit from the top-left, its plates closed to a short slit at the top.
function barnacle(c, x, y, s) {
  c.fillStyle = '#4a443ccc'; c.beginPath(); c.ellipse(x + s * .15, y + s * .45, s * 1.3, s * .55, 0, 0, TAU); c.fill();
  const cone = c.createLinearGradient(x - s, y - s * .6, x + s, y + s * .5); cone.addColorStop(0, '#e7dcc5'); cone.addColorStop(.45, '#a99f8b'); cone.addColorStop(1, '#5e5649');
  c.fillStyle = cone; c.beginPath(); c.moveTo(x - s * 1.15, y + s * .4); c.quadraticCurveTo(x - s * .95, y - s * .35, x - s * .42, y - s * .62); c.lineTo(x + s * .42, y - s * .62);
  c.quadraticCurveTo(x + s * .95, y - s * .35, x + s * 1.15, y + s * .4); c.closePath(); c.fill();
  c.fillStyle = '#6d6252'; c.beginPath(); c.ellipse(x, y - s * .6, s * .4, s * .13, 0, 0, TAU); c.fill();
}
// ---------- brass ----------
// One bar, baked per size, glint side and state: a brass body shaded across its short axis, a specular band, a few
// barnacle clusters on the face away from the gap and the glint stripe on the gap face.
function barTile(w, h, glint, cracked, seed = 0) {
  const P = 5, W = Math.ceil(w), H = Math.ceil(h);
  return cached(`tw-bar-${W}-${H}-${glint}-${cracked ? 1 : 0}-${seed}`, W + P * 2, H + P * 2 + 2, c => {
    const vert = h > w, r = Math.min(2.6, Math.min(w, h) / 2);
    c.save(); c.shadowColor = '#000000a8'; c.shadowBlur = 4; c.shadowOffsetX = 1; c.shadowOffsetY = 2.2;
    const body = vert ? c.createLinearGradient(P, 0, P + w, 0) : c.createLinearGradient(0, P, 0, P + h);
    body.addColorStop(0, '#4a2f10'); body.addColorStop(.16, '#a8701f'); body.addColorStop(.34, '#f0c564'); body.addColorStop(.5, '#c48a2e'); body.addColorStop(.8, '#6e4716'); body.addColorStop(1, '#2e1d09');
    c.fillStyle = body; c.beginPath(); c.roundRect(P, P, w, h, r); c.fill(); c.restore();
    // Verdigris in the seams and a darker lower lip: a finished, lacquered bar that has lived in sea water.
    c.save(); c.beginPath(); c.roundRect(P, P, w, h, r); c.clip();
    const lip = vert ? c.createLinearGradient(0, P, 0, P + h) : c.createLinearGradient(P, 0, P + w, 0);
    lip.addColorStop(0, '#3f8f8018'); lip.addColorStop(.5, '#00000000'); lip.addColorStop(1, '#3f8f8030'); c.fillStyle = lip; c.fillRect(P, P, w, h);
    // Barnacles on the face away from the glint, in small clusters.
    const n = Math.max(1, Math.floor((vert ? h : w) / 22));
    for (let i = 0; i < n; i++) {
      const t = (i + .5 + (rnd(i, seed) - .5) * .5) / n, along = (vert ? h : w) * t;
      const far = glint === 'left' || glint === 'top' ? 1 : 0, across = (vert ? w : h) * (far ? .78 : .22);
      const bx = P + (vert ? across : along), by = P + (vert ? along : across);
      for (let k = 0; k < 3; k++) barnacle(c, bx + (rnd(i * 3 + k, seed + 7) - .5) * 5, by + (rnd(i * 3 + k, seed + 9) - .5) * 2, .9 + rnd(i * 3 + k, seed + 11) * .8);
    }
    // Specular gloss band along the long axis.
    const gl = vert ? c.createLinearGradient(P, 0, P + w, 0) : c.createLinearGradient(0, P, 0, P + h);
    gl.addColorStop(.26, '#ffffff00'); gl.addColorStop(.36, '#fffbe6c0'); gl.addColorStop(.44, '#ffffff00'); c.fillStyle = gl; c.fillRect(P, P, w, h);
    c.restore();
    // The glint stripe on the gap face.
    if (glint) {
      const s = 2.2, x0 = glint === 'right' ? P + w - s - .4 : glint === 'left' ? P + .4 : P + 1, y0 = glint === 'bottom' ? P + h - s - .4 : glint === 'top' ? P + .4 : P + 1;
      const gw = glint === 'left' || glint === 'right' ? s : w - 2, gh = glint === 'top' || glint === 'bottom' ? s : h - 2;
      const st = glint === 'left' || glint === 'right' ? c.createLinearGradient(0, y0, 0, y0 + gh) : c.createLinearGradient(x0, 0, x0 + gw, 0);
      st.addColorStop(0, '#fff6d000'); st.addColorStop(.2, '#fffbe8'); st.addColorStop(.8, '#fffbe8'); st.addColorStop(1, '#fff6d000');
      c.save(); c.shadowColor = '#fff0b8'; c.shadowBlur = 6; c.fillStyle = st; c.beginPath(); c.roundRect(x0, y0, gw, gh, s / 2); c.fill(); c.restore();
    }
    if (cracked) {   // a hairline crack with a lit edge: this bar gives to a ram, fire or the titan
      const cx = P + w / 2, cy = P + h / 2, L = Math.max(w, h) * .32;
      c.lineCap = 'round'; c.lineJoin = 'round';
      for (const [col, lw, off] of [['#1a0f05', 1.4, 0], ['#ffd99a', .5, -.6]]) {
        c.strokeStyle = col; c.lineWidth = lw; c.beginPath();
        if (vert) { c.moveTo(cx + off - 1, cy - L); c.lineTo(cx + off + 1.4, cy - L * .3); c.lineTo(cx + off - 1.2, cy + L * .2); c.lineTo(cx + off + .8, cy + L); }
        else { c.moveTo(cx - L, cy + off - 1); c.lineTo(cx - L * .3, cy + off + 1.4); c.lineTo(cx + L * .2, cy + off - 1.2); c.lineTo(cx + L, cy + off + .8); }
        c.stroke();
      }
    }
  });
}
function brassBar(ctx, b, x = b.x, y = b.y, seed = 0, time = 0) {
  ctx.drawImage(barTile(b.w, b.h, b.glint, b.cracked, seed), x - 5, y - 5, Math.ceil(b.w) + 10, Math.ceil(b.h) + 12);
  if (b.cracked) { const q = .5 + .5 * Math.sin(time * 6); glow(ctx, x + b.w / 2, y + b.h / 2, 12, '#ffcf7a', .22 + .2 * q); }
}
// A riveted brass mount with a gem cap (spoke hinges and valve hubs).
function hub(ctx, x, y, r, lit = 0) {
  const g = ctx.createRadialGradient(x - r * .35, y - r * .4, 0, x, y, r);
  g.addColorStop(0, '#fff1c4'); g.addColorStop(.35, '#d9a957'); g.addColorStop(1, '#4d3312');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  if (lit > 0) glow(ctx, x, y, r * 2.4, '#ffcf7a', .5 * lit);
  fxPart(ctx, lit > .05 ? 'pip_gold' : 'pip_empty', x, y, r / 7);
}

// ---------- tiles: the glaze-2 chest and gold slabs, a pearl in a shell setting, a sluice valve ----------
const tileCache = (key, w, h) => cached(`tw-tile-${key}-${w}-${h}`, w + 12, h + 14, c => {
  const s = SPR[key], P = 6, kx = w / 32, ky = h / 16;
  c.save(); c.shadowColor = '#000000a0'; c.shadowBlur = 5; c.shadowOffsetX = 1.2; c.shadowOffsetY = 2.6; c.drawImage(s.img, P - 4 * kx, P - 4 * ky, 40 * kx, 24 * ky); c.restore();
  c.save(); c.beginPath(); c.roundRect(P + 1.6, P + 1.2, w - 3.2, h * .46, [3.2, 3.2, 1.5, 1.5]); c.clip();
  const gl = c.createLinearGradient(0, P, 0, P + h * .5); gl.addColorStop(0, '#ffffff55'); gl.addColorStop(.55, '#ffffff14'); gl.addColorStop(1, '#ffffff00'); c.fillStyle = gl; c.fillRect(P, P, w, h); c.restore();
});
function tile(ctx, key, x, y, w, h) {
  if (!ready(SPR[key])) { ctx.fillStyle = '#a07a2a'; ctx.beginPath(); ctx.roundRect(x, y, w, h, 3); ctx.fill(); return; }
  ctx.drawImage(tileCache(key, w, h), x - 6, y - 6, w + 12, h + 14);
}
function pearl(ctx, x, y, r, t = 0) {
  glow(ctx, x, y, r * 3, '#e6f4ff', .35 + .1 * Math.sin(t * 3));
  const g = ctx.createRadialGradient(x - r * .38, y - r * .42, r * .05, x, y, r);
  g.addColorStop(0, '#ffffff'); g.addColorStop(.35, '#f4eefa'); g.addColorStop(.8, '#c9c2e4'); g.addColorStop(1, '#8a86b0');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  const rim = ctx.createRadialGradient(x, y, r * .6, x, y, r); rim.addColorStop(0, '#ffd6ec00'); rim.addColorStop(1, '#ffd6ec55'); ctx.fillStyle = rim; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
}
function prize(ctx, g, art, b, x = b.x, y = b.y) {
  if (b.type === 'chest') return tile(ctx, b.hp < b.maxHP ? 'brick_chest_2_1' : 'brick_chest_2_0', x, y, b.w, b.h);
  if (b.type === 'pearl') { tile(ctx, 'brick_t_2_0', x, y, b.w, b.h); pearl(ctx, x + b.w / 2, y + b.h / 2, 6.2, g.time); return; }
  if (b.type === 'valve') {
    // The sluice valve: a brass plate with the hoist wheel as its hand wheel, water spitting from the seam while it is open.
    brassBar(ctx, { w: b.w, h: b.h, glint: null }, x, y, 3);
    const turn = (b.maxHP - b.hp) * .9 + (g.effects.find(e => e.kind === 'valve-turn' && Math.abs(e.x - (x + b.w / 2)) < 2)?.age || 0) * 2;
    sprite(ctx, art, 'tidewheel', 'wheel', x + b.w / 2, y + b.h / 2, { width: 19, angle: turn });
    hub(ctx, x + b.w / 2, y + b.h / 2, 3.2, .4 + .3 * Math.sin(g.time * 5));
    for (const s of [-1, 1]) {   // two thin jets from the seam
      const sx = x + b.w / 2 + s * (b.w / 2 - 2), sy = y + b.h - 2;
      const jet = ctx.createLinearGradient(sx, sy, sx + s * 9, sy + 10); jet.addColorStop(0, '#dff8f4cc'); jet.addColorStop(1, '#7cc8d000');
      ctx.fillStyle = jet; ctx.beginPath(); ctx.moveTo(sx, sy - 1); ctx.quadraticCurveTo(sx + s * 7, sy - 1 + Math.sin(g.time * 14 + s) * .8, sx + s * 9, sy + 10); ctx.lineTo(sx + s * 6, sy + 10); ctx.quadraticCurveTo(sx + s * 4, sy + 2, sx, sy + 1.4); ctx.closePath(); ctx.fill();
    }
    return;
  }
}
// 2-hit bricks wear a barnacle crust; the first hit knocks most of it off and leaves a crack.
function crust(ctx, b, x, y) {
  if (!(b.maxHP > 1)) return;
  const full = b.hp >= b.maxHP;
  ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, b.w, b.h, 3); ctx.clip();
  const weed = ctx.createLinearGradient(0, y + b.h * .35, 0, y + b.h); weed.addColorStop(0, '#24584a00'); weed.addColorStop(1, full ? '#24584ad0' : '#24584a70'); ctx.fillStyle = weed; ctx.fillRect(x, y, b.w, b.h);
  const n = full ? 5 : 2, k = b.lx ?? b.x;
  for (let i = 0; i < n; i++) barnacle(ctx, x + b.w * ((i + .5) / n) + (rnd(i, k) - .5) * 3, y + b.h - 3.2 - rnd(i, k + 3) * 3, 1.5 + rnd(i, k + 5) * .9);
  ctx.restore();
  if (!full) {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const [col, lw, o] of [['#141a1e', 1.3, 0], ['#ffffff70', .45, -.7]]) {
      ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(x + b.w * .38, y + 1 + o); ctx.lineTo(x + b.w * .47, y + b.h * .42 + o); ctx.lineTo(x + b.w * .36, y + b.h * .66 + o); ctx.lineTo(x + b.w * .5, y + b.h - 1 + o); ctx.stroke();
    }
  }
}
export function siegeBrick(ctx, g, art, b, draw) {
  if (!g.siege) return draw();
  if (b.prize) return prize(ctx, g, art, b, b.lx, b.ly);
  draw(); crust(ctx, b, b.lx, b.ly);
}

// ---------- the board: blocks, brass bars, spokes ----------
export function siegeBoard(ctx, g, art) {
  if (!g.siege) return;
  for (const c of g.board.chambers) alcove(ctx, c);
  for (const b of g.blocks) if (b.hp > 0) { if (b.prize) prize(ctx, g, art, b); else { brick(ctx, art, b); crust(ctx, b, b.x, b.y); } }
  g.bars.forEach((b, i) => { if (!b.broken) brassBar(ctx, b, b.x, b.y, i, g.time); });
  for (const s of g.spokes) spoke(ctx, g, s);
}
function alcove(ctx, c) {
  const g = ctx.createLinearGradient(0, c.y, 0, c.y + c.h); g.addColorStop(0, '#061016b8'); g.addColorStop(1, '#0a1c2490');
  ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(c.x, c.y, c.w, c.h, 3); ctx.fill();
  const lip = ctx.createLinearGradient(0, c.y, 0, c.y + 10); lip.addColorStop(0, '#00000080'); lip.addColorStop(1, '#00000000'); ctx.fillStyle = lip; ctx.fillRect(c.x, c.y, c.w, 10);
}
// A wheel spoke: a brass rod swinging about its hinge between lying shut in the pit-floor gap and standing open against the
// inner wall. In the tell (the last 0.8 s before a swing) the hinge gem lights, the rod rattles and the gap face glints.
function spoke(ctx, g, s) {
  const side = s.side, px = s.hinge.x + side * s.t / 2, py = s.hinge.y;
  const shut = side < 0 ? Math.PI : 0, open = -Math.PI / 2, e = smooth(s.shown), tell = s.tell || 0;
  const a = shut + (open - shut) * e + Math.sin(g.time * 70) * .035 * tell * (s.pose ? 1 : -1);
  ctx.save(); ctx.translate(px, py); ctx.rotate(a);
  if (tell > 0) glow(ctx, s.len / 2, 0, s.len * .7, '#ffcf7a', .28 * tell);
  brassBar(ctx, { w: s.len + s.t / 2, h: s.t, glint: 'top' }, -s.t / 2, -s.t / 2, 9);
  ctx.restore();
  hub(ctx, px, py, 4.4, tell);
}
// Cage bars riding a raft (local raft coordinates; render.js has the raft's transform on).
export function raftSteel(ctx, g, art, r) {
  if (!g.siege || !r.steel) return;
  r.steel.forEach((s, i) => { if (!s.broken) brassBar(ctx, s, s.lx, s.ly, 20 + i, g.time); });
  if (r.steel.some(s => !s.broken)) for (const x of [-20, 20]) hub(ctx, x, -7, 2.6, 0);
}

// ---------- Nerra: code motion over the existing art ----------
// render.js draws her body and claws inside this transform. Poses come from the model's pose interface (v.act):
// walk hops, jump stretches up and squashes on take-off and landing, slam squashes, snap leans back into the haul,
// look leans toward the paddle, furious shakes, hurt/dizzy wobble. Facing is the sprite mirror (render.js).
export function nerraMotion(ctx, g, v) {
  if (!g.siege || !v.act) return;
  const a = v.act, t = a.t || 0, q = a.dur ? clamp01(t / a.dur) : 0, fx = v.footX, fy = v.footY;
  let sx = 1, sy = 1, rot = 0, dx = 0, dy = 0;
  switch (a.pose) {
    case 'walk': dy = -Math.abs(Math.sin(t * 12)) * 4; rot = Math.sin(t * 12) * .04; sy = 1 - Math.abs(Math.cos(t * 12)) * .03; break;
    case 'jump': {
      const up = q < .5; sy = q < .12 ? 1 - .14 * Math.sin(q / .12 * Math.PI) : q > .88 ? 1 - .12 * Math.sin((q - .88) / .12 * Math.PI) : 1 + .1 * Math.sin((q - .12) / .76 * Math.PI);
      sx = 2 - sy; rot = (up ? -.12 : .12) * Math.sin(q * Math.PI) * (v.facing || 1); break;
    }
    case 'slam': sy = 1 - .16 * (1 - q); sx = 1 + .12 * (1 - q); break;
    case 'snap': rot = -.07 * Math.sin(Math.min(1, t / .4) * Math.PI / 2) * (v.facing || 1) + Math.sin(t * 40) * .01; break;
    case 'look': if (a.gaze) rot = Math.max(-.06, Math.min(.06, (a.gaze.x - fx) / 1500)); dy = -Math.sin(Math.min(1, t * 4) * Math.PI / 2) * 2; break;
    case 'furious': dx = Math.sin(g.time * 60) * 1.6; sy = 1 + .04 * Math.sin(g.time * 18); sx = 2 - sy; break;
    case 'hurt': rot = Math.sin(t * 30) * .05 * (1 - q); break;
    case 'dizzy': rot = Math.sin(t * 9) * .08; dx = Math.sin(t * 9) * 3; break;
    case 'idle': sy = 1 + .015 * Math.sin(g.time * 2.4); sx = 2 - sy; break;
  }
  if (v.pose === 'fury' && a.pose !== 'furious') { dx += Math.sin(g.time * 55) * 1.1; }
  ctx.translate(fx + dx, fy + dy); ctx.rotate(rot); ctx.scale(sx, sy); ctx.translate(-fx, -fy);
}

// ---------- the refuge chain Nerra snapped ----------
// The right chain parted in stage 1: its upper end swings free and a short lashing holds the balcony a notch lower.
export function refugeChain(ctx, g, art, side, x) {
  if (!g.siege || !g.snapped || side < 0) return false;
  const L = g.lumi, bottom = L.y + 31, top = 47, mid = top + (bottom - top) * .45, sway = Math.sin(g.time * 1.7) * 3;
  hoistChain(ctx, art, { x, y: top }, { x: x + sway, y: mid - 6 }, 0, 5);
  hoistChain(ctx, art, { x, y: bottom - 14 }, { x, y: bottom }, 0, 5);
  // The lashing: a tarred rope bridging the gap, two tones for its twist.
  ctx.lineCap = 'round';
  for (const [c, w] of [['#3b2a18', 3], ['#b48a52', 1.4]]) { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x + sway, mid - 6); ctx.quadraticCurveTo(x + 4 + sway * .5, (mid + bottom) / 2 - 6, x, bottom - 14); ctx.stroke(); }
  return true;
}

// ---------- effects ----------
const GOLD = ['#ffd27a', '#fff2c4', '#e0a54a'];
export function siegeEffect(ctx, g, art, e, q) {
  if (!g.siege) return false;
  const t = e.age;
  switch (e.kind) {
    case 'chain-snap': ctx.globalAlpha = 1; glow(ctx, e.x, e.y, 26, '#ffe2a8', (1 - q) * .7); sparks(ctx, e.x, e.y, t, 9, 170, GOLD, 2.2, 51); chips(ctx, e.x, e.y, t, e.life, 4, 90, .7, 53); return true;
    case 'refuge-drop': ctx.globalAlpha = 1; dust(ctx, e.x, e.y, t, e.life, 6, 34, 8, '#9a907f'); return true;
    case 'nerra-slam': ctx.globalAlpha = 1; dust(ctx, e.x, e.y, t, e.life, 9, 80, 12, '#8b8478'); chips(ctx, e.x, e.y, t, e.life, 6, 150, 1, 57); return true;
    case 'nerra-roar': ctx.globalAlpha = 1; glow(ctx, e.x, e.y, 40 + 60 * q, '#ff7a5a', (1 - q) * .45); return true;
    case 'nerra-splash': case 'tide-surge': {
      if (e.kind === 'tide-surge') { ctx.globalAlpha = 1; pool(ctx, g.width / 2, g.water.y, 170, 10, '#bdf1ea', (1 - q) * .5); return true; }
      ctx.globalAlpha = 1; const k = Math.min(3, Math.floor(q * 4)); ctx.globalAlpha = q < .7 ? 1 : (1 - q) / .3;
      drawAt(ctx, `splash/${k}`, e.x, g.water.y + 4, 1.3 * (e.size || 1)); return true;
    }
    case 'knockdown': ctx.globalAlpha = 1; glow(ctx, e.x, e.y, 70, '#ffd27a', (1 - q) * .55); sparks(ctx, e.x, e.y, Math.min(t, .41), 14, 260, GOLD, 2.6, 61); return true;
    case 'nerra-shrug': ctx.globalAlpha = 1; glow(ctx, e.x, e.y, 12, '#cfe8ff', (1 - q) * .5); return true;
    case 'pearl': ctx.globalAlpha = 1; pearl(ctx, e.x, e.y - 40 * smooth(q), 6 * (1 - q * .4), g.time); glow(ctx, e.x, e.y, 30, '#f1ecff', (1 - q) * .5); sparks(ctx, e.x, e.y, t, 6, 120, ['#fff', '#e6dcff'], 1.8, 63); return true;
    case 'valve-turn': ctx.globalAlpha = 1; sparks(ctx, e.x, e.y, t, 5, 110, GOLD, 1.8, 65); return true;
    case 'valve-shut': ctx.globalAlpha = 1; glow(ctx, e.x, e.y, 34, '#bdf1ea', (1 - q) * .6); sparks(ctx, e.x, e.y, t, 10, 190, GOLD, 2.2, 67);
      if (q < .6) { ctx.globalAlpha = 1 - q / .6; drawAt(ctx, `splash/${Math.min(3, Math.floor(q / .6 * 4))}`, e.x, e.y + 6, .7); } return true;
    case 'brick-chip': ctx.globalAlpha = 1; chips(ctx, e.x, e.y, t, e.life, 3, 70, .6, 69); return true;
    case 'bar-knock': ctx.globalAlpha = 1; glow(ctx, e.x, e.y, 9, '#ffe2a8', (1 - q) * .6); return true;
    case 'bar-crack': return true;
    case 'bar-break': ctx.globalAlpha = 1; glow(ctx, e.x, e.y, 30, '#ffd27a', (1 - q) * .6); sparks(ctx, e.x, e.y, t, 12, 220, GOLD, 2.4, 71); chips(ctx, e.x, e.y, t, e.life, 6, 140, .9, 73); return true;
    case 'spoke-swing': ctx.globalAlpha = 1; sparks(ctx, e.x, e.y, t, 4, 90, GOLD, 1.6, 75); return true;
    case 'capsule': ctx.globalAlpha = 1; glow(ctx, e.x, e.y, 26, '#fff2c4', (1 - q) * .6); sparks(ctx, e.x, e.y, t, 6, 140, GOLD, 1.8, 77); return true;
    case 'bolt-hit': ctx.globalAlpha = 1; glow(ctx, e.x, e.y, 10, '#ffb1d0', (1 - q) * .7); return true;
    case 'pearl-guard': ctx.globalAlpha = 1; glow(ctx, e.x, e.y, 40, '#f1ecff', (1 - q) * .7); sparks(ctx, e.x, e.y, t, 8, 160, ['#fff', '#e6dcff'], 2, 79); return true;
    case 'brick-break': {
      if (typeof e.colour === 'number') return false;   // ordinary bricks keep the shared break
      ctx.globalAlpha = 1;
      if (e.colour === 'pearl') { pearl(ctx, e.x, e.y - 40 * smooth(q), 6, g.time); glow(ctx, e.x, e.y, 30, '#f1ecff', (1 - q) * .5); }
      else { glow(ctx, e.x, e.y, 34, '#ffd27a', (1 - q) * .6); sparks(ctx, e.x, e.y, Math.min(t, .41), 12, 210, GOLD, 2.2, 81); }
      chips(ctx, e.x, e.y, t, e.life, 5, 120, .8, 83); return true;
    }
  }
  return false;
}

// ---------- HUD and overlays (after the balls) ----------
const CAP = { wide: 'wide', slow: 'slow', shield: 'shield', fire: 'fire', laser: 'laser', split: 'split', burst: 'burst' };
const TIMER = [['wide', '#9fe0ff', 12], ['slow', '#b9a8ef', 8], ['fire', '#ff9a5a', 8], ['laser', '#ff9ec0', 7]];
export function siegeOverlay(ctx, g, art) {
  if (!g.siege) return;
  const p = g.paddle;
  // Pearl shield: a string of pearls under the paddle that bursts on its one save.
  if (g.pearlGuard) for (let x = 20; x <= g.width - 20; x += 13) pearl(ctx, x, g.pearlGuard.y + 2 + Math.sin(g.time * 2 + x * .05) * 1.2, 3.4, g.time + x);
  // Fire: a warm halo on each ball.
  if (g.timers.fire > 0) for (const b of g.balls) if (!b.dead) glow(ctx, b.x, b.y, 16, '#ff8a3a', .55);
  for (const s of g.bolts) {   // laser bolts: a short rose beam with a white core
    const beam = ctx.createLinearGradient(s.x, s.y - 12, s.x, s.y + 4); beam.addColorStop(0, '#ffffff'); beam.addColorStop(.4, '#ff9ec0'); beam.addColorStop(1, '#ff9ec000');
    ctx.fillStyle = beam; ctx.beginPath(); ctx.roundRect(s.x - 1.6, s.y - 12, 3.2, 16, 1.6); ctx.fill(); glow(ctx, s.x, s.y - 6, 7, '#ff9ec0', .5);
  }
  for (const c of g.capsules) {
    const bob = Math.sin(g.time * 6 + c.id) * 1.2;
    glow(ctx, c.x, c.y, 20, c.kind === 'chest' ? '#ffd27a' : '#fff2c4', .35);
    if (c.kind === 'chest') tile(ctx, 'brick_chest_2_0', c.x - 13, c.y - 7 + bob, 26, 14);
    else if (c.kind === 'titan') { glow(ctx, c.x, c.y, 16, '#d3afe9', .6); ctx.save(); ctx.translate(c.x, c.y + bob); ctx.rotate(g.time * 2); ctx.drawImage(art.images.titan, -10, -10, 20, 20); ctx.restore(); }
    else if (!drawCapsule(ctx, CAP[c.kind] || 'focus', c.x, c.y + bob, 32, 15)) { ctx.fillStyle = '#d9b36a'; ctx.beginPath(); ctx.roundRect(c.x - 14, c.y - 6, 28, 12, 6); ctx.fill(); }
  }
  // Power timers: one thin bar per running power under the paddle.
  let row = 0;
  for (const [k, col, max] of TIMER) if (g.timers[k] > 0) {
    const y = p.y + 24 + row++ * 5, f = g.timers[k] / max;
    ctx.fillStyle = '#0c1923cc'; ctx.beginPath(); ctx.roundRect(p.x - 27, y, 54, 3, 2); ctx.fill();
    ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(p.x - 27, y, 54 * f, 3, 2); ctx.fill();
  }
  hud(ctx, g, art);
  if (g.tip) { const a = Math.min(1, g.tip.t * 5, (g.tip.life - g.tip.t) * 3); ctx.save(); ctx.globalAlpha = a; text(ctx, g.tip.text, g.width / 2, p.y - 52, 11.5, '#f3dca8', 'center'); ctx.restore(); }
  if (g.banner) banner(ctx, g, g.banner);
  if (g.phase === 'card' && g.card) card(ctx, g, art);
}
// The chapter chip: "TIDEWHEEL SIEGE" over a pip track, one gem per stage, the last one Nerra's crest (bigger, a faint pulse).
function hud(ctx, g, art) {
  const cx = g.width / 2, w = 118, n = g.stageCount, cleared = g.state === 'won' ? n : g.stagesCleared;
  ctx.save(); ctx.globalAlpha = .88; ctx.fillStyle = '#0b111bcc'; ctx.beginPath(); ctx.roundRect(cx - w / 2, 3, w, 31, 10); ctx.fill();
  ctx.strokeStyle = '#7fc7cf66'; ctx.lineWidth = .8; ctx.stroke(); ctx.restore();
  text(ctx, 'TIDEWHEEL SIEGE', cx, 11.5, 9, '#cfeff0', 'center');
  const gap = 17, x0 = cx - (n - 1) * gap / 2 - 4;
  for (let i = 0; i < n - 1; i++) {
    const x = x0 + i * gap, done = i < cleared, now = i === g.stage && !done, beat = now ? .5 + .5 * Math.sin(g.time * 5) : 0;
    ctx.fillStyle = i + 1 <= cleared ? '#7fc7cf' : '#3b4a55'; ctx.fillRect(x + 4, 24.2, gap - 8 + (i === n - 2 ? 4 : 0), 1.6);
    pips(ctx, x, 25, 1, done || now ? 1 : 0, { key: done ? 'pip_blue' : 'pip_gold', bloom: done ? '#8fc8ff' : '#ffcf7a', scale: .62, pulse: beat });
  }
  crest(ctx, g, art, x0 + (n - 1) * gap + 4, 24.5, g.stage === n - 1, cleared >= n);
}
function crest(ctx, g, art, x, y, now, done) {
  const r = 7.6, pulse = .5 + .5 * Math.sin(g.time * (now ? 4 : 1.6));
  glow(ctx, x, y, r * 2.4, done ? '#8fc8ff' : '#ff8f7a', (now ? .45 : .2) + .15 * pulse);
  const disc = ctx.createRadialGradient(x - r * .35, y - r * .4, 0, x, y, r); disc.addColorStop(0, '#fff1c4'); disc.addColorStop(.4, '#c9934a'); disc.addColorStop(1, '#4d3312');
  ctx.fillStyle = disc; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  const face = ctx.createRadialGradient(x, y - 1, 0, x, y, r - 1.4); face.addColorStop(0, '#1d3d48'); face.addColorStop(1, '#0b1b22'); ctx.fillStyle = face; ctx.beginPath(); ctx.arc(x, y, r - 1.4, 0, TAU); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r - 1.6, 0, TAU); ctx.clip(); ctx.globalAlpha = done ? .45 : 1;
  sprite(ctx, art, 'nerra', 'nerraBody', x, y + 5.2, { width: 21 }); ctx.restore();
}
function banner(ctx, g, b) {
  const a = Math.min(1, b.t * 6, (b.life - b.t) * 3); if (a <= 0) return;
  const y = 262, w = 264, x = g.width / 2 - w / 2, pop = 1 + .08 * Math.max(0, 1 - b.t * 5);
  ctx.save(); ctx.globalAlpha = a; ctx.translate(g.width / 2, y); ctx.scale(pop, pop); ctx.translate(-g.width / 2, -y);
  ctx.fillStyle = '#0b111bdd'; ctx.beginPath(); ctx.roundRect(x, y - 22, w, b.sub ? 46 : 34, 16); ctx.fill();
  ctx.strokeStyle = '#d6a35f'; ctx.lineWidth = 1.4; ctx.stroke();
  text(ctx, b.text, g.width / 2, y - 6, 18, '#ffe3a1', 'center');
  if (b.sub) text(ctx, b.sub, g.width / 2, y + 13, 10, '#cfeff0', 'center');
  ctx.restore();
}
// The stage card: 1.2 s, skippable with a tap. "STAGE 2 OF 4", the stage's name and its one-line stake.
function card(ctx, g, art) {
  const t = g.card.t, T = 1.2, a = Math.min(1, t / .14, (T - t) / .2), info = STAGES[g.stage], y = Math.min(300, g.paddle.y - 210);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  const slide = (1 - smooth(Math.min(1, t / .25))) * 14;
  ctx.fillStyle = '#050a10aa'; ctx.fillRect(0, y - 58, g.width, 116);
  const w = 300, x = g.width / 2 - w / 2, top = y - 46 + slide;
  const bg = ctx.createLinearGradient(0, top, 0, top + 92); bg.addColorStop(0, '#16303ccc'); bg.addColorStop(1, '#0b1820ee');
  ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(x, top, w, 92, 18); ctx.fill();
  ctx.strokeStyle = '#d6a35f'; ctx.lineWidth = 1.6; ctx.stroke(); ctx.strokeStyle = '#ffe3a133'; ctx.lineWidth = .7; ctx.beginPath(); ctx.roundRect(x + 4, top + 4, w - 8, 84, 14); ctx.stroke();
  text(ctx, g.stageLabel, g.width / 2, top + 17, 11, '#7fc7cf', 'center');
  text(ctx, info.name.toUpperCase(), g.width / 2, top + 42, 26, '#ffe3a1', 'center');
  text(ctx, info.stake, g.width / 2, top + 68, 11.5, '#e8f2f0', 'center');
  pips(ctx, g.width / 2 - 8, top + 84, g.stageCount - 1, g.stage, { key: 'pip_blue', bloom: '#8fc8ff', gap: 12, scale: .5 });
  ctx.restore();
}
export { brassBar, pearl };
