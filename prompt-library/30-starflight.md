# 30 - Starflight (starfighter campaign)

Purpose: prompts for the Starflight prototype and its proposed six-chapter campaign: ships, enemies, destruction pieces, backgrounds, weapons and power-ups. Starflight is a separate vertical scrolling shooter (drag to fly, automatic fire, one reactor orb). It is not part of the five-chapter Android release, and the campaign in `docs/STARFLIGHT_CAMPAIGN.md` is a **proposal**. Keep this consistent with `docs/STARFLIGHT_ART.md`, `docs/STARFLIGHT_COMBAT.md` and `docs/STARFLIGHT_CAMPAIGN.md`.

Use with references 20, 21 and 22 from `references.md`. Do **not** use the vinyl-toy block from `00-style-block.md` for ships; use the Starflight block below (the dark, calm, readable rules from the style block still apply).

## What Starflight looks like

Existing Starflight art "shares the glossy ceramic, machined dark metal, bevels and controlled emission of the approved space artwork". It has no companions or princess imagery. Real production prompt wording (`art/starflight/production.json`): "dimensional bevelled metal, glossy ceramic plates, recessed dark seams, cyan glass and controlled coral/magenta emission", "orthographic almost top-down camera, very slight 3D angle", "consistent soft studio key from upper left", "crisp readable silhouettes at phone size", "no pixel art, no flat geometric symbols, no humanoids or companions".

| Item | Rule |
|---|---|
| Player ship | Points **UP**. White ceramic and blue-grey chrome, bright **cyan** glass and accents; swept short wings, wedge nose, twin compact rear engines, two forward barrels |
| Enemy ships | Point **DOWN**. Graphite and slate-violet ceramic and steel, **coral-red** armour, subdued violet cockpits, hot small **magenta** vents. Each class has a different silhouette, not a recolour |
| Weapons | Player fire cyan; enemy fire coral-magenta; hyper violet; stasis teal; compact solid cores with short tapered tails; readable at 24 to 64 pixels |
| Background | Nearly black midnight navy; dim desaturated violet and teal nebula only at the far left and right edges; the central 70 percent calm and dark; top and bottom edges match so it scrolls seamlessly |
| Never | No brick-breaker arch or empty hangar rectangle; no long flat beams or ring icons; no humanoids, companions, princess; no text; no bright sun, planets, nebula or streaks that look like projectiles |

## Sizes (world units on a 360-unit-wide field; real values)

| Sprite | Runtime pixels | World size (width x height) | Direction |
|---|---:|---|---|
| Player interceptor | 320 x 288 | 52 x 46.8 | Up |
| Scout | 256 x 288 | 40 x 45 | Down |
| Heavy gunship | 448 x 384 | 74 x 63.43 | Down |
| Dreadnought (boss) | 768 x 576 | 196 x 147 | Down |
| Beetle / frigate / crescent guardian | 40 / 74 / 196 units wide (runtime 320 x 288, 448 x 320, 768 x 544) | proportional | Down |
| Equipment and power icons | 192 x 192 | about 32 units | n/a |
| Weapon and effect cells | 256 x 256 (8 px transparent border) | 24 to 64 units | n/a |

