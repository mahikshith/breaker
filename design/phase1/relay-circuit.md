# Circuit Breakout — broad hits and earned space powers

The owner's latest feedback supersedes the tiny ordered-symbol implementation. Circuit remains the selected Level2 direction, now with a broad mothership HP route, uniform colourful breakables, much less grey armour and the shared existing Nix power picker. Escort remains deferred to a later, unassigned level. No worker-rescue goal or new companion art is added.

**Current capped Easy receipt:** The final selected HTML is `31FD49E80D9E0299403914A2D8479E49D3D0E899818170538276639B3CCFF08F`, with unchanged Relay source `35C10FD3FF37D1187428355203854545F64DD06ABC7B8F12595A035E28367127`. Shared limits are now Easy/Medium/Hard12/9/5 live balls,2/2/1 cosmic balls and20/18/14s maximum remaining special duration; recharge remains18/22/26 earned credits and minimum active seconds. One existing coarse Easy policy attempt on each phone won: iPhone34.8917s and Android52.7583s, both3lives and zero page errors. Both earned one FIVE choice at19.50/23.39s; natural capsules were SPLIT+LASER on iPhone and SHIELD on Android. No Retry, Continue, route search or tuning was used. Final result screenshots were viewed. Exact report/start-end hash seals are in `out/space-selected-review/circuit/earned-easy/`. This proves bounded assisted Easy recoverability, not human balance or Hard admission.

**Initial selected plasma and final chrome receipt:** HTML `5133A5E384CBF024DF87EC228BF7918D9BC395F4FE97C0342EFEDE27149088D3` precedes the final shared power-cap rebuild above. Shared GFX `743DCA51B28CBBCCF0BFBC35C2F3E25C4610EEBEB89AB478D1D4575321EC938A` uses1.1 visible heights for the cap boundary, capped at25% of visible width. Both phones passed all four WIDE tiers and launch/return in `out/space-selected-review/circuit/wide/report.json`; actual max-width and morph images were viewed, with the full inner chrome bevel retained. The former9BA578 render study and all4187 pacing receipts remain unchanged.

**Current pacing revision:** the owner found the6-hit/18HP Easy build too brief. The paced candidate keeps broad hits productive, uses72/96/120 hull HP and18/22/26 banked contact credits with smooth active-time recharge. Powers retain their requested strength and stacking. The old4186 build983C8C remains frozen as history, as does the4187 pacing study. The owner selected ShipFX A; the new isolated candidate uses its shared plasma renderer with unchanged3.5u collision radius. Stronger level-specific Hard patterns remain proposals awaiting images and a pick.

The former4184 preview is preserved byte-for-byte at `out/relay-circuit/circuit.html`, SHA256`9115383E4F4963F86C11A7063A07A50B10FC1B7347F5425AC4C972D39202FDCE`. Its ordered targets, old controller results and proofs are history. Additional source/test/design snapshots are under ignored `out/space-power-review/history/`. The earlier six-hit candidate is frozen at `out/space-power-review/circuit/circuit.html`, served through `http://127.0.0.1:4186/circuit.html`; the current paced candidate is the4187 build above. This level work does not alter the permanent Main registry, shared source, production HTML or APK.

## Current play loop

Break through the colour field and hit the actual mothership. Ordinary contacts anywhere on its visible hull, closed iris or mounted cannon metal reduce one main HP pool. These broad surfaces rebound physically while HP falls; there is no symbol order, required badge, timed precision gate or separate post-rescue grind. Even a disabled cannon remains a productive mothership hit. A ball touching overlapping cannon/hull geometry in one tick damages/charges the boss only once.

Station frames below the mothership are optional, genuinely breakable armour. Their whole visible metal contours own their HP; their empty/holographic windows retain real holes. Normal balls can break them without waiting for a warning. LASER deals one damage per real pulse; UNSTOPPABLE deals four and pierces closed station metal and grey pieces. A destroyed station disappears with a brief impact cue and ceases collision/hostile cover. Cannon HP controls whether it fires; damaging its body also damages the mothership. Removing guns or stations is useful, never an extra win requirement.

Half mothership HP earns the once-only skiff burst:0.45s morph,10/9/8 active seconds in Easy/Medium/Hard, then0.45s safe return. It replaces the paddle and uses the same drag. Reviewed upfield rail emitters shoot toward the broad mothership, live guns, stations or cover within an18° cone; the actual first obstacle absorbs a pulse. The real ball objects are stowed, with one small visual ball seated behind the nose lip. A hostile craft impact ends the bonus early with a safe serve rather than taking a surprise life. The last mothership HP atomically ends combat, cancels late shots/misses and opens the iris for a quiet1.7s ending.

## Layout and mode values

