# BREACH x Copilot: start here

Copilot does the design thinking; Claude does the building. That saves Claude's tokens for code, physics and renders, where they matter most.

## Who does what

| Copilot (M365 Copilot and Copilot Studio) | Claude |
|---|---|
| Power-up ideas, numbers, synergies | Coding the power-ups and their effects |
| Difficulty curve and per-mode numbers | Putting the numbers in, then proving them with the physics bot |
| Level ideas, floors, hazards, brick layouts | Building the level, collision, physics checks |
| New characters and creatures: look, faces, poses | Blender renders, rigs, sprite packing |
| Images: concept art, sprite sheets, icons, mock-ups | Cutting, cleaning and packing images into the game |
| UI screens: layout, copy, animation specs | Building the screens for both phones |
| Critiques of APK screenshots | Fixing what the critique finds |
| Research on other games (Researcher agent) | Tests, the APK build, CI |

Rule of thumb: if the answer is a document or a picture, Copilot. If it is code, a render or a test, Claude.

## What is in this folder

| File | What it is |
|---|---|
| `01-context-brief.md` | Everything Copilot needs to know about BREACH. Upload or attach it. |
| `02-prompt-pack.md` | The prompts, P1 to P10, plus steering prompts. Power-ups and difficulty first. |
| `03-copilot-studio-agent.md` | How to set up the **BREACH Design Studio** agent, once (about 10 minutes). |
| `04-return-format.md` | The shape every Copilot answer must have, so Claude can read it cheaply. |
| `examples/breach-powerups-example-v1.md` | A small finished drop, to show the shape. |
| `tools/check-drop.mjs` | Claude's checker for incoming drops. You never need to run it. |

## One path

1. Set up the agent with `03-copilot-studio-agent.md`.
2. In the agent, run **P1** (power-ups), then **P2** (difficulty). Add what felt wrong in the APK where the prompt asks.
3. Read the "Decisions for the owner", answer with your picks, then type `locked`.
4. Paste the locked answer in the BREACH project chat, starting with `Copilot drop: <file name>`. Attach any PNGs.
5. Claude checks it, builds it, runs the physics gates and sends you screenshots.
6. Continue down the pack (P3 to P10) while Claude builds.

Short on Copilot time? Do P1, P2, P5 (screenshot critique) and P6 (research) first: they unblock the most build work. Images (P8, P9) can be made later in any image tool with the `prompt-library/`.

Note: Copilot runs in your work account, so check that your organisation is fine with using it for a personal project.

## For Claude: taking in a drop

1. Save the drop under `design/copilot/<file name>` on the working branch and run `node copilot/tools/check-drop.mjs <file>`. On PROBLEM lines, ask the owner to send Copilot the matching steering prompt from `02-prompt-pack.md`, rather than fixing the design yourself.
2. Read only the header, "Decisions for the owner" (confirm the owner's picks are applied) and the JSON. The prose is for the owner.
3. Where each kind lands:

| kind | Code and art it touches |
|---|---|
| powerups | `src/gfx.js` POWER, `src/arena.js` catch and limits, `src/space-companions.js` KIT_POWERS and SPACE_POWERS, `src/fantasy/ram.js` RAM, `src/difficulty.js` powers and companionHits, `art/power_icons/` |
| difficulty | `src/difficulty.js` MODES, plus each chapter's own constants (`src/carrier.js`, `vault.js`, `relay.js`, `orbital.js`, `frost.js`, `mooncoil.js`, `src/fantasy/*.js`) |
| level | new design doc in `design/phase2/`, a new chapter appended to `LEVELS` in `src/main.js` (save slots never move) |
| character | `art/<name>/` Blender scripts, `prompt-library/10` sheets |
| ui-screen | `src/main.js` panels, `src/monetize.js` |
| asset-sheet | `assets/`, then `python3 tools/pack_art.py` |
| critique | `docs/BACKLOG.md` |
| research | `design/research/` |

4. Every number a drop changes passes the normal gates: `npm test`, `npm run audit:physics`, the quick checks, then screenshots to the owner.
5. When the game changes in a way Copilot should know (new chapter, new numbers), update `01-context-brief.md` and tell the owner to replace it in the agent's knowledge.
