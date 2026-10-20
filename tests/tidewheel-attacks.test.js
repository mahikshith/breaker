import test from 'node:test';
import assert from 'node:assert/strict';
import {Tidewheel,REFUGE_LIP_OFFSET} from '../src/fantasy/tidewheel.js';

const advance=(g,seconds)=>{for(let t=0;t<seconds-1e-7;t+=1/240)g.step(Math.min(1/240,seconds-t));};
function pulse(g,overrides={}){
  return {id:100,x:g.paddle.x,y:g.paddle.y-50,px:g.paddle.x,py:g.paddle.y-50,vx:0,vy:800,r:10,age:0,life:3,...overrides};
}

test('three productive hits cannot create an opening angry attack or postpone the fixed warning',()=>{
  const g=new Tidewheel();g.launch();
  for(let n=0;n<3;n++)g.hit({kind:'shell'},g.balls[0]);
  assert.equal(g.villain.anger,3);assert.equal(g.nextSurge,12);
  g.time=12;g.updateMachinery(1/240);assert.equal(g.villain.stage,'pullWindup');assert.equal(g.villain.enraged,false);
  const time=g.villain.stageTime;
  g.hit({kind:'shell'},g.balls[0]);g.updateMachinery(.1);
  assert(g.villain.stageTime>time,'a hurt response does not reset or freeze the warning');
});

test('enraged pull is warned, bounded, and smoothly lowers the refuge at most three steps',()=>{
  for(const difficulty of['easy','medium','hard']){
    const g=new Tidewheel({difficulty});g.launch();g.time=20;g.teachingDone=true;
    const initial=g.water.target;
    for(let n=0;n<4;n++){
      g.villain.anger=3;g.beginPull();assert.equal(g.villain.enraged,true);
      const y=g.lumi.y;g.updateMachinery(g.rules.warning-.01);assert.equal(g.lumi.y,y);
      g.updateMachinery(.02);
      assert.equal(g.villain.stage,'pull');assert(g.lumi.y-y<=.4+1e-6,'no six-unit teleport');
      assert.equal(g.lumi.targetY,g.lumi.baseY+Math.min(n+1,3)*6);
      assert.equal(g.water.limit,g.lumi.y+REFUGE_LIP_OFFSET);
      for(let k=0;k<60;k++)g.updateMachinery(1/60);
    }
    assert.equal(g.lumi.steps,3);assert.equal(g.lumi.targetY,93);
    assert(initial-g.water.target<=4*g.rules.angryRise+1e-6);
  }
});

test('ordinary hurt pauses the bounded patrol for .4s while the attack remains live',()=>{
  const g=new Tidewheel();g.launch();g.updateMachinery(.1);const x=g.villain.footX;
  g.hit({kind:'shell'},g.balls[0]);g.time+=.2;g.updateMachinery(.2);
  assert.equal(g.villain.footX,x);assert.equal(g.villain.pose,'hurt');assert.equal(g.villain.footY,232);
  g.time+=.21;g.updateMachinery(.01);assert.notEqual(g.villain.footX,x);
  assert(Math.abs(g.villain.footX-g.width/2)<=12);
});

test('the real clamped chain end hauls away from the lower wheel through the measured rigid pose',()=>{
  const g=new Tidewheel();g.launch();g.beginPull();g.syncAnatomy();
  const distance=()=>Math.hypot(g.chain.hand.x-g.chain.pulley.x,g.chain.hand.y-g.chain.pulley.y);
  const before=distance();g.villain.stage='pull';g.villain.stageTime=.75;g.syncAnatomy();
  assert(distance()>before+25,'the free chain length increases instead of releasing slack');
  assert.equal(g.claws.find(c=>c.side>0).angle,-.55);assert(g.chain.wheelAngle<-.5);
  const turn=g.chain.wheelAngle;g.villain.stage='recover';g.villain.stageTime=1;g.syncAnatomy();assert.equal(g.chain.wheelAngle,turn,'ratchet does not unwind during recovery');
  assert(Math.hypot(g.chain.hand.x-g.claws[1].grip.x,g.chain.hand.y-g.claws[1].grip.y)>10,'chain starts at measured free end, not through the jaw');
});

