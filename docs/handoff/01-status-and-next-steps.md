# BREACH handoff 1/3: status and next steps

Read all three handoff docs before touching code: this one (status, rules, TODO with agreed designs), `02-architecture-and-pipeline.md` and `03-environment-skills-ux.md`. Keep them updated at the end of every session. Everything here reflects the repo as of branch `wip/polish-pass` (based on `main` @ b5df0eb, 2026-10-18).

## Progress log (newest first)

- **2026-10-18 (round 3, merged to `main`).** Owner feedback: remove distractions so the focus is the snake, the princess, the gameplay and the power-ups.
  - **Removed:** torchlight, dust motes, the window bars across Saturn, and the WIDE/TINY HUD chips.
  - **Serpent meter:** a colour-only bar running green → amber → red, with no "% away".
  - **Serpent behaviour:**
    - it grows longer and thicker as it eats, and a swallow bulge travels down its body;
    - it starts sluggish and speeds up (`speedK` in `updateSnake`);
    - bites lunge harder and throw more chips.
  - **Camera:** it pushes in as danger rises (anchored on the paddle line), then zooms to 1.55× on the cage during the attack.
  - **Cage:** a dark stone cell with a cool light on the princess, and a rendered dark-iron `bars.png` (code fallback in `drawBars`).
  - **Full screen:** the canvas covers the whole phone screen, and the edges mirror out (`fillMargins`). The menu has a Full screen button where the browser supports it.
  - **Art v3:** glazed bricks, the new caps and titan ball, a torch-free Vault plate, a calmer Invasion plate, princess `Nervous`/`Panic`, serpent `snarl`/`strike`.
  - **PNG metadata:** Blender writes the .blend path, which contains the home folder name, into PNG metadata. Strip it before committing; see the snippet in doc 02.

- **2026-10-18 (edge-to-edge):** owner asked for a true full-screen layout with no dead band at the top. A dimmer Saturn followed: "the background must not outshine the foreground". They also wanted to actually see WIDE in play.
  - `main.js` `LIFT = 34`: each level is built `H + LIFT` tall, drawn shifted up by `LIFT`, and its pointer y is offset by `LIFT`.
  - The levels draw their top HUD at `this.hudY`. The deck fills into the home-indicator strip via `this.inB`.
  - Invasion `calm()` darkens and desaturates the plate further, and sinks the planet with a radial shade.
  - WIDE leads both drop tables.
  - Layout check: `node tools/playtest/layout.mjs <out>`.

- **2026-10-18 (ChatGPT split):** the owner approved Phase 1 with the recommended defaults. Design work (story scripts, character design, concept art, UI specs) moves to the owner's ChatGPT Pro project; Claude keeps execution.
  - The brief is `docs/handoff/04-chatgpt-design-brief.md`. The owner's steering prompts (ChatGPT project instructions, task prompts, corrections, checklists) are in `docs/handoff/05-chatgpt-steering-prompts.md`. Every art script, in full, is in `docs/BREACH-blender-scripts.md`.
  - The single file to upload to ChatGPT is `docs/BREACH-ChatGPT-handoff.md`: the brief, story plan, game plan, docs 01–03 and a file map. Rebuild it after editing any of those docs: `python3 tools/make_handoff.py`.
  - ChatGPT returns `design/phase1/*.md` and images; the owner uploads them to the Claude thread for building.

- **2026-10-18 (story plan):** owner asked for a dedicated story mode, a prince, locked weapons, a store with skins, and more power-ups (multi-ball multiplier, paddle bullets), backed by research into addictive games.
  - Plan drafted, not built: `docs/STORY_PLAN.md` (live, editable copy: https://claude.ai/code/artifact/5278a4c8-b669-4235-972f-7814c32382d9; also `/mnt/project-files/breaker/plan/STORY_PLAN.md`).
  - Core idea: bricks are alive with light and Princess Lumi is the light; Zorvax the Curator holds her in the Menagerie space prison; Prince Kit is the underdog hero; score becomes Shine, which rebuilds Brickhaven.
  - Waiting on the owner's four decisions at the end of the plan (names, Kit's look, start Phase 1, business model). Nothing in section 9 is built until the owner approves.

