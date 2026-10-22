// A single granite spine makes the upper tunnel take the long way around.
// Three violet gallery checkpoints and Lumi's apron buy time by real chewing.
export const POCKET = Object.freeze({ c0: 1, c1: 6, r0: 6, r1: 8 });
export const BANKS = Object.freeze([
  Object.freeze({ c0: 12, c1: 19, r0: 4, r1: 6, color: 'b' }),
  Object.freeze({ c0: 10, c1: 17, r0: 9, r1: 11, color: 'c' }),
  Object.freeze({ c0: 0, c1: 7, r0: 15, r1: 17, color: 't' }),
]);
export const MODE = Object.freeze({
  easy: Object.freeze({ cageHP: 6, speed: .40, charge: 10 }),
  medium: Object.freeze({ cageHP: 8, speed: .54, charge: 12 }),
  hard: Object.freeze({ cageHP: 10, speed: .70, charge: 14 }),
});
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
