// Actual bundled Boarding Raid input/lifecycle checks. All resource/terminal setup is explicitly staged.
// node tools/playtest/boarding.mjs <out> [html]; PW_MODULE/PW_CHROMIUM match the other phone suites.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(process.env.PW_MODULE || 'playwright');
const [OUT = 'out/boarding-review/final', HTML = 'dist/breach.html'] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const hash = p => createHash('sha256').update(readFileSync(p)).digest('hex');
const report = { htmlSHA256: hash(HTML), scope: 'Actual main bundle; real browser mouse/touch/key routing with staged charge/terminal fixtures. Lifecycle events are browser-handler simulations, not Android execution. Earned run, if supplied separately, must not use these fixtures.', devices: {} };
for (const p of ['src/carrier.js', 'src/main.js', 'src/arena.js', 'src/space-companions.js']) report[p] = hash(p);
const browser = await chromium.launch({ ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}), args: ['--mute-audio'] });
try {
  for (const [name, D] of Object.entries({ ios: { width: 393, height: 852, top: 59, bottom: 34 }, android: { width: 412, height: 915, top: 32, bottom: 24 } })) {
    const page = await browser.newPage({ viewport: D, deviceScaleFactor: 2, hasTouch: true }), errors = [];
    page.on('pageerror', e => errors.push(e.stack || e.message));
    await page.addInitScript(() => {
      window.requestAnimationFrame = fn => { window.__nextFrame = fn; return 1; };
      // Observe the actual sprite draws without changing images, draw state or gameplay.
      window.__companionDraws = [];
      const draw = CanvasRenderingContext2D.prototype.drawImage;
      CanvasRenderingContext2D.prototype.drawImage = function (...a) {
        const result = draw.apply(this, a), img = a[0];
        if (this.canvas.id === 'game' && a.length === 9 && ((img.naturalWidth === 1024 && img.naturalHeight === 768) || (img.naturalWidth === 768 && img.naturalHeight === 384))) {
          const m = this.getTransform(), r = this.canvas.getBoundingClientRect(), [, sx, sy, sw, sh, x, y, w, h] = a;
          window.__companionDraws.push({ family: sw === 256 ? 'nix' : 'tick', frame: sx / sw + sy / sh * 4, x: r.left + (m.a * x + m.c * y + m.e) * r.width / this.canvas.width, y: r.top + (m.b * x + m.d * y + m.f) * r.height / this.canvas.height, w: Math.abs(m.a * w) * r.width / this.canvas.width, h: Math.abs(m.d * h) * r.height / this.canvas.height });
          if (window.__companionDraws.length > 500) window.__companionDraws.splice(0, 200);
        }
        return result;
      };
      // Continue button fixture uses the existing free entitlement; no purchase/ad is exercised.
      localStorage.setItem('breach.unlocked', 'true');
    });
    await page.goto(`${pathToFileURL(resolve(HTML)).href}?safe=${D.top},${D.bottom}`);
    await page.waitForFunction(() => window.__breach && window.__nextFrame, null, { polling: 50 });
    await page.evaluate(async () => { await document.fonts.load('18px "Lilita One"'); await document.fonts.load('600 16px Rubik'); await document.fonts.ready; });
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      let now = performance.now();
      const frames = (n = 1) => { now = Math.max(now, performance.now()); for (let i = 0; i < n; i++) __nextFrame(now += 1000 / 60); };
      const fresh = () => { __breach.start(0); frames(2); return __breach.level; };
      const state = () => { const l = __breach.level; return { state: l.state, phase: l.phase, clock: l.clock, t: l.t, serveAge: l.serveAge, lives: l.lives, aim: !!l.aim, charge: l.paddle.charge, castAt: l.coreCastAt, keys: { ...l.keys }, ptr: l.ptr.down, balls: l.balls.map(b => ({ x: b.x, y: b.y, vx: b.vx, vy: b.vy, caught: !!b.caught, r: b.r, titan: b.titan || 0 })) }; };
      const full = () => { const l = fresh(); for(let i=0;i<l.coreHits;i++){const b=l.bricks[i];l.hitTarget(b?.id||'carrier',{x:b?.art.rect.x||180,y:b?.art.rect.y||180,r:l.ballRadius});}l.updateCoreCharge(l.coreHits);l.hitStop = 0; frames(1); return state(); };
      window.BQ = { frames, fresh, state, full };
    });
    const ev = (fn, arg) => page.evaluate(fn, arg), shot = file => page.screenshot({ path: `${OUT}/${name}-${file}.png` });
    const frame = n => ev(n => BQ.frames(n), n);
    const fresh = () => ev(() => { BQ.fresh(); return BQ.state(); });
    const orb = () => ev(top => { const l = __breach.level, a = l.kitAnchor(), s = l.kitUIScale; return { x: a.x * s, y: top + (a.y - 34) * s, diameter: a.r * 2 * s }; }, D.top);
    const finger = await page.context().newCDPSession(page);
    const touch = (type, x = 0, y = 0) => finger.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' || type === 'touchCancel' ? [] : [{ id: 31, x, y, radiusX: 3, radiusY: 3, force: 1 }] });
    const result = { stagedResourceSetup: 'Mode-budget accepted panel/hull hitTarget credits and explicit clock-only bank drain; not an earned-input/timing claim', checks: [] };
    const save = () => { report.devices[name] = { ...result, errors }; writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2)); };
    try {
      await fresh(); await shot('00-opening');
      const a = await orb(); assert(Math.abs(a.diameter - 52) < .01); assert(a.x >= 26 && a.y + 26 <= D.height - D.bottom);
      const y = D.height - D.bottom - 26;
      await touch('touchStart', D.width / 2, y); await touch('touchMove', D.width / 2 + 35, y); await frame(5);
      assert(await ev(() => __breach.level.aim?.angle > .1)); await shot('01-real-touch-aim');
      await touch('touchEnd'); await frame(3); assert(await ev(() => !__breach.level.aim));
      await touch('touchStart', D.width / 2, y); await touch('touchMove', D.width / 2 - 60, y); await frame(8);
      assert(await ev(() => __breach.level.paddle.x < 150)); await touch('touchEnd');
      result.checks.push('Actual browser touch aims, releases and drags the paddle');

      await ev(() => BQ.full()); await shot('02-staged-nix-ready');
      await touch('touchStart', a.x, a.y); await touch('touchEnd'); await frame(1);
      assert(await ev(() => __breach.level.powerMenuOpen && __breach.level.paddle.charge === 1));
      await page.keyboard.press('2'); await frame(1);
      let cast = await ev(() => BQ.state()); assert.equal(cast.charge, 0); assert(cast.balls.some(b => b.titan > 6.9 && b.r === 10)); assert(cast.aim);
      const castAt = cast.castAt; await shot('03-real-nix-command');
      result.commandMotion = [];
      for (let i = 0; i < 6; i++) {
        if (i) await frame(6);
        const pose = await ev(() => __companionDraws.filter(d => d.family === 'nix').at(-1));
        const file = `${name}-03-nix-motion-${i}.png`; await page.screenshot({ path: `${OUT}/${file}` });
        result.commandMotion.push({ file, ...pose });
      }
      result.commandFrames = await ev(() => __companionDraws.filter(d => d.family === 'nix').map(d => d.frame));
      // Screenshots are wall-time-spaced samples; the passive draw log proves every
      // command cell rendered even when a screenshot spans the next10fps cell.
      for (const n of [6, 7, 8, 9, 10, 0]) assert(result.commandFrames.includes(n), `actual packed Nix command frame${n} draws after the real selection`);
      await touch('touchStart', a.x, a.y); await touch('touchEnd'); await page.keyboard.press('k'); await frame(2);
      cast = await ev(() => BQ.state()); assert.equal(cast.castAt, castAt); assert.equal(cast.balls.filter(b => b.titan > 0).length, 1);
      result.checks.push('Full-charge face tap opens the chooser; deliberate UNSTOPPABLE selection spends once, preserves caught aim, and repeated tap/K does not refresh or duplicate TITAN');

      await ev(() => BQ.full()); await touch('touchStart', a.x, a.y); await touch('touchMove', a.x + 12, a.y); await touch('touchEnd'); await frame(1);
      assert.equal(await ev(() => __breach.level.paddle.charge), 1);
      await touch('touchStart', a.x, a.y); await touch('touchCancel'); await frame(1); assert.equal(await ev(() => __breach.level.paddle.charge), 1);
      await touch('touchStart', a.x + 55, a.y); await touch('touchMove', a.x, a.y); await touch('touchEnd'); await frame(1);
      assert.equal(await ev(() => __breach.level.paddle.charge), 1);
      await page.keyboard.press('k'); await frame(1);assert(await ev(() => __breach.level.powerMenuOpen && __breach.level.paddle.charge === 1));
      await page.keyboard.press('2');await frame(1);assert.equal(await ev(() => __breach.level.paddle.charge), 0);
      result.checks.push('Moved/cancelled orb presses and a drag crossing from outside cannot spend; deliberate K plus a choice can');

      const split = await ev(() => { const l = BQ.fresh(); l.paddle.charge = 1; l.activateCorePower(); l.chooseSpacePower('titan'); l.release(); l.applyPower('split'); return l.balls.map(b => ({ r: b.r, titan: b.titan || 0 })); });
      assert.equal(split.filter(b => b.titan > 0).length, 1); assert.equal(split.length, 3); assert(split.filter(b => !b.titan).every(b => b.r === 7.5));
      result.checks.push('Staged SPLIT after one manual TITAN produces ordinary7.5u children');

      // A real second touch pauses while both mouse and Space are held. Release events after resume must stay cancelled.
      await fresh(); await page.mouse.move(D.width / 2, y); await page.mouse.down(); await page.keyboard.down('Space'); await frame(4);
      await touch('touchStart', 22, D.top + 22); await touch('touchEnd'); await frame(1);
      assert.equal(await ev(() => __breach.scene), 'pause', 'pause icon opens resumable pause');
      const paused = await ev(() => BQ.state());
      await page.keyboard.press('k'); await page.keyboard.press('ArrowLeft');
      await touch('touchStart', a.x, a.y); await touch('touchEnd');
      await frame(180); assert.deepEqual(await ev(() => BQ.state()), paused);
      await shot('04-paused-held-input');
      // Current three-button pause Resume: world(70,H/2-62,220,48), before the level's34u lift.
      const resume = await ev(top => { const l = __breach.level, s = l.kitUIScale; return { x: 180 * s, y: top + ((l.H - 34) / 2 - 38) * s }; }, D.top);
      await touch('touchStart', resume.x, resume.y); await touch('touchEnd'); await frame(1);
      assert.equal(await ev(() => __breach.scene), 'level'); await page.mouse.up(); await page.keyboard.up('Space'); await frame(2);
      const resumed = await ev(() => BQ.state()); assert(resumed.aim && resumed.balls[0].caught); assert(!resumed.ptr && !resumed.keys[' ']);
      result.checks.push('Real second-touch pause freezes all world/serve state, preserves identity/aim, clears held inputs and consumes stale releases');

      // Browser lifecycle handler simulation; page visibility state is injected, not claimed as an OS background event.
      for (const kind of ['blur', 'visibility']) {
        await fresh(); await ev(kind => {
          if (kind === 'blur') dispatchEvent(new Event('blur'));
          else { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' }); document.dispatchEvent(new Event('visibilitychange')); }
        }, kind);
        const before = await ev(() => BQ.state()); await frame(240); assert.deepEqual(await ev(() => BQ.state()), before);
        await ev(kind => { if (kind === 'blur') dispatchEvent(new Event('focus')); else { Object.defineProperty(document, 'hidden', { configurable: true, value: false }); Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' }); document.dispatchEvent(new Event('visibilitychange')); } }, kind);
        assert.equal(await ev(() => __breach.scene), 'pause', 'return from background requires explicit safe resume');
        await touch('touchStart', resume.x, resume.y); await touch('touchEnd'); await frame(2); assert.equal(await ev(() => __breach.scene), 'level');
      }
      result.checks.push('Synthetic blur/visibility handlers freeze active-real clocks and require explicit resume with no catch-up');

      result.tick = [];
      for (let index = 0; index < 5; index++) {
        const tickTarget = await ev(index => {
          const l = BQ.fresh(); l.release(); l.aim = null; const c = l.crew[index], b = l.balls[0];
          // Labelled composition fixture: a parked ordinary ball beside Tick, with every neighbour intact.
          Object.assign(b, { caught: true, x: Math.min(l.right - 8, c.art.rect.x + c.art.rect.w / 2 + 27), y: c.art.rect.y - 17 });
          while (c.hp > 0) l.hitTarget(c.id, {}); l.hitStop = 0; __companionDraws = []; return { id: c.id, rect: c.art.rect };
        }, index);
        await frame(19); await shot(`05-staged-tick-${index}-clamp`); await frame(35); await shot(`06-staged-tick-${index}-secured`);
        const tick = await ev(id => { const l = __breach.level, c = l.crew.find(c => c.id === id); return { hp: c.hp, secured: c.secured, securedAt: c.securedAt, frames: __companionDraws.filter(d => d.family === 'tick'), nix: __companionDraws.filter(d => d.family === 'nix') }; }, tickTarget.id);
        assert.equal(tick.hp, 0); assert(tick.secured); assert(tick.frames.length > 0); assert(new Set(tick.frames.map(d => d.frame)).size >= 6);
        assert(tick.nix.some(d => d.frame === 3), 'actual Nix raster reacts to a secured worker');
        await frame(24); await shot(`06b-staged-tick-${index}-persistent-latch`);
        assert(await ev(id => { const l = __breach.level, c = l.crew.find(c => c.id === id); return c.secured && l.clock - c.releasedAt > 1.1; }, tickTarget.id));
        result.tick.push({ target: tickTarget, ...tick });
      }
      result.checks.push('All five actual packed Tick fixtures move through six or more secure frames, retain a latch, keep a nearby ordinary ball readable and trigger Nix secured reaction');

      // Staged loss and actual free-Continue button. Earned HP/crew state is retained across the input action.
      const warning = await ev(() => { const l = BQ.fresh(); l.release(); l.aim = null; l.balls[0].caught = true; for (const g of l.guns) g.hp = 0; for (const b of l.bricks) b.hp = 0; l.crew[4].hp = 0; l.crew[4].releasedAt = 0; l.crew[4].secured = true; l.crew[4].securedAt = .8; for (let i = 0; i < 8000 && l.state === 'play' && l.raid?.stage !== 'extract'; i++) l.update(1 / 120); BQ.frames(2); return { state: l.state, stage: l.raid?.stage, frames: __companionDraws.filter(d => d.family === 'nix').map(d => d.frame) }; });
      assert.equal(warning.stage, 'extract'); assert(warning.frames.includes(2)); await shot('07a-staged-nix-warning');
      const terminal = await ev(() => { const l = __breach.level; for (let i = 0; i < 1500 && l.state === 'play'; i++) l.update(1 / 120); BQ.frames(75); return { ...BQ.state(), crew: l.inspect().crew }; });
      assert.equal(terminal.state, 'lost'); await shot('07-staged-capture-continue');
      await ev(() => dispatchEvent(new Event('blur'))); const lostFrozen = await ev(() => BQ.state()); await frame(660); assert.deepEqual(await ev(() => BQ.state()), lostFrozen);
      await ev(() => dispatchEvent(new Event('focus'))); await frame(1);
      // Existing free-Continue fixture panel:280u high, button centreH/2+44u.
      const continueButton = await ev(top => { const l = __breach.level, s = l.kitUIScale; return { x: 180 * s, y: top + ((l.H - 34) / 2 + 44) * s }; }, D.top);
      await touch('touchStart', continueButton.x, continueButton.y); await touch('touchEnd'); await frame(2);
      const continued = await ev(() => ({ ...BQ.state(), crew: __breach.level.inspect().crew }));
      assert.equal(continued.state, 'play'); assert(continued.aim && continued.balls.length === 1 && continued.balls[0].caught); assert(continued.crew.every(c => !c.captured)); assert.equal(continued.crew[4].hp, 0); assert(continued.crew[4].secured);
      await shot('08-real-continue'); result.checks.push('Backgrounded loss/Continue remains frozen; real Continue retains rescued crew and restores one caught serve');

      // Default ad Continue also needs both active presentation time and its async reward; background wall time alone is insufficient.
      await ev(() => { localStorage.removeItem('breach.unlocked'); const l = BQ.fresh(); l.fail('Staged ad-timer lifecycle fixture'); BQ.frames(75); });
      const adButton = await ev(top => { const l = __breach.level, s = l.kitUIScale; return { x: 180 * s, y: top + ((l.H - 34) / 2 + 19) * s }; }, D.top);
      await touch('touchStart', adButton.x, adButton.y); await touch('touchEnd'); await frame(1);
      await ev(() => dispatchEvent(new Event('blur'))); await page.waitForTimeout(3200); await frame(240);
      assert.equal(await ev(() => __breach.level.state), 'lost', 'background reward callback cannot bypass active ad time');
      await shot('09-staged-background-ad'); await ev(() => dispatchEvent(new Event('focus'))); await frame(185);
      assert.equal(await ev(() => __breach.level.state), 'play'); assert(await ev(() => __breach.level.aim?.serve));
      result.checks.push('Default ad Continue waits for active presentation time as well as the async reward; background wall time cannot resume the game');
      const draws = await ev(() => __companionDraws);
      result.companionDraws = draws;
      assert(draws.some(d => d.family === 'nix'), 'packed Nix raster actually draws');
      assert(draws.filter(d => d.family === 'nix').every(d => d.x >= 0 && d.x + d.w <= D.width + .1 && d.y >= D.top && d.y + d.h <= D.height - D.bottom + .1));
      assert.deepEqual(errors, []); save(); console.log(name, result.checks.length, 'input/lifecycle groups passed');
    } catch (e) { result.failure = e.stack || String(e); await shot('FAILURE'); save(); throw e; }
    finally { await page.close(); }
  }
  assert.equal(hash(HTML), report.htmlSHA256, 'tested bundle remained frozen'); report.completed = true; writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
} finally { await browser.close(); }
