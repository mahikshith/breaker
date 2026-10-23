// Tidewheel look review: board at the serve, raft bricks (staged cracked / breaking / steel fixtures), a real water pulse
// bursting on the paddle as a frame strip, a ball-blocked burst, the muzzle and Lumi's three balcony clips.
// Usage: PW_MODULE=... node tools/playtest/tidewheel-look.mjs <out> [html]
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
const { chromium } = await import(process.env.PW_MODULE || "playwright");
const [OUT = "out/tidewheel-look", HTML = "dist/breach.html"] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
const page = await browser.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 3, hasTouch: true }), errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.addInitScript(() => { window.requestAnimationFrame = (fn) => { window.__nextFrame = fn; return 1; }; });
await page.goto(pathToFileURL(resolve(HTML)).href + "?safe=59,34");
await page.waitForFunction(() => window.__breach?.ready && window.__nextFrame, null, { timeout: 60000, polling: 250 });
await page.evaluate(async () => {
  await document.fonts.ready;
  let clock = performance.now();
  const L = () => __breach.level;
  window.TL = {
    draw() { const l = L(), u = l.update; l.update = () => {}; __nextFrame(clock += 1e3 / 60); l.update = u; },
    step(s) { const l = L(); for (let i = 0; i < Math.round(s * 120); i++) l.update(1 / 120); TL.draw(); },
    fresh() { __breach.start(7); const l = L(); l.coach.seen = () => true; l.coach.update = () => {}; l.coach.draw = () => {}; TL.step(.5); return l; },
    // model point -> CSS pixel (main.js resize() and draw() transforms, then the chapter's ox / hudTop / k)
    css(mx, my) {
      const l = L(), iw = innerWidth, ih = innerHeight, FH = Math.round(Math.max(600, Math.min(880, 360 * ih / iw))), s = Math.min(iw / 360, ih / FH);
      const offY = (ih / s - FH) / 2, inT = 59 / s;
      return { x: (l.ox + mx * l.k) * s, y: (offY + inT - 34 + l.hudTop + my * l.k) * s, s: s * l.k };
    },
  };
});
const clip = async (path, mx, my, w, h) => {
  const c = await page.evaluate(([mx, my]) => TL.css(mx, my), [mx, my]);
  await page.screenshot({ path, clip: { x: c.x - (w / 2) * c.s, y: c.y - (h / 2) * c.s, width: w * c.s, height: h * c.s } });
};
const ev = (fn, arg) => page.evaluate(fn, arg);
const report = {};

// 1. The board at the serve.
await ev(() => TL.fresh());
await page.screenshot({ path: `${OUT}/01-board-start.png` });
await clip(`${OUT}/02-bricks-intact.png`, 102, 300, 150, 120);
report.raft = await ev(() => { const m = __breach.level.m; return { raft: m.rafts[0].y, water: m.water.y, paddle: m.paddle.y }; });

// 2. Staged brick fixture: row 1 cracked (a 2-hit brick on its last hp), row 2 a breaking frame (brick-break at 40 ms),
//    row 3 the brass-banded steel bar (granite equivalent, not used by the current layout).
await ev(() => {
  const m = TL.fresh().m;
  for (const b of m.bricks.filter((b) => b.raft === 0 && b.ly < -40)) { b.maxHP = 2; b.hp = 1; }
  for (const b of m.bricks.filter((b) => b.raft === 0 && b.ly > -40 && b.ly < -20)) {
    b.hp = 0; const r = m.rafts[0], c = { x: r.x + b.lx + b.w / 2, y: r.y + b.ly + b.h / 2 };
    m.effects.push({ kind: "brick-break", x: c.x, y: c.y, w: b.w, h: b.h, colour: b.colour, vx: 0, vy: 0, age: 0.04, life: 0.65, staged: true });
  }
  for (const b of m.bricks.filter((b) => b.raft === 0 && b.ly > -20 && b.ly < 0)) b.colour = "steel";
  m.paused = true; TL.draw();
});
await clip(`${OUT}/03-bricks-states-staged.png`, 102, 300, 150, 120);

// 3. Brick-break burst on a real ball hit: frames over its life.
await ev(() => {
  const m = TL.fresh().m, b = m.bricks.find((b) => b.raft === 1 && b.ly < -40), r = m.rafts[1], ball = m.balls[0];
  ball.caught = false; m.phase = "play"; m.started = true;
  ball.x = ball.px = r.x + b.lx + b.w / 2; ball.y = ball.py = r.y + b.ly - 14; ball.vx = 0; ball.vy = 345; TL.step(0.02);
});
for (const [i, t] of [0.03, 0.06, 0.06, 0.08, 0.1, 0.14].entries()) {
  await ev((t) => TL.step(t), t);
  await clip(`${OUT}/04-brick-break-${i}.png`, 258, 290, 130, 110);
}

