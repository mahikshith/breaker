import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeBall, stepBall } from '../src/physics.js';
import { overlapsTarget } from '../src/carrier-physics.js';

globalThis.Image = class { complete = true; naturalWidth = 1; width = 512; height = 768; decode() { return Promise.resolve(); } };
const { Carrier } = await import('../src/carrier.js');
const { Arena } = await import('../src/arena.js');
const { SPR } = await import('../src/gfx.js');
const level = () => new Carrier(360, 729, 393 / 360);
const hit = (l, id) => l.hitTarget(id, { x: 180, y: 180, r: l.ballRadius });

test('Carrier uses one continuous image transform through both signed safe-inset origins', () => {
  for (const top of [22, -6]) {
    const l = level(), calls = [], g = { drawImage: (...args) => calls.push(args) };
    l.drawFullBleedBackground(g, top, 780);
    l.paintBackground(g, -top, 780);
    assert.equal(calls.length, 2);
    assert.equal(calls[0].length, 5, 'whole source image, no repeated source row');
    assert.equal(calls[0][0], calls[1][0]);
    assert.deepEqual(calls[0].slice(3), calls[1].slice(3));
    assert.equal(calls[1][2] + top, calls[0][2]);
    assert(calls[0][4] >= 780);
  }
});

test('Carrier dimensions persist through earned split, burst and TITAN expiry', () => {
  const l = level();
  assert.deepEqual([l.paddle.w, l.paddle.h, l.balls[0].r], [125, 17, 7.5]);
  l.release(); l.applyPower('split'); l.applyPower('burst');
  assert.equal(l.balls.length, 6); assert(l.balls.every(b => b.r === 7.5));
  const b = l.balls[0]; Object.assign(b, { titan: .01, r: 10 }); l.update(.02);
  assert.equal(b.r, 7.5); assert.equal(b.titan, 0);
  const ordinary = new Arena(360, 729);
  assert.deepEqual([ordinary.paddle.w, ordinary.paddle.h, ordinary.balls[0].r], [74, 12, 6]);
});

