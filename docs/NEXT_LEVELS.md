# Next levels: reserved space ideas and a new princess encounter

Updated 2026-10-19. This document separates the current five-level runtime from future proposals. Values labelled provisional are starting points, not balance results. The owner delegates design decisions and authorizes implementation/commit/push. The **Brum/Yeti-related Frost Warden princess encounter is integrated at stable slot4**, with complete dedicated rendered art, strong-arm physical defence destruction and separate Easy/Medium/Hard behavior. Local phone-size checks are described below; CI and APK delivery status belong to [MOBILE_PREVIEW.md](MOBILE_PREVIEW.md). Earlier crab/bat/boar adversary ideas remain deferred alternatives.

## 1. What exists, and what remains a proposal

The source tree and the exact release receipt are the authority for the current build. A design board, isolated preview, old APK and the latest working source can describe different checkpoints. Do not use an old screenshot or a scripted win to certify a later build.

| Track | Current source direction | Boundary |
|---|---|---|
| Carrier Breakout | Rescue captive workers, interrupt boarding raids, broad mothership damage, distinct Nix/Tick roles | Hybrid waves, encounter pressure and the latest heavy/salvo weapons require their current integrated receipts; old APKs do not acquire these changes |
| The Vault | Kit and Lumi; serpent enters from a tunnel, follows actual brick routes, reacts to ball hits and warns a venom shortcut | Existing serpent encounter. The new adversary below is a separate authored level, not a serpent reskin |
| Circuit Breakout | Broad relay-ship damage, optional stations/guns, once-earned physical paddle-to-skiff burst and an exit iris | Current revision gives it Vesper/Latch, stronger cyan skiff fire and distinct enemy weapons. The closed iris has **no suction**; it opens for departure |
| Shutter Forge | Productive closed machinery/hull damage, optional open bonus, collapse and an external reactor finish | Its reactor and machinery retain real exterior access; current companion/weapon presentation is tracked by its own release receipt |
| Relay Escort / Escort Run B | Prior direction retained for a later level | Reserved, unnumbered, unimplemented. Do not call it the current Circuit Level2 |
| Orbital Switch B | Prior direction retained for a later level | Reserved, unnumbered, unimplemented. Do not call it the current Forge Level3 |
| New princess encounter / Frost Warden | Brum/Yeti-related encounter in [BRUM_LEVEL_PLAN.md](BRUM_LEVEL_PLAN.md); `src/frost.js` and its complete28-frame dedicated Warden family | Integrated at stable internal index4. Six local phone/mode input/lifecycle cases and actual three-post contact fixtures pass; current CI/APK status is maintained in MOBILE_PREVIEW |

Main preserves storage indices Carrier0, Vault1, Circuit2 and Forge3, even though the menu displays the three space levels together before Vault. Frost Warden is appended at index4, preserving those old save identities. A future level must append a new internal slot or introduce an explicit versioned migration; rearranging these indices would mix earned stars. This document introduces no unlock price.

Read these alongside this proposal:

- [Story and roadmap](STORY_PLAN.md): the larger Brickhaven/Menagerie story, not a guarantee that every chapter or hero is implemented.
- [Selected variety directions](../design/phase1/level-variety-review.md): CircuitA / ForgeA selected first; both B ideas retained for later.
- [Relay variety draft](../design/phase1/relay-gameplay-variety.md): original Escort route, full-size cargo and measured station-opening constraint.
- [Orbital variety draft](../design/phase1/orbital-gameplay-variety.md): original Switch field/tag/receiver proposal and the real closed lower hull lip.
- [Circuit history](../design/phase1/relay-circuit.md) and [Forge history](../design/phase1/orbital-forge.md): preserve prior receipts; later owner feedback supersedes their historical rules where explicitly recorded.
- [Brum proof](../design/phase1/04-brum-proof.md): selected character work has a bounded proof status, not a shipped dedicated campaign.
- [Brum level plan](BRUM_LEVEL_PLAN.md): the authoritative new princess-level proposal for the latest owner steering. It supersedes the deferred adversary recommendation in earlier brainstorming.

## 2. Rules shared by every future level

Keep one-finger aim/launch/relative paddle drag, full-screen portrait play, compact top score/lives/pause and the appropriate corner character face. Preserve the existing lower thumb/reaction reserve (approximately126CSSpx in the space layouts); extra Android height should improve reaction distance. New enemies, fragments and controls must not occupy that reserve. Use Lilita One and Rubik, subdued dark scenery, glossy authored foregrounds and restrained yellow accents.

