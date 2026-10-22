# Tidewheel Citadel — physical encounter contract

Current revision, 20 October 2026: the owner's power/source/defeat feedback supersedes the C216 checkpoint below. Anchor no longer requires a short warning window; Arrow Volley and Starfire are selectable earned powers. Water is emitted from the actual animated crusher claw. The full earned meter is numerically snapped to100 rather than getting stuck just below the availability threshold. The earlier C216 receipts remain historical; they do not prove the revised powers or live fury artwork. This separate browser encounter is not in the five-chapter Android APK.

## Objective and layout

Keep the ordinary ball alive and defeat Nerra before rising water reaches Lumi's balcony foundation. Any separate ordinary ball contact with the visible shell or either claw damages Nerra; there is no colour order, precision symbol gate or invulnerable pose. Optional gate locks drain water when broken. One full earned meter buys a choice of Anchor, Arrow Volley or Starfire; power-caused damage cannot fund its own refill.

World width is 360u. The paddle remains at the shared lower phone location supplied by the client; its model width/height are 100×14u and ordinary ball radius/speed are 6u/345u/s. Walls occupy x≤12 and x≥348; the upper ball boundary is y67. The 390u scenic rear wall extends beyond the viewport. It supports a smaller Nerra at feet y232; the wall and balcony scenery sit in a rear depth layer and do not pretend to be foreground ball obstacles.

Two physical rafts, centred at x102 and x258, carry twelve equal 34×18u bricks each. Local columns begin at −54/−17/+20 and rows at −51/−30/−9/+12. Bricks have 3u gaps. The front face spans local y34..48, rather than a rectangle behind the whole bank. Each visible central 70u brace (x−35..35) has2HP; its first hit cracks it and its second breaks it, opening a broad lower entry. Each real brace hit awards15score and one ordinary charge credit. The two side endcaps remain solid and grant no rewards. Rear support planks remain scenery after the foreground brace breaks. Collision and source-art masking use those exact bounds and follow raft translation/tilt. A thirty-brick layout was rejected because its extra upper row consumed the short-phone clearance beneath the claws.

This breakable brace corrects an observed playability defect: a plain centre-catch policy at H780/initial angle−.22 could rebound below an inert deck for25.75s without any productive contact. Intentional bank-shot policies already won, but that did not excuse the empty-feedback loop. The new brace gives genuine damage/crack feedback on that first underside contact; no hidden brick damage or automatic aim correction is used.

Raft initial height is min(380,paddleY−265), with a mechanical tether stop exactly 20u higher. Buoyancy seeks waterY−38 within that range, with a spring16/damping7, vertical speed capped28u/s, lateral drift±1.5u and tilt±.08rad. The renderer draws the stops and ropes. Final full-pose clearance measurements must include both tilt extremes, both tether extremes and Nerra's ±12u patrol.

## Anatomy and moving contact

The v2 body is 190.08×171.072u, with idle/step/hurt/pull raster keyposes sharing a supporting-foot pivot. Each pose owns its measured head, shell, legs and feet stencil and two shoulder sockets. The added live fury roar has its own90 measured disks and new shoulder sockets; `villain.pose==='fury'` selects both the new artwork and its exact anatomy. Do not choose fury art from the numeric anger alone while the model is using a hurt pose. Right claw geometry owns a real grip and a separate free-chain end. The left crusher reuses the original raster at explicit .88 scale. Decorative chain links are not hidden ball colliders.

The runtime imports `src/fantasy/tidewheel-v2-geometry.js`; the browser and Node model use this same data. The generated data SHA is BA6E1BDAB8034A9E9F6835A8DB20879738FC2824E07F278EA76ECEF194ED0F23; its exact equality with the final manifest DEFC7D7D75AF13B50560CBABD79D5115CBEEAFA997D9ABC5452F5C5E0418FC69 is tested. Each body pose has90 opaque disks; the .88-scaled left crusher has63 and the new right gripper37, for190 actor disks. Body keyposes are discrete artwork; patrol translation is swept, while unrelated stencil indices are never interpolated across empty space. Claws rotate rigidly about their measured moving shoulder roots, and each local disk is swept using its actual transformed previous/current centre.

