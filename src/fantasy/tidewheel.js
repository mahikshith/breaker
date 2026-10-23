import { sweepTarget, overlapsTarget } from '../carrier-physics.js';
import { ejectBall } from '../clearance.js';
import { RAM, BALL_R, BACK_WARD, ramStreak, tickRam, ramThrough, endRam, powerTitle } from './ram.js';
import { difficulty } from '../difficulty.js';
// The STARFIRE (titan) ball: three units over the plain ball, so the power reads at a glance.
export const STAR_R = BALL_R + 3;
import { hpLeft } from '../near-miss.js';
import { TIDEWHEEL_V2_GEOMETRY } from './tidewheel-v2-geometry.js';
import { TIDEWHEEL_REACTIONS_GEOMETRY } from './tidewheel-reaction-geometry.js';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const mix=(a,b,t)=>a+(b-a)*clamp(t,0,1);
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
export const REFUGE_LIP_OFFSET=47;
// Measured original crusher-tip anchor relative to its raster pivot, before .88 scale/mirror.
export const CRUSHER_WATER_TIP={x:(.9439520333680917-.10801181786583247)*116,y:(.8744719875500222-.16200255669186306)*107.714286};
export function raftPoint(raft,x,y){
  return {x:raft.x+x*Math.cos(raft.angle)-y*Math.sin(raft.angle),y:raft.y+x*Math.sin(raft.angle)+y*Math.cos(raft.angle)};
}
function rectangle(pose,x,y,w,h){
  return [[x,y],[x+w,y],[x+w,y+h],[x,y+h]].map(([a,b])=>{const p=raftPoint(pose,a,b);return [p.x,p.y];});
}
function clawPoint(c,p,old=false){
  const a=old?c.previousAngle:c.angle,root=old?c.previousRoot:c.root;
  const x=p.x*c.scale*(c.mirror?-1:1),y=p.y*c.scale;
  return {x:root.x+x*Math.cos(a)-y*Math.sin(a),y:root.y+x*Math.sin(a)+y*Math.cos(a)};
}

