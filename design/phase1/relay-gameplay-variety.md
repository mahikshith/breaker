# Level2 B — two gameplay directions

**Current selection: A / Circuit Breakout remains Level2, with the owner's latest broad-hit simplification.** Tiny ordered phase targets are removed: normal mothership/body impacts reduce its main HP; equal coloured panels, four grey pieces and the common earned Nix power picker replace the precision grind. B / Escort Run remains an approved later direction with no assigned level number. The design specifications below are choice-stage history, not the active ordered-target contract or balance evidence. Current implementation/proof is tracked in `relay-circuit.md`. The former Relay worker-rescue and ordered-symbol prototypes remain historical. Keep the approved B machinery, materials, dark background and one-finger control; no workers or new character art. The shared existing Nix face now supplies the owner's selected space power control.

Recommend **A / Circuit Breakout**: read a visible relay order, earn a short playable skiff burst, then open the escape gate. **B / Escort Run** offers a different game: clear a route and defend one moving empty cargo vehicle through safe checkpoints. Neither repeats freeing four workers into a transport.

## What the actual source provides

The historical Relay prototype had four2HP crew housings, two6HP guns, a24HP shared relay pool,30 panels (16plain at1HP and14armour at3HP),125×29u paddle and8u-radius ball. Four freed housings opened the iris automatically. Its clock slowed with Focus and stopped during a caught serve; those old clock rules are **not** inherited by the selected implementation. That prototype's real hollow pod frames and measured hull/iris contours supply the source geometry. Current `src/relay.js` implements Circuit; see `relay-circuit.md` for its active contract and proof.

Important physical constraint: guns at(57.477,194.548)/(305.249,194.548) shoot into the outer pods aroundy249. Intact glass/frame absorbs their shots. A concept must not draw effective bullets through those opaque housings. Both proposals therefore turn the four pods into **empty relay-port machinery**, using the existing shell with phase glyphs inside, without `bWorker` or a rescue count. The corresponding glass and actual metal firing hatch visibly retract during its gun's warning and stay open until the bolt clears. Unmoved frame metal remains physical. An obstructed shot still stops at the first real cover. **Glass removal alone is insufficient if the top/bottom rail intercepts the swept ray**; the new open-metal port state must be produced and checked before promising this pressure loop.

The change of pod interiors/role is part of the proposal; it does not retroactively alter the approved artwork or old rescue proof.

## A / Circuit Breakout — aim, link, fly, finish

**Objective:** latch the four relays in the displayed circuit order; the completed circuit opens the iris. The arch is machinery, not another24HP boss. No hidden hull grind follows the final link.

1. A short lit trace and one shape-marked node teach the first target while guns are cold. A correct node takes two distinct ordinary-ball/laser contacts in the Medium study. Each contact fills a visible phase pip; a latch is permanent. Wrong-order hits rebound with quiet feedback and do not erase work, award charge or start a punishment volley. The next target stays marked, so this is reading/aiming under pressure rather than memorising a hidden code.
2. The outer-left/right nodes power their matching gun. Latching one cuts that gun off permanently; directly disabling a gun earlier is an optional tactical route. One gun warns/fires at a time. An active port opens before its muzzle fires, making its real shot lane and the player's counter-shot route visible.
3. The **second latched relay** earns one automatic paddle→skiff burst. The same horizontal drag now moves the craft; the ball is visibly stowed in a nose cradle. Automatic shots focus on an eligible target within an18° upfield cone and a clear sightline. They stop at real cover and carry one damage/pulse; they do not home through metal. Priority is the currently lit relay, then a live gun, then cover. Dragging into a useful lane remains the player's action.
4. After the bounded burst the craft folds back, restores a safely aimed serve, and the player finishes any remaining links. A final latch atomically ends combat and opens the gate. No last-life miss during the departure can undo success.

**Tension → relief:** first link safely teaches; a live firing port and a cross-board next target build pressure; second link grants an8–10s change of role and relief from ball juggling; normal play returns for the remaining circuit, followed by a quiet gate opening. If the burst completes the circuit, go directly to that earned ending.

**Threat/failure:** warned bolts stun the ordinary paddle and can lead to a missed ball, as in the prototype; SHIELD still saves missed balls only. During flight, a bolt hits the visible craft hull: the first impact ends the bonus early with a safe return serve instead of silently charging a life for the transformation. Lives lost through ordinary play are the failure condition; no global deadline, paid key or required pickup.

**Required state rules:**

