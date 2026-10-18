import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const {chromium}=await import(process.env.PW_MODULE||'playwright');
const out=process.argv[2]||'out/weapon-vfx-v2/qa/native';mkdirSync(out,{recursive:true});
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const baseline=JSON.parse(readFileSync('out/weapon-vfx-v2/baseline.json'));
const sealed=['tools/weapon-vfx-review/review.js','tools/weapon-vfx-review/index.html','out/weapon-vfx-v2/selection.json','out/weapon-vfx-v2/scenes.json','design/phase1/weapon-vfx-v2/manifest.json','design/phase1/weapon-vfx-v2/payload-A.png','design/phase1/weapon-vfx-v2/payload-B.png','design/phase1/weapon-vfx-v2/helix-charge.png','design/phase1/weapon-vfx-v2/reactor-charge.png'];
const report={scope:'Independent native visual-study QA. Deterministic actual renderer samples and review controls, not gameplay or native-device performance.',startedAt:new Date().toISOString(),files:Object.fromEntries(sealed.map(p=>[p,sha(p)])),baseline:{},cases:[],controls:[],errors:[],httpErrors:[],networkFailures:[]};
for(const[p,expected]of Object.entries(baseline.files)){report.baseline[p]={expected,actual:sha(p)};assert.equal(sha(p),expected,p);}
const browser=await chromium.launch({executablePath:process.env.PW_CHROMIUM,args:['--mute-audio']});
try{
for(const[device,D]of Object.entries({ios:{width:393,height:852},android:{width:412,height:915}})){
 const page=await browser.newPage({viewport:D,deviceScaleFactor:1,hasTouch:true});
 page.on('pageerror',e=>report.errors.push({device,error:e.stack||e.message}));page.on('response',r=>{if(r.status()>=400)report.httpErrors.push({device,url:r.url(),status:r.status()});});
 page.on('requestfailed',r=>report.networkFailures.push({device,url:r.url(),error:r.failure()}));
 await page.addInitScript(()=>{window.__qaNow=performance.now();window.requestAnimationFrame=fn=>{window.__qaFrame=fn;return 1;};window.__qaStep=dt=>{window.__qaNow+=dt;window.__qaFrame(__qaNow);};const Old=Image;window.__qaImages=[];window.Image=class extends Old{constructor(){super();__qaImages.push(this);}};});
 await page.goto('http://127.0.0.1:4189/?device='+device);await page.waitForFunction(()=>window.VFX?.ready,null,{polling:50});await page.evaluate(async()=>{await document.fonts.ready;__qaNow=performance.now();__qaStep(0);});
 // Real DOM controls with deterministic RAF clock; screenshots below use the public study API.
 await page.locator('[data-family="reactor"]').click({force:true});assert.equal(await page.evaluate(()=>VFX.family),'reactor');
 await page.locator('[data-family="helix"]').click({force:true});assert.equal(await page.evaluate(()=>VFX.family),'helix');
 const other=device==='ios'?'android':'ios';await page.selectOption('#device',other);assert.equal(await page.evaluate(()=>VFX.device),other);await page.selectOption('#device',device);assert.equal(await page.evaluate(()=>VFX.device),device);
 for(const boss of ['carrier','circuit','forge']){await page.locator(`[data-boss="${boss}"]`).click({force:true});const visible=await page.locator('.phone:visible').getAttribute('data-kind');assert.equal(visible,boss);}
 await page.locator('#replay').click({force:true});await page.evaluate(()=>__qaStep(100));const one=await page.evaluate(()=>VFX.time);
 await page.selectOption('#speed','0.5');await page.locator('#replay').click({force:true});await page.evaluate(()=>__qaStep(100));const half=await page.evaluate(()=>VFX.time);assert.ok(Math.abs(half*2-one)<.001,'half-speed ratio');
 await page.locator('#scrub').evaluate(el=>{el.value='1.25';el.dispatchEvent(new Event('input',{bubbles:true}));});const scrub=await page.evaluate(()=>({time:VFX.time,label:document.querySelector('#play').textContent}));
 await page.evaluate(()=>__qaStep(100));assert.equal(await page.evaluate(()=>VFX.time),scrub.time,'scrub pauses');
 const labelOK=scrub.label==='Play';assert.ok(labelOK,'paused scrub label');report.controls.push({device,families:true,deviceToggle:true,threeBossSelectors:true,replay:true,halfSpeed:{normal:one,half},scrubPaused:true,scrubLabel:scrub.label,labelOK,nativeOverflow:await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)});
 await page.locator('#play').click({force:true});await page.evaluate(()=>__qaStep(100));assert.ok(await page.evaluate(()=>VFX.time)>scrub.time,'play resumes');
 await page.locator('#play').click({force:true});await page.evaluate(()=>VFX.setTime(1.25));
 await page.screenshot({path:`${out}/${device}-review-controls.png`,fullPage:true});
 for(const family of ['helix','reactor']){
  await page.evaluate(({family,device})=>{VFX.setFamily(family);VFX.setDevice(device);},{family,device});
  const timeline=await page.evaluate(()=>VFX.timeline),t=timeline;
  const samples=[['idle',.1],['gather',.9],['charged',t.fire-.025],['eject',t.fire+.08],['travel',(t.fire+t.impact)/2],['contact-before',t.impact-.015],['contact',t.impact+.04],['impact-spread',t.impact+.16],['impact-decay',t.impact+.30],['cool',t.cool+.1],['ready',t.end+.15]];
  const frames=[];
  for(const[name,time]of samples){await page.evaluate(t=>VFX.setTime(t),time);const data=await page.evaluate(()=>[...document.querySelectorAll('.phone')].map(p=>({boss:p.dataset.kind,png:p.querySelector('canvas').toDataURL('image/png').split(',')[1]})));for(const f of data){const path=`${out}/${family}-${device}-${f.boss}-${name}.png`;writeFileSync(path,Buffer.from(f.png,'base64'));frames.push({boss:f.boss,name,time,path,sha256:sha(path)});}}
  const perf=await page.evaluate(()=>{const test=values=>values.map(t=>{const start=performance.now();VFX.setTime(t);return performance.now()-start;}).sort((a,b)=>a-b);for(let i=0;i<12;i++)VFX.setTime(i/12*VFX.timeline.duration);const idle=test(Array(80).fill(.1)),cycle=test(Array.from({length:160},(_,i)=>i/160*VFX.timeline.duration));const stats=a=>({median:a[Math.floor(a.length*.5)],p95:a[Math.floor(a.length*.95)],max:a.at(-1),samples:a.length});return{idle:stats(idle),cycle:stats(cycle),metrics:VFX.metrics,images:__qaImages.filter(i=>i.complete&&i.naturalWidth).map(i=>({url:i.src,width:i.naturalWidth,height:i.naturalHeight,decodedRGBA:i.naturalWidth*i.naturalHeight*4}))};});
  const motion=await page.evaluate(async()=>{
   const scenes=await (await fetch('/scenes.json')).json(),hash=a=>{let h=2166136261;for(let i=0;i<a.length;i++)h=Math.imul(h^a[i],16777619);return(h>>>0).toString(16);},result=[];
   const areas=[...document.querySelectorAll('.phone')].map(p=>{const s=scenes.scenes[p.dataset.kind+'-'+VFX.device],scale=s.scale*2;return{boss:p.dataset.kind,c:p.querySelector('canvas'),weapon:[Math.round((s.offsetX+s.pose.x*s.scale)*2-70),Math.round((s.offsetY+s.pose.y*s.scale)*2-70),140,170],target:[Math.round((s.offsetX+s.target.rect.x*s.scale)*2-10),Math.round((s.offsetY+s.target.rect.y*s.scale)*2-25),Math.round(s.target.rect.w*scale+35),90]};});
   for(let i=0;i<=156;i++){const t=i/30;VFX.setTime(t);result.push({time:t,bosses:areas.map(s=>{const g=s.c.getContext('2d');return{boss:s.boss,weaponHash:hash(g.getImageData(...s.weapon).data),targetHash:hash(g.getImageData(...s.target).data),backgroundHash:hash(g.getImageData(20,1000,24,24).data)};})});}
   return{fps:30,duration:5.2,samples:result};
  });
  report.cases.push({device,D,family,timeline,frames,performance:perf,motion});
 }
 await page.close();
}
for(const[p,hash]of Object.entries(report.files))assert.equal(sha(p),hash,'review changed during capture: '+p);
for(const[p,expected]of Object.entries(baseline.files)){assert.equal(sha(p),expected,p);report.baseline[p].after=sha(p);}
report.completedAt=new Date().toISOString();report.completed=true;writeFileSync(out+'/report.json',JSON.stringify(report,null,2));
assert.deepEqual(report.errors,[]);console.log(JSON.stringify({completed:true,cases:report.cases.length,baselineFiles:Object.keys(report.baseline).length,controls:report.controls,httpErrors:report.httpErrors,reviewSHA:report.files['tools/weapon-vfx-review/review.js']}));
}finally{await browser.close();}
