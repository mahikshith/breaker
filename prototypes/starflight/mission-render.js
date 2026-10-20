import { SHIPS } from '../../src/starflight/geometry.js';
import { STORM_WINGS, wingPoint } from '../../src/starflight/mission.js';

const clamp = n => Math.max(0, Math.min(1, n));
function stamp(ctx, image, x, y, w, h, angle = 0, alpha = 1, pivot = [.5, .5]) {
  if (!image) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.globalAlpha *= alpha;
  ctx.drawImage(image, -w * pivot[0], -h * pivot[1], w, h); ctx.restore();
}
function glow(ctx, x, y, r, colour, alpha) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, colour); g.addColorStop(1, 'transparent');
  ctx.save(); ctx.globalAlpha *= alpha; ctx.fillStyle = g; ctx.fillRect(x-r, y-r, r*2, r*2); ctx.restore();
}
function jet(ctx, x, y, angle, length, time, colour = '#76d5ff') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
  const n = length * (.95 + Math.sin(time * 29) * .05), g = ctx.createLinearGradient(0, 0, 0, n);
  g.addColorStop(0, '#edfcff'); g.addColorStop(.2, colour); g.addColorStop(1, 'transparent');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-3, 0); ctx.quadraticCurveTo(-5, n*.45, 0, n);
  ctx.quadraticCurveTo(5, n*.45, 3, 0); ctx.fill(); ctx.restore();
}

// Distant story objects have no damage shapes and never cover live projectile lanes.
export function drawMissionWorld(ctx, images, game) {
  const gate = game.world.gate, open = clamp(gate.open), time = game.time;
  const departure = game.mission.beat === 'extraction' || game.state === 'won';
  if (!departure) return;
  ctx.save();
  for (let i=0;i<3;i++) {
    const startX = game.width/2 + (i-1)*70;
    const startY = departure ? game.height + 23 + i*22 : game.height*.65 + i*24 + Math.min(time,9)*game.height*.055;
    const travel = departure ? clamp((open - i*.1) / .72) : 0;
    const x = startX + (gate.x - startX)*travel;
    const y = startY + (gate.y - startY)*travel;
    const size = 34*(1-travel*.75), alpha = departure ? (1-travel)*.7 : .38;
    if (departure) jet(ctx,x,y+size*.28,0,18*(1-travel),time);
    stamp(ctx,images.civilian,x,y,size,size*.75,0,alpha);
  }
  ctx.restore();
}

export function drawStorm(ctx, images, game) {
  const storm=game.storm, p=game.player, time=game.time;
  if (!storm) return;
  stamp(ctx,images.stormBody,p.x,p.y,52,46.8,p.angle);
  for(let i=0;i<2;i++){
    const w=storm.wings[i], meta=STORM_WINGS[i], engine=wingPoint(w,meta.engineOffset);
    jet(ctx,engine.x,engine.y,w.angle,storm.stage==='sweep'?38:22,time,'#8fcfff');
    stamp(ctx,images[i?'stormRight':'stormLeft'],w.x,w.y,52,46.8,w.angle,1,meta.pivot);
    const tip=w.tip||wingPoint(w,meta.tipOffset);
    glow(ctx,tip.x,tip.y,8,'#d4b1ff',storm.stage==='return'?.12:.6);
  }
  const b=storm.band;
  if(!b || storm.stage==='return')return;
  const gain=storm.stage==='split'?clamp(storm.age/.45):1;
  const start=storm.wings[0].tip||wingPoint(storm.wings[0],STORM_WINGS[0].tipOffset);
  const end=storm.wings[1].tip||wingPoint(storm.wings[1],STORM_WINGS[1].tipOffset);
  const points=[];
  for(let i=0;i<=40;i++){
    const t=i/40, edge=Math.sin(Math.PI*t);
    points.push([start.x+(end.x-start.x)*t,start.y+(end.y-start.y)*t+edge*(Math.sin(i*3.7+time*13)*4+Math.sin(i*1.9-time*8)*2)]);
  }
  ctx.save();ctx.globalAlpha*=gain;ctx.lineCap='round';ctx.lineJoin='round';ctx.globalCompositeOperation='screen';
  for(const [width,colour,alpha] of [[24,'#8264ff',.06],[11,'#9b83ff',.16],[3,'#80d9ff',.7],[.85,'#ffffff',1]]){
    ctx.strokeStyle=colour;ctx.lineWidth=width;ctx.globalAlpha=gain*alpha;ctx.beginPath();
    points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();
  }
  ctx.globalAlpha=gain*.65;ctx.strokeStyle='#c0dcff';ctx.lineWidth=.65;
  for(let i=3;i<38;i+=4){
    const [x,y]=points[i], side=i%2?1:-1;
    const reach=8+4*Math.sin(time*5+i);
    ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+3,y+side*reach*.5);ctx.lineTo(x+9,y+side*reach*.4);ctx.lineTo(x+12,y+side*reach);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x+9,y+side*reach*.4);ctx.lineTo(x+15,y+side*reach*.2);ctx.stroke();
  }
  ctx.strokeStyle='#c3aaff';ctx.globalAlpha=gain*.4;ctx.lineWidth=.7;ctx.beginPath();
  points.forEach(([x,y],i)=>i?ctx.lineTo(x,y+Math.sin(i*1.7+time*8)*3):ctx.moveTo(x,y));ctx.stroke();
  for(let i=0;i<4;i++){const t=(time*.4+i*.27)%1;glow(ctx,b.x1+(b.x2-b.x1)*t,b.y,5,'#d0eaff',.35);}
  ctx.restore();
}

