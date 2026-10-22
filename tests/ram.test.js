// Sweet-Spot Ram everywhere (src/fantasy/ram.js): one block per level family. Castle chapters with their own physics
// (Bellforge, Tidewheel) and the shared Arena levels (grid: Vault, Mooncoil, Invasion; targets: Frost, Carrier, Circuit, Forge).
// Gatehouse, Lumi tower and Serpent Rivals keep their own ram tests.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

globalThis.Image = class { complete = true; naturalWidth = 1; width = 1024; height = 768; decode() { return Promise.resolve(); } };
const gradient = { addColorStop() {} }, context = new Proxy({}, { get: (_, k) => k === 'createLinearGradient' ? () => gradient : () => {} });
globalThis.document ??= { createElement: () => ({ getContext: () => context }) };
const prefs = new Map();
globalThis.localStorage ??= { getItem: k => prefs.get(k) ?? null, setItem: (k, v) => prefs.set(k, v) };

const { RAM } = await import('../src/fantasy/ram.js');
const { Bellforge } = await import('../src/fantasy/bellforge.js');
const { Tidewheel, raftPoint } = await import('../src/fantasy/tidewheel.js');
const { makeBall, stepBall, cellAt } = await import('../src/physics.js');
const { Vault } = await import('../src/vault.js');
const { Mooncoil } = await import('../src/mooncoil.js');
const { Invasion } = await import('../src/invasion.js');
const { Frost } = await import('../src/frost.js');
const { Carrier } = await import('../src/carrier.js');
const { Relay } = await import('../src/relay.js');
const { Orbital } = await import('../src/orbital.js');
const { circuitData } = await import('../tools/relay-circuit/data.mjs');

const ramBall = (b, bricks = RAM.bricks) => Object.assign(b, { ram: RAM.time, ramBricks: bricks, ramBaseR: b.r, r: RAM.r });

// ---------- Bellforge ----------
const bfBall = (g, x, y, vx, vy) => ({ id: ++g.serial, x, y, px: x, py: y, vx, vy, r: 6, caught: false, dead: false, ram: 0, ramBricks: 0, contacts: new Set() });
const bfRun = (g, b, until, n = 480) => { for (let i = 0; i < n && !until(b); i++) g.moveBall(b, 1 / 240); return b; };
const bfDrop = (g, dx) => { const p = g.paddle, b = bfBall(g, p.x + dx, p.y - 24, 0, 300); g.balls = [b]; return bfRun(g, b, b => b.vy < 0, 120); };

test('Bellforge ram: three centre returns arm it, the fourth launches; an off-centre return resets an unarmed streak', () => {
  const g = new Bellforge(); g.launch(); g.bricks = [];
  bfDrop(g, 0); bfDrop(g, 4); assert.equal(g.paddle.streak, 2); bfDrop(g, 40); assert.equal(g.paddle.streak, 0);
  for (const dx of [0, -5, 6]) bfDrop(g, dx);
  assert(g.paddle.armed); assert(g.effects.some(e => e.kind === 'ram-armed'));
  bfDrop(g, 40); assert(g.paddle.armed, 'an armed paddle waits through a stray return');
  const b = bfDrop(g, 2); assert.equal(b.r, RAM.r); assert(b.ram > 0); assert.equal(b.ramBricks, RAM.bricks); assert(!g.paddle.armed); assert.equal(g.paddle.streak, 0);
});
test('Bellforge ram: ploughs ordinary bricks up to its budget, bounces off a ramp pin, hits Korr for RAM.damage and ends on time', () => {
  const g = new Bellforge(); g.launch();
  g.bricks = Array.from({ length: 6 }, (_, i) => ({ id: `col-${i}`, type: 'brick', x: 200, y: 520 - i * 24, w: 36, h: 18, hp: 1, maxHP: 1, colour: 'cyan' }));
  const b = ramBall(bfBall(g, 218, 580, 0, -345), 4);
  bfRun(g, b, b => b.vy > 0);
  assert.equal(g.bricks.filter(x => x.hp > 0).length, 1, '4 ploughed, then the plain ball breaks one and rebounds'); assert.equal(b.r, 6); assert.equal(b.ram, 0);
  g.bricks = [{ id: 'pin-x', type: 'pin', x: 200, y: 500, w: 30, h: 18, hp: 2, maxHP: 2 }];
  const c = bfRun(g, ramBall(bfBall(g, 215, 560, 0, -345)), b => b.vy > 0);
  assert(c.vy > 0, 'the pin bounces the ram'); assert.equal(g.bricks[0].hp, 1, 'and takes one normal hit'); assert(c.ram > 0);
  g.bricks = []; const hp = g.villain.hp;
  bfRun(g, ramBall(bfBall(g, 60, 300, 0, -345)), b => b.vy > 0);
  assert.equal(g.villain.hp, hp - RAM.damage);
  const d = ramBall(bfBall(g, 300, 520, 0, 0));
  bfRun(g, d, () => false, 576); assert.equal(d.r, RAM.r); bfRun(g, d, () => false, 48); assert.equal(d.r, 6); assert.equal(d.ram, 0);
});

