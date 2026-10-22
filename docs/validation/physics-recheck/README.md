# Fresh physics review — 2026-10-20

This review was requested after approval of the Vault's new serpent presentation and tunnel return. Historical receipts are preserved; these folders contain newly executed checks. Read each report's source/build hash before comparing it with a later revision.

## Findings

- **Bellforge:** no new runtime defect reproduced.22 focused tests,18 maintained model routes,6 phone/mode controls cases and2 earned Easy phone-browser wins. Additional rotating-ramp stress exercised3,000 directions, including2,290 reference penetrations, with zero missed continuous contacts. Defeat, Continue and Retry fixtures are separate from earned routes.
- **Tidewheel:** no new runtime defect reproduced.40 focused tests,2,304 geometry poses and6 phone/mode cases passed.27 ordinary model routes produced22 wins and5 losses (Easy9/9,Medium8/9,Hard5/9). Actual Easy browser runs won with ordinary play and an earned Anchor cast. Power and chain/projectile fixtures passed. A stale harness wait assumed an old projectile travel time; it now waits for the actual flight ETA and full dodge-flight lifetime.
- **Carrier:** a real Focus-time laser/fighter collision defect was reproduced. A naturally moving fighter crossed the laser during the frame, but its velocity was supplied in the wrong clock. The corrected swept collision converts the actor velocity to the projectile's time scale. A focused regression uses the actual fighter polygon and laser dimensions and verifies one hit, one damage event and no companion charge.
- **Other chapters and flight:** the companion `other-levels/` report distinguishes fresh default-build phone checks, model tests, the pre-fix checkpoint and final Carrier verification. Passing a deterministic model route is not proof that every player can win.
- **Vault:** final-bundle iOS/Android retreat fixtures at three approach times pass (`vault-retreat.json`), including full body continuity, tunnel heading and ending completion. These are staged rescue corridors, not earned victories.
- **New Mooncoil:** see `../mooncoil/` and `../../MOONCOIL_RELIQUARY.md`. It reuses the approved serpent physics and art with new objectives/powers; it does not replace or silently retune the original Vault.

The full unit run passed375/375 (`unit-tests.txt`). Final browser HTML SHA256: `6b21de2363df6969a4996028ce236488dcd67c22e1a9a48d2b681f75a066c8eb`.

## Limits

The tests cover authored geometry, collision cases, logical phone viewports, input/lifecycle and deterministic routes. They do not certify every possible trajectory, human difficulty, native-device frame rate or the previously delivered APK. Failed policies and stale-harness failures are retained in the respective folders rather than erased.
