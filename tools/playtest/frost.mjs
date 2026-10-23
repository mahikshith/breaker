// Actual Main Frost Warden checks. Usage: node tools/playtest/frost.mjs [out] [HTML]
// Env: PW_MODULE / PW_CHROMIUM as in polish.mjs. Fixture powers are explicitly staged.
import assert from 'node:assert/strict';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
globalThis.Image=class{complete=true;naturalWidth=1;decode(){return Promise.resolve();}};
const {spacePowerLayout}=await import('../../src/space-companions.js');
const {ART}=await import('../../src/vault-art.js');
const {chromium}=await import(process.env.PW_MODULE||'playwright');
const out=process.argv[2]||'out/frost-phones',html=resolve(process.argv[3]||'dist/breach.html');
mkdirSync(out,{recursive:true});
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const report={scope:'Actual five-level Main, native phone geometry and CDP touch. Kit charge/attack starts are staged UI fixtures, not earned wins, human balance or physical-device performance.',html,sha256:sha(html),cases:[]};
assert(ART.frostWarden?.url,'pack the dedicated Frost Warden art before this playtest');
assert.deepEqual(ART.frostWarden.cell,[256,228]);assert.equal(ART.frostWarden.columns,7);for(const c of['idle','walk','windup','strike','recover','hurt','victory','crouch','dash','smash','dazed','defeated'])assert(ART.frostWarden.clips[c],'clip '+c);assert.equal(ART.frostWarden.anchors.length,ART.frostWarden.columns*ART.frostWarden.rows);
assert(readFileSync(html,'utf8').includes(ART.frostWarden.url),'source atlas and tested embedded bundle match');
report.wardenAssetSHA256=createHash('sha256').update(Buffer.from(ART.frostWarden.url.split(',')[1],'base64')).digest('hex');
const browser=await chromium.launch({executablePath:process.env.PW_CHROMIUM,args:['--mute-audio']});
try{
 for(const[device,D]of Object.entries({ios:{width:393,height:852,top:59,bottom:34},android:{width:412,height:915,top:32,bottom:24}})){
  for(const mode of['easy','medium','hard']){
   const page=await browser.newPage({viewport:D,deviceScaleFactor:2,hasTouch:true}),errors=[];
   page.on('pageerror',e=>errors.push(e.stack||e.message));
   await page.addInitScript(wardenURL=>{
    requestAnimationFrame=fn=>{window.__frostFrame=fn;return 1;};
    const Old=Image;window.__frostImages=[];window.Image=class extends Old{constructor(){super();__frostImages.push(this);}};
    window.__frostText=[];const fill=CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText=function(value,x,y,...rest){const result=fill.call(this,value,x,y,...rest);if(this.canvas.id==='game'){const m=this.getTransform(),r=this.canvas.getBoundingClientRect();__frostText.push({value:String(value),x:r.left+(m.a*x+m.c*y+m.e)*r.width/this.canvas.width,y:r.top+(m.b*x+m.d*y+m.f)*r.height/this.canvas.height,font:this.font});}return result;};
    const draw=CanvasRenderingContext2D.prototype.drawImage;window.__frostWardenDraws=[];
    CanvasRenderingContext2D.prototype.drawImage=function(...a){const result=draw.apply(this,a);if(this.canvas.id==='game'&&a[0]?.src===wardenURL&&a.length===9)__frostWardenDraws.push({sx:a[1],sy:a[2],sw:a[3],sh:a[4],x:a[5],y:a[6],w:a[7],h:a[8],decoded:!!a[0].complete,naturalWidth:a[0].naturalWidth,naturalHeight:a[0].naturalHeight});return result;};
    localStorage.setItem('breach.bestByDifficulty',JSON.stringify({easy:[3,2,1,0],medium:[1,2,0,3],hard:[0,1,2,3]}));
    localStorage.setItem('breach.unlocked','true'); // Existing-unlock fixture: no store/ad request.
   },ART.frostWarden.url);
   await page.goto(`${pathToFileURL(html).href}?difficulty=${mode}&safe=${D.top},${D.bottom}`);
   await page.waitForFunction(()=>window.__breach?.ready&&window.__frostFrame,null,{polling:100});
   await page.evaluate(async()=>{await document.fonts.ready;await Promise.all(__frostImages.map(i=>i.decode()));let now=performance.now();window.FQ={
    frame(n=1){now=Math.max(now,performance.now());__frostText=[];for(let i=0;i<n;i++)__frostFrame(now+=1000/60);},
    fresh(){__breach.start(4);this.frame(1);},
    snapshot(){const l=__breach.level;return JSON.stringify({inspect:l.inspect(),t:l.t,kitTime:l.kitTime,balls:l.balls,shots:l.shots,drops:l.drops,charge:l.paddle.charge,bank:l.coreChargeBank,laser:l.paddle.laserT,fire:l.fireT,slow:l.slowT,shield:l.shield,shieldT:l.shieldT,serve:l.serveAge});},
   };FQ.frame(2);});
   assert.equal(await page.evaluate(()=>__breach.scene),'menu');
   const menu=await page.evaluate(()=>__frostText.filter(t=>['Carrier Breakout','Circuit Breakout','Shutter Forge','The Vault','Frost Warden'].includes(t.value)));
   assert.equal(new Set(menu.map(t=>t.value)).size,5,'first actionable menu contains all five decoded chapter cards');
   assert(menu.every(t=>t.y>=D.top&&t.y<D.height-D.bottom-25),'all five menu titles fit safe content');
   assert(await page.evaluate(()=>__frostImages.every(i=>i.complete&&i.naturalWidth>0)),'all startup art decodes before the first actionable menu');
   if(mode==='easy')await page.screenshot({path:`${out}/${device}-00-first-menu.png`});
   const cdp=await page.context().newCDPSession(page);
   const touch=(type,x=0,y=0)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:['touchEnd','touchCancel'].includes(type)?[]:[{id:72,x,y,radiusX:3,radiusY:3,force:1}]});
   const tap=async p=>{assert(Number.isFinite(p.x+p.y));await touch('touchStart',p.x,p.y);await touch('touchEnd');};
   const title=menu.find(t=>t.value==='Frost Warden');await tap({x:title.x+40,y:title.y});await page.evaluate(()=>FQ.frame(1));
   assert.equal(await page.evaluate(()=>__breach.scene),'level');assert.equal(await page.evaluate(()=>__breach.level.difficulty),mode);
   assert(await page.evaluate(()=>__breach.level.kitPowers&&!__breach.level.spacePowers&&__breach.level.warden),'Frost uses Kit and the actual Warden, not a space companion');
   const raster=await page.evaluate(()=>__frostWardenDraws.at(-1));assert(raster?.decoded&&raster.naturalWidth===ART.frostWarden.size[0]&&raster.naturalHeight===ART.frostWarden.size[1]&&raster.sw===256&&raster.sh===228,'actual decoded dedicated Warden frame is rendered');
   const geometry=await page.evaluate(()=>{const l=__breach.level;return{W:l.W,H:l.H,kitUIScale:l.kitUIScale,orb:l.kitAnchor(),kitPowers:l.kitPowers};});
   const css=(x,y)=>({x:x*geometry.kitUIScale,y:D.top+(y-34)*geometry.kitUIScale}),orb=css(geometry.orb.x,geometry.orb.y),layout=spacePowerLayout({...geometry,kitAnchor:()=>geometry.orb});
   assert(orb.x>=26&&orb.y<D.height-D.bottom&&orb.y>D.height*.65);
   if(mode==='easy')await page.screenshot({path:`${out}/${device}-01-opening.png`});
   const dragY=D.height-D.bottom-26;
   await touch('touchStart',D.width/2,dragY);await touch('touchMove',D.width/2+35,dragY);await page.evaluate(()=>FQ.frame(5));
   assert(await page.evaluate(()=>__breach.level.aim?.angle>.1),'actual first touch aims');await touch('touchEnd');await page.evaluate(()=>FQ.frame(1));assert(await page.evaluate(()=>!__breach.level.aim),'actual lift releases');
   await touch('touchStart',D.width/2,dragY);await touch('touchMove',D.width/2-50,dragY);await page.evaluate(()=>FQ.frame(8));assert(await page.evaluate(()=>__breach.level.paddle.x<160),'actual lower drag moves');await touch('touchEnd');
   const powers=[];
   for(const kind of['shield','arrows','titan','five']){
    await page.evaluate(()=>{FQ.fresh();const l=__breach.level;l.release();l.startWindup();l.paddle.charge=1;FQ.frame(1);});
    assert(await page.evaluate(kind=>__breach.level.canChoosePower(kind),kind),`${kind} is available in the staged warning`);
    await tap(orb);await page.evaluate(()=>FQ.frame(1));assert(await page.evaluate(()=>__breach.level.powerMenuOpen));
    const frozen=await page.evaluate(()=>FQ.snapshot());await page.evaluate(()=>FQ.frame(120));assert.equal(await page.evaluate(()=>FQ.snapshot()),frozen,'choice freezes all Warden, fist, barrier, power and ball clocks');
    if(mode==='easy'&&kind==='shield')await page.screenshot({path:`${out}/${device}-02-kit-chooser.png`});
    const c=layout.choices.find(c=>c.id===kind);await tap(css(c.x+c.w/2,c.y+c.h/2));
    const applied=await page.evaluate(kind=>{const l=__breach.level;return{kind,open:l.powerMenuOpen,charge:l.paddle.charge,ward:l.ward,laser:l.paddle.laserT,titans:l.balls.filter(b=>b.titan>0).length,balls:l.balls.filter(b=>!b.dead).length};},kind);
    assert(!applied.open&&applied.charge===0);if(kind==='shield')assert(applied.ward,'Ward attaches to the threatened defence');if(kind==='arrows')assert(applied.laser>0);if(kind==='titan')assert.equal(applied.titans,1);if(kind==='five')assert.equal(applied.balls,5);
    powers.push(applied);await page.evaluate(()=>FQ.frame(8));if(mode==='easy')await page.screenshot({path:`${out}/${device}-03-${kind}.png`});
    if(kind==='shield'){
     await page.evaluate(()=>{const l=__breach.level;for(let i=0;i<180&&l.stage==='windup'&&l.clock-l.stageAt<l.rules.windup*.75;i++)FQ.frame(1);});
     if(mode==='easy')await page.screenshot({path:`${out}/${device}-03-ward-armour-before-contact-staged.png`});
     const held=await page.evaluate(()=>{const l=__breach.level,hp=l.defences[l.activeDefence].hp;for(let i=0;i<180&&!l.blockedPunches;i++)FQ.frame(1);return{blocked:l.blockedPunches,hp:l.defences[l.activeDefence].hp,before:hp};});assert.equal(held.blocked,1);assert.equal(held.hp,held.before);if(mode==='easy')await page.screenshot({path:`${out}/${device}-03-ward-held-punch-staged.png`});
    }
   }
   await page.evaluate(()=>{FQ.fresh();__breach.level.release();__breach.level.startWindup();__breach.level.paddle.charge=1;FQ.frame(1);});await tap(orb);await page.evaluate(()=>FQ.frame(1));
   const first=layout.choices[0],point=css(first.x+first.w/2,first.y+first.h/2);await touch('touchStart',point.x,point.y);await touch('touchMove',point.x+35,point.y);await touch('touchEnd');assert(await page.evaluate(()=>__breach.level.powerMenuOpen&&__breach.level.paddle.charge===1),'swipe does not buy');
   await page.keyboard.press('Escape');assert(await page.evaluate(()=>!__breach.level.powerMenuOpen&&__breach.level.paddle.charge===1),'cancel preserves earned charge');
   await tap(orb);await page.evaluate(()=>FQ.frame(1));await tap({x:22,y:D.top+22});await page.evaluate(()=>FQ.frame(1));assert.equal(await page.evaluate(()=>__breach.scene),'pause');
   const paused=await page.evaluate(()=>FQ.snapshot());await page.evaluate(()=>FQ.frame(120));assert.equal(await page.evaluate(()=>FQ.snapshot()),paused,'pause freezes complete encounter');
   if(mode==='easy')await page.screenshot({path:`${out}/${device}-04-pause.png`});
   const saved=await page.evaluate(()=>localStorage.getItem('breach.bestByDifficulty')),navigation=await page.evaluate(()=>performance.getEntriesByType('navigation').length),retry=await page.evaluate(()=>__frostText.findLast(t=>t.value==='Retry'));
   await tap(retry);await page.evaluate(()=>FQ.frame(1));assert.equal(await page.evaluate(()=>__breach.scene),'level');
   const fresh=await page.evaluate(()=>{const l=__breach.level;return{difficulty:l.difficulty,hp:l.warden.hp,maxHP:l.warden.maxHP,charge:l.paddle.charge,menu:l.powerMenuOpen,ward:l.ward,aim:!!l.aim?.serve,down:l.ptr.down,keys:Object.values(l.keys).some(Boolean),laser:l.paddle.laserT,shots:l.shots.length,balls:l.balls.length,clock:l.clock,defences:l.defences.map(d=>({hp:d.hp,maxHP:d.maxHP}))};});
   assert.equal(fresh.difficulty,mode);assert.equal(fresh.hp,fresh.maxHP);assert.equal(fresh.charge,0);assert(!fresh.menu&&!fresh.ward&&fresh.aim&&!fresh.down&&!fresh.keys&&!fresh.laser&&!fresh.shots);assert.equal(fresh.balls,1);assert(fresh.clock<.1&&fresh.defences.every(d=>d.hp===d.maxHP),'Retry resets encounter, not just scene');
   assert.equal(await page.evaluate(()=>localStorage.getItem('breach.bestByDifficulty')),saved,'Retry preserves prior four-slot stars');assert.equal(await page.evaluate(()=>performance.getEntriesByType('navigation').length),navigation,'Retry does not reload the browser');
   if(mode==='easy')await page.screenshot({path:`${out}/${device}-05-retry.png`});

   // Exercise the real background handlers without claiming a physical OS suspension.
   await page.keyboard.down(' ');await page.evaluate(()=>{dispatchEvent(new Event('blur'));FQ.frame(1);});assert.equal(await page.evaluate(()=>__breach.scene),'pause');
   const background=await page.evaluate(()=>FQ.snapshot());await page.evaluate(()=>FQ.frame(120));assert.equal(await page.evaluate(()=>FQ.snapshot()),background);
   await page.keyboard.up(' ');await page.evaluate(()=>{dispatchEvent(new Event('focus'));FQ.frame(1);});const resume=await page.evaluate(()=>__frostText.findLast(t=>t.value==='Resume'));await tap(resume);await page.evaluate(()=>FQ.frame(1));
   assert(await page.evaluate(()=>__breach.scene==='level'&&__breach.level.aim?.serve&&!__breach.level.ptr.down),'stale Space does not launch after background recovery');

   // Staged loss/progress fixture, followed by the actual Main Continue button.
   const progress=await page.evaluate(()=>{FQ.fresh();const l=__breach.level;l.release();l.hitTarget('warden',{x:60,y:160,shot:true});l.hitTarget(l.bricks[0].id,{x:60,y:280,shot:true});const result={hp:l.warden.hp,score:l.score,brick:l.bricks[0].hp};l.fail('Continue fixture');FQ.frame(70);return result;});
   const proceed=await page.evaluate(()=>__frostText.findLast(t=>t.value==='Continue'));assert(proceed,'existing-unlock Continue is actually shown');await tap(proceed);await page.evaluate(()=>FQ.frame(1));
   assert(await page.evaluate(p=>{const l=__breach.level;return l.state==='play'&&l.phase==='siege'&&l.warden.hp===p.hp&&l.score===p.score&&l.bricks[0].hp===p.brick&&l.aim?.serve&&l.shield===2;},progress),'Continue preserves earned work and gives a safe replacement serve');

   // Actual atlas anchors and live fist sweeps at all three authored post positions.
   const stanceProof=[];
   for(let index=0;index<3;index++){
    const before=await page.evaluate(index=>{FQ.fresh();const l=__breach.level;l.release();for(const b of l.balls)b.caught=true;l.aim=null;l.activeDefence=index;for(let i=0;i<index;i++)l.defences[i].hp=0;l.startWindup();FQ.frame(1);return{hp:l.defences[index].hp,windup:l.rules.windup,strike:l.rules.strike};},index);
    await page.evaluate(time=>FQ.frame(Math.round(time*60)),before.windup*.55);
    if(mode==='easy')await page.screenshot({path:`${out}/${device}-06-stance${index+1}-warning-staged.png`});
    await page.evaluate(time=>FQ.frame(Math.ceil(time*60)),before.windup*.45+before.strike*.75);
    const punch=await page.evaluate(index=>{const l=__breach.level;return{index,post:l.defences[index].id,hp:l.defences[index].hp,punches:l.punchCount,records:l.records,pose:l.inspect()};},index);
    assert.equal(punch.punches,1,'measured real rig fist crosses the intended post once');assert.equal(punch.hp,before.hp-1);stanceProof.push(punch);
    if(mode==='easy')await page.screenshot({path:`${out}/${device}-07-stance${index+1}-contact-staged.png`});
    await page.evaluate(time=>FQ.frame(Math.ceil(time*60)),before.strike*.25+.06);
    if(mode==='easy')await page.screenshot({path:`${out}/${device}-08-stance${index+1}-recovery-staged.png`});
   }
   if(mode==='easy'){
    await page.evaluate(()=>{FQ.fresh();const l=__breach.level;l.release();l.warden.hp=1;l.hitTarget('warden',{x:l.pose().body.x,y:l.pose().body.y,r:6});FQ.frame(45);});await page.screenshot({path:`${out}/${device}-09-rescue-staged.png`});
    await page.evaluate(()=>FQ.frame(200));assert.equal(await page.evaluate(()=>__breach.level.state),'won');await page.screenshot({path:`${out}/${device}-10-win-staged.png`});
    await page.evaluate(()=>{FQ.fresh();const l=__breach.level;l.release();for(const b of l.balls)b.caught=true;l.aim=null;l.activeDefence=2;l.defences[0].hp=l.defences[1].hp=0;l.defences[2].hp=1;l.startWindup();FQ.frame(Math.ceil((l.rules.windup+l.rules.strike*.75)*60));});assert.equal(await page.evaluate(()=>__breach.level.phase),'breach');await page.screenshot({path:`${out}/${device}-11-breach-staged.png`});
    await page.evaluate(()=>FQ.frame(125));assert.equal(await page.evaluate(()=>__breach.level.state),'lost');await page.screenshot({path:`${out}/${device}-12-loss-staged.png`});const continueAfterBreach=await page.evaluate(()=>__frostText.findLast(t=>t.value==='Continue'));await tap(continueAfterBreach);await page.evaluate(()=>FQ.frame(1));assert(await page.evaluate(()=>__breach.level.state==='play'&&__breach.level.defences[2].hp===2&&__breach.level.aim?.serve));await page.screenshot({path:`${out}/${device}-13-continued-staged.png`});
   }
   assert.deepEqual(errors,[]);report.cases.push({device,mode,geometry,raster,firstMenuReady:true,actualCardAimDrag:true,powers,choiceFreeze:true,pauseFreeze:true,cancelAndSwipe:true,retry:fresh,backgroundHandlerFixture:true,continueProgress:progress,stanceProof,errors});writeFileSync(`${out}/report.json`,JSON.stringify(report,null,2));console.log(device,mode,'passed');await page.close();
  }
 }
 assert.equal(sha(html),report.sha256,'bundle unchanged during review');report.hashAfter=sha(html);report.complete=true;writeFileSync(`${out}/report.json`,JSON.stringify(report,null,2));
}finally{await browser.close();}
