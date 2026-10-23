import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { difficulty, DIFFICULTY_IDS } from '../src/difficulty.js';

const gradient={addColorStop(){}},context=new Proxy({}, {get:(_,k)=>k==='createLinearGradient'||k==='createRadialGradient'?()=>gradient:()=>{}});
globalThis.Image=class{complete=true;naturalWidth=1;width=512;height=768;decode(){return Promise.resolve();}};
globalThis.document={createElement:()=>({getContext:()=>context})};
const { Carrier }=await import('../src/carrier.js');
const { Vault }=await import('../src/vault.js');
const { Relay }=await import('../src/relay.js');
const { Orbital }=await import('../src/orbital.js');
const { Frost }=await import('../src/frost.js');

function mainHarness(mode='medium') {
  const source=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
  const listeners={},canvasListeners={},labels=[],writes=[],values={difficulty:mode,bestByDifficulty:{easy:[2,1],medium:[1,2],hard:[3,1]}};
  const canvas={getContext:()=>context,addEventListener:(k,fn)=>canvasListeners[k]=fn,setPointerCapture(){},getBoundingClientRect:()=>({left:0,top:0})};
  const sandbox={Carrier,Vault,Relay,Orbital,Frost,difficulty,DIFFICULTY_IDS,URLSearchParams,window:{},location:{search:'',reload(){throw Error('Retry must not reload the browser');}},performance:{now:()=>12345},document:{getElementById:()=>canvas,addEventListener:(k,fn)=>listeners[k]=fn,hidden:false},
    addEventListener:(k,fn)=>listeners[k]=fn,requestAnimationFrame(){},store:{get:k=>values[k],set:(k,v)=>writes.push([k,v])},unlockAudio(){},sfx:new Proxy({},{get:()=>()=>{}}),
    kitOrbContains:(o,x,y)=>Math.hypot(o.x-x,o.y-y)<=o.r,kitTap:()=>true,MODE:'free',PRICE:'',AD_SECONDS:1,continueOffer:()=>null,isUnlocked:()=>true,
    setDPR(){},text:(_g,label)=>labels.push(label),rrect(){},shade:c=>c,SPR:{},ready:()=>false,FONT:'Lilita One',isMuted:()=>false,setMuted(){},drawInvader(){},drawPrincessIcon(){},cached:()=>({}),vignette(){},drawGrain(){},brick:()=>({})};
  const code=source.replace(/^import .*;\r?$/gm,'').slice(0,source.replace(/^import .*;\r?$/gm,'').lastIndexOf('\nresize();'));
  runInNewContext(code+`
globalThis.RV={start,pause,drawPause,tick,get names(){return LEVELS.map(l=>l.name)},get level(){return level},get scene(){return scene},get index(){return levelIdx},get mode(){return selectedDifficulty},get buttons(){return buttons},get control(){return{paddlePointer,kitPress,acc,last,resultT,cont}},clearButtons(){buttons=[]},seedAttempt(){cont={used:2,declined:true,ad:{t:4,earned:true},toast:{text:'old',t:1}};acc=.006;resultT=2;}};`,sandbox);
  return{api:sandbox.RV,listeners,canvasListeners,labels,writes,values};
}
const copy=v=>JSON.parse(JSON.stringify(v));
const snapshot=l=>({name:l.name,mode:l.difficulty?.id,phase:l.phase,state:l.state,t:l.t,clock:l.clock,pressure:l.pressureClock,introT:l.introT,introSpace:l.introSpace,introPointer:l.introPointer,hp:l.carrier?.hp,crew:l.crew?.map(c=>c.hp),score:l.score,lives:l.lives,focus:l.focus,charge:l.paddle.charge,fire:l.fireT,slow:l.slowT,shield:l.shield,shieldT:l.shieldT,laser:l.paddle.laserT,aim:!!l.aim,balls:l.balls.map(b=>({x:b.x,y:b.y,vx:b.vx,vy:b.vy,r:b.r,caught:b.caught,titan:b.titan||0})),drops:l.drops.length,shots:l.shots.length,keys:{...l.keys},down:l.ptr.down,archive:l.archivedCrew?.length,wave:l.encounterWave,remaining:l.waveRemaining});
const retryButton=h=>{h.api.clearButtons();h.labels.length=0;h.api.drawPause();const labels=h.labels.filter(s=>['Resume','Retry','Menu'].includes(s));assert.deepEqual(labels,['Resume','Retry','Menu']);return h.api.buttons[labels.indexOf('Retry')];};