Every level needs a different player question. Carrier asks whom to protect and whether to disable the raider. Circuit changes the player briefly into a weapons platform. Forge creates a structural collapse and a reactor finish. Escort should ask **when to send and defend a moving objective**. Switch should ask **which physical route to choose**. The next Brum level must give his strong arms real brick-contact and rescue consequences, rather than repeat a crawling pursuit and venom shortcut.

Keep ordinary-ball completion possible with earned free progress. Optional powers should broaden a route, shorten dangerous exposure or help recover a mistake; they must not be mandatory purchased keys. Difficulty should add an understandable threat or reduce a forgiving margin, with a complete normal route retained. No claim that Hard is fair follows from a single controller success or failure. No new monetization rule is approved here.

All proposed hazard warnings, recovery windows and moving-object clocks use active real seconds: Focus, SLOW and hit-stop do not silently extend a visible enemy warning. Main pause, background suspension and a paused choice overlay freeze them. Ball motion continues to use the existing fixed-step physics and its own time scale. A moving collider's velocity must be expressed in the same time domain as each sweep. Aim prediction and live motion must agree.

For same-tick terminal events, an accepted final legal player hit latches success before a last-life miss or a new enemy attack. One hazard cannot cause both a life loss and an unavoidable objective loss in the same unresolved episode. Clearing an objective cancels remaining harmful work; the result does not keep hidden timers running. Continue retains earned irreversible progress and resets only the failed transient episode. Retry is a fresh same-level/same-mode constructor, with no carried balls, held input, menu, charge, timer or Continue count; saved stars and preferences remain.

The owner's latest delegation authorizes current design decisions, implementation and commit/push without another permission round. Continue showing concrete native-size results and completing real checks; authorization is not a finished animation, physics admission or APK receipt. The deferred ideas here remain proposals rather than automatic instructions to build every future level.

## 3. Reserved space directions

### 3.1 Relay Escort: prepare, cross, dock

**Status:** the earlier B direction is retained. Its original numbers and source-alpha audit are design evidence only. It has no assigned campaign number and no current runtime implementation. Reconfirm the latest visual and enemy-fire contract before building it; the source has since changed its cannon behavior and companion identity.

**Story purpose:** ferry an empty repair cargo carrying a disabled gate component between service docks. It is cargo, not another princess or five workers. The player remains the paddle and ball; it never replaces Circuit's combat skiff burst. No new pilot or compulsory companion is specified. If Vesper/Latch appear, their role must be newly reviewed rather than copied automatically from Circuit.

**Critical path:** `shielded dock → clear first real blockers → exposed vertical crossing → safe dock → prepare central crossing → open whole station lane → quiet iris arrival`.

The earlier draft deliberately retains the actual32×20.149u cargo silhouette throughout. Its centre path is `(100,405)→(100,311)→(181.363,320)→(181.363,202)→(181.363,160.995)`. Seven identified real blockers require thirteen ordinary contacts under that old draft's HP table. Two inner station assemblies translate outward to create a42u lane, leaving5u per side before any safety inflation. See the source draft for their exact positions and panel identities. These are starting geometry, not permission to restore an obsolete whole field or shrink the cargo until it fits.

**Proposed event/state contract:**

| State | Entry and visible behavior | Exit / collision rule |
|---|---|---|
| Docked/preparation | Cargo is inside a visibly closed shield dock; the next obstruction group is marked locally once | Remain safe until the full cargo sweep to the next dock is clear and a minimum rest has elapsed |
| Station opening | Only when required for the final leg, both complete inner assemblies visibly move on rails | Move raster, frame, shadow, interior and collider together; rails/end stops stay outside the declared cargo lane |
| Departure cue | A short0.6s provisional dock release and cargo nose light | No hazard launches during the cue; no second input button is required |
| Crossing | Cargo travels the authored path over approximately5active seconds per exposed leg | Cargo is a moving physical friendly bumper to balls, without damage/charge farming; enemy contact belongs to exactly one swept first-hit episode |
| Arrival/rest | Whole cargo body reaches the dock, then clamps visibly engage | Mark the checkpoint permanent; only then grant safety and the next preparation window |
| Final arrival | Fully opened iris and a quiet clear corridor | Win only after the full cargo polygon crosses inside the gate; no invisible centre-line victory |

