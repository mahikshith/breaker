---
breach_drop: 1
kind: level
slug: dragons-hoard
version: 1
date: 2026-10-23
status: proposal
tool: Copilot Studio, Gemini 4 Argon
depends_on: ["powerups-round2", "difficulty-round2"]
---
# BREACH P7: Chapter 12 Level Design — Dragon's Hoard

## Summary
- Status: design proposal, 2026-10-23. Not built.
- Pitch: Kit sneaks into Ember the dragon's dark treasure cave across 3 heist floors (`25–40 s` each) to dig out the Sunstone and defeat the awakened dragon.
- Twist: **The Greed Meter (Wake Eye)** — gold coin bricks grant `3x` score (`300 pts`) and `+2` Hero Orb charge hits, but every gold brick broken opens Ember's Wake Eye by `[2.5%, 3.3%, 4.2%]`; hitting a cool teal **Hush Chime** brick (`64x16` units) sings a lullaby tone that drops the meter by `25%`.
- Three distinct heist bites: Floor 1 (*The Coin Mound*, dig a shaft to the `64x32` Sunstone), Floor 2 (*Molten Veins*, crack 2 brass Vault Locks while dodging tail sweeps), and Floor 3 (*Awakened Hoard Duel*, defeat Ember `[28, 38, 48] HP` using her own molten gold breath against her).
- Includes complete 11x9 row-string brick grids for all 3 floors with broad `>=2` cell side lanes and a K08 level concept board prompt (`P07_dragons-hoard_level-board_1.png`).

## Decisions for the owner
1. What happens when the Greed/Wake Eye meter hits `100%` on Floors 1–2: A Ember snorts a telegraphed (`1.6 s` tell) `fire-puff` that glazes 1 row of gold bricks into 2-HP Hardened Gold and resets the meter to `40%`, never an instant loss [RECOMMENDED] [AUTO-PICKED] | B Immediately skips to Floor 3 with extra boss HP | C Drains a player life ball.
2. How the player cools down the Greed Meter: A Striking broad `64x16` teal **Hush Chime** tiles (`h` in grid) drops Greed by `25%` and calms Ember for `3.0 s` [RECOMMENDED] [AUTO-PICKED] | B Waiting 5 seconds without hitting bricks | C Spending Hero Orb charge.
3. Grid resolution for the 3 playable heist floors: A Standard `11x9` cells (`28x18` units at origin `[26, 96]`, matching `32x16` min target rule) with visual background coin piles [RECOMMENDED] [AUTO-PICKED] | B 20x20 micro-tiles of `16x16` units.

## Spec

### 1. Pitch
- **Stealth-or-Greed Heist:** Kit infiltrates Ember's dark plum-and-charcoal cavern where rich honey-gold coin bricks (`#F4C542`) supercharge his Hero Orb (`+2` hits each) and score (`300 pts`), tempting the player to smash everything before clearing the floor goal.
- **Readable Dragon Wake Clock:** An amber **Wake Eye** meter in the top-centre HUD opens wider with every gold brick broken; push too hard and Ember stirs (`1.8 / 1.6 / 1.4 s` tell) to puff molten glaze across a brick row or sweep her tail.
- **Three-Floor Heist Escalation:** Floor 1 digs to the buried **Sunstone** (`64x32` units), Floor 2 cracks two **Brass Vault Locks** (`56x24` units each), and Floor 3 wakes Ember (`[28, 38, 48] HP`) for a full duel where shattering her freshly breathed **Molten Gold** tiles splashes `3` HP back onto her chin.

### 2. The Twist & Counterplay: The Greed Meter
Breaking a Gold Coin brick (`g`) adds `+2` Hero Orb charge pips (instead of `+1`) and `+300` score, but raises the **Greed Meter** by `[2.5%, 3.3%, 4.2%]`. Breaking ordinary slate/coral/teal bricks (`c`, `t`, `v`) does not raise Greed.
- **Counterplay 1 (Stealth Route):** Carve through non-gold tiles and hit the two `64x16` teal **Hush Chime** bricks (`hh`), each lowering Greed by `25%` with a soft bell chord.
- **Counterplay 2 (High-Greed Cash-In):** Deliberately fill Greed to `100%` after banking a **Sweet-Spot Ram** (`15.6` radius from P1) or `COSMIC` orb; when Ember puffs molten gold (`m`) across a row, shatter the molten tiles before they cool (`4.0 s`) to trigger a `3x3` gold spark burst (`+500` pts and `3` boss HP on Floor 3).

