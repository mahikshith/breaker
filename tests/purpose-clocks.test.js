import test from 'node:test';
import assert from 'node:assert/strict';
import { PurposeClock, PACE } from '../src/fantasy/purpose.js';
import { Gatehouse, GATEHOUSE_MODES, GATEHOUSE_PURPOSE } from '../src/fantasy/gatehouse.js';
import { LumiTower, LUMI_MODES, LUMI_PURPOSE } from '../src/fantasy/lumitower.js';
import { SerpentRivals, RIVALS_MODES, RIVALS_PURPOSE } from '../src/fantasy/rivals.js';
import { DragonsHoard, HOARD_MODES, HOARD_PURPOSE } from '../src/fantasy/hoard.js';
import { Bellforge } from '../src/fantasy/bellforge.js';

// Owner 2026-10-23: every castle villain works toward taking Lumi on a visible clock. Running out loses the chapter with
// the villain's own line; the chapter's right targets push it back, a power pushes it back hard, his successes surge it.
const park = m => { m.balls = [{ id: ++m.serial, x: 20, y: 300, px: 20, py: 300, vx: 0, vy: 0, r: 7, caught: true, dead: false, ram: 0, ramBricks: 0, contacts: new Set() }]; };
const live = (m, floor = 0) => { if (m.floor !== floor) m.buildFloor(floor); m.lives = 9; m.phase = 'play'; m.active = true; park(m); return m; };
const runOut = m => { m.purpose.p = 1 - 1e-6; m.update(1 / 120); return m; };
const pushed = (m, hit) => { m.purpose.p = .6; hit(); return .6 - m.purpose.p; };

test('the clock: fills over its seconds, pushes and surges are seconds, the villain speeds up past half and past 80%', () => {
  const c = new PurposeClock(50);
  assert.equal(c.tick(25), false); assert.equal(c.p, .5); assert.equal(c.left, 25); assert.equal(c.pace, PACE.midK);
  c.push(5); assert.equal(c.p, .4); assert.equal(c.pace, 1);
  c.surge(22); assert(Math.abs(c.p - .84) < 1e-9); assert.equal(c.pace, PACE.highK); assert(c.danger);
  c.push(1000); assert.equal(c.p, 0);
  c.surge(1000); assert(c.p < 1, 'a surge alone never ends the chapter');
  c.rewind(); assert.equal(c.p, .5);
  assert.equal(c.tick(30), true);
});

test('every mode has a clock per floor, Easy the longest and the most forgiving pushes', () => {
  for (const MODES of [GATEHOUSE_MODES, LUMI_MODES, RIVALS_MODES, HOARD_MODES]) {
    for (const r of Object.values(MODES)) { assert.equal(r.clock.length, 3); assert(r.push > 0 && r.power > r.push && r.surge > 0); }
    for (let f = 0; f < 3; f++) assert(MODES.easy.clock[f] >= MODES.medium.clock[f] && MODES.medium.clock[f] >= MODES.hard.clock[f]);
    assert(MODES.easy.push >= MODES.hard.push && MODES.easy.surge <= MODES.hard.surge);
  }
});

test('Gatehouse: Korr hauls Lumi away when the clock runs out; housing, winch and Korr hits push it back, the Ward hard', () => {
  const g = runOut(live(new Gatehouse({ difficulty: 'medium' })));
  assert.equal(g.state, 'lost'); assert.equal(g.reason, GATEHOUSE_PURPOSE.lost); assert.match(g.reason, /Lumi/);
  assert(g.continue()); assert.equal(g.purpose.p, .5, 'a Continue gives back half the clock');
  const m = live(new Gatehouse({ difficulty: 'medium' })), R = m.rules;
  assert(Math.abs(pushed(m, () => m.hitHousing(m.housings[0], 1)) - R.push / R.clock[0]) < 1e-9);
  m.purpose.p = .6; m.charge = 100; assert(m.activate('ward')); assert(Math.abs(.6 - m.purpose.p - R.power / R.clock[0]) < 1e-9);
  live(m, 1); assert(pushed(m, () => m.turnWheel(1, 1)) > 0);
  live(m, 2); assert(pushed(m, () => m.hitVillain(1, false)) > 0);
  m.purpose.p = .9; assert.equal(m.bellInterval, R.interval * PACE.highK, 'past 80% the bells come at x.7');
  m.purpose.p = .6; assert.equal(m.bellInterval, R.interval * PACE.midK);
});

