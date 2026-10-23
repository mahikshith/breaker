// Entry: canvas sizing, fixed-step loop, input mapping and the three scenes (menu, level, results).
import { setDPR, text, rrect, shade, vignette, drawGrain, cached, brick, FONT, NUM, artLoaded, SPR, ready, glazedBar, drawGem } from './gfx.js';
import { unlockAudio, setMuted, isMuted, sfx } from './audio.js';
import { Mooncoil } from './mooncoil.js';
import { FantasyChapter } from './fantasy/chapter.js';
import { Carrier } from './carrier.js';
import { Relay } from './relay.js';
import { Orbital } from './orbital.js';
import { Frost } from './frost.js';
import { Vault, drawPrincessIcon } from './vault.js';
import { drawInvader } from './characters.js';
import { store } from './prefs.js';
import { PRICE, AD_SECONDS, AD_CONTINUES, continueOffer, watchAd, buyFullGame, noteLoss, lifetimeLosses, showUnlock } from './monetize.js';
import { soClose, fuse } from './near-miss.js';
import { kitOrbContains, kitTap } from './kit.js';
import { DIFFICULTY_IDS, difficulty } from './difficulty.js';
import { spacePowerAt, drawSpacePowerMenu } from './space-companions.js';

const LEVELS = [
  { make: (W, H, s) => new Carrier(W, H, s, selectedDifficulty), name: 'Carrier Breakout', sub: 'Rescue the crew before the jump.', color: '#e58fcb', next: 2 },
  { make: (W, H, s) => new Vault(W, H, s, selectedDifficulty), name: 'The Vault', sub: 'Protect Lumi from the serpent.', color: '#d99db8', next: 4, victory: 'PRINCESS SAVED!' },
  { make: (W, H, s) => new Relay(W, H, s, selectedDifficulty), name: 'Circuit Breakout', sub: 'Disable the relay. Launch the skiff.', color: '#9eb6ef', next: 3, victory: 'CIRCUIT CLEARED!' },
  { make: (W, H, s) => new Orbital(W, H, s, selectedDifficulty), name: 'Shutter Forge', sub: 'Crack the armour. Stop the reactor.', color: '#efb295', victory: 'FORGE DISABLED!' },
  { make: (W, H, s) => new Frost(W, H, s, selectedDifficulty), name: 'Frost Warden', sub: 'Break the siege. Protect Lumi.', color: '#9bc9dd', next: 5, victory: 'LUMI PROTECTED!' },
  { make: (W, H, s) => new Mooncoil(W, H, s, selectedDifficulty), name: 'Mooncoil Reliquary', sub: 'Shatter the moonstone. Free Lumi.', color: '#cbb3ef', victory: 'RELIQUARY FREED!', next: 6 },
  { make: (W, H, s) => new FantasyChapter('bellforge', W, H, s, selectedDifficulty), name: 'Bellforge Run', sub: 'Break Korr\u2019s armour. Stop the winch.', color: '#d6a35f', next: 7, victory: 'LUMI IS FREE!' },
  { make: (W, H, s) => new FantasyChapter('tidewheel', W, H, s, selectedDifficulty), name: 'Tidewheel Citadel', sub: 'Break Nerra\u2019s grip. Stop the flood.', color: '#7fc7cf', next: 8, victory: 'LUMI IS SAFE!' },
  { make: (W, H, s) => new FantasyChapter('gatehouse', W, H, s, selectedDifficulty), name: 'Gatehouse Siege', sub: 'Kit breaks in. Korr holds the gate.', color: '#c98a5b', next: 9, victory: 'THE GATE IS OURS!' },
  { make: (W, H, s) => new FantasyChapter('lumitower', W, H, s, selectedDifficulty), name: 'Lumi Breaks Out', sub: 'Lumi breaks out. Gnash coils the tower.', color: '#e58fb4', next: 10, victory: 'LUMI BROKE OUT!' },
  { make: (W, H, s) => new FantasyChapter('rivals', W, H, s, selectedDifficulty), name: 'Serpent Rivals', sub: 'Bait the twin serpents. Break the Seal.', color: '#8fc9d6', next: 11, victory: 'THE SEAL IS BROKEN!' },
  { make: (W, H, s) => new FantasyChapter('hoard', W, H, s, selectedDifficulty), name: 'Dragon’s Hoard', sub: 'Rob the sleeping dragon. Mind his eye.', color: '#e0a54a', victory: 'KIT ESCAPED!' },
];
const W = 360;
let H = 740, scale = 1, FH = 740, inT = 0, inB = 0; // FH: full canvas height; H: playable height inside the safe area
// Levels are laid out with room for a HUD at the top; LIFT slides the whole level up under a slim HUD bar so the
// play reaches right up to the status bar (the level is built LIFT taller so its bottom still meets the screen's)
const LIFT = 34;
let offX = 0, offY = 0; // world units of screen beyond the 360 x FH frame: phones fill edge to edge, margins mirror the frame's edges
const cv = document.getElementById('game'), g = cv.getContext('2d');

