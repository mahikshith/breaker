// Gatehouse floor-1 hooks screenshots (design/phase2/floor-hooks.md): serve with Korr on the battlements, the winch
// telegraph, mid-play, the crash with the payoff banner and floor 2 with the smashed rack. Real model, stepped by a bot.
// Usage: node tools/playtest/floor-hooks.mjs <out> [html]   (strip metadata after: the PNGs are re-saved by PIL)
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
const { chromium } = await import(process.env.PW_MODULE || "playwright");
const [OUT = "out/floor-hooks", HTML = "dist/breach.html"] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, hasTouch: true });
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => { window.requestAnimationFrame = (fn) => { window.__nextFrame = fn; return 1; }; });
  await page.goto(pathToFileURL(resolve(HTML)).href + "?safe=59,34&difficulty=medium");
  await page.waitForFunction(() => window.__breach?.ready && window.__nextFrame, null, { timeout: 60000, polling: 250 });
  await page.evaluate(async () => {
    await document.fonts.ready;
    let clock = performance.now();
    const L = () => __breach.level, M = () => __breach.level.m;
    const draw = () => { const l = L(), u = l.update; l.update = () => {}; __nextFrame(clock += 1e3 / 60); l.update = u; };
    // The paddle tracks the lowest ball (with a small offset), so play scenes come from the real model.
    const step = (s, track = true, off = 6) => { const l = L(), m = l.m; for (let i = 0; i < Math.round(s * 120); i++) { if (track && m.balls?.[0]) { const b = m.balls.reduce((a, q) => (q.y > a.y ? q : a)); m.setTarget(b.x + off); } l.update(1 / 120); } };
    window.T = { draw, step, L, M };
  });
  const shot = async (name, fn, arg) => {
    await page.evaluate(fn, arg);
    await page.evaluate(() => T.draw());
    await page.screenshot({ path: `${OUT}/${name}.png` });
  };
  await shot("1-floor1-serve", () => { __breach.start(8); T.step(0.6); });
  await shot("2-winch-tell", () => {
    const m = T.M(); m.launch(-Math.PI / 2 + 0.35); T.step(3);
    m.housings[1].hp = m.housings[1].maxHP - 2; m.winch.idle = m.rules.crankIdle - 0.01; T.step(0.02);
    const b = m.balls[0]; Object.assign(b, { x: 150, y: 470, vx: 120, vy: 320 }); T.step(m.rules.crankTell * 0.6, false);
  });
  await shot("3-mid-play", () => {
    const m = T.M(); m.winch.stage = "idle"; m.winch.target = null; m.villain.stage = "idle"; m.effects = [];
    T.step(8); m.housings[0].hp = 2; m.paddle.streak = 2; m.charge = 55; m.winch.idle = m.rules.crankIdle * 0.62;
  });
  await shot("4-crash-payoff", () => {
    const m = T.M(); if (m.floorTime >= m.rules.par) m.floorTime = m.rules.par - 4;
    for (const b of m.bricks) if (b.gem) { b.hp = 0; m.gems++; }
    for (const h of m.housings) h.hp = 0; m.finishFloor(); T.step(0.62, false);
  });
  await shot("5-floor2-carryover", () => { const m = T.M(); T.step(1.2, false); T.step(1.1); });
  // For comparison: floor 2 after a slow floor 1 (par missed): the rack is stocked and the bells keep their pace.
  await shot("6-floor2-rack-stocked", () => { __breach.start(8); const m = T.M(); m.buildFloor(1); m.active = true; m.launch(-Math.PI / 2 + 0.35); T.step(2.2); });
  await page.close();
} finally {
  await browser.close();
}
writeFileSync(`${OUT}/errors.txt`, errors.join("\n") || "none\n");
console.log(errors.length ? errors.join("\n") : "no page errors");
