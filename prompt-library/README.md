# BREACH prompt library

Reusable prompts for generating concept art, asset renders and design ideas for BREACH (the premium portrait brick breaker) in Microsoft 365 Copilot, using its image generation and any of its text models. The prompts keep the output on-style and directly usable by the game.

## What is in here

| File | Use it for |
|---|---|
| `00-style-block.md` | The master style paragraph (paste first in every visual prompt), a short version, a negative list, fixed numbers and palette |
| `references.md` | The best existing images in the repo to attach as style references, and which to attach for what |
| `10-characters.md` | Heroes, villains, creatures and animals: turnaround sheets and expression sheets |
| `11-bricks-and-props.md` | Brick families (intact and cracked), machinery props, reusable "one rig, many skins" kits |
| `12-environments.md` | Level backgrounds: castle, tower, reliquary, space |
| `13-ui-and-icons.md` | Power icons, counters, HUD frames, face orbs |
| `14-fx.md` | Breakage, sparks, shockwaves and power effects as sprite-sheet pieces |
| `15-concept-boards.md` | A full level concept board (phone mock plus feature panels) |
| `20-game-design.md` | Text prompts for designing a level, in the structure of `design/phase2/kit-and-lumi-levels.md` |
| `21-physics-spec.md` | A text prompt that turns a new mechanic into a physics spec |
| `30-starflight.md` | Starfighter campaign: ships, enemies, backgrounds, power-ups |
| `examples/` | Four reference images copied from the repo, explained in `examples/README.md` |

## How to use it (visual prompts)

1. **Pick a template.** Open the file that matches what you need (for example `11-bricks-and-props.md`). Each template has a purpose, fill-in fields, one worked example prompt and the output spec.
2. **Fill the [BRACKETS].** Replace every `[LIKE THIS]` field. Delete a line rather than leaving a bracket in. Use real colours (hex) and real sizes (px or game units); the examples show how.
3. **Paste the style block first.** Copy the block from `00-style-block.md`, paste it as the start of the prompt, then the filled template. Paste the negative list at the end as an "Avoid:" sentence.
4. **Attach 1 to 3 reference images** from `references.md` (the "Quick picks" table says which). Every template tells the tool to stay consistent with the attached references; keep that sentence.
5. **Generate, then iterate with small changes.** Change one thing at a time ("make the brow angle steeper, keep everything else"). If the style drifts, re-paste the style block and re-attach the references.
6. **Check the result against the checklist below** before sending it back.

### Tool limits to expect in Copilot (and what to do)

- **Exact pixel sizes are usually not honoured.** Ask for the aspect ratio and "as large as possible"; we resize in our pipeline. The templates give the final px size we need, so we know what to resize to.
- **Transparency is often not supported.** Ask for "transparent background". If the tool returns an opaque image, regenerate with "a flat solid [#FF00FF magenta, or #00B140 green] background, no shadow on the background, no gradient" and pick a colour that is not in the subject (magenta for green or teal subjects; green for red or pink subjects). Say which you used when you hand it back.
- **Text gets garbled.** Never ask for text in assets or backgrounds. In concept boards keep captions to 4 words or fewer; we never ship board text (the game draws all text in code in Lilita One and Rubik).
- **One subject per image for assets.** Sheets of many items drift in scale. Use the grid layouts in the templates, and generate one more image for any item that came out wrong rather than redrawing the sheet.

### Text prompts (game design and physics)

`20-game-design.md` and `21-physics-spec.md` are plain text prompts. Paste them into a Copilot chat with a text model, fill the brackets, and attach the named repo files if the tool accepts them (otherwise paste the short "facts" block already included in the prompt). They need no style block.

## Return checklist (what to send back)

Send everything for one request together, named so we can file it without asking.

**For every image**

- [ ] **PNG** (not JPG, WebP or a screenshot of the screen). Highest resolution the tool offers; long edge 1536 px or more for boards, 1024 px or more for single assets.
- [ ] **Nothing baked in that the game draws itself:** no text, no logo, no watermark, no UI, no HUD, no counters, no frames, no phone mock-up. Exception: concept boards (see `15-concept-boards.md`).
- [ ] **Style matches the references.** Look at it next to the attached images. Glossy vinyl or glazed ceramic finish, warm key top-left, cool fill right, pink bounce below.
- [ ] **Saved prompt.** One `.txt` per image with the exact prompt used and the names of the references attached.

**Assets (characters, bricks, props, icons, effects)**

- [ ] **Transparent background** (or the flat chroma colour described above, stated in the file name).
- [ ] **Orthographic front view** for props, bricks and icons; **three-quarter view** for characters, plus the requested turnaround views.
- [ ] **One object per file**, or one clean grid sheet with equal cells, the object centred in each cell, at least 10 percent empty padding, no overlap, no object cut by the edge.
- [ ] **Characters:** front, three-quarter, side and back on one sheet, same character, same lighting, evenly spaced; plus an **expression sheet** (labelled by file name, not baked-in text). Every expression must differ in eyes or lids, brows and mouth together.
- [ ] **Intact and cracked** versions for anything breakable.
- [ ] **Sizes stated in the file name** if they differ from the template (for example `...-2048x2048.png`).

**Backgrounds**

- [ ] **Portrait**, 9:19.5 if the tool allows it, otherwise 9:16 (we extend or crop); 1024 x 2048 or larger.
- [ ] **No bricks, characters, UI, text or props that look collidable.** Dark, calm, desaturated; quiet upper half; detail only at the extreme edges and the lower floor.
- [ ] No torches, lanterns, candles, bright planets, glowing windows or hazard stripes.

**Design text (levels, physics)**

- [ ] Same headings and table columns as the template, all numbers in game units and seconds, no "TBD" in a table cell (put open questions at the end).

## Where we file it

Nothing goes straight into the game. After you hand files back we:

1. Save the raw image and its prompt in `art/<family>/source/` (for example `art/castle/source/`, `art/mooncoil/`, `art/starflight-campaign/chNN/`). Originals are never overwritten; a new version gets a new file name (`...-v2.png`).
2. Run the **Blender pass or packing pass**: where we need a real, consistent 3D asset (characters, bricks, icons, props) the concept is rebuilt in Blender on the shared rig (`art/render_vault_assets.py`) so lighting and materials match every other asset; where the generated raster itself is the asset (backgrounds, Starflight sheets) it is cleaned, extracted from its sheet, normalised and metadata-stripped by an extraction script (see `art/starflight/extract.py` for the pattern).
3. Strip PNG metadata, run `python3 tools/pack_art.py` and `npm run build`.
4. Run `python tools/archive_artwork.py` to preserve the originals in `artwork-library/`.
5. Show the owner screenshots at 393 x 852 and 412 x 915 before anything is committed.

Concept art is a direction choice, not production proof. A strong large picture that does not read at phone size will be sent back.
