import assert from 'node:assert/strict';
import {writeFileSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const{chromium}=await import(process.env.PW_MODULE||'playwright');
const hash=()=>createHash('sha256').update(readFileSync('out/relay-circuit/circuit.html')).digest('hex'),report={htmlSHA256:hash(),devices:{}};
const browser=await chromium.launch({executablePath:process.env.PW_CHROMIUM,args:['--mute-audio']});
try{for(const[name,d]of Object.entries({ios:{width:393,height:852,top:59,bottom:34},android:{width:412,height:915,top:32,bottom:24}})){
 const page=await browser.newPage({viewport:d}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{requestAnimationFrame=f=>{window.__nextFrame=f;return 1;};const Old=Image;window.__imgs=[];window.Image=class extends Old{constructor(){super();__imgs.push(this);}};});
 await page.goto(`http://127.0.0.1:4184/?safe=${d.top},${d.bottom}&difficulty=medium`);await page.waitForFunction(()=>window.__breach&&window.__nextFrame,null,{polling:50});
 await page.evaluate(async()=>{await document.fonts.load('18px "Lilita One"');await document.fonts.load('600 16px Rubik');await Promise.all(__imgs.map(i=>i.decode()));__nextFrame(performance.now()+17);__circuitDraw();});
 assert.equal(await page.evaluate(()=>__breach.scene),'menu');await page.keyboard.press('2');assert.equal(await page.evaluate(()=>__breach.scene),'menu');
 await page.screenshot({path:`out/relay-circuit/coil-proof/${name}-single-card-menu.png`});await page.keyboard.press('1');assert.equal(await page.evaluate(()=>__breach.scene),'level');assert.equal(await page.evaluate(()=>__breach.level.name),'Circuit Breakout');assert.deepEqual(errors,[]);
 await page.evaluate(async()=>{
  await Promise.all(__imgs.map(i=>i.decode()));const old=CanvasRenderingContext2D.prototype.fillText;window.__texts=[];CanvasRenderingContext2D.prototype.fillText=function(s,...rest){__texts.push(s);return old.call(this,s,...rest);};
  const l=__breach.level;for(let j=0;j<4;j++){while(!['relay','flight'].includes(l.phase))l.update(1/120);const n=l.currentNode();while(!n.latched){const p=l.platePose(n);l.hitTarget(n.id,{x:p.x,y:p.y,r:8});}}
  let now=performance.now();for(let i=0;i<310;i++)__nextFrame(now+=1000/60);
 });
 assert.equal(await page.evaluate(()=>__breach.level.state),'won');assert(await page.evaluate(()=>__texts.includes('CIRCUIT LINKED!')));
 await page.screenshot({path:`out/relay-circuit/coil-proof/${name}-staged-settled-result.png`});
 const retry=await page.evaluate(top=>({x:103*__breach.level.kitUIScale,y:top+((__breach.level.H-34)/2+112)*__breach.level.kitUIScale}),d.top);
 await page.mouse.click(retry.x,retry.y);assert(await page.evaluate(()=>__breach.level.linked===0&&!__breach.level.burstSpent&&__breach.level.state==='play'));
 report.devices[name]={ignoredUnsupported2:true,key1StartsCircuit:true,stagedResultTitle:true,realResultRetry:true,errors};assert.deepEqual(errors,[]);await page.close();
}assert.equal(hash(),report.htmlSHA256);report.hashAfter=hash();report.completed=true;writeFileSync('out/relay-circuit/coil-proof/menu-keyboard.json',JSON.stringify(report,null,2));}finally{await browser.close();}
