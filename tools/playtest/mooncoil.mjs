import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const { chromium } = await import(process.env.PW_MODULE || 'playwright');
const [out = 'out/mooncoil', html = 'out/mooncoil-preview/breach.html'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const report = { scope: 'Actual Main phone touch and staged mechanism/ending fixtures; not earned victories or physical handset tests.', sha256: crypto.createHash('sha256').update(fs.readFileSync(html)).digest('hex'), devices: [] };
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || process.env.BROWSER_EXECUTABLE, args: ['--mute-audio'] });
try {
  for (const [name, width, height, safe] of [['ios',393,852,'59,34'],['android',412,915,'32,24']]) {
    const page = await browser.newPage({ viewport: { width, height }, hasTouch: true, deviceScaleFactor: 1 });
    const errors = []; page.on('pageerror', e => { errors.push(e.message); console.error(e.message); });
    await page.addInitScript(() => { requestAnimationFrame = f => { window.nextFrame = f; return 1; }; localStorage.setItem('breach.tutDone', 'true'); });
    await page.goto((process.env.PLAYTEST_URL || pathToFileURL(resolve(html)).href) + `?level=6&difficulty=easy&safe=${safe}`);
    await page.waitForFunction(() => __breach?.ready && window.nextFrame, null, { timeout: 60000, polling: 50 });
    await page.evaluate(() => {
      window.clock = performance.now();
      window.paint = () => { const l = __breach.level, update = l.update; l.update = () => {}; nextFrame(clock += 17); l.update = update; };
      window.tick = (seconds) => { for (let i = 0; i < seconds * 120; i++) __breach.level.update(1/120); paint(); };
    });
    // ?level= opens the chapter's purpose card first: the chapter is frozen behind it until a real tap starts it.
    assert.equal(await page.evaluate(() => __breach.purpose?.id), 'mooncoil');
    await page.evaluate(() => { for (let i = 0; i < 30; i++) paint(); });
    await page.screenshot({ path: `${out}/${name}-purpose.png` });
    await page.touchscreen.tap(width / 2, height / 2); await page.evaluate(() => paint());
    assert.equal(await page.evaluate(() => __breach.purpose), null, 'a tap dismisses the purpose card');
    await page.evaluate(() => tick(2.6));
    await page.screenshot({ path: `${out}/${name}-play.png` });
    const checks = await page.evaluate(() => {
      const l = __breach.level;
      const result = { name: l.name, phase: l.phase, paddleY: l.paddle.y, clearance: l.paddle.y - 416, cageHP:l.cageHP, prisonX:l.prisonX, floorY:l.floorY };
      const br = l.bricks.find(b => l.bankFor(b.c,b.r) === 2);
      l.removeBrick(br, null); result.enemyCageDamage = result.cageHP - l.cageHP;
      l.paddle.charge = 1; l.activateCorePower(); paint();
      return result;
    });
    assert.equal(checks.enemyCageDamage, 0); assert(checks.clearance >= 80);
    await page.waitForTimeout(220); await page.evaluate(()=>paint());
    await page.screenshot({ path: `${out}/${name}-powers.png` });
    // Touch the first visible power card using the same responsive layout as Main.
    const position = await page.evaluate(() => {
      const l = __breach.level, s = l.kitUIScale, h = 122 / s, a = l.kitAnchor(), y = a.y - a.r - h - 8/s;
      const r = document.getElementById('game').getBoundingClientRect();
      // Main's query inset is explicit on these fixtures.
      const st = +new URLSearchParams(location.search).get('safe').split(',')[0];
      return { x: r.left + (12/s + 12/s + 40/s) * s, y: r.top + (y + 72/s - 34) * s + st };
    });
    await page.touchscreen.tap(position.x, position.y);
    const cast = await page.evaluate(() => ({ active: __breach.level.moonbindT, charge: __breach.level.paddle.charge, menu: __breach.level.powerMenuOpen }));
    assert.equal(cast.active, 7); assert.equal(cast.charge, 0); assert.equal(cast.menu, false);
    const mechanisms = await page.evaluate(() => {
      __breach.start(5); const l = __breach.level; tick(2.6);
      l.paddle.charge = 1; l.activateCorePower(); const crystalAccepted = l.chooseSpacePower('ricochet');
      tick(.3);
      const crystalCount = l.crystals.length, crystalPositions = l.crystals.map(b => ({ x:b.x,y:b.y,vx:b.vx,vy:b.vy }));
      const creditBefore = l.paddle.charge; tick(2);
      const crystalDoesNotCharge = l.paddle.charge === creditBefore;
      // Staged direct contacts exercise the real broad cage damage and escape path.
      const hp = l.cageHP;
      for (let i=0;i<hp;i++) { l.update(1/120); l.hitBars({x:l.prisonX,y:l.floorY,vx:0,vy:-300,shot:true}); }
      const phase = l.phase; tick(15);
      return { crystalAccepted, crystalCount, crystalPositions, crystalDoesNotCharge, cageHP:l.cageHP, phase, final:l.state, retreatDone:l.retreatPose()?.done };
    });
    assert(mechanisms.crystalAccepted); assert.equal(mechanisms.crystalCount, 2); assert(mechanisms.crystalDoesNotCharge);
    assert.equal(mechanisms.cageHP,0);
    console.log(JSON.stringify(mechanisms)); assert.equal(mechanisms.final, 'won'); assert(mechanisms.retreatDone);
    await page.screenshot({ path: `${out}/${name}-rescued.png` });
    const frost = await page.evaluate(() => {
      __breach.start(5); tick(2.6); const l=__breach.level, h=l.snakePoints()[0];
      const br=l.bricks.filter(b=>b.kind===3).sort((a,b)=>Math.hypot(a.x-h.x,a.y-h.y)-Math.hypot(b.x-h.x,b.y-h.y))[0];
      l.removeBrick(br,{x:br.x,y:br.y,vx:0,vy:-300,shot:true});
      const active=l.moonPulseT, reached=l.moonPulses.at(-1)?.reached; tick(2);
      return {active,reached,expired:l.moonPulseT===0};
    });
    assert.equal(frost.active,1.6); assert(frost.reached); assert(frost.expired);
    await page.evaluate(() => { __breach.start(5); tick(2.6); });
    await page.touchscreen.tap(25, +safe.split(',')[0] + 20);
    assert.equal(await page.evaluate(()=>__breach.scene), 'pause');
    await page.evaluate(()=>paint());
    const retry = await page.evaluate(() => { const l=__breach.level,s=l.kitUIScale;return {x:180*s,y:(l.H-34)/2*s+20*s+(+new URLSearchParams(location.search).get('safe').split(',')[0])}; });
    await page.touchscreen.tap(retry.x,retry.y);
    assert.equal(await page.evaluate(()=>__breach.scene),'level');
    assert.equal(await page.evaluate(()=>__breach.level.cageHP),6);
    const noInput = await page.evaluate(() => { tick(240); const l=__breach.level; return {state:l.state, phase:l.phase, time:l.t, eaten:l.snake.eaten}; });
    assert.equal(noInput.state, 'lost');
    assert.deepEqual(errors, []);
    report.devices.push({ name, checks, cast, mechanisms, pauseRetry:true, frost, noInput, errors });
    await page.close();
  }
  report.pass = true;
} finally {
  fs.writeFileSync(`${out}/report.json`,JSON.stringify(report,null,2)+'\n');
  await browser.close();
}
console.log(JSON.stringify(report));


