// Isolated playable review; the active game and Android checkpoint are untouched.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { build } from 'esbuild';
import { createHash } from 'node:crypto';

const out = process.argv[2] || 'out/relay-next';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const before = sha(readFileSync('dist/breach.html'));
const m = JSON.parse(readFileSync('design/phase1/space-assets-ab.json', 'utf8'));
const info = JSON.parse(readFileSync('tools/relay-preview/art-info.json', 'utf8').replace(/^\uFEFF/, ''));
const runtime = process.argv[3] ? JSON.parse(readFileSync(process.argv[3], 'utf8')) : null;
const parts = {};
for (const [id, measured] of Object.entries(info)) {
  const p = m.parts[id], png = readFileSync(p.path);
  const packed = runtime?.parts.find(p => p.id === id);
  if (runtime) { assert(packed, `Missing runtime part ${id}`); assert.equal(packed.sourceSHA256, sha(png), `${id}: source changed`); }
  const bytes = packed ? readFileSync(packed.path) : png;
  if (packed) assert.equal(packed.runtimeSHA256, sha(bytes), `${id}: runtime pixels changed`);
  parts[id] = { ...p, ...measured, url: `data:image/${packed ? 'webp' : 'png'};base64,` + bytes.toString('base64') };
  assert(measured.artBounds.every(Number.isFinite));
}
assert.equal(m.assemblies.B.pods.length, 4); assert.equal(m.assemblies.B.iris.segments, 6);
const data = { parts, assembly: m.assemblies.B, motion: m.motion, payloads: m.draftIntegration.payloads.B };
const result = await build({ entryPoints: ['tools/relay-preview/client.js'], bundle: true, minify: true, format: 'iife', write: false, define: { RELAY_DATA: JSON.stringify(data) } });
const lilita = readFileSync('out/brum-proof/LilitaOne-Regular.ttf').toString('base64');
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>BREACH — Relay Raiders playable review</title><style>@font-face{font-family:'Lilita One';src:url(data:font/ttf;base64,${lilita}) format('truetype');font-display:block}html,body{margin:0;background:#070913;overflow:hidden;touch-action:none;user-select:none}canvas{display:block}</style><canvas aria-label="Relay Raiders playable brick breaker"></canvas><script>${result.outputFiles[0].text}</script></html>`;
mkdirSync(out, { recursive: true }); writeFileSync(`${out}/relay.html`, html);
assert.equal(sha(readFileSync('dist/breach.html')), before, 'frozen bundle changed');
writeFileSync(`${out}/build-report.json`, JSON.stringify({ scope: 'Isolated Relay prototype, not an APK or admitted production bundle', activeGameSha256: before, previewSha256: sha(html), encodedBytes: Buffer.byteLength(html), uniqueParts: Object.keys(parts).length, runtimePackSHA256: runtime ? sha(readFileSync(process.argv[3])) : null, sourceParts: Object.fromEntries(Object.entries(parts).map(([id,p]) => [id,{path:p.path,sha256:sha(readFileSync(p.path))}])) }, null, 2));
console.log(`Relay review: ${out}/relay.html; active bundle unchanged.`);
