# 20 - Game design prompts (levels)

Purpose: get a text model to design a BREACH level (or a set of three floors) in the same structure as `design/phase2/kit-and-lumi-levels.md`, with the game's fairness rules built in, so the answer can go straight to the owner for a pick and then to the builders. These are text-only prompts: no style block, no images. If Copilot can read repo files, attach `design/phase2/kit-and-lumi-levels.md`, `design/phase2/new-concepts.md` and `docs/STORY_PLAN.md`; if it cannot, the "facts" blocks below are enough.

## How to use

1. Paste **Prompt A (the facts block)** first, once per chat. It sets the game, the cast, the art kits already built and the fairness rules.
2. Paste **Prompt B (the level request)** with the fields filled in.
3. Ask for **two or three options** if the owner has not picked a direction. Never build before a pick.
4. Save the answer as `design/phase2/<level-slug>.md`.
5. Ask the same chat for follow-ups with the **follow-up prompts** at the end (difficulty table, asset list, board prompt).

## Prompt A: the facts block (paste first)

```text
You are the lead level designer for BREACH, a premium portrait brick breaker for iOS and Android (one finger drags a paddle; the ball bounces; glossy ceramic bricks break). Another team builds what you design, so every number must be concrete: seconds, hit points, units. The screen world is 360 units wide. Ordinary ball radius is 6; nominal ball speed about 345 units per second (rally cap about 1.28x); paddle 100 x 14. Test phones are 393 x 852 and 412 x 915. Levels use a 360-unit world with 16-unit brick cells (Vault 20 x 20 grid) or equal 36 x 18 bricks (princess levels).

Cast: Prince Kit (knight, hero; powers from a face-orb menu: Brick Ward, Arrows, Cosmic, Ball Fan), Princess Lumi (the Keystone, playable in her own levels; powers: Lullaby, Starlight Notes, Song Shield), Brum (friendly Yeti), Korr (armoured boar), Nerra (castle-shell crab), Gnash (emerald serpent), Mooncoil (violet serpent), Zorvax the Curator (alien collector in a saucer mothership). Story: Zorvax collects wonders for the Menagerie, a moon-sized prison museum built from stolen bricks; Lumi's Lightsong keeps bricks alive; "Kit breaks in, Lumi breaks out."

Art and mechanics already built that you can reuse: glazed bricks in several colours with intact and cracked states; granite anchors; window kit (back, front, cracked) for tunnels and hatches; machinery kit (bell, ramp, lift, ratchet, wheel, gate and gate frame, counterweight, chain, raft, plinth, lever); Korr full pose set; Nerra; Gnash (13 head expressions) and Mooncoil; Frost Warden; Kit and Lumi sprites and face sets; power icons; paddle skins; counter pips. New art must be a reusable part, not a one-off picture.

Fairness rules (non-negotiable):
1. Ordinary ball play always makes progress. No tiny weak points, no forced precision puzzle, no ordered symbol sequence, no waiting for an invulnerability timer.
2. Every hazard is warned before it can hurt, and shown once safely before it can hurt. Minimum tell about 1.3 s (1.5 to 1.8 s on Easy); a visible, readable pose or glow; no overlapping warnings in the same lane.
3. Broad villain body contacts always reduce HP, even during wind-up and recovery. Counters give faster, more satisfying damage; they are never mandatory.
4. Single bricks vanish quietly (about 0.4 s). Only big structural crashes drop debris.
5. Enemy attacks never destroy the player's bricks to hand out free resources.
6. Pause, Continue and Retry keep earned progress. Continue restores a little safety, clears live hazards and grants at least 3 s of warning grace; it never resurrects a defeated villain or duplicates rewards.
7. The lowest solid object is at least 210 units above the paddle on the shorter phone layout; flank paths at least 42 units wide; gaps at least 32 units; every route admits the full ball diameter with clearance, not only its centre. A drawn arch is not a route unless it is physically open.
8. First harmful release no earlier than 12 s after launch. After a successful reversal, a 1.5 s breather. Replacement serves auto-launch after 3 active seconds. Slow-motion aim does not freeze enemy clocks; true pause and the power picker do.
9. Power charge: provisional 18/22/26 productive ordinary-hit credits (Easy/Medium/Hard), banked at no more than one credit per active second. No second meter. Enemy destruction, arrows and active cosmic contacts cannot recharge their own power.
10. Never rely on colour alone; text contrast at least 4.5:1; 44 pt touch targets.
11. Premium, urgent, addictive, sticky. Not generic. Every level has a different goal, hazard and twist; no repeated cage-and-princess ending.
```

## Prompt B: level request template

