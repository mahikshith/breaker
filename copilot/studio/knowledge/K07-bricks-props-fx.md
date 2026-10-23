# 20 - Bricks, props and FX

Bricks, castle machinery, effect sprites and power-up icons. Every prompt asks for a transparent background (or flat magenta if your tool cannot do transparency; see `60-sprite-sheet-delivery.md`).

Game facts that matter for these assets:

- Bricks sit on a 16-unit grid. A brick is either 1 cell (16x16 units, square) or 2 cells (32x16 units). We draw it 4 units larger on every side for the glow and bevel (24x24 and 40x24 units).
- Each brick has three damage looks: intact, cracked, nearly broken.
- Rendered at 3 px per unit, a 1-cell brick is 72x72 px and a 2-cell brick is 120x72 px. Ask for bigger and we shrink it.
- Single bricks vanish quietly; only big crashes drop debris, so the debris sprites below are for crashes.

## 1. Brick family (one colour family per sheet)

Attach: `examples/vault-bricks.png`. Fill in the colour name and hex.

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: production sprite sheet of glazed ceramic bricks.
Asset type: 3 columns by 2 rows, landscape 1536x1024. Top row: three SQUARE bricks (1:1). Bottom row: three WIDE bricks (2:1). Columns left to right: intact, cracked (thin cracks and one small chip), nearly broken (deep cracks, two missing chips, still one piece). All six are the same colour family: [COLOUR NAME, HEX, e.g. teal #22C4B0].
Look: glazed ceramic tile, a coloured body under a thick clear glossy coat, one crisp bright highlight band along the top edge, a soft darker bottom edge, slightly rounded corners and a thin dark separator rim. Viewed straight on, orthographic, lit from the top-left. No mortar, no wall, no shadow on the ground, no texture noise.
Every brick of the same width is exactly the same size and shape. Bricks are perfectly rectangular silhouettes.
BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers.
```

Repeat for: sun #FFC73D, coral #FF6F61, violet #8F5CF0, teal #22C4B0, blue #4F9DFF. For the Gatehouse hall use brick red, ivory/cream and sage green.

## 2. Special bricks (keystone, rune, cache, granite, moonstone)

Attach: `examples/vault-bricks.png`.

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: production sprite sheet of special bricks.
Asset type: 4 columns by 2 rows, landscape 1536x1024, eight bricks, all the SAME ordinary size (1:1 square, or 2:1 wide where marked). Every brick has the same glazed ceramic tile look as the normal bricks (thick clear coat, top highlight band, dark separator rim, rounded corners), viewed straight on, lit from the top-left.
Left to right, top to bottom:
1. KEYSTONE brick, same size as a normal brick, in [FAMILY COLOUR]: a clear carved rune in the centre (a simple bold sigil that reads at 40 px) filled with a soft [RUNE COLOUR] glow, set inside a slightly raised brass bezel. It must look special but ordinary in size, never a tiny target.
2. KEYSTONE brick, wide (2:1), same rune style.
3. RUNE brick, calm: the same rune but dull and unlit.
4. GEM CACHE brick: a faceted ruby-red gem set in a small brass socket in the centre of a gold-trimmed tile, a few glints. Breaking it drops a power-up.
5. GRANITE block (indestructible): dark granite #4A4F6E, clearly different in SHAPE as well as colour (chamfered, riveted iron corners, no gloss highlight band), reads as unbreakable.
6. GRANITE block, wide (2:1).
7. MOONSTONE brick: pale violet faceted moonstone in a silver setting.
8. SOLID IRON brick (armour): grey-blue brushed metal with four rivets.
BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers.
```

## 3. Dragon's hoard bricks (gold coin family, new)

Attach: `examples/vault-bricks.png` (for the gloss only). There will be about 200 of these on one screen, so they must be simple and readable at 16 units wide.

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: production sprite sheet of treasure bricks for a dense level (about 200 on screen at once).
Asset type: 4 columns by 3 rows, landscape 1536x1024, twelve SQUARE bricks (1:1), all the same size, glazed ceramic tile look, viewed straight on, lit from the top-left.
Rows: top row COIN bricks (four variants: plain gold coin stack, coin with a crown stamp, coin with a star stamp, coin with a small chip); middle row GEM bricks (ruby red, emerald green, sapphire blue, amethyst violet, each a faceted gem in a brass setting, power-up carriers); bottom row STATES: MOLTEN gold brick (glowing orange-gold, soft drip at the bottom edge, irregular glow not a circle), HARDENED gold brick (the same brick cooled, with a dark crust and a crack, needs 2 hits), CLAW OF GOLD (a larger brass claw tile holding a sun-coloured stone, still square), EMPTY brass setting.
Gold is the star of this level, but keep it warm and rich (deep brass, honey gold), not flat yellow, and keep each coin face readable with a bold simple stamp.
BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers.
```

## 4. Castle props (machinery)

Attach: `examples/gatehouse-first-pass.png`. Fill in the prop list, or use the Gatehouse default below.

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: production sprite sheet of castle machinery props.
Asset type: 3 columns by 2 rows, landscape 1536x1024, six separate props, each complete in its own cell, orthographic, front view, lit from the top-left. Materials: aged warm brass and bronze, dark blued gunmetal, weathered stone with iron straps, polished like glazed toys, never rough photoreal.
Left to right, top to bottom (Gatehouse set; replace the list for another level):
1. BELL: a heavy bronze bell with a small crown emblem, a top loop, a slightly dented rim, 1:1 proportions.
2. CHAIN: one vertical strip of chunky iron chain links (about 5 links long), straight, usable as a repeating strip.
3. PORTCULLIS GATE: an iron-banded wooden gate with studs, in a stone frame, a small ring at the top.
4. COUNTERWEIGHT HOUSING: a stone cube with iron straps and a ring on top, four small rivet counters (pips) along the bottom edge.
5. WINCH WHEEL: a big oblique wooden-and-iron wheel with spokes, a ratchet teeth ring and a mounting base.
6. DRAWBRIDGE PLANK: a thick wooden plank bridge section with iron straps and two chain eyelets.
Every prop is a connected solid object with its moving parts (wheel, bell) clearly separate from its mount. No people, no animals, no glow.
BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers.
```

## 5. Window kit: back recess and front lip (two layers)

The serpent's neck has to look like it passes through the opening. So the window is built as two separate layers with an exactly matching canvas: the **back recess** (a dark tunnel interior), the serpent in the middle, then the **front lip** (stone arch and sill) drawn on top.

Opening size: 32 units wide and 44 units tall with a round arch on top (arch radius 16). Whole frame about 52x64 units; the image canvas is 60x72 units (a 5:6 portrait canvas).

### 5a. Front lip and arch

Attach: `examples/serpent-window.png`.

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: production layer of a castle tower window (FRONT layer).
Asset type: ONE image, portrait 5:6 (for example 1024x1229), a stone window arch seen straight on, lit from the top-left. A round-topped arch of chunky dark slate stones (about 9 voussoir stones), a thick stone sill at the bottom with a raised front lip, a small carved keystone with a dark lens in the middle of the arch top, bevelled glazed look, slightly blue-grey stone (#3A3F55), crisp highlights on the top-left edges.
IMPORTANT: the inside of the opening (a tall rounded rectangle with a semicircular top, about 60% of the width and 65% of the height) is fully TRANSPARENT (a real hole in the alpha), so another picture can show through. The sill's front lip at the bottom of the opening stays opaque. Centre the arch exactly in the canvas.
No tunnel interior, no background, no snake, no text.
BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers.
```

### 5b. Back recess (create it by editing 5a so it registers exactly)

Attach the result of 5a.

```
Use case: precise-object-edit.
Image 1 is the FRONT layer of a tower window. Create its matching BACK layer on a canvas of exactly the same size, with the opening in exactly the same position and shape: draw ONLY the inside of the window opening, a deep dark tunnel interior (very dark violet-black #1A1226, faint stone courses on the side walls, a slightly lighter floor at the bottom, the semicircular top vault visible), with soft darkness at the edges. Everything outside the opening shape is fully transparent. Do not draw the stone arch, the sill or the keystone. The edge of the opening must match image 1 exactly so the layers register pixel for pixel.
```

### 5c. Cracked front (optional)

```
Use case: precise-object-edit.
Image 1 is the intact front arch. Produce the same image with thin cracks and two small chipped stones along the arch and the sill. Keep the canvas, arch position, opening shape and transparency exactly the same.
```

## 6. FX sprites

No plain circles and no rings, ever. Every effect is irregular, chunky and textured, lit from the top-left like everything else, with a few variants so the game can pick, rotate and scale them. They are for big crashes and special moments; a single brick just fades.

Attach: `examples/vault-breach-screen.png` (shows real debris).

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: production sprite sheet of small game effects.
Asset type: 4 columns by 4 rows, landscape 1536x1024 (cells about 384x256), sixteen separate effect sprites, each one complete in its own cell. Every shape is irregular and asymmetrical, with a bright core or a hard highlight on the top-left edge. NO plain circles, NO rings, NO perfect round glows, NO long beams, NO lens flares.
Rows:
1. STONE CHIPS: four different chunky angular chips of dark slate with a lit top edge and a dust-grey break face.
2. GOLD SPARKS: four different little clusters of sharp, pointed, four- and five-pointed glints, bright warm gold with a white core, each cluster a different shape.
3. DUST PUFFS: four different soft lumpy dust and smoke clouds, cool grey-violet, with a lit top-left edge and a darker underside, irregular outline, semi-transparent edges.
4. CERAMIC SHARDS AND GEM SOCKETS: two sharp glazed ceramic shards (teal and coral, glossy on one face), one empty brass gem socket (a faceted brass bezel with a dark empty hole), one gem popping out of its socket (a faceted ruby with two glints).
BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers.
```

More FX (replace row contents): ember sparks, smoke wisps (no ghost blobs), molten gold drips, coin glints, stone dust ring-free cloud, ice chips, water splashes (irregular, bounded), snake crumbs (tiny brick crumbs), impact flash (angular star burst, not a circle).

## 7. Power-up icons

Attach: `examples/power-icons.png`. The existing set shows the style: each power is a **physical object**, not a flat pictogram, shown in a dark rounded card for review. They are displayed at about 48 px, so the silhouette must be bold and have a colour of its own.

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: production sprite sheet of power-up icons.
Asset type: 3 columns by 3 rows, landscape 1536x1024, nine separate icons, each ONE physical object centred in its own cell, with a strong silhouette that still reads at 48 px. Rendered objects with real thickness, a clear coat and a soft shadow-free lit look from the top-left. No frame, no card, no text, no letters, no plus or minus signs.
Left to right, top to bottom:
1. BRICK WARD: a blue heraldic shield with a small stack of golden bricks as its emblem.
2. ARROWS: three steel-tipped arrows with copper shafts and red fletching, fanned out and pointing up.
3. COSMIC: a violet glass orb with swirling stars inside, in a thin silver ring.
4. BALL FAN: five chrome balls fanned out in an arc.
5. RAM BALL: a dark chrome ball with two curled brass ram horns on its sides and a small face plate.
6. LULLABY: a pale lilac crescent moon with a rose-pink music note.
7. STARLIGHT NOTES: a gold star with two small music notes (teal and rose) floating beside it.
8. SONG SHIELD: a pink arched barrier like a small rainbow, with a gold note on it.
9. RAM BALL (song version): a rose-pink glass sphere with a golden note inside.
BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers.
```

To make new icons, keep the same prompt and replace the nine lines with `[NUMBER. NAME: one physical object, what it is made of, its colour]`.

## 8. Capsules (falling pickups)

Attach: `examples/vault-bricks.png` (the capsules row if visible) or the in-game capsule you like.

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: production sprite sheet of falling power-up capsules.
Asset type: 3 columns by 3 rows, landscape 1536x1024, nine separate capsules, each a horizontal glossy glass-and-metal pill with a 1.85:1 aspect ratio, brushed metal end caps, a coloured liquid body, thick clear coat, a bright highlight band along the top, and one small embossed symbol in the middle (symbols only, no letters). Lit from the top-left, viewed straight on, same size in every cell.
Left to right, top to bottom, with body colour and symbol:
1. SPLIT: green #5CCF6A, three small balls.
2. FIRE: orange #FF8A3D, a flame.
3. WIDE: blue #3FA8F5, two arrows pointing apart.
4. AIM: purple #C46BF0, a crosshair of four ticks (not a ring).
5. BURST: warm gold #F7C948, three small balls in a row.
6. LASER: red #FF4D6D, a vertical bolt.
7. SHIELD: teal #2EC4B6, a small shield.
8. SLOW: light blue #7FD6FF, a snowflake.
9. TINY (a bad power-up): dull grey #5A5F78, two arrows pointing inward.
BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers.
```
