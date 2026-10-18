# BREACH: architecture, art pipeline, build and test

**Latest selection and tested candidate (2026-10-18):** Only A / Carrier Breakout is active; Nix/Tick appearances are selected, but their full expressive sprite/animation families and runtime cast integration are not built. B/Relay Raiders, C/Orbital Breakout and D/Eclipse Rescue are deferred. The playable Carrier web candidate is SHA256 `F4863DC5A87D6B46A8A1AFDB702C264F432196B851B61B828946DB8AB75A0423`. It passes 44 unit tests and both-phone bundled gameplay/visual checks. Independent final captures at 393×852 safe59/34 and 412×915 safe32/24 preserve the approved A art, continuous safe-edge starfield, aligned 125×17u paddle and clean settled results, with zero page errors. Public-input assisted deterministic simulated wins record 82.3s iPhone / 45.2s Android of game clock; these do not establish human balance or physical-device performance. Evidence: `out/carrier-playable-final/report.json` and `out/carrier-visual-final/REVIEW.md`. The owner has requested an APK; packaging/native CI and delivery remain pending. No APK pass is claimed. EA839F00… remains historical accepted baseline evidence; the older A/B Canvas tranche remains asset-only history.

**APK checkpoint authorization (2026-10-18):** The owner explicitly requests the APK. This authorizes the necessary checkpoint commit/push and CI on `codex/carrier-mobile-preview` in the existing isolated `breaker-mobile-preview` worktree, using the exact frozen Carrier/current Vault sources and native immersive fix. Primary `codex/phase1-kit` is preserved. No merge to `main` or pending Nix/Tick companion-family admission is authorized. APK/native CI remains pending; the earlier screenshot-approval notes do not block this specific APK checkpoint.

**Native lifecycle follow-up:** Run39126881472 reaches recreated-menu after native Carrier/Vault checks, then exposes preserved-window focus without focus on the new WebView. A posted local-page-finished step reapplies fullscreen, native view focus and insets after attachment. It does not alter either frozen HTML payload, inject JavaScript focus or weaken the native test. Fresh CI verification is pending; see `docs/MOBILE_PREVIEW.md`.


**Historical A/B asset milestone (2026-10-18):** real independent PNG parts and the isolated Canvas motion assembly are complete for the approved A/B left playfields. Final proof is under `out/space-assets-ab/final/`: `A-ios-reference.png`, `A-android-reference.png`, `B-ios-reference.png`, `B-android-reference.png`, `A-motion.gif`, `B-motion.gif` and `asset-report.json`. Actual 393×852/412×915 images and sampled launch/release/boarding/iris sequences pass independent visual review; all four capture runs report zero page errors, real alpha/metadata checks and approximately 126 CSS paddle reserve. A has five shallow captive windows; B has four large worker pods. This asset-only milestone contains no companions, pilots or portraits and predates the latest Nix/Tick selection. These are asset-motion proofs with a placement ball, not new gameplay: runtime admission/WebP sizing, actual-alpha collision alignment, input/combat/rescue/power rules, full playable phone runs, memory/performance and new APK checks remain. The proof milestone retains EA839F00… as its gameplay baseline; it does not cover later Carrier integration. Reproduction and limits: `art/space/ASSETS_AB.md`; inventory/contracts: `design/phase1/space-assets-ab-spec.md` and `space-assets-ab.json`.
This document is the "how it is built" reference. For current status and the task list, see `01-status-and-next-steps.md`. For tools, connections, skills, memory and UX rules, see `03-environment-skills-ux.md`.

## 1. Aim and goal

- **Product:** BREACH, a premium brick breaker for iOS and Android, portrait only. The tagline is "Break in. Break out."
- **Current goal:** deliver the owner-requested APK from the final tested Carrier web candidate. Selected A art, collision/physics, objective/combat/powers and native-size browser checks now pass; packaging/native CI is pending. Nix/Tick full families/runtime cast integration remain unbuilt. Preserve existing Vault controls and exclusive Kit, defer B/C/D and later chapters, and use the final evidence above instead of the earlier EA839F00 asset-proof baseline.
  - **Invasion:** Arkanoid crossed with Space Invaders.
  - **The Vault:** a rescue race against a serpent.