// ---------- Tidewheel ----------
const twBall = (x, y, vx, vy) => ({ id: 900, x, y, px: x, py: y, vx, vy, r: 6, caught: false, ram: 0, ramBricks: 0, contacts: new Set() });
const twRun = (g, b, until, n = 480) => { for (let i = 0; i < n && !until(b); i++) g.moveBall(b, 1 / 240); return b; };
const twDrop = (g, dx) => { const p = g.paddle, b = twBall(p.x + dx, p.y - 30, 0, 300); g.balls = [b]; return twRun(g, b, b => b.vy < 0, 120); };

test('Tidewheel ram: arms after three centre returns, launches on the fourth, an off-centre return resets the streak', () => {
  const g = new Tidewheel(); g.started = true; g.phase = 'play';
  twDrop(g, 0); twDrop(g, -3); twDrop(g, 45); assert.equal(g.paddle.streak, 0); assert(!g.paddle.armed);
  for (const dx of [0, 5, -5]) twDrop(g, dx);
  assert(g.paddle.armed); assert(g.effects.some(e => e.kind === 'ram-armed'));
  const b = twDrop(g, 0); assert.equal(b.r, RAM.r); assert(b.ram > 0); assert(!g.paddle.armed);
  // cosmic on a ram ball ends the ram first; a cosmic ball never launches one
  g.balls = [b]; g.charge = 100; assert(g.activate('cosmic')); assert.equal(b.ram, 0); assert.equal(b.r, 8);
  g.paddle.armed = true; const p = g.paddle, t = Object.assign(twBall(p.x, p.y - 30, 0, 300), { titan: 4, r: 8 }); twRun(g, t, b => b.vy < 0, 120);
  assert(!(t.ram > 0)); assert(p.armed, 'the armed paddle waits for a plain ball');
});
test('Tidewheel ram: ploughs the raft bricks, bounces off the deck, ends on its budget or its timer', () => {
  const g = new Tidewheel(); g.started = true; g.phase = 'play';
  const raft = g.rafts[0], col = g.bricks.filter(q => q.raft === 0 && q.lx === -54), top = raftPoint(raft, -54 + 17, -60);
  const b = twRun(g, ramBall(twBall(top.x, top.y - 20, 0, 345)), b => b.vy < 0);
  assert(col.every(q => q.hp === 0), 'the whole raft column is ploughed'); assert(b.vy < 0, 'the deck bounces it'); assert(b.ram > 0); assert.equal(b.ramBricks, RAM.bricks - col.length);
  const hp = g.villain.hp; g.hit({ kind: 'shell', id: 'shell' }, b); assert.equal(g.villain.hp, hp - RAM.damage);
  const g2 = new Tidewheel(), cols = g2.bricks.filter(q => q.raft === 1 && q.lx === -54), top2 = raftPoint(g2.rafts[1], -54 + 17, -60);
  const c = twRun(g2, ramBall(twBall(top2.x, top2.y - 20, 0, 345), 2), b => b.vy < 0);
  assert.equal(cols.filter(q => q.hp === 0).length, 3, '2 ploughed, then the plain ball breaks a third and rebounds'); assert.equal(c.r, 6);
  const d = ramBall(twBall(180, 520, 0, 0)); twRun(g2, d, () => false, 576); assert.equal(d.r, RAM.r); twRun(g2, d, () => false, 48); assert.equal(d.r, 6);
});

// ---------- Arena: shared paddle path, grid levels ----------
const arenaDrop = (l, dx) => {
  const p = l.paddle, b = makeBall(p.x + dx, p.y - 24, 0, 300, l.ballRadius); l.balls = [b]; l.aim = null;
  for (let i = 0; i < 120 && b.vy > 0; i++) stepBall(b, 1 / 240, l.liveWorld());
  return b;
};
const live = l => { l.aim = null; l.balls = []; return l; };
// A ball under (c, r) flying straight up through the level's live world, rebuilt every step like Arena.update does.
const gridShot = (l, c, r, { ram = true, bricks, until = b => b.vy > 0, n = 480 } = {}) => {
  const G = l.grid, b = makeBall(G.ox + (c + .5) * G.cw, G.oy + (r + 1) * G.ch + RAM.r + .5, 0, -345, l.ballRadius);
  if (ram) ramBall(b, bricks); l.balls = [b];
  for (let i = 0; i < n && !b.dead && !until(b); i++) stepBall(b, 1 / 240, { ...l.liveWorld(), paddle: null });
  return b;
};
const vaultLayout = rows => Array.from({ length: 20 }, (_, r) => Array.from({ length: 20 }, (_, c) => rows(c, r)).join(''));

