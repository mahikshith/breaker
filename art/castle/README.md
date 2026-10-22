# Castle window kit (art/castle)
Layered tower window for BREACH "Lumi Breaks Out" (any level with windows, hatches, tunnels or doors can reuse it).
Rendered with the shared Vault Blender rig (`art/render_vault_assets.py`): chamber stone, cage iron, interior stone.

**Layer order contract:** `window_back` -> serpent (or anything) clipped to the opening polygon -> `window_front`
(or `window_front_cracked` for a damage state). Draw all layers at the same position; they share drawSize/anchor.
The front layer's opening is fully transparent; the back layer is only opaque inside the opening (+2u under the frame).

Manifest `assets/castle/window-manifest.json`: `version`, `source`, `rig`, `scope`, `opening` (32x44u, arch r16, frame 52x64u),
`order`, and per sprite: `path`, `px` [180,216], `ppu` 3, `drawSize` [60,72]u, `anchor` (opening centre from drawSize top-left, [30,36]),
`opening` (18-point clip polygon in drawSize units, y down: bottom-left, 16 arch points, bottom-right), `alphaBounds`, `sha256`, `encodedBytes`.

Run from the repo root: `<bpy-python> art/castle/window_kit.py` (about 10 s; writes assets/castle/*.png, the manifest and
`art/castle/proof/window.png`). Asserts the opening is transparent and the margin is kept.
Reuse: change OPEN_W/OPEN_H/R/ROUT in the script for other sizes, or reuse the `prism`/`build_back` helpers for new openings.
The kit adds two soft fill lights (shared rig key is near-vertical and leaves a deep recess black); `source/` holds the raw back render.