test('a fixed water warning leaves room to dodge and never follows a later paddle drag',()=>{
  for(const difficulty of['easy','medium','hard'])for(const x of[62,180,298]){
    const g=new Tidewheel({difficulty});g.launch();g.paddle.x=g.paddle.px=x;g.beginPulse();
    const w=structuredClone(g.pulseWarning),destination=x<180?298:62;
    g.setTarget(destination);advance(g,g.rules.pulseWarning+.03);
    assert.equal(g.pulses.length,1);const q=g.pulses[0];
    assert.equal(w.targetX,x);assert.deepEqual(q.from,g.villain.emission.from,'born at the actual fire-time claw');
    const at=q.from.x+(g.paddle.y-q.from.y)*q.vx/q.vy;
    assert(Math.abs(at-x)<1e-8,'aim stays at the warned lane');
    assert(Math.abs(g.paddle.x-at)>g.paddle.w/2+q.r);
    assert(g.rules.pulseWarning>(Math.abs(destination-x)/700));
  }
});

test('a physical water pulse bypasses the brick bank, costs one life on contact and clears',()=>{
  const g=new Tidewheel();g.launch();g.balls[0].caught=true;
  const before=g.bricks.map(b=>b.hp);g.paddle.px=g.paddle.x;
  g.pulses=[pulse(g)];g.updatePulses(.1);
  assert.equal(g.lives,2);assert.equal(g.phase,'serve');assert.equal(g.pulses.length,0);
  assert.deepEqual(g.bricks.map(b=>b.hp),before);assert.equal(g.chargeBank,0);
  g.updatePulses(.1);assert.equal(g.lives,2);
});

test('swept ordinary ball contact deflects a fast water pulse before paddle contact',()=>{
  const g=new Tidewheel();g.launch();const b=g.balls[0];
  Object.assign(b,{px:g.paddle.x-14,py:g.paddle.y-35,x:g.paddle.x+56,y:g.paddle.y-35});
  g.paddle.px=g.paddle.x;g.pulses=[pulse(g)];g.updatePulses(.1);
  assert.equal(g.lives,3);assert.equal(g.pulses.length,1);
  assert(g.pulses[0].reflected&&g.pulses[0].harmless);assert.equal(g.chargeBank,0);
});

test('Anchor queries while paused and cancels either real attack once without free recharge',()=>{
  for(const stage of['pullWindup','pull','pulseWindup','pulse']){
    const g=new Tidewheel();g.launch();g.charge=100;g.chargeBank=0;g.villain.stage=stage;g.pause();
    assert(!g.canActivate());assert(g.canActivate('anchor',{ignorePause:true}));assert(!g.activate());
    g.pause(false);assert(g.activate());assert.equal(g.charge,0);assert.equal(g.chargeBank,0);assert.equal(g.villain.stage,'recover');
    assert(!g.activate());assert.equal(g.pulses.length,0);
  }
});

test('Continue preserves refuge and combat progress, creates visible flood headroom and grace',()=>{
  const g=new Tidewheel();g.launch();g.villain.hp=9;g.bricks[0].hp=0;g.gates[0].hp=0;g.rafts[0].braceHP=0;
  g.lumi.steps=3;g.lumi.y=g.lumi.targetY=93;g.water.limit=93+REFUGE_LIP_OFFSET;g.water.y=g.water.limit;g.state='lost';
  assert(g.continue());assert.equal(g.lumi.steps,3);assert.equal(g.villain.hp,9);assert.equal(g.bricks[0].hp,0);assert.equal(g.gates[0].hp,0);assert.equal(g.rafts[0].braceHP,0);
  assert(g.water.y>=g.lumi.y+REFUGE_LIP_OFFSET+40);assert(g.attackGrace>=g.time+6);
  advance(g,3.1);assert.equal(g.state,'play');assert.equal(g.phase,'play');assert.equal(g.pulses.length,0);
});

test('an actual final body contact owns the tick over a simultaneous water pulse and flood',()=>{
  const g=new Tidewheel();g.launch();g.villain.hp=1;g.water.y=g.water.target=g.water.limit;
  const t=g.targets().filter(t=>t.kind==='shell').sort((a,b)=>b.r-a.r)[0],b=g.balls[0];
  Object.assign(b,{x:t.x,y:t.y+t.r+b.r+.1,vx:0,vy:-345});g.pulses=[pulse(g,{y:g.paddle.y-10,py:g.paddle.y-10})];
  g.update(1/240);assert.equal(g.phase,'rescue');assert.equal(g.state,'play');assert.equal(g.lives,3);assert.equal(g.pulses.length,0);
});