- **Later:** a story mode and unlockables, planned in `docs/STORY_PLAN.md`. Nothing for those is built yet.
- **Reference games:** BALL x PIT, Arkanoid, Space Invaders.

The mobile baseline constructs both levels with the actual UI scale before creating the paddle/serve: `paddleY = round(max(minY,H-126/scale))`, drain=paddle+20u, shield=paddle+18u. `Arena.drawHUDBase` owns the compact top lives/AIM/18CSS Lilita score; each level draws a thin progress strip. Kit drawing, K power and orb input are restricted to `coreMode === 'ward'` (Vault). Invasion retains earned centre-return Titan. `aimReadySeen` persists the single caught-ball press hint; the bottom track, repeated coaching and power chips are removed. World debris/drop/bolt clipping keeps the lower input area clear.

Verified Carrier integration: 125u physical/visible base paddle at natural height about 17u, ordinary ball 7.5r and TITAN 10r. Vault retains 70×12u/default6r. Shared constructor options preserve the selected ordinary radius through serve/split/burst and TITAN expiry. Both-phone tip overlays match visible alpha within 0.006 CSS px; actual bundled gameplay and power checks pass. Carrier-only full-viewport background drawing replaces safe-inset row stretching; settled results suppress frozen Carrier effects. Human balance and native performance remain to verify.

The isolated `coding/mobile-preview` worktree has the unpublished native immersive follow-up and exact reviewed web candidate, with offline fonts and CI assertions for full window/CSS coverage, native safe insets, hidden/transient bars and recreation. The previously delivered APK is older. See that branch's `docs/MOBILE_PREVIEW.md`; native follow-up compilation/emulator verification is still pending and the newer Invasion rescue proposals are excluded.
- **Business model (placeholder):** watch an ad to continue, or a one-time "Unlock full game" purchase. The option to make the whole game free is kept open: `MODE = 'free'` in `src/monetize.js`.

## 2. Runtime architecture

```
index.html ── loads fonts (Lilita One, Rubik), #safe probe div (env(safe-area-inset-*)), <canvas id="game">
src/main.js ─ scenes: menu → level → results/continue
  │  resize(): W = 360 world units; FH = 640..880 from aspect; inT/inB = safe insets in world units; H = FH - inT - inB
  │  input: pointer events → world coords → level.pointerDown/Move/Up; keys (arrows, space, Esc, 1/2)
  │  loop: requestAnimationFrame, fixed step 1/120 s (tick), draw once per frame
  │  LEVELS registry [{ make(W,H), name, sub, color }]  ← add new levels here
  ├─ src/arena.js  class Arena (shared gameplay; each level extends it)
  │     paddle (raised, control deck below), balls, serve + Focus aim, power-ups, laser shots, shield,
  │     titan core, lives, combo/score, shake/hit-stop, HUD base, aim path preview, aim coach
  │     hooks a level overrides: hitCell(c,r,ball), updateLevel(dt,dtReal), shotHit(shot), draw(g),
  │       background(), drawTopInset(g,h), previewRect(), result(), continueRun(), skipIntro()
  ├─ src/invasion.js  class Invasion extends Arena  (Level 1)
  ├─ src/vault.js     class Vault extends Arena     (Level 2) + drawPrincessIcon() for the menu card
  ├─ src/physics.js   makeGrid, makeBall, stepBall (substepped circle vs grid/walls/paddle), floodEmpty
  ├─ src/kit.js       Kit reactions, 12-second presence, face-orb layout and deliberate-tap checks
  ├─ src/serpent.js   distinct-hit accounting, protected cage scope, useful venom targets, entry/recoil and ward deadlines
  ├─ src/debris.js    class Debris (planck.js): shatter (Voronoi rigid frags), drop (whole rigid brick),
  │                   crumble (non-physics fade for single bricks), statics, kinematic paddle, poke, killY
  ├─ src/gfx.js       SPR sprite registry + loadImg/artLoaded/ready, cached() offscreen canvases, brick() fallback,
  │                   drawBall, drawKit/drawKitFace, FX particles (shards, dust, rings, pops), text(), POWER table, capsule()
  ├─ src/audio.js     WebAudio synth sfx (no audio files)
  ├─ src/characters.js  code-drawn fallbacks (invader, mothership, serpent)
  ├─ src/prefs.js     store.get/set (localStorage with in-memory fallback)
  ├─ src/monetize.js  continue offers: MODE, PRICE, AD_CONTINUES, continueOffer(), watchAd(), buyFullGame()
  └─ src/vault-art.js GENERATED by tools/pack_art.py: export const ART = { sprites, plate, bars, princess, kit, snake, snakeJade, invPlate }
```

