# Bellforge and Tidewheel reaction keyposes

The separate reaction family adds a live furious Nerra body and earned-victory dazed/fainted poses for Nerra and Korr. These are five raster keyposes with measured anchors, not a skeletal animation rig. The original base family, Nerra v2 family and water projectile remain unchanged.

## Source and reproduction

- Original sheet: `source/reactions-v1.png`, RGBA 1024×1536; SHA256 `67cefe6a3b15f485a2985d899fba7132c9f18bfc8777054ab4e3bcdc009a4606`.
- Exact prompt: `reactions-prompt.json`. Visual references were the existing `nerra-v2-idle.png`, `nerra-v2-pull.png` and `korr-idle.png` under `assets/fantasy-machinery/`.
- The sheet preserves the coral/oxblood castle-shell, teal eyes, cream jaw and eight short walking legs of Nerra; Korr retains the ruby/plum armour, ivory tusks, amber eyes and pink snout.
- Reproduce deterministic extraction from the repository root with `python art/fantasy-machinery/extract-reactions.py`, then verify and assemble the staged proofs with `python art/fantasy-machinery/proof-reactions.py`. Pillow and NumPy are required. Preserve the source sheet and prompt when cloning or archiving.
- The extractor isolates the five alpha-connected figures, normalizes each species to its existing supporting-foot pivot, applies measured shoulder anchors, clears transparent RGB and writes PNGs without metadata. The source remains intact.

## Runtime contract

Manifest: `assets/fantasy-machinery/reactions-manifest.json`, SHA256 `11b2958079f617c556b8d8155195a156dc08f10fc69afe7f7e86f639a6317544`.

| Manifest key | Runtime PNG | Canvas | World unit | Supporting-foot pivot | Use |
|---|---|---|---|---|---|
| `nerra.fury` | `nerra-fury-v1.png` | 640×576 | 190.08×171.072 | `[.5,.9375]` | Live fury, with the matching new geometry |
| `nerra.dazed` | `nerra-dazed-v1.png` | 640×576 | 190.08×171.072 | `[.5,.9375]` | Earned victory presentation only |
| `nerra.defeat` | `nerra-defeat-v1.png` | 640×576 | 190.08×171.072 | `[.5,.9375]` | Earned victory presentation only |
| `korr.dazed` | `korr-dazed-v1.png` | 512×448 | 170.6667×149.3333 | `[.5,.8839285714]` | Earned victory presentation only |
| `korr.defeat` | `korr-defeat-v1.png` | 512×448 | 170.6667×149.3333 | `[.5,.8839285714]` | Earned victory presentation only |

All paths in the manifest are repository relative. Each entry contains `path`, `size`, `unit`, `pivot`, `frame`, `frameRect`, `footUV`, `sha256`, source crop/transform, alpha/solid bounds, measured anchors and `terminalOnly`. Every image is a separate one-frame texture. No atlas row convention is needed.

Nerra is **body only**: the eight small walking legs are present, but the two large combat claws are separate parts. Draw the existing crusher and chain-gripping claw once, attached to the selected body's measured sockets. Terminal poses have lower shoulders and must use their own sockets. Their data has no live damage or collision authority.

Fury anatomy is exported by `reactions-data.mjs` as default `{nerraFury:{frame,frameRect,unit,pivot,footUV,sockets,circles,sourceSHA256,spriteSHA256}}`. Module SHA256: `a4f3ec81c4d50e17279af8805ad30da8ee8406e2ecd9da28fed503ecc3e266ae`. Coordinates and disk radii are world units relative to the supporting feet; do not scale them a second time.

Fury sockets are crusher `(-19.0050240481,-69.3527423581)` and gate `(64.2454448898,-58.2677685590)`. The new live silhouette must switch together with this geometry and these sockets. It must not inherit the idle/pull collider merely because the canvas and pivot match.

## Verification and limits

`proof/reactions/verification.json` SHA256 `7b1c18d29fbd7dae26b7469afa2491598593b8d4d5437e55023a05bb2704597c` records exact source, module and sprite hashes. All five PNGs have empty metadata, zero alpha on every outer edge and zero RGB beneath fully transparent pixels. Total: 1,899,108 encoded bytes and 6,258,688 decoded RGBA bytes.

The live fury body has 90 measured disk components, all inside alpha≥128. A 6-unit normal ball reaches 100% of the opaque silhouette; maximum opaque-to-proxy gap is 5.849546 units. Feet-local opaque bounds are `[-82.269,-151.767,82.863,0.297]`. The independent articulated claws retain their own measured geometry. This is a broad compound silhouette, with no padding rectangle across leg gaps.

The source contact sheet and native-sized assembled proofs are in `proof/reactions/`. They show a planted, open-mouth furious face, an uneven-eyed dazed reaction and a visibly lowered/fainted body. Korr's four hooves and armour settle onto the plinth; Nerra's folded legs and relaxed jaw rest on the rear coping. These are explicitly staged art assemblies. Runtime phase ordering, moving claw attachment, refuge clearance and actual earned victories require the integration owner's current native captures; source verification does not establish those gameplay results.

## Original Vault presentation recommendation

Keep the existing Lumi/princess animation cells, snake expression family and camera/alpha registrations. The cage, tower and brick coordinates are registered to the original plate. Repainting individual animation frames would introduce face and silhouette drift. The safe improvement for this pass is the integration owner's registered masonry entrance and environmental lighting/dressing around the original assets, while preserving the existing serpent body/head motion and princess face rig. No new Vault character asset or animation replacement is part of this reaction family.
