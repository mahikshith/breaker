# Replacement weapon motion studies

Status: rejected by the owner. Enemy cannons must bypass the intact brick field and threaten the player; the staged panel destruction below communicates the wrong combat rule. The payloads and weak discharge were also rejected. Preserve these files as history, not implementation targets. The replacement scope is in [weapon-vfx-v3-review.md](weapon-vfx-v3-review.md). The prior Hard laser/lance and battery boards were also rejected. The owner requires acceptable animation before authorizing gameplay implementation.

## Two candidates

- **A — Magnetic breacher:** a closed, machined silver/gunmetal projectile with recessed violet energy, a tight exhaust and accelerating launch. The actual cannon aperture gathers energy, lights the surrounding metal and recoils.
- **B — Reactor rupture:** heavier, exposed fractured reactor hardware with lit fissures and containment armour. Its release, slower tumbling travel and contact breakup are distinct from A.

Both studies retain the exact Carrier, Circuit and Shutter Forge ship/cannon artwork. Charge cells are transparent Blender renders. Flight uses the actual candidate PNGs with animated position, rotation and light; the complete scene is not a moving still image. Impact uses fragments of the original target panel. Rejected bead-like impact drafts and procedural flight seeds remain historical references, outside the final review selection.

## Review and sources

The isolated review is at <http://127.0.0.1:4189/>. It has A/B, replay, pause, normal/half speed, scrubbing and iPhone393×852 / Android412×915 selections. On narrow screens, select each of the three ships individually.

- Actual artwork and alpha/metadata/hash checks: [weapon-vfx-v2/README.md](weapon-vfx-v2/README.md), [asset report](weapon-vfx-v2/asset-report.json).
- Editable charge source: `art/space/weapons_v2.py`; saved scenes and rejected revisions: `art/space/weapons-v2/`.
- Review compositor and capture scripts: `tools/weapon-vfx-review/`.
- Frozen native scenes, selection, media and review receipts: `out/weapon-vfx-v2/`.
- Artwork preservation: [permanent library](../../docs/ARTWORK_LIBRARY.md).

The six bases are frozen captures from the actual current game, with a corridor cleared only in the temporary page to inspect the effect. One original panel is isolated for staged breakup. This is an animation study; it does not simulate enemy damage, ball play or difficulty. Payload display size is not an admitted collision radius.

## Implementation gate

Final moving copies: [A — Magnetic breacher](weapon-vfx-v2/review/magnetic-breacher.webm), [B — Reactor rupture](weapon-vfx-v2/review/reactor-rupture.webm). Exact animation-frame boards: [A](weapon-vfx-v2/review/magnetic-breacher-contact.png), [B](weapon-vfx-v2/review/reactor-rupture-contact.png). Native PNG frames and the live review are authoritative; VP9 delivery uses a quality100/4:4:4 JPEG pipe, and GIF copies are viewing conveniences.

Independent visual/control review passes12 family/phone/cannon combinations with132 phase captures and157 sampled times per family/phone. The B contact fracture was corrected to five unequal jagged source-metal fragments and reviewed again at impact+0.16/+0.30 on all three cannons/both phones. Page, HTTP, network and overflow checks pass. All14 protected files and four served4188 routes remain exact. Both final movies decode at1240×1000,5.209seconds, with distinct seeked frames and no browser errors. Receipts: `out/weapon-vfx-v2/qa/final/QA.md`, [final capture report](weapon-vfx-v2/review/report.json), [video checks](weapon-vfx-v2/review/video-report.json), [independent seal](weapon-vfx-v2/review/qa-seal.json). Final renderer SHA256 is `27923de30d50d1b9a334d583656b7b946a97c4b19ff0b8677fe3a367e5667eff`.

The prototype paints all three 2× canvases. Source images occupy about64.7MB decoded, plus16.1/18.1MB canvas backing and0.53MB light canvases. Desktop forced-readback cycle median is7.8–8.5ms, p95 is10.1–10.9ms, with a41.9ms worst cycle sample. These measurements do not admit the assets to a production mobile memory/performance budget; runtime packing and handset checks remain after selection.

The current4188 playable review, production bundle and gameplay source remain frozen against `out/weapon-vfx-v2/baseline.json`. No new Hard weapon rule, charging delay, damage, cover, defence, commit/push or APK is authorized by these visuals. After the owner accepts a direction, implement and calibrate it with real collision/warning footprints, reachable counterplay and phone playtests before the separate gameplay approval.

Only the two charge atlases are complete rendered sequences. The flight PNGs are single-frame artwork animated by the compositor. No complete Blender flight/impact atlas is implied. Native browser rendering cannot establish physical-phone performance or human difficulty balance.
