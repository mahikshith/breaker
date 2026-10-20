import { Starflight } from '../../src/starflight/model.js';
import { SHIPS, shipPoint } from '../../src/starflight/geometry.js';
import { drawWarning, drawShot, drawHazards, drawDrones } from './render-effects.js';
import { unlockAudio, sfx, setMuted, isMuted } from '../../src/audio.js';

const $ = id => document.getElementById(id);
const safe = new URLSearchParams(location.search).get('safe')?.split(',').map(Number);
if(safe?.length===2&&safe.every(v=>Number.isFinite(v)&&v>=0&&v<=120)){
  document.documentElement.style.setProperty('--safe-top',`${safe[0]}px`);
  document.documentElement.style.setProperty('--safe-bottom',`${safe[1]}px`);
}
const canvas = $('game'), ctx = canvas.getContext('2d');
const names = ['CARRIER REACH', 'RELAY DRIFT', 'FORGE BELT'];
const bossNames = ['BLOCKADE COMMANDER', 'RELAY HUNTER', 'FORGE DREADNOUGHT'];
const powerIds = ['laser','seeker','spiral','drones','nova','hyper','stasis'];
const powerNames = {laser:'LANCE ONLINE',seeker:'SEEKERS AWAY',spiral:'SERPENT BARRAGE',drones:'WINGMEN ONLINE',nova:'NOVA RELEASED',hyper:'HYPER BARRAGE',stasis:'TIME DILATED'};
const images = {}, keys = new Set(), reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let game, difficulty = 'medium', mode = 'menu', width = 360, height = 780, scale = 1, worldTop = 0, worldBottom = 84;
let pointer = null, anchor = null, last = 0, accumulator = 0, ambient = 0, seenSector = 0, seenPhase = '', noticeUntil = 0;
let previousHull = -1, previousScore = -1, previousCharge = -1, lastSound = 0;
const stars = Array.from({length:90}, (_, i) => ({x:(i*137.508)%360,y:(i*173.17)%1000,z:.25+(i%5)*.17}));

