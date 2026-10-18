// Independent geometry and lifecycle fixtures; these are separate from earned play.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeBall, stepBall } from '../src/physics.js';
import { overlapsTarget, sweepTarget } from '../src/carrier-physics.js';
import { circuitData } from '../tools/relay-circuit/data.mjs';

globalThis.Image = class { complete = true; naturalWidth = 1; width = 1024; height = 768; decode() { return Promise.resolve(); } };
const { Relay } = await import('../src/relay.js');
const data = circuitData();
const phones = [[729,393/360],[785,412/360]];
const make = (mode='medium', [H,s]=phones[0]) => new Relay(360,H,s,mode,data);
const advance = (l, seconds) => { for (let i=0;i<Math.round(seconds*120);i++) l.update(1/120); };
const half = l => { while(l.hp>l.maxHP/2)l.hitTarget('circuit-hull',{x:181,y:195,r:8}); };
const centroid = s => s.points.reduce((p,q)=>[p[0]+q[0]/s.points.length,p[1]+q[1]/s.points.length],[0,0]);

test('independent: moving leaf collision follows the actual opposite poses under Focus plus SLOW',()=>{
  for(const phone of phones)for(const mode of ['easy','medium','hard'])for(const index of [0,3]) {
    const l=make(mode,phone),n=l.nodes[index];n.portAt=0;l.clock=.18;l.timeScale=.25;l.slowT=3;
    const dtReal=1/120,dtBall=dtReal*.25*.68;
    const targets=l.world().targets.filter(t=>t.id===n.id),future=l.leafTargets(n,l.clock+dtReal);
    for(let i=0;i<2;i++) {
      const from=centroid(targets[i].shapes[0]),to=centroid(future[i]);
      assert(Math.abs(from[0]+targets[i].vx*dtBall-to[0])<.04);
      assert(Math.abs(from[1]+(targets[i].vy||0)*dtBall-to[1])<.001);
    }
    assert(targets[0].vx<0&&targets[1].vx>0);
  }
});

test('independent: warned volley pose and projectile travel use active real time through Focus/SLOW and hit-stop',()=>{
  const regular=make(),slowed=make();
  for(const l of [regular,slowed]){l.release();l.balls[0].caught=true;l.nextAttack=0;l.volleyRandom=()=>.1;for(const b of l.bricks)b.hp=0;}
  slowed.timeScale=.25;slowed.slowT=5;slowed.hitStop=.35;
  advance(regular,1.6);advance(slowed,1.6);
  assert(Math.abs(regular.clock-slowed.clock)<1e-9);
  assert.deepEqual(regular.attack,slowed.attack);assert(regular.attack.fired);
  assert(regular.bolts.length>0,'authored opened port permits the warned shot');
  assert.equal(regular.bolts.length,slowed.bolts.length);
  for(let i=0;i<regular.bolts.length;i++)for(const key of ['x','y','vx','vy'])assert(Math.abs(regular.bolts[i][key]-slowed.bolts[i][key])<1e-8);
});

test('independent: open port leaves clear every reachable aim extreme with normal, wide and shrunk paddles and both new radii',()=>{
  for(const mode of ['easy','medium','hard'])for(const phone of phones)for(const index of [0,1])for(const width of [125,125*1.55,125*.62])for(const edge of ['left','centre','right']){
    const l=make(mode,phone),c=l.guns[index],n=l.nodes[index?3:0];n.portAt=0;l.clock=l.rules.warn;
    const targetX=edge==='left'?l.left+width/2:edge==='right'?l.right-width/2:l.W/2;
    const angle=Math.max(-.2,Math.min(.2,Math.atan2(targetX-c.x,l.paddle.y-c.y)));
    l.attack={id:c.id,started:0,angle,targetX:c.x+Math.tan(angle)*400,targetY:c.y+400,fired:false};
    const p=l.cannonPose(c),from={x:p.x-Math.sin(p.angle)*8,y:p.y+Math.cos(p.angle)*8},to={x:0,y:n.y+45};to.x=from.x+Math.tan(angle)*(to.y-from.y);
    assert([3.5,7.5,9].every(r=>l.targets().filter(t=>t.id===n.id).every(t=>!sweepTarget(from,to,r,t))),`${mode}/${phone[0]} gun${index} angle${angle}`);
  }
});

