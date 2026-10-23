import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Tidewheel,CRUSHER_WATER_TIP} from '../src/fantasy/tidewheel.js';
import {TIDEWHEEL_REACTIONS_GEOMETRY} from '../src/fantasy/tidewheel-reaction-geometry.js';
import measuredReaction from '../art/fantasy-machinery/reactions-data.mjs';
import {overlapsTarget} from '../src/carrier-physics.js';

test('live fury uses its exact new opaque silhouette and shoulder sockets, with a real ordinary hit route',()=>{
  const {dataPath,dataSHA,manifestSHA,...runtime}=TIDEWHEEL_REACTIONS_GEOMETRY;
  const sha=p=>createHash('sha256').update(readFileSync(new URL('../'+p,import.meta.url))).digest('hex');
  assert.equal(sha(dataPath),dataSHA);assert.equal(sha('assets/fantasy-machinery/reactions-manifest.json'),manifestSHA);
  assert.deepEqual(runtime,measuredReaction);
  const g=new Tidewheel();g.launch();g.villain.anger=3;g.updateMachinery(1/240);assert.equal(g.villain.pose,'fury');
  assert.deepEqual(g.body.circles,runtime.nerraFury.circles);
  for(const c of g.claws){const s=runtime.nerraFury.sockets[c.side<0?'crusher':'gate'];assert.deepEqual(c.root,{x:g.villain.footX+s.x,y:232+s.y});}
  const t=g.targets().filter(t=>t.kind==='shell').sort((a,b)=>b.r-a.r)[0],b=g.balls[0];
  Object.assign(b,{x:t.x,y:t.y+t.r+b.r+.5,vx:0,vy:-345});g.moveBall(b,1/120);assert.equal(g.villain.hp,g.rules.hp-1);
});

test('the new roaring anatomy and claws still clear short-phone buoyant bricks by a full ordinary radius',()=>{
  for(const patrol of[-12,12])for(const tilt of[-.08,.08])for(const stroke of[0,.5,1]){
    const g=new Tidewheel({height:700});g.villain.pose='fury';g.villain.footX=180+patrol;g.syncAnatomy();
    g.claws[0].angle=.5+(-.12-.5)*stroke;g.claws[1].angle=.12+(-.55-.12)*stroke;
    for(const r of g.rafts){r.y=r.stop;r.angle=tilt;r.x=r.baseX+(r.id==='raft0'?-1.5:1.5);}
    const targets=g.targets(),actors=targets.filter(t=>t.kind==='shell'||t.kind==='claw');
    for(const b of targets.filter(t=>t.kind==='brick'))for(const a of actors)assert(!overlapsTarget({x:a.x,y:a.y,r:a.r+6},b));
  }
});

test('all three powers spend one full meter in ordinary idle combat, never while paused or already active',()=>{
  for(const kind of['anchor','volley','cosmic']){
    const g=new Tidewheel();g.launch();g.charge=100;g.chargeBank=20;g.pause();
    assert(g.canActivate(kind,{ignorePause:true}));assert(!g.activate(kind));assert.equal(g.charge,100);
    g.pause(false);assert(g.activate(kind));assert.equal(g.charge,0);assert.equal(g.chargeBank,0);
    assert.equal(g.powerTimers[kind],g.powerMaxTimes[kind]);
    g.charge=100;assert(!g.activate(kind));assert.equal(g.charge,100);
    assert(!g.activate('unknown'));assert.equal(g.charge,100);
  }
});

test('full-charge powers also arm on a caught serve; offensive durations and arrows wait for launch',()=>{
  for(const kind of['volley','cosmic']){
    const g=new Tidewheel();g.charge=100;assert(g.activate(kind));
    for(let n=0;n<60;n++)g.update(.1);
    assert.equal(g.powerTimers[kind],g.powerMaxTimes[kind]);assert.equal(g.shots.length,0);
    assert(g.launch());g.update(.1);assert(g.powerTimers[kind]<g.powerMaxTimes[kind]);
    if(kind==='volley')assert.equal(g.shots.length,1);
  }
});

test('an idle armed Anchor protects the full timed window without a tiny warning-only input gate',()=>{
  const g=new Tidewheel();g.launch();g.balls[0].caught=true;g.charge=100;g.nextSurge=.1;
  assert(g.activate('anchor'));const y=g.water.target,turn=g.chain.wheelAngle;
  for(let n=0;n<79;n++)g.update(.1);
  assert(g.anchor);assert.equal(g.villain.stage,'idle');assert.equal(g.water.target,y);assert.equal(g.chain.wheelAngle,turn);
  for(let n=0;n<2;n++)g.update(.1);
  assert.equal(g.anchor,null);assert.equal(g.powerTimers.anchor,0);
  assert.equal(g.charge,0,'waiting alone creates no new meter');
});

