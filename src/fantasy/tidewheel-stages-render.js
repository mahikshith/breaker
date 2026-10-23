// Tidewheel Siege drawing (src/fantasy/tidewheel-siege.js): the stage boards, Nerra's code motion, the snapped refuge
// chain, the siege effects and the HUD (stage pips, stage card, banners, drops). render.js calls these hooks from its
// Tidewheel pass; every hook does nothing for the plain Tidewheel model (no `g.siege`), so that chapter draws as before.
//
// Steel is barnacled brass: a glossy, finished bar with a bright glint stripe on the face next to each gap the ball must
// use, so the way in reads at a glance. No effect here is a bare stroked ring or a dot spray.
import { SPR, ready, cached, text, drawCapsule, drawAt } from '../gfx.js';
import { glow, sparks, chips, pips, fxPart, dust, rnd, clamp01, smooth, sprite, hoistChain, brick, pool, seaBrick } from './render.js';
import { STAGES } from './tidewheel-stages.js';
import { pipTrack, stageCard, stageBanner } from './stage-ui.js';

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
  if (!(b.maxHP > 1) && !b.regrow) return;
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
  glazed(ctx, g, art, b, b.lx, b.ly, draw);
}
// The sea-glaze bricks (assets/tidewheel-glaze): sea-glass and coral for one-hit bricks, the steel glaze for 2-hit armour
// (its cracked frame after the first hit), and the sea-mine composed on a coral tile. Barnacle shield wears a crust.
function glazed(ctx, g, art, b, x, y, draw) {
  if (b.type === 'mine') return mine(ctx, g, art, b, x, y);
  const armour = b.maxHP > 1, mat = armour ? 'steel' : ['seaglass', 'coral'][((b.colour | 0) % 2 + 2) % 2];
  if (!seaBrick(ctx, art, mat, armour && b.hp < b.maxHP ? 1 : 0, x, y, b.w, b.h)) draw();
  if (b.regrow) crust(ctx, b, x, y);
}
// A sea-mine: an iron sphere in a coral cradle, six brass-capped horns and a red lamp that blinks faster on its fuse.
function mine(ctx, g, art, b, x, y) {
  seaBrick(ctx, art, 'coral', 0, x, y, b.w, b.h) || (ctx.fillStyle = '#b8564a', ctx.beginPath(), ctx.roundRect(x, y, b.w, b.h, 3), ctx.fill());
  const cx = x + b.w / 2, cy = y + b.h / 2, r = Math.min(b.w, b.h) * .36;
  ctx.fillStyle = '#2a161299'; ctx.beginPath(); ctx.ellipse(cx, cy + r * .55, r * 1.25, r * .55, 0, 0, TAU); ctx.fill();   // the cradle's shadow
  for (let i = 0; i < 6; i++) {
    const a = i * TAU / 6 - Math.PI / 2 + .26;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(a);
    const hg = ctx.createLinearGradient(0, -1.6, 0, 1.6); hg.addColorStop(0, '#6d7a80'); hg.addColorStop(1, '#141a1e');
    ctx.fillStyle = hg; ctx.beginPath(); ctx.moveTo(r - 1, -1.7); ctx.lineTo(r + 2.6, -.9); ctx.lineTo(r + 2.6, .9); ctx.lineTo(r - 1, 1.7); ctx.closePath(); ctx.fill();
    const cap = ctx.createRadialGradient(r + 2.4, -.5, 0, r + 2.8, 0, 1.6); cap.addColorStop(0, '#fff1c4'); cap.addColorStop(1, '#8a5f22');
    ctx.fillStyle = cap; ctx.beginPath(); ctx.arc(r + 2.9, 0, 1.4, 0, TAU); ctx.fill();
    ctx.restore();
  }
  const body = ctx.createRadialGradient(cx - r * .4, cy - r * .45, r * .1, cx, cy, r);
  body.addColorStop(0, '#8d9ba2'); body.addColorStop(.35, '#3a464d'); body.addColorStop(1, '#0b1013');
  ctx.fillStyle = body; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
  const band = ctx.createLinearGradient(cx - r, 0, cx + r, 0); band.addColorStop(0, '#5a3d16'); band.addColorStop(.4, '#d9a957'); band.addColorStop(1, '#4d3312');
  ctx.fillStyle = band; ctx.fillRect(cx - r, cy - .8, r * 2, 1.6);
  ctx.fillStyle = '#ffffff55'; ctx.beginPath(); ctx.ellipse(cx - r * .35, cy - r * .42, r * .32, r * .2, -.5, 0, TAU); ctx.fill();
  const fuse = g.effects.some(e => e.kind === 'mine-fuse' && Math.abs(e.x - cx) < 1 && Math.abs(e.y - cy) < 1), blink = fuse ? 1 : .5 + .5 * Math.sin(g.time * 4 + cx * .1);
  glow(ctx, cx + r * .1, cy - r * .55, 6 + 4 * blink, '#ff3b2a', .35 + .45 * blink);
  ctx.fillStyle = blink > .6 ? '#ffd2c4' : '#c8321f'; ctx.beginPath(); ctx.arc(cx + r * .1, cy - r * .55, 1.3, 0, TAU); ctx.fill();
}
// Barnacle plate: brass armour riveted over a gap. A plain ball only knocks on it; the seam glows while a big power is
// live (fire, laser, the titan), and each laser bolt leaves a crack.
function plate(ctx, g, b, i) {
  brassBar(ctx, b, b.x, b.y, 40 + i, g.time);
  const live = g.timers?.fire > 0 || g.timers?.laser > 0 || g.cosmic || g.balls?.some(q => q.titan > 0 || q.ram > 0);
  if (live) glow(ctx, b.x + b.w / 2, b.y + b.h / 2, b.w, '#ff9a5a', .55 + .3 * Math.sin(g.time * 9));
  for (const k of [.18, .5, .82]) hub(ctx, b.x + b.w * k, b.y + b.h / 2, 1.9, live ? .6 : 0);
  const dmg = 3 - (b.hp ?? 3);
  ctx.lineCap = 'round';
  for (let n = 0; n < dmg; n++) for (const [col, lw, o] of [['#141a1e', 1.2, 0], ['#ffffff66', .45, -.6]]) {
    const cx = b.x + b.w * (.3 + .2 * n);
    ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(cx, b.y + .8 + o); ctx.lineTo(cx + 2, b.y + b.h * .5 + o); ctx.lineTo(cx - 1, b.y + b.h - .8 + o); ctx.stroke();
  }
}

