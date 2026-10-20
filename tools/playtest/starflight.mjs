// Actual prototype UI checks. Resource fixtures are isolated from public-input earned runs.
import assert from 'node:assert/strict';
import {mkdirSync,readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
const {chromium}=await import(process.env.PW_MODULE||'playwright');
const out=resolve(process.argv[2]||'out/starflight-review'),base=process.argv[3]||'http://127.0.0.1:4193/prototypes/starflight/';
const probe=process.argv.includes('--probe'),earned=process.argv.includes('--earned'),ordinary=process.argv.includes('--ordinary');
mkdirSync(out,{recursive:true});
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const files=dir=>existsSync(dir)?readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(`${dir}/${e.name}`):[`${dir}/${e.name}`]):[];
const POWER_IDS=['laser','seeker','spiral','drones','nova','hyper','stasis'];
const sources=()=>Object.fromEntries(['prototypes/starflight/index.html','prototypes/starflight/style.css',...files('prototypes/starflight').filter(p=>p.endsWith('.js')),...files('src/starflight').filter(p=>p.endsWith('.js')),...['assets/starflight','assets/starflight-v2','assets/starflight-arsenal'].flatMap(files)].sort().map(p=>[p,sha(p)]));
const report={scope:'Actual renderer, CDP touch and keyboard. Seven full-charge ability fixtures and later-sector art fixtures are staged; earned routes use touch/ability input only and never write HP, charge, RNG or enemy state. Browser dimensions are not physical-device performance evidence.',probe,ordinary,sourceBefore:sources(),cases:[],earned:[]};
const save=()=>writeFileSync(`${out}/report.json`,JSON.stringify(report,null,2));
const browser=await chromium.launch({executablePath:process.env.PW_CHROMIUM,args:['--mute-audio']});
if(process.argv.includes('--realtime')){
 report.scope='Normal browser requestAnimationFrame, no intercepted clock. CDP touch and host-only timing; not physical-device performance.';report.realtime=[];
 try{
  for(const[device,D]of Object.entries({ios:{width:393,height:852,top:59,bottom:34},android:{width:412,height:915,top:32,bottom:24}})){
   const page=await browser.newPage({viewport:{width:D.width,height:D.height},deviceScaleFactor:2,hasTouch:true}),errors=[],failed=[];
   page.on('pageerror',e=>errors.push(e.stack||e.message));page.on('requestfailed',r=>failed.push(r.url()));
   await page.addInitScript(()=>{window.__sfRealTicks=[];requestAnimationFrame(function monitor(t){__sfRealTicks.push(t);requestAnimationFrame(monitor);});});
   await page.goto(`${base}?safe=${D.top},${D.bottom}`);await page.waitForFunction(()=>__starflight?.ready);
   await page.locator('[data-mode="easy"]').tap();await page.locator('#launch').tap();
   const start=await page.evaluate(()=>({wall:performance.now(),tick:__sfRealTicks.length,time:__starflight.game.time}));const cdp=await page.context().newCDPSession(page);
   const touch=(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{id:83,x,y,radiusX:3,radiusY:3,force:1}]});
   const y=D.height*.65;await touch('touchStart',D.width*.5,y);
   for(let i=0;i<10;i++){await touch('touchMove',D.width*(.5+Math.sin(i*.8)*.23),y-Math.sin(i*.5)*25);await page.waitForTimeout(1000);}
   await touch('touchEnd');const end=await page.evaluate(start=>{const g=__starflight.game,ticks=__sfRealTicks.slice(start.tick),d=ticks.slice(1).map((t,i)=>t-ticks[i]).sort((a,b)=>a-b),pct=p=>d[Math.min(d.length-1,Math.floor(d.length*p))];return{wallSeconds:(performance.now()-start.wall)/1000,gameSeconds:g.time-start.time,state:g.state,mode:__starflight.mode,hp:g.player.hp,kills:g.kills,score:g.score,shots:g.shots.length,frameSamples:d.length,hostFrameMilliseconds:{p50:pct(.5),p95:pct(.95),max:d.at(-1)}};},start);
   assert(end.gameSeconds>7&&end.frameSamples>60,'normal animation and model progress');assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);await page.screenshot({path:`${out}/${device}-real-clock.png`});report.realtime.push({device,difficulty:'easy',...end,errors,failed});save();console.log(device,'real-clock passed',end.gameSeconds.toFixed(2));await page.close();
  }
  report.sourceAfter=sources();report.sourceStable=JSON.stringify(report.sourceBefore)===JSON.stringify(report.sourceAfter);report.complete=true;save();assert(report.sourceStable);
 }finally{await browser.close();}
 process.exit(0);
}
let active;
try{
 for(const[device,D]of Object.entries({ios:{width:393,height:852,top:59,bottom:34},android:{width:412,height:915,top:32,bottom:24}})){
  for(const difficulty of(probe?['easy']:['easy','medium','hard'])){
   const page=await browser.newPage({viewport:{width:D.width,height:D.height},deviceScaleFactor:2,hasTouch:true}),errors=[],failed=[],consoleErrors=[],httpErrors=[];
   active={page,device,difficulty,errors,failed,consoleErrors,httpErrors};
   page.on('pageerror',e=>errors.push(e.stack||e.message));page.on('requestfailed',r=>failed.push({url:r.url(),error:r.failure()?.errorText}));
   page.on('console',m=>{if(m.type()==='error')consoleErrors.push(`${m.text()} ${m.location().url||''}`);});
   page.on('response',r=>{if(r.status()>=400)httpErrors.push({url:r.url(),status:r.status()});});
   await page.addInitScript(()=>{
    requestAnimationFrame=fn=>{window.__sfFrame=fn;return 1;};
    const Original=Image;window.__sfImages=[];window.Image=class extends Original{constructor(){super();__sfImages.push(this);}};
    window.__sfZapCalls=[];const setValue=AudioParam.prototype.setValueAtTime;AudioParam.prototype.setValueAtTime=function(value,time){if(value===900)__sfZapCalls.push(window.__starflight?.game?.time||0);return setValue.call(this,value,time);};
    window.__sfLanceDraws=[];const proto=CanvasRenderingContext2D.prototype,begin=proto.beginPath,move=proto.moveTo,line=proto.lineTo,stroke=proto.stroke;
    proto.beginPath=function(...a){this.__sfPath=[];return begin.apply(this,a);};proto.moveTo=function(x,y){this.__sfPath?.push([x,y]);return move.call(this,x,y);};proto.lineTo=function(x,y){this.__sfPath?.push([x,y]);return line.call(this,x,y);};
    proto.stroke=function(...a){if(this.canvas.id==='game'&&this.lineWidth===6&&this.__sfPath?.length===2){const m=this.getTransform(),p=this.__sfPath;__sfLanceDraws.push(p.map(([x,y])=>[m.a*x+m.c*y+m.e,m.b*x+m.d*y+m.f]));}return stroke.apply(this,a);};
   });
   await page.goto(`${base}?safe=${D.top},${D.bottom}`);await page.waitForFunction(()=>window.__starflight?.ready&&window.__sfFrame,null,{timeout:45000,polling:50});
   await page.evaluate(()=>{let now=performance.now();window.SFQ={frame(n=1){now=Math.max(now,performance.now());for(let i=0;i<n;i++)__sfFrame(now+=1000/60);},snapshot(){return JSON.stringify(__starflight.game);}};SFQ.frame(2);});
   const cdp=await page.context().newCDPSession(page);
   const touch=(type,x=0,y=0)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:['touchEnd','touchCancel'].includes(type)?[]:[{id:81,x,y,radiusX:3,radiusY:3,force:1}]});
   const tap=async selector=>{const p=await page.locator(selector).boundingBox();assert(p,selector);await touch('touchStart',p.x+p.width/2,p.y+p.height/2);await touch('touchEnd');};
   const layout=await page.evaluate(()=>{const rect=id=>{const r=document.getElementById(id).getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height};};return{flight:rect('flight'),canvas:rect('game'),launch:rect('launch'),rootFont:getComputedStyle(document.body).fontFamily,images:__sfImages.map(i=>({src:i.src,width:i.naturalWidth,height:i.naturalHeight,complete:i.complete}))};});
   assert.equal(layout.flight.x,0);assert.equal(layout.flight.y,0);assert.equal(layout.flight.w,D.width);assert.equal(layout.flight.h,D.height);assert.deepEqual(layout.canvas,layout.flight);
   assert(layout.images.every(i=>i.complete&&i.width>0),'all real image assets decode');
   if(difficulty==='easy')await page.screenshot({path:`${out}/${device}-00-menu.png`});
   await tap(`[data-mode="${difficulty}"]`);await tap('#launch');await page.evaluate(()=>SFQ.frame(1));
   assert.equal(await page.evaluate(()=>__starflight.mode),'play');assert.equal(await page.evaluate(()=>__starflight.game.difficulty),difficulty);
   const controls=await page.evaluate(()=>Object.fromEntries([...document.querySelectorAll('#pause,#arsenal,[data-power]')].map(e=>{const r=e.getBoundingClientRect();return[e.id||e.dataset.power,{x:r.x,y:r.y,w:r.width,h:r.height,disabled:e.disabled}];})));
   const safeIssues=[];if(controls.pause.y<D.top-.5)safeIssues.push('pause above safe top');if(controls.arsenal.y+controls.arsenal.h>D.height-D.bottom+.5)safeIssues.push('arsenal below safe bottom');
   const reactor=await page.locator('#reactor').boundingBox();assert.equal(reactor.width,76);assert.equal(reactor.height,76);assert(controls.pause.w>=44&&controls.pause.h>=44,'pause touch target');
   assert.equal(await page.locator('#reactor').count(),1);assert.equal(await page.locator('[data-power]:not(#power-panel [data-power])').count(),0,'no bottom-strip powers');
   await tap('#reactor');await page.evaluate(()=>SFQ.frame(1));assert.equal(await page.evaluate(()=>__starflight.mode),'arsenal');
   const panel=await page.evaluate(()=>{const e=document.getElementById('power-panel'),p=e.getBoundingClientRect();return{x:p.x,y:p.y,w:p.width,h:p.height,expanded:document.getElementById('reactor').getAttribute('aria-expanded'),buttons:[...e.querySelectorAll('[data-power],#close-powers')].map(e=>{const r=e.getBoundingClientRect();return{id:e.dataset.power||e.id,x:r.x,y:r.y,w:r.width,h:r.height,disabled:e.disabled};})};});
   assert.equal(panel.expanded,'true');assert(panel.y>=D.top&&panel.x>=0&&panel.x+panel.w<=D.width&&panel.y+panel.h<=D.height-D.bottom,'panel safe-area fit');
   assert.deepEqual(panel.buttons.filter(b=>b.id!=='close-powers').map(b=>b.id),POWER_IDS);
   for(const b of panel.buttons)assert(b.w>=44&&b.h>=44&&b.x>=0&&b.x+b.w<=D.width&&b.y>=D.top&&b.y+b.h<=D.height-D.bottom,`${b.id} visible touch target`);
   assert(panel.buttons.filter(b=>b.id!=='close-powers').every(b=>b.disabled),'empty reactor disables choices');
   const modal=await page.evaluate(()=>SFQ.snapshot());await page.evaluate(()=>SFQ.frame(120));assert.equal(await page.evaluate(()=>SFQ.snapshot()),modal,'arsenal freezes entire model');
   await touch('touchStart',D.width*.85,D.top+110);await touch('touchMove',D.width*.7,D.top+140);await touch('touchEnd');await page.keyboard.press('ArrowLeft');await page.evaluate(()=>SFQ.frame(10));assert.equal(await page.evaluate(()=>SFQ.snapshot()),modal,'modal blocks combat gestures');
   await tap('#close-powers');assert.equal(await page.evaluate(()=>__starflight.mode),'play');await page.keyboard.press('e');assert.equal(await page.evaluate(()=>__starflight.mode),'arsenal');await page.keyboard.press('e');assert.equal(await page.evaluate(()=>__starflight.mode),'play');await tap('#reactor');await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>__starflight.mode),'play','Escape closes arsenal');
   if(!probe)assert.deepEqual(safeIssues,[],'phone safe-area controls fit');
   if(difficulty==='easy')await page.screenshot({path:`${out}/${device}-01-opening.png`});
   await tap('#pause');await tap('#return');await page.locator('#launch').focus();await page.keyboard.press('Space');assert.equal(await page.evaluate(()=>__starflight.mode),'play','Space activates focused Launch');
   await tap('#pause');await page.keyboard.press('Space');assert.equal(await page.evaluate(()=>__starflight.mode),'play','Space activates focused Resume');
   await tap('#pause');await page.locator('#retry').focus();await page.keyboard.press('Space');assert.equal(await page.evaluate(()=>__starflight.mode),'play','Space activates focused Retry');await page.evaluate(()=>SFQ.frame(1));
   const initial=await page.evaluate(()=>({...__starflight.game.player}));const y=Math.min(D.height*.65,controls.arsenal.y-40);
   await touch('touchStart',D.width/2,y);await touch('touchMove',D.width/2+55,y-45);await page.evaluate(()=>SFQ.frame(32));await touch('touchEnd');await page.evaluate(()=>SFQ.frame(1));
   const drag=await page.evaluate(()=>{const g=__starflight.game;return{x:g.player.x,y:g.player.y,moving:g.player.moving,shots:g.shots.filter(s=>s.side==='player').length,time:g.time};});
   assert(drag.x>initial.x+20&&drag.y<initial.y-15&&!drag.moving,'real drag moves relative to initial ship without jumping');assert(drag.shots>0,'auto-fire produces real shots');
   await touch('touchStart',D.width/2,y);await touch('touchMove',D.width/2-20,y);await page.evaluate(()=>SFQ.frame(3));await touch('touchCancel');assert.equal(await page.evaluate(()=>__starflight.game.player.moving),false);
   const keyStart=await page.evaluate(()=>__starflight.game.player.x);await page.keyboard.down('ArrowLeft');await page.evaluate(()=>SFQ.frame(15));await page.keyboard.up('ArrowLeft');await page.evaluate(()=>SFQ.frame(1));assert(await page.evaluate(x=>__starflight.game.player.x<x-10,keyStart),'real keyboard steers');
   await page.keyboard.down('ArrowRight');await page.evaluate(()=>SFQ.frame(3));await tap('#pause');await page.evaluate(()=>SFQ.frame(1));assert.equal(await page.evaluate(()=>__starflight.mode),'pause');
   const frozen=await page.evaluate(()=>SFQ.snapshot());await page.evaluate(()=>SFQ.frame(120));assert.equal(await page.evaluate(()=>SFQ.snapshot()),frozen,'pause freezes entire model');
   await page.keyboard.up('ArrowRight');await tap('#resume');await page.evaluate(()=>SFQ.frame(2));assert.equal(await page.evaluate(()=>__starflight.game.player.moving),false,'held key is cleared by pause');
   await page.keyboard.down('Escape');assert.equal(await page.evaluate(()=>__starflight.mode),'pause');await page.keyboard.down('Escape');assert.equal(await page.evaluate(()=>__starflight.mode),'pause','held Escape does not toggle Resume');await page.keyboard.up('Escape');await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>__starflight.mode),'play');
   await page.evaluate(()=>dispatchEvent(new Event('blur')));assert.equal(await page.evaluate(()=>__starflight.mode),'pause');const background=await page.evaluate(()=>SFQ.snapshot());await page.evaluate(()=>SFQ.frame(60));assert.equal(await page.evaluate(()=>SFQ.snapshot()),background);await tap('#resume');
   await page.evaluate(()=>SFQ.frame(180));assert(await page.evaluate(()=>__sfZapCalls.some(t=>t>2)),'autofire schedules real900Hz zap audio before Retry');
   await tap('#pause');await tap('#retry');await page.evaluate(()=>SFQ.frame(1));const retry=await page.evaluate(()=>{const g=__starflight.game;return{hp:g.player.hp,maxHP:g.player.maxHP,charge:g.charge,score:g.score,sector:g.sector,time:g.time,timers:g.timers,mode:__starflight.mode};});assert.equal(retry.hp,retry.maxHP);assert.equal(retry.score,0);assert.equal(retry.charge,0);assert.equal(retry.sector,1);assert(retry.time<.1&&Object.values(retry.timers).every(v=>v===0));
   const audioBefore=await page.evaluate(()=>__sfZapCalls.length);await page.evaluate(()=>SFQ.frame(36));const audioAfter=await page.evaluate(n=>__sfZapCalls.slice(n),audioBefore);assert(audioAfter.some(t=>t>0&&t<.7),'Retry restores firing audio within the first.7s');
   await touch('touchStart',D.width/2,y);await touch('touchMove',D.width/2+10,y-20);await page.evaluate(()=>SFQ.frame(3));
   await page.setViewportSize({width:D.height,height:D.width});await page.waitForTimeout(80);await page.evaluate(()=>SFQ.frame(1));assert(await page.locator('#orientation').isVisible());assert.equal(await page.evaluate(()=>__starflight.mode),'pause');
   const rebased=await page.evaluate(()=>{const g=__starflight.game,p=g.player;return{y:p.y,py:p.py,targetY:p.targetY,x:p.x,px:p.px,targetX:p.targetX,vx:p.vx,vy:p.vy,height:g.height};});assert(rebased.y>=rebased.height*.35&&rebased.y<=rebased.height-38);assert.equal(rebased.py,rebased.y);assert.equal(rebased.targetY,rebased.y);assert.equal(rebased.px,rebased.x);assert.equal(rebased.targetX,rebased.x);assert.equal(rebased.vx,0);assert.equal(rebased.vy,0);
   await page.evaluate(()=>{__starflight.resume();__starflight.launch();SFQ.frame(10);});assert.equal(await page.evaluate(()=>__starflight.mode),'pause','landscape blocks launch and Resume');await touch('touchCancel');
   await page.setViewportSize({width:D.width,height:D.height});await page.waitForTimeout(80);await page.evaluate(()=>SFQ.frame(1));assert(!(await page.locator('#orientation').isVisible()));assert.equal(await page.evaluate(()=>__starflight.mode),'pause','portrait return requires deliberate Resume');await tap('#resume');await page.evaluate(()=>SFQ.frame(2));assert.equal(await page.evaluate(()=>__starflight.game.player.moving),false);
   await tap('#pause');await tap('#retry');await page.evaluate(()=>SFQ.frame(1));
   const reserve=await page.evaluate(async()=>{const {SHIPS}=await import('../../src/starflight/geometry.js'),g=__starflight.game,r=document.getElementById('reactor').getBoundingClientRect(),scale=document.getElementById('flight').clientWidth/g.width,top=parseFloat(getComputedStyle(document.getElementById('hud')).top)+76;const image=__sfImages.find(i=>new URL(i.src).pathname.endsWith('/starflight/player.png')),canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const c=canvas.getContext('2d');c.drawImage(image,0,0);const a=c.getImageData(0,0,image.width,image.height).data;window.__sfPlayerPixels=[];for(let y=0;y<image.height;y++)for(let x=0;x<image.width;x++)if(a[(y*image.width+x)*4+3]>=128)__sfPlayerPixels.push([(x+.5)/image.width*SHIPS.player.width-SHIPS.player.width/2,(y+.5)/image.height*SHIPS.player.height-SHIPS.player.height/2]);return{circle:{...g.controlReserve},orb:{x:(r.x+r.width/2)/scale,y:(r.y+r.height/2-top)/scale,r:r.width/(2*scale)},player:{...g.player},scale,height:g.height,shipWidth:SHIPS.player.width,opaquePixels:__sfPlayerPixels.length};});
   assert.equal(reserve.shipWidth,52);assert(Math.abs(reserve.circle.x-reserve.orb.x)<1e-6&&Math.abs(reserve.circle.y-reserve.orb.y)<1e-6,'reserve follows actual orb');assert(Math.abs(reserve.circle.r-reserve.orb.r-52*.52)<1e-6);
   const reserveSamples=[],reservePointer={x:D.width/2,y:D.height*.64},targets=[[20,reserve.height-38],[reserve.circle.x,reserve.circle.y],[reserve.circle.x+15,reserve.circle.y+15],[180,reserve.height-38],[340,reserve.height-38]];
   await touch('touchStart',reservePointer.x,reservePointer.y);
   for(const target of targets){await touch('touchMove',reservePointer.x+(target[0]-reserve.player.x)*reserve.scale,reservePointer.y+(target[1]-reserve.player.y)*reserve.scale);for(let i=0;i<12;i++){await page.evaluate(()=>SFQ.frame(5));const sample=await page.evaluate(orb=>{const p=__starflight.game.player,c=Math.cos(p.angle),s=Math.sin(p.angle);let gap=Infinity,left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;for(const[x,y]of __sfPlayerPixels){const wx=p.x+x*c-y*s,wy=p.y+x*s+y*c;gap=Math.min(gap,Math.hypot(wx-orb.x,wy-orb.y)-orb.r);left=Math.min(left,wx);right=Math.max(right,wx);top=Math.min(top,wy);bottom=Math.max(bottom,wy);}return{x:p.x,y:p.y,targetX:p.targetX,targetY:p.targetY,solidLeft:left,solidRight:right,solidTop:top,solidBottom:bottom,coreGap:Math.hypot(p.x-orb.x,p.y-orb.y)-orb.r-p.r,solidGap:gap};},reserve.orb);assert(sample.coreGap>=-.05&&sample.solidGap>=-.5,'real ship/core remain outside reactor '+JSON.stringify({target,sample,orb:reserve.orb,reserve:reserve.circle}));assert(sample.solidLeft>=-.05&&sample.solidRight<=360.05&&sample.solidTop>=-.05&&sample.solidBottom<=reserve.height+.05,"full opaque ship stays in arena "+JSON.stringify(sample));reserveSamples.push(sample);}if(target===targets[2]&&difficulty==="easy")await page.screenshot({path:out+"/"+device+"-reactor-left-sweep.png"});}
   await touch('touchEnd');const lowerRight=reserveSamples.at(-1),lowerCentre=reserveSamples[47];assert(lowerCentre.y>reserve.height-43&&Math.abs(lowerCentre.x-180)<5,'bottom-centre flight preserved');assert(lowerRight.y>reserve.height-43&&lowerRight.x>300&&Math.abs(lowerRight.x-lowerRight.targetX)<5,'bottom-right flight preserved');
   if(difficulty==='easy')await page.screenshot({path:`${out}/${device}-reactor-clearance.png`});
   await page.keyboard.down('ArrowLeft');await page.evaluate(()=>SFQ.frame(2));await tap('#pause');await tap('#resume');await page.keyboard.down('ArrowLeft');await page.evaluate(()=>SFQ.frame(8));assert.equal(await page.evaluate(()=>__starflight.game.player.moving),false,'held repeat cannot re-arm movement');await page.keyboard.up('ArrowLeft');
   const powers=[];
   if(!probe)for(const kind of POWER_IDS){
    await tap('#pause');await tap('#retry');await page.evaluate(()=>{__starflight.game.charge=100;SFQ.frame(1);}); // Explicit staged full-charge UI fixture.
    assert.equal(await page.locator('#energy-fill').evaluate(e=>e.style.strokeDashoffset),'0');await tap('#reactor');await page.evaluate(()=>SFQ.frame(1));
    if(difficulty==='easy'&&kind==='laser')await page.screenshot({path:`${out}/${device}-arsenal-full-staged.png`});
    const full=await page.evaluate(()=>SFQ.snapshot());await page.evaluate(()=>SFQ.frame(60));assert.equal(await page.evaluate(()=>SFQ.snapshot()),full,'full-charge menu freezes combat');
    await tap(`[data-power="${kind}"]`);
    assert.equal(await page.evaluate(()=>__starflight.mode),'play');assert.equal(await page.evaluate(()=>__starflight.game.charge),0,'choice spends one full charge');
    await page.keyboard.press(String(POWER_IDS.indexOf(kind)+1));assert.equal(await page.evaluate(()=>__starflight.game.charge),0,'repeated choice cannot spend twice');await page.evaluate(()=>SFQ.frame(30));
    const p=await page.evaluate(kind=>{const g=__starflight.game;return{kind,charge:g.charge,timer:g.timers[kind],shots:g.shots.map(s=>s.kind),drones:g.drones.length};},kind);assert.equal(p.charge,0);assert(p.timer>0);if(!['stasis','drones'].includes(kind))assert(p.shots.includes(kind),'power creates actual new projectile kind');if(kind==='drones')assert(p.drones>0&&p.shots.includes('drone'),'actual orbiting gun drones');powers.push(p);
    if(difficulty==='easy')await page.screenshot({path:`${out}/${device}-power-${kind}-staged.png`});
   }
   await tap('#pause');await tap('#retry');await page.evaluate(()=>{__starflight.game.charge=100;__starflight.game.beginJump();SFQ.frame(1);}); // Explicit staged jump-UI fixture.
   await tap('#reactor');const jumpButtons=await page.evaluate(()=>[...document.querySelectorAll('[data-power]')].map(e=>e.disabled));assert(jumpButtons.every(Boolean),'jump disables all unavailable powers');await page.keyboard.press('1');assert.equal(await page.evaluate(()=>__starflight.game.charge),100,'rejected jump key keeps charge');await page.keyboard.press('Escape');
   assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);assert(consoleErrors.every(s=>s.includes('favicon')),'no console load errors');assert(httpErrors.every(r=>r.url.includes('favicon')),'no missing game resources');
   report.cases.push({device,difficulty,layout,controls,panel,reactor,safeIssues,drag,retry,retryZapTimes:audioAfter,escapeRepeat:true,spaceButtons:true,rotationRebase:rebased,reserve:{...reserve,samples:reserveSamples},jumpButtons,powers,modalFreeze:true,pauseFreeze:true,backgroundHandlerFixture:true,errors,failed,consoleErrors,httpErrors});save();console.log(device,difficulty,'passed',safeIssues.length?'with safe-area findings':'');
   if(difficulty==='easy'&&!probe){await tap('#pause');await tap('#retry');await page.evaluate(()=>{const g=__starflight.game;g.nextSector();g.spawnWave(2);g.spawnAsteroids(0);g.spawnField();g.spawnEnemy('boss',180,-75);SFQ.frame(180);});await page.screenshot({path:`${out}/${device}-varied-field-staged.png`});report.cases.at(-1).stagedLaterSector=await page.evaluate(()=>{const g=__starflight.game;return{scope:'Public spawn/nextSector methods for visual composition only; not earned',ships:g.enemies.map(e=>e.ship),hazards:g.hazards.length,fields:g.fields.length};});save();}
   if(earned&&difficulty==='easy'){
    await tap('#pause');await tap('#retry');await page.evaluate(()=>SFQ.frame(1));
    const start=await page.evaluate(()=>{const g=__starflight.game;return{x:g.player.x,y:g.player.y,width:g.width,height:g.height,hp:g.player.hp,seed:g.seed,charge:g.charge,score:g.score};});assert.equal(start.charge,0);assert.equal(start.score,0);const initialEarned={...start};
    const s=D.width/start.width,startTouch={x:start.x*s,y:start.y*s+25};await touch('touchStart',startTouch.x,startTouch.y);
    const history=[],casts=[];let stopped='time bound',combatCaptured=false,bossCaptured=false,maxCharge=0;
    for(let i=0;i<360;i++){
      const p=await page.evaluate(()=>{const g=__starflight.game,p=g.player,ys=g.height*.76,candidates=[35,70,105,140,180,220,255,290,325],enemy=g.enemies.filter(e=>e.y>=0&&e.hp>0).sort((a,b)=>(a.kind==='boss'?-1:0)-(b.kind==='boss'?-1:0)||Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0];
       const score=x=>{let risk=0;for(const b of g.shots){if(b.side!=='enemy')continue;const t=Math.max(0,Math.min(.6,(ys-b.y)/(b.vy||1)));const dx=b.x+b.vx*t-x,dy=b.y+b.vy*t-ys;if(dy*dy+dx*dx<2500)risk+=150/(Math.hypot(dx,dy)+8);}for(const e of g.enemies)if(e.y>ys-70)risk+=90/(Math.hypot(e.x-x,e.y-ys)+8);return risk+Math.abs(x-(enemy?.x||180))*.012+Math.abs(x-p.x)*.001;};
       const x=candidates.reduce((a,b)=>score(a)<score(b)?a:b);return{x,y:ys,time:g.time,state:g.state,phase:g.phase,sector:g.sector,hp:p.hp,score:g.score,charge:g.charge,kills:g.kills,complete:g.completedSectors,visibleEnemies:g.enemies.filter(e=>e.y>30).length,enemyShots:g.shots.filter(s=>s.side==='enemy').length,boss:g.enemies.find(e=>e.kind==='boss'&&e.y>90)?.hp};});
      maxCharge=Math.max(maxCharge,p.charge);if(!combatCaptured&&p.time>7&&p.visibleEnemies&&p.enemyShots){await page.screenshot({path:`${out}/${device}-earned-combat.png`});combatCaptured=true;}
      if(!bossCaptured&&p.boss>0){await page.screenshot({path:`${out}/${device}-earned-boss.png`});bossCaptured=true;}
      if(p.state!=='play'){stopped=p.state;history.push(p);break;}if(p.complete>=1){stopped='one sector cleared';history.push(p);break;}
      await touch('touchMove',startTouch.x+(p.x-start.x)*s,startTouch.y+(p.y-start.y)*s);
      if(p.charge>=100&&!ordinary){await touch('touchEnd');await page.keyboard.press('1');casts.push({time:p.time,before:p.charge,after:await page.evaluate(()=>__starflight.game.charge),power:'laser'});await touch('touchStart',startTouch.x,startTouch.y);const anchor=await page.evaluate(()=>({...__starflight.game.player}));start.x=anchor.x;start.y=anchor.y;}
      await page.evaluate(()=>SFQ.frame(15));if(i%40===0)history.push(p);
    }
    await touch('touchEnd');await page.screenshot({path:`${out}/${device}-earned-outcome.png`});report.earned.push({device,seed:1701,initial:initialEarned,combatCaptured,bossCaptured,ordinary,maxCharge,casts,policy:ordinary?'Single bounded90s public-touch route, ordinary autofire only, no chosen powers. Read-only hazard projection; no HP/charge/RNG/enemy writes.':'Single bounded90s public-touch route. Read-only hazard projection; earned Lance via key1 at full charge. No HP/charge/RNG/enemy writes.',stopped,history,final:await page.evaluate(()=>{const g=__starflight.game;return{time:g.time,state:g.state,phase:g.phase,hp:g.player.hp,score:g.score,charge:g.charge,kills:g.kills,sector:g.sector,completedSectors:g.completedSectors};})});save();
   }
   await page.close();active=null;
  }
 }
 report.sourceAfter=sources();report.sourceStable=JSON.stringify(report.sourceBefore)===JSON.stringify(report.sourceAfter);report.complete=true;save();if(!probe)assert(report.sourceStable,'prototype sources unchanged during final QA');
}catch(error){report.failure={message:error.stack||String(error),device:active?.device,difficulty:active?.difficulty,errors:active?.errors,failed:active?.failed,consoleErrors:active?.consoleErrors,httpErrors:active?.httpErrors};if(active?.page){await active.page.screenshot({path:`${out}/failure.png`}).catch(()=>{});report.failure.loadingError=await active.page.locator('#loading-error').textContent().catch(()=>null);}save();throw error;}finally{await browser.close();}