### Key conventions

- **Coordinates:** world units with y pointing down. The play area is 360 wide.
  - Everything in a level is drawn in world coordinates.
  - `main.js` translates the canvas by `inT`, so y = 0 is the top of the safe area.
- **Light and shadow:** light comes from the top-left, and shadows are offset (+3, +5) (`SHADOW` in gfx.js).
- **Balls:**
  - radius 6 (titan 10);
  - speed 345 × `opt.speed` × the rally ramp (up to 1.28);
  - the ball is lost at `drainY = paddle.y + 20`; the missed-ball shield plane is `paddle.y + 18`.
- **Paddle:**
  - y is `paddleY(H, minY, uiScale) = round(max(minY, H - 126 / uiScale))`;
  - base width 74 in both current levels;
  - no heavy lower deck/track; debris, drops and bolts are clipped/culled before `playClipY = H - 64 / uiScale`.
- **Grid cells:** a `Uint8Array` of kinds and a parallel `hp` array.
  - The Vault adds `bid` (cell → brick id) because its bricks span 2 cells.
  - The Vault declares `unpierceable = [GRANITE, BARS]`. FIRE/TITAN bounce from those kinds and pierce ordinary bricks. Other levels keep their original piercing behaviour. Solid-corner normals ignore neighbouring pierced cells.
  - Aim preview carries the caught ball's titan flag and current FIRE state and retains `unpierceable` when cloning the grid.
- **Fallbacks:** every rendered sprite has a code-drawn fallback, checked with `ready(spr)`.
- **Debris:** planck uses 16 world units = 1 m, gravity 34 m/s², and `MAX_PIECES` 140.

### Level 1: Invasion (`src/invasion.js`)

- **Grid:** 11 × 9 cells of 28 × 18 units, centred, starting at y = 92.
- **Cell kinds:** `CANDY` 1 hp, `ARMOR` 3 hp, `POWERB` 1 hp (drops a power-up), `BOT` 2 hp (a robot).
- **March:** step every `t` seconds, ±14 units horizontally, then down 14 at each edge. The interval shortens as cells die.
- **Robots:**
  - they fire with a 0.45 s angry windup, and the shooter is biased toward the paddle;
  - per-cell mood timers drive the face: `angry`, `laugh`, `shock`, `dizzy`, `hurt`, or the `march0/1` cycle;
  - a killed robot drops as a rigid body (`meta.robot`); catching it scores +120.
- **Boss:** 36 HP, an elliptical hitbox (44 × 18 plus the ball radius), bombs, and a mood pair `[name, t]`.
- **Visuals:**
  - background is the `invPlate` render, `drawHazard()` draws the hazard line, the HUD is the FORMATION or MOTHERSHIP bar;
  - sprites: `inv_bot_<white|pink|yellow|blue>_<expr>`, `inv_mothership_<smug|angry|hurt|panic|dizzy>`, `inv_mothership_lights_0/1`, `inv_bolt`, `inv_bomb`, `inv_brick_c_<row>_<dmg>`, `inv_brick_a_<dmg>`, `inv_brick_p_0`.