### 3. Floors Table (`25–40 s` per Floor)

| Floor | Name & Goal | Active Hazard (with `1.8 / 1.6 / 1.4 s` Tell) | Bricks | Target Seconds | Reused Art & Systems |
|---:|---|---|---:|---|---|
| 1 | **The Coin Mound:** Dig through the hoard and strike the broad `64x32` **Sunstone** (`S`) 4 times. | **Nostril Snort Puff** (at `100%` Greed or every `[11, 9.5, 8] s`): Ember's nostrils flare + throat glows `#FF8A3D` (`1.6 s` tell), glazing 4 gold tiles into 2-HP Hardened Gold. | `56` | `[25, 35]` | Vault gem/brick shaders, Gatehouse `1.2 s` floor camera climb, Kit Face Orb. |
| 2 | **Molten Veins:** Break the Left and Right `56x24` **Brass Vault Locks** (`L`, 4 HP each) to drop the inner treasury grate. | **Coin Avalanche & Tail Sweep:** Ember's tail lifts high (`1.6 s` tell) and sweeps 1 row of loose coins sideways (`140 units/s`), nudging the ball's `x` velocity by `+/-90 units/s`. | `62` | `[28, 38]` | Gatehouse counterweight pip UI (`4/4` pips under each lock), swept capsule collision. |
| 3 | **Awakened Hoard Duel:** Deplete Ember's `[28, 38, 48]` HP by hitting her broad head/chest (`128x64` units) and shattering Molten Gold tiles under her chin. | **Ember Breath & Claw Slam:** Chest inflates + cheeks puff (`1.6 s` tell) before a chunky flame blob glazes 5 front tiles into Molten Gold (`m`); hitting `m` within `4.0 s` deals `3` splash HP to Ember. | `54` | `[30, 42]` | Bellforge boss HP bar + stagger stars, K07 stone/gold spark FX. |

### 4. Hazards & Tells Table

| Hazard ID | Visible Tell (`1.8 / 1.6 / 1.4 s`) | Safe First Showing | Player Counterplay | Cost If It Lands (Fair, Never Instant Death) |
|---|---|---|---|---|
| `nostril-puff` | Ember's one amber eye opens wide, cheeks puff, and throat glows warm `#FF8A3D` for `1.6 s`. | At `t = 2.0 s` on Floor 1, Ember snores a tiny harmless puff onto 2 side-wall decorative coins. | Hit a `hh` Hush Chime brick to calm her, or smash the glazed row with a `15.6`-radius Ram. | Converts up to 4 `1-HP` gold bricks into `2-HP` Hardened Gold (`H`); breaks zero player bricks. |
| `coin-avalanche` | Ember's thick tail raises 24 units high with a brass rattle for `1.6 s` along one brick row. | First tail twitch on Floor 2 slides 3 background coins behind the left granite bastion. | Bank the ball above the warned row or hold Focus aim (`0.25x`) on the paddle until the slide passes. | Deflects ball horizontally (`+/-90 units/s`) or stuns paddle speed to `0.65x` for `1.2 s` if coin spray hits paddle. |
| `molten-breath` | Floor 3: Ember rears back, jaw opens `35 deg`, and inner mouth glows `#F4C542` for `1.6 s`. | Floor 3 intro (`0.0–1.8 s`): Ember roars upward, glazing 2 front tiles before serve. | Strike the freshly glazed **Molten Gold** tiles (`m`) within `4.0 s` before they cool into 2-HP `H` armour. | Unbroken `m` tiles cool after `4.0 s` into `2-HP` Hardened Gold bricks shielding her front plinth. |

### 5. Difficulty Table (`[Easy, Medium, Hard]`)

| Parameter | Easy | Medium | Hard | Notes |
|---|---:|---:|---:|---|
| `villainHP` (Ember Floor 3) | `28` | `38` | `48` | Ram deals `4` HP; shattering a Molten Gold tile deals `3` splash HP. |
| `tell_s` (All 3 hazards) | `1.8` | `1.6` | `1.4` | Strictly within K01's `1.2–1.8 s` telegraph window. |
| `hazardInterval_s` | `10.5` | `8.8` | `7.4` | Minimum cooldown between Ember's breath/tail actions. |
| `greedPerGoldBrick_pct` | `2.5` | `3.3` | `4.2` | `40 / 30 / 24` gold bricks to trigger a Greed Wake event. |
| `moltenCoolTime_s` | `5.0` | `4.0` | `3.2` | Window to shatter `m` tiles for `3` boss splash damage before they harden. |
| `totalBricks` (Floors 1+2+3) | `148` | `172` | `196` | Outer edges are open 2-cell side lanes on all modes. |

