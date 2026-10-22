# 10 - Characters and creatures

Templates for heroes, villains and animals, then ready-to-paste worked examples. All of these follow the same recipe so a new creature always arrives with the same four deliverables:

| Sheet | What it is for |
|---|---|
| Turnaround | One look that everyone agrees on (front, three-quarter, side, back). |
| Expression sheet | The faces. Every character needs at least twelve that read at 56 px. |
| Keypose sheet | The poses the game actually uses, drawn honestly so we can fit collision circles to them. |
| Tell pose | The telegraph before an attack: rest, tell, release. |

Heroes also get a **face-orb set** (round portraits). Creatures that move parts get a **parts sheet**.

## How to use

1. Start with the turnaround. Pick one result. Keep it.
2. Attach that picked turnaround to every later sheet for the same character, and say "same character as the attached image".
3. Generate each later sheet in the same chat so the model keeps the look.
4. Delivery size and padding for the final art is in `60-sprite-sheet-delivery.md`; the keypose, tell and parts prompts below already ask for a transparent background.

## Make a new creature (anatomy card)

Fill this card first. Every new creature gets a different answer to every line, so we never repeat one body template.

```
NAME: [name]
ROLE: [boss / ally / ambient / companion]
LEGS: [0, 2, 4, 6; walks, slithers, floats]
LIMBS THAT GRAB: [none / short arms / claws / beak and talons / hoof]
SILHOUETTE: [one shape word: low mound, tall tower, crescent, wedge, spiral]
HEAD SHAPE: [blunt, angular, flat, beaked, stalked eyes]
EYES AND BROWS: [how the eyes sit and what the brows or lids do]
SIGNATURE MATERIAL: [glazed ceramic plates / feathers / stone blocks / shell]
PALETTE: [3 colours with hex codes, minimal yellow]
HOW IT TELLS AN ATTACK: [one physical cue the player can see for 1.2-1.8 s]
WHAT MUST NOT HAPPEN: [for example no long arms, no human hands]
```

Paste the finished card where the templates below say `[CHARACTER CARD]`.

## Generic templates

### Turnaround


```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: character design sheet.
Asset type: turnaround sheet, landscape 1536x1024, ONE character shown in four views in one row, evenly spaced: front, three-quarter, side, back. Same character, same proportions, same size, same lighting and the same ground line in every view.
Character: [CHARACTER CARD]
Pose: relaxed neutral standing pose, mouth closed, eyes looking forward. The complete body is visible in every view, nothing cropped.
Background: plain dark navy #141831. No text, no labels, no ground shadow patches.
Quality checks: unique silhouette that reads at 100 px tall; clean continuous construction with no seams or floating parts; consistent colours in all four views.
```

### Expression sheet

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: expression sheet.
Asset type: 4 columns by 3 rows grid, landscape 1536x1024, twelve head close-ups (with neck or shoulders) of the SAME character: same head shape, same proportions, same costume and colours, same camera, same lighting. Evenly spaced cells with generous gaps. Front view (a slight three-quarter turn is allowed for the beast heads, but the same turn in every cell).
Character: [CHARACTER CARD]
Expressions, left to right, top to bottom:
1. [EXPRESSION 1, with eyes, brows and mouth described]
2. [EXPRESSION 2]
3. ... up to 12; good defaults: idle, focus, nervous, panic, cheer, hurt, laugh, dizzy, smug, shock, sleepy, angry
Rule: any two faces must differ in the eyes, the brows AND the mouth together, and the difference must still be obvious when the image is shrunk to 56 px per face. Body language (head tilt, ears, crest, shoulders) reinforces each emotion.
Background: plain dark navy #141831. No text, no labels, no numbers.
```

### Pose / keypose sheet for collision

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: collision keypose sheet (production sprite sheet; we will measure the art with circles, so the silhouette must be honest).
Asset type: 3 columns by 2 rows grid, landscape 1536x1024, SIX poses of the SAME character, one pose per cell, same camera, same scale, same lighting, same ground line. Camera: strict side view, facing right. Orthographic.
Character: [CHARACTER CARD]
Poses, left to right, top to bottom:
1. [POSE 1]
2. [POSE 2]
3. ... six poses; good defaults: idle, wind-up (tell), release, stagger, dazed, defeat
Collision rules: the silhouette is solid and clearly drawn; real gaps (between legs, under the belly, between jaws, between wings and body, between horns) stay visibly empty; no motion blur, no speed lines, no dust, no glow or fire merged into the body, no cast shadow touching the body; the supporting feet of every pose sit on the same invisible baseline. The whole body is inside its cell with at least 10% free margin.
BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers.
```

### Attack anticipation (tell) pose

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: attack telegraph sequence (production sprite sheet).
Asset type: 3 cells in ONE row, landscape 1536x512, the SAME character in the same camera, scale and ground line. Strict side view, facing right.
Character: [CHARACTER CARD]
Cell 1, REST: neutral standing pose, calm face.
Cell 2, TELL (the player must read this from the silhouette alone, at 100 px tall, and have 1.2 to 1.8 seconds to react): [THE ONE PHYSICAL CUE, e.g. "chest inflates, cheeks puff, throat glows soft orange, jaw opens"]. The pose must differ from REST in at least two body parts. The cue is purely physical, never magical; no glowing rings.
Cell 3, RELEASE: [WHAT THE ATTACK IS, e.g. "a short chunky puff of flame"].
Keep every pose a complete, uncropped figure with the same proportions and colours. No motion blur or speed lines.
BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers.
```

### Face-orb set (heroes)

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: face-orb portrait set (round game portraits).
Asset type: 4 columns by 3 rows, landscape 1536x1024, twelve head-and-shoulders portraits of [NAME], each composed to be cropped into a circle: the face centred, the head filling about 80% of the cell, shoulders showing at the bottom, same camera and lighting in every cell. Very large readable faces: they will be shown at only 56 px.
Character: [CHARACTER CARD]
Expressions, left to right, top to bottom: 1 idle determined, 2 focus, 3 grin, 4 shock, 5 worried, 6 cheer, 7 hurt, 8 laugh, 9 nervous, 10 panic, 11 smug, 12 singing or sleepy. Each differs in eyes, brows and mouth together.
Background: plain dark navy #141831. No circle frames, no text, no labels.
```

### Parts sheet (for rotating wings, jaws, tails)

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: layered parts sheet for 2D animation (we rotate the parts around pivots in code).
Asset type: landscape 1536x1024, the SAME character taken apart into separate parts, each part drawn complete on its own in its own cell with free space around it: body with legs, head, lower jaw (open slightly), left wing or ear, right wing or ear, tail, [ANY OTHER MOVING PART]. Draw each part COMPLETE, including the portion that is normally hidden under its neighbour, with a little overlap so rotating it never shows a gap. Same colours, scale, lighting and camera as a full-body side view facing right. Mark each pivot (shoulder, neck, jaw hinge, tail root) with one small white dot.
Character: [CHARACTER CARD]
BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers.
```

## Worked examples

Each block is already filled in. Attach the picture named under "Attach" first when there is one. Names marked "new" are working names.


### Kit (hero knight)

Hero. An underdog knight kid. Existing character: attach examples/kit-sprite-and-face.png and examples/lumi-faces.png (Kit is the left column) and keep the design.

Attach: examples/kit-sprite-and-face.png, examples/lumi-faces.png

**Turnaround**

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: character design sheet.
Asset type: turnaround sheet, landscape 1536x1024, ONE character shown in four views in one row, evenly spaced: front, three-quarter, side, back. Same character, same proportions, same size, same lighting and the same ground line in every view.
Character: KIT, an underdog knight kid, chibi, head about 40% of total height. Round cobalt-blue steel open-face helmet with a wide face opening and a single centre ridge; big blue-grey eyes with brows that move; a small integrated nose; one continuous skin face (no moustache, no muzzle, no seam). Dark blue plate armour with silver trim, a little coral cloth at the neck, sturdy boots. A broad blue heraldic kite shield with a lightning-bolt emblem: broad shoulders, tapered pointed bottom, visible rim and thickness, held on a rear grip, kept beside and below the face. Dominant colours cobalt, indigo and steel; minimal yellow. He must read as a knight from the silhouette alone and look nothing like Lumi.
Pose: relaxed neutral standing pose, mouth closed, eyes looking forward. The complete body is visible in every view, nothing cropped.
Background: plain dark navy #141831. No text, no labels, no ground shadow patches.
Quality checks: unique silhouette that reads at 100 px tall; clean continuous construction with no seams or floating parts; consistent colours in all four views.
```

