# Gatebreak: authored Starflight mission

Implementation checkpoint2026-10-20. This is a separate finite mission layered over the preserved Starflight combat lab. `src/starflight/mission.js` exports `StarflightMission extends Starflight`; geometry and ordinary lab behaviour remain unchanged. The one approved base extension is `playerShotRadius()`, returning the normal7u core by default and sampled separately for each hostile projectile. The mission overrides it for a real charged shield. The prototype entry chooses mission versus lab. This document records implemented model behaviour and bounded model checks, not a delivered Android build, measured physical-phone performance or the entire proposed campaign.

The player opens an evacuation route through a visible gate blockade. Patrols teach direct flight, returning interceptors prevent empty fly-pasts, wreck corridors offer destructible cover/supplies, missile leaders and gate batteries lose firing capability under damage, and the command ship's defeat opens the route. The ending is finite. Enemy survival or running out a clock never awards completion.

## Public contract

```js
import { StarflightMission, MISSION_POWERS, STORM_WINGS, wingPoint, droneMuzzle } from './starflight/mission.js';
const game = new StarflightMission({ width:360, height:613, difficulty:'easy', seed:7 });
game.setControlReserve(actualReactorCircle); // Same measured control contract as the lab.
game.resize(360, newWorldHeight);            // Rebase the live mission before remeasuring its control.
game.setTarget(x, y);
game.update(1 / 120);
game.canActivate('storm');
game.canActivate('storm', { ignorePause:true }); // Read-only paused chooser eligibility.
game.activate('storm');                        // Always enforces the actual pause state.
```

Inherited fields remain renderer-compatible: player, enemies, shots, effects, pickups, hazards, drones, fields, timers, charge, chargeBank, score, time and difficulty. Movement, small player hurt core,27.04u wing-clearance edge, real hardpoints, relative swept ordinary shots and banked reactor economy remain intact. Restart constructs a fresh mission; it does not retain stocks, damage, clocks, held input or objective progress.

| Field | Meaning |
|---|---|
| `mission` | `{id:'gatebreak',beat,title,objective,group,progress,required,elapsed,restRemaining,kills,suppliesEarned}`. Group is−1 before first entry, then0–9; it is an internal authoring index, not HUD “Wave N”. |
| `mission.beat` | `approach`, `debris`, `battery`, `command`, `extraction`, `complete`. Use title/objective for the actual situation. |
| `phase` | `combat`, `boss`, `jump`, `complete`. `jump` is the harmless final extraction, not another endurance sector. |
| `state` | `play`, `lost`, `won`. Both lost and won freeze later updates. |
| `world.gate` | `{x,y,r,open,locked}`. Locked from mission start; command defeat unlocks it, extraction increases opening, victory sets open1. |
| `world.blockade` | `{remaining,batteries,disabled}`. Starts with three required batteries; actual battery identities are recorded at their encounter and permanently disabled on defeat. |
| `world.routeProgress` | Normalised authored-group/combat progress. It is a visual route cue, not a countdown or a collision wall. |
| `requiredEnemies` | Set of actual current required identities; only their accepted destruction advances the group. |
| `completedEnemies` | Archive of defeated required identities; no respawning or erasure. |
| `stocks` | All nine power IDs, integer0 or1 each, total at most3 through earned collection. |
| `storm` | Null or actual detached-wing motion/band state described below. |
| `combination` | Null or `{stage,ids,x,y,at,progress,sourcePoses,heavyId}`. Stages `warning/dock/merged/cancelled`; source poses are actual parent transforms. |
| `enemy.objectiveIds` | Original required identities represented by the current actor; a combined heavy retains both parent IDs. |
| `mission.events` | Bounded last12 records `{kind,at,ids,x,y,...}` for combine warning, docking, interruption and completed assembly. |

The model has no DOM, image decoding, audio or browser clock dependency. The caller retains fixed-step accumulation, native safe-area measurement, paused chooser handling and gesture cancellation. `canActivate(...,{ignorePause:true})` must only enable a paused menu; `activate` still rejects until the caller resumes. It does not provide a paused gameplay bypass.

