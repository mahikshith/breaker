# Serpent Rivals (Kit, castle chapter)

Status: built and wired as chapter 11 (LEVELS slot 10, `?level=11`): model `src/fantasy/rivals.js`, renderer `src/fantasy/rivals-render.js`, art `assets/rivals` (packed as `ART.rivals`), tests `tests/rivals.test.js` and `tests/castle-chapters.test.js`, physics-audit adapter `rivals`, review shots from `tools/playtest/rivals-review.mjs`. Source idea: the owner's two-snake rivalry (`docs/MOONCOIL_RELIQUARY.md`, "Future direction"; `design/phase2/new-concepts.md` §1).

## Goal

Kit climbs the twin-serpent hall and breaks the **Twin Seal**. Gnash (emerald) lunges from the left-wall windows and Mooncoil (violet) from the right. Each serpent owns its own lane rows. Both have one window on the **Crossing** row, and that row ends in the **Clash Chamber**: a brick-free pocket in the middle of the board. If both heads land in the chamber within the clash window, they snap at each other. Both recoil, both sway dizzy, a capsule drops and the Seal cracks. The player causes clashes by striking a serpent's **rune lure**.

## Floors (shared floors pattern: climb transition, lives/score/charge carry over, Continue keeps the floor)

| Floor | Goal | Serpents | Teaches |
|---|---|---|---|
| 1. Lure hall (9 rows, 59 bricks) | Break the 6 hatch bars | Gnash only (3 windows). Mooncoil's windows are shuttered scenery. | The first lunge is harmless. Striking the rune lure calls Gnash now, so the player picks his timing, and a lured call resets his rhythm. |
| 2. The crossing (11 rows, 58 bricks + chamber) | Break the Crossing seal (10/12/14) | Both, 2 windows each, one on the Crossing | The floor opens with a harmless clash: both serpents strike the Crossing together, snap, recoil and sway. It pays nothing, but the player sees the clash once. |
| 3. Twin Seal (12 rows, 63 bricks + chamber) | Break the Twin Seal (16/20/26) | Both, 3 windows each | Full pressure. Clashes and dizzy heads are the fast way through. |

Board: 7 columns of 32×18 bricks on a 36u pitch, 22u rows. Both 56u side lanes stay open. Each window row keeps its edge cell open (the lane mouth). Floors 2–3 carve a 3×3 chamber around the centre column, plus a one-column shaft from the chamber down to the bottom row, so a straight shot from the paddle reaches it.

## Hazards and tells

- **Lunge** (from Lumi tower, unchanged shape):
  - peek 0.6 s (eyes in the recess)
  - hiss tell (mode length), with a `bite-warning` across the row
  - strike 0.35 s along the row
  - chew 0.45 s on a home lane, or hold for the clash window on the Crossing
  - retreat 0.6 s
  - A striking jaw swallows the ball. On Easy it is spat back onto the paddle with no life lost.
- **Bite eats its own row only.** It eats ordinary bricks, never lures or bars, with quiet single vanishes and no score or charge for the player. A Crossing bite stays on its own half.
- **Urgency, the one source: the Seal ward.** On floors 2–3, every brick a serpent eats adds a ward plate to the Seal, up to a cap of 2/4/6. A ball or arrow hit strips one plate before it can hurt the Seal.
  - The player races the serpents for the board.
  - Every brick the player breaks is food the serpents never get.
  - Bricks are finite, so ordinary play always gets through.
- **Chain:** on Medium/Hard, a second serpent can prime 1.2 s after the first. Scheduled lunges never put both serpents on the Crossing at once, so every clash is the player's doing.

## Counterplay

- **Hit a head** during the hiss, a prowl or a harmless strike: hurt face, early retreat, +2 charge.
- **Bait a clash:** while one serpent hisses on the Crossing, strike the other serpent's lit lure.
  - A lured lunge uses a short peek (0.3 s) and a short tell (1.1/0.95/0.8 s), so both heads land inside the window.
  - Payoff: all ward plates shatter, the Seal takes 6/5/5 damage, one capsule drops (multi, ram, wide in turn) and the player scores +200.
- **Dizzy heads** sway in the chamber for 2 s. A ball hit on one deals 3 Seal damage straight through the ward, and that head then retreats hurt.
- **Kit's powers:**
  - Ward: a barrier under the paddle for 6 s.
  - Arrows: 5 shots that stop on the first brick, lure, head or Seal they meet.
  - Ram Ball: the sweet spot (`ram.js`). It ploughs through bricks and deals 3 to the Seal.
  - Menu mapping: `RIVALS_KINDS = { shield: 'ward', arrows: 'volley' }`.

## Difficulty (`RIVALS_MODES`)

