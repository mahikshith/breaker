// Gatehouse Siege drawing for the stage layer (gatehouse.js / gatehouse-stages.js): the stage 1 hoist (portcullis, Lumi's
// lift, Korr's hook walk), riveted portcullis-iron bars with a glint on gap faces and hairline cracks, the sliding tooth,
// chest bricks, capsules and laser bolts, the dais payoffs, and the HUD (pip track ending in Korr's crest, the stage card,
// clocks, tips and banners) through the shared stage UI (stage-ui.js). render.js calls these hooks; bricks keep their
// existing sprites, and every brick and bar carries `kind` so a themed brick set can map them.
import { SPR, ready, drawCapsule, text, cached } from '../gfx.js';
import { drawThemedBar } from '../themed-bricks.js';
import { glow, sparks, chips, pips, fxPart, clamp01, smooth, hoistChain, sprite, slab, korr, rackWreck, pool, princessAt } from './render.js';
import { pipTrack, stageCard, stageBanner } from './stage-ui.js';
import { PORTCULLIS, HOIST, GATEHOUSE_TIMING } from './gatehouse.js';
import { GATEHOUSE_STAGES } from './gatehouse-stages.js';

export const GATEHOUSE_THEME = { edge: '#d6a35f', title: '#f3dca8', gold: '#ffe3a1', brass: '#d6a35f', body: '#f1e6d2', cardTop: '#2c1d12', cardBottom: '#120c08',
  track: '#4a3a2a', pipDone: 'pip_gold', pipNow: 'pip_rose', bloomDone: '#ffcf7a', bloomNow: '#ff9ec0', villain: '#ff7a4a', ink: '#0b111b' };
const ga = ctx => typeof ctx.globalAlpha === 'number' ? ctx.globalAlpha : 1;
const CAP_GLOW = { wide: '#7fc4ff', slow: '#a9e7dd', split: '#7fe0a0', shield: '#a9cbf0', fire: '#ff9a4a', laser: '#ff7a9a', burst: '#ffd27a', titan: '#cdadf1' };