test('Arrow Volley has five finite physical arrows and intact braces actually intercept them',()=>{
  const g=new Tidewheel();g.launch();g.charge=100;g.paddle.x=g.rafts[0].x-16;assert(g.activate('volley'));
  g.updatePowers(1/240);assert.equal(g.shots.length,1);const s=g.shots[0];
  assert.deepEqual(s.from,{x:g.paddle.x+16,y:g.paddle.y-18});
  const hp=g.villain.hp;g.updateShots(1);
  assert.equal(g.rafts[0].braceHP,1);assert.equal(g.villain.hp,hp);assert.equal(g.shots.length,0);assert.equal(g.chargeBank,0);
  const h=new Tidewheel();h.launch();h.charge=100;h.activate('volley');h.targets=()=>[];
  const ids=new Set();for(let n=0;n<31;n++){h.updatePowers(.1);for(const s of h.shots)ids.add(s.id);h.updateShots(.1);}
  assert.equal(ids.size,5);assert.equal(h.volley,null);assert.equal(h.powerTimers.volley,0);
});

test('Cosmic crosses compound armour once per physical passage without self-funding',()=>{
  const g=new Tidewheel();g.launch();g.charge=100;assert(g.activate('cosmic'));const b=g.balls[0];
  g.targets=()=>[{id:'shell',kind:'shell',type:'circle',x:180,y:200,r:30},{id:'shell1',kind:'shell',type:'circle',x:190,y:200,r:30}];
  Object.assign(b,{x:180,y:260,vx:0,vy:-345});const hp=g.villain.hp;
  for(let n=0;n<100;n++){g.time+=1/240;g.moveBall(b,1/240);}
  assert.equal(g.villain.hp,hp-1);assert(b.y<162&&b.vy<0);assert.equal(g.chargeBank,0);assert.equal(b.r,8);
});

test('Cosmic expiry finishes an embedded exit without a second hit then restores normal contact',()=>{
  const g=new Tidewheel();g.launch();g.charge=100;g.activate('cosmic');const b=g.balls[0];
  g.targets=()=>[{id:'shell',kind:'shell',type:'circle',x:180,y:200,r:30}];
  Object.assign(b,{x:180,y:200,vx:0,vy:-345,contacts:new Set(['nerra'])});
  g.powerTimers.cosmic=.001;g.updatePowers(.01);const hp=g.villain.hp;
  for(let n=0;n<50;n++){g.time+=1/240;g.moveBall(b,1/240);}
  assert.equal(b.r,7);assert.equal(b.titan,0);assert.equal(g.villain.hp,hp);assert.equal(b.pierceExit.size,0);
  Object.assign(b,{x:180,y:150,vx:0,vy:345});g.time+=1;g.moveBall(b,.1);
  assert.equal(g.villain.hp,hp-1);assert(b.vy<0);assert(g.chargeBank>0);
});

test('water fire is born at the measured animated claw and retains its initially warned landing lane',()=>{
  const art=JSON.parse(readFileSync(new URL('../assets/fantasy-machinery/manifest.json',import.meta.url))).tidewheel.crusherClaw;
  for(const [i,key]of['x','y'].entries())assert(Math.abs(CRUSHER_WATER_TIP[key]-(art.anchors.tip[i]-art.pivot[i])*art.unit[i])<1e-6);
  const g=new Tidewheel();g.launch();g.beginPulse();const target=g.pulseWarning.targetX;
  g.paddle.x=298;
  for(let n=0;n<400&&g.pulses.length===0;n++){g.time+=1/240;g.updateMachinery(1/240);}
  const q=g.pulses[0];assert(q);assert.deepEqual(q.from,g.villain.emission.from);
  assert(q.from.y<300&&q.from.x>12&&q.from.x<150,'visible crab source rather than a lower sidewall');
  assert(Math.abs(q.from.x+(g.paddle.y-q.from.y)*q.vx/q.vy-target)<1e-6);
});

test('ordinary earned credit is reachable, while power damage and passive time do not recharge it',()=>{
  const g=new Tidewheel();g.launch();const b=g.balls[0];
  g.hit({kind:'shell'}, {...b,powerShot:true});g.hit({kind:'shell'},{...b,titan:1});assert.equal(g.chargeBank,0);
  g.hit({kind:'shell'},b);assert.equal(g.chargeBank,100/g.rules.credits);
  const full=new Tidewheel();full.launch();full.balls[0].caught=true;
  for(let n=0;n<12;n++)full.hit({kind:'shell'},full.balls[0]);
  for(let n=0;n<121;n++)full.update(.1);
  assert(full.charge>99.999);assert(full.canActivate('anchor'));
});

test('last physical contact releases the chain and shows a planted stagger/faint/slump before the result',()=>{
  const g=new Tidewheel();g.launch();g.villain.hp=1;const t=g.targets().filter(t=>t.kind==='shell').sort((a,b)=>b.r-a.r)[0],b=g.balls[0];
  Object.assign(b,{x:t.x,y:t.y+t.r+b.r+.5,vx:0,vy:-345});g.update(1/240);
  assert.equal(g.phase,'rescue');assert.equal(g.chain.released,true);assert.equal(g.villain.defeat.stage,'stagger');
  for(let n=0;n<34;n++)g.update(.1);
  assert.equal(g.state,'play');assert.equal(g.villain.defeat.stage,'slump');assert(g.villain.defeat.scaleY<1);assert(g.villain.defeat.daze>0);assert.equal(g.villain.defeat.offsetY,0);
  for(let n=0;n<3;n++)g.update(.1);assert.equal(g.state,'won');
});
