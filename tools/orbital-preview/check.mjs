import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(process.env.PW_MODULE || 'playwright');
const out = resolve(process.argv[2] || 'out/orbital-next');
mkdirSync(out,{recursive:true});
const hash=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
const report = { scope: 'C mechanics greybox only. Native browser viewports, not Android native or final reference art. Direct damage fixtures and deterministic public-input assisted runs are separate.', sourceSHA256:hash('src/orbital.js'),htmlSHA256:hash(`${out}/orbital.html`),devices: {} };
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM, args: ['--mute-audio'] });
try {
  for (const [name,D] of Object.entries({ios:{width:393,height:852,top:59,bottom:34},android:{width:412,height:915,top:32,bottom:24}})) {
    const page=await browser.newPage({viewport:D,deviceScaleFactor:2,hasTouch:true}),errors=[];
    page.on('pageerror',e=>errors.push(e.stack||e.message));
    await page.addInitScript(()=>{window.requestAnimationFrame=()=>1;});
    await page.goto(`${pathToFileURL(`${out}/orbital.html`).href}?safe=${D.top},${D.bottom}`);
    await page.waitForFunction(()=>window.OP);
    await page.evaluate(async()=>{await document.fonts.load('18px "Lilita One"');await document.fonts.load('600 16px Rubik');await document.fonts.ready;});
    const shot=tag=>page.screenshot({path:`${out}/${name}-${tag}.png`});
    const initial=await page.evaluate(()=>{OP.draw();const l=OP.level;return{...OP.mapping,paddle:{...l.paddle},ball:l.ballRadius,reserve:(l.H-l.paddle.y)*l.kitUIScale,deepest:Math.max(...l.bricks.map(b=>b.y+b.h)),inspect:l.inspect()};});
    assert.equal(initial.inspect.bricks.length,26);assert.equal(initial.inspect.pods.length,3);assert(Math.abs(initial.reserve-126)<.6);await shot('00-opening-greybox');
    await page.evaluate(()=>OP.advance(2));assert.equal(await page.evaluate(()=>OP.level.clock),0);
    const y=D.height-D.bottom-26;
    await page.mouse.move(D.width/2,y);await page.mouse.down();await page.keyboard.down(' ');await page.touchscreen.tap(25,D.top+20);assert(await page.evaluate(()=>OP.mapping.paused));
    await page.mouse.up();await page.keyboard.up(' ');await shot('00b-paused-greybox');
    const pausedBefore=await page.evaluate(()=>OP.level.inspect());
    await page.keyboard.down(' ');await page.mouse.click(D.width/2,y);await page.evaluate(()=>OP.advance(.5));
    assert.deepEqual(await page.evaluate(()=>OP.level.inspect()),pausedBefore);assert(await page.evaluate(()=>OP.level.aim.ball.caught&&!OP.level.ptr.down&&Object.keys(OP.level.keys).length===0));
    await page.mouse.click(25,D.top+20);await page.keyboard.up(' ');assert(await page.evaluate(()=>!OP.mapping.paused&&OP.level.aim.ball.caught));
    await page.mouse.move(D.width/2,y);await page.mouse.down();await page.mouse.move(D.width/2+35,y);await page.evaluate(()=>OP.advance(.08));
    assert(await page.evaluate(()=>OP.level.aim.angle>.1));await page.mouse.up();await page.evaluate(()=>OP.advance(.1));assert(await page.evaluate(()=>!OP.level.aim&&OP.level.balls[0].vy<0));
    await page.mouse.move(D.width/2,y);await page.mouse.down();await page.mouse.move(D.width/2-60,y);await page.evaluate(()=>OP.advance(.12));assert(await page.evaluate(()=>OP.level.paddle.x<150));await page.mouse.up();
    const staged=await page.evaluate(()=>{const l=OP.reset();l.aim=null;l.balls[0].caught=true;OP.advance(3.35);return{...l.inspect(),fighters:l.fighters.map(f=>l.fighterPose(f)),targets:l.targets()};});
    assert(staged.attack&&!staged.attack.fired);await shot('01-staged-warning-greybox');
    await page.evaluate(()=>OP.advance(1.3));await shot('02-staged-shot-greybox');
    const lifecycle=await page.evaluate(()=>{const l=OP.reset();l.hitTarget('pod0',{});l.hitTarget('gun0',{});l.lives=1;l.loseBall();const before=l.inspect();OP.advance(3);const after=l.inspect();l.continueRun();return{before,after,continued:l.inspect(),caught:l.balls[0].caught,shield:l.shield};});
    assert.deepEqual(lifecycle.before,lifecycle.after);assert(lifecycle.continued.state==='play'&&lifecycle.caught&&lifecycle.shield===2);assert.equal(lifecycle.continued.pods[0].hp,2);
    await page.evaluate(()=>{const l=OP.reset();l.lives=1;l.loseBall();OP.draw();});await shot('02b-staged-loss-greybox');
    const continuePoint=await page.evaluate(()=>{const{scale,top,H}=OP.mapping;return{x:180*scale,y:(H/2+33+top)*scale};});await page.mouse.click(continuePoint.x,continuePoint.y);assert(await page.evaluate(()=>OP.level.state==='play'&&OP.level.aim.ball.caught&&OP.level.shield===2));
    const stagedWin=await page.evaluate(()=>{const l=OP.reset();for(const p of l.pods)for(let i=0;i<3;i++)l.hitTarget(p.id,{});for(const g of l.guns)for(let i=0;i<9;i++)l.hitTarget(g.id,{});for(let i=0;i<12;i++)l.hitTarget('core',{});OP.advance(2.1);return l.inspect();});
    assert.equal(stagedWin.state,'won');await shot('03-staged-win-greybox');
    const retry=await page.evaluate(()=>{const{scale,top,H}=OP.mapping;return{x:180*scale,y:(H/2+33+top)*scale};});await page.mouse.click(retry.x,retry.y);assert(await page.evaluate(()=>OP.level.state==='play'&&OP.level.core.hp===12));
    const earned=[];
    for(const normalOnly of [false,true])for(const seed of [20261018,20261019,20261020]){
      const run=await page.evaluate(({seed,normalOnly})=>{
        let rng=seed;Math.random=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296;};
        const l=OP.reset(),DT=1/120,fold=(x,lo,hi)=>{const w=hi-lo,z=((x-lo)%(2*w)+2*w)%(2*w);return lo+(z>w?2*w-z:z);};
        const centre=a=>({x:a.x+(a.w||0)/2,y:a.y+(a.h||0)/2});
        const goal=()=>{
          const p=l.pods.find(a=>a.hp>0),g=l.guns.find(a=>a.hp>0);
          if(p)return centre(p);if(g)return centre(g);return {x:2*(l.left+l.ballRadius)-l.core.x,y:l.core.y};
        };
        const actions=[],powerEvents=[];let returns=0,titanReturns=0,lastVy=l.balls[0].vy;
        const originalPower=l.applyPower.bind(l),originalPaddle=l.onPaddle.bind(l);
        l.applyPower=kind=>{powerEvents.push({kind,t:l.clock});originalPower(kind);};
        l.onPaddle=b=>{const charge=l.paddle.charge;originalPaddle(b);if(charge>=1&&l.paddle.charge===0)titanReturns++;};
        for(let frame=0;frame<120*(normalOnly?360:240)&&l.state==='play';frame++){
          if(l.phase==='escape'){l.update(DT);continue;}
          const target=goal(),p=l.paddle;
          if(l.aim){const a=l.aim,angle=Math.max(-1.1,Math.min(1.1,Math.atan2(target.x-a.ball.x,a.ball.y-target.y)));l.pointerDown(p.x,l.H-30);l.pointerMove(a.anchorX+(angle-(a.base||0))/.012,l.H-30);l.update(DT);l.pointerUp();l.key(' ',false);if(actions.length<100)actions.push({t:l.clock,angle,target});}
          const falling=l.balls.filter(b=>!b.dead&&!b.caught&&b.vy>0).map(b=>({b,time:(p.y-b.r-b.y)/b.vy})).filter(a=>a.time>=-.1).sort((a,b)=>a.time-b.time)[0];
          let x=p.x;
          if(falling){const b=falling.b,impact=fold(b.x+b.vx*Math.max(0,falling.time),l.left+b.r,l.right-b.r),angle=Math.max(-1.05,Math.min(1.05,Math.atan2(target.x-impact,p.y-target.y)));x=impact-angle/(62*Math.PI/180)*p.w/2;if(normalOnly&&p.charge>=1&&Math.abs(x-impact)<18)x=impact+(x<impact?-18:18);}
          else{const drop=l.drops.filter(d=>d.kind!=='shrink').sort((a,b)=>b.y-a.y)[0];x=normalOnly?(drop?(drop.x<180?l.right:l.left):p.x):drop?.x??l.balls[0]?.x??p.x;}
          x=Math.max(l.left+p.w/2,Math.min(l.right-p.w/2,x));if(!l.ptr.down)l.pointerDown(p.x,l.H-30);l.pointerMove(l.ptr.anchor+(x-l.ptr.padAnchor)/1.15,l.H-30);l.key(' ',true);l.update(DT);
          if(lastVy>0&&l.balls[0]?.vy<0)returns++;lastVy=l.balls[0]?.vy||0;
          if(!l.balls.every(b=>Number.isFinite(b.x+b.y+b.vx+b.vy)))throw Error('Nonfinite rally');
        }
        l.key(' ',false);l.pointerUp();OP.draw();return{seed,...l.inspect(),returns,actions,normalOnlyPolicy:normalOnly,powerEvents,titanReturns,normalOnlyObserved:powerEvents.length===0&&titanReturns===0};
      },{seed,normalOnly});
      earned.push(run);await shot(`earned-${normalOnly?'normal':'powers'}-${seed}-${run.state}-greybox`);console.log(name,normalOnly?'normal-policy':'powers',seed,run.state,run.clock,run.pods.map(p=>p.hp),run.guns.map(g=>g.hp),run.core.hp,run.powerEvents,run.titanReturns);
      if(run.state==='won')break;
    }
    assert.deepEqual(errors,[]);
    report.devices[name]={initial,input:'Browser pointer aim/release/drag passed',staged,lifecycle,stagedWin,earned,hasAssistedWin:earned.some(r=>r.state==='won'),hasNormalOnlyWin:earned.some(r=>r.state==='won'&&r.normalOnlyObserved),errors};
    writeFileSync(`${out}/report.json`,JSON.stringify(report,null,2));await page.close();
  }
  assert.equal(hash('src/orbital.js'),report.sourceSHA256,'Orbital source changed during proof');
  assert.equal(hash(`${out}/orbital.html`),report.htmlSHA256,'Preview changed during proof');
}finally{await browser.close();}