- **2026-10-18 (later):** TODO items 1–7 in section 8 are implemented on `wip/polish-pass`:
  - level wiring, crumble vs. big crash, difficulty, continue screen, ferocious serpent with bite marks and the cage attack, nervous and panicking princess, and the Invasion calm-down with its landing beat.
  - Draft screens are in `/mnt/project-files/breaker/playtest/v3/`. Re-shoot them with `node tools/playtest/polish.mjs <out> ios|android`.
  - **Still open:** item 8 (shinier bricks, new capsules, titan ball, princess `Nervous`/`Panic` frames, serpent `snarl`/`strike` faces, all being rendered); then item 9 (playtest Android, tune difficulty) and item 10 (merge to `main`).

---

## 1. Rules from the owner (non-negotiable)

- **Repo:** https://github.com/mahikshith/breaker. `main` holds the last stable build. In-progress work is on `wip/polish-pass`.
- **Commit identity:** every commit must be authored and committed as `mahikshith <mahikshith97@gmail.com>`. The repo-local config sets this: `git config user.name mahikshith; git config user.email mahikshith97@gmail.com`.
- **No AI attribution anywhere.** That means:
  - no "Co-Authored-By" lines;
  - no session links;
  - no "Generated with …" in commits, code comments, README or docs.
- **Never ask for or paste the owner's GitHub token.**
- **Show the owner screen drafts and character sheets during playtests.** They want to see shots for iOS and Android sizes.
- **Quality bar:** the owner (mykee) wants a premium, inventive, addictive iOS/Android game, and nothing that looks "vibe-coded".
  - Favourite references: BALL x PIT, and Arkanoid crossed with Space Invaders.
  - Rejected in the past: pixel art, wisps, jittery foxes, ball-chain snake bodies, rounded blob heads, and uniform faces. Expressions must "say a lot".
- **Scope right now:** make the two existing levels perfect. Future ideas are noted in section 9 but must **not** be built yet. The structure only needs to stay extensible for them.

---

## 2. The game in one paragraph

BREACH is a brick breaker for phones in portrait. The world is 360 units wide, and the height adapts to the screen.

You drag your thumb to move a chrome paddle and bounce a chrome ball. The game has two levels:

1. **Invasion.** A marching Space-Invaders-style formation of glossy candy bricks and toy robots steps down toward you, and the robots fire bolts. If the formation reaches the hazard line, you lose. Clear the formation and a mothership boss arrives.
2. **The Vault.** This is a side-view cutaway of a castle tower. A princess is caged near the top, and a purple serpent chews its way through bricks toward her along a Dijkstra path. You break a path up to the cage to free her. That triggers BREACH: she runs out and a FRENZY multiball round plays as the win lap. If the serpent reaches her, you lose.

There is also a **Focus aim** mechanic. Hold your thumb still while a ball lands and the paddle catches it. Time slows to 0.25×, you slide to aim with a predicted path, and you lift to fire. This costs an AIM pip; pips refill as you break bricks.

---

## 3. Tech stack and how to run

- **Code:** plain JavaScript ES modules with Canvas 2D. There is no framework.
- **Physics:** custom deterministic circle-vs-grid physics for the balls (`src/physics.js`), plus **planck.js** (Box2D) for brick debris (`src/debris.js`).
- **Build:** esbuild bundles everything into one self-contained HTML file.
  - `npm install`, then `npm run build`, produces:
    - `dist/breach.html`, the standalone page;
    - `dist/breach-artifact.html`, a body fragment for hosts that supply their own `<head>`.
  - The build is about 1.2 MB because every rendered image is inlined as a WebP data URI in `src/vault-art.js`.
- **Run locally:** open `dist/breach.html`, or serve the repo root and open `index.html`, which loads `src/main.js` as a module.
- **URL params:**
  - `?level=1` or `?level=2` jumps straight into a level;
  - `?safe=top,bottom` fakes notch and home-indicator insets in CSS px. iPhone 15 is `?safe=59,34`, a typical Android is `?safe=32,24`.
