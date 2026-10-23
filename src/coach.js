// First-time coaching under the paddle: serve aim, Focus aim (Arena chapters) and the Sweet-Spot Ram.
// One glossy chip at a time, in the strip between the paddle and the Kit orb, so it never covers the ball's path.
// The show/stop rules are pure (pickCoach) and persist through the store; drawing is code-drawn (chip, thumb, fx-kit gems).
import { store } from './prefs.js';
const ga = g => typeof g.globalAlpha === 'number' ? g.globalAlpha : 1;   // the current alpha (test stubs have none)
import { text, rrect, drawGem, capsule, FONT } from './gfx.js';
import { Tutorial, STEPS, COUNT } from './tutorial.js';

export const COACH = {
  serves: 3,        // the serve coach shows until the player has served this many times (lifetime)
  catches: 2,       // Focus coaching stops after this many Focus catches (lifetime)
  landSoon: .8,     // "hold still" shows when a ball will reach the paddle within this many seconds
  linger: 1,        // a chip stays this long after its moment passes, so a short moment is still readable
  fade: .18,
  aimHud: 3.5,      // the one-time "AIM charges" label under the HUD gems
};

// Copy: *word* is a highlighted keyword; '>' draws a small arrow.
export const COPY = {
  serve: 'Slide to *aim* · Lift to *serve*',
  'focus-hold': '*HOLD STILL* to catch & aim',
  'focus-aim': 'Slide to *aim* · Lift to *fire*',
  'ram-streak': 'Hit the *MIDDLE* ×3 > *RAM BALL*',
  'ram-armed': 'Next *middle* hit launches the *RAM!*',
};
const ICON = { serve: 'slide', 'focus-hold': 'hold', 'focus-aim': 'slide', 'ram-streak': 'pips', 'ram-armed': 'pips' };
// The ball-control tutorial's steps (src/tutorial.js) show through the same chip.
for (const st of STEPS) { COPY['tut-' + st.id] = st.copy; ICON['tut-' + st.id] = st.icon; }

// The progress that ends each coach, read once per level and written as it happens.
export function coachProgress() {
  return { serves: +store.get('coachServes') || 0, catches: +store.get('coachCatches') || 0, ram: !!store.get('coachRam'), aimHud: !!store.get('coachAimHud') };
}

// Which coach (if any) a moment calls for. s: { blocked, serveWaiting, focusAim, focusReady, landIn, streak, armed }.
// Priority: the aim the player is holding now, then the serve, then the Focus catch window, then the ram.
export function pickCoach(s, prog) {
  if (s.blocked) return null;
  if (s.focusAim) return prog.catches <= COACH.catches ? 'focus-aim' : null;   // the catch that just counted still gets its aim line
  if (s.serveWaiting) return prog.serves < COACH.serves ? 'serve' : null;
  if (s.focusReady && s.landIn < COACH.landSoon && prog.catches < COACH.catches) return 'focus-hold';
  if (!prog.ram && s.armed) return 'ram-armed';
  if (!prog.ram && s.streak > 0) return 'ram-streak';
  return null;
}

// Seconds until the first falling ball reaches the paddle top (Infinity when none is coming).
export function landIn(balls, paddleY) {
  let t = Infinity;
  for (const b of balls) if (!b.dead && !b.caught && b.vy > 1) { const d = (paddleY - b.r - b.y) / b.vy; if (d >= 0 && d < t) t = d; }
  return t;
}

