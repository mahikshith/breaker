# Starflight combat prototype

This is the standalone direct-flight shooter model on `codex/starship-run-prototype`. It is separate from the five BREACH breaker chapters and their delivered APK. `src/starflight/model.js` contains no DOM, renderer, asset or package dependency. The prototype interface and final art integration are separate work; the model-only checks below do not establish a new APK, human difficulty or physical-phone performance.

The player escorts an evacuation route through three guarded jump gates. Dragging steers the ship directly through the lower 65% of the portrait field. The ship fires automatically. The current revision adds seven earned weapon choices, slow banked reactor charging, new physical ship families and missile roles, destructible moving asteroids and temporary gravity fields. Defeating a gate guardian earns an eight-second danger-free jump, one point of repair and the next distinct formation. Three sectors loop indefinitely with modest per-cycle resistance/speed growth. There is no paid-power requirement or resource shop in this model.

## Interface and coordinates

```js
import { Starflight } from './starflight/model.js';
const game = new Starflight({ width: 360, height: 780, difficulty: 'medium', seed: 1 });
game.setTarget(worldX, worldY); // Also starts movement; finite coordinates only.
game.setMoving(false);        // Release: inertia damps; firing continues.
game.setControlReserve({ x: orbWorldX, y: orbWorldY, r: orbClearance });
game.activate('laser');       // stasis/hyper/seeker/spiral/drones/nova also supported.
game.pause(true);             // Every simulation clock freezes.
game.update(1 / 120);         // Caller owns fixed-step accumulation.
```

Restart by constructing a fresh model. The constructor rejects invalid or smaller-than-260×360 fields, so the actual guardian fits; an unknown difficulty uses Medium. All distances use the supplied logical canvas dimensions. The model does not resize a live encounter. Player starts at `.90×height` and targets clamp to `x=PLAYER_EDGE..width−PLAYER_EDGE`, `y=.35×height..height−38`. Shared `geometry.js` exports `PLAYER_EDGE=SHIPS.player.width*.52`, currently27.04u: this keeps the banked opaque wings inside the screen, exceeding their measured25.996u horizontal extent. Current position, boundary velocity and reactor-target feasibility all use that same player-only edge; enemy positions retain their own limits. The renderer reserves roughly 36 CSS pixels below its playfield and owns the single lower-left reactor control; the model owns neither HUD strip nor menu. Display the small central 7u player collision core instead of implying that transparent fins are vulnerable.

`controlReserve` is optional in the constructor and can be refreshed with `setControlReserve({x,y,r})`; `null` or no argument clears it. It is a circular ship-centre exclusion measured from the actual DOM reactor, not a second hostile hitbox. Convert the control centre to world coordinates using the rendered world origin/scale; include the control's half-width plus roughly24 CSS pixels of ship-hull clearance in `r`. The setter clones finite positive-radius input, returns false without replacing a valid reservation for malformed input, and never changes the ship's current position. Root UI owns measuring this after launch/resize. The model does not infer DOM safe areas.