- **Test hook:** `window.__breach` exposes `{ start(i), level, scene }` for automated playtests with Playwright and Chromium.
- **Unit tests:** `npm test` runs `tests/physics.test.js`.
- **Fixed timestep:** 1/120 s (`STEP` in `main.js`).
- **Fonts:** Google Fonts **Lilita One** for game text and **Rubik 600** for numbers, loaded in `index.html`.

### Art pipeline (Blender, optional to re-run)

All art is pre-rendered in Blender (bpy 5.2.2 from pip, Cycles on CPU, view transform AgX "Medium High Contrast").

- Light comes from a key area light at the **top-left**, and shadows fall down-right everywhere. Code-drawn shadows match: offset +3, +5.
- Scripts live in `art/`:
  - `render_vault_assets.py` and `vault_post.py` render the Vault plate, bars, bricks, ball, paddle, capsules, lantern and torch flame into `assets/vault/` plus `atlas.json`.
  - `render_invasion_assets.py` and `invasion_post.py` render the Invasion hangar plate, bricks, robots (7 expressions × 4 colours), mothership (5 expressions plus a light overlay), bolt and bomb into `assets/invasion/`.
  - `princess.py` restyles the KayKit Rogue model (`assets/models/kk_Rogue.glb`, CC0) into the princess: tiara, expressive eye rig, bell skirt. It renders animation frames to `assets/princess/<Anim>_NN.png`. The `--face` option renders face close-ups.
  - `snake.py` renders the serpent's angular head. It has an `EXPR` dict of expressions (lids, brows, slit pupils, jaw, tongue, fangs) and two facings, `r` and `l`. Output goes to `assets/snake/head_<expr>_<r|l>.png` and `meta.json`.
- `tools/pack_art.py` packs everything into `src/vault-art.js` (`export const ART = {...}`). Re-run it after any render, then `npm run build`.
- **Sprite convention:**
  - sprites are 3 px per game unit, with a margin (usually 4 units) around the footprint;
  - plates are 2 px per unit and cover screen y from -40 to 780, drawn at (0, -40) with size 360 × 820.
- **Runtime registry:** `SPR` in `src/gfx.js`. Vault and shared sprites are keyed by file name (`ball`, `paddle_l`, `cap_split`, `brick_t_2_0`…). Invasion sprites are prefixed `inv_`. `ready(spr)` checks that an image has decoded.
- **Fallbacks:** every sprite has a code-drawn fallback, so the game runs without art.

---

## 4. Look and feel (keep this)

- **Style:** glossy "vinyl toy" pieces with real light, deep shadows, and saturated but not neon colours. Bricks should read like **glazed ceramic tiles**. See `docs/reference/vault-top-down.png`, the look the owner called "even shinier" and wants matched.
- **Not too much yellow.** Gold and yellow are accents only.
- **Ball:** chrome, a 12-unit ball drawn from a 20-unit sprite. The fire variant is molten orange. The titan variant (new) is dark gunmetal with magenta and cyan energy, plus a code-drawn pulsing halo.
- **Paddle:** chrome capsule made of three sprites (`paddle_l`, `paddle_m` stretched, `paddle_r`).
- **Fonts:**
  - Lilita One for all game text, always drawn with a dark outline and drop shadow via `text()` in `gfx.js`;
  - Rubik for the score.

### Palette

