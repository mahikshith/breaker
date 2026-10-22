# 00 - Style bible (the house look)

Every prompt in this library already starts with the right preamble pasted in, so you normally do not need this file. Read it when you write your own prompt, when a result drifts, or when you need an exact hex colour.

## The look in ten lines

1. Glossy 3D "vinyl toy" characters and glazed-ceramic bricks, rendered like Blender Cycles. Real clear-coat highlights, crisp bevels. Never flat, never pixel art.
2. Chibi proportions: head about 40% of the height, stubby limbs. At game size a character is only about 42 units tall (about 126 px), so shapes must be chunky and readable.
3. One warm key light from the top-left (#FFDBB8), cool blue fill from the right (#8CA6FF), faint pink bounce from below (#FF80A6). Shadows fall down and to the right.
4. Dark, calm, desaturated backgrounds (navy #22284A to #141831 to #0A0C18). The foreground always out-shines the background. No torches, bright planets, light beams or window bars behind the ball.
5. Bricks look like glazed ceramic tiles: coloured body, thick glossy coat, bright highlight band along the top edge, dark separators, slightly rounded corners.
6. Faces are the product. Big glossy eyes with iris, pupil and two catch-lights, real eyelids, brows, and a mouth that changes shape. Every character has its own face shape and its own expression set.
7. Colours are saturated but never neon. Yellow and gold are small accents only (the owner rejected a yellow cage).
8. Metal is chrome for the ball and paddle, dark blued gunmetal for cages and machinery, warm brass for bells and gates.
9. Every creature has its own anatomy and silhouette. No shared body template, no long dangling arms on everything.
10. Readable at a glance on a phone: big shapes, few details, strong silhouette against dark navy.

## Palette

| Use | Colours |
|---|---|
| Background gradient | #22284A, #141831, #0A0C18 (vignette, light film grain) |
| Vault bricks | sun #FFC73D, coral #FF6F61, violet #8F5CF0, teal #22C4B0, blue #4F9DFF, gold gem #F4C542, granite (indestructible) #4A4F6E |
| Invasion rows | #FF5D8F, #FF8A3D, #FFD23F, #5CCF6A, #2EC4B6, #3FA8F5, #7B6CF6, #C46BF0, armour #8D97B3 |
| Gatehouse bricks | brick red, cream/ivory and sage green flat glazed tiles on a dark gothic hall |
| Gnash (emerald serpent) | body #168F83, belly #C9E8D2, crown #0B5D59, outline #052D31, brow #FF8A9B, mark #83E4C2 |
| Mooncoil (violet serpent) | purple #7A3CCC, peach belly #FFC49A, rose diamonds #FF6FAE, outline #1E0A40 |
| Power-up capsules | split x3 #5CCF6A, FIRE #FF8A3D, WIDE #3FA8F5, AIM #C46BF0, BURST +3 #F7C948, LASER #FF4D6D, SHIELD #2EC4B6, SLOW #7FD6FF, TINY (bad) #5A5F78 |
| UI | danger #FF4D5E, success #7BD88F, AIM lilac #E3B6FF, combo text #FFD36B |

## Characters that already exist (never redesign them)

- **Kit** - underdog knight. Round cobalt/steel open-face helmet, big blue-grey eyes, dark blue armour, a broad blue heraldic kite shield with a lightning-bolt emblem.
- **Lumi** - princess. Honey-blonde hair, tiny gold tiara with a rose gem, big turquoise eyes, rose-pink dress with a flared bell skirt, ivory gloves.
- **Gnash** - emerald serpent with an angular faceted head, pink brows, yellow-green slit eyes.
- **Korr** - ruby/plum armoured four-legged boar, ivory tusks, amber eyes.
- **Nerra** - oxblood/coral hermit-crab queen with a ruined mini-fortress on her shell.
- **Clank** robots, **Zorvax** the mothership, **Brum** the ally, **Nix / Tick / Vesper / Latch** the space crew.

Attach their reference pictures from `examples/` whenever a prompt features them.

## Rejected (put these in the "NOT" line when a result drifts)

Pixel art, wisps or ghost blobs, jittery foxes, ball-chain snake bodies, round "bally" blob heads, uniform faces, flat vector clip art, dungeon torches and bright lanterns, window bars and hazard stripes, a yellow cage, repeating one long-armed creature template, a bat-shaped shield handle, closed visors that hide the face, mirror-chrome faces, neon glow, photoreal skin, long magic light trails, perfect circle or ring effects.

## The reusable preambles

Paste one of these at the very start of any prompt you write yourself. They are already inside every ready-made prompt.

### A. Characters, creatures, props, bricks

```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.
```

### B. Sprites on a transparent background (add after A)

```
BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers.
```

### C. Level or phone mock (add after A)

```
HOW THE GAME PLAYS (the picture must read as a playable board). This is a portrait phone brick breaker. A small chrome ball bounces off a low chrome paddle and breaks bricks. Bricks are glossy glazed tiles, all the same size within a row, never tiny. The ball is small (about 3% of screen width). The paddle is a chrome capsule about 28% of screen width, low on the screen, with a large EMPTY dark lower quarter above it so the ball has room to come back. Every brick, wall, ramp and enemy sits well above that empty lane. The ball must be able to reach every important target: leave open vertical lanes down both side walls and at least two broad gaps in every brick band; a decorative arch or door is never counted as a route. Breakable bricks and indestructible blocks (dark granite or iron) differ by shape and material, not only by colour. Any enemy weak point is a broad body part, never a tiny spot. A visible warning (a glow, a lit lamp, a raised arm) comes before any hazard; never draw a hazard hitting the player. HUD is minimal and calm: pause button top-left, three small chrome life balls, a short level label at top centre, score top-right; no instructions or paragraphs inside the playfield. The hero's small round face portrait (face orb) sits lower-left in the control area; the centre of the bottom area is a clear empty drag lane. The background is dark, calm and desaturated several stops below the foreground: no bright planets, torches, beams or light shafts competing with the ball. Glossy bricks and characters lead the eye and the white chrome ball is easy to find.
```

### D. Space (use instead of A)

```
HOUSE STYLE FOR SPACE (match exactly): premium glossy 3D-rendered spacecraft. Player craft: white and pale ceramic armour plates over dark machined gunmetal, crisp bevels, recessed dark panel seams, vivid cyan glass cockpit and small controlled cyan engine glow. Enemy craft: graphite or slate metal with coral-red or plum ceramic plating, violet reactor cells and small magenta vents. Orthographic near-top-down camera with a very slight 3D tilt. One soft warm key light from the top-left, cool fill, faint pink bounce; reflections stay inside the machinery and glows stay small and bounded. Very dark midnight-navy space that is never brighter than the ships. Minimal yellow. NOT: pixel art, flat vector icons, cartoon flat fills, huge bloom, long laser beams, perfect circle or ring icons, text, labels, UI.
```

### E. Our fixed game rules (for design and physics prompts, see 40)

```
FIXED GAME RULES (never break these):
- The world is 360 units wide; the height adapts to the phone (about 640 to 880). Test phones: 393x852 and 412x915.
- The ordinary ball has radius 6 (12 units across). The paddle is 100 wide by 14 high, chrome, low on screen, always above a dark control deck.
- Physics runs on a fixed 1/120 s step. Collision follows the DRAWN art: a compound of circles sampled along the picture, never a hidden box that disagrees with what the player sees.
- Every hazard is telegraphed (visible warning tell, 1.2 to 1.8 s) and is shown once safely before it can hurt.
- Ordinary ball play always makes progress. No forced precision puzzles, no tiny weak points (a required target is broad: never smaller than an ordinary 32x16 brick; the Vault cage is 96x48), no waiting for a timer or an invulnerable enemy.
- A single brick vanishes quietly (crack and fade about 0.4 s). Only big structural crashes drop physics debris.
- Enemy attacks never destroy the player's bricks to hand out free rewards.
- Pause, Continue and Retry keep earned progress.
- Backgrounds stay dark, calm and desaturated; gold and yellow are accents only.
- One-finger relative drag steering; hero abilities sit behind a small face orb at lower-left, with a short paused menu.
- Three difficulty modes: Easy, Medium, Hard. Difficulty changes numbers (HP, tell length, hazard interval, speed), never hidden attacks or removed ordinary damage.
```

## What worked in past prompts (reuse these habits)

- Start with labelled fields: `Use case: stylized-concept.` / `Asset type:` / `Primary request:` / `Composition:` / `Style:`. The image tool follows structured prompts better than a paragraph.
- Say what is attached: "The supplied images are precise local style references. Retain their character design. Do not redesign."
- Name the rejected ideas explicitly in a "NOT" line.
- Ask for physical motion poses with anticipation, contact and recovery, never "light trails" or "magic".
- Ask for complete figures, "no cropping", "all faces large enough to read".
- Ask for the exact label text you want, in quotes, and nothing else ("short legible labels only").
- For a fix, edit instead of regenerating (template below). Regenerating changes everything; an edit keeps what already works.

## Fix prompt (use on an image you mostly like)

Attach the image and paste:

```
Use case: precise-object-edit.
Image 1 is the edit target. Preserve the exact composition, character designs, colours, lighting, material quality and every piece of text.
Make ONLY these corrections:
1. [WHAT TO CHANGE AND WHERE, for example: "make the planet at lower right about 80 percent darker and desaturated"]
2. [SECOND CHANGE, optional]
Do not add labels, UI, characters or effects. Keep everything else pixel-for-pixel as close as possible.
```

## Self-check before you send anything back

1. Shrink the image to 100 px tall. Can you still tell the expressions apart and name the character from the silhouette alone?
2. Is the background clearly darker and calmer than the subject?
3. Is there any plain circle, ring, long beam, pixel look or flat vector look? Reject it.
4. Do all variants of one character have the same proportions, colours and costume?
5. Is any weak point or target tiny? Make it broad.