**Threat proposal:** one physically mounted gun locks one reviewed cargo-lane shot at a time; the player can intercept with a real ball or disable the broad gun body before launch. A docked cargo is never fired upon. The original gun needs a much wider aiming arc than Circuit's proven±0.2rad, so its old proposed±0.9rad is **not admitted**. Produce the articulated pose or change the route before promising a second exposed cross-board attack. Do not rotate a muzzle through its frame.

The latest approved space enemies bypass the field to threaten the paddle. Escort has a different moving-object objective. Decide explicitly whether a cargo-targeted shot also bypasses field panels, or whether the exposed route guarantees a physically empty line. Do not silently combine the old cover-absorption draft with the new bypass renderer. If bypass is retained, only the cargo/ball/active defense intercepts; it must never damage panels or produce free drops.

**Provisional tuning retained for first blockout:** cargo hull3/2/2 Easy/Medium/Hard, crossing time5s in all modes, dock minimum rest3/2.5/2s. A first warning of1.6/1.4/1.2s is only a starting value and must be reconsidered with the selected heavy/salvo projectile body and actual lane travel. Do not adopt the old220/250/280u/s merely because the table exists. Difficulty should add a second eligible crossing or shorter preparation grace, not make the cargo faster and accidentally less exposed.

**Powers and progress:** normal balls must clear every mandatory blocker. Cargo cannot award charge on every bounce. A generic power may clear cover or interrupt a gun, but no compulsory cargo heal is added. Preserve current charge/caps unless separately approved. Cargo hull0 or player lives0 loses. Continue restores the cargo to the last secured dock with at least2hull, capped by mode maximum, retaining cleared panels/guns and completed checkpoints. Clear bolts, start one fresh serve and full warning grace. Retry resets cargo, field and route.

**Production and proof gates:** actual continuous cargo-polygon sweeps against all moving frames/iris/barrels at native scale; inflated2u clearance; runtime rail art collision; contact ordering at a moving corner; no double hull hit from overlap; normal/TITAN ball rebound off the friendly body; pause mid-crossing; same-frame dock arrival and bolt; Continue/Retry; both phones through every leg. The old1345-sample alpha audit proves only a sampled blockout, not these gates.

### 3.2 Orbital Switch: route, tag, overload

**Status:** the earlier B direction remains reserved and unnumbered. No field force, prediction, tagged-ball receiver, final ring or new character has been implemented. It is not a continuation of Forge's current stabiliser HP contract.

**Story purpose:** restore navigation to a disabled orbital gate by routing power through its two field projectors and neutral return. No captives or rescue count. The enemy controls the station; the player reclaims it through ball routing.

**Core proposal:** left field bends an upward ball clockwise, right field bends it counterclockwise, neutraliser clears the route tag. Speed magnitude remains unchanged. Descending returns, the paddle and the thumb lane remain outside all fields. The last entered field owns that flight's tag; each real paddle contact clears it. Route state uses a tiny cyan/violet/neutral shape cue plus a local trail, without replacing the canonical ball art.

The old draft activates one exterior receiver at a time: left-curl, right-curl, neutral. A matching ordinary contact earns permanent progress; a wrong route rebounds without erasing progress. To avoid reviving the rejected tiny-symbol precision grind, the next visual study should test a **broad36–44u receiver face** and clearly visible route trace. That size is a new recommendation, not an approved source asset. If that still reads as an arbitrary gate, present an alternate broad-hull route before implementation approval; do not quietly add one later.

**Provisional first-blockout limits:** left/right influence radii42u, neutral30u; at most0.32s influence per pass, with heading-rate caps40°/60°/75° per second, giving at most12.8°/19.2°/24° turn. Receiver exposure12/10/9s, progress1/2/2 contacts per receiver, and a quiet final ordinary core hit after all three segments. These values come from the retained draft and remain untested. They are not human calibration or a guarantee of three reachable paths.

**Teach/test sequence:** first left route with guns idle and no timeout punishment → visible right-route trial → neutralising pass with one warned weapon episode → three petals visibly fold away → fields cease → at least3s quiet straight-ball approach → one broad external core contact and2s success. A missed exposure repeats after a complete recovery and preserves earned segments; it never starts an automatic loss clock.

