// Standalone asset assembly. It never imports, rewrites or packs active gameplay.
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const OUT = process.argv.find(a => a.startsWith('--out='))?.slice(6) || 'out/space-assets-ab';
const reportName = process.argv.includes('--check') ? 'manifest-check-report' : process.argv.includes('--capture') ? 'asset-report' : 'assembly-build-report';
const M = JSON.parse(readFileSync('design/phase1/space-assets-ab.json', 'utf8'));
const sha = b => createHash('sha256').update(b).digest('hex');
const gameHash = () => sha(readFileSync('dist/breach.html'));
const report = { activeGameSha256: gameHash(), scope: M.scope, parts: {}, captures: {}, missing: [] };
const images = {};
const fontPath = 'out/brum-proof/LilitaOne-Regular.ttf';
assert(existsSync(fontPath), `Local game font missing: ${fontPath}`);
const fontData = readFileSync(fontPath).toString('base64');
mkdirSync(OUT, { recursive: true });
for (const [id, p] of Object.entries(M.parts)) {
  assert(p.path.startsWith('assets/space-') && p.path.endsWith('.png'), `${id}: canonical PNG path`);
  assert(p.pivot.length === 2 && p.pivot.every(n => n >= 0 && n <= 1), `${id}: normalized pivot`);
  if (Array.isArray(p.display)) assert(p.display.length === 2 && p.display.every(n => n > 0));
  if (!existsSync(p.path)) { report.missing.push(p.path); continue; }
  const png = readFileSync(p.path);
  assert(png.length > 32 && png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), `${id}: PNG signature`);
  const width = png.readUInt32BE(16), height = png.readUInt32BE(20), mode = png[25];
  if (!id.endsWith('Background')) assert.equal(mode, 6, `${id}: real RGBA file required`);
  if (p.size) assert.deepEqual([width, height], p.size, `${id}: canonical dimensions`);
  const chunks = [];
  for (let i = 8; i + 12 <= png.length;) { const length = png.readUInt32BE(i), chunk = png.subarray(i + 4, i + 8).toString(); chunks.push(chunk); i += 12 + length; }
  assert(!chunks.some(c => ['tEXt', 'zTXt', 'iTXt', 'eXIf'].includes(c)), `${id}: strip PNG text/EXIF metadata`);
  assert(chunks.every(c => ['IHDR', 'IDAT', 'IEND'].includes(c)), `${id}: PNG must contain image chunks only`);
  report.parts[id] = { path: p.path, width, height, mode, sha256: sha(png), bytes: png.length, decodedBytes: width * height * 4, chunks: [...new Set(chunks)] };
  images[id] = 'data:image/png;base64,' + png.toString('base64');
}
assert.equal(M.assemblies.A.fighterPaths.length, 3);
assert.equal(M.assemblies.B.iris.segments, 6);
assert.equal(M.frame.paddleReserveCSS, 126);
for (const f of ['A', 'B']) for (const [id, power] of Object.entries(M.draftIntegration.payloads[f])) {
  assert(M.assemblies[f].bricks.some(b => b.id === id), `${f}: authored payload must name a measured module`);
  assert(['laser', 'split', 'shield'].includes(power));
}
report.textureBudgets = {};
for (const f of ['A', 'B']) {
  const family = Object.entries(report.parts).filter(([id]) => !/^[ab][A-Z]/.test(id) || id.startsWith(f.toLowerCase()));
  const paths = new Map(family.map(([, p]) => [p.path, p]));
  report.textureBudgets[f] = { uniquePaths: [...paths.keys()], encodedBytes: [...paths.values()].reduce((n, p) => n + p.bytes, 0), decodedBytes: [...paths.values()].reduce((n, p) => n + p.decodedBytes, 0), deduplicatedBy: 'Canonical file path, including the shared exhaust' };
}
assert(M.motion.doors.start + M.motion.doors.openDuration < M.assemblies.A.fighterPaths[0].delay);
assert(M.motion.doors.closeStart > M.assemblies.A.fighterPaths.at(-1).delay + M.motion.fighterLaunch.duration);
writeFileSync(`${OUT}/${reportName}.json`, JSON.stringify(report, null, 2));
if (process.argv.includes('--check')) {
  console.log(`Manifest checks pass. ${Object.keys(images).length} real files present; ${report.missing.length} pending.`);
  process.exit(0);
}
assert.equal(report.missing.length, 0, `Assembly requires actual parts; missing:\n${report.missing.join('\n')}`);