- Relays are logic targets, not friendly bodies. Normal, LASER and powered contacts can supply a phase hit; one overlap cannot fill multiple pips. Out-of-order locks remain unpierceable/consume a laser without damage. FIRE/TITAN help with cover and guns, but cannot bypass the visible order. Keep their special interaction explicit in the first teaching beat.
- The lock is the metal phase plate, not an invisible full-window rectangle. Remove glass collision as glass retracts; update metal collision from the actually moved port leaves and retain the remaining visible frame. The muzzle/window route must be genuinely clear regardless of that relay's order eligibility.
- A phase badge on the upper rim must own/split the matching visible frame contact, or be dispatched from that contact. Do not put its damage target behind an unchanged solid frame actor. Metal port leaves lose collision only where the new open pose actually moved them.
- Flight is earned once from the second link, not from an endless damage/charge loop. There is no new corner button or second finger. Do not also grant Carrier's Nix power.
- Stow every existing live ball without deletion or cloning. Show one lead ball in the cradle; preserve the other ball identities. Pause FIRE, each ball's TITAN, SLOW, WIDE, SHRINK, LASER/cooldown and SHIELD/count while their ball/paddle role is unavailable; preserve Focus count without allowing a flight Focus catch. The burst has its own active-real timer and separate shots. Capsules caught during flight queue once and apply after the return serve is live, so SPLIT/BURST work rather than being lost against caught balls. On return, restore the ball count as a caught/fan serve with preserved powers, never from stale positions inside new geometry. A three-second auto-serve prevents indefinite pressure freezing. SHIELD is not silently converted into craft armour.
- Morph in/out must preserve drag anchoring, respect held/cancelled inputs, clear the old volley with a visible shield snap and give a new full warning. Those short transitions are bounded; they cannot be retriggered for invulnerability.
- A lost-life/Continue retains node pips, circuit order, disabled guns, consumed caches and whether the once-only burst was spent. It never grants another burst or refills a partially used one. Cancel the failed volley, fresh serve and three-second enemy grace. Retry resets the run.

| Initial tuning proposal | Easy | Medium | Hard |
| --- | --- | --- | --- |
| Visible node order, indices left→right0–3 |0→1→2→3 |0→2→1→3 |3→1→2→0 |
| Contacts per node / optional gun HP |2 /4 |2 /6 |3 /6 |
| Gun warning / minimum resolved-volley spacing |1.6s /5.0s |1.4s /4.2s |1.2s /3.4s |
| Bolt speed |220u/s |250u/s |280u/s |
| Stable earned burst / quiet recovery after each link |10s /2.5s |9s /2.0s |8s /1.5s |

All modes preserve the same ball speed, drag, geometry and readable order. The Hard order is authored before the run, not shuffled while the ball is in flight. These numbers are untested starting values, not difficulty evidence.

**Smallest likely build:** replace the rescue goal/crew-release branch with circuit state; add timed empty-port shutters, one firing-port guard and flight/stow/return states; reuse Arena drag, shots, powers and the pure swept-target helper. Remove the24HP gate bypass. Reuse the B machinery family; add glossy phase badges, a visibly open metal firing-port pose, a nose-cradle/front-lip overlay and an approved combat/morph pose family. No new engine, scrolling level, pilot or companion is necessary.

## B / Escort Run — make a route, protect a crossing, breathe

**Objective:** get one **empty cargo skiff** through three route segments into the iris. The player remains the paddle/ball throughout; there is no ship-control burst and no captive or rescue counter.

The cargo waits in a visibly shielded dock while the player clears the marked obstruction ahead. When the actual swept corridor is clear, a minimum checkpoint breather finishes and the skiff departs automatically. During travel it is a friendly physical bumper: ordinary/powered balls rebound without harming it or farming rewards; hostile bolts can damage it. Clear cover or hit a gun to suppress its next attacks, or intercept a bolt with the ball. At the next dock the cargo is safe and pressure releases while the player prepares the following route.

Use one original B canopy/skiff at its natural aspect, **32×20.149u throughout the whole escort**. Do not shrink it, change its collider independently or replace it with a narrow rocket. At the two phone scales that is34.93×22.00CSSpx and36.62×23.06CSSpx. The station changes to admit the craft; the craft does not become tiny to fit the station.

| Segment | Revised provisional centre path | Required existing blockers to clear | Cargo display |
| --- | --- | --- | --- |
|1 |(100,405)→(100,311) |`bArmour12`, `bBrickViolet4`, `bBrickCyan6` |32×20.149u |
|2 |(100,311)→(181.363,320) |`bArmour7` |32×20.149u |
|3 |(181.363,320)→(181.363,202)→(181.363,160.995) |`bArmour3`, **`bBrickCyan3`, `bBrickCyan4`**; fully opened station lane and iris |32×20.149u |

Those **seven panels total13ordinary hits** with current panel HP: three3HP armour panels and four1HP coloured panels. The extra two cyan panels are actual obstructions to a constant32u craft. They must visibly break, not silently lose collision. Other panels retain their source positions, shapes and HP. The first checkpoint moved down only1.5u from the previous draft, giving useful clearance below the intact violet row.

