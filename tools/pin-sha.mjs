// Re-pin config/mobile-preview.json to the current dist/breach.html, hashed exactly as tools/prepare-android.mjs does.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const html = readFileSync('dist/breach.html', 'utf8').replace(/\r\n/g, '\n');
const sha = createHash('sha256').update(html).digest('hex');
const path = 'config/mobile-preview.json', text = readFileSync(path, 'utf8'), old = JSON.parse(text).reviewedCanonicalSha256;
writeFileSync(path, text.replace(old, sha));
console.log(old === sha ? `unchanged ${sha}` : `${old} -> ${sha}`);
