# Phase 1 visual quality target

Status: review criteria, 2026-10-18. The previous Kit artwork and its selection are rejected. No replacement direction is selected. Kit now needs to read as a knight, with a proper medieval shield and a clean, expressive face. Existing Lumi, Gnash, Clank and glazed-brick art remain the reference.

## Inspected references

| Reference | What it establishes |
|---|---|
| `assets/princess/Idle_00.png`, `Scared_00.png`, `Cheer_00.png` | The current 168 px sprite contract and the difference between worry, fear and joy. |
| `art/princess.py:141`–`169`, `171`–`179`, `239`–`319`, `366`–`413`, `626`–`748` | Clean original face geometry; eyes placed against the actual head surface; skin lids, surface-projected brows and changing mouth shapes; expression changes tied to animation. |
| `docs/reference/snake-v2-sheet.png`; `art/snake.py:96`–`123`, `187`–`318` | A clear angular skull, strongly contrasting brows, lids that change the eye aperture, and a jaw whose silhouette changes. |
| `docs/reference/robot-expressions-ingame.png`; `src/invasion.js:62`–`67`, `286`–`300` | Faces remain distinct at very small sizes because the black faceplate separates large eye and mouth symbols from the shiny body. Runtime moods correspond to gameplay events. |
| `docs/reference/vault-top-down.png`; `art/render_vault_assets.py`; `art/render_invasion_assets.py:1`–`7` | Glazed highlights, dark separators, shared warm top-left key, cool fill, and dark environmental values. |
| `out/baseline/ios/ios-04-vault-nervous.png` | The actual crowded gameplay context, including bricks, particles, bars, HUD, ball and paddle. |

Unchanged `art/princess.py` was also run with `Idle:1 Scared:1 Cheer:1 --face --samples 32 --threads 2`. Review-only results are in ignored `out/reference-quality/`. No production asset was changed.

The native-scale and close-up sheet is `out/reference-quality/existing-lumi-quality.png`. Each small sprite uses its 56-unit cell; the visible character remains approximately 42 units tall.

## What the rejected Kit failed

This review inspected the rejected `determined.png`, `shock.png`, `cheer.png` and `art/kit.py` preserved under `out/rejected-kit-20261018/`.

- **Hair:** three added tubular tufts make separated upright knobs and horn shapes. They do not read as one hairstyle growing from the scalp. The original broad cap and new tufts conflict in silhouette.
- **Face:** a visible lower-face band and extra contour around the mouth make it read like a muzzle attached to the head. The script flattened retained sculpted mouth geometry rather than first establishing a clean, continuous skin surface. The exact topology repair still needs a Blender inspection; a new decal alone does not solve this.
- **Knight identity:** the armour was hidden and replaced with a tunic, rolled sleeves and scarf. The result does not communicate the knight the owner now wants.
- **Shield:** the elliptical, shallow wooden sphere and projecting grip read as a bat or frying pan. A medieval shield needs broad upper shoulders, a clear lower profile, thickness and a grip behind the shield face.
- **Expressions:** changing parameter values and producing different image hashes did not establish that expressions read at the actual display size. Enlarged review images also cannot prove this.

Build/tests passing proves code execution. It does not approve silhouette, anatomy, expression quality or motion.

## Character review gates

| Gate | Pass | Reject |
|---|---|---|
| Identity | Knight silhouette visible before colour: armour/pauldrons or an open-face helmet, sturdy boots, broad shield. Dominant blue/teal/indigo separates Kit from Lumi's rose dress. | Courtyard sports player, generic smiling mascot, or a costume identifiable only by its label. |
| Hair or helmet | One coherent hair cap with a few broad connected locks, or a clearly constructed open-face helmet. Brows, eyes and mouth remain exposed. | Buns, antlers, detached cones, individual spaghetti strands, closed visor, fringe covering expressions. |
| Face continuity | One continuous cheek/jaw skin surface with a small integrated nose. Clean joins at the eyes/lids, no competing mouth crease. | Mustache, beard, muzzle, attached skin patch, dark seam, floating eyes, or a skin-colour cover placed over unresolved geometry. |
| Expressions | Worry, shock and joy differ immediately when shown without labels. All eight requested emotions have distinct eye/lid, brow and mouth combinations; body poses reinforce them. | The same smile with iris movement, subtle eyebrow-only variants, emotion supplied only by captions or camera zoom. |
| Shield | Heraldic silhouette with broad shoulders and tapered/pointed lower edge, visible rim and thickness. Hand is attached to a rear grip. Shield stays below/aside the face. | Bat/pan handle above the rim, table-tennis oval, shield fused to the palm, excessive metallic glare or prop hiding the face. |
| Cohesion | Orthographic KayKit proportions, head about 40% of total height, satin vinyl skin, distinct cloth/metal, restrained clearcoat, warm top-left key and cool right fill. | Photorealistic skin, sculpted collectible detail, mirror-chrome face, neon glow, flat clip art, dramatic scene lighting that cannot match existing sprites. |
| Native read | Review a 56-unit sprite cell containing a roughly 42-unit tall character on navy and on gameplay. Primary emotions and shield remain clear. Also inspect its normal 168 px source and a face close-up. | Pass based only on a large concept image, enlarged thumbnail or isolated black background. |
| Motion | Stable scale and feet anchor; limbs, face and shield follow their intended bones; no visible costume drift or clipping at 14 fps. | Static portrait stretched/bobbed as a substitute for the requested character animation, sliding grip, head/prop intersections or per-frame identity changes. |

