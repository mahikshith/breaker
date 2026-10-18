# Orbital Breakout — Level 3

2026-10-18. The owner requests parallel Relay Raiders and Level 3 work while the frozen Carrier APK is built. C / Orbital Breakout is the approved visual reference; its left playfield is the scope. Nova and Pin have no cast selection. No companion, portrait or replacement saucer is admitted here.

The playable milestone is a **mechanics greybox**, isolated from the shipping game. A separate first C hull/hangar art family now exists, as described below; those parts have not replaced the prototype primitives. Its gameplay screenshots cannot be used as evidence that the approved visual quality has been achieved. The existing A carrier is not a substitute for the C hull.

**Later critical art subtask, 2026-10-18:** The first C-specific hull/hangar family is now produced separately under `assets/space-c/`, with original source pixels, prompts and receipts preserved as `art/space/source/orbital-*`. Its hull, bay backing and independent shutters form an asset-only proof in `out/orbital-art-proof/`; they are not admitted into the mechanical prototype, active runtime, packer or APK. The greybox statement above remains true for the playable C prototype. All other C art and the exposed-reactor/disabled families remain unbuilt.

## Subtasks and current evidence

| Subtask | Output | State |
|---|---|---|
| O1 — reference inventory and asset gaps | The exact left-board inventory, placement scale and production list below | Complete specification; first intact hull/hangar proof produced, remaining C families pending |
| O2 — independent gameplay blockout | `src/orbital.js`, injectable `ORBITAL_LAYOUT`, isolated browser build | Playable greybox, absent from `main.js` and the APK |
| O3 — physics and state contracts | Real Arena input/powers/ball physics plus Carrier collision helpers; `tests/orbital.test.js`, `tests/orbital-review.test.js` | 12 focused tests and 4 independent geometry/state tests pass; phone image review ongoing |
| O4 — phone proof and visual QA | `out/orbital-next/` opening, warning, shot, pause, lifecycle, victory and earned-run evidence | Both browser phone sizes pass, including pause/input isolation and real Retry/Continue buttons; final C art and physical device checks pending |

The source reaches only the new level, its tests and isolated preview. No shared source, packer, menu registry, active bundle, save schema, global configuration or APK worktree is changed. The preview reuses the existing house-font web stylesheet; font availability is not a mechanics acceptance result.

## Reference inventory

Reference: `img/space-orbital-c-v1.png`, 1536×1024. Left source crop `(12,12,608,978)`. Placement uses uniform `k=360/608`: `worldX=(sourceX−12)×k`, `worldY=72+(sourceY−12)×k`. Preserve proportions and put the extra phone height in the return lane. The compact top HUD and 126 CSS pixel paddle reserve are inherited from the accepted controls. The board border, title and companion corner are excluded.

| Element in the left image | Count | Native mechanical role |
|---|---:|---|
| Angular slate-violet carrier shell with circular magenta command optic | 1 | Persistent solid hull; optic is a visual control light, not a target hidden behind opaque armour |
| Deep central hangar with two retracting shutters | 1 bay / 2 leaves | Launch aperture; later exposes the reactor. Closed visible leaves are solid; fully retracted leaves have no collider |
| Large cannon assemblies | 2 | 9 HP each; alternating locked-lane warning, shot, recoil and recovery; disabled hardware remains visible and solid |
| Swept white/cyan fighters | 5 main + 2 flank craft | Seven paths per 14-second wave, 2 HP each. Optional destructible obstruction; no requirement to clear an endlessly respawning wave |
| Tall transparent worker pods | 3 | Housing/lock targets, 3 HP each. Workers never receive damage; shell opens and the worker departs after release |
| Plain cyan/violet panels | 17 | 1 HP, matching distinct measured rectangles |
| X-braced metal panels | 5 | 3 HP, blocks FIRE/TITAN piercing; ordinary balls can break every one |
| Star-marked panel | 1 | 1 HP, earned BURST capsule |
| Shield-marked panel | 1 | 1 HP, earned SHIELD capsule with the established missed-ball rule |
| Skull-marked risk panel | 1 | 1 HP, visible optional SHRINK capsule; it is avoidable and never required for a gate |
| Three-orb panel | 1 | 1 HP, earned SPLIT capsule |
| Silver/cyan paddle and chrome ball | 1 / variable | 125×17u physical paddle, ordinary ball radius 7.5u, TITAN radius 10u, inherited 345u/s speed and 1.28 maximum rally ramp |
| Full-screen dark stars, edge asteroids and lower-right Saturn | Background family | Decorative only; foreground and ball remain dominant. No framing window or collision-shaped rocks in the return lane |

