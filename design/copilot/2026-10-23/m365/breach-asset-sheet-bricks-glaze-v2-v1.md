---
breach_drop: 1
kind: asset-sheet
slug: bricks-glaze-v2
version: 1
date: 2026-10-23
status: proposal
tool: Copilot Studio
depends_on: ["apk-critique-2026-10-23"]
---

# Bricks glaze v2

## Summary
- The bricks become thick glazed ceramic like the Vault look-dev: a bright highlight band, rounded bevels and a top-to-bottom body shade. This fixes the "flat coloured rectangles" issue from the P5 critique.
- A small sparkle glint sweeps across now and then, so the board feels alive without glowing.
- 2-HP bricks show a darker inner core behind a clear outer shell. The first hit shatters the shell. This fixes "grey bricks look indestructible".
- Granite looks like rough stone with iron studs and no glaze, so the player can tell it from breakable bricks by material, not just colour.
- Everything stays readable at 32x16 game units, which is about 35x17 pt on a 393-wide phone.

## Decisions for the owner
1. Sparkle: A an occasional glint sweep, one brick every 0.8 s, 0.35 s long [RECOMMENDED]; B a static glint only; C none.
2. Sun brick (yellow): A keep #FFC73D but use it for at most 15% of any board [RECOMMENDED]; B shift it to apricot #FFB347.

## Spec

### Colours

| Colour | Body | Highlight band | Shade (bottom, cracks) | 2-HP inner core |
|---|---|---|---|---|
| sun | #FFC73D | #FFE7A3 | #C98E12 | #C98E12 core inside a #FFC73D shell |
| coral | #FF6F61 | #FFB3AB | #C2433A | #C2433A core inside a #FF6F61 shell |
| violet | #8F5CF0 | #C7AEFF | #5E33B8 | #5E33B8 core inside a #8F5CF0 shell |
| teal | #22C4B0 | #9AF0E3 | #12877A | #12877A core inside a #22C4B0 shell |
| blue | #4F9DFF | #B0D4FF | #2A6BC9 | #2A6BC9 core inside a #4F9DFF shell |
| gold-gem | #F4C542 | #FFF0B8 | #B8891C | none (1 HP reward brick) |
| granite | #4A4F6E | #6E7494 (chisel edges) | #2C3048 | none (indestructible) |

