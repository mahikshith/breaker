# 50 - Starflight (the space mode, "Starfighter")

Starflight is our vertical scrolling space shooter: one finger drags the player ship, it fires automatically, enemies and bosses come down the screen, and a reactor orb gives earned special powers. It shares the glossy look of the rest of BREACH but has its own ship language. Start every prompt here with the **space preamble** (already pasted below), not the character one.

## The look

- Player craft: white and pale ceramic armour over dark machined gunmetal, vivid cyan glass cockpit, small controlled cyan engine glow.
- Enemy craft: graphite or slate with coral-red or plum plating, violet reactor cells, small magenta vents.
- Bosses: bigger, heavier, a visible reactor in a mechanical socket, and (campaign motif) three offset crimson slashes on batteries, relay hulls and the capital ship, which foreshadow Admiral Veyr.
- Camera: orthographic, near top-down, a very slight 3D tilt. Light from the top-left, like everything else.
- Background: nearly black midnight navy with very dim violet and teal at the edges; the middle 70% is calm open space so small ships, bullets and warnings stay readable. No bright planets, no big nebulae, no long streaks that look like projectiles.
- Effects: textured and bounded. No long laser beams, no perfect circles or rings.

## What exists now (do not redesign these; match them)

| Thing | Notes |
|---|---|
| Player interceptor | faces UP, 52 x 46.8 units on a 360-unit width, two forward barrels, twin rear engines |
| Scout | faces DOWN, 40 x 45, one gun |
| Heavy gunship | faces DOWN, 74 x 63, two gun barrels |
| Dreadnought boss | faces DOWN, 196 x 147, three guns, violet reactor |
| Beetle interceptor | DOWN, 40 wide, paired gun mandibles |
| Missile frigate | DOWN, 74 wide, two three-tube missile racks |
| Crescent siege cruiser | DOWN, 196 wide, open notch between its wing tips (the notch stays EMPTY) |
| Iron asteroid, gravity vortex, wormhole | hazards |
| Stormwing | the player body plus two detachable wings (thunder sweep) |
| Equipment | laser, hyper, seeker, spiral/trident, drones, nova, stasis, repair, shield, missile |

Attach `examples/starflight-ships.png` to every prompt below so the new art matches.

## Delivery for every Starflight sheet