| Use | Colours |
|---|---|
| Vault bricks | sun `#ffc73d`, coral `#ff6f61`, violet `#8f5cf0`, teal `#22c4b0`, blue `#4f9dff`, gold `#f4c542` (gem bricks), granite `#4a4f6e` (indestructible) |
| Invasion rows, top to bottom | `#ff5d8f`, `#ff8a3d`, `#ffd23f`, `#5ccf6a`, `#2ec4b6`, `#3fa8f5`, `#7b6cf6`, `#c46bf0`, `#ff5d8f`; armour `#8d97b3`; power brick `#f4c542` |
| Level accents | Invasion pink `#ff5d8f`, Vault gold `#f4c542` |
| AIM / Focus UI | lilac `#e3b6ff` / `#c46bf0` |
| Combo text | `#ffd36b` |
| Danger | `#ff4d5e` |
| Success | `#7bd88f` / `#7bf2c8` |
| Menu background | gradient `#22284a` → `#141831` → `#0a0c18`, with a vignette and film grain |
| Serpent body | purple `#7a3ccc`, peach belly `#ffc49a`, rose diamonds `#ff6fae`, outline `#1e0a40` |
| Power-ups | ×3 split `#5ccf6a`, FIRE `#ff8a3d`, WIDE `#3fa8f5`, AIM `#c46bf0`, +3 `#f7c948`; new: LASER `#ff4d6d`, SHIELD `#2ec4b6`, SLOW `#7fd6ff`, TINY `#5a5f78` (a bad power-up) |

### Mobile UI/UX rules already applied

- **Safe areas:** the notch and home indicator are respected. The scene extends under them through `level.drawTopInset()`.
- **Pause:** top-left with a 44 pt touch target, away from the steering thumb.
- **Steering:** relative thumb drag anywhere on screen. The finger never covers the ball.
- **HUD:**
  - level meter top-left ("SERPENT x% away" or "FORMATION n left");
  - score top-right;
  - lives (small chrome balls) and AIM pips at the bottom.
- **Feedback:** haptics through `navigator.vibrate` on big hits, hit-stop, screen shake (trauma model), and pentatonic hit sounds that rise with the combo. All sound is synthesised in `src/audio.js`.

Reference screenshots of the current `main` build are in `docs/reference/`:

- `vault-v2-android.png`
- `invasion-v2-android.png`
- `snake-v2-sheet.png`
- `robot-expressions-ingame.png`

---

## 5. Code map

| File | What it does |
|---|---|
| `src/main.js` | Canvas sizing and safe insets, input mapping, the fixed-step loop, scenes (menu with level cards and live previews; level; results with stars). `LEVELS` registry. `best` stars kept in localStorage. |
| `src/arena.js` | **Base class shared by both levels:** paddle, balls, serve and Focus aim, power-ups, lives, combo, score, shake, HUD base, aim-path preview. Levels extend `Arena` and override `hitCell`, `updateLevel`, `draw`, `background`, `result`… |
| `src/physics.js` | Ball stepping with substeps, grid collision with ghost-edge fix, paddle bounce (offset angle up to ±62° plus swipe spin), minimum vertical speed. |
| `src/debris.js` | planck world. It has five behaviours: |
| | • `shatter()`: Voronoi fragments from the brick image; |
| | • `drop()`: a whole brick falls as a rigid body and shatters on impact; |
| | • a kinematic paddle that debris can bonk; |
| | • `poke()`, which lets balls shove debris; |
| | • **new `crumble()`**: non-physics fragments that shrink and fade in about 0.4 s. |
| `src/gfx.js` | Sprite registry `SPR`, `cached()` offscreen canvases, the `brick()` fallback, `drawBall`, the `FX` particle system (shards, dust, rings, score pops), `text()`, `POWER` table, `capsule()` fallback. |
| `src/invasion.js` | Level 1 (details in section 6). |
| `src/vault.js` | Level 2 (details in section 6). |
| `src/characters.js` | Old code-drawn character fallbacks (invader, mothership, serpent). |
| `src/audio.js` | WebAudio synth SFX (`sfx.hit/tough/paddle/wall/power/lose/zap/hurt/boom/breach/beat/chew/win`). |
| `src/vault-art.js` | **Generated** by `tools/pack_art.py`. Never edit by hand. |
| `src/prefs.js` | **New.** A `store.get/set` wrapper over localStorage. |
| `src/monetize.js` | **New.** Continue-offer placeholders (section 8). |

---

## 6. Level details (as on `main`)

### The Vault (`src/vault.js`)

- **Grid:** 20 × 20 cells of 16 units, origin (20, 96). Bricks are 2 cells wide in running bond. `LAYOUT` is an ASCII map:
  - `t` teal, `v` violet, `c` coral, `y` sun, `b` blue — glazed bricks;
  - `g` gold gem brick, which drops a power-up;
  - `#` granite;
  - `=` cage bars.