function resize() {
  const r = $('flight').getBoundingClientRect(), oldHeight = height;
  scale = r.width / width; height = r.height / scale;
  worldTop = ((parseFloat(getComputedStyle($('hud')).top)||0)+76)/scale;
  worldBottom = ((parseFloat(getComputedStyle($('arsenal')).bottom)||0)+14)/scale;
  const dpr = Math.min(2, devicePixelRatio || 1);
  canvas.width = Math.round(r.width*dpr); canvas.height = Math.round(r.height*dpr);
  ctx.setTransform(scale*dpr,0,0,scale*dpr,0,0);
  if (game && Math.abs(height-oldHeight)>1) {
    pause(); pointer=null; anchor=null; keys.clear(); game.setMoving(false);
    game.height = Math.max(360,height - worldBottom - worldTop);
    const p=game.player;
    p.y=p.py=p.targetY=Math.max(game.height*.35,Math.min(p.y,game.height-38));
    p.px=p.targetX=p.x;p.vx=p.vy=0;
    configureReserve();
  }
}
function configureReserve(){
  if(!game||$('arsenal').hidden)return;
  const orb=$('reactor').getBoundingClientRect(),field=$('flight').getBoundingClientRect();
  game.setControlReserve?.({x:(orb.x+orb.width/2-field.x)/scale,
    y:(orb.y+orb.height/2-field.y)/scale-worldTop,r:orb.width/(2*scale)+SHIPS.player.width*.52});
}
function makeGame() {
  game = new Starflight({width,height:Math.max(360,height-worldBottom-worldTop),difficulty,seed:1701});
  seenSector = 0; seenPhase = ''; previousHull = previousScore = previousCharge = -1;
  pointer = null; anchor = null; keys.clear(); accumulator = 0; lastSound = 0;
}
function announce(title, subtitle = '', duration = 3) {
  $('transmission').replaceChildren();
  $('transmission').append(document.createTextNode(title));
  if (subtitle) { const small = document.createElement('small'); small.textContent = subtitle; $('transmission').append(small); }
  noticeUntil = (game?.time || 0)+duration;
}
function show(screen) {
  mode=screen;
  $('menu').hidden=screen!=='menu'; $('pause-panel').hidden=screen!=='pause'; $('result').hidden=screen!=='lost';
  $('hud').hidden=screen==='menu'; $('arsenal').hidden=screen==='menu'||screen==='lost';
  $('power-panel').hidden=screen!=='arsenal';$('reactor').setAttribute('aria-expanded',String(screen==='arsenal'));
  if(screen==='menu') { $('boss-hud').hidden=true; $('transmission').textContent=''; }
  if(screen!=='play') { pointer=null; keys.clear(); game?.setMoving(false); }
  game?.pause(screen!=='play');
  configureReserve();
}
function launch() {
  if(matchMedia('(orientation: landscape) and (max-height: 600px)').matches)return;
  makeGame(); show('play'); last=performance.now(); announce('ESCORT ONLINE','BREAK THE BLOCKADE',3);
  unlockAudio();
}
function pause() { if(mode==='play'||mode==='arsenal'){show('pause');$('resume').focus();} }
function resume() { if(['pause','arsenal'].includes(mode)&&!matchMedia('(orientation: landscape) and (max-height: 600px)').matches){show('play');last=performance.now();accumulator=0;} }
function arsenal() { if(mode==='arsenal')resume();else if(mode==='play'){show('arsenal');$('close-powers').focus();} }
function power(kind) {
  if(!['play','arsenal'].includes(mode))return;
  const wasMenu=mode==='arsenal';if(wasMenu)game.pause(false);
  if(game.activate(kind)){show('play');last=performance.now();accumulator=0;sfx.power();announce(powerNames[kind],'',1.2);}
  else if(wasMenu)game.pause(true);
}
$('launch').onclick=launch;$('pause').onclick=pause;$('resume').onclick=resume;
$('reactor').onclick=arsenal;$('close-powers').onclick=resume;
$('retry').onclick=launch;$('again').onclick=launch;
$('sound').onclick=()=>{setMuted(!isMuted());$('sound').textContent=`Sound: ${isMuted()?'off':'on'}`;$('sound').setAttribute('aria-pressed',String(isMuted()));};
$('return').onclick=$('briefing').onclick=()=>show('menu');
document.querySelectorAll('[data-mode]').forEach(button=>button.onclick=()=>{
  difficulty=button.dataset.mode;
  document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
});
document.querySelectorAll('[data-power]').forEach(button=>button.onclick=()=>power(button.dataset.power));
canvas.addEventListener('pointerdown',event=>{
  if(mode!=='play'||pointer!==null)return;
  pointer=event.pointerId;canvas.setPointerCapture(pointer);
  anchor={x:event.clientX,y:event.clientY,sx:game.player.x,sy:game.player.y};
  game.setTarget(game.player.x,game.player.y);game.setMoving(true);
});
canvas.addEventListener('pointermove',event=>{
  if(mode!=='play'||event.pointerId!==pointer)return;
  game.setTarget(anchor.sx+(event.clientX-anchor.x)/scale,anchor.sy+(event.clientY-anchor.y)/scale);
});
function release(event){if(event.pointerId===pointer){pointer=null;game?.setMoving(false);}}
canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);
addEventListener('keydown',event=>{
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Escape'].includes(event.key))event.preventDefault();
  if(event.key==='Escape'){if(!event.repeat)['pause','arsenal'].includes(mode)?resume():pause();return;}
  if(!event.repeat&&event.key.toLowerCase()==='e'){arsenal();return;}
  if(!event.repeat&&powerIds[+event.key-1]){power(powerIds[+event.key-1]);return;}
  if(mode!=='play')return;
  if(event.repeat&&!keys.has(event.key.toLowerCase()))return;
  keys.add(event.key.toLowerCase());
});
addEventListener('keyup',event=>keys.delete(event.key.toLowerCase()));
addEventListener('blur',pause);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
addEventListener('resize',resize);

