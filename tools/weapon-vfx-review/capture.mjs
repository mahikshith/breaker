import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const {chromium}=await import(process.env.PW_MODULE||'playwright'),out='out/weapon-vfx-v2';mkdirSync(out+'/scenes',{recursive:true});
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex'),ab=JSON.parse(readFileSync('design/phase1/space-assets-ab.json')),forge=JSON.parse(readFileSync('assets/orbital-forge/manifest.json'));
const configs={carrier:{html:'out/space-selected-review/carrier.html',part:ab.parts.aCannonBarrel},circuit:{html:'out/space-selected-review/circuit/circuit.html',part:ab.parts.bCannonBarrel},forge:{html:'out/space-selected-review/forge/forge.html',part:forge.parts.cannon}};
const report={scope:'Frozen actual-Main native snapshots for a visual-only weapon animation compositor. No game source or4188 payload is modified. One corridor is cleared in this temporary page and one existing panel is isolated for staged impact breakup.',scenes:{},frozen:Object.fromEntries(Object.entries(configs).map(([k,c])=>[k,sha(c.html)]))};
const browser=await chromium.launch({executablePath:process.env.PW_CHROMIUM,args:['--mute-audio']});
try{for(const[kind,c]of Object.entries(configs))for(const[device,D]of Object.entries({ios:{width:393,height:852,top:59,bottom:34},android:{width:412,height:915,top:32,bottom:24}})){
 const p=await browser.newPage({viewport:D,deviceScaleFactor:2}),errors=[];p.on('pageerror',e=>errors.push(e.stack||e.message));
 await p.addInitScript(()=>{requestAnimationFrame=f=>{window.__vfxFrame=f;return 1;};const Old=Image;window.__vfxImages=[];window.Image=class extends Old{constructor(){super();__vfxImages.push(this);}};});
 await p.goto(`${pathToFileURL(resolve(c.html)).href}?difficulty=hard&safe=${D.top},${D.bottom}`);await p.waitForFunction(()=>window.__breach&&window.__vfxFrame,null,{polling:50});
 await p.evaluate(async()=>{await document.fonts.load('18px "Lilita One"');await document.fonts.load('600 16px Rubik');await document.fonts.ready;__breach.start(0);await Promise.all(__vfxImages.map(i=>i.decode()));});
 const info=await p.evaluate(({kind,part,D})=>{
  const l=__breach.level;let now=performance.now();__vfxFrame(now);__vfxFrame(now+=17);l.clock=0;l.attack=null;l.aim=null;
  const gun=l.guns.at(-1),pose=l.cannonPose(gun),w=pose.w||part.display[0],h=pose.h||part.display[1],pivot=[pose.px??part.pivot[0],pose.py??part.pivot[1]];
  const getRect=b=>kind==='forge'?{x:b.x,y:b.y,w:b.w,h:b.h}:b.art.rect;
  const target=[...l.bricks].filter(b=>b.hp>0).sort((a,b)=>{const A=getRect(a),B=getRect(b);return Math.round(B.y)-Math.round(A.y)||Math.abs(A.x+A.w/2-pose.x)-Math.abs(B.x+B.w/2-pose.x);})[0],r=getRect(target),hit={x:r.x+r.w/2,y:r.y+r.h/2};
  const angle=-Math.atan2(hit.x-pose.x,hit.y-pose.y),local=kind==='carrier'?{x:0,y:6}:kind==='circuit'?{x:0,y:8}:{x:(.5-pivot[0])*w,y:(.82-pivot[1])*h};
  const muzzle={x:pose.x+local.x*Math.cos(angle)-local.y*Math.sin(angle),y:pose.y+local.x*Math.sin(angle)+local.y*Math.cos(angle)};
  const distance=q=>{const vx=hit.x-muzzle.x,vy=hit.y-muzzle.y,t=Math.max(0,Math.min(1,((q.x-muzzle.x)*vx+(q.y-muzzle.y)*vy)/(vx*vx+vy*vy)));return Math.hypot(q.x-muzzle.x-t*vx,q.y-muzzle.y-t*vy);};
  for(const b of l.bricks){const r=getRect(b);if(b===target||distance({x:r.x+r.w/2,y:r.y+r.h/2})<32)b.hp=0;}
  if(kind==='carrier'){const orig=l.drawCannon.bind(l);l.drawCannon=(g,c)=>{if(c!==gun)orig(g,c);};const crew=l.drawCrew.bind(l);l.drawCrew=(g,c)=>{if(distance({x:c.art.x,y:c.art.y})>40)crew(g,c);};}
  else{const orig=l.part.bind(l),id=kind==='circuit'?'bCannonBarrel':'cannon';l.part=(g,key,...args)=>{const x=typeof args[0]==='object'?args[0].x:args[0];if(key!==id||Math.abs(x-pose.x)>30)orig(g,key,...args);};if(kind==='circuit')l.nodes[3].portAt=-l.rules.warn;}
  l.drawAim=()=>{};l.drawBalls=()=>{};l.drawEnemyBolts=()=>{};l.bolts=[];__vfxFrame(now);
  let targetPart,targetPose;
  if(kind==='forge'){const a=l.brickPose({...target,hp:1});targetPart=a.id;targetPose=a.pose;}
  else{targetPart=target.part;targetPose={x:target.art.x,y:target.art.y,w:target.art.w,h:target.art.h,px:kind==='carrier'?null:l.parts[targetPart].pivot[0],py:kind==='carrier'?null:l.parts[targetPart].pivot[1],angle:0};}
  return{kind,device:D,scale:l.kitUIScale,offsetX:(innerWidth-l.W*l.kitUIScale)/2,offsetY:D.top-34*l.kitUIScale,pose:{x:pose.x,y:pose.y,w,h,px:pivot[0],py:pivot[1],angle},muzzle,localMuzzle:local,hit,target:{id:targetPart,pose:targetPose,rect:r},clip:kind==='carrier'?{rx:part.display[0]*.7,ry:part.display[1]*.5}:null};
 },{kind,part:c.part,D});
 const name=kind+'-'+device;await p.screenshot({path:`${out}/scenes/${name}.png`});assert.deepEqual(errors,[]);
 let targetPart=kind==='carrier'?ab.parts[info.target.id]:kind==='circuit'?ab.parts[info.target.id]:forge.parts[info.target.id];
 if(kind==='carrier'){info.target.pose.px=targetPart.pivot[0];info.target.pose.py=targetPart.pivot[1];}
 info.background=`scenes/${name}.png`;info.cannon={path:c.part.path,size:c.part.size};info.target.path=targetPart.path;info.target.size=targetPart.size;info.errors=errors;info.snapshotSHA256=sha(`${out}/scenes/${name}.png`);report.scenes[name]=info;await p.close();
}for(const[k,c]of Object.entries(configs))assert.equal(sha(c.html),report.frozen[k]);report.completed=true;writeFileSync(out+'/scenes.json',JSON.stringify(report,null,2));}finally{await browser.close();}
