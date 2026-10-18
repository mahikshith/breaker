import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {sweepTarget,overlapsTarget} from '../../src/carrier-physics.js';
globalThis.Image=class{decode(){return Promise.resolve();}};
const{Orbital}=await import('../../src/orbital.js'),manifest=JSON.parse(readFileSync('assets/orbital-forge/manifest.json'));
const fresh=()=>new Orbital(360,729,393/360,'medium',manifest),first=(l,from,to,r)=>l.targets().map(t=>({id:t.id,hit:sweepTarget(from,to,r,t)})).filter(h=>h.hit).sort((a,b)=>a.hit.t-b.hit.t)[0]?.id;
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const report={scope:'Actual source-relative full-radius straight sweeps. Open-target access fixture explicitly removes breakable panels; this is geometry evidence, separate from earned whole-level runs.',source:sha('src/orbital.js'),manifest:sha('assets/orbital-forge/manifest.json'),reference:manifest.reference,stations:[],core:[],muzzles:[],angularLeaf:{solverHz:120,angularSubsteps:8,openingSeconds:.4,radians:Math.PI*.58,maxTipTravelPerSubstep:Math.hypot(55,55*854/900/2)*Math.PI*.58*1.5/.4/960}};
for(const r of[7.5,10])for(let i=0;i<3;i++){
 const l=fresh();l.started=true;l.stage='open';l.activeIndex=i;for(const p of l.bricks)p.hp=0;const s=l.stations[i],positions=[];
 for(let x=72.5;x<=287.5;x+=.5)if(first(l,{x,y:l.paddle.y-r-1},s,r)===s.id)positions.push(x);
 assert(positions.length);l.stage='anticipate';assert.notEqual(first(l,{x:s.x,y:s.y+60},s,r),s.id);
 report.stations.push({id:s.id,radius:r,legalStraightPaddleCentres:{min:positions[0],max:positions.at(-1),count:positions.length},closedLeafBlocks:true,worldPose:l.stationPose(s)});
}
for(const r of[7.5,10]){
 const l=fresh();l.phase='core';for(const p of l.bricks)p.hp=0;const positions=[];
 for(let x=72.5;x<=287.5;x+=.5)if(first(l,{x,y:l.paddle.y-r-1},{x:180,y:246},r)==='core')positions.push(x);
 assert(positions.length);assert(overlapsTarget({x:180,y:214,r:3},l.targets().find(t=>t.id==='hull')));
 report.core.push({radius:r,legalStraightPaddleCentres:{min:positions[0],max:positions.at(-1),count:positions.length},pose:l.projectorPose(),lowerLipStillPhysical:true});
}
for(let i=0;i<2;i++){
 let tested=0;for(let x=73;x<=287;x+=2){const l=fresh();l.started=true;l.teachDone=true;l.guns[1-i].hp=0;l.paddle.x=x;l.warn();const from=l.muzzle(l.guns[i]),hull=l.targets().find(t=>t.id==='hull'),dx=x-from.x,dy=l.paddle.y-from.y,n=Math.hypot(dx,dy),to={x:from.x+12*dx/n,y:from.y+12*dy/n};assert(!overlapsTarget({...from,r:3.5},hull));assert(!sweepTarget(from,to,3.5,hull));tested++;}
 report.muzzles.push({id:'gun'+i,testedTargetLanes:tested,radius:3.5,firstForwardDistance:12,allClear:true});
}
mkdirSync('out/orbital-forge',{recursive:true});writeFileSync('out/orbital-forge/geometry.json',JSON.stringify(report,null,2));console.log('Actual Forge geometry sweeps passed');
