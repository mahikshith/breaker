// Characters drawn with vector shapes in a glossy "vinyl toy" style: soft gradients, light from the top-left, no outlines glow.
import { shade } from './gfx.js';

const ORANGE = '#f0822e', CREAM = '#fff1dc', DARK = '#3a2018';

function blob(g, x, y, rx, ry, base, rot = 0) {
  const gr = g.createRadialGradient(x - rx * 0.35, y - ry * 0.45, Math.min(rx, ry) * 0.1, x, y, Math.max(rx, ry) * 1.1);
  gr.addColorStop(0, shade(base, 0.35)); gr.addColorStop(0.55, base); gr.addColorStop(1, shade(base, -0.35));
  g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 7); g.fill();
}

// mood: 'scared' | 'happy' | 'run'
export function drawFox(g, x, y, s = 1, mood = 'scared', t = 0) {
  g.save(); g.translate(x, y); g.scale(s, s);
  // breathing squash anchored at the feet; faster and deeper when scared (no positional jitter)
  const br = Math.sin(t * (mood === 'scared' ? 7 : 2.6)) * (mood === 'scared' ? 0.035 : 0.02);
  g.translate(0, 15); g.scale(1 + br, 1 - br); g.translate(0, -15);
  const blink = mood !== 'happy' && (t % 3.3) < 0.12;
  const hop = mood === 'run' ? -Math.abs(Math.sin(t * 14)) * 3 : 0;
  g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.ellipse(2, 15, 12, 3.5, 0, 0, 7); g.fill();
  g.translate(0, hop);
  // tail
  g.save(); g.rotate(mood === 'happy' ? Math.sin(t * 9) * 0.25 : 0.1);
  const tg = g.createLinearGradient(8, 0, 22, -8); tg.addColorStop(0, ORANGE); tg.addColorStop(0.7, shade(ORANGE, -0.15)); tg.addColorStop(0.72, CREAM); tg.addColorStop(1, '#ffffff');
  g.fillStyle = tg; g.beginPath(); g.moveTo(6, 8); g.bezierCurveTo(14, 12, 24, 4, 21, -8); g.bezierCurveTo(17, -3, 12, 2, 5, 3); g.closePath(); g.fill();
  g.restore();
  // body
  blob(g, 0, 7, 9, 8, ORANGE);
  g.fillStyle = CREAM; g.beginPath(); g.ellipse(0, 9, 5, 5.5, 0, 0, 7); g.fill();
  // paws
  for (const px of [-4.5, 4.5]) { g.fillStyle = DARK; g.beginPath(); g.ellipse(px, 14, 3, 2, 0, 0, 7); g.fill(); }
  // ears
  for (const side of [-1, 1]) {
    g.save(); g.scale(side, 1);
    const eg = g.createLinearGradient(4, -22, 12, -8); eg.addColorStop(0, shade(ORANGE, -0.2)); eg.addColorStop(1, ORANGE);
    g.fillStyle = eg; g.beginPath(); g.moveTo(3, -10); g.quadraticCurveTo(6, -24, 13, -21); g.quadraticCurveTo(14, -13, 11, -6); g.closePath(); g.fill();
    g.fillStyle = DARK; g.beginPath(); g.moveTo(5.5, -11); g.quadraticCurveTo(7.5, -20, 11.5, -19); g.quadraticCurveTo(12, -14, 10, -9); g.closePath(); g.fill();
    g.restore();
  }
  // head
  blob(g, 0, -6, 12, 10, ORANGE);
  // cheeks / mask
  g.fillStyle = CREAM;
  g.beginPath(); g.ellipse(-5, -1.5, 6.5, 5, -0.3, 0, 7); g.ellipse(5, -1.5, 6.5, 5, 0.3, 0, 7); g.fill();
  // eyes
  if (mood === 'happy') {
    g.strokeStyle = DARK; g.lineWidth = 1.6; g.lineCap = 'round';
    for (const ex of [-4.8, 4.8]) { g.beginPath(); g.arc(ex, -5, 2.4, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
  } else if (blink) {
    g.strokeStyle = DARK; g.lineWidth = 1.4; g.lineCap = 'round';
    for (const ex of [-4.8, 4.8]) { g.beginPath(); g.moveTo(ex - 2.4, -5.2); g.lineTo(ex + 2.4, -5.2); g.stroke(); }
  } else {
    for (const ex of [-4.8, 4.8]) {
      g.fillStyle = '#1b1020'; g.beginPath(); g.ellipse(ex, -5.5, 2.6, 3.3, 0, 0, 7); g.fill();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(ex + 0.9, -6.8, 1.1, 0, 7); g.fill();
      g.beginPath(); g.arc(ex - 0.8, -4.3, 0.5, 0, 7); g.fill();
    }
    if (mood === 'scared') { // worried brows
      g.strokeStyle = shade(ORANGE, -0.45); g.lineWidth = 1.1; g.lineCap = 'round';
      g.beginPath(); g.moveTo(-7, -10.5); g.lineTo(-3, -11.5); g.moveTo(7, -10.5); g.lineTo(3, -11.5); g.stroke();
    }
  }
  // nose and mouth
  g.fillStyle = '#1b1020'; g.beginPath(); g.ellipse(0, -1.6, 1.7, 1.2, 0, 0, 7); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.arc(-0.5, -2, 0.45, 0, 7); g.fill();
  g.strokeStyle = '#1b1020'; g.lineWidth = 0.9;
  if (mood === 'scared') { g.beginPath(); g.ellipse(0, 1.8, 1.2, 1.4, 0, 0, 7); g.stroke(); }
  else { g.beginPath(); g.arc(-1.3, 0.2, 1.3, 0.2, Math.PI - 0.2); g.arc(1.3, 0.2, 1.3, 0.2, Math.PI - 0.2); g.stroke(); }
  // glossy highlight on head
  g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.ellipse(-5, -12, 4, 1.8, -0.4, 0, 7); g.fill();
  g.restore();
}

const SNAKE = '#3b1f4f', SNAKE_DARK = '#160a20', GOLD = '#f2c14e';
// pts: [{x,y}] head first. dir: head angle. stun: seconds remaining.
export function drawSerpent(g, pts, dir, t, stun = 0, open = 0) {
  const n = pts.length;
  // shadows
  g.fillStyle = 'rgba(0,0,0,0.35)';
  for (let i = n - 1; i >= 0; i--) { const r = segR(i, n); g.beginPath(); g.ellipse(pts[i].x + 3, pts[i].y + 5, r, r * 0.85, 0, 0, 7); g.fill(); }
  for (let i = n - 1; i >= 1; i--) {
    const p = pts[i], r = segR(i, n);
    const gr = g.createRadialGradient(p.x - r * 0.4, p.y - r * 0.5, r * 0.1, p.x, p.y, r);
    gr.addColorStop(0, '#7a4a95'); gr.addColorStop(0.5, SNAKE); gr.addColorStop(1, SNAKE_DARK);
    g.fillStyle = gr; g.beginPath(); g.arc(p.x, p.y, r, 0, 7); g.fill();
    // gold diamond marking along the spine
    const q = pts[i - 1], a = Math.atan2(q.y - p.y, q.x - p.x);
    g.save(); g.translate(p.x, p.y); g.rotate(a);
    g.fillStyle = i % 2 ? GOLD : shade(GOLD, -0.25);
    g.beginPath(); g.moveTo(-r * 0.5, 0); g.lineTo(0, -r * 0.32); g.lineTo(r * 0.5, 0); g.lineTo(0, r * 0.32); g.closePath(); g.fill();
    g.restore();
    g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.ellipse(p.x - r * 0.35, p.y - r * 0.45, r * 0.4, r * 0.2, -0.5, 0, 7); g.fill();
  }
  // head
  const h = pts[0];
  g.save(); g.translate(h.x, h.y); g.rotate(dir);
  if (stun > 0) g.rotate(Math.sin(t * 30) * 0.15);
  // tongue
  if (stun <= 0 && (t % 1.4) < 0.35) {
    const L = 10 + Math.sin(t * 40) * 2;
    g.strokeStyle = '#e8304a'; g.lineWidth = 1.3; g.lineCap = 'round';
    g.beginPath(); g.moveTo(10, 0); g.lineTo(10 + L, 0); g.lineTo(14 + L, -3); g.moveTo(10 + L, 0); g.lineTo(14 + L, 3); g.stroke();
  }
  const hg = g.createRadialGradient(-3, -5, 1, 0, 0, 13);
  hg.addColorStop(0, '#8a58a6'); hg.addColorStop(0.5, SNAKE); hg.addColorStop(1, SNAKE_DARK);
  g.fillStyle = hg;
  g.beginPath(); g.moveTo(-9, -8); g.bezierCurveTo(3, -12, 13, -6, 13, 0); g.bezierCurveTo(13, 6, 3, 12, -9, 8); g.bezierCurveTo(-13, 4, -13, -4, -9, -8); g.fill();
  // jaw opens when chewing
  if (open > 0) { g.fillStyle = '#5a0d1e'; g.beginPath(); g.moveTo(13, 0); g.lineTo(5, -3 * open); g.lineTo(5, 3 * open); g.closePath(); g.fill(); }
  // brow ridges and eyes
  for (const s of [-1, 1]) {
    g.fillStyle = SNAKE_DARK; g.beginPath(); g.ellipse(3, s * 6, 5, 2.4, s * 0.3, 0, 7); g.fill();
    g.fillStyle = stun > 0 ? '#c9c2d6' : '#ffd23f'; g.beginPath(); g.ellipse(4, s * 5.2, 3, 2.2, s * 0.2, 0, 7); g.fill();
    g.fillStyle = '#120612';
    if (stun > 0) { g.lineWidth = 0.9; g.strokeStyle = '#120612'; g.beginPath(); g.moveTo(2.5, s * 5.2 - 1.5); g.lineTo(5.5, s * 5.2 + 1.5); g.moveTo(5.5, s * 5.2 - 1.5); g.lineTo(2.5, s * 5.2 + 1.5); g.stroke(); }
    else { g.beginPath(); g.ellipse(4.6, s * 5.2, 0.7, 1.9, 0, 0, 7); g.fill(); }
  }
  g.fillStyle = 'rgba(255,255,255,0.3)'; g.beginPath(); g.ellipse(-3, -4, 5, 1.6, -0.2, 0, 7); g.fill();
  g.restore();
  if (stun > 0) { // dizzy stars
    for (let i = 0; i < 3; i++) {
      const a = t * 5 + i * 2.1, sx = h.x + Math.cos(a) * 12, sy = h.y - 14 + Math.sin(a) * 4;
      star(g, sx, sy, 3, '#ffe27a');
    }
  }
}
const segR = (i, n) => 8.5 - (i / n) * 4.5;
function star(g, x, y, r, c) {
  g.fillStyle = c; g.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  g.closePath(); g.fill();
}

// Glossy toy robot invader that fits one formation cell. look: -1..1 where the visor eye points.
export function drawInvader(g, x, y, w, h, color, frame, look = 0, hurt = 0) {
  const cx = x + w / 2, bw = w * 0.78, bh = h * 0.7, bx = cx - bw / 2, by = y + h * 0.08;
  // legs (alternate every march step)
  g.fillStyle = shade(color, -0.55);
  const lo = frame ? 1.5 : -1.5;
  for (const s of [-1, 1]) { g.beginPath(); g.roundRect(cx + s * bw * 0.28 - 1.6 + (s * lo) * 0.5, by + bh - 2, 3.2, h * 0.3, 1.5); g.fill(); }
  // antenna
  g.strokeStyle = shade(color, -0.4); g.lineWidth = 1.2;
  g.beginPath(); g.moveTo(cx, by + 1); g.lineTo(cx + (frame ? 1.5 : -1.5), by - 3); g.stroke();
  g.fillStyle = shade(color, 0.5); g.beginPath(); g.arc(cx + (frame ? 1.5 : -1.5), by - 3.5, 1.6, 0, 7); g.fill();
  // body
  const body = hurt > 0 ? '#ffffff' : color;
  const gr = g.createLinearGradient(0, by, 0, by + bh);
  gr.addColorStop(0, shade(body, 0.45)); gr.addColorStop(0.5, body); gr.addColorStop(1, shade(body, -0.35));
  g.fillStyle = shade(body, -0.6); g.beginPath(); g.roundRect(bx, by + 2, bw, bh, bh * 0.45); g.fill();
  g.fillStyle = gr; g.beginPath(); g.roundRect(bx, by, bw, bh, bh * 0.45); g.fill();
  // side arms
  for (const s of [-1, 1]) { g.fillStyle = shade(color, -0.25); g.beginPath(); g.ellipse(cx + s * (bw / 2 + 1), by + bh * 0.55 + (frame ? s : -s), 2, 2.8, 0, 0, 7); g.fill(); }
  // visor
  const vw = bw * 0.62, vh = bh * 0.42, vx = cx - vw / 2, vy = by + bh * 0.22;
  g.fillStyle = '#141428'; g.beginPath(); g.roundRect(vx, vy, vw, vh, vh / 2); g.fill();
  const ex = cx + look * (vw / 2 - vh / 2), ey = vy + vh / 2;
  g.fillStyle = '#6ff7ff'; g.beginPath(); g.ellipse(ex, ey, vh * 0.42, vh * 0.36, 0, 0, 7); g.fill();
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(ex - 0.6, ey - 0.6, 0.9, 0, 7); g.fill();
  // gloss
  g.fillStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); g.ellipse(bx + bw * 0.3, by + 2, bw * 0.22, 1.3, -0.15, 0, 7); g.fill();
}

// Mothership: chrome saucer with a glass dome and a ring of candy lights.
export function drawMothership(g, x, y, t, hurt = 0, hpFrac = 1) {
  g.save(); g.translate(x, y);
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.ellipse(5, 24, 62, 12, 0, 0, 7); g.fill();
  // dome
  const dg = g.createRadialGradient(-10, -24, 2, 0, -14, 30);
  dg.addColorStop(0, 'rgba(230,250,255,0.95)'); dg.addColorStop(0.4, 'rgba(120,200,240,0.65)'); dg.addColorStop(1, 'rgba(30,60,110,0.85)');
  g.fillStyle = dg; g.beginPath(); g.ellipse(0, -8, 26, 22, 0, Math.PI, 0); g.fill();
  // pilot robot inside the dome
  drawInvader(g, -10, -26, 20, 16, '#ff5d8f', Math.floor(t * 4) % 2, Math.sin(t * 1.7), hurt);
  g.fillStyle = 'rgba(255,255,255,0.45)'; g.beginPath(); g.ellipse(-10, -22, 8, 4, -0.5, 0, 7); g.fill();
  // saucer body
  const body = hurt > 0 ? '#ffffff' : '#c9d1e2';
  const bg = g.createLinearGradient(0, -12, 0, 16);
  bg.addColorStop(0, shade(body, 0.6)); bg.addColorStop(0.45, body); bg.addColorStop(0.55, '#6b7491'); bg.addColorStop(1, '#2a2f48');
  g.fillStyle = '#20243a'; g.beginPath(); g.ellipse(0, 6, 60, 15, 0, 0, 7); g.fill();
  g.fillStyle = bg; g.beginPath(); g.ellipse(0, 2, 60, 14, 0, 0, 7); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.ellipse(-18, -6, 26, 3, -0.05, 0, 7); g.fill();
  // lights
  const C = ['#ff5d8f', '#ffd23f', '#5ccf6a', '#3fa8f5', '#c46bf0'];
  for (let i = 0; i < 9; i++) {
    const a = (i / 8) * Math.PI, lx = -Math.cos(a) * 48, ly = 6 + Math.sin(a) * 4;
    const on = Math.floor(t * 6 + i) % 3 === 0;
    const c = C[i % C.length];
    g.fillStyle = shade(c, on ? 0.35 : -0.35); g.beginPath(); g.arc(lx, ly, 3, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.8)'; g.beginPath(); g.arc(lx - 0.9, ly - 1, 0.9, 0, 7); g.fill();
  }
  // damage cracks
  if (hpFrac < 0.6) { g.strokeStyle = 'rgba(20,20,40,0.7)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(20, -4); g.lineTo(28, 4); g.lineTo(24, 10); if (hpFrac < 0.3) { g.moveTo(-34, -2); g.lineTo(-26, 6); g.lineTo(-30, 12); } g.stroke(); }
  g.restore();
}