// 4. A real water pulse from Nerra's crusher: the muzzle, then the burst on the paddle, as a strip.
await ev(() => { const m = TL.fresh().m; m.launch(); m.balls[0].caught = true; m.teachingDone = true; m.beginPulse(); });
const muzzle = await ev(() => { let n = 0; const m = __breach.level.m; while (!m.effects.some((e) => e.kind === "water-muzzle") && n++ < 2400) __breach.level.update(1 / 120); TL.draw(); const e = m.effects.find((e) => e.kind === "water-muzzle"); return e && { x: e.x, y: e.y, angle: e.angle, age: e.age }; });
report.muzzle = muzzle;
if (muzzle) for (const [i, t] of [0.01, 0.04, 0.05, 0.1].entries()) { await ev((t) => TL.step(t), t); await clip(`${OUT}/05-muzzle-${i}.png`, muzzle.x + 10, muzzle.y + 20, 120, 100); }
const hit = await ev(() => { let n = 0; const m = __breach.level.m; while (!m.effects.some((e) => e.kind === "water-hit") && n++ < 2400) __breach.level.update(1 / 240); const e = m.effects.find((e) => e.kind === "water-hit"); return e && { x: e.x, y: e.y, blocked: e.blocked, water: m.water.y, paddle: m.paddle.y }; });
report.hit = hit;
if (hit) for (const [i, t] of [0.015, 0.035, 0.04, 0.05, 0.06, 0.08, 0.1].entries()) {
  await ev((t) => TL.step(t), t);
  await clip(`${OUT}/06-splash-paddle-${i}.png`, hit.x, hit.y - 14, 120, 90);
}

// 5. A pulse broken up by the ball over the open basin (staged effect at a fixed point, as tools/playtest/art-round2.mjs).
const blocked = await ev(() => { const m = TL.fresh().m; m.effects.push({ kind: "water-hit", x: 250, y: 470, age: 0, life: 0.6, blocked: true, staged: true }); return { x: 250, y: 470, water: m.water.y }; });
report.blocked = blocked;
for (const [i, t] of [0.015, 0.035, 0.04, 0.05, 0.06, 0.08, 0.1].entries()) {
  await ev((t) => TL.step(t), t);
  await clip(`${OUT}/07-splash-water-${i}.png`, blocked.x, blocked.y - 6, 120, 90);
}

// 5b. Nerra's chain pull: the sluices pour into the basin (staged pull, as tools/playtest/tidewheel.mjs).
await ev(() => { const m = TL.fresh().m; m.launch(); m.balls[0].caught = true; m.time = 20; m.teachingDone = true; m.villain.anger = 3; m.beginPull(); });
const pour = await ev(() => { const m = __breach.level.m; let n = 0; while (m.villain.stage !== "pull" && n++ < 4000) __breach.level.update(1 / 120); TL.step(0.3); return { stage: m.villain.stage, water: m.water.y }; });
report.pour = pour;
await clip(`${OUT}/13-sluice-pour.png`, 180, 340, 300, 90);

// 6. Lumi on the refuge balcony: idle at the serve, worried while the flood is high, cheering in the rescue.
await ev(() => TL.fresh());
const lumi = await ev(() => ({ ...__breach.level.m.lumi }));
for (const [i, t] of [0, 0.1, 0.2].entries()) { await ev((t) => TL.step(t), t); await clip(`${OUT}/08-lumi-idle-${i}.png`, lumi.x, lumi.y + 10, 90, 80); }
report.lumiIdle = await ev(() => Math.floor(__breach.level.m.time * 10));
await ev(() => { const m = __breach.level.m; m.lumi.worried = true; TL.step(0.05); });
for (const [i, t] of [0, 0.1, 0.2].entries()) { await ev((t) => TL.step(t), t); await clip(`${OUT}/09-lumi-worried-${i}.png`, lumi.x, lumi.y + 10, 90, 80); }
await ev(() => { const m = __breach.level.m; m.lumi.worried = false; m.villain.hp = 1; m.villain.stunUntil = 0; m.phase = "rescue"; m.rescueAt = m.time; m.villain.defeat = { age: 0 }; TL.step(0.3); });
const lumiR = await ev(() => ({ ...__breach.level.m.lumi }));
for (const [i, t] of [0, 0.1, 0.2].entries()) { await ev((t) => TL.step(t), t); await clip(`${OUT}/10-lumi-rescue-${i}.png`, lumiR.x, lumiR.y + 10, 90, 80); }
await ev(() => TL.step(3.5));
const won = await ev(() => ({ state: __breach.level.m.state, lumi: { ...__breach.level.m.lumi } }));
report.won = won.state;
for (const [i] of [0, 1, 2].entries()) { await ev(() => { for (let k = 0; k < 6; k++) __breach.level.update(1 / 60); TL.draw(); }); await clip(`${OUT}/11-lumi-won-${i}.png`, won.lumi.x, won.lumi.y + 10, 90, 80); }
await page.screenshot({ path: `${OUT}/12-board-won.png` });
report.errors = errors;
writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 1));
await browser.close();
console.log(JSON.stringify(report));
if (errors.length) process.exit(1);