Use `resize(width,height)`, not direct height mutation. It validates at least260×360 and rebases player targets, enemies/committed dive targets, real compound current/previous poses, warnings, projectile origins/history, pickups, hazards, drones, fields, effects, detached wings/band and docking state. Time, HP, stocks, bank and original required identities persist. Recompute the actual DOM control reservation afterward. This prevents a portrait shrink from putting an alive required scout beyond the inherited removal boundary and permanently blocking the mission.

## Finite authored encounters

The first patrol enters after.8s. Subsequent groups require every current required enemy to be defeated. A cleared group earns2.2s relief: hostile shots, leftover rocks and warnings clear; the player can move/collect earned supplies, while combat resource/ability clocks and new fire pause. Storm is the deliberate exception: any detached wings make a harmless.8s return to the current moving sockets during relief; its duration decreases and clears when reassembled. Its band cannot damage or generate charge/supplies in this return. A cleared Ricochet projectile is discarded without refund; its remaining anti-recast timer freezes during relief and resumes in the next encounter. These short rests are not survival gates, arbitrary invulnerability phases or a substitute for combat length.

| Internal group | Visible situation | Finite actors | Consequence |
|---:|---|---|---|
|0|The blocked gate|Two scouts|Learn a committed dive and ordinary fire. Second ordinary destruction can earn Storm.|
|1|Interceptors regroup|Four beetles|Crossing flanks return to fight instead of vanishing.|
|2|Missile escort|Two scouts, two missile frigates|Hold-position launchers require alignment, not merely waiting for a fly-past.|
|3|The crossing screen|Three beetles, two scouts|Combine fixed flanks with committed player-lane dives.|
|4|Wreck corridor|Two beetles, one frigate, three optional rocks|Destructible moving cover; ordinary rock destruction can earn a manual power.|
|5|Armed recovery tugs|Two beetles, two original gunships, two rocks|Distinct broad dual-gun bodies hold the route.|
|6|Recovery pocket|Two frigates, one beetle, three rocks|A second short terrain decision before the blockade.|
|7|Interdiction leaders|Two scouts, two heavier frigates|Damaging a rack removes its actual weapon sources.|
|8|Gate batteries|Three heavy frigate batteries|Destroy all three required blockade identities.|
|9|Command ship|One crescent command ship|Broad ordinary damage, progressive rack loss, then gate opening/extraction.|

At most five required enemies are alive at once; no infinite replacement spawns exist. Rocks are optional physical cover/supplies, not required identities. Enemy-caused rock destruction therefore cannot clear a mission gate. Optional rocks do not secretly block the ordinary victory route.

Two original scouts that remain at least65%healthy and unhit for10s can rally to combine once per group. The visible1.2s warning cancels their pending charges; already launched rounds remain. They then physically converge at an upper22%field docking point using their normal bounded motion. After at least1.8s docking and actual proximity, one gunship assembles with **sum of remaining parent HP plus8/10/12 armour** on Easy/Medium/Hard. It has real paired gunship barrels/fans and2s startup recovery. There is no full-health reset, repeated assembly loop, new body around the hero or free kill/score/loot/charge on merging.

Both original required IDs remain outstanding until the heavy is defeated: its `objectiveIds` carries them, and death awards both objective credits exactly once. The heavy is one actual ship kill. A legal parent hit/kill is processed before assembly at the end of the tick; a missing parent cancels the attempt. `comboSpent` prevents another attempt in the same group. Active early combat can prevent fusion entirely; waiting does not defeat those required identities.

The approximately150–210s pacing is a target for the full sequence, not a forced completion timer. Earlier smaller sequences completed approximately105s, then144–145s in bounded assists; those drafts are superseded. The final authored roles/cadence are measured below. Do not lengthen a future revision merely to hit a clock if the encounter stops being enjoyable.

## Enemy movement, attacks and capability loss

Ships have smooth entry, bounded acceleration/speed and wrapped shortest-angle turns. Required actors remain in view after entry. No teleport/wrap, offscreen firing or invisible replacement credits exist.

- **Scout:** rally, snapshot the player's lane, hold a.65s commitment, dive to55%field height, bank around a side and return to rally. The snapshot does not chase subsequent player motion. Flight stages are `entry/rally/commit/dive/return`, with `commitX/commitY` retained for inspection.
- **Beetle:** bank across a fixed opposing flank, regroup at the upper hold, then reverse. Its path is not the scout's player-lane dive. Stages are `entry/cross/regroup`.
- **Gunship/frigate:** hold their authored upper firing lane with modest drift. Their broad hulls remain vulnerable. They do not sweep past the player and disappear.
- **Command:** a broad slowly translating crescent, using its actual muzzle family and physically empty notch. Its movement is bounded by the rendered width.

