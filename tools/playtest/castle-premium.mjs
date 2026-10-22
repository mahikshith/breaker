// Castle premium-pass screenshots: Gatehouse floors 1-3, Lumi floors 1-3, the orb power-ready pulse and paddle skins.
// Usage: node tools/playtest/castle-premium.mjs <out> [html] [label]
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
const { chromium } = await import(process.env.PW_MODULE || "playwright");
const [OUT = "out/castle-premium", HTML = "dist/breach.html", LABEL = "after"] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
const errors = [];
try {
  for (const d of [{ width: 393, height: 852, safe: "59,34" }, { width: 412, height: 915, safe: "32,24" }]) {
    const page = await browser.newPage({ viewport: { width: d.width, height: d.height }, deviceScaleFactor: 2, hasTouch: true });
    page.on("pageerror", (e) => errors.push(`${d.width}x${d.height}: ${e.message}`));
    await page.addInitScript(() => { window.requestAnimationFrame = (fn) => { window.__nextFrame = fn; return 1; }; });
    await page.goto(pathToFileURL(resolve(HTML)).href + `?safe=${d.safe}`);
    await page.waitForFunction(() => window.__breach?.ready && window.__nextFrame, null, { timeout: 60000, polling: 250 });
    await page.evaluate(async () => {
      await document.fonts.ready;
      let clock = performance.now();
      const L = () => __breach.level, M = () => __breach.level.m;
      const draw = () => { const l = L(), u = l.update; l.update = () => {}; __nextFrame(clock += 1e3 / 60); l.update = u; };
      // Step the chapter with the paddle tracking the lowest ball, so play scenes come from the real model.
      const step = (s, track = true) => { const l = L(), m = l.m; for (let i = 0; i < Math.round(s * 120); i++) { if (track && m.balls?.[0]) { const b = m.balls.reduce((a, q) => (q.y > a.y ? q : a)); m.setTarget(b.x + 6); } l.update(1 / 120); } };
      const begin = (idx, floor = 0) => {
        __breach.start(idx); const m = M();
        if (floor) m.buildFloor(floor);
        m.active = true; m.launch(-Math.PI / 2 + 0.35); m.floorTime = 2; return m;
      };
      const fx = (kind, x, y, life, age, extra = {}) => { const e = M().effect(x, y, kind, life, extra); e.age = age; return e; };
      window.T = { draw, step, begin, fx, L, M };
    });
    const shot = async (name, fn, arg) => {
      await page.evaluate(fn, arg);
      await page.evaluate(() => T.draw());
      await page.screenshot({ path: `${OUT}/${LABEL}-${d.width}x${d.height}-${name}.png` });
    };
    // ---------- Gatehouse Siege (index 8) ----------
    await shot("gate-f1-play", () => {
      const m = T.begin(8, 0); T.step(2.4);
      m.housings[0].hp = m.housings[0].maxHP - 1; m.housings[1].hp = m.housings[1].maxHP - 2; m.paddle.streak = 2; m.charge = 55;
      for (const i of [1, 8, 14]) m.bricks[i].hp = 0;
    });
    await shot("gate-f1-housing-break", () => {
      const m = T.M(), h = m.housings[0]; h.hp = 0; T.fx("housing-break", h.x + h.w / 2, h.y + h.h / 2, 0.9, 0.16);
      for (const b of m.bricks.slice(18, 20)) T.fx("brick-break", b.x + b.w / 2, b.y + b.h / 2, 0.7, 0.12, { colour: b.colour, w: b.w, h: b.h });
    });
    for (const [n, t] of [["a", 0.3], ["b", 0.62], ["c", 0.9]]) await shot(`gate-f1-crash-${n}`, (t) => {
      const m = T.M();
      if (m.phase !== "crash") { for (const h of m.housings) h.hp = 0; m.finishFloor(); }
      T.step(t - (m.effects.find((e) => e.kind === "drawbridge-crash")?.age || 0), false);
    }, t);
    await shot("gate-ram-armed", () => {
      const m = T.begin(8, 0); T.step(1.5); m.paddle.armed = true; m.paddle.streak = 3; T.fx("ram-armed", m.paddle.x, m.paddle.y, 0.6, 0.12);
    });
    await shot("gate-ram-flight", () => {
      const m = T.M(), b = m.balls[0]; Object.assign(b, { x: 170, y: 420, vx: 90, vy: -330, r: 13.2, ram: 1.6, ramBricks: 10, caught: false }); m.paddle.armed = false; m.paddle.streak = 0;
      T.fx("ram-launch", m.paddle.x, m.paddle.y - 10, 0.5, 0.1);
    });
    await shot("gate-f2-play", () => {
      const m = T.begin(8, 1); T.step(2.5); m.wheel.notches = 3; m.paddle.streak = 1; m.charge = 80;
      for (const i of [2, 9]) m.bricks[i].hp = 0;
    });
    await shot("gate-f2-bell-warning", () => {
      const m = T.M(), v = m.villain; v.hole = m.holes[0]; v.stage = "windup"; v.stageAt = m.time - 1; v.until = m.time + 0.8; T.fx("bell-warning", v.hole.x, v.hole.y, 1.8, 1.1);
    });
    await shot("gate-f2-bell-rolling", () => { const m = T.M(); m.villain.stage = "idle"; m.effects = []; m.releaseBell(false); T.step(0.75); });
    await shot("gate-f2-gate-open", () => { const m = T.M(); m.bells = []; m.wheel.notches = m.gate.need; m.finishFloor(); T.step(0.45, false); });
    await shot("gate-f3-play", () => {
      const m = T.begin(8, 2); T.step(2.2); m.bricks[1].hp = 1; m.bricks[4].hp = 1; m.villain.hp = Math.round(m.villain.maxHP * 0.7); m.paddle.streak = 2;
    });
    await shot("gate-f3-hole-warning", () => {
      const m = T.M(), v = m.villain; v.hole = m.holes[1]; v.stage = "windup"; v.stageAt = m.time - 0.6; v.until = m.time + 0.9; T.fx("bell-warning", v.hole.x, v.hole.y, 1.8, 1.2);
    });
    await shot("gate-f3-stagger", () => { const m = T.M(); m.villain.stage = "idle"; m.effects = []; m.hitVillain(1, true); T.step(0.25); });
    await shot("gate-f3-defeat", () => { const m = T.M(); m.villain.hp = 1; m.villain.stage = "idle"; m.hitVillain(1, false); T.step(0.45, false); });
    await shot("gate-f3-defeat-late", () => T.step(1.1, false));
    // ---------- power-ready pulse on the Kit orb (Gatehouse) ----------
    await page.evaluate(() => { const m = T.begin(8, 0); T.step(1.2); m.charge = 100; T.step(1 / 120); });
    for (const [n, t] of [["0-00", 0], ["1-08", 0.08], ["2-20", 0.12], ["3-38", 0.18], ["4-50", 0.12], ["5-steady", 5.2]]) await shot(`orb-kit-${n}`, (t) => T.step(t), t);
    // ---------- Lumi Breaks Out (index 9) ----------
    await shot("lumi-f1-play", () => { const m = T.begin(9, 0); T.step(3); m.paddle.streak = 2; m.charge = 40; });
    await shot("lumi-f2-play", () => { const m = T.begin(9, 1); T.step(5); m.paddle.streak = 1; });
    await shot("lumi-f3-roof", () => { const m = T.begin(9, 2); T.step(2.5); m.bell.rings = 2; m.paddle.armed = true; });
    await page.evaluate(() => { const m = T.begin(9, 0); T.step(1.2); m.charge = 100; T.step(1 / 120); });
    for (const [n, t] of [["0-00", 0], ["1-08", 0.08], ["2-20", 0.12], ["3-steady", 5.5]]) await shot(`orb-lumi-${n}`, (t) => T.step(t), t);
    // ---------- Bellforge / Tidewheel paddle check ----------
    await shot("bellforge-play", () => { const m = T.begin(6, 0); T.step(2); });
    await shot("tidewheel-play", () => { const m = T.begin(7, 0); T.step(2); });
    await page.close();
  }
} finally {
  await browser.close();
}
writeFileSync(`${OUT}/${LABEL}-errors.txt`, errors.join("\n") || "none\n");
console.log(errors.length ? errors.join("\n") : "no page errors");