export class Coach {
  constructor() { this.prog = coachProgress(); this.kind = null; this.a = 0; this.since = 0; this.until = 0; this.time = 0; this.aimHudUntil = 0; this.tut = null; this.tutEnded = false; this.tutSeen = false; this.skipRect = null; }
  // The ball-control tutorial (src/tutorial.js): on while it has steps left. A level starts it on a first play or a replay.
  startTutorial() { this.tut = new Tutorial(); this.tutEnded = false; this.tutSeen = false; }
  skipTutorial() { this.tut?.skip(); }
  get tutorial() { return this.tut?.active ? this.tut : null; }
  // Events from the levels.
  served() { this.prog.serves++; store.set('coachServes', this.prog.serves); this.tut?.served(); }
  caught() { this.prog.catches++; store.set('coachCatches', this.prog.catches); }
  ramLaunched() { if (!this.prog.ram) { this.prog.ram = true; store.set('coachRam', true); } this.tut?.ramLaunched(); }
  hit(offset) { this.tut?.hit(offset); }          // the ball met the paddle, offset -1..1 across it
  capsuleCaught() { this.tut?.caught(); }          // a good power-up capsule reached the paddle
  takeDrop() { return !!this.tut?.takeDrop(); }    // the tutorial wants a capsule dropped now
  // dt: real seconds. Keeps a chip up for COACH.linger after its moment, unless another one takes over or play stops.
  update(dt, s) {
    this.time += dt;
    let want = null;
    if (this.tutorial) this.tut.feed(dt, s);
    if (this.tut && !this.tut.active && !this.tutSeen) { this.tutSeen = true; this.tutEnded = true; }   // main.js reads tutEnded once
    if (this.tutorial) {   // the tutorial owns the chip: nothing else teaches while it runs
      const id = this.tut.shown(s);
      want = s.blocked ? null : id === 'ram' && s.armed ? 'ram-armed' : 'tut-' + id;
    } else want = pickCoach(s, this.prog);
    if (want === 'focus-hold' && !this.prog.aimHud) { this.prog.aimHud = true; store.set('coachAimHud', true); this.aimHudUntil = this.time + COACH.aimHud; }
    if (s.blocked) { this.until = 0; this.a = 0; this.kind = null; }   // the continue panel, the Ward coach or a cut-scene owns the screen
    if (want) { if (want !== this.kind) { this.kind = want; this.since = this.time; } this.until = this.time + (this.tutorial ? 9e9 : COACH.linger); }
    const on = !!this.kind && this.time < this.until;
    this.a = Math.max(0, Math.min(1, this.a + (on ? 1 : -1) * dt / COACH.fade));
    if (!on && this.a <= 0) this.kind = null;
    this.ramPulse = this.a > 0 && (this.kind === 'ram-streak' || this.kind === 'ram-armed' || this.kind === 'tut-ram');
    this.aimPulse = this.a > 0 && this.kind === 'focus-hold';
    if (s.blocked) this.aimHudUntil = Math.min(this.aimHudUntil, this.time);
  }
  // x: the paddle centre; y: just below the ram tray, in the caller's drawing space; s: the UI scale (CSS px per world unit).
  draw(g, x, y, s, extra = {}) {
    this.skipRect = null;
    if (!this.kind || this.a <= 0) return;
    const k = 1 / s, pop = Math.min(1, (this.time - this.since) / .22), e = 1 + 2.70158 * (pop - 1) ** 3 + 1.70158 * (pop - 1) ** 2;
    const w = coachChip(g, null, 0, 0, k, COPY[this.kind], ICON[this.kind], this.time, extra);
    const cx = Math.max(w / 2 + 10 * k, Math.min((extra.width || 360) - w / 2 - 10 * k, x));
    g.save(); g.globalAlpha = ga(g) * this.a; g.translate(cx, y + 18 * k); g.scale(.9 + .1 * e, .9 + .1 * e);
    coachChip(g, g, 0, 0, k, COPY[this.kind], ICON[this.kind], this.time, extra);
    g.restore();
    if (this.tutorial) this.drawTutorialBar(g, cx, y + 18 * k, k, extra);
  }
  // Under the tutorial chip: one dot per step, and a small Skip pill. skipRect is where the pill is, in the caller's space.
  drawTutorialBar(g, cx, cy, k, extra) {
    const n = COUNT, gap = 9 * k, y = cy + 25 * k, i = this.tut.i, W = extra.width || 360;
    g.save(); g.globalAlpha = ga(g) * .95;
    const sw = 46 * k, sh = 17 * k, sx = Math.min(W - sw - 8 * k, cx + n * gap / 2 + 14 * k), sy = y - sh / 2;
    for (let d = 0; d < n; d++) {
      const x = cx - (n - 1) * gap / 2 - 30 * k + d * gap, done = d < i, now = d === i;
      g.fillStyle = done ? '#9ff7ec' : now ? '#ffe3a1' : 'rgba(255,255,255,0.28)'; g.beginPath(); g.arc(x, y, (now ? 3.2 : 2.5) * k, 0, 7); g.fill();
    }
    g.fillStyle = 'rgba(12,17,30,0.8)'; rrect(g, sx, sy, sw, sh, sh / 2); g.fill();
    g.strokeStyle = 'rgba(214,163,95,0.5)'; g.lineWidth = k; rrect(g, sx + .5 * k, sy + .5 * k, sw - k, sh - k, sh / 2); g.stroke();
    text(g, 'Skip', sx + sw / 2, y + .5 * k, 10.5 * k, '#e8eef8', 'center');
    g.restore();
    this.skipRect = { x: sx, y: sy, w: sw, h: sh };
  }
  // The one-time label under the HUD's AIM gems (Arena chapters).
  drawAimHud(g, x, y, s) {
    const left = this.aimHudUntil - this.time; if (left <= 0) return;
    const a = Math.min(1, left / .3, (COACH.aimHud - left) / .2), k = 1 / s;
    g.save(); g.globalAlpha = ga(g) * a;
    label(g, x, y, k, '*AIM* charges: hold still to catch');
    g.restore();
  }
}

