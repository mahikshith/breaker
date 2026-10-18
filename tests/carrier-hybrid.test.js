import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeBall } from '../src/physics.js';
import { overlapsTarget, collideTargets } from '../src/carrier-physics.js';

globalThis.Image = class { complete = true; naturalWidth = 1; width = 512; height = 768; decode() { return Promise.resolve(); } };
const { Carrier, carrierArcPoint } = await import('../src/carrier.js');
const level = (mode = 'medium', H = 729, scale = 393 / 360) => new Carrier(360, H, scale, mode);
const hit = (l, id, extra = {}) => l.hitTarget(id, { x: 180, y: 240, r: 7.5, ...extra });
const freeAll = l => { for (const c of l.crew) while (c.hp > 0) hit(l, c.id); };
const advance = (l, s) => { for (let i = 0; i < Math.round(s * 120); i++) l.update(1 / 120); };
// Explicit lifecycle fixtures below are not earned play; the separate two-phone run uses public inputs only.

test('mode construction keeps ordinary geometry and selects real HP, clock and finite manifests', () => {
  for (const [mode, hp, raiderHP, hullHP, coreHits, seconds, waves] of [['easy',5,2,45,24,Infinity,1],['medium',6,3,60,30,75,2],['hard',7,4,78,36,75,2]]) {
    const l = level(mode); assert.equal(l.difficulty.id, mode); assert.equal(l.coreHits, coreHits); assert.equal(l.carrier.maxHP,hullHP);
    assert(l.crew.every(c => c.hp === hp && c.maxHP === hp)); assert.equal(l.rules.raiderHP, raiderHP);
    assert.equal(l.waveRemaining, seconds); assert.equal(l.rules.waves, waves);
    assert.deepEqual([l.paddle.w, l.paddle.h, l.ballRadius], [125,17,7.5]);
  }
  assert.equal(new Carrier(360,729).difficulty.id, 'easy');
});

test('mode budget counts partial locks and linked guns once; self TITAN and dead targets earn nothing', () => {
  const l = level('hard'); hit(l, l.crew[0].id); assert.equal(l.crew[0].hp, 6); assert.equal(l.paddle.charge, 0); assert.equal(l.coreChargeBank, 1 / l.coreHits);
  const hp = l.carrier.hp; hit(l, l.guns[0].id); assert.equal(l.carrier.hp, hp - 1); assert.equal(l.paddle.charge, 0); assert.equal(l.coreChargeBank, 2 / l.coreHits);
  hit(l, l.crew[1].id, { titan: 7 }); assert.equal(l.crew[1].hp, 5); assert.equal(l.paddle.charge, 0); assert.equal(l.coreChargeBank, 2 / l.coreHits);
  for (const b of l.bricks.slice(0,4)) hit(l,b.id);
  for(let i=6;i<l.coreHits;i++)hit(l,'carrier');
  assert(Math.abs(l.coreChargeBank-1)<1e-9);assert.equal(l.paddle.charge,0);l.updateCoreCharge(l.coreHits);
  assert.equal(l.paddle.charge, 1); assert.equal(l.crew[0].hp, 6);
  l.paddle.charge = 0; hit(l,l.bricks[0].id); assert.equal(l.paddle.charge, 0);
  l.bolts.push({ id: 'productive-intercept', x: 180, y: 420 });
  hit(l,'productive-intercept'); hit(l,'productive-intercept'); assert.equal(l.paddle.charge, 0); assert.equal(l.coreChargeBank, 0);
});

test('earned credit fills at one contact per active second through Focus and hit-stop, and freezes during protected phases', () => {
  for(const mode of ['easy','medium','hard']) {
    const l=level(mode);for(let i=0;i<l.coreHits;i++)hit(l,'carrier');assert.equal(l.paddle.charge,0);assert(Math.abs(l.coreChargeBank-1)<1e-9);
    l.release();l.balls[0].caught=true;l.timeScale=.25;l.hitStop=.3;advance(l,1);
    assert(Math.abs(l.paddle.charge-1/l.coreHits)<1e-8);assert(Math.abs(l.coreChargeBank-(1-1/l.coreHits))<1e-8);
    const before=[l.paddle.charge,l.coreChargeBank];
    for(const phase of ['escape','rebuild','retreat']){l.phase=phase;l.transitionAge=0;l.update(.2);assert.deepEqual([l.paddle.charge,l.coreChargeBank],before);}
    l.phase='carrier';l.updateCoreCharge(l.coreHits);assert.equal(l.paddle.charge,1);assert(l.activateCorePower());assert(l.chooseSpacePower('laser'));assert.equal(l.coreChargeBank,0);
    l.updateCoreCharge(100);assert.equal(l.paddle.charge,0,'elapsed time cannot generate unearned charge after a cast');
  }
});