Hit-shape reminders for the physics side: the player has a forgiving **7-unit hostile-shot core**; hull outlines, not padding, are collision; an open notch (the crescent's) stays empty. Generate the ship with its barrels at the real tips (each enemy: scout one muzzle, gunship two, dreadnought three; player two).

## Starflight style block (paste first)

```text
Premium portrait vertical-scrolling starship game art. Physically rendered, dimensional bevelled metal, glossy ceramic plates, recessed dark seams, cyan glass, controlled coral and magenta emission with bounded glow. Orthographic almost top-down camera with a very slight 3D angle. Consistent soft studio key light from the upper left, cool fill from the right. Rich metallic mass, deliberate roughness variation, specular reflections, crisp readable silhouettes at phone size. Dark calm values; gameplay objects dominate. No pixel art, no flat geometric symbols, no flat cartoon fills, no humanoids or companions, no text, no UI.
```

## Template 1: ship sprite sheet (the layout that already works)

This is the proven layout (`art/starflight/production.json`): the extraction script finds each object by its alpha, so keep the grid and padding exactly.

```text
[STARFLIGHT STYLE BLOCK]

Production SPRITE SHEET for a premium portrait vertical-scrolling starship combat game. The attached images are STYLE REFERENCES ONLY: match their dimensional bevelled metal, glossy ceramic plates, recessed dark seams, cyan glass and controlled coral/magenta emission. Create NEW ship designs, not copied crops. Fully TRANSPARENT real alpha background, no floor, no black rectangle, no checker pattern, no text, no labels, no UI, no board border.
TECHNICAL LAYOUT: square 2048 x 2048, TWO equal columns and THREE equal rows, spacious transparent gutters. One complete independent object per cell; objects never cross gutters. Keep 10 percent transparent padding inside every cell. Cell centres: left and right 25 and 75 percent, row centres 16.7, 50 and 83.3 percent.
Cells: [CELL 1], [CELL 2], [CELL 3], [CELL 4], [CELL 5], [CELL 6].
Every ship is a complete mobile starship seen from above, strong silhouette, not a flat icon. Enemy ships point precisely DOWN, player ships precisely UP. Each enemy has genuine physical gun muzzles at its barrel tips, rear engines opposite its heading. No exhaust or glow baked into the hull.
Consistency: same materials, light and scale logic as the attached references; sizes relative to each other as in the table of 30-starflight.md.
```

### Worked example: Relay Drift shieldship set (campaign chapter 2)

Chapter 2 needs a shieldship that "rotates its protected face", with frontal shield reducing damage to 50 percent, and visible breakup: "Shield collapse, unequal halves separate over 0.9 s... Collar, 2 broken halves, exposed centre." One sheet gives all pieces.

```text
Premium portrait vertical-scrolling starship game art. Physically rendered, dimensional bevelled metal, glossy ceramic plates, recessed dark seams, cyan glass, controlled coral and magenta emission with bounded glow. Orthographic almost top-down camera with a very slight 3D angle. Consistent soft studio key light from the upper left, cool fill from the right. Crisp readable silhouettes at phone size. Dark calm values. No pixel art, no flat shapes, no humanoids, no text, no UI.

Production SPRITE SHEET for chapter 2, "Relay Drift", of a premium portrait vertical-scrolling starship game. The attached images are STYLE REFERENCES ONLY: match their dimensional bevelled metal, glossy ceramic plates, recessed dark seams, cyan glass and coral/magenta emission. Create NEW designs. Fully TRANSPARENT real alpha background, no floor, no black rectangle, no checker pattern, no text, no labels.
TECHNICAL LAYOUT: square 2048 x 2048, TWO equal columns and THREE equal rows, spacious transparent gutters, one complete independent object per cell, 10 percent transparent padding inside every cell.
Cells: top left: SHIELDSHIP HULL pointing DOWN, a broad wide-nosed armoured ship carrying a curved front shield plate (a smooth coral-edged ceramic arc with a faint cyan-lit inner edge) about as wide as the hull, graphite and slate-violet body, three rear engines at the top, two compact gun muzzles at the lower left and right, about 74 units wide at game scale. Top right: the SHIELD COLLAR alone, the curved plate with its mount frame, same colours, so it can rotate separately. Middle left: BROKEN LEFT HALF of the shieldship, torn along an irregular bright-edged break, interior plates visible. Middle right: BROKEN RIGHT HALF, a different irregular break (not a mirror). Bottom left: EXPOSED CENTRE reactor block with a faceted violet core in a dark socket, damaged. Bottom right: a RELAY EMITTER, a compact pylon-mounted antenna array at least 44 units wide at game scale, graphite with a cyan lens and one coral warning tab; this is a separate enemy.
No exhaust, no glow baked into the hulls; no ground, no stars. Each part complete, uncropped, with clean silhouettes.
Consistency: same materials, light and scale logic as the attached reference ships (scout, gunship, dreadnought, crescent guardian).
```

Attach: `art/starflight/native-extraction-proof.png`, `art/starflight-v2/native-extraction-proof.png` (shows the beetle, frigate, crescent).

## Template 2: enemy family by role

From `docs/STARFLIGHT_CAMPAIGN.md`, each enemy role has its own movement and its own death. Prompt per role, and always the matching destruction pieces.

| Role | Silhouette idea | Death sheet to request |
|---|---|---|
| Interceptor | Small curved dart, swept fins; bank left, neutral, right | 3 bank views, 3 wreck pieces; 3 unequal chips |
| Missile frigate | Long broad hull with two side racks, bay between | Open bay, 3 rack layers, torn plate; rack-disabled left and right |
| Shieldship | See the worked example | Collar, two unequal halves, exposed centre |
| Crescent hunter | Wide crescent with an empty central notch (the notch is empty) | Failed collar, damaged centre, 2 lobe parts |
| Asteroid / rock | Ferric rock, irregular | 4 irregular pieces |
| Tug and reel (chapter 3) | Small tug with a cable reel and a cable | Tug hull, reel, reel broken, cable |
| Foundry or capital | Huge industrial hull with external armour banks, an external reactor | Bank left, bank right, broken banks, reactor intact and disabled, wreck pieces |

```text
[STARFLIGHT STYLE BLOCK]

Production SPRITE SHEET of the [ROLE] family, 2048 x 2048, TWO columns x THREE rows, transparent real alpha, 10 percent padding in every cell, one independent object per cell: [LIST OF PIECES]. Orientation DOWN for enemies. Silhouette: [SILHOUETTE IDEA]; clearly different from the attached ships. Pieces are large, clean, unequal, physically plausible, with bright torn metal edges and visible interior plates; no dust or smoke baked in; no fire sprites. [DESTRUCTION NOTE: the open notch stays empty / disabled parts look disabled, not a glow over an intact gun].
Consistency: same materials, light and scale logic as the attached references.
```

## Template 3: backgrounds (vertical scroll)

```text
Create a finished 1024 x 2048 portrait BACKGROUND TEXTURE for a premium vertical scrolling space shooter, [CHAPTER NAME: mood]. Nearly black midnight navy, soft extremely dim desaturated [VIOLET AND TEAL / COPPER AND SLATE / ICE BLUE] [NEBULA / DEBRIS FIELD / FOUNDRY TRENCH WALLS] only at the far left and right edges, sparse tiny distant stars. Central 70 percent of the image is calm, very dark open space so small ships, bullets and warning effects remain clearly readable. Subtle depth and physically shaded faint dust, rich smooth colour gradations, not a flat solid fill. No bright white nebula, no sun, no large foreground planet, no ringed planet, no ships, no characters, no text, no HUD, no panels. Do not add bright long streaks or thick lines that resemble projectiles. Top and bottom must both fade gently toward the same near-black value so a slow continuous vertical crossfade scroll will be unobtrusive. Entire image opaque, professionally rendered, quiet and restrained; the gameplay foreground must dominate.
```

Chapter looks (each different but dark): 1 Breakwater: orbital wreck edge, grey-violet wreckage silhouettes far left and right; 2 Relay Drift: offset station pylons as dim dark silhouettes at the edges, teal glints; 3 Glassbelt: ferric asteroid channel, dim rust-grey rocks at the edges; 4 Fold Sea: sparse gravity shoals, faint indigo ripples at the edges; 5 Foundry Crown: industrial trench walls, deep slate with dim coral seams at the extreme edges; 6 Dawn Corridor: jump causeway, a very faint cool dawn glow at the far bottom edge, silent fleet silhouettes.

## Template 4: weapons and effects sheet

The existing weapon family: six cells, 3 x 2, 256 x 256 after extraction: upward cyan heavy plasma, downward coral enemy round, upward violet hyper round, cyan muzzle starburst, orange mechanical plasma explosion, teal crystalline stasis burst.

```text
Create a production weapon effects sprite sheet for a premium top-down mobile space shooter. Exactly [N] isolated effects in a [3 x 2] grid with a transparent background and generous spacing: [LIST]. Glossy dimensional rendering, brilliant cores, short turbulent tails, readable at 24 to 64 pixels. Cyan = player, coral-magenta = enemy, violet = hyper, teal = stasis. Projectiles point along their travel direction (player fire up, enemy fire down). The core is small and solid; no long flat beams, no ring icons, no perfectly uniform white rays. No text, labels, UI or ships.
```

For destruction effects: "irregular hot coral and gold explosion with a molten bright knot, volumetric flame lobes, transparent wispy outside, no circular icon ring; engine exhaust: a cyan-white flame pointing DOWN from a narrow upper nozzle origin, bounded tapered plume, blue-violet fringe; no ship or metal nozzle in these two cells".

## Template 5: power-up and equipment icons

Seven temporary reactor choices plus pickups. Existing 192 x 192 icons: laser, hyper, seeker, spiral, drones, nova, stasis, repair, shield, missile, drone.

| Power | What it does | Icon idea |
|---|---|---|
| Lance | Alignment: a piercing line shot | A slender lance of cyan light with a bright tip |
| Seekers | Mobility: homing missiles | Three small finned missiles curving inward |
| Spiral | Coverage: a corkscrew pattern | A tight spiral of coral rounds |
| Drones | Interception: two small helper drones | Two round drones in orbit |
| Nova | Local emergency burst | A faceted star burst of petals |
| Hyper | A brief burst | A stack of violet rounds |
| Stasis | Route management: slows declared motion | A teal crystalline snowflake |
| Pickups | repair, shield, rapid, charge | A wrench-like plate, a shield arc, a double chevron, a battery cell |
| Ordinary presets (proposed) | Needle, Fan, Rail | Three barrel insets: one line, a fan of three, two thick rails |

```text
[STARFLIGHT STYLE BLOCK]

A set of [N] equipment icons for a starship shooter: [LIST: NAME, ICON IDEA]. Each is a single glossy dimensional metal-and-ceramic object with a bright controlled emission accent, a strong simple silhouette, centred, front view, readable at 32 pixels, lit from the upper left. Same lighting, scale and finish across the set; accent colours cyan for player, violet for hyper, teal for stasis, coral for hostile. Transparent background, [3 x 3] grid of equal cells in a 2048 x 2048 image, one icon per cell with 10 percent padding, no card, no frame, no label, no text.
Consistency: match the attached arsenal icons.
```

## Template 6: the campaign design text prompt

A text prompt (no images) for a new chapter, aligned with `docs/STARFLIGHT_CAMPAIGN.md`.

```text
You are the lead designer for BREACH Starflight, a portrait vertical-scrolling shooter (drag to fly, automatic fire, one reactor orb, seven earned reactor choices: Lance, Seekers, Spiral, Drones, Nova, Hyper, Stasis; ordinary firing presets Needle, Fan and Rail). Field 360 units wide, authored distance director 32 units/s. Player hull is 52 units wide with a 7-unit hostile-shot core. Modes: Easy/Medium/Hard hull 6/5/4, hostile speed ceiling 175/210/240 units/s, basic muzzle tell 1.30/1.15/1.00 s, hostile shot cap 22/32/42. Rules: every objective has a no-reactor route (Needle); nothing fires before completing its visible entry; every warning locks to a real moving port and has a reachable safe interval for the full ship footprint; required openings at least 112 units wide; killed things become harmless wrecks; no invisible deadline, forced grind, or endless replacement wave; rescue is optional, never a requirement; a quiet passage precedes every peak; no WAVE N labels.
Story: Admiral Veyr has turned the jump network into a blockade supplying an automated foundry; three offset crimson slashes mark his ships.
Design chapter [N: NAME] with verb [VERB]. Output: (1) win and fail conditions; (2) the authored sequence with approximate distance in units; (3) every enemy role with HP for Easy/Medium/Hard, speed, tell, what disabling it removes; (4) the decision the player makes; (5) target duration and an intensity curve like 0.15 to 0.45 to 0.10 to 0.65 to 0; (6) the asset checklist (new pieces only, with file-name pattern chNN/<name>); (7) test cases for the fairness rules; (8) open questions. Numbers in units and seconds; no TBD in tables.
```

## Output spec

| Output | Spec |
|---|---|
| Ship or role sheet | 2048 x 2048 PNG, transparent, 2 x 3 grid, 10 percent padding, ships oriented as above, no text |
| Weapon sheet | 1536 x 1024 or 2048 x 1365 PNG, transparent, 3 x 2 grid |
| Icon sheet | 2048 x 2048 PNG, transparent, 3 x 3 grid |
| Background | 1024 x 2048 PNG, opaque, seamless top and bottom |
| Hand-back note | Cell order (row, column, name); chapter and role; chroma colour if used |

Filing: `art/starflight-campaign/chNN/` (source image, prompt `.txt`, extraction script), runtime in `assets/starflight-campaign/chNN/` with a manifest recording pivots, muzzles and engines (normalised to the canvas), hashes and measured collision hulls. Follow `art/starflight/extract.py`: it labels the alpha islands, keeps bounded soft edges, normalises without stretching, strips PNG metadata and zeroes fully transparent RGB. Collision is authored separately from the pictured hull.
