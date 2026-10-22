# Existing-level physics recheck — 2026-10-20

One real defect was found and fixed: a Carrier LASER could visibly cross a moving boarding fighter during Focus and still miss. Enemy actors move on active-real time, while `Arena.updateShots` supplies Focus-scaled time. `Carrier.shotHit` had not compensated actor velocity. It now uses the same inverse-timeScale contract as Circuit, Forge and Frost. SLOW is excluded because it changes ball time, not friendly-shot time.

The reproduction uses the natural first raid's actual source fighter silhouette, speed113.945u/s, real LASER radius6.8/speed560 and a1/120-second real step at Focus.25. Before the fix, the physical crossing left2HP unchanged; afterward the same ray consumes the shot and leaves1HP. `tests/physics-recheck-carrier.test.js` checks both phone geometries, with and without SLOW, exactly one damage event and no companion charge from the shot. The post-fix Carrier group passes64 tests. The initial existing-level source suite passes311 tests; these overlapping suite counts must not be added as distinct coverage.

## Pinned builds and browser checks

Baseline source checkpoint is `0bc096a`; baseline canonical HTML is `CDFF74B582002029D5E4B2BF3B98099B69F3583AC6BA39EFEB994774436A85F7`. The corrected integrated HTML is `6B21DE2363DF6969A4996028CE236488DCD67C22E1A9A48D2B681F75A066C8EB`. An ignored byte-exact local copy is retained at `out/physics-recheck-other/pinned-6b21.html`. The new Mooncoil theme is outside this seal.

All phone checks use393×852 with59/34 safe insets and412×915 with32/24 insets. Modes are Easy/Medium/Hard unless stated otherwise. Reports and representative original screenshots are preserved beside this file.

| Encounter | Fresh checks | Build/scope |
|---|---|---|
| Carrier, Circuit, Forge |18 actual Main phone/mode cases: genuine aim/release/relative drag; three chosen powers; full modal/pause freeze; swipe/cancel; Retry; WIDE bounds; decoded art | CDFF baseline; powers deliberately staged |
| Frost Warden |6 actual Main phone/mode cases: touch, powers, Ward against the real punch, three measured stance/contact poses, Continue/progress, terminal states and Retry | CDFF baseline; attack/resource/terminal setup staged |
| Vault |6 actual Main phone/mode cases,11 groups each: actual incoming serpent contacts; real granite warning, coach/Ward/cast/protection; arrows/Cosmic/fan; caps; menu freeze/cancel; held-Space pause/resume; Retry | Corrected6B21; resource/collision fixtures staged |
| Carrier crossing regression |4 actual Main cases: two phones, Focus with/without SLOW, actual first-raid fighter, friendly shot consumption and one HP loss; genuine CDP serve/drag smoke | Corrected6B21; projectile position is an explicit staged diagnostic |
| Gatebreak / Starflight |6 actual phone/mode cases: real touch drag; all nine power choices and their physical/rendered origins; real shield contact; stored/collected capsules; pause/background handlers; resize/Retry; decoded art | Standalone source/asset hashes stable before/after; power resources and late states staged |

No page errors occurred in completed runs. The311 source tests include seam/fast-ball sweeps, moving targets, solid versus pierceable materials, once-only HP/charge episodes, full-width paddle limits, deadline/same-tick success precedence, hostile-fire interception/field invariance, raid contracts, skiff states, external-core access, Warden strikes, serpent capture/retreat and Gatebreak objective/power/resize geometry.

## Harness failures retained

The older Kit suite initially timed out without a page error because its startup wait used animation-frame polling while that suite intercepted animation frames. `tools/playtest/physics-recheck-kit.mjs` reuses every assertion from the maintained suite with timer polling; it does not change runtime code. The original timeout report/log is preserved.

The first new Carrier browser fixture drew after reconstructing a level while its virtual clock was still ahead, consuming the staged shot during setup. The helper now resets its virtual clock immediately after `start`. The original failed log is retained; the corrected four-case receipt is the accepted result. Neither harness failure is presented as a game bug.

## Reproduction

Use the bundled Node22/Playwright paths in `docs/handoff/03-environment-skills-ux.md`, with `PW_MODULE` and `PW_CHROMIUM` set. The fresh runs used:

```text
node tools/playtest/combat.mjs out/physics-recheck-other/combat dist/breach.html
node tools/playtest/frost.mjs out/physics-recheck-other/frost dist/breach.html
node tools/playtest/physics-recheck-kit.mjs dist/breach.html out/physics-recheck-other/vault-final http://127.0.0.1:4194/dist/breach.html
node tools/playtest/starflight-mission.mjs out/physics-recheck-other/starflight http://127.0.0.1:4194/prototypes/starflight/
node tools/playtest/physics-recheck-probes.mjs out/physics-recheck-other/carrier-focus-after
node tools/playtest/physics-recheck-carrier-browser.mjs out/physics-recheck-other/carrier-final-corrected dist/breach.html http://127.0.0.1:4194/dist/breach.html
python tools/playtest/physics-recheck-seal.py
```

Run the first two only against the desired hash; the stored receipts retain their pre-fix baseline. The root-owned final whole-suite run includes new Mooncoil separately. This audit does not claim a fresh earned victory, human difficulty/fun, physical-handset performance, native Android lifecycle or new APK verification. Vault's capture/retreat motion has separate prior receipts; this pass adds fresh contacts, powers and controls. Bellforge/Tidewheel are reviewed in the parallel fantasy lane.
