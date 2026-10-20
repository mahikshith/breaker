const ROOT='../../';
const damageStates=new WeakMap();
const image=path=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(new Error(path));i.src=ROOT+path;});
export async function loadArt(){
  const response=await fetch(ROOT+'assets/fantasy-machinery/manifest.json');if(!response.ok)throw new Error('Missing machinery manifest');
  const manifest=await response.json(),art={manifest,images:{},geometry:{}};
  const jobs=[];
  for(const family of ['bellforge','tidewheel'])for(const [key,item] of Object.entries(manifest[family])){
    if(item.path)jobs.push(image(item.path).then(i=>art.images[family+'/'+key]=i));
  }
  const nerraResponse=await fetch(ROOT+'assets/fantasy-machinery/nerra-v2-manifest.json');
  if(!nerraResponse.ok)throw new Error('Missing Nerra motion manifest');
  const nerraManifest=await nerraResponse.json();
  manifest.nerra=nerraManifest.nerra??nerraManifest.tidewheel??nerraManifest;
  for(const [key,item] of Object.entries(manifest.nerra))if(item.path&&item.size)jobs.push(image(item.path).then(i=>art.images['nerra/'+key]=i));
  const waterResponse=await fetch(ROOT+'assets/fantasy-machinery/water-shot-manifest.json');
  if(!waterResponse.ok)throw new Error('Missing water-shot manifest');
  art.waterShot=await waterResponse.json();
  jobs.push(image(art.waterShot.path).then(i=>art.images.waterShot=i));
  for(const [key,item] of Object.entries(manifest.tidewheel.bricks||{}))jobs.push(image(item.path).then(i=>art.images['brick/'+key]=i));
  for(const [key,path] of Object.entries({ball:'vault/ball.png',paddleL:'vault/paddle_l.png',paddleM:'vault/paddle_m.png',paddleR:'vault/paddle_r.png',cyan:'vault/brick_t_2_0.png',rose:'vault/brick_t_2_0.png',plum:'vault/brick_v_2_0.png',pin:'vault/brick_gold_1_0.png',shield:'vault/cap_shield.png'}))jobs.push(image('assets/'+path).then(i=>art.images[key]=i));
  for(const clip of ['Idle','Nervous','Cheer'])for(let n=0;n< (clip==='Nervous'?12:16);n++)jobs.push(image(`assets/princess/${clip}_${String(n).padStart(2,'0')}.png`).then(i=>art.images[`lumi/${clip}/${n}`]=i));
  await Promise.all(jobs);
  return art;
}
function sprite(ctx,art,family,key,x,y,{width,angle=0,mirror=false,frame=0,pivot}={}){
  const m=art.manifest[family][key],img=art.images[family+'/'+key];if(!m||!img)return;
  const w=width??m.unit?.[0]??100,h=w*(m.cell?.[1]??m.size[1])/(m.cell?.[0]??m.size[0]),p=pivot??m.pivot??[.5,.5];
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(mirror?-1:1,1);
  if(m.cell){const cols=m.columns??Math.floor(img.width/m.cell[0]);ctx.drawImage(img,(frame%cols)*m.cell[0],Math.floor(frame/cols)*m.cell[1],...m.cell,-p[0]*w,-p[1]*h,w,h);}
  else ctx.drawImage(img,-p[0]*w,-p[1]*h,w,h);
  ctx.restore();
}
function line(ctx,a,b,colour,width=1){ctx.strokeStyle=colour;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
function chain(ctx,a,b){
  line(ctx,a,b,'#171a1d',3.8);const len=Math.hypot(b.x-a.x,b.y-a.y),n=Math.max(1,Math.floor(len/6));
  for(let i=0;i<n;i++){const t=i/n;ctx.strokeStyle=i%2?'#a29372':'#5d655e';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,1.5,2.3,0,0,Math.PI*2);ctx.stroke();}
}
function hoistChain(ctx,art,a,b){
  const m=art.manifest.nerra.chain,img=art.images['nerra/chain'],sy=m.anchors.tileTop[1]*img.height,sh=(m.anchors.tileBottom[1]-m.anchors.tileTop[1])*img.height;
  const length=Math.hypot(b.x-a.x,b.y-a.y),width=5,tile=sh/img.width*width;
  ctx.save();ctx.translate(a.x,a.y);ctx.rotate(Math.atan2(b.y-a.y,b.x-a.x)-Math.PI/2);
  for(let y=0;y<length;y+=tile){const h=Math.min(tile+.4,length-y);ctx.drawImage(img,0,sy,img.width,sh*h/tile,-width/2,y,width,h);}
  ctx.restore();
}
function brick(ctx,art,b,x=b.x,y=b.y){
  if(b.type==='pin'){
    const metal=ctx.createLinearGradient(x,y,x,y+b.h);metal.addColorStop(0,'#d3b076');metal.addColorStop(.25,'#705335');metal.addColorStop(1,'#302b27');
    ctx.fillStyle=metal;ctx.beginPath();ctx.roundRect(x,y,b.w,b.h,3);ctx.fill();ctx.strokeStyle='#d5b77e';ctx.lineWidth=.8;ctx.stroke();
    const m=art.manifest.bellforge.ratchet,img=art.images['bellforge/ratchet'],cx=m.pivot[0]*m.size[0],cy=m.pivot[1]*m.size[1];
    ctx.drawImage(img,cx-45,cy-45,90,90,x+b.w/2-7,y+b.h/2-7,14,14);
    if(b.hp===1)line(ctx,{x:x+3,y:y+3},{x:x+b.w-4,y:y+b.h-3},'#161e26',1);
    return;
  }
  if(b.type!=='pin'&&art.images['brick/coral']&&(typeof b.colour==='number'||b.colour==='rose')){
    const key=typeof b.colour==='number'?['sage','coral','ivory'][b.colour]:({cyan:'sage',rose:'coral',plum:'ivory'}[b.colour]||'coral');
    const m=art.manifest.tidewheel.bricks[key],a=m.anchors.contactTopLeft,z=m.anchors.contactBottomRight;
    const w=b.w/(z[0]-a[0]),h=b.h/(z[1]-a[1]);ctx.drawImage(art.images['brick/'+key],x-a[0]*w,y-a[1]*h,w,h);return;
  }
  const key=typeof b.colour==='number'?['cyan','rose','plum'][b.colour]:b.colour;
  const img=art.images[b.type==='pin'?'pin':key]||art.images.cyan;
  ctx.drawImage(img,x-b.w*.125,y-b.h*.25,b.w*1.25,b.h*1.5);
}
function princess(ctx,g,art,x,y){
  const worried=g.lumi.worried||g.lumi.steps>0||(g.water&&g.water.y-g.water.limit<60);
  const clip=g.phase==='rescue'||g.state==='won'?'Cheer':/windup/i.test(g.villain.stage)||worried?'Nervous':'Idle';
  const n=Math.floor(g.time*10)%(clip==='Nervous'?12:16),img=art.images[`lumi/${clip}/${n}`];
  // Existing character frames share the centred feet baseline.
  ctx.drawImage(img,x-29,y-55,58,58);
}
function renderBellforge(ctx,g,art){
  const v=g.villain,stage=v.stage==='windup'?1:v.stage==='release'?2:v.stage==='stagger'||v.stage==='defeated'?3:0;
  const ly=g.lumi.y;
  chain(ctx,{x:g.lumi.x-22,y:65},{x:g.lumi.x-22,y:ly+20});chain(ctx,{x:g.lumi.x+22,y:65},{x:g.lumi.x+22,y:ly+20});
  sprite(ctx,art,'bellforge','lift',g.lumi.x,ly+38,{width:77});
  princess(ctx,g,art,g.lumi.x,ly+37);
  sprite(ctx,art,'bellforge','ratchet',g.dock.x+g.dock.w/2,g.dock.y+18,{width:42,angle:g.lumi.steps*.12});
  sprite(ctx,art,'bellforge','plinth',88,161,{width:200});
  sprite(ctx,art,'bellforge','bellCradle',g.bellSource.x,g.bellSource.y);
  ctx.fillStyle='#0c0b0b55';ctx.beginPath();ctx.ellipse(88,162,58,5,0,0,Math.PI*2);ctx.fill();
  const press=v.stage==='windup'?-.45*Math.min(1,v.stageTime/1.3):v.stage==='release'?.3:0;
  sprite(ctx,art,'bellforge','leverMount',146,153);sprite(ctx,art,'bellforge','releaseLever',146,153,{angle:press});
  sprite(ctx,art,'bellforge','korr',v.x,161,{width:170.6667,frame:stage});
  for(const r of g.ramps){
    // Map the measured top face, not the padded image edge, onto the physical segment.
    const m=art.manifest.bellforge.ramp,a=m.anchors.contactA,b=m.anchors.contactB;
    const dx=(b[0]-a[0])*m.size[0],dy=(b[1]-a[1])*m.size[1],scale=r.length/Math.hypot(dx,dy);
    ctx.save();ctx.translate(r.a.x,r.a.y);ctx.rotate(r.angle-Math.atan2(dy,dx));
    ctx.drawImage(art.images['bellforge/ramp'],-a[0]*m.size[0]*scale,-a[1]*m.size[1]*scale,m.size[0]*scale,m.size[1]*scale);ctx.restore();
  }
  for(const b of g.bricks)if(b.hp>0)brick(ctx,art,b);
  if(g.guard){
    const a=g.guard.a,b=g.guard.b;line(ctx,a,b,'#493f30',10);line(ctx,a,b,'#e3cf9b',6);line(ctx,a,b,'#6c8b9b',3);
    const mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};ctx.drawImage(art.images.shield,mid.x-14,mid.y-14,28,28);
  }
  for(const b of g.bells)sprite(ctx,art,'bellforge','bell',b.x,b.y,{width:32,angle:b.angle||0});
}
function renderTidewheel(ctx,g,art){
  const v=g.villain;
  // Reuse the wall's stone courses for submerged foundations; piers never hang above the water.
  const wall=art.images['tidewheel/sluiceWall'],wm=art.manifest.tidewheel.sluiceWall,ws=390/wm.size[0];
  const wallX=180-wm.pivot[0]*390,base=232+(430-wm.pivot[1]*wm.size[1])*ws;
  for(const sx of[78,375,650,944])for(let y=base-3;y<g.water.initial+28;y+=10)
    ctx.drawImage(wall,sx-40,393,80,29,wallX+(sx-40)*ws,y,80*ws,10.2);
  sprite(ctx,art,'tidewheel','sluiceWall',180,232,{width:390});
  ctx.fillStyle='#08141c66';ctx.beginPath();ctx.ellipse(v.footX,233,62,5,0,0,Math.PI*2);ctx.fill();
  for(const gate of g.gates){
    const gy=gate.y-gate.open*32,m=art.manifest.tidewheel.gate,a=m.anchors.panelTopLeft,b=m.anchors.panelBottomRight;
    const fm=art.manifest.tidewheel.gateFrame,fa=fm.anchors.openingTopLeft,fb=fm.anchors.openingBottomRight,fw=gate.w/(fb[0]-fa[0]),fh=gate.h/(fb[1]-fa[1]);
    ctx.drawImage(art.images['tidewheel/gateFrame'],gate.x-gate.w/2-fa[0]*fw,gate.y-gate.h/2-fa[1]*fh,fw,fh);
    const fullW=gate.w/(b[0]-a[0]),fullH=gate.h/(b[1]-a[1]);
    ctx.drawImage(art.images['tidewheel/gate'],gate.x-gate.w/2-a[0]*fullW,gy-gate.h/2-a[1]*fullH,fullW,fullH);
    chain(ctx,{x:gate.x,y:gate.y-10},{x:gate.x,y:gate.y+54+gate.open*32});
    sprite(ctx,art,'tidewheel','counterweight',gate.x,gate.y+61+gate.open*32,{width:23});
  }
  // Hauling away from the low hoist lengthens the taut hand leg and turns its axle.
  hoistChain(ctx,art,g.chain.hand,g.chain.pulley);
  hoistChain(ctx,art,{x:327,y:244},{x:327,y:282});
  sprite(ctx,art,'tidewheel','wheel',310,244,{width:72,angle:g.chain.wheelAngle});
  sprite(ctx,art,'nerra','nerraBody',v.footX,v.footY,{width:v.w,frame:v.frame});
  for(const c of g.claws){
    const family=c.side<0?'tidewheel':'nerra',key=c.partKey,m=art.manifest[family][key];
    sprite(ctx,art,family,key,c.root.x,c.root.y,{angle:c.angle,mirror:c.mirror,width:m.unit[0]*c.scale});
  }
  // Ropes reach their stops before the rafts can overlap Nerra's moving claws.
  for(const r of g.rafts){
    for(const side of[-1,1]){
      const x=r.baseX+side*59,stop=r.stop+33;
      line(ctx,{x,y:stop-14},{x,y:r.initial+70},'#162d36',4);
      line(ctx,{x:x-.7,y:stop-14},{x:x-.7,y:r.initial+70},'#7b999b',.8);
      ctx.fillStyle='#8d7955';ctx.fillRect(x-4,stop-3,8,5);
      chain(ctx,{x,y:stop-16},{x:r.x+side*50*Math.cos(r.angle),y:r.y+33+side*50*Math.sin(r.angle)});
    }
    ctx.save();ctx.translate(r.x,r.y);ctx.rotate(r.angle);
    // The foreground face (source y130..232) is the physical local y34..48
    // deck. Compress its perspective depth so the metal badge cannot overlap a
    // ball already stopped by that deck. Rear planks remain a support layer.
    const raftImage=art.images['tidewheel/raft'],depth=14*256/102,top=34-130*depth/256;
    if(r.braceHP===0){
      // Rear planks support the cargo in depth. The broken central face is an
      // actual 70-unit foreground opening; only its side endcaps still collide.
      ctx.drawImage(raftImage,0,0,640,130,-64,top,128,130*depth/256);
      ctx.drawImage(raftImage,0,130,145,126,-64,34,29,126*depth/256);
      ctx.drawImage(raftImage,495,130,145,126,35,34,29,126*depth/256);
    }else{
      ctx.drawImage(raftImage,-64,top,128,depth);
      if(r.braceHP===1){
        ctx.strokeStyle='#1b1714';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-22,34);ctx.lineTo(-8,39);ctx.lineTo(-14,43);ctx.lineTo(3,48);ctx.moveTo(13,34);ctx.lineTo(8,40);ctx.lineTo(22,45);ctx.stroke();
        ctx.strokeStyle='#e6bd7b';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(-21,35);ctx.lineTo(-7,39);ctx.lineTo(-13,43);ctx.stroke();
      }
    }
    for(const b of g.bricks)if(b.raft===+r.id.at(-1)&&b.hp>0)brick(ctx,art,b,b.lx,b.ly);
    ctx.restore();
  }
  const y=g.water.y;
  if(v.stage==='pull'&&y>315){
    const strength=Math.min(1,v.stageTime*5)*Math.min(1,(1-v.stageTime)*3);
    ctx.save();ctx.globalAlpha=strength*.65;
    for(const x of[79,180,278])for(let n=0;n<5;n++){
      const xx=x+(n-2)*2.7,wash=ctx.createLinearGradient(0,313,0,y);wash.addColorStop(0,'#4395a33a');wash.addColorStop(1,'#b2e5dfa0');
      line(ctx,{x:xx,y:313},{x:xx+Math.sin(g.time*9+n)*2,y},wash,n%2?1:2);
    }ctx.restore();
  }
  const wash=ctx.createLinearGradient(0,y,0,g.height);wash.addColorStop(0,'#4fc2d514');wash.addColorStop(.18,'#12678328');wash.addColorStop(1,'#071c3209');ctx.fillStyle=wash;ctx.fillRect(0,y,g.width,g.height-y);
  ctx.save();ctx.beginPath();ctx.rect(0,y-6,g.width,g.height-y+6);ctx.clip();
  for(let row=0;row<12;row++){
    ctx.beginPath();for(let x=0;x<=g.width;x+=4){const yy=y+row*14+Math.sin(x*.055+g.time*2+row)*2.5;x?ctx.lineTo(x,yy):ctx.moveTo(x,yy);}
    ctx.strokeStyle=row===0?'#a6e0dc80':'#58c2d023';ctx.lineWidth=row===0?1.2:.7;ctx.stroke();
  }ctx.restore();
  // Fixed side outlets show where the jet originates. The landing ripple is a warning,
  // not a retargeting beam: the model locks its lane before the shot leaves.
  for(const side of[-1,1]){
    const x=side<0?24:g.width-24,yy=g.paddle.y-205;
    ctx.save();ctx.translate(x,yy);ctx.rotate(side<0?-.32:.32);
    ctx.fillStyle='#162d38';ctx.strokeStyle='#779397';ctx.lineWidth=2;
    ctx.beginPath();ctx.ellipse(0,0,11,7,0,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.fillStyle='#091822';ctx.beginPath();ctx.ellipse(0,0,7,4,0,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  if(g.pulseWarning){
    const w=g.pulseWarning,q=Math.min(1,w.age/w.life);
    ctx.save();ctx.strokeStyle='#b3e5df';ctx.lineWidth=1.5;ctx.globalAlpha=.35+q*.6;
    ctx.beginPath();ctx.ellipse(w.source.x,w.source.y,12+q*5,8+q*3,0,0,Math.PI*2);ctx.stroke();
    ctx.beginPath();ctx.ellipse(w.targetX,g.paddle.y,12+(1-q)*13,4,0,0,Math.PI*2);ctx.stroke();ctx.restore();
  }
  for(const p of g.pulses){
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(Math.atan2(p.vy,p.vx)-Math.PI/2);
    ctx.globalAlpha=Math.min(1,(p.life-p.age)*3);
    const m=art.waterShot,[w,h]=m.unit;
    ctx.drawImage(art.images.waterShot,-m.pivot[0]*w,-m.pivot[1]*h,w,h);
    ctx.restore();
  }
  if(g.anchor){
    const closure=Math.min(1,(4-g.anchor.time)/.35);
    chain(ctx,{x:287,y:223},{x:323,y:262});
    ctx.save();ctx.translate(310,244);ctx.rotate(-.65);
    for(const side of[-1,1]){
      const x=side*(24-closure*14),metal=ctx.createLinearGradient(x-4,0,x+4,0);metal.addColorStop(0,'#29333d');metal.addColorStop(.35,'#e0e3dc');metal.addColorStop(.65,'#8f9ea3');metal.addColorStop(1,'#384750');
      ctx.fillStyle=metal;ctx.beginPath();ctx.roundRect(x-4,-18,8,36,2);ctx.fill();ctx.strokeStyle='#c5a56c';ctx.stroke();
      for(const y of[-13,13]){ctx.fillStyle='#e5c78e';ctx.beginPath();ctx.arc(x,y,2,0,Math.PI*2);ctx.fill();}
    }ctx.restore();
  }
  for(const side of[-1,1]){
    const x=g.lumi.x+side*25;chain(ctx,{x,y:47},{x,y:g.lumi.y+31});
    ctx.fillStyle='#332d28';ctx.strokeStyle='#bda77e';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(x-4,42,8,9,2);ctx.fill();ctx.stroke();
    ctx.fillStyle='#d8c9a5';ctx.beginPath();ctx.arc(x,46,1.5,0,Math.PI*2);ctx.fill();
  }
  // This refuge hangs from its two chains. Remove the wall-mount corbels so the
  // hauling pincer stays visibly separate from Lumi's floor at every descent.
  const refuge=art.manifest.tidewheel.refugeBalcony,rw=78,rh=rw*refuge.size[1]/refuge.size[0];
  ctx.drawImage(art.images['tidewheel/refugeBalcony'],0,0,refuge.size[0],239,g.lumi.x-refuge.pivot[0]*rw,g.lumi.y+33-refuge.pivot[1]*rh,rw,239/refuge.size[1]*rh);
  princess(ctx,g,art,g.lumi.x,g.lumi.y+33);
}
export function drawEncounter(ctx,g,art,level){
  ctx.clearRect(0,0,g.width,g.height);
  const plate=art.images[level+'/background'];ctx.drawImage(plate,0,0,g.width,g.height);
  ctx.fillStyle='#07101b1c';ctx.fillRect(0,0,g.width,g.height);
  if(level==='tidewheel')renderTidewheel(ctx,g,art);else renderBellforge(ctx,g,art);
  const damage=damageStates.get(g)||{hp:g.villain.hp,time:-10};
  if(damage.hp!==g.villain.hp){damage.hp=g.villain.hp;damage.time=g.time;}damageStates.set(g,damage);
  if(g.time-damage.time<2.5&&g.villain.hp>0){
    const x=g.villain.x-38,y=level==='bellforge'?57:63;
    ctx.save();ctx.globalAlpha=Math.min(1,(2.5-g.time+damage.time)*2);
    ctx.fillStyle='#131b22de';ctx.beginPath();ctx.roundRect(x-1,y-1,78,6,3);ctx.fill();
    ctx.fillStyle='#deb66f';ctx.beginPath();ctx.roundRect(x,y,76*g.villain.hp/g.villain.maxHP,4,2);ctx.fill();ctx.restore();
  }
  for(const e of g.effects){
    const q=e.age/e.life;ctx.save();ctx.globalAlpha=1-q;
    if(e.kind==='brace-break'){
      const img=art.images['tidewheel/raft'];
      for(let n=0;n<4;n++){const t=e.age;ctx.save();ctx.translate(e.x+(n-1.5)*(10+t*32),e.y-14*t+100*t*t);ctx.rotate((n-1.5)*t*2);ctx.drawImage(img,145+n*87.5,130,87.5,102,-8.75,-7,17.5,14);ctx.restore();}
    }else if(e.kind==='brick-break'){
      const key=typeof e.colour==='number'?['sage','coral','ivory'][e.colour]:'coral';
      const img=['cyan','plum'].includes(e.colour)?art.images[e.colour]:art.images['brick/'+key];
      if(img)for(let n=0;n<3;n++){const t=e.age,x=e.x+(n-1)*(8+t*45)+(e.vx||0)*t,y=e.y+(e.vy||0)*t-45*t+180*t*t;
        ctx.save();ctx.translate(x,y);ctx.rotate((n-1)*t*5);ctx.drawImage(img,n*img.width/3,0,img.width/3,img.height,-(e.w||34)/6,-(e.h||18)/2,(e.w||34)/3,e.h||18);ctx.restore();}
    }else for(let i=0;i<7;i++){const a=i*Math.PI*2/7;ctx.fillStyle=i%2?'#d9edf0':'#c9a673';ctx.fillRect(e.x+Math.cos(a)*q*15,e.y+Math.sin(a)*q*15+q*q*5,2,2);}
    ctx.restore();
  }
  const p=g.paddle,h=p.h*20/12,py=p.y+(level==='bellforge'?p.h/2:0);
  ctx.drawImage(art.images.paddleL,p.x-p.w/2-4,py-h/2,16,h);ctx.drawImage(art.images.paddleM,p.x-p.w/2+12,py-h/2,p.w-24,h);ctx.drawImage(art.images.paddleR,p.x+p.w/2-12,py-h/2,16,h);
  for(const b of g.balls)if(!b.dead){if(!b.caught){const speed=Math.hypot(b.vx,b.vy);const trail=ctx.createLinearGradient(b.x,b.y,b.x-b.vx/speed*22,b.y-b.vy/speed*22);trail.addColorStop(0,'#eaf8ff99');trail.addColorStop(1,'#eaf8ff00');line(ctx,{x:b.x,y:b.y},{x:b.x-b.vx/speed*22,y:b.y-b.vy/speed*22},trail,6);}ctx.drawImage(art.images.ball,b.x-10,b.y-10,20,20);}
}
