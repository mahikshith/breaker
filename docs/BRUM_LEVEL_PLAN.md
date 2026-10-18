# Frost Warden: a separate princess siege

Current status: gameplay and packed browser verification, including the final menu-thumbnail crop, are complete and frozen, authorized by the owner's explicit delegation to choose and build the new level. This replaces the earlier proposal-only hold. `src/frost.js` is the independent Arena level at stable menu/save slot 4. Commit and APK delivery remain separate milestones. No current native delivery claim is made here.

## Identity and objective

Brum is still the friendly Yeti porter from the earlier proof. The Frost Warden is a distinct hostile frost guardian using the retained source Yeti anatomy and rig. Its new frost-blue/slate palette, hostile expressions and attack clips belong to a separate atlas. Neither Brum's source proof nor his ally role is overwritten.

Lumi shelters on the right of a cold castle chamber. The Warden approaches from the left, attacking three dedicated defensive posts in sequence. The player defeats the Warden through broad ordinary ball impacts before the last defence collapses. Player score bricks provide angles and optional powers; the Warden never destroys them. There is no required symbol order, narrow weak-point gate, purchase, power capsule or companion activation.

The unselected alternative, Brum carrying Lumi over a collapsing bridge, stays historical planning only. It is not implemented alongside this encounter.

## Authored geometry

All values are in the existing 360-unit portrait world. Both phone sizes share the map; Arena retains the 126 CSS-pixel lower reservation, 52 CSS-pixel Kit control and safe-area integration.

| Element | Geometry / ownership |
| --- | --- |
| Coloured score bricks | 36 equal 36×18 rectangles; columns x=54,96,138,180,222,264; rows y=266,292,318,344,370,396. All 1 HP. Lowest solid edge y=414. |
| Clear return routes | Left gap 42 units and right gap 48 units, wider than a 20-unit cosmic ball plus margin. Flank shots and wall banks reach the Warden. |
| Dedicated defence posts | x=148,192,236; y=146; width 18, height 68. Entire post remains physical while HP>0; visible cracks/pips show lost strength. At zero it crumbles and its collider disappears. |
| Warden | Actual rendered atlas at scale 1.2. Broad torso rectangle and attacking hand circle are measured from projected source geometry. Compound pieces share one contact ID to prevent overlap double damage. |
| Stances | Derived from each post and the measured maximum fist reach, rather than independently stretching an arm. The same raster transform places the measured body and hand. |
| Lumi | Foot anchor (299,202), existing expressive princess atlas. Non-damageable friendly figure, separate from the Warden. |
| Chamber ledge | Explicit physical rectangle x268,y202,w60,h12, drawn behind Lumi. |
| Back-wall promenade | Low-contrast perspective scenery: rear edge under the post bases (y=214), front edge/shadow at the real Warden foot baseline derived from the strike anchors. Balls cross in the foreground; this is not an invisible full-width collision slab. |
| Paddle | 100×14; shared ball radius 6, existing speed 345 and rally maximum 1.28. No speed change. |

The lower brick edge gives about 200 units of return space on the iPhone layout, approximately 0.58 seconds for a straight normal downward ball and 0.45 at the rally speed cap; Android is taller. These are vertical travel calculations, not human reaction or real-device measurements.

Six fixed optional caches are WIDE, SHIELD, SPLIT, SLOW, FIRE and LASER. The small pale diamond marks a cache; it is not a different required brick dimension. Existing effects and collection rules apply. Enemy post damage gives no score, combo, charge, drops or farming rewards.

## Arm physics and state machine

`idle → windup → strike → recover` repeats while a post stands. Destruction leads to `advance` along the upper path to the next post. Sufficient normal contact during windup gives `stun → idle`. A broad body or hand contact always lowers Warden HP, including outside the interruption window. Shots deal 1 damage; cosmic contacts deal 3. Ordinary productive contacts bank Kit credit; arrows and active cosmic contacts do not.

The visible arm follows actual source-rig frames. The atlas publishes a projected hand circle and torso bounds per frame, in world units relative to the feet pivot. Each fixed update sweeps the previous hand centre to the next centre with the measured radius against only the active defence rectangle. Contact damages that post once per strike. It is not a timed deletion, nearest-brick search, whole-wall removal or damage to player score bricks. The player ball uses the existing substepped circle solver against torso, hand, posts and coloured bricks; a stable actor ID deduplicates a continuous overlap episode.

Clip timing is separate from attack cooldown: windup holds readable preparation, then plays the backswing over the last 0.55 seconds. The real four-pose strike occupies the mode's short strike interval. The arm visibly retracts over 0.55 seconds, then loops actual idle breathing for the rest of recovery. Hurt reacts over 0.5 seconds before holding a stagger. The four rendered recovery poses are not spread into multi-second frozen extended fists.

