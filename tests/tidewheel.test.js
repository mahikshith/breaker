import test from 'node:test';
import assert from 'node:assert/strict';
import {Tidewheel,raftPoint,REFUGE_LIP_OFFSET} from '../src/fantasy/tidewheel.js';
import {TIDEWHEEL_GEOMETRY} from '../src/fantasy/tidewheel-geometry.js';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {TIDEWHEEL_V2_GEOMETRY} from '../src/fantasy/tidewheel-v2-geometry.js';
import measured from '../art/fantasy-machinery/nerra-v2-data.mjs';
import {overlapsTarget} from '../src/carrier-physics.js';

test('the preserved first anatomy retains its frozen artwork pivots and silhouette disks',()=>{
  const m=JSON.parse(readFileSync(new URL('../assets/fantasy-machinery/manifest.json',import.meta.url))).tidewheel;
  assert.deepEqual(TIDEWHEEL_GEOMETRY.body,m.nerraBody.collision);
  for(const [i,key] of ['crusherClaw','gateClaw'].entries()){
    assert.deepEqual(TIDEWHEEL_GEOMETRY.claws[i].circles,m[key].collision);
    const uv=m.nerraBody.anchors[i?'socketGate':'socketCrusher'];
    assert.deepEqual(TIDEWHEEL_GEOMETRY.claws[i].offset,uv.map((v,n)=>(v-m.nerraBody.pivot[n])*m.nerraBody.unit[n]));
  }
});

test('v2 runtime uses the exact smaller supporting-foot anatomy, not double-scaled old geometry',()=>{
  const {dataPath,dataSHA,...runtime}=TIDEWHEEL_V2_GEOMETRY;
  assert.equal(createHash('sha256').update(readFileSync(new URL('../'+dataPath,import.meta.url))).digest('hex'),dataSHA);
  assert.deepEqual(runtime,measured);assert.deepEqual(runtime.unit,[190.08,171.072]);
  const manifest=JSON.parse(readFileSync(new URL('../assets/fantasy-machinery/nerra-v2-manifest.json',import.meta.url)));
  assert.deepEqual(runtime,manifest.geometry);
  const g=new Tidewheel();assert.equal(g.villain.footY,232);
  for(const pose of Object.keys(runtime.poses)){
    g.villain.pose=pose;g.syncAnatomy();
    assert.equal(g.villain.frame,runtime.poses[pose].frame);assert.equal(g.body.circles.length,90);
    assert.equal(g.targets().filter(t=>t.kind==='shell').length,90);
  }
});

test('short-phone raised raft cells leave the actual r6ball clear of every measured posed extremity',()=>{
  for(const pose of Object.keys(TIDEWHEEL_V2_GEOMETRY.poses))for(const patrol of[-12,12])for(const tilt of[-.08,.08])for(const stroke of[0,.5,1]){
    const g=new Tidewheel({height:700});g.villain.pose=pose;g.villain.footX=180+patrol;g.syncAnatomy();
    g.claws[0].angle=.5+(-.12-.5)*stroke;g.claws[1].angle=.12+(-.55-.12)*stroke;
    for(const r of g.rafts){r.y=r.stop;r.angle=tilt;r.x=r.baseX+(r.id==='raft0'?-1.5:1.5);}
    const t=g.targets(),actor=t.filter(t=>t.kind==='shell'||t.kind==='claw');
    for(const b of t.filter(t=>t.kind==='brick'))for(const c of actor)assert(!overlapsTarget({x:c.x,y:c.y,r:c.r+6},b),pose+' '+b.id+' '+c.id);
  }
});

test('the actual two-hit front brace opens a broad route, preserves endcaps and earns credit only once per hit',()=>{
  const g=new Tidewheel({height:780});g.launch();const r=g.rafts[0],b=g.balls[0];
  for(let hit=0;hit<2;hit++){
    const q=raftPoint(r,0,48);Object.assign(b,{x:q.x,y:q.y+6.5,vx:0,vy:-345,contacts:new Set()});
    g.moveBall(b,1/120);assert.equal(r.braceHP,1-hit);assert(b.vy>0);
  }
  assert.equal(g.score,30);assert(Math.abs(g.chargeBank-200/g.rules.credits)<1e-6);
  assert(!g.targets().some(t=>t.id==='braceraft0'));
  assert.equal(g.targets().filter(t=>t.id.startsWith('deckraft0')).length,2);
  const q=raftPoint(r,0,48);Object.assign(b,{x:q.x,y:q.y+6.5,vx:0,vy:-345,contacts:new Set()});g.moveBall(b,1/120);
  assert(b.vy<0,'the cleared centre remains open');assert.equal(g.score,30);assert.equal(r.braceHP,0);
});

test('ordinary centre catches cannot sit under the raft for twenty seconds without productive feedback',()=>{
  const g=new Tidewheel({height:780}),fold=x=>{const w=324,t=((x-18)%(2*w)+2*w)%(2*w);return 18+(t>w?2*w-t:t);};
  g.launch(-Math.PI/2-.22);let first=null;
  for(let n=0;n<240*6&&g.state==='play';n++){
    const b=g.balls[0];if(n%12===0)g.setTarget(b.vy>0?fold(b.x+b.vx*Math.max(0,(g.paddle.y-g.paddle.h/2-b.r-b.y)/b.vy)):b.x);
    g.update(1/240);if(g.score>0){first=g.time;break;}
  }
  assert(first!==null&&first<2,'first actual brace hit is visible/productive in under two seconds');
  assert(g.rafts.some(r=>r.braceHP<r.maxBraceHP));
});

