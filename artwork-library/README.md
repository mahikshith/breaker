# Artwork library

Permanent copies of the concept boards, source artwork, finished space parts, selected character atlases and historical character renders. Open the [preserved space boards](SPACE_BOARDS.md) or browse the [complete catalogue](CATALOGUE.md). The table links to the corresponding working families.

| Family | Working reference | Reusable finished assets |
|---|---|---|
| Carrier Breakout — A | [Board](../design/phase1/img/space-carrier-a.png) | [Hull, fighters, guns, crew and panels](../assets/space-a/) |
| Relay Raiders / Circuit Breakout — B | [Board](../design/phase1/img/space-relay-b.png) · [Gameplay study](../design/phase1/img/relay-variety-study-v3.png) | [Relay parts](../assets/space-b/) · [Circuit craft and badges](../assets/relay-circuit/manifest.json) |
| Orbital Breakout / Shutter Forge — C | [Board](../design/phase1/img/space-orbital-c-v1.png) · [Gameplay study](../design/phase1/img/orbital-variety-study-v3.png) | [Orbital parts](../assets/space-c/machinery.json) · [Forge machinery](../assets/orbital-forge/manifest.json) |
| Eclipse Rescue — D | [Board](../design/phase1/img/space-eclipse-d-v1.png) | Reference direction; no finished gameplay family |
| Nix and Tick | [Selected Carrier cast](../design/phase1/carrier-companions.md) | [Expressions and animation atlases](../assets/space-companions/manifest.json) |
| Rejected panel-impact weapon studies | [Historical review](../design/phase1/weapon-vfx-v2-review.md) | [Preserved payloads, charge atlases and receipts](../design/phase1/weapon-vfx-v2/README.md); rejected |
| Paddle-targeting cannon and cast studies | [Corrected combat scope](../design/phase1/weapon-vfx-v3-review.md) | [Selected compact plasma and original cast references](../design/phase1/weapon-vfx-v3/README.md); both heavy and salvo are approved and implemented |
| Vesper and Latch | [Circuit identity](../design/phase1/space-companion-role-review.md) | [Runtime expression/motion atlases](../assets/circuit-companions/manifest.json) |
| Frost Warden | [Encounter and physics](../docs/BRUM_LEVEL_PLAN.md) | [Measured rig atlas](../assets/frost-warden/manifest.json) and [licensed source](../art/frost-warden/SOURCE.md) |
| Starflight / Last Light | [Source family and extraction](../docs/STARFLIGHT_ART.md) | [Ship/environment manifest](../assets/starflight/manifest.json) and [weapon manifest](../assets/starflight/weapons/manifest.json) |
| Kit, Brum and earlier cast | [Design briefs](../design/phase1/) | Browse `assets/` and `renders/` in this library; rejected drafts are historical references |

`concepts/` holds design images and motion studies. `sources/` holds original space artwork. `assets/` holds normalized reusable sprites. `renders/` preserves earlier character studies, including rejected alternatives. Presence here does not imply design or gameplay approval. Existing working source paths remain authoritative for runtime packing and editing.

Run `python tools/archive_artwork.py` from the repository after adding artwork. It verifies every preserved file, copies new artwork without changing its bytes, records source aliases and full hashes, and preserves a changed source as a new version. Exact duplicates share one archive copy. Never edit or replace the archived originals; edit the working sources and archive the new version.

Current verified coverage is 918 unique files, 940 source aliases/versions and 320,069,413 bytes (2026-10-20). All archive hashes and byte counts match; no publication candidate exceeds 20 MiB. The prior publication audit found no metadata in 1,251 new PNGs; the Starflight addition checked all 39 Starflight source/runtime PNGs with empty metadata. Existing tracked render metadata was left intact.

Scope: artwork in `design/phase1/img/`, original artwork under `art/space/`, Frost Warden renders under `art/frost-warden/`, candidate weapon artwork/motion and JSON receipts in `design/phase1/weapon-vfx-v2/` and `design/phase1/weapon-vfx-v3/`, the twelve named new sprite families under `assets/`, and the six character-study output folders listed in the script. WebM motion studies are preserved alongside images. Gameplay screenshots, temporary runtime texture packs, dependencies and third-party model files stay in their existing locations; they are not original artwork. Editable weapon scenes and their generator remain at `art/space/weapons-v2/` and `art/space/weapons_v2.py`. The Warden's permanent licensed model, source notes and versioned editable scene remain under `art/frost-warden/`, with the renderer at `art/frost_warden.py`. The catalogue and manifest list the exact coverage. Everything is local until an approved repository push or separate backup.

The first repository publication normalized seven older render previews to remove PNG metadata without changing any decoded pixels; original and normalized hashes are recorded in PRECOMMIT_NORMALIZATION.json. One historical failed texture download is preserved as .html.txt, not a usable image. Runtime assets do not use it. Subsequent archive copies remain byte-for-byte copies of their recorded sources.

Starflight extends the scope with original sheets/proof under `art/starflight/` and runtime PNGs/manifests under `assets/starflight/`. Prompt records and extraction scripts remain at their working source paths and are versioned with the prototype.

The additional Starflight enemy, hazard and equipment originals are preserved under `sources/starflight-v2/` and `sources/starflight-arsenal/`, with normalized assets in the corresponding `assets/` folders. Working prompts and extraction scripts remain in `art/starflight-v2/` and `art/starflight-arsenal/`.
