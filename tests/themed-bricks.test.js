import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const atlas = ch => JSON.parse(readFileSync(new URL(`../assets/themed-bricks/${ch}/atlas.json`, import.meta.url), 'utf8'));
// The materials each chapter's lookup asks for (src/frost.js, src/fantasy/render.js, lumi-render.js, rivals-render.js,
// src/mooncoil.js, src/vault.js); breaking frames are what the break effect cuts its pieces from.
const NEEDS = {
  frost: ['ice', 'blue', 'violet'],
  gatehouse: ['gules', 'argent', 'vert', 'iron'],
  bellforge: ['verdigris', 'bronze', 'bellmetal', 'pin'],
  tower: ['stone', 'rose', 'slate', 'jade', 'amber', 'emerald', 'amethyst'],
  mooncoil: ['moonstone', 'rosemoon', 'silver', 'starlit'],
  vault: [],
};

test('themed bricks: every set has its materials, a breaking frame to cut, and 1- and 2-cell unbreakable bars', () => {
  for (const [ch, mats] of Object.entries(NEEDS)) {
    const a = atlas(ch), s = a.sprites;
    for (const cells of [1, 2]) assert.ok(s[`bar_${cells}_0`], `${ch}: bar_${cells}_0`);
    for (const m of mats) {
      assert.ok(a.palette[m]?.length === 4, `${ch}/${m}: FX palette`);
      const cells = ch === 'mooncoil' ? [1, 2] : [2];
      for (const n of cells) assert.ok(s[`${m}_${n}_0`], `${ch}/${m}_${n}_0`);
      if (ch !== 'mooncoil') assert.ok(s[`${m}_2_2`], `${ch}/${m}: breaking frame`);
    }
    for (const m of ['iron', 'pin']) if (mats.includes(m)) assert.ok(s[`${m}_2_1`], `${ch}/${m}: cracked frame for the two-hit brick`);
    if (ch === 'mooncoil') for (const m of mats) for (const n of [1, 2]) assert.ok(s[`${m}_${n}_1`], `${ch}/${m}_${n}_1`);
  }
});

test('themed bricks: sprites carry the glaze-v2 contract (ppu 3, 4-unit margin, face = footprint)', () => {
  for (const ch of Object.keys(NEEDS)) for (const [k, s] of Object.entries(atlas(ch).sprites)) {
    assert.equal(s.ppu, 3, k); assert.equal(s.margin, 4, k);
    assert.deepEqual(s.drawSize, [s.footprint[0] + 8, s.footprint[1] + 8], k);
    assert.deepEqual(s.px, [s.drawSize[0] * 3, s.drawSize[1] * 3], k);
    assert.equal(s.cells === 1, s.footprint[0] === s.footprint[1], `${ch}/${k}: one cell is square`);
  }
});