### 6. Brick Grids per Floor (`11 Cols x 9 Rows`, Cell `28x18` Units, Origin `[26, 96]`)

**Legend:** `.` empty lane | `g` Gold Coin 1-HP (`#F4C542`) | `H` Hardened Gold 2-HP (`#C87D55`) | `m` Molten Gold 1-HP splash (`#FF8A3D`) | `r` Gem Cache 1-HP (`#FF4D6D`, drops capsule) | `c` Coral 1-HP (`#FF6F61`) | `t` Teal 1-HP (`#22C4B0`) | `h` Hush Chime (`64x16` pair, `-25%` Greed) | `X` Granite indestructible (`#4A4F6E`) | `S` Sunstone goal (`64x32` 2x2 block) | `L` Brass Vault Lock (`56x24` 2x1 block) | `E` Ember Boss Footprint (`128x64` top plinth).

- **Floor 1 Map (*The Coin Mound* — open 1-cell side lanes at Cols 0 & 10, 2-cell shaft in centre):**
  - Row 0: `. g g r g . g r g g .`
  - Row 1: `. g H g g . g g H g .`
  - Row 2: `. c g g . . . g g c .`
  - Row 3: `. h h g . S S . g h h`
  - Row 4: `. g g c . S S . c g g`
  - Row 5: `. t g g r . r g g t .`
  - Row 6: `. X X . g g g . X X .`
  - Row 7: `. c c . t c t . c c .`
  - Row 8: `. . . . . . . . . . .`

- **Floor 2 Map (*Molten Veins* — twin Vault Locks `L L` at Row 2):**
  - Row 0: `. g r g . . . g r g .`
  - Row 1: `. H g g c . c g g H .`
  - Row 2: `. L L . g H g . L L .`
  - Row 3: `. c c . g r g . c c .`
  - Row 4: `. h h . t g t . h h .`
  - Row 5: `. g g H . . . H g g .`
  - Row 6: `. X . g c g c g . X .`
  - Row 7: `. t t . g g g . t t .`
  - Row 8: `. . . . . . . . . . .`

- **Floor 3 Map (*Awakened Hoard Duel* — Ember `E E E E` at Rows 0–2, Molten Gold row `m` at Row 3):**
  - Row 0: `. . . E E E E . . . .`
  - Row 1: `. g . E E E E . g . .`
  - Row 2: `. r . E E E E . r . .`
  - Row 3: `. . m m m m m m . . .`
  - Row 4: `. h h . g H g . h h .`
  - Row 5: `. X X . c r c . X X .`
  - Row 6: `. g g . t g t . g g .`
  - Row 7: `. c t . . . . . t c .`
  - Row 8: `. . . . . . . . . . .`

### 7. Stickiness, Urgency & Physics Notes
- **Stickiness & Skill Moment:** Banking a `SPARK` or `Sweet-Spot Ram` ball behind Row 3 on Floor 3 to detonate 3 **Molten Gold** tiles in one volley deals `9` splash HP to Ember, staggers her (`2.5 s` with spinning stars), and showers the screen in gold glints. Continue restarts the current floor (`1`, `2`, or `3`) with Ember's remaining HP preserved.
- **Physics & Anti-Trap Rules:** Ember's body (`128x64` units) is a compound of 36 inscribed circles (specified in P8) with empty gaps under her jaw and folded wings. When her tail sweeps (`coin-avalanche`) or pose blends (`0.15 s` interpolation), swept capsule collision pushes any overlapping ball outward along the contact normal at `>=345 units/s` so a ball can never be pinched against the `X` granite blocks.

### 8. Reuse vs. New Art Table

| Need | Source (Existing Art or Code) | New Work & Prompt Library Source |
|---|---|---|
| Kit hero, chrome paddle/ball, top HUD, 3-floor camera climb | Reuse Gatehouse Siege & Vault systems (`100%`) | None |
| Counterweight lock pips (`4/4`) & stagger star pop | Reuse Gatehouse Floor 1 pips & Floor 3 stagger UI | Retint lock body to warm brass `#F4C542` |
| Hoard Coin, Gem Cache, Molten Gold & Hardened Gold bricks | Reuse K07 brick shader pipeline | New 4x3 Hoard Brick sheet (`K07 §3`, prompt file `20`) |
| Ember the dragon (sleeping, stirring, puff, tail sweep, roar, hurt) | Reuse compound-circle boss rig from Korr | New Ember character sheets (`K06 Ember`, prompt file `10` — see P8) |
| Dark treasure cave background & Sunstone goal (`64x32` units) | Reuse Vault dark stone palette (`#141831` / `#22284A`) | New Dragon's Hoard level board (`K08`, prompt file `30` below) |

