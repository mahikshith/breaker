import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeBall, stepBall } from '../src/physics.js';
import { overlapsTarget } from '../src/carrier-physics.js';

globalThis.Image = class { complete = true; naturalWidth = 1; width = 512; height = 768; decode() { return Promise.resolve(); } };
const { Carrier } = await import('../src/carrier.js');
const level = (H = 729, scale = 393 / 360) => new Carrier(360, H, scale);
const hit = (l, id, extra = {}) => l.hitTarget(id, { x: 180, y: 180, r: 7.5, ...extra });
const advance = (l, seconds, full = false) => { for (let i = 0; i < Math.round(seconds * 120); i++) full ? l.update(1 / 120) : l.updateLevel(1 / 120); };
// These are explicit state fixtures; the phone suite separately earns all progress through input.
function parked() { const l = level(); l.release(); l.aim = null; l.balls[0].caught = true; for (const g of l.guns) g.hp = 0; return l; }
function extracting() {
  const l = parked(); for (const b of l.bricks) b.hp = 0;
  for (let i = 0; i < 6000 && l.raid?.stage !== 'extract'; i++) l.updateLevel(1 / 120);
  assert.equal(l.raid?.stage, 'extract'); return l;
}

test('initial serve auto launches at8 seconds; replacement serve at3 without a frozen pressure clock', () => {
  const l = level(); advance(l, 7.9, true); assert(l.aim?.serve); assert.equal(l.clock, 0);
  advance(l, .12, true); assert(l.started && !l.aim); assert(l.nextSquad >= 6);
  l.loseBall(); const at = l.clock; advance(l, 2.9, true); assert(l.aim?.serve); assert(l.clock >= at + 2.89);
  advance(l, .12, true); assert(!l.aim); assert(l.enemyGraceUntil >= l.clock + 2.96);
});

test('one continuous bay launch, edge warning and reentry leads to a reachable2HP boarder', () => {
  for (const [H, scale] of [[729, 393 / 360], [785, 412 / 360]]) {
    const l = level(H, scale); l.release(); l.balls[0].caught = true; l.aim = null; for (const g of l.guns) g.hp = 0;
    advance(l, l.rules.firstSquad - .1); assert.equal(l.fighters.length, 0);
    advance(l, .15); assert.equal(l.fighters.length, 3); assert(l.doorPose() > .99);
    const f = l.fighters[0], p = l.fighterPose(f); assert(p.x > 130 && p.x < 190 && p.y < 205);
    advance(l, 1.1); assert.equal(f.stage, 'bank');
    advance(l, 1.52); assert.equal(f.stage, 'edge'); const edge = l.fighterPose(f); assert(edge.x < 0);
    advance(l, .9); assert.equal(f.stage, 'edge'); advance(l, .15); assert.equal(f.stage, 'approach');
    advance(l, 2.05); const dock = l.fighterPose(f); assert(Math.abs(dock.y - (l.paddle.y - 220)) <= 2); assert.equal(f.hp, 2);
    assert.equal(dock.w, 48); assert.equal(dock.h, 40); assert(dock.y - 24 > 341.4);
    assert(l.targets().some(t => t.id === f.id && overlapsTarget({ x: dock.x, y: dock.y, r: 1 }, t)));
  }
});

test('route selection excludes an intact friendly housing even when a breakable panel is closer', () => {
  const l = parked(), upper = l.crew[0], lower = l.crew[2], from = { x: l.centre(lower).x, y: l.paddle.y - 220 };
  assert.equal(l.routeTo(upper, from), null);
  assert(l.routeTo(lower, from)); assert.notEqual(l.chooseRaidTarget(from)?.id, upper.id);
  lower.hp = 0; assert(l.routeTo(upper, from), 'the actual opened lower window no longer blocks the route');
});