**Expression sheet**

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: expression sheet.
Asset type: 4 columns by 3 rows grid, landscape 1536x1024, twelve head-and-shoulders close-ups of the SAME character: same head shape, same proportions, same costume and colours, same camera, same lighting. Evenly spaced cells with generous gaps. Front view (a slight three-quarter turn is allowed for the beast heads, but the same turn in every cell).
Character: KIT, an underdog knight kid, chibi, head about 40% of total height. Round cobalt-blue steel open-face helmet with a wide face opening and a single centre ridge; big blue-grey eyes with brows that move; a small integrated nose; one continuous skin face (no moustache, no muzzle, no seam). Dark blue plate armour with silver trim, a little coral cloth at the neck, sturdy boots. A broad blue heraldic kite shield with a lightning-bolt emblem: broad shoulders, tapered pointed bottom, visible rim and thickness, held on a rear grip, kept beside and below the face. Dominant colours cobalt, indigo and steel; minimal yellow. He must read as a knight from the silhouette alone and look nothing like Lumi.
Expressions, left to right, top to bottom:
1. idle: determined (calm, mouth closed, level brows)
2. focus: aiming (narrowed eyes, low brows, flat mouth)
3. grin: combo (confident smile, one brow up)
4. shock: life lost (huge eyes, tiny pupils, mouth open)
5. worried: danger (brows tilted up in the middle, small wobbly mouth, sweat drop)
6. cheer: win (eyes closed as happy arcs, big open smile)
7. hurt: hit (eyes squeezed shut as > <, gritted teeth)
8. laugh: titan power (head tipped back, wide open mouth, eye creases)
9. dizzy: (spiral eyes, tongue out, little stars)
10. smug: (half-lidded eyes, lopsided smirk)
11. panic: (eyes huge and wet, mouth wide, sweat flying)
12. sleepy: (heavy lids, big yawn)
Rule: any two faces must differ in the eyes, the brows AND the mouth together, and the difference must still be obvious when the image is shrunk to 56 px per face. Body language (head tilt, ears, crest, shoulders) reinforces each emotion.
Background: plain dark navy #141831. No text, no labels, no numbers.
```

**Keypose sheet (collision)**

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: collision keypose sheet (production sprite sheet; we will measure the art with circles, so the silhouette must be honest).
Asset type: 3 columns by 2 rows grid, landscape 1536x1024, SIX poses of the SAME character, one pose per cell, same camera, same scale, same lighting, same ground line. Camera: front view, slightly three-quarter turned, the same turn in every cell. Orthographic.
Character: KIT, an underdog knight kid, chibi, head about 40% of total height. Round cobalt-blue steel open-face helmet with a wide face opening and a single centre ridge; big blue-grey eyes with brows that move; a small integrated nose; one continuous skin face (no moustache, no muzzle, no seam). Dark blue plate armour with silver trim, a little coral cloth at the neck, sturdy boots. A broad blue heraldic kite shield with a lightning-bolt emblem: broad shoulders, tapered pointed bottom, visible rim and thickness, held on a rear grip, kept beside and below the face. Dominant colours cobalt, indigo and steel; minimal yellow. He must read as a knight from the silhouette alone and look nothing like Lumi.
Poses, left to right, top to bottom:
1. idle stance, shield at his side
2. guard: shield raised in front, knees bent
3. run: mid-stride, leaning forward
4. hit: recoiling backwards, shield swinging out
5. cheer: both arms up, shield overhead
6. panic: crouched, shield clutched to chest
Collision rules: the silhouette is solid and clearly drawn; real gaps (between legs, under the belly, between jaws, between wings and body, between horns) stay visibly empty; no motion blur, no speed lines, no dust, no glow or fire merged into the body, no cast shadow touching the body; the supporting feet of every pose sit on the same invisible baseline. The whole body is inside its cell with at least 10% free margin.
BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers.
```

**Face-orb set**

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: face-orb portrait set (round game portraits).
Asset type: 4 columns by 3 rows, landscape 1536x1024, twelve head-and-shoulders portraits of Kit, each composed to be cropped into a circle: the face centred, the head filling about 80% of the cell, shoulders showing at the bottom, same camera and lighting in every cell. Very large readable faces: they will be shown at only 56 px.
Character: KIT, an underdog knight kid, chibi, head about 40% of total height. Round cobalt-blue steel open-face helmet with a wide face opening and a single centre ridge; big blue-grey eyes with brows that move; a small integrated nose; one continuous skin face (no moustache, no muzzle, no seam). Dark blue plate armour with silver trim, a little coral cloth at the neck, sturdy boots. A broad blue heraldic kite shield with a lightning-bolt emblem: broad shoulders, tapered pointed bottom, visible rim and thickness, held on a rear grip, kept beside and below the face. Dominant colours cobalt, indigo and steel; minimal yellow. He must read as a knight from the silhouette alone and look nothing like Lumi.
Expressions, left to right, top to bottom: 1 idle determined, 2 focus, 3 grin, 4 shock, 5 worried, 6 cheer, 7 hurt, 8 laugh, 9 nervous, 10 panic, 11 smug, 12 singing or sleepy. Each differs in eyes, brows and mouth together.
Background: plain dark navy #141831. No circle frames, no text, no labels.
```


### Lumi (hero princess)

Hero. Princess, now a playable hero. Existing character: attach examples/lumi-faces.png and examples/lumi-breaks-out-board.png and keep the design.

Attach: examples/lumi-faces.png

**Turnaround**

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: character design sheet.
Asset type: turnaround sheet, landscape 1536x1024, ONE character shown in four views in one row, evenly spaced: front, three-quarter, side, back. Same character, same proportions, same size, same lighting and the same ground line in every view.
Character: LUMI, a princess, chibi, head about 40% of total height. Honey-blonde hair in one coherent glossy cap with a few broad locks; a tiny gold filigree tiara with a faceted rose-pink gem; big glossy turquoise eyes with two catch-lights, real eyelids, lash line and expressive brows; small nose; rosy cheek blush. Rose-pink dress with a flared bell skirt and lace petticoat, ivory gloves, white tights, rose shoes, small gold trims. Satin vinyl skin. Dominant colours rose, honey and ivory; minimal yellow. Clearly different from Kit in silhouette (a bell skirt against his armour and shield).
Pose: relaxed neutral standing pose, mouth closed, eyes looking forward. The complete body is visible in every view, nothing cropped.
Background: plain dark navy #141831. No text, no labels, no ground shadow patches.
Quality checks: unique silhouette that reads at 100 px tall; clean continuous construction with no seams or floating parts; consistent colours in all four views.
```

