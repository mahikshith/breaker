# Dragon's Hoard (Kit, castle chapter 12)

Status: built 2026-10-23 on branch `codex/dragons-hoard` as LEVELS slot 11 (`?level=12`, menu key `=`): model `src/fantasy/hoard.js`, renderer `src/fantasy/hoard-render.js`, sitter archetype `src/fantasy/creatures/`, art `assets/hoard` (`art/hoard/build.py`, packed as `ART.hoard`), tests `tests/hoard.test.js` and `tests/sitter.test.js`, physics-audit adapter `hoard`, review shots from `tools/playtest/hoard-review.mjs`. This spec merges our proposal (below), the M365 drop (`design/copilot/2026-10-23/m365/breach-level-dragons-hoard-v1.md`, `breach-character-ember-v1.md`) and the Argon drop (`argon/drops/P07`, `P08`).

## Spec

**Pitch.** A heist. Ember, a vain, greedy, cowardly dragon (he/him, M365 "Vain Hoarder"), sleeps on the hoard he stole, wearing the stolen **Brickhaven Crown** (one treasure: the Crown, not the Sunstone). Kit breaks in, grabs the Crown and escapes before the hoard comes down on him. Ember is the villain here, played for comedy; a later story beat can befriend him.

**Ember** sits behind the cave ledge at the top of the board, scenery only (no collider: the ledge is the ceiling). He is the first "big sitter" boss: `src/fantasy/creatures/sitter.js` owns the archetype (tell, release and calm state machine, pose choice, per-pose collision circles about a pivot, and clearance ejection on every pose swap for a solid skin), and `src/fantasy/creatures/ember.js` is his skin (pivot, pose keys, attack and mood poses, tell/release/calm numbers per difficulty). A later sitter is a new skin, not new physics. His poses are the R01 full-body renders (`ember/sleep`, `stir`, `windup`, `breath`, `sweep`, `defeat`; one scale, anchored on the footprint, greedy body circles measured from the alpha with the breath flame left out), with the M365 busts as the fallback: `sleep` while the eye is low (snore z's), `stir` once the eye is 60% open, after a lost ball and as his awake pose on floor 3; `windup` every tell; `breath` for the wake roar, the floor-3 breath and a catch, `sweep` for the paddle roar and an avalanche crash; `hurt` (his glare) when treasure breaks; `dizzy` (the spiral-eyed pose) when a Hush Chime sings him; `panic` (puffed up) at the greed choice and when the gate is nearly down; `defeat` when Kit escapes. The eye strip (`eye/0`-`4`, R02) and props (`prop/molten_*`, `prop/chime*`, `prop/gate_*`, `prop/burst_*`, R03) have named keys and code fallbacks until they arrive.

**The Wake eye (urgency).** A big almond eye at the top right is the meter: its lid opens from 0 to 100. Only gold wakes him (M365): a coin brick adds 100/12, 100/10, 100/8 (Easy/Medium/Hard), a chest brick twice that. Ordinary bricks are silent, so every gold shot is the player's choice. Gold pays: loot, double Kit charge, and chests drop a capsule (multi, ram, wide in turn).
- **Hush Chime** (Argon): a teal glazed tile with a bronze bell, two per floor on floors 1 and 2. A lit chime lowers the eye by 25 (20 on Hard), calms Ember for 3 s (gold adds nothing) and cancels a tell already under way. Then it rests 8 s (dim; it still bounces).
- **Eye at 100: Hoard Roar.** Tell (1.8/1.6/1.4 s), then a scorch stripe lands where the paddle was when the tell began (72 wide, slide out of it: paddle x0.75 for 3 s) and his breath melts the lowest well-filled row. The eye drops to 40 and the wake counts against the third star.
- **Molten gold** (Argon): melted bricks glow for 5/4/3.2 s. Break one in time for loot; left alone it hardens into 2-hit gold.

**Greed (stickiness): cash out or stay.** Loot (coin 10, chest 30, molten 5) is only banked if Kit escapes. When floor 2's goal falls, play freezes on a choice: **RUN** (bank at x1) or **STAY**: a vein of coins spills into empty cells from the top row down (so the floor holds at least 10 gold units and x2 is always reachable), and Kit keeps looting while the eye creeps open by itself (1.6/2.2/2.8 per second); 4 gold (a chest counts 2) lifts the multiplier to x1.5, 8 gold to x2. A RUN pill (bottom right, or key R) escapes at the current multiplier. If the pile is picked clean Kit runs on his own at the multiplier earned. If the eye reaches 100 first, Ember catches Kit: the multiplier drops to x1, it counts as a wake, and the escape starts with Ember in a full rage. How open the eye is when floor 2 ends sets floor 3's rage (M365 carry-over): under 40 calm, 40-74 cross, 75+ or caught furious.

**Floors** (9 columns of 32x16 glazed bricks on a 34u pitch, 28u side lanes, ceiling at the cave ledge; lives, score, loot and charge carry over; Continue keeps the floor):

| Floor | Goal | Pressure |
|---|---|---|
| 1. Coin mound (12 rows, 90 bricks) | Break the Crown chest (100x52, 5/6/7 hits) buried in the upper mound | Ember asleep: only the eye |
| 2. Ember stirs (10 rows, 81 bricks plus 2 weights) | Break the two counterweights hanging under the ledge (4/5/6 each), then the greed choice | Scheduled roars every 9.5/8.5/7.5 s (the first is a harmless yawn) plus the eye |
| 3. Avalanche (9 rows, 79 bricks) | Break the cave gate in the ceiling (140 wide, 12/16/20 hits) | The hoard slides down one row every 5.6/4.4/3.9 s (x0.88 cross, x0.76 furious, and it starts 1-2 rows lower). A cleared row holds the next slide. If the hoard reaches the line 120 above the paddle, Kit loses a life and it is shoved back 3 rows. Ember alternates breath (melts the ball's row) and roars every 7.5/6.5/5.5 s; the first is a yawn. |

**Stars:** escape; keep 2+ balls; never wake Ember on floors 1-2 (M365). **Powers:** Kit's WARD and ARROWS (as Rivals); Ram Ball ploughs ordinary, coin and molten bricks, and hits everything else for 3.

**Physics.** Ember never collides. Colliders are the drawn rects: bricks, chimes, the Crown chest (art fitted to 100x52), the counterweights (body plus ring, the Gatehouse housing shapes) and the gate (the ceiling span under the drawn door). The avalanche moves the field in sub-unit steps (at most 0.25u per 1/240 s) and ejects any ball it lands on (`src/clearance.js`). Brick sweeps use a broadphase, so 90 bricks cost what ~10 would (about 0.9 ms of model time per simulated second on the dev box).

**Resolved conflicts.** Ember is male (M365); the treasure is the Crown (M365, ties to Lumi wearing it later); greed is gold-only (M365/Argon), not a noise tax on every brick (ours); our cash-out multiplier and avalanche escape stay (M365 dropped them); M365's coin-chute avalanche and wing gust and Argon's brass locks were cut for the counterweights and the roar; no free Ember duel (he stays scenery, so his art never needs a collider rig). Brick count is 250 over three floors, not 200 on one: one floor of 200 needs 6u-thin lanes on a 360u board.

**Backdrop.** The owner's M365 cave plate, option A (`review-2026-10-23/hoard-cave/cave-a-pillars.png`: rock pillars down both sides, the raised dais with a chest at the top) is `assets/hoard/cave.png`, packed as WebP. It is drawn 360 wide from the playfield top, so the dais and terraces sit behind Ember; on a taller phone the plate's own dark floor colour (`floor` in the manifest) is extended downward instead of stretching it, and a night shade keeps it well below the bricks. Option B (side chutes) is not used: this layout has no chutes.

**Tuning (seeded ordinary bot, 50 runs per mode).** Easy 48/50 escapes, Medium 36/50, Hard 25/50; Serpent Rivals with the same bot: 50/50, 39/50, 29/50. Floors 1-2 rarely cost the bot a ball; the avalanche is where runs are lost.

## The first proposal (2026-10-22, superseded by the spec above)

Kept for history; where it disagrees with the spec, the spec wins. It comes after Serpent Rivals and needs one new character, the dragon, rendered from `prompt-library/`.

## Pitch

This level is a heist, not a rescue. Kit sneaks into a sleeping dragon's cave, where about 200 coin bricks are piled on and around her. He has to dig the **Sunstone** out from the bottom of the hoard and get out before she wakes up properly.

- More bricks than any level so far, so every shot breaks something.
- A greed choice that the player makes themselves.
- A real escape at the end.

## The twist: noise and greed

- **Noise meter.** Every break makes noise. A single brick makes a little and a big chain collapse makes a lot (big collapses also score more). Noise fills the dragon's **Wake meter**, which is drawn as her eye slowly opening rather than as a bar.
- **Stirring.** At one third and two thirds of the meter she stirs: a snort, then a warned fire puff across one row, with a 1.5 s glow tell. Bricks on that row melt into molten gold. They harden after 3 s and need 2 hits, so the hoard gets heavier where she breathes. The puff never touches the paddle lane. (An earlier draft also let her "stir and settle a little" here; that would lower the meter, and the next rule says it never goes down, so it was dropped.)
- **Always progress.** The meter only goes up, and every ordinary hit breaks treasure. The player is never stuck waiting for her to fall asleep again.
- **Push your luck.** Reaching the Sunstone opens the exit. The player can leave at once and bank the loot, or stay and keep looting for a greed multiplier (×1.5, then ×2) while the meter climbs. Loot only counts if Kit escapes. This decision is the hook.

## Floors

| Floor | Goal | Pressure |
|---|---|---|
| 1. The hoard | Dig a shaft to the Sunstone, through a dense field of coin bricks with gem bricks that drop power-ups. | Noise and fire puffs, with a slow teaching pace. |
| 2. She stirs | Free the Sunstone, which is held in a 6-hit claw of gold. | The dragon's tail sweeps a warned lane every 8/7/6 s. Fire puffs come faster. |
| 3. Escape | Break out through the gate before the avalanche reaches you. | The meter is full and she is awake. The hoard slides down one row every 5/4/3.5 s, like the old Invasion march. Her flame tracks the ball's row with a tell, and the gate needs 10 hits. |

## Why it sticks

- **Urgency.** The meter is visible, and the escape is a race against a falling pile of bricks.
- **Stickiness.** Every run is a loot run, and the gold banked from escapes buys future unlockables (the locked prince and sword on the roadmap). The greed choice makes players say "one more run, I'll stay longer".
- **Attitude.** Kit is smug while he sneaks and panics when she wakes. The dragon is grumpy, half-asleep and dramatic, with a slow eye opening and a fake-out snore.
- **Skill.** Quiet single-brick play keeps her asleep longer. Big collapses score more but wake her faster. Both are valid styles.

## Difficulty

| | Easy | Medium | Hard |
|---|---|---|---|
| Coin bricks | 150 | 190 | 220 |
| Wake meter, in single breaks | 140 | 110 | 90 |
| Fire tell | 1.8 s | 1.5 s | 1.2 s |
| Avalanche step | 5 s | 4 s | 3.5 s |
| Gate HP | 8 | 10 | 12 |

## Physics

- **Dragon collision.** The dragon is a compound of circles sampled along her drawn pose, the same rule as Gnash and Korr. Pose changes blend over at least 0.15 s, and any ball left overlapping is ejected along the contact normal. This is the class of bug the physics audit just found in older levels.
- **Avalanche.** It moves the whole field with the same moving-collider sweep as Invasion. It never moves bricks onto a ball without ejecting it.

## Reuse and new art

| Need | Source |
|---|---|
| Coin, gem and molten bricks | Vault brick scripts re-glazed in gold, one new family |
| Avalanche march | Invasion formation code |
| Floors, Ram Ball, power menu | Floors module, `src/fantasy/ram.js`, FantasyChapter |
| Gate | Gatehouse gate art |
| **Dragon (new)** | Prompts in `prompt-library/10-characters-and-creatures.md`, rendered on the owner's Copilot or in Blender. She needs a sleeping idle, a stirring pose, a fire-puff pose, a tail sweep, an awake roar and a grumpy face set. |