test('Lumi Breaks Out: Gnash coils up and catches Lumi at zero; bars, rings and songs push him back, a bite surges him', () => {
  const t = runOut(live(new LumiTower({ difficulty: 'medium' })));
  assert.equal(t.state, 'lost'); assert.equal(t.reason, LUMI_PURPOSE.lost); assert.match(t.reason, /Gnash.*Lumi/);
  const m = live(new LumiTower({ difficulty: 'medium' }), 1), R = m.rules;
  assert(Math.abs(pushed(m, () => m.hitBrick(m.bricks.find(b => b.type === 'bar'), {})) - R.push / R.clock[1]) < 1e-9);
  assert.equal(pushed(m, () => m.hitBrick(m.bricks.find(b => b.type === 'brick' && b.hp > 0), {})), 0, 'an ordinary brick is not the goal');
  m.purpose.p = .6; m.charge = 100; assert(m.activate('starlight')); assert(.6 - m.purpose.p > R.push / R.clock[1]);
  const before = m.purpose.p; m.swallow(m.balls[0], { swallowed: false }); assert(m.purpose.p > before);
  live(m, 2); assert(pushed(m, () => m.ringBell()) > 0);
});

test('Serpent Rivals: the serpents seal Lumi in at zero; hatch bars, Seal hits and clashes push back, the Ward hard', () => {
  const r = runOut(live(new SerpentRivals({ difficulty: 'medium' })));
  assert.equal(r.state, 'lost'); assert.equal(r.reason, RIVALS_PURPOSE.lost); assert.match(r.reason, /Lumi/);
  const m = live(new SerpentRivals({ difficulty: 'medium' })), R = m.rules;
  assert(Math.abs(pushed(m, () => m.hitBrick(m.bricks.find(b => b.type === 'bar'), {})) - R.push / R.clock[0]) < 1e-9);
  m.purpose.p = .6; m.charge = 100; assert(m.activate('ward')); assert(Math.abs(.6 - m.purpose.p - R.power / R.clock[0]) < 1e-9);
  live(m, 2); assert(pushed(m, () => m.damageSeal(1, 'ball')) > 0);
});

test('Dragon’s Hoard: Ember swallows the hoard and Lumi at zero; chimes, the Crown chest and the gate push him back', () => {
  const h = runOut(live(new DragonsHoard({ difficulty: 'medium' })));
  assert.equal(h.state, 'lost'); assert.equal(h.reason, HOARD_PURPOSE.lost); assert.match(h.reason, /Ember.*Lumi/);
  const m = live(new DragonsHoard({ difficulty: 'medium' })), R = m.rules;
  assert(Math.abs(pushed(m, () => m.hitBrick(m.bricks.find(b => b.kind === 'crown'), {})) - R.push / R.clock[0]) < 1e-9);
  assert(pushed(m, () => m.strikeChime(m.bricks.find(b => b.kind === 'chime' && b.lit))) > 0);
  m.purpose.p = .6; m.charge = 100; assert(m.activate('volley')); assert(Math.abs(.6 - m.purpose.p - R.power / R.clock[0]) < 1e-9);
  live(m, 2); assert(pushed(m, () => m.hitGate(1)) > 0);
});

test('Bellforge: the lift breach is lost with a line that names Lumi, and the meter is the lift drop', () => {
  const b = new Bellforge({ difficulty: 'easy' }); b.active = true; b.phase = 'play';
  b.lumi.steps = b.rules.mistakes; b.phase = 'breach'; b.breachRemaining = .01; b.update(1 / 60);
  assert.equal(b.state, 'lost'); assert.match(b.reason, /Lumi’s lift/);
});