let selectedDifficulty = difficulty(new URLSearchParams(location.search).get('difficulty') || store.get('difficulty')).id;
const legacyBest = store.get('best'), savedBest = store.get('bestByDifficulty'), bestByDifficulty = {};
const validStars = n => Number.isInteger(n) && n >= 0 && n <= 3 ? n : 0;
for (const id of DIFFICULTY_IDS) bestByDifficulty[id] = LEVELS.map((_, i) => {
  const saved = savedBest?.[id], legacy = id === 'easy' && i === 0 || id === 'hard' && i === 1;
  return Math.max(validStars(Array.isArray(saved) ? saved[i] : 0), validStars(legacy && Array.isArray(legacyBest) ? legacyBest[i] : 0));
});
function selectDifficulty(id) { selectedDifficulty = difficulty(id).id; store.set('difficulty', selectedDifficulty); previews = []; }

let scene = 'menu', level = null, levelIdx = 0, resultT = 0, buttons = [], menuT = 0, previews = [], assetsReady = false;
const freshCont = () => ({ used: 0, declined: false, ad: null, toast: null, near: null, losses: null, backAt: -Infinity });
let cont = freshCont(); // continue offers for the current attempt

// Notch / Dynamic Island / home indicator / Android cutouts, in CSS px. ?safe=top,bottom fakes them for testing.
function safeInsets() {
  const q = new URLSearchParams(location.search).get('safe');
  if (q) { const [t, b] = q.split(',').map(Number); return [t || 0, b || 0]; }
  const probe = document.getElementById('safe'), cs = probe && getComputedStyle(probe);
  return cs ? [parseFloat(cs.paddingTop) || 0, parseFloat(cs.paddingBottom) || 0] : [0, 0];
}
function resize() {
  const iw = document.body.clientWidth || innerWidth, ih = document.body.clientHeight || innerHeight, [st, sb] = safeInsets();
  const portrait = iw < ih;
  FH = portrait ? Math.round(Math.max(600, Math.min(880, (W * ih) / iw))) : 740;
  scale = Math.min(iw / W, ih / FH);
  const cw = portrait ? iw : W * scale, ch = portrait ? ih : FH * scale;   // portrait: the canvas covers the whole screen
  offX = (cw / scale - W) / 2; offY = (ch / scale - FH) / 2;
  inT = iw < ih ? st / scale : 0; inB = iw < ih ? sb / scale : 0;
  H = Math.round(FH - inT - inB);
  const dpr = Math.min(3, devicePixelRatio || 1);
  cv.style.width = `${cw}px`; cv.style.height = `${ch}px`;
  cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
  setDPR(scale * dpr);
  g.setTransform(scale * dpr, 0, 0, scale * dpr, offX * scale * dpr, offY * scale * dpr);
  previews = [];
  if (level && (level.W !== W || level.H !== H + LIFT || level.kitUIScale !== scale)) start(levelIdx);
}

function start(i) {
  levelIdx = i; level = LEVELS[i].make(W, H + LIFT, scale); level.hudY = LIFT; level.inB = inB; scene = 'level'; resultT = 0;
  paddlePointer = null; kitPress = null; powerPress = null;
  cont = freshCont();
  acc = 0; last = performance.now();
}

