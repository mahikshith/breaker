// Actual bundled phone UI: geometry, copy, score, first-use prompt and invisible lower input.
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ART } from '../../src/vault-art.js';
const { chromium } = await import(process.env.PW_MODULE || 'playwright');
const OUT = process.argv[2] || 'out/mobile-ui';
mkdirSync(OUT, { recursive: true });
const hash = () => createHash('sha256').update(readFileSync('dist/breach.html')).digest('hex');
const report = { sha256: hash(), devices: {} };
const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
try {
  for (const [name, d] of Object.entries({ ios: { width: 393, height: 852, top: 59, bottom: 34 }, android: { width: 412, height: 915, top: 32, bottom: 24 } })) {
    const page = await browser.newPage({ viewport: d, deviceScaleFactor: 2, hasTouch: true }), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(face => {
      window.requestAnimationFrame = fn => { window.__nextFrame = fn; return 1; };
      const fillText = CanvasRenderingContext2D.prototype.fillText;
      const drawImage = CanvasRenderingContext2D.prototype.drawImage;
      CanvasRenderingContext2D.prototype.drawImage = function (...args) {
        if (this.canvas.id === 'game' && args[0]?.src === face) window.__uiKitFaces++;
        return drawImage.apply(this, args);
      };
      CanvasRenderingContext2D.prototype.fillText = function (value, x, y, ...rest) {
        if (this.canvas.id === 'game') {
          const m = this.getTransform(), r = this.canvas.getBoundingClientRect(), k = r.width / this.canvas.width;
          (window.__uiTexts ||= []).push({ value: String(value), font: this.font, x: (m.a * x + m.c * y + m.e) * k, y: (m.b * x + m.d * y + m.f) * k, width: this.measureText(value).width * m.a * k, align: this.textAlign });
        }
        return fillText.call(this, value, x, y, ...rest);
      };
    }, ART.kit.faces.url);
    const url = pathToFileURL(resolve('dist/breach.html')).href + `?safe=${d.top},${d.bottom}`;
    const init = async () => {
      await page.goto(url); await page.waitForFunction(() => window.__breach && window.__nextFrame, null, { polling: 50 });
      await page.evaluate(async () => { await document.fonts.load('18px "Lilita One"'); await document.fonts.ready; });
      await page.waitForTimeout(700);
      await page.evaluate(() => {
        let clock = performance.now();
        window.UI = {
          draw() { const l = __breach.level, u = l.update; l.update = () => {}; __uiTexts = []; __uiKitFaces = 0; __nextFrame(clock += 1000 / 60); l.update = u; return __uiTexts; },
          step(t) { for (let i = 0; i < Math.round(t * 120); i++) __breach.level.update(1 / 120); return this.draw(); },
          start(i) { __breach.start(i); const l = __breach.level; l.skipIntro?.(); while (l.phase === 'intro') l.update(1 / 120); this.draw(); }
        };
      });
    };
    await init();
    const stages = [];
    for (const i of [0, 1]) {
      await page.evaluate(i => UI.start(i), i);
      const stage = await page.evaluate(i => i ? 'vault' : __breach.level.name === 'Carrier Breakout' ? 'carrier' : 'invasion', i);
      const geometry = await page.evaluate(() => { const l = __breach.level, a = l.kitAnchor(), s = l.kitUIScale; return { paddle: l.paddle.y, reserve: (l.H - l.paddle.y) * s, drainGap: l.drainY - l.paddle.y, shieldGap: l.shieldY - l.paddle.y, orb: a, s, H: l.H, dangerY: l.dangerY, paddleWidth: l.paddle.w, ballRadius: l.ballRadius }; });
      assert(Math.abs(geometry.reserve - 126) < 0.6);
      assert.equal(geometry.drainGap, 20); assert.equal(geometry.shieldGap, 18);
      assert.equal(geometry.orb.r * 2 * geometry.s, 52);
      assert(Math.abs((geometry.orb.x - geometry.orb.r) * geometry.s - 12) < 0.01);
      if (stage === 'invasion') assert.equal(geometry.dangerY, geometry.paddle - 64);
      if (stage === 'carrier') { assert.equal(geometry.paddleWidth, 125); assert.equal(geometry.ballRadius, 7.5); assert.equal(await page.evaluate(() => __breach.level.coreMode), 'manual'); }
      const texts = await page.evaluate(() => UI.draw());
      assert.equal(await page.evaluate(() => __uiKitFaces), i ? 1 : 0, `${name}/${stage}: Kit belongs only to Vault`);
      assert(!texts.some(t => /SERPENT|CATCH READY|Slide to|Drag to|HOLD STILL|Keep holding|lift to|Aim ready/i.test(t.value)), `${name}/${stage}: quiet opening`);
      assert(texts.find(t => t.value === 'AIM')?.y < d.top + 45);
      await page.screenshot({ path: `${OUT}/${name}-${stage}-opening.png` });
      if (stage === 'invasion') {
        await page.mouse.move(38, d.height - d.bottom - 30); await page.mouse.down();
        assert.equal(await page.evaluate(() => __breach.level.ptr.down), true, `${name}: removed Kit leaves no invisible tap target`);
        await page.mouse.up(); await page.evaluate(() => UI.start(0));
      } else if (stage === 'carrier') {
        const orb = { x: geometry.orb.x * geometry.s, y: d.top + (geometry.orb.y - 34) * geometry.s };
        await page.mouse.move(orb.x, orb.y); await page.mouse.down();
        assert.equal(await page.evaluate(() => __breach.level.ptr.down), false, `${name}: Nix face press does not grab the paddle`);
        await page.mouse.up();
        assert(await page.evaluate(() => __breach.level.aim?.ball.caught && __breach.level.paddle.charge === 0), `${name}: an uncharged Nix tap does not launch or spend`);
      }
      const scores = [];
      for (const score of [999999, 9999999, Number.MAX_SAFE_INTEGER]) {
        const tx = await page.evaluate(score => { const l = __breach.level; l.score = score; l.lives = 5; return UI.draw(); }, score);
        const label = tx.find(t => t.align === 'right' && t.y < d.top + 30 && /\d/.test(t.value));
        assert(label && label.font.includes('Lilita One'), `${name}/${stage}: game score font`);
        assert(label.x <= d.width - 10 && label.x - label.width > 220, `${name}/${stage}: score clears AIM`);
        scores.push(label);
      }
      await page.screenshot({ path: `${OUT}/${name}-${stage}-five-lives-score.png` });
      await page.evaluate(() => { __breach.level.score = 0; __breach.level.lives = 3; });
      const y = d.height - d.bottom - 26;
      await page.mouse.move(d.width / 2, y); await page.mouse.down();
      await page.mouse.move(d.width / 2 + 50, y); await page.evaluate(() => UI.step(.1));
      assert(await page.evaluate(() => __breach.level.aim.angle > .1));
      await page.mouse.up(); await page.evaluate(() => UI.step(.05));
      assert(await page.evaluate(() => !__breach.level.aim && __breach.level.balls.some(b => !b.caught && b.vy < 0)));
      await page.mouse.move(d.width / 2, y); await page.mouse.down(); await page.mouse.move(d.width / 2 - 80, y); await page.evaluate(() => UI.step(.2));
      assert(await page.evaluate(() => __breach.level.paddle.x < 140));
      await page.mouse.up();
      const core = await page.evaluate(() => {
        const l = __breach.level, b = l.balls[0], p = l.paddle;
        l.aim = null; p.charge = 1; l.ptr.down = false; p.stun = 0;
        Object.assign(b, { x: p.x, y: p.y - 30, vx: 0, vy: 300, caught: false, dead: false, r: l.ballRadius, titan: 0 });
        UI.step(.2);
        return { charge: p.charge, titan: b.titan > 0, radius: b.r, faces: __uiKitFaces };
      });
      assert.equal(core.titan, stage === 'invasion'); assert.equal(core.charge, stage === 'invasion' ? 0 : 1); assert.equal(core.faces, i ? 1 : 0);
      if (stage === 'carrier') assert.equal(core.radius, 7.5, `${name}: manual centre return remains ordinary`);
      const manualCommand = stage === 'carrier' ? await page.evaluate(() => {
        const l = __breach.level, used = l.activateCorePower() && l.chooseSpacePower('titan'); UI.draw();
        return { used, charge: l.paddle.charge, balls: l.balls.map(b => ({ radius: b.r, titan: b.titan || 0 })) };
      }) : null;
      if (manualCommand) {
        assert(manualCommand.used); assert.equal(manualCommand.charge, 0);
        assert.equal(manualCommand.balls.filter(b => b.titan === 10 && b.radius === 10).length, 1, `${name}: explicit choice grants one ten-second unstoppable ball`);
      }
      stages.push({ stage, geometry, scores, core, ...(manualCommand ? { manualCommand } : {}) });
    }
    await page.evaluate(() => localStorage.removeItem('breach.aimReadySeen'));
    await init(); await page.evaluate(() => UI.start(0));
    const y = d.height - d.bottom - 26;
    await page.mouse.move(d.width / 2, y); await page.mouse.down();
    const first = await page.evaluate(() => UI.step(.02));
    assert(first.some(t => t.value === 'Aim ready'), `${name}: first caught-ball press`);
    assert.equal(await page.evaluate(() => localStorage.getItem('breach.aimReadySeen')), 'true');
    await page.screenshot({ path: `${OUT}/${name}-first-aim-ready.png` });
    await page.mouse.up();
    assert(!(await page.evaluate(() => UI.draw())).some(t => t.value === 'Aim ready'));
    await page.evaluate(() => UI.start(1));
    await page.mouse.down();
    assert(!(await page.evaluate(() => UI.step(.02))).some(t => t.value === 'Aim ready'), `${name}: no repeat in next level`);
    await page.mouse.up(); await init(); await page.evaluate(() => UI.start(0));
    await page.mouse.down();
    assert(!(await page.evaluate(() => UI.step(.02))).some(t => t.value === 'Aim ready'), `${name}: no repeat after reload`);
    await page.mouse.up();
    const shieldCases = await page.evaluate(() => {
      let count = 0;
      for (const r of [__breach.level.ballRadius || 6, 10]) for (const speed of [345, 441.6]) for (let phase = 0; phase < 16; phase++) {
        UI.start(0); const l = __breach.level, b = l.balls[0];
        l.aim = null; l.shield = 1; l.shieldT = 10;
        Object.assign(b, { x: l.left + 12, y: l.shieldY - r - speed / 120 * (.1 + phase / 16), vx: 0, vy: speed, caught: false, dead: false, r, titan: r === 10 ? 10 : 0 });
        for (let i = 0; i < 8 && l.shield; i++) l.update(1 / 120);
        if (b.dead || b.vy >= 0 || l.shield || l.lives !== 3) throw Error('Shield/drain regression ' + [r, speed, phase]);
        count++;
      }
      return count;
    });
    assert.equal(shieldCases, 64);
    assert.deepEqual(errors, []); report.devices[name] = { stages, prompt: 'once across levels and reload', shieldCases, errors };
    await page.close();
  }
  assert.equal(hash(), report.sha256);
  writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ sha256: report.sha256, devices: Object.keys(report.devices), errors: [] }));
} finally { await browser.close(); }