test('Arena ram (Vault): arms on three centre returns, an off-centre return resets, TITAN never launches it, Focus pauses it', () => {
  const l = live(new Vault(360, 729, 393 / 360));
  arenaDrop(l, 0); arenaDrop(l, 5); assert.equal(l.paddle.streak, 2); arenaDrop(l, 30); assert.equal(l.paddle.streak, 0);
  for (const dx of [0, 4, -6]) arenaDrop(l, dx);
  assert(l.paddle.armed); arenaDrop(l, -30); assert(l.paddle.armed, 'armed waits');
  // a TITAN ball keeps the paddle armed for the next plain ball
  const p = l.paddle, t = makeBall(p.x, p.y - 24, 0, 300, l.ballRadius); t.titan = 5; t.r = 10; l.balls = [t];
  for (let i = 0; i < 120 && t.vy > 0; i++) stepBall(t, 1 / 240, l.liveWorld());
  assert(p.armed); assert(!(t.ram > 0));
  const b = arenaDrop(l, 1); assert.equal(b.r, RAM.r); assert.equal(b.ram, RAM.time); assert(!p.armed); assert.equal(p.streak, 0);
  // Focus: a caught ram keeps its timer, paused, until it is released
  b.caught = true; l.balls = [b]; for (let i = 0; i < 60; i++) l.update(1 / 120); assert.equal(b.ram, RAM.time);
  b.caught = false; b.x = 180; b.y = 480; b.vx = b.vy = 0;
  for (let i = 0; i < 288; i++) l.update(1 / 120); assert.equal(b.r, RAM.r);
  for (let i = 0; i < 24; i++) l.update(1 / 120); assert.equal(b.r, l.ballRadius); assert.equal(b.ram, 0);
});
test('Arena ram (Vault grid): ploughs one-hit bricks up to 14, bounces off two-hit glaze and granite', () => {
  const l = live(new Vault(360, 729, 393 / 360, 'easy', { layout: vaultLayout((c, r) => c === 3 && r >= 2 && r <= 17 ? 'g' : c === 10 && r === 12 ? 't' : c === 15 && r === 12 ? '#' : '.') }));
  const gold = () => l.bricks.filter(q => q.kind === 5 && !q.gone).length;
  const b = gridShot(l, 3, 17);
  assert.equal(gold(), 16 - 14 - 1, '14 ploughed, then the plain ball breaks one and rebounds'); assert.equal(b.r, l.ballRadius); assert.equal(b.ram, 0);
  const teal = l.bricks.find(q => q.kind === 4), t = gridShot(l, 10, 12);
  assert(t.vy > 0); assert.equal(teal.hp, 1, 'two-hit teal takes one normal hit'); assert(t.ram > 0);
  const g = gridShot(l, 15, 12); assert(g.vy > 0); assert(cellAt(l.grid, 15, 12), 'granite holds'); assert(g.y - g.r >= l.grid.oy + 13 * 16 - 1, 'never passes into granite');
});
test('Arena ram (Mooncoil): blue banks plough; violet moonstone armour and the cage bars take a normal hit', () => {
  const l = live(new Mooncoil(360, 729, 393 / 360)), G = l.grid;
  assert(l.ramPierce({ cell: 6 })); assert(l.ramPierce({ cell: 5 })); assert(!l.ramPierce({ cell: 3 })); assert(!l.ramPierce({ cell: 8 })); assert(!l.ramPierce({ cell: 9 }));
  const before = l.bricks.find(q => q.c === 19 && q.r === 2 || (q.c <= 19 && q.c + q.n > 19 && q.r === 2));
  const v = gridShot(l, 19, 2); assert(v.vy > 0, 'violet bounces the ram'); assert.equal(before.hp, before.max - 1);
  const blue = l.bricks.filter(q => q.r === 6 && q.kind === 6 && q.c + q.n > 16 && q.c <= 16);
  const b = gridShot(l, 16, 6, { until: b => b.vy > 0 || b.y < G.oy + 4 * 16 });
  assert(blue.every(q => q.gone)); assert(b.vy < 0, 'flight unchanged through the bank');
});
test('Arena ram (Invasion grid): candy ploughs, armour and robots bounce, the mothership takes RAM.damage', () => {
  const l = live(new Invasion(360, 729, 393 / 360)), G = l.grid; G.cells.fill(0); G.hp.fill(0);
  for (let r = 3; r < 9; r++) { G.cells[r * G.cols + 5] = 1; G.hp[r * G.cols + 5] = 1; }
  G.cells[2 * G.cols + 5] = 2; G.hp[2 * G.cols + 5] = 3; G.cells[1 * G.cols + 5] = 1; G.hp[1 * G.cols + 5] = 1;
  const b = gridShot(l, 5, 8);
  for (let r = 3; r < 9; r++) assert.equal(cellAt(G, 5, r), 0, `candy row ${r} ploughed`);
  assert(b.vy > 0, 'armour bounces'); assert.equal(G.hp[2 * G.cols + 5], 2); assert.equal(cellAt(G, 5, 1), 1, 'nothing behind the armour is touched');
  assert(!l.ramPierce({ cell: 4 }));
  l.startBoss(); const B = l.boss, hits = []; B.y = B.ty; B.bombT = 99; l.hitBoss = n => hits.push(n);
  const m = ramBall(makeBall(180, B.ty - 2.8 + 22, 0, -345, l.ballRadius)); l.balls = [m]; l.updateBoss(1e-4);
  assert.deepEqual(hits, [RAM.damage]); assert(m.vy > 0, 'the saucer bounces the ram');
});

