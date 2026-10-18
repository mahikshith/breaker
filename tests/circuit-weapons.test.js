import{test}from'node:test';import assert from'node:assert/strict';import{circuitData}from'../tools/relay-circuit/data.mjs';import{makeBall}from'../src/physics.js';import{liveSkiffGeometry}from'../src/skiff.js';
globalThis.Image=class{complete=true;naturalWidth=1;width=1024;height=768;decode(){return Promise.resolve();}};
const{Relay}=await import('../src/relay.js'),data=circuitData();const make=(mode='easy',H=729)=>new Relay(360,H,1,mode,data);
const step=(l,time)=>{for(let i=0;i<Math.round(time*120);i++){l.clock+=1/120;l.updateCircuit(1/120);}};
test('real heavy and three-shot batteries use mode cadence/radius, lock lanes and leave safe current-width centres',()=>{
 for(const mode of['easy','medium','hard'])for(const H of[729,785])for(const kind of['heavy','salvo']){
  const l=make(mode,H);l.volleyRandom=()=>kind==='heavy'?.01:.9;let roll=0;l.volleyRandom=()=>roll++%2===0?.01:kind==='heavy'?.01:.9;l.nextAttack=0;step(l,.02);const a=l.attack,s=a.sources[0],target=s.targetX;l.paddle.x=280;step(l,a.warning+.32);assert.equal(s.shotIndex,kind==='heavy'?1:3);assert.equal(s.targetX,target);assert.equal(l.bolts.length,kind==='heavy'?1:3);assert(l.bolts.every(b=>b.r===(kind==='heavy'?9:7.5)&&b.colour==='circuit'&&b.from&&Number.isFinite(b.bornAt)));assert(l.bolts.every(b=>Math.abs(Math.hypot(b.vx,b.vy)-a.speed)<1e-8));assert(a.speed>={easy:440,medium:520,hard:600}[mode]);
 }
});
test('both is a staggered battery; a new maximum WIDE at launch aborts without firing through an unavoidable lane',()=>{
 const l=make();let roll=0;l.volleyRandom=()=>roll++%2===0?.6:.01;l.nextAttack=0;step(l,.02);assert.equal(l.attack.pattern,'both');assert.equal(l.attack.sources.length,2);assert(Math.abs(l.attack.sources[1].started-l.attack.sources[0].started-.85)<1e-8);l.paddle.w=324;step(l,2.6);assert.equal(l.bolts.length,0);assert(l.attack===null||l.attack.sources.every(s=>s.cancelled));
});
test('a swept cannon hit costs exactly one life, clears the volley and starts one protected caught serve',()=>{
 const l=make();l.clock=5;l.aim=null;l.balls=[makeBall(60,400,0,-345,8)];const p=l.paddle;for(let i=0;i<3;i++)l.bolts.push({id:'impact'+i,x:p.x,y:p.y-35,vx:0,vy:600,r:9,colour:'circuit'});l.updateBolts(.1);assert.equal(l.lives,2);assert.equal(l.bolts.length,0);assert.equal(l.balls.length,1);assert(l.aim?.serve&&l.balls[0].caught);assert.equal(l.enemyGraceUntil,8);l.bolts=[{id:'immune',x:p.x+30,y:p.y-35,vx:0,vy:600,r:9}];l.updateBolts(.1);assert.equal(l.lives,2);assert(l.aim?.serve);
});
test('valid Vesper choice jams only one live cannon6 active seconds, keeps launched ordnance and rejects duplicate effects',()=>{
 const l=make();l.paddle.charge=1;assert(l.activateCorePower());l.bolts=[{id:'already-fired',x:60,y:350,vx:0,vy:440,r:9}];assert(l.chooseSpacePower('laser'));const jam=l.guns.filter(c=>c.jamUntil>l.clock);assert.equal(jam.length,1);assert.equal(jam[0].jamUntil,6);assert.equal(l.bolts.length,1);assert.equal(l.paddle.charge,0);assert(!l.chooseSpacePower('five'));assert.equal(jam[0].jamUntil,6);const before=l.clock;l.powerMenuOpen=true;l.update(20);assert.equal(l.clock,before);
});
test('real skiff fire owns a broad6.8u swept body, alternates true muzzles and cannot double-hit cover',()=>{
 const l=make();l.phase='flight';l.clock=1;l.flightCd=0;l.freezeBalls();l.updateFlightShots(.001);assert.equal(l.shots.length,1);const shot=l.shots[0];assert.equal(shot.r,6.8);assert.equal(shot.size,37);assert.equal(shot.muzzleFlash,false);assert.equal(Math.hypot(shot.vx,shot.vy),560);const fired=l.skiffFiredAt.findIndex(t=>t===l.clock);assert(fired>=0);l.clock+=.075;const pose=liveSkiffGeometry(l);assert(pose.muzzles[fired].recoil>3.6);assert.equal(pose.muzzles[1-fired].recoil,0);
 const b=l.bricks.at(-1);for(const other of l.bricks)if(other!==b)other.hp=0;const r=b.art.rect,from={x:r.x-6.5,y:r.y+r.h+8},s={...from,y:r.y-10,r:6.8,vx:0,vy:-560,pulse:991};const hp=b.hp;assert(l.sweepShot(s,from,.04));assert.equal(b.hp,hp-1);const score=l.score;l.sweepShot(s,from,.04);assert.equal(l.score,score);
});
test('fresh Circuit construction resets weapons/jam/reward while Continue retains earned boss and spent burst',()=>{
 const l=make('medium');l.hp=23;l.burstSpent=true;l.guns[0].jamUntil=20;l.fail('fixture');l.continueRun();assert.equal(l.hp,23);assert(l.burstSpent);assert.equal(l.bolts.length,0);assert(l.aim?.serve);const fresh=make('medium');assert.equal(fresh.hp,96);assert(!fresh.burstSpent);assert(fresh.guns.every(c=>!c.jamUntil));assert.equal(fresh.companionId,'vesper');assert.deepEqual(fresh.skiffFiredAt,[-Infinity,-Infinity]);
});
test('twelve real skiff pulses spend finite ammunition, resolve the final projectile and return without refilling',()=>{
 const l=make();l.phase='flight';l.burstSpent=true;l.hp=l.maxHP=200;l.clock=1;l.flightCd=0;l.freezeBalls();for(const b of l.bricks)b.hp=0;for(const n of l.nodes)n.hp=0;for(const g of l.guns)g.hp=0;let lastInFlight=false;
 for(let i=0;i<120*8&&l.phase==='flight';i++){l.clock+=1/120;l.updateFlightShots(1/120);if(l.skiffAmmo===0&&l.shots.length){lastInFlight=true;assert.equal(l.phase,'flight');}}
 assert(lastInFlight);assert.equal(l.phase,'return');assert.equal(l.skiffAmmo,0);assert.equal(l.serial,12);assert.equal(l.hp,188);assert.equal(l.shots.length,0);const remaining=l.hp;l.updateFlightShots(.4);assert.equal(l.hp,remaining);assert.equal(l.skiffAmmo,0);
});
test('the live charge raster points along the same signed angle as the actual cannon velocity',()=>{
 for(const angle of[-.2,.2]){const l=make(),rotations=[];l.clock=1;l.attack={sources:[{id:l.guns[0].id,started:0,warning:2,angle,fired:false,done:false}]};for(const key of['paintBackground','part','drawNode','drawEnemyBolts','drawDrops','drawCraft','drawPaddle','drawBalls','drawAim','drawDeck','drawHUD'])l[key]=()=>{};l.fx.draw=()=>{};const g=new Proxy({globalAlpha:1,rotate:a=>rotations.push(a)},{get:(t,k)=>k in t?t[k]:()=>{}});l.draw(g);assert(rotations.some(a=>Math.abs(a-(Math.atan2(Math.cos(angle),Math.sin(angle))-Math.PI/2))<1e-12));}
});
