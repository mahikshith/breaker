# Instructions for coding agents (Codex and others)

BREACH is a premium portrait brick breaker for iOS and Android. It is plain JS on Canvas 2D, bundled into one HTML file, with art pre-rendered in Blender 5.2.

## Read first, in this order

Current state (2026-10-24): 12 chapters are built (nine in the menu behind a key-art home page) on branch `codex/castle-chapters`, which is Android 0.8-princess-polish (versionCode 8). `main` is untouched: the owner approves every merge. The chapter list, gates and next steps are in doc 01, "Current state".

1. `docs/CONTINUE_HERE.md`: one-page pointer to the current state.
2. `docs/handoff/01-status-and-next-steps.md`: "Current state" (chapters, mechanics, gates, release path, next steps), the owner's rules (section 1) and the progress log.
3. `docs/handoff/02-architecture-and-pipeline.md`: code map, art pipeline, build, tests, physics gates.
4. `docs/handoff/03-environment-skills-ux.md`: tools, locations and UI/UX rules.
5. `docs/BACKLOG.md`: every saved to-do, checked against the code. `design/phase2/*.md`: the level and art plans (Gatehouse and Lumi, Serpent Rivals, Dragon's Hoard, premium pass, new concepts).
6. Per-chapter rules: `docs/MOONCOIL_RELIQUARY.md`, `docs/BRUM_LEVEL_PLAN.md` (Frost Warden), `docs/BELLFORGE_PHYSICS.md`, `docs/TIDEWHEEL_PHYSICS.md`, `docs/FANTASY_REFINEMENT.md` (Vault and keep refinements), `docs/SPACE_COMBAT_HANDOFF.md` (Carrier, Circuit, Forge).
7. Art: `prompt-library/` (the owner's copy-paste prompts for Copilot), `docs/ARTWORK_LIBRARY.md` and `artwork-library/` (preserved originals; run `python tools/archive_artwork.py` after adding artwork), `docs/handoff/04-chatgpt-design-brief.md` (art bible, palette).
8. Story and roadmap: `docs/STORY_PLAN.md`. Only Phase 1 is approved; its chapter map was replaced by the shipped castle chapters, so re-plan before building more of it.
9. Release: `docs/MOBILE_PREVIEW.md` describes the old five-chapter build. The current APK is 0.8-princess-polish (mobile-preview run 40045371055, artifact `BREACH-eleven-chapter-android-28`); owner playtest pending.
10. Starflight (`docs/STARFLIGHT_*.md`, `prototypes/starflight/`) is a separate browser prototype, not in the game or the APK. `docs/NEXT_LEVELS.md` and the other older proposal docs are historical: never treat a proposal or an old test result as a current feature.

## Skills (read the matching SKILL.md before that kind of work)

These are the skill guides used to build the game so far.

| Kind of work | Read |
|---|---|
| Any code change: keep it lean, no frameworks unless needed | `skills/ponytail/ponytail/SKILL.md` |
| Characters, sprites, backgrounds, concept art, Blender renders | `skills/gamedev/create-game-assets/SKILL.md` and its `references/` |
| Juice: hit-stop, shake, tweening, impact feedback | `skills/gamedev/game-feel/SKILL.md` |
| HUD, menus, results, chapter select, safe areas | `skills/gamedev/game-ui-ux/SKILL.md` |
| Touch controls, paddle drag, aim | `skills/gamedev/input-systems/SKILL.md` |
| Stage layouts, pacing, difficulty | `skills/gamedev/level-design/SKILL.md` |
| Ball, debris and collision tuning | `skills/gamedev/physics-tuning/SKILL.md` |
| Sound effects and music | `skills/gamedev/audio-design/SKILL.md` |
| Frame rate and memory | `skills/gamedev/performance-optimization/SKILL.md` |
| Quick experiments | `skills/gamedev/prototype-fast/SKILL.md` |
| Procedural stages (Raid mode, Endless) | `skills/gamedev/procedural-gen/SKILL.md` |
| Shader-style effects | `skills/gamedev/shader-programming/SKILL.md` |
| Serpent and villain behaviour (hunt, lunge, retreat decisions) | `skills/gamedev/game-ai/SKILL.md` and `skills/gamedev/ai-behavior-trees-utility-ai/SKILL.md` |
| Floor climbs, look-ahead, screen shake framing | `skills/gamedev/camera-systems/SKILL.md` |
| Per-floor Continue, save slots, save migration | `skills/gamedev/save-systems/SKILL.md` |
| Run-based modes (Daily Breach, streak meta) | `skills/gamedev/roguelike/SKILL.md` |
| Blender scripting and render QA | `skills/blender/blender-core/SKILL.md` and `skills/blender/blender-asset-qa/SKILL.md` |
| Mobile build, performance, release | `skills/mobile/mobile-game-dev/SKILL.md` |
| Token-saving voice for agent-to-agent work | `skills/caveman/caveman/SKILL.md` (internal only; persisted text stays plain) |

The game does not use Phaser or PixiJS, so skip those two skills unless the owner decides to switch engines.

## Hard rules

- Every commit is authored and committed as `mahikshith <mahikshith97@gmail.com>`. Run `git config user.name mahikshith` and `git config user.email mahikshith97@gmail.com` first.
- No AI or assistant attribution anywhere: no Co-Authored-By trailers, no "Generated with…", no assistant names in commits, code or docs.
- Never ask for, print or store tokens or passwords.
- Work on a branch (`codex/<task>`; the current one is `codex/castle-chapters`, same commit as `codex/overnight`). Merge to `main` only after the owner has seen screenshots and approved.
- Follow the owner's art and UX rules in doc 01, section 1 and doc 04, section 2. In short:
  - premium and never "vibe-coded";
  - minimal yellow;
  - calm, dark backgrounds;
  - expressive faces;
  - glossy rendered look;
  - Lilita One and Rubik fonts.
- Before committing renders, strip PNG metadata (doc 02, section 3). Then run `python3 tools/pack_art.py` (about 4.5 min) and `npm run build`.
- Never hand-edit or hand-merge `src/vault-art.js`. After a git conflict take one side and repack.
- Append new chapters to the end of `LEVELS` in `src/main.js`; save slots never move.
- Look standard: the Gatehouse first-pass render. No bare stroked rings or dots as effects: use `ART.fxKit` gems, chips, sparks and glints.
- Physics is the top concern. Fix a physics bug with a test beside it.

## Commands

- **Setup:** `npm install`; Python 3.13 with `pip install bpy==5.2.2 pillow numpy`. The pinned bpy release requires Python 3.13; Python 3.11 cannot install it.
- **Build:** `npm run build` writes `dist/breach.html` (about 14 MB). Then `node tools/pin-sha.mjs` re-pins `config/mobile-preview.json` and `node tools/prepare-android.mjs` must pass.
- **Art:** see the commands in doc 02, section 3. The scripts are in `art/` (newest: `art/premium`, `art/fx_kit`, `art/rivals`). Blender `bpy` 5.2.2 runs headless. New characters follow `art/princess.py`, which has the face rig. New assets reuse the light and material rig in `art/render_vault_assets.py`.
- **Playtests:**
  - `node tools/playtest/polish.mjs <out> ios|android`;
  - `node tools/playtest/layout.mjs <out>`.

  Check that there are no page errors, then show the owner the screenshots.
- **Physics gates (all must pass before anything ships):**
  - `npm test` (about 694 tests);
  - `npm run audit:physics` (headless bot, idle and ram sweep of every level x difficulty x two phones; zero failures; report in `docs/validation/physics-audit/report.json`);
  - `node tools/playtest/physics-audit-checks.mjs --quick` (seeded Gatehouse checks).
- **CI (owner rule, 2026-10-22):** the mobile workflow is manual only (`workflow_dispatch`); pushes never start it. Run it once per real release candidate, after `npm test`, `npm run build`, the re-pinned SHA in `config/mobile-preview.json` and `node tools/prepare-android.mjs` all pass locally. A CI run should pass, not be used as a test loop.

## After every milestone

- Update the handoff docs, especially the progress log in doc 01.
- After adding artwork, run `python tools/archive_artwork.py` to preserve originals and update the catalogue without overwriting older versions.
- Run `python3 tools/make_handoff.py`.
- Push.
