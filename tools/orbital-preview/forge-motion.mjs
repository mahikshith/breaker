import assert from 'node:assert/strict';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const{chromium}=await import(process.env.PW_MODULE||'playwright');
const out='out/orbital-forge/motion',hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex'),html='out/orbital-forge/forge.html';
assert.equal(hash(html),'e8f06046e4b224c1ef790f59f4124661583abc1f5d141583ed0b44a46118f97f');
mkdirSync(out,{recursive:true});const browser=await chromium.launch({executablePath:process.env.PW_CHROMIUM,args:['--mute-audio']});
const report={scope:'Explicit staged composition fixtures, actual final renderer/timing. No interpolated frames, direct art transforms or earned-play claim. Captured10fps at393x852; simulation remains120Hz.',html:hash(html),source:hash('src/orbital.js'),clips:{}};
try{
 const page=await browser.newPage({viewport:{width:393,height:852},deviceScaleFactor:1}),errors=[];page.on('pageerror',e=>errors.push(e.stack||e.message));
 await page.addInitScript(()=>{window.requestAnimationFrame=fn=>{window.__nextFrame=fn;return 1;};});
 await page.goto(`${pathToFileURL(resolve(html)).href}?level=1&safe=59,34&difficulty=medium`);await page.waitForFunction(()=>window.__breach&&window.__nextFrame);await page.evaluate(async()=>{await document.fonts.load('18px "Lilita One"');await document.fonts.load('600 16px Rubik');await document.fonts.ready;});
 await page.evaluate(()=>{let now=performance.now();window.MQ={frames(n=1){for(let i=0;i<n;i++)__nextFrame(now+=1000/60);},fresh(){now=performance.now();__breach.start(0);this.frames(1);return __breach.level;}};MQ.frames(2);});
 const snap=async(id,index)=>{const path=`${out}/${id}-${String(index).padStart(3,'0')}.png`;await page.screenshot({path});return page.evaluate(path=>{const l=__breach.level;return{path,clock:l.clock,phase:l.phase,stage:l.stage,active:l.activeIndex,transitionAt:l.transitionAt,reward:l.rewardGranted,balls:l.balls.map(b=>({x:b.x,y:b.y,caught:b.caught,r:b.r})),cover:l.coverPose(l.stations[0]),projector:l.projectorPose(),state:l.state};},path);};
 // Staging parks the ordinary ball, enables the post-teaching cycle and preserves all authored mode durations.
 await page.evaluate(()=>{const l=MQ.fresh();l.started=true;l.teachDone=true;l.aim=null;l.balls[0].caught=true;l.stage='anticipate';l.stageAt=l.clock;MQ.frames(1);});
 const cover=[];for(let i=0;i<151;i++){if(i)await page.evaluate(()=>MQ.frames(6));cover.push(await snap('cover',i));}
 report.clips.cover={setup:'STAGED: parked ball + teaching completed; native medium window9s/warning1.35s unchanged',frames:cover};
 // Legal damage callbacks are deliberate composition setup, not earned contacts.
 await page.evaluate(()=>{const l=MQ.fresh();l.started=true;for(let i=0;i<3;i++){l.activeIndex=i;l.stage='open';l.hitTarget(l.stations[i].id,{titan:7});}MQ.frames(1);});
 const reward=[];let shutdown=false;for(let i=0;i<101;i++){if(i)await page.evaluate(()=>MQ.frames(6));if(i===67){await page.evaluate(()=>{const l=__breach.level;for(let n=0;n<l.rules.core;n++)l.hitTarget('core',{});MQ.frames(1);});shutdown=true;}reward.push(await snap('reward',i));}
 report.clips.reward={setup:'STAGED: three coil completion callbacks start safe collapse; atframe67 core damage callbacks start shutdown. Automatic reward, arm, fan serve and rendering use real authored timing. Not earned play.',shutdown,frames:reward};
 assert(cover.some(f=>f.stage==='opening')&&cover.some(f=>f.stage==='open')&&cover.some(f=>f.stage==='closing')&&cover.some(f=>f.stage==='warning'));
 assert(reward.some(f=>f.phase==='collapse')&&reward.some(f=>f.phase==='projection')&&reward.some(f=>f.phase==='core'&&f.balls.length===3)&&reward.some(f=>f.phase==='core'&&f.balls.some(b=>!b.caught))&&reward.some(f=>f.phase==='ending')&&reward.some(f=>f.state==='won'));
 assert.deepEqual(errors,[]);report.errors=errors;writeFileSync(`${out}/report.json`,JSON.stringify(report,null,2));await page.close();
}finally{await browser.close();}
console.log('Captured actual Forge motion frames');
