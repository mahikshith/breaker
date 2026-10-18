// Isolated C hull/hangar presentation. No gameplay import or active bundle mutation.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const out=resolve('out/orbital-art-proof');mkdirSync(out,{recursive:true});
const manifest=JSON.parse(readFileSync('assets/space-c/machinery.json','utf8'));
const data={...manifest,parts:Object.fromEntries(manifest.parts.map(p=>[p.id,{...p,url:`data:image/png;base64,${readFileSync(p.path).toString('base64')}`}]))};
data.reference=`data:image/png;base64,${readFileSync('art/space/source/orbital-hull-reference.png').toString('base64')}`;
const font=readFileSync('out/brum-proof/LilitaOne-Regular.ttf').toString('base64');

function renderer(){
  const M=JSON.parse(document.querySelector('#data').textContent),P=M.parts,images={};
  const cv=document.querySelector('canvas'),g=cv.getContext('2d'),native=new URLSearchParams(location.search).get('device')||'ios';
  const D=native==='android'?{w:412,h:915,t:32,b:24}:{w:393,h:852,t:59,b:34};
  const W=360,FH=Math.round(360*D.h/D.w),s=Math.min(D.w/W,D.h/FH),top=D.t/s-34;
  const layer=document.createElement('canvas');[layer.width,layer.height]=P.hull.size;
  const lg=layer.getContext('2d'),doors=document.createElement('canvas');[doors.width,doors.height]=P.hull.size;
  const dg=doors.getContext('2d'),[x0,y0,x1,y1]=M.assembly.aperturePx,bw=x1-x0,bh=y1-y0,seam=(x0+x1)/2,cy=(y0+y1)/2;
  let pose=0,auto=true;
  const fit=(ctx,img,rect)=>{const[x,y,w,h]=rect,k=Math.max(w/img.width,h/img.height);ctx.drawImage(img,x+(w-img.width*k)/2,y+(h-img.height*k)/2,img.width*k,img.height*k);};
  function shutters(open){
    dg.clearRect(0,0,doors.width,doors.height);
    const k=Math.max(bw/M.assembly.pairVisibleSize[0],bh/M.assembly.pairVisibleSize[1])*1.1,travel=open*M.assembly.doorTravelPx;
    for(const[id,sign]of[['door_left',-1],['door_right',1]]){const p=P[id],w=p.size[0]*k,h=p.size[1]*k;dg.drawImage(images[id],seam+sign*travel-p.pivot[0]*w,cy-p.pivot[1]*h,w,h);}
  }
  function assembly(open){
    shutters(open);lg.clearRect(0,0,layer.width,layer.height);
    fit(lg,images.bay_back,[x0,y0,bw,bh]);lg.drawImage(doors,0,0);
    lg.globalCompositeOperation='destination-in';lg.drawImage(images.bay_mask,0,0);lg.globalCompositeOperation='source-over';
    lg.drawImage(images.hull,0,0);return layer;
  }
  function draw(open=pose,reference=false){
    pose=open;cv.width=D.w*2;cv.height=D.h*2;g.setTransform(2*s,0,0,2*s,0,2*s*top);g.fillStyle='#060a13';g.fillRect(0,-top,W,D.h/s);
    if(reference)g.drawImage(images.reference,0,72+2*360/608,360,256*360/608);
    else g.drawImage(assembly(open),0,M.assembly.worldTop,360,M.assembly.displayHeight);
    g.textAlign='center';g.textBaseline='middle';g.fillStyle='#c0d1df';g.font='17px "Lilita One"';g.fillText(reference?'APPROVED C REFERENCE':'C MACHINERY · ASSET PROOF',180,45);
    g.fillStyle='#91a0b4';g.font='12px "Lilita One"';g.fillText(reference?'Original crop · barrels and fighters included':'Separate hull / bay / shutters · no gameplay',180,246);
    if(!reference){g.fillText(open<.01?'CLOSED':open>.99?'OPEN':'RETRACTING',180,267);g.fillStyle='#657188';g.fillText('Other C assets and runtime admission pending',180,292);}
  }
  async function init(){
    await Promise.all([...Object.entries(P).map(async([id,p])=>{const im=new Image();im.src=p.url;await im.decode();images[id]=im;}),(async()=>{const im=new Image();im.src=M.reference;await im.decode();images.reference=im;})()]);
    await document.fonts.load('17px "Lilita One"');draw();window.CA={set(open){auto=false;draw(Math.max(0,Math.min(1,open)));},reference(){auto=false;draw(1,true);},source(open){auto=false;return assembly(open).toDataURL('image/png');},metrics(){const m=images.bay_mask;lg.clearRect(0,0,layer.width,layer.height);lg.drawImage(m,0,0);const mask=lg.getImageData(0,0,layer.width,layer.height).data;const counts={area:0,closedGaps:0,openDoorLeak:0};shutters(0);const closed=dg.getImageData(0,0,doors.width,doors.height).data;shutters(1);const opened=dg.getImageData(0,0,doors.width,doors.height).data;for(let i=3;i<mask.length;i+=4)if(mask[i]>250){counts.area++;if(closed[i]<230)counts.closedGaps++;if(opened[i]>8)counts.openDoorLeak++;}return{...counts,closedCoverage:1-counts.closedGaps/counts.area,...M.assembly,viewport:D,sceneScale:s};}};
    let start=performance.now();function frame(t){if(auto){const q=((t-start)/1000)%6;draw(q<1?0:q<2?(q-1):q<4?1:q<5?5-q:0);}requestAnimationFrame(frame);}requestAnimationFrame(frame);
  }
  document.addEventListener('pointerdown',()=>{auto=!auto;});init();
}
const html=`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>C machinery asset proof</title><style>@font-face{font-family:'Lilita One';src:url(data:font/ttf;base64,${font})}html,body{margin:0;background:#060a13}canvas{display:block;width:100vw;height:100vh}</style><canvas></canvas><script id="data" type="application/json">${JSON.stringify(data)}</script><script>(${renderer.toString()})()</script>`;
writeFileSync(`${out}/orbital-machinery.html`,html);
const {chromium}=await import(process.env.PW_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.PW_CHROMIUM});
const report={scope:'C hull/hangar critical family only, not gameplay or full C art',manifestSHA256:createHash('sha256').update(readFileSync('assets/space-c/machinery.json')).digest('hex'),devices:{}};
try{
  for(const[name,D]of Object.entries({ios:{width:393,height:852},android:{width:412,height:915}})){
    const page=await browser.newPage({viewport:D,deviceScaleFactor:1}),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`${pathToFileURL(`${out}/orbital-machinery.html`).href}?device=${name}`);await page.waitForFunction(()=>window.CA);
    const metrics=await page.evaluate(()=>CA.metrics());assert(metrics.area>10000);assert(metrics.closedCoverage>.99,'Closed doors leave unintended clear gaps');assert.equal(metrics.openDoorLeak,0,'Open doors still overlap the actual aperture');
    for(const[tag,open]of[['closed',0],['half',.5],['open',1]]){await page.evaluate(v=>CA.set(v),open);await page.screenshot({path:`${out}/${name}-${tag}.png`});if(name==='ios'){const uri=await page.evaluate(v=>CA.source(v),open);writeFileSync(`${out}/source-${tag}.png`,Buffer.from(uri.split(',')[1],'base64'));}}
    await page.evaluate(()=>CA.reference());await page.screenshot({path:`${out}/${name}-reference.png`});
    if(name==='ios')for(let i=0;i<36;i++){const t=i/35,open=t<.2?0:t<.4?(t-.2)/.2:t<.7?1:t<.9?(.9-t)/.2:0;await page.evaluate(v=>CA.set(v),open);await page.screenshot({path:`${out}/motion-${String(i).padStart(2,'0')}.png`});}
    assert.deepEqual(errors,[]);report.devices[name]={metrics,errors};await page.close();
  }
}finally{await browser.close();}
report.htmlSHA256=createHash('sha256').update(html).digest('hex');writeFileSync(`${out}/asset-report.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
