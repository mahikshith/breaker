// Coarse target-agnostic paddle balancing; real earned Nix choices use browser touch.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const{chromium}=await import(process.env.PW_MODULE||'playwright');
const[OUT='out/space-polish-review/circuit/coarse',HTML='out/space-polish-review/circuit/circuit.html',BASE='http://127.0.0.1:4187/circuit.html',MODE='easy',FIRST='five']=process.argv.slice(2);mkdirSync(OUT,{recursive:true});
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const report={scope:'Coarse public-input-assisted runs. Controller reads only balls/paddle/time, predicts floor returns and rounds paddle goals to16u; no target/geometry solver, HP/position/lives/resource writes or Continue. Nix charge is earned through actual damage; choices use actual browser touch.',mode:MODE,firstChoice:FIRST,htmlSHA256:sha(HTML),sourceSHA256:sha('src/relay.js'),devices:{}};
const browser=await chromium.launch({executablePath:process.env.PW_CHROMIUM,args:['--mute-audio']});
try{for(const[name,D]of Object.entries({ios:{width:393,height:852,top:59,bottom:34},android:{width:412,height:915,top:32,bottom:24}})){
 const page=await browser.newPage({viewport:D,deviceScaleFactor:2,hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.stack||e.message));
 await page.addInitScript(()=>{requestAnimationFrame=f=>{window.__coarseFrame=f;return 1;};const Old=Image;window.__imgs=[];window.Image=class extends Old{constructor(){super();__imgs.push(this);}};
  window.__nixDraws=[];const draw=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(...a){const result=draw.apply(this,a);if(this.canvas.id==='game'&&a.length===9&&a[0].naturalWidth===1024&&a[0].naturalHeight===768&&a[3]===256&&a[4]===256){const m=this.getTransform(),r=this.canvas.getBoundingClientRect();__nixDraws.push({x:(m.a*a[5]+m.e)*r.width/this.canvas.width,y:(m.d*a[6]+m.f)*r.height/this.canvas.height,w:m.a*a[7]*r.width/this.canvas.width,h:m.d*a[8]*r.height/this.canvas.height});}return result;};
 });
 await page.goto(`${BASE}?difficulty=${MODE}&safe=${D.top},${D.bottom}`);await page.waitForFunction(()=>window.__breach&&window.__coarseFrame,null,{polling:50});
 await page.evaluate(async()=>{await document.fonts.load('18px "Lilita One"');await document.fonts.load('600 16px Rubik');await document.fonts.ready;await Promise.all(__imgs.map(i=>i.decode()));__breach.start(0);});
 await page.evaluate(async()=>{await Promise.all(__imgs.map(i=>i.decode()));
  const l=__breach.level,baseApply=l.applyPower.bind(l),baseHit=l.hitTarget.bind(l),basePaddle=l.onPaddle.bind(l);window.__coarse={returns:0,powers:[],damage:[],phases:[],lastPhase:'',samples:[]};
  l.applyPower=k=>{__coarse.powers.push({kind:k,t:l.clock});return baseApply(k);};
  l.hitTarget=(id,b)=>{const hp=l.hp,result=baseHit(id,b);if(l.hp!==hp)__coarse.damage.push({id,t:l.clock,before:hp,after:l.hp,shot:!!b.shot,titan:b.titan||0,fire:!!b.fire});return result;};
  l.onPaddle=b=>{__coarse.returns++;return basePaddle(b);};
  window.__coarseChunk=()=>{const fold=(x,lo,hi)=>{const w=hi-lo,z=((x-lo)%(2*w)+2*w)%(2*w);return lo+(z>w?2*w-z:z);};
   for(let i=0;i<90&&l.state==='play';i++){
    if(l.phase!==__coarse.lastPhase){__coarse.lastPhase=l.phase;__coarse.phases.push({phase:l.phase,t:l.clock,hp:l.hp,lives:l.lives});}
    if(l.paddle.charge>=1&&l.spacePowerAvailable())break;
    const p=l.paddle,y=l.H-24;
    if(l.phase==='relay'){
     if(l.aim){const a=[-.24,.31,-.42,.18][__coarse.returns%4];l.pointerDown(p.x,y);l.pointerMove(p.x+(a-(l.aim.base||0))/.012,y);l.pointerUp();l.key(' ',false);}
     const falling=l.balls.filter(b=>!b.dead&&!b.caught&&b.vy>0).map(b=>({b,t:(p.y-b.r-b.y)/b.vy})).filter(v=>v.t>=-.1).sort((a,b)=>a.t-b.t)[0];
     let x=p.x;if(falling){const b=falling.b,impact=fold(b.x+b.vx*Math.max(0,falling.t),l.left+b.r,l.right-b.r),offset=[-.15,.12,.2,-.18][__coarse.returns%4]*p.w;x=Math.round((impact+offset)/16)*16;}
     x=Math.max(l.left+p.w/2,Math.min(l.right-p.w/2,x));if(!l.ptr.down)l.pointerDown(p.x,y);l.pointerMove(l.ptr.anchor+(x-l.ptr.padAnchor)/1.15,y);
    }else if(l.phase==='flight'){const x=180+85*Math.sin(l.clock*1.3);if(!l.ptr.down)l.pointerDown(p.x,y);l.pointerMove(l.ptr.anchor+(x-l.ptr.padAnchor)/1.15,y);}
    l.update(1/120);
   }__circuitDraw();return{state:l.state,phase:l.phase,clock:l.clock,hp:l.hp,lives:l.lives,charge:l.paddle.charge,choose:l.spacePowerAvailable()&&l.paddle.charge>=1,count:l.balls.filter(b=>!b.dead).length};};
 });
 const session=await page.context().newCDPSession(page),tap=async p=>{await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:43,x:p.x,y:p.y,radiusX:3,radiusY:3,force:1}]});await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});};
 const captures=new Set(),choices=[];let status,lastPhase='';
 await page.evaluate(()=>__circuitDraw());const nix=await page.evaluate(()=>__nixDraws.at(-1));assert(nix&&Math.abs(nix.w-52)<.05&&nix.x>=0&&nix.x+nix.w<D.width&&nix.y>D.height*.65&&nix.y+nix.h<=D.height-D.bottom+.1,'actual decoded Nix atlas draws visibly in the52CSS lower corner');await page.screenshot({path:`${OUT}/${name}-opening.png`});
 for(let n=0;n<520;n++){
  status=await page.evaluate(()=>__coarseChunk());
  if(status.phase!==lastPhase){lastPhase=status.phase;if(!captures.has(lastPhase)){captures.add(lastPhase);await page.screenshot({path:`${OUT}/${name}-earned-${lastPhase}.png`});}}
  if(status.choose){
   const kind=choices.length===0?FIRST:choices.length%2?'titan':'laser';
   const a=await page.evaluate(top=>{const l=__breach.level,s=l.kitUIScale,p=l.kitAnchor();return{x:p.x*s,y:top+(p.y-34)*s};},D.top);
   await tap(a);assert(await page.evaluate(()=>__breach.level.powerMenuOpen));await page.waitForTimeout(190);await page.evaluate(()=>__circuitDraw());
   if(!choices.length)await page.screenshot({path:`${OUT}/${name}-earned-nix-picker.png`});
   const c=await page.evaluate(({kind,top})=>{const l=__breach.level,s=l.kitUIScale,p=__circuitPowerLayout(l).choices.find(c=>c.id===kind);return{x:(p.x+p.w/2)*s,y:top+(p.y+p.h/2-34)*s};},{kind,top:D.top});
   await tap(c);assert(await page.evaluate(()=>!__breach.level.powerMenuOpen&&__breach.level.paddle.charge===0));choices.push({kind,t:status.clock,hp:status.hp,countBefore:status.count});await page.evaluate(()=>__circuitDraw());
   if(choices.length<4)await page.screenshot({path:`${OUT}/${name}-earned-choice-${choices.length}-${kind}.png`});
  }
  if(status.state!=='play'||status.clock>=240)break;
 }
 await page.evaluate(()=>{let now=performance.now();for(let i=0;i<160;i++)__coarseFrame(now+=1000/60);});await page.screenshot({path:`${OUT}/${name}-earned-final.png`});
 const observed=await page.evaluate(()=>({state:__breach.level.state,phase:__breach.level.phase,hp:__breach.level.hp,lives:__breach.level.lives,clock:__breach.level.clock,...__coarse}));
 report.devices[name]={...observed,choices,nix,errors,images:await page.evaluate(()=>__imgs.length)};writeFileSync(`${OUT}/report.json`,JSON.stringify(report,null,2));console.log(JSON.stringify({phone:name,state:observed.state,hp:observed.hp,clock:observed.clock,lives:observed.lives,choices,powers:observed.powers,errors}));assert.deepEqual(errors,[]);await page.close();
}assert.equal(sha(HTML),report.htmlSHA256);report.hashAfter=sha(HTML);report.completed=true;writeFileSync(`${OUT}/report.json`,JSON.stringify(report,null,2));}finally{await browser.close();}
