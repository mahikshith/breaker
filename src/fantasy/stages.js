// Stages v2 (design/phase2/stages-v2.md): a chapter is 3 stages (Skirmish) or 4 (Siege) building to the villain. This
// module is the shared rulebook: the escalation table, the cumulative power pool, the stage labels and the chapter-wide
// villain HP pool whose retreat caps turn an early knockout into a knock-down (the villain escapes, HP carries over).

// One row per stage role. bricks: share of the chapter's full board; twoHit: share of 2-hit bricks; steel: [min, max]
// unbreakable bars; drop: chance a brick drops a power; adds: powers this stage adds to the pool; speed: ball speed scale;
// attack: villain attack interval scale (null: the villain only appears in the hook); floor: least villain HP share
// left when this stage ends (1: untouchable, 0: can fall).
export const ROLES = {
  hook: { bricks: .6, twoHit: 0, steel: [0, 2], drop: .10, adds: ['wide', 'slow'], speed: 1, attack: null, floor: 1 },
  build: { bricks: .85, twoHit: .15, steel: [3, 4], drop: .12, adds: ['split', 'shield'], speed: 1.04, attack: 1, floor: .85 },
  clash: { bricks: 1, twoHit: .3, steel: [4, 8], drop: .14, adds: ['fire', 'laser'], speed: 1.08, attack: .85, floor: .4 },
  showdown: { bricks: 1.1, twoHit: .4, steel: [4, 10], drop: .16, adds: ['burst', 'titan'], speed: 1.12, attack: .7, floor: 0 },
};
// A Skirmish merges build and clash: its middle stage takes the clash row and both stages' powers.
const ORDER = { 3: ['hook', 'clash', 'showdown'], 4: ['hook', 'build', 'clash', 'showdown'] };

export function stagePlan(count) {
  const roles = ORDER[count];
  if (!roles) throw new Error(`a chapter has 3 or 4 stages, not ${count}`);
  const pool = [];
  return roles.map((role, i) => {
    if (count === 3 && role === 'clash') pool.push(...ROLES.build.adds);
    pool.push(...ROLES[role].adds);
    return { index: i, role, ...ROLES[role], powers: [...pool], last: i === roles.length - 1 };
  });
}

export const chapterKind = count => count >= 4 ? 'Siege' : 'Skirmish';
export const stageLabel = (i, count) => `STAGE ${i + 1} OF ${count}`;

// The villain's HP for the whole chapter. Before the showdown a stage's floor caps the damage: reaching it is a knock-down
// (once per stage), after which further hits do nothing until the next stage. HP never resets, so a strong player meets a
// wounded villain, who comes back enraged.
export class VillainPool {
  constructor(maxHP, plan) { this.maxHP = this.hp = maxHP; this.plan = plan; this.stage = 0; this.knockdowns = []; }
  get floorHP() { return Math.ceil(this.maxHP * this.plan[this.stage].floor); }
  get down() { return this.knockdowns.includes(this.stage); }
  get enraged() { return this.plan[this.stage].last && this.knockdowns.length > 0; }
  get defeated() { return this.hp <= 0; }
  // Returns the damage dealt and whether this hit was the stage's knock-down.
  hit(n = 1) {
    if (this.down || this.defeated) return { dealt: 0, knockdown: false };
    const before = this.hp;
    this.hp = Math.max(this.floorHP, this.hp - n);
    const knockdown = !this.plan[this.stage].last && this.hp === this.floorHP && this.floorHP < this.maxHP;
    if (knockdown) this.knockdowns.push(this.stage);
    return { dealt: before - this.hp, knockdown };
  }
  advance() { if (this.stage < this.plan.length - 1) this.stage++; return this.plan[this.stage]; }
}
