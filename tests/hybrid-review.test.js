import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { makeBall } from '../src/physics.js';
import { difficulty, DIFFICULTY_IDS } from '../src/difficulty.js';

globalThis.Image = class { complete = true; naturalWidth = 1; width = 512; height = 768; decode() { return Promise.resolve(); } };
const { Carrier } = await import('../src/carrier.js');
const devices = [[729, 393 / 360], [785, 412 / 360]];
const level = (mode = 'medium', H = 729, s = 393 / 360) => new Carrier(360, H, s, mode);
const advance = (l, seconds) => { for (let i = 0; i < Math.round(seconds * 120); i++) l.update(1 / 120); };
const hit = (l, id) => l.hitTarget(id, { x: 180, y: 250, r: l.ballRadius });
// Lifecycle setup is explicit; victory evidence from public-input browser runs is separate.
function freeAll(l) { for (const c of l.crew) while (c.hp > 0) hit(l, c.id); }
function secondWave(l) { freeAll(l); advance(l, 5.6); assert.equal(l.phase, 'carrier'); assert.equal(l.encounterWave, 2); }

function mainKeyUp(l, key) {
  const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  const start = source.indexOf("addEventListener('keyup'");
  const listener = source.slice(start, source.indexOf("addEventListener('resize'", start));
  let handler;
  runInNewContext(listener, { addEventListener: (_, callback) => { handler = callback; }, level: l, scene: 'level', suspended: false, document: { hidden: false } });
  handler({ key });
}

test('a real final normal-ball contact wins the deadline tie in either manifest and suppresses a later miss', () => {
  for (const mode of ['medium', 'hard']) for (const [H, s] of devices) for (const wave of [1, 2]) {
    const l = level(mode, H, s); if (wave === 2) secondWave(l); l.release();
    const target = l.crew[2], r = target.art.rect;
    for (const c of l.crew) if (c !== target) { c.hp = 0; c.releasedAt = l.clock - 2; c.secured = true; }
    target.hp = 1; l.waveRemaining = 1 / 240; l.hitStop = 0; l.lives = 1;
    l.balls = [makeBall(r.x + r.w / 2, r.y + r.h + l.ballRadius + .2, 0, -345, l.ballRadius),
      makeBall(l.right - 3, l.drainY + 8, 0, 345, l.ballRadius)];
    l.update(1 / 120);
    assert.equal(target.hp, 0); assert.equal(l.phase, 'escape'); assert.equal(l.state, 'play');
    assert.equal(l.lives, 1); assert(l.balls.every(b => b.caught && !b.dead));
  }
});

test('a held previous-wave pointer or Space cannot launch the replacement serve without a fresh press', () => {
  for (const input of ['pointer', 'space', 'space-during-rebuild']) {
    const l = level(); l.release();
    if (input === 'pointer') l.pointerDown(180, l.H - 30);
    else if (input === 'space') l.key(' ', true);
    freeAll(l); advance(l, 2); assert.equal(l.phase, 'rebuild');
    if (input === 'space-during-rebuild') l.key(' ', true);
    advance(l, 3.6); assert.equal(l.phase, 'carrier'); assert(l.aim?.serve);
    if (input === 'pointer') l.pointerUp(); else mainKeyUp(l, ' ');
    assert(l.aim?.serve, `${input} release is stale`); assert.equal(l.waveLaunched, false);
    if (input === 'pointer') { l.pointerDown(180, l.H - 30); l.pointerUp(); }
    else { l.key(' ', true); mainKeyUp(l, ' '); }
    assert.equal(l.aim, null, `${input} new deliberate input still works`); assert(l.waveLaunched);
  }
});

test('second-wave Continue keeps archived identities, damaged modules and a consumed cache exactly once', () => {
  const l = level('hard'); secondWave(l); l.release();
  const archive = JSON.stringify(l.archivedCrew), ids = l.crew.map(c => c.id), cache = l.bricks.find(b => b.payload);
  hit(l, cache.id); const payloads = l.drops.map(d => d.kind); assert.equal(payloads.length, 1);
  hit(l, l.crew[0].id); hit(l, l.guns[0].id); const hull = l.carrier.hp, gunHP = l.guns[0].hp, charge = l.paddle.charge;
  l.waveRemaining = .001; l.updateLevel(.01); assert.equal(l.reason, 'Carrier jumped');
  l.continueRun(); assert.equal(l.encounterWave, 2); assert.equal(l.waveRemaining, 30);
  assert.equal(JSON.stringify(l.archivedCrew), archive); assert.deepEqual(l.crew.map(c => c.id), ids);
  assert.equal(l.crew[0].hp, l.rules.lockHP-1); assert.equal(l.carrier.hp, hull); assert.equal(l.guns[0].hp, gunHP);
  assert.equal(cache.hp, 0); assert.equal(l.paddle.charge, charge); assert.deepEqual(l.drops.map(d => d.kind), payloads);
  hit(l, cache.id); assert.deepEqual(l.drops.map(d => d.kind), payloads); assert.equal(l.paddle.charge, charge);
  l.release(); const grace = l.enemyGraceUntil; assert.equal(grace, l.clock + 6);
  l.hitStop = 1; advance(l, .5); assert(Math.abs(l.waveRemaining - 29.5) < 1e-9); assert.equal(l.enemyGraceUntil, grace);
  assert.equal(l.raid, null); assert.equal(l.fighters.length, 0);
});

