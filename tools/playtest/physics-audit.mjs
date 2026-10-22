#!/usr/bin/env node
// Headless physics audit: every level x difficulty x phone x seeded run with an ordinary ball (no powers),
// driven by a simple landing-predicting bot and by a no-input paddle. Flags NaN/out-of-bounds balls,
// tunnelling (ball centre ending a step inside a solid, or crossing the paddle face), stuck loops,
// flat angles and speed drift. Writes docs/validation/physics-audit/report.json; exits 1 on any failure.
//
//   node tools/playtest/physics-audit.mjs                     full audit
//   node tools/playtest/physics-audit.mjs --level carrier --difficulty hard --phone 393x852 --seed 3 --variant bot --trace
//   options: --seeds N (bot runs per cell, default 3), --idle-seeds N (no-input runs, default 1), --cap S (sim seconds, default 240), --jobs N
import { Worker, isMainThread, parentPort } from 'node:worker_threads';
import { availableParallelism } from 'node:os';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ADAPTERS, PHONES, deepest } from './audit-adapters.mjs';

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const LIMITS = {
  boundsEps: 0.5,        // ball centre beyond a wall/top line (ball more than its radius past it)
  depthEps: 0.5,         // ball centre this deep inside a solid
  stuckSeconds: 12,      // active ball, no paddle contact and no damage
  flatFraction: 0.15, flatSeconds: 4,
  speedLow: 0.5, speedHigh: 2,
  crawlWindow: 60, crawlFraction: 0.25, // px of expected travel per window; flag when the ball covers under 25% of it
};
const MAX_CONTINUES = 3; // the game's own continue (ad/purchase) keeps later phases in coverage
const TYPES = ['error', 'nan', 'bounds', 'tunnel', 'stuck', 'flat', 'speed'];

function lcg(seed) { let s = seed >>> 0; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 2 ** 32); }
const fold = (x, lo, hi) => { const w = hi - lo; if (w <= 0) return lo; let p = ((x - lo) % (2 * w) + 2 * w) % (2 * w); return lo + (p > w ? 2 * w - p : p); };

