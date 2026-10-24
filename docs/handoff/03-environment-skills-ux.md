# BREACH: environment, connections, skills, memory, UI/UX rules

Last checked 2026-10-24. Status and history: doc 01. Code and build: doc 02.

This document covers where everything lives and how the work has been done. Any new session, from any assistant, should read all three handoff docs:

- `01-status-and-next-steps.md`: current state, owner rules, next steps and the progress log;
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
- **Scope:** 12 chapters are built, nine shown in the menu (doc 01, "Current state"). Anything beyond Phase 1 of `docs/STORY_PLAN.md` needs the owner's go-ahead. Kit is the hero of the castle chapters except Lumi Breaks Out, where Lumi holds the paddle.
- **Owner direction (2026-10-23 night):** quality bar is `store/key-art.png`; villains need a visible purpose like the snakes; reuse archetypes with new skins (yeti to bull, bison or ape via `prompt-library/16-brute-reskin.md`; snake to fire serpent); levels hard but beatable with the right power-ups; use subagents on cheaper models; no goose chases.
- **Owner style:** short, single-path instructions; physics first; show screenshots after anything finishes; harder but fair; the owner posts renders back in the project chat and generates art with M365 Copilot from `prompt-library/`.
- **Work style:** the owner explicitly requests multiple parallel helpers with separate file ownership and independent review. Show progress with images. Parallel preparation must not bypass the concept-pick or commit/push approval gates.

## 2. Where things live (connections and locations)

| What | Where |
|---|---|
| Source repository | https://github.com/mahikshith/breaker. `main` is stable and merged only after the owner reviews screenshots; the working branch is `codex/castle-chapters` (Android 0.8-princess-polish; `main` merges need the owner's approval). `codex/wip-lumi-audit` is throwaway and safe to delete. Pushed through the Claude GitHub App installed on the repo (2026-10-17); any tool with push access can continue. |
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
| Prompt library for the owner | `prompt-library/` in the repo (copy at `/mnt/project-files/breaker/prompt-library/`): copy-paste prompts for Copilot art and design. Start at its `README.md`. |
| Backlog and design notes | `docs/BACKLOG.md` (all to-dos), `design/phase2/*.md` (levels, Rivals, Dragon's Hoard, premium pass, new concepts) |
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

### Owner laptop (Windows) setup, 2026-10-18

The Linux cloud session works in `/home/claude/breaker` with Node, Python 3.13 and bpy 5.2.2 headless; no special setup is needed there. The notes below are for the owner's Windows laptop.

- Checkout: `C:\Users\mahik\Music\Breach\breaker` (started at `9c74978`; use the current working branch from doc 01). The initial checkout is preserved beside it as `breaker-initial-clone`.
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

Entry flow: home page (key-art hero, one PLAY button) opens the chapter map (nine princess chapters in story order, stars and locks), then a purpose card, then play; How to play replays the tutorial. No Full screen button in the native app.

```
┌──────────────────────────────┐  ← notch / Dynamic Island: scene art continues underneath
│ [II]  LEVEL METER        SCORE│  slim bar under the status bar: pause, level meter, score (playfield lifted by LIFT=34)
│                    COMBO ×n   │
│   ┌──────────────────────┐   │
│   │   PLAYFIELD (bricks, │   │  castle chapters: windows, serpents, villains; space chapters: hull, panels, fighters
│   │   characters, ball)  │   │
│   └──────────────────────┘   │
│        ═══ PADDLE ═══         │  paddle at about H - 126/scale: above the thumb, no lower deck or track
│  (Kit/Lumi face orb, lower left; lives and power chips)  │
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
- **Face orb and powers:** Kit's face (Lumi's in her chapter) sits in a 52 CSS px orb, lower left. It charges from productive hits, pulses and buzzes when ready (5 s double-beat with halo, then a steady glow), and a deliberate tap opens the power menu or casts. Where a chapter uses the Titan core, a centre return makes a TITAN ball.
- **Ram Ball:** three centre-third paddle hits in a row arm it ("RAM READY"); the next centre hit launches a giant ball that ploughs ordinary bricks. Same in every level.
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
  - Easy, Medium and Hard buttons, then 11 chapter cards (order 0, 2, 3, 1, 4 to 10) with live previews, star ratings and number badges; keys 1 to 9 and 0 start chapters 1 to 10 on desktop;
  - a sound toggle.
- **Results card:** title, stars that pop in with sound, score lines, and Retry/Next or Menu/Try again buttons.
- **Continue card (built):** reason for the loss, a countdown ring, watch ad then continue, unlock the full game, and "No thanks". Ads and purchases are placeholders in `src/monetize.js`. Each level's `continueRun()` undoes its own loss.

### Typography and colour

- **Fonts:**
  - Lilita One for all game text, drawn via `text()` with a dark outline (0.16 × size) and drop shadow;
  - Rubik 600 for the score.
- **Palette:** the full table is in doc 01, section 4.
  - Backgrounds are deep navy and indigo (`#0a0c18` to `#22284a`).
  - Minimal yellow: gold is an accent only. Each chapter has its own accent colour in `LEVELS` (`src/main.js`).
  - AIM is lilac `#e3b6ff`, danger is `#ff4d5e`, success is `#7bd88f`.
