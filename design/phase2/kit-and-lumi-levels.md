# Two new castle levels: Gatehouse Siege (Kit) and Lumi Breaks Out (Lumi)

Status: design proposal, 2026-10-22. Boards first; nothing is built until the owner picks.
Story source: `docs/STORY_PLAN.md` ("Kit breaks in, Lumi breaks out"). Both levels reuse existing art kits; any new art must be a reusable part, not a one-off picture.

## Shared rules (from earlier owner steering)

- One-finger paddle, 360u world, ordinary ball radius 6, the 100×14 paddle. Phones 393×852 and 412×915.
- Ordinary ball play always makes progress. No tiny weak points, no forced precision puzzle, no waiting for invulnerability.
- Every hazard is warned and shown once safely before it can hurt.
- Single bricks vanish quietly; only big structural crashes drop debris.
- Enemy attacks never destroy the player's bricks to hand out free resources.
- Pause, Continue and Retry keep earned progress.

## New shared mechanic: floors (stage climb)

Both levels are **three floors tall**. Clearing a floor's goal plays a short camera climb (about 1.2 s, with the hero running) to the next floor. Bricks, villain and lives carry over, and progress is saved per floor, so Continue restarts the current floor, not the level.

**Why it is sticky:** each floor is a 20–40 s bite with its own small win. The next floor is visible at the top edge, which pulls the player on.

Build it once as a reusable `floors` module so later levels (and Bellforge or Tidewheel remixes) can use it.

## New shared power: Sweet-Spot Ram (queued owner request)

Hitting the ball with the paddle's centre third three times in a row lights a ring on the paddle. The next centre hit launches a **Ram Ball**: a giant ball, 2.2× size, that ploughs through bricks for 2.5 s or 14 bricks, whichever comes first.

- It bounces off villain armour and deals 3 HP.
- An off-centre hit resets the streak.
- The ring shows 1/3, 2/3 and 3/3 so the skill is readable.

It works in both levels. Kit's version is a steel battering ram and Lumi's is a song-note sphere: the same code with two skins.

## A. Gatehouse Siege (Kit breaks in)

Kit storms the Menagerie gatehouse to reach Lumi's tower. Korr, who is still sore from Bellforge, holds the gate.

| Floor | Goal | Hazard | Reused art |
|---|---|---|---|
| 1. Drawbridge | Break the two counterweight housings (4 HP each). The drawbridge then **crashes down**, the level's big debris moment. | Chains swing slowly. Hitting a chain does nothing, but it never blocks a lane. | counterweight, chain-v2, gateFrame, bricks, bellforge-background (darkened) |
| 2. Murder holes | Turn the portcullis winch: each ordinary hit on the wheel rim turns it one notch, and 8 notches open the gate. | Korr drops iron bells through two murder holes after a 1.5 s snort tell. A bell rolls down the ramps toward the paddle lane. Hit it twice to shatter it, or let it reach the bottom, where it **stuns the paddle for 0.8 s** instead of costing a life. | wheel, ratchet, gate, bell, ramp, Korr idle/windup/release |
| 3. Inner gate duel | Defeat Korr (24/32/40 HP). | Korr charges the gate. During the warned charge, the Ram Ball or a returning bell staggers him for big damage. | Korr full set, gate, plinth |

**Kit's powers:** the existing face-orb menu (Ward, Arrows, Cosmic, Ball Fan) plus Ram Ball from the sweet spot. Ward locks a shield on the drawbridge chain or the paddle lane, depending on the floor.

**Why it hooks:** three different verbs (break, turn, duel), one big crash, a rematch villain the player already knows, and a skill streak (the sweet spot) that rewards clean play.

## B. Lumi Breaks Out (Lumi is the player)

After Kit opens the Vault, Lumi says "My turn." She takes the paddle and climbs the Menagerie tower to the roof, where Kit and Brum wait with the escape. The emerald serpent, Gnash, coils up the outside of the tower and chases her.

| Floor | Goal | Hazard | Reused art |
|---|---|---|---|
| 1. The cell | Break out of her own cage: 6 bar bricks, then the cell floor above. | None yet. This is the teach floor, with Lumi's face orb and her song power introduced. | vault bricks, bars, cage, princess clips |
| 2. Serpent windows | Clear the stair bricks to open the next floor's hatch. | Gnash lunges through one of three tower windows after a hiss plus a 1.6 s glow tell, then **bites across one brick row** (it eats bricks there, the old Vault mechanic in reverse). If the paddle or ball is in the bite lane, the ball is lost. | snake-emerald heads and canvas body, vault walls |
| 3. The roof race | Ring the rooftop signal bell 5 times with ordinary hits. Each ring brings Kit's rescue rope lower. | Gnash wraps the bell tower and tightens. His tail sweeps a warned lane, and the serpent is beatable for bonus stars but optional. | bell, bellCradle, chain-v2, Kit Cheer, Brum |

**Lumi's power (her face orb, the same charge rules as Kit's):**

- **Lullaby:** a song wave calms Gnash for 4 s, cancelling his current lunge. He visibly sways and yawns, which uses the snake's existing blink and dizzy heads.
- **Starlight Notes:** the next 6 broken bricks drop power-ups that drift toward the paddle. This is "she steers power-ups with her song" from the story.
- **Ram Ball** works the same, with a song-note skin.

**Expressions carry the tension:** Nervous and Panic while Gnash is near, Running and Jump during the floor climbs, Cheer on the roof.

**Why it hooks:** the hero switch is a story payoff. The chase builds as the floors go up, and the finale (ring the bell, the rope drops) is a clear countdown the player controls.

## Asset reuse plan

| Need | Source | New work |
|---|---|---|
| Lumi paddle and face orb | `assets/princess/princess.blend`, rendered with the same Blender face-orb setup as Kit | Face set (Idle, Nervous, Panic, Cheer, Focus) and a pink-gold paddle skin. Both are reusable for every future Lumi level. |
| Ram Ball | Ball shader plus two skins (steel ram, song sphere) | Reusable by every level |
| Tower walls and windows | Vault wall bricks plus gateFrame | One window-arch sprite, reusable |
| Gnash in windows | Existing snake-emerald heads and canvas body | Lunge path only (code) |
| Korr's charge | Existing Korr windup and release | None |
| Floor climb | Camera offset plus Running_A and Kit run frames | Code only |

## Difficulty (provisional)

Easy, Medium and Hard scale villain HP (24/32/40), tell length (1.8/1.6/1.4 s) and hazard interval (10/8.5/7.5 s), as in Bellforge. A complete Easy run should take 2 to 3 minutes across all three floors.

## Order

1. Owner picks from the boards.
2. Build the shared floors and Ram Ball code.
3. Build Gatehouse Siege, because it uses only finished art.
4. Render Lumi's face orb and paddle in Blender.
5. Build Lumi Breaks Out.
