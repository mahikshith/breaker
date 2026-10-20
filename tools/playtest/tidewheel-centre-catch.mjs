import {Tidewheel} from '../../src/fantasy/tidewheel.js';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const out=process.argv[2]||'out/tidewheel-centre-catch';mkdirSync(out,{recursive:true});
const bound=process.argv.includes('--opening')?2:40;
const sha=()=>createHash('sha256').update(readFileSync('src/fantasy/tidewheel.js')).digest('hex');
const report={scope:'Public launch/setTarget/update only, centre catches without intentional rebound aiming or powers. Nine fixed Easy cases. No HP/resource/actor/progression writes. Not human balance proof.',bound,before:sha(),rows:[]};
const fold=x=>{const w=324,t=((x-18)%(2*w)+2*w)%(2*w);return 18+(t>w?2*w-t:t);};
for(const height of[700,780,800])for(const angle of[-.22,0,.22]){
 const g=new Tidewheel({height});let first=null,firstBoss=null;
 const hit=g.hit;g.hit=function(t,b){first??=this.time;if(['shell','claw'].includes(t.kind))firstBoss??=this.time;return hit.call(this,t,b);};
 g.launch(-Math.PI/2+angle);
 for(let n=0;n<240*bound&&g.state==='play';n++){
   const b=g.balls[0];if(b.caught)g.launch(-Math.PI/2+angle);
   if(n%12===0)g.setTarget(b.vy>0?fold(b.x+b.vx*Math.max(0,(g.paddle.y-g.paddle.h/2-b.r-b.y)/b.vy)):b.x);
   g.update(1/240);
 }
 const row={height,angle,first,firstBoss,state:g.state,time:g.time,hp:g.villain.hp,lives:g.lives,bricks:g.bricks.filter(b=>b.hp===0).length,braceHP:g.rafts.map(r=>r.braceHP)};
 report.rows.push(row);console.log(row);
}
report.after=sha();report.stable=report.before===report.after;
writeFileSync(out+'/report.json',JSON.stringify(report,null,2));assert(report.stable);
assert(report.rows.every(r=>r.first<2),'every fixed opening gives productive feedback within two seconds');