### Level 2: The Vault (`src/vault.js`)

- **Grid:** 20 × 20 cells of 16 units, origin (20, 96). The ASCII `LAYOUT` is in the file. Glazed bricks are 2 cells wide in running bond.
- **Brick kinds:** SUN, CORAL, VIOLET, TEAL, BLUE, GOLD (gem, drops a power-up), GRANITE (indestructible anchor), BARS (cage).
- **Selected mixed layout:** 219 brick objects, 245 normal-hit HP and 19 deliberate gem targets. Staggered granite requires aiming-side changes. The left SPLIT support and right FIRE support each release eight hanging bricks; collapsed gems do not automatically issue powers.
- **Serpent state:** `{cells, hist, chew, chewing, prog, stun, dir, look, faceLeft, path, open, hits, flinch, mood, moodT, alpha, fleeT}`.
  - It plans with Dijkstra (`snakePlan`), with cost equal to chew seconds (`CHEW`) and granite blocked.
  - `expression()` chooses the head face.
  - The body is drawn by `drawSnakeBody()`, a Catmull-Rom tapered ribbon with belly, diamonds and gloss bands.
  - The head uses `ART.snakeJade` (cell 176, unit 44, `expr` and `dir` maps), drawn at 1.45×. Entry permits the full down-facing angle before joining normal turning. The body uses matching jade/ivory/mint colours; the original purple family is preserved.
  - Twelve segments stream down through a dark top tunnel; tail segments stay hidden above the grid and are excluded from ball/laser/debris contacts. Normal movement begins immediately after entry, with growth up to 20 cells. The untouched initial route is 40 steps / cost 65.45998. Measured idle attack/loss are 55.0833/59.7667 seconds after active handover; cinematic time is additional.
  - Two separate incoming ball contact episodes queue fury; lingering overlap and simultaneous volley contacts cannot instantly fill both hits. Head hits retain their existing stun/knockback; body hits retain flinch/chew setback. Those reactions finish before a 1.4-second marked wind-up, organic spray and 1.2-second recovery. No opening attack occurs without hits.
  - Venom chooses one exposed useful granite partition within 68 units, protecting the cage roof/frame/bars. Failed defence can melt the real brick and trigger support collapse; guarded defence preserves that target for this volley. The spray has irregular pulsing streams, droplets and splashes. Fury waits while moving if no useful target is available. World mutation stops after a loss.
  - First eligible full-charge warning pauses world time for the contextual Ward lesson. Kit's presentation clock keeps animating. A valid charged cast acknowledges `wardCoachAck` and resumes the real volley, with no practice currency or free charge. Intro-skip touches/Space are consumed through release.
- **Collapse:** a flood fill from anchors (granite, bars, the edge columns, the top row). Unanchored bricks are converted into `debris.drop` rigid bodies.
- **Phases:** `intro` (camera zoom), then `rescue`, then `escape` (princess runs the breach path), then `frenzy` (12 balls for 7 s), then won. Losing goes to `caught`.
- **Princess:** `PRINCESS` sheet (cell 168, unit 56, feet 4, `anims {name: {row, n}}`), played at 14 fps by `play(anim, loop)` and `updatePrincess()`.
- **Background:** calm dark castle plate; torches and lantern effects were removed in the earlier polish pass.

### Prince Kit

