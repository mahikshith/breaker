# Tidewheel Citadel — physical encounter contract

Current implementation work, 20 October 2026. This separate browser encounter is not in the five-chapter Android APK. The earlier 216u Nerra, eighteen-brick and B810 anatomy receipts are historical checkpoints; they do not validate this smaller, patrolling, twenty-four-brick version. Final v2 art/route/browser receipts are recorded below only after completion.

## Objective and layout

Keep the ordinary ball alive and defeat Nerra before rising water reaches Lumi's balcony foundation. Any separate ordinary ball contact with the visible shell or either claw damages Nerra; there is no colour order, precision symbol gate or invulnerable pose. The optional gate locks drain water when broken. Kit's earned Anchor clamps the hoist, cancels one attack and drains water.

World width is 360u. The paddle remains at the shared lower phone location supplied by the client; its model width/height are 100×14u and ordinary ball radius/speed are 6u/345u/s. Walls occupy x≤12 and x≥348; the upper ball boundary is y67. The 390u scenic rear wall extends beyond the viewport. It supports a smaller Nerra at feet y232; the wall and balcony scenery sit in a rear depth layer and do not pretend to be foreground ball obstacles.

Two physical rafts, centred at x102 and x258, carry twelve equal 34×18u bricks each. Local columns begin at −54/−17/+20 and rows at −51/−30/−9/+12. Bricks have 3u gaps. The front face spans local y34..48, rather than a rectangle behind the whole bank. Each visible central 70u brace (x−35..35) has2HP; its first hit cracks it and its second breaks it, opening a broad lower entry. Each real brace hit awards15score and one ordinary charge credit. The two side endcaps remain solid and grant no rewards. Rear support planks remain scenery after the foreground brace breaks. Collision and source-art masking use those exact bounds and follow raft translation/tilt. A thirty-brick layout was rejected because its extra upper row consumed the short-phone clearance beneath the claws.

This breakable brace corrects an observed playability defect: a plain centre-catch policy at H780/initial angle−.22 could rebound below an inert deck for25.75s without any productive contact. Intentional bank-shot policies already won, but that did not excuse the empty-feedback loop. The new brace gives genuine damage/crack feedback on that first underside contact; no hidden brick damage or automatic aim correction is used.

Raft initial height is min(380,paddleY−265), with a mechanical tether stop exactly 20u higher. Buoyancy seeks waterY−38 within that range, with a spring16/damping7, vertical speed capped28u/s, lateral drift±1.5u and tilt±.08rad. The renderer draws the stops and ropes. Final full-pose clearance measurements must include both tilt extremes, both tether extremes and Nerra's ±12u patrol.

## Anatomy and moving contact

The v2 body is 190.08×171.072u, with idle/step/hurt/pull raster keyposes sharing a supporting-foot pivot. Each pose owns its measured head, shell, legs and feet stencil and two shoulder sockets. Right claw geometry owns a real grip and a separate free-chain end. The left crusher reuses the original raster at explicit .88 scale. Decorative chain links are not hidden ball colliders.

The runtime imports `src/fantasy/tidewheel-v2-geometry.js`; the browser and Node model use this same data. The generated data SHA is BA6E1BDAB8034A9E9F6835A8DB20879738FC2824E07F278EA76ECEF194ED0F23; its exact equality with the final manifest DEFC7D7D75AF13B50560CBABD79D5115CBEEAFA997D9ABC5452F5C5E0418FC69 is tested. Each body pose has90 opaque disks; the .88-scaled left crusher has63 and the new right gripper37, for190 actor disks. Body keyposes are discrete artwork; patrol translation is swept, while unrelated stencil indices are never interpolated across empty space. Claws rotate rigidly about their measured moving shoulder roots, and each local disk is swept using its actual transformed previous/current centre.

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
| Minimum productive charge time | 18s | 22s | 26s |

These are implementation values, not human balance certification. Pull and pulse attacks share one state machine, so warnings do not overlap. The first normal pull teaches the mechanism before anger can strengthen it.

