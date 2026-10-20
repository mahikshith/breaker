import assert from 'node:assert/strict';
import {mkdirSync,readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const {chromium}=await import(process.env.PW_MODULE||'playwright');
const OUT=process.argv[2]||'out/tidewheel-phones',URL=process.argv[3]||'http://127.0.0.1:4194/prototypes/fantasy/';
const probe=process.argv.includes('--probe'),earned=process.argv.includes('--earned');mkdirSync(OUT,{recursive:true});
const files=d=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(d+'/'+e.name):[d+'/'+e.name]);
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const seal=()=>Object.fromEntries([...files('src/fantasy'),...files('prototypes/fantasy'),...files('assets/fantasy-machinery')].sort().map(p=>[p,sha(p)]));
const R={scope:'Actual browser/CDP touch phone viewports, not physical handsets. Staged resources/terminal poses are labelled separately from legal input-only earned routes.',before:seal(),cases:[],earned:[],complete:false};
const save=()=>writeFileSync(OUT+'/report.json',JSON.stringify(R,null,2));
const browser=await chromium.launch({executablePath:process.env.PW_CHROMIUM,args:['--mute-audio']});let active;
const DS={ios:{width:393,height:852},android:{width:412,height:915}};
async function open(level,device,mode){
 const D=DS[device],page=await browser.newPage({viewport:D,deviceScaleFactor:2,hasTouch:true}),errors=[],network=[];
 page.on('pageerror',e=>errors.push(e.stack||e.message));page.on('requestfailed',r=>network.push(r.url()+': '+r.failure()?.errorText));page.on('response',r=>{if(r.status()>=400&&!r.url().includes('favicon'))network.push(r.status()+' '+r.url());});
 await page.addInitScript(()=>{window.__images=[];const Img=Image;window.Image=class extends Img{constructor(){super();__images.push(this);}};requestAnimationFrame=f=>{window.__frame=f;return 1;};});
 await page.goto(URL+'?level='+level);await page.waitForFunction(()=>!document.getElementById('start').disabled&&window.__frame,null,{polling:50,timeout:45000});
 await page.evaluate(()=>{let n=performance.now();window.FQ={frame(k=1){n=Math.max(n,performance.now());for(let i=0;i<k;i++)__frame(n+=1000/60);},snapshot(){return JSON.stringify(fantasyGame,(_,v)=>v instanceof Set?[...v]:v);}};});
 const cdp=await page.context().newCDPSession(page),fingers=new Map();
 const dispatch=t=>cdp.send('Input.dispatchTouchEvent',{type:t,touchPoints:[...fingers].map(([id,p])=>({id,...p,radiusX:3,radiusY:3,force:1}))});
 const down=async(id,x,y)=>{fingers.set(id,{x,y});await dispatch('touchStart');};
 const move=async(id,x,y)=>{assert(fingers.has(id));fingers.set(id,{x,y});await dispatch('touchMove');};
 const up=async id=>{const p=fingers.get(id);assert(p);fingers.delete(id);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[{id,...p,radiusX:3,radiusY:3,force:1}]});};
 const tap=async selector=>{const b=await page.locator(selector).boundingBox();assert(b,'visible '+selector);await down(99,b.x+b.width/2,b.y+b.height/2);await up(99);};
 const frame=k=>page.evaluate(k=>FQ.frame(k),k),snap=()=>page.evaluate(()=>FQ.snapshot());
 const ui={level,device,mode,D,page,errors,network,cdp,down,move,up,tap,frame,snap};active=ui;
 await tap('[data-mode="'+mode+'"]');await tap('#start');await frame(1);return ui;
}
async function check(ui){
 const{level,device,mode,D,page,down,move,up,tap,frame,snap}=ui,prefix=OUT+'/'+device+'-'+level+'-'+mode;
 const initial=await page.evaluate(()=>({game:fantasyGame.constructor.name,hp:fantasyGame.villain.hp,lives:fantasyGame.lives,time:fantasyGame.time,phase:fantasyGame.phase,paddle:{...fantasyGame.paddle},width:fantasyGame.width,height:fantasyGame.height,images:__images.map(i=>({src:i.src,w:i.naturalWidth,complete:i.complete}))}));
 assert(initial.images.length>30&&initial.images.every(i=>i.w&&i.complete),'all actual source art decoded');assert.equal(initial.phase,'serve');
 if(mode==='easy')await page.screenshot({path:prefix+'-00-opening.png'});
 const scale=D.width/initial.width,x=D.width/2,y=D.height*.72;
 await down(81,x,y);await move(81,x+48,y);await frame(8);await up(81);await frame(1);
 const launched=await page.evaluate(()=>({phase:fantasyGame.phase,paddle:{...fantasyGame.paddle},balls:fantasyGame.balls.map(b=>({x:b.x,y:b.y,vx:b.vx,vy:b.vy,caught:b.caught}))}));
 assert(launched.paddle.x>initial.paddle.x+20&&launched.balls.some(b=>!b.caught),'genuine touch drag and aimed release');
 await tap('#pause');await frame(1);assert(await page.locator('#paused').isVisible(),'first primary Pause after a drag activates once');
 await tap('#resume');await frame(1);assert(await page.locator('#paused').isHidden(),'primary Resume is not doubled by a ghost click');
 await down(81,x,y);await move(81,x-24,y);await tap('#pause');await frame(1);
 assert(await page.locator('#paused').isVisible(),'secondary thumb pause while dragging');
 const paused=await snap();await frame(90);assert.equal(await snap(),paused,'pause freezes complete physics');await up(81);await tap('#resume');await frame(1);
 await page.evaluate(()=>dispatchEvent(new Event('blur')));await frame(1);assert(await page.locator('#paused').isVisible(),'blur opens actual pause');
 const background=await snap();await frame(60);assert.equal(await snap(),background);await tap('#resume');
 await page.evaluate(()=>{const g=fantasyGame;g.charge=100;g.villain.stage=g.constructor.name==='Tidewheel'?'pullWindup':'windup';g.villain.stageTime=0;g.villain.stageAt=g.time;g.villain.until=g.time+1.3;g.nextTeaching=false;}); // Staged eligible power.
 await tap('#kit');assert(await page.locator('#power').isVisible());assert(await page.locator('#cast').isEnabled(),'eligible signature through paused actual UI');
 const menu=await snap();await frame(90);assert.equal(await snap(),menu,'signature menu freezes model');await tap('#cast');await frame(8);
 const cast=await page.evaluate(()=>({charge:fantasyGame.charge,anchor:!!fantasyGame.anchor,guard:!!fantasyGame.guard,state:fantasyGame.state}));
 assert.equal(cast.charge,0);assert(cast.anchor||cast.guard,'one actual signature effect');
 if(mode==='easy')await page.screenshot({path:prefix+'-01-signature-staged.png'});
 await tap('#pause');await tap('#retry');await frame(1);
 const retry=await page.evaluate(()=>({hp:fantasyGame.villain.hp,lives:fantasyGame.lives,time:fantasyGame.time,score:fantasyGame.score,charge:fantasyGame.charge,phase:fantasyGame.phase}));
 assert.equal(retry.hp,initial.hp);assert.equal(retry.score,0);assert.equal(retry.lives,3);assert.equal(retry.charge,0);assert.equal(retry.phase,'serve');
 await tap('#pause');await page.keyboard.down('Space');await page.keyboard.press('Escape');await page.keyboard.down('Space');await frame(1);
 assert(await page.locator('#paused').isHidden(),'Escape resumes one actual pause');
 assert.equal(await page.evaluate(()=>fantasyGame.phase),'serve','Space first pressed while paused cannot launch through autorepeat');await page.keyboard.up('Space');
 await tap('#pause');await tap('#retry');await frame(1);
 await page.evaluate(()=>{const g=fantasyGame;g.villain.hp-=5;g.bricks[0].hp=0;g.state='lost';g.loss='flood';g.reason='Fixture';}); // Staged terminal ownership fixture.
 await frame(1);assert(await page.locator('#result').isVisible());await tap('#continue');await frame(1);
 const continued=await page.evaluate(()=>({hp:fantasyGame.villain.hp,brick:fantasyGame.bricks[0].hp,state:fantasyGame.state,continued:fantasyGame.continued}));
 assert.equal(continued.state,'play');assert.equal(continued.hp,initial.hp-5);assert.equal(continued.brick,0);assert.equal(continued.continued,true);
 await tap('#pause');await tap('#retry');await frame(1);
 assert.deepEqual(ui.errors,[]);assert.deepEqual(ui.network,[]);
 R.cases.push({level,device,mode,initial,launched,cast,retry,continued,errors:ui.errors,network:ui.network});save();console.log(level,device,mode,'UI pass');
}
async function route(ui,policy='ordinary'){
 const{level,device,D,page,down,move,up,frame,tap}=ui,prefix=OUT+'/'+device+'-'+level+'-'+policy;
 if(await page.locator('#result').isVisible())await tap('#again');else{await tap('#pause');await tap('#retry');}await frame(1);
 const field=await page.locator('#game').boundingBox(),start=await page.evaluate(()=>({w:fantasyGame.width,h:fantasyGame.height,paddle:{...fantasyGame.paddle}})),scale=field.width/start.w;
 await down(81,field.x+field.width/2,field.y+field.height*.72);await up(81);await frame(1);
 const history=[],casts=[];let combat=false,stop='240s bound';
 for(let n=0;n<1200;n++){
   const a=await page.evaluate(()=>{const g=fantasyGame,b=g.balls.find(b=>!b.caught&&!b.dead)||g.balls[0],p=g.paddle;
     const fold=x=>{const w=g.width-36,t=((x-18)%(2*w)+2*w)%(2*w);return 18+(t>w?2*w-t:t);};
     let x=b.x;if(b.vy>0){const aim=fold(b.x+b.vx*Math.max(0,(p.y-p.h/2-b.r-b.y)/b.vy));const angle=Math.atan2(g.villain.x-aim,p.y-g.villain.y);x=aim-Math.max(-.8,Math.min(.8,angle/1.05))*p.w/2;}
     const ready=g.canActivate?g.canActivate(g.constructor.name==='Tidewheel'?'anchor':'echo'):g.charge>=100&&!g.anchor&&g.phase==='play'&&['windup','surge'].includes(g.villain.stage);
     for(const q of(g.pulses||[]).filter(q=>!q.reflected)){
       const eta=(p.y-p.h/2-q.r-q.y)/q.vy;
       if(eta>0&&eta<.5){const lane=q.x+q.vx*eta,clear=p.w/2+q.r+8,lo=12+p.w/2,hi=g.width-12-p.w/2;
         if(Math.abs(x-lane)<clear){const choices=[lane-clear,lane+clear].filter(v=>v>=lo&&v<=hi);if(choices.length)x=choices.sort((a,b)=>Math.abs(a-p.x)-Math.abs(b-p.x))[0];}}
     }
     return{x:Math.round(x/8)*8,time:g.time,state:g.state,phase:g.phase,hp:g.villain.hp,lives:g.lives,score:g.score,charge:g.charge,ready,water:g.water?.y,bells:g.bells?.length,remainingBricks:g.bricks.filter(b=>b.hp>0).length};});
   if(a.state!=='play'){stop=a.state;history.push(a);break;}if(a.time>240)break;
   if(!combat&&a.time>20&&a.phase==='play'){await page.screenshot({path:prefix+'-02-earned-combat.png'});combat=true;}
   if(policy==='signature'&&a.ready){await tap('#kit');assert(await page.locator('#cast').isEnabled());await tap('#cast');await frame(1);
     const after=await page.evaluate(()=>({charge:fantasyGame.charge,anchor:!!fantasyGame.anchor,guard:!!fantasyGame.guard}));
     assert.equal(after.charge,0);casts.push({time:a.time,before:a.charge,after});
     if(casts.length===1)await page.screenshot({path:prefix+'-earned-signature.png'});
   }
   await down(81,field.x+a.x*scale,field.y+field.height*.8);await move(81,field.x+a.x*scale,field.y+field.height*.8);await frame(12);await up(81);
   if(n%25===0)history.push(a);
 }
 const final=await page.evaluate(()=>{const g=fantasyGame;return{state:g.state,phase:g.phase,time:g.time,hp:g.villain.hp,lives:g.lives,score:g.score,charge:g.charge,loss:g.loss,reason:g.reason,water:g.water?.y};});
 await page.screenshot({path:prefix+'-03-earned-outcome.png'});
 R.earned.push({level,device,policy,scope:policy==='ordinary'?'One bounded ordinary public-touch policy, quantized predictive paddle placement and fixed-lane water dodge. No power/Continue or HP/resource/actor/progression writes.':'Same public touch policy with signature activated only through actual UI after genuinely earning charge. No Continue or HP/resource/actor/progression writes.',casts,stop,history,final,combat,errors:ui.errors});save();console.log(level,device,policy,final.state,final.time.toFixed(2),final.hp,final.lives);
}
async function machinery(ui){
 const {page,device,frame,down,move,up}=ui,prefix=OUT+'/'+device+'-tidewheel';
 // Explicitly staged mechanism fixture: fresh caught ball and earned resources are not claimed.
 await page.evaluate(()=>{const g=fantasyGame;g.launch();g.balls[0].caught=true;g.time=20;g.teachingDone=true;g.villain.anger=3;g.beginPull();});
 await frame(90);await page.screenshot({path:prefix+'-04-angry-chain-warning-staged.png'});
 const warning=await page.evaluate(()=>({stage:fantasyGame.villain.stage,chain:structuredClone(fantasyGame.chain),claws:fantasyGame.claws.map(c=>({root:c.root,angle:c.angle,grip:c.grip})),water:{...fantasyGame.water},lumi:{...fantasyGame.lumi}}));
 assert.equal(warning.stage,'pullWindup');
 await frame(75);await page.screenshot({path:prefix+'-05-chain-pull-refuge-lowering-staged.png'});
 const pull=await page.evaluate(()=>({stage:fantasyGame.villain.stage,chain:structuredClone(fantasyGame.chain),water:{...fantasyGame.water},lumi:{...fantasyGame.lumi}}));
 assert.equal(pull.lumi.steps,1);assert(pull.water.y<warning.water.y);assert(pull.chain.pull>.8);assert(pull.lumi.y>warning.lumi.y);assert.equal(pull.water.limit,pull.lumi.y+47);
 await frame(90);
 await page.evaluate(()=>fantasyGame.beginPulse());await frame(40);await page.screenshot({path:prefix+'-06-fixed-water-warning-staged.png'});
 const pulseWarn=await page.evaluate(()=>structuredClone(fantasyGame.pulseWarning));assert(pulseWarn?.targetX);
 await frame(70);await page.screenshot({path:prefix+'-07-physical-water-pulse-staged.png'});
 const launched=await page.evaluate(()=>({pulses:structuredClone(fantasyGame.pulses),bricks:fantasyGame.bricks.map(b=>b.hp),lives:fantasyGame.lives}));assert.equal(launched.pulses.length,1);
 await frame(70);const impact=await page.evaluate(()=>({lives:fantasyGame.lives,phase:fantasyGame.phase,bricks:fantasyGame.bricks.map(b=>b.hp)}));
 assert.equal(impact.lives,launched.lives-1);assert.deepEqual(impact.bricks,launched.bricks);
 // New staged warning, followed by a genuine CDP drag to its safe lane.
 await page.evaluate(()=>{const g=fantasyGame;g.launch();g.balls[0].caught=true;g.beginPulse();});
 const dodgeBefore=await page.evaluate(()=>({lives:fantasyGame.lives,target:fantasyGame.pulseWarning.targetX,w:fantasyGame.width}));
 const field=await page.locator('#game').boundingBox(),x=(dodgeBefore.target<180?298:62)/dodgeBefore.w*field.width+field.x,y=field.y+field.height*.8;
 await down(81,x,y);await move(81,x,y);await frame(160);await up(81);
 const dodge=await page.evaluate(()=>({lives:fantasyGame.lives,paddle:fantasyGame.paddle.x}));assert.equal(dodge.lives,dodgeBefore.lives);
 await page.screenshot({path:prefix+'-08-water-dodge-staged.png'});
 R.machinery??=[];R.machinery.push({device,scope:'Explicit staged mechanism state, then actual public touch dodge. No earned-play claim.',warning,pull,pulseWarn,launched,impact,dodge});save();
}
try{
 for(const level of ['tidewheel'])for(const device of probe?['ios']:Object.keys(DS))for(const mode of probe?['easy']:['easy','medium','hard']){
   const ui=await open(level,device,mode);await check(ui);if(level==='tidewheel'&&mode==='easy')await machinery(ui);if(earned&&mode==='easy'){await route(ui);await route(ui,'signature');}await ui.page.close();active=null;
 }
 R.after=seal();R.stable=JSON.stringify(R.before)===JSON.stringify(R.after);R.complete=true;save();assert(R.stable,'source/art remains sealed');
}catch(error){R.failure={message:error.stack,level:active?.level,device:active?.device,mode:active?.mode,errors:active?.errors,network:active?.network};if(active)await active.page.screenshot({path:OUT+'/failure.png'}).catch(()=>{});save();throw error;}
finally{await browser.close();}
