---
breach_drop: 1
kind: powerups
slug: powerups-new
version: 1
date: 2026-10-23
status: proposal
tool: Copilot Studio, Gemini 4 Argon
depends_on: ["powerups-round2"]
---
# BREACH P3: Six New Power-Ups & Build Synergies

## Summary
- Introduces 6 new power-up capsules (`spark`, `magnet`, `colossus`, `quake`, `orbit`, `portal`) with non-clashing hex colours, 8-letter-max labels, and exact mode numbers built on `powerups-round2` caps (`[12, 9, 5]` live balls, `[20, 18, 14] s` timer ceiling).
- Delivers the owner-requested giant unstoppable sweet-spot ball as **COLOSSUS** (`#B8336A`), which instantly arms the paddle's centre third so the very next centre hit fires a `17.5`-radius brass-horned juggernaut that crushes 1-HP and 2-HP bricks for `[4.0, 3.5, 3.0] s`.
- Ranks all 6 by fun-per-build-effort and selects the **Top 3 to build first**: **1. SPARK** (`#4CE0B3`), **2. MAGNET** (`#E85D9A`), and **3. COLOSSUS** (`#B8336A`).
- Pairs every new capsule with an existing `powerups-round2` power (`SPLIT`, `BUBBLE`, `FIRE`, `WIDE`, `LASER`, `AIM`) and gives each a clear counter-risk so no pickup plays the game automatically.
- Includes a complete K05/K07 3x3 production sprite-sheet prompt (`P03_powerups-new_icon-sheet_1.png`) covering the Top 3 physical toy icons and all 6 falling capsules on a transparent background with 10% cell margins.

## Decisions for the owner
1. Top 3 new power-ups to build first: A `SPARK` + `MAGNET` + `COLOSSUS` (highest juice-to-code ratio, zero new wall geometry needed) [RECOMMENDED] [AUTO-PICKED] | B `QUAKE` + `ORBIT` + `PORTAL` | C Build `COLOSSUS` as a Kit Hero Power instead of a capsule.
2. How `COLOSSUS` triggers: A Catching the capsule arms the paddle's centre third immediately so the next 1 centre hit launches the `17.5`-radius ball [RECOMMENDED] [AUTO-PICKED] | B Transforms the highest ball in mid-air immediately on catch | C Replaces the default 3-hit Sweet-Spot Ram permanently for the floor.
3. How `MAGNET` handles bad pickups (`TINY`) and enemy shots: A Pulls positive capsules (`110` units) and balls (`72` units), but also weakly tugs nearby `TINY` capsules (`65` units) as its counter-risk [RECOMMENDED] [AUTO-PICKED] | B Pulls balls only | C Pulls all capsules including `TINY` at full strength.

## Spec

### 1. The Six New Power-Ups (Full Specification)

