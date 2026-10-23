// Dragon's Hoard (chapter 12, ?level=12) review screenshots: every floor at serve and mid-play, Ember's reactions, the
// greed card, the greedy stay, the avalanche and the escape; plus an optional collider-vs-art overlay.
// Usage: PW_MODULE=/opt/node22/lib/node_modules/playwright/index.mjs node tools/playtest/hoard-review.mjs <out> [html] [overlay]
// ONLY=393 or ONLY=412 limits the phone size. A trailing frame-time line reports the cost of drawing a busy floor-3 frame.
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
const { chromium } = await import(process.env.PW_MODULE || "playwright");
const [OUT = "out/hoard", HTML = "dist/breach.html", OVERLAY = ""] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
const errors = [];
try {
  for (const d of [{ width: 393, height: 852, safe: "59,34" }, { width: 412, height: 915, safe: "32,24" }].filter((d) => !process.env.ONLY || String(d.width) === process.env.ONLY)) {
    const page = await browser.newPage({ viewport: { width: d.width, height: d.height }, deviceScaleFactor: 2, hasTouch: true });
    page.on("pageerror", (e) => errors.push(`${d.width}x${d.height}: ${e.message}`));
    await page.addInitScript(() => { window.requestAnimationFrame = (fn) => { window.__nextFrame = fn; return 1; }; });
    await page.goto(pathToFileURL(resolve(HTML)).href + `?safe=${d.safe}`);
    await page.waitForFunction(() => window.__breach?.ready && window.__nextFrame, null, { timeout: 60000, polling: 250 });
    await page.evaluate(async (overlay) => {
      await document.fonts.ready;
      let clock = performance.now();
      const L = () => __breach.level, M = () => __breach.level.m;
      const draw = () => {
        const l = L(), u = l?.update, od = l?.draw; if (l) l.update = () => {};
        if (l && overlay) l.draw = function (g) { od.call(this, g); collide(g, this); };
        clock = Math.max(clock, performance.now()) + 1e3 / 60; __nextFrame(clock); if (l) { l.update = u; l.draw = od; }
      };
      // Collider overlay: every live target's shapes and the gate span, in model coordinates over the drawn frame.
      const collide = (g, l) => {
        const m = l.m; g.save(); g.translate(l.ox, l.hudTop); g.scale(l.k, l.k); g.lineWidth = 0.7;
        for (const t of m.targets()) { g.strokeStyle = t.kind === "crown" ? "#ffff00" : t.kind === "weight" ? "#00ffff" : "#ff3df0"; for (const s of t.shapes || [t]) g.strokeRect(s.x, s.y, s.w, s.h); }
        if (m.gate) { g.strokeStyle = "#00ff00"; g.strokeRect(m.gate.x, m.gate.y, m.gate.w, m.gate.h); }
        g.strokeStyle = "#ff0000"; g.beginPath(); g.moveTo(0, m.ceiling); g.lineTo(m.width, m.ceiling); g.stroke();
        g.restore();
      };
      const park = (m) => { const b = m.balls?.[0]; if (b) Object.assign(b, { x: m.paddle.x, y: m.paddle.y - 8, vx: 0, vy: 0, caught: true }); };
      const track = (m) => { const live = m.balls.filter((b) => !b.caught && !b.dead); if (live.length) { const b = live.reduce((a, q) => (q.y > a.y ? q : a)); m.setTarget(b.x + 6); } };
      const step = (s, follow = true) => { const l = L(), m = l.m; for (let i = 0; i < Math.round(s * 120); i++) { follow ? track(m) : park(m); l.update(1 / 120); } };
      const fresh = (floor = 0, banner = false) => { __breach.start(11); const m = M(); if (floor) { m.buildFloor(floor); } m.floorTime = banner ? 1 : 5; return m; };
      const begin = (floor = 0) => { const m = fresh(floor); m.active = true; m.launch(-Math.PI / 2 + 0.35); m.floorTime = 2; return m; };
      const quiet = (m) => { m.nextHazard = Infinity; if (m.march) m.march.next = Infinity; };
      window.T = { draw, step, fresh, begin, park, quiet, L, M };
    }, OVERLAY);
    const shot = async (name, fn, arg) => {
      await page.evaluate(fn, arg);
      for (let i = 0; i < 8; i++) { await page.evaluate(() => T.draw()); await page.waitForTimeout(40); }   // crossfades and card fades settle on the renderer's own clock
      await page.screenshot({ path: `${OUT}/${d.width}x${d.height}-${name}.png` });
    };
    await page.evaluate(() => { __breach.scene = "menu"; });
    await shot("00-menu", () => { window.scrollTo(0, 0); });
    // ---------- floor 1: Coin mound ----------
    await shot("01-f1-serve", () => { T.fresh(0, true); });
    await shot("02-f1-play", () => { const m = T.begin(0); T.quiet(m); T.step(9); m.charge = 45; });
    await shot("03-f1-eye-high-taunt", () => { const m = T.M(); m.wake = 82; m.ember.moods = {}; T.step(.2); });
    await shot("04-f1-wake-windup", () => { const m = T.M(); m.taught.roar = true; m.wake = 100; m.updateEmber(); T.step(m.ember.n.tell * .75); });
    await shot("05-f1-wake-roar", () => { const m = T.M(); m.paddle.x = m.paddle.targetX = m.ember.payload.stripe.x; m.floorTime = m.ember.until; T.step(.12, false); });
    await shot("06-f1-chime-hush", () => { const m = T.M(); T.step(1, false); m.wake = 70; const c = m.bricks.find((b) => b.kind === "chime" && b.hp > 0); c.lit = true; m.strikeChime(c); T.step(.35, false); });
    await shot("07-f1-crown-hit", () => { const m = T.M(); const c = m.bricks.find((b) => b.kind === "crown"); for (const b of m.bricks) if (b.field && b.kind !== "crown" && b.y > c.y + c.h) b.hp = 0; m.hitBrick(c, {}); m.hitBrick(c, {}); m.hitBrick(c, {}); T.step(.15, false); });
    await shot("08-f1-crown-grab", () => { const m = T.M(); const c = m.bricks.find((b) => b.kind === "crown"); while (c.hp > 0) m.hitBrick(c, {}); T.step(.4, false); });
    // ---------- floor 2: Ember stirs ----------
    await shot("09-f2-serve", () => { T.fresh(1, true); });
    await shot("10-f2-yawn", () => { const m = T.begin(1); m.nextHazard = 0; T.step(m.ember.n.tell * .6); });
    await shot("11-f2-play", () => { const m = T.begin(1); m.taught.roar = true; m.nextHazard = 9; T.step(9.6); m.wake = 46; });
    await shot("12-greed-card", () => { const m = T.M(); T.park(m); for (const w of m.bricks.filter((b) => b.kind === "weight")) while (w.hp > 0) m.hitBrick(w, {}); m.loot = 180; T.step(.5, false); });
    await shot("13-greed-stay", () => { const m = T.M(); m.choose("stay"); m.balls[0].caught = false; m.launch(-Math.PI / 2 + .3); T.quiet(m); T.step(4); m.wake = 76; m.greed.gold = 5; m.mult = 1.5; });
    await shot("14-caught", () => { const m = T.M(); m.wake = 99.95; m.floorTime = 99; m.ember.calm = 0; T.step(.25, false); });
    // ---------- floor 3: Avalanche ----------
    await shot("15-f3-serve", () => { const m = T.fresh(2, true); m.loot = 320; m.mult = 1.5; });
    await shot("16-f3-breath-tell", () => { const m = T.begin(2); m.loot = 320; m.mult = 1.5; m.taught.breath = true; m.march.next = Infinity; m.nextHazard = 0; m.hazardTurn = 0; T.step(m.ember.n.tell * .8); });
    await shot("17-f3-molten", () => { const m = T.M(); T.step(m.ember.n.tell * .25 + .5); });
    await shot("18-f3-play", () => { const m = T.begin(2); m.loot = 320; m.mult = 1.5; m.taught.roar = m.taught.breath = true; T.step(12); });
    await shot("19-f3-avalanche-near", () => { const m = T.M(); T.quiet(m); while (m.fieldBottom() < m.dangerY - 20) m.moveField(1); m.gate.hp = Math.ceil(m.gate.maxHP * .25); T.step(.3); });
    await shot("20-f3-avalanche-crash", () => { const m = T.M(); m.march.next = 0; let n = 0; const lives = m.lives; while (m.lives === lives && n++ < 4000) T.step(1 / 120); T.step(.12); });
    await shot("21-escape", () => { const m = T.begin(2); m.loot = 320; m.mult = 2; T.quiet(m); m.hitGate(m.gate.hp); T.step(1.1, false); });
    if (process.env.PERF) {
      // Frame cost of a busy floor-3 frame (draw only), under 4x CPU throttling.
      const cdp = await page.context().newCDPSession(page); await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
      const ms = await page.evaluate(() => { const m = T.begin(2); m.taught.breath = true; T.step(6); const l = T.L(), cv = document.querySelector("canvas"), g = cv.getContext("2d"); const t0 = performance.now(); for (let i = 0; i < 120; i++) { l.update(1 / 60); l.draw(g); } return (performance.now() - t0) / 120; });
      console.log(`${d.width}x${d.height} floor-3 update+draw ${ms.toFixed(2)} ms/frame at 4x CPU throttle`);
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
    }
    await page.close();
  }
} finally { await browser.close(); }
if (errors.length) { console.error(errors.join("\n")); process.exitCode = 1; }
else console.log("ok", OUT);
