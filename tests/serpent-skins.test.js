import { test } from 'node:test';
import assert from 'node:assert/strict';

globalThis.Image = class { complete = true; naturalWidth = 1; width = 512; height = 768; decode() { return Promise.resolve(); } };
const prefs = new Map();
globalThis.localStorage = { getItem: k => prefs.get(k) ?? null, setItem: (k, v) => prefs.set(k, v) };
const gradient = { addColorStop() {} }, context = new Proxy({}, { get: (_, k) => k === 'createLinearGradient' ? () => gradient : () => {} });
globalThis.document = { createElement: () => ({ getContext: () => context }) };
const { Vault, SERPENT_SKINS } = await import('../src/vault.js');

test('a serpent skin changes only the look: same rig, route, speed and expressions', () => {
  const plain = new Vault(360, 729, 1, 'medium'), ember = new Vault(360, 729, 1, 'medium', { serpent: 'ember' });
  assert.equal(plain.serpentSkin, SERPENT_SKINS.emerald, 'emerald stays the default');
  assert.equal(ember.serpentSkin, SERPENT_SKINS.ember);
  assert.deepEqual(ember.snake.cells, plain.snake.cells);
  assert.deepEqual(ember.snakePlan(), plain.snakePlan());
  assert.equal(ember.snakeSpeed, plain.snakeSpeed);
  for (const key of ['body', 'dark', 'mid', 'belly', 'venom', 'ring', 'wetEdge', 'steam'])
    assert.ok(SERPENT_SKINS.ember[key] && SERPENT_SKINS.ember[key] !== SERPENT_SKINS.emerald[key], `ember has its own ${key}`);
  for (const key of ['spray', 'strand', 'drop', 'wet', 'bead']) assert.equal(SERPENT_SKINS.ember[key].length, SERPENT_SKINS.emerald[key].length);
});

test('an unknown skin falls back to emerald', () => {
  assert.equal(new Vault(360, 729, 1, 'easy', { serpent: 'nope' }).serpentSkin, SERPENT_SKINS.emerald);
});
