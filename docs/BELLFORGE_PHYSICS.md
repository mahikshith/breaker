# Bellforge Run: physical encounter contract

Implemented as a standalone, DOM-free model in `src/fantasy/bellforge.js` on 2026-10-20. The shared browser at `prototypes/fantasy/?level=bellforge` supplies the actual art, touch controls and presentation. This is separate from the five-chapter Android release and from Starflight. APK status remains in `MOBILE_PREVIEW.md`.

Korr is the ruby/plum armoured boar selected in `design/phase1/img/princess-bellforge-a-v1.png`. He operates the bell hopper and ratchet lowering Lumi's lift. Defeating his broad physical body stops the winch and permits her escape. Brum remains an ally; no selected character was recast.

## Shared model interface

```js
new Bellforge({
  width: 360, height: 700, difficulty: 'easy',
  paddleY: 610, geometry: {},
});
game.setTarget(worldX);
game.launch(-Math.PI / 2); // absolute upward angle in radians
game.canActivate('echo', { ignorePause: true }); // menu eligibility only
game.activate('echo'); // strict: cannot cast while paused
game.pause(true);
game.update(seconds);
game.continue(); // once per encounter, after a loss
// Retry constructs a new Bellforge with the same level/mode/aspect.
```

Authored world width is360 units. Heights700/760 are model route fixtures; the browser measures its portrait aspect and reserves126CSS pixels beneath the paddle. The constructor also accepts a wider logical field, but requires width≥360, height≥700 and580≤paddleY≤height−30. The default paddle is at height−90; production callers explicitly pass their control reservation.

| Field | Coordinates / meaning |
| --- | --- |
| `paddle` | Centre `x`, previous `px`, top `y`, width100, height14, `targetX`, actual `vx` |
| `balls` | `id,x,y,px,py,vx,vy,r:6,caught,dead,contacts:Set`; one normal ball in this encounter |
| `bricks` | Top-left `x,y,w,h,hp,maxHP,colour`; six rows of equal36×18 colour cells; optional30×18 two-hit `type:'pin'` with `rampId` |
| `ramps` | Fixed actual `pivot`, local `contactOffset`, length, angle/previousAngle/targetAngle, `omega`, thickness8, actual top-face endpoints `a,b` |
| `bells` | Mass centre `x,y`, previous `px,py`, velocity, radius14, HP2, spin/angle, `teaching,returning,dead,docked,rampId` |
| `villain` | HP, maxHP, stage/stageAt/stageTime/until; world-space compound `body`; render foot at(88,161), visual centre(88,105) |
| `villain.defeat` | Null in combat; after final hit: age, stagger/slump/dazed stage, stage progress, fallback raster frame3, fixed-foot offset/angle/scale and daze intensity |
| `lumi` | Lift location, `baseY:105,targetY,steps,allowance,escape,worried`; y moves at≤30u/s |
| `dock` | Bell-only trigger rectangle(294,312,36,28); no invisible player-ball wall |
| `guard` | Actual deflecting segment `a,b`, remaining/age/used; null while absent |
| `effects` | World centre, kind, age/life; bounded80 entries; brick-break adds colour,w,h,vx,vy |
| `state` | `play`, `lost`, `won` |
| `phase` | `serve`, `play`, safe `rescue`, or final safe `breach` descent |
| Other | Active threat `time`, lives3, score, charge0–100, pending raw `chargeBank`, `continued` |
| Ending clocks | `rescueDelayRemaining` holds Lumi until Korr settles; `rescueRemaining` includes that delay plus escape |

All positions and colliders are model coordinates, independent of Canvas scale. Exports `rampPose` and `sweepMovingSegment` are pure helpers. `BELLFORGE_MODES` contains the mode hypotheses below. `BELLFORGE_ENDING` exposes the stagger/slump/settle/escape timings. Unknown mode falls back to Medium.

## Motion and collision

`update` rejects nonfinite/nonpositive delta and bounds one call to0.1s, divided into≤1/240s steps. The caller should pass regular animation deltas rather than expecting a multi-second call to catch up. True pause freezes every field, warning, credit, effect and physical body. The model has no renderer or DOM dependency.

A first ball reversal before a same-substep dock arrival replays only the remaining bell motion and supersedes that predicted arrival; a later hit cannot erase an already physical ratchet contact. Static rectangle and compound-circle queries reuse `sweepTarget`/`overlapsTarget` from `carrier-physics.js`. Rotating ramps use conservative advancement against an angular capsule, bounded by projectile travel plus the rotating arm's maximum travel. Each reflected remainder queries only the remaining portion of the ramp/bell/paddle movement; it does not replay the complete angular step. Contact response uses the actual angular surface velocity. A bell preserves gravity-driven momentum with low ramp restitution; a player ball preserves its established arcade speed after angular reflection. Normal speed starts345u/s and paddle rallies cap at1.28×; the vertical component cannot settle below22% of total speed.