Velocities cap68u/s command,80u/s gunships and132u/s small ships; turns cap2.8rad/s. Warnings lock aim once, remain on the actual moving barrel and cancel if the source leaves the visible combat region or a small craft turns away. Source coordinates are rechecked before launch. Early teaching allows one charging enemy, later groups at most two. No dotted warning path is required by the model; render the charged muzzle.

Missile racks use bounded-turn existing missiles; other sources use committed aim or finite fans. A gunship at half HP loses its real right rack (`disabledPorts`), cancels pending charge and provides1.8s recovery. It switches away from full missile capability to a smaller fan. The command loses right outer port at half HP and both outer ports at quarter HP, leaving its centre source. Already launched rounds remain real; destroying a source cancels future work, not every projectile in flight. Broad shared hull damage remains productive throughout—no mandatory pixel weak point, immunity wait or HP refill.

| Mode | Player hull | Hostile speed | Basic tell | Recovery | Hostile cap | Scout / beetle / frigate / leader / battery / command HP |
|---|---:|---:|---:|---:|---:|---|
|Easy|6|175u/s|1.4s|3.6s|18|12 /15 /36 /48 /64 /360|
|Medium|5|205u/s|1.2s|3.1s|24|14 /18 /44 /58 /78 /440|
|Hard|4|235u/s|1.05s|2.7s|30|17 /21 /52 /68 /92 /520|

Missiles add.3s warning. Damaged sources add.7s recovery. Original gunships use the frigate resistance column. These values are applied once, not multiplied again by the lab HP factor. The mission does not increase resistance forever or loop after victory.

## Earned supplies and nine manual powers

`MISSION_POWERS` contains the original seven compatibility IDs plus `storm` and `ricochet`. Durations remain Laser4s, Stasis4.5s, Hyper2.5s, Seeker6s, `spiral`5s, Drones6s and Nova.65s. **In the mission, `spiral` now means Trident guided salvos, not the lab's weaving projectile.** The lab keeps its original Spiral. Ordinary damage still banks reactor energy, drained at the lab's mode rate; powered damage cannot refill its own replacement.

`activate(id)` spends an earned stock first. This preserves existing reactor charge/bank. With no stock, it spends the full100-charge reactor and clears pending bank. It rejects an active same-power recast, unknown ID, paused/lost/won/extraction state, relief or insufficient resource. Different powers can overlap only using separately earned bounded resources, **except exclusive Stormwing**: any other active manual power blocks Storm, and detached Storm blocks every other manual cast. Rejected choices leave stocks, charge, bank and active durations unchanged. The paused eligibility query applies the same exclusivity. No capsule activates itself or erases another running power.

Laser and Hyper are also mutually exclusive so one primary cannot silently consume the other's useful duration. Seeker/Trident are independent secondary batteries; drones remain independent defenders. Payload eligibility requires real free slots before spending: one Ricochet, three Trident, two Seeker, normal primary capacity, and all20 Nova rounds after its bounded nearby-hostile clear. A full projectile budget cannot consume a stock and emit nothing. Same-active reactivation is rejected rather than extending timers without an explicit limit.

| Choice | Mission launch/motion/collision/expiry |
|---|---|
|Laser|Twin real barrel origins, r5 damage2/pierce2;4s primary, each target once per shot.|
|Hyper|Five real-port fan rounds/r4 damage1 at.10s cadence;2.5s primary; no Laser suppression.|
|Seekers|Two focused missiles per.85s, max6 live; real twin origins,420u/s,2.8rad/s guidance for4s, damage3.|
|Trident (`spiral`)|Three forward-fan r4.8 missiles from real alternating ports;540u/s,damage2.5, max9live. Each burst acquires distinct living forward targets where available; unavailable slots remain ballistic. Steering caps2.2rad/s for3.2s; each missile expires3.6s after launch. The rack waits at least.9s between bursts, quantised to primary firing updates. Ordinary primary continues.|
|Drones|Two r6 defenders,6s; real optic UV(.72,.55) at24u is local(+5.28,+1.20), rotated by `−π/2+sin(angle)*.12`. `droneMuzzle(d)` and `d.muzzle` match shot birth/from and banked direction. Orbit, two intercept HP and.6s powered pulses remain bounded.|
|Stasis|4.5s of actual enemy-projectile translation at.32× and rock drift at.45×; no slowed warning/spawn/mission clock.|
|Nova|20 real radial damage3/r5 projectiles, each piercing two identities; clears hostile rounds only within150u at cast. .65s presentation, no direct boss-HP deletion.|
|Stormwing|Thunder-only crossed-target sweep and safe return described below; exclusive with all other manual powers.|
|Ricochet|Real nose launch, bounded reflected piecewise collision and history described below.|

