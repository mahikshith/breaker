# Invasion rescue layouts — two proposals

**Latest review state:** all four polished space boards are approved as levels; A/B LEFT-playfield assets are production first. Companions/pilots/portraits are frozen, and no additional board choice is pending. See `space-direction-review.md` and `space-assets-ab-spec.md`. Native saucer-proxy 113/97-cell studies, their HP/deadlines and earlier B-only cast selections below are historical, not current geometry or mechanics approval. Current tested EA839F00… runtime is unchanged; no new encounter/build/APK is claimed.

**A/B asset proof:** the approved left-playfield PNG/Canvas-motion tranche is complete, with actual 393×852/412×915 captures and A/B motion GIFs under `out/space-assets-ab/final/`. See `space-assets-ab-spec.md` and `art/space/ASSETS_AB.md`. Companions stay frozen. No new encounter runtime, packed WebP family, collision/gameplay/balance or APK is implied; discarded layout rules below remain history.

Historical status below: **superseded native layout study, unselected for production**. The 113/97-cell maps, HP, clocks and laser rules below remain proposed experiments; none is an approved property of the polished A/B assets. Current production remains accepted build `EA839F00A4683BD3CFD05CB87BDE6DA4B79EDFFF0191621362FB90A75FF9FBAC`. The current all-four approval and A/B asset-first scope are stated above.

Both replace the framed hangar with **full-screen dark space**: Saturn, rings and nebula continue behind the entire play area, without window frame, sill, lower wall furniture or glow. Preserve the current near-black background contrast so bricks, crew, ball and weapons lead. There is **no Lumi or Kit** in this mode. Existing Clank faces identify the crew to save; existing mothership art is an explicitly temporary escort/crew-hull proxy.

**Recommendation: B / Relay Rescue** continues the already selected Relay Raiders direction. Its three pods make persistent rescue progress clear. A / Convoy Breakout is the smaller implementation: three stationary lock bricks instead of sliding targets. Neither imports the unselected CarrierA cast or promises Vesper/Latch assets that are not ready.

Images are being authored from the exact layouts below: `img/invasion-rescue-a.png` and `img/invasion-rescue-b.png`. Numeric callouts belong on the review board, outside the phone; do not turn them into permanent gameplay copy.

## Shared play envelope and readable pressure

World width360u. Use an11×18 grid,28×18u cells, origin `(26,92)`. Static bricks end at **y416u**. The field does not march downward in these proposed rescue variants; the gunships move instead. This avoids shrinking the newly approved return lane. The current Invasion's marching-formation→mothership encounter is preserved in active source until a pick.

| Constraint | iPhone 393×852, safe59/34 | Android 412×915, safe32/24 |
|---|---:|---:|
| Paddle top,126CSS reserve |614u |675u |
| Normal vertical ball gap below deepest brick |186u |247u |
| Free flight at345u/s |.539s |.716s |
| Free flight at441.6u/s |.421s |.559s |
| Fast TITAN free flight, radius10u |.403s |.541s |

These match the accepted Vault-like bottom-row windows. They exclude intermediate collisions, spin, hit-stop and human decision latency. Do not put extra bricks, pods or solid ships below416u just to fill space. Main aiming routes have at least56u of width; the two-row escort bands are36u high, with hulls centred between them. A normal ball is12u across and TITAN20u.

Use one brief **“Free the crew”** cue beside the objective for about1.4s, plus three crew/lock icons. The visible jump/relay closure communicates the deadline; do not hide a100/110s fail rule behind an otherwise motionless scene or add a permanent bottom instruction/timer sentence.

Two optional **6HP gunships** fly along `(58..302,218)` and `(58..302,308)`, using48×22u collision envelopes. Their patrol periods are8.0/9.6 gameplay seconds and opposite starting phases. A ship brakes when its warning begins, locks that firing x, and resumes flight after recovery. Its normal/FIRE/TITAN/LASER damage is1/3/4/1, reusing current ship behavior. Defeating one removes that hazard; it is not another mandatory health gate.

