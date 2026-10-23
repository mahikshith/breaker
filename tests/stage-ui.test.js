import { test } from 'node:test';
import assert from 'node:assert/strict';

globalThis.Image = class { complete = true; naturalWidth = 256; naturalHeight = 256; width = 256; height = 256; decode() { return Promise.resolve(); } };
const ctx = () => { const f = new Proxy(function () {}, { get: (_, k) => k === 'addColorStop' ? () => {} : f, apply: () => f, set: () => true }); return f; };
globalThis.document = { createElement: () => ({ getContext: () => ctx(), width: 0, height: 0 }) };

const { pipTrack, stageCard, stageBanner, crestMedallion } = await import('../src/fantasy/stage-ui.js');

test('the shared pip track draws the villain crest it is given, flagged now on the last stage and done once won', () => {
  const calls = [];
  const crest = (c, x, y, r, s) => calls.push({ x, y, r, ...s });
  pipTrack(ctx(), { cx: 180, title: 'ANY SIEGE', count: 4, cleared: 1, current: 1, time: 2, crest });
  pipTrack(ctx(), { cx: 180, title: 'ANY SIEGE', count: 4, cleared: 3, current: 3, time: 2, crest });
  pipTrack(ctx(), { cx: 180, title: 'ANY SIEGE', count: 4, cleared: 4, current: 3, time: 2, crest });
  assert.equal(calls.length, 3);
  assert.deepEqual(calls.map(c => [c.now, c.done]), [[false, false], [true, false], [true, true]]);
  assert.ok(calls.every(c => c.r > 7 && c.x > 180), 'the crest is the bigger last pip, right of centre');
});

test('the stage card, banner and a crest-less medallion draw without a villain-specific dependency', () => {
  for (const t of [0, .3, 1.1, 1.3]) stageCard(ctx(), { width: 360, y: 300, t, name: 'Any Stage', stake: 'One line.', index: 1, count: 4 });
  stageBanner(ctx(), { width: 360, text: 'STAGE CLEAR', sub: 'CARRY', t: .5, life: 2 });
  crestMedallion(ctx(), 10, 10, 8, { theme: { villain: '#88ccff' } });
});
