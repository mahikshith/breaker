import { Carrier } from '../../src/carrier.js';
import { ART } from '../../src/vault-art.js';
import { artLoaded, loadImg } from '../../src/gfx.js';

const option = new URLSearchParams(location.search).get('option') || 'A';
const W = 393, H = 852, scale = W / 360, originY = 59 - 34 * scale;
const data = ART.carrier, parts = Object.fromEntries(Object.entries(data.parts).map(([id, p]) => [id, { ...p, img: loadImg(p.url) }]));
const TAU = Math.PI * 2;
const proposals = {
  A: {
    title: 'A · Jump Coil',
    intro: 'A visible jump deadline. Fighters break your cover. Rescue a worker to buy six more seconds.',
    states: [
      ['01 · The carrier is warming up', 'A single compact jump clock', 'Five captive crew and an 18-hit hull. The mission is lost if the jump clock reaches zero.'],
      ['02 · The fighter changes the board', 'Warn → fire → a real consequence', 'A warned shot breaks one piece of cover. An exposed paddle hit costs a life and returns to serve.'],
      ['03 · Earn the counter, buy time', 'Nix counters · Tick secures the rescue', 'Twelve legal breaks charge the existing core. Spend it on one TITAN; a newly secured worker adds +6s.']
    ],
    nix: 'Proposed role: a deliberate face tap spends the existing full core on one 7s TITAN ball. Automatic centre-return TITAN is replaced.',
    tick: 'Proposed role: secure each released worker once. Each unique rescue adds +6s; the same worker cannot be farmed for extra time.',
    footer: 'TUNING PROPOSAL · 110s initial deadline · 18 normal hull hits + five crew · Fighters: 2 hits, 1.2s locked warning, 300u/s shot'
  },
  B: {
    title: 'B · Boarding Raid',
    intro: 'A fighter comes into reach and starts extracting a worker. Stop the raid before the captive is taken.',
    states: [
      ['01 · The raider banks around', 'A visible target, outside the thumb zone', 'The fighter approaches from the side and marks a captive. Its firing position stays 220u above the paddle.'],
      ['02 · The extraction is happening', 'Eight-second warning · pull in the final two', 'After cover is breached, the local ring gives eight seconds. Here only two remain: the captive is being pulled toward the raider.'],
      ['03 · Two ordinary hits interrupt it', 'Raid stopped · captive still safe and locked', 'Destroy the fighter to stop extraction. The captive stays in its housing; free that lock to let Tick complete the rescue.']
    ],
    nix: 'Proposed role: the same earned core becomes a deliberate one-ball TITAN counter. An ordinary ball can still stop every raid in two hits.',
    tick: 'Proposed role: secure workers after their housing opens; they cannot be targeted again. Destroying a raider interrupts the threat, but does not free the lock.',
    footer: 'TUNING PROPOSAL · No global countdown · Interruptible 8s extraction · Rescue all five to win; hull shutdown is optional · No new resource meter'
  }
};
const p = proposals[option];
if (!p) throw Error('Choose proposal A or B');
document.querySelector('main').innerHTML = `<header><div class="eyebrow">CONCEPT PROPOSAL · NOT IMPLEMENTED</div><h1>${p.title}</h1><p>${p.intro}</p></header><section class="states">${p.states.map(([title, beat, caption], i) => `<article class="state"><h2>${title}</h2><p class="beat">${beat}</p><canvas data-state="${i}" width="393" height="852" aria-label="Proposed Carrier state ${i + 1}"></canvas><p class="caption">${caption}</p></article>`).join('')}</section><section class="roles"><div><strong>NIX · Earned counter</strong><p>${p.nix}</p></div><div><strong>TICK · Crew secured</strong><p>${p.tick}</p></div></section><footer>${p.footer}<br>Approved Carrier artwork preserved. Companion roles and action overlays are proposals; finished Nix/Tick sprites and these mechanics are not built.</footer>`;

