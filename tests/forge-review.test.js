// Independent actual-geometry and lifecycle fixtures; separate from earned play.
import{test}from'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';
import{makeBall,stepBall}from'../src/physics.js';import{sweepTarget,overlapsTarget,collideTargets}from'../src/carrier-physics.js';
globalThis.Image=class{complete=true;naturalWidth=1;width=1024;height=768;decode(){return Promise.resolve();}};
const{Orbital}=await import('../src/orbital.js'),data=JSON.parse(readFileSync(new URL('../assets/orbital-forge/manifest.json',import.meta.url)));
const phones=[[729,393/360],[785,412/360]],make=(mode='medium',[H,s]=phones[0])=>{const l=new Orbital(360,H,s,mode,data);l.weaponRandom=()=>0;return l;};
const advance=(l,t)=>{for(let i=0;i<Math.round(t*120);i++)l.update(1/120);};
const nearest=(l,from,to,r)=>l.targets().map(t=>({id:t.id,hit:sweepTarget(from,to,r,t)})).filter(v=>v.hit).sort((a,b)=>a.hit.t-b.hit.t)[0];

test('independent Forge: legal full-radius coil lineups clear U openings while oblique approaches retain real side metal',()=>{
 for(const phone of phones)for(const r of[7.5,10])for(let index=0;index<3;index++){
  const l=make('medium',phone);for(const b of l.bricks)b.hp=0;l.activeIndex=index;l.stage='open';l.started=true;
  const s=l.stations[index],from={x:s.x,y:l.paddle.y-r-1};assert.equal(nearest(l,from,s,r)?.id,s.id);
  const frame=l.targets().find(t=>t.id===s.id);assert(sweepTarget({x:s.x-22,y:s.y+65},{x:s.x-22,y:s.y-5},r,frame),'real U side rail remains physical inside the station compound beside the opening');
 }
});

test('independent Forge: final actual coil contact beats a last-life miss in either ball order and clears ready LASER',()=>{
 for(const phone of phones)for(const mode of['easy','medium','hard'])for(const missFirst of[false,true]){
  const l=make(mode,phone);l.started=true;l.activeIndex=2;l.stage='open';l.stations[0].hp=l.stations[1].hp=0;const s=l.stations[2];s.hp=1;for(const p of l.bricks)p.hp=0;
  const hit=nearest(l,{x:s.x,y:l.paddle.y-9},s,7.5);assert.equal(hit.id,s.id);
  const contact=makeBall(hit.hit.x,hit.hit.y+.2,0,-345,7.5),miss=makeBall(l.left+9,l.drainY+9,0,345,7.5);
  l.balls=missFirst?[miss,contact]:[contact,miss];l.aim=null;l.lives=1;l.hitStop=0;l.paddle.laserT=5;l.paddle.laserCd=0;
  l.update(1/120);assert.equal(l.phase,'collapse');assert.equal(l.lives,1);assert.equal(l.state,'play');assert.equal(l.shots.length,0);assert.equal(l.bolts.length,0);assert(l.balls.includes(contact)&&contact.caught);
  for(let i=0;i<360&&l.phase!=='core';i++)l.update(1/120);assert.equal(l.phase,'core');assert.equal(l.balls.length,3);assert(l.rewardGranted);assert.equal(l.lives,1);
 }
});

test('independent Forge: final physical external-core hit latches ending before same-tick drain or ready LASER',()=>{
 for(const phone of phones)for(const mode of['easy','medium','hard'])for(const missFirst of[false,true]){
  const l=make(mode,phone);l.phase='core';l.core.hp=1;l.started=true;l.rewardGranted=true;for(const p of l.bricks)p.hp=0;
  const hit=nearest(l,{x:180,y:l.paddle.y-9},{x:180,y:246},7.5);assert.equal(hit.id,'core');
  const contact=makeBall(hit.hit.x,hit.hit.y+.2,0,-345,7.5),miss=makeBall(l.right-9,l.drainY+9,0,345,7.5);l.balls=missFirst?[miss,contact]:[contact,miss];l.aim=null;l.lives=1;l.hitStop=0;l.paddle.laserT=5;l.paddle.laserCd=0;
  l.update(1/120);assert.equal(l.phase,'ending');assert.equal(l.state,'play');assert.equal(l.lives,1);assert.equal(l.core.hp,0);assert.equal(l.shots.length,0);assert.equal(l.bolts.length,0);
  advance(l,2.1);assert.equal(l.state,'won');const terminal=JSON.stringify(l.inspect());l.update(30);l.continueRun();assert.equal(JSON.stringify(l.inspect()),terminal);
 }
});