**One authored station opening, not a new maze:** retain the outer station centres at(63.8185,248.7275)/(302.454,249). Put only the two inner63×52.834u assemblies on short visible horizontal rails:

- Inner-left: closed(139.0915,248.7275) → open **(128.863,248.7275)**, shift−10.2285u.
- Inner-right: closed(225.5455,248.4545) → open **(233.863,248.4545)**, shift+8.3175u.
- Their complete raster bounds then leave a **42u-wide lane,x160.363..202.363**, centred on the irisx181.363. A32u cargo has5u clearance per side in that station band. The closed lane is about23.45u and must visibly widen before departure; a32u craft cannot use it closed.
- Move the whole visible station assembly: metal frame, empty interior/glass, badge, shadow and collider. New rail/end-stop art must stay outside the declared lane and outside neighbouring frame bounds. Do not merely retract glass while fixed metal still occupies the cargo route. Preserve the B shell design, proportions and glossy purple/blue materials.
- Cargo waits at the shielded central dock(181.363,320) while frames move; its top remains more than34u below the frame bottoms. Start the final leg only after the seven real panels are clear, both stations visibly latch open, the iris is fully clear and the minimum rest has elapsed. Check full swept cargo bounds; a centre ray or invisible waypoint is insufficient. All moved frame collision remains live for ordinary balls. The iris stays open through the complete passage.

**Bounded design proof:** `out/relay-cargo-corridor/check.py` uses the actual B PNG alpha at threshold32,4pixels/u and1345 path samples spaced at most0.25u. It tests a conservative full32×20.149u cargo rectangle with an extra2.5u border against the source hull, fully opened six-blade iris, proposed complete station positions, static gun poses and every fitted panel. Exactly the seven listed panels intersect; after their removal no sampled obstacle remains. Receipt:`out/relay-cargo-corridor/report.json`; diagnostic:`blockout.png`. This is a source-alpha **sampled blockout check**, not a continuous live-solver, moving-frame or human balance pass. Before implementation acceptance, prove at least2u clearance with the real swept cargo polygon against actual frame/iris transforms, rail art, threshold variations and barrel aim/recoil extremes. The final goal requires the whole craft inside the clear gate, not just its centre crossing a line.

**Threat:** existing guns fire through their visibly opened empty ports. They lock a reviewed actual cargo lane; no shot bends after firing or passes through cover. The previous±0.4rad estimate cannot threaten the central dock: from the left mount to(181.363,320) needs about0.779rad. A proposed **±0.9rad aim range** would cover the first and lower cross-board legs, but requires actual barrel/muzzle/port clearance proof and possibly a B-family articulated mount pose. Do not depict it as already supported by the existing±0.2rad prototype. If that pose fails, keep the first crossing exposed and revise the second encounter before promising equivalent pressure. As cargo approaches the upper central arch beyond a safe gun arc, guns cool: final arrival is intentional relief, without a fake horizontal shot through the station. Keep only one lethal projectile/warning active. A normal ball can destroy/disable the actual6HP gun early, or intercept the shot. No new invisible portal attack is required.

**Tension → relief:** safe dock teaches clearing; first exposed crossing teaches protecting a moving objective; shielded checkpoint gives a visible2–3s minimum rest and preparation; the side-to-centre crossing adds banking pressure once its gun arc is physically validated; the visibly widening station lane and quiet final gate approach provide relief/arrival. Do not keep firing at an invulnerable dock just to create noise.

**Failure/Continue:** zero cargo hull or zero player lives loses the attempt. Continue returns the cargo to its last completed dock with at least two hull points (capped at its mode maximum), retains completed segments and every cleared panel/gun, cancels the active volley and supplies a fresh serve/full warning grace. It does not instantly repeat an expired segment or restore destroyed cover. Retry starts fresh. Normal-ball-only route clearing and gun suppression must suffice; capsules and paid recovery are optional.

| Initial tuning proposal | Easy | Medium | Hard |
| --- | --- | --- | --- |
| Cargo hull |3 |2 |2 |
| Warning / resolved-volley spacing |1.6s /5.0s |1.4s /4.2s |1.2s /3.4s |
| Bolt speed |220u/s |250u/s |280u/s |
| Exposed segment travel time |5s |5s |5s |
| Minimum dock rest |3s |2.5s |2s |

The difficulty change is more pressure during the same crossing, not a faster cargo that accidentally reduces its exposure. A shielded waiting dock lasts longer if the route is not yet prepared. All hull/timing values need human testing.

