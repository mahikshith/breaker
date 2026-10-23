// Tidewheel Siege (design/phase2/stages-v2.md section 6): the four stage boards and the per-difficulty scaling of the shared
// stage plan (src/fantasy/stages.js). Pure data plus the reach-check view of each board (src/fantasy/reach.js), so the
// model, the tests and the physics audit all read the same layouts.
//
// Units are the Tidewheel world: 360 wide, side walls at x 12 / 348, ceiling y 67. Items marked `band` live in the raft
// band and move with the phone height: their y is shifted by dy = raft rest height - 320 (raft rest = min(380, paddleY - 265)).
import { stagePlan } from './stages.js';
import { chamberReach } from './reach.js';
import { BALL_R } from './ram.js';

export const STAGE_COUNT = 4;
// The shared plan scaled by difficulty: bricks and 2-hit share, drop chance, ball speed, villain attack interval, tide.
export const STAGE_SCALE = {
  easy: { bricks: .85, twoHit: .6, drop: 1.25, speed: .96, attack: 1.15, tide: .8, hp: 1 },
  medium: { bricks: 1, twoHit: 1, drop: 1, speed: 1, attack: 1, tide: 1, hp: 1 },
  hard: { bricks: 1.1, twoHit: 1.3, drop: .8, speed: 1.04, attack: .88, tide: 1.2, hp: 1 },
};
export function siegePlan(difficulty = 'medium') {
  const k = STAGE_SCALE[difficulty] || STAGE_SCALE.medium;
  return stagePlan(STAGE_COUNT).map(s => ({ ...s, bricks: s.bricks * k.bricks, twoHit: Math.min(.9, s.twoHit * k.twoHit), drop: s.drop * k.drop,
    speed: s.speed * k.speed, attack: s.attack === null ? null : s.attack * k.attack, tide: k.tide }));
}
export const BASE_BRICKS = 30;   // the full siege board: today's two rafts of twelve plus the stage's formations

export const STAGES = [
  { key: 'lowtide', name: 'Low Tide', stake: 'Nerra snapped the refuge chain. Beat the tide.', nerra: 'hook', clear: 'THE RAFTS ARE FREE' },
  { key: 'floodworks', name: 'Floodworks', stake: 'Shut the sluices before the tide turns.', nerra: 'peek', clear: 'THE SLUICES HOLD' },
  { key: 'wheel', name: 'The Wheel', stake: 'Nerra holds the wheel. Knock her off it.', nerra: 'hub', clear: 'THE WHEEL IS OURS' },
  { key: 'refuge', name: 'The Refuge', stake: 'Free Lumi before the flood takes the refuge.', nerra: 'showdown' },
];

const W = 34, H = 18, COL = c => -54 + c * 37, ROW = r => -51 + r * 21;
const cell = (col, row, extra = {}) => ({ lx: COL(col), ly: ROW(row), w: W, h: H, ...extra });
// Cells listed in priority order: a stage takes the first N for its brick budget, so easier modes drop the last ones.
const RAFT_ORDER = [[1, 3], [0, 3], [2, 3], [1, 2], [0, 2], [2, 2], [1, 1], [0, 1], [2, 1], [1, 0], [0, 0], [2, 0]];

// A cage raft (stage 4): two cargo rows on top, a brass cage over the bottom-centre hold with the chest inside, two side
// cells either side of the cage. The cage's open floor is the raft's breakable brace: break it and thread the gap.
const CAGE = { post: 4, roofY: -10, roofH: 6, x: 26 };   // x 26 (was 22): the bigger ball keeps a 6 degree way into the cage
function cageRaft() {
  // The two cargo rows carry four narrower bricks each.
  const cells = [1, 2, 0, 3].flatMap(c => [1, 0].map(r => ({ lx: -54 + c * 27.5, ly: ROW(r), w: 25, h: H, ...(c === 1 && r === 0 ? { type: 'mine' } : {}) }))).sort((p, q) => q.ly - p.ly);
  const side = [{ lx: -54, ly: ROW(2), w: 28, h: H }, { lx: 26, ly: ROW(2), w: 28, h: H }, { lx: -54, ly: ROW(3), w: 28, h: H }, { lx: 26, ly: ROW(3), w: 28, h: H }];
  const p = CAGE.post, x = CAGE.x;
  return {
    cells: [...side.slice(0, 2), ...cells.slice(0, 4), ...side.slice(2), ...cells.slice(4)],
    prizes: [{ lx: -17, ly: 6, w: 34, h: 20, type: 'chest', hp: 2 }],
    steel: [
      { id: 'roof', lx: -x, ly: CAGE.roofY, w: 2 * x, h: CAGE.roofH, glint: 'bottom' },
      { id: 'postL', lx: -x, ly: CAGE.roofY + CAGE.roofH, w: p, h: 34 - CAGE.roofY - CAGE.roofH, glint: 'right' },
      { id: 'postR', lx: x - p, ly: CAGE.roofY + CAGE.roofH, w: p, h: 34 - CAGE.roofY - CAGE.roofH, glint: 'left' },
    ],
    chamber: { id: 'cage', lx: -x + p, ly: CAGE.roofY + CAGE.roofH, w: 2 * (x - p), h: 34 - CAGE.roofY - CAGE.roofH },
  };
}

