# Stages v2: chapters of 3–4 stages that build to the villain

Owner direction (2026-10-23):
- Every princess chapter becomes 3–4 stages, so the player feels anticipation on the way to the main villain.
- The first stages hook the player.
- If the player knocks the villain out early, the chapter still goes on: the villain escapes and comes back.
- Power-ups, drops, difficulty and brick counts rise with each stage.
- Layouts get structural, like the original Vault and Snake level: steel bars where the ball needs a real angle to reach the gap.

Scope:
- Princess chapters only: Vault, Frost, Mooncoil, Bellforge, Tidewheel, Gatehouse, Lumi, Rivals and Hoard.
- The space chapters (Carrier, Circuit, Forge) are parked.
- Save slots never move.

Tidewheel is built first, as the flagship. The shared pieces then go into `src/fantasy/stages.js`, and every other chapter adopts them one at a time.

## 1. Stage roles

| Stage | Role | Villain | What the player feels |
|---|---|---|---|
| 1 | **Hook** | Shows up and does something bad that the player sees (grabs the chain, cracks the balcony, steals the key), then leaves. | "I want to catch that thing." |
| 2 | **Build** | Harasses from off-board: peeks, single attacks, minions. | "It's getting harder, and it's coming." |
| 3 | **Clash** | Fights for real, then retreats at a threshold. | "I hurt it, but it got away." |
| 4 | **Showdown** | Full fight, with every attack and fury. | "Finally." |

- **Three-stage chapters** merge Build and Clash.
- Every stage still obeys the floor-hook rule (`floor-hooks.md`): a stake on screen, visible pressure, and a carry-over payoff.

## 2. Telling "1 of 2" from "1 of 4"

- **Pip track** under the chapter name: one pip per stage. The last pip is the villain's crest, larger and tinted, and it pulses faintly from stage 1 onward. That crest is the anticipation the owner asked for.
- **Stage card** at each stage start, for 1.2 s and skippable. It shows "STAGE 2 OF 4", the stage name ("Floodworks"), and a one-line stake ("Shut the sluices before the tide turns").
- **Chapter length is a label on the map.** Chapters of 3 stages read *Skirmish*; chapters of 4 read *Siege*, with a taller banner. The player knows the scale before starting.

## 3. Beating the villain early

The villain has **one HP pool for the whole chapter**.

Before stage 4, the villain cannot fall:
- **Retreat threshold:** each stage before the last caps the damage at a threshold (stage 1: none; stage 2: 15%; stage 3: down to 40% left).
- **Knock-down:** hitting the cap is a *knock-down*.
  - The villain staggers and plays its escape (dive, flee or teleport out).
  - The player gets a reward: +1 drop, a loot chest, and a star condition for "knocked down early".
  - The stage then continues without the villain, or ends early if its goal is done.
- **Carry-over:** HP carries forward, so damage is never wasted. A strong player meets a wounded villain in stage 4. The villain arrives enraged (one attack faster) to keep the showdown honest.

## 4. Escalation per stage

All values are multiplied by `difficulty.js` (easy / medium / hard).

