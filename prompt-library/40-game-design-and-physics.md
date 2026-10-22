# 40 - Game design and physics specs

These prompts are for a **reasoning (text) model**, not an image model: ChatGPT with thinking or Claude. They produce documents we can build from. Each one carries our fixed rules so the answer cannot break them.

Use them in this order for a new level: **D1** (level design doc), then **D2** (physics and collision spec) for every character or machine in it, then **D3** (a script that measures the art), then **D4** (a rule audit of the result).

Attach the render or board when you have one. A model can read an image and write a spec for it. A model cannot see our code, so everything it needs is in the prompt.

## Our fixed rules (already inside every prompt below)

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

## D1. Level design doc

Fill the brackets. If you leave [IDEA] short, the model will propose a twist; if you give a full idea it will tighten it.

```
You are the lead level designer for BREACH, a premium portrait brick breaker for iOS and Android (chunky glossy 3D toy look, a chrome ball and a chrome paddle, bricks, villains and little characters with big expressive faces). Write a level design document I can hand to an engineer and an artist. Plain English, short sentences, tables where they help, no marketing words.

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

SYSTEMS WE ALREADY HAVE (reuse them, do not invent big new systems):
- Floors: a level can be three floors tall. Clearing a floor's goal plays a 1.2 s camera climb; bricks, villain and lives carry over; Continue restarts the current floor, not the level.
- Sweet-Spot Ram: hit the ball with the paddle's centre third three times in a row and the next centre hit launches a Ram Ball (2.2x size, ploughs through bricks for 2.5 s or 14 bricks, deals 3 HP to a villain, bounces off armour).
- Hero powers sit behind a small face orb at lower-left and share one charge meter that fills from productive brick hits. Kit: Brick Ward, Arrows, Cosmic (unstoppable ball), Ball Fan. Lumi: Lullaby (calms a snake for 4 s), Starlight Notes (next 6 bricks drop power-ups), Song Shield.
- Power-up capsules: SPLIT x3, BURST +3, FIRE, WIDE, AIM, LASER, SHIELD, SLOW, TINY (bad).
- Focus aim: hold still as the ball lands, time slows to 0.25x, slide to aim, lift to fire.
- Grids: the Vault is 20 x 20 cells of 16 units at origin (20, 96). Invasion is 11 x 9 cells of 28 x 18 units.
- Characters and art we can reuse: Kit (knight), Lumi (princess), Gnash (emerald serpent, 13 head expressions), Mooncoil (violet serpent), Korr (armoured boar, poses idle/windup/release/stagger/dazed/defeat), Nerra (crab queen), Clank robots, Zorvax mothership; glazed bricks in five colours with three damage states, keystone/gem/granite bricks, castle windows (back recess plus front lip), bells, chains, gates, winch wheels, ramps.
- Precedent numbers (Bellforge): villain HP 24/32/40, tell length 1.8/1.6/1.4 s, hazard interval 10/8.5/7.5 s for Easy/Medium/Hard. A full Easy run of a 3-floor level takes 2 to 3 minutes.

THE LEVEL I WANT: [IDEA IN 2-6 SENTENCES: who is the villain or hazard, the setting, the hero, the one twist].
LEVEL NAME (working): [NAME].
HERO: [Kit / Lumi / other].

WRITE THESE SECTIONS, in this order, using these exact headings:
1. Status line: "Status: design proposal, [date]. Not built."
2. Pitch: 3 short bullets (what the player does, what is new, why it is fun).
3. The twist: how it works, how the player can use it, and the counterplay. One twist only.
4. Floors: a table with columns Floor | Goal | Hazard (with its tell) | Reused art. Three floors, each a 20 to 40 s bite with its own small win.
5. Hazards and tells: a table with columns Hazard | Visible tell (what it looks like, how long) | How it is shown safely once first | Counterplay (what the player does) | Cost if it lands (never a hidden or unfair cost; prefer losing a ball position, a short paddle stun, or a lost bonus over losing a life).
6. Difficulty: a table with Easy / Medium / Hard columns. Rows: villain HP, number of bricks, tell length, hazard interval, speed, anything else that changes. Difficulty changes numbers only.
7. Stickiness and urgency: why the player says "one more run"; what is visibly urgent (a meter, a march, a countdown the player controls); what the reward loop is; a skill moment the player can repeat and be proud of; how Continue and Retry keep progress.
8. Physics notes: which things move; which are compound circles following the drawn art; which need sweeps; anything that could trap or tunnel a ball and how it is prevented (see rule: collision follows the drawn art).
9. Reuse and new art: a table with Need | Source (existing art or code) | New work. Keep new work small and reusable; for each new piece of art say which prompt-library file it comes from (10 characters, 20 bricks/props/FX, 30 level boards).
10. Rules check: go through each fixed rule above and write "OK" or "VIOLATED" with one line. Fix any violation before you answer.
11. Open questions: at most five, each with your recommended answer.

Keep the whole document under 900 words, not counting tables.
```

