import { ART } from './vault-art.js';
import { difficulty } from './difficulty.js';
import { Arena } from './arena.js';
import { loadImg, ready, drawBall, drawStretchPaddle, glazedBar } from './gfx.js';
import { sweepTarget } from './carrier-physics.js';
import { sfx } from './audio.js';
import { RAM } from './fantasy/ram.js';
import { drawEnemyBolt, drawPlayerBolt, drawEnemyImpact, drawWeaponCharge, nextEnemyVolley, enemyEscapeLane } from './space-weapons.js';
import { drawLatchJam } from './space-companions.js';
import { drawLiveSkiff } from './skiff.js';

const TAU = Math.PI * 2;
const clamp = v => Math.max(0, Math.min(1, v));
const ease = v => { v = clamp(v); return v * v * (3 - 2 * v); };
const mix = (a, b, t) => a + (b - a) * t;
function transform(points, x, y, w, h, angle = 0, pivot = [.5, .5]) {
  const c = Math.cos(angle), s = Math.sin(angle);
  return points.map(([u, v]) => { const dx = (u - pivot[0]) * w, dy = (v - pivot[1]) * h; return [x + dx * c - dy * s, y + dx * s + dy * c]; });
}
function clipPolygon(points, boundary) {
  let area = 0; for (let i = 0; i < boundary.length; i++) { const a = boundary[i], b = boundary[(i + 1) % boundary.length]; area += a[0] * b[1] - b[0] * a[1]; }
  const sign = area < 0 ? -1 : 1;
  for (let i = 0; i < boundary.length && points.length; i++) {
    const a = boundary[i], b = boundary[(i + 1) % boundary.length], side = p => ((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0])) * sign, next = [];
    for (let j = 0; j < points.length; j++) { const p = points[j], q = points[(j + 1) % points.length], sp = side(p), sq = side(q); if (sp >= 0) next.push(p); if ((sp >= 0) !== (sq >= 0)) { const t = sp / (sp - sq); next.push([mix(p[0], q[0], t), mix(p[1], q[1], t)]); } }
    points = next;
  }
  return points;
}
function clip(g, x, y, w, h, draw) { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); draw(); g.restore(); }

