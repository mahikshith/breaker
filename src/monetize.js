// Continue offers after a loss. Everything here is a placeholder with the shape of the real thing:
// swap watchAd() for a rewarded-ad SDK call and buyFullGame() for a store purchase, or set MODE to 'free'
// to ship the whole game free (continues then cost nothing and the unlock button disappears).
import { store } from './prefs.js';

export const MODE = 'ads';            // 'ads' | 'free'
export const PRICE = '$2.99';         // shown on the unlock button; the store would supply the localised price
export const AD_CONTINUES = 2;        // ad-funded continues per attempt
export const AD_SECONDS = 3;          // length of the placeholder ad

export const isUnlocked = () => MODE === 'free' || !!store.get('unlocked');

// What the continue panel offers right now: 'free' continue, 'ad' continue, or nothing.
export function continueOffer(used) {
  if (isUnlocked()) return 'free';
  return used < AD_CONTINUES ? 'ad' : null;
}

// Resolves true when the player earned the reward. The placeholder "plays" for AD_SECONDS while the game draws
// its own countdown card; a real SDK shows its own UI and resolves on the reward callback.
export function watchAd() { return new Promise(r => setTimeout(() => r(true), AD_SECONDS * 1000)); }

// Resolves true when the purchase went through. Placeholder: unlocks immediately.
export function buyFullGame() { store.set('unlocked', true); return Promise.resolve(true); }
