// Entry: canvas sizing, fixed-step loop, input mapping and the three scenes (menu, level, results).
import { setDPR, text, rrect, shade, vignette, drawGrain, cached, brick, FONT } from './gfx.js';
import { unlockAudio, setMuted, isMuted, sfx } from './audio.js';
import { Invasion } from './invasion.js';
import { Vault } from './vault.js';
import { drawFox, drawInvader } from './characters.js';

const LEVELS = [
  { make: (W, H) => new Invasion(W, H), name: 'Invasion', sub: 'Clear the formation before it lands', color: '#ff5d8f' },
  { make: (W, H) => new Vault(W, H), name: 'The Vault', sub: 'Free the fox before the serpent gets there', color: '#f4c542' },
];
const W = 360;
let H = 740, scale = 1, FH = 740, inT = 0, inB = 0; // FH: full canvas height; H: playable height inside the safe area
const cv = document.getElementById('game'), g = cv.getContext('2d');

const store = {
  get(k) { try { return JSON.parse(localStorage.getItem('breach.' + k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem('breach.' + k, JSON.stringify(v)); } catch { /* private mode */ } },
};
let best = store.get('best') || [0, 0];

let scene = 'menu', level = null, levelIdx = 0, resultT = 0, buttons = [], menuT = 0, previews = [];

// Notch / Dynamic Island / home indicator / Android cutouts, in CSS px. ?safe=top,bottom fakes them for testing.
function safeInsets() {
  const q = new URLSearchParams(location.search).get('safe');
  if (q) { const [t, b] = q.split(',').map(Number); return [t || 0, b || 0]; }
  const probe = document.getElementById('safe'), cs = probe && getComputedStyle(probe);
  return cs ? [parseFloat(cs.paddingTop) || 0, parseFloat(cs.paddingBottom) || 0] : [0, 0];
}
function resize() {
  const iw = document.body.clientWidth || innerWidth, ih = document.body.clientHeight || innerHeight, [st, sb] = safeInsets();
  FH = iw < ih ? Math.round(Math.max(640, Math.min(880, (W * ih) / iw))) : 740;
  scale = Math.min(iw / W, ih / FH);
  inT = iw < ih ? st / scale : 0; inB = iw < ih ? sb / scale : 0;
  H = Math.round(FH - inT - inB);
  const dpr = Math.min(3, devicePixelRatio || 1);
  cv.style.width = `${W * scale}px`; cv.style.height = `${FH * scale}px`;
  cv.width = Math.round(W * scale * dpr); cv.height = Math.round(FH * scale * dpr);
  setDPR(scale * dpr);
  g.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
  previews = [];
  if (level && (level.W !== W || level.H !== H)) start(levelIdx); // geometry depends on H
}

function start(i) {
  levelIdx = i; level = LEVELS[i].make(W, H); scene = 'level'; resultT = 0;
}

// ---------- input ----------
const toWorld = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / scale, (e.clientY - r.top) / scale - inT]; };
cv.addEventListener('pointerdown', e => {
  unlockAudio(); cv.setPointerCapture(e.pointerId);
  const [x, y] = toWorld(e);
  const b = buttons.find(b => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h);
  if (b) { sfx.paddle(); b.fn(); return; }
  if (scene === 'level' && level.state === 'play') level.pointerDown(x, y);
});
cv.addEventListener('pointermove', e => { if (scene === 'level') { const [x, y] = toWorld(e); level.pointerMove(x, y); } });
const up = () => { if (scene === 'level') level.pointerUp(); };
cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
addEventListener('keydown', e => {
  unlockAudio();
  if (scene === 'level' && !e.repeat) level.key(e.key, true);
  if (e.key === ' ' || e.key.startsWith('Arrow')) e.preventDefault();
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
    if (resultT > 1.1 && !level.resultSaved) {
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
    const lv = LEVELS[i].make(W, H), r = lv.previewRect();
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
    if (i === 0) drawInvader(g, x + cw - 52, y + 10, 36, 24, '#5ccf6a', Math.floor(menuT * 3) % 2, Math.sin(menuT));
    else drawFox(g, x + cw - 34, y + 30, 0.9, 'scared', menuT);
  });
  text(g, 'Drag anywhere to move · hold still on a catch to aim', W / 2, H - 52, 12, 'rgba(220,226,255,0.65)', 'center');
  button(isMuted() ? 'Sound: off' : 'Sound: on', W / 2 - 60, H - 38, 120, 30, '#4b5370', () => setMuted(!isMuted()), true);
}

