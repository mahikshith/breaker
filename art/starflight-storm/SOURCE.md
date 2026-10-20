# Detachable-wing storm family

Five runtime objects are retained: `body.png`, `wing-left.png`, `wing-right.png`, `storm-icon.png` and `ricochet.png`. The three flight layers use the exact existing ivory/slate/cyan player artwork, with its original barrels and engine nozzles remaining part of their respective wings. No generic drone substitutes are included.

`source-v1.png` is the original transparent five-object sheet produced with the built-in image tool from `prompt-v1.txt`, using the actual existing `assets/starflight/player.png` as the reference. It includes a detached fuselage/socket study, two wing-engine assemblies, the storm icon and ricochet missile. The rendered study matches the materials but its exploded parts assemble wider than the shipped player. That study is preserved, rather than admitted with a silent shape change.

The final flight layers restore the shipped seed identity by separating `player-reference.png` along its central armour joins. Their neutral composite has exactly zero per-channel RGBA error against that reference. The exposed generated socket study is not baked into these layers. The new storm icon and ricochet missile are extracted from the rendered sheet. `extract.py` performs this normalization; it uses the existing connected-alpha/crop helper in `art/starflight-v2/extract.py` for those two objects.

All three flight files are padded 320×288 RGBA and draw at52×46.8 world units. The body has centre pivot[.5,.5]. Wing pose coordinates represent inner attachment centres: left pivot[.40625,.5694444444], right pivot[.59375,.5694444444]. At neutral their world offsets from the body centre are[-4.875,+3.25] and[+4.875,+3.25]. Draw the full52×46.8 raster with its own pivot at that pose; do not individually fit each opaque bounding box. The manifest provides precise gun/lightning-tip and engine offsets measured in the same space.

`storm-icon.png` is256×192 and displays at60×45. `ricochet.png` is128×256, faces upward and has a measured physical-body pivot, nose UV and engine UV; suggested display12×24. These files have real transparency, zero RGB under fully transparent pixels and empty PNG metadata. Source images also have empty metadata. Current exact checks and hashes are in `checks.json` and the runtime manifest.

Reproduce with the project Python/Pillow/NumPy environment:

```
python art/starflight-storm/extract.py
python art/starflight-storm/proof.py
```

`assembly-proof.png` compares the current player, neutral layered reconstruction and real separated pieces at source and phone scale. `native-proof.png` is an explicitly staged393×852/412×915 artwork composition. It does not claim earned gameplay, runtime power timing, a field-wide lightning effect or damage geometry. Those remain runtime integration and phone QA responsibilities.
