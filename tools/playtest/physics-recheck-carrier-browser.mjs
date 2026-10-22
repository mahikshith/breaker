import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(process.env.PW_MODULE||'playwright');
const [out='out/physics-recheck-other/carrier-final',input='dist/breach.html',url]=process.argv.slice(2),html=resolve(input);
mkdirSync(out,{recursive:true});const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const report={scope:'Actual bundled Main, genuine CDP serve/drag smoke, then explicitly staged LASER positions against the natural first-raid moving fighter. No target/callback substitutions, HP writes or resource grants. Not earned play or human balance.',htmlSHA256:hash(html),cases:[]};
if(url)assert.equal(createHash('sha256').update(Buffer.from(await(await fetch(url)).arrayBuffer())).digest('hex'),report.htmlSHA256);
const browser=await chromium.launch({executablePath:process.env.PW_CHROMIUM,args:['--mute-audio']});
try{for(const[device,D]of Object.entries({ios:{width:393,height:852,top:59,bottom:34},android:{width:412,height:915,top:32,bottom:24}})){
 const page=await browser.newPage({viewport:D,deviceScaleFactor:2,hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.stack||e.message));
 await page.addInitScript(()=>{requestAnimationFrame=f=>{window.__carrierAuditFrame=f;return 1;};const Old=Image;window.__carrierAuditImages=[];window.Image=class extends Old{constructor(){super();__carrierAuditImages.push(this);}};});
 await page.goto((url||pathToFileURL(html).href)+`?level=1&difficulty=easy&safe=${D.top},${D.bottom}`);
 await page.waitForFunction(()=>window.__breach&&window.__carrierAuditFrame,null,{polling:50});
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all(__carrierAuditImages.map(i=>i.decode()));let now=performance.now();window.PC={reset(){now=performance.now();},frame(n=1){for(let i=0;i<n;i++)__carrierAuditFrame(now+=1000/60);},draw(){__carrierAuditFrame(now);}};PC.frame(2);});
 const cdp=await page.context().newCDPSession(page),touch=(type,x=0,y=0)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{id:4,x,y,radiusX:3,radiusY:3,force:1}]});
 const y=D.height-D.bottom-26;
 await touch('touchStart',D.width/2,y);await touch('touchMove',D.width/2+30,y);await page.evaluate(()=>PC.frame(4));assert(await page.evaluate(()=>__breach.level.aim.angle>.1));await touch('touchEnd');await page.evaluate(()=>PC.frame(1));assert(await page.evaluate(()=>!__breach.level.aim));
 await touch('touchStart',D.width/2,y);await touch('touchMove',D.width/2-45,y);await page.evaluate(()=>PC.frame(8));assert(await page.evaluate(()=>__breach.level.paddle.x<160));await touch('touchEnd');
 for(const slow of[0,2]){
  const setup=await page.evaluate(slow=>{
   const old=Math.random;let seed=1987;Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
   try{
    __breach.start(0);PC.reset();const l=__breach.level;l.release();l.aim=null;l.balls[0].caught=true;let f;
    for(let i=0;i<5000;i++){l.updateLevel(1/120,1/120);f=l.fighters.find(v=>v.stage==='approach'&&l.clock-v.stageAt>=.7);if(f)break;}
    if(!f)throw Error('No natural first-raid approach');l.timeScale=.25;l.slowT=slow;l.hitStop=0;
    const p=l.fighterPose(f),from={x:p.x+12.1,y:p.y-22.29},dtReal=1/120,dt=dtReal*l.timeScale;
    l.shots=[{...from,vy:-560,r:6.8,kind:'laser',bornAt:l.t,from:{...from}}];window.__carrierAuditFighter=f;
    const note=document.getElementById('audit-note')||document.body.appendChild(Object.assign(document.createElement('div'),{id:'audit-note'}));note.textContent='STAGED FOCUS / ACTUAL MOVING FIGHTER';note.style='position:fixed;top:3px;left:0;width:100%;pointer-events:none;color:white;background:#10202ccc;text-align:center;font:10px sans-serif';
    PC.draw();return{clock:l.clock,pose:p,from,dtReal,dt,slow,hp:f.hp,charge:l.paddle.charge,bank:l.coreChargeBank};
   }finally{Math.random=old;}
  },slow);
  if(!slow)await page.screenshot({path:`${out}/${device}-focus-before-staged.png`});
  const after=await page.evaluate(dt=>{const l=__breach.level;l.updateShots(dt);PC.draw();return{hp:__carrierAuditFighter.hp,shots:l.shots.length,charge:l.paddle.charge,bank:l.coreChargeBank};},setup.dt);
  assert.equal(after.hp,setup.hp-1);assert.equal(after.shots,0);assert.equal(after.charge,setup.charge);assert.equal(after.bank,setup.bank);
  if(!slow)await page.screenshot({path:`${out}/${device}-focus-after-staged.png`});
  report.cases.push({device,viewport:D,actualTouchSmoke:true,setup,after,errors:[...errors]});
 }
 assert.deepEqual(errors,[]);await page.close();writeFileSync(out+'/report.json',JSON.stringify(report,null,2));
}assert.equal(hash(html),report.htmlSHA256);report.complete=true;writeFileSync(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify({htmlSHA256:report.htmlSHA256,cases:report.cases.length,complete:true}));}finally{await browser.close();}
