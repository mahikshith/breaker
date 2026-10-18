import { test } from 'node:test';
import assert from 'node:assert/strict';
import { difficulty, DIFFICULTY_IDS } from '../src/difficulty.js';
import { VENOM } from '../src/serpent.js';

globalThis.Image = class { complete = true; naturalWidth = 1; width = 512; height = 768; decode() { return Promise.resolve(); } };
const prefs = new Map([['breach.aimReadySeen', 'true'], ['breach.wardCoachAck', 'true']]);
globalThis.localStorage = { getItem: key => prefs.get(key) ?? null, setItem: (key, value) => prefs.set(key, value) };
const gradient = { addColorStop() {} };
const context = new Proxy({}, { get: (_, key) => key === 'createLinearGradient' ? () => gradient : () => {} });
globalThis.document = { createElement: () => ({ getContext: () => context }) };
const { Arena } = await import('../src/arena.js');
const { Vault } = await import('../src/vault.js');
const devices = [[729, 393 / 360], [785, 412 / 360]];
const close = (actual, expected, message) => assert(Math.abs(actual - expected) < 1e-10, `${message}: ${actual} vs ${expected}`);
const vault = (id, H = 729, scale = 393 / 360) => new Vault(360, H, scale, id);

test('difficulty accepts only own mode ids and safely falls back to Medium', () => {
  assert.deepEqual(DIFFICULTY_IDS, ['easy', 'medium', 'hard']);
  const invalid = [undefined, null, '', 'Easy', ' easy', 'hard ', 'nightmare', '__proto__', 'constructor', 'toString', 'hasOwnProperty',
    0, 1, NaN, true, false, [], ['easy'], {}, Object.create(null), new String('easy'), Symbol('easy'), () => 'easy'];
  for (const id of invalid) assert.equal(difficulty(id), difficulty('medium'), `invalid ${typeof id} value`);
  assert.equal(difficulty(), difficulty('medium'));
});

test('three modes retain the selected Vault speeds and distinct Carrier pressure settings', () => {
  const expected = [
    { id: 'easy', label: 'Easy', vaultSpeed: .6, carrier: { raiderHP: 2, lockHP: 2, extractSeconds: 8, firstSquad: 6, raidRecovery: 4, hover: 0, waves: 1, waveSeconds: Infinity } },
    { id: 'medium', label: 'Medium', vaultSpeed: .8, carrier: { raiderHP: 3, lockHP: 3, extractSeconds: 7.5, firstSquad: 5, raidRecovery: 3, hover: 10, waves: 2, waveSeconds: 75 } },
    { id: 'hard', label: 'Hard', vaultSpeed: 1, carrier: { raiderHP: 4, lockHP: 4, extractSeconds: 8.5, firstSquad: 4, raidRecovery: 2.5, hover: 16, waves: 2, waveSeconds: 75 } },
  ];
  expected.forEach((mode,i)=>{ mode.companionHits=[24,30,36][i]; mode.spacePowers=[{balls:7,cosmic:1,maxTime:12,duration:8},{balls:6,cosmic:1,maxTime:10,duration:7},{balls:5,cosmic:1,maxTime:8,duration:6}][i]; mode.powers=[{balls:12,cosmic:2,maxTime:20},{balls:9,cosmic:2,maxTime:18},{balls:5,cosmic:1,maxTime:14}][i]; });
  assert.deepEqual(DIFFICULTY_IDS.map(difficulty), expected);
});

function geometry(l) {
  const G = l.grid;
  return {
    bounds: [l.W, l.H, l.left, l.right, l.top, l.drainY, l.shieldY, l.playClipY],
    paddle: { ...l.paddle }, radius: l.ballRadius, speed: l.speed, scale: l.kitUIScale,
    balls: l.balls.map(b => ({ ...b, trail: [...b.trail] })),
    grid: { cols: G.cols, rows: G.rows, cw: G.cw, ch: G.ch, ox: G.ox, oy: G.oy,
      cells: [...G.cells], hp: [...G.hp], bid: [...G.bid], unpierceable: [...G.unpierceable] },
    bricks: l.bricks.map(b => ({ ...b })), cells: l.snake.cells.map(c => [...c]),
    path: l.snakePlan(), entry: { ...l.entry }, princess: { ...l.pr }, coreMode: l.coreMode,
    lives: l.lives, focus: l.focus, focusMax: l.focusMax, coreHits: l.coreHits,
  };
}