| | Easy | Medium | Hard |
|---|---|---|---|
| Hatch bar HP | 2 | 2 | 3 |
| Seal (floor 2 / 3) | 10 / 16 | 12 / 20 | 14 / 26 |
| Ward cap | 2 | 4 | 6 |
| Clash damage / dizzy hit | 6 / 3 | 5 / 3 | 5 / 3 |
| Lunge interval | 7 s | 6 s | 5 s |
| Tell / lured tell | 1.7 / 1.1 s | 1.45 / 0.95 s | 1.2 / 0.8 s |
| Clash window (prowl hold) | 1.6 s | 1.3 s | 1.0 s |
| Chain | 1 | 2 | 2 |
| Bite | spit back | ball lost | ball lost |

A seeded ordinary bot (landing predictor with aim error, no powers, no deliberate lures, no Continue) was run for 20 seeds per cell on both phone heights.

| | Easy | Medium | Hard |
|---|---|---|---|
| Bot wins | 100% | 60–75% | 80–85% |
| Median winning run | 140–180 s | 185–200 s | 220–255 s |

With the same bot, Lumi tower's Medium wins about 90% and its Hard about 80%. The bot never reads a tell, so its losses are a bite lottery, and Medium against Hard is noise for it. What separates the modes for a human is tell length, interval, Seal HP and ward cap, which the bot does not exercise. That still needs a human playtest.

## Physics

- Each serpent is a set of compound circles sampled along the same drawn path, and each circle is swept from its previous to its current pose. Nothing collides inside the window opening.
- No point moves 4u or more in a 1/240 s step (tested for every window, and through a clash, its recoil and its sway). Dizzy sway starts and ends at zero amplitude, and an early retreat fades the sway out over 0.25 s.
- A circle that emerges onto a ball ejects it along the contact normal within the same step.
- Lane mouths and off-lane lures mean a hissing head can never pin a ball against a solid.
- The jaw eats one ball-width ahead of the head, so a harmless head can never push a ball into a brick.
- A clash starts from the full chamber pose, the snap is a pose freeze (heads never close on each other), and the recoil moves away from the rival.
- Physics audit (`--level rivals`): 0 failures over 96 runs (12 bot seeds + 4 idle seeds × 3 modes × 2 phones, 400 s cap).

## Why it hooks

It is a skill moment the player causes and can repeat: watch one serpent hiss and strike the other's rune. The payoff is visible every time, as two heads snap, sway dizzy and crack the Seal. The ward race gives each floor a clear "beat them to the bricks" urgency without timers. The two personalities read at a glance from their sides, skins and lanes.

## Reuse

- Lunge geometry: `LUNGE` from `lumitower.js` (window kit dimensions).
- Ram Ball: `ram.js`.
- Sweeps: `circleSweep` and `reflect` from `bellforge.js`, and `sweepTarget` from `carrier-physics.js`.
- Floors and Continue: the same pattern as Gatehouse and Lumi tower.
- Art:
  - both serpent head sets (`assets/snake-emerald` for Gnash, `assets/snake` for Mooncoil), using the blink/hiss/strike/chew/taste/snarl/shock/dizzy/ouch/grin expressions
  - the layered window kit (`castle-window.js`)
  - vault bricks
  - Kit's Ward and Arrows

## New art needed

- **Rune lure stone**, 32×18 brick variant in two tints (emerald and violet), with lit and dim states.
- **Twin Seal door**, 140×30, with crack stages and ward plates (up to 6 small scale plates on its face).
- **Chamber floor**, a scenery plate for the 3×3 pocket. It must not be a drawn ring.
- **Shuttered window front** for floor 1 (Mooncoil's eyes behind the slats).
- **Clash spark/impact sprite.**

The rest is code-drawn from existing parts.

## Renderer notes (for wiring)

- `m.lunges[]`: `snake`, `win.side`, `stage`, `mood`, and `points` (head first, with r).
- `m.chamber`, `m.lures[]` (with `lit`), `m.seal` (`hp`, `ward`, `cracks`), `m.shutters`, `m.capsules`, `m.shots`, `m.ward`.
- Effects:
  - `bite-warning` (`snake`, `cross`, `teaching`)
  - `clash` (`teaching`, `heads`)
  - `seal-feed` (`to`, `snake`)
  - `ward-chip`, `ward-shatter`, `seal-hit`, `dizzy-hit`, `lure-call`, `lure-dim`, `chomp`, `swallow`, `snake-hurt`
  - `hatch-open`, `seal-open`, `seal-shatter`, `volley`, `arrow-hit`, `ward-deploy`, `ward-bounce`, `capsule-*`
- Suggested stars: clear it, keep 2+ balls, and land at least one clash.
