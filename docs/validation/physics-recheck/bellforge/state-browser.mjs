import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const { chromium } = await import(process.env.PW_MODULE || 'playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:4194', out = process.env.OUT_DIR || 'out/physics-recheck/bellforge/states';
fs.mkdirSync(out, { recursive: true });
const files = ['src/fantasy/bellforge.js', 'prototypes/fantasy/main.js', 'prototypes/fantasy/render.js', 'prototypes/fantasy/layout.js'];
const seal = () => Object.fromEntries(files.map(p => [p, crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]));
const report = { scope: 'Explicitly staged loss/progress fixtures in the real standalone page; final-life ball is physically drained, and an actual bell crosses the dock for the danger-stop loss. Actual touch Continue and Retry. No earned outcome claim.', before: seal(), cases: [], complete: false };
for (const [device, width, height] of [['ios', 393, 852], ['android', 412, 915]]) {
  const browser = await chromium.launch({ args: ['--mute-audio'], ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width, height }, hasTouch: true, deviceScaleFactor: 1 }), errors = [], http = [];
    page.on('pageerror', e => errors.push(String(e))); page.on('response', r => { if (r.status() >= 400) http.push([r.status(), r.url()]); });
    await page.addInitScript(() => { requestAnimationFrame = f => { window.__stateFrame = f; return 1; }; });
    await page.goto(`${base}/prototypes/fantasy/?level=bellforge`);
    await page.waitForFunction(() => !document.getElementById('start').disabled && window.__stateFrame, null, { polling: 50 });
    await page.evaluate(() => { let now = performance.now(); window.BQ = { advance(s) { for (let n = Math.ceil(s * 60); n > 0; n--) __stateFrame(now += 1000 / 60); }, snap() { return JSON.stringify(fantasyGame, (_, v) => v instanceof Set ? [...v] : v); } }; });
    const tap = async id => { await page.locator(id).tap(); await page.waitForTimeout(20); };
    await tap('#start');
    const progress = await page.evaluate(() => {
      const g = fantasyGame; g.launch(); const pin = g.bricks.find(b => b.rampId);
      g.hitBrick(pin, g.balls[0]); g.hitBrick(pin, g.balls[0]); g.hitVillain(5, false);
      for (let i = 0; i < 120; i++) g.update(1 / 120);
      g.lumi.steps = 3; g.lumi.y = g.lumi.targetY = g.lumi.baseY + 36; g.charge = 42; g.chargeBank = 1;
      g.bells = []; g.lives = 1; Object.assign(g.balls[0], { y: g.height + 7, vy: 345 });
      return { hp: g.villain.hp, score: g.score, pin: pin.id, angle: g.ramps[0].angle, charge: g.charge, bank: g.chargeBank };
    });
    await page.evaluate(() => BQ.advance(.05));
    assert.equal(await page.evaluate(() => fantasyGame.state), 'lost'); assert.equal(await page.locator('#result').isVisible(), true);
    const lost = await page.evaluate(() => BQ.snap()); await page.evaluate(() => BQ.advance(1)); assert.equal(await page.evaluate(() => BQ.snap()), lost);
    await page.screenshot({ path: `${out}/${device}-loss-staged.png` });
    await tap('#continue'); await page.evaluate(() => BQ.advance(1 / 60));
    const continued = await page.evaluate(pin => { const g = fantasyGame; return { state: g.state, phase: g.phase, hp: g.villain.hp, score: g.score, pinHP: g.bricks.find(b => b.id === pin).hp,
      angle: g.ramps[0].angle, steps: g.lumi.steps, lives: g.lives, charge: g.charge, bank: g.chargeBank, continued: g.continued, grace: g.nextWarning - g.time }; }, progress.pin);
    assert.equal(continued.state, 'play'); assert.equal(continued.phase, 'serve'); assert.equal(continued.hp, progress.hp); assert.equal(continued.score, progress.score);
    assert.equal(continued.pinHP, 0); assert.equal(continued.angle, progress.angle); assert.equal(continued.steps, 1); assert.equal(continued.lives, 2);
    assert.equal(continued.continued, true); assert(continued.grace > 2.9); assert(continued.charge >= progress.charge && continued.charge < progress.charge + .2);
    assert(continued.bank <= progress.bank && continued.bank > progress.bank - .03);
    await page.screenshot({ path: `${out}/${device}-continue-staged.png` });
    await tap('#pause'); await tap('#retry');
    assert.deepEqual(await page.evaluate(() => [fantasyGame.phase, fantasyGame.continued, fantasyGame.villain.hp, fantasyGame.charge, fantasyGame.score]), ['serve', false, 24, 0, 0]);
    await page.evaluate(() => {
      const g = fantasyGame; g.launch(); g.ramps = []; g.lumi.steps = 7; g.lumi.y = g.lumi.targetY = g.lumi.baseY + 84;
      const bell = g.releaseBell(false); Object.assign(bell, { x: 310, px: 310, y: 297.8, py: 297.8, vx: 0, vy: 250 }); BQ.advance(.05);
    });
    assert.equal(await page.evaluate(() => fantasyGame.phase), 'breach'); assert.equal(await page.evaluate(() => fantasyGame.state), 'play');
    await page.evaluate(() => BQ.advance(.5)); assert.equal(await page.evaluate(() => fantasyGame.state), 'lost');
    assert.equal(await page.evaluate(() => fantasyGame.reason), 'Lift reached the danger stop');
    report.cases.push({ device, pass: true, lostFreeze: true, actualTouchContinue: true, preservedProgress: progress, continued, freshRetry: true, physicalDockLoss: true, errors, http });
    assert.deepEqual(errors, []); assert.deepEqual(http, []); console.log('PASS', device, 'loss/Continue/Retry/dock');
  } finally { await browser.close(); }
}
report.after = seal(); assert.deepEqual(report.after, report.before); report.complete = true;
fs.writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 2) + '\n');