| Field | Renderer contract |
|---|---|
| `player` | `x,y,px,py,vx,vy,r=7,hp,maxHP,invuln,angle,targetX,targetY,moving`; angle is a visual bank tilt. |
| `enemies` | `id,kind,ship,role,x,y,px,py,vx,vy,r,hp,maxHP,angle,hurt,bornAt,variant,warning`; physical classes remain `scout`, `gunship`, `boss`; `ship` selects scout/gunship/boss/beetle/frigate/crescent; variant is sector 1–3. |
| `enemy.warning` | Null or `{kind,age,life,sources:[{port,from:{x,y},angle,angles}],targetX,targetY}`. Draw every actual source. Top-level `from/angle/angles` remain first-source compatibility aliases. |
| `warnings` | Current enemy warning references for one overlay pass; draw once, not again if the ship renderer already draws it. |
| `shots` | `id,x,y,px,py,vx,vy,r,side,kind,damage,age,powered,pierce,heading,speed,from,owner,port`; `hit` is an internal Set of already-hit target IDs. Homing shots add `turnRate,homingTime,targetId`; spiral adds `wavePhase`. Derive rotation from the actual changing `atan2(vy,vx)`. |
| `hazards` | Moving `asteroid` objects: `id,x,y,px,py,vx,vy,r,hp,maxHP,angle,spin,hurt`; r is the solid body's radius, excluding image padding. |
| `fields` | `{id,kind:'gravity',visual:'wormhole',x,y,r,coreR,age,warning:2,life:7,strength:360}`; forces are model-owned, with no teleport or direct core damage. |
| `drones` | `{id,x,y,px,py,r:6,hp:2,maxHP:2,age,angle,fireAt}`; zero-HP drones are not rendered and are removed on the next update. |
| `pickups` | `id,x,y,r,kind,age`; kinds are `repair`, `shield`, `rapid`, `charge`. |
| `effects` | `{x,y,kind,age,life,seed}`. Kinds include `muzzle`, `enemyMuzzle`, `hit`, `explosion`, `shield`, `hurt`, `jump`, `pickup`, `rockHit`, `rockBreak` and ability IDs. Muzzles add `owner/port`; pickup adds `pickupKind`; rockBreak adds `size`. Drawing must not age or remove these. |
| Progress | `time,sectorTime,sector,cycle,completedSectors,score,kills,rocksBroken,charge,chargeBank,weapon,jumpRemaining`. Sector is 1–3; cycle starts at zero. |
| Status | `state='play'|'lost'`, `phase='combat'|'boss'|'jump'`, `paused` separately. `reason='Ship disabled'` on loss. |
| Timers | `timers={laser,stasis,hyper,seeker,spiral,drones,nova,rapid,shield}`, plus `shieldCharges`; seconds, never wall-clock timestamps. |

`width` and `height` are public, and the selected ID is `difficulty`. `rules` exposes the mode's fixed pressure data. The seeded random stream controls weave phase; the same seed and fixed inputs reproduce the same encounter. The model's substeps are at most 1/120s; one caller update is capped at .1s, and negative, zero, NaN and infinite deltas do nothing. A stalled frame therefore cannot teleport the ship or replay several seconds of enemy attacks.

## Flight and physical damage

Movement uses a damped positional spring: acceleration `140×target displacement−23×velocity`, speed capped at 480u/s. On release, velocity decays at `exp(−16×dt)`. Movement remains two-dimensional, with a small bank response to horizontal velocity. An interpolating renderer can use previous/current coordinates; interpolation must not write those positions back into the model.

Targets covered by `controlReserve` project to the nearest sampled valid circle-edge target within the field. Actual movement uses a swept collision against that circle: inward velocity is removed and remaining motion slides tangentially. If a world-edge clamp would cut the tangent through the control, the ship stays at the contact it actually reached. A newly measured control that already overlaps the ship applies bounded outward acceleration, rather than ejecting it in one frame; the usual480u/s cap remains. Bottom central/right movement remains available. The actor's enemy hurt core remains7u and is not enlarged by this UI clearance.

Projectiles and ships collide as swept circles in relative motion, including a target crossing a fast projectile. `src/starflight/geometry.js` is the shared rendering/physics source: `SHIPS` contains exact manifest UVs/aspects at widths52/40/74/196 for player/scout/gunship/boss; beetle/frigate/crescent keep widths40/74/196 with their own actual aspects and hardpoints. These are the smaller requested runtime sizes; full-resolution source sprites are preserved. `shipPoint(kind,x,y,angle,uv)` rotates hardpoints around the real canvas centre. `shipCircles` provides conservative compound hull bands fitted to delivered solid bounds. These approximate broad metal bodies, not pixel-perfect alpha; thin antennae remain decoration. The crescent's deep lower notch stays open around its real centre barrel. Outer wings and guns accept ordinary damage. `enemy.body/previousBody` are cached compound circles; `enemy.r` is a representative centre radius, not the whole hull.

An ordinary player shot stops at the first physical ship or asteroid encountered, with one HP/charge credit even where one ship's compound parts overlap. A laser can pierce two different targets, once each. Hit effects appear at swept contact. Hostile shots can be absorbed by a nearer asteroid or real orbiting drone before reaching the player; enemy damage never grants player reactor credit. There are no invisible brick barriers, pixel-perfect weak points or required transformations. A body collision costs one player HP and damages an ordinary enemy/asteroid by three without energy credit. A continuous overlap is one body-contact episode, not damage repeated every frame.

