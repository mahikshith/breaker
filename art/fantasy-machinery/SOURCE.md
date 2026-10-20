# Bellforge and Tidewheel production layers

The owner approved `design/phase1/img/princess-bellforge-a-v1.png` and `design/phase1/img/princess-tidewheel-b-v1.png` as the visual references. These files contain independent new raster layers derived from those references. The full boards are never used as gameplay backgrounds or actor rectangles. Existing Lumi and Kit assets remain separate.

The permanent source PNGs are in `source/`. Prompts are preserved in `prompts.json`, `production-prompts.json`, `final-prompts.json` and `grounding-prompts.json`. Raw source PNGs are retained byte-for-byte; their RGB under transparent pixels may contain an unused matte. Runtime PNGs clear all hidden RGB and alpha below3, contain no metadata, and have zero alpha on every outside edge.

Selected sources:

| Source | SHA256 | Purpose |
|---|---|---|
| bellforge-sheet-v2.png | 2688aec368b6f562069536ad334c1c2d6934d1b76bba199e8686dcec8453e855 | Four Korr key poses, bell, ramp, lift, ratchet |
| tidewheel-sheet-v1.png | 2fa3bcd1f1bec04cbab1dd582ca9788d331507597239010ebb24bd6a1a350179 | Nerra body, separate claws, wheel, raft, gate, weight |
| background-pair-v2.png | 8074e80015b505fb7507f18e19d4b3729911e52019f81672ff116f12755c9143 | Quiet static architectural plates, no gameplay objects |
| tidewheel-bricks-v1.png | c8061573b71f6ab633709ba4bad2e4037edb78979e1225de6152076c0bf1fbad | Equal coral, sage and ivory ceramic tiles |
| grounding-sheet-v1.png | 033a7daf69b1df7ddcce34455854e96d95e13cbbdbadb17f40db85b20cb50187 | Forge plinth, lever, sluice masonry, balcony, gate frame |
| bell-cradle-v1.png | 340d04e3bf4e3fae9cbcbd1a86b4b226a4be90a1b121b2d453f1f74447d49747 | Open-front rear-stage bell release rack |

`bellforge-sheet-v1.png` is preserved history: the rightmost release tusk clipped its edge. Version2 repairs the framing. `background-pair-v1.png` retained decorative bells that could be mistaken for gameplay objects; version2 removes them. The narrow-mouth hopper in the grounding source is a study only and is not suitable for a28u bell passing through its small outlet.

Rebuild from the repository root with the configured Python containing Pillow and NumPy:

```text
python art/fantasy-machinery/extract.py
python art/fantasy-machinery/measure.py
python art/fantasy-machinery/proof.py
python art/fantasy-machinery/verify.py
```

The extraction selects actual connected components, preserves soft alpha, normalizes deterministic pivots, and records source-to-cell transforms and hashes in `assets/fantasy-machinery/manifest.json`. Korr's four512×448 cells share one scale of3px/world unit and one supporting-foot baseline. The release hoof extends ahead of the supporting plane, so aligning each pose's bounding-box bottom would be wrong.

Korr is four raster key poses—idle, windup, release and stagger—not a skeletal rig or a complete interpolated walk animation. Nerra is a body with eight short legs and two independent short-arm claw layers. Its sockets, claw roots and geometry use the same normalized UVs and world units. Mirror the crusher at its root, then rotate the whole anatomical part. Do not stretch the body/claws independently to arbitrary rectangles or fill the open pincer gaps.

`measure.py` records conservative opaque-inscribed circle unions, relative to each part pivot. Additional small disks cover visible hooves, tusks, walking legs and pincer tips. They are measured collision proxies, not skeletal joints. The proof folder includes their overlays and coverage receipt; small banner/spike tips can remain decorative. Physics admission must consume the same per-pose transform as the renderer.

Grounding is a rear-stage composition. The forge plinth top anchors support Korr's feet; Tidewheel's substantial sluice wall supports Nerra with open arches behind the foreground ball. These scenery layers do not imply a full-width foreground collision wall. The separate release lever arm rotates about its brass bearing while its mounting foot stays fixed. Balcony `deck` supports Lumi; the front railing may be redrawn with an occlusion mask after her legs.

The bell rack's `outlet` maps to the actual release point. At authored116×87u canvas scale its initial aperture clearance is14.665u for the14u bell. Its lower side feet narrow a purely vertical image-plane sweep, so it is a rear-stage release rack: the bell emits forward into the foreground rolling lane. This is not evidence of a clear28u-wide vertical tube through the entire sprite. Keep the rack behind the bell/lane and do not add invisible rack collision.

The wheel is an oblique rendered face. Bounded rocking or an affine rotation within its own projected face is appropriate; rotating its full thick three-quarter raster through360degrees would not be a true3D wheel animation. Its axle anchor is offset from its overall image centre intentionally.

`proof/ios-assembly.png`, `android-assembly.png`, `parts-contact.png` and `keypose-assembly.gif` are explicitly staged art fixtures. They verify independent layers, fixed pivots, material consistency and native-size legibility. They are not earned gameplay, balance, collision-solver, device-performance or complete level-animation proofs. Actual browser scene integration and phone playtests are a separate receipt.

The frozen manifest is `b810545f1c1cabbe6252fbae0ece8b4ccc1637946fd4bca35d97c3a09d41ff13`. Its final Korr disk counts are49/48/51/49 for idle/windup/release/stagger. Nerra body/crusher/gate-claw counts are80/63/64. `verify.py` checks every disk against the actual opaque raster, all referenced hashes, alpha edges, hidden RGB, metadata, two real architecture holes and the initial bell aperture. Normal6u radius reaches all four Korr and both claw silhouettes and99.787% of Nerra's opaque pixels; the residual tiny castle/banner tips are decorative. It is a conservative union, so a ball can enter thin decorative alpha before reaching a disk.

The frozen B810 checkpoint contains29PNGs,9,009,729encodedbytes and27,514,104decodedbytes including the four individually preserved Korr frames and the unused narrow-mouth hopper study. A renderer needs the atlas rather than also loading its four duplicate frame PNGs. Its eight source PNGs have empty metadata and are below20MB each. No environment or actor is a full-board crop.

The owner's later smaller Nerra/chain-pull revision is a separate preserved override. See `NERRA_V2.md`; it does not rewrite B810 or its earlier geometry receipt.

The current water attack uses the independent `water-shot-manifest.json` and `water-shot.png` under `assets/fantasy-machinery/`. Reproduce extraction with `python art/fantasy-machinery/extract-water-shot.py`; the source and prompt are preserved alongside the other sheets. Its 32×48u image faces downward and rotates around the measured front-core pivot to follow actual projectile velocity. The physical circle has radius10; 97.35% of that disk overlaps visible water at alpha≥40, with a9.136u strictly inscribed core. Soft foam and the long spray tail are decorative, not extra damage. `proof/water-shot-native.png` is a staged size/collider study, not a gameplay result.
