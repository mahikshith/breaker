---
breach_drop: 1
kind: character
slug: kit-unlockables
version: 1
date: 2026-10-23
status: proposal
tool: Copilot Studio, Gemini 4 Argon
depends_on: ["powerups-round2", "difficulty-round2", "dragons-hoard", "ember"]
---
# BREACH P10: Prince Kit Unlockables — 4 Paddle Skins & 4 Swords

## Summary
- Designs 4 progression-unlocked **Paddle Skins** (`Starglass Vanguard`, `Gatehouse Bastion`, `Serpent Fang`, `Hoard Baron`) and 4 **Swords** (`Courtyard Gladius`, `Volt Rapier`, `Bellbreaker Greatsword`, `Drakefang Blade`) tied to BREACH's chapters and bosses (`Gnash`, `Korr`, `Ember`).
- Every item is earned strictly through gameplay milestones (Chapter clears, Star totals, and Hard wins)—never locked behind real-money payment.
- Keeps Paddle Skins **100% cosmetic** (`100x14` base collider preserved, nine-sliced chrome ends) and gives Swords a **tiny, fair optional perk** (`+2` sweet-spot width units or `+1` initial orb pip, toggleable off for pure cosmetic play).
- Fixes the flat wireframe sweet-spot indicator critiqued in P5 (`gatehouse-floor3.png`) by mounting the equipped Sword's physical 3D hilt/crest into the paddle's `33.3`-unit centre third (`3 physical gem pips` that light up on each centre hit).
- Includes a complete `4 columns x 2 rows` (`1536x1024`, transparent background, `10%` cell margin) production sprite-sheet prompt (`P10_kit-unlockables_skins-swords-sheet_1.png`).

## Decisions for the owner
1. Cosmetic vs. perk balance on unlockables: A Paddle Skins are 100% cosmetic (custom hit glints + audio chime only); Swords grant a tiny, fair comfort perk (`<= 4%` power) that can be toggled off on Hard [RECOMMENDED] [AUTO-PICKED] | B Both skins and swords are 100% cosmetic with zero perks | C Large stat perks (+25% paddle width, +2 damage).
2. How the equipped Sword appears during gameplay: A The sword's 3D crossguard and 3 gem pips sit inlaid across the paddle's centre third (replacing the flat wireframe box from P5), and Kit swings the full blade across the lower lane when activating a Hero Power or launching a Sweet-Spot Ram [RECOMMENDED] [AUTO-PICKED] | B Sword only appears in the menu portrait | C Sword floats beside the paddle at all times.
3. Unlock milestones across the 12 chapters: A Spread from early hook (`Clear Ch 2 The Vault`) to mid-game (`18 Stars`, `Clear Ch 9 Gatehouse`, `Clear Ch 12 Dragon's Hoard`) to aspirational mastery (`30 Stars`, `3 Hard Wins`, `All 11 Chapters Cleared on Hard`) [RECOMMENDED] [AUTO-PICKED] | B Unlock all items with soft currency Shine only.

## Spec

### 1. Four Unlockable Paddle Skins (`100x14` Units Base, `132x14` with `WIDE`)

