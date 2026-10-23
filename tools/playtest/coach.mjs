// First-time coaching captures (src/coach.js): serve coach (Vault, Gatehouse), Focus hold-still and caught aim (Vault),
// ram pip coach and armed state, and the burn-in Ward at full and half time. Each scene sets a moment up, lets the chip
// fade in, then freezes the simulation (drawing continues) for a stable frame.
// Usage: PW_MODULE=<playwright index.mjs> node tools/playtest/coach.mjs <out> [html]
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(process.env.PW_MODULE || 'playwright');
const [OUT = 'out/coach', HTML = 'dist/breach.html'] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });

// Runs in the page. prefs: coach progress to start from; setup returns nothing; settle: seconds of coach time.
const vaultReady = `const l = __breach.level; l.wardCoachSeen = true; l.skipIntro(); while (l.phase === 'intro') l.update(1 / 120);`;
const freeze = `const L = __breach.level; L.update = () => {};`;
const SCENES = [
  { name: 'vault-serve-coach', idx: 1, prefs: {}, setup: `${vaultReady} for (let i = 0; i < 40; i++) l.update(1 / 60); ${freeze}` },
  { name: 'gatehouse-serve-coach', idx: 8, prefs: {}, setup: `const l = __breach.level; for (let i = 0; i < 40; i++) l.update(1 / 60); ${freeze}` },
  { name: 'vault-hold-still-coach', idx: 1, prefs: { coachServes: 9 }, setup: `${vaultReady}
      l.pointerDown(180, l.paddle.y + 40); l.pointerUp(); for (let i = 0; i < 30; i++) l.update(1 / 60);
      const b = l.balls[0]; l.paddle.x = 180; b.x = 186; b.y = l.paddle.y - 150; b.vx = -40; b.vy = 300; l.focus = 2;
      for (let i = 0; i < 12; i++) { l.coach.update(1 / 60, l.coachMoment()); }
      l.coach.time += .4; l.coach.a = 1; ${freeze}` },
  { name: 'vault-caught-aim-coach', idx: 1, prefs: { coachServes: 9, coachAimHud: true }, setup: `${vaultReady}
      l.pointerDown(180, l.paddle.y + 40); l.pointerUp(); for (let i = 0; i < 30; i++) l.update(1 / 60);
      const b = l.balls[0]; l.paddle.x = 180; b.x = 186; b.y = l.paddle.y - 7; b.vx = -60; b.vy = 300; l.focus = 2;
      l.pointerDown(180, l.paddle.y + 40); l.ptr.stillT = .2; l.onPaddle(b); l.aim.angle = -.35;
      for (let i = 0; i < 24; i++) l.coach.update(1 / 60, l.coachMoment()); ${freeze}` },
  { name: 'gatehouse-ram-pip-coach', idx: 8, prefs: { coachServes: 9 }, setup: `const l = __breach.level, m = l.m;
      l.pointerDown(180); l.pointerUp(); for (let i = 0; i < 20; i++) l.update(1 / 60);
      const b = m.balls[0]; b.x = 150; b.y = 380; b.vx = 120; b.vy = -300; m.paddle.streak = 1; l.update(1 / 60); m.paddle.streak = 2;
      for (let i = 0; i < 24; i++) l.update(1 / 60); ${freeze}` },
  { name: 'gatehouse-ram-armed', idx: 8, prefs: { coachServes: 9 }, setup: `const l = __breach.level, m = l.m;
      l.pointerDown(180); l.pointerUp(); for (let i = 0; i < 20; i++) l.update(1 / 60);
      const b = m.balls[0]; b.x = 150; b.y = 380; b.vx = 120; b.vy = -300; m.paddle.streak = 2; l.update(1 / 60); m.paddle.armed = true; m.paddle.streak = 0;
      for (let i = 0; i < 30; i++) l.update(1 / 60); ${freeze}` },
  { name: 'vault-ram-armed', idx: 1, prefs: { coachServes: 9, coachCatches: 9 }, setup: `${vaultReady}
      l.pointerDown(180, l.paddle.y + 40); l.pointerUp(); for (let i = 0; i < 30; i++) l.update(1 / 60);
      l.paddle.armed = true; for (let i = 0; i < 30; i++) l.update(1 / 60); ${freeze}` },
  { name: 'gatehouse-ward-full', idx: 8, prefs: { coachServes: 9, coachRam: true }, setup: `const l = __breach.level, m = l.m;
      l.pointerDown(180); l.pointerUp(); for (let i = 0; i < 20; i++) l.update(1 / 60);
      const b = m.balls[0]; b.x = 150; b.y = 380; b.vx = 120; b.vy = -300; m.charge = 100; m.activate('ward'); l.update(1 / 60); ${freeze}` },
  { name: 'gatehouse-ward-half', idx: 8, prefs: { coachServes: 9, coachRam: true }, setup: `const l = __breach.level, m = l.m;
      l.pointerDown(180); l.pointerUp(); for (let i = 0; i < 20; i++) l.update(1 / 60);
      const b = m.balls[0]; b.x = 150; b.y = 380; b.vx = 120; b.vy = -300; m.charge = 100; m.activate('ward'); l.update(1 / 60);
      window.__halfWard = () => { m.ward.remaining = m.ward.remaining / 2; }; ${freeze}`, after: 'half' },
];

const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
const errors = [];
try {
  for (const scene of SCENES) {
    const page = await browser.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, hasTouch: true });
    page.on('pageerror', e => errors.push(`${scene.name}: ${e.message}`));
    await page.addInitScript(prefs => { for (const [k, v] of Object.entries(prefs)) localStorage.setItem('breach.' + k, JSON.stringify(v)); localStorage.setItem('breach.aimReadySeen', 'true'); localStorage.setItem('breach.wardCoachAck', 'true'); }, scene.prefs);
    await page.goto(pathToFileURL(resolve(HTML)).href + '?safe=59,34');
    await page.waitForFunction(() => window.__breach?.ready, null, { timeout: 30000 });
    await page.evaluate(() => Promise.all([document.fonts.load('16px "Lilita One"'), document.fonts.load('600 12px Rubik')]));
    await page.evaluate(({ idx, src }) => { __breach.start(idx); (0, eval)(src); }, { idx: scene.idx, src: scene.setup });
    await page.waitForTimeout(400);
    if (scene.after === 'half') await page.evaluate(() => window.__halfWard());
    await page.waitForTimeout(250);
    await page.screenshot({ path: `${OUT}/${scene.name}-393x852.png` });
    await page.close();
  }
} finally { await browser.close(); }
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`wrote ${OUT}`);
