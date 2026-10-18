// Deterministic public-input assist. Never writes HP, position, resources or phase.
export function playCircuit(l,{limit=300,capture=()=>{},side=1}={}){
 const dt=1/120,powers=[],events=[],phases=[],hits=[];let lastPhase='',returns=0,lastVy=-345,planAt=-Infinity,planned=0;
 const apply=l.applyPower.bind(l),hit=l.hitTarget.bind(l);
 l.applyPower=k=>{powers.push({kind:k,t:l.clock,phase:l.phase});return apply(k);};
 l.hitTarget=(id,b,...rest)=>{const before=l.linked,hp=l.bricks.find(v=>v.id===id)?.hp;const result=hit(id,b,...rest);if(l.linked!==before||hp!==undefined&&hp!==l.bricks.find(v=>v.id===id)?.hp)hits.push({t:l.clock,id,phase:l.phase,shot:!!b.shot,fire:!!b.fire,titan:b.titan||0,linked:l.linked});return result;};
 const fold=(x,lo,hi)=>{const w=hi-lo,z=((x-lo)%(2*w)+2*w)%(2*w);return lo+(z>w?2*w-z:z);};
 const plan=(start,delay=0,bounded=true)=>{
  const n=l.currentNode();if(!n)return 0;const goal=l.platePose(n),direct=Math.atan2(goal.x-start.x,start.y-goal.y),speed=Math.max(l.speed,Math.hypot(start.vx||0,start.vy||0));
  let best={score:-Infinity,angle:Math.max(-1.1,Math.min(1.1,direct))};
  for(const angle of[direct,direct-.05,direct+.05,...Array.from({length:23},(_,i)=>-1.08+i*2.16/22)]){
   if(Math.abs(angle)>1.12)continue;const pad=start.x-angle/(62*Math.PI/180)*l.paddle.w/2;if(bounded&&(pad<l.left+l.paddle.w/2||pad>l.right-l.paddle.w/2))continue;
   const targets=structuredClone(l.targets());for(const t of targets)for(const s of t.shapes){const dx=(t.vx||0)*delay,dy=(t.vy||0)*delay;if(s.type==='rect'||s.type==='circle'){s.x+=dx;s.y+=dy;}else for(const poly of[s.points,...(s.holes||[])])for(const p of poly){p[0]+=dx;p[1]+=dy;}}
   const b={x:start.x,y:start.y,vx:Math.sin(angle)*speed,vy:-Math.cos(angle)*speed,r:start.r||8,trail:[],dead:false,caught:false};let first=null;
   globalThis.__circuitStepBall(b,2.3,{left:l.left,right:l.right,top:l.top,bottom:l.drainY,paddle:null,targets,onTarget:(id,ball)=>{if(!first)first={id,x:ball.x,y:ball.y};ball.dead=true;return true;}});
   let score=-40;if(first){const plate=first.id===n.id&&Math.abs(first.x-goal.x)<=goal.w/2+b.r+1&&Math.abs(first.y-goal.y)<=goal.h/2+b.r+1;score=plate?150:l.bricks.some(v=>v.id===first.id&&v.hp>0)?50:l.guns.some(v=>v.id===first.id&&v.hp>0)?25:-20;}
   score-=Math.abs(angle-direct)*3;if(score>best.score)best={score,angle};
  }return best.angle;
 };
 for(let i=0;i<120*limit&&l.state==='play';i++){
  if(l.phase!==lastPhase){lastPhase=l.phase;phases.push({phase:l.phase,t:l.clock,linked:l.linked,lives:l.lives});capture(l.phase,l);}
  const p=l.paddle;
  if(l.phase==='flight'){
   const n=l.currentNode(),goal=n?l.platePose(n):{x:180};const x=Math.max(l.left+40,Math.min(l.right-40,goal.x));
   if(!l.ptr.down)l.pointerDown(p.x,l.H-25);l.pointerMove(l.ptr.anchor+(x-l.ptr.padAnchor)/1.15,l.H-25);l.update(dt);continue;
  }
  if(l.phase!=='relay'){l.update(dt);continue;}
  if(l.aim){const a=l.aim,angle=plan(a.ball,0,false);l.pointerDown(p.x,l.H-25);l.pointerMove(a.anchorX+(angle-(a.base||0))/.012,l.H-25);l.update(dt);l.pointerUp();l.key(' ',false);events.push({t:l.clock,type:a.serve?'serve':'focus',angle,node:l.currentNode()?.id});}
  const falling=l.balls.filter(b=>!b.dead&&!b.caught&&b.vy>0).map(b=>({b,t:(p.y-b.r-b.y)/b.vy})).filter(v=>v.t>=-.1).sort((a,b)=>a.t-b.t)[0];
  let x=p.x;
  if(falling){const b=falling.b,impact=fold(b.x+b.vx*Math.max(0,falling.t),l.left+b.r,l.right-b.r);
   if(falling.t<.7&&falling.t>.12&&l.clock-planAt>.22){planned=plan({x:impact,y:p.y-b.r,vx:b.vx,vy:b.vy,r:b.r},falling.t);planAt=l.clock;}
   x=impact-planned/(62*Math.PI/180)*p.w/2;
  }else if(l.drops.length){const d=l.drops.toSorted((a,b)=>b.y-a.y)[0];x=d.x<180?l.right:l.left;}
  x=Math.max(l.left+p.w/2,Math.min(l.right-p.w/2,x));if(!l.ptr.down)l.pointerDown(p.x,l.H-25);l.pointerMove(l.ptr.anchor+(x-l.ptr.padAnchor)/1.15,l.H-25);
  if(l.focus<1&&falling?.t<.1)l.pointerCancel();l.update(dt);
  if(lastVy>0&&l.balls[0]?.vy<0){returns++;planAt=-Infinity;}lastVy=l.balls[0]?.vy||0;
  if(!l.balls.every(b=>Number.isFinite(b.x+b.y+b.vx+b.vy)))throw Error('Nonfinite Circuit rally');
 }
 capture(l.state,l);return{state:l.state,lives:l.lives,seconds:l.clock,linked:l.linked,phase:l.phase,burstSpent:l.burstSpent,powers,hits,phases,events,returns,noCapsules:!powers.length,phaseLinksViaNormal:hits.filter(h=>h.id.startsWith('node')&&!h.shot&&!h.fire&&!h.titan).length};
}
