# Starflight second enemy family

This family adds three separate spacecraft silhouettes and dimensional environmental hazards. The existing Carrier boss remains a separate family. No companion artwork is included.

The retained original is `enemy-family-source-v1.png`, produced with the built-in image tool using `prompt-v1.txt`. The local style references were the existing `assets/starflight/boss.png` and `assets/starflight/gunship.png`. They supplied the bevelled slate/gunmetal, coral/plum ceramic, recessed violet emission, camera and reflection language. New silhouettes were requested explicitly. The original output was copied intact from the image tool's saved output; it already has empty PNG metadata.

`extract.py` selects real connected alpha components, keeps bounded soft edge support, crops and fits each object proportionally into its own padded canvas. It does not redraw machinery or replace alpha with a rectangular mask. Main asteroid mass is retained; far detached chips are omitted. Fully transparent pixels have zero RGB. All six runtime PNGs have clear outer edges and no metadata.

Run with the project's Python/Pillow/NumPy environment:

```
python art/starflight-v2/extract.py
python art/starflight-v2/proof.py
```

The manifest at `assets/starflight-v2/manifest.json` contains full-canvas normalized centre pivots, exact source crop transforms, actual barrel/engine UVs, measured alpha bounds and hashes. `solidBounds` are an alpha bounding extent, not a collision polygon. The crescent's open front notch must remain free space; a full rectangle is not an acceptable ship collider.

`native-extraction-proof.png` is a staged art composition at 393×852 and 412×915, using the existing dark space background. It is not a gameplay capture, earned run or collision/balance proof. Gravity and wormhole textures are shown at 48% opacity so the ship/shot foreground can remain primary. The runtime determines their mechanics and telegraphs.

Native review: all three ship identities, the frigate launch racks and crescent gap remain legible. All 19 ship muzzle/engine anchors sample opaque rendered machinery (alpha ≥252). The asteroid is physical ferric mass; the two tunnel textures are presentation sources and do not imply damage or teleport rules. Real motion, gameplay collision admission and human difficulty remain integration checks.