// ---------- one run ----------
export async function runOne({ level, difficulty, phone, seed, variant, cap, trace }, hook) {
  const adapter = ADAPTERS.find(a => a.name === level); await adapter.init();
  const previous = Math.random; Math.random = lcg(seed * 7919 + 17); // the level's own randomness
  const bot = lcg(seed * 104729 + 3); // the bot's error and serve choices
  const failures = [], counts = Object.fromEntries(TYPES.map(t => [t, 0]));
  let g, simT = 0; const wall0 = performance.now();
  try {
    g = adapter.make(PHONES.find(p => p.id === phone), difficulty);
    const prev = new WeakMap(), insideEp = new WeakMap(), flatSince = new WeakMap(), crawl = new WeakMap();
    let lastContinue = -Infinity;
    let lastProgress = g.progress(), idle = 0, serveSeen = null, serveDelay = 0, aimError = 0, wasDescending = false, prevSnap = null, prevPaddle = g.paddle();
    let contacts = 0, peakSpeed = 0, continues = 0, firstLoss = null, livesLost = 0, lives = g.lives;
    const phases = new Set();
    const flag = (type, detail) => {
      counts[type]++;
      if (failures.filter(f => f.type === type).length < 3) failures.push({ type, t: +simT.toFixed(3), phase: g.level.phase, ...detail });
      if (trace) console.log(`[${simT.toFixed(3)}] ${type}`, JSON.stringify(detail));
    };
    while (simT < cap) {
      if (g.state === 'lost' && continues < MAX_CONTINUES) { firstLoss ??= simT; continues++; g.continue(); lives = g.lives; lastContinue = simT; }
      if (g.state !== 'play') break;
      phases.add(g.level.phase);
      // --- input ---
      const pad = g.paddle(), B = g.bounds();
      if (g.serving()) {
        if (serveSeen === null) { serveSeen = simT; serveDelay = variant === 'bot' ? 0.25 + bot() * 0.75 : 8.5; }
        if (simT - serveSeen >= serveDelay) g.serve(variant === 'bot' ? (bot() - 0.5) : 0);
      } else serveSeen = null;
      if (variant === 'bot') {
        let best = null;
        for (const b of g.balls()) if (g.active(b) && b.vy > 0) {
          const t = (pad.top - b.r - b.y) / b.vy; if (t >= 0 && (!best || t < best.t)) best = { t, b };
        }
        const descending = !!best;
        if (descending && !wasDescending) aimError = (bot() - 0.5) * 0.6 * pad.w; // new approach: fresh aim offset
        wasDescending = descending;
        let target;
        if (best) target = fold(best.b.x + best.b.vx * best.t, B.left + best.b.r, B.right - best.b.r) + aimError;
        else { const live = g.balls().filter(b => g.active(b)); target = live.length ? live.reduce((s, b) => s + b.x, 0) / live.length : pad.x; }
        // sidestep enemy fire that would reach the paddle line soon (the levels guarantee an escape lane)
        target = Math.max(B.left + pad.w / 2, Math.min(B.right - pad.w / 2, target)); // where the paddle can actually be
        const danger = (g.threats?.() || []).filter(q => q.vy > 0).map(q => { const t = (pad.top - q.y - q.r) / q.vy; return { t: Math.max(0, t), y: q.y - q.r, x: q.x + q.vx * Math.max(0, t), half: pad.w / 2 + q.r + 8 }; }).filter(d => d.y < pad.top + pad.h && d.t <= 1.2); // still above the paddle bottom
        if (danger.some(d => Math.abs(target - d.x) < d.half)) { // nearest paddle position clear of every imminent shot; else the least-soon hit
          const want = target, cost = x => Math.abs(x - want) + danger.reduce((c, d) => c + (Math.abs(x - d.x) < d.half ? 1e5 / (d.t + .05) : 0), 0);
          for (let x = B.left + pad.w / 2; x <= B.right - pad.w / 2; x += 3) if (cost(x) < cost(target)) target = x;
        }
        g.control(Math.max(B.left, Math.min(B.right, target)));
      } else g.control(null);

      const before = g.balls().filter(b => g.active(b)).map(b => ({ b, x: b.x, y: b.y, vy: b.vy }));
      hook?.('before', g, simT);
      const tf = g.timeFactor(); // ball time per real second for this step (hit-stop, Focus, SLOW)
      g.step(); simT += g.dt;
      hook?.('after', g, simT);

      // --- checks ---
      const snap = g.snapshot(), now = g.paddle(), bounds = g.bounds();
      for (const { b, h, x, y } of g.engulfed?.() || []) if (!insideEp.has(b)) // a collider appeared or jumped onto the ball between steps
        insideEp.set(b, { cause: 'engulfed', max: h.depth, flagged: false, at: { x: +x.toFixed(2), y: +y.toFixed(2) } });
      for (const b of g.balls()) {
        if (![b.x, b.y, b.vx, b.vy].every(Number.isFinite)) { flag('nan', { ball: { x: b.x, y: b.y, vx: b.vx, vy: b.vy } }); continue; }
        if (!g.active(b)) { insideEp.delete(b); flatSince.delete(b); crawl.delete(b); prev.delete(b); continue; }
        const speed = Math.hypot(b.vx, b.vy), ball = { x: +b.x.toFixed(2), y: +b.y.toFixed(2), vx: +b.vx.toFixed(1), vy: +b.vy.toFixed(1), r: b.r };
        peakSpeed = Math.max(peakSpeed, speed / g.nominal);
        if (b.x < bounds.left - LIMITS.boundsEps || b.x > bounds.right + LIMITS.boundsEps || b.y < bounds.top - LIMITS.boundsEps || b.y > bounds.bottom + 60) flag('bounds', { ball, bounds });
        // tunnelling: ball centre inside a solid at the end of the step. An episode starts at any depth (its cause is
        // judged then) and fails once deeper than depthEps; it ends when the centre is back outside.
        const hit = snap && deepest(snap, b);
        if (hit) {
          let ep = insideEp.get(b);
          if (!ep) {
            // arena: checked against the geometry the step itself resolved, so the ball went in ("entered");
            // fantasy models: entered if the previous step's geometry already held this point, else it moved onto the ball
            const wasIn = g.engulfed ? hit : prevSnap && deepest(prevSnap, b), p = prev.get(b);
            insideEp.set(b, ep = { cause: wasIn ? 'entered' : 'engulfed', max: 0, flagged: false, at: p && { x: +p.x.toFixed(2), y: +p.y.toFixed(2) } });
          }
          ep.max = Math.max(ep.max, hit.depth);
          if (!ep.flagged && ep.max > LIMITS.depthEps) {
            ep.flagged = true;
            flag('tunnel', { subtype: ep.cause, collider: hit.id, depth: +hit.depth.toFixed(2), from: ep.at, ball, afterContinue: simT - lastContinue < 0.25 });
          }
        } else if (snap) insideEp.delete(b);
        // crawl: a live ball whose actual path is far shorter than its velocity says (embedded, re-colliding at t=0)
        const p0 = prev.get(b), cw = crawl.get(b) || { expected: 0, actual: 0 };
        cw.expected += speed * g.dt * tf; if (p0) cw.actual += Math.hypot(b.x - p0.x, b.y - p0.y);
        if (cw.expected >= LIMITS.crawlWindow) {
          if (cw.actual < cw.expected * LIMITS.crawlFraction) flag('stuck', { subtype: 'crawl', moved: +cw.actual.toFixed(1), expected: +cw.expected.toFixed(1), ball, afterContinue: simT - lastContinue < 0.25 });
          cw.expected = cw.actual = 0;
        }
        crawl.set(b, cw);
        // paddle face crossing: centre went from above the paddle top to below it, well inside the paddle span
        const p = prev.get(b);
        if (p && !now.stunned && !prevPaddle.stunned && b.vy > 0 && p.y < prevPaddle.top && b.y >= now.top) {
          const lo = Math.max(prevPaddle.x - prevPaddle.w / 2, now.x - now.w / 2) + 1, hi = Math.min(prevPaddle.x + prevPaddle.w / 2, now.x + now.w / 2) - 1;
          if (p.x > lo && p.x < hi && b.x > lo && b.x < hi) flag('tunnel', { subtype: 'paddle', collider: 'paddle', ball, paddle: { x: +now.x.toFixed(2), top: now.top, w: now.w } });
        }
        // flat angle
        if (speed > 1 && Math.abs(b.vy) < speed * LIMITS.flatFraction) {
          if (!flatSince.has(b)) flatSince.set(b, simT);
          else if (simT - flatSince.get(b) > LIMITS.flatSeconds) { flag('flat', { ball, seconds: +(simT - flatSince.get(b)).toFixed(2) }); flatSince.set(b, Infinity); }
        } else flatSince.delete(b);
        // speed
        if (speed < g.nominal * LIMITS.speedLow || speed > g.nominal * LIMITS.speedHigh) flag('speed', { ball, ratio: +(speed / g.nominal).toFixed(3) });
        prev.set(b, { x: b.x, y: b.y });
      }
      // paddle contacts: a ball that was descending near the paddle is now rising
      for (const q of before) if (q.vy > 0 && q.b.vy < 0 && q.b.y > now.top - q.b.r - 24) contacts++;
      const active = g.balls().some(b => g.active(b)), progress = g.progress();
      if (progress !== lastProgress || before.some(q => q.vy > 0 && q.b.vy < 0 && q.b.y > now.top - q.b.r - 24)) { lastProgress = progress; idle = 0; }
      else if (active) { idle += g.dt; if (idle > LIMITS.stuckSeconds) { flag('stuck', { subtype: 'loop', seconds: LIMITS.stuckSeconds, balls: g.balls().filter(b => g.active(b)).map(b => ({ x: +b.x.toFixed(1), y: +b.y.toFixed(1), vx: +b.vx.toFixed(1), vy: +b.vy.toFixed(1) })) }); idle = -Infinity; } }
      prevSnap = snap; prevPaddle = now;
      if (g.lives < lives) livesLost += lives - g.lives; lives = g.lives;
    }
    const outcome = g.state === 'won' ? 'win' : g.state === 'lost' ? 'lose' : 'timeout';
    return { level, difficulty, phone, seed, variant, outcome, wallMs: Math.round(performance.now() - wall0), time: +simT.toFixed(2), livesLost, continues, firstLoss: firstLoss && +firstLoss.toFixed(2), phases: [...phases], contacts, peakSpeed: +peakSpeed.toFixed(3), counts, failures, reason: g.level.reason || g.level.loss || '' };
  } catch (e) {
    return { level, difficulty, phone, seed, variant, outcome: 'error', time: 0, livesLost: 0, contacts: 0, counts: { ...counts, error: 1 }, failures: [{ type: 'error', t: +(simT || 0).toFixed(3), error: String(e.stack || e).split('\n').slice(0, 4).join(' | ') }] };
  } finally { Math.random = previous; }
}