// ---------- drawing ----------
function segments(str) { return str.split(/(\*[^*]+\*|>)/).filter(Boolean).map(t => t === '>' ? { arrow: true } : t[0] === '*' ? { t: t.slice(1, -1), hi: true } : { t }); }
function measure(g, segs, size) {
  g.font = `${size}px ${FONT}`;
  return segs.reduce((w, sg) => w + (sg.arrow ? size * .9 : g.measureText(sg.t).width), 0);
}
function line(g, segs, x, y, size, lo, hi) {
  let cx = x;
  for (const sg of segs) {
    if (sg.arrow) { arrow(g, cx + size * .45, y, size * .32, 0, hi); cx += size * .9; continue; }
    g.font = `${size}px ${FONT}`; const w = g.measureText(sg.t).width;
    text(g, sg.t, cx, y, size, sg.hi ? hi : lo, 'left'); cx += w;
  }
}
// A filled, glossy chip: dark enamel with a soft top sheen and a thin warm rim (the Gatehouse banner's finish).
function plate(g, x, y, w, h) {
  g.fillStyle = 'rgba(0,0,0,0.35)'; rrect(g, x + 1, y + 3, w, h, h / 2); g.fill();
  const pg = g.createLinearGradient(0, y, 0, y + h); pg.addColorStop(0, 'rgba(34,46,66,0.95)'); pg.addColorStop(1, 'rgba(12,17,30,0.95)');
  g.fillStyle = pg; rrect(g, x, y, w, h, h / 2); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.08)'; rrect(g, x + h * .3, y + 2, w - h * .6, h * .36, h * .18); g.fill();
  g.strokeStyle = 'rgba(214,163,95,0.55)'; g.lineWidth = 1; rrect(g, x + .5, y + .5, w - 1, h - 1, (h - 1) / 2); g.stroke();
}
// Returns the chip width; draws it centred on (x, y) when out is a context.
function coachChip(g, out, x, y, k, copy, icon, t, extra) {
  const size = 13 * k, segs = segments(copy), tw = measure(g, segs, size), iw = 34 * k, h = 28 * k, w = tw + iw + 22 * k;
  if (!out) return w;
  plate(g, x - w / 2, y - h / 2, w, h);
  const ix = x - w / 2 + 8 * k + iw / 2;
  if (icon === 'slide') thumbIcon(g, ix, y, k, t, 'slide');
  else if (icon === 'hold') thumbIcon(g, ix, y, k, t, 'hold');
  else if (icon === 'lift') liftIcon(g, ix, y, k, t);
  else if (icon === 'edges' || icon === 'centre') paddleIcon(g, ix, y, k, t, icon);
  else if (icon === 'capsule') { const c = capsule('wide'); g.drawImage(c, ix - 15 * k, y - 7 * k + Math.sin(t * 4) * 2 * k, 30 * k, 13.5 * k); }
  else pipsIcon(g, ix, y, k, t, extra.lit ?? 0, extra.gem || 'pip_gold');
  line(g, segs, x - w / 2 + 12 * k + iw, y + .5 * k, size, '#e8eef8', extra.hi || '#9ff7ec');
  return w;
}
function label(g, x, y, k, copy) {
  const size = 10.5 * k, segs = segments(copy), w = measure(g, segs, size) + 16 * k, h = 18 * k;
  plate(g, x - w / 2, y - h / 2, w, h);
  line(g, segs, x - w / 2 + 8 * k, y + .5 * k, size, '#e8eef8', '#e3b6ff');
}
// A filled arrowhead pointing along angle a.
export function arrow(g, x, y, r, a, colour) {
  g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = colour;
  g.beginPath(); g.moveTo(r, 0); g.lineTo(-r * .7, -r * .85); g.lineTo(-r * .35, 0); g.lineTo(-r * .7, r * .85); g.closePath(); g.fill(); g.restore();
}
// A glossy thumb tip seen from behind. 'slide': it rocks left and right between two chevrons, then lifts.
// 'hold': it rests pressed, with a soft warm glow under the pad that breathes.
export function thumbIcon(g, x, y, k, t, mode) {
  let dx = 0, dy = 0, lift = 0;
  if (mode === 'slide') { const c = t % 2.4; if (c < 1.6) dx = Math.sin(c / 1.6 * Math.PI * 2) * 3.5 * k; else { lift = Math.sin((c - 1.6) / .8 * Math.PI); dy = -lift * 4 * k; } }
  if (mode === 'hold') {
    const b = .5 + .5 * Math.sin(t * 5), r = 14 * k;
    const gr = g.createRadialGradient(x, y + 6 * k, 0, x, y + 6 * k, r); gr.addColorStop(0, `rgba(227,182,255,${.7 + .3 * b})`); gr.addColorStop(1, 'rgba(227,182,255,0)');
    g.fillStyle = gr; g.fillRect(x - r, y + 6 * k - r, r * 2, r * 2);
  }
  if (mode === 'slide') {
    const a = lift > 0 ? .35 : .9, mint = `rgba(159,247,236,${a})`;
    arrow(g, x - 14 * k, y + 2 * k, 4 * k, Math.PI, mint); arrow(g, x + 14 * k, y + 2 * k, 4 * k, 0, mint);
    if (lift > 0) arrow(g, x, y - 12 * k - lift * 2 * k, 4 * k, -Math.PI / 2, `rgba(159,247,236,${.4 + .6 * lift})`);
  }
  const tx = x + dx, ty = y + dy + (mode === 'hold' ? 1.5 * k : 0), w = 10.5 * k, h = 17 * k;
  g.fillStyle = 'rgba(0,0,0,0.35)'; rrect(g, tx - w / 2 + .8 * k, ty - h / 2 + 1.6 * k, w, h, w / 2); g.fill();
  const sg = g.createLinearGradient(tx - w / 2, 0, tx + w / 2, 0); sg.addColorStop(0, '#f6cdb6'); sg.addColorStop(.55, '#ffe6d6'); sg.addColorStop(1, '#d59c84');
  g.fillStyle = sg; rrect(g, tx - w / 2, ty - h / 2, w, h, w / 2); g.fill();
  const ng = g.createLinearGradient(0, ty - h / 2, 0, ty); ng.addColorStop(0, '#fff8f2'); ng.addColorStop(1, '#f3d6c8');
  g.fillStyle = ng; rrect(g, tx - w * .3, ty - h / 2 + 1.4 * k, w * .6, h * .36, w * .25); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.75)'; rrect(g, tx - w * .22, ty - h / 2 + 2 * k, w * .2, h * .16, w * .1); g.fill();
}
// The thumb rising off the glass under an up arrow: lift to serve.
function liftIcon(g, x, y, k, t) {
  const c = (t % 1.2) / 1.2, up = c * c * (3 - 2 * c);
  arrow(g, x, y - 9 * k - up * 2 * k, 4 * k, -Math.PI / 2, `rgba(159,247,236,${.35 + .65 * up})`);
  g.save(); g.globalAlpha = ga(g) * (1 - Math.max(0, (c - .75) / .25)); g.translate(0, -up * 5 * k); thumbIcon(g, x, y + 3 * k, k, 0, 'press'); g.restore();
}
// A little paddle with the zone that matters lit: the two ends (sharp angle) or the middle third (straight up).
function paddleIcon(g, x, y, k, t, mode) {
  const w = 30 * k, h = 7 * k, px = x - w / 2, py = y + 4 * k, beat = .6 + .4 * Math.sin(t * 6);
  g.fillStyle = '#7d8ba3'; rrect(g, px, py, w, h, h / 2); g.fill();
  const lit = mode === 'edges' ? '255,201,138' : '159,247,236';
  g.fillStyle = `rgba(${lit},${.55 + .4 * beat})`;
  if (mode === 'edges') { rrect(g, px, py, w * .3, h, h / 2); g.fill(); rrect(g, px + w * .7, py, w * .3, h, h / 2); g.fill(); arrow(g, px + 1 * k, y - 4 * k, 3.6 * k, -Math.PI * .75, `rgba(${lit},.9)`); arrow(g, px + w - 1 * k, y - 4 * k, 3.6 * k, -Math.PI * .25, `rgba(${lit},.9)`); }
  else { g.fillRect(px + w / 3, py, w / 3, h); arrow(g, x, y - 5 * k, 4 * k, -Math.PI / 2, `rgba(${lit},.95)`); }
}
// Three fx-kit gem sockets, lit as the streak grows; all three beat while the ram waits.
const BLOOM = { pip_gold: '255,201,138', pip_rose: '255,158,192', pip_blue: '159,208,255' };
function pipsIcon(g, x, y, k, t, lit, gem) {
  for (let i = 0; i < 3; i++) {
    const on = i < lit, beat = on ? 1 : .55 + .45 * Math.max(0, Math.sin(t * 6 - i * .9)), px = x + (i - 1) * 10.5 * k, r = 8 * k;
    const gr = g.createRadialGradient(px, y, 0, px, y, r); gr.addColorStop(0, `rgba(${BLOOM[gem] || BLOOM.pip_gold},${on ? .6 : .2 * beat})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(px - r, y - r, r * 2, r * 2);
    drawGem(g, 'pip_empty', px, y, 1.2 * k);
    drawGem(g, gem, px, y, 1.2 * k, on ? 1 : .35 * beat);
  }
}
