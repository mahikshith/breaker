import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { makeBall, stepBall } from '../src/physics.js';
import { sweepTarget, overlapsTarget } from '../src/carrier-physics.js';
globalThis.Image=class{complete=true;naturalWidth=1;decode(){return Promise.resolve();}};
const {Orbital,ORBITAL_LAYOUT}=await import('../src/orbital.js');
const data=JSON.parse(readFileSync(new URL('../assets/orbital-forge/manifest.json',import.meta.url)));
const level=(mode='medium',H=729,scale=393/360)=>{const l=new Orbital(360,H,scale,mode,data);l.weaponRandom=()=>0;return l;};
const advance=(l,t)=>{for(let i=0;i<Math.ceil(t*120);i++)l.update(1/120);};
const open=l=>{l.started=true;l.stage='open';l.stageAt=l.clock;};
const collapse=l=>{for(let i=0;i<3;i++){l.activeIndex=i;l.stage='open';while(l.stations[i].hp>0)l.hitTarget(l.stations[i].id,{titan:7});}};
const first=(l,from,to,r)=>l.targets().map(t=>({id:t.id,hit:sweepTarget(from,to,r,t)})).filter(v=>v.hit).sort((a,b)=>a.hit.t-b.hit.t)[0]?.id;
test('revised real-art layout preserves low paddle,40 coloured slots and3 optional machines',()=>{
 for(const [H,s]of[[729,393/360],[785,412/360]]){const l=level('medium',H,s);assert.equal(l.bricks.length,40);assert.equal(l.stations.length,3);assert.equal(l.crew,undefined);assert.deepEqual([l.paddle.w,l.paddle.h,l.ballRadius],[125,17,7.5]);assert(l.paddle.y-Math.max(...l.bricks.map(b=>b.y+b.h))>180);assert.equal(l.coreMode,'manual');assert(!l.targets().some(t=>t.id==='core'));assert.equal(l.data.reference,'design/phase1/img/orbital-variety-study-v3.png');}
 assert.equal(ORBITAL_LAYOUT.bricks[0].hp,1);
});
test('actual open machines admit both ball radii; broad closed leaves also take ordinary damage',()=>{
 for(const r of[7.5,10])for(let i=0;i<3;i++){const l=level();for(const b of l.bricks)b.hp=0;open(l);l.activeIndex=i;const s=l.stations[i],from={x:s.x,y:l.paddle.y-r-1};assert.equal(first(l,from,s,r),s.id);const b=makeBall(from.x,from.y,0,-800,r);if(r===10)b.titan=7;stepBall(b,.5,l.world());assert(s.hp<l.rules.hp);assert(b.vy>0);
 const c=level();for(const p of c.bricks)p.hp=0;c.activeIndex=i;const cs=c.stations[i];assert.equal(first(c,{x:cs.x,y:cs.y+60},cs,r),cs.id);c.hitTarget(cs.id,{});assert.equal(cs.hp,c.rules.hp-1);}
});
test('all hinge poses render and collide with the same actual leaf contour',()=>{
 const l=level(),s=l.stations[0];l.stage='opening';for(const a of[0,.1,.2,.3,.4]){l.clock=a;const p=l.coverPose(s),t=l.targets().find(t=>t.id===s.id),q=t.shapes.at(-1).points[0],uv=l.parts.station_cover.shapes[0].points[0];const x=uv[0]*p.w,y=(uv[1]-.5)*p.h;assert(Math.abs(q[0]-(p.x+x*Math.cos(p.angle)-y*Math.sin(p.angle)))<1e-9);assert(Math.abs(q[1]-(p.y+x*Math.sin(p.angle)+y*Math.cos(p.angle)))<1e-9);}
});
test('initial8s auto serve, later3s, teaching contact and Focus/SLOW/hitstop use active-real clocks',()=>{
 const l=level();advance(l,7.9);assert(l.aim?.serve);assert.equal(l.clock,0);advance(l,.12);assert(l.started&&!l.aim);l.balls[0].caught=true;const at=l.clock;l.timeScale=.25;l.slowT=10;l.hitStop=.5;advance(l,1);assert(Math.abs(l.clock-at-1)<.02);
 open(l);l.hitTarget(l.stations[0].id,{});assert(l.teachDone);l.loseBall();advance(l,2.9);assert(l.aim?.serve);advance(l,.12);assert(!l.aim);
});
test('harmless expired first window, then one locked warning/shot and a full recovery',()=>{
 const l=level();l.started=true;l.stage='closing';l.stageAt=-1;l.updateLevel(0,0);assert.equal(l.stage,'recovery');assert.equal(l.attack,null);
 l.teachDone=true;l.stage='closing';l.stageAt=l.clock-1;l.updateLevel(0,0);assert.equal(l.stage,'warning');const x=l.attack.targetX;l.paddle.x+=50;assert.equal(l.attack.targetX,x);const speed=l.attack.speed;l.updateLevel(0,l.attack.warning+.01);assert.equal(l.stage,'shot');assert.equal(l.bolts.length,1);assert(Math.abs(Math.hypot(l.bolts[0].vx,l.bolts[0].vy)-speed)<1e-8);
 l.bolts=[];l.updateLevel(0,.01);assert.equal(l.stage,'recovery');l.updateLevel(0,l.recoveryTime-.1);assert.equal(l.stage,'recovery');l.updateLevel(0,.11);assert.equal(l.stage,'anticipate');
});
test('optional gun damage persists and destroyed warning source cancels instead of firing',()=>{
 const l=level();l.started=true;l.teachDone=true;l.warn();assert(l.attack);const id=l.attack.id;for(let i=0;i<l.rules.gun;i++)l.hitTarget(id,{});assert.equal(l.attack,null);assert.equal(l.stage,'recovery');assert(l.targets().some(t=>t.id===id+':spent'));l.weaponRandom=()=>.3;l.warn();assert.notEqual(l.attack.id,id);
});
test('structural clear has no break farming; reward tops to3 once and keeps powered survivor ownership',()=>{
 const l=level();open(l);const lead=l.balls[0];lead.caught=false;lead.titan=6;lead.r=10;l.balls.push({...makeBall(10,700,0,50,7.5),dead:true});collapse(l);assert.equal(l.phase,'collapse');assert.equal(l.bricksBroken,3);assert(l.bricks.filter(b=>!b.payload).every(b=>b.hp===0));assert(l.bricks.filter(b=>b.payload).every(b=>b.hp>0));assert.equal(l.drops.length,0);
 advance(l,.82);assert(l.rewardGranted);assert.equal(l.balls.length,3);assert.equal(lead.titan,6);assert.equal(lead.r,10);for(const b of l.balls.slice(1)){assert.equal(b.r,7.5);assert(!b.titan&&!b.fire);}
 l.grantReward();assert.equal(l.balls.length,3);advance(l,1.22);assert.equal(l.phase,'core');assert(l.aim?.serve);advance(l,3.02);assert(l.balls.every(b=>!b.caught));assert.equal(new Set(l.balls.map(b=>b.vx)).size,3);
});
test('real lower lip stays opaque; projected core only arrives outside it with normal/TITAN route',()=>{
 const l=level();const lip=l.targets().find(t=>t.id==='hull');assert(overlapsTarget({x:180,y:214,r:7.5},lip));assert(!l.targets().some(t=>t.id==='core'));collapse(l);advance(l,2.04);assert.equal(l.phase,'core');
 for(const r of[7.5,10]){assert.equal(first(l,{x:180,y:l.paddle.y-r-1},{x:180,y:246},r),'core');const b=makeBall(180,l.paddle.y-r-1,0,-900,r);if(r===10)b.titan=7;const hp=l.core.hp;stepBall(b,.5,l.world());assert(l.core.hp<hp);assert(b.vy>0);}
});
test('last stabiliser/core latch before later miss or laser work and Continue cannot repeat reward',()=>{
 const l=level();open(l);collapse(l);assert.equal(l.phase,'collapse');l.loseBall();assert.equal(l.lives,3);l.shots.push({x:180,y:400});l.updateShots(.1);assert.equal(l.shots.length,0);advance(l,2.04);l.core.hp=1;l.hitTarget('core',{});l.loseBall();assert.equal(l.phase,'ending');assert.equal(l.lives,3);advance(l,2.02);assert.equal(l.state,'won');l.continueRun();assert.equal(l.state,'won');
 const c=level();collapse(c);advance(c,2.04);c.lives=1;c.loseBall();assert.equal(c.state,'lost');const hp=c.core.hp;c.continueRun();assert.equal(c.phase,'core');assert.equal(c.core.hp,hp);assert(c.rewardGranted);c.grantReward();assert.equal(c.balls.length,1);
});
test('enemy work crosses cover without player charge, damage or panel drops',()=>{
 const l=level();l.started=true;const p=l.bricks[0],q=l.brickPose(p).pose,breaks=l.bricksBroken,charge=l.paddle.charge; l.bolts=[{id:'testbolt',x:q.x,y:q.y-40,vx:0,vy:300,r:3.5}];l.updateBolts(.3);assert.equal(l.bolts.length,1);assert.equal(p.hp,1);assert.equal(l.bricksBroken,breaks);assert.equal(l.paddle.charge,charge);assert.equal(l.drops.length,0);
});
