# Space combat validation receipts

These are bounded automated evidence, not human win-rate or handset performance claims.

- `carrier-easy-routes.json`: all five fixed public-input Easy route attempts, including three failures and two wins. No Continue or resource injection.
- `bounded-balance.json`: the fixed coarse controller across three ships, three difficulties and two phone geometries. Poor objective choices can lose; this is not a target solver.
- `circuit-browser-routes.json`: actual browser gameplay and earned Vesper menu selection through touch. Six attempts include Easy/Medium wins and Medium/Hard losses. The subsequent warning-angle change is visual only.

Each receipt records its original tested checkpoint. Later changes do not retroactively alter those hashes. Current packaged control/layout/native checks and final release hashes are recorded in `../../MOBILE_PREVIEW.md` and the CI artifacts. Power-menu lifecycle tests deliberately stage charge and are labelled separately from earned routes.

Release integration receipts:

- `phone-controls-pre-menu-crop.json`: 18 space/mode/phone cases on E49DDC. The only later runtime change was Frost's chapter-card crop.
- `weapon-vfx.json`: six staged ship/phone checks of real warnings, heavy and salvo rounds, contact and intact brick fields, also on E49DDC.
- `frost-earned-routes.json`: two Easy browser wins with earned Kit and natural capsules, not strict ordinary-only wins or human balance calibration.
- `frost-phone-controls.json`: six final B06CDD canonical phone/mode cases, including all four Kit choices, pause, Retry, Continue and 18 measured post contacts.
- `frost-offline-controls.json`: the same six cases against the offline Android payload 4071ACEE.
- `space-offline-controls.json`: all 18 space/mode/phone cases against the final offline Android payload 4071ACEE, with zero page errors.
- `lf-build.json`: byte-identical B06CDD output after normalizing a separate source copy to LF for cross-platform build verification.
- `screenshots/`: selected actual phone-size captures. Filenames ending `staged` are explicit attack fixtures, not earned gameplay.

Native release corrections (historical failures, not delivery claims):

- `native-initial-failure.xml`: run 39163110800's live-canvas readback timeout; corrected by one offscreen sample.
- `native-resume-failure.xml` and `native-resume-witness.json`: run 39164503538's retained suspension after Android resume, with a browser lifecycle witness for the focus pairing fix.
- `native-emulator-disconnect.xml` and `native-emulator-timeout.json`: run 39166153838 lost its emulator after the repaired input gates passed. The record distinguishes that disconnect from the unbounded diagnostic that consumed the job limit; the emulator exit cause is unproven. Five shell mock cases preserve success, original failures, pull failure and test-timeout status after cleanup was bounded.


Completed release 2026-10-20:

- `native-release.json`: green run 39399653237, tested source seal, web counts, nine native geometry phases, all ten screenshot hashes, actual visual review and explicit limits.
- `native-pass.xml`: actual Android 15 JUnit result, 1 pass / 0 failures / 0 errors.
- `apk-verification.json`: downloaded APK checksum, exact embedded payload and font/license hashes, SDK/version/permission checks.
- `native-manifest.json`: decoded compiled Android manifest from that actual APK.
- `ci-assets.json`: all six CI-generated offline files match the local reviewed package byte for byte.

Native screenshot 06 is an immediate recreated-Carrier still without Nix; initial/live native screenshots 02/03 show Nix. No persistent defect or sustained post-recreation atlas-readiness proof is inferred from that single timing-limited still. Native evidence and APK links are in `../../MOBILE_PREVIEW.md`.
