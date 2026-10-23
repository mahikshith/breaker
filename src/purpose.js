// Purpose card: the first thing a chapter shows. Who the villain is, what it is doing and by when, what you protect and
// what wins, in two short lines over the villain's own portrait. Kit (the paddle) is the hero, Lumi the princess.
// Every line comes from the chapter's real rules (see each chapter file's header); keep lines under ~40 characters.
import { text, rrect, FONT } from './gfx.js';
import { drawPortrait } from './portraits.js';
import { store } from './prefs.js';

// guard: the portrait of what you protect (label under it); you: the player's portrait (Kit, or Lumi where she holds the paddle).
// lines: [villain and its clock, what to do]. keep / win: the two footer pills.
export const PURPOSE = {
  vault: { title: 'THE VAULT', accent: '#f4c542', villains: ['serpent'], guard: ['lumi', 'LUMI'],
    lines: ['The serpent crawls to take Lumi.', 'Reach her cage before it does.'], keep: 'Lumi', win: 'Free her' },
  frost: { title: 'FROST WARDEN', accent: '#8fd0ff', villains: ['warden'], guard: ['lumi', 'LUMI'],
    lines: ['The Yeti smashes the 3 ice posts.', 'Break him before they fall.'], keep: 'The 3 ice posts', win: 'Beat the Warden' },
  mooncoil: { title: 'MOONCOIL RELIQUARY', accent: '#c2a8f4', villains: ['mooncoil', 'serpent'], guard: ['lumi', 'LUMI'],
    lines: ['Mooncoil slithers to Lumi’s cage.', 'Break it first. Rival Gnash follows.'], keep: 'Lumi', win: 'Shatter the cage' },
  bellforge: { title: 'BELLFORGE RUN', accent: '#e6b36a', villains: ['korr'], guard: ['lumi', 'LUMI'],
    lines: ['Korr’s bells sink Lumi’s lift.', 'Bat them away. Break his armour.'], keep: 'Lumi’s lift', win: 'Stop Korr' },
  tidewheel: { title: 'TIDEWHEEL CITADEL', accent: '#7fd6dc', villains: ['nerra'], guard: ['lumi', 'LUMI'],
    lines: ['Nerra floods Lumi’s chamber.', 'Beat the tide. Break her grip.'], keep: 'Lumi’s refuge', win: 'Stop the flood' },
  gatehouse: { title: 'GATEHOUSE SIEGE', accent: '#e0a070', villains: ['korr'], guard: ['lumi', 'LUMI'],
    lines: ['Korr holds the gate against Kit.', 'Drop the bridge. Beat Korr.'], keep: 'Your last ball', win: 'Take the gate' },
  lumitower: { title: 'LUMI BREAKS OUT', accent: '#f5a5c8', villains: ['serpent'], guard: null,
    lines: ['Gnash lunges from the windows.', 'Dodge the bites. Climb to the roof.'], keep: 'Lumi (no bites)', win: 'Reach the roof', you: ['lumi', 'LUMI'] },
  rivals: { title: 'SERPENT RIVALS', accent: '#9fe0e8', villains: ['serpent', 'mooncoil'], guard: ['lumi', 'LUMI'],
    lines: ['Two serpents guard the Twin Seal.', 'Bait them to clash and crack it.'], keep: 'Your last ball', win: 'Break the Seal' },
  hoard: { title: 'DRAGON’S HOARD', accent: '#ffc86a', villains: ['ember'], guard: ['coin', 'LOOT'],
    lines: ['Ember sleeps on his hoard.', 'Grab the gold. Keep his eye shut.'], keep: 'Ember’s sleep', win: 'Escape rich' },
};
// LEVELS index (src/main.js) -> card.
export const PURPOSE_AT = { 1: 'vault', 4: 'frost', 5: 'mooncoil', 6: 'bellforge', 7: 'tidewheel', 8: 'gatehouse', 9: 'lumitower', 10: 'rivals', 11: 'hoard' };
export const SHOWN = 3;   // a chapter's card opens this many times from the menu, then stays out of the way
export const AUTO = 6;    // seconds before an untouched card starts the chapter by itself

// Pure state: which card is up and how long it has been there. open() returns null when there is nothing to show.
export function purposeSeen(i) { return +(store.get('purposeSeen') || {})[i] || 0; }
export function openPurpose(i, { force = false } = {}) {
  const id = PURPOSE_AT[i]; if (!id || !force && purposeSeen(i) >= SHOWN) return null;
  const seen = store.get('purposeSeen') || {}; seen[i] = purposeSeen(i) + 1; store.set('purposeSeen', seen);
  return { id, card: PURPOSE[id], t: 0 };
}

