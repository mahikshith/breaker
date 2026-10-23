// Headless playthrough of Gatehouse Siege (src/fantasy/gatehouse.js): an aiming bot plays all four stages and the script
// reports, per stage, the time taken, balls lost, continues, knock-downs and bell stuns, plus the carry-overs it earned.
// With --compare it also runs one plain tracking bot (the physics-audit adapters' surface, power-ups off) through
// Gatehouse Siege and through the Vault, so the two chapters are measured with the same hands.
//
//   node tools/playtest/gatehouse-siege.mjs [--difficulty medium] [--seeds 6] [--phone ios|android] [--compare] [--json out.json]
//
// The bot reads the ball like a player: it predicts where a falling ball meets the paddle line (folding off the walls),
// picks a target (a live brick, a chest, a housing, the winch wheel, Korr's murder hole or Korr himself) and offsets the
// paddle so the bounce heads at it, with a little hand error. It catches capsules when no ball is about to land, raises
// Kit's Ward when a bell is falling at it, and takes the shared continue on a loss (as many as needed), so "won" means the
// run reached the end with continues counted.
import { writeFileSync } from 'node:fs';
import { Gatehouse } from '../../src/fantasy/gatehouse.js';
import { ADAPTERS, PHONES as AUDIT_PHONES } from './audit-adapters.mjs';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const difficulty = arg('difficulty', 'medium'), seeds = +arg('seeds', 6), phone = arg('phone', 'ios'), out = arg('json', null), compare = process.argv.includes('--compare');
const PHONES = { ios: { height: 700, paddleY: 584.6 }, android: { height: 756.2, paddleY: 640.8 } };
const CAP = 1200;   // seconds of game time per run

function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function targetsOf(m) {
  const T = [], v = m.villain, bricks = m.bricks.filter(b => b.hp > 0);
  for (const b of bricks) T.push({ x: b.x + b.w / 2, y: b.y + b.h / 2, w: b.type === 'chest' ? 2 : b.gem ? 1.2 : 1 });
  for (const h of m.housings) if (h.hp > 0) T.push({ x: h.x + h.w / 2, y: h.y + h.h / 2, w: 3 });
  if (m.wheel) T.push({ x: m.wheel.x, y: m.wheel.y, w: 3 });
  if (m.slot && !v.gone && !v.escape) T.push({ x: m.slot.x + m.slot.w / 2, y: m.slot.y + 30, w: 2.5 });
  if (m.floor === 3 && v.body.length) T.push({ x: v.foot.x, y: v.foot.y - 50, w: bricks.length < m.board.cells.length / 2 ? 5 : 1.5 });
  return T;
}
function play(seed) {
  const R = rng(seed), saved = Math.random; Math.random = R;
  try {
    const m = new Gatehouse({ width: 360, ...PHONES[phone], difficulty }), dt = 1 / 120, p = m.paddle;
    let target = null, lastVy = 0, err = 0, continues = 0, stuns = 0;
    const stageCont = [0, 0, 0, 0], stageStuns = [0, 0, 0, 0], seen = new WeakSet();
    for (let i = 0; i < CAP / dt; i++) {
      if (m.state === 'lost') { continues++; stageCont[m.floor]++; m.continued = false; m.continue(); }
      if (m.state !== 'play') break;
      if (m.phase === 'card') m.skipCard();
      if (m.phase === 'serve' && m.balls.some(b => b.caught)) m.launch(-Math.PI / 2 + (R() - .5) * .9);
      if (m.bells.some(b => b.vy > 0 && b.y > p.y - 200 && Math.abs(b.x - p.x) < p.w) && m.canActivate('ward')) m.activate('ward');
      const live = m.balls.filter(b => !b.caught && !b.dead);
      const b = live.filter(b => b.vy > 0).sort((a, c) => (p.y - a.y) / a.vy - (p.y - c.y) / c.vy)[0] || live[0];
      let x = p.x;
      if (b) {
        if (b.vy > 0 && lastVy <= 0 || !target) {   // a new descent: choose what to hit and how sloppy this catch is
          const T = targetsOf(m); let sum = T.reduce((n, t) => n + t.w, 0), k = R() * sum; target = T.find(t => (k -= t.w) <= 0) || T[0]; err = (R() - .5) * 16;
        }
        lastVy = b.vy;
        if (b.vy > 0) {
          const fold = x => { const w = m.width - 12, t = ((x - 6) % (2 * w) + 2 * w) % (2 * w); return 6 + (t > w ? 2 * w - t : t); };
          const aim = fold(b.x + b.vx * Math.max(0, (p.y - b.r - b.y) / b.vy));
          const ang = target ? Math.atan2(target.x - aim, p.y - target.y) : 0;
          x = aim - clamp(ang / 1.05, -.8, .8) * p.w / 2 + err;
        } else x = clamp(b.x, 60, 300);
        // A capsule about to land, with no ball due before it: go and catch it.
        const eta = b.vy > 0 ? (p.y - b.y) / b.vy : Infinity, cap = m.capsules.filter(c => c.y > p.y - 140).sort((a, c) => c.y - a.y)[0];
        if (cap && eta > (p.y - cap.y) / cap.vy + .35) x = cap.x;
      }
      m.setTarget(clamp(x, 6 + p.w / 2, m.width - 6 - p.w / 2));
      m.update(dt);
      for (const e of m.effects) if (e.kind === 'paddle-stun' && !seen.has(e)) { seen.add(e); stuns++; stageStuns[m.floor]++; }
    }
    const stages = m.stageLog.map(s => ({ stage: s.stage + 1, time: s.time, ballsLost: s.ballsLost, continues: stageCont[s.stage], knockdowns: s.knockdowns, stuns: stageStuns[s.stage], finished: true }));
    if (m.state !== 'won') stages.push({ stage: m.floor + 1, time: +(m.time - m.stageStart.time).toFixed(1), ballsLost: m.ballsLost - m.stageStart.lives, continues: stageCont[m.floor], knockdowns: m.knockdowns - m.stageStart.knockdowns, stuns: stageStuns[m.floor], finished: false });
    return { seed, won: m.state === 'won', time: +m.time.toFixed(1), continues, ballsLost: m.ballsLost, knockdowns: m.knockdowns, stuns, stages, stars: m.state === 'won' ? 1 + m.starFlags().hoist + m.starFlags().knockdown : 0,
      carry: { hairpin: m.hairpin, rackSmashed: m.rackSmashed, ventJammed: m.ventJammed, hauled: m.hauled }, gems: m.gems, powers: [...m.powersSeen] };
  } finally { Math.random = saved; }
}

