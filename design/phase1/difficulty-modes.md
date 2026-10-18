# Difficulty modes — selected hybrid and calibration

2026-10-18. **The owner selected a mix of boosted retreat and finite siege rebuilding.** Pure A/retreat versus B/rebuild is no longer a pending choice. The hybrid, earlier Nix charge, larger target-facing raiders and three modes are implemented in the current browser candidate. **Hard remains unadmitted calibration: a complete earned ordinary-ball win is not proven.** Source/browser checks establish neither human balance, new native approval nor permission to commit/push the gameplay.

Current shared production artifact: `dist/breach.html`, SHA-256 **`19376ED445F4D89CEA02CFF8733A5255DA14FD275DA3CAD9798155AA64516AA1`**. `BA5E` is the historical Boarding Raid candidate with the old twelve-break economy. The separately passed frozen APK checkpoint does not contain these hybrid/mode revisions. This document update changes no gameplay, art, build or APK.

## Current runtime table

`src/difficulty.js` owns the records. Menu selection persists; invalid/missing values fall back to Medium, accepting only exact own string IDs `easy`, `medium`, `hard`. Legacy three-argument constructors preserve Carrier Easy and Vault Hard; Main passes an explicit selected mode. Stars are isolated by mode, with legacy Carrier/Vault records mapping only to Easy/Hard respectively.

| Runtime parameter | Easy | Medium | Hard — calibration only |
|---|---:|---:|---:|
| Maximum manifests while the carrier survives | 1 | 2 | 2 |
| Jump budget per launched manifest | No deadline | 75 active-real seconds | 75 active-real seconds |
| Raider HP | 2 | 3 | 4 |
| Housing HP / minimum ordinary contacts per manifest | 2 / 10 | 3 / 15 | 4 / 20 |
| Full extraction after actual route clearance | 8 s | 7.5 s | **8.5 s** |
| First squad after initial/wave launch | 6 s | 5 s | 4 s |
| Next queued boarder recovery | 4 s | 3 s | 2.5 s |
| Horizontal dock hover amplitude | 0 u | ±10 u | ±16 u |
| Vault locomotion/chewing multiplier | **0.60** | **0.80** | **1.00**, legacy Vault baseline |

Earlier Hard **60 s/6.5 s** settings failed bounded normal-route checks and were not admitted. They are not the current runtime. Hard's longer 8.5 s local window compensates for a four-hit target; current 75 s/8.5 s still has no complete ordinary-win proof. Earlier proposed hull 24/30 HP, gun 5/6 HP, bolt 320/340 u/s and third-wave settings are also superseded, not implemented mode values.

Common Carrier values: hull 18 HP, each mounted gun module 4 HP, raider pose 48×40 u, hostile bolt 300 u/s, six productive contacts per Nix command, paddle 125×17 u, ordinary/TITAN radii 7.5/10 u, base ball speed 345 u/s and rally cap 1.28. Full-squad recovery remains 6 s in every mode. Horizontal hover shares a small vertical oscillation up to 2 u; docking/breach exit ramps continuously rather than jumping the actor/collider. Breach wind-up freezes its actual displayed origin.

Keep the 126 CSS lower reserve and existing responsive drag/aim. Difficulty does not shorten the reaction lane or change player ball/paddle/input geometry. The tested viewport fixtures are 393×852 and 412×915, with worldH 729/785 and paddleY 614/675.

## Selected finite hybrid

Last legal housing damage latches the current manifest's safe escape before a later ball miss, jump expiry or new shot. Tick secures each real released identity at 0.8 s; worker departure completes after 1.95 s. Secured crew never become targets again.

Easy finishes after that first manifest. In Medium/Hard, **if the hull survives manifest 1**, archive its five secured crew and perform a 3.6 s boost/assembly transition to the second authored formation. New panel/housing/module IDs and changed positions distinguish it from restoring old rescued identities. Panels arrive visibly in staggered order during protected assembly; live collision does not appear on a moving ball. There are at most two manifests, not endless regeneration.

The hull keeps its earned HP. Newly arriving 4 HP cannons are distinct modules; replacement does not heal the hull or silently resurrect old hardware. Linked gun damage removes actual gun HP and the same hull HP once. Consumed caches do not regenerate under an old identity.

Hull 0 is a tactical alternative: cancel raids, bolts, jump pressure and future rebuilding. Remaining current-manifest crew must still be rescued, but the destroyed carrier never returns at full HP for another round. Final completion has a 1.6 s outcome: a live ship visibly boosts/retreats offscreen; a disabled ship settles with a readable disabled result. Hull shutdown is optional, not a mandatory cleanup grind after the last rescue. The historical pure-B proposal requiring final hull defeat was **not** adopted as that goal.

All live balls and existing powers survive the intermission without duplication. The replacement serve safely catches/repositions them, then fans them out on deliberate release or 3 s auto-serve. Stale pointer/Space/Nix input cannot launch or spend on the next wave: Arena's `inputEpoch` changes ownership on a serve/wave replacement, and Main rejects an earlier gesture epoch. Fresh input remains functional.