| ID (`new: true`) | Label (`<=8`) | Hex Colour | Effect & Numbers per Mode `[Easy, Medium, Hard]` | Stacking Rule | Counter-Risk | Feel (Sound + Screen Juice + Last `1.5 s` Tell) | Combines With (`powerups-round2`) |
|---|---|---|---|---|---|---|---|
| `spark` | `SPARK` | `#4CE0B3` (Electric Mint) | For `[8.0, 7.0, 6.0] s`, every brick hit arcs a jagged mint-ceramic lightning bolt to `[3, 2, 2]` nearest same-colour bricks within `64` units for `1` damage each. | `adds` (`+4.0 s` up to `[20, 18, 14] s` cap; +1 chain jump on 2nd stack). | Chains only jump to matching brick colours; hitting granite or mismatched rows wastes the timer. | Crisp piezo snap; faceted mint crystal forks (`4` sharp segments, never smooth lines); crackles twice at `-1.5 s`. | `split`: **Prism Storm** — 3 split balls cross-link bolts across any brick colour within `48` units. |
| `magnet` | `MAGNET` | `#E85D9A` (Rose Magenta) | Mounts a horseshoe toy magnet on the paddle for `[10.0, 9.0, 7.0] s`; pulls falling positive capsules within `110` units (`160 units/s`) and curves descending balls within `72` units toward the centre third. | `refreshes` duration and widens capsule pull radius to `140` units. | Also tugs falling `TINY` capsules within `65` units; late ball curve can surprise players aiming for an edge cut. | Warm hum + metallic clink; rose-brass magnet tips vibrate `scale 1.0 -> 1.08`; hum drops pitch in last `1.5 s`. | `slow` (`BUBBLE`): **Gravity Dome** — balls inside the 96-unit bubble settle gently onto the centre sweet spot. |
| `colossus` | `COLOSSUS` | `#B8336A` (Crimson Plum) | Arms the paddle's centre third immediately; the next centre hit (or any hit on Easy) launches a `17.5`-radius (`35` units wide) armored juggernaut ball for `[4.0, 3.5, 3.0] s` or `[22, 18, 15]` bricks (`5` boss HP), ploughing 1-HP and 2-HP bricks. | `adds` `+1` armed charge (max `2` queued). | Moves at `0.88x` base speed (`304 units/s`) and still bounces off indestructible `#4A4F6E` granite blocks. | Deep bronze gong + anvil roar; `3.5`-unit screen shake on launch; flashes `#FFDBB8` at `6 Hz` in last `1.5 s`. | `fire`: **Inferno Colossus** — leaves a 1-row molten glaze trail that cracks adjacent bricks for `1` HP. |
| `quake` | `QUAKE` | `#C87D55` (Terracotta Bronze) | Arms the ball with `[3, 2, 2]` heavy seismic charges; each impact detonates a `3x3` brick area (`48x48` units: `2` HP to hit brick, `1` HP to 8 neighbours) and drops crash debris chips. | `adds` charges up to `[5, 4, 3]` cap. | Detonates on the first solid contact—including an indestructible granite corner—consuming a charge. | Low bass thump + ceramic crunch; 6 angular stone chips (`#4A4F6E`) and gold sparks fly out. | `aim`: **Siege Mortar** — Focus aim preview highlights the exact `48x48` unit `3x3` blast footprint. |
| `orbit` | `ORBIT` | `#8E7CC3` (Periwinkle Indigo) | Spawns `2` mini chrome satellite balls (`radius: 4.5`) orbiting the paddle in an `84x28` unit ellipse at `1.8 rev/s` for `[11.0, 9.0, 7.0] s`; satellites block enemy shots (`1` save each) and launch upward (`360 units/s`) when a Sweet-Spot Ram fires. | `refreshes` duration and restores missing satellites back to `2`. | Blocking an enemy shot consumes that satellite; orbiting balls do not count as live balls if the main ball drains. | Clockwork whir + twin bell pings; satellites dip inward `rx 42 -> 30 units, 1.5 s, easeInQuad` before expiring. | `wide`: **Bastion Ring** — widens orbit to `124x32` units and adds a 3rd satellite on Easy/Medium. |
| `portal` | `PORTAL` | `#3B6EF6` (Royal Sapphire) | Opens linked arched stone-and-brass portals on the left wall (`x: 12, y: 260`, `16x48` units) and right wall (`x: 348, y: 140`, `16x48` units) for `[10.0, 8.5, 7.0] s`; balls entering the lower gate exit the upper gate behind the brick bank at `1.15x` speed (`397 units/s`). | `refreshes` duration. | Re-emerging at `397 units/s` from `y: 140` can send a fast ball straight down an open side lane if the player isn't watching. | Resonant stargate chord; sapphire arch keystones pulse `alpha 1.0 -> 0.3, 1.5 s` before stone shutters close. | `laser`: **Warp Volley** — bolts hitting the lower portal rim ricochet horizontally across the top brick row (`y: 140`). |

### 2. Fun-per-Build-Effort Ranking

