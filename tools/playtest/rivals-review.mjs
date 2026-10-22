// Serpent Rivals (chapter 11, ?level=11) review screenshots at both phone sizes, plus an optional collider-vs-art overlay.
// Usage: PW_MODULE=/opt/node22/lib/node_modules/playwright/index.mjs node tools/playtest/rivals-review.mjs <out> [html] [overlay]
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
const { chromium } = await import(process.env.PW_MODULE || "playwright");
const [OUT = "out/rivals", HTML = "dist/breach.html", OVERLAY = ""] = process.argv.slice(2);
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
      // Collider overlay: the model's snake circles, lures, bricks, seal and chamber in level coordinates, on top of the drawn frame.
      const collide = (g, l) => {
        const m = l.m;
        g.save(); g.translate(l.ox, l.hudTop); g.scale(l.k, l.k);
        g.lineWidth = 0.7;
        g.strokeStyle = "#ff3df0"; for (const s of m.lures) g.strokeRect(s.x, s.y, s.w, s.h);
        g.strokeStyle = "#ffff00"; if (m.seal) g.strokeRect(m.seal.x, m.seal.y, m.seal.w, m.seal.h);
        g.strokeStyle = "#00ffff"; if (m.chamber) g.strokeRect(m.chamber.x, m.chamber.y, m.chamber.w, m.chamber.h);
        g.strokeStyle = "#ff8800"; for (const b of m.bricks) if (b.hp > 0 && b.type === "bar") g.strokeRect(b.x, b.y, b.w, b.h);
        g.strokeStyle = "#ff0000"; for (const s of m.snakeTargets()) { g.beginPath(); g.arc(s.b.x, s.b.y, s.r, 0, 7); g.stroke(); }
        g.strokeStyle = "#00ff00"; for (const lu of m.lunges) { const p = lu.points[0]; if (p) { g.beginPath(); g.arc(p.x, p.y, p.r, 0, 7); g.stroke(); } }
        g.restore();
      };
      const park = (m) => { const b = m.balls?.[0]; if (b) Object.assign(b, { x: m.paddle.x, y: m.paddle.y - 8, vx: 0, vy: 0, caught: true }); };
      // Step the chapter with the paddle tracking the lowest ball (play scenes), or with the ball parked out of the way.
      const step = (s, track = true) => { const l = L(), m = l.m; for (let i = 0; i < Math.round(s * 120); i++) { if (track && m.balls?.[0]) { const b = m.balls.reduce((a, q) => (q.y > a.y ? q : a)); m.setTarget(b.x + 6); } else park(m); l.update(1 / 120); } };
      const until = (fn, cap = 4000, track = false) => { const l = L(), m = l.m; for (let i = 0; i < cap && !fn(); i++) { if (track && m.balls?.[0]) { const b = m.balls.reduce((a, q) => (q.y > a.y ? q : a)); m.setTarget(b.x + 6); } else park(m); l.update(1 / 120); } };
      const fresh = (floor = 0, banner = false) => { __breach.start(10); const m = M(); if (floor) { m.buildFloor(floor); m.active = true; } m.nextLunge = Infinity; m.teachClash = false; m.floorTime = banner ? 1 : 5; return m; };
      const begin = (floor = 0) => { const m = fresh(floor); m.active = true; m.launch(-Math.PI / 2 + 0.35); m.floorTime = 2; return m; };
      const fx = (kind, x, y, life, age, extra = {}) => { const e = M().effect(x, y, kind, life, extra); e.age = age; return e; };
      const win = (m, snake, cross) => m.windows.find((w) => w.snake === snake && (cross === undefined || w.cross === cross));
      // Start a lunge in a window, then step to a stage (and `dt` seconds into it).
      const lunge = (m, w, stage, dt = 0, opts = {}) => {
        const l = m.makeLunge(w, opts); m.lunges.push(l);
        if (stage !== "peek") until(() => l.stage === stage || l.done, 3000);
        step(dt, false); return l;
      };
      window.T = { draw, step, until, fresh, begin, fx, win, lunge, park, L, M };
    }, OVERLAY);
    const shot = async (name, fn, arg) => {
      await page.evaluate(fn, arg);
      await page.evaluate(() => T.draw());
      await page.screenshot({ path: `${OUT}/${d.width}x${d.height}-${name}.png` });
    };
    // ---------- menu card ----------
    await page.evaluate(() => { __breach.scene = "menu"; });
    await shot("00-menu", () => {});
    // ---------- floor 1: Lure hall ----------
    await shot("01-f1-serve", () => { T.fresh(0, true); });
    await shot("02-f1-play", () => { const m = T.begin(0); m.nextLunge = 99; T.step(3.5); m.paddle.streak = 2; m.charge = 40; });
    await shot("03-f1-lure-lit", () => { const m = T.fresh(0); m.active = true; m.floorTime = 3; m.launch(); T.park(m); m.updateLures(); });
    await shot("04-f1-lure-dim", () => { const m = T.M(), lure = m.lures[0]; m.strikeLure(lure); m.effects = []; T.step(.3, false); m.lunges[0].stage = "retreat"; m.lunges[0].from = 0; });
    // a lunge from the left (Gnash)
    for (const [n, stage, dt] of [["peek", "peek", 0.22], ["hiss", "hiss", 0.5], ["hiss-late", "hiss", 1.4], ["strike", "strike", 0.17], ["chew", "chew", 0.2], ["retreat", "retreat", 0.25]]) {
      await shot(`05-f1-gnash-${n}`, ([stage, dt, n]) => { const m = T.fresh(0); m.active = true; m.launch(); T.park(m); m.nextLunge = Infinity; const w = m.windows[1]; const l = m.makeLunge(w, { teaching: false }); m.lunges = [l]; if (stage === "peek") T.step(dt, false); else { T.until(() => l.stage === stage, 4000); T.step(dt, false); } if (n === "hiss-late") T.step(0, false); }, [stage, dt, n]);
    }
    await shot("06-f1-swallow", () => {
      const m = T.fresh(0); m.active = true; m.launch(); T.park(m); m.nextLunge = Infinity; const w = m.windows[1], l = m.makeLunge(w, { teaching: false }); m.lunges = [l];
      T.until(() => l.stage === "strike", 4000); T.step(0.2, false); const b = m.balls[0]; b.caught = false; Object.assign(b, { x: l.points[0].x + 12, y: l.points[0].y, vx: -200, vy: 0 }); m.swallow(b, l); m.balls = [m.newBall(m.paddle.x, m.paddle.y - 8, 0, 0, true)]; T.step(0.25, false);
    });
    await shot("07-f1-head-hurt", () => {
      const m = T.fresh(0); m.active = true; m.launch(); T.park(m); m.nextLunge = Infinity; const l = m.makeLunge(m.windows[2], { teaching: false }); m.lunges = [l]; T.until(() => l.stage === "hiss", 4000); T.step(0.9, false); m.hitHead(l); T.step(0.2, false);
    });
    await shot("08-f1-hatch-hits", () => {
      const m = T.begin(0); m.nextLunge = 99; T.step(0.5); const bars = m.bricks.filter((b) => b.type === "bar"); m.hitBrick(bars[0], null); m.hitBrick(bars[1], null); m.hitBrick(bars[1], null); m.hitBrick(bars[3], null); T.step(0.1);
    });
    await shot("09-f1-hatch-open", () => { const m = T.M(); for (const b of m.bricks.filter((b) => b.type === "bar" && b.hp > 0)) while (b.hp > 0) m.hitBrick(b, null); T.step(0.3, false); });
    await shot("10-f1-climb", () => { T.step(0.6, false); });
    await shot("10b-f1-arrive-f2", () => { T.step(0.9, false); });
    // ---------- floor 2: the crossing ----------
    await shot("11-f2-serve", () => { T.fresh(1, true); const m = T.M(); m.teachClash = true; m.nextLunge = 3.5; });
    await shot("12-f2-play", () => { const m = T.begin(1); m.nextLunge = 99; T.step(3); m.paddle.streak = 1; m.charge = 70; });
    await shot("13-f2-teach-peek", () => { const m = T.fresh(1); m.active = true; m.launch(); T.park(m); m.teachClash = true; m.nextLunge = 0; T.until(() => m.lunges.length === 2, 800); T.step(0.2, false); });
    await shot("14-f2-teach-hiss", () => { T.step(1.1, false); });
    await shot("15-f2-teach-strike", () => { T.until(() => m_stage("strike")); function m_stage(s) { return T.M().lunges.some((l) => l.stage === s); } T.step(0.2, false); });
    await shot("16-f2-teach-clash-f0", () => { T.until(() => T.M().effects.some((e) => e.kind === "clash"), 3000); const e = T.M().effects.find((e) => e.kind === "clash"); T.step(0.04, false); });
    await shot("17-f2-teach-clash-f1", () => { T.step(0.1, false); });
    await shot("18-f2-teach-recoil", () => { T.step(0.2, false); });
    await shot("19-f2-teach-dizzy", () => { T.step(0.7, false); });
    await shot("20-f2-teach-bait-chip", () => { T.until(() => !T.M().lunges.length, 3000); const m = T.M(); T.step(0.1, false); });
    // a Mooncoil lunge from the right on its crossing window (violet)
    for (const [n, stage, dt] of [["peek", "peek", 0.22], ["hiss", "hiss", 0.6], ["strike", "strike", 0.17], ["prowl", "prowl", 0.3], ["retreat", "retreat", 0.25]]) {
      await shot(`21-f2-mooncoil-${n}`, ([stage, dt]) => { const m = T.fresh(1); m.active = true; m.launch(); T.park(m); m.nextLunge = Infinity; const l = m.makeLunge(T.win(m, "mooncoil", stage === "prowl"), { teaching: false }); m.lunges = [l]; if (stage === "peek") T.step(dt, false); else { T.until(() => l.stage === stage, 4000); T.step(dt, false); } }, [stage, dt]);
    }
    await shot("22-f2-gnash-cross-hiss", () => { const m = T.fresh(1); m.active = true; m.launch(); T.park(m); m.nextLunge = Infinity; const l = m.makeLunge(T.win(m, "gnash", true), { teaching: false }); m.lunges = [l]; T.until(() => l.stage === "hiss", 4000); T.step(0.8, false); });
    await shot("23-f2-lure-bait", () => {
      const m = T.fresh(1); m.active = true; m.launch(); T.park(m); m.nextLunge = Infinity; m.floorTime = 5; m.updateLures();
      const l = m.makeLunge(T.win(m, "gnash", true), { teaching: false }); m.lunges = [l]; T.until(() => l.stage === "hiss", 4000); T.step(0.7, false); m.updateLures();
    });
    await shot("24-f2-lure-called", () => { const m = T.M(), mc = m.lures.find((x) => x.snake === "mooncoil"); mc.lit = true; m.strikeLure(mc); T.step(0.15, false); });
    await shot("25-f2-prowl-wait", () => { T.until(() => T.M().lunges.some((l) => l.stage === "prowl" && l.arrivedAt !== null), 3000); T.step(0.2, false); });
    await shot("26-f2-clash-f0", () => { T.until(() => T.M().effects.some((e) => e.kind === "clash"), 3000); T.step(0.03, false); });
    await shot("27-f2-clash-f1", () => { T.step(0.12, false); });
    await shot("28-f2-clash-f2", () => { T.step(0.12, false); });
    await shot("29-f2-recoil", () => { T.step(0.17, false); });
    await shot("30-f2-dizzy", () => { T.step(0.6, false); });
    await shot("31-f2-dizzy-hit", () => { const m = T.M(), l = m.lunges.find((x) => x.stage === "dizzy"); if (l) m.hitHead(l); T.step(0.15, false); });
    await shot("32-f2-seal-chips", () => { const m = T.M(); T.step(0.4, false); });
    // ---------- seal stages with plates ----------
    for (const [n, f, w] of [["intact-0plates", 1, 0], ["intact-2plates", 1, 2], ["crack1-3plates", 0.7, 3], ["crack2-4plates", 0.45, 4], ["shattered-6plates", 0.2, 6]]) {
      await shot(`33-seal-${n}`, ([f, w]) => { const m = T.fresh(2); m.active = true; m.launch(); T.park(m); m.nextLunge = Infinity; m.seal.hp = Math.max(1, Math.round(m.seal.maxHP * f)); m.seal.ward = w; m.floorTime = 3; T.step(0.05, false); }, [f, w]);
    }
    await shot("34-seal-ward-chip", () => { const m = T.M(); m.seal.ward = 5; m.seal.hp = m.seal.maxHP; Object.assign(m.balls[0], { caught: false }); m.damageSeal(1, "ball"); T.step(0.12, false); });
    await shot("35-seal-hit", () => { const m = T.M(); m.seal.ward = 0; m.damageSeal(1, "ball"); T.step(0.1, false); });
    await shot("36-seal-feed", () => {
      const m = T.fresh(2); m.active = true; m.launch(); T.park(m); m.nextLunge = Infinity; m.seal.ward = 0;
      const l = m.makeLunge(T.win(m, "mooncoil", false), { teaching: false }); m.lunges = [l]; T.until(() => l.stage === "strike", 4000); T.until(() => m.effects.some((e) => e.kind === "seal-feed" && e.age > 0.25), 600, false);
    });
    await shot("37-f3-ward-full", () => { const m = T.M(); m.lunges = []; m.seal.ward = 6; T.step(0.9, false); });
    await shot("37b-f2-seal-open", () => { const m = T.fresh(1); m.active = true; m.launch(); T.park(m); m.nextLunge = Infinity; m.seal.hp = 1; m.seal.ward = 0; m.damageSeal(1, "ball"); T.step(0.3, false); });
    await shot("37c-f2-climb", () => { T.step(0.6, false); });
    await shot("37d-arrive-f3", () => { T.step(0.9, false); });
    // ---------- floor 3: twin seal ----------
    await shot("38-f3-serve", () => { T.fresh(2, true); });
    await shot("39-f3-play", () => { const m = T.begin(2); m.nextLunge = 99; T.step(3.5); m.paddle.streak = 3; m.charge = 100; m.seal.ward = 3; });
    await shot("40-f3-two-snakes", () => {
      const m = T.fresh(2); m.active = true; m.launch(); T.park(m); m.nextLunge = Infinity; m.seal.ward = 2;
      const a = m.makeLunge(T.win(m, "gnash", false), { teaching: false }), b = m.makeLunge(m.windows.filter((w) => w.snake === "mooncoil" && !w.cross)[1], { teaching: false }); m.lunges = [a, b];
      T.until(() => a.stage === "strike", 4000); T.step(0.18, false);
    });
    await shot("41-f3-real-clash-f0", () => {
      const m = T.fresh(2); m.active = true; m.launch(); T.park(m); m.nextLunge = Infinity; m.seal.ward = 3;
      const a = m.makeLunge(T.win(m, "gnash", true), { teaching: false }), b = m.makeLunge(T.win(m, "mooncoil", true), { teaching: false }); m.lunges = [a, b];
      T.until(() => m.effects.some((e) => e.kind === "clash"), 4000); T.step(0.04, false);
    });
    await shot("42-f3-real-clash-f1", () => { T.step(0.1, false); });
    await shot("43-f3-real-clash-f2", () => { T.step(0.12, false); });
    await shot("44-f3-capsule-falls", () => { T.step(0.8, false); });
    await shot("45-f3-dizzy-capsule", () => { T.step(0.6, false); });
    await shot("46-f3-power-ward", () => { const m = T.begin(2); m.nextLunge = 99; m.charge = 100; T.step(1.5); T.L().activateKitPower(); T.L().chooseSpacePower("shield"); T.step(0.4); });
    await shot("47-f3-power-arrows", () => { const m = T.M(); m.ward = null; m.charge = 100; T.L().activateKitPower(); T.L().chooseSpacePower("arrows"); T.step(1.2); });
    await shot("48-f3-ram-ball", () => { const m = T.M(), b = m.balls[0]; Object.assign(b, { x: 150, y: 420, vx: 90, vy: -330, r: 13.2, ram: 1.6, ramBricks: 10, caught: false }); m.paddle.armed = true; m.paddle.streak = 3; });
    // ---------- shatter / victory / result ----------
    await shot("49-f3-seal-final-hit", () => {
      const m = T.fresh(2); m.active = true; m.launch(); T.park(m); m.nextLunge = Infinity; m.seal.ward = 0; m.seal.hp = 1; m.lives = 3; m.clashes = 1; m.damageSeal(1, "ball"); T.step(0.15, false);
    });
    await shot("50-f3-shatter-a", () => { T.step(0.35, false); });
    await shot("51-f3-shatter-b", () => { T.step(0.6, false); });
    await shot("52-f3-shatter-c", () => { T.step(0.9, false); });
    await shot("53-victory-state", () => { T.until(() => T.M().state === "won", 600); });
    await shot("54-result-won", () => { for (let i = 0; i < 160; i++) T.draw(); });
    await shot("55-result-lost-offer", () => { const m = T.fresh(2); m.active = true; m.state = "lost"; m.reason = "No balls remaining"; for (let i = 0; i < 130; i++) T.draw(); });
    await shot("56-result-lost", () => { for (let i = 0; i < 900; i++) T.draw(); });
    await page.close();
  }
} finally {
  await browser.close();
}
writeFileSync(`${OUT}/errors.txt`, errors.join("\n") || "none\n");
console.log(errors.length ? errors.join("\n") : "no page errors");
