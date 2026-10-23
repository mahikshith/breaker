// Tidewheel water FX, drawn to sit in the basin plate's realistic water: motion-blurred droplets falling under gravity, a
// crown of short spray sheets, a lumpy white-water bloom with soft alpha, foam flecks and a lit perspective ripple on the
// surface (only where the water actually lands on water). Every particle is evaluated in closed form from its effect's age
// and a seeded hash, so nothing is allocated per frame, pause and replay are exact, and a frame budget caps the droplets
// drawn at 60. No shadowBlur anywhere; the sprites below (and every gradient) are baked once, on first use.
// Palette sampled from the Tidewheel basin plate and the water-shot render: deep #021a26, body #1f5f74, spray #a9dfe2,
// foam #eefcf9, and the torch glint #ffd9a8 the wet surfaces pick up.
const TAU = Math.PI * 2;
const hash = (i, s) => { const v = Math.sin(i * 127.1 + s * 311.7 + 1.7) * 43758.5453; return v - Math.floor(v); };
const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
const easeOut = t => 1 - (1 - clamp01(t)) ** 3;
let B = null, budget = 0;
export const FX_BUDGET = 60;
// Call once per frame before any water FX: resets the live-droplet budget.
export function tideFrame() { budget = FX_BUDGET; }

function canvas(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); if (g) draw(g, w, h); return c; }
function bake() {
  if (B) return B;
  // A droplet streaking right, as one frame's motion blur: a soft capsule fading in from the tail, brightest at the leading
  // end, with a small specular point (no outline). Softened once with a canvas blur where the platform has one.
  const drop = (core, spec) => canvas(96, 24, (g, w, h) => {
    if ('filter' in g) g.filter = 'blur(1.6px)';
    const tail = g.createLinearGradient(4, 0, w - 6, 0); tail.addColorStop(0, core + '00'); tail.addColorStop(.55, core + '70'); tail.addColorStop(1, core + 'f0');
    g.fillStyle = tail; g.beginPath(); g.moveTo(4, h / 2 - 2); g.lineTo(w - 14, h / 2 - 7); g.arc(w - 14, h / 2, 7, -Math.PI / 2, Math.PI / 2); g.lineTo(4, h / 2 + 2); g.closePath(); g.fill();
    g.filter = 'none'; g.fillStyle = spec; g.beginPath(); g.ellipse(w - 15, h / 2 - 2.5, 3, 1.6, 0, 0, TAU); g.fill();
  });
  const radial = (stops) => canvas(96, 96, (g, w) => { const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); for (const [o, c] of stops) r.addColorStop(o, c); g.fillStyle = r; g.fillRect(0, 0, w, w); });
  // The ripple, baked as a circle and drawn squashed into the surface's perspective: a lit crest strongest on the far side
  // and a shadowed trough inside it strongest on the near side.
  const ring = canvas(192, 192, (g, w) => {
    const c = w / 2, band = (stops, top, bottom) => canvas(w, w, (h) => {
      const r = h.createRadialGradient(c, c, 0, c, c, c); for (const [o, col] of stops) r.addColorStop(o, col); h.fillStyle = r; h.fillRect(0, 0, w, w);
      h.globalCompositeOperation = 'destination-in'; const m = h.createLinearGradient(0, 0, 0, w); m.addColorStop(0, `rgba(0,0,0,${top})`); m.addColorStop(1, `rgba(0,0,0,${bottom})`); h.fillStyle = m; h.fillRect(0, 0, w, w);
    });
    g.drawImage(band([[0, '#02141c00'], [.6, '#02141c00'], [.76, '#02141cd0'], [.85, '#02141c20'], [.88, '#02141c00'], [1, '#02141c00']], .4, 1), 0, 0);
    g.drawImage(band([[0, '#d8f6f400'], [.82, '#d8f6f400'], [.89, '#eefcfad0'], [.94, '#a9dfe260'], [1, '#a9dfe200']], 1, .12), 0, 0);
  });
  const fleck = canvas(48, 24, (g) => { for (const [x, y, rx, ry, a] of [[22, 12, 14, 5, .55], [14, 10, 7, 3.5, .7], [31, 14, 8, 3, .6], [24, 9, 5, 2.4, .9]]) { const r = g.createRadialGradient(x, y, 0, x, y, rx); r.addColorStop(0, `rgba(244,255,253,${a})`); r.addColorStop(1, 'rgba(190,233,234,0)'); g.fillStyle = r; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fill(); } });
  // White water: a lumpy, value-noise foam cloud with soft broken edges, brighter on top where it catches the light.
  const foam = canvas(128, 80, (g, w, h) => {
    const img = g.createImageData(w, h), d = img.data;
    const vn = (x, y, k) => { const xi = Math.floor(x), yi = Math.floor(y), u = (x - xi) ** 2 * (3 - 2 * (x - xi)), v = (y - yi) ** 2 * (3 - 2 * (y - yi));
      const a = hash(xi * 57 + yi * 131, k), b = hash((xi + 1) * 57 + yi * 131, k), c = hash(xi * 57 + (yi + 1) * 131, k), e = hash((xi + 1) * 57 + (yi + 1) * 131, k);
      return a + (b - a) * u + (c - a) * v + (a - b - c + e) * u * v; };
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const nx = (x / w - .5) * 2, ny = (y / h - .5) * 2, r = Math.hypot(nx, ny * 1.05);
      const n = .5 * vn(x / 13, y / 13, 1) + .3 * vn(x / 6, y / 6, 2) + .2 * vn(x / 3, y / 3, 3);
      const dens = clamp01((1 - r) * 1.7 + (n - .5) * 1.6), a = dens * dens * (3 - 2 * dens);
      const lit = clamp01(.88 + .4 * (n - .5) - .16 * ny), i = (y * w + x) * 4;
      d[i] = 226 * lit + 26; d[i + 1] = 238 * lit + 17; d[i + 2] = 236 * lit + 19; d[i + 3] = 245 * a;
    }
    g.putImageData(img, 0, 0);
  });
  B = {
    foam,
    drop: drop('#e4f8f6', '#ffffff'), dropWarm: drop('#f2f4ec', '#ffd9a8'),
    bloom: radial([[0, '#f4fffdf0'], [.3, '#d8f4f2a8'], [.65, '#a9dfe238'], [1, '#a9dfe200']]),
    mist: radial([[0, '#cfeef0'], [.5, '#a9dfe255'], [1, '#a9dfe200']]),
    bead: radial([[0, '#ffffff'], [.25, '#eefcf9f0'], [.6, '#a9dfe290'], [1, '#a9dfe200']]),
    ring, fleck,
    // A falling curtain of sluice water: fine vertical strands, tileable top to bottom.
    curtain: canvas(32, 128, (g, w, h) => {
      for (let i = 0; i < 14; i++) {
        const x = 3 + (w - 6) * hash(i, 61), sw = .8 + 2.2 * hash(i, 62), a = .18 + .4 * hash(i, 63);
        const s = g.createLinearGradient(x - sw, 0, x + sw, 0); s.addColorStop(0, 'rgba(169,223,226,0)'); s.addColorStop(.5, `rgba(226,250,248,${a})`); s.addColorStop(1, 'rgba(169,223,226,0)');
        g.fillStyle = s; g.fillRect(x - sw, 0, sw * 2, h);
      }
      g.globalCompositeOperation = 'destination-in';
      const edge = g.createLinearGradient(0, 0, w, 0); edge.addColorStop(0, '#0000'); edge.addColorStop(.25, '#000'); edge.addColorStop(.75, '#000'); edge.addColorStop(1, '#0000'); g.fillStyle = edge; g.fillRect(0, 0, w, h);
    }),
  };
  return B;
}
const ga = ctx => typeof ctx.globalAlpha === 'number' ? ctx.globalAlpha : 1;
function stamp(ctx, img, x, y, w, h, a) { if (a <= .01) return; ctx.globalAlpha = a; ctx.drawImage(img, x - w / 2, y - h / 2, w, h); }
// One droplet in flight: launched at (x0, y0) after `delay` with velocity (vx, vy), gravity G, gone once it falls `land`
// below its launch line. Drawn as a streak along its current velocity, longer the faster it moves.
function droplet(ctx, b, t, x0, y0, vx, vy, G, land, size, a, warm) {
  if (t <= 0 || budget <= 0) return;
  const y = y0 + vy * t + .5 * G * t * t; if (y > y0 + land) return;
  const x = x0 + vx * t, wy = vy + G * t, sp = Math.hypot(vx, wy), len = Math.max(size * 1.3, Math.min(size * 6, sp * .022));
  budget--; ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(Math.atan2(wy, vx));
  if (len < size * 2) ctx.drawImage(b.bead, -size * .45, -size * .45, size * .9, size * .9);   // slow at the top of its arc: a round bead
  else ctx.drawImage(warm ? b.dropWarm : b.drop, -len + size * .6, -size / 2, len, size);
  ctx.restore();
}
// A ripple ring on the surface at (x, y): rx grows from r0, ry is the basin's perspective squash. Clipped at the water line.
function ripple(ctx, b, x, y, t, life, r0, r1, alpha, waterY) {
  if (t <= 0 || t >= life) return;
  const q = t / life, rx = r0 + (r1 - r0) * easeOut(q), ry = rx * .24;
  ctx.save(); if (waterY != null) { ctx.beginPath(); ctx.rect(x - rx - 4, waterY, rx * 2 + 8, y + ry + 8 - waterY); ctx.clip(); }
  stamp(ctx, b.ring, x, y, rx * 2, ry * 2, alpha * (1 - q) ** 1.4); ctx.restore();
}

