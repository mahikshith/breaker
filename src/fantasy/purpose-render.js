import { glazedBar, text, drawKitFace, rrect } from '../gfx.js';
import { PACE } from './purpose.js';

// Drawing for the purpose clock (src/fantasy/purpose.js), kept apart so the models stay free of canvas code.
const mix = (a, b, k) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * Math.max(0, Math.min(1, k))))})`;
// The purpose plate, in model space: the villain's goal in words over a glazed meter that fills toward Lumi's face.
// spec: { x (centre), y (top), w, label }. t: the model clock (pulses).
export function drawPurpose(g, clock, spec, t) {
  if (!clock || !spec) return;
  const { x, y, w = 150, label } = spec, h = 27, p = clock.p, hot = p >= PACE.high, beat = hot ? .5 + .5 * Math.sin(t * (8 + 6 * p)) : 0;
  const pushed = Math.max(0, 1 - (t - clock.pushAt) / .45), surged = Math.max(0, 1 - (t - clock.surgeAt) / .6);
  g.save();
  g.globalAlpha = .92; g.fillStyle = hot ? '#2a0c12e0' : '#0b111bd8'; rrect(g, x - w / 2, y, w, h, 9); g.fill();
  g.lineWidth = .9; g.strokeStyle = hot ? `rgba(255,120,140,${.45 + .5 * beat})` : pushed ? `rgba(140,236,190,${.4 + .5 * pushed})` : surged ? `rgba(255,150,160,${.4 + .5 * surged})` : '#d6a35f88'; g.stroke();
  g.globalAlpha = 1;
  const fx = x + w / 2 - 13, bx = x - w / 2 + 9, bw = fx - 13 - bx;
  text(g, label, bx, y + 8.5, 8.6, hot ? '#ffc2cc' : '#f3dca8', 'left');
  glazedBar(g, bx, y + 16, bw, 5, p, mix([140, 236, 190], [255, 170, 182], p), mix([38, 140, 104], [196, 62, 92], p));
  // Lumi waits at the end of the meter: calm, then nervous, then panicking as the villain closes in.
  g.fillStyle = '#05070dcc'; g.beginPath(); g.arc(fx, y + h / 2, 11, 0, Math.PI * 2); g.fill();
  drawKitFace(g, fx, y + h / 2, 21 * (1 + .06 * beat), p >= PACE.high ? 'Panic' : p >= PACE.mid ? 'Nervous' : 'Idle', 'lumi');
  g.restore();
}
// Screen space, over the whole chapter: past PACE.high the edges throb red (the Vault's capture vignette).
export function drawPurposeVignette(g, W, H, p, t) {
  if (!(p >= PACE.high)) return;
  const k = (p - PACE.high) / (1 - PACE.high), a = (.12 + .26 * k) * (.6 + .4 * Math.sin(t * (7 + 5 * k)));
  const vg = g.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .75);
  vg.addColorStop(0, 'rgba(160,0,30,0)'); vg.addColorStop(1, `rgba(160,0,30,${a})`); g.fillStyle = vg; g.fillRect(0, 0, W, H);
}
