// Gatehouse Siege as four stages (design/phase2/stages-v2.md, Gatehouse row): the boards and the stage copy.
//   1 The Hoist (hook): Korr drags Lumi up the portcullis on his hoist, then leaves the winch ratcheting. Clear the arch.
//   2 Drawbridge (build): the two counterweight housings, Korr's winch and the bell rack; a chest in an iron chamber.
//   3 Murder holes (clash): the winch wheel walled off below, and Korr's murder hole in an iron pocket.
//   4 Inner gate (showdown): Korr on his dais behind a brick wall, two chest cages and a sliding iron tooth.
// Boards are written as rows of 17 half-column slots (a brick spans two): centre x = 180 + 20 * (k - 8), so the field is
// symmetric and bricks can stagger by half a brick. Rows count up from the bottom anchor B = paddle line - BOARD_GAP.
// Brick types: b brick, g gem (loot), c chest (2 hits, a big power), a armour (2 hits); A is armour from medium up and H
// armour on hard only, so the 2-hit share follows the stage plan per difficulty. Steel (riveted portcullis iron) is listed
// separately as bars; every brick and bar carries `kind` (brick, gem, chest, armour, steel) for the themed brick sets.
import { stagePlan } from './stages.js';

export const STAGE_COUNT = 4;
export const BRICK = { w: 36, h: 18, dx: 20, dy: 22 };
export const BOARD_GAP = 185;   // the lowest brick row ends this far above the paddle line
export const BAR = 8;           // iron bar thickness
export const MIN_GAP = 2.2 * 12;   // a chamber's gap is at least 2.2 ball diameters
export const GATEHOUSE_STAGES = [
  { name: 'The Hoist', stake: 'Clear the arch before Korr hoists Lumi away' },
  { name: 'Drawbridge', stake: 'Drop the bridge inside par to smash his bells' },
  { name: 'Murder holes', stake: 'Raise the gate before Korr’s third bell' },
  { name: 'Inner gate', stake: 'Korr makes his stand. Take the gate!' },
];
export const siegePlan = () => stagePlan(STAGE_COUNT);

// Stage boards, top row first. Stage 3 keeps clear of the right bell lane (the murder hole drops bells there) and
// stage 4 keeps its upper rows inside the ramps' drop lanes.
const MAPS = [
  [ // 1 The Hoist: an arch under the portcullis on diagonal legs, the chest between two iron posts
    '.....b.b.b.b.....',
    '...b.........b...',
    '..g...........g..',
    '.b......c......b.',
    'b...b.......b...b',
    '..b...b...b...b..',
    '....b.......b....',
    '......b...b......',
  ],
  [ // 2 Drawbridge: angled skirts under the housings, the chest chamber in the middle, gems on the flanks
    'g.b...b...b...b.g',
    '.b.b.........b.b.',
    '..a.b.......b.a..',
    'g..b.........b..g',
    '.b...b.....b...b.',
    '...H..g.b.g..H...',
    '.a...b.....b...a.',
    '...b..A.b.A..b...',
  ],
  [ // 3 Murder holes: two chevrons pointing at the wheel and the gate, armour braces, nothing in the right bell lane
    '..b.A.b.a.b.A....',
    '.b.b.a...a.b.b...',
    'b.g.b...b...b.g..',
    '..a...A.H.A...a..',
    '.b.b.b...b.b.b...',
    '..b.b..b.b..b.b..',
  ],
  [ // 4 Inner gate: Korr's brick wall (armour on the faces), the chest cages in the lower corners
    '......a.b.a......',
    '...a.b.a.a.b.a...',
    '....b.A.b.A.b....',
    '...H.a.b.b.a.H...',
    '...b..b...b..b...',
    '....a.A...A.a....',
    '......b.g.b......',
  ],
];
const TYPES = { b: 'brick', g: 'gem', c: 'chest', a: 'armour', A: 'armour', H: 'armour' };
const GEMS = ['gold', 'blue', 'rose'];

const ARMOUR_FROM = { A: 1, H: 2 };
const LEVEL = { easy: 0, medium: 1, hard: 2 };
export function parseMap(rows, B, difficulty = 'medium') {
  const cells = [], lv = LEVEL[difficulty] ?? 1;
  rows.forEach((row, i) => {
    if (row.length !== 17) throw new Error(`board row ${i} is ${row.length} slots, not 17`);
    const r = rows.length - 1 - i, y = B - BRICK.h - BRICK.dy * r;
    let last = -9;
    for (let k = 0; k < 17; k++) {
      const ch = row[k]; if (ch === '.') continue;
      if (!TYPES[ch]) throw new Error(`unknown brick '${ch}'`);
      if (k - last < 2 || k > 16) throw new Error(`bricks overlap in board row ${i} at slot ${k}`);
      last = k;
      let type = TYPES[ch];
      if (ch in ARMOUR_FROM && lv < ARMOUR_FROM[ch]) type = 'brick';
      const cell = { x: 180 + BRICK.dx * (k - 8) - BRICK.w / 2, y, w: BRICK.w, h: BRICK.h, type, kind: type, row: r, slot: k };
      if (type === 'gem') cell.gem = GEMS[cells.filter(c => c.gem).length % 3];
      cells.push(cell);
    }
  });
  return cells;
}