One boarder threatens one eligible housing; other fighters queue. Keep one hostile warning/projectile budget and no cannon volley during extraction. Raiders emerge, bank outside the field, give a 1 s edge warning and re-enter over 2 s to about paddleY−220 u. Body, contour, nose/muzzle and worker tether share the actual target-facing 48×40 u pose.

Target routes must be clear at ordinary-ball radius or contain only breakable panels. Intact friendly housings/unclearable metal exclude a route; secured targets are forbidden. A 1.2 s fixed-lane warning precedes a breach bolt, and nearest real cover absorbs it. Enemy panel damage gives no score, charge, combo or Focus; an existing cache drops its capsule once. Only after actual clearance does the full mode extraction start, with connected pull during its final 2 s. Kill the raider or break the marked lock to interrupt. Killing a raider returns a partially pulled worker continuously but leaves its intact housing locked.

Pressure advances in active-real seconds through Focus, SLOW and visual hit-stop; real pause/background/ad overlays freeze it. Initial serve auto-launches after 8 s, replacements after 3 s. The manifest budget starts on its actual first launch; later caught replacement serves within it consume remaining active time. No new extraction begins without its full window plus 1 s budget. Last-rescue damage wins a same-tick expiry. A hostile paddle hit costs one life and clears threats; one projectile cannot take multiple lives. SHIELD protects missed balls, not enemy contact.

Continue preserves mode, manifest/archive, target/module/hull HP, charge, secured identities and consumed caches. It clears stale threats/balls, gives the fresh 3 s serve and existing two missed-ball shield charges, and restores a finite live-carrier jump budget to at least 30 s capped at 75 s. After actual replacement launch, threats have 6 s grace. It does not reset the whole encounter or rebuild destroyed hull. Retry starts fresh; terminal combat/rewards stay frozen.

## Current Nix economy and power purpose

Carrier uses `coreMode='manual'` and `coreHits=6`. One player contact removing actual target HP earns one pip, including partial housing, fighter, gun, panel and hull hits. Intercepting a live hostile bolt also earns one pip as productive defence. Linked gun→hull damage is one contact. Enemy work, empty/disabled targets, secured actors, lingering overlap and a Nix-powered TITAN's own hits do not farm charge. Finishing a panel/housing still updates break/combo/Focus, but `Arena.brokeBrick()` adds no second manual pip. Charge caps at full with no overflow or automatic centre-return spend.

The Easy housing-only route can therefore become ready by its sixth of ten contacts; defence also builds readiness. This improves opportunity, not proof that every fast multiball finish leaves a usable cast or that humans find it necessary. Actual useful casts need observation.

- **Nix:** deliberate face-orb tap/K spends once on one caught-priority or otherwise lowest live ball, for 7 s TITAN/r 10. Repeated input cannot spend/refresh an active TITAN. Valid TITAN contact removes 4 HP from a fighter/hull/gun and 2 HP from a housing; ordinary damage remains 1. Solid cover still blocks it. No additional currency or castle avatar.
- **Tick:** the real four-legged clamp/driver action secures a released identity after 0.8 s, leaving its latch. It does not attack, spend Nix's charge or create a new captive.
- **Pickups:** existing 7 s nearest-real-target LASER, ordinary SPLIT coverage and two missed-ball SHIELD saves keep authored catches. FIRE accelerates actual damage. SPLIT cannot clone TITAN or its enlarged radius. No pickup/companion/purchase is required for an ordinary route.

Vault retains its separate 12-break Kit Ward and venom purpose; Invasion's generic centre-core stays 12. The helper normalises the sixth/twelfth fractional increment to exactly 1 and emits readiness once. Kit is not renamed Nix.

## Vault movement and preserved timing

The owner could not beat the previous Vault and asked for slower Easy or Medium. Hard retains that locomotion baseline; Easy/Medium scale **only movement and chewing** to 0.60/0.80. Grid/path weights, entry, ball/input, paddle 70×12 u, ordinary 6 r, venom/cage warnings, stun duration and Kit cast window stay unchanged.

The 20×20 grid uses 16 u cells at(20,96). Initial head(16,1) has twelve body cells extending into the tunnel. Untouched Dijkstra has 40 planned cell entries and weighted cost 65.45998. This cost is chew weight, not a deadline; removed wide bricks, body, hits, debris, venom, Focus and collapse alter later routes.

```text
baseK = 0.75 + min(1.3, eatenBricks × 0.06) + danger × 0.25
danger = clamp(1 − remainingPathCost / initialPathCost)
movementK = baseK × mode.vaultSpeed
```

baseK ranges 0.75–2.30. A step waits `chewWeight/movementK`, then travels 16 u over `0.3/movementK`. Empty/bars weigh 0.32, sun/coral/blue/gold 2.1, violet/teal 3.45; a damaged two-hit brick uses 60% weight. Initial empty-step intervals are about 1.378/1.033/0.827 s in Easy/Medium/Hard. Legacy Hard starts at 3.20 s per 1 HP step and 5.00 s per intact 2 HP. Chamber entry starts attack rather than another ordinary chew.

