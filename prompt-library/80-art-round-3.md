# BREACH art round 3: prompts for M365

**How to use**
- **One job per chat.** Start a new M365 chat for each job below.
- **Attach the references.** Download the reference links listed under the job and attach them. If Copilot refuses an image, send the prompt without it; every prompt describes its subject in full.
- **Copy the prompt.** Copy everything inside the grey box.
- **Save the results.** Save every image M365 returns as PNG and push them to `art/round3/` on main. Name each file with the job code and a number, for example `A1-nerra-1.png` and `A1-nerra-2.png`. Also save M365's pose list as `A1-nerra-list.txt`.

**Order:** A1, A2, B1, B2, C1, A3, B3, B4, D1. Tidewheel is first because it is the flagship level.

Reference link base: `https://github.com/mahikshith/breaker/raw/claude/project-thread-r3m42j/renders/refs/`

---

## A. Character animation sheets

### A1. Nerra, the crab villain of Tidewheel

**References:**
- https://github.com/mahikshith/breaker/raw/claude/project-thread-r3m42j/renders/refs/chars/nerra-calm.jpg
- https://github.com/mahikshith/breaker/raw/claude/project-thread-r3m42j/renders/refs/chars/nerra-furious.jpg
- https://github.com/mahikshith/breaker/raw/claude/project-thread-r3m42j/renders/refs/round3/game-tidewheel.jpg (the game screen, for scale)

```
You are the character artist for a premium mobile brick-breaker. Using the reference images, create animation sprite sheets of THIS exact crab villain, Nerra. Keep her design identical: glossy red shell covered in barnacles and moss, a ruined stone castle with red flags on her back, a huge crusher claw on screen-left and a gate claw holding an iron chain on screen-right, big angry eyes with heavy brows, the same painted 3D render style, top-left warm key light and a cool rim light.

Make 3 images. Each one is a clean grid on a plain flat background of pure green #00FF00 with no gradient. Every pose:
- same size, same camera height and same light;
- feet on the same ground line;
- wide empty space between poses;
- no text, no cast shadow on the background, nothing cropped;
- no green anywhere on the character.

Image 1, movement (4 rows):
- Row 1: walk cycle facing right, 8 frames. A sideways crab scuttle with the legs alternating and the body bobbing.
- Row 2: the same walk cycle facing left, 8 frames.
- Row 3: turning from facing right to facing the viewer, 3 frames, then from facing the viewer to facing left, 3 frames.
- Row 4: jump: crouch, take-off, airborne and stretched, then a landing slam with the legs splayed.

Image 2, face and attention (3 rows):
- Row 1: looking at the viewer with her eyes and head turned up-left, up, up-right, left, straight at the viewer, right, down-left, down and down-right (9 frames).
- Row 2: expressions, facing the viewer:
  - smug;
  - furious, with the brows hard down, the mouth open showing teeth and the claws raised;
  - roaring;
  - hurt;
  - dizzy, with spiral eyes.
- Row 3: an idle breathing loop, 4 frames.

Image 3, attacks and damage (2 rows):
- Row 1: left crusher claw snap windup and strike; right gate claw snap windup and strike; a chain yank with the gate claw pulling hard.
- Row 2: hit flinch; staggered and dazed; knocked over and defeated.

After the images, list each pose in order with its image, row and column number, so the frames can be cut automatically.
```

### A2. Frost Warden, the yeti villain of Frost

**References:**
- https://github.com/mahikshith/breaker/raw/claude/project-thread-r3m42j/renders/refs/chars/nerra-calm.jpg (style)
- https://github.com/mahikshith/breaker/raw/claude/project-thread-r3m42j/renders/refs/chars/dragon-sheet.jpg (style)
- https://github.com/mahikshith/breaker/raw/claude/project-thread-r3m42j/renders/refs/chars/yeti-current.jpg (the old yeti; replace it, keeping only the idea)
- https://github.com/mahikshith/breaker/raw/claude/project-thread-r3m42j/renders/refs/round3/game-frost.jpg (the game screen, for scale)