**Smallest likely build:** cargo route/dock state, actual friendly target polygon, first-contact bolt ordering including cargo, hull/checkpoint/Continue rules and shuttered firing ports. Keep existing breaker physics and callbacks. Use the real skiff/portal/empty station assets; add short rail/end-stop assemblies for the two inner stations, their moved frame collision, visible open metal firing-port poses, a tested wide-aim mount if viable, small docking shield/charge cues and a final safe-arrival pose. These are new asset requirements, not existing finished states. No new characters, scrolling scene or shooter controls. Circuit A remains the recommendation because B adds this corridor/moving-station admission work.

## Coordinates for the two actual-asset proposal boards

World is360u wide. Preserve current126CSS lower paddle reserve, full-screen B background and deepest existing panel at368.182u; add no bricks in the clear return lane. At393×852 with59/34safe insets: worldH729,paddleY614. At412×915 with32/24safe: worldH785,paddleY675. Mapping is `CSSx=x×scale`, `CSSy=safeTop+(y−34)×scale`, withscale=393/360 or412/360.

- Hull:(181.363,148.091),313.636×143.386u. Iris:(181.363,160.995),r36.382u. Gun mounts:(57.477,194.548)/(305.249,194.548).
- Four empty relay ports/stations:(63.819,248.728),(139.092,248.728),(225.545,248.455),(302.454,249), each63×52.834u. Put phase badges on the metal upper rim, not across a friendly face. Do not draw `bWorker` in either new concept.
- A flight: centre(180,paddleY−10),80×50.373u. Phone world centres are(180,604)/(180,665). The skiff's upper edge is35.19u above the normal paddle and lower edge15.19u below it, still above drain=paddleY+20. Show one parked nose ball; the lower central drag lane stays clear. Use only one skiff identity: remove the old upper parked skiff instance when it is the player's active form.
- Existing skiff raster is a front three-quarter saucer, **not an upfield top/rear combat pose**. For a clearly labelled proxy keep it upright and natural1180:743 aspect. Do not flip it vertically, rotate it180° or stretch it into a125×29 paddle. A provisional cradle anchor on that raster is(u.70,v.80): offset(+16,+15.11)u at80u width. This is an art brief, not an existing functional muzzle. Proper upfield emitters, nose seating/occlusion, engines and morph frames require a reviewed variant; do not call the bright front lamp an already supplied thruster or gun.
- B cargo: the **same32×20.149u** empty B skiff at(100,405), checkpoint(100,311), central dock(181.363,320) and final gate(181.363,160.995). Each panel shows one current craft, not simultaneous copies. Docks are thin nonphysical brackets, not extra pod/robot actors. Final station positions and42u lane are specified above. Do not leave a duplicate parked craft in the iris, squeeze the final ship smaller or substitute an unapproved pointed fighter.
- Minimal product cues: one lit circuit route in A; one cargo hull cue plus marked next obstruction in B. Use mode/timings/objective explanations outside the phone image. No new permanent resource bar, wall of labels or invented companion art.

## Corrections to `img/relay-variety-study-v1.png`

The current study is concept art, not an accurate collision map. Edit B to show one constant-size B skiff, a visibly authored42u central station opening and the seven real route blockers. Remove the three square blue route tokens that read as extra actors; use faint dock brackets/one dotted route instead. The final panel's four green housing checks suggest the superseded worker-rescue loop: replace them with empty machinery and two visibly slid-out inner frames on short rails. Keep the final skiff full32u size, the same silhouette and aspect as the crossing; no narrow rocket or scale cheat. Show the iris leaves retracted rather than an exploding portal/debris victory. Preserve the ordinary paddle and ball in both B panels, because the player never becomes the escort craft.

For A, retain the Circuit recommendation but remove duplicate ownership in the burst panel: the player craft replaces the bottom paddle, one lead ball is stowed in its cradle, and there is no second parked skiff under the iris. The existing source skiff is a front three-quarter saucer; the study's pointed upright flight craft is a proposed combat-pose asset, not supplied B art. Either label that new pose clearly or use the actual B skiff as a natural-aspect proxy. Do not imply current live flight or completed new assets. Keep the design-study disclaimer and all explanation outside the product screen.

## Selection and proof gates

The owner selected A after the image gate. Prototype and build Circuit only, teach its first action in safety, and measure both393×852/412×915. Escort remains deferred; its sampled corridor study is not live implementation.

Required proof: normal-ball completion without paid help; visible port/shot/cover alignment; real aperture and cargo/flight-alpha clearance; no same-contact farming; full multiball/power ownership through a morph; bounded safe serve return; active-real warning/travel clocks through Focus/hit-stop with true pause/background freeze; terminal/life-loss/final-goal ordering; exact Continue checkpoint preservation. Capture actual tension and relief, not just a staged successful goal. None of the existing rescue-controller times certifies these new rules or the proposed mode numbers.