## Data
```json
{
  "kind": "level",
  "name": "Dragon's Hoard",
  "hero": "kit",
  "chapter_slot": 12,
  "floors": [
    {
      "floor": 1,
      "goal": "Dig a shaft through the coin mound and strike the broad 64x32 Sunstone 4 times",
      "hazard": "Nostril Snort Puff glazes up to 4 gold bricks into 2-HP Hardened Gold when Greed hits 100%",
      "tell_s": 1.6,
      "bricks": 56,
      "seconds": [25, 35],
      "map": [
        ".ggrg.grgg.",
        ".gHgg.ggHg.",
        ".cgg...ggc.",
        ".hhg.SS.ghh",
        ".ggc.SS.cgg",
        ".tggr.rggt.",
        ".XX.ggg.XX.",
        ".cc.tct.cc.",
        "..........."
      ]
    },
    {
      "floor": 2,
      "goal": "Shatter the Left and Right 56x24 Brass Vault Locks (4 HP each) to drop the inner treasury grate",
      "hazard": "Tail Sweep slides a wave of loose coins across one row (140 units/s) after a 1.6 s raised-tail tell",
      "tell_s": 1.6,
      "bricks": 62,
      "seconds": [28, 38],
      "map": [
        ".grg...grg.",
        ".Hggc.cggH.",
        ".LL.gHg.LL.",
        ".cc.grg.cc.",
        ".hh.tgt.hh.",
        ".ggH...Hgg.",
        ".X.gcgcg.X.",
        ".tt.ggg.tt.",
        "..........."
      ]
    },
    {
      "floor": 3,
      "goal": "Defeat awakened Ember (28/38/48 HP) by striking her broad body and shattering Molten Gold tiles under her chin",
      "hazard": "Molten Breath glazes 5 front tiles into Molten Gold after a 1.6 s chest-inflate tell; cools to 2-HP armour after 4 s",
      "tell_s": 1.6,
      "bricks": 54,
      "seconds": [30, 42],
      "map": [
        "...EEEE....",
        ".g.EEEE.g..",
        ".r.EEEE.r..",
        "..mmmmmm...",
        ".hh.gHg.hh.",
        ".XX.crc.XX.",
        ".gg.tgt.gg.",
        ".ct.....tc.",
        "..........."
      ]
    }
  ],
  "hazards": [
    {
      "id": "nostril-puff",
      "tell": "Ember's amber eye opens wide, cheeks puff, and throat glows #FF8A3D",
      "tell_s": 1.6,
      "counterplay": "Strike a 64x16 teal Hush Chime brick (-25% Greed) or plough the glazed row with Sweet-Spot Ram",
      "cost": "Up to 4 gold bricks harden into 2-HP Hardened Gold tiles (no player bricks destroyed)"
    },
    {
      "id": "coin-avalanche",
      "tell": "Ember lifts her heavy tail 24 units high with a brass rattle along the target row",
      "tell_s": 1.6,
      "counterplay": "Bank the ball into the upper shaft or hold Focus aim (0.25x slow-mo) until the coin slide passes",
      "cost": "Nudges ball horizontal velocity by +/-90 units/s or slows paddle to 0.65x for 1.2 s"
    },
    {
      "id": "molten-breath",
      "tell": "Ember rears back, jaw opens 35 deg, and inner throat glows warm #F4C542",
      "tell_s": 1.6,
      "counterplay": "Break freshly glazed Molten Gold tiles within 4.0 s to splash 3 HP onto Ember and stagger her",
      "cost": "Unbroken Molten Gold tiles cool after 4.0 s into 2-HP Hardened Gold armour bricks"
    }
  ],
  "difficulty": {
    "villainHP": [28, 38, 48],
    "tell_s": [1.8, 1.6, 1.4],
    "hazardInterval_s": [10.5, 8.8, 7.4],
    "greedPerGoldBrick_pct": [2.5, 3.3, 4.2],
    "moltenCoolTime_s": [5.0, 4.0, 3.2]
  },
  "grid": {
    "cols": 11,
    "rows": 9,
    "cell": [28, 18],
    "origin": [26, 96],
    "map": [
      ".ggrg.grgg.",
      ".gHgg.ggHg.",
      ".cgg...ggc.",
      ".hhg.SS.ghh",
      ".ggc.SS.cgg",
      ".tggr.rggt.",
      ".XX.ggg.XX.",
      ".cc.tct.cc.",
      "..........."
    ],
    "legend": {
      ".": "empty lane",
      "g": "gold coin 1HP (#F4C542, +300 score, +2 orb charge, +greed)",
      "H": "hardened gold 2HP (#C87D55)",
      "m": "molten gold 1HP (#FF8A3D, splashes 3 HP to Ember if broken in 4s)",
      "r": "gem cache 1HP (#FF4D6D, guaranteed capsule drop)",
      "c": "coral 1HP (#FF6F61, 0 greed)",
      "t": "teal 1HP (#22C4B0, 0 greed)",
      "h": "hush chime 1HP (#2EC4B6, 64x16 pair, -25% greed)",
      "X": "granite indestructible (#4A4F6E, chamfered octagon)",
      "S": "Sunstone goal (64x32 2x2 block, 4 hits to clear Floor 1)",
      "L": "Brass Vault Lock (56x24 2x1 block, 4 hits each to clear Floor 2)",
      "E": "Ember boss footprint (128x64 top plinth on Floor 3)"
    }
  },
  "reuse": [
    "Kit hero, chrome paddle/ball, Focus aim, and Sweet-Spot Ram (powerups-round2)",
    "Gatehouse 3-floor 1.2 s camera climb and 4-pip lock counter UI",
    "Bellforge boss HP bar, stagger stars, and compound-circle collision solver",
    "K07 stone chip and gold 4-point spark FX emitters"
  ],
  "new_art": [
    { "need": "Ember dragon turnaround, 12 expressions, 6 collision keyposes, and rotating parts (jaw, wings, tail)", "prompt_file": "10" },
    { "need": "4x3 Hoard brick sheet: 4 gold coin stamps, 4 gem cache tiles, molten gold, hardened gold, brass lock", "prompt_file": "20" },
    { "need": "Dragon's Hoard dark plum-charcoal cave backdrop, Sunstone (64x32), and Wake Eye HUD meter", "prompt_file": "30" }
  ]
}
```

