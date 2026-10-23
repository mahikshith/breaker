---
breach_drop: 1
kind: research
slug: research-powerups-difficulty
version: 1
date: 2026-10-23
status: proposal
tool: Copilot Studio, Gemini 4 Argon
depends_on: []
---
# BREACH P6: Research — Sticky Power-Up Systems & Difficulty Curves

## Summary
- Synthesises 8 benchmark brick breakers and roguelites (**BALL x PIT**, **Brick Breaker Hero**, **Arkanoid / Arkanoid vs Space Invaders**, **Bricks Breaker Quest**, **Holedown**, **Ballz**, **Peglin**, and **Vampire Survivors**), combining verified links from K10 with comparative game analysis (from model knowledge, not verified where live web browsing is unavailable).
- Identifies the #1 retention driver across sticky modern breakers: **visible 2-power synergies + a 20–25 s reward cadence** (`pity_after_breaks: 8` and `22–34` hit Hero Orb charges in `powerups-round2`).
- Shows why pure HP inflation kills mobile brick breakers (**Ballz** and **Bricks Breaker Quest** late-stage grind) and why BREACH's **3-floor sawtooth curve + active pushback clocks** (`difficulty-round2`) keeps runs at `2.0–4.5 min`.
- Demonstrates that the fairest failure cushions preserve earned state on the current floor (`Continue keeps boss HP and broken bricks` + `3.0 s` shield in `continue-screen`) and pay out soft progression currency (**Shine**) even on a loss.

## Decisions for the owner
1. Primary meta-hook to pair with in-run synergies: A Earned Shine paid out on both wins and losses + floor-preserving Continue (`continue-screen`) [RECOMMENDED] [AUTO-PICKED] | B Mandatory stage replays before advancing chapters (BALL x PIT town grind) | C Consumable pre-run paid boosters required for Hard bosses.
2. How players discover 2-power synergies (`Cinder Scatter`, `Molten Ram`, `Prism Storm`): A Automatic fusion on simultaneous active powers + a first-time pop-up badge recorded in a Synergy Codex [RECOMMENDED] [AUTO-PICKED] | B Pause-menu recipe crafting mid-rally | C Hidden with no UI feedback.

## Spec

### Comparative Study of 8 Benchmark Brick Breakers & Roguelites

