---
breach_drop: 1
kind: asset-sheet
slug: bricks-glaze-v2
version: 1
date: 2026-10-23
status: proposal
tool: Copilot Studio, Gemini 4 Argon
depends_on: []
---
# BREACH P9: Shinier Glazed-Ceramic Brick Family (`bricks-glaze-v2`)

## Summary
- Upgrades all 7 BREACH brick families (`sun`, `coral`, `violet`, `teal`, `blue`, `gold-gem`, and `granite`) to the high-gloss Vault look-dev standard directly addressing the flat satin bricks critiqued in P5 (`gatehouse-floor3.png`).
- Specifies a thick clear-coat ceramic shader with a `3 px` (`1.0` game unit) crisp top-left highlight band (`#FFDBB8`), a `2.5 px` rounded corner radius, a `4-pointed` corner sparkle glint, and a dark `#0A0C18` outer separator rim so `32x16` tiles pop at phone scale (`96x48 px` at `3 px/unit`).
- Defines a distinct **2-HP Recessed Core** version for all 5 colour families: an outer glazed ceramic frame surrounding a bevelled brushed-brass/silver inner core plate so 2-HP bricks differ by internal geometry before the first hit.
- Differentiates indestructible **Granite** (`#4A4F6E`) by silhouette as well as material: chamfered octagon corners (`45 deg` bevel cuts), four iron corner rivets, and a matte stone-metal coat with zero gloss highlight band.
- Provides a complete `4 columns x 6 rows` (`2048x3072 px`, `512x512 px` cells, 10% margin, transparent background) production sheet prompt (`P09_bricks-glaze-v2_brick-sheet_1.png`).

## Decisions for the owner
1. How 2-HP bricks visually differ from 1-HP bricks at `32x16` units: A Visible recessed inner core plate with a thin brass/silver bezel that shatters on hit 1 to reveal the cracked 1-HP colour body [RECOMMENDED] [AUTO-PICKED] | B Thicker outer border only | C Small numeric "2" printed on the brick.
2. How indestructible Granite (`#4A4F6E`) differs in shape from breakable bricks: A Chamfered 8-sided octagon silhouette with 4 heavy iron corner rivets and no top gloss band [RECOMMENDED] [AUTO-PICKED] | B Same rounded rectangle with 4 tiny dots (current APK look critiqued in P5).
3. Single-brick break animation (`0.4 s` rule): A `0.00–0.12 s` swap to `breaking` sprite + top-left 4-point glint flash -> `0.12–0.40 s` scale `1.0 -> 0.88` and alpha `1.0 -> 0.0` (`easeInQuad`) with zero physics debris [RECOMMENDED] [AUTO-PICKED] | B Drop 3 falling stone chips on every single brick break.

## Spec

### 1. Seven Brick Families, Hex Palette & 3 States (`32x16` Game Units / `96x48 px` at `3 ppu`)

| Family ID | Body Hex | Top Highlight Band (`1.0 u` / `3 px`) | Shadow Rim (`1.3 u` / `4 px`) | Inner Core / Accent (2-HP or Special) | Three States (`intact`, `cracked`, `breaking`) |
|---|---|---|---|---|---|
| `sun` | `#FFC73D` | `#FFF3C4` | `#9E6B14` | Warm bronze core `#D98A2B` | `intact`: mirror glaze + 1 top-left 4-point glint; `cracked`: 2 Y-cracks + 1 top chip; `breaking`: deep split + 2 edge chips. |
| `coral` | `#FF6F61` | `#FFDAD4` | `#992D2D` | Rose-copper core `#C84B55` | `intact`: rich coral glaze; `cracked`: diagonal stress line + corner nick; `breaking`: spiderweb fracture exposing pale clay core. |
| `violet` | `#8F5CF0` | `#E5D4FF` | `#46228F` | Silver-lilac core `#B8A2E8` | `intact`: deep amethyst glaze; `cracked`: twin forked cracks; `breaking`: deep central fissure + 2 missing edge chips. |
| `teal` | `#22C4B0` | `#C7FFF6` | `#0E635C` | Pale seafoam core `#7CE8D8` | `intact`: emerald-teal ceramic sheen; `cracked`: stepped crack across highlight band; `breaking`: fractured glaze plates lifting. |
| `blue` | `#4F9DFF` | `#D6EAFF` | `#1E4B94` | Brushed steel core `#99C2FF` | `intact`: cobalt-blue glaze; `cracked`: lightning-shaped hairline crack; `breaking`: deep V-notch chip on top edge + open seam. |
| `gold-gem` | `#F4C542` | `#FFF6CC` | `#8C6214` | Faceted ruby `#FF4D6D` in brass bezel | `intact`: honey-gold tile with raised central ruby + 2 sharp star glints; `cracked`: cracked brass bezel + loosened gem; `breaking`: gem popping `3 units` out of socket. |
| `granite` | `#4A4F6E` | `#6E7599` (matte bevel, no gloss band) | `#222538` | 4 dark gunmetal rivets `#141831` | **Chamfered octagon silhouette.** `intact`: unbreakable riveted slab; `cracked` (after `QUAKE`/`Molten Ram`): hairline seam; `breaking` (boss crash only): split masonry slab. |

