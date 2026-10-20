# Emerald serpent expression family

This versioned family replaces the simple rendered head presentation with richer emerald scales, broad soft reflections, shaded lower planes, pale mint lower jaw and larger readable eye/brow/mouth poses. It preserves the original serpent identity and runtime framing. The original `assets/snake-jade/` family remains intact.

## Source and preservation

- Reference-directed source sheet: `source/heads-v1.png`, RGBA1024×1536, SHA256 `ce924290a0c5cc2670d492d40eb75f0fb8241aa686af220a5c291b60833d3952`.
- Exact prompt and reference paths: `prompt.json`. The original jade idle/snarl heads establish identity, palette and view; Korr/Nerra establish material depth and lighting quality.
- Runtime manifest: `assets/snake-emerald/manifest.json`, SHA256 `d07cce6d9c7732be361cbe6b759831ad513597907871c318ad26815639aa704a`.
- Runtime metadata: `assets/snake-emerald/meta.json`, SHA256 `f8e9f9f937740e9096ba1c173de2ea378263572fed402c203a1bfad92ea12977`.
- Reproduce the deterministic normalization with `python art/snake-emerald/extract.py`; verify actual files with `python art/snake-emerald/verify.py`. Requires Pillow and NumPy. Preserve the source sheet before extraction; runtime copies have transparent RGB cleared and no metadata.

## Exact runtime contract

All26 canonical files are `assets/snake-emerald/head_<expression>_<r|l>.png`, each256×256 RGBA, `box`/worldunit44, centre pivot `[.5,.5]`. The packer can use explicit `cell:256`; `px` is256/44. All13 existing expression names and both facing rows remain present in their previous order.

Ten authored right-facing keyposes are `idle`, `blink`, `taste`, `hunt`, `chew0`, `chew1`, `hiss`, `ouch`, `dizzy`, `grin`. The left row is an exact pixel mirror. Three legacy keys intentionally reuse compatible artwork: `shock→idle` retains open alert eyes, `snarl→hunt` retains angry focus, and `strike→hiss` retains the open-fang attack mouth. These are explicit mappings, not13 separately authored faces. Runtime recoil, breathing, head rotation and expression timing remain separate presentation layers; the family is not a new skeletal rig or interpolated animation.

One common0.33 source-to-cell scale and measured source core anchors preserve skull volume. At normal existing1.45 draw scale, opaque non-tongue head widths are29.4078–31.1523 worldunits. The thin taste tongue extends beyond that base footprint and has no collision authority. All centre points remain visibly on the head. No grid, route, ball, bite/damage radius or other gameplay geometry changes are encoded here.

`meta.mouths[expression][direction]=[dx,dy]` records the visible mouth outlet in local worldunit44 coordinates relative to the sprite centre. Apply the same head translation, rotation, breathing scale and existing draw multiplier to this outlet as to the sprite. The left outlet mirrors X exactly. An annotated source proof is `proof/anchors.png`; warm circles mark mouth outlets and pale crosses mark the unchanged head centre. Mouths are measured per authored pose, then inherited by the three aliases.

Palette seam targets remain body `#168f83`, belly `#c9e8d2`, crown `#0b5d59`, outline `#052d31`, coral brow `#ff8a9b` and mint markings `#83e4c2`. The short rear skull is deliberately dark so it blends with the rendered body; no long neck or separate body sprite is baked in.

## Verification and admission

The source contact proof includes both256px cells and actual393px phone-scale heads. Every runtime image has empty metadata, transparent outer edges and zero RGB beneath alpha0. All left images mirror exactly; alias pixels match their named source; each head centre and measured mouth outlet lie on alpha≥128 pixels. Total encoded runtime PNGs575,649bytes; the13-column/two-row packed atlas decodes to6,815,744RGBAbytes.

`proof/verification.json` records extraction and native-scale measurements. `proof/source-verification.json` independently rereads the source/meta/runtime files and validates hashes, mirroring, alias ownership, alpha and anchors. These proofs establish the source family and registration. Final integrated native entrance rotation, body/head seam, venom origin and actual gameplay motion require the current browser receipts; a static contact sheet does not establish those results.
