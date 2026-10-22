import fs from 'node:fs';
import crypto from 'node:crypto';
import { Bellforge } from '../../../../src/fantasy/bellforge.js';
import { normal } from '../../../../tools/playtest/bellforge-policy.mjs';

const source = 'src/fantasy/bellforge.js';
const hash = path => crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex');
const out = process.env.OUT_DIR || 'out/physics-recheck/bellforge/model';
fs.mkdirSync(out, { recursive: true });
const result = { scope: 'Fresh deterministic model routes. Existing collision-forecast policy reads geometry and writes only through launch/setTarget/update and optional earned activate. Observational wrappers retain the original methods. No HP, resource, position, lives, actor or progression injection. Not human skill, DOM input or handset performance proof.',
  before: hash(source), policySHA256: hash('tools/playtest/bellforge-policy.mjs'), routes: [], complete: false };
const save = () => fs.writeFileSync(`${out}/report.json`, JSON.stringify(result, null, 2) + '\n');
const sizes = [['short', 700, 610], ['ios', 852 * 360 / 393, (852 - 126) * 360 / 393], ['android', 915 * 360 / 412, (915 - 126) * 360 / 412]];
for (const [device, height, paddleY] of sizes) for (const mode of ['easy', 'medium', 'hard']) for (const echo of [false, true]) {
  const g = new Bellforge({ height, paddleY, difficulty: mode });
  const row = { device, height, paddleY, mode, echo, firstBrick: null, firstBoss: null, firstFull: null, casts: [], returnedBellDamage: 0, maxLiveBells: 0 };
  const hitBrick = g.hitBrick, hitVillain = g.hitVillain;
  g.hitBrick = function (...args) { const old = args[0].hp; const value = hitBrick.apply(this, args); if (args[0].hp < old) row.firstBrick ??= this.time; return value; };
  g.hitVillain = function (...args) { const old = this.villain.hp; const value = hitVillain.apply(this, args); if (this.villain.hp < old) { row.firstBoss ??= this.time; if (args[1]) row.returnedBellDamage += old - this.villain.hp; } return value; };
  for (let i = 0; i < 180 * 120 && g.state === 'play'; i++) {
    if (g.charge >= 100) row.firstFull ??= g.time;
    if (echo && g.canActivate() && g.activate()) row.casts.push(g.time);
    normal(g);
    row.maxLiveBells = Math.max(row.maxLiveBells, g.bells.length);
  }
  Object.assign(row, { state: g.state, reason: g.reason, time: g.time, hp: g.villain.hp, lives: g.lives,
    liftSteps: g.lumi.steps, allowance: g.rules.mistakes, charge: g.charge, chargeBank: g.chargeBank,
    score: g.score, continued: g.continued, brickHP: g.bricks.reduce((n, b) => n + b.hp, 0) });
  result.routes.push(row); save();
  console.log(device, mode, echo ? 'echo' : 'ordinary', row.state, row.time.toFixed(3), 'lives', row.lives, 'steps', row.liftSteps, 'casts', row.casts.length);
}
const idle = new Bellforge();
for (let n = 0; n < 180 * 120 && idle.state === 'play'; n++) idle.update(1 / 120);
result.noInput = { state: idle.state, reason: idle.reason, time: idle.time, hp: idle.villain.hp, lives: idle.lives, steps: idle.lumi.steps, active: idle.active };
result.after = hash(source); result.complete = true; save();
if (result.before !== result.after) throw new Error('Bellforge source changed during routes');