test('Carrier UNSTOPPABLE uses the existing cosmic sprite while ordinary balls retain their Carrier artwork', () => {
  const l=level(),b=l.balls[0],calls=[];b.titan=10;b.r=10;
  const gradient={addColorStop(){}};
  const g=new Proxy({drawImage:(...a)=>calls.push(a),createRadialGradient:()=>gradient,createLinearGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
  l.drawBalls(g);assert(calls.some(a=>a[0]===SPR.ball_titan.img),'actual canonical cosmic ball raster is drawn');
  calls.length=0;b.titan=0;b.r=7.5;l.drawBalls(g);assert.equal(calls.length,1);assert.notEqual(calls[0][0],SPR.ball_titan.img);
});

test('an ordinary ball breaks visible panel cover, rebounds and drops one authored reward', () => {
  const l = level(), panel = l.bricks.find(b => b.payload === 'laser'), r = panel.art.rect;
  assert.equal(l.bricks.length, 16); assert.equal(l.crew.length, 5);
  assert.deepEqual(l.bricks.filter(b => b.payload).map(b => b.payload).sort(), ['laser', 'shield', 'split']);
  const b = makeBall(r.x + r.w / 2, r.y + r.h + 14, 0, -345, 7.5);
  const world = l.world(); world.targets = world.targets.filter(t => t.id === panel.id);
  stepBall(b, .06, world);
  assert.equal(panel.hp, 0); assert(b.vy > 0, 'final HP still rebounds a normal ball');
  assert.equal(l.drops.filter(d => d.kind === 'laser').length, 1);
  hit(l, panel.id); assert.equal(l.drops.filter(d => d.kind === 'laser').length, 1);
});

test('the open bay stays empty and disabled opaque machinery remains physical', () => {
  const l = level(); l.clock = 3;
  const bay = l.assembly.hangar, probe = { x: bay.x, y: bay.y, r: 5 };
  assert(!l.targets().some(t => t.id === 'carrier' && overlapsTarget(probe, t)));
  l.carrier.hp = 0;
  const body = l.targets().find(t => t.id === 'disabled-carrier');
  assert(body && body.hp === undefined && body.pierceable === false);
  assert(!overlapsTarget(probe, body));
  const b = makeBall(180, 229, 0, -345, 7.5); b.titan = 5;
  stepBall(b, .03, l.world());
  assert(b.vy > 0, 'powered balls rebound from the still-visible disabled body');
  assert.equal(l.carrier.hp, 0);
});

test('aim preview cannot damage actual crew, carrier, guns or rewards', () => {
  const l = level(), snapshot = () => JSON.stringify({ hp: l.carrier.hp, crew: l.crew, bricks: l.bricks, guns: l.guns, score: l.score, drops: l.drops, phase: l.phase });
  l.aim.angle = -.2;
  const before = snapshot();
  l.drawAim(new Proxy({}, { get: () => () => {} }));
  assert.equal(snapshot(), before);
});

test('all five housings begin safe release while optional carrier damage remains unfinished', () => {
  const l = level();
  for (const c of l.crew.slice(0, 4)) while(c.hp>0)hit(l,c.id);
  assert.equal(l.phase, 'carrier'); assert.equal(l.state, 'play');
  while(l.crew[4].hp>0)hit(l,l.crew[4].id);
  assert.equal(l.phase, 'escape'); assert.equal(l.state, 'play'); assert.equal(l.carrier.hp, l.carrier.maxHP);
  l.update(1.9); assert.equal(l.state, 'play');
  l.update(.1); assert.equal(l.phase, 'retreat'); assert.equal(l.state, 'play');
  l.update(1.6); assert.equal(l.state, 'won');
  assert(l.inspect().crew.every(c => c.escaped && c.secured));
});

test('loss freezes actors and Continue keeps earned progress with a fresh protected serve', () => {
  const l = level(), c = l.crew[0], panel = l.bricks.find(b => b.payload);
  hit(l, c.id); hit(l, panel.id); hit(l, 'carrier');
  l.lives = 1; l.loseBall(); assert.equal(l.state, 'lost');
  const before = JSON.stringify(l.inspect()); l.update(10); assert.equal(JSON.stringify(l.inspect()), before);
  l.continueRun();
  assert.equal(l.state, 'play'); assert.equal(l.carrier.hp, l.carrier.maxHP-1); assert.equal(c.hp, l.rules.lockHP-1); assert.equal(panel.hp, 0);
  assert.equal(l.balls.length, 1); assert(l.aim.serve && l.balls[0].caught);
  assert.equal(l.balls[0].r, 7.5); assert.equal(l.shield, 2); assert.equal(l.shieldT, 10);
  assert.equal(l.bolts.length, 0); assert.equal(l.attack, null); assert.equal(l.nextAttack, l.clock + 3);
});

test('cannon warning precedes aerial fire; intact panels survive and direct paddle hits cost one life', () => {
  const l = level(); l.weaponRandom = () => 0; l.release(); l.nextAttack = 0;
  l.updateLevel(.01); assert(l.attack && !l.attack.fired); assert.equal(l.bolts.length, 0);
  l.updateLevel(1.19); assert.equal(l.bolts.length, 0);
  l.updateLevel(.17); assert(l.attack.fired);
  const panel = l.bricks[0], r = panel.art.rect;
  l.bolts = [{ id: 'cover-probe', x: r.x + r.w / 2, y: r.y - 20, vx: 0, vy: 215, r: 3.5 }];
  l.updateBolts(.2);
  assert.equal(l.bolts.length, 1); assert.equal(panel.hp, 1); assert.equal(l.paddle.stun, 0);
  l.shield = 2;
  l.bolts = [{ id: 'paddle-probe', x: l.paddle.x + 40, y: l.paddle.y - 22, vx: 0, vy: 215, r: 3.5 }];
  l.updateBolts(.15);
  assert.equal(l.lives, 2); assert.equal(l.paddle.stun, 0); assert.equal(l.shield, 2, 'existing SHIELD saves missed balls, not hostile shots');
});