### 2. How Highlight, 2-HP Inner Layer, Crack & `0.4 s` Fade Read at Phone Size

- **Crisp Highlight Band at `32x16` Units (`96x48 px`):**
  - Top edge carries a continuous `3 px` (`1.0` unit) bright glaze band (`#FFDBB8` mixed `70%` with the brick hue) inset `2 px` from the dark `#0A0C18` separator rim, plus one `5x5 px` four-pointed star glint at the top-left corner (`u = 0.14, v = 0.22`).
  - Bottom edge carries a `4 px` (`1.3` unit) darkened under-bevel tinted by `#FF80A6` bounce light (`12%` blend) so adjacent rows separate cleanly without mortar lines.
- **2-HP Visible Inner Layer:**
  - Every 2-HP brick (`32x16` units) has a `20x8` unit recessed inner lozenge framed by a `1.0`-unit metallic bevel (`#F4C542` brass on warm bricks, `#8CA6FF` silver-steel on cool bricks).
  - **Hit 1 (2 HP -> 1 HP):** The inner metallic plate pops and fades in `0.25 s`, leaving the brick in its `cracked` 1-HP state so the player sees at a glance which bricks need 1 more hit vs. 2 hits.
- **Single-Brick `0.4 s` Crack-and-Fade (Zero Debris Rule):**
  - **`0.00–0.12 s`:** Brick switches from `intact`/`cracked` to `breaking`, flashes its top-left 4-pointed glint (`alpha 1.0`), and emits 2 tiny starlight sparks (`r <= 2` units, non-colliding).
  - **`0.12–0.40 s`:** The `breaking` sprite scales `1.0 -> 0.88` and fades `alpha 1.0 -> 0.0` (`easeInQuad`). No falling stone chips are spawned unless a `3x3` `QUAKE`, `Molten Ram`, or structural boss crash destroys `>=4` bricks at once.

### 3. `4 Columns x 6 Rows` Production Sheet Layout (`24` Cells, `512x512 px` per Cell)

| Row | Col 1 (`Intact 1-HP`) | Col 2 (`Cracked 1-HP`) | Col 3 (`Breaking 1-HP`) | Col 4 (`Intact 2-HP Inner Layer / Variant`) |
|---:|---|---|---|---|
| **Row 1** | `sun-1hp` (`#FFC73D`) intact | `sun-1hp` cracked | `sun-1hp` breaking | `sun-2hp` (recessed bronze core plate) |
| **Row 2** | `coral-1hp` (`#FF6F61`) intact | `coral-1hp` cracked | `coral-1hp` breaking | `coral-2hp` (recessed rose-copper core plate) |
| **Row 3** | `violet-1hp` (`#8F5CF0`) intact | `violet-1hp` cracked | `violet-1hp` breaking | `violet-2hp` (recessed silver-lilac core plate) |
| **Row 4** | `teal-1hp` (`#22C4B0`) intact | `teal-1hp` cracked | `teal-1hp` breaking | `teal-2hp` (recessed seafoam core plate) |
| **Row 5** | `blue-1hp` (`#4F9DFF`) intact | `blue-1hp` cracked | `blue-1hp` breaking | `blue-2hp` (recessed steel core plate) |
| **Row 6** | `gold-gem` (`#F4C542`) intact | `gold-gem` cracked + `breaking` | `granite` (`#4A4F6E`) chamfered intact | `granite` cracked + `granite-2hp` reinforced slab |

