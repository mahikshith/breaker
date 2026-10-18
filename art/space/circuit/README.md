# Circuit source family

`source/craft-family.png` and `source/phase-badge.png` are preserved source plates. `prepare.py` reads those local files and the canonical B `pod_shell.png`, normalizes seven metadata-free RGBA parts, measures alpha geometry and writes `assets/relay-circuit/manifest.json`. It does not need an external source directory. Canonical B art is retained.

The craft family uses512×384 source cells, displayed80×60u. Flight/left/right muzzle UVs, cradle UVs, visual stowed radius and foreground lip source rectangles are measured separately in the manifest. Source collision polygons and normalized anchors remain authoritative after texture sizing. Port halves use a seam pivot and move18u outward each; the front badge moves with its leaf.

Reproduction order:

1. `python art/space/circuit/prepare.py`
2. `python tools/space-assets/pack-level-family.py assets/relay-circuit/manifest.json out/relay-circuit/runtime-extra` for the isolated runtime-extra pack.
3. `node tools/relay-circuit/build.mjs out/space-polish-review/circuit` for the current paced actual-Main isolated HTML.
4. Open that standalone `circuit.html`, or the4187 review hub when it is running. The4186/983C8C build is retained as history.
5. `node tools/relay-circuit/coarse.mjs <output-folder> <HTML-path> <browser-URL> easy` with the configured Playwright environment. An optional final `titan` argument tests a different first earned choice. Shared hub/modal checks remain separately owned.

The runtime pack validates source/manifest/runtime hashes and lossless resized-reference equality. The current Circuit has no worker rescue or new companion art; it uses the shared existing Nix face/power control. See `design/phase1/relay-circuit.md` for current gameplay, proof and human balance limits. The prior4184 HTML and ordered-target tools/receipts remain history; do not rebuild over that snapshot. This family is not yet part of the current APK or permanent level registry.
