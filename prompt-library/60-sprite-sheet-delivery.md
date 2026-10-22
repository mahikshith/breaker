# 60 - Sprite sheet delivery spec

How a render has to arrive so we can drop it straight into the game. Our extraction scripts cut each object out of a sheet by finding its connected opaque pixels, trim it, pad it, shrink it to the game size and strip the file. That only works if the sheet follows the rules below.

## The rules (all assets)

1. **PNG, RGBA, transparent background.** Real alpha, not a drawn checkerboard. No white or black box around the picture. If the tool cannot make transparency, use ONE flat pure magenta #FF00FF background (no gradient, no floor, no cast shadow, no magenta in the subject) and tell us; we key it out.
2. **Biggest size the tool gives you.** Do not upscale, sharpen, compress to JPEG, screenshot or re-save through a website. Send the original download.
3. **One grid per sheet, equal cells, gutters between.** Every object sits complete inside its own cell with at least **10% empty margin** on every side (12% for projectiles and glows). Nothing may touch or cross a cell edge, and soft glows must fade out before the edge.
4. **Same camera, scale, light and ground line in every cell of a sheet.** Orthographic. Key light top-left (warm), cool fill from the right, faint pink bounce from below. Shadows fall down-right.
5. **No baked extras:** no text, labels, numbers, grid lines, frames, UI, ground shadow patches, motion blur, speed lines, exhaust, or effects glued to the body. Effects are separate sprites.
6. **No cropping.** The whole object is visible, including feet, tail, tips and horns.
7. **Honest gaps.** Gaps between legs, jaws, horns, wings and under bellies stay empty (transparent). Do not fill them with shadow or ground.
8. **Cell order is left to right, top to bottom.** Tell us the order in your hand-back message (or keep the order in the prompt).

## Grid choices that give square cells

| Tool canvas | Grid | Cell size | Good for |
|---|---|---|---|
| 1536 x 1024 | 3 x 2 | 512 x 512 | 6 keyposes, 6 ships, 6 props |
| 1536 x 1024 | 4 x 3 | 384 x 341 | 12 faces, 12 FX |
| 1536 x 1024 | 6 x 4 | 256 x 256 | up to 24 animation frames, small icons |
| 1024 x 1024 | 2 x 2 or 4 x 4 | 512 or 256 | 4 big items, 16 small items |
| 2048 x 2048 (if offered) | 2 x 3, 3 x 3, 4 x 4 | up to 1024 | hero ships, bricks, equipment |
| 1024 x 1536 | 2 x 3 | 512 x 512 | tall items |

Ask for the biggest canvas the tool offers.

## What size each asset ends up at in the game

The game world is 360 units wide. We draw at **3 pixels per unit** for sprites and 2 pixels per unit for full-screen plates. You do not need to hit these sizes; draw big and keep the shapes simple. The table tells you what detail survives.

| Asset | Final size | In game | Rules |
|---|---|---|---|
| Character animation frame | 168 x 168 px cell | the cell is 56 units; the character is about 42 units (126 px) tall, feet 4 units (12 px) above the bottom | feet on the same baseline in every frame, character horizontally centred, fixed scale, 8 to 16 frames per clip at 14 fps |
| Face (orb portrait) | 288 x 288 px | shown at about 56 px | face centred, head fills ~80% of the cell, shoulders show at the bottom |
| Serpent head | 256 x 256 px cell | 44 units wide | faces RIGHT (we mirror it), the mouth anchor is stored separately, neck leaves to the left |
| Boss or creature pose | for example 512 x 448 (a boar), 640 x 576 (a crab) | 150 to 200 units wide | supporting foot on a fixed baseline, side view, same scale in every pose |
| Brick | 72 x 72 (1 cell) and 120 x 72 (2 cells) | 24 x 24 and 40 x 24 units | the brick body is inside a 4-unit margin |
| Capsule | 144 x 78 px | 48 x 26 units | horizontal pill |
| Power icon | 192 x 192 px | about 48 px on screen | one object, strong silhouette |
| Prop (bell, gate, wheel) | 256 to 384 px | 30 to 70 units | pivot at the physical pivot, not the image centre |
| FX sprite | 128 to 256 px | 10 to 40 units | several variants per effect |
| Starflight ship | 192 to 512 px wide | player 52 units, enemies 40 to 196 units | UP for the player, DOWN for enemies |
| Starflight projectile / effect | 256 x 256 px | 7 to 30 units | transparent, no long trail |
| Level plate (background) | 720 x 1640 px | covers 360 x 820 units | dark, calm, no characters or bricks painted in |
| Scrolling space background | 1024 x 2048 | repeats vertically | top and bottom edges identical |