- **Cage (`POCKET`):** columns 7–12, rows 3–5. Bars are solid to the ball but open to the serpent.
- **Serpent:**
  - It plans a Dijkstra route to the cage, where each brick costs chewing seconds (`CHEW`).
  - Its body is a list of cells. It is drawn as a tapered Catmull-Rom ribbon in canvas, with the rendered head sprite on top.
  - `expression()` picks the face: mood timers first (ouch, hiss, shock), then dizzy, grin, chew, blink, taste, hunt or idle.
- **Ball vs serpent:**
  - hitting the head stuns it and knocks it back one cell; three quick hits knock it back four;
  - hitting the body costs it chewing progress;
  - a falling brick that lands on it crushes it: stun plus knockback.
- **Collapse rule:** bricks that lose their connection to granite, the side columns or the top row fall as planck rigid bodies (`collapse()`). Debris that hits the paddle stuns it ("BONK").
- **Breach:** when a flood fill from the cage reaches the bottom row, `checkBreach()` bursts the cage. The princess runs down the path (`Running_A`), then FRENZY runs for 7 s with 12 balls and permanent fire, then the level is won.
- **Princess:** a sprite sheet with these animations:

  | Animation | Frames |
  |---|---|
  | Idle | 16 |
  | Interact | 12 |
  | Blocking | 8 |
  | Cheer | 16 |
  | Running_A | 12 |
  | Jump_Full_Short | 14 |
  | Scared | 8 |

  She plays at 14 fps, with speech bubbles ("Help!", "Hurry!", "Eek!", "Yay!").
- **Intro camera:** about 3.4 s. It starts on the princess, pans to the serpent's lair, then pulls back. Tap to skip.
- **Stars:**
  - 1 for the rescue;
  - +1 if the serpent never got halfway (`peakDanger < 0.5`);
  - +1 if the score is over 10 000.

### Invasion (`src/invasion.js`)

- **Grid:** 11 × 9 cells of 28 × 18 units, starting at y = 92.
- **Cell types:**

  | Type | Hit points | Notes |
  |---|---|---|
  | CANDY | 1 | |
  | ARMOR | 3 | |
  | POWERB | 1 | always drops a power-up |
  | BOT | 2 | a robot; 20% chance to drop a power-up |
- **March:** the formation steps sideways ±14 units, then drops 14. The step interval shrinks as fewer cells remain. `dangerY = paddle.y - 64` is the hazard line.
- **Robot shots:** the robot lowest in a column scowls (`angry`) for 0.45 s, then fires a bolt. A bolt stuns the paddle; then the shooter and about 35% of the robots laugh, and the boss looks smug. Balls can knock bolts out of the air.
- **Robot faces:** the `march0/1` cycle, `hurt` at 1 hp, `shock` when a ball is about to hit, `dizzy` when killed. A killed robot falls as a rigid body; catching it on the paddle gives +120 "CATCH!".
- **Mothership:** 30 HP, an elliptical hitbox. It drops bombs, and its expressions are smug, angry, hurt, panic and dizzy. Killing it drops the wreck.
- **Stars:** depend on lives left and best combo.

---

## 7. Work in progress on `wip/polish-pass` (what this branch already changes)

The owner's latest feedback, which is the current task list, is reproduced in section 8. The branch already contains the following.

### `src/arena.js` (rewritten; levels still need wiring)

- **Raised paddle.** `paddleY(H, minY)` puts it at `H - clamp(H*0.25, 150, 210)`, well above the thumb.
  - Below it is a **control deck** (`drawDeck(g)`): a dark panel, a grooved track with a grip that follows the paddle, and "Drag anywhere down here to move" for the first seconds.
  - `deckY = paddle.y + 34`, `shieldY = paddle.y + 28`, `drainY = paddle.y + 46`. The ball is lost at `drainY`, not at the screen bottom.