function clipCircle(g,x,y,r,draw){g.save();g.beginPath();g.arc(x,y,r,0,TAU);g.clip();draw();g.restore();}
export class Relay extends Arena {
  constructor(W,H,uiScale=1,difficultyId='medium',data=ART.relayCircuit) {
    if(typeof difficultyId==='object'){data=difficultyId;difficultyId='medium';}
    super(W,H,{accent:'#a795ef',top:68,left:10,right:10,minPaddleY:470,uiScale,paddleWidth:125,paddleHeight:29,ballRadius:8});
    if(!data?.parts?.bHull?.collision||!data.parts.portLeft?.collision)throw Error('Circuit needs measured B machinery and port leaves');
    this.parts=Object.fromEntries(Object.entries(data.parts).filter(([id])=>id!=='bWorker').map(([id,p])=>[id,{...p,img:loadImg(p.url)}]));
    this.assembly=data.assembly;this.motion=data.motion;
    this.difficulty=difficulty(difficultyId).id;
    this.rules={easy:{hullHP:72,stationHP:2,gunHP:3,warn:1.8,spacing:5.5,speed:210,burst:10},medium:{hullHP:96,stationHP:3,gunHP:4,warn:1.5,spacing:4.5,speed:240,burst:9},hard:{hullHP:120,stationHP:4,gunHP:5,warn:1.3,spacing:3.8,speed:270,burst:8}}[this.difficulty];
    this.name='Circuit Breakout';this.subtitle='Break through. Bring down the mothership.';this.spacePowers=true;this.companionId='vesper';this.coreMode='manual';this.coreHits=difficulty(this.difficulty).companionHits;
    this.phase='relay';this.clock=0;this.started=false;this.serveAge=0;this.serveLimit=8;this.hp=this.maxHP=this.rules.hullHP;
    const armour=new Set([1,4,14,15]),payloads={8:'laser',19:'split',25:'shield'};
    this.bricks=Array.from({length:30},(_,i)=>{const part=armour.has(i)?'brick_armour':(Math.floor(i/6)+i)%2?'brick_violet':'brick_cyan',rect=[21+i%6*54,294+Math.floor(i/6)*21,48,17],hp=armour.has(i)?2:1;return{id:`circuit-panel${i}`,part,hp,maxHP:hp,hurt:0,art:armour.has(i)?this.fit(part,[rect[0]+15.5,rect[1],17,17]):this.panelArt(part,rect),payload:payloads[i]||null};});
    this.nodes=this.assembly.pods.map((p,i)=>({...p,id:`node${i}`,index:i,hp:this.rules.stationHP,maxHP:this.rules.stationHP,hurt:0}));
    this.guns=this.parts.bCannonBarrel.mounts.map(([x,y],i)=>({id:`circuit-gun${i}`,index:i,x,y,hp:this.rules.gunHP,maxHP:this.rules.gunHP,hurt:0}));
    this.attack=null;this.nextAttack=3.2;this.attackIndex=0;this.bolts=[];this.serial=0;this.burstSpent=false;this.burstRemaining=0;this.queuedPowers=[];this.openedAt=null;this.escapeAt=null;
    this.hullContacts=new WeakMap();this.volleyRandom=Math.random;this.previousPattern=null;this.enemyGraceUntil=0;this.weaponImpacts=[];this.skiffFiredAt=[-Infinity,-Infinity];this.skiffAmmo=12;
  }
  spacePowerAvailable(){return this.state==='play'&&this.phase==='relay';}
  chooseSpacePower(kind){const result=super.chooseSpacePower(kind);if(!result)return false;const c=this.guns.find(c=>c.hp>0&&(c.jamUntil||0)<=this.clock&&this.attack?.sources?.some(s=>s.id===c.id&&!s.done))||this.guns.find(c=>c.hp>0&&(c.jamUntil||0)<=this.clock);if(c){c.jamAngle=-this.cannonPose(c).angle;c.jamUntil=this.clock+6;const s=this.attack?.sources?.find(s=>s.id===c.id);if(s){s.cancelled=true;s.done=true;}this.jamTargetId=c.id;}return result;}
  panelArt(id,[x,y,w,h]){const p=this.parts[id],b=p.artBounds,fw=w/b[2],fh=h/b[3];return{x:x+w/2-(b[0]+b[2]/2-p.pivot[0])*fw,y:y+h/2-(b[1]+b[3]/2-p.pivot[1])*fh,w:fw,h:fh,rect:{x,y,w,h}};}
  irisPose(at=this.clock){return this.openedAt===null?0:ease((at-this.openedAt)/.8);}
  portPose(node,at=this.clock){
    if(node.portAt===undefined)return 0;const age=at-node.portAt;
    return Math.min(ease(age/.4),1-ease((age-this.rules.warn-1.25)/.45));
  }
  leafTargets(node,at=this.clock){const open=this.portPose(node,at)*24;return['portLeft','portRight'].map((key,i)=>this.polygon(key,node.x+(i?open:-open),node.y,...this.parts[key].display));}
  cannonPose(c,at=this.clock){
    const candidate=this.attack?.sources?.find(s=>s.id===c.id)||((this.attack?.id===c.id)?this.attack:null),active=c.hp>0&&!candidate?.cancelled?candidate:null,age=active?at-active.started:-1;
    const warn=active?.warning??this.rules.warn,turn=active?.angle||0,last=active?.lastShotAt??(active?.fired?active.started+warn:Infinity),fireAge=at-last;
    let aim=turn*(active?.fired?1-ease((fireAge-.2)/.8):ease(age/.3));
    if(c.jamUntil&&at<c.jamUntil+.3)aim=(c.jamAngle||0)*(at<c.jamUntil?1:1-ease((at-c.jamUntil)/.3));
    const recoil=fireAge>=0&&fireAge<.2?Math.sin(fireAge/.2*Math.PI)*5:0;
    return{x:c.x-Math.sin(aim)*recoil,y:c.y-Math.cos(aim)*recoil,angle:-aim,active,age};
  }
  targets(rate=1,at=this.clock){
    const out=[],add=(id,shapes,extra={})=>out.push({id,active:true,shapes,...extra});
    for(const b of this.bricks)if(b.hp>0)add(b.id,[{type:'rect',...b.art.rect}],{hp:b.hp});
    for(const n of this.nodes)if(n.hp>0){
      const leafVx=(this.portPose(n,at+.001)-this.portPose(n,at))*24/.001*rate;
      this.leafTargets(n,at).forEach((shape,i)=>add(n.id,[shape],{hp:n.hp,vx:i?leafVx:-leafVx}));
    }
    const hull=this.assembly.hull;
    add('circuit-hull',[this.polygon('bHull',hull.x,hull.y,...this.parts.bHull.display),...this.irisShapes(at)],{hp:this.hp,pierceable:false});
    for(const c of this.guns){const p=this.cannonPose(c,at),q=this.cannonPose(c,at+.001);add(c.id,[this.polygon('bCannonBarrel',p.x,p.y,...this.parts.bCannonBarrel.display,p.angle)],{...(c.hp>0?{hp:c.hp}:{}),pierceable:c.hp>0,vx:(q.x-p.x)/.001*rate,vy:(q.y-p.y)/.001*rate});}
    for(const b of this.bolts)if(!b.dead)add(b.id,[{type:'circle',x:b.x,y:b.y,r:b.r}],{solid:false,vx:b.vx*rate,vy:b.vy*rate});
    return out;
  }
  // Sweet-Spot Ram: one-hit panels plough; armoured panels, relay nodes, hull and cannons bounce it (villain parts take RAM.damage).
  ramPierce(t){return!!t&&this.bricks.some(b=>b.id===t.id&&b.maxHP===1);}
  world(){const targets=this.targets(1/Math.max(.001,this.timeScale*(this.slowT>0?.68:1)));return{...super.world(),targets,onTarget:(id,b)=>{const live=this.hitTarget(id,b);if(!live)for(const t of targets)if(t.id===id)t.active=false;return live;}};}
  hitTarget(id,b){
    if(this.state!=='play'||!['relay','flight'].includes(this.phase))return true;
    const bolt=this.bolts.find(s=>s.id===id);if(bolt){if(!bolt.dead){bolt.dead=true;this.addScore(20);this.recordWeaponImpact(bolt,bolt);}return false;}
    if(id==='circuit-hull'){this.damageHull(b);return true;}
    const gun=this.guns.find(g=>g.id===id);
    if(gun){if(gun.hp>0){gun.hp=Math.max(0,gun.hp-(b.shot?1:b.titan>0?4:b.fire?3:b.ram>0?RAM.damage:1));gun.hurt=.14;if(!gun.hp){const s=this.attack?.sources?.find(s=>s.id===id);if(s){s.cancelled=true;s.done=true;}else if(this.attack?.id===id)this.attack=null;}}this.damageHull(b);return true;}
    const obj=this.bricks.find(o=>o.id===id)||this.nodes.find(o=>o.id===id)||this.guns.find(o=>o.id===id);if(!obj)return true;if(obj.hp<=0)return this.guns.includes(obj);
    if(b.pulse!==undefined&&obj.lastPulse===b.pulse)return true;obj.lastPulse=b.pulse;
    const brick=this.bricks.includes(obj),node=this.nodes.includes(obj),damage=b.shot?1:b.titan>0?4:b.fire?(brick?obj.hp:3):b.ram>0&&!brick&&!node?RAM.damage:1;
    obj.hp=Math.max(0,obj.hp-damage);obj.hurt=.14;this.addScore(brick?15:70);this.fx.ring(b.x,b.y,brick?'#a0dfff':'#e8a8ef',10);this.bump(.06,brick?0:.012);sfx.tough();
    this.chargeSpacePower(b);
    if(!obj.hp){if(brick||node){this.brokeBrick();if(obj.payload)this.dropPower(obj.art.rect.x+obj.art.rect.w/2,obj.art.rect.y+obj.art.rect.h,obj.payload);if(node)this.fx.ring(obj.x,obj.y,'#adbbeb',28);}else if(this.attack?.id===id)this.attack=null;}
    return obj.hp>0||this.guns.includes(obj);
  }
  damageHull(b){
    if(this.hp<=0||this.hullContacts.get(b)===this.clock)return;
    if(b.pulse!==undefined&&this.lastHullPulse===b.pulse)return;
    this.hullContacts.set(b,this.clock);this.lastHullPulse=b.pulse;
    this.hp=Math.max(0,this.hp-(b.shot?1:b.titan>0?4:b.fire?3:b.ram>0?RAM.damage:1));this.chargeSpacePower(b);this.addScore(70);this.fx.ring(b.x,b.y,'#b9deff',16);sfx.tough();
    if(!this.hp)this.finishCircuit();else if(this.hp<=this.maxHP/2&&!this.burstSpent){this.burstPending=true;if(this.phase==='relay'){this.phase='launch';this.freezeBalls();}}
  }
  freezeBalls(){this.aim=null;for(const b of this.balls)if(!b.dead){b.caught=true;b.trail.length=0;}this.shots.length=0;}
  beginBurst(){if(this.burstSpent)return;this.burstPending=false;this.burstSpent=true;this.burstRemaining=this.rules.burst;this.skiffAmmo=12;this.skiffFiredAt=[-Infinity,-Infinity];this.phase='launch';this.morphAge=0;this.flightCd=0;this.freezeBalls();this.attack=null;this.bolts.length=0;this.inputEpoch++;this.pointerCancel();this.keys={};this.timeScale=1;this.fx.pop(this.W/2,this.paddle.y-75,'SKIFF BURST','#b3e7ff',19);}
  finishCircuit(){this.endingCraft=['launch','flight','return'].includes(this.phase)?{x:this.paddle.x,y:this.paddle.y-10}:null;this.hp=0;this.openedAt=this.clock;this.escapeAt=this.clock;this.phase='escape';this.powerMenuOpen=false;this.attack=null;this.bolts.length=this.shots.length=0;this.freezeBalls();this.inputEpoch++;this.pointerCancel();this.keys={};this.timeScale=1;this.addScore(2200+300*this.lives);this.fx.pop(this.W/2,210,'MOTHERSHIP DISABLED','#b5e4ff',21);sfx.win();}
  serve(){super.serve();this.serveAge=0;this.serveLimit=this.started?3:8;}
  release(){if(this.state!=='play'||this.phase!=='relay')return;const serve=this.aim?.serve;super.release();if(serve&&!this.aim){this.started=true;this.serveAge=0;if(this.returnServe){this.returnServe=false;for(const [i,b]of this.balls.entries())if(b.caught){const a=Math.atan2(this.balls[0].vx,-this.balls[0].vy)+(i%2?1:-1)*Math.ceil(i/2)*.09;b.caught=false;b.vx=Math.sin(a)*this.speed;b.vy=-Math.cos(a)*this.speed;}const queued=this.queuedPowers.splice(0);for(const k of queued)super.applyPower(k);this.nextAttack=this.clock+3;}}}
  pointerDown(x,y){if(!this.powerMenuOpen&&this.state==='play'&&['relay','flight'].includes(this.phase))super.pointerDown(x,y);}
  pointerMove(x,y){if(!this.powerMenuOpen&&this.state==='play'&&['relay','flight'].includes(this.phase))super.pointerMove(x,y);}
  pointerUp(){if(this.powerMenuOpen)return;if(this.phase==='relay'&&this.ptr.down)super.pointerUp();else this.ptr.down=false;}
  key(k,down){if(this.powerMenuOpen){super.key(k,down);return;}if(k===' '&&this.suppressedSpace){if(!down)this.suppressedSpace=false;return;}if(!['relay','flight'].includes(this.phase)){if(k===' '&&down)this.suppressedSpace=true;return;}if(k===' '&&(!down&&!this.keys[k]||this.phase==='flight'))return;super.key(k,down);}
  update(dtReal){
    if(this.powerMenuOpen||this.state!=='play')return;
    if(this.phase==='escape'){this.clock+=dtReal;this.fx.update(dtReal,this.drainY);if(this.clock-this.escapeAt>=1.7)this.win();return;}
    if(this.burstPending)this.beginBurst();
    if(this.phase==='launch'||this.phase==='return'){this.clock+=dtReal;this.kitTime+=dtReal;this.morphAge+=dtReal;this.fx.update(dtReal,this.drainY);if(this.morphAge>=.45){if(this.phase==='launch')this.phase='flight';else this.endBurst();}return;}
    if(this.phase==='flight'){
      this.clock+=dtReal;this.t+=dtReal;this.kitTime+=dtReal;this.moveCraft(dtReal);this.updateCircuit(dtReal);if(this.phase!=='flight')return;
      this.updateBolts(dtReal);if(this.phase!=='flight')return;this.updateFlightShots(dtReal);if(this.phase!=='flight')return;this.updateFlightDrops(dtReal);this.fx.update(dtReal,this.drainY);
      this.burstRemaining=Math.max(0,this.burstRemaining-dtReal);if(this.burstRemaining<=0)this.startReturn();return;
    }
    this.levelUpdated=false;super.update(dtReal);
    if(!this.levelUpdated&&this.state==='play'&&this.phase==='relay')this.updateLevel(0,dtReal);
    if(this.burstPending)this.beginBurst();
  }
  updateLevel(dt,dtReal=dt){this.levelUpdated=true;if(this.state!=='play'||this.phase!=='relay')return;if(this.aim?.serve){this.serveAge+=dtReal;if(this.serveAge>=this.serveLimit)this.release();}if(!this.started)return;this.clock+=dtReal;this.updateCircuit(dtReal);this.updateBolts(dtReal);}
  updateCircuit(dt){
    this.weaponImpacts=this.weaponImpacts.filter(h=>this.clock-h.at<.32);
    for(const o of [...this.nodes,...this.guns,...this.bricks])o.hurt=Math.max(0,o.hurt-dt);
    if(!this.attack&&this.clock>=this.nextAttack&&this.clock>=this.enemyGraceUntil&&!this.bolts.length){
      const v=nextEnemyVolley(this.difficulty,this.previousPattern,this.volleyRandom);this.previousPattern=v.pattern;
      if(v.pattern==='quiet'){this.nextAttack=this.clock+v.cooldown;return;}
      const indices=v.pattern==='both'?[0,1]:[v.pattern==='left'?0:1],guns=indices.map(i=>this.guns[i]).filter(c=>c.hp>0&&(c.jamUntil||0)<=this.clock);
      if(!guns.length){this.nextAttack=this.clock+v.cooldown;return;}
      this.attack={...v,started:this.clock,fired:false,sources:guns.map((c,i)=>({id:c.id,started:this.clock+i*.85,warning:v.warning,shotIndex:0,fired:false,done:false}))};
    }
    const a=this.attack;if(!a?.sources)return;
    for(const s of a.sources){
      if(s.done||this.clock<s.started)continue;const c=this.guns.find(c=>c.id===s.id);
      if(!c||c.hp<=0||(c.jamUntil||0)>this.clock){s.done=true;s.cancelled=true;continue;}
      if(s.angle===undefined){const dy=this.paddle.y-c.y;s.angle=Math.max(-.2,Math.min(.2,Math.atan2(this.paddle.x-c.x,dy)));s.targetY=this.paddle.y;s.targetX=c.x+Math.tan(s.angle)*dy;this.nodes[c.index?3:0].portAt=s.started;
        if(!enemyEscapeLane(this.paddle,this.left,this.right,s.targetX,a.r)){s.done=true;s.cancelled=true;continue;}}
      const due=s.started+a.warning+a.shots[s.shotIndex];
      if(this.clock+1e-9>=due){
        const p=this.cannonPose(c),from={x:p.x-Math.sin(p.angle)*8,y:p.y+Math.cos(p.angle)*8},to={x:from.x+Math.tan(s.angle)*(s.targetY-from.y),y:s.targetY},port=this.nodes[c.index?3:0];
        const end={x:from.x+Math.tan(s.angle)*(port.y+45-from.y),y:port.y+45},clear=port.hp<=0||this.targets().filter(t=>t.id===port.id).every(t=>!sweepTarget(from,end,a.r,t));
        if(!clear||!enemyEscapeLane(this.paddle,this.left,this.right,to.x,a.r)){s.done=true;s.cancelled=true;continue;}
        this.bolts.push({id:`circuit-bolt${this.serial++}`,sourceId:c.id,...from,from,bornAt:this.clock,vx:Math.sin(s.angle)*a.speed,vy:Math.cos(s.angle)*a.speed,r:a.r,colour:'circuit',kind:a.kind});
        s.lastShotAt=this.clock;s.fired=true;a.fired=true;s.shotIndex++;if(s.shotIndex>=a.shots.length)s.done=true;sfx.zap();
      }
    }
    if(a.sources.every(s=>s.done)&&!this.bolts.length&&this.clock>=Math.max(...a.sources.map(s=>s.lastShotAt??s.started))+1.1){this.attack=null;this.nextAttack=this.clock+a.cooldown;}
  }
  recordWeaponImpact(b,p){this.weaponImpacts.push({...p,vx:b.vx,vy:b.vy,r:b.r,colour:b.colour||'player',at:this.clock});if(this.weaponImpacts.length>12)this.weaponImpacts.shift();}
  coverTargets(at=this.clock){return this.targets(1,at).filter(t=>!t.id.startsWith('circuit-bolt')&&!t.id.startsWith('circuit-gun')&&t.id!=='circuit-hull');}
  updateBolts(dt){
    if(!(dt>0)||this.state!=='play'||!['relay','flight'].includes(this.phase))return;
    for(const s of this.bolts){if(s.dead)continue;const from={x:s.x,y:s.y},to={x:s.x+s.vx*dt,y:s.y+s.vy*dt};let first=null;
      const probe=(target,kind)=>{const hit=sweepTarget(from,to,s.r,target,0,dt);if(hit&&(!first||hit.t<first.hit.t))first={hit,kind};};
      // Enemy ordnance is player-seeking fire; intact field panels never absorb it.
      if(this.phase==='relay')for(const b of this.balls)if(!b.dead&&(b.caught||this.hitStop>0))probe({vx:b.caught?this.paddle.vx:0,shapes:[{type:'circle',x:b.x-(b.caught?this.paddle.vx*dt:0),y:b.y,r:b.r}]},'ball');
      const p=this.paddle,craft=this.craftPose();probe({vx:p.vx,shapes:[this.phase==='flight'?this.polygon(craft.key,craft.x-p.vx*dt,craft.y,80,60):{type:'rect',x:p.x-p.w/2-p.vx*dt,y:p.y,w:p.w,h:p.h}]},'player');
      s.x=to.x;s.y=to.y;if(first){s.dead=true;this.recordWeaponImpact(s,first.hit);if(first.kind==='player'){if(this.phase==='flight')this.startReturn();else if(this.clock>=this.enemyGraceUntil){this.enemyGraceUntil=this.clock+3;this.balls.length=0;this.aim=null;this.shots.length=0;this.loseBall();return;}}else if(first.kind==='ball')this.addScore(20);}
      if(s.y-s.r>this.drainY||s.x< -20||s.x>this.W+20)s.dead=true;
    }this.bolts=this.bolts.filter(s=>!s.dead);
  }
  shotHit(s,previousY=s.y,dt=0){return this.sweepShot(s,{x:s.x,y:previousY},dt);}
  sweepShot(s,from,dt){let first=null;const r=s.r||2,rate=this.phase==='relay'?1/Math.max(.001,this.timeScale):1,at=this.phase==='flight'?this.clock-dt:this.clock;for(const t of this.targets(rate,at)){const hit=sweepTarget(from,s,r,t,0,dt);if(hit&&(!first||hit.t<first.hit.t))first={t,hit};}if(!first)return false;this.recordWeaponImpact(s,first.hit);this.hitTarget(first.t.id,{x:first.hit.x,y:first.hit.y,r,shot:true,pulse:s.pulse});return true;}
  updateShots(dt){if(this.phase==='relay')super.updateShots(dt);else if(this.phase!=='flight')this.shots.length=0;}
  moveCraft(dt){const p=this.paddle,prev=p.x;let x=p.x;if(this.ptr.down){x=this.ptr.padAnchor+(this.ptr.x-this.ptr.anchor)*1.15;const lo=this.left+40,hi=this.right-40;if(x<lo||x>hi){x=Math.max(lo,Math.min(hi,x));this.ptr.padAnchor=x;this.ptr.anchor=this.ptr.x;}}if(this.keys.ArrowLeft)x-=460*dt;if(this.keys.ArrowRight)x+=460*dt;p.x=Math.max(this.left+40,Math.min(this.right-40,p.x+(x-p.x)*Math.min(1,dt*45)));p.vx=(p.x-prev)/dt;}
  craftPose(){return{key:this.paddle.vx< -50?'craftLeft':this.paddle.vx>50?'craftRight':'craftFlight',x:this.paddle.x,y:this.paddle.y-10};}
  craftAnchor(uv){const p=this.craftPose();return{x:p.x+(uv[0]-.5)*80,y:p.y+(uv[1]-.5)*60};}
  updateFlightShots(dt){
    this.flightCd-=dt;
    if(this.flightCd<=0&&this.skiffAmmo>0){
      const p=this.paddle,candidates=[{id:'circuit-hull',x:this.assembly.iris.x,y:this.assembly.iris.y},...this.guns.filter(c=>c.hp>0),...this.nodes.filter(n=>n.hp>0),...this.bricks.filter(b=>b.hp>0).map(b=>({id:b.id,x:b.art.x,y:b.art.y}))];
      const art=this.parts[this.craftPose().key],side=this.serial%2,from=this.craftAnchor(art.muzzles[side]);
      const goal=candidates.find(c=>c.y<from.y&&Math.abs(Math.atan2(c.x-from.x,from.y-c.y))<=Math.PI/10&&this.targets().some(t=>t.id===c.id&&sweepTarget(from,c,2,t)));
      if(goal){const a=Math.atan2(goal.x-from.x,from.y-goal.y);this.shots.push({x:from.x,y:from.y,vx:Math.sin(a)*560,vy:-Math.cos(a)*560,r:6.8,size:37,from:{...from},bornAt:this.clock,colour:'player',muzzleFlash:false,pulse:this.serial++});this.skiffFiredAt[side]=this.clock;this.skiffAmmo--;this.flightCd=.38;sfx.zap();}
    }
    for(const s of this.shots){const from={x:s.x,y:s.y};s.x+=(s.vx||0)*dt;s.y+=s.vy*dt;if(this.sweepShot(s,from,dt)||s.y<this.top)s.dead=true;}
    this.shots=this.shots.filter(s=>!s.dead);
    if(this.phase==='flight'&&this.skiffAmmo===0&&(!this.shots.length||this.clock-Math.max(...this.skiffFiredAt)>1.35))this.startReturn();
  }
  updateFlightDrops(dt){for(const d of this.drops){d.vy+=120*dt;d.y+=d.vy*dt;if(d.y>this.paddle.y-40&&d.y<this.paddle.y+15&&Math.abs(d.x-this.paddle.x)<50){d.got=true;this.queuedPowers.push(d.kind);}}this.drops=this.drops.filter(d=>!d.got&&d.y<this.drainY);}
  startReturn(){if(this.phase!=='flight')return;this.phase='return';this.morphAge=0;this.attack=null;this.bolts.length=this.shots.length=0;this.suppressedSpace=!!this.keys[' '];this.pointerCancel();this.keys={};this.inputEpoch++;}
  endBurst(){this.phase='relay';this.returnServe=true;this.balls=this.balls.filter(b=>!b.dead);if(!this.balls.length)super.serve();else this.inputEpoch++;for(const b of this.balls){b.caught=true;b.x=this.paddle.x;b.y=this.paddle.y-b.r-1;b.trail.length=0;}this.aim={ball:this.balls[0],angle:0,serve:true,t:0,anchorX:this.ptr.x};this.serveAge=0;this.serveLimit=3;this.hitStop=0;this.timeScale=1;this.nextAttack=this.clock+3;this.fx.ring(this.paddle.x,this.paddle.y-10,'#aee9ff',36);}
  applyPower(k){if(['launch','flight','return'].includes(this.phase)||this.returnServe){this.queuedPowers.push(k);return;}if(this.state==='play'&&this.phase==='relay')super.applyPower(k);}
  loseBall(){if(this.state!=='play'||this.phase!=='relay')return;super.loseBall();this.attack=null;this.bolts.length=0;this.nextAttack=this.clock+3;this.enemyGraceUntil=this.clock+3;}
  continueRun(){if(this.state!=='lost')return;this.attack=null;this.bolts.length=this.shots.length=0;this.balls.length=0;this.aim=null;this.phase='relay';this.nextAttack=this.clock+3;super.continueRun();this.serveLimit=3;}
  drawDeck(g){super.drawDeck(g);}
  drawEnemyBolts(g){for(const b of this.bolts)drawEnemyBolt(g,b,this.clock-b.bornAt);for(const h of this.weaponImpacts)drawEnemyImpact(g,h,this.clock-h.at);}
  drawBalls(g){if(this.phase!=='relay'||this.state!=='play')return;this.drawShots(g);for(const b of this.balls){if(b.dead)continue;if(b.titan>0||b.ram>0){drawBall(g,b);continue;}const a=this.fit('ball',[b.x-b.r,b.y-b.r,b.r*2,b.r*2]);this.part(g,'ball',a.x,a.y,a.w,a.h);}}
  drawNodeEnergy(g,n){
    // A projected phase coil, not a solid cartridge: scan gaps expose the window behind it.
    // Its projector retracts before the real port fires; the actual metal frame owns armour hits.
    const open=this.portPose(n),active=n.hp>0,cyan=n.index%2===0;
    const time=this.clock+(this.started?0:this.serveAge),pulse=.9+.1*Math.sin(time*4+n.index);
    const alpha=(1-open)*pulse*(active?.8:0);if(alpha<=.01)return;
    const rgb=cyan?'88,218,255':'190,105,255';g.save();g.globalAlpha=alpha;
    g.beginPath();g.rect(n.x-21,n.y-17,42,34);g.clip();
    const halo=g.createRadialGradient(n.x,n.y,2,n.x,n.y,21);halo.addColorStop(0,`rgba(${rgb},.35)`);halo.addColorStop(1,`rgba(${rgb},0)`);
    g.fillStyle=halo;g.fillRect(n.x-22,n.y-21,44,42);
    const wall=g.createLinearGradient(n.x-10,n.y,n.x+10,n.y);wall.addColorStop(0,`rgba(${rgb},.6)`);wall.addColorStop(.25,`rgba(${rgb},.05)`);wall.addColorStop(.75,`rgba(${rgb},.05)`);wall.addColorStop(1,`rgba(${rgb},.6)`);
    g.fillStyle=wall;for(let i=0;i<6;i++)g.fillRect(n.x-10,n.y-14+i*5,20,2);
    for(let i=0;i<5;i++){
      const y=n.y-12+i*6,x=n.x+Math.sin(time*2.8+i*.85+n.index)*1.1,rx=10.5-Math.abs(i-2)*.6;
      g.strokeStyle=`rgba(${rgb},.3)`;g.lineWidth=3;g.beginPath();g.ellipse(x,y,rx,1.9,0,0,TAU);g.stroke();
      g.strokeStyle=cyan?'#a7f5ff':'#ebbbff';g.lineWidth=1.1;g.beginPath();g.ellipse(x,y,rx,1.9,0,.15,Math.PI+.25);g.stroke();
    }
    g.strokeStyle=`rgba(${rgb},.65)`;g.lineWidth=.65;g.setLineDash([1,2]);g.beginPath();g.moveTo(n.x,n.y-15);g.lineTo(n.x,n.y+15);g.stroke();g.setLineDash([]);
    g.fillStyle=`rgba(${rgb},.25)`;g.beginPath();g.ellipse(n.x,n.y+16,12,2,0,0,TAU);g.fill();
    g.restore();
  }
  drawNode(g,n){if(n.hp<=0)return;this.drawNodeEnergy(g,n);const open=this.portPose(n)*24;for(const[key,sign]of[['portLeft',-1],['portRight',1]])this.part(g,key,n.x+sign*open,n.y);}
  draw(g){
    this.paintBackground(g,-this.backgroundViewport?.top||0,this.backgroundViewport?.height||this.H);
    const iris=this.assembly.iris,open=this.irisPose(),hull=this.assembly.hull;
    if(this.openedAt!==null)this.part(g,'bPortal',iris.x,iris.y,undefined,undefined,-.04*this.clock,.85);
    clipCircle(g,iris.x,iris.y,iris.radius,()=>{for(let i=0;i<6;i++){const a=i*TAU/6,r=open*this.motion.iris.radialTravel;this.part(g,'bIris',iris.x+Math.sin(a)*r,iris.y-Math.cos(a)*r,undefined,undefined,a+open*this.motion.iris.rotationRadians);}});
    this.part(g,'bHull',hull.x,hull.y);
    for(const c of this.guns){const p=this.cannonPose(c);this.part(g,'bCannonBarrel',p.x,p.y,undefined,undefined,p.angle,c.hp>0?1:.4);drawLatchJam(g,this,c);}
    for(const n of this.nodes)this.drawNode(g,n);
    for(const b of this.bricks)if(b.hp>0){const a=b.art;this.part(g,b.part,a.x,a.y,a.w,a.h,0,b.hurt>0?.65:1);if(b.hp<b.maxHP){g.strokeStyle='#2d2642';g.lineWidth=1;g.beginPath();g.moveTo(a.x-5,a.y-4);g.lineTo(a.x,a.y+2);g.lineTo(a.x+5,a.y-4);g.stroke();}if(b.payload){const p=this.fit(`capsule_${b.payload}`,[a.rect.x+a.rect.w/2-9,a.rect.y+a.rect.h/2-4.5,18,9]);this.part(g,`capsule_${b.payload}`,p.x,p.y,p.w,p.h);}}
    for(const s of this.attack?.sources||[]){if(s.cancelled||s.done||this.clock<s.started||s.angle===undefined)continue;const c=this.guns.find(c=>c.id===s.id),p=this.cannonPose(c),from={x:p.x-Math.sin(p.angle)*8,y:p.y+Math.cos(p.angle)*8},progress=clamp((this.clock-s.started)/s.warning);drawWeaponCharge(g,from,Math.PI/2-s.angle,progress,'circuit');}
    clip(g,0,0,this.W,this.playClipY,()=>{this.drawEnemyBolts(g);this.drawDrops(g);if(this.state==='play')this.fx.draw(g);});
    if(['launch','flight','return'].includes(this.phase))this.drawCraft(g);else if(this.phase==='escape'){if(this.endingCraft){const k=ease((this.clock-this.escapeAt)/1.6),w=80*(1-k*.5);this.part(g,'craftFlight',mix(this.endingCraft.x,iris.x,k),mix(this.endingCraft.y,iris.y,k),w,w*.75,0,1-ease((k-.9)/.1));}else this.drawPaddle(g);}else{this.drawPaddle(g);this.drawBalls(g);this.drawAim(g);}
    this.drawDeck(g);this.drawHUD(g);if(this.debugGeometry)this.drawGeometry(g);
  }
  drawCraft(g){drawLiveSkiff(g,this);if(this.phase==='flight')for(const s of this.shots)drawPlayerBolt(g,s,this.clock-s.bornAt);}
  drawHUD(g){this.drawHUDBase(g);const s=this.kitUIScale,y=this.hudY+39/s;glazedBar(g,110/s,y-1/s,140/s,5/s,this.hp/this.maxHP,'#ecdcff','#8a63d0');if(this.phase==='flight'){g.fillStyle='#a4d8f1';g.fillRect(135/s,y+9/s,80/s*Math.min(this.burstRemaining/this.rules.burst,this.skiffAmmo/12),2/s);}}
  inspect(){return{state:this.state,phase:this.phase,difficulty:this.difficulty,clock:this.clock,hp:this.hp,maxHP:this.maxHP,nodes:this.nodes.map(n=>({id:n.id,hp:n.hp,port:this.portPose(n)})),guns:this.guns.map(c=>({id:c.id,hp:c.hp})),burstSpent:this.burstSpent,burstRemaining:this.burstRemaining,queued:[...this.queuedPowers],iris:this.irisPose(),attack:this.attack&&{...this.attack},paddle:{...this.paddle},targets:this.targets()};}
  result(){return{stars:this.state==='won'?1+(this.lives>=2?1:0)+(this.guns.every(g=>g.hp===0)?1:0):0,lines:[['Score',this.score.toLocaleString()],['Mothership',this.hp===0?'Disabled':`${this.hp} / ${this.maxHP}`],['Lives left',this.lives]]};}
  part(g, id, x, y, w, h, angle = 0, alpha = 1) {
    const p = this.parts[id]; if (!ready(p) || alpha <= 0) return;
    [w, h] = w === undefined ? p.display : [w, h];
    g.save(); g.translate(x, y); g.rotate(angle); g.globalAlpha *= alpha;
    g.drawImage(p.img, -p.pivot[0] * w, -p.pivot[1] * h, w, h); g.restore();
  }
  fit(id, [x, y, w, h]) {
    const p = this.parts[id], b = p.artBounds, k = Math.min(w / (p.display[0] * b[2]), h / (p.display[1] * b[3]));
    const fw = p.display[0] * k, fh = p.display[1] * k, aw = fw * b[2], ah = fh * b[3];
    return { x: x + w / 2 - (b[0] + b[2] / 2 - p.pivot[0]) * fw, y: y + h / 2 - (b[1] + b[3] / 2 - p.pivot[1]) * fh, w: fw, h: fh, rect: { x: x + (w - aw) / 2, y: y + (h - ah) / 2, w: aw, h: ah } };
  }
  polygon(id, x, y, w, h, angle = 0) {
    const p = this.parts[id], c = p.collision;
    return { type: 'polygon', points: transform(c.points, x, y, w, h, angle, p.pivot), holes: c.holes.map(loop => transform(loop, x, y, w, h, angle, p.pivot)) };
  }
  irisShapes(at = this.clock) {
    const a = this.assembly.iris, p = this.parts.bIris, open = this.irisPose(at), boundary = Array.from({ length: 48 }, (_, i) => [a.x + Math.cos(i * TAU / 48) * a.radius, a.y + Math.sin(i * TAU / 48) * a.radius]);
    return Array.from({ length: 6 }, (_, i) => {
      const angle = i * TAU / 6, travel = open * this.motion.iris.radialTravel;
      const shape = this.polygon('bIris', a.x + Math.sin(angle) * travel, a.y - Math.cos(angle) * travel, ...p.display, angle + open * this.motion.iris.rotationRadians);
      return { type: 'polygon', points: clipPolygon(shape.points, boundary) };
    }).filter(s => s.points.length >= 3);
  }
  drawPaddleArt(g,p){drawStretchPaddle(g,this.parts.paddle,p);}
  drawDrops(g) { for (const d of this.drops) { const a = this.fit(`capsule_${d.kind}`, [d.x - 18, d.y - 9, 36, 18]); this.part(g, `capsule_${d.kind}`, a.x, a.y, a.w, a.h); } }
  paintBackground(g, y, height) {
    const p = this.parts.bBackground; if (!ready(p)) return;
    const k = Math.max(this.W / p.img.width, height / p.img.height); g.drawImage(p.img, this.W - p.img.width * k, y + height - p.img.height * k, p.img.width * k, p.img.height * k);
  }
  background(){return this.parts.bBackground.img;}
  drawFullBleedBackground(g, top, height) { this.backgroundViewport = { top, height }; this.paintBackground(g, 0, height); }
  previewRect() { return { x: 0, y: 78, w: this.W, h: 310 }; }
  drawGeometry(g) {
    g.save(); g.strokeStyle = '#91eec9'; g.lineWidth = .6;
    for (const t of this.targets()) for (const s of t.shapes) { g.beginPath(); if (s.type === 'rect') g.rect(s.x, s.y, s.w, s.h); else if (s.type === 'circle') g.arc(s.x, s.y, s.r, 0, TAU); else for (const loop of [s.points, ...(s.holes || [])]) { loop.forEach(([x,y], i) => i ? g.lineTo(x,y) : g.moveTo(x,y)); g.closePath(); } g.stroke(); }
    g.strokeRect(this.paddle.x - this.paddle.w / 2, this.paddle.y, this.paddle.w, this.paddle.h); g.restore();
  }

}