Every productive shell/claw contact causes a .4s hurt response and briefly stops the lateral patrol. The warning/attack clock continues, so repeated hits cannot freeze an attack forever. Three productive contacts bank anger. After the first pull, this can bring the next pull forward to a three-second idle warning opportunity. A normal pull has a full warning, then a one-second physical action and1.2s recovery. During warning the left crusher rises from−.12 to+.5rad; during action it drops back to−.12. The right gripping claw starts at+.12 and hauls upward to−.55rad over .55s. The real chain runs from its measured free end to the lower hoist wheel at(310,244), then onward in the scenic mechanism. The wheel turns with that pull.

Two distinct contacts on the active claw during a warning cancel it. Broad body damage is always legal but does not silently count as that directed interruption. Anchor accepts either warning, either active attack, or a still-live water pulse. Its full charge is consumed once, its bank is cleared, the attack is cancelled, water target drains24u and the visible clamp remains four seconds. An idle tap is rejected without spending. `canActivate('anchor',{ignorePause:true})` is a presentation query; `activate` itself never casts while paused.

The chain-hung refuge starts at baseY75 and an enraged pull lowers it by 6u, up to three steps/18u total (targetY93). It animates at at most20u/s. The visible flood limit is always `lumi.y+REFUGE_LIP_OFFSET`, initially122 and at most140. The exported offset47 matches the actual lower edge of the cropped hanging platform to within.1u; removed wall corbels no longer define an invisible failure line. The cropped platform stays visibly clear of the hauling claw. Raising the platform adds40u of flood headroom relative to the earlier baseY115 version, and matching its actual cropped edge adds another18u; earlier receipts are labelled by their source hashes. Water rises at at most28u/s and drains at at most20u/s. Neither a target change nor a refuge step teleports the encounter into failure.

The separate pulse begins at a visible lower side outlet, x24 or336/y=paddleY−205, and locks the current paddle lane when its warning begins. It does not follow a later drag. Exactly one r10 water projectile is fired, with a maximum three-second lifetime. Both ball and moving paddle interception are swept in relative motion. A ball deflects it into a short harmless .45s splash, without free damage/charge. A paddle hit costs one life, clears the attack and makes a fresh serve with at least three seconds of threat grace. Enemy water never damages or rewards the bricks. There is no forced loss from being underwater and no unannounced ball-speed reduction; the bounded current is lateral acceleration, not a new aiming axis.

## Win, loss and reset ownership

The actual final legal Nerra contact immediately enters `rescue`, clears water projectiles and warnings, and opens both gate locks. That owns the same tick over flood, pulse or ball-miss failure. A2.5s harmless rescue drains water and lifts Lumi before `won`.

Flood failure is tested against the current visible foundation. Out of balls or an actual pulse hit can exhaust lives. Terminal `update` is inert. One Continue preserves Nerra HP, cleared bricks, brace damage/openings, broken gates, refuge steps and earned resources. It clears threats, restores at least40u of visible flood headroom (normally48u drain), creates a caught ball and six seconds of warning grace; the replacement ball auto-launches after three seconds. Retry is a fresh model and resets all progress.

Renderer contract: `villain.stage` is idle/pullWindup/pull/recover/pulseWindup/pulse/defeated; `pose` is idle/step/hurt/pull; `footX/footY`, `frame`, `anger`, `enraged`, `stunUntil`, `hp/maxHP` are public. Each claw exposes root/previousRoot/angle/previousAngle/scale/mirror/partKey/grip. `chain` exposes hand/pulley/pull/wheelAngle. `pulseWarning` exposes source/from/fixed target/targetX/angle/age/life; `pulses` expose x/y/px/py/r/vx/vy/age/life/dealt/reflected/harmless. `lumi` exposes baseY/targetY/y/steps, and `water.limit` is dynamic. The real dimensional water raster is32×48u, rotated around its measured opaque core; its circle remainsr10. Transparent tail/glints add no extra collision area.

## Verification status

The focused suite has 29 tests, including the exact historical concave seam, inert endcap reflection, actual two-hit brace opening without reward duplication, early centre-catch feedback, exact v2 data admission, all four body poses and short-phone r6 clearance, actual platform-crop/flood-contact equality, real last-hit precedence, warned fixed lanes, swept moving-ball interception, one-life pulse cleanup, one-spend Anchor and Continue headroom/progress.