- **Smoother, snappier controls.**
  - The paddle maps 1:1.15 to thumb travel from where the press started.
  - It re-anchors when pinned against a wall, so it reverses instantly.
  - Smoothing went from rate 22 to rate 45.
- **Harder base game.**
  - Ball speed went from 330 to 345, scaled by `opt.speed` per level.
  - A rally ramp adds 1.2% per paddle hit, up to 1.28×.
- **Titan sweet spot.**
  - A diamond "core" gem sits in the centre of the paddle and fills as bricks break (`CORE_BRICKS = 12`).
  - When it is full it blazes. A ball hitting within ±7 units of the centre becomes a **TITAN**: radius 10, ploughs through bricks like fire, lasts 7 s.
  - Pops say "CORE READY · hit it dead centre" (for the first 3 times) and "TITAN!".
- **New power-ups:**
  - **LASER:** twin emitters on the paddle auto-fire every 0.3 s for 7 s. Shots call `hitCell`, and a level can consume them via `shotHit(shot)`, for example for the boss or the serpent.
  - **SHIELD:** a teal energy barrier under the paddle that saves 2 balls, or lasts 16 s.
  - **SLOW:** balls move at 0.68× for 8 s.
  - **TINY:** a bad power-up. The paddle shrinks to 0.62× for 9 s, and the capsule has a flashing red outline.
- **HUD chips:** active power timers show as small chips next to the lives.
- **Aim teaching** (the owner asked how aim works):
  - "CATCH READY" brackets appear over the paddle while the thumb is held still and a pip is available.
  - A coach bubble, "HOLD STILL as it lands to catch & aim", shows when a ball is falling toward the paddle. It stops after the player has used Focus 3 times (`store aimCoach`).
  - During aim: "Slide to aim · lift to fire". During serve: "Slide to aim · lift to launch".
- **Big crashes only.** `bigCrash(ball)` returns true when 4 or more bricks broke within 0.3 s, or the ball is fire or titan. Levels should use `debris.shatter` (physics) only then, and `debris.crumble` (subtle fade) for single bricks. This was requested because falling fragments were being mistaken for the ball.
- **`continueRun()`** puts the level back into play after a continue: at least 1 life, a fresh serve, a 2-hit shield for 10 s, and "BACK IN!".

### Other files

- **`src/debris.js`:**
  - `crumble(art, x, y, w, h, vx, vy, n)` creates a short-lived fade with a white flash;
  - new constructor option `killY` removes physics pieces that fall past the paddle into the deck.
- **`src/physics.js`:** `b.titan > 0` pierces like fire.
- **`src/gfx.js`:** titan ball drawing with halo; `POWER` entries for laser, shield, slow and shrink (`bad: true`).
- **`src/prefs.js`, `src/monetize.js`:** new (section 8).

### Art that was being rendered (may or may not be in the branch)

Two Blender jobs were running when the session ended. They write into `assets/` and re-run `tools/pack_art.py`:

1. **Shinier bricks** for both levels to match `docs/reference/vault-top-down.png`, with the same file names, sizes and atlas entries. Also new capsules `cap_laser`, `cap_shield`, `cap_slow` and `cap_shrink`, and a `ball_titan` sprite. Script edits are in progress in `art/render_vault_assets.py`.
2. **Characters:**
   - princess animations **`Nervous`** (worried walk, about 12 frames) and **`Panic`** (terrified run, about 12 frames), in profile facing like `Running_A`, added to the pack list;
   - serpent expressions **`snarl`** (fangs bared, low brows, narrowed eyes; the hunting face) and **`strike`** (jaw wide, fangs, furious wide eyes; for lunges and bites), in both facings, in `meta.json`.
   - Script edits are in progress in `art/princess.py`.

If those sprites are missing, the code must fall back gracefully:

- missing `cap_*` sprites already fall back to the code `capsule()`;
- a missing `ball_titan` falls back to the fire sprite;
- for the princess, check `PRINCESS.anims.Nervous` and fall back to `Running_A` at a slower frame rate;
- for the serpent, check `SNAKE.expr.snarl` and fall back to `hunt`.

---

