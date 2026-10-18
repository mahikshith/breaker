import assert from 'node:assert/strict';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(process.env.PW_MODULE||'playwright');
const out=resolve(process.argv[2]||'out/orbital-forge'),hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
mkdirSync(out,{recursive:true});
const report={scope:'Selected actual-art Forge; fresh isolated Main, native browser viewports. Labelled composition fixtures separate from earned public-input full-physics runs. No native APK/human balance claim.',source:hash('src/orbital.js'),html:hash(`${out}/forge.html`),manifest:hash('assets/orbital-forge/manifest.json'),production:hash('dist/breach.html'),devices:{}};
const browser=await chromium.launch({executablePath:process.env.PW_CHROMIUM,args:['--mute-audio']});
try{
 for(const[name,D]of Object.entries({ios:{width:393,height:852,top:59,bottom:34},android:{width:412,height:915,top:32,bottom:24}})){
  const page=await browser.newPage({viewport:D,deviceScaleFactor:2,hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.stack||e.message));
  await page.addInitScript(()=>{window.requestAnimationFrame=fn=>{window.__nextFrame=fn;return 1;};localStorage.setItem('breach.unlocked','true');});
  await page.goto(`${pathToFileURL(`${out}/forge.html`).href}?safe=${D.top},${D.bottom}&level=1&difficulty=medium`);
  await page.waitForFunction(()=>window.__breach&&window.__nextFrame,null,{polling:50});await page.evaluate(async()=>{await document.fonts.load('18px "Lilita One"');await document.fonts.load('600 16px Rubik');await document.fonts.ready;});await page.waitForTimeout(300);
  await page.evaluate(()=>{let now=performance.now();window.FQ={frames(n=1){now=Math.max(now,performance.now());for(let i=0;i<n;i++)__nextFrame(now+=1000/60);},fresh(){now=Math.max(now,performance.now());__breach.start(0);this.frames(2);return __breach.level;},state(){return __breach.level.inspect();}};FQ.frames(2);});
  const frame=n=>page.evaluate(n=>FQ.frames(n),n),shot=tag=>page.screenshot({path:`${out}/${name}-${tag}.png`});
  const native=await page.evaluate(()=>{const l=__breach.level;return{H:l.H,scale:l.kitUIScale,paddle:l.paddle,reserve:(l.H-l.paddle.y)*l.kitUIScale,deepest:Math.max(...l.bricks.map(b=>b.y+b.h))};});
  await shot('00-opening');assert(Math.abs(native.reserve-126)<.7);
  const y=D.height-D.bottom-26,session=await page.context().newCDPSession(page),touch=(type,x=0,y=0)=>session.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'||type==='touchCancel'?[]:[{id:21,x,y,radiusX:3,radiusY:3,force:1}]});
  await touch('touchStart',D.width/2,y);await touch('touchMove',D.width/2+32,y);await frame(5);assert(await page.evaluate(()=>__breach.level.aim.angle>.1));await shot('01-real-touch-aim');await touch('touchEnd');await frame(2);assert(await page.evaluate(()=>!__breach.level.aim));
  await touch('touchStart',D.width/2,y);await touch('touchMove',D.width/2-55,y);await frame(8);assert(await page.evaluate(()=>__breach.level.paddle.x<155));await touch('touchEnd');
  await touch('touchStart',22,D.top+22);await touch('touchEnd');await frame(1);assert.equal(await page.evaluate(()=>__breach.scene),'pause');const frozen=await page.evaluate(()=>FQ.state());await frame(180);assert.deepEqual(await page.evaluate(()=>FQ.state()),frozen);await shot('02-real-pause');
  const resume=await page.evaluate(top=>{const l=__breach.level;return{x:180*l.kitUIScale,y:top+((l.H-34)/2-38)*l.kitUIScale};},D.top);await touch('touchStart',resume.x,resume.y);await touch('touchEnd');await frame(1);assert.equal(await page.evaluate(()=>__breach.scene),'level');
  await page.evaluate(()=>{const l=FQ.fresh();l.started=true;l.stage='open';l.stageAt=l.clock;FQ.frames(1);});await shot('03-staged-open');
  await page.evaluate(()=>{const l=FQ.fresh();l.started=true;l.teachDone=true;l.warn();FQ.frames(1);});await shot('04-staged-warning');
  await page.evaluate(()=>{const l=FQ.fresh();for(let i=0;i<3;i++){l.activeIndex=i;l.stage='open';l.hitTarget(l.stations[i].id,{titan:7});}FQ.frames(20);});await shot('05-staged-collapse');await frame(70);await shot('06-staged-projector');
  await frame(60);assert.equal(await page.evaluate(()=>__breach.level.phase),'core',JSON.stringify(await page.evaluate(()=>({scene:__breach.scene,phase:__breach.level.phase,clock:__breach.level.clock,hidden:document.hidden}))));await shot('07-staged-core');
  await page.evaluate(()=>{const l=__breach.level;for(let i=0;i<l.rules.core;i++)l.hitTarget('core',{});FQ.frames(125);});assert.equal(await page.evaluate(()=>__breach.level.state),'won');await frame(90);await shot('08-staged-shutdown');
  const earned=[];
  for(const normalOnly of[true,false])for(const seed of[20261019]){
   const run=await page.evaluate(({normalOnly,seed})=>{
    let rng=seed;Math.random=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296;};
    const l=FQ.fresh(),DT=1/120,fold=(x,lo,hi)=>{const w=hi-lo,z=((x-lo)%(2*w)+2*w)%(2*w);return lo+(z>w?2*w-z:z);};
    // Read-only trajectory forecast in the empty return lane, including the actual decaying swipe spin.
    const landing=b=>{if(b.y<440)return fold(b.x+b.vx*Math.max(0,(l.paddle.y-b.r-b.y)/b.vy),l.left+b.r,l.right-b.r);let{x,y,vx,vy,spin}=b;const dt=1/480;for(let i=0;i<960;i++){if(spin){const a=spin*dt,c=Math.cos(a),s=Math.sin(a),v=vx*c-vy*s;vy=vx*s+vy*c;vx=v;spin*=Math.exp(-dt/.7);if(Math.abs(spin)<.02)spin=0;}const lastY=y,lastX=x;x+=vx*dt;y+=vy*dt;if(x-b.r<l.left){x=l.left+b.r;vx=Math.abs(vx);}if(x+b.r>l.right){x=l.right-b.r;vx=-Math.abs(vx);}if(y+b.r>=l.paddle.y){const f=(l.paddle.y-b.r-lastY)/Math.max(.00001,y-lastY);return lastX+(x-lastX)*Math.max(0,Math.min(1,f));}if(vy<0)break;}return fold(b.x+b.vx*Math.max(0,(l.paddle.y-b.r-b.y)/b.vy),l.left+b.r,l.right-b.r);};
    const events=[],powers=[],coreReturns=[];let titanReturns=0,contacts=0;const hit=l.hitTarget.bind(l),power=l.applyPower.bind(l),paddle=l.onPaddle.bind(l);
    l.hitTarget=(id,b)=>{const obj=l.stations.find(s=>s.id===id)||(id==='core'?l.core:null),hp=obj?.hp,answer=hit(id,b);if(obj&&obj.hp!==hp)events.push({t:l.clock,id,hp:obj.hp,phase:l.phase,stage:l.stage});return answer;};
    l.applyPower=k=>{powers.push({kind:k,t:l.clock});power(k);};l.onPaddle=b=>{contacts++;const c=l.paddle.charge;if(c>=1)coreReturns.push({t:l.clock,off:b.x-l.paddle.x});paddle(b);if(c>=1&&l.paddle.charge===0)titanReturns++;};
    for(let frame=0;frame<120*300&&l.state==='play';frame++){
     if(!l.combat()){l.update(DT);continue;}
     const p=l.paddle,s=l.stations[l.activeIndex],target=l.phase==='core'?{x:180,y:246}:s||{x:180,y:300};
     if(l.aim){const a=l.aim;if(a.serve&&l.started&&l.phase==='forge'&&l.serveAge<2.6){l.update(DT);continue;}const angle=Math.max(-1.08,Math.min(1.08,Math.atan2(target.x-a.ball.x,a.ball.y-target.y)+(seed%5-2)*.025));l.pointerDown(p.x,l.H-30);l.pointerMove(a.anchorX+(angle-(a.base||0))/.012,l.H-30);l.update(DT);l.pointerUp();l.key(' ',false);}
     const falling=l.balls.filter(b=>!b.dead&&!b.caught&&b.vy>0).map(b=>({b,time:(p.y-b.r-b.y)/b.vy})).filter(a=>a.time>=-.1).sort((a,b)=>a.time-b.time)[0];let x=p.x;
     if(falling){const b=falling.b,impact=landing(b),angle=Math.max(-1.04,Math.min(1.04,Math.atan2(target.x-impact,p.y-target.y)));x=impact-angle/(62*Math.PI/180)*p.w/2;if(normalOnly&&p.charge>=1&&Math.abs(x-impact)<11)x=impact+(x<impact?-11:11);}
     else{const d=l.drops.filter(d=>d.kind!=='shrink').sort((a,b)=>b.y-a.y)[0];x=normalOnly?(d?(d.x<180?l.right:l.left):p.x):d?.x??l.balls[0]?.x??p.x;}
     const lo=l.left+p.w/2,hi=l.right-p.w/2;
     if(normalOnly){
      const low=l.drops.filter(d=>d.y>p.y-140&&!d.got).sort((a,b)=>b.y-a.y)[0];
      if(low){const left=low.x-p.w/2-22,right=low.x+p.w/2+22;x=Math.abs(x-left)<Math.abs(x-right)?left:right;if(x<lo)x=right;if(x>hi)x=left;}
      if(falling&&p.charge>=1){const impact=landing(falling.b);if(Math.abs(x-impact)<13)x=impact+(impact<180?16:-16);const near=l.balls.filter(b=>!b.dead&&!b.caught&&b.vy>0&&(p.y-b.r-b.y)/b.vy<.18).map(landing);if(near.length){let best=null;for(let c=lo;c<=hi;c+=1)if(near.every(ix=>Math.abs(ix-c)>13)&&Math.abs(impact-c)<p.w/2+3&&(!best||Math.abs(c-x)<Math.abs(best-x)))best=c;if(best!==null)x=best;}}
     }
     x=Math.max(lo,Math.min(hi,x));l.pointerDown(p.x,l.H-30);l.pointerMove(l.ptr.anchor+(x-l.ptr.padAnchor)/1.15,l.H-30);l.key(' ',!normalOnly||l.phase==='core'||l.activeIndex>=1&&l.stage==='open');l.update(DT);
     if(!l.balls.every(b=>Number.isFinite(b.x+b.y+b.vx+b.vy)))throw Error('Nonfinite rally');
    }
    l.pointerUp();l.key(' ',false);FQ.frames(l.state==='won'?90:1);return{...l.inspect(),normalOnlyPolicy:normalOnly,normalOnlyObserved:!powers.length&&!titanReturns,powers,titanReturns,coreReturns,contacts,events,seed};
   },{normalOnly,seed});earned.push(run);await shot(`earned-${normalOnly?'normal':'powers'}-${seed}-${run.state}`);console.log(name,normalOnly?'normal':'powers',seed,run.state,run.clock.toFixed(2),run.stations.map(s=>s.hp),run.core.hp,run.powers,run.titanReturns);if(run.state==='won'&&(!normalOnly||run.normalOnlyObserved))break;
  }
  assert.deepEqual(errors,[]);report.devices[name]={native,input:'Actual CDP touch aims/releases/drags; real pause freezes clocks',staged:'Opening, warning, structural collapse, projected core, terminal are explicitly staged native composition fixtures',earned,errors};writeFileSync(`${out}/report.json`,JSON.stringify(report,null,2));await page.close();
 }
 assert.equal(hash('src/orbital.js'),report.source);assert.equal(hash(`${out}/forge.html`),report.html);assert.equal(hash('dist/breach.html'),report.production);report.completed=true;writeFileSync(`${out}/report.json`,JSON.stringify(report,null,2));
}finally{await browser.close();}