test('independent Forge: one reward tops surviving total to3 without deleting powered objects or resurrecting dead ones',()=>{
 for(const count of[0,1,2,3,5]){
  const l=make(),dead=makeBall(10,700,0,300,10);dead.dead=true;dead.titan=6;
  const live=Array.from({length:count},(_,i)=>makeBall(80+i*20,430,30,-300,i===0?10:7.5));if(live[0]){live[0].titan=3.7;live[0].fire=true;}
  l.balls=[dead,...live];l.phase='collapse';l.grantReward();assert.equal(l.balls.length,Math.max(count,3));assert(!l.balls.includes(dead));assert(l.balls.every(b=>!b.dead));
  for(let i=0;i<count;i++)assert.equal(l.balls[i],live[i]);
  for(const b of l.balls.slice(count)){assert.equal(b.r,7.5);assert(!b.fire&&!b.titan);}
  if(live[0]){assert.equal(live[0].r,10);assert.equal(live[0].titan,3.7);assert(live[0].fire);}
  const granted=[...l.balls];l.grantReward();assert.deepEqual(l.balls,granted);assert(l.rewardGranted);
 }
});

test('independent Forge: presentation freezes every unused power, and the projected external core clears actual lower claw/lip',()=>{
 for(const phone of phones){
  const l=make('medium',phone),lead=l.balls[0];lead.titan=3.4;lead.r=10;l.fireT=4;l.slowT=3;l.shield=1;l.shieldT=6;Object.assign(l.paddle,{wideT:5,laserT:2,laserCd:.21});
  const timers=()=>[lead.titan,l.fireT,l.slowT,l.shield,l.shieldT,l.paddle.wideT,l.paddle.laserT,l.paddle.laserCd],before=timers();l.beginCollapse();
  for(let i=0;i<360&&l.phase!=='core';i++)l.update(1/120);assert.equal(l.phase,'core');assert.deepEqual(timers(),before);assert(l.balls.includes(lead));
  assert(!l.targets().some(t=>t.id.startsWith('stabiliser')),'all frames really retract before external core play');
  const hull=l.targets().find(t=>t.id==='core');assert(overlapsTarget({x:180,y:214,r:7.5},hull),'original opaque lower hull lip remains physical inside the final core compound');
  for(const r of[7.5,10])assert.equal(nearest(l,{x:180,y:l.paddle.y-r-1},{x:180,y:246},r)?.id,'core');
 }
});

test('independent Forge: a crossing physical LASER target is hit on active-real motion while Focus slows the shot',()=>{
 const l=make(),g=l.guns[0],hp=g.hp;l.timeScale=.25;
 l.targets=(rate=1)=>[{id:g.id,active:true,pierceable:false,vx:400*rate,shapes:[{type:'rect',x:100,y:300,w:10,h:10}]}];
 assert(l.shotHit({x:120,y:280},320,.01),'moving target crosses the actual laser ray within.04 real seconds');assert.equal(g.hp,hp-1);
});

test('independent Forge: active-real warnings and bolt travel agree through Focus/SLOW/hit-stop',()=>{
 const normal=make(),slow=make();for(const l of[normal,slow]){l.release();l.balls[0].caught=true;l.teachDone=true;l.stage='closing';l.stageAt=-1;for(const p of l.bricks)p.hp=0;l.paddle.x=l.left+l.paddle.w/2;}
 slow.timeScale=.25;slow.slowT=4;slow.hitStop=.3;advance(normal,1.5);advance(slow,1.5);
 assert(Math.abs(normal.clock-slow.clock)<1e-8);assert.equal(normal.stage,slow.stage);assert.equal(normal.bolts.length,slow.bolts.length);assert(normal.attack&&slow.attack);
 assert.equal(normal.attack.targetX,slow.attack.targetX);for(let i=0;i<normal.bolts.length;i++)for(const key of['x','y','vx','vy'])assert(Math.abs(normal.bolts[i][key]-slow.bolts[i][key])<1e-8);
});

test('independent Forge: a simultaneous last-ball drain and exposed paddle shot can cost only one life',()=>{
 for(const phone of phones){const l=make('medium',phone);l.release();l.lives=2;l.balls=[makeBall(l.left+8,l.drainY+9,0,345,7.5)];l.bolts=[{id:'forge-bolt-review',x:l.paddle.x+50,y:l.paddle.y-1,vx:0,vy:300,r:3.5}];l.update(1/120);assert.equal(l.lives,1);assert.equal(l.state,'play');assert.equal(l.bolts.length,0);assert(l.aim?.serve);}
});

test('independent Forge: aerial fire crosses cover and an actual ball intercepts without farming power or cover damage',()=>{
 const l=make(),panel=l.bricks.at(-1),pose=l.brickPose(panel).pose;const behind=makeBall(pose.x,pose.y+60,0,0,7.5);behind.caught=true;l.balls=[behind];l.aim=null;
 const hp=l.bricks.map(b=>b.hp),charge=l.paddle.charge,broken=l.bricksBroken;l.bolts=[{id:'forge-bolt-review-cover',x:pose.x,y:pose.y-30,vx:0,vy:300,r:3.5}];
 l.updateBolts(.5);assert.equal(l.bolts.length,0);assert.deepEqual(l.bricks.map(b=>b.hp),hp);assert.equal(l.paddle.charge,charge);assert.equal(l.coreChargeBank,0);assert.equal(l.bricksBroken,broken);assert.equal(l.lives,3);assert.equal(l.score,20);assert.equal(l.drops.length,0);
});

