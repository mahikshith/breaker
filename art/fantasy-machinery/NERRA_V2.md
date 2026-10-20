# Smaller Nerra and mechanical chain pull

The owner requested a smaller Nerra, a wider substantial support wall, a chain-holding right claw that operates the sluice hoist, more readable motion/expression, and more bricks. This family supplies the new art/anatomy; raft layout and gameplay timing remain the model owner's work.

The source keeps Nerra's approved coral/oxblood shell, barnacles, grey ruined castle, small red flags, short teal-iris eye stalks, cream underside, eight short legs and black pearl joints. Four distinct body key poses are idle, lateral step, hit-stunned and angry chain pull. These are raster key poses, not a complete skeletal rig. The right pincer visibly clamps a real steel link. Its free dangling tail was separated during extraction; runtime chain routing owns the extended free chain.

Permanent sources and prompt records:

- `source/nerra-motion-v1.png`: first six-object source, retained as history because the outer legs were crowded/clipped.
- `source/nerra-motion-v2.png`: repaired two-column/three-row source, complete six independent components. SHA256 `afecbfb234c1c4cddf331f6cfac44a6bea6fe2bc2ed22e9bdb47452fb2e3b876`.
- `nerra-v2-prompts.json`: original production request and targeted framing repair.

The override manifest is `assets/fantasy-machinery/nerra-v2-manifest.json`, SHA256 `defc7d7d75af13b50560cbabd79d5115cbeeafa997d9abc5452f5c5e0418fc69`. The original manifest remains `b810545f1c1cabbe6252fbae0ece8b4ccc1637946fd4bca35d97c3a09d41ff13` unchanged. Geometry module `nerra-v2-data.mjs` is `ba6e1bdab8034a9e9f6835a8db20879738fc2824e07f278ea76ecef194ed0f23`.

The override's canonical asset keys are `nerraBody`, `gateClawV2` and `chain`. Body atlas cells are640×576, four columns; the full cell is190.08×171.072world units. All poses share one source scale and supporting-foot pivot `[0.5,0.9375]`; anchor it at the actual foot position, currently `(180,232)`. They must not be scaled by0.88 again. Pose-specific `frameRect`, `footUV`, socket UVs, foot-local sockets and circle unions are included. The old separate crusher remains at explicit0.88scale with the original mirror convention.

The new right claw uses96×96world units and normalized pivot `[0.14074550128534705,0.23272729833258227]`. `chainGrip` is local `[61.41461623209696,43.99819738621001]` at the clamped link; the visible extension anchor `chainEnd` is `[64.39368343738525,60.49752140603875]`. The remaining source-held link and the routed chain should overlap naturally. Draw the free chain behind the pincer, not over its closed jaw. The split's lower metal cut is hidden by that real link connection; it is not a standalone end cap.

The separate chain strip is24×108world units at its full padded canvas size. Its metallic gauge matches the heavy held link. Use the measured `tileTop`/`tileBottom` subsection in short overlapping routed segments; compressing all seven links into a short line or stretching it into a flat bar loses the intended weight and link geometry. Chain is rear-stage mechanical presentation, not an extra damaging ball collider.

Right-arm rotation from `+0.12` to `-0.55` raises the actual grip. A taut hauling route therefore runs from the grip to the lower wall-mounted hoist near `(310,244)`, then onward to the sluice/pulley. Routing directly to a pulley above the grip would shorten that free chain leg as the hand rises. The model and renderer must share the actual route, haul amount and warning state; art supplies no independent timer or hidden force.

The measured conservative circle unions are90 per body pose and37 on the new right claw. Every disk is inside actual alpha>=128. Decorative routed chain has no collision. Across all four poses and authored arm-angle ranges, the opaque local assembly extents relative to feet are `[-128.968906,-146.421,159.967229,21.226855]`. At footY232, the deepest limb is253.226855; a brick top at or below285.226855 retains32world units of visible gap. With footX180 and patrol±12, the assembly stays withinX39.031..351.967. These are actual alpha extents, not just the disk bounds.

Rebuild and verify from the repository root:

```text
python art/fantasy-machinery/extract-nerra-v2.py
python art/fantasy-machinery/proof-nerra-v2.py
```

`proof/nerra-v2/verification.json` verifies source/runtime hashes, exact equality between manifest and importable geometry data, empty metadata, transparent image edges, cleared hidden RGB and all opaque-inscribed body/claw disks. The seven runtime PNGs total4,192,937encodedbytes and12,894,208decodedRGBAbytes including four individually preserved frames. Loading the atlas alone for those frames saves5,898,240decodedbytes. All source/runtime files are below20MB individually.

`native-poses.png`, `ios-idle/step/hurt/pull.png`, `android-pull.png` and `keyposes.gif` are labelled staged art assemblies. They show the actual raster family at phone size with attached claws, grounded feet, a larger masonry support and a textured chain. They are not earned gameplay, human difficulty approval, native-device performance or a finished full-rig animation claim. Final actual-browser integration and playtest evidence are separate.
