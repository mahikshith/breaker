// Continue screen v2 captures: the "so close" loss panel (fuse running and spent) and the back-in-action serve.
// Usage: PW_MODULE=<playwright index.mjs> node tools/playtest/continue-v2.mjs <out> [html]
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(process.env.PW_MODULE || 'playwright');
const [OUT = 'out/continue-v2', HTML = 'dist/breach.html'] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });

// Each scenario plays its chapter to a believable late loss inside the page (level index, then a setup run there).
const SCENES = {
  vault: { idx: 1, setup: () => {
    const l = __breach.level; l.wardCoachSeen = true; l.skipIntro(); while (l.phase === 'intro') l.update(1 / 120);
    // break the bricks on Lumi's way out until three are left, then let the serpent win
    for (let guard = 0; l.freeCost() > 3 && guard < 200; guard++) {
      const now = l.freeCost(), br = l.bricks.find(b => !b.gone && b.kind !== 9 && (() => { const k = b.r * 20 + b.c, keep = [...l.grid.cells.slice(k, k + b.n)]; for (let i = 0; i < b.n; i++) l.grid.cells[k + i] = 0; const c = l.freeCost(); keep.forEach((v, i) => l.grid.cells[k + i] = v); return c < now; })());
      if (!br) break; l.removeBrick(br, null);
    }
    for (let i = 0; i < 120; i++) l.update(1 / 120);
    l.score = 4200; l.fail('The serpent caught the princess');
  } },
  gatehouse: { idx: 8, setup: () => {
    const l = __breach.level, m = l.m; m.buildFloor(2); m.active = true; m.floorTime = m.time = 14; m.phase = 'play'; m.score = 6150; m.lives = 1;
    m.villain.hp = 3; m.bricks.forEach((b, i) => { if (b.type === 'armour' || i % 3) b.hp = 0; });
    m.lose('No balls remaining');
  } },
  lumi: { idx: 9, setup: () => {
    const l = __breach.level, m = l.m; m.buildFloor(2); m.active = true; m.floorTime = m.time = 14; m.phase = 'play'; m.score = 5400; m.lives = 1;
    m.bell.rings = m.bell.need - 2; m.bricks.forEach((b, i) => { if (i % 2) b.hp = 0; });
    m.lose('No balls remaining');
  } },
};

const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
const errors = [];
try {
  for (const [name, scene] of Object.entries(SCENES)) {
    const page = await browser.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, hasTouch: true });
    page.on('pageerror', e => errors.push(`${name}: ${e.message}`));
    await page.goto(pathToFileURL(resolve(HTML)).href + '?safe=59,34');
    await page.waitForFunction(() => window.__breach?.ready, null, { timeout: 30000 });
    await page.evaluate(() => Promise.all([document.fonts.load('16px "Lilita One"'), document.fonts.load('600 12px Rubik')]));
    await page.evaluate(({ idx, src }) => { localStorage.setItem('breach.losses', '3'); __breach.start(idx); (0, eval)(`(${src})`)(); }, { idx: scene.idx, src: scene.setup.toString() });
    await page.waitForTimeout(2200);
    await page.screenshot({ path: `${OUT}/${name}-continue-393x852.png` });
    if (name === 'gatehouse') { await page.waitForTimeout(7600); await page.screenshot({ path: `${OUT}/${name}-continue-fuse-spent-393x852.png` }); }
    {
      await page.evaluate(() => __breach.buttons.find(b => /Watch ad|Continue/.test(b.label || '')).fn());
      await page.waitForTimeout(1600); await page.screenshot({ path: `${OUT}/${name}-ad-placeholder-393x852.png` });
      await page.waitForTimeout(2000); // the 3 s placeholder ad, then back in action
      await page.screenshot({ path: `${OUT}/${name}-back-in-action-393x852.png` });
      const held = await page.evaluate(() => ({ state: __breach.level.state, hold: __breach.level.backHold }));
      if (held.state !== 'play' || !held.hold) errors.push(`${name}: not holding the serve after Continue (${JSON.stringify(held)})`);
    }
    await page.close();
  }
} finally { await browser.close(); }
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`wrote ${OUT}`);
