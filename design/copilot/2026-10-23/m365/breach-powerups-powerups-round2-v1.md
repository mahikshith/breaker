The following context could be long , don't loose the context . Breakdown the folloiwng into multiple subtasks , but before that give it a very deep read , i have pasted both gpt sol and opus 5.5 repsonses below from m365 , be self aware and understand both the repsones and think about which are all really useful and apply them or have a though about them.


Opus 5.5 response : 

---
breach_drop: 1
kind: powerups
slug: powerups-round2
version: 1
date: 2026-10-23
status: proposal
tool: Copilot Studio
depends_on: []
---

# Power-up rework, round 2: "Build Stack"

## Two directions

**Direction A: Build Stack (BALL x PIT style).** Every capsule you catch goes into a visible **build tray** (2 to 3 slots). If you catch the same capsule again it levels up (Lv1 to Lv3), and two different capsules side by side trigger a named **combo**. The fun comes from growing a build during a run, like "FIRE Lv2 + SPLIT = FIRESTORM". To stop a single power from making the level easy, every power has a limit (pierce limit, villain damage limit, slot limit), and drop chance falls once your build is strong.

**Direction B: Big Moments.** Drops are fewer and rarer, but each one is a big event. Only one power is active at a time, every power lasts 5 to 6 s, and each catch gets a hitstop and a camera punch. This is easy to read and easy to balance, but there are no builds, no stacking and no combo moments. The game would still feel thin after a run.

**Recommended: A.** It is the only one of the two that gives "one more run" builds. The limits below also fix the APK problem where one power made the game too easy.

## Summary
- Drops come back in every chapter (6 to 11 had none in the APK), with a pity rule, so a run never feels stale.
- A build tray, Lv1 to Lv3 stacking and 8 named combos make power-ups a build, not a random buff.
- Anti-easy caps: FIRE pierces at most 4 bricks per return, capsule damage to villains is 1 per hit, Hard gets 2 slots, and drop chance drops ×0.6 once 2 powers are at Lv3.
- The Ram gets bigger and becomes truly unstoppable: radius 13.2 → 20, it breaks any brick with 3 HP or less on contact without bouncing, and it deals 5 villain damage. This fixes "the big ball didn't break bricks".
- AIM becomes SIGHT and teaches the three-dot aim. A first-run "HOLD TO AIM" hint fixes "players don't know aim exists".

## Decisions for the owner
1. Overall feel: A Build Stack [RECOMMENDED], B Big Moments.
2. Tray full and a new capsule is caught: A the oldest power ends [RECOMMENDED], B the new capsule is converted to +5 s on all active powers, C the player chooses (pauses play).
3. Tray position: A right side of the control deck, mirroring the face orb [RECOMMENDED], B under the score at top-right.
4. Kit's COSMIC: A rework into "arm the Ram now at Lv2 size" [RECOMMENDED], B keep it as a separate unstoppable ball, C remove it.
5. BURST vs BALL FAN overlap: A BURST fires 3 aimed balls, BALL FAN fires 5 in a wide fan [RECOMMENDED], B merge them into one.

## Spec

### 1. Audit

| Power | What the player feels today | Decision or skill? | Call |
|---|---|---|---|
| SPLIT x3 | Fun chaos, the screen fills with balls | Neither; free value | **Keep**, now combos with everything |
| BURST +3 | Same as SPLIT | Neither | **Rework**: 3 balls fired along the current Focus aim |
| FIRE | Melts everything; one catch makes the level easy | Neither | **Tune**: pierce limit per paddle return |
| WIDE | Barely noticed | Neither | **Tune**: visible 3 levels; Ram centre zone stays 34 wide |
| AIM | Duplicates Focus; players don't know aim exists | Neither | **Rework → SIGHT**: long trajectory line and longer Focus |
| LASER | OK, but 7 s and done | Positioning skill | **Tune**: levels and a fire rate you can feel |
| SHIELD | Reassuring | Neither | **Keep**, add levels |
| SLOW | Invisible | Neither | **Rework → BUBBLE** (bubble over the paddle) |
| TINY | Plain punishment | Dodge skill | **Rework**: risk/reward (Ram arms in 2 hits) |
| Sweet-Spot Ram | "Big ball doesn't break bricks"; feels small | Skill (3 centre hits) | **Rework**: bigger and truly unstoppable (see 5) |
| Kit BRICK WARD | Copies SHIELD | Timing | **Rework**: full-width wall 8 s that also reflects villain shots |
| Kit ARROWS | Satisfying volley | Timing | **Keep**: 6 arrows at the 6 lowest bricks |
| Kit COSMIC | Copies the Ram | Neither | **Rework**: arms the Ram instantly at Lv2 size |
| Kit BALL FAN | Copies BURST | Aim | **Tune**: 5 balls in a 70° fan, aimed with Focus |
| Space LASER | Copies the capsule | Positioning | **Tune**: grants LASER Lv3 instantly |
| Space UNSTOPPABLE (Nix TITAN) | Strong but short | Neither | **Tune**: 6 s, pierce limit 8, villain damage 2 per hit |
| Space 5 BALLS | Copies BURST | Neither | **Tune**: grants BURST and SPLIT together (triggers a combo) |
| Lumi Lullaby | Clear, calm | Timing | **Keep**: 5 / 4.5 / 4 s |
| Lumi Starlight Notes | Floods the screen with capsules | Neither | **Tune**: next 6 bricks drop capsules, queued under the falling limit, never TINY |
| Lumi Song Shield | Good | Neither | **Keep** |

### 2. Build tray and stacking
- Slots: Easy 3, Medium 3, Hard 2. Each slot is a 26x26 glazed capsule icon with an "Lv" pip strip (1 to 3 chrome pips, never rings). They sit at x 262 to 346 in the control deck, outside the centre drag lane.
- Catching the same capsule again: +1 Lv (max Lv3 on Easy and Medium, Lv2 on Hard) and the timer refreshes to the Lv duration. Timers are capped by max power timer: 20 / 18 / 14 s.
- Catching a new capsule when the tray is full: the oldest power ends (decision 2).
- Capsule hits on villains always deal 1 damage per hit, so ordinary play stays the way to beat villains.

