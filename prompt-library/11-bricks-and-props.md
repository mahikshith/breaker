# 11 - Bricks, machinery and props

Purpose: generate brick families (intact and cracked), machinery props (wheels, chains, bells, counterweights, gates, ramps) and reusable kits that many levels can share. Use with `00-style-block.md` and references 12, 13, 14, 15 and 3 from `references.md`.

## The rules that matter most

1. **One rig, many skins.** Design a prop once and skin it for each level (the Ram Ball is a steel ram for Kit and a song-note sphere for Lumi: same code, two skins; the window kit is back + front + cracked layers that any actor can sit between; the paddle is left, middle and right parts; Mooncoil bricks reuse the Vault brick footprints exactly). "Any new art must be a reusable part, not a one-off picture." (`design/phase2/kit-and-lumi-levels.md`)
2. **The art must match the footprint.** Bricks are drawn inside their cell: the visible brick fills its 16 x 16 unit cell (or 32 x 16 for a double brick) with a 4-unit transparent margin around it in the sprite. A drawn shape that is wider than its cell would lie about the collision. For moving props, the collider is later measured from the drawn alpha; so draw clean, solid, simple outlines with no thin floating bits.
3. **Indestructible things must look different by shape and material, not just colour.** Granite or dark iron anchors versus glazed breakable bricks.
4. **Single bricks vanish quietly** (crack and fade in about 0.4 s). Only big structural crashes (a drawbridge, a tower) drop physics debris. So bricks need an intact and a cracked state, not a shatter animation.
5. **Everything breakable is broad and obvious.** No tiny weak points. Ordinary housings are broad, about 30 x 18 units.
6. **Orthographic front view** (side view for side-on levels), flat even lighting from the top-left key, transparent background, each part isolated and complete.
7. **Separate the moving parts.** Wheel rim and spokes separate from their frame; a lever separate from its mount; each claw, bell, chain link and gate separate. Give each a clear pivot (hub, hinge, hook).

## Sizes (game units, 360 wide screen; sprites are 3 px per unit)

| Thing | Footprint | Sprite size |
|---|---|---|
| Vault brick, 1 x 1 | 16 x 16 u | 72 x 72 px (24 x 24 u with the margin) |
| Vault brick, 2 x 1 | 32 x 16 u | 120 x 72 px |
| Princess-level brick | 36 x 18 u, all equal | about 108 x 54 px plus margin |
| Rolling bell | radius 14 u (28 u across) | about 90 px across |
| Breakable housing | about 30 x 18 u | about 100 x 60 px |
| Window opening | 32 x 44 u, frame 52 x 64 u | 180 x 216 px (60 x 72 u) |
| Paddle | 100 x 14 u (parts 16 x 20 u) | 48 x 60 px per part |

Generated images will not be that small. Ask for large and clean; we scale down. Keep **proportions** exact (a 2 x 1 brick is twice as wide as tall).

## Brick families

A family is one material with every variant the levels need.

| Variant | Why |
|---|---|
| 1 x 1 intact, 2 x 1 intact | The two footprints used by the grid |
| 1 x 1 cracked, 2 x 1 cracked | Damage state for bricks that take more than one hit |
| A cache brick (carries a power-up) | Distinct emblem or inset, same silhouette |
| A dark indestructible anchor | Granite or iron, different texture and bevel |
| Colour set | Blue `#4F9DFF`, coral `#FF6F61`, teal `#22C4B0` or green, violet `#8F5CF0`, plus granite `#4A4F6E`. Gold `#F4C542` only as a tiny gem |

Material per theme: Vault = glazed ceramic; Mooncoil = faceted moonstone in a silver setting; castle = carved stone with brass corner caps. Always: thick clear coat, a crisp highlight along the top edge, slightly rounded corners, dark separator line, a small bevel.

### Fields

| Field | Example |
|---|---|
| `[THEME]` | Gatehouse stone |
| `[MATERIAL]` | glazed ceramic over carved stone with brass corner caps |
| `[COLOURS WITH HEX]` | coral #FF6F61, sage #7FB08A, ivory #E8DFC8, granite #4A4F6E |
| `[FOOTPRINTS]` | 1 x 1 (square) and 2 x 1 (twice as wide as tall) |
| `[STATES]` | intact, cracked |
| `[EXTRAS]` | cache brick, indestructible anchor |
| `[REFERENCES ATTACHED]` | family.png, vault-top-down.png |

### Template: brick family sheet

