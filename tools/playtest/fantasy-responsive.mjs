import assert from 'node:assert/strict';
import fs from 'node:fs';
const {chromium}=await import(process.env.PW_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE,args:['--mute-audio']});
const out=process.env.OUT_DIR||'out/fantasy-responsive';
fs.mkdirSync(out,{recursive:true});
const report=[];
for(const [width,height] of [[393,852],[412,915],[320,568],[1280,600],[900,400],[852,393]]){
  const page=await browser.newPage({viewport:{width,height},hasTouch:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const level of ['bellforge','tidewheel']){
    await page.goto((process.env.BASE_URL||'http://127.0.0.1:4194')+'/prototypes/fantasy/?level='+level);
    await page.waitForFunction(()=>!document.getElementById('start').disabled,null,{polling:50,timeout:30000});
    await page.locator('#start').tap();
    const game=await page.evaluate(()=>({height:fantasyGame.height,paddleY:fantasyGame.paddle.y,state:fantasyGame.state}));
    assert.ok(game.height>=700&&game.paddleY>=580);
    await page.locator('#pause').tap();await page.locator('#retry').tap();
    await page.screenshot({path:`${out}/${level}-${width}x${height}.png`});
    assert.deepEqual(errors,[]);
    report.push({level,width,height,...game,errors:[...errors]});
  }
  await page.close();
}
await browser.close();
fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({passed:report.length,out}));