// ---------- worker ----------
if (!isMainThread) {
  parentPort.on('message', async job => { parentPort.postMessage(job ? await runOne(job) : null); if (!job) process.exit(0); });
}

// ---------- main ----------
const round = v => v === null ? null : +v.toFixed(1);
const median = a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
function args() {
  const o = {}, a = process.argv.slice(2);
  for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { const k = a[i].slice(2); o[k] = a[i + 1] && !a[i + 1].startsWith('--') ? a[++i] : true; }
  return o;
}
async function main() {
  const o = args(), cap = +(o.cap || 240), seeds = +(o.seeds || 3), idleSeeds = +(o['idle-seeds'] ?? 1);
  const pick = (list, key) => o[key] ? list.filter(v => String(o[key]).split(',').includes(String(v))) : list;
  const levels = pick(ADAPTERS.map(a => a.name), 'level'), diffs = pick(DIFFICULTIES, 'difficulty'), phones = pick(PHONES.map(p => p.id), 'phone');
  const jobs = [];
  for (const level of levels) for (const difficulty of diffs) for (const phone of phones) for (const variant of pick(['bot', 'idle'], 'variant')) {
    const n = variant === 'bot' ? Math.min(seeds, o.seeds ? Infinity : ADAPTERS.find(a => a.name === level).seeds ?? Infinity) : idleSeeds;
    for (const seed of o.seed ? String(o.seed).split(',').map(Number) : Array.from({ length: n }, (_, i) => i + 1)) jobs.push({ level, difficulty, phone, seed, variant, cap, trace: !!o.trace });
  }
  const started = Date.now(), results = [];
  if (o.trace || jobs.length === 1) for (const j of jobs) results.push(await runOne(j));
  else {
    const width = Math.min(+(o.jobs || availableParallelism()), jobs.length); let next = 0;
    // longest-first keeps the tail short (rough wall cost per run, measured)
    const COST = { relay: 20, tidewheel: 6, orbital: 5, vault: 2, carrier: 1.5, mooncoil: 1, frost: .7, bellforge: .5, gatehouse: 1 };
    jobs.sort((a, b) => (COST[b.level] || 1) * (b.variant === 'bot' ? 1 : .7) - (COST[a.level] || 1) * (a.variant === 'bot' ? 1 : .7));
    await Promise.all(Array.from({ length: width }, () => new Promise((resolve, reject) => {
      const w = new Worker(fileURLToPath(import.meta.url));
      const feed = () => w.postMessage(next < jobs.length ? jobs[next++] : null);
      w.on('message', r => { if (r) { results.push(r); process.stderr.write(`\r${results.length}/${jobs.length} runs`); } feed(); });
      w.on('error', reject); w.on('exit', resolve); feed();
    })));
    process.stderr.write('\n');
  }

  // ---------- report ----------
  const cells = [];
  for (const level of levels) for (const difficulty of diffs) for (const phone of phones) for (const variant of ['bot', 'idle']) {
    const rs = results.filter(r => r.level === level && r.difficulty === difficulty && r.phone === phone && r.variant === variant).sort((a, b) => a.seed - b.seed);
    if (!rs.length) continue;
    const failures = {};
    for (const t of TYPES) {
      const hit = rs.filter(r => r.counts[t] > 0);
      if (hit.length) { const f = hit[0].failures.find(f => f.type === t) || {}; failures[t] = { runs: hit.length, events: hit.reduce((n, r) => n + r.counts[t], 0), first: { seed: hit[0].seed, ...f } }; }
    }
    const wins = rs.filter(r => r.outcome === 'win');
    cells.push({ level, difficulty, phone, variant, runs: rs.length, wins: wins.length, losses: rs.filter(r => r.outcome === 'lose').length, timeouts: rs.filter(r => r.outcome === 'timeout').length,
      errors: rs.filter(r => r.outcome === 'error').length, medianTime: round(median(rs.map(r => r.time))), medianWinTime: round(median(wins.map(r => r.time))), medianLivesLost: median(rs.map(r => r.livesLost)),
      failures, cleanWins: rs.filter(r => r.outcome === 'win' && !r.continues).length,
      runs_detail: rs.map(({ seed, outcome, wallMs, time, livesLost, continues, firstLoss, phases, contacts, peakSpeed, counts, failures, reason }) => ({ seed, outcome, wallMs, time, livesLost, continues, firstLoss, phases, contacts, peakSpeed, reason, counts: Object.fromEntries(Object.entries(counts).filter(([, n]) => n)), failures })) });
  }
  const totals = Object.fromEntries(TYPES.map(t => [t, results.reduce((n, r) => n + r.counts[t], 0)]));
  const report = { config: { cap, seeds, idleSeeds, limits: LIMITS, phones: PHONES, difficulties: diffs, levels }, totals, failed: Object.values(totals).some(n => n > 0), cells };
  if (!o['no-write']) {
    const dir = new URL('../../docs/validation/physics-audit/', import.meta.url); mkdirSync(dir, { recursive: true });
    writeFileSync(new URL('report.json', dir), JSON.stringify(report, null, 1) + '\n');
  }
  const pad = (s, n) => String(s).padEnd(n);
  console.log(pad('level', 10) + pad('diff', 7) + pad('phone', 9) + pad('var', 5) + pad('runs', 5) + pad('W(clean)/L/T', 12) + pad('medT', 7) + 'failures (type runs/events first seed@t)');
  for (const c of cells) {
    const f = Object.entries(c.failures).map(([t, v]) => `${t} ${v.runs}/${v.events} s${v.first.seed}@${v.first.t}${v.first.subtype ? ':' + v.first.subtype : ''}${v.first.collider ? '(' + v.first.collider + ')' : ''}`).join('; ');
    console.log(pad(c.level, 10) + pad(c.difficulty, 7) + pad(c.phone, 9) + pad(c.variant, 5) + pad(c.runs, 5) + pad(`${c.wins}(${c.cleanWins})/${c.losses}/${c.timeouts}${c.errors ? '/E' + c.errors : ''}`, 12) + pad(c.medianTime, 7) + (f || 'ok'));
  }
  for (const c of cells) for (const v of Object.values(c.failures).slice(0, 1))
    console.log(`repro: node tools/playtest/physics-audit.mjs --level ${c.level} --difficulty ${c.difficulty} --phone ${c.phone} --variant ${c.variant} --seed ${v.first.seed} --trace`);
  console.log(`totals ${TYPES.map(t => `${t}=${totals[t]}`).join(' ')}  runs=${results.length}  ${((Date.now() - started) / 1000).toFixed(1)}s`);
  process.exitCode = report.failed ? 1 : 0;
}
if (isMainThread && process.argv[1] === fileURLToPath(import.meta.url)) await main();