Drop eligibility counts productive **ordinary-player** enemy/rock destruction once. Powered kills, enemy shots, body-contact damage, zero damage and a repeated dead target do not earn these drops. Rules:

1. The second and third eligible destructions, then multiples of three, offer a manual power capsule. First ordinary rock also offers one if the budget permits. Support cadence takes precedence at multiples of four.
2. Power sequence is `Storm→Ricochet→Seeker→Spiral→Drones→Laser→Hyper→Stasis→Nova`, skipping a power already stocked or already on the field. The first eligible capsule is therefore Storm, the next is Ricochet. They are physical pickups and can be missed; guaranteed eligibility does not teleport a stock into inventory.
3. Every fourth eligible destruction offers one support pickup: Repair if hurt, otherwise Shield. No unavailable weapon capsule turns into an extra heal. Support field cap2; shield is one contact for12s, with no stacked shield HP.
4. Total field cap6, power capsule cap2. Stored stock cap1 per ID and3 total. An unavailable capsule remains uncollected until room exists or its22s lifetime expires. It never silently replaces a different power.
5. Pickups have **no attraction/magnet**. They inherit at most22u/s sideways momentum from the defeated object, damp at.4/s, begin falling50–80u/s and accelerate6u/s² up to100u/s. Visible fall and22s lifetime allow intentional interception; passing out of the field can still miss a reward without failing the mission. Collection uses the actual swept item12u/player7u contact only, with no extra7u reach. They score50 on collection. Support restores at most one hull or one shield; there is no passive regeneration.

A charged Shield has an actual31u hostile-projectile interception radius matching its visible armour. The ordinary hurt core and all body contacts stay7u. After one shield is consumed, the next projectile in the **same tick** immediately uses7u; it cannot be absorbed by a vanished outer shield. The brief hit grace remains. The shield impact effect uses the swept contact point rather than the hero centre.

These finite stocks make the new weapons available early without converting every kill into permanent safety. Actual pickup route matters. An automated route may miss the first Storm and collect the later Ricochet; do not report missed capsules as free starting equipment.

## Storm: real wing lightning sweep

`STORM_WINGS` matches `assets/starflight-storm/manifest.json`. Each raster remains52×46.8u on a shared320×288 canvas, but **model wing coordinates are actual inner attachment pivots**, not full image centres:

| Wing | Pivot UV | Neutral offset from rotated body | Tip/muzzle offset from rotated wing |
|---|---|---|---|
|Left|[.40625,.56944444]|[−4.875,+3.25]|[−3.0225,−15.98401937]|
|Right|[.59375,.56944444]|[+4.875,+3.25]|[+3.2175,−15.98401937]|

`wingPoint(pose,offset)` performs the shared rotation/translation. The left/right partial rasters plus central body reproduce the original neutral ship. Draw with each part's own pivot. Drawing a wing at its model attachment with centre pivot would detach the gun from its real source.

`storm={age,life:5.15,stage,origin,wings,band,hit}`. Each wing has `side,x,y,px,py,angle,tip`. Split lasts.45s, an upward sweep3.9s, return.8s. The wings spread toward attachment x30 andwidth−30, lifting42u to clear the reactor/exhaust lane, then rise to y45. The central body and its7u hurt core remain under control. **Thunder is the only friendly attack throughout split, sweep and return.** Activation clears existing friendly projectiles while retaining hostile shots; primary fire (including Hyper/Laser/Spiral), Seekers and drones cannot emit while detached. Any late friendly projectile is also discarded before motion/collision. The wing tip metadata anchors lightning, not simultaneous cannon bullets.