test('active-real jump time starts at launch, survives Focus/hit-stop and cannot expire during final release', () => {
  const l = level(); advance(l, 7); assert.equal(l.waveRemaining, 75); assert.equal(l.clock, 0);
  l.release(); l.timeScale = .25; l.hitStop = .2;
  advance(l,.15); assert(Math.abs(l.waveRemaining - 74.85) < .02);
  l.waveRemaining = .001; freeAll(l); advance(l, 2);
  assert.equal(l.state, 'play'); assert.equal(l.phase, 'rebuild'); assert.equal(l.archivedCrew.length,5);
});

test('expired jump is a single terminal outcome and Continue retains wave/resources with bounded time and grace', () => {
  const l = level('hard'); l.release(); hit(l,l.crew[0].id); l.paddle.charge = .5;
  l.waveRemaining = .005; l.bolts.push({ id: 'late-life', x: l.paddle.x + 45, y: l.paddle.y - 1, vx:0,vy:300,r:3.5 });
  l.updateLevel(.01); assert.equal(l.state,'lost'); assert.equal(l.reason,'Carrier jumped'); assert.equal(l.lives,3);
  const before = JSON.stringify(l.inspect()); l.update(50); assert.equal(JSON.stringify(l.inspect()),before);
  l.continueRun(); assert.equal(l.waveRemaining,30); assert.equal(l.encounterWave,1); assert.equal(l.crew[0].hp,6); assert.equal(l.paddle.charge,.5);
  assert.equal(l.serveLimit,3); l.release(); assert.equal(l.enemyGraceUntil,l.clock + 6); assert.equal(l.nextSquad,l.clock + 6);
});

test('safe rebuild archives five unique secured identities and preserves multiball, HP and every power duration', () => {
  const l = level(); l.release(); l.balls.push(makeBall(90,450,50,-345,7.5)); l.balls[0].titan = 3; l.balls[0].r = 10;
  l.fireT = 5; l.slowT = 4; l.shield = 2; l.shieldT = 9; l.paddle.laserT = 3; l.paddle.charge = .5;
  l.dropPower(110,370,'shield'); const drop = { ...l.drops[0] }; l.carrier.hp = 13;
  const ids = l.crew.map(c => c.id); freeAll(l); advance(l,2);
  assert.equal(l.phase,'rebuild'); assert(l.archivedCrew.every(c => c.secured));
  assert.deepEqual(l.archivedCrew.map(c => c.id),ids); assert(l.crew.every(c => !ids.includes(c.id)));
  const powers = [l.fireT,l.slowT,l.shieldT,l.paddle.laserT,l.balls[0].titan,l.coreChargeBank]; l.update(3.6-l.transitionAge);
  assert.equal(l.phase,'carrier'); assert.equal(l.encounterWave,2); assert.equal(l.carrier.hp,13); assert.equal(l.balls.length,2);
  assert.deepEqual([l.fireT,l.slowT,l.shieldT,l.paddle.laserT,l.balls[0].titan,l.coreChargeBank],powers);
  assert.deepEqual(l.drops[0],drop); assert(l.aim?.serve); assert.equal(l.waveRemaining,75); assert.equal(l.waveLaunched,false);
  l.release(); assert(l.balls.every(b => !b.caught)); assert(l.balls.filter(b => b.titan > 0).length === 1);
  assert(l.guns.every(g => g.id.startsWith('w2-')));
});

test('second grid changes the centre route without overlapping pods or invading the return lane; caches have new IDs', () => {
  const l = level(); const old = l.bricks.map(b => b.id); freeAll(l); advance(l,5.6);
  assert.equal(l.bricks.length,16); assert.equal(l.crew.length,5);
  assert(l.bricks.every(b => !old.includes(b.id))); assert.deepEqual(l.bricks.filter(b => b.payload).map(b => b.payload).sort(),['laser','shield','split']);
  assert(l.crew.some(c => l.centre(c).y > 268 && l.centre(c).y < 294));
  const objects = [...l.bricks,...l.crew];
  for (const o of objects) { assert(o.art.rect.y + o.art.rect.h < 341.5); for (const p of objects) if (p !== o) {
    const a=o.art.rect,b=p.art.rect; assert(!(a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y),`${o.id} overlaps ${p.id}`);
  } }
});

