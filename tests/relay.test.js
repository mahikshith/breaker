import {test} from 'node:test';
import assert from 'node:assert/strict';
import {makeBall,stepBall} from '../src/physics.js';
import {liveSkiffGeometry} from '../src/skiff.js';
import {circuitData} from '../tools/relay-circuit/data.mjs';
globalThis.Image=class{complete=true;naturalWidth=1;width=1024;height=768;decode(){return Promise.resolve();}};
const{Relay}=await import('../src/relay.js'),data=circuitData();
const level=(mode='easy',H=729,s=393/360)=>new Relay(360,H,s,mode,data);
const half=l=>{while(l.hp>l.maxHP/2)l.hitTarget('circuit-hull',{x:181,y:195,r:8});l.update(.001);};
const advance=(l,s)=>{for(let i=0;i<Math.round(s*120);i++)l.update(1/120);};

test('all Circuit modes have a broad hull route, equal colour panels, four grey pieces and no symbol order',()=>{
 for(const[mode,hp]of[['easy',72],['medium',96],['hard',120]]){
  const l=level(mode);assert.equal(l.hp,hp);assert.equal(l.coreMode,'manual');assert(l.spacePowers);assert.equal(l.coreHits,{easy:24,medium:30,hard:36}[mode]);assert.equal(l.ballRadius,8);assert.equal(l.paddle.w,125);assert(!('order'in l.rules));
  const grey=l.bricks.filter(b=>b.part==='brick_armour'),colour=l.bricks.filter(b=>b.part!=='brick_armour');assert.equal(grey.length,4);assert.equal(colour.length,26);assert(colour.every(b=>b.art.rect.w===48&&b.art.rect.h===17&&b.hp===1));assert(grey.every(b=>b.hp===2));assert.equal(l.nodes.length,4);
 }
});
test('normal and morph paddle drawing spans the actual WIDE collider while chrome caps retain scale',()=>{
 const l=level(),art=l.parts.paddle;Object.assign(art.img,{naturalWidth:1512,naturalHeight:432});const original=l.drawPaddleArt.bind(l);let morphCalls=0;
 for(const width of[125,125*1.55,125*2.1,l.right-l.left-16]){
  const draws=[],g={drawImage:(...a)=>draws.push(a)};l.paddle.w=width;original(g,l.paddle);assert.equal(draws.length,3);const [bx,,bw]=art.artBounds,ax=bx*1512,ar=(bx+bw)*1512,visible=[];
  for(const[,sx,,sw,,dx,,dw]of draws){const a=Math.max(sx,ax),b=Math.min(sx+sw,ar);if(b>a)visible.push([dx+(a-sx)/sw*dw,dx+(b-sx)/sw*dw]);}
  assert(Math.abs(Math.min(...visible.map(v=>v[0]))-(l.paddle.x-width/2))<1e-8);assert(Math.abs(Math.max(...visible.map(v=>v[1]))-(l.paddle.x+width/2))<1e-8);assert(Math.abs(draws[0][7]/draws[0][3]-draws[2][7]/draws[2][3])<1e-8);
 }
 for(const phase of['launch','return']){l.phase=phase;l.morphAge=.2;const q=liveSkiffGeometry(l);assert(q.m>0&&q.m<1);assert.equal(q.muzzles.length,2);assert.equal(l.paddle.w,l.right-l.left-16);}
});
test('real broad closed-iris normal contacts damage the mothership and do not require stations or guns',()=>{
 for(const[H,s]of[[729,393/360],[785,412/360]]){const l=level('easy',H,s);l.burstSpent=true;const a=l.assembly.iris;for(let i=0;i<l.maxHP;i++){const b=makeBall(a.x,a.y+48,0,-345,8);stepBall(b,.08,l.world());assert.equal(l.hp,l.maxHP-i-1);assert(b.vy>0||l.phase==='escape');}assert.equal(l.phase,'escape');assert(l.nodes.every(n=>n.hp===2));assert(l.guns.every(g=>g.hp===3));advance(l,1.8);assert.equal(l.state,'won');}
});
test('mode-sized productive ordinary damage contacts charge once each; shots, TITAN and spent metal cannot farm charge',()=>{
 const l=level(),arm=l.bricks.find(b=>b.maxHP===2),p=arm.art.rect;l.hitTarget(arm.id,{x:p.x,y:p.y});assert(Math.abs(l.coreChargeBank-1/l.coreHits)<1e-9);l.hitTarget(arm.id,{x:p.x,y:p.y});assert(Math.abs(l.coreChargeBank-2/l.coreHits)<1e-9);l.hitTarget(arm.id,{});assert(Math.abs(l.coreChargeBank-2/l.coreHits)<1e-9);l.hitTarget('circuit-hull',{shot:true});l.hitTarget('circuit-hull',{titan:7});assert(Math.abs(l.coreChargeBank-2/l.coreHits)<1e-9);for(const b of l.bricks.filter(b=>b.hp===1).slice(0,l.coreHits-2))l.hitTarget(b.id,{});assert.equal(l.paddle.charge,0);assert(Math.abs(l.coreChargeBank-1)<1e-9);l.updateCoreCharge(l.coreHits-.1);assert(l.paddle.charge<1);l.updateCoreCharge(.1);assert.equal(l.paddle.charge,1);assert.equal(l.bricksBroken,l.coreHits-1);
});
test('live and spent cannon impacts damage the mothership; overlapping boss surfaces count once',()=>{
 const l=level('hard'),g=l.guns[0],b=makeBall(g.x,g.y+24,0,-345,8);l.hitTarget(g.id,b);l.hitTarget('circuit-hull',b);assert.equal(l.hp,l.maxHP-1);assert.equal(g.hp,l.rules.gunHP-1);assert(Math.abs(l.coreChargeBank-1/l.coreHits)<1e-9);g.hp=0;l.clock+=.1;l.hitTarget(g.id,b);assert.equal(l.hp,l.maxHP-2);assert(Math.abs(l.coreChargeBank-2/l.coreHits)<1e-9);
});
test('extended hull still accepts every ordinary and powered impact with one visible half-health reward',()=>{
 const l=level();for(let i=0;i<l.maxHP/2-1;i++)l.hitTarget('circuit-hull',{x:181,y:195,r:8});assert.equal(l.phase,'relay');assert(!l.burstSpent);l.hitTarget('circuit-hull',{x:181,y:195,r:8});l.update(1/120);assert.equal(l.phase,'launch');assert(l.burstSpent);advance(l,.46);const hp=l.hp;l.hitTarget('circuit-hull',{shot:true,pulse:500,x:181,y:195});assert.equal(l.hp,hp-1);l.hitTarget('circuit-hull',{titan:8,x:181,y:195});assert.equal(l.hp,hp-5);assert.equal(l.phase,'flight');
});
test('UNSTOPPABLE pierces actual closed armour; LASER breaks station HP without a timing gate',()=>{
 const l=level('hard'),n=l.nodes[0],t=l.targets().filter(t=>t.id===n.id);assert(t.every(t=>t.pierceable!==false));const b=makeBall(n.x-26,n.y+40,0,-345,10);b.titan=7;stepBall(b,.14,{...l.world(),targets:t});assert.equal(n.hp,0);assert(b.vy<0);assert(!l.targets().some(t=>t.id===n.id));const grey=l.bricks.find(b=>b.maxHP===2);l.hitTarget(grey.id,{titan:7});assert.equal(grey.hp,0);const other=l.nodes[1];for(let i=0;i<4;i++)l.hitTarget(other.id,{shot:true,pulse:100+i});assert.equal(other.hp,0);assert(l.hp===l.maxHP);
});
test('half-hull reward stows exact balls and powers, then restores their safe fan with queued capsules once',()=>{
 const l=level('medium');l.balls.push(makeBall(90,450,40,-345,8));l.balls[1].titan=3;l.balls[1].r=10;l.fireT=4;l.slowT=5;l.shield=2;l.shieldT=9;Object.assign(l.paddle,{wideT:4,shrinkT:3,laserT:2,laserCd:.19});const balls=[...l.balls];half(l);assert(l.burstSpent);assert.equal(l.phase,'launch');const timers=()=>[l.fireT,l.slowT,l.shield,l.shieldT,l.paddle.wideT,l.paddle.shrinkT,l.paddle.laserT,l.paddle.laserCd,l.balls[1].titan],before=timers();advance(l,.46);assert.equal(l.phase,'flight');assert(!l.spacePowerAvailable());l.applyPower('split');l.startReturn();while(l.phase==='return')l.update(1/120);assert(l.returnServe);assert(l.balls.every((b,i)=>b===balls[i]));assert.deepEqual(timers(),before);l.pointerDown(180,l.H-20);l.pointerUp();assert.equal(l.queuedPowers.length,0);assert(l.balls.length>2);assert.equal(l.balls.filter(b=>b.titan>0).length,1);assert(l.balls.filter(b=>!b.titan).every(b=>b.r===8));
});
test('Vesper picker freezes every Circuit clock, power and ball before one legal choice',()=>{
 const l=level();for(const b of l.bricks.filter(b=>b.hp===1).slice(0,l.coreHits))l.hitTarget(b.id,{});l.updateCoreCharge(l.coreHits);assert(l.activateCorePower());assert(l.powerMenuOpen);const state=()=>JSON.stringify({clock:l.clock,t:l.t,kitTime:l.kitTime,serve:l.serveAge,fx:l.fx,balls:l.balls,inspect:l.inspect()});const before=state();l.update(50);l.pointerDown(80,700);l.pointerMove(200,700);l.pointerUp();assert.equal(state(),before);l.key('1',true);assert(!l.powerMenuOpen);assert.equal(l.paddle.charge,0);assert(l.paddle.laserT>0);assert(!l.chooseSpacePower('five'));
});
test('terminal and Continue retain hull, broken armour, cache progress and once-only flight',()=>{
 const l=level();half(l);advance(l,.46);l.startReturn();advance(l,.46);const hp=l.hp,n=l.nodes[0],cache=l.bricks.find(b=>b.payload==='split');while(n.hp)l.hitTarget(n.id,{});while(cache.hp)l.hitTarget(cache.id,{});l.fail('fixture');const snapshot=JSON.stringify(l.inspect());l.update(20);assert.equal(JSON.stringify(l.inspect()),snapshot);l.continueRun();assert.equal(l.hp,hp);assert.equal(n.hp,0);assert.equal(cache.hp,0);assert(l.burstSpent);assert(l.aim?.serve);assert.equal(l.nextAttack,l.clock+3);
});
