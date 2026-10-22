import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
globalThis.Image=class{complete=true;naturalWidth=1;decode(){return Promise.resolve();}};
const {Carrier}=await import('../../src/carrier.js');
const {sweepTarget}=await import('../../src/carrier-physics.js');
const out=process.argv[2]||'out/physics-recheck-other/carrier-focus-before';mkdirSync(out,{recursive:true});
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
let seed=1987;const random=Math.random;Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
const l=new Carrier(360,729,393/360,'easy');l.release();l.aim=null;l.balls[0].caught=true;
let fighter;
for(let i=0;i<5000;i++){
 l.updateLevel(1/120,1/120);
 fighter=l.fighters.find(f=>f.stage==='approach'&&l.clock-f.stageAt>=.7);
 if(fighter)break;
}
Math.random=random;assert(fighter,'natural authored first raid supplies a moving approach fighter');
l.timeScale=.25;const dtReal=1/120,dt=dtReal*l.timeScale,slow=l.targets(1/l.timeScale),old=l.targets();
const target=slow.find(t=>t.id===fighter.id);assert(target&&Math.hypot(target.vx,target.vy)>1);
const points=target.shapes.flatMap(s=>s.points||[]),xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
const nearest=(from,to,targets)=>targets.map(t=>({id:t.id,hit:sweepTarget(from,to,6.8,t,0,dt)})).filter(t=>t.hit).sort((a,b)=>a.hit.t-b.hit.t)[0];
let found;
for(let y=Math.min(...ys)-8;y<=Math.max(...ys)+8&&!found;y+=.25)for(let x=Math.min(...xs)-8;x<=Math.max(...xs)+8&&!found;x+=.25){
 const from={x,y},to={x,y:y-560*dt,r:6.8,vy:-560};
 if(!sweepTarget(from,to,6.8,target,0,dt)||sweepTarget(from,to,6.8,old.find(t=>t.id===fighter.id),0,dt))continue;
 const correct=nearest(from,to,slow),incorrect=nearest(from,to,old);
 if(correct?.id===fighter.id&&!incorrect)found={from,to,correct,incorrect:incorrect||null};
}
assert(found,'a real source-silhouette crossing ray isolates the temporal discrepancy');
const hp=fighter.hp,actual=l.shotHit(found.to,found.from.y,dt);
const report={scope:'Staged LASER crossing diagnostic, natural first-raid approach and actual source fighter silhouette. No geometry or callback substitution; the projectile is positioned to isolate one physical crossing, not an earned shot or human play.',sourceSHA256:hash('src/carrier.js'),clock:l.clock,fighter:{id:fighter.id,stage:fighter.stage,stageAt:fighter.stageAt,pose:l.fighterPose(fighter),realVelocity:{vx:target.vx*l.timeScale,vy:target.vy*l.timeScale}},timeScale:l.timeScale,dtReal,dt,ray:found,expected:true,actual,hpBefore:hp,hpAfter:fighter.hp};
writeFileSync(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