```text
[PASTE STYLE BLOCK]

Production sprite sheet of a BREACH brick family, theme [THEME]. Material: [MATERIAL]. Orthographic straight-on front view, flat lighting from the top-left key with a crisp highlight band along the top edge, slightly rounded corners, dark separator line around each brick, small bevel, thick clear glossy coat.
Layout: one image, 2048 x 2048, transparent background, a strict grid of equal cells. Rows = colours [COLOURS WITH HEX], one colour per row. Columns, left to right: 1x1 intact, 1x1 cracked, 2x1 intact, 2x1 cracked. Each 1x1 brick is an exact square and each 2x1 brick is exactly twice as wide as it is tall; every brick is centred in its cell with at least 10 percent empty padding; no overlap, no shadows on the background, nothing cut off. Last row: [EXTRAS]. No text, no labels.
Cracked variants: the same brick with two or three thin, clean, hand-readable cracks and a slightly dulled gloss; the silhouette and size stay identical to the intact brick.
Consistency: match the attached reference images exactly for glaze, bevel, highlight and corner radius. Do not change the brick proportions.
[PASTE NEGATIVE LIST]
```

### Worked example: Gatehouse stone brick family

```text
Premium portrait mobile brick-breaker game art, "BREACH" house style. Polished 3D-rendered, as if rendered in Blender Cycles. Bricks are glazed ceramic tiles: coloured body under a thick clear glossy coat, a crisp highlight band along the top edge, slightly rounded corners, dark separators. Warm key light from the top-left (#FFDBB8), cool fill from the right (#8CA6FF), soft pink bounce from below (#FF80A6). Saturated but never neon; minimal yellow.

Production sprite sheet of a BREACH brick family, theme GATEHOUSE STONE. Material: glazed ceramic over carved castle stone with small brass corner caps. Orthographic straight-on front view, flat lighting from the top-left key with a crisp highlight band along the top edge, slightly rounded corners, dark separator line around each brick, small bevel.
Layout: one image, 2048 x 2048, transparent background, a strict grid of equal cells, 4 columns x 4 rows. Rows: coral #FF6F61, sage green #7FB08A, ivory #E8DFC8, and a last row with two special bricks. Columns: 1x1 intact, 1x1 cracked, 2x1 intact, 2x1 cracked. Each 1x1 is an exact square; each 2x1 is exactly twice as wide as tall; every brick centred with at least 10 percent empty padding; no overlap, no shadows, nothing cut off. Last row: (cells 1-2) a dark indestructible granite anchor block #4A4F6E in 1x1 and 2x1, matte, chunky, with an iron band across it so it is clearly NOT a breakable glazed brick; (cells 3-4) a cache brick in ivory with a small recessed gold #F4C542 gem in the centre (1x1 and 2x1). No text, no labels.
Cracked variants: the same brick with two or three thin clean cracks and slightly dulled gloss; same silhouette and size as the intact brick.
Consistency: match the attached reference images exactly for glaze, bevel, highlight and corner radius.
Avoid: pixel art, flat vector, noisy texture, tiny rivets, scratches, neon glow, torches or lanterns, any text, logo, watermark or UI.
```

Attach: `art/mooncoil/proof/family.png`, `docs/reference/vault-top-down.png`.

## Machinery props

Think "kit of parts". One sheet, one grid, each part isolated and complete in the front orthographic view, with moving parts separated.

### Fields

| Field | Example |
|---|---|
| `[PROP LIST]` | portcullis winch wheel, wheel frame, iron chain link (tileable), hanging counterweight, iron bell, drawbridge, gate and gate frame |
| `[MATERIALS]` | aged iron bands over carved stone and weathered wood, brushed brass fittings |
| `[PIVOTS]` | wheel hub, bell hanging ring, drawbridge hinge, chain top hook |
| `[GAMEPLAY ROLE OF EACH]` | wheel turns one notch per ordinary hit; counterweight breaks after 4 hits; bell rolls and shatters after 2 hits |
| `[SIZE RELATIVE TO A 36 x 18 BRICK]` | wheel about 5 bricks wide |
| `[STATES]` | intact, damaged, broken (for breakables) |
| `[REFERENCES ATTACHED]` | parts-contact.png, kit-gatehouse-siege-v1.png |

### Template: machinery parts sheet