// Static board pieces. blocks: {x, y, w, h, type, hp, band}; bars: {id, x, y, w, h, glint, band, power}; type
// brick|mine|pearl|chest|valve. `fixed` blocks are always on the board (the stage's formation and Nerra's shield); the
// brick budget then fills from the raft cells and `blocks`. `regrow` bricks are barnacle shield: they grow back while
// no ball is near, and never hold a stage up. A `power` bar is barnacle plate: a ball only knocks on it, but fire, the
// titan, a ram, three laser bolts or a sea-mine blast break it.
const row = (y, xs, extra = {}) => xs.map(x => ({ x, y, w: W, h: H, ...extra }));
const span = (n, cx = 180) => Array.from({ length: n }, (_, i) => cx - (n * W + (n - 1) * 3) / 2 + i * (W + 3));
const mirror = list => list.map(b => ({ ...b, x: 360 - b.x - b.w }));
const MINE = { type: 'mine' };
// Raft cells in priority order with a sea-mine in the second row's middle: its blast clears the cells round it.
const MINE_ORDER = RAFT_ORDER.map(([c, r]) => c === 1 && r === 2 ? [c, r, 'mine'] : [c, r]);

// Stage 1, Low Tide: two light rafts and a chevron of bricks over them, its arms tipped with sea-mines, under the three
// pearls. No steel: it teaches the tide, which is already climbing toward the refuge.
function lowTide() {
  const arm = [{ x: 163, y: 150, w: W, h: H }, { x: 126, y: 166, w: W, h: H }, { x: 89, y: 182, w: W, h: H, ...MINE }, { x: 52, y: 198, w: W, h: H }];
  return {
    rafts: [{ x: 102, order: MINE_ORDER }, { x: 258, order: MINE_ORDER }],
    fixed: [...arm, ...mirror(arm.slice(1))],
    blocks: [],
    prizes: row(126, span(3), { type: 'pearl', hp: 1 }),
    bars: [], spokes: [], chambers: [],
    gates: [{ x: 25, y: 240 }, { x: 335, y: 240 }],
    mix: 'rafts',   // budget: alternate raft cells and blocks
  };
}

