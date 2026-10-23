// Headless playthrough of Tidewheel Siege (src/fantasy/tidewheel-siege.js): an aiming bot plays all four stages and the
// script reports, per stage, the time taken, balls lost, knock-downs and whether it finished. The same bot plays the
// one-screen Tidewheel (the chapter as it was) for comparison.
//
//   node tools/playtest/tidewheel-siege.mjs [--difficulty medium] [--seeds 6] [--phone ios|android] [--json out.json]
//
// The bot reads the ball like a player: it predicts where a falling ball meets the paddle line (folding off the walls),
// picks a live brick (or Nerra while she holds the hub), and offsets the paddle so the bounce heads at it, with a little
// hand error. It sidesteps water pulses about to land, uses Kit's anchor when charged, and takes the shared continue on a
// loss (as many as needed), so "finished" means the run reached the end with continues counted.
import { writeFileSync } from 'node:fs';
import { TidewheelSiege } from '../../src/fantasy/tidewheel-siege.js';
import { Tidewheel } from '../../src/fantasy/tidewheel.js';
import { raftPoint } from '../../src/fantasy/tidewheel.js';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const difficulty = arg('difficulty', 'medium'), seeds = +arg('seeds', 6), phone = arg('phone', 'ios'), out = arg('json', null);
const PHONES = { ios: { height: 700, paddleY: 584.6 }, android: { height: 751, paddleY: 641 } };
const CAP = 900;   // seconds of game time per run

function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function targetsOf(m) {
  const T = [];
  if (m.siege) {
    for (const b of m.blocks) if (b.hp > 0) T.push({ x: b.x + b.w / 2, y: b.y + b.h / 2, w: b.prize || b.bonus ? .5 : 1 });
    for (const b of m.bricks) if (b.hp > 0) { const r = m.rafts[b.raft], c = raftPoint(r, b.lx + b.w / 2, b.ly + b.h / 2); T.push({ x: c.x, y: c.y, w: b.prize ? .6 : 1 }); }
    const v = m.villain; if (!v.hidden && !v.ghost && m.stage >= 2) T.push({ x: v.footX, y: v.footY - 70, w: m.stage === 3 ? 4 : 1.5 });
  } else {
    for (const b of m.bricks) if (b.hp > 0) { const r = m.rafts[b.raft], c = raftPoint(r, b.lx + b.w / 2, b.ly + b.h / 2); T.push({ x: c.x, y: c.y, w: 1 }); }
    T.push({ x: m.villain.footX, y: m.villain.footY - 70, w: 3 });
  }
  return T;
}
function play(Model, seed) {
  const R = rng(seed), saved = Math.random; Math.random = R;
  try {
    const m = new Model({ width: 360, ...PHONES[phone], difficulty }), dt = 1 / 120, p = m.paddle;
    let target = null, lastVy = 0, err = 0, continues = 0;
    const stages = [];
    let stageAt = 0, stageLives = 0, stageKd = 0, stageIdx = m.stage ?? 0, stageCont = 0;
    const close = finished => { stages.push({ stage: stageIdx + 1, time: +(m.time - stageAt).toFixed(1), ballsLost: m.ballsLost !== undefined ? m.ballsLost - stageLives : null, continues: continues - stageCont, knockdowns: (m.knockdowns ?? 0) - stageKd, finished }); };
    stageLives = m.ballsLost ?? 0;
    for (let i = 0; i < CAP / dt; i++) {
      if (m.state === 'lost') { continues++; m.continued = false; m.continue(); }
      if (m.state !== 'play') break;
      if (m.siege && m.stage !== stageIdx) { close(true); stageIdx = m.stage; stageAt = m.time; stageLives = m.ballsLost; stageKd = m.knockdowns; stageCont = continues; }
      if (m.phase === 'card') m.skipCard();
      if ((m.phase === 'serve' || m.phase === 'hook') && m.balls.some(b => b.caught)) m.launch(-Math.PI / 2 + (R() - .5) * .9);
      if (m.canActivate?.('anchor') && m.villain.stage && /Windup/.test(m.villain.stage)) m.activate('anchor');
      const live = m.balls.filter(b => !b.caught && !b.dead);
      const b = live.filter(b => b.vy > 0).sort((a, c) => (p.y - a.y) / a.vy - (p.y - c.y) / c.vy)[0] || live[0];
      let x = p.x;
      if (b) {
        if (b.vy > 0 && lastVy <= 0 || !target) {   // a new descent: choose what to hit and how sloppy this catch is
          const T = targetsOf(m); let sum = T.reduce((n, t) => n + t.w, 0), k = R() * sum; target = T.find(t => (k -= t.w) <= 0) || T[0]; err = (R() - .5) * 16;
        }
        lastVy = b.vy;
        if (b.vy > 0) {
          const fold = x => { const w = m.width - 36, t = ((x - 18) % (2 * w) + 2 * w) % (2 * w); return 18 + (t > w ? 2 * w - t : t); };
          const aim = fold(b.x + b.vx * Math.max(0, (p.y - p.h / 2 - b.r - b.y) / b.vy));
          const ang = target ? Math.atan2(target.x - aim, p.y - target.y) : 0;
          x = aim - clamp(ang / 1.05, -.8, .8) * p.w / 2 + err;
        } else x = clamp(b.x, 60, 300);
      }
      for (const q of (m.pulses || []).filter(q => !q.reflected)) {   // sidestep a pulse that is about to land
        const eta = (p.y - p.h / 2 - q.r - q.y) / q.vy;
        if (eta > 0 && eta < .45) { const lane = q.x + q.vx * eta, clear = p.w / 2 + q.r + 8; if (Math.abs(x - lane) < clear && !(b && b.vy > 0 && (p.y - b.y) / b.vy < eta + .2)) x = lane + (x < lane ? -clear : clear); }
      }
      m.setTarget(clamp(x, 12 + p.w / 2, m.width - 12 - p.w / 2));
      m.update(dt);
      if (process.env.TRACE && m.siege && i % 2400 === 0) console.log(`  t ${m.time.toFixed(0)} S${m.stage + 1} ${m.phase} left ${m.requiredLeft()} blocks [${m.blocks.filter(b => b.hp > 0 && !b.prize).map(b => `${b.x | 0},${b.y | 0}`).join(' ')}] raft ${m.bricks.filter(b => b.hp > 0 && !b.prize).length} hp ${m.pool.hp}/${m.pool.maxHP} water ${m.water.y | 0}/${m.water.limit | 0}`);
    }
    if (m.siege) close(m.state === 'won');
    return { seed, won: m.state === 'won', time: +m.time.toFixed(1), continues, ballsLost: m.ballsLost ?? null, knockdowns: m.knockdowns ?? 0, stages, stars: m.starFlags?.(), pearls: m.pearls, valves: m.valvesShut };
  } finally { Math.random = saved; }
}