## Data
```json
{
  "kind": "asset-sheet",
  "family": "bricks-glaze-v2",
  "cells": [
    { "id": "sun-1hp-and-2hp", "w": 32, "h": 16, "states": ["intact", "cracked", "breaking", "2hp-core"], "colors": ["#FFC73D", "#FFF3C4", "#D98A2B"] },
    { "id": "coral-1hp-and-2hp", "w": 32, "h": 16, "states": ["intact", "cracked", "breaking", "2hp-core"], "colors": ["#FF6F61", "#FFDAD4", "#C84B55"] },
    { "id": "violet-1hp-and-2hp", "w": 32, "h": 16, "states": ["intact", "cracked", "breaking", "2hp-core"], "colors": ["#8F5CF0", "#E5D4FF", "#B8A2E8"] },
    { "id": "teal-1hp-and-2hp", "w": 32, "h": 16, "states": ["intact", "cracked", "breaking", "2hp-core"], "colors": ["#22C4B0", "#C7FFF6", "#7CE8D8"] },
    { "id": "blue-1hp-and-2hp", "w": 32, "h": 16, "states": ["intact", "cracked", "breaking", "2hp-core"], "colors": ["#4F9DFF", "#D6EAFF", "#99C2FF"] },
    { "id": "gold-gem-cache", "w": 32, "h": 16, "states": ["intact", "cracked", "breaking"], "colors": ["#F4C542", "#FF4D6D", "#FFF6CC"] },
    { "id": "granite-octagon", "w": 32, "h": 16, "states": ["intact", "cracked", "breaking"], "colors": ["#4A4F6E", "#6E7599", "#141831"] }
  ],
  "grid": {
    "columns": 4,
    "rows": 6,
    "cell_px": 512,
    "background": "transparent"
  },
  "prompt": "HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. One soft warm key light from the top-left (#FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6). Orthographic camera, straight-on view. NOT: pixel art, flat vector clip art, rough photoreal stone, text, labels, grid lines. Use case: production sprite sheet of glazed ceramic bricks (bricks-glaze-v2). Asset type: 4 columns by 6 rows grid, portrait 2048x3072 (512x512 px per cell), 24 wide bricks (2:1 aspect ratio, 32x16 game units). Columns 1 to 3 show 1-HP states left-to-right: Intact (thick clear-coat glaze, crisp bright top-left highlight band, one small 4-pointed star glint on the top-left bevel, dark separator rim), Cracked (two sharp glaze cracks and one small corner chip), Breaking (deep spiderweb cracks, two missing edge chips, still one piece). Column 4 shows the 2-HP version with a visible recessed metallic inner core plate in the centre. Rows top to bottom: Row 1 Sun gold (#FFC73D), Row 2 Coral red (#FF6F61), Row 3 Violet (#8F5CF0), Row 4 Teal (#22C4B0), Row 5 Cobalt blue (#4F9DFF), Row 6 Special: Cell 21 Gold Gem Cache intact (#F4C542 with faceted ruby), Cell 22 Gold Gem Cache cracked/breaking, Cell 23 Indestructible Granite (#4A4F6E) with a CHAMFERED OCTAGON silhouette, four dark iron rivets and NO gloss highlight band, Cell 24 Cracked/Reinforced Granite octagon block. BACKGROUND: fully transparent (real alpha) or flat solid pure magenta #FF00FF. Leave at least 10% empty margin inside every cell; nothing may touch a cell edge."
}
```

## Art requests

