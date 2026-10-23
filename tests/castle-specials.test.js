// Round-3 castle specials (src/castle-specials.js, painted by src/castle-art.js): armour takes two hits and bounces the ball like any brick
// while it survives, mines blast the bricks round them (and chain) without touching bars, pins, granite or bosses, payload bricks are chests,
// coins pay a bonus. One block per level, the way tests/frost.test.js 'round-3 specials' reads for Frost Warden.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeBall, collideGrid } from '../src/physics.js';
import { COIN_BONUS, BLAST_LIFE } from '../src/castle-specials.js';

globalThis.Image = class { complete = true; naturalWidth = 256; naturalHeight = 256; width = 256; height = 256; decode() { return Promise.resolve(); } };
const ctx = () => { const f = new Proxy(function () {}, { get: (_, k) => k === 'addColorStop' ? () => {} : f, apply: () => f, set: () => true }); return f; };
globalThis.document = { createElement: () => ({ getContext: () => ctx(), width: 0, height: 0 }) };
globalThis.Path2D = class { moveTo() {} lineTo() {} quadraticCurveTo() {} };
const { Vault, VAULT_SPECIALS } = await import('../src/vault.js');
const { Mooncoil } = await import('../src/mooncoil.js');
const { SPECIALS: MOON_SPECIALS } = await import('../src/mooncoil-layout.js');
const { Bellforge, BELLFORGE_SPECIALS } = await import('../src/fantasy/bellforge.js');
const { Gatehouse, GATEHOUSE_SPECIALS } = await import('../src/fantasy/gatehouse.js');
const { LumiTower, LUMI_SPECIALS } = await import('../src/fantasy/lumitower.js');
const { SerpentRivals, RIVALS_SPECIALS } = await import('../src/fantasy/rivals.js');
const { DragonsHoard, HOARD_SPECIALS } = await import('../src/fantasy/hoard.js');
const { FantasyChapter } = await import('../src/fantasy/chapter.js');

const GRANITE = 9, BARS = 8, MINE_R_VAULT = 36;
const centre = b => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });
const within = (a, b, r) => Math.hypot(centre(a).x - centre(b).x, centre(a).y - centre(b).y) <= r;