function runPreview(M, urls, family) {
  const cv = document.querySelector('canvas'), g = cv.getContext('2d');
  const Q = new URLSearchParams(location.search), d = M.frame.devices[Q.get('device') || 'ios'];
  const width = innerWidth, height = innerHeight, safe = Q.has('safe') ? Q.get('safe').split(',').map(Number) : [d.top, d.bottom];
  const FH = Math.round(360 * height / width), s = Math.min(width / 360, height / FH);
  const offX = (width / s - 360) / 2, offY = (height / s - FH) / 2;
  const originY = offY * s + safe[0] - M.frame.safeLift * s, H = Math.round(FH - (safe[0] + safe[1]) / s) + M.frame.safeLift;
  const paddleY = Math.round(H - M.frame.paddleReserveCSS / s), dpr = Math.min(devicePixelRatio || 1, 3);
  cv.width = Math.round(width * dpr); cv.height = Math.round(height * dpr); cv.style.width = width + 'px'; cv.style.height = height + 'px';
  const clamp = t => Math.max(0, Math.min(1, t)), smooth = t => { t = clamp(t); return t * t * (3 - 2 * t); };
  const mix = (a, b, t) => a + (b - a) * t, TAU = Math.PI * 2;
  let t = Number(Q.get('time') || 0), paused = Q.has('paused'), debug = Q.has('debug'), hp = 3, last = 0;
  const a = M.assemblies[family], pre = family.toLowerCase(), bit = n => pre + n;
  const imgs = {}, bounds = [], events = [];
  const state = (event, detail) => events.push({ event, ...detail });
  function part(id, x, y, w = null, h = null, angle = 0, alpha = 1) {
    const p = M.parts[id], im = imgs[id]; if (!im || alpha <= 0) return;
    [w, h] = w === null ? p.display : [w, h];
    g.save(); g.translate(x, y); g.rotate(angle); g.globalAlpha = alpha;
    g.drawImage(im, -p.pivot[0] * w, -p.pivot[1] * h, w, h); g.restore();
    bounds.push({ id, x, y, w, h, angle });
    if (debug) { g.save(); g.translate(x, y); g.rotate(angle); g.strokeStyle = '#91eed0'; g.lineWidth = .6; g.strokeRect(-p.pivot[0] * w, -p.pivot[1] * h, w, h); g.fillStyle = '#ff8ebc'; g.fillRect(-1, -1, 2, 2); g.restore(); }
  }
  const clip = (x, y, w, h, draw) => { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); draw(); g.restore(); };
  function fit(id, rect) {
    const p = M.parts[id], [x, y, w, h] = rect, visible = p.alphaVisible || p.display;
    const k = Math.min(w / visible[0], h / visible[1]);
    return { x: x + w / 2, y: y + h / 2, w: p.display[0] * k, h: p.display[1] * k };
  }
  function plume(x, y, size, phase, angle = 0) {
    if (phase === 'off') return;
    const k = phase === 'burst' ? 1.5 : .7, p = M.parts[bit('Thruster')], w = size * k * (1 + .04 * Math.sin(t * 31));
    part(bit('Thruster'), x, y, w, w * p.size[1] / p.size[0], angle, .95);
  }
  function cannon(side) {
    const p = M.parts[bit('CannonBarrel')], mount = p.mounts[side], c = M.motion.cannon;
    const age = t - c.warningStart - side * 1.75;
    const warning = age >= 0 && age < c.warningDuration;
    const fire = age >= c.warningDuration && age < c.warningDuration + c.fireDuration;
    const after = age - c.warningDuration, recoil = after >= 0 && after < c.recoilDuration ? Math.sin(Math.PI * after / c.recoilDuration) * c.recoilDistance : 0;
    const aim = (side ? -.12 : .12) * smooth((age + .4) / .6), localY = (p.muzzle[1] - p.pivot[1]) * p.display[1];
    const muzzleX = mount[0] - Math.sin(aim) * localY, muzzleY = mount[1] - recoil + Math.cos(aim) * localY;
    if (family === 'A') {
      // The fixed socket masks the rear telescoping tube while the front barrel recoils.
      g.save(); g.beginPath(); g.ellipse(mount[0], mount[1], p.display[0] * .7, p.display[1] * .5, 0, 0, TAU); g.clip();
      part(bit('CannonBarrel'), mount[0], mount[1] - recoil, null, null, aim); g.restore();
    } else part(bit('CannonBarrel'), mount[0], mount[1] - recoil, null, null, aim);
    if (warning) {
      g.strokeStyle = family === 'B' ? '#f4a162' : '#e38cb7'; g.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        g.beginPath();
        if (family === 'B') g.arc(muzzleX, muzzleY, 18, 2.4 + i * .4, 2.66 + i * .4);
        else { const y = muzzleY + 8 + i * 6; g.moveTo(muzzleX - 4 - i, y); g.lineTo(muzzleX + 4 + i, y); }
        g.stroke();
      }
    }
    if (fire) {
      const y = muzzleY + 12 + after * 410;
      g.save(); g.lineCap = 'round'; g.strokeStyle = '#d679bf'; g.lineWidth = 7; g.beginPath(); g.moveTo(muzzleX, y); g.lineTo(muzzleX, y + 16); g.stroke(); g.strokeStyle = '#ffe7f8'; g.lineWidth = 2; g.stroke(); g.restore();
    }
    state('cannon', { side, phase: warning ? 'warning' : fire ? 'fire' : recoil ? 'recoil' : age > c.warningDuration ? 'cooldown' : 'idle', recoil });
  }
  function fighter(path, front) {
    const age = t - path.delay, u = clamp(age / M.motion.fighterLaunch.duration); if (age < 0 || age > 3.4) return;
    const bay = a.hangar, exit = smooth((age - M.motion.fighterLaunch.duration) / 2.3), edgeX = path.end[0] < 160 ? -40 : 400;
    const x = mix(mix(bay.x, path.end[0], smooth(u)), edgeX, exit), y = mix(mix(bay.y - 9, path.end[1], smooth(u)), path.end[1] + 85, exit);
    const [fw, fh] = path.display || M.parts.aFighter.display, angle = mix(path.angle * smooth(u), edgeX < 0 ? .65 : -.65, exit);
    const draw = () => {
      for (const port of M.parts.aFighter.thrusterPorts) { const px = (port[0] - .5) * fw, py = (port[1] - .5) * fh; plume(x + px * Math.cos(angle) - py * Math.sin(angle), y + px * Math.sin(angle) + py * Math.cos(angle), 5, u < .18 ? 'idle' : 'burst', Math.PI + angle); }
      part('aFighter', x, y, fw, fh, angle, 1);
    };
    if (front) clip(-100, bay.mouthY, 560, H, draw);
    else clip(bay.x - bay.w / 2, bay.y - bay.h / 2, bay.w, bay.h, draw);
    if (front) state('fighter', { index: a.fighterPaths.indexOf(path), x, y, u, originatesInsideBay: true });
  }
  function skiffPose() {
    const departure = smooth((t - 9.3) / 1.2), scale = 1 - departure * .7;
    return { x: a.skiff.x, y: mix(a.skiff.y, a.iris.y, departure), scale, departure, alpha: 1 - smooth((t - 10.5) / .3) };
  }
  function skiffLip() {
    const pose = skiffPose(), p = M.parts.bSkiff, w = p.display[0] * pose.scale, h = p.display[1] * pose.scale;
    clip(pose.x - w / 2, pose.y + 2 * pose.scale, w, h / 2, () => part('bSkiff', pose.x, pose.y, w, h, 0, pose.alpha));
  }
  function pod(p, i, front) {
    const age = t - M.motion.pod.releaseStart - i * M.motion.pod.stagger, opened = smooth(age / M.motion.pod.doorDuration);
    const released = smooth((age - M.motion.pod.doorDuration) / M.motion.pod.workerDuration);
    const pose = family === 'B' ? skiffPose() : null;
    const dest = family === 'A' ? { x: 390, y: p.y - 75 } : { x: pose.x + (i - 1.5) * 7 * pose.scale, y: pose.y };
    const shell = M.parts[bit('Pod')], fitted = family === 'A' ? fit(bit('Pod'), p.referenceRect) : { w: shell.display[0], h: shell.display[1] }, pw = fitted.w, ph = fitted.h, win = shell.window;
    const x = family === 'A' ? mix(p.x, dest.x, released * released) : mix(p.x, dest.x, released);
    const startY = p.y + (win[1] + win[3] / 2 - .5) * ph;
    const y = family === 'A' ? p.y - 75 * smooth(released) : mix(startY, dest.y, released) - Math.sin(released * Math.PI) * 18;
    const board = family === 'B' ? smooth((released - .78) / .22) : 0, ws = (1 - board * .62) * (released >= 1 && pose ? pose.scale : 1), worker = M.parts[bit('Worker')];
    const drawWorker = () => part(bit('Worker'), x, y, worker.display[0] * ws, worker.display[1] * ws, Math.sin(released * Math.PI) * .12, pose && released >= 1 ? pose.alpha : 1);
    if (!front) {
      const ww = win[2] * pw, wh = win[3] * ph, expand = family === 'A' ? opened : 0;
      clip(p.x - mix(ww, pw, expand) / 2, startY - mix(wh, ph, expand) / 2, mix(ww, pw, expand), mix(wh, ph, expand), drawWorker); return;
    }
    if (family === 'A') {
      for (const sign of [-1, 1]) clip(sign < 0 ? p.x - pw / 2 : p.x, p.y - ph / 2, pw / 2, ph, () => part(bit('Pod'), p.x + sign * opened * pw * .55, p.y, pw, ph));
    } else part(bit('Pod'), p.x, p.y, pw, ph);
    clip(p.x + (win[0] - .5) * pw, p.y + (win[1] - .5) * ph, win[2] * pw, win[3] * ph, () => {
      const gy = p.y + (win[1] - .5) * ph - opened * ph;
      g.fillStyle = 'rgba(102,169,215,.10)'; g.fillRect(p.x + (win[0] - .5) * pw, gy, win[2] * pw, win[3] * ph);
      g.strokeStyle = 'rgba(195,231,255,.34)'; g.lineWidth = .65; g.beginPath(); g.moveTo(p.x - pw * .13, gy + ph * .07); g.lineTo(p.x + pw * .1, gy + ph * .04); g.stroke();
    });
    if (released > 0) {
      if (pose && released > .96) { g.save(); g.beginPath(); g.ellipse(pose.x, pose.y - 3 * pose.scale, 18 * pose.scale, 11 * pose.scale, 0, 0, TAU); g.clip(); drawWorker(); g.restore(); }
      else drawWorker();
    }
    state('pod', { index: i, opened, released, workerFriendly: true });
  }
  function bricks() {
    for (const b of a.bricks) {
      const q = fit(b.part, b.rect), x = q.x, y = q.y;
      if (hp > 0) part(b.part, x, y, q.w, q.h);
      if (hp > 0 && hp < 3 && b.part === 'brick_armour') {
        // Deterministic mechanical damage overlay; the base art is unchanged.
        g.strokeStyle = 'rgba(19,23,43,.8)'; g.lineWidth = 1;
        g.beginPath(); g.moveTo(x - 7, y - 7); g.lineTo(x - 2, y - 1); g.lineTo(x + 2, y - 3); g.lineTo(x + 5, y + 5); g.stroke();
        if (hp === 1) { g.beginPath(); g.moveTo(x - 2, y - 1); g.lineTo(x - 5, y + 6); g.lineTo(x - 8, y + 7); g.stroke(); }
      }
    }
    // Separate pickup states below the measured field, never mistaken for new reference brick positions.
    if (Q.has('powers')) for (const [i, name] of ['laser', 'split', 'shield'].entries()) part('capsule_' + name, 106 + i * 74, 410 + Math.sin(t * 2 + i) * 3);
  }
  function draw() {
    bounds.length = 0; events.length = 0;
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, width, height);
    const bg = imgs[bit('Background')], k = Math.max(width / bg.width, height / bg.height);
    g.drawImage(bg, width - bg.width * k, height - bg.height * k, bg.width * k, bg.height * k);
    g.setTransform(s * dpr, 0, 0, s * dpr, offX * s * dpr, originY * dpr);
    if (family === 'A') {
      for (const path of a.fighterPaths) fighter(path, false);
      part('aHull', a.hull.x, a.hull.y);
      const doors = M.motion.doors, open = smooth((t - doors.start) / doors.openDuration) * (1 - smooth((t - doors.closeStart) / doors.closeDuration));
      const b = a.hangar;
      clip(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h, () => { part('aDoorLeft', b.x - b.w / 4 - open * b.doorTravel, b.y); part('aDoorRight', b.x + b.w / 4 + open * b.doorTravel, b.y); });
      for (const path of a.fighterPaths) fighter(path, true);
      state('hangar', { open });
    } else {
      const iris = a.iris, motion = M.motion.iris, open = smooth((t - motion.openStart) / motion.openDuration);
      part('bPortal', iris.x, iris.y, null, null, -.04 * t, .85 + .1 * Math.sin(t * 3));
      g.save(); g.beginPath(); g.arc(iris.x, iris.y, iris.radius, 0, TAU); g.clip();
      for (let i = 0; i < iris.segments; i++) { const angle = i / iris.segments * TAU, r = open * motion.radialTravel; part('bIris', iris.x + Math.sin(angle) * r, iris.y - Math.cos(angle) * r, null, null, angle + open * motion.rotationRadians); }
      g.restore();
      part('bHull', a.hull.x, a.hull.y);
      const pose = skiffPose(), skiff = M.parts.bSkiff;
      plume(pose.x, pose.y - 8 * pose.scale, 7 * pose.scale, pose.departure > 0 ? 'burst' : t < .5 ? 'off' : 'idle', Math.PI);
      part('bSkiff', pose.x, pose.y, skiff.display[0] * pose.scale, skiff.display[1] * pose.scale, 0, pose.alpha);
      state('iris', { open }); state('thruster', { phase: pose.departure > 0 ? 'burst' : t < .5 ? 'off' : 'idle' });
    }
    cannon(0); cannon(1);
    for (let i = 0; i < a.pods.length; i++) pod(a.pods[i], i, false);
    for (let i = 0; i < a.pods.length; i++) pod(a.pods[i], i, true);
    if (family === 'B') skiffLip();
    bricks();
    const paddleId = family === 'A' ? 'aPaddle' : 'paddle', pp = M.parts[paddleId], pk = a.paddleVisibleWidth / pp.alphaVisible[0], paddleH = pp.alphaVisible[1] * pk;
    part(paddleId, 180, paddleY + paddleH / 2, pp.display[0] * pk, pp.display[1] * pk);
    const bp = M.parts.ball, bk = a.mainBallDiameter / bp.alphaVisible[0];
    part('ball', 203, paddleY - 108, bp.display[0] * bk, bp.display[1] * bk);
    g.fillStyle = '#c4d3e4'; g.font = 18 / s + 'px "Lilita One"'; g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillText('12,450', 360 - 12 / s, 34 + 18 / s);
    for (let i = 0; i < 3; i++) part('ball', (66 + i * 14) / s, 34 + 18 / s, bp.display[0] * 13 / bp.alphaVisible[0] / s, bp.display[1] * 13 / bp.alphaVisible[1] / s);
    g.font = 12 / s + 'px "Lilita One"'; g.textAlign = 'left'; g.fillStyle = '#dfbaf5'; g.fillText('AIM', 150 / s, 34 + 18 / s);
    for (let i = 0; i < 3; i++) { g.fillStyle = i < 2 ? '#dab1ee' : '#3f4059'; g.beginPath(); g.roundRect((181 + i * 11) / s, 34 + 14.5 / s, 8 / s, 7 / s, 3 / s); g.fill(); }
    g.fillStyle = '#a8bfcc'; for (const x of [22, 28]) { g.beginPath(); g.roundRect(x / s, 34 + 11 / s, 2.5 / s, 14 / s, 1 / s); g.fill(); }
  }
  window.__spacePreview = { ready: false, family, get time() { return t; }, seek(value) { t = Math.max(0, Math.min(a.duration, value)); paused = true; draw(); }, setHP(value) { hp = Math.max(0, Math.min(3, value)); draw(); }, setDebug(value) { debug = !!value; draw(); }, inspect: () => ({ time: t, family, debug, bounds, events, scale: s, originY, paddleY, reserve: (H - paddleY) * s, safe, width, height, visiblePaddleWidth: a.paddleVisibleWidth, visibleMainBallDiameter: a.mainBallDiameter, hudBallDiameterCSS: 13, captiveCount: a.pods.length, fontLoaded: document.fonts.check('18px "Lilita One"') }) };
  Promise.all(Object.entries(urls).map(async ([id, url]) => { const im = new Image(); im.src = url; await im.decode(); imgs[id] = im; })).then(async () => {
    const alpha = {};
    for (const [id, im] of Object.entries(imgs)) {
      const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const cg = c.getContext('2d', { willReadFrequently: true }); cg.drawImage(im, 0, 0);
      const px = cg.getImageData(0, 0, im.width, im.height).data; let min = 255, max = 0, n = 0, left = im.width, top = im.height, right = 0, bottom = 0;
      for (let i = 3; i < px.length; i += 4) { const v = px[i]; min = Math.min(min, v); max = Math.max(max, v); if (v > 4) { n++; const x = ((i - 3) / 4) % im.width, y = Math.floor((i - 3) / 4 / im.width); left = Math.min(left, x); right = Math.max(right, x + 1); top = Math.min(top, y); bottom = Math.max(bottom, y + 1); } }
      alpha[id] = { min, max, coverage: n / (im.width * im.height), bounds: [left, top, right, bottom] };
    }
    window.__spacePreview.alpha = alpha;
    await document.fonts.load('18px "Lilita One"'); await document.fonts.ready;
    if (!document.fonts.check('18px "Lilita One"')) throw new Error('Embedded game font failed to load');
    draw(); window.__spacePreview.ready = true;
    requestAnimationFrame(function frame(now) { if (last && !paused) t = (t + Math.min(.05, (now - last) / 1000)) % a.duration; last = now; draw(); requestAnimationFrame(frame); });
  }).catch(error => { document.querySelector('output').textContent = error.message; throw error; });
  addEventListener('keydown', e => { if (e.key === ' ') paused = !paused; if (e.key.toLowerCase() === 'd') debug = !debug; if (e.key === 'ArrowRight') window.__spacePreview.seek(t + .1); if (e.key === 'ArrowLeft') window.__spacePreview.seek(t - .1); if (e.key.toLowerCase() === 'h') window.__spacePreview.setHP((hp + 3) % 4); });
}

