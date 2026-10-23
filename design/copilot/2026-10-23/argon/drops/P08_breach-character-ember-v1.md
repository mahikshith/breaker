---
breach_drop: 1
kind: character
slug: ember
version: 1
date: 2026-10-23
status: proposal
tool: Copilot Studio, Gemini 4 Argon
depends_on: ["dragons-hoard"]
---
# BREACH P8: Character Design — Ember the Hoard Dragon

## Summary
- Defines **Ember**, the `64`-unit-tall (`128`-unit-wide) dragon boss of **Dragon's Hoard** (`dragons-hoard`), with a low, wide winged-mound silhouette that reads unmistakably apart from Gnash (slender tube), Mooncoil (diamond serpent), and Korr (hornless hoofed boar).
- Evaluates 3 character directions and selects **Direction A: The Cloaked Hoard Baron** (`["greedy", "vain", "dramatic"]`), combining burnt-orange glazed ceramic scales (`#B8402F`), charcoal spine plates (`#2A2D3E`), cream belly tiles (`#F3E5AB`), and brass horn caps (`#F4C542`).
- Maps 8 core gameplay expressions (`idle`, `taunt`, `windup`, `attack`, `hurt`, `stagger`, `panic`, `defeat`) plus 4 bonus expressions for the 12-cell sheet, ensuring eyes, brows, and mouth all change together at `56 px`.
- Specifies 6 collision keyposes with exact `[1.8, 1.6, 1.4] s` attack-tell timing, 4 independently rotating rig parts (`jaw`, `leftWing`, `rightWing`, `tail`), and a 36-circle compound collision hull with `0.15 s` pose blending.
- Includes complete K05/K06 turnaround (`P08_ember_turnaround_1.png`) and expression-sheet (`P08_ember_expressions_2.png`) prompts with transparent backgrounds.

## Decisions for the owner
1. Ember's character direction: A Cloaked Hoard Baron (wide four-legged mound, bat wings folded like a royal cloak, crescent brass-capped horns, burnt orange `#B8402F` & charcoal `#2A2D3E`) [RECOMMENDED] [AUTO-PICKED] | B Pot-Bellied Furnace Toad-Drake (bipedal upright pear silhouette) | C Crowned Serpentine Wyvern (long neck, two legs, wing-arms).
2. Wing behaviour during `windup` (`1.6 s` tell) and `panic`: A Wings stay folded like a heavy cape during rest and flare `42 deg` wide during `windup` and `panic` so the silhouette doubles in height at `100 px` [RECOMMENDED] [AUTO-PICKED] | B Wings flap continuously in idle | C Small flightless nub wings.
3. Coin props attached to Ember's body: A 5 glossy honey-gold coins (`#F4C542`) stuck to her flank and brow that pop off visually (non-colliding FX) when she enters `stagger` [RECOMMENDED] [AUTO-PICKED] | B No coins on her body | C A wearable gold crown that acts as a separate hitbox.

## Spec

### 1. Three Character Directions

**Direction A — The Cloaked Hoard Baron [RECOMMENDED] [AUTO-PICKED]:**
- **Personality in 3 words:** `["greedy", "vain", "dramatic"]`.
- **Silhouette & Proportions:** A low, heavy, four-legged dragon mound (`128` units wide by `64` units tall) whose two large bat-style wings fold over her shoulders like an aristocratic opera cloak when asleep or smug, then flare into a broad jagged W-arch (`86` units tall) during her `1.6 s` attack tell. Her chibi head is `38%` of her standing height with a blunt square snout, swept ivory-and-brass crescent horns, and a thick curled tail. Unlike Korr's compact tusked rectangle or Gnash's narrow neck tube, Ember's winged cloak and crescent horns read in under `0.2 s` at `64` units tall.
- **Colours:** Burnt-orange glazed ceramic scales (`#B8402F`), deep charcoal-slate dorsal and wing membranes (`#2A2D3E`), warm cream belly plates (`#F3E5AB`), brass horn caps and stuck coins (`#F4C542`), and blazing amber slit eyes (`#FF9F1C`).

**Direction B — The Furnace Toad-Drake:**
- **Personality in 3 words:** `["gluttonous", "grumpy", "sluggish"]`.
- **Silhouette & Colours:** A pear-shaped bipedal dragon sitting upright on its haunches with a huge inflatable throat pouch, tiny stubby wings, and stubby nub horns in copper-red (`#A63A2B`) and olive-bronze (`#6E6A42`). Rejected because its round belly silhouette risks reading too close to a blob/toad rather than an iconic treasure dragon.