## 8. Remaining work: the owner's latest feedback and the agreed design

Paraphrased owner feedback (2026-10-18):

> - Make the bricks shinier, like the Vault top-down render.
> - Add more powers, for example: hit a certain point and the ball becomes bigger and unstoppable.
> - Make it harder so players can actually die.
> - On losing, show a pop-up: watch an ad to continue, or pay to unlock the full game. (Maybe make the whole game free later.)
> - The paddle is too low and overlaps the thumb, and the controls feel sluggish.
> - Explain how aim works (does a long press trigger it?).
> - Single broken bricks should crack and subtly vanish. Only big crashes should drop debris, because falling pieces get confused with the ball.
> - The snake should be more ferocious, visibly bite through bricks with urgency, and have a dedicated animation when it reaches the cage (bite the cage, grab or take the princess).
> - The princess should walk nervously, and run in circles in panic, inside the cage as the snake nears.
> - Apply the same polish to Invasion.
> - Invasion's background is too flashy and distracting: the big planet, the neon, and the yellow-black hazard line and compartments at the bottom. Tone it down and make it darker, but keep the colours.
> - Later, not now: story mode, unlockables (princess, sword, prince), dragons and mythical beasts. Focus on one perfect level first.

### TODO, in order

#### 1. Wire both levels to the new arena

- **Constructors:** pass `minPaddleY`.
  - Vault: about `OY + 20*16 + 80 = 496`, so the paddle never sits on the tower.
  - Invasion: about 470.
- **Draw order:** call `this.drawDeck(g)` right after drawing the background, before the shake transform.
- **Debris:** create it with `floor: H + 200, killY: this.paddle.y + 70`, or similar, so nothing piles up in the deck.
- **Shots:** draw them. `drawBalls` already draws shots.
- **Vault `hintY`:** no longer used and can be removed.
- **Drop tables:** add the new kinds.
  - Vault `DROPS` example: `['split','fire','wide','focus','burst','laser','shield','slow','shrink']`.
  - Invasion: similar, with `laser` weighted a bit higher.

#### 2. Single brick versus big crash

- In `Vault.removeBrick(br, ball)` and `Invasion.hitCell`, use `this.bigCrash(ball) ? debris.shatter(...) : debris.crumble(...)`.
- Reduce the `fx.shatter` coloured shard counts for single breaks to 1–2.
- The Vault `collapse()` rigid-body drops stay as they are: that is the "major crash".

#### 3. Difficulty

**Vault:**
- Multiply `CHEW` by about 0.75 (2.8 → 2.1, 4.6 → 3.45).
- Make the serpent chew faster as danger rises: `need /= (1 + danger*0.5)`.
- Empty-cell travel goes from 0.42 to 0.32.

**Invasion:**
- March interval: `0.2 + 0.7*n/total`.
- Bolt interval: `0.9 + 1.4*n/total`.
- Bolt speed: 200.
- Boss HP: 36.
- In rage, the boss fires twin bolts.

**Both:** tune so a first-time player usually loses once or twice, and a skilled player can 3-star.

#### 4. Continue screen

Do this in `main.js`, with `src/monetize.js` already written.

- **When:** on `state === 'lost'`, if `continueOffer(used)` returns `'ad'` or `'free'`, show a **Continue?** card before the results.
- **Card content:**
  - the loss reason;
  - a 9-second countdown ring;
  - primary button "▶ Watch ad · Continue" (or "Continue" when unlocked or in free mode);
  - secondary button `Unlock full game · ${PRICE}`, hidden when `MODE === 'free'` or already unlocked;
  - a "No thanks" text link that goes to the results.
- **Watch ad:**
  - show a placeholder full-screen "Ad · 3…2…1" card while awaiting `watchAd()`;
  - then call `level.continueRun()`;
  - count `used++` per attempt and reset it in `start()`.
- **Unlock:** `buyFullGame()`, then continue.
- **Level-specific undo** goes in each level's `continueRun()`:
  - **Vault after the serpent reached her:** rebuild the BARS cells, set `cageGone = false`, `knockBack(6)`, stun 3 s, princess back to Idle, `phase = 'rescue'`.
  - **Invasion after the formation landed:** `grid.oy -= 42`; all robots look `shock`.
