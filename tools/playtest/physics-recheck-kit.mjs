// Reuse the maintained Kit suite; timer polling cannot overwrite its intercepted animation callback.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const out=resolve(process.argv[3]||'out/physics-recheck-other/vault-final');mkdirSync(out,{recursive:true});
const source=readFileSync('tools/kit-power-study/playtest.mjs','utf8');
const old='await page.waitForFunction(()=>window.__breach&&window.__kitFrame);';assert(source.includes(old));
const adapted=source.replace(old,'await page.waitForFunction(()=>window.__breach&&window.__kitFrame,null,{polling:50});').replace("'../../src/vault-art.js'",JSON.stringify(pathToFileURL(resolve('src/vault-art.js')).href));
const path=out+'/maintained-kit-timer-adapter.mjs';writeFileSync(path,adapted);await import(pathToFileURL(path).href);