// ---- The Vault and Mooncoil (grid levels) ----
for (const [name, make, specials] of [['The Vault', () => new Vault(360, 729, 393 / 360, 'easy'), VAULT_SPECIALS], ['Mooncoil', () => new Mooncoil(360, 729, 393 / 360, 'easy'), MOON_SPECIALS]]) {
  test(`${name} round-3 specials: every listed brick lands, armour takes two hits, gold bricks are chests`, () => {
    const l = make(), by = sp => l.bricks.filter(b => b.sp === sp);
    for (const sp of ['armour', 'mine', 'coin']) assert.equal(by(sp).length, specials[sp].length, `${sp} all placed`);
    assert(by('armour').every(b => b.hp === 2 && b.max === 2 && b.maxHP === 2 && b.n === 2), 'armour is a two-cell brick of two hits');
    assert(by('armour').every(b => b.kind !== 5 && b.kind !== 3 && b.kind !== 4 && b.kind !== 9), 'armour sits on ordinary one-hit bricks, never glass, gold or granite');
    assert(by('chest').length >= 2 && by('chest').every(b => b.kind === 5), 'every gold payload brick is a chest');
    assert(l.bricks.filter(b => b.kind === 5).every(b => b.sp === 'chest'));
    const a = by('armour')[0], hit = { x: a.x, y: a.y, vx: 0, vy: -300 };
    l.hitCell(a.c, a.r, hit); assert(!a.gone && a.hp === 1, 'the first hit cracks it');
    l.t += 1; l.hitCell(a.c, a.r, hit); assert(a.gone, 'the second breaks it');
  });
  test(`${name} round-3 specials: fire, titan and ram break armour outright; a surviving armour brick bounces the ball like any brick`, () => {
    const l = make(), arm = l.bricks.filter(b => b.sp === 'armour');
    for (const [i, flag] of [{ fire: true }, { titan: 5 }, { ram: 1 }].entries()) { const a = arm[i]; l.hitCell(a.c, a.r, { x: a.x, y: a.y, vx: 0, vy: -300, ...flag }); assert(a.gone, `${Object.keys(flag)[0]} breaks armour in one`); }
    const a = arm[3], ball = makeBall(a.x + a.w / 2, a.y + a.h + 5.5, 40, -300, 6), speed = Math.hypot(ball.vx, ball.vy);
    const hit = collideGrid(ball, l.grid, (c, r, b) => l.hitCell(c, r, b), null);
    assert(hit && a.hp === 1 && !a.gone, 'the ball touched it and it survived');
    assert(ball.vy > 0, 'the ball bounced back down'); assert(Math.abs(Math.hypot(ball.vx, ball.vy) - speed) < 1e-6, 'bounce keeps speed, as off any brick');
    assert.equal(l.grid.cells[a.r * 20 + a.c], a.kind, 'the cell is still solid for the grid while armour survives');
  });
  test(`${name} round-3 specials: a mine shatters bricks within its radius, chains, and never deletes granite or the cage`, () => {
    const l = make(), m = l.bricks.find(b => b.sp === 'mine'), G = l.grid;
    const granite = [], bars = []; for (let k = 0; k < 400; k++) { if (G.cells[k] === GRANITE) granite.push(k); if (G.cells[k] === BARS) bars.push(k); }
    const near = l.bricks.filter(b => b !== m && !b.gone && b.kind !== GRANITE && within(b, m, MINE_R_VAULT));
    assert(near.length >= 4, `a cluster stands round the mine (${near.length})`);
    const score = l.score; l.hitCell(m.c, m.r, { x: m.x, y: m.y, vx: 0, vy: -300 });
    assert(m.gone && near.every(b => b.gone), 'the mine and every brick within its radius are gone');
    assert(l.bricks.filter(b => !b.gone && b.kind !== GRANITE && within(b, m, MINE_R_VAULT)).length === 0);
    assert(l.bricks.filter(b => b.kind === GRANITE && within(b, m, MINE_R_VAULT)).every(b => !b.gone), 'granite inside the radius is not a brick to a mine');
    assert(l.blasts.length >= 1 && l.score > score);
    assert.deepEqual(granite.filter(k => G.cells[k] !== GRANITE), [], 'granite stays'); assert.deepEqual(bars.filter(k => G.cells[k] !== BARS), [], 'cage bars stay');
    l.t += BLAST_LIFE + .1; for (let i = 0; i < 5; i++) l.update(1 / 60); assert.equal(l.blasts.length, 0, 'the blast fx expires');
  });
  test(`${name} round-3 specials: a mine chains into the next mine and a coin pays a bonus with a sparkle`, () => {
    const l = make(), m = l.bricks.find(b => b.sp === 'mine');
    const other = l.bricks.find(b => !b.gone && b !== m && b.kind !== 9 && b.kind !== 5 && b.sp !== 'armour' && within(b, m, MINE_R_VAULT) && b.n === 2);
    other.sp = 'mine'; // a second mine inside the first one's radius
    const beyond = l.bricks.find(b => !b.gone && b !== m && b !== other && !within(b, m, MINE_R_VAULT) && within(b, other, MINE_R_VAULT));
    l.hitCell(m.c, m.r, { x: m.x, y: m.y, vx: 0, vy: -300 });
    assert(other.gone && l.blasts.length >= 2, 'the second mine went off');
    if (beyond) assert(beyond.gone, 'its own radius reached further');
    const c = make(), coin = c.bricks.find(b => b.sp === 'coin'), s0 = c.score; c.hitCell(coin.c, coin.r, { x: coin.x, y: coin.y, vx: 0, vy: -300 });
    assert(coin.gone && c.score - s0 >= COIN_BONUS, 'a coin pays its bonus'); assert.equal(c.pops.length, 1);
  });
  test(`${name} round-3 specials: draws every brick and the blast without errors`, () => {
    const l = make(); l.skipIntro(); const m = l.bricks.find(b => b.sp === 'mine'); l.hitCell(m.c, m.r, { x: m.x, y: m.y, vx: 0, vy: -300 }); l.draw(ctx());
  });
}
test('The Vault round-3 specials: armour makes the serpent chew longer and the route to Lumi costs more hits; Mooncoil keeps its custom layouts clean', () => {
  const plain = new Vault(360, 729, 393 / 360, 'easy', { specials: {} }), l = new Vault(360, 729, 393 / 360, 'easy');
  assert(l.snakePlan().cost > plain.snakePlan().cost, 'serpent route through the armour takes longer');
  const a = l.bricks.find(b => b.sp === 'armour'); assert(l.chewTime(a.c, a.r) > plain.chewTime(a.c, a.r));
  assert.equal(new Vault(360, 729, 393 / 360, 'easy', { layout: plain.layout }).bricks.filter(b => b.sp && b.sp !== 'chest').length, 0, 'a custom layout gets no specials unless it brings them');
});