test('Vault modes preserve both phone geometries, starting grid/path, balls, paddle and resources', () => {
  for (const [H, scale] of devices) {
    const levels = DIFFICULTY_IDS.map(id => vault(id, H, scale));
    for (const l of levels) {
      assert.equal(l.difficulty, difficulty(l.difficulty).id);
      assert.equal(l.snakeSpeed, difficulty(l.difficulty).vaultSpeed);
      assert.equal(l.phase, 'intro');
      assert.equal(l.ballRadius, 6); assert.equal(l.speed, 345);
      assert.equal(l.paddle.w, 70); assert.equal(l.paddle.h, 12);
      assert.deepEqual(l.snake.cells[0], [16, 1]);
      assert.deepEqual(l.snake.cells.at(-1), [16, -10]);
      assert.deepEqual(geometry(l), geometry(levels[2]));
    }
  }
});

test('legacy Vault construction stays Hard while explicit invalid modes follow Medium fallback', () => {
  const legacy = new Vault(360, 729, 393 / 360), explicit = vault('hard');
  assert.equal(legacy.difficulty, 'hard'); assert.equal(legacy.snakeSpeed, 1);
  assert.deepEqual(geometry(legacy), geometry(explicit));
  assert.equal(new Vault(360, 729).difficulty, 'hard');
  assert.equal(vault(undefined).difficulty, 'hard', 'omitted fourth argument keeps the legacy default');
  for (const id of [null, '__proto__', {}, '']) {
    assert.equal(vault(id).difficulty, 'medium'); assert.equal(vault(id).snakeSpeed, .8);
  }
});

test('real pointer aiming, launch velocity and paddle dragging are identical in every Vault mode', () => {
  for (const [H, scale] of devices) {
    const results = DIFFICULTY_IDS.map(id => {
      const l = vault(id, H, scale); l.phase = 'rescue';
      l.pointerDown(180, H - 30); l.pointerMove(210, H - 30); l.update(1 / 120);
      close(l.aim.angle, .36, 'same aim sensitivity');
      l.pointerUp();
      const launch = { vx: l.balls[0].vx, vy: l.balls[0].vy, r: l.balls[0].r, caught: l.balls[0].caught };
      close(Math.hypot(launch.vx, launch.vy), 345, 'same launch speed');
      l.pointerDown(180, H - 30); l.pointerMove(230, H - 30); l.update(1 / 120);
      return { launch, x: l.paddle.x, vx: l.paddle.vx, focus: l.focus, timeScale: l.timeScale };
    });
    assert.deepEqual(results[0], results[2]); assert.deepEqual(results[1], results[2]);
    assert(results[0].x > 180, 'the comparison exercised actual paddle movement');
  }
});

test('locomotion alone scales exactly .6/.8/1 at starting and fully accelerated serpent speed', () => {
  for (const [eaten, danger] of [[0, 0], [30, 1]]) {
    const deltas = DIFFICULTY_IDS.map(id => {
      const l = vault(id); l.phase = 'rescue'; l.danger = danger;
      Object.assign(l.snake, { prog: .2, eaten });
      l.updateSnake(.01);
      return l.snake.prog - .2;
    });
    close(deltas[0] / deltas[2], .6, 'Easy movement ratio');
    close(deltas[1] / deltas[2], .8, 'Medium movement ratio');
    close(deltas[2], .01 * (eaten ? 2.3 : .75) / .3, 'legacy Hard movement');
  }
});

test('actual path-selected empty and reinforced-brick chewing keeps inverse mode ratios and damage discounts', () => {
  for (const [headRow, damaged] of [[1, false], [3, false], [3, true]]) {
    const observations = DIFFICULTY_IDS.map(id => {
      const l = vault(id); l.phase = 'rescue';
      const headCol = headRow === 1 ? 16 : 14;
      l.snake.cells = Array.from({ length: 12 }, (_, i) => [headCol, headRow - i]);
      const occupied = l.brickAt(headCol, headRow); if (occupied) l.removeBrick(occupied, null);
      const k = l.snakePlan().path[0], c = k % 20, r = Math.floor(k / 20), br = l.brickAt(c, r);
      if (headRow === 3) { assert(br && br.max === 2, 'fixture exercises a real reinforced next brick'); if (damaged) br.hp = 1; }
      const weight = l.chewTime(c, r);
      l.updateSnake(.001);
      assert.deepEqual(l.snake.chewing, [c, r]);
      close(l.snake.chew, .001, 'chew elapsed seconds stay unscaled');
      return { need: l.snake.need, weight };
    });
    for (const o of observations) close(o.weight, headRow === 1 ? .32 : damaged ? 3.45 * .6 : 3.45, 'path weights do not change by mode');
    close(observations[2].need / observations[0].need, .6, 'Easy chewing rate');
    close(observations[2].need / observations[1].need, .8, 'Medium chewing rate');
    close(observations[2].need, observations[2].weight / .75, 'legacy Hard chewing');
  }
});