**Direction C — The Crowned Wyvern:**
- **Personality in 3 words:** `["haughty", "fierce", "paranoid"]`.
- **Silhouette & Colours:** A tall S-necked two-legged wyvern perching on wing-knuckles in crimson (`#C82846`) and obsidian (`#1A1829`). Rejected because its long S-neck overlaps too closely with Gnash and Mooncoil at phone scale.

### 2. Materials & Hex Palette (Direction A)

| Body Part | Hex Colour | Material Finish (Blender Cycles Look) |
|---|---|---|
| Primary armour scales (head, shoulders, thighs) | `#B8402F` | Thick glazed ceramic tile plates with crisp `#FFDBB8` top-left highlight bands |
| Dorsal spine ridge, wing outer struts, eyebrow slabs | `#2A2D3E` | Satin-gloss dark charcoal vinyl with `#8CA6FF` right-side cool fill reflections |
| Wing inner membranes & ear frills | `#5C2434` | Semi-matte plum-burgundy vinyl toy material |
| Chest and segmented belly plates | `#F3E5AB` | Glossy warm cream porcelain with dark `#141831` seam grooves |
| Crescent horns & claws | `#EDE3D2` | Polished ivory vinyl with rounded tips |
| Horn caps, tail ring, and 5 stuck hoard coins | `#F4C542` | Brushed warm brass / honey gold (small accent only) |
| Iris & inner throat tell glow | `#FF9F1C` / `#FF8A3D` | High-gloss amber glass eye with two white catch-lights; soft bounded throat ember |

### 3. Eight Core Expressions (Mapped to Game Moments)