test('independent: disabled visible barrels remain solid to ordinary and TITAN balls',()=>{
  const l=make(),gun=l.guns[0];gun.hp=0;
  const target=l.targets().find(t=>t.id===gun.id),pose=l.cannonPose(gun),shape=target.shapes[0];
  const point=centroid(shape);
  assert(overlapsTarget({x:point[0],y:point[1],r:2},target),'disabled barrel still has real metal');
  for(const powered of [false,true]) {
    const b=makeBall(pose.x,pose.y+30,0,-345,powered?10:8);if(powered)b.titan=5;
    stepBall(b,.13,{left:-100,right:500,top:-100,bottom:900,targets:[target]});
    assert(b.vy>0,'solid disabled target rebounds');
  }
});

test('independent: side-moving caught ball intercepts a real swept bolt before the paddle',()=>{
  const l=make(),b=l.balls[0],p=l.paddle;for(const brick of l.bricks)brick.hp=0;
  p.x=210;p.vx=600;b.x=210;b.y=p.y-b.r-1;b.caught=true;
  const dt=.1,from={x:165,y:b.y-14},to={x:165,y:b.y+8};
  assert(sweepTarget(from,to,3.5,{vx:p.vx,shapes:[{type:'circle',x:b.x-p.vx*dt,y:b.y,r:b.r}]},0,dt));
  l.clock=dt;l.bolts=[{id:'circuit-bolt-review-moving-catch',...from,vx:0,vy:220,r:3.5}];
  l.updateBolts(dt);assert.equal(l.bolts.length,0);assert.equal(p.stun,0);assert(l.score>0);
});

test('independent: actual caught flight capsule queues once, preserves live identities and does not refresh hidden timers',()=>{
  const l=make();l.release();l.balls.push(makeBall(100,430,-30,-320,8));
  const balls=[...l.balls];balls[1].titan=2.3;balls[1].r=10;
  l.fireT=3.2;l.slowT=4.1;l.shield=1;l.shieldT=6.8;Object.assign(l.paddle,{wideT:5.4,laserT:3.1,laserCd:.17});
  const timers=()=>[l.fireT,l.slowT,l.shield,l.shieldT,l.paddle.wideT,l.paddle.laserT,l.paddle.laserCd,...balls.map(b=>b.titan)];
  half(l);l.update(1/120);const before=timers();advance(l,.46);assert.equal(l.phase,'flight');
  l.flightCd=100;l.nextAttack=1e9;const initialFocus=l.focus;l.drops=[{kind:'focus',x:l.paddle.x,y:l.paddle.y-41,vy:100}];
  l.update(.02);assert.deepEqual(l.queuedPowers,['focus']);assert.equal(l.drops.length,0);
  l.update(.02);assert.deepEqual(l.queuedPowers,['focus']);assert.equal(l.focus,initialFocus);assert.deepEqual(timers(),before);
  l.startReturn();for(let i=0;i<60&&l.phase==='return';i++)l.update(1/120);assert.equal(l.phase,'relay');assert(l.returnServe);assert(l.balls.every((b,i)=>b===balls[i]));assert.deepEqual(timers(),before);
  l.pointerDown(180,l.H-20);l.pointerUp();assert.equal(l.focus,Math.min(l.focusMax,initialFocus+1));assert.equal(l.queuedPowers.length,0);
  l.release();assert.equal(l.focus,Math.min(l.focusMax,initialFocus+1));
});

test('independent: missile impact interrupts flight safely once; stale Space and pointer releases cannot launch the returned fan',()=>{
  const l=make();half(l);l.update(.01);advance(l,.46);l.flightCd=100;l.nextAttack=1e9;
  l.pointerDown(180,l.H-20);l.key(' ',true);const live=[...l.balls],lives=l.lives;
  l.bolts=[{id:'circuit-bolt-review-craft-hit',x:l.paddle.x,y:l.paddle.y-70,vx:0,vy:300,r:3.5}];l.update(.2);
  assert.equal(l.phase,'return');assert.equal(l.lives,lives);assert.equal(l.bolts.length,0);advance(l,.46);
  l.pointerUp();l.key(' ',false);assert(l.aim?.serve);assert(l.balls.every((b,i)=>b===live[i]&&b.caught));
  l.key(' ',true);l.key(' ',false);assert.equal(l.aim,null);assert(l.balls.every(b=>!b.caught));
});
