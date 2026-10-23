// Render round 2 review screenshots (393x852): the Hoard eye stages, molten row, ringing Hush Chime, dented floor-3 gate,
// loot shower and full-screen cave; the glaze capsules falling in the Vault and the Hoard; the crate panels in Circuit and
// Forge; the Tidewheel splash. PNG metadata is stripped afterwards by the caller (art/round2 README in the report).
// Usage: PW_MODULE=/opt/node22/lib/node_modules/playwright/index.mjs node tools/playtest/art-round2.mjs <out> [html]
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
const { chromium } = await import(process.env.PW_MODULE || "playwright");
const [OUT = "out/art-round2", HTML = "dist/breach.html"] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, hasTouch: true });
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => { window.requestAnimationFrame = (fn) => { window.__nextFrame = fn; return 1; }; });
  await page.goto(pathToFileURL(resolve(HTML)).href + "?safe=59,34");
  await page.waitForFunction(() => window.__breach?.ready && window.__nextFrame, null, { timeout: 60000, polling: 250 });
  await page.evaluate(async () => {
    await document.fonts.ready;
    let clock = performance.now();
    const L = () => __breach.level, M = () => __breach.level.m;
    // Draw a frame with the model frozen, so a staged moment (an effect's age, a falling capsule) is what gets drawn.
    const draw = () => { const l = L(), u = l?.update; if (l) l.update = () => {}; clock = Math.max(clock, performance.now()) + 1e3 / 60; __nextFrame(clock); if (l) l.update = u; };
    const park = (m) => { const b = m.balls?.[0]; if (b) Object.assign(b, { x: m.paddle.x, y: m.paddle.y - 8, vx: 0, vy: 0, caught: true }); };
    const track = (m) => { const live = m.balls.filter((b) => !b.caught && !b.dead); if (live.length) { const b = live.reduce((a, q) => (q.y > a.y ? q : a)); m.setTarget(b.x + 6); } };
    const step = (s, follow = true) => { const l = L(), m = l.m; for (let i = 0; i < Math.round(s * 120); i++) { follow ? track(m) : park(m); l.update(1 / 120); } };
    const hoard = (floor = 0) => { __breach.start(11); const m = M(); if (floor) m.buildFloor(floor); m.active = true; m.launch(-Math.PI / 2 + 0.35); m.floorTime = 5; m.nextHazard = Infinity; if (m.march) m.march.next = Infinity; return m; };
    window.T = { draw, step, park, hoard, L, M };
  });
  const shot = async (name, fn, settle = 8, arg) => {
    await page.evaluate(fn, arg);
    for (let i = 0; i < settle; i++) { await page.evaluate(() => T.draw()); await page.waitForTimeout(40); }
    await page.screenshot({ path: `${OUT}/${name}.png` });
  };
  // ---------- Dragon's Hoard ----------
  await shot("hoard-01-cave-full", () => { const m = T.hoard(0); T.step(4); m.wake = 8; });
  await shot("hoard-02-eye-slit", () => { const m = T.M(); m.wake = 28; m.ember.moods = {}; });
  await shot("hoard-03-eye-open", () => { const m = T.M(); m.wake = 70; m.ember.moods = {}; });
  await shot("hoard-04-eye-furious", () => { const m = T.M(); m.wake = 96; m.ember.moods = {}; });
  await shot("hoard-05-chime-ringing", () => { const m = T.M(); m.wake = 60; const c = m.bricks.find((b) => b.kind === "chime" && b.hp > 0); c.lit = true; m.strikeChime(c); T.step(0.3, false); });
  await shot("hoard-06-loot-shower", () => {
    const m = T.hoard(0); T.park(m); const ch = m.bricks.find((b) => b.kind === "chest" && b.hp > 0), co = m.bricks.filter((b) => b.kind === "coin" && b.hp > 0)[2];
    while (ch.hp > 0) m.hitBrick(ch, {}); m.hitBrick(co, {}); for (const e of m.effects) if (e.kind === "loot") e.age = e.life * 0.3;
  });
  await shot("hoard-07-molten-row", () => { const m = T.hoard(2); m.taught.breath = true; m.taught.roar = true; m.nextHazard = 0; m.hazardTurn = 0; T.step(m.ember.n.tell + 1); });
  await shot("hoard-08-gate-dented", () => { const m = T.hoard(2); T.park(m); m.gate.hp = Math.ceil(m.gate.maxHP * 0.3); T.step(0.2, false); });
  await shot("hoard-09-capsules-falling", () => { const m = T.hoard(0); T.step(3); m.capsules = ["multi", "ram", "wide"].map((kind, i) => ({ id: 900 + i, kind, x: 110 + i * 70, y: 470 + i * 26, dead: false })); });
  // ---------- glaze capsules in the Vault ----------
  await shot("vault-capsules-falling", () => {
    __breach.start(1); const l = T.L(); l.drops = ["split", "fire", "wide", "focus", "burst", "laser", "shield", "slow", "shrink"].map((kind, i) => ({ x: 52 + (i % 5) * 64, y: 470 + Math.floor(i / 5) * 46 + (i % 2) * 14, kind, vy: 60 }));
  });
  // ---------- crates ----------
  await shot("circuit-crates", () => { __breach.start(2); const l = T.L(); const a = l.bricks.filter((b) => b.part === "brick_armour"); a[1].hp = 1; a[3].hp = 1; l.drops = [{ x: 120, y: 520, kind: "laser", vy: 60 }, { x: 240, y: 560, kind: "shield", vy: 60 }]; });
  await shot("forge-crates", () => { __breach.start(3); const l = T.L(); const a = l.bricks.filter((b) => b.kind === "armour"); a[1].hp = 1; });
  // ---------- Tidewheel splash ----------
  for (const [i, age] of [[1, 0.05], [2, 0.14]]) {
    await shot(`tidewheel-splash-${i}`, (age) => {
      if (T.L()?.m?.constructor?.name !== "Tidewheel" && !(T.L()?.m?.water)) __breach.start(7);
      const m = T.M(); m.effects = m.effects.filter((e) => e.kind !== "water-hit");
      m.effects.push({ kind: "water-hit", x: m.paddle.x, y: m.paddle.y - m.paddle.h / 2, age, life: 0.35, blocked: false });
      m.effects.push({ kind: "water-hit", x: 250, y: 470, age: age + 0.05, life: 0.35, blocked: true });
    }, 8, age);
  }
  await page.close();
} finally { await browser.close(); }
if (errors.length) { console.error(errors.join("\n")); process.exitCode = 1; }
else console.log("ok", OUT);