The prototype has 26 panels in total, not a new rectangular grid. Lowest panel bottom is 420.75u; its difference from the paddle is 193.25u on the iPhone and 254.25u on Android. At the maximum ordinary ball speed, a straight vertical return from the last row has approximately 0.404s / 0.542s between the two circular contacts. These are geometry measurements, not human reaction comfort proof.

## Objective, pacing and fair counterplay

Free all three crew and disable both cannons in any order. This opens the bay and reveals a 12 HP reactor at `(181,184,r14)`. Destroy the reactor, then allow the two-second escape to complete. Every gate accepts ordinary ball hits; no purchased power, drop catch or deadline is required. Intact panels are useful cover until the player clears them, so the encounter becomes more exposed as the board opens. Disabling a cannon removes its future shots permanently and cancels its current wind-up. The last reactor phase has no active cannons and provides a quieter precision finish.

The upper command optic is embedded in the opaque full-width hull. Making it the required damage target would make an ordinary-ball route inaccessible. The prototype instead reveals a separate reactor at the back of the existing bay after the rescue/cannon gate. Empty pod rails remain physical, so the final phase rewards a bank through the opened field. A focused normal-ball test reaches the exposed core from the low paddle around all three retained rails after remaining panels have been cleared. The production art list explicitly includes this exposed state; it must not be represented by a hidden hitbox on the reference hull.

The initial serve freezes the enemy clock. After launch, cannon warnings begin no earlier than 3.2 seconds. A cannon locks the paddle's current horizontal position, warns for 1.25 seconds and fires a 230u/s bolt down that fixed lane. It does not secretly retarget during the warning. Only one warning exists at a time; starts are 3.6 seconds apart. The displayed warning stops at the first intact panel or pod that will absorb the bolt. A ball can intercept the projectile, and a caught ball also physically guards the paddle. A hit stuns the paddle for 0.45 seconds; it does not consume a missed-ball SHIELD charge. Cover absorbs hostile shots without damaging its HP or crew.

Five main fighters emerge through the open bay, followed by the two flank paths. The collision polygon matches the same dart shown by the greybox renderer and is clipped to the bay lip. Hidden portions have no collision. All seven leave continuously before the next wave. Fighter weapon animations and final silhouettes remain production work; they are not falsely inferred from the existing A assets.

## Collision and lifecycle contract

- Arena's 1/120-second tick, substepped ball solver and Carrier target helpers own physical movement. Target velocities are compensated when SLOW changes ball time. The preview's prediction cannot dispatch live damage or mutate the objective.
- Each panel and pod uses its exact visible primitive rectangle. A released pod retains its drawn upper rail as solid unpierceable cover and leaves the vacated window empty. Fighters share their displayed polygon. The hull's bay and gun cutouts are actually open; both guns and the revealed reactor have tested ordinary-ball approaches through those openings after blocking panels are cleared.
- A normal final-HP contact rebounds. X armour, hull, shutters and disabled cannons remain solid to powered balls. Damage dispatch is per contact episode, not every lingering substep.
- Worker release is presentation after a housing reaches zero HP; the crew itself is not a damage actor. The exposed-core gate checks all pods and both cannons; no gate can be skipped with FIRE/TITAN or LASER.
- Loss and win freeze the encounter. Continue retains earned panel, pod and cannon progress; clears bolts, attack and stale balls; gives a fresh caught serve plus the existing two missed-ball shield charges; and schedules three seconds of warning grace after resuming.
- Destroying the exposed reactor clears hazards, drops, shots and aim, parks the balls and waits two seconds for escape. No further combat runs behind the won state.

## C production assets still missing

The first intact hull/bay/shutter proof now exists; its exact records are in the next section. Remaining filenames/states below are requested contracts, not files claimed to exist. Natural aspect, consistent upper-left light, glossy cool enamel/brushed silver, readable magenta local effects and true RGBA cutouts must follow the C source. Each sprite must have stable display bounds, pivot, attachment points, layer and collision contour measured from its actual alpha. The current primitive contours are not production alpha evidence.

