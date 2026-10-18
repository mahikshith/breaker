// Package the frozen review milestone; do not accidentally ship ongoing art experiments.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync('dist/breach.html', 'utf8').replace(/\r\n/g, '\n');
const sha256 = s => createHash('sha256').update(s).digest('hex');
const reviewedHash = '2ab4ee63e929373359d90f3cef5a9e9fbdea679592c98b01fc9de673404d0e04';
assert.equal(sha256(html), reviewedHash, 'source differs from the tested Carrier checkpoint');
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
const manifest = { milestone: 'Carrier Breakout playable mobile preview', reviewedCanonicalSha256: reviewedHash, reviewedWindowsSha256: 'f4863dc5a87d6b46a8a1afdb702c264f432196b851b61b828946db8ab75a0423', packagedSha256: sha256(packaged), packagingChanges: ['bundle OFL fonts for offline use'], includedRevisions: ['Carrier A machinery and five-crew rescue', 'actual sprite-aligned substepped collision, cover and powers', 'continuous full-screen space and low125u paddle', 'Vault-only face control and selected cast/capture A', 'native immersive cutout/gesture handling'], excludedWork: ['Nix/Tick expressive sprite families', 'Brum and Relay Raiders encounters', 'Orbital Breakout and Eclipse Rescue'] };
writeFileSync(`${out}/preview.json`, JSON.stringify(manifest, null, 2) + '\n');
writeFileSync('dist/mobile-preview.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest, null, 2));
