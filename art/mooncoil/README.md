# Mooncoil brick family

`brick_assets.py` authors a separate Blender family for Mooncoil Reliquary. It imports the existing Vault orthographic camera, area-light/softbox rig, AgX look and material helpers from `art/render_vault_assets.py`; it does not overwrite Vault art. Source geometry is authored here, not repainted runtime rectangles.

The visible face is a shallow eight-sided moonstone crown in a bevelled silver setting with four metal prongs. Blue, coral, jade and violet distinguish the level's banks/gallery. Damaged variants use the existing deterministic recessed crack material. Dark blue slate has silver rivets; the special cache is pale moonstone with a small silver lunar inset. The representative first blue render is retained in `proof/seed-brick-b-2-0.png`; `proof/seed.png` shows it at source and native display sizes.

Run from the repository root with the installed Python3.13/bpy5.2/Pillow/numpy environment:

```powershell
python art/mooncoil/brick_assets.py --seed
python art/mooncoil/brick_assets.py
```

The full command writes nineteen metadata-stripped RGBA PNGs and `assets/mooncoil/bricks-manifest.json`. Outputs are3px/u, with the existing four-unit margin. A one-cell brick is72×72px, drawn24×24u around a16×16u collision footprint; a two-cell brick is120×72px, drawn40×24u around32×16u. Anchor is the footprint centre, so draw origin is brick x/y minus4u. Lighting/depth/transparent pixels never enlarge collision.

Manifest keys are `kind_width_damage`: blue6, coral2, jade4, violet3 each have widths1/2 and damage0/1. Slate9 has widths1/2, damage0. Cache5 has width1, damage0. Each entry records repository-relative path, pixel size, draw size, footprint, margin, alpha bounds, encoded bytes and SHA256. Rendering is Cycles CPU4 threads,24samples, true transparent film and deterministic seed79. Final normalization sets RGB to zero wherever alpha is zero and re-saves PNGs without embedded metadata.

`proof/family.png` is the actual source/native-scale family sheet. Source/alpha/size checks establish raster registration; the runtime integration still needs the final game view and original collision checks. The generator does not change level layout, collision, HP or game rules. Root packaging and artwork archival are separate steps.
