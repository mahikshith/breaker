import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeBall } from '../src/physics.js';

globalThis.Image = class { complete = true; naturalWidth = 1; decode() { return Promise.resolve(); } };
const { spacePowerLayout, spacePowerAt } = await import('../src/space-companions.js');
const { Arena } = await import('../src/arena.js');
const level = () => {
  const l = new Arena(360, 729, { ballRadius: 7.5, uiScale: 393 / 360 });
  l.spacePowers = true; l.coreMode = 'manual'; l.coreHits = 6; l.difficulty = 'easy'; return l;
};
const open = l => { l.paddle.charge = 1; assert(l.activateCorePower()); };

test('six productive ordinary contacts earn a choice; shots, active TITAN and passive breaks cannot recharge powers', () => {
  const l = level();
  for (let i = 0; i < 30; i++) { l.chargeSpacePower({ shot: true }); l.chargeSpacePower({ titan: 3 }); l.brokeBrick(); }
  assert.equal(l.paddle.charge, 0);
  for (let i = 0; i < 5; i++) l.chargeSpacePower({});
  assert.equal(l.canUseCorePower(), false);
  l.chargeSpacePower({}); assert.equal(l.paddle.charge, 0); assert(Math.abs(l.coreChargeBank - 1) < 1e-9);
  l.updateCoreCharge(2); assert(Math.abs(l.paddle.charge - 1/3) < 1e-9); assert.equal(l.canUseCorePower(), false);
  l.updateCoreCharge(4); assert.equal(l.paddle.charge, 1); assert(l.canUseCorePower());
  for (let i = 0; i < 10; i++) l.chargeSpacePower({});
  assert.equal(l.paddle.charge, 1);
});

test('opening and cancelling keeps the charge, freezes the ball and clears held input without launching', () => {
  const l = level(), b = l.balls[0]; l.pointerDown(180, 690); l.keys[' '] = true;
  const epoch = l.inputEpoch, before = { ...b, trail: [...b.trail] }; open(l);
  assert.equal(l.inputEpoch, epoch + 1); assert.equal(l.ptr.down, false); assert.deepEqual(l.keys, {});
  assert.equal(l.paddle.charge, 1); assert.equal(l.activateCorePower(), false);
  const time = l.t, clock = l.kitTime; l.update(10);
  assert.equal(l.t, time); assert.equal(l.kitTime, clock); assert.deepEqual(b, before);
  l.closePowerMenu(); assert.equal(l.powerMenuOpen, false); assert.equal(l.paddle.charge, 1); assert(b.caught);
  l.key(' ', false); assert.equal(l.suppressedSpace, false); assert(b.caught, 'pre-menu held Space release cannot launch the caught ball');
  assert.equal(l.chooseSpacePower('laser'), false);
});

test('each selected power spends once; laser fires physically and cannot regenerate charge', () => {
  const l = level(); l.release(); open(l);
  assert.equal(l.chooseSpacePower('bogus'), false); assert(l.powerMenuOpen); assert.equal(l.paddle.charge, 1);
  assert(l.chooseSpacePower('laser')); assert.equal(l.paddle.laserT, 8); assert.equal(l.paddle.charge, 0);
  assert.equal(l.chooseSpacePower('titan'), false); l.updateShots(1 / 120);
  assert.equal(l.shots.length, 2); assert(l.shots.every(s => s.vy < 0));
  for (const shot of l.shots) l.chargeSpacePower({ ...shot, shot: true });
  assert.equal(l.paddle.charge, 0);
});

test('keyboard opens and chooses once, while a held pre-menu Space cannot launch on release', () => {
  const l = level(); l.paddle.charge = 1; l.key(' ', true); l.key('k', true);
  assert(l.powerMenuOpen); assert(l.balls[0].caught);
  l.key(' ', false); assert.equal(l.suppressedSpace, false); assert(l.balls[0].caught);
  l.key('1', true); assert.equal(l.paddle.laserT, 8); assert.equal(l.powerMenuOpen, false);
  l.key('1', false); l.key('k', false); assert.equal(l.paddle.charge, 0); assert(l.balls[0].caught);
});

