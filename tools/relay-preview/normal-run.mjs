import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
const { chromium } = await import(process.env.PW_MODULE || 'playwright');
const out=process.argv[2]||'out/relay-next',sha=path=>createHash('sha256').update(readFileSync(path)).digest('hex'),report={scope:'Input-only ordinary-ball controller. No HP, life, ball, target, charge or power state writes. Collected capsules and any accidental offensive power are recorded.',previewSha256:sha(`${out}/relay.html`),activeGameSha256:sha('dist/breach.html'),devices:{}};
const browser=await chromium.launch({executablePath:process.env.PW_CHROMIUM,args:['--mute-audio']});
try{
  for(const [name,device] of Object.entries({ios:{width:393,height:852},android:{width:412,height:915}})){
    const page=await browser.newPage({viewport:device,deviceScaleFactor:2}),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(()=>{window.requestAnimationFrame=()=>1;});
    await page.goto(pathToFileURL(resolve(`${out}/relay.html`)).href+`?device=${name}`);await page.waitForFunction(()=>window.__relay?.ready,null,{polling:50});
    const run=await page.evaluate(()=>{
      const l=__relay.level,dt=1/120,powers=[],history=[],aims=[],offensiveEvents=[];let powered=false;
      const original=l.applyPower;l.applyPower=function(kind){powers.push({clock:this.clock,kind});return original.call(this,kind);};
      const goal=()=>{const c=l.crew.find(c=>c.hp>0);return c?{x:c.x,y:c.y}:{x:l.assembly.iris.x,y:245};};
      const fold=(x,lo,hi)=>{const w=hi-lo,z=((x-lo)%(2*w)+2*w)%(2*w);return lo+(z>w?2*w-z:z);};
      const aim=angle=>{const a=l.aim;l.pointerDown(l.paddle.x,l.H-30);l.pointerMove(a.anchorX+(angle-(a.base||0))/.012,l.H-30);l.update(dt);l.pointerUp();l.key(' ',false);};
      for(let frame=0;frame<120*420&&l.state==='play';frame++){
        if(frame%2400===0)history.push({clock:l.clock,hp:l.relay.hp,crew:l.crew.map(c=>c.hp),lives:l.lives});
        if(l.phase==='escape'){l.update(dt);continue;}
        const g=goal(),p=l.paddle,lo=l.left+p.w/2,hi=l.right-p.w/2;
        if(l.aim){const angle=Math.max(-1.1,Math.min(1.1,Math.atan2(g.x-l.aim.ball.x,l.aim.ball.y-g.y)));aims.push({clock:l.clock,angle});aim(angle);}
        const falling=l.balls.filter(b=>!b.dead&&!b.caught&&b.vy>0).map(b=>({b,time:(p.y-b.r-b.y)/b.vy})).filter(v=>v.time>=-.1).sort((a,b)=>a.time-b.time)[0];
        let target=p.x;
        if(falling){const b=falling.b,impact=fold(b.x+b.vx*Math.max(0,falling.time),l.left+b.r,l.right-b.r),angle=Math.max(-1.05,Math.min(1.05,Math.atan2(g.x-impact,p.y-g.y)));target=impact-angle/(62*Math.PI/180)*p.w/2;if(p.charge>=1&&Math.abs(target-impact)<25)target=impact-25>=lo?impact-25:impact+25;}
        else target=l.balls[0]?.x??p.x;
        for(const drop of l.drops)if(drop.y>p.y-85&&drop.y<p.y+p.h+6){const distance=p.w/2+20;if(Math.abs(target-drop.x)<distance){const left=drop.x-distance,right=drop.x+distance;target=left>=lo&&(right>hi||Math.abs(left-target)<Math.abs(right-target))?left:right;}}
        target=Math.max(lo,Math.min(hi,target));if(!l.ptr.down)l.pointerDown(p.x,l.H-30);l.pointerMove(l.ptr.anchor+(target-l.ptr.padAnchor)/1.15,l.H-30);l.key(' ',true);l.update(dt);
        const active=l.fireT>0||l.paddle.laserT>0||l.balls.some(b=>b.fire||b.titan>0);if(active&&!powered)offensiveEvents.push({clock:l.clock,charge:p.charge,ball:l.balls.map(b=>({x:b.x,y:b.y,titan:b.titan,fire:b.fire})),paddleX:p.x});powered ||= active;
        if(!l.balls.every(b=>Number.isFinite(b.x+b.y+b.vx+b.vy)))throw Error('Nonfinite normal-ball rally');
      }
      l.key(' ',false);l.pointerUp();__relay.render();return{state:l.state,reason:l.reason||null,clock:l.clock,seconds:l.t,hp:l.relay.hp,crew:l.inspect().crew,lives:l.lives,score:l.score,powers,offensivePowerObserved:powered,offensiveEvents,history,aims};
    });
    assert.deepEqual(errors,[]);report.devices[name]={...run,errors};writeFileSync(`${out}/normal-run-report.json`,JSON.stringify(report,null,2));await page.screenshot({path:`${out}/${name}-normal-${run.state}.png`});
    console.log(`${name}: normal ${run.state} at ${run.clock.toFixed(1)}s, hp${run.hp}, crew${run.crew.map(c=>c.hp)}, lives${run.lives}, powers${run.powers.map(p=>p.kind)}, offensive${run.offensivePowerObserved}`);await page.close();
  }
  assert(Object.values(report.devices).every(d=>d.state==='won'),'Each phone needs an input-only earned clear');
  assert(Object.values(report.devices).some(d=>!d.offensivePowerObserved&&d.powers.length===0),'At least one full clear must use only ordinary balls and no capsules');
  assert.equal(sha(`${out}/relay.html`),report.previewSha256,'review artifact changed during the run');
  assert.equal(sha('dist/breach.html'),report.activeGameSha256,'active game changed during the run');
}finally{await browser.close();}