## Art requests

### Image 1: `P07_dragons-hoard_level-board_1.png`
```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: stylized-concept.
Asset type: ONE tall portrait phone game screen mock for a premium mobile brick breaker, aspect 9:19.5 (for example 1080x2340). Full-bleed art, no phone hardware, no bezel.

HOW THE GAME PLAYS (the picture must read as a playable board). This is a portrait phone brick breaker. A small chrome ball bounces off a low chrome paddle and breaks bricks. Bricks are glossy glazed tiles, all the same size within a row, never tiny. The ball is small (about 3% of screen width). The paddle is a chrome capsule about 28% of screen width, low on the screen, with a large EMPTY dark lower quarter above it so the ball has room to come back. Every brick, wall, ramp and enemy sits well above that empty lane. The ball must be able to reach every important target: leave open vertical lanes down both side walls and at least two broad gaps in every brick band; a decorative arch or door is never counted as a route. Breakable bricks and indestructible blocks (dark granite or iron) differ by shape and material, not only by colour. Any enemy weak point is a broad body part, never a tiny spot. A visible warning (a glow, a lit lamp, a raised arm) comes before any hazard; never draw a hazard hitting the player. HUD is minimal and calm: pause button top-left, three small chrome life balls, a short level label at top centre, score top-right; no instructions or paragraphs inside the playfield. The hero's small round face portrait (face orb) sits lower-left in the control area; the centre of the bottom area is a clear empty drag lane. The background is dark, calm and desaturated several stops below the foreground: no bright planets, torches, beams or light shafts competing with the ball. Glossy bricks and characters lead the eye and the white chrome ball is easy to find.

SCREEN ZONES (percent of screen height from the top): 0-5% scene art only, no UI (notch); 5-9% slim HUD; 9-60% the level (bricks, villain, machinery); 60-74% empty dark reaction lane; about 75% the chrome paddle (a chrome capsule, 28% of the width) with one white chrome ball just above it; 80-100% dark control deck with the face orb lower-left and the three life balls.

LEVEL: DRAGON'S HOARD, FLOOR 1 (THE HOARD). A heist: Kit sneaks into a sleeping dragon's cave and digs a shaft to the Sunstone at the bottom of a huge pile of treasure. Hero face orb (lower-left): Kit in his cobalt helmet, smug.
Bricks: a dense mound of glossy honey-gold coin tiles (#F4C542), coral tiles (#FF6F61), teal Hush Chime tiles (#22C4B0), ruby/emerald gem cache tiles, and chamfered dark-granite bastions (#4A4F6E), with a few molten orange-gold tiles (#FF8A3D) in one row where she has breathed. A diagonal shaft of cleared dark gaps winds toward the glowing Sunstone (a broad 64x32 warm orange-gold faceted stone, about 18% of screen width) in the lower-middle of the pile. Two broad open vertical lanes run down both side walls.
THE DRAGON (Ember, a large four-legged burnt-orange #B8402F and charcoal #2A2D3E ceramic-scaled dragon with cream belly plates #F3E5AB, brass horn caps, folded wings) lies asleep curled across the upper third of the pile, one amber eye half open in a warning tell and a soft orange glow in her throat. Her Wake Eye meter sits in the top-centre HUD next to "FLOOR 1/3", one-third open. Calm dark cavern of charcoal and deep plum (#141831), no lava rivers or torches.
```

