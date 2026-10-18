import {drawPlayerMuzzle} from './space-weapons.js';
const clamp=n=>Math.max(0,Math.min(1,n)),ease=n=>{n=clamp(n);return n*n*(3-2*n);},TAU=Math.PI*2;
export const SKIFF_STUDY={status:'live skiff implementation; original timing study retained',deploy:.45,fireStart:.58,pulseSpacing:.38,pulses:4,projectileDisplay:37,projectileVisibleBody:94/256*37,recoilTravel:5,flashSeconds:.14,returnAt:3.45,returnDuration:.45,duration:5.2,existingBurstSeconds:{easy:10,medium:9,hard:8},liveAmmunition:12,scope:'Study timings illustrate a shortened four-pulse excerpt. Live Circuit uses twelve finite alternating pulses, waits for the last in-flight pulse or a bounded timeout, and retains the mode burst cap; every live ball and its unused powers stay stowed until safe return.'};
const cache=new WeakMap();
const railPolygons=[[[120,38],[151,21],[184,31],[215,103],[205,151],[146,149],[112,109]],[[392,38],[361,21],[328,31],[297,103],[307,151],[366,149],[400,109]]];
const coverPolygons=[[[28,160],[98,142],[181,196],[201,318],[122,330],[37,269]],[[484,160],[414,142],[331,196],[311,318],[390,330],[475,269]]];
function polygon(g,points){g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();}
function pieces(level){const img=level.parts.craftFlight.img,morph=level.parts.craftMorph.img;if(!img?.complete||!img.naturalWidth||!morph?.complete||!morph.naturalWidth)return null;if(cache.has(img))return cache.get(img);const w=img.naturalWidth,h=img.naturalHeight;
 const make=()=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
 const scaled=points=>points.map(([x,y])=>[x/512*w,y/384*h]);
 const original=[[.3158203125,.19921875],[.6845703125,.19921875]],polys=railPolygons.map((points,i)=>points.map(([x,y])=>[x+((level.parts.craftFlight.muzzles?.[i]?.[0]??original[i][0])-original[i][0])*512,y+((level.parts.craftFlight.muzzles?.[i]?.[1]??original[i][1])-original[i][1])*384]));
 const rails=polys.map(points=>{const c=make(),g=c.getContext('2d');polygon(g,scaled(points));g.clip();g.drawImage(img,0,0,w,h);return c;});
 const base=make(),b=base.getContext('2d');b.drawImage(img,0,0,w,h);b.globalCompositeOperation='destination-out';for(const points of polys){polygon(b,scaled(points));b.fill();}b.globalCompositeOperation='source-over';
 const covers=coverPolygons.map(points=>{const c=make(),g=c.getContext('2d');polygon(g,scaled(points));g.clip();g.drawImage(morph,0,0,w,h);return c;});
 const result={base,rails,covers};cache.set(img,result);return result;
}
function image(g,img,x,y,w,h,alpha=1){if(alpha<=0||!img||!(img.naturalWidth||img.width)||img.complete===false)return;g.save();g.globalAlpha*=alpha;g.drawImage(img,x-w/2,y-h/2,w,h);g.restore();}
function burstState(age){const returning=age>=SKIFF_STUDY.returnAt,m=returning?1-ease((age-SKIFF_STUDY.returnAt)/.45):ease(age/.45);return{m,returning,active:age>=.45&&age<SKIFF_STUDY.returnAt};}
export function skiffGeometry(level,age){const p=level.paddle,{m,active,returning}=burstState(age),x=p.x,y=p.y-10+10*(1-m),extension=ease((m-.15)/.75),covers=ease((m-.12)/.65),muzzles=[];
 for(let side=0;side<2;side++){
  const uv=level.parts.craftFlight.muzzles[side],times=Array.from({length:SKIFF_STUDY.pulses},(_,i)=>SKIFF_STUDY.fireStart+i*.38).filter((_,i)=>i%2===side),last=times.filter(t=>t<=age).at(-1),a=last===undefined?Infinity:age-last,recoil=active&&a<.15?SKIFF_STUDY.recoilTravel*Math.sin(a/.15*Math.PI)*Math.exp(-a*4):0;
  muzzles.push({x:x+(uv[0]-.5)*80+(side?1:-1)*2*(1-extension),y:y+(uv[1]-.5)*60+9*(1-extension)+recoil,recoil,side,flash:a>=0&&a<.14?1-ease(Math.max(0,a-.025)/.115):0});
 }
 return{x,y,m,extension,covers,active,returning,muzzles};
}
export function drawSkiffStudy(g,level,age,options={}){
 const q=options.pose||skiffGeometry(level,age),p=level.paddle,prepared=pieces(level),parts=level.parts;if(!prepared){level.drawPaddleArt(g,p);return q;}const{base,rails,covers}=prepared;
 // The prototype replaces only local deck art. State, collision, powers and real Main are untouched.
 if(q.m<.36)level.drawPaddleArt(g,{...p,w:p.w*(1-.33*q.m/.36),y:p.y+q.m*5});
 if(q.m<.005)return q;
 g.save();g.globalAlpha*=Math.min(1,q.m*3);image(g,base,q.x,q.y,80,60);
 for(let side=0;side<2;side++){
  const sign=side?1:-1,m=q.muzzles[side];g.save();g.translate(q.x+sign*2*(1-q.extension),q.y+9*(1-q.extension)+m.recoil);image(g,rails[side],0,0,80,60);g.restore();
 }
 if(q.covers<1)for(let side=0;side<2;side++){
  const sign=side?1:-1,hinge={x:sign*17,y:5};g.save();g.globalAlpha*=1-ease((q.covers-.92)/.08);g.translate(q.x+hinge.x+sign*q.covers*9,q.y+hinge.y+q.covers*3);g.rotate(sign*q.covers*.38);image(g,covers[side],-hinge.x,-hinge.y,80,60);g.restore();
 }
 if(q.active){
  for(const sign of[-1,1]){const t=parts.bThruster;if(t)image(g,t.img,q.x+sign*21,q.y+22,5,13*(.9+.1*Math.sin(age*45+sign)));}
  const ball=parts.ball,art=parts.craftFlight,c={x:q.x+(art.cradle[0]-.5)*80,y:q.y+(art.cradle[1]-.5)*60};image(g,ball.img,c.x,c.y,6,6);
  const[x,y,w,h]=art.cradleLip,[iw,ih]=art.size;g.drawImage(art.img,x/iw*art.img.naturalWidth,y/ih*art.img.naturalHeight,w/iw*art.img.naturalWidth,h/ih*art.img.naturalHeight,q.x+(x/iw-.5)*80,q.y+(y/ih-.5)*60,w/iw*80,h/ih*60);
 }
 for(const m of q.muzzles)if(m.flash>0){if(options.live){drawPlayerMuzzle(g,m,-Math.PI/2,m.fireAge);continue;}g.save();g.globalAlpha*=m.flash;g.translate(m.x,m.y);g.rotate(Math.PI);if(options.payload){g.drawImage(options.payload,72,130,112,96,-10,-2,20,17);}else if(options.charge){g.drawImage(options.charge,3*256,2*256,256,256,-12,-12,24,24);}g.restore();}
 g.restore();return q;
}
export function liveSkiffGeometry(level){
 const m=level.phase==='launch'?ease(level.morphAge/.45):level.phase==='return'?1-ease(level.morphAge/.45):1,art=level.parts[level.craftPose().key],x=level.paddle.x,y=level.paddle.y-10+10*(1-m),extension=ease((m-.15)/.75),covers=ease((m-.12)/.65),active=level.phase==='flight';
 const muzzles=art.muzzles.map((uv,side)=>{const fireAge=level.clock-(level.skiffFiredAt?.[side]??-Infinity),recoil=active&&fireAge>=0&&fireAge<.15?5*Math.sin(fireAge/.15*Math.PI)*Math.exp(-fireAge*4):0;return{x:x+(uv[0]-.5)*80+(side?1:-1)*2*(1-extension),y:y+(uv[1]-.5)*60+9*(1-extension)+recoil,side,recoil,fireAge,flash:active&&fireAge>=0&&fireAge<.14?1:0};});
 return{x,y,m,extension,covers,active,returning:level.phase==='return',muzzles};
}
export function drawLiveSkiff(g,level){const art=level.parts[level.craftPose().key],view={parts:{...level.parts,craftFlight:art},paddle:level.paddle,drawPaddleArt:level.drawPaddleArt.bind(level)};return drawSkiffStudy(g,view,0,{pose:liveSkiffGeometry(level),live:true});}
