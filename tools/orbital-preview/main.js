import { Orbital } from '../../src/orbital.js';
import { unlockAudio } from '../../src/audio.js';
import { text } from '../../src/gfx.js';
const cv=document.querySelector('canvas'),g=cv.getContext('2d'),safe=new URLSearchParams(location.search).get('safe')?.split(',').map(Number)||[0,0];
const W=360,LIFT=34;let scale,top,H,level,pointer=null,paused=false;
function reset(){const fh=Math.round(Math.max(600,Math.min(880,W*innerHeight/innerWidth)));scale=Math.min(innerWidth/W,innerHeight/fh);top=safe[0]/scale-LIFT;H=Math.round(fh-(safe[0]+safe[1])/scale)+LIFT;cv.width=innerWidth*devicePixelRatio;cv.height=innerHeight*devicePixelRatio;cv.style.width=`${innerWidth}px`;cv.style.height=`${innerHeight}px`;level=new Orbital(W,H,scale);level.hudY=LIFT;pointer=null;paused=false;return level;}
const point=e=>[e.clientX/scale,e.clientY/scale-top];
function pause(value){paused=value;if(pointer!==null&&cv.hasPointerCapture(pointer))cv.releasePointerCapture(pointer);pointer=null;level.pointerCancel();level.keys={};draw();}
cv.addEventListener('pointerdown',e=>{unlockAudio();if(e.clientX<48&&e.clientY>=safe[0]&&e.clientY<safe[0]+44){pause(!paused);return;}if(paused)return;const[x,y]=point(e);if(level.state!=='play'){if(x>=100&&x<=260&&y>=H/2+15&&y<=H/2+52){level.state==='won'?reset():level.continueRun();draw();}return;}if(pointer===null){pointer=e.pointerId;cv.setPointerCapture(pointer);level.pointerDown(x,y);}});
cv.addEventListener('pointermove',e=>{if(!paused&&pointer===e.pointerId)level.pointerMove(...point(e));});
for(const type of ['pointerup','pointercancel'])cv.addEventListener(type,e=>{if(pointer===e.pointerId){pointer=null;paused||type==='pointercancel'?level.pointerCancel():level.pointerUp();}});
addEventListener('blur',()=>pause(true));
addEventListener('keydown',e=>{if(e.key===' '||e.key.startsWith('Arrow'))e.preventDefault();if(e.key==='Escape'){pause(!paused);return;}if(e.key==='r'){reset();return;}if(paused)return;if(e.key==='Enter'&&level.state==='lost')level.continueRun();else if(level.state==='play')level.key(e.key,true);});
addEventListener('keyup',e=>{if(!paused&&level.keys[e.key])level.key(e.key,false);});addEventListener('resize',reset);
function draw(){g.setTransform(devicePixelRatio*scale,0,0,devicePixelRatio*scale,0,top*scale*devicePixelRatio);g.fillStyle='#060a13';g.fillRect(0,-top,W,H+top);level.draw(g);g.fillStyle='#8b9aaf';for(const x of [15,22])g.fillRect(x/scale,LIFT+10/scale,3/scale,15/scale);if(paused||level.state!=='play'){g.fillStyle='rgba(9,14,24,.96)';g.fillRect(36,H/2-57,288,122);text(g,paused?'PAUSED':level.state==='won'?'COMPLETE · PROTOTYPE':'OUT OF BALLS',180,H/2-33,20,'#c8ddeb','center');if(!paused){text(g,`${level.pods.filter(p=>p.hp<=0).length} / 3 crew safe`,180,H/2-6,16,'#a6c8d2','center');g.fillStyle='#374558';g.fillRect(100,H/2+15,160,37);text(g,level.state==='won'?'Retry':'Continue',180,H/2+33,17,'#d6e3ed','center');}}}
function advance(s){for(let i=0;i<Math.round(s*120);i++)if(!paused)level.update(1/120);draw();}
reset();let prev=performance.now(),acc=0;function frame(t){acc+=Math.min(.05,(t-prev)/1000);prev=t;while(acc>=1/120){if(!paused)level.update(1/120);acc-=1/120;}draw();requestAnimationFrame(frame);}requestAnimationFrame(frame);
window.OP={reset,draw,advance,get level(){return level;},get mapping(){return{scale,top,H,safe,paused};}};
