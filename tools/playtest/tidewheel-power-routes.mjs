// Eight bounded public-input routes; no resource/health/actor writes or policy search.
// Usage: node tools/playtest/tidewheel-power-routes.mjs [output]
import {Tidewheel} from '../../src/fantasy/tidewheel.js';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const out=process.argv[2]||'out/tidewheel-power-routes';mkdirSync(out,{recursive:true});
const hash=()=>createHash('sha256').update(readFileSync('src/fantasy/tidewheel.js')).digest('hex');
const report={scope:'Pure logical-phone model. One fixed coarse policy for ordinary/each power, public launch/setTarget/update/activate only, no HP/resource/actor/progression writes. Not DOM/physical-device/human balance proof.',sourceBefore:hash(),runs:[]};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),fold=x=>{const w=324,t=((x-18)%(2*w)+2*w)%(2*w);return 18+(t>w?2*w-t:t);};
for(const [device,viewport]of Object.entries({ios:[393,852],android:[412,915]}))for(const power of['ordinary','anchor','volley','cosmic']){
  const scale=viewport[0]/360,height=viewport[1]/scale,paddleY=height-126/scale;
  const g=new Tidewheel({height,paddleY}),events=[],casts=[];let firstFull=null;
  const hit=g.hit;g.hit=function(t,b){const hp=this.villain.hp,bank=this.chargeBank,powered=!!b.powerShot||b.titan>0;const r=hit.call(this,t,b);events.push({time:this.time,kind:t.kind,power:powered,hpBefore:hp,hpAfter:this.villain.hp,bankBefore:bank,bankAfter:this.chargeBank});return r;};
  g.launch();
  for(let tick=0;tick<240*180&&g.state==='play';tick++){
    const b=g.balls[0];if(b.caught)g.launch();
    if(firstFull===null&&g.charge===100)firstFull=g.time;
    if(power!=='ordinary'&&g.canActivate(power)){
      const before=g.charge,bank=g.chargeBank,hp=g.villain.hp;assert(g.activate(power));
      casts.push({time:g.time,hp,before,bank,after:g.charge});
    }
    if(tick%12===0){
      let x=b.x;if(b.vy>0){const landing=fold(b.x+b.vx*Math.max(0,(g.paddle.y-g.paddle.h/2-b.r-b.y)/b.vy));const aim=Math.atan2(g.villain.x-landing,g.paddle.y-g.villain.y);x=landing-clamp(aim/1.05,-.8,.8)*g.paddle.w/2;}
      for(const q of g.pulses.filter(q=>!q.reflected)){
        const eta=(g.paddle.y-g.paddle.h/2-q.r-q.y)/q.vy;
        if(eta>0&&eta<.5){const lane=q.x+q.vx*eta,clear=g.paddle.w/2+q.r+8,lo=12+g.paddle.w/2,hi=g.width-12-g.paddle.w/2;
          if(Math.abs(x-lane)<clear){const choices=[lane-clear,lane+clear].filter(v=>v>=lo&&v<=hi);if(choices.length)x=choices.sort((a,b)=>Math.abs(a-g.paddle.x)-Math.abs(b-g.paddle.x))[0];}}
      }
      g.setTarget(Math.round(x/8)*8);
    }
    g.update(1/240);assert(Number.isFinite(b.x)&&Number.isFinite(b.y));
  }
  const run={device,viewport,height,paddleY,power,state:g.state,seconds:g.time,hp:g.villain.hp,lives:g.lives,loss:g.loss,firstFull,casts,bricksCleared:g.bricks.filter(b=>!b.hp).length,poweredHits:events.filter(e=>e.power).length,ordinaryHits:events.filter(e=>!e.power).length,powerChargeViolations:events.filter(e=>e.power&&e.bankAfter>e.bankBefore),events};
  report.runs.push(run);console.log(device,power,g.state,g.time.toFixed(2),g.lives,'ready',firstFull?.toFixed(2),'casts',casts.map(c=>c.time.toFixed(2)));
}
report.sourceAfter=hash();report.stable=report.sourceBefore===report.sourceAfter;
writeFileSync(out+'/routes.json',JSON.stringify(report,null,2));assert(report.stable);assert(report.runs.every(r=>!r.powerChargeViolations.length));