test('unstoppable powers one live ball and expires to its configured radius', () => {
  const l = level(), original = l.balls[0];
  l.balls.push(makeBall(100, 500, 0, -l.speed, 7.5)); open(l);
  assert(l.chooseSpacePower('titan')); assert.equal(original.titan, 8); assert.equal(original.r, 10);
  assert(original.caught); assert(!l.balls[1].titan); assert.equal(l.paddle.charge, 0);
  l.release(); original.titan = .001; l.hitStop = 0; l.update(1 / 120);
  assert.equal(original.titan, 0); assert.equal(original.r, 7.5);
});

test('ball fan adds four ordinary balls, stacks beyond five and never copies TITAN or deletes survivors', () => {
  for (const count of [1, 3]) {
    const l = level(), original = l.balls[0]; original.titan = 4; original.r = 10;
    while (l.balls.length < count) l.balls.push(makeBall(100, 400, 40, -l.speed, 7.5));
    const survivors = [...l.balls]; open(l); assert(l.chooseSpacePower('five'));
    assert.equal(l.balls.length, count+4); assert.equal(l.aim, null); assert(l.balls.every(b => !b.caught));
    assert(survivors.every(b => l.balls.includes(b))); assert.equal(l.balls.filter(b => b.titan > 0).length, 1);
    for (const b of l.balls.slice(count)) { assert.equal(b.r, 7.5); assert(Math.abs(Math.hypot(b.vx, b.vy) - l.speed) < 1e-7); }
    assert.equal(l.chooseSpacePower('five'), false);
  }
  const l = level(); while (l.balls.length < 6) l.balls.push(makeBall(100, 400, 40, -l.speed, 7.5));
  const before = [...l.balls]; open(l); assert(l.chooseSpacePower('five'));
  assert.equal(l.balls.length, 7); assert(before.every(b => l.balls.includes(b))); assert.equal(l.paddle.charge, 0);
});

test('ball fan and split respect the live-ball ceiling without deleting survivors or spending a blocked choice', () => {
  const l = level(); l.release();
  while (l.balls.length < 6) l.balls.push(makeBall(100, 400, 40, -l.speed, 7.5));
  const before = [...l.balls]; open(l); assert(l.chooseSpacePower('five'));
  assert.equal(l.balls.length, 7); assert(before.every(b => l.balls.includes(b)));
  open(l); assert.equal(l.chooseSpacePower('five'), false);
  assert(l.powerMenuOpen); assert.equal(l.paddle.charge, 1);
  l.closePowerMenu(); l.applyPower('split'); assert.equal(l.balls.length, 7);
  l.balls[0].dead = true; l.applyPower('split');
  assert.equal(l.balls.filter(b => !b.dead).length, 7);
});

test('mode budgets bound companion casts and capsules; full choices retain their charge', () => {
  for (const [mode, balls, cosmic, maxTime] of [['easy',7,1,12],['medium',6,1,10],['hard',5,1,8]]) {
    const l = level(); l.difficulty = mode; l.release();
    for (let i=0;i<8;i++) { open(l); l.chooseSpacePower('five'); l.closePowerMenu(); }
    assert.equal(l.balls.length, balls); l.applyPower('split'); l.applyPower('burst'); assert.equal(l.balls.length, balls);
    open(l); assert.equal(l.chooseSpacePower('five'), false); assert.equal(l.paddle.charge,1); l.closePowerMenu();
    for (let i=0;i<10;i++) { open(l); l.chooseSpacePower('titan'); l.closePowerMenu(); }
    const powered=l.balls.filter(b=>b.titan>0); assert.equal(powered.length,cosmic); assert(powered.every(b=>b.titan===maxTime));
    open(l); assert.equal(l.chooseSpacePower('titan'), false); assert(l.powerMenuOpen); assert.equal(l.paddle.charge,1); l.closePowerMenu();
    for (let i=0;i<5;i++) { open(l); l.chooseSpacePower('laser'); l.closePowerMenu(); }
    assert.equal(l.paddle.laserT,maxTime); l.applyPower('laser'); assert.equal(l.paddle.laserT,maxTime);
    open(l); assert.equal(l.chooseSpacePower('laser'),false); assert.equal(l.paddle.charge,1);
  }
});