test('all four measured keyposes accept a genuine broad incoming ordinary ball contact',()=>{
  for(const pose of Object.keys(TIDEWHEEL_V2_GEOMETRY.poses)){
    const g=new Tidewheel();g.launch();g.villain.pose=pose;g.syncAnatomy();
    const t=g.targets().filter(t=>t.kind==='shell').sort((a,b)=>b.r-a.r)[0],b=g.balls[0];
    Object.assign(b,{x:t.x,y:t.y+t.r+b.r+.5,vx:0,vy:-345});
    g.moveBall(b,1/120);
    assert.equal(g.villain.hp,g.rules.hp-1,pose);assert.equal(g.score,50);
    assert(Math.abs(Math.hypot(b.vx,b.vy)-345)<1e-6);
  }
});

test('Tidewheel keeps equal cells, full-ball lanes and a generous lower reaction space',()=>{
  for(const height of[700,780,800]){
    const g=new Tidewheel({height});
    assert.equal(g.bricks.length,24);assert(g.bricks.every(b=>b.w===34&&b.h===18));
    for(const r of g.rafts)for(const angle of[-.08,.08]){
      const points=[[-54,-51],[54,-51],[57,48],[-57,48]].map(([x,y])=>raftPoint({...r,angle},x,y));
      assert(Math.min(...points.map(p=>p.x))>40);
      assert(Math.max(...points.map(p=>p.x))<320);
      assert(Math.max(...points.map(p=>p.y))<=g.paddle.y-210);
    }
  }
});

test('flood contact follows the real cropped hanging floor rather than removed corbels',()=>{
  const m=JSON.parse(readFileSync(new URL('../assets/fantasy-machinery/manifest.json',import.meta.url))).tidewheel.refugeBalcony;
  const h=78*m.size[1]/m.size[0],visibleBottom=33-m.pivot[1]*h+239/m.size[1]*h;
  assert(Math.abs(visibleBottom-REFUGE_LIP_OFFSET)<.1);
  const g=new Tidewheel();g.launch();g.balls[0].caught=true;
  assert.equal(g.water.limit,g.lumi.y+REFUGE_LIP_OFFSET);
  g.water.y=g.water.target=g.water.limit+.06;g.step(1/240);assert.equal(g.state,'play');
  g.water.y=g.water.target=g.water.limit+.04;g.step(1/240);assert.equal(g.state,'lost');assert.equal(g.loss,'flood');
});
test('pause freezes machinery and serve starts threat time rather than waiting on menu',()=>{
  const g=new Tidewheel();for(let i=0;i<100;i++)g.update(.1);
  assert.equal(g.water.y,g.water.initial);assert.equal(g.villain.stage,'idle');
  g.launch();assert(g.nextSurge>=g.time+12);
  g.pause();const s=JSON.stringify(g);g.update(.1);assert.equal(JSON.stringify(g),s);
});
test('raft geometry follows buoyancy, tilt and its exact brick transforms',()=>{
  const g=new Tidewheel();g.launch();g.water.target-=48;
  for(let i=0;i<120;i++)g.update(1/120);
  const r=g.rafts[0],b=g.bricks[0],t=g.targets().find(t=>t.id===b.id);
  assert(r.y<r.initial&&r.vy<0);assert.notEqual(r.angle,0);
  const p=raftPoint(r,b.lx,b.ly);assert.deepEqual(t.points[0],[p.x,p.y]);
  assert(Math.abs(r.angle)<=.08&&Math.abs(g.water.current)<=g.rules.current);
});
test('ordinary contacts always damage shell; two active-claw contacts cancel a warned surge',()=>{
  const g=new Tidewheel();g.launch();const b=g.balls[0],hp=g.villain.hp;
  g.hit({kind:'shell',id:'shell'},b);assert.equal(g.villain.hp,hp-1);
  g.villain.stage='pullWindup';g.villain.side=1;
  g.hit({kind:'claw',id:'claw1'},b);g.hit({kind:'claw',id:'claw1'},b);
  assert.equal(g.villain.stage,'recover');assert.equal(g.pulses.length,0);
});
test('earned Anchor can arm while idle, drains once and rejects a second spend while protected',()=>{
  const g=new Tidewheel();g.launch();g.charge=99;
  assert.equal(g.activate(),false);assert.equal(g.charge,99);
  g.charge=100;g.water.target-=48;const old=g.water.target;
  assert(g.activate());assert.equal(g.water.target,old+24);assert.equal(g.charge,0);
  g.charge=100;assert.equal(g.activate(),false);assert.equal(g.charge,100);
});
test('high-speed ball hits a moving raft cell without tunnelling or duplicate contact damage',()=>{
  const g=new Tidewheel();g.launch();const r=g.rafts[0],cell=g.bricks[0],q=raftPoint(r,cell.lx+17,cell.ly);
  const b=g.balls[0];Object.assign(b,{x:q.x,y:q.y-10,vx:0,vy:1200,caught:false});
  g.update(1/30);assert.equal(cell.hp,0);assert(g.score>=25);
  const credit=g.charge+g.chargeBank;assert(credit>0&&credit<=100/g.rules.credits+1e-6);
});
test('final shell hit wins before flood failure, and Continue preserves damage and broken gates',()=>{
  const g=new Tidewheel();g.launch();g.villain.hp=1;g.water.y=g.water.limit;
  g.hit({kind:'shell',id:'shell'},g.balls[0]);g.step(1/240);assert.equal(g.phase,'rescue');assert.equal(g.state,'play');
  for(let i=0;i<40;i++)g.update(.1);assert.equal(g.state,'won');
  const h=new Tidewheel();h.villain.hp=10;h.gates[0].hp=0;h.state='lost';h.water.y-=70;
  assert(h.continue());assert.equal(h.villain.hp,10);assert.equal(h.gates[0].hp,0);assert.equal(h.continue(),false);
});
