// Entry: canvas sizing, fixed-step loop, input mapping and the three scenes (menu, level, results).
import { setDPR, text, rrect, shade, vignette, drawGrain, cached, brick, FONT, artLoaded, SPR, ready } from './gfx.js';
import { unlockAudio, setMuted, isMuted, sfx } from './audio.js';
import { Carrier } from './carrier.js';
import { Vault, drawPrincessIcon } from './vault.js';
import { drawInvader } from './characters.js';
import { store } from './prefs.js';
import { MODE, PRICE, AD_SECONDS, continueOffer, isUnlocked, watchAd, buyFullGame } from './monetize.js';
import { kitOrbContains, kitTap } from './kit.js';

const LEVELS = [
  { make: (W, H, s) => new Carrier(W, H, s), name: 'Carrier Breakout', sub: 'Disable the carrier. Free all five crew.', color: '#e58fcb' },
  { make: (W, H, s) => new Vault(W, H, s), name: 'The Vault', sub: 'Free the princess before the serpent gets there', color: '#f4c542' },
];
const W = 360;
let H = 740, scale = 1, FH = 740, inT = 0, inB = 0; // FH: full canvas height; H: playable height inside the safe area
// Levels are laid out with room for a HUD at the top; LIFT slides the whole level up under a slim HUD bar so the
// play reaches right up to the status bar (the level is built LIFT taller so its bottom still meets the screen's)
const LIFT = 34;
let offX = 0, offY = 0; // world units of screen beyond the 360 x FH frame: phones fill edge to edge, margins mirror the frame's edges
const cv = document.getElementById('game'), g = cv.getContext('2d');

let best = store.get('best') || [0, 0];

let scene = 'menu', level = null, levelIdx = 0, resultT = 0, buttons = [], menuT = 0, previews = [];
let cont = { used: 0, declined: false, ad: null, toast: null }; // continue offers for the current attempt

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
  paddlePointer = null; kitPress = null;
  cont = { used: 0, declined: false, ad: null, toast: null };
}

// ---------- input ----------
const toWorld = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / scale - offX, (e.clientY - r.top) / scale - offY - inT]; };
let paddlePointer = null, kitPress = null;
cv.addEventListener('pointerdown', e => {
  unlockAudio(); cv.setPointerCapture(e.pointerId);
  const [x, y] = toWorld(e);
  const b = buttons.find(b => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h);
  if (b) { sfx.paddle(); b.fn(); return; }
  if (scene === 'level' && level.state === 'play') {
    if (level.coreMode === 'ward' && level.phase !== 'intro' && kitOrbContains(level.kitAnchor(), x, y + LIFT)) {
      if (!kitPress) kitPress = { id: e.pointerId, level, x, y: y + LIFT, clientX: e.clientX, clientY: e.clientY, cancelled: false };
      return;
    }
    if (paddlePointer === null) { paddlePointer = e.pointerId; level.pointerDown(x, y + LIFT); }
  }
});
cv.addEventListener('pointermove', e => {
  if (kitPress?.id === e.pointerId) { if (Math.hypot(e.clientX - kitPress.clientX, e.clientY - kitPress.clientY) > 8) kitPress.cancelled = true; return; }
  if (scene === 'level' && paddlePointer === e.pointerId) { const [x, y] = toWorld(e); level.pointerMove(x, y + LIFT); }
});
const up = e => {
  if (kitPress?.id === e.pointerId) {
    const [x, y] = toWorld(e), press = kitPress; kitPress = null;
    if (e.type !== 'pointercancel' && scene === 'level' && level === press.level && kitTap(press, x, y + LIFT, e.clientX, e.clientY, level.kitAnchor())) level.activateKitPower();
    return;
  }
  if (paddlePointer === e.pointerId) { paddlePointer = null; if (scene === 'level') e.type === 'pointercancel' ? level.pointerCancel() : level.pointerUp(); }
};
cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
addEventListener('blur', () => { paddlePointer = null; kitPress = null; if (scene === 'level') level.pointerCancel(); });
addEventListener('keydown', e => {
  unlockAudio();
  if (scene === 'level' && !e.repeat) level.key(e.key, true);
  if (e.key === ' ' || e.key.startsWith('Arrow') || e.key.toLowerCase() === 'k') e.preventDefault();
  if (e.key === 'Escape') scene = 'menu';
  if (scene === 'menu' && (e.key === '1' || e.key === '2')) start(+e.key - 1);
});
addEventListener('keyup', e => { if (scene === 'level') level.key(e.key, false); });
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
  menuT += dt;
  if (scene !== 'level') return;
  level.update(dt);
  if (level.state !== 'play') {
    resultT += dt;
    if (resultT > 1.1 && !level.resultSaved && !offering()) {
      level.resultSaved = true;
      const r = level.result();
      if (r.stars > best[levelIdx]) { best[levelIdx] = r.stars; store.set('best', best); }
    }
  }
}