| Required family / suggested key | Parts and states that must be produced |
|---|---|
| `cHull` | First intact C-specific hull/roof/antennae/command optic proof delivered separately. Optic glow separation and damaged/disabled material states remain unbuilt |
| `cBayBack`, `cBayLip`, `cDoorLeft`, `cDoorRight` | First deep interior and independent leaves delivered separately, with hull's fixed front lip. Final launch occlusion and gameplay timing remain unverified; no flattened fighters or baked projectile |
| `cReactor` | Dormant bay backing → exposed magenta reactor after rescue/cannon gate → damaged/disabled. Its visible centre must align with the required target |
| `cCannonMount`, `cCannonBarrel` | C-specific thick ringed mount, independent pivoting barrel and muzzle. Idle/warn/fire/recoil/recover/hit/disabled. Muzzle and pivot anchors in local coordinates |
| `cFighter`, `cThruster` | C white/silver body, blue cockpit and red/orange wing tips at the reference perspective, independent cyan exhaust. Launch/bank/hit/disabled and idle/burst/off plume reads. Seven instances use five main/two flank paths, without copying A's final silhouette |
| `cPodShell`, `cPodDoor`, `cPodGlass`, `cWorker` | Tall C capsule with orange latch lights, separate worker, glass and split door. Locked/hit/cracked/unlock/open/empty; worker idle/worried/release/escape. These workers are the objective cast, not Nova/Pin companions |
| `cBrickCyan`, `cBrickViolet`, `cBrickArmour` | Glossy beveled 1 HP panels; X armour intact/cracked/broken, preserving source-specific width variations. Rounded production contours must replace primitive rectangles where the alpha is visibly absent |
| `cPowerBurst`, `cPowerShield`, `cPowerShrink`, `cPowerSplit` | Native readable star/shield/skull/three-orb marks plus falling capsules; no tiny unreadable text. Distinct harmless/reward/risk reads |
| `cPaddle`, `cBall` | C silver endcaps/cyan inset paddle at physical125×17u; chrome7.5r ball and10r TITAN with bounded glow. Ordinary/charged/hit/stun/power states remain aligned to collision |
| `cBolt`, `cMuzzle`, `cHit`, `cRelease` | Local warning/shot/recoil and impact/unlock effects with clear beginnings, dangerous timing and recovery. No long decorative beam replacing a fired projectile |
| `cBackground`, `cAsteroids` | Dark full-viewport starfield and dim Saturn at the C position, separated edge rocks if drift is used. No HUD, title, border, paddle, ships or bright foreground impostors baked into the background |

Existing A/B deliverables can inform lighting, alpha normalization, assembly masks and packing. They do not satisfy any missing C-specific hull, fighter, pod or background item merely by recolouring or renaming it. No new asset or portrait is packed into `vault-art.js` in this milestone.

## First C hull/hangar asset proof

This is a separate intact machinery-family proof, not the finished C level. `assets/space-c/machinery.json` records original hashes/crops, six exported PNGs, normalized pivots and the assembly contract. The C reference itself guided the new parts; no A hull pixels were recoloured or renamed. All parts retain natural aspect and have empty PNG metadata with clear exterior alpha padding.

| Delivered part | Pixel size | Contract |
|---|---:|---|
| `hull.png` | 1992×795 | C pentagonal bridge cap, concentric command optic, faceted shoulders, fixed cannon sockets and open bay rim. Natural360×143.675u at worldY76. Moving cannon barrels are absent |
| `bay_back.png` | 1308×438 | Deep recessed interior cropped from its preserved separate original; the outer generated frame is excluded so the hull rim is not duplicated. Exterior alpha is0; source interior alpha is250–254 |
| `doors_pair.png` | 2022×689 | Matching C closed panels before deterministic splitting, preserved for reproducibility |
| `door_left.png`, `door_right.png` | 1019×697 each | Independent leaves with opposing seam pivots. Uniform size and fixed vertical anchor; no frame-by-frame rerender drift |
| `bay_mask.png` | 1992×795 | Internal connected transparent aperture measured from hull alpha, with a two-pixel overlap behind the rim. Presentation mask only, not an admitted gameplay collider |

The actual aperture bounds are `[776,541,1217,705]` in normalized hull pixels. It contains72,821 masked source pixels. Shutters retract242.55 source pixels outward from their shared centre seam and remain clipped behind the real rim. The closed pair covers99.749% of the measured mask at the technical alpha threshold; the fully open pair leaves0 door pixels inside it. Small threshold differences lie at antialiased boundaries; independent visual review remains the acceptance gate. The bay is drawn first, shutters next and hull last. No fighter placement ball or flattened concept screen is presented as gameplay.

Reproduce the normalized files, self-contained browser proof, comparisons and36-frame presentation GIF:

```text
python tools/orbital-preview/prepare_reference.py
python tools/orbital-preview/prepare_art.py
node tools/orbital-preview/asset-proof.mjs
python tools/orbital-preview/art_media.py
```