Korr's four physical poses use49/48/51/49 conservative alpha-inscribed circles (idle/windup/release/stagger), measured at3pixels/unit from the retained raster. They include broad head/torso/snout and separate hooves, leaving leg gaps empty. All sectors share one target identity, so overlap cannot double-damage the same contact. Normal body hits always deal1HP in every attack/recovery stage. `geometry.korrBody` can supply fixed world-space shapes; `geometry.korrBodies` supplies per-pose local `[x,y,r]` triples relative to the supporting foot. The compiled defaults match the manifest's measured `korr.collisions`.

The full Korr atlas canvas is170.667×149.333u at its actual supporting-foot pivot, not136×112 stretched artwork. The latter numbers describe the approximate opaque footprint. A substantial support at y161 is scenery behind the separate rolling lane. Bells emerge from the exposed hopper outlet at(164,147), outside the old incorrect birth point inside Korr's body.

Initial top-face surfaces:

| Ramp | Contact start | Length | Angle | Broken-pin stop |
| --- | --- | ---: | ---: | ---: |
| 0 | (123,172) | 72 | .19rad | −.32rad |
| 1 | (174,240) | 78 | .17rad | −.32rad |
| 2 | (245,307) | 68 | −.12rad | −.32rad |

The source's measured top face is displaced from the hinge. `contactOffset/length` equals(.07088607594936712,−.08144244921989992), derived from manifest contactA/B and hinge. The model rotates around the actual hinge; the renderer maps contactA/B to `a/b`. The hinge therefore remains fixed instead of orbiting around an arbitrary image-box edge. Pin destruction approaches the stop at≤.85rad/s. Geometry overrides may supply ramps with actual `x,y` hinge coordinates or `contactStart`, plus a local `contactOffset`.

All mixed start/stop combinations retain≥32u of clear passage between physical ramp capsules and≥42u side clearance. The current phone layouts contain30 full colour bricks across six rows (formerly22 in four). The first two upper-right column pairs stay empty for the visible bell route/ratchet, and the broad middle opening remains. A conservative keepout omits cells overlapping pins, either ramp stop or the ratchet on a shorter synthetic field; the700u fixture has25 colour bricks. Both actual phone aspects retain the same30-cell plan. Colour-cluster spacing is breakable geometry rather than a claimed open passage. The lowest colour surface ends210u above the paddle. Bell-only dock/catch triggers do not become invisible player-ball blockers.

## Bell loop and readable stakes

Korr's sequence is idle→windup≥1.3s→release.45s→recover.85s→idle. A returning bell causes1.5s stagger and cancels a pending release. The first teaching windup starts1.5 active seconds after launch; its actual rolling bell touches all three authored surfaces and enters the empty catch without lowering Lumi. First harmful release is no earlier than12 active seconds. Active counts and warning stages prevent overlapping same-lane windups; Hard's releases are naturally separated by≥7.5s, exceeding the3s stagger requirement.

Bell gravity is220u/s² with a360u/s speed cap. Spin tracks actual horizontal rolling motion. Balls and bells use relative swept contacts. First ordinary hit removes one bell HP and imparts a150–290u/s capped impulse. A second separated contact shatters it; remaining overlap cannot farm HP. Fragments are presentation only. A returned bell physically reaching Korr's compound shoulder deals4HP and staggers; it cannot deal damage remotely. Bells that miss the ratchet fall to a harmless catch at y365 rather than reaching the paddle.

A physical dock arrival increments the ratchet exactly once and changes `lumi.targetY` by12u. The lift moves continuously at≤30u/s; the final two remaining teeth set her worried expression. A final dock latches `breach`, clears further hazards, and finishes the bounded descent before `lost`. There is no injury animation. A last legal Korr hit is resolved before pending dock/life losses and latches safe rescue immediately. Every live bell, queued dock, guard and pending warning is cleared; player balls park, and no further bell can be released. A final reflected bell also exits the current bell iterator immediately, so a later same-step ratchet arrival cannot survive the safe latch.