## Naming

Lowercase, hyphens, no spaces: `<subject>-<kind>-<variant>-v<N>.png`.

| Example | Meaning |
|---|---|
| `ember-turnaround-v1.png` | dragon, turnaround, first try |
| `ember-expressions-v2.png` | dragon, 12 faces, second try |
| `ember-keyposes-v1.png` | dragon, collision poses |
| `bricks-gold-v1.png` | brick family sheet, gold |
| `window-front-v1.png` and `window-back-v1.png` | the two window layers |
| `fx-stone-gold-dust-v1.png` | effect sheet |
| `starflight-enemies-b-v1.png` | the second enemy sheet |

Send the **file** with its prompt, a one-line note on which variant is the keeper, and the cell order if it is not obvious.

## Consistency tips (this is where most rework comes from)

- **Lock the look first.** Get one turnaround approved, then attach that picture to every later request for the same character and write "same character as the attached image, same proportions, same colours".
- **Stay in one chat** for one character so the model keeps the look. Start a fresh chat only for a new character.
- **Generate the whole sheet in one request**, not frame by frame. One request keeps scale and light consistent.
- **Edit, do not regenerate.** To fix one cell or colour, attach the image and use the Fix prompt in `00-style-bible.md`. A new generation changes everything.
- **Reuse the seed if your tool shows one** (some Copilot or image tools do). If there is no seed, reuse the earlier image as the reference and keep the prompt text identical except for the one line you change.
- **Repeat the camera and light words in every prompt.** "Orthographic, strict side view facing right, key light from the top-left" must not change between sheets of the same character.
- **Same proportions line:** repeat "head about 40% of height" (people) or the creature's key ratio ("head one third of body length") every time.
- **Do not ask for "cinematic", "dramatic lighting", "epic" or "wide angle".** They break consistency with the rest of the game.
- **Test at 100 px.** Shrink the sheet; if two expressions or two poses look the same, redo them.

## If the tool will not give transparency

1. Ask again with the magenta wording (it is in every prompt as the fallback).
2. Make sure there is no glow bleeding into magenta and no soft shadow on the ground; magenta fringes are the main problem.
3. Tell us in the hand-back note: "magenta background". We key it and clean the edges.

## Animation strips (looping idle or walk)

When a creature needs a real loop instead of a few keyposes, ask for a strip. Attach the approved keypose sheet first.

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: animation loop strip (production sprite sheet).
Asset type: [8] frames in a grid of [4 columns by 2 rows], landscape 1536x1024, the SAME character as the attached image, same proportions, colours, scale, camera (strict side view facing right, orthographic) and lighting in every frame. Frame order left to right, top to bottom. Frame 8 leads smoothly back into frame 1 (a seamless loop at 14 frames per second).
Motion: [E.G. "idle breathing: chest rises and falls, tail tip sways, one slow blink" or "a heavy four-legged walk cycle: diagonal legs move together, body bobs, head sways"]. Feet stay on the same invisible baseline; the character stays horizontally centred in its cell; only the pose changes.
BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers.
```

## Parts for rigging (when something has to rotate)

Wings, jaws, tails, bells, gates and wheels are better as separate parts rotated in code than as redrawn frames. Use the "Parts sheet" prompt in `10-characters-and-creatures.md`, and always ask for each part to include its hidden portion so a rotation never shows a gap.

## Our acceptance checks (so you know what we look at)

| Check | Pass |
|---|---|
| Alpha | real transparency, edge pixels fully transparent, no halo |
| Cells | every object complete, 10% margin, none touching |
| Consistency | same scale, camera and light across the sheet and across sheets |
| Silhouette | readable at 100 px; distinct from other characters |
| Faces | any two expressions differ in eyes, brows and mouth together |
| Gaps | legs, jaws and horns show real transparent gaps |
| Style | glossy toy or ceramic look; no pixel art, flat vector, ring or long beam |
| Size | native render at least as big as the table above wants |

## Hand-back message (copy this)

```
Files: [file names]
Keeper: [which variant, one line]
Cell order: [left to right, top to bottom: names]
Background: [transparent / magenta]
Tool and model: [e.g. Copilot with ChatGPT image]
Prompt used: [paste, or "unchanged from prompt-library/XX"]
Notes: [anything that surprised you or still looks wrong]
```