function drawResults() {
  const k = Math.min(1, (resultT - 1.1) / 0.3); if (k <= 0) return;
  const r = level.result(), won = level.state === 'won';
  g.fillStyle = `rgba(6,8,20,${0.7 * k})`; g.fillRect(0, 0, W, H);
  const pw = W - 56, ph = 300, x = 28, y = H / 2 - ph / 2 + (1 - k) * 40;
  g.globalAlpha = k;
  g.fillStyle = 'rgba(0,0,0,0.5)'; rrect(g, x + 4, y + 8, pw, ph, 22); g.fill();
  const pg = g.createLinearGradient(0, y, 0, y + ph); pg.addColorStop(0, '#2c3360'); pg.addColorStop(1, '#171b36');
  g.fillStyle = pg; rrect(g, x, y, pw, ph, 22); g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 1.5; rrect(g, x + 1, y + 1, pw - 2, ph - 2, 21); g.stroke();
  const title = won ? (levelIdx === 1 ? 'PRINCESS SAVED!' : 'INVASION OVER!') : 'SO CLOSE!';
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
  g.save(); g.clearRect(0, 0, W, FH);
  // extend the scene's top and bottom pixel rows under the notch and home indicator
  const bg = scene === 'menu' ? menuBg() : level.background(), k = bg.height / H;
  if (inT && scene !== 'menu' && level.drawTopInset) { g.save(); g.translate(0, inT); level.drawTopInset(g, inT + 1); g.restore(); }
  else if (inT) g.drawImage(bg, 0, 0, bg.width, k, 0, 0, W, inT + 1);
  if (inB) g.drawImage(bg, 0, bg.height - k, bg.width, k, 0, FH - inB - 1, W, inB + 1);
  g.translate(0, inT);
  if (scene === 'menu') drawMenu();
  else {
    level.draw(g);
    if (level.state === 'play') pauseButton();
    else drawResults();
  }
  g.restore();
}
function pauseButton() { // top-left, away from the thumb that steers the paddle; 44pt touch target
  const x = 10, y = 14, s = 30;
  buttons.push({ x: x - 7, y: y - 7, w: s + 14, h: s + 14, fn: () => { scene = 'menu'; } });
  g.fillStyle = 'rgba(0,0,0,0.35)'; rrect(g, x + 2, y + 3, s, s, 10); g.fill();
  const gr = g.createLinearGradient(0, y, 0, y + s); gr.addColorStop(0, '#5d6688'); gr.addColorStop(1, '#2c3250');
  g.fillStyle = gr; rrect(g, x, y, s, s, 10); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.25)'; rrect(g, x + 4, y + 2, s - 8, 4, 2); g.fill();
  g.fillStyle = '#fff'; rrect(g, x + 10, y + 9, 4, 12, 1.5); g.fill(); rrect(g, x + 17, y + 9, 4, 12, 1.5); g.fill();
}

// test hook for automated playtests
window.__breach = { start, get level() { return level; }, get scene() { return scene; }, set scene(s) { scene = s; } };

resize();
(document.fonts ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]) : Promise.resolve()).then(() => {
  previews = []; setDPR(scale * Math.min(3, devicePixelRatio || 1));
  const q = new URLSearchParams(location.search).get('level');
  if (q) start(+q - 1);
  requestAnimationFrame(t => { last = t; frame(t); });
});
