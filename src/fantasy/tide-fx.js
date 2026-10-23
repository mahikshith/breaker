// Tidewheel water FX, drawn to sit in the basin plate's realistic water: a brief blue-white contact flash, curved
// translucent water sheets with a broken bright rim that peel outward and fray into glossy, motion-blurred droplets
// falling under gravity, thin foam lace on wet surfaces and a faint lit perspective ripple (only where the water lands on
// water). Every particle is evaluated in closed form from its effect's age
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
  // A water droplet streaking right, as one frame's motion blur: a translucent water-coloured tail and a glossy head (dark
  // rim, lit body, a hard highlight dot), the way a drop reads against dark water. Softened once with a canvas blur.
  const drop = (spec) => canvas(96, 24, (g, w, h) => {
    if ('filter' in g) g.filter = 'blur(1.2px)';
    const tail = g.createLinearGradient(4, 0, w - 12, 0); tail.addColorStop(0, 'rgba(95,169,184,0)'); tail.addColorStop(.6, 'rgba(110,190,204,.38)'); tail.addColorStop(1, 'rgba(150,214,222,.75)');
    g.fillStyle = tail; g.beginPath(); g.moveTo(4, h / 2 - 1.5); g.lineTo(w - 14, h / 2 - 6); g.lineTo(w - 14, h / 2 + 6); g.lineTo(4, h / 2 + 1.5); g.closePath(); g.fill();
    g.filter = 'none'; bead(g, w - 14, h / 2, 8, spec);
  });
  // A glossy bead centred at (x, y): deep teal rim, lit water body, white highlight up-left, faint caustic down-right.
  function bead(g, x, y, r, spec = '#ffffff') {
    const b = g.createRadialGradient(x - r * .3, y - r * .35, r * .1, x, y, r); b.addColorStop(0, '#d6f4f2'); b.addColorStop(.45, '#7cc8d2'); b.addColorStop(.8, '#2c7486'); b.addColorStop(1, 'rgba(14,52,66,0)');
    g.fillStyle = b; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    g.fillStyle = spec; g.beginPath(); g.ellipse(x - r * .35, y - r * .38, r * .26, r * .18, -.5, 0, TAU); g.fill();
    g.fillStyle = 'rgba(214,246,244,.55)'; g.beginPath(); g.ellipse(x + r * .3, y + r * .42, r * .3, r * .12, -.4, 0, TAU); g.fill();
  }
  // A water sheet thrown up off a stretch of surface (its foot spans 25-58% across the bottom) and leaning right as it
  // flares: a thin film, darker and denser at the foot and clearing toward the top, its face streaked with uneven flow lines. Its top is
  // not a clean edge: a broken bright rim that frays into a fringe of short jets, a few ending in beads.
  const sheet = canvas(80, 128, (g, w, h) => {
    const F = 20, R = 46;                               // a wide foot: the sheet climbs off a stretch of surface, not a point
    const top = (u) => [6 + 68 * u, 34 - 22 * u + 3 * Math.sin(u * 9.3) + 2 * Math.sin(u * 23.1)];   // the rim, left to right
    if ('filter' in g) g.filter = 'blur(.8px)';
    g.beginPath(); g.moveTo(F, h - 2); g.bezierCurveTo(22, 74, 17, 46, ...top(0));
    for (let u = .05; u <= 1.001; u += .05) g.lineTo(...top(u));
    g.bezierCurveTo(58, 36, 47, 74, R, h - 2); g.closePath();
    const body = g.createLinearGradient(33, h, 44, 10); body.addColorStop(0, 'rgba(10,52,66,.6)'); body.addColorStop(.35, 'rgba(26,92,110,.3)'); body.addColorStop(.8, 'rgba(90,168,182,.16)'); body.addColorStop(1, 'rgba(150,212,220,.22)');
    g.fillStyle = body; g.fill();
    g.save(); g.clip(); g.lineCap = 'round';
    // Flow lines: fine streaks of brighter water fanning from the foot up the face, uneven in strength and spacing.
    for (let i = 0; i < 8; i++) {
      const u = (i + .6 * hash(i, 90)) / 8, [tx, ty] = top(u), a = .05 + .14 * hash(i, 91) ** 2;
      g.strokeStyle = `rgba(206,242,242,${a})`; g.lineWidth = 1 + 2.2 * hash(i, 92); g.filter = 'blur(1.4px)';
      const fx = F + (R - F) * u; g.beginPath(); g.moveTo(fx, h); g.bezierCurveTo(fx + (hash(i, 89) - .5) * 8, h * .6, tx - (tx - fx) * .2, ty + 24, tx, ty + 3); g.stroke();
    }
    // Light through the curved film catches its flanks.
    g.filter = 'blur(3px)'; g.strokeStyle = 'rgba(190,236,238,.22)'; g.lineWidth = 7;
    g.beginPath(); g.moveTo(F, h); g.bezierCurveTo(22, 74, 17, 46, ...top(0)); g.stroke();
    g.beginPath(); g.moveTo(R, h); g.bezierCurveTo(47, 74, 58, 36, ...top(1)); g.stroke();
    g.restore();
    // The rim: a broken band of bright water, thicker where the sheet rolls, with gaps.
    g.filter = 'blur(.6px)'; g.lineCap = 'round';
    for (let k = 0; k < 7; k++) {
      const u0 = (k + .25 * hash(k, 95)) / 7, u1 = u0 + (.06 + .07 * hash(k, 96));
      g.strokeStyle = `rgba(238,252,250,${.35 + .5 * hash(k, 97)})`; g.lineWidth = .9 + 1.6 * hash(k, 98);
      g.beginPath(); g.moveTo(...top(u0)); for (let u = u0 + .02; u <= u1; u += .02) g.lineTo(...top(u)); g.stroke();
    }
    // The fringe: short jets pulled off the rim along the sheet's flare, uneven lengths; the longer ones end in a bead.
    for (let i = 0; i < 7; i++) {
      const u = (i + .8 * hash(i, 99)) / 7, [x, y] = top(u), ang = -Math.PI / 2 + (u - .45) * 1.3 + (hash(i, 100) - .5) * .4;
      const len = 3 + 10 * hash(i, 101) ** 1.5, ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len;
      const lg = g.createLinearGradient(x, y, ex, ey); lg.addColorStop(0, 'rgba(170,226,230,.6)'); lg.addColorStop(1, 'rgba(226,250,248,.85)');
      g.strokeStyle = lg; g.lineWidth = .8 + .8 * hash(i, 102); g.beginPath(); g.moveTo(x, y); g.lineTo(ex, ey); g.stroke();
      if (len > 8) { g.filter = 'none'; bead(g, ex, ey, 1.6 + 1.3 * hash(i, 93)); g.filter = 'blur(.6px)'; }
    }
    g.filter = 'none';
  });
  // Foam lace: a thin strip of bright flecks and fine filaments, the foam that settles on a wet surface.
  const lace = canvas(128, 16, (g, w, h) => {
    for (let i = 0; i < 46; i++) {
      const x = 4 + (w - 8) * hash(i, 81), y = h / 2 + (hash(i, 82) - .5) * (h - 6) * (1 - Math.abs(x / w - .5)), r = .6 + 1.4 * hash(i, 83) ** 2, a = .45 + .5 * hash(i, 84);
      g.fillStyle = `rgba(236,252,250,${a})`; g.beginPath(); g.ellipse(x, y, r * 1.6, r * .8, 0, 0, TAU); g.fill();
    }
    g.strokeStyle = 'rgba(220,246,244,.4)'; g.lineWidth = .7;
    for (let k = 0; k < 5; k++) { g.beginPath(); for (let x = 6; x < w - 6; x += 6) { const y = h / 2 + Math.sin(x * .21 + k * 1.7) * 3 * hash(k, 85) + (hash(x + k * 31, 86) - .5) * 2; x === 6 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); }
    g.globalCompositeOperation = 'destination-in';
    const edge = g.createLinearGradient(0, 0, w, 0); edge.addColorStop(0, '#0000'); edge.addColorStop(.15, '#000'); edge.addColorStop(.85, '#000'); edge.addColorStop(1, '#0000'); g.fillStyle = edge; g.fillRect(0, 0, w, h);
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
  B = {
    sheet, lace,
    drop: drop('#ffffff'), dropWarm: drop('#ffe2bc'),
    beadImg: canvas(24, 24, (g) => bead(g, 12, 12, 10)),
    flash: radial([[0, '#eefcffd8'], [.35, '#bfe6f0a0'], [.7, '#7cc0d040'], [1, '#7cc0d000']]),
    bloom: radial([[0, '#e6f8fbd0'], [.3, '#c4ebf0a0'], [.65, '#8fd0dc38'], [1, '#8fd0dc00']]),
    mist: radial([[0, '#cfeef0'], [.5, '#a9dfe255'], [1, '#a9dfe200']]),
    ring,
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
  if (len < size * 2) ctx.drawImage(b.beadImg, -size * .5, -size * .5, size, size);   // slow at the top of its arc: a round bead
  else ctx.drawImage(warm ? b.dropWarm : b.drop, -len + size * .45, -size / 2, len, size);
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
  ripple(ctx, b, e.x, wl, t - delay, .55, r0, r0 + 46, .5 * base, g.water.y);
  ripple(ctx, b, e.x, wl, t - delay - .13, .5, r0 * .8, r0 + 30, .3 * base, g.water.y);
  // Foam lace spreads along the surface and slows, perspective-flattened.
  for (let i = 0; i < 4; i++) {
    const tt = t - delay - .02 * i; if (tt <= 0) continue;
    const dir = i % 2 ? 1 : -1, v = 30 + 40 * hash(i, 5), d = (onPaddle ? p.w * .38 : 3) + v * (1 - Math.exp(-3 * tt)) / 3;
    const s = 12 + 8 * hash(i, 6);
    stamp(ctx, b.lace, e.x + dir * d, wl + (hash(i, 7) - .5) * 5 + 1, s, s * .14, .7 * base * clamp01(1 - tt / .55));
  }
  ctx.restore();
}
// Over the paddle and balls. The contact is a brief, small blue-white flash; the body of the splash is water: curved
// translucent sheets that rise off the contact, peel outward and thin away as they break into glossy droplets. On the
// paddle, foam lace settles on the deck and slides off both ends.
export function splashOver(ctx, g, e) {
  const b = bake(), t = e.age, base = ga(ctx), p = g.paddle, onPaddle = !e.blocked, seed = Math.round(e.x * 7 + e.y * 3) % 97;
  const x0 = e.x, y0 = onPaddle ? p.y - p.h / 2 + 1 : e.y + 10;   // on the water the sheets stand on the ripple
  ctx.save();
  if (onPaddle) {
    for (let k = 0; k < 2; k++) {   // lace on the deck, sliding to each end and spilling off it
      const dir = k ? 1 : -1, tt = t - .03; if (tt <= 0) continue;
      const d = 4 + (p.w * .5 + 6) * easeOut(tt / .4), x = x0 + dir * d, off = Math.max(0, Math.abs(x - p.x) - p.w / 2), w = 14 + 14 * easeOut(tt / .3);
      stamp(ctx, b.lace, x - dir * w * .3, y0 + Math.min(14, off * .9), w, 3.2, .85 * base * clamp01(1 - (tt - .25) / .3));
    }
    sheets(ctx, b, x0, y0, t, base, seed, SHEETS_PADDLE);
  } else sheets(ctx, b, x0, y0, t, base, seed, SHEETS_BURST);
  stamp(ctx, b.flash, x0, y0 - 2, 6 + 8 * easeOut(t / .05), (6 + 8 * easeOut(t / .05)) * (onPaddle ? .7 : 1), .7 * base * clamp01(1 - t / .08));
  const n = onPaddle ? 22 : 18;
  for (let i = 0; i < n; i++) {
    const r1 = hash(i, seed + 1), r2 = hash(i, seed + 2), r3 = hash(i, seed + 3);
    let a, v, sx, sy, delay;
    if (onPaddle) {   // most drops leave the sheets' lips as they break; a few go straight up
      const side = i % 2 ? 1 : -1, lip = i % 5 !== 0; a = -Math.PI / 2 + side * (lip ? .55 + .6 * r1 : .2 * r1); v = lip ? 100 + 100 * r2 : 150 + 100 * r2;
      sx = x0 + side * (lip ? 10 + 12 * r2 : 2); sy = y0 - (lip ? 10 + 8 * r1 : 3); delay = lip ? .1 + .1 * r3 : .02 * r3;
    } else { a = -Math.PI / 2 + (r1 - .5) * 2.8; v = 70 + 130 * r2; sx = x0 + Math.cos(a) * 7; sy = y0 - 6 - 8 * r3; delay = .06 + .08 * r3; }
    droplet(ctx, b, t - delay, sx, sy, Math.cos(a) * v, Math.sin(a) * v * (onPaddle ? 1 : .8) - (onPaddle ? 0 : 30), 820, onPaddle ? 10 + 14 * r1 : 16 + 8 * r2, 1.4 + 1.8 * r3 * r3, base * clamp01(1 - (t - delay) / .45) ** .6, i % 6 === 0);
  }
  ctx.restore();
}
// Sheet sets: [angle off vertical (rad, + leans right), height, width, delay, alpha]. Mirrored sheets peel left.
const SHEETS_PADDLE = [[-.36, 36, 25, 0, 1], [.4, 38, 26, .012, 1]];
const SHEETS_BURST = [[-.3, 28, 18, 0, .9], [.36, 26, 17, .015, .85]];
function sheets(ctx, b, x0, y0, t, base, seed, set) {
  for (let i = 0; i < set.length; i++) {
    const [ang, H, W, delay, alpha] = set[i], tt = t - delay; if (tt <= 0) continue;
    const rise = Math.sin(Math.PI * clamp01(tt / .32)) ** .7, fade = clamp01(1 - (tt - .14) / .2); if (rise < .03 || fade <= 0) continue;
    const h = H * rise * (.85 + .3 * hash(i, seed + 31)), w = W * (.45 + .75 * easeOut(tt / .26)), mirror = ang < 0 ? -1 : 1;
    ctx.save(); ctx.globalAlpha = base * alpha * fade; ctx.translate(x0, y0);
    ctx.rotate(ang + mirror * .3 * easeOut(tt / .3));   // the lip peels further outward as it climbs
    ctx.scale(mirror, 1); ctx.drawImage(b.sheet, -w * .3, -h, w, h); ctx.restore();
  }
}
// The crusher's discharge: a short cone of spray along the shot and a cloud of mist at the claw tip.
export function muzzle(ctx, e) {
  const b = bake(), t = e.age, base = ga(ctx);
  ctx.save();
  stamp(ctx, b.mist, e.x, e.y, 24 + 70 * easeOut(t / .35), 24 + 70 * easeOut(t / .35), .9 * base * clamp01(1 - t / .4) ** .8);
  stamp(ctx, b.flash, e.x + Math.cos(e.angle) * 6, e.y + Math.sin(e.angle) * 6, 12 + 14 * easeOut(t / .08), 12 + 14 * easeOut(t / .08), .85 * base * clamp01(1 - t / .14));
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