**Physics contract:** integrate heading change at the same fixed substeps in live motion and aim prediction; sweep every curved substep through actual art-derived metal. Limit influence once per pass, require exit before re-entry, and prohibit trapped or endlessly circulating trajectories. Neutralisation changes the tag only; it cannot teleport/stop the ball. Multiple balls keep independent tags. A continued/caught serve clears transient tags but not completed receivers. LASER clears real panels or disables guns; it does not invent a ball route. Cosmic can retain its approved damage benefits but cannot pretend to pass through closed receiver metal.

The actual C bay has a solid enclosing lower lip. The Switch receiver/core must be visibly projected outside it, with a genuinely open final approach after the petals move. Moving a glowing centre inside the closed bay does not create ball access. Keep that constraint even if the visual ring appears hollow.

**Weapon/power proposal boundary:** use one selected distinct ship weapon pattern at a time, with current-width safe escape or a rest adaptation. Original draft bolts absorbed by cover; latest source enemies bypass cover. Choose and document a coherent rule before the new study. A receiver timeout can trigger a warning but never an unavoidable shot while the player is trapped in a field. Preserve ordinary completion and distinct companion casting; do not add Kit to this space level or introduce a new meter by default.

**Continue/Retry and tests:** preserve completed receivers, partial progress, disabled guns and removed panels. Clear old bolts/tags, fresh serve/full window; no reward repetition. Test three strict ordinary routes at normal and enlarged radius, field-boundary tangency, multi-ball tags, re-entry reset, exact predictor/live agreement, combined Focus/SLOW/hit-stop, moving petals and full final access, terminal ties, pause, Continue and Retry. This has more physics risk than Escort; do a minimal field blockout before any full character/atlas commission.

## 4. New princess level: Brum first, alternatives preserved

The owner authorized the Brum/Yeti direction as a proper princess level and delegated the design/build decisions. Follow [BRUM_LEVEL_PLAN.md](BRUM_LEVEL_PLAN.md) for the integrated Frost Warden story, layout, punch/strong-arm triggers, physical contact and difficulty state plan. `src/frost.js` and its dedicated28-frame art family are complete and locally tested; shipping status remains a separate CI/APK receipt. Brum's selected friendly identity remains separate from the newly authored adversary. This is not a serpent route beneath new art. The anticipation, planted punch, actual hand/post impact, follow-through and recovery cycle have actual native-size captures and measured contact fixtures. Continue normal-ball play and Kit's meaningful role; exact responsibilities and charge settings belong to that specific plan.

This is a castle/Menagerie encounter, not a space chapter; Kit is its control and power identity. The menu/save slot is internal index4, appended after the existing four. Root owns the five-level CI/APK scope and current release receipts. The latest full plan takes precedence over the alternatives below; the owner delegation supersedes the earlier options-first implementation hold for this task.

**Current role/objective:** Frost Warden is a new hostile Yeti with a distinct material/raster family based on the retained anatomy and rig. **Brum remains the friendly frost porter.** Warden's broad body and arms always accept ordinary-ball resolve damage. He advances between authored safe stances and winds up actual fist strikes against a dedicated physical defence barrier above Lumi. He does not attack score/power bricks to generate free player resources. Break his resolve before the barrier collapses and the chamber breach completes. Kit Ward protects the threatened defence; the existing Arrows/Cosmic/Ball Fan choices retain meaningful ordinary combat effects. The actual fist sweep owns post damage; there is no invented overlapping grab/eating animation. Exact stances, limits, mode timings and tests are maintained in the linked plan. Both phone-size Easy earned-power attempts completed with real Kit choices, but their different durations and natural capsules are not ordinary-only or human difficulty calibration.

The following three concepts were drafted before that steering and are **deferred, unselected adversary ideas**. They keep Lumi and Kit in the castle/Menagerie story and remain useful for future variety. Each would need its own approved silhouette, expression and motion proof. Names below are working labels. None is an approved final character, a replacement for Gnash, or an enemy role assigned to the selected Brum.

| Proposal | Enemy anatomy and motive | Player's different question | Main physics work |
|---|---|---|---|
| A — Ironclaw's Broken Bridge (deferred) | A squat six-legged masonry crab, broad shell, two asymmetric stone-cutting pincers; it guards a bridge winch | Which structural brace should I free, and which enemy clamp should I interrupt? | Moving claw contacts, support/collapse ownership, controlled cage descent |
| B — Belfry Pursuit | A compact bat with true membrane wings, short legs, ears and a hanging perch; it carries a key bell for the warden | Where should I bank the ball to interrupt the next airborne interception? | Swept wing/body motion, perch-to-perch flight, bounded falling debris |
| C — Clockwork Boar | Four-legged armoured boar with a real snout, tusks and short tail; a wound-up gate ram | Which lane should I open to turn its charge into a gate-breaking opportunity? | Locked charge trajectory, moving-body sweep, physical gate impulse and recovery |

