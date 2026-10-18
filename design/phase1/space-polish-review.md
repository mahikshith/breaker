# Space pacing, stacking and proposed effects

The owner's latest phone/web feedback supersedes the earlier six-hit power balance: Easy must remain winnable without ending before its mechanics matter. The owner also requests substantial enemy cannon fire, a volume of suction around abducted crew, medieval powers for Kit, canonical cosmic-ball artwork and beneficial repeated pickups.

## Implemented pacing and pickups

All three space levels use18/22/26 productive ordinary hit credits on Easy/Medium/Hard. Credits are banked, then fill the orb at one credit per active combat second. Thus even rapid multiball hits cannot instantly refill it. Laser shots, active cosmic balls and passive destruction do not earn their own replacement power. Menus, pauses and transitions freeze charging; time alone earns nothing. A cast clears its bank. The orb retains the existing visible progress ring and paused three-choice input lifecycle.

Carrier has5/6/7HP crew housings and45/60/78HP hulls. Circuit hulls use72/96/120HP with broad ordinary damage, optional stations and the earned skiff burst. Forge retains its modest18/22/26HP stabilisers,54/66/78HP hull and12/15/18HP external reactor. Do not restore inflated Forge pools: the rapid recharge was the main problem. No precision gate, closed-window immunity or arbitrary minimum victory timer was added.

WIDE increases its tier on another active pickup, adds12seconds and widens both the collision area and artwork. The width is bounded by the actual playfield with16world-units of movement room. The three space paddle renderers, including Circuit's morph/return poses, share three-slice drawing to preserve chrome ends. FIRE, LASER, SLOW and SHIELD add duration; shields add saves. The ball fan adds four ordinary survivors rather than rejecting an already split set. Repeated cosmic casts power another ordinary survivor first, then extend a powered survivor if none remain. The existing60-live-ball ceiling remains; a blocked fan choice keeps the charge. Ordinary ball art is unchanged; all three space cosmic balls now use the existing `gfx.drawBall` cosmic sprite/halo/trail.

## Design picks pending

The owner originally requires image alternatives and a pick before building new designs. These are actual-asset **proposals**, not live gameplay screenshots:

- Ship effects A: [magnetic funnel and plasma shell](img/carrier-effects-study-a.png).
- Ship effects B: [suction chamber and twin-rail shell](img/carrier-effects-study-b.png), recommended for clearer inward flow.
- Kit A: [Royal Armoury, two rows](img/kit-powers-study-a.png), recommended for larger labels/targets.
- Kit B: [Quick Volley, one row](img/kit-powers-study-b.png).

Both Kit proposals retain the face icon and offer Brick Ward, Arrows, Cosmic and Ball Fan. Ward must preserve the real venom warning/brick protection and first-use coach. Arrow projectiles should reuse the existing physical shot collision with medieval art. The cosmic ball must reuse the existing canonical effect. New ship FX and live Kit choices remain unimplemented until the two picks arrive; the current Carrier curved line remains in the playable build. No proposal is silently approved by archiving it.

## Evidence and limits

Current pacing-only hub: `http://127.0.0.1:4187/`. Earlier4186 and the delivered APK are unchanged. The working4187 builds may change during this revision; exact receipts below bind their tested HTML hashes.

- [Phone control report](../../out/space-polish-review/phones/report.json):18 actual Main/CDP cases across three levels, three modes and both phone sizes; choice/cancel, clock freeze, visible Nix, powers, pause/Retry and repeated WIDE; zero page errors. Charge is explicitly staged with clock-only filling in this input fixture, not claimed as earned gameplay. The final18-case rerun covers the final chrome helper and matches all three current HTML hashes; the earlier control report is retained under `history/phones-pre-final-cap/`.
- [Carrier earned coarse Easy](../../out/space-polish-review/carrier-after/report.json):32.54s iOS /55.01s Android, versus13.05/18.45s under the same earlier policy. Three lives, no pickup capsules/Continue. Android's second earned cast is19seconds after its first.
- [Circuit earned coarse Easy](../../out/space-polish-review/circuit/coarse-smooth-72/report.json):34.89/52.76s, three lives. First earned fan at19.50/23.39s. iOS also collects legitimate SPLIT/LASER pickups. Alternate TITAN-first routes are retained in the level brief.
- Forge's fourth calibration attempt:38.28/49.90s, three lives, first earned fan19.77/26.23s. Historical unsuccessful/inflated attempts are preserved rather than relabelled; see [Forge brief](orbital-forge.md).
- Native staged WIDE/cosmic proofs: [Carrier](../../out/space-polish-review/carrier-wide/report.json), [Circuit](../../out/space-polish-review/circuit/wide/report.json), [Forge](../../out/space-polish-review/forge/render-proof/). These verify render geometry, not unassisted human balance.

The scripted win times are route/recoverability evidence, not a promised human duration or physical phone performance. Fast natural power combinations remain legitimate. Medium/Hard input works, but human difficulty calibration remains open. All183 unit tests, the build, required iOS/Android polish/layout and compact mobile UI checks pass. Final HTML hashes are Carrier `d189f0cc5e99efbe3ce8c660ed5710fcc0da331cf33c61bc4d6fcb22c61249b2`, Circuit `9ba578b4999f3fdc6b27b625c72a4d7fa36d37e34e63c16306e6b7cb26a68541` and Forge `68598e4cdba358a92235d85d0b505e7bb1f8d37b1d626af38b99f07bb833ec64`. Current production HTML is `d7868664c10cb302aef105b8579c1b14a68dd099518fd0547563fa899eaf39ec`; it retains Carrier/Vault permanent menu entries. Exact evidence is sealed in `out/space-polish-review/final-report.json`.

The artwork library now preserves666 unique originals/asset records,674 source aliases/versions and250295934bytes, including all four new proposal boards. See [preservation rules](../../docs/ARTWORK_LIBRARY.md).

No commit, push, new APK or permanent Circuit/Forge menu admission is implied. The latest message first authorizes immediate push, then asks to wait for a comment; resolve that contradiction after the complete visual/gameplay review is concrete. Existing earlier screenshot approval rules remain relevant.