## D2. Physics and collision spec for a character or machine

Attach the keypose sheet or the sprite. Fill the brackets.

```
You are the physics designer for BREACH, a premium portrait brick breaker. Write a collision and motion specification for one character or machine, based on the attached image(s). An engineer will implement it exactly. Plain English, short sentences, tables for numbers.

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

PHYSICS FACTS:
- Ball: a circle of radius 6. Paddle 100 x 14. Fixed step 1/120 s. Ball movement uses swept (continuous) collision so fast balls never tunnel.
- A character's collision is a COMPOUND OF CIRCLES placed along the drawn art, in world units relative to a pivot (usually the supporting foot or the mass centre). Every circle must be fully inside the opaque art (alpha at least 50%). Gaps in the art (between legs, under the belly, between jaws, between horns) stay EMPTY: never fill them. Use about 30 to 50 circles for a large character, fewer for a small one, larger circles first.
- Pivots sit at the physical pivot (hinge, axle, mass centre), never at the middle of the image.
- Rotating or moving parts (ramps, wheels, bells, gates, heads on necks) are swept: use conservative advancement against a capsule for rotation, and a moving-collider sweep for translation. Each reflected remainder tests only the remaining motion.
- When the pose changes, blend between the old and new circle sets over at least 0.15 s, and any ball left overlapping is pushed out along the contact normal. A ball is never trapped inside art.
- One contact deals damage once, even if several circles overlap it. Shared hull and component damage must not double count.
- Never let the ball pass through opaque art or collide with transparent areas.
- Decorative parts (a loop on a bell, a tuft, a flag) carry no collision.

WHAT TO SPECIFY: [NAME OF CHARACTER OR MACHINE], with these poses or states: [LIST, e.g. idle, windup, release, stagger, dazed, defeat].

WRITE THESE SECTIONS:
1. Summary: what it is, what moves, what is solid, in 3 lines.
2. Coordinates: image size in px, pixels per world unit (we use 3), unit size of the full canvas, pivot as a fraction of the canvas (u, v) and in units, y points down.
3. Body shapes per pose: a table per pose with columns x | y | r (world units, relative to the pivot). Estimate them from the image as well as you can and say they must be re-measured from the real PNG (use prompt D3).
4. Moving parts: for each (jaw, wing, bell, ramp, wheel, head on neck): pivot, rotation range in degrees, speed, the shape (capsule or circles), whether it is solid at all times, and what the ball does on contact.
5. Anchors: named points as (u, v) fractions of the canvas: muzzles, mouth, hinge, axle, gem sockets (centre, facing direction, radius), bell loop, birth points for projectiles, foot contacts.
6. Hit rules: which parts take damage, how much per ordinary hit, what is armour (ball bounces, no damage), what staggers it, the broad target rule (no weak point smaller than a 32 x 16 brick).
7. Telegraph timing: the tell (what it looks like, duration for Easy / Medium / Hard), the first safe demonstration, the release, the recovery window.
8. Failure cases to test: list 8 specific cases (ball spawned inside a pose change, two circles hit in one step, ball in a gap between legs, a rotating ramp hitting a ball against a wall, ...) with the expected result.
9. manifest.json: the full manifest for this entity in exactly the format below.

MANIFEST FORMAT (JSON; follow it exactly, add fields only if you must and say so):
{
  "version": 1,
  "status": "proposal, measure from the real PNG before use",
  "pivotConvention": "Normalized UV of the full padded image/cell. Anchors share that UV. 'unit' gives the full canvas world width and height; never stretch a character non-uniformly.",
  "collisionConvention": "Each disk fully inscribed in alpha >= 128, relative to the normalized pivot at the declared unit scale. Conservative union; never fills leg or jaw gaps. y points down.",
  "filter": "linear",
  "entities": {
    "<name>": {
      "path": "assets/<folder>/<name>.png",
      "size": [2048, 448],
      "cell": [512, 448], "columns": 4, "rows": 1,
      "unit": [170.667, 149.333],
      "pivot": [0.5, 0.884],
      "alphaBounds": [54, 42, 1985, 429],
      "anchors": { "mouth": [0.62, 0.47], "hingeJaw": [0.58, 0.52] },
      "clips": { "idle": {"start": 0, "n": 1, "fps": 1}, "windup": {"start": 1, "n": 1, "fps": 1} },
      "frames": [
        { "name": "idle", "index": 0, "path": "assets/<folder>/<name>-idle.png",
          "collision": [ {"type": "circle", "x": 9.667, "y": -59.0, "r": 39.561}, {"type": "circle", "x": -16.333, "y": -49.0, "r": 33.404} ] }
      ],
      "parts": {
        "jaw": { "pivot": [0.58, 0.52], "rangeDeg": [0, 35], "shape": {"type": "capsule", "a": [0, 0], "b": [14, 4], "r": 5} }
      }
    }
  }
}
```