- `art/kit.py` builds selected Knight 2 from `kk_Knight.glb`: continuous cheek/jaw skin, open silver helmet, cobalt costume, broad shield fitted behind the hand and a surface-fitted face rig.
- 100 frames across Idle, Focus, Grin, Shock, Worried, Cheer, Hurt and Laugh. 168 × 168 RGBA, 56-unit cell, roughly 42-unit character, feet margin 4, 14 fps. Shock/Hurt hold their final frame; the other clips loop.
- `tools/pack_art.py` validates clips against `assets/kit/meta.json` and packs `ART.kit`, including eight 288-pixel portraits in `faces` (columns match the animation row indices). `drawKit()` selects body frames; `drawKitFace()` selects portraits.
- Selected UI A is a 52 CSS pixel left face orb with circular charge. A full charge opens one 12-second expressive body window, fitted within the same corner footprint. A later cast can reopen a receded body; an active window does not continually refresh. Receding consumes no unused charge. Kit's presentation clock also runs during the paused first-use lesson.
- Vault reserves the existing 12-brick charge for Ward. During the marked warning, a deliberate orb tap starts a 0.18-second shield transfer and spends once; protection lasts for the volley, not the 12-second character display. Invasion retains centre-return Titan; its orb gives the corresponding hint. Hero levels, store and chapter progression are still plans.
- The native input layer owns paddle and Kit pointer IDs independently: crossing drags, out-and-back gestures and cancellation cannot cast, and a second-finger orb tap preserves the paddle drag. Orb and complete grip envelope have 8 CSS pixel separation on both requested phone sizes.
- Source proofs, eight portraits, a rendered turnaround and an animated preview are documented in `design/phase1/01-kit-character.md` and its manifest. Rejected creature production is archived outside active assets in ignored `out/rejected-cast-20261018/`.

## 3. Art pipeline (Blender, `art/`)

**Setup:**
- `python3 -m pip install bpy==5.2.2 pillow numpy`, which needs Python 3.13 and runs headless. The previous Python 3.11 instruction was incompatible with this pinned release.
- `art/princess.py` resolves its output directory to an absolute path before passing it to Blender, so relative command-line outputs stay inside the caller's working directory on Windows.
- Cycles on CPU. Set threads to 2 if running two jobs in parallel on 4 cores.
- Colour management: AgX, look "Medium High Contrast". Orthographic camera; key area light top-left.

### Commands

| Command | What it produces |
|---|---|
| `python3 art/render_vault_assets.py all` | Vault plate, bars and sprites (args `all\|plate\|bars\|sprites\|post`, plus `--fast`) |
| `python3 art/render_invasion_assets.py all` | Invasion plate, bricks, ship and bots (`all\|plate\|static\|ship\|bots\|sprites\|post`) |
| `python3 art/princess.py assets/princess Idle:16 Interact:12 Blocking:8 Cheer:16 Running_A:12 Jump_Full_Short:14 Scared:8` | Princess frames; add `--face` for 4× face close-ups and `--samples N` to set samples |
| `python3 art/kit.py assets/kit Idle:16 Focus:12 Grin:12 Shock:8 Worried:12 Cheer:16 Hurt:8 Laugh:16` | Selected Knight 2's 100 real animation frames; `--face`, `--yaw`, `--samples`, `--threads` support proof renders |
| `python3 art/snake.py assets/snake [expr ...] --dirs r,l --samples N --px N` | Serpent head expressions |
| `python3 art/snake.py assets/snake-jade --palette jade --dirs r,l --samples 64 --px 4 --threads 2` | Matching jade head family, preserving original purple assets |
| `python3 tools/pack_art.py` | Packs active rendered families into `src/vault-art.js` as WebP data URIs (quality about 86–90); current registry about 1.91 MB |
| `npm run build` | Builds `dist/breach.html` and `dist/breach-artifact.html` |

### Output conventions

- **Sprites:**
  - 3 px per world unit, with the margin given in each `atlas.json` entry (usually 4 units);
  - `drawSize = px / 3`;
  - bricks are drawn at `(x - margin, y - margin)` with size `(w + 2·margin, h + 2·margin)`.