// Stage 2, Floodworks: the sluice house, a brass T against the ceiling. Its chimney (60 wide) leads up into a crossbar
// chamber that holds both valves in its arms and a chest under the roof. Nerra peeks from either side wall; under each
// peek a breakwater of three bricks climbs from the wall (a sea-mine in the middle), so a shot at her is carved or banked.
// Brick columns hang under the arms; two band rows cover the chimney mouth, so the way in is broken open first.
function floodworks() {
  const t = 7, top = 67, floor = 150, mouth = 282, armL = 108, armR = 252, chL = 148, chR = 212;
  const stair = [{ x: 14, y: 264, w: 26, h: 16 }, { x: 42, y: 250, w: 26, h: 16, ...MINE }, { x: 70, y: 236, w: 26, h: 16 }];
  return {
    rafts: [],
    fixed: [...stair, ...mirror(stair)],
    blocks: [
      ...row(163, [armL - 3, armR - W + 3]), ...row(184, [armL - 3, armR - W + 3]), ...row(205, [armL - 3, armR - W + 3]),
      ...row(296, span(8), { band: true }), ...row(317, span(6), { band: true }), ...row(226, [armL - 3, armR - W + 3]),
    ],
    prizes: [
      { x: armL + 4, y: 128, w: W, h: H, type: 'valve', hp: 2 }, { x: armR - W - 4, y: 128, w: W, h: H, type: 'valve', hp: 2 },
      { x: 163, y: 72, w: W, h: H, type: 'chest', hp: 2 },
    ],
    bars: [
      { id: 'postL', x: armL - t, y: top, w: t, h: floor + t - top, glint: 'right' },
      { id: 'postR', x: armR, y: top, w: t, h: floor + t - top, glint: 'left' },
      { id: 'floorL', x: armL - t, y: floor, w: chL - armL + t, h: t, glint: 'top' },
      { id: 'floorR', x: chR, y: floor, w: armR + t - chR, h: t, glint: 'top' },
      { id: 'chimL', x: chL - t, y: floor + t, w: t, h: mouth - floor - t, band: 'bottom', glint: 'right' },
      { id: 'chimR', x: chR, y: floor + t, w: t, h: mouth - floor - t, band: 'bottom', glint: 'left' },
    ],
    spokes: [],
    chambers: [{ id: 'sluice', x: armL, y: top, w: armR - armL, h: floor - top, prizes: ['valve0', 'valve1', 'chest'], crack: 'floorL' },
      { id: 'chimney', x: chL, y: floor + t, w: chR - chL, h: mouth - floor - t, band: 'bottom', via: 'sluice' }],
    gates: [],
    peeks: [{ side: -1, x: -40, y: 210 }, { side: 1, x: 400, y: 210 }],   // her reach stays 24u clear of the sluice posts
    mix: 'blocks',
  };
}

// Stage 3, The Wheel: Nerra on the hub behind a barnacle dome. The dome is a stair of bricks from each wall up to a
// barnacle plate right under her feet, with a sea-mine either side of the plate: she is only reached by carving the dome
// (it grows back) or blasting the plate (mines, fire, laser, the titan). Under the dome a diamond of bricks floats between
// two wheel pits; each pit is a brass box whose floor gap is closed by a spoke that swings between two fixed poses (shut:
// lying in the gap; open: standing against the inner wall) after a tell. The pits are the prize run: a chest (a big power
// for the plate), a pearl and bonus bricks. The stage clears with the diamond broken and Nerra knocked off the hub.
export const DOME = { plate: { x: 163, y: 240, w: 34, h: 8 } };
function wheel() {
  const t = 7, roof = 325, floor = 393, inner = 85, gap = 42, drop = roof - 285;
  const pit = side => {
    const m = x => side < 0 ? x : 360 - x, bx = (x, w) => side < 0 ? x : 360 - x - w;
    const id = side < 0 ? 'L' : 'R';
    return {
      bars: [
        { id: 'roof' + id, x: bx(12, inner + t - 12), y: roof, w: inner + t - 12, h: t, band: true, glint: 'bottom' },
        { id: 'inner' + id, x: bx(inner, t), y: roof + t, w: t, h: floor - roof - t, band: true, glint: side < 0 ? 'left' : 'right' },
        { id: 'floor' + id, x: bx(12, inner - gap - 12), y: floor, w: inner - gap - 12, h: t, band: true, glint: 'top' },
      ],
      spoke: { id: 'spoke' + id, hinge: { x: m(inner), y: floor + t / 2 }, len: gap, t, side, band: true,
        poses: [{ x: bx(inner - gap, gap), y: floor, w: gap, h: t }, { x: bx(inner - t, t), y: floor - gap, w: t, h: gap }] },
      // Two rows: the prize and a brick over two bricks. The open spoke stands in the free 7u inner column beside them.
      blocks: [{ x: bx(51, 32), y: 294 + drop, w: 32, h: H, band: true, bonus: true }, { x: bx(14, W), y: 315 + drop, w: W, h: H, band: true, bonus: true }, { x: bx(51, 25), y: 315 + drop, w: 25, h: H, band: true, bonus: true }],
      prize: { x: bx(14, W), y: 294 + drop, w: W, h: H, type: side < 0 ? 'chest' : 'pearl', hp: side < 0 ? 2 : 1, band: true },
      chamber: { id: 'pit' + id, x: bx(12, inner - 12), y: roof + t, w: inner - 12, h: floor - roof - t, band: true, crack: 'floor' + id },
    };
  };
  const L = pit(-1), R = pit(1), D = { w: 30, h: 16, regrow: true };
  const dome = [{ x: 131, y: 252, ...D, ...MINE }, { x: 99, y: 264, ...D }, { x: 67, y: 276, ...D }, { x: 39, y: 284, ...D }, { x: 12, y: 262, ...D, w: 25 }];   // the wall end sits right under the gate: no pocket
  return {
    rafts: [],
    fixed: [...dome, ...mirror(dome)],
    blocks: [...L.blocks, ...R.blocks, ...row(300, span(3), { band: true }), ...row(321, span(4), { band: true }), ...row(342, span(3), { band: true }), ...row(363, span(2), { band: true })],
    prizes: [L.prize, R.prize],
    bars: [{ id: 'plate', ...DOME.plate, glint: 'bottom', power: true }, ...L.bars, ...R.bars], spokes: [L.spoke, R.spoke], chambers: [L.chamber, R.chamber],
    gates: [{ x: 25, y: 240 }, { x: 335, y: 240 }],
    mix: 'blocks',
  };
}