**Expression sheet**

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: expression sheet.
Asset type: 4 columns by 3 rows grid, landscape 1536x1024, twelve head-and-shoulders close-ups of the SAME character: same head shape, same proportions, same costume and colours, same camera, same lighting. Evenly spaced cells with generous gaps. Front view (a slight three-quarter turn is allowed for the beast heads, but the same turn in every cell).
Character: LUMI, a princess, chibi, head about 40% of total height. Honey-blonde hair in one coherent glossy cap with a few broad locks; a tiny gold filigree tiara with a faceted rose-pink gem; big glossy turquoise eyes with two catch-lights, real eyelids, lash line and expressive brows; small nose; rosy cheek blush. Rose-pink dress with a flared bell skirt and lace petticoat, ivory gloves, white tights, rose shoes, small gold trims. Satin vinyl skin. Dominant colours rose, honey and ivory; minimal yellow. Clearly different from Kit in silhouette (a bell skirt against his armour and shield).
Expressions, left to right, top to bottom:
1. idle: calm, a small smile
2. focus: aiming (narrowed eyes, low brows, flat mouth)
3. nervous: brows tilted up in the middle, wobbly mouth, one sweat drop
4. panic: eyes huge, mouth open wide, sweat flying
5. cheer: eyes closed as happy arcs, big open smile
6. hurt: eyes squeezed as > <, gritted teeth
7. laugh: head tipped back, wide open mouth
8. dizzy: spiral eyes, tongue out, little stars
9. smug: half-lidded eyes, sly smile, one brow up
10. shock: huge eyes, tiny pupils, mouth open
11. singing: eyes closed, mouth in a soft round "oh", small music note beside the head
12. determined: brows level and low, mouth set, chin up
Rule: any two faces must differ in the eyes, the brows AND the mouth together, and the difference must still be obvious when the image is shrunk to 56 px per face. Body language (head tilt, ears, crest, shoulders) reinforces each emotion.
Background: plain dark navy #141831. No text, no labels, no numbers.
```

**Keypose sheet (collision)**

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: collision keypose sheet (production sprite sheet; we will measure the art with circles, so the silhouette must be honest).
Asset type: 3 columns by 2 rows grid, landscape 1536x1024, SIX poses of the SAME character, one pose per cell, same camera, same scale, same lighting, same ground line. Camera: front view, slightly three-quarter turned, the same turn in every cell. Orthographic.
Character: LUMI, a princess, chibi, head about 40% of total height. Honey-blonde hair in one coherent glossy cap with a few broad locks; a tiny gold filigree tiara with a faceted rose-pink gem; big glossy turquoise eyes with two catch-lights, real eyelids, lash line and expressive brows; small nose; rosy cheek blush. Rose-pink dress with a flared bell skirt and lace petticoat, ivory gloves, white tights, rose shoes, small gold trims. Satin vinyl skin. Dominant colours rose, honey and ivory; minimal yellow. Clearly different from Kit in silhouette (a bell skirt against his armour and shield).
Poses, left to right, top to bottom:
1. idle stance, hands together in front
2. run: mid-stride, skirt swinging, leaning forward
3. jump: both feet off the ground, skirt flared up
4. panic: hands up by her face, leaning away
5. cheer: both arms up
6. sing: one hand on her chest, other arm out, head tilted up
Collision rules: the silhouette is solid and clearly drawn; real gaps (between legs, under the belly, between jaws, between wings and body, between horns) stay visibly empty; no motion blur, no speed lines, no dust, no glow or fire merged into the body, no cast shadow touching the body; the supporting feet of every pose sit on the same invisible baseline. The whole body is inside its cell with at least 10% free margin.
BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers.
```

**Face-orb set**

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: face-orb portrait set (round game portraits).
Asset type: 4 columns by 3 rows, landscape 1536x1024, twelve head-and-shoulders portraits of Lumi, each composed to be cropped into a circle: the face centred, the head filling about 80% of the cell, shoulders showing at the bottom, same camera and lighting in every cell. Very large readable faces: they will be shown at only 56 px.
Character: LUMI, a princess, chibi, head about 40% of total height. Honey-blonde hair in one coherent glossy cap with a few broad locks; a tiny gold filigree tiara with a faceted rose-pink gem; big glossy turquoise eyes with two catch-lights, real eyelids, lash line and expressive brows; small nose; rosy cheek blush. Rose-pink dress with a flared bell skirt and lace petticoat, ivory gloves, white tights, rose shoes, small gold trims. Satin vinyl skin. Dominant colours rose, honey and ivory; minimal yellow. Clearly different from Kit in silhouette (a bell skirt against his armour and shield).
Expressions, left to right, top to bottom: 1 idle determined, 2 focus, 3 grin, 4 shock, 5 worried, 6 cheer, 7 hurt, 8 laugh, 9 nervous, 10 panic, 11 smug, 12 singing or sleepy. Each differs in eyes, brows and mouth together.
Background: plain dark navy #141831. No circle frames, no text, no labels.
```


### Korr (boar boss, Bellforge)

Existing villain boar. Attach examples/korr-boar.png and keep the design.

Attach: examples/korr-boar.png

**Turnaround**

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: character design sheet.
Asset type: turnaround sheet, landscape 1536x1024, ONE character shown in four views in one row, evenly spaced: front, three-quarter, side, back. Same character, same proportions, same size, same lighting and the same ground line in every view.
Character: KORR, an original heavy FOUR-LEGGED ARMOURED BOAR boss. Broad ruby-and-plum glazed ceramic shoulder plates, dark gunmetal joints, ivory curved tusks, four stout hoofed legs with convincing weight, an enormous polished snout, fierce but mischievous amber eyes with heavy lids. He has hooves, not hands: he works a lever with a front hoof. No human arms, no ape, no barrel or scaffold shapes. Low, wide, powerful silhouette; head about one third of body length.
Pose: relaxed neutral standing pose, mouth closed, eyes looking forward. The complete body is visible in every view, nothing cropped.
Background: plain dark navy #141831. No text, no labels, no ground shadow patches.
Quality checks: unique silhouette that reads at 100 px tall; clean continuous construction with no seams or floating parts; consistent colours in all four views.
```

**Expression sheet**

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: expression sheet.
Asset type: 4 columns by 3 rows grid, landscape 1536x1024, twelve head close-ups (with neck or shoulders) of the SAME character: same head shape, same proportions, same costume and colours, same camera, same lighting. Evenly spaced cells with generous gaps. Front view (a slight three-quarter turn is allowed for the beast heads, but the same turn in every cell).
Character: KORR, an original heavy FOUR-LEGGED ARMOURED BOAR boss. Broad ruby-and-plum glazed ceramic shoulder plates, dark gunmetal joints, ivory curved tusks, four stout hoofed legs with convincing weight, an enormous polished snout, fierce but mischievous amber eyes with heavy lids. He has hooves, not hands: he works a lever with a front hoof. No human arms, no ape, no barrel or scaffold shapes. Low, wide, powerful silhouette; head about one third of body length.
Expressions, left to right, top to bottom:
1. idle: smug and heavy-lidded
2. snort: nostrils flared, brow lowered
3. angry: brow slammed down, tusks bared
4. charge: eyes wide and fixed, teeth gritted
5. hurt: eyes squeezed, mouth open in a yelp
6. stagger: eyes wide, startled, ears back
7. dazed: eyes spinning, tongue out, tiny stars
8. laugh: head back, wide grin, eyes creased
9. sulk: eyes half shut, mouth turned down
10. defeat: eyes closed, tongue out, slumped
11. surprised: eyes round, brows high
12. sneer: one brow up, lip curled over a tusk
Rule: any two faces must differ in the eyes, the brows AND the mouth together, and the difference must still be obvious when the image is shrunk to 56 px per face. Body language (head tilt, ears, crest, shoulders) reinforces each emotion.
Background: plain dark navy #141831. No text, no labels, no numbers.
```

**Keypose sheet (collision)**

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: collision keypose sheet (production sprite sheet; we will measure the art with circles, so the silhouette must be honest).
Asset type: 3 columns by 2 rows grid, landscape 1536x1024, SIX poses of the SAME character, one pose per cell, same camera, same scale, same lighting, same ground line. Camera: strict side view, facing right. Orthographic.
Character: KORR, an original heavy FOUR-LEGGED ARMOURED BOAR boss. Broad ruby-and-plum glazed ceramic shoulder plates, dark gunmetal joints, ivory curved tusks, four stout hoofed legs with convincing weight, an enormous polished snout, fierce but mischievous amber eyes with heavy lids. He has hooves, not hands: he works a lever with a front hoof. No human arms, no ape, no barrel or scaffold shapes. Low, wide, powerful silhouette; head about one third of body length.
Poses, left to right, top to bottom:
1. idle: standing, weight on all four legs
2. wind-up: front hoof lifts a lever, head lowered, shoulders gathered
3. release: lunging forward, front hoof extended past the support plane
4. stagger: rocked back on his haunches, front hooves off the ground
5. dazed: swaying, head low, eyes spinning
6. defeat: slumped flat on his belly, armour plates loose
Collision rules: the silhouette is solid and clearly drawn; real gaps (between legs, under the belly, between jaws, between wings and body, between horns) stay visibly empty; no motion blur, no speed lines, no dust, no glow or fire merged into the body, no cast shadow touching the body; the supporting feet of every pose sit on the same invisible baseline. The whole body is inside its cell with at least 10% free margin.
BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers.
```