| Laser phase | Proposed first-stage value |
|---|---|
| Introduction | No live laser for the first10 gameplay seconds after serve. |
| Warning |1.1s, thin dashed lane and barrel anticipation; x locks at warning start. No last-moment retargeting. |
| Fire |.18s,8u width, one collision resolution per volley. |
| Recovery |.9s, visibly cooled barrel and resumed patrol. |
| Global separation |At least3.2s between volley starts; **only one ship can warn/fire at once**. |
| Cover |Ray ends at the first occupied brick. Show the impact there; the enemy beam does not secretly pass through opaque cover or destroy it for the player. |
| Unprotected hit |Reuse the existing bolt's.7s paddle stun; no direct life deletion or ball vaporization. |

For the worst centred8u beam, include an8u buffer beyond the actual paddle width. A normal74u paddle has safe centre intervals47..131 and229..313u. WIDE114.7u has67.35..110.65 and249.35..292.65u: each contains a43.3u continuous safe movement interval. These are geometric slots, not a promise that simultaneous ball catching feels fair. The first prototype must test that pressure; never add overlapping beams without a new clearance test.

### Earned power rules

Every marked power brick has an authored payload: **LASER, SPLIT or SHIELD**, using the existing pickup/duration behavior. Disable random drops for this first test so the cause and rewards are reviewable. No paid power or new currency is needed. Normal balls can damage every required lock at all times; LASER/SPLIT/TITAN help open routes and create more chances.

**Proposed new SHIELD interaction, not current behavior:** existing SHIELD supplies two charges for16s and currently saves missed balls only. In this proposal an incoming enemy laser/bolt is intercepted visibly at `paddle.y−10u`, **before** it reaches the paddle/stun test, and consumes **one of that same charge pool**. That charge is gone and cannot also save a missed ball. The existing missed-ball save plane remains `paddle.y+18u`; no free second shield, hidden immunity or duplicated charge is granted. A volley can spend at most once. Deterministic same-frame ordering must be tested after implementation.

## A — Convoy Breakout

**Save three captive Clanks aboard one locked crewship.** The hull is at `(180,118)`,116×44u, with three readable crew windows. Its friendly body has no damaging ball hitbox. The player breaks the **three tow-clamp housings**, not the crew or their faces.

Three3HP clamp bricks sit at row4, columns2/5/8: world centres `(96,173)`, `(180,173)`, `(264,173)`. They remain damageable by ordinary balls and existing weapons. Each destroyed clamp visibly releases one tether/window light. All three are required; optional bricks and escorts are not.

| Starting matter | Count |
|---|---:|
| Static brick cells |113 |
| Grid HP, including all three clamps |143 |
| Candy / armour / clamp cells |88 /12 /3 |
| Authored power bricks |10:3LASER,4SPLIT,3SHIELD |
| Optional moving gunships |2,6HP each |

`c`=1HP candy; `a`=3HP armour; `K`=3HP required clamp; `L/P/S`=1HP LASER/SPLIT/SHIELD brick; `.`=empty. Rows6–7 and11–12 are deliberately empty ship bands.

```text
ccc.....ccc
cac.....cac
ccc.....ccc
ccca...accc
caKccKccKac
.Lccc.cccS.
...........
...........
cccca..accc
ccPcc..cPcc
cccc..acccc
...........
...........
cccc..acccc
ccLcc..cScc
ccca...accc
cPccc..ccPc
.ccS...Lcc.
```

Power cells `(column,row)`:

| LASER | SPLIT | SHIELD |
|---|---|---|
|(1,5),(2,14),(7,17) |(2,9),(8,9),(1,16),(9,16) |(9,5),(8,14),(3,17) |

**Critical/golden path:** lower left/right rewards → central56u corridor → first clamp → choose a side bank route or SPLIT cache → remaining side clamps → visible crewship departure. A player may finish with ordinary shots; upper rewards are optional detours. The normal-hit cell-cost graph finds individual clamp routes at4/3/4 hits; it does **not** mean a four-hit stage clear. Three separate3HP targets alone require at least9 normal hits, and actual trajectories/returns must still be played.

**Restriction and fail:** proposed100 gameplay seconds after first serve to free all clamps, or existing three lives exhausted. A physical jump ring charges behind the locked crewship, pulsing during its final quarter; this is a proposed diegetic deadline, not an invisible surprise. Pause/menu freeze it, Focus slows it with world time. On the third clamp, stop pressure immediately and show the crewship depart before results. No late exit-animation timeout can turn a completed rescue into failure.

