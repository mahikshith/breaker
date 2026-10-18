// Labelled second-link fixture; capture actual morph, drag, firing and return animation.
import {mkdirSync,writeFileSync} from 'node:fs';
const{chromium}=await import(process.env.PW_MODULE||'playwright');
const OUT=process.argv[2]||'out/relay-circuit/final-proof/morph-motion';mkdirSync(OUT,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.PW_CHROMIUM,args:['--mute-audio']});
try{const p=await browser.newPage({viewport:{width:393,height:852},deviceScaleFactor:1,hasTouch:true}),errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.addInitScript(()=>{requestAnimationFrame=f=>{window.__nextFrame=f;return 1;};const Old=Image;window.__imgs=[];window.Image=class extends Old{constructor(){super();__imgs.push(this);}};});
await p.goto('http://127.0.0.1:4184/?safe=59,34&difficulty=medium');await p.waitForFunction(()=>window.__breach&&window.__nextFrame,null,{polling:50});
await p.evaluate(async()=>{await document.fonts.load('18px "Lilita One"');await document.fonts.load('600 16px Rubik');await document.fonts.ready;await Promise.all(__imgs.map(i=>i.decode()));__breach.start(0);window.__motionNow=performance.now();window.__motionFrames=n=>{for(let i=0;i<n;i++)__nextFrame(__motionNow+=1000/60);};__motionFrames(1);const l=__breach.level;for(let k=0;k<2;k++){const n=l.currentNode();while(!n.latched){const b=l.platePose(n);l.hitTarget(n.id,{x:b.x,y:b.y,r:8});}};__circuitDraw();});
await p.evaluate(async()=>Promise.all(__imgs.map(i=>i.decode())));
const poses=[];for(let i=0;i<72;i++){
 const pose=await p.evaluate(i=>{const l=__breach.level;if(l.phase==='flight'){if(!l.ptr.down)l.pointerDown(l.paddle.x,l.H-20);const x=180+95*Math.sin(i*.25);l.pointerMove(l.ptr.anchor+(x-l.ptr.padAnchor)/1.15,l.H-20);}__motionFrames(i?10:0);return{frame:i,phase:l.phase,clock:l.clock,craft:l.craftPose(),remaining:l.burstRemaining};},i);
 await p.screenshot({path:`${OUT}/${String(i).padStart(3,'0')}.png`});poses.push(pose);if(i>12&&pose.phase==='relay')break;
}writeFileSync(`${OUT}/report.json`,JSON.stringify({scope:'Staged legal second-link contacts, actual Main/render/update and public drag. Not earned play.',errors,poses},null,2));if(errors.length)throw Error(errors.join('\n'));
}finally{await browser.close();}
