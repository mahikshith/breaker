# BREACH handoff 1/3: status and next steps

**Vault successful-rescue retreat (2026-10-20):** The owner approved the emerald snake/capture presentation. The final requested correction replaces backward cell stepping/fading with a head-led turn and return into the top tunnel, followed by the whole body and tail. The entrance remains visible, and the result cannot cut off departure. See `docs/FANTASY_REFINEMENT.md` and `docs/validation/snake-retreat/`. Difficulty and black-block removal remain deferred. The earlier capture receipts remain historical evidence for their pinned build.

**Snake presentation and capture steering (2026-10-20):** The owner deferred difficulty/black-block removal, requested richer emerald graphics, then expanded the request to the wrapping body, evil laugh, Lumi's body animation and venom melting. The initial graphics-only audit preserved all55 non-draw methods; the subsequent capture pass replaces post-second-strike pose morphing with length-conserving head-led motion, coordinated front/rear layering, a visible jaw laugh and a4.2-second attack-timeline ending. A fallen ball cannot interrupt an already committed capture. The entire400-cell field remains unchanged:45 granite/18 cage-bar cells. Existing dungeon brick art/dust and live combat rules remain. Final evidence is in `docs/validation/fantasy-refinement/`; the historical APK does not include these changes.

**Keep playtest revision (2026-10-20):** The owner reported Bellforge's portrait-playfield load error, unclear villain endings, unusable Tidewheel powers, disconnected water attacks/chains and a visual gap in the original Vault. Current implementation and receipt locations are in `docs/FANTASY_REFINEMENT.md`. The layout now bounds logical paddle space; both villains have staged grounded defeats and new reaction art; Tidewheel gains three earned choices, fixes the 99.999%-charge gate, emits water from the animated claw, and retains cumulative wheel/chain motion. The original Vault reuses the rendered castle hall with its established collision/grid. This revision changes the current canonical web build; B06CDD and APK references in earlier entries remain historical. The new standalone keeps are still outside the released APK. Autonomous branch commit/push remains authorized; no main merge.

**Grounded keep encounters (2026-10-20):** The owner approved Bellforge Run and Tidewheel Citadel, then requested extended supports, more bricks and a smaller crab that hauls a chain, becomes angry, attacks and threatens Lumi through rising water. Both standalone browser encounters now use actual separate scenery, keyed actor poses, moving machinery and swept ball collision. Bellforge has 30 phone-layout bricks and extended physical rolling ramps. Tidewheel has 24 raft bricks, a broad supporting sluice wall, a measured chain grip, lateral patrol, ordinary-hit stun/anger, warned stronger pulls, a descending refuge and an interceptable water shot. A reproduced 26-second centre-catch dead period led to two-hit central raft braces that visibly crack and open a broad lower entry. Numerical rules and final evidence are in `docs/BELLFORGE_PHYSICS.md`, `docs/TIDEWHEEL_PHYSICS.md` and their `docs/validation/` folders. Browser tests are not physical-device or human enjoyment certification. All342 unit tests and the canonical build pass; the released bundle stays B06CDD. Both previews, like Gatebreak, remain outside the five-chapter APK. The artwork archive verifies1,006 records/1,030 aliases/381,626,616bytes. Owner authorization permits design decisions, commit and push on the branch; no main merge.

**Gatebreak recheck and approved keeps (2026-10-20):** The owner clarified RECHECK, not reject. The mission now has nonmagnetic falling capsules, measured Ricochet/Trident launch points, visible shield interception, thunder-only Stormwing and physically combining ignored scouts. Final independent browser evidence is in `docs/validation/starflight-mission/`; all six phone/mode UI cases and eight bounded Easy routes passed on stable source. Ordinary Easy runs took197–211s; earned powers162–173s. Human enjoyment and physical-device performance remain unverified. Both Bellforge Run and Tidewheel Citadel reference boards are now approved and preserved; moving machinery and independent physics are being developed in a separate browser prototype. No new APK inclusion is claimed.

**Starflight campaign design and combat lab (2026-10-20):** Latest owner steering is a dedicated combat-first story/level/asset plan before campaign production. The owner clarified that rescue-to-module progression was an example and explicitly rejected treating it as a fixed formula. Read `docs/STARFLIGHT_CAMPAIGN.md` for reference-informed enemy roles, weapon tradeoffs, distinct encounter objectives, pressure/recovery beats and exact asset production order. Rescue is optional and occasional. Its campaign features are proposals, not implemented encounters. The separate browser lab at `prototypes/starflight/` implements direct flight, smaller ships, seven bounded reactor powers, a single circular chooser, additional enemy families, asteroids and warned gravity. Current branch is `codex/starship-run-prototype`; the green five-chapter release branch is incorporated. The branch passes 266 units; its older Android payload remains byte-identical B06CDD. Thirty-nine new Starflight PNGs decode with empty metadata; artwork archive now verifies 918 unique records / 940 aliases / 320,069,413 bytes. Final phone-browser receipts belong in `docs/validation/starflight/`. The existing APK does not contain Starflight; native packaging, physical-phone performance and human Hard balance remain separate work.