-30 panels in six columns/five rows. **26 coloured panels have identical48×17u visible bounds and1HP. Four grey17×17u armour pieces have2HP.** The grey pieces replace individual cells rather than creating extra walls. Previous14grey/16colour irregular panels are superseded.
- Panel cells begin atx21+54c,y294+21r; deepest panel bottom is395u. The lower return lane stays clear. Retain the approved B materials, hull/iris silhouettes, four station positions, actual alpha holes,125×29u paddle,8u normal ball and126CSS lower reserve.
- Authored LASER, SPLIT and SHIELD capsules are in panels8,19,25 and drop once. Existing capsule effects remain optional. Nothing requires a purchase or paid Continue.
- Gun ports still visibly move their real metal leaves18u each during their warning; projections fade fully off before firing. Actual reachable paddle-angle sweeps clear the open port. Bolts stop at real intact cover without damaging it or generating charge. Cover that the player removes no longer absorbs the shot.
- Station windows contain clearly holographic cyan/violet coils, not hidden solid cartridges. Required tiny rim badges and header symbol sequence are removed. The minimal top strip now shows broad mothership HP.

| Initial playable tuning | Easy | Medium | Hard |
|---|---|---|---|
| Mothership HP |72 |96 |120 |
| Optional station / gun HP |2 /3 |3 /4 |4 /5 |
| Warning / next-volley spacing |1.8 /5.5s |1.5 /4.5s |1.3 /3.8s |
| Bolt speed |210u/s |240u/s |270u/s |
| Earned skiff duration |10s |9s |8s |

These are starting values. Easy recoverability is tested below; mode balance and human reaction comfort are not certified.

## Shared Nix contract

Constructor sets `spacePowers=true`, `coreMode='manual'`, and `coreHits=difficulty(mode).companionHits` (18/22/26). Every productive ordinary HP contact calls shared `chargeSpacePower(ball)` once. A partial armour hit counts; destroying the same piece adds no duplicate charge through `brokeBrick`. Valid damage banks contact credit, then the orb transfers at most one credit per active second; a full refill therefore needs at least18/22/26 active combat seconds as well as the corresponding earned hits. There is no passive free charge, hidden discarded valid hit or bank overflow after a cast. Shots, craft pulses, active TITAN contacts, enemy hits and spent optional armour cannot farm credit. The broad mothership route remains productive until final HP.

The existing52CSS Nix face renders through inherited `drawDeck` outside the playfield clip. Full charge opens the shared slide-up LASER / UNSTOPPABLE /5BALLS picker. Opening does not spend; one valid choice spends once. `spacePowerAvailable()` permits choices only during ordinary live `relay` combat, including a caught serve, rather than during morph/flight/ending. Craft drag remains available while the picker is unavailable.

`update()` returns before **all** clocks/physics/powers if `powerMenuOpen`. Pointer gestures do not alter the level under the modal; `key()` delegates to the shared handler so1/2/3 choices, K-close and consumed held-Space releases work. Main owns the actual safe-area touch routing, modal dismissal, pause/Retry and input epochs. The level never substitutes an invisible clickable orb for the actual decoded face image.

## Ownership, clocks and recovery

Gun warning, moving metal, bolt travel and skiff duration use active real seconds through Focus, SLOW and hit-stop. Ball/shot target velocities compensate for their simulation time scale. True pause/background and the power picker freeze active time without catch-up. Initial serve auto-launches after8s; fresh/returned serves after3s.

Morph/flight/return preserve the exact live ball identities, radii, each TITAN duration, FIRE, SLOW, WIDE, SHRINK, LASER/cooldown, SHIELD/count and Focus count. Capsules caught during flight queue once and apply after the safe return is launched; ordinary SPLIT children retain8u radius. Surviving balls return as a safely positioned caught fan; stale pointer/Space releases cannot launch it. The Nix charge survives the role change and becomes usable again on ordinary return.

Repeated powers use the shared stacking behavior: durations add, another5BALLS adds four ordinary balls within the existing cap, and repeated WIDE advances width tiers. Active TITAN uses the existing shared cosmic sprite/halo/ghost through `gfx.drawBall`; ordinary balls retain the approved B raster. Normal and morph/return paddle rendering use shared `drawStretchPaddle`, so the visible WIDE paddle spans its actual collider rather than being constrained by height-fit.

Loss freezes combat. Continue retains main HP, optional hardware HP, broken panels, consumed caches, charge and whether the once-only skiff reward was spent. It clears the failed volley, gives a fresh serve and3s enemy grace. Retry creates a fresh same-mode level. Hull0 wins before a same-tick last-life drain in either ball iteration order.

## Sources and art

Runtime:`src/relay.js`. Tests:`tests/relay.test.js`, `tests/relay-review.test.js`, adapted `tests/circuit-review.test.js`. Existing measured B machinery and the seven reviewed Circuit parts remain unchanged. The local source plates and normaliser are under `art/space/circuit/`; canonical metadata-free parts are under `assets/relay-circuit/`.

Craft source cells are512×384 displayed80×60u. Each flight/bank pose has its own measured muzzle/cradle UV and foreground lip patch. The visual3u stored-ball icon does not resize the stored physics ball. Original normalized geometry/anchors remain authoritative after the seven lossless runtime textures are sized to at least3pixels/u (242,228 encoded /820,908 decoded RGBA bytes). `tools/relay-circuit/data.mjs` validates source/runtime/manifest hashes.

