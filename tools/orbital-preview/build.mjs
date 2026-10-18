import { build } from 'esbuild';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
const out=resolve(process.argv[2]||'out/space-polish-review/forge');
if(['out/orbital-forge','out/space-power-review/forge'].some(p=>out===resolve(p)))throw Error('The4185/4186 Forge checkpoints are frozen; build a separate candidate');
mkdirSync(out,{recursive:true});
const manifest=JSON.parse(readFileSync('assets/orbital-forge/manifest.json','utf8'));
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const runtimePath='out/orbital-forge/runtime/report.json',runtime=existsSync(runtimePath)?JSON.parse(readFileSync(runtimePath,'utf8')):null;
if(runtime&&runtime.manifestSHA256!==sha('assets/orbital-forge/manifest.json'))throw Error('Stale Forge runtime manifest');
for(const[id,p]of Object.entries(manifest.parts)){
 const r=runtime?.parts.find(r=>r.id===id),path=r?.path||p.path;
 if(r&&(sha(p.path)!==r.sourceSHA256||sha(path)!==r.runtimeSHA256))throw Error('Stale Forge runtime part '+id);
 p.url='data:image/'+(r?'webp':'png')+';base64,'+readFileSync(path).toString('base64');
}
let main=readFileSync('src/main.js','utf8');

main=main.replace(/const LEVELS = \[[\s\S]*?\n\];/,`const LEVELS = [{ make: (W,H,s) => new Orbital(W,H,s,selectedDifficulty), name:'Shutter Forge', sub:'Break the stabilisers. Shut down the forge.', color:'#e58fcb' }];`);
main=main.replace(/    \/\/ a character peeks out on each card[\s\S]*?else drawPrincessIcon\([^\n]*\n/,'');
main=main.replace("(levelIdx === 1 ? 'PRINCESS SAVED!' : 'CREW SAVED!')","'FORGE SHUT DOWN!'");
const result=await build({stdin:{contents:main,resolveDir:resolve('src'),sourcefile:'forge-main.js'},bundle:true,write:false,format:'iife',platform:'browser',target:'es2022',minify:true,define:{FORGE_DATA:JSON.stringify(manifest)}});
let html=readFileSync('index.html','utf8').replace(/<link[^>]*>/g,'').replace('<title>BREACH</title>','<title>BREACH — Shutter Forge isolated playtest</title>');
const fonts=[['Lilita One','out/brum-proof/LilitaOne-Regular.ttf'],['Rubik','out/brum-proof/Rubik.ttf']].map(([family,path])=>`@font-face{font-family:'${family}';src:url(data:font/ttf;base64,${readFileSync(path).toString('base64')})}`).join('');
html=html.replace('<style>','<style>'+fonts).replace(/<script type="module"[^>]*><\/script>/,()=>`<script>${result.outputFiles[0].text.replace(/<\/script/g,'<\\/script')}</script>`);
writeFileSync(`${out}/forge.html`,html);
writeFileSync(`${out}/build.json`,JSON.stringify({html:sha(`${out}/forge.html`),source:sha('src/orbital.js'),main:sha('src/main.js'),arena:sha('src/arena.js'),gfx:sha('src/gfx.js'),difficulty:sha('src/difficulty.js'),spaceCompanions:sha('src/space-companions.js'),spaceWeapons:sha('src/space-weapons.js'),manifest:sha('assets/orbital-forge/manifest.json'),production:sha('dist/breach.html'),bytes:Buffer.byteLength(html)},null,2));
console.log(`${out}/forge.html`);