All hostile shots that touch the player are consumed, including hits during invulnerability. A real damaging hit gives 1.25s invulnerability, preventing simultaneous bullets from taking several HP. A shield pickup absorbs one contact and grants .35s protection. The player begins with 1.5s protection. The last legal boss hit clears the threat before an incoming same-step lethal shot; completed gates cannot be undone by a leftover projectile.

## Weapons, earnings and limits

| Weapon | Actual model behaviour |
|---|---|
| Twin auto-fire | Two r3.4 shots every .16s, 860u/s, damage 1 each. Always available while in combat. |
| LASER | 4s of twin r5 projectiles, damage 2, up to two distinct targets per shot; .14s cadence. |
| STASIS | 4.5s at .32× hostile-projectile translation and .45× asteroid drift. Enemy movement, warning duration, field lifetime and spawn clocks retain ordinary timing. |
| HYPER | 2.5s of five r4 shots per fan from the actual twin ports, .10s cadence, offsets −.24,−.12,0,.12,.24rad; damage 1 each. |
| SEEKER | 6s secondary battery: up to two guided r5 missiles every .85s, damage 3 each, max six live. Speed420u/s, capped2.8rad/s steering for at most4s; reacquires a live forward target if the old one is destroyed. Ordinary primary fire continues. |
| SPIRAL | 5s of twin r4 weaving rounds every .12s, damage1.4. Actual headings oscillate ±.38rad at9rad/s in opposite phases; visual trails cannot substitute for their physical paths. |
| DRONES | Two r6 orbiting defenders for6s; deploy over.25s to33u orbit, two projectile intercept HP each. Each fires one powered damage1 pulse every.6s. Destruction removes that drone; it does not respawn during the same activation. |
| NOVA | Instant20-round radial damage3/r5 burst at470u/s, piercing up to two targets. Clears only hostile rounds within150u when cast. .65s presentation timer; no global damage or arbitrary boss HP deletion. |

Every activated ability costs the entire100-charge meter and clears pending banked energy. Unknown choice, paused/lost/jump state, insufficient charge or same-active recast returns false and spends nothing. A paused UI chooser must unpause the model before applying a valid selection. A different ability can overlap only after another full meter has genuinely been earned. Hyper takes primary priority over Laser, then Spiral; other secondary abilities do not replace the ordinary primary. Unused timers are not deleted.

Only productive ordinary damage banks .8 energy per actual ship/asteroid HP removed. An ordinary ship kill banks four more, or twelve for a guardian. Visible charge fills from that bank at most3.3/3/2.7 points per active combat second on Easy/Medium/Hard: theoretical minimum refill30.30/33.33/37.04s after enough energy has been earned. Empty bank produces no passive charge. Both visible-plus-pending capacity and visible meter cap at100; no overflow survives spending. Pause/jump/loss freeze filling. Floating-point completion snaps cleanly to100 so the UI cannot strand a full meter at99%.

Destroyed targets, zero damage, body collisions, enemy fire and powered projectiles bank nothing. Seeker/Spiral/Drone/Nova rounds are explicitly powered. A charge pickup banks25 rather than bypassing the time limit. A powered kill that would have dropped charge instead drops Shield, preventing indirect self-refill through its own energy loot. Ordinary primary hits made while a defensive ability is active remain productive ordinary hits.

Each fifth non-boss kill drops the next item in a fixed `repair→rapid→shield→charge` cycle, with at most eight live pickups. Repair adds one HP up to the mode maximum; rapid adds six seconds of .105s twin cadence, capped at twelve; shield grants one hit for ten seconds. Pickups drift at 75u/s and expire after fourteen seconds. Natural pickups can help an otherwise unactivated-ability route and must be disclosed in test reports.

Total live projectiles from internal player/enemy emission are bounded at180; hostile volleys additionally obey the mode budget. Guided player missiles cap at six, drones at two, asteroids at six and gravity fields at one. A volley that would exceed its budget does not emit. At most two enemies charge concurrently. Effects cap at100. Gravity-bent projectile speed is bounded at1.35× its base speed. These are prototype budgets, not measured mobile-GPU limits.

## Authored route and pressure

Wave arrivals are at sector seconds `2,7,13,20,27,34,40`. Each wave contains three/four/five ships on Easy/Medium/Hard, with at most twelve regular ships present. The boss is introduced at 45s, so the first encounter cannot end before the guardian arrives. Existing surviving enemies remain physical during its entry.

