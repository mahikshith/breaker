import {Bellforge,sweepMovingSegment} from '../../src/fantasy/bellforge.js';
import {sweepTarget} from '../../src/carrier-physics.js';
function fold(x,lo,hi){const w=hi-lo;let p=((x-lo)%(2*w)+2*w)%(2*w);return lo+(p>w?2*w-p:p);}
function value(g,x,offset){let p={x,y:g.paddle.y-6.02},vx=Math.sin(offset/50*1.08)*345,vy=-Math.cos(offset/50*1.08)*345,time=0;
 for(let n=0;n<18;n++){const to={x:p.x+vx*3,y:p.y+vy*3},hits=[];const add=(h,k)=>{if(h)hits.push({...h,kind:k})};
 if(to.x<6)add({t:(6-p.x)/(to.x-p.x),nx:1,ny:0},'wall'); if(to.x>354)add({t:(354-p.x)/(to.x-p.x),nx:-1,ny:0},'wall');if(to.y<18)add({t:(18-p.y)/(to.y-p.y),nx:0,ny:1},'wall');
 for(const t of g.staticTargets())add(sweepTarget(p,to,6,t),t.kind==='villain'?'korr':t.item.type);
 for(const r of g.ramps)add(sweepMovingSegment(p,to,6,{...r,previousAngle:r.angle},3),'ramp');
 hits.sort((a,b)=>a.t-b.t);const h=hits[0];if(!h)return -100;time+=h.t*3;
 if(h.kind==='korr')return 100/(time+.5);if(h.kind==='brick')return 8/(time+.5);if(h.kind==='pin')return 6/(time+.5);
 p={x:p.x+(to.x-p.x)*h.t+h.nx*.02,y:p.y+(to.y-p.y)*h.t+h.ny*.02};const d=vx*h.nx+vy*h.ny;if(d<0){vx-=2*d*h.nx;vy-=2*d*h.ny;}if(p.y>g.paddle.y)return -100;
 }return -100;}
export function normal(g,dt=1/120){const b=g.balls[0];if(g.phase==='serve')g.launch(-1.9);if(b&&!b.caught&&b.vy>0){const t=Math.max(0,(g.paddle.y-b.r-b.y)/b.vy),land=fold(b.x+b.vx*t,6,354);let best=-Infinity,goal=land;
 for(let i=-19;i<=19;i++){const offset=i*2.5,p=land-offset;if(p<56||p>304)continue;const score=value(g,land,offset)+Math.sin(i*3.1+g.time*.7)*.0001;if(score>best){best=score;goal=p;}}
 g.setTarget(goal);}g.update(dt);}
