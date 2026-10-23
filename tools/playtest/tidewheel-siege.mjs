// Headless playthrough of Tidewheel Siege (src/fantasy/tidewheel-siege.js): the shared aiming bot (aim-bot.mjs) plays all
// four stages and the script reports, per stage, the time taken, balls lost, continues, knock-downs and whether it
// finished. The same bot plays the one-screen Tidewheel (the chapter as it was) and the Vault (src/vault.js) for comparison.
//
//   node tools/playtest/tidewheel-siege.mjs [--difficulty medium] [--seeds 8] [--phone ios|android] [--json out.json] [--no-vault]
//
// The bot takes a continue on every loss (as many as needed), so "won" is the run reaching the end and "clean" is a win with
// no continue: the clean rate is the win rate a player without continues would see.
import { writeFileSync } from 'node:fs';
import { aimBot, rng } from './aim-bot.mjs';

globalThis.Image ??= class { complete = true; naturalWidth = 1; width = 1024; height = 768; decode() { return Promise.resolve(); } };
const nullContext = () => { const f = new Proxy(function () {}, { get: () => f, apply: () => f, set: () => true }); return f; };
globalThis.document ??= { createElement: () => ({ getContext: nullContext, width: 0, height: 0 }) };
const { TidewheelSiege } = await import('../../src/fantasy/tidewheel-siege.js');
const { Tidewheel, raftPoint } = await import('../../src/fantasy/tidewheel.js');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const difficulty = arg('difficulty', 'medium'), seeds = +arg('seeds', 8), phone = arg('phone', 'ios'), out = arg('json', null);
const PHONES = { ios: { height: 700, paddleY: 584.6, arenaH: 729, scale: 393 / 360 }, android: { height: 751, paddleY: 641, arenaH: 785, scale: 412 / 360 } };
const CAP = 900;   // seconds of game time per run

function targetsOf(m) {
  const T = [];
  if (m.siege) {
    for (const b of m.blocks) if (b.hp > 0) T.push({ x: b.x + b.w / 2, y: b.y + b.h / 2, w: b.prize || b.bonus ? .5 : 1 });
    for (const b of m.bricks) if (b.hp > 0) { const r = m.rafts[b.raft], c = raftPoint(r, b.lx + b.w / 2, b.ly + b.h / 2); T.push({ x: c.x, y: c.y, w: b.prize ? .6 : 1 }); }
    const v = m.villain; if (!v.hidden && !v.ghost && m.stage >= 1) T.push({ x: v.footX, y: v.footY - 70, w: m.stage === 3 ? 4 : 1.5 });
  } else {
    for (const b of m.bricks) if (b.hp > 0) { const r = m.rafts[b.raft], c = raftPoint(r, b.lx + b.w / 2, b.ly + b.h / 2); T.push({ x: c.x, y: c.y, w: 1 }); }
    T.push({ x: m.villain.footX, y: m.villain.footY - 70, w: 3 });
  }
  return T;
}
function play(Model, seed) {
  const R = rng(seed), saved = Math.random; Math.random = R;
  try {
    const m = new Model({ width: 360, ...PHONES[phone], difficulty }), dt = 1 / 120, p = m.paddle, bot = aimBot(R);
    let continues = 0, floods = 0;
    const stages = [];
    let stageAt = 0, stageLives = m.ballsLost ?? 0, stageKd = 0, stageIdx = m.stage ?? 0, stageCont = 0, stageFlood = 0;
    const close = finished => { stages.push({ stage: stageIdx + 1, time: +(m.time - stageAt).toFixed(1), ballsLost: m.ballsLost !== undefined ? m.ballsLost - stageLives : null, continues: continues - stageCont, floods: floods - stageFlood, knockdowns: (m.knockdowns ?? 0) - stageKd, finished }); };
    for (let i = 0; i < CAP / dt; i++) {
      if (m.state === 'lost') { continues++; if (m.loss === 'flood') floods++; m.continued = false; m.continue(); }
      if (m.state !== 'play') break;
      if (m.siege && m.stage !== stageIdx) { close(true); stageIdx = m.stage; stageAt = m.time; stageLives = m.ballsLost; stageKd = m.knockdowns; stageCont = continues; stageFlood = floods; }
      if (m.phase === 'card') m.skipCard();
      if ((m.phase === 'serve' || m.phase === 'hook') && m.balls.some(b => b.caught)) m.launch(-Math.PI / 2 + (R() - .5) * .9);
      if (m.canActivate?.('anchor') && m.villain.stage && /Windup/.test(m.villain.stage)) m.activate('anchor');
      const x = bot({ balls: m.balls.filter(b => !b.caught && !b.dead), paddle: p, left: 12, right: m.width - 12, targets: targetsOf(m), threats: (m.pulses || []).filter(q => !q.reflected) });
      m.setTarget(x);
      m.update(dt);
      if (process.env.TRACE && m.siege && i % 2400 === 0) console.log(`  t ${m.time.toFixed(0)} S${m.stage + 1} ${m.phase} left ${m.requiredLeft()} hp ${m.pool.hp}/${m.pool.maxHP} water ${m.water.y | 0}/${m.water.limit | 0} lives ${m.lives}`);
    }
    if (m.siege) close(m.state === 'won');
    return { seed, won: m.state === 'won', time: +m.time.toFixed(1), continues, floods, ballsLost: m.ballsLost ?? null, knockdowns: m.knockdowns ?? 0, stages, stars: m.starFlags?.(), pearls: m.pearls, valves: m.valvesShut };
  } finally { Math.random = saved; }
}

