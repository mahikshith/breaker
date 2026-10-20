import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const {chromium}=await import(process.env.PW_MODULE||'playwright');
const out=process.env.OUT_DIR||'out/bellforge-defeat-review',base=process.env.BASE_URL||'http://127.0.0.1:4194';
fs.mkdirSync(out,{recursive:true});
const paths=['src/fantasy/bellforge.js','prototypes/fantasy/main.js','prototypes/fantasy/layout.js','prototypes/fantasy/style.css','prototypes/fantasy/render.js','assets/fantasy-machinery/manifest.json','assets/fantasy-machinery/nerra-v2-manifest.json','assets/fantasy-machinery/water-shot-manifest.json'];
const reactionPath='assets/fantasy-machinery/reactions-manifest.json';
if(fs.existsSync(reactionPath)){
 paths.push(reactionPath);
 const reactions=JSON.parse(fs.readFileSync(reactionPath,'utf8'));
 for(const family of ['nerra','korr'])for(const item of Object.values(reactions[family])){
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(item.path)).digest('hex'),item.sha256,'reaction manifest source matches');
  paths.push(item.path);
 }
}
const seal=()=>Object.fromEntries(paths.filter(p=>fs.existsSync(p)).map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]));
const report={scope:'Independent real-page responsive controls and explicitly staged defeat visual timeline. Final HP is removed by the fixture, never claimed as an earned win. No human-balance, physical-device or performance claim. Per-case source stamps disclose concurrent edits.',cases:[],complete:false};
const save=()=>fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2)+'\n');
const sizes=process.argv.includes('--phones')?[[393,852],[412,915]]:[[393,852],[412,915],[320,568],[1280,600],[900,400],[852,393]];
for(const[width,height]of sizes){
 const before=seal(),browser=await chromium.launch({args:['--mute-audio'],...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 const page=await browser.newPage({viewport:{width,height},hasTouch:true,deviceScaleFactor:2}),errors=[],http=[];
 page.on('pageerror',e=>errors.push(e.stack||e.message));page.on('response',r=>{if(r.status()>=400&&!r.url().includes('favicon'))http.push([r.status(),r.url()]);});
 const item={width,height,before,errors,http};report.cases.push(item);save();
 try{
  await page.addInitScript(()=>requestAnimationFrame=f=>{window.__defeatFrame=f;return 1;});
  await page.goto(base+'/prototypes/fantasy/?level=bellforge');
  await page.waitForFunction(()=>!document.getElementById('start').disabled&&window.__defeatFrame,null,{polling:50,timeout:30000});
  await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(()=>{let now=performance.now();window.DQ={advance(seconds=1/60){for(let t=0;t<seconds-1e-10;){const dt=Math.min(1/60,seconds-t);__defeatFrame(now+=dt*1000);t+=dt;}},snap(){return JSON.stringify(fantasyGame,(_,v)=>v instanceof Set?[...v]:v);}};});
  const tap=async selector=>{await page.locator(selector).tap();await page.waitForTimeout(20);};
  await tap('#start');await page.evaluate(()=>DQ.advance());
  item.layout=await page.evaluate(()=>{const g=fantasyGame,c=document.getElementById('game').getBoundingClientRect(),k=document.getElementById('kit').getBoundingClientRect();return{worldHeight:g.height,paddleY:g.paddle.y,canvas:{x:c.x,y:c.y,w:c.width,h:c.height},orb:{x:k.x,y:k.y,w:k.width,h:k.height},paddleBottom:c.y+(g.paddle.y+g.paddle.h)/g.height*c.height};});
  assert.ok(item.layout.worldHeight>=700&&item.layout.paddleY>=580);
  assert.ok(item.layout.orb.y>item.layout.paddleBottom+2,'orb clears actual paddle vertically');
  assert.ok(item.layout.orb.x>=0&&item.layout.orb.y>=0&&item.layout.orb.y+item.layout.orb.h<=height+.1);
  await page.screenshot({path:`${out}/${width}x${height}-opening.png`});
  const cdp=await page.context().newCDPSession(page),c=item.layout.canvas;
  const touch={id:1,x:c.x+c.w/2,y:c.y+item.layout.paddleY/item.layout.worldHeight*c.h,radiusX:3,radiusY:3,force:1};
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[touch]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...touch,x:c.x+c.w*.68}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.evaluate(()=>DQ.advance(.08));
  assert.equal(await page.evaluate(()=>fantasyGame.phase),'play');assert.ok(await page.evaluate(()=>fantasyGame.paddle.targetX>230));
  await tap('#pause');assert.equal(await page.evaluate(()=>fantasyGame.paused),true);
  const frozen=await page.evaluate(()=>DQ.snap());await page.evaluate(()=>DQ.advance(.5));assert.equal(await page.evaluate(()=>DQ.snap()),frozen);
  await tap('#resume');const t=await page.evaluate(()=>fantasyGame.time);await page.evaluate(()=>DQ.advance(.1));assert.ok(await page.evaluate(t=>fantasyGame.time>t+.09,t));
  await tap('#kit');assert.equal(await page.locator('#power').isVisible(),true);assert.equal(await page.locator('#cast').isEnabled(),false);await tap('#close-power');
  await tap('#pause');await tap('#retry');await page.evaluate(()=>DQ.advance());
  assert.deepEqual(await page.evaluate(()=>[fantasyGame.phase,fantasyGame.score,fantasyGame.charge,fantasyGame.continued,fantasyGame.villain.defeat]),['serve',0,0,false,null]);
  item.controls={normalTouchLaunch:true,firstPauseAfterDrag:true,pauseFreeze:true,resumeAdvances:true,orbOpens:true,freshRetry:true};
  if(width===393||width===412){
   await page.evaluate(()=>{fantasyGame.hitVillain(fantasyGame.villain.hp,false);});
   item.stagedDefeat=[];
   for(const[target,label]of[[.22,'stagger'],[.78,'slump'],[1.35,'dazed'],[2.2,'escape'],[3.5,'result']]){
    const age=await page.evaluate(()=>fantasyGame.villain.defeat.age);await page.evaluate(dt=>DQ.advance(dt),Math.max(0,target-age));
    const s=await page.evaluate(()=>({state:fantasyGame.state,phase:fantasyGame.phase,defeat:{...fantasyGame.villain.defeat},escape:fantasyGame.lumi.escape,bells:fantasyGame.bells.length,pendingDocks:fantasyGame.pendingDocks.length,body:fantasyGame.villain.body.length}));
    assert.equal(s.bells+s.pendingDocks+s.body,0);if(target<1.6)assert.equal(s.escape,0);if(label==='result')assert.equal(s.state,'won');
    await page.screenshot({path:`${out}/${width}x${height}-${label}-staged.png`});item.stagedDefeat.push({label,...s});
   }
   await tap('#again');await page.evaluate(()=>DQ.advance());assert.equal(await page.evaluate(()=>fantasyGame.villain.defeat),null);
  }
  assert.deepEqual(errors,[]);assert.deepEqual(http,[]);item.after=seal();item.unchangedDuringCase=JSON.stringify(before)===JSON.stringify(item.after);item.pass=true;
  save();console.log('PASS',width,height,item.unchangedDuringCase?'source-stable':'concurrent-source-change');
 }catch(e){item.failure=e.stack||String(e);item.after=seal();save();throw e;}finally{await browser.close();}
}
report.complete=true;save();console.log(JSON.stringify({complete:true,cases:report.cases.length,out}));
