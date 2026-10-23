import HOARD_ART from '../../../assets/hoard/manifest.json' with { type: 'json' };
import { sitterSkin } from './sitter.js';

// Ember, the first "big sitter" skin: the art half (pose keys, measured circles, eye and prop keys) comes from
// assets/hoard/manifest.json (art/hoard/build.py); this file adds his numbers. In Dragon's Hoard he is scenery behind the
// cave ledge (solid false), so his circles are carried for a later chapter that fights him.
export const EMBER = sitterSkin(HOARD_ART.skins.ember, {
  name: 'Ember', pivot: [96, 147], scale: 1, rest: 'sleep', tellPose: 'windup',
  // Each attack's landing pose: his breath for the wake roar and floor-3 breath, the tail sweep for the paddle roar.
  attacks: { wake: 'breath', breath: 'breath', roar: 'sweep' },
  // Recent moods in priority order: a chime sings him dizzy, broken treasure hurts, a lost ball (or a crash) makes him gloat.
  moods: [['chime', 'dizzy', 1.6], ['treasure', 'hurt', .9], ['crash', 'sweep', .8], ['lost', 'stir', 1.6]],
  numbers: { easy: { tell: 1.8, release: .6, calm: 3 }, medium: { tell: 1.6, release: .6, calm: 3 }, hard: { tell: 1.4, release: .6, calm: 3 } },
});
// Named art keys the renderer tries in order (round-2 renders first; code or current sprites as the fallback).
export const EMBER_ART = { eye: HOARD_ART.skins.ember.eye, props: HOARD_ART.skins.ember.props };