const siege = [], today = [];
for (let s = +(arg('first', 1)); s <= seeds; s++) { siege.push(play(TidewheelSiege, s * 7919)); today.push(play(Tidewheel, s * 7919)); }
const mean = a => a.length ? +(a.reduce((n, v) => n + v, 0) / a.length).toFixed(1) : null;
console.log(`Tidewheel Siege, ${difficulty}, ${phone}, ${seeds} seeds (bot with continues)`);
for (const r of siege) console.log(`  seed ${r.seed}: ${r.won ? 'WON' : 'not finished'} in ${r.time}s, continues ${r.continues}, kd ${r.knockdowns}, pearls ${r.pearls}, valves ${r.valves} | ` + r.stages.map(s => `S${s.stage} ${s.time}s lost ${s.ballsLost} kd ${s.knockdowns}${s.finished ? '' : ' (unfinished)'}`).join(' | '));
const per = [0, 1, 2, 3].map(i => { const S = siege.map(r => r.stages[i]).filter(Boolean); return { stage: i + 1, reached: S.length, finished: S.filter(s => s.finished).length, time: mean(S.map(s => s.time)), ballsLost: mean(S.map(s => s.ballsLost)), knockdowns: S.reduce((n, s) => n + s.knockdowns, 0) }; });
console.log('per stage (mean):'); for (const s of per) console.log(`  stage ${s.stage}: reached ${s.reached}/${seeds}, finished ${s.finished}, time ${s.time}s, balls lost ${s.ballsLost}, knock-downs ${s.knockdowns}`);
console.log(`siege: won ${siege.filter(r => r.won).length}/${seeds}, mean ${mean(siege.map(r => r.time))}s, continues ${mean(siege.map(r => r.continues))}`);
console.log(`today (one screen): won ${today.filter(r => r.won).length}/${seeds}, mean ${mean(today.map(r => r.time))}s, continues ${mean(today.map(r => r.continues))}`);
if (out) writeFileSync(out, JSON.stringify({ difficulty, phone, seeds, per, siege, today }, null, 2));
