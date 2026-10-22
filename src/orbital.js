// Selected Shutter Forge; isolated until its actual-art and gameplay review is complete.
import { Arena } from './arena.js';
import { makeBall } from './physics.js';
import { sweepTarget, overlapsTarget } from './carrier-physics.js';
import { loadImg, ready, text, drawBall, drawStretchPaddle } from './gfx.js';
import { ART } from './vault-art.js';
import { sfx } from './audio.js';
import { RAM } from './fantasy/ram.js';
import { difficulty } from './difficulty.js';
import { drawEnemyBolt, drawEnemyImpact, drawWeaponCharge, drawWeaponMuzzle, nextEnemyVolley, enemyEscapeLane } from './space-weapons.js';

const DATA = typeof FORGE_DATA === 'undefined' ? ART.orbitalForge : FORGE_DATA;
const TAU = Math.PI * 2, OPEN_TIME = .4, COLLAPSE = .8, PROJECT = 1.2;
const MODES = { easy: { hp: 18, hull: 54, open: 10, warning: 1.5, gun: 6, core: 12 }, medium: { hp: 22, hull: 66, open: 9, warning: 1.35, gun: 7, core: 15 }, hard: { hp: 26, hull: 78, open: 7.5, warning: 1.25, gun: 8, core: 18 } };
const clamp = n => Math.max(0, Math.min(1, n));
const ease = n => { n = clamp(n); return n*n*(3-2*n); };
const mix = (a,b,t) => a+(b-a)*t;
const STATIONS = [{id:'stabiliser0',x:116.644737,y:306.769737},{id:'stabiliser1',x:246.907895,y:306.769737},{id:'stabiliser2',x:180.592105,y:340.815789}];
const cache = new WeakMap();
function images(data) {
  if (!cache.has(data)) cache.set(data, Object.fromEntries(Object.entries(data.parts).map(([id,p]) => [id,{...p,img:loadImg(p.url || p.path)}])));
  return cache.get(data);
}
function point(p,u,v) {
  const x=(u-(p.px ?? .5))*p.w,y=(v-(p.py ?? .5))*p.h,c=Math.cos(p.angle || 0),s=Math.sin(p.angle || 0);
  return [p.x+x*c-y*s,p.y+x*s+y*c];
}
function geometry(part,p) {
  return (part.shapes || []).map(s=>({type:'polygon',points:s.points.map(([x,y])=>point(p,x,y)),holes:s.holes?.map(h=>h.map(([x,y])=>point(p,x,y)))}));
}
function boxShape(r) { return {type:'rect',...r}; }
function clipBelow(points,y) {
  const out=[];
  for(let i=0;i<points.length;i++) { const a=points[i],b=points[(i+1)%points.length],aa=a[1]>=y,bb=b[1]>=y;if(aa)out.push(a);if(aa!==bb){const t=(y-a[1])/(b[1]-a[1]);out.push([mix(a[0],b[0],t),y]);} }
  return out;
}
export const ORBITAL_LAYOUT = {
  bricks: [242,265,288,311,334,357,380,403].flatMap((y,row)=>[10,52,94,136,178,220,262,304].flatMap((x,col)=>{
    if(STATIONS.some(s=>x<s.x+31&&x+36>s.x-31&&y<s.y+30&&y+17>s.y-30))return[];
    const armour=row===1&&(col===0||col===7),payload=({'52,288':'burst','304,288':'shield','52,380':'split','304,380':'wide'})[x+','+y]||null;
    return[{id:`panel${row}-${col}`,x,y,w:36,h:17,kind:armour?'armour':(row+col)%3===0?'violet':'cyan',payload,hp:armour?2:1}];
  })),
  stations: STATIONS,
  mounts: [{id:'gun0',x:62.5,y:190},{id:'gun1',x:305,y:190}],
  core: {id:'core',x:180,y:246},
};