// ---------- drawing ----------
function button(label, x, y, w, h, color, fn, small) {
  buttons.push({ x, y, w, h, fn });
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
    previews[i] = cached(`preview${i}|${w}|${h}|${H}`, w, h, pg => {
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
  const ly = 128 + Math.sin(menuT * 2) * 2;
  g.font = `64px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillText('BREACH', W / 2 + 3, ly + 7);
  g.strokeStyle = '#1a1030'; g.lineWidth = 10; g.strokeText('BREACH', W / 2, ly);
  const lg = g.createLinearGradient(0, ly - 30, 0, ly + 30);
  lg.addColorStop(0, '#fff6c8'); lg.addColorStop(0.45, '#ffc93c'); lg.addColorStop(0.55, '#ff8a3d'); lg.addColorStop(1, '#d9481f');
  g.fillStyle = lg; g.fillText('BREACH', W / 2, ly);
  g.save(); g.beginPath(); g.rect(0, ly - 30, W, 16); g.clip(); g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillText('BREACH', W / 2, ly); g.restore();
  text(g, 'Break in. Break out.', W / 2, ly + 44, 15, '#cfd6f5', 'center');

  // level cards
  const cw = W - 40, ch = Math.min(220, (H - 300) / 2 - 10);
  LEVELS.forEach((L, i) => {
    const x = 20, y = 210 + i * (ch + 18);
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
    g.fillStyle = L.color; g.beginPath(); g.arc(x + 26, y + ch - 46, 15, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.4)'; g.beginPath(); g.ellipse(x + 22, y + ch - 53, 7, 3, -0.4, 0, 7); g.fill();
    text(g, `${i + 1}`, x + 26, y + ch - 45, 17, '#fff', 'center');
    text(g, L.name, x + 50, y + ch - 48, 22, '#fff');
    text(g, L.sub, x + 16, y + ch - 20, 12, '#c9cfee');
    for (let s = 0; s < 3; s++) star(x + cw - 66 + s * 22, y + ch - 47, 8, s < best[i]);
    // a character peeks out on each card
    const bot = SPR[`inv_bot_blue_${['march0', 'march1', 'march0', 'march1', 'laugh', 'laugh'][Math.floor(menuT * 3) % 6]}`];
    if (i === 0 && ready(bot)) g.drawImage(bot.img, x + cw - 64, y + 6, bot.uw * 1.4, bot.uh * 1.4);
    else if (i === 0) drawInvader(g, x + cw - 52, y + 10, 36, 24, '#5ccf6a', Math.floor(menuT * 3) % 2, Math.sin(menuT));
    else drawPrincessIcon(g, x + cw - 36, y + 34, 64, menuT);
  });
  if (canFull()) {
    button(isMuted() ? 'Sound: off' : 'Sound: on', W / 2 - 128, H - 38, 120, 30, '#4b5370', () => setMuted(!isMuted()), true);
    button('Full screen', W / 2 + 8, H - 38, 120, 30, '#3f6fd1', goFull, true);
  } else button(isMuted() ? 'Sound: off' : 'Sound: on', W / 2 - 60, H - 38, 120, 30, '#4b5370', () => setMuted(!isMuted()), true);
}

// ---------- continue offer (after a loss, before the results) ----------
const CONT_AT = 0.9, CONT_SECS = 9;
const offering = () => level.state === 'lost' && !cont.declined && !!continueOffer(cont.used);
function doContinue() { cont.used++; cont.ad = null; level.continueRun(); resultT = 0; }
function drawContinue() {
  const k = Math.min(1, (resultT - CONT_AT) / 0.25); if (k <= 0) return;
  g.fillStyle = `rgba(6,8,20,${0.72 * k})`; g.fillRect(0, 0, W, H);
  if (cont.ad) return drawAdPlaceholder();
  const left = CONT_SECS - (resultT - CONT_AT);
  if (left <= 0) { cont.declined = true; resultT = 1.1; return; }
  const offer = continueOffer(cont.used), pw = W - 48, ph = offer === 'ad' ? 330 : 280, x = 24, y = H / 2 - ph / 2 + (1 - k) * 40;
  g.globalAlpha = k;
  g.fillStyle = 'rgba(0,0,0,0.5)'; rrect(g, x + 4, y + 8, pw, ph, 22); g.fill();
  const pg = g.createLinearGradient(0, y, 0, y + ph); pg.addColorStop(0, '#2c3360'); pg.addColorStop(1, '#171b36');
  g.fillStyle = pg; rrect(g, x, y, pw, ph, 22); g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 1.5; rrect(g, x + 1, y + 1, pw - 2, ph - 2, 21); g.stroke();
  text(g, 'CONTINUE?', W / 2, y + 36, 30, '#ffd36b', 'center');
  text(g, level.reason || '', W / 2, y + 64, 13, '#c9cfee', 'center');
  // countdown ring
  const cx = W / 2, cy = y + 112;
  g.strokeStyle = 'rgba(0,0,0,0.45)'; g.lineWidth = 7; g.beginPath(); g.arc(cx, cy, 26, 0, 7); g.stroke();
  g.strokeStyle = '#ff7a8a'; g.beginPath(); g.arc(cx, cy, 26, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (left / CONT_SECS)); g.stroke();
  text(g, String(Math.ceil(left)), cx, cy + 1, 26, '#fff', 'center');
  g.globalAlpha = 1;
  let by = y + 160;
  if (offer === 'ad') {
    button('▶  Watch ad · Continue', x + 24, by, pw - 48, 48, '#5ccf6a', () => { cont.ad = { t: 0 }; watchAd().then(ok => { if (ok && cont.ad) doContinue(); else cont.ad = null; }); });
    by += 62;
    if (MODE !== 'free' && !isUnlocked()) button(`Unlock full game · ${PRICE}`, x + 24, by, pw - 48, 40, '#9b4fd1', () => buyFullGame().then(ok => { if (ok) { cont.toast = { text: 'Full game unlocked · no more ads', t: menuT }; doContinue(); } }), true);
    by += 54;
  } else {
    button('Continue', x + 24, by, pw - 48, 48, '#5ccf6a', doContinue);
    by += 62;
  }
  buttons.push({ x: W / 2 - 60, y: by - 6, w: 120, h: 32, fn: () => { cont.declined = true; resultT = 1.1; } });
  text(g, 'No thanks', W / 2, by + 10, 15, 'rgba(220,226,255,0.7)', 'center');
}
function drawAdPlaceholder() { // stands in for a rewarded ad until a real SDK is wired up in monetize.js
  const t = (cont.ad.t += 1 / 60), left = Math.max(0, AD_SECONDS - t);
  g.fillStyle = '#0b0d1c'; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(255,255,255,0.15)'; g.setLineDash([6, 6]); g.lineWidth = 2; rrect(g, 24, H / 2 - 120, W - 48, 240, 18); g.stroke(); g.setLineDash([]);
  text(g, 'AD PLACEHOLDER', W / 2, H / 2 - 40, 26, '#c9cfee', 'center');
  text(g, 'A rewarded video plays here', W / 2, H / 2 - 8, 13, 'rgba(220,226,255,0.6)', 'center');
  text(g, `Reward in ${Math.ceil(left)}`, W / 2, H / 2 + 40, 20, '#7bf2c8', 'center');
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
  const title = won ? (levelIdx === 1 ? 'PRINCESS SAVED!' : 'CREW SAVED!') : 'SO CLOSE!';
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
  if (won && levelIdx < LEVELS.length - 1) {
    button('Retry', x + 20, by, 110, 40, '#4b5370', () => start(levelIdx));
    button('Next', x + pw - 130, by, 110, 40, '#5ccf6a', () => start(levelIdx + 1));
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
  const top = scene === 'menu' ? inT : inT - LIFT;   // screen space above the level's y = 0
  if (scene !== 'menu' && level.drawFullBleedBackground) level.drawFullBleedBackground(g, top, FH);
  else {
    if (top > 0 && scene !== 'menu' && level.drawTopInset) { g.save(); g.translate(0, top); level.drawTopInset(g, top + 1); g.restore(); }
    else if (top > 0) g.drawImage(bg, 0, 0, bg.width, k, 0, 0, W, top + 1);
    if (inB) g.drawImage(bg, 0, bg.height - k, bg.width, k, 0, FH - inB - 1, W, inB + 1);
  }
  g.translate(0, inT);
  if (scene === 'menu') drawMenu();
  else {
    g.save(); g.translate(0, -LIFT); level.draw(g); g.restore();
    if (level.state === 'play') pauseButton();
    else drawResults();
    drawToast();
  }
  g.restore();
  fillMargins();
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
  buttons.push({ x: 4 / scale, y: 0, w: 44 / scale, h: 44 / scale, fn: () => { scene = 'menu'; } });
  g.fillStyle = '#a8bfcc';
  for (const x of [22, 28]) { rrect(g, x / scale, 11 / scale, 2.5 / scale, 14 / scale, 1 / scale); g.fill(); }
}

// test hook for automated playtests
window.__breach = { start, get level() { return level; }, get scene() { return scene; }, set scene(s) { scene = s; } };

resize();
(document.fonts ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]) : Promise.resolve()).then(() => {
  previews = []; setDPR(scale * Math.min(3, devicePixelRatio || 1));
  artLoaded().then(() => { previews = []; });   // re-crop the level cards once the rendered art is in
  const q = new URLSearchParams(location.search).get('level');
  if (q) start(+q - 1);
  requestAnimationFrame(t => { last = t; frame(t); });
});
