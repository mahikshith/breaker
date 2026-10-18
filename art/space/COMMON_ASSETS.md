# Common space assets and far backgrounds

Carrier A and Relay B have distinct construction. A uses assets/space-a/brick_cyan.png, brick_pink.png and paddle.png: four-corner seams converging to a center lock, and a flat metal paddle. B uses the rounded enamel cyan/violet bricks and tube paddle under assets/space-common/. The common rose variant is retained as source history; it is superseded for A by the dedicated panel brick. Armour, empty crew-lock tile, ball and capsules are shared. Hulls, cannons, vehicles, pod machinery and workers are separate parts. No companions or pilots are baked into this delivery.

The exact returned originals are retained in source/. Prompt files record the complete requests and targeted repairs. The background history is preserved: A's original plate and B's original/repaired plate precede the selected footprint-original masters. The selected A planet is a small dim violet edge slice. B's unwanted upper planet was removed, and its lower-right blue crescent was reduced and dimmed. No planet was resized or painted through code.

Run from the repository root using the configured Python environment:

```powershell
python art/space/normalize_common.py
python art/space/normalize_carrier.py
python art/space/export_backgrounds.py
python art/space/preview_common.py
```

The crop scripts validate pinned original hashes, preserve unmodified lossless source crops, remove disconnected faint alpha flecks from canonical components, and uniformly resample onto transparent cells. They do not stretch the source geometry. Use measured solid-alpha art bounds in the manifests for future collision sizing, rather than the larger transparent canvas. The crew-lock tile has a fully transparent safe mounting aperture; its manifest gives exact bounds and center. It is a small empty tile, not a full worker pod.

Three pixels per world unit, linear filtering and center pivots apply throughout. Brick/crew-lock cells are 132x84px; armour 84x84; paddle 252x72; ball 60x60; capsules 96x66. Dedicated A visible art measures 36x17.33u for each crate and 76x10.33u for the flat paddle. B/common art retains its own measured aspect. The ten common files, including the historical rose variant, occupy 87,880 PNG bytes and 368,640 decoded RGBA bytes before the three dedicated A overrides. The dedicated A manifest is assets/space-a/common-panels-manifest.json; the shared manifest is assets/space-common/manifest.json.

Only intact source states are supplied. The Canvas assembly may demonstrate damage through an explicitly separate procedural crack overlay. That overlay is not an authored damage-frame family and does not implement combat behavior. The white ball has no baked trail. Capsule labels stay outside sprites: Laser uses two bright bars, Split three branching balls, and Shield an outline shield.

The selected backgrounds are 1024x1536 RGB PNGs with stripped text metadata. They contain only distant stars, edge rocks and one dim right-edge planet. There is no interactive obstacle, frame, ship or gameplay piece baked into them. Uniform cover with a right anchor preserves the planet in a narrow phone crop. Do not stretch axes separately or apply another black wash/lower blank mask. Edge rocks cropped by the viewport are decorative and have no collision.

The source crop, alpha/gutter, empty aperture and metadata checks pass. Native raster proofs are under ignored out/space-common-proof/: contact-sheet.png, carrier-a-panels.png, four actual-size phone files, native-context-review.png and checks.json. The iPhone 393x852 and Android 412x915 samples show distinct capsule glyphs, readable A panel seams, a clean pearl ball and the corrected small planet footprints. These are component placement studies, not gameplay screenshots. Native Canvas assembly and owner screenshot review remain separate. The proof helper uses cached house fonts when present and a system fallback when absent.

This delivery changes no gameplay, runtime packing, collision rules, commits or pushes.