// ---------- iron ----------
// A riveted portcullis bar: the themed set's portcullis-iron bar (src/themed-bricks.js, tiled to the bar's length), or
// drawn forged iron with rivets while that sprite is missing; then a glint stripe on the face next to its chamber's gap
// and a hairline crack once the safety valve has cracked it.
export function ironBar(ctx, g, b, { tell = 0 } = {}) {
  const { x, y, w, h } = b, vert = h > w;
  ctx.save();
  pool(ctx, x + w / 2 + 1.5, y + h / 2 + 2.5, Math.max(w, h) * .55, Math.min(w, h) * .9 + 2, '#000', .45);
  if (!drawThemedBar(ctx, 'gatehouse', x, y, w, h)) {
    const gr = vert ? ctx.createLinearGradient(x, 0, x + w, 0) : ctx.createLinearGradient(0, y, 0, y + h);
    gr.addColorStop(0, '#8d949b'); gr.addColorStop(.35, '#4a5057'); gr.addColorStop(1, '#1c2026');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.roundRect(x, y, w, h, 2); ctx.fill();
    ctx.strokeStyle = '#0b0d10'; ctx.lineWidth = .8; ctx.stroke();
    const n = Math.max(1, Math.floor((vert ? h : w) / 14));
    for (let i = 0; i < n; i++) { const t = (i + .5) / n; fxPart(ctx, 'pip_empty', vert ? x + w / 2 : x + w * t, vert ? y + h * t : y + h / 2, .42); }
  }
  if (b.glint && !b.cracked) {
    const k = .55 + .45 * Math.sin(g.time * 2.4 + x * .05);
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,226,170,${.35 * k})`;
    if (b.glint === 'r') ctx.fillRect(x + w - 1.6, y + 1, 1.6, h - 2); else if (b.glint === 'l') ctx.fillRect(x, y + 1, 1.6, h - 2);
    else if (b.glint === 'b') ctx.fillRect(x + 1, y + h - 1.6, w - 2, 1.6); else ctx.fillRect(x + 1, y, w - 2, 1.6);
    ctx.globalCompositeOperation = 'source-over';
  }
  if (b.cracked) {
    const q = clamp01((g.floorTime - b.crackedAt) / .6), heat = .5 + .5 * Math.sin(g.time * 8);
    glow(ctx, x + w / 2, y + h / 2, Math.max(w, h) * .7, '#ff8a4a', .18 + .14 * heat);
    ctx.strokeStyle = '#ffd8a0'; ctx.lineWidth = .9; ctx.beginPath();
    if (vert) { ctx.moveTo(x + 1, y + h * .3); ctx.lineTo(x + w * .6, y + h * .45); ctx.lineTo(x + w * .3, y + h * (.45 + .2 * q)); ctx.lineTo(x + w - 1, y + h * .7); }
    else { ctx.moveTo(x + w * .3, y + 1); ctx.lineTo(x + w * .45, y + h * .6); ctx.lineTo(x + w * (.45 + .1 * q), y + h * .3); ctx.lineTo(x + w * .7, y + h - 1); }
    ctx.stroke();
  }
  if (tell > 0) glow(ctx, x + w / 2, y + h / 2, w * .9, '#ffb46a', .45 * tell);
  ctx.restore();
}
export function drawIron(ctx, g) {
  for (const b of g.bars || []) if (!b.broken) ironBar(ctx, g, b);
  for (const m of g.movers || []) {
    if (m.broken) continue;
    // The sliding tooth: a ghost shows where it will snap to during its tell.
    if (m.tell) { const o = m.poses[1 - m.pose], k = .5 + .5 * Math.sin(g.time * 22); ctx.save(); ctx.globalAlpha = ga(ctx) * .35 * k; ironBar(ctx, g, { ...m, x: o.x, y: o.y }); ctx.restore(); }
    ironBar(ctx, g, m, { tell: m.tell ? .5 + .5 * Math.sin(g.time * 22) : 0 });
  }
}

// ---------- bricks: chest and gem tiles use the existing glaze sprites ----------
const tileCache = (key, w, h) => cached(`gh-tile-${key}-${w}-${h}`, w + 12, h + 14, c => {
  const s = SPR[key], P = 6, k = w / 32;
  c.save(); c.shadowColor = '#000000a0'; c.shadowBlur = 5; c.shadowOffsetX = 1.2; c.shadowOffsetY = 2.6; c.drawImage(s.img, P - 4 * k, P - 4 * k, 40 * k, 24 * k); c.restore();
});
// True when it drew the brick (a chest); gems and armour keep the Gatehouse's own glaze and overlays.
export function siegeBrick(ctx, g, b) {
  if (b.type !== 'chest') return false;
  const key = b.hp < b.maxHP ? 'brick_chest_2_1' : 'brick_chest_2_0';
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  glow(ctx, cx, cy, 26, '#ffd27a', .22 + .1 * Math.sin(g.time * 3 + b.x));
  if (ready(SPR[key])) ctx.drawImage(tileCache(key, b.w, b.h), b.x - 6, b.y - 6, b.w + 12, b.h + 14);
  else { ctx.fillStyle = '#8a5a2a'; ctx.fillRect(b.x, b.y, b.w, b.h); }
  return true;
}

// ---------- stage 1: the hoist ----------
// Korr walks in on the battlements, cranks Lumi's lift up the portcullis and walks off; the ratchet keeps climbing.
export function stageHoist(ctx, g, art) {
  const P = g.ceiling, top = P - 18, w = g.winch, v = g.villain, h = g.hoist, G = PORTCULLIS;
  // The portcullis: iron lattice over the dark gate passage (the solid the ball rebounds from).
  ctx.save();
  const pass = ctx.createLinearGradient(0, G.y, 0, G.y + G.h); pass.addColorStop(0, '#07080c'); pass.addColorStop(1, '#1a120c');
  ctx.fillStyle = pass; ctx.fillRect(G.x, G.y, G.w, G.h);
  glow(ctx, G.x + G.w / 2, G.y + G.h, 80, '#ff9a45', .16);
  for (let x = G.x + 8; x < G.x + G.w; x += 18) ironBar(ctx, g, { x: x - 3, y: G.y, w: 6, h: G.h - 4 });
  for (let y = G.y + 16; y < G.y + G.h - 8; y += 26) ironBar(ctx, g, { x: G.x + 2, y: y - 3, w: G.w - 4, h: 5 });
  for (let x = G.x + 8; x < G.x + G.w; x += 18) { ctx.fillStyle = '#2a2e33'; ctx.beginPath(); ctx.moveTo(x - 4, G.y + G.h - 4); ctx.lineTo(x + 4, G.y + G.h - 4); ctx.lineTo(x, G.y + G.h + 4); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  // Notch marks up the gate's right edge: the hoist clock, the top one red.
  for (let i = 0; i <= HOIST.top; i++) {
    const y = G.y + G.h - 4 - i * HOIST.step + 2, on = h && i <= Math.round(h.level), hot = i === HOIST.top;
    pips(ctx, G.x + G.w + 7, y, 1, on ? 1 : 0, { key: hot ? 'pip_rose' : 'pip_gold', bloom: hot ? '#ff7a5a' : '#ffcf7a', scale: .55 });
  }
  // Lumi's lift on two hoist chains from the winch drum; hauled over the top once the clock runs out.
  // Once the clock runs out the lift is hauled up over the battlements and fades while the banner plays.
  const ly = g.liftY(), haul = g.effects.find(e => e.kind === 'hoist-top'), q = haul ? clamp01(haul.age / haul.life) : 1;
  if (!h?.lost || haul) {
    const lift = h?.lost ? ly - 60 * smooth(q) : ly, alpha = h?.lost ? 1 - smooth(q) : 1;
    ctx.save(); ctx.globalAlpha = ga(ctx) * alpha;
    const tremble = h && !h.jammed && !h.lost && h.wait > g.rules.notch - .35 ? Math.sin(g.time * 60) * .8 : 0;
    for (const sx of [-22, 22]) hoistChain(ctx, art, { x: 180 + sx, y: top - 4 }, { x: 180 + sx, y: lift + 20 }, (h?.shown || 0) * 14, 5);
    sprite(ctx, art, 'bellforge', 'lift', 180 + tremble, lift + 38, { width: 70 });
    princessAt(ctx, g, art, 180 + tremble, lift + 37, h?.jammed ? 'Cheer' : 'Nervous');
    ctx.restore();
  }
  // Battlements: merlons, the walk and Korr's hoist winch.
  for (let x = 4; x < g.width; x += 34) { slab(ctx, art, x, top - 11, 20, 12); ctx.fillStyle = '#0006'; ctx.fillRect(x, top - 1, 20, 1.5); }
  slab(ctx, art, 0, top, g.width, P - top);
  const sh = ctx.createLinearGradient(0, P, 0, P + 16); sh.addColorStop(0, '#0008'); sh.addColorStop(1, '#0000'); ctx.fillStyle = sh; ctx.fillRect(0, P, g.width, 16);
  const crank = v.stage === 'windup' && !v.gone, jud = crank ? Math.sin(g.time * 48) * .06 : h && !h.lost && !h.jammed && h.wait > g.rules.notch - .35 ? Math.sin(g.time * 40) * .05 : 0;
  pool(ctx, w.x + 2, top + 1, 17, 3.5, '#000', .45);
  sprite(ctx, art, 'bellforge', 'ratchet', w.x, top, { width: 34, angle: jud + (h?.shown || 0) * .5, pivot: art.manifest.bellforge.ratchet?.anchors?.base });
  if (!v.gone) korrWalk(ctx, g, art, v, 72);
}
// Korr on a walk (hook, escape): a stride bob and a lean along his way; mirrored to face where he goes.
export function korrWalk(ctx, g, art, v, width) {
  const walking = !!v.walk, bob = walking ? -Math.abs(Math.sin(g.time * 11)) * 2.4 : v.stage === 'windup' ? -Math.abs(Math.sin(g.time * 9)) * 1.6 : 0;
  const mirror = walking ? v.walk < 0 : true, lean = walking ? v.walk * -.06 : 0;
  if (v.stage === 'windup') { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, v.foot.x, v.foot.y - 22, 44, '#ff6a2a', .3 + .15 * Math.sin(g.time * 18)); ctx.restore(); }
  korr(ctx, g, art, v, { x: v.foot.x, y: v.foot.y + bob, width, mirror, lean });
}

// ---------- stage 3: the murder hole Korr peers through ----------
export function murderSlot(ctx, g) {
  const s = g.slot; if (!s || g.villain.gone) return;
  const v = g.villain, warn = v.stage === 'windup', hit = g.effects.find(e => e.kind === 'slot-hit');
  // Korr's eyes in the dark of the hole, brighter while he leans in.
  const cx = s.x + s.w / 2, cy = s.y + s.h / 2 + 2, k = warn ? .6 + .4 * Math.sin(g.time * 14) : .35;
  for (const dx of [-5, 5]) glow(ctx, cx + dx, cy, 5, '#ffcc66', k);
  if (hit) glow(ctx, cx, cy + 4, 34, '#fff0c0', (1 - hit.age / hit.life) * .7);
}

// ---------- stage 4: the dais payoffs ----------
export function daisPayoffs(ctx, g, art) {
  if (g.floor !== 3) return;
  // The bell rack smashed on stage 2 lies wrecked beside the dais.
  if (g.rackSmashed) rackWreck(ctx, g, art, 66, 206);
  // The portcullis jammed in the right vent on stage 3: iron teeth stuck in the vent, the vent dark.
  if (g.ventJammed) {
    const x = 260, y = 214;
    pool(ctx, x, y + 2, 22, 8, '#000', .6);
    for (let i = -2; i <= 2; i++) ironBar(ctx, g, { x: x + i * 8 - 2.5, y: y - 16 + Math.abs(i) * 2, w: 5, h: 22 - Math.abs(i) * 2 });
    ironBar(ctx, g, { x: x - 22, y: y - 18, w: 44, h: 5 });
  }
}

// ---------- capsules, bolts, ball fire ----------
export function siegeProjectiles(ctx, g) {
  for (const c of g.capsules || []) {
    const t = g.time * 6 + c.id, col = CAP_GLOW[c.kind] || '#ffe3a1';
    glow(ctx, c.x, c.y, 28, col, .42 + .1 * Math.sin(t));
    if (!drawCapsule(ctx, c.kind, c.x, c.y, 34, 18.4)) { const s = SPR['cap_' + c.kind]; if (ready(s)) ctx.drawImage(s.img, c.x - 17, c.y - 9, 34, 18.4); }
  }
  for (const s of g.bolts || []) {
    glow(ctx, s.x, s.y + 4, 14, '#ff7a9a', .5);
    const tr = ctx.createLinearGradient(0, s.y, 0, s.y + 26); tr.addColorStop(0, '#ffe0eaee'); tr.addColorStop(1, '#ff7a9a00'); ctx.fillStyle = tr; ctx.fillRect(s.x - 1.2, s.y, 2.4, 26);
  }
  if (g.timers?.fire > 0) for (const b of g.balls) if (!b.dead) glow(ctx, b.x, b.y, 22, '#ff8a3a', .55 + .15 * Math.sin(g.time * 20));
  if (g.timers?.laser > 0) { const p = g.paddle; for (const s of [-1, 1]) glow(ctx, p.x + s * (p.w / 2 - 8), p.y - 2, 10, '#ff7a9a', .6); }
}

// ---------- effects this layer adds (true when drawn) ----------
export function siegeEffect(ctx, g, art, e) {
  const q = e.age / e.life, a = 1 - q;
  switch (e.kind) {
    case 'iron-hit': ctx.globalAlpha = 1; glow(ctx, e.x, e.y, 14, '#dfe8f0', a * .5); sparks(ctx, e.x, e.y, e.age, 3, 90, [], 1.3, 71); return true;
    case 'bar-crack': ctx.globalAlpha = 1; glow(ctx, e.x, e.y, 30, '#ffb46a', a * .6); sparks(ctx, e.x, e.y, e.age, 6, 120, [], 1.6, 72);
      if (e.age < .7) text(ctx, 'CRACKED!', e.x, e.y - 16 - e.age * 10, 11, '#ffd08a', 'center'); return true;
    case 'bar-break': ctx.globalAlpha = 1; chips(ctx, e.x, e.y, e.age, e.life, 10, 160, 1, 73); sparks(ctx, e.x, e.y, e.age, 10, 200, [], 2.2, 74); glow(ctx, e.x, e.y, 40, '#ffd08a', a * .6); return true;
    case 'tooth-slide': ctx.globalAlpha = 1; sparks(ctx, e.x, e.y, e.age, 5, 110, [], 1.5, 75); return true;
    case 'chest-open': ctx.globalAlpha = 1; glow(ctx, e.x, e.y, 46, '#ffd27a', a * .7); sparks(ctx, e.x, e.y, e.age, 10, 190, [], 2.2, 76); return true;
    case 'power': ctx.globalAlpha = 1; glow(ctx, e.x, e.y + 20, 40, CAP_GLOW[e.power] || '#ffe3a1', a * .55);
      if (e.age < .8) { ctx.globalAlpha = Math.min(1, a * 3); text(ctx, `${POWER_LABEL[e.power] || ''}!`, e.x, e.y - e.age * 18, 15, CAP_GLOW[e.power] || '#ffffff', 'center'); } return true;
    case 'laser-fire': return true;
    case 'laser-hit': ctx.globalAlpha = 1; glow(ctx, e.x, e.y, 12, '#ff9ab0', a * .6); return true;
    case 'slot-hit': ctx.globalAlpha = 1; sparks(ctx, e.x, e.y, e.age, 6, 140, [], 1.8, 77); return true;
    case 'hoist-crank': case 'korr-gloat': case 'hoist-notch': ctx.globalAlpha = 1; if (e.kind === 'hoist-notch') sparks(ctx, e.x + 70, e.y + 4, e.age, 4, 90, [], 1.4, 78); return true;
    case 'hoist-top': case 'hoist-jam': case 'vent-jam': case 'knockdown': case 'korr-roar': return true;   // banners (siegeOverlay)
    default: return false;
  }
}
const POWER_LABEL = { wide: 'WIDE', slow: 'SLOW', split: 'SPLIT', shield: 'SHIELD', fire: 'FIRE', laser: 'LASER', burst: 'BURST', titan: 'TITAN' };
export { POWER_LABEL };

// ---------- HUD ----------
const crest = art => (ctx, x, y, r, { done }) => {
  // Korr's head fills the medallion: his sheet's idle frame, scaled so the boar head sits in the disc.
  sprite(ctx, art, 'bellforge', 'korr', x + r * .2, y + r * 3.1, { width: r * 6.2, frame: done ? 3 : 0, mirror: true });
};
export function siegeOverlay(ctx, g, art) {
  const climb = g.phase === 'climb';
  // Pip track: one gem per stage, Korr's crest last (bigger, faint pulse from stage 1 on).
  pipTrack(ctx, { cx: g.width / 2, y: 3, title: 'GATEHOUSE SIEGE', count: g.stageCount, cleared: g.stagesCleared + (climb ? 1 : 0), current: Math.min(g.stageCount - 1, g.floor + (climb ? 1 : 0)),
    time: g.time, crest: crest(art), theme: GATEHOUSE_THEME });
  // The stage's clock or carry-over under the track.
  const chip = clockChip(g);
  if (chip && !climb && g.phase !== 'crash' && g.phase !== 'defeat') {
    const w = chip.w, beat = chip.urgent ? .5 + .5 * Math.sin(g.time * 10) : 0;
    ctx.save(); ctx.globalAlpha = .9; ctx.fillStyle = chip.urgent ? '#3a1208dd' : '#0b111bcc'; ctx.beginPath(); ctx.roundRect(g.width / 2 - w / 2, 37, w, 15, 7.5); ctx.fill();
    ctx.strokeStyle = chip.urgent ? `rgba(255,138,90,${.5 + .5 * beat})` : '#d6a35f66'; ctx.lineWidth = .8; ctx.stroke(); ctx.restore();
    if (chip.gem) fxPart(ctx, chip.gem, g.width / 2 - w / 2 + 8, 44.5, .55);
    text(ctx, chip.text, g.width / 2 + (chip.gem ? 5 : 0), 44.5, 9, chip.urgent ? '#ffb08a' : '#f3dca8', 'center');
  }
  // Knock-downs and Korr's return.
  const kd = g.effects.find(e => e.kind === 'knockdown');
  if (kd) stageBanner(ctx, { width: g.width, y: g.phase === 'crash' || g.phase === 'climb' ? 360 : 300, text: 'KORR KNOCKED DOWN!', sub: '+1 DROP · LOOT CHEST · HE’LL BE BACK', t: kd.age, life: kd.life, theme: GATEHOUSE_THEME });
  const roar = g.effects.find(e => e.kind === 'korr-roar');
  if (roar && g.phase !== 'card') stageBanner(ctx, { width: g.width, y: 300, text: 'KORR IS BACK, ENRAGED', sub: 'HE ATTACKS FASTER', t: roar.age, life: roar.life, theme: GATEHOUSE_THEME });
  const top = g.effects.find(e => e.kind === 'hoist-top');
  if (top) stageBanner(ctx, { width: g.width, y: 300, text: 'LUMI HAULED AWAY!', sub: 'CLEAR THE ARCH TO GO AFTER HER', t: top.age, life: top.life, theme: GATEHOUSE_THEME });
  // Stage clears: the carry-over in words.
  if (climb || g.phase === 'crash') {
    const t = (climb ? GATEHOUSE_TIMING.climb - g.transition : 0) + (g.phase === 'crash' ? GATEHOUSE_TIMING.crash - g.transition : 0);
    const sub = g.floor === 0 ? (g.hairpin ? 'LUMI’S HAIRPIN PINS KORR’S WINCH' : '') : g.floor === 1 ? (g.rackSmashed ? 'BELL RACK SMASHED · SLOW BELLS' : '') : g.floor === 2 ? (g.ventJammed ? 'PORTCULLIS JAMS A DAIS VENT' : '') : '';
    if (g.phase !== 'crash' || g.floor !== 1) stageBanner(ctx, { width: g.width, y: 300, text: `STAGE ${g.floor + 1} CLEAR`, sub, t, life: GATEHOUSE_TIMING.climb + .4, theme: GATEHOUSE_THEME });
  }
  // A new power's first catch: a one-line tip over the paddle.
  if (g.tip) { const a = Math.min(1, g.tip.t * 6, (2.6 - g.tip.t) * 3); ctx.save(); ctx.globalAlpha = a; const w = 260, y = g.paddle.y - 62;
    ctx.fillStyle = '#0b111bdd'; ctx.beginPath(); ctx.roundRect(g.width / 2 - w / 2, y - 11, w, 22, 11); ctx.fill(); ctx.strokeStyle = (CAP_GLOW[g.tip.kind] || '#d6a35f') + 'aa'; ctx.lineWidth = 1; ctx.stroke();
    text(ctx, g.tip.text, g.width / 2, y, 10.5, '#f3e8d0', 'center'); ctx.restore(); }
  // Power timers under the paddle.
  const T = g.timers || {}, live = ['wide', 'slow', 'fire', 'laser'].filter(k => T[k] > 0);
  live.forEach((k, i) => { const x = g.width / 2 + (i - (live.length - 1) / 2) * 60, y = g.paddle.y + 34, f = clamp01(T[k] / 12);
    ctx.fillStyle = '#0c1923cc'; ctx.beginPath(); ctx.roundRect(x - 27, y, 54, 3, 2); ctx.fill(); ctx.fillStyle = CAP_GLOW[k]; ctx.beginPath(); ctx.roundRect(x - 27, y, 54 * f, 3, 2); ctx.fill();
    text(ctx, POWER_LABEL[k], x, y - 6, 8, CAP_GLOW[k], 'center'); });
  // The stage card last, over everything.
  if (g.phase === 'card' && g.card) { const s = GATEHOUSE_STAGES[g.floor]; stageCard(ctx, { width: g.width, y: Math.min(300, g.paddle.y - 210), t: g.card.t, duration: GATEHOUSE_TIMING.card, label: g.stageLabel, name: s.name, stake: s.stake, index: g.floor, count: g.stageCount, theme: GATEHOUSE_THEME }); }
}
// The stage's clock (or carry-over) chip: hoist time, par, slow bells, the third-bell race, Korr's fury.
function clockChip(g) {
  const sec = s => `0:${String(Math.max(0, Math.ceil(s))).padStart(2, '0')}`;
  if (g.floor === 0 && g.hoist) {
    if (g.hoist.lost) return { text: 'LUMI HAULED AWAY', w: 112 };
    if (!g.hook?.done || !g.active) return { text: 'KORR HAS LUMI’S HOIST', w: 128 };
    const left = g.hoistLeft; return { text: `HOIST ${sec(left)}`, w: 74, gem: 'pip_rose', urgent: left < 8 };
  }
  if (g.floor === 1) { const par = g.parLeft; if (par > 0) return { text: `PAR ${sec(par)}`, w: 62, gem: 'pip_gold', urgent: par < 6 }; return g.winch?.pinned ? { text: 'WINCH PINNED', w: 92 } : null; }
  if (g.floor === 2) { const left = 3 - g.bellCount; if (left > 0 && g.villain && !g.villain.gone) return { text: `GATE UP BEFORE BELL 3 · ${left} LEFT`, w: 168, urgent: left === 1 }; return g.rackSmashed ? { text: 'RACK SMASHED · SLOW BELLS', w: 150 } : null; }
  if (g.floor === 3) { if (g.fury) return { text: 'KORR’S FURY', w: 80, urgent: true }; if (g.enraged) return { text: 'ENRAGED · FASTER BELLS', w: 128 }; return g.ventJammed ? { text: 'ONE VENT JAMMED', w: 100 } : null; }
  return null;
}
