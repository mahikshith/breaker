// Continue screen v2: the chapter-aware "so close" line, the soft-timeout fuse, the unlock rule and "back in action"
// (ball held on the paddle, a short Ward/shield, hazard clocks frozen until the serve) for all eleven chapters.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

globalThis.Image ??= class { complete = true; naturalWidth = 256; naturalHeight = 256; width = 1024; height = 768; decode() { return Promise.resolve(); } };
const ctx = () => { const f = new Proxy(function () {}, { get: (_, k) => k === 'addColorStop' ? () => {} : f, apply: () => f, set: () => true }); return f; };
globalThis.document ??= { createElement: () => ({ getContext: () => ctx(), width: 0, height: 0 }) };
globalThis.Path2D ??= class { moveTo() {} lineTo() {} quadraticCurveTo() {} };
const prefs = new Map();
globalThis.localStorage ??= { getItem: k => prefs.get(k) ?? null, setItem: (k, v) => prefs.set(k, String(v)) };

const { soClose, fuse, FUSE_SECS, plural, hpLeft } = await import('../src/near-miss.js');
const { noteLoss, lifetimeLosses, showUnlock } = await import('../src/monetize.js');
const { Carrier } = await import('../src/carrier.js');
const { Vault } = await import('../src/vault.js');
const { Relay } = await import('../src/relay.js');
const { Orbital } = await import('../src/orbital.js');
const { Frost } = await import('../src/frost.js');
const { Mooncoil } = await import('../src/mooncoil.js');
const { FantasyChapter } = await import('../src/fantasy/chapter.js');
const { Bellforge } = await import('../src/fantasy/bellforge.js');
const { Tidewheel } = await import('../src/fantasy/tidewheel.js');
const { Gatehouse } = await import('../src/fantasy/gatehouse.js');
const { LumiTower } = await import('../src/fantasy/lumitower.js');
const { SerpentRivals } = await import('../src/fantasy/rivals.js');
const { BACK_WARD } = await import('../src/fantasy/ram.js');

const H = 729, S = 393 / 360;
const vault = (V = Vault) => { const l = new V(360, H, S, 'medium'); l.wardCoachSeen = true; l.skipIntro(); while (l.phase === 'intro') l.update(1 / 120); return l; };
// main.js slot order; FantasyChapter wraps the five castle models exactly as the game does
const CHAPTERS = {
  'Carrier Breakout': () => new Carrier(360, H, S, 'medium'),
  'The Vault': () => vault(),
  'Circuit Breakout': () => new Relay(360, H, S, 'medium'),
  'Shutter Forge': () => new Orbital(360, H, S, 'medium'),
  'Frost Warden': () => new Frost(360, H, S, 'medium'),
  'Mooncoil Reliquary': () => vault(Mooncoil),
  'Bellforge Run': () => new FantasyChapter('bellforge', 360, 814, S, 'medium'),
  'Tidewheel Citadel': () => new FantasyChapter('tidewheel', 360, 814, S, 'medium'),
  'Gatehouse Siege': () => new FantasyChapter('gatehouse', 360, 814, S, 'medium'),
  'Lumi Breaks Out': () => new FantasyChapter('lumitower', 360, 814, S, 'medium'),
  'Serpent Rivals': () => new FantasyChapter('rivals', 360, 814, S, 'medium'),
};
const lose = l => { if (l.m) { l.m.lives = 0; l.m.lose ? l.m.lose('fixture') : (l.m.state = 'lost'); } else l.fail('fixture'); assert.equal(l.state, 'lost'); };