function part(g, id, x, y, w, h, angle = 0, alpha = 1) {
  const p = parts[id]; [w, h] = w === undefined ? p.display : [w, h];
  g.save(); g.globalAlpha *= alpha; g.translate(x, y); g.rotate(angle); g.drawImage(p.img, -p.pivot[0] * w, -p.pivot[1] * h, w, h); g.restore();
}
function ellipse(g, x, y, rx, ry, color, width = 1.4) { g.strokeStyle = color; g.lineWidth = width; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.stroke(); }
function check(g, x, y, color = '#97efdc') { g.strokeStyle = color; g.lineWidth = 2; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - 4, y); g.lineTo(x - 1, y + 3); g.lineTo(x + 5, y - 4); g.stroke(); }
function warning(g, x, y) { g.fillStyle = '#ffb486'; g.beginPath(); g.moveTo(x, y - 5); g.lineTo(x + 5.5, y + 4); g.lineTo(x - 5.5, y + 4); g.closePath(); g.fill(); g.fillStyle = '#371725'; g.fillRect(x - .6, y - 2.8, 1.2, 3); g.fillRect(x - .6, y + 1.3, 1.2, 1.2); }
function shot(g, from, to) { g.lineCap = 'round'; g.strokeStyle = 'rgba(246,114,137,.24)'; g.lineWidth = 6; g.beginPath(); g.moveTo(...from); g.lineTo(...to); g.stroke(); g.strokeStyle = '#ffdec8'; g.lineWidth = 1.8; g.stroke(); }
function guide(g, points, color = '#e49ba4') { g.save(); g.setLineDash([3, 6]); g.strokeStyle = color; g.lineWidth = 1.1; g.beginPath(); points.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); g.restore(); }
function ring(g, x, y, r, color) { ellipse(g, x, y, r, r, color, 1.6); for (const a of [0, TAU/4, TAU/2, TAU*3/4]) { g.strokeStyle = color; g.beginPath(); g.moveTo(x + Math.cos(a) * (r+3), y + Math.sin(a) * (r+3)); g.lineTo(x + Math.cos(a) * (r+7), y + Math.sin(a) * (r+7)); g.stroke(); } }
function emptyCell(g, c) { const a = c.art; part(g, 'aPod', a.x, a.y, a.w, a.h); }
function labelHUD(g, value, ready = false) {
  const x = 238/scale, y = 34 + 18/scale;
  g.fillStyle = ready ? '#a7f1e5' : '#ffbaa2'; g.font = `15px "Lilita One"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(value, x + 24/scale, y);
  g.strokeStyle = ready ? '#7edacb' : '#e38d80'; g.lineWidth = 1.1/scale; g.beginPath(); g.arc(x - 1/scale, y, 5/scale, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(x - 1/scale, y - 3/scale); g.lineTo(x - 1/scale, y); g.lineTo(x + 2/scale, y + 2/scale); g.stroke();
}
function opticSegments(g, hp) {
  for (let i=0;i<3;i++) { const a=-2.95+i*.98;g.strokeStyle=hp>i*6?'#efb9db':'#454259';g.lineWidth=1.8;g.beginPath();g.ellipse(180,140,23,12,0,a,a+.63);g.stroke(); }
}
function extractionClock(g, target, seconds) {
  const x=target.x,y=target.y,r=25;
  ellipse(g,x,y,r,r,'rgba(245,169,174,.25)',1.8);
  g.strokeStyle='#ffb4a7';g.lineWidth=2.3;g.beginPath();g.arc(x,y,r,-Math.PI/2,-Math.PI/2+TAU*seconds/8);g.stroke();
  g.fillStyle='#171628';g.beginPath();g.arc(x+31,y-17,12,0,TAU);g.fill();g.fillStyle='#ffc2ad';g.font='12px "Lilita One"';g.textAlign='center';g.textBaseline='middle';g.fillText('0:02',x+31,y-17);
}
function base(canvas, stage) {
  const g = canvas.getContext('2d'), fullH = Math.round(360 * H / W), worldH = Math.round(fullH - 93 / scale) + 34, l = new Carrier(360, worldH, scale);
  l.hudY = 34; l.inB = 34/scale; l.clock = 3; l.aim = null; l.score = [1240,1680,2540][stage]; l.carrier.hp = option === 'A' ? [18,14,10][stage] : 18;
  l.paddle.charge = option==='A' ? [0,.75,0][stage] : 0;
  const b = l.balls[0], ballPos = option==='A' ? [[170,500],[218,460],[181,235]][stage] : [[170,500],[204,l.paddle.y-144],[180,l.paddle.y-258]][stage];
  Object.assign(b, { caught: false, x: ballPos[0], y: ballPos[1], r: stage===2&&option==='A'?10:7.5, titan: stage===2&&option==='A'?6:0 });
  l.drawHUD = function(g) { this.drawHUDBase(g);if(option==='A'){const x=64/scale,y=34+35/scale,w=this.W-180/scale;g.fillStyle='#35384c';g.fillRect(x,y-1.5/scale,w,3/scale);g.fillStyle='#ed98bc';g.fillRect(x,y-1.5/scale,w*(1-[110,71,77][stage]/110),3/scale);} };
  if (option === 'A' && stage >= 1) { for(const id of ['aBrickCyan0','aBrickCyan1','aBrickCyan2','aBrickCyan3','aBrickCyan4','aBrickCyan5','aBrickCyan6','aBrickCyan7','aBrickPink0','aBrickPink1'])l.bricks.find(b=>b.id===id).hp=0;l.guns[0].hp=0; }
  if (option === 'A' && stage === 2) for(const id of ['aBrickPink2','aBrickPink3'])l.bricks.find(b=>b.id===id).hp=0;
  const target = l.crew[0];
  if (option==='B'&&stage>=1) { for(const id of ['aBrickCyan7','aBrickPink2','aBrickCyan3'])l.bricks.find(b=>b.id===id).hp=0;if(stage===1)l.crew=l.crew.filter(c=>c!==target); }
  if (option==='A'&&stage===2) { l.crew=l.crew.filter(c=>c!==target); }
  g.setTransform(scale,0,0,scale,0,0);l.drawFullBleedBackground(g,originY/scale,H/scale);g.setTransform(scale,0,0,scale,0,originY);l.draw(g);
  opticSegments(g,l.carrier.hp);
  g.fillStyle='#b3c6d9';for(const x of [22,28])g.fillRect(x/scale,34+11/scale,2.5/scale,14/scale);
  return {g,l,target,b};
}

function drawA(canvas, stage) {
  const {g,l,target,b}=base(canvas,stage), fighters=[{x:136,y:220,w:31,a:-.28},{x:181,y:255,w:50,a:0},{x:222,y:232,w:35,a:.28}];
  labelHUD(g,['1:50','1:11','1:17'][stage],stage===2);
  for(const [i,f]of fighters.entries()) { if(stage===2&&i===1)continue;part(g,'aFighter',f.x,f.y,f.w,f.w*parts.aFighter.display[1]/parts.aFighter.display[0],f.a); }
  if(stage===0){ring(g,181,255,30,'#eab1ab');warning(g,181,290);guide(g,[[181,290],[139,328]]);}
  if(stage===1){shot(g,[164,290],[139,318]);ring(g,136,328,17,'#ffa47d');for(const [x,y]of [[125,337],[139,342],[148,332]]){g.fillStyle='#77c8dc';g.fillRect(x,y,4,2);}}
  if(stage===2){emptyCell(g,target);part(g,'aWorker',115,210);ring(g,181,255,30,'#b9a9f4');check(g,target.x,target.y);g.strokeStyle='#e1bcf3';g.lineWidth=1.8;g.beginPath();g.arc(181,255,18,.2,2.4);g.stroke();}
  // Proposed hull feedback is a reversible overlay over the unchanged source plate.
  if(stage>0){g.strokeStyle='#efa0bc';g.lineWidth=1;g.beginPath();g.moveTo(162,125);g.lineTo(169,133);g.lineTo(166,139);g.lineTo(174,146);g.stroke();ellipse(g,180,140,26,13,'rgba(240,142,188,.35)');}
}
function drawB(canvas, stage) {
  const {g,l,target,b}=base(canvas,stage), raidY=l.paddle.y-220;
  if(stage===0){guide(g,[[144,207],[22,224],[22,raidY],[180,raidY]],'#a0a8c4');part(g,'aFighter',80,raidY,36,30,.7);ring(g,target.x,target.y,25,'#f4ae91');warning(g,target.x,target.y-21);}
  if(stage===1)emptyCell(g,target);
  if(stage===1){part(g,'aFighter',180,raidY,36,30,Math.PI);ring(g,180,raidY,25,'#f1a5ab');g.fillStyle='rgba(250,150,178,.09)';g.beginPath();g.moveTo(170,raidY-12);g.lineTo(target.x-12,target.y);g.lineTo(target.x+12,target.y);g.lineTo(190,raidY-12);g.closePath();g.fill();guide(g,[[180,raidY-12],[target.x,target.y]],'#e99fae');extractionClock(g,target,2);part(g,'aWorker',target.x+(180-target.x)*.36,target.y+(raidY-target.y)*.36);for(const x of [174,186]){g.fillStyle='#f4c2bd';g.beginPath();g.arc(x,raidY+23,2,0,TAU);g.fill();}}
  if(stage===2){ellipse(g,target.x,target.y,25,18,'#9ee4d4');for(const sign of [-1,1]){g.save();g.beginPath();g.rect(180+(sign<0?-40:0),raidY-30,40,65);g.clip();part(g,'aFighter',180+sign*7,raidY+8,36,30,Math.PI+sign*.12,.5);g.restore();}ring(g,180,raidY,25,'#a1d7e6');check(g,180,raidY);}
}

window.__urgencyBoards={ready:false,inspect:()=>({option,conceptOnly:true,noCompanionSprites:true,width:W,height:H,scenes:3,allImagesDecoded:Object.values(parts).every(p=>p.img.complete&&p.img.naturalWidth),rules:'Proposed, not working gameplay'})};
Promise.all([artLoaded(),document.fonts.load('18px "Lilita One"'),document.fonts.load('16px Rubik')]).then(()=>{for(const canvas of document.querySelectorAll('canvas'))(option==='A'?drawA:drawB)(canvas,Number(canvas.dataset.state));window.__urgencyBoards.ready=true;});
