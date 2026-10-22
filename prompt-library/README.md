# BREACH prompt library

Copy-paste prompts for making BREACH art and design with Copilot (ChatGPT image models) and a reasoning chat model. Every prompt is self-contained: the model needs no access to our repo.

## What is in here

| File | What you get |
|---|---|
| `00-style-bible.md` | The house look as a reusable preamble, the palette, what was rejected, and the Fix prompt. |
| `10-characters-and-creatures.md` | Turnaround, expression, keypose, attack-tell, face-orb and parts sheets. Worked examples: Kit, Lumi, Korr, Nerra, Gnash, plus new beasts Ember (dragon), Zephyr (griffin) and Grumble (golem). |
| `20-bricks-props-and-fx.md` | Brick families, keystone and rune bricks, treasure bricks, castle props, the two-layer window, FX sprites, power-up icons, capsules. |
| `30-level-concept-boards.md` | Portrait phone mocks of a level that read as playable boards. Gatehouse Siege, Lumi Breaks Out, Serpent Rivals, Dragon's Hoard. |
| `40-game-design-and-physics.md` | Prompts for a reasoning model: level design doc, physics and collision spec with manifest.json, a measuring script, a rule audit. |
| `50-starflight.md` | The space mode: ships, enemy families, bosses, asteroids, pickups, projectiles, backgrounds, a phone mock and a chapter design doc. |
| `25-environments.md` | Backdrops and environment plates for castle, cave and space levels. |
| `26-ui-and-icons.md` | HUD pieces, buttons, badges and icons. |
| `references.md` | Repo art worth attaching as reference, with paths. |
| `60-sprite-sheet-delivery.md` | Exactly how a sheet must arrive: transparent PNG, grid, padding, sizes, naming, consistency tips. |
| `examples/` | Twelve small reference pictures. `examples/INDEX.md` says which prompt each one goes with; `examples/MORE-EXAMPLES.md` covers four more. |

## How to use it (one path)

1. Pick the prompt in the file above that matches what you want. Image prompts are for the image model; the prompts in `40` and the doc prompt at the end of `50` are for a reasoning chat model (ChatGPT with thinking, or Claude).
2. Open `examples/INDEX.md`. Attach the pictures it lists for that prompt to your chat as **style reference** before you paste.
3. Copy the whole fenced block and paste it. Fill every `[BRACKET]` first. Delete the line if a bracket does not apply.
4. Ask for 3 variants. Pick the best one. For small corrections do not regenerate: attach the image and use the Fix prompt from `00-style-bible.md`.
5. Check it with the self-check at the bottom of `00-style-bible.md` (shrink to 100 px, calm background, no plain circles or rings, no tiny targets).
6. Send it back: attach the PNGs to a message in the BREACH project chat with a one-line note. Claude picks them up from there.

## What to send back

- **PNG**, the biggest size the tool gave you, straight from the download. No screenshots, no JPEG, no sharpening.
- **Transparent background** for anything that is a sprite (characters, bricks, props, FX, icons, ships). If the tool cannot, use flat magenta #FF00FF and tell us.
- **Grid sheets**: equal square cells, 10% margin, nothing touching a cell edge, cells in left-to-right, top-to-bottom order. Details and sizes are in `60-sprite-sheet-delivery.md`.
- **Level boards and concept art**: the full image, on its dark background, portrait boards as tall as the tool allows.
- A short note: file names, which variant is the keeper, the cell order, and the prompt you used (use the hand-back template at the bottom of `60-sprite-sheet-delivery.md`).

## House rules in one breath

Glossy 3D vinyl-toy and glazed-ceramic look, chibi proportions, warm key light from the top-left, calm dark navy backgrounds, expressive faces, very little yellow. No pixel art, no ball-chain snakes, no blob heads, no identical faces, no long-armed creature template, no plain circles or rings for effects. Backgrounds never outshine the ball.

## Notes

- Names marked "new" (Ember, Zephyr, Grumble) are working names.
- If a tool has a safe-prompt limit, the style preamble is the part to shorten first, but keep the "NOT" list.
- Not every image tool supports transparency or exact sizes. The prompts say what to do when it does not.
