import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {relative,resolve} from 'node:path';
import {build} from 'esbuild';
import {circuitData} from './data.mjs';
const OUT=process.argv[2]||'out/space-polish-review/circuit';mkdirSync(OUT,{recursive:true});
const src=relative(resolve(OUT),resolve('src')).replaceAll('\\','/');
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex'),before=sha('dist/breach.html');
let main=readFileSync('src/main.js','utf8');

const a=main.indexOf('const LEVELS = ['),b=main.indexOf('\n];',a);
main=main.slice(0,a)+"const LEVELS = [{make:(W,H,s)=>new Relay(W,H,s,selectedDifficulty,CIRCUIT_DATA),name:'Circuit Breakout',sub:'Break through. Bring down the mothership.',color:'#bda1ea'}]"+main.slice(b+3);
const peek=main.indexOf('    // a character peeks out on each card');if(peek>=0){const end=main.indexOf('\n  });',peek);main=main.slice(0,peek)+main.slice(end);}
main=main.replaceAll('CREW SAVED!','MOTHERSHIP DOWN!').replaceAll("from './",`from '${src}/`);
main=main.replace("scene === 'menu' && (e.key === '1' || e.key === '2')","scene === 'menu' && e.key === '1'");
main=`import {stepBall as circuitStepBall} from '${src}/physics.js';\nimport {spacePowerLayout as circuitPowerLayout} from '${src}/space-companions.js';\nwindow.__circuitStepBall=circuitStepBall;window.__circuitPowerLayout=circuitPowerLayout;\n`+main+"\nwindow.__circuitDraw=draw;\n";
writeFileSync(`${OUT}/main-preview.js`,main);
const bundle=await build({entryPoints:[`${OUT}/main-preview.js`],bundle:true,minify:true,format:'iife',write:false,define:{CIRCUIT_DATA:JSON.stringify(circuitData(true))}});
const base=readFileSync('dist/breach.html','utf8'),at=base.lastIndexOf('<script>'),end=base.lastIndexOf('</script>');
if(at<0||end<0)throw Error('Production shell missing inline script');
const html=base.slice(0,at+8)+bundle.outputFiles[0].text+base.slice(end);
writeFileSync(`${OUT}/circuit.html`,html);if(sha('dist/breach.html')!==before)throw Error('Production changed');
const report={scope:'Isolated selected Circuit, actual Main copy with one preview card; production/APK unchanged',htmlSHA256:sha(`${OUT}/circuit.html`),productionSHA256:before,mainSHA256:sha('src/main.js'),relaySHA256:sha('src/relay.js'),arenaSHA256:sha('src/arena.js'),gfxSHA256:sha('src/gfx.js'),spaceCompanionsSHA256:sha('src/space-companions.js'),spaceWeaponsSHA256:sha('src/space-weapons.js'),assetManifestSHA256:sha('assets/relay-circuit/manifest.json'),bytes:Buffer.byteLength(html)};
writeFileSync(`${OUT}/build.json`,JSON.stringify(report,null,2));console.log(report);
