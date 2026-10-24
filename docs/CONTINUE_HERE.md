# Continue here

Last updated 2026-10-24. Branch `codex/castle-chapters` = Android `0.8-princess-polish` (versionCode 8), APK from mobile-preview run 40045371055 (artifact `BREACH-eleven-chapter-android-28`). Not merged to `main`: the owner approves main merges.

## State in five lines

- 12 chapters are built (`LEVELS` in `src/main.js`; save slots never move): 0 Carrier, 1 Vault, 2 Circuit, 3 Forge, 4 Frost Warden, 5 Mooncoil Reliquary (with a second serpent, Gnash), 6 Bellforge Run, 7 Tidewheel Citadel, 8 Gatehouse Siege, 9 Lumi Breaks Out, 10 Serpent Rivals, 11 Dragon's Hoard (merged). Only the nine princess chapters show in the menu. `?level=N` is 1-based; menu keys 0, - and = start slots 9, 10 and 11.
- Home and chapter map: `src/home.js` (hero from `store/key-art.png` packed by `tools/pack_home_art.py` into `src/home-art.js`). The menu lists the nine princess chapters in story order (`STORY`); the space chapters keep slots 0, 2, 3 and `?level=N`. PLAY starts the first chapter with no star; a chapter opens one past the furthest cleared (seven quick taps on the wordmark, or `?unlock=1`, opens all). No Full screen button in the native app.
- Chapters 6 to 11 run through `src/fantasy/chapter.js`; Ram Ball (`src/fantasy/ram.js`), the power-ready pulse and `src/clearance.js` apply everywhere.
- Gates before anything ships: `npm test` (694 pass), `npm run audit:physics` (444 runs, zero failures), `node tools/playtest/physics-audit-checks.mjs --quick`.
- Ball radius is 7 everywhere (`BALL_R`, `src/fantasy/ram.js`). Added overnight: ball-control tutorial and purpose cards (`src/tutorial.js`, `src/purpose.js`), castle special bricks (`src/castle-specials.js`), villain purpose clocks on Gatehouse, Lumi, Rivals and Hoard plus Bellforge's lift meter (`src/fantasy/purpose.js`), power-ups v2, full-screen princess chapters, fire serpent Gnash (`SERPENT_SKINS`), M365 Yeti with dash and smash, Tidewheel four-stage Siege, audit fixes (`closeNotches`, `GATE_LIFT` 128). Playtests drive the home page.
- Owner direction (2026-10-23 night): quality bar is `store/key-art.png`; villains need a visible purpose like the snakes; reuse archetypes with new skins (`prompt-library/16-brute-reskin.md`); hard but beatable with the right power-ups; subagents on cheaper models; no goose chases.
- Release path: `npm run build` (dist/breach.html, about 14 MB), `node tools/pin-sha.mjs`, `node tools/prepare-android.mjs`, then one manual CI run (`workflow_dispatch` only). The 0.8 APK is built; the next release bumps the version code and name.
- Art: `python3 tools/pack_art.py` (about 4.5 min) builds `src/vault-art.js`; never hand-merge it. Blender bpy 5.2.2 runs headless from `art/`.

## Next

1. Owner playtests the 0.8 APK; tune from feedback.
2. Open polish: check the Tidewheel open gate panel (now parks 128 px up); the Hoard purpose plate is tight beside the loot pill; the Gatehouse floor-1 plate overlaps the parapet art.
3. New villain skins on existing archetypes as art arrives (yeti to bull, bison, ape).
4. Premium art wiring into the earlier levels.
5. Starflight in its own thread later (separate prototype, not in the game).

Pending owner decision: "compress the companions" saves about 2 MB but shifts faces by 4 to 7 out of 255.

## Where to read more

- `docs/handoff/01-status-and-next-steps.md`: full "Current state", owner rules, progress log.
- `docs/handoff/02-architecture-and-pipeline.md` and `03-environment-skills-ux.md`: code, art, build, tests, tools, UX.
- `docs/BACKLOG.md` and `design/phase2/*.md`: plans and to-dos.
- Per-chapter notes: `docs/MOONCOIL_RELIQUARY.md`, `docs/BRUM_LEVEL_PLAN.md`, `docs/BELLFORGE_PHYSICS.md`, `docs/TIDEWHEEL_PHYSICS.md`, `docs/FANTASY_REFINEMENT.md`.
- Older docs (`SPACE_COMBAT_HANDOFF.md`, `MOBILE_PREVIEW.md`, `NEXT_LEVELS.md`, `STARFLIGHT_*.md`) describe the five-chapter space release and the Starflight prototype. They are history for anything castle-related.

## Owner rules

Commits authored and committed as `mahikshith <mahikshith97@gmail.com>`; no AI attribution anywhere in the repo; strip PNG metadata from renders; show screenshots after anything finishes; short single-path instructions; physics first.