**Attack tell pose**

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: attack telegraph sequence (production sprite sheet).
Asset type: 3 cells in ONE row, landscape 1536x512, the SAME character in the same camera, scale and ground line. Strict side view, facing right.
Character: KORR, an original heavy FOUR-LEGGED ARMOURED BOAR boss. Broad ruby-and-plum glazed ceramic shoulder plates, dark gunmetal joints, ivory curved tusks, four stout hoofed legs with convincing weight, an enormous polished snout, fierce but mischievous amber eyes with heavy lids. He has hooves, not hands: he works a lever with a front hoof. No human arms, no ape, no barrel or scaffold shapes. Low, wide, powerful silhouette; head about one third of body length.
Cell 1, REST: neutral standing pose, calm face.
Cell 2, TELL (the player must read this from the silhouette alone, at 100 px tall, and have 1.2 to 1.8 seconds to react): front hoof lifts a bell-release lever, nostrils flare, head drops low. The pose must differ from REST in at least two body parts. The cue is purely physical, never magical; no glowing rings.
Cell 3, RELEASE: the lever slams down and a heavy iron bell rolls away; his shoulders surge forward.
Keep every pose a complete, uncropped figure with the same proportions and colours. No motion blur or speed lines.
BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers.
```


### Nerra (crab queen, Tidewheel)

Existing villain crab. Attach examples/nerra-crab.png and keep the design.

Attach: examples/nerra-crab.png

**Turnaround**

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: character design sheet.
Asset type: turnaround sheet, landscape 1536x1024, ONE character shown in four views in one row, evenly spaced: front, three-quarter, side, back. Same character, same proportions, same size, same lighting and the same ground line in every view.
Character: NERRA, an original gigantic HERMIT-CRAB QUEEN. A ruined mini-fortress with towers and little red flags spirals naturally out of her shell; deep oxblood-and-coral glossy shell plates, black pearl joints, TWO huge asymmetrical front claws (one massive crusher claw, one slender claw that handles a sluice gate and wheel), four pairs of short articulated walking legs, and expressive menacing eyes on short armoured stalks above a heavy brow plate. She is a real crab creature: no human torso, no arms, no bow, no costume. Heavy, low, wide silhouette.
Pose: relaxed neutral standing pose, mouth closed, eyes looking forward. The complete body is visible in every view, nothing cropped.
Background: plain dark navy #141831. No text, no labels, no ground shadow patches.
Quality checks: unique silhouette that reads at 100 px tall; clean continuous construction with no seams or floating parts; consistent colours in all four views.
```

**Expression sheet**

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: expression sheet.
Asset type: 4 columns by 3 rows grid, landscape 1536x1024, twelve head close-ups (with neck or shoulders) of the SAME character: same head shape, same proportions, same costume and colours, same camera, same lighting. Evenly spaced cells with generous gaps. Front view (a slight three-quarter turn is allowed for the beast heads, but the same turn in every cell).
Character: NERRA, an original gigantic HERMIT-CRAB QUEEN. A ruined mini-fortress with towers and little red flags spirals naturally out of her shell; deep oxblood-and-coral glossy shell plates, black pearl joints, TWO huge asymmetrical front claws (one massive crusher claw, one slender claw that handles a sluice gate and wheel), four pairs of short articulated walking legs, and expressive menacing eyes on short armoured stalks above a heavy brow plate. She is a real crab creature: no human torso, no arms, no bow, no costume. Heavy, low, wide silhouette.
Expressions, left to right, top to bottom:
1. idle: heavy-lidded, menacing calm
2. angry: brow plates slammed down, eyes narrowed
3. smug: one eye stalk tilted, lids half shut
4. hurt: eyes squeezed shut, stalks pulled back
5. dazed: eyes spinning on drooping stalks
6. fury: eyes wide and blazing, mouthparts spread
7. surprised: both eyes shot up on stretched stalks
8. laugh: stalks bobbing, eyes creased, mouthparts open
9. sulk: eyes drooped low, stalks lowered
10. defeat: eyes closed, stalks limp
11. focus: both eyes locked forward, stalks aligned
12. gloat: eyes narrowed with a sly side look
Rule: any two faces must differ in the eyes, the brows AND the mouth together, and the difference must still be obvious when the image is shrunk to 56 px per face. Body language (head tilt, ears, crest, shoulders) reinforces each emotion.
Background: plain dark navy #141831. No text, no labels, no numbers.
```

**Keypose sheet (collision)**

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: collision keypose sheet (production sprite sheet; we will measure the art with circles, so the silhouette must be honest).
Asset type: 3 columns by 2 rows grid, landscape 1536x1024, SIX poses of the SAME character, one pose per cell, same camera, same scale, same lighting, same ground line. Camera: strict side view, facing right. Orthographic.
Character: NERRA, an original gigantic HERMIT-CRAB QUEEN. A ruined mini-fortress with towers and little red flags spirals naturally out of her shell; deep oxblood-and-coral glossy shell plates, black pearl joints, TWO huge asymmetrical front claws (one massive crusher claw, one slender claw that handles a sluice gate and wheel), four pairs of short articulated walking legs, and expressive menacing eyes on short armoured stalks above a heavy brow plate. She is a real crab creature: no human torso, no arms, no bow, no costume. Heavy, low, wide silhouette.
Poses, left to right, top to bottom:
1. idle: standing on her four leg pairs, claws at rest
2. pull: slender claw turning the sluice wheel, crusher claw braced
3. step: one leg group forward, shell tilting
4. hurt: rocked backwards, claws flung wide
5. fury: raised up on her rear legs, both claws spread
6. defeat: sunk low, claws limp on the ground
Collision rules: the silhouette is solid and clearly drawn; real gaps (between legs, under the belly, between jaws, between wings and body, between horns) stay visibly empty; no motion blur, no speed lines, no dust, no glow or fire merged into the body, no cast shadow touching the body; the supporting feet of every pose sit on the same invisible baseline. The whole body is inside its cell with at least 10% free margin.
BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers.
```

