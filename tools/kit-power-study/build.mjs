import {build} from 'esbuild';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const out='out/space-polish-review/kit-study';mkdirSync(out,{recursive:true});
const client=`import {Vault} from './src/vault.js';import {artLoaded,text,rrect,drawBall} from './src/gfx.js';
const option=new URLSearchParams(location.search).get('option'),D=[{width:393,height:852,top:59,bottom:34},{width:412,height:915,top:32,bottom:24}];
document.querySelector('h1').textContent=option==='A'?'A · Royal armoury':'B · Quick volley';document.querySelector('header p').textContent=option==='A'?'Four large choices in a two-row sheet. Recommended for readable labels and generous touch targets.':'Four choices in one compact row. More of the board stays visible while choosing.';
await document.fonts.ready;await artLoaded();
for(let i=0;i<2;i++){const d=D[i],cv=document.querySelectorAll('canvas')[i];cv.width=d.width;cv.height=d.height;const g=cv.getContext('2d'),s=d.width/360,H=Math.round(d.height/s-d.top/s-d.bottom/s)+34,l=new Vault(360,H,s,'easy');l.phase='rescue';l.paddle.charge=1;l.entry.progress=1;l.kitMood='Focus';
g.fillStyle='#101321';g.fillRect(0,0,cv.width,cv.height);g.save();g.scale(s,s);g.translate(0,d.top/s-34);l.draw(g);g.fillStyle='rgba(8,9,20,.38)';g.fillRect(0,0,360,H);
const rows=option==='A'?2:1,cols=4/rows,w=Math.min(344/s,360-24/s),h=(44+rows*74+8)/s,x=12/s,y=l.kitAnchor().y-l.kitAnchor().r-h-8/s,gap=8/s,cw=(w-24/s-gap*(cols-1))/cols;
g.fillStyle='#302333';rrect(g,x,y,w,h,16/s);g.fill();g.strokeStyle='#96667c';g.lineWidth=1/s;g.stroke();text(g,'KIT’S ARMOURY',x+16/s,y+23/s,14/s,'#f2dbe5');text(g,'×',x+w-22/s,y+23/s,24/s,'#d9bccb','center');
for(const[j,id]of['shield','arrows','titan','five'].entries()){const xx=x+12/s+(j%cols)*(cw+gap),yy=y+44/s+Math.floor(j/cols)*74/s,cx=xx+cw/2,cy=yy+23/s;g.fillStyle='#493447';rrect(g,xx,yy,cw,66/s,10/s);g.fill();g.strokeStyle='#e3c6d1';g.fillStyle='#dba4ba';g.lineWidth=2/s;
if(id==='shield'){g.beginPath();g.moveTo(cx-10/s,cy-12/s);g.lineTo(cx+10/s,cy-12/s);g.lineTo(cx+9/s,cy+2/s);g.quadraticCurveTo(cx+7/s,cy+10/s,cx,cy+14/s);g.quadraticCurveTo(cx-7/s,cy+10/s,cx-9/s,cy+2/s);g.closePath();g.fill();g.stroke();}
else if(id==='arrows'){for(const dx of[-6,6]){g.beginPath();g.moveTo(cx+dx/s,cy+12/s);g.lineTo(cx+dx/s,cy-12/s);g.moveTo(cx+(dx-4)/s,cy-7/s);g.lineTo(cx+dx/s,cy-13/s);g.lineTo(cx+(dx+4)/s,cy-7/s);g.moveTo(cx+(dx-4)/s,cy+7/s);g.lineTo(cx+dx/s,cy+11/s);g.lineTo(cx+(dx+4)/s,cy+7/s);g.stroke();}}
else if(id==='titan')drawBall(g,{x:cx,y:cy,vx:0,vy:0,r:10/s,titan:1});else for(const[dx,dy]of[[0,-9],[-10,0],[10,0],[-6,11],[6,11]]){g.beginPath();g.arc(cx+dx/s,cy+dy/s,4/s,0,7);g.fill();}
text(g,{shield:'BRICK WARD',arrows:'ARROWS',titan:'COSMIC',five:'BALL FAN'}[id],cx,yy+53/s,(cols===4?10:12)/s,'#fff1f5','center');}
g.restore();}window.__kitStudyReady=true;`;
const bundle=await build({stdin:{contents:client,resolveDir:resolve('.'),sourcefile:'kit-study.js'},bundle:true,write:false,format:'esm',target:'es2022'});
const fonts=[['Lilita One','LilitaOne-Regular.ttf'],['Rubik','Rubik.ttf']].map(([f,p])=>`@font-face{font-family:'${f}';src:url(data:font/ttf;base64,${readFileSync('out/brum-proof/'+p).toString('base64')})}`).join('');
const html=`<!doctype html><html><meta charset='utf-8'><style>${fonts}*{box-sizing:border-box}body{margin:0;background:#101321;color:#f3e5ed;font:16px Rubik,sans-serif}main{width:1000px;padding:28px 32px}header small{color:#b9b2c7}h1{font:36px 'Lilita One';margin:12px 0}p{line-height:1.5;color:#c6bcd0}.phones{display:flex;gap:40px}h2{font:21px 'Lilita One'}canvas{display:block}footer{margin-top:20px;font-size:13px;color:#b9afc5;line-height:1.5}</style><main><header><small>BREACH · ACTUAL ASSETS · UI PROPOSAL, NOT LIVE GAMEPLAY</small><h1></h1><p></p></header><section class='phones'><article><h2>iPhone</h2><canvas></canvas></article><article><h2>Android</h2><canvas></canvas></article></section><footer>The face stays visible. The existing cosmic ball artwork is reused. Brick Ward counters venom; Arrows adds ranged support; Cosmic pierces breakable bricks; Ball Fan adds ordinary balls. Both choices pause play while selecting. Repeated positive pickups add power or time.</footer></main><script type='module'>${bundle.outputFiles[0].text.replace(/<\/script/g,'<\\/script')}</script></html>`;
writeFileSync(out+'/study.html',html);
const{chromium}=await import(process.env.PW_MODULE);const browser=await chromium.launch({executablePath:process.env.PW_CHROMIUM});
try{for(const option of['A','B']){const page=await browser.newPage({viewport:{width:1000,height:1170},deviceScaleFactor:1}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(resolve(out+'/study.html')).href+'?option='+option);await page.waitForFunction(()=>window.__kitStudyReady);assert.deepEqual(errors,[]);await page.screenshot({path:'design/phase1/img/kit-powers-study-'+option.toLowerCase()+'.png',fullPage:true});await page.close();}}finally{await browser.close();}
console.log('Kit power menu studies saved.');
