// Natural no-input approach accelerated via update; ending uses actual Main RAF in wall time.
// Usage: node tools/playtest/snake-capture-video.mjs [out] [html]; PW_MODULE and browser overrides supported.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(process.env.PW_MODULE||'playwright');
const [out='out/snake-capture-video',html='dist/breach.html']=process.argv.slice(2);
fs.mkdirSync(out,{recursive:true});
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const files=[html,'src/vault.js','src/serpent-capture.js','assets/snake-emerald/meta.json'];
const seal=()=>Object.fromEntries(files.map(p=>[p,sha(p)]));
const report={scope:'Browser video of natural no-input ending after accelerated approach. Actual Main RAF and simulation at wall time during recording; desktop emulated iPhone, not earned play or physical-device performance.',before:seal(),errors:[],frames:[]};
const browser=await chromium.launch({args:['--mute-audio'],...(process.env.BROWSER_EXECUTABLE||process.env.PW_CHROMIUM?{executablePath:process.env.BROWSER_EXECUTABLE||process.env.PW_CHROMIUM}:{})});
try{
 const context=await browser.newContext({viewport:{width:393,height:852},deviceScaleFactor:1,hasTouch:true,recordVideo:{dir:out+'/raw',size:{width:393,height:852}}});
 const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.stack||e.message));
 await page.addInitScript(()=>requestAnimationFrame=f=>{window.__snakeFrame=f;return 1;});
 const url=process.env.PLAYTEST_URL||pathToFileURL(resolve(html)).href;
 await page.goto(url+(url.includes('?')?'&':'?')+'safe=59,34');
 await page.waitForFunction(()=>window.__breach?.ready&&window.__snakeFrame,null,{polling:50,timeout:30000});await page.evaluate(()=>document.fonts.ready);
 report.approach=await page.evaluate(()=>{__breach.start(1);const l=__breach.level;l.wardCoachSeen=true;l.skipIntro();let steps=0;
  while(steps++<16000&&!l.snake.attack&&l.state==='play')l.update(1/120);
  if(!l.snake.attack)throw Error('Natural approach did not reach attack');
  __snakeFrame(performance.now());return{steps,time:l.t,attack:l.snake.attack.t,state:l.state,side:l.snake.attack.side};});
 const motion=await page.evaluate(()=>new Promise((resolve,reject)=>{const started=performance.now(),frames=[];let n=0;
  const timer=setInterval(()=>{__snakeFrame(performance.now());const l=__breach.level,c=l.capturePose();
   const s={wallSeconds:(performance.now()-started)/1000,time:l.t,attack:l.snake.attack?.t,state:l.state,expression:l.expression(),lift:c?.lift,laugh:c?.laughPulse};
   if(n++%5===0||s.state!=='play')frames.push(s);
   if(s.state!=='play'){clearInterval(timer);resolve({frames,final:s});}
   else if(performance.now()-started>20000){clearInterval(timer);reject(Error('Ending exceeded bounded wall-time recording'));}
  },1000/30);
 }));
 Object.assign(report,motion);await page.waitForTimeout(400);
 assert.equal(report.final?.state,'lost','actual wall-time ending completed');
 assert.ok(report.frames.some(f=>f.expression==='grin')&&report.frames.some(f=>f.expression==='chew0'),'recorded jaw-open/closed laugh');
 assert.deepEqual(report.errors,[]);
 const video=page.video();await context.close();await video.saveAs(out+'/snake-wrap-laugh-ios.webm');report.video=out+'/snake-wrap-laugh-ios.webm';report.videoSHA256=sha(report.video);
}finally{await browser.close();}
report.after=seal();assert.deepEqual(report.after,report.before,'frozen sources/build');report.complete=true;
fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({complete:true,video:report.video,frames:report.frames.length,html:report.before[html]}));