for (const family of ['A', 'B']) {
  const familyImages = Object.fromEntries(Object.entries(images).filter(([id]) => !/^[ab][A-Z]/.test(id) || id.startsWith(family.toLowerCase())));
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>BREACH ${M.assemblies[family].title} — asset assembly</title><style>@font-face{font-family:'Lilita One';src:url(data:font/ttf;base64,${fontData}) format('truetype');font-weight:400;font-display:block}html,body{margin:0;background:#070913;overflow:hidden}canvas{display:block}output{position:fixed;left:12px;top:12px;color:#ffc0d4;font:14px sans-serif}</style><canvas aria-label="${M.assemblies[family].title} moving asset assembly"></canvas><output></output><script>(${runPreview.toString()})(${JSON.stringify(M)},${JSON.stringify(familyImages)},${JSON.stringify(family)});</script></html>`;
  writeFileSync(`${OUT}/space-${family.toLowerCase()}.html`, html);
}

if (process.argv.includes('--capture')) {
  const { chromium } = await import(process.env.PW_MODULE || 'playwright');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  try {
    for (const family of ['A', 'B']) for (const [device, d] of Object.entries(M.frame.devices)) {
      const page = await browser.newPage({ viewport: d, deviceScaleFactor: 1 }), errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.goto(pathToFileURL(resolve(`${OUT}/space-${family.toLowerCase()}.html`)).href + `?device=${device}&paused=1`);
      await page.waitForFunction(() => window.__spacePreview?.ready);
      await page.evaluate(() => __spacePreview.seek(3));
      await page.screenshot({ path: `${OUT}/${family}-${device}-reference.png` });
      const alpha = await page.evaluate(() => __spacePreview.alpha);
      for (const [id, info] of Object.entries(alpha)) if (!id.endsWith('Background')) { assert.equal(info.min, 0, `${id}: exterior alpha`); assert(info.coverage > .02 && info.coverage < .98, `${id}: actual cutout`); }
      const samples = [];
      for (const time of [0, 1.2, 2.2, 3, 4.45, 5.2, 6.8, 8.4, 9.4]) {
        await page.evaluate(t => __spacePreview.seek(t), time);
        samples.push(await page.evaluate(() => __spacePreview.inspect()));
        await page.screenshot({ path: `${OUT}/${family}-${device}-${String(time).replace('.', '_')}.png` });
      }
      const releaseSamples = [];
      for (const progress of [0, .25, .5, .75, 1]) {
        let lo = 0, hi = 1;
        for (let i = 0; i < 30; i++) { const v = (lo + hi) / 2; if (v * v * (3 - 2 * v) < progress) lo = v; else hi = v; }
        const time = M.motion.pod.releaseStart + M.motion.pod.doorDuration + M.motion.pod.workerDuration * (lo + hi) / 2;
        await page.evaluate(t => __spacePreview.seek(t), time);
        releaseSamples.push(await page.evaluate(() => __spacePreview.inspect()));
        await page.screenshot({ path: `${OUT}/${family}-${device}-release-${Math.round(progress * 100)}.png` });
      }
      for (const sample of samples) { assert(Math.abs(sample.reserve - 126) < .6); assert.equal(sample.debug, false); assert(sample.fontLoaded); assert.equal(sample.captiveCount, family === 'A' ? 5 : 4); }
      if (family === 'A') assert.equal(samples.find(s => s.time === 3).events.filter(e => e.event === 'fighter').length, 3);
      await page.evaluate(() => { __spacePreview.setHP(1); __spacePreview.seek(2.2); });
      await page.screenshot({ path: `${OUT}/${family}-${device}-critical.png` });
      if (process.argv.includes('--motion') && device === 'ios') {
        const frames = `${OUT}/${family}-motion`; mkdirSync(frames, { recursive: true });
        for (let f = 0; f < M.assemblies[family].duration * 12; f++) { await page.evaluate(t => __spacePreview.seek(t), f / 12); await page.screenshot({ path: `${frames}/${String(f).padStart(3, '0')}.png` }); }
      }
      assert.deepEqual(errors, []);
      report.captures[family + '-' + device] = { errors, alpha, samples, releaseSamples };
      await page.close();
    }
  } finally { await browser.close(); }
}
assert.equal(gameHash(), report.activeGameSha256, 'Active gameplay build must remain unchanged');
writeFileSync(`${OUT}/${reportName}.json`, JSON.stringify(report, null, 2));
console.log(`A/B independent assemblies written to ${OUT}; active build unchanged.`);
