import { test } from 'node:test';
import assert from 'node:assert/strict';
let decodes = 0;
globalThis.Image = class { decode() { decodes++; return Promise.resolve(); } };
const { loadImg, artLoaded } = await import('../src/gfx.js');
test('chapter preview and live scene share decoded artwork', async () => {
  const before = decodes, first = loadImg('test:chapter-art'), second = loadImg('test:chapter-art');
  await artLoaded();
  assert.equal(first, second);
  assert.equal(decodes, before + 1);
  assert.notEqual(loadImg('test:other-art'), first);
});
