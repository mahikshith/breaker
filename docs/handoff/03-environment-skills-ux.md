# BREACH: environment, connections, skills, memory, UI/UX rules

**Latest selection and tested candidate (2026-10-18):** Only A / Carrier Breakout is active; Nix/Tick appearances are selected, but their full expressive sprite/animation families and runtime cast integration are not built. B/Relay Raiders, C/Orbital Breakout and D/Eclipse Rescue are deferred. The playable Carrier web candidate is SHA256 `F4863DC5A87D6B46A8A1AFDB702C264F432196B851B61B828946DB8AB75A0423`. It passes 44 unit tests and both-phone bundled gameplay/visual checks. Independent final captures at 393×852 safe59/34 and 412×915 safe32/24 preserve the approved A art, continuous safe-edge starfield, aligned 125×17u paddle and clean settled results, with zero page errors. Public-input assisted deterministic simulated wins record 82.3s iPhone / 45.2s Android of game clock; these do not establish human balance or physical-device performance. Evidence: `out/carrier-playable-final/report.json` and `out/carrier-visual-final/REVIEW.md`. The owner has requested an APK; packaging/native CI and delivery remain pending. No APK pass is claimed. EA839F00… remains historical accepted baseline evidence; the older A/B Canvas tranche remains asset-only history.

**APK checkpoint authorization (2026-10-18):** The owner explicitly requests the APK. This authorizes the necessary checkpoint commit/push and CI on `codex/carrier-mobile-preview` in the existing isolated `breaker-mobile-preview` worktree, using the exact frozen Carrier/current Vault sources and native immersive fix. Primary `codex/phase1-kit` is preserved. No merge to `main` or pending Nix/Tick companion-family admission is authorized. APK/native CI remains pending; the earlier screenshot-approval notes do not block this specific APK checkpoint.

**Native lifecycle follow-up:** Run39126881472 verifies startup and Carrier/Vault native controls but fails recreated WebView focus. A posted page-finished fullscreen/focus/inset reapplication addresses the preserved-window case; source F4863DC5 and offline4D5D7B5E remain unchanged. A fresh native pass remains required before APK delivery.

**Current production scope (2026-10-18):** Carrier A is a playable tested web candidate, using the reviewed hull/hangar, cannons, three fighters, cyan/rose panel crates, five shallow captive windows, flat paddle, ball and Laser/Split/Shield payloads. The 125×17u Carrier paddle and 7.5r ordinary / 10r TITAN ball are verified; Vault retains 70×12u/default6r and exclusive Kit use. The final safe-inset starfield and results-effect repairs pass independent phone review. APK packaging/native CI is in progress, not delivered. Nix/Tick full families and live roles remain pending. B/C/D and Brum/Vesper production are deferred; their concept/source-proof history is preserved.

**Historical A/B asset milestone (2026-10-18):** real independent PNG parts and the isolated Canvas motion assembly are complete for the approved A/B left playfields. Final proof is under `out/space-assets-ab/final/`: `A-ios-reference.png`, `A-android-reference.png`, `B-ios-reference.png`, `B-android-reference.png`, `A-motion.gif`, `B-motion.gif` and `asset-report.json`. Actual 393×852/412×915 images and sampled launch/release/boarding/iris sequences pass independent visual review; all four capture runs report zero page errors, real alpha/metadata checks and approximately 126 CSS paddle reserve. A has five shallow captive windows; B has four large worker pods. This asset-only milestone contains no companions, pilots or portraits and predates the latest Nix/Tick selection. These are asset-motion proofs with a placement ball, not new gameplay: runtime admission/WebP sizing, actual-alpha collision alignment, input/combat/rescue/power rules, full playable phone runs, memory/performance and new APK checks remain. The proof milestone retains EA839F00… as its gameplay baseline; it does not cover later Carrier integration. Reproduction and limits: `art/space/ASSETS_AB.md`; inventory/contracts: `design/phase1/space-assets-ab-spec.md` and `space-assets-ab.json`.

This document covers where everything lives and how the work has been done. Any new session, from any assistant, should read all three handoff docs:

- `01-status-and-next-steps.md`: what is done, what is in progress, and the TODO list with the agreed designs;
- `02-architecture-and-pipeline.md`: code architecture, art pipeline, build, test, publish;
- this document.

**Habit (owner's request, 2026-10-18):** keep these three documents current. Update them at the end of every work session, or whenever something meaningful lands, so another session or tool can take over at any time.

## 1. Owner and working agreement

- **Owner:** mykee (GitHub `mahikshith`, mahikshith97@gmail.com).
- **Commits:**
  - author and committer must be exactly `mahikshith <mahikshith97@gmail.com>`;
  - no AI or assistant attribution anywhere (commit trailers, code, docs, README);
  - never ask for, or paste, the owner's token.
- **Show drafts as you go.** The owner wants to see draft images whenever a piece is finished, especially UX screens, characters and assets. Post screenshots or sheets for iOS and Android sizes.
- **Product feedback rules:** premium, inventive, urgent, addictive; never "vibe-coded"; expressions must say a lot; not too much yellow; keep the playful font and colours.
- **Scope:** Phase 1 is approved. EA839F00… is the last accepted/tested mixed Vault, Ward/venom/tunnel, capture/cast and compact mobile baseline; Kit remains a face-only Vault control and is absent from space. Current work is only A / Carrier Breakout with its selected Nix/Tick appearances. Character full sprite/animation families are not built; B/C/D are deferred. Preserve actual source art quality, the low paddle/reaction lane and safe areas while validating Carrier physics and both-phone gameplay. Existing A/B asset-motion proofs do not establish a new encounter/APK result. Physical-device/Safari feel and human balance remain unchecked. Parallel work uses separate ownership and independent review; new commit/push still needs owner screenshot OK.
- **Work style:** the owner explicitly requests multiple parallel helpers with separate file ownership and independent review. Show progress with images. Parallel preparation must not bypass the concept-pick or commit/push approval gates.

## 2. Where things live (connections and locations)

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

## 3. Tools and skills used

### Tools

| Tool | Version / use |
|---|---|
| Node | 22, plus esbuild 0.28 (bundler) and planck 1.5 (Box2D debris physics) |
| Python | 3.13 for bpy 5.2.2 (Blender as a Python module, Cycles CPU), Pillow and numpy. Python 3.11 cannot install the pinned bpy release. |
| Playwright + Chromium | Automated playtests and screenshots at phone sizes |
| git / GitHub | Version control. Commits use the owner's identity. |
| claude.ai Artifact | Hosting the playable build for the owner |

### Local Windows setup (2026-10-18)

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

### Game-dev skills

These skill guides were saved in the project at `/mnt/project-files/skills/gamedev/`. They are plain Markdown and can be pasted into any assistant.

- **Used heavily:** `game-ui-ux`, `game-feel` (juice, hit-stop, shake, feedback), `input-systems`, `physics-tuning`, `level-design`, `create-game-assets` (art direction brief, asset manifest, preview sheets), `audio-design`, `prototype-fast`, `performance-optimization`.
- **Available but not used** (the stack is plain Canvas 2D): `phaser-core`, `phaser-arcade-physics`, `pixijs-rendering`, `shader-programming`, `procedural-gen`, `puzzle`.

**Ponytail** (`/mnt/project-files/skills/ponytail/`) is a lean-code guide: plain modules, no framework unless needed. That is why the game is vanilla JS and Canvas.

## 4. UI/UX layout and rules followed

### Screen layout (portrait, world 360 units wide)

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

### Interaction and UX rules

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

### Typography and colour

- **Fonts:**
  - Lilita One for all game text, drawn via `text()` with a dark outline (0.16 × size) and drop shadow;
  - Rubik 600 for the score.
- **Palette:** the full table is in doc 01, section 4.
  - Backgrounds are deep navy and indigo (`#0a0c18` to `#22284a`).
  - Accents per level: Invasion pink `#ff5d8f`, Vault gold `#f4c542`.
  - AIM is lilac `#e3b6ff`, danger is `#ff4d5e`, success is `#7bd88f`.