// ---- The fantasy chapters (models) ----
const spy = m => ({ score: () => m.score });
const BALL = { vx: 0, vy: -300, x: 0, y: 0 };
function checkBoard(label, m, { type = 'brick', outright = true, safe, minArmour = 1, minMine = 1, minCoin = 1, R, coinBonus = COIN_BONUS, shields } = {}) {
  const live = () => m.bricks.filter(b => b.hp > 0), by = sp => m.bricks.filter(b => b.sp === sp);
  assert(by('armour').length >= minArmour && by('mine').length >= minMine && by('coin').length >= minCoin, `${label}: specials placed`);
  assert(by('armour').every(b => b.maxHP === 2 && b.hp === 2), `${label}: armour is two hits`);
  const a = by('armour').find(b => !by('mine').some(q => within(b, q, R)) ) || by('armour')[0];
  // armour survives a hit and still stops the ball like any brick
  const copy = JSON.stringify(a.hp);
  m.hitBrick(a, { ...BALL }); assert.equal(a.hp, 1, `${label}: armour cracks, ${copy} -> 1`); assert(a.hp > 0 && live().includes(a));
  m.hitBrick(a, { ...BALL }); assert.equal(a.hp, 0, `${label}: second hit breaks it`);
  if (outright) { const b = by('armour').find(q => q.hp === 2); if (b) { m.hitBrick(b, { ...BALL, ram: 1 }); assert.equal(b.hp, 0, `${label}: a ram breaks armour outright`); } }
  // a coin pays
  const c = by('coin').find(q => q.hp > 0), s0 = m.score; m.hitBrick(c, { ...BALL });
  assert(m.score - s0 >= coinBonus, `${label}: coin bonus`); assert(m.effects.some(e => e.kind === 'coin-pop'), `${label}: coin sparkle`);
  // a mine blasts every ordinary brick within R, and nothing else
  const mine = by('mine').find(q => q.hp > 0), others = m.bricks.filter(b => b !== mine && b.hp > 0);
  const near = others.filter(b => safe.blastable(b) && within(b, mine, R)), spared = others.filter(b => !safe.blastable(b)), before = safe.snapshot(m);
  assert(near.length >= 2, `${label}: a cluster stands round the mine (${near.length})`);
  m.hitBrick(mine, { ...BALL });
  assert(near.every(b => b.hp === 0), `${label}: every ordinary brick within the blast is gone`);
  assert(spared.every(b => b.hp > 0), `${label}: bars, pins and the like survive the blast`);
  assert.deepEqual(safe.snapshot(m), before, `${label}: bosses and goal targets untouched`);
  assert(m.effects.some(e => e.kind === 'mine-blast'), `${label}: blast fx`);
}
// Ball physics: an isolated surviving armour brick bounces the ball exactly like a plain brick placed in its spot.
function bounce(label, make, pick, move = (m, b) => m.moveBall(b, 1 / 240)) {
  const trial = armour => {
    const m = make(), a = m.bricks.find(pick); if (!armour) { a.sp = undefined; a.hp = a.maxHP = 1; }
    for (const q of m.bricks) if (q !== a) q.hp = 0;
    m.villain && (m.villain.hp > 0 && (m.villain.body = []));
    const ball = { id: 99, x: a.x + a.w / 2, y: a.y + a.h + 11, px: 0, py: 0, vx: 60, vy: -330, r: 6, caught: false, dead: false, ram: 0, ramBricks: 0, contacts: new Set() };
    m.balls = [ball]; m.phase = 'play'; m.active = true; m.paddle.y = 900;
    let out = null; for (let i = 0; i < 40 && !out; i++) { move(m, ball); if (ball.vy > 0) out = { vx: ball.vx, vy: ball.vy, x: ball.x, y: ball.y }; }
    return { out, hp: a.hp, ball };
  };
  const armour = trial(true), plain = trial(false);
  assert(armour.out, `${label}: the ball came back down`); assert.equal(armour.hp, 1, `${label}: armour survived the first touch`);
  assert.deepEqual(armour.out, plain.out, `${label}: bounce matches a plain brick exactly`);
}

