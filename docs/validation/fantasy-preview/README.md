# Standalone keep preview checkpoint

Bellforge Run and Tidewheel Citadel are browser encounters under `prototypes/fantasy/`. They are not included in the five-chapter Android package. The canonical release build still hashes to `B06CDD969BCF5C420A74B3CF37A3EAC45FE3D46EABB2926F5E5D2B8A42E01770`.

`all-tests.txt` records all342 tests passing on the final model sources. `tools/pack_art.py` and `tools/build.mjs` also completed successfully. `motion-report.json` seals the final models, shared renderer and three artwork manifests before and after the real-time browser recordings. Both recordings have zero page/HTTP errors and identical before/after hashes.

After those seals, the final diff check removed one redundant blank line at the renderer's end. `post-review-whitespace.json` records both hashes and verifies that all other bytes are identical; no mechanics, rendering statements or assets changed.

`art-audit.json` records the182 new/changed PNGs checked for decoding, empty metadata and individual sizes below20MiB. The artwork archive separately verifies1,006 content records,1,030 source aliases and381,626,616bytes; it preserves older rejected versions as well as current assets.

The two `*-live.webm` recordings and matching PNGs are actual393×852 browser output at normal wall-clock speed. A simple public-input helper launches the ball and forecasts paddle catches; it never changes actor positions, resources, HP, timers or the simulation clock. This is assisted play, not a claim of human skill, human balance, phone GPU performance or a completed ordinary route. The longer Tidewheel recording shows productive brace/brick contacts, an attack and a lost life without injecting a terminal result.

Detailed controls, staged mechanism checks and earned completion routes remain separate:

- [Bellforge validation](../bellforge/README.md), including six phone/mode UI cases and ordinary Easy rescues.
- [Tidewheel validation](../tidewheel/README.md), including braces, chain pulls, the raised refuge, water attack and ordinary/earned-power routes.
- [Starflight recheck](../starflight-mission/QA.md), a separate completed mission checkpoint.

To reproduce, serve the repository root, configure `PW_MODULE` and optionally `BROWSER_EXECUTABLE` for Playwright, then run:

```text
node tools/playtest/fantasy-motion.mjs
node --test tests/*.test.js
python tools/pack_art.py
node tools/build.mjs
```

`BASE_URL` and `OUT_DIR` override the local preview URL and recording destination. Pass `bellforge` or `tidewheel` as the first argument for a single recording. The native art assemblies in `art/fantasy-machinery/proof/` are staged art studies; they are not these real-time recordings. Both enemies use four keyed raster poses and independently moving machinery, not full skeletal rigs.
