import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const out = 'out/carrier-difficulty-options', sha = p => createHash('sha256').update(readFileSync(p)).digest('hex');
const frozen = Object.fromEntries(['src/carrier.js', 'src/arena.js', 'src/vault.js', 'src/main.js', 'src/vault-art.js', 'dist/breach.html'].map(p => [p, sha(p)]));
const code = await build({ entryPoints: ['tools/carrier-difficulty-preview/client.js'], bundle: true, minify: true, write: false });
const font = p => readFileSync(`out/brum-proof/${p}`).toString('base64');
const html = `<!doctype html><html><meta charset="utf-8"><title>Carrier difficulty and progression studies</title><style>@font-face{font-family:'Lilita One';src:url(data:font/ttf;base64,${font('LilitaOne-Regular.ttf')})}@font-face{font-family:Rubik;src:url(data:font/ttf;base64,${font('Rubik.ttf')})}*{box-sizing:border-box}body{margin:0;background:#0b0d19;color:#ecedf6;font:15px Rubik,Arial}main{width:1320px;padding:28px 38px}.eyebrow{font-size:12px;letter-spacing:2px;color:#aab1c6}h1{font:42px 'Lilita One';margin:8px 0}header p{color:#c8cad8;line-height:1.5;margin:0}.modes{display:flex;gap:12px;margin:18px 0 22px}.modes span{padding:10px 13px;border:1px solid #465067;border-radius:8px;font-size:13px}.modes .chosen{border-color:#bb8eb6;color:#edbedd;background:#251e32}.states{display:grid;grid-template-columns:repeat(3,393px);gap:32px}h2{font:21px 'Lilita One';margin:0 0 5px}.beat{font-size:13px;color:#b0b9cd;margin:0 0 10px}canvas{display:block;width:393px;height:852px;outline:1px solid #373948}.caption{font-size:14px;line-height:1.5;color:#c8cad8;min-height:70px;margin:10px 0}.notes{display:grid;grid-template-columns:1fr 1fr;gap:30px;border-top:1px solid #3b3c50}.notes p{line-height:1.5;font-size:14px;color:#c7ccdb}.notes strong{display:block;font:19px 'Lilita One';color:#eab6da}footer{font-size:12px;line-height:1.5;color:#a2aabd}</style><main></main><script>${code.outputFiles[0].text}</script></html>`;
mkdirSync(out, { recursive: true }); writeFileSync(`${out}/boards.html`, html);
const { chromium } = await import(process.env.PW_MODULE);
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM });
const report = { scope: 'Two static actual-asset progression proposals. No production gameplay change.', frozen, boards: {} };
try {
  for (const option of ['A', 'B']) {
    const page = await browser.newPage({ viewport: { width: 1320, height: 1320 }, deviceScaleFactor: 1 }), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(`${pathToFileURL(resolve(`${out}/boards.html`)).href}?option=${option}`);
    await page.waitForFunction(() => window.__difficultyBoards?.ready, null, { polling: 50 });
    const state = await page.evaluate(() => window.__difficultyBoards);
    assert(state.decoded && state.conceptOnly); assert.equal(state.scenes.length, 3);
    assert(state.scenes[0].facing > 1 && state.scenes[0].facing < 4, 'Nose must turn toward the captive above');
    assert.equal(state.scenes[1].escaped, option === 'A'); assert.equal(state.scenes[1].rebuilding, option === 'B');
    assert.deepEqual(errors, []);
    await page.screenshot({ path: `${out}/option-${option.toLowerCase()}.png`, fullPage: true });
    report.boards[option] = { ...state, errors, pngSHA256: sha(`${out}/option-${option.toLowerCase()}.png`) };
    await page.close();
  }
} finally { await browser.close(); }
for (const [p, h] of Object.entries(frozen)) assert.equal(sha(p), h, `Live source changed: ${p}`);
writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 2));
console.log('Both proposal boards captured; live gameplay unchanged.');