### Image 1: `P09_bricks-glaze-v2_brick-sheet_1.png`
```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: production sprite sheet of shinier glazed ceramic bricks (bricks-glaze-v2).
Asset type: 4 columns by 6 rows grid, portrait 2048x3072 (each cell 512x512 px), twenty-four WIDE bricks (2:1 aspect ratio, representing 32x16 game units), viewed straight on, orthographic, lit from the top-left (#FFDBB8).
Look: thick wet-look glazed ceramic tile with a deep coloured body under a crystal-clear glossy coat, one crisp bright highlight band along the entire top edge, a tiny 4-pointed star sparkle glint at the top-left corner, a darker bottom under-bevel, slightly rounded corners, and a thin dark separator rim.
Columns 1 to 3 (left to right):
- Column 1: INTACT 1-HP brick (mirror-smooth glaze, crisp top highlight band).
- Column 2: CRACKED 1-HP brick (thin forked cracks across the glaze and one small corner chip).
- Column 3: BREAKING 1-HP brick (deep fracture lines, two missing edge chips, inner clay core peeking through, still one connected piece).
- Column 4: 2-HP ARMORED BRICK (same colour family with a visibly recessed bevelled brass-or-steel inner core plate inset into the middle of the tile).
Rows 1 to 6 (top to bottom):
- Row 1: SUN (#FFC73D) — intact, cracked, breaking, and 2-HP with bronze inner core.
- Row 2: CORAL (#FF6F61) — intact, cracked, breaking, and 2-HP with rose-copper inner core.
- Row 3: VIOLET (#8F5CF0) — intact, cracked, breaking, and 2-HP with silver-lilac inner core.
- Row 4: TEAL (#22C4B0) — intact, cracked, breaking, and 2-HP with seafoam inner core.
- Row 5: BLUE (#4F9DFF) — intact, cracked, breaking, and 2-HP with brushed-steel inner core.
- Row 6 (Specials):
  - Cell (Row 6, Col 1): GOLD GEM CACHE intact (#F4C542 gold-trimmed tile with a faceted ruby-red gem in a raised brass socket).
  - Cell (Row 6, Col 2): GOLD GEM CACHE breaking (cracked brass socket with the ruby gem popping slightly loose).
  - Cell (Row 6, Col 3): GRANITE INDESTRUCTIBLE intact (#4A4F6E dark slate stone, clearly different CHAMFERED OCTAGON silhouette with 45-degree cut corners, four iron rivets, matte finish with NO gloss highlight band).
  - Cell (Row 6, Col 4): GRANITE CRACKED / REINFORCED (same chamfered octagon shape with a heavy iron cross-strap and hairline seam).
BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers.
```

## Rules check
- Every hazard has a visible 1.2 to 1.8 s tell and is shown once safely first: **OK** — brick asset sheet only.
- Ordinary ball play always makes progress; no tiny weak points (min 32x16 brick), no precision puzzles, no waiting on timers or invulnerable enemies: **OK** — all bricks are standard `32x16` game units (`2:1`).
- Difficulty changes numbers only (harder but fair): **OK** — 2-HP inner-core bricks communicate extra HP visually across all modes.
- No power-up, companion or purchase is required to win; Pause, Continue, Retry keep progress: **OK** — N/A.
- Enemy attacks never destroy the player's bricks to hand out rewards: **OK** — N/A.
- A single brick cracks and fades in about 0.4 s; only big crashes drop debris: **OK** — `breaking` state fades out over `0.4 s` (`scale 1.0 -> 0.88`, `alpha 1.0 -> 0.0`) with zero falling debris chips.
- Effects are rendered gems, chips, sparks, dust or debris; never plain circles or rings: **OK** — top-left sparkle is a 4-pointed star glint and `gold-gem` uses a faceted ruby in a brass socket.
- Mobile safe areas, 393x852 and 412x915, 44 pt touch targets, paddle above the thumb: **OK** — `3 px` highlight band and `20x8` inner core are tuned specifically for `96x48 px` phone rendering.
- Glossy vinyl-toy / glazed-ceramic look, dark navy background, minimal yellow: **OK** — Granite differs by chamfered octagon silhouette as well as matte material (`#4A4F6E`).

## Open questions for Claude
1. Should we bake the `4-pointed` corner sparkle glint into the static PNG or animate it as an additive sprite overlay? **Recommended:** Bake a subtle static glint into the PNG top-left bevel AND sweep a `0.35 s` additive glint sprite across a random `8%` of intact bricks every `3.0 s` so the wall shimmers like real starglass.
2. For 1-cell square bricks (`16x16` units in The Vault and Dragon's Hoard), should we slice a matching `1:1` version or nine-slice the `32x16` brick? **Recommended:** Nine-slice with `12 px` left/right caps (preserving the rounded bevels and rivets) for standard colours, and render dedicated `1:1` centres only for `gold-gem` and `granite`.