The separate `src/fantasy/tidewheel-reaction-geometry.js` admits the live roar without modifying the previous v2 data. Its measured source module is A4F3EC81C4D50E17279AF8805AD30DA8EE8406E2ECD9DA28FED503ECC3E266AE, reaction manifest11B2958079F617C556B8D8155195A156DC08F10FC69AFE7F7E86F639A6317544, and generated runtime module36EE0A32FC06359E6E5D202244D27B8FDD8F40EEF9CB0185946773C7F4A0CFF7. Fury uses the same unit size/foot pivot, actual crusher socket(−19.0050,−69.3527) and gate socket(64.2454,−58.2678). Source/module equality, genuine ordinary contact and full-r6 short-phone clearance are regression tested. Dazed/faint artwork is terminal presentation, not a reused live collision stencil.

Ball simulation uses bounded 240Hz substeps and swept circles against the moving bricks, deck, gates and anatomy. Shell and both claws share one compound `nerra` contact episode, cleared only after the ball leaves the union by 2u. A .1s minimum interval additionally prevents a concave seam from farming damage. A later genuinely separate contact remains productive. Normal reflection resolves in the moving target's frame, then restores the ordinary ball speed and at least75u/s vertical travel.

## Pressure, reaction and counterplay

The initial caught ball does not advance machinery or launch an attack. First launch schedules the initial pull twelve active gameplay seconds later. Replacement serves launch after three seconds. True pause freezes the world, the warning and the earned charge clock.

| Rule | Easy | Medium | Hard |
|---|---:|---:|---:|
| Nerra HP | 24 | 32 | 40 |
| Pull warning | 2.00s | 1.80s | 1.65s |
| Normal water rise | 18u | 22u | 26u |
| Enraged water rise, maximum per pull | 30u | 36u | 42u |
| Normal idle gap after pull recovery | 11s | 9.5s | 8s |
| Water-current acceleration cap | 15u/s² | 20u/s² | 25u/s² |
| Water-pulse warning | 1.50s | 1.40s | 1.30s |
| Water-pulse speed | 200u/s | 230u/s | 260u/s |
| Pulse gap after firing | 18s | 16s | 14s |
| Productive contacts / minimum active fill time | 12 /12s | 15 /15s | 18 /18s |

These are implementation values, not human balance certification. Pull and pulse attacks share one state machine, so warnings do not overlap. The first normal pull teaches the mechanism before anger can strengthen it.

Every productive shell/claw contact causes a .4s hurt response and briefly stops the lateral patrol. The warning/attack clock continues, so repeated hits cannot freeze an attack forever. Three productive contacts bank anger. After the first pull, this can bring the next pull forward to a three-second idle warning opportunity. A normal pull has a full warning, then a one-second physical action and1.2s recovery. During warning the left crusher rises from−.12 to+.5rad; during action it drops back to−.12. The right gripping claw starts at+.12 and hauls upward to−.55rad over .55s. The real chain runs from its measured free end to the lower hoist wheel at(310,244), then onward in the scenic mechanism. The wheel turns with that pull.

Two distinct contacts on the active claw during a warning cancel it. Broad body damage is always legal but does not silently count as that directed interruption. The power interface is `canActivate(kind,{ignorePause})` / `activate(kind)`, with kinds `anchor|volley|cosmic`. All three can arm on a full meter during ordinary combat or a caught serve. Unknown powers, terminal/rescue state, pause, insufficient charge or an already active choice reject without spending. Offensive power clocks wait while the ball is caught; they start at launch. The menu's ignorePause query never permits an actual paused cast.

| Power | Physical effect | Bound |
|---|---|---|
| Anchor | Cancels the current chain/pulse threat, drains24u immediately, visibly clamps the wheel and prevents a new attack during protection |8 active seconds; available while idle, not a narrow warning-only input |
| Arrow Volley | Five upward r3 arrows from alternating paddle emitters at x±16/y−18, speed480u/s. Each swept arrow damages its first actual opaque target once and is consumed; braces/endcaps can block it | Five arrows, .5s spacing,3s deployment; each arrow life2s |
| Starfire (`cosmic`) | One existing ball becomes an r8 piercing ball. It can damage each destructible target/contact episode once per pass; walls/endcaps remain solid |6 active seconds; no repeated overlap damage |

Each choice spends the same full meter once and clears its credit bank. Arrows and Starfire cannot earn charge. Ordinary hits still bank at most one refill, and time only converts earned credit: there is no passive generation. A1e−7 rounding tolerance snaps a fully earned meter to exactly100; it does not turn a partially earned meter into a free cast. Power timers/maxima are exposed as `powerTimers`/`powerMaxTimes`; `anchor.time/maxTime` also drive the visible clamp. A miss or Continue clears active powers/projectiles, while the unspent meter and encounter progress remain.