```text
Design [LEVEL NAME] for BREACH.

Story purpose: [ONE LINE: who, where, why].
Player character: [KIT / LUMI / DUET]. Villain or hazard source: [NAME AND ROLE].
Goal for the whole level: [ONE SENTENCE].
Hazard: [WHAT HURTS THE PLAYER, HOW IT IS WARNED].
Twist: [THE ONE NEW IDEA THAT MAKES IT DIFFERENT FROM EVERY EXISTING LEVEL].
Floors or beats: [3 FLOORS = three short bites of 20 to 40 s each, with a different verb on each floor (break, turn, duel...)].
Reuse these art kits: [LIST]. New art allowed: only reusable parts, at most [N].
Target length: a complete Easy run of [2 TO 3] minutes.
Stickiness hooks to include: [LIST FROM THE HOOK BANK, OR "choose two"].

Output EXACTLY in this structure (it matches design/phase2/kit-and-lumi-levels.md):
1. Title line: "# [Level name]" and a status line "Status: design proposal, [date]. Boards first; nothing is built until the owner picks." plus the story source.
2. "Shared rules" bullet list: copy the fairness rules above that apply, plus any level-specific rule.
3. If the level introduces a shared mechanic or power, a section for it, with "Why it is sticky" and a reuse note.
4. The level section: a one-paragraph premise, then a table with columns | Floor | Goal | Hazard | Reused art | for each of the three floors, with every number concrete (HP, hits, notches, seconds). Then "Powers" and "Why it hooks".
5. "Asset reuse plan" table with columns | Need | Source | New work |, listing what already exists and the minimal new reusable work.
6. "Difficulty (provisional)" table: rows Easy, Medium, Hard; columns for villain HP (24/32/40 as the default), tell length (1.8/1.6/1.4 s), hazard interval (10/8.5/7.5 s), active hazards, mistakes allowed, charge credits (18/22/26).
7. "Hazard fairness check": for each hazard, state its tell, how it is shown safely first, the legal route width, the breather, and what happens at pause and Continue.
8. "Stickiness check": the single skill moment the player can repeat, the visible payoff, what pulls them to the next floor.
9. "Order": the build order (shared module first, then the level using finished art, then new art).
10. "Open questions for the owner": a short list. No "TBD" inside tables.

Be concrete. Use game units and seconds. Keep each floor distinct. If a requirement conflicts with a fairness rule, say so and change the design rather than the rule.
```

## Hook bank (pick from these; they match `design/phase2/new-concepts.md`)

| Hook | What the player does | Why it sticks |
|---|---|---|
| **Floors** (stage climb) | Clear a goal, camera climbs to the next floor; progress saves per floor | 20 to 40 s bites, the next floor is visible at the top |
| **Sweet-spot streak** | Centre-third hits three times in a row lights a ring and launches the Ram Ball | Clear skill ladder (1/3, 2/3, 3/3), readable on the paddle |
| **Heat streak** | Bricks without touching the paddle add heat (x2, x3, Molten); touching the paddle cools one step | A run within the run; the ball itself shows the streak |
| **Serpent bait** | Break lure bricks to pull a snake forward and time a clash | A skill moment the player causes and can repeat |
| **Duet swap** | Tap an inactive orb to swap hero in 0.3 s; a rare Duet combo | A real choice every few seconds |
| **Living mortar** | Every 4 s a missing brick regrows (1 s glow tell); breaking the keystone ends it | Gentle urgency with one clear, fair target |
| **Countdown the player controls** | "Ring the bell 5 times" | A clear finish line the player moves |
| **Rematch villain** | A villain the player already knows returns with a new move | Recognition and revenge |
| **One big crash** | A drawbridge or tower collapses | The level's spectacle |
| **Daily Breach** | Fixed daily seed from finished floors with a twist | A reason to return, at almost no content cost |

## Worked example: Prompt B filled in

```text
Design SERPENT RIVALS for BREACH.

Story purpose: Gnash (emerald) and Mooncoil (violet) live in two tunnels on opposite tower walls and hunt Lumi; Kit is outside and cannot reach her yet.
Player character: LUMI (paddle with her song powers). Villain or hazard source: Gnash and Mooncoil, one lane each.
Goal for the whole level: climb three floors of the tower and reach the roof door.
Hazard: each serpent lunges along its own lane after a hiss and a 1.6 s glow tell, then bites across one brick row; a ball or paddle in the bite lane is lost.
Twist: the player baits them. Breaking a lane's lure bricks pulls that serpent forward; when both heads enter the shared chamber within 1 s they snap at each other, both recoil and are dizzy for 2 s, and a power-up drops.
Floors or beats: Floor 1 teach one serpent, Floor 2 both serpents in separate lanes, Floor 3 shared chamber clash to open the roof door.
Reuse these art kits: Gnash and Mooncoil heads (13 expressions), window kit for tunnel mouths, Vault wall bricks, Lumi face orb and pink-gold paddle, power icons Lullaby, Starlight Notes, Song Shield. New art allowed: only reusable parts, at most 2 (a lure-brick variant, a chamber floor tile).
Target length: a complete Easy run of 2 to 3 minutes.
Stickiness hooks to include: Serpent bait, One big crash, Floors.
[then the 10-point output structure above]
```

## Follow-up prompts

- **Difficulty table only:** "Redo the Difficulty table for [LEVEL] with Easy, Medium and Hard values for villain HP, tell length, hazard interval, active hazards, mistakes allowed and charge credits. Keep the first harmful release at 12 s or later, no overlapping warnings, and a 1.5 s breather. Show the reasoning for each number in one line."
- **Fairness audit:** "Audit this level against the 11 fairness rules. For each rule write PASS or FAIL and one sentence. For each FAIL, propose a fix that keeps the design idea."
- **Asset list:** "List every art asset this level needs. For each: name, what it is, whether it already exists in the kit, size in units, and whether it must be a reusable part. Group by new art and reused art."
- **Board prompt:** "Write the Copilot image prompt for a concept board for this level using the structure in `15-concept-boards.md`."
- **Two more options:** "Give two alternative twists for this level, each in 3 lines, with the one risk each would add."
- **Retention without claims:** "List three ways the level makes players want one more try. Do not claim any retention numbers; this is a design rationale only."