// How far an open sluice panel winds up: to y 95-129, above the reach of Nerra's claws in every pose (a fury haul
// swings her gate claw up to y 152) and 28 px under the ceiling, so a ball neither wedges against her nor is crushed on the
// ceiling by a rising panel. Parked beside the claw at the old 32 px lift (y 191-225) a spent panel left a funnel only just
// wider than the ball against the claw and sealed the pocket above it: a ball rattled there or circled with no way down.
export const GATE_LIFT=128;
// A bounded height/current model, not a fluid simulation. Art consumes these same poses.
export class Tidewheel {
  constructor({width=360,height=780,difficulty='easy',paddleY=height-100,geometry=TIDEWHEEL_V2_GEOMETRY}={}){
    this.width=width;this.height=height;this.difficulty=difficulty;this.geometry=geometry||TIDEWHEEL_V2_GEOMETRY;
    const i=Math.max(0,['easy','medium','hard'].indexOf(difficulty));
    this.rules={hp:[24,36,46][i],interval:[11,9.5,8][i],warning:[2,1.8,1.65][i],rise:[18,22,26][i],angryRise:[30,36,42][i],current:[15,20,25][i],credits:[12,15,18][i],pulseWarning:[1.5,1.4,1.3][i],pulseSpeed:[200,230,260][i],pulseInterval:[18,16,14][i]};
    this.speed=345;this.time=0;this.state='play';this.phase='serve';this.paused=false;this.started=false;this.lives=3;this.score=0;
    this.charge=0;this.chargeBank=0;this.serial=0;this.effects=[];this.pulses=[];this.anchor=null;
    this.shots=[];this.powerMaxTimes={anchor:8,volley:3,cosmic:6};this.powerTimers={anchor:0,volley:0,cosmic:0};this.volley=null;this.cosmic=null;
    this.paddle={x:width/2,px:width/2,y:paddleY,w:100,h:14,targetX:width/2,streak:0,armed:false};
    const initial=Math.min(380,paddleY-265);
    this.water={y:initial+38,target:initial+38,initial:initial+38,limit:75+REFUGE_LIP_OFFSET,current:0};
    this.rafts=[0,1].map(n=>({id:'raft'+n,x:n?width-102:102,y:initial,px:n?width-102:102,py:initial,baseX:n?width-102:102,vx:0,vy:0,angle:0,previousAngle:0,omega:0,initial,stop:initial-20,braceHP:2,maxBraceHP:2}));
    this.bricks=this.rafts.flatMap((r,n)=>Array.from({length:12},(_,j)=>({id:'brick'+(n*12+j),raft:n,lx:-54+(j%3)*37,ly:-51+Math.floor(j/3)*21,w:34,h:18,hp:1,colour:(j+n)%3})));
    this.gates=[0,1].map(n=>({id:'gate'+n,x:n?width-25:25,y:240,w:24,h:34,hp:2,open:0,angle:0,until:0}));
    this.villain={x:width/2,y:162.36,footX:width/2,footY:232,w:190.08,h:171.072,hp:this.rules.hp,maxHP:this.rules.hp,stage:'idle',stageTime:0,pose:'idle',frame:0,anger:0,enraged:false,fury:0,furyPulse:0,emission:null,defeat:null,stunUntil:0,clawHits:0,side:1,patrolClock:0};
    this.claws=this.geometry.claws.map(part=>({...part,id:'claw'+part.side,gripLocal:part.grip,root:{x:0,y:0},previousRoot:{x:0,y:0},angle:part.side<0?-.12:.12,previousAngle:part.side<0?-.12:.12}));
    this.lumi={x:width-52,y:75,baseY:75,targetY:75,steps:0};
    this.chain={hand:{x:0,y:0},pulley:{x:310,y:244},pull:0,haul:0,scroll:0,wheelAngle:0,tension:1,released:false};
    this.nextSurge=12;this.nextPulse=22;this.teachingDone=false;this.rescueAt=0;this.serveAt=Infinity;this.attackGrace=0;this.syncAnatomy();this.serve();
  }
  pause(value=true){this.paused=!!value;}
  setTarget(x){if(Number.isFinite(x))this.paddle.targetX=clamp(x,12+this.paddle.w/2,this.width-12-this.paddle.w/2);}
  serve(){this.balls=[{id:++this.serial,x:this.paddle.x,y:this.paddle.y-15,px:this.paddle.x,py:this.paddle.y-15,vx:0,vy:0,r:BALL_R,caught:true,ram:0,ramBricks:0,contacts:new Set()}];this.phase='serve';this.serveAt=this.started?this.time+3:Infinity;}
  launch(angle=-Math.PI/2){
    if(this.paused||this.state!=='play')return false;
    const b=this.balls.find(b=>b.caught);if(!b)return false;
    const a=clamp(angle,-Math.PI+.28,-.28);b.vx=Math.cos(a)*this.speed;b.vy=Math.sin(a)*this.speed;b.caught=false;this.phase='play';
    // back in action: the continue's 6 s grace starts with this serve (the claws and the flood waited for it)
    if(this.backHold){this.backHold=false;this.attackGrace=Math.max(this.attackGrace,this.time+6);this.nextSurge=Math.max(this.nextSurge,this.attackGrace);this.nextPulse=Math.max(this.nextPulse,this.attackGrace);}
    if(!this.started){this.started=true;this.startedAt=this.time;this.nextSurge=this.time+12;this.nextPulse=this.time+22;}
    else{this.attackGrace=Math.max(this.attackGrace,this.time+3);this.nextSurge=Math.max(this.nextSurge,this.attackGrace);this.nextPulse=Math.max(this.nextPulse,this.attackGrace);}
    return true;
  }
  canActivate(kind='anchor',{ignorePause=false}={}){
    return ['anchor','volley','cosmic'].includes(kind)&&(!this.paused||ignorePause)&&this.state==='play'&&['play','serve'].includes(this.phase)&&this.charge>=100&&!Object.values(this.powerTimers).some(t=>t>0);
  }
  activate(kind='anchor'){
    if(!this.canActivate(kind))return false;
    this.charge=0;this.chargeBank=0;this.powerTimers[kind]=this.powerMaxTimes[kind];
    if(kind==='anchor'){
      this.anchor={gate:1,time:this.powerMaxTimes.anchor,maxTime:this.powerMaxTimes.anchor,angle:0,armedAt:this.time};
      this.cancelSurge();this.drain(24);this.effects.push({kind:'anchor',x:310,y:244,age:0,life:.6});
    }else if(kind==='volley')this.volley={time:3,maxTime:3,remaining:5,nextAt:0,age:0};
    else{
      const b=this.balls.find(b=>!b.caught)||this.balls[0];endRam(this,b);b.titan=this.powerMaxTimes.cosmic;b.r=STAR_R;
      this.cosmic={time:b.titan,maxTime:b.titan,ballId:b.id};
    }
    return true;
  }
  continue(){
    if(this.state!=='lost'||this.continued)return false;
    this.continued=true;this.state='play';this.lives=Math.max(1,this.lives);
    this.water.y=Math.min(this.water.initial,Math.max(this.water.y+48,this.lumi.y+REFUGE_LIP_OFFSET+40));this.water.target=this.water.y;
    this.pulses=[];this.clearPowers();this.cancelSurge();this.attackGrace=this.time+6;this.nextSurge=this.nextPulse=this.attackGrace;this.serve();
    this.serveAt=Infinity;this.ward={y:this.paddle.y+20,remaining:BACK_WARD};this.backHold=true;return true;
  }
  nearMiss(){return{line:hpLeft('NERRA',this.villain.hp),progress:1-this.villain.hp/this.villain.maxHP};} // continue panel copy
  drain(amount){this.water.target=Math.min(this.water.initial,this.water.target+amount);}
  cancelSurge(){const v=this.villain;if(v.enraged)v.anger=0;v.enraged=false;v.stage='recover';v.stageTime=0;v.clawHits=0;this.pulseWarning=null;this.pulses=[];this.nextSurge=Math.max(this.nextSurge,this.time+3);}
  creditHit(ball){
    if(ball?.powerShot||ball?.titan>0||ball?.ram>0||ball?.pierceExit?.size)return;
    this.chargeBank=Math.min(100-this.charge,this.chargeBank+100/this.rules.credits);
  }
  clearPowers(){
    this.anchor=this.volley=this.cosmic=null;this.shots=[];
    for(const key of Object.keys(this.powerTimers))this.powerTimers[key]=0;
    for(const b of this.balls||[]){b.titan=0;b.r=BALL_R;b.ram=0;b.ramBricks=0;b.pierceExit?.clear();}
  }
  updatePowers(dt){
    const launched=this.phase==='play'&&this.balls.some(b=>!b.caught);
    for(const key of Object.keys(this.powerTimers))if(key==='anchor'||launched)this.powerTimers[key]=Math.max(0,this.powerTimers[key]-dt);
    if(this.anchor){this.anchor.time=this.powerTimers.anchor;if(this.anchor.time<=0)this.anchor=null;}
    if(this.volley&&launched){
      const v=this.volley;v.time=this.powerTimers.volley;v.age+=dt;
      if(v.remaining>0&&v.age>=v.nextAt){
        const x=this.paddle.x+(v.remaining%2?16:-16),y=this.paddle.y-18;
        this.shots.push({id:++this.serial,kind:'arrow',x,y,px:x,py:y,vx:0,vy:-480,r:3,age:0,life:2,powerShot:true,from:{x,y}});
        v.remaining--;v.nextAt+=.5;
      }
      if(v.time<=0)this.volley=null;
    }
    if(this.cosmic){
      const b=this.balls.find(b=>b.id===this.cosmic.ballId);this.cosmic.time=this.powerTimers.cosmic;
      if(b)b.titan=this.cosmic.time;
      if(this.cosmic.time<=0){
        if(b){
          b.r=BALL_R;b.pierceExit=new Set(this.targets().filter(t=>t.kind&&overlapsTarget({...b,r:b.r+2},t)).map(t=>['shell','claw'].includes(t.kind)?'nerra':t.id));
        }
        this.cosmic=null;
      }
    }
  }
  updateShots(dt){
    for(const s of this.shots){
      s.px=s.x;s.py=s.y;s.age+=dt;const end={x:s.x+s.vx*dt,y:s.y+s.vy*dt};let first=null;
      for(const t of this.targets(dt)){const h=sweepTarget(s,end,s.r,t,0,dt);if(h&&(!first||h.t<first.t))first={...h,target:t};}
      if(first){
        s.x=mix(s.x,end.x,first.t);s.y=mix(s.y,end.y,first.t);s.dead=true;
        if(first.target.kind)this.hit(first.target,s);
        this.effects.push({kind:'arrow-hit',x:s.x,y:s.y,age:0,life:.25});
        if(this.phase==='rescue')return;
      }else{s.x=end.x;s.y=end.y;}
    }
    this.shots=this.shots.filter(s=>!s.dead&&s.age<s.life&&s.y>60);
  }
  updateDefeat(dt){
    const d=this.villain.defeat;d.age+=dt;
    const slump=smooth((d.age-.35)/.85);
    Object.assign(d,{stage:d.age<.35?'stagger':d.age<1.2?'faint':'slump',offsetX:Math.sin(d.age*27)*3*(1-smooth(d.age/.6)),offsetY:0,angle:slump*-.13,scaleX:1+slump*.04,scaleY:1-slump*.14,daze:clamp((d.age-.3)/.35,0,1)});
  }
  update(dt){
    if(this.paused||this.state!=='play'||!Number.isFinite(dt)||dt<=0)return;
    const steps=Math.max(1,Math.ceil(Math.min(dt,.1)*240)),h=Math.min(dt,.1)/steps;
    for(let n=0;n<steps&&this.state==='play';n++)this.step(h);
  }
  step(dt){
    this.time+=dt;
    const p=this.paddle;p.px=p.x;p.x+=clamp(p.targetX-p.x,-700*dt,700*dt);
    for(const e of this.effects)e.age+=dt;this.effects=this.effects.filter(e=>e.age<e.life);
    if(this.phase==='rescue'){
      this.updateDefeat(dt);
      this.water.y=Math.min(this.water.initial+65,this.water.y+65*dt);this.lumi.y-=14*dt;
      if(this.time-this.rescueAt>=3.6){this.state='won';this.phase='complete';}
      return;
    }
    const earned=Math.min(this.chargeBank,100/this.rules.credits*dt,100-this.charge);this.charge+=earned;this.chargeBank-=earned;
    if(this.charge>=100-1e-7){this.charge=100;this.chargeBank=0;}
    this.updatePowers(dt);
    if(this.phase==='serve'){
      const b=this.balls[0];b.x=b.px=p.x;b.y=b.py=p.y-15;
      if(this.time>=this.serveAt)this.launch();
    }
    if(this.started&&!this.backHold)this.updateMachinery(dt); // after a Continue the claws and the flood wait for the serve
    if(this.ward&&!this.backHold&&(this.ward.remaining-=dt)<=0)this.ward=null;
    for(const b of this.balls){
      if(b.caught)continue;
      b.px=b.x;b.py=b.y;
      if(b.y>=this.water.y){b.vx+=this.water.current*dt;this.normalize(b);}
      this.moveBall(b,dt);
    }
    if(this.phase==='rescue')return;
    this.updateShots(dt);
    if(this.phase==='rescue')return;
    this.updatePulses(dt);
    this.checkFallen();
    if(this.state==='play'&&this.water.y<=this.water.limit+.05){this.state='lost';this.loss='flood';}
  }
  // A ball below the paddle line costs a life (subclasses with several balls cull the extras first).
  checkFallen(){if(this.balls.some(b=>!b.caught&&b.y>this.paddle.y+32))this.loseBall('balls');}
  loseBall(reason){
    if(this.phase==='rescue'||this.state!=='play')return;
    this.pulses=[];this.clearPowers();this.cancelSurge();this.attackGrace=this.time+3;
    this.nextSurge=Math.max(this.nextSurge,this.attackGrace);this.nextPulse=Math.max(this.nextPulse,this.attackGrace);
    this.paddle.streak=0;if(--this.lives<=0){this.state='lost';this.loss=reason;}else this.serve();
  }
  beginPull(){const v=this.villain;v.attack='pull';v.stage='pullWindup';v.stageTime=0;v.clawHits=0;v.side=1;v.enraged=this.teachingDone&&v.anger>=3&&this.time>=this.startedAt+3;}
  beginPulse(){
    const v=this.villain;v.attack='pulse';v.stage='pulseWindup';v.stageTime=0;v.clawHits=0;v.side=-1;
    this.syncAnatomy();const from={...this.claws[0].muzzle},target={x:this.paddle.x,y:this.paddle.y};
    this.pulseWarning={from,source:{...from},target,targetX:target.x,angle:Math.atan2(target.y-from.y,target.x-from.x),age:0,life:this.rules.pulseWarning};
  }
  // Nerra's attacks, then the world they move (refuge, water, gates, rafts), then her body. Subclasses swap a part.
  updateMachinery(dt){this.updateAttacks(dt);this.updateWorld(dt);this.updateActor(dt);}
  updateAttacks(dt){
    const v=this.villain;v.stageTime+=dt;
    if(v.stage==='idle'&&this.time>=this.attackGrace&&!this.anchor){
      if(this.time>=this.nextSurge)this.beginPull();
      else if(this.time>=this.nextPulse&&!this.pulses.some(p=>!p.reflected))this.beginPulse();
    }
    if(v.stage==='pullWindup'&&v.stageTime>=this.rules.warning){
      this.water.target=Math.max(this.lumi.targetY+REFUGE_LIP_OFFSET,this.water.target-(v.enraged?this.rules.angryRise:this.rules.rise));
      if(v.enraged){this.lumi.steps=Math.min(3,this.lumi.steps+1);this.lumi.targetY=this.lumi.baseY+this.lumi.steps*6;v.anger=0;}
      this.teachingDone=true;v.stage='pull';v.stageTime=0;
      this.effects.push({kind:'surge',x:310,y:244,enraged:v.enraged,age:0,life:.65});
    }
    if(v.stage==='pull'&&v.stageTime>=1){v.stage='recover';v.stageTime=0;v.enraged=false;}
    if(v.stage==='pulseWindup'){
      this.pulseWarning.age=v.stageTime;
      if(v.stageTime>=this.rules.pulseWarning){
        v.stage='pulse';v.stageTime=0;this.fireWater=true;this.nextPulse=this.time+this.rules.pulseInterval;
      }
    }
    if(v.stage==='pulse'&&v.stageTime>=.6){v.stage='recover';v.stageTime=0;}
    if(v.stage==='recover'&&v.stageTime>=1.2){
      v.stage='idle';v.stageTime=0;
      if(v.attack==='pull')this.nextSurge=this.time+(this.teachingDone&&v.anger>=3?3:this.rules.interval);
    }
  }
  updateWorld(dt){
    const v=this.villain;
    this.lumi.y+=clamp(this.lumi.targetY-this.lumi.y,-20*dt,20*dt);this.water.limit=this.lumi.y+REFUGE_LIP_OFFSET;
    this.water.y+=clamp(this.water.target-this.water.y,-28*dt,20*dt);
    const targetCurrent=v.stage==='pull'?-this.rules.current:0;
    this.water.current+=(targetCurrent-this.water.current)*(1-Math.exp(-dt*3));
    for(const g of this.gates){
      g.previousY=g.y-g.open*GATE_LIFT;
      const opened=this.time<g.until||this.anchor?.gate===+g.id.at(-1);
      g.open+=clamp(Number(opened)-g.open,-dt,dt*1.5);g.angle+=opened?dt*1.2:0;
    }
    for(const r of this.rafts){
      r.px=r.x;r.py=r.y;r.previousAngle=r.angle;
      const y=clamp(this.water.y-38,r.stop,r.initial),force=(y-r.y)*16-r.vy*7;
      r.vy=clamp(r.vy+force*dt,-28,28);r.y=clamp(r.y+r.vy*dt,r.stop,r.initial);
      r.x=r.baseX+Math.sin(this.time*.65+(r.id==='raft1'?Math.PI:0))*1.5;
      r.vx=(r.x-r.px)/dt;
      const target=Math.sin(this.time*.9+(r.id==='raft1'?1.8:0))*.045+this.water.current*.001;
      r.omega+=(target-r.angle)*18*dt-r.omega*7*dt;r.angle=clamp(r.angle+r.omega*dt,-.08,.08);
    }
  }
  updateActor(dt){
    const v=this.villain;
    if(this.time>=v.stunUntil&&v.stage==='idle')v.patrolClock+=dt;
    v.footX=this.width/2+Math.sin(v.patrolClock*.65)*12;v.x=v.footX;
    v.fury=Math.max(v.anger/3,v.enraged?1:0);v.furyPulse=(.5+.5*Math.sin(this.time*9))*v.fury;
    v.pose=v.enraged?'fury':this.time<v.stunUntil?'hurt':v.fury>=1?'fury':['pullWindup','pull'].includes(v.stage)?'pull':v.stage==='idle'&&Math.floor(v.patrolClock*3)%2?'step':'idle';
    this.syncAnatomy();
    if(this.fireWater){
      const w=this.pulseWarning,s=this.rules.pulseSpeed,from={...this.claws[0].muzzle},angle=Math.atan2(w.target.y-from.y,w.target.x-from.x);
      this.pulses.push({id:++this.serial,x:from.x,y:from.y,px:from.x,py:from.y,vx:Math.cos(angle)*s,vy:Math.sin(angle)*s,r:10,age:0,life:3,from,dealt:false});
      v.emission={from,angle,at:this.time,side:-1};this.effects.push({kind:'water-muzzle',x:from.x,y:from.y,angle,age:0,life:.4});
      this.pulseWarning=null;this.fireWater=false;
    }
  }
  syncAnatomy(){
    const v=this.villain,pose=v.pose==='fury'?TIDEWHEEL_REACTIONS_GEOMETRY.nerraFury:this.geometry.poses[v.pose]||this.geometry.poses.idle;
    this.previousBody=this.body||{x:v.footX,y:v.footY,circles:pose.circles};
    this.body={x:v.footX,y:v.footY,circles:pose.circles};v.frame=pose.frame||0;
    for(const c of this.claws){
      // Sockets belong to the discrete body keypose: a socket change is a jump at step start (cleared in moveBall),
      // only the patrol translation and the claw's own rotation are swept.
      const socket=pose.sockets[c.side<0?'crusher':'gate'];c.previousAngle=c.angle;
      c.previousRoot={x:this.previousBody.x+socket.x,y:this.previousBody.y+socket.y};c.root={x:v.footX+socket.x,y:v.footY+socket.y};
      if(v.stage==='pullWindup')c.angle=c.side<0?mix(-.12,.5,smooth(v.stageTime/this.rules.warning)):.12;
      else if(v.stage==='pull')c.angle=c.side<0?mix(.5,-.12,smooth(v.stageTime/.22)):mix(.12,-.55,smooth(v.stageTime/.55));
      else if(c.side<0&&v.stage==='pulseWindup')c.angle=mix(-.12,.18,smooth(v.stageTime/this.rules.pulseWarning));
      else if(c.side<0&&v.stage==='pulse')c.angle=mix(.18,-.12,smooth(v.stageTime/.3));
      else c.angle=mix(c.angle,c.side<0?-.12:.12,.08);
      c.grip=clawPoint(c,c.gripLocal||{x:0,y:0});
      if(c.side<0)c.muzzle=clawPoint(c,CRUSHER_WATER_TIP);
    }
    const right=this.claws.find(c=>c.side>0);this.chain.hand=clawPoint(right,right.chainEnd||right.gripLocal||{x:0,y:0});
    this.chain.pull=v.stage==='pull'?smooth(v.stageTime/.55):v.stage==='recover'?1-smooth(v.stageTime/.5):0;
    const length=Math.hypot(this.chain.hand.x-this.chain.pulley.x,this.chain.hand.y-this.chain.pulley.y);
    if(v.stage==='pull')this.chain.haul+=Math.max(0,length-(this.chain.previousLength??length));
    this.chain.previousLength=length;this.chain.scroll=this.chain.haul;this.chain.wheelAngle=-this.chain.haul/28;
    this.chain.route=[{...this.chain.hand},{...this.chain.pulley},{x:327,y:244},{x:327,y:282}];
    this.chain.tension=this.chain.released?0:1;
    if(this.pulseWarning){this.pulseWarning.from={...this.claws[0].muzzle};this.pulseWarning.source={...this.claws[0].muzzle};this.pulseWarning.angle=Math.atan2(this.pulseWarning.target.y-this.claws[0].muzzle.y,this.pulseWarning.target.x-this.claws[0].muzzle.x);}
  }
  targets(dt=0){
    const targets=[];
    for(const brick of this.bricks)if(brick.hp>0){
      const r=this.rafts[brick.raft],old=dt?{x:r.px,y:r.py,angle:r.previousAngle}:r;
      const before=raftPoint(old,brick.lx+brick.w/2,brick.ly+brick.h/2),after=raftPoint(r,brick.lx+brick.w/2,brick.ly+brick.h/2);
      targets.push({id:brick.id,kind:'brick',hp:brick.hp,type:'poly',points:rectangle(old,brick.lx,brick.ly,brick.w,brick.h),vx:dt?(after.x-before.x)/dt:0,vy:dt?(after.y-before.y)/dt:0});
    }
    for(const r of this.rafts){
      const old=dt?{x:r.px,y:r.py,angle:r.previousAngle}:r;
      const before=raftPoint(old,0,41),after=raftPoint(r,0,41);
      const shapes=[{id:'deck'+r.id+':left',points:[[-57,34],[-35,34],[-35,48],[-54,48]]},{id:'deck'+r.id+':right',points:[[35,34],[57,34],[54,48],[35,48]]}];
      if(r.braceHP>0)shapes.push({id:'brace'+r.id,kind:'brace',raft:r.id,points:[[-35,34],[35,34],[35,48],[-35,48]]});
      for(const shape of shapes)targets.push({...shape,type:'poly',points:shape.points.map(([x,y])=>{const p=raftPoint(old,x,y);return[p.x,p.y];}),vx:dt?(after.x-before.x)/dt:0,vy:dt?(after.y-before.y)/dt:0});
    }
    for(const [i,c] of this.body.circles.entries()){
      // A keypose is discrete artwork; only the physical patrol translates its local stencil.
      // Do not sweep unrelated disk indices through empty space when the pose changes.
      const before=dt?this.previousBody:this.body;
      targets.push({id:i?'shell'+i:'shell',kind:'shell',type:'circle',x:before.x+c.x,y:before.y+c.y,r:c.r,vx:dt?(this.body.x-before.x)/dt:0,vy:dt?(this.body.y-before.y)/dt:0});
    }
    for(const c of this.claws)for(const [i,disk] of c.circles.entries()){
      const p=clawPoint(c,disk,!!dt),now=clawPoint(c,disk);
      targets.push({id:i?c.id+':'+i:c.id,kind:'claw',clawSide:c.side,type:'circle',x:p.x,y:p.y,r:disk.r*c.scale,vx:dt?(now.x-p.x)/dt:0,vy:dt?(now.y-p.y)/dt:0});
    }
    for(const g of this.gates){const y=g.y-g.open*GATE_LIFT,old=dt?(g.previousY??y):y;targets.push({id:g.id,kind:g.hp>0?'gate':undefined,type:'rect',x:g.x-g.w/2,y:old-g.h/2,w:g.w,h:g.h,vy:dt?(y-old)/dt:0});}
    return targets;
  }
  // Nerra's shell and claws can land on a ball (keypose swap, a claw outpacing it): push it clear along the contact normal.
  clearNerra(b,targets){
    if(b.titan>0||b.pierceExit?.has('nerra'))return;
    const ok=(x,y)=>x>=12+b.r&&x<=this.width-12-b.r&&y>=67+b.r&&!this.gates.some(g=>Math.abs(x-g.x)<g.w/2+b.r&&Math.abs(y-(g.y-g.open*GATE_LIFT))<g.h/2+b.r);
    const boss=targets.filter(t=>t.kind==='shell'||t.kind==='claw');
    const touched=boss.map(t=>({t,d:t.r+b.r-Math.hypot(b.x-t.x,b.y-t.y)})).sort((p,q)=>q.d-p.d)[0];
    const c=ejectBall(b,boss,{ok});if(!c)return;
    this.normalize(b);
    // Moving into it is a real contact and scores like a swept one (same one-hit-per-episode rule).
    if(c.reflected&&!b.contacts.has('nerra')&&this.time-(b.lastNerraHit??-Infinity)>=.1){b.contacts.add('nerra');b.lastNerraHit=this.time;this.hit(touched.t,b);}
  }
  moveBall(b,dt){
    tickRam(this,b,dt);
    this.clearNerra(b,this.targets(dt));
    let left=dt;
    for(let bounce=0;bounce<5&&left>1e-7;bounce++){
      const targets=this.targets(dt);
      for(const id of b.contacts)if(id!=='nerra'&&!targets.some(t=>t.id===id&&overlapsTarget({...b,r:b.r+.15},t)))b.contacts.delete(id);
      // Shell and claws are one compound actor. A seam cannot award several hits.
      if(!targets.some(t=>['shell','claw'].includes(t.kind)&&overlapsTarget({...b,r:b.r+2},t)))b.contacts.delete('nerra');
      for(const id of b.pierceExit||[])if(!targets.some(t=>(id==='nerra'?['shell','claw'].includes(t.kind):t.id===id)&&overlapsTarget({...b,r:b.r+2},t)))b.pierceExit.delete(id);
      targets.push({id:'left',type:'rect',x:-20,y:0,w:32,h:this.height},{id:'right',type:'rect',x:this.width-12,y:0,w:32,h:this.height},{id:'top',type:'rect',x:0,y:0,w:this.width,h:67});
      if(b.vy>0)targets.push({id:'paddle',type:'rect',x:this.paddle.x-this.paddle.w/2,y:this.paddle.y-this.paddle.h/2,w:this.paddle.w,h:this.paddle.h});
      if(b.vy>0&&this.ward)targets.push({id:'ward',type:'rect',x:12,y:this.ward.y,w:this.width-24,h:4}); // the continue Ward: a plain wall, no hit
      const end={x:b.x+b.vx*left,y:b.y+b.vy*left};let first=null;
      for(const t of targets){
        const episode=['shell','claw'].includes(t.kind)?'nerra':t.id;
        if(b.pierceExit?.has(episode)||(b.titan>0&&t.kind&&b.contacts.has(episode)))continue;
        const hit=sweepTarget(b,end,b.r,t,dt-left,left);if(hit&&(!first||hit.t<first.t))first={...hit,target:t};
      }
      if(!first){b.x=end.x;b.y=end.y;break;}
      b.x+=b.vx*left*first.t;b.y+=b.vy*left*first.t;left*=1-first.t;
      const t=first.target,piercing=b.titan>0&&!!t.kind,normal=(b.vx-(t.vx||0))*first.nx+(b.vy-(t.vy||0))*first.ny;
      // A ram ploughs through the raft bricks: they break and the flight continues unchanged (braces, gates, decks and Nerra bounce it).
      if(t.kind==='brick'&&ramThrough(this,b,t,()=>this.hit(t,b))){if(this.phase==='rescue')return;if(first.t<1e-6)left=Math.max(0,left-1e-5);continue;}
      if(t.id==='paddle'){
        const u=clamp((b.x-this.paddle.x)/(this.paddle.w/2),-.9,.9),angle=-Math.PI/2+u*1.05;
        b.vx=Math.cos(angle)*this.speed;b.vy=Math.sin(angle)*this.speed;ramStreak(this,b,u);
      }else if(!piercing&&normal<0){b.vx-=2*normal*first.nx;b.vy-=2*normal*first.ny;this.normalize(b);}
      if(piercing){const speed=Math.hypot(b.vx,b.vy);b.x+=b.vx/speed*.06;b.y+=b.vy/speed*.06;}
      else{b.x+=first.nx*.06;b.y+=first.ny*.06;}
      const boss=['shell','claw'].includes(t.kind),episode=boss?'nerra':t.id;
      if(t.kind&&!b.contacts.has(episode)&&(!boss||this.time-(b.lastNerraHit??-Infinity)>=.1)){
        b.contacts.add(episode);if(boss)b.lastNerraHit=this.time;
        this.hit(t,b);if(this.phase==='rescue')return;
      }
      if(first.t<1e-6)left=Math.max(0,left-1e-5);
    }
    this.clearNerra(b,this.targets());
  }
  updatePulses(dt){
    for(const q of this.pulses){
      q.px=q.x;q.py=q.y;const end={x:q.x+q.vx*dt,y:q.y+q.vy*dt};q.age+=dt;
      if(q.reflected){q.x=end.x;q.y=end.y;continue;}
      let first=null;
      for(const b of [...this.balls,...this.shots]){
        if(b.caught)continue;
        const t={type:'circle',x:b.px,y:b.py,r:b.r,vx:(b.x-b.px)/dt,vy:(b.y-b.py)/dt};
        const h=sweepTarget(q,end,q.r,t,0,dt);if(h&&(!first||h.t<first.t))first={...h,ball:b};
      }
      const p=this.paddle,t={type:'rect',x:p.px-p.w/2,y:p.y-p.h/2,w:p.w,h:p.h,vx:(p.x-p.px)/dt};
      const hit=sweepTarget(q,end,q.r,t,0,dt);if(hit&&(!first||hit.t<first.t))first={...hit,paddle:true};
      if(!first){q.x=end.x;q.y=end.y;continue;}
      q.x=mix(q.x,end.x,first.t);q.y=mix(q.y,end.y,first.t);
      this.effects.push({kind:'water-hit',x:q.x,y:q.y,age:0,life:.6,blocked:!first.paddle});
      if(first.paddle){q.dealt=true;this.loseBall('water-pulse');break;}
      if(first.ball.powerShot)first.ball.dead=true;
      const vn=q.vx*first.nx+q.vy*first.ny;q.vx-=2*vn*first.nx;q.vy-=2*vn*first.ny;q.reflected=true;q.harmless=true;q.life=q.age+.45;
    }
    this.pulses=this.pulses.filter(q=>q.age<q.life&&q.x>-40&&q.x<this.width+40&&q.y<this.height+30);
    this.shots=this.shots.filter(s=>!s.dead);
  }
  ramPierce(target){return target.kind==='brick';}
  normalize(b){const v=this.speed,s=Math.hypot(b.vx,b.vy)||v;b.vx*=v/s;b.vy*=v/s;if(Math.abs(b.vy)<75){b.vy=Math.sign(b.vy||-1)*75;b.vx=Math.sign(b.vx||1)*Math.sqrt(v**2-75**2);}}
  hit(target,b){
    this.effects.push({kind:'hit',x:b.x,y:b.y,age:0,life:.3});
    if(target.kind==='brace'){
      const r=this.rafts.find(r=>r.id===target.raft||'brace'+r.id===target.id);if(!r||r.braceHP<=0)return;
      r.braceHP--;r.braceHitAt=this.time;this.score+=15;
      if(r.braceHP===0)r.braceBrokenAt=this.time;
      this.effects.push({kind:r.braceHP?'brace-hit':'brace-break',x:b.x,y:b.y,raft:r.id,angle:r.angle,hp:r.braceHP,age:0,life:r.braceHP?.3:.65,vx:b.vx*.08,vy:b.vy*.08});
      this.creditHit(b);return;
    }
    if(target.kind==='brick'){
      const brick=this.bricks.find(q=>q.id===target.id);if(!brick||brick.hp<=0)return;brick.hp--;this.score+=25;
      const centre=raftPoint(this.rafts[brick.raft],brick.lx+brick.w/2,brick.ly+brick.h/2);
      this.effects.push({kind:'brick-break',x:centre.x,y:centre.y,w:brick.w,h:brick.h,colour:brick.colour,vx:b.vx*.07,vy:b.vy*.06,age:0,life:.65});
      this.creditHit(b);return;
    }
    if(target.kind==='gate'){
      const g=this.gates.find(g=>g.id===target.id);if(!g||g.hp<=0)return;g.hp--;
      if(g.hp===0){g.until=Infinity;this.drain(24);this.score+=75;}
      return;
    }
    if(!['shell','claw'].includes(target.kind)||this.phase==='rescue')return;
    const v=this.villain,star=b.titan>0;v.hp=Math.max(0,v.hp-(star?difficulty(this.difficulty).powers.strong:b.ram>0?RAM.damage:1));if(star)powerTitle(this,'STARFIRE SCORCHES NERRA',b.x,b.y);this.score+=50;v.stunUntil=this.time+.4;v.anger=Math.min(3,v.anger+1);
    this.creditHit(b);
    if(target.kind==='claw'&&['pullWindup','pulseWindup'].includes(v.stage)&&(target.clawSide===v.side||target.id==='claw'+v.side)&&++v.clawHits>=2)this.cancelSurge();
    if(this.teachingDone&&v.anger>=3&&v.stage==='idle')this.nextSurge=Math.min(this.nextSurge,Math.max(this.time+3,this.attackGrace));
    if(v.hp===0){
      this.phase='rescue';this.rescueAt=this.time;v.stage='defeated';v.pose='hurt';
      v.defeat={age:0,stage:'stagger',offsetX:0,offsetY:0,angle:0,scaleX:1,scaleY:1,daze:0};
      this.chain.released=true;this.chain.tension=0;this.pulses=[];this.pulseWarning=null;this.clearPowers();
      for(const g of this.gates)g.until=Infinity;
    }
  }
}
