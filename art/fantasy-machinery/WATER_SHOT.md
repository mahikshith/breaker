# Tidewheel pressured water sprite

The flat procedural teardrop was replaced with an independent dimensional water raster: refracted teal mass, unequal foam crest, small spray and a tapering upward tail. This is a single sprite for the actual physical projectile, not a new attack rule or a full fluid animation.

Source `source/water-shot-v1.png` is preserved unchanged, SHA256 `5339f2742b5445b9c325ce6eddf735355153c6385b80765d21d0d023ac8724d0`. The production prompt is in `water-shot-prompt.json`. The referenced actual level frame was `out/fantasy-review/tide-v2-final/ios-tidewheel-07-physical-water-pulse-staged.png`, used for material/lighting context rather than pasted into the sprite.

`extract-water-shot.py` removes unused ambient matte, retains real liquid/spray components, normalizes to192×288 and clears hidden RGB/PNG metadata. Runtime `assets/fantasy-machinery/water-shot.png` is `e9a23f6276be299e8224f3505598ff7826d738369dcd0f855b594a64c39c05ff`. Its separate `water-shot-manifest.json` is `44172b349146ac438006989327ddfcd8da2d4db0c81b73e03fb68e5450f8010f`. Neither the old B810 nor Nerra-v2 DEFC manifest changes.

Render at32×48world units. Source faces down; rotate by the real projectile's heading. Measured leading fluid-mass pivot is `[0.5208333333333334,0.6701388888888888]`. The model's physical circle radius remains10. At alpha>=40 the strict inscribed water-core radius is9.1363, and97.3514% of the r10disk has visible water. This is a soft liquid/foam circle approximation, not a claim that every collision pixel is solid opaque metal. Spray, trailing turbulence and the narrow nose outside the main circle are presentation.

`proof/water-shot-native.png` shows the actual runtime sprite, the physical circle and iOS/Android-size fixtures. It verifies recognizable volume at phone scale; it is staged art, not earned gameplay or a physical-handset performance test. The runtime PNG has empty metadata, zero alpha on all outer edges and cleared RGB under fully transparent pixels. Raw source also has empty metadata; unused RGB under its transparency remains preserved with the original source hash.

Rebuild with `python art/fantasy-machinery/extract-water-shot.py`. The renderer owns live motion, contact and any bounded procedural trail; the asset introduces no independent timers or damage logic.
