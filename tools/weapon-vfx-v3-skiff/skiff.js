const clamp=n=>Math.max(0,Math.min(1,n)),ease=n=>{n=clamp(n);return n*n*(3-2*n);},TAU=Math.PI*2;
export const SKIFF_STUDY={status:'visual proposal; no production implementation',deploy:.45,fireStart:.58,pulseSpacing:.38,pulses:4,projectileDisplay:37,projectileVisibleBody:94/256*37,recoilTravel:5,flashSeconds:.14,returnAt:3.45,returnDuration:.45,duration:5.2,existingBurstSeconds:{easy:10,medium:9,hard:8},scope:'Flight is a shortened excerpt; all balls/powers stay stowed in the actual mechanic.'};
const cache=new WeakMap();
const railPolygons=[[[120,38],[151,21],[184,31],[215,103],[205,151],[146,149],[112,109]],[[392,38],[361,21],[328,31],[297,103],[307,151],[366,149],[400,109]]];
const coverPolygons=[[[28,160],[98,142],[181,196],[201,318],[122,330],[37,269]],[[484,160],[414,142],[331,196],[311,318],[390,330],[475,269]]];
function polygon(g,points){g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();}
function pieces(level){if(cache.has(level))return cache.get(level);const img=level.parts.craftFlight.img,morph=level.parts.craftMorph.img,w=img.naturalWidth,h=img.naturalHeight;
 const make=()=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
 const scaled=points=>points.map(([x,y])=>[x/512*w,y/384*h]);
 const rails=railPolygons.map(points=>{const c=make(),g=c.getContext('2d');polygon(g,scaled(points));g.clip();g.drawImage(img,0,0,w,h);return c;});
 const base=make(),b=base.getContext('2d');b.drawImage(img,0,0,w,h);b.globalCompositeOperation='destination-out';for(const points of railPolygons){polygon(b,scaled(points));b.fill();}b.globalCompositeOperation='source-over';
 const covers=coverPolygons.map(points=>{const c=make(),g=c.getContext('2d');polygon(g,scaled(points));g.clip();g.drawImage(morph,0,0,w,h);return c;});
 const result={base,rails,covers};cache.set(level,result);return result;
}
function image(g,img,x,y,w,h,alpha=1){if(alpha<=0)return;g.save();g.globalAlpha*=alpha;g.drawImage(img,x-w/2,y-h/2,w,h);g.restore();}
function burstState(age){const returning=age>=SKIFF_STUDY.returnAt,m=returning?1-ease((age-SKIFF_STUDY.returnAt)/.45):ease(age/.45);return{m,returning,active:age>=.45&&age<SKIFF_STUDY.returnAt};}
export function skiffGeometry(level,age){const p=level.paddle,{m,active,returning}=burstState(age),x=p.x,y=p.y-10+10*(1-m),extension=ease((m-.15)/.75),covers=ease((m-.12)/.65),muzzles=[];
 for(let side=0;side<2;side++){
  const uv=level.parts.craftFlight.muzzles[side],times=Array.from({length:SKIFF_STUDY.pulses},(_,i)=>SKIFF_STUDY.fireStart+i*.38).filter((_,i)=>i%2===side),last=times.filter(t=>t<=age).at(-1),a=last===undefined?Infinity:age-last,recoil=active&&a<.15?SKIFF_STUDY.recoilTravel*Math.sin(a/.15*Math.PI)*Math.exp(-a*4):0;
  muzzles.push({x:x+(uv[0]-.5)*80+(side?1:-1)*2*(1-extension),y:y+(uv[1]-.5)*60+9*(1-extension)+recoil,recoil,side,flash:a>=0&&a<.14?1-ease(Math.max(0,a-.025)/.115):0});
 }
 return{x,y,m,extension,covers,active,returning,muzzles};
}
export function drawSkiffStudy(g,level,age,options={}){
 const q=skiffGeometry(level,age),p=level.paddle,{base,rails,covers}=pieces(level),parts=level.parts;
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
 for(const m of q.muzzles)if(m.flash>0){g.save();g.globalAlpha*=m.flash;g.translate(m.x,m.y);g.rotate(Math.PI);if(options.payload){g.drawImage(options.payload,72,130,112,96,-10,-2,20,17);}else if(options.charge){g.drawImage(options.charge,3*256,2*256,256,256,-12,-12,24,24);}g.restore();}
 g.restore();return q;
}