| Expression ID | Game Moment | Eyes | Brows | Mouth & Head Language |
|---|---|---|---|---|
| `idle` | Sleeping / Stirring watch (`Floor 1–2` rest) | One amber slit eye half-open peeking at the ball, the other shut tight | Level heavy charcoal brow slabs, one slightly cocked | Closed blunt snout with a glossy snore bubble or lazy smirk |
| `taunt` | Player misses a shot or Greed rises (`smug`) | Half-lidded bedroom eyes looking down her snout with gleaming catch-lights | Left brow arched high, right brow dipped low | Lopsided toothy grin with one gold coin balanced on her nose |
| `windup` | `1.8 / 1.6 / 1.4 s` Attack Tell before breath/sweep | Wide blazing amber eyes locked forward, pupils contracted to sharp slits | Both brow slabs slammed down in a deep V | Cheeks puffed round like bellows, jaw hinged open `20 deg` with warm `#FF8A3D` throat glow |
| `attack` | Releasing `molten-breath` or `coin-avalanche` | Upper lids fierce and narrow, bright orange rim reflection | Furrowed hard forward over the nasal bridge | Jaw wide open (`35 deg` roar), fangs bared, horns angled forward |
| `hurt` | Hit by ball, Sweet-Spot Ram, or Molten Gold splash | Squeezed shut as `> <` arcs with two tiny teardrop glints | Thrown high toward her horn roots | Open rectangular yelp (`"OW!"` shape), head snapped back `12 deg` |
| `stagger` | Dazed for `2.5 s` after Molten Gold splash / Ram hit | Mismatched spiral eyes spinning opposite ways | Limp, uneven, drooping over the outer eye corners | Slack open jaw with forked pink tongue lolling out the side |
| `panic` | Cowardly reaction when HP drops below `25%` (`<=10 HP`) | Huge wet round eyes with tiny pinprick pupils | Tilted sharply up in the middle (`/\` worried angle) | Wide trembling wavy mouth, wings pulled in like a shield, sweat drops |
| `defeat` | `0 HP` cleared on Floor 3 | Peacefully closed curved arcs (`u u`) | Relaxed flat, tension gone | Flopped flat on her chin, tongue out, a small white puff of smoke rising |

*(Note: For the 4x3 12-cell expression sheet prompt below, we include these 8 core game expressions plus `asleep`, `snort`, `greedy`, and `fake-out-snore` from K06).*

### 4. Six Key Poses, Attack Tell Timing & Rotating Parts Rig

| Pose ID | Game Moment | Timing / Duration (`[E, M, H]`) | Silhouette Change & Collision Role |
|---|---|---|---|
| `sleeping-idle` | Floor 1–2 hoard rest | Continuous until Greed milestone | Low `128x52` unit mound; wings folded tight like a cloak, chin on front paws. |
| `stirring` | Greed crosses `50%` or `75%` | `0.8 s` transition | Head lifts `18` units, one wing twitches up, tail tip curls (`128x60` units). |
| `windup` | **Attack Tell** (`nostril-puff` / `molten-breath`) | **`[1.8, 1.6, 1.4] s`** | Chest inflates `+14` units, both wings flare wide into an `86`-unit high W-silhouette, cheeks puff, throat glows `#FF8A3D`. |
| `attack-release` | Flame puff or tail sweep | `0.55 s` active release | Neck lunges forward `16` units, jaw opens `35 deg` (or tail sweeps `24` units high). |
| `stagger` | Hit by Molten Gold splash or Ram | `2.5 s` vulnerability window | Reared back on haunches, belly cream plates (`#F3E5AB`) fully exposed as a broad `96x48` target. |
| `defeat` | Boss HP reaches `0` | `1.8 s` outro | Collapsed flat (`132x42` units), wings draped loose, 5 stuck gold coins pop off. |

- **Separately Rotating Rig Parts (Pivots in Normalised UV of `1536x1024` Cell):**
  1. `jaw`: Hinge pivot `[0.61, 0.54]`, rotation `0 deg` (closed) to `+35 deg` (roar/breath), swept capsule `r = 6` units.
  2. `leftWing`: Shoulder pivot `[0.44, 0.36]`, rotation `-8 deg` (folded cloak) to `+42 deg` (windup/panic flare), swept 3-circle arc.
  3. `rightWing`: Shoulder pivot `[0.54, 0.34]`, rotation `-5 deg` to `+45 deg`, swept 3-circle arc.
  4. `tail`: Root pivot `[0.22, 0.68]`, rotation `-15 deg` (coiled) to `+38 deg` (raised `coin-avalanche` tell), swept 5-circle tapered chain.
- **How Hit Shape Follows Drawn Art:** Collision uses **36 inscribed circles** (`alpha >= 128`, radii `3.5` to `22.0` units) across the torso, head, legs, wings, and tail. Real gaps under the belly, between the open jaws, and between the crescent horns remain completely empty. Pose transitions blend circle centres over `0.15 s` and push any overlapping ball outward along the contact normal (`>=345 units/s`). One ball contact deals damage once (`1` HP on head/chest/belly, bounces with `0` damage off the brass horn caps).

## Data
```json
{
  "kind": "character",
  "name": "Ember",
  "role": "villain",
  "height_units": 64,
  "silhouette": "Low, wide four-legged dragon mound (128x64 units) with folded cloak-like bat wings that flare into an 86-unit W-arch on attack tell, blunt snout, and crescent brass-capped horns",
  "personality": ["greedy", "vain", "dramatic"],
  "materials": [
    { "part": "body_scales", "hex": "#B8402F", "finish": "glossy glazed ceramic plates with #FFDBB8 top-left highlight" },
    { "part": "spine_and_brows", "hex": "#2A2D3E", "finish": "satin-gloss dark charcoal vinyl" },
    { "part": "wing_membranes", "hex": "#5C2434", "finish": "semi-matte plum-burgundy vinyl" },
    { "part": "belly_plates", "hex": "#F3E5AB", "finish": "glossy warm cream porcelain" },
    { "part": "horns_and_claws", "hex": "#EDE3D2", "finish": "polished ivory vinyl" },
    { "part": "horn_caps_and_coins", "hex": "#F4C542", "finish": "brushed warm brass accent" },
    { "part": "eyes_and_throat_glow", "hex": "#FF9F1C", "finish": "high-gloss amber glass with bounded #FF8A3D throat ember" }
  ],
  "expressions": [
    {
      "id": "idle",
      "game_moment": "idle",
      "eyes": "One amber slit eye half-open watching the ball, the other shut",
      "brows": "Heavy charcoal brow slabs level with one slightly cocked",
      "mouth": "Closed blunt snout with a lazy smug corner curl"
    },
    {
      "id": "taunt",
      "game_moment": "taunt",
      "eyes": "Half-lidded arrogant amber eyes looking down her snout",
      "brows": "Left brow arched high, right brow dipped low",
      "mouth": "Lopsided toothy grin with a gold coin balanced on her snout tip"
    },
    {
      "id": "windup",
      "game_moment": "windup",
      "eyes": "Wide blazing amber eyes with contracted vertical slit pupils",
      "brows": "Both brow slabs slammed down in a deep angry V",
      "mouth": "Cheeks puffed round like bellows, jaw open 20 deg with soft #FF8A3D throat glow"
    },
    {
      "id": "attack",
      "game_moment": "attack",
      "eyes": "Fierce narrowed upper lids reflecting warm orange light",
      "brows": "Driven hard forward over the nasal bridge",
      "mouth": "Jaw hinged open 35 deg in a full roar with fangs bared"
    },
    {
      "id": "hurt",
      "game_moment": "hurt",
      "eyes": "Squeezed shut as > < arcs with tiny corner tear glints",
      "brows": "Thrown high toward the crescent horn bases",
      "mouth": "Open square yelp with head recoiling back 12 deg"
    },
    {
      "id": "stagger",
      "game_moment": "stagger",
      "eyes": "Mismatched spiral eyes spinning in opposite directions",
      "brows": "Uneven and drooping limp over outer eye corners",
      "mouth": "Slack open lower jaw with pink tongue hanging out the side"
    },
    {
      "id": "panic",
      "game_moment": "panic",
      "eyes": "Huge wet round eyes with tiny pinprick pupils",
      "brows": "Tilted sharply upward in the middle in a cowardly /\\ arch",
      "mouth": "Wide trembling wavy mouth with sweat drops flying"
    },
    {
      "id": "defeat",
      "game_moment": "defeat",
      "eyes": "Peacefully closed downward arcs (u u)",
      "brows": "Flat and relaxed",
      "mouth": "Chin flopped flat on the ground, tongue out, small white smoke puff"
    }
  ],
  "poses": [
    { "id": "sleeping-idle", "game_moment": "floor 1-2 rest on hoard", "seconds": 0.0 },
    { "id": "stirring", "game_moment": "greed meter warning at 50% and 75%", "seconds": 0.8 },
    { "id": "windup", "game_moment": "attack tell (chest inflates, wings flare 42 deg, throat glows)", "seconds": 1.6 },
    { "id": "attack-release", "game_moment": "molten breath puff or raised tail sweep", "seconds": 0.55 },
    { "id": "stagger", "game_moment": "reared back dazed after Molten Gold splash or Ram hit", "seconds": 2.5 },
    { "id": "defeat", "game_moment": "collapsed flat on belly at 0 HP", "seconds": 1.8 }
  ],
  "collision": "Compound of 36 inscribed circles (alpha >= 128) across body, head, legs, and swept capsules on rotating jaw, wings, and tail; gaps between legs, jaws, and horns stay empty, with 0.15 s pose blending and outward normal push preventing trapped balls",
  "sheets_needed": ["turnaround", "expressions", "keyposes", "parts"]
}
```

## Art requests

### Image 1: `P08_ember_turnaround_1.png`
```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: character design sheet.
Asset type: turnaround sheet, landscape 1536x1024, ONE character shown in four views in one row, evenly spaced: front, three-quarter, side, back. Same character, same proportions, same size, same lighting and the same ground line in every view.
Character: EMBER, a large, greedy, vain, half-asleep hoard dragon. A dragon with FOUR weight-bearing legs plus two separate bat-style wings (folded like a royal cloak over her shoulders) and a thick, long curled tail; NOT a long-armed lizard. Broad chunky head (about 38% of standing height) with a blunt snout, big nostrils, ivory-and-brass crescent horns (#EDE3D2 with #F4C542 caps), heavy amber slit eyes (#FF9F1C) with huge expressive charcoal lids and brows (#2A2D3E). Glossy ceramic-armour scales in BIG readable plates: burnt orange (#B8402F) and dark charcoal (#2A2D3E), warm cream belly plates (#F3E5AB), plum inner wing membranes (#5C2434), and five honey-gold coins (#F4C542) stuck to her flank. Low, wide mound silhouette.
Pose: relaxed neutral standing pose on all four legs, mouth closed in a slight vain smirk, eyes looking forward. Complete body visible in every view, nothing cropped.
BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers.
```

### Image 2: `P08_ember_expressions_2.png`
```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: expression sheet.
Asset type: 4 columns by 3 rows grid, landscape 1536x1024, twelve head-and-shoulder close-ups of the SAME character: EMBER the hoard dragon (broad blunt snout, burnt-orange #B8402F glazed ceramic scales, charcoal #2A2D3E brow slabs, ivory crescent horns with brass #F4C542 caps, amber #FF9F1C eyes). Evenly spaced cells with generous gaps, slight three-quarter front turn, identical scale and top-left lighting (#FFDBB8).
Expressions, left to right, top to bottom (covering all 8 game moments plus 4 hoard moods):
1. idle (stirring watch): one amber slit eye half open, the other shut, level brow.
2. taunt (smug): half-lidded eyes, one brow arched high, lopsided toothy smirk.
3. windup (attack tell): wide blazing amber eyes, brows slammed in a V, cheeks puffed round, jaw cracked open with soft orange throat glow.
4. attack (roar): jaw wide open 35 deg, fangs bared, brows driven forward.
5. hurt (hit): eyes squeezed shut as > <, brows thrown high, open square yelp.
6. stagger (dizzy): mismatched spiral eyes, drooping brows, slack jaw with pink tongue out.
7. panic (cowardly low HP): huge wet round eyes, tiny pupils, worried upturned /\\ brows, trembling wavy mouth, sweat drops.
8. defeat (KO): closed downward arc eyes, relaxed brows, head flopped, tongue out.
9. asleep: both eyes shut, a glossy snore bubble at one nostril.
10. snort: nostrils flared with two chunky smoke puffs, narrowed eyes.
11. greedy: wide round pupils, huge toothy grin, brows raised high.
12. fake-out snore: eyes shut tight but one brow twitching up with a tiny sly smile.
Rule: every face differs in eyes, brows AND mouth together and reads clearly at 56 px.
BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers.
```

## Rules check
- Every hazard has a visible 1.2 to 1.8 s tell and is shown once safely first: **OK** — `windup` pose lasts `[1.8, 1.6, 1.4] s` and changes at least 3 body parts (wings flare `42 deg`, cheeks puff, throat glows `#FF8A3D`).
- Ordinary ball play always makes progress; no tiny weak points (min 32x16 brick), no precision puzzles, no waiting on timers or invulnerable enemies: **OK** — Ember's hittable head/chest/belly span `96x48` to `128x64` units (3x larger than a `32x16` brick).
- Difficulty changes numbers only (harder but fair): **OK** — tell length scales `[1.8, 1.6, 1.4] s` and HP scales `[28, 38, 48]`.
- No power-up, companion or purchase is required to win; Pause, Continue, Retry keep progress: **OK** — ordinary chrome ball damages her head, chest, and belly on every hit.
- Enemy attacks never destroy the player's bricks to hand out rewards: **OK** — Ember's flame puff glazes bricks into Molten Gold rather than breaking them.
- A single brick cracks and fades in about 0.4 s; only big crashes drop debris: **OK** — N/A to character sheet.
- Effects are rendered gems, chips, sparks, dust or debris; never plain circles or rings: **OK** — throat tell is an internal physical glow and flame puff is a chunky textured blob; stuck coins pop off as 3D brass discs.
- Mobile safe areas, 393x852 and 412x915, 44 pt touch targets, paddle above the thumb: **OK** — Ember sits on the top plinth (`y = 96..160`), well above the reaction lane.
- Glossy vinyl-toy / glazed-ceramic look, dark navy background, minimal yellow: **OK** — burnt orange `#B8402F`, charcoal `#2A2D3E`, and cream `#F3E5AB` dominate; brass `#F4C542` is capped at horn tips and 5 small stuck coins.

## Open questions for Claude
1. Should Ember's brass horn caps (`#F4C542`, 2 circles of `r = 6` units at the top tips) bounce the ball as armour (`0` damage) or take normal `1` HP damage? **Recommended:** Make only the two `r = 6` horn-tip circles bounce with a metallic clink (`0` damage) while the remaining 34 circles (`128x58` units of head, torso, wings, and belly) take full damage, giving skilled top-bank shots a fun deflection without blocking frontal shots.
2. When Ember drops below `25%` HP (`<= 7 / 10 / 12 HP`), should her default idle expression switch from `idle` to `panic`? **Recommended:** Yes—switching her face and wing posture to cowardly `panic` at `<25%` HP sells her vain/cowardly personality and tells the player victory is 2 hits away.
3. Should we run the D3 Euclidean distance-transform circle-packing script (`--ppu 3 --pivot 0.5 0.88 --max 36`) on `P08_ember_turnaround_1.png` and the keypose sheet as soon as final PNGs are locked? **Recommended:** Yes, generate the exact `manifest.json` circle array from the locked RGBA alpha mask.
