// Native capture checks. Usage: node tools/playtest/capture.mjs <out> [html]
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";
const { chromium } = await import(process.env.PW_MODULE || "playwright");
const [OUT = "out/capture-final", HTML = "dist/breach.html"] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const hash = () => createHash("sha256").update(readFileSync(HTML)).digest("hex"), report = { testedSha256: hash(), note: "Natural no-contact loss plus labelled alternate-approach and incoming-ball regression fixtures; not a new human balance test.", devices: {} };
const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
try {
  for (const [device, d] of Object.entries({ ios: { width: 393, height: 852, safe: "59,34" }, android: { width: 412, height: 915, safe: "32,24" } })) {
    const page = await browser.newPage({ viewport: d, deviceScaleFactor: 2, hasTouch: true }), errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.addInitScript(() => {
      window.requestAnimationFrame = (fn) => {
        window.__nextFrame = fn;
        return 1;
      };
    });
    await page.goto(pathToFileURL(resolve(HTML)).href + `?safe=${d.safe}`);
    await page.waitForTimeout(1400);
    await page.evaluate(async () => {
      await Promise.all([document.fonts.load('16px "Lilita One"'), document.fonts.load("600 16px Rubik")]);
      await document.fonts.ready;
      let clock = performance.now();
      const draw = (frames = 1) => {
        const l = __breach.level, u = l.update;
        l.update = () => {
        };
        for (let i = 0; i < frames; i++) __nextFrame(clock += 1e3 / 60);
        l.update = u;
      };
      const step = (seconds) => {
        const l = __breach.level;
        for (let i = 0; i < Math.round(seconds * 120); i++) l.update(1 / 120);
        draw();
      };
      const fresh = () => {
        __breach.start(1);
        const l = __breach.level;
        l.wardCoachSeen = true;
        l.skipIntro();
        while (l.phase === "intro") l.update(1 / 120);
        return l;
      };
      const natural = () => {
        const l = fresh();
        let i = 0;
        while (!l.snake.attack && i++ < 12e3) l.update(1 / 120);
        if (!l.snake.attack) throw Error("No natural attack");
        return l;
      };
      const to = (target) => {
        const l = __breach.level;
        while (l.snake.attack.t < target && l.state === "play") l.update(1 / 120);
        draw();
      };
      const state = () => {
        const l = __breach.level, pts = l.snakePoints(), cap = l.capturePose();
        return { t: l.t, phase: l.phase, state: l.state, attack: l.snake.attack ? { t: l.snake.attack.t, struck: l.snake.attack.struck } : null, cap, head: pts[0], neckSpan: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y), maxLeadingSpan: Math.max(...pts.slice(0, 10).slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y))), finite: pts.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y)), bars: [...l.grid.cells].filter((v) => v === 8).length, capturePieces: l.debris.pieces.filter((p) => p.capture).map((p) => ({ t: p.t, life: p.life })), prX: l.pr.x, bubble: l.bubble?.text || null };
      };
      window.TCapture = { draw, step, fresh, natural, to, state };
    });
    const shot = (name) => page.screenshot({ path: `${OUT}/${device}-${name}.png` });
    const initial = await page.evaluate(() => {
      const l = TCapture.fresh();
      return { bricks: l.bricks.length, path: l.snakePlan(), hits: l.venom.contacts.hits };
    });
    assert.equal(initial.bricks, 219);
    assert.equal(initial.path.path.length, 40);
    assert.equal(initial.hits, 0);
    await page.evaluate(() => {
      TCapture.natural();
    });
    const timeline = [];
    for (const t of [0.5, 0.64, 1.18, 1.225, 1.48, 1.65, 1.95, 2.35, 2.71]) {
      const s = await page.evaluate((t2) => {
        TCapture.to(t2);
        return TCapture.state();
      }, t);
      assert(s.finite);
      if (t < 1.22) {
        assert.equal(s.cap, null);
        assert.equal(s.bars, 18);
      } else {
        assert(s.cap);
        assert.equal(s.bars, 0);
        assert.equal(s.bubble, null);
      }
      if (t >= 1.95) {
        assert(s.neckSpan < 24);
        assert(s.maxLeadingSpan < 35);
        assert.equal(s.capturePieces.length, 0);
      }
      await shot(`scene-${Math.round(t * 1e3)}`);
      timeline.push(s);
    }
    const terminal = await page.evaluate(() => {
      const l = __breach.level, before = { attack: l.snake.attack.t, cap: l.capturePose(), cells: JSON.stringify(l.snake.cells), grid: [...l.grid.cells] };
      TCapture.step(3);
      const after = { attack: l.snake.attack.t, cap: l.capturePose(), cells: JSON.stringify(l.snake.cells), grid: [...l.grid.cells] };
      TCapture.draw(90);
      return { before, after, state: l.state };
    });
    assert.deepEqual(terminal.after, terminal.before);
    assert.equal(terminal.state, "lost");
    await shot("loss-continue");
    const restored = await page.evaluate(() => {
      const l = __breach.level;
      l.continueRun();
      TCapture.draw();
      return { phase: l.phase, state: l.state, attack: l.snake.attack, cap: l.capturePose(), x: l.pr.x, depth: l.pr.depth, bars: [...l.grid.cells].filter((v) => v === 8).length };
    });
    assert.deepEqual(restored, { phase: "rescue", state: "play", attack: null, cap: null, x: 180, depth: 0, bars: 18 });
    await shot("continued");
    const defence = [];
    for (const t of [1.18, 1.24]) {
      const r = await page.evaluate((t2) => {
        const l = TCapture.natural();
        TCapture.to(t2);
        const p = l.snakePoints()[0], b = l.balls[0], before = { t: l.snake.attack.t, struck: l.snake.attack.struck };
        Object.assign(b, { caught: false, x: p.x, y: p.y + 11 * l.growth() + b.r - 1, vx: 0, vy: -220 });
        l.ballVsSnake();
        return { before, attack: !!l.snake.attack, phase: l.phase, stun: l.snake.stun, hits: l.venom.contacts.hits, cap: l.capturePose() };
      }, t);
      if (t < 1.22) {
        assert.equal(r.attack, false);
        assert.equal(r.cap, null);
        assert(r.stun >= 4);
        assert.equal(r.hits, 1);
      } else {
        assert.equal(r.attack, true);
        assert.equal(r.phase, "caught");
        assert.equal(r.hits, 0);
      }
      defence.push(r);
    }
    const approaches = [];
    for (const c of [7, 8, 9, 10, 11, 12]) {
      const r = await page.evaluate((c2) => {
        const l = TCapture.fresh(), s = l.snake;
        s.cells = Array.from({ length: 12 }, (_, i) => [c2, 6 + i]);
        s.prog = 1;
        s.look = s.dir = -Math.PI / 2;
        s.faceLeft = c2 >= 10;
        l.pr.x = 180;
        l.startAttack();
        TCapture.to(1.95);
        return TCapture.state();
      }, c);
      assert(r.finite);
      assert(r.maxLeadingSpan < 35);
      assert.equal(r.cap.x, c < 10 ? 200 : 160);
      assert.equal(r.head.x, c < 10 ? 164 : 196);
      assert.equal(r.head.y, 164);
      assert(r.cap.x - 18 - 3.8 >= 132 && r.cap.x + 18 + 3.8 <= 228);
      approaches.push({ column: c, ...r });
      if (c === 12) await shot("mirrored-approach-fixture");
    }
    const debris = await page.evaluate(() => {
      const l = TCapture.natural();
      TCapture.to(1.18);
      const br = l.bricks.find((b) => !b.gone), first = l.debris.pieces.length;
      l.debris.shatter(l.art(br), 24, 100, 8, 8, 0, 0, 2);
      const other = l.debris.pieces.slice(first);
      for (const p of other) p.life = 5;
      TCapture.to(1.24);
      const captured = l.debris.pieces.filter((p) => p.capture);
      return { otherLives: other.map((p) => p.life), otherTagged: other.some((p) => p.capture), captureLives: captured.map((p) => p.life) };
    });
    assert(debris.otherLives.length > 0);
    assert(debris.otherLives.every((t) => t === 5));
    assert.equal(debris.otherTagged, false);
    assert(debris.captureLives.length > 0 && debris.captureLives.every((t) => t <= 0.38));
    assert.deepEqual(errors, []);
    report.devices[device] = { initial, timeline, terminal, restored, defence, approaches, debris, errors };
    await page.close();
  }
} finally {
  await browser.close();
}
assert.equal(hash(), report.testedSha256);
writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ hash: report.testedSha256, devices: Object.keys(report.devices), errors: [] }));