test('enemy fire crosses intact panels and housing without damage, drops, score or core rewards', () => {
  const l = parked(), panel = l.bricks.find(b => b.payload === 'laser'), r = panel.art.rect;
  for (const b of l.bricks) if (b !== panel) b.hp = 0;
  const before = [l.score, l.combo, l.focusFill, l.paddle.charge, l.bricksBroken];
  l.bolts = [{ id: 'breach-fixture', x: r.x + r.w / 2, y: r.y + r.h + 20, vx: 0, vy: -300, r: 3.5 }];
  l.updateBolts(.2); assert.equal(panel.hp, 1); assert.equal(l.bolts.length, 1);
  assert.deepEqual([l.score, l.combo, l.focusFill, l.paddle.charge, l.bricksBroken], before);
  assert.equal(l.drops.filter(d => d.kind === 'laser').length, 0);
  l.updateBolts(.2); assert.equal(l.drops.filter(d => d.kind === 'laser').length, 0);
  const c = l.crew[2], q = c.art.rect;
  l.bolts = [{ id: 'housing-fixture', x: q.x + q.w / 2, y: q.y + q.h + 20, vx: 0, vy: -300, r: 3.5 }];
  l.updateBolts(.2); assert.equal(c.hp, l.rules.lockHP); assert.equal(c.releasedAt, null); assert.equal(l.bolts.length, 1);
});

test('a clear route gets its full mode window, connected pull only in the last2, and loss freezes it', () => {
  const l = extracting(), c = l.crew.find(c => c.id === l.raid.targetId), start = l.raid.extractAt;
  advance(l, l.rules.extractSeconds - 2.1); assert.equal(l.workerPose(c).pull, 0); assert.equal(l.state, 'play');
  advance(l, 1); assert(l.workerPose(c).pull > 0 && l.workerPose(c).pull < 1); assert.equal(l.state, 'play');
  advance(l, 1.12); assert.equal(l.state, 'lost'); assert.equal(l.reason, 'Crew taken'); assert(c.captured);
  assert(l.clock >= start + l.rules.extractSeconds); assert.equal(l.lives, 3, 'capture is a distinct mission loss');
  const before = JSON.stringify(l.inspect()); l.update(50); assert.equal(JSON.stringify(l.inspect()), before);
});

test('real ordinary ball contacts kill the raider in two episodes without rescuing its locked target', () => {
  const l = extracting(), f = l.fighters.find(f => f.id === l.raid.fighterId), c = l.crew.find(c => c.id === l.raid.targetId), p = l.fighterPose(f);
  for (let i = 0; i < 2; i++) {
    const b = makeBall(p.x, p.y + 38, 0, -345, 7.5); stepBall(b, .12, l.world()); assert(b.vy > 0);
    assert.equal(f.hp, 1 - i);
  }
  assert.equal(l.raid, null); assert.equal(c.hp, l.rules.lockHP); assert.equal(c.secured, false); assert.equal(c.releasedAt, null);
  assert(l.nextBoarder >= l.clock + 4); assert.equal(l.state, 'play');
});

test('a legal lock break on the expiry tick wins the tie and Tick secures only once', () => {
  const l = extracting(), c = l.crew.find(c => c.id === l.raid.targetId);
  l.clock = l.raid.extractAt + l.rules.extractSeconds - 1 / 120;
  while(c.hp>0)hit(l,c.id); assert.equal(l.raid, null); assert.equal(c.secured, false);
  advance(l, 1 / 120); assert.equal(l.state, 'play'); assert.equal(c.captured, false);
  advance(l, .8); assert(c.secured); const securedAt = c.securedAt, score = l.score;
  hit(l, c.id); advance(l, .1); assert.equal(c.securedAt, securedAt); assert.equal(l.score, score);
});

test('Focus and visual hit-stop cannot buy extraction time', () => {
  const l = extracting(), start = l.clock, remaining = l.inspect().raid.remaining;
  l.timeScale = .25; l.hitStop = .5; advance(l, .5, true);
  assert(Math.abs(l.clock - start - .5) < 1e-7); assert(Math.abs(l.inspect().raid.remaining - remaining + .5) < 1e-7);
  advance(l, l.rules.extractSeconds - .5 + .02, true); assert.equal(l.state, 'lost'); assert.equal(l.reason, 'Crew taken');
});