Post metal is unpierceable for player FIRE/cosmic balls and absorbs friendly arrows without damage. This makes its protective purpose explicit; breaking player bricks and hitting the exposed Warden remain productive routes. The Warden hand is a local character attack with one dedicated friendly barrier target, separate from the new space-projectile brick-immunity rule.

First launch starts the siege clock. There is no opening attack while aiming the initial serve. The initial serve auto-launches after 8 active seconds; later fresh serves after 3. Warden warnings, movement and recovery use active real time, including Focus/SLOW and hit-stop. Moving actor velocities are converted into the ball's slowed physics clock. Pause, background suspension and the power chooser freeze the complete encounter through existing Main gating and the level's modal early return.

## Current initial mode values

These are implementation starting values, not a human-validated difficulty guarantee. The initial Easy pacing target was roughly 100–180 seconds without compulsory paid or precision powers; earned playtests record the actual result and natural combo variance.

| Value | Easy | Medium | Hard |
| --- | ---: | ---: | ---: |
| Warden HP | 40 | 52 | 66 |
| HP per defence post | 5 | 4 | 4 |
| First attack delay after launch | 7s | 5.5s | 4.5s |
| Windup | 1.8s | 1.5s | 1.25s |
| Strike | .48s | .42s | .36s |
| Recovery | 3.5s | 2.8s | 2.3s |
| Normal windup contacts to stagger | 1 | 2 | 2 |
| Stagger duration | 2.1s | 1.6s | 1.25s |
| Advance to next post | 1.35s | 1.15s | 1s |
| Earned Kit refill minimum | 18s | 22s | 26s |

Kit uses the existing four-choice Shield / Arrows / Cosmic / Fan menu. Actual productive contacts first bank credit; it fills at no more than one contact credit per active second. Spending clears unused bank overflow. No passive free energy or fast multiball self-refill is added. Existing castle power caps apply.

A full-charge Shield is usable during a real windup/strike before contact. It wards the threatened post for one actual punch, expiring after 10 active seconds if unused. A stagger preserves the earned ward until another actual contact or expiry. It spends once, does not repair posts and does not grant broad immunity. The real existing spinning Kit shield and armour art show cast/held state; no connecting beam is introduced.

## Outcomes and lifecycle

Warden HP 0 immediately latches `rescue`, parks all combat and clears arrows before any late drain or fist contact can defeat an earned win. Lumi cheers; the defeated Warden uses its actual hurt pose. After 1.6 seconds the level reports won. No overlapping new grab/eating animation is invented.

The last post's destruction latches a .95-second `breach` beat: the destroyed post is visible, Lumi reacts, and then loss reports “Chamber breached”. All gameplay mutation stops during results. Out-of-balls remains the other loss condition.

Continue preserves Warden HP, cleared score bricks, score and surviving post damage. If the final post had collapsed it restores only that failed post to at most 2 HP, gives the existing fresh serve/two ball shields, and adds an explicit recovery/grace so it cannot instantly refail. It does not reset player-earned progress or pretend that the encounter was won. Retry constructs a fresh same-mode level through shared Main. Stale pointer/key release cannot launch during terminal intermission.

## Art and integration contract

`ART.frostWarden` is a separate actual rendered family: `{url,cell:[256,228],columns:7,rows:4,unit:[144,128],pivot:[.5,.90625],clips,anchors}`. There are 28 real rig frames, four per idle/walk/windup/strike/recover/hurt/victory clip. Clips accept numeric global frame indices or start/n metadata. Anchors contain measured fist/body data relative to the foot pivot, with projected shoulder/elbow/wrist and both hands retained for audit. The figure faces right at source yaw 65°. No generic circle/box is drawn in place of missing character art; final admission requires that atlas to decode.

Existing castle plate, princess and Kit remain canonical. The Warden family producer owns new source files and normalization; root owns packing and fifth-card integration. This level owns no shared Main, Arena, renderer, packer, prior level or native file.

## Verification requirements and current status

All 15 focused tests in `tests/frost.test.js` pass. They cover initial non-attacking serve, equal map/radius clearances, high-speed broad contact and reentry, sweep/post-only damage, one-contact powered overlap, normal interruption, earned-credit/modal freeze, one-spend ward, physical protected posts, final-hit precedence, terminal freeze, Continue preservation and finite princess source rectangles. Two tests consume the final actual rig manifest: all 18 mode/phone/post combinations land exactly one punch on the correct post with no player-brick reward mutation, and a real 1200u/s incoming ordinary ball staggers before the warning deadline while a later hit remains productive without cancelling the strike. Earlier deterministic projection fixtures remain labelled as fixtures.

