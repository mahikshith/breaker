// Shared Siege stage UI (design/phase2/stages-v2.md section 2): the stage card, the HUD pip track that ends in the
// villain's crest, and the stage banner. Any chapter that plays as a Siege (Tidewheel, Gatehouse, Frost...) draws these
// with its own words, colours and crest; nothing here knows which villain it is.
//
//   stageCard(ctx, { width, y, t, duration, label, name, stake, index, count, theme })
//     1.2 s card: "STAGE 2 OF 4", the stage name, its one-line stake, and a small pip row. t is the card's age in seconds.
//   pipTrack(ctx, { cx, y, title, count, cleared, current, time, crest, theme })
//     The chapter chip: title over one gem per stage, the last one the villain's crest (bigger, a faint pulse).
//     crest(ctx, x, y, r, { now, done, time }) draws the villain's face inside the medallion (already clipped to it).
//   crestMedallion(ctx, x, y, r, { now, done, time, theme, crest })
//     Only the medallion (brass rim, dark face, glow), for a chapter that wants the crest elsewhere.
//   stageBanner(ctx, { width, y, text, sub, t, life, theme })
//     "STAGE CLEAR" style banner with an optional carry-over line.
import { text } from '../gfx.js';
import { glow, pips, smooth } from './render.js';

const TAU = Math.PI * 2;
export const STAGE_UI_THEME = {
  ink: '#0b111b', edge: '#7fc7cf', title: '#cfeff0', gold: '#ffe3a1', brass: '#d6a35f', body: '#e8f2f0',
  cardTop: '#16303c', cardBottom: '#0b1820', track: '#3b4a55', pipDone: 'pip_blue', pipNow: 'pip_gold',
  bloomDone: '#8fc8ff', bloomNow: '#ffcf7a', villain: '#ff8f7a',
};
const themed = theme => theme ? { ...STAGE_UI_THEME, ...theme } : STAGE_UI_THEME;

export function crestMedallion(ctx, x, y, r, { now = false, done = false, time = 0, theme, crest } = {}) {
  const T = themed(theme), pulse = .5 + .5 * Math.sin(time * (now ? 4 : 1.6));
  glow(ctx, x, y, r * 2.4, done ? T.bloomDone : T.villain, (now ? .45 : .2) + .15 * pulse);
  const disc = ctx.createRadialGradient(x - r * .35, y - r * .4, 0, x, y, r);
  disc.addColorStop(0, '#fff1c4'); disc.addColorStop(.4, '#c9934a'); disc.addColorStop(1, '#4d3312');
  ctx.fillStyle = disc; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  const face = ctx.createRadialGradient(x, y - 1, 0, x, y, r - 1.4);
  face.addColorStop(0, '#1d3d48'); face.addColorStop(1, '#0b1b22');
  ctx.fillStyle = face; ctx.beginPath(); ctx.arc(x, y, r - 1.4, 0, TAU); ctx.fill();
  if (!crest) return;
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r - 1.6, 0, TAU); ctx.clip(); ctx.globalAlpha = done ? .45 : 1;
  crest(ctx, x, y, r, { now, done, time }); ctx.restore();
}

export function pipTrack(ctx, { cx, y = 3, title, count, cleared, current, time = 0, crest, theme, width = 118 }) {
  const T = themed(theme), n = count;
  ctx.save(); ctx.globalAlpha = .88; ctx.fillStyle = T.ink + 'cc'; ctx.beginPath(); ctx.roundRect(cx - width / 2, y, width, 31, 10); ctx.fill();
  ctx.strokeStyle = T.edge + '66'; ctx.lineWidth = .8; ctx.stroke(); ctx.restore();
  if (title) text(ctx, title, cx, y + 8.5, 9, T.title, 'center');
  const gap = 17, x0 = cx - (n - 1) * gap / 2 - 4, py = y + 22;
  for (let i = 0; i < n - 1; i++) {
    const x = x0 + i * gap, done = i < cleared, now = i === current && !done, beat = now ? .5 + .5 * Math.sin(time * 5) : 0;
    ctx.fillStyle = i + 1 <= cleared ? T.edge : T.track; ctx.fillRect(x + 4, py - .8, gap - 8 + (i === n - 2 ? 4 : 0), 1.6);
    pips(ctx, x, py, 1, done || now ? 1 : 0, { key: done ? T.pipDone : T.pipNow, bloom: done ? T.bloomDone : T.bloomNow, scale: .62, pulse: beat });
  }
  crestMedallion(ctx, x0 + (n - 1) * gap + 4, py - .5, 7.6, { now: current === n - 1, done: cleared >= n, time, theme, crest });
}

export function stageCard(ctx, { width, y, t, duration = 1.2, label, name, stake, index, count, theme }) {
  const T = themed(theme), a = Math.min(1, t / .14, (duration - t) / .2);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  const slide = (1 - smooth(Math.min(1, t / .25))) * 14;
  ctx.fillStyle = '#050a10aa'; ctx.fillRect(0, y - 58, width, 116);
  const w = 300, x = width / 2 - w / 2, top = y - 46 + slide;
  const bg = ctx.createLinearGradient(0, top, 0, top + 92); bg.addColorStop(0, T.cardTop + 'cc'); bg.addColorStop(1, T.cardBottom + 'ee');
  ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(x, top, w, 92, 18); ctx.fill();
  ctx.strokeStyle = T.brass; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.strokeStyle = T.gold + '33'; ctx.lineWidth = .7; ctx.beginPath(); ctx.roundRect(x + 4, top + 4, w - 8, 84, 14); ctx.stroke();
  text(ctx, label || `STAGE ${index + 1} OF ${count}`, width / 2, top + 17, 11, T.edge, 'center');
  text(ctx, String(name).toUpperCase(), width / 2, top + 42, 26, T.gold, 'center');
  if (stake) text(ctx, stake, width / 2, top + 68, 11.5, T.body, 'center');
  pips(ctx, width / 2 - 8, top + 84, count - 1, index, { key: T.pipDone, bloom: T.bloomDone, gap: 12, scale: .5 });
  ctx.restore();
}

export function stageBanner(ctx, { width, y = 262, text: line, sub, t, life, theme }) {
  const T = themed(theme), a = Math.min(1, t * 6, (life - t) * 3); if (a <= 0) return;
  const w = 264, x = width / 2 - w / 2, pop = 1 + .08 * Math.max(0, 1 - t * 5);
  ctx.save(); ctx.globalAlpha = a; ctx.translate(width / 2, y); ctx.scale(pop, pop); ctx.translate(-width / 2, -y);
  ctx.fillStyle = T.ink + 'dd'; ctx.beginPath(); ctx.roundRect(x, y - 22, w, sub ? 46 : 34, 16); ctx.fill();
  ctx.strokeStyle = T.brass; ctx.lineWidth = 1.4; ctx.stroke();
  text(ctx, line, width / 2, y - 6, 18, T.gold, 'center');
  if (sub) text(ctx, sub, width / 2, y + 13, 10, T.title, 'center');
  ctx.restore();
}
