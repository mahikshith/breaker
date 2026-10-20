// Staged successful rescue corridor; actual checkBreach/update/Main rendering, not an earned win.
// Usage: node tools/playtest/snake-retreat.mjs [out] [html] [--video]
// PW_MODULE, PLAYTEST_URL, BROWSER_EXECUTABLE/PW_CHROMIUM select existing local tools.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(process.env.PW_MODULE||'playwright');
const [out='out/snake-retreat',html='dist/breach.html']=process.argv.slice(2).filter(a=>!a.startsWith('--'));
fs.mkdirSync(out,{recursive:true});
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const files=[html,'src/vault.js','src/serpent-retreat.js','src/serpent-capture.js','assets/snake-emerald/meta.json'];
const seal=()=>Object.fromEntries(files.filter(p=>fs.existsSync(p)).map(p=>[p,sha(p)]));
const report={scope:'Staged successful rescue at three approach times, by clearing a corridor fixture and calling actual checkBreach. Natural pre-rescue snake updates and actual retreat/ending logic; no earned-win, changed-difficulty, physical-device or performance claim.',before:seal(),devices:[],complete:false};
const save=()=>fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2)+'\n');
const browser=await chromium.launch({args:['--mute-audio'],...(process.env.BROWSER_EXECUTABLE||process.env.PW_CHROMIUM?{executablePath:process.env.BROWSER_EXECUTABLE||process.env.PW_CHROMIUM}:{})});
async function install(page,safe){
 await page.addInitScript(()=>requestAnimationFrame=f=>{window.__retreatFrame=f;return 1;});
 const url=process.env.PLAYTEST_URL||pathToFileURL(resolve(html)).href;
 await page.goto(url+(url.includes('?')?'&':'?')+'safe='+safe);
 await page.waitForFunction(()=>window.__breach?.ready&&window.__retreatFrame,null,{polling:50,timeout:30000});await page.evaluate(()=>document.fonts.ready);
 await page.evaluate(()=>{
  let now=performance.now(),previous=null,baselineLength=0;
  const draw=()=>{const l=__breach.level,u=l.update;l.update=()=>{};try{__retreatFrame(now+=1000/60);}finally{l.update=u;}};
  const snapshot=()=>{const l=__breach.level,p=l.retreatPose(),points=l.snakePoints(),h=points[0],tail=points.at(-1),headPose=l.drawSnakeHeadPose();
   const length=points.slice(1).reduce((sum,q,i)=>sum+Math.hypot(q.x-points[i].x,q.y-points[i].y),0);
   const result={time:l.t,retreatTime:l.snake.retreat?.t,state:l.state,phase:l.phase,alpha:l.snake.alpha,done:!!p?.done,faceBlend:p?.faceBlend,insideTunnel:p?.insideTunnel,head:{...h},tail:{...tail},maxY:Math.max(...points.map(q=>q.y)),pointCount:points.length,length,lengthError:baselineLength?Math.abs(length-baselineLength):0,heading:p?.heading,headPose,granite:[...l.grid.cells].filter(v=>v===9).length,finite:points.every(q=>Number.isFinite(q.x)&&Number.isFinite(q.y))};
   if(previous){result.headStep=Math.hypot(h.x-previous.head.x,h.y-previous.head.y);result.tailStep=Math.hypot(tail.x-previous.tail.x,tail.y-previous.tail.y);
    if(result.headStep>.002){const a=Math.atan2(h.y-previous.head.y,h.x-previous.head.x);result.motionHeadingError=Math.abs(Math.atan2(Math.sin(a-p.heading),Math.cos(a-p.heading)));}
   }
   if(p&&!p.done){const a=headPose.rotation+(headPose.facing==='l'?Math.PI:0);result.dominantHeadingError=Math.abs(Math.atan2(Math.sin(a-p.heading),Math.cos(a-p.heading)));
    const base=headPose.facing==='l'?p.leftRotation:p.rightRotation,delta=headPose.rotation-base;
    const right=p.rightRotation+delta,left=Math.PI+p.leftRotation+delta,blend=p.faceBlend;
    const weighted=Math.atan2(Math.sin(right)*(1-blend)+Math.sin(left)*blend,Math.cos(right)*(1-blend)+Math.cos(left)*blend);
    result.spriteHeadingError=Math.abs(Math.atan2(Math.sin(weighted-p.heading),Math.cos(weighted-p.heading)));
   }
   previous=result;return result;
  };
  const prepare=kind=>{__breach.start(1);const l=__breach.level;l.wardCoachSeen=true;l.skipIntro();let steps=0;
   while(l.phase==='intro'&&steps++<600)l.update(1/120);
   if(kind==='halfway')while(l.t<34&&l.state==='play'&&!l.snake.attack&&steps++<16000)l.update(1/120);
   if(kind==='late'){while(!l.snake.attack&&l.state==='play'&&steps++<18000)l.update(1/120);while(l.snake.attack?.t<1.05&&steps++<20000)l.update(1/120);if(!l.snake.attack||l.snake.attack.struck>=2)throw Error('Late fixture missed save window');}
   let savedHead;
   if(kind==='late'){savedHead={attack:l.snake.attack.t,head:{...l.snakePoints()[0]},scope:'Staged presecondstrike head save using actual cancelAttack+knockBack(3), then rescue corridor; not an earned hit.'};if(!l.cancelAttack())throw Error('Presecondstrike head save rejected');l.knockBack(3);}
   const corridor=()=>{const blocked=new Set(l.snake.cells.map(([c,r])=>r*20+c)),start=5*20+9,queue=[start],parent=new Map([[start,-1]]);let exit;
    for(let i=0;i<queue.length;i++){const k=queue[i],c=k%20,r=Math.floor(k/20);if(r===19){exit=k;break;}
     for(const[dc,dr]of[[0,1],[-1,0],[1,0],[0,-1]]){const x=c+dc,y=r+dr,n=y*20+x;if(x<0||x>=20||y<0||y>=20||parent.has(n)||blocked.has(n)||l.grid.cells[n]===9)continue;parent.set(n,k);queue.push(n);}}
    if(exit===undefined)return null;const cells=[];for(let k=exit;k!==-1;k=parent.get(k))cells.push(k);return cells;
   };
   let cells=corridor();
   if(kind==='late'){savedHead.additionalOneCellRecoils=0;while(!cells&&savedHead.additionalOneCellRecoils<20&&l.snake.hist.length){l.knockBack(1);savedHead.additionalOneCellRecoils++;cells=corridor();}}
   if(!cells)throw Error('No staged rescue corridor avoiding granite/body after bounded recoils');
   const before={phase:l.phase,time:l.t,head:{...l.snakePoints()[0]},attack:l.snake.attack?.t,granite:[...l.grid.cells].filter(v=>v===9).length};
   const ids=new Set(cells.map(k=>l.grid.bid[k]).filter(id=>id>=0)),removed=[];
   for(const id of ids){const b=l.bricks[id];if(b.kind===9)throw Error('Corridor crossed granite');if(b.gone)continue;b.gone=true;removed.push(id);l.debris.removeStatic(id);for(let c=0;c<b.n;c++){const k=b.r*20+b.c+c;l.grid.cells[k]=0;l.grid.bid[k]=-1;}}
   for(const k of cells)if(l.grid.cells[k]===8)l.grid.cells[k]=0;
   l.checkBreach();if(!l.snake.retreat||!l.retreatPose())throw Error('No integrated retreat after public checkBreach');
   previous=null;baselineLength=0;const first=snapshot();baselineLength=first.length;
   if(Math.hypot(before.head.x-first.head.x,before.head.y-first.head.y)>.01)throw Error('Head jumped at successful-rescue handover');
   draw();return{kind,steps,before,savedHead,removedBrickIDs:removed,corridor:cells,first};
  };
  const advance=(target,event)=>{const l=__breach.level,samples=[];let s=snapshot();
   for(let i=0;i<5000&&l.state==='play';i++){
    if(event==='tunnel'&&s.head.y<=88||event==='clear'&&s.done||event==='won'&&s.state==='won'||!event&&s.retreatTime>=target)break;
    l.update(1/120);s=snapshot();samples.push(s);
   }
   draw();return{sample:s,steps:samples.length,maxHeadStep:Math.max(0,...samples.map(p=>p.headStep||0)),maxTailStep:Math.max(0,...samples.map(p=>p.tailStep||0)),maxLengthError:Math.max(0,...samples.filter(p=>!p.done).map(p=>p.lengthError)),maxMotionHeadingError:Math.max(0,...samples.filter(p=>!p.done).map(p=>p.motionHeadingError||0)),maxDominantHeadingError:Math.max(0,...samples.filter(p=>!p.done).map(p=>p.dominantHeadingError||0)),maxSpriteHeadingError:Math.max(0,...samples.filter(p=>!p.done).map(p=>p.spriteHeadingError||0)),allFinite:samples.every(p=>p.finite),exposedFade:samples.some(p=>!p.done&&p.maxY>88&&p.alpha<.999),wonBeforeClear:samples.some(p=>p.state==='won'&&!p.done),graniteUnchanged:samples.every(p=>p.granite===45)};
  };
  window.RetreatReview={prepare,advance,draw,snapshot};
 });
}
try{
 for(const[device,width,height,safe]of[['ios',393,852,'59,34'],['android',412,915,'32,24']]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:2,hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.stack||e.message));await install(page,safe);
  const d={device,width,height,errors,scenarios:[]};report.devices.push(d);save();
  for(const kind of['early','halfway','late']){
   const scenario={fixture:await page.evaluate(k=>RetreatReview.prepare(k),kind),frames:[]};d.scenarios.push(scenario);
   await page.screenshot({path:`${out}/${device}-${kind}-handover-staged.png`});
   for(const[label,target,event]of[['turn',.45],['mid',1.5],['tunnel',0,'tunnel'],['tail-clear',0,'clear'],['won',0,'won']]){
    const r=await page.evaluate(([t,e])=>RetreatReview.advance(t,e),[target,event]);scenario.frames.push({label,...r});save();
    await page.screenshot({path:`${out}/${device}-${kind}-${label}-staged.png`});
    assert.ok(r.allFinite&&r.graniteUnchanged);assert.ok(!r.exposedFade&&!r.wonBeforeClear);assert.ok(r.maxHeadStep<6&&r.maxTailStep<6,'continuous retreat');assert.ok(r.maxLengthError<.03,'body length retained');assert.ok(r.maxSpriteHeadingError<.15,'head sprite faces actual travel');assert.ok(r.maxMotionHeadingError<.35,'head leads along actual movement');
    if(label==='tail-clear')assert.ok(r.sample.done&&r.sample.maxY<=88,'tail inside tunnel before disappearing');if(label==='won')assert.equal(r.sample.state,'won');
   }
   save();
  }
  assert.deepEqual(errors,[]);d.pass=true;save();await page.close();console.log('PASS',device);
 }
 if(process.argv.includes('--video')){
  const context=await browser.newContext({viewport:{width:393,height:852},deviceScaleFactor:1,hasTouch:true,recordVideo:{dir:out+'/video/raw',size:{width:393,height:852}}});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.stack||e.message));await install(page,'59,34');
  const fixture=await page.evaluate(()=>RetreatReview.prepare('halfway'));
  const motion=await page.evaluate(()=>new Promise((resolve,reject)=>{const started=performance.now(),frames=[];let n=0;const timer=setInterval(()=>{__retreatFrame(performance.now());const l=__breach.level,p=l.retreatPose();if(n++%5===0||p?.done)frames.push({wallSeconds:(performance.now()-started)/1000,retreatTime:l.snake.retreat?.t,head:p?.head,heading:p?.heading,alpha:l.snake.alpha,done:p?.done,state:l.state});if(p?.done){clearInterval(timer);resolve({frames,wallSeconds:(performance.now()-started)/1000});}else if(performance.now()-started>25000){clearInterval(timer);reject(Error('Retreat video exceeded bounded duration'));}},1000/30);}));
  assert.deepEqual(errors,[]);const video=page.video();await context.close();const path=out+'/video/snake-head-first-retreat-ios.webm';await video.saveAs(path);report.video={scope:'Actual Main RAF at wall time after staged rescue and accelerated natural approach; not earned progression.',fixture,errors,...motion,path,SHA256:sha(path)};
 }
}finally{await browser.close();}
report.after=seal();assert.deepEqual(report.after,report.before,'sources/build frozen through review');report.complete=true;save();console.log(JSON.stringify({complete:true,out,html:report.before[html]}));
