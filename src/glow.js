// Soft light helpers with no asset dependencies (shared by gfx.js and kit.js).
// A soft band of light at radius r (rx x ry when an ellipse): a filled radial falloff on both sides, never a stroked line.
export function softRing(g, x, y, r, width, colour, alpha = 1, ry = r, rot = 0, additive = true) {
  if (alpha <= 0 || r <= 0) return;
  const R = r + width * 1.6, a = Math.max(0, (r - width * 1.6) / R), m = r / R;
  const base = typeof g.globalAlpha === 'number' ? g.globalAlpha : 1;   // test stubs have no alpha
  g.save(); if (additive) g.globalCompositeOperation = 'lighter'; g.globalAlpha = base * Math.min(1, alpha);
  g.translate(x, y); g.rotate(rot); g.scale(1, ry / r);
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, R); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(a, 'rgba(0,0,0,0)'); gr.addColorStop(m, colour); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(-R, -R, R * 2, R * 2); g.restore();
}