Starfire restores the normal r6 ball at expiry. If expiry occurs inside an object it was already traversing, that ball only finishes leaving that already-held overlap, without more damage or charge. New surfaces are immediately solid; the exit exception clears beyond the union. This avoids a trapped, expired ball without extending the damage window.

The chain-hung refuge starts at baseY75 and an enraged pull lowers it by 6u, up to three steps/18u total (targetY93). It animates at at most20u/s. The visible flood limit is always `lumi.y+REFUGE_LIP_OFFSET`, initially122 and at most140. The exported offset47 matches the actual lower edge of the cropped hanging platform to within.1u; removed wall corbels no longer define an invisible failure line. The cropped platform stays visibly clear of the hauling claw. Raising the platform adds40u of flood headroom relative to the earlier baseY115 version, and matching its actual cropped edge adds another18u; earlier receipts are labelled by their source hashes. Water rises at at most28u/s and drains at at most20u/s. Neither a target change nor a refuge step teleports the encounter into failure.

The separate pulse locks the current paddle landing lane when its warning begins. Its source follows the measured crusher-tip anchor through the real claw's preparation and recoil; the firing origin is sampled from that exact transformed muzzle, not a sidewall. It does not retarget a later drag. `pulseWarning.source` is the moving visible source, its `target/targetX` are fixed, and `villain.emission={from,angle,at}` records actual discharge. Exactly one r10 water projectile is fired, with a maximum three-second lifetime (enough for the longest native claw-to-paddle flight). Ball/arrow and moving-paddle interception are swept in relative motion. A ball or arrow deflects it into a short harmless .45s splash, without free damage/charge. A paddle hit costs one life, clears the attack and makes a fresh serve with at least three seconds of threat grace. Enemy water never damages or rewards the bricks. There is no forced loss from being underwater and no unannounced ball-speed reduction; the bounded current is lateral acceleration, not a new aiming axis.

## Win, loss and reset ownership

The actual final legal Nerra contact immediately enters `rescue`, clears hostile/friendly power projectiles and active powers, releases the hauling chain, and opens both gate locks. That owns the same tick over flood, pulse or ball-miss failure. The harmless3.6s defeat/rescue sequence shows stagger (<.35s), faint (<1.2s) and slumped/dazed rest before `won`. `villain.defeat` exposes age/stage/offsetX/offsetY/angle/scaleX/scaleY/daze. The foot remains planted (offsetY0); compression and a slight rotation create the slump instead of sinking the actor below the platform. The released chain becomes slack scenery and no longer pretends to follow a transformed hand under tension.

Flood failure is tested against the current visible foundation. Out of balls or an actual pulse hit can exhaust lives. Terminal `update` is inert. One Continue preserves Nerra HP, cleared bricks, brace damage/openings, broken gates, refuge steps and earned resources. It clears threats, restores at least40u of visible flood headroom (normally48u drain), creates a caught ball and six seconds of warning grace; the replacement ball auto-launches after three seconds. Retry is a fresh model and resets all progress.

Renderer contract: `villain.stage` is idle/pullWindup/pull/recover/pulseWindup/pulse/defeated; `pose` is idle/step/hurt/pull/fury. `footX/footY`, `frame`, `anger`, `enraged`, `fury/furyPulse`, `emission`, `defeat`, `stunUntil`, `hp/maxHP` are public. Each claw exposes root/previousRoot/angle/previousAngle/scale/mirror/partKey/grip; the crusher also exposes `muzzle`. `chain` exposes hand/pulley/route/pull/haul/scroll/wheelAngle/tension/released. Haul/scroll accumulate only actual positive chain-length gain during the pull; the wheel retains that ratchet angle through recovery rather than unwinding each cycle. `pulseWarning` exposes source/from/fixed target/targetX/angle/age/life; `pulses` expose x/y/px/py/r/vx/vy/age/life/dealt/reflected/harmless. `shots` exposes the finite physical arrow list. `lumi` exposes baseY/targetY/y/steps, and `water.limit` is dynamic. The dimensional water raster is32×48u, rotated around its measured opaque core; its circle remainsr10. Transparent tail/glints add no extra collision area.

## Revision verification

