# BREACH Carrier Android preview

The owner requested an installable Carrier Breakout checkpoint on the new `codex/carrier-mobile-preview` branch. The primary working branch and `main` remain separate. This preview contains the selected A carrier, open hangar and three-fighter launch, two telegraphed cannons,16 authored panel bricks, five captive crew cells and Laser/Split/Shield rewards. Win by disabling the carrier and freeing all five crew. The Vault retains the selected face-only Kit, shield cast and connected-coil capture.

Nix/Tick appearances are selected, but their full expressive character sprite families are not in this checkpoint. Relay Raiders, Level3 and later work are excluded from the frozen APK.

## Install

Download the APK artifact from this branch's successful **Carrier mobile preview** Actions run, unzip it and open `BREACH-Carrier-preview.apk` on an Android8.0+ phone. Allow installation from the app opening the file if Android requests it, then launch **BREACH Preview**. This is a debug-signed test app. If Android reports a signature conflict with an older preview, uninstalling that preview first clears its local progress.

The game, artwork and OFL-licensed Lilita One/Rubik fonts work offline. The app has no network permission. Purchases/ads remain the existing local simulation; no payment is taken.

## Validation and exact scope

The Windows gameplay bundle SHA256 is `F4863DC5A87D6B46A8A1AFDB702C264F432196B851B61B828946DB8AB75A0423`. Its portable LF-canonical hash is `2ab4ee63e929373359d90f3cef5a9e9fbdea679592c98b01fc9de673404d0e04`; `prepare-android.mjs` rejects any different source. Offline font packaging produces hash `4d5d7b5ebd5d0b167e96ed0d6063058cf27530160715d6977e686db7f25da72e`.

Local checks pass44 unit tests and both-phone Carrier, mobile UI, Vault capture/venom, polish and layout suites. Seeded public-input assisted runs earned all five rescues and disabled the carrier in82.3s on the simulated iPhone and45.2s on simulated Android. These demonstrate a reachable win, not human difficulty or real-device performance. Native reference-quality review passes continuous backgrounds, source-specific art and paddle alpha/collider alignment.

Carrier has a physical/visible125x17u paddle and7.5r ordinary ball; Vault stays70x12/6r. Both retain126CSS lower control reserve, compact top HUD and no repeated control text. Carrier collision uses the actual delivered hull opening, clipped fighter emergence, moving weapon poses, non-pierceable disabled cover, substepped contacts and swept lasers. Powers cannot award repeated overlap damage. Hostile shots stop on visible cover.

Version is0.3-carrier-preview/code3. Native immersive mode, cutout/gesture safe areas, transient bars, offline Carrier touch/launch and Vault/recreation tests are prepared. Their compilation/emulator outcome is pending the current CI run; do not call this a verified APK until the run succeeds. Evidence and installable APK are uploaded as separate artifacts, and the APK artifact is gated on all native checks.

## Reproduce

Use Node22.23.3, Java17, Gradle8.11.1 and Android SDK35:

```sh
npm ci
npm test
npm run build
node tools/prepare-android.mjs
gradle -p android assembleDebug assembleDebugAndroidTest lintDebug connectedDebugAndroidTest
```

The workflow runs Carrier and shared phone suites before Android lint, then installs and tests with network disabled on an Android15 Pixel6 emulator. Debug keyboard test hooks and browser fixtures do not establish physical-phone audio, thermal/memory behavior, thumb comfort or Safari behavior.

Previous pre-Brum APK history remains at [the earlier successful run](https://github.com/mahikshith/breaker/actions/runs/39108320738). It is not this Carrier build.

The initial Carrier run39122761324 passed web/build/lint but failed native touch injection under an unrelated launcher ANR system dialog. Emulator startup now stops the background launcher and acknowledges the OS immersive hint; input still uses native MotionEvents and every gameplay/fullscreen assertion remains. A fresh passing run is required before APK delivery.

The second run39123471388 exposed a one-frame system-bar visibility race. The expanded preflight retains every hidden-bar/geometry assertion, requires500ms focused attached stability, snapshots insets atomically, exercises held-input stop/resume and detaches the WebView before destruction. Failure screenshots/window/logcat now survive a failing test. The complete Carrier suite also runs against the actual offline packaged HTML; local both-phone runs pass. Native CI remains pending.

Local browser play: http://127.0.0.1:4180/breach.html?level=1 while the preview server is running. This serves the same offline packaged payload as this APK candidate.

The third run39124792121 passed source/offline web checks and native compile/lint, then failed initial document-focus readiness. The captured menu is fully drawn without an OS dialog. Startup now explicitly enables WebView touch focus and requests focus when its window gains focus. Native focus flags and a pre-close failure window dump improve diagnosis. This correction still requires native CI success.

Run39125706093 verified native focus, fullscreen/transient bars, held-touch stop/resume and Carrier input/launch; it failed an incorrect test expectation of Vault width74. The unchanged Vault constructor uses70. Its assertion now reports the exact identity/geometry tuple, and both-phone packaged-browser mirrors confirm every remaining static value and storage expectation. No gameplay or packaged hash changed. Native recreation/final CI still must pass.

Run39126881472 passed the web suites, Android compile/lint and native startup, bars, held-touch resume, actual serve/drag, fighter launch and Vault checks. It then found a real recreated-view readiness issue: the window retained focus while the newly created WebView had no native view focus; the failure menu also showed unreapplied system-bar space. After the local page finishes, the Activity now posts fullscreen, native view focus and inset reapplication when the view is attached to a focused window. This complements the existing window-focus callback for preserved-window recreation. No JavaScript focus injection or test assertion removal is used. The frozen source and packaged hashes remain unchanged; a fresh native run must verify the correction before delivery.