## D3. A script that measures the art (run it in the model's code tool)

ChatGPT's code tool can run this. It measures the collision circles from the real PNG, which is more accurate than estimating from a picture.

```
Write a complete Python 3 script (standard library plus numpy, Pillow and scipy) that I can run on my computer, and run it yourself on the images I attach if you have a code tool.

Input: one or more transparent RGBA PNGs of a game character or object, and these settings: pixels per world unit [3], pivot as a fraction of the canvas [u, v] (for example 0.5, 0.88), and a maximum number of circles [40].

For each PNG:
1. Make an opaque mask: alpha >= 128.
2. Compute alphaBounds (x0, y0, x1, y1 of the opaque pixels).
3. Greedy inscribed-circle packing: compute the Euclidean distance transform of the mask; repeatedly take the pixel with the largest distance as the centre of a circle with that radius (shrunk by 0.5 px), then erase that circle from a working copy of the distance map's candidates so later circles may overlap earlier ones by at most 40% of the smaller radius. Stop at the maximum count, or when the next radius is below 1.5 world units, or when 92% of the mask is covered.
4. Every circle must lie fully inside the mask. Assert this and drop any circle that does not. Never fill gaps between legs, jaws or horns.
5. Convert each circle to world units relative to the pivot: x = (cx - pivotX_px) / ppu, y = (cy - pivotY_px) / ppu (y points down), r = radius_px / ppu. Round to 5 decimals.
6. Write a JSON file in this shape, one frame per input image: {"frames": [{"name": "...", "path": "...", "size": [w, h], "alphaBounds": [...], "collision": [{"type": "circle", "x": 0, "y": 0, "r": 0}]}]} plus "ppu" and "pivot" at the top.
7. Also write a preview PNG per input: the original image on a dark navy background with the circles outlined in cyan, so I can check them by eye.

Command line: python circles.py --ppu 3 --pivot 0.5 0.88 --max 40 --out frames.json image1.png image2.png
Add clear comments and print a short summary table (frame, circle count, coverage percent).
```

## D4. Rule audit of any design doc or spec

Paste the finished document under the prompt.

```
You are a strict reviewer for BREACH, a premium portrait brick breaker. Check the document below against our fixed rules. Do not rewrite it. List every problem as: rule broken, the exact sentence in the document, why it breaks the rule, and a one-line fix. Then give a verdict: PASS, or FIX FIRST with the three most important fixes. Also flag any hazard that has no visible tell, any target smaller than an ordinary 32 x 16 brick, any step where ordinary ball play stops making progress, any place where a hidden collision box disagrees with the drawn art, and any fail cost that feels unfair.

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

DOCUMENT TO CHECK:
[PASTE THE DOCUMENT HERE]
```

## Notes

- Ask for D1 in three flavours if you want options: add "Give me three different twists first, one line each, and wait for me to choose" at the end.
- A good doc is short. If the answer is long, ask: "Cut it to the essentials and keep every table."
- Hand the finished markdown back to us as-is. We build from the tables.
