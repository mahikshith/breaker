import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { HOARD_LAYOUT } from '../src/fantasy/hoard.js';

const load = p => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8')).sprites;

test('round-2 Hoard props: the drawn gate and molten bricks are their colliders, the eye has five stages', () => {
  const h = load('../assets/hoard/manifest.json'), L = HOARD_LAYOUT;
  assert.deepEqual(h['prop/gate_0'].drawSize, [L.gate.w, L.gate.h]); assert.deepEqual(h['prop/gate_0'].contact, [0, 0, L.gate.w, L.gate.h]);
  for (const k of ['prop/gate_1', 'prop/gate_2']) assert.equal(h[k].anchor[1], 0, `${k} hangs from the gate's top edge`);
  for (const k of ['prop/molten_0', 'prop/molten_1', 'prop/molten_2']) { assert.deepEqual(h[k].drawSize, [L.bw, L.bh]); assert.deepEqual(h[k].contact, [0, 0, L.bw, L.bh]); }
  for (let i = 0; i < 5; i++) assert.ok(h[`eye/${i}`], `eye stage ${i}`);
  assert.ok(!h['prop/sunstone'], 'the Crown was chosen: no Sunstone packed');
  assert.ok(h.cave.drawSize[1] >= 814, 'the cave plate covers the tallest playfield');
});

test('round-2 capsules, crates and splash: every power has a capsule; bodies sit inside their sprites', () => {
  const r = load('../assets/round2/manifest.json');
  for (const k of ['split', 'fire', 'wide', 'focus', 'burst', 'laser', 'shield', 'slow', 'shrink']) assert.ok(r[`cap/${k}`], k);
  for (const k of ['crate/0', 'crate/1', 'crate/2', 'crate_sq/0', 'crate_sq/1', 'crate_sq/2', 'splash/0', 'splash/1', 'splash/2', 'splash/3']) assert.ok(r[k], k);
  for (const [k, s] of Object.entries(r)) {
    const [x, y, w, h] = s.body; assert.ok(x >= 0 && y >= 0 && x + w <= s.drawSize[0] + 1e-6 && y + h <= s.drawSize[1] + 1e-6 && w > 0 && h > 0, k);
  }
  for (let i = 0; i < 4; i++) assert.equal(r[`splash/${i}`].anchor[1], r[`splash/${i}`].drawSize[1], 'splash stands on its water line');
});
