import test from 'node:test';
import assert from 'node:assert/strict';
import {sweepTarget} from '../src/carrier-physics.js';
globalThis.Image=class{complete=true;naturalWidth=1;decode(){return Promise.resolve();}};
const {Carrier}=await import('../src/carrier.js');

function firstApproach(height,scale){
 const previous=Math.random;let seed=1987;
 Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
 try{
  const level=new Carrier(360,height,scale,'easy');level.release();level.aim=null;level.balls[0].caught=true;
  for(let i=0;i<5000;i++){
   level.updateLevel(1/120,1/120);
   const fighter=level.fighters.find(f=>f.stage==='approach'&&level.clock-f.stageAt>=.7);
   if(fighter)return{level,fighter};
  }
  assert.fail('the authored first boarding raid must reach its approach');
 }finally{Math.random=previous;}
}

test('Carrier LASER hits the actual moving fighter during Focus, with or without SLOW, at both phone geometries',()=>{
 for(const [height,scale]of[[729,393/360],[785,412/360]])for(const slow of[0,2]){
  const{level:l,fighter:f}=firstApproach(height,scale),p=l.fighterPose(f);l.timeScale=.25;l.slowT=slow;
  const dtReal=1/120,dt=dtReal*l.timeScale,from={x:p.x+12.1,y:p.y-22.29},shot={x:from.x,y:from.y-560*dt,r:6.8,vy:-560};
  const target=l.targets(1/l.timeScale).find(t=>t.id===f.id),oldTarget=l.targets().find(t=>t.id===f.id);
  assert(Math.abs(target.vx*l.timeScale)>100,'the actual authored fighter is moving, not a replacement test rectangle');
  assert(sweepTarget(from,shot,shot.r,target,0,dt),'active-real fighter motion enters the physical shot sweep');
  assert.equal(sweepTarget(from,shot,shot.r,oldTarget,0,dt),null,'uncompensated motion reproduces the previous missed contact');
  const hp=f.hp,bank=l.coreChargeBank,charge=l.paddle.charge;
  assert(l.shotHit(shot,from.y,dt));assert.equal(f.hp,hp-1,'the real fighter loses exactly one HP');
  assert.equal(l.coreChargeBank,bank,'friendly LASER cannot farm companion charge');assert.equal(l.paddle.charge,charge);
 }
});