```
You are the character artist for a premium mobile brick-breaker. Redesign the villain "Frost Warden", a hulking frost yeti that besieges a castle. Use the same painted 3D render style as the crab and dragon references: rich surface detail, glossy highlights, a top-left warm key light and a cool blue rim light.

Design:
- massive shoulders and oversized fists;
- thick, shaggy white-grey fur in sculpted clumps, with frost at the tips;
- ice-crystal armour on the shoulders and forearms;
- glowing ice-blue eyes under a heavy brow, small horns and a scarred face;
- frosty breath.
He should look menacing and powerful, not cute.

Make 3 images. Each one is a clean grid on a plain flat background of pure green #00FF00 with no gradient. Every pose:
- same size, same camera height and same light;
- feet on the same ground line;
- wide empty space between poses;
- no text, no cast shadow on the background, nothing cropped;
- no green anywhere on the character.

Image 1, base and attacks (3 rows):
- Row 1: idle breathing loop, 4 frames, facing the viewer.
- Row 2: ground-pound attack: windup with both fists raised, strike smashing down, recover.
- Row 3: hit flinch; staggered and dazed; recover; defeated and slumped.

Image 2, dash attack (3 rows):
- Row 1: dash facing right: a low crouch with frost gathering, then 4 frames of a shoulder-first charging run.
- Row 2: the same dash facing left: crouch plus 4 run frames.
- Row 3: a shoulder smash into a stone wall with ice shards flying, then dazed after the impact. Show both facing right and facing left.

Image 3, faces (1 row), all facing the viewer:
- furious;
- roaring with the mouth wide;
- smug;
- dizzy, with spiral eyes.

After the images, list each pose in order with its image, row and column number, so the frames can be cut automatically.
```

### A3. Korr, the armoured boar villain of Gatehouse and Bellforge

**References:**
- https://github.com/mahikshith/breaker/raw/claude/project-thread-r3m42j/renders/refs/round3/char-korr.jpg
- https://github.com/mahikshith/breaker/raw/claude/project-thread-r3m42j/renders/refs/round3/char-korr-windup.jpg
- https://github.com/mahikshith/breaker/raw/claude/project-thread-r3m42j/renders/refs/round3/game-gatehouse.jpg (the game screen, for scale)

```
You are the character artist for a premium mobile brick-breaker. Using the reference images, create animation sprite sheets of THIS exact villain, Korr: an armoured boar warlord in crimson spiked plate armour, with big tusks and angry eyes. Keep his design identical, in the same painted 3D render style, with a top-left warm key light and a cool rim light.

Make 3 images. Each one is a clean grid on a plain flat background of pure green #00FF00 with no gradient. Every pose:
- same size, same camera height and same light;
- feet on the same ground line;
- wide empty space between poses;
- no text, no cast shadow on the background, nothing cropped;
- no green anywhere on the character.

Image 1, movement (4 rows):
- Row 1: walk cycle facing right, 6 frames.
- Row 2: walk cycle facing left, 6 frames.
- Row 3: running away seen from behind, 4 frames, as if escaping.
- Row 4: turning from facing right to facing the viewer, 3 frames.

Image 2, actions (3 rows):
- Row 1: hauling a heavy chain hand over hand, 4 frames, as if dragging something up a castle gate.
- Row 2: cranking a big winch wheel, 4 frames.
- Row 3: throwing a bronze bell: windup, throw, follow-through; then a hoof stomp that shakes the ground.

Image 3, faces and damage (2 rows):
- Row 1, facing the viewer: furious, taunting laugh, smug, roaring.
- Row 2: hit flinch; dazed with stars; knocked down and defeated.

After the images, list each pose in order with its image, row and column number, so the frames can be cut automatically.
```

---

## B. Stage environments

Each chapter gets 4 stages. Every backdrop follows the same rules, so they are written into each prompt.

### B1. Tidewheel: 4 stage backdrops

**References:**
- https://github.com/mahikshith/breaker/raw/claude/project-thread-r3m42j/renders/refs/round3/env-tidewheel.jpg (today's backdrop; keep its look)
- https://github.com/mahikshith/breaker/raw/claude/project-thread-r3m42j/renders/refs/round3/game-tidewheel.jpg (how the game sits on top of it)

