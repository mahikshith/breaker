import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const out = 'out/carrier-companion-proof';
const manifest = JSON.parse(readFileSync('assets/space-companions/manifest.json'));
const hash = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const uri = path => 'data:image/png;base64,' + readFileSync(path).toString('base64');
const backgrounds = Object.fromEntries(['ios', 'android'].map(d => [d, uri(`out/carrier-playable-final/${d}-00-opening.png`)]));
const atlas = Object.fromEntries(Object.entries(manifest.families).map(([name, family]) => [name, uri(family.atlas)]));
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Carrier companion native animation proof</title><style>html,body{margin:0;background:#090f1d;overflow:hidden}canvas{display:block} </style><canvas></canvas><script>
const manifest=${JSON.stringify(manifest)}, backgrounds=${JSON.stringify(backgrounds)}, atlas=${JSON.stringify(atlas)};
const device=new URLSearchParams(location.search).get('device')||'ios', dims=device==='ios'?{w:393,h:852,top:59,bottom:34}:{w:412,h:915,top:32,bottom:24};
const canvas=document.querySelector('canvas'),g=canvas.getContext('2d');canvas.width=dims.w;canvas.height=dims.h;
const images={};let ready=false,t=0,running=false,last=0;
function load(id,url){return new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>{images[id]=i;resolve()};i.onerror=()=>reject(Error('decode '+id));i.src=url})}
function sprite(id,frame,x,y,w,h){const f=manifest.families[id],c=f.cell;g.drawImage(images[id],frame%f.columns*c[0],Math.floor(frame/f.columns)*c[1],c[0],c[1],x-f.pivot[0]*w,y-f.pivot[1]*h,w,h)}
function draw(time){
 t=time;g.clearRect(0,0,dims.w,dims.h);g.drawImage(images.bg,0,0,dims.w,dims.h);
 const x=40,y=dims.h-dims.bottom-40;
 g.fillStyle='#151b33';g.beginPath();g.arc(x,y,26,0,Math.PI*2);g.fill();
 g.strokeStyle='#9b719f';g.lineWidth=2;g.beginPath();g.arc(x,y,26,-Math.PI/2,-Math.PI/2+Math.PI*2*(time>=.6?.05:1-time/.6));g.stroke();
 const seq=manifest.families.nix.clips.command.frames, ni=seq[Math.min(seq.length-1,Math.floor(time*10))];sprite('nix',ni,x,y,52,52);
 const s=dims.w/360, origin=dims.top-34*s, tx=178.7*s,ty=origin+315*s, ti=Math.min(7,Math.floor(time*10));
 sprite('tick',ti,tx,ty,40*s,40*s);
 if(time>=.8){const lx=(178.7+12)*s,ly=origin+(328.2+5)*s;g.strokeStyle='#97e9b0';g.lineWidth=2;g.lineCap='round';g.beginPath();g.moveTo(lx-3,ly);g.lineTo(lx,ly+3);g.lineTo(lx+5,ly-4);g.stroke()}
}
function frame(now){if(running){draw((now-last)/1000);if(t<1.2)requestAnimationFrame(frame);else running=false}}
window.__companions={ready:false,draw,play(){last=performance.now();running=true;requestAnimationFrame(frame)},inspect(){return{device,dims,source:'Frozen Carrier composition plus candidate companion sprites; no gameplay integration',nix:{cell:manifest.families.nix.cell,displayCSS:52,pivot:manifest.families.nix.pivot,centre:[40,dims.h-dims.bottom-40]},tick:{cell:manifest.families.tick.cell,displayWorld:[40,40],pivot:manifest.families.tick.pivot,footAnchorCSS:[178.7*dims.w/360,dims.top-34*dims.w/360+315*dims.w/360]},allDecoded:Object.values(images).every(i=>i.complete&&i.naturalWidth),t}}};
Promise.all([load('bg',backgrounds[device]),...Object.keys(atlas).map(id=>load(id,atlas[id]))]).then(()=>{draw(0);window.__companions.ready=true});
</script></html>`;
writeFileSync(`${out}/preview.html`, html);
const { chromium } = await import(process.env.PW_MODULE || 'playwright');
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM });
const report={scope:'Composition and animation proof only; no runtime, gameplay or APK admission',htmlSHA256:hash(`${out}/preview.html`),families:Object.fromEntries(Object.entries(manifest.families).map(([name,f])=>[name,{sha256:hash(f.atlas),frames:f.frames.length,display:f.display,pivot:f.pivot}])),devices:{}};
try{
 for(const [device,width,height] of [['ios',393,852],['android',412,915]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(resolve(`${out}/preview.html`)).href+'?device='+device);await page.waitForFunction(()=>window.__companions?.ready,null,{polling:50});
  for(const [name,time]of [['neutral',0],['command',.21],['clamp',.4],['secured',.85]]){await page.evaluate(t=>window.__companions.draw(t),time);await page.screenshot({path:
   `${out}/${device}-${name}.png`});}
  await page.evaluate(()=>window.__companions.play());await page.waitForFunction(()=>window.__companions.inspect().t>=.8,null,{polling:20});
  const inspection=await page.evaluate(()=>window.__companions.inspect());assert(inspection.allDecoded);assert.equal(inspection.nix.displayCSS,52);assert.deepEqual(errors,[]);
  report.devices[device]={...inspection,errors,screenshots:Object.fromEntries(['neutral','command','clamp','secured'].map(n=>[n,hash(`${out}/${device}-${n}.png`)]))};await page.close();
 }
}finally{await browser.close()}
writeFileSync(`${out}/proof-report.json`,JSON.stringify(report,null,2)+'\n');
console.log('Both native companion compositions decoded without errors. Static/animation proof only.');