Use the configured Python/Pillow/numpy environment and existing Playwright paths. The proof embeds the same cached Lilita One font used by the A/B asset preview from `out/brum-proof/LilitaOne-Regular.ttf`. Output is isolated in `out/orbital-art-proof/`: `source-comparison.png`, `source-{closed,half,open}.png`, `{ios,android}-comparison.png`, native state PNGs, `hull-alpha-checker.png`, `shutter-motion.gif`, `orbital-machinery.html` and `asset-report.json`. Both393×852 and412×915 capture runs report0pageerrors. The proof compares the original C carrier crop with the actual separate-part assembly at source and phone sizes; all captioned open/close motion is asset presentation, not combat.

Original requests, output receipts, raw source PNGs and reference crop hashes remain under `art/space/source/orbital-*`. Metadata-free outputs do not erase these technical production records. Remaining work is independent visual review, any required reference correction, C barrel/fighter/pod/brick/background and state families, actual-alpha collision admission, runtime WebP sizing, memory/performance, full gameplay and a separately reviewed APK. Mechanical source/tests and the frozen Carrier checkpoint are unchanged by this art subtask.

## Minimal future integration

1. Produce and independently review the C families above at 393×852 and 412×915. Use source-size parts plus the same actual-size/collider overlays used for Carrier; verify open, closed, disabled and launch occlusion states. Record manifests/provenance and normalized metadata-free images.
2. Replace only the isolated greybox drawing and primitive silhouettes with reviewed C art and actual-alpha contours. The constructor currently exposes `new Orbital(W,H,uiScale=1,data=ORBITAL_LAYOUT)` and named export `ORBITAL_LAYOUT`; authored data is copied per actor. Existing hooks are `world`, `hitTarget`, `shotHit`, `updateLevel`, `loseBall`, `continueRun`, `draw`, `inspect` and `result`.
3. After final C art/phone gameplay review, add an Orbital entry to `src/main.js` using `(W,H,scale)=>new Orbital(W,H,scale)`, admit the C manifest through the packer, and add its full-viewport background hook. Those caller/config/packer changes are deliberately absent now. Preserve save keys and Vault/Carrier behavior.
4. Run the existing gameplay/mobile suites, C's focused/independent tests, normal-ball critical-path checks and earned full runs on both phones; then build a separately reviewed APK checkpoint. Do not add the current prototype to the frozen Carrier APK.

## Reproduce and assess this milestone

Commands, from the repository with Node22 on PATH:

```text
node --test tests/orbital.test.js
node tools/orbital-preview/build.mjs
node tools/orbital-preview/check.mjs
```

Set the same `PW_MODULE` and `PW_CHROMIUM` used by the existing phone suites. The generated `out/orbital-next/orbital.html` can be opened with `?safe=59,34` on393×852 or `?safe=32,24` on412×915. The preview starts directly in C, uses real pointer aiming/dragging and the inherited powers, and labels itself a mechanics prototype. Pause is top left and clears held controls without releasing a caught ball; playfield/Space input is ignored while paused. Completion and loss show explicit crew counts with working Retry/Continue touch buttons. R restarts and Enter continues after a loss. These are isolated development controls, not a new production menu.

Observed browser evidence: zero page errors; real pointer aim/release/drag; idle-safe serve; exact inventory; about126 CSS paddle reserve; staged warning/shot, loss/freeze/Continue and direct-damage victory fixtures. Separately, deterministic public-input assisted full runs won on the first recorded seed20261018, with all three pods, both guns and the core earned through live physics: **71.55s iPhone / 94.92s Android**, three lives remaining each. These final results supersede the earlier no-rail fixture's50.27s/63.71s. The iPhone victory collected SHRINK/SPLIT/SHIELD and triggered two TITAN returns; Android collected BURST/SHIELD and triggered three TITAN returns. The assisted runner never writes HP, phase or earned progress, but it predicts paddle returns and chooses Focus aim, including the final wall bank; it does not establish human difficulty.

A separate bounded no-capsule/off-centre input policy did **not** prove a complete normal-only earned win. Its iPhone victory still collected powers and triggered TITAN, so it is excluded from that claim. Three deterministic Android attempts avoided all capsules but accidentally triggered two TITAN returns and stalled at8/12 reactor HP after360 seconds. The report records `hasNormalOnlyWin:false` on both phones. Individual ordinary-ball gates and the low-paddle bank path pass focused physics tests; full earned no-power completion remains unverified. No native Android, physical-device performance, final C art, final animation or human balance is claimed.
