// Actual C source artwork with diagnostic geometry overlays; no runtime or asset mutation.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const out = resolve('out/orbital-aperture-audit'), hash = p => createHash('sha256').update(readFileSync(p)).digest('hex');
const report = JSON.parse(readFileSync(`${out}/report.json`, 'utf8'));
const data = { report, image: `data:image/png;base64,${readFileSync('out/orbital-art-proof/source-open.png').toString('base64')}` };
const font = readFileSync('out/brum-proof/LilitaOne-Regular.ttf').toString('base64');
function renderer() {
  const { report: R, image } = JSON.parse(document.querySelector('#data').textContent), cv = document.querySelector('canvas'), g = cv.getContext('2d');
  const query = new URLSearchParams(location.search), D = query.get('device') === 'android' ? { w: 412, h: 915, t: 32, b: 24 } : { w: 393, h: 852, t: 59, b: 34 };
  const W = 360, FH = Math.round(360 * D.h / D.w), s = Math.min(D.w / W, D.h / FH), top = D.t / s - 34, H = Math.round(FH - (D.t + D.b) / s) + 34;
  const im = new Image();
  const label = (str, x, y, size = 12, color = '#c6d3df', align = 'center') => { g.font = `${size}px "Lilita One"`; g.fillStyle = color; g.textAlign = align; g.textBaseline = 'middle'; g.fillText(str, x, y); };
  const circle = (p, r, color) => { g.strokeStyle = color; g.lineWidth = 1; g.beginPath(); g.arc(p.x, p.y, r, 0, Math.PI * 2); g.stroke(); };
  function overlays(radius) {
    const a = R.apertureWorld, old = R.legacyGreyboxBay, probe = R.ballProbes.find(p => p.ballRadius === radius);
    g.strokeStyle = '#dfae78'; g.lineWidth = 1; g.setLineDash([3, 3]); g.strokeRect(old.x, old.y, old.w, old.h); g.setLineDash([]);
    g.strokeStyle = '#7fe2d6'; g.strokeRect(a.x, a.y, a.w, a.h);
    circle(R.legacyCore, R.legacyCore.r, '#ee96d0');
    circle(probe.firstVerticalHullContactFromBelow, radius, '#ff9b91');
    g.strokeStyle = '#ff9b91'; g.beginPath(); g.moveTo(181, 267); g.lineTo(181, probe.firstVerticalHullContactFromBelow.y + radius + 2); g.stroke();
    label(`r${radius} contacts the opaque lip first`, 180, 284, 12, '#ffb2aa');
  }
  function draw(radius = 7.5) {
    cv.width = D.w * 2; cv.height = D.h * 2; g.setTransform(2 * s, 0, 0, 2 * s, 0, 2 * s * top);
    g.fillStyle = '#060a13'; g.fillRect(0, -top, W, D.h / s);
    label('C MACHINERY · GEOMETRY AUDIT', 180, 42, 16);
    g.drawImage(im, 0, R.hullWorldTop, 360, 360 * im.height / im.width); overlays(radius);
    label('Green: actual 79.70 × 29.64u aperture', 180, 310, 12, '#7fe2d6');
    label('Dashed: old 109 × 45u open-bottom blockout', 180, 329, 11, '#dfae78');
    label('Pink: old required reactor (181, 184, r14)', 180, 348, 11, '#ee96d0');
    const a = R.apertureWorld, k = 2.5, x = 180 - a.w * k / 2, y = 382;
    g.drawImage(im, a.x / R.scaleWorldPerSourcePixel - 25, (a.y - R.hullWorldTop) / R.scaleWorldPerSourcePixel - 25,
      a.w / R.scaleWorldPerSourcePixel + 50, a.h / R.scaleWorldPerSourcePixel + 50,
      x - 25 * R.scaleWorldPerSourcePixel * k, y - 25 * R.scaleWorldPerSourcePixel * k,
      (a.w + 50 * R.scaleWorldPerSourcePixel) * k, (a.h + 50 * R.scaleWorldPerSourcePixel) * k);
    g.save(); g.translate(x, y); g.scale(k, k); circle({ x: a.w / 2, y: a.h / 2 }, radius, '#7fe2d6'); g.restore();
    label(`r${radius} fits if already inside`, 180, 490, 13, '#7fe2d6');
    label('NO EXTERNAL PATH THROUGH INTACT LIP', 180, 516, 13, '#ffb2aa');
    label('Measured 4/8-neighbour alpha topology stays enclosed', 180, 542, 10);
    label('Thresholds 16, 64, 128, 192, 250 · no exterior connection', 180, 558, 10);
    label('Needs a visible reactor-access state before integration', 180, 590, 11, '#e1b7d5');
    label('Historical greybox remains unchanged', 180, 610, 11);
    label('AUDIT ONLY · OTHER C ASSETS STILL PENDING', 180, H - 20, 10, '#8395a9');
  }
  function source(radius = 7.5) {
    cv.width = 1992; cv.height = 1300; const k = 1992 / 360; g.setTransform(k, 0, 0, k, 0, -R.hullWorldTop * k + 40);
    g.fillStyle = '#060a13'; g.fillRect(0, R.hullWorldTop - 40 / k, 360, 1300 / k);
    g.drawImage(im, 0, R.hullWorldTop, 360, 360 * im.height / im.width); overlays(radius);
  }
  im.onload = async () => { await document.fonts.load('16px "Lilita One"'); window.OA = { draw, source }; draw(); };
  im.src = image;
}
const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>C aperture geometry audit</title><style>@font-face{font-family:'Lilita One';src:url(data:font/ttf;base64,${font})}html,body{margin:0;background:#060a13}canvas{width:100vw;height:100vh;display:block}</style><canvas></canvas><script id="data" type="application/json">${JSON.stringify(data)}</script><script>(${renderer.toString()})()</script>`;
writeFileSync(`${out}/aperture.html`, html);
const { chromium } = await import(process.env.PW_MODULE || 'playwright');
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM });
const visual = { htmlSHA256: hash(`${out}/aperture.html`), reportSHA256: hash(`${out}/report.json`), devices: {} };
try {
  for (const [name, D] of Object.entries({ ios: { width: 393, height: 852 }, android: { width: 412, height: 915 } })) {
    const page = await browser.newPage({ viewport: D, deviceScaleFactor: 1 }), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(`${pathToFileURL(`${out}/aperture.html`).href}?device=${name}`); await page.waitForFunction(() => window.OA);
    for (const radius of [7.5, 10]) { await page.evaluate(r => OA.draw(r), radius); await page.screenshot({ path: `${out}/${name}-radius${radius}.png` }); }
    if (name === 'ios') {
      await page.evaluate(() => OA.source(7.5)); const uri = await page.evaluate(() => document.querySelector('canvas').toDataURL('image/png'));
      writeFileSync(`${out}/source-normal.png`, Buffer.from(uri.split(',')[1], 'base64'));
    }
    assert.deepEqual(errors, []); visual.devices[name] = { viewport: D, errors }; await page.close();
  }
} finally { await browser.close(); }
assert.equal(hash('src/orbital.js'), report.inputs['src/orbital.js']);
writeFileSync(`${out}/visual-report.json`, JSON.stringify(visual, null, 2));
writeFileSync(`${out}/README.md`, `# C aperture geometry audit\n\nActual C hull/bay/shutter source, without gameplay or asset edits.\n\nThe aperture is 79.6988 × 29.6386u at x140.241, y173.771; its midpoint can contain ordinary 7.5r and TITAN 10r balls. It is an enclosed internal alpha hole at all five tested thresholds and both 4/8-neighbour connectivity. Neither ball can reach it from the exterior while the opaque lower lip stays solid. The old open-bottom 109 × 45u notch is not a valid final-art route.\n\nVertical incoming centres contact the hull at roughly y221.1 (normal) / 223.6 (TITAN), before reaching the old reactor at roughly 205.5 / 208.0. Contact uncertainty is ±0.181u (source-pixel occupancy). The old r14 reactor also overlaps 1517 opaque source pixels at its current placement.\n\nA visible exposed/retracted lower lip or visibly projected target is needed before the core contract can be admitted. No silent collider hole, geometry rescale or new reactor rule was applied. Missing C barrels/muzzles also need their actual anchors/contours.\n\nEarlier greybox wins/tests remain historical and do not certify the delivered lip. Final C art, ordinary/TITAN route, full no-power completion, phone balance and APK checks remain pending.\n\nReproduce:\n\n\`\`\`text\npython tools/orbital-preview/aperture-audit.py\nnode tools/orbital-preview/aperture-proof.mjs\n\`\`\`\n\nUse the configured Python/Pillow/numpy and existing PW_MODULE/PW_CHROMIUM environment. See report.json for input hashes and measurements, visual-report.json for screenshot/build identity.\n`);
console.log(JSON.stringify(visual, null, 2));