| ID (`new: true`) | Skin Name | Materials & Hex Colours | How It Changes the Paddle Art & Juice | Unlock Condition | Perk Status |
|---|---|---|---|---|---|
| `skin-starglass` | **Starglass Vanguard** | Cobalt-blue glazed ceramic body (`#4F9DFF`), polished chrome end caps (`#DCE6F7`), cyan core conduit (`#7FD6FF`), silver lightning crest (`#FFFFFF`). | Replaces the amber core tube with a faceted starglass prism bar; 3 cyan kite-shield pips light up in the centre third for Ram streaks. | **Clear Chapter 2 (The Vault)** on any difficulty (early story reward when Lumi is rescued). | **Cosmetic only** (adds crystalline starglass chime on ball bounce). |
| `skin-gatehouse` | **Gatehouse Bastion** | Ruby-and-plum boar armour plates (`#9E2445` / `#5C2434`), dark blued gunmetal frame (`#2A2D3E`), ivory tusk bumper caps (`#EDE3D2`), warm brass rivets (`#F4C542`). | Curves two stubby ivory boar tusks around the chrome end caps and sets 3 brass bell-rivet pips in the centre third. | **Clear Chapter 9 (Gatehouse Siege)** on Medium or Hard (Korr trophy skin). | **Cosmetic only** (deep bronze bell clink on centre-third hits). |
| `skin-serpent` | **Serpent Fang** | Emerald-teal faceted ceramic scales (`#168F83`) on left half, royal violet scales (`#7A3CCC`) on right half, pale mint belly trim (`#C9E8D2`), rose-diamond centre pip (`#FF6FAE`). | Splits the paddle into interlocking Gnash and Mooncoil scale plates with angular serpent-brow end caps that widen cleanly when `WIDE` is active. | **Earn 24 Stars** across Chapters 1 to 11. | **Cosmetic only** (sheds 3 tiny emerald/violet ceramic sparks on Sweet-Spot Ram launch). |
| `skin-hoard-baron` | **Hoard Baron** | Burnt-orange dragon ceramic (`#B8402F`), charcoal dorsal frame (`#2A2D3E`), warm cream porcelain inlay (`#F3E5AB`), brushed brass horn caps (`#F4C542`), amber eye gem (`#FF9F1C`). | Embeds Ember's slit amber Wake Eye in the centre third (`opens wider on hits 1 -> 2 -> 3` of the Ram streak) with brass crescent horn tips on the ends. | **Clear Chapter 12 (Dragon's Hoard)** on any difficulty (`ember` trophy skin). | **Cosmetic only** (warm dragon snort puff + gold star glints on Ram launch). |

### 2. Four Unlockable Swords for Prince Kit (Centre-Third Inlay + Hero/Ram Slash)

