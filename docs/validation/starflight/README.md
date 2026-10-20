# Starflight combat-lab verification

2026-10-20. This evidence covers the separate browser prototype, not the proposed six-chapter campaign or a Starflight APK.

- `browser-report.json`: real renderer and public touch/keyboard input at 393×852 and 412×915, Easy/Medium/Hard. Full-charge power and later-sector visual fixtures are explicitly staged. The separate earned Easy routes do not write resources or enemy state; natural pickups remain allowed.
- `real-clock-report.json`: normal browser animation-frame progression and touch. Host frame timing is not physical-phone performance.
- Selected PNGs show the actual renderer. Filenames containing `staged` identify fixtures rather than naturally earned scenes.
- Every report seals model, geometry, renderer and runtime asset hashes before/after the run. Earlier failed clearance probes remain locally under `out/starflight-review/`; they led to the wider reactor reserve and 27.04u player wall margin.

The complete unit suite passes 266 tests, including 35 Starflight tests. All 39 new source/runtime PNGs decode with empty metadata. The artwork archive verifies 918 unique files, 940 source aliases and 320,069,413 bytes. Repacking the older artwork and rebuilding preserves the five-chapter `dist/breach.html` SHA256:

`B06CDD969BCF5C420A74B3CF37A3EAC45FE3D46EABB2926F5E5D2B8A42E01770`

Reproduction from the repository root, with the project's documented Node/Python/browser environment:

```text
node --test tests/*.test.js
python -m http.server 4193 --bind 127.0.0.1
node tools/playtest/starflight.mjs out/starflight-review/final http://127.0.0.1:4193/prototypes/starflight/ --earned --ordinary
node tools/playtest/starflight.mjs out/starflight-review/real-clock http://127.0.0.1:4193/prototypes/starflight/ --realtime
```

The browser commands require `PW_MODULE` and `PW_CHROMIUM` as documented in the environment handoff. Run the server separately. A scripted first-sector clear establishes reachability for that route; it does not certify human difficulty, the entire campaign, all repeat cycles, native performance or every player strategy. Hard balance remains provisional. No physical-device Starflight test or campaign implementation is claimed.

Final source-stable browser result: six phone/mode cases and 42 staged ability activations pass. Public-input Easy first-sector clears take 66.05s on iPhone dimensions (2 hull left) and 65.05s on Android dimensions (4 hull left), with zero chosen powers and natural pickups allowed. The true-alpha sweep retains at least 1.383u clearance from the reactor and keeps the complete opaque hull inside the viewport. Normal-clock smoke progresses 10.45s / 10.43s with no page/request errors; those short host runs do not replace a ten-minute physical-device profile.
