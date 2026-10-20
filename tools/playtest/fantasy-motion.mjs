import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

const {chromium}=await import(process.env.PW_MODULE||'playwright');
const out=resolve(process.env.OUT_DIR||'out/fantasy-motion');
const base=process.env.BASE_URL||'http://127.0.0.1:4194/prototypes/fantasy/';
const sources=['prototypes/fantasy/main.js','prototypes/fantasy/render.js','src/fantasy/bellforge.js','src/fantasy/tidewheel.js','assets/fantasy-machinery/manifest.json','assets/fantasy-machinery/nerra-v2-manifest.json','assets/fantasy-machinery/water-shot-manifest.json'];
const hashes=()=>Object.fromEntries(sources.map(p=>[p,createHash('sha256').update(readFileSync(p)).digest('hex')]));
mkdirSync(out,{recursive:true});
const before=hashes(),browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})}),cases=[];
try{
  for(const level of(process.argv[2]?[process.argv[2]]:['bellforge','tidewheel'])){
    const context=await browser.newContext({viewport:{width:393,height:852},deviceScaleFactor:1,isMobile:true,hasTouch:true,recordVideo:{dir:resolve(out,'raw'),size:{width:393,height:852}}});
    const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
    try{
      await page.goto(base+'?level='+level);
      await page.waitForFunction(()=>!document.querySelector('#start').disabled,null,{polling:50,timeout:20000});
      await page.locator('#start').click();
      await page.evaluate(()=>{
        window.motionAssist=setInterval(()=>{
          const g=window.fantasyGame;if(!g||g.paused||g.state!=='play')return;
          const b=g.balls[0];if(!b)return;
          if(g.phase==='serve')g.launch(-Math.PI/2-.22);
          let x=b.x;
          if(b.vy>0){x+=b.vx*(g.paddle.y-b.y)/b.vy;const a=18,z=g.width-18,w=z-a;let u=((x-a)%(2*w)+2*w)%(2*w);x=a+(u>w?2*w-u:u);}
          g.setTarget(x);
        },16);
      });
      await page.waitForTimeout(level==='tidewheel'?34000:21000);
      await page.screenshot({path:resolve(out,`${level}-live.png`)});
      cases.push({level,errors,state:await page.evaluate(()=>({state:fantasyGame.state,time:fantasyGame.time,hp:fantasyGame.villain.hp,lives:fantasyGame.lives,score:fantasyGame.score}))});
    }finally{
      await context.close();await page.video().saveAs(resolve(out,`${level}-live.webm`));
    }
  }
}finally{await browser.close();}
const after=hashes();
const report={method:'Real-time browser with public launch/setTarget assistance. No state, resources or clock writes. Not physical-handset or human balance evidence.',before,after,sourceStable:JSON.stringify(before)===JSON.stringify(after),cases};
writeFileSync(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
if(!report.sourceStable||cases.some(c=>c.errors.length))process.exitCode=1;
