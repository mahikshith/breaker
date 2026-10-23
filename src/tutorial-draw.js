// The hand and arrow gestures of the ball-control tutorial (src/tutorial.js), drawn in level space around the paddle.
// They sit on the paddle row and below it, never above it, so the ball's path stays clear.
import { arrow, thumbIcon } from './coach.js';
import { rrect } from './gfx.js';

const MINT = '159,247,236', GOLD = '255,201,138';
const tri = t => 1 - Math.abs(((t % 1) + 1) % 1 * 2 - 1);   // 0..1..0 over one period
const soft = x => x * x * (3 - 2 * x);

// o: { x, y, w, h, k, t, a, held, left, right, drop, ball } for the paddle (x centre, y top). id: the step to show.
export function drawGesture(g, id, o) {
  if (!id) return;
  const { x, y, w, h, k, t } = o, hy = y + 26 * k;
  g.save(); g.globalAlpha *= o.a;
  const pad = (px, py, a = 1) => {   // a soft pool of light under the fingertip
    const r = 17 * k, gr = g.createRadialGradient(px, py + 5 * k, 0, px, py + 5 * k, r);
    gr.addColorStop(0, `rgba(${MINT},${.5 * a})`); gr.addColorStop(1, `rgba(${MINT},0)`); g.fillStyle = gr; g.fillRect(px - r, py + 5 * k - r, r * 2, r * 2);
  };
  if (id === 'aim') {
    // a ghost aim line sweeping over the waiting ball, until the real one takes over
    if (!o.held) {
      const ang = Math.sin(t * 2.2) * .5, bx = x, by = y - 7 * k;
      g.fillStyle = `rgba(${MINT},.8)`;
      for (let i = 1; i <= 7; i++) { const d = (14 + i * 15) * k; g.globalAlpha *= 1; g.beginPath(); g.arc(bx + Math.sin(ang) * d, by - Math.cos(ang) * d, (3.2 - i * .22) * k, 0, 7); g.fill(); }
    }
    thumbIcon(g, x, hy, k * 1.5, t, 'hold');
  } else if (id === 'serve') {
    const c = (t % 1.3) / 1.3, up = soft(Math.min(1, c * 1.6));
    g.save(); g.globalAlpha *= 1 - Math.max(0, (c - .7) / .3); pad(x, hy - up * 12 * k, 1 - up); thumbIcon(g, x, hy - up * 12 * k, k * 1.5, 0, 'press'); g.restore();
    arrow(g, x, y - 18 * k - up * 8 * k, 6 * k, -Math.PI / 2, `rgba(${MINT},${.35 + .6 * up})`);
  } else if (id === 'move') {
    const sw = Math.min(70, (o.right - o.left) / 2 - w / 2 - 6), dx = Math.sin(t * 2.4) * sw;
    // ghost paddle outline sliding to and fro, chevrons either side, the thumb dragging it
    g.strokeStyle = `rgba(${MINT},.75)`; g.lineWidth = 1.6 * k; g.setLineDash([4 * k, 3 * k]); rrect(g, x + dx - w / 2, y, w, h, h / 2); g.stroke(); g.setLineDash([]);
    const b = tri(t * .9) * 4 * k;
    arrow(g, x - w / 2 - 14 * k - b, y + h / 2, 5 * k, Math.PI, `rgba(${MINT},.9)`); arrow(g, x + w / 2 + 14 * k + b, y + h / 2, 5 * k, 0, `rgba(${MINT},.9)`);
    pad(x + dx, hy); thumbIcon(g, x + dx, hy, k * 1.5, t, 'press');
  } else if (id === 'edge' || id === 'centre' || id === 'ram') {
    const edge = id === 'edge', col = edge ? GOLD : MINT, beat = .55 + .45 * Math.sin(t * 6);
    g.fillStyle = `rgba(${col},${.35 + .4 * beat})`;
    if (edge) { rrect(g, x - w / 2 - 1, y - 1, w * .31, h + 2, h / 2); g.fill(); rrect(g, x + w / 2 - w * .31 + 1, y - 1, w * .31, h + 2, h / 2); g.fill(); }
    else { rrect(g, x - w / 6, y - 1, w / 3, h + 2, 3 * k); g.fill(); }
    // the angle it gives: slanted arrows off the ends, one straight arrow under the middle
    const ln = `rgba(${col},.9)`;
    if (edge) { arrow(g, x - w / 2 - 11 * k, y - 3 * k, 5.5 * k, -Math.PI * .75, ln); arrow(g, x + w / 2 + 11 * k, y - 3 * k, 5.5 * k, -Math.PI * .25, ln); }
    else arrow(g, x, y + h + 11 * k, 5 * k, -Math.PI / 2, ln);
  } else if (id === 'capsule') {
    // a landing ring on the paddle row under the falling capsule, and a bobbing chevron pointing at it
    const d = o.drop; if (!d) { g.restore(); return; }
    const r = (11 + 4 * tri(t * 1.3)) * k;
    g.strokeStyle = `rgba(${GOLD},.85)`; g.lineWidth = 2 * k; g.beginPath(); g.ellipse(d.x, y + h / 2, 22 * k, r * .55, 0, 0, 7); g.stroke();
    arrow(g, d.x, y + h + 12 * k + tri(t * 1.3) * 3 * k, 5 * k, -Math.PI / 2, `rgba(${GOLD},.95)`);
  }
  g.restore();
}
