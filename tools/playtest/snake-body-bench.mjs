// Usage: node tools/playtest/snake-body-bench.mjs
// Optional PW_MODULE, BROWSER_EXECUTABLE/PW_CHROMIUM and OUT_DIR.
// Pins original pre-redraw8286 source even after later commits; writes only OUT_DIR.
// CPU command submission on desktop Chromium2x body-only canvas, not GPU/deviceFPS.
// Coil uses each version's authored capture; later capture revisions change that geometry.
import fs from'node:fs';import crypto from'node:crypto';import{execFileSync}from'node:child_process';import{build}from'esbuild';import{pathToFileURL}from'node:url';import{resolve}from'node:path';
const {chromium}=await import(process.env.PW_MODULE||'playwright'),root=process.cwd(),out=process.env.OUT_DIR||'out/snake-body-bench';fs.mkdirSync(out,{recursive:true});
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'),distBefore=sha('dist/breach.html'),artBefore=sha('src/vault-art.js'),artSnapshot=fs.readFileSync('src/vault-art.js','utf8'),currentSnapshot=fs.readFileSync('src/vault.js','utf8'),old=execFileSync('git',['show','8286cee9cb2e45a531d14d0b4e7c7836475b3e87:src/vault.js'],{encoding:'utf8'});
const browser=await chromium.launch({args:['--mute-audio'],...(process.env.BROWSER_EXECUTABLE||process.env.PW_CHROMIUM?{executablePath:process.env.BROWSER_EXECUTABLE||process.env.PW_CHROMIUM}:{})});const report={scope:'Isolated desktop Chromium2x canvas body-only CPU command submission; no GPU/readback, fullframe, native-device or newhead-art admission. Sourcebaseline8286cee vs current; identical dependency/packedart bytes.',before:{dist:distBefore,art:artBefore,vault:sha('src/vault.js')},versions:{}};
try{for(const version of['baseline','current']){
 const bundle=await build({stdin:{contents:"import {Vault}from'./vault.js';window.BODY_Vault=Vault;",resolveDir:resolve('src')},bundle:true,format:'iife',minify:true,write:false,plugins:[{name:'fixed-snapshots',setup(b){b.onLoad({filter:/[\\/]src[\\/]vault\.js$/},()=>({contents:version==='baseline'?old:currentSnapshot,loader:'js',resolveDir:resolve('src')}));b.onLoad({filter:/[\\/]src[\\/]vault-art\.js$/},()=>({contents:artSnapshot,loader:'js',resolveDir:resolve('src')}));}}]});
 const path=out+'/'+version+'.html';fs.writeFileSync(path,'<!doctype html><canvas width="720" height="1560"></canvas><script>'+bundle.outputFiles[0].text.replaceAll('</script','<\\/script')+'</script>');
 const p=await browser.newPage();await p.goto(pathToFileURL(resolve(path)).href);await p.waitForFunction(()=>window.BODY_Vault);
 report.versions[version]=await p.evaluate(()=>{
  const cv=document.querySelector('canvas'),ctx=cv.getContext('2d');ctx.scale(2,2);const result={};
  for(const fixture of['twelve','twenty','coil']){
   const g=new BODY_Vault(360,780,1,'hard');g.skipIntro();const s=g.snake;
   s.cells=Array.from({length:fixture==='twenty'?20:12},(_,i)=>[10,5+i]);s.prog=1;s.eaten=fixture==='twenty'?24:0;s.look=s.dir=Math.PI/2;s.alpha=1;g.phase='rescue';g.t=1.1;
   if(fixture==='coil'){g.startAttack();g.updateAttack(1.23);g.updateAttack(.82);}
   const pts=g.snakePoints(),calls={stroke:0,fill:0,quadraticCurveTo:0},original={};
   for(const key of Object.keys(calls)){original[key]=ctx[key];ctx[key]=function(...a){calls[key]++;return original[key].apply(this,a);};}
   g.drawSnakeBody(ctx,pts);for(const key of Object.keys(calls))ctx[key]=original[key];
   const samples=[];for(let n=0;n<45;n++){const at=performance.now();for(let i=0;i<5;i++){ctx.clearRect(0,0,360,780);g.drawSnakeBody(ctx,pts);}if(n>=15)samples.push((performance.now()-at)/5);}samples.sort((a,b)=>a-b);
   result[fixture]={segments:pts.length,calls,samples:samples.length,medianMs:samples[15],p95Ms:samples[28]};
  }return result;
 });await p.close();
}}
finally{await browser.close();}
report.after={dist:sha('dist/breach.html'),art:sha('src/vault-art.js'),vault:sha('src/vault.js')};report.productionUntouched=report.before.dist===report.after.dist;report.artStable=report.before.art===report.after.art;
report.dependenciesPinned=true;report.concurrentRootBuildOrPack=!report.productionUntouched||!report.artStable;
fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
