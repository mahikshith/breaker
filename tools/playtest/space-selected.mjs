// Staged actual-fire visual proof; all cover removal is labelled, never an earned victory.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const {chromium}=await import(process.env.PW_MODULE||'playwright'),base=process.argv[2]||'out/space-selected-review';
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const report={scope:'Staged actual Main/cannon fire, with breakable panels removed only to expose the selected plasma wake. No earned-play or physical-device claim. Collision radius, speed, port leaves and cover sweeps are unchanged.',weapons:sha('src/space-weapons.js'),gfx:sha('src/gfx.js'),levels:{}};
const browser=await chromium.launch({executablePath:process.env.PW_CHROMIUM,args:['--mute-audio']});
try{for(const kind of ['circuit','forge']){
 const html=resolve(`${base}/${kind}/${kind}.html`),out=`${base}/${kind}/selected-proof`;mkdirSync(out,{recursive:true});const record={html:sha(html),devices:{}};
 for(const[name,D]of Object.entries({ios:{width:393,height:852,top:59,bottom:34},android:{width:412,height:915,top:32,bottom:24}})){
  const p=await browser.newPage({viewport:D,deviceScaleFactor:2}),errors=[];p.on('pageerror',e=>errors.push(e.stack||e.message));
  await p.addInitScript(()=>{requestAnimationFrame=f=>{window.__selectedFrame=f;return 1;};const Old=Image;window.__selectedImages=[];window.Image=class extends Old{constructor(){super();__selectedImages.push(this);}};});
  await p.goto(`${pathToFileURL(html).href}?safe=${D.top},${D.bottom}&difficulty=easy`);await p.waitForFunction(()=>window.__breach&&window.__selectedFrame,null,{polling:50});
  await p.evaluate(async()=>{await document.fonts.load('18px "Lilita One"');await document.fonts.load('600 16px Rubik');await document.fonts.ready;__breach.start(0);await Promise.all(__selectedImages.map(i=>i.decode()));let now=performance.now();window.SP={draw(){__selectedFrame(now);},frame(){__selectedFrame(now+=1000/60);}};SP.frame();SP.frame();});
  await p.screenshot({path:`${out}/${name}-opening.png`});
  const launch=await p.evaluate(kind=>{
   const l=__breach.level;l.clock=12;l.started=true;l.paddle.x=73;for(const b of l.bricks)b.hp=0;
   const note=document.createElement('div');note.textContent='STAGED FIRE · PANELS CLEARED FOR EFFECT PROOF';note.style='position:fixed;top:4px;left:0;width:100%;text-align:center;color:white;background:#0c1028dd;font:10px sans-serif;padding:3px;pointer-events:none';document.body.append(note);
   if(kind==='circuit'){l.nextAttack=l.clock;l.updateCircuit(0);}else{l.teachDone=true;l.warn();}SP.draw();return{warningAt:l.clock,reserve:(l.H-l.paddle.y)*l.kitUIScale};
  },kind);
  assert(Math.abs(launch.reserve-126)<.7);await p.screenshot({path:`${out}/${name}-warning.png`});
  const fired=await p.evaluate(kind=>{const l=__breach.level;if(kind==='circuit'){l.clock+=l.rules.warn;l.updateCircuit(0);}else{l.clock+=l.rules.warning;l.fire();}SP.draw();const b=l.bolts[0];if(!b)throw Error('No actual cannon bolt spawned');return{...b};},kind);
  assert.equal(fired.r,3.5);assert.deepEqual(fired.from,{x:fired.x,y:fired.y});assert.equal(Math.round(Math.hypot(fired.vx,fired.vy)),kind==='circuit'?210:300);
  await p.screenshot({path:`${out}/${name}-plasma-00.png`});const samples=[{age:0,bolt:fired}];
  for(const age of [.06,.12,.20,.32,.48]){
   const state=await p.evaluate(age=>{const l=__breach.level,b=l.bolts[0];if(!b)throw Error('Shot was obscured before the wake capture');const dt=age-(l.clock-b.bornAt);l.clock+=dt;l.updateBolts(dt);SP.draw();return{age,bolt:l.bolts[0]&&{...l.bolts[0]}};},age);
   assert(state.bolt,'Actual cleared lane must remain open through the sampled approach');assert.equal(state.bolt.r,3.5);assert(Math.abs(state.bolt.x-fired.x-fired.vx*age)<.01);assert(Math.abs(state.bolt.y-fired.y-fired.vy*age)<.01);samples.push(state);await p.screenshot({path:`${out}/${name}-plasma-${String(Math.round(age*100)).padStart(2,'0')}.png`});
  }
  assert.deepEqual(errors,[]);record.devices[name]={launch,fired,samples,decodedImages:await p.evaluate(()=>__selectedImages.filter(i=>i.complete&&i.naturalWidth>0).length),errors};await p.close();
 }
 assert.equal(sha(html),record.html);record.hashAfter=sha(html);report.levels[kind]=record;writeFileSync(`${out}/report.json`,JSON.stringify(record,null,2));
}writeFileSync(`${base}/selected-proof.json`,JSON.stringify(report,null,2));}finally{await browser.close();}
