# Bellforge fresh physics recheck

2026-10-20. Standalone browser encounter, separate from the delivered APK. No Bellforge runtime change was needed. Model `A36418F1A40E5B95521065D27F80497C241BC30BAA4E1789DA3E9BE7CE3693CF`; Main `728BBC49…BE7542`; renderer `57D691A1…DD148E`. Reports contain full dependency hashes and stable before/after seals.

| Receipt | Actual scope and outcome |
| --- | --- |
| `units.json` | Fresh22/22 maintained focused tests: fast contacts, angular ramp response, bell reversal/dock ordering, compound Korr episodes, earned credit, real Echo rebound, serve/pause, final-hit precedence, grounded defeat and Continue. |
| `model-routes.json` | Eighteen fixed-policy public-input model attempts, all wins/three lives/no Continue. Three heights ×three modes ×ordinary/optional-earned-Echo. First brick.60s, broad Korr3.76–4.02s. No-input attempt loses, not an automatic win. Full timings/resources and the exact policy hash are retained. |
| `ccd.json` | Fixed-seed3000 rotating-capsule near-surface cases, including345–5000u/s stress speed.2290 sampled meaningful penetrations, zero misses. Not an exhaustive tangency proof. |
| `browser.json` | Six fresh393×852/412×915 phone/mode UI cases; genuine CDP touch launch/drag, first Pause, full freeze, Resume/Retry/Home. Echo full-charge UI fixture is staged. Separate earned ordinary Easy browser-policy wins59.625s/45.183s, three lives/no cast/Continue; zero errors. |
| `defeat.json` | Two current-source phone controls plus staged actual renderer ending: stagger/slump/dazed/escape/result, safe cleanup, fixed supporting foot and fresh Retry. Final HP is removed by fixture. |
| `states.json` | Two staged physical last-ball drains and actual touch Continue/Retry. Earned-progress fixture preservation and physical bell crossing into the ratchet danger stop; terminal freeze. No earned-loss or victory claim. |

All eighteen model attempts and both earned browser Easy attempts completed. Echo is not remote guaranteed damage: if pins divert the bell before it reaches the shield, a legal cast can miss. The recorded equal/slower Echo runs remain in the table/report. The aiming policy forecasts collisions and therefore establishes availability, not human balance. Browser viewports are not physical handsets or a CPU/GPU performance admission.

Selected source-native PNGs:

- `ios-earned-rolling.png`: actual earned route with rolling teaching bell and normal ball.
- `android-earned-result.png`: earned ordinary rescue, no forced HP/resource state.
- `android-echo-staged.png`: actual tapped physical guard; full charge explicitly staged.
- `android-dazed-staged.png`: actual collapsed ending art, final HP explicitly staged.
- `ios-loss-staged.png`, `ios-continue-staged.png`: physical drain/result and actual Continue, with preserved fixture progress.

Reproduce from repository root using Node22. Serve the repository first for browser cases. All dependencies are tracked source/tools; no ignored output is imported.

```powershell
node --test tests/bellforge*.test.js
node docs/validation/physics-recheck/bellforge/model-routes.mjs
node docs/validation/physics-recheck/bellforge/ccd-audit.mjs
$env:BASE_URL='http://127.0.0.1:4194'
$env:PW_MODULE='file:///absolute/path/to/playwright/index.mjs'
$env:BROWSER_EXECUTABLE='C:/absolute/path/to/chrome.exe'
$env:OUT_DIR='out/physics-recheck/bellforge/browser'
node tools/playtest/bellforge.mjs
$env:OUT_DIR='out/physics-recheck/bellforge/defeat'
node tools/playtest/bellforge-defeat.mjs --phones
$env:OUT_DIR='out/physics-recheck/bellforge/states'
node docs/validation/physics-recheck/bellforge/state-browser.mjs
```

`OUT_DIR` also overrides the model/stress report destinations; use distinct directories to retain each report. Exact collision/encounter rules and historical results remain in [`BELLFORGE_PHYSICS.md`](../../../BELLFORGE_PHYSICS.md).
