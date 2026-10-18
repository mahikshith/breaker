import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
globalThis.Image = class { complete = true; naturalWidth = 1; decode() { return Promise.resolve(); } };
const { spacePowerLayout } = await import('../../src/space-companions.js');
const { chromium } = await import(process.env.PW_MODULE || 'playwright');
const out = process.argv[2] || 'out/combat-phones', html = resolve(process.argv[3] || 'dist/breach.html'); mkdirSync(out, { recursive: true });
const sha = p => createHash('sha256').update(readFileSync(p)).digest('hex');
const paths = { carrier: html, circuit: html, forge: html }, indices = {carrier:0,circuit:2,forge:3};
const reportPath = `${out}/report.json`;
const report = { scope: 'Actual main bundle: touch, power selection, freeze, Retry, WIDE, safe-area and artwork checks. Power charge is staged; not human balance or physical handset performance.', builds: Object.fromEntries(Object.entries(paths).map(([k,p])=>[k,sha(p)])), cases: [] };
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM, args: ['--mute-audio'] });
try {
  for (const [device, D] of Object.entries({ ios: { width: 393, height: 852, top: 59, bottom: 34 }, android: { width: 412, height: 915, top: 32, bottom: 24 } })) {
    for (const id of Object.keys(paths)) for (const mode of ['easy', 'medium', 'hard']) {
      const page = await browser.newPage({ viewport: D, deviceScaleFactor: 2, hasTouch: true }), errors = [];
      page.on('pageerror', e => errors.push(e.stack || e.message));
      await page.addInitScript(() => {
        window.requestAnimationFrame = fn => { window.__nextPowerFrame = fn; return 1; }; localStorage.setItem('breach.unlocked', 'true');
        const OriginalImage = Image; window.__combatImages = [];
        window.Image = class extends OriginalImage { constructor() { super(); __combatImages.push(this); } };

      });
      await page.goto(`${pathToFileURL(html).href}?level=${indices[id]+1}&difficulty=${mode}&safe=${D.top},${D.bottom}`);
      await page.waitForFunction(() => window.__breach && window.__nextPowerFrame, null, { polling: 100 });
      await page.evaluate(async () => { await document.fonts.ready; await Promise.all(__combatImages.map(i=>i.decode())); });
      await page.evaluate(index => {
        window.__combatIndex = index; let now = performance.now(); window.PQ = {
          frame(n = 1) { now = Math.max(now, performance.now()); for (let i = 0; i < n; i++) __nextPowerFrame(now += 1000 / 60); },
          fresh() { __breach.start(__combatIndex); this.frame(2); },
          snapshot() { const l = __breach.level; return JSON.stringify({ clock: l.clock, t: l.t, kitTime: l.kitTime, balls: l.balls, shots: l.shots, drops: l.drops, charge: l.paddle.charge, laser: l.paddle.laserT, serveAge: l.serveAge, pressure: l.pressureClock, waveRemaining: l.waveRemaining, phase: l.phase, stage: l.stage, hp: l.hull?.hp ?? l.carrier?.hp, bolts: l.bolts }); },
        }; PQ.frame(2);
      }, indices[id]);
      const session = await page.context().newCDPSession(page);
      const touch = (type, x = 0, y = 0) => session.send('Input.dispatchTouchEvent', { type, touchPoints: ['touchEnd', 'touchCancel'].includes(type) ? [] : [{ id: 31, x, y, radiusX: 3, radiusY: 3, force: 1 }] });
      const tap = async p => { await touch('touchStart', p.x, p.y); await touch('touchEnd'); };
      const frame = n => page.evaluate(n => PQ.frame(n), n);
      const geometry = await page.evaluate(() => { const l = __breach.level; return { W: l.W, H: l.H, kitUIScale: l.kitUIScale, orb: l.kitAnchor(), reserve: (l.H - l.paddle.y) * l.kitUIScale, spacePowers: l.spacePowers }; });
      assert(geometry.spacePowers); assert(Math.abs(geometry.reserve - 126) < .7);
      assert(await page.evaluate(() => __combatImages.every(i=>i.complete && i.naturalWidth>0)), `${id}: runtime artwork decodes`);
      assert.equal(await page.evaluate(()=>__breach.level.companionId), {carrier:'nix',circuit:'vesper',forge:'forge'}[id]);
      const css = (x, y) => ({ x: x * geometry.kitUIScale, y: D.top + (y - 34) * geometry.kitUIScale });
      const orb = css(geometry.orb.x, geometry.orb.y), menu = spacePowerLayout({ ...geometry, kitAnchor: () => geometry.orb });
      if (mode === 'easy') await page.screenshot({ path: `${out}/${device}-${id}-opening.png` });
      // Genuine canvas aim, release and lower relative drag.
      const dragY = D.height - D.bottom - 26;
      await touch('touchStart', D.width / 2, dragY); await touch('touchMove', D.width / 2 + 30, dragY); await frame(5);
      assert(await page.evaluate(() => __breach.level.aim.angle > .1)); await touch('touchEnd'); await frame(1);
      assert(await page.evaluate(() => !__breach.level.aim));
      await touch('touchStart', D.width / 2, dragY); await touch('touchMove', D.width / 2 - 45, dragY); await frame(8);
      assert(await page.evaluate(() => __breach.level.paddle.x < 160)); await touch('touchEnd');
      const powers = [];
      for (const kind of ['laser', 'titan', 'five']) {
        await page.evaluate(() => { PQ.fresh(); const l = __breach.level; for (let i = 0; i < l.coreHits; i++) l.chargeSpacePower({}); l.updateCoreCharge(l.coreHits); PQ.frame(1); });
        await tap(orb); await frame(1); assert(await page.evaluate(() => __breach.level.powerMenuOpen));
        const frozen = await page.evaluate(() => PQ.snapshot()); await frame(120); assert.equal(await page.evaluate(() => PQ.snapshot()), frozen, `${id}/${mode}/${device}: choice freezes every active clock`);
        if (kind === 'laser' && mode === 'easy') await page.screenshot({ path: `${out}/${device}-${id}-picker.png` });
        const c = menu.choices.find(c => c.id === kind); await tap(css(c.x + c.w / 2, c.y + c.h / 2));
        assert(await page.evaluate(() => !__breach.level.powerMenuOpen && __breach.level.paddle.charge === 0));
        const applied = await page.evaluate(kind => { const l = __breach.level; return { kind, laser: l.paddle.laserT, titans: l.balls.filter(b => b.titan > 0).length, count: l.balls.filter(b => !b.dead).length, caught: l.balls.filter(b => b.caught).length }; }, kind);
        if (kind === 'laser') assert.equal(applied.laser, {easy:8,medium:7,hard:6}[mode]);
        if (kind === 'titan') assert.equal(applied.titans, 1);
        if (kind === 'five') { assert.equal(applied.count, 5); assert.equal(applied.titans, 0); assert.equal(applied.caught, 0); }
        powers.push(applied); await frame(3);
        if (mode === 'easy') await page.screenshot({ path: `${out}/${device}-${id}-${kind}.png` });
      }
      // Swiping a choice is not a purchase; Escape closes without spending.
      await page.evaluate(() => { PQ.fresh(); __breach.level.paddle.charge = 1; PQ.frame(1); });
      await tap(orb); await frame(1); const c = menu.choices[0], point = css(c.x + c.w / 2, c.y + c.h / 2);
      await touch('touchStart', point.x, point.y); await touch('touchMove', point.x + 30, point.y); await touch('touchEnd');
      assert(await page.evaluate(() => __breach.level.powerMenuOpen && __breach.level.paddle.charge === 1));
      await page.keyboard.press('Escape'); assert(await page.evaluate(() => !__breach.level.powerMenuOpen && __breach.level.paddle.charge === 1));
      await tap(orb); await frame(1); await tap({ x: 22, y: D.top + 22 }); await frame(1);
      assert.equal(await page.evaluate(() => __breach.scene), 'pause'); assert(await page.evaluate(() => !__breach.level.powerMenuOpen && __breach.level.paddle.charge === 1));
      const paused = await page.evaluate(() => PQ.snapshot()); await frame(120); assert.equal(await page.evaluate(() => PQ.snapshot()), paused);
      const retry = { x: 180 * geometry.kitUIScale, y: D.top + ((geometry.H - 34) / 2 + 24) * geometry.kitUIScale };
      await tap(retry); await frame(1); assert.equal(await page.evaluate(() => __breach.scene), 'level');
      assert(await page.evaluate(() => __breach.level.paddle.charge === 0 && !__breach.level.powerMenuOpen && __breach.level.aim?.serve));
      const wide=await page.evaluate(()=>{const l=__breach.level;l.applyPower('wide');PQ.frame(45);const first=l.paddle.w,time=l.paddle.wideT;l.applyPower('wide');const added=l.paddle.wideT-time;PQ.frame(45);return{first,second:l.paddle.w,added,left:l.paddle.x-l.paddle.w/2,right:l.paddle.x+l.paddle.w/2,bounds:[l.left,l.right]};});
      assert(wide.second>wide.first+30&&wide.added===12);assert(wide.left>=wide.bounds[0]&&wide.right<=wide.bounds[1]);
      if(mode==='easy')await page.screenshot({path:`${out}/${device}-${id}-double-wide.png`});
      assert.deepEqual(errors, []); report.cases.push({ device, id, mode, geometry, powers, actualTouchModalPauseRetry: true, errors });
      writeFileSync(reportPath, JSON.stringify(report, null, 2)); console.log(device, id, mode, 'passed'); await page.close();
    }
  }
} finally { await browser.close(); }
for (const [id, path] of Object.entries(paths)) assert.equal(sha(path), report.builds[id], 'Build changed during phone review');
console.log(`${report.cases.length} phone/mode/level cases passed.`);