test('linked gun damage counts actual removed HP once and optional shutdown cancels the raid', () => {
  const l = extracting(),initial=l.carrier.hp; l.guns[0].hp = 4; hit(l, 'cannon0', { titan: 7 }); assert.equal(l.guns[0].hp, 0); assert.equal(l.carrier.hp, initial-4);
  hit(l, 'cannon0', { titan: 7 }); assert.equal(l.carrier.hp, initial-4);
  while(l.carrier.hp>0)hit(l,'carrier');
  assert.equal(l.carrier.hp, 0); assert.equal(l.raid, null); assert.equal(l.bolts.length, 0);
  advance(l, 15); assert.equal(l.state, 'play'); assert(l.fighters.every(f => f.stage === 'depart'));
});

test('all five rescues latch success without hull grind, late life loss or same-tick laser creation', () => {
  const l = parked(); l.lives = 1; l.paddle.laserT = 7;
  for (const c of l.crew) while(c.hp>0)hit(l,c.id);
  assert.equal(l.phase, 'escape'); assert.equal(l.carrier.hp, l.carrier.maxHP);
  l.loseBall(); l.updateShots(.1); l.applyPower('burst');
  assert.equal(l.lives, 1); assert.equal(l.shots.length, 0); assert.equal(l.balls.length, 1);
  advance(l, .79, true); assert(l.crew.every(c => !c.secured)); advance(l, .02, true); assert(l.crew.every(c => c.secured));
  advance(l, 1.15, true); assert.equal(l.phase, 'retreat'); assert.equal(l.state, 'play');
  advance(l, 1.61, true); assert.equal(l.state, 'won'); assert(l.inspect().crew.every(c => c.escaped)); assert.equal(l.result().stars, 1);
});

test('capture Continue preserves every earned fact and clears only the failed capture/hostile pressure', () => {
  const l = extracting(), saved = l.crew.find(c => c.id !== l.raid.targetId), target = l.crew.find(c => c.id === l.raid.targetId);
  while(saved.hp>0)hit(l,saved.id); hit(l, target.id); hit(l, 'carrier'); l.paddle.charge = .75;
  advance(l, l.rules.extractSeconds + .02); assert.equal(l.state, 'lost'); assert(target.captured); assert(saved.secured);
  const savedAt = saved.securedAt, hp = l.carrier.hp; l.continueRun();
  assert.equal(l.state, 'play'); assert.equal(target.hp, l.rules.lockHP-1); assert.equal(target.captured, false);
  assert(saved.secured && saved.securedAt === savedAt); assert.equal(l.carrier.hp, hp); assert.equal(l.paddle.charge, .75);
  assert.equal(l.fighters.length, 0); assert.equal(l.raid, null); assert.equal(l.attack, null); assert.equal(l.bolts.length, 0);
  assert.equal(l.balls.length, 1); assert(l.aim?.serve && l.balls[0].caught); assert.equal(l.shield, 2); assert.equal(l.shieldT, 10);
  // back in action: the serve waits for the player and the jump clock holds; the 6 s grace starts with the serve
  const clock = l.clock, wave = l.waveRemaining; advance(l, 5, true);
  assert(l.aim?.serve && l.backHold); assert.equal(l.clock, clock); assert.equal(l.waveRemaining, wave); assert.equal(l.shieldT, 10);
  l.release(); assert(!l.aim && !l.backHold); assert(l.nextSquad >= l.clock + 5.96);
});

test('a lethal bolt costs one life, cannot repeat during fresh-serve grace, and SHIELD remains ball-only', () => {
  const l = parked(); l.shield = 2; l.shieldT = 10;
  l.bolts = [{ id: 'lethal-fixture', x: l.paddle.x + 35, y: l.paddle.y - 20, vx: 0, vy: 300, r: 3.5 }];
  l.updateBolts(.2); assert.equal(l.lives, 2); assert.equal(l.paddle.stun, 0); assert.equal(l.shield, 2);
  assert.equal(l.bolts.length, 0); assert(l.aim?.serve); l.updateBolts(.2); assert.equal(l.lives, 2);
});
