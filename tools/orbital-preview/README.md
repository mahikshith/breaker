# Shutter Forge isolated candidate

Build from the repository root with `node tools/orbital-preview/build.mjs`, then serve `out/orbital-forge/` on its separate 4185 origin. `forge.html?level=1&safe=59,34&difficulty=medium` uses the actual current Main in an isolated one-level copy. No production menu, shared source, dist or APK changes.

`forge-check.mjs` checks actual Main native-browser touch/pause and explicitly separates staged compositions from public-input earned runs. `forge-geometry.mjs` checks actual-alpha full-radius routes/muzzles. `forge-art-proof.mjs` exports full source-size part assemblies, source family and selected-reference/native comparison. PW_MODULE/PW_CHROMIUM use the same local runtime as the other phone suites. Build validates root’s `out/orbital-forge/runtime/report.json` source/runtime hashes if present.

The earlier `main.js`, `index.html` and `check.mjs` belong to the historical rescue greybox, not this selected gameplay. The current builder does not load them. Source/test backups and old evidence remain under `out/orbital-history`, `out/orbital-next` and `out/orbital-aperture-audit`. Their old bay/core cannot establish a Forge route. Current exact receipts and limitations are in `design/phase1/orbital-forge.md`.
