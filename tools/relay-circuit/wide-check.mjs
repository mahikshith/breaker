// Actual decoded raster draw-call bounds after shared WIDE effects; staged visual fixtures.
import assert from 'node:assert/strict';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const{chromium}=await import(process.env.PW_MODULE||'playwright');
const HTML=process.argv[2]||'out/space-polish-review/circuit/circuit.html',OUT=process.argv[3]||'out/space-polish-review/circuit/wide';mkdirSync(OUT,{recursive:true});
const sha=()=>createHash('sha256').update(readFileSync(HTML)).digest('hex'),report={scope:'Staged real WIDE pickups and morph/return. Rendered source-alpha bounds are measured from the actual game canvas draw commands, not a claimed physical-device pixel audit.',htmlSHA256:sha(),devices:{}};
const browser=await chromium.launch({executablePath:process.env.PW_CHROMIUM,args:['--mute-audio']});
try{for(const[name,D]of Object.entries({ios:{width:393,height:852,top:59,bottom:34},android:{width:412,height:915,top:32,bottom:24}})){
 const p=await browser.newPage({viewport:D,deviceScaleFactor:2}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{requestAnimationFrame=f=>{window.__wideFrame=f;return 1;};const Old=Image;window.__imgs=[];window.Image=class extends Old{constructor(){super();__imgs.push(this);}};window.__paddleDraws=[];
  const draw=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(...a){const result=draw.apply(this,a),l=window.__breach?.level;if(l&&this.canvas.id==='game'&&a[0]===l.parts.paddle.img&&a.length===9){const m=this.getTransform(),r=this.canvas.getBoundingClientRect(),[,sx,sy,sw,sh,dx,dy,dw,dh]=a,[bx,by,bw,bh]=l.parts.paddle.artBounds,im=a[0],ax=bx*im.naturalWidth,ar=(bx+bw)*im.naturalWidth;const lo=Math.max(sx,ax),hi=Math.min(sx+sw,ar);if(hi>lo)__paddleDraws.push({left:(m.a*(dx+(lo-sx)/sw*dw)+m.e)*r.width/this.canvas.width,right:(m.a*(dx+(hi-sx)/sw*dw)+m.e)*r.width/this.canvas.width,capScale:dw/sw});}return result;};
 });
 await p.goto(`${pathToFileURL(resolve(HTML)).href}?safe=${D.top},${D.bottom}&difficulty=easy`);await p.waitForFunction(()=>window.__breach&&window.__wideFrame,null,{polling:50});
 await p.evaluate(async()=>{await document.fonts.load('18px "Lilita One"');await document.fonts.load('600 16px Rubik');await document.fonts.ready;await Promise.all(__imgs.map(i=>i.decode()));__breach.start(0);await Promise.all(__imgs.map(i=>i.decode()));});
 const checks=[];
 for(let tier=0;tier<4;tier++){
  const r=await p.evaluate(tier=>{const l=__breach.level,p=l.paddle;if(tier)l.applyPower('wide');const goal=Math.min(l.right-l.left-16,125*(1+.55*tier));for(let i=0;i<300&&Math.abs(p.w-goal)>.001;i++)l.update(1/120);__paddleDraws=[];__circuitDraw();return{tier,goal,width:p.w,scale:l.kitUIScale,left:(p.x-p.w/2)*l.kitUIScale+(innerWidth-l.W*l.kitUIScale)/2,right:(p.x+p.w/2)*l.kitUIScale+(innerWidth-l.W*l.kitUIScale)/2,draws:__paddleDraws};},tier);
  assert(r.draws.length>=3);assert(Math.abs(Math.min(...r.draws.map(d=>d.left))-r.left)<.02);assert(Math.abs(Math.max(...r.draws.map(d=>d.right))-r.right)<.02);assert(Math.abs(r.width-r.goal)<.002);checks.push(r);await p.screenshot({path:`${OUT}/${name}-wide-${tier}.png`});
 }
 for(const phase of['launch','return']){
  const r=await p.evaluate(phase=>{const l=__breach.level;if(phase==='launch')l.beginBurst();else{l.update(.46);l.startReturn();}l.update(.16);__paddleDraws=[];__circuitDraw();return{phase:l.phase,width:l.paddle.w,scale:l.kitUIScale,draws:__paddleDraws};},phase);
  assert.equal(r.phase,phase);assert(r.draws.length>=3);assert(Math.abs(Math.max(...r.draws.map(d=>d.right))-Math.min(...r.draws.map(d=>d.left))-r.width*r.scale)<.02);checks.push(r);await p.screenshot({path:`${OUT}/${name}-wide-${phase}.png`});
 }
 assert.deepEqual(errors,[]);report.devices[name]={checks,errors};writeFileSync(`${OUT}/report.json`,JSON.stringify(report,null,2));await p.close();
}assert.equal(sha(),report.htmlSHA256);report.hashAfter=sha();report.completed=true;writeFileSync(`${OUT}/report.json`,JSON.stringify(report,null,2));}finally{await browser.close();}
