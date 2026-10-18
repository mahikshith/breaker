import {test} from 'node:test';import assert from 'node:assert/strict';
globalThis.Image=class{complete=true;naturalWidth=1;decode(){return Promise.resolve();}};
const{drawStretchPaddle}=await import('../src/gfx.js');
test('WIDE art matches both collision edges and preserves the same rendered end-cap size at every tier',()=>{
 const part={img:{complete:true,naturalWidth:1000,naturalHeight:200},artBounds:[.05,.25,.9,.5]};let cap;
 for(const w of[125,193.75,262.5,304]){
  const calls=[],p={x:180,y:600,w,h:17};drawStretchPaddle({drawImage:(...args)=>calls.push(args)},part,p);assert.equal(calls.length,3);
  const[l,m,r]=calls;const left=l[5]+50*l[7]/l[3],right=r[5]+(950-r[1])*r[7]/r[3];
  assert(Math.abs(left-(p.x-w/2))<1e-9);assert(Math.abs(right-(p.x+w/2))<1e-9);
  assert.equal(l[5]+l[7],m[5]);assert(Math.abs(m[5]+m[7]-r[5])<1e-9);
  assert.equal(l[6]+50*l[8]/l[4],p.y);assert.equal(l[6]+150*l[8]/l[4],p.y+p.h);
  if(cap!==undefined)assert.equal(l[7],cap);cap=l[7];assert(m[7]>0);
 }
});
