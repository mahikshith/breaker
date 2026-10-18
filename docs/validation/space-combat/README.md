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