## B — Relay Rescue

**Save three captive Clanks in separate pods and open the escape relay.** Pods are at `(82,120)`, `(180,120)`, `(278,120)`, each40×40u. Friendly crew bodies do not take hits. The player damages the **lock housing below each pod**, and each release persists.

The three2HP lock housings are28×12u at nominal x82/180/278, y155. They slide±18u on visible rails with4.8s periods and phase offsets0/⅓/⅔. For introduction they stay stationary until the first valid lock hit, then begin sliding; they are always damageable, with no invulnerable shutter cycle. A missed opportunity returns normally. Pods do not have to be hit after their lock breaks.

| Starting matter | Count |
|---|---:|
| Static brick cells / grid HP |97 /119 |
| Candy / armour cells |72 /11 |
| Separate dynamic lock housings |3×2HP;6HP total |
| Authored power bricks |14:5LASER,4SPLIT,5SHIELD |
| Optional moving gunships |2,6HP each |

```text
c..c...c..c
a..c...c..a
c..c...c..c
...........
cca..a..acc
.LScc.ccSL.
...........
...........
ccPcc..cPcc
cccaa..accc
cScc..cccLc
...........
...........
ccc..accccc
ccLcc..cScc
ccca...accc
cPccc..ccPc
ccSc...cLcc
```

Power cells `(column,row)`:

| LASER | SPLIT | SHIELD |
|---|---|---|
|(1,5),(9,5),(9,10),(2,14),(8,17) |(2,8),(8,8),(1,16),(9,16) |(2,5),(8,5),(1,10),(8,14),(2,17) |

**Critical/golden path:** opening rewards → first stationary housing hit teaches the target → first crew release → side lock timing while one escort warns → choose a LASER/SPLIT route or disable one6HP escort → release final crew and open the ring. This starts the selected Relay Raiders rescue identity without shipping Vesper/Latch's unfinished cast or earned Clamp ability. Those remain separate future proof/integration work.

**Restriction and fail:** proposed110 gameplay seconds after first serve to release all pods, or three lives exhausted. The relay ring visibly closes during that window; give the same final-quarter physical warning. Stop pressure on the third release and show the crew pass through the open ring before results. Ordinary balls can always finish. Cell-cost reachability to the nominal lock rails is finite at four normal hits per target including the housing; this does not model moving timing or establish a full-run completion time.

B has more authored power targets to support its timing challenge. That may create excessive LASER/SPLIT uptime; pickup saturation is a specific first-playtest risk, not proven difficulty. Do not quietly lower rewards or inflate lock HP before observing the selected prototype.

## Attempt, Continue and Retry rules

Start the mission clock **once**, on the first released serve of an attempt. A later life/serve does not reset it; it continues while the player re-aims. Menu/pause freeze it and Focus applies the same world time scaling. Resolve the third successful rescue before checking expiry in that step, so a completed rescue cannot fail during its departure animation.

Continue retains cleared bricks, broken locks/released crew and escort state. Restore remaining mission time to **at least30 gameplay seconds** (`max(currentRemaining,30)`), cancel any active warning/beam and give2 gameplay seconds of warning grace. Reuse the existing fresh serve plus two SHIELD charges lasting10s; do not invent a new power/currency grant. Thus an expired clock cannot immediately fail again after Continue. Retry is a fresh attempt: reset all layout/objective/hazard state, full deadline and the first-serve flag.

## Reproducible data and next gate

Exact data and checks are in ignored `out/invasion-rescue-options/layouts.json`, generated by `build-layouts.mjs`: grids, HP counts, every power's cell/world centre, crew/lock bounds, gunship routes, laser timing, safe-centre intervals and metric limits. It confirms row lengths, deliberate power counts, empty flight bands and finite cell-cost paths. No production source changes were made.

After the owner's image pick: implement only the selected first-stage prototype, prove normal-ball rescue without purchases, and play full runs at both phone sizes. Required checks include objective hit ownership, no lock softlock, beam warning/cover/one-hit accounting, shared shield spend ordering, visible rescue/failure, retries/Continue state and lower-lane safety. Then show actual play screenshots and motion before commit/push. These boards and calculations are neither shipped gameplay nor human balance validation.