| Rank | Power ID | Build Effort for Claude | Fun Impact | Build First? | Why It Ranks Here |
|---:|---|---|---|---|---|
| **1** | `spark` | Low (nearest-neighbour query on existing brick grid + 4-segment jagged sprite) | Very High | **TOP 3 — BUILD FIRST** | Turns colour-reading in Vault and Hoard into instant chain-reaction satisfaction. |
| **2** | `magnet` | Low (radial velocity nudge on capsules `<110 u` and descending balls `<72 u`) | Very High | **TOP 3 — BUILD FIRST** | Makes Sweet-Spot Ram streaks and capsule catches feel skilful and responsive on phone screens. |
| **3** | `colossus` | Low-Medium (reuses P1 Sweet-Spot Ram collider at `r=17.5` + 2-HP pierce flag) | Very High | **TOP 3 — BUILD FIRST** | Directly fulfills the owner's request for an even bigger unstoppable sweet-spot ball. |
| **4** | `quake` | Medium (`48x48` AABB query + crash debris emitter from K07) | High | Wave 2 | Delivers big structural crashes that legally trigger physics debris under K01 rules. |
| **5** | `orbit` | Medium (elliptical satellite followers + projectile intercept + Ram launch hook) | High | Wave 2 | Great defensive/offensive toy feel for space and castle bullet-heavy chapters. |
| **6** | `portal` | Medium-High (wall aperture collider + velocity/position teleport + loop guard) | Medium-High | Wave 2 | Creates clever back-wall bank angles once core ball powers are locked. |

