// Bounded deterministic input assist; reads ball/bolt positions, never writes combat resources.
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
globalThis.Image = class { complete=true; naturalWidth=256; naturalHeight=256; decode(){return Promise.resolve();} };
const gradient={addColorStop(){}};
const ctx=new Proxy({}, {get:(_,k)=>k==='createLinearGradient'||k==='createRadialGradient'?()=>gradient:()=>{}});
globalThis.document={createElement:()=>({getContext:()=>ctx})};
const {Carrier}=await import('../../src/carrier.js'),{Relay}=await import('../../src/relay.js'),{Orbital}=await import('../../src/orbital.js');
const out=process.argv[2]||'out/combat-balance';mkdirSync(out,{recursive:true});
const selected=process.argv.slice(3),kinds={carrier:Carrier,circuit:Relay,forge:Orbital};
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const report={scope:'One deterministic input-assisted attempt per mode/phone/ship. Reads ball trajectories and visible bolts; no target aiming solver, HP/charge/life writes or Continue. This controller is not human balance evidence.',sources:Object.fromEntries(['arena','carrier','relay','orbital','space-weapons','difficulty'].map(n=>[n,sha(`src/${n}.js`)])),cases:[]};
const fold=(x,lo,hi)=>{const w=hi-lo,z=((x-lo)%(2*w)+2*w)%(2*w);return lo+(z>w?2*w-z:z);};
for(const[id,Class]of Object.entries(kinds).filter(([id])=>!selected.length||selected.includes(id)))for(const mode of ['easy','medium','hard'])for(const[device,H,s]of[['ios',729,393/360],['android',785,412/360]]){
 let seed=1987;const oldRandom=Math.random;Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
 const l=new Class(360,H,s,mode),casts=[],lives=[],events=[];let returns=0,priorVy=-1,priorLife=l.lives,aimTick=-1,nextInput=0;
 for(let i=0;i<420*120&&l.state==='play';i++){
  const p=l.paddle,dt=1/120,y=l.H-20;
  if(l.canUseCorePower()){
   const choices=l.balls.filter(b=>!b.dead).length<4?['five','laser','titan']:['laser','titan','five'];
   const kind=choices.find(k=>l.canChoosePower(k));
   if(kind&&l.activateCorePower()&&l.chooseSpacePower(kind))casts.push({t:l.clock,kind});
  }
  if(l.aim&&aimTick<0){l.pointerDown(p.x,y);l.pointerMove(p.x+[-24,30,-38,17][returns%4],y);aimTick=i;}
  else if(l.aim&&i>aimTick&&aimTick>=0){l.pointerUp();l.key(' ',false);aimTick=-1;}
  else if(i>=nextInput&&!l.aim){
   nextInput=i+12;
   const fall=l.balls.filter(b=>!b.dead&&!b.caught&&b.vy>0).map(b=>({b,t:(p.y-b.r-b.y)/b.vy})).filter(v=>v.t>=0).sort((a,b)=>a.t-b.t)[0];
   let x=p.x;
   if(fall){const b=fall.b;x=fold(b.x+b.vx*fall.t,l.left+b.r,l.right-b.r)+[-.12,.15,.08,-.18][returns%4]*p.w;}
   else if(l.phase==='flight')x=180+90*Math.sin(l.clock*1.2);
   const threats=(l.bolts||[]).filter(b=>b.vy>0).map(b=>({b,t:(p.y-b.y)/b.vy})).filter(v=>v.t>=0&&v.t<.75);
   if(threats.length&&(!fall||fall.t>.45)){
    const lo=l.left+p.w/2,hi=l.right-p.w/2,candidates=[lo,(lo+hi)/2,hi];
    x=candidates.sort((a,b)=>Math.min(...threats.map(v=>Math.abs(a-v.b.x-v.b.vx*v.t)))-Math.min(...threats.map(v=>Math.abs(b-v.b.x-v.b.vx*v.t)))).at(-1);
   }
   x=Math.max(l.left+p.w/2,Math.min(l.right-p.w/2,Math.round(x/12)*12));
   if(!l.ptr.down)l.pointerDown(p.x,y);l.pointerMove(l.ptr.anchor+(x-l.ptr.padAnchor)/1.15,y);
  }
  l.update(dt);
  if(l.lives!==priorLife){lives.push({t:l.clock,from:priorLife,to:l.lives});priorLife=l.lives;}
  if(priorVy>0&&l.balls[0]?.vy<0)returns++;priorVy=l.balls[0]?.vy||0;
  assert(l.balls.every(b=>Number.isFinite(b.x+b.y+b.vx+b.vy)),`${id}: nonfinite ball`);
 }
 Math.random=oldRandom;
 const result={id,mode,device,state:l.state,phase:l.phase,seconds:l.clock,lives:l.lives,casts,losses:lives,returns,hp:l.hp??l.hull?.hp??l.carrier?.hp,reason:l.reason,bricksRemaining:l.bricks.filter(b=>b.hp>0).length};
 report.cases.push(result);writeFileSync(`${out}/report.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(result));
}
report.complete=true;writeFileSync(`${out}/report.json`,JSON.stringify(report,null,2));
