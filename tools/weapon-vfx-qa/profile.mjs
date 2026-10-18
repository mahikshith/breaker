import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
const {chromium}=await import(process.env.PW_MODULE||'playwright'),sha=b=>createHash('sha256').update(b).digest('hex');
const out=process.argv[2]||'out/weapon-vfx-v2/qa/native',raw=JSON.parse(readFileSync(out+'/report.json'));
const result={scope:'Bounded desktop Chromium visual-preview submission + GPU readback timing. Not device frame rate, gameplay or production memory admission.',rawReportSHA256:sha(readFileSync(out+'/report.json')),cases:[],servedBaseline:[],baselineAfter:{},encodedSources:[]};
const served=[['/carrier.html','out/space-selected-review/carrier.html'],['/circuit.html','out/space-selected-review/circuit/circuit.html'],['/forge.html','out/space-selected-review/forge/forge.html'],['/','out/space-selected-review/index.html']];
for(const[route,path]of served){const r=await fetch('http://127.0.0.1:4188'+route);assert.equal(r.status,200);const actual=sha(Buffer.from(await r.arrayBuffer())),expected=sha(readFileSync(path));assert.equal(actual,expected);result.servedBaseline.push({route,path,sha256:actual});}
const browser=await chromium.launch({executablePath:process.env.PW_CHROMIUM,args:['--mute-audio']});
try{for(const device of ['ios','android']){
 const p=await browser.newPage({viewport:device==='ios'?{width:393,height:852}:{width:412,height:915}});
 await p.addInitScript(()=>{window.requestAnimationFrame=fn=>1;});await p.goto('http://127.0.0.1:4189/?device='+device);await p.waitForFunction(()=>window.VFX?.ready,null,{polling:50});
 for(const family of ['helix','reactor']){
  const x=await p.evaluate(({device,family})=>{VFX.setFamily(family);VFX.setDevice(device);const cs=[...document.querySelectorAll('canvas')];const frame=t=>{const start=performance.now();VFX.setTime(t);for(const c of cs)c.getContext('2d').getImageData(0,0,1,1);return performance.now()-start;};for(let i=0;i<16;i++)frame(i/16*5.2);const idle=Array.from({length:40},()=>frame(.1)).sort((a,b)=>a-b),cycle=Array.from({length:100},(_,i)=>frame(i/100*5.2)).sort((a,b)=>a-b);const stats=a=>({median:a[Math.floor(a.length*.5)],p95:a[Math.floor(a.length*.95)],max:a.at(-1),samples:a.length});return{device,family,idle:stats(idle),cycle:stats(cycle),canvasBackingRGBA:cs.reduce((n,c)=>n+c.width*c.height*4,0)};},{device,family});
  result.cases.push(x);
 }await p.close();}
}finally{await browser.close();}
for(const[path,expected]of Object.entries(raw.files)){assert.equal(sha(readFileSync(path)),expected);result.encodedSources.push({path,sha256:expected,bytes:statSync(path).size});}
for(const[path,{expected}]of Object.entries(raw.baseline)){const actual=sha(readFileSync(path));assert.equal(actual,expected);result.baselineAfter[path]=actual;}
result.complete=true;writeFileSync(out+'/validation.json',JSON.stringify(result,null,2));console.log(JSON.stringify({cases:result.cases,baselineFiles:Object.keys(result.baselineAfter).length,servedRoutes:result.servedBaseline.length}));
