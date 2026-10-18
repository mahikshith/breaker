// Static proposal boards use the approved Carrier renderer; no live game is changed.
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const out = 'out/carrier-urgency-options';
const sha = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const frozen = Object.fromEntries(['src/carrier.js', 'src/arena.js', 'src/vault-art.js', 'dist/breach.html'].map(p => [p, sha(p)]));
const manifest = JSON.parse(readFileSync('design/phase1/space-assets-ab.json', 'utf8'));
const sources = Object.fromEntries(Object.values(manifest.parts).filter(p => p.path.startsWith('assets/space-a/')).map(p => [p.path, sha(p.path)]));
const bundle = await build({ entryPoints: ['tools/carrier-urgency-preview/client.js'], bundle: true, minify: true, format: 'iife', write: false });
const font = file => readFileSync(`out/brum-proof/${file}`).toString('base64');
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Carrier urgency — concept proposals</title><style>@font-face{font-family:'Lilita One';src:url(data:font/ttf;base64,${font('LilitaOne-Regular.ttf')})} @font-face{font-family:Rubik;src:url(data:font/ttf;base64,${font('Rubik.ttf')})}*{box-sizing:border-box}body{margin:0;background:#090e19;color:#e9edf7;font:15px Rubik,Arial,sans-serif}main{width:1320px;padding:32px 38px}.eyebrow{color:#96a9bf;font-size:12px;letter-spacing:2px}header{margin-bottom:22px}h1{font:42px 'Lilita One';margin:9px 0;color:#eef4ff}header p{max-width:1140px;margin:0;color:#b9c7da;line-height:1.5}.states{display:grid;grid-template-columns:repeat(3,393px);gap:32px}.state h2{font:21px 'Lilita One';margin:0 0 6px}.state .beat{font-size:13px;color:#90a7be;margin:0 0 10px;min-height:19px}.state canvas{display:block;width:393px;height:852px;outline:1px solid #28344a}.state .caption{font-size:14px;line-height:1.45;color:#bfcbd9;min-height:65px;margin:12px 0 0}.roles{border-top:1px solid #2a3448;padding-top:16px;margin-top:8px;display:grid;grid-template-columns:1fr 1fr;gap:30px}.roles strong{font:20px 'Lilita One';color:#91e6ed}.roles p{font-size:14px;line-height:1.5;margin:5px 0 0;color:#c0ccdc}footer{font-size:12px;color:#879bb2;margin-top:18px;letter-spacing:.2px}</style><main></main><script>${bundle.outputFiles[0].text}</script></html>`;
mkdirSync(out, { recursive: true }); writeFileSync(`${out}/boards.html`, html);
const report = { scope: 'Two static concept proposals, not implemented gameplay or finished companion animation', sourceSpec: 'design/phase1/carrier-urgency.md', sourceSpecSHA256: sha('design/phase1/carrier-urgency.md'), frozen, sourcePNGs: sources, htmlSHA256: sha(`${out}/boards.html`), boards: {} };
if (process.argv.includes('--capture')) {
  const { chromium } = await import(process.env.PW_MODULE || 'playwright');
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM });
  try {
    for (const option of ['A', 'B']) {
      const page = await browser.newPage({ viewport: { width: 1320, height: 1280 }, deviceScaleFactor: 1 }), errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.goto(pathToFileURL(resolve(`${out}/boards.html`)).href + `?option=${option}`);
      await page.waitForFunction(() => window.__urgencyBoards?.ready, null, { polling: 50 });
      const inspection = await page.evaluate(() => window.__urgencyBoards.inspect());
      assert.equal(inspection.scenes, 3); assert.equal(inspection.width, 393); assert.equal(inspection.height, 852);
      assert(inspection.conceptOnly && inspection.noCompanionSprites && inspection.allImagesDecoded);
      assert.deepEqual(errors, []);
      await page.screenshot({ path: `${out}/option-${option.toLowerCase()}.png`, fullPage: true });
      report.boards[option] = { ...inspection, errors, pngSHA256: sha(`${out}/option-${option.toLowerCase()}.png`) };
      await page.close();
    }
  } finally { await browser.close(); }
}
for (const [path, hash] of Object.entries({ ...frozen, ...sources })) assert.equal(sha(path), hash, `Source changed: ${path}`);
writeFileSync(`${out}/proposal-report.json`, JSON.stringify(report, null, 2));
console.log(`${out}/boards.html — static concepts only; Carrier sources unchanged.`);