1. **Outer approach:** existing scouts/batteries at2/7s teach the direct-flight loop. From13s, later formations mix actual beetle interceptors and missile frigates so first-play variety appears before the first guardian. The first guardian retains its original identity.
2. **Relay corridor:** beetles enter from alternating wings with deeper/faster weaving. Frigates send slower, bounded-turn guided rounds from actual launch tubes. The crescent guardian alternates targeted fans with three fixed-angle lane rays; a temporary gravity field appears at22s.
3. **Reactor perimeter:** mixed missile-frigate/interceptor groups apply sustained resistance. The crescent uses separated outer fans with a real centre gap. Its field arrives at16s; this is a different pattern/timing, not only recolouring/HP.

Warnings lock intended aim at their start and stay attached to each moving real muzzle. The UI uses physical muzzle charge/bloom, never dotted lines over the field. `sources[].angles` still defines actual launch directions for physics/QA. Beetles alternate their two real mandible guns. Existing gunships cycle left/right/paired fans; frigates cycle actual left/right/paired launch racks and all six measured tubes over successive volleys. Guided enemy missiles steer at most.9rad/s for1.8s, then remain ballistic; they are slower than basic rounds by35u/s and gain a longer charge tell. Guardians cycle left/right/paired/centre, with four total rays for paired fire rather than a continuous wall. Ships finish entry and blend into lateral motion before firing; scouts fire only above38%field height.

Asteroids arrive at9,18,29,38s: two per arrival in sector1, three later, with live cap6. Their solid radii16/21/26u have mode-scaled HP, drift74/83/92u/s by sector and bounded sideways motion. They physically block both sides' shots; breaking one awards30score plus actual-damage score, increments `rocksBroken`, and does not masquerade as a ship kill or grant infinite loot.

A field chooses a far candidate position with at least36u between the player's current core and its outer edge. Radius is at most80u, actual size visible in the renderer. Two seconds of warning precede a .4s force ramp, and the final .5s fades it out; total life7s. Bounded360u/s² pull falls to zero at the boundary and bends ships, shots and (more weakly) rocks. Player input/speed remains authoritative enough to escape. The core causes no direct damage, instant death, charge loss or forced teleport. Fields disappear on earned jump; pause freezes them.

| Mode | Player HP | Ordinary enemy HP multiplier | Hostile speed | Basic tell | Recovery/cooldown | Guardian HP | Hostile shot cap |
|---|---:|---:|---:|---:|---:|---:|---:|
| Easy | 5 | 1.15 | 185u/s | 1.15s | 2.8s | 220 | 30 |
| Medium | 4 | 1.5 | 220u/s | 1s | 2.4s | 280 | 38 |
| Hard | 3 | 1.8 | 250u/s | .9s | 2.1s | 340 | 48 |

Guardians and missile frigates add.3s to the tell; guardians use cooldown minus.6s, others plus.25s. Scout base HP is five, gunship fourteen, rounded up after mode/cycle scaling. Each complete three-sector cycle adds18%base resistance and8u/s hostile speed; scout descent adds5u/s. Interceptors additionally descend16u/s faster than ordinary scouts. This is an endless score chase, not a promise that an arbitrary later cycle remains equally forgiving.

## Gate, loss, pause and retry

On guardian HP zero: award the kill once, clear enemies/shots/warnings/rocks/fields, increment `completedSectors`, enter `jump` for eight seconds. Movement, existing drone orbits and surviving pickups can continue; new fire, bank filling and ability timers pause. At jump end—not its start—advance the sector, reset the authored schedule, repair one HP up to maximum and grant1.5s protection. Sector3 advances to sector1 with `cycle+1`.

On player HP zero: state becomes `lost`, movement stops and subsequent `update` calls freeze. No automatic revive, paid continue or hidden stat reset exists. The outer UI owns the loss screen and creates a new model for Retry. Pause returns before movement, animation clocks, warnings, shots, charge, drops or phase clocks; the UI should also stop its held input and pause button gestures must not steer the ship.

## Verification and current limits