// The plain tracking bot on an audit adapter: follow the ball with a drifting offset, continue on a loss.
async function track(name, seed) {
  const ad = ADAPTERS.find(a => a.name === name); await ad.init();
  const R = rng(seed), saved = Math.random; Math.random = R;
  try {
    const L = ad.make(AUDIT_PHONES[phone === 'ios' ? 0 : 1], difficulty); let o = 0, continues = 0, lives = L.lives, lost = 0;
    for (let i = 0; i < CAP / L.dt && L.state !== 'won'; i++) {
      if (L.state === 'lost') { continues++; L.continue(); }
      if (L.serving()) L.serve((R() - .5) * .9);
      const b = L.balls().filter(q => L.active(q)).sort((a, c) => c.y - a.y)[0];
      if (R() < .01) o = (R() - .5) * 60;
      L.control(b ? b.x + o : null); L.step();
      if (L.lives < lives) lost += lives - L.lives; lives = L.lives;
    }
    return { name, seed, won: L.state === 'won', time: +L.time.toFixed(1), continues, ballsLost: lost };
  } finally { Math.random = saved; }
}

const runs = []; for (let s = 1; s <= seeds; s++) runs.push(play(s * 7919));
const mean = a => a.length ? +(a.reduce((n, v) => n + v, 0) / a.length).toFixed(1) : null;
console.log(`Gatehouse Siege, ${difficulty}, ${phone}, ${seeds} seeds (aiming bot with continues)`);
for (const r of runs) console.log(`  seed ${r.seed}: ${r.won ? 'WON' : 'not finished'} in ${r.time}s, ${r.stars}*, continues ${r.continues}, lost ${r.ballsLost}, kd ${r.knockdowns}, stuns ${r.stuns}, hairpin ${r.carry.hairpin}, rack ${r.carry.rackSmashed}, vent ${r.carry.ventJammed} | ` +
  r.stages.map(s => `S${s.stage} ${s.time}s lost ${s.ballsLost} kd ${s.knockdowns}${s.finished ? '' : ' (unfinished)'}`).join(' | '));
const per = [0, 1, 2, 3].map(i => { const S = runs.map(r => r.stages[i]).filter(Boolean); return { stage: i + 1, reached: S.length, finished: S.filter(s => s.finished).length, time: mean(S.map(s => s.time)), ballsLost: mean(S.map(s => s.ballsLost)), continues: mean(S.map(s => s.continues)), knockdowns: S.reduce((n, s) => n + s.knockdowns, 0), stuns: mean(S.map(s => s.stuns)) }; });
console.log('per stage (mean):'); for (const s of per) console.log(`  stage ${s.stage}: reached ${s.reached}/${seeds}, finished ${s.finished}, time ${s.time}s, balls lost ${s.ballsLost}, continues ${s.continues}, knock-downs ${s.knockdowns} total, stuns ${s.stuns}`);
const won = runs.filter(r => r.won).length;
console.log(`siege: won ${won}/${seeds} (${Math.round(won / seeds * 100)}%), mean ${mean(runs.map(r => r.time))}s, balls lost ${mean(runs.map(r => r.ballsLost))}, continues ${mean(runs.map(r => r.continues))}, stars ${mean(runs.map(r => r.stars))}, hairpin ${runs.filter(r => r.carry.hairpin).length}, rack ${runs.filter(r => r.carry.rackSmashed).length}, vent ${runs.filter(r => r.carry.ventJammed).length}`);
let cmp = null;
if (compare) {
  cmp = {};
  for (const name of ['gatehouse', 'vault']) { const R = []; for (let s = 1; s <= seeds; s++) R.push(await track(name, s * 7919)); cmp[name] = R;
    console.log(`tracking bot (no power-ups), ${name}: won ${R.filter(r => r.won).length}/${seeds}, mean ${mean(R.map(r => r.time))}s, balls lost ${mean(R.map(r => r.ballsLost))}, continues ${mean(R.map(r => r.continues))}`); }
}
if (out) writeFileSync(out, JSON.stringify({ difficulty, phone, seeds, per, runs, compare: cmp }, null, 2));