// ---------- Arena: target levels ----------
const rectShot = (l, rect, { ram = true, bricks, until = b => b.vy > 0, n = 480, x } = {}) => {
  const b = makeBall(x ?? rect.x + rect.w / 2, rect.y + rect.h + RAM.r + .5, 0, -345, l.ballRadius);
  if (ram) ramBall(b, bricks); l.balls = [b];
  for (let i = 0; i < n && !b.dead && !until(b); i++) stepBall(b, 1 / 240, { ...l.liveWorld(), paddle: null });
  return b;
};

test('Arena ram (Frost targets): wall bricks plough up to the budget, the ice posts bounce it, the Warden takes RAM.damage', () => {
  const l = live(new Frost(360, 729, 393 / 360)); l.started = true;
  const col = l.bricks.filter(q => q.x === 54).sort((a, q) => q.y - a.y);
  const b = rectShot(l, col[0], { bricks: 4 });
  assert.equal(col.filter(q => q.hp > 0).length, 1, '4 ploughed, then the plain ball breaks one and rebounds'); assert.equal(b.r, l.ballRadius);
  const post = l.defences[1], c = rectShot(l, { x: post.x, y: post.y, w: post.w, h: post.h }, { until: b => b.vy > 0 || b.y < post.y - 40 });
  assert(c.vy > 0, 'post bounces'); assert(c.ram > 0); assert(c.y - c.r >= post.y + post.h - 1, 'never passes into the post');
  const hp = l.warden.hp; l.hitTarget('warden', ramBall(makeBall(0, 0, 0, 0, 6))); assert.equal(l.warden.hp, hp - RAM.damage);
});
test('Arena ram (Carrier targets): panels plough, crew pods bounce it and take one normal hit', () => {
  const l = live(new Carrier(360, 729, 393 / 360));
  const brick = l.bricks.find(q => q.art.rect.y > 300) || l.bricks.at(-1);
  const b = rectShot(l, brick.art.rect, { until: b => brick.hp <= 0 || b.vy > 0 });
  assert.equal(brick.hp, 0); assert(b.vy < 0, 'flight unchanged'); assert.equal(b.ramBricks, RAM.bricks - 1);
  const pod = l.crew[3], hp = pod.hp, c = rectShot(l, pod.art.rect);
  assert(c.vy > 0); assert.equal(pod.hp, hp - 1); assert(c.ram > 0);
});
test('Arena ram (Circuit targets): plain panels plough, armoured panels bounce it', () => {
  const l = live(new Relay(360, 729, 393 / 360, 'easy', circuitData()));
  const armour = l.bricks.find(q => q.maxHP > 1), b = rectShot(l, armour.art.rect, { until: b => b.vy > 0 || b.y < 250 });
  assert(b.vy > 0); assert.equal(armour.hp, 1); assert(b.ram > 0);
  const plain = l.bricks.filter(q => q.maxHP === 1).at(-1), c = rectShot(l, plain.art.rect, { until: b => plain.hp <= 0 || b.vy > 0 });
  assert.equal(plain.hp, 0); assert(c.vy < 0);
});
test('Arena ram (Forge targets): plain panels plough, armour panels bounce it', () => {
  const data = JSON.parse(readFileSync(new URL('../assets/orbital-forge/manifest.json', import.meta.url)));
  const l = live(new Orbital(360, 729, 393 / 360, 'medium', data)); l.weaponRandom = () => 0;
  const armour = l.bricks.find(q => q.kind === 'armour'), b = rectShot(l, armour, { until: b => b.vy > 0 || b.y < armour.y - 30 });
  assert(b.vy > 0); assert.equal(armour.hp, 1);
  const plain = l.bricks.filter(q => q.kind !== 'armour').sort((a, q) => q.y - a.y)[0], c = rectShot(l, plain, { until: b => plain.hp <= 0 || b.vy > 0 });
  assert.equal(plain.hp, 0); assert(c.vy < 0);
});
