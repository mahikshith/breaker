# Starflight prototype artwork

This new scrolling shooter family uses complete newly rendered starships, extracted from a coherent transparent sheet. It shares the glossy ceramic, machined dark metal, bevels and controlled emission of the approved space artwork. It contains no companions or princess imagery.

Originals and the complete production prompt are retained in `art/starflight/ships-source-v1.png`, `background-source-v1.png` and `production.json`. The source ship sheet is 1254×1254 RGBA with genuine transparency; the environment source is 887×1774 RGB. The source originals remain unchanged.

Run `python art/starflight/extract.py`, then `python art/starflight/proof.py`. Extraction labels actual connected alpha islands, retains bounded soft edges, isolates each sprite, and normalizes it without stretching. Runtime PNG metadata is empty, fully transparent RGB is zeroed, and every sprite has transparent outer padding. The background preserves the quiet dark centre; its top/bottom rows match exactly for vertical scrolling, with only 64-pixel edge bands normalized.

The runtime contract is `assets/starflight/manifest.json`. `ships`, `effects` and `background` entries provide paths, sizes, source/runtime hashes and dimensions. Ship `pivot:[.5,.5]`, `muzzles` and `engines` are normalized coordinates relative to the complete sprite canvas. Draw a sprite at its centre, using its full canvas aspect ratio; do not crop around the glow a second time. The white marker dots in `art/starflight/native-extraction-proof.png` show authored muzzle origins; they are proof annotations rather than baked sprite pixels.

| Sprite | Runtime pixels | Current world size | Direction |
|---|---:|---:|---|
| Player interceptor | 320×288 | 52×46.8 | Up |
| Scout | 256×288 | 40×45 | Down |
| Heavy gunship | 448×384 | 74×63.43 | Down |
| Dreadnought | 768×576 | 196×147 | Down |

`solidBounds` excludes faint outer glow and is a visual reference, not an automatically admitted damage shape. The gameplay model owns fair ship hit radii and projectile collision. Each muzzle is placed at its actual barrel tip. Enemy craft have one, two and three firing origins respectively; the player has two forward barrels. Separate cyan/coral pulse, impact and exhaust sprites are optional candidates; the dedicated weapon family may replace them. The exhaust includes a small nozzle collar and should sit behind the ship's existing rear hardware if used.

`native-extraction-proof.png` and `asset-checks.json` show deterministic raster/anchor checks and phone-scale composition. They are staged asset proofs. Actual scrolling, firing, impact motion, collision, input, performance and device testing belong to the integrated prototype review.

The integrated model and renderer share the sizes above through `src/starflight/geometry.js`; the earlier staged proof uses its original suggested sizes. Enemy compound hulls are explicitly authored, and player damage uses a forgiving seven-unit core.

The dedicated weapon source is `art/starflight/weapons-source.png` (1536×1024 RGBA). Its exact prompt is retained in `weapons-prompt.md`. Run `python art/starflight/extract_weapons.py` to recreate six 256×256 padded alpha sprites under `assets/starflight/weapons/`. The manifest records source hash, source cell rectangles and measured projectile contact pivots. Runtime maps plasma to ordinary cyan fire, enemy to coral plasma, hyper to violet barrage, and the other cells to muzzle/explosion/stasis feedback. Lance uses a rotated Canvas streak aligned to physical velocity. All 19 new source/runtime PNGs passed decoding and empty-metadata checks on 2026-10-20.

## Additional enemy and equipment families

`art/starflight-v2/` retains the transparent source sheet, prompt, deterministic extraction, anchor checks and staged proof. `assets/starflight-v2/manifest.json` records the beetle, frigate, crescent guardian, asteroid, gravity and wormhole sprites. Nineteen authored hardpoints lie on solid source pixels. Current beetle/frigate/crescent widths are 40/74/196 world units; `src/starflight/geometry.js` is authoritative. Earlier manifest suggestions and staged proof scales are historical. The open crescent notch has a matching open compound collision hull.

`art/starflight-arsenal/source.png`, `SOURCE.md` and `extract.py` preserve the equipment sheet and extraction. `assets/starflight-arsenal/` contains eleven 192×192 padded sprites: laser, hyper, seeker, spiral, drones, nova, stasis, repair, shield, missile and drone. The seven equipped powers use these actual icons in the circular reactor's chooser. Repair/shield artwork is preserved without implying an additional selectable ability. Manifests record orientation and source rectangles.

All three source families and runtime assets are preserved in `artwork-library/`. The prototype currently uses textured projectiles and explosions with procedural motion. The campaign's differentiated per-role breakup sequences, physical rescue pods and permanent ship attachments remain planned work in `docs/STARFLIGHT_CAMPAIGN.md`.
