// Actual isolated Main, browser gestures and separately earned input-assisted Circuit runs.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {playCircuit} from './controller.mjs';
const {chromium}=await import(process.env.PW_MODULE||'playwright');
const OUT=process.argv[2]||'out/relay-circuit/phone-proof',URL=process.argv[3]||'http://127.0.0.1:4184/';
mkdirSync(OUT,{recursive:true});
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const report={scope:'Isolated actual Main. Staged visual/resource fixtures are separate from earned public-input-assisted play. Phone browser emulation, not physical device execution.',htmlSHA256:sha('out/relay-circuit/circuit.html'),sourceSHA256:sha('src/relay.js'),manifestSHA256:sha('assets/relay-circuit/manifest.json'),devices:{}};
const browser=await chromium.launch({...(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{}),args:['--mute-audio']});
try{for(const[name,D]of Object.entries({ios:{width:393,height:852,top:59,bottom:34},android:{width:412,height:915,top:32,bottom:24}})){
 const page=await browser.newPage({viewport:D,deviceScaleFactor:2,hasTouch:true}),errors=[];
 page.on('pageerror',e=>errors.push(e.stack||e.message));
 await page.addInitScript(()=>{window.requestAnimationFrame=f=>{window.__nextFrame=f;return 1;};const Real=Image;window.__images=[];window.Image=class extends Real{constructor(...a){super(...a);__images.push(this);}};localStorage.setItem('breach.unlocked','true');});
 await page.goto(`${URL}?safe=${D.top},${D.bottom}&difficulty=medium`);
 await page.waitForFunction(()=>window.__breach&&window.__nextFrame,null,{polling:50});
 await page.evaluate(async()=>{await document.fonts.load('18px "Lilita One"');await document.fonts.load('600 16px Rubik');await document.fonts.ready;await Promise.all(__images.map(i=>i.decode()));});
 await page.evaluate(()=>{let now=performance.now();const frames=(n=1)=>{now=Math.max(now,performance.now());for(let i=0;i<n;i++)__nextFrame(now+=1000/60);};
 const fresh=()=>{__breach.start(0);frames(2);return __breach.level;};
 const state=()=>{const l=__breach.level;return{scene:__breach.scene,state:l.state,phase:l.phase,clock:l.clock,linked:l.linked,burst:l.burstRemaining,serve:l.serveAge,balls:l.balls.map(b=>({x:b.x,y:b.y,vx:b.vx,vy:b.vy,caught:b.caught,r:b.r})),ptr:l.ptr.down};};
 const latch=()=>{const l=__breach.level,n=l.currentNode();while(!n.latched){const p=l.platePose(n);l.hitTarget(n.id,{x:p.x,y:p.y,r:8});}};
 window.CQ={frames,fresh,state,latch};fresh();});
 await page.evaluate(async()=>Promise.all(__images.map(i=>i.decode())));
 const ev=(fn,a)=>page.evaluate(fn,a),frames=n=>ev(n=>CQ.frames(n),n),shot=file=>page.screenshot({path:`${OUT}/${name}-${file}.png`});
 const finger=await page.context().newCDPSession(page),touch=(type,x=0,y=0)=>finger.send('Input.dispatchTouchEvent',{type,touchPoints:['touchEnd','touchCancel'].includes(type)?[]:[{id:32,x,y,radiusX:3,radiusY:3,force:1}]});
 const r={checks:[],images:await ev(()=>__images.length)},save=()=>{report.devices[name]={...r,errors};writeFileSync(`${OUT}/report.json`,JSON.stringify(report,null,2));};
 try{
  await frames(1);await shot('00-opening');
  const y=D.height-D.bottom-28;
  await touch('touchStart',D.width/2,y);await touch('touchMove',D.width/2+40,y);await frames(4);assert(await ev(()=>__breach.level.aim.angle>.1));await shot('01-real-touch-aim');
  await touch('touchEnd');await frames(2);assert(await ev(()=>!__breach.level.aim));
  await touch('touchStart',D.width/2,y);await touch('touchMove',D.width/2-50,y);await frames(8);assert(await ev(()=>__breach.level.paddle.x<160));await touch('touchEnd');
  r.checks.push('Actual touch aim/release and relative paddle drag');

  // Explicit contact fixture for composition and transition controls; not the earned run below.
  await ev(()=>{CQ.fresh();CQ.latch();CQ.latch();__circuitDraw();window.__savedBalls=[...__breach.level.balls];});await shot('02-staged-takeoff');
  await frames(28);assert.equal(await ev(()=>__breach.level.phase),'flight');
  await touch('touchStart',D.width/2,y);await touch('touchMove',D.width/2+60,y);await frames(1);await shot('03-staged-flight-bank-right');
  await touch('touchMove',D.width/2-60,y);await frames(1);await shot('04-staged-flight-bank-left');await touch('touchEnd');await frames(10);await shot('05-staged-flight-cradle');
  mkdirSync(`${OUT}/${name}-motion`,{recursive:true});
  for(let i=0;i<18;i++){await frames(3);await page.screenshot({path:`${OUT}/${name}-motion/${String(i).padStart(3,'0')}.png`});}
  await touch('touchStart',D.width/2,y);await page.keyboard.down('Space');await frames(2);
  await touch('touchEnd');await touch('touchStart',22,D.top+22);await touch('touchEnd');await frames(1);assert.equal(await ev(()=>__breach.scene),'pause');
  const paused=await ev(()=>CQ.state());await frames(120);assert.deepEqual(await ev(()=>CQ.state()),paused);await shot('06-paused-flight');
  const resume=await ev(top=>({x:180*__breach.level.kitUIScale,y:top+((__breach.level.H-34)/2-38)*__breach.level.kitUIScale}),D.top);
  await touch('touchStart',resume.x,resume.y);await touch('touchEnd');await frames(1);assert.equal(await ev(()=>__breach.scene),'level');await page.keyboard.up('Space');
  await ev(()=>{for(let i=0;i<1800&&__breach.level.phase!=='relay';i++)__breach.level.update(1/120);__circuitDraw();});
  assert(await ev(()=>__breach.level.returnServe&&__breach.level.balls.every((b,i)=>b===__savedBalls[i]&&b.caught)));await shot('07-safe-return');
  await touch('touchStart',D.width/2,y);await touch('touchEnd');await frames(1);assert(await ev(()=>!__breach.level.returnServe));
  r.checks.push('Staged second-link takeoff, actual craft drag/bank, pause freeze, exact live ball identity and deliberate safe return serve');

  await ev(()=>{const l=CQ.fresh();l.release();l.paddle.x=l.guns[1].x;l.nextAttack=0;for(let i=0;i<100;i++)l.update(1/120);__circuitDraw();});await shot('08-staged-open-port-warning');
  await frames(30);await shot('09-staged-port-shot');
  await ev(()=>{CQ.latch();const l=__breach.level;l.fail('Staged Continue fixture');CQ.frames(80);});await shot('10-staged-loss');
  await ev(()=>dispatchEvent(new Event('blur')));const frozen=await ev(()=>CQ.state());await frames(240);assert.deepEqual(await ev(()=>CQ.state()),frozen);await ev(()=>dispatchEvent(new Event('focus')));
  const cont=await ev(top=>({x:180*__breach.level.kitUIScale,y:top+((__breach.level.H-34)/2+44)*__breach.level.kitUIScale}),D.top);
  await touch('touchStart',cont.x,cont.y);await touch('touchEnd');await frames(2);assert(await ev(()=>__breach.level.state==='play'&&__breach.level.linked===1&&__breach.level.aim.serve));
  await shot('11-real-continue');
  await touch('touchStart',22,D.top+22);await touch('touchEnd');await frames(1);await ev(()=>window.__oldLevel=__breach.level);
  const retry=await ev(top=>({x:180*__breach.level.kitUIScale,y:top+((__breach.level.H-34)/2+24)*__breach.level.kitUIScale}),D.top);
  await touch('touchStart',retry.x,retry.y);await touch('touchEnd');await frames(2);assert(await ev(()=>__breach.level!==__oldLevel&&__breach.level.linked===0&&!__breach.level.burstSpent&&__breach.level.difficulty==='medium'));
  r.checks.push('Background terminal freeze, real Continue retains the link, real same-mode Retry resets the circuit');

  await ev(()=>CQ.fresh());await page.evaluate(async()=>Promise.all(__images.map(i=>i.decode())));
  const earned=await page.evaluate(controller=>{const run=(0,eval)(`(${controller})`),captures=[];const l=__breach.level;const result=run(l,{limit:240,capture:(key)=>{__circuitDraw();captures.push({key,clock:l.clock,png:document.getElementById('game').toDataURL('image/png').split(',')[1]});}});__circuitDraw();return{...result,captures};},playCircuit.toString());
  for(const[i,c]of earned.captures.entries())writeFileSync(`${OUT}/${name}-earned-${String(i).padStart(2,'0')}-${c.key}.png`,Buffer.from(c.png,'base64'));
  r.earned={...earned,captures:earned.captures.map(({png,...c})=>c)};assert.equal(earned.state,'won','earned public-input-assisted encounter completes');assert.equal(earned.linked,4);assert(earned.burstSpent);assert.equal(earned.lives,3);r.checks.push('Earned assisted completion uses public level input/update only; natural capsules and mandatory earned burst are logged, no HP/phase/lives/resource writes');
  assert.deepEqual(errors,[]);save();console.log(JSON.stringify({phone:name,earned:earned.seconds,powers:earned.powers,links:earned.linked,checks:r.checks.length,errors}));
 }catch(e){r.failure=e.stack||String(e);await shot('FAILURE');save();throw e;}finally{await page.close();}
 }
 assert.equal(sha('out/relay-circuit/circuit.html'),report.htmlSHA256);report.hashAfter=sha('out/relay-circuit/circuit.html');report.completed=true;writeFileSync(`${OUT}/report.json`,JSON.stringify(report,null,2));
}finally{await browser.close();}