```text
[PASTE STYLE BLOCK]

Production sprite sheet of reusable castle machinery for a BREACH level, orthographic straight-on front view, flat top-left key light, transparent background. Parts, each ISOLATED and COMPLETE in its own grid cell: [PROP LIST]. Materials: [MATERIALS]: metal-banded wood and carved stone, dark blued gunmetal and brushed brass, glossy clear coat on enamel parts, chunky bevelled shapes, readable at phone size. Moving parts are separate objects so they can rotate on their pivots: [PIVOTS].
Layout: one image, 2048 x 2048, strict grid of equal cells, each part centred with at least 10 percent padding, no overlap, no cast shadow on the background, nothing cut off, no text, no labels. Sizes are proportional to each other: [SIZE RELATIVE TO A 36 x 18 BRICK].
Breakable parts also get a damaged state and a broken state in the cells next to them (same silhouette first, then cracked and chipped, then split into two or three large clean pieces; large chunks only, no dust).
Roles, so the shapes read correctly: [GAMEPLAY ROLE OF EACH].
Consistency: match the attached reference images exactly for metal, wood and stone finish, wear level and light. Calm, desaturated, dark values except the lit edges; it must sit on a dark plate without competing with glossy bricks.
[PASTE NEGATIVE LIST]
```

### Worked example: Gatehouse siege kit

```text
Premium portrait mobile brick-breaker game art, "BREACH" house style. Polished 3D-rendered toy-scale look, as if rendered in Blender Cycles. Warm key light from the top-left (#FFDBB8), cool blue fill from the right (#8CA6FF), soft pink bounce from below (#FF80A6), medium-high contrast, saturated but not neon, minimal yellow.

Production sprite sheet of reusable castle gatehouse machinery for the BREACH level "Gatehouse Siege", orthographic straight-on front view, flat top-left key light, transparent background. Parts, each isolated and complete in its own cell of a 4 x 3 grid:
1 portcullis winch wheel (a banded wooden wheel with 8 clear iron spokes and 8 visible notches around the rim, hub in the centre); 2 winch frame with a ratchet pawl (separate from the wheel); 3 a vertical iron chain segment of 6 links that tiles top to bottom; 4 a hanging stone counterweight in an iron cage with a ring on top; 5 the same counterweight damaged; 6 the same counterweight broken into three large chunks; 7 a heavy brass murder-hole bell with a hanging ring; 8 a drawbridge span: stone deck with iron straps and brass corner caps, hinge pins at one end; 9 portcullis gate with vertical iron bars, banded wood backing and a plain dark opening below; 10 the stone gate frame arch (separate from the gate); 11 an angled wooden-and-iron ramp strip with a pivot pin at one end; 12 a short stone plinth.
Materials: aged iron bands over carved stone and weathered wood, brushed brass fittings, glossy clear coat only on the enamel and brass; chunky bevelled shapes, readable at phone size. Moving parts are separate objects so they can rotate on their pivots: wheel hub, bell ring, drawbridge hinge, chain top hook, ramp pin.
Layout: one image, 2048 x 1536, strict grid, each part centred with at least 10 percent padding, no overlap, no cast shadow on the background, nothing cut off, no text, no labels. Sizes proportional: the wheel is about 5 bricks wide (a brick is 36 x 18 units), the counterweight about 1.7 bricks wide, the bell about 1.5 bricks wide, the gate about 4 bricks wide.
Roles: the wheel turns one notch per ordinary hit (8 notches open the gate); the counterweight breaks after 4 hits; the bell rolls down the ramps and shatters after 2 hits.
Consistency: match the attached references exactly for metal, wood and stone finish, wear level and light. Dark, calm values except the lit edges so it sits on a dark plate without competing with glossy bricks.
Avoid: pixel art, flat vector, torches, lanterns, hazard stripes, glowing windows, noise textures, tiny rivets, neon glow, any text, logo, watermark, UI.
```

Attach: `art/fantasy-machinery/proof/parts-contact.png`, `design/phase2/img/kit-gatehouse-siege-v1.png`.

## Output spec

| Output | Spec |
|---|---|
| Brick sheet | 2048 x 2048 PNG, transparent, equal cells, exact square and 2:1 shapes, intact and cracked, no text |
| Machinery sheet | 2048 x 2048 (or 2048 x 1536) PNG, transparent, one part per cell, moving parts separate, damaged and broken states for breakables |
| Single prop | 1024 px or larger on the long side, transparent, centred, front orthographic |
| Skins | Same sheet layout repeated per skin, same cell order, so one script can pair them |
| Hand-back note | Which cell is which (row, column, name), pivot location of each moving part, any chroma colour used |

Filing: `art/<family>/source/`, then either a Blender rebuild with the shared brick and light rig (`art/render_vault_assets.py`, pattern in `art/mooncoil/brick_assets.py`) or an extraction pass (`art/fantasy-machinery/extract.py`). Collision is built separately from the final alpha, never from the generated picture.