// The Vault with the same bot: aim at the bricks, the princess's cell and the serpent's head.
async function playVault(seed) {
  const { Vault } = await import('../../src/vault.js');
  const R = rng(seed), saved = Math.random; Math.random = R;
  try {
    const P = PHONES[phone], l = new Vault(360, P.arenaH, P.scale, difficulty), dt = 1 / 120, bot = aimBot(R);
    l.wardCoachSeen = true; l.aimReadySeen = true;
    let continues = 0, lost = 0;
    for (let i = 0; i < CAP / dt; i++) {
      if (l.state === 'lost') { continues++; l.continueRun(); }
      if (l.state !== 'play') break;
      if (l.aim) { l.aim.angle = l.aim.serve ? (R() - .5) * .9 : 0; l.ptr.down = false; l.release(); }
      l.focus = 0;   // the bot does not use Focus catches
      const G = l.grid, T = [];
      if (G) for (let r = 0; r < G.rows; r++) for (let c = 0; c < G.cols; c++) { const v = G.cells[r * G.cols + c]; if (v && !G.unpierceable.includes(v)) T.push({ x: G.ox + (c + .5) * G.cw, y: G.oy + (r + .5) * G.ch, w: 1 }); }
      T.push({ x: l.prisonX, y: l.floorY - 24, w: Math.max(4, T.length * .25) });
      const head = l.snakePoints?.()[0]; if (head) T.push({ x: head.x, y: head.y, w: Math.max(2, T.length * .1) });
      const balls = l.balls.filter(b => !b.dead && !b.caught), lives = l.lives;
      const x = bot({ balls, paddle: { x: l.paddle.x, y: l.paddle.y + l.paddle.h / 2, w: l.paddle.w, h: l.paddle.h }, left: l.left, right: l.right, targets: T, threats: (l.bolts || []).filter(b => !b.dead) });
      Object.assign(l.ptr, { down: true, x, lastX: x, y: l.paddle.y, anchor: x, padAnchor: x });
      l.update(dt);
      if (l.lives < lives) lost++;
    }
    return { seed, won: l.state === 'won', time: +l.t.toFixed(1), continues, ballsLost: lost };
  } finally { Math.random = saved; }
}

const siege = [], today = [], vault = [];
for (let s = +(arg('first', 1)); s <= seeds; s++) {
  siege.push(play(TidewheelSiege, s * 7919)); today.push(play(Tidewheel, s * 7919));
  if (!process.argv.includes('--no-vault')) vault.push(await playVault(s * 7919));
}
const mean = a => a.length ? +(a.reduce((n, v) => n + v, 0) / a.length).toFixed(1) : null;
const rate = R => `won ${R.filter(r => r.won).length}/${R.length}, clean (no continue) ${R.filter(r => r.won && !r.continues).length}/${R.length}, mean ${mean(R.map(r => r.time))}s, continues ${mean(R.map(r => r.continues))}, balls lost ${mean(R.map(r => r.ballsLost))}`;
console.log(`Tidewheel Siege, ${difficulty}, ${phone}, ${seeds} seeds (shared aiming bot, continues taken)`);
for (const r of siege) console.log(`  seed ${r.seed}: ${r.won ? 'WON' : 'not finished'} in ${r.time}s, continues ${r.continues} (flood ${r.floods}), kd ${r.knockdowns}, pearls ${r.pearls}, valves ${r.valves} | ` + r.stages.map(s => `S${s.stage} ${s.time}s lost ${s.ballsLost} cont ${s.continues} kd ${s.knockdowns}${s.finished ? '' : ' (unfinished)'}`).join(' | '));
const per = [0, 1, 2, 3].map(i => { const S = siege.map(r => r.stages[i]).filter(Boolean); return { stage: i + 1, reached: S.length, finished: S.filter(s => s.finished).length, time: mean(S.map(s => s.time)), ballsLost: mean(S.map(s => s.ballsLost)), continues: mean(S.map(s => s.continues)), floods: S.reduce((n, s) => n + s.floods, 0), knockdowns: S.reduce((n, s) => n + s.knockdowns, 0) }; });
console.log('per stage (mean):'); for (const s of per) console.log(`  stage ${s.stage}: reached ${s.reached}/${seeds}, finished ${s.finished}, time ${s.time}s, balls lost ${s.ballsLost}, continues ${s.continues} (flood losses ${s.floods}), knock-downs ${s.knockdowns}`);
console.log(`siege: ${rate(siege)}`);
console.log(`today (one screen): ${rate(today)}`);
if (vault.length) console.log(`vault: ${rate(vault)}`);
if (out) writeFileSync(out, JSON.stringify({ difficulty, phone, seeds, per, siege, today, vault }, null, 2));