```
You are the environment artist for a premium mobile brick-breaker. The game is played in portrait on phones. Using the reference backdrop's exact painted 3D style, palette and lighting (a dark, moody night castle over water, warm torchlight, cool blue moonlight), paint 4 new backdrops for the 4 stages of the "Tidewheel Citadel" level. They should read as one journey deeper into the same flooded castle.

Rules for every backdrop:
- Portrait, 1080 x 2340 pixels.
- No characters, no bricks, no paddle, no UI and no text.
- Top 25%: architecture with a clear ledge or platform where a giant crab villain stands.
- Middle 50%: darker and calmer with low detail, so coloured bricks read clearly on top of it.
- Bottom 25%: water, because the player's paddle sits just above the water line.
- Keep strong silhouettes and avoid bright spots behind the middle.

Stage 1, "Low Tide": the outer sea gate at low tide, wet stone steps, seaweed, a princess's balcony hanging on chains at the upper right.
Stage 2, "Floodworks": a sluice chamber with two big bronze sluice valves on the side walls and water pouring from grates.
Stage 3, "The Wheel": a giant wooden and iron water wheel filling the upper half behind the ledge, with spray and mist.
Stage 4, "The Refuge": the top of the citadel at storm night, the princess's refuge balcony at the upper right, high choppy water, lightning far away.

Make 4 separate images, in order.
```

### B2. Tidewheel: moving parts sheet (to bring the scene alive)

**References:** the same as B1.

```
Using the same painted 3D style, palette and lighting as the reference backdrop, make 1 image of separate scene pieces that I will animate in code. Put everything on a plain flat background of pure green #00FF00 with no gradient, with wide empty space between items, no text, no cast shadows on the background, and no green anywhere on the items.

Items:
1. The giant water wheel on its own: front view, round and centred, so it can rotate.
2. A torch flame flicker: 6 frames in a row, plus a soft warm glow sprite.
3. Hanging iron chain segments: one 8-link vertical chain.
4. A castle flag waving: 6 frames in a row.
5. A seamless water-surface strip that tiles left to right, with moonlight glints. Give it 4 frames of a gentle ripple loop.
6. A sluice water pour falling from a grate: 6 frames in a row.
7. Water drips and a small spray burst: 4 frames.

After the image, list the items in order with their position.
```

### B3. Frost: 4 stage backdrops plus moving parts

**References:**
- https://github.com/mahikshith/breaker/raw/claude/project-thread-r3m42j/renders/refs/round3/env-frost.jpg (today's backdrop)
- https://github.com/mahikshith/breaker/raw/claude/project-thread-r3m42j/renders/refs/round3/game-frost.jpg
- https://github.com/mahikshith/breaker/raw/claude/project-thread-r3m42j/renders/refs/round3/env-tidewheel.jpg (quality and style bar)

```
You are the environment artist for a premium mobile brick-breaker. The game is played in portrait on phones. Paint 4 backdrops for the 4 stages of the "Frost Warden" siege level, in the painted 3D style of the Tidewheel reference, with the cold palette of the Frost reference: a moonlit snowy castle at night, icy blues, warm torch accents. A giant yeti is besieging the castle where a princess is held.

Rules for every backdrop:
- Portrait, 1080 x 2340 pixels.
- No characters, no bricks, no paddle, no UI and no text.
- Top 25%: battlements and a clear ledge where the yeti stands, with a tower window at the upper right where a princess appears.
- Middle 50%: darker and calmer with low detail, so coloured bricks read clearly.
- Bottom 25%: a snowy stone floor where the player's paddle sits.

Stage 1, "The Breach": the outer wall with one section freshly smashed open, rubble and snow dust.
Stage 2, "Ice Posts": the courtyard lined with thick ice pillars and frozen braziers.
Stage 3, "Inner Bailey": cracked walls, deep claw marks and frozen banners.
Stage 4, "The Keep": the keep's great hall doors iced over, a blizzard, the princess's tower window lit.

Make 4 separate images, in order. Then make a 5th image with scene pieces to animate, on a plain flat pure green #00FF00 background, spaced apart, with no green on the items:
- a torch flame, 6 frames;
- falling snow particles;
- a blowing snow drift strip, 4 frames;
- a frozen banner swaying, 4 frames;
- an ice crack spreading on stone, 4 frames;
- a wall section crumbling, 4 frames.
```

### B4. Gatehouse: the new opening stage