**Attack tell pose**

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: attack telegraph sequence (production sprite sheet).
Asset type: 3 cells in ONE row, landscape 1536x512, the SAME character in the same camera, scale and ground line. Strict side view, facing right.
Character: NERRA, an original gigantic HERMIT-CRAB QUEEN. A ruined mini-fortress with towers and little red flags spirals naturally out of her shell; deep oxblood-and-coral glossy shell plates, black pearl joints, TWO huge asymmetrical front claws (one massive crusher claw, one slender claw that handles a sluice gate and wheel), four pairs of short articulated walking legs, and expressive menacing eyes on short armoured stalks above a heavy brow plate. She is a real crab creature: no human torso, no arms, no bow, no costume. Heavy, low, wide silhouette.
Cell 1, REST: neutral standing pose, calm face.
Cell 2, TELL (the player must read this from the silhouette alone, at 100 px tall, and have 1.2 to 1.8 seconds to react): both claws grip the sluice wheel and the crusher claw lifts, shell windows light dimly. The pose must differ from REST in at least two body parts. The cue is purely physical, never magical; no glowing rings.
Cell 3, RELEASE: the claw closes the sluice with a crash and a low broad surge of water spills out.
Keep every pose a complete, uncropped figure with the same proportions and colours. No motion blur or speed lines.
BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers.
```


### Gnash (emerald serpent)

Existing serpent. Attach examples/snake-emerald-heads.png and keep the design. The body is drawn in code as one smooth tapered tube that follows the head, so only the HEAD (with a short neck) is needed.

Attach: examples/snake-emerald-heads.png, examples/serpent-window.png

**Turnaround**

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: character design sheet.
Asset type: turnaround sheet, landscape 1536x1024, ONE character shown in three HEAD views in one row, evenly spaced: front, three-quarter, side (facing right). Head and short neck only, plus below them one strip showing the smooth tapered body pattern (scale plates and belly) as a short straight segment. Same character, same proportions, same size, same lighting and the same ground line in every view.
Character: GNASH, a hungry, gleeful EMERALD SERPENT HEAD with a short neck, drawn facing RIGHT. An angular, faceted skull (never round, never a blob), a pointed snout, a heavy brow ridge with pink brows (#FF8A9B), yellow-green slit-pupil eyes with real eyelids, a wide mouth with fangs and a forked tongue. Colours: body teal-green #168F83, pale belly #C9E8D2, darker crown #0B5D59, outline #052D31, markings #83E4C2. Glossy glazed-ceramic scales with a few large readable plates, not tiny scales. The body is a smooth continuous tapered tube, never a chain of balls.
Pose: calm resting pose, mouth closed, eyes looking forward. The complete head and neck are visible in every view, nothing cropped.
Background: plain dark navy #141831. No text, no labels, no ground shadow patches.
Quality checks: unique silhouette that reads at 100 px tall; clean continuous construction with no seams or floating parts; consistent colours in all four views.
```