test('two complete manifests terminate once with ten safe identities; a defeated hull cancels new work without resurrection', () => {
  const l=level(); freeAll(l); advance(l,5.6); assert.equal(l.encounterWave,2);
  const archived=JSON.stringify(l.archivedCrew); freeAll(l); advance(l,3.7); assert.equal(l.state,'won'); assert.equal(l.result().lines[1][1],'10 / 10'); assert.equal(JSON.stringify(l.archivedCrew),archived);
  const d=level(); d.carrier.hp=1; hit(d,'carrier'); assert(d.shutdown); freeAll(d); advance(d,3.7);
  assert.equal(d.state,'won'); assert.equal(d.encounterWave,1); assert.equal(d.carrier.hp,0); assert.equal(d.archivedCrew.length,0); assert.equal(d.result().lines[1][1],'5 / 5');
});

test('nose, muzzle, moving collision and housing tractor share the actual48x40 pose at both phone heights', () => {
  for (const [H,s] of [[729,393/360],[785,412/360]]) {
    const l=level('medium',H,s); l.release(); l.clock=12;
    const c=l.crew[2], f={id:'pose-fighter',hp:3,maxHP:3,born:5,path:l.assembly.fighterPaths[0],stage:'extract',stageAt:10,side:-1,dockX:138};
    l.fighters=[f]; l.raid={fighterId:f.id,targetId:c.id,stage:'extract',extractAt:l.clock-l.rules.extractSeconds+1};
    const p=l.fighterPose(f), target=l.centre(c), dx=target.x-p.x,dy=target.y-p.y,n=Math.hypot(dx,dy),m=l.actorPose(f.id);
    assert.deepEqual([p.w,p.h],[48,40]); assert(l.paddle.y-p.y >= 200);
    assert(Math.abs(-Math.sin(p.angle)-dx/n)<1e-9 && Math.abs(Math.cos(p.angle)-dy/n)<1e-9);
    assert(Math.hypot(m.x-p.x,m.y-p.y)-16<1e-9);
    const t=l.targets().find(t=>t.id===f.id); assert(t && overlapsTarget({x:p.x,y:p.y,r:1},t));
    assert(l.workerPose(c).pull>0); const hull=l.hullPose(),base=l.assembly.hull,boss=l.bossPose(); assert(Math.abs(hull.x-base.x-boss.x)<1e-10);
  }
});

const extracting = (mode = 'medium', H = 729, scale = 393 / 360, side = -1, index = 2) => {
  const l = level(mode,H,scale); l.release(); l.clock = 12;
  const c = l.crew[index], f = { id:'curve-fighter',hp:l.rules.raiderHP,maxHP:l.rules.raiderHP,born:5,path:l.assembly.fighterPaths[0],stage:'extract',stageAt:10,side,dockX:side < 0 ? 98 : 262 };
  l.fighters = [f]; l.raid = { fighterId:f.id,targetId:c.id,stage:'extract',extractAt:l.clock-l.rules.extractSeconds+1,arcBend:side*28 };
  return { l,c,f };
};
const nearPoint = (a,b,message='same point') => assert(Math.hypot(a.x-b.x,a.y-b.y)<1e-8,message);

test('uniform Carrier panels keep centred40x23 slots, finite cache identities and no added grey walls', () => {
  const l=level(),first=l.bricks.map(b=>b.id);
  for(let wave=1;wave<=2;wave++) {
    assert.equal(l.bricks.length,16);assert(l.bricks.every(b=>b.rect[2]===40&&b.rect[3]===23));
    assert(l.bricks.every(b=>['aBrickCyan','aBrickPink'].includes(b.part)));
    assert.deepEqual(l.bricks.filter(b=>b.payload).map(b=>b.payload).sort(),['laser','shield','split']);
    for(const b of l.bricks)assert(Math.abs(b.art.rect.x+b.art.rect.w/2-b.rect[0]-20)<1e-8);
    if(wave===1){l.encounterWave=2;l.makeManifest();}else assert(l.bricks.every(b=>!first.includes(b.id)));
  }
});