**Completed Android release (2026-10-20):** The five-chapter space/Vault/Frost preview is built, pushed and verified on `codex/space-combat-apk`. CI [39399653237](https://github.com/mahikshith/breaker/actions/runs/39399653237) passes 231 units, all canonical/offline phone suites, layout/polish, compilation/lint and complete Android 15 native touch/fullscreen/lifecycle checks. Downloaded APK: 9,596,473 bytes, SHA256 `B44BC99FE10468DEF35E89F32B85900F8AAD3C16BB92C6C1040A04D850E7BA8E`; payload B06CDD/4071ACEE and offline fonts/licenses are exact. Actual native screenshots were inspected, with the immediate recreated-Nix still explicitly timing-limited. Artifact, verification and remaining physical-phone/human-balance limits: `docs/MOBILE_PREVIEW.md` and `docs/validation/space-combat/native-release.json`. Earlier failed-run entries remain historical. No new prototype content is included in this APK.

**Release investigation (2026-10-20):** The isolated `codex/space-combat-apk` worktree retains canonical B06CDD and offline 4071AC. Native run 39166153838 passed the repaired resume/input gates but lost its emulator later; an unbounded diagnostic then caused the job timeout. CI now bounds test/evidence commands, preserves failing exit codes and retains live/host diagnostics, with a software-renderer safeguard. The emulator exit cause is unproven. No gameplay change or new APK success is claimed; see `docs/MOBILE_PREVIEW.md` for precise evidence and the next native gate.

**Current implementation (2026-10-19):** The owner approved heavy rounds and three-shot salvos, per-ship colours, left/right/paired/rest batteries, stronger player fire, Vesper/Latch for Circuit, a new power chooser and difficulty tuning. These changes are implemented on `codex/space-combat-apk`. The owner subsequently delegated remaining design decisions and requested a new princess/Yeti encounter, full documentation, commit/push and an APK. Frost Warden is integrated and locally verified as the fifth chapter; Brum remains an ally. Read `docs/CONTINUE_HERE.md`, `docs/SPACE_COMBAT_HANDOFF.md`, `docs/BRUM_LEVEL_PLAN.md` and `docs/MOBILE_PREVIEW.md` for current mechanics and verified release status. Older review gates and localhost checkpoints below are historical. No new CI success is claimed until recorded in the release document.

**Historical cannon correction before implementation (2026-10-19):** The owner rejected the4189 weapon studies. Enemy cannon fire must cross the intact brick field and threaten the paddle/craft, without breaking bricks or releasing their rewards. Carrier currently damages enemy-hit panels; Circuit/Forge currently absorb shots on cover. These behaviours must change in the approved implementation, while preserving player brick collisions and keeping Carrier boarding threats active. Circuit's centre is an exit iris, with no suction mechanic; the replacement presentation keeps it quiet until departure. The revised cannon comparison is at4190, stronger friendly skiff deployment/fire at4191, and reference-backed distinct companion proposals are recorded alongside them. See `design/phase1/weapon-vfx-v3-review.md`. The4188 playable checkpoint remains unchanged; visual approval is still required before implementation, commit/push or APK work. The previous4189 quality receipts certify only that historical study, which is now rejected.

**Replacement weapon motion review (2026-10-19):** The rejected Hard boards are superseded by two moving visual candidates at <http://127.0.0.1:4189/>: A Magnetic breacher and B Reactor rupture. Both use original cannon/ship art, complete rendered charge clips and actual machined payload PNGs, with distinct launch/recoil/travel and staged source-panel impact. The initially regular B fracture was revised to five unequal jagged metal pieces. Independent review covers12 family/phone/cannon combinations,132 phase PNGs, controls and full cycles with zero browser/network errors. All14 protected source/build hashes and four served4188 routes remain unchanged. Final movies decode at1240x1000 /5.209s with distinct frames. See `design/phase1/weapon-vfx-v2-review.md`, permanent candidate media in `design/phase1/weapon-vfx-v2/review/`, and `out/weapon-vfx-v2/qa/final/QA.md`. The734-file archive preserves candidates and rejected drafts. These are visual studies; owner approval still gates gameplay, tuning, commit/push and APK work. Desktop timings/memory are not handset performance admission.

**Current selected effects and power limits (2026-10-18):** Ship A magnetic extraction/plasma and Kit B single-row Quick Volley are implemented in the4188 review hub. Kit offers real Brick Ward, Arrows, canonical Cosmic and Ball Fan while retaining the face control. All three space levels use slower18/22/26 banked hit/active-second charging. Companion casts and ball pickups now obey mode caps:12/9/5 live balls,2/2/1 simultaneous Cosmic,20/18/14 maximum remaining special seconds. Saturated choices keep charge. All196 units,24 actual Main phone/mode cases (including66 Kit check groups), required polish/layout and compact mobile UI pass with zero page errors. Six coarse earned Easy attempts win with3lives; they are not human balance. Exact builds, screenshots and receipts are sealed in `out/space-selected-review/final-report.json`. The owner rejected both subsequent Hard laser/lance/battery boards as stale and visually mismatched. Their replacement is an isolated moving weapon study using the original cannon art and new rendered payloads; gameplay implementation remains explicitly withheld until the owner approves the visuals. Current normal plasma still uses the existing3.5u collision core. See `design/phase1/space-selected-review.md`. Older4186/4187 and the delivered APK are unchanged; no new gameplay commit/push or APK is implied.

**Historical pacing revision before the selected FX/Kit build:** The owner finds the six-hit space-power revision too short. All three space levels now bank18/22/26 ordinary damage credits and fill the orb over at least18/22/26 active combat seconds; shots/cosmic balls cannot recharge themselves. WIDE stacks width and time, other positive durations add, ball fan adds ordinary survivors, and canonical cosmic artwork is restored. Actual paddle artwork now widens with its collider while preserving chrome ends. The pacing-only hub is127.0.0.1:4187; older4186 and the APK remain frozen. Three level owners supplied earned Easy routes and native render proofs; scripted durations are not human balance. All183 units, final18 Main phone/mode cases, required polish/layout and compact mobile UI pass with zero page errors; exact artifacts are sealed in `out/space-polish-review/final-report.json`. Two ship-effect proposals and two Kit menu proposals have been shown, with owner picks still pending. New suction/cannon FX and live Kit power choices are therefore not yet built. See `design/phase1/space-polish-review.md` for rules, receipts and limits. No commit/push: the latest message both authorizes push and then asks to wait; resolve that after the complete result is reviewable.

**Historical six-hit space revision (superseded by the current pacing revision):** The owner rejects the earlier Circuit/Forge Easy balance as a precision/patience grind. New review candidates retain the selected visual families but provide broad mothership damage, equal-sized coloured panels, fewer grey pieces and Nix in all three space levels. Six productive ordinary damage contacts earn a paused three-choice picker: ten-second LASER, ten-second UNSTOPPABLE, or fill the live set to5 ordinary balls. Shots/TITAN do not self-recharge. Closed Forge machinery takes damage; Circuit drops the ordered-symbol gate and retains an earned skiff burst; ordinary ship metal hits remain productive. Carrier retains crew urgency and uses a curved connected tractor beam and matching pull. Shared input resets prevent stale taps/Space from launching; pause Retry stays. New browser review hub is127.0.0.1:4186, with all three modes per level; older4184/4185 and the delivered native APK stay frozen. All171 tests and the local build pass. Final18 actual Main CDP cases cover three levels ×three modes ×both phones, with visible Nix, choice/cancel, frozen clocks, powers, pause and Retry; zero page errors. Required polish/layout and compact mobile UI pass. Exact final artifacts are Carrier9f772abdf382, Circuit983c8c0328d0, Forge7c8df65c5f23; sealed hashes, gallery and receipts are in `out/space-power-review/final-report.json`. Circuit/Forge coarse Easy public-input-assisted completions with earned choices are separate evidence, not human balance. Carrier curved-motion media is explicitly staged. Full rules and receipt links: `design/phase1/space-powers-review.md`. This supersedes earlier balance/target rules, not the approved artwork. No gameplay commit/push or new APK approval.

**Artwork preservation:** `artwork-library/` now preserves750 unique originals/asset records (770 source aliases/versions, 288042628 bytes), with a complete catalogue, full SHA256 manifest and preserved A/B/C/D space-board gallery. See `docs/ARTWORK_LIBRARY.md` and `artwork-library/README.md`; AGENTS.md links the folder and requires `python tools/archive_artwork.py` after adding artwork. Copies are byte-exact, duplicates share one copy, and changed sources create new versions; historical rejected concepts remain labelled. Working manifests/render scripts stay at their existing paths. The archive is local until an approved push or separate backup.

**Historical selected space reviews (superseded by later owner difficulty feedback):** Owner-selected Circuit Breakout Level2 and Shutter Forge Level3 are now actual-art playable isolated candidates. Circuit HTML `9115383E4F4963F86C11A7063A07A50B10FC1B7347F5425AC4C972D39202FDCE`, sourceEEB862BC…, is served at127.0.0.1:4184/circuit.html?level=1&difficulty=medium. Forge HTML `E8F06046E4B224C1EF790F59F4124661583ABC1F5D141583ED0B44A46118F97F`, source89B1E8A1…, is served at127.0.0.1:4185/forge.html?level=1&difficulty=medium. Both use fresh Main controls, house fonts, real Resume/Retry/Menu and semantic result titles; previews have no companion/pilot/captive art. All147 configured tests pass, including20 independent new-level regressions. Both packed previews pass actual Chromium phone-size touch, pause, Retry, geometry and visual checks with zero page errors. Circuit earned runs win50.2667s iPhone /28.0417s Android, three lives: both use the selected intrinsic flight burst, Android also naturally collects SPLIT/LASER. Forge strict ordinary completions are162.88s iPhone /260.0417s Android, three lives, no optional capsule/TITAN/Continue; Android uses a legitimate wall-bank input policy. Earlier failed policies remain retained. These are scripted route proofs, not human balance or physical-device performance. Actual motion fixtures are explicitly staged. Details: `design/phase1/relay-circuit.md`, `orbital-forge.md`; independent review: `out/next-level-review/REVIEW.md`; phone galleries: `out/selected-levels-review/`. Human screenshot/play OK is still required before gameplay commit/push, permanent registry admission or a new APK. Existing frozen F8EB pause-Retry checkpoint4183 and delivered APK remain unchanged. The final local `npm run build` also passes at `EB70331AD2A520D35E9DFB0EDF4F6539D68CD455ACF814D70920061D7B780547`; it includes the shared no-core charge guard but retains only the existing two menu levels. Phone review receipts belong to their exact frozen previews above, not an untested new APK.

**Pause Retry checkpoint (2026-10-18):** Owner explicitly requests Retry inside pause. Current Main uses the existing fresh constructor on the same level/difficulty; Continue/ad/result/input state and the frame origin reset while saved stars/preferences stay intact. Three stacked Resume/Retry/Menu buttons fit both phone safe areas. Two independent regressions and12 real CDP cases (Carrier/Vault ×three modes ×both phone sizes) pass with zero page errors on exact HTML SHA256 `F8EB9BE20BDD854546944BF941CBB139FE97887505094A46B33732FAA6ECB9E0`. Frozen review is `out/pause-retry/browser/breach.html`, served at127.0.0.1:4183/breach.html?difficulty=medium. Evidence: `out/retry-review/final/report.json` and `out/retry-review/REVIEW.md`. This proves the two existing menu levels; selected Circuit/Forge will need the same real-input checks after their isolated build is ready. No new gameplay commit/push or APK change.

**Owner human balance feedback (2026-10-18):** The owner finds earlier BA5E Carrier too easy and Vault too hard, then selects a MIX of boosted retreat and finite rebuilding siege. That choice is implemented in the new review candidate; the old pure A/B choice is closed. Easy/Medium/Hard share controls and the lower reaction lane. Vault locomotion/chew multipliers are0.60/0.80/1.00; warning, venom, cage and ball/input timing stay intact. Hard Carrier is a development setting pending calibration, not approved balance. No new gameplay commit/push approval has been given.

**Latest selection and tested candidate (2026-10-18):** Production HTML SHA256 `19376ED445F4D89CEA02CFF8733A5255DA14FD275DA3CAD9798155AA64516AA1` adds the selected hybrid to Boarding Raid: finite distinct manifests, active per-manifest jump clocks, permanent archived rescues, six-contact manual Nix, larger target-facing fighters, visible hull motion/engines, safe rebuilding and final boosted retreat or disabled cleanup. All128 units pass. Production two-phone real-input lifecycle checks, required polish/layout and compact mobile UI pass with zero page errors. Separately sealed isolated HTML `4F808C2A682885F6415325CBC89B064D63939FF277912ABD859D5AD048BC457D` uses identical gameplay source plus embedded fonts/read-only trajectory planning. At120Hz public level input, ordinary Easy wins40.400/42.700s; Medium ten-rescue wins109.725/125.600s, three lives, no pickups/Nix/Continue. These are scripted route proofs, not human balance, DOM routing or performance proof. Hard75s/8.5s has no strict ordinary full-clear admission; failed attempts and an unadopted90s/10s experiment are preserved. A separate bounded earned-Nix proof readies at8.667/12.325s with nine authored rescues remaining; iPhone cast run wins, Android cast run disables the hull then controller-times-out in cleanup, not a victory (`out/carrier-hybrid/nix-earned-report.json`). Primary changes remain uncommitted pending owner play/screenshot OK. Evidence: `out/carrier-hybrid/evidence.json`, `out/hybrid-review/production-decoded/report.json`, `out/carrier-hybrid/mobile-ui/report.json`. Earlier BA5E and4181 remain frozen history.

**Parallel levels authorized (2026-10-18):** The selected Circuit A and Forge A mechanics, source-faithful machinery families, actual moving collision and independent phone reviews are delivered as described above. Escort Run B and Orbital Switch B remain distinct later directions, numbers unassigned. Original B/C rescue prototypes are historical; selected design/source geometry and collision are authoritative now. The C lower hull lip remains physical: Forge uses its visibly deployed exterior reactor. Circuit uses four empty phase stations, real split-metal firing ports and one earned skiff burst; Forge uses three timed stabilisers, collapse, once-only ordinary three-ball reward and quiet external-reactor finish. No extra cast or permanent registry/progress migration is included. All new gameplay remains uncommitted pending owner approval.

**APK checkpoint delivered (2026-10-18):** Separate `codex/carrier-mobile-preview` CI [39129140498](https://github.com/mahikshith/breaker/actions/runs/39129140498) completed successfully on native fix47bc6b3. Actual APK artifact12137681701 is downloaded and verified at `../breaker-mobile-preview/out/carrier-apk-delivery/39129140498/apk/BREACH-Carrier-preview.apk` (2,431,097bytes, SHA256 `7F5468197BB6333BF5AACEBE4CF4226048D043634BCA8829B6644042C4F2E10D`). Web44units/six suites, native build/lint and lifecycle instrumentation pass; actual recreation captures show full1080×2400 content. Frozen gameplay F4863DC5… and packaged HTML4D5D7B5E… remain exact. Delivery documentation commitf72e7ccf follows tested47bc6b3 and is pushed as the owner. APK excludes Boarding Raid, Nix/Tick, difficulty/hybrid and B/C. Physical phone performance remains for owner testing. This checkpoint authorization does not approve primary gameplay commit/push or merging main.

Read all three handoff docs before touching code: this one (status, rules, TODO with agreed designs), `02-architecture-and-pipeline.md` and `03-environment-skills-ux.md`. Keep them updated at the end of every session. Historical sections include the original `wip/polish-pass` snapshot (`main` @ b5df0eb); current work and the newest progress entries take precedence.

**Current work:** Await the owner's review of the completed4189 moving candidates, A Magnetic breacher / B Reactor rupture. Actual phone-size motion, corrected irregular fracture, source hashes and frozen gameplay receipts are complete. Keep all new Hard weapon rules, production packing/tuning, commit/push and APK work behind that visual approval.

**Historical A/B asset milestone (2026-10-18):** real independent PNG parts and the isolated Canvas motion assembly are complete for the approved A/B left playfields. Final proof is under `out/space-assets-ab/final/`: `A-ios-reference.png`, `A-android-reference.png`, `B-ios-reference.png`, `B-android-reference.png`, `A-motion.gif`, `B-motion.gif` and `asset-report.json`. Actual 393×852/412×915 images and sampled launch/release/boarding/iris sequences pass independent visual review; all four capture runs report zero page errors, real alpha/metadata checks and approximately 126 CSS paddle reserve. A has five shallow captive windows; B has four large worker pods. This asset-only milestone contains no companions, pilots or portraits and predates the latest Nix/Tick selection. These are asset-motion proofs with a placement ball, not new gameplay: runtime admission/WebP sizing, actual-alpha collision alignment, input/combat/rescue/power rules, full playable phone runs, memory/performance and new APK checks remain. The proof milestone retains EA839F00… as its gameplay baseline; it does not cover later Carrier integration. Reproduction and limits: `art/space/ASSETS_AB.md`; inventory/contracts: `design/phase1/space-assets-ab-spec.md` and `space-assets-ab.json`.

## Progress log (newest first)

- **2026-10-19 — Corrected cannon and stronger friendly-fire review:** The owner rejects enemy brick destruction, weak shots and identical space companions. New4190 heavy-shot/salvo attack studies cross complete intact fields and sweep only the paddle; hit/dodge, genuine drag, exact restored field pixels and14 unchanged production/build hashes pass12 phone/ship/pattern cases. Real rendered plasma replaces the rejected mechanical payloads and flat impact stamps. Separate4191 skiff study deploys armour/cannons and now fires roughly14u visible cyan rounds with stronger muzzle flash/recoil; both phone checks pass. Circuit's centre is a closed exit iris, not suction. Original Nix/Tick, Vesper/Latch and Nova/Pin cast status/roles are preserved in `design/phase1/space-companion-role-review.md`. Carrier's raider breach dependency must also change when enemy brick damage is removed, or boarding can stall. Review scope/receipts: `design/phase1/weapon-vfx-v3-review.md`. No production implementation, damage retune, commit, push or APK; visual selection remains pending.

- **2026-10-19 (rejected Hard art replaced; visual gate pending).** Built two isolated moving studies from original cannon art, real dimensional payload PNGs and24 rendered charge frames. Rejected ornamental/bead seeds remain preserved; B impact now breaks into five irregular pieces. Independent12-combination phone/control/full-cycle review passes with zero errors and all14 gameplay/build hashes plus four served4188 routes unchanged. Final movies decode correctly;734 artwork originals/records are verified. Full receipts and prototype limits: `design/phase1/weapon-vfx-v2-review.md`. No new weapon gameplay, commit/push or APK.

- **2026-10-18 (selected magnetic extraction / Quick Volley / mode caps).** Implemented shipFX A and Kit menu B; actual curved suction, shared plasma visuals, four Kit choices and themed physical arrows preserve canonical assets. Added explicit companion caps and no-offensive-self-recharge; saturation retains charge. All196 units and24 Main phone/mode cases pass, including66 Kit groups and actual Ward/cosmic proofs. Required polish/layout/mobile UI pass. One coarse Easy attempt per ship/phone wins; a separate non-targeting Carrier Hard policy loses before the first Nix cast, so no further refill delay is adopted. Stronger Hard beam/battery options are shown but unbuilt pending pick. Preserved670 unique artwork originals/records. Final receipts/screens: `out/space-selected-review/`. No commit/push/new APK.

- **2026-10-18 (Easy pacing, stacking and cosmic art correction; design gates pending).** Banked timed charge replaces instant six-hit refills across all space levels. WIDE grows on repeated pickups and now widens actual art with protected chrome caps. Positive timers and ordinary ball fans stack. All three cosmic balls use the canonical effect. Final18 phone cases and183 units pass; both-phone WIDE/cosmic native proofs, required polish/layout and compact mobile UI pass on sealed final artifacts. Earned Easy routes and four actual-asset design proposals are preserved. Live Kit choices and new cannon/suction effects await the owner's two picks; no new commit, push or APK. See the current pacing brief for exact receipts.

- **2026-10-18 (owner difficulty correction; shared powers and artwork library).** Three level owners reworked target access, panel proportions and productive mothership hits; shared Nix choice powers and input lifecycle checks are integrated. Curved Carrier extraction uses the same actual worker curve and emitter. All171 units pass, with18 final phone/mode/level control cases, visible Nix, zero page errors and separate earned Easy runs. Exact builds and gallery are sealed under `out/space-power-review/final-report.json`; old snapshots/APK remain unchanged. Preserved662 unique artwork originals/records, catalogue and hashes in `artwork-library/`; AGENTS.md and dedicated documentation record upkeep. Owner testing/approval remains required before gameplay commit/push.

- **2026-10-18 (selected Circuit/Forge playable; pause Retry proved).** Parallel selected A/A implementation is delivered with real source-faithful parts, alpha collision and physical poses. Circuit9115383E… and ForgeE8F06046… pass all147 configured tests,20 independent mechanics tests and both-phone actual Main input/pause/Retry/visual checks. Scripted Circuit wins include intrinsic burst (Android natural powers); Forge ordinary-only wins include a legal Android bank route without changing gameplay. Fixed own-door cannon obstruction, measured craft emitters/cradle, full-screen Forge crop seams and late-event state ties. Runtime families are sized/losslessly packed with source/manifest/pixel receipts. Actual galleries and explicitly staged motion are shown to owner. Later B/B variants remain reserved. No gameplay commit/push, main merge, permanent registry admission or APK change.

- **2026-10-18 (Circuit/Forge selected; pause Retry added).** Owner chooses Circuit Breakout and Shutter Forge now, retains Escort Run/Orbital Switch for later distinct levels, and requests pause Retry. Shared Main now has Resume/Retry/Menu; fresh same-mode/level restart clears attempt and frame carryover, preserves saved data. Two source regressions plus12 real-phone-size CDP cases pass onF8EB9BE2… (Carrier/Vault only). Selected-level machinery, gameplay and independent reviews are underway in isolated paths; no finished level/art/ordinary win is claimed yet. No primary commit/push or APK change.

- **2026-10-18 (selected Carrier hybrid; Level2/3 variety; APK delivered).** Owner chose boosted retreat plus finite rebuilding siege and asks different Level2/3 objectives with tension/release. New Carrier review build19376ED4… passes128units, both-phone production gestures/pause/transition input, required polish/layout and mobile UI; ordinary scripted Easy/Medium routes are separately sealed. Hard remains unadmitted after bounded failures. Level2/3 two-option design studies await picks; no new B/C live mechanics/assets claimed. Separate frozen APK CI39129140498 passes and verified artifact12137681701 is delivered. No primary gameplay commit/push or main merge.

- **2026-10-18 (human difficulty feedback; new proposal gate).** Owner finds Carrier too easy, its raiders trivial, Nix unavailable before completion, fighter facing wrong and the mothership inactive; current Vault is too hard. No commit/push approval. Requested three modes and active boss/retreat or rebuilding progression are now source-audited and shown in two actual-asset boards, pending pick. Current Carrier2HP/8s is proposed Easy; current Vault becomes Hard. Full-mode balance/transition implementation is unbuilt. Native APK47bc6b3 follows the distinct recreated top-inset failure; CI39129140498 still pending.

- **2026-10-18 (Boarding Raid selected and integrated; owner review pending).** Selected B supplies a2HP reachable boarding fighter, warned cover breach and an eight-second local extraction with connected final-two-second pull. Ordinary hits on the fighter or targeted housing interrupt; Tick secures actual rescue identities; hull18HP shutdown is optional. Nix uses the existing12-break charge for one manual7s TITAN, without automatic centre activation or SPLIT duplication. Independently reviewed Nix/Tick atlases pack losslessly with zero RGB error/exact alpha. All103 units, both-phone integrated touch/pause/background/Continue and updated mobile UI pass; strict ordinary assisted clears40.708/36.783s preserve three lives. Required polish/layout runs are recorded separately; no human balance/device-performance claim. Evidence and browser URLs above. New gameplay is uncommitted; the APK worker owns frozen checkpoint lifecycle CI39127870146 after the recreated-WebView focus failure in39126881472. No APK success is claimed.

- **2026-10-18 (Carrier browser play accepted visually; urgency redesign required).** Owner played the exact frozen Carrier web candidate at127.0.0.1:4180/breach.html?level=1, likes the artwork/graphics, but finds no rescue urgency, meaningful fighter adversary or useful companion role; slow cover-blocked bolts and hard-to-read hull damage do not create enough stakes. This is visual approval, not gameplay/balance approval. Prepare two image-backed urgency proposals with explicit rescue threat, warned fighter attacks, earned Nix/Tick counter and ordinary-ball completion, then wait for the owner choice before changing live gameplay. No Kit in space, fake finished companion art or real ad/payment/store integration. Current APK remains the exact visual/control checkpoint. Following full read-only native review, lifecycle/test/evidence corrections are pushed as `8618f4c`; [CI39124792121](https://github.com/mahikshith/breaker/actions/runs/39124792121) repeats44 frozen unit tests, both ordinary and offline-packaged browser suites, native compile/lint and expanded held-input stop/resume/recreation/fullscreen checks. Earlier two native failures remain documented; APK still pending.

- **2026-10-18 (parallel B/C isolated milestones reviewed).** Relay B uses real selected art and passes14 focused tests plus both-phone pointer/pause/escape checks. Strict ordinary-only iPhone clear234.6s uses no capsule/offensive power; Android86.3s includes earned TITAN, so it is not pure-normal evidence. Independent WebP/alpha review passes19parts; HTML20.34MB to3.54MB, decodedRGBA estimate40.69MB to9.01MB, with unchanged gameplay/source PNGs. Orbital C passes16 focused mechanics checks and both-phone powered assisted wins71.55/94.92s; strict full normal-only win is unverified. Its first separated C hull/bay/shutter family now has asset-only source/phone/motion proof, while the playable C prototype still uses labelled primitives and remaining C art is unbuilt. Full primary unit suite74/74 passes. No B/C menu/packer/production/APK admission, physical-device performance or human balance is implied. Details: `design/phase1/relay-gameplay.md`, `orbital-level3.md`; bounded review notes under ignored out/.

- **2026-10-18 (Carrier native CI repair; parallel level proof limits).** Initial Carrier CI39122761324 passed all web checks and native compilation/lint but native touch injection hit the Android launcher ANR system dialog. Checkpoint fix `e47d07e` stops that emulator background launcher, acknowledges the OS immersive hint and explicitly awaits app focus; no gameplay assertion or F4863DC5 payload changed. Fresh [CI39123471388](https://github.com/mahikshith/breaker/actions/runs/39123471388) is active and APK publication remains gated on success. Relay now has separately owned real-B-art gameplay plus independent collision tests and an earned ordinary-only iPhone clear, with strict Android/human balance still unproven. Orbital has C-specific mechanics and both-phone powered assisted wins but no production C art or strict normal-only full win; final independent preview UI fixes are underway. Detailed subtasks, reports, hashes and release gaps belong in `design/phase1/relay-gameplay.md` and `orbital-level3.md`. Neither prototype is included in the current APK or main registry.

- **2026-10-18 (Carrier checkpoint pushed; B/C task groups active).** Carrier/current Vault commit `250b266a002f2a691f6ec0c939d5c179d5884b9d` is pushed as mahikshith on new `codex/carrier-mobile-preview`. [Run 39122761324](https://github.com/mahikshith/breaker/actions/runs/39122761324) was triggered automatically by the push; GitHub currently lists this workflow under its existing **Mobile preview** name. Web checks pass and native build/emulator validation is running; APK delivery is not yet claimed. Separate Relay and Orbital owners plus a shared independent physics/playtest reviewer are implementing their task groups in new isolated files under this primary branch, preserving the Carrier payload. Neither later level has production runtime admission or APK inclusion.

- **2026-10-18 (Carrier A playable candidate passes final web checks; APK requested).** Build `F4863DC5A87D6B46A8A1AFDB702C264F432196B851B61B828946DB8AB75A0423` passes 44 unit tests and real bundled two-phone gameplay checks. Public-input assisted deterministic simulated wins record 82.3s iPhone/two lives and 45.2s Android/three lives of game clock (`out/carrier-playable-final/report.json`), not human balance. Independent final captures in `out/carrier-visual-final/` confirm approved A hull/barrels/doors/fighters/panel bricks/paddle/ball, continuous top/bottom safe-area starfield, paddle alpha/collider alignment below 0.006 CSS px at both tips, and clean settled results with no frozen Carrier effects. All 147 images and both house fonts decode; zero page errors. Carrier uses 125×17u paddle, 7.5r ordinary ball and 10r TITAN; Vault keeps its prior dimensions and exclusive Kit. Nix/Tick appearances are selected, but full expressive sprite/animation families and live cast integration remain pending; B/C/D are deferred. The owner asks for an APK, authorizing its necessary checkpoint commit/push/CI on isolated `codex/carrier-mobile-preview` without merging to main. Packaging/native CI is underway; no passed APK or physical-device performance is claimed.

- **2026-10-18 (Carrier A cast Nix/Tick selected; gameplay integration pending).** After choosing only A / Carrier Breakout for current work, the owner explicitly selects its Nix/Tick character designs. This supersedes the same-day cast-open note below; B/C/D remain deferred. The appearances are approved, not completed expressive sprite/animation families or live cast integration. Build A from the actual reviewed assets, preserve their exact visual quality and validate robust physics/collision with playable iPhone/Android runs. Compare real gameplay captures beside the A board and asset-motion preview. EA839F00… remains the last accepted/tested baseline until the new candidate passes; no new gameplay/APK pass or commit/push authorization follows from this selection.

- **2026-10-18 (Carrier Breakout selected for current work).** The owner chooses A / Carrier Breakout for now and defers the other space directions. Its visual preview is accepted for continued implementation. Character artwork is liked, but the cast remains undecided; a ship/level choice must not automatically admit Nix/Tick or any other companion. Continue only the A playfield and machinery. Existing B assets/proofs are preserved as deferred work; C/D remain later possibilities. The A/B asset-motion milestone below remains valid history. No new runtime integration, phone gameplay/APK result or commit/push authorization follows from this direction choice.

- **2026-10-18 (A/B left assets and motion assembly complete).** Delivered the reference-matched independent PNG tranche and deterministic Canvas presentation proof for CarrierA and RelayB. Final `out/space-assets-ab/final/` includes both-phone reference PNGs, A/B motion GIFs and native release diagnostics. Independent image/sequence review confirms five shallow A captive cells versus four B pods, source-specific A panels/flat paddle, dim edge planets, clear header/lower paddle, bay launch and continuous side departure, front-door release/boarding and opened portal. No companion/pilot/portrait was added. The report covers 31 manifest part entries with no missing paths, zero page errors in all four 393×852/412×915 runs and~126 CSS reserve; metadata/alpha and natural-aspect checks are asset-only. Reference stencils still need alignment to actual alpha before gameplay. No new runtime encounter, WebP admission, gameplay balance, real-device performance or APK pass is claimed. Reproduction/limits are in `art/space/ASSETS_AB.md`; A/B data/spec and source records are saved. Active bundle remains EA839F00…; C/D follow and companions stay frozen.

- **2026-10-18 (all four space levels approved; A/B assets first).** The owner approves polished A/Carrier Breakout, B/Relay Raiders, C/Orbital Breakout and D/Eclipse Rescue as levels. Immediate work is the A/B LEFT playfields, with all companions/pilots/portraits frozen. Reference inventory records A's five shallow captive windows, 16 coloured bricks and three fighters; B's four large worker pods, 30 coloured/braced modules, relay/iris and empty skiff. Source-proportional display bounds are mapped to both phone sizes in `design/phase1/space-assets-ab-spec.md`; independent files/pivots and asset-only Canvas assembly motion belong in `space-assets-ab.json`. Production and native assembly review may proceed without another concept choice. The discarded 113/97-cell proxy maps, HP and deadlines do not carry forward. No new gameplay integration, balance, build or APK result is asserted; tested runtime EA839F00… is unchanged. Historical reopened-choice entries below remain history.

- **2026-10-18 (space visuals reopened; four-board review).** The owner rejected proceeding from the native saucer-proxy studies, referred back to the polished original space boards, then explicitly requested both originals plus two fresh same-theme designs before deciding. No fish theme is automatically selected; the prior Relay Raiders pick no longer authorizes current production. Re-shown A/Carrier Breakout and B/Relay Raiders. New C/Orbital Breakout shows Nova moon-hare, Pin maintenance drone and carrier/fighter rescue; new D/Eclipse Rescue shows Zuri gecko, Flit mechanical bird and crescent dreadnought/cannon/escape gate. All four are appearance/story concepts, not finished models, native runtime screenshots or animation proof. New1536×1024 PNGs `design/phase1/img/space-orbital-c-v1.png` and `space-eclipse-d-v1.png` have empty metadata; prompts and review state are saved in `space-options-cd-prompts.md` and `space-direction-review.md`. Await the owner's board or component choice before new production. Accepted mobile geometry/input rules remain requirements; source build EA839F00… is unchanged. No new commit/push/APK.

- **2026-10-18 (expanded Invasion requested; design gate).** After reviewing the mobile baseline, the owner asks for full-screen space graphics without the framed hangar window, more purposeful brick/power content across the midfield, moving attack ships and laser beams, and something concrete to save. Prepare two native layout proposals with explicit objective, win/fail rules, earned powers and warning/recovery windows. Use space-specific Clank crew/drone rescue; keep Kit/Lumi out of Invasion and preserve the lowered paddle/reaction lane. The selected Relay Raiders direction remains relevant; new mechanics/assets still require an image pick and proof. No rescue encounter, new fighter or laser system is silently implemented.

- **2026-10-18 (mobile A baseline complete, uncommitted).** Owner selected A, then removed stage captions and the entire lower track, requested a smaller game-font score and non-blue Kit ring, and restricted Kit to the princess/Vault theme. Invasion retains its earned paddle-core Titan with no hero draw or invisible Kit tap target. Saturn was first restored, then corrected to a near-black, desaturated backdrop so foreground pieces lead. Current build `EA839F00A4683BD3CFD05CB87BDE6DA4B79EDFFF0191621362FB90A75FF9FBAC` passes26 unit tests and both-phone mobile UI/score/once-only persistence/drag/Titan/shield, Vault face/two-finger/Focus/loss/Continue, venom/capture, layout and iOS/Android polish checks. Zero page errors. Reports are under ignored `out/mobile-*-final-v2/`; actual phone review boards are `out/mobile-ui-final-v2/review-{vault,invasion}.png`. Geometry is paddle126CSS reserve, drain+20u, shield+18u, with lower clipping/culling before controls. Independent256 shield/debris/bolt/zoom fixtures passed the same geometry on the preceding UI-only build; current focused shield cases also pass. Vesper v7 model/face/Walk source proof is ready, not production-admitted.

- **2026-10-18 (spaceship audit and next APK candidate).** Existing Invasion already triggers a36HP mothership after formation clearance, eases it into view, moves horizontally, fires bombs and adds wing guns below half health. Actual motion proof and labelled last-brick/HP fixtures are in `out/invasion-dark-final/`; they do not establish an earned whole-level clear. Original Phase1 prologue/intro/taunt/decoy-and-Lumi-beam story beats remain missing. No carrier/fighter-launch sequence is claimed. The isolated APK worktree exactly reproduces current EA839F00… Windows bundle, with canonical LF hash `9ec2bdc019c018ad5109c0497c2acf0ee0501ccc9c4ebfa794470c7918730382`, offline packaged HTML hash `5dde1b121b0e8009cfa3f049e419f55b7aabd7edaeac146fa0c2334192e2adf8`, version0.2-preview/code2, native immersive bar/cutout/gesture handling and stronger full-window/safe-inset/recreation/transient-bar assertions. Browser inset injection passed fractional-DPR stability checks; native compilation/emulator tests have not run. This candidate and CI updates are local, not committed/pushed/published. New space expansion is excluded until selected/built/reviewed.

- **2026-10-18 (physical-phone layout feedback; proposals only).** The owner found the paddle too close to bricks and the screen cluttered. Move the paddle/support as low as safely possible; move lives/AIM into the top HUD in both modes, retain only Kit at bottom left plus necessary paddle input, remove moon, heavy deck/top panels and repeated drag/slide/catch instructions, and use the game's playful score font. At most one short `Aim ready` on the first actual catch/press. Android must hide system bars while preserving cutout/gesture safety for controls. Two actual-asset Canvas layout proposals share a126-CSS-pixel paddle reserve. This lowers the paddle73.14px on393×852 iPhone and98.36px on412×915 Android; fastest vertical TITAN return from the Vault bottom row grows from.251→.403s and.346→.541s. These geometric windows do not establish human comfort. Measurements and128 passing native shield fixtures are in ignored `out/control-metrics/`; proposed shield+18u must remain inside drain+20u, with debris/drop/bolt control clipping. Invasion danger remains64u above its actual paddle, deliberately adding22.71/27.25s of untouched-formation march time. No speed or Vault clock retuning. Native immersive Activity/test changes are local in the APK worktree and still need Android CI. Image pick, implemented phone screenshots and owner OK still precede a new commit/push.

- **2026-10-18 (selected animation integration baseline).** Packed the selected16-frame spinning heater shield and12-frame unfolding brick armour, removed the connecting beam, and integrated connected patterned capture A with visible Lumi, mirrored approach anchoring and aligned grip cue. Build `CFEA2D6FF5A8FE13F2CF539FA9D9F9FDB0581EF6C4469C38961701202FC972EF` passes21 unit tests and the focused native venom suite on both phones (`out/combined-cast-capture-prelayout/report.json`): real contacts, valid/empty/missed/late/drag defence, protected cage, terminal immutability and first-use lesson. Capture has independent mirrored/defence/Continue checks; cast has early/latest/zoom and interruption checks. Final combined layout and screenshot approval remain pending. Brum's coat-v7 removes the grey band/detached fur pendants and retains continuous source face, fitted eyes and actual fists; its motion GIF is three labeled key poses, not a finished clip.

- **2026-10-18 (separate pre-Brum APK delivered).** `coding/mobile-preview` is pushed and complete [CI run39108320738](https://github.com/mahikshith/breaker/actions/runs/39108320738) is green on code085a2c6. It passes all21 unit tests, phone/Ward/venom suites, exact frozen bundle check, Android build/lint and offline Android15 native input/fonts/levels/storage test, then exports screenshots and publishes the APK. Lint0errors/9nonfatal preview warnings are documented rather than suppressed. [APK artifact](https://github.com/mahikshith/breaker/actions/runs/39108320738/artifacts/12129462604), [native evidence](https://github.com/mahikshith/breaker/actions/runs/39108320738/artifacts/12129562329). Local downloaded APK: `C:\Users\mahik\Music\Breach\breaker-mobile-preview\out\apk-delivery\BREACH-preview.apk`,1,854,545bytes, SHA256 `3e34835d9bf44f5d9c82f5f1e0be292dc79019545bf80de8827df997763842a7`; its payload/font/hash/no-network-permission boundary and actual native screenshots were checked. `main` is unchanged; physical-phone comfort/performance/audio and human balance remain unchecked. New Kit/capture/Brum/Relay Raiders are excluded from this frozen preview and continue here.

- **2026-10-18 (new animation and space choices).** The owner selected Kit cast **A / spinning shield unfolds into brick armour**, capture **A / connected coil with visible Lumi**, and space **B / Relay Raiders** (Vesper quadruped pilot and Latch lockfish). Begin selected cast/capture production in parallel with Brum coat refinement; keep existing defence deadlines, collision/route and accepted level unchanged. Vesper/Latch need actual geometry/expression/motion proofs before full families or encounter integration. Brum is planned as a hero/ally whose strong arms open blocked routes and protect the team, not an implemented encounter. The pre-Brum APK checkpoint remains isolated from these new changes.

- **2026-10-18 (face-only control, cast/capture restart, space and mobile checkpoint).**
  - The owner confirms the level is playable and accepts its design. Kit's face must remain the control icon throughout; the old 12-second miniature body replacement and long connecting cast trail are rejected. Native face-only baseline is `485F921A73977C325E535A3500CEA967CB00B16A63042D15110F4D2D31073DF0`; it builds and all 21 unit tests pass. The face-only control subsequently passed both phone sizes (`out/face-always-qa/verification.json`): all eight expressions, touch/Focus/two fingers, charge/Titan/continue/completion, plus Ward/venom/coach/input outcomes; each device recorded 562 face draws and zero body draws. New animation integration still needs fresh final checks after picks.
  - Prepared two isolated real rendered cast studies in `design/phase1/kit-cast-options.md`: spinning heater shield/unfolding armour or separate short guard cast/rising armour. Prepared two capture studies in `capture-options.md`: visible connected-coil hold or cartoon intake/gulp. Neither is active production. Preserve the existing attack cancellation window, Continue and accepted geometry. The current capture defect is a head-centre/princess overlap with live pacing and lingering debris, not a missing level rule.
  - The owner requests parallel space story/cast/ship/cannon animations, plus Brum's dedicated strong-arm brick-smash levels and escalating difficulty. Two space boards are `img/space-carrier-a.png` and `img/space-relay-b.png`; selection is pending. Brum remains the selected first model proof, not a completed family or playable encounter. New difficulty and paid-power systems are proposals; levels should remain winnable with earned tools and readable counterplay.
  - The owner explicitly authorizes a new `coding/` branch, push and Actions APK artifact of the reviewed pre-Brum milestone while this work continues. Created `coding/mobile-preview` in an isolated sibling worktree and reproduced exact old Windows build `3A6B8A8C5368364AFCFCE6BBF7B1994D4598C121C90B45B72FE5BD7E45285EC1`. Its packaging/workflow and CI outcome are documented in that branch's `docs/MOBILE_PREVIEW.md`. This exception supersedes the usual prefix/commit gate only for this checkpoint; `main` is unchanged. New cast/capture production still needs picks and final screenshot OK.
  - Mobile checkpoint commit `bfe54b7` is now pushed with the owner's author/committer identity. Actions run: https://github.com/mahikshith/breaker/actions/runs/39106952788 . The web job passes all 21 unit tests, exact milestone packaging and phone/venom regressions; native Android compilation/emulator validation are still running. Do not claim an APK passed before that outcome. New branch: https://github.com/mahikshith/breaker/tree/coding/mobile-preview .
  - First native run stopped at a premature font-readiness assertion; the game compiled and lint passed. Fixed startup/recreation smoke readiness in checkpoint commit `8d10575`, kept font and canvas checks, and retriggered https://github.com/mahikshith/breaker/actions/runs/39107558744 . APK publication remains gated on the native pass. Current game bytes are unchanged. An existing Kit face is reused as the preview launcher icon.

- **2026-10-18 (A / left face orb integrated and tested; Brum proof selected; uncommitted).**
  - The owner selected the left face-orb board. Packed the eight existing 288-pixel face portraits and integrated a 52-CSS-pixel left orb, circular charge and 12-second expressive body windows. A valid timed Ward spends the existing Vault charge once; Invasion retains centre-return Titan. Paddle and Kit pointer IDs are independent.
  - Added the simple streaming top-tunnel entrance, masked hidden tail, real hit-triggered fury and variable spray, protected cage scope, real partition melt/collapse and actual guarded survival. A first eligible earned-full-charge warning pauses the world for a contextual tap lesson; only Kit's presentation clock advances, and the real charged cast resumes play/persists acknowledgement.
  - Independent checks found and fixed post-loss venom melting and held intro-skip release launching the serve. Tested build: `3A6B8A8C5368364AFCFCE6BBF7B1994D4598C121C90B45B72FE5BD7E45285EC1`, 2225.7 KB; all 21 unit tests pass.
  - **Final phone checks:** `out/kit-orb-final-qa/report.json` covers both levels, eight real face/body crops, touch/Focus, two-finger Kit/paddle ownership, charge preservation, Invasion Titan, presence expiry, loss/continue and seeded completion. Independent corner/cancel/out-and-back/ward-feedback checks pass in `out/kit-orb-independent/report.json`. Native venom checks in `out/venom-coach-final/report.json` cover ten full/empty/missed/late/drag outcomes, hidden/body/FIRE contacts, cage frame/18 bars, zero opening rage, terminal immutability, held pointer/Space skip and the first-use coach (five seconds frozen world, live Kit clock, real tap/resume/acknowledgement). Layout and iOS/Android polish regressions pass with no page errors. The exact build hash is unchanged after these runs.
  - **Recovery and difficulty:** the six baseline bots all lost after Vault charge became defensive. Broader aiming found a real iOS rescue at 30.04 seconds. A strategic Android run at 43.8167 seconds broke 121 bricks, used ten legally replenished Focus catches and collected SPLIT/FIRE/LASER/WIDE/SHIELD/SLOW, without grid/life/charge cheats. Its decisions are in `out/vault-strategic-android/report.json`. These prove recoverability, not tuned human difficulty; physical phones/Safari remain unchecked. Do not reuse the old three-win/three-loss result for these rules.
  - **Review media:** `out/final-review/phone-review.png` compares actual iPhone serve/tunnel and Android guarded impact; `out/kit-ability/kit-ward-motion.gif` shows actual channel, short Cheer/live response and return to face after 12 seconds. The animation uses an explicitly staged charged/two-hit fixture, not an unseeded earned run. A localhost copy of the exact build is `out/venom-prototype/game.html`.
  - **Brum selected:** new cast anatomy boards are `img/cast-v2-anatomy-a.png` and `img/cast-v2-anatomy-b.png`, documented in `03-cast-restart.md`. Mosskeeper has short root-feet, Vesper four paws/tail, Rook wings/fan tail and Latch fins/tail/jaw; Fen/Brum retain justified long arms. The owner selected **Brum** for the first actual model/expression/motion proof. Keep the verified Yeti rig/anatomy, prove continuous face and distinct neutral/welcome/protective states plus actual motion at native size before a full family. No new encounter or completed cast set is implied.
  - Commit/push still wait for the owner's OK after final screenshots. No later story/progression system is silently included.

- **2026-10-18 (Kit ward / variable venom direction; prototype only).**
  - The owner gave Kit a concrete defensive purpose: when his shield bar is full, he can empower threatened partition bricks so venom cannot open a shortcut to the cage. Prepare a first-use player demonstration showing charge, warning, shield cast and the defended outcome; show an empty-charge or missed-defence outcome too.
  - The latest layout request supersedes the standing-body/bar study too: show Kit's face inside a circular charge orb at the bottom left or right. On becoming powered, show his fullbody and real expressions/motion for about 10–15 seconds; the prototype starts at 12 seconds. He channels shield power on a valid charged tap, then braces/reacts and recedes. If the fullbody has receded before a later cast, it can appear for that cast; do not refresh the display every frame or consume an unused charge when he recedes. The display duration does not extend the ward beyond its volley. Use a shorter display only if the longer one obstructs play. The orb is the deliberate minimum-52-CSS-pixel control; there is no permanent fullbody avatar, horizontal charge bar or redundant centre button. Compare left/right placement with the same timed ward. Keep the central thumb-drag lane, lives/AIM and safe inset clear. Win/loss menu expressions are also desired in later result-screen work. Automatic defence remains only an unselected alternative.
  - This supersedes the earlier offensive powered-return versus aimed-attack comparison as the current design focus. Start the proposal from the existing 12-brick charge, with one visible resource; explicitly resolve its relationship to Titan rather than silently adding a second meter or free double spending. The proposed Vault charge serves the ward, while Invasion retains Titan. No permanent hero-level system is approved by this brainstorm.
  - The owner rejected the straight-line venom presentation. Use a changing directional spray with irregular strands, droplets, spread and impact splashes. The effect must still identify the threatened stone and leave the ball readable. Stronger appearance does not establish safe route balance.
  - The serpent must visibly crawl from a simple top tunnel, head facing down as it emerges, before following its normal route. Do not add an entrance meter or reconstruct the level for this. Do not open with a pre-filled static coil or venom attack. Venom requires two separate actual player-ball impacts after entry. Earlier effect boards used a staged two-hit setup near the top; they were not a proposed opening attack and are superseded by the combined entrance/ward demo. Verify continuous entry and body occupancy in the isolated proof.
  - These are isolated design/demo changes. The tested main build still has reaction-only Kit, the original Titan core and no venom or ward mechanic. New image/rule picks precede production; commit and push still require the owner's screenshot OK.
  - **Cast anatomy correction:** after seeing the source-backed Castle Oddities / Starbound Runaways boards, the owner objected that nearly every creature inherited the same long arms. Long arms make sense for Brum/Yeti and Fen/woodland courier; this is not a production selection. Redesign the others around distinct anatomy, tails/wings/root structures, motion and powers instead of the shared Big biped template. Those boards need revision before a new cast pick. Keep sources feasible without making source convenience the design.

- **2026-10-18 (finished Kit/mixed Vault; cast rejected; venom proposed; uncommitted).**
  - **Kit:** completed selected Knight 2/B with 100 real rig frames across eight expressions, continuous face, open helmet and hand-mounted medieval shield. Finished turnaround, eight face portraits, contact sheet, animated preview, source and manifest are under `assets/kit/`, `art/kit.py` and `design/phase1/01-kit-character.md`. Integrated the native-size hero above the control grip with reactions to serve/Focus/combo/loss/danger/win/hit/titan. Source and native/motion proofs passed independent review.
  - **Mixed Vault:** 219 brick objects / 245 HP / 19 deliberate power targets; defended aiming-side changes and two optional eight-brick hanging caches. Jade serpent starts at 12 cells, grows to 20 and takes an initial 39-step path. Its actual idle attack/loss times are 54.292/58.975 s. FIRE/TITAN pierce breakables but bounce from declared granite/bars; solid-corner handling and aim flags were corrected without changing Invasion armour piercing.
  - **Final verification:** build and all ten unit tests pass. Both phone sizes passed Kit touch/control/reaction checks (46 captures, all eight animated rows, no overlaps/errors) and the mixed Vault suite (six complete seeded rallies: three earned wins, three serpent losses; both caches, power combinations, no initial unsupported bricks/free breach, valid path, intro and settled-star result captures). Reports: `out/kit-final-qa/` and `out/vault-final-qa/`. Tested build SHA256: `00A6756BDF0A3B8D0EE61AD6EC00ED6A5D3DE2D0A23A2383B9FA173634301BDB`. Chromium phone emulation does not establish physical-device/Safari feel or human difficulty balance.
  - **Existing regression suites:** `layout.mjs` and both iOS/Android `polish.mjs` runs also pass against the same frozen build with no page errors; captures are in `out/final-layout/`, `out/final-polish-ios/` and `out/final-polish-android/`.
  - **Creature rejection:** the owner rejected the six Ember/Mortar/Polaris source proof images, especially the last pair, and requested the entire set be scratched and redesigned. No full batch shipped. Their source/assets/preview harness are removed from active paths and preserved in ignored `out/rejected-cast-20261018/`; `02-menagerie-cast.md` is withdrawn history. Knight 2 was outside this rejection. Prepare two genuinely new source-feasible cast directions in `03-cast-restart.md`; wait for a new image pick before production.
  - **Venom proposal:** the owner suggested two ball hits provoke a furious serpent into melting black partitions with venom breath. Prepare two isolated effect options with real jade art/crumble reuse. Proposed safeguards: distinct impacts, visible wind-up, one exposed partition target, protected cage frame/bars, recovery/cooldown and measured route/collapse changes. No venom/rage mechanic is in the tested build; image/rule choice comes first.
  - **Kit gameplay-purpose question:** the owner asked why Kit is standing in the UI and proposed earning power/levels through brick hits, then launching an attack or boosting the ball. Current Kit is only a reaction avatar; his special ability is not implemented. Prepare two concrete ability previews: reuse the existing charge/Titan cycle as a visible Shield Slam on a clean return, or spend earned charge with a deliberate aimed special. Make cause/effect, input, animation, snake impact and venom-rage interaction explicit. Do not add XP/store/chapter systems from this brainstorm without a separate decision.
  - **Gates:** no commit or push has occurred. Await the owner's OK for the finished Kit/mixed-level screenshots. New cast, venom and Kit-ability options need their own picks; later story tasks remain pending.

- **2026-10-18 (Knight 2 selected; level challenge and cast expansion; uncommitted).**
  - Build replacement Knight 2/B with a continuous expressive face, open helmet, cobalt armour/cape and a broad medieval shield with a rear grip. The owner explicitly wants a polished finished asset and real animation. First inspect actual Blender proofs beside Lumi, then finish the eight clip families and phone-size integration. No replacement render is approved merely by matching its concept image.
  - The owner initially picked level A, then explicitly rejected its direct rescue route. That pick is revoked; do not integrate the old Open Gate maps. Level 2 must progress beyond Level 1: more bricks, tougher non-direct gates, angled shots, deliberate power-up bricks, a differently coloured longer serpent and a longer measured serpent path. Present two revised image options before integrating a layout. Challenge must come from readable choices, rewards and timing, not just extra HP.
  - The owner also authorized a broader castle/space cast so later levels do not repeat Lumi and Gnash as their entire premise. Two image families were presented in `design/phase1/02-menagerie-cast.md`; **B/Castle to Cosmos was selected**: Ember, the brick golem and the magnetic manta. Build those expressive, animated asset families in parallel with Kit. The alternative space wardens remain unselected references. New asset production does not approve every later chapter system or enemy mechanic.
  - Parallel ownership: character production, revised level options, and new cast concepts. The lead integrates the selected Kit and reviews proofs. All commits/pushes still wait for the owner's OK after screenshots.
  - Two revised level boards were shown: V2-A/Bastion Switchback and V2-B/Twin Keeps. The owner selected **a mix of both**. Build A's defended turns and long jade-serpent detour with B's optional flank and hanging reward cache. Both shown options explicitly included granite/cage blocking FIRE and TITAN while breakable bricks still pierce; implement that declared per-grid rule and preserve it in the aim predictor. Re-measure the combined map rather than borrowing the separate proposals' balance results.
  - Knight source proofs now pass continuous plain-skin cheek/jaw, open helmet, distinct expressions, shield grip/face clearance during sampled Cheer/Hurt/Focus motion, and native scale beside Lumi. The full animation batch is in progress. This is internal source QA; final phone screenshots still require the owner's review.

- **2026-10-18 (design restart and parallel level design; uncommitted).**
  - The owner initially selected the teal courtyard concept, then rejected its Blender implementation: unreadable expressions, malformed hair, a face that looked patched on, and a prop resembling a table-tennis bat. That selection is revoked. The replacement direction is a knight with a proper medieval shield.
  - Removed the rejected character, shared-face refactoring, runtime integration and related tests from the active tree. The discarded work is preserved only in ignored `out/rejected-kit-20261018/`. The original game rebuilds and all five original tests pass. Setup fixes remain. No commits or pushes were made.
  - The owner explicitly requested parallel work: separate character-concept, level-design and independent-reference-review tracks. Prepare image options for both existing levels while character work proceeds; keep each track's files separate. This supersedes the earlier restriction on preparing only one task at a time.
  - **Gates:** show 2–3 image options for each design track and wait for the owner's pick before production changes. Playtest implemented changes at both phone sizes and show screenshots. Commit and push only after the owner's OK.
  - **Quality target:** follow the existing Lumi, serpent and robot art: coherent silhouette, uninterrupted facial surface, large readable eye/lid/brow/mouth changes, consistent light and stable animation anchors. Concept polish alone does not prove a Blender implementation is ready.
  - **Replacement character options:** `design/phase1/01-kit-character.md` and `img/01-kit-v2-1.png` through `01-kit-v2-3.png`. The new options are 1/A teal bareheaded, 2/B cobalt open helmet, and 3/C indigo wayfarer. Recommend 2/B for its clear laugh/worry contrast and credible Knight source mesh. No replacement is selected. First prove the selected face, shield grip, proportions and real animation beside Lumi before the full render batch; review criteria are in `design/phase1/00-quality-target.md`.
  - **Level options:** `design/phase1/level-layout-options.md` and `img/level-layout-a.png`, `img/level-layout-b.png`. A/Open Gate gives a clear opening target and central rescue shaft; B/Twin Fronts rewards angled shots into two flanks. Both are isolated candidate renders using the existing game art; active gameplay sources are unchanged. Recommend A for the first playtest.
  - **Level preflight:** iPhone 393 × 852 and Android 412 × 915 captures use the required fonts and safe insets. Cage preservation, no initial breach, supported starting bricks, legal march bounds and five serve contacts per level/device passed. An untouched serpent attacks at about 25.2 s; a four-hit possible rescue route proves reachability only. Sustained rallies, power-up outcomes and difficulty balance remain unvalidated. These are layout proposals, not completed production playtests.
  - **Next at that checkpoint:** wait for replacement picks. Superseded by the newer entry: Knight 2/B selected; direct-rescue A rejected; harder levels and broader cast requested. Nothing has been committed or pushed.

- **2026-10-18 (local setup and Phase 1, Task 1 concepts; uncommitted).**
  - Re-cloned the latest repo into `C:\Users\mahik\Music\Breach\breaker`; the initial checkout is preserved as `breaker-initial-clone`. Set the required commit identity and created `codex/phase1-kit`.
  - Installed Node 22.23.3 and Python 3.11.16 with owner approval. bpy 5.2.2 actually requires Python 3.13, so art uses a separate environment based on the existing Blender 5.2.2 / Python 3.13.13 installation. Corrected the incompatible setup instructions; local activation commands are in doc 03.
  - Rendered `python3 art/princess.py out/test Idle:1` successfully. Made the output path absolute because Blender resolved the relative render path outside the checkout on Windows. Verified the 168 × 168 RGBA image, stripped its PNG metadata, and made `out/test/princess-preview.png` for review.
  - `npm run build` and all five unit tests pass with Node 22. Baseline `layout.mjs` plus `polish.mjs` at iPhone 393 × 852 and Android 412 × 915 report no errors; screenshots are in `out/baseline/`. Planck's Node >=24 engine warning remains documented in doc 03.
  - The first character concepts and rejected build are archived under ignored `out/rejected-kit-20261018/`; they are not approved assets.
  - **Next:** follow the restart entry above. Review replacement knight and level-layout images, then build only the selected options.

- **2026-10-18 (round 3, merged to `main`).** Owner feedback: remove distractions so the focus is the snake, the princess, the gameplay and the power-ups.
  - **Removed:** torchlight, dust motes, the window bars across Saturn, and the WIDE/TINY HUD chips.
  - **Serpent meter:** a colour-only bar running green → amber → red, with no "% away".
  - **Serpent behaviour:**
    - it grows longer and thicker as it eats, and a swallow bulge travels down its body;
    - it starts sluggish and speeds up (`speedK` in `updateSnake`);
    - bites lunge harder and throw more chips.
  - **Camera:** it pushes in as danger rises (anchored on the paddle line), then zooms to 1.55× on the cage during the attack.
  - **Cage:** a dark stone cell with a cool light on the princess, and a rendered dark-iron `bars.png` (code fallback in `drawBars`).
  - **Full screen:** the canvas covers the whole phone screen, and the edges mirror out (`fillMargins`). The menu has a Full screen button where the browser supports it.
  - **Art v3:** glazed bricks, the new caps and titan ball, a torch-free Vault plate, a calmer Invasion plate, princess `Nervous`/`Panic`, serpent `snarl`/`strike`.
  - **PNG metadata:** Blender writes the .blend path, which contains the home folder name, into PNG metadata. Strip it before committing; see the snippet in doc 02.

- **2026-10-18 (edge-to-edge):** owner asked for a true full-screen layout with no dead band at the top. A dimmer Saturn followed: "the background must not outshine the foreground". They also wanted to actually see WIDE in play.
  - `main.js` `LIFT = 34`: each level is built `H + LIFT` tall, drawn shifted up by `LIFT`, and its pointer y is offset by `LIFT`.
  - The levels draw their top HUD at `this.hudY`. The deck fills into the home-indicator strip via `this.inB`.
  - Invasion `calm()` darkens and desaturates the plate further, and sinks the planet with a radial shade.
  - WIDE leads both drop tables.
  - Layout check: `node tools/playtest/layout.mjs <out>`.

- **2026-10-18 (ChatGPT split):** the owner approved Phase 1 with the recommended defaults. Design work (story scripts, character design, concept art, UI specs) moves to the owner's ChatGPT Pro project; Claude keeps execution.
  - The brief is `docs/handoff/04-chatgpt-design-brief.md`. The owner's steering prompts (ChatGPT project instructions, task prompts, corrections, checklists) are in `docs/handoff/05-chatgpt-steering-prompts.md`. Every art script, in full, is in `docs/BREACH-blender-scripts.md`.
  - The single file to upload to ChatGPT is `docs/BREACH-ChatGPT-handoff.md`: the brief, story plan, game plan, docs 01–03 and a file map. Rebuild it after editing any of those docs: `python3 tools/make_handoff.py`.
  - ChatGPT returns `design/phase1/*.md` and images. To save Claude usage, the owner may have **Codex** build them, guided by `AGENTS.md` at the repo root. Claude is then used only for reviews. Whoever builds pulls `main` first; only one builder works at a time.

- **2026-10-18 (story plan):** owner asked for a dedicated story mode, a prince, locked weapons, a store with skins, and more power-ups (multi-ball multiplier, paddle bullets), backed by research into addictive games.
  - Plan drafted, not built: `docs/STORY_PLAN.md` (live, editable copy: https://claude.ai/code/artifact/5278a4c8-b669-4235-972f-7814c32382d9; also `/mnt/project-files/breaker/plan/STORY_PLAN.md`).
  - Core idea: bricks are alive with light and Princess Lumi is the light; Zorvax the Curator holds her in the Menagerie space prison; Prince Kit is the underdog hero; score becomes Shine, which rebuilds Brickhaven.
  - Waiting on the owner's four decisions at the end of the plan (names, Kit's look, start Phase 1, business model). Nothing in section 9 is built until the owner approves.

- **2026-10-18 (later):** TODO items 1–7 in section 8 are implemented on `wip/polish-pass`:
  - level wiring, crumble vs. big crash, difficulty, continue screen, ferocious serpent with bite marks and the cage attack, nervous and panicking princess, and the Invasion calm-down with its landing beat.
  - Draft screens are in `/mnt/project-files/breaker/playtest/v3/`. Re-shoot them with `node tools/playtest/polish.mjs <out> ios|android`.
  - **Still open:** item 8 (shinier bricks, new capsules, titan ball, princess `Nervous`/`Panic` frames, serpent `snarl`/`strike` faces, all being rendered); then item 9 (playtest Android, tune difficulty) and item 10 (merge to `main`).

---

## 1. Rules from the owner (non-negotiable)

- **Repo:** https://github.com/mahikshith/breaker. `main` holds the last stable build. In-progress work is on `wip/polish-pass`.
- **Commit identity:** every commit must be authored and committed as `mahikshith <mahikshith97@gmail.com>`. The repo-local config sets this: `git config user.name mahikshith; git config user.email mahikshith97@gmail.com`.
- **No AI attribution anywhere.** That means:
  - no "Co-Authored-By" lines;
  - no session links;
  - no "Generated with …" in commits, code comments, README or docs.
- **Never ask for or paste the owner's GitHub token.**
- **Show the owner screen drafts and character sheets during playtests.** They want to see shots for iOS and Android sizes.
- **Quality bar:** the owner (mykee) wants a premium, inventive, addictive iOS/Android game, and nothing that looks "vibe-coded".
  - Favourite references: BALL x PIT, and Arkanoid crossed with Space Invaders.
  - Rejected in the past: pixel art, wisps, jittery foxes, ball-chain snake bodies, rounded blob heads, and uniform faces. Expressions must "say a lot".
- **Scope right now:** approved Phase 1 of `docs/STORY_PLAN.md`, finished Knight 2/B and mixed Vault review, replacement cast concepts after the rejected set, and isolated venom-effect and Kit-ability proposals. Independent work may run in parallel; concept-pick and post-playtest approval gates still apply. Later chapter systems still need their own implementation decision.

---

## 2. The game in one paragraph

BREACH is a brick breaker for phones in portrait. The world is 360 units wide, and the height adapts to the screen.

You drag your thumb to move a chrome paddle and bounce a chrome ball. The game has two levels:

1. **Invasion.** A marching Space-Invaders-style formation of glossy candy bricks and toy robots steps down toward you, and the robots fire bolts. If the formation reaches the hazard line, you lose. Clear the formation and a mothership boss arrives.
2. **The Vault.** This is a side-view cutaway of a castle tower. A princess is caged near the top, and a purple serpent chews its way through bricks toward her along a Dijkstra path. You break a path up to the cage to free her. That triggers BREACH: she runs out and a FRENZY multiball round plays as the win lap. If the serpent reaches her, you lose.

There is also a **Focus aim** mechanic. Hold your thumb still while a ball lands and the paddle catches it. Time slows to 0.25×, you slide to aim with a predicted path, and you lift to fire. This costs an AIM pip; pips refill as you break bricks.

---

## 3. Tech stack and how to run

- **Code:** plain JavaScript ES modules with Canvas 2D. There is no framework.
- **Physics:** custom deterministic circle-vs-grid physics for the balls (`src/physics.js`), plus **planck.js** (Box2D) for brick debris (`src/debris.js`).
- **Build:** esbuild bundles everything into one self-contained HTML file.
  - `npm install`, then `npm run build`, produces:
    - `dist/breach.html`, the standalone page;
    - `dist/breach-artifact.html`, a body fragment for hosts that supply their own `<head>`.
  - The build is about 1.2 MB because every rendered image is inlined as a WebP data URI in `src/vault-art.js`.
- **Run locally:** open `dist/breach.html`, or serve the repo root and open `index.html`, which loads `src/main.js` as a module.
- **URL params:**
  - `?level=1` or `?level=2` jumps straight into a level;
  - `?safe=top,bottom` fakes notch and home-indicator insets in CSS px. iPhone 15 is `?safe=59,34`, a typical Android is `?safe=32,24`.
- **Test hook:** `window.__breach` exposes `{ start(i), level, scene }` for automated playtests with Playwright and Chromium.
- **Unit tests:** `npm test` runs `tests/physics.test.js`.
- **Fixed timestep:** 1/120 s (`STEP` in `main.js`).
- **Fonts:** Google Fonts **Lilita One** for game text and **Rubik 600** for numbers, loaded in `index.html`.

### Art pipeline (Blender, optional to re-run)

All art is pre-rendered in Blender (bpy 5.2.2 from pip, Cycles on CPU, view transform AgX "Medium High Contrast").

- Light comes from a key area light at the **top-left**, and shadows fall down-right everywhere. Code-drawn shadows match: offset +3, +5.
- Scripts live in `art/`:
  - `render_vault_assets.py` and `vault_post.py` render the Vault plate, bars, bricks, ball, paddle, capsules, lantern and torch flame into `assets/vault/` plus `atlas.json`.
  - `render_invasion_assets.py` and `invasion_post.py` render the Invasion hangar plate, bricks, robots (7 expressions × 4 colours), mothership (5 expressions plus a light overlay), bolt and bomb into `assets/invasion/`.
  - `princess.py` restyles the KayKit Rogue model (`assets/models/kk_Rogue.glb`, CC0) into the princess: tiara, expressive eye rig, bell skirt. It renders animation frames to `assets/princess/<Anim>_NN.png`. The `--face` option renders face close-ups.
  - `snake.py` renders the serpent's angular head. It has an `EXPR` dict of expressions (lids, brows, slit pupils, jaw, tongue, fangs) and two facings, `r` and `l`. Output goes to `assets/snake/head_<expr>_<r|l>.png` and `meta.json`.
- `tools/pack_art.py` packs everything into `src/vault-art.js` (`export const ART = {...}`). Re-run it after any render, then `npm run build`.
- **Sprite convention:**
  - sprites are 3 px per game unit, with a margin (usually 4 units) around the footprint;
  - plates are 2 px per unit and cover screen y from -40 to 780, drawn at (0, -40) with size 360 × 820.
- **Runtime registry:** `SPR` in `src/gfx.js`. Vault and shared sprites are keyed by file name (`ball`, `paddle_l`, `cap_split`, `brick_t_2_0`…). Invasion sprites are prefixed `inv_`. `ready(spr)` checks that an image has decoded.
- **Fallbacks:** every sprite has a code-drawn fallback, so the game runs without art.

---

## 4. Look and feel (keep this)

- **Style:** glossy "vinyl toy" pieces with real light, deep shadows, and saturated but not neon colours. Bricks should read like **glazed ceramic tiles**. See `docs/reference/vault-top-down.png`, the look the owner called "even shinier" and wants matched.
- **Not too much yellow.** Gold and yellow are accents only.
- **Ball:** chrome, a 12-unit ball drawn from a 20-unit sprite. The fire variant is molten orange. The titan variant (new) is dark gunmetal with magenta and cyan energy, plus a code-drawn pulsing halo.
- **Paddle:** chrome capsule made of three sprites (`paddle_l`, `paddle_m` stretched, `paddle_r`).
- **Fonts:**
  - Lilita One for all game text, always drawn with a dark outline and drop shadow via `text()` in `gfx.js`;
  - Rubik for the score.

### Palette

| Use | Colours |
|---|---|
| Vault bricks | sun `#ffc73d`, coral `#ff6f61`, violet `#8f5cf0`, teal `#22c4b0`, blue `#4f9dff`, gold `#f4c542` (gem bricks), granite `#4a4f6e` (indestructible) |
| Invasion rows, top to bottom | `#ff5d8f`, `#ff8a3d`, `#ffd23f`, `#5ccf6a`, `#2ec4b6`, `#3fa8f5`, `#7b6cf6`, `#c46bf0`, `#ff5d8f`; armour `#8d97b3`; power brick `#f4c542` |
| Level accents | Invasion pink `#ff5d8f`, Vault gold `#f4c542` |
| AIM / Focus UI | lilac `#e3b6ff` / `#c46bf0` |
| Combo text | `#ffd36b` |
| Danger | `#ff4d5e` |
| Success | `#7bd88f` / `#7bf2c8` |
| Menu background | gradient `#22284a` → `#141831` → `#0a0c18`, with a vignette and film grain |
| Serpent body | purple `#7a3ccc`, peach belly `#ffc49a`, rose diamonds `#ff6fae`, outline `#1e0a40` |
| Power-ups | ×3 split `#5ccf6a`, FIRE `#ff8a3d`, WIDE `#3fa8f5`, AIM `#c46bf0`, +3 `#f7c948`; new: LASER `#ff4d6d`, SHIELD `#2ec4b6`, SLOW `#7fd6ff`, TINY `#5a5f78` (a bad power-up) |

### Mobile UI/UX rules already applied

- **Safe areas:** the notch and home indicator are respected. The scene extends under them through `level.drawTopInset()`.
- **Pause:** top-left with a 44 pt touch target, away from the steering thumb.
- **Steering:** relative thumb drag anywhere on screen. The finger never covers the ball.
- **HUD:**
  - level meter top-left ("SERPENT x% away" or "FORMATION n left");
  - score top-right;
  - lives (small chrome balls) and AIM pips at the bottom.
- **Feedback:** haptics through `navigator.vibrate` on big hits, hit-stop, screen shake (trauma model), and pentatonic hit sounds that rise with the combo. All sound is synthesised in `src/audio.js`.

Reference screenshots of the current `main` build are in `docs/reference/`:

- `vault-v2-android.png`
- `invasion-v2-android.png`
- `snake-v2-sheet.png`
- `robot-expressions-ingame.png`

---

## 5. Code map

| File | What it does |
|---|---|
| `src/main.js` | Canvas sizing and safe insets, input mapping, the fixed-step loop, scenes (menu with level cards and live previews; level; results with stars). `LEVELS` registry. `best` stars kept in localStorage. |
| `src/arena.js` | **Base class shared by both levels:** paddle, balls, serve and Focus aim, power-ups, lives, combo, score, shake, HUD base, aim-path preview. Levels extend `Arena` and override `hitCell`, `updateLevel`, `draw`, `background`, `result`… |
| `src/physics.js` | Ball stepping with substeps, grid collision with ghost-edge fix, paddle bounce (offset angle up to ±62° plus swipe spin), minimum vertical speed. |
| `src/debris.js` | planck world. It has five behaviours: |
| | • `shatter()`: Voronoi fragments from the brick image; |
| | • `drop()`: a whole brick falls as a rigid body and shatters on impact; |
| | • a kinematic paddle that debris can bonk; |
| | • `poke()`, which lets balls shove debris; |
| | • **new `crumble()`**: non-physics fragments that shrink and fade in about 0.4 s. |
| `src/gfx.js` | Sprite registry `SPR`, `cached()` offscreen canvases, the `brick()` fallback, `drawBall`, the `FX` particle system (shards, dust, rings, score pops), `text()`, `POWER` table, `capsule()` fallback. |
| `src/invasion.js` | Level 1 (details in section 6). |
| `src/vault.js` | Level 2 (details in section 6). |
| `src/characters.js` | Old code-drawn character fallbacks (invader, mothership, serpent). |
| `src/audio.js` | WebAudio synth SFX (`sfx.hit/tough/paddle/wall/power/lose/zap/hurt/boom/breach/beat/chew/win`). |
| `src/vault-art.js` | **Generated** by `tools/pack_art.py`. Never edit by hand. |
| `src/prefs.js` | **New.** A `store.get/set` wrapper over localStorage. |
| `src/monetize.js` | **New.** Continue-offer placeholders (section 8). |

---

## 6. Level details (as on `main`)

### The Vault (`src/vault.js`)

- **Grid:** 20 × 20 cells of 16 units, origin (20, 96). Bricks are 2 cells wide in running bond. `LAYOUT` is an ASCII map:
  - `t` teal, `v` violet, `c` coral, `y` sun, `b` blue — glazed bricks;
  - `g` gold gem brick, which drops a power-up;
  - `#` granite;
  - `=` cage bars.
- **Cage (`POCKET`):** columns 7–12, rows 3–5. Bars are solid to the ball but open to the serpent.
- **Serpent:**
  - It plans a Dijkstra route to the cage, where each brick costs chewing seconds (`CHEW`).
  - Its body is a list of cells. It is drawn as a tapered Catmull-Rom ribbon in canvas, with the rendered head sprite on top.
  - `expression()` picks the face: mood timers first (ouch, hiss, shock), then dizzy, grin, chew, blink, taste, hunt or idle.
- **Ball vs serpent:**
  - hitting the head stuns it and knocks it back one cell; three quick hits knock it back four;
  - hitting the body costs it chewing progress;
  - a falling brick that lands on it crushes it: stun plus knockback.
- **Collapse rule:** bricks that lose their connection to granite, the side columns or the top row fall as planck rigid bodies (`collapse()`). Debris that hits the paddle stuns it ("BONK").
- **Breach:** when a flood fill from the cage reaches the bottom row, `checkBreach()` bursts the cage. The princess runs down the path (`Running_A`), then FRENZY runs for 7 s with 12 balls and permanent fire, then the level is won.
- **Princess:** a sprite sheet with these animations:

  | Animation | Frames |
  |---|---|
  | Idle | 16 |
  | Interact | 12 |
  | Blocking | 8 |
  | Cheer | 16 |
  | Running_A | 12 |
  | Jump_Full_Short | 14 |
  | Scared | 8 |

  She plays at 14 fps, with speech bubbles ("Help!", "Hurry!", "Eek!", "Yay!").
- **Intro camera:** about 3.4 s. It starts on the princess, pans to the serpent's lair, then pulls back. Tap to skip.
- **Stars:**
  - 1 for the rescue;
  - +1 if the serpent never got halfway (`peakDanger < 0.5`);
  - +1 if the score is over 10 000.

### Invasion (`src/invasion.js`)

- **Grid:** 11 × 9 cells of 28 × 18 units, starting at y = 92.
- **Cell types:**

  | Type | Hit points | Notes |
  |---|---|---|
  | CANDY | 1 | |
  | ARMOR | 3 | |
  | POWERB | 1 | always drops a power-up |
  | BOT | 2 | a robot; 20% chance to drop a power-up |
- **March:** the formation steps sideways ±14 units, then drops 14. The step interval shrinks as fewer cells remain. `dangerY = paddle.y - 64` is the hazard line.
- **Robot shots:** the robot lowest in a column scowls (`angry`) for 0.45 s, then fires a bolt. A bolt stuns the paddle; then the shooter and about 35% of the robots laugh, and the boss looks smug. Balls can knock bolts out of the air.
- **Robot faces:** the `march0/1` cycle, `hurt` at 1 hp, `shock` when a ball is about to hit, `dizzy` when killed. A killed robot falls as a rigid body; catching it on the paddle gives +120 "CATCH!".
- **Mothership:** 30 HP, an elliptical hitbox. It drops bombs, and its expressions are smug, angry, hurt, panic and dizzy. Killing it drops the wreck.
- **Stars:** depend on lives left and best combo.

---

## 7. Work in progress on `wip/polish-pass` (what this branch already changes)

The owner's latest feedback, which is the current task list, is reproduced in section 8. The branch already contains the following.

### `src/arena.js` (rewritten; levels still need wiring)

- **Raised paddle.** `paddleY(H, minY)` puts it at `H - clamp(H*0.25, 150, 210)`, well above the thumb.
  - Below it is a **control deck** (`drawDeck(g)`): a dark panel, a grooved track with a grip that follows the paddle, and "Drag anywhere down here to move" for the first seconds.
  - `deckY = paddle.y + 34`, `shieldY = paddle.y + 28`, `drainY = paddle.y + 46`. The ball is lost at `drainY`, not at the screen bottom.
- **Smoother, snappier controls.**
  - The paddle maps 1:1.15 to thumb travel from where the press started.
  - It re-anchors when pinned against a wall, so it reverses instantly.
  - Smoothing went from rate 22 to rate 45.
- **Harder base game.**
  - Ball speed went from 330 to 345, scaled by `opt.speed` per level.
  - A rally ramp adds 1.2% per paddle hit, up to 1.28×.
- **Titan sweet spot.**
  - A diamond "core" gem sits in the centre of the paddle and fills as bricks break (`CORE_BRICKS = 12`).
  - When it is full it blazes. A ball hitting within ±7 units of the centre becomes a **TITAN**: radius 10, ploughs through bricks like fire, lasts 7 s.
  - Pops say "CORE READY · hit it dead centre" (for the first 3 times) and "TITAN!".
- **New power-ups:**
  - **LASER:** twin emitters on the paddle auto-fire every 0.3 s for 7 s. Shots call `hitCell`, and a level can consume them via `shotHit(shot)`, for example for the boss or the serpent.
  - **SHIELD:** a teal energy barrier under the paddle that saves 2 balls, or lasts 16 s.
  - **SLOW:** balls move at 0.68× for 8 s.
  - **TINY:** a bad power-up. The paddle shrinks to 0.62× for 9 s, and the capsule has a flashing red outline.
- **HUD chips:** active power timers show as small chips next to the lives.
- **Aim teaching** (the owner asked how aim works):
  - "CATCH READY" brackets appear over the paddle while the thumb is held still and a pip is available.
  - A coach bubble, "HOLD STILL as it lands to catch & aim", shows when a ball is falling toward the paddle. It stops after the player has used Focus 3 times (`store aimCoach`).
  - During aim: "Slide to aim · lift to fire". During serve: "Slide to aim · lift to launch".
- **Big crashes only.** `bigCrash(ball)` returns true when 4 or more bricks broke within 0.3 s, or the ball is fire or titan. Levels should use `debris.shatter` (physics) only then, and `debris.crumble` (subtle fade) for single bricks. This was requested because falling fragments were being mistaken for the ball.
- **`continueRun()`** puts the level back into play after a continue: at least 1 life, a fresh serve, a 2-hit shield for 10 s, and "BACK IN!".

### Other files

- **`src/debris.js`:**
  - `crumble(art, x, y, w, h, vx, vy, n)` creates a short-lived fade with a white flash;
  - new constructor option `killY` removes physics pieces that fall past the paddle into the deck.
- **`src/physics.js`:** `b.titan > 0` pierces like fire.
- **`src/gfx.js`:** titan ball drawing with halo; `POWER` entries for laser, shield, slow and shrink (`bad: true`).
- **`src/prefs.js`, `src/monetize.js`:** new (section 8).

### Art that was being rendered (may or may not be in the branch)

Two Blender jobs were running when the session ended. They write into `assets/` and re-run `tools/pack_art.py`:

1. **Shinier bricks** for both levels to match `docs/reference/vault-top-down.png`, with the same file names, sizes and atlas entries. Also new capsules `cap_laser`, `cap_shield`, `cap_slow` and `cap_shrink`, and a `ball_titan` sprite. Script edits are in progress in `art/render_vault_assets.py`.
2. **Characters:**
   - princess animations **`Nervous`** (worried walk, about 12 frames) and **`Panic`** (terrified run, about 12 frames), in profile facing like `Running_A`, added to the pack list;
   - serpent expressions **`snarl`** (fangs bared, low brows, narrowed eyes; the hunting face) and **`strike`** (jaw wide, fangs, furious wide eyes; for lunges and bites), in both facings, in `meta.json`.
   - Script edits are in progress in `art/princess.py`.

If those sprites are missing, the code must fall back gracefully:

- missing `cap_*` sprites already fall back to the code `capsule()`;
- a missing `ball_titan` falls back to the fire sprite;
- for the princess, check `PRINCESS.anims.Nervous` and fall back to `Running_A` at a slower frame rate;
- for the serpent, check `SNAKE.expr.snarl` and fall back to `hunt`.

---

## 8. Remaining work: the owner's latest feedback and the agreed design

Paraphrased owner feedback (2026-10-18):

> - Make the bricks shinier, like the Vault top-down render.
> - Add more powers, for example: hit a certain point and the ball becomes bigger and unstoppable.
> - Make it harder so players can actually die.
> - On losing, show a pop-up: watch an ad to continue, or pay to unlock the full game. (Maybe make the whole game free later.)
> - The paddle is too low and overlaps the thumb, and the controls feel sluggish.
> - Explain how aim works (does a long press trigger it?).
> - Single broken bricks should crack and subtly vanish. Only big crashes should drop debris, because falling pieces get confused with the ball.
> - The snake should be more ferocious, visibly bite through bricks with urgency, and have a dedicated animation when it reaches the cage (bite the cage, grab or take the princess).
> - The princess should walk nervously, and run in circles in panic, inside the cage as the snake nears.
> - Apply the same polish to Invasion.
> - Invasion's background is too flashy and distracting: the big planet, the neon, and the yellow-black hazard line and compartments at the bottom. Tone it down and make it darker, but keep the colours.
> - Later, not now: story mode, unlockables (princess, sword, prince), dragons and mythical beasts. Focus on one perfect level first.

### TODO, in order

#### 1. Wire both levels to the new arena

- **Constructors:** pass `minPaddleY`.
  - Vault: about `OY + 20*16 + 80 = 496`, so the paddle never sits on the tower.
  - Invasion: about 470.
- **Draw order:** call `this.drawDeck(g)` right after drawing the background, before the shake transform.
- **Debris:** create it with `floor: H + 200, killY: this.paddle.y + 70`, or similar, so nothing piles up in the deck.
- **Shots:** draw them. `drawBalls` already draws shots.
- **Vault `hintY`:** no longer used and can be removed.
- **Drop tables:** add the new kinds.
  - Vault `DROPS` example: `['split','fire','wide','focus','burst','laser','shield','slow','shrink']`.
  - Invasion: similar, with `laser` weighted a bit higher.

#### 2. Single brick versus big crash

- In `Vault.removeBrick(br, ball)` and `Invasion.hitCell`, use `this.bigCrash(ball) ? debris.shatter(...) : debris.crumble(...)`.
- Reduce the `fx.shatter` coloured shard counts for single breaks to 1–2.
- The Vault `collapse()` rigid-body drops stay as they are: that is the "major crash".

#### 3. Difficulty

**Vault:**
- Multiply `CHEW` by about 0.75 (2.8 → 2.1, 4.6 → 3.45).
- Make the serpent chew faster as danger rises: `need /= (1 + danger*0.5)`.
- Empty-cell travel goes from 0.42 to 0.32.

**Invasion:**
- March interval: `0.2 + 0.7*n/total`.
- Bolt interval: `0.9 + 1.4*n/total`.
- Bolt speed: 200.
- Boss HP: 36.
- In rage, the boss fires twin bolts.

**Both:** tune so a first-time player usually loses once or twice, and a skilled player can 3-star.

#### 4. Continue screen

Do this in `main.js`, with `src/monetize.js` already written.

- **When:** on `state === 'lost'`, if `continueOffer(used)` returns `'ad'` or `'free'`, show a **Continue?** card before the results.
- **Card content:**
  - the loss reason;
  - a 9-second countdown ring;
  - primary button "▶ Watch ad · Continue" (or "Continue" when unlocked or in free mode);
  - secondary button `Unlock full game · ${PRICE}`, hidden when `MODE === 'free'` or already unlocked;
  - a "No thanks" text link that goes to the results.
- **Watch ad:**
  - show a placeholder full-screen "Ad · 3…2…1" card while awaiting `watchAd()`;
  - then call `level.continueRun()`;
  - count `used++` per attempt and reset it in `start()`.
- **Unlock:** `buyFullGame()`, then continue.
- **Level-specific undo** goes in each level's `continueRun()`:
  - **Vault after the serpent reached her:** rebuild the BARS cells, set `cageGone = false`, `knockBack(6)`, stun 3 s, princess back to Idle, `phase = 'rescue'`.
  - **Invasion after the formation landed:** `grid.oy -= 42`; all robots look `shock`.
- **Swapping later:** keep all money logic inside `monetize.js`, so real ad and payment SDKs, or free mode, are a one-file change.

#### 5. Ferocious serpent (Vault)

- **Default face:** `snarl` when danger is over 0.15. Use `strike` on each bite.
- **Visible biting:** about 2.2 chomps per second. On each chomp:
  - the head lunges about 5 units toward the target cell (offset the head draw along `s.dir`);
  - the brick wobbles;
  - chips crumble off;
  - `sfx.chew()` plays louder;
  - bite-mark notches grow on the brick with chew progress, replacing the current thin crack lines in `drawChew`.
  - When finished, `crumble` the brick.
- **Cage attack:** replace the instant "caught". When the next planned cell is a cage cell, start an attack sequence in slow-mo (timeScale about 0.6):
  1. the head **rears back** with `strike` and a red "!" telegraph (0.7 s);
  2. **strike 1**: bars bend (big `barsWob`), sparks, shake, `sfx.boom`;
  3. rear back (0.5 s);
  4. **strike 2**: bars shatter (`burstCage`-style debris);
  5. the head lunges onto the princess; she cowers (`Scared`); `grin`; red flash; "GOT HER!".
  6. `fail('The serpent got the princess')` about 1 s later.
- **Last chance:** hitting the head before strike 2 interrupts the attack (stun plus `knockBack(3)`).

#### 6. Nervous princess (Vault)

Give her an x position inside the cage (about 140–220).

| Danger | Behaviour |
|---|---|
| below 0.3 | Idle at the centre, occasionally "Help!" |
| 0.3–0.6 | `Nervous` walk back and forth at about 22 u/s, pausing at the ends with a scared glance toward the snake |
| above 0.6 | `Panic` run "in circles": x = cx + 36·cos θ, with a slight scale and y bob from sin θ for depth, flipping on direction, biased away from the serpent |
| during the attack | `Scared`, cowering on the far side |

#### 7. Invasion polish

- **Calm the background:**
  - in `background()`, after drawing the plate, darken it with about rgba(6,8,20,0.35);
  - desaturate it about 30% (`globalCompositeOperation = 'saturation'` with grey at about 0.3 alpha);
  - darken the lower hangar (y above about 450) a further 25%.
- **Hazard line:** draw it thin and dim (about 0.3 alpha) until the formation is near, then brighten and flash it as a warning.
- **Landing beat:** when the formation lands, all robots `laugh`, the hazard line flashes red, and a beam zaps the paddle. Then "THEY LANDED" and `fail` after about 1.2 s.
- **Laser:** shots damage the boss through `shotHit`.
- Apply the same crumble, deck and continue behaviour as the Vault.

#### 8. Shinier bricks

Done by the art job above; verify it. If it is not finished, rerun the brick renders with:
- lower roughness and clearcoat;
- a softbox or emissive strip so the top faces catch a crisp highlight;
- the same sizes and names.

#### 9. Playtest and publish

- Playtest at iOS 393×852 with `?safe=59,34` and Android 412×915 with `?safe=32,24`.
- Check for no console errors, the deck clear of play, readable text, and a reachable continue flow.
- Share screenshots with the owner.

#### 10. Merge

Commit as mahikshith (no AI attribution) and merge `wip/polish-pass` into `main`.

---

## 9. Future, NOT to build now (keep the code extensible)

- **Story mode** chaining levels. The full plan (story bible, chapters, heroes, weapons, power-ups, fusions, store, roadmap) is in `docs/STORY_PLAN.md`; build only after the owner approves a phase.
- **Unlockables:** a locked princess, sword or prince shown as "next time" teasers; dragons and mythical beasts as new creatures.
- **Extensibility:**
  - levels are self-contained classes in the `LEVELS` registry in `main.js`, so new levels and creatures slot in the same way;
  - monetisation stays isolated in `monetize.js`;
  - persistent progress goes through `prefs.js`.