Pre-brace checkpoints are retained under `out/tidewheel-review/v2-final-routes` and `out/fantasy-review/tide-v2-final`; their successful aimed routes did not resolve the later centre-catch finding. The A3EC post-brace/pre-refuge checkpoint is under `out/tidewheel-review/v2-braces-routes` and `out/fantasy-review/tide-v2-braces-final`. The44AE raised-platform/pre-lip checkpoint is under `out/tidewheel-review/v2-refuge-final-routes` and `out/fantasy-review/tide-v2-refuge-final`. The final mechanical model is C216F74972AE53D65D762969284D215561E84B5F64A144BF0DA101122183DBF1; generated geometry is BE9DBE700427FD3E5C89D72DBEE0328105D2C0FE54732D88EE17CFD7174D7CD8.

The final fixed27 ordinary model routes at H700/780/800 produced 20 wins and 7 losses: Easy9/9, Medium5/9, Hard6/9. Each run uses only public launch/setTarget/update, three predetermined initial angles, coarse quantized prediction and fixed-lane pulse dodging; it never writes HP/resources/actors/progression. Losses remain in the receipt. Opening-only centre-catch checks on the final model give first productive contact in 0.58–1.34s across all nine fixed openings; the former H780−.22 idle loop now hits a real brace in .6875s. This establishes recoverability and prompt feedback, not human balance or passive-win claims.

The final full browser fixture run at 393×852/412×915 passed all six mode/viewport controls cases, both staged mechanism sequences and four bounded Easy public-touch routes. Ordinary wins were35.20s/3lives on iPhone viewport and45.07s/2lives on Android viewport. The signature-enabled iPhone policy finished in20.14s/3lives before any Anchor was earned/cast; the Android policy won in75.66s/1life with two genuinely earned Anchor casts. Do not label the zero-cast iPhone run as power-assisted. These are coarse assisted browser controls, not physical-device/human play. The final run has zero page/HTTP/network errors and an unchanged all-source/art seal. Earlier renderer-crossed receipts remain historical.

Permanent compact receipts and four selected full-phone PNGs are in `docs/validation/tidewheel/`. `browser.json` SHA 0451299D2A33E50A9501DCB48F9786EB286D6BA54DB5149DA98437D521279BDD records real primary/secondary touch pause after drag, Resume without a ghost click, blur freeze, held-Space rejection, actual Kit cast from a labelled charge fixture, Retry, Continue preservation, fixed-lane water dodge and legal earned routes. `routes.json` retains every bounded win/loss; `centre-catch.json` proves opening feedback; `geometry.json` records 2304 conservative pose/raft fixtures with no actor/brick overlap even after expanding anatomy by the ordinary ball's6u radius. Minimum outer/central lanes are 28.97/33.93u; the lowest deck-to-paddle gap is 212.84u (about.58s at345u/s after allowing the ball radius and paddle half-height).

The four-second desktop Chromium readback at190 actor disks measured callback CPU medians 2.8/4.0ms and p95 5.3/7.5ms at the two viewports. A single33.3ms RAF interval appeared in the first viewport; the second maximum was17.2ms. These bounded initial-play samples are not worst-case attack, physical-phone, GPU-completion or sustained60fps guarantees. They do not justify a speculative collision rewrite.

Reproduction from a fresh checkout (Node22; browser commands require Playwright's module and Chromium executable in `PW_MODULE`/`PW_CHROMIUM`):

```powershell
node --test tests/tidewheel.test.js tests/tidewheel-attacks.test.js tests/tidewheel-seams.test.js
node tools/playtest/tidewheel-geometry.mjs out/tidewheel-geometry
node tools/playtest/tidewheel-centre-catch.mjs out/tidewheel-centre-catch
node tools/playtest/tidewheel-routes.mjs out/tidewheel-routes
node tools/playtest/tidewheel.mjs out/tidewheel-phones http://127.0.0.1:4194/prototypes/fantasy/ --earned
node tools/playtest/tidewheel-profile.mjs out/tidewheel-profile
```

Serve the repository root before browser checks. `--probe` is a single iPhone/Easy case. Routes use a fixed coarse prediction policy, not HP/resource/actor writes; staged mechanism/resources/terminal fixtures are labelled separately. Profile telemetry measures desktop Chromium callback CPU/submission and requestAnimationFrame cadence, not physical-phone GPU completion or sustained handset performance.
