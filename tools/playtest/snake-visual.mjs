// Staged Vault art review; this never establishes an earned route or new balance.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(process.env.PW_MODULE||'playwright');
const [out='out/snake-visual',html='dist/breach.html']=process.argv.slice(2).filter(x=>!x.startsWith('--'));
fs.mkdirSync(out,{recursive:true});
const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
const source=fs.readFileSync('src/vault.js','utf8'),baseline=execFileSync('git',['show',(process.env.BASELINE_REF||'HEAD')+':src/vault.js'],{encoding:'utf8'});
const rows=s=>[...s.match(/const LAYOUT = \[([\s\S]*?)\];/)[1].matchAll(/'([^']+)'/g)].map(m=>m[1]);
assert.deepEqual(rows(source),rows(baseline),'art-only pass preserves authored field');
const kinds={'.':0,y:1,c:2,v:3,t:4,g:5,b:6,'=':8,'#':9},expected=rows(baseline).join('').split('').map(c=>kinds[c]);
const {ART}=await import(pathToFileURL(resolve('src/vault-art.js')).href);
assert.ok(ART.snakeEmerald,'new family must be packed before final proof; do not admit fallback as new art');
for(const key of ['idle','hiss','ouch','dizzy','strike','grin'])assert.ok(Object.hasOwn(ART.snakeEmerald.expr,key),'new atlas expression '+key);
const packed=fs.readFileSync(html);assert.ok(packed.includes(Buffer.from(ART.snakeEmerald.url)),'tested HTML contains current source atlas');
const files=['src/vault.js','src/serpent.js','src/serpent-capture.js','src/difficulty.js','tools/pack_art.py','assets/snake-emerald/meta.json','assets/snake-emerald/manifest.json'];
if(fs.existsSync('assets/snake-emerald/meta.json')){
 const meta=JSON.parse(fs.readFileSync('assets/snake-emerald/meta.json','utf8'));
 assert.deepEqual(ART.snakeEmerald.mouths,meta.mouths,'packed mouths match final measured metadata');
 assert.equal(ART.snakeEmerald.cell,meta.cell);assert.equal(ART.snakeEmerald.unit,meta.box);
 for(const ex of meta.expressions)for(const dir of meta.dirs)files.push(`assets/snake-emerald/head_${ex}_${dir}.png`);
}
const seal=()=>Object.fromEntries(files.filter(p=>fs.existsSync(p)).map(p=>[p,sha(fs.readFileSync(p))]));
const encoded=Buffer.from(ART.snakeEmerald.url.split(',')[1],'base64');
const report={scope:'Staged visual/expression/cardinal-direction and natural no-input capture sequence. Source field comparison is exact; pose fixtures change snake presentation/path fields only. No earned-win, human-balance, physical-device or performance claim. Isolated draw timing measures CPU command submission only.',htmlSHA256:sha(packed),baselineRef:process.env.BASELINE_REF||'HEAD',expected:{granite:expected.filter(v=>v===9).length,bars:expected.filter(v=>v===8).length,cells:expected.length},atlas:{dataURLSHA256:sha(ART.snakeEmerald.url),encodedSHA256:sha(encoded),encodedBytes:encoded.length,decodedRGBABytes:ART.snakeEmerald.cell**2*Object.keys(ART.snakeEmerald.expr).length*Object.keys(ART.snakeEmerald.dir).length*4,cell:ART.snakeEmerald.cell,unit:ART.snakeEmerald.unit,expr:ART.snakeEmerald.expr,dir:ART.snakeEmerald.dir},before:seal(),devices:[],complete:false};
const save=()=>fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2)+'\n');
const browser=await chromium.launch({args:['--mute-audio'],...(process.env.BROWSER_EXECUTABLE||process.env.PW_CHROMIUM?{executablePath:process.env.BROWSER_EXECUTABLE||process.env.PW_CHROMIUM}:{})});
try{for(const[device,width,height,safe]of[['ios',393,852,'59,34'],['android',412,915,'32,24']]){
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:2,hasTouch:true}),errors=[];
 page.on('pageerror',e=>errors.push(e.stack||e.message));
 await page.addInitScript(()=>requestAnimationFrame=f=>{window.__snakeFrame=f;return 1;});
 const url=process.env.PLAYTEST_URL||pathToFileURL(resolve(html)).href;
 await page.goto(url+(url.includes('?')?'&':'?')+'safe='+safe);
 await page.waitForFunction(()=>window.__breach?.ready&&window.__snakeFrame,null,{polling:50,timeout:30000});await page.evaluate(()=>document.fonts.ready);
 await page.evaluate(({headURL,expected,mouths})=>{
  let now=performance.now(),headDraws=[],venomTracing=false,venomStarts=[];
  const original=CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.drawImage=function(im,...args){if(im?.src===headURL)headDraws.push({source:args.slice(0,4),destination:args.slice(4),matrix:[this.getTransform().a,this.getTransform().b,this.getTransform().c,this.getTransform().d,this.getTransform().e,this.getTransform().f]});return original.call(this,im,...args);};
  const moveTo=CanvasRenderingContext2D.prototype.moveTo;
  CanvasRenderingContext2D.prototype.moveTo=function(x,y){if(venomTracing){const m=this.getTransform();venomStarts.push({x:m.a*x+m.c*y+m.e,y:m.b*x+m.d*y+m.f});}return moveTo.call(this,x,y);};
  const draw=()=>{const l=__breach.level,u=l.update;l.update=()=>{};headDraws=[];venomStarts=[];try{__snakeFrame(now+=1000/60);}finally{l.update=u;}return headDraws;};
  const fresh=()=>{__breach.start(1);const l=__breach.level;l.wardCoachSeen=true;l.skipIntro();for(let i=0;i<240&&l.phase==='intro';i++)l.update(1/120);if(JSON.stringify([...l.grid.cells])!==JSON.stringify(expected))throw Error('Initial field differs from baseline');
   const v=l.drawVenom;l.drawVenom=function(g,h){venomTracing=true;try{return v.call(this,g,h);}finally{venomTracing=false;}};return l;};
  const pose=(direction,expression)=>{const l=fresh(),s=l.snake,defs={right:{head:[16,12],tail:[-1,0],look:0,left:false},left:{head:[3,12],tail:[1,0],look:Math.PI,left:true},up:{head:[16,5],tail:[0,1],look:-Math.PI/2,left:false},down:{head:[16,17],tail:[0,-1],look:Math.PI/2,left:true}},d=defs[direction];
   Object.assign(s,{cells:Array.from({length:12},(_,i)=>[d.head[0]+d.tail[0]*i,d.head[1]+d.tail[1]*i]),prog:1,look:d.look,dir:d.look,faceLeft:d.left,attack:null,alpha:1,flinch:expression==='ouch'?1:0,stun:expression==='dizzy'?2:0,mood:expression==='dizzy'?null:expression,moodT:2,chewing:null,gulp:0,lunge:0});l.t=1.1;l.entry.fullHeadTurn=true;l.zc.z=1;
   const points=JSON.stringify(l.snakePoints()),grid=JSON.stringify([...l.grid.cells]),heads=draw();if(points!==JSON.stringify(l.snakePoints())||grid!==JSON.stringify([...l.grid.cells]))throw Error('Draw changed target points/grid');if(!heads.length)throw Error('Current emerald atlas was not drawn');
   return{direction,expression:l.expression(),heads,points:l.snakePoints(),granite:[...l.grid.cells].filter(v=>v===9).length};};
  const natural=()=>{const l=fresh();for(let i=0;i<12000&&!l.snake.attack&&l.state==='play';i++)l.update(1/120);if(!l.snake.attack)throw Error('No natural capture attack');return l;};
  const captureTo=t=>{const l=__breach.level;let previous=l.capturePose(),maxPointStep=0,maxLengthError=0;
   for(let i=0;i<2400&&l.snake.attack.t<t&&l.state==='play';i++){
    l.update(1/120);const c=l.capturePose();if(!c)continue;
    const length=c.points.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p.x-c.points[i].x,p.y-c.points[i].y),0);
    maxLengthError=Math.max(maxLengthError,Math.abs(length-c.bodyLength));
    if(previous)maxPointStep=Math.max(maxPointStep,Math.hypot(c.head.x-previous.head.x,c.head.y-previous.head.y),Math.hypot(c.points.at(-1).x-previous.points.at(-1).x,c.points.at(-1).y-previous.points.at(-1).y));previous=c;
   }
   const heads=draw(),p=l.snakePoints(),cap=l.capturePose(),pose=l.drawSnakeHeadPose();
   return{attack:l.snake.attack.t,state:l.state,phase:l.phase,lives:l.lives,cap,headPose:pose,expression:l.expression(),heads,points:p,granite:[...l.grid.cells].filter(v=>v===9).length,finite:p.every(q=>Number.isFinite(q.x)&&Number.isFinite(q.y)),neckSpan:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y),maxPointStep,maxLengthError};};
  const mirror=()=>{const l=natural(),s=l.snake;s.cells=s.cells.map(([c,r])=>[19-c,r]);s.hist=s.hist.map(([c,r])=>[19-c,r]);s.look=Math.PI-s.look;s.dir=Math.PI-s.dir;s.faceLeft=!s.faceLeft;s.attack.side*=-1;return{side:s.attack.side,scope:'Mirrored path/attack fixture after natural approach; not an independently earned approach.'};};
  const lostBallGuard=()=>{const l=__breach.level,before={state:l.state,lives:l.lives,charge:l.paddle.charge,attack:l.snake.attack.t};l.loseBall();const after={state:l.state,lives:l.lives,charge:l.paddle.charge,attack:l.snake.attack.t};if(JSON.stringify(before)!==JSON.stringify(after))throw Error('Lost ball interrupted capture');return{before,after};};
  const venom=(phase,age=phase==='breath'?.28:.55)=>{
   pose('right','idle');const l=__breach.level,s=l.snake,h=l.snakePoints()[0];
   const br=l.bricks.filter(b=>b.kind===9).sort((a,b)=>Math.hypot(a.x-180,a.y-280)-Math.hypot(b.x-180,b.y-280))[0];
   l.t=1.1+age;l.venom.phase=phase;l.venom.t=age;l.venom.target={x:br.x+br.w/2,y:br.y+br.h/2,br};
   s.mood=null;s.moodT=0;s.look=Math.atan2(l.venom.target.y-h.y,l.venom.target.x-h.x);s.faceLeft=Math.cos(s.look)<0;
   const p=l.drawSnakeHeadPose(),offset=mouths?.[p.ex]?.[p.facing];if(!offset)throw Error('No measured mouth for '+p.ex+'/'+p.facing);
   const heads=draw(),m=heads[0].matrix,x=offset[0]*p.k,y=offset[1]*p.k;
   const mouth={x:m[0]*x+m[2]*y+m[4],y:m[1]*x+m[3]*y+m[5]},error=Math.min(...venomStarts.map(q=>Math.hypot(q.x-mouth.x,q.y-mouth.y)));
   if(error>.001)throw Error('Venom detached from drawn mouth by '+error+' canvaspixels');
   return{phase,expression:p.ex,facing:p.facing,drawnMouthCanvas:mouth,nearestStreamStartErrorPixels:error,granite:[...l.grid.cells].filter(v=>v===9).length};
  };
  const bench=()=>{const l=__breach.level,cv=document.createElement('canvas');cv.width=720;cv.height=1600;const g=cv.getContext('2d');g.scale(2,2);const samples=[];for(let i=0;i<40;i++){const t=performance.now();l.drawSnake(g);if(i>=10)samples.push(performance.now()-t);}samples.sort((a,b)=>a-b);return{sampleCount:samples.length,medianMs:samples[Math.floor(samples.length*.5)],p95Ms:samples[Math.floor(samples.length*.95)],scope:'Isolated drawSnake CPU submission, detached2x canvas; excludes full-frame/physical-device GPU completion.'};};
  window.SnakeReview={fresh,pose,natural,captureTo,mirror,lostBallGuard,venom,draw,bench};
 },{headURL:ART.snakeEmerald.url,mouths:ART.snakeEmerald.mouths,expected});
 const result={device,width,height,poses:[],capture:[],errors};report.devices.push(result);save();
 for(const[direction,expression]of[['right','idle'],['left','idle'],['up','idle'],['down','idle'],['right','hiss'],['right','ouch'],['right','dizzy']]){
  const s=await page.evaluate(([d,e])=>SnakeReview.pose(d,e),[direction,expression]);assert.equal(s.granite,report.expected.granite);await page.screenshot({path:`${out}/${device}-${direction}-${expression}-staged.png`});result.poses.push(s);
 }
 result.poseDrawCPU=await page.evaluate(()=>SnakeReview.bench());
 result.venom=[];
 for(const phase of ['warn','breath']){const s=await page.evaluate(p=>SnakeReview.venom(p),phase);assert.equal(s.granite,report.expected.granite);await page.screenshot({path:`${out}/${device}-venom-${phase}-staged.png`});result.venom.push(s);}
 if(process.argv.includes('--motion')){
  result.motion=[];
  for(let n=0;n<12;n++){const s=await page.evaluate(n=>SnakeReview.venom('breath',.04+n*.045),n);assert.equal(s.granite,report.expected.granite);await page.screenshot({path:`${out}/${device}-venom-motion-${String(n).padStart(2,'0')}.png`});result.motion.push(s);}
  result.motionScope='Twelve actual-render venom/head/breath/body frames with measured mouth connection each frame; staged visual time only, no simulation animation claim.';
 }
 if(!process.argv.includes('--no-capture')){
  await page.evaluate(()=>{SnakeReview.natural();});
  for(const t of[1.225,1.5,1.85,2.2,2.55,3,3.17,3.3,4.15,4.3]){
   const s=await page.evaluate(t=>SnakeReview.captureTo(t),t);assert.ok(s.cap&&s.finite);assert.equal(s.granite,report.expected.granite);assert.ok(s.maxPointStep<4,'continuous head/tail travel');assert.ok(s.maxLengthError<.02,'complete body length retained');assert.equal(s.state,t<4.2?'play':'lost');if(t>=1.5)assert.ok(Math.abs(s.headPose.rotation)<.95,'face remains upright during waist wrap');
   await page.screenshot({path:`${out}/${device}-capture-${t}-natural.png`});result.capture.push(s);
   if(t===1.5)result.lostBallGuard=await page.evaluate(()=>SnakeReview.lostBallGuard());
  }
  assert.equal(result.capture.find(s=>s.attack>=3).expression,'grin');assert.equal(result.capture.find(s=>s.attack>=3.17).expression,'chew0');
  result.mirror=await page.evaluate(()=>SnakeReview.mirror());result.mirroredCapture=[];
  for(const t of[1.5,2.2,2.55,3.17]){const s=await page.evaluate(t=>SnakeReview.captureTo(t),t);assert.ok(s.cap&&s.finite);assert.equal(s.cap.side,result.mirror.side);assert.equal(s.granite,report.expected.granite);assert.ok(s.maxPointStep<4);assert.ok(s.maxLengthError<.02);assert.ok(Math.abs(s.headPose.rotation)<.95,'mirrored face remains upright');await page.screenshot({path:`${out}/${device}-capture-${t}-mirrored-staged.png`});result.mirroredCapture.push(s);}
  result.captureScope='Natural no-input approach accelerated through actual update, then sequential actual120Hz updates; full original ribbon retained; lost-ball guard and4.2s terminal timing checked. Alternate side is explicitly a mirrored path/attack fixture.';
 }else result.captureScope='Deferred; this run admits no new wrap/laugh/captive-motion result.';
 assert.deepEqual(errors,[]);result.pass=true;save();console.log('PASS',device);await page.close();
 }}finally{await browser.close();}
