// Layered tower window from art/castle (window kit). Anything that lives "inside" the tower, such as the serpent
// lunging out, is drawn between the back and front layers and clipped to the opening, so it emerges from the wall.
import { ART } from './vault-art.js';
import { loadImg, ready } from './gfx.js';

const PARTS = Object.fromEntries(Object.entries(ART.castleWindow || {}).map(([id, part]) => [id, { ...part, img: loadImg(part.url) }]));

// The opening polygon in world units for a window whose opening centre is at (x, y).
export function windowOpening(x, y) {
  const part = PARTS.window_front;
  if (!part) return [];
  const [ax, ay] = part.anchor;
  return part.opening.map(([px, py]) => ({ x: x + px - ax, y: y + py - ay }));
}

function layer(g, part, x, y) {
  if (!ready(part)) return false;
  g.drawImage(part.img, x - part.anchor[0], y - part.anchor[1], part.uw, part.uh);
  return true;
}

// drawInside(g) runs with the opening as the clip; cracked picks the damaged frame. Once the head has cleared the
// wall during a lunge, draw that emerged part after this call so it passes in front of the frame.
export function drawCastleWindow(g, x, y, drawInside, cracked = false) {
  const front = PARTS[cracked ? 'window_front_cracked' : 'window_front'];
  if (!ready(front) || !ready(PARTS.window_back)) { drawInside?.(g); return false; }
  layer(g, PARTS.window_back, x, y);
  if (drawInside) {
    g.save(); g.beginPath();
    windowOpening(x, y).forEach((p, i) => i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y));
    g.closePath(); g.clip(); drawInside(g); g.restore();
  }
  layer(g, front, x, y);
  return true;
}