// ---------- the board: blocks, brass bars, spokes ----------
export function siegeBoard(ctx, g, art) {
  if (!g.siege) return;
  for (const c of g.board.chambers) alcove(ctx, c);
  for (const b of g.blocks) if (b.hp > 0) { if (b.prize) prize(ctx, g, art, b); else glazed(ctx, g, art, b, b.x, b.y, () => { brick(ctx, art, b); crust(ctx, b, b.x, b.y); }); }
  g.bars.forEach((b, i) => { if (b.broken) return; if (b.power) plate(ctx, g, b, i); else brassBar(ctx, b, b.x, b.y, i, g.time); });
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
    case 'mine-fuse': ctx.globalAlpha = 1; glow(ctx, e.x, e.y, 18, '#ff6a3a', .4 + .4 * Math.sin(t * 60)); return true;
    case 'mine-blast': {
      // The blast: a white-hot core, an orange bloom out to the blast radius, iron shards and a burst of spray.
      ctx.globalAlpha = 1; const R = e.r || 46;
      glow(ctx, e.x, e.y, R * (.5 + .7 * smooth(Math.min(1, q * 3))), '#ffb35a', (1 - q) * .75);
      glow(ctx, e.x, e.y, 16 * (1 - q) + 4, '#fff6dc', (1 - q) * .95);
      sparks(ctx, e.x, e.y, Math.min(t, .41), 16, 300, ['#ffe2a8', '#ff9a5a', '#fff2c4'], 2.6, 91);
      chips(ctx, e.x, e.y, t, e.life, 7, 190, 1, 93, 1.6);
      if (q < .7) { ctx.globalAlpha = 1 - q / .7; drawAt(ctx, `splash/${Math.min(3, Math.floor(q / .7 * 4))}`, e.x, e.y + 8, .8); }
      return true;
    }
    case 'plate-chip': ctx.globalAlpha = 1; glow(ctx, e.x, e.y, 14, '#ffb1d0', (1 - q) * .7); sparks(ctx, e.x, e.y, t, 6, 150, GOLD, 1.8, 95); return true;
    case 'barnacle-grow': {
      ctx.globalAlpha = 1; glow(ctx, e.x, e.y, (e.w || 30) * .7, '#7fe0c8', (1 - q) * .5);
      const k = smooth(Math.min(1, q * 1.6));
      for (let i = 0; i < 4; i++) barnacle(ctx, e.x - (e.w || 30) / 2 + (e.w || 30) * (i + .5) / 4, e.y + (e.h || 16) / 2 - 2, (1.2 + rnd(i, 7) * .8) * k);
      return true;
    }
    case 'flood-danger': ctx.globalAlpha = 1; glow(ctx, e.x, e.y, 80, '#ff5a4a', (1 - q) * .45); return true;
    case 'brick-break': {
      if (typeof e.colour === 'number' || e.colour === 'steel') return false;   // glazed bricks keep the shared sea-glaze break
      if (e.colour === 'mine') { ctx.globalAlpha = 1; chips(ctx, e.x, e.y, t, e.life, 5, 160, .9, 97); return true; }   // the blast is its own effect
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
  tide(ctx, g);
  // Armed balls (they can strike Nerra this return) carry a faint gold halo while she is in the fight.
  const v = g.villain;
  if (g.stage >= 1 && !v.hidden && !v.ghost) for (const b of g.balls) if (!b.dead && !b.caught && !b.spent && !(b.titan > 0)) glow(ctx, b.x, b.y, 13, '#ffd27a', .32);
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
  floodGauge(ctx, g);
  if (g.tip) { const a = Math.min(1, g.tip.t * 5, (g.tip.life - g.tip.t) * 3); ctx.save(); ctx.globalAlpha = a; text(ctx, g.tip.text, g.width / 2, p.y - 52, 11.5, '#f3dca8', 'center'); ctx.restore(); }
  if (g.banner) banner(ctx, g, g.banner);
  if (g.phase === 'card' && g.card) card(ctx, g, art);
}
// The flood on the water itself: in stages 1-2 a soft foam line shows where the next surge will lift it; in danger the
// surface runs red, the screen edges warm, and it pulses.
function tide(ctx, g) {
  const W = g.water, danger = g.floodDanger, beat = .5 + .5 * Math.sin(g.time * 7);
  // The flood front: a teal sheet that fades out 110 units below the surface, under a glossy wavy crest, so the water
  // line reads as it climbs the scene.
  const front = ctx.createLinearGradient(0, W.y, 0, W.y + 110); front.addColorStop(0, danger ? '#3fa6b866' : '#3fa6b84d'); front.addColorStop(1, '#3fa6b800');
  ctx.fillStyle = front; ctx.fillRect(12, W.y, g.width - 24, 110);
  ctx.save(); ctx.beginPath(); ctx.moveTo(12, W.y + 3);
  for (let x = 12; x <= g.width - 12; x += 6) ctx.lineTo(x, W.y + Math.sin(x * .06 + g.time * 2.6) * 1.6 - 1.2);
  for (let x = g.width - 12; x >= 12; x -= 6) ctx.lineTo(x, W.y + 2.4 + Math.sin(x * .06 + g.time * 2.6 + .8) * 1.2);
  ctx.closePath(); ctx.fillStyle = danger ? '#ffd2c4b0' : '#dff8f4a0'; ctx.fill(); ctx.restore();
  if (g.stage <= 1 && g.rules.tideSurge > 0 && g.started) {
    const y = W.target - g.rules.tideSurge, a = .16 + .1 * Math.sin(g.time * 2.4);
    const foam = ctx.createLinearGradient(0, y - 3, 0, y + 3); foam.addColorStop(0, '#dff8f400'); foam.addColorStop(.5, '#dff8f4'); foam.addColorStop(1, '#dff8f400');
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = foam; ctx.fillRect(12, y - 3, g.width - 24, 6); ctx.restore();
  }
  if (!danger) return;
  const band = ctx.createLinearGradient(0, W.y - 10, 0, W.y + 26); band.addColorStop(0, '#ff5a4a00'); band.addColorStop(.3, '#ff5a4a'); band.addColorStop(1, '#ff5a4a00');
  ctx.save(); ctx.globalAlpha = .22 + .2 * beat; ctx.fillStyle = band; ctx.fillRect(12, W.y - 10, g.width - 24, 36);
  for (const [x0, x1] of [[0, 26], [g.width, g.width - 26]]) { const e = ctx.createLinearGradient(x0, 0, x1, 0); e.addColorStop(0, '#ff3b2a'); e.addColorStop(1, '#ff3b2a00'); ctx.globalAlpha = .12 + .12 * beat; ctx.fillStyle = e; ctx.fillRect(Math.min(x0, x1), 67, 26, g.height - 67); }
  ctx.restore();
}
// The flood clock beside the paddle: how much of the water column the tide has climbed, teal to amber to red. In danger
// it pulses and reads FLOOD.
function floodGauge(ctx, g) {
  const p = g.paddle, f = g.floodFrac(), danger = g.floodDanger, beat = .5 + .5 * Math.sin(g.time * 7);
  const w = 168, x = g.width / 2 - w / 2 + 14, y = Math.min(g.height - 14, p.y + 44);
  ctx.save(); ctx.globalAlpha = .9;
  if (danger) glow(ctx, x + w * f, y + 2, 26, '#ff5a4a', .3 + .3 * beat);
  ctx.fillStyle = '#0c1923cc'; ctx.beginPath(); ctx.roundRect(x, y, w, 5, 2.5); ctx.fill();
  const col = f < .5 ? '#7fd8d0' : f < .7 ? '#f3c46a' : '#ff6a54', fill = ctx.createLinearGradient(x, 0, x + w * f, 0);
  fill.addColorStop(0, '#2f8f9a'); fill.addColorStop(1, col);
  ctx.fillStyle = fill; ctx.beginPath(); ctx.roundRect(x, y, Math.max(5, w * f), 5, 2.5); ctx.fill();
  ctx.fillStyle = '#ffffff40'; ctx.fillRect(x + w * .7, y - 1, 1, 7);   // the danger notch
  ctx.restore();
  text(ctx, danger ? 'FLOOD' : 'TIDE', x - 6, y + 4.5, 8.5, danger ? (beat > .5 ? '#ffd2c4' : '#ff6a54') : '#9fd6d2', 'right');
}
// The chapter chip and stage card come from the shared Siege UI (stage-ui.js); Tidewheel passes Nerra's crest.
const nerraCrest = art => (c, x, y) => sprite(c, art, 'nerra', 'nerraBody', x, y + 5.2, { width: 21 });
function hud(ctx, g, art) {
  pipTrack(ctx, { cx: g.width / 2, y: 3, title: 'TIDEWHEEL SIEGE', count: g.stageCount, cleared: g.state === 'won' ? g.stageCount : g.stagesCleared, current: g.stage, time: g.time, crest: nerraCrest(art) });
}
function banner(ctx, g, b) { stageBanner(ctx, { width: g.width, y: 262, text: b.text, sub: b.sub, t: b.t, life: b.life }); }
// The stage card: 1.2 s, skippable with a tap. "STAGE 2 OF 4", the stage's name and its one-line stake.
function card(ctx, g) {
  const info = STAGES[g.stage];
  stageCard(ctx, { width: g.width, y: Math.min(300, g.paddle.y - 210), t: g.card.t, duration: 1.2, label: g.stageLabel, name: info.name, stake: info.stake, index: g.stage, count: g.stageCount });
}
export { brassBar, pearl };
