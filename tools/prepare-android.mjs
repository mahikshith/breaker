// Package only the exact tested bundle recorded in the release manifest.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync('dist/breach.html', 'utf8').replace(/\r\n/g, '\n');
const sha256 = s => createHash('sha256').update(s).digest('hex');
const release = JSON.parse(readFileSync('config/mobile-preview.json', 'utf8'));
const reviewedHash = release.reviewedCanonicalSha256;
assert.equal(sha256(html), reviewedHash, 'source differs from the tested space combat checkpoint');
let packaged = html;
for (const name of ['LilitaOne-Regular.ttf', 'Rubik.ttf']) {
  const embedded = `data:font/ttf;base64,${readFileSync(`assets/fonts/${name}`).toString('base64')}`;
  assert.equal(packaged.split(embedded).length, 2, `expected one embedded ${name}`);
  packaged = packaged.replace(embedded, `fonts/${name}`);
}
assert.ok(!/<(?:script|link)[^>]+(?:src|href)=["']https?:/i.test(packaged), 'APK must work offline');
const out = 'android/app/src/main/assets';
mkdirSync(`${out}/fonts`, { recursive: true });
for (const name of ['LilitaOne-Regular.ttf', 'Rubik.ttf', 'LilitaOne-OFL.txt', 'Rubik-OFL.txt']) copyFileSync(`assets/fonts/${name}`, `${out}/fonts/${name}`);
writeFileSync(`${out}/breach.html`, packaged);
const manifest = { ...release, packagedSha256: sha256(packaged), packagingChanges: ['store embedded OFL fonts as identical local files'] };
writeFileSync(`${out}/preview.json`, JSON.stringify(manifest, null, 2) + '\n');
writeFileSync('dist/mobile-preview.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest, null, 2));