These do not share a humanoid long-arm template. The crab's pincers and six leg contacts, bat's wings/feet/ears, and boar's shoulder weight/tusks provide their identities. No fish/floating-orb substitute and no space ship art is labelled a finished castle enemy. Brum can later help move a collapsed support as a hero/ally, but that separate story and motion are not automatically approved here.

### 4.1 Deferred A: Ironclaw's Broken Bridge

**Story and win condition:** Lumi is in an iron rescue cradle suspended above a broken bridge. Three visible chain-anchor housings retain the cradle. Break each broad housing using normal ball play; each destroyed housing permanently releases one brake and the cradle lowers a safe discrete step. After all3anchors are released, the cradle lands on the exit platform, opens and Lumi crosses to Kit. Ironclaw tries to clamp the remaining winch/bridge supports; it does not eat Lumi or snake through the bricks.

This is a rescue, not damage to Lumi. Balls rebound from cage rails and friendly characters without hurt or charge farming. Each anchor housing presents a broad reachable glazed surface rather than a tiny link hidden behind unbreakable rails. Ordinary body-shell hits also damage/stagger the crab, so aiming slightly away from an anchor still helps. Disabling it cancels future clamp attacks but never resurrects or resets anchors; there is no mandatory HP cleanup after the rescue.

**Provisional layout on a360u field:** enemy ceiling track x65–295,y110–165; three anchor housings centred aroundx72/180/288,y220–280, each approximately44×30u before real-art fitting; central rescue cradle begins near(180,325), then lowers toward a broad safe exit ledge near y430. Side brick banks aroundy290–420 create bank choices and breakable support routes. Keep the lowest solid gameplay piece at least110u above the actual paddle top at the shorter phone size, subject to ordinary-ball travel/response proof. Extra Android height extends the return lane rather than creating more HP rows. Exact cage/leg/anchor bounds remain blocked out until the selected art is measured; these are placement hypotheses.

**Finite state proposal:**

1. `teach`: enemy enters sideways onto two visibly planted legs. Its first clamp demonstration touches a harmless spare support; no lethal consequence. The first reachable anchor is highlighted once. Initial serve uses the existing teaching cadence, not repeated prose.
2. `patrol`: crab makes a short visible ceiling traverse; all normal shell/anchor contacts are productive. It selects only an intact legal support whose loss leaves a fair ball route and a reachable defensive counter.
3. `windup`: approximately1.8/1.6/1.4s Easy/Medium/Hard; the real pincer opens and locks one support. Local cracks/metal jaw pose show the target. It does not retarget after warning begins.
4. `clamp`: approximately0.35s moving jaw; collision and raster follow the same hinge. A separated normal ball contact with the exposed broad pincer interrupts this attempt. Kit's selected Ward can brace this one threatened support. No perfect instant counter is mandatory: the warning covers a meaningful ball trip, and the support can survive at least one unblocked attempt in the first blockout.
5. `break/recover`: one successful clamp removes or damages one enemy-owned support, never an already released anchor. Its attached brick group loses support and falls using bounded debris/collapse rules. Approximately2s recovery follows; no simultaneous second attack. The enemy cannot break the only remaining normal-ball route or the safe exit platform.
6. `anchor release`: final housing damage is permanent; cancel any clamp whose target no longer exists. For approximately0.65s, one visible winch step lowers the cradle along its actual chain. Live ball/paddle remain clear of the moving cradle or are safely stowed for a specifically bounded presentation; choose that treatment once the real geometry is blocked out, not by deleting balls.
7. `rescue`: last housing break latches safety before loss. All threats stop, cage lowers/opens with approximately1.2s of weight-bearing motion and0.8s of clear Lumi step/Kit response. No body overlap or disconnected grab. Then success.

