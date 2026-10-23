// Themed bricks review: each princess chapter's board at the serve, with a few bricks cracked and a few caught mid-break
// (time frozen, so before/after shots line up). Usage: PW_MODULE=... node tools/playtest/themed-bricks.mjs <out> [html] [tag]
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
const { chromium } = await import(process.env.PW_MODULE || "playwright");
const [OUT = "out/themed-bricks", HTML = "dist/breach.html", TAG = "after"] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
// [name, level index, fantasy floor or null]
const SHOTS = [["vault", 1], ["frost", 4], ["mooncoil", 5], ["bellforge", 6], ["gatehouse", 8, 0], ["gatehouse-armour", 8, 2], ["lumi", 9, 0], ["rivals", 10, 0], ["hoard", 11]];
const browser = await chromium.launch();
const errors = [];
const page = await browser.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, hasTouch: true });
page.on("pageerror", (e) => errors.push(e.message));
await page.addInitScript(() => { window.requestAnimationFrame = (fn) => { window.__nextFrame = fn; return 1; }; });
await page.goto(pathToFileURL(resolve(HTML)).href + "?safe=59,34");
await page.waitForFunction(() => window.__breach?.ready && window.__nextFrame, null, { timeout: 90000, polling: 250 });
await page.evaluate(() => document.fonts.ready);
for (const [name, idx, floor] of SHOTS) {
  await page.evaluate(([i, floor]) => {
    let clock = performance.now();
    __breach.start(i);
    const L = __breach.level, m = L.m;
    L.skipIntro?.();
    if (m && floor != null && m.buildFloor) m.buildFloor(floor);
    if (m && "floorTime" in m) m.floorTime = Math.max(m.floorTime, 2);
    if (L.phase === "intro") for (let k = 0; k < 2400 && L.phase === "intro"; k++) L.update(1 / 120);
    // Crack the multi-hit bricks and break two ordinary ones, then hold the break effects a beat in.
    if (m?.hitBrick) {
      const live = m.bricks.filter((b) => b.hp > 0);
      for (const b of live.filter((b) => b.maxHP > 1).slice(0, 4)) m.hitBrick(b, null);
      const ones = live.filter((b) => b.maxHP === 1 && b.type !== "bar");
      for (const b of [ones[1], ones[Math.floor(ones.length / 2)]].filter(Boolean)) m.hitBrick(b, null);
      for (const e of m.effects || []) e.age = Math.min(e.life * .5, .16);
    } else if (L.bricks?.length && L.hitTarget) {
      const live = L.bricks.filter((b) => b.hp > 0); L.spacePowerAvailable = () => true;
      for (const b of [live[2], live[15]].filter(Boolean)) L.hitTarget(b.id, { x: b.x, y: b.y });
      for (let k = 0; k < 14; k++) L.fragments?.forEach((f) => { f.t += 1 / 120; f.x += f.vx / 120; f.vy += 200 / 120; f.y += f.vy / 120; });
    } else if (L.bricks?.length && L.grid) {
      for (const br of L.bricks.filter((b) => b.max > 1 && !b.gone).slice(0, 6)) { br.hp = br.max - 1; }
    }
    const u = L.update; L.update = () => {};
    for (let k = 0; k < 3; k++) __nextFrame(clock += 1e3 / 60);
    L.update = u;
  }, [idx, floor ?? null]);
  await page.screenshot({ path: `${OUT}/${name}-${TAG}.png` });
}
await browser.close();
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log("ok", OUT);