## Data
```json
{
  "kind": "powerups",
  "capsules": [
    {
      "id": "spark",
      "new": true,
      "label": "SPARK",
      "color": "#4CE0B3",
      "effect": "Ball hits arc a jagged mint lightning bolt to 3/2/2 nearest same-colour bricks within 64 units for 1 damage",
      "numbers": { "duration_s": 7, "duration_per_mode_s": [8, 7, 6], "count": 2, "chains_per_mode": [3, 2, 2], "range_units": 64, "stack": "adds", "cap": 18 },
      "drop_weight": { "easy": 9, "medium": 8, "hard": 6 },
      "good": true,
      "counterplay_or_cost": "Only chains to bricks of the same colour within 64 units; granite hits waste timer",
      "feel": "Piezo crystal snap, 4-segment faceted mint lightning forks, crackles twice in last 1.5 s",
      "change": "add"
    },
    {
      "id": "magnet",
      "new": true,
      "label": "MAGNET",
      "color": "#E85D9A",
      "effect": "Pulls falling positive capsules within 110 units and curves descending balls within 72 units toward paddle centre",
      "numbers": { "duration_s": 9, "duration_per_mode_s": [10, 9, 7], "count": 1, "capsule_pull_units": 110, "ball_pull_units": 72, "stack": "refreshes", "cap": 1 },
      "drop_weight": { "easy": 10, "medium": 8, "hard": 6 },
      "good": true,
      "counterplay_or_cost": "Weakly tugs nearby TINY hazard capsules within 65 units and bends late edge-cut shots toward centre",
      "feel": "Warm magnetic hum + brass clink, rose-brass horseshoe tips on paddle, pitch drops in last 1.5 s",
      "change": "add"
    },
    {
      "id": "colossus",
      "new": true,
      "label": "COLOSSUS",
      "color": "#B8336A",
      "effect": "Arms the paddle sweet spot immediately; next centre hit launches a 17.5-radius ball that ploughs 1-HP and 2-HP bricks",
      "numbers": { "duration_s": 3.5, "duration_per_mode_s": [4.0, 3.5, 3.0], "count": 1, "radius": 17.5, "bricks_per_mode": [22, 18, 15], "boss_damage": 5, "stack": "adds", "cap": 2 },
      "drop_weight": { "easy": 6, "medium": 5, "hard": 4 },
      "good": true,
      "counterplay_or_cost": "Travels at 0.88x speed (304 units/s) and bounces off indestructible granite blocks",
      "feel": "Deep bronze gong + anvil roar, 3.5-unit launch shake, flashes #FFDBB8 at 6 Hz in last 1.5 s",
      "change": "add"
    },
    {
      "id": "quake",
      "new": true,
      "label": "QUAKE",
      "color": "#C87D55",
      "effect": "Next 3/2/2 ball impacts detonate a 48x48 unit (3x3 brick) seismic shatter dealing 2 core HP and 1 neighbour HP",
      "numbers": { "duration_s": 12, "count": 2, "charges_per_mode": [3, 2, 2], "blast_units": 48, "stack": "adds", "cap": 5 },
      "drop_weight": { "easy": 7, "medium": 6, "hard": 5 },
      "good": true,
      "counterplay_or_cost": "Consumes a charge even if the ball clips an indestructible granite corner first",
      "feel": "Low bass thump + ceramic crunch, 6 angular stone chips and gold glints on each 3x3 crash",
      "change": "add"
    },
    {
      "id": "orbit",
      "new": true,
      "label": "ORBIT",
      "color": "#8E7CC3",
      "effect": "Spawns 2 mini chrome satellite balls (r=4.5) in an 84x28 paddle orbit that block enemy shots and fire on Ram launch",
      "numbers": { "duration_s": 9, "duration_per_mode_s": [11, 9, 7], "count": 2, "satellite_radius": 4.5, "stack": "refreshes", "cap": 3 },
      "drop_weight": { "easy": 8, "medium": 7, "hard": 5 },
      "good": true,
      "counterplay_or_cost": "Intercepting an enemy shot destroys that satellite; satellites do not prevent drain loss if main ball falls",
      "feel": "Clockwork whir + twin bell pings, orbit tightens (rx 42 -> 30) in last 1.5 s",
      "change": "add"
    },
    {
      "id": "portal",
      "new": true,
      "label": "PORTAL",
      "color": "#3B6EF6",
      "effect": "Opens linked left (y=260) and right (y=140) wall portals for 10/8.5/7 s that warp balls behind bricks at 1.15x speed",
      "numbers": { "duration_s": 8.5, "duration_per_mode_s": [10.0, 8.5, 7.0], "count": 2, "exit_speed_mult": 1.15, "stack": "refreshes", "cap": 1 },
      "drop_weight": { "easy": 6, "medium": 5, "hard": 4 },
      "good": true,
      "counterplay_or_cost": "1.15x exit speed (397 units/s) down an open side lane demands quick paddle tracking",
      "feel": "Resonant stargate chord, sapphire keystone arches on side walls, shutters blink in last 1.5 s",
      "change": "add"
    }
  ],
  "hero_powers": [],
  "charge": {
    "hits_to_fill": { "easy": 22, "medium": 28, "hard": 34 },
    "what_counts": "Productive ordinary ball, Ram, Colossus, or Spark chain hits on bricks/bosses (inherited from powerups-round2)"
  },
  "ram": {
    "streak_to_arm": 3,
    "radius": 15.6,
    "time_s": 3.0,
    "bricks": 18,
    "damage": 4,
    "change": "keep"
  },
  "drop_rules": {
    "base_chance": { "easy": 0.16, "medium": 0.13, "hard": 0.10 },
    "pity_after_breaks": 8,
    "max_falling": 2
  },
  "synergies": [
    { "a": "spark", "b": "split", "result": "Prism Storm: split balls cross-link mint lightning bolts across any brick colour within 48 units" },
    { "a": "magnet", "b": "slow", "result": "Gravity Dome: balls entering the 96-unit BUBBLE are gently guided straight onto the centre sweet spot" },
    { "a": "colossus", "b": "fire", "result": "Inferno Colossus: the 17.5-radius juggernaut leaves a molten glaze wake that cracks adjacent bricks for 1 HP" },
    { "a": "quake", "b": "aim", "result": "Siege Mortar: Focus aim trajectory line projects a glowing 48x48 unit 3x3 impact footprint on target bricks" },
    { "a": "orbit", "b": "wide", "result": "Bastion Ring: expands satellite orbit to 124x32 units and spawns a 3rd chrome satellite on Easy/Medium" },
    { "a": "portal", "b": "laser", "result": "Warp Volley: laser bolts clipping the lower portal rim ricochet horizontally across the top brick row at y=140" }
  ]
}
```

## Art requests