**Threat and failure:** the first prototype uses player lives plus a visible finite bridge-support budget, not a new global countdown. Start with3support failures Easy/Medium and2Hard only if normal proofs show adequate recovery. Each loss of a support advances one authored hazard state; it cannot silently remove several through a chain reaction. The final exhausted support triggers a readable0.8s winch-jam/cage-danger sequence before loss, with any already accepted final rescue taking precedence. This is provisional and must be tested against a simpler life-only variant before final selection. Do not add both the support budget and an encounter deadline merely to increase difficulty.

**Kit's purpose:** keep the selected face control and the existing Ward/Arrows/Cosmic/Ball Fan choices. Ward physically locks a temporary brace around the warned support for that clamp; the jaw strikes the brace and recoils. Arrows can damage real housings/claw/shell; they stop at appropriate solid geometry. Cosmic retains its canonical art and productive break benefits. Ball Fan creates additional independent opportunities, bounded by the current mode policy. No new second resource, obligatory face tap or free repeated brace. The existing Vault12ordinary-brick Kit baseline is a source fact, not an instruction to copy space24/30/36 recharge into this new castle level; new charge tuning must be separately measured.

**Initial resistance hypothesis:** anchors3/4/5HP, crab shell18/24/30HP, one optional breakable armour ring at most. Broad anchor faces always take normal damage; no tiny required weak-point window. Regular coloured bricks remain normal sized. Clamp cadence begins around6/5/4.5s plus its tell/recovery, with only one harmful action active. These values are uncalibrated. Aim for a complete45–90s Easy route with at least one meaningful earned Kit choice, without making the player wait for an invulnerability window. Increase route/attack interaction before inflating every HP pool.

**Collision and collapse details:**

- One ball episode may damage one shell/overlapping claw assembly once, rearming only after leaving the complete body with a small separation skin. Real incoming contacts must still damage the correct visible part. Powered overlaps cannot farm unlimited replacement charge.
- A pincer sweep uses the same pivot, jaw angle and time as its art. Static endpoint tests cannot certify the moving jaw. Shell/legs are art-derived compound contours; gaps that look open remain open.
- Chain links may be visual only if clearly thin decoration; opaque rails, braces and the cradle are actual colliders. Never place a damageable anchor behind an unchanged solid cage rail.
- Falling enemy-created chunks are either noncolliding visual debris or individually swept actors with one declared consequence. Do not accidentally pass them through the paddle as physical-looking damage. Keep fragments outside the thumb lane, cap their lifetime/count and cull safely.
- Cage descent is controlled motion along the winch, not an unstable rigid body that can crush the ball or strand the run. Preserve every live ball identity/power if temporarily stowing it; return to a fresh caught/fan serve with stale-input protection. No implicit duplication or dead-ball resurrection.

**Animation family:** sideways6-leg walk with grounded foot contacts; stop/weight shift; pincer open/tell/clamp/recoil; shell hit with expressive eyes; stagger/disabled slump; distinct suspicious/angry/surprised/frustrated expressions; real support crack/fall; Kit brace command and held/failed expression; Lumi look/hope/relief plus cage step-down/open/exit. Show native52CSS face readability separately from a large hero render. Establish charge/contact/recovery timing in a short motion proof before rendering a full atlas. All transparent cell bounds, stable pivots, source/provenance and metadata requirements apply.

### 4.2 B: Belfry Pursuit

Lumi waits behind a bell-gate while the bat moves between3large visible perches. Normal ball hits to its complete body progressively drop3gate keys; keys are automatically secured where they land on the gate mechanism, never a separate thumb collection chore. The player can also break broad perch supports to restrict the next flight. No snake route, cage swallowing or clone of Carrier's tractor rescue.

Provisional cycle:2.0/1.7/1.5s hanging tell →1.2s authored perch-to-perch flight above the brick band →0.4s bell strike releasing one warned falling brick →2s grounded/perched recovery. The flight can be interrupted by normal body/wing contact. Its wings must retain genuine open gaps and sweep continuously; no large invisible rectangle. Falling returns remain straight and the bat never dives into the lower reaction/control lane. A destroyed perch changes a clearly drawn flight destination, not a mid-flight teleport.

Kit Ward catches one warned bell-fall at its support, allowing the player to keep a useful bank. Arrows intercept the bat; Cosmic and Ball Fan help through persistent body progress. All3keys secured opens the gate; lives0 loses. Continue preserves keys/perches/damage and cancels airborne debris; Retry resets. First-blockout HP and key thresholds should be small enough for ordinary play and must not use airborne invulnerability. Production risk is wing/contact readability and expensive flight/face rigging. Its first proof must include a full normal-ball perch route and falling-brick/paddle collision, not only a beautiful bat turntable.

