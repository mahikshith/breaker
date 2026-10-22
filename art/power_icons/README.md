# Power icon family (art/power_icons)

One Blender script renders every face-orb menu emblem on the shared Vault rig (`art/render_vault_assets.py`), so icons share the bricks' lighting, AgX look and glossy-toy finish. The menu cards stay code-drawn; these are emblems on transparency.

| id | owner | emblem |
|---|---|---|
| `shield` | Kit | Brick Ward: steel heater shield with a little wall of gold bricks |
| `arrows` | Kit | Arrows: three staggered bodkin arrows, coral fletching |
| `titan` | Kit | Cosmic: violet starglass orb with a silver ring |
| `five` | Kit | Ball Fan: five chrome balls fanned from the paddle |
| `lullaby` | Lumi | Lullaby: pearl crescent moon cradling a pink note |
| `starlight` | Lumi | Starlight Notes: gold star shedding two notes |
| `songshield` | Lumi | Song Shield: rose-glass arc with a gold rim and note |
| `ram_steel` | Kit | Ram Ball, Kit skin: chrome ball with curled gold horns |
| `ram_song` | Lumi | Ram Ball, Lumi skin: pink pearl sphere with a gold note inlay |

Ids match the level power ids, so `src/space-companions.js` picks them up from `ART.powerIcons` automatically and falls back to the old canvas glyphs for any id without an icon.

Run from the repo root with bpy 5.2: `python art/power_icons/power_icons.py` (all) or `python art/power_icons/power_icons.py arrows lullaby` (selected; the manifest keeps the rest). Then `python tools/pack_art.py` and `npm run build`.

Outputs: `assets/power-icons/<id>.png` (120×120 px, 3 px per unit, 40×40 units), `assets/power-icons/icons-manifest.json` (path, owner, label, px, ppu, drawSize, artBounds, sha256, encodedBytes) and the proof sheet `art/power_icons/proof/icons.png`.

To add a power: write one builder function from the shared helpers (`slab`, `sphere`, `torus`, `rod`, `cone`, `note`) and add it to `ICONS`. The `note()` helper is shared by every song icon so Lumi's set stays consistent.
