# Carrier companion expression and action proof

2026-10-18. The owner selected A's Nix/Tick appearances, then B / Boarding Raid's mechanics. These are the actual selected Carrier characters, not Relay's cast. New companion raster families are produced and checked at native phone size; production packing/input/gameplay integration now pass the browser checks below; owner play/screenshot approval remains pending.

## Reference and production

`img/space-carrier-a.png` is the canonical appearance reference. Nix retains the lavender axolotl face, three pink fin branches on each side, glossy large eyes, cobalt rim and dark cyan-inset collar with orange badge. Tick retains the low orange/ivory crab shell, black cyan-eye face, four short articulated legs, antenna, orange pincer on viewer-left and cylindrical driver on viewer-right.

The Princess/Kit face rig and Blender light/material conventions were inspected. Existing Carrier A uses independent rendered raster assets, so this family follows that established reference-derived raster pipeline. Expressions use continuous face/eyelid shading and the same soft upper-left key; no existing Kit portrait, human substitute, flat sticker face or editable Blender-character claim is involved.

Sources, exact prompts, component recipe and receipts are under `art/space/companions/`. Returned source sheets are preserved byte-for-byte. The source Nix portraits overflow their nominal grid columns; measured intact alpha-component regions preserve all fins. All frames use one family scale. Nix's orange collar insert supplies a stable registration point; Tick's feet share one baseline. Cleanup removes disconnected alpha debris without repainting character geometry. Final RGBA PNGs have no metadata.

## Runtime contract

The authoritative inventory is `assets/space-companions/manifest.json`. Load only the two atlases in the runtime; individual PNGs are inspection/source-friendly copies.

| Family | Atlas / cells | Draw contract | Motion |
|---|---|---|---|
| Nix | `nix.png`, 1024×768, 4 columns × 3 rows, 256×256 cells | One 52 CSS pixel corner orb; pivot `[0.5,0.5]`. Draw image without clipping off its fins. The orb background/charge ring stays code-native | Command frames `[6,7,8,9,10,0]` at 10fps, 0.6s, once; anticipation → blink/dip → determined release → rise → settle → exact calm frame. No body popup or light trail |
| Tick | `tick.png`, 768×384, 4 columns × 2 rows, 192×192 cells | 40×40 world-unit transparent cell; pivot `[0.5,0.84375]` at the feet. Visible full silhouette is about 30–34u wide. Presentation only, no hostile/ball collision | Secure frames `0..7`, 10fps, exactly 0.8s, once; reach → align → close pincer → driver turn → retract → pleased eyes → green status |

Nix indices: `0 calm`, `1 focused`, `2 worried`, `3 relieved`, `4 sorrow`, `5 surprised`, `6 command anticipation`, `7 command blink`, `8 command release`, `9 command rise`, `10 command settle`, `11 cheer`. Clips are specified in the manifest; result expressions hold rather than loop between unrelated emotions.

Nix confirms the already validated deliberate full-core command; the presentation never spends or grants charge. Root owns the single existing 12-break resource, eligible-ball choice and one 7s TITAN. Tick starts after the real housing release, with its clamp/tool aligned to that housing's latch. At 0.8s the runtime retains a green latch independently of the departing body. A cancelled raider leaves still-locked workers locked; this character animation cannot grant a rescue itself. Root owns real secured identity and terminal timing. No duplicate core meter, passive automatic TITAN or extra paid power is introduced by these assets.

The staged native proof places Tick at foot anchor `[178.7,315]` above the centre lower housing, using the original frozen Carrier composition. This keeps the worker's face clear and shows driver/clamp contact near its upper latch. Integration must choose equivalent local placement per actual housing, keep all limbs in-frame and avoid neighboring intact crew; do not use the proof placement as a universal world constant.

Reduced motion can hold Nix's focused confirmation and Tick's final state while preserving the same 0.8s securing clock and final green latch. Character frames communicate feedback/state; no continuous idle bob, HUD bounce or screen-wide effect is required.

## Evidence

`out/carrier-companion-proof/` contains working sheets, true native 52/44px sheets, motion GIFs, the standalone browser preview, both 393×852 / 412×915 compositions at four sampled action times, `alpha-report.json` and `proof-report.json`. The browser preview checks real animation playback and complete decoding with zero page errors on both sizes. It layers over frozen Carrier screenshots; it does not simulate the new Boarding Raid or show an already integrated rescue.

All 20 frames have real alpha, RGB cleared outside alpha, no PNG metadata, whole source silhouettes and safe solid-alpha padding: Nix minimum 7px, Tick minimum 14px. Independent checks measured minimum any-alpha padding of 5px Nix / 12px Tick. The two atlases total 1,076,588 encoded PNG bytes and 4,325,376 decoded RGBA bytes (4.125MiB estimate, not measured browser/GPU memory). Do not also load the duplicated individual frame files. Source files remain intact; repeated normalization produces identical atlas hashes.

| File | SHA256 |
|---|---|
| `assets/space-companions/nix.png` | `5B97DCEE89051CED363148436B581E73DC627DF18FAC137D597ACF833DDAD68F` |
| `assets/space-companions/tick.png` | `B78910C17BE32E97D9F0DEC97D67775BEA286F8F98847CD496029F5F865BF7F9` |

Reproduce from the repo root with the configured Python/Pillow/numpy runtime: `python art/space/companions/normalize.py`, then `node art/space/companions/preview.mjs` with the existing Playwright module/Chromium environment. No new dependency is required. Preview sources use `out/carrier-playable-final/{ios,android}-00-opening.png` as their frozen composition background.

Independent review passed these exact atlas hashes, working/native sheets, GIF frame sequences and actual iOS/Android command/clamp/secured compositions. Nix retains all fins and clear focus/worry/cheer at 52 CSS pixels; Tick's pincer/tool sequence reads while the captive face stays visible. Evidence: `out/boarding-review/companion-alpha-review.json`, `nix-motion-review.png` and `tick-motion-review.png`. No artwork/composition blocker was found; live charge and securing timing remain outside this proof.

Integrated build `BA5E851F3CFC844E566603C042504BBD885BBD8D5CE35D508E1992CF5B8F9145` now loads exactly these two lossless WebP atlases (795,314 encoded bytes /4,325,376 decoded RGBA estimate). `out/companion-pack-report.json` verifies exact alpha and zero RGB error against the normalized PNGs. Twelve focused command tests and both-phone actual touch checks prove one charge/one ball, invalid gesture rejection, no automatic centre spend, no SPLIT duplication and configured-radius expiry. Actual live command samples are exactly6→7→8→9→10→0; GIFs/native sheets are in `out/boarding-review/integrated/`. All five actual housing positions pass clamp/secured/persistent-latch composition checks with clear captive faces and nearby balls. Nine integration groups pass per phone with zero page errors; `out/boarding-review/REVIEW.md` records independent review. Root also reran earned ordinary-only clears against this exact integrated HTML, both phones/three lives/no offensive powers.

Limits: no finished full-body Nix/turnaround or editable3D source is claimed. Upper Tick poses briefly overlap the carrier underside; lower side poses overlap neighboring panel backs while leaving worker/ball visible. Opened housing shells are nonphysical presentation. Human balance, physical-device performance and new APK inclusion remain unverified. Owner approval is pending; no new gameplay commit/push performed.