// ---------- input ----------
const toWorld = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / scale - offX, (e.clientY - r.top) / scale - offY - inT]; };
let paddlePointer = null, paddleEpoch = 0, kitPress = null, powerPress = null, suspended = false;
function clearInput() {
  paddlePointer = null; kitPress = null; powerPress = null;
  if (level) { level.closePowerMenu?.(); level.pointerCancel(); level.keys = {}; }
}
function pause() { clearInput(); if (scene === 'level' && level.state === 'play') scene = 'pause'; }
function resume() { scene = 'level'; acc = 0; last = performance.now(); }
cv.addEventListener('pointerdown', e => {
  unlockAudio(); cv.setPointerCapture(e.pointerId);
  const [x, y] = toWorld(e);
  const b = buttons.find(b => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h);
  if (b) { sfx.paddle(); b.fn(); return; }
  if (scene === 'level' && level.state === 'play') {
    if (level.powerMenuOpen) {
      if (!powerPress) powerPress = { id: e.pointerId, level, epoch: level.inputEpoch, kind: spacePowerAt(level, x, y + LIFT), clientX: e.clientX, clientY: e.clientY, cancelled: false };
      return;
    }
    if (paddleEpoch !== level.inputEpoch) paddlePointer = null;
    if ((level.coreMode === 'manual' || level.coreMode === 'ward' && level.phase !== 'intro') && kitOrbContains(level.kitAnchor(), x, y + LIFT)) {
      if (!kitPress || kitPress.epoch !== level.inputEpoch) kitPress = { id: e.pointerId, level, epoch: level.inputEpoch, x, y: y + LIFT, clientX: e.clientX, clientY: e.clientY, cancelled: false };
      return;
    }
    if (paddlePointer === null) { paddlePointer = e.pointerId; paddleEpoch = level.inputEpoch; level.pointerDown(x, y + LIFT); }
  }
});
cv.addEventListener('pointermove', e => {
  if (powerPress?.id === e.pointerId) { if (Math.hypot(e.clientX - powerPress.clientX, e.clientY - powerPress.clientY) > 8) powerPress.cancelled = true; return; }
  if (kitPress?.id === e.pointerId) { if (Math.hypot(e.clientX - kitPress.clientX, e.clientY - kitPress.clientY) > 8) kitPress.cancelled = true; return; }
  if (scene === 'level' && paddlePointer === e.pointerId && paddleEpoch === level.inputEpoch && level.ptr.down) { const [x, y] = toWorld(e); level.pointerMove(x, y + LIFT); }
});
const up = e => {
  if (powerPress?.id === e.pointerId) {
    const [x, y] = toWorld(e), press = powerPress; powerPress = null;
    if (e.type !== 'pointercancel' && !press.cancelled && Math.hypot(e.clientX - press.clientX, e.clientY - press.clientY) <= 8
      && scene === 'level' && level === press.level && level.powerMenuOpen && press.epoch === level.inputEpoch && spacePowerAt(level, x, y + LIFT) === press.kind) {
      if (press.kind === 'close') level.closePowerMenu(); else level.chooseSpacePower(press.kind);
    }
    return;
  }
  if (kitPress?.id === e.pointerId) {
    const [x, y] = toWorld(e), press = kitPress; kitPress = null;
    if (e.type !== 'pointercancel' && scene === 'level' && level === press.level && press.epoch === level.inputEpoch && kitTap(press, x, y + LIFT, e.clientX, e.clientY, level.kitAnchor())) {
      if (level.coreMode === 'manual') level.activateCorePower(); else level.activateKitPower();
    }
    return;
  }
  if (paddlePointer === e.pointerId) { paddlePointer = null; if (scene === 'level' && paddleEpoch === level.inputEpoch && level.ptr.down) e.type === 'pointercancel' ? level.pointerCancel() : level.pointerUp(); }
};
cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
addEventListener('blur', () => { suspended = true; pause(); });
addEventListener('focus', () => { suspended = false; acc = 0; last = performance.now(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); acc = 0; last = performance.now(); });
addEventListener('keydown', e => {
  unlockAudio();
  if (e.key === 'Escape') { if (level?.powerMenuOpen) { clearInput(); return; } scene === 'pause' ? resume() : pause(); return; }
  if (suspended || document.hidden || scene === 'pause') return;
  if (scene === 'level' && !e.repeat) level.key(e.key, true);
  if (e.key === ' ' || e.key.startsWith('Arrow') || e.key.toLowerCase() === 'k') e.preventDefault();
  if (scene === 'menu' && /^[0-9=-]$/.test(e.key)) { const i = e.key === '0' ? 9 : e.key === '-' ? 10 : e.key === '=' ? 11 : +e.key - 1; if (i < LEVELS.length) start(i); }
});
addEventListener('keyup', e => {
  if (e.key === ' ' && level?.suppressedSpace) { level.key(e.key, false); return; }
  if (scene === 'level' && !suspended && !document.hidden && level.keys[e.key]) level.key(e.key, false);
});
addEventListener('resize', resize);

// ---------- loop ----------
const STEP = 1 / 120;
let acc = 0, last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  acc += dt;
  while (acc >= STEP) { tick(STEP); acc -= STEP; }
  draw();
  requestAnimationFrame(frame);
}
function tick(dt) {
  if (suspended || document.hidden || scene === 'pause') return;
  menuT += dt;
  if (scene !== 'level') return;
  if (cont.ad) { cont.ad.t += dt; if (cont.ad.earned && cont.ad.t >= AD_SECONDS) doContinue(); }
  level.update(dt);
  if (level.state !== 'play') {
    // the tick a run is lost: count it (the unlock rule) and freeze the "so close" copy for the panel
    if (resultT === 0 && level.state === 'lost') { cont.losses = noteLoss(); cont.near = soClose(level); }
    resultT += dt;
    if (resultT > 1.1 && !level.resultSaved && !offering()) {
      level.resultSaved = true;
      const r = level.result();
      const best = bestByDifficulty[selectedDifficulty];
      if (r.stars > best[levelIdx]) { best[levelIdx] = r.stars; store.set('bestByDifficulty', bestByDifficulty); }
    }
  }
}

// ---------- drawing ----------
function button(label, x, y, w, h, color, fn, small) {
  buttons.push({ x, y, w, h, fn, label });
  g.fillStyle = 'rgba(0,0,0,0.4)'; rrect(g, x + 2, y + 5, w, h, h / 2); g.fill();
  g.fillStyle = shade(color, -0.5); rrect(g, x, y + 3, w, h, h / 2); g.fill();
  const gr = g.createLinearGradient(0, y, 0, y + h);
  gr.addColorStop(0, shade(color, 0.35)); gr.addColorStop(0.55, color); gr.addColorStop(1, shade(color, -0.2));
  g.fillStyle = gr; rrect(g, x, y, w, h, h / 2); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.45)'; rrect(g, x + h * 0.4, y + 3, w - h * 0.8, h * 0.22, h * 0.11); g.fill();
  text(g, label, x + w / 2, y + h / 2 + 1, small ? 15 : 19, '#fff', 'center');
}

