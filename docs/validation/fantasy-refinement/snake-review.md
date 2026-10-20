# Emerald serpent browser review — 2026-10-20

Final tested HTML: `9B6B88799CFDF7C813C5D97824E3E9DD2E17558CAF4FDA13E0D3A3FF75385C37`.
Vault source: `CC6B7E4051AB0FFC18CAE81A083FDC1D985247F62836240D226E63F5C233E363`.
Capture helper: `3F6BDFAEAE957D13282AFCDF0ED1B3858643D55AADB35A81FE4D821358DA0560`.

`snake-final-browser.json` is the compact final two-phone receipt. The full result and all native PNGs remain in `out/snake-final-upright/`. Both 393×852 and 412×915 browser viewports passed with no page errors. Source and build hashes stayed unchanged throughout the run.

- Seven cardinal/expression fixtures use the actual packed head atlas. Warn/breath and twelve breath-motion frames each verify that the rendered spray begins at the measured, transformed mouth anchor.
- Natural no-input simulation reaches the attack without moving the snake or removing its obstacles. Sequential actual updates then sample the committed wrap, Lumi lift, upright head, rear-neck attachment and both laugh jaw states. The entire original body ribbon remains; head/tail movement and body-length checks pass. The opposite-side review is explicitly a mirrored path/attack fixture, not another earned approach.
- The state remains playable through the 4.15-second sample and becomes lost after 4.2 seconds. Calling `loseBall` during the committed capture preserves lives, charge and the ending. Pure tests separately cover the exact 4.199/4.201-second boundary.
- Native PNGs were viewed at both phone sizes: Lumi's face/crown remains above the front waist coil; the final head remains upright and connects behind the skull. `3-natural` and `3.17-natural` show the closed/open laugh states. `mirrored-staged` names identify the alternate-side fixture.

`vault-capture-mechanics-audit.json` compares the original 55 non-draw Vault methods against pinned commit `8286cee9cb2e45a531d14d0b4e7c7836475b3e87`. Fifty remain byte-identical after line-ending normalization. The five explicit exceptions are `updateAttack`, `capturePose`, `expression`, `snakePoints` and `loseBall`. Pre-second-strike attack and pre-capture path prefixes remain exact; removing the caught-only guard leaves `loseBall`'s former non-whitespace tokens unchanged. All 400 layout cells, 45 granite blocks and 18 original bars remain identical.

`snake-wrap-laugh-ios.webm` records the actual Main frame loop at wall time after an accelerated natural approach. Its provenance and sampled states are in `snake-final-video.json`. The attack's existing slow motion makes the ending approximately seven seconds long in this recording. It is a desktop browser recording at phone dimensions, not an earned win or a physical-handset frame-rate measurement. Earlier pre-upright captures remain under `out/snake-final-capture/` and are not the final visual verdict.

Reproduce from the repository root with the installed Playwright module (or set `PW_MODULE` to its import URL). `BROWSER_EXECUTABLE` / `PW_CHROMIUM` can select an existing browser:

```powershell
node tools/playtest/snake-source-audit.mjs out/snake-audit --capture-presentation
node tools/playtest/snake-visual.mjs out/snake-visual dist/breach.html --motion
node tools/playtest/snake-capture-video.mjs out/snake-video dist/breach.html
```

The atlas must be packed into the tested HTML; the helper rejects an old/fallback family. No balance, earned-win, APK, native-device performance or changed-difficulty claim follows from these fixtures. The prior body batching CPU receipts remain a separate historical comparison; the reusable benchmark now invokes each version's own authored capture, whose geometry can differ after later revisions.
