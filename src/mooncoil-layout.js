// A single granite spine makes the upper tunnel take the long way around.
// Three violet gallery checkpoints and Lumi's apron buy time by real chewing.
export const POCKET = Object.freeze({ c0: 1, c1: 6, r0: 6, r1: 8 });
export const BANKS = Object.freeze([
  Object.freeze({ c0: 12, c1: 19, r0: 4, r1: 6, color: 'b' }),
  Object.freeze({ c0: 10, c1: 17, r0: 9, r1: 11, color: 'c' }),
  Object.freeze({ c0: 0, c1: 7, r0: 15, r1: 17, color: 't' }),
]);
// rivalAt: seconds of rescue before Gnash, the second serpent, drops from his own tunnel (warned RIVAL.tell earlier).
// rivalSpeed scales his chewing against Mooncoil's.
export const MODE = Object.freeze({
  easy: Object.freeze({ cageHP: 6, speed: .40, charge: 10, rivalAt: 12, rivalSpeed: .8 }),
  medium: Object.freeze({ cageHP: 8, speed: .54, charge: 12, rivalAt: 9, rivalSpeed: .9 }),
  hard: Object.freeze({ cageHP: 10, speed: .70, charge: 14, rivalAt: 6, rivalSpeed: 1 }),
});
// When one serpent's head runs into the other, both reel back dizzy and the fight sheds a power-up.
export const RIVAL = Object.freeze({ column: 10, tell: 1.8, clashStun: 2.2, clashKnock: 3, clashCooldown: 6 });
export const bankFor = (c, r) => BANKS.findIndex(b => c >= b.c0 && c <= b.c1 && r >= b.r0 && r <= b.r1);
export const LAYOUT = Object.freeze([
  '........#...........',
  '........#...........',
  '........#vvvvvvvvvvv',
  '........#...........',
  '........#...bbbbbbbb',
  '#########...bbgbbbbb',
  '#======v#...bbbbbbbb',
  '#======v#...........',
  '#======v#vvvvvvvvvvv',
  '#vvvvvvv#.cccccccc..',
  '........#.cccgcccc..',
  '........#.cccccccc..',
  '........#vvvvvvvvvvv',
  '........#...........',
  '........#...........',
  'tttttttt............',
  'tttgtttt............',
  'tttttttt............',
  '....................',
  '....................',
]);
// Round-3 castle specials (src/castle-specials.js), [row, col] of a two-cell, one-hit brick's left cell. The two blue and
// coral galleries are the serpents' chewing checkpoints: armour makes them chew longer (and costs the ball two hits), a mine in
// each bank shatters the bricks round it (and so opens the serpents' road too), coins pay a bonus. Gold bricks are chests.
export const SPECIALS = Object.freeze({ armour: [[4, 12], [6, 18], [10, 10], [11, 13]], mine: [[5, 15], [10, 14]], coin: [[4, 16], [9, 13]] });