test('damage credit is retained but cannot instantly refill the orb or progress in a menu/terminal state', () => {
  const l = level(); l.coreHits=18;
  for(let i=0;i<200;i++)l.chargeSpacePower({});
  assert.equal(l.coreChargeBank,1); assert.equal(l.paddle.charge,0);
  l.updateCoreCharge(1); assert.equal(l.paddle.charge,1/18);
  const saved=[l.paddle.charge,l.coreChargeBank];l.powerMenuOpen=true;l.updateCoreCharge(100);
  assert.deepEqual([l.paddle.charge,l.coreChargeBank],saved);
  l.powerMenuOpen=false;l.state='lost';l.updateCoreCharge(100);assert.deepEqual([l.paddle.charge,l.coreChargeBank],saved);
  l.state='play';l.updateCoreCharge(17);assert.equal(l.paddle.charge,1);assert(l.activateCorePower());assert(l.chooseSpacePower('laser'));
  assert.equal(l.coreChargeBank,0);l.updateCoreCharge(50);assert.equal(l.paddle.charge,0,'time alone does not earn a new power');
});

test('positive pickups add bounded time; repeat cosmic extends the one powered survivor', () => {
  const l=level();for(const kind of ['fire','laser','slow','shield']){l.applyPower(kind);l.applyPower(kind);}
  assert.equal(l.fireT,16);assert.equal(l.paddle.laserT,12);assert.equal(l.slowT,16);assert.equal(l.shield,4);assert.equal(l.shieldT,32);
  l.balls.push(makeBall(100,400,0,-l.speed,7.5));open(l);assert(l.chooseSpacePower('titan'));
  const first=l.balls.find(b=>b.titan>0);first.titan=4;open(l);assert(l.chooseSpacePower('titan'));
  assert.equal(first.titan,12);assert.equal(l.balls.filter(b=>b.titan>0).length,1);
  open(l);assert.equal(l.chooseSpacePower('titan'),false);assert(l.balls.some(b=>b.titan===12));assert.equal(l.paddle.charge,1);
});

test('repeated WIDE expands further, adds time and stays inside the actual playfield', () => {
  const l=level(),p=l.paddle;l.release();l.applyPower('wide');for(let i=0;i<80;i++)l.update(1/120);const once=p.w,time=p.wideT;
  l.applyPower('wide');assert.equal(p.wideLevel,2);assert.equal(p.wideT,time+12);
  for(let i=0;i<80;i++)l.update(1/120);assert(p.w>once+30);
  for(let i=0;i<20;i++)l.applyPower('wide');for(let i=0;i<80;i++)l.update(1/120);
  assert(p.w<=l.right-l.left-16);assert(p.x-p.w/2>=l.left-1e-6&&p.x+p.w/2<=l.right+1e-6);
  p.wideT=0;l.update(1/120);assert.equal(p.wideLevel,0);
});

test('three phone-size choice targets are at least44 CSS pixels, fit the screen and match rendered hit boxes', () => {
  for (const [H, scale] of [[729, 393 / 360], [785, 412 / 360]]) {
    const l = level(); l.H = H; l.kitUIScale = scale;
    const a = spacePowerLayout(l);
    assert(a.x >= 0 && a.y > 44 / scale && a.x + a.w <= l.W && a.y + a.h < l.H);
    assert.equal(a.choices.length, 3);
    for (const c of a.choices) {
      assert(c.w * scale >= 44 && c.h * scale >= 44);
      assert.equal(spacePowerAt(l, c.x + c.w / 2, c.y + c.h / 2), c.id);
    }
    assert.equal(spacePowerAt(l, a.close.x + 22 / scale, a.close.y + 22 / scale), 'close');
    assert.equal(spacePowerAt(l, 180, 100), 'close');
  }
});