test('Bellforge Run round-3 specials: armour holds Korr\'s side, mines blast a cross but never the ramp pins, coins pay', () => {
  const m = new Bellforge({ difficulty: 'easy' });
  for (const [sp, cells] of Object.entries(BELLFORGE_SPECIALS)) assert.equal(m.bricks.filter(b => b.sp === sp).length, cells.length, `${sp} placed on surviving bricks`);
  const pins = m.bricks.filter(b => b.type === 'pin'), ramps = m.ramps.map(r => r.targetAngle);
  checkBoard('bellforge', m, { R: 52, minMine: 2, safe: { blastable: b => b.type === 'brick', snapshot: x => ({ korr: x.villain.hp, pins: pins.map(p => p.hp), ramps: x.ramps.map(r => r.targetAngle), lumi: x.lumi.steps }) } });
  assert.deepEqual(pins.map(p => p.hp), [2, 2, 2]); assert.deepEqual(m.ramps.map(r => r.targetAngle), ramps);
  bounce('bellforge', () => new Bellforge({ difficulty: 'easy' }), b => b.sp === 'armour' && b.row >= 0);
});
test('Gatehouse Siege round-3 specials: every floor wears armour plate over what it guards, gem bricks are chests, a ram still bounces off plate', () => {
  for (let n = 0; n < 3; n++) {
    const m = new Gatehouse({ difficulty: 'easy', floor: n }), spec = GATEHOUSE_SPECIALS[n];
    for (const sp of ['mine', 'coin']) assert.equal(m.bricks.filter(b => b.sp === sp).length, spec[sp].length, `floor ${n + 1} ${sp}`);
    assert.equal(m.bricks.filter(b => b.type === 'armour').length, (spec.armour?.length || 0) + (n === 2 ? 12 : 0), `floor ${n + 1} armour`);
    assert(m.bricks.filter(b => b.type === 'armour').every(b => b.sp === 'armour' && b.hp === 2), 'plate keeps the level\'s armour type and wears the castle armour');
    if (n === 0) assert(m.bricks.filter(b => b.gem).every(b => b.sp === 'chest') && m.bricks.some(b => b.gem), 'loot-gem bricks are the chests');
    const a = m.bricks.find(b => b.type === 'armour'); m.balls = [{ ...BALL, ram: 1, id: 7 }];
    m.hitBrick(a, m.balls[0]); assert.equal(a.hp, 1, 'a ram bounces off plate for a normal hit (this level\'s ramPierce rule)');
  }
  for (const n of [0, 1, 2]) checkBoard(`gatehouse floor ${n + 1}`, new Gatehouse({ difficulty: 'easy', floor: n }), { outright: false, minArmour: n === 2 ? 12 : 1, R: 48,
    safe: { blastable: b => b.type === 'brick' || b.type === 'armour', snapshot: m => ({ korr: m.villain.hp, housings: m.housings.map(h => h.hp), wheel: m.wheel?.notches }) } });
  bounce('gatehouse', () => new Gatehouse({ difficulty: 'easy', floor: 0 }), b => b.sp === 'armour');
});
test('Lumi Breaks Out round-3 specials: armour screens the hatch and the bell, the serpent\'s jaw skips it, mines spare the hatch bars', () => {
  for (let n = 0; n < 3; n++) {
    const m = new LumiTower({ difficulty: 'easy', floor: n });
    checkBoard(`lumi floor ${n + 1}`, m, { R: 48, safe: { blastable: b => b.type === 'brick', snapshot: x => ({ bars: x.bricks.filter(b => b.type === 'bar').map(b => b.hp), bell: x.bell?.rings }) } });
  }
  const m = new LumiTower({ difficulty: 'easy', floor: 1 }), a = m.bricks.find(b => b.sp === 'armour'), c = centre(a);
  m.chomp({ points: [{ x: c.x, y: c.y, r: 13 }] }); assert.equal(a.hp, 2, 'the jaw leaves armour alone');
  const plain = m.bricks.find(b => b.type === 'brick' && !b.sp && b.row === a.row); m.chomp({ points: [{ x: centre(plain).x, y: c.y, r: 13 }] }); assert.equal(plain.hp, 0, 'and still eats an ordinary brick');
  bounce('lumi', () => new LumiTower({ difficulty: 'easy', floor: 1 }), b => b.sp === 'armour');
});
test('Serpent Rivals round-3 specials: armour screens the hatch and the Twin Seal and starves it of ward plates, mines spare bars, lures and the Seal', () => {
  for (let n = 0; n < 3; n++) {
    const m = new SerpentRivals({ difficulty: 'easy', floor: n }), spec = RIVALS_SPECIALS[n];
    assert.equal(m.bricks.filter(b => b.sp === 'armour').length, spec.armour.length, `floor ${n + 1} armour placed`);
    checkBoard(`rivals floor ${n + 1}`, m, { R: 40, safe: { blastable: b => b.type === 'brick', snapshot: x => ({ bars: x.bricks.filter(b => b.type === 'bar').map(b => b.hp), seal: x.seal?.hp, ward: x.seal?.ward, lures: x.lures.length }) } });
  }
  const m = new SerpentRivals({ difficulty: 'easy', floor: 1 }), a = m.bricks.find(b => b.sp === 'armour'), c = centre(a);
  const meals = m.eaten; m.chomp({ points: [{ x: c.x, y: c.y, r: 13 }], snake: 'gnash' }); assert.equal(a.hp, 2, 'the jaw leaves armour alone'); assert(m.eaten - meals < m.bricks.filter(b => b.row === a.row && b.hp === 0 || b.row === a.row && b.sp === 'armour').length + 5);
  assert(m.bricks.filter(b => b.sp === 'armour').every(b => b.hp === 2), 'no armour was a meal');
  bounce('rivals', () => new SerpentRivals({ difficulty: 'easy', floor: 1 }), b => b.sp === 'armour');
});
test('Dragon\'s Hoard round-3 specials: coins and chests wear the castle sprites, armour screens Crown, weights and gate, mines wake Ember through the gold they shatter', () => {
  for (let n = 0; n < 3; n++) {
    const m = new DragonsHoard({ difficulty: 'easy', floor: n }), spec = HOARD_SPECIALS[n];
    assert.equal(m.bricks.filter(b => b.sp === 'armour').length, spec.armour.length, `floor ${n + 1} armour`); assert.equal(m.bricks.filter(b => b.sp === 'mine').length, spec.mine.length);
    assert(m.bricks.filter(b => b.kind === 'coin' || b.kind === 'chest').every(b => b.sp === b.kind), 'the hoard\'s own gold and chest bricks take the castle art');
    const a = m.bricks.find(b => b.sp === 'armour'); m.hitBrick(a, { ...BALL }); assert.equal(a.hp, 1); m.hitBrick(a, { ...BALL }); assert.equal(a.hp, 0);
    const b2 = m.bricks.find(b => b.sp === 'armour' && b.hp === 2); m.hitBrick(b2, { ...BALL, ram: 1 }); assert.equal(b2.hp, 0, 'a ram breaks armour outright');
    const mine = m.bricks.find(b => b.sp === 'mine'), others = m.bricks.filter(b => b !== mine && b.hp > 0), solid = others.filter(b => !['brick', 'coin', 'chest'].includes(b.kind));
    const near = others.filter(b => ['brick', 'coin', 'chest'].includes(b.kind) && within(b, mine, 35)), wake = m.wake, hp = solid.map(b => b.hp);
    assert(near.length >= 2, `floor ${n + 1}: cluster round the mine`);
    m.hitBrick(mine, { ...BALL }); assert(near.every(b => b.hp === 0), 'every brick, coin and chest in the blast is gone');
    assert.deepEqual(solid.map(b => b.hp), hp, 'chimes, the Crown and the weights are not bricks to a mine'); assert(m.effects.some(e => e.kind === 'mine-blast'));
    if (n < 2 && near.some(b => b.kind === 'coin' || b.kind === 'chest')) assert(m.wake > wake, 'gold shattered by a mine wakes Ember like any other gold');
    const melt = new DragonsHoard({ difficulty: 'easy', floor: n }), row = melt.bricks.find(b => b.sp === 'armour').row; melt.melt(row);
    assert(melt.bricks.filter(b => b.row === row && b.sp === 'armour').every(b => b.kind === 'brick' && b.hp === 2), 'the dragon\'s breath cannot melt armour');
  }
  bounce('hoard', () => new DragonsHoard({ difficulty: 'easy', floor: 0 }), b => b.sp === 'armour');
});
test('castle specials draw on every level and the chapter plays a few seconds with them', () => {
  for (const key of ['bellforge', 'gatehouse', 'lumitower', 'rivals', 'hoard']) {
    const l = new FantasyChapter(key, 360, 814, 393 / 360, 'medium'); l.pointerDown(180); l.pointerUp();
    const mine = l.m.bricks.find(b => b.sp === 'mine'); l.m.hitBrick(mine, { ...BALL }); const coin = l.m.bricks.find(b => b.sp === 'coin' && b.hp > 0); if (coin) l.m.hitBrick(coin, { ...BALL });
    for (let i = 0; i < 120; i++) l.update(1 / 60); l.draw(ctx());
  }
});