const ease = x => 1 + 2.70158 * (x - 1) ** 3 + 1.70158 * (x - 1) ** 2;
// Draws the card centred in a W x H frame, over a soft scrim. p: { card, t }.
export function drawPurpose(g, W, H, p) {
  const c = p.card, t = p.t, a = Math.min(1, t / .18), pop = .9 + .1 * ease(Math.min(1, t / .3));
  const w = 328, h = 232, x = (W - w) / 2, y = Math.max(78, Math.min(H * .5 - h / 2 - 40, H - h - 150));
  g.save(); g.globalAlpha = a;
  g.fillStyle = 'rgba(4,7,16,0.55)'; g.fillRect(0, 0, W, H);
  g.translate(W / 2, y + h / 2); g.scale(pop, pop); g.translate(-W / 2, -(y + h / 2));
  // panel: glazed dark enamel with a brass rim and a soft sheen
  g.fillStyle = 'rgba(0,0,0,0.5)'; rrect(g, x + 3, y + 9, w, h, 26); g.fill();
  const bg = g.createLinearGradient(0, y, 0, y + h); bg.addColorStop(0, '#2d3560'); bg.addColorStop(1, '#141830');
  g.fillStyle = bg; rrect(g, x, y, w, h, 26); g.fill();
  const tint = g.createRadialGradient(W / 2, y + 74, 8, W / 2, y + 74, 170); tint.addColorStop(0, c.accent + '3a'); tint.addColorStop(1, c.accent + '00');
  g.fillStyle = tint; rrect(g, x, y, w, h, 26); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.035)'; rrect(g, x + 14, y + 6, w - 28, 28, 14); g.fill();
  g.strokeStyle = '#d6a35f'; g.lineWidth = 2; rrect(g, x + 1, y + 1, w - 2, h - 2, 25); g.stroke();
  g.strokeStyle = 'rgba(255,230,170,0.22)'; g.lineWidth = 1; rrect(g, x + 6, y + 6, w - 12, h - 12, 21); g.stroke();
  text(g, c.title, W / 2, y + 22, 13, c.accent, 'center');
  // portraits: what you protect, the villain, you
  const py = y + 86, vs = c.villains;
  const vx = c.guard ? W / 2 : W / 2 - 38, yx = c.guard ? W / 2 + 108 : W / 2 + 92;   // no one to protect: the pair sits together
  if (c.guard) { drawPortrait(g, c.guard[0], W / 2 - 108, py + 6, 27, t); label(g, c.guard[1], W / 2 - 108, py + 40); }
  if (vs.length === 1) drawPortrait(g, vs[0], vx, py, 44, t);
  else { drawPortrait(g, vs[1], vx + 22, py + 8, 31, t + .6); drawPortrait(g, vs[0], vx - 18, py, 40, t); }
  const you = c.you || ['kit', 'KIT'];
  drawPortrait(g, you[0], yx, py + 6, 27, t + 1.2); label(g, you[1] === 'KIT' ? 'KIT · YOU' : 'YOU', yx, py + 40);
  // the two lines
  const ly = y + 148; fit(g, c.lines[0], W / 2, ly, 17, w - 30, '#ffffff'); fit(g, c.lines[1], W / 2, ly + 24, 17, w - 30, '#ffe3a1');
  // footer pills
  pill(g, 'PROTECT', c.keep, x + 14, y + 190, (w - 36) / 2, '#ff9ec8'); pill(g, 'WIN', c.win, x + 22 + (w - 36) / 2, y + 190, (w - 36) / 2, '#9ff7ec');
  g.restore();
  // the prompt under the card, breathing
  g.save(); g.globalAlpha = a * (.7 + .3 * Math.sin(t * 4)); text(g, 'TAP TO START', W / 2, y + h + 34, 17, '#fff', 'center'); g.restore();
}
function label(g, s, x, y) { text(g, s, x, y, 10, '#c9cfee', 'center'); }
function fit(g, s, x, y, size, maxW, color) { g.font = `${size}px ${FONT}`; const w = g.measureText(s).width; text(g, s, x, y, w > maxW ? Math.floor(size * maxW / w * 10) / 10 : size, color, 'center'); }
function pill(g, k, v, x, y, w, c) {
  g.fillStyle = 'rgba(6,9,20,0.7)'; rrect(g, x, y, w, 28, 14); g.fill();
  g.strokeStyle = c + '66'; g.lineWidth = 1; rrect(g, x + .5, y + .5, w - 1, 27, 13.5); g.stroke();
  text(g, k, x + 11, y + 14.5, 9.5, c, 'left');
  g.font = `11.5px ${FONT}`; const room = w - 22 - g.measureText(k).width - 6, vw = g.measureText(v).width;
  text(g, v, x + w - 10, y + 14.5, vw > room ? Math.max(8, Math.floor(11.5 * room / vw * 10) / 10) : 11.5, '#fff', 'right');
}