const bar = (id, x, y, w, h, glint = null) => ({ id, x, y, w, h, kind: 'steel', glint });

// The board for stage i at a paddle line: bricks, steel bars, chambers (box + the gap they open by) and moving bars.
export function stageBoard(i, { paddleY, difficulty = 'medium' }) {
  const plan = siegePlan()[i], B = paddleY - BOARD_GAP, cells = parseMap(MAPS[i], B, difficulty);
  const bars = [], chambers = [], movers = [];
  if (i === 0) {
    // Two iron posts flank the chest under the arch: open above and below, so the hook stage only shows the steel.
    const chest = cells.find(c => c.type === 'chest');
    bars.push(bar('post-l', chest.x - 12, chest.y - 10, BAR, 38), bar('post-r', chest.x + chest.w + 4, chest.y - 10, BAR, 38));
  }
  if (i === 1) {
    // The chest chamber: a 64x44 iron box; its right wall is a stub and its floor stops short, so the gap is the lower
    // right corner (44u across the floor, opening up the side under the stub).
    const x = 148, y = B - 128, w = 64, h = 44;
    bars.push(bar('top', x - BAR, y - BAR, w + 2 * BAR, BAR), bar('left', x - BAR, y, BAR, h + BAR), bar('stub', x + w, y, BAR, 12, 'b'), bar('floor', x - BAR, y + h, 36, BAR, 'r'));
    chambers.push({ id: 'chest', x, y, w, h, gap: x + w + BAR - (x - BAR + 36), prize: 'chest' });
    cells.push({ x: x + 14, y: y + 13, w: BRICK.w, h: BRICK.h, type: 'chest', kind: 'chest', row: -1, slot: -1 });
  }
  if (i === 2) {
    // The wheel chamber: an iron sill under the winch wheel leaves a 46u gap before the gate post.
    bars.push(bar('sill', 0, 246, 68, BAR, 'r'));
    chambers.push({ id: 'wheel', x: 0, y: 150, w: 124, h: 96, gap: 130 - 68, prize: 'chest' });
    cells.push({ x: 4, y: 150, w: BRICK.w, h: BRICK.h, type: 'chest', kind: 'chest', row: -1, slot: -1 });
    // Korr's murder hole sits in an iron pocket: a post on its left and a sill into the bell ramp. The way in is the right
    // lane, up past the ramp's low end.
    bars.push(bar('hole-post', 248, 144, BAR, 64, 'r'), bar('hole-sill', 248, 208, 34, BAR));
    chambers.push({ id: 'hole', x: 262, y: 146, w: 98, h: 60, gap: 360 - 318, prize: 'korr' });
  }
  if (i === 3) {
    // Two chest cages in the lower corners: field wall, roof, a short floor and a short inner post; the gap is the inner
    // lower corner (30u across the floor, opening up the side under the post).
    const y = B - 64, w = 52, h = 46, floor = 30;
    for (const [side, x] of [['l', 0], ['r', 360 - w]]) {
      const post = side === 'l' ? x + w : x - BAR;
      bars.push(bar(`cage-${side}-roof`, side === 'l' ? x : x - BAR, y - BAR, w + BAR, BAR), bar(`cage-${side}-floor`, side === 'l' ? x : 360 - floor, y + h, floor, BAR, side === 'l' ? 'r' : 'l'),
        bar(`cage-${side}-post`, post, y, BAR, 14, 'b'));
      chambers.push({ id: `cage-${side}`, x, y, w, h, gap: w + BAR - floor, prize: 'chest' });
      cells.push({ x: x + (w - BRICK.w) / 2, y: y + 18, w: BRICK.w, h: BRICK.h, type: 'chest', kind: 'chest', row: -1, slot: -1 });
    }
    // The sliding tooth under Korr's dais: it snaps between covering his left and his right (with a tell), so the open
    // side changes every few seconds.
    movers.push({ id: 'tooth', w: 48, h: BAR, poses: [{ x: 132, y: 236 }, { x: 180, y: 236 }] });
  }
  return { plan, B, cells, bars, chambers, movers };
}

// Reach view for the physics audit and the tests: every chamber's box, the unbreakable rects the ball reflects from and
// the launch points along the paddle line. `solids` are the stage's other fixed colliders (gate, posts, drawbridge...).
export function reachView(board, { paddleY, ceiling, solids = [], width = 360, paddleW = 100 }) {
  const from = []; for (let x = paddleW / 2 + 6; x <= width - paddleW / 2 - 6 + 1e-9; x += 20) from.push({ x, y: paddleY - 8 });
  return { field: { left: 0, right: width, top: ceiling }, bars: [...board.bars, ...solids], from, chambers: board.chambers };
}