### 4.3 C: Clockwork Boar

Lumi is behind a broad locked gate. The boar is a wound-up maintenance ram: clear one of2visible bank lanes and hit its broad shoulder during a tell to redirect its next locked charge toward the corresponding gate brace. Normal hits also wear down the gate through an accessible ordinary route, so a missed redirect never creates a paid or timing-only lock. Two destroyed braces release Lumi. This alternate broad route is an intentional proposed rule, not an existing physics feature.

Provisional cycle:1.8/1.6/1.4s hoof-scrape tell →0.8–1.1s fixed charge over a physically measured upper lane →0.4s gate/bumper impact →2.2s recoil/recovery. Never retarget after launch or accelerate into a newly occupied control lane. Only one charge/debris episode exists; show the actual path through cleared bricks. Bricks in a declared charge path either stop the boar and take bounded damage or are deliberately broken with visible impulse; choose one rule and use it for both prediction and live sweep.

Kit Ward plants a temporary broad bumper that redirects one warned charge; normal ball contact supplies the alternative. Powers damage broad armour/gate and reduce dangerous exposure, not a mandatory parry. Continue preserves destroyed braces, shoulder/gate damage and removed panels; returns the boar to a stable start with a full warning. Retry resets. Main risk is teaching intentional enemy redirection while preserving intuitive ball rebounds; reject it if players cannot understand a successful charge from the native animation alone.

## 5. Proof and production order

1. **Keep the encounter visually reviewable.** Use native-layout images with the actual approved Kit/Lumi and source-faithful bricks; label unfinished art honestly. Show a clear initial state, threat consequence and successful counter, with notes outside the play lane. Current Frost Warden implementation proceeds under the owner's delegated decisions; future alternative concepts remain proposed.
2. **Measure the critical route.** Block out only the chosen geometry at360u, record normal/enlarged ball radii and paddle dimensions from the intended base level, and prove full sweeps through every mandatory opening. Declare solid versus sensor versus decorative parts. No sprite resizing to conceal a bad route.
3. **Build one full enemy cycle.** Initial entrance, tell, motion/contact, interruption, recovery and one success/failure animation. Compare against the approved glossy material/light reference at393×852 and412×915. A large still is insufficient.
4. **Make the smallest playable encounter.** One initial teach, one developed challenge and a finite finish. Keep explicit state data, actor/collider poses and real-clock policy. Add new systems only where the selected mechanic requires them; reuse Arena, brick damage/collapse, fixed-step ball helpers and pause/Retry contracts.
5. **Regress actual edge cases.** Final hit versus last miss; destroyed target during its warning; simultaneous balls; powered overlap episodes; no hostile charge/drops; changing WIDE; moving-corner sweeps; Focus/SLOW/hit-stop timing; menu/background freeze; stale pointer/Space/orb after presentation; Continue before/after a permanent milestone; Retry with spent powers and live hazards; valid saved stars/mode isolation.
6. **Earn routes separately.** Both phone sizes: ordinary optional-power-free route and a real earned Kit/companion-choice route, without direct target/HP/resources/lives edits or compulsory Continue. Record all bounded failures as well as wins. Staged visual fixtures are separately labelled. Test capsule interactions naturally as a different assisted scope.
7. **Observe people.** Can a first-time player explain the goal, tell, counter and failure? Can they see the ball under the VFX and react above the thumb? Does an ordinary choice feel productive? Adjust before calling Easy/Medium/Hard calibrated. Controller timing alone does not answer these questions.
8. **Finish the artifact trail.** Manifest source hashes, frame cells/pivots, alpha/metadata/decoded budgets; exact build/start-end hashes; native screenshots/motion; tests and limitations; updated handoff/artwork archive. Current commit/push is authorized by the owner's latest delegation and is coordinated by root. A new APK needs its own packaging, CI/native evidence and downloadable artifact; a document or source change does not update an existing APK.

## 6. Recommended next decision

Consolidate the integrated five-level handoff/build/CI evidence and obtain mobile play feedback on the exact delivered APK before calling the difficulty calibrated. Keep Escort and Switch reserved as different later space experiences; crab/bat/boar remain deferred. Do not commission all3alternative adversaries or two new space physics systems simultaneously: the first complete native-size motion/collision cycle should decide whether each direction earns a full production family.