test('all eleven chapters (main.js slot list) have a near-miss line', () => {
  const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  assert.deepEqual([...main.matchAll(/^  \{ make: .*?name: '([^']+)'/gm)].map(m => m[1]), Object.keys(CHAPTERS));
  for (const [name, make] of Object.entries(CHAPTERS)) {
    const l = make(); lose(l); const n = soClose(l);
    assert.ok(n.line.length > 6 && n.line === n.line.toUpperCase(), `${name}: ${n.line}`);
    assert.doesNotMatch(n.line, /(^|\D)0 |NaN|undefined|Infinity/, `${name}: ${n.line}`);
    assert.ok(n.progress >= 0 && n.progress < 1, `${name}: progress ${n.progress}`);
    assert.match(n.detail, /^((FLOOR|WAVE) \d \/ \d · )?\d{1,2}% CLEARED$/, `${name}: ${n.detail}`);
  }
});

test('villain chapters name the villain and its HP; objective chapters say what is left', () => {
  const line = l => soClose(l).line;
  const bell = new FantasyChapter('bellforge', 360, 814, S, 'medium'); bell.m.villain.hp = 3; lose(bell); assert.equal(line(bell), 'KORR HAS 3 HP LEFT');
  const tide = new FantasyChapter('tidewheel', 360, 814, S, 'medium'); tide.m.villain.hp = 7; lose(tide); assert.equal(line(tide), 'NERRA HAS 7 HP LEFT');
  const frost = new Frost(360, H, S, 'medium'); frost.warden.hp = 9; assert.equal(line(frost), 'THE FROST WARDEN HAS 9 HP LEFT');
  const relay = new Relay(360, H, S, 'medium'); relay.hp = 12; assert.equal(line(relay), 'THE RELAY HAS 12 HP LEFT');
  const forge = new Orbital(360, H, S, 'medium'); assert.equal(line(forge), '3 STABILISERS LEFT');
  forge.stations[0].hp = forge.stations[1].hp = 0; assert.equal(line(forge), '1 STABILISER LEFT');
  forge.phase = 'core'; forge.core.hp = 5; assert.equal(line(forge), 'THE REACTOR HAS 5 HP LEFT'); assert.ok(soClose(forge).progress > .6);
  const moon = vault(Mooncoil); moon.cageHP = 3; assert.equal(line(moon), 'THE MOONSTONE HAS 3 HP LEFT');
  const carrier = new Carrier(360, H, S, 'medium'), pods = carrier.crew.length; carrier.crew[0].releasedAt = 0;
  assert.equal(line(carrier), `${plural(pods - 1, 'CREW POD')} LEFT`); assert.match(soClose(carrier).detail, /^WAVE 1 \/ \d/);
  // Gatehouse: drawbridge housings, the winch, then Korr
  const gate = new Gatehouse({ difficulty: 'medium' }); gate.housings[0].hp = 0; gate.housings[1].hp = 2;
  assert.equal(gate.nearMiss().line, '2 HITS TO DROP THE DRAWBRIDGE');
  gate.buildFloor(1); gate.wheel.notches = gate.gate.need - 1; assert.equal(gate.nearMiss().line, '1 WINCH HIT TO RAISE THE GATE');
  gate.buildFloor(2); gate.villain.hp = 3; assert.equal(gate.nearMiss().line, hpLeft('KORR', 3));
  assert.deepEqual(gate.nearMiss().stage, ['FLOOR', 3, 3]); assert.ok(gate.nearMiss().progress > 2 / 3);
  // Lumi: hatch bars, then the roof bell
  const lumi = new LumiTower({ difficulty: 'medium' }); for (const b of lumi.bricks) if (b.type === 'bar') b.hp = 0; lumi.bricks.find(b => b.type === 'bar').hp = 1;
  assert.equal(lumi.nearMiss().line, 'LUMI IS 1 HIT FROM FLOOR 2');
  lumi.buildFloor(2); lumi.bell.rings = lumi.bell.need - 2; assert.equal(lumi.nearMiss().line, 'LUMI IS 2 BELL RINGS FROM FREEDOM');
  // Rivals: the hatch, then the Twin Seal
  const riv = new SerpentRivals({ difficulty: 'medium' }); assert.match(riv.nearMiss().line, /^\d+ HITS TO OPEN THE HATCH$/);
  riv.buildFloor(1); riv.seal.hp = 4; assert.equal(riv.nearMiss().line, 'THE TWIN SEAL HAS 4 HP LEFT');
});

test('the Vault line counts the bricks the breach rule needs: it reaches 0 exactly when Lumi breaks out', () => {
  const l = vault(), start = l.freeStart;
  assert.ok(start > 0 && Number.isFinite(start)); assert.equal(soClose(l).line, `LUMI IS ${start} BRICKS FROM FREEDOM`);
  assert.equal(l.nearMiss().progress, 0);
  for (let guard = 0; l.phase === 'rescue' && guard < 400; guard++) {
    const now = l.freeCost();
    // a brick whose removal shortens her way out (tested on the grid, then broken for real)
    const br = l.bricks.find(b => { if (b.gone || b.kind === 9) return false; const k = b.r * 20 + b.c, keep = l.grid.cells.slice(k, k + b.n);
      for (let i = 0; i < b.n; i++) l.grid.cells[k + i] = 0; const c = l.freeCost(); keep.forEach((v, i) => { l.grid.cells[k + i] = v; }); return c < now; });
    assert.ok(br, 'some brick shortens the way out');
    l.removeBrick(br, null);
    assert.equal(l.phase === 'escape', l.freeCost() === 0, `breach ${l.phase} at cost ${l.freeCost()}`);
  }
  assert.equal(l.phase, 'escape');
});

test('soClose: SO CLOSE! from halfway, never 100% on a loss, and a broken hook never breaks the panel', () => {
  assert.equal(soClose({ nearMiss: () => ({ line: 'x left', progress: .49 }) }).title, 'CONTINUE?');
  const n = soClose({ nearMiss: () => ({ line: 'korr has 1 hp left', progress: 1, stage: ['FLOOR', 3, 3] }) });
  assert.deepEqual([n.title, n.line, n.detail], ['SO CLOSE!', 'KORR HAS 1 HP LEFT', 'FLOOR 3 / 3 · 99% CLEARED']);
  assert.equal(soClose({ nearMiss: () => { throw Error('boom'); } }).title, 'CONTINUE?');
  assert.equal(soClose({}).line, '');
  assert.equal(hpLeft('KORR', 0), 'KORR HAS 1 HP LEFT'); assert.equal(plural(1, 'HIT'), '1 HIT'); assert.equal(plural(2, 'HIT'), '2 HITS');
});

test('soft timeout: the fuse drains, heats up in its last 2 s, then stays spent; only No thanks declines', () => {
  assert.deepEqual(fuse(0), { left: FUSE_SECS, frac: 1, heat: 0, spent: false });
  assert.equal(fuse(FUSE_SECS / 2).frac, .5); assert.equal(fuse(FUSE_SECS - 1).heat, .5);
  for (const t of [FUSE_SECS, FUSE_SECS + 1, 600, Infinity]) assert.deepEqual(fuse(t), { left: 0, frac: 0, heat: 1, spent: true });
  assert.equal(fuse(NaN).frac, 1); assert.equal(fuse(-3).frac, 1);
  const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  const declines = [...main.matchAll(/cont\.declined = true/g)];
  assert.equal(declines.length, 1, 'one place declines the offer');
  assert.match(main, /fn: \(\) => \{ cont\.declined = true; resultT = 1\.1; \} \}\);\n  text\(g, 'No thanks'/, 'and it is the No thanks button');
  assert.doesNotMatch(main.slice(main.indexOf('function drawContinue'), main.indexOf('function drawBackIn')), /left <= 0\) \{/);
});

test('the unlock card follows one rule: never on the first lifetime loss', () => {
  prefs.clear();
  assert.equal(lifetimeLosses(), 0); assert.equal(showUnlock(noteLoss()), false);
  assert.equal(showUnlock(noteLoss()), true); assert.equal(lifetimeLosses(), 2);
  prefs.set('breach.unlocked', 'true'); assert.equal(showUnlock(5), false); prefs.clear();
});

// ---------- back in action ----------
const step = (l, s) => { for (let i = 0; i < Math.round(s * 120); i++) l.update(1 / 120); };
const arenaClock = l => JSON.stringify({ clock: l.clock, rescueT: l.rescueT, snake: l.snake?.cells, stun: l.snake?.stun, wave: l.waveRemaining });
for (const name of ['Carrier Breakout', 'The Vault', 'Circuit Breakout', 'Shutter Forge', 'Frost Warden', 'Mooncoil Reliquary']) {
  test(`${name}: Continue holds the ball on the paddle with the shield up and every clock frozen until the serve`, () => {
    const l = CHAPTERS[name](); l.release(); step(l, 1.5); lose(l);
    l.continueRun();
    assert.equal(l.state, 'play'); assert.ok(l.backHold); assert.ok(l.aim?.serve); assert.equal(l.balls.length, 1); assert.ok(l.balls[0].caught);
    assert.equal(l.shield, 2); assert.equal(l.shieldT, 10);
    const frozen = arenaClock(l); step(l, 12);
    assert.ok(l.backHold && l.aim?.serve && l.balls[0].caught, 'no auto-serve while held'); assert.equal(arenaClock(l), frozen); assert.equal(l.shieldT, 10);
    const b = l.balls[0]; assert.ok(Math.abs(b.y - (l.paddle.y - b.r - 1)) < 1e-6, 'ball sits on the paddle');
    l.pointerDown(180, l.paddle.y); l.pointerUp();
    assert.ok(!l.backHold && !l.aim); assert.ok(!l.balls[0].caught);
    step(l, .5); assert.ok(l.shieldT < 10, 'the shield counts from the serve');
  });
}

const MODELS = { bellforge: Bellforge, tidewheel: Tidewheel, gatehouse: Gatehouse, lumitower: LumiTower, rivals: SerpentRivals };
const modelClock = m => JSON.stringify({ time: m.key === 'tidewheel' ? 0 : m.time, floorTime: m.floorTime, water: m.water?.y, lift: m.lumi?.steps, villain: m.villain?.stage, nextSurge: m.nextSurge });
for (const key of Object.keys(MODELS)) {
  test(`${key}: Continue holds the serve with a ${BACK_WARD} s Ward at the paddle line and the model's clocks frozen`, () => {
    const l = new FantasyChapter(key, 360, 814, S, 'medium'), m = l.m; m.key = key;
    l.pointerDown(180); l.pointerUp(); step(l, 1); lose(l);
    l.continueRun();
    assert.equal(l.state, 'play'); assert.ok(l.backHold); assert.equal(m.phase, 'serve'); assert.ok(m.balls[0].caught);
    assert.deepEqual(m.ward, { y: m.paddle.y + (key === 'tidewheel' ? 20 : 24), remaining: BACK_WARD });
    const frozen = modelClock(m); step(l, 12);
    assert.ok(l.backHold && m.phase === 'serve' && m.balls[0].caught, 'no auto-serve while held');
    assert.equal(modelClock(m), frozen); assert.equal(m.ward.remaining, BACK_WARD);
    l.pointerDown(180); l.pointerUp();
    assert.ok(!l.backHold); assert.equal(m.phase, 'play'); assert.ok(!m.balls[0].caught);
    step(l, BACK_WARD + .1); assert.equal(m.ward, null, 'the Ward lasts 3 s from the serve');
  });
}

test('the new Wards (Bellforge, Lumi, Tidewheel) bounce a ball that slips past the paddle, then expire', () => {
  for (const M of [Bellforge, LumiTower, Tidewheel]) {
    const m = new M({ difficulty: 'medium' }); m.launch(); m.setTarget(300); for (let i = 0; i < 240; i++) m.update(1 / 240);
    m.ward = { y: m.paddle.y + 20, remaining: 1 };
    const b = m.balls[0]; Object.assign(b, { x: 40, y: m.paddle.y + 4, px: 40, py: m.paddle.y + 4, vx: 0, vy: 345, ram: 0 });
    for (let i = 0; i < 30; i++) m.update(1 / 240);
    assert.ok(b.vy < 0 && b.y <= m.ward.y - b.r + 1e-6, `${M.name}: bounced at ${b.y}`); assert.equal(m.lives, 3);
    m.ward = null; Object.assign(b, { x: 40, y: m.paddle.y + 4, vx: 0, vy: 345 });
    for (let i = 0; i < 120 && m.lives === 3; i++) m.update(1 / 240);
    assert.equal(m.lives, 2, `${M.name}: without the Ward the ball is lost`);
  }
});
