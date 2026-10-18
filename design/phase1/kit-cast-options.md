# Kit Ward cast — selected physical shield

Status: **owner selected A, spinning shield unfolds into brick armour**. Production frames and render helpers are complete; combined-game integration and final phone QA remain pending. Kit’s left control always displays his face. No fullbody cast from the unselected B study is admitted to production.

A real heater shield appears just outside the face orb, spins toward the marked partition, then splits along its centre seam. The two halves hinge outward as steel/enamel plates open and clamp around the actual brick. The brick remains visible through the settled frame. The flight has no connecting light path, damage or collision; it delivers the existing single-volley Ward visually. Charge cost, warning, input deadline, target geometry and protection duration remain unchanged.

## Production contract

| Phase | Time after a valid cast | Action |
|---|---|---|
| Anticipation | 0–0.05 s | Heater shield appears outside the face/control boundary; face shows Focus. |
| Flight | 0.05–0.30 s | Sixteen actual 3D spin views follow a compact curved flight. Only the shield is drawn, without a trail. |
| Deployment | 0.30–0.46 s | Twelve actual hinged-shield/plate frames open into brick armour. |
| Hold / recovery | Existing volley and short tail | Final armour holds on the target, then fades during the existing 0.25 s tail. Kit’s face follows the outcome and live danger. |

The latest legal cast occurs at warning time 1.22 s. The remaining 0.18 s warning plus 0.32 s breath-to-impact allows **0.50 s**. Armour settles by 0.46 s, leaving 40 ms before that earliest impact. The earlier study’s slower 1.04 s settlement is superseded; combat rules were not extended for an effect.

- Reproducible source: `art/kit_cast.py`; independent prop scene using Kit’s existing heater profile, cobalt enamel, silver rim and lighting. No external character model is required.
- Shipping inputs: `assets/kit-cast/Spin_00.png`–`Spin_15.png`, `Armour_00.png`–`Armour_11.png`, and `meta.json`. All are RGBA 256 × 256, centre pivot (128,128), 2× supersampling, Cycles 32 samples.
- Manifest: `kit-cast-manifest.json`. All 28 frames are distinct, have transparent borders and stripped PNG metadata. Alpha unions: Spin (50,32)–(206,228); Armour (57,59)–(199,211).
- Packed contract: `ART.kitCast`, cell 256, Spin row 0/count 16, Armour row 1/count 12, timing from `meta.json`. Atlas 4096 × 512; quality 90 WebP estimate 155,436 bytes; decoded 8 MiB.
- Editable scene, contact sheet, actual native motion and assertions stay under ignored `out/kit-cast-proof/`.

## Integration handoff

`gfx.js` exports `drawKitCastFlight(g, from, to, age, scale)` and `drawKitBrickArmour(g, x, y, age, size, alpha)`. Use `venom.ward.age` for both. Draw armour in the existing zoomed world pass at the target’s world centre with a 40-unit cell. Draw flight after the deck in the unzoomed pass, projecting the destination through the current `zc` each frame; destination size is `40 * zc.z`. The launch stays outside the face ring.

Replace the superseded translucent target rim and `drawWardTransfer` curve, rather than drawing both. Reset `globalAlpha=1` before the armour helper because the venom branches change it. Retain the existing tail condition and pass `max(0,1-venom.t/0.25)` during cool. Both callers require active `state==='play'`, `phase==='rescue'`, `venom.phase!=='idle'`, and a current ward/target. Escape/result/idle may retain old references; they must not retain a frozen shield flight.

## Proof and remaining check

The isolated helper proof uses the actual new `gfx.js` functions and production frames over face-always baseline SHA256 `485F921A73977C325E535A3500CEA967CB00B16A63042D15110F4D2D31073DF0`. That baseline stayed unchanged. Early casts, the exact latest legal cast, and a camera changing from 1× to 1.08× pass at iPhone 393×852 and Android 412×915: one charge spent, target held, zero melted partitions, armour aligned with the projected target, no body-atlas draws or page errors. Negative/pre-arrival/arrival/final-frame helper boundaries pass. Direct render-lifecycle fixtures confirm escape/lost/won/idle suppress both effects.

Evidence: `out/kit-cast-proof/{capture-production.mjs,capture-report.json,interruption.mjs,interruption-report.json,asset-checks.json,kit-cast.blend,contact-sheet.png,kit-cast-native.gif}`. Final approval still needs the combined packed build’s real input, late-cast, camera, interrupted-state and native screenshot checks. Physical-device comfort and final audio are not established by this isolated proof.

The original selection boards remain `img/kit-cast-a.png` and `img/kit-cast-b.png`. Their slower studies and the separate B actor remain exploration history under `out/kit-cast-options/`; they are not the shipping timing or an approved second cast.
