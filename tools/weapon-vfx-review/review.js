const TAU=Math.PI*2,clamp=n=>Math.max(0,Math.min(1,n)),ease=n=>{n=clamp(n);return n*n*(3-2*n);};
const timelines={helix:{charge:.35,fire:1.65,impact:2.4,cool:2.95,end:4.1,duration:5.2},reactor:{charge:.35,fire:1.95,impact:3.05,cool:3.6,end:4.7,duration:5.2}};let timeline=timelines.helix;
const [snapshot,manifest,selection]=await Promise.all([fetch('/scenes.json').then(r=>r.json()),fetch('/vfx/manifest.json').then(r=>r.json()),fetch('/selection.json').then(r=>r.ok?r.json():{}).catch(()=>({}))]);
const images=new Map();
async function image(path){if(images.has(path))return images.get(path);const p=new Image();p.src=path;await p.decode();images.set(path,p);return p;}
function url(path){return path.startsWith('/')?path:'/vfx/'+path;}
const clips={};
for(const[name,family]of Object.entries(manifest.families)){
 clips[name]={};
 for(const[id,c]of Object.entries(family))if(c.atlas&&c.available!==false)clips[name][id]={...c,img:await image('/vfx/'+c.atlas)};
 const chosen=selection.families?.[name]?.payload;if(chosen)clips[name].payload={...chosen,img:await image(url(chosen.path))};
 if(!clips[name].charge||!clips[name].payload)throw Error('Missing reviewed charge or payload: '+name);
}
const scenes={};
for(const[id,scene]of Object.entries(snapshot.scenes)){
 const bg=await image('/'+scene.background),cannon=await image('/'+scene.cannon.path),panel=await image('/'+scene.target.path),lit=document.createElement('canvas');lit.width=Math.ceil(scene.pose.w*3);lit.height=Math.ceil(scene.pose.h*3);
 scenes[id]={...scene,bg,cannon,panel,lit};
}
let family=new URLSearchParams(location.search).get('family')||'helix',device=new URLSearchParams(location.search).get('device')||'ios',playing=true,time=0,last=performance.now(),speed=1;
const canvases=[...document.querySelectorAll('.phone')].map(s=>({kind:s.dataset.kind,c:s.querySelector('canvas')}));
const metrics={frames:0,drawCalls:0,maxDrawCalls:0,maxFrameMs:0,readyClips:Object.fromEntries(Object.entries(clips).map(([k,v])=>[k,Object.keys(v)])),timelines,frozen:snapshot.frozen,scope:'Rendered charge atlases, actual approved payload PNGs and actual source panel/metal breakup. No rejected flight/impact seed is used.'};
let calls=0;
function drawImage(g,...a){calls++;g.drawImage(...a);}
function sprite(g,c,x,y,size,frame,angle=0,alpha=1){
 if(!c?.img||alpha<=0)return;const cell=c.cell||[c.img.naturalWidth,c.img.naturalHeight],columns=c.grid?.[0]||1,index=Math.max(0,Math.min((c.frames||1)-1,frame));
 g.save();g.translate(x,y);g.rotate(angle);g.globalAlpha*=alpha;drawImage(g,c.img,index%columns*cell[0],Math.floor(index/columns)*cell[1],...cell,-size/2,-size/2,size,size);g.restore();
}
function weapon(g,s,recoil,light){
 const p=s.pose,m=s.localMuzzle,g2=s.lit.getContext('2d'),w=s.lit.width,h=s.lit.height;g2.clearRect(0,0,w,h);g2.drawImage(s.cannon,0,0,w,h);
 if(light>0){g2.globalCompositeOperation='source-atop';const x=(p.px+m.x/p.w)*w,y=(p.py+m.y/p.h)*h,r=Math.max(w,h)*.5,gradient=g2.createRadialGradient(x,y,0,x,y,r);gradient.addColorStop(0,`rgba(255,154,233,${light*.78})`);gradient.addColorStop(.3,`rgba(217,59,187,${light*.42})`);gradient.addColorStop(1,'rgba(120,54,194,0)');g2.fillStyle=gradient;g2.fillRect(0,0,w,h);g2.globalCompositeOperation='source-over';}
 g.save();if(s.clip){g.beginPath();g.ellipse(p.x,p.y,s.clip.rx,s.clip.ry,0,0,TAU);g.clip();}g.translate(p.x,p.y);g.rotate(p.angle);g.translate(0,-recoil);drawImage(g,s.lit,-p.px*p.w,-p.py*p.h,p.w,p.h);g.restore();
}
function mouth(s,recoil){const p=s.pose,m=s.localMuzzle;return{x:p.x+m.x*Math.cos(p.angle)-(m.y-recoil)*Math.sin(p.angle),y:p.y+m.x*Math.sin(p.angle)+(m.y-recoil)*Math.cos(p.angle)};}
function rim(g,s,recoil){const p=s.pose,m=s.localMuzzle;g.save();g.translate(p.x,p.y);g.rotate(p.angle);g.translate(0,-recoil);g.beginPath();g.ellipse(m.x,m.y,11,8,0,0,TAU);g.ellipse(m.x,m.y,7,4.6,0,0,TAU,true);g.clip('evenodd');drawImage(g,s.cannon,-p.px*p.w,-p.py*p.h,p.w,p.h);g.restore();}
function target(g,s,age){
 const p=s.target.pose,img=s.panel;if(age<0){drawImage(g,img,-0+ p.x-p.px*p.w,p.y-p.py*p.h,p.w,p.h);return;}
 if(age>.6)return;const k=ease(age/.6),iw=img.naturalWidth,ih=img.naturalHeight;
 for(let i=0;i<4;i++){const x=i%2,y=Math.floor(i/2),dx=p.x-p.px*p.w+x*p.w/2,dy=p.y-p.py*p.h+y*p.h/2;g.save();g.globalAlpha*=1-k;g.translate(dx+p.w/4+(x?1:-1)*k*17,dy+p.h/4+(y?1:-1)*k*11+23*k*k);g.rotate((i%2?1:-1)*k*.7);drawImage(g,img,x*iw/2,y*ih/2,iw/2,ih/2,-p.w/4,-p.h/4,p.w/2,p.h/2);g.restore();}
}
function phase(){return time<timeline.charge?'Idle':time<timeline.fire?'Gather / compress':time<timeline.fire+.2?'Discharge / recoil':time<timeline.impact?'Payload travel':time<timeline.cool?'Contact / breakup':time<timeline.end?'Cooling / recovery':'Ready';}
function reactorFragments(g,a,x,y,angle,age){
 const cracks=[[[0,0],[.58,0],[.56,.2],[.49,.35],[.55,.43],[.42,.51],[.25,.47],[0,.53]],[[.58,0],[1,0],[1,.45],[.83,.5],[.66,.4],[.55,.43],[.49,.35],[.56,.2]],[[1,.45],[1,.84],[.77,.76],[.66,.67],[.51,.6],[.55,.43],[.66,.4],[.83,.5]],[[1,.84],[1,1],[.21,1],[.35,.85],[.44,.77],[.39,.67],[.51,.6],[.66,.67],[.77,.76]],[[0,.53],[.25,.47],[.42,.51],[.55,.43],[.51,.6],[.39,.67],[.44,.77],[.35,.85],[.21,1],[0,1]]],velocities=[[-16,-8,-.3],[14,-5,.42],[20,8,-.2],[4,22,.26],[-14,14,-.5]],k=ease(age/.5),w=a.displayUnits;
 for(let i=0;i<cracks.length;i++){const [dx,dy,spin]=velocities[i];g.save();g.globalAlpha*=1-k;g.translate(x,y);g.rotate(angle);g.translate(dx*k,dy*k);g.rotate(spin*k);g.beginPath();cracks[i].forEach(([u,v],j)=>j?g.lineTo((u-.5)*w,(v-.5)*w):g.moveTo((u-.5)*w,(v-.5)*w));g.closePath();g.clip();drawImage(g,a.img,-w/2,-w/2,w,w);g.restore();}
}
function render(){
 const start=performance.now();calls=0;
 for(const{kind,c}of canvases){const s=scenes[kind+'-'+device],D=s.device;if(c.width!==D.width*2||c.height!==D.height*2){c.width=D.width*2;c.height=D.height*2;c.style.width=D.width+'px';c.style.height=D.height+'px';}
  const g=c.getContext('2d');g.setTransform(2,0,0,2,0,0);g.clearRect(0,0,D.width,D.height);drawImage(g,s.bg,0,0,D.width,D.height);g.translate(s.offsetX,s.offsetY);g.scale(s.scale,s.scale);
  const q=clamp((time-timeline.charge)/(timeline.fire-timeline.charge)),fireAge=time-timeline.fire,recoilTime=family==='helix'?.28:.42,recoil=fireAge>=0&&fireAge<recoilTime?(family==='helix'?3:4)*Math.sin(Math.PI*fireAge/recoilTime)*Math.exp(-fireAge*2):0,light=time<timeline.fire?Math.pow(q,1.8)*.7:Math.max(0,1-(time-timeline.fire)/1.5),m=mouth(s,recoil),F=clips[family];
  target(g,s,time-timeline.impact);weapon(g,s,recoil,light);
  if(time>=timeline.charge&&time<timeline.fire){g.save();g.translate(m.x,m.y);g.rotate(s.pose.angle);g.beginPath();g.ellipse(0,0,11,8,0,0,TAU);g.clip();sprite(g,F.charge,0,0,56,Math.floor(q*11),0,.25+.75*q);g.restore();rim(g,s,recoil);}
  if(fireAge>=0&&fireAge<.16)sprite(g,F.charge,m.x,m.y,56,11-Math.floor(fireAge/.16*5),s.pose.angle,1-fireAge/.16);
  if(time>=timeline.fire&&time<timeline.impact){const u=clamp((time-timeline.fire)/(timeline.impact-timeline.fire)),k=Math.pow(u,family==='helix'?1.65:1.12),flight=F.payload,size=flight.displayUnits,nose=flight.noseUnits,dir={x:-Math.sin(s.pose.angle),y:Math.cos(s.pose.angle)},contactY=s.target.rect.y,contactX=s.muzzle.x+dir.x*(contactY-s.muzzle.y)/dir.y,x=s.muzzle.x+(contactX-s.muzzle.x)*k-dir.x*nose,y=s.muzzle.y+(contactY-s.muzzle.y)*k-dir.y*nose,roll=family==='reactor'?Math.sin(u*TAU)*.14:Math.sin(u*TAU)*.012;
   g.save();g.translate(s.muzzle.x,s.muzzle.y);g.rotate(s.pose.angle);g.beginPath();g.rect(-90,0,180,600);g.clip();g.rotate(-s.pose.angle);g.translate(-s.muzzle.x,-s.muzzle.y);sprite(g,flight,x,y,size,0,s.pose.angle+roll);g.restore();
  }
  const impactAge=time-timeline.impact;if(impactAge>=0&&impactAge<.55){const y=s.target.rect.y,x=s.muzzle.x-Math.tan(s.pose.angle)*(y-s.muzzle.y);if(impactAge<.12){const k=1-impactAge/.12,glow=g.createRadialGradient(x,y,0,x,y,12);glow.addColorStop(0,`rgba(255,240,251,${k})`);glow.addColorStop(.22,`rgba(242,100,201,${k*.7})`);glow.addColorStop(1,'rgba(186,70,206,0)');g.fillStyle=glow;g.fillRect(x-12,y-12,24,24);}if(family==='reactor'){const a=F.payload;reactorFragments(g,a,x+Math.sin(s.pose.angle)*a.noseUnits,y-Math.cos(s.pose.angle)*a.noseUnits,s.pose.angle,impactAge);}}
  if(time>=timeline.cool&&time<timeline.end){const k=(time-timeline.cool)/(timeline.end-timeline.cool);sprite(g,F.charge,m.x,m.y,48,Math.max(0,3-Math.floor(k*4)),s.pose.angle,(1-k)*.45);}
  g.setTransform(2,0,0,2,0,0);g.fillStyle='rgba(8,10,25,.85)';g.fillRect(0,0,D.width,17);g.fillStyle='#d8bed8';g.font='9px Rubik';g.textAlign='center';g.fillText('ANIMATION STUDY · NO GAMEPLAY DAMAGE',D.width/2,12);
 }
 metrics.frames++;metrics.drawCalls=calls;metrics.maxDrawCalls=Math.max(metrics.maxDrawCalls,calls);metrics.maxFrameMs=Math.max(metrics.maxFrameMs,performance.now()-start);
 document.querySelector('#scrub').value=time;document.querySelector('#phase').textContent=phase();
}
function setFamily(value){family=value;timeline=timelines[family];document.querySelector('#scrub').max=timeline.duration;document.querySelector('#title').textContent=family==='helix'?'A · Magnetic breacher':'B · Reactor rupture';document.querySelectorAll('[data-family]').forEach(b=>b.classList.toggle('active',b.dataset.family===family));render();}
function setDevice(value){device=value;document.querySelector('#device').value=value;render();}
document.querySelectorAll('[data-family]').forEach(b=>b.onclick=()=>{time=0;setFamily(b.dataset.family);});document.querySelectorAll('[data-boss]').forEach(b=>b.onclick=()=>document.querySelectorAll('.phone').forEach(p=>p.classList.toggle('selected',p.dataset.kind===b.dataset.boss)));
document.querySelector('#play').onclick=()=>{playing=!playing;document.querySelector('#play').textContent=playing?'Pause':'Play';};document.querySelector('#replay').onclick=()=>{time=0;playing=true;document.querySelector('#play').textContent='Pause';};document.querySelector('#device').onchange=e=>setDevice(e.target.value);document.querySelector('#speed').onchange=e=>speed=+e.target.value;document.querySelector('#scrub').oninput=e=>{playing=false;document.querySelector('#play').textContent='Play';time=+e.target.value;render();};
window.VFX={ready:true,metrics,get timeline(){return timeline;},setFamily,setDevice,setTime(t){playing=false;time=Math.max(0,Math.min(timeline.duration,t));render();},get time(){return time;},get family(){return family;},get device(){return device;}};
setFamily(family);setDevice(device);function tick(now){const dt=Math.min(.05,(now-last)/1000);last=now;if(playing)time=(time+dt*speed)%timeline.duration;render();requestAnimationFrame(tick);}requestAnimationFrame(tick);