// Under the paddle: what lands on the water (ripples and foam), for a pulse burst. `g` is the Tidewheel model.
export function splashUnder(ctx, g, e) {
  const b = bake(), t = e.age, base = ga(ctx), p = g.paddle, onPaddle = !e.blocked;
  const wl = onPaddle ? p.y + p.h / 2 + 1 : e.y + 12;          // the waterline under the burst
  if (wl < g.water.y + 3) return;                                // over the rafts or the wall: no water there to ripple
  ctx.save();
  const r0 = onPaddle ? p.w * .42 : 6, delay = onPaddle ? .03 : .12;
  ripple(ctx, b, e.x, wl, t - delay, .55, r0, r0 + 46, .95 * base, g.water.y);
  ripple(ctx, b, e.x, wl, t - delay - .13, .5, r0 * .8, r0 + 30, .6 * base, g.water.y);
  // Foam flecks spread along the surface and slow, perspective-flattened.
  for (let i = 0; i < 6; i++) {
    const tt = t - delay - .02 * i; if (tt <= 0) continue;
    const dir = i % 2 ? 1 : -1, v = 30 + 40 * hash(i, 5), d = (onPaddle ? p.w * .38 : 3) + v * (1 - Math.exp(-3 * tt)) / 3;
    const s = 5 + 4 * hash(i, 6);
    stamp(ctx, b.fleck, e.x + dir * d, wl + (hash(i, 7) - .5) * 6 + 1, s, s * .45, .8 * base * clamp01(1 - tt / .55));
  }
  ctx.restore();
}
// Over the paddle and balls: the white water, the crown and the spray. On the paddle the shot flattens into white water
// that slides off both ends of the deck while a crown of short sheets and droplets climbs off it; a ball-blocked shot
// bursts round the ball.
export function splashOver(ctx, g, e) {
  const b = bake(), t = e.age, base = ga(ctx), p = g.paddle, onPaddle = !e.blocked, seed = Math.round(e.x * 7 + e.y * 3) % 97;
  const x0 = e.x, y0 = onPaddle ? p.y - p.h / 2 + 1 : e.y;
  ctx.save();
  const m = 40 + 70 * easeOut(t / .5);
  stamp(ctx, b.mist, x0, y0 - 8, m, m * .55, .28 * base * clamp01(1 - t / .5));
  if (onPaddle) {
    crown(ctx, b, x0, y0, t, base, seed);
    const fw = 14 + 44 * easeOut(t / .16), fa = .95 * base * clamp01(1 - (t - .08) / .28);
    stamp(ctx, b.foam, x0, y0 - fw * .16, fw, fw * .5, fa);
    for (let k = 0; k < 2; k++) {   // the sheet running off each end of the deck
      const dir = k ? 1 : -1;
      const d = 6 + (p.w * .5 + 8) * easeOut(t / .32), sw = 16 + 16 * easeOut(t / .3);
      stamp(ctx, b.foam, x0 + dir * d, y0 - 2 + 10 * clamp01((Math.abs(x0 + dir * d - p.x) - p.w / 2) / 14), sw, sw * .42, .8 * base * clamp01(1 - (t - .1) / .3));
    }
  } else {
    const fw = 10 + 34 * easeOut(t / .18);
    stamp(ctx, b.foam, x0, y0 + 12 * easeOut(t / .4), fw * (1 + .4 * clamp01(t / .4)), fw * .7, .85 * base * clamp01(1 - (t - .04) / .24) ** 1.2);
  }
  stamp(ctx, b.bloom, x0, y0 - 3, 8 + 20 * easeOut(t / .1), (8 + 20 * easeOut(t / .1)) * .7, .7 * base * clamp01(1 - t / .14));
  const n = onPaddle ? 26 : 20;
  for (let i = 0; i < n; i++) {
    const r1 = hash(i, seed + 1), r2 = hash(i, seed + 2), r3 = hash(i, seed + 3);
    let a, v;
    if (onPaddle) { const side = i % 2 ? 1 : -1, crownDrop = i % 4 !== 0; a = -Math.PI / 2 + side * (crownDrop ? .35 + .75 * r1 : .25 * r1); v = crownDrop ? 120 + 110 * r2 : 170 + 120 * r2; }
    else { a = r1 * TAU; v = 70 + 150 * r2; }
    const sx = x0 + Math.cos(a) * (onPaddle ? 12 : 5), sy = onPaddle ? y0 - 3 : y0 + Math.sin(a) * 5;
    droplet(ctx, b, t - .04 * r3, sx, sy, Math.cos(a) * v, Math.sin(a) * v * (onPaddle ? 1 : .8) - (onPaddle ? 0 : 40), 840, onPaddle ? 8 + 10 * r1 : 14 + 8 * r2, 1 + 2.2 * r3 * r3, base * .95 * clamp01(1 - t / .6) ** .7, i % 5 === 0);
  }
  ctx.restore();
}
// The crown: eight short translucent sheets thrown up round the rim of a perspective ellipse, the far ones dimmer and drawn
// first, leaning out as the rim widens, then slumping and thinning as they break into the droplets above.
function crown(ctx, b, x0, y0, t, base, seed) {
  const rise = Math.sin(Math.PI * clamp01(t / .34)), fade = clamp01(1 - (t - .18) / .18); if (rise <= .02 || fade <= 0) return;
  const rx = 12 + 22 * easeOut(t / .3), ry = rx * .24;
  ctx.save();
  for (let pass = 0; pass < 2; pass++) for (let i = 0; i < 8; i++) {
    const th = (i + .5) / 8 * TAU + hash(i, seed + 21) * .4, front = Math.sin(th) > 0; if (front !== (pass === 1)) continue;
    const bx = x0 + Math.cos(th) * rx, by = y0 + Math.sin(th) * ry, hgt = (9 + 12 * hash(i, seed + 22)) * rise * (1 - .3 * Math.abs(Math.cos(th)));
    if (hgt < 1.5) continue;
    ctx.save(); ctx.globalAlpha = base * fade * (front ? .6 : .35); ctx.translate(bx, by); ctx.rotate(Math.cos(th) * (.3 + .45 * easeOut(t / .3)));
    const w = 5 + 3 * hash(i, seed + 23); ctx.drawImage(b.foam, -w / 2, -hgt * 1.1, w, hgt * 1.3); ctx.restore();
  }
  ctx.restore();
}
// The crusher's discharge: a short cone of spray along the shot and a cloud of mist at the claw tip.
export function muzzle(ctx, e) {
  const b = bake(), t = e.age, base = ga(ctx);
  ctx.save();
  stamp(ctx, b.mist, e.x, e.y, 24 + 70 * easeOut(t / .35), 24 + 70 * easeOut(t / .35), .9 * base * clamp01(1 - t / .4) ** .8);
  stamp(ctx, b.bloom, e.x + Math.cos(e.angle) * 6, e.y + Math.sin(e.angle) * 6, 16 + 26 * easeOut(t / .12), 16 + 26 * easeOut(t / .12), .95 * base * clamp01(1 - t / .2));
  for (let i = 0; i < 12; i++) {
    const a = e.angle + (i % 2 ? 1 : -1) * (.35 + .75 * hash(i, 41)), v = 90 + 150 * hash(i, 42);   // spray thrown off both sides of the jet
    droplet(ctx, b, t - .02 * hash(i, 43), e.x, e.y, Math.cos(a) * v, Math.sin(a) * v, 700, 90, 1.2 + 1.4 * hash(i, 44), base * clamp01(1 - t / .4), i % 4 === 0);
  }
  ctx.restore();
}
// A small wet spray where the ball strikes a wet brick: a few droplets thrown back off the face and a brief bloom.
export function wetHit(ctx, x, y, t, seed = 0, n = 6) {
  const b = bake(), base = ga(ctx);
  ctx.save();
  stamp(ctx, b.bloom, x, y, 6 + 14 * easeOut(t / .1), 6 + 14 * easeOut(t / .1), .6 * base * clamp01(1 - t / .14));
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (hash(i, seed + 11) - .5) * 3.2, v = 60 + 110 * hash(i, seed + 12);
    droplet(ctx, b, t, x, y, Math.cos(a) * v, Math.sin(a) * v, 760, 30, 1 + 1.2 * hash(i, seed + 13), base * clamp01(1 - t / .4), i % 3 === 0);
  }
  ctx.restore();
}
// The pulse's trailing water: streaks behind the shot in its own frame (+y is its direction of travel).
export function pulseTrail(ctx, age) {
  const b = bake(), base = ga(ctx);
  for (let i = 0; i < 4; i++) {
    if (budget <= 0) return;
    const x = Math.sin(age * 19 + i * 1.7) * 3.2, y = -14 - i * 7, len = 9 - i, w = 2.6 - i * .4;
    budget--; ctx.save(); ctx.globalAlpha = base * .7 ** (i + 1); ctx.translate(x, y); ctx.rotate(Math.PI / 2); ctx.drawImage(b.drop, -len * .8, -w / 2, len, w); ctx.restore();
  }
  ctx.globalAlpha = base;
}
// Sluice water pouring from (x, top) into the basin at `bottom`: a scrolling strand curtain, white water where it lands and
// a few drops kicked back up off the surface.
export function pour(ctx, x, top, bottom, time, strength, seed = 0) {
  const b = bake(), base = ga(ctx), H = bottom - top; if (H <= 2 || strength <= 0) return;
  ctx.save(); ctx.beginPath(); ctx.rect(x - 8, top, 16, H); ctx.clip(); ctx.globalAlpha = base * strength * .85;
  const tile = 40, off = (time * 160 + seed * 17) % tile;
  for (let y = top - tile + off; y < bottom; y += tile) ctx.drawImage(b.curtain, x - 6, y, 12, tile + .5);
  ctx.restore();
  ctx.save();
  stamp(ctx, b.bloom, x, bottom, 26, 9, .7 * base * strength);
  stamp(ctx, b.mist, x, bottom - 3, 34, 16, .35 * base * strength);
  for (let i = 0; i < 3; i++) {
    const cyc = .45, t = (time + i * .15 + seed * .07) % cyc, k = Math.floor((time + i * .15 + seed * .07) / cyc), a = -Math.PI / 2 + (hash(k * 3 + i, seed + 71) - .5) * 2;
    droplet(ctx, b, t, x + (hash(k, i + 72) - .5) * 6, bottom - 1, Math.cos(a) * 60, Math.sin(a) * 80, 700, 2, 1.1, base * strength * .8, false);
  }
  ctx.restore();
}
export const tideBaked = () => bake();
