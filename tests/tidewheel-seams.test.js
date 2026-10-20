import test from 'node:test';
import assert from 'node:assert/strict';
import { Tidewheel, raftPoint } from '../src/fantasy/tidewheel.js';
import { sweepTarget } from '../src/carrier-physics.js';

function seamFixture() {
  const g = new Tidewheel({ height:700, difficulty:'hard' });
  g.launch(); g.time = 92.33749999999819; g.villain.hp = 7;
  // Exact old-route shell/claw join; independent of future rendered claw anatomy.
  g.targets = () => [
    { id:'shell',kind:'shell',type:'circle',x:180,y:163,r:59 },
    { id:'claw-1',kind:'claw',type:'circle',x:95.07083494276617,y:150.11970614168445,r:25,
      vx:-9.0454117081104,vy:3.0108050060952 },
  ];
  Object.assign(g.balls[0],{x:121.43092650896358,y:133.18042246307374,
    vx:123.43399765020948,vy:322.16307706515363,contacts:new Set()});
  return g;
}

test('the recorded concave Nerra join rebounds without farming compound HP or charge', () => {
  const g = seamFixture(), b = g.balls[0];
  g.moveBall(b,1/240);
  assert.equal(g.villain.hp,6);
  assert.equal(g.score,50);
  assert.ok(Math.abs(g.chargeBank-100/g.rules.credits)<1e-6);
  assert.ok(b.contacts.has('nerra'));
  assert.ok(Math.abs(Math.hypot(b.vx,b.vy)-345)<1e-6);
  assert.equal(g.phase,'play');
});

test('a later genuinely separated shell contact remains productive after the union episode', () => {
  const g = seamFixture(), b = g.balls[0];
  g.moveBall(b,1/240);
  Object.assign(b,{x:180,y:260,vx:0,vy:-345}); g.time+=1;
  g.moveBall(b,.15);
  assert.equal(g.villain.hp,5);
  assert.equal(g.score,100);
  assert.ok(Math.abs(g.chargeBank-200/g.rules.credits)<1e-6);
  assert.ok(b.vy>0,'later direct contact still reflects normally');
});

test('the visibly raised spent gate panel remains solid without more rewards or boss damage', () => {
  const g = new Tidewheel({height:700}); g.launch();
  const gate=g.gates[0];gate.hp=0;gate.until=Infinity;gate.open=1;
  const target=g.targets().find(t=>t.id===gate.id), y=gate.y-32;
  assert.ok(sweepTarget({x:gate.x,y:y+40},{x:gate.x,y:y-20},6,target),'spent visible metal intercepts a real ray');
  const b=g.balls[0];Object.assign(b,{x:gate.x,y:y+40,vx:0,vy:-345});
  const hp=g.villain.hp;g.moveBall(b,.1);
  assert.ok(b.vy>0);assert.equal(g.villain.hp,hp);assert.equal(g.score,0);assert.equal(g.chargeBank,0);
});

test('a real final ordinary hit preempts flood failure in the same physical substep', () => {
  const g = new Tidewheel({height:700}); g.launch();g.villain.hp=1;
  const shell=g.targets().filter(t=>t.kind==='shell').sort((a,b)=>b.r-a.r)[0], b=g.balls[0];
  Object.assign(b,{x:shell.x,y:shell.y+shell.r+b.r+.5,vx:0,vy:-345});
  g.water.y=g.water.limit+.04;g.water.target=g.water.limit;
  g.update(1/240);
  assert.equal(g.villain.hp,0);assert.equal(g.phase,'rescue');assert.equal(g.state,'play');
  for(let i=0;i<30;i++)g.update(.1);
  assert.equal(g.state,'won');
});

test('a fast ball rebounds from the genuinely tilted moving raft deck without score or charge',()=>{
  const g=new Tidewheel({height:700});g.launch();
  const r=g.rafts[0];r.angle=r.previousAngle=.06;
  const bottom=raftPoint(r,-45,48),b=g.balls[0],hp=g.villain.hp;
  Object.assign(b,{x:bottom.x,y:bottom.y+12,vx:0,vy:-1200});
  g.update(1/30);
  assert.ok(b.vy>0,'visible lower deck is physical');
  assert.equal(g.villain.hp,hp);assert.equal(g.score,0);assert.equal(g.charge+g.chargeBank,0);
  assert.ok(g.bricks.every(b=>b.hp===1));
  assert.ok(Math.abs(Math.hypot(b.vx,b.vy)-345)<1e-6);
});
