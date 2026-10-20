import assert from 'node:assert/strict';import fs from'node:fs';import crypto from'node:crypto';
const{chromium}=await import(process.env.PW_MODULE||'playwright');const out=process.env.OUT_DIR||'out/bellforge-playtest', base=process.env.BASE_URL||'http://127.0.0.1:4194', uiOnly=process.argv.includes('--ui-only');fs.mkdirSync(out,{recursive:true});
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const files=['src/fantasy/bellforge.js','prototypes/fantasy/main.js','prototypes/fantasy/render.js','prototypes/fantasy/style.css','assets/fantasy-machinery/manifest.json','assets/fantasy-machinery/nerra-v2-manifest.json','tools/playtest/bellforge.mjs','tools/playtest/bellforge-policy.mjs'];
const seal=()=>Object.fromEntries(files.map(p=>[p,sha(p)]));
const report={scope:'Fresh Chromium per case; real standalone page and touch controls at phone sizes. Kit charge fixture is staged. Earned routes read geometry and use only public launch/setTarget/update, with no charge, HP, positions, lives or progression writes. Not physical-device or human-balance proof.',before:seal(),cases:[],earned:[],complete:false};const save=()=>fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2));
const devices=[['ios',393,852],['android',412,915]];
async function open(device,width,height,mode){
 const browser=await chromium.launch({args:['--mute-audio'],...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})}),page=await browser.newPage({viewport:{width,height},deviceScaleFactor:2,hasTouch:true}),errors=[],http=[];
 page.on('pageerror',e=>errors.push(e.stack||e.message));page.on('response',r=>{if(r.status()>=400&&!r.url().includes('favicon'))http.push([r.status(),r.url()]);});
 await page.addInitScript(()=>{requestAnimationFrame=fn=>{window.__fantasyFrame=fn;return 1;};});
 try{await page.goto(base+'/prototypes/fantasy/?level=bellforge');await page.waitForFunction(()=>!document.getElementById('start').disabled&&window.__fantasyFrame,null,{timeout:30000,polling:50});}
 catch(e){console.log('LOAD',device,mode,errors,http,await page.locator('#error').textContent());await browser.close();throw e;}
 await page.evaluate(async()=>{window.normalBell=(await import('/tools/playtest/bellforge-policy.mjs')).normal;let now=performance.now();window.FQ={frame(n=1){now=Math.max(now,performance.now());for(let i=0;i<n;i++)__fantasyFrame(now+=1000/60);},snap(){return JSON.stringify(fantasyGame,(_,v)=>v instanceof Set?[...v]:v);}};FQ.frame(2);});
 const tap=async s=>{await page.locator(s).tap();await page.waitForTimeout(30);},frame=n=>page.evaluate(n=>FQ.frame(n),n),shot=key=>page.screenshot({path:out+'/'+device+'-'+key+'.png'});
 await tap('[data-mode="'+mode+'"]');await tap('#start');await frame(1);assert.equal(await page.evaluate(()=>fantasyGame.difficulty),mode);
 return{browser,page,errors,http,tap,frame,shot};
}
for(const[device,width,height]of devices)for(const mode of['easy','medium','hard']){
 const u=await open(device,width,height,mode);const{page,tap,frame,shot}=u;
 try{
 await shot(mode+'-opening');const cdp=await page.context().newCDPSession(page),rect=await page.locator('#game').boundingBox(),p=await page.evaluate(()=>({...fantasyGame.paddle,height:fantasyGame.height}));
 const touch={id:1,x:rect.x+rect.width/2,y:rect.y+rect.height*p.y/p.height,radiusX:3,radiusY:3,force:1};await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[touch]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...touch,x:rect.x+rect.width*.65}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await frame(2);
 assert.equal(await page.evaluate(()=>fantasyGame.phase),'play');assert.ok(await page.evaluate(()=>fantasyGame.paddle.targetX>220));
 await tap('#pause');assert.equal(await page.evaluate(()=>fantasyGame.paused),true);const snap=await page.evaluate(()=>FQ.snap());await frame(90);assert.ok((await page.evaluate(()=>FQ.snap()))===snap,'paused entire model freezes');await tap('#resume');await frame(2);
 await tap('#pause');await tap('#retry');await frame(1);assert.deepEqual(await page.evaluate(()=>[fantasyGame.phase,fantasyGame.score,fantasyGame.charge,fantasyGame.continued]),['serve',0,0,false]);
 await page.evaluate(()=>{for(let i=0;i<120*10.82;i++)normalBell(fantasyGame);fantasyGame.charge=100;});await frame(1);await tap('#kit');assert.equal(await page.locator('#cast').isEnabled(),true);const powerSnap=await page.evaluate(()=>FQ.snap());await frame(60);assert.ok((await page.evaluate(()=>FQ.snap()))===powerSnap,'chooser freezes all clocks');await tap('#cast');await frame(1);assert.ok(await page.evaluate(()=>fantasyGame.guard));assert.equal(await page.evaluate(()=>fantasyGame.charge),0);await shot(mode+'-echo-staged');
 await tap('#pause');await tap('#home');assert.equal(await page.locator('#menu').isVisible(),true);
 const item={device,mode,touch:true,pauseFreeze:true,retry:true,menuReturn:true,kit:'staged full-charge actual tap, pause eligibility, freeze, consumption',bricks:await page.evaluate(()=>fantasyGame.bricks.filter(b=>b.type==='brick').length),world:await page.evaluate(()=>({height:fantasyGame.height,paddleY:fantasyGame.paddle.y})),errors:u.errors,http:u.http};report.cases.push(item);save();assert.deepEqual(u.errors,[]);assert.deepEqual(u.http,[]);console.log('UI',device,mode,'PASS');
 }finally{await u.browser.close();}
}
if(!uiOnly)for(const[device,width,height]of devices){const u=await open(device,width,height,'easy');const{page,frame,shot}=u;try{
 const captured=new Set();for(let n=0;n<1200;n++){const s=await page.evaluate(()=>{for(let i=0;i<12&&fantasyGame.state==='play';i++)normalBell(fantasyGame);return{state:fantasyGame.state,phase:fantasyGame.phase,stage:fantasyGame.villain.stage,bells:fantasyGame.bells.map(b=>({ramp:b.rampId})),steps:fantasyGame.lumi.steps};});for(const[key,yes]of[['windup',s.stage==='windup'],['release',s.stage==='release'],['rolling',s.bells.some(b=>b.ramp==='ramp-1')],['ratchet',s.steps>0],['rescue',s.phase==='rescue']])if(yes&&!captured.has(key)){await frame(1);await shot('earned-'+key);captured.add(key);}if(s.state!=='play')break;}
 await frame(2);await shot('earned-result');const result=await page.evaluate(()=>({state:fantasyGame.state,time:fantasyGame.time,hp:fantasyGame.villain.hp,lives:fantasyGame.lives,steps:fantasyGame.lumi.steps,score:fantasyGame.score,continued:fantasyGame.continued,guard:fantasyGame.guard}));report.earned.push({device,...result,captured:[...captured],errors:u.errors,http:u.http});save();console.log('EARNED',device,JSON.stringify(result));assert.equal(result.state,'won');assert.equal(result.continued,false);assert.equal(result.guard,null);assert.deepEqual(u.errors,[]);assert.deepEqual(u.http,[]);
 }finally{await u.browser.close();}}
report.after=seal();report.complete=true;save();console.log('COMPLETE',report.cases.length,report.earned.length);