The historical untouched Hard fixture entered rescue 2.508 s, attacked 57.592 s, committed capture 59.700 s and lost 62.233 s after 39 moves/eighteen eaten bricks. It still moves after intro while the initial ball is caught. Focus changes Vault world time, unlike Carrier pressure. Do not divide 62.233 s by a multiplier: fixed intro/attack/collapse/physics and route changes remain.

Venom keeps 1.4 world-second warning,0.18 cast,0.55 breath,0.32 impact and 1.2 recovery. Cage strikes remain at attack ages 0.62/1.22, loss 2.7, timeScale 0.6. Head hits can interrupt before strike 2. Tests preserve stun elapsed time, warning/strike boundaries and geometry/input, while proving exact 0.6/0.8/1 locomotion and inverse chewing ratios. Per-mode full human rescue balance/passive arrival measurements remain separate work.

## Sealed evidence and limits

`out/carrier-hybrid/evidence.json` records **128/128 unit tests passing, 0 failed/0 skipped** against the sealed shared sources, including mode sanitation, charging, actual collision/timing and hybrid lifecycle. This does not prove Hard completion or human balance.

Earned controller evidence belongs to the **isolated** wrapper, SHA-256 **`4F808C2A682885F6415325CBC89B064D63939FF277912ABD859D5AD048BC457D`**. It uses the same sealed gameplay sources with a read-only cloned-world aim planner and embedded local fonts. Controllers drive public level input/update at 120 Hz with RAF stopped; these are real-physics browser/phone-geometry runs, not native execution or touch performance.

| Ordinary-only earned run | iPhone 393×852 | Android 412×915 | Scope |
|---|---:|---:|---|
| Easy, one manifest | **40.4 s** | **42.7 s** | Won without Nix/companion power, capsules or Continue |
| Medium, two manifests | **109.725 s** | **125.6 s** | Won without Nix/companion power, capsules or Continue |
| Hard, current 75 s/8.5 s | **Not proven** | **Not proven** | Bounded attempts failed; no complete earned ordinary-win receipt |

Easy is sealed in `easy-report.json`; Medium in `report.json`, `ios-earned-latest.json` and `android-earned-latest.json`, all under `out/carrier-hybrid/`. Named negative node/attempt files and `out/hybrid-review/siege-run.json` retain the failures. `hard-calibration.json` explicitly labels initial 90 s/10 s exploration unadopted; any such result cannot certify current 75 s/8.5 s Hard. Earlier 60 s/6.5 s failure is also historical. Failed controllers establish neither human impossibility nor fairness. Keep Hard unadmitted until its current ordinary route and human play are satisfactory.

The **distinct shared production** hash `19376ED4…` passes both-phone actual CDP touch/keyboard, pause/Resume/rebuild and stale-gesture checks with zero page errors in `out/hybrid-review/production-input/report.json`; before/after hashes match. Production mobile UI passes are in `out/carrier-hybrid/mobile-ui/report.json`; required two-phone polish/layout outputs are under `out/carrier-hybrid/polish/` and `layout/`. These browser checks do not convert isolated earned controller wins into production touch-play wins. Staged transitions/companion fixtures remain labelled setup, not earned victory.

No new human phone approval, native run, physical-device performance/audio proof or hybrid APK approval follows. Opened Carrier housing shells retain the known presentation-only contract: moving split pieces cease ball/hostile cover after the lock breaks. No certified shell contact or hidden full-window collider is claimed.

## Remaining admission gates

1. Prove a current Hard earned ordinary-only route without capsules/Nix/Continue, then human-play all modes on both phone shapes. Rework unfair pressure rather than requiring purchases. Separately record usable readiness/casts and prevented damage or faster rescue.
2. Preserve the 128-test source boundary, actual collision/muzzle transforms, module identities, same-tick goals, persistent progress and input epochs during further calibration; rerun affected checks on the exact new hash.
3. Show revised gameplay/motion and get owner play/screenshot OK before committing/pushing or approving a new hybrid APK. Direction selection is not balance/native acceptance. Later-sector routing requires an actual admitted level.
4. Level 2/3 variety remains at its independent image/asset gate. C's delivered lower lip still blocks the old internal reactor; preserve `out/orbital-aperture-audit/` and require visible external access/target art. Mode settings admit neither unbuilt level.

## Historical reason for the redesign

`BA5E` gave charge only on finished panels/housings: five 2 HP housings required ten contacts but yielded 5/12; sixteen panels plus five housings offered at most 21 finite events, reduced by enemy breaches. Stationary 2 HP/8 s raiders were easy to interrupt, their raster/muzzle did not reliably face the target and the hull body was static.

The historical policy sometimes became ready before winning: iPhone 27.767 s with 10.98 s before last rescue, Android 31.233 s with 3.59 s. It deliberately never tapped Nix. Those 40.708/36.783 s `BA5E` wins explain late readiness and are not hybrid timings. Pure-A/pure-B choice, a third wave, mandatory final hull defeat and the more punishing 60 s/6.5 s draft have been superseded by the selected finite hybrid/current table.