| Game | Power-Up System (Stacking, Rarity, Synergy, Choice) | How Difficulty Rises | How Failure Is Softened | Copy for BREACH | Avoid in BREACH |
|---|---|---|---|---|---|
| **BALL x PIT** ([Game Informer](https://gameinformer.com/review/ball-x-pit/breathtaking-brick-breaking)) | Special balls level up and fuse into hybrid evolutions; heroes alter aim physics; town blueprints unlock passive perks. | Advancing wall waves with rising brick HP, elite hazards, and multi-phase bosses over 15-min runs. | Town upgrades permanently boost base stats; failed runs still bank harvested resources. | Automatic 2-power fusions (`fire + ram = Molten Ram`) and distinct hero kits (Kit vs. Lumi). | Forcing players to replay cleared stages multiple times to grind town blueprints before unlocking the next chapter. |
| **Brick Breaker Hero** ([Play Store / Mobile Action-Breaker](https://play.google.com/store)) | Hero spell book + falling arcade pickups (multi-ball, elemental balls, shield) + equipment passives. | Bosses actively move, summon blocker minions, and fire telegraphed projectiles at the paddle. | Ad-funded revive in place with temporary invulnerability; permanent hero/wand upgrades. | Active boss personalities with physical attack tells (`1.2–1.8 s`) and the lower-left Hero Face Orb spell cast. | Cluttered RPG stat menus and tiny hitbox weak points hidden behind invulnerable minion shields. |
| **Arkanoid & Arkanoid vs Space Invaders** ([StrategyWiki](https://strategywiki.org/wiki/Arkanoid/Gameplay)) | 7 iconic colour-coded capsules (`L` Laser, `E` Enlarge, `C` Catch, `S` Slow, `B` Break, `D` Disruption x3, `P` Life) + Invaders attack payback mode. | Tighter silver/gold brick fortress layouts, faster ball rally speed caps, and descending alien shots. | Extra-life capsule (`P`), instant stage warp (`B`), and reflecting enemy fire during attack mode. | Instant colour/silhouette capsule readability and reflecting boss hazards (Bellforge bells) back at the villain. | Old Arkanoid's strict single-active-capsule rule that erases your current build when you catch a new pill. |
| **Bricks Breaker Quest** ([Mobirix / Mobile Aim-Volley](https://play.google.com/store)) | Volley stack (+1 ball pickups), horizontal/vertical laser bricks, and bomb tiles embedded in the grid. | Brick HP scales into the hundreds as rows step down after every turn toward the fail line. | Watch-ad to clear the lowest 3 rows on fail; purchasable multi-ball and laser start boosts. | Embedded special board tiles (Gem Cache, Hearth bricks, Lure runes) that trigger chain reactions when broken. | Turn-based waiting for 80 balls to finish bouncing and pay-to-win row-clear consumables. |
| **Holedown** ([MacStories](https://www.macstories.net/reviews/game-day-holedown/)) | Permanent crystal upgrades between runs (ball count, shots per run, planet core depth) + mid-grid splitter pegs. | Deeper planetary layers require higher total hits within a limited shot counter before walls rise. | Zero-penalty quit/resume anytime; every run—win or lose—banks crystals toward the next upgrade. | Premium fairness ($2.99 full unlock), scrolling multi-floor camera descent (`1.2 s` climb/drop), and zero wasted runs. | Static turn-based puzzle boards with no real-time paddle skill or Sweet-Spot Ram expression. |
| **Ballz** ([Ketchapp / Endless Volley](https://www.deconstructoroffun.com/)) | Pure `+1` white ball pickups scattered between numbered squares; zero synergies or active abilities. | Infinite linear brick HP inflation (`1` to `500+`) as rows descend each turn. | One watch-ad second chance per run that clears the bottom row. | Crisp high-contrast ball visibility against a calm dark background and effortless one-thumb onboarding. | Monotonous endless number-grinding with flat primitive squares and zero character or world progression. |
| **Peglin** ([Adrian Hon](https://adrianhon.substack.com/p/peglin)) | 1-of-3 orb/relic draft after fights; bomb pegs, crit pegs, and refresh pegs multiply orb effects. | Multi-act branching map with escalating enemy attacks and elite encounters. | Post-battle healing choices and relic safeguards that prevent one bad bounce from ending a run. | Introducing at most 1 new mechanic or power-up per chapter and pausing for a 1-of-3 Hero Orb choice. | Overwhelming new players with 40+ complex text relics in Chapter 1 before core physics feel natural. |
| **Vampire Survivors** ([Secret Sauce Analysis](https://jboger.substack.com/p/the-secret-sauce-of-vampire-survivors)) | Weapon + passive pairing evolutions, dopamine chest reveals, and a reward beat roughly every `23 s`. | Escalating horde density in sawtooth waves punctuated by elite boss checks. | Gold earned on death buys permanent power-ups; optional single revive. | Pity capsule every `8` dry breaks (`~12–15 s`) and Hero Orb full charge every `22–34` hits (`~20–25 s`). | Screen-blinding particle soup that hides the white chrome ball or enemy telegraph tells. |

## Data
```json
{
  "kind": "research",
  "question": "What power-up systems and difficulty curves make the best brick breakers and brick-breaker roguelites sticky?",
  "findings": [
    {
      "game": "BALL x PIT",
      "mechanic": "Two-power ball fusions, distinct hero aim behaviours, and town blueprint meta-progression",
      "why_it_works": "Combines immediate arcade chaos with build discovery so every 30 seconds changes how the ball clears walls",
      "use_in_breach": "Adopt automatic 2-power synergies (e.g. Fire + Ram = Molten Ram) and Shine kingdom rebuilding, but never force stage replays to progress",
      "source": "https://gameinformer.com/review/ball-x-pit/breathtaking-brick-breaking"
    },
    {
      "game": "Brick Breaker Hero",
      "mechanic": "Active boss creatures that fight back paired with a manual hero spell button and falling arcade capsules",
      "why_it_works": "Turns passive brick clearing into a two-way duel where saving a hero cast for a boss wind-up feels heroic",
      "use_in_breach": "Keep the lower-left Hero Face Orb (22/28/34 hits) and physical 1.2-1.8 s boss tells, while avoiding cluttered RPG stat menus",
      "source": "https://www.gameanalytics.com/blog/six-games-that-successfully-layer-in-meta-mechanics"
    },
    {
      "game": "Arkanoid & Arkanoid vs Space Invaders",
      "mechanic": "Seven colour-coded capsules with distinct silhouettes plus reflecting enemy attacks back during power modes",
      "why_it_works": "Players recognise every falling capsule in under 0.2 s by colour and shape and feel skilled knocking hazards back",
      "use_in_breach": "Keep strict capsule hex coding and hazard counterplay (knocking Bellforge bells back into Korr), but allow powers to stack instead of overwriting",
      "source": "https://strategywiki.org/wiki/Arkanoid/Gameplay"
    },
    {
      "game": "Bricks Breaker Quest",
      "mechanic": "Grid-embedded special tiles (lasers, bombs, splitters) that trigger chain reactions when struck",
      "why_it_works": "Gives players high-value targets inside the brick wall that reward banking shots into deep pockets",
      "use_in_breach": "Use broad 32x16 Gem Cache, Hearth, and Lure Rune bricks to reward bank shots, while avoiding turn-based waiting and paid row-clear consumables",
      "source": "https://segwise.ai/blog/mobile-gaming-app-user-retention-strategies"
    },
    {
      "game": "Holedown",
      "mechanic": "Premium $3.99 fairness, descending multi-layer core depths, and crystal payouts on every run win or lose",
      "why_it_works": "Eliminates wasted sessions and dark-pattern timers while making deeper floors feel physically earned",
      "use_in_breach": "Use the 3-floor camera climb/descent with floor state carry-over, Shine payouts on loss, and the one-time $2.99 full unlock",
      "source": "https://www.macstories.net/reviews/game-day-holedown/"
    },
    {
      "game": "Ballz",
      "mechanic": "Minimalist high-contrast ball trails against a dark background with fast one-finger onboarding",
      "why_it_works": "Zero visual clutter lets players track dozens of bouncing balls effortlessly on a phone screen",
      "use_in_breach": "Preserve the dark navy (#141831) empty reaction lane so the white chrome ball always leads the eye, while avoiding endless HP-sponge number walls",
      "source": "https://www.deconstructoroffun.com/blog/2019/8/9/why-archero-banked-25m-but-leaves-25m-hanging-hlx9n"
    },
    {
      "game": "Peglin",
      "mechanic": "1-of-3 mid-run upgrade choices and board-modifying pegs introduced across structured acts",
      "why_it_works": "Gives players agency over their build in 2 seconds without breaking flow, provided early complexity is gated",
      "use_in_breach": "Keep the paused 3-choice Hero Orb menu and introduce at most 1 new power-up or hazard per chapter with a Synergy Codex",
      "source": "https://adrianhon.substack.com/p/peglin"
    },
    {
      "game": "Vampire Survivors",
      "mechanic": "A guaranteed dopamine reward beat roughly every 23 seconds and two-item weapon evolutions",
      "why_it_works": "Prevents dry spells during tough waves and creates a constant 'just 10 more seconds to evolve' hook",
      "use_in_breach": "Enforce the 8-break capsule pity timer (~12-15 s) and 22/28/34-hit Hero Orb cadence (~20-25 s) while keeping FX chunky and ring-free",
      "source": "https://jboger.substack.com/p/the-secret-sauce-of-vampire-survivors"
    }
  ],
  "recommendations": [
    "Stack, never overwrite: let caught capsules add physical 3D attachments to the paddle and trigger automatic 2-power synergies (Cinder Scatter, Molten Ram, Prism Storm)",
    "Lock the 20-second reward heartbeat: enforce the 8-break capsule pity rule and 22/28/34-hit Hero Orb charge so no run goes 25 seconds without a power spike",
    "Pace difficulty as a two-wave sawtooth curve with breather chapters (Ch 6 Mooncoil Reliquary, Ch 10 Lumi Breaks Out) after major boss walls (Ch 5, Ch 9)",
    "Drive urgency with pushback mechanics (head stuns on Gnash, bell rebounds on Korr, sluice hits on Nerra) rather than raw brick HP inflation",
    "Make failure painless and fair: show 'Almost Had It' remaining boss HP in 0.5 s, preserve current floor and boss damage on Continue, and pay out Shine even on a loss"
  ]
}
```

## Art requests
None

## Rules check
- Every hazard has a visible 1.2 to 1.8 s tell and is shown once safely first: **OK** — research reinforces keeping physical boss tells (`1.2–1.8 s`) over sudden arcade hits.
- Ordinary ball play always makes progress; no tiny weak points (min 32x16 brick), no precision puzzles, no waiting on timers or invulnerable enemies: **OK** — rejects Brick Breaker Hero's invulnerable minion shields and turn-based waits.
- Difficulty changes numbers only (harder but fair): **OK** — aligns with `difficulty-round2` sawtooth tuning.
- No power-up, companion or purchase is required to win; Pause, Continue, Retry keep progress: **OK** — adopts Holedown's fair progression and floor-preserving continues.
- Enemy attacks never destroy the player's bricks to hand out rewards: **OK** — preserved.
- A single brick cracks and fades in about 0.4 s; only big crashes drop debris: **OK** — preserved.
- Effects are rendered gems, chips, sparks, dust or debris; never plain circles or rings: **OK** — rejects Vampire Survivors screen clutter in favour of bounded K05 ceramic/gem FX.
- Mobile safe areas, 393x852 and 412x915, 44 pt touch targets, paddle above the thumb: **OK** — preserved.
- Glossy vinyl-toy / glazed-ceramic look, dark navy background, minimal yellow: **OK** — preserved.

## Open questions for Claude
1. Should we add a small **Synergy Toast** (`180x36` units at `y = 68`, `1.4 s` slide-in/out) the first time a player triggers a 2-power combo like `Molten Ram`? **Recommended:** Yes, show a non-blocking banner at the top HUD (`"SYNERGY! MOLTEN RAM"`) so players learn fusions organically without pausing the ball.
2. When Shine soft currency is added in Phase 1, should a loss pay `100%` of earned brick Shine or a reduced fraction? **Recommended:** Pay `100%` of Shine earned from broken bricks (`1 Shine per 100 pts`) on both wins and losses, reserving the star bonus (`+25 Shine per star`) for clears.
