# Instructions for coding agents (Codex and others)

BREACH is a premium portrait brick breaker for iOS and Android. It is plain JS on Canvas 2D, bundled into one HTML file, with art pre-rendered in Blender 5.2.

## Read first, in this order

1. `docs/handoff/01-status-and-next-steps.md`: the owner's rules, progress log and TODO.
2. `docs/handoff/02-architecture-and-pipeline.md`: code map, art pipeline, build and test.
3. `docs/handoff/03-environment-skills-ux.md`: tools, locations and UI/UX rules.
4. `docs/STORY_PLAN.md`: the story and the phased roadmap. Phase 1 is approved.
5. `docs/handoff/04-chatgpt-design-brief.md`: the art bible, palette and design deliverable formats.
6. Design deliverables to build, when present: `design/phase1/*.md` and `design/phase1/img/`.

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

- **Setup:** `npm install`; Python 3.11 with `pip install bpy==5.2.2 pillow numpy`.
- **Build:** `npm run build` writes `dist/breach.html`. Run the unit tests with `npm test`.
- **Art:** see the commands in doc 02, section 3. The scripts are in `art/`. New characters follow `art/princess.py`, which has the face rig. New assets reuse the light and material rig in `art/render_vault_assets.py`.
- **Playtests:**
  - `node tools/playtest/polish.mjs <out> ios|android`;
  - `node tools/playtest/layout.mjs <out>`.

  Check that there are no page errors, then show the owner the screenshots.

## After every milestone

- Update the handoff docs, especially the progress log in doc 01.
- Run `python3 tools/make_handoff.py`.
- Push.
