import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
globalThis.Image = class { complete = true; naturalWidth = 256; decode() { return Promise.resolve(); } };
const { spaceCompanionId, spacePowerLayout, spacePowerAt, spacePowerDetail, companionFrame, nixExpression } = await import('../src/space-companions.js');
const { difficulty } = await import('../src/difficulty.js');
const manifest = JSON.parse(readFileSync(new URL('../assets/circuit-companions/manifest.json', import.meta.url)));
const level = (scale = 393 / 360, H = 729) => ({ W: 360, H, kitUIScale: scale, kitAnchor: () => ({ x: 30 / scale, y: H - 34 / scale, r: 26 / scale }), companionLimits: () => difficulty('hard').spacePowers, balls: [{}, { dead: true }], canUseCorePower: () => true, state: 'play', phase: 'relay', kitTime: 5, coreCastAt: -10 });

test('selected Circuit identity and unselected Forge control never dispatch the Carrier face', () => {
  assert.equal(spaceCompanionId({ companionId: 'vesper' }), 'vesper');
  assert.equal(spaceCompanionId({ name: 'Circuit Breakout' }), 'vesper');
  assert.equal(spaceCompanionId({ name: 'Shutter Forge' }), 'forge');
  assert.equal(spaceCompanionId({ companionId: 'forge' }), 'forge');
  assert.equal(spaceCompanionId({ companionId: 'nix' }), 'nix');
});
test('three premium targets fit both phones, stay clear of the live face and have disjoint large hit areas', () => {
  for (const [scale, H] of [[393 / 360, 729], [412 / 360, 785]]) {
    const l = level(scale, H), a = spacePowerLayout(l);
    assert(a.x >= 0 && a.x + a.w <= l.W); assert(a.y > 44 / scale);
    assert(a.y + a.h < l.kitAnchor().y - l.kitAnchor().r);
    assert.equal(a.choices.length, 3);
    a.choices.forEach((c, i) => { assert(c.w * scale > 100 && c.h * scale >= 140); assert.equal(spacePowerAt(l, c.x + c.w / 2, c.y + c.h / 2), c.id); if (i) assert(c.x > a.choices[i - 1].x + a.choices[i - 1].w); });
    assert.equal(spacePowerAt(l, a.close.x + 22 / scale, a.close.y + 22 / scale), 'close');
    l.kitPowers = true; assert.equal(spacePowerLayout(l).choices.length, 4); assert(Math.abs(spacePowerLayout(l).h * scale - 122) < 1e-9);
  }
});
test('card details use the actual mode duration and live-ball budget, excluding dead balls', () => {
  for (const id of ['easy', 'medium', 'hard']) {
    const l = level(), limits = difficulty(id).spacePowers; l.companionLimits = () => limits;
    assert.equal(spacePowerDetail(l, 'laser'), `${limits.duration}s · CAP ${limits.maxTime}s`);
    assert.equal(spacePowerDetail(l, 'titan'), `${limits.duration}s · ${limits.cosmic} COSMIC MAX`);
    assert.equal(spacePowerDetail(l, 'five'), `+4 BALLS · MAX ${limits.balls}`);
    l.balls = Array.from({ length: limits.balls }, () => ({})); assert.equal(spacePowerDetail(l, 'five'), `+0 BALLS · MAX ${limits.balls}`);
  }
});
test('new authored Vesper expressions and actual Latch approach/clamp/release frames use their own atlas clips', () => {
  assert.equal(companionFrame(manifest.families.vesper, 'loss', 5), 3);
  assert.equal(companionFrame(manifest.families.vesper, 'command', .1), 6);
  assert.equal(companionFrame(manifest.families.vesper, 'command', 10), 0);
  assert.equal(companionFrame(manifest.families.latch, 'approach', .2), 2);
  assert.equal(companionFrame(manifest.families.latch, 'clamp', .25), 4);
  assert.equal(companionFrame(manifest.families.latch, 'release', 1), 7);
  const l = level(); l.bolts = [{}]; assert.equal(nixExpression(l), 'warning'); l.state = 'lost'; assert.equal(nixExpression(l), 'loss');
});
