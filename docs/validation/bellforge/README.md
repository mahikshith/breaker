# Bellforge: six-row checkpoint

Standalone browser prototype, 2026-10-20. This receipt does not describe an APK or physical-device performance.

Model: `46F6297072BAF87B7C8D2E88875B3E1E4A7E99EC90A48F0AB3F5CF4BE7AC65CF`;19 focused tests pass. Thirty full colour bricks on both phone layouts, three physically rotating ramps, actual hopper release, gravity-driven bells and a manually activated physical Echo Guard. Korr has four keyed raster poses, not a full skeletal animation rig.

- `phone-report.json`: six fresh-browser touch/UI cases at393×852 and412×915, all modes; zero page/HTTP errors. Checks actual drag/launch, first Pause after drag, complete clock freeze, Resume, fresh Retry, Kit chooser and Home. Kit tests explicitly stage100 charge. Earned Easy policies use only public inputs/model updates:56.7625s iOS and61.6833s Android, three lives, no cast/Continue.
- `model-routes.json`: twelve bounded deterministic ordinary/optional-earned-Echo runs at700/760 logical heights, all wins, no resource/HP/position/life writes. This is model-assisted route evidence, not human balance. Earlier negative geometry receipts remain under ignored `out/bellforge-proof/history/`.
- `palette-refresh.json`: renderer-only cyan correction from copper `brick_c` to teal `brick_t`; model/Main unchanged. Renderer SHA50DC1C8D…E14F67. Both phone captures load without errors. This does not claim another earned completion.
- `historical-before-final-anatomy.json`: earlier four-row/conservative22-disk source DD7F3822…5244, including two Hard760 losses before the measured extremity/route revisions. Retained as negative evidence; it is not a result for the current model.
- `shared-ui-report.json`: later six-case shared-loader/input regression, zero errors. Main changed during this run; `shared-refresh-notes.json` records the exact before/after hashes. It is not an identical-source seal or a new completion claim.
- `visual-source-refresh.json`: final two-phone openings and staged Tidewheel pull, after the Bellforge paddle-centre and raft-front alignment corrections. All listed sources, including the secondary Nerra manifest, match before/after. Renderer SHA `C4571282…365D9`. No earned route was repeated.

Selected native PNGs:

| File | Scope |
| --- | --- |
| `ios-opening.png` | Final cyan/coral/plum palette, expanded platform/hopper,30-brick field |
| `android-rolling.png` | Same palette; actual teaching bell moving through the physical route |
| `ios-echo-staged.png` | Actual Kit-tap deflector, explicitly staged charge; preceding copper palette |
| `android-earned-result.png` | Real ordinary-policy rescue result; no forced terminal state |
| `ios-opening-final.png`, `android-opening-final.png` | Latest shared renderer/loader, corrected paddle metal/ball contact; zero loading errors |

No source PNGs or prior concept versions were replaced. The native motion recording is reviewed separately. The later Nerra asset/loading revision has the separate readiness/visual receipts above; it does not acquire the earlier completed gameplay results. Detailed mechanics: `../../BELLFORGE_PHYSICS.md`.

## Reproduce

From the repository root, serve the repository with an ordinary static HTTP server, then use Node22 and an installed Playwright Chromium. No files under ignored `out/` are dependencies of these maintained scripts.

```powershell
$env:BASE_URL='http://127.0.0.1:4194'
$env:PW_MODULE='file:///absolute/path/to/playwright/index.mjs'
node tools/playtest/bellforge.mjs
node tools/playtest/bellforge.mjs --ui-only
node tools/playtest/fantasy-visual.mjs
```

`PW_MODULE` can be omitted when `playwright` resolves normally. Optional `BROWSER_EXECUTABLE` selects an existing Chromium executable; `OUT_DIR` chooses a fresh output folder. The full Bellforge runner performs six UI cases and two read-only-forecast assisted Easy rescues. `--ui-only` omits the earned routes. The visual helper only captures source-aligned openings and explicitly staged Tidewheel poses. The policy uses actual public gameplay inputs; the chooser fixture alone deliberately sets full charge.
