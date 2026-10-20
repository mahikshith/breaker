import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const {chromium}=await import(process.env.PW_MODULE);
const OUT=process.argv[2]||'out/tidewheel-frame-profile';mkdirSync(OUT,{recursive:true});
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const source=()=>Object.fromEntries(['src/fantasy/tidewheel.js','src/fantasy/tidewheel-v2-geometry.js','prototypes/fantasy/main.js','prototypes/fantasy/render.js','assets/fantasy-machinery/manifest.json'].map(p=>[p,sha(p)]));
const report={scope:'Bounded real requestAnimationFrame,4 gameplay seconds per desktop Chromium phone viewport, DPR2. Callback CPU/submission cost and browser cadence only; no physical-phone/GPU completion/memory/frame-rate guarantee. No concurrent benchmark load is intended.',before:source(),phones:[]};
const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM,args:['--mute-audio']});
try{for(const [device,viewport]of Object.entries({ios:{width:393,height:852},android:{width:412,height:915}})){
 const p=await b.newPage({viewport,deviceScaleFactor:2,hasTouch:true}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{const raf=requestAnimationFrame.bind(window);window.__costs=[];window.requestAnimationFrame=fn=>raf(t=>{const start=performance.now();fn(t);__costs.push({t,cpu:performance.now()-start});});});
 await p.goto('http://127.0.0.1:4194/prototypes/fantasy/?level=tidewheel');await p.waitForFunction(()=>!document.getElementById('start').disabled,null,{polling:50,timeout:45000});
 await p.locator('#start').tap();const field=await p.locator('#game').boundingBox();await p.touchscreen.tap(field.x+field.width/2,field.y+field.height*.72);
 const start=await p.evaluate(()=>{__costs=[];return fantasyGame.time;});await p.waitForFunction(start=>fantasyGame.time>start+4,start,{polling:50,timeout:15000});
 const sample=await p.evaluate(()=>({costs:__costs,gameTime:fantasyGame.time,targets:fantasyGame.targets().length,actorDisks:fantasyGame.targets().filter(t=>t.kind==='shell'||t.kind==='claw').length,phase:fantasyGame.phase,state:fantasyGame.state}));
 const stats=a=>{a.sort((a,b)=>a-b);return{n:a.length,min:a[0],median:a[Math.floor(a.length*.5)],p95:a[Math.floor(a.length*.95)],p99:a[Math.floor(a.length*.99)],max:a.at(-1),mean:a.reduce((a,b)=>a+b,0)/a.length};};
 report.phones.push({device,viewport,stats:{callbackCPUms:stats(sample.costs.map(c=>c.cpu)),RAFIntervalMs:stats(sample.costs.slice(1).map((c,i)=>c.t-sample.costs[i].t))},...sample,errors});
 await p.screenshot({path:OUT+'/'+device+'-live-profile.png'});await p.close();
}}finally{await b.close();}
report.after=source();report.stable=JSON.stringify(report.before)===JSON.stringify(report.after);writeFileSync(OUT+'/report.json',JSON.stringify(report,null,2));
console.log(report.phones.map(p=>({device:p.device,targets:p.targets,actorDisks:p.actorDisks,stats:p.stats,errors:p.errors})),report.stable);
