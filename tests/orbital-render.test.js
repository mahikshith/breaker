import{test}from'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';import{makeBall}from'../src/physics.js';
globalThis.Image=class{complete=true;naturalWidth=252;naturalHeight=72;decode(){return Promise.resolve();}};
const{Orbital}=await import('../src/orbital.js'),{SPR}=await import('../src/gfx.js');
const data=JSON.parse(readFileSync(new URL('../assets/orbital-forge/manifest.json',import.meta.url))),make=()=>new Orbital(360,729,393/360,'easy',data);
const context=()=>({calls:[],globalAlpha:1,save(){},restore(){},beginPath(){},ellipse(){},arc(){},fill(){},createRadialGradient(){return{addColorStop(){}};},drawImage(...args){this.calls.push(args);}});
test('Forge uses the actual cosmic sprite only for a live unstoppable ball and preserves approved ordinary art',()=>{
 const l=make(),normal=makeBall(80,500,0,-345,7.5),titan=makeBall(180,500,120,-300,10),dead=makeBall(260,500,0,-345,10);titan.titan=10;dead.titan=10;dead.dead=true;l.balls=[normal,titan,dead];let shots=0;l.drawShots=()=>shots++;const g=context();l.drawBalls(g);
 assert.equal(g.calls.filter(c=>c[0]===l.parts.ball.img).length,1);assert.equal(g.calls.filter(c=>c[0]===SPR.ball_titan.img).length,3);assert.equal(shots,1);assert.equal(titan.r,10);assert.equal(normal.r,7.5);
});
test('Forge paddle body matches1x/1.55x/2.1x/max collision widths while original end caps keep their proportions',()=>{
 const l=make(),a=l.parts.paddle,[bx,,bw]=a.artBounds,k=l.paddle.h/(a.size[1]*a.artBounds[3]),iw=a.img.naturalWidth;let originalCaps;
 for(const width of[125,125*1.55,125*2.1,l.right-l.left-16]){
  const p={...l.paddle,w:width},g=context();l.drawPaddleArt(g,p);assert.equal(g.calls.length,3);
  const [left,middle,right]=g.calls,edge=p.x-p.w/2,bodyLeft=left[5]+(bx*iw-left[1])*left[7]/left[3],bodyRight=right[5]+((bx+bw)*iw-right[1])*right[7]/right[3];
  assert(Math.abs(bodyLeft-edge)<1e-9);assert(Math.abs(bodyRight-edge-width)<1e-9);assert(Math.abs(left[5]+left[7]-middle[5])<1e-9);assert(Math.abs(middle[5]+middle[7]-right[5])<1e-9);assert(middle[7]>0);
  const caps=[left[7],right[7],left[8],right[8]];if(originalCaps)assert.deepEqual(caps,originalCaps);else originalCaps=caps;
  assert(Math.abs(left[7]/left[3]-k)<1e-9);assert(Math.abs(right[7]/right[3]-k)<1e-9);assert.equal(l.paddle.w,125);
 }
});