| Capsule | Lv1 | Lv2 | Lv3 | Duration Lv1 (E / M / H) s | +s per Lv |
|---|---|---|---|---|---|
| SPLIT x3 | each live ball → 3 | — | — | instant | — |
| BURST +3 | 3 balls along aim, 25° spread | 4 balls | 5 balls | instant | — |
| FIRE | pierces 1-HP bricks, limit 4 per return (Hard 3); 2+ HP bricks take 2 dmg and the ball bounces | + splash 1 neighbour | all balls burn | 8 / 7 / 6 | +3 |
| WIDE | 100 → 128 | 148 | 165 (Hard max 148) | 12 / 10 / 8 | +4 |
| SIGHT | 9 dots to the 1st bounce + 4 past it; Focus hold 1.2 → 2.0 s | 2nd bounce shown | Focus 0.2x | 15 / 12 / 10 | +4 |
| LASER | 2 bolts every 0.5 s, 1 dmg | every 0.35 s | bolts pierce 1 | 8 / 7 / 6 | +3 |
| SHIELD | 2 / 2 / 1 saves | +1 save | +1 save | until used | — |
| BUBBLE | 90-wide bubble, balls 0.55 / 0.6 / 0.65x | 110 wide | 130 wide | 9 / 8 / 7 | +3 |
| TINY (bad) | 100 → 72 / 68 / 64; Ram arms in 2 hits | — | — | 8 / 9 / 10 | refresh |

### 3. Synergies (shown as a combo badge, Lilita One 18, #FFD36B, scale 0.6 → 1, 0.25 s, easeOutBack)

| A + B | Combo | Result |
|---|---|---|
| FIRE + SPLIT | FIRESTORM | split balls inherit fire; total pierce limit shared ×1.5 |
| FIRE + LASER | FLARE BOLTS | bolts ignite: 1 splash damage to an adjacent brick |
| LASER + WIDE | QUAD GUNS | 4 cannons, same fire rate |
| WIDE + SHIELD | RAMPART | shield bar spans full width, +1 save |
| BUBBLE + SIGHT | DEAD EYE | Focus lasts as long as you hold while the ball is in the bubble (max 4 s) |
| BURST + SPLIT | SWARM | BURST balls auto-split once (still under the ball cap 12 / 9 / 5) |
| TINY + Ram | GLASS CANNON | Ram arms in 2; Ram radius +2 |
| FIRE + Ram | METEOR | Ram breaks 4-HP bricks and leaves 1-dmg embers on neighbours |
| SHIELD + BUBBLE | SAFE HARBOUR | a ball saved by the shield is relaunched at 0.6x |

### 4. Economy
- Drops are on in **all 11 chapters**, from all breakable bricks, including chapter mechanics bricks. Duel floors with fewer than 40 breakable bricks also drop from villain hits: 0.25 / 0.2 / 0.15.
- Base chance per brick: 0.16 / 0.12 / 0.09. Pity: a guaranteed good capsule after 8 / 10 / 12 breaks without a drop.
- Max capsules falling at once: 2 / 2 / 1. Minimum gap between drops: 1.2 s. Fall speed 110 units/s.
- Anti-snowball: if 2 powers are at Lv3 (Hard: 2 at Lv2), drop chance ×0.6. With an empty tray: ×1.25.
- TINY share: weight 3 / 4 / 6. It is never a pity drop.
- No power is required: every chapter must be clearable with zero catches (bot test).

### 5. Readability (catch → active → last 1.5 s)
Every catch: 0.04 s hitstop. The capsule icon flies to its slot, scale 1.3 → 1, 0.2 s, easeOutBack. The label pops above the paddle (Lilita One 16), then fades over 0.6 s.
Every ending, last 1.5 s: the slot glaze drains, the icon blinks 3 times (0.25 s on, 0.25 s off), and 3 ticks rise in pitch (C5, E5, G5). The power itself also shows its own tell:

| Power | Catch sound | Juice | Last 1.5 s tell |
|---|---|---|---|
| SPLIT | glass "plink-plink-plink" | balls pop apart with chrome sparks | — |
| BURST | 3-shot pop | paddle recoil 3 units, 0.1 s | — |
| FIRE | whoomph | ball turns ember orange #FF8A3D, rendered ember chips | flame shrinks scale 1 → 0.5, sputters |
| WIDE | ceramic slide-click | paddle extends 0.18 s, easeOutBack | paddle wobbles ±2 units |
| SIGHT | lilac chime | dots #E3B6FF | dots thin out from 9 → 3 |
| LASER | servo clack | cannons unfold onto the paddle | cannons fold, last bolt dims |
| SHIELD | deep ceramic thunk | teal glazed bar #2EC4B6 | (no timer) bar cracks on each save |
| BUBBLE | soft glass chime | glass dome | glass thins, scale 1 → 0.92, easeInQuad |
| TINY | sad kazoo "bwomp" | paddle squeezes, frown decal | paddle grows back with a pop |