Korr's readable defeat takes3.4 active seconds. The first.45s recoils the stagger pose; the next.65s eases into a grounded slump; a.5s dazed hold precedes Lumi's1.8s escape. `phase` stays `rescue` and `villain.stage` stays `defeated` throughout. `villain.defeat.stage` distinguishes `stagger`, `slump` and `dazed`; its fallback frame is3, offsets remain zero, angle eases from0 through−.07rad to+.08rad, and scales settle at(1.04,.82). The renderer applies these transforms around the unchanged supporting foot(88,161), swaps to dedicated dazed art after.22s and collapsed defeat art after.9s, and fades `daze` to1 after the slump. This is authored keyed-raster presentation data, not a new skeletal kneeling rig. `lumi.escape` remains0 for1.6s, then advances0→1 over1.8s; the shared renderer eases Lumi and the lift upward28u with chain endpoints following. Pause freezes the complete sequence, and the settled dazed pose persists after `won`.

| Mode | Korr HP | Harmful release interval | Max active bells | Lift teeth | Echo credits |
| --- | ---: | ---: | ---: | ---: | ---: |
| Easy | 24 | 10s | 1 | 8 | 18 |
| Medium | 32 | 8.5s | 1 | 6 | 22 |
| Hard | 40 | 7.5s | 2 | 5 | 26 |

These remain starting balance hypotheses. The ordinary route never requires a tiny weak point, pin destruction, Echo or payment.

## Echo Guard and recovery

Every genuinely damaged ordinary brick/pin HP banks one credit, bounded by the remaining meter capacity. The meter drains that bank at no more than one credit per active second. Destroyed targets, Korr, bells, enemy/foreign objects, arrows and active cosmic contacts cannot refill replacements. There is no passive energy or second resource. With the finite authored grid, Echo cannot be spammed indefinitely.

A full charged tap during a harmful windup or early live bell route deploys the real segment(187,205)→(217,175) for3s, with a.12s visible deployment. One actual swept contact rebounds the bell up the open return lane and retracts the guard over.35s. The projectile still has to reach Korr. No eligible bell or saturated guard retains the charge. `canActivate(...,{ignorePause:true})` is only a safe menu predicate; `activate` still rejects pause.

Initial serve auto-launches at8s; replacement caught serves auto-launch at3s while active threat time keeps running. Continue is once only, preserves Korr/pin/ramp/score/credit progress, restores two ratchet teeth and at least two lives, clears live bells/guard and gives≥3s before another windup. It cannot resurrect a defeated boss or repeat rewards. Retry is a fresh constructor, with no held input owned by the model.

## Validation and limits

### Fresh physics recheck — 2026-10-20

The owner requested a new pig/crab/all-level physics review. Bellforge required no runtime change: model SHA256 remains `A36418F1A40E5B95521065D27F80497C241BC30BAA4E1789DA3E9BE7CE3693CF`. All22 focused tests pass again. A separate fixed-seed ramp CCD stress audit checked3000 near-surface directions at345–5000u/s, the actual1/240s step and≤.85rad/s ramp motion. Of2290 reference cases penetrating the moving capsule by>.02u, none were missed. This bounded sampled audit does not prove exact grazing contacts or every possible trajectory.

Fresh ordinary and optional-earned-Echo model routes all finish with three lives and no Continue. The same maintained collision-forecast policy is used once per row/variant, without HP, position, resource or progress injection:

| Model height / paddle Y | Mode | Ordinary win | Earned Echo run | First cast |
| --- | --- | ---: | ---: | ---: |
| 700 /610 | Easy |43.54s |36.52s |30.72s |
| 700 /610 | Medium |65.60s |65.60s |31.07s |
| 700 /610 | Hard |73.54s |73.54s |52.29s |
| 780.458 /665.038 | Easy |58.36s |46.90s |20.72s |
| 780.458 /665.038 | Medium |79.45s |42.47s |27.72s |
| 780.458 /665.038 | Hard |71.78s |70.43s |33.22s |
| 799.515 /689.417 | Easy |63.28s |46.65s |30.72s |
| 799.515 /689.417 | Medium |66.23s |68.12s |36.23s |
| 799.515 /689.417 | Hard |100.37s |86.52s |40.73s |

All eighteen bounded attempts won. First ordinary brick damage is.60s; first broad Korr contact is3.76–4.02s. Echo is earned and cast once in each optional run, but can miss a bell already diverted by a broken pin. Equal/slower completion times are retained rather than presented as guaranteed power damage. A separate no-input attempt auto-serves and loses all balls at10.80 active seconds, Korr24HP; waiting does not rescue Lumi.

