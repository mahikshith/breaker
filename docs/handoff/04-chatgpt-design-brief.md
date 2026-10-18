# BREACH: design brief for ChatGPT (the design partner)

**Verified APK checkpoint (2026-10-18):** [Carrier mobile preview run 39129140498](https://github.com/mahikshith/breaker/actions/runs/39129140498) passed on native commit `47bc6b3e5a1d4947e4fc6a951ea05a4d18ac6fb8`. [Installable artifact](https://github.com/mahikshith/breaker/actions/runs/39129140498/artifacts/12137681701): `BREACH-Carrier-preview.apk`, 2,431,097 bytes, SHA256 `7F5468197BB6333BF5AACEBE4CF4226048D043634BCA8829B6644042C4F2E10D`. The downloaded APK checksum, embedded offline HTML/preview manifest/fonts/licenses and binary package manifest are verified. CI passes 44 unit tests, source/offline phone regressions, Android compile/lint (0 errors, 9 preview warnings) and the strict offline Android 15 native test including touch, transient bars, pause/resume and recreation. Recreated WebView is at (0, 0) and fills 1080 × 2400; actual success screenshots were inspected. This branch freezes the reviewed F4863DC5 Carrier/current Vault checkpoint; later primary Boarding Raid, Nix/Tick, Relay/Orbital and difficulty work are excluded. Owner physical-phone play/performance remains unverified. See `docs/MOBILE_PREVIEW.md` and local `out/carrier-apk-delivery/39129140498/delivery-verification.json`.

**APK checkpoint authorization (2026-10-18):** The owner requested this APK and authorized its necessary native fixes, checkpoint commits/push and CI on `codex/carrier-mobile-preview` in isolated `breaker-mobile-preview`. That delivery is now verified. Primary `codex/phase1-kit` and `main` stay separate; no primary gameplay, pending design or merge authorization is implied. Historical pending/failure notes below precede successful run 39129140498.

**Current production scope (2026-10-18):** Carrier A is a playable tested web candidate, using the reviewed hull/hangar, cannons, three fighters, cyan/rose panel crates, five shallow captive windows, flat paddle, ball and Laser/Split/Shield payloads. The 125×17u Carrier paddle and 7.5r ordinary / 10r TITAN ball are verified; Vault retains 70×12u/default6r and exclusive Kit use. The final safe-inset starfield and results-effect repairs pass independent phone review. This frozen APK is verified by run 39129140498; later primary work is excluded. Nix/Tick full families and live roles are excluded from this frozen APK. B/C/D and Brum/Vesper production are deferred; their concept/source-proof history is preserved.

**Historical A/B asset milestone (2026-10-18):** real independent PNG parts and the isolated Canvas motion assembly are complete for the approved A/B left playfields. Final proof is under `out/space-assets-ab/final/`: `A-ios-reference.png`, `A-android-reference.png`, `B-ios-reference.png`, `B-android-reference.png`, `A-motion.gif`, `B-motion.gif` and `asset-report.json`. Actual 393×852/412×915 images and sampled launch/release/boarding/iris sequences pass independent visual review; all four capture runs report zero page errors, real alpha/metadata checks and approximately 126 CSS paddle reserve. A has five shallow captive windows; B has four large worker pods. This asset-only milestone contains no companions, pilots or portraits and predates the latest Nix/Tick selection. These are asset-motion proofs with a placement ball, not new gameplay: runtime admission/WebP sizing, actual-alpha collision alignment, input/combat/rescue/power rules, full playable phone runs, memory/performance and new APK checks remain. The proof milestone retains EA839F00… as its gameplay baseline; it does not cover later Carrier integration. Reproduction and limits: `art/space/ASSETS_AB.md`; inventory/contracts: `design/phase1/space-assets-ab-spec.md` and `space-assets-ab.json`.

**Current working agreement (2026-10-18):** Phase 1 design/build and layout-design options for the existing Invasion and Vault levels proceed with parallel helpers and separate file ownership. For each design track, show 2–3 image options and wait for the owner's pick before building. Playtest implemented changes at both phone sizes and show screenshots; wait for the owner's OK before committing or pushing. This agreement supersedes the original role split and sequential-preparation instructions below.

**Who this is for:** ChatGPT (or any assistant) doing the *design* work on BREACH: story scripts, dialogue, character design, concept art, UI/UX mock-ups, level layouts and balance tables.

**Who builds it:** Claude, in the owner's Claude Project, does the *execution*: code, Blender renders, playtests, commits. You hand designs over; Claude turns them into the game.

**Why split it:** the owner (mykee) has a ChatGPT Pro subscription with plenty of capacity. Claude's capacity is better spent building. So you design in depth, and Claude builds exactly what you specify.

---

## 0. How to use this brief (for the owner)

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

## 1. First message to paste into ChatGPT

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

## 2. The owner's rules (non-negotiable)

These come from many rounds of feedback. Breaking any of them means the work gets redone.

### Feel

- **Premium, inventive, urgent, addictive.** Nothing may look "vibe-coded", meaning generic, template-like or default-looking.
- **Expressions must say a lot.** Every character needs big, readable emotions: eyes with lids and brows, and a mouth that changes. No uniform or blank faces.
- **Focus on gameplay.** The background must never outshine the foreground. The owner had us remove dungeon lights, lanterns, torches, bright planets, window bars and hazard stripes because they distracted from play. Backgrounds stay calm, dark and desaturated.
- **Not too much yellow.** Gold and yellow are accents only. The owner rejected a yellow cage chamber and gold cage bars; the cage is now dark iron.

### Look

- **Keep the playful font and colours.** Lilita One for game text, Rubik for numbers.
- **Glossy, shiny, rendered.** Bricks look like glazed ceramic tiles with real reflections. Characters look like glossy vinyl toys.
- **Rejected styles:** pixel art, wisps or ghost blobs, jittery fox characters, ball-chain snake bodies, round "bally" blob heads, and flat vector clip-art.

### Play

- **Readable at a glance on a phone.** Short words, big shapes, 44 pt touch targets.
- **Mobile edge to edge.** The scene fills behind the notch and home bar, but UI never sits inside them. It must not overlap the Android status bar.

### Process

- **Show drafts.** Every finished piece (screen, character, asset) is shown to the owner as an image before it is final.

### Repository rules (only if you ever touch the repo)

- Commits must be authored as `mahikshith <mahikshith97@gmail.com>`.
- No AI attribution anywhere: no "Co-Authored-By", no "Generated with…", no assistant names in files.
- Never ask for, paste or store the owner's tokens.

---

## 3. The game today (what exists)

BREACH plays in portrait. The world is 360 units wide and 640–880 tall depending on the phone. There are two finished levels:

### Level 1, Invasion

Arkanoid crossed with Space Invaders.

- **Formation:** 11 × 9 bricks with glossy toy robots ("Clanks") in 4 colours (white, pink, yellow, blue), each with 7 expressions. The formation marches sideways and down, and the robots shoot back.
- **Boss:** the mothership (Zorvax) is a saucer with an alien face and 5 expressions: smug, angry, hurt, panic, dizzy. It has 36 HP.
- **Lose condition:** if the formation reaches the line, it lands. Robots laugh, a beam fires, and the continue screen appears.
- **Background:** a dark, calm hangar with a dim planet.

### Level 2, The Vault

A rescue race.

- **Setting:** a side-view cutaway tower of glazed bricks. Princess Lumi is caged in a dark stone cell with iron bars.
- **Serpent (Gnash):** chews through bricks toward her, growing longer, wider and faster as it eats.
- **Danger:** a colour meter goes green → amber → red, and the camera zooms toward the cage as danger rises.
- **Lose:** the serpent rears and strikes the cage: "GOT HER!"
- **Win:** the princess runs the breach path, then FRENZY gives 12 balls for 7 s.

### Shared systems

- **Paddle:** a chrome paddle raised above the thumb, with a dark control deck below it to drag on.
- **Catch & aim (Focus):** hold still as the ball lands to catch it; time slows, slide to aim, lift to fire.
- **Titan core:** a gem in the paddle fills as you break bricks. A dead-centre hit then makes a giant piercing ball.
- **Power-ups:** SPLIT ×3, BURST +3, FIRE, WIDE, AIM, LASER (paddle bullets), SHIELD, SLOW, and TINY (bad).
- **Continue screen:** watch an ad to continue, or unlock the full game for $2.99.

**Reference images:** `docs/reference/` (vault-top-down.png is the "shiny" target), `docs/screens/` and `docs/drafts/`. The playable build is shared by the owner.

---

## 4. Art bible (match this exactly)

### Rendering

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

### Character proportions

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

### Palette (hex)

| Use | Colours |
|---|---|
| Backgrounds | deep navy/indigo gradient `#22284A` → `#141831` → `#0A0C18`, vignette, light film grain |
| Vault bricks | sun `#FFC73D`, coral `#FF6F61`, violet `#8F5CF0`, teal `#22C4B0`, blue `#4F9DFF`, gold gem `#F4C542`, granite `#4A4F6E` |
| Invasion rows | `#FF5D8F` `#FF8A3D` `#FFD23F` `#5CCF6A` `#2EC4B6` `#3FA8F5` `#7B6CF6` `#C46BF0`; armour `#8D97B3` |
| Level accents | Invasion pink `#FF5D8F`, Vault gold `#F4C542` |
| UI states | AIM lilac `#E3B6FF` / `#C46BF0`, danger `#FF4D5E`, success `#7BD88F`, combo text `#FFD36B` |
| Power-ups | SPLIT `#5CCF6A`, FIRE `#FF8A3D`, WIDE `#3FA8F5`, AIM `#C46BF0`, BURST `#F7C948`, LASER `#FF4D6D`, SHIELD `#2EC4B6`, SLOW `#7FD6FF`, TINY `#5A5F78` |

New colours must sit inside this family. Give every new colour as a hex value and name where it is used.

### Image prompts (for ChatGPT image generation)

Start every concept-art prompt with this style block so the images stay consistent:

```
Glossy 3D vinyl-toy render, Blender Cycles look, chibi proportions (head ~40% of height), soft warm key
light from the top-left, cool blue rim light from the right, gentle pink bounce from below, clean
reflections, saturated but not neon colours, minimal yellow, plain dark navy background (#141831),
orthographic front view, no text, no watermark.
```

Then describe the subject. For character sheets, ask for "turnaround: front, three-quarter, side, back, same character, same lighting, evenly spaced on one image".

---

## 5. UI/UX bible

### Screen layout (portrait, 360 units wide)

From top to bottom:

1. **Notch / Dynamic Island:** scene art only, no UI.
2. **Slim HUD bar:** pause (top-left), level meter, score (top-right).
3. **Playfield:** starts right under the HUD bar; no dead band.
4. **Paddle:** at `H − clamp(0.25·H, 150, 210)`, kept above the thumb.
5. **Shield line and drain line.**
6. **Control deck:** a dark panel to drag on, with a track and grip showing the paddle position, then lives, power timers and AIM pips.
7. **Home indicator:** scene art only.

Test sizes: iPhone 393 × 852 pt (safe insets 59 top, 34 bottom) and Android 412 × 915 dp (32 top, 24 bottom).

### Text

- Lilita One for all game text, with a dark outline of 0.16 × the font size and a soft drop shadow.
- Rubik 600 for the score and other numbers.
- At most 2–6 words per pop. Big moments get big text: BREACH!, TITAN!, FRENZY!, GOT HER!

### Feedback ("juice")

- Every hit gets a sound, a small shake and particles.
- Big moments add hit-stop, haptics, slow motion and big text.
- Single broken bricks crack and fade in about 0.4 s. Only big crashes leave physics debris.

### Controls

- Relative drag anywhere (gain 1.15). The finger never covers the ball.
- To serve, slide to aim and lift to launch. A dotted path previews the first bounces.

### Accessibility

- 44 pt minimum touch targets.
- Never rely on colour alone. The serpent meter uses colour plus the princess icon's expression.
- Text contrast at least 4.5:1.

### Menus

- **Title:** a BREACH logo in Lilita One with a gradient and thick outline, over floating glossy bricks.
- **Level cards:** a live preview, a character peeking out, stars and a number badge.
- **Results card:** stars pop in with sound, plus Retry/Next.

When you spec a screen, give every element its position and size in world units (x, y, w, h on the 360-wide grid). Also give its font, size, colour hex, its states (normal, pressed, disabled, locked) and its animation (what moves, how far, for how long, and the easing).

---

## 6. Design tasks, in order (Phase 1 of STORY_PLAN.md)

The owner approved Phase 1 with the names Kit, Lumi, Zorvax, Gnash and Brickhaven and the current ads plus $2.99 model. Kit's original courtyard-kid appearance was rejected; the current direction is an underdog knight with a medieval shield. Parallel character and existing-level preparation is approved under the working agreement above; each design and completed implementation still needs the owner's OK.

**Current gate:** A / Carrier Breakout and its Nix/Tick appearances are selected; B/C/D are deferred. The A/B independent PNG/native motion assembly tranche is complete as asset-only history. Build and compare actual Carrier gameplay at both phone sizes against the A board and asset preview, preserving source-quality silhouette, mounts, panel identity, flat low paddle, background and power glyphs. Validate runtime texture sizing, actual-alpha collision/state geometry, ball/paddle physics, rescue/combat/powers and performance before claiming a new playable result. Full expressive Nix/Tick sprite families and runtime cast integration are not built. EA839F00… remains the last accepted/tested baseline until the new candidate passes. Final screenshot OK still precedes commit/push; doc 01 records the live result and remaining work.

### Task 1: Prince Kit character design

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

### Task 2: Prologue script (skippable, about 60 s)

- 5–6 comic panels. For each panel give:
  - shot and camera;
  - characters, pose (a KayKit animation name) and expression;
  - background and lighting;
  - a caption of 12 words or fewer, and speech bubbles of 10 words or fewer;
  - a sound cue and a duration in seconds;
  - a transition into the next panel.
- The story: Kit and Lumi play the bounce game in the palace courtyard at sunset. The court scoffs. The sky goes dark, the Clank toys turn on them, and the mothership's beam takes Lumi. Kit grabs his old paddle.
- End on the first serve of Invasion: the tutorial starts inside the story.

### Task 3: Story beats around the two levels

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

### Task 4: Shine and the results screen

- Spec the new results card: score count-up, stars, Shine earned (1 per 100 points plus a star bonus), and a "chest reveal" moment for the Shine total, slot-machine style but short (1.5 s or less, tap to skip).
- Spec the "next unlock" progress bar that teases the next weapon or skin.
- Include layout, every animation timing, sound cues and both phone sizes.

### Task 5: Chapter select screen

- A vertical map from the Prologue to Chapter 2, with Chapter 3 shown locked as a silhouette.
- Each node shows stars, a best score and a lock state.
- Brickhaven's dark skyline sits at the bottom, ready to light up later (Phase 3).
- Spec it the same way as Task 4.

### Task 6: Zorvax and Gnash voice sheets

- Personality, speech style, and 10 short lines each (taunts, hurt, panic).
- Zorvax is smug and theatrical, secretly lonely (the final-chapter twist), so hint at it once.
- Gnash is hungry and gleeful; it hisses and talks in short words.

---

## 7. Deliverable formats (what Claude needs back)

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

## 8. Tools, connections and where things live

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

## 9. Can ChatGPT drive Blender or the build directly?

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

## 10. If another tool must take over the execution (Codex or another agent)

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

## 11. How BREACH was made (the process to keep following)

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