function star(x, y, r, on) {
  g.save(); g.translate(x, y);
  const path = () => { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.48 : r; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.closePath(); };
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.translate(2, 3); path(); g.fill(); g.translate(-2, -3);
  if (on) { const gr = g.createLinearGradient(0, -r, 0, r); gr.addColorStop(0, '#fff3b0'); gr.addColorStop(0.5, '#ffc93c'); gr.addColorStop(1, '#d2861a'); g.fillStyle = gr; }
  else g.fillStyle = '#2a2e48';
  path(); g.fill();
  g.strokeStyle = on ? '#8a5210' : '#14172a'; g.lineWidth = 1.2; g.stroke();
  if (on) { g.fillStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.ellipse(-r * 0.25, -r * 0.35, r * 0.25, r * 0.12, -0.5, 0, 7); g.fill(); }
  g.restore();
}

function preview(i, w, h) { // the level's opening playfield, cropped to fill the card
  if (!previews[i]) {
    const lv = LEVELS[i].make(W, H, scale), r = lv.previewRect(); lv.skipIntro?.();
    const k = Math.max(w / r.w, h / r.h);
    previews[i] = cached(`preview${i}|${w}|${h}|${H}|${selectedDifficulty}`, w, h, pg => {
      pg.save(); pg.translate(w / 2, 0); pg.scale(k, k); pg.translate(-(r.x + r.w / 2), -r.y);
      lv.draw(pg); pg.restore();
    });
  }
  return previews[i];
}

function menuBg() {
  return cached('menu-bg' + H, W, H, mg => {
    const bg = mg.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#22284a'); bg.addColorStop(0.55, '#141831'); bg.addColorStop(1, '#0a0c18');
    mg.fillStyle = bg; mg.fillRect(0, 0, W, H);
    vignette(mg, W, H, 0.6); drawGrain(mg, W, H);
  });
}

