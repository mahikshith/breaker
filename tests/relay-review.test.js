import {test} from 'node:test';
import assert from 'node:assert/strict';
import {makeBall} from '../src/physics.js';
import {collideTargets,overlapsTarget,sweepTarget} from '../src/carrier-physics.js';
import {circuitData} from '../tools/relay-circuit/data.mjs';
globalThis.Image=class{complete=true;naturalWidth=1;width=1024;height=768;decode(){return Promise.resolve();}};
const{Relay}=await import('../src/relay.js'),data=circuitData(),level=()=>new Relay(360,729,393/360,'hard',data);
test('one powered station overlap damages once across snapshots and rearms after a real exit',()=>{
 const l=level(),n=l.nodes[0],b=makeBall(n.x-28,n.y,0,-345,10);b.fire=true;const collide=()=>{const w=l.world();collideTargets(b,w.targets,w.onTarget);};collide();assert.equal(n.hp,1);for(let i=0;i<12;i++)collide();assert.equal(n.hp,1);b.y=450;collide();b.x=n.x-28;b.y=n.y;collide();assert.equal(n.hp,0);
});
test('iris alpha aperture stays clear when open while the actual upper arch remains physical',()=>{
 const l=level(),a=l.assembly.iris;l.openedAt=0;l.clock=1;const t=l.targets().find(t=>t.id==='circuit-hull');for(const r of[8,10]){assert.equal(sweepTarget({x:a.x,y:a.y+22},{x:a.x,y:a.y-22},r,t),null);assert(sweepTarget({x:a.x,y:a.y},{x:a.x,y:60},r,t));}
});
test('station windows retain alpha holes and physical side rails until armour actually breaks',()=>{
 const l=level();for(const n of l.nodes){const targets=l.targets().filter(t=>t.id===n.id);for(const r of[8,10]){assert(targets.every(t=>!overlapsTarget({x:n.x,y:n.y,r},t)));assert(targets.some(t=>sweepTarget({x:n.x,y:n.y},{x:n.x-40,y:n.y},r,t)));assert(targets.some(t=>sweepTarget({x:n.x,y:n.y},{x:n.x+40,y:n.y},r,t)));}assert(targets.every(t=>t.pierceable!==false));}
});
test('new enemy ordnance bypasses intact field cover without damaging it or farming Vesper',()=>{
 const l=level();for(const b of l.bricks){const r=b.art.rect,hp=b.hp;l.bolts=[{id:`review-${b.id}`,x:r.x+r.w/2,y:r.y-12,vx:0,vy:12000,r:9}];l.updateBolts(.01);assert.equal(l.bolts.length,1,b.id);assert.equal(b.hp,hp);}assert.equal(l.paddle.charge,0);const n=l.nodes[0];l.bolts=[{id:'review-metal',x:n.x-28,y:n.y-40,vx:0,vy:12000,r:9}];l.updateBolts(.01);assert.equal(l.bolts.length,1);assert.equal(n.hp,4);
});
test('final broad hull contact wins a simultaneous last-life miss in either ball order',()=>{
 for(const missFirst of[false,true]){const l=level();l.hp=1;l.burstSpent=true;for(const b of l.bricks)b.hp=0;for(const n of l.nodes)n.hp=0;const a=l.assembly.iris,contact=makeBall(a.x,a.y+44,0,-345,8),miss=makeBall(l.right-10,l.drainY+9,0,345,8);l.balls=missFirst?[miss,contact]:[contact,miss];l.aim=null;l.lives=1;l.hitStop=0;l.update(1/120);assert.equal(l.phase,'escape');assert.equal(l.hp,0);assert.equal(l.state,'play');assert.equal(l.lives,1);assert.equal(l.shots.length,0);}
});