test('Nix chooser freezes Carrier pressure, serve and presentation clocks, closes without spending and rejects protected phases', () => {
  for(const phase of ['carrier','escape','rebuild','retreat']) {
    const l=level();l.phase=phase;l.paddle.charge=1;
    assert.equal(l.activateCorePower(),phase==='carrier');
    if(phase==='carrier') {
      const before=JSON.stringify({inspection:l.inspect(),balls:l.balls,t:l.t,kit:l.kitTime,serve:l.serveAge});
      l.update(3);assert.equal(JSON.stringify({inspection:l.inspect(),balls:l.balls,t:l.t,kit:l.kitTime,serve:l.serveAge}),before);
      l.closePowerMenu();assert.equal(l.paddle.charge,1);assert(l.activateCorePower());assert(l.chooseSpacePower('laser'));assert.equal(l.paddle.laserT,7);assert.equal(l.paddle.charge,0);
    }
  }
  const {l}=extracting();l.paddle.charge=1;assert(l.activateCorePower());const before=JSON.stringify(l.inspect());l.update(10);assert.equal(JSON.stringify(l.inspect()),before);
});

test('LASER, pulses and active UNSTOPPABLE damage without farming charge; normal linked impacts earn one pip', () => {
  const l=level('hard');
  for(const b of [{shot:true},{pulse:true},{titan:3}]) {const hp=l.carrier.hp;hit(l,'carrier',b);assert(l.carrier.hp<hp);assert.equal(l.paddle.charge,0);}
  hit(l,l.guns[0].id);assert.equal(l.paddle.charge,0);assert.equal(l.coreChargeBank,1/l.coreHits);
  for(const flags of [{shot:true},{pulse:true},{titan:1}]){const id='excluded-'+JSON.stringify(flags);l.bolts.push({id,x:180,y:420});hit(l,id,flags);assert.equal(l.paddle.charge,0);assert.equal(l.coreChargeBank,1/l.coreHits);}
  l.bolts.push({id:'ordinary-intercept',x:180,y:420});hit(l,'ordinary-intercept');assert.equal(l.paddle.charge,0);assert.equal(l.coreChargeBank,1/l.coreHits);
});

test('spent cannon metal shares the living hull episode and still accepts ordinary damage once', () => {
  const l=level();l.guns[0].hp=0;const p=l.cannonPose(l.guns[0]),b=makeBall(p.x,p.y,0,-345,7.5),hp=l.carrier.hp;
  collideTargets(b,l.targets(),(id,ball)=>l.hitTarget(id,ball));assert.equal(l.carrier.hp,hp-1);assert.equal(l.paddle.charge,0);assert.equal(l.coreChargeBank,1/l.coreHits);
  // The same ball touching another piece of the same physical hull has not left its contact episode.
  b.x=p.x;b.y=p.y;collideTargets(b,l.targets(),(id,ball)=>l.hitTarget(id,ball));assert.equal(l.carrier.hp,hp-1);assert.equal(l.paddle.charge,0);assert.equal(l.coreChargeBank,1/l.coreHits);
  b.x=180;b.y=500;collideTargets(b,l.targets(),(id,ball)=>l.hitTarget(id,ball));b.x=p.x;b.y=p.y;
  collideTargets(b,l.targets(),(id,ball)=>l.hitTarget(id,ball));assert.equal(l.carrier.hp,hp-2);assert.equal(l.paddle.charge,0);assert.equal(l.coreChargeBank,2/l.coreHits);
});

test('one ordinary cannon-and-rim overlap cannot double-damage or double-charge the ship contact', () => {
  const l=level(),b=makeBall(73.8,198.37925498298492,0,-345,7.5),hp=l.carrier.hp;l.balls=[b];
  const first=l.world();assert(first.targets.filter(t=>t.id==='carrier'||t.id==='cannon0').filter(t=>overlapsTarget(b,t)).length>=2,'fixture really touches both physical parts');
  collideTargets(b,first.targets,first.onTarget);assert.equal(l.carrier.hp,hp-1);assert.equal(l.paddle.charge,0);assert.equal(l.coreChargeBank,1/l.coreHits);
  // Sliding directly onto the same cannon without leaving the mothership is still one episode.
  const p=l.cannonPose(l.guns[0]);b.x=p.x;b.y=p.y;const held=l.world();collideTargets(b,held.targets,held.onTarget);assert.equal(l.carrier.hp,hp-1);assert.equal(l.paddle.charge,0);assert.equal(l.coreChargeBank,1/l.coreHits);
  b.x=180;b.y=500;const separated=l.world();collideTargets(b,separated.targets,separated.onTarget);b.x=p.x;b.y=p.y;const reentry=l.world();collideTargets(b,reentry.targets,reentry.onTarget);assert.equal(l.carrier.hp,hp-2);assert.equal(l.paddle.charge,0);assert.equal(l.coreChargeBank,2/l.coreHits);
});

