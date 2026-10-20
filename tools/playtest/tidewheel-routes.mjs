import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Tidewheel} from '../../src/fantasy/tidewheel.js';
import {overlapsTarget} from '../../src/carrier-physics.js';

const OUT=process.argv[2]||'out/tidewheel-routes';mkdirSync(OUT,{recursive:true});
const hash=()=>createHash('sha256').update(readFileSync('src/fantasy/tidewheel.js')).digest('hex');
const geometryHash=()=>createHash('sha256').update(readFileSync('src/fantasy/tidewheel-v2-geometry.js')).digest('hex');
const report={scope:'Pure model only. Legal public launch/setTarget/update inputs; no HP/resources/actor/progression writes. Three predetermined angles, coarse 20Hz/8u paddle prediction and fixed-lane pulse dodge; no search or tuning. No renderer/phone/art claim.',sourceBefore:hash(),geometryBefore:geometryHash(),runs:[]};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function reflected(x,lo=18,hi=342){const w=hi-lo,t=((x-lo)%(2*w)+2*w)%(2*w);return lo+(t>w?2*w-t:t);}
for(const height of[700,780,800])for(const difficulty of['easy','medium','hard'])for(const offset of[0,.28,-.28]){
  const g=new Tidewheel({height,difficulty}),hits=[],snapshots=[],speeds=[],severe=[],initial={hp:g.villain.hp,water:g.water.y,paddle:g.paddle.y};
  const hit=g.hit;g.hit=function(t,b){const before={hp:this.villain.hp,bank:this.chargeBank};const result=hit.call(this,t,b);hits.push({time:this.time,id:t.id,kind:t.kind,before,after:this.villain.hp});return result;};
  let readyAt=null,stuckFor=0,longestStall=0,last=null;
  for(let tick=0;tick<240*240&&g.state==='play';tick++){
    const b=g.balls[0];
    if(b.caught)g.launch(-Math.PI/2+offset);
    if(tick%12===0){
      let x=b.x;
      if(b.vy>0){const catchX=reflected(b.x+b.vx*Math.max(0,(g.paddle.y-g.paddle.h/2-b.r-b.y)/b.vy));
        const aim=Math.atan2(g.villain.x-catchX,g.paddle.y-g.villain.y);
        x=catchX-clamp(aim/1.05,-.8,.8)*g.paddle.w/2;
      }
      // Public visual-lane dodge only; no power/resources or actor writes.
      for(const q of g.pulses.filter(q=>!q.reflected)){
        const eta=(g.paddle.y-g.paddle.h/2-q.r-q.y)/q.vy;
        if(eta>0&&eta<.5){
          const lane=q.x+q.vx*eta,clear=g.paddle.w/2+q.r+8,lo=12+g.paddle.w/2,hi=g.width-12-g.paddle.w/2;
          if(Math.abs(x-lane)<clear){const choices=[lane-clear,lane+clear].filter(v=>v>=lo&&v<=hi);if(choices.length)x=choices.sort((a,b)=>Math.abs(a-g.paddle.x)-Math.abs(b-g.paddle.x))[0];}
        }
      }
      g.setTarget(Math.round(x/8)*8);
    }
    g.update(1/240);
    assert(Number.isFinite(b.x)&&Number.isFinite(b.y)&&Number.isFinite(b.vx)&&Number.isFinite(b.vy));
    if(!b.caught)speeds.push(Math.hypot(b.vx,b.vy));
    if(readyAt===null&&g.charge>=100-1e-6)readyAt=g.time;
    const dx=last?Math.hypot(b.x-last.x,b.y-last.y):1;last={x:b.x,y:b.y};
    stuckFor=dx<.02&&!b.caught&&g.phase==='play'?stuckFor+1/240:0;longestStall=Math.max(longestStall,stuckFor);
    if(g.phase==='play'&&tick%24===0){
      const overlaps=g.targets().filter(t=>t.kind==='brick'&&overlapsTarget({...b,r:b.r-.15},t));
      if(overlaps.length)severe.push({time:g.time,x:b.x,y:b.y,ids:overlaps.map(t=>t.id)});
    }
    if(tick%2400===0)snapshots.push({time:g.time,hp:g.villain.hp,water:g.water.y,stage:g.villain.stage,lives:g.lives,remainingBricks:g.bricks.filter(b=>b.hp>0).length});
  }
  const result={height,difficulty,initialAngle:offset,state:g.state,phase:g.phase,seconds:g.time,hp:g.villain.hp,lives:g.lives,loss:g.loss,water:g.water.y,readyAt,
    firstProductive:hits[0]?.time,firstBrick:hits.find(h=>h.kind==='brick')?.time,firstBoss:hits.find(h=>h.kind==='shell'||h.kind==='claw')?.time,braceHP:g.rafts.map(r=>r.braceHP),bracesBroken:g.rafts.filter(r=>r.braceHP===0).length,bricksCleared:g.bricks.filter(b=>b.hp<=0).length,gatesCleared:g.gates.filter(b=>b.hp<=0).length,
    shellHits:hits.filter(h=>h.kind==='shell').length,clawHits:hits.filter(h=>h.kind==='claw').length,
    longestStall,overlapSamples:severe.length,overlapExamples:severe.slice(0,5),minSpeed:Math.min(...speeds),maxSpeed:Math.max(...speeds),snapshots,hits};
  report.runs.push(result);console.log(height,difficulty,offset,g.state,g.time.toFixed(2),g.villain.hp,g.lives,'bricks',result.bricksCleared,'overlap',severe.length);
}
report.sourceAfter=hash();report.geometryAfter=geometryHash();report.sourceStable=report.sourceBefore===report.sourceAfter&&report.geometryBefore===report.geometryAfter;
writeFileSync(OUT+'/routes.json',JSON.stringify(report,null,2));
assert(report.sourceStable);
