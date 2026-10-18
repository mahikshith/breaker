# Space combat Android preview

Branch: `codex/space-combat-apk`. Includes Carrier Breakout, Circuit Breakout, Shutter Forge, the existing Vault and the new Frost Warden. Carrier/Vault save slots remain unchanged; Circuit and Forge append their own progress. The space campaign advances Carrier → Circuit → Forge; the castle route advances Vault → Frost Warden. Frost appends save slot 4 without moving prior progress.

Both heavy cannon rounds and three-round salvos use actual rendered plasma, with different colours per ship. Left, right, staggered paired attacks and rest windows share visible warnings; enemy fire passes above intact bricks. Player fire retains its own brick damage. Vesper/Latch accompany Circuit; Forge uses a neutral arsenal control until its cast is selected.

Space companions earn charge through ordinary productive hits over at least 24/30/36 active seconds on Easy/Medium/Hard. Chosen specials last 8/7/6 seconds and obey live-ball 7/6/5, one-Cosmic and remaining-duration 12/10/8 seconds caps. Kit keeps its prior separate limits. Circuit's earned skiff has 12 rounds and returns safely after its last shots resolve. Carrier has a longer opening response window on Easy.

Frost Warden uses a separate 28-frame Yeti rig with measured fist/body collision, three defensive gate posts, broad ordinary-ball damage, Kit’s four castle powers and separate Easy/Medium/Hard timing. Brum remains an ally.

The workflow builds and checks the exact bundle in `config/mobile-preview.json`, packages both OFL fonts offline, then runs Android compilation, lint and Android 15 emulator touch/fullscreen/lifecycle checks. The APK is only published after those checks pass. Final run and downloaded artifact verification are recorded below after completion.

Install the resulting `BREACH-Space-combat.apk` on Android 8.0 or later. It is a debug preview, not a store release. The app uses no network permission; ads and purchases remain local simulations. If Android reports a signature conflict with an earlier preview, removing that older app also removes its local progress.

Physical-phone frame rate, touch comfort and human difficulty remain for device testing. Automated route proofs are not a claim that every player or difficulty has a calibrated win rate.

## Frozen release candidate

- Canonical browser SHA256: `B06CDD969BCF5C420A74B3CF37A3EAC45FE3D46EABB2926F5E5D2B8A42E01770`.
- Offline Android HTML SHA256: `4071ACEE8BE6AB862A3CD9A0CE35680B99090B9E254D7B858F699668D949B90A`.
- All 231 unit checks pass. The 18 space phone/mode cases passed on the preceding E49DDC build; the sole later gameplay-source change is Frost's menu thumbnail crop. Both iOS and Android Vault/Carrier polish regressions passed with no page errors. Final five-chapter layouts pass on both phone sizes.
- Final canonical and offline Frost each pass six phone/mode cases, all four Kit choices, pause/Retry/Continue and 18 measured post contacts. Staged resources and attacks are explicitly labelled.
- The final offline Android payload also passes all 18 space/mode/phone cases with zero page errors.
- Six ship/phone VFX fixtures verify warnings, heavy/salvo travel and contact without enemy brick destruction. Separate earned routes preserve wins and losses; Frost's powered Easy browser routes finish at 39.79/97.81 seconds.
- A separate LF source copy produces the identical canonical HTML. Both fonts are embedded in the browser and copied unchanged into APK-local files.
- Permanent receipts and selected images: `docs/validation/space-combat/`. The new native CI run and downloaded APK hash will be appended after their checks complete.

## Native verification correction

Run [39163110800](https://github.com/mahikshith/breaker/actions/runs/39163110800) passed the complete web job, Android compilation and lint, but failed its first native canvas-colour probe. The callback timed out at `MobileSmokeTest.java:54`, after readiness and font checks; its native screenshot showed the correctly rendered five-card menu. The probe made 77 separate pixel reads on the live canvas. It now draws one 8×12 offscreen copy and reads it once, retaining the colour assertion without repeatedly reading the live render surface. The exact new probe passes against the final browser menu with a guard that rejects any live-canvas pixel read. Runtime HTML and package hashes are unchanged. A fresh CI run must pass the native gate before APK delivery.