export function drawMissionShot(ctx, images, shot, time) {
  const trail=shot.trail||[];
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  if(trail.length>1){
    for(let i=1;i<trail.length;i++){
      const p=trail[i-1],q=trail[i],fade=clamp(1-(q.age||0)/.55);
      for(const [width,colour,alpha] of [[11,'#a771ff',.12],[3.2,'#bc97ff',.65],[.8,'#f8eaff',.9]]){
        ctx.globalAlpha=fade*alpha;ctx.strokeStyle=colour;ctx.lineWidth=width*(.35+.65*fade);
        ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();
      }
    }
  }
  ctx.globalAlpha=1;
  const a=Math.atan2(shot.vy,shot.vx)+Math.PI/2;
  const ricochet=shot.kind==='ricochet', key=ricochet?'ricochet':'guided', meta=images.equipmentMeta.parts[key];
  if(shot.from&&shot.age<.12){
    const heading=shot.baseHeading??Math.atan2(shot.vy,shot.vx),fx=Math.cos(heading),fy=Math.sin(heading),nx=-fy,ny=fx,{x,y}=shot.from;
    ctx.beginPath();ctx.moveTo(x+nx*2000,y+ny*2000);ctx.lineTo(x-nx*2000,y-ny*2000);
    ctx.lineTo(x+(fx-nx)*2000,y+(fy-ny)*2000);ctx.lineTo(x+(fx+nx)*2000,y+(fy+ny)*2000);ctx.closePath();ctx.clip();
  }
  stamp(ctx,images[ricochet?'ricochetPayload':'guidedPayload'],shot.x,shot.y,...meta.display,a,1,meta.pivot);
  glow(ctx,shot.x,shot.y,ricochet?8:5,ricochet?'#caafff':'#8ce8ff',.2);
  ctx.restore();
}

export function drawAssembly(ctx, images, game) {
  const c=game.combination;
  if(!c)return;
  if(c.stage==='merged'){
    const fade=1-clamp((game.time-c.at)/.6);
    if(fade>0)for(const q of c.sourcePoses||[]){
      const s=SHIPS[q.ship];stamp(ctx,images[q.ship],q.x,q.y,s.width,s.height,q.angle,fade*.65);
    }
    return;
  }
  if(!['warning','dock'].includes(c.stage))return;
  for(const id of c.ids){
    const e=game.enemies.find(e=>e.id===id&&e.hp>0);if(!e)continue;
    ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.angle||0);
    ctx.strokeStyle='#ffba8877';ctx.lineWidth=1.4;
    for(const side of[-1,1]){
      ctx.beginPath();ctx.moveTo(side*13,-8);ctx.lineTo(side*19,-8);ctx.lineTo(side*19,6);ctx.stroke();
    }
    glow(ctx,0,0,23,'#ffa86b',.08);ctx.restore();
  }
}