`node --test tests/starflight.test.js` currently passes35 focused checks: responsive bounded motion; actual new/old manifest anchors; broad hull/crescent-notch collision; swept fast/moving target hits and cover; contact episodes; all seven power limits; homing steering; physical weaving; drone interception; bounded Nova; no self-refill; bank timing; pause of active fields/drones/rocks; gravity warning/escape margin; hazard destruction; deterministic subdivision; difficulty data; phase/terminal precedence; and a first-gate route. Five newer checks verify smaller ship sizes, cloned/validated reservation input, swept control avoidance at613/656u heights, maximum movement distance, the bottom central/right lane, gradual recovery from a newly overlapping control and pause. The shared wing edge is checked at260/360/412u widths for target clamp, every movement sample, outward velocity cancellation and reservation feasibility. The Easy input-only route uses no activated ability, with natural pickups allowed.

Final model/geometry checkpoint: `model.js` SHA256 `6AA76B7B6D7C54E91C369BCF845F418F7EC56E3F57499D226E2CB0276921CF4A`; `geometry.js` `D73C3F3C62B960749F0FD1AAA014AED70AF5E82EFEC70E7E85CE9E39A5B924DA`. Browser/native receipts must identify whether they include these smaller widths, wing clearance and actual DOM reservation. Earlier larger-ship runs do not automatically prove the final layout.

The following bounded seed-7 assists are retained for calibration, **before the final smaller geometry/reservation revision**. They used120Hz simulation, visible forward-target tracking, simple near-future visible-shot/asteroid avoidance and only public `setTarget`, `activate` and `update`. They never wrote HP, positions, charge, timers or boss state. The powered policy selected successive earned `seeker,spiral,drones,nova,laser,stasis,hyper` choices. One attempt per mode/height/policy was made; natural pickups are disclosed:

| World height / policy | Easy | Medium | Hard |
|---|---|---|---|
| 613u, no cast | Gate62.07s, HP2, repair | Lost58.97s; guardian110HP, repair+rapid | Lost52.16s; guardian258HP, repair |
| 613u, earned choices | Gate62.07s, HP2, one Seeker; repair | Lost58.97s; guardian100HP, one Seeker; repair+rapid | Lost60.14s; guardian154HP, one Seeker; repair |
| 656u, no cast | Gate62.27s, HP2, no pickups | Gate67.78s, HP1, repair | Lost60.28s; guardian156HP, no pickups |
| 656u, earned choices | Gate62.27s, HP2, one Seeker, no pickups | Gate67.15s, HP2, one Seeker; repair | Lost57.74s; guardian183HP, one Seeker, no pickups |

First earned readiness was32.66–32.86s Easy,35.54–35.65s Medium and39.67–39.71s Hard. This is the slow banked economy, replacing earlier rapid refills. These logical heights approximate the actual shorter phone fields; a default780u simulation alone is insufficient layout/balance evidence.

One additional bounded left-wing aiming tactic, saving Laser until the guardian, preserved the same failed cases:613u Medium lost62.07s with17 guardianHP;613u Hard lost52.16s with191HP;656u Hard lost60.28s with85HP. Matching no-cast wing attempts also lost, with79/264/167HP remaining. No further parameter/seed search or silent balance change followed. These are limitations of the tested policy/current pressure, not proof that a human cannot win. Medium on the shorter field and Hard remain pending calibration and human attempts.

Historical receipts at780u, before the late-sector1 family mix, also remain informative but superseded: no-cast first gates62.81/67.64/73.13s (Easy/Medium/Hard). Powered three-gate Easy completed203.47s/HP4/five casts; Medium218.69s/HP1/five casts; Hard lost188.13s in sector3 after two gates and four casts. These naturally collected pickups. Earlier three-choice economy/hardpoint receipts—first gates50.98/53.24/52.43s, powered50.25/50.41/49.40s, three gates165.04/165.18/167.79s—belong to the preceding weaker revision. Its10.51–16.30s recharge measurements are historical and do not describe the current bank. Centre-radius prototype receipts52.47/54.59/54.06s are older again.

The guardian first appears at approximately45.01s; final geometry's route/pacing must be measured rather than inferred from those historical wins. Model assists do not establish human challenge, touchscreen feel, native frame rate, screenshot quality, a pickup-free ordinary-only route, or APK admission. Before prototype release, the renderer owner must verify actual ship pivots/hitboxes and DOM control clearance at393×852 and412×915; readable moving muzzle/shot continuity; touch cancellation; all seven choices; projectile/effect budgets; pause/Retry with no stale input; three-sector transitions; font/decode readiness and page errors. Retain unsuccessful attempts with successful receipts.
