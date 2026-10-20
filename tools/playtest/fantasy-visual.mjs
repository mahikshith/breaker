import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const {chromium}=await import(process.env.PW_MODULE||'playwright');
const out=process.env.OUT_DIR||'out/fantasy-visual',base=process.env.BASE_URL||'http://127.0.0.1:4194';
fs.mkdirSync(out,{recursive:true});
const files=['src/fantasy/bellforge.js','src/fantasy/tidewheel.js','src/fantasy/tidewheel-v2-geometry.js','prototypes/fantasy/main.js','prototypes/fantasy/render.js','prototypes/fantasy/style.css','assets/fantasy-machinery/manifest.json','assets/fantasy-machinery/nerra-v2-manifest.json'];
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const seal=()=>Object.fromEntries(files.map(p=>[p,sha(p)]));
const report={scope:'Renderer-only source refresh after Bellforge paddle centre and Tidewheel raft front depth alignment. Fresh browser, real source art, two phone sizes. No repeated earned-completion or balance claim. Tidewheel pose captures are explicitly staged visual fixtures.',before:seal(),cases:[],complete:false};
for(const[device,width,height]of[['ios',393,852],['android',412,915]]){
 const browser=await chromium.launch({args:['--mute-audio'],...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:2,hasTouch:true}),errors=[],http=[];
 page.on('pageerror',e=>errors.push(e.stack||e.message));page.on('response',r=>{if(r.status()>=400&&!r.url().includes('favicon'))http.push([r.status(),r.url()]);});
 await page.addInitScript(()=>requestAnimationFrame=f=>{window.VF=f;return 1;});
 for(const level of ['bellforge','tidewheel']){
  await page.goto(base+'/prototypes/fantasy/?level='+level);
  await page.waitForFunction(()=>!document.getElementById('start').disabled&&window.VF,null,{polling:50,timeout:30000});
  await page.evaluate(()=>document.fonts.ready);await page.locator('#start').tap();await page.evaluate(()=>VF(performance.now()));
  await page.screenshot({path:out+'/'+device+'-'+level+'-opening.png'});
  const native=await page.evaluate(()=>({paddle:{...fantasyGame.paddle},ball:{x:fantasyGame.balls[0].x,y:fantasyGame.balls[0].y,r:fantasyGame.balls[0].r},height:fantasyGame.height,bricks:fantasyGame.bricks.length}));
  if(level==='tidewheel'){
   await page.evaluate(()=>{const g=fantasyGame;g.launch();g.beginPull();g.villain.stageTime=g.rules.warning;g.update(1/240);g.villain.stageTime=.55;g.syncAnatomy();VF(performance.now());});
   await page.screenshot({path:out+'/'+device+'-tidewheel-pull-staged.png'});
  }
  report.cases.push({device,level,native,errors:[...errors],http:[...http]});
  assert.deepEqual(errors,[]);assert.deepEqual(http,[]);
 }
 await browser.close();
}
report.after=seal();assert.deepEqual(report.before,report.after,'visual capture source seal');report.complete=true;
fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({complete:true,cases:report.cases.length,render:report.after['prototypes/fantasy/render.js']}));
