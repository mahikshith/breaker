import fs from 'node:fs';
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PW_MODULE||'playwright');
const out=process.env.OUT_DIR||'out/vault-visual';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE,args:['--mute-audio']});
const report=[];
for(const[device,width,height]of[['ios',393,852],['android',412,915]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:2,hasTouch:true}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto((process.env.BASE_URL||'http://127.0.0.1:4194')+'/dist/breach.html?difficulty=easy&safe='+(device==='ios'?'59,34':'32,24'));
  await page.waitForFunction(()=>window.__breach?.ready,null,{polling:50});
  await page.evaluate(()=>window.__breach.start(1));
  await page.waitForTimeout(4000);
  await page.screenshot({path:`${out}/${device}-vault.png`});
  report.push({device,state:await page.evaluate(()=>({state:__breach.level.state,phase:__breach.level.phase,bricks:__breach.level.bricks.length})),errors});
  assert.deepEqual(errors,[]);await page.close();
}
await browser.close();fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