**Aim hint (fixes "no one knows how to aim"):** in chapter 1, the first 2 times the ball comes down, and in any chapter after 30 s without using Focus, show a ghost thumb icon and "HOLD TO AIM" (Lilita One 16, #E3B6FF) 40 units above the paddle. The 3 aim dots pulse alpha 0.4 → 1, 0.5 s. The hint stops for good after 3 successful Focus shots.

### 6. Sweet-Spot Ram (bigger and unstoppable)

| Value | Today | Easy | Medium | Hard |
|---|---|---|---|---|
| Centre hits to arm | 3 | 3 | 3 | 3 (TINY: 2) |
| Radius | 13.2 | 22 | 20 | 18 |
| Speed (units/s) | 345 | 400 | 400 | 400 |
| Lasts (s) / bricks | 2.5 / 14 | 3.2 / 24 | 3.0 / 20 | 2.6 / 16 |
| Brick rule | ploughs 1-HP bricks only | breaks any brick with 3 HP or less on contact, no bounce; 4+ HP bricks take 3 dmg and the Ram keeps going | same | same |
| Villain damage | 3 | 5 | 5 | 4 |

- Bounces off granite, armour and villains (after dealing damage). The centre zone stays 34 units wide even with WIDE.
- Arming: 3 chrome pips on the paddle light up #FFD36B, one per centre hit.
- Launch: 0.06 s hitstop, ball scale 0.5 → 1 over 0.12 s (easeOutBack), screen shake 3 units for 0.2 s, deep "DOOM" plus a chrome ring-out.
- Last 1.5 s: chrome dulls, 3 heavy thuds in falling pitch, then radius → 6 over 0.4 s (easeInQuad).

## Data
```json
{
  "kind": "powerups",
  "capsules": [
    {"id": "split", "new": false, "label": "x3", "color": "#5CCF6A", "effect": "each live ball becomes 3", "numbers": {"duration_s": 0, "count": 3, "stack": "adds", "cap": 9}, "drop_weight": {"easy": 10, "medium": 9, "hard": 7}, "good": true, "counterplay_or_cost": "ball cap 12/9/5", "feel": "glass plink x3, chrome sparks", "change": "keep"},
    {"id": "burst", "new": false, "label": "+3", "color": "#F7C948", "effect": "3/4/5 balls fired along current Focus aim", "numbers": {"duration_s": 0, "count": 3, "stack": "adds", "cap": 5, "spread_deg": 25}, "drop_weight": {"easy": 8, "medium": 7, "hard": 5}, "good": true, "counterplay_or_cost": "fired from the paddle, bad aim wastes it", "feel": "3-shot pop, paddle recoil 3 units", "change": "rework"},
    {"id": "fire", "new": false, "label": "FIRE", "color": "#FF8A3D", "effect": "pierces 1-HP bricks up to a limit per paddle return", "numbers": {"duration_s": [8, 7, 6], "per_level_s": 3, "pierce_limit": [4, 4, 3], "stack": "refreshes", "cap": [3, 3, 2]}, "drop_weight": {"easy": 7, "medium": 6, "hard": 4}, "good": true, "counterplay_or_cost": "pierce limit, 2+HP bricks bounce", "feel": "whoomph, ember chips; last 1.5 s flame sputters", "change": "tune"},
    {"id": "wide", "new": false, "label": "WIDE", "color": "#3FA8F5", "effect": "paddle 100 -> 128/148/165", "numbers": {"duration_s": [12, 10, 8], "per_level_s": 4, "stack": "refreshes", "cap": [3, 3, 2], "ram_zone_w": 34}, "drop_weight": {"easy": 9, "medium": 8, "hard": 6}, "good": true, "counterplay_or_cost": "Ram centre zone does not grow", "feel": "ceramic slide-click; last 1.5 s wobble", "change": "tune"},
    {"id": "aim", "new": false, "label": "SIGHT", "color": "#C46BF0", "effect": "long trajectory dots and longer Focus hold", "numbers": {"duration_s": [15, 12, 10], "per_level_s": 4, "dots": 13, "focus_hold_s": 2.0, "stack": "refreshes", "cap": [3, 3, 2]}, "drop_weight": {"easy": 8, "medium": 7, "hard": 6}, "good": true, "counterplay_or_cost": "only helps if the player holds to aim", "feel": "lilac chime; dots thin 9 -> 3", "change": "rework"},
    {"id": "laser", "new": false, "label": "LASER", "color": "#FF4D6D", "effect": "twin cannons auto-fire", "numbers": {"duration_s": [8, 7, 6], "per_level_s": 3, "fire_interval_s": [0.5, 0.35, 0.35], "damage": 1, "stack": "refreshes", "cap": [3, 3, 2]}, "drop_weight": {"easy": 7, "medium": 6, "hard": 5}, "good": true, "counterplay_or_cost": "must position under targets", "feel": "servo clack; cannons fold at end", "change": "tune"},
    {"id": "shield", "new": false, "label": "SHIELD", "color": "#2EC4B6", "effect": "glazed bar saves missed balls", "numbers": {"duration_s": 0, "count": [2, 2, 1], "stack": "adds", "cap": [4, 4, 2]}, "drop_weight": {"easy": 8, "medium": 6, "hard": 4}, "good": true, "counterplay_or_cost": "saves are counted, bar cracks", "feel": "deep ceramic thunk", "change": "keep"},
    {"id": "slow", "new": false, "label": "BUBBLE", "color": "#7FD6FF", "effect": "glass bubble over paddle slows balls inside", "numbers": {"duration_s": [9, 8, 7], "per_level_s": 3, "width": [90, 110, 130], "speed_scale": [0.55, 0.6, 0.65], "stack": "refreshes", "cap": [3, 3, 2]}, "drop_weight": {"easy": 8, "medium": 7, "hard": 6}, "good": true, "counterplay_or_cost": "balls leaving the bubble return to full speed", "feel": "soft glass chime; glass thins at end", "change": "rework"},
    {"id": "tiny", "new": false, "label": "TINY", "color": "#5A5F78", "effect": "paddle shrinks, Ram arms in 2 centre hits", "numbers": {"duration_s": [8, 9, 10], "width": [72, 68, 64], "stack": "refreshes", "cap": 1}, "drop_weight": {"easy": 3, "medium": 4, "hard": 6}, "good": false, "counterplay_or_cost": "dodge it, or use it to arm the Ram faster", "feel": "kazoo bwomp, frown decal", "change": "rework"}
  ],
  "hero_powers": [
    {"hero": "kit", "id": "ward", "new": false, "label": "WARD", "effect": "full-width ceramic wall that also reflects villain shots", "numbers": {"duration_s": 8}, "change": "rework"},
    {"hero": "kit", "id": "arrows", "new": false, "label": "ARROWS", "effect": "6 arrows at the 6 lowest bricks", "numbers": {"count": 6, "damage": 1}, "change": "keep"},
    {"hero": "kit", "id": "cosmic", "new": false, "label": "COSMIC", "effect": "arms the Ram instantly at Lv2 size", "numbers": {"radius": 24, "duration_s": 4, "bricks": 28, "damage": 5}, "change": "rework"},
    {"hero": "kit", "id": "fan", "new": false, "label": "FAN", "effect": "5 balls in a 70 degree fan aimed with Focus", "numbers": {"count": 5, "spread_deg": 70}, "change": "tune"},
    {"hero": "space", "id": "laser", "new": false, "label": "LASER", "effect": "grants LASER Lv3 instantly", "numbers": {"duration_s": 12}, "change": "tune"},
    {"hero": "space", "id": "titan", "new": false, "label": "TITAN", "effect": "unstoppable ball with pierce limit", "numbers": {"duration_s": 6, "pierce_limit": 8, "damage": 2}, "change": "tune"},
    {"hero": "space", "id": "five-balls", "new": false, "label": "SWARM", "effect": "grants BURST and SPLIT together", "numbers": {"count": 5}, "change": "tune"},
    {"hero": "lumi", "id": "lullaby", "new": false, "label": "LULLABY", "effect": "calms a serpent", "numbers": {"duration_s": [5, 4.5, 4]}, "change": "keep"},
    {"hero": "lumi", "id": "starlight", "new": false, "label": "NOTES", "effect": "next 6 bricks drop capsules, queued, never TINY", "numbers": {"count": 6}, "change": "tune"},
    {"hero": "lumi", "id": "song-shield", "new": false, "label": "SONG", "effect": "song shield", "numbers": {}, "change": "keep"}
  ],
  "charge": {"hits_to_fill": {"easy": 24, "medium": 30, "hard": 36}, "what_counts": "brick break 1, villain hit 2, Ram or FIRE pierce break 0.5"},
  "ram": {"streak_to_arm": 3, "radius": 20, "time_s": 3.0, "bricks": 20, "damage": 5, "speed": 400, "breaks_hp_up_to": 3, "per_mode": {"radius": [22, 20, 18], "time_s": [3.2, 3.0, 2.6], "bricks": [24, 20, 16], "damage": [5, 5, 4]}, "change": "rework"},
  "drop_rules": {"base_chance": {"easy": 0.16, "medium": 0.12, "hard": 0.09}, "pity_after_breaks": {"easy": 8, "medium": 10, "hard": 12}, "max_falling": {"easy": 2, "medium": 2, "hard": 1}, "min_gap_s": 1.2, "fall_speed": 110, "villain_hit_chance": {"easy": 0.25, "medium": 0.2, "hard": 0.15}, "strong_build_scale": 0.6, "empty_tray_scale": 1.25, "slots": {"easy": 3, "medium": 3, "hard": 2}, "max_level": {"easy": 3, "medium": 3, "hard": 2}, "villain_damage_per_capsule_hit": 1, "all_chapters": true},
  "synergies": [
    {"a": "fire", "b": "split", "result": "FIRESTORM: split balls burn, shared pierce limit x1.5"},
    {"a": "fire", "b": "laser", "result": "FLARE BOLTS: bolts splash 1 damage to an adjacent brick"},
    {"a": "laser", "b": "wide", "result": "QUAD GUNS: 4 cannons"},
    {"a": "wide", "b": "shield", "result": "RAMPART: full-width shield bar, +1 save"},
    {"a": "slow", "b": "aim", "result": "DEAD EYE: Focus held without limit inside the bubble, max 4 s"},
    {"a": "burst", "b": "split", "result": "SWARM: burst balls auto-split once, under the ball cap"},
    {"a": "tiny", "b": "ram", "result": "GLASS CANNON: Ram arms in 2, radius +2"},
    {"a": "fire", "b": "ram", "result": "METEOR: Ram breaks 4-HP bricks, 1-dmg embers on neighbours"},
    {"a": "shield", "b": "slow", "result": "SAFE HARBOUR: saved ball relaunches at 0.6x"}
  ]
}
```

## Art requests
1. **Capsule sheet.** HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles; glazed ceramic capsules with a thick clear coat, crisp highlight band and rounded bevels; warm key light top-left #FFDBB8, cool fill right #8CA6FF, faint pink bounce below #FF80A6. BACKGROUND: fully transparent, or flat pure magenta #FF00FF with no shadow on the ground; 10% margin per cell, nothing touching a cell edge. Asset type: 3x3 sheet of pill-shaped power capsules, each with a short embossed label in Lilita One style: "x3" #5CCF6A, "+3" #F7C948, "FIRE" #FF8A3D, "WIDE" #3FA8F5, "SIGHT" #C46BF0, "LASER" #FF4D6D, "SHIELD" #2EC4B6, "BUBBLE" #7FD6FF, "TINY" #5A5F78 (dull, with a small frown decal). Orthographic camera. NOT: pixel art, flat vector, neon glow, rings, other text.
2. **Ram sheet.** Same house style and background rules. 4x1 sheet: the chrome Ram ball at arming (paddle with 3 lit pips #FFD36B), launch squash, full size with chunky ceramic debris at its leading edge, and dulled at the end. NOT: light trails, rings, beams, glow halos.

## Rules check
- Telegraphed hazards: OK, no new hazard. TINY is visible as it falls and can be dodged.
- Ordinary play always makes progress: OK. Drops are a bonus; bot test with zero catches.
- Enemy attacks never destroy the player's bricks for rewards: OK, not affected.
- Difficulty changes numbers only: OK, every mode difference is a number.
- Pause / Continue / Retry keep progress: OK. The tray is kept on Continue and cleared on Retry.
- No power required to win: OK. Villain damage from capsule hits is limited to 1 per hit.
- Effects are rendered things, never plain circles or rings: OK. Chips, embers, glass and pips are used; Lv shows as pips, not rings.
- Mobile: OK. The tray is outside the drag lane and every slot is at least 44 pt.

## Open questions for Claude
1. Does the Ram count toward the cosmic-ball cap 2 / 2 / 1? Recommended: yes, and COSMIC uses that same slot.
2. FIRE pierce limit resets on a paddle hit or a Focus shot? Recommended: on any paddle hit.
3. Does Starlight Notes ignore the strong-build ×0.6 scale? Recommended: yes, it is a hero choice.
4. Out of scope for P1 (from the APK notes, route these on): the theme-split menu with difficulty picked after the level (ui-screen), Hard too easy and Frost Warden too easy (P2), new brick and level layouts (level / P9), Lumi looking scared as death nears (character), Frost Warden art rebuild (asset-sheet). Recommended: run P2 next with this drop in depends_on.



In the same chat - gpt 6.1 sol response : 


This revised P1 drop turns your APK feedback into a buildable power-up specification, with bounded combos so one pickup cannot trivialise a level. It is a design audit against the supplied brief and your testing notes, not a verified code audit.

Direction A: Bounded Builds [RECOMMENDED]. Keep several powers active together, show their levels clearly, and make repeat catches strengthen the build. FIRE + SPLIT creates burning multiball; WIDE + LASER creates a broader firing platform. Short timers, shared damage budgets and ball caps preserve paddle skill. This delivers the stacking and visible combos you want without turning every pickup into a screen clear.

Direction B: Power Windows. Allow one offensive power and one defensive power at a time, each lasting 6–10 seconds. Catching another replaces the matching category. Bigger audiovisual moments make every pickup obvious, and balancing is simpler, but there is less build variety and fewer reasons to chase a particular combination.

Copilot drop: powerups-round2

breach_drop: 1
 kind: powerups
 slug: powerups-round2
 version: 2
 date: 2026-10-23
 status: proposal
 tool: Copilot
 depends_on: []
Power-up rework: Bounded Builds
Summary
Restore a shared drop system across every chapter, with guaranteed good drops after a dry streak.
Stack powers to two levels; show the build without adding another crowded menu.
Separate SPLIT’s multiplication from BURST’s controlled reinforcements.
Make the Ram visibly giant and genuinely piercing, with strict damage and duration limits.
Teach baseline Focus independently of AIM; retain the remaining APK feedback as follow-up requirements.
Decisions for the owner
Overall direction: A. Bounded Builds[RECOMMENDED]. B. Power Windows.
Repeat pickups: A. Two levels, then timer refresh[RECOMMENDED]. B. Three levels with additional art and balance work.
Full build: A. Replace the shortest-remaining timed power[RECOMMENDED]. B. Convert the incoming pickup into 2 seconds of refresh.
Ram size: A. Radius 20 in every mode[RECOMMENDED]. B. Keep radius 13.2 and improve impact feedback only.
Spec
Audit

“Feel” below is inferred from the documented mechanics unless explicitly reported in your APK feedback. Existing hero IDs must be mapped to code before implementation; the JSON uses proposed integration keys where the brief supplies no ID. The brief identifies Tick’s rescue clamp but does not specify its current numbers.

Existing power	Player feel / issue	Decision or skill moment after change	VerdictSPLIT	Immediate chaos; repeated multiplication can dominate	Preserve several trajectories rather than chase every capsule	Tune
BURST	Too close to SPLIT	Catch to launch three controlled reinforcements	Rework
FIRE	Strong impact, but oversized balls reportedly fail to deliver expected destruction	Route a limited piercing volley through dense bricks	Tune
WIDE	Safety can feel passive	Trade easier catches against unchanged Ram sweet spot	Tune
AIM	Purpose unclear; baseline aiming is not taught	Hold, slide and release with a clearer prediction	Rework
LASER	Clear offensive fantasy	Position under targets while returning balls	Tune
SHIELD	Useful insurance	Spend finite saves, not unlimited protection	Tune
SLOW	Hard to notice	Use a visible lower-lane slowdown to recover control	Rework
TINY	Punishment without an attractive reason to catch	Dodge, or accept a smaller paddle for faster Ram arming	Rework
Kit: BRICK WARD	Overlaps SHIELD	Activate a short, limited interception window	Rework
Kit: ARROWS	Immediate attack	Choose when a targeted volley is worth the charge	Tune
Kit: COSMIC	Overlaps Ram	Empower one existing ball without satisfying the sweet-spot sequence	Tune
Kit: BALL FAN	Overlaps BURST	Choose a wider five-ball spread instead of another hero effect	Tune
Space: LASER	Same weapon family as capsule	Choose immediate level-two weaponry	Tune
Space: UNSTOPPABLE / Nix TITAN	Giant-ball fantasy needs stronger contact feedback	Choose one bounded piercing ball	Tune
Space: 5 BALLS	Potential ball-count explosion	Replenish to five, rather than add five repeatedly	Tune
Tick: rescue clamp	Rescue utility; exact behaviour unspecified	Time one missed-ball recovery	Tune, provisional
Lumi: Lullaby	Characterful control	Delay an imminent serpent attack without stopping ordinary damage	Keep
Lumi: Starlight Notes	Six guaranteed drops can flood the board	Choose a short supply window and catch what matters	Tune
Lumi: Song Shield	Protective identity overlaps generic shield	Time a brief interception window	Tune
Sweet-Spot Ram	Skill reward, but reported size and destruction disagree	Three centre returns, then deliberately launch through a brick lane	Rework

Vesper and Latch have no individual powers specified in the brief. Do not invent or silently remove abilities: inventory their actual code before sign-off.

Stacking and limits

All triples below mean Easy / Medium / Hard. Values are proposals.

Three timed build slots in every mode; maximum level two. Instant powers and SHIELD charges do not occupy timed slots.
Repeat catch: increase to level two and add half the base duration, capped at 20 / 18 / 14 seconds. At level two, add time only.
A different timed pickup replaces the shortest-remaining timed power when full. Preview that replacement by highlighting its icon while the capsule approaches.
Powers apply to existing and subsequently spawned ordinary balls. They never multiply Ram or COSMIC state.
Live-ball caps: 12 / 9 / 5. Empowered-ball caps: 2 / 2 / 1.
All ball-power timers use simulation time. Pause, Focus slowdown and floor transitions cannot silently consume them.
No automatic damage immunity, boss phase skipping or free objective completion.
Capsule	Level one	Level two / repeat	Duration E/M/HSPLIT	Split the lowest descending ordinary ball into three; net +2	Further catches repeat, respecting ball cap	Instant; balls persist until lost
BURST	Launch +3 ordinary balls from paddle at −18°, 0°, +18° from upward vertical	Repeat adds three within cap	Instant
FIRE	All ordinary balls deal 2 brick damage; shared 4 piercing contacts per paddle-return cycle	Shared budget 6; damage remains 2	8 / 7 / 6 s
WIDE	Paddle width 128	Width 148; baseline 100	12 / 10 / 8 s
AIM	Baseline three dots become eight; show first wall reflection	Twelve dots; show two wall reflections	12 / 10 / 8 s
LASER	Two bolts per volley, every 0.65 s; 1 damage each	Interval 0.50 s	7 / 6 / 5 s
SHIELD	Add 2 / 2 / 1 missed-ball saves	Add same amount; total cap 3 / 3 / 2	Charge-based
SLOW	Lower 120-unit return lane slows ordinary balls to 0.75×	0.65×; do not multiply with Focus	9 / 8 / 7 s
TINY	Paddle width 72; Ram arming requires two centre returns	Refresh only; overrides WIDE while active	6 / 7 / 8 s

FIRE rules: one shared budget across all balls, replenished at most once per 0.5 seconds by an ordinary paddle return. A piercing contact spends one budget unit whether or not the brick breaks. After exhaustion, FIRE still deals 2 brick damage but bounces. Boss damage remains 1 per ball contact.

LASER rules: bolt speed 520 units/s, maximum eight live bolts, no homing. All laser-derived boss damage shares a cap of 2 HP per second, including companion LASER and synergies.

Synergies

No additional slot or activation button. Each pair activates automatically; no recursive splash, split or charge generation.

Pair	Visible build	Exact interactionFIRE + SPLIT	FIRESTORM	Newly split balls inherit FIRE; share the existing 4/6 pierce budget, never receive individual budgets
FIRE + LASER	HOT SHOT	First bolt hit per volley deals 1 damage to one adjacent breakable brick within 36 units; no boss splash
WIDE + LASER	BROADSIDE	Four emitters fire alternately in pairs; total bolts per second unchanged, coverage increases
AIM + LASER	SIGHTLINE	During Focus, show two dashed bolt lanes; firing pauses while aiming and resumes on release
SLOW + SHIELD	SOFT LANDING	Saved ball relaunches upward at 0.75× speed for 0.6 s, then returns to its stored speed
WIDE + AIM	STEADY HAND	Focus capture tolerance expands from centre ±12 to ±18 units; Ram zone stays ±16.5
TINY + Ram	DAREDEVIL	Two centre returns arm Ram; size, damage and piercing budget do not increase
FIRE + Ram	METEOR	Ram gains +1 brick damage, maximum 4; no extra boss damage or splash
BURST + SLOW	CONTROLLED SWARM	New balls use the lane’s speed modifier until leaving it; no extra balls
Drop economy
Rule	Easy	Medium	HardChance per eligible brick destroyed	16%	12%	9%
Guaranteed good drop on consecutive dry break	8th	10th	12th
Maximum falling capsules	2	2	1
Minimum spawn interval	1.2 s	1.2 s	1.2 s
Maximum timer per timed power	20 s	18 s	14 s
Hero charge threshold	24	30	36
One shared drop manager serves all chapters, including Frost Warden, Serpent Rivals, Lumi Breaks Out, Gatehouse Siege, Tidewheel Citadel and Bellforge Run.
Only player-caused brick destruction qualifies. Enemy damage, scenery and repeated contact with the same brick do not.
At falling capacity, retain one pending good drop; spawn at the next legal opening. Never build an unbounded queue. Dry streak resets on actual good-drop spawn, not on a failed roll.
Pity selects a good capsule only. TINY neither resets nor satisfies pity.
Capsules fall at 110 units/s, spawn at least 180 units above the paddle, and remain inside reachable horizontal bounds.
Brickless duels: every 6 / 8 / 10 ordinary ball boss contacts schedules one good drop; minimum interval 4 seconds. This replaces brick rolls, not supplements them.
Starlight schedules three good drops, 1.2 seconds apart, respecting capacity. Its queue replaces ordinary pending drops and expires after 12 seconds.
No build-dependent hidden drop penalties. Strong builds are bounded by damage budgets instead.
Hero powers and charge

One activation spends one full charge. No stored second charge. Only ordinary ball damage grants charge: one point per brick damaged, maximum once per brick per paddle-return cycle; boss contacts grant one point, maximum once per second. Lasers, arrows, Ram, COSMIC and secondary effects grant zero.

Hero power	Proposed exact effect	Catch/activation and endingBRICK WARD	4 / 3.5 / 3 s; intercept two hostile projectiles or one missed ball, then end	Ceramic lock; two physical shield plates; final 1.5 s plates lose glaze
ARROWS	Six arrows, 1 damage each, 0.08 s apart; nearest six reachable breakables; maximum 2 total boss damage	Bow twang and six short metal darts; instant volley, no expiry
COSMIC	One ball: radius 16, 3 brick damage, 8 piercing contacts, 4 / 3.5 / 3 s; boss damage 3 once per activation	Heavy chrome chord; final 1.5 s metal facets dim
BALL FAN	Add up to five balls at −32°, −16°, 0°, +16°, +32°; respect live-ball cap	Five rising pops; instant
Space LASER	LASER level two for 7 / 6 / 5 s; shares capsule timer and damage cap	Mechanical latch; cannon vents dim in final 1.5 s
Nix TITAN	Same bounded effect as COSMIC, retaining Nix’s identity	Low engine thump; same expiry tell
Space 5 BALLS	Raise live count to five, never add five beyond that	Five ceramic clicks; instant
Tick clamp	Provisional: one missed-ball rescue during 6 / 5 / 4 s; no extra SHIELD charge	Clamp snaps open; jaws retract in final 1.5 s
Lullaby	Calm serpent attacks for 4 s; ordinary ball damage remains valid	Four-note phrase; eyelids lift during final 1.5 s
Starlight Notes	Three queued good capsules; 12 s scheduling window	Three physical note tokens; remaining tokens dim in final 1.5 s
Song Shield	4 / 3.5 / 3 s; intercept two projectiles or one missed ball	Glass-and-voice chord; two note-shaped plates lose glaze
Readability and aim teaching

Build indicators are noninteractive 22-unit icons above the control deck, not extra buttons. Show two physical level pips and a shrinking rectangular timer strip. Face-orb touch target remains at least 44 pt.

Capsule	Catch sound	Physical feedback	Final 1.5 secondsSPLIT	Three glass plinks	Two chrome chips at separation	Instant; no artificial expiry
BURST	Three tight pops	Paddle recoil 0 → 2 → 0 units, 0.12 s, easeOutQuad	Instant
FIRE	Short furnace puff	Orange ceramic facets on ball, #FF8A3D	Facets dim; three dry crackles
WIDE	Sliding metal click	Width animates over 0.18 s, easeOutCubic	Endcaps flash three times; collision width unchanged until expiry
AIM	Lilac chime	Faceted prediction dots, #E3B6FF	Extra dots fade; baseline three remain
LASER	Servo latch	Small physical cannons unfold	Vent lights dim; cannons retract only at expiry
SHIELD	Low ceramic knock	Teal segmented rescue rail	No timer; last charge visibly cracked
SLOW	Glass chime	Frosted rectangular side panels mark lower lane	Frost clears in three steps
TINY	Compressed wooden clack	Paddle compresses over 0.18 s	Endcaps brighten; width restores at expiry

Timed powers tick at 1.5, 1.0 and 0.5 seconds remaining. No global flashes, catch hitstop or ordinary-brick debris.

Baseline tutorial: first serve is safely paused. Show “HOLD AS THE BALL LANDS • SLIDE • RELEASE” with three faceted dots and an animated thumb. Complete one guided return at 0.25× simulation speed. Replay from pause Help; dismiss permanently after three successful Focus shots. AIM is never required to access Focus.

Sweet-Spot Ram

Yes, make it bigger, but not faster. The documented Ram uses radius 13.2, three centre returns to arm, then another centre hit to launch. Preserve that skill sequence.

Parameter	Easy	Medium	HardRadius, previously 13.2	20	20	20
Centre zone on baseline 100-wide paddle	33	33	33
Returns to arm; next centre return launches	3	3	3
Maximum duration	3.0 s	2.7 s	2.4 s
Maximum piercing brick contacts	12	10	8
Brick damage per contact	3	3	3
Boss damage, once per activation	4	4	4
Preserve current speed, including rally multiplier; do not add acceleration.
Pierce destructible bricks, including surviving armoured bricks. Bounce from indestructible granite and bosses; never ignore their collision.
Apply damage once per target per continuous overlap. No damage every physics step.
Missed centre return resets an unarmed streak; once armed, an off-centre return disarms it.
One Ram at a time; consumes an empowered-ball slot. If full, retain armed state until a slot opens.
Launch: radius 6 → 20 over 0.12 s, easeOutCubic; collision follows visible radius. Camera offset 0 → 2 → 0 units over 0.12 s; disable in reduced-motion mode.
Final 1.5 s: three chrome facets dim. At expiry, radius 20 → 6 over 0.15 s, easeInCubic; never shift ball centre or trajectory.
Each brick still cracks and fades over 0.4 s. Reserve debris for structural crashes.
Acceptance and retained APK requirements
Test / follow-up	Required resultEvery chapter and mode	First good drop by pity threshold, unless capacity-blocked; then next legal opening
Combo stress	Ball, bolt, timer and boss-damage caps never exceeded
No-power run	Every objective remains damageable and completable
Ram contact	1–3 HP bricks break on first contact; surviving bricks take exactly 3 damage
Aim onboarding	New player completes hold, slide, release without owning AIM
Menu follow-up	Theme choice first: Starfighter / Princess, dark lightning-shaped divider; level selection next; difficulty last and editable from pause/settings
Difficulty follow-up	Rebalance Hard and rebuild Frost Warden’s challenge; do not compensate by removing drops
Art/character follow-up	Frost Warden visual rebuild, more readable brick layouts, Lumi’s escalating fear expressions
Naming check	Confirm “waterfront” and other dictated names against actual chapter IDs; do not invent mappings
Data
JSON
{
"kind": "powerups",
"capsules": [
{"id":"split","new":false,"label":"x3","color":"#5CCF6A","effect":"Split one descending ordinary ball into three.","numbers":{"duration_s":0,"count":3,"stack":"adds","cap":[12,9,5]},"drop_weight":{"easy":12,"medium":12,"hard":12},"good":true,"counterplay_or_cost":"Net two balls; no empowered-state cloning.","feel":"Three glass plinks and chrome chips.","change":"tune"},
{"id":"burst","new":false,"label":"+3","color":"#F7C948","effect":"Launch three balls from paddle at fixed upward angles.","numbers":{"duration_s":0,"count":3,"stack":"adds","cap":[12,9,5],"angles_deg":[-18,0,18]},"drop_weight":{"easy":10,"medium":10,"hard":10},"good":true,"counterplay_or_cost":"Respect live-ball cap.","feel":"Three pops and two-unit recoil.","change":"rework"},
{"id":"fire","new":false,"label":"FIRE","color":"#FF8A3D","effect":"Two brick damage with a shared piercing budget.","numbers":{"duration_s":[8,7,6],"count":1,"stack":"refreshes","cap":2,"brick_damage":2,"pierce_budget_by_level":[4,6],"boss_damage":1,"budget_reset_min_s":0.5},"drop_weight":{"easy":10,"medium":10,"hard":10},"good":true,"counterplay_or_cost":"Budget shared across all balls; no boss piercing.","feel":"Furnace puff; orange facets dim during final 1.5 seconds.","change":"tune"},
{"id":"wide","new":false,"label":"WIDE","color":"#3FA8F5","effect":"Expand paddle without expanding Ram sweet spot.","numbers":{"duration_s":[12,10,8],"count":1,"stack":"refreshes","cap":2,"width_by_level":[128,148],"ram_zone_width":33},"drop_weight":{"easy":14,"medium":12,"hard":10},"good":true,"counterplay_or_cost":"TINY temporarily overrides width.","feel":"Metal slide; endcaps flash before expiry.","change":"tune"},
{"id":"aim","new":false,"label":"AIM","color":"#C46BF0","effect":"Extend baseline Focus prediction.","numbers":{"duration_s":[12,10,8],"count":1,"stack":"refreshes","cap":2,"dots_by_level":[8,12],"wall_reflections_by_level":[1,2]},"drop_weight":{"easy":12,"medium":12,"hard":12},"good":true,"counterplay_or_cost":"Prediction aid, not automatic steering.","feel":"Lilac chime; extra dots fade before expiry.","change":"rework"},
{"id":"laser","new":false,"label":"LASER","color":"#FF4D6D","effect":"Two-bolt paddle volleys.","numbers":{"duration_s":[7,6,5],"count":2,"stack":"refreshes","cap":2,"interval_s_by_level":[0.65,0.5],"bolt_speed":520,"max_live_bolts":8,"damage":1,"boss_damage_cap_per_s":2},"drop_weight":{"easy":10,"medium":10,"hard":10},"good":true,"counterplay_or_cost":"Position under targets; all laser sources share boss cap.","feel":"Servo latch; vents dim before expiry.","change":"tune"},
{"id":"shield","new":false,"label":"SHIELD","color":"#2EC4B6","effect":"Add finite missed-ball saves.","numbers":{"duration_s":0,"count":[2,2,1],"stack":"adds","cap":[3,3,2]},"drop_weight":{"easy":14,"medium":12,"hard":10},"good":true,"counterplay_or_cost":"One charge per saved ball; no timer.","feel":"Ceramic knock; final segment visibly cracked.","change":"tune"},
{"id":"slow","new":false,"label":"SLOW","color":"#7FD6FF","effect":"Slow ordinary balls inside lower return lane.","numbers":{"duration_s":[9,8,7],"count":1,"stack":"refreshes","cap":2,"lane_height":120,"speed_scale_by_level":[0.75,0.65]},"drop_weight":{"easy":14,"medium":12,"hard":10},"good":true,"counterplay_or_cost":"Restore stored speed outside lane; Focus takes precedence.","feel":"Glass chime; frosted side panels clear before expiry.","change":"rework"},
{"id":"tiny","new":false,"label":"TINY","color":"#5A5F78","effect":"Shrink paddle but reduce Ram arming requirement.","numbers":{"duration_s":[6,7,8],"count":1,"stack":"refreshes","cap":1,"width":72,"ram_streak_to_arm":2},"drop_weight":{"easy":4,"medium":6,"hard":8},"good":false,"counterplay_or_cost":"Dodge or accept risk; never satisfies pity.","feel":"Wooden clack; endcaps brighten before restoration.","change":"rework"}
],
"hero_powers": [
{"hero":"kit","id":"ward","new":false,"label":"WARD","effect":"Intercept two projectiles or one missed ball.","numbers":{"duration_s":[4,3.5,3],"projectiles":2,"ball_saves":1},"change":"rework"},
{"hero":"kit","id":"arrows","new":false,"label":"ARROWS","effect":"Six targeted arrows.","numbers":{"duration_s":0.4,"count":6,"damage":1,"interval_s":0.08,"boss_damage_cap":2},"change":"tune"},
{"hero":"kit","id":"cosmic","new":false,"label":"COSMIC","effect":"Empower one existing ball.","numbers":{"duration_s":[4,3.5,3],"radius":16,"brick_damage":3,"pierce_contacts":8,"boss_damage_once":3},"change":"tune"},
{"hero":"kit","id":"fan","new":false,"label":"FAN","effect":"Add up to five balls in a fan.","numbers":{"duration_s":0,"count":5,"angles_deg":[-32,-16,0,16,32]},"change":"tune"},
{"hero":"space","id":"laser","new":false,"label":"LASER","effect":"Grant capsule LASER level two.","numbers":{"duration_s":[7,6,5],"level":2,"boss_damage_cap_per_s":2},"change":"tune"},
{"hero":"space","id":"titan","new":false,"label":"TITAN","effect":"Nix empowers one existing ball using COSMIC limits.","numbers":{"duration_s":[4,3.5,3],"radius":16,"brick_damage":3,"pierce_contacts":8,"boss_damage_once":3},"change":"tune"},
{"hero":"space","id":"five-balls","new":false,"label":"5 BALLS","effect":"Raise live ball count to five.","numbers":{"duration_s":0,"target_count":5},"change":"tune"},
{"hero":"space","id":"rescue-clamp","new":false,"label":"CLAMP","effect":"Provisional Tick missed-ball recovery; verify code mapping.","numbers":{"duration_s":[6,5,4],"ball_saves":1},"change":"tune"},
{"hero":"lumi","id":"lullaby","new":false,"label":"LULLABY","effect":"Calm serpent attacks without blocking ordinary damage.","numbers":{"duration_s":4},"change":"keep"},
{"hero":"lumi","id":"starlight","new":false,"label":"NOTES","effect":"Schedule three good capsules within a bounded window.","numbers":{"duration_s":12,"count":3,"spawn_interval_s":1.2},"change":"tune"},
{"hero":"lumi","id":"song-shield","new":false,"label":"SONG","effect":"Intercept two projectiles or one missed ball.","numbers":{"duration_s":[4,3.5,3],"projectiles":2,"ball_saves":1},"change":"tune"}
],
"charge": {
"hits_to_fill":{"easy":24,"medium":30,"hard":36},
"what_counts":"Ordinary ball brick damage: one point per brick per paddle-return cycle. Ordinary boss contact: one point, at most once per second. Powered and secondary damage grant zero."
},
"ram": {
"streak_to_arm":3,
"radius":20,
"time_s":2.7,
"bricks":10,
"damage":4,
"change":"rework",
"launch_on_next_centre_return":true,
"centre_zone_width":33,
"brick_damage":3,
"time_s_per_mode":[3,2.7,2.4],
"pierce_contacts_per_mode":[12,10,8],
"boss_damage_once":4,
"preserve_current_speed":true,
"max_simultaneous_ram":1
},
"drop_rules": {
"base_chance":{"easy":0.16,"medium":0.12,"hard":0.09},
"pity_after_breaks":10,
"max_falling":2,
"pity_after_breaks_per_mode":[8,10,12],
"max_falling_per_mode":[2,2,1],
"mode_override_fields_take_precedence":true,
"minimum_spawn_interval_s":1.2,
"fall_speed":110,
"minimum_spawn_height_above_paddle":180,
"pending_good_drop_cap":1,
"timed_slots":3,
"max_level":2,
"timer_cap_s_per_mode":[20,18,14],
"live_ball_cap_per_mode":[12,9,5],
"empowered_ball_cap_per_mode":[2,2,1],
"duplicate_duration_add_base_fraction":0.5,
"brickless_duel_contacts_per_drop":[6,8,10],
"brickless_duel_min_interval_s":4,
"all_chapters":true,
"hero_id_mapping_requires_code_check":true
},
"synergies": [
{"a":"fire","b":"split","result":"FIRESTORM: split balls inherit FIRE but share its existing piercing budget."},
{"a":"fire","b":"laser","result":"HOT SHOT: first bolt hit per volley splashes one adjacent brick within 36 units for one damage; no recursion or boss splash."},
{"a":"wide","b":"laser","result":"BROADSIDE: four emitters alternate in pairs; total firing rate unchanged."},
{"a":"aim","b":"laser","result":"SIGHTLINE: preview two bolt lanes during Focus; firing pauses until release."},
{"a":"slow","b":"shield","result":"SOFT LANDING: saved ball uses 0.75 speed for 0.6 seconds before restoring stored speed."},
{"a":"wide","b":"aim","result":"STEADY HAND: Focus capture tolerance becomes plus or minus 18 units; Ram zone unchanged."},
{"a":"tiny","b":"ram","result":"DAREDEVIL: two centre returns arm Ram; no damage or size increase."},
{"a":"fire","b":"ram","result":"METEOR: Ram brick damage becomes four; boss damage unchanged."},
{"a":"burst","b":"slow","result":"CONTROLLED SWARM: new balls obey lower-lane slowdown without generating extra balls."}
]
}
Art requests

None for this drop. Reuse existing capsule and character designs; Claude should produce the specified physical facets, panels, pips and cannon states within the established rendering pipeline.

Rules check
Rule	CheckPremium, inventive, urgent, fair	OK: visible builds with bounded output; balance remains a playtest requirement
Hazards telegraphed 1.2–1.8 s; safe first demonstration	OK: no new attack; TINY is visibly falling for at least 1.64 s from minimum spawn height and its first demonstration is non-harmful
Ordinary ball always progresses; broad targets	OK: no new locks, precision-only objectives or invulnerability
Enemy attacks do not generate brick rewards	OK: only player-caused destruction qualifies
Difficulty changes numbers only	OK: identical powers and slots across modes
Pause, Continue, Retry preserve earned progress	OK: banked unlocks and earned progress persist; pause/Continue preserve attempt state; Retry’s fresh-attempt behaviour needs the conflict below resolved
No power, companion or purchase required	OK: zero-catch completion is an acceptance test
Rendered effects, no plain circles/rings	OK: facets, chips, panels and physical plates
Glossy toy, ceramic and chrome materials	OK: existing designs retained
Warm key, cool fill, pink bounce	OK: unchanged
Chibi proportions and distinct expressive faces	OK: no character redesign
Dark, calm backgrounds	OK: no full-screen power flashes
Yellow/gold accents only	OK: existing BURST colour remains a small capsule accent
Lilita One / Rubik	OK: labels / numbers respectively
Rejected visual styles excluded	OK: no pixel art, blobs, rings or repeated creature templates
Safe areas, 44 pt targets, paddle above thumb	OK: indicators are noninteractive; face orb and Help retain compliant targets
Open questions for Claude
Existing IDs and omitted crew abilities? Recommended: map the proposed hero keys to actual code and inventory Tick, Vesper and Latch before implementation; do not create duplicate abilities.
Retry conflict in the brief? Recommended: preserve banked progression, but reset the current attempt on explicit Retry; pause and Continue retain current-attempt progress. The brief states both “Retry starts fresh” and “Retry keep earned progress.”
Drop failures in newer chapters? Recommended: trace each brick-destruction event into one shared manager; do not assume probability tuning fixes missing event wiring.
Balance acceptance? Recommended: test zero-catch runs, individual powers and maximum builds separately; reject any power that bypasses objectives or exceeds its stated caps.
Next task? Recommended: P2 difficulty and Frost Warden challenge next, while retaining the theme-first menu, art rebuild and Lumi fear-expression requirements.

Revision rationale: this version removes hidden drop penalties, resolves instant-power stacking, bounds combo damage, and distinguishes reported APK problems from unverified implementation assumptions.