The revised model has40 focused tests, including all previous seam/layout/flood invariants plus idle/serve power arming, actual charge completion, no self-funding, finite cover-limited arrows, one-pass Cosmic contact and safe expiry, measured claw emission, cumulative hoist, exact live fury anatomy and grounded3.6s defeat. Model SHA E2E14ED4BC09F91F6DDEDF0A7CE030B6B1C578B51686A67B2D42CD83BAEF33B7 is frozen for integrated browser review.

The final8-run logical-phone Easy policy completed all ordinary/Anchor/Volley/Starfire attempts without HP/resource/actor writes. It uses the measured logical dimensions of393×852 and412×915 viewports and their126CSS-pixel paddle reserve, a fixed ordinary opening, coarse20Hz/8u paddle prediction and visible pulse dodges. Every power policy genuinely charged and cast twice before the result; first casts were17.91s at the iPhone logical size and16.57s at Android. iPhone outcomes were60.18/39.12/39.53/53.18s; Android61.82/53.33/47.01/71.44s, retaining1–3 lives. Power damage produced no charge and the source hash stayed unchanged. These are bounded coarse controller results, not browser/art or human-fun validation. These results were freshly reproduced in `docs/validation/physics-recheck/tidewheel/earned-powers.json`; use the maintained `tools/playtest/tidewheel-power-routes.mjs` adapter. The earlier pre-fury receipt remains at `out/tidewheel-powers/first-routes/routes.json` as history; its different reflection paths are not current evidence.

## Fresh independent physics recheck — 20 October 2026

The model remains frozen at `E2E14ED4BC09F91F6DDEDF0A7CE030B6B1C578B51686A67B2D42CD83BAEF33B7`. No gameplay fix or difficulty retuning was required. Forty focused tests freshly pass, covering fast moving-raft contacts, the compound shell/claw episode, charge/power ownership, measured firing origins, cumulative chain haul, smooth refuge/water movement, final-hit precedence and Continue.

The fresh2304-pose geometry sweep reports no actor/brick overlaps, including the full ordinary-ball clearance. Minimum outer/central lanes remain28.97/33.93u and minimum deck-to-paddle gap212.84u. Nine simple centre-catch openings all produce a real contact in0.58–1.34s. Twenty-two of27 fixed ordinary model routes win: Easy9/9, Medium8/9, Hard5/9. All five losses, including their remaining HP/lives and failure causes, remain in the receipt. These fixed controller outcomes do not certify human balance or guarantee a Hard win.

The fresh actual-browser suite passes six mode/phone control cases at393×852 and412×915, two staged machinery sequences and four input-only earned Easy routes, with zero page/HTTP/network errors and unchanged source/art seals. Ordinary routes win in33.74/32.75s; the earned-Anchor routes win in24.18/26.60s, each with one genuine UI cast. All retain three lives. A separate eight-case staged power/UI check verifies the three choices, exact discharge origin and grounded defeat on both phones; its full-charge fixtures are not earned progression.

The review exposed one stale test assumption: a fixed1.5s post-launch wait could end before the Easy water shot traversed the taller current phone playfield. The maintained browser test now derives the remaining flight from the actual projectile position/velocity and observes the full warning/lifetime for the dodge. Life-loss, brick-immunity and counterplay assertions remain intact. An earlier startup timeout under concurrent review load and the stale-wait failure are retained, alongside a clean isolated loader probe and the final full pass; they are not silently discarded or called gameplay failures.

Permanent receipts, retained failures and five viewed native PNGs are in `docs/validation/physics-recheck/tidewheel/`. The existing main/renderer hashes are `728BBC49…BE7542` / `57D691A1…DD148E`. Commands below reproduce the review; append `node tools/playtest/tidewheel-power-routes.mjs out/tidewheel-power-routes` and run `tools/playtest/tidewheel-powers-ui.mjs` with `OUT_DIR` selecting a new folder. This remains a standalone browser encounter, separate from the Android APK. No physical-device performance or human-fun claim follows from the automated checks.

## Historical C216 verification checkpoint

The focused suite has 29 tests, including the exact historical concave seam, inert endcap reflection, actual two-hit brace opening without reward duplication, early centre-catch feedback, exact v2 data admission, all four body poses and short-phone r6 clearance, actual platform-crop/flood-contact equality, real last-hit precedence, warned fixed lanes, swept moving-ball interception, one-life pulse cleanup, one-spend Anchor and Continue headroom/progress.

