# Orbital Breakout — two gameplay variety studies

2026-10-18. **A / Shutter Forge is selected** (the owner's “shuttle forge” refers to this option). B / Orbital Switch is reserved for a later distinct level, with no assigned number. The owner asks Level 3 to offer a different activity, difficulty and tension/release rhythm. The old three-crew/two-guns/core greybox is historical, not the selected experience below. Carrier's selected retreat/siege hybrid and three difficulty modes are under calibration; BA5E is its earlier candidate, not approval of those revisions. The separately tested APK is a frozen checkpoint. Selected A is being built in isolation; neither C option is admitted to the production menu, bundle or APK. Implementation/art/proof state belongs in `orbital-forge.md`.

Recommend **A / Shutter Forge**: read a mechanical opening, make a deliberate bank, interrupt the pressure source, then earn a visible collapse and three-ball release into an exposed reactor finish. B / Orbital Switch is the more experimental alternative: learn two curved routes and a straight route to overload a receiver ring. Both retain ball and paddle control. Neither repeats captive rescue, adds a playable ship section, or selects Nova/Pin. The optional ship burst belongs only to the separate Level 2 proposal in the preferred path.

## Current C evidence and the constraint both options must solve

The approved reference is `design/phase1/img/space-orbital-c-v1.png` (1536×1024); only its left playfield is the visual source. It shows the angular slate/violet carrier, circular magenta command optic, central shuttered hangar, two large cannons, swept fighters, cyan/violet/X panels, three tall worker housings, chrome ball/paddle and a dark Saturn field. The new options explicitly replace the **worker-housing function and occupant art** with machinery; this is a proposed thematic change for the owner to see, not an already approved conversion. No worker remains hidden behind a new mechanic label.

Actual separated C assets are limited to `assets/space-c/machinery.json`, `hull.png`, `bay_back.png`, `bay_mask.png`, `door_left.png`, `door_right.png` and `doors_pair.png`. Original source/provenance remains under `art/space/source/orbital-*`. Reusable actual-part composition and native open/half/closed proof are in `tools/orbital-preview/asset-proof.mjs` and `out/orbital-art-proof/`. These are **machinery presentation**, not finished C gameplay. C-specific barrels, fighters, foreground machinery/panels, exposed reactor and full background families remain unbuilt.

At the time of these studies, the old `src/orbital.js` primitive prototype had26 panels, three3 HP crew pods, two9 HP guns and a12 HP internal core, with seven optional fighter paths per14s wave. Its core gate and open-bottom hull polygon did not describe the delivered hull. That source and its tests are now archived in `out/orbital-history`; the current source implements the selected Forge candidate. The old assisted wins and16 tests establish neither the new actual-art route nor its balance. Current evidence belongs in `orbital-forge.md`.

**The real lower lip encloses the bay.** At 360u hull width the actual internal aperture is only 79.6988×29.6386u, at (140.241,173.771). Its centre can contain a 7.5r or 10r ball, but the free alpha component never connects to the image exterior. The old 109×45u open-bottom greybox and core (181,184,r14) cannot be carried over. The old core also overlaps opaque top metal. Evidence: `out/orbital-aperture-audit/report.json`, `source-normal.png` and both-phone radius overlays; independent review agrees.

Both studies therefore use an **authored visible projector/target outside the intact lip**, with clear source-relative collision. A physically retracting lower lip would be another valid production solution, but it is a larger unselected asset/state change. Never remove collision from the visible floor, enlarge only a hitbox, or move a ball through the metal. The command optic remains the carrier's expressive control light, not an inaccessible required damage actor.

## A — Shutter Forge: deliberate windows, pressure, earned release

**Objective:** disable three stabilisers, then destroy the projected reactor. The player aims through changing physical openings rather than racing a rescue beam. Each stabiliser is visibly empty machinery with a glazed energy coil, damage segments and a small folding cover. The three source housing positions become left, right and centre stabiliser stations; their native footprints remain the starting metrics.

### Exact proposed loop

1. **Teach.** After the initial launch, the left cover anticipates for 1.2s and opens over 0.4s. Its first exposure is harmless: an expired first window just retries after 2s, until the player lands one real coil hit. The moving leaf and solid portions use the same measured shapes as their visible pose. Closed metal rebounds the ball; the exposed coil takes ordinary 1 HP contacts. The first successful hit permanently ends the harmless introduction.
2. **Develop and test.** Finish left, then right, then centre. Only one unfinished station is active. Each fresh window gets its full advertised open time, beginning when the leaf is physically clear. Damage persists through closure, life loss and Continue. The active cover's local arc shows the remaining opening; no global countdown is added. Completed stations stay broken/open and never regain HP.
3. **Consequence and counter.** If an exposed window closes unfinished after the teaching contact, one surviving cannon locks the current paddle x and shows its real fixed firing lane for the mode's warning time. It then fires one 300u/s bolt. Visible cover or a ball intercepts it; a paddle hit costs one life. The original SHIELD still saves missed balls only. No other cannon warning/shot or opening timer runs concurrently. A new window begins only after that bolt is resolved and a 2s quiet recovery has elapsed. At most one life can be lost from a single bolt. Four/five/six ordinary cannon hits can permanently disable that gun; both guns disabled turn missed windows into harmless 2s retries. The investment is an earned defensive option, not another mandatory gate.
4. **Release.** Disabling the third station cancels every warning/bolt. Two plain/X support banks collapse in a readable 0.8s ripple, exposing the reactor approach. These removals are an authored structural event: each panel identity is removed once, yields no command/combo farming, and consumed caches do not respawn. Marked power panels retain their explicit catch/avoid rules instead of producing four simultaneous drops. No falling solid debris enters the lower reaction lane.
5. **Reward and precision finish.** The third station grants a one-time three-ordinary-ball burst, capped at three live balls; clones inherit the configured 7.5r and ordinary damage, never TITAN. Surviving powered balls retain their own state. The projection arm unfolds in front of the lip over 1.2s and visibly presents the reactor at (180,246,r16). No invisible target exists before arrival. Both cannons remain off for this final phase, even if not previously destroyed. Give at least 3s with no new hazard after the collapse; live balls, aim and touch control continue. The core stays exposed, and every ordinary hit removes 1 HP. It does not retreat/reset on another deadline. Core0 immediately latches success, clears hazards and prevents a simultaneous late miss from revoking it; a 2s mechanical shutdown/cascade completes the win.

The three-ball reward is intrinsic earned level progress, not a required purchase or companion spell. Prove a one-ball ordinary route separately so that missing optional capsules or losing extra balls cannot soft-lock the finish. No Nix/Tick/Kit portrait or new command button is introduced in C. Existing optional FIRE/LASER/SHIELD/SPLIT can help where their real collision permits; powers cannot damage a coil through a closed solid leaf. Housing-rescue damage exceptions do not automatically apply to these new machines.

### Proposed modes and pacing

All values are **unimplemented starting settings with unvalidated human balance**. Do not change ball speed, paddle size, radii or reaction-lane depth to create difficulty.

| A parameter | Easy | Medium | Hard |
|---|---:|---:|---:|
| Each stabiliser HP | 2 | 3 | 3 |
| Fully open exposure | 10s | 9s | 7.5s |
| Cannon warning after a failed window | 1.5s | 1.35s | 1.25s |
| Each optional cannon HP | 4 | 5 | 6 |
| Exposed reactor HP | 6 | 8 | 10 |
| Post-shot quiet recovery / final hazard-free relief | 2s / ≥3s | 2s / ≥3s | 2s / ≥3s |

Intended rhythm: harmless opening → left-bank mastery → short clear/recovery → right bank under pressure → centre test → broad structural collapse/three balls → calmer readable reactor hits → shutdown. A missed window changes the situation without deleting earned work. Difficulty comes from choosing an approach and deciding when to invest in a cannon, not a globally shortened rescue timer or another mandatory large hull HP pool.

**Failure:** lives0 from missed balls/actual enemy contact; there is no automatic loss merely because an opening closes. Continue retains mode, station/gun/core HP, completed stations, removed panels, consumed caches and the one-time burst flag. Clear stale attacks/bolts; grant the existing fresh serve and missed-ball shield recovery. After the 3s replacement serve, reopen the unfinished station for its full window with no immediate old shot. The burst cannot be awarded again. Final success cannot Continue back into combat.

## B — Orbital Switch: curved routes and a three-part overload ring

**Objective:** overload three exterior receiver segments by sending ordinary balls through the matching orbital route. It is a routing puzzle with pressure pulses, not another sequence of reinforced locks. The left and right former housing locations become solid small field projectors surrounded by translucent magnetic influence zones. The lower centre station becomes a neutraliser. No captive occupies any station.

### Exact proposed loop

1. **Teach and route.** Left field bends an upward ball clockwise, right field bends it anticlockwise. Only rising balls are affected, only inside the displayed field, and speed magnitude stays unchanged. Descending returns are straight under the existing physics; no gravity affects the paddle or lower reaction lane. Passing the left/right influence tags the ball with a cyan/violet curl glyph for that flight. The neutraliser clears the tag. The last field entered owns the tag; every paddle contact also clears it. A short local rim/trail makes state visible without changing the ball's silhouette.
2. **Match.** One exterior ring receiver is lit at a time: left-curl, right-curl, then neutral diamond. A real ball contact with the matching tag gives 1 progress; wrong-tag contacts rebound without damage or erasing earned progress. Each segment's progress persists. The first matching contact is introduced with no firing penalty; afterwards an uncompleted exposure expires after the mode window. Completed segments are skipped and never reset.
3. **Pressure.** Timeout shields the receiver for 2s, then produces one fixed-lane cannon warning and 300u/s shot, using the same single-threat/cover/ball-interception/life rules as A. The next lit receiver gets its full window only after the projectile clears plus 2s recovery. There is no hidden ring-collapse deadline. Cannons have the mode HP below and are optional permanent defensive targets. There are no hostile fighter waves or simultaneous captive timers in this minimum option.
4. **Relief and finish.** All three receiver segments complete: cancel shots, shut both fields/cannons down, and visibly fold all three ring petals away. A 35u-wide exterior approach must actually open to the central core at (180,255,r14); an opaque complete ring must never hide a hittable centre. Give 3s of quiet straight-ball play and a small outward lift of plain panels. One ordinary core hit then triggers a 2s outward collapse and success. It is the earned payoff to solving the routes, not another ten-hit grind.

The ring is projected outside the hull from the start; its receiver plates are genuine external targets. Its core exists as a damage actor only after the petals visibly clear. LASER can clear real cover or disable a cannon but cannot invent a ball route/tag. TITAN/FIRE still need the correct route and cannot hit through shield metal. No new touch gesture, portrait power or playable ship is required.

| B parameter | Easy | Medium | Hard |
|---|---:|---:|---:|
| Matching contacts per receiver | 1 | 2 | 2 |
| Full receiver exposure | 12s | 10s | 9s |
| Maximum field heading change rate | 40°/s | 60°/s | 75°/s |
| Maximum influence per field pass | 0.32s | 0.32s | 0.32s |
| Timeout cannon warning / cannon HP | 1.5s / 4 | 1.35s / 5 | 1.25s / 6 |
| Final quiet interval / final core HP | ≥3s / 1 | ≥3s / 1 | ≥3s / 1 |

These are provisional limits, not evidence that all three trajectories exist. Start with influence radii42u left/right and30u neutral, with small solid projector bases measured from new art. Aim prediction must integrate the same bounded field at the same fixed tick; no straight preview followed by a secretly curved live shot. The suggested rate cap gives at most 12.8°/19.2°/24° change per pass, not an instantaneous redirect. Sweep the curved substeps through actual collision; prevent trapped or endlessly re-triggering balls. If ordinary left/right/neutral routes cannot be demonstrated around the delivered parts at both radii, reposition/re-author the fields before production.

Intended rhythm: harmless left curl → matching right curl → neutral route under pressure → ring opens/forces cease → simple satisfying final contact → radial collapse. B offers stronger physical variety but requires more predictor/CCD/trajectory teaching work and can make rebounds feel less trustworthy if poorly tuned; that is why A is preferred first.

Failure/Continue use A's life-only and immutable earned-progress rules, replacing station HP with receiver progress/tag state. Clear transient flight tags when creating the fresh ordinary serve, preserve completed segments and active mode, and give the unfinished receiver its full fresh window after recovery. A completed petal state never recloses due to Continue.

## Shared controls, clock and safety contract

Retain 360u world width, 125×17u paddle, ordinary7.5r/TITAN10r, current345u/s base speed and1.28 rally cap, plus the126 CSS lower reserve. No fields, new colliders, beams or rubble enter the control area; score/lives/pause remain compact at the top. Calm near-black Saturn/stars fill the whole screen. Guidance sits on the active machine; no repeated slide/aim/catch instructions and no extra global power meter.

All new open windows, warning/recovery and choreography use **active real seconds**, continuing during Focus/SLOW/hit-stop and stopping during real pause/background/ad overlays. This is a new proposed contract; current C's clock freezes on caught serve and uses world dt. Initial serve auto-launches after8s; a replacement serve after3s. Enemy timers wait for actual launch, then a full opening/warning, so neither an infinite aim hold nor resuming into an overdue attack is possible. Pausing clears held input and never fires/release-casts on resume. Moving target/bolt velocities need compensation for the exact Focus×SLOW ball-time scale.

At same-tick ties, resolve accepted player hits first: destroyed gun cancels its queued shot; completed final core latches safe success before loss or new enemy work. Nonfinal machinery progress never grants hidden invincibility. Each projectile can cost at most one life; life loss clears all hazards and restarts one clean recovery. No terminal clock, reward, projection or shot keeps running behind a result. Existing ad/unlock Continue remains optional recovery; no purchase can be necessary for a normal-ball route.

## Coordinates and actual-source recipe for the two image studies

Use world units below, not native pixels. Show three393×852 frames per study, then check412×915; keep additional Android height in the return lane. These are actual-machinery **concept compositions**, not screenshots of implemented mechanics. Use a clear outside-frame legend for proposed machinery/FX until they exist as reviewed assets.

| Current source / element | Exact placement or use |
|---|---|
| Original C reference | `design/phase1/img/space-orbital-c-v1.png`; left crop `(12,12,608,978)`; source foreground mapping `x=(sourceX−12)×360/608`, `y=72+(sourceY−12)×360/608` |
| Actual hull assembly | `assets/space-c/machinery.json`; natural hull1992×795, draw `(0,76,360,143.674699)`; no stretching/recolouring of an A ship |
| Already assembled actual states | `out/orbital-art-proof/source-closed.png`, `source-half.png`, `source-open.png` are1992×795 compositions; draw at the same hull rectangle. `source-comparison.png` preserves the original beside actual parts |
| Real bay/mask | Source aperture `(776,541)-(1217,705)`; world `(140.240964,173.771084,79.698795,29.638554)`; lower hull extent219.674699u. The open hole is internally enclosed |
| Independent shutter composition | Reuse `tools/orbital-preview/asset-proof.mjs`: bay backing clipped by `bay_mask`; leaves about source seam x996.5/y623 with their manifest pivots; travel242.55 source pixels per leaf; hull drawn last. This motion never removes the lower lip |
| Existing left station footprint | Source `(164,358,90,101)` → world `(90,276.868421,53.289474,59.802632)`; centre `(116.644737,306.769737)` |
| Existing right station footprint | Source `(383,358,92,101)` → world `(219.671053,276.868421,54.473684,59.802632)`; centre `(246.907895,306.769737)` |
| Existing lower centre footprint | Source `(270,415,94,102)` → world `(152.763158,310.618421,55.657895,60.394737)`; centre `(180.592105,340.815789)` |
| Foreground banks | All26 measured rectangles/kinds/payloads are in `ORBITAL_LAYOUT.bricks` in `src/orbital.js`; keep their silhouette as the study's starting composition. Lowest bottom420.75u; do not extend a new row toward the paddle |
| Legacy gun guides only | `(45,187,r25)` and `(309,187,r25)` are primitive guides, **not admitted C barrel/muzzle contours**; missing actual barrels must be produced/reviewed before firing gameplay |
| A new external target guide | Reactor `(180,246,r16)`, top230u: below actual hull's219.675u extent. Show a visible forward projection arm and solid external body. Do not draw the arm as an open hole through the lip |
| B new route/ring guides | Left/right influence centres `(116.644737,306.769737)` / `(246.907895,306.769737)`, radius42u; neutral `(180.592105,340.815789)`, radius30u; exterior ring `(180,255,r26)`, top229u. Proposed ring/core still require their own visible access/contour proof |

A frames: **left opening/one contact → centre pressure and damaged right/left stations → quiet bank collapse, three ordinary balls, projected reactor**. B frames: **cyan curved route → violet/neutral receiver progress plus one warned lane → three petals folded away, straight-ball final contact**. Keep the actual hull and low paddle prominent; no workers, companion placeholders, bright Saturn or decorative fighter swarm filling the route.

## Minimum production and admission work after a choice

1. **Shared C family:** source-faithful independent barrels/muzzle/disabled states,26 glazed/X/power panel parts, C dark full-screen field, measured paddle/ball choice and light impact/collapse FX. Existing hull/bay/shutters keep their source identity. Strip metadata, retain provenance and record pivots/actual alpha contours. Do not call this complete C art because its first hull family exists.
2. **A critical new family:** three empty stabiliser bodies with visible coil HP, independent opening leaves/hinges and damaged/disabled states; external projection arm/core inactive→arrival→hit→rupture; two structural-collapse poses/sequence with safe debris; readable three-orb earned-burst cue. Prove actual closed/open ball routes before authoring every decorative clip.
3. **B critical new family:** two field projector bodies plus neutraliser, low-opacity readable influence boundaries/glyphs, external three-receiver ring with independent petal poses and genuinely open final approach, projected core/hit/overload states. Field arcs are sensors/FX; visibly solid bases and petals collide. No unmarked pass-through metal. B additionally requires a tested fixed-tick field/prediction integration.
4. **Focused tests:** real ordinary/TITAN access to each open target from the paddle, shut-leaf rebound, no inner-hull hit; timed contact/timeout/bolt/loss ordering; one-shot life ownership; persistent station/receiver/gun damage; one-time rewards/no chain farming; correct Focus/SLOW actor velocities; pause/Continue/retry and mode isolation. For B, include matched/wrong/overwritten/reset tags, speed preservation, influence cap, prediction agreement and no trapped trajectories.
5. **Earned phone proof:** both native sizes, actual pointer aim/drag through full physics, ordinary one-ball critical path without capsule/companion/Continue, and a separate earned reward run. Record actual exposure opportunities, misses, optional cannon investment and time spent in quiet release. Human play must judge difficulty and whether relief feels rewarding. Neither new option, its modes nor its final art has passed these checks yet.
6. Show the chosen actual-asset motion/gameplay beside the C reference, update handoff and get owner screenshot/play approval before a gameplay commit, production admission or another APK. A design pick approves the direction, not an untested implementation.