test('destroying the hull in wave two cancels the jump without resetting earned manifest progress', () => {
  const l = level('medium'); secondWave(l); l.release();
  const archive = JSON.stringify(l.archivedCrew); hit(l, l.crew[0].id); const hp = l.crew[0].hp;
  l.carrier.hp = 1; hit(l, 'carrier'); l.waveRemaining = .001; advance(l, .2);
  assert.equal(l.state, 'play'); assert.equal(l.phase, 'carrier'); assert.equal(l.carrier.hp, 0);
  assert.equal(l.crew[0].hp, hp); assert.equal(JSON.stringify(l.archivedCrew), archive);
  freeAll(l); advance(l, 3.7); assert.equal(l.state, 'won'); assert.equal(l.encounterWave, 2);
  assert.equal(l.carrier.hp, 0); assert.equal(l.result().lines[1][1], '10 / 10');
});

test('a docking or frozen-breach transition cannot teleport the moving fighter and its collision', () => {
  for (const mode of ['medium', 'hard']) for (const [H, s] of devices) {
    const l = level(mode, H, s); l.release(); l.aim = null; l.balls[0].caught = true;
    let docking = 0;
    for (let i = 0; i < (l.rules.firstSquad + 12) * 120 && l.state === 'play'; i++) {
      const dt = 1 / 120, poses = new Map(l.fighters.map(f => [f.id, { stage: f.stage, p: l.fighterPose(f, l.clock + dt) }]));
      l.updateLevel(dt, dt);
      for (const f of l.fighters) {
        const old = poses.get(f.id); if (!old || old.stage !== 'approach' || !['hold', 'extract', 'breach'].includes(f.stage)) continue;
        const p = l.fighterPose(f); docking++;
        assert(Math.hypot(old.p.x - p.x, old.p.y - p.y) < .01, `${mode} docking keeps its visible endpoint`);
      }
      if (docking) break;
    }
    assert(docking > 0, 'actual mission state reaches docking without a direct stage transition');
    const raid = l.raid, f = l.fighters.find(f => f.id === raid.fighterId), target = l.crew.find(c => c.id === raid.targetId);
    f.lockPose = l.fighterPose(f); f.stage = raid.stage = 'breach'; l.clock += 1.7;
    const before = l.fighterPose(f);
    for (const b of l.bricks) b.hp = 0;
    l.attack = null; l.bolts = []; l.nextAttack = l.clock; l.updateRaid();
    assert.equal(f.stage, 'extract'); assert.equal(raid.targetId, target.id);
    const after = l.fighterPose(f);
    assert(Math.hypot(before.x - after.x, before.y - after.y) < .01, `${mode} release from locked breach keeps its pose`);
  }
});

function menuPreferences(values, query = '') {
  // Execute the actual dependency-free initialization block from main, rather than a duplicate migration.
  const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  const block = source.slice(source.indexOf('let selectedDifficulty ='), source.indexOf("let scene = 'menu'"));
  const saved = [], sandbox = { LEVELS: [0,1,2,3,4], difficulty, DIFFICULTY_IDS, URLSearchParams, location: { search: query }, previews: [],
    store: { get: k => values[k], set: (k, v) => saved.push([k, v]) } };
  runInNewContext(block + '\nglobalThis.proof = { selectedDifficulty, bestByDifficulty, selectDifficulty };', sandbox);
  return { ...sandbox.proof, saved };
}

test('menu migration preserves mapped legacy records while preventing cross-mode stars and persists the pick', () => {
  const p = menuPreferences({ best: [3, 3], bestByDifficulty: { easy: [1, 2], medium: [2, 1], hard: [2, 1] }, difficulty: 'hard' });
  assert.deepEqual(JSON.parse(JSON.stringify(p.bestByDifficulty)), { easy: [3, 2, 0, 0, 0], medium: [2, 1, 0, 0, 0], hard: [2, 3, 0, 0, 0] });
  assert.equal(p.selectedDifficulty, 'hard'); p.selectDifficulty('medium');
  assert.deepEqual(p.saved, [['difficulty', 'medium']]);
  const old = menuPreferences({ best: [2, 3] });
  assert.deepEqual(JSON.parse(JSON.stringify(old.bestByDifficulty)), { easy: [2, 0, 0, 0, 0], medium: [0, 0, 0, 0, 0], hard: [0, 3, 0, 0, 0] });
  const malformed = menuPreferences({ best: [Infinity, -1], bestByDifficulty: { easy: ['3', null], medium: [8, .5], hard: [NaN, {}] }, difficulty: '__proto__' });
  assert.deepEqual(JSON.parse(JSON.stringify(malformed.bestByDifficulty)), { easy: [0, 0, 0, 0, 0], medium: [0, 0, 0, 0, 0], hard: [0, 0, 0, 0, 0] });
  assert.equal(malformed.selectedDifficulty, 'medium');
});