- **Swapping later:** keep all money logic inside `monetize.js`, so real ad and payment SDKs, or free mode, are a one-file change.

#### 5. Ferocious serpent (Vault)

- **Default face:** `snarl` when danger is over 0.15. Use `strike` on each bite.
- **Visible biting:** about 2.2 chomps per second. On each chomp:
  - the head lunges about 5 units toward the target cell (offset the head draw along `s.dir`);
  - the brick wobbles;
  - chips crumble off;
  - `sfx.chew()` plays louder;
  - bite-mark notches grow on the brick with chew progress, replacing the current thin crack lines in `drawChew`.
  - When finished, `crumble` the brick.
- **Cage attack:** replace the instant "caught". When the next planned cell is a cage cell, start an attack sequence in slow-mo (timeScale about 0.6):
  1. the head **rears back** with `strike` and a red "!" telegraph (0.7 s);
  2. **strike 1**: bars bend (big `barsWob`), sparks, shake, `sfx.boom`;
  3. rear back (0.5 s);
  4. **strike 2**: bars shatter (`burstCage`-style debris);
  5. the head lunges onto the princess; she cowers (`Scared`); `grin`; red flash; "GOT HER!".
  6. `fail('The serpent got the princess')` about 1 s later.
- **Last chance:** hitting the head before strike 2 interrupts the attack (stun plus `knockBack(3)`).

#### 6. Nervous princess (Vault)

Give her an x position inside the cage (about 140–220).

| Danger | Behaviour |
|---|---|
| below 0.3 | Idle at the centre, occasionally "Help!" |
| 0.3–0.6 | `Nervous` walk back and forth at about 22 u/s, pausing at the ends with a scared glance toward the snake |
| above 0.6 | `Panic` run "in circles": x = cx + 36·cos θ, with a slight scale and y bob from sin θ for depth, flipping on direction, biased away from the serpent |
| during the attack | `Scared`, cowering on the far side |

#### 7. Invasion polish

- **Calm the background:**
  - in `background()`, after drawing the plate, darken it with about rgba(6,8,20,0.35);
  - desaturate it about 30% (`globalCompositeOperation = 'saturation'` with grey at about 0.3 alpha);
  - darken the lower hangar (y above about 450) a further 25%.
- **Hazard line:** draw it thin and dim (about 0.3 alpha) until the formation is near, then brighten and flash it as a warning.
- **Landing beat:** when the formation lands, all robots `laugh`, the hazard line flashes red, and a beam zaps the paddle. Then "THEY LANDED" and `fail` after about 1.2 s.
- **Laser:** shots damage the boss through `shotHit`.
- Apply the same crumble, deck and continue behaviour as the Vault.

#### 8. Shinier bricks

Done by the art job above; verify it. If it is not finished, rerun the brick renders with:
- lower roughness and clearcoat;
- a softbox or emissive strip so the top faces catch a crisp highlight;
- the same sizes and names.

#### 9. Playtest and publish

- Playtest at iOS 393×852 with `?safe=59,34` and Android 412×915 with `?safe=32,24`.
- Check for no console errors, the deck clear of play, readable text, and a reachable continue flow.
- Share screenshots with the owner.

#### 10. Merge

Commit as mahikshith (no AI attribution) and merge `wip/polish-pass` into `main`.

---

## 9. Future, NOT to build now (keep the code extensible)

- **Story mode** chaining levels. The full plan (story bible, chapters, heroes, weapons, power-ups, fusions, store, roadmap) is in `docs/STORY_PLAN.md`; build only after the owner approves a phase.
- **Unlockables:** a locked princess, sword or prince shown as "next time" teasers; dragons and mythical beasts as new creatures.
- **Extensibility:**
  - levels are self-contained classes in the `LEVELS` registry in `main.js`, so new levels and creatures slot in the same way;
  - monetisation stays isolated in `monetize.js`;
  - persistent progress goes through `prefs.js`.