export class Orbital extends Arena {
  constructor(W,H,uiScale=1,modeId='medium',artData=DATA) {
    super(W,H,{accent:'#8ce3f1',top:68,left:10,right:10,minPaddleY:470,uiScale,paddleWidth:125,paddleHeight:17,ballRadius:7.5});
    if(!artData?.parts?.hull?.shapes)throw new Error('Forge needs its reviewed actual-art manifest');
    this.data=artData;this.parts=images(artData);this.layout=ORBITAL_LAYOUT;
    this.difficulty=Object.hasOwn(MODES,modeId)?modeId:'medium';this.rules=MODES[this.difficulty];
    this.name='Shutter Forge';this.subtitle='Break the mothership. Use the openings for bonus damage.';
    this.spacePowers=true;this.coreMode='manual';this.coreHits=difficulty(this.difficulty).companionHits;
    this.phase='forge';this.clock=0;this.stage='anticipate';this.stageAt=0;this.activeIndex=0;this.teachDone=false;this.started=false;
    this.stations=this.layout.stations.map(s=>({...s,hp:this.rules.hp,maxHP:this.rules.hp,hurt:0}));
    this.bricks=this.layout.bricks.map(b=>({...b,maxHP:b.hp,hurt:0}));
    this.guns=this.layout.mounts.map(g=>({...g,hp:this.rules.gun,maxHP:this.rules.gun,hurt:0}));
    this.core={...this.layout.core,hp:this.rules.core,maxHP:this.rules.core,hurt:0};
    this.hull={id:'hull',hp:this.rules.hull,maxHP:this.rules.hull,hurt:0};
    this.bolts=[];this.enemyImpacts=[];this.attack=null;this.serial=0;this.shards=[];this.rewardGranted=false;this.serveAge=0;this.serveLimit=8;this.debugGeometry=false;this.shipEpisodes=new WeakSet();
    this.companionId='forge';this.volleyPattern=null;this.weaponRandom=Math.random;
  }
  combat() { return this.state==='play'&&(this.phase==='forge'||this.phase==='core'); }
  spacePowerAvailable() { return this.combat(); }
  pointerDown(x,y) { if(this.combat()&&!this.powerMenuOpen)super.pointerDown(x,y); }
  pointerMove(x,y) { if(this.combat()&&!this.powerMenuOpen)super.pointerMove(x,y); }
  pointerUp() { if(this.combat()&&!this.powerMenuOpen&&this.ptr.down)super.pointerUp();else this.ptr.down=false; }
  key(k,down) { if(this.powerMenuOpen){super.key(k,down);return;}if(this.combat())super.key(k,down);else this.keys[k]=false; }
  serve() { super.serve();this.serveAge=0;this.serveLimit=this.started?3:8; }
  release() {
    if(!this.combat()||this.powerMenuOpen)return;
    const serve=this.aim?.serve;super.release();
    if(serve&&!this.aim) {
      if(this.fanServe) { const angle=Math.atan2(this.balls[0].vx,-this.balls[0].vy);for(let i=1;i<this.balls.length;i++){const b=this.balls[i],a=angle+(i%2?1:-1)*Math.ceil(i/2)*.22;b.caught=false;b.vx=Math.sin(a)*this.speed;b.vy=-Math.cos(a)*this.speed;}this.fanServe=false; }
      if(!this.started){this.started=true;this.stageAt=this.clock;}
    }
  }
  bossPose(at=this.clock) {
    if(this.attack?.boss)return this.attack.boss;
    const idle={x:Math.sin(at*.7)*1.2,y:Math.sin(at*.9)*.8};
    if(this.bossResume){const t=ease((at-this.bossResume.at)/.5);return{x:mix(this.bossResume.x,idle.x,t),y:mix(this.bossResume.y,idle.y,t)};}
    return idle;
  }
  pose(id,x,y,width=null,angle=0,pivot=[.5,.5]) { const p=this.parts[id],w=width||p.display[0];return{x,y,w,h:w*p.size[1]/p.size[0],angle,px:pivot[0],py:pivot[1]}; }
  hullPose(at=this.clock) { const b=this.bossPose(at);return this.pose('hull',180+b.x,76+this.data.machinery.displayHeight/2+b.y,360); }
  stationPose(s) { return this.pose('station_body',s.x,s.y,55); }
  coverOpen(s,at=this.clock) {
    if(s.hp<=0)return mix(s.disabledCover??1,1,ease((at-(s.disabledAt??-Infinity))/.35));
    if(this.stations[this.activeIndex]!==s)return 0;
    const age=at-this.stageAt;
    return this.stage==='opening'?ease(age/OPEN_TIME):this.stage==='open'?1:this.stage==='closing'?1-ease(age/OPEN_TIME):0;
  }
  coverPose(s,at=this.clock) { return this.pose('station_cover',s.x-27.5,s.y,55,-this.coverOpen(s,at)*Math.PI*.58,[0,.5]); }
  cannonPose(g,at=this.clock) {
    const b=this.bossPose(at),s=this.attack?.sources?.find(s=>s.id===g.id&&!s.cancelled),age=s?at-s.started:-1;
    const settle=s?.next>=this.attack?.shots?.length?1-ease((at-s.firedAt-.32)/.5):1,angle=s&&age>=0?s.angle*ease(age/.25)*settle:0;
    const recoil=s?this.attack.shots.reduce((sum,offset)=>{const t=age-this.attack.warning-offset;return sum+(t>=0&&t<.24?Math.sin(t/.24*Math.PI)*(this.attack.kind==='heavy'?8:5.5):0);},0):0;
    return this.pose('cannon',g.x+b.x+Math.sin(angle)*recoil,g.y+b.y-Math.cos(angle)*recoil,42,angle,[.5,.23]);
  }
  muzzle(g,at=this.clock) { const [x,y]=point(this.cannonPose(g,at),.5,.82);return{x,y}; }
  projectorPose(at=this.clock) {
    const b=this.bossPose(at),p=this.parts.reactor,focus=p.artBounds[1]+p.artBounds[3]/2,h=55*p.size[1]/p.size[0];
    const progress=this.phase==='projection'?ease((at-this.transitionAt)/PROJECT):1;
    return this.pose('projector_arm',180+b.x,246+b.y-(focus-.5)*h-80*(1-progress),55);
  }
  coreOpen() { return this.phase==='core'||this.phase==='ending'||this.state==='won'; }
  coilVulnerable(s) { return this.phase==='forge'&&s.hp>0&&this.stations[this.activeIndex]===s&&this.stage==='open'; }
  brickPose(b) { const id=b.kind==='armour'?'armour':b.kind==='violet'||b.payload?'violet':'cyan',p=this.parts[id],w=Math.min(b.w,b.h*p.size[0]/p.size[1]);return{id,pose:this.pose(id,b.x+b.w/2,b.y+b.h/2,w)}; }
  targets(rate=1) {
    const out=[],add=(id,part,p,extra={})=>out.push({id,active:true,pierceable:false,shapes:geometry(this.parts[part],p),...extra});
    const velocity=(p,q)=>({vx:(q.x-p.x)/.001*rate,vy:(q.y-p.y)/.001*rate});
    const h=this.hullPose(),hn=this.hullPose(this.clock+.001);if(this.phase!=='core')add('hull','hull',h,velocity(h,hn));
    if(this.phase==='forge') for(const s of this.stations) {
      if(s.hp<=0&&this.clock-s.disabledAt>=.35)continue;
      const p=this.stationPose(s),a=this.coverPose(s),shapes=[...geometry(this.parts.station_body,p),...geometry(this.parts.station_coil,p),...geometry(this.parts.station_cover,a)];
      out.push({id:s.hp>0?s.id:s.id+':spent',active:true,pierceable:false,shapes});
    }
    for(const b of this.bricks)if(b.hp>0){const p=this.brickPose(b);add(b.id,p.id,p.pose,{hp:b.hp,pierceable:b.kind!=='armour'});}
    if(this.phase!=='core')for(const g of this.guns){const p=this.cannonPose(g),q=this.cannonPose(g,this.clock+.001);add(g.hp>0?g.id:g.id+':spent','cannon',p,velocity(p,q));}
    if(this.phase==='core') {
      const p=this.projectorPose(),q=this.projectorPose(this.clock+.001);
      const shapes=geometry(this.parts.projector_arm,p).map(s=>({...s,points:clipBelow(s.points,185),holes:s.holes?.map(h=>clipBelow(h,185)).filter(h=>h.length>=3)})).filter(s=>s.points.length>=3);
      // One physical boss episode prevents overlapping arm/hull parts from double charging the same contact.
      shapes.push(...geometry(this.parts.reactor,p),...geometry(this.parts.hull,h),...this.guns.flatMap(g=>geometry(this.parts.cannon,this.cannonPose(g))));
      out.push({id:'core',active:true,pierceable:false,hp:this.core.hp,shapes,...velocity(p,q)});
    }
    for(const s of this.bolts)if(!s.dead)out.push({id:s.id,active:true,solid:false,vx:s.vx*rate,vy:s.vy*rate,shapes:[{type:'circle',x:s.x,y:s.y,r:s.r}]});
    return out;
  }
  // Sweet-Spot Ram: plain panels plough; armour panels, coils, hull, guns and the core bounce it (villain parts take RAM.damage).
  ramPierce(t) { return !!t&&this.bricks.some(b=>b.id===t.id&&b.kind!=='armour'); }
  world() {
    const targets=this.targets(1/Math.max(.001,this.timeScale*(this.slowT>0?.68:1)));
    const ship=targets.filter(t=>t.id==='hull'||t.id==='core'||this.guns.some(g=>t.id===g.id||t.id===g.id+':spent'));
    // Mount and hull contours share one contact episode, rearmed only after the ball leaves the whole ship.
    for(const b of this.balls)if(!ship.some(t=>overlapsTarget({...b,r:b.r+.02},t)))this.shipEpisodes.delete(b);
    return{...super.world(),targets,onTarget:(id,b)=>{
      if(ship.some(t=>t.id===id)){if(this.shipEpisodes.has(b))return true;this.shipEpisodes.add(b);}
      const alive=this.hitTarget(id,b);if(!alive)for(const t of targets)if(t.id===id)t.active=false;return alive;
    }};
  }
  hitTarget(id,b={}) {
    if(!this.combat()||this.powerMenuOpen)return false;
    const bolt=this.bolts.find(s=>s.id===id);
    if(bolt){if(!bolt.dead){bolt.dead=true;this.addScore(20);this.enemyImpact(bolt,bolt);}return false;}
    const s=this.stations.find(s=>s.id===id),gun=this.guns.find(g=>g.id===id||g.id+':spent'===id);
    const assembly=id==='hull'||id==='projector-arm'||!!gun;
    const obj=this.phase==='core'&&(id==='core'||assembly)?this.core:s||this.bricks.find(p=>p.id===id)||gun||(id==='hull'?this.hull:null);
    if(!obj||obj.hp<=0)return true;
    const damage=(b.shot?1:b.titan>0?3:b.fire?2:b.ram>0&&!this.bricks.includes(obj)?RAM.damage:1)*(s&&this.coilVulnerable(s)?2:1),wasOpen=s&&this.coverOpen(s);
    obj.hp=Math.max(0,obj.hp-damage);obj.hurt=.12;this.addScore(s?70:obj===this.core?100:20);sfx.tough();
    this.chargeSpacePower(b);
    if(assembly||obj===this.core){this.hull.hurt=.14;this.hull.impact={x:b.x??180,y:b.y??190};if(obj===this.core)this.hull.hp=Math.max(0,this.hull.hp-damage);}
    this.fx.ring(b.x??obj.x,b.y??obj.y,s?'#7ae9ff':'#e9a4e7',10);
    if(s||assembly)this.teachDone=true;
    if(obj.hp<=0) {
      if(obj!==this.core)this.brokeBrick();
      if(obj.payload)this.dropPower(obj.x+obj.w/2,obj.y+obj.h,obj.payload);
      if(s) {
        s.disabledAt=this.clock;s.disabledCover=wasOpen;
        if(this.stations.every(s=>s.hp<=0))this.beginCollapse();
        else if(this.stations[this.activeIndex]===s){this.activeIndex=this.stations.findIndex(s=>s.hp>0);this.stage='anticipate';this.stageAt=this.clock;}
      }
      if(obj===this.hull){for(const s of this.stations){s.disabledCover=this.coverOpen(s);s.hp=0;s.disabledAt=this.clock;}this.activeIndex=3;this.beginCollapse();}
      if(this.attack?.sources){for(const source of this.attack.sources)if(source.id===id)source.cancelled=true;if(this.attack.sources.every(s=>s.cancelled))this.recover();}
      if(obj===this.core)this.finishCore();
    }
    return obj.hp>0;
  }
  shotHit(shot,previousY=shot.y,dt=0) {
    let first=null;
    for(const t of this.targets(1/Math.max(.001,this.timeScale))){const hit=sweepTarget({x:shot.x,y:previousY},shot,shot.r||2,t,0,dt);if(hit&&(!first||hit.t<first.hit.t))first={t,hit};}
    if(!first)return false;this.hitTarget(first.t.id,{x:first.hit.x,y:first.hit.y,shot:true});return true;
  }
  clearInput() { this.ptr.down=false;this.keys={};this.aim=null;this.inputEpoch++; }
  park() { this.clearInput();for(const b of this.balls)if(!b.dead)b.caught=true; }
  beginCollapse() {
    this.closePowerMenu();
    this.phase='collapse';this.transitionAt=this.clock;this.attack=null;this.bolts.length=this.shots.length=this.enemyImpacts.length=0;this.park();
    this.collapsing=this.bricks.filter(b=>b.hp>0&&!b.payload).map((b,i)=>({...b,index:i,at:this.clock+i*.022}));
    for(const b of this.bricks)if(!b.payload)b.hp=0;
    sfx.boom();this.bump(.35);
  }
  grantReward() {
    if(this.rewardGranted)return;
    this.rewardGranted=true;this.balls=this.balls.filter(b=>!b.dead);
    if(!this.balls.length)super.serve();
    const lead=this.balls[0],speed=Math.max(this.speed,Math.hypot(lead.vx,lead.vy));
    while(this.balls.length<3){const angle=(this.balls.length%2?1:-1)*.25,b=makeBall(lead.x,lead.y,Math.sin(angle)*speed,-Math.cos(angle)*speed,this.ballRadius);b.caught=true;this.balls.push(b);}
    this.fx.ring(this.paddle.x,this.paddle.y-35,'#92e8f5',36);sfx.power();
  }
  finishProjection() {
    this.phase='core';this.clearInput();this.fanServe=true;
    this.balls.forEach((b,i)=>{b.caught=true;b.x=this.paddle.x+(i===0?0:i%2?18:-18);b.y=this.paddle.y-b.r-1;b.trail.length=0;});
    this.aim={ball:this.balls[0],angle:0,serve:true,t:0,anchorX:this.ptr.x};this.serveAge=0;this.serveLimit=3;
    this.timeScale=1;this.hitStop=0;
  }
  finishCore() { this.closePowerMenu();this.phase='ending';this.transitionAt=this.clock;this.attack=null;this.bolts.length=this.shots.length=this.drops.length=this.enemyImpacts.length=0;this.park();this.addScore(2200+this.lives*300);sfx.win(); }
  recover(duration=this.attack?.cooldown||2) { if(this.attack?.boss)this.bossResume={...this.attack.boss,at:this.clock};this.attack=null;this.stage='recovery';this.stageAt=this.clock;this.recoveryTime=duration; }
  warn() {
    const plan=nextEnemyVolley(this.difficulty,this.volleyPattern,this.weaponRandom);this.volleyPattern=plan.pattern;
    const guns=this.guns.filter((g,i)=>g.hp>0&&(plan.pattern==='both'||plan.pattern===(i?'right':'left')));
    if(!this.teachDone||!guns.length||plan.pattern==='quiet'){this.recover(this.teachDone?plan.cooldown:2);return;}
    const boss=this.bossPose(),sources=guns.map((g,i)=>({id:g.id,started:this.clock+i*.85,targetX:i?null:this.paddle.x,angle:Math.atan2(this.paddle.y-g.y-boss.y,this.paddle.x-g.x-boss.x)-Math.PI/2,next:0}));
    this.attack={...plan,id:guns[0].id,boss,angle:sources[0].angle,targetX:this.paddle.x,at:this.clock,sources};
    this.stage='warning';this.stageAt=this.clock;
  }
  fire() {
    const a=this.attack;if(!a)return;
    for(const s of a.sources){
      if(s.cancelled||this.clock<s.started)continue;
      const g=this.guns.find(g=>g.id===s.id&&g.hp>0);if(!g){s.cancelled=true;continue;}
      if(s.targetX===null){s.targetX=this.paddle.x;s.angle=Math.atan2(this.paddle.y-g.y-a.boss.y,s.targetX-g.x-a.boss.x)-Math.PI/2;}
      if(!enemyEscapeLane(this.paddle,this.left,this.right,s.targetX,a.r)){s.cancelled=true;continue;}
      while(s.next<a.shots.length&&this.clock-s.started+1e-9>=a.warning+a.shots[s.next]){
        const from=this.muzzle(g),dx=s.targetX-from.x,dy=this.paddle.y-from.y,n=Math.max(1,Math.hypot(dx,dy));
        this.bolts.push({id:'forge-bolt'+this.serial++,sourceId:s.id,x:from.x-dx/n*a.r,y:from.y-dy/n*a.r,from:{...from},bornAt:this.clock,vx:dx/n*a.speed,vy:dy/n*a.speed,r:a.r,kind:a.kind,colour:'forge',muzzleFlash:false});
        s.next++;s.firedAt=this.clock;this.stage='shot';sfx.zap();
      }
    }
    if(a.sources.every(s=>s.cancelled||s.next>=a.shots.length)&&!this.bolts.length)this.recover();
  }
  update(dtReal) {
    if(this.state!=='play'||this.powerMenuOpen)return;
    if(['collapse','projection','ending'].includes(this.phase)) {
      this.clock+=dtReal;this.kitTime+=dtReal;this.fx.update(dtReal,this.drainY);
      if(this.phase==='collapse'&&this.clock-this.transitionAt>=COLLAPSE){this.grantReward();this.phase='projection';this.transitionAt=this.clock;}
      else if(this.phase==='projection'&&this.clock-this.transitionAt>=PROJECT)this.finishProjection();
      else if(this.phase==='ending'&&this.clock-this.transitionAt>=2)this.win();
      return;
    }
    // shortcut: eight angular substeps bound leaf-tip motion to0.44u at120Hz; use rotational CCD before faster hinges.
    const count=this.phase==='forge'&&(['opening','closing'].includes(this.stage)||this.stations.some(s=>s.hp<=0&&this.clock-s.disabledAt<.35))?8:1;
    for(let i=0;i<count&&this.combat();i++) {
      const dt=dtReal/count;this.ballStart=new Map(this.balls.map(b=>[b,{x:b.x,y:b.y}]));
      this.levelUpdated=false;super.update(dt);
      if(!this.levelUpdated&&this.combat())this.updateLevel(0,dt);
    }
  }
  updateLevel(dt,dtReal=dt) {
    this.levelUpdated=true;if(!this.combat())return;
    if(this.aim?.serve){this.serveAge+=dtReal;if(this.serveAge>=this.serveLimit)this.release();}
    if(this.fanServe&&this.aim?.serve)this.balls.slice(1).forEach((b,i)=>{b.x=this.paddle.x+(i%2?-18:18);b.y=this.paddle.y-b.r-1;});
    if(!this.started)return;
    this.clock+=dtReal;
    this.enemyImpacts=this.enemyImpacts.filter(h=>this.clock-h.at<.32);
    for(const a of [...this.stations,...this.guns,...this.bricks,this.core,this.hull])a.hurt=Math.max(0,a.hurt-dtReal);
    if(this.phase!=='forge')return;
    this.updateBolts(dtReal);if(!this.combat())return;
    const age=this.clock-this.stageAt;
    if(this.stage==='anticipate'&&age>=1.2){this.stage='opening';this.stageAt=this.clock;}
    else if(this.stage==='opening'&&age>=OPEN_TIME){this.stage='open';this.stageAt=this.clock;}
    else if(this.stage==='open'&&age>=this.rules.open){this.stage='closing';this.stageAt=this.clock;}
    else if(this.stage==='closing'&&age>=OPEN_TIME)this.warn();
    else if(this.stage==='warning'||this.stage==='shot')this.fire();
    else if(this.stage==='recovery'&&age>=this.recoveryTime){this.stage='anticipate';this.stageAt=this.clock;}
  }
  updateBolts(dtReal) {
    if(!this.combat()||!(dtReal>0))return;
    for(const s of this.bolts) {
      if(s.dead)continue;
      const from={x:s.x,y:s.y},to={x:s.x+s.vx*dtReal,y:s.y+s.vy*dtReal};let first=null;
      const consider=(kind,t,hit)=>{if(hit&&(!first||hit.t<first.hit.t))first={kind,t,hit};};
      for(const b of this.balls)if(!b.dead) {
        const p=this.ballStart?.get(b)||b,vx=(b.x-p.x)/Math.max(.00001,dtReal),vy=(b.y-p.y)/Math.max(.00001,dtReal),t={vx,vy,shapes:[{type:'circle',x:p.x,y:p.y,r:b.r}]};
        consider('ball',b,sweepTarget(from,to,s.r,t,0,dtReal));
      }
      const p=this.paddle,t={vx:p.vx,shapes:[boxShape({x:p.x-p.vx*dtReal-p.w/2,y:p.y,w:p.w,h:p.h})]};
      consider('paddle',p,sweepTarget(from,to,s.r,t,0,dtReal));
      s.x=to.x;s.y=to.y;
      if(first){s.dead=true;if(first.kind==='ball'){this.enemyImpact(s,first.hit);this.addScore(20);}else if(first.kind==='paddle'){this.loseBall();if(this.state==='play')this.enemyImpact(s,{x:first.hit.x,y:this.paddle.y});break;}}
      if(s.y-s.r>this.drainY||s.x<-20||s.x>this.W+20)s.dead=true;
    }
    this.bolts=this.bolts.filter(s=>!s.dead);
  }
  enemyImpact(bolt,p){this.enemyImpacts.push({x:p.x,y:p.y,vx:bolt.vx,vy:bolt.vy,r:bolt.r,colour:'forge',at:this.clock});if(this.enemyImpacts.length>8)this.enemyImpacts.shift();}
  loseBall() {
    if(!this.combat())return;
    this.closePowerMenu();
    this.bolts.length=this.shots.length=this.enemyImpacts.length=0;this.recover();this.balls.length=0;this.aim=null;this.timeScale=1;
    super.loseBall();
  }
  continueRun() {
    if(this.state!=='lost')return;
    this.closePowerMenu();
    this.balls.length=0;this.aim=null;this.bolts.length=this.shots.length=this.enemyImpacts.length=0;this.attack=null;super.continueRun();
    this.serveLimit=3;if(this.phase==='forge'){this.stage='anticipate';this.stageAt=this.clock;}
  }
  updateShots(dt) { if(this.combat())super.updateShots(dt);else this.shots.length=0; }
  applyPower(kind) { if(this.combat())super.applyPower(kind); }
  onPaddle(b) { if(this.combat())super.onPaddle(b); }
  part(g,id,p,alpha=1,dim=false) {
    const a=this.parts[id];if(!ready(a))return;
    g.save();g.globalAlpha*=alpha;if(dim)g.filter='brightness(.38) saturate(.25)';
    g.translate(p.x,p.y);g.rotate(p.angle||0);g.drawImage(a.img,-(p.px??.5)*p.w,-(p.py??.5)*p.h,p.w,p.h);g.restore();
  }
  visiblePart(g,id,rect) {
    const a=this.parts[id],b=a.artBounds||[0,0,1,1],w=rect.w/b[2],h=rect.h/b[3];
    if(ready(a))g.drawImage(a.img,rect.x-b[0]*w,rect.y-b[1]*h,w,h);
  }
  drawPaddleArt(g,p) { drawStretchPaddle(g,this.parts.paddle,p); }
  drawEnemyBolts(g) { for(const b of this.bolts)drawEnemyBolt(g,b,this.clock-b.bornAt);if(this.state==='play')for(const h of this.enemyImpacts)drawEnemyImpact(g,h,this.clock-h.at); }
  drawBalls(g) { for(const b of this.balls)if(!b.dead){if(b.titan>0||b.ram>0)drawBall(g,b);else this.visiblePart(g,'ball',{x:b.x-b.r,y:b.y-b.r,w:b.r*2,h:b.r*2});}this.drawShots(g); }
  paintBackground(g,y,height) {
    const p=this.parts.background;if(!ready(p))return;
    const k=Math.max(this.W/p.size[0],height/p.size[1]);g.drawImage(p.img,this.W-p.size[0]*k,y+height-p.size[1]*k,p.size[0]*k,p.size[1]*k);
  }
  drawFullBleedBackground(g,top,height) { this.backgroundViewport={top,height};this.paintBackground(g,0,height); }
  background() { return this.parts.background.img; }
  previewRect() { return { x: 0, y: 76, w: 360, h: 360 }; }
  drawMachinery(g) {
    const h=this.hullPose(),M=this.data.machinery,k=360/1992,b=this.bossPose(),a=M.aperturePx,[x0,y0,x1,y1]=a;
    g.save();g.beginPath();g.rect(x0*k+b.x,76+y0*k+b.y,(x1-x0)*k,(y1-y0)*k);g.clip();
    const back=this.parts.bay_back;if(ready(back)){const x=x0*k+b.x,y=76+y0*k+b.y,w=(x1-x0)*k,hh=(y1-y0)*k;g.drawImage(back.img,x,y,w,hh);}
    const open=this.phase==='projection'?ease((this.clock-this.transitionAt)/PROJECT):this.coreOpen()?1:.1;
    const leafK=Math.max((x1-x0)/M.pairVisibleSize[0],(y1-y0)/M.pairVisibleSize[1])*1.1;
    for(const[id,sign]of[['door_left',-1],['door_right',1]]) {
      const p=this.parts[id],w=p.size[0]*leafK*k,hh=p.size[1]*leafK*k;
      this.part(g,id,{x:(x0+x1)/2*k+b.x+sign*open*M.doorTravelPx*k,y:76+(y0+y1)/2*k+b.y,w,h:hh,px:p.pivot[0],py:p.pivot[1]});
    }
    g.restore();this.part(g,'hull',h,this.hull.hurt>0?.7:1,this.phase==='ending'||this.hull.hp<=0);
    const health=this.phase==='core'?this.core:this.hull,optic={x:997*k+b.x,y:76+301*k+b.y};
    if(this.combat()){g.lineWidth=1.6;g.strokeStyle='#392a46';g.beginPath();g.arc(optic.x,optic.y,13,0,TAU);g.stroke();g.strokeStyle='#efa7dd';g.beginPath();g.arc(optic.x,optic.y,13,-Math.PI/2,-Math.PI/2+TAU*health.hp/health.maxHP);g.stroke();}
    if(this.hull.hurt>0&&this.hull.impact){const p=this.hull.impact;g.strokeStyle='#fff0fb';g.lineWidth=1.5;g.beginPath();g.moveTo(p.x-5,p.y);g.lineTo(p.x+5,p.y);g.moveTo(p.x,p.y-5);g.lineTo(p.x,p.y+5);g.stroke();}
    for(const gun of this.guns){
      const source=this.attack?.sources?.find(s=>s.id===gun.id&&!s.cancelled),age=this.clock-(source?.firedAt??-Infinity),pose=this.cannonPose(gun);
      g.save();if(age>=0&&age<.14)g.filter=`brightness(${1+.7*(1-age/.14)})`;this.part(g,'cannon',pose,gun.hurt>0?.65:1,gun.hp<=0||this.phase!=='forge');g.restore();
      if(source)drawWeaponMuzzle(g,this.muzzle(gun),pose.angle+Math.PI/2,age,'forge');
    }
  }
  draw(g) {
    g.fillStyle='#050913';g.fillRect(0,0,this.W,this.H);
    const v=this.backgroundViewport;this.paintBackground(g,v?-v.top:0,v?v.height:this.H);this.drawMachinery(g);
    for(const b of this.bricks)if(b.hp>0){const p=this.brickPose(b);this.part(g,p.id,p.pose,b.hurt>0?.65:1);if(b.payload)text(g,{burst:'✦',shield:'◇',wide:'↔',split:'•••'}[b.payload],p.pose.x,p.pose.y,11,'#f2ddff','center');}
    if(this.phase==='forge'||this.phase==='collapse')for(const s of this.stations) {
      const age=this.phase==='collapse'?clamp((this.clock-this.transitionAt)/COLLAPSE):0,p=this.stationPose(s),alpha=(1-ease(age))*(this.phase==='forge'&&s.hp<=0?1-ease((this.clock-s.disabledAt)/.35):1);
      p.y+=18*age;this.part(g,'station_body',p,alpha);this.part(g,'station_coil',p,alpha*(s.hurt>0?.5:1),s.hp<=0);
      const cover=this.coverPose(s);cover.y+=18*age;this.part(g,'station_cover',cover,alpha);
      if(this.phase==='forge') {
        const active=this.stations[this.activeIndex]===s;
        for(let i=0;i<6;i++){g.fillStyle=i<Math.ceil(s.hp/s.maxHP*6)?(active?'#8bf2ff':'#82859d'):'#263d48';g.beginPath();g.arc(s.x+(i-2.5)*6,s.y-26,1.6,0,TAU);g.fill();}
        if(active&&this.stage==='open'){g.strokeStyle='#a7eff0';g.lineWidth=1;g.beginPath();g.arc(s.x,s.y,31,-Math.PI/2,-Math.PI/2+TAU*(1-clamp((this.clock-this.stageAt)/this.rules.open)));g.stroke();}
      }
    }
    if(this.collapsing&&this.clock-this.transitionAt<1.3)for(const b of this.collapsing) {
      const age=this.clock-b.at;if(age<0)continue;const p=this.brickPose(b),a=this.parts[p.id],fade=1-clamp(age/.65);if(fade<=0||!ready(a))continue;
      g.save();g.globalAlpha*=fade;
      for(let i=0;i<4;i++){const sx=i%2,sy=Math.floor(i/2),x=p.pose.x+(sx-.5)*p.pose.w/2+(sx?1:-1)*age*24,y=p.pose.y+(sy-.5)*p.pose.h/2+age*45;g.drawImage(a.img,sx*a.size[0]/2,sy*a.size[1]/2,a.size[0]/2,a.size[1]/2,x-p.pose.w/4,y-p.pose.h/4,p.pose.w/2,p.pose.h/2);}
      g.restore();
    }
    if(['projection','core','ending'].includes(this.phase)) {
      const p=this.projectorPose(),shutdown=this.phase==='ending'?ease((this.clock-this.transitionAt)/2):0;p.y-=12*shutdown;
      g.save();g.beginPath();g.rect(0,185,this.W,this.playClipY-185);g.clip();
      this.part(g,'projector_arm',p,1-.6*shutdown,this.phase==='ending');this.part(g,'reactor',p,(1-shutdown)*(this.core.hurt>0?.55:1),this.core.hp<=0);g.restore();
    }
    if(this.attack)for(const s of this.attack.sources){
      const age=this.clock-s.started,gun=this.guns.find(g=>g.id===s.id&&g.hp>0);if(!gun||s.cancelled||age<0||age>=this.attack.warning)continue;
      const from=this.muzzle(gun),targetX=s.targetX??this.paddle.x;
      g.strokeStyle='#efb28c';g.lineWidth=1;g.setLineDash([4,7]);g.beginPath();g.moveTo(from.x,from.y);g.lineTo(targetX,this.paddle.y);g.stroke();g.setLineDash([]);
      drawWeaponCharge(g,from,Math.atan2(this.paddle.y-from.y,targetX-from.x),age/this.attack.warning,'forge');
    }
    this.drawEnemyBolts(g);
    this.drawDrops(g);this.drawPaddle(g);if(!['ending'].includes(this.phase))this.drawBalls(g);if(this.combat())this.drawAim(g);this.fx.draw(g);this.drawDeck(g);this.drawHUDBase(g);
    if(this.debugGeometry){g.strokeStyle='#8bffb9';g.lineWidth=.5;for(const t of this.targets())for(const s of t.shapes||[])if(s.type==='polygon'){g.beginPath();for(const ring of[s.points,...(s.holes||[])]){ring.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();}g.stroke();}}
  }
  inspect() { return{state:this.state,phase:this.phase,stage:this.stage,clock:this.clock,difficulty:this.difficulty,activeIndex:this.activeIndex,teachDone:this.teachDone,rewardGranted:this.rewardGranted,hull:{...this.hull},core:{...this.core},stations:this.stations.map(s=>({...s})),guns:this.guns.map(g=>({...g})),bricks:this.bricks.map(b=>({id:b.id,hp:b.hp,payload:b.payload})),attack:this.attack&&{...this.attack},bolts:this.bolts.map(b=>({...b})),lives:this.lives}; }
  result() { return{stars:this.state==='won'?1+(this.lives>=2)+(this.lives>=3):0,lines:[['Score',this.score.toLocaleString()],['Stabilisers',this.stations.filter(s=>s.hp<=0).length+' / 3'],['Lives left',this.lives]]}; }
}