Fresh real-page Chromium checks pass all six phone/mode control cases at393×852 and412×915: genuine touch launch/drag, first Pause after drag, complete pause/chooser freeze, Resume, fresh same-mode Retry, staged full-charge Echo selection/consumption, and Home. Two earned browser Easy routes finish59.625s iOS /45.183s Android, three lives, no Echo or Continue. These rounded browser worlds are781/800u high; the unrounded aspect fixtures in the model table are intentionally reported separately. The browser policy reads geometry and uses public `launch/setTarget/update`, so these are assisted routes, not a claim of touch-only human play.

Both phones additionally pass explicitly staged loss/actual-touch Continue/Retry and physical bell-dock danger-stop fixtures. Continue preserves destroyed pins, actual ramp angle, Korr HP, score and unused credit, restores two lift teeth/at least two lives, and grants the warning grace. Terminal state remains frozen. Two staged defeat timelines verify immediate hazard cleanup, grounded stagger/slump/dazed art, delayed Lumi/lift escape and final result. All browser cases have zero page/HTTP errors and identical before/after dependencies. Viewed rolling-bell, Echo, collapsed Korr and Continue frames show no new alignment blocker.

Permanent compact reports, six selected native PNGs, reproducible audit scripts and hashes: [`validation/physics-recheck/bellforge/README.md`](validation/physics-recheck/bellforge/README.md). Full local output: `out/physics-recheck/bellforge/`. These checks establish bounded collision/state correctness and an assisted route through every mode; human difficulty, physical-phone performance and a new APK remain unclaimed. Earlier receipts below remain historical evidence for their original scopes.

`tests/bellforge.test.js` covers world metrics, ramp clearance, fast/static and angular-tip CCD, actual raster hinge/anatomy mapping, the full teaching/harmful route, pin rotation, physical bell momentum and damage episodes, banked charge exclusions, pause/delta/serve timing, physical Echo, animated ratchet/fragment metadata, last-hit precedence, the fixed-foot defeat/escape timeline, complete ending pause/cleanup, reflected-bell final-hit precedence, Continue and ordinary public-input Easy wins at both model heights. The defeat revision passes22 focused tests, including both ordinary model routes. The shared browser's six-aspect controls and final two-phone staged reaction/escape review pass with zero errors; final Main/render/reaction dependencies match before/after. The dedicated collapsed art and moving rescue lift were viewed at both primary phone sizes.

Defeat-revision model SHA256: `A36418F1A40E5B95521065D27F80497C241BC30BAA4E1789DA3E9BE7CE3693CF`; focused test-file SHA256: `3A9BF4078E2F6EF0B835177E4A8A0F34A3F065B149D03EFC772D547C4CC75432`. No encounter HP, brick layout, bell route or power budget changed.

Ignored deterministic receipts are under `out/bellforge-proof/`; browser receipts/screenshots are under `out/fantasy-bellforge-browser/`. The model-assisted policy reads geometry to forecast paddle angles and changes gameplay only through `launch`, `setTarget`, `update` and optional legitimate `activate`. This establishes an earned route, not human difficulty, touch skill, device performance or production admission. Historical route failures are retained with their exact pre-correction geometry and must not be presented as current pass results.

The art family contains four authored keyed Korr combat rasters plus separate dazed and collapsed reaction poses, not a full skeletal hoof/walk animation. The shared renderer supplies actual hopper/platform/ratchet layers, Lumi/Kit expressions, brass contact fragments and phone UI; their separate browser receipts determine visual admission. No new APK or campaign slot is implied by this standalone module.

### Earlier six-row measured checkpoint

Pre-defeat-revision model SHA256: `46F6297072BAF87B7C8D2E88875B3E1E4A7E99EC90A48F0AB3F5CF4BE7AC65CF`. Focused tests at that checkpoint:19pass; test-file SHA256 `69DDB9CC7124EA73E7A4B13EEC27C46B8C74D45078685482DEF481770498F5C8`. Actual frozen art manifest: `B810545F1C1CABBE6252FBAE0ECE8B4CCC1637946FD4BCA35D97C3A09D41FF13`. The timings below include the former1.8s ending; the current readable ending adds1.6s of safe presentation and does not inherit a new browser completion claim from these receipts.

One bounded deterministic policy run per mode/height/ordinary-or-Echo variant, all with three lives and no Continue:

