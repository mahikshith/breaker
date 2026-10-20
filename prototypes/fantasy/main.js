import { Bellforge } from '../../src/fantasy/bellforge.js';
import { Tidewheel } from '../../src/fantasy/tidewheel.js';
import { loadArt, drawEncounter } from './render.js';
import { unlockAudio, sfx, setMuted, isMuted } from '../../src/audio.js';
import { playfield } from './layout.js';

const $=id=>document.getElementById(id), host=$('encounter'), canvas=$('game'), ctx=canvas.getContext('2d');
const level=new URLSearchParams(location.search).get('level')==='tidewheel'?'tidewheel':'bellforge';
const tide=level==='tidewheel', Model=tide?Tidewheel:Bellforge;
let game,art,mode='easy',screen='menu',width=360,height=780,ratio=1,previous=0,pointer=null,cueUntil=0,lastHud='',startPoint=null;
const panels=['menu','paused','power','result'];
const cancelledClicks=new Set(),buttonStarts=new Map();let secondaryClick=null;
const heard=new WeakSet();let lastHitSound=-Infinity;
$('title').innerHTML=tide?'Tidewheel<br>Citadel':'Bellforge<br>Run';
$('story').textContent=tide?"Nerra hauls the flood chains. Break her grip before the water reaches Lumi.":"Korr's iron bells are lowering Lumi's lift. Break his armour and stop the winch.";
$('power-title').textContent=tide?'Choose your opening.':'Echo Guard';
$('power-copy').textContent=tide?'One full charge. One power.':'Turn a rolling bell back into Korr with a solid shield.';
$('cast').innerHTML=tide?'<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="9" r="4"/><path d="M24 13v26M15 20h18M8 29c1 10 9 12 16 12s15-2 16-12M8 29l-2 7m2-7 7 3m25-3 2 7m-2-7-7 3"/></svg><strong>Anchor</strong><small>Lock and drain</small>':'Raise the guard';
$('volley').hidden=$('cosmic').hidden=!tide;
$('power-options').classList.toggle('arsenal',tide);
function show(next){
  if(pointer!==null){cancelledClicks.add(pointer);if(cancelledClicks.size>16)cancelledClicks.delete(cancelledClicks.values().next().value);}
  pointer=null;startPoint=null;screen=next;game?.pause(next!=='play');
  for(const id of panels)$(id).hidden=next!==id;
  $('hud').hidden=$('kit').hidden=next==='menu';$('cue').textContent='';
  if(next!=='play')$(next)?.querySelector('button:not([disabled])')?.focus();
}
function size(){
  const rect=host.getBoundingClientRect();ratio=rect.width/360;height=playfield(rect.width,rect.height).height;
  host.style.setProperty('--scene-scale',Math.min(1,ratio));
  const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);
  // Keep actor space stable during resize. A fresh encounter adopts the new aspect.
  if(game&&screen==='play')show('paused');
}
function reset(){
  unlockAudio();
  size();game=new Model({...playfield(host.clientWidth,host.clientHeight),difficulty:mode});
  window.fantasyGame=game;show('play');cueUntil=game.time+4;lastHud='';
}
function eligible(kind=tide?'anchor':'echo'){
  return !!game?.canActivate(kind,{ignorePause:true});
}
function openPower(){
  if(screen!=='play')return;show('power');
  for(const [id,kind] of [['cast',tide?'anchor':'echo'],['volley','volley'],['cosmic','cosmic']])$(id).disabled=!eligible(kind);
  $('power-status').textContent=game.charge<100?`${Math.floor(game.charge)}% charged · break bricks to refill`:game.phase==='serve'?(tide?'Ready · choose a power, then launch.':'Launch the ball to use a power.'):'Ready';
}
$('start').onclick=reset;$('again').onclick=reset;$('retry').onclick=reset;
$('pause').onclick=()=>show('paused');$('resume').onclick=()=>show('play');
$('sound').onclick=()=>{setMuted(!isMuted());$('sound').textContent=`Sound: ${isMuted()?'off':'on'}`;};
for(const id of ['home','back'])$(id).onclick=()=>show('menu');
$('kit').onclick=openPower;$('close-power').onclick=()=>show('play');
for(const [id,kind] of [['cast',tide?'anchor':'echo'],['volley','volley'],['cosmic','cosmic']])$(id).onclick=()=>{game.pause(false);if(game.activate(kind)){sfx.power();show('play');}else game.pause(true);};
$('continue').onclick=()=>{game.pause(false);if(game.continue())show('play');else game.pause(true);};
for(const b of document.querySelectorAll('[data-mode]'))b.onclick=()=>{mode=b.dataset.mode;for(const n of document.querySelectorAll('[data-mode]'))n.setAttribute('aria-pressed',String(n===b));};
document.addEventListener('pointerdown',e=>{cancelledClicks.delete(e.pointerId);buttonStarts.set(e.pointerId,e.target.closest('button'));},true);
document.addEventListener('pointercancel',e=>buttonStarts.delete(e.pointerId),true);
document.addEventListener('pointerup',e=>{
  const started=buttonStarts.get(e.pointerId);buttonStarts.delete(e.pointerId);
  // Touch compatibility clicks can be suppressed after a captured paddle drag.
  // Activate on a matching button release for either thumb, then deduplicate click.
  if(e.pointerType!=='touch')return;
  const b=e.target.closest('button');if(!b||b!==started||b.disabled)return;
  const r=b.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)return;
  e.preventDefault();secondaryClick={button:b,pointerId:e.pointerId,until:performance.now()+500};b.click();
});
document.addEventListener('click',e=>{
  if(e.isTrusted&&cancelledClicks.has(e.pointerId)){cancelledClicks.delete(e.pointerId);e.preventDefault();e.stopImmediatePropagation();return;}
  if(e.isTrusted&&secondaryClick&&performance.now()<secondaryClick.until&&(e.pointerId===secondaryClick.pointerId||e.sourceCapabilities?.firesTouchEvents)){e.preventDefault();e.stopImmediatePropagation();secondaryClick=null;}
},true);
function coords(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*game.width,y:(e.clientY-r.top)/r.height*game.height};}
canvas.addEventListener('pointerdown',e=>{if(screen!=='play'||pointer!==null)return;pointer=e.pointerId;canvas.setPointerCapture(pointer);startPoint=coords(e);game.setTarget(startPoint.x);});
canvas.addEventListener('pointermove',e=>{if(e.pointerId===pointer&&screen==='play')game.setTarget(coords(e).x);});
canvas.addEventListener('pointerup',e=>{if(e.pointerId!==pointer)return;const p=coords(e);pointer=null;if(screen==='play'&&game.phase==='serve'){const b=game.balls[0];game.launch(p.y<b.y-30?Math.atan2(p.y-b.y,p.x-b.x):-Math.PI/2);}startPoint=null;});
canvas.addEventListener('pointercancel',()=>{pointer=null;startPoint=null;});
addEventListener('keydown',e=>{if(e.repeat&&!['ArrowLeft','ArrowRight'].includes(e.code))return;if(e.code==='Escape'){if(screen==='play')show('paused');else if(screen==='paused'||screen==='power')show('play');return;}if(screen!=='play')return;if(e.code==='ArrowLeft')game.setTarget(game.paddle.targetX-30);if(e.code==='ArrowRight')game.setTarget(game.paddle.targetX+30);if(e.code==='Space'){e.preventDefault();game.launch();}if(e.code==='KeyE')openPower();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&screen==='play')show('paused');});
addEventListener('blur',()=>{if(screen==='play')show('paused');else if(screen==='power'){pointer=null;game.pause(true);}});
addEventListener('resize',size);
function hud(){
  const key=[game.lives,game.score,Math.floor(game.charge),game.state].join('/');
  if(key!==lastHud){lastHud=key;$('lives').textContent='♥ '.repeat(Math.max(0,game.lives));$('lives').setAttribute('aria-label',`${game.lives} lives`);$('score').textContent=Math.round(game.score);$('charge').style.strokeDasharray=`${game.charge} 100`;$('kit').setAttribute('aria-label',`Kit's ${tide?'powers':'guard'}, ${Math.floor(game.charge)} percent charged`);$('kit').classList.toggle('ready',game.charge>=100);}
  if(screen==='play'&&game.state!=='play'){
    const won=game.state==='won';$('result-label').textContent=won?'LUMI IS SAFE':'THE KEEP HOLDS';
    $('result-title').textContent=won?'A way home.':'Try another angle.';
    $('result-copy').textContent=won?'The machinery falls quiet. One more keep is free.':tide?(game.loss==='flood'?'The basin reached the refuge.':'The last ball slipped away.'):'The lift or the last ball was lost.';
    $('continue').hidden=won||game.continued;won?sfx.win():sfx.lose();show('result');
  }
  if(screen==='play')$('cue').textContent=game.time<cueUntil&&game.phase==='serve'?'Tap to launch':'';
}
function frame(now){
  const dt=Math.min((now-previous)/1000||0,.05);previous=now;
  if(game){if(screen==='play'){game.update(dt);for(const e of game.effects)if(!heard.has(e)){heard.add(e);if(['bell-release','ratchet','surge'].includes(e.kind))sfx.beat();else if(game.time-lastHitSound>.06){sfx.hit();lastHitSound=game.time;}}}ctx.setTransform(canvas.width/game.width,0,0,canvas.height/game.height,0,0);drawEncounter(ctx,game,art,level);hud();}
  requestAnimationFrame(frame);
}
size();
loadArt().then(loaded=>{art=loaded;game=new Model({...playfield(host.clientWidth,host.clientHeight),difficulty:mode});game.pause(true);$('start').disabled=false;$('start').textContent='Enter the keep';requestAnimationFrame(frame);}).catch(err=>{$('error').hidden=false;$('error').textContent=`The keep could not load: ${err.message}`;console.error(err);});