**Expression sheet**

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: expression sheet.
Asset type: 4 columns by 3 rows grid, landscape 1536x1024, twelve head close-ups (with neck or shoulders) of the SAME character: same head shape, same proportions, same costume and colours, same camera, same lighting. Evenly spaced cells with generous gaps. Front view (a slight three-quarter turn is allowed for the beast heads, but the same turn in every cell).
Character: GNASH, a hungry, gleeful EMERALD SERPENT HEAD with a short neck, drawn facing RIGHT. An angular, faceted skull (never round, never a blob), a pointed snout, a heavy brow ridge with pink brows (#FF8A9B), yellow-green slit-pupil eyes with real eyelids, a wide mouth with fangs and a forked tongue. Colours: body teal-green #168F83, pale belly #C9E8D2, darker crown #0B5D59, outline #052D31, markings #83E4C2. Glossy glazed-ceramic scales with a few large readable plates, not tiny scales. The body is a smooth continuous tapered tube, never a chain of balls.
Expressions, left to right, top to bottom:
1. idle: calm hunting stare
2. blink: eyes closed, mouth shut
3. taste: tongue flicking out
4. hunt: eyes narrowed, head lowered, brow down
5. chew 1: mouth half open, a crumb on the lip
6. chew 2: mouth clamped shut, cheeks bulged
7. hiss: mouth wide open, fangs out, brow raised (attack tell)
8. ouch: eyes squeezed shut, mouth open (hit by the ball)
9. dizzy: spiral eyes, tongue out, tiny stars
10. shock: eyes round, pupils tiny
11. snarl: lip curled, teeth bared, brow slammed down
12. grin: wide pleased grin, one brow up (gloat)
Rule: any two faces must differ in the eyes, the brows AND the mouth together, and the difference must still be obvious when the image is shrunk to 56 px per face. Body language (head tilt, ears, crest, shoulders) reinforces each emotion.
Background: plain dark navy #141831. No text, no labels, no numbers.
```

**Keypose sheet (collision)**

These are the lunge poses for the serpent windows. The head comes through a window opening, so the neck must be a smooth tube leaving the picture to the LEFT edge of each cell.

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: collision keypose sheet (production sprite sheet; we will measure the art with circles, so the silhouette must be honest).
Asset type: 3 columns by 2 rows grid, landscape 1536x1024, SIX head-and-neck poses of the SAME serpent (neck leaves the cell on the left side as a plain tube), one pose per cell, same camera, same scale, same lighting, same ground line. Camera: strict side view, facing right. Orthographic.
Character: GNASH, a hungry, gleeful EMERALD SERPENT HEAD with a short neck, drawn facing RIGHT. An angular, faceted skull (never round, never a blob), a pointed snout, a heavy brow ridge with pink brows (#FF8A9B), yellow-green slit-pupil eyes with real eyelids, a wide mouth with fangs and a forked tongue. Colours: body teal-green #168F83, pale belly #C9E8D2, darker crown #0B5D59, outline #052D31, markings #83E4C2. Glossy glazed-ceramic scales with a few large readable plates, not tiny scales. The body is a smooth continuous tapered tube, never a chain of balls.
Poses, left to right, top to bottom:
1. peek: only the top of the head and eyes showing, half hidden
2. hiss tell: head pushed forward, jaw open, brow raised
3. strike: head stretched far forward along a straight line, mouth open
4. chew: head low, mouth working, crumbs
5. hurt: head snapped back, eyes squeezed
6. dizzy: head drooping, eyes spiralling
Collision rules: the silhouette is solid and clearly drawn; real gaps (between legs, under the belly, between jaws, between wings and body, between horns) stay visibly empty; no motion blur, no speed lines, no dust, no glow or fire merged into the body, no cast shadow touching the body; the neck root sits at the same height on the left edge of every cell. The whole body is inside its cell with at least 10% free margin.
BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers.
```

**Attack tell pose**

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: attack telegraph sequence (production sprite sheet).
Asset type: 3 cells in ONE row, landscape 1536x512, the SAME character in the same camera, scale and ground line. Strict side view, facing right.
Character: GNASH, a hungry, gleeful EMERALD SERPENT HEAD with a short neck, drawn facing RIGHT. An angular, faceted skull (never round, never a blob), a pointed snout, a heavy brow ridge with pink brows (#FF8A9B), yellow-green slit-pupil eyes with real eyelids, a wide mouth with fangs and a forked tongue. Colours: body teal-green #168F83, pale belly #C9E8D2, darker crown #0B5D59, outline #052D31, markings #83E4C2. Glossy glazed-ceramic scales with a few large readable plates, not tiny scales. The body is a smooth continuous tapered tube, never a chain of balls.
Cell 1, REST: neutral standing pose, calm face.
Cell 2, TELL (the player must read this from the silhouette alone, at 100 px tall, and have 1.2 to 1.8 seconds to react): the head pushes forward to the window lip and the jaw opens wide. The pose must differ from REST in at least two body parts. The cue is purely physical, never magical; no glowing rings.
Cell 3, RELEASE: the head travels in a straight line across one row of bricks, mouth open.
Keep every pose a complete, uncropped figure with the same proportions and colours. No motion blur or speed lines.
BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers.
```


### Ember (dragon, new)

NEW character for Dragon's Hoard (the sleeping dragon, about 200 gold coin bricks piled on and around her). The name Ember is a working name; change it if you like. She needs: a sleeping idle, a stirring pose, a fire-puff pose, a tail sweep, an awake roar and a grumpy face set.

Attach: examples/korr-boar.png and examples/vault-bricks.png (for the glazed look only; Ember must look different from Korr)

**Turnaround**

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: character design sheet.
Asset type: turnaround sheet, landscape 1536x1024, ONE character shown in four views in one row, evenly spaced: front, three-quarter, side, back. Same character, same proportions, same size, same lighting and the same ground line in every view.
Character: EMBER, a large, grumpy, half-asleep hoard dragon. A dragon with FOUR weight-bearing legs plus two separate bat-style wings (folded like a cloak when asleep) and a thick, long tail; NOT a long-armed lizard. Broad chunky head with a blunt snout, big nostrils, ivory-and-brass horn crescents, heavy amber slit eyes with huge expressive lids and brows. Glossy ceramic-armour scales in BIG readable plates (burnt orange and charcoal, cream belly plates, brass horn caps), a darker spine ridge; a few gold coins stuck to her. Chibi-heavy proportions: head about 35% of body height, thick short legs. Low, wide mound silhouette when asleep so she can be piled with coins. Her moods are sleepy, grumpy, dramatic and a little smug.
Pose: relaxed neutral standing pose, mouth closed, eyes looking forward. The complete body is visible in every view, nothing cropped.
Background: plain dark navy #141831. No text, no labels, no ground shadow patches.
Quality checks: unique silhouette that reads at 100 px tall; clean continuous construction with no seams or floating parts; consistent colours in all four views.
```

**Expression sheet**

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: expression sheet.
Asset type: 4 columns by 3 rows grid, landscape 1536x1024, twelve head close-ups (with neck or shoulders) of the SAME character: same head shape, same proportions, same costume and colours, same camera, same lighting. Evenly spaced cells with generous gaps. Front view (a slight three-quarter turn is allowed for the beast heads, but the same turn in every cell).
Character: EMBER, a large, grumpy, half-asleep hoard dragon. A dragon with FOUR weight-bearing legs plus two separate bat-style wings (folded like a cloak when asleep) and a thick, long tail; NOT a long-armed lizard. Broad chunky head with a blunt snout, big nostrils, ivory-and-brass horn crescents, heavy amber slit eyes with huge expressive lids and brows. Glossy ceramic-armour scales in BIG readable plates (burnt orange and charcoal, cream belly plates, brass horn caps), a darker spine ridge; a few gold coins stuck to her. Chibi-heavy proportions: head about 35% of body height, thick short legs. Low, wide mound silhouette when asleep so she can be piled with coins. Her moods are sleepy, grumpy, dramatic and a little smug.
Expressions, left to right, top to bottom:
1. asleep: eyes closed, a fat snore bubble from one nostril
2. one eye opening: a single amber slit eye half open, the other shut
3. grumpy: both eyes half open, brow low, mouth turned down
4. snort: nostrils flared with two small smoke puffs, eyes narrowed
5. smug: lids half closed, a lazy lopsided smile
6. angry: eyes wide open and blazing, brow slammed down, teeth bared
7. roar: head back, mouth wide, eyes squeezed
8. hurt: eyes squeezed shut, mouth open, horns tilted back
9. dizzy: spiral eyes, tongue out, tiny stars
10. greedy: eyes wide with plain round pupils, a wide grin, brows up
11. fake-out snore: eyes closed but one brow twitching up, tiny sly smile
12. defeated: eyes closed, head flopped, tongue out
Rule: any two faces must differ in the eyes, the brows AND the mouth together, and the difference must still be obvious when the image is shrunk to 56 px per face. Body language (head tilt, ears, crest, shoulders) reinforces each emotion.
Background: plain dark navy #141831. No text, no labels, no numbers.
```

**Keypose sheet (collision)**

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: collision keypose sheet (production sprite sheet; we will measure the art with circles, so the silhouette must be honest).
Asset type: 3 columns by 2 rows grid, landscape 1536x1024, SIX poses of the SAME character, one pose per cell, same camera, same scale, same lighting, same ground line. Camera: strict side view, facing right. Orthographic.
Character: EMBER, a large, grumpy, half-asleep hoard dragon. A dragon with FOUR weight-bearing legs plus two separate bat-style wings (folded like a cloak when asleep) and a thick, long tail; NOT a long-armed lizard. Broad chunky head with a blunt snout, big nostrils, ivory-and-brass horn crescents, heavy amber slit eyes with huge expressive lids and brows. Glossy ceramic-armour scales in BIG readable plates (burnt orange and charcoal, cream belly plates, brass horn caps), a darker spine ridge; a few gold coins stuck to her. Chibi-heavy proportions: head about 35% of body height, thick short legs. Low, wide mound silhouette when asleep so she can be piled with coins. Her moods are sleepy, grumpy, dramatic and a little smug.
Poses, left to right, top to bottom:
1. sleeping idle: curled on the hoard, wings folded, head on front paws, chest low
2. stirring: head lifting, one eye open, wings twitching
3. fire-puff: head raised and forward, cheeks puffed, jaw open, small warm glow inside the throat
4. tail sweep: tail lifted high mid-arc, body twisted to the side
5. awake roar: reared up on her hind legs, wings half open, mouth wide
6. grumpy sit: seated upright on her haunches, front paws flat on the ground, brow low, sulking
Collision rules: the silhouette is solid and clearly drawn; real gaps (between legs, under the belly, between jaws, between wings and body, between horns) stay visibly empty; no motion blur, no speed lines, no dust, no glow or fire merged into the body, no cast shadow touching the body; the supporting feet of every pose sit on the same invisible baseline. The whole body is inside its cell with at least 10% free margin.
BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers.
```

**Attack tell pose**

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: attack telegraph sequence (production sprite sheet).
Asset type: 3 cells in ONE row, landscape 1536x512, the SAME character in the same camera, scale and ground line. Strict side view, facing right.
Character: EMBER, a large, grumpy, half-asleep hoard dragon. A dragon with FOUR weight-bearing legs plus two separate bat-style wings (folded like a cloak when asleep) and a thick, long tail; NOT a long-armed lizard. Broad chunky head with a blunt snout, big nostrils, ivory-and-brass horn crescents, heavy amber slit eyes with huge expressive lids and brows. Glossy ceramic-armour scales in BIG readable plates (burnt orange and charcoal, cream belly plates, brass horn caps), a darker spine ridge; a few gold coins stuck to her. Chibi-heavy proportions: head about 35% of body height, thick short legs. Low, wide mound silhouette when asleep so she can be piled with coins. Her moods are sleepy, grumpy, dramatic and a little smug.
Cell 1, REST: neutral standing pose, calm face.
Cell 2, TELL (the player must read this from the silhouette alone, at 100 px tall, and have 1.2 to 1.8 seconds to react): her chest inflates, cheeks puff, the throat glows soft ember orange and her jaw opens. The pose must differ from REST in at least two body parts. The cue is purely physical, never magical; no glowing rings.
Cell 3, RELEASE: a short chunky puff of flame leaves her mouth as an irregular textured blob, not a ring or a perfect circle.
Keep every pose a complete, uncropped figure with the same proportions and colours. No motion blur or speed lines.
BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers.
```

**Parts sheet (wings, jaw, tail)**

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: layered parts sheet for 2D animation (we rotate the parts around pivots in code).
Asset type: landscape 1536x1024, the SAME character taken apart into separate parts, each part drawn complete on its own in its own cell with free space around it: body with legs, head, lower jaw (open slightly), left wing or ear, right wing or ear, tail, a second front paw. Draw each part COMPLETE, including the portion that is normally hidden under its neighbour, with a little overlap so rotating it never shows a gap. Same colours, scale, lighting and camera as a full-body side view facing right. Mark each pivot (shoulder, neck, jaw hinge, tail root) with one small white dot.
Character: EMBER, a large, grumpy, half-asleep hoard dragon. A dragon with FOUR weight-bearing legs plus two separate bat-style wings (folded like a cloak when asleep) and a thick, long tail; NOT a long-armed lizard. Broad chunky head with a blunt snout, big nostrils, ivory-and-brass horn crescents, heavy amber slit eyes with huge expressive lids and brows. Glossy ceramic-armour scales in BIG readable plates (burnt orange and charcoal, cream belly plates, brass horn caps), a darker spine ridge; a few gold coins stuck to her. Chibi-heavy proportions: head about 35% of body height, thick short legs. Low, wide mound silhouette when asleep so she can be piled with coins. Her moods are sleepy, grumpy, dramatic and a little smug.
BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers.
```


### Zephyr (griffin, new)

NEW mythical beast for a future aerial-guardian level. The name Zephyr is a working name. It dive-bombs across a lane after a clear wing-spread tell.

Attach: examples/korr-boar.png (for the glazed-armour look only)

**Turnaround**

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: character design sheet.
Asset type: turnaround sheet, landscape 1536x1024, ONE character shown in four views in one row, evenly spaced: front, three-quarter, side, back. Same character, same proportions, same size, same lighting and the same ground line in every view.
Character: ZEPHYR, a young griffin. Eagle head with a big ivory hooked beak with a dark tip, bright amber-white eyes with heavy brow feathers; eagle forelegs with talons; lion hindquarters and a long tufted tail; two large feathered wings. Four weight-bearing legs plus two wings. Glossy vinyl-toy finish: feathers are big smooth overlapping plates, storm-slate blue with cream chest feathers and copper-brown lion body, small brass cuffs on the talons. Chibi proportions: big head, short thick body. Fierce but a bit goofy. Silhouette: raised chest and a broad arch of wings.
Pose: relaxed neutral standing pose, mouth closed, eyes looking forward. The complete body is visible in every view, nothing cropped.
Background: plain dark navy #141831. No text, no labels, no ground shadow patches.
Quality checks: unique silhouette that reads at 100 px tall; clean continuous construction with no seams or floating parts; consistent colours in all four views.
```

**Expression sheet**

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: expression sheet.
Asset type: 4 columns by 3 rows grid, landscape 1536x1024, twelve head close-ups (with neck or shoulders) of the SAME character: same head shape, same proportions, same costume and colours, same camera, same lighting. Evenly spaced cells with generous gaps. Front view (a slight three-quarter turn is allowed for the beast heads, but the same turn in every cell).
Character: ZEPHYR, a young griffin. Eagle head with a big ivory hooked beak with a dark tip, bright amber-white eyes with heavy brow feathers; eagle forelegs with talons; lion hindquarters and a long tufted tail; two large feathered wings. Four weight-bearing legs plus two wings. Glossy vinyl-toy finish: feathers are big smooth overlapping plates, storm-slate blue with cream chest feathers and copper-brown lion body, small brass cuffs on the talons. Chibi proportions: big head, short thick body. Fierce but a bit goofy. Silhouette: raised chest and a broad arch of wings.
Expressions, left to right, top to bottom:
1. idle: alert, head tilted
2. focus: eyes locked, brow feathers down
3. screech: beak wide open, eyes squeezed, head thrown back
4. smug: lids half shut, beak tipped up
5. hurt: eyes squeezed, beak open, crest feathers flattened
6. dizzy: spiral eyes, beak open, feathers sticking out, stars
7. surprised: eyes round, crest feathers up, beak slightly open
8. angry: brow feathers slammed down, beak tight
9. laugh: beak open, head tipped back, eyes creased
10. sulk: eyes drooped, crest down
11. proud: chin up, chest out, eyes half closed
12. defeat: eyes closed, head hanging
Rule: any two faces must differ in the eyes, the brows AND the mouth together, and the difference must still be obvious when the image is shrunk to 56 px per face. Body language (head tilt, ears, crest, shoulders) reinforces each emotion.
Background: plain dark navy #141831. No text, no labels, no numbers.
```

**Keypose sheet (collision)**

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: collision keypose sheet (production sprite sheet; we will measure the art with circles, so the silhouette must be honest).
Asset type: 3 columns by 2 rows grid, landscape 1536x1024, SIX poses of the SAME character, one pose per cell, same camera, same scale, same lighting, same ground line. Camera: strict side view, facing right. Orthographic.
Character: ZEPHYR, a young griffin. Eagle head with a big ivory hooked beak with a dark tip, bright amber-white eyes with heavy brow feathers; eagle forelegs with talons; lion hindquarters and a long tufted tail; two large feathered wings. Four weight-bearing legs plus two wings. Glossy vinyl-toy finish: feathers are big smooth overlapping plates, storm-slate blue with cream chest feathers and copper-brown lion body, small brass cuffs on the talons. Chibi proportions: big head, short thick body. Fierce but a bit goofy. Silhouette: raised chest and a broad arch of wings.
Poses, left to right, top to bottom:
1. perch idle: standing on all four legs, wings folded
2. wings-up tell: wings swept wide open overhead, head lowered, talons forward
3. dive: stooping straight down, wings tucked back, talons first
4. swoop recover: pulling out of the dive, wings flaring
5. hurt: tumbling backwards, feathers flying
6. dazed: sitting down, wings drooping, head wobbling
Collision rules: the silhouette is solid and clearly drawn; real gaps (between legs, under the belly, between jaws, between wings and body, between horns) stay visibly empty; no motion blur, no speed lines, no dust, no glow or fire merged into the body, no cast shadow touching the body; the supporting feet of every pose sit on the same invisible baseline. The whole body is inside its cell with at least 10% free margin.
BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers.
```

**Attack tell pose**

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: attack telegraph sequence (production sprite sheet).
Asset type: 3 cells in ONE row, landscape 1536x512, the SAME character in the same camera, scale and ground line. Strict side view, facing right.
Character: ZEPHYR, a young griffin. Eagle head with a big ivory hooked beak with a dark tip, bright amber-white eyes with heavy brow feathers; eagle forelegs with talons; lion hindquarters and a long tufted tail; two large feathered wings. Four weight-bearing legs plus two wings. Glossy vinyl-toy finish: feathers are big smooth overlapping plates, storm-slate blue with cream chest feathers and copper-brown lion body, small brass cuffs on the talons. Chibi proportions: big head, short thick body. Fierce but a bit goofy. Silhouette: raised chest and a broad arch of wings.
Cell 1, REST: neutral standing pose, calm face.
Cell 2, TELL (the player must read this from the silhouette alone, at 100 px tall, and have 1.2 to 1.8 seconds to react): both wings sweep wide open and up, head drops, talons draw forward. The pose must differ from REST in at least two body parts. The cue is purely physical, never magical; no glowing rings.
Cell 3, RELEASE: a fast straight dive along one lane, wings tucked, talons first.
Keep every pose a complete, uncropped figure with the same proportions and colours. No motion blur or speed lines.
BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers.
```

**Parts sheet (wings, jaw, tail)**

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: layered parts sheet for 2D animation (we rotate the parts around pivots in code).
Asset type: landscape 1536x1024, the SAME character taken apart into separate parts, each part drawn complete on its own in its own cell with free space around it: body with legs, head, lower jaw (open slightly), left wing or ear, right wing or ear, tail, the head with a separate beak. Draw each part COMPLETE, including the portion that is normally hidden under its neighbour, with a little overlap so rotating it never shows a gap. Same colours, scale, lighting and camera as a full-body side view facing right. Mark each pivot (shoulder, neck, jaw hinge, tail root) with one small white dot.
Character: ZEPHYR, a young griffin. Eagle head with a big ivory hooked beak with a dark tip, bright amber-white eyes with heavy brow feathers; eagle forelegs with talons; lion hindquarters and a long tufted tail; two large feathered wings. Four weight-bearing legs plus two wings. Glossy vinyl-toy finish: feathers are big smooth overlapping plates, storm-slate blue with cream chest feathers and copper-brown lion body, small brass cuffs on the talons. Chibi proportions: big head, short thick body. Fierce but a bit goofy. Silhouette: raised chest and a broad arch of wings.
BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers.
```


### Grumble (golem, new)

NEW mythical beast: a stone golem guardian. The name Grumble is a working name. It is slow, heavy and fair, with a big raised-fist tell.

Attach: examples/vault-bricks.png (for the glazed granite look)

**Turnaround**

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: character design sheet.
Asset type: turnaround sheet, landscape 1536x1024, ONE character shown in four views in one row, evenly spaced: front, three-quarter, side, back. Same character, same proportions, same size, same lighting and the same ground line in every view.
Character: GRUMBLE, a stone golem guardian built of glazed castle masonry. A squat, broad body of stacked rounded slate-granite blocks (#4A4F6E) with a few brass bands and a soft sage-green moss cap on top; a heavy brow slab over two big inset teal rune-gem eyes (#22C4B0) that light up; a slab jaw that moves; a broad chest gem core; SHORT thick arms ending in boulder fists (no long arms) and thick stubby legs. The body is connected, not floating rocks. Chibi proportions, head about 40% of height. Friendly-grumpy, slow and heavy. Glossy glazed finish like our ceramic bricks, not rough photoreal rock.
Pose: relaxed neutral standing pose, mouth closed, eyes looking forward. The complete body is visible in every view, nothing cropped.
Background: plain dark navy #141831. No text, no labels, no ground shadow patches.
Quality checks: unique silhouette that reads at 100 px tall; clean continuous construction with no seams or floating parts; consistent colours in all four views.
```

**Expression sheet**

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: expression sheet.
Asset type: 4 columns by 3 rows grid, landscape 1536x1024, twelve head close-ups (with neck or shoulders) of the SAME character: same head shape, same proportions, same costume and colours, same camera, same lighting. Evenly spaced cells with generous gaps. Front view (a slight three-quarter turn is allowed for the beast heads, but the same turn in every cell).
Character: GRUMBLE, a stone golem guardian built of glazed castle masonry. A squat, broad body of stacked rounded slate-granite blocks (#4A4F6E) with a few brass bands and a soft sage-green moss cap on top; a heavy brow slab over two big inset teal rune-gem eyes (#22C4B0) that light up; a slab jaw that moves; a broad chest gem core; SHORT thick arms ending in boulder fists (no long arms) and thick stubby legs. The body is connected, not floating rocks. Chibi proportions, head about 40% of height. Friendly-grumpy, slow and heavy. Glossy glazed finish like our ceramic bricks, not rough photoreal rock.
Expressions, left to right, top to bottom:
1. asleep: eye gems dark, jaw closed, a moss tuft on top
2. waking: eye gems flicker teal, brow slab lifting
3. idle: eye gems steady, jaw closed, grumpy brow
4. angry: brow slab slammed down, eye gems blazing
5. smug: gems half covered by the brow slab, a lopsided jaw
6. hurt: gems squeezed to thin slits, small crack on the brow, jaw open
7. dazed: gems spinning, jaw hanging, tiny stars
8. surprised: gems huge, jaw dropped
9. laugh: jaw wide, shoulders shaking, gems as happy arcs
10. sulk: gems dim and low, jaw turned down
11. roar: jaw wide open, gems blazing, small dust puff
12. defeat: gems dark, head tipped forward, loose rocks
Rule: any two faces must differ in the eyes, the brows AND the mouth together, and the difference must still be obvious when the image is shrunk to 56 px per face. Body language (head tilt, ears, crest, shoulders) reinforces each emotion.
Background: plain dark navy #141831. No text, no labels, no numbers.
```

**Keypose sheet (collision)**

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: collision keypose sheet (production sprite sheet; we will measure the art with circles, so the silhouette must be honest).
Asset type: 3 columns by 2 rows grid, landscape 1536x1024, SIX poses of the SAME character, one pose per cell, same camera, same scale, same lighting, same ground line. Camera: strict side view, facing right. Orthographic.
Character: GRUMBLE, a stone golem guardian built of glazed castle masonry. A squat, broad body of stacked rounded slate-granite blocks (#4A4F6E) with a few brass bands and a soft sage-green moss cap on top; a heavy brow slab over two big inset teal rune-gem eyes (#22C4B0) that light up; a slab jaw that moves; a broad chest gem core; SHORT thick arms ending in boulder fists (no long arms) and thick stubby legs. The body is connected, not floating rocks. Chibi proportions, head about 40% of height. Friendly-grumpy, slow and heavy. Glossy glazed finish like our ceramic bricks, not rough photoreal rock.
Poses, left to right, top to bottom:
1. idle: standing, fists at his sides
2. wake: lifting the head, moss tuft falling
3. fist-raise tell: one fist overhead, rune glow on the forearm
4. slam: fist down at ground level, body leaning in
5. stagger: top block knocked loose, leaning back
6. defeat: collapsed into a heap of blocks with the face block on top
Collision rules: the silhouette is solid and clearly drawn; real gaps (between legs, under the belly, between jaws, between wings and body, between horns) stay visibly empty; no motion blur, no speed lines, no dust, no glow or fire merged into the body, no cast shadow touching the body; the supporting feet of every pose sit on the same invisible baseline. The whole body is inside its cell with at least 10% free margin.
BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers.
```

**Attack tell pose**

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: attack telegraph sequence (production sprite sheet).
Asset type: 3 cells in ONE row, landscape 1536x512, the SAME character in the same camera, scale and ground line. Strict side view, facing right.
Character: GRUMBLE, a stone golem guardian built of glazed castle masonry. A squat, broad body of stacked rounded slate-granite blocks (#4A4F6E) with a few brass bands and a soft sage-green moss cap on top; a heavy brow slab over two big inset teal rune-gem eyes (#22C4B0) that light up; a slab jaw that moves; a broad chest gem core; SHORT thick arms ending in boulder fists (no long arms) and thick stubby legs. The body is connected, not floating rocks. Chibi proportions, head about 40% of height. Friendly-grumpy, slow and heavy. Glossy glazed finish like our ceramic bricks, not rough photoreal rock.
Cell 1, REST: neutral standing pose, calm face.
Cell 2, TELL (the player must read this from the silhouette alone, at 100 px tall, and have 1.2 to 1.8 seconds to react): one fist rises overhead and a teal rune lights along the forearm. The pose must differ from REST in at least two body parts. The cue is purely physical, never magical; no glowing rings.
Cell 3, RELEASE: the fist slams straight down; chunky stone chips fly (irregular shapes, no circles).
Keep every pose a complete, uncropped figure with the same proportions and colours. No motion blur or speed lines.
BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers.
```


## Notes for the reviewer

- A beast is only approved when its **silhouette** changes between rest and tell. If a pose differs only in colour or a glow, reject it and ask for a bigger body change.
- For collision we fit circles to the drawn pose. Honest gaps matter more than perfect beauty: do not accept merged legs, filled-in jaws or wings glued to the body in the keypose sheet.
- When a character is "new", ask for 3 turnaround variants first and let the owner pick, then lock it with the picked image attached.