// Stage 4, The Refuge: the original showdown rafts, each now carrying a brass cage over a chest. The cages ride the
// moving rafts. The three lanes up to Nerra are plugged with barnacle bricks that grow back; the centre lane is capped
// with a barnacle plate over a sea-mine.
function refuge() {
  const c = cageRaft(), P = { h: 16, regrow: true };
  return {
    rafts: [{ x: 102, cage: c }, { x: 258, cage: c }],
    fixed: [{ x: 166, y: 250, w: 28, ...P, ...MINE }, { x: 166, y: 268, w: 28, ...P }, ...[12.5, 321.5].flatMap(x => [{ x, y: 262, w: 26, ...P }, { x, y: 280, w: 26, ...P }])],
    blocks: [], prizes: [], spokes: [], chambers: [],
    bars: [{ id: 'plate', x: 166, y: 240, w: 28, h: 8, glint: 'bottom', power: true }],
    gates: [{ x: 25, y: 240 }, { x: 335, y: 240 }],
    mix: 'rafts',
  };
}
const BOARDS = [lowTide, floodworks, wheel, refuge];

export const raftRest = paddleY => Math.min(380, paddleY - 265);
// The board for one stage at one phone: band items shifted, the brick budget applied and the 2-hit share marked.
export function stageBoard(index, { paddleY, difficulty = 'medium' }) {
  const plan = siegePlan(difficulty)[index], b = BOARDS[index](), dy = raftRest(paddleY) - 320;
  const shift = o => !o.band ? { ...o } : o.band === 'bottom' ? { ...o, h: o.h + dy } : { ...o, y: o.y + dy };
  const rafts = b.rafts.map((r, i) => {
    const cells = r.cage ? r.cage.cells.map(c => ({ ...c })) : r.order.map(([c, rr, type]) => cell(c, rr, type ? { type } : {}));
    return { i, x: r.x, cells, prizes: r.cage ? r.cage.prizes.map(p => ({ ...p })) : [], steel: r.cage ? r.cage.steel.map(s => ({ ...s })) : [], chamber: r.cage?.chamber };
  });
  // Budget: the plan's share of the full board, the fixed formation first, then the rest in priority order (interleaved so
  // both halves thin evenly).
  const budget = Math.round(BASE_BRICKS * plan.bricks), fixed = (b.fixed || []).map(shift), pools = [...rafts.map(r => r.cells.map(c => ({ raft: r.i, ...c }))), b.blocks.map(shift)];
  const queue = [];
  for (let k = 0; queue.length < pools.reduce((n, p) => n + p.length, 0); k++) for (const p of b.mix === 'blocks' ? [...pools].reverse() : pools) if (p[k]) queue.push(p[k]);
  const chosen = [...fixed, ...queue.slice(0, Math.max(0, budget - fixed.length))];
  // 2-hit share: every brick past the front line, from the far side first, by a fixed stride. Sea-mines stay one hit.
  const twoHit = Math.round(chosen.length * plan.twoHit), order = chosen.filter(c => c.type !== 'mine').sort((p, q) => (p.raft === undefined ? p.y : p.ly + 300) - (q.raft === undefined ? q.y : q.ly + 300));
  const stride = twoHit ? order.length / twoHit : Infinity;
  for (let n = 0; n < Math.min(twoHit, order.length); n++) order[Math.floor(n * stride)].hp = 2;
  for (const c of chosen) { c.hp ||= 1; c.type ||= 'brick'; }
  return {
    index, plan, dy, budget,
    rafts: rafts.map(r => ({ ...r, cells: chosen.filter(c => c.raft === r.i) })),
    blocks: chosen.filter(c => c.raft === undefined),
    prizes: b.prizes.map(shift),
    bars: b.bars.map(shift),
    spokes: b.spokes.map(s => ({ ...s, hinge: { ...s.hinge, y: s.hinge.y + (s.band ? dy : 0) }, poses: s.poses.map(p => ({ ...p, y: p.y + (s.band ? dy : 0) })) })),
    chambers: b.chambers.map(shift),
    gates: b.gates.map(g => ({ ...g })),
    peeks: b.peeks || [],
  };
}

