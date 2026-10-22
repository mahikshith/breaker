import { ART } from '../vault-art.js';
import { SPR, loadImg, artLoaded, text, cached } from '../gfx.js';
import { GATEHOUSE_FLOORS } from './gatehouse.js';
import { renderLumi } from './lumi-render.js';
import { renderRivals } from './rivals-render.js';
const damageStates=new WeakMap();
// Machinery comes packed in ART.fantasy (tools/pack_art.py); the plates, ball, paddle, bricks and Lumi are the main game's own art.
export function makeArt(){
  const F=ART.fantasy,manifest={bellforge:{},tidewheel:{},nerra:{},nerraReaction:{},korrReaction:{}},images={};
  const add=(family,key,item)=>{manifest[family][key]=item;if(item.url)images[family+'/'+key]=loadImg(item.url);};
  for(const family of ['bellforge','tidewheel','nerra'])for(const [key,item] of Object.entries(F[family]))if(key!=='bricks')add(family,key,item);
  for(const family of ['nerra','korr'])for(const [pose,item] of Object.entries(F.reactions[family]))add(family+'Reaction',pose,item);
  manifest.tidewheel.bricks=F.tidewheel.bricks;
  for(const [key,item] of Object.entries(F.tidewheel.bricks))images['brick/'+key]=loadImg(item.url);
  images['bellforge/background']=loadImg(ART.keepBackdrop);images['gatehouse/background']=images['bellforge/background'];
  images.waterShot=loadImg(F.waterShot.url);
  // Hero paddle skins (art/paddle_skins): Kit's blue enamel and Lumi's rose pearl, same three-slice contract as the chrome paddle.
  for(const [id,s] of Object.entries(ART.paddleSkins||{}))for(const k of['l','m','r'])images[id+'Skin'+k.toUpperCase()]=loadImg(s[k].url);
  for(const [key,sprite] of Object.entries({ball:'ball',titan:'ball_titan',paddleL:'paddle_l',paddleM:'paddle_m',paddleR:'paddle_r',cyan:'brick_t_2_0',rose:'brick_t_2_0',plum:'brick_v_2_0',pin:'brick_gold_1_0',shield:'cap_shield'}))images[key]=SPR[sprite].img;
  return {manifest,images,waterShot:F.waterShot,lumi:{...ART.princess,img:loadImg(ART.princess.url)}};
}
export async function loadArt(){const art=makeArt();await artLoaded();return art;}
function sprite(ctx,art,family,key,x,y,{width,angle=0,mirror=false,frame=0,pivot}={}){
  const m=art.manifest[family][key],img=art.images[family+'/'+key];if(!m||!img)return;
  const w=width??m.unit?.[0]??100,h=w*(m.cell?.[1]??m.size[1])/(m.cell?.[0]??m.size[0]),p=pivot??m.pivot??[.5,.5];
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(mirror?-1:1,1);
  if(m.cell){const cols=m.columns??Math.floor(img.width/m.cell[0]);ctx.drawImage(img,(frame%cols)*m.cell[0],Math.floor(frame/cols)*m.cell[1],...m.cell,-p[0]*w,-p[1]*h,w,h);}
  else ctx.drawImage(img,-p[0]*w,-p[1]*h,w,h);
  ctx.restore();
}
function line(ctx,a,b,colour,width=1){ctx.strokeStyle=colour;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
// Lift and gate chains use the rendered chain tile (no drawn link rings).
function chain(ctx,art,a,b){hoistChain(ctx,art,a,b,0,5);}
function hoistChain(ctx,art,a,b,travel=0,width=7){
  const m=art.manifest.nerra.chain,img=art.images['nerra/chain'],sy=m.anchors.tileTop[1]*img.height,sh=(m.anchors.tileBottom[1]-m.anchors.tileTop[1])*img.height;
  const length=Math.hypot(b.x-a.x,b.y-a.y),tile=sh/img.width*width;
  ctx.save();ctx.translate(a.x,a.y);ctx.rotate(Math.atan2(b.y-a.y,b.x-a.x)-Math.PI/2);
  ctx.beginPath();ctx.rect(-width,0,width*2,length);ctx.clip();
  for(let y=((travel%tile)+tile)%tile-tile;y<length;y+=tile)ctx.drawImage(img,0,sy,img.width,sh,-width/2,y,width,tile+.35);
  ctx.restore();
}
function defeatTransform(ctx,v,x,y){
  if(!v.defeat)return;
  const d=v.defeat;
  ctx.translate(x+d.offsetX,y+d.offsetY);ctx.rotate(d.angle);ctx.scale(d.scaleX,d.scaleY);ctx.translate(-x,-y);
}
function dazed(ctx,g,x,y,amount){
  if(!amount)return;
  ctx.save();ctx.globalAlpha=amount;
  for(let i=0;i<3;i++){
    const a=g.time*2.2+i*Math.PI*2/3,xx=x+Math.cos(a)*24,yy=y+Math.sin(a)*5;
    ctx.fillStyle='#f8dfab';ctx.strokeStyle='#7d5d3d';ctx.lineWidth=.7;
    ctx.beginPath();for(let k=0;k<10;k++){const r=k%2?2:4.5,t=k*Math.PI/5-Math.PI/2;k?ctx.lineTo(xx+Math.cos(t)*r,yy+Math.sin(t)*r):ctx.moveTo(xx+Math.cos(t)*r,yy+Math.sin(t)*r);}ctx.closePath();ctx.fill();ctx.stroke();
  }ctx.restore();
}
function tbrick(ctx,art,key,x,y,bw,bh){
  const m=art.manifest.tidewheel.bricks[key],a=m.anchors.contactTopLeft,z=m.anchors.contactBottomRight;
  const w=bw/(z[0]-a[0]),h=bh/(z[1]-a[1]);ctx.drawImage(art.images['brick/'+key],x-a[0]*w,y-a[1]*h,w,h);
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
    tbrick(ctx,art,key,x,y,b.w,b.h);return;
  }
  const key=typeof b.colour==='number'?['cyan','rose','plum'][b.colour]:b.colour;
  const img=art.images[b.type==='pin'?'pin':key]||art.images.cyan;
  ctx.drawImage(img,x-b.w*.125,y-b.h*.25,b.w*1.25,b.h*1.5);
}
function princess(ctx,g,art,x,y){
  const worried=g.lumi.worried||g.lumi.steps>0||(g.water&&g.water.y-g.water.limit<60);
  const clip=g.phase==='rescue'||g.state==='won'?'Cheer':/windup/i.test(g.villain.stage)||worried?'Nervous':'Idle';
  const L=art.lumi,a=L.anims[clip];
  // Existing character frames share the centred feet baseline.
  ctx.drawImage(L.img,Math.floor(g.time*10)%a.n*L.cell,a.row*L.cell,L.cell,L.cell,x-29,y-55,58,58);
}
function ramp(ctx,art,r){
  // Map the measured top face, not the padded image edge, onto the physical segment.
  const m=art.manifest.bellforge.ramp,a=m.anchors.contactA,b=m.anchors.contactB;
  const dx=(b[0]-a[0])*m.size[0],dy=(b[1]-a[1])*m.size[1],scale=r.length/Math.hypot(dx,dy);
  ctx.save();ctx.translate(r.a.x,r.a.y);ctx.rotate(r.angle-Math.atan2(dy,dx));
  ctx.drawImage(art.images['bellforge/ramp'],-a[0]*m.size[0]*scale,-a[1]*m.size[1]*scale,m.size[0]*scale,m.size[1]*scale);ctx.restore();
}
function renderBellforge(ctx,g,art){
  const v=g.villain,stage=v.stage==='windup'?1:v.stage==='release'?2:v.stage==='stagger'||v.stage==='defeated'?3:0;
  const escape=g.lumi.escape||0,ly=g.lumi.y-28*escape*escape*(3-2*escape);
  chain(ctx,art,{x:g.lumi.x-22,y:65},{x:g.lumi.x-22,y:ly+20});chain(ctx,art,{x:g.lumi.x+22,y:65},{x:g.lumi.x+22,y:ly+20});
  sprite(ctx,art,'bellforge','lift',g.lumi.x,ly+38,{width:77});
  princess(ctx,g,art,g.lumi.x,ly+37);
  sprite(ctx,art,'bellforge','ratchet',g.dock.x+g.dock.w/2,g.dock.y+18,{width:42,angle:g.lumi.steps*.12});
  sprite(ctx,art,'bellforge','plinth',88,161,{width:200});
  sprite(ctx,art,'bellforge','bellCradle',g.bellSource.x,g.bellSource.y);
  ctx.fillStyle='#0c0b0b55';ctx.beginPath();ctx.ellipse(88,162,58,5,0,0,Math.PI*2);ctx.fill();
  const press=v.stage==='windup'?-.45*Math.min(1,v.stageTime/1.3):v.stage==='release'?.3:0;
  sprite(ctx,art,'bellforge','leverMount',146,153);sprite(ctx,art,'bellforge','releaseLever',146,153,{angle:press});
  ctx.save();defeatTransform(ctx,v,v.x,161);
  if(v.defeat&&v.defeat.age>.22)sprite(ctx,art,'korrReaction',v.defeat.age<.9?'dazed':'defeat',v.x,161,{width:170.6667});
  else sprite(ctx,art,'bellforge','korr',v.x,161,{width:170.6667,frame:stage});
  ctx.restore();dazed(ctx,g,v.x,83,v.defeat?.daze);
  for(const r of g.ramps){
    ramp(ctx,art,r);
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
    chain(ctx,art,{x:gate.x,y:gate.y-10},{x:gate.x,y:gate.y+54+gate.open*32});
    sprite(ctx,art,'tidewheel','counterweight',gate.x,gate.y+61+gate.open*32,{width:23});
  }
  // Hauling away from the low hoist lengthens the taut hand leg and turns its axle.
  const hand=v.defeat?{x:g.chain.hand.x,y:238}:g.chain.hand;
  hoistChain(ctx,art,hand,g.chain.pulley,g.chain.scroll||0);
  hoistChain(ctx,art,{x:327,y:244},{x:327,y:282},-(g.chain.scroll||0));
  sprite(ctx,art,'tidewheel','wheel',310,244,{width:72,angle:g.chain.wheelAngle});
  ctx.save();defeatTransform(ctx,v,v.footX,v.footY);
  const reaction=v.defeat&&v.defeat.age>.2?(v.defeat.age<.85?'dazed':'defeat'):v.pose==='fury'?'fury':null;
  if(reaction)sprite(ctx,art,'nerraReaction',reaction,v.footX,v.footY,{width:v.w});
  else sprite(ctx,art,'nerra','nerraBody',v.footX,v.footY,{width:v.w,frame:v.frame});
  for(const c of g.claws){
    const family=c.side<0?'tidewheel':'nerra',key=c.partKey,m=art.manifest[family][key];
    const socket=v.defeat&&reaction?art.manifest.nerraReaction[reaction].sockets[c.side<0?'crusher':'gate']:null;
    const root=socket?{x:v.footX+socket.x,y:v.footY+socket.y}:c.root;
    const angle=socket?(c.side<0?.5:-.45):c.angle;
    sprite(ctx,art,family,key,root.x,root.y,{angle,mirror:c.mirror,width:m.unit[0]*c.scale});
  }
  ctx.restore();dazed(ctx,g,v.footX,v.footY-99,v.defeat?.daze);
  // Ropes reach their stops before the rafts can overlap Nerra's moving claws.
  for(const r of g.rafts){
    for(const side of[-1,1]){
      const x=r.baseX+side*59,stop=r.stop+33;
      line(ctx,{x,y:stop-14},{x,y:r.initial+70},'#162d36',4);
      line(ctx,{x:x-.7,y:stop-14},{x:x-.7,y:r.initial+70},'#7b999b',.8);
      ctx.fillStyle='#8d7955';ctx.fillRect(x-4,stop-3,8,5);
      chain(ctx,art,{x,y:stop-16},{x:r.x+side*50*Math.cos(r.angle),y:r.y+33+side*50*Math.sin(r.angle)});
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
  // Water gathers at the animated pincer. The landing ring marks its locked aim.
  if(g.pulseWarning){
    const w=g.pulseWarning,q=Math.min(1,w.age/w.life);
    // Water gathers as a swelling glow at the pincer; the landing spot is a cool pool of light on the paddle line.
    const source=w.source;
    glow(ctx,source.x,source.y,10+q*16,'#b3e5df',.3+q*.5);glow(ctx,source.x,source.y,5+q*5,'#f0fffb',.35+q*.5);
    pool(ctx,w.targetX,g.paddle.y,16+(1-q)*14,5,'#b3e5df',.25+q*.5);
  }
  for(const p of g.pulses){
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(Math.atan2(p.vy,p.vx)-Math.PI/2);
    if(!p.reflected&&p.age<.25){
      const travel=((p.x-p.from.x)*p.vx+(p.y-p.from.y)*p.vy)/(Math.hypot(p.vx,p.vy)||1);
      ctx.beginPath();ctx.rect(-40,-Math.max(0,travel),80,1000);ctx.clip();
    }
    ctx.globalAlpha=Math.min(1,(p.life-p.age)*3);
    const m=art.waterShot,[w,h]=m.unit;
    ctx.drawImage(art.images.waterShot,-m.pivot[0]*w,-m.pivot[1]*h,w,h);
    // Round pressure core and trailing beads keep the shot legible as water in motion.
    const a0=ctx.globalAlpha;glow(ctx,0,0,p.r*1.1,'#dcfff5',.35*a0);for(let i=0;i<3;i++)glow(ctx,Math.sin(p.age*19+i)*3,-15-i*7,4-i*.8,'#b5e9e5',a0*.65**(i+1));
    ctx.restore();
  }
  if(g.anchor){
    const closure=Math.min(1,((g.anchor.maxTime||8)-g.anchor.time)/.35);
    chain(ctx,art,{x:287,y:223},{x:323,y:262});
    ctx.save();ctx.translate(310,244);ctx.rotate(-.65);
    for(const side of[-1,1]){
      const x=side*(24-closure*14),metal=ctx.createLinearGradient(x-4,0,x+4,0);metal.addColorStop(0,'#29333d');metal.addColorStop(.35,'#e0e3dc');metal.addColorStop(.65,'#8f9ea3');metal.addColorStop(1,'#384750');
      ctx.fillStyle=metal;ctx.beginPath();ctx.roundRect(x-4,-18,8,36,2);ctx.fill();ctx.strokeStyle='#c5a56c';ctx.stroke();
      for(const y of[-13,13]){ctx.fillStyle='#e5c78e';ctx.beginPath();ctx.arc(x,y,2,0,Math.PI*2);ctx.fill();}
    }ctx.restore();
  }
  for(const side of[-1,1]){
    const x=g.lumi.x+side*25;chain(ctx,art,{x,y:47},{x,y:g.lumi.y+31});
    ctx.fillStyle='#332d28';ctx.strokeStyle='#bda77e';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(x-4,42,8,9,2);ctx.fill();ctx.stroke();
    ctx.fillStyle='#d8c9a5';ctx.beginPath();ctx.arc(x,46,1.5,0,Math.PI*2);ctx.fill();
  }
  // This refuge hangs from its two chains. Remove the wall-mount corbels so the
  // hauling pincer stays visibly separate from Lumi's floor at every descent.
  const refuge=art.manifest.tidewheel.refugeBalcony,rw=78,rh=rw*refuge.size[1]/refuge.size[0];
  ctx.drawImage(art.images['tidewheel/refugeBalcony'],0,0,refuge.size[0],239,g.lumi.x-refuge.pivot[0]*rw,g.lumi.y+33-refuge.pivot[1]*rh,rw,239/refuge.size[1]*rh);
  princess(ctx,g,art,g.lumi.x,g.lumi.y+33);
}
// ---------- Gatehouse Siege ----------
// Every drawn solid is fitted to the model's rect/circle: plinth slices fill the ledge and bridge, the gate frame is nine-sliced onto the 14u posts and lintel,
// the door is the panel clipped to its live rect, the wheel's silhouette fills its circle. Layers fall back to nothing when art is missing.
const CLIMB=300,clamp01=v=>Math.max(0,Math.min(1,v)),smooth=t=>{t=clamp01(t);return t*t*(3-2*t);};
const rnd=(i,s=0)=>{const v=Math.sin(i*127.1+s*311.7+1.7)*43758.5453;return v-Math.floor(v);};
const PLINTH=[28,17,709,143],COUNTERWEIGHT=[19,21,281,311],BELL=[18,25,220,206],GATE_SHADE='#050912';
function slice(ctx,art,key,m,sx,sy,sw,sh,dx,dy,dw,dh){const img=art.images[key];if(!img)return;const k=img.width/m.size[0];ctx.drawImage(img,sx*k,sy*k,sw*k,sh*k,dx,dy,dw,dh);}
function slab(ctx,art,x,y,w,h){
  const m=art.manifest.bellforge.plinth,n=Math.max(1,Math.round(w/(PLINTH[2]/PLINTH[3]*h)));
  for(let i=0;i<n;i++)slice(ctx,art,'bellforge/plinth',m,...PLINTH,x+i*w/n,y,w/n+.4,h);
}
function glow(ctx,x,y,r,colour,a){
  if(a<=0)return;const gr=ctx.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,colour);gr.addColorStop(1,'#0000');
  ctx.save();ctx.globalAlpha=a;ctx.fillStyle=gr;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.restore();
}
// ---------- rendered FX kit (art/fx_kit): gem sockets for counters, stone chips and gold spark streaks for crashes ----------
const FXK=Object.fromEntries(Object.entries(ART.fxKit||{}).map(([k,v])=>[k,{img:loadImg(v.url),uw:v.uw,uh:v.uh}]));
const fxReady=p=>p&&p.img.complete&&p.img.naturalWidth;
const ga=ctx=>typeof ctx.globalAlpha==='number'?ctx.globalAlpha:1;   // the current alpha (test stubs have none)
function fxPart(ctx,key,x,y,scale=1,angle=0){
  const p=FXK[key];if(!fxReady(p))return;const w=p.uw*scale,h=p.uh*scale;
  if(angle){ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.drawImage(p.img,-w/2,-h/2,w,h);ctx.restore();}else ctx.drawImage(p.img,x-w/2,y-h/2,w,h);
}
// A counter as a row of gem sockets: lit ones are the theme gem with a soft bloom behind.
function pips(ctx,x,y,n,lit,{key='pip_gold',gap=9,scale=1,bloom='#ffcf7a',pulse=0}={}){
  for(let i=0;i<n;i++){const px=x+(i-(n-1)/2)*gap,on=i<lit;if(on)glow(ctx,px,y,7*scale+2*pulse,bloom,.38+.25*pulse);fxPart(ctx,on?key:'pip_empty',px,y,scale*(on?1+.08*pulse:1));}
}
// Spark streaks: the rendered gold streak flies out and falls, always rotated along its travel.
function sparks(ctx,x,y,t,n,speed,colours,size=1.8,seed=0){
  if(!fxReady(FXK.spark)){for(let i=0;i<n;i++){const a=rnd(i,seed+1)*Math.PI*2,v=speed*(.4+.6*rnd(i,seed+2));ctx.fillStyle=colours[i%colours.length];ctx.fillRect(x+Math.cos(a)*v*t,y+Math.sin(a)*v*t+60*t*t,size,size);}return;}
  const life=.42,q=t/life;if(q>=1)return;
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(let i=0;i<n;i++){
    const a=rnd(i,seed+1)*Math.PI*2,v=speed*(.55+.6*rnd(i,seed+2)),k=1-(1-Math.min(1,q))**2,d=v*life*k,g=140*t*t;
    const vx=Math.cos(a)*v*(1-q),vy=Math.sin(a)*v*(1-q)+280*t;
    ctx.globalAlpha=(1-q)*(.75+.25*rnd(i,seed+3));fxPart(ctx,'spark',x+Math.cos(a)*d,y+Math.sin(a)*d+g,size/2.2*(1-.45*q),Math.atan2(vy,vx));
  }
  ctx.restore();
}
// Stone chips: rendered rubble with a top-left key light, tumbling under gravity.
function chips(ctx,x,y,t,life,n,speed,size=1,seed=0,lift=.84){
  const al=Math.min(1,(1-t/life)*2.4);if(al<=0)return;
  ctx.save();ctx.globalAlpha=ga(ctx)*al;
  for(let i=0;i<n;i++){
    const a=-Math.PI*(.5-lift/2+lift*rnd(i,seed+1)),v=speed*(.35+.65*rnd(i,seed+2)),s=size*(.55+.7*rnd(i,seed+3));
    fxPart(ctx,['chip_a','chip_b','chip_c'][i%3],x+Math.cos(a)*v*t+(rnd(i,seed+4)-.5)*14,y+Math.sin(a)*v*t+340*t*t,s,(rnd(i,seed+5)-.5)*14*t+rnd(i,seed+6)*6);
  }
  ctx.restore();
}
function chunks(ctx,art,key,m,box,x,y,t,life,n,speed,size,seed=0){
  const img=art.images[key];if(!img)return;const k=img.width/m.size[0];
  for(let i=0;i<n;i++){
    const a=-Math.PI*(.08+.84*rnd(i,seed+1)),v=speed*(.35+.65*rnd(i,seed+2)),s=size*(.6+.8*rnd(i,seed+3)),al=Math.min(1,(1-t/life)*2.2);if(al<=0)continue;
    const sw=box[2]*(.12+.12*rnd(i,seed+4)),sh=box[3]*(.12+.12*rnd(i,seed+5)),sx=box[0]+(box[2]-sw)*rnd(i,seed+6),sy=box[1]+(box[3]-sh)*rnd(i,seed+7);
    ctx.save();ctx.globalAlpha=al;ctx.translate(x+Math.cos(a)*v*t,y+Math.sin(a)*v*t+330*t*t);ctx.rotate((rnd(i,seed+8)-.5)*12*t);
    ctx.drawImage(img,sx*k,sy*k,sw*k,sh*k,-s/2,-s*sh/sw/2,s,s*sh/sw);ctx.restore();
  }
}
function dust(ctx,x,y,t,life,n,spread,r,colour='#8b8478'){
  for(let i=0;i<n;i++){const q=t/life,a=Math.PI*(1+rnd(i,3)),d=spread*(.3+.7*rnd(i,4))*Math.sqrt(q);glow(ctx,x+Math.cos(a)*d*1.3,y+Math.sin(a)*d*.55-q*10,r*(.5+q)*(.7+.6*rnd(i,5)),colour,(1-q)*.45);}
}
function swayChain(ctx,art,a,b,sag,time,phase=0,width=7){
  const n=6,pts=[];
  for(let i=0;i<=n;i++){const t=i/n,off=Math.sin(Math.PI*t)*sag*(1+.45*Math.sin(time*.9+phase));pts.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t+off});}
  for(let i=0;i<n;i++)hoistChain(ctx,art,pts[i],pts[i+1],0,width);
}
// stage -> Korr sheet frame (idle, windup, release, stagger); a recovering Korr keeps the slump for a beat.
const korrFrame=(g,v)=>v.stage==='windup'?1:v.stage==='release'?2:v.stage==='stagger'||(v.stage==='recover'&&g.time-v.stageAt<.35)?3:0;
function korr(ctx,g,art,v,{x,y,width,mirror=false,lean=0}){
  const flash=g.effects.find(e=>e.kind==='korr-hit'&&e.age<.14),shake=v.stage==='windup'?Math.sin(g.time*55)*.9:0;
  ctx.save();ctx.translate(x+shake,y);ctx.rotate(lean);ctx.translate(-x,-y);
  const draw=()=>{
    if(v.defeat)return v.defeat.age<.25?sprite(ctx,art,'bellforge','korr',x,y,{width,mirror,frame:3}):sprite(ctx,art,'korrReaction',v.defeat.age<1?'dazed':'defeat',x,y,{width,mirror});
    sprite(ctx,art,'bellforge','korr',x,y,{width,mirror,frame:korrFrame(g,v)});
  };
  draw();
  if(flash){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(1-flash.age/.14)*.45;draw();}
  ctx.restore();
}
// Glazed brick, baked once per colour and size: the rendered brick with a soft contact shadow, a glaze band across its top
// and a small specular glint at the top-left, like the vinyl-toy bricks on the board.
function glazed(ctx,art,key,x,y,w,h){
  if(!art.images['brick/'+key]?.naturalWidth)return tbrick(ctx,art,key,x,y,w,h);
  const P=6,img=cached(`glaze-${key}-${w}-${h}`,w+P*2,h+P*2+2,c=>{
    c.save();c.shadowColor='#000000a0';c.shadowBlur=5;c.shadowOffsetX=1.2;c.shadowOffsetY=2.6;tbrick(c,art,key,P,P,w,h);c.restore();
    c.save();c.beginPath();c.roundRect(P+1.6,P+1.2,w-3.2,h*.46,[3.2,3.2,1.5,1.5]);c.clip();
    const gl=c.createLinearGradient(0,P,0,P+h*.5);gl.addColorStop(0,'#ffffff70');gl.addColorStop(.55,'#ffffff1c');gl.addColorStop(1,'#ffffff00');c.fillStyle=gl;c.fillRect(P,P,w,h);c.restore();
    const sp=c.createRadialGradient(P+5,P+3.4,0,P+5,P+3.4,4.2);sp.addColorStop(0,'#ffffffe0');sp.addColorStop(1,'#ffffff00');c.fillStyle=sp;c.save();c.translate(P+5,P+3.4);c.scale(1.8,.7);c.translate(-P-5,-P-3.4);c.fillRect(P,P,10,8);c.restore();
  });
  ctx.drawImage(img,x-P,y-P,w+P*2,h+P*2+2);
}
function gbrick(ctx,art,b){
  const key=b.colour||'coral';glazed(ctx,art,key,b.x,b.y,b.w,b.h);
  if(b.type!=='armour')return;
  const hurt=b.hp<b.maxHP,plate=ctx.createLinearGradient(b.x,b.y,b.x,b.y+b.h);plate.addColorStop(0,'#d7e0e6');plate.addColorStop(.45,'#7f8c96');plate.addColorStop(1,'#3c464f');
  ctx.save();ctx.globalAlpha=hurt?.55:.82;ctx.fillStyle=plate;ctx.beginPath();ctx.roundRect(b.x+1,b.y+1,b.w-2,b.h-2,3);ctx.fill();
  ctx.globalAlpha=hurt?.55:.85;const gl=ctx.createLinearGradient(0,b.y+1,0,b.y+b.h*.5);gl.addColorStop(0,'#ffffff66');gl.addColorStop(1,'#ffffff00');ctx.fillStyle=gl;ctx.beginPath();ctx.roundRect(b.x+2,b.y+1.5,b.w-4,b.h*.42,2.5);ctx.fill();
  ctx.globalAlpha=1;for(const rx of[4.6,b.w-4.6])fxPart(ctx,'pip_empty',b.x+rx,b.y+b.h/2,.5);
  if(hurt){ctx.strokeStyle='#10151a';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(b.x+b.w*.45,b.y+1);ctx.lineTo(b.x+b.w*.52,b.y+b.h*.4);ctx.lineTo(b.x+b.w*.4,b.y+b.h*.65);ctx.lineTo(b.x+b.w*.55,b.y+b.h-1);ctx.stroke();}
  ctx.restore();
}
function ghBell(ctx,g,art,b){
  const p=g.paddle;
  // Landing tell: a warm shadow on the paddle line that darkens as the bell nears (a filled pool, never a ring).
  if(!b.teaching&&b.vy>0){const near=clamp01(1-(p.y-b.y)/300);pool(ctx,b.x,p.y+p.h/2+2,22,5,'#ff8f6a',.18+near*.5);pool(ctx,b.x,p.y+p.h/2+2,12,3,'#1a0a04',.25+near*.35);}
  if(b.teaching)glow(ctx,b.x,b.y,30,'#8fd2ff',.34+.14*Math.sin(g.time*6));
  sprite(ctx,art,'bellforge','bell',b.x,b.y,{width:32,angle:b.angle||0});
  if(b.hp===1){ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.angle||0);ctx.strokeStyle='#241407';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-1,-8);ctx.lineTo(2,-2);ctx.lineTo(-2,3);ctx.lineTo(1,9);ctx.stroke();ctx.restore();}
}
// A murder hole: dark port with a brass lip. During the tell it heats from the inside, spills ember light below it and a ring closes on it.
function holeFx(ctx,g,h,y=h.y,rx=16,ry=16){
  const x=h.x,warn=g.effects.find(e=>e.kind==='bell-warning'&&Math.hypot(e.x-h.x,e.y-h.y)<1),q=warn?clamp01(warn.age/warn.life):0,pulse=.7+.3*Math.sin(g.time*(10+q*14));
  if(warn){glow(ctx,x,y+12,96,'#ff5a1a',(.42+.5*q)*pulse);glow(ctx,x,y+4,40,'#ffc47a',(.45+.45*q)*pulse);}
  // The ledge slot is a dark port with a brass lip; the round dais ends are only a soft shadow that heats up, never a drawn ring.
  if(ry<rx){pool(ctx,x,y+1,rx*1.35,ry*1.5,'#020104',.85);pool(ctx,x,y,rx*.9,ry*.85,'#000',.9);pool(ctx,x,y+ry*.55,rx*.8,ry*.35,'#ffb46a',.06);}
  else glow(ctx,x,y+3,rx*1.5,'#030206',.7);
  if(warn){if(ry<rx)pool(ctx,x,y,rx,ry,'#ff9a3a',(.4+.6*q)*pulse);else glow(ctx,x,y+ry*.4,rx*1.3,'#ff9a3a',(.4+.6*q)*pulse);glow(ctx,x,y+10,rx*2.4*(1.2-.5*q),'#ff8a3a',.18+q*.3);}
}
function pool(ctx,x,y,rx,ry,colour,a){ctx.save();ctx.translate(x,y);ctx.scale(1,ry/rx);glow(ctx,0,0,rx,colour,a);ctx.restore();}
function gateFrame(ctx,art){
  const m=art.manifest.tidewheel.gateFrame,sl=(sx,sy,sw,sh,dx,dy,dw,dh)=>slice(ctx,art,'tidewheel/gateFrame',m,sx,sy,sw,sh,dx,dy,dw,dh);
  sl(40,23,268,142,130,113,100,51);                // arch head: ring and crown sit behind the ledge, the springers show under it
  sl(42,160,58,310,130,164,14,98);sl(250,160,58,310,216,164,14,98);   // shafts on the post rects
}
function gateDoor(ctx,g,art){
  const d=g.gate.door,open=1-(d.y-d.top)/(d.bottom-d.top);
  ctx.save();ctx.beginPath();ctx.rect(d.x,d.top,72,98);ctx.clip();
  const lit=ctx.createLinearGradient(0,d.top,0,d.bottom);lit.addColorStop(0,'#3a1d10');lit.addColorStop(.6,'#c8782f');lit.addColorStop(1,'#ffd08a');ctx.fillStyle=lit;ctx.fillRect(d.x,d.top,72,98);
  const m=art.manifest.tidewheel.gate,a=m.anchors.panelTopLeft,z=m.anchors.panelBottomRight,fw=72/(z[0]-a[0]),fh=98/(z[1]-a[1]),img=art.images['tidewheel/gate'];
  if(img)ctx.drawImage(img,d.x-a[0]*fw,d.y-98-a[1]*fh,fw,fh);
  ctx.restore();
  glow(ctx,d.x+36,d.bottom,70,'#ffb45f',.12+.38*open);
}
function wheel(ctx,g,art,w){
  const m=art.manifest.tidewheel.wheel,img=art.images['tidewheel/wheel'];
  ctx.fillStyle='#0a0908';ctx.globalAlpha=.4;ctx.beginPath();ctx.ellipse(w.x+3,w.y+w.r-1,w.r,5,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  if(img){const s=(2*w.r+4)/360;ctx.save();ctx.translate(w.x,w.y);ctx.rotate(w.angle);ctx.drawImage(img,0,0,img.width,img.height,-192*s,-207*s,m.size[0]*s,m.size[1]*s);ctx.restore();}
  const need=g.gate.need;
  for(let i=0;i<need;i++){
    const a=-Math.PI/2+i*Math.PI*2/need,x=w.x+Math.cos(a)*(w.r+8),y=w.y+Math.sin(a)*(w.r+8),on=i<w.notches;
    if(on)glow(ctx,x,y,8,'#ffc98a',.45);fxPart(ctx,on?'pip_gold':'pip_empty',x,y,.78);
  }
  text(ctx,`${w.notches} / ${need}`,w.x,w.y+w.r+22,11,'#f3dca8','center');
}
function counterweight(ctx,g,art,h){
  const hit=g.effects.find(e=>e.kind==='housing-hit'&&Math.abs(e.x-(h.x+h.w/2))<1&&e.age<.3),sh=hit?Math.sin(hit.age*70)*3*(1-hit.age/.3):0,x=h.x+sh;
  slice(ctx,art,'tidewheel/counterweight',art.manifest.tidewheel.counterweight,...COUNTERWEIGHT,x,h.y,h.w,h.h);
  for(let i=0;i<h.maxHP-h.hp;i++){
    const rx=h.x+h.w*(.25+.5*rnd(i,Math.round(h.x)+1)),ry=h.y+h.h*(.2+.2*rnd(i,Math.round(h.x)+2));
    ctx.strokeStyle='#0e0b09';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(x+rx-h.x,ry);ctx.lineTo(x+rx-h.x+5,ry+10);ctx.lineTo(x+rx-h.x-3,ry+19);ctx.lineTo(x+rx-h.x+4,ry+30);ctx.stroke();
    ctx.strokeStyle='#d9c79e55';ctx.lineWidth=.5;ctx.stroke();
  }
  pips(ctx,h.x+h.w/2,h.y+h.h+7.5,h.maxHP,h.hp,{gap:8.6,scale:.82});
}
// The drawbridge hangs heavy: two hoist chains run up out of frame from its corners and the counterweight chains are a
// thicker gauge. The slab is the plinth art fitted to the 168x24 collider; its shadow falls on the hall floor beneath.
function floorDrawbridge(ctx,g,art){
  const db=g.drawbridge,fall=Math.min(1,db.down/.5),dy=fall*fall*230,alive=db.down<.5?1:clamp01(1-(db.down-.5)/.08);
  if(db.down<.02)for(const x of[db.x+18,db.x+db.w-18]){hoistChain(ctx,art,{x,y:-60},{x,y:db.y+3},0,8.5);}
  else if(alive>0)for(const [i,x] of[[0,db.x+18],[1,db.x+db.w-18]]){const t=Math.min(1,db.down/.25);hoistChain(ctx,art,{x:x+(i?6:-6)*t,y:-60-40*t},{x:x+(i?10:-10)*t,y:db.y-26*t-30*t*t},0,8.5);}
  if(alive>0)for(const h of g.housings){
    const left=h.x<180,a={x:h.x+h.w/2,y:h.y+4},end={x:left?db.x+3:db.x+db.w-3,y:db.y+12+dy};
    if(h.hp>0||g.phase==='crash'){ctx.save();ctx.globalAlpha=alive;swayChain(ctx,art,a,end,5,g.time,left?0:2,8.5);ctx.restore();}
    else swayChain(ctx,art,end,{x:end.x+(left?-8:8),y:end.y+34},3,g.time,left?0:2,8.5);
  }
  if(alive>0){
    pool(ctx,db.x+db.w/2+4,db.y+db.h+10+dy,db.w*.55,7,'#000',.42*alive);
    ctx.save();ctx.globalAlpha=alive;ctx.translate(db.x+db.w/2,db.y+db.h/2+dy);ctx.rotate(fall*fall*.16);
    slab(ctx,art,-db.w/2,-db.h/2,db.w,db.h);
    const lip=ctx.createLinearGradient(0,-db.h/2,0,db.h/2);lip.addColorStop(0,'#ffe6b822');lip.addColorStop(.25,'#0000');lip.addColorStop(1,'#00000055');ctx.fillStyle=lip;ctx.fillRect(-db.w/2,-db.h/2,db.w,db.h);
    ctx.restore();
  }
  for(const h of g.housings)if(h.hp>0)counterweight(ctx,g,art,h);
}
// Tall phones open a band between the drawbridge machinery and the bricks. Fill it with the gatehouse's far arcade: the stone
// arches baked into the backdrop's night shade so they read as distant wall, never as something the ball can hit.
function farArcade(ctx,g,art,top,bottom){
  const img=art.images['tidewheel/sluiceWall'],m=art.manifest.tidewheel.sluiceWall,band=bottom-top;
  if(!img?.naturalWidth||band<70)return;
  const w=g.width*.86,h=w*m.size[1]/m.size[0],x=(g.width-w)/2,far=cached(`far-arcade-${w}`,w,h,c=>{
    c.drawImage(img,0,0,w,h);c.globalCompositeOperation='source-atop';
    c.fillStyle='#080b14c0';c.fillRect(0,0,w,h);
    const warm=c.createRadialGradient(w/2,h*.6,10,w/2,h*.6,w*.55);warm.addColorStop(0,'#ff9a4a22');warm.addColorStop(1,'#0000');c.fillStyle=warm;c.fillRect(0,0,w,h);
    // Melt it into the hall: transparent at the top and sides, solid only low behind the bricks.
    c.globalCompositeOperation='destination-in';
    const v=c.createLinearGradient(0,0,0,h);v.addColorStop(0,'#0000');v.addColorStop(.3,'#000');c.fillStyle=v;c.fillRect(0,0,w,h);
    const hz=c.createLinearGradient(0,0,w,0);hz.addColorStop(0,'#0000');hz.addColorStop(.08,'#000');hz.addColorStop(.92,'#000');hz.addColorStop(1,'#0000');c.fillStyle=hz;c.fillRect(0,0,w,h);
  });
  const y=bottom-h*.8,fa=clamp01((band-70)/40);
  ctx.save();ctx.globalAlpha=ga(ctx)*fa;ctx.drawImage(far,x,y,w,h);ctx.restore();
  for(const lx of[g.width*.5-w*.24,g.width*.5+w*.24])glow(ctx,lx,y+h*.45,40,'#ff9a4a',.12*fa);
}
function floorMurder(ctx,g,art){
  const G=g.gate,w=g.wheel;
  glow(ctx,180,212,92,'#ff9a45',.06);
  gateDoor(ctx,g,art);gateFrame(ctx,art);
  hoistChain(ctx,art,{x:w.x+w.r-2,y:196},{x:G.posts[0].x+1,y:196},0);
  const v=g.villain;ctx.save();
  const warn=v.stage==='windup',peer=warn?smooth((g.time-v.stageAt)/.5):v.stage==='release'?1:0;
  korr(ctx,g,art,v,{x:v.foot.x,y:v.foot.y,width:112,mirror:true,lean:-.17*peer});
  ctx.restore();
  wheel(ctx,g,art,w);
  for(const r of g.ramps)ramp(ctx,art,r);
  slab(ctx,art,0,118,g.width,26);
  const sh=ctx.createLinearGradient(0,144,0,166);sh.addColorStop(0,'#0007');sh.addColorStop(1,'#0000');ctx.fillStyle=sh;ctx.fillRect(0,144,g.width,22);
  holeFx(ctx,g,g.holes[0],144,19,7);
}
// Korr's recessed dais (scenery only, no collider): a sunken stone disc in the plinth's banded stone, lit from the top-left,
// its far inner wall in shadow and a warm under-glow. Drawn as filled shapes; the bell vents at its ends stay soft shadows.
function dais(ctx,g,art,d){
  // Kept thin and tucked under Korr's feet: it has no collider, so it must not cover open floor the ball can cross.
  const cx=d.x+d.w/2,cy=d.y-1,rx=d.w/2+4,ry=d.h*.42;
  pool(ctx,cx,cy+3,rx*1.7,ry*2.2,'#e8913f',.26);pool(ctx,cx+3,cy+5,rx*1.08,ry*1.35,'#030205',.7);
  if(!art.images['bellforge/plinth']?.naturalWidth)return;
  const disc=cached(`dais-${rx}-${ry}`,rx*2+4,ry*2+10,c=>{
    const ox=rx+2,oy=ry+2,img=art.images['bellforge/plinth'],m=art.manifest.bellforge.plinth;
    // Rim: the bronze-banded side of the platform, lit on the left.
    const side=c.createLinearGradient(ox-rx,0,ox+rx,0);side.addColorStop(0,'#8a5a2c');side.addColorStop(.35,'#5a3a1e');side.addColorStop(1,'#24170c');
    c.beginPath();c.ellipse(ox,oy+4.5,rx,ry,0,0,Math.PI*2);c.fillStyle=side;c.fill();
    c.save();c.beginPath();c.ellipse(ox,oy,rx,ry,0,0,Math.PI*2);c.clip();
    if(img?.naturalWidth){const k=img.width/m.size[0];c.drawImage(img,PLINTH[0]*k,PLINTH[1]*k,PLINTH[2]*k,PLINTH[3]*k,ox-rx*1.05,oy-ry*1.6,rx*2.1,ry*3.2);}
    const sh=c.createLinearGradient(ox-rx,oy-ry,ox+rx*.6,oy+ry);sh.addColorStop(0,'#ffe2b030');sh.addColorStop(.5,'#0000');sh.addColorStop(1,'#0006');c.fillStyle=sh;c.fillRect(ox-rx,oy-ry,rx*2,ry*2);
    // Recess: a shallow sunken stage, its far lip in shadow, the near floor catching the warm light.
    const ix=rx*.8,iy=ry*.62,f=c.createLinearGradient(0,oy-iy,0,oy+iy);f.addColorStop(0,'#000000a0');f.addColorStop(.4,'#0000004a');f.addColorStop(1,'#ffb46a1c');
    c.beginPath();c.ellipse(ox,oy+ry*.1,ix,iy,0,0,Math.PI*2);c.fillStyle=f;c.fill();
    c.restore();
  });
  ctx.drawImage(disc,cx-rx-2,cy-ry-2,rx*2+4,ry*2+10);
}
function floorDuel(ctx,g,art){
  const v=g.villain;
  glow(ctx,180,182,150,'#e89245',.12);
  for(const h of g.holes)holeFx(ctx,g,h);
  for(const r of g.ramps)ramp(ctx,art,r);
  dais(ctx,g,art,g.dais||{x:v.foot.x-60,y:v.foot.y,w:120,h:16});
  korr(ctx,g,art,v,{x:v.foot.x,y:v.foot.y,width:170.6667});
  if(v.stage==='stagger')dazed(ctx,g,v.foot.x,v.foot.y-124,1);
  else if(v.defeat&&v.defeat.age>.2&&v.defeat.age<1.6)dazed(ctx,g,v.foot.x,v.foot.y-92,Math.min(1,(1.6-v.defeat.age)*2));
  if(v.hp>0){
    const x=v.foot.x-40,y=v.foot.y-156,f=clamp01(v.hp/v.maxHP);
    ctx.fillStyle='#0d141cdd';ctx.beginPath();ctx.roundRect(x-2,y-2,84,9,4.5);ctx.fill();
    const bar=ctx.createLinearGradient(x,y,x,y+5);bar.addColorStop(0,'#f5d28f');bar.addColorStop(1,'#b3802f');ctx.fillStyle=bar;ctx.beginPath();ctx.roundRect(x,y,80*f,5,2.5);ctx.fill();
    ctx.strokeStyle='#e4c98a88';ctx.lineWidth=.7;ctx.beginPath();ctx.roundRect(x-2,y-2,84,9,4.5);ctx.stroke();
  }
}
// Brick break stays quiet (three crumbs). Structural crashes throw rendered stone chips, gold spark streaks, plate fragments and soft dust;
// small impacts are a brief warm bloom plus a few streaks. Nothing here is a stroked ring.
function gEffects(ctx,g,art){
  const T=art.manifest.tidewheel,B=art.manifest.bellforge;
  for(const e of g.effects){
    const q=e.age/e.life,a=1-q;ctx.save();ctx.globalAlpha=a;
    switch(e.kind){
      case'bell-warning':case'paddle':break;
      case'brick-break':{
        const key=e.colour||'coral',img=art.images['brick/'+key];
        if(img)for(let n=0;n<3;n++){const t=e.age,x=e.x+(n-1)*(8+t*45)+(e.vx||0)*t,y=e.y+(e.vy||0)*t-45*t+180*t*t;ctx.save();ctx.translate(x,y);ctx.rotate((n-1)*t*5);ctx.drawImage(img,n*img.width/3,0,img.width/3,img.height,-(e.w||34)/6,-(e.h||18)/2,(e.w||34)/3,e.h||18);ctx.restore();}
        break;}
      case'brick-hit':ctx.globalAlpha=1;sparks(ctx,e.x,e.y,e.age,3,70,[],1.4,3);break;
      case'housing-hit':ctx.globalAlpha=1;glow(ctx,e.x,e.y,22,'#ffc98a',a*.35);sparks(ctx,e.x,e.y,e.age,4,110,[],1.8,5);chips(ctx,e.x,e.y+6,e.age,e.life,3,70,.8,5);dust(ctx,e.x,e.y,e.age,e.life,3,18,9);break;
      case'housing-break':ctx.globalAlpha=1;chunks(ctx,art,'tidewheel/counterweight',T.counterweight,COUNTERWEIGHT,e.x,e.y,e.age,e.life,12,190,16,7);chips(ctx,e.x,e.y,e.age,e.life,10,170,1.15,8);
        dust(ctx,e.x,e.y+8,e.age,e.life,6,34,16);glow(ctx,e.x,e.y,46,'#ffc98a',Math.max(0,1-e.age*4)*.5);sparks(ctx,e.x,e.y,e.age,9,190,[],2.2,8);break;
      case'drawbridge-crash':{
        const t=e.age-.5;ctx.globalAlpha=1;
        // The chains snap at the bridge ends, then the slab lands and breaks up.
        if(e.age<.42)for(const sx of[96,264]){glow(ctx,sx,104,26,'#ffc98a',(1-e.age/.42)*.55);sparks(ctx,sx,104,e.age,7,170,[],2.2,Math.round(sx));}
        if(t>0){chunks(ctx,art,'bellforge/plinth',B.plinth,PLINTH,180,318,t,.6,26,260,22,11);chunks(ctx,art,'tidewheel/counterweight',T.counterweight,COUNTERWEIGHT,180,318,t,.6,6,200,15,12);
          chips(ctx,180,318,t,.6,18,240,1.4,13,.95);sparks(ctx,180,318,t,12,230,[],2.6,14);
          dust(ctx,180,326,t,.6,10,96,22);glow(ctx,180,322,60+t*150,'#e8d7ae',(1-t/.6)*.4);}
        break;}
      case'gate-open':{ctx.globalAlpha=1;const k=Math.sin(Math.PI*clamp01(q));glow(ctx,180,250,130,'#ffc46b',.5*k);dust(ctx,180,262,e.age,e.life,6,70,14,'#b9a177');
        chips(ctx,180,164,e.age,e.life,10,90,1,15,.6);sparks(ctx,180,262,e.age,8,150,[],2.2,16);break;}
      case'bell-release':ctx.globalAlpha=1;dust(ctx,e.x,e.y,e.age,e.life,3,14,8,'#7e7769');glow(ctx,e.x,e.y,22,'#ffc98a',a*.45);chips(ctx,e.x,e.y,e.age,e.life,3,40,.7,9,.4);break;
      case'bell-hit':ctx.globalAlpha=1;glow(ctx,e.x,e.y,26,'#ffe0a0',a*.6);sparks(ctx,e.x,e.y,e.age,5,150,[],1.9,13);break;
      case'bell-break':ctx.globalAlpha=1;chunks(ctx,art,'bellforge/bell',B.bell,BELL,e.x,e.y,e.age,e.life,9,170,11,17);glow(ctx,e.x,e.y,30,'#ffd88a',a*.45);sparks(ctx,e.x,e.y,e.age,5,140,[],1.9,18);break;
      case'bell-shoulder':ctx.globalAlpha=1;chunks(ctx,art,'bellforge/bell',B.bell,BELL,e.x,e.y,e.age,e.life,12,210,13,19);glow(ctx,e.x,e.y,56,'#ffc46b',a*.6);chips(ctx,e.x,e.y,e.age,e.life,6,150,1,20);sparks(ctx,e.x,e.y,e.age,10,210,[],2.3,20);break;
      case'korr-hit':ctx.globalAlpha=1;glow(ctx,e.x,e.y,24,'#ffb96b',a*.4);sparks(ctx,e.x,e.y,e.age,5,130,[],1.9,23);break;
      case'stagger':{ctx.globalAlpha=Math.min(1,a*3);glow(ctx,e.x,e.y,40+e.age*40,'#ffe3a1',Math.max(0,.5-e.age*1.2));if(e.age<.9)text(ctx,'STAGGERED!',e.x,e.y-82-e.age*10,13,'#ffe08f','center');break;}
      case'korr-defeat':{ctx.globalAlpha=1;const t=e.age;
        // Armour plates crack off and the dais dust rolls out; streaks lift in two waves.
        chips(ctx,e.x,e.y+20,t,1.4,16,190,1.25,31);sparks(ctx,e.x,e.y,t,12,200,[],2.4,32);if(t>.3)sparks(ctx,e.x,e.y+30,t-.3,8,160,[],2,33);
        dust(ctx,e.x,e.y+56,t,e.life,10,110,20,'#9a8a74');if(t<.5)glow(ctx,e.x,e.y+30,130,'#ffcf7a',(1-t*2)*.5);break;}
      case'ward-deploy':ctx.fillStyle='#bfe3ff';ctx.fillRect(180-e.age*900,e.y-2,e.age*1800,4);break;
      case'ward-bounce':ctx.globalAlpha=1;glow(ctx,e.x,e.y,24,'#cfeaff',a*.6);sparks(ctx,e.x,e.y,e.age,4,100,[],1.6,29);break;
      case'paddle-stun':ctx.globalAlpha=1;pool(ctx,e.x,e.y+4,60,10,'#bfe6ff',(1-q)*.55);break;
      case'ram-armed':ctx.globalAlpha=1;pool(ctx,e.x,e.y+7,64,14,'#ffd8a0',(1-q)*.6);sparks(ctx,e.x,e.y+4,e.age,6,150,[],2,35);break;
      case'ram-launch':ctx.globalAlpha=1;glow(ctx,e.x,e.y,60+e.age*60,'#9ed1ff',(1-q)*.7);sparks(ctx,e.x,e.y,e.age,10,230,[],2.4,37);break;
      case'ram-end':ctx.globalAlpha=1;glow(ctx,e.x,e.y,26,'#c9dff0',a*.5);sparks(ctx,e.x,e.y,e.age,4,90,[],1.7,41);break;
      case'ratchet':ctx.globalAlpha=1;glow(ctx,e.x,e.y,36,'#ffd883',a*.35);sparks(ctx,e.x,e.y,e.age,6,140,[],2,43);break;
      default:ctx.globalAlpha=1;sparks(ctx,e.x,e.y,e.age,4,80,[],1.6);
    }
    ctx.restore();
  }
}
// The sweet spot is the paddle's centre third: three gem sockets under it light 1/3, 2/3, 3/3 (gold for Kit, rose for Lumi),
// then the centre glazes with a warm pulse until the ram launches. No drawn outline.
function gPaddle(ctx,g,art,skin=['paddleL','paddleM','paddleR'],gem='pip_gold'){
  const p=g.paddle,h=p.h*20/12,py=p.y+p.h/2,k=p.stun/.8,f=Math.floor(g.time*45);
  const jx=p.stun>0?(rnd(f,1)-.5)*4*k:0,jy=p.stun>0?(rnd(f,2)-.5)*2.4*k:0,x=p.x+jx,y=py+jy;
  const rose=gem==='pip_rose',warm=rose?'#ff9ec0':'#ffc98a',beat=.5+.5*Math.sin(g.time*9);
  pool(ctx,x+2,y+h/2+2,p.w*.52,4,'#000',.4*ga(ctx));
  if(p.armed)pool(ctx,x,y,p.w*.55,20,warm,.32+.16*beat);
  ctx.drawImage(art.images[skin[0]],x-p.w/2-4,y-h/2,16,h);ctx.drawImage(art.images[skin[1]],x-p.w/2+12,y-h/2,p.w-24,h);ctx.drawImage(art.images[skin[2]],x+p.w/2-12,y-h/2,16,h);
  const lit=p.armed?3:p.streak;
  if(p.armed){ctx.save();ctx.globalCompositeOperation='lighter';pool(ctx,x,y-1,p.w/6+4,h*.32,warm,.45+.3*beat);ctx.restore();}
  pips(ctx,x,y+h/2+5.5,3,lit,{key:gem,gap:9.5,scale:.86,bloom:warm,pulse:p.armed?beat:0});
  if(p.stun>0){
    ctx.save();ctx.globalAlpha=.25*k;ctx.fillStyle='#8fc4ff';ctx.beginPath();ctx.roundRect(x-p.w/2-4,y-h/2,p.w+8,h,7);ctx.fill();ctx.restore();
    for(let n=0;n<3;n++){
      ctx.beginPath();ctx.moveTo(x-p.w/2,y);for(let i=1;i<=8;i++)ctx.lineTo(x-p.w/2+p.w*i/8,y+(rnd(f,n*10+i)-.5)*(18+4*n)*.75);
      ctx.strokeStyle='#6fb0ff88';ctx.lineWidth=3;ctx.stroke();ctx.strokeStyle='#e4f4ff';ctx.lineWidth=1.1;ctx.stroke();
    }
  }
}
function gBall(ctx,g,art,b){
  const ram=b.ram>0,sp=Math.hypot(b.vx,b.vy)||1,ux=b.vx/sp,uy=b.vy/sp;
  if(!b.caught){
    if(!ram){const tr=ctx.createLinearGradient(b.x,b.y,b.x-ux*22,b.y-uy*22);tr.addColorStop(0,'#eaf8ff99');tr.addColorStop(1,'#eaf8ff00');
    ctx.save();ctx.lineCap='round';ctx.strokeStyle=tr;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x-ux*22,b.y-uy*22);ctx.stroke();ctx.restore();}
  }
  if(!ram){ctx.drawImage(art.images.ball,b.x-10,b.y-10,20,20);return;}
  // Ram ball: polished steel with a gold hoop, a blue-white halo, a tapered slipstream and a ring that drains over its 2.5 s.
  const r=b.r,x=b.x,y=b.y,ang=Math.atan2(b.vy,b.vx);
  glow(ctx,x,y,r*(2+1.6*clamp01(b.ram/2.5)),'#8cc4ff',.55+.1*Math.sin(g.time*14));
  if(!b.caught){
    ctx.save();ctx.translate(x,y);ctx.rotate(ang);const L=60,tg=ctx.createLinearGradient(0,0,-L,0);tg.addColorStop(0,'#cfe8ffcc');tg.addColorStop(1,'#cfe8ff00');
    ctx.fillStyle=tg;ctx.beginPath();ctx.moveTo(0,-r*.95);ctx.lineTo(-L,-r*.25);ctx.lineTo(-L,r*.25);ctx.lineTo(0,r*.95);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#e8f4ffaa';ctx.lineWidth=1;for(const o of[-.55,.55]){ctx.beginPath();ctx.moveTo(-r*.5,o*r);ctx.lineTo(-L*.8,o*r*.5);ctx.stroke();}ctx.restore();
  }
  const sg=ctx.createRadialGradient(x-r*.35,y-r*.4,r*.1,x,y,r);sg.addColorStop(0,'#fff');sg.addColorStop(.25,'#d3e0ec');sg.addColorStop(.62,'#6f8499');sg.addColorStop(1,'#222c38');
  ctx.fillStyle=sg;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
  ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.clip();ctx.translate(x,y);ctx.rotate(ang+Math.PI/2);
  ctx.strokeStyle='#8a5f22';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(0,0,r*1.05,r*.34,0,0,Math.PI*2);ctx.stroke();
  ctx.strokeStyle='#f0c56f';ctx.lineWidth=2.4;ctx.stroke();ctx.restore();
  ctx.fillStyle='#ffffffcc';ctx.beginPath();ctx.ellipse(x-r*.36,y-r*.42,r*.2,r*.11,-.6,0,Math.PI*2);ctx.fill();
  // Rim shade as a soft inner gradient (no outline); the halo above shrinks as the 2.5 s ram drains.
  const rim=ctx.createRadialGradient(x,y,r*.7,x,y,r);rim.addColorStop(0,'#0d131a00');rim.addColorStop(1,'#0d131a99');ctx.fillStyle=rim;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
}
function gWard(ctx,g,art){
  const w=g.ward;if(!w)return;const flick=w.remaining<1.2?(Math.sin(g.time*30)>0?1:.35):1;
  ctx.save();ctx.globalAlpha=flick;
  const band=ctx.createLinearGradient(0,w.y-9,0,w.y+9);band.addColorStop(0,'#7fb8ff00');band.addColorStop(.5,'#9fd0ff66');band.addColorStop(1,'#7fb8ff00');ctx.fillStyle=band;ctx.fillRect(0,w.y-9,g.width,18);
  ctx.strokeStyle='#cfe8ff';ctx.lineWidth=2.4;ctx.shadowColor='#7fb8ff';ctx.shadowBlur=8;ctx.beginPath();ctx.moveTo(0,w.y);ctx.lineTo(g.width,w.y);ctx.stroke();ctx.shadowBlur=0;
  ctx.strokeStyle='#fff';ctx.lineWidth=.9;ctx.setLineDash([10,14]);ctx.lineDashOffset=-g.time*60;ctx.beginPath();ctx.moveTo(0,w.y);ctx.lineTo(g.width,w.y);ctx.stroke();ctx.setLineDash([]);
  if(art.images.shield)ctx.drawImage(art.images.shield,g.width-44,w.y-10,32,17);
  ctx.restore();
}
function gBanner(ctx,g,label,a,y=284){
  if(a<=0)return;ctx.save();ctx.globalAlpha=Math.min(1,a);
  const w=250,x=g.width/2-w/2;ctx.fillStyle='#0b111bdd';ctx.beginPath();ctx.roundRect(x,y-17,w,34,17);ctx.fill();
  ctx.strokeStyle='#d6a35f';ctx.lineWidth=1.4;ctx.stroke();ctx.strokeStyle='#ffe3a155';ctx.lineWidth=.6;ctx.beginPath();ctx.roundRect(x+3,y-14,w-6,28,14);ctx.stroke();
  text(ctx,label,g.width/2,y,16,'#ffe3a1','center');ctx.restore();
}
function gShake(g){
  let a=0;const amp={'drawbridge-crash':[.5,5,.4],'housing-break':[0,3,.3],'korr-defeat':[0,3.5,.5],'bell-shoulder':[0,3,.25],'ram-launch':[0,1.6,.18],'bell-hit':[0,.8,.1]};
  for(const e of g.effects){const s=amp[e.kind];if(!s)continue;const t=e.age-s[0];if(t>=0&&t<s[2])a=Math.max(a,s[1]*(1-t/s[2]));}
  return a?{x:Math.sin(g.time*95)*a,y:Math.cos(g.time*83)*a}:{x:0,y:0};
}
function renderGatehouse(ctx,g,art){
  const climb=g.phase==='climb',arrive=g.floor>0&&!climb&&g.phase!=='crash'&&g.floorTime<.7;
  const pan=climb?smooth(1-g.transition/1.2)*CLIMB:arrive?-(1-smooth(g.floorTime/.7))*CLIMB:0,alpha=climb||arrive?1-.85*Math.abs(pan)/CLIMB:1;
  // Backdrop: the keep plate under a night shade, scrolling at half speed (mirrored copies keep the seam out of sight) while the camera climbs.
  const bg=art.images['gatehouse/background'],by=pan*.45,H=g.height;
  ctx.drawImage(bg,0,by,g.width,H);
  // Mirrored copies keep the seam out of sight while climbing; the one below also covers the strip under a tall phone's playfield.
  for(const s of[-1,1]){const yy=by+s*H;if(yy>-H&&(yy<H||s>0)){ctx.save();ctx.translate(0,by+(s>0?2*H:0));ctx.scale(1,-1);ctx.drawImage(bg,0,0,g.width,H);ctx.restore();}}
  ctx.fillStyle=GATE_SHADE;ctx.globalAlpha=.42;ctx.fillRect(0,0,g.width,H);ctx.globalAlpha=1;
  const vg=ctx.createRadialGradient(g.width/2,H*.45,H*.3,g.width/2,H*.45,H*.8);vg.addColorStop(0,'#0000');vg.addColorStop(1,'#02040a99');ctx.fillStyle=vg;ctx.fillRect(0,0,g.width,H);
  const sh=gShake(g);ctx.save();ctx.translate(sh.x,sh.y);
  ctx.save();ctx.translate(0,pan);ctx.globalAlpha=alpha;
  if(g.floor===0){farArcade(ctx,g,art,176,Math.min(...g.bricks.map(b=>b.y))-6);floorDrawbridge(ctx,g,art);}else if(g.floor===1)floorMurder(ctx,g,art);else floorDuel(ctx,g,art);
  for(const b of g.bricks)if(b.hp>0)gbrick(ctx,art,b);
  for(const b of g.bells)ghBell(ctx,g,art,b);
  gEffects(ctx,g,art);ctx.restore();
  gWard(ctx,g,art);gPaddle(ctx,g,art,skinFor(art,'kit'));
  for(const b of g.balls)if(!b.dead)gBall(ctx,g,art,b);
  ctx.restore();
  // Floor chip, plus the floor banner over the climb and the first moments of each floor.
  const n=g.floor+1+(climb?1:0);ctx.save();ctx.globalAlpha=.85;ctx.fillStyle='#0b111bcc';ctx.beginPath();ctx.roundRect(g.width/2-40,6,80,17,8.5);ctx.fill();ctx.strokeStyle='#d6a35f88';ctx.lineWidth=.8;ctx.stroke();ctx.restore();
  text(ctx,`FLOOR ${n} / 3`,g.width/2,15,10.5,'#f3dca8','center');
  if(climb)gBanner(ctx,g,`FLOOR ${n} / 3 · ${GATEHOUSE_FLOORS[Math.min(2,n-1)].toUpperCase()}`,Math.min(1,(1-g.transition/1.2)*4));
  else if(g.floorTime<1.6&&g.phase!=='crash'&&g.phase!=='defeat'&&g.state==='play')gBanner(ctx,g,`FLOOR ${n} / 3 · ${GATEHOUSE_FLOORS[g.floor].toUpperCase()}`,g.floor?Math.min(1,(1.6-g.floorTime)*1.6):1);
}
export function drawEncounter(ctx,g,art,level){
  ctx.clearRect(0,0,g.width,g.height);
  if(level==='gatehouse')return renderGatehouse(ctx,g,art);
  if(level==='lumitower')return renderLumi(ctx,g,art);
  if(level==='rivals')return renderRivals(ctx,g,art);
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
    if(e.kind==='water-muzzle'){
      ctx.translate(e.x,e.y);ctx.rotate(e.angle);
      for(let n=0;n<8;n++){const t=e.age,a=(n-3.5)*.12;ctx.fillStyle=n%2?'#d4f8ee':'#75bfcc';ctx.beginPath();ctx.ellipse(Math.cos(a)*t*80,Math.sin(a)*t*80,1.4+q,1,0,0,Math.PI*2);ctx.fill();}
    }else if(e.kind==='brace-break'){
      const img=art.images['tidewheel/raft'];
      for(let n=0;n<4;n++){const t=e.age;ctx.save();ctx.translate(e.x+(n-1.5)*(10+t*32),e.y-14*t+100*t*t);ctx.rotate((n-1.5)*t*2);ctx.drawImage(img,145+n*87.5,130,87.5,102,-8.75,-7,17.5,14);ctx.restore();}
    }else if(e.kind==='brick-break'){
      const key=typeof e.colour==='number'?['sage','coral','ivory'][e.colour]:'coral';
      const img=['cyan','plum'].includes(e.colour)?art.images[e.colour]:art.images['brick/'+key];
      if(img)for(let n=0;n<3;n++){const t=e.age,x=e.x+(n-1)*(8+t*45)+(e.vx||0)*t,y=e.y+(e.vy||0)*t-45*t+180*t*t;
        ctx.save();ctx.translate(x,y);ctx.rotate((n-1)*t*5);ctx.drawImage(img,n*img.width/3,0,img.width/3,img.height,-(e.w||34)/6,-(e.h||18)/2,(e.w||34)/3,e.h||18);ctx.restore();}
    }else if(e.kind==='ram-armed'){ctx.globalAlpha=1;pool(ctx,e.x,e.y+7,64,14,'#ffd8a0',(1-q)*.6);sparks(ctx,e.x,e.y+4,e.age,6,150,[],2,35);
    }else if(e.kind==='ram-launch'){ctx.globalAlpha=1;glow(ctx,e.x,e.y,60+e.age*60,'#9ed1ff',(1-q)*.7);sparks(ctx,e.x,e.y,e.age,10,230,[],2.4,37);
    }else if(e.kind==='ram-end'){ctx.globalAlpha=1;glow(ctx,e.x,e.y,26,'#c9dff0',(1-q)*.5);sparks(ctx,e.x,e.y,e.age,4,90,[],1.7,41);
    }else{ctx.globalAlpha=1;sparks(ctx,e.x,e.y,e.age,4,80,[],1.5,7);}
    ctx.restore();
  }
  // Kit's blue-enamel paddle, the same skin the Gatehouse uses, with the Sweet-Spot Ram's gold gem sockets under it.
  const p=g.paddle,h=p.h*20/12,py=p.y+(level==='bellforge'?p.h/2:0),[pl,pm,pr]=skinFor(art,'kit')||['paddleL','paddleM','paddleR'];
  const beat=.5+.5*Math.sin(g.time*9);
  pool(ctx,p.x+2,py+h/2+2,p.w*.52,4,'#000',.4);
  if(p.armed)pool(ctx,p.x,py,p.w*.55,20,'#ffc98a',.32+.16*beat);
  ctx.drawImage(art.images[pl],p.x-p.w/2-4,py-h/2,16,h);ctx.drawImage(art.images[pm],p.x-p.w/2+12,py-h/2,p.w-24,h);ctx.drawImage(art.images[pr],p.x+p.w/2-12,py-h/2,16,h);
  if(p.armed){ctx.save();ctx.globalCompositeOperation='lighter';pool(ctx,p.x,py-1,p.w/6+4,h*.32,'#ffc98a',.45+.3*beat);ctx.restore();}
  pips(ctx,p.x,py+h/2+5.5,3,p.armed?3:p.streak||0,{key:'pip_gold',gap:9.5,scale:.86,bloom:'#ffc98a',pulse:p.armed?beat:0});
  if(g.powerTimers?.volley>0){
    ctx.save();ctx.translate(p.x,py-8);ctx.lineCap='round';
    ctx.strokeStyle='#382e24';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-20,2);ctx.quadraticCurveTo(0,-12,20,2);ctx.stroke();
    ctx.strokeStyle='#e1cba1';ctx.lineWidth=2;ctx.stroke();
    line(ctx,{x:-20,y:2},{x:0,y:8},'#e1dfd4',.8);line(ctx,{x:0,y:8},{x:20,y:2},'#e1dfd4',.8);
    line(ctx,{x:0,y:9},{x:0,y:-8},'#76533b',5);line(ctx,{x:-.5,y:9},{x:-.5,y:-8},'#d4ad75',1.5);ctx.restore();
  }
  for(const shot of g.shots||[]){
    ctx.save();ctx.translate(shot.x,shot.y);ctx.rotate(Math.atan2(shot.vy,shot.vx)+Math.PI/2);
    line(ctx,{x:0,y:15},{x:0,y:-5},'#433122',3);line(ctx,{x:-.5,y:14},{x:-.5,y:-5},'#ecd5ac',1.2);
    ctx.fillStyle='#d9e7e8';ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(-4,-2);ctx.lineTo(0,-4);ctx.lineTo(4,-2);ctx.closePath();ctx.fill();
    for(const side of[-1,1]){ctx.fillStyle='#b87861';ctx.beginPath();ctx.moveTo(0,10);ctx.lineTo(side*4,14);ctx.lineTo(side*4,19);ctx.lineTo(0,16);ctx.fill();}ctx.restore();
  }
  for(const b of g.balls)if(!b.dead){
    if(b.ram>0){gBall(ctx,g,art,b);continue;}
    if(!b.caught){const speed=Math.hypot(b.vx,b.vy)||1;const trail=ctx.createLinearGradient(b.x,b.y,b.x-b.vx/speed*22,b.y-b.vy/speed*22);trail.addColorStop(0,b.titan?'#e5adffbb':'#eaf8ff99');trail.addColorStop(1,'#eaf8ff00');line(ctx,{x:b.x,y:b.y},{x:b.x-b.vx/speed*22,y:b.y-b.vy/speed*22},trail,b.titan?10:6);}
    const size=b.titan?34:20;ctx.save();ctx.translate(b.x,b.y);
    if(b.titan)ctx.rotate(g.time*2);
    ctx.drawImage(b.titan?art.images.titan:art.images.ball,-size/2,-size/2,size,size);ctx.restore();
  }
  const active=Object.entries(g.powerTimers||{}).filter(([,time])=>time>0);
  if(active.length){
    const [name,time]=active[0],max=g.powerMaxTimes[name],x=p.x,y=py+19;
    ctx.fillStyle='#0c1923cc';ctx.beginPath();ctx.roundRect(x-27,y,54,3,2);ctx.fill();
    ctx.fillStyle=name==='cosmic'?'#cdadf1':'#d2bd8e';ctx.beginPath();ctx.roundRect(x-27,y,54*time/max,3,2);ctx.fill();
  }
}
// Paddle skin by hero: ['xSkinL','xSkinM','xSkinR'] when that skin has decoded, else the chrome paddle.
export function skinFor(art,id){const k=[id+'SkinL',id+'SkinM',id+'SkinR'];return k.every(n=>art.images[n]?.naturalWidth)?k:undefined;}
// Shared with the Lumi renderer (lumi-render.js).
export {glow,sparks,chips,pips,fxPart,dust,rnd,clamp01,smooth,gBanner,gPaddle,gBall,gWard,hoistChain,sprite,slab,CLIMB};
