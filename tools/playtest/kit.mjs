// Kit's reactions and touch controls at both phone sizes. Usage: node tools/playtest/kit.mjs <outDir>
// Env: PW_MODULE and PW_CHROMIUM, as in polish.mjs.
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { ART } from '../../src/vault-art.js';

const { chromium } = await import(process.env.PW_MODULE || 'playwright');
const OUT = process.argv[2] || 'out/kit-qa';
mkdirSync(OUT, { recursive: true });
assert.ok(ART.kit?.url, 'pack the rendered Kit assets before this playtest');
assert.ok(ART.kit.faces?.url, 'pack the Kit face portraits before this playtest');
assert.equal(ART.kit.cell, 168);
const poses = Object.keys(ART.kit.anims);
assert.equal(poses.length, 8);
const devices = { ios: { w: 393, h: 852, top: 59, bottom: 34 }, android: { w: 412, h: 915, top: 32, bottom: 24 } };
const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
const report = [];
try {
  for (const [dev, D] of Object.entries(devices)) {
    const page = await browser.newPage({ viewport: { width: D.w, height: D.h }, deviceScaleFactor: 2, hasTouch: true });
    const errors = [];
    page.on('pageerror', e => errors.push(String(e.stack || e)));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.addInitScript(({ url, faceUrl, cell, faceCell, poses }) => {
      window.__kitSeen = {};
      window.__kitFrames = {};
      window.__kitBodyDraws = 0;
      const drawImage = CanvasRenderingContext2D.prototype.drawImage;
      CanvasRenderingContext2D.prototype.drawImage = function (...args) {
        const result = drawImage.apply(this, args);
        const body = args[0]?.src === url, face = args[0]?.src === faceUrl;
        if (this.canvas.id === 'game' && body) window.__kitBodyDraws++;
        if (this.canvas.id === 'game' && (body || face) && args.length === 9) {
          const [img, sx, sy, , , x, y, w, h] = args;
          const pose = poses[body ? sy / cell : sx / faceCell], m = this.getTransform(), r = this.canvas.getBoundingClientRect();
          window.__kitSeen[pose] = (window.__kitSeen[pose] || 0) + 1;
          if (body) (window.__kitFrames[pose] ||= {})[sx / cell] = true;
          window.__kitDraw = { pose, type: body ? 'body' : 'face', decoded: img.complete && img.naturalWidth > 0,
            x: r.left + (m.a * x + m.c * y + m.e) * r.width / this.canvas.width,
            y: r.top + (m.b * x + m.d * y + m.f) * r.height / this.canvas.height,
            w: Math.abs(m.a * w) * r.width / this.canvas.width,
            h: Math.abs(m.d * h) * r.height / this.canvas.height };
        }
        return result;
      };
    }, { url: ART.kit.url, faceUrl: ART.kit.faces.url, cell: ART.kit.cell, faceCell: ART.kit.faces.cell, poses });
    await page.goto(`${pathToFileURL(resolve('dist/breach.html'))}?safe=${D.top},${D.bottom}`);
    await page.waitForFunction(() => window.__breach);
    const shot = name => page.screenshot({ path: `${OUT}/${dev}-${name}.png` });
    const poseShot = async (pose, name) => {
      await page.waitForFunction(pose => window.__kitDraw?.pose === pose, pose);
      const draw = await page.evaluate(() => window.__kitDraw);
      assert.ok(draw.decoded && draw.w > 20 && draw.h > 20, `${dev}: ${pose} uses rendered art`);
      assert.ok(draw.x >= 0 && draw.x + draw.w <= D.w && draw.y >= D.top && draw.y + draw.h <= D.h - D.bottom, `${dev}: ${pose} fits safe content bounds`);
      const paddleBottom = await page.evaluate(top => top + (window.__breach.level.paddle.y + window.__breach.level.paddle.h - 34) * innerWidth / 360, D.top);
      assert.ok(draw.y > paddleBottom, `${dev}: Kit stays below the ball and paddle`);
      await shot(name);
    };
    const touch = await page.context().newCDPSession(page);
    const finger = (type, x, y) => touch.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, radiusX: 4, radiusY: 4, force: 1 }] });
    await shot('00-menu');

    for (const [lv, name] of [[1, 'vault']]) {
      await page.evaluate(lv => { window.__breach.start(lv); window.__breach.level.skipIntro?.(); }, lv);
      await poseShot('Idle', `${name}-01-serve`);
      const fingerY = await page.evaluate(() => { const d = window.__kitDraw; return d.y + d.h / 2; });
      await finger('touchStart', D.w / 2, fingerY);
      await finger('touchMove', D.w / 2 + 45, fingerY);
      await page.waitForFunction(() => window.__breach.level.aim?.angle > 0.1);
      await finger('touchEnd');
      await page.waitForFunction(() => { const l = window.__breach.level; return !l.aim && l.balls.some(b => !b.caught && b.vx > 0 && b.vy < 0); });
      const before = await page.evaluate(() => window.__breach.level.paddle.x);
      await finger('touchStart', D.w / 2, fingerY);
      await finger('touchMove', D.w / 2 + 60, fingerY);
      await page.waitForFunction(before => window.__breach.level.paddle.x > before + 25, before);
      await finger('touchEnd');
      await page.waitForTimeout(1400);
      await shot(`${name}-02-live-play`);

      // A second-finger orb tap must leave the first finger's paddle drag in control.
      await page.evaluate(() => {
        const l = window.__breach.level, b = l.balls[0];
        l.aim = null; l.paddle.x = l.W / 2;
        l.balls = [b]; Object.assign(b, { x: l.W / 2, y: l.paddle.y - 90, vx: 0, vy: -150, caught: false, dead: false });
      });
      const orb = await page.evaluate(() => { const d = window.__kitDraw; return { x: d.x + d.w / 2, y: d.y + d.h / 2 }; });
      const points = x => [{ id: 0, x, y: fingerY, radiusX: 4, radiusY: 4, force: 1 }];
      const kitPoint = { id: 1, x: orb.x, y: orb.y, radiusX: 4, radiusY: 4, force: 1 };
      await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: points(D.w / 2) });
      await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [...points(D.w / 2), kitPoint] });
      await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [kitPoint] });
      assert.equal(await page.evaluate(() => window.__breach.level.ptr.down), true, `${dev}: orb release preserves paddle pointer`);
      const dragX = await page.evaluate(() => window.__breach.level.paddle.x);
      await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: points(D.w / 2 - 70) });
      await page.waitForFunction(x => window.__breach.level.paddle.x < x - 20, dragX);
      await finger('touchEnd');

      // Seed a descending ball; normal collision and a real held touch must trigger Focus.
      await finger('touchStart', D.w / 2, fingerY);
      await page.waitForTimeout(200);
      await page.evaluate(() => {
        const l = window.__breach.level, b = l.balls[0], p = l.paddle;
        l.aim = null; l.combo = 0; p.stun = 0; p.charge = 0; l.focus = 2;
        l.balls = [b]; Object.assign(b, { x: p.x + 15, y: p.y - 30, vx: 0, vy: 300, caught: false, dead: false, titan: 0, r: 6 });
      });
      await page.waitForFunction(() => window.__breach.level.aim && !window.__breach.level.aim.serve);
      await poseShot('Focus', `${name}-03-focus`);
      await finger('touchMove', D.w / 2 - 35, fingerY);
      await page.waitForTimeout(60);
      await finger('touchEnd');
      assert.equal(await page.evaluate(() => window.__breach.level.focus), 1, `${dev}: Focus release spends one pip`);
      assert.equal(await page.evaluate(() => window.__breach.level.aim), null);

      // Vault keeps its earned charge for Ward on an ordinary centre return.
      await page.evaluate(() => {
        const l = window.__breach.level, b = l.balls[0], p = l.paddle;
        p.charge = 1; Object.assign(b, { x: p.x, y: p.y - 30, vx: 0, vy: 300, caught: false, titan: 0 });
      });
      await page.waitForFunction(() => window.__breach.level.balls.some(b => !b.caught && b.vy < 0));
      assert.equal(await page.evaluate(() => window.__breach.level.paddle.charge), 1, `${dev}: centre return reserves Ward charge`);
      assert.equal(await page.evaluate(() => window.__breach.level.balls.some(b => b.titan > 0)), false);
      await shot(`${name}-04-ward-ready`);
      // Isolated expression fixture; Vault does not grant Titan through Kit.
      await page.evaluate(() => { window.__breach.level.balls[0].titan = 1; });
      await poseShot('Laugh', `${name}-04b-laugh-expression-fixture`);
      await page.evaluate(() => { const l = window.__breach.level; l.balls.forEach(b => { b.titan = 0; b.r = 6; b.caught = true; }); l.paddle.stun = 1; });
      await poseShot('Hurt', `${name}-05-hurt`);
      await page.evaluate(() => { const l = window.__breach.level; l.paddle.stun = 0; for (let i = 0; i < 5; i++) l.brokeBrick(); });
      await poseShot('Grin', `${name}-06-combo`);
      const charge = await page.evaluate(() => {
        const l = window.__breach.level;
        const charge = l.paddle.charge; l.kitTime = l.kitBodyUntil + 0.2; return charge;
      });
      await page.waitForFunction(() => window.__kitDraw?.type === 'face');
      assert.equal(await page.evaluate(() => window.__breach.level.paddle.charge), charge, `${dev}: receding body does not spend charge`);
      await shot(`${name}-06b-face-after-presence`);
      await page.evaluate(() => {
        const l = window.__breach.level;
        if (l.snake) { l.snake.cost = l.snakeStart * 0.25; l.snake.stun = 2; }
        else l.grid.oy = l.dangerY - l.grid.rows * l.grid.ch - 25;
      });
      await poseShot('Worried', `${name}-07-danger`);

      // A fresh run avoids the seeded high-danger setup influencing loss/continue.
      await page.evaluate(lv => {
        window.__breach.start(lv); window.__breach.level.skipIntro?.();
      }, lv);
      await page.waitForFunction(() => window.__breach.level.phase !== 'intro');
      await page.evaluate(() => {
        const l = window.__breach.level; l.lives = 1; l.aim = null;
        Object.assign(l.balls[0], { caught: false, x: l.left + 8, y: l.drainY + 12, vx: 0, vy: 300 });
      });
      await page.waitForFunction(() => window.__breach.level.state === 'lost');
      await poseShot('Shock', `${name}-08-loss`);
      await page.waitForTimeout(1200);
      await shot(`${name}-09-continue`);
      const continueY = await page.evaluate(({ top, scale }) => top + ((window.__breach.level.H - 34) / 2 + 19) * scale, { top: D.top, scale: D.w / 360 });
      await finger('touchStart', D.w / 2, continueY); await finger('touchEnd');
      await page.waitForFunction(() => window.__breach.level.state === 'play', null, { timeout: 6000 });
      assert.ok(await page.evaluate(() => window.__breach.level.balls.some(b => b.caught)), `${dev}: continue supplies a fresh serve`);
      await shot(`${name}-10-resumed`);

      // Exercise each level's completion path without replaying a whole chapter.
      await page.evaluate(() => {
        const l = window.__breach.level;
        if (l.snake) { l.phase = 'frenzy'; l.frenzyT = 0; }
        else { l.startBoss(); l.hitBoss(100, l.boss.x, l.boss.y); }
      });
      await page.waitForFunction(() => window.__breach.level.state === 'won');
      await page.waitForTimeout(1700);
      await poseShot('Cheer', `${name}-11-win`);
    }
    const [seen, animatedFrames] = await page.evaluate(() => [window.__kitSeen, Object.fromEntries(Object.entries(window.__kitFrames).map(([clip, frames]) => [clip, Object.keys(frames).map(Number)]))]);
    for (const pose of poses) assert.ok(seen[pose] > 0, `${dev}: rendered ${pose} crop observed`);
    assert.equal(await page.evaluate(() => window.__kitBodyDraws), 0, `${dev}: Kit always remains a face icon`);
    assert.deepEqual(errors, [], `${dev}: no browser errors`);
    report.push({ device: dev, viewport: `${D.w}x${D.h}`, safe: [D.top, D.bottom], deviceScaleFactor: 2, errors, renderedPoses: Object.keys(seen), animatedFrames, checks: ['Vault touch serve and central drag', 'secondary orb tap preserves primary paddle drag', 'stationary touch Focus catch and release', 'Vault centre return reserves Ward charge', 'face icon remains visible without spending charge', 'life drain and ad continue', 'seeded frenzy completion', 'all eight rendered face crops inside safe bounds; Laugh is an isolated expression fixture; zero body replacements'] });
    await page.close();
  }
  writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally { await browser.close(); }
