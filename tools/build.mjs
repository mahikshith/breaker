// Bundle the game into self-contained HTML: dist/breach.html (standalone page) and
// dist/breach-artifact.html (body fragment for hosts that supply their own <head> and safe-area padding).
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const out = await build({ entryPoints: ['src/main.js'], bundle: true, minify: true, format: 'iife', write: false, target: 'es2022' });
const js = out.outputFiles[0].text.replace(/<\/script/g, '<\\/script');
const html = readFileSync('index.html', 'utf8').replace(/<script type="module"[^>]*><\/script>/, () => `<script>${js}</script>`);
mkdirSync('dist', { recursive: true });
writeFileSync('dist/breach.html', html);
const head = html.match(/<head>([\s\S]*?)<\/head>/)[1].replace(/<meta charset[^>]*>|<meta name="viewport"[^>]*>/g, '');
const body = html.match(/<body>([\s\S]*?)<\/body>/)[1].replace(/<div id="safe"[^>]*><\/div>/, '');
writeFileSync('dist/breach-artifact.html', head.trim() + '\n' + body.trim() + '\n');
console.log(`dist/breach.html ${(html.length / 1024).toFixed(1)} KB`);