test('Carrier/Vault pause Retry creates a fresh same-level/mode attempt without touching saved progress',()=>{
 for(const mode of DIFFICULTY_IDS)for(const index of mainHarness(mode).api.names.flatMap((name,i)=>/Carrier|Vault/.test(name)?[i]:[])){
  const h=mainHarness(mode),r=h.api;r.start(index);const baseline=snapshot(r.level),old=r.level;
  old.skipIntro?.();old.release();old.score=999;old.lives=1;old.focus=0;old.paddle.charge=1;old.fireT=4;old.slowT=3;old.shield=2;old.shieldT=6;old.paddle.laserT=4;old.dropPower(100,400,'split');h.api.seedAttempt();
  if(old.carrier){old.carrier.hp=1;old.crew[0].hp=1;old.encounterWave=2;old.archivedCrew=[{id:'fixture-secured',secured:true}];old.waveRemaining=.5;}
  const storage=copy(h.values);r.pause();assert.equal(r.scene,'pause');const paused=snapshot(old);r.tick(10);assert.deepEqual(snapshot(old),paused,'paused frames cannot advance old gameplay');
  retryButton(h).fn();assert.notEqual(r.level,old);assert.equal(r.scene,'level');assert.equal(r.index,index);assert.equal(r.mode,mode);assert.deepEqual(snapshot(r.level),baseline);
  assert.deepEqual(copy(r.control.cont),{used:0,declined:false,ad:null,toast:null,near:null,losses:null,backAt:null});assert.equal(r.control.resultT,0);assert.equal(r.control.acc,0);assert.equal(r.control.last,12345);assert.equal(r.control.paddlePointer,null);assert.equal(r.control.kitPress,null);
  assert.deepEqual(h.values,storage);assert.deepEqual(h.writes,[]);assert.deepEqual(snapshot(old),paused,'replaced level remains unchanged');
 }
});

test('pointer, held Space and orb releases from before pause cannot launch or cast into the retried attempt',()=>{
 const h=mainHarness('hard'),r=h.api;r.start(0);const old=r.level;
 h.canvasListeners.pointerdown({pointerId:11,clientX:180,clientY:680});h.listeners.keydown({key:' ',repeat:false,preventDefault(){}});
 const orb=old.kitAnchor();h.canvasListeners.pointerdown({pointerId:12,clientX:orb.x,clientY:orb.y-34});r.pause();retryButton(h).fn();
 const fresh=r.level,baseline=snapshot(fresh);fresh.paddle.charge=1;const full=snapshot(fresh);
 h.canvasListeners.pointermove({pointerId:11,clientX:320,clientY:680});h.canvasListeners.pointerup({pointerId:11,type:'pointerup',clientX:320,clientY:680});h.canvasListeners.pointerup({pointerId:12,type:'pointerup',clientX:orb.x,clientY:orb.y-34});
 h.listeners.keydown({key:' ',repeat:true,preventDefault(){}});h.listeners.keyup({key:' '});assert.deepEqual(snapshot(fresh),full);
 h.canvasListeners.pointerdown({pointerId:13,clientX:180,clientY:680});h.canvasListeners.pointerup({pointerId:13,type:'pointerup',clientX:180,clientY:680});assert.equal(fresh.aim,null);assert.equal(fresh.paddle.charge,1);
 assert.equal(baseline.balls.length,1);assert.notEqual(fresh,old);
});