### Image 1: `P03_powerups-new_icon-sheet_1.png`
```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: production sprite sheet of new power-up icons and falling capsules.
Asset type: 3 columns by 3 rows, landscape 1536x1024, nine separate 3D objects, each centred in its own cell with a strong silhouette that reads at 48 px. Lit from the top-left (#FFDBB8) with thick clear-coat highlights.
Top row (Top 3 physical power icons):
1. SPARK ICON: a chunky faceted electric-mint crystal fork (#4CE0B3) set in a small copper coil cap with two sharp 4-pointed star glints.
2. MAGNET ICON: a glossy rose-magenta horseshoe toy magnet (#E85D9A) with polished chrome pole tips and two tiny chrome ball bearings clinging to the tips.
3. COLOSSUS ICON: a giant crimson-plum glazed armour sphere (#B8336A) with heavy twin brass siege horns and a bevelled steel brow plate.
Middle and bottom rows (6 horizontal falling capsules, 1.85:1 aspect ratio, brushed steel end caps, coloured glossy body, thick clear coat, one small embossed symbol in the centre, no letters):
4. SPARK CAPSULE: electric mint #4CE0B3 body, embossed jagged fork bolt symbol.
5. MAGNET CAPSULE: rose magenta #E85D9A body, embossed horseshoe symbol.
6. COLOSSUS CAPSULE: crimson plum #B8336A body, embossed horned sphere symbol.
7. QUAKE CAPSULE: terracotta bronze #C87D55 body, embossed cracked brick symbol.
8. ORBIT CAPSULE: periwinkle indigo #8E7CC3 body, embossed two small satellite dots flanking a paddle bar (no thin ring).
9. PORTAL CAPSULE: royal sapphire #3B6EF6 body, embossed stone arch keystone symbol.
BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers.
```

## Rules check
- Every hazard has a visible 1.2 to 1.8 s tell and is shown once safely first: **OK** — none of the 6 new pickups create hidden enemy hazards; `MAGNET`'s tug on `TINY` acts on a capsule that already falls for `>4.0 s`.
- Ordinary ball play always makes progress; no tiny weak points (min 32x16 brick), no precision puzzles, no waiting on timers or invulnerable enemies: **OK** — all 6 are optional build accelerators.
- Difficulty changes numbers only (harder but fair): **OK** — mode scaling adjusts durations (`[8, 7, 6] s`), chain counts (`[3, 2, 2]`), and Colossus brick caps (`[22, 18, 15]`).
- No power-up, companion or purchase is required to win; Pause, Continue, Retry keep progress: **OK** — all 6 capsules drop from bricks via the standard `powerups-round2` table.
- Enemy attacks never destroy the player's bricks to hand out rewards: **OK** — `ORBIT` satellites only block enemy shots, never triggering enemy brick breaks.
- A single brick cracks and fades in about 0.4 s; only big crashes drop debris: **OK** — `SPARK` single-damage chains use the `0.4 s` crack-and-fade; only `QUAKE`'s `3x3` structural crash and `COLOSSUS` multi-brick ploughs spawn chip debris.
- Effects are rendered gems, chips, sparks, dust or debris; never plain circles or rings: **OK** — `SPARK` uses 4-segment faceted crystal forks, `QUAKE` uses angular stone chips, and `ORBIT` uses 2 solid mini chrome balls without drawn orbit rings.
- Mobile safe areas, 393x852 and 412x915, 44 pt touch targets, paddle above the thumb: **OK** — `PORTAL` arches sit at `y = 140` and `y = 260`, well above the `60–74%` empty reaction lane.
- Glossy vinyl-toy / glazed-ceramic look, dark navy background, minimal yellow: **OK** — zero yellow added (`#4CE0B3`, `#E85D9A`, `#B8336A`, `#C87D55`, `#8E7CC3`, `#3B6EF6`).

## Open questions for Claude
1. To prevent an infinite teleport loop with `PORTAL`, should a warped ball have a short re-entry cooldown? **Recommended:** Yes, apply a `0.60 s` portal immunity tag after exit and give the exit velocity a `-12 deg` downward bias so it always enters the brick bank.
2. Does `SPARK` chain damage count toward filling the Hero Orb charge meter? **Recommended:** Count the primary ball hit as `1` full charge hit and cap `SPARK` arcs at `+1` bonus charge hit per bounce so a single hit into a colour cluster cannot instantly fill the orb.
3. If `COLOSSUS` is armed on the paddle at the same time as a 3-streak Sweet-Spot Ram, which one fires? **Recommended:** Fire `COLOSSUS` (`r = 17.5`, `5` boss HP) and preserve `2/3` of the Ram streak so the player can follow up with a standard Ram two hits later.