function drawMenu() {
  g.drawImage(menuBg(), 0, 0, W, H);
  // floating glossy bricks behind the logo
  const C = ['#ff5d8f', '#ffd23f', '#3fa8f5', '#5ccf6a', '#c46bf0', '#ff8a3d'];
  for (let i = 0; i < 9; i++) {
    const x = 30 + ((i * 67) % 300), y = 56 + ((i * 41) % 90) + Math.sin(menuT * 1.3 + i) * 4;
    g.save(); g.translate(x, y); g.rotate(Math.sin(i * 3.1) * 0.35 + Math.sin(menuT + i) * 0.04);
    g.globalAlpha = 0.9; g.drawImage(brick(C[i % C.length], 26, 14, { depth: 4 }), -13, -7, 26, 18); g.restore();
  }
  g.globalAlpha = 1;
  // logo
  const listTop = Math.min(248, Math.max(164, H - LEVELS.length * 76 - 66));
  const ly = listTop - 120 + Math.sin(menuT * 2) * 2;
  g.font = `64px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillText('BREACH', W / 2 + 3, ly + 7);
  g.strokeStyle = '#1a1030'; g.lineWidth = 10; g.strokeText('BREACH', W / 2, ly);
  const lg = g.createLinearGradient(0, ly - 30, 0, ly + 30);
  lg.addColorStop(0, '#fff6c8'); lg.addColorStop(0.45, '#ffc93c'); lg.addColorStop(0.55, '#ff8a3d'); lg.addColorStop(1, '#d9481f');
  g.fillStyle = lg; g.fillText('BREACH', W / 2, ly);
  g.save(); g.beginPath(); g.rect(0, ly - 30, W, 16); g.clip(); g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillText('BREACH', W / 2, ly); g.restore();
  text(g, 'Break in. Break out.', W / 2, ly + 44, 15, '#cfd6f5', 'center');

  // level cards
  DIFFICULTY_IDS.forEach((id, i) => button(difficulty(id).label, 20 + i * 110, listTop - 54, 100, 42, id === selectedDifficulty ? '#9b6295' : '#414b65', () => selectDifficulty(id), true));
  const cw = W - 40, ch = Math.min(104, (H - listTop - 66) / LEVELS.length - 8);
  [0, 2, 3, 1, 4, 5, 6, 7, 8, 9, 10, 11].filter(i => i < LEVELS.length).forEach((i, row) => {
    const L = LEVELS[i], x = 20, y = listTop + row * (ch + 8);
    buttons.push({ x, y, w: cw, h: ch, fn: () => start(i) });
    g.fillStyle = 'rgba(0,0,0,0.45)'; rrect(g, x + 3, y + 6, cw, ch, 18); g.fill();
    g.fillStyle = '#0f1226'; rrect(g, x, y, cw, ch, 18); g.fill();
    g.save(); rrect(g, x, y, cw, ch, 18); g.clip();
    const pw = cw, ph = ch;
    g.globalAlpha = 0.9; g.drawImage(preview(i, pw, ph), x, y, pw, ph); g.globalAlpha = 1;
    const sh = g.createLinearGradient(0, y + ch * 0.35, 0, y + ch);
    sh.addColorStop(0, 'rgba(10,12,28,0)'); sh.addColorStop(1, 'rgba(10,12,28,0.95)');
    g.fillStyle = sh; g.fillRect(x, y, cw, ch);
    g.restore();
    g.strokeStyle = shade(L.color, -0.1); g.lineWidth = 2.5; rrect(g, x, y, cw, ch, 18); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.15)'; g.lineWidth = 1; rrect(g, x + 3, y + 3, cw - 6, ch - 6, 15); g.stroke();
    // level number badge
    g.fillStyle = L.color; g.beginPath(); g.arc(x + 26, y + ch - 33, 13, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.4)'; g.beginPath(); g.ellipse(x + 22, y + ch - 39, 6, 3, -0.4, 0, 7); g.fill();
    text(g, i === 1 ? 'V' : i === 4 ? 'F' : `${row + 1}`, x + 26, y + ch - 32, 15, '#fff', 'center');
    text(g, L.name, x + 50, y + ch - 34, 17, '#fff');
    text(g, L.sub, x + 16, y + ch - 13, 10, '#c9cfee');
    for (let s = 0; s < 3; s++) star(x + cw - 66 + s * 22, y + 15, 7, s < bestByDifficulty[selectedDifficulty][i]);

  });
  if (canFull()) {
    button(isMuted() ? 'Sound: off' : 'Sound: on', W / 2 - 128, H - 38, 120, 30, '#4b5370', () => setMuted(!isMuted()), true);
    button('Full screen', W / 2 + 8, H - 38, 120, 30, '#3f6fd1', goFull, true);
  } else button(isMuted() ? 'Sound: off' : 'Sound: on', W / 2 - 60, H - 38, 120, 30, '#4b5370', () => setMuted(!isMuted()), true);
}

// ---------- continue offer (after a loss, before the results) ----------
// "So close" near-miss card, a glossy fuse bar for urgency and a soft timeout: at 0 s the fuse is spent but every
// button stays live, so a distracted player is never kicked to the results.
const CONT_AT = 0.9;
const offering = () => level.state === 'lost' && !cont.declined && !!continueOffer(cont.used);
function doContinue() { cont.used++; cont.ad = null; cont.near = null; level.continueRun(); resultT = 0; cont.backAt = menuT; }
const mix = (a, b, t) => '#' + [1, 3, 5].map(i => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t).toString(16).padStart(2, '0')).join('');
function fitText(str, x, y, size, maxW, color, font) { g.font = `${size}px ${font || FONT}`; const w = g.measureText(str).width; text(g, str, x, y, w > maxW ? Math.floor(size * maxW / w) : size, color, 'center', font); }
function drawContinue() {
  const k = Math.min(1, (resultT - CONT_AT) / 0.25); if (k <= 0) return;
  g.fillStyle = `rgba(6,8,20,${0.72 * k})`; g.fillRect(0, 0, W, H);
  if (cont.ad) return drawAdPlaceholder();
  const f = fuse(resultT - CONT_AT), left = f.left; // soft timeout: never declines on its own
  const near = cont.near || (cont.near = soClose(level)), offer = continueOffer(cont.used);
  const unlock = offer === 'ad' && showUnlock(cont.losses ?? lifetimeLosses());
  const pw = W - 48, x = 24, ph = 300 + (offer === 'ad' ? 24 : 0) + (unlock ? 54 : 0), y = Math.max(8, H / 2 - ph / 2) + (1 - k) * 40;
  g.globalAlpha = k;
  g.fillStyle = 'rgba(0,0,0,0.5)'; rrect(g, x + 4, y + 8, pw, ph, 22); g.fill();
  const pg = g.createLinearGradient(0, y, 0, y + ph); pg.addColorStop(0, '#2c3360'); pg.addColorStop(1, '#171b36');
  g.fillStyle = pg; rrect(g, x, y, pw, ph, 22); g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 1.5; rrect(g, x + 1, y + 1, pw - 2, ph - 2, 21); g.stroke();
  const pop = Math.min(1, Math.max(0, (resultT - CONT_AT) / 0.28)), s = 0.85 + 0.15 * (1 + 2.70158 * (pop - 1) ** 3 + 1.70158 * (pop - 1) ** 2); // easeOutBack
  g.save(); g.translate(W / 2, y + 34); g.scale(s, s); text(g, near.title, 0, 0, 30, near.title === 'SO CLOSE!' ? '#ff8a96' : '#ffdbb8', 'center'); g.restore();
  text(g, level.reason || '', W / 2, y + 62, 13, '#c9cfee', 'center');
  // near-miss card: what is left, in words, over a glossy progress bar
  const cx = x + 16, cw = pw - 32, cy = y + 78;
  const cg = g.createLinearGradient(0, cy, 0, cy + 80); cg.addColorStop(0, '#262d55'); cg.addColorStop(1, '#1a1f3e');
  g.fillStyle = cg; rrect(g, cx, cy, cw, 80, 14); g.fill();
  if (near.line) {
    fitText(near.line, W / 2, cy + 22, 19, cw - 20, '#ffdbb8');
    const fill = Math.min(1, near.progress * Math.min(1, Math.max(0, (resultT - CONT_AT - 0.18) / 0.35)));
    glazedBar(g, cx + 18, cy + 42, cw - 36, 12, fill, '#7ff5e6', '#1f9e90');
    text(g, near.detail, W / 2, cy + 66, 12, '#9fb3e8', 'center', NUM);
  } else text(g, 'One more try?', W / 2, cy + 40, 17, '#ffdbb8', 'center');
  // fuse: drains over FUSE_SECS, warm amber (unlike the teal progress bar) to coral in the last 2 s; spent, it waits calmly
  const fy = y + 180, ft = f.frac, hot = f.heat, fc = mix('#e8902a', '#ff4d5e', hot);
  text(g, left > 0 ? 'QUICK CONTINUE' : 'TAKE YOUR TIME', x + 26, fy - 12, 12, left > 0 ? '#ffd29a' : '#8c95bd', 'left', NUM);
  if (left > 0) text(g, `${left.toFixed(1)}s`, x + pw - 26, fy - 12, 12, mix('#ffd29a', '#ff8a96', hot), 'right', NUM);
  glazedBar(g, x + 24, fy, pw - 48, 11, ft, mix('#ffd08a', '#ffa0a8', hot), fc);
  g.globalAlpha = 1;
  let by = y + 210;
  if (offer === 'ad') {
    button('▶  Watch ad · Continue', x + 24, by, pw - 48, 48, '#5ccf6a', () => { cont.ad = { t: 0 }; watchAd().then(ok => { if (ok && cont.ad) cont.ad.earned = true; else cont.ad = null; }); });
    const n = AD_CONTINUES - cont.used; // continues left this attempt, as fx-kit gems
    for (let i = 0; i < AD_CONTINUES; i++) drawGem(g, i < n ? 'pip_rose' : 'pip_empty', W / 2 - 74 + i * 16, by + 64, 1.5);
    text(g, `${n} of ${AD_CONTINUES} continues left`, W / 2 - 46, by + 64, 12, '#c9cfee', 'left', NUM);
    by += 84;
    if (unlock) { button(`Unlock full game · ${PRICE}`, x + 24, by, pw - 48, 40, '#9b4fd1', () => buyFullGame().then(ok => { if (ok) { cont.toast = { text: 'Full game unlocked · no more ads', t: menuT }; doContinue(); } }), true); by += 54; }
  } else {
    button('Continue', x + 24, by, pw - 48, 48, '#5ccf6a', doContinue);
    by += 62;
  }
  buttons.push({ x: W / 2 - 60, y: by - 6, w: 120, h: 32, fn: () => { cont.declined = true; resultT = 1.1; } });
  text(g, 'No thanks', W / 2, by + 10, 15, 'rgba(220,226,255,0.7)', 'center');
}
// Back in action: until the serve, the ball waits on the paddle and the chapter's clocks hold (see Arena.continueRun).
function drawBackIn() {
  const py = (level.m ? level.hudTop + level.m.paddle.y * level.k : level.paddle.y) - LIFT; // the paddle, in screen units
  const a = Math.min(1, (menuT - cont.backAt) / 0.22), s = 0.8 + 0.2 * (1 + 2.70158 * (a - 1) ** 3 + 1.70158 * (a - 1) ** 2), y = Math.max(H * 0.45, py - 130);
  g.save(); g.globalAlpha = Math.min(1, a * 1.5); g.translate(W / 2, y); g.scale(s, s);
  g.fillStyle = 'rgba(0,0,0,0.4)'; rrect(g, -120, -24, 240, 56, 18); g.fill();
  const pg = g.createLinearGradient(0, -28, 0, 28); pg.addColorStop(0, 'rgba(32,58,74,0.94)'); pg.addColorStop(1, 'rgba(14,24,40,0.94)');
  g.fillStyle = pg; rrect(g, -120, -28, 240, 56, 18); g.fill();
  g.fillStyle = 'rgba(127,245,230,0.16)'; rrect(g, -112, -25, 224, 12, 6); g.fill();
  text(g, 'BACK IN ACTION!', 0, -7, 22, '#9ff7ec', 'center');
  text(g, 'Slide to aim · lift to serve', 0, 15, 12, `rgba(220,236,255,${0.65 + 0.25 * Math.sin(menuT * 4)})`, 'center', NUM);
  g.restore();
}
function drawAdPlaceholder() { // stands in for a rewarded ad until a real SDK is wired up in monetize.js
  const left = Math.max(0, AD_SECONDS - cont.ad.t);
  g.fillStyle = '#0b0d1c'; g.fillRect(0, 0, W, H);
  const pg = g.createLinearGradient(0, H / 2 - 120, 0, H / 2 + 120); pg.addColorStop(0, '#1d2244'); pg.addColorStop(1, '#141831');
  g.fillStyle = pg; rrect(g, 40, H / 2 - 120, W - 80, 240, 18); g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.14)'; g.lineWidth = 1.5; rrect(g, 41, H / 2 - 119, W - 82, 238, 17); g.stroke();
  text(g, 'AD PLACEHOLDER', W / 2, H / 2 - 64, 24, '#c9cfee', 'center');
  text(g, 'A rewarded video plays here', W / 2, H / 2 - 34, 13, 'rgba(220,226,255,0.6)', 'center', NUM);
  for (let i = 0; i < AD_SECONDS; i++) drawGem(g, cont.ad.t >= i + 1 ? 'pip_blue' : 'pip_empty', W / 2 + (i - (AD_SECONDS - 1) / 2) * 34, H / 2 + 8, 2.2); // one gem lights per second
  text(g, `Reward in ${Math.ceil(left)}`, W / 2, H / 2 + 62, 20, '#7bf2c8', 'center');
}
function drawToast() {
  if (!cont.toast) return;
  const a = menuT - cont.toast.t; if (a > 2.5) { cont.toast = null; return; }
  g.globalAlpha = Math.min(1, (2.5 - a) * 2);
  g.fillStyle = 'rgba(20,24,48,0.92)'; rrect(g, 40, 70, W - 80, 34, 17); g.fill();
  text(g, cont.toast.text, W / 2, 87, 14, '#7bf2c8', 'center'); g.globalAlpha = 1;
}

function drawResults() {
  if (offering()) { drawContinue(); return; }
  const k = Math.min(1, (resultT - 1.1) / 0.3); if (k <= 0) return;
  const r = level.result(), won = level.state === 'won';
  g.fillStyle = `rgba(6,8,20,${0.7 * k})`; g.fillRect(0, 0, W, H);
  const pw = W - 56, ph = 300, x = 28, y = H / 2 - ph / 2 + (1 - k) * 40;
  g.globalAlpha = k;
  g.fillStyle = 'rgba(0,0,0,0.5)'; rrect(g, x + 4, y + 8, pw, ph, 22); g.fill();
  const pg = g.createLinearGradient(0, y, 0, y + ph); pg.addColorStop(0, '#2c3360'); pg.addColorStop(1, '#171b36');
  g.fillStyle = pg; rrect(g, x, y, pw, ph, 22); g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 1.5; rrect(g, x + 1, y + 1, pw - 2, ph - 2, 21); g.stroke();
  const title = won ? (LEVELS[levelIdx].victory || 'CREW SAVED!') : 'SO CLOSE!';
  text(g, title, W / 2, y + 36, 30, won ? '#ffd36b' : '#ff7a8a', 'center');
  if (!won) text(g, level.reason || '', W / 2, y + 66, 13, '#c9cfee', 'center');
  for (let s = 0; s < 3; s++) {
    const pop = Math.min(1, Math.max(0, (resultT - 1.4 - s * 0.25) / 0.2));
    if (s < r.stars && pop > 0 && pop < 1 && !level['starSfx' + s]) { level['starSfx' + s] = 1; sfx.hit(4 + s * 2); }
    star(W / 2 - 50 + s * 50, y + (won ? 86 : 100), s === 1 ? 20 : 16, s < r.stars && pop >= 1);
  }
  r.lines.forEach(([a, b], i) => {
    const ly = y + 140 + i * 28;
    text(g, a, x + 30, ly, 15, '#c9cfee');
    text(g, String(b), x + pw - 30, ly, 17, '#fff', 'right');
  });
  g.globalAlpha = 1;
  const by = y + ph - 58;
  if (won && LEVELS[levelIdx].next !== undefined) {
    button('Retry', x + 20, by, 110, 40, '#4b5370', () => start(levelIdx));
    button('Next', x + pw - 130, by, 110, 40, '#5ccf6a', () => start(LEVELS[levelIdx].next));
  } else if (won) {
    button('Retry', x + 20, by, 110, 40, '#4b5370', () => start(levelIdx));
    button('Menu', x + pw - 130, by, 110, 40, '#3fa8f5', () => { scene = 'menu'; });
  } else {
    button('Menu', x + 20, by, 110, 40, '#4b5370', () => { scene = 'menu'; });
    button('Try again', x + pw - 140, by, 120, 40, '#ff5d8f', () => start(levelIdx));
  }
}

function draw() {
  buttons = [];
  g.save(); g.clearRect(-offX - 1, -offY - 1, W + offX * 2 + 2, FH + offY * 2 + 2);
  // extend the scene's top and bottom pixel rows under the notch and home indicator
  const bg = scene === 'menu' ? menuBg() : level.background(), k = bg.height / (scene === 'menu' ? H : H + LIFT);
  const top = scene === 'menu' ? inT : inT - LIFT, chapter = scene !== 'menu' && level.hudTop !== undefined;   // screen space above the level's y = 0
  if (scene !== 'menu' && level.drawFullBleedBackground) level.drawFullBleedBackground(g, top, FH);
  else {
    if (top > 0 && scene !== 'menu' && level.drawTopInset) { g.save(); g.translate(0, top); level.drawTopInset(g, top + 1); g.restore(); }
    else if (top > 0) g.drawImage(bg, 0, 0, bg.width, k, 0, 0, W, top + 1);
    if (inB && !chapter) bottomBleed(bg, k, FH - inB - 1, inB + 1);
  }
  g.translate(0, inT);
  if (scene === 'menu') drawMenu();
  else {
    g.save(); g.translate(0, -LIFT); level.draw(g);
    if (scene === 'level' && level.state === 'play' && !level.powerMenuOpen) level.drawCoach?.(g); // first-time coaching (src/coach.js)
    g.restore();
    if (scene === 'level' && level.powerMenuOpen) { g.save(); g.translate(0, -LIFT); drawSpacePowerMenu(g, level); g.restore(); }
    if (scene === 'pause') drawPause();
    else if (level.state === 'play') { pauseButton(); if (level.backHold) drawBackIn(); }
    else drawResults();
    drawToast();
  }
  g.restore();
  if (inB && chapter && !level.drawFullBleedBackground) bottomBleed(bg, k, FH - inB - 1, inB + 1);   // after the encounter, which paints its own mirrored plate under a tall phone's playfield
  fillMargins();
}
// Under the home indicator: reflect the plate's last rows about the seam (shade and vignette already baked into the plate), so the
// texture runs straight through with no streaks, fade or tone step (the plate's last two pixel rows are edge-blended, so skipped). bg draws the same scene the level paints above the seam.
function bottomBleed(bg, k, y, h) {
  const src = Math.max(1, Math.round(h * k));
  g.save(); g.translate(0, y * 2); g.scale(1, -1); g.drawImage(bg, 0, bg.height - 2 - src, bg.width, src, 0, y - h, W, h); g.restore();
}
// Screens wider or taller than the frame: stretch the frame's outermost pixels into the margins so the scene runs to every edge
function fillMargins() {
  const k = scale * Math.min(3, devicePixelRatio || 1), x0 = Math.round(offX * k), y0 = Math.round(offY * k), w = Math.round(W * k), h = Math.round(FH * k);
  if (x0 < 1 && y0 < 1) return;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  if (x0 >= 1) { g.drawImage(cv, x0 + 1, 0, 1, cv.height, 0, 0, x0 + 1, cv.height); g.drawImage(cv, x0 + w - 2, 0, 1, cv.height, x0 + w - 1, 0, cv.width - x0 - w + 1, cv.height); }
  if (y0 >= 1) { g.drawImage(cv, 0, y0 + 1, cv.width, 1, 0, 0, cv.width, y0 + 1); g.drawImage(cv, 0, y0 + h - 2, cv.width, 1, 0, y0 + h - 1, cv.width, cv.height - y0 - h + 1); }
  g.restore();
}
// Full screen where the browser allows it (Android Chrome, desktop); iOS gets it from Add to Home Screen
const canFull = () => !!(document.fullscreenEnabled && !document.fullscreenElement);
function goFull() { document.documentElement.requestFullscreen?.({ navigationUI: 'hide' }).then(() => screen.orientation?.lock?.('portrait').catch(() => {})).catch(() => {}); }
function pauseButton() { // Icon only; the invisible target remains44 CSS pixels.
  buttons.push({ x: 4 / scale, y: 0, w: 44 / scale, h: 44 / scale, fn: pause });
  g.fillStyle = '#a8bfcc';
  for (const x of [22, 28]) { rrect(g, x / scale, 11 / scale, 2.5 / scale, 14 / scale, 1 / scale); g.fill(); }
}
function drawPause() {
  g.fillStyle = 'rgba(6,8,20,.78)'; g.fillRect(0, 0, W, H);
  text(g, 'PAUSED', W / 2, H / 2 - 104, 30, '#edb0d6', 'center');
  button('Resume', 70, H / 2 - 62, 220, 48, '#9b6295', resume);
  button('Retry', 70, H / 2, 220, 48, '#4b5370', () => start(levelIdx));
  button('Menu', 100, H / 2 + 62, 160, 44, '#4b5370', () => { clearInput(); scene = 'menu'; });
}

// test hook for automated playtests
window.__breach = { start, get ready() { return assetsReady; }, get level() { return level; }, get difficulty() { return selectedDifficulty; }, get scene() { return scene; }, set scene(s) { scene = s; }, get buttons() { return buttons; } };

resize();
(document.fonts ? Promise.race([Promise.all([document.fonts.load('16px "Lilita One"'), document.fonts.load('600 12px Rubik')]).catch(() => {}), new Promise(r => setTimeout(r, 2500))]) : Promise.resolve()).then(async () => {
  previews = []; setDPR(scale * Math.min(3, devicePixelRatio || 1));
  // Decode lazy chapter art before caching the first menu previews.
  for (const chapter of LEVELS) chapter.make(W, H, scale);
  await artLoaded();
  assetsReady = true;
  const q = new URLSearchParams(location.search).get('level');
  if (q && Number.isInteger(+q) && +q >= 1 && +q <= LEVELS.length) start(+q - 1);
  requestAnimationFrame(t => { last = t; frame(t); });
});