- **Plates:** 2 px per unit, covering y from -40 to 780; draw them at (0, -40) with size 360 × 820.
- **Asset folders:**

  | Folder | Contents |
  |---|---|
  | `assets/vault/` | `atlas.json`, `plate`, `bars`, `brick_<y\|c\|v\|t\|b>_<1\|2>_<dmg>`, `brick_gold_1_0`, `brick_granite_*`, `ball`, `ball_fire`, `ball_titan` (new), `paddle_l/m/r`, `cap_<split\|fire\|wide\|focus\|burst\|laser\|shield\|slow\|shrink>`, `lantern`, `torch_flame` |
  | `assets/invasion/` | `atlas.json` plus the sprites listed above |
  | `assets/princess/` | `<Anim>_NN.png` frames (168 px cells after packing) |
  | `assets/kit/` | 100 `<Clip>_NN.png` frames, `meta.json`, portraits, expression/turnaround/contact sheets and animated preview |
  | `assets/snake/` | `head_<expr>_<r\|l>.png` and `meta.json` |
  | `assets/snake-jade/` | 26 jade head renders and matching palette metadata |
  | `assets/models/` | KayKit CC0 GLBs (Knight, Mage, Rogue); the princess is built from Rogue |

### Character rules

The owner has given feedback on several rounds of character drafts.

- **Serpent:**
  - an angular, faceted head, never round or "bally";
  - pink brows, so expressions read;
  - shader-painted iris with lids;
  - expressions: idle, blink, taste, hunt, chew0, chew1, hiss, ouch, dizzy, shock, grin; snarl and strike are being added.
- **Princess:**
  - a tiara with a rose gem, big expressive eyes with lids and brows, and a bell skirt;
  - every animation has a matching face.
- **Robots:** glossy toy robots in 4 colours with 7 expressions.
- **Mothership:** a saucer with an alien face and 5 expressions.

### Before committing renders

Strip PNG text metadata, because Blender embeds the source .blend path:

```
python3 -c "import glob;from PIL import Image;[Image.open(f).save(f) for f in glob.glob('assets/**/*.png',recursive=True)]"
```

Then run `pack_art.py` and the build again.

## 4. Build, test, publish

- **Build:** `npm install`, then `npm run build`. The bundler is esbuild (`tools/build.mjs`), output is a single minified IIFE, currently about 2.23 MB including Kit body/face atlases and the jade head family.
- **Unit tests:** `npm test` runs 21 tests across physics, Kit presentation/input rules and serpent contact/target/entry/ward rules.
- **Playtests:**
  - `node tools/playtest/kit.mjs out/kit-orb-final-qa`: both phone sizes, eight face/body reactions, touch/Focus/secondary-finger input, Invasion Titan/Vault charge reservation, presence expiry, loss/continue and win paths.
  - `node tools/playtest/venom.mjs out/venom-coach-final`: real orb input, full/empty/missed/late/cancel outcomes, hit accounting, hidden tail, protected cage, first-use pause/resume, terminal immutability and held intro-skip regressions.
  - `node tools/playtest/vault-v2.mjs out/vault-ward-final`: mixed-layout support/path/cache/power checks, complete seeded rallies with legal Ward casts, idle loss, streaming intro and result captures. A bot win proves reachability, not human difficulty balance.
  - `node tools/playtest/layout.mjs <out>` and `node tools/playtest/polish.mjs <out> ios|android`: existing layout/polish regression suites.
  - Playwright with Chromium: `node tools/playtest/vault.mjs <outDir> ios|android` and `node tools/playtest/l1.mjs <outDir>`.
  - Both need `<outDir>/shots/` to exist. They drive the game through `window.__breach` (a simple autopilot bot sets `level.ptr`).
  - Device sizes: iPhone 393 × 852 with `?safe=59,34`; Android 412 × 915 with `?safe=32,24`; device scale factor 2.
  - Always check for page errors, and screenshot the serve, play, power-ups, loss/continue and win screens for both devices.
- **Publish the playable build:** the host currently used is a claude.ai Artifact (see doc 03). Publish `dist/breach-artifact.html` (the body fragment).
  - On another host, use `dist/breach.html` as-is: any static hosting works, for example GitHub Pages.
- **Mobile wrapping (future):** Capacitor or a WebView wrapper around `dist/breach.html`. `viewport-fit=cover` and `env(safe-area-inset-*)` are already handled.