// ---------- reach view (src/fantasy/reach.js) ----------
// The steel a ball meets on its way to each chamber: board bars, spokes in their open pose, raft deck endcaps and cages at
// a raft pose, the gates, and, while she holds the hub, a box over Nerra's reach (her shell deflects; we do not count on it).
export const NERRA_HUB_BOX = { x: 39, y: 80, w: 310, h: 174 };
const RAFT_ENDCAPS = [{ lx: -57, ly: 34, w: 22, h: 14 }, { lx: 35, ly: 34, w: 22, h: 14 }];
export function reachCases(index, { paddleY, difficulty = 'medium' }) {
  const B = stageBoard(index, { paddleY, difficulty }), rest = raftRest(paddleY), cases = [];
  const from = []; for (let x = 40; x <= 320; x += 10) from.push({ x, y: paddleY - 15 });
  const field = { left: 12, right: 348, top: 67 };
  for (const lift of [0, 20]) {   // rafts at rest and at their tether stop
    const at = (r, o) => ({ id: o.id, x: r.x + o.lx, y: rest - lift + o.ly, w: o.w, h: o.h });
    const raftSteel = B.rafts.flatMap(r => [...RAFT_ENDCAPS, ...r.steel].map(o => at(r, o)));
    const bars = [...B.bars, ...B.spokes.map(s => s.poses[1]), ...raftSteel, ...B.gates.map(g => ({ x: g.x - 12, y: g.y - 17, w: 24, h: 34 }))];
    if (STAGES[index].nerra === 'hub' || STAGES[index].nerra === 'showdown') bars.push(NERRA_HUB_BOX);
    for (const c of B.chambers) if (!c.via) cases.push({ stage: index, lift, field, bars, chamber: c, from });
    for (const r of B.rafts) if (r.chamber) cases.push({ stage: index, lift, field, bars, chamber: { ...at(r, r.chamber), id: `cage${r.i}` }, from });
  }
  return cases;
}
export const REACH_RULES = { bounces: 2, minSpan: 6, minGap: 2.2 * 12 };
// Every chamber of a stage, judged: reachable within two bounces, a 6 degree run at some launch point, and every gap a
// ball can use at least 2.2 ball diameters wide.
export function judgeStage(index, phone) {
  return reachCases(index, phone).map(c => {
    const r = chamberReach({ field: c.field, bars: c.bars, chamber: c.chamber, from: c.from, r: BALL_R, bounces: REACH_RULES.bounces });
    const gap = gapOf(index, c.chamber.id ?? c.chamber, phone);
    return { stage: index, chamber: c.chamber.id || c.chamber, lift: c.lift, reachable: r.reachable, span: r.span, gap,
      pass: r.reachable && r.span >= REACH_RULES.minSpan && gap >= REACH_RULES.minGap };
  });
}
// The narrowest opening into a chamber, measured from the board data (the designed gap, not the ray hits).
function gapOf(index, id, phone) {
  const B = stageBoard(index, phone);
  if (String(id).startsWith('cage')) { const r = B.rafts[+String(id).slice(4)]; return r.chamber.w; }
  if (id === 'sluice') { const c = B.chambers.find(c => c.id === 'chimney'); return c.w; }
  const s = B.spokes.find(s => 'pit' + s.id.slice(5) === id); return s ? s.len : Infinity;
}
