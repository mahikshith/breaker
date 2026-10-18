export const VENOM = { windup: 1.4, cast: 0.18, breath: 0.55, impact: 0.32, recovery: 1.2, reach: 68 };

// A separated incoming contact is one hit; a lingering overlap or simultaneous volley is not.
export class FuryContacts {
  constructor() { this.touching = new WeakSet(); this.hits = 0; this.last = -Infinity; }
  observe(ball, touching, approaching, t, enabled = true) {
    if (!touching) { this.touching.delete(ball); return false; }
    if (this.touching.has(ball)) return false;
    this.touching.add(ball);
    if (!enabled || !approaching || t - this.last < 0.35) return false;
    this.last = t; this.hits++; return true;
  }
  reset() { this.hits = 0; }
}

export function cageFrame(br, pocket) {
  return (br.r === pocket.r0 - 1 && br.c >= pocket.c0 - 1 && br.c <= pocket.c1 + 1) ||
    (br.r >= pocket.r0 && br.r <= pocket.r1 && (br.c === pocket.c0 - 1 || br.c === pocket.c1 + 1));
}

export function streamingCells() { return Array.from({ length: 12 }, (_, i) => [16, 1 - i]); }
export function safeRecoilSteps(cells, historyLength, requested) {
  let n = 0; while (n < requested && n < historyLength && cells[n + 1]?.[1] >= 0) n++; return n;
}
export function canWard(phase, venom, charge) {
  return phase === 'rescue' && venom.phase === 'warn' && !!venom.target && !venom.ward && charge >= 1 && venom.t <= VENOM.windup - VENOM.cast;
}

export function previewPartition(grid, br, plan) {
  const saved = [];
  for (let c = br.c; c < br.c + br.n; c++) {
    const i = br.r * grid.cols + c; saved.push([i, grid.cells[i], grid.bid[i]]); grid.cells[i] = 0; grid.bid[i] = -1;
  }
  try { return plan(); } finally { for (const [i, cell, bid] of saved) { grid.cells[i] = cell; grid.bid[i] = bid; } }
}

export function venomTarget({ grid, bricks, head, brickAt, plan }, pocket, granite, bars) {
  const before = plan().cost;
  return bricks.filter(br => !br.gone && br.kind === granite && !cageFrame(br, pocket)).map(br => {
    const x = br.x + br.w / 2, y = br.y + br.h / 2, distance = Math.hypot(x - head.x, y - head.y), angle = Math.atan2(y - head.y, x - head.x);
    return { br, x, y, distance, angle };
  }).filter(q => {
    if (q.distance > VENOM.reach || q.distance < 16) return false;
    const x0 = head.x + Math.cos(q.angle) * 15, y0 = head.y + Math.sin(q.angle) * 15, steps = Math.ceil(q.distance / 2);
    for (let i = 0; i <= steps; i++) {
      const f = i / steps, x = x0 + (q.x - x0) * f, y = y0 + (q.y - y0) * f;
      const c = Math.floor((x - grid.ox) / grid.cw), r = Math.floor((y - grid.oy) / grid.ch), br = brickAt(c, r);
      if (br && !br.gone && br.id !== q.br.id) return false;
      if (c >= 0 && r >= 0 && c < grid.cols && r < grid.rows && grid.cells[r * grid.cols + c] === bars) return false;
    }
    return true;
  }).sort((a, b) => a.distance - b.distance || a.br.id - b.br.id).find(q => previewPartition(grid, q.br, plan).cost + 0.01 < before) || null;
}
