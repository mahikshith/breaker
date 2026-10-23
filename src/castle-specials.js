// Round-3 castle specials (assets/round3/bricks, castle row), the rules shared by the Vault, Mooncoil and the fantasy chapters
// (their painted sprites and effects live in src/castle-art.js). The pattern is Frost Warden's (src/frost.js): armour bricks take
// two hits (a ram, fire or the titan breaks them outright) and bounce the ball like any brick while they survive; a mine blasts
// every brick within a radius of its centre, chaining into other mines, and never touches bars, pins, steel, granite or a boss;
// payload bricks are chests; a coin brick pays a bonus and throws a small glint. Levels tag bricks from a { armour, mine, coin }
// map of [row, col] pairs. This file is pure (no art), so the models stay testable without a DOM.
export const COIN_BONUS = 60;
export const BLAST_LIFE = .55;

// Tag the bricks at the listed [row, col] cells. ok(brick) says which bricks may take a special (ordinary ones only).
// Armour doubles the brick's hit points; the returned list is what was tagged.
export function tagSpecials(bricks, spec, ok = b => b.type === 'brick') {
  const out = [];
  for (const [sp, cells] of Object.entries(spec || {})) for (const [row, col] of cells) {
    const b = bricks.find(q => q.row === row && q.col === col && ok(q));
    if (!b) continue;
    b.sp = sp; if (sp === 'armour') b.hp = b.maxHP = 2;
    out.push(b);
  }
  return out;
}
// Bricks a mine at m shatters: every other live brick whose centre is within R, that the level allows (canBreak).
export function blastVictims(bricks, m, R, canBreak = () => true) {
  const cx = m.x + m.w / 2, cy = m.y + m.h / 2;
  return bricks.filter(o => o !== m && o.hp > 0 && canBreak(o) && Math.hypot(o.x + o.w / 2 - cx, o.y + o.h / 2 - cy) <= R);
}
// Armour breaks outright for a ram, fire or the titan; everything else costs one hit.
export const armourOutright = ball => !!ball && !!(ball.fire || ball.titan > 0 || ball.ram > 0);

// ---- the fantasy chapters' models (Bellforge, Gatehouse, Lumi, Rivals, Hoard): level.bricks, level.hitBrick(brick, ball), level.effect() ----
// Called once a special brick's hit points reach 0: a coin pays its bonus and pops, a mine blasts.
export function brickSpecial(level, b, ball, R, blastable) {
  if (b.sp === 'coin') { level.score += COIN_BONUS; level.effect(b.x + b.w / 2, b.y + b.h / 2, 'coin-pop', .7); }
  else if (b.sp === 'mine') mineBlast(level, b, ball, R, blastable);
}
// Every brick within R of the mine takes a killing hit through the level's own hitBrick (so it scores, charges, drops and
// chains like any break); blastable(b) keeps bars, pins, steel and the like out of it.
export function mineBlast(level, m, ball, R, blastable) {
  level.effect(m.x + m.w / 2, m.y + m.h / 2, 'mine-blast', BLAST_LIFE);
  for (const o of blastVictims(level.bricks, m, R, blastable)) if (o.hp > 0) { o.hp = 1; level.hitBrick(o, ball); }
}