`tools/relay-circuit/build.mjs` copies the fresh actual Main to a chosen isolated output folder, resolves source imports at that depth, embeds Circuit data, keeps one preview card and removes unrelated card peeks. Its default output is now `out/space-polish-review/circuit`; it does not overwrite the preserved4184 or4186 snapshots. The result caption remains `MOTHERSHIP DOWN!`.

## Current proof and limits

Working source after selected plasma integration:`35C10FD3FF37D1187428355203854545F64DD06ABC7B8F12595A035E28367127`.
Working isolated HTML after shared caps:`31FD49E80D9E0299403914A2D8479E49D3D0E899818170538276639B3CCFF08F`. This is not an APK seal. Earlier plasma/WIDE captures retain their own5133A5 hash.
Pacing receipts use `7909F5E559A711918AAABE66CC7F8DE6AE52DC38EA7872E73AD8DC0A5E03E6E6`, source`C3B96BB9FC6D6B05D439E7218184F6B98BC7D47D50654C673015F03E039B855C`; subsequent changes correct WIDE drawing/callers and replace only the enemy bolt appearance.
Asset manifest stays`1A719E78B2BAE0ECC3A96AEE7475C6075A1B4D5227B9F1ABD31824ABDC084758`.

22 focused tests pass. They cover the broad normal-circle route, live/spent cannon hits and boss alias deduplication, powered armour, no overlap farm, uniform panels, mode-sized banked credit/active refill, modal freeze/keyboard delegation, aperture/rails, cover, Focus/SLOW/hit-stop sweep alignment, exact flight ownership/queues, safe return, Continue and same-tick final precedence. Extended HP remains damageable throughout; the half-health reward occurs once. Actual paddle draw-command bounds cover1×/1.55×/2.1×/field maximum and both morph directions. Obsolete ordered-symbol assertions were archived. The prior170-test/983C8C receipt is historical, not the seal of the paced revision.

`tools/relay-circuit/coarse.mjs` runs a target-agnostic Easy controller. It reads only balls/paddle/time, forecasts floor returns and rounds paddle goals to16u; there is no collision/target solver or HP/position/lives/resource write. Charge comes from real damage, and Nix activation/choice use actual browser touch. It asserts the actual decoded1024×768 Nix atlas draws52CSS inside the safe lower corner before proceeding.

| Coarse Easy calibration | iPhone | Android | Interpretation |
|---|---|---|---|
| Original18HP /instant6-hit refill,983C8C |16.52s |20.33s |Owner rejected the short encounter/rapid chain; retained under `out/space-power-review/circuit/coarse-titled/` |
|72HP /instant18-hit credit |31.23s |37.51s |Missed the desired duration; retained under `coarse-72/`, not silently treated as final pacing |
|72HP /smooth18-credit refill, first FIVE |34.89s |52.76s |One genuine Nix choice each at19.50/23.39s; no1–2s refill chain |
|Same paced rules, first TITAN |34.28s |73.37s |iPhone's favourable SPLIT+LASER route remains quick; Android's single-ball route lasts longer with two separated casts |

All four paced runs won with3lives and zero page errors. They use actual damage, actual browser Nix taps/choices and unchanged start/end7909F5 hash; no HP/position/lives/resource writes or Continue. iPhone naturally caught SPLIT at12.68s and LASER at16.02s; Android caught SHIELD at17.02s. These are power-assisted coarse earned runs, not strict ordinary-only or unaided human trials. The owner-facing target was roughly45–75s; the slower refills meet the underlying chain concern, while the iPhone pickup combination remains faster than that target. Root accepted this honest route variance before further human play, with no further HP/loot inflation or power nerf.

Reports/media:`out/space-polish-review/circuit/coarse-smooth-72/` and `coarse-smooth-titan/`. Cosmic TITAN is visibly captured in `coarse-smooth-titan/ios-earned-choice-1-titan.png`. Staged actual WIDE native bounds are in `wide/report.json`: both phones, four tiers plus launch/return, zero errors. Android's fractional horizontal centring is included in expected coordinates; measured visible edges agree within0.02CSSpx. These are browser draw-command/visual checks, not physical-device pixel or performance certification.

The previous ordered-mode50/28s and precision-assist claims do not certify this new design. Shared paced three-level/modal review and the review hub are separately owned. The selected shared `drawEnemyBolt` uses actual cannon `from`/`bornAt`, a bright front matching3.5u collision radius, a28u nonphysical fading wake, and a muzzle flash lasting less than.14s. No speed, cover, port, HP, reward or timing rule changed. `tests/space-plasma-integration.test.js` verifies real launch metadata/speeds and that drawing cannot mutate combat; all62 combined Circuit/Forge/integration tests pass, including the existing legal muzzle/port sweep checks. Actual393×852/412×915 opening, warning and six sampled fire frames have zero page errors in `out/space-selected-review/circuit/selected-proof/`; the cleared-panel effect fixtures are labelled staged. Hashes stayed unchanged throughout. They demonstrate rendering, not a new earned completion or human balance result. Human playtest remains before shipping.