- Transparent PNG (or flat magenta #FF00FF if your tool cannot do transparency), no baked shadows, no baked exhaust, no baked projectiles.
- 2 columns by 3 rows (or 3 by 3), generous gaps, at least 10% empty margin in every cell, nothing crossing a cell edge.
- Player ships point UP. Enemy ships point DOWN. Rear engines on the back end.
- Draw each barrel tip, missile tube and engine nozzle as a distinct, clearly visible hardpoint on solid metal (we put muzzles there).
- Never fill an open notch (the crescent's gap) and never add a decorative ring.
- Ask for 2048x2048 where the tool allows it; we shrink to the runtime size (player 192-320 px wide, enemies 128-512 px, capital ships up to 640 px wide, projectiles 96-128 px).

## S1. Ship and enemy-family sheet

Attach: `examples/starflight-ships.png`. Replace the six lines to make a new family. The default below is a new set of enemy roles from the campaign.

```
HOUSE STYLE FOR SPACE (match exactly): premium glossy 3D-rendered spacecraft. Player craft: white and pale ceramic armour plates over dark machined gunmetal, crisp bevels, recessed dark panel seams, vivid cyan glass cockpit and small controlled cyan engine glow. Enemy craft: graphite or slate metal with coral-red or plum ceramic plating, violet reactor cells and small magenta vents. Orthographic near-top-down camera with a very slight 3D tilt. One soft warm key light from the top-left, cool fill, faint pink bounce; reflections stay inside the machinery and glows stay small and bounded. Very dark midnight-navy space that is never brighter than the ships. Minimal yellow. NOT: pixel art, flat vector icons, cartoon flat fills, huge bloom, long laser beams, perfect circle or ring icons, text, labels, UI.

Use case: production sprite sheet.
Asset type: a coherent sprite sheet for a premium portrait vertical scrolling starship game: exactly SIX isolated ships on a transparent background, in TWO columns by THREE rows with broad empty gutters, square 2048x2048. The attached picture is a STYLE REFERENCE ONLY: match its bevelled metal, glossy ceramic plates, recessed seams and lighting, but design NEW ships, not copies.
Camera: consistent near-orthographic top-down, very slight 3D tilt, soft studio key from the upper left. All ENEMY ships point DOWN with rear engines at the TOP of each cell. No exhaust, no projectiles and no shadows baked in.
Top left: SHIELDSHIP. A broad wedge hull carrying a large curved front shield plate of dark ceramic with a glowing violet seam; it rotates its protected face. Two small gun ports at the lower corners.
Top right: EMITTER. A compact ship with a ring-less crown of three tall antenna prongs and a violet coordination crystal at the centre; thin body, two small thrusters, one downward gun.
Middle left: TOW TUG. A stubby heavy hull with a big winch reel at the rear and a hooked arm, coral hazard panels, two short guns.
Middle right: INTERCEPTOR. A fast, slim, swept dart with a coral nose, graphite wings and two thin gun barrels; it is the committed-dive ship.
Bottom left: COMMAND FRIGATE. A long rectangular artillery hull with two armoured launch racks (three open tubes each) on the sides and a small bridge tower; three small crimson slashes painted on the hull.
Bottom right: MINE LAYER. A round-shouldered chunky hull with a belly hatch and four little mines clamped under its wings (mines are small spiky spheres with a violet light).
Every ship has a unique silhouette, strong at 40 px wide, dimensional machined metal, no flat vector shapes, no text.
BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers.
```

## S2. Boss (one big ship per image)

Attach: `examples/starflight-ships.png`. Use this for the Dreadnought redesign, the Foundry Crown, or the Dawn Corridor capital ship.

```
HOUSE STYLE FOR SPACE (match exactly): premium glossy 3D-rendered spacecraft. Player craft: white and pale ceramic armour plates over dark machined gunmetal, crisp bevels, recessed dark panel seams, vivid cyan glass cockpit and small controlled cyan engine glow. Enemy craft: graphite or slate metal with coral-red or plum ceramic plating, violet reactor cells and small magenta vents. Orthographic near-top-down camera with a very slight 3D tilt. One soft warm key light from the top-left, cool fill, faint pink bounce; reflections stay inside the machinery and glows stay small and bounded. Very dark midnight-navy space that is never brighter than the ships. Minimal yellow. NOT: pixel art, flat vector icons, cartoon flat fills, huge bloom, long laser beams, perfect circle or ring icons, text, labels, UI.

Use case: production sprite of a boss ship.
Asset type: ONE complete ship, centred on a transparent canvas, 1536x1024 landscape, pointing DOWN (rear engines at the top of the picture). Complete, uncropped, with at least 8% empty margin around it.
Boss: [NAME, e.g. FOUNDRY CROWN: an industrial siege machine; or DAWN CORRIDOR CAPITAL SHIP: the commander's flagship].
Design: [DESCRIPTION: overall silhouette, e.g. "a broad angular armoured warship with crescent swept wings and thick machined slabs"], a faceted violet reactor set into a mechanical socket on the centre line (a genuinely EXTERIOR core, never behind an opaque lip), [NUMBER] distinct gun barrels at the lower bow, [NUMBER] separately armoured side banks that can be broken off, two rear engines. Three small offset crimson slashes on one armour plate (Admiral Veyr's mark).
It must read as a complete mobile starship, not a ring and not a gate. Strong, imposing silhouette, dimensional machined metal with deliberate roughness variation, readable at 200 px wide.
No exhaust flame, no shadows, no projectiles, no text.
BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers.
```

## S3. Asteroids, debris and space hazards

Attach: `examples/starflight-ships.png`.

```
HOUSE STYLE FOR SPACE (match exactly): premium glossy 3D-rendered spacecraft. Player craft: white and pale ceramic armour plates over dark machined gunmetal, crisp bevels, recessed dark panel seams, vivid cyan glass cockpit and small controlled cyan engine glow. Enemy craft: graphite or slate metal with coral-red or plum ceramic plating, violet reactor cells and small magenta vents. Orthographic near-top-down camera with a very slight 3D tilt. One soft warm key light from the top-left, cool fill, faint pink bounce; reflections stay inside the machinery and glows stay small and bounded. Very dark midnight-navy space that is never brighter than the ships. Minimal yellow. NOT: pixel art, flat vector icons, cartoon flat fills, huge bloom, long laser beams, perfect circle or ring icons, text, labels, UI.

Use case: production sprite sheet of space hazards.
Asset type: 3 columns by 3 rows, square 2048x2048, nine separate objects on a transparent background with wide gutters, seen from the same near-top-down camera, lit from the top-left.
Row 1: three IRON ASTEROIDS of different sizes (large, medium, small): dense charcoal cratered rock, angular asymmetrical outline, a few deep fissures with dim burnt-violet or copper mineral glow, a lit top-left edge. No circle outline, no gemstone facets.
Row 2: FRAGMENTS: three small chunky rock fragments each with a different shape; plus a broken tow cable with a hook. All harmless looking.
Row 3: a GRAVITY VORTEX source (a dark centre with an asymmetric violet and indigo dust funnel, folded volumetric cloud, irregular textured outline, not a flat glowing circle); a WORMHOLE source (a folded space tunnel with a dark centre and a warped plum-and-silver dust rim, broken swirling depth layers, clearly different from the vortex, no doorway frame); a SALVAGE CRATE (a dented dark-metal cargo box with a coral stripe).
No text, no labels, no rings.
BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers.
```

## S4. Pickups and equipment

Attach: `examples/power-icons.png` (for the "physical object" style) and `examples/starflight-ships.png`.

```
HOUSE STYLE FOR SPACE (match exactly): premium glossy 3D-rendered spacecraft. Player craft: white and pale ceramic armour plates over dark machined gunmetal, crisp bevels, recessed dark panel seams, vivid cyan glass cockpit and small controlled cyan engine glow. Enemy craft: graphite or slate metal with coral-red or plum ceramic plating, violet reactor cells and small magenta vents. Orthographic near-top-down camera with a very slight 3D tilt. One soft warm key light from the top-left, cool fill, faint pink bounce; reflections stay inside the machinery and glows stay small and bounded. Very dark midnight-navy space that is never brighter than the ships. Minimal yellow. NOT: pixel art, flat vector icons, cartoon flat fills, huge bloom, long laser beams, perfect circle or ring icons, text, labels, UI.

Use case: production sprite sheet of equipment objects.
Asset type: 3 columns by 3 rows, 2048x2048, nine separate isolated objects on a transparent background with at least 12% margin each, orthographic top view, glossy dimensional dark titanium and white ceramic, readable at 32 to 72 px, restrained glows, no flat pictograms, no text, no plus or minus signs.
1. POWER CAPSULE CRADLE: a compact dark-metal rounded hexagon with white armoured corner clasps, tiny violet corner lamps and a flat dark EMPTY socket in the middle for an icon overlay.
2. LASER: twin cyan rail-lance barrels.
3. HYPER: a violet hyper cannon.
4. SEEKER: a pair of coral homing missiles.
5. TRIDENT: three slim emerald guided missiles fanned.
6. DRONES: two small cyan escort drones.
7. NOVA: an orange nova bomb in a segmented shell.
8. STASIS: a teal cryogenic stasis generator.
9. REPAIR CAPSULE: an emerald repair capsule with a small cross-free service symbol (a wrench shape).
BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers.
```

## S5. Projectiles and explosions

```
HOUSE STYLE FOR SPACE (match exactly): premium glossy 3D-rendered spacecraft. Player craft: white and pale ceramic armour plates over dark machined gunmetal, crisp bevels, recessed dark panel seams, vivid cyan glass cockpit and small controlled cyan engine glow. Enemy craft: graphite or slate metal with coral-red or plum ceramic plating, violet reactor cells and small magenta vents. Orthographic near-top-down camera with a very slight 3D tilt. One soft warm key light from the top-left, cool fill, faint pink bounce; reflections stay inside the machinery and glows stay small and bounded. Very dark midnight-navy space that is never brighter than the ships. Minimal yellow. NOT: pixel art, flat vector icons, cartoon flat fills, huge bloom, long laser beams, perfect circle or ring icons, text, labels, UI.

Use case: production sprite sheet of weapon effects.
Asset type: exactly SIX isolated effects in a 3x2 grid on a transparent background with generous spacing, square 2048x2048: an upward cyan heavy plasma bolt; a downward coral enemy round; an upward violet hyper round; a cyan muzzle starburst; an orange mechanical plasma explosion with irregular volumetric lobes; a teal crystalline stasis burst.
Glossy dimensional rendering, a small solid bright core and a short turbulent tail, textured light, readable at 24 to 64 px. No long flat beams, no perfectly uniform white ray, no rings, no circular icons, no ships, no labels.
BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers.
```

## S6. Scrolling background

```
HOUSE STYLE FOR SPACE (match exactly): premium glossy 3D-rendered spacecraft. Player craft: white and pale ceramic armour plates over dark machined gunmetal, crisp bevels, recessed dark panel seams, vivid cyan glass cockpit and small controlled cyan engine glow. Enemy craft: graphite or slate metal with coral-red or plum ceramic plating, violet reactor cells and small magenta vents. Orthographic near-top-down camera with a very slight 3D tilt. One soft warm key light from the top-left, cool fill, faint pink bounce; reflections stay inside the machinery and glows stay small and bounded. Very dark midnight-navy space that is never brighter than the ships. Minimal yellow. NOT: pixel art, flat vector icons, cartoon flat fills, huge bloom, long laser beams, perfect circle or ring icons, text, labels, UI.

Use case: production background texture.
Asset type: a finished 1024x2048 portrait background for a vertically scrolling space shooter. Nearly black midnight navy, soft extremely dim desaturated violet and teal nebula clouds only at the far left and right edges, sparse tiny distant stars. The central 70% is calm, very dark, open space so small ships, bullets and warning marks stay readable. Subtle physically shaded faint dust and smooth colour gradations, never a flat fill. No bright white nebula, no sun, no planet, no rings, no ships, no characters, no HUD, no text, no long bright streaks. The top and bottom edges fade to exactly the same near-black value so it can repeat vertically without a visible seam. Fully opaque.
```

For another sector, change the one sentence about the nebula colour (Foundry: dim copper and plum; Glassbelt: dim steel-blue dust).

## S7. Add anchor dots to a ship (edit)

Attach a finished ship. We use these dots to place muzzles and engines.

```
Use case: precise-object-edit.
Image 1 is a finished ship sprite. Return the EXACT same image, pixel for pixel, with one change: add a small solid white dot (about 1% of the image width) exactly at the tip of every gun barrel or missile tube, and a small solid cyan dot at the centre of every engine nozzle. Do not move, resize, recolour or redraw the ship. Keep the transparent background.
```

## S8. Starflight phone mock (portrait)

Attach: `examples/starflight-ships.png`. Fill the brackets.

```
HOUSE STYLE FOR SPACE (match exactly): premium glossy 3D-rendered spacecraft. Player craft: white and pale ceramic armour plates over dark machined gunmetal, crisp bevels, recessed dark panel seams, vivid cyan glass cockpit and small controlled cyan engine glow. Enemy craft: graphite or slate metal with coral-red or plum ceramic plating, violet reactor cells and small magenta vents. Orthographic near-top-down camera with a very slight 3D tilt. One soft warm key light from the top-left, cool fill, faint pink bounce; reflections stay inside the machinery and glows stay small and bounded. Very dark midnight-navy space that is never brighter than the ships. Minimal yellow. NOT: pixel art, flat vector icons, cartoon flat fills, huge bloom, long laser beams, perfect circle or ring icons, text, labels, UI.

Use case: stylized-concept.
Asset type: ONE tall portrait phone screen mock of the Starflight scrolling shooter, aspect 9:19.5 (use the tallest image the tool allows and keep content in the middle 9:19.5 area). Full-bleed, no phone hardware. A design proposal, not a finished screenshot.
Scene: the player interceptor (cyan and white, pointing UP) in the lower third; above it a quiet dark starfield and [ENEMY SITUATION, e.g. "two coral interceptors entering from the upper left and a missile frigate holding the upper right, its left rack glowing as a warned volley"]. At least 55% of the field is calm empty dark space. Hostile rounds are few, small and clearly coral; the player's cyan bolts are short. A boss or machine appears only if the scene calls for it: [BOSS OR NONE].
HUD: slim and calm. Pause button top-left (large touch target), five small hull pips next to it, short chapter title at top centre ("[CHAPTER TITLE]"), score top-right. Near the bottom, a single round REACTOR ORB at the lower centre, at least 48 px at phone size, a glass sphere with a violet core and a fill level, and under the ship a dark empty drag area for the thumb. No wave counters, no big instructions, no tiny icons.
Everything solid keeps a clear lane at least 112 units wide (about a third of the screen) so the player can always move through.
```

## S9. Space brick-breaker board (landscape concept board)

For the space levels of the brick breaker itself (a villain mothership at the top, the player's paddle and ball below). This is the format Codex used for Carrier Breakout and Relay Raiders.

```
HOUSE STYLE FOR SPACE (match exactly): premium glossy 3D-rendered spacecraft. Player craft: white and pale ceramic armour plates over dark machined gunmetal, crisp bevels, recessed dark panel seams, vivid cyan glass cockpit and small controlled cyan engine glow. Enemy craft: graphite or slate metal with coral-red or plum ceramic plating, violet reactor cells and small magenta vents. Orthographic near-top-down camera with a very slight 3D tilt. One soft warm key light from the top-left, cool fill, faint pink bounce; reflections stay inside the machinery and glows stay small and bounded. Very dark midnight-navy space that is never brighter than the ships. Minimal yellow. NOT: pixel art, flat vector icons, cartoon flat fills, huge bloom, long laser beams, perfect circle or ring icons, text, labels, UI.

Use case: stylized-concept.
Asset type: BREACH mobile game design choice board, landscape 1536x1024. A new design proposal, not a finished screenshot.
Primary request: a premium playful glossy 3D space brick-breaker chapter called "[LEVEL NAME]". Story purpose: [ONE SENTENCE].
Composition: the left 45% is one large straight-on portrait phone playfield, no photoreal phone frame. Dark navy space with sparse dim stars. At the top [THE MOTHERSHIP OR MACHINE, with its guns and a visible open hangar or iris] surrounded by small rows of cyan, pink and violet glazed bricks. A cyan chrome paddle and one white ball near the lower playfield. The lower quarter is empty. A compact round face orb at lower left; a clear central drag lane. HUD small and calm.
The right 55% shows a clean character or machine lineup and two horizontal sequences of three rendered key poses (anticipation, contact, recovery) with physical cause and effect: [SEQUENCE 1], [SEQUENCE 2]. No long magic light trails.
Short legible labels only, in rounded playful lettering: "[LABEL 1]", "[LABEL 2]", "[LABEL 3]". Plenty of dark negative space, almost no yellow. All figures complete, faces large enough to read.
```

## S10. Starflight chapter design doc (for a reasoning model)

```
You are the lead designer of Starflight, the vertical scrolling shooter mode of BREACH (a premium mobile game). Write ONE chapter design in our format. Plain English, short sentences, tables, numbers.

RULES: one-finger relative drag steering; automatic primary fire; one reactor orb for earned specials (Lance, Seekers, Trident, Drones, Nova, Hyper, Stasis, plus Stormwing and Ricochet); the world is 360 units wide; the player ship is 52 x 46.8 units with a forgiving 7-unit hurt core; every hazard has a visible tell with a bounded warning, and every enemy must complete a visible entry before it fires; hostile rounds are warned at their real moving gun ports; every critical path is possible without specials; mandatory openings are at least 112 units wide; no invisible timers, no forced waiting, no endless replacement waves, no tiny weak points; at least 55% of the field stays calm. Enemy HP numbers already include the difficulty multiplier. Pause, background and the special chooser freeze everything.

DIFFICULTY (hull points / enemy HP multiplier / hostile speed ceiling / basic tell / hostile shot cap): Easy 6 / 1.00 / 175 u/s / 1.30 s / 22; Medium 5 / 1.15 / 210 u/s / 1.15 s / 32; Hard 4 / 1.30 / 240 u/s / 1.00 s / 42.

CHAPTER: [NAME and verb, e.g. "Glassbelt: traverse"]. Story: [ONE SENTENCE]. Enemy families available: scout, interceptor (committed dive), beetle, gunship, missile frigate, crescent cruiser, shieldship, emitter, tow tug, mine layer, iron asteroids, gravity shoals.

WRITE: Win and fail; length in units and target time (90 to 180 s); a beat list (3 to 6 beats: isolated enemy, pair, formation, quiet vista, boss) each with actors, what it teaches and its intensity from 0 to 1; one decision for the player (disarm safely, or exploit an opening for faster damage); the boss or objective with HP for Easy/Medium/Hard and optional component pools; the tells and counterplay table; difficulty table; physics notes (compound hulls, open notches stay empty, projectiles swept); new art needed, naming the asset families needed (ships, bosses, hazards, pickups, projectiles, background); a rules check; at most five open questions.
```