The maintained phone runner is `tools/playtest/frost.mjs`, owned by the independent reviewer. All six actual Main cases at 393×852 and 412×915 across Easy/Medium/Hard pass: initial decoded five-card menu, genuine CDP touch aim/drag, Kit's four choices and one-spend Ward, chooser freeze, swipe/cancel, pause, background-handler fixture, fresh same-mode Retry without browser reload/star loss, actual Continue preserving progress, and 18 measured live post/stance cases. There are zero page errors. Those power/phase/loss fixtures are explicitly staged; they are not earned victories or native OS suspension tests. Receipt: `out/frost-phones-final/report.json`.

Source freeze: `src/frost.js` SHA256 `9200DE93113D72A5C692D4F9270F4E3BEC6A5170C7746CDE2761305BD29EFB8D`; `tests/frost.test.js` `B622F3092A5FC7CDAEDBF6BE3A86000D4C16EE3FA2F1480E8FEBCAA0C6D6B813`. The previous source `8C21D183…A318D202` differs only in `previewRect`: the final crop is `{x:20,y:138,w:320,h:100}`, so the compact fifth card shows the Warden/Lumi/posts rather than sky. No gameplay, pacing, contact, art or power rule changed. Final actual family manifest is `F6114EEBCEB42D65547D5EEA78645916E603468941D1240696FA6EF9B2C2AD0E` (read the canonical file for full provenance and rig anchors).

A bounded public-input Node assist using those actual rig anchors cleared Easy at 104.8s iPhone geometry and 77.9s Android geometry without manual Kit. Natural capsules were SLOW on iPhone and FIRE/SLOW/SPLIT on Android, so these are not strict no-power wins. Earned Kit runs cleared at 73.9/53.7s. These read-only simulations under ignored `out/frost-review/coarse.json` changed no HP, lives, charge or phase through fixtures. They establish a recoverable route for that controller, not human balance or browser performance. No pacing change was made to fit those receipts.

## Packed browser and animation receipt

The initial Main phone, earned-gameplay and motion receipts use frozen HTML SHA256 `E49DDC6838759A687067EED5A4375A7FCBF5B1210111BCD55FCA96C37FCD30F4` before the menu-only crop above. Both start/end hashes match. The earlier four levels and their stable slots remain intact.

The final canonical HTML is `B06CDD969BCF5C420A74B3CF37A3EAC45FE3D46EABB2926F5E5D2B8A42E01770`. All six Frost cases were repeated on that exact build and passed with matching before/after hashes and zero page errors. Canonical receipt: `out/frost-phones-canonical/report.json`, SHA256 `0DA34BF33BDCBB3676323DBF6057DB25AD62481532E0E331710F871F6C37B44C`. Actual final review inspected the corrected first menu, pre-contact Ward armour, and settled three-star staged win. The fifth card now shows the real Warden/Lumi/post art rather than sky; armour is visible before the protected punch. Root additionally reports six offline-packaged Frost cases and 18 offline space cases passing; these are browser checks of packaged payloads, not native Android instrumentation.

The independent public-input Easy browser controller won on both devices with all 3 lives and no Continue: iPhone 39.79s, Android 97.81s. iPhone earned Fan at 22.66s and naturally caught LASER/FIRE/SPLIT/SHIELD; Android earned Ward at 21.67s and Fan at 60.57/81.31s, naturally catching FIRE/SLOW/WIDE. These are power-assisted controller wins, not strict ordinary-only proof or human difficulty validation. There were no HP/life/charge/phase fixture writes in those runs. The successful combo variance is retained; no artificial wait or HP inflation was added. Receipt: `out/frost-earned/final/report.json`.

Actual image review covered both `out/frost-phones-final/{ios,android}-01-opening.png`, all six `07-stance1/2/3-contact-staged.png` images, selected recovery stills, Ward result, rescue, breach/loss, and continued state. Feet/shadow and promenade agree; the fist remains attached and hits the intended post; all three approaches preserve Lumi's face/crown and separation. The pale ball, lower paddle and 52px Kit control stay legible and unobstructed. The background walkway is visibly in a separate depth layer and creates no hidden blocker. Continue visibly restores the last failed post and fresh serve while preserving earlier damage.

`out/frost-review/frost-punch.gif` is a 2.14-second actual Main Easy first-post motion witness, with 32 native cropped frames at 15fps. `out/frost-review/motion.json` records each stage, real atlas frame, fist position, post HP and matching HTML hashes. It shows late warning/backswing → actual measured punch contact → brisk retraction → idle recovery. An independent art review inspected the packed frames and found no atlas clipping, disconnected fist, floating feet or art substitution. This is a staged animation witness, not an earned run.

The earlier earned final screenshots were captured during star reveal; the explicitly staged canonical win screenshot shows all three settled stars. It does not pretend to be a new earned run. Human phone feel, sustained real-device performance and native APK delivery are still outside these browser receipts. The remaining frozen terminal capsules are cosmetic; this release retains that behavior. No new capture/grab animation is claimed.
