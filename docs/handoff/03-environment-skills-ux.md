# BREACH: environment, connections, skills, memory, UI/UX rules

**Verified APK checkpoint (2026-10-18):** [Carrier mobile preview run 39129140498](https://github.com/mahikshith/breaker/actions/runs/39129140498) passed on native commit `47bc6b3e5a1d4947e4fc6a951ea05a4d18ac6fb8`. [Installable artifact](https://github.com/mahikshith/breaker/actions/runs/39129140498/artifacts/12137681701): `BREACH-Carrier-preview.apk`, 2,431,097 bytes, SHA256 `7F5468197BB6333BF5AACEBE4CF4226048D043634BCA8829B6644042C4F2E10D`. The downloaded APK checksum, embedded offline HTML/preview manifest/fonts/licenses and binary package manifest are verified. CI passes 44 unit tests, source/offline phone regressions, Android compile/lint (0 errors, 9 preview warnings) and the strict offline Android 15 native test including touch, transient bars, pause/resume and recreation. Recreated WebView is at (0, 0) and fills 1080 × 2400; actual success screenshots were inspected. This branch freezes the reviewed F4863DC5 Carrier/current Vault checkpoint; later primary Boarding Raid, Nix/Tick, Relay/Orbital and difficulty work are excluded. Owner physical-phone play/performance remains unverified. See `docs/MOBILE_PREVIEW.md` and local `out/carrier-apk-delivery/39129140498/delivery-verification.json`.

**APK checkpoint authorization (2026-10-18):** The owner requested this APK and authorized its necessary native fixes, checkpoint commits/push and CI on `codex/carrier-mobile-preview` in isolated `breaker-mobile-preview`. That delivery is now verified. Primary `codex/phase1-kit` and `main` stay separate; no primary gameplay, pending design or merge authorization is implied. Historical pending/failure notes below precede successful run 39129140498.

**Native lifecycle follow-up:** Run39126881472 verifies startup and Carrier/Vault native controls but fails recreated WebView focus. A posted page-finished fullscreen/focus/inset reapplication addresses the preserved-window case; source F4863DC5 and offline4D5D7B5E remain unchanged. A fresh native pass remains required before APK delivery.

Run39127870146 passes recreated native/document focus but shows a separate128px content-fit offset with hidden bars. An Android15-only public layout compatibility policy addresses preserved-decor fitting; native ancestor diagnostics were added without weakening fullscreen checks. Gameplay hashes remain frozen and APK delivery still waits for complete CI success.

**Current production scope (2026-10-18):** Carrier A is a playable tested web candidate, using the reviewed hull/hangar, cannons, three fighters, cyan/rose panel crates, five shallow captive windows, flat paddle, ball and Laser/Split/Shield payloads. The 125×17u Carrier paddle and 7.5r ordinary / 10r TITAN ball are verified; Vault retains 70×12u/default6r and exclusive Kit use. The final safe-inset starfield and results-effect repairs pass independent phone review. This frozen APK is verified by run 39129140498; later primary work is excluded. Nix/Tick full families and live roles are excluded from this frozen APK. B/C/D and Brum/Vesper production are deferred; their concept/source-proof history is preserved.

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