## Small Blender proof after the concept pick

Before rendering the full animation batch or packing art:

1. Inspect the selected Knight head in rest pose from front and three-quarter. Repair original mouth/hair/helmet geometry at the source; confirm a continuous cheek and jaw with a plain skin material.
2. Render one front-facing full-body pose and a three-quarter check, plus close-ups of determined, worried and cheerful faces. Compose the full-body proof beside Lumi at the same 42-unit height on both navy and an actual gameplay crop.
3. Show the shield front and side; show the hand on its rear grip. Scrub Idle, Cheer and Hit/Block_Hit to catch head, shoulder, shield and hand intersections.
4. Produce a short animation preview with the real rig and fixed sprite anchor. Once the chosen appearance and motion pass review, produce the turnaround, eight faces and full required runtime set.
5. Integrate, then inspect unzoomed captures at iPhone 393 × 852 (`safe=59,34`) and Android 412 × 915 (`safe=32,24`). Review face visibility, thumb clearance, clipping and readability during play. Check page errors separately.

Concept art is a direction choice. It is not production proof. The owner approves the image direction before implementation and approves the finished phone screenshots before commit or push.

## New knight concept review

Inspected `img/01-kit-v2-1.png`, `img/01-kit-v2-2.png` and `img/01-kit-v2-3.png`, each 1536 × 1024. All three communicate a knight, a proper shield, coherent hair/helmet and a continuous expressive face. They pass as direction choices; none has passed the production gates.

| Option | Strongest feature | Production risk |
|---|---|---|
| A: teal, bare head | Clear teal/steel/coral identity and a strong castle-emblem shield. Worry changes the brows, eye aperture and mouth. | Multiple swept hair locks need a coherent cap and broad sculpted masses. Base and focused expressions are similar. |
| B: cobalt, open-face helmet | Clearest laugh/worry contrast and an exposed face. Existing Knight armour and helmet give the most credible starting point. | The helmet must preserve the large face opening in the actual mesh. Simplify layered armour and scarf details at 42 units. |
| C: indigo, copper hair | Strong shield silhouette and energetic asymmetry. | Dark cloth has the weakest separation from navy; cape, straps, stitching and layered hair add the most native-size clutter. |

For build feasibility B has the lowest risk. A is the clearest bareheaded colour identity. The owner chooses the direction.

All three concepts use finer hair, scratched metal and fabric texture than the existing game. A/C also make the head closer to one-third of total height than the required roughly 40%. Keep their large shapes and palette; translate small surface detail into the established satin-vinyl/KayKit material language, and prove the resulting proportions beside Lumi. Do not promise an exact match to the large concept image before the Blender proof exists.

## Level review gates

- **Hierarchy:** glossy bricks and characters lead; a moving chrome ball remains findable. Keep the plate dark and desaturated. No bright planet, torches, beams or ornamental scenery competing behind the ball.
- **Game rules visible:** indestructible anchors and breakable bricks differ by shape/material as well as colour. A suggested ball corridor must be physically open; a decorative arch is not evidence of a playable route.
- **Invasion:** proposals must fit the existing 11 × 9 grid with 28 × 18 cells. Show the opening shot, the formation's side/down march envelope and the hazard line. Armour cannot hide every rewarding early shot. Preserve the robot wind-up and bolt read.
- **Vault:** proposals must fit the existing 20 × 20 grid with 16-unit cells. Preserve or explicitly remap the cage at columns 7–12, rows 3–5 and the serpent start at the upper right. Show the rescue path, the serpent's legal path, and an understandable support/collapse opportunity. Granite cannot seal either required route.
- **Phone layout:** reserve the notch/home areas and the actual raised paddle/thumb deck; keep the HUD immediately above play. Compare the same layout at both phone sizes before claiming it fits.
- **Scope:** alternate level layouts are design proposals until selected. New enemies, power-ups, chapter systems or physics changes require a separate scope decision.

## Open decisions

- The owner chooses one new knight concept and one level direction from the presented image options. Earlier Kit option A no longer applies.
- Neither character concepts nor level proposals have passed the Blender/gameplay proof merely by satisfying this document.