test('curved beam endpoints track the actual emitter and captive; full pull stays outside both body footprints', () => {
  for(const mode of ['easy','medium','hard'])for(const [H,s] of [[729,393/360],[785,412/360]])for(const side of [-1,1])for(const index of [0,2,4]) {
    const {l,c,f}=extracting(mode,H,s,side,index),p=l.fighterPose(f),curve=l.tractorCurve(c);
    nearPoint(carrierArcPoint(curve,0),{x:p.x-Math.sin(p.angle)*16,y:p.y+Math.cos(p.angle)*16});nearPoint(carrierArcPoint(curve,1),l.workerHome(c));
    const mid=carrierArcPoint(curve,.5),line={x:(curve.from.x+curve.to.x)/2,y:(curve.from.y+curve.to.y)/2};assert(Math.hypot(mid.x-line.x,mid.y-line.y)>3.9);
    const w=l.workerPose(c);nearPoint(w,carrierArcPoint(curve,w.curveT));assert(w.pull>0&&w.pull<1);
    l.clock=l.raid.extractAt+l.rules.extractSeconds;const end=l.workerPose(c),pose=l.fighterPose(f);nearPoint(end,carrierArcPoint(end.curve,end.curve.dockT));
    assert(Math.hypot(end.x-pose.x,end.y-pose.y)>=end.curve.safe-1e-8,'pulled worker does not overlap raider');
  }
});

test('interrupt returns along the saved curve with no first-frame jump; opening the lock rescues from the pulled pose', () => {
  for(const kill of [false,true]) {
    const {l,c,f}=extracting(),before=l.workerPose(c);
    if(kill){f.hp=1;hit(l,f.id);}else l.endRaid();
    assert.equal(l.raid,null);nearPoint(l.workerPose(c),before,'interrupt begins at the actual pulled worker');assert(c.returning.curve);
    l.clock+=.175;const halfway=l.workerPose(c);nearPoint(halfway,carrierArcPoint(c.returning.curve,(c.returning.curveT+1)/2));l.clock+=.175;nearPoint(l.workerPose(c),l.workerHome(c));assert.equal(c.hp,l.rules.lockHP);
  }
  const {l,c}=extracting(),before=l.workerPose(c);c.hp=1;hit(l,c.id);assert.equal(l.raid,null);assert.equal(c.hp,0);nearPoint(c.rescueFrom,before);advance(l,.81);assert(c.secured);assert(!l.raid);
});

test('selected funnel fills a real tapered curved volume around the moving worker and compression rings', () => {
  const {l,c}=extracting(),fills=[],bands=[];let path=[],closed=false;
  const g=new Proxy({beginPath:()=>{path=[];closed=false;},moveTo:(x,y)=>path.push({x,y}),lineTo:(x,y)=>path.push({x,y}),closePath:()=>{closed=true;},fill:()=>{if(closed)fills.push([...path]);},ellipse:(...p)=>bands.push(p)},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
  const before=JSON.stringify(l.inspect());l.drawRaid(g);assert.equal(JSON.stringify(l.inspect()),before);
  const w=l.workerPose(c),curve=w.curve;assert.equal(fills.length,3,'three translucent filled shells, rather than an isolated string');
  const outer=fills[0];assert.equal(outer.length,66);assert(outer.every(p=>Number.isFinite(p.x+p.y)));
  nearPoint({x:(outer[0].x+outer[65].x)/2,y:(outer[0].y+outer[65].y)/2},curve.from);
  nearPoint({x:(outer[32].x+outer[33].x)/2,y:(outer[32].y+outer[33].y)/2},w);
  assert(Math.abs(Math.hypot(outer[0].x-outer[65].x,outer[0].y-outer[65].y)-8)<1e-8);
  assert(Math.abs(Math.hypot(outer[32].x-outer[33].x,outer[32].y-outer[33].y)-38)<1e-8);
  assert.equal(bands.length,9,'housing ring, seven compression bands and worker mouth');nearPoint({x:bands.at(-1)[0],y:bands.at(-1)[1]},w);
});
