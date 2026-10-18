# Weapon motion studies, revision 2

This is an **unapproved prototype**, outside the game bundle. Only the two charge clips are rendered as complete atlases. The owner rejected the previous flat Hard boards; these sources study dimensional metal and plasma without changing attack rules or redesigning any ship/cannon.

`helix-charge.png` and `reactor-charge.png` each contain twelve 256×256 RGBA cells in a 4×3 grid, at 24fps. Draw with normal source-over blending, a fixed (128,128) cell pivot and an initial 56u square display. Charge anchors at the actual cannon muzzle. The compositor must keep the existing cannon rim in front and assess the effect at native phone size. `cool` reuses charge frames 3,2,1,0. No opacity additive pass is required.

**Flight, discharge and impact atlases are unavailable.** Their manifest entries describe an intended interface, not existing atlases. Do not preload them, manufacture missing frames, or use static proof images as complete animation. Flight seeds are under `proof/mechanical-v2/`; the original narrow/plastic drafts remain under `proof/` and `art/space/weapons-v2/rejected-draft-01`. Versioned impact drafts are under `proof/impact-v3/` and `proof/impact-v4/`. V4 had completed before the latest render hold: it is not a permission to render or integrate the family.

The separate current candidates are `payload-A.png`, SHA`AB4DFC62BAE61D1E232AD3C9667F493211CE595D1E9B0986B2D5B6581DFA510C`, and `payload-B.png`, SHA`99E9205B3E41FB91A37A57880B7FE11DD3F2550C7B339944F731CE1D2527CA85`. Their status is **single-frame flight artwork awaiting owner review; motion composed in preview**. Both are1254×1254 RGBA PNGs with alpha0–255 and no metadata. Their substantive alpha>16 content has at least16px outer padding; faint alpha1 fringe reaches one outer edge, so strict zero-alpha padding is not certified. The report records exact bounds and bytes. These files are not Blender flight/impact atlases and do not lift the render hold.

The charge clips are usable only for a prototype native comparison. Flight remains on hold for the native composite and source-seed comparison. Impact remains on hold: early seeds were too small and bead-like. The later lateral machined-fragment / asymmetric rupture drafts need the same assessment; the compositor may use actual panel breakup as its principal impact instead. No full flight or impact batch is approved.

The editable generator is `art/space/weapons_v2.py`; hero scenes and preserved revisions are in `art/space/weapons-v2/`. Rendering uses installed Blender 5.2.2, CPU Cycles, 16 samples, four threads, AgX Medium High Contrast, transparent RGBA and the established soft key/cyan fill/magenta bounce/reflection-card scheme. All geometry is authored in that local source. Source and atlas hashes, all cell alpha bounds, duplicate-frame checks, metadata checks and encoded/decoded budgets are in `asset-report.json`.

Validation, without rendering:

```powershell
& 'C:/Users/mahik/AppData/Local/Programs/breach-tools/python313/Scripts/python.exe' art/space/weapons_v2.py manifest
& 'C:/Users/mahik/AppData/Local/Programs/breach-tools/python311/Scripts/python.exe' art/space/weapons-v2/validate.py
```

The validator requires exactly the two available charge atlases and asserts that flight/impact atlases remain absent. It checks every cell against its original frame, true alpha padding, twelve distinct frames per clip, stable API and no PNG metadata. This proves file integrity, not visual approval, collision fit, performance or human balance. No runtime source, frozen preview, APK, commit or push was changed by these studies.
