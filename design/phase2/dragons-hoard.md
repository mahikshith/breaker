# Dragon's Hoard: a heist level with far more bricks (proposal)

Status: concept, 2026-10-22. Not built. It comes after Serpent Rivals and needs one new character, the dragon, rendered from `prompt-library/`.

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