| World height | Mode | Ordinary win | Optional earned Echo run | First cast |
| ---: | --- | ---: | ---: | ---: |
| 700 | Easy | 41.95s | 34.93s | 30.72s |
| 700 | Medium | 64.01s | 64.01s | 31.07s |
| 700 | Hard | 71.94s | 71.94s | 52.29s |
| 760 | Easy | 36.01s | 36.01s | 21.13s |
| 760 | Medium | 72.69s | 72.69s | 27.72s |
| 760 | Hard | 98.26s | 98.26s | 40.73s |

These are read-only-forecast assisted model routes, not human balance. An eligible cast can miss a bell already diverted by a broken pin; identical completion times do not prove added damage. No ordinary completion depends on the optional ability. Full outcomes/resources/provenance are in `out/bellforge-proof/model-routes.json`; prior geometry results, including failures, remain in its `history/` folder.

Actual browser page checks at393×852 and412×915 passed all six mode/device combinations: real touch drag/launch, first Pause tap after drag, complete pause and Kit-chooser freeze, Resume, fresh same-mode Retry, real Kit menu eligibility/consumption and return to menu. The Kit UI fixture explicitly stages full charge; it is separate from earned routes. Final cases use fresh Chromium and retain strict readiness; the helper now polls explicitly at50ms while animation frames are captured. Historical readiness timeouts are not labelled as gameplay failures.

Earned browser Easy rescues use only `launch`, `setTarget`, `update` and read-only geometry: iOS56.7625s, three lives/four teeth; Android61.6833s, three lives/five teeth. Neither casts Echo nor uses Continue. Both show the actual windup, keyed release, rolling bell, ratchet, rescue and result. All cases have zero page/HTTP errors. Logical fields are780.458/799.515 high, with paddles665.038/689.417 and30 colour bricks. Permanent receipts, selected native PNGs and SHA256SUMS are in [validation/bellforge](validation/bellforge/README.md); full local gallery is `out/fantasy-bellforge-browser/`. The cyan palette refresh is identified separately and does not acquire an unearned mechanical completion claim. Native video and any later Nerra-only art/loading changes have separate root review receipts.

The final shared-loader/input refresh passed all six phone/mode UI cases with zero errors; Main changed during that run, so its receipt explicitly retains both hashes rather than claiming a fixed-source seal. A later renderer-only refresh sealed current Main/render/model and both manifests unchanged at both phone sizes. The Bellforge paddle's image centre now uses its physical top plus half-height, aligning the visible metal with the caught ball. Those final openings are `validation/bellforge/*-opening-final.png`; this visual refresh does not repeat or replace the earlier earned routes.

The repeatable browser harness and read-only forecast policy are maintained in `tools/playtest/bellforge.mjs` and `tools/playtest/bellforge-policy.mjs`; neither imports an ignored output file. Run `node tools/playtest/bellforge.mjs` against the repository static server, or append `--ui-only` for controls/readiness. `tools/playtest/fantasy-visual.mjs` captures the two source-aligned phone openings and staged Tidewheel poses. `BASE_URL`, `PW_MODULE`, `BROWSER_EXECUTABLE` and `OUT_DIR` are optional environment overrides; exact commands and proof scopes are in the validation README.

Responsive/defeat integration is repeatable with `node tools/playtest/bellforge-defeat.mjs` (`--phones` for393×852/412×915 only). It checks ordinary touch launch, the first Pause after a drag, complete model freeze, Resume, an uncharged Kit menu and fresh Retry at six aspect ratios. It then stages final HP on the two phones and captures the actual renderer at stagger/slump/dazed/escape/result times. At renderer `7C4519AD…E13F0C7`, all six cases were source-stable, with no page/HTTP errors; the orb clears the paddle by18.91–19.64CSS pixels on the main phones and≥8.35CSS pixels in short previews. That retained-raster intermediate presentation is recorded separately in `validation/bellforge/defeat-responsive-intermediate.json`; newer reaction art and the subsequent `lumi.escape` lift movement do not inherit its visual approval.

The final two-phone rerun uses Main `728BBC49ADB17A215F7FEBFEA85488185927819EE1210ACCE5D1EAEC89BE7542`, renderer `57D691A16ACD59680F60BBFFE698110245F3220369A8A01FC744029CF0DD148E` and reaction manifest `11B2958079F617C556B8D8155195A156DC08F10FC69AFE7F7E86F639A6317544`. Both pass real control/Retry checks and the staged ending, with zero errors and stable source/PNG dependencies. The viewed final closed-eye collapsed Korr is grounded; Lumi/lift move together and remain separate from the mechanism. Final receipts and four native PNGs are in `validation/bellforge/defeat-responsive-final*` and `*-final-staged.png`. This is bounded staged visual/control evidence, not a new earned completion or physical-device performance result.
