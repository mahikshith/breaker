# BREACH Carrier Android preview

## Verified download — 2026-10-18

[Download the APK artifact](https://github.com/mahikshith/breaker/actions/runs/39129140498/artifacts/12137681701) from [successful run 39129140498](https://github.com/mahikshith/breaker/actions/runs/39129140498), unzip it and install `BREACH-Carrier-preview.apk`.

| Item | Verified value |
|---|---|
| Tested native source | `47bc6b3e5a1d4947e4fc6a951ea05a4d18ac6fb8` on `codex/carrier-mobile-preview` |
| APK | 2,431,097 bytes; SHA256 `7F5468197BB6333BF5AACEBE4CF4226048D043634BCA8829B6644042C4F2E10D` |
| Package | `com.mahikshith.breach.preview`, version 0.3-carrier-preview / code 3, Android 8.0+ / min 26, target 35 |
| Offline content | HTML `4D5D7B5EBD5D0B167E96ED0D6063058CF27530160715D6977E686DB7F25DA72E`; preview manifest, both TTFs and both OFL licenses match fresh CI assets |
| CI | 44/44 units; both source/offline phone suites; native JUnit: 1 pass, 0 failures/skips; Android compile/lint: 0 errors, 9 preview warnings |
| Native evidence | [Android 15 Pixel 6 evidence](https://github.com/mahikshith/breaker/actions/runs/39129140498/artifacts/12136964990); focused recreated WebView at (0, 0), full 1080×2400, with hidden/transient bars, safe insets, real serve/drag and held-input stop/resume checked |

Local delivery and byte-verification evidence: `out/carrier-apk-delivery/39129140498/`. The APK's checksum matches its published `SHA256SUMS.txt`; its binary manifest confirms a debuggable, non-testOnly app and no permissions/network access. Actual successful launch, restored-menu and restored-Carrier screenshots were inspected. The native correction retains every original focus/fullscreen assertion.

This is the frozen reviewed Carrier/current Vault checkpoint. The later Boarding Raid, finished Nix/Tick companions, Relay/Orbital and difficulty/progression work in the primary branch are excluded. It remains a debug preview with local ad/payment simulations; no store release, physical-phone performance, human balance or Safari validation is claimed. The nine lint warnings cover target/dependency age, portrait lock, guarded API usage, intentional local JavaScript, backup rules and preview icon placement; none is an error.

The owner requested an installable Carrier Breakout checkpoint on the new `codex/carrier-mobile-preview` branch. The primary working branch and `main` remain separate. This preview contains the selected A carrier, open hangar and three-fighter launch, two telegraphed cannons,16 authored panel bricks, five captive crew cells and Laser/Split/Shield rewards. Win by disabling the carrier and freeing all five crew. The Vault retains the selected face-only Kit, shield cast and connected-coil capture.

Nix/Tick appearances are selected, but their full expressive character sprite families are not in this checkpoint. Relay Raiders, Level3 and later work are excluded from the frozen APK.

## Install

Download the APK artifact from this branch's successful **Carrier mobile preview** Actions run, unzip it and open `BREACH-Carrier-preview.apk` on an Android8.0+ phone. Allow installation from the app opening the file if Android requests it, then launch **BREACH Preview**. This is a debug-signed test app. If Android reports a signature conflict with an older preview, uninstalling that preview first clears its local progress.

The game, artwork and OFL-licensed Lilita One/Rubik fonts work offline. The app has no network permission. Purchases/ads remain the existing local simulation; no payment is taken.

## Validation and exact scope

The Windows gameplay bundle SHA256 is `F4863DC5A87D6B46A8A1AFDB702C264F432196B851B61B828946DB8AB75A0423`. Its portable LF-canonical hash is `2ab4ee63e929373359d90f3cef5a9e9fbdea679592c98b01fc9de673404d0e04`; `prepare-android.mjs` rejects any different source. Offline font packaging produces hash `4d5d7b5ebd5d0b167e96ed0d6063058cf27530160715d6977e686db7f25da72e`.

Local checks pass44 unit tests and both-phone Carrier, mobile UI, Vault capture/venom, polish and layout suites. Seeded public-input assisted runs earned all five rescues and disabled the carrier in82.3s on the simulated iPhone and45.2s on simulated Android. These demonstrate a reachable win, not human difficulty or real-device performance. Native reference-quality review passes continuous backgrounds, source-specific art and paddle alpha/collider alignment.

Carrier has a physical/visible125x17u paddle and7.5r ordinary ball; Vault stays70x12/6r. Both retain126CSS lower control reserve, compact top HUD and no repeated control text. Carrier collision uses the actual delivered hull opening, clipped fighter emergence, moving weapon poses, non-pierceable disabled cover, substepped contacts and swept lasers. Powers cannot award repeated overlap damage. Hostile shots stop on visible cover.

Version is0.3-carrier-preview / code 3. Native immersive mode, cutout/gesture safe areas, transient bars, offline Carrier touch/launch, held-input stop/resume and Vault/recreation tests pass run 39129140498. Evidence and installable APK are separate artifacts; APK publication followed all native checks.

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

## Historical CI corrections

The initial Carrier run39122761324 passed web/build/lint but failed native touch injection under an unrelated launcher ANR system dialog. Emulator startup now stops the background launcher and acknowledges the OS immersive hint; input still uses native MotionEvents and every gameplay/fullscreen assertion remains. A fresh passing run is required before APK delivery.

The second run39123471388 exposed a one-frame system-bar visibility race. The expanded preflight retains every hidden-bar/geometry assertion, requires500ms focused attached stability, snapshots insets atomically, exercises held-input stop/resume and detaches the WebView before destruction. Failure screenshots/window/logcat now survive a failing test. The complete Carrier suite also runs against the actual offline packaged HTML; local both-phone runs pass. Native CI remains pending.

Local browser play: http://127.0.0.1:4180/breach.html?level=1 while the preview server is running. This serves the same offline packaged payload as this APK candidate.

The third run39124792121 passed source/offline web checks and native compile/lint, then failed initial document-focus readiness. The captured menu is fully drawn without an OS dialog. Startup now explicitly enables WebView touch focus and requests focus when its window gains focus. Native focus flags and a pre-close failure window dump improve diagnosis. This correction still requires native CI success.

Run39125706093 verified native focus, fullscreen/transient bars, held-touch stop/resume and Carrier input/launch; it failed an incorrect test expectation of Vault width74. The unchanged Vault constructor uses70. Its assertion now reports the exact identity/geometry tuple, and both-phone packaged-browser mirrors confirm every remaining static value and storage expectation. No gameplay or packaged hash changed. Native recreation/final CI still must pass.

Run39126881472 passed the web suites, Android compile/lint and native startup, bars, held-touch resume, actual serve/drag, fighter launch and Vault checks. It then found a real recreated-view readiness issue: the window retained focus while the newly created WebView had no native view focus; the failure menu also showed unreapplied system-bar space. After the local page finishes, the Activity now posts fullscreen, native view focus and inset reapplication when the view is attached to a focused window. This complements the existing window-focus callback for preserved-window recreation. No JavaScript focus injection or test assertion removal is used. The frozen source and packaged hashes remain unchanged; a fresh native run must verify the correction before delivery.

Run39127870146 confirms that correction restores native and document focus after recreation. It exposes a separate retained layout inset: the focused, hidden-bar, full 1080 × 2400 window still places its new WebView at y128, exactly the cutout/status inset. This matches the [AOSP preserved-window decor-fit defect](https://android.googlesource.com/platform/frameworks/base/+/3c3036aedc52e2eae0ce76e683dc11a0a859c0a7%5E%21/). The bounded Android15/API35 workaround explicitly retains public full-screen/navigation layout flags; the modern WindowInsetsController still owns bar visibility. No view translation, inset subtraction, assertion removal or gameplay modification is used. Native ancestor geometry/padding/margin diagnostics now accompany the unchanged atomic snapshot. A fresh full CI pass is still required.