**References:**
- https://github.com/mahikshith/breaker/raw/claude/project-thread-r3m42j/renders/refs/round3/env-castle-hall.jpg (today's inner hall)
- https://github.com/mahikshith/breaker/raw/claude/project-thread-r3m42j/renders/refs/round3/game-gatehouse.jpg
- https://github.com/mahikshith/breaker/raw/claude/project-thread-r3m42j/renders/refs/round3/char-korr.jpg (the villain, for scale only; do not paint him)

```
You are the environment artist for a premium mobile brick-breaker. The game is played in portrait on phones. Paint the opening stage of the "Gatehouse Siege" level in the exact painted 3D style, palette and warm torchlit lighting of the castle hall reference: the OUTSIDE of the castle gatehouse at dusk, a tall portcullis gate with chains running up to a high battlement, a raised drawbridge, a moat below, and banners.

Rules:
- Portrait, 1080 x 2340 pixels.
- No characters, no bricks, no paddle, no UI and no text.
- Top 25%: the battlement walkway, a clear ledge where a boar warlord stands, a chain winch, and a cage hanging from a chain at the upper left where a princess is held.
- Middle 50%: darker and calmer with low detail, so coloured bricks read clearly.
- Bottom 25%: the near bank of the moat and stone paving where the player's paddle sits.

Then make a second image of scene pieces to animate, on a plain flat pure green #00FF00 background, spaced apart, with no green on the items:
- a chain winch drum turning, 4 frames;
- a hanging cage swinging, 4 frames;
- a torch flame, 6 frames;
- a banner waving, 6 frames;
- moat water ripple, 4 frames.
```

---

## C. Special bricks

### C1. Special bricks for three themes

**References:**
- https://github.com/mahikshith/breaker/raw/claude/project-thread-r3m42j/renders/refs/round3/bricks-glaze-sheet.jpg (the brick style to match exactly)
- https://github.com/mahikshith/breaker/raw/claude/project-thread-r3m42j/renders/refs/round3/game-tidewheel.jpg

```
You are the prop artist for a premium mobile brick-breaker. Match the reference brick sheet exactly: glossy glazed ceramic bricks with bevelled edges, a glaze highlight band, a small star glint at the top-left and a soft contact shadow. Every brick is a 2:1 rectangle, flat-on front view, all the same size.

Make 1 image: a grid on a plain flat pure green #00FF00 background, with wide even spacing, no text and no green on the bricks. Make 3 rows, one per theme.
- Row 1, sea theme (pearl, coral, brass):
  - chest brick, intact and cracked;
  - pearl coin brick;
  - sea-mine brick (a spiked mine set into the brick, with a glowing red core);
  - key brick;
  - two-hit barnacle-armoured brick, intact and cracked;
  - an unbreakable brass-banded steel bar.
- Row 2, frost theme (ice glass, frost iron), with the same set of bricks: chest, chest cracked, coin, frost mine with a blue core, key, armoured, armoured cracked, frost-iron steel bar.
- Row 3, castle theme (enamel, gilt, iron), with the same set of bricks: chest, chest cracked, gold coin, powder-keg bomb brick, key, gilt armour plate, gilt armour plate cracked, riveted portcullis-iron bar.

After the image, list each brick with its row and column.
```

---

## D. Effects (optional)

### D1. Realistic impact effects

**References:**
- https://github.com/mahikshith/breaker/raw/claude/project-thread-r3m42j/renders/refs/round3/game-tidewheel.jpg
- https://github.com/mahikshith/breaker/raw/claude/project-thread-r3m42j/renders/refs/round3/game-frost.jpg

```
You are the VFX artist for a premium mobile brick-breaker with a painted, realistic-but-stylised look (see the references). Make 1 image of effect animation strips, each strip in its own row, on a plain flat pure black #000000 background, frames evenly spaced, no text.

Row 1: a water splash, 8 frames: a crown of translucent water sheets rising and breaking into glossy droplets, then foam settling. Realistic water, not cartoon.
Row 2: ice shattering, 6 frames: ice shards and frost dust.
Row 3: stone and mortar debris bursting from a wall hit, 6 frames.
Row 4: a gold coin burst with sparkles, 6 frames.
Row 5: a dust cloud puff, 6 frames.

After the image, list the rows.
```
