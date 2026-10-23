# Continue here

Last updated 2026-10-22 (night). Branch `codex/castle-chapters`; `main` is untouched until the owner reviews screenshots.

## State in five lines

- 12 chapters are built (`LEVELS` in `src/main.js`; save slots never move): 0 Carrier, 1 Vault, 2 Circuit, 3 Forge, 4 Frost Warden, 5 Mooncoil Reliquary (with a second serpent, Gnash), 6 Bellforge Run, 7 Tidewheel Citadel, 8 Gatehouse Siege, 9 Lumi Breaks Out, 10 Serpent Rivals, 11 Dragon's Hoard (branch `codex/dragons-hoard`). `?level=N` is 1-based; menu keys 0, - and = start slots 9, 10 and 11.
- Chapters 6 to 11 run through `src/fantasy/chapter.js`; Ram Ball (`src/fantasy/ram.js`), the power-ready pulse and `src/clearance.js` apply everywhere.
- Gates before anything ships: `npm test` (506 pass), `npm run audit:physics` (zero failures), `node tools/playtest/physics-audit-checks.mjs --quick`.
- Release path: `npm run build` (dist/breach.html, about 14 MB), `node tools/pin-sha.mjs`, `node tools/prepare-android.mjs`, then one manual CI run (`workflow_dispatch` only). No APK of the 11-chapter game exists yet; the last APK is the old five-chapter one.
- Art: `python3 tools/pack_art.py` (about 4.5 min) builds `src/vault-art.js`; never hand-merge it. Blender bpy 5.2.2 runs headless from `art/`.

## Next

1. Premium art wiring into the earlier levels (in progress).
2. APK build plus one manual CI run.
3. Owner playtest and tuning (harder but fair).
4. Dragon's Hoard: built on `codex/dragons-hoard`; owner review of the shots in `review-2026-10-23/hoard/`, then merge.
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
