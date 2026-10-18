import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
export function circuitData(embed=false){
  const m=JSON.parse(readFileSync('design/phase1/space-assets-ab.json','utf8'));
  const info=JSON.parse(readFileSync('tools/relay-preview/art-info.json','utf8').replace(/^\uFEFF/,''));
  const extra=JSON.parse(readFileSync('assets/relay-circuit/manifest.json','utf8'));
  const runtime=embed&&existsSync('out/relay-optimized/runtime-pack.json')?JSON.parse(readFileSync('out/relay-optimized/runtime-pack.json','utf8')):null;
  const extraRuntime=embed&&existsSync('out/relay-circuit/runtime-extra/report.json')?JSON.parse(readFileSync('out/relay-circuit/runtime-extra/report.json','utf8')):null;
  if(extraRuntime&&extraRuntime.manifestSHA256!==sha('assets/relay-circuit/manifest.json'))throw Error('Circuit runtime manifest is stale');
  const parts={};
  for(const[id,measured]of Object.entries(info)){if(id==='bWorker')continue;const p={...m.parts[id],...measured};const packed=runtime?.parts.find(v=>v.id===id);parts[id]={...p,url:embed?`data:image/${packed?'webp':'png'};base64,`+readFileSync(packed?.path||p.path).toString('base64'):p.path};}
  for(const[id,p]of Object.entries(extra.parts)){
    const packed=extraRuntime?.parts.find(v=>v.id===id);
    if(extraRuntime&&(!packed||sha(p.path)!==packed.sourceSHA256||sha(packed.path)!==packed.runtimeSHA256))throw Error(`Circuit runtime hash mismatch: ${id}`);
    parts[id]={...p,url:embed?`data:image/${packed?'webp':'png'};base64,`+readFileSync(packed?.path||p.path).toString('base64'):p.path};
  }
  return{parts,assembly:m.assemblies.B,motion:m.motion,payloads:m.draftIntegration.payloads.B};
}