| ID (`new: true`) | Sword Name | Materials & Hex Colours | How It Changes Paddle & Kit's Animation | Unlock Condition | Cosmetic or Tiny Fair Perk |
|---|---|---|---|---|---|
| `sword-courtyard` | **Courtyard Gladius** | Polished steel short-blade (`#DCE6F7`), cobalt knight crossguard (`#3FA8F5`), coral cloth grip wrap (`#FF6F61`), brass pommel (`#F4C542`). | Mounts a clean cobalt winged crossguard across the `33.3`-unit centre third with 3 steel rivet pips; Kit raises it in his Face Orb cheer pose. | **Unlocked from Start** (Kit's childhood courtyard weapon from K10). | **Cosmetic baseline** (standard `33.3`-unit centre sweet spot, `100` paddle width). |
| `sword-volt` | **Volt Rapier** | Electric-mint starglass blade (`#4CE0B3`), royal indigo basket hilt (`#22284A`), copper coil guard (`#C87D55`), white-gold spark core (`#FFDBB8`). | Insets a copper-and-mint lightning rod along the paddle's centre third; when Kit triggers `ARROWS` or `Sweet-Spot Ram`, he slashes a mint arc across the paddle. | **Earn 15 Stars** across any chapters. | **Tiny Perk:** Widens the centre Sweet-Spot Ram trigger zone by `+3` units (`33.3 -> 36.3` units) without changing paddle width (`100` units). |
| `sword-bellbreaker` | **Bellbreaker Greatsword** | Broad dark gunmetal fuller (`#3A3F55`), bevelled silver-chrome edges (`#E6EEF8`), warm bronze bell-shaped pommel (`#D98A2B`), ruby core gem (`#FF4D6D`). | Places a heavy notched bronze-and-gunmetal guard in the paddle centre; Ram launch plays a heavy two-handed overhead cleave animation and bronze chime. | **Win any 3 Chapters on Hard** difficulty. | **Tiny Perk:** Sweet-Spot Ram pushes rolling hazards (bells, counterweights, Gnash's head) back `+6` extra units on impact. |
| `sword-drakefang` | **Drakefang Blade** | Ivory dragon-horn curved blade (`#EDE3D2`), burnt-orange ceramic hilt (`#B8402F`), molten orange-gold fuller groove (`#FF8A3D`), charcoal guard (`#2A2D3E`). | Mounts two small ivory dragon fangs framing 3 glowing ember pips in the paddle centre; Ram ball gains a warm `#FF8A3D` horn trail. | **Clear Dragon's Hoard (Ch 12) with 3 Stars** (or defeat Ember on Hard). | **Tiny Perk:** Starts Floor 1 of each run with `+1` Hero Orb charge pip pre-filled (`1 / 22` Easy, `1 / 28` Medium, `1 / 34` Hard). |

## Data
```json
{
  "kind": "character",
  "name": "Kit (Unlockable Skins & Swords)",
  "role": "hero",
  "height_units": 42,
  "silhouette": "Chibi underdog knight (head 40% height) in open-face cobalt helmet with heraldic kite shield, paired with a 100x14 chrome-capped paddle featuring 3 physical centre-third sweet-spot gem pips and an inlaid sword crossguard",
  "personality": ["determined", "plucky", "inventive"],
  "materials": [
    { "part": "starglass_vanguard_paddle", "hex": "#4F9DFF", "finish": "cobalt glazed ceramic with #DCE6F7 chrome end caps and #7FD6FF prism core" },
    { "part": "gatehouse_bastion_paddle", "hex": "#9E2445", "finish": "ruby-plum boar ceramic plates with #2A2D3E gunmetal frame and #EDE3D2 ivory tusks" },
    { "part": "serpent_fang_paddle", "hex": "#168F83", "finish": "split emerald #168F83 and violet #7A3CCC glazed scale plates with #FF6FAE diamond pip" },
    { "part": "hoard_baron_paddle", "hex": "#B8402F", "finish": "burnt-orange dragon ceramic with #F3E5AB cream inlay and #FF9F1C Wake Eye gem" },
    { "part": "courtyard_gladius_sword", "hex": "#DCE6F7", "finish": "polished steel blade with #3FA8F5 cobalt guard and #FF6F61 coral grip" },
    { "part": "volt_rapier_sword", "hex": "#4CE0B3", "finish": "faceted electric-mint starglass blade with #C87D55 copper coil hilt" },
    { "part": "bellbreaker_greatsword", "hex": "#3A3F55", "finish": "dark gunmetal broadsword with #D98A2B bronze bell pommel and #FF4D6D ruby" },
    { "part": "drakefang_blade_sword", "hex": "#EDE3D2", "finish": "carved ivory dragon-horn blade with #B8402F ceramic hilt and #FF8A3D fuller" }
  ],
  "expressions": [
    {
      "id": "equip-grin",
      "game_moment": "armoury equip or 3rd sweet-spot pip armed",
      "eyes": "Bright blue-grey eyes wide with confident catch-lights",
      "brows": "One brow cocked up above his open helmet rim",
      "mouth": "Big lopsided underdog grin"
    },
    {
      "id": "ram-slash",
      "game_moment": "launching Sweet-Spot Ram or Hero Power",
      "eyes": "Narrowed focused eyes locked upward",
      "brows": "Slammed low and determined",
      "mouth": "Open battle shout as equipped sword flashes across the paddle"
    }
  ],
  "poses": [
    { "id": "armoury-showcase", "game_moment": "skin and sword preview in Kit's Armoury", "seconds": 0.0 },
    { "id": "sword-cleave", "game_moment": "0.22 s slash overlay when Sweet-Spot Ram launches", "seconds": 0.22 }
  ],
  "collision": "All 4 paddle skins preserve the exact 100x14 unit capsule collider (widening to 132x14 with WIDE) and 33.3-unit centre sweet spot (36.3 units with Volt Rapier); end-cap tusks and horns carry no protruding snag boxes",
  "sheets_needed": ["turnaround", "parts"],
  "paddle_skins": [
    {
      "id": "skin-starglass",
      "new": true,
      "name": "Starglass Vanguard",
      "colors": ["#4F9DFF", "#DCE6F7", "#7FD6FF"],
      "unlock": "Clear Chapter 2 (The Vault) on any difficulty",
      "perk": "Cosmetic only: crystalline starglass bounce chime and 3 cyan shield pips"
    },
    {
      "id": "skin-gatehouse",
      "new": true,
      "name": "Gatehouse Bastion",
      "colors": ["#9E2445", "#2A2D3E", "#EDE3D2", "#F4C542"],
      "unlock": "Clear Chapter 9 (Gatehouse Siege) on Medium or Hard",
      "perk": "Cosmetic only: curved ivory tusk end-caps and bronze bell centre chime"
    },
    {
      "id": "skin-serpent",
      "new": true,
      "name": "Serpent Fang",
      "colors": ["#168F83", "#7A3CCC", "#C9E8D2", "#FF6FAE"],
      "unlock": "Earn 24 Stars across Chapters 1 to 11",
      "perk": "Cosmetic only: dual emerald/violet scale plates and rose-diamond Ram pips"
    },
    {
      "id": "skin-hoard-baron",
      "new": true,
      "name": "Hoard Baron",
      "colors": ["#B8402F", "#2A2D3E", "#F3E5AB", "#FF9F1C"],
      "unlock": "Clear Chapter 12 (Dragon's Hoard) on any difficulty",
      "perk": "Cosmetic only: animated amber Wake Eye in paddle centre and brass horn tips"
    }
  ],
  "swords": [
    {
      "id": "sword-courtyard",
      "new": true,
      "name": "Courtyard Gladius",
      "colors": ["#DCE6F7", "#3FA8F5", "#FF6F61", "#F4C542"],
      "unlock": "Unlocked from start",
      "perk": "Cosmetic baseline (standard 33.3-unit sweet spot)"
    },
    {
      "id": "sword-volt",
      "new": true,
      "name": "Volt Rapier",
      "colors": ["#4CE0B3", "#22284A", "#C87D55", "#FFDBB8"],
      "unlock": "Earn 15 Stars across any chapters",
      "perk": "Tiny perk: +3 units to centre Sweet-Spot Ram trigger width (33.3 -> 36.3 units)"
    },
    {
      "id": "sword-bellbreaker",
      "new": true,
      "name": "Bellbreaker Greatsword",
      "colors": ["#3A3F55", "#E6EEF8", "#D98A2B", "#FF4D6D"],
      "unlock": "Win any 3 Chapters on Hard difficulty",
      "perk": "Tiny perk: Sweet-Spot Ram knocks rolling bells and serpent heads back +6 extra units"
    },
    {
      "id": "sword-drakefang",
      "new": true,
      "name": "Drakefang Blade",
      "colors": ["#EDE3D2", "#B8402F", "#FF8A3D", "#2A2D3E"],
      "unlock": "Clear Chapter 12 (Dragon's Hoard) with 3 Stars or on Hard",
      "perk": "Tiny perk: starts Floor 1 with +1 Hero Orb charge pip pre-filled"
    }
  ]
}
```

## Art requests

### Image 1: `P10_kit-unlockables_skins-swords-sheet_1.png`
```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: production sprite sheet of Prince Kit's unlockable paddle skins and swords.
Asset type: 4 columns by 2 rows grid, landscape 1536x1024, eight separate 3D toy objects, each centred in its own cell, viewed straight on, orthographic, lit from the top-left (#FFDBB8) with thick clear-coat gloss.
Top row (4 horizontal paddle skins, 7:1 capsule proportions, polished chrome end caps, and 3 physical gem pips inset into the centre third):
1. STARGLASS VANGUARD PADDLE: cobalt-blue glazed ceramic body (#4F9DFF), mirror-chrome end caps (#DCE6F7), glowing cyan starglass core bar (#7FD6FF), and three small silver lightning-shield pips in the centre.
2. GATEHOUSE BASTION PADDLE: ruby-and-plum boar armour plates (#9E2445), dark gunmetal frame (#2A2D3E), two short curved ivory boar tusks (#EDE3D2) hugging the chrome ends, and three warm brass bell rivets in the centre.
3. SERPENT FANG PADDLE: left half emerald-teal scales (#168F83), right half royal-violet scales (#7A3CCC), pale mint trim (#C9E8D2), and three faceted rose-pink diamond pips (#FF6FAE) in the centre.
4. HOARD BARON PADDLE: burnt-orange dragon ceramic scales (#B8402F), dark charcoal frame (#2A2D3E), warm cream belly inlay (#F3E5AB), brass crescent horn tips on the ends, and an amber dragon slit-eye gem (#FF9F1C) in the centre.
Bottom row (4 chunky chibi toy swords, angled at 45 degrees tip-up-left, broad readable blades with thick bevels):
5. COURTYARD GLADIUS: short broad polished steel blade (#DCE6F7), cobalt-blue winged knight crossguard (#3FA8F5), coral-red cloth grip (#FF6F61), round brass pommel.
6. VOLT RAPIER: faceted electric-mint crystal blade (#4CE0B3), copper coil guard (#C87D55), dark indigo hilt (#22284A), two sharp 4-pointed star glints.
7. BELLBREAKER GREATSWORD: heavy notched dark-gunmetal broadsword (#3A3F55) with silver-chrome bevelled edges, a ruby gem in the crossguard (#FF4D6D), and a warm bronze bell-shaped pommel (#D98A2B).
8. DRAKEFANG BLADE: curved ivory dragon-horn sword (#EDE3D2) with a glowing molten-orange fuller groove (#FF8A3D) and a burnt-orange glazed ceramic dragon-scale hilt (#B8402F).
BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers.
```

## Rules check
- Every hazard has a visible 1.2 to 1.8 s tell and is shown once safely first: **OK** — player cosmetic/unlockable spec only.
- Ordinary ball play always makes progress; no tiny weak points (min 32x16 brick), no precision puzzles, no waiting on timers or invulnerable enemies: **OK** — default `Courtyard Gladius` and default chrome paddle clear the entire game.
- Difficulty changes numbers only (harder but fair): **OK** — Hard mode wins unlock `Bellbreaker Greatsword` as a bragging-rights trophy.
- No power-up, companion or purchase is required to win; Pause, Continue, Retry keep progress: **OK** — all 8 items are earned 100% by playing (stars, chapter clears, Hard wins), never by paying.
- Enemy attacks never destroy the player's bricks to hand out rewards: **OK** — N/A.
- A single brick cracks and fades in about 0.4 s; only big crashes drop debris: **OK** — N/A.
- Effects are rendered gems, chips, sparks, dust or debris; never plain circles or rings: **OK** — replaces the flat wireframe sweet-spot rectangle on the paddle with 3 physical 3D gem pips and an inlaid crossguard.
- Mobile safe areas, 393x852 and 412x915, 44 pt touch targets, paddle above the thumb: **OK** — all paddle skins stay `100x14` units at `y = 585` (`75%` height), well above the thumb zone.
- Glossy vinyl-toy / glazed-ceramic look, dark navy background, minimal yellow: **OK** — cobalt, ruby, emerald, violet, and burnt-orange palettes with brass used strictly as a small trim accent.

## Open questions for Claude
1. How should the paddle skin widen when the player catches a `WIDE` (`100 -> 132` units) or `TINY` (`100 -> 74` units) capsule? **Recommended:** Use a 3-part horizontal nine-slice: left end-cap (`22` units fixed), centre sweet-spot crest (`34` units fixed), and two stretchable/tiled side ceramic bars (`22` units each at base `100`, expanding to `38` units each at `132`) so the chrome end-caps and centre pips never distort.
2. Where should the player equip their unlocked Paddle Skin and Sword? **Recommended:** Add a `52`-unit tall **`ARMOURY`** button at the bottom of the Chapter Select Menu (replacing the web `"Full screen"` button flagged in P5 Issue #13) that opens a clean 2-row drawer showing all 4 Paddles and 4 Swords with live unlock progress bars (`e.g. 12 / 15 STARS`).