test('independent Forge: Continue preserves damaged stations/guns/core and consumed reward without cloning it',()=>{
 const l=make();l.stations[0].hp=0;l.activeIndex=1;l.stations[1].hp=1;l.guns[0].hp=0;l.rewardGranted=true;l.core.hp=5;l.phase='core';l.lives=1;l.loseBall();assert.equal(l.state,'lost');const before=JSON.stringify(l.inspect());l.update(20);assert.equal(JSON.stringify(l.inspect()),before);l.continueRun();
 assert.equal(l.phase,'core');assert.equal(l.activeIndex,1);assert.equal(l.stations[0].hp,0);assert.equal(l.stations[1].hp,1);assert.equal(l.guns[0].hp,0);assert.equal(l.core.hp,5);assert(l.rewardGranted);assert.equal(l.balls.length,1);assert(l.aim?.serve);l.grantReward();assert.equal(l.balls.length,1);
});

test('independent Forge: closed machinery and final hull union take ordinary damage once per real contact episode',()=>{
 for(const phase of ['forge','core'])for(const phone of phones){
  const l=make('medium',phone);l.phase=phase;for(const p of l.bricks)p.hp=0;l.stage='anticipate';
  const obj=phase==='forge'?l.stations[0]:l.core,id=obj.id,point=phase==='forge'?{x:obj.x,y:obj.y}:{x:180,y:214};
  const target=l.targets().filter(t=>t.id===id);assert.equal(target.length,1,'overlapping raster parts share one physical target identity');assert(target[0].shapes.length>=3);
  const b=makeBall(point.x,point.y,0,-345,7.5),hp=obj.hp;
  collideTargets(b,l.targets(),(name,ball)=>l.hitTarget(name,ball));assert.equal(obj.hp,hp-1);assert.equal(l.paddle.charge,0);assert.equal(l.coreChargeBank,1/l.coreHits);
  Object.assign(b,point);collideTargets(b,l.targets(),(name,ball)=>l.hitTarget(name,ball));assert.equal(obj.hp,hp-1);assert.equal(l.paddle.charge,0);assert.equal(l.coreChargeBank,1/l.coreHits);
  b.x=180;b.y=550;collideTargets(b,l.targets(),(name,ball)=>l.hitTarget(name,ball));Object.assign(b,point);
  collideTargets(b,l.targets(),(name,ball)=>l.hitTarget(name,ball));assert.equal(obj.hp,hp-2);assert.equal(l.paddle.charge,0);assert.equal(l.coreChargeBank,2/l.coreHits);
 }
 const l=make(),hp=l.hull.hp;l.hitTarget('hull',{shot:true});assert.equal(l.hull.hp,hp-1);assert.equal(l.paddle.charge,0);l.hitTarget('hull',{titan:5});assert(l.hull.hp<hp-1);assert.equal(l.paddle.charge,0);
});

test('independent Forge: live cannon plus hull-rim overlap earns one contact, while an exposed cannon still takes damage',()=>{
 for(const phone of phones){
  const l=make('medium',phone),b=makeBall(63.5,175,0,-345,7.5);l.balls=[b];const hullHP=l.hull.hp,gun=l.guns[0],gunHP=gun.hp;
  const first=l.world();assert(first.targets.filter(t=>t.id==='hull'||t.id===gun.id).filter(t=>overlapsTarget(b,t)).length>=2,'fixture actually overlaps both source parts');
  collideTargets(b,first.targets,first.onTarget);assert.equal(hullHP-l.hull.hp+gunHP-gun.hp,1);assert.equal(l.paddle.charge,0);assert.equal(l.coreChargeBank,1/l.coreHits);
  b.x=63.5;b.y=175;const held=l.world();collideTargets(b,held.targets,held.onTarget);assert.equal(hullHP-l.hull.hp+gunHP-gun.hp,1);assert.equal(l.paddle.charge,0);assert.equal(l.coreChargeBank,1/l.coreHits);
  b.x=180;b.y=550;const away=l.world();collideTargets(b,away.targets,away.onTarget);
  for(const p of l.bricks)p.hp=0;
  const pose=l.cannonPose(gun),front=nearest(l,{x:pose.x,y:l.paddle.y-9},pose,7.5);assert.equal(front.id,gun.id,'exposed barrel is the first actual ordinary target');
  b.x=front.hit.x;b.y=front.hit.y-.2;const reentry=l.world(),hp=gun.hp;collideTargets(b,reentry.targets,reentry.onTarget);assert.equal(gun.hp,hp-1);assert.equal(l.paddle.charge,0);assert.equal(l.coreChargeBank,2/l.coreHits);
 }
});
