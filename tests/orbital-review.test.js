// Actual-art replacements for the archived rescue-greybox regressions in out/orbital-history.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {makeBall,stepBall} from '../src/physics.js';
import {collideTargets,overlapsTarget,sweepTarget} from '../src/carrier-physics.js';
globalThis.Image=class{complete=true;naturalWidth=1;decode(){return Promise.resolve();}};
const{Orbital}=await import('../src/orbital.js');
const data=JSON.parse(readFileSync(new URL('../assets/orbital-forge/manifest.json',import.meta.url)));
const level=()=>new Orbital(360,729,393/360,'medium',data);
test('real enclosed bay retains its lower metal lip and no hidden core',()=>{
 const l=level();assert(!l.targets().some(t=>t.id==='core'));
 assert(overlapsTarget({x:180,y:214,r:3},l.targets().find(t=>t.id==='hull')));
 assert.equal(l.fighters,undefined);assert.equal(l.pods,undefined);
});
test('external-core FIRE/TITAN contacts damage once per real contact episode across snapshots',()=>{
 for(const[power,damage]of[['fire',2],['titan',3]]){const l=level();l.phase='core';l.core.hp=l.core.maxHP=12;const b=makeBall(180,246,0,-345,power==='titan'?10:7.5);b[power]=power==='fire'?true:5;l.balls=[b];
 const collide=()=>{const w=l.world();collideTargets(b,w.targets,w.onTarget);};collide();assert.equal(l.core.hp,12-damage);
 for(let i=0;i<12;i++)collide();assert.equal(l.core.hp,12-damage);b.y=450;collide();b.x=180;b.y=246;collide();assert.equal(l.core.hp,12-2*damage);}
});
test('laser chooses the nearest real X panel; disabled gun remains visibly physical',()=>{
 const l=level(),p=l.bricks.find(b=>b.kind==='armour'),a=l.brickPose(p).pose;for(const q of l.bricks)if(q!==p)q.hp=0;assert(l.shotHit({x:a.x,y:100},550,.8));assert.equal(p.hp,1);
 for(const i of[0,1]){const q=level(),g=q.guns[i];for(const p of q.bricks)p.hp=0;g.hp=0;const m=q.muzzle(g),b=makeBall(m.x,m.y+40,0,-1200,10);b.titan=7;stepBall(b,.06,q.world());assert(b.vy>0);assert.equal(g.hp,0);}
});
test('all legal locked cannon angles have a clear actual muzzle outside the hull and retain player-contact metal',()=>{
 for(const i of[0,1])for(let x=73;x<=287;x+=2){const l=level();l.weaponRandom=()=>i?.3:0;l.started=true;l.teachDone=true;l.guns[1-i].hp=0;l.paddle.x=x;l.warn();const g=l.guns[i],from=l.muzzle(g);
 assert(!overlapsTarget({...from,r:3.5},l.targets().find(t=>t.id==='hull')),`gun${i} target${x} must not begin inside hull`);
 const source=l.targets().find(t=>t.id===g.id);assert(source);assert(l.targets().some(t=>t.id===l.guns[1-i].id+':spent'));
 const distance=12,dx=x-from.x,dy=l.paddle.y-from.y,n=Math.hypot(dx,dy),to={x:from.x+dx/n*distance,y:from.y+dy/n*distance};assert(!sweepTarget(from,to,3.5,l.targets().find(t=>t.id==='hull')));}
});