## Rules check
- Every hazard has a visible 1.2 to 1.8 s tell and is shown once safely first: **OK** — `nostril-puff`, `coin-avalanche`, and `molten-breath` all use `[1.8, 1.6, 1.4] s` physical tells and fire once harmlessly on floor entry.
- Ordinary ball play always makes progress; no tiny weak points (min 32x16 brick), no precision puzzles, no waiting on timers or invulnerable enemies: **OK** — the Sunstone is `64x32` units, Vault Locks are `56x24` units, Hush Chimes are `64x16` units, and Ember's body is `128x64` units.
- Difficulty changes numbers only (harder but fair): **OK** — `[Easy, Medium, Hard]` only scale HP (`[28, 38, 48]`), tell duration (`[1.8, 1.6, 1.4] s`), Greed gain (`[2.5%, 3.3%, 4.2%]`), and cool time (`[5.0, 4.0, 3.2] s`).
- No power-up, companion or purchase is required to win; Pause, Continue, Retry keep progress: **OK** — ordinary chrome ball clears all 3 floors; Continue preserves current floor and Ember's remaining HP.
- Enemy attacks never destroy the player's bricks to hand out rewards: **OK** — Ember's breath **glazes** bricks into Molten/Hardened Gold rather than breaking them; only the player's ball can shatter them for rewards.
- A single brick cracks and fades in about 0.4 s; only big crashes drop debris: **OK** — individual coin tiles crack and fade in `0.4 s`; only the Floor 1 Sunstone extraction, Floor 2 grate drop, and Floor 3 Molten Gold splash bursts drop chip debris.
- Effects are rendered gems, chips, sparks, dust or debris; never plain circles or rings: **OK** — breath uses irregular chunky flame blobs and molten drips, never drawn rings.
- Mobile safe areas, 393x852 and 412x915, 44 pt touch targets, paddle above the thumb: **OK** — lowest brick row (`Row 7`) ends at `y = 240`, leaving `y = 240..585` completely open above the paddle.
- Glossy vinyl-toy / glazed-ceramic look, dark navy background, minimal yellow: **OK** — coin bricks use rich warm honey-brass (`#F4C542` / `#C87D55`) balanced by coral, teal, and dark granite against a `#141831` cavern.

## Open questions for Claude
1. Should decorative background coin piles behind Ember shift and settle visually when a floor goal is cleared? **Recommended:** Yes, play a `0.8 s` parallax slide on the non-colliding background hoard layer during the `1.2 s` camera climb between floors.
2. When Ember breathes on an already-broken empty cell in Row 3 on Floor 3, does it spawn a new Molten Gold tile (`m`)? **Recommended:** Allow her breath to re-glaze up to `3` empty cells in Row 3 into `1-HP` Molten Gold tiles (`m`) so the player always has splash-damage ammunition even after clearing the initial board.
3. Does hitting Ember's head during her `1.6 s` `molten-breath` tell interrupt the breath? **Recommended:** A normal ball deals `1` HP without interrupting; a `Sweet-Spot Ram` (`15.6` radius) or `COLOSSUS` hit during the tell snaps her jaw shut, cancels the breath, and triggers a `2.0 s` stagger.
