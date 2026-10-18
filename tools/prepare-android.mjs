// Package the frozen review milestone; do not accidentally ship ongoing art experiments.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync('dist/breach.html', 'utf8').replace(/\r\n/g, '\n');
const sha256 = s => createHash('sha256').update(s).digest('hex');
const reviewedHash = '88d7c7f6b6703354d9ed08145bc21b6771b41b4a460281f2a212818fe2c1768c';
assert.equal(sha256(html), reviewedHash, 'source differs from the approved pre-Brum preview');
const fonts = `<style>
@font-face { font-family: 'Lilita One'; font-style: normal; font-weight: 400; src: url('fonts/LilitaOne-Regular.ttf') format('truetype'); }
@font-face { font-family: 'Rubik'; font-style: normal; font-weight: 300 900; src: url('fonts/Rubik.ttf') format('truetype'); }
</style>`;
const packaged = html.replace(/<link[^>]*https:\/\/fonts\.(?:googleapis|gstatic)\.com[^>]*>\n?/g, '').replace('</head>', `${fonts}\n</head>`);
assert.ok(!/<(?:script|link)[^>]+(?:src|href)=["']https?:/i.test(packaged), 'APK must work offline');
const out = 'android/app/src/main/assets';
mkdirSync(`${out}/fonts`, { recursive: true });
for (const name of ['LilitaOne-Regular.ttf', 'Rubik.ttf', 'LilitaOne-OFL.txt', 'Rubik-OFL.txt']) copyFileSync(`assets/fonts/${name}`, `${out}/fonts/${name}`);
writeFileSync(`${out}/breach.html`, packaged);
const manifest = { milestone: 'pre-Brum mobile review', reviewedCanonicalSha256: reviewedHash, packagedSha256: sha256(packaged), packagingChanges: ['bundle OFL fonts for offline use'], ongoingRevisionsIncluded: false };
writeFileSync(`${out}/preview.json`, JSON.stringify(manifest, null, 2) + '\n');
writeFileSync('dist/mobile-preview.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest, null, 2));