Pre-brace checkpoints are retained under `out/tidewheel-review/v2-final-routes` and `out/fantasy-review/tide-v2-final`; their successful aimed routes did not resolve the later centre-catch finding. The A3EC post-brace/pre-refuge checkpoint is under `out/tidewheel-review/v2-braces-routes` and `out/fantasy-review/tide-v2-braces-final`. The44AE raised-platform/pre-lip checkpoint is under `out/tidewheel-review/v2-refuge-final-routes` and `out/fantasy-review/tide-v2-refuge-final`. The final mechanical model is C216F74972AE53D65D762969284D215561E84B5F64A144BF0DA101122183DBF1; generated geometry is BE9DBE700427FD3E5C89D72DBEE0328105D2C0FE54732D88EE17CFD7174D7CD8.

The final fixed27 ordinary model routes at H700/780/800 produced 20 wins and 7 losses: Easy9/9, Medium5/9, Hard6/9. Each run uses only public launch/setTarget/update, three predetermined initial angles, coarse quantized prediction and fixed-lane pulse dodging; it never writes HP/resources/actors/progression. Losses remain in the receipt. Opening-only centre-catch checks on the final model give first productive contact in 0.58–1.34s across all nine fixed openings; the former H780−.22 idle loop now hits a real brace in .6875s. This establishes recoverability and prompt feedback, not human balance or passive-win claims.

The final full browser fixture run at 393×852/412×915 passed all six mode/viewport controls cases, both staged mechanism sequences and four bounded Easy public-touch routes. Ordinary wins were35.20s/3lives on iPhone viewport and45.07s/2lives on Android viewport. The signature-enabled iPhone policy finished in20.14s/3lives before any Anchor was earned/cast; the Android policy won in75.66s/1life with two genuinely earned Anchor casts. Do not label the zero-cast iPhone run as power-assisted. These are coarse assisted browser controls, not physical-device/human play. The final run has zero page/HTTP/network errors and an unchanged all-source/art seal. Earlier renderer-crossed receipts remain historical.

Permanent compact receipts and four selected full-phone PNGs are in `docs/validation/tidewheel/`. `browser.json` SHA 0451299D2A33E50A9501DCB48F9786EB286D6BA54DB5149DA98437D521279BDD records real primary/secondary touch pause after drag, Resume without a ghost click, blur freeze, held-Space rejection, actual Kit cast from a labelled charge fixture, Retry, Continue preservation, fixed-lane water dodge and legal earned routes. `routes.json` retains every bounded win/loss; `centre-catch.json` proves opening feedback; `geometry.json` records 2304 conservative pose/raft fixtures with no actor/brick overlap even after expanding anatomy by the ordinary ball's6u radius. Minimum outer/central lanes are 28.97/33.93u; the lowest deck-to-paddle gap is 212.84u (about.58s at345u/s after allowing the ball radius and paddle half-height).

The four-second desktop Chromium readback at190 actor disks measured callback CPU medians 2.8/4.0ms and p95 5.3/7.5ms at the two viewports. A single33.3ms RAF interval appeared in the first viewport; the second maximum was17.2ms. These bounded initial-play samples are not worst-case attack, physical-phone, GPU-completion or sustained60fps guarantees. They do not justify a speculative collision rewrite.

Reproduction from a fresh checkout (Node22; browser commands require Playwright's module and Chromium executable in `PW_MODULE`/`PW_CHROMIUM`):

```powershell
node --test tests/tidewheel*.test.js
node tools/playtest/tidewheel-geometry.mjs out/tidewheel-geometry
node tools/playtest/tidewheel-centre-catch.mjs out/tidewheel-centre-catch
node tools/playtest/tidewheel-routes.mjs out/tidewheel-routes
node tools/playtest/tidewheel.mjs out/tidewheel-phones http://127.0.0.1:4194/prototypes/fantasy/ --earned
node tools/playtest/tidewheel-profile.mjs out/tidewheel-profile
```

Serve the repository root before browser checks. `--probe` is a single iPhone/Easy case. Routes use a fixed coarse prediction policy, not HP/resource/actor writes; staged mechanism/resources/terminal fixtures are labelled separately. Profile telemetry measures desktop Chromium callback CPU/submission and requestAnimationFrame cadence, not physical-phone GPU completion or sustained handset performance.