// Each petal follows a real Nova projectile; the decorative wake cannot deal damage.
export function drawNovaPetal(ctx, images, shot) {
  const a=Math.atan2(shot.vy,shot.vx), length=22+Math.min(18,shot.age*50);
  ctx.save();ctx.translate(shot.x,shot.y);ctx.rotate(a);ctx.globalCompositeOperation='screen';
  const fill=ctx.createLinearGradient(-length,0,3,0);
  fill.addColorStop(0,'#c06aff00');fill.addColorStop(.6,'#a76bff44');fill.addColorStop(1,'#e5caff99');
  ctx.fillStyle=fill;ctx.beginPath();ctx.moveTo(6,0);
  ctx.bezierCurveTo(-3,-3,-length*.6,-4,-length,0);
  ctx.bezierCurveTo(-length*.6,4,-3,3,6,0);ctx.fill();
  stamp(ctx,images.hyperRound,0,0,26,44,Math.PI/2,1,[.456,.599]);
  glow(ctx,0,0,10,'#cdb0ff',.35);ctx.restore();
}

export function drawNovaBloom(ctx, fx) {
  const t=clamp(fx.age/fx.life), radius=150*Math.sqrt(t), alpha=(1-t);
  ctx.save();ctx.translate(fx.x,fx.y);ctx.globalCompositeOperation='screen';
  glow(ctx,0,0,35+radius*.45,'#955aff',alpha*.18);
  // Broken metallic-looking iris arcs reveal the pulse rather than masking hostile shots.
  for(let i=0;i<10;i++){
    const a=i*Math.PI/5+t*.35;
    ctx.strokeStyle=`rgba(200,163,255,${alpha*.65})`;ctx.lineWidth=2.4*(1-t)+.5;
    ctx.beginPath();ctx.arc(0,0,radius,a,a+.4);ctx.stroke();
    ctx.strokeStyle=`rgba(246,231,255,${alpha*.8})`;ctx.lineWidth=.7;
    ctx.beginPath();ctx.arc(0,0,radius*.9,a+.09,a+.27);ctx.stroke();
  }
  ctx.restore();
}

export function drawChronolens(ctx, game) {
  const p=game.player,time=game.time, alpha=Math.min(1,game.timers.stasis/.5);
  ctx.save();ctx.translate(p.x,p.y);ctx.globalAlpha=alpha;ctx.globalCompositeOperation='screen';
  // This is the ship's clockwork emitter, not a false local collision boundary.
  for(let ring=0;ring<2;ring++){
    ctx.save();ctx.rotate(time*(ring?-.35:.25));ctx.scale(1,ring?.42:.72);
    ctx.strokeStyle=ring?'#b3f0e780':'#6ebfb560';ctx.lineWidth=1;
    for(let i=0;i<6;i++){
      const a=i*Math.PI/3,r=44+ring*13;
      ctx.beginPath();ctx.arc(0,0,r,a,a+.7);ctx.stroke();
      ctx.fillStyle='#d4fff2';ctx.beginPath();ctx.arc(Math.cos(a)*r,Math.sin(a)*r,1.3,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }
  ctx.restore();
}

export function drawWreck(ctx, images, fx) {
  const shape=SHIPS[fx.ship];if(!shape)return;
  const age=fx.age,t=clamp(age/fx.life),heavy=shape.width>60;
  const drift=(1-Math.exp(-2*age))/2;
  const x=fx.x+(fx.vx||0)*drift,y=fx.y+(fx.vy||0)*drift+age*age*(heavy?7:20);
  const angle=(fx.angle||0)+(heavy?.16:1.5)*t,alpha=(1-t)*.75;
  ctx.save();ctx.filter='saturate(.35) brightness(.55)';
  stamp(ctx,images[fx.ship],x,y,shape.width*(1-t*.16),shape.height*(1-t*.16),angle,alpha);
  ctx.filter='none';
  if(heavy){
    for(let i=0;i<3;i++){
      const burst=clamp((age-i*.18)/.45);
      if(age>=i*.18&&burst<1)stamp(ctx,images.explosion,x+(i-1)*shape.width*.22,y+shape.height*.15,32+burst*34,32+burst*34,0,(1-burst)*.7);
    }
  }
  ctx.restore();
}