Manual-power exclusivity prevents stocks being spent on suppressed attacks or active paid-for timers silently expiring. A Rapid pickup's remaining duration pauses while detached and resumes after attachment; Shield remains active useful protection. The existing earned reactor bank may still fill during combat; thunder damage itself earns no new credit. On reattachment the primary delay resets to.16s and Seeker delay to.85s, preventing a negative cooldown or queued catch-up burst. Enemy fire and ordinary fire outside Storm are unchanged. A relief return follows the same no-bullet rule.

`band={x1,x2,y,px1,px2,py,r:8,active}` uses the **same actual tip endpoints** that draw lightning. It is a real moving horizontal capsule. Continuous strip and end-cap tests sweep against moving target hull circles/rocks. One upward pass destroys each physically crossed ordinary enemy/asteroid by removing its remaining HP, including Hard beetles and batteries; targets outside the crossed band remain untouched. Command damage is bounded80 per pass, approximately15–22% of its mode hull. The pass grants no energy/drop replacement, cannot repeatedly farm overlap and cannot erase a full guardian. Split and return are harmless.

Return targets the player's **current rotated sockets**, even after movement, rather than the original launch point. The two wings return individually and reconnect; null storm means draw the normal assembled hero. Command defeat forces a harmless return during extraction. Renderer effects may branch/flicker within the band but cannot imply a larger collider.

## Ricochet: physical reflected missile

One activation launches one powered r6 missile at740u/s from the real rotated central nose UV[.5,20/288], with `shot.from`, seeded ±.66rad around the player's upward bank. It lasts at most5.2s and8 wall reflections. Its collider reflects at x10..width−10 and y14..height−38; there is no screen teleport. Current `vx/vy` owns its nose orientation. The renderer anchors the actual projectile nose/core at its physical x/y, not the middle of a long decorative trail.

The shot retains `kind:'ricochet',life,bounces,maxBounces,hitTimes,damageByTarget,touching,segments,trail`. Each step's segment is `{x1,y1,x2,y2,t0,t1}`. Both enemy compound shapes and moving rocks use the segment's actual time fraction. Collision tests follow **each reflected leg**; the diagonal between the frame's starting/ending point is not a valid hit path.

Damage is3 per contact episode, requiring exit and at least.24s before another hit on that identity. Total per-activation damage caps18 per ordinary target and24 command. A stationary overlap cannot repeatedly farm. The projectile is powered, so it earns no replacement energy/loot. Trail is actual reflected history, at most80 points `{x,y,age}` and.55s old; renderers may soften it without inventing a smooth arc through walls.

## Terminal behaviour, effects and verification

Command HP0 immediately clears threats and sets `phase='jump'`, `mission.beat='extraction'`, gate unlocked. The3s harmless extraction allows an opening-gate presentation, then sets `state='won'`, `phase='complete'`, routeProgress1. No next sector or surprise cleanup spawns. The accepted final hit wins before same-tick lethal hostile fire. Loss remains hull0. Pause freezes encounter clocks, moving wings, lightning damage, ricochet legs/trail, warnings, pickups and extraction. A paused chooser must not leak time.

Kills emit harmless `wreck` effects with `ship,role,angle,vx,vy`; these are inherited pose/momentum for the renderer, not new damaging enemy bodies. Explosion/wreck visuals do not award additional score/energy. Root renderer owns differentiated cosmetic breakup using actual ship imagery.

`node --test tests/starflight-mission.test.js` passes28 focused checks. They cover mission/identity gating, passive blocked fusion, scout commitment, source-derived wing tips/return and thunder-only combat, actual crossed Hard hulls/rocks, nine-power resources/pause/expiry, real piecewise Ricochet/exit episodes, exact nonmagnetic pickup contact, guided distinct-target Trident/turn/cooldown/caps, fusion HP/identity/no-reward conservation and same-tick interruption, resize recovery from the formerly broken1000→360u portrait shrink, real drone birth/optic, true one-charge31u shield fallback, terminal ordering and both-height ordinary-input victory. Combined with the lab's35 checks,63 pass. Direct staged damage/resource setup in unit fixtures is not an earned gameplay claim.

