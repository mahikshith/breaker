# Frost Warden source and reproduction

The hostile Frost Warden is a charcoal/plum and ice derivative of the retained Yeti rig. Brum remains the separate friendly porter. `art/brum.py` and his existing proof are unchanged.

The original Yeti was created by Quaternius for [Ultimate Monsters](https://quaternius.com/packs/ultimatemonsters.html), distributed under [CC0](https://creativecommons.org/publicdomain/zero/1.0/). The preserved inspected file is from [Castle Game Engine commit 60a49b3](https://raw.githubusercontent.com/castle-engine/castle-engine/60a49b33914135dbea5dbcd1c040a4bcf08db10e/examples/viewport_and_scenes/occlusion_culling/data/quaternius_ultimate_monsters/Yeti.gltf), SHA256 `b9c088fbcd357b82f3cb9a3f33a6b5c5603d3e55958a695e2bd9e419cc6527fb`. All buffers are embedded; there are no external textures or buffers. Byte equality with the original quota-blocked pack download is not claimed.

`art/frost_warden.py` loads this permanent source and the pinned geometry/face setup in `art/brum.py` (SHA256 `75968015af39eb6395d3f598f7f53f4a1db9cca2a21b83dbcab4c773dff45abd`). It retains the 43-bone rig, continuous source face and mouth, fitted expressive lids and articulated fists. Only the new hostile family's palette and expression/clip sampling change. Runtime artwork is genuine rig rendering rather than independently positioned arm pieces.

With Python 3.13, bpy 5.2.2, Pillow and NumPy:

```powershell
python art/frost_warden.py art/frost-warden/renders --samples 16 --threads 4 --yaw 65
python art/frost-warden/pack.py
```

The editable rendered scene is `art/frost-warden/renders/frost-warden.blend`. Raw frames are 432×384. Production cells are 256×228 in a 1792×912 atlas, representing 144×128 world units with a fixed foot pivot at (72,116). Every clip records its source action and exact sampling fractions. Pose anchors are projected from the evaluated rig/hand surface, in world units relative to that foot pivot; bodyShapes use real opaque image bands. The family must still be checked in the actual native renderer after packing.

The manifest stores source/runtime hashes, clip indices, fixed camera direction, palette, projected anchors and normalization settings. PNG metadata is removed, and fully transparent RGB is zeroed in runtime files.

The completed 28-frame family passed exact atlas/cell comparisons, metadata and transparent-edge checks, and source/native-size visual inspection. Each frame retains measured hand and opaque body-region data. These production checks do not replace actual game collision, phone playability or native APK verification.

The versioned editable scene is 4,705,692 bytes, SHA256 `3c4eb7ed4938695166511eee5678c4c31bc4cf0b78a97572bca3c61ef0110832`. It preserves the rendered Frost Warden geometry/material setup; the retained source model and wrapper reproduce the complete animation family using the command above.