report.after=seal();report.testedHtmlUnchanged=sha(fs.readFileSync(html))===report.htmlSHA256;report.sourcesUnchanged=JSON.stringify(report.before)===JSON.stringify(report.after);assert.ok(report.testedHtmlUnchanged&&report.sourcesUnchanged,'source/build frozen through proof');report.complete=true;save();
const compactCapture=s=>({attack:s.attack,state:s.state,phase:s.phase,lives:s.lives,expression:s.expression,side:s.cap.side,faceBlend:s.cap.faceBlend,headRotation:s.headPose.rotation,lift:s.cap.lift,bodyTilt:s.cap.bodyTilt,laughPulse:s.cap.laughPulse,frontPathCount:s.cap.frontPaths.length,bodyLength:s.cap.bodyLength,maxPointStep:s.maxPointStep,maxLengthError:s.maxLengthError,granite:s.granite,finite:s.finite});
fs.writeFileSync(out+'/summary.json',JSON.stringify({scope:report.scope,htmlSHA256:report.htmlSHA256,before:report.before,after:report.after,expected:report.expected,atlas:report.atlas,testedHtmlUnchanged:report.testedHtmlUnchanged,sourcesUnchanged:report.sourcesUnchanged,complete:report.complete,devices:report.devices.map(d=>({device:d.device,width:d.width,height:d.height,pass:d.pass,errors:d.errors,poses:d.poses.map(p=>({direction:p.direction,expression:p.expression,granite:p.granite})),venom:d.venom,motion:d.motion,captureScope:d.captureScope,capture:d.capture.map(compactCapture),mirroredCapture:d.mirroredCapture?.map(compactCapture),mirror:d.mirror,lostBallGuard:d.lostBallGuard}))},null,2)+'\n');
console.log(JSON.stringify({complete:true,devices:report.devices.length,html:report.htmlSHA256,out}));