Current checkpointE4768589 received one fixed seed7 public-input model assist per mode/height/policy, with no parameter search or resource/position writes. The same visible-target/nearby-drop steering and simple hostile crossing avoidance as the historical runs below was used; ordinary runs never activated a power. Natural contact-collected supplies remain allowed:

| Mode | Ordinary only:613u /656u | Earned powers:613u /656u |
|---|---|---|
|Easy|Won158.33s/167.31s, hull5/6|Won141.04s/152.26s, hull6/6|
|Medium|Won181.82s/187.30s, hull2/4|Won169.73s/158.10s, hull4/3|
|Hard|Won211.92s/213.89s, hull3/4|Won188.77s/185.70s, hull2/4|

Trident stocks were actually used in powered routes; first Ricochet stock casts were14.28/14.62s Easy,19.37/18.07s Medium and23.73/24.08s Hard. Active aiming prevented fusion in these runs; the separate passive comparison did fuse once without clearing a required identity. Model assists do not establish human challenge or browser/native rendering performance. Independent QA owns the final actual control, render and earned-browser receipts.

Historical fixed seed7 model-only input assists on checkpoint85B7068F used120Hz, forward visible-target tracking, simple visible-shot crossing avoidance and nearby physical-pickup steering. They preceded the harmless Storm return, thunder-only/exclusivity, stronger clearing band, nonmagnetic pickups, Trident and scout combination. These older timings must not be relabelled as a re-run of the current checkpoint. They called only public `setTarget`, optional `activate`, and `update`; they did not write position, hull, charge, stocks, timers or objectives. Natural Repair/Shield/manual stocks were allowed and therefore these were not pickup-free routes:

| Mode | No activated power:613u /656u | Earned stocks/reactor:613u /656u |
|---|---|---|
|Easy|Won162.02s/162.99s, hull6/6|Won158.30s/153.42s, hull6/6|
|Medium|Won182.30s/183.94s, hull3/5|Won168.22s/169.38s, hull2/4|
|Hard|Won210.78s/212.74s, hull4/4|Won190.93s/192.61s, hull2/4|

The assist's first reactor readiness was38.75–38.78s Easy,41.77–41.81s Medium and45.48–45.52s Hard. Its earliest collected/cast capsule was Ricochet12.83–13.19s Easy; it missed the first Storm. Powered runs legitimately used8/7,9/10 and9/9 casts respectively, from distinct stocks/reactor fills. These positive model results do not establish human difficulty, touchscreen enjoyment, actual browser rendering, physical-phone frame rate or APK admission. Independent browser controls/ordinary/powered/passive receipts must identify the final source and manifest; human play remains the next calibration step.

The base hook source/geometry hashes are `462E12C1C2FF3613F6E32749C43D65C9813CC89551DEAF167C601B832DDB82DB` / `D73C3F3C62B960749F0FD1AAA014AED70AF5E82EFEC70E7E85CE9E39A5B924DA`. Mission checkpoint is `E47685894361547E25121D04182CF3C9EC2EC9615419294C6BA3A87FA520F79F`; mission tests `FFBCCC31B6830CA4FAED6E2FA22A583CA852EAB0CABFDC22F644C6C3F3D8EB40`. Storm art manifest is `assets/starflight-storm/manifest.json`, finalf790294c…20074. Root owns final rendered-build hashes and browser/release receipts.


## Final independent browser recheck — 2026-10-20

Permanent receipts: `docs/validation/starflight-mission/QA.md` and `report.json` (SHA256 DCEA4F377A4C567515E94D74D44D94588B7B0D33C47FEA4577548835F3926E21). Six phone/mode UI cases and eight bounded Easy routes passed on stable source. All 748 newborn projectiles matched their actual launch origins. Nine powers, occupied Storm sweep/return, physical capsule collection, shield interception/depletion, paused clocks, held-touch resize and Retry passed with no page, HTTP or request errors.

Ordinary-control Easy routes won at 211.26s iOS and 197.37s Android, each with 4/6 hull and zero activated powers. Earned-stock routes won at 162.06s/172.81s with 11/12 casts and actual pickup collection; no resource or actor writes. Passive routes remained unfinished at 240s; idle routes lost. These are scripted browser witnesses, not human balance or physical-handset certification. Files containing `staged` are explicitly seeded effect checks, not earned play.