### How a brick is built (in 32x16 game units)
- **Body:** corner radius 2.5. Vertical gradient from body +10% light at the top to body −18% at the bottom.
- **Highlight band:** 3 units tall, 2 units below the top edge, inset 3 units at each end. White #FFFFFF at 55% alpha, fading to 0% downward. This band is what reads as "shiny" on a phone.
- **Clear coat:** a 1-unit bright rim on the top-left bevel (key light) and a 1-unit cool rim on the right (#8CA6FF at 30%).
- **Separator:** a 1-unit dark edge (#0A0C18 at 60%) all round, so neighbouring bricks never blur together.
- **Glint:** a four-point star, 4x4 units, at the top-left. One random brick on screen glints every 0.8 s: alpha 0 → 1 → 0 over 0.35 s, easeInOutSine. It is never a circle or ring.

### States
| State | What it looks like | Animation |
|---|---|---|
| intact | As above | Idle; glint only |
| cracked | 2 to 3 pale crack lines (#FFFFFF at 70%, 1 unit wide) from one corner, plus one chipped corner showing the shade colour | Cracks draw in 0.08 s; brick nudges 1 unit away from the ball, then back over 0.1 s |
| breaking | Splits into 3 glazed shards | Scale 1 → 0.94 and alpha 1 → 0 over 0.4 s, easeInQuad. 3 to 5 rendered chips (4x3 units) drop 12 units and fade. No debris piles. |
| 2-HP intact | A clear shell (1.5-unit glossy frame) over a darker core tile in the shade colour | Idle |
| 2-HP shell-broken | The shell shatters into 4 clear chips; underneath is a normal 1-HP brick in the body colour | Shell chips fly 8 units outward over 0.25 s and fade; the 1-HP brick appears with a 0.1 s scale pop 1.06 → 1 |
| granite hit | Rough stone, no highlight band, 4 iron corner studs | Hit: 0.06 s darken flash and a dull stone "tok"; it never cracks |

### Readability on a phone
- At 393 pt wide, one game unit is about 1.09 pt, so a brick is about 35x17 pt (about 105x52 px at 3x).
- Author each brick at 4x (128x64 px) and downsample. The highlight band (3 units ≈ 10 px at 3x) and cracks (1 unit ≈ 3 px) survive the downscale.
- Shrink test: at 50% scale you can still tell intact, cracked, 2-HP and granite apart by shape alone.

## Data
```json
{
  "kind": "asset-sheet",
  "family": "bricks-glaze-v2",
  "cells": [
    {
      "id": "sun-1hp",
      "w": 32,
      "h": 16,
      "states": [
        "intact",
        "cracked",
        "breaking"
      ],
      "colors": [
        "#FFC73D",
        "#FFE7A3",
        "#C98E12"
      ]
    },
    {
      "id": "sun-2hp",
      "w": 32,
      "h": 16,
      "states": [
        "intact",
        "shell-broken"
      ],
      "colors": [
        "#FFC73D",
        "#FFE7A3",
        "#C98E12"
      ],
      "inner_core": "#C98E12"
    },
    {
      "id": "coral-1hp",
      "w": 32,
      "h": 16,
      "states": [
        "intact",
        "cracked",
        "breaking"
      ],
      "colors": [
        "#FF6F61",
        "#FFB3AB",
        "#C2433A"
      ]
    },
    {
      "id": "coral-2hp",
      "w": 32,
      "h": 16,
      "states": [
        "intact",
        "shell-broken"
      ],
      "colors": [
        "#FF6F61",
        "#FFB3AB",
        "#C2433A"
      ],
      "inner_core": "#C2433A"
    },
    {
      "id": "violet-1hp",
      "w": 32,
      "h": 16,
      "states": [
        "intact",
        "cracked",
        "breaking"
      ],
      "colors": [
        "#8F5CF0",
        "#C7AEFF",
        "#5E33B8"
      ]
    },
    {
      "id": "violet-2hp",
      "w": 32,
      "h": 16,
      "states": [
        "intact",
        "shell-broken"
      ],
      "colors": [
        "#8F5CF0",
        "#C7AEFF",
        "#5E33B8"
      ],
      "inner_core": "#5E33B8"
    },
    {
      "id": "teal-1hp",
      "w": 32,
      "h": 16,
      "states": [
        "intact",
        "cracked",
        "breaking"
      ],
      "colors": [
        "#22C4B0",
        "#9AF0E3",
        "#12877A"
      ]
    },
    {
      "id": "teal-2hp",
      "w": 32,
      "h": 16,
      "states": [
        "intact",
        "shell-broken"
      ],
      "colors": [
        "#22C4B0",
        "#9AF0E3",
        "#12877A"
      ],
      "inner_core": "#12877A"
    },
    {
      "id": "blue-1hp",
      "w": 32,
      "h": 16,
      "states": [
        "intact",
        "cracked",
        "breaking"
      ],
      "colors": [
        "#4F9DFF",
        "#B0D4FF",
        "#2A6BC9"
      ]
    },
    {
      "id": "blue-2hp",
      "w": 32,
      "h": 16,
      "states": [
        "intact",
        "shell-broken"
      ],
      "colors": [
        "#4F9DFF",
        "#B0D4FF",
        "#2A6BC9"
      ],
      "inner_core": "#2A6BC9"
    },
    {
      "id": "gold-gem-1hp",
      "w": 32,
      "h": 16,
      "states": [
        "intact",
        "cracked",
        "breaking"
      ],
      "colors": [
        "#F4C542",
        "#FFF0B8",
        "#B8891C"
      ]
    },
    {
      "id": "granite",
      "w": 32,
      "h": 16,
      "states": [
        "intact",
        "hit-flash"
      ],
      "colors": [
        "#4A4F6E",
        "#6E7494",
        "#2C3048"
      ],
      "indestructible": true
    }
  ],
  "build": {
    "corner_radius": 2.5,
    "highlight_band": {
      "h": 3,
      "top_offset": 2,
      "inset": 3,
      "color": "#FFFFFF",
      "alpha_from": 0.55,
      "alpha_to": 0
    },
    "gradient": {
      "top_light": 0.1,
      "bottom_dark": 0.18
    },
    "separator": {
      "w": 1,
      "color": "#0A0C18",
      "alpha": 0.6
    },
    "glint": {
      "size": 4,
      "every_s": 0.8,
      "length_s": 0.35,
      "shape": "four-point star"
    },
    "crack": {
      "lines": [
        2,
        3
      ],
      "w": 1,
      "color": "#FFFFFF",
      "alpha": 0.7,
      "draw_s": 0.08
    },
    "break": {
      "time_s": 0.4,
      "scale": [
        1,
        0.94
      ],
      "chips": [
        3,
        5
      ],
      "chip_size": [
        4,
        3
      ],
      "drop_units": 12
    },
    "sun_max_share": 0.15,
    "author_scale": 4
  },
  "grid": {
    "columns": 4,
    "rows": 6,
    "cell_px": 512,
    "background": "transparent"
  },
  "prompt": "Use case: stylized-concept. Asset type: game sprite sheet of glazed ceramic bricks, 4 columns by 6 rows, 24 cells, every brick the same 2:1 proportion (32x16 game units). HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo. BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers. Every brick: a thick glossy clear-coat glaze over a coloured ceramic body, slightly rounded bevels (about 8% of the height), the body slightly lighter at the top and darker at the bottom, one crisp bright highlight band along the top edge (about a fifth of the height, inset from the corners), a thin dark edge, and one small four-point sparkle glint at the top-left corner. Columns are, left to right: intact; cracked (two or three fine pale crack lines and one corner chip missing); breaking (split into 3 glazed shards, still mostly in place, slightly faded); 2-HP (a clear glossy outer shell with a darker inner core tile visible through it, like a tile inside a glass case). Rows top to bottom: sun #FFC73D; coral #FF6F61; violet #8F5CF0; teal #22C4B0; blue #4F9DFF; and row 6 = gold gem brick #F4C542 with a faceted gem inlay, in intact, cracked and breaking, plus one dark granite indestructible block #4A4F6E in cell 4: rough chiselled stone with iron corner studs and no glaze, clearly a different material. Identical lighting, size and angle in every cell; straight-on orthographic view. NOT: flat colour rectangles, neon, glow halos, rings, outlines, text, numbers, perspective."
}
```

## Art requests
1. **Brick sheet.** Use case: stylized-concept. Asset type: game sprite sheet of glazed ceramic bricks, 4 columns by 6 rows, 24 cells, every brick the same 2:1 proportion (32x16 game units). HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo. BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers. Every brick: a thick glossy clear-coat glaze over a coloured ceramic body, slightly rounded bevels (about 8% of the height), the body slightly lighter at the top and darker at the bottom, one crisp bright highlight band along the top edge (about a fifth of the height, inset from the corners), a thin dark edge, and one small four-point sparkle glint at the top-left corner. Columns are, left to right: intact; cracked (two or three fine pale crack lines and one corner chip missing); breaking (split into 3 glazed shards, still mostly in place, slightly faded); 2-HP (a clear glossy outer shell with a darker inner core tile visible through it, like a tile inside a glass case). Rows top to bottom: sun #FFC73D; coral #FF6F61; violet #8F5CF0; teal #22C4B0; blue #4F9DFF; and row 6 = gold gem brick #F4C542 with a faceted gem inlay, in intact, cracked and breaking, plus one dark granite indestructible block #4A4F6E in cell 4: rough chiselled stone with iron corner studs and no glaze, clearly a different material. Identical lighting, size and angle in every cell; straight-on orthographic view. NOT: flat colour rectangles, neon, glow halos, rings, outlines, text, numbers, perspective.

## Rules check
- Glazed ceramic with real highlights: OK.
- Breakable and indestructible differ by shape and material: OK (granite is stone with studs and no glaze).
- A single brick vanishes quietly (crack and fade about 0.4 s); only big crashes drop debris: OK.
- Effects are rendered things, never plain circles or rings: OK. The glint is a star and the chips are shards.
- Very little yellow: OK. The sun brick is capped at 15% of a board, and gold gems are rare.
- Backgrounds stay darker than the bricks: OK, no change to backgrounds.

## Open questions for Claude
1. Should the highlight band and glint be drawn in code or baked into the sprite? Recommended: bake the band; draw the glint in code so it can animate.
2. Should the 2-HP core use the shade colour or a different colour? Recommended: shade colour, so the brick still reads as the same family.
3. The armour bricks (#8D97B3) from the invasion palette: replace them with 2-HP versions? Recommended: yes, as the P5 critique says.
4. Do Gatehouse's brick-red, cream and sage bricks need the same treatment? Recommended: yes. Run this sheet prompt again with those 3 colours.
5. Atlas size: 4x sprites at 128x64? Recommended: yes, one 1024x512 atlas per family.