| | Stage 1 | Stage 2 | Stage 3 | Stage 4 |
|---|---|---|---|---|
| Bricks (vs. today's single screen) | 60% | 85% | 100% | 110% |
| 2-hit bricks | 0% | 15% | 30% | 40% |
| Steel bars (unbreakable) | 0–2 | 3–4, forming one chamber | 2 chambers | Chambers plus moving bars |
| Drop chance per brick | 10% | 12% | 14% | 16% |
| Power-up pool | wide, slow | + split, shield | + fire, laser | + burst, titan (sweet-spot ram) |
| Ball speed | base | +4% | +8% | +12% |
| Villain attack interval | (hook only) | 1.0× | 0.85× | 0.7× in fury |

- **Power pool cumulative.** Each stage adds to the previous pool.
- **Unlock moment.** A new power's first drop gets a one-line coach tip (`coach.js`).
- **Paid continue** works per stage and keeps the stage's progress.

## 5. Structural layouts (steel bars and angled gaps)

Rules for steel chambers, so they are hard but never cheap:
- **Gap width:** at least 2.2 ball diameters.
- **Reachability:** every gap can be reached from the paddle by a launch inside the playable aim cone (±60° from vertical) with **one or two wall or bar bounces**.
  - A checker in the physics audit (`tools/playtest/physics-audit.mjs`) ray-casts the launch cone for each layout. It fails the build if any chamber has no path, or if the reaching angles cover less than 6° of the cone (too fiddly).
- **Visible bank line:** the steel face next to a gap gets a glint stripe, so the needed angle reads at a glance.
- **Prize behind the gap:** a gold, chest or key brick inside each chamber, so the player wants the hard angle.
- **Safety valve:** after 25 s without a ball entering a chamber, one bar shows a hairline crack. A fireball or ram can break it, and stage 4 bars break by themselves. Nobody stays stuck.
- **Steel look:** Tidewheel uses barnacled brass. Every chapter themes its steel through its glaze set: frost-rimed iron, bell bronze and so on.

## 6. Tidewheel (flagship, Siege, 4 stages)

Villain: Nerra, the vinyl crab, rebuilt with walk, turn, look-at-screen, fury and jump.

### Stage 1: Low Tide (hook)
- **What happens:** Nerra scuttles in, snaps the refuge chain, and Lumi's balcony drops one notch. Nerra then walks off the side and jumps into the surf.
- **Board:** few rafts, no steel. This stage teaches the pull.
- **Stake:** Lumi, one notch lower.
- **Pressure:** a slow tide.
- **Carry-over:** pearls (gold bricks) bank one shield for stage 4.

### Stage 2: Floodworks (build)
- **Board:** two sluice valves sit inside brass steel chambers with angled gaps.
- **Villain:** Nerra peeks from either wall and fires water pulses.
- **Carry-over:** each valve shut lowers the stage-4 starting water by a third.
- **Knock-down:** at the 15% cap, Nerra dives under.

### Stage 3: The Wheel (clash)
- **Board:** the tidewheel's spokes are moving steel bars, so gaps open and close.
- **Villain:** Nerra fights on the wheel hub. At 40% she leaps into the water and escapes. This uses the jump and slam animation.
- **Carry-over:** her HP.

### Stage 4: The Refuge (showdown)
- **Fight:** the full Nerra fight under a rising flood. Fury comes at 30%.
- **Win:** frees Lumi.
- **Stars:** flood margin, no balls lost, and knocked down early.

## 7. The other princess chapters (adopt after Tidewheel ships)

| Chapter | Length | Stage sketch (hook, then build, clash, showdown) |
|---|---|---|
| Frost (Frost Warden) | Siege 4 | <ol><li>The Warden dash-smashes a wall section and grabs Brum's banner.</li><li>Ice-post chambers.</li><li>The Warden dashes through walls; bricks it passes shatter and bars bend. Retreat at 40%.</li><li>Siege showdown.</li></ol> The new dash powers are the core of the redesign. |
| Vault (Snake) | Siege 4 | <ol><li>The snake steals the vault key.</li><li>Granite corridors (already structural; formalise the reachability check).</li><li>The snake coils the chamber. Retreat.</li><li>Frenzy.</li></ol> |
| Gatehouse (Korr) | Siege 4 | Today's 3 floors, plus a new hook stage 1 where Korr drags Lumi up the gate. The floor-2 and floor-3 carry-overs come from the floor-hooks fixes. |
| Bellforge (Korr's lift) | Skirmish 3 | <ol><li>Lift hook.</li><li>Bell chambers.</li><li>Lift showdown.</li></ol> |
| Tidewheel | Siege 4 | Section 6 above. |
| Lumi Breaks Out | Skirmish 3 | Keep 3 floors. Floor 1 gets the lantern clock and key from `floor-hooks.md`. |
| Rivals | Skirmish 3 | Keep 3. Apply the Seal pre-crack and dizzy carry-overs. |
| Mooncoil | Skirmish 3 | <ol><li>Hook.</li><li>Moon-gate chambers.</li><li>Showdown.</li></ol> |
| Dragon's Hoard | Skirmish 3 | Already the model. It only needs the pip track and stage cards. |

## 8. Build order

1. **Flagship visuals.** Tidewheel sea-glaze bricks, a realistic splash and a princess check (in progress on `codex/tidewheel-look`). Nerra v2 is in progress on `codex/nerra-v2`.
2. **Shared stage code.** Write `src/fantasy/stages.js` with:
   - the pip track and stage card;
   - the chapter HP pool with retreat caps and the knock-down hook;
   - the escalation table;
   - the power pool per stage.
   Add tests for the caps, carry-over and power pools.
3. **Reachability checker** in the physics audit, plus brass steel bars in the Tidewheel geometry.
4. **Tidewheel 4 stages**, wired to Nerra v2. Screenshots and a short video strip go to the owner. **Nothing reaches main until they approve.**
5. **Frost Warden redesign with dash**, then Frost as a 4-stage Siege.
6. **Remaining chapters**, in the table order.
