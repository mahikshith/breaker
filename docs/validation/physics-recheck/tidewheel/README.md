# Tidewheel physics recheck — 2026-10-20

Model SHA256: `E2E14ED4BC09F91F6DDEDF0A7CE030B6B1C578B51686A67B2D42CD83BAEF33B7`. Runtime model and gameplay rules were unchanged.

- `tests.txt`: forty focused tests pass, including swept moving contacts, actual claw emission, shared damage episodes, powers, final-hit priority and reset/Continue.
- `geometry-summary.json`:2304 posed extrema, no overlaps, full-r6 lanes; complete per-pose rows remain reproducible in `out/physics-recheck/tidewheel/geometry/geometry.json` with its hash retained in the failure/provenance note.
- `centre-catch.json`: nine fixed openings make productive contact in0.58–1.34s.
- `routes.json`:27 bounded ordinary model routes;22 wins and all five losses retained. Easy9/9, Medium8/9, Hard5/9. No HP/resource/actor writes or policy search.
- `earned-powers.json`: eight fixed logical-phone routes, all won; each optional power genuinely charges/casts twice, with no power self-funding. This is a model check, not DOM input.
- `browser.json`: six actual iPhone/Android viewport×mode touch control cases, two staged machinery sequences and four bounded Easy earned routes, no page/HTTP/network errors. Source/art seals stay exact. The two ordinary wins are33.74/32.75s; earned-Anchor wins24.18/26.60s with one UI cast each; all finish with three lives.
- `powers-ui.json`: three selected powers and actual claw/chain/defeat presentation on both viewports; charge/attack/terminal poses are explicitly staged.
- `retained-review-failures.json`: initial startup timeout and the obsolete fixed-flight wait. The final test uses actual remaining flight time and observes a complete dodge interval; it does not weaken damage or safety assertions.

Selected actual native PNGs were viewed for claw/projectile origin, live fury/chain/refuge positions, Cosmic ball and moving-raft gameplay. Staged images and an earned controller image are named accordingly. This is browser emulation, not physical-handset frame rate or human difficulty certification. No production bundle or Android package was rebuilt.

From the repository root with Node22 and existing Playwright/Chromium configured through `PW_MODULE` and optional `PW_CHROMIUM`/`BROWSER_EXECUTABLE`, serve the root and run:

```powershell
node --test tests/tidewheel*.test.js
node tools/playtest/tidewheel-geometry.mjs out/tidewheel-geometry
node tools/playtest/tidewheel-centre-catch.mjs out/tidewheel-centre-catch
node tools/playtest/tidewheel-routes.mjs out/tidewheel-routes
node tools/playtest/tidewheel-power-routes.mjs out/tidewheel-power-routes
node tools/playtest/tidewheel.mjs out/tidewheel-browser http://127.0.0.1:4194/prototypes/fantasy/ --earned
$env:OUT_DIR='out/tidewheel-powers-ui'
node tools/playtest/tidewheel-powers-ui.mjs
```