function sprite(name,x,y,w,h=w,angle=0,alpha=1,pivot=[.5,.5]) {
  const image=images[name];if(!image)return;
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.globalAlpha=alpha;
  ctx.drawImage(image,-w*pivot[0],-h*pivot[1],w,h);ctx.restore();
}
function glow(x,y,r,colour,alpha=1) {
  const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,colour);g.addColorStop(1,'transparent');
  ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.restore();
}
function environment(time,jump=false) {
  ctx.fillStyle='#030914';ctx.fillRect(0,0,width,height);
  if(images.background){
    const h=width*images.background.height/images.background.width, offset=reduced?0:(time*(jump?90:8))%h;
    for(let y=offset-h;y<height;y+=h)ctx.drawImage(images.background,0,y,width,h);
  }
  const tint=['#0a6070','#342660','#56231d'][(game?.sector-1||0)%3];
  glow(width*.1,height*.28,width*.8,tint,.13);
  for(const star of stars){
    const y=(star.y+time*(jump?260:22)*star.z)%(height+30)-15;
    ctx.globalAlpha=.2+star.z*.5;ctx.fillStyle=star.z>.8?'#c5eff9':'#6c92b5';
    ctx.fillRect(star.x,y,star.z<.7?.8:1.2,jump?18*star.z:1.4);
  }
  ctx.globalAlpha=1;
}
function exhaust(x,y,size,angle=0,colour='#51cdff') {
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);
  const length=size*(1.1+Math.sin((game?.time||ambient)*37)*.12);
  const fill=ctx.createLinearGradient(0,0,0,length);fill.addColorStop(0,'#d8ffff');fill.addColorStop(.2,colour);fill.addColorStop(1,'transparent');
  ctx.fillStyle=fill;ctx.beginPath();ctx.moveTo(-size*.21,0);ctx.quadraticCurveTo(-size*.34,length*.5,0,length);ctx.quadraticCurveTo(size*.34,length*.5,size*.21,0);ctx.fill();ctx.restore();
}
function ship(name,x,y,w,angle=0,hurt=0) {
  const image=images[name];if(!image)return;
  const h=w*image.height/image.width;
  const geometry=SHIPS[name], ratio=w/geometry.width;
  for(const uv of geometry.engines){
    const at=shipPoint(name,0,0,angle,uv);
    exhaust(x+at.x*ratio,y+at.y*ratio,(name==='player'?21:name==='boss'?25:12)*ratio,
      angle+(name==='player'?0:Math.PI),name==='player'?'#51cdff':'#fb6689');
  }
  sprite(name,x,y,w,h,angle);
  if(hurt>0){ctx.save();ctx.globalCompositeOperation='screen';sprite(name,x,y,w,h,angle,Math.min(.7,hurt*4));ctx.restore();}
}
function drawGame(){
  const time=game.time, p=game.player, jump=game.phase==='jump';
  environment(time,jump);
  ctx.save();ctx.beginPath();ctx.rect(0,worldTop,width,game.height);ctx.clip();ctx.translate(0,worldTop);
  if(game.timers.stasis>0){glow(p.x,p.y,220,'#3bdbcc',.12);ctx.strokeStyle='#85eddb66';ctx.lineWidth=1;ctx.beginPath();ctx.arc(p.x,p.y,100+Math.sin(time*4)*8,0,Math.PI*2);ctx.stroke();}
  drawHazards(ctx,images,game);
  for(const e of game.enemies) {
    const family=e.ship||e.kind,w=SHIPS[family].width;
    ship(family,e.x,e.y,w,e.angle||0,e.hurt);
    if(e.kind!=='boss'&&e.hp<e.maxHP){ctx.fillStyle='#ffffff24';ctx.fillRect(e.x-w*.3,e.y-w*.42,w*.6,2);ctx.fillStyle='#ffaf91';ctx.fillRect(e.x-w*.3,e.y-w*.42,w*.6*e.hp/e.maxHP,2);}
    if(e.warning)drawWarning(ctx,e.warning,time);
  }
  for(const shot of game.shots)drawShot(ctx,images,shot,time);
  for(const drop of game.pickups){
    const colours={repair:'#84f5bb',shield:'#a3ccff',rapid:'#ffcc94',charge:'#c4a8ff'};
    const c=colours[drop.kind]||'#b9f4ff';glow(drop.x,drop.y,17,c,.2);
    sprite({repair:'repairIcon',shield:'shieldIcon',rapid:'rapidIcon',charge:'chargeIcon'}[drop.kind],drop.x,drop.y,31,31,Math.sin(time*2)*.1);
  }
  if(game.state!=='lost'){
    ctx.save();if(p.invuln>0)ctx.globalAlpha=.6+.4*Math.sin(time*35)**2;
    ship('player',p.x,p.y,SHIPS.player.width,p.angle||0);
    ctx.fillStyle='#ecffff';ctx.beginPath();ctx.arc(p.x,p.y,2.5,0,Math.PI*2);ctx.fill();
    if(game.shieldCharges>0){ctx.strokeStyle='#a4e7ff88';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(p.x,p.y,37,34,0,0,Math.PI*2);ctx.stroke();}
    ctx.restore();
  }
  drawDrones(ctx,images,game);
  for(const fx of game.effects){
    const progress=Math.min(1,fx.age/fx.life), alpha=1-progress;
    if(fx.kind==='muzzle'||fx.kind==='enemyMuzzle')sprite(fx.kind==='muzzle'?'muzzle':'explosion',fx.x,fx.y,30,30,0,alpha*.7);
    else if(fx.kind==='explosion'){
      const size=(fx.size||65)*( .5+progress*.8);sprite('explosion',fx.x,fx.y,size,size,progress*.15,alpha);
      ctx.strokeStyle=`rgba(255,199,142,${alpha*.5})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(fx.x,fx.y,size*.5,0,Math.PI*2);ctx.stroke();
    } else if(fx.kind==='hit'||fx.kind==='rockHit')sprite('muzzle',fx.x,fx.y,22+progress*15,22+progress*15,0,alpha);
    else if(fx.kind==='rockBreak'){
      for(let i=0;i<6;i++){const a=i*Math.PI/3+(fx.seed||0),distance=progress*(fx.size||60);sprite('asteroid',fx.x+Math.cos(a)*distance,fx.y+Math.sin(a)*distance+progress*progress*25,12,12,a+progress*2,alpha);}
    } else if(fx.kind==='nova')sprite('explosion',fx.x,fx.y,35+progress*180,35+progress*180,progress*.3,alpha*.6);
    else if(fx.kind==='shield'||fx.kind==='stasis')sprite('stasis',fx.x,fx.y,70+progress*60,70+progress*60,0,alpha);
    else if(fx.kind==='hurt'){ctx.fillStyle=`rgba(255,80,80,${alpha*.08})`;ctx.fillRect(0,0,width,height);}
    else if(fx.kind==='pickup'){ctx.save();ctx.fillStyle=fx.colour||'#c0f9ed';ctx.globalAlpha=alpha;ctx.font='12px Lilita';ctx.textAlign='center';ctx.fillText({repair:'HULL +1',shield:'SHIELD',rapid:'RAPID FIRE',charge:'ENERGY +25'}[fx.pickupKind]||'UPGRADED',fx.x,fx.y-progress*28);ctx.restore();}
  }
  ctx.restore();
}
function hud(){
  if(previousHull!==game.player.hp){previousHull=game.player.hp;$('hull').replaceChildren(...Array.from({length:game.player.maxHP},(_,i)=>{const pip=document.createElement('i');if(i>=game.player.hp)pip.className='empty';return pip;}));$('hull').setAttribute('aria-label',`${game.player.hp} of ${game.player.maxHP} hull`);}
  if(previousScore!==game.score){previousScore=game.score;$('score').textContent=String(game.score).padStart(5,'0');}
  const charge=Math.floor(game.charge);
  if(previousCharge!==charge){previousCharge=charge;$('energy-fill').style.strokeDashoffset=String(100-charge);$('energy-value').textContent=charge>=100?'READY':`${charge}%`;$('energy-label').textContent=charge>=100?'ARSENAL':'REACTOR';$('reactor').classList.toggle('ready',charge>=100);$('reactor').setAttribute('aria-label',`Open arsenal, reactor ${charge} percent`);}
  $('power-help').textContent=charge>=100?'Choose one · full reactor charge':'Reactor charging through combat · flight paused';
  document.querySelectorAll('[data-power]').forEach(b=>{const active=game.timers[b.dataset.power]>0,available=['play','arsenal'].includes(mode)&&game.phase!=='jump'&&charge>=100&&!active;b.disabled=!available;b.classList.toggle('ready',available);b.classList.toggle('active',active);});
  const boss=game.enemies.find(e=>e.kind==='boss');
  $('boss-hud').hidden=!boss;$('boss-name').textContent=bossNames[(game.sector-1)%3];if(boss)$('boss-health').style.width=`${Math.max(0,boss.hp/boss.maxHP*100)}%`;
  $('sector-label').textContent=names[(game.sector-1)%3];
  if(game.sector!==seenSector){seenSector=game.sector;announce(names[(game.sector-1)%3],`SECTOR ${game.sector} · RUN ${(game.cycle||0)+1}`,3);}
  if(game.phase!==seenPhase){seenPhase=game.phase;if(game.phase==='boss')announce('HEAVY CONTACT','BREAK ITS FIRING LINE',2.4);if(game.phase==='jump')announce('CORRIDOR CLEARED','CONVOY JUMPING · REPAIR EN ROUTE',4);}
  $('transmission').style.opacity=game.time<noticeUntil&&mode==='play'?'1':'0';
  if(game.state==='lost'&&mode==='play'){$('result-stats').textContent=`${game.score.toLocaleString()} points · ${game.kills} ships disabled · ${game.completedSectors||0} sectors cleared`;show('lost');$('again').focus();sfx.lose();}
}
function frame(now){
  const dt=Math.min(.05,Math.max(0,(now-last)/1000||0));last=now;
  if(mode==='play'){
    let dx=Number(keys.has('arrowright')||keys.has('d'))-Number(keys.has('arrowleft')||keys.has('a'));
    let dy=Number(keys.has('arrowdown')||keys.has('s'))-Number(keys.has('arrowup')||keys.has('w'));
    if(dx||dy){const d=Math.hypot(dx,dy);game.setTarget(game.player.x+dx/d*48,game.player.y+dy/d*48);game.setMoving(true);}
    else if(pointer===null)game.setMoving(false);
    accumulator+=dt;
    while(accumulator>=1/60){game.update(1/60);accumulator-=1/60;}
    if(game.time-lastSound>.2&&game.shots.some(s=>s.side==='player'&&s.age<.03)){sfx.zap();lastSound=game.time;}
  }
  if(mode==='menu'){ambient+=dt;environment(ambient);ship('boss',278,130,235,-.14);ship('player',290,height*.51,140,-.18);}
  else {drawGame();hud();}
  requestAnimationFrame(frame);
}
async function load(){
  const paths={player:'player.png',scout:'scout.png',gunship:'gunship.png',boss:'boss.png',background:'background.png',playerRound:'weapons/plasma.png',enemyRound:'weapons/enemy.png',hyperRound:'weapons/hyper.png',muzzle:'weapons/muzzle.png',explosion:'weapons/explosion.png',stasis:'weapons/stasis.png'};
  const extra={beetle:'starflight-v2/beetle.png',frigate:'starflight-v2/frigate.png',crescent:'starflight-v2/crescent.png',
    asteroid:'starflight-v2/asteroid.png',gravityField:'starflight-v2/gravity.png',wormhole:'starflight-v2/wormhole.png',
    missile:'starflight-arsenal/missile.png',spiral:'starflight-arsenal/spiral.png',drone:'starflight-arsenal/drone.png',
    repairIcon:'starflight-arsenal/repair.png',shieldIcon:'starflight-arsenal/shield.png',rapidIcon:'starflight-arsenal/hyper.png',chargeIcon:'starflight-arsenal/stasis.png'};
  const urls=[...Object.entries(paths).map(([key,path])=>[key,`../../assets/starflight/${path}`]),...Object.entries(extra).map(([key,path])=>[key,`../../assets/${path}`])];
  await Promise.all(urls.map(async([key,url])=>{const image=new Image();image.src=url;await image.decode();images[key]=image;}));
  await Promise.all([...document.images].map(image=>image.decode()));
  await document.fonts.ready;resize();makeGame();show('menu');
  $('launch').disabled=false;$('launch').textContent='LAUNCH ESCORT';requestAnimationFrame(frame);
}
window.__starflight={get game(){return game;},get mode(){return mode;},launch,pause,resume,get ready(){return !$('launch').disabled;}};
load().catch(error=>{$('loading-error').hidden=false;$('loading-error').textContent=`Flight assets could not load. Reload this page. ${error.message}`;console.error(error);});
