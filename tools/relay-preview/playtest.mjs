import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
const { chromium } = await import(process.env.PW_MODULE || 'playwright');
const out = process.argv[2] || 'out/relay-next';
mkdirSync(out,{recursive:true});
const sha=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
const report={scope:'Isolated playable Relay prototype. Labelled staged fixtures differ from deterministic public-input assisted runs; neither proves human balance or physical-device performance.',activeGameSha256:sha('dist/breach.html'),previewSha256:sha(`${out}/relay.html`),devices:{}};
const browser=await chromium.launch({executablePath:process.env.PW_CHROMIUM,args:['--mute-audio']});
try{
  for(const [name,device] of Object.entries({ios:{width:393,height:852,top:59,bottom:34},android:{width:412,height:915,top:32,bottom:24}})){
    const page=await browser.newPage({viewport:device,deviceScaleFactor:2,hasTouch:true}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(()=>{window.requestAnimationFrame=fn=>{window.__relayFrame=fn;return 1;};});
    await page.goto(pathToFileURL(resolve(`${out}/relay.html`)).href+`?device=${name}`);
    await page.waitForFunction(()=>window.__relay?.ready,null,{polling:50});
    await page.evaluate(()=>__relay.setPaused(false));
    await page.evaluate(()=>{
      const aim=angle=>{const l=__relay.level,a=l.aim;if(!a)return;l.pointerDown(l.paddle.x,l.H-30);l.pointerMove(a.anchorX+(angle-(a.base||0))/.012,l.H-30);l.update(1/120);l.pointerUp();l.key(' ',false);};
      window.RT={aim,advance:seconds=>{for(let i=0;i<Math.round(seconds*120);i++)__relay.level.update(1/120);},draw:()=>__relay.render(),fresh:()=>__relay.fresh()};
      RT.fresh();RT.draw();
    });
    const ev=(f,arg)=>page.evaluate(f,arg),shot=label=>page.screenshot({path:`${out}/${name}-${label}.png`});
    const initial=await ev(()=>{const l=__relay.level;RT.draw();return{...__relay.geometry,crew:l.crew.length,bricks:l.bricks.length,paddle:{...l.paddle},reserve:(l.H-l.paddle.y)*l.kitUIScale,parts:Object.keys(l.parts).length,fonts:document.fonts.check('18px "Lilita One"')};});
    assert.equal(initial.crew,4);assert.equal(initial.bricks,30);assert.equal(initial.fonts,true);assert(Math.abs(initial.reserve-126)<.6);await shot('opening');
    const pauseY=initial.originY+52*initial.scale;
    await page.mouse.click(24,pauseY);await page.keyboard.press('Space');
    assert(await ev(()=>__relay.level.aim?.serve&&__relay.level.balls[0].caught),'pause tap and paused Space must preserve the held serve');
    await page.mouse.click(24,pauseY);assert(await ev(()=>__relay.level.aim?.serve&&__relay.level.balls[0].caught),'resume tap must not release');
    const y=device.height-device.bottom-24;
    await page.mouse.move(device.width/2,y);await page.mouse.down();await page.mouse.move(device.width/2+30,y);await ev(()=>{RT.advance(.1);RT.draw();});
    assert(await ev(()=>__relay.level.aim.angle>.1));await page.mouse.up();await ev(()=>RT.advance(.1));assert(await ev(()=>!__relay.level.aim&&__relay.level.balls[0].vy<0));
    await page.mouse.move(device.width/2,y);await page.mouse.down();await page.mouse.move(device.width/2-60,y);await ev(()=>{RT.advance(.1);RT.draw();});assert(await ev(()=>__relay.level.paddle.x<150));await page.mouse.up();await shot('pointer-play');
    const warning=await ev(()=>{const l=RT.fresh();l.aim=null;RT.advance(3.65);RT.draw();return l.inspect();});assert(warning.attack&&!warning.attack.fired);await shot('staged-cannon-warning');
    await ev(()=>{RT.advance(.8);RT.draw();});await shot('staged-cannon-shot');
    await ev(()=>{const l=RT.fresh();l.debugGeometry=true;RT.draw();});await shot('geometry');
    const goal=await ev(()=>{const l=RT.fresh();l.aim=null;for(const c of l.crew){l.hitTarget(c.id,{x:c.x,y:c.y});l.hitTarget(c.id,{x:c.x,y:c.y});}for(let i=0;i<24;i++)l.hitTarget('relay',{x:180,y:120});RT.advance(1);RT.draw();return l.inspect();});
    assert(goal.crew.every(c=>c.hp===0));assert.equal(goal.iris,1);await shot('staged-worker-release');
    await ev(()=>{RT.advance(1.2);RT.draw();});assert.equal(await ev(()=>__relay.level.phase),'escape');await shot('staged-boarding');
    await ev(()=>{RT.advance(.7);RT.draw();});await shot('staged-departure');
    await ev(()=>{RT.advance(1);RT.draw();});assert.equal(await ev(()=>__relay.level.state),'won');await shot('staged-result');
    const earned=await ev(()=>{
      const l=RT.fresh(),dt=1/120,actions=[];
      const centre=b=>({x:b.art.rect.x+b.art.rect.w/2,y:b.art.rect.y+b.art.rect.h/2});
      const goal=()=>{const cache=l.bricks.filter(b=>b.hp>0&&b.payload).sort((a,b)=>({split:0,laser:1,shield:2}[a.payload]-{split:0,laser:1,shield:2}[b.payload]))[0],crew=l.crew.find(c=>c.hp>0);return cache?centre(cache):crew?{x:crew.x+Math.sin(l.clock*.7)*12,y:crew.y+25}:{x:180,y:245};};
      const fold=(x,lo,hi)=>{const w=hi-lo,z=((x-lo)%(2*w)+2*w)%(2*w);return lo+(z>w?2*w-z:z);};
      for(let frame=0;frame<120*360&&l.state==='play';frame++){
        if(l.phase==='escape'){l.update(dt);continue;}
        const g=goal(),p=l.paddle;
        if(l.aim){const angle=Math.max(-1.1,Math.min(1.1,Math.atan2(g.x-l.aim.ball.x,l.aim.ball.y-g.y)));if(actions.length<120)actions.push({t:+l.t.toFixed(3),type:l.aim.serve?'serve':'focus',angle});RT.aim(angle);}
        const falling=l.balls.filter(b=>!b.dead&&!b.caught&&b.vy>0).map(b=>({b,time:(p.y-b.r-b.y)/b.vy})).filter(a=>a.time>=-.1).sort((a,b)=>a.time-b.time)[0];
        let target=p.x;
        if(falling){const b=falling.b,impact=fold(b.x+b.vx*Math.max(0,falling.time),l.left+b.r,l.right-b.r),angle=Math.max(-1.05,Math.min(1.05,Math.atan2(g.x-impact,p.y-g.y)));target=impact-angle/(62*Math.PI/180)*p.w/2;}
        else{const d=l.drops.filter(d=>!d.got).sort((a,b)=>b.y-a.y)[0];target=d?d.x:p.laserT>0?g.x:l.balls[0]?.x??p.x;}
        target=Math.max(l.left+p.w/2,Math.min(l.right-p.w/2,target));
        if(!l.ptr.down)l.pointerDown(p.x,l.H-30);
        l.pointerMove(l.ptr.anchor+(target-l.ptr.padAnchor)/1.15,l.H-30);l.key(' ',true);l.update(dt);
        if(!l.balls.every(b=>Number.isFinite(b.x+b.y+b.vx+b.vy)))throw Error('Nonfinite ball in earned rally');
      }
      l.key(' ',false);l.pointerUp();RT.draw();return{state:l.state,reason:l.reason||null,clock:l.clock,seconds:l.t,hp:l.relay.hp,crew:l.inspect().crew,bricks:l.bricks.map(b=>({id:b.id,hp:b.hp})),lives:l.lives,score:l.score,bricksBroken:l.bricksBroken,actions};
    });
    await shot(`earned-${earned.state}`);assert.deepEqual(errors,[]);
    report.devices[name]={initial,input:'real browser pointer aim/release/drag passed',staged:{warning,goal},earned,errors};writeFileSync(`${out}/playtest-report.json`,JSON.stringify(report,null,2));
    console.log(`${name}: ${earned.state} at ${earned.clock.toFixed(1)}s, relay ${earned.hp}HP, crew ${earned.crew.map(c=>c.hp)}, lives ${earned.lives}`);await page.close();
  }
}finally{await browser.close();}
