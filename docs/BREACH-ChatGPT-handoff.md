# BREACH: complete handoff for ChatGPT (single file)

This one file contains everything another assistant needs to design for, or take over, BREACH. Rebuild it with `python3 tools/make_handoff.py`.

- **Game:** BREACH, a premium portrait brick breaker for iOS and Android. Tagline: "Break in. Break out."
- **Owner:** mykee (GitHub `mahikshith`).
- **Repository:** https://github.com/mahikshith/breaker. `main` is the stable branch; `codex/carrier-mobile-preview` is this working branch.
- **Assembled at:** repo commit `5b87063`.

## How to read this file

- **For design work:** read Part A first (what to make, and in which format) and Part B (how the owner steers you). Then read C for the story, and E and G for the rules.
- **For execution work:** read E, F and G in full before touching anything, plus `docs/BREACH-blender-scripts.md`.

| Part | Contents | Source file in the repo |
|---|---|---|
| A | Design brief for ChatGPT (start here) | `docs/handoff/04-chatgpt-design-brief.md` |
| B | Steering prompts: project instructions, task prompts, corrections, checklists | `docs/handoff/05-chatgpt-steering-prompts.md` |
| C | Story mode plan, research and roadmap | `docs/STORY_PLAN.md` |
| D | Original game plan | `docs/GAME_PLAN.md` |
| E | Status, owner rules, progress log, TODO, palette | `docs/handoff/01-status-and-next-steps.md` |
| F | Architecture, art pipeline, build and test | `docs/handoff/02-architecture-and-pipeline.md` |
| G | Environment, connections, skills, memory, UI/UX rules | `docs/handoff/03-environment-skills-ux.md` |
| H | Repository file map | `git ls-files` |

Companion file: `docs/BREACH-blender-scripts.md` has every Blender and art script in full.


---

# Part A: Design brief for ChatGPT (start here)

*Source: `docs/handoff/04-chatgpt-design-brief.md`*

## BREACH: design brief for ChatGPT (the design partner)

**Latest selection and tested candidate (2026-10-18):** Only A / Carrier Breakout is active; Nix/Tick appearances are selected, but their full expressive sprite/animation families and runtime cast integration are not built. B/Relay Raiders, C/Orbital Breakout and D/Eclipse Rescue are deferred. The playable Carrier web candidate is SHA256 `F4863DC5A87D6B46A8A1AFDB702C264F432196B851B61B828946DB8AB75A0423`. It passes 44 unit tests and both-phone bundled gameplay/visual checks. Independent final captures at 393×852 safe59/34 and 412×915 safe32/24 preserve the approved A art, continuous safe-edge starfield, aligned 125×17u paddle and clean settled results, with zero page errors. Public-input assisted deterministic simulated wins record 82.3s iPhone / 45.2s Android of game clock; these do not establish human balance or physical-device performance. Evidence: `out/carrier-playable-final/report.json` and `out/carrier-visual-final/REVIEW.md`. The owner has requested an APK; packaging/native CI and delivery remain pending. No APK pass is claimed. EA839F00… remains historical accepted baseline evidence; the older A/B Canvas tranche remains asset-only history.

**APK checkpoint authorization (2026-10-18):** The owner explicitly requests the APK. This authorizes the necessary checkpoint commit/push and CI on `codex/carrier-mobile-preview` in the existing isolated `breaker-mobile-preview` worktree, using the exact frozen Carrier/current Vault sources and native immersive fix. Primary `codex/phase1-kit` is preserved. No merge to `main` or pending Nix/Tick companion-family admission is authorized. APK/native CI remains pending; the earlier screenshot-approval notes do not block this specific APK checkpoint.

**Current production scope (2026-10-18):** Carrier A is a playable tested web candidate, using the reviewed hull/hangar, cannons, three fighters, cyan/rose panel crates, five shallow captive windows, flat paddle, ball and Laser/Split/Shield payloads. The 125×17u Carrier paddle and 7.5r ordinary / 10r TITAN ball are verified; Vault retains 70×12u/default6r and exclusive Kit use. The final safe-inset starfield and results-effect repairs pass independent phone review. APK packaging/native CI is in progress, not delivered. Nix/Tick full families and live roles remain pending. B/C/D and Brum/Vesper production are deferred; their concept/source-proof history is preserved.

**Historical A/B asset milestone (2026-10-18):** real independent PNG parts and the isolated Canvas motion assembly are complete for the approved A/B left playfields. Final proof is under `out/space-assets-ab/final/`: `A-ios-reference.png`, `A-android-reference.png`, `B-ios-reference.png`, `B-android-reference.png`, `A-motion.gif`, `B-motion.gif` and `asset-report.json`. Actual 393×852/412×915 images and sampled launch/release/boarding/iris sequences pass independent visual review; all four capture runs report zero page errors, real alpha/metadata checks and approximately 126 CSS paddle reserve. A has five shallow captive windows; B has four large worker pods. This asset-only milestone contains no companions, pilots or portraits and predates the latest Nix/Tick selection. These are asset-motion proofs with a placement ball, not new gameplay: runtime admission/WebP sizing, actual-alpha collision alignment, input/combat/rescue/power rules, full playable phone runs, memory/performance and new APK checks remain. The proof milestone retains EA839F00… as its gameplay baseline; it does not cover later Carrier integration. Reproduction and limits: `art/space/ASSETS_AB.md`; inventory/contracts: `design/phase1/space-assets-ab-spec.md` and `space-assets-ab.json`.

**Current working agreement (2026-10-18):** Phase 1 design/build and layout-design options for the existing Invasion and Vault levels proceed with parallel helpers and separate file ownership. For each design track, show 2–3 image options and wait for the owner's pick before building. Playtest implemented changes at both phone sizes and show screenshots; wait for the owner's OK before committing or pushing. This agreement supersedes the original role split and sequential-preparation instructions below.

**Who this is for:** ChatGPT (or any assistant) doing the *design* work on BREACH: story scripts, dialogue, character design, concept art, UI/UX mock-ups, level layouts and balance tables.

**Who builds it:** Claude, in the owner's Claude Project, does the *execution*: code, Blender renders, playtests, commits. You hand designs over; Claude turns them into the game.

**Why split it:** the owner (mykee) has a ChatGPT Pro subscription with plenty of capacity. Claude's capacity is better spent building. So you design in depth, and Claude builds exactly what you specify.

---

### 0. How to use this brief (for the owner)

