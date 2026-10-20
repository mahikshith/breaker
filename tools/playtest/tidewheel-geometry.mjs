import {Tidewheel} from '../../src/fantasy/tidewheel.js';
import {overlapsTarget} from '../../src/carrier-physics.js';
import {writeFileSync,readFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const out=process.argv[2]||'out/tidewheel-geometry';mkdirSync(out,{recursive:true});
const failures=[],near=[],rows=[];
for(const height of[700,780,800])for(const pose of['idle','step','hurt','pull'])for(const patrol of[-12,0,12])for(const phase of['neutral','raised','half','hauled'])for(const angle of[-.08,.08])for(const rightAngle of[-.08,.08])for(const drift of[-1.5,1.5])for(const buoyancy of['initial','stop']){
 const g=new Tidewheel({height});g.villain.footX=g.width/2+patrol;g.villain.pose=pose;g.syncAnatomy();
 g.claws[0].angle=({neutral:-.12,raised:.5,half:.19,hauled:-.12})[phase];
 g.claws[1].angle=({neutral:.12,raised:.12,half:-.215,hauled:-.55})[phase];
 for(const[index,r]of g.rafts.entries()){r.x=r.baseX+(index?-drift:drift);r.y=buoyancy==='initial'?r.initial:r.stop;r.angle=index?rightAngle:angle;}
 const targets=g.targets(),boss=targets.filter(t=>t.kind==='claw'||t.kind==='shell'),bricks=targets.filter(t=>t.kind==='brick');
 for(const b of bricks)for(const c of boss){
   const row={height,pose,patrol,phase,angle,rightAngle,drift,buoyancy,brick:b.id,boss:c.id};
   if(overlapsTarget({x:c.x,y:c.y,r:c.r},b))failures.push(row);
   else if(overlapsTarget({x:c.x,y:c.y,r:c.r+6},b))near.push(row);
 }
 const bounds=g.rafts.map((r,index)=>{const ids=new Set(g.bricks.filter(b=>b.raft===index).map(b=>b.id));ids.add('deck'+r.id);const p=targets.filter(t=>ids.has(t.id)||t.id.startsWith('deck'+r.id)||t.id==='brace'+r.id).flatMap(t=>t.points);return{minX:Math.min(...p.map(p=>p[0])),maxX:Math.max(...p.map(p=>p[0])),maxY:Math.max(...p.map(p=>p[1]))};});
 rows.push({height,pose,patrol,phase,angle,rightAngle,drift,buoyancy,outerLeft:bounds[0].minX-12,outerRight:348-bounds[1].maxX,central:bounds[1].minX-bounds[0].maxX,returnGap:g.paddle.y-Math.max(...bounds.map(b=>b.maxY))});
}
const report={scope:'Measured v2 target geometry, manually posed extrema; not earned play or raster proof.',source:createHash('sha256').update(readFileSync('src/fantasy/tidewheel.js')).digest('hex'),geometry:createHash('sha256').update(readFileSync('src/fantasy/tidewheel-v2-geometry.js')).digest('hex'),samples:rows.length,minOuter:Math.min(...rows.map(r=>Math.min(r.outerLeft,r.outerRight))),minCentral:Math.min(...rows.map(r=>r.central)),minReturn:Math.min(...rows.map(r=>r.returnGap)),overlaps:failures,nearWithinBallRadius:near,rows};
writeFileSync(out+'/geometry.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,rows:undefined,overlaps:failures.slice(0,10),overlapCount:failures.length,nearWithinBallRadius:near.slice(0,2),nearCount:near.length},null,2));
