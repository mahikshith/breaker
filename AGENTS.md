# Instructions for coding agents (Codex and others)

BREACH is a premium portrait brick breaker for iOS and Android. It is plain JS on Canvas 2D, bundled into one HTML file, with art pre-rendered in Blender 5.2.

## Read first, in this order

1. `docs/handoff/01-status-and-next-steps.md`: the owner's rules, progress log and TODO.
2. `docs/handoff/02-architecture-and-pipeline.md`: code map, art pipeline, build and test.
3. `docs/handoff/03-environment-skills-ux.md`: tools, locations and UI/UX rules.
4. `docs/STORY_PLAN.md`: the story and the phased roadmap. Phase 1 is approved.
5. `docs/handoff/04-chatgpt-design-brief.md`: the art bible, palette and design deliverable formats.
6. Design deliverables to build, when present: `design/phase1/*.md` and `design/phase1/img/`.
7. Reusable artwork and its preservation rules: `docs/ARTWORK_LIBRARY.md`; permanent originals and catalogue are in `artwork-library/`.

8. Current memory and detailed implementation: `docs/CONTINUE_HERE.md` and `docs/SPACE_COMBAT_HANDOFF.md`.
9. Release status: `docs/MOBILE_PREVIEW.md`; future design proposals: `docs/NEXT_LEVELS.md`. Never treat a proposal or historical test result as a completed current feature.
10. Frost Warden encounter, Yeti role distinction, physics and difficulty: `docs/BRUM_LEVEL_PLAN.md`.
11. New direct-flight experiment: `docs/STARFLIGHT_PROTOTYPE.md`, `docs/STARFLIGHT_COMBAT.md` and `docs/STARFLIGHT_ART.md`. This browser prototype is separate from the five-chapter Android release.
12. Latest campaign-design-first request: `docs/STARFLIGHT_CAMPAIGN.md`. Use the latest combat-first revision: the owner offered rescue/module progression as an example, not a requirement. Proposed authored chapters and equipment systems need their own implementation receipts; the combat prototype does not implement that campaign.
13. Current default flight mission: `docs/STARFLIGHT_MISSION.md`. Gatebreak is a finite encounter with returning enemies, earned weapon capsules, Stormwing and Ricochet. The older repeating lab is preserved at `?lab=1`. This standalone mission is not the complete proposed campaign or part of the Android release.
14. Additional flight power proposals: `docs/STARFLIGHT_POWER_EXPLORATION.md`. Prism Bastion and Comet Loom are production plans, not selectable powers yet.

15. Approved new princess visual references and physical design: `design/phase1/princess-two-levels.md`. Read `docs/BELLFORGE_PHYSICS.md` and `docs/TIDEWHEEL_PHYSICS.md` for the actual standalone browser encounters, current rules and validation limits. Retain the original boards and measure collision against the actual moving assets. These encounters are separate from the released Android package.
16. Latest keep playtest fixes, reactions, powers and original Vault presentation: `docs/FANTASY_REFINEMENT.md`. Its current browser receipts supersede earlier layout/pose checks; the previously delivered APK remains a separate checkpoint.

17. Fresh cross-level physics review: `docs/validation/physics-recheck/`. New sixth browser chapter: `docs/MOONCOIL_RELIQUARY.md` and `docs/validation/mooncoil/`. Mooncoil appends index5; do not confuse this web checkpoint with the earlier five-chapter APK.

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
| Token-saving voice for agent-to-agent work | `skills/caveman/caveman/SKILL.md` (internal only; persisted text stays plain) |

The game does not use Phaser or PixiJS, so skip those two skills unless the owner decides to switch engines.

## Hard rules

- Every commit is authored and committed as `mahikshith <mahikshith97@gmail.com>`. Run `git config user.name mahikshith` and `git config user.email mahikshith97@gmail.com` first.
- No AI or assistant attribution anywhere: no Co-Authored-By trailers, no "Generated with…", no assistant names in commits, code or docs.
- Never ask for, print or store tokens or passwords.
- Work on a branch (`codex/<task>`). Merge to `main` only after the owner has seen screenshots and approved.
- Follow the owner's art and UX rules in doc 01, section 1 and doc 04, section 2. In short:
  - premium and never "vibe-coded";
  - minimal yellow;
  - calm, dark backgrounds;
  - expressive faces;
  - glossy rendered look;
  - Lilita One and Rubik fonts.
- Before committing renders, strip PNG metadata (doc 02, section 3). Then run `python3 tools/pack_art.py` and `npm run build`.

## Commands

- **Setup:** `npm install`; Python 3.13 with `pip install bpy==5.2.2 pillow numpy`. The pinned bpy release requires Python 3.13; Python 3.11 cannot install it.
- **Build:** `npm run build` writes `dist/breach.html`. Run the unit tests with `npm test`.
- **Art:** see the commands in doc 02, section 3. The scripts are in `art/`. New characters follow `art/princess.py`, which has the face rig. New assets reuse the light and material rig in `art/render_vault_assets.py`.
- **Playtests:**
  - `node tools/playtest/polish.mjs <out> ios|android`;
  - `node tools/playtest/layout.mjs <out>`.

  Check that there are no page errors, then show the owner the screenshots.

## After every milestone

- Update the handoff docs, especially the progress log in doc 01.
- After adding artwork, run `python tools/archive_artwork.py` to preserve originals and update the catalogue without overwriting older versions.
- Run `python3 tools/make_handoff.py`.
- Push.