1. Start a new ChatGPT project called "BREACH design".
2. Add two files to the project's files:
   - **`docs/BREACH-ChatGPT-handoff.md`** holds everything:
     - this brief;
     - the steering prompts;
     - the story plan and research, and the original game plan;
     - all three handoff docs: status, rules and history; architecture and pipeline; environment, skills and UX;
     - a map of the repo's files.
   - **`docs/BREACH-blender-scripts.md`** holds every Blender and art script, with an index. Use it as the reference for how the art is built.

   Optionally, add the reference images from the repo (https://github.com/mahikshith/breaker): `docs/reference/`, `docs/screens/` and `docs/drafts/`. You can also connect GitHub in ChatGPT (Settings → Connectors → GitHub) so it can read the code.

   Then paste the project instructions from Part B, section 1 into the project's Instructions field.
3. Paste the "first message" in section 1.
4. Work through the tasks in section 6 one at a time. Review each in ChatGPT until you like it.
5. Bring the finished deliverables back to the Claude Project thread. Upload the files there, or paste the text, and say "build this". Claude will build them and show you screenshots.

> Keep design and build in separate tools. Don't ask ChatGPT to edit the game code while Claude is also working on it, or the two will overwrite each other.

---

### 1. First message to paste into ChatGPT

```
You are the lead game designer and art director for BREACH, a premium portrait brick breaker for
iOS and Android. The project file BREACH-ChatGPT-handoff.md holds everything: your design brief
(Part A), the steering prompts and checklists (Part B), the story plan and research (Part C), the
original game plan (Part D) and the full build handoff (Parts E-G). BREACH-blender-scripts.md shows
how all existing art is built in Blender. Read all of it before answering.

Your job is DESIGN ONLY: story scripts, dialogue, character design sheets, concept art, UI/UX
screen specs, level layouts and balance tables. Another engineer (Claude) builds everything in
code and Blender, so every deliverable must follow the exact formats in Part A section 7,
with exact colours (hex), sizes (in game units, 360 wide), timings (seconds) and file names.

Follow the art and UX rules in Part A sections 3-5 strictly. Never contradict the owner's rules in
Part A section 2. When something isn't specified, propose 2-3 options with a recommendation and ask me.
Start with Task 1 in Part A section 6.
```

---

### 2. The owner's rules (non-negotiable)

These come from many rounds of feedback. Breaking any of them means the work gets redone.

#### Feel

- **Premium, inventive, urgent, addictive.** Nothing may look "vibe-coded", meaning generic, template-like or default-looking.
- **Expressions must say a lot.** Every character needs big, readable emotions: eyes with lids and brows, and a mouth that changes. No uniform or blank faces.
- **Focus on gameplay.** The background must never outshine the foreground. The owner had us remove dungeon lights, lanterns, torches, bright planets, window bars and hazard stripes because they distracted from play. Backgrounds stay calm, dark and desaturated.
- **Not too much yellow.** Gold and yellow are accents only. The owner rejected a yellow cage chamber and gold cage bars; the cage is now dark iron.

#### Look

- **Keep the playful font and colours.** Lilita One for game text, Rubik for numbers.
- **Glossy, shiny, rendered.** Bricks look like glazed ceramic tiles with real reflections. Characters look like glossy vinyl toys.
- **Rejected styles:** pixel art, wisps or ghost blobs, jittery fox characters, ball-chain snake bodies, round "bally" blob heads, and flat vector clip-art.

#### Play

- **Readable at a glance on a phone.** Short words, big shapes, 44 pt touch targets.
- **Mobile edge to edge.** The scene fills behind the notch and home bar, but UI never sits inside them. It must not overlap the Android status bar.

#### Process

- **Show drafts.** Every finished piece (screen, character, asset) is shown to the owner as an image before it is final.

#### Repository rules (only if you ever touch the repo)

- Commits must be authored as `mahikshith <mahikshith97@gmail.com>`.
- No AI attribution anywhere: no "Co-Authored-By", no "Generated with…", no assistant names in files.
- Never ask for, paste or store the owner's tokens.

---

### 3. The game today (what exists)

BREACH plays in portrait. The world is 360 units wide and 640–880 tall depending on the phone. There are two finished levels:

#### Level 1, Invasion

Arkanoid crossed with Space Invaders.

- **Formation:** 11 × 9 bricks with glossy toy robots ("Clanks") in 4 colours (white, pink, yellow, blue), each with 7 expressions. The formation marches sideways and down, and the robots shoot back.
- **Boss:** the mothership (Zorvax) is a saucer with an alien face and 5 expressions: smug, angry, hurt, panic, dizzy. It has 36 HP.
- **Lose condition:** if the formation reaches the line, it lands. Robots laugh, a beam fires, and the continue screen appears.
- **Background:** a dark, calm hangar with a dim planet.

#### Level 2, The Vault

A rescue race.

- **Setting:** a side-view cutaway tower of glazed bricks. Princess Lumi is caged in a dark stone cell with iron bars.
- **Serpent (Gnash):** chews through bricks toward her, growing longer, wider and faster as it eats.
- **Danger:** a colour meter goes green → amber → red, and the camera zooms toward the cage as danger rises.
- **Lose:** the serpent rears and strikes the cage: "GOT HER!"
- **Win:** the princess runs the breach path, then FRENZY gives 12 balls for 7 s.

#### Shared systems

- **Paddle:** a chrome paddle raised above the thumb, with a dark control deck below it to drag on.
- **Catch & aim (Focus):** hold still as the ball lands to catch it; time slows, slide to aim, lift to fire.
- **Titan core:** a gem in the paddle fills as you break bricks. A dead-centre hit then makes a giant piercing ball.
- **Power-ups:** SPLIT ×3, BURST +3, FIRE, WIDE, AIM, LASER (paddle bullets), SHIELD, SLOW, and TINY (bad).
- **Continue screen:** watch an ad to continue, or unlock the full game for $2.99.

**Reference images:** `docs/reference/` (vault-top-down.png is the "shiny" target), `docs/screens/` and `docs/drafts/`. The playable build is shared by the owner.

---

### 4. Art bible (match this exactly)

#### Rendering

- Everything final is rendered in **Blender 5.2 (Cycles)** by Claude. Your concept art is reference, not the final asset.
- **Lighting:**
  - a warm key area light from the **top-left** (colour about `#FFDBB8`);
  - a cool blue fill from the right (`#8CA6FF`);
  - a soft warm-pink bounce from below (`#FF80A6`);
  - a big softbox behind the camera gives the glossy reflections on bricks.
- **Colour management:** AgX, look "Medium High Contrast". Colours are saturated but never neon.
- **Shadows:** drop shadows fall down-right (+3, +5 units).
- **Materials:**
  - bricks are glazed ceramic: a coloured body under a thick, clear, glossy coat with a crisp highlight band on the top edge and slightly rounded corners;
  - characters are vinyl toys, satin with a light clear coat;
  - metal is chrome for the paddle and ball, and dark blued gunmetal for cage bars.
- **Camera:** orthographic. Levels are side-on (the Vault) or front-on (Invasion).

#### Character proportions

- Characters use the **KayKit Adventurers** chibi rig (CC0, `assets/models/kk_Knight.glb`, `kk_Rogue.glb`, `kk_Mage.glb`).
  - The head is about 40% of total height, with stubby limbs.
  - A character is about 42 game units tall on screen.
- **Princess Lumi** (built from Rogue):
  - rose dress with a flared bell skirt and lace petticoat, honey-blonde hair, ivory gloves, white tights, rose shoes, gold trims;
  - a gold filigree tiara with a faceted rose gem and pearl tips;
  - big glossy eyes with iris, pupil and two catch-lights, skin eyelids with a lash line, brow strokes, a reshaping mouth and cheek blush.
- **Faces** are the most important part. Every new character gets the same face rig quality as Lumi.
- **Gnash the serpent:**
  - an angular, faceted head (never round);
  - pink brows, shader-painted iris with lids;
  - a purple body `#7A3CCC` with a peach belly `#FFC49A`, rose diamonds `#FF6FAE` and a dark outline `#1E0A40`.
- **Animations available on every KayKit character:**
  - **Idle and moving:** Idle, Unarmed_Idle, Walking_A/B/C, Running_A/B, Jump_Full_Short/Long, Dodge_*.
  - **Emotes:** Cheer, Interact, PickUp, Use_Item, Throw.
  - **Combat:** Block, Blocking, Block_Hit, Hit_A/B, Death_A/B, 1H/2H melee and ranged attacks, Spellcast_*.
  - **Rest:** Sit_*, Lie_*.

  Design character moments around these names so Claude can render them directly.

#### Palette (hex)

| Use | Colours |
|---|---|
| Backgrounds | deep navy/indigo gradient `#22284A` → `#141831` → `#0A0C18`, vignette, light film grain |
| Vault bricks | sun `#FFC73D`, coral `#FF6F61`, violet `#8F5CF0`, teal `#22C4B0`, blue `#4F9DFF`, gold gem `#F4C542`, granite `#4A4F6E` |
| Invasion rows | `#FF5D8F` `#FF8A3D` `#FFD23F` `#5CCF6A` `#2EC4B6` `#3FA8F5` `#7B6CF6` `#C46BF0`; armour `#8D97B3` |
| Level accents | Invasion pink `#FF5D8F`, Vault gold `#F4C542` |
| UI states | AIM lilac `#E3B6FF` / `#C46BF0`, danger `#FF4D5E`, success `#7BD88F`, combo text `#FFD36B` |
| Power-ups | SPLIT `#5CCF6A`, FIRE `#FF8A3D`, WIDE `#3FA8F5`, AIM `#C46BF0`, BURST `#F7C948`, LASER `#FF4D6D`, SHIELD `#2EC4B6`, SLOW `#7FD6FF`, TINY `#5A5F78` |

New colours must sit inside this family. Give every new colour as a hex value and name where it is used.

#### Image prompts (for ChatGPT image generation)

Start every concept-art prompt with this style block so the images stay consistent:

```
Glossy 3D vinyl-toy render, Blender Cycles look, chibi proportions (head ~40% of height), soft warm key
light from the top-left, cool blue rim light from the right, gentle pink bounce from below, clean
reflections, saturated but not neon colours, minimal yellow, plain dark navy background (#141831),
orthographic front view, no text, no watermark.
```

Then describe the subject. For character sheets, ask for "turnaround: front, three-quarter, side, back, same character, same lighting, evenly spaced on one image".

---

### 5. UI/UX bible

#### Screen layout (portrait, 360 units wide)

From top to bottom:

1. **Notch / Dynamic Island:** scene art only, no UI.
2. **Slim HUD bar:** pause (top-left), level meter, score (top-right).
3. **Playfield:** starts right under the HUD bar; no dead band.
4. **Paddle:** at `H − clamp(0.25·H, 150, 210)`, kept above the thumb.
5. **Shield line and drain line.**
6. **Control deck:** a dark panel to drag on, with a track and grip showing the paddle position, then lives, power timers and AIM pips.
7. **Home indicator:** scene art only.

Test sizes: iPhone 393 × 852 pt (safe insets 59 top, 34 bottom) and Android 412 × 915 dp (32 top, 24 bottom).

#### Text

- Lilita One for all game text, with a dark outline of 0.16 × the font size and a soft drop shadow.
- Rubik 600 for the score and other numbers.
- At most 2–6 words per pop. Big moments get big text: BREACH!, TITAN!, FRENZY!, GOT HER!

#### Feedback ("juice")

- Every hit gets a sound, a small shake and particles.
- Big moments add hit-stop, haptics, slow motion and big text.
- Single broken bricks crack and fade in about 0.4 s. Only big crashes leave physics debris.

#### Controls

- Relative drag anywhere (gain 1.15). The finger never covers the ball.
- To serve, slide to aim and lift to launch. A dotted path previews the first bounces.

#### Accessibility

- 44 pt minimum touch targets.
- Never rely on colour alone. The serpent meter uses colour plus the princess icon's expression.
- Text contrast at least 4.5:1.

#### Menus

- **Title:** a BREACH logo in Lilita One with a gradient and thick outline, over floating glossy bricks.
- **Level cards:** a live preview, a character peeking out, stars and a number badge.
- **Results card:** stars pop in with sound, plus Retry/Next.

When you spec a screen, give every element its position and size in world units (x, y, w, h on the 360-wide grid). Also give its font, size, colour hex, its states (normal, pressed, disabled, locked) and its animation (what moves, how far, for how long, and the easing).

---

### 6. Design tasks, in order (Phase 1 of STORY_PLAN.md)

The owner approved Phase 1 with the names Kit, Lumi, Zorvax, Gnash and Brickhaven and the current ads plus $2.99 model. Kit's original courtyard-kid appearance was rejected; the current direction is an underdog knight with a medieval shield. Parallel character and existing-level preparation is approved under the working agreement above; each design and completed implementation still needs the owner's OK.

**Current gate:** A / Carrier Breakout and its Nix/Tick appearances are selected; B/C/D are deferred. The A/B independent PNG/native motion assembly tranche is complete as asset-only history. Build and compare actual Carrier gameplay at both phone sizes against the A board and asset preview, preserving source-quality silhouette, mounts, panel identity, flat low paddle, background and power glyphs. Validate runtime texture sizing, actual-alpha collision/state geometry, ball/paddle physics, rescue/combat/powers and performance before claiming a new playable result. Full expressive Nix/Tick sprite families and runtime cast integration are not built. EA839F00… remains the last accepted/tested baseline until the new candidate passes. Final screenshot OK still precedes commit/push; doc 01 records the live result and remaining work.

#### Task 1: Prince Kit character design

Deliverables:

1. A **design sheet** with:
   - silhouette notes and personality in 3 words;
   - outfit parts with a hex colour for each;
   - hair;
   - his signature prop, a broad medieval shield with a clear heraldic outline, thickness and a rear grip; no bat-like handle.
2. A **turnaround** concept image (front, ¾, side, back) using the style block.
3. An **expression sheet** of 8 faces, each mapped to a game moment:
   - determined (serve);
   - focused (catch & aim);
   - grin (combo);
   - shock (life lost);
   - worried (danger high);
   - cheer (win);
   - hurt (hit);
   - laugh (titan).
4. **Build notes:** how to make Kit from `kk_Knight.glb`.
   - Which armour pieces and shield to keep, how the selected hair or open helmet is constructed, and which small costume details to simplify at native size.
   - The face rig must match Lumi's.
   - Which KayKit animation to use for each moment.
5. Kit must read clearly as different from Lumi at 42 units tall: a different silhouette and a different dominant colour. Keep yellow minimal.

#### Task 2: Prologue script (skippable, about 60 s)

- 5–6 comic panels. For each panel give:
  - shot and camera;
  - characters, pose (a KayKit animation name) and expression;
  - background and lighting;
  - a caption of 12 words or fewer, and speech bubbles of 10 words or fewer;
  - a sound cue and a duration in seconds;
  - a transition into the next panel.
- The story: Kit and Lumi play the bounce game in the palace courtyard at sunset. The court scoffs. The sky goes dark, the Clank toys turn on them, and the mothership's beam takes Lumi. Kit grabs his old paddle.
- End on the first serve of Invasion: the tutorial starts inside the story.

#### Task 3: Story beats around the two levels

Short in-game beats of 3–6 s each, with no long cutscenes. Each needs who speaks, the line (10 words or fewer), the expression, the camera move and the timing:

- Invasion intro;
- Invasion mid-boss taunt from Zorvax;
- Invasion win (the decoy reveal and the tractor beam taking Lumi, a cliffhanger);
- Invasion lose (Clanks laugh);
- Vault intro (Gnash wakes; Lumi signals Kit);
- Vault danger lines from Lumi at 40% and 70% danger;
- Vault win (Lumi: "My turn.");
- Vault lose (Gnash: "GOT HER!", already in the game);
- a "to be continued" card teasing Chapter 3.

Give 2 alternative lines for each, so the owner can pick.

#### Task 4: Shine and the results screen

- Spec the new results card: score count-up, stars, Shine earned (1 per 100 points plus a star bonus), and a "chest reveal" moment for the Shine total, slot-machine style but short (1.5 s or less, tap to skip).
- Spec the "next unlock" progress bar that teases the next weapon or skin.
- Include layout, every animation timing, sound cues and both phone sizes.

#### Task 5: Chapter select screen

- A vertical map from the Prologue to Chapter 2, with Chapter 3 shown locked as a silhouette.
- Each node shows stars, a best score and a lock state.
- Brickhaven's dark skyline sits at the bottom, ready to light up later (Phase 3).
- Spec it the same way as Task 4.

#### Task 6: Zorvax and Gnash voice sheets

- Personality, speech style, and 10 short lines each (taunts, hurt, panic).
- Zorvax is smug and theatrical, secretly lonely (the final-chapter twist), so hint at it once.
- Gnash is hungry and gleeful; it hisses and talks in short words.

---

### 7. Deliverable formats (what Claude needs back)

Return each task as **one Markdown file** plus images:

- **File names:** `design/phase1/<task-number>-<slug>.md`, for example `design/phase1/01-kit-character.md`. Images go in `design/phase1/img/<task-number>-<slug>-<n>.png`, at 1024 px or larger, on a plain background.
- **Colours:** hex, always.
- **Positions and sizes:** in world units on the 360-wide grid, with y measured down from the top of the safe area.
- **Times:** in seconds.
- **Animations:** property, from → to, duration, easing (for example "scale 0.6 → 1.0, 0.25 s, easeOutBack").
- **Scripts and dialogue:** also as a JSON block Claude can paste into code:

  ```json
  { "beat": "invasion_win", "speaker": "zorvax", "expr": "smug", "line": "A decoy, little prince!", "alt": ["...","..."], "t": 3.5, "camera": "zoom 1.0→1.2 on boss, 0.4 s" }
  ```

- **Character build notes:** KayKit part names, animation names, and hex colours for each material.
- **Open questions:** end every file with a short list Claude should ask the owner about.

The owner uploads these files into the Claude Project thread, and Claude builds from them.

---

### 8. Tools, connections and where things live

| What | Where / how |
|---|---|
| Code repo | https://github.com/mahikshith/breaker (`main` is stable). Plain JS on Canvas 2D, bundled by esbuild into one HTML file. |
| Story and roadmap | `docs/STORY_PLAN.md`; the live editable copy is a Claude Doc in the owner's Claude account |
| Handoff docs | `docs/handoff/01`–`05` (this file is 04; 05 is the steering prompts). Single upload files: `docs/BREACH-ChatGPT-handoff.md` and `docs/BREACH-blender-scripts.md`, rebuilt with `python3 tools/make_handoff.py`. |
| Art scripts | `art/*.py`, Blender `bpy` 5.2.2 run headless with Python 3.13. `art/princess.py` (character + face rig), `art/snake.py` (serpent heads), `art/render_vault_assets.py`, `art/render_invasion_assets.py` (plates, bricks, sprites). |
| Packed art | `tools/pack_art.py` → `src/vault-art.js` (WebP data URIs) |
| Playtests | Playwright + Chromium scripts in `tools/playtest/`, at iOS and Android sizes |
| 3D models | KayKit Adventurers (CC0) in `assets/models/` |
| Fonts | Google Fonts: Lilita One, Rubik (OFL) |
| Playable build | A claude.ai Artifact in the owner's account. Any static host also works for `dist/breach.html`, for example GitHub Pages. |
| Claude memory | The Claude Project keeps a short project memory (rules, art direction, locations). Its content is mirrored in handoff docs 01 and 03, so nothing lives only there. |
| Shared files | The Claude Project's file area `/mnt/project-files/breaker/` (characters/, lookdev/, playtest/, plan/, handoff/). These are copies; the repo is the source of truth. |
| Game-dev skill guides | In the Claude Project at `/mnt/project-files/skills/gamedev/`: game-feel, game-ui-ux, level-design, create-game-assets, audio-design and others. They are plain Markdown; ask the owner for them if you want the checklists. |

---

### 9. Can ChatGPT drive Blender or the build directly?

Mostly no, and that is fine for design. The options, as of October 2026 (as far as we know):

- **ChatGPT chat (web or app):**
  - It can't run Blender or the game build.
  - Its image generation is great for concept art. Its code tool is a sandbox without Blender.
  - **Use it for design.**
- **Codex CLI** (OpenAI's coding agent, included with ChatGPT Plus and Pro):
  - It runs on the owner's computer, reads and edits the repo, and runs commands.
  - It could run the same headless Blender scripts (`python3 art/princess.py …`) and the build (`npm run build`).
  - It also supports MCP tool servers.
  - This is the route if you ever want ChatGPT to do execution work. If you do, follow sections 2 and 10 exactly, and don't run it on the repo at the same time as Claude.
- **Blender MCP** ([ahujasid/blender-mcp](https://playbooks.com/mcp/ahujasid-blender)):
  - A Blender add-on that lets an AI app control a *live* Blender window on the owner's computer: create objects, set materials, run Python.
  - It works with Claude Desktop, Claude Code, Cursor and VS Code, and with Codex through its MCP config.
  - It's useful for watching the scene being built.
- **ChatGPT "developer mode" connectors** ([setup guide](https://auth0.com/blog/add-remote-mcp-server-chatgpt/)):
  - They let ChatGPT call remote MCP servers by URL (Plus and Pro, beta).
  - A Blender on the owner's computer would need to be exposed through a tunnel first. That's not worth the setup for design work.

**Recommendation (owner's goal: save Claude usage):**

- The ChatGPT project designs.
- Codex builds, guided by `AGENTS.md` in the repo and Part B, section 8.
- Claude is used only for reviews or hard problems.

Keep one builder on the repo at a time.

---

### 10. If another tool must take over the execution (Codex or another agent)

Read handoff docs 01–03 first; they hold the details. Then:

1. **Set up:**
   - `git clone https://github.com/mahikshith/breaker`;
   - Node 22, then `npm install`;
   - Python 3.13, then `pip install bpy==5.2.2 pillow numpy`;
   - Playwright with Chromium.
2. **Set the repo identity before any commit:**
   ```
   git config user.name mahikshith
   git config user.email mahikshith97@gmail.com
   ```
   Never add AI trailers.
3. **Build:** `npm run build` writes `dist/breach.html`. Run the unit tests with `npm test`.
4. **Render art:** use the commands in doc 02, section 3. Run `python3 tools/pack_art.py`, then build again.
5. **Strip the render path** from PNGs before committing, because Blender embeds it:
   ```
   python3 -c "import glob;from PIL import Image;[Image.open(f).save(f) for f in glob.glob('assets/**/*.png',recursive=True)]"
   ```
6. **Playtest:**
   ```
   node tools/playtest/polish.mjs <out> ios|android
   node tools/playtest/layout.mjs <out>
   ```
   Check that there are no page errors, and share screenshots with the owner.
7. **Update** handoff docs 01–04 at every milestone and push.

---

### 11. How BREACH was made (the process to keep following)

1. **Plan:** `docs/GAME_PLAN.md` set the pillars (premium, urgent, addictive), the two levels and the references (BALL x PIT, Arkanoid, Space Invaders).
2. **Prototype:** plain JS and Canvas with a fixed 1/120 s physics step, custom ball physics, and planck.js for debris. The goal was something fast to change and one file to ship.
3. **Look development in Blender:** a top-down "Vault" lookdev set the shiny glazed-brick target. Everything after it matches that render.
4. **Characters, iterated with the owner:**
   - the princess built from the KayKit Rogue with a custom face rig;
   - the serpent's head redone until angular and expressive;
   - the robots and mothership given full expression sets.
5. **Playtests at phone sizes:** each round was screenshotted for iOS and Android and shown to the owner.
6. **Polish rounds** from the owner's feedback:
   - calmer backgrounds;
   - a raised paddle with a control deck;
   - catch & aim;
   - a titan core;
   - a serpent that grows and speeds up;
   - zoom on danger;
   - a full-screen, edge-to-edge layout;
   - a continue screen.
7. **Story plan:** research into addictive games produced `STORY_PLAN.md`. Now Phase 1 starts, with design by you (ChatGPT) and build by Claude.


---

# Part B: Steering prompts: project instructions, task prompts, corrections, checklists

*Source: `docs/handoff/05-chatgpt-steering-prompts.md`*

## BREACH: how to steer ChatGPT (prompts for the owner)

These are copy-paste prompts for running the design work in a ChatGPT project and keeping it on track. They cover the setup, the project instructions, one prompt per task, prompts to correct drift, image steering, and the package to bring back to Claude.

---

### 1. Set up the ChatGPT project (once)

1. In ChatGPT, create a **Project** called `BREACH design`.
2. Add these **files** to the project. They are all in the repo https://github.com/mahikshith/breaker:
   - `docs/BREACH-ChatGPT-handoff.md`: everything (rules, art bible, story, research, history, build docs);
   - `docs/BREACH-blender-scripts.md`: every Blender and art script, with an index explaining each one;
   - the images in `docs/reference/`, `docs/screens/` and `docs/drafts/` (optional, but helps a lot).
3. Optionally, connect **GitHub** (Settings → Connectors → GitHub) so ChatGPT can read the live repo.
4. Paste the block below into the project's **Instructions** field. Those instructions apply to every chat in the project.

#### Project instructions (paste into the project's Instructions field)

```
ROLE
You are the lead game designer and art director for BREACH, a premium portrait brick breaker for
iOS and Android (repo: github.com/mahikshith/breaker). The owner is mykee. You do DESIGN ONLY.
An engineer (Claude) builds everything you design, in JavaScript/Canvas and in Blender 5.2 (Cycles),
using the existing scripts in BREACH-blender-scripts.md. You never write or change game code.

SOURCES OF TRUTH (read before every task, in this order)
1. BREACH-ChatGPT-handoff.md, Part A (design brief) and Part B (these steering prompts).
2. Part C (story plan, research), Part E (owner rules, palette, progress log), Part F (architecture
   and art pipeline), Part G (environment and UI/UX rules).
3. BREACH-blender-scripts.md: how the existing art is actually built. Every character or asset you
   design must be buildable the same way: KayKit chibi rig, the princess face-rig approach, the shared
   material and light rig of render_vault_assets.py.
If anything conflicts, the owner's rules (Part A section 2, Part E section 1) win.

NON-NEGOTIABLE ART AND UX RULES
- Premium, inventive, urgent, addictive. Nothing generic or "vibe-coded".
- Glossy rendered look: glazed-ceramic bricks, vinyl-toy characters, chrome paddle and ball, warm key
  light from the top-left, cool fill from the right, pink bounce from below, AgX Medium High Contrast.
- Expressions must say a lot: big eyes with lids, brows and a reshaping mouth on every character.
- Backgrounds stay calm, dark and desaturated, and never outshine the gameplay.
- Not too much yellow: gold and yellow are accents only. Cage bars are dark iron, not gold.
- Fonts: Lilita One for game text (dark outline 0.16 x size plus a drop shadow), Rubik for numbers.
- Only palette colours from Part A section 4 (hex), or new ones in the same family, stated as hex.
- Rejected forever: pixel art, wisps, jittery foxes, ball-chain snake bodies, round blob heads,
  flat clip-art, uniform faces.
- Mobile: 360 game units wide; iPhone 393x852 and Android 412x915; nothing inside the notch, status
  bar or home-indicator areas; 44 pt touch targets; paddle above the thumb.

HOW TO WORK
- One task at a time, in the order of Part A section 6. Don't start the next task until I say "locked".
- For every open choice, give 2-3 options in one short line each, with your recommendation marked.
- Make concept images with the style block in Part A section 4, then iterate with me.
- Every final deliverable follows Part A section 7 exactly: one Markdown file per task, hex colours,
  sizes in game units, times in seconds, animations as property from -> to, duration, easing, and
  dialogue as JSON. End each file with "Open questions for Claude".
- Before calling anything final, run the self-review checklist in Part B section 6 and fix what fails.
- Keep a running "Design lock" list (names, colours, proportions, decisions I approved). Repeat it at the
  top of each final file, and never change a locked item unless I ask.

NEVER
- Never invent features beyond the task. Put ideas under "Ideas for later" instead.
- Never change game rules or the story canon (Part C) without asking me first.
- Never write code for the game, and never ask for or handle tokens or passwords.
- Never add AI attribution text to anything meant for the repo.
```

---

### 2. Start the first chat

Paste the "First message" from Part A, section 1. Then paste the Task 1 prompt below.

---

### 3. Task prompts (one chat per task works best)

#### Task 1: Prince Kit

```
Task 1: design Prince Kit (Part A section 6, Task 1).
Context: Kit is Lumi's childhood best friend, the courtyard bounce-game champion, an underdog the court
laughs at. His old courtyard paddle (battered wood + chrome, stitched grip) becomes the game paddle.
He is built from KayKit kk_Knight.glb with the same face rig as Princess Lumi (see princess.py in
BREACH-blender-scripts.md: glossy eyeballs, iris/pupil/two catch-lights, skin lids with lash line,
brow strokes, mouth decal, blush).
Steps:
1. Give 3 different directions for Kit (silhouette, outfit, dominant colour, personality in 3 words),
   each one paragraph, plus one concept image each. Recommend one.
2. After I pick, make the turnaround (front, 3/4, side, back) and the 8-expression sheet mapped to:
   determined (serve), focused (catch & aim), grin (combo), shock (life lost), worried (danger high),
   cheer (win), hurt (hit), laugh (titan).
3. Write build notes for Claude: which Knight parts to remove, keep or add, a hex colour for every
   material, the face-rig settings per expression (lids, brows, mouth shape, gaze), and which KayKit
   animation to use per game moment.
Rules: he must read differently from Lumi at 42 units tall; minimal yellow; chibi proportions with the
head about 40% of height.
```

#### Task 2: Prologue

```
Task 2: write the prologue (Part A section 6, Task 2), skippable, about 60 seconds, 5-6 panels.
For each panel: shot/camera, characters, KayKit animation name, expression, background, lighting,
caption (12 words or fewer), speech bubbles (10 words or fewer), sound cue, duration in seconds, and the
transition. Beats: sunset courtyard game, the court scoffs, the sky darkens, the Clank toys turn, the
beam takes Lumi, Kit grabs his paddle, then straight into Invasion's first serve (the tutorial lives
inside the story).
Give two versions: "heartfelt" and "funny". Recommend one. Make one rough storyboard image per panel
for the version I pick. Deliver the panels as JSON too.
```

#### Task 3: Story beats in the levels

```
Task 3: the in-level story beats (Part A section 6, Task 3). Each beat is 3-6 seconds: speaker,
expression name from that character's existing set (see Part F: robots, mothership, serpent,
princess), the line (10 words or fewer), 2 alternative lines, camera move, timing, and the sound.
Beats: Invasion intro, Zorvax mid-boss taunt, Invasion win (decoy reveal, beam takes Lumi), Invasion
lose, Vault intro (Gnash wakes, Lumi signals Kit), Lumi at 40% and 70% danger, Vault win ("My turn."),
Vault lose ("GOT HER!" already exists), and the "to be continued" Chapter 3 tease.
They must never block play for more than 2 seconds. Say which beats pause play and which play over it.
Output as a JSON array plus a readable table.
```

#### Task 4: Results screen and Shine

```
Task 4: spec the new results screen (Part A section 6, Task 4) for iPhone 393x852 and Android 412x915,
in game units on the 360-wide grid. Include: score count-up, star pop-ins, Shine earned (1 per 100
points plus a star bonus), a short slot-machine Shine reveal (1.5 s or less, tap to skip), and a "next
unlock" progress bar. For every element give x, y, w, h, font, size, hex colour, states, and animation
(property from -> to, duration, easing, delay), plus the sound cues.
Make a mock-up image of the final screen in the game's style, plus a second image mid-animation.
```

#### Task 5: Chapter select

```
Task 5: spec the chapter-select map (Part A section 6, Task 5): a vertical path from the Prologue to
Chapter 2, with Chapter 3 locked as a silhouette. Each node shows stars, best score and lock state.
Brickhaven's dark skyline sits at the bottom (it will light up in Phase 3). Same precision as Task 4.
Show it scrolling, a node being tapped, and the locked-node tap feedback. Mock-up images included.
```

#### Task 6: Voice sheets

```
Task 6: voice sheets for Zorvax and Gnash (Part A section 6, Task 6). Personality, speech style, and 10
short lines each (taunts, hurt, panic), each with an expression name from the existing sprite set.
Zorvax is smug and theatrical, secretly lonely; hint at the twist exactly once. Gnash is hungry and
gleeful, short words, hissing. Also give 6 lines for Lumi (scared but brave) and 6 for Kit (underdog,
determined, a bit funny). Output as JSON.
```

---

### 4. Steering prompts (when the output drifts)

| When this happens | Paste this |
|---|---|
| It looks generic or templated | `This reads as generic. Push it 3 steps more distinctive: give the silhouette, colour and expression one memorable idea each, then redo it. Check it against the owner's "not vibe-coded" rule.` |
| Too much yellow or gold | `Too much yellow. Cut yellow and gold to accents under 10% of the frame and rebalance with the palette in Part A section 4. List the hex values you changed.` |
| The background is too busy | `The background competes with the gameplay. Darken and desaturate it (owner rule: calm, dark, never outshines the foreground) and remove decorative lights.` |
| Expressions are weak | `The expressions don't say enough. Exaggerate them toy-style: bigger lid and brow changes, mouth shapes that read at 42 units tall. Show each beside the neutral face.` |
| It invents extra features | `Stay inside this task. Move extras to "Ideas for later" and give me only what Task N asks for.` |
| Specs are vague | `Too vague for the engineer. Give every element x, y, w, h in game units, hex colours, font sizes, and animations as property from -> to, duration, easing.` |
| It contradicts the story or rules | `Check this against Part C (story canon) and Part E section 1 (owner rules). List every conflict, then fix them.` |
| Too many options | `Pick one. Give your single recommendation and one sentence of why.` |
| Images drift between versions | `Keep the character lock exactly: same proportions, hair, outfit colours and paddle. Change only what I asked.` |
| Before locking anything | `Act as a harsh senior art director for a premium iOS game. Critique this against the brief, list the top 5 problems, fix them, and show the revised version.` |
| To lock a decision | `Locked: <thing>. Add it to the Design lock list and never change it unless I ask.` |

---

### 5. Steering concept images

- **Start every image prompt with the style block** in Part A, section 4.
- **Character lock:** once you like a character, ask ChatGPT for a "character lock paragraph" covering proportions, colours with hex values, hair, outfit, props and face. Start every later image prompt for that character with that paragraph.
- **Change one thing at a time:** "same image, only change the scarf to teal `#22C4B0`".
- **Sheets:** ask for one sheet image (turnaround or expression grid) rather than separate images, so the lighting stays identical.
- **Backgrounds:** use a plain dark navy `#141831` for character art, so the colours read the same as in the game.
- **Concept art is reference only.** Claude re-renders the final art in Blender so it matches the rest of the game, so don't polish concept art for hours.

---

### 6. Self-review checklist (ChatGPT runs this before "final")

```
Before final, check and report pass/fail for each:
1. Follows every owner rule (Part A section 2)?
2. Colours only from the palette family, all as hex, yellow under 10%?
3. Expressions readable at 42 units tall (about 1 cm on a phone)?
4. Text: 6 words or fewer per pop, 12 or fewer per caption, Lilita One?
5. Nothing interactive in the notch, status bar or home-indicator areas; 44 pt targets?
6. Buildable with the existing pipeline (KayKit rig, princess face rig, shared light rig)?
7. Matches the story canon (Part C)?
8. Every number in game units, seconds or hex, with no "about" or "nice"?
9. File follows Part A section 7, starting with the Design lock list and ending with "Open questions
   for Claude"?
Fix every fail, then show me the final.
```

---

### 7. Package for Claude (end of each task)

```
Package Task N for Claude: one Markdown file named design/phase1/<NN>-<slug>.md following Part A
section 7 exactly (Design lock list at the top, then the spec, JSON blocks, image list, and "Open
questions for Claude" at the end), plus the final images named design/phase1/img/<NN>-<slug>-<n>.png.
Give me the Markdown as a downloadable file and list the images to download.
```

Then bring the file and images to the Claude Project thread and say **"build Task N"**. Claude builds it, playtests it at both phone sizes, and shows you screenshots.

---

### 8. Codex as the builder (saves the most Claude usage)

Building is where most of the usage goes: rendering, coding, playtesting and fixing. To save Claude usage, let **Codex** build, and use Claude only for reviews or hard problems.

**How the pieces connect:** through the GitHub repo. Codex works on the repo directly and reads `AGENTS.md` at its root automatically. That file points it to every handoff doc and rule. ChatGPT Projects and Codex don't need to talk to each other: the design files go into the repo, and Codex builds from there.

1. **Design** in the ChatGPT project, then download the packaged files (section 7).
2. **Put them in the repo** under `design/phase1/`. Either upload them on github.com (Add file → Upload files), or give them to Codex and ask it to add them.
3. **Build:** open Codex and give it the prompt below. Use the Codex app, or the CLI in a local clone (`git clone https://github.com/mahikshith/breaker`).
   - Blender rendering needs Python 3.13 and `pip install bpy==5.2.2`.
   - A local clone on your computer is the safest place to run Blender. Cloud Codex may work too if its environment can install bpy, so test it with one small render first.
4. **Review** the screenshots it shows you. Merge only when you're happy.
5. **Don't run Codex and Claude on the repo at the same time.** If you do bring Claude back, say so, and Claude pulls the latest `main` first.

**The ChatGPT project does not start Codex or control Blender by itself.** You open Codex and give it the work. Codex runs Blender headless through the Python scripts, so the Blender app is not needed.

One-time setup on your computer:

1. Install Git, Node.js 22 and Python 3.13. bpy 5.2.2 needs Python 3.13.
2. Open Codex: in the ChatGPT desktop app, switch to the **Codex** view from the top-left menu (or use the CLI, `npm install -g @openai/codex`). Create a Codex project as **Local**, not Cloud, so it runs on your computer where Blender can run. A Codex project is a code folder, separate from a ChatGPT Project; the GitHub repo connects the two.
3. Run `git clone https://github.com/mahikshith/breaker` and open the folder in Codex. Codex reads `AGENTS.md` automatically.
4. Tell Codex: "Set up this repo exactly as AGENTS.md says (npm install, a Python 3.13 venv with bpy 5.2.2, pillow, numpy, Playwright), then run npm run build and npm test."
5. Tell Codex: "Render one test frame with `python3 art/princess.py out/test Idle:1` and show me the image." If you see the princess, Codex can drive Blender.

For each task:

6. Package the design in ChatGPT (section 7). Copy the files into `design/phase1/`.
7. Paste the starter prompt below, ending with `Task: design/phase1/<file>.md`. Steer Codex with the prompts in section 4.
8. When you approve, tell Codex to commit as mahikshith on `codex/<task>`, push, and merge. Open `dist/breach.html` in a browser to play.

Codex starter prompt:

```
You are working in the BREACH repo (github.com/mahikshith/breaker). Read docs/BREACH-ChatGPT-handoff.md
fully, especially Parts E-G, and docs/BREACH-blender-scripts.md. Work only on a new branch
named codex/<task>. Never commit to main.
Set the git identity first: git config user.name mahikshith; git config user.email mahikshith97@gmail.com.
Never add AI attribution to commits or files.
Render with Blender as a Python module (pip install bpy==5.2.2, Python 3.13), headless, reusing the existing
material/light rig from art/render_vault_assets.py and the face rig approach from art/princess.py.
Strip PNG metadata before committing (command in Part F section 3), run python3 tools/pack_art.py and
npm run build, then show me the rendered sheet images before committing.
Task: <paste the locked design file from design/phase1/>
```

**Steering Codex:** the drift prompts in section 4 work for Codex too. Also ask it to "show me the rendered sheet and in-game screenshots at iPhone and Android sizes before committing" after every asset.

**Watching Blender live:** the Blender MCP add-on lets an AI app drive a Blender window you can watch. It works with Claude Desktop, Claude Code, Cursor and VS Code, and with Codex through its MCP config; Part A, section 9 has the details. It's optional and not needed for the plan above.


---

# Part C: Story mode plan, research and roadmap

*Source: `docs/STORY_PLAN.md`*

## BREACH Story Mode and Next Level Plan

**Latest selection and tested candidate (2026-10-18):** Only A / Carrier Breakout is active; Nix/Tick appearances are selected, but their full expressive sprite/animation families and runtime cast integration are not built. B/Relay Raiders, C/Orbital Breakout and D/Eclipse Rescue are deferred. The playable Carrier web candidate is SHA256 `F4863DC5A87D6B46A8A1AFDB702C264F432196B851B61B828946DB8AB75A0423`. It passes 44 unit tests and both-phone bundled gameplay/visual checks. Independent final captures at 393×852 safe59/34 and 412×915 safe32/24 preserve the approved A art, continuous safe-edge starfield, aligned 125×17u paddle and clean settled results, with zero page errors. Public-input assisted deterministic simulated wins record 82.3s iPhone / 45.2s Android of game clock; these do not establish human balance or physical-device performance. Evidence: `out/carrier-playable-final/report.json` and `out/carrier-visual-final/REVIEW.md`. The owner has requested an APK; packaging/native CI and delivery remain pending. No APK pass is claimed. EA839F00… remains historical accepted baseline evidence; the older A/B Canvas tranche remains asset-only history.

**APK checkpoint authorization (2026-10-18):** The owner explicitly requests the APK. This authorizes the necessary checkpoint commit/push and CI on `codex/carrier-mobile-preview` in the existing isolated `breaker-mobile-preview` worktree, using the exact frozen Carrier/current Vault sources and native immersive fix. Primary `codex/phase1-kit` is preserved. No merge to `main` or pending Nix/Tick companion-family admission is authorized. APK/native CI remains pending; the earlier screenshot-approval notes do not block this specific APK checkpoint.

**Current production scope (2026-10-18):** Carrier A is a playable tested web candidate, using the reviewed hull/hangar, cannons, three fighters, cyan/rose panel crates, five shallow captive windows, flat paddle, ball and Laser/Split/Shield payloads. The 125×17u Carrier paddle and 7.5r ordinary / 10r TITAN ball are verified; Vault retains 70×12u/default6r and exclusive Kit use. The final safe-inset starfield and results-effect repairs pass independent phone review. APK packaging/native CI is in progress, not delivered. Nix/Tick full families and live roles remain pending. B/C/D and Brum/Vesper production are deferred; their concept/source-proof history is preserved.

**Historical A/B asset milestone (2026-10-18):** real independent PNG parts and the isolated Canvas motion assembly are complete for the approved A/B left playfields. Final proof is under `out/space-assets-ab/final/`: `A-ios-reference.png`, `A-android-reference.png`, `B-ios-reference.png`, `B-android-reference.png`, `A-motion.gif`, `B-motion.gif` and `asset-report.json`. Actual 393×852/412×915 images and sampled launch/release/boarding/iris sequences pass independent visual review; all four capture runs report zero page errors, real alpha/metadata checks and approximately 126 CSS paddle reserve. A has five shallow captive windows; B has four large worker pods. This asset-only milestone contains no companions, pilots or portraits and predates the latest Nix/Tick selection. These are asset-motion proofs with a placement ball, not new gameplay: runtime admission/WebP sizing, actual-alpha collision alignment, input/combat/rescue/power rules, full playable phone runs, memory/performance and new APK checks remain. The proof milestone retains EA839F00… as its gameplay baseline; it does not cover later Carrier integration. Reproduction and limits: `art/space/ASSETS_AB.md`; inventory/contracts: `design/phase1/space-assets-ab-spec.md` and `space-assets-ab.json`.

Oct 18, 2026 · Live version: https://claude.ai/code/artifact/5278a4c8-b669-4235-972f-7814c32382d9

**Current direction (2026-10-18):** Phase 1 remains approved. Only Carrier Breakout A is active in space; its playable F4863DC5… candidate now passes web gameplay and independent native-size visual checks. The owner-requested APK is in packaging/native CI, not yet delivered. Nix/Tick appearances are selected; their full expressive families and runtime roles are still unbuilt. B/C/D remain deferred and the older A/B asset-only proofs remain history. Brum/Vesper keep their bounded source-proof status; later chapter/progression systems below are not implemented.

### The pitch

An alien collector steals the princess of a kingdom built from glossy bricks. The only one who can bring her back is the young prince everyone laughed at for playing the courtyard bounce game.

Every brick you break in BREACH sends a spark of light home. That light is your score. It rebuilds the kingdom, and it buys the next weapon. One rule ties story, store and progression to the thing players already love doing.

Each session should end on three hooks, the pattern the research below keeps finding:

- **A cliffhanger:** the next chapter is teased.
- **Something visibly rebuilt:** the light earned in the run shows up on the home screen.
- **An unlock almost in reach:** a weapon or skin is only a short run away.

### What the research says

The hits share three habits: runs never feel wasted, power grows every few seconds, and something new is always one run away. BREACH already has the moment-to-moment juice. What it lacks is the layer between runs.

| Game | What hooks players | What BREACH takes |
| --- | --- | --- |
| [BALL x PIT](https://gameinformer.com/review/ball-x-pit/breathtaking-brick-breaking) (8.75/10, Game Informer) | Ball fusions and evolutions, heroes that each change how you aim, and a town rebuilt between runs with blueprints. Runs last about 15 minutes. Its weak spot is having to beat every level several times before progressing. | Power-up fusions, a kingdom rebuilt with Shine, and heroes with different paddles. Unlike BALL x PIT, never force replays to progress. |
| [Arkanoid](https://strategywiki.org/wiki/Arkanoid/Gameplay) | Seven readable capsules: laser, enlarge, catch, slow, break (exit to the next stage), disruption (split into 3) and an extra life. | Keep capsules instantly readable. Add a BREAK-style escape hatch as a rare, thrilling drop. |
| [Holedown](https://www.macstories.net/reviews/game-day-holedown/) ($3.99 on iOS, no in-app purchases) | Crystals earned only by playing buy more balls and more shots. An endless Black Hole mode follows the story. You can quit any time without losing progress. | Proof that a paid iOS ball game can thrive on fair, earned upgrades. Add an endless mode after the story. |
| [Vampire Survivors](https://jboger.substack.com/p/the-secret-sauce-of-vampire-survivors) | A reward roughly every 23 seconds, slot-machine chests, and gold that carries over into permanent upgrades. You play the overpowered hero. | Frequent small rewards, a chest-like reveal on the results screen, and permanent but small upgrades. |
| [Archero](https://www.deconstructoroffun.com/blog/2019/8/9/why-archero-banked-25m-but-leaves-25m-hanging-hlx9n) and [Survivor.io](https://naavik.co/deep-dives/survivorio-archeros-footsteps/) | Pick 1 of 3 random skills at each level-up. Gear, talents and chapters unlock in order. Archero launched near 80% day-1 retention and settled in the mid-40s, about 10% by day 30. The critique: late upgrades felt too small and too slow. | A roguelite Raid mode with 1-of-3 picks between stages. Keep late upgrades meaningful. |
| [Peglin](https://adrianhon.substack.com/p/peglin) ($8.99 to $14.99, premium) | Orbs and relics that bend the rules. The critique: too many items, too early, for newcomers. | Introduce one new power-up per stage, with a codex, so nothing overwhelms. |

**Retention targets.** Puzzle games average about 32% of players returning on day 1, 12% on day 7 and 5% on day 30 ([Segwise, Mistplay data](https://segwise.ai/blog/mobile-gaming-app-user-retention-strategies)). Two other findings from the same source:

- Good onboarding can lift retention by up to 50%.
- About 60% of players quit when difficulty spikes too early.

BREACH should aim for 40% on day 1, 15% on day 7 and 6% on day 30. Those targets assume a strong first five minutes and an early story hook.

### Story bible

The whole story rests on one idea: **the bricks are alive with light, and the princess is the light.** That single rule explains why you break bricks, why she was taken, and why the serpent eats walls.

#### The world

Brickhaven is a kingdom built entirely from starglass, glossy bricks that glow and hold together only while the Lightsong is sung. Princess Lumi is the Keystone, the one person in each generation born able to sing it. When a brick loses its light, it cracks and fades. That is why single bricks crumble in the game.

#### Why she was taken, and why a space prison

Zorvax the Curator travels the galaxy in his mothership, collecting one-of-a-kind wonders for the Menagerie. The Menagerie is a moon-sized prison museum, and he built it from bricks stolen from a hundred worlds.

Stolen bricks go dark, so the Menagerie keeps crumbling. Zorvax needs a Keystone to hold it together, so he takes Lumi and locks her in its heart, the Vault. The prison is literally held up by her light. Every wall you break sets a little of it free.

#### Why aliens, robots and creatures

- **The robots (Clanks)** are Brickhaven's own toy workers, hijacked by the mothership's signal. You never destroy them. A hit snaps them out of it, which is why they go dizzy and fall. Freed Clanks come home and help rebuild.
- **The serpent (Gnash)** is the Vault's warden. It is bred to eat starglass, with one order: if anyone frees the Keystone, swallow her first. That is why it chews toward her cage and grows as it eats.
- **The creatures** are the Menagerie's other exhibits, beasts stolen from other worlds. Each guards a wing of the prison: a dragon who melts bricks into lava, a kraken frozen in a comet, a phoenix in a solar furnace. Some can be freed and become companions.

#### The hero

Prince Kit is Lumi's best friend from the neighbouring isle. As kids they invented the bounce game in the palace courtyard, and he never stopped playing it. The court calls it a waste of time. When the sky goes dark, his old courtyard paddle is the only weapon that can break starglass without shattering the light inside.

This gives players an underdog they relate to: the kid whose "useless" game turns out to be the one skill that matters.

#### The princess is not waiting

Lumi is scared, and players see it, because she paces and panics in her cell. She is also brave. She taps signals through the walls, steers power-ups toward Kit with her song, and in Chapter 3 she becomes playable to break out alongside him. The tagline earns both halves: Kit breaks in, Lumi breaks out.

#### The twist

In the final chapter, Zorvax's secret comes out. His own world went dark long ago, and he collects light so he never has to be in the dark again. Lumi chooses to share the Lightsong instead of taking revenge. Zorvax's world relights, and he reopens the Menagerie as a curio shop: the endgame store with the rarest skins.

#### Cast

| Character | Who they are | What they want | In the game now |
| --- | --- | --- | --- |
| Prince Kit | Lumi's childhood friend and the courtyard bounce-game champion | To bring Lumi home and prove the game mattered | New: the playable hero, built from the KayKit Knight model |
| Princess Lumi | The Keystone, whose song keeps Brickhaven's bricks alive | To escape, and to protect Kit | Exists: nervous and panic animations in the Vault; playable from Chapter 3 |
| Zorvax the Curator | The alien collector on the mothership | Never to be in the dark again | Exists: the mothership boss with five expressions |
| The Clanks | Brickhaven's toy workers, hijacked | To be freed and go home | Exists: the 4-colour robot formation |
| Gnash | The Vault's brick-eating warden serpent | To swallow the Keystone before she escapes | Exists: the growing, accelerating serpent |
| Ember, the Kraken, the Phoenix | Exhibits guarding the Menagerie's other wings | Freedom, or revenge on whoever opens their cage | New: later chapter bosses |

### Chapter map

The two finished levels become the climax stages of Chapters 1 and 2. Each chapter adds one new mechanic and ends on a cliffhanger that only the next chapter resolves.

| Chapter | Setting | New mechanic | Boss | Story beat that pulls you on | Status |
| --- | --- | --- | --- | --- | --- |
| Prologue | The palace courtyard at sunset | The basic bounce game, catch and aim | None | Kit and Lumi play their game, then the sky goes dark. Skippable comic panels, about 60 seconds. | New |
| 1. Invasion | Brickhaven's skies | A marching formation that shoots back | Zorvax's mothership | Kit wins, but the mothership was a decoy. A tractor beam lifts Lumi into the stars. | Built (climax stage) |
| 2. The Vault | The Menagerie's prison core | A rescue race against a brick-eating serpent | Gnash | Kit reaches the cage just in time. Lumi steps out and says "My turn." | Built (climax stage) |
| 3. Break Out | The collapsing prison corridors | Lumi playable; the stage scrolls down as walls fall (Holedown-style descent) | The Warden Core | They escape the Vault, only to find it is one wing of many. | New |
| 4. The Dragon Wing | A volcanic furnace wing | Lava bricks that re-harden; fire spreads | Ember the dragon | Ember is freed and joins as a companion. | New |
| 5. The Comet Dock | An ice comet tethered to the Menagerie | Frozen balls, cracked ice floors, slippery paddle | The Kraken | The map to Zorvax's gallery is found inside the ice. | New |
| 6. The Gallery | Zorvax's throne of stolen light | Every mechanic mixed together | Zorvax, three phases | Lumi shares the Lightsong, and Zorvax's world relights. | New |
| Endless | The Deep Vault | A procedural dig with a leaderboard | A rotating boss | Unlocked after the story; it keeps players coming back. | New |

Each chapter is 6 stages: 4 short stages of about 90 seconds, a mid-boss stage, then the climax. Each stage has 3 stars. Mobile sessions stay at 2 to 5 minutes, and a whole chapter fits a commute.

### Heroes, weapons and skins

Heroes change how a run feels, weapons change what the paddle does, and skins only change looks. Heroes and weapons are always earned through play. Skins can also be bought. That keeps BREACH fair and premium.

#### Playable heroes

| Hero | Passive ability | How to unlock |
| --- | --- | --- |
| Prince Kit | Balanced. Catch and aim gets one extra AIM pip. | From the start |
| Princess Lumi | Her song fills the titan core twice as fast. Power-ups drift toward the paddle. | Finish Chapter 2 |
| Pip the Clank | A freed robot. Its paddle fires a slow auto-bolt every 3 seconds. | Free 100 Clanks in total |
| Granny Mortar | The royal mason. Her ball hits armour bricks twice per bounce. | Rebuild the Masons' Hall |
| Ember | The freed dragon. Every 8th paddle hit sets the ball on fire. | Finish Chapter 4 |

#### Weapons (the paddle's special move)

Each hero equips one weapon. A weapon gives the paddle a tap or hold move with a cooldown. It is separate from the falling power-ups, so both can stack.

| Weapon | Move | Unlock |
| --- | --- | --- |
| Courtyard Shield | No move; a wider sweet spot | Start |
| Twin Blasters | Tap to fire two bullets, recharging | Chapter 1 boss blueprint |
| Magnet Gauntlet | Hold to pull the ball and capsules toward the paddle | 15 stars |
| Smash Hammer | Swing to send the ball back fast and piercing | Chapter 2 boss blueprint |
| Star Bow | Hold to charge and fire a piercing arrow ball | 40 stars |
| Lightsong Lute (Lumi only) | Hold to freeze every enemy for 2 seconds | Chapter 3 |
| Dragon Maw | Breathe a cone of fire that melts a row of bricks | Chapter 4 boss blueprint |

Locked weapons show as silhouettes in the armoury, each with a progress bar to its unlock. Players should always see the next unlock within reach. Weapons level up from 1 to 5 with Shine and blueprints, and each level gives a visible change, not just a few per cent.

#### Skins

Skins are cosmetic only: hero outfits, paddle skins, ball trails, and brick-break effects. Examples include Astronaut Kit, Pirate Lumi, the Candy paddle and a Neon trail. Each chapter adds a set. Some are earned from 3-star stages, some from daily challenges, and some are sold. Every skin is a Blender render, following the art rules already in place.

### Power-ups

BREACH already has 9 power-ups, including a multi-ball (SPLIT ×3, BURST +3) and paddle bullets (LASER). They drop rarely and look alike, which is probably why they go unnoticed. The plan adds 10 more, plus fusions, and introduces them one per stage so players are never overwhelmed.

#### Already in the game

SPLIT (×3 balls), BURST (+3 balls), FIRE (a piercing ball), WIDE (a wider paddle), AIM (catch and aim), LASER (paddle bullets), SHIELD (a safety line), SLOW (a slower ball), and TINY (a bad pickup that shrinks the paddle). The titan core is also there: a dead-centre hit makes a giant unstoppable ball.

#### New power-ups

| Power-up | Effect | Why it is fun |
| --- | --- | --- |
| MULTIPLY ×2 | Every ball on screen doubles, up to 24 | The multiplier you asked for. Catch two in a row for a screen full of balls. |
| GATLING | The paddle machine-guns bullets for 4 seconds | A louder, faster LASER for big walls |
| MAGNET | The paddle pulls the ball and capsules toward it | A safety net that feels skilful |
| BOMB | The next hit explodes a 3 × 3 area | Big physics crashes, the most satisfying moment in the game |
| LIGHTNING | The ball chains to every brick of the same colour | Rewards reading the wall |
| DRONE | A tiny Clank orbits the paddle and fires at enemies | A companion players get attached to |
| FREEZE | Enemies, bolts and the serpent stop for 3 seconds | A panic button in the Vault |
| PORTAL | Two portals open on the side walls | Wild new angles |
| ROCKETS | Six homing missiles hit the boss | Boss fights feel heroic |
| STAR | Bricks drop extra Shine for 6 seconds | Feeds the store loop directly |

Three new bad pickups keep tension: FAST (the ball speeds up), REVERSE (controls flip for 4 seconds), and DARK (fog covers the top half). Bad pickups keep the flashing red outline the game already uses.

#### Fusions

Catch two specific power-ups within 3 seconds and they fuse into something stronger, as in BALL x PIT and Vampire Survivors. Players discover fusions themselves, and a codex records each one the first time it happens.

| Fusion | Made from | Effect |
| --- | --- | --- |
| Firework | FIRE + SPLIT | Split balls explode on every hit |
| Bullet Storm | LASER + MULTIPLY | Every ball fires bullets upward |
| Gravity Well | MAGNET + BOMB | A black hole pulls bricks in, then bursts |
| Time Bubble | SHIELD + SLOW | Everything slows except you |
| Storm Titan | LIGHTNING + titan core | The giant ball arcs lightning as it pierces |
| Swarm | DRONE + BURST | Three drones join the paddle |

### Progression and store

Score turns into **Shine**, the one soft currency, at 1 Shine per 100 points, plus a bonus for each star. Shine rebuilds Brickhaven on the home screen, upgrades weapons, and buys skins. Boss stages also drop blueprints, which unlock weapons and buildings. There is no premium gem currency and no gacha.

```
Core loop: Break bricks in a run (score, stars, freed Clanks) -> Earn Shine and blueprints (paid out win or lose)
  -> Relight the kingdom (buildings, weapons, skins) -> Return stronger (new chapter, next cliffhanger) -> repeat
```

A loss still pays out Shine, so no run feels wasted, which is the Vampire Survivors lesson.

#### Rebuilding Brickhaven

The menu becomes the kingdom, dark and broken at first. Each building you relight gives one permanent perk, the BALL x PIT town idea in a lighter form.

| Building | Perk |
| --- | --- |
| Palace Bakery | +1 starting life |
| Forge | Weapon upgrades, levels 1 to 5 |
| Toy Workshop | Freed Clanks join as drones; unlocks Pip |
| Observatory | Power-up capsules drop 20% more often |
| Masons' Hall | Armour bricks start cracked; unlocks Granny Mortar |
| Lighthouse | +10% Shine from every run |
| Royal Wardrobe | The skin store |

#### Raid mode (the roguelite loop)

After Chapter 1, Raid mode opens. A raid chains 5 random stages from unlocked chapters. Between stages, you pick 1 of 3 upgrades, as in Archero: more balls, longer power-ups, stronger fusions. A raid lasts about 10 minutes. Losing still pays out Shine, so no run feels wasted.

#### Daily habits

- **Daily Breach:** one seeded stage, the same for everyone, with a leaderboard.
- **Daily chest:** free once a day, opened with the slot-machine reveal Vampire Survivors uses.
- **Weekly event:** a boss rush or a themed wall, with a skin as the prize.
- **Streaks:** gentle. A missed day pauses the streak instead of resetting it, so lapsed players are never punished.

#### Store and monetisation

The current model stays: watch an ad to continue, or unlock the full game for $2.99. On top of that:

| Item | Price |
| --- | --- |
| Skins | Shine, or $0.99 to $1.99 for premium sets |
| Boosters before a run (start with WIDE or SHIELD) | Shine, or watch an ad |
| Double Shine for one run | Watch an ad |
| Supporter pack (all chapter skins, no ads) | $4.99, optional |

Three fairness rules protect the premium feel:

1. No energy timers.
2. No weapon or hero can be bought with real money.
3. Ads are always opt-in and always reward the player.

Those rules also match the paid iOS hits in the research, Holedown and Peglin.

### What next

Start with Phase 1. It wraps the two finished levels in the story, adds Prince Kit, and makes every run earn Shine. Even before the store exists, the game then feels like the opening of an adventure rather than two demos.

```
Phase 1 · Story wrapper (start here): prologue comic, Prince Kit as the hero, story beats around Invasion and the Vault; Shine on results, saved progress, chapter select
  -- gate: owner playtests and approves --
Phase 2 · Power-ups and fusions: MULTIPLY, GATLING, MAGNET, BOMB, DRONE, FREEZE and four more, one per stage; six fusions with a codex
  -- gate --
Phase 3 · Brickhaven and the store: kingdom home screen rebuilt with Shine, Forge and weapons, skin wardrobe; Daily Breach, daily chest, opt-in ads
  -- gate --
Phase 4 · Chapter 3 and Raid mode: Lumi playable in the Break Out descent; Raid mode with 1-of-3 picks; Chapters 1-2 filled to 6 stages
  -- gate --
Phase 5 · The Menagerie and launch: Chapters 4-6 (Ember, Kraken, Zorvax), Endless Deep Vault; iOS/Android builds and store listing
```

Each phase ends with a build you play on your phone before the next one starts, the same rhythm as the polish rounds so far.

#### Decisions for you

1. **Names:** keep Kit, Lumi, Zorvax, Gnash and Brickhaven, or rename? Recommended: keep. They are short and easy to say.
2. **Kit's look:** an underdog courtyard kid with his old paddle, or an armoured knight? Recommended: the kid, because players relate to an underdog.
3. **Start:** begin Phase 1 now? Recommended: yes.
4. **Model:** keep watch-an-ad plus the $2.99 unlock, or charge upfront like Holedown? Recommended: keep the current model, since it lets more players in.

### Sources

Pages opened for the research, as of 18 October 2026:

- [Game Informer, BALL x PIT review](https://gameinformer.com/review/ball-x-pit/breathtaking-brick-breaking)
- [StrategyWiki, Arkanoid gameplay and capsules](https://strategywiki.org/wiki/Arkanoid/Gameplay)
- [MacStories, Game Day: Holedown](https://www.macstories.net/reviews/game-day-holedown/)
- [The Secret Sauce of Vampire Survivors](https://jboger.substack.com/p/the-secret-sauce-of-vampire-survivors)
- [Deconstructor of Fun, Archero analysis](https://www.deconstructoroffun.com/blog/2019/8/9/why-archero-banked-25m-but-leaves-25m-hanging-hlx9n)
- [Naavik, Survivor.io in Archero's footsteps](https://naavik.co/deep-dives/survivorio-archeros-footsteps/)
- [Adrian Hon on Peglin](https://adrianhon.substack.com/p/peglin)
- [GameAnalytics, six games that layer in meta mechanics](https://www.gameanalytics.com/blog/six-games-that-successfully-layer-in-meta-mechanics)
- [Segwise, mobile game retention benchmarks](https://segwise.ai/blog/mobile-gaming-app-user-retention-strategies)


---

# Part D: Original game plan

*Source: `docs/GAME_PLAN.md`*

## BREACH — Game Design Plan (v0.1, draft for review)

> Working title: **BREACH**. A premium brick breaker where every level is a rescue against the clock.
> Status: phase 1 (research, plan, first screen drafts). Nothing is built yet; this document is what we review before building.

---

### 1. The one-line pitch

**Carve an escape tunnel through a living mosaic of thousands of micro-bricks to free a trapped creature before the threat reaches it, then watch the whole structure collapse.**

Three feelings we sell, in order:

1. **Urgency** — something is coming for the creature you are trying to save, and you can see it move.
2. **Skill under pressure** — threading a ball into a narrow channel is a deliberate, learnable shot, not luck.
3. **Catharsis** — once you breach, balls multiply, chunks of the structure break off and crash down, and thousands of tiles explode in seconds.

---

### 2. What the reference clips get right (your screenshots)

The five screenshots show the "will the ball escape?" / brick-breaker brainrot format that has pulled tens of millions of views on Shorts, Reels and TikTok since 2022. We use them as a study of *why it is watchable*, not as a visual style.

| What is on screen | Why it hooks people | What we take | What we change |
|---|---|---|---|
| A huge field of **tiny bricks** (60×60+ cells) instead of 8 rows of fat bricks | Each hit removes a speck, so the field erodes like sand. Destruction looks *fluid*, and the count of things destroyed is enormous. | Micro-brick grid as the core material (around 48×72 cells on a phone). | Glossy glass and stone tiles with light and depth instead of flat squares; tiles chip and crumble instead of vanishing. |
| An **"impossible shape"**: a thin maze, ladder, cross or tree channel cut into the mass | Tension. The ball has to find the one narrow opening. Viewers lean in on every near miss. | Levels are *shapes* with channels, pockets and chokepoints. | The player can **aim and curve** into the channel (spin, see §4.3), so it is skill, not just a screensaver. |
| The **grey/yellow breach line** separating the mass from the open play area | A clear "inside vs outside". The moment the ball gets *inside* is the payoff. | Every level has a visible **Breach Line**. Getting a ball behind it triggers a frenzy. | The breach also opens a path for the creature to escape, so it has a story reason. |
| **x3 / +3 orbs** floating in the channels | Exponential growth is visible and easy to read. One ball becomes 3, 9, 27. | Multiplier gates placed *inside* channels as rewards for good shots. | Gates are tied to risk: the best multipliers sit next to the threat. |
| The **ball rattling inside a pocket**, eating everything around it | The "trapped ball goes wild" moment is the most satisfying beat in these clips. | **Frenzy**: a ball inside an enclosed pocket speeds up and shreds. | Pockets can hold the creature, so a frenzy near it is both exciting and dangerous. |
| Dead simple visuals, no UI, one paddle | Instantly readable in 1 second of scrolling. | Readability rule: any frame of the game must read in under 1 second. | Premium art direction on top of the same readability (see §8). |

**The insight:** these clips are addictive because of *anticipation → breach → cascade*. Nobody had built a real game whose whole structure is that loop, with a reason to care (a rescue) and a reason to hurry (a threat). That is BREACH.

---

### 3. Market: what premium and top-grossing brick breakers look like

#### 3.1 The landscape

| Segment | Examples | Model | What works | Gap we exploit |
|---|---|---|---|---|
| Classic paddle arcade | Arkanoid, Wizorb, Shatter, Super Brick Breaker, Real Brick Breaker | Premium or ads | Tight feel, power-up variety | Visually dated, no stakes, no reason to hurry |
| Swipe-aim "balls vs blocks" | Ballz (Ketchapp), Bricks n Balls, Bricks Breaker Quest | Hyper-casual, ads-first | One-thumb, short sessions, ball chain growth | Turn-based (no real-time skill), players hate the ad load (Ballz reviews: "excessive and intrusive advertising") |
| Roguelite brick breaker | **Ball x Pit** (Devolver, 2025; iPhone since Mar 2026) | Free to try, €17.99 unlock | Ball fusion, builds, 2M+ copies sold by Aug 2026 | Long roguelite runs, not a quick phone session; proves players *pay* for an evolved brick breaker |
| Pinball / brick RPG | World Flipper ($71M lifetime), PunBall ($39M) | Gacha, IAP | Deep meta | Revenue spikes and crashes; heavy monetization |
| Viral clip format | Brickmania, Many Bricks Breaker videos | Video content | Satisfying micro-brick erosion | Not a playable game with goals |

Market data (Sensor Tower via GameDev Reports, 2012–2023 pinball and brick breaker): 948M downloads, $296M IAP revenue. Hyper-casual took 62% of downloads but only 8% of revenue; **hybrid-casual took 28% of downloads and 63% of revenue**. Leaders hold D1 retention of 38–54%, and Bricks Breaker Quest reaches about 10% at D60 with 86% organic traffic. The genre retains well; it lacks a premium, fresh hook.

**Positioning:** "Ball x Pit proved people pay for a brick breaker that feels new. BREACH is the premium, one-thumb, phone-first version, built around the most-watched brick-breaker moment on the internet."

#### 3.1b Competitor details (App Store, checked 2026-10-17)

| Game | Model | Online / offline | Multiplayer | Update cadence and what changes |
|---|---|---|---|---|
| **BALL x PIT** (Kenny Sun, Devolver) | Free to try, full game €17.99 one-time unlock; no microtransactions. 4.8★ (290). Came to iPhone Mar 2026. | Not stated; single-player runs | Game Center leaderboards and achievements; no online multiplayer listed | Big free content drops about every 3 months (Regal Jan, Shadow Apr, Naturalist Aug 2026): new characters, 10+ balls, buildings, passives. Bug-fix patches between. |
| **Arkanoid vs Space Invaders+** (Taito) | Apple Arcade (subscription, no ads or IAP). 3.3★ (31). | Not stated | Game Center leaderboards, 2 ranking modes | 5 updates since Sep 2024, all fixes and language support; no new content. |
| **Ballz** (Ketchapp) | Free, ads, IAP (remove ads $2.99–$5.99, lives, rings). 4.3★ (71K). | Cloud save | Trophy Hunt leagues (Iron to Diamond), Game Center, friend challenges | Roughly monthly. 3.0 (Sep 2025) reworked UI, added haptics, a danger overlay and cloud save; Trophy Hunt leagues added Feb 2026. |
| **Bricks n Balls** (PeopleFun) | Free, heavy ads, ruby IAP $0.99–$29.99, remove ads $2.99. 4.2★ (78K). | Not stated | Tournaments | Every 2–6 weeks, nearly all "performance improvements"; dropped subscriptions in 2024; occasional level rebalancing. |
| **Bricks Breaker Quest** (Mobirix) | Free, ads, ruby IAP up to $99.99, weekly sub $9.99. 4.3★ (18K). | **Plays offline** | "Multi-play", Game Center, live events (Neon Burst) | Every 3–6 weeks, "minor issues fixed"; content comes through events, not app updates. |
| **Brick Breaker: Journeys** | Free, ads, remove ads $9.99, unlock balls $4.99. 4.6★ (1.2K). | **Offline** ("no Wi-Fi needed") | None | Frequent in year one (new brick types, ball shop, daily bonus), then 1–2 small updates a year. |

What this tells us: the only premium hit (BALL x PIT) keeps players with **large free content updates on a predictable roadmap**, while the free-to-play games ship small technical patches and keep players with events, leagues and currency. Offline play is a selling point that free games advertise. For BREACH: fully offline, a one-time unlock, and a public roadmap with a new world as a free update roughly every quarter after launch.

#### 3.2 UI/UX teardown: why players stay

Patterns from Candy Crush, Royal Match, Ballz, Bricks n Balls and Bricks Breaker Quest, and what we do with each.

| Pattern | How they use it | Copy / change / avoid |
|---|---|---|
| **Instant start** | Royal Match opens straight into a level; Ballz is playable in 1 tap. | **Copy.** First launch drops you into level 1 with the creature already in danger. No menus, no account. |
| **Short levels (≤ 5 min)** | Royal Match caps levels at about 5 minutes. | **Copy, shorter.** Rescue phase 45–90 s, frenzy 10 s. One level fits a red light. |
| **Teach by playing** | Early levels are the tutorial; one new mechanic at a time. | **Copy.** Levels 1–5 introduce paddle, channel, threat, multiplier, collapse, one each. |
| **Near-miss design** | Match-3 failure screens show "you were 1 move away". | **Copy, but honest.** Fail screen shows the creature, the threat, and how many tiles stood between them ("3 tiles from freedom"). Clutch saves get a slow-mo replay. |
| **Visible progress map** | Saga map with a path of nodes; castle renovation in Royal Match. | **Change.** A **Sanctuary**: every rescued creature lives in your sanctuary, which grows and glows. Progress you can see and care about, not just a node path. |
| **Streaks** | Win streaks give a starting booster. | **Copy.** Rescue streak starts the next level with a bonus ball type. |
| **Juice on every input** | Royal Match lets you keep moving during cascades; everything bounces and sparkles. | **Copy and push further.** Haptics on every chip, pitch ladder on combos, hit-stop on breaches. |
| **Daily reason to return** | Daily rewards, events, passes. | **Change.** One **Daily Vault**: a hand-picked level, same for everyone, global leaderboard, plus a shareable replay. No login-reward slot machine. |
| **Lives / energy** | Wait or pay when out of lives. | **Avoid.** Premium game: unlimited play. This is a selling point in our store listing. |
| **Out-of-moves offer** | Pay coins for +5 moves at the fail screen. | **Avoid for money.** We offer a free one-time "second wind" per level (watch the threat get pushed back 3 seconds), earned in play. |
| **Interstitial ads** | Ballz: ads after every few runs; the top complaint in its reviews. | **Avoid entirely.** No ads is a core promise. |

#### 3.3 Why players pay, and our model

What makes players pay in this genre: removing friction (ads, waiting), progress acceleration, cosmetic identity (ball skins), and content they want more of. Premium iOS buyers pay for *respect*: no ads, no timers, lots of content, polish.

**Recommended model: "Free to try, pay once."**

- World 1 (20 levels) and the Daily Vault are free.
- One purchase (target **$4.99**) unlocks all worlds, Siege mode and the level editor. No ads anywhere, ever.
- Optional cosmetic packs later (ball trails, paddle skins, tile themes). Cosmetic only, never power.
- Apple Arcade is a strong alternative channel: the game has no IAP dependence, so it fits their rules as is.

What we deliberately do **not** copy: energy timers, pay-to-continue, loot boxes, ad walls. These lift short-term revenue but kill App Store ratings and editorial features, which is where a premium game gets discovered.

#### 3.4 Growth hook: the game makes its own viral clips

The genre spreads through short videos, so we build that in. **Replay Reel** automatically keeps the best 8 seconds of each level (largest collapse, clutch save, biggest ball count) and exports a vertical 9:16 clip with one tap. Every player becomes a source of the exact content that inspired this game.

---

### 4. Core mechanics: three candidates and a recommendation

#### 4.1 Candidate A — **Carve & Rescue** (recommended)

The field is a dense micro-brick structure (a tree, a tower, a ship, a skull). Inside, in a sealed pocket, sits a **Wisp**: a small glowing creature. A **threat** is moving toward it. You win by carving a connected channel from the Wisp's pocket to the open area below the Breach Line. The moment the channel connects, the Wisp dashes out along it, leaps onto your paddle, and the level flips into **Frenzy**.

Why it is new: brick breakers have always been "clear all bricks". Here you **sculpt a path**, so *where* you break matters more than *how much*. Careless carving can open a highway for the threat.

The threat is per world, and every threat changes how you carve:

| World | Threat | Rule | Player tension |
|---|---|---|---|
| 1. Hollow Grove | **Void Serpent** | Burrows toward the Wisp along the cheapest path; moves 3× faster through cells you've already cleared. A ball hit on its head stuns it and knocks it back. | Every tunnel you dig, it can use. Do you race it or block it? |
| 2. The Forge | **Rising Magma** | Rises from below, turning bricks it touches into obsidian (unbreakable without Fireball). | Routes close over time; carve early and high. |
| 3. Rime Spire | **Frost Creep** | Spreads cell by cell; frozen tiles take 3 hits and slow balls. | Speed matters; frost "heals" the structure. |
| 4. Drowned Bell | **The Flood** | Water pours into cleared cells from above as a real fluid (cellular automaton). If it reaches the Wisp's pocket, fail. | Carving from the top is suicide; you must dig up from below. |
| 5. Eclipse | **The Dark** | Light shrinks; tiles are only visible near your balls. | Memory and nerve. |

Win: Wisp rescued. Fail: threat reaches the Wisp. Losing all balls costs a life (3 per level) but is not the main fail state.

#### 4.2 Candidate B — **Structural Collapse** (recommended as a core system with A)

Each structure has **anchor rivets** (indestructible studs on the frame). After every break we check which tiles are still connected to an anchor. Any island that is no longer connected **breaks loose, falls, and shatters**: hundreds of tiles in one moment.

- Cut the trunk of the tree and the whole crown crashes down.
- Falling chunks rain shards; catching shards with the paddle fills the Overdrive meter.
- A falling chunk can crush the serpent, or block a channel, so collapse is a tactic, not only spectacle.
- Some levels hang the Wisp's cage from a chain; cutting the chain drops the cage onto your side.

This is the "cut one thing and everything falls" satisfaction that Jenga and physics puzzle games own, applied to a brick breaker for the first time we could find.

#### 4.3 Candidate C — **Spin & Curve** (recommended as the skill layer)

Swiping the paddle as the ball hits imparts **spin**. A spinning ball **curves** (a Magnus-style sideways force that fades over about 1 second), drawn with a visible curved trail. Hit offset still sets the launch angle like classic Arkanoid; paddle velocity sets spin.

- Gives one-thumb players a real aiming skill for threading channels.
- Makes the near-misses in narrow shapes feel earned.
- Ceiling for mastery: experts curve shots around corners into pockets.

#### 4.3b How the player controls where the tunnel goes

There is no finger carving. The thumb only moves the paddle; only balls break tiles. Control over *where* the ball goes comes from five layers, from least to most deliberate:

1. **Paddle position**: where the ball lands on the paddle sets its outgoing angle (classic Arkanoid).
2. **Spin**: swiping the paddle at contact curves the ball (§4.3). The glowing curved streaks in the drafts are these ball trails.
3. **The level shape**: each structure ships with pre-built channels separated by thin walls, like the shapes in the reference clips. Once a ball enters a channel it rattles along it and does the carving for you; the skill is getting it in.
4. **Focus aim (new core ability)**: hold the thumb still as the ball comes down and it catches on the paddle for up to 1 second in slow motion, with a dotted line previewing the first two bounces. Slide to aim, release to fire. Uses a Focus meter that refills with combos, so it is for the shots that matter, not every hit.
5. **Power-ups**: Drill fires straight for 12 tiles, Seeker curves toward the Wisp, Laser paddle cuts exactly where you stand.

Some imprecision is deliberate: it is the "will it get in?" tension from the clips. Focus aim exists so a missed shot feels like your choice, never pure luck. The M0 prototype will tune how often Focus is available.

#### 4.4 Other ideas considered and parked

- **Gravity thumb** (hold to bend all balls toward your finger): powerful but conflicts with one-thumb paddle control. Kept as a power-up ("Attractor").
- **Rhythm hits** (bricks pulse to the beat; on-beat hits do double damage): fun, but splits attention away from the threat. Maybe a later mode.
- **Turn-based aim and shoot** (Ballz style): crowded, and loses real-time urgency.

**Recommendation: build A + B + C as one game.** Carve & Rescue is the goal, Collapse is the payoff, Spin and Focus aim are the skill (§4.3b). The first prototype tests only A with the Serpent (see §10).

---

### 5. Level flow (one level, about 60–100 seconds)

1. **Reveal (2 s).** Camera glides over the structure; the Wisp waves for help; the threat wakes up with a sound sting. HUD shows a "distance to Wisp" meter.
2. **Rescue phase (45–90 s).** Launch, carve, curve, grab power-ups. Music layers add as the threat gets closer (heartbeat, then percussion, then choir).
3. **Breach (1 s).** Channel connects. Hit-stop 120 ms, white flash, big haptic, the Wisp dashes out. If the threat was within 3 tiles: **CLUTCH** slow-mo.
4. **Frenzy (10 s).** Every ball becomes a fireball, multiplier gates spawn, all remaining structure is fair game. Score here sets your stars.
5. **Results (3 s).** Stars, Wisp joins the Sanctuary, Replay Reel button, "Next" in the thumb zone.

---

### 6. Urgency systems

| System | What the player sees and feels |
|---|---|
| Diegetic threat | The threat is on screen and moving; no abstract timer needed. |
| Distance meter | Top bar shrinks from green to red as the threat gets near. |
| Adaptive music | Vertical layers fade in by threat distance; the final 20% adds a heartbeat bass. |
| Wisp reactions | The Wisp looks at the threat, trembles, then presses against the wall it hopes you'll break. |
| Red vignette pulse | Pulses with the heartbeat when the threat is close (reduced in accessibility settings). |
| Clutch rewards | Saves under 3 tiles get slow-mo, a bonus, and a likely Replay Reel. |
| Second wind | Once per level, an earned free push-back of the threat (never sold). |
| Frenzy countdown | 10 seconds to shred for stars. |

---

### 7. Power-ups

Dropped from special tiles (glowing seams in the structure) and from collapses. Caught by the paddle unless noted.

**Ball count**
- **Split ×3**: every ball on screen splits into three.
- **Burst +3**: three new balls fire from the paddle.
- **Multiplier Gate** (field object, not caught): any ball passing through it doubles. Placed inside channels.

**Ball types (8 s)**
- **Fireball**: passes through tiles, melts obsidian.
- **Drill**: pierces in a straight line for 12 tiles.
- **Bomb**: explodes in a radius on first contact.
- **Seeker**: curves gently toward the nearest point of the Wisp's pocket.
- **Ghost**: passes through the threat without stopping (for when the serpent blocks your channel).
- **Chain Lightning**: arcs between nearby balls and breaks tiles along the arcs.

**Paddle (12 s)**
- **Wide**: paddle 1.6× wider.
- **Catch**: balls stick; release to aim.
- **Laser**: auto-fires two beams per second.
- **Twin**: a mirror paddle appears higher up.
- **Safety Net**: a one-time glowing floor that saves one ball drop.

**Threat control**
- **Freeze**: threat stops for 5 s.
- **Seal**: the next tile the ball hits becomes stone, to block a channel the threat is using.
- **Repel**: shockwave pushes the threat back 4 tiles.

**Field**
- **Quake**: shakes the structure; loose islands collapse immediately.
- **Black Hole**: a vortex eats tiles in a radius for 3 s.
- **Shockwave Row**: shatters a full row.

**Overdrive (meter, not a drop)**: filled by combos and shard catches. Tap to make every ball a fireball for 4 s.

Rarity and drop rates are data-driven (one JSON table) so we can tune them without code changes.

---

### 8. Art direction: "Glass and Ember"

Not the flat squares from the clips. A premium, dark, glowing look that stays readable.

- **Tiles**: small rounded glass or stone tiles with a soft bevel and inner light; each world has its own palette (Grove: jade and moss; Forge: obsidian and ember; Rime: ice and violet; Drowned: teal and bronze; Eclipse: gold on black).
- **Light**: balls emit light that brightens nearby tiles (cheap 2D light pass). Bloom on balls, gates and the Wisp only.
- **Destruction**: tiles crack, then pop into 3–6 shards with gravity and spin; shards fade, never pile up.
- **Wisp**: a soft round glowing creature with big eyes. The emotional anchor; it must be cute.
- **Threats**: readable silhouettes in a contrasting hue (the serpent is a dark void body with ember eyes).
- **Readability rules**: threat is always the highest-contrast thing; balls always white-hot; UI only at the very top and bottom.
- **Tools**: everything drawn in code or as small 2D sprites. No Blender, no Unreal.

Audio: each tile chip is a short glassy tick whose pitch climbs with the combo; breaches have a low boom plus choir; the threat has its own motif. Haptics on iOS: light tick per chip (rate-limited), medium on power-up, heavy on breach and collapse.

---

### 9. Technical plan

#### 9.1 Stack: TypeScript + PixiJS v8 + Vite, wrapped with Capacitor for iOS

| Option | Verdict |
|---|---|
| **PixiJS v8 + own physics** | **Chosen.** Fast WebGL/WebGPU 2D renderer, great for thousands of sprites and glow filters. Brick-breaker physics is simple enough that our own deterministic code beats a general engine, and it lets us handle micro-brick edge cases exactly. GDevelop's own runtime is built on PixiJS and ships to mobile through Cordova, which is good evidence this route works. |
| Phaser 4 | Good, but its Arcade physics is per-body AABB; we would bypass it for the grid anyway, and its scene system adds weight we don't need. |
| Godot 4 | Strong engine, but web builds are heavy and slower to iterate on in the browser, where you can review drafts. |
| Unity / Unreal | Overkill for a 2D game and against the "keep it simple" brief. |

iOS path: Capacitor app shell, native haptics plugin, Game Center leaderboards, 120 Hz ProMotion, safe-area aware layout. The same build runs on the web for playtests and on Android later.

#### 9.2 Ball and brick collision physics

Following the `physics-tuning` skill:

- **Fixed timestep** at 120 Hz with an accumulator; render interpolates between steps. Large frame hitches are clamped so nothing teleports.
- **Substeps** so a ball never moves more than 0.4 of a tile per substep. This prevents tunneling through one-tile walls without needing general CCD.
- **Circle vs grid**: each substep, test only the tiles the ball's bounding box overlaps (grid lookup, O(1) per ball). For each solid tile, take the closest point on the tile to the ball centre; penetration gives the contact normal.
- **Ghost-edge fix (the micro-brick problem)**: a flat wall made of many tiny tiles has seams, and a naive solver bounces off the seam corners at strange angles. When a contact is on a tile *corner* and the neighbouring tile on that side is solid, we treat it as a flat face and use the face normal. Walls feel perfectly flat; real corners still deflect.
- **Multiple contacts**: normals from all contacted tiles in a substep are summed and normalized, then the velocity is reflected once. Each tile hit is still damaged.
- **Paddle**: hit offset sets the outgoing angle (±65° from vertical); paddle velocity at contact sets spin. Spin adds a sideways force proportional to speed and decays with a 1 s half-life.
- **Anti-boring rules**: minimum vertical speed component (no endless horizontal loops); if a ball repeats the same bounce loop 6 times, apply a tiny random nudge.
- **Speed**: base speed rises 2% every 10 s of rescue, capped; Frenzy is +40%.
- **Many balls**: balls don't collide with each other (classic rule, and needed for 500+ balls in Frenzy). One flat array of ball structs, no per-ball objects.
- **Collapse**: after breaks, a flood fill from anchor tiles marks connected tiles (incremental, only around changed regions). Unconnected islands become one falling rigid chunk (simple gravity and rotation, no physics engine), which shatters into shards on impact.
- **Determinism**: seeded RNG plus fixed step means the same inputs give the same result, which powers Replay Reel and the Daily Vault leaderboard.

#### 9.3 Rendering budget (iPhone 12 class, 60 fps minimum, 120 fps target)

- Tiles: one instanced sprite batch (ParticleContainer) of about 3,500 tiles; dirty-flag updates only.
- Balls: up to 600 instanced sprites plus a shared trail texture.
- Shards: pooled, max 1,500 alive.
- Glow: one bloom pass on a dedicated layer.
- Budget: simulation ≤ 4 ms, render submit ≤ 4 ms per frame.

#### 9.4 Levels as data

Levels are authored as small PNG images (one pixel per tile, colour = tile type: normal, tough, anchor, gate, power-up seam, Wisp pocket, threat start). A converter turns them into JSON. This makes designing shapes like the reference clips (trees, crosses, mazes) as easy as drawing pixel art, and lets us hand-make or generate hundreds of levels.

---

### 10. Build plan and subtasks

Each workstream is sized for one subagent with a clear contract and a test.

| # | Workstream | Output | Depends on |
|---|---|---|---|
| 1 | **Project scaffold** | Vite + TS + PixiJS v8, lint, unit tests (Vitest), Playwright smoke test, CI | — |
| 2 | **Physics core** | Fixed-step sim, ball/grid collision with ghost-edge fix, paddle, spin; unit tests for flat walls, corners, tunneling, 600-ball stress | 1 |
| 3 | **Grid and level loader** | Tile types, PNG to JSON converter, 5 test levels | 1 |
| 4 | **Renderer** | Tile batch, ball instancing, trails, shards, bloom, camera shake | 1, 3 |
| 5 | **Rescue rules** | Wisp pocket, path-connected check, escape animation, win/fail states | 2, 3 |
| 6 | **Threat: Void Serpent** | Burrowing pathfinding (cheaper through cleared cells), stun, knockback | 5 |
| 7 | **Structural collapse** | Anchor flood fill, falling chunks, shatter | 2, 3 |
| 8 | **Power-ups** | Data-driven defs, drop table, the 20 effects in §7 (first 6 for the prototype) | 2, 4 |
| 9 | **Juice and audio** | Trauma shake, hit-stop, haptics bridge, pitch ladder, adaptive music layers | 4 |
| 10 | **UI and flow** | Title, level select, HUD, results, settings and accessibility | 4 |
| 11 | **Other threats** | Magma, Frost, Flood (fluid automaton), Dark | 6 |
| 12 | **Meta** | Sanctuary, streaks, Daily Vault, Replay Reel export | 10 |
| 13 | **iOS wrap** | Capacitor, haptics, Game Center, store build | 10 |
| 14 | **QA and perf** | Frame budget checks, device testing, playtest notes | ongoing |

#### Milestones

- **M0 — "Is it fun?" prototype** (workstreams 1–6 plus 3 power-ups): one Grove level, the Serpent, carve and rescue. Keep it if testers say "one more" and try to clutch; kill or rework if carving feels like chores.
- **M1 — Vertical slice**: World 1 complete (20 levels), collapse, 12 power-ups, full juice, polished art for one world.
- **M2 — Content**: Worlds 2–5, all power-ups, Sanctuary, Daily Vault, Replay Reel.
- **M3 — Ship**: iOS build, store page, TestFlight playtest.

---

### 11. Open questions for you

1. Working title **BREACH**, or do you have a name in mind?
2. Creature to save: a cute **Wisp** (our recommendation, works worldwide), or a human character like the princess in the Candy Crush ad?
3. Pricing: **free to try + $4.99 unlock** (our recommendation), or fully paid upfront?
4. Is the first prototype scope in M0 right, or do you want collapse in it from day one?

---

### Appendix: sources

- App Store listings: BALL x PIT https://apps.apple.com/de/app/ball-x-pit/id6738703497 · Arkanoid vs Space Invaders+ https://apps.apple.com/us/app/-/id6503027740 · Ballz https://apps.apple.com/app/1139609950 · Bricks n Balls https://apps.apple.com/app/id1331794412 · Bricks Breaker Quest https://apps.apple.com/us/app/-/id1288430163 · Brick Breaker: Journeys https://apps.apple.com/us/app/brick-breaker-journeys/id1619145707
- BALL x PIT 2026 update roadmap: https://www.pcgamesn.com/ball-x-pit/update-roadmap-2026

- Sensor Tower data on pinball and brick breaker subgenres, via GameDev Reports: https://gamedevreports.substack.com/p/sensor-tower-analysis-of-pinballbrick
- Ball x Pit at 2M sales: https://www.pushsquare.com/news/2026/08/devolvers-brilliant-roguelite-dopamine-factory-ball-x-pit-is-a-smash-hit-at-2-million-sales
- Brick Breaker Brainrot (origin of the viral format): https://knowyourmeme.com/memes/brick-breaker-brainrot
- Royal Match design decisions: https://www.cubix.co/blog/the-design-decisions-that-made-royal-match-a-top-grossing-game/
- Ballz review sentiment: https://marlvel.ai/apps/ballz
- Fake and rescue ads, retention data: https://segwise.ai/blog/fake-ads-and-mobile-gaming-how-studios-balance-clickbait-gameplay-integrity-and-profitability-cm7j2hc9s00bvip0l0r4k59lw
- Block breaker landscape 2026: https://www.soonlab.ai/blog/block-breaker-games/


---

# Part E: Status, owner rules, progress log, TODO, palette

*Source: `docs/handoff/01-status-and-next-steps.md`*

## BREACH handoff 1/3: status and next steps

**Latest selection and tested candidate (2026-10-18):** Only A / Carrier Breakout is active; Nix/Tick appearances are selected, but their full expressive sprite/animation families and runtime cast integration are not built. B/Relay Raiders, C/Orbital Breakout and D/Eclipse Rescue are deferred. The playable Carrier web candidate is SHA256 `F4863DC5A87D6B46A8A1AFDB702C264F432196B851B61B828946DB8AB75A0423`. It passes 44 unit tests and both-phone bundled gameplay/visual checks. Independent final captures at 393×852 safe59/34 and 412×915 safe32/24 preserve the approved A art, continuous safe-edge starfield, aligned 125×17u paddle and clean settled results, with zero page errors. Public-input assisted deterministic simulated wins record 82.3s iPhone / 45.2s Android of game clock; these do not establish human balance or physical-device performance. Evidence: `out/carrier-playable-final/report.json` and `out/carrier-visual-final/REVIEW.md`. The owner has requested an APK; packaging/native CI and delivery remain pending. No APK pass is claimed. EA839F00… remains historical accepted baseline evidence; the older A/B Canvas tranche remains asset-only history.

**APK checkpoint authorization (2026-10-18):** The owner explicitly requests the APK. This authorizes the necessary checkpoint commit/push and CI on `codex/carrier-mobile-preview` in the existing isolated `breaker-mobile-preview` worktree, using the exact frozen Carrier/current Vault sources and native immersive fix. Primary `codex/phase1-kit` is preserved. No merge to `main` or pending Nix/Tick companion-family admission is authorized. APK/native CI remains pending; the earlier screenshot-approval notes do not block this specific APK checkpoint.

Read all three handoff docs before touching code: this one (status, rules, TODO with agreed designs), `02-architecture-and-pipeline.md` and `03-environment-skills-ux.md`. Keep them updated at the end of every session. Historical sections include the original `wip/polish-pass` snapshot (`main` @ b5df0eb); current work and the newest progress entries take precedence.

**Current work:** `codex/phase1-kit` holds the final tested Carrier web candidate. The owner requests an APK; root is packaging it on `codex/carrier-mobile-preview` in isolated `breaker-mobile-preview` and running native CI under the APK-only checkpoint authorization above. Final art/phone geometry/results checks pass; full Nix/Tick sprite/animation production and runtime cast integration remain pending. B/C/D stay deferred. Preserve Vault-only Kit and the established controls. Owner device play/review remains the next evidence after CI; no APK completion is asserted yet.

**Historical A/B asset milestone (2026-10-18):** real independent PNG parts and the isolated Canvas motion assembly are complete for the approved A/B left playfields. Final proof is under `out/space-assets-ab/final/`: `A-ios-reference.png`, `A-android-reference.png`, `B-ios-reference.png`, `B-android-reference.png`, `A-motion.gif`, `B-motion.gif` and `asset-report.json`. Actual 393×852/412×915 images and sampled launch/release/boarding/iris sequences pass independent visual review; all four capture runs report zero page errors, real alpha/metadata checks and approximately 126 CSS paddle reserve. A has five shallow captive windows; B has four large worker pods. This asset-only milestone contains no companions, pilots or portraits and predates the latest Nix/Tick selection. These are asset-motion proofs with a placement ball, not new gameplay: runtime admission/WebP sizing, actual-alpha collision alignment, input/combat/rescue/power rules, full playable phone runs, memory/performance and new APK checks remain. The proof milestone retains EA839F00… as its gameplay baseline; it does not cover later Carrier integration. Reproduction and limits: `art/space/ASSETS_AB.md`; inventory/contracts: `design/phase1/space-assets-ab-spec.md` and `space-assets-ab.json`.

### Progress log (newest first)

- **2026-10-18 (preserved Android15 content-inset correction).** Run39127870146 verifies the preceding native/document-focus fix, all prior web/build/lint and Carrier/Vault native phases. Recreated-menu then fails actual WebView y128 instead of0 despite stable hidden bars, correct BREACH focus owner, cutoutALWAYS and full1080×2400 window. The128px offset equals the cutout/status inset and is consistent with the documented AOSP preserved-PhoneWindow decor-fit defect. API35 now explicitly retains public full-screen/navigation layout flags while WindowInsetsController continues to own visibility; no magic margin/translation or test weakening. Atomic snapshots log native ancestor geometry/padding/margins. Frozen F4863DC5 and offline4D5D7B5E are unchanged. Fresh native execution remains the delivery gate.

- **2026-10-18 (recreated WebView focus/insets correction).** Run39126881472 passed44 units, source/offline browser suites, Android compile/lint and native startup/fullscreen/transient-bar/resume/serve/fighter/Vault checks. It failed at recreated-menu document focus: Activity/window focus were true while the new WebView's native focus was false, and the preserved failure screenshot shows an otherwise rendered menu with system-bar space. The Activity now posts fullscreen, native requestFocus and requestApplyInsets after the local page finishes in an attached focused window, complementing its existing window-focus callback. No test requirement or gameplay changes; hashes F4863DC5 and packaged4D5D7B5E remain unchanged. The focused lifecycle correction still requires a passing fresh native run; APK publication remains gated.

- **2026-10-18 (native focus/lifecycle pass; correct Vault test expectation).** CI39125706093 confirms startup focus, full-screen/safe insets, transient bars, held-touch stop/resume, actual serve/drag and three-fighter launch. It failed later because the new test expected the shared74u default for Vault, whose unchanged constructor explicitly sets70u. Corrected the assertion to a diagnostic value tuple `[The Vault,70,12,6,6,ward]`; no Vault behavior or prior gameplay hash changed. A packaged-browser mirror now passes every static Carrier/Vault value, real pointer aim and reload/storage expectation on both phones with zero errors (`out/native-contract-preflight/report.json`). Handoff dimensions are corrected to70×12u for Vault; the base Arena default remains74u. Native recreation and final APK remain gated on the fresh run.

- **2026-10-18 (native startup focus correction after captured failure).** Expanded CI39124792121 again passed44 units, source/offline browser suites and Android compile/lint, then timed out on the initial menu document-focus prerequisite. Failure capture confirms a healthy full-screen menu with no dialog; this is input readiness, not evidence of broken drawing. The Activity now explicitly makes the WebView focusable in touch mode and requests focus on gained native window focus. Independent source review finds the bounded change coherent. Phase diagnostics now log native Activity/window/view focus, and failure window dumps are captured before ActivityScenario closes. No assertion, geometry, gameplay or frozen hash is changed; native execution of this correction remains pending a fresh CI run.

- **2026-10-18 (complete native preflight before third Carrier run).** Run39123471388 passed web/build/lint but failed a status-bar assertion after a one-frame hidden sample. Read-only independent review covered the complete Activity, native test, workflow and frozen packager. The test now waits500ms of focused/attached stable bar state, snapshots native geometry/insets on one UI turn, and asserts on its own thread with phase names. It captures failures before scenario close; the shell runner always preserves screenshots/logcat/window evidence and the original failure exit. The Activity detaches its WebView before destroy; a held-touch stop/resume case checks cancelled input, paused game time, same level and restored fullscreen. No bar/gameplay assertion is removed. The actual offline packaged HTML additionally passes both-phone Carrier suites locally (82.3/45.2s assisted earned wins),44 unit tests, source/packaged hash guards and native raster/font probe. Shell exit handling passes four failure/success combinations. CI will repeat the offline suite, compilation/lint and all native checks; no native pass or APK delivery is claimed yet. The same packaged build is served locally on127.0.0.1:4180/breach.html?level=1 and opened for owner play. Gameplay F4863DC5 and packaged4d5d7b5e remain unchanged.

- **2026-10-18 (native CI failure diagnosed; fresh run prepared).** Carrier run39122761324 passed44 unit tests, all browser suites, frozen packaging, Android compilation and lint (0 errors,9 preview warnings). Native input failed because an Android launcher ANR dialog owned the touch target: `InputDispatcher` records `Application Not Responding: com.google.android.apps.nexuslauncher`. No game/native assertion was removed. The test emulator now stops that background launcher and acknowledges the system immersive hint before instrumentation; the smoke test explicitly awaits document focus before native touches. F4863DC5 gameplay bytes and offline packaged4d5d7b5e hash are unchanged. APK publication remains gated on a fresh complete CI pass.

- **2026-10-18 (Carrier A playable candidate passes final web checks; APK requested).** Build `F4863DC5A87D6B46A8A1AFDB702C264F432196B851B61B828946DB8AB75A0423` passes 44 unit tests and real bundled two-phone gameplay checks. Public-input assisted deterministic simulated wins record 82.3s iPhone/two lives and 45.2s Android/three lives of game clock (`out/carrier-playable-final/report.json`), not human balance. Independent final captures in `out/carrier-visual-final/` confirm approved A hull/barrels/doors/fighters/panel bricks/paddle/ball, continuous top/bottom safe-area starfield, paddle alpha/collider alignment below 0.006 CSS px at both tips, and clean settled results with no frozen Carrier effects. All 147 images and both house fonts decode; zero page errors. Carrier uses 125×17u paddle, 7.5r ordinary ball and 10r TITAN; Vault keeps its prior dimensions and exclusive Kit. Nix/Tick appearances are selected, but full expressive sprite/animation families and live cast integration remain pending; B/C/D are deferred. The owner asks for an APK, authorizing its necessary checkpoint commit/push/CI on isolated `codex/carrier-mobile-preview` without merging to main. Packaging/native CI is underway; no passed APK or physical-device performance is claimed.

- **2026-10-18 (Carrier A cast Nix/Tick selected; gameplay integration pending).** After choosing only A / Carrier Breakout for current work, the owner explicitly selects its Nix/Tick character designs. This supersedes the same-day cast-open note below; B/C/D remain deferred. The appearances are approved, not completed expressive sprite/animation families or live cast integration. Build A from the actual reviewed assets, preserve their exact visual quality and validate robust physics/collision with playable iPhone/Android runs. Compare real gameplay captures beside the A board and asset-motion preview. EA839F00… remains the last accepted/tested baseline until the new candidate passes; no new gameplay/APK pass or commit/push authorization follows from this selection.

- **2026-10-18 (Carrier Breakout selected for current work).** The owner chooses A / Carrier Breakout for now and defers the other space directions. Its visual preview is accepted for continued implementation. Character artwork is liked, but the cast remains undecided; a ship/level choice must not automatically admit Nix/Tick or any other companion. Continue only the A playfield and machinery. Existing B assets/proofs are preserved as deferred work; C/D remain later possibilities. The A/B asset-motion milestone below remains valid history. No new runtime integration, phone gameplay/APK result or commit/push authorization follows from this direction choice.

- **2026-10-18 (A/B left assets and motion assembly complete).** Delivered the reference-matched independent PNG tranche and deterministic Canvas presentation proof for CarrierA and RelayB. Final `out/space-assets-ab/final/` includes both-phone reference PNGs, A/B motion GIFs and native release diagnostics. Independent image/sequence review confirms five shallow A captive cells versus four B pods, source-specific A panels/flat paddle, dim edge planets, clear header/lower paddle, bay launch and continuous side departure, front-door release/boarding and opened portal. No companion/pilot/portrait was added. The report covers 31 manifest part entries with no missing paths, zero page errors in all four 393×852/412×915 runs and~126 CSS reserve; metadata/alpha and natural-aspect checks are asset-only. Reference stencils still need alignment to actual alpha before gameplay. No new runtime encounter, WebP admission, gameplay balance, real-device performance or APK pass is claimed. Reproduction/limits are in `art/space/ASSETS_AB.md`; A/B data/spec and source records are saved. Active bundle remains EA839F00…; C/D follow and companions stay frozen.

- **2026-10-18 (all four space levels approved; A/B assets first).** The owner approves polished A/Carrier Breakout, B/Relay Raiders, C/Orbital Breakout and D/Eclipse Rescue as levels. Immediate work is the A/B LEFT playfields, with all companions/pilots/portraits frozen. Reference inventory records A's five shallow captive windows, 16 coloured bricks and three fighters; B's four large worker pods, 30 coloured/braced modules, relay/iris and empty skiff. Source-proportional display bounds are mapped to both phone sizes in `design/phase1/space-assets-ab-spec.md`; independent files/pivots and asset-only Canvas assembly motion belong in `space-assets-ab.json`. Production and native assembly review may proceed without another concept choice. The discarded 113/97-cell proxy maps, HP and deadlines do not carry forward. No new gameplay integration, balance, build or APK result is asserted; tested runtime EA839F00… is unchanged. Historical reopened-choice entries below remain history.

- **2026-10-18 (space visuals reopened; four-board review).** The owner rejected proceeding from the native saucer-proxy studies, referred back to the polished original space boards, then explicitly requested both originals plus two fresh same-theme designs before deciding. No fish theme is automatically selected; the prior Relay Raiders pick no longer authorizes current production. Re-shown A/Carrier Breakout and B/Relay Raiders. New C/Orbital Breakout shows Nova moon-hare, Pin maintenance drone and carrier/fighter rescue; new D/Eclipse Rescue shows Zuri gecko, Flit mechanical bird and crescent dreadnought/cannon/escape gate. All four are appearance/story concepts, not finished models, native runtime screenshots or animation proof. New1536×1024 PNGs `design/phase1/img/space-orbital-c-v1.png` and `space-eclipse-d-v1.png` have empty metadata; prompts and review state are saved in `space-options-cd-prompts.md` and `space-direction-review.md`. Await the owner's board or component choice before new production. Accepted mobile geometry/input rules remain requirements; source build EA839F00… is unchanged. No new commit/push/APK.

- **2026-10-18 (expanded Invasion requested; design gate).** After reviewing the mobile baseline, the owner asks for full-screen space graphics without the framed hangar window, more purposeful brick/power content across the midfield, moving attack ships and laser beams, and something concrete to save. Prepare two native layout proposals with explicit objective, win/fail rules, earned powers and warning/recovery windows. Use space-specific Clank crew/drone rescue; keep Kit/Lumi out of Invasion and preserve the lowered paddle/reaction lane. The selected Relay Raiders direction remains relevant; new mechanics/assets still require an image pick and proof. No rescue encounter, new fighter or laser system is silently implemented.

- **2026-10-18 (mobile A baseline complete, uncommitted).** Owner selected A, then removed stage captions and the entire lower track, requested a smaller game-font score and non-blue Kit ring, and restricted Kit to the princess/Vault theme. Invasion retains its earned paddle-core Titan with no hero draw or invisible Kit tap target. Saturn was first restored, then corrected to a near-black, desaturated backdrop so foreground pieces lead. Current build `EA839F00A4683BD3CFD05CB87BDE6DA4B79EDFFF0191621362FB90A75FF9FBAC` passes26 unit tests and both-phone mobile UI/score/once-only persistence/drag/Titan/shield, Vault face/two-finger/Focus/loss/Continue, venom/capture, layout and iOS/Android polish checks. Zero page errors. Reports are under ignored `out/mobile-*-final-v2/`; actual phone review boards are `out/mobile-ui-final-v2/review-{vault,invasion}.png`. Geometry is paddle126CSS reserve, drain+20u, shield+18u, with lower clipping/culling before controls. Independent256 shield/debris/bolt/zoom fixtures passed the same geometry on the preceding UI-only build; current focused shield cases also pass. Vesper v7 model/face/Walk source proof is ready, not production-admitted.

- **2026-10-18 (spaceship audit and next APK candidate).** Existing Invasion already triggers a36HP mothership after formation clearance, eases it into view, moves horizontally, fires bombs and adds wing guns below half health. Actual motion proof and labelled last-brick/HP fixtures are in `out/invasion-dark-final/`; they do not establish an earned whole-level clear. Original Phase1 prologue/intro/taunt/decoy-and-Lumi-beam story beats remain missing. No carrier/fighter-launch sequence is claimed. The isolated APK worktree exactly reproduces current EA839F00… Windows bundle, with canonical LF hash `9ec2bdc019c018ad5109c0497c2acf0ee0501ccc9c4ebfa794470c7918730382`, offline packaged HTML hash `5dde1b121b0e8009cfa3f049e419f55b7aabd7edaeac146fa0c2334192e2adf8`, version0.2-preview/code2, native immersive bar/cutout/gesture handling and stronger full-window/safe-inset/recreation/transient-bar assertions. Browser inset injection passed fractional-DPR stability checks; native compilation/emulator tests have not run. This candidate and CI updates are local, not committed/pushed/published. New space expansion is excluded until selected/built/reviewed.

- **2026-10-18 (physical-phone layout feedback; proposals only).** The owner found the paddle too close to bricks and the screen cluttered. Move the paddle/support as low as safely possible; move lives/AIM into the top HUD in both modes, retain only Kit at bottom left plus necessary paddle input, remove moon, heavy deck/top panels and repeated drag/slide/catch instructions, and use the game's playful score font. At most one short `Aim ready` on the first actual catch/press. Android must hide system bars while preserving cutout/gesture safety for controls. Two actual-asset Canvas layout proposals share a126-CSS-pixel paddle reserve. This lowers the paddle73.14px on393×852 iPhone and98.36px on412×915 Android; fastest vertical TITAN return from the Vault bottom row grows from.251→.403s and.346→.541s. These geometric windows do not establish human comfort. Measurements and128 passing native shield fixtures are in ignored `out/control-metrics/`; proposed shield+18u must remain inside drain+20u, with debris/drop/bolt control clipping. Invasion danger remains64u above its actual paddle, deliberately adding22.71/27.25s of untouched-formation march time. No speed or Vault clock retuning. Native immersive Activity/test changes are local in the APK worktree and still need Android CI. Image pick, implemented phone screenshots and owner OK still precede a new commit/push.

- **2026-10-18 (selected animation integration baseline).** Packed the selected16-frame spinning heater shield and12-frame unfolding brick armour, removed the connecting beam, and integrated connected patterned capture A with visible Lumi, mirrored approach anchoring and aligned grip cue. Build `CFEA2D6FF5A8FE13F2CF539FA9D9F9FDB0581EF6C4469C38961701202FC972EF` passes21 unit tests and the focused native venom suite on both phones (`out/combined-cast-capture-prelayout/report.json`): real contacts, valid/empty/missed/late/drag defence, protected cage, terminal immutability and first-use lesson. Capture has independent mirrored/defence/Continue checks; cast has early/latest/zoom and interruption checks. Final combined layout and screenshot approval remain pending. Brum's coat-v7 removes the grey band/detached fur pendants and retains continuous source face, fitted eyes and actual fists; its motion GIF is three labeled key poses, not a finished clip.

- **2026-10-18 (separate pre-Brum APK delivered).** `coding/mobile-preview` is pushed and complete [CI run39108320738](https://github.com/mahikshith/breaker/actions/runs/39108320738) is green on code085a2c6. It passes all21 unit tests, phone/Ward/venom suites, exact frozen bundle check, Android build/lint and offline Android15 native input/fonts/levels/storage test, then exports screenshots and publishes the APK. Lint0errors/9nonfatal preview warnings are documented rather than suppressed. [APK artifact](https://github.com/mahikshith/breaker/actions/runs/39108320738/artifacts/12129462604), [native evidence](https://github.com/mahikshith/breaker/actions/runs/39108320738/artifacts/12129562329). Local downloaded APK: `C:\Users\mahik\Music\Breach\breaker-mobile-preview\out\apk-delivery\BREACH-preview.apk`,1,854,545bytes, SHA256 `3e34835d9bf44f5d9c82f5f1e0be292dc79019545bf80de8827df997763842a7`; its payload/font/hash/no-network-permission boundary and actual native screenshots were checked. `main` is unchanged; physical-phone comfort/performance/audio and human balance remain unchecked. New Kit/capture/Brum/Relay Raiders are excluded from this frozen preview and continue here.

- **2026-10-18 (new animation and space choices).** The owner selected Kit cast **A / spinning shield unfolds into brick armour**, capture **A / connected coil with visible Lumi**, and space **B / Relay Raiders** (Vesper quadruped pilot and Latch lockfish). Begin selected cast/capture production in parallel with Brum coat refinement; keep existing defence deadlines, collision/route and accepted level unchanged. Vesper/Latch need actual geometry/expression/motion proofs before full families or encounter integration. Brum is planned as a hero/ally whose strong arms open blocked routes and protect the team, not an implemented encounter. The pre-Brum APK checkpoint remains isolated from these new changes.

- **2026-10-18 (face-only control, cast/capture restart, space and mobile checkpoint).**
  - The owner confirms the level is playable and accepts its design. Kit's face must remain the control icon throughout; the old 12-second miniature body replacement and long connecting cast trail are rejected. Native face-only baseline is `485F921A73977C325E535A3500CEA967CB00B16A63042D15110F4D2D31073DF0`; it builds and all 21 unit tests pass. The face-only control subsequently passed both phone sizes (`out/face-always-qa/verification.json`): all eight expressions, touch/Focus/two fingers, charge/Titan/continue/completion, plus Ward/venom/coach/input outcomes; each device recorded 562 face draws and zero body draws. New animation integration still needs fresh final checks after picks.
  - Prepared two isolated real rendered cast studies in `design/phase1/kit-cast-options.md`: spinning heater shield/unfolding armour or separate short guard cast/rising armour. Prepared two capture studies in `capture-options.md`: visible connected-coil hold or cartoon intake/gulp. Neither is active production. Preserve the existing attack cancellation window, Continue and accepted geometry. The current capture defect is a head-centre/princess overlap with live pacing and lingering debris, not a missing level rule.
  - The owner requests parallel space story/cast/ship/cannon animations, plus Brum's dedicated strong-arm brick-smash levels and escalating difficulty. Two space boards are `img/space-carrier-a.png` and `img/space-relay-b.png`; selection is pending. Brum remains the selected first model proof, not a completed family or playable encounter. New difficulty and paid-power systems are proposals; levels should remain winnable with earned tools and readable counterplay.
  - The owner explicitly authorizes a new `coding/` branch, push and Actions APK artifact of the reviewed pre-Brum milestone while this work continues. Created `coding/mobile-preview` in an isolated sibling worktree and reproduced exact old Windows build `3A6B8A8C5368364AFCFCE6BBF7B1994D4598C121C90B45B72FE5BD7E45285EC1`. Its packaging/workflow and CI outcome are documented in that branch's `docs/MOBILE_PREVIEW.md`. This exception supersedes the usual prefix/commit gate only for this checkpoint; `main` is unchanged. New cast/capture production still needs picks and final screenshot OK.
  - Mobile checkpoint commit `bfe54b7` is now pushed with the owner's author/committer identity. Actions run: https://github.com/mahikshith/breaker/actions/runs/39106952788 . The web job passes all 21 unit tests, exact milestone packaging and phone/venom regressions; native Android compilation/emulator validation are still running. Do not claim an APK passed before that outcome. New branch: https://github.com/mahikshith/breaker/tree/coding/mobile-preview .
  - First native run stopped at a premature font-readiness assertion; the game compiled and lint passed. Fixed startup/recreation smoke readiness in checkpoint commit `8d10575`, kept font and canvas checks, and retriggered https://github.com/mahikshith/breaker/actions/runs/39107558744 . APK publication remains gated on the native pass. Current game bytes are unchanged. An existing Kit face is reused as the preview launcher icon.

- **2026-10-18 (A / left face orb integrated and tested; Brum proof selected; uncommitted).**
  - The owner selected the left face-orb board. Packed the eight existing 288-pixel face portraits and integrated a 52-CSS-pixel left orb, circular charge and 12-second expressive body windows. A valid timed Ward spends the existing Vault charge once; Invasion retains centre-return Titan. Paddle and Kit pointer IDs are independent.
  - Added the simple streaming top-tunnel entrance, masked hidden tail, real hit-triggered fury and variable spray, protected cage scope, real partition melt/collapse and actual guarded survival. A first eligible earned-full-charge warning pauses the world for a contextual tap lesson; only Kit's presentation clock advances, and the real charged cast resumes play/persists acknowledgement.
  - Independent checks found and fixed post-loss venom melting and held intro-skip release launching the serve. Tested build: `3A6B8A8C5368364AFCFCE6BBF7B1994D4598C121C90B45B72FE5BD7E45285EC1`, 2225.7 KB; all 21 unit tests pass.
  - **Final phone checks:** `out/kit-orb-final-qa/report.json` covers both levels, eight real face/body crops, touch/Focus, two-finger Kit/paddle ownership, charge preservation, Invasion Titan, presence expiry, loss/continue and seeded completion. Independent corner/cancel/out-and-back/ward-feedback checks pass in `out/kit-orb-independent/report.json`. Native venom checks in `out/venom-coach-final/report.json` cover ten full/empty/missed/late/drag outcomes, hidden/body/FIRE contacts, cage frame/18 bars, zero opening rage, terminal immutability, held pointer/Space skip and the first-use coach (five seconds frozen world, live Kit clock, real tap/resume/acknowledgement). Layout and iOS/Android polish regressions pass with no page errors. The exact build hash is unchanged after these runs.
  - **Recovery and difficulty:** the six baseline bots all lost after Vault charge became defensive. Broader aiming found a real iOS rescue at 30.04 seconds. A strategic Android run at 43.8167 seconds broke 121 bricks, used ten legally replenished Focus catches and collected SPLIT/FIRE/LASER/WIDE/SHIELD/SLOW, without grid/life/charge cheats. Its decisions are in `out/vault-strategic-android/report.json`. These prove recoverability, not tuned human difficulty; physical phones/Safari remain unchecked. Do not reuse the old three-win/three-loss result for these rules.
  - **Review media:** `out/final-review/phone-review.png` compares actual iPhone serve/tunnel and Android guarded impact; `out/kit-ability/kit-ward-motion.gif` shows actual channel, short Cheer/live response and return to face after 12 seconds. The animation uses an explicitly staged charged/two-hit fixture, not an unseeded earned run. A localhost copy of the exact build is `out/venom-prototype/game.html`.
  - **Brum selected:** new cast anatomy boards are `img/cast-v2-anatomy-a.png` and `img/cast-v2-anatomy-b.png`, documented in `03-cast-restart.md`. Mosskeeper has short root-feet, Vesper four paws/tail, Rook wings/fan tail and Latch fins/tail/jaw; Fen/Brum retain justified long arms. The owner selected **Brum** for the first actual model/expression/motion proof. Keep the verified Yeti rig/anatomy, prove continuous face and distinct neutral/welcome/protective states plus actual motion at native size before a full family. No new encounter or completed cast set is implied.
  - Commit/push still wait for the owner's OK after final screenshots. No later story/progression system is silently included.

- **2026-10-18 (Kit ward / variable venom direction; prototype only).**
  - The owner gave Kit a concrete defensive purpose: when his shield bar is full, he can empower threatened partition bricks so venom cannot open a shortcut to the cage. Prepare a first-use player demonstration showing charge, warning, shield cast and the defended outcome; show an empty-charge or missed-defence outcome too.
  - The latest layout request supersedes the standing-body/bar study too: show Kit's face inside a circular charge orb at the bottom left or right. On becoming powered, show his fullbody and real expressions/motion for about 10–15 seconds; the prototype starts at 12 seconds. He channels shield power on a valid charged tap, then braces/reacts and recedes. If the fullbody has receded before a later cast, it can appear for that cast; do not refresh the display every frame or consume an unused charge when he recedes. The display duration does not extend the ward beyond its volley. Use a shorter display only if the longer one obstructs play. The orb is the deliberate minimum-52-CSS-pixel control; there is no permanent fullbody avatar, horizontal charge bar or redundant centre button. Compare left/right placement with the same timed ward. Keep the central thumb-drag lane, lives/AIM and safe inset clear. Win/loss menu expressions are also desired in later result-screen work. Automatic defence remains only an unselected alternative.
  - This supersedes the earlier offensive powered-return versus aimed-attack comparison as the current design focus. Start the proposal from the existing 12-brick charge, with one visible resource; explicitly resolve its relationship to Titan rather than silently adding a second meter or free double spending. The proposed Vault charge serves the ward, while Invasion retains Titan. No permanent hero-level system is approved by this brainstorm.
  - The owner rejected the straight-line venom presentation. Use a changing directional spray with irregular strands, droplets, spread and impact splashes. The effect must still identify the threatened stone and leave the ball readable. Stronger appearance does not establish safe route balance.
  - The serpent must visibly crawl from a simple top tunnel, head facing down as it emerges, before following its normal route. Do not add an entrance meter or reconstruct the level for this. Do not open with a pre-filled static coil or venom attack. Venom requires two separate actual player-ball impacts after entry. Earlier effect boards used a staged two-hit setup near the top; they were not a proposed opening attack and are superseded by the combined entrance/ward demo. Verify continuous entry and body occupancy in the isolated proof.
  - These are isolated design/demo changes. The tested main build still has reaction-only Kit, the original Titan core and no venom or ward mechanic. New image/rule picks precede production; commit and push still require the owner's screenshot OK.
  - **Cast anatomy correction:** after seeing the source-backed Castle Oddities / Starbound Runaways boards, the owner objected that nearly every creature inherited the same long arms. Long arms make sense for Brum/Yeti and Fen/woodland courier; this is not a production selection. Redesign the others around distinct anatomy, tails/wings/root structures, motion and powers instead of the shared Big biped template. Those boards need revision before a new cast pick. Keep sources feasible without making source convenience the design.

- **2026-10-18 (finished Kit/mixed Vault; cast rejected; venom proposed; uncommitted).**
  - **Kit:** completed selected Knight 2/B with 100 real rig frames across eight expressions, continuous face, open helmet and hand-mounted medieval shield. Finished turnaround, eight face portraits, contact sheet, animated preview, source and manifest are under `assets/kit/`, `art/kit.py` and `design/phase1/01-kit-character.md`. Integrated the native-size hero above the control grip with reactions to serve/Focus/combo/loss/danger/win/hit/titan. Source and native/motion proofs passed independent review.
  - **Mixed Vault:** 219 brick objects / 245 HP / 19 deliberate power targets; defended aiming-side changes and two optional eight-brick hanging caches. Jade serpent starts at 12 cells, grows to 20 and takes an initial 39-step path. Its actual idle attack/loss times are 54.292/58.975 s. FIRE/TITAN pierce breakables but bounce from declared granite/bars; solid-corner handling and aim flags were corrected without changing Invasion armour piercing.
  - **Final verification:** build and all ten unit tests pass. Both phone sizes passed Kit touch/control/reaction checks (46 captures, all eight animated rows, no overlaps/errors) and the mixed Vault suite (six complete seeded rallies: three earned wins, three serpent losses; both caches, power combinations, no initial unsupported bricks/free breach, valid path, intro and settled-star result captures). Reports: `out/kit-final-qa/` and `out/vault-final-qa/`. Tested build SHA256: `00A6756BDF0A3B8D0EE61AD6EC00ED6A5D3DE2D0A23A2383B9FA173634301BDB`. Chromium phone emulation does not establish physical-device/Safari feel or human difficulty balance.
  - **Existing regression suites:** `layout.mjs` and both iOS/Android `polish.mjs` runs also pass against the same frozen build with no page errors; captures are in `out/final-layout/`, `out/final-polish-ios/` and `out/final-polish-android/`.
  - **Creature rejection:** the owner rejected the six Ember/Mortar/Polaris source proof images, especially the last pair, and requested the entire set be scratched and redesigned. No full batch shipped. Their source/assets/preview harness are removed from active paths and preserved in ignored `out/rejected-cast-20261018/`; `02-menagerie-cast.md` is withdrawn history. Knight 2 was outside this rejection. Prepare two genuinely new source-feasible cast directions in `03-cast-restart.md`; wait for a new image pick before production.
  - **Venom proposal:** the owner suggested two ball hits provoke a furious serpent into melting black partitions with venom breath. Prepare two isolated effect options with real jade art/crumble reuse. Proposed safeguards: distinct impacts, visible wind-up, one exposed partition target, protected cage frame/bars, recovery/cooldown and measured route/collapse changes. No venom/rage mechanic is in the tested build; image/rule choice comes first.
  - **Kit gameplay-purpose question:** the owner asked why Kit is standing in the UI and proposed earning power/levels through brick hits, then launching an attack or boosting the ball. Current Kit is only a reaction avatar; his special ability is not implemented. Prepare two concrete ability previews: reuse the existing charge/Titan cycle as a visible Shield Slam on a clean return, or spend earned charge with a deliberate aimed special. Make cause/effect, input, animation, snake impact and venom-rage interaction explicit. Do not add XP/store/chapter systems from this brainstorm without a separate decision.
  - **Gates:** no commit or push has occurred. Await the owner's OK for the finished Kit/mixed-level screenshots. New cast, venom and Kit-ability options need their own picks; later story tasks remain pending.

- **2026-10-18 (Knight 2 selected; level challenge and cast expansion; uncommitted).**
  - Build replacement Knight 2/B with a continuous expressive face, open helmet, cobalt armour/cape and a broad medieval shield with a rear grip. The owner explicitly wants a polished finished asset and real animation. First inspect actual Blender proofs beside Lumi, then finish the eight clip families and phone-size integration. No replacement render is approved merely by matching its concept image.
  - The owner initially picked level A, then explicitly rejected its direct rescue route. That pick is revoked; do not integrate the old Open Gate maps. Level 2 must progress beyond Level 1: more bricks, tougher non-direct gates, angled shots, deliberate power-up bricks, a differently coloured longer serpent and a longer measured serpent path. Present two revised image options before integrating a layout. Challenge must come from readable choices, rewards and timing, not just extra HP.
  - The owner also authorized a broader castle/space cast so later levels do not repeat Lumi and Gnash as their entire premise. Two image families were presented in `design/phase1/02-menagerie-cast.md`; **B/Castle to Cosmos was selected**: Ember, the brick golem and the magnetic manta. Build those expressive, animated asset families in parallel with Kit. The alternative space wardens remain unselected references. New asset production does not approve every later chapter system or enemy mechanic.
  - Parallel ownership: character production, revised level options, and new cast concepts. The lead integrates the selected Kit and reviews proofs. All commits/pushes still wait for the owner's OK after screenshots.
  - Two revised level boards were shown: V2-A/Bastion Switchback and V2-B/Twin Keeps. The owner selected **a mix of both**. Build A's defended turns and long jade-serpent detour with B's optional flank and hanging reward cache. Both shown options explicitly included granite/cage blocking FIRE and TITAN while breakable bricks still pierce; implement that declared per-grid rule and preserve it in the aim predictor. Re-measure the combined map rather than borrowing the separate proposals' balance results.
  - Knight source proofs now pass continuous plain-skin cheek/jaw, open helmet, distinct expressions, shield grip/face clearance during sampled Cheer/Hurt/Focus motion, and native scale beside Lumi. The full animation batch is in progress. This is internal source QA; final phone screenshots still require the owner's review.

- **2026-10-18 (design restart and parallel level design; uncommitted).**
  - The owner initially selected the teal courtyard concept, then rejected its Blender implementation: unreadable expressions, malformed hair, a face that looked patched on, and a prop resembling a table-tennis bat. That selection is revoked. The replacement direction is a knight with a proper medieval shield.
  - Removed the rejected character, shared-face refactoring, runtime integration and related tests from the active tree. The discarded work is preserved only in ignored `out/rejected-kit-20261018/`. The original game rebuilds and all five original tests pass. Setup fixes remain. No commits or pushes were made.
  - The owner explicitly requested parallel work: separate character-concept, level-design and independent-reference-review tracks. Prepare image options for both existing levels while character work proceeds; keep each track's files separate. This supersedes the earlier restriction on preparing only one task at a time.
  - **Gates:** show 2–3 image options for each design track and wait for the owner's pick before production changes. Playtest implemented changes at both phone sizes and show screenshots. Commit and push only after the owner's OK.
  - **Quality target:** follow the existing Lumi, serpent and robot art: coherent silhouette, uninterrupted facial surface, large readable eye/lid/brow/mouth changes, consistent light and stable animation anchors. Concept polish alone does not prove a Blender implementation is ready.
  - **Replacement character options:** `design/phase1/01-kit-character.md` and `img/01-kit-v2-1.png` through `01-kit-v2-3.png`. The new options are 1/A teal bareheaded, 2/B cobalt open helmet, and 3/C indigo wayfarer. Recommend 2/B for its clear laugh/worry contrast and credible Knight source mesh. No replacement is selected. First prove the selected face, shield grip, proportions and real animation beside Lumi before the full render batch; review criteria are in `design/phase1/00-quality-target.md`.
  - **Level options:** `design/phase1/level-layout-options.md` and `img/level-layout-a.png`, `img/level-layout-b.png`. A/Open Gate gives a clear opening target and central rescue shaft; B/Twin Fronts rewards angled shots into two flanks. Both are isolated candidate renders using the existing game art; active gameplay sources are unchanged. Recommend A for the first playtest.
  - **Level preflight:** iPhone 393 × 852 and Android 412 × 915 captures use the required fonts and safe insets. Cage preservation, no initial breach, supported starting bricks, legal march bounds and five serve contacts per level/device passed. An untouched serpent attacks at about 25.2 s; a four-hit possible rescue route proves reachability only. Sustained rallies, power-up outcomes and difficulty balance remain unvalidated. These are layout proposals, not completed production playtests.
  - **Next at that checkpoint:** wait for replacement picks. Superseded by the newer entry: Knight 2/B selected; direct-rescue A rejected; harder levels and broader cast requested. Nothing has been committed or pushed.

- **2026-10-18 (local setup and Phase 1, Task 1 concepts; uncommitted).**
  - Re-cloned the latest repo into `C:\Users\mahik\Music\Breach\breaker`; the initial checkout is preserved as `breaker-initial-clone`. Set the required commit identity and created `codex/phase1-kit`.
  - Installed Node 22.23.3 and Python 3.11.16 with owner approval. bpy 5.2.2 actually requires Python 3.13, so art uses a separate environment based on the existing Blender 5.2.2 / Python 3.13.13 installation. Corrected the incompatible setup instructions; local activation commands are in doc 03.
  - Rendered `python3 art/princess.py out/test Idle:1` successfully. Made the output path absolute because Blender resolved the relative render path outside the checkout on Windows. Verified the 168 × 168 RGBA image, stripped its PNG metadata, and made `out/test/princess-preview.png` for review.
  - `npm run build` and all five unit tests pass with Node 22. Baseline `layout.mjs` plus `polish.mjs` at iPhone 393 × 852 and Android 412 × 915 report no errors; screenshots are in `out/baseline/`. Planck's Node >=24 engine warning remains documented in doc 03.
  - The first character concepts and rejected build are archived under ignored `out/rejected-kit-20261018/`; they are not approved assets.
  - **Next:** follow the restart entry above. Review replacement knight and level-layout images, then build only the selected options.

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
  - ChatGPT returns `design/phase1/*.md` and images. To save Claude usage, the owner may have **Codex** build them, guided by `AGENTS.md` at the repo root. Claude is then used only for reviews. Whoever builds pulls `main` first; only one builder works at a time.

- **2026-10-18 (story plan):** owner asked for a dedicated story mode, a prince, locked weapons, a store with skins, and more power-ups (multi-ball multiplier, paddle bullets), backed by research into addictive games.
  - Plan drafted, not built: `docs/STORY_PLAN.md` (live, editable copy: https://claude.ai/code/artifact/5278a4c8-b669-4235-972f-7814c32382d9; also `/mnt/project-files/breaker/plan/STORY_PLAN.md`).
  - Core idea: bricks are alive with light and Princess Lumi is the light; Zorvax the Curator holds her in the Menagerie space prison; Prince Kit is the underdog hero; score becomes Shine, which rebuilds Brickhaven.
  - Waiting on the owner's four decisions at the end of the plan (names, Kit's look, start Phase 1, business model). Nothing in section 9 is built until the owner approves.

- **2026-10-18 (later):** TODO items 1–7 in section 8 are implemented on `wip/polish-pass`:
  - level wiring, crumble vs. big crash, difficulty, continue screen, ferocious serpent with bite marks and the cage attack, nervous and panicking princess, and the Invasion calm-down with its landing beat.
  - Draft screens are in `/mnt/project-files/breaker/playtest/v3/`. Re-shoot them with `node tools/playtest/polish.mjs <out> ios|android`.
  - **Still open:** item 8 (shinier bricks, new capsules, titan ball, princess `Nervous`/`Panic` frames, serpent `snarl`/`strike` faces, all being rendered); then item 9 (playtest Android, tune difficulty) and item 10 (merge to `main`).

---

### 1. Rules from the owner (non-negotiable)

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
- **Scope right now:** approved Phase 1 of `docs/STORY_PLAN.md`, finished Knight 2/B and mixed Vault review, replacement cast concepts after the rejected set, and isolated venom-effect and Kit-ability proposals. Independent work may run in parallel; concept-pick and post-playtest approval gates still apply. Later chapter systems still need their own implementation decision.

---

### 2. The game in one paragraph

BREACH is a brick breaker for phones in portrait. The world is 360 units wide, and the height adapts to the screen.

You drag your thumb to move a chrome paddle and bounce a chrome ball. The game has two levels:

1. **Invasion.** A marching Space-Invaders-style formation of glossy candy bricks and toy robots steps down toward you, and the robots fire bolts. If the formation reaches the hazard line, you lose. Clear the formation and a mothership boss arrives.
2. **The Vault.** This is a side-view cutaway of a castle tower. A princess is caged near the top, and a purple serpent chews its way through bricks toward her along a Dijkstra path. You break a path up to the cage to free her. That triggers BREACH: she runs out and a FRENZY multiball round plays as the win lap. If the serpent reaches her, you lose.

There is also a **Focus aim** mechanic. Hold your thumb still while a ball lands and the paddle catches it. Time slows to 0.25×, you slide to aim with a predicted path, and you lift to fire. This costs an AIM pip; pips refill as you break bricks.

---

### 3. Tech stack and how to run

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

#### Art pipeline (Blender, optional to re-run)

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

### 4. Look and feel (keep this)

- **Style:** glossy "vinyl toy" pieces with real light, deep shadows, and saturated but not neon colours. Bricks should read like **glazed ceramic tiles**. See `docs/reference/vault-top-down.png`, the look the owner called "even shinier" and wants matched.
- **Not too much yellow.** Gold and yellow are accents only.
- **Ball:** chrome, a 12-unit ball drawn from a 20-unit sprite. The fire variant is molten orange. The titan variant (new) is dark gunmetal with magenta and cyan energy, plus a code-drawn pulsing halo.
- **Paddle:** chrome capsule made of three sprites (`paddle_l`, `paddle_m` stretched, `paddle_r`).
- **Fonts:**
  - Lilita One for all game text, always drawn with a dark outline and drop shadow via `text()` in `gfx.js`;
  - Rubik for the score.

#### Palette

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

#### Mobile UI/UX rules already applied

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

### 5. Code map

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

### 6. Level details (as on `main`)

#### The Vault (`src/vault.js`)

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

#### Invasion (`src/invasion.js`)

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

### 7. Work in progress on `wip/polish-pass` (what this branch already changes)

The owner's latest feedback, which is the current task list, is reproduced in section 8. The branch already contains the following.

#### `src/arena.js` (rewritten; levels still need wiring)

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

#### Other files

- **`src/debris.js`:**
  - `crumble(art, x, y, w, h, vx, vy, n)` creates a short-lived fade with a white flash;
  - new constructor option `killY` removes physics pieces that fall past the paddle into the deck.
- **`src/physics.js`:** `b.titan > 0` pierces like fire.
- **`src/gfx.js`:** titan ball drawing with halo; `POWER` entries for laser, shield, slow and shrink (`bad: true`).
- **`src/prefs.js`, `src/monetize.js`:** new (section 8).

#### Art that was being rendered (may or may not be in the branch)

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

### 8. Remaining work: the owner's latest feedback and the agreed design

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

#### TODO, in order

##### 1. Wire both levels to the new arena

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

##### 2. Single brick versus big crash

- In `Vault.removeBrick(br, ball)` and `Invasion.hitCell`, use `this.bigCrash(ball) ? debris.shatter(...) : debris.crumble(...)`.
- Reduce the `fx.shatter` coloured shard counts for single breaks to 1–2.
- The Vault `collapse()` rigid-body drops stay as they are: that is the "major crash".

##### 3. Difficulty

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

##### 4. Continue screen

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

##### 5. Ferocious serpent (Vault)

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

##### 6. Nervous princess (Vault)

Give her an x position inside the cage (about 140–220).

| Danger | Behaviour |
|---|---|
| below 0.3 | Idle at the centre, occasionally "Help!" |
| 0.3–0.6 | `Nervous` walk back and forth at about 22 u/s, pausing at the ends with a scared glance toward the snake |
| above 0.6 | `Panic` run "in circles": x = cx + 36·cos θ, with a slight scale and y bob from sin θ for depth, flipping on direction, biased away from the serpent |
| during the attack | `Scared`, cowering on the far side |

##### 7. Invasion polish

- **Calm the background:**
  - in `background()`, after drawing the plate, darken it with about rgba(6,8,20,0.35);
  - desaturate it about 30% (`globalCompositeOperation = 'saturation'` with grey at about 0.3 alpha);
  - darken the lower hangar (y above about 450) a further 25%.
- **Hazard line:** draw it thin and dim (about 0.3 alpha) until the formation is near, then brighten and flash it as a warning.
- **Landing beat:** when the formation lands, all robots `laugh`, the hazard line flashes red, and a beam zaps the paddle. Then "THEY LANDED" and `fail` after about 1.2 s.
- **Laser:** shots damage the boss through `shotHit`.
- Apply the same crumble, deck and continue behaviour as the Vault.

##### 8. Shinier bricks

Done by the art job above; verify it. If it is not finished, rerun the brick renders with:
- lower roughness and clearcoat;
- a softbox or emissive strip so the top faces catch a crisp highlight;
- the same sizes and names.

##### 9. Playtest and publish

- Playtest at iOS 393×852 with `?safe=59,34` and Android 412×915 with `?safe=32,24`.
- Check for no console errors, the deck clear of play, readable text, and a reachable continue flow.
- Share screenshots with the owner.

##### 10. Merge

Commit as mahikshith (no AI attribution) and merge `wip/polish-pass` into `main`.

---

### 9. Future, NOT to build now (keep the code extensible)

- **Story mode** chaining levels. The full plan (story bible, chapters, heroes, weapons, power-ups, fusions, store, roadmap) is in `docs/STORY_PLAN.md`; build only after the owner approves a phase.
- **Unlockables:** a locked princess, sword or prince shown as "next time" teasers; dragons and mythical beasts as new creatures.
- **Extensibility:**
  - levels are self-contained classes in the `LEVELS` registry in `main.js`, so new levels and creatures slot in the same way;
  - monetisation stays isolated in `monetize.js`;
  - persistent progress goes through `prefs.js`.


---

# Part F: Architecture, art pipeline, build and test

*Source: `docs/handoff/02-architecture-and-pipeline.md`*

## BREACH: architecture, art pipeline, build and test

**Latest selection and tested candidate (2026-10-18):** Only A / Carrier Breakout is active; Nix/Tick appearances are selected, but their full expressive sprite/animation families and runtime cast integration are not built. B/Relay Raiders, C/Orbital Breakout and D/Eclipse Rescue are deferred. The playable Carrier web candidate is SHA256 `F4863DC5A87D6B46A8A1AFDB702C264F432196B851B61B828946DB8AB75A0423`. It passes 44 unit tests and both-phone bundled gameplay/visual checks. Independent final captures at 393×852 safe59/34 and 412×915 safe32/24 preserve the approved A art, continuous safe-edge starfield, aligned 125×17u paddle and clean settled results, with zero page errors. Public-input assisted deterministic simulated wins record 82.3s iPhone / 45.2s Android of game clock; these do not establish human balance or physical-device performance. Evidence: `out/carrier-playable-final/report.json` and `out/carrier-visual-final/REVIEW.md`. The owner has requested an APK; packaging/native CI and delivery remain pending. No APK pass is claimed. EA839F00… remains historical accepted baseline evidence; the older A/B Canvas tranche remains asset-only history.

**APK checkpoint authorization (2026-10-18):** The owner explicitly requests the APK. This authorizes the necessary checkpoint commit/push and CI on `codex/carrier-mobile-preview` in the existing isolated `breaker-mobile-preview` worktree, using the exact frozen Carrier/current Vault sources and native immersive fix. Primary `codex/phase1-kit` is preserved. No merge to `main` or pending Nix/Tick companion-family admission is authorized. APK/native CI remains pending; the earlier screenshot-approval notes do not block this specific APK checkpoint.

**Native lifecycle follow-up:** Run39126881472 reaches recreated-menu after native Carrier/Vault checks, then exposes preserved-window focus without focus on the new WebView. A posted local-page-finished step reapplies fullscreen, native view focus and insets after attachment. It does not alter either frozen HTML payload, inject JavaScript focus or weaken the native test. Fresh CI verification is pending; see `docs/MOBILE_PREVIEW.md`.

Run39127870146 confirms that native/document focus correction. Its next failure is a retained128px native content fit under a correctly focused full-screen hidden-bar Android15 window. The API35-only compatibility layout flags bypass that retained default fitter while preserving controller-driven visibility, native safe insets and every geometry assertion; this still requires fresh CI. The test now logs ancestor geometry on each atomic snapshot for direct diagnosis.


**Historical A/B asset milestone (2026-10-18):** real independent PNG parts and the isolated Canvas motion assembly are complete for the approved A/B left playfields. Final proof is under `out/space-assets-ab/final/`: `A-ios-reference.png`, `A-android-reference.png`, `B-ios-reference.png`, `B-android-reference.png`, `A-motion.gif`, `B-motion.gif` and `asset-report.json`. Actual 393×852/412×915 images and sampled launch/release/boarding/iris sequences pass independent visual review; all four capture runs report zero page errors, real alpha/metadata checks and approximately 126 CSS paddle reserve. A has five shallow captive windows; B has four large worker pods. This asset-only milestone contains no companions, pilots or portraits and predates the latest Nix/Tick selection. These are asset-motion proofs with a placement ball, not new gameplay: runtime admission/WebP sizing, actual-alpha collision alignment, input/combat/rescue/power rules, full playable phone runs, memory/performance and new APK checks remain. The proof milestone retains EA839F00… as its gameplay baseline; it does not cover later Carrier integration. Reproduction and limits: `art/space/ASSETS_AB.md`; inventory/contracts: `design/phase1/space-assets-ab-spec.md` and `space-assets-ab.json`.
This document is the "how it is built" reference. For current status and the task list, see `01-status-and-next-steps.md`. For tools, connections, skills, memory and UX rules, see `03-environment-skills-ux.md`.

### 1. Aim and goal

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

### 2. Runtime architecture

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

#### Key conventions

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

#### Level 1: Invasion (`src/invasion.js`)

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

#### Level 2: The Vault (`src/vault.js`)

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

#### Prince Kit

- `art/kit.py` builds selected Knight 2 from `kk_Knight.glb`: continuous cheek/jaw skin, open silver helmet, cobalt costume, broad shield fitted behind the hand and a surface-fitted face rig.
- 100 frames across Idle, Focus, Grin, Shock, Worried, Cheer, Hurt and Laugh. 168 × 168 RGBA, 56-unit cell, roughly 42-unit character, feet margin 4, 14 fps. Shock/Hurt hold their final frame; the other clips loop.
- `tools/pack_art.py` validates clips against `assets/kit/meta.json` and packs `ART.kit`, including eight 288-pixel portraits in `faces` (columns match the animation row indices). `drawKit()` selects body frames; `drawKitFace()` selects portraits.
- Selected UI A is a 52 CSS pixel left face orb with circular charge. A full charge opens one 12-second expressive body window, fitted within the same corner footprint. A later cast can reopen a receded body; an active window does not continually refresh. Receding consumes no unused charge. Kit's presentation clock also runs during the paused first-use lesson.
- Vault reserves the existing 12-brick charge for Ward. During the marked warning, a deliberate orb tap starts a 0.18-second shield transfer and spends once; protection lasts for the volley, not the 12-second character display. Invasion retains centre-return Titan; its orb gives the corresponding hint. Hero levels, store and chapter progression are still plans.
- The native input layer owns paddle and Kit pointer IDs independently: crossing drags, out-and-back gestures and cancellation cannot cast, and a second-finger orb tap preserves the paddle drag. Orb and complete grip envelope have 8 CSS pixel separation on both requested phone sizes.
- Source proofs, eight portraits, a rendered turnaround and an animated preview are documented in `design/phase1/01-kit-character.md` and its manifest. Rejected creature production is archived outside active assets in ignored `out/rejected-cast-20261018/`.

### 3. Art pipeline (Blender, `art/`)

**Setup:**
- `python3 -m pip install bpy==5.2.2 pillow numpy`, which needs Python 3.13 and runs headless. The previous Python 3.11 instruction was incompatible with this pinned release.
- `art/princess.py` resolves its output directory to an absolute path before passing it to Blender, so relative command-line outputs stay inside the caller's working directory on Windows.
- Cycles on CPU. Set threads to 2 if running two jobs in parallel on 4 cores.
- Colour management: AgX, look "Medium High Contrast". Orthographic camera; key area light top-left.

#### Commands

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

#### Output conventions

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

#### Character rules

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

#### Before committing renders

Strip PNG text metadata, because Blender embeds the source .blend path:

```
python3 -c "import glob;from PIL import Image;[Image.open(f).save(f) for f in glob.glob('assets/**/*.png',recursive=True)]"
```

Then run `pack_art.py` and the build again.

### 4. Build, test, publish

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


---

# Part G: Environment, connections, skills, memory, UI/UX rules

*Source: `docs/handoff/03-environment-skills-ux.md`*

## BREACH: environment, connections, skills, memory, UI/UX rules

**Latest selection and tested candidate (2026-10-18):** Only A / Carrier Breakout is active; Nix/Tick appearances are selected, but their full expressive sprite/animation families and runtime cast integration are not built. B/Relay Raiders, C/Orbital Breakout and D/Eclipse Rescue are deferred. The playable Carrier web candidate is SHA256 `F4863DC5A87D6B46A8A1AFDB702C264F432196B851B61B828946DB8AB75A0423`. It passes 44 unit tests and both-phone bundled gameplay/visual checks. Independent final captures at 393×852 safe59/34 and 412×915 safe32/24 preserve the approved A art, continuous safe-edge starfield, aligned 125×17u paddle and clean settled results, with zero page errors. Public-input assisted deterministic simulated wins record 82.3s iPhone / 45.2s Android of game clock; these do not establish human balance or physical-device performance. Evidence: `out/carrier-playable-final/report.json` and `out/carrier-visual-final/REVIEW.md`. The owner has requested an APK; packaging/native CI and delivery remain pending. No APK pass is claimed. EA839F00… remains historical accepted baseline evidence; the older A/B Canvas tranche remains asset-only history.

**APK checkpoint authorization (2026-10-18):** The owner explicitly requests the APK. This authorizes the necessary checkpoint commit/push and CI on `codex/carrier-mobile-preview` in the existing isolated `breaker-mobile-preview` worktree, using the exact frozen Carrier/current Vault sources and native immersive fix. Primary `codex/phase1-kit` is preserved. No merge to `main` or pending Nix/Tick companion-family admission is authorized. APK/native CI remains pending; the earlier screenshot-approval notes do not block this specific APK checkpoint.

**Native lifecycle follow-up:** Run39126881472 verifies startup and Carrier/Vault native controls but fails recreated WebView focus. A posted page-finished fullscreen/focus/inset reapplication addresses the preserved-window case; source F4863DC5 and offline4D5D7B5E remain unchanged. A fresh native pass remains required before APK delivery.

Run39127870146 passes recreated native/document focus but shows a separate128px content-fit offset with hidden bars. An Android15-only public layout compatibility policy addresses preserved-decor fitting; native ancestor diagnostics were added without weakening fullscreen checks. Gameplay hashes remain frozen and APK delivery still waits for complete CI success.

**Current production scope (2026-10-18):** Carrier A is a playable tested web candidate, using the reviewed hull/hangar, cannons, three fighters, cyan/rose panel crates, five shallow captive windows, flat paddle, ball and Laser/Split/Shield payloads. The 125×17u Carrier paddle and 7.5r ordinary / 10r TITAN ball are verified; Vault retains 70×12u/default6r and exclusive Kit use. The final safe-inset starfield and results-effect repairs pass independent phone review. APK packaging/native CI is in progress, not delivered. Nix/Tick full families and live roles remain pending. B/C/D and Brum/Vesper production are deferred; their concept/source-proof history is preserved.

**Historical A/B asset milestone (2026-10-18):** real independent PNG parts and the isolated Canvas motion assembly are complete for the approved A/B left playfields. Final proof is under `out/space-assets-ab/final/`: `A-ios-reference.png`, `A-android-reference.png`, `B-ios-reference.png`, `B-android-reference.png`, `A-motion.gif`, `B-motion.gif` and `asset-report.json`. Actual 393×852/412×915 images and sampled launch/release/boarding/iris sequences pass independent visual review; all four capture runs report zero page errors, real alpha/metadata checks and approximately 126 CSS paddle reserve. A has five shallow captive windows; B has four large worker pods. This asset-only milestone contains no companions, pilots or portraits and predates the latest Nix/Tick selection. These are asset-motion proofs with a placement ball, not new gameplay: runtime admission/WebP sizing, actual-alpha collision alignment, input/combat/rescue/power rules, full playable phone runs, memory/performance and new APK checks remain. The proof milestone retains EA839F00… as its gameplay baseline; it does not cover later Carrier integration. Reproduction and limits: `art/space/ASSETS_AB.md`; inventory/contracts: `design/phase1/space-assets-ab-spec.md` and `space-assets-ab.json`.

This document covers where everything lives and how the work has been done. Any new session, from any assistant, should read all three handoff docs:

- `01-status-and-next-steps.md`: what is done, what is in progress, and the TODO list with the agreed designs;
- `02-architecture-and-pipeline.md`: code architecture, art pipeline, build, test, publish;
- this document.

**Habit (owner's request, 2026-10-18):** keep these three documents current. Update them at the end of every work session, or whenever something meaningful lands, so another session or tool can take over at any time.

### 1. Owner and working agreement

- **Owner:** mykee (GitHub `mahikshith`, mahikshith97@gmail.com).
- **Commits:**
  - author and committer must be exactly `mahikshith <mahikshith97@gmail.com>`;
  - no AI or assistant attribution anywhere (commit trailers, code, docs, README);
  - never ask for, or paste, the owner's token.
- **Show drafts as you go.** The owner wants to see draft images whenever a piece is finished, especially UX screens, characters and assets. Post screenshots or sheets for iOS and Android sizes.
- **Product feedback rules:** premium, inventive, urgent, addictive; never "vibe-coded"; expressions must say a lot; not too much yellow; keep the playful font and colours.
- **Scope:** Phase 1 is approved. EA839F00… is the last accepted/tested mixed Vault, Ward/venom/tunnel, capture/cast and compact mobile baseline; Kit remains a face-only Vault control and is absent from space. Current work is only A / Carrier Breakout with its selected Nix/Tick appearances. Character full sprite/animation families are not built; B/C/D are deferred. Preserve actual source art quality, the low paddle/reaction lane and safe areas while validating Carrier physics and both-phone gameplay. Existing A/B asset-motion proofs do not establish a new encounter/APK result. Physical-device/Safari feel and human balance remain unchecked. Parallel work uses separate ownership and independent review; new commit/push still needs owner screenshot OK.
- **Work style:** the owner explicitly requests multiple parallel helpers with separate file ownership and independent review. Show progress with images. Parallel preparation must not bypass the concept-pick or commit/push approval gates.

### 2. Where things live (connections and locations)

| What | Where |
|---|---|
| Source repository | https://github.com/mahikshith/breaker (`main` is stable; `wip/*` branches hold in-progress work). Pushed through the Claude GitHub App installed on the repo (installed 2026-10-17); any tool with push access can continue. |
| Playable build (current host) | claude.ai Artifact https://claude.ai/artifact/63xdvoxT6HPvo7rU8buR9s, published from `dist/breach-artifact.html`. Only the owner's Claude account can update it. Another tool should host `dist/breach.html` elsewhere (GitHub Pages, Netlify, itch.io…). |
| Project shared folder (Claude Projects only) | `/mnt/project-files/breaker/`: |
| | • `GAME_PLAN.md`, the original design plan, also copied to `docs/GAME_PLAN.md`; |
| | • `characters/`, character sheets and GIFs shown to the owner (snake-v2-sheet, princess-v2-sheet, robot-expressions-ingame…); |
| | • `playtest/`, playtest screenshots (v2 iOS and Android); |
| | • `lookdev/`, Blender lookdev renders: `vault-top-down.png` is the "shinier" reference, plus `vault-side-view.png`; |
| | • `drafts/`, the first screen drafts. |
| | The key reference images are copied into the repo at `docs/reference/` and `docs/drafts/` so other tools can see them. |
| Story and next-level plan | `docs/STORY_PLAN.md` in the repo. The live, editable version is a Claude Doc at https://claude.ai/code/artifact/5278a4c8-b669-4235-972f-7814c32382d9 (owner's account). A copy is in `/mnt/project-files/breaker/plan/`. |
| ChatGPT design partner | Brief: `docs/handoff/04-chatgpt-design-brief.md`. Steering prompts: `docs/handoff/05-chatgpt-steering-prompts.md`. Art scripts bundle: `docs/BREACH-blender-scripts.md`. Single upload file: `docs/BREACH-ChatGPT-handoff.md`, which concatenates the brief, `STORY_PLAN.md`, `GAME_PLAN.md`, docs 01–03 and a file map. Regenerate it after editing any of those: `python3 tools/make_handoff.py`. |
| Game-dev skills | In the repo at `skills/gamedev/` and `skills/ponytail/` (also `/mnt/project-files/skills/`). `AGENTS.md` says which skill to read for which kind of work. |
| Assistant memory (Claude Projects) | `/tmp/claude/memory/team/silo/MEMORY.md` (index) and `breaker-project.md` (project facts, rules, art direction). Their content is summarised in this document. |
| Third-party assets | KayKit Adventurers (CC0) GLB models in `assets/models/`. Fonts: Google Fonts Lilita One and Rubik (OFL). Everything else is original Blender renders or code. |
| Network notes | npm and raw.githubusercontent.com were reachable from the build container; many asset websites were blocked, which is why the art is rendered rather than downloaded. |

### 3. Tools and skills used

#### Tools

| Tool | Version / use |
|---|---|
| Node | 22, plus esbuild 0.28 (bundler) and planck 1.5 (Box2D debris physics) |
| Python | 3.13 for bpy 5.2.2 (Blender as a Python module, Cycles CPU), Pillow and numpy. Python 3.11 cannot install the pinned bpy release. |
| Playwright + Chromium | Automated playtests and screenshots at phone sizes |
| git / GitHub | Version control. Commits use the owner's identity. |
| claude.ai Artifact | Hosting the playable build for the owner |

#### Local Windows setup (2026-10-18)

- Fresh checkout: `C:\Users\mahik\Music\Breach\breaker`, starting at `9c74978`, branch `codex/phase1-kit`. The initial checkout is preserved beside it as `breaker-initial-clone`.
- Git 2.55.0, Node 22.23.3 and Python 3.11.16 are installed. The existing Node 24 and other Python versions remain available.
- Art uses a separate Python 3.13.13 environment based on the installed Blender 5.2.2 runtime. bpy 5.2.2 requires Python 3.13 ([package metadata](https://pypi.org/project/bpy/5.2.2/)); Python 3.11 remains available for other tooling.
- Playwright and Chromium are installed outside the repo. No game dependencies were added or changed.
- Planck 1.5.0 declares Node >=24. Node 22 emits an engine warning, but the build, all five unit tests, and the baseline layout/polish checks on both phone sizes pass. Keep this warning visible when diagnosing future Node failures.

For a PowerShell session using the installed tools:

```powershell
$taskTools = Join-Path $env:LOCALAPPDATA 'Programs\breach-tools'
$env:Path = (Join-Path $taskTools 'node-v22.23.3-win-x64') + ';' + $env:Path
Set-Alias python3 (Join-Path $taskTools 'python313\Scripts\python.exe')
$env:PW_MODULE = ([Uri](Join-Path $taskTools 'playtest\node_modules\playwright\index.mjs')).AbsoluteUri
$env:PYTHONUTF8 = '1'
```

`PYTHONUTF8` lets the handoff generator read and write the Unicode Markdown correctly on Windows. Baseline screenshots are under `out/baseline/`.

#### Game-dev skills

These skill guides were saved in the project at `/mnt/project-files/skills/gamedev/`. They are plain Markdown and can be pasted into any assistant.

- **Used heavily:** `game-ui-ux`, `game-feel` (juice, hit-stop, shake, feedback), `input-systems`, `physics-tuning`, `level-design`, `create-game-assets` (art direction brief, asset manifest, preview sheets), `audio-design`, `prototype-fast`, `performance-optimization`.
- **Available but not used** (the stack is plain Canvas 2D): `phaser-core`, `phaser-arcade-physics`, `pixijs-rendering`, `shader-programming`, `procedural-gen`, `puzzle`.

**Ponytail** (`/mnt/project-files/skills/ponytail/`) is a lean-code guide: plain modules, no framework unless needed. That is why the game is vanilla JS and Canvas.

### 4. UI/UX layout and rules followed

#### Screen layout (portrait, world 360 units wide)

```
┌──────────────────────────────┐  ← notch / Dynamic Island: scene art continues underneath (drawTopInset)
│ [II]  LEVEL METER        SCORE│  slim bar right under the status bar/notch: pause, level meter, score; the playfield is lifted (LIFT=34) to start just below it
│                    COMBO ×n   │
│   ┌──────────────────────┐   │
│   │   PLAYFIELD (bricks, │   │  Invasion: formation + mothership; Vault: tower, cage, serpent
│   │   characters, ball)  │   │
│   └──────────────────────┘   │
│        ═══ PADDLE ═══         │  paddle raised to H - clamp(0.25H,150,210): never under the thumb
│  ~ shield line ~ drain line ~ │
├──────────────────────────────┤  control deck (dark panel): drag here; track + grip shows paddle position
│   ─────────[ grip ]───────    │
│ ●●●  [FIRE][LASER]   AIM ▮▮▯ │  lives, active power timers, AIM pips
└──────────────────────────────┘  ← home indicator: scene extends underneath
```

#### Interaction and UX rules

- **Movement:** relative drag anywhere (gain 1.15). The finger never needs to touch the paddle or cover the ball.
- **Serve:** "Slide to aim · lift to launch", with a dotted predicted path that shows the first bounces.
- **Focus aim:**
  - holding the thumb still when a ball lands catches it, if there is an AIM pip;
  - "CATCH READY" brackets show that it is armed;
  - time slows to 0.25×; slide to aim, lift to fire; there is a 1.6 s limit, shown as a ring;
  - a coach bubble teaches it until it has been used 3 times.
- **Titan core:** a gem in the paddle centre fills as you break bricks. When full it blazes, and a dead-centre hit makes a TITAN ball.
- **Power-up capsules:** glossy pills with labels. A bad power-up (TINY) has a flashing red outline.
- **Feedback:** every hit gives sound, a small shake and particles. Big moments add hit-stop, haptics, slow motion and big text pops (BREACH!, TITAN!, FRENZY!).
- **Danger:**
  - a red pulsing vignette and heartbeat sound as the serpent closes in or the formation nears the line;
  - the HUD meter turns from green to amber to red.
- **Clarity:**
  - single broken bricks crack and fade in about 0.4 s;
  - only big crashes leave physics debris, so nothing is mistaken for the ball;
  - backgrounds stay calm and dark, because the owner found the Invasion hangar too flashy.
- **Edge to edge:** the scene art fills behind the status bar and home indicator. UI never sits inside the insets. The playfield starts directly under the slim HUD bar, with no dead band. Backgrounds must never outshine the foreground.
- **Safe areas and inputs:** safe areas respected; 44 pt minimum touch targets; nothing interactive in the top corners except pause.
- **Menu:**
  - a BREACH logo (gradient Lilita One with a thick outline) over floating glossy bricks;
  - two level cards with live previews of the level, a character peeking out, star ratings and number badges;
  - a sound toggle.
- **Results card:** title, stars that pop in with sound, score lines, and Retry/Next or Menu/Try again buttons.
- **Continue card (to build):** reason for the loss, a countdown ring, "▶ Watch ad · Continue", "Unlock full game · $2.99", and "No thanks". See doc 01, item 4.

#### Typography and colour

- **Fonts:**
  - Lilita One for all game text, drawn via `text()` with a dark outline (0.16 × size) and drop shadow;
  - Rubik 600 for the score.
- **Palette:** the full table is in doc 01, section 4.
  - Backgrounds are deep navy and indigo (`#0a0c18` to `#22284a`).
  - Accents per level: Invasion pink `#ff5d8f`, Vault gold `#f4c542`.
  - AIM is lilac `#e3b6ff`, danger is `#ff4d5e`, success is `#7bd88f`.


---

# Part H: Repository file map

These are tracked and non-ignored working files, except individual render frames, which are counted instead:

```
assets/princess: 110 PNG renders
assets/kit: 111 PNG renders
assets/snake: 26 PNG renders
assets/snake-jade: 26 PNG renders
assets/vault: 53 PNG renders
assets/invasion: 78 PNG renders

.github/workflows/mobile-preview.yml
.gitignore
AGENTS.md
README.md
android/.gitignore
android/app/build.gradle
android/app/src/androidTest/java/com/mahikshith/breach/preview/MobileSmokeTest.java
android/app/src/main/AndroidManifest.xml
android/app/src/main/java/com/mahikshith/breach/preview/MainActivity.java
android/app/src/main/res/drawable/kit_face.png
android/build.gradle
android/gradle.properties
android/settings.gradle
art/char_preview.py
art/invasion_post.py
art/kit.py
art/kit_cast.py
art/princess.py
art/render_invasion_assets.py
art/render_vault_assets.py
art/snake.py
art/vault-grid.json
art/vault_post.py
art/vault_scene.py
art/vault_side.py
art/vault_tower.py
assets/fonts/LilitaOne-OFL.txt
assets/fonts/LilitaOne-Regular.ttf
assets/fonts/Rubik-OFL.txt
assets/fonts/Rubik.ttf
assets/invasion/atlas.json
assets/invasion/plate.jpg
assets/kit-cast/meta.json
assets/kit/meta.json
assets/kit/preview.gif
assets/models/kk_Knight.glb
assets/models/kk_Mage.glb
assets/models/kk_Rogue.glb
assets/previews/Mage.png
assets/previews/Rogue.png
assets/previews/mage_rogue.png
assets/previews/rogue_tex.png
assets/snake-jade/README.md
assets/snake-jade/meta.json
assets/snake/meta.json
assets/space-a/background.png
assets/space-a/brick_cyan.png
assets/space-a/brick_pink.png
assets/space-a/cannon_barrel.png
assets/space-a/carrier_hull.png
assets/space-a/common-panels-manifest.json
assets/space-a/door_left.png
assets/space-a/door_right.png
assets/space-a/doors.png
assets/space-a/fighter.png
assets/space-a/paddle.png
assets/space-a/source-crops/brick_cyan.png
assets/space-a/source-crops/brick_pink.png
assets/space-a/source-crops/paddle.png
assets/space-a/thruster.png
assets/space-a/worker.png
assets/space-common/ball.png
assets/space-common/brick_armour.png
assets/space-common/brick_crew_lock.png
assets/space-common/brick_cyan.png
assets/space-common/brick_pink.png
assets/space-common/brick_violet.png
assets/space-common/capsule_laser.png
assets/space-common/capsule_shield.png
assets/space-common/capsule_split.png
assets/space-common/manifest.json
assets/space-common/paddle.png
assets/space-common/source-crops/ball.png
assets/space-common/source-crops/brick_armour.png
assets/space-common/source-crops/brick_crew_lock.png
assets/space-common/source-crops/brick_cyan.png
assets/space-common/source-crops/brick_pink.png
assets/space-common/source-crops/brick_violet.png
assets/space-common/source-crops/capsule_laser.png
assets/space-common/source-crops/capsule_shield.png
assets/space-common/source-crops/capsule_split.png
assets/space-common/source-crops/paddle.png
assets/vault/atlas.json
assets/vault/plate.jpg
design/phase1/00-quality-target.md
design/phase1/01-kit-character.md
design/phase1/02-menagerie-cast.md
design/phase1/03-cast-restart.md
design/phase1/img/01-kit-v2-1.png
design/phase1/img/01-kit-v2-2.png
design/phase1/img/01-kit-v2-3.png
design/phase1/img/cast-v2-anatomy-a.png
design/phase1/img/cast-v2-anatomy-b.png
design/phase1/img/kit-ability-ward-left.png
design/phase1/img/kit-ability-ward-right.png
design/phase1/img/level-layout-a.png
design/phase1/img/level-layout-b.png
design/phase1/img/level-layout-mixed.png
design/phase1/img/level-layout-v2-a.png
design/phase1/img/level-layout-v2-b.png
design/phase1/img/serpent-entry-native.gif
design/phase1/img/venom-spray-ward-preview.gif
design/phase1/kit-ability-options.md
design/phase1/kit-asset-manifest.json
design/phase1/level-layout-options.md
design/phase1/snake-entrance.md
design/phase1/space-assets-ab.json
design/phase1/venom-options.md
docs/BREACH-ChatGPT-handoff.md
docs/BREACH-blender-scripts.md
docs/GAME_PLAN.md
docs/MOBILE_PREVIEW.md
docs/STORY_PLAN.md
docs/drafts/breach.png
docs/drafts/forge.png
docs/drafts/rescue.png
docs/drafts/results.png
docs/drafts/sanctuary.png
docs/drafts/title.png
docs/handoff/01-status-and-next-steps.md
docs/handoff/02-architecture-and-pipeline.md
docs/handoff/03-environment-skills-ux.md
docs/handoff/04-chatgpt-design-brief.md
docs/handoff/05-chatgpt-steering-prompts.md
docs/reference/invasion-v2-android.png
docs/reference/robot-expressions-ingame.png
docs/reference/snake-v2-sheet.png
docs/reference/vault-top-down.png
docs/reference/vault-v2-android.png
docs/screens/01-menu.png
docs/screens/03-invasion-multiball.png
docs/screens/04-invasion-mothership.png
docs/screens/07-vault-focus-aim.png
docs/screens/08-vault-breach.png
docs/screens/10-vault-results.png
index.html
package-lock.json
package.json
skills/gamedev/LICENSE
skills/gamedev/NOTICE
skills/gamedev/README.md
skills/gamedev/audio-design/SKILL.md
skills/gamedev/audio-design/references/adaptive-music.md
skills/gamedev/create-game-assets/SKILL.md
skills/gamedev/create-game-assets/agents/openai.yaml
skills/gamedev/create-game-assets/assets/art-direction-brief.md
skills/gamedev/create-game-assets/assets/asset-manifest.json
skills/gamedev/create-game-assets/references/art-direction.md
skills/gamedev/create-game-assets/references/provenance.md
skills/gamedev/create-game-assets/references/raster-pipeline.md
skills/gamedev/create-game-assets/references/three-d-pipeline.md
skills/gamedev/create-game-assets/scripts/asset_report.py
skills/gamedev/create-game-assets/scripts/build_preview_sheet.py
skills/gamedev/create-game-assets/scripts/requirements.txt
skills/gamedev/game-feel/SKILL.md
skills/gamedev/game-feel/references/feedback-recipes.md
skills/gamedev/game-ui-ux/SKILL.md
skills/gamedev/game-ui-ux/references/layout-and-flow.md
skills/gamedev/input-systems/SKILL.md
skills/gamedev/input-systems/references/buffering-and-accessibility.md
skills/gamedev/level-design/SKILL.md
skills/gamedev/level-design/references/pacing-and-flow.md
skills/gamedev/performance-optimization/SKILL.md
skills/gamedev/performance-optimization/references/profiling-and-budgets.md
skills/gamedev/phaser-arcade-physics/SKILL.md
skills/gamedev/phaser-arcade-physics/references/bodies-and-collision.md
skills/gamedev/phaser-core/SKILL.md
skills/gamedev/phaser-core/references/scene-flow.md
skills/gamedev/physics-tuning/SKILL.md
skills/gamedev/physics-tuning/references/timestep-and-ccd.md
skills/gamedev/pixijs-rendering/SKILL.md
skills/gamedev/pixijs-rendering/references/assets-and-display.md
skills/gamedev/procedural-gen/SKILL.md
skills/gamedev/procedural-gen/references/dungeon-generation.md
skills/gamedev/procedural-gen/references/noise.md
skills/gamedev/prototype-fast/SKILL.md
skills/gamedev/puzzle/SKILL.md
skills/gamedev/puzzle/references/board-and-resolution.md
skills/gamedev/shader-programming/SKILL.md
skills/gamedev/shader-programming/references/effects.md
skills/ponytail/LICENSE
skills/ponytail/ponytail/SKILL.md
src/arena.js
src/audio.js
src/carrier-physics.js
src/carrier.js
src/characters.js
src/debris.js
src/gfx.js
src/invasion.js
src/kit.js
src/main.js
src/monetize.js
src/physics.js
src/prefs.js
src/serpent.js
src/vault-art.js
src/vault.js
tests/arena.test.js
tests/carrier-physics.test.js
tests/carrier.test.js
tests/kit.test.js
tests/physics.test.js
tests/serpent.test.js
tools/build.mjs
tools/make_handoff.py
tools/pack_art.py
tools/playtest/capture.mjs
tools/playtest/carrier.mjs
tools/playtest/kit.mjs
tools/playtest/l1.mjs
tools/playtest/layout.mjs
tools/playtest/mobile-ui.mjs
tools/playtest/polish.mjs
tools/playtest/vault-v2.mjs
tools/playtest/vault.mjs
tools/playtest/venom.mjs
tools/prepare-android.mjs
tools/test-android.sh
```