test('difficulty does not scale ordinary stun or venom wind-up world seconds', () => {
  assert.deepEqual(VENOM, { windup: 1.4, cast: .18, breath: .55, impact: .32, recovery: 1.2, reach: 68 });
  for (const id of DIFFICULTY_IDS) {
    const l = vault(id); l.phase = 'rescue'; l.stunSnake(3, 'STUNNED', 0, 200, 150);
    const before = l.snake.prog; l.updateSnake(.4);
    close(l.snake.stun, 2.6, `${id} stun`); assert.equal(l.snake.prog, before);
    l.snake.stun = 0; l.wardCoachSeen = true;
    const br = l.bricks.find(b => b.kind === 9 && b.r === 1);
    Object.assign(l.venom, { phase: 'warn', t: 0, target: { br, x: br.x, y: br.y, angle: 0 } });
    l.updateSnake(1.399); assert.equal(l.venom.phase, 'warn'); close(l.venom.t, 1.399, `${id} wind-up`);
    l.updateSnake(.002); assert.equal(l.venom.phase, 'breath'); assert.equal(l.venom.t, 0);
    assert.equal(l.snake.prog, before, 'the warning blocks movement without mode-scaled time');
  }
});

test('cage strikes, visible capture and final loss keep legacy attack timing in every mode', () => {
  for (const id of DIFFICULTY_IDS) {
    const l = vault(id); l.phase = 'rescue'; l.startAttack();
    assert.equal(l.timeScale, .6);
    l.updateSnake(.619); assert.equal(l.snake.attack.struck, 0);
    l.updateSnake(.002); assert.equal(l.snake.attack.struck, 1); assert.equal(l.phase, 'rescue');
    l.updateSnake(.598); assert.equal(l.snake.attack.struck, 1);
    l.updateSnake(.002); assert.equal(l.snake.attack.struck, 2); assert.equal(l.phase, 'caught'); assert(l.capturePose());
    l.updateSnake(1.478); assert.equal(l.state, 'play');
    l.updateSnake(.002); assert.equal(l.state, 'lost'); assert.equal(l.reason, 'The serpent caught the princess');
  }
});

test('chargeCore becomes exactly full at twelve legacy hits or six configured manual hits, once', () => {
  for (const [hits, mode] of [[12, 'titan'], [12, 'ward'], [6, 'manual']]) {
    const l = new Arena(360, 729); assert.equal(l.coreHits, 12);
    l.coreHits = hits; l.coreMode = mode;
    for (let i = 1; i < hits; i++) { l.chargeCore(); close(l.paddle.charge, i / hits, 'partial charge'); assert(l.paddle.charge < 1); }
    assert.equal(l.fx.pops.length, 0);
    l.chargeCore(); assert.equal(l.paddle.charge, 1, 'floating-point accumulation is normalised to full');
    assert.equal(l.fx.pops.length, 1);
    for (let i = 0; i < 20; i++) l.chargeCore();
    assert.equal(l.paddle.charge, 1); assert.equal(l.fx.pops.length, 1, 'full does not replay ready or overflow');
  }
});

test('manual break bookkeeping never double-credits explicit damage charge; Ward and default mode still earn twelve breaks', () => {
  const manual = new Arena(360, 729); manual.coreMode = 'manual'; manual.coreHits = 6;
  for (let i = 1; i <= 6; i++) {
    manual.chargeCore(); const charged = manual.paddle.charge; manual.brokeBrick();
    assert.equal(manual.paddle.charge, charged, 'finishing the damaged panel cannot add another pip');
    assert.equal(manual.bricksBroken, i); assert.equal(manual.combo, i); assert.equal(manual.focusFill, i);
  }
  assert.equal(manual.paddle.charge, 1);
  for (const l of [new Arena(360, 729), ...DIFFICULTY_IDS.map(id => vault(id))]) {
    assert.equal(l.coreHits, 12);
    for (let i = 0; i < 11; i++) l.brokeBrick();
    close(l.paddle.charge, 11 / 12, 'legacy mode has no earlier free readiness');
    l.brokeBrick(); assert.equal(l.paddle.charge, 1);
    assert.equal(l.bricksBroken, 12); assert.equal(l.combo, 12);
  }
});
