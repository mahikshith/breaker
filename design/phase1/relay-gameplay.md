# Relay Raiders — parallel playable prototype

The owner requests the next level in parallel with the frozen Carrier APK. This work uses the approved **left playfield of B**, without selecting a pilot or companion. It lives in new files only. Carrier/Vault, the active `dist/breach.html`, and the APK worktree are unchanged.

## R1 — reference, assets and layout

`src/relay.js` uses the delivered B relay, six individual iris blades, purple portal, two cannons, four hollow worker pods, four worker instances, empty skiff, rounded cyan/violet bricks, X armour, capsules, paddle, ball and full-screen background. The original arrangement comes from `space-assets-ab.json → assemblies.B`; no replacement saucer or proxy brick grid is introduced. No Kit, princess, snake, Vesper/Latch or Nix/Tick portrait appears in Relay.

The isolated preview injects 19 original B/shared PNG parts, rather than packing them into active gameplay. `tools/relay-preview/art_info.py` measures visible alpha bounds at32/255 and physical contours at96/255. `art-info.json` holds the reproducible normalized contours. The actual hollow pod silhouette, including its rounded corners and transparent centre, is physical; the closed translucent glass is a separate rectangular lock surface. Decorative glow, workers, the skiff and the portal field are not damage targets.

The B paddle has a125×29u visible envelope/collider and an8u ordinary ball radius. This preserves the rounded B paddle's actual aspect ratio. The shared126CSS lower reserve, compact top HUD, invisible drag area and continuous safe-edge starfield remain. Developer geometry is off by default.

## R2 — objective and state machine

**Free all four workers, board the skiff, escape through the relay.** Each pod lock takes two normal contacts. The fourth released lock opens and disables the relay; there is no mandatory post-rescue hull grind. A player can optionally disable the relay early with24 ordinary hull/blade contacts, or disable an individual cannon with6 contacts. Normal balls can complete every required action without capsules, a character ability or a paid power.

| Element | Property and state |
|---|---|
| Cyan/violet module |1HP, rebounds ordinary balls; marked modules drop exactly one authored capsule.|
| X armour |3HP with two visible crack states; normal/TITAN/LASER deal1 per contact, FIRE destroys.|
| Three payloads |`bBrickCyan3→LASER`, `bBrickViolet2→SHIELD`, `bBrickViolet3→SPLIT`; each has a visible capsule mark.|
| Pod glass/frame lock |2HP; locked → cracked → glass retracts → friendly worker exits → boards the skiff. The empty metal frame remains physical with its real aperture.|
| Relay hull/closed blades |Optional24HP early shutdown. A normal actor contact deals1, FIRE3, TITAN4 and LASER1. All four freed pods also shut it down and power the gate.|
| Cannon |Optional6HP. The first warning starts3.2s after launch; cannons alternate with4.2s between warning starts. The lane locks when warning begins.|
| Warning/projectile |1.2s local amber warning precedes a220u/s short beam projectile. The gun aims within±.2rad and recoils5u for.2s. Cover absorbs it without losing HP; a ball can intercept it. An exposed paddle is stunned.6s.|
| Gate |Six real blades rotate/retract over.8s, revealing the non-solid purple portal. Disabled visible metal still rebounds powered balls.|
| Worker/skiff |Each release waits.45s for glass, then travels1.5s to the actual skiff. Canopy clipping and the original foreground hull lip occlude boarding. After all are aboard, the skiff leaves through the open iris over1.2s; result waits1.5s.|

An untouched initial serve does not run enemies. The first warning and the initial cargo/pod cover give room to read the encounter. SHIELD retains the established missed-ball-save rule; it does not secretly block enemy shots. Lives, Focus, earned TITAN and authored capsules use `Arena` unchanged. Loss freezes actors; Continue retains broken cargo, pod/relay damage and released workers, clears hostile shots and gives a fresh protected serve with3s warning grace. The fourth lock immediately latches escape and clears combat, so a last-ball miss cannot undo the earned rescue during boarding. Departure still waits for all workers to board. Escape blocks same-tick LASER spawning, clears active shots/drops and hides gameplay balls; settled result cards have no frozen effect overlay.

The state flow is `relay → escape → won`, or `relay → lost → Continue → relay`. No countdown, monetization gate, invulnerable worker target or compulsory full-map clear is added. These values are initial playable tuning, not established human difficulty balance.

## R3 — integration and collision contract

```js
new Relay(W, H, uiScale, {
  parts,          // manifest descriptors + url + measured artBounds
  assembly,       // space-assets-ab.json: assemblies.B
  motion,         // space-assets-ab.json: motion
  payloads        // space-assets-ab.json: draftIntegration.payloads.B
});
```

`parts.bHull`, `bIris`, `bCannonBarrel` and `bPod` also require `collision:{points,holes}` in normalized image coordinates. Pivots, scales and rotations transform both the displayed parts and their contours. Iris collision uses the same circular aperture clip as drawing. Friendly contents are excluded. Stable target IDs feed the existing `carrier-physics.js` contact episodes and swept laser queries, preventing overlap damage on every frame. No new physics engine or shared collision changes are needed.

`targets()`, `irisShapes()`, `podFrame()`, `inspect()` and optional `debugGeometry` support inspection. The class exposes the ordinary Arena drawing/input/result hooks plus continuous full-viewport background drawing. Production integration can later admit optimized `ART.relay` data and a level factory; this prototype deliberately changes neither `main.js` nor the packer.

## R4 — reproduction and evidence

From the primary repo, using the configured Node22, Python/Pillow and Playwright paths:

```powershell
python tools/relay-preview/art_info.py
node --test tests/relay.test.js tests/relay-review.test.js
node tools/relay-preview/build.mjs out/relay-next-final
node tools/relay-preview/playtest.mjs out/relay-next-final
node tools/relay-preview/normal-run.mjs out/relay-next-final
```

The first command prints the measurements; update `tools/relay-preview/art-info.json` only when reproducing a deliberate art revision. The builder validates inputs and asserts that the frozen active bundle hash is unchanged. Open `out/relay-next-final/relay.html?device=ios` or `?device=android`; drag below the paddle to aim/release/move, use the top-left pause icon, and press D for developer geometry. There is no companion button. The isolated result screen offers retry; production chapter selection, Continue/result UI and APK admission still need integration.

`playtest-report.json` separates real pointer input, pause/resume checks, labelled staged warning/release/boarding/result fixtures and a public-input assisted earned controller. `normal-run-report.json` separately records every naturally collected capsule and any observed offensive power. Its controller never writes HP, lives, target, ball, charge or power state. A direct-hit component test is not counted as an earned win.

Nine implementation tests and five independent collision/lifecycle tests pass. These fourteen are Relay's focused checks. Independent coverage includes contact exit/re-entry, normal/TITAN aperture sweeps, all four hollow pod windows, cover sweeps and frozen-loss/Continue progress. Final-ball and ready-LASER fixtures verify that the latched goal cannot lose during boarding or leave frozen projectiles behind.

`out/relay-next-final/normal-run-report.json` records complete public-input assisted clears at393×852 safe59/34 and412×915 safe32/24. The iPhone run wins at234.6s of game clock with three lives, zero capsules and no observed FIRE/LASER/TITAN. Android wins at86.3s with three lives and zero capsules, but earns an accidental TITAN; it is **not** labelled a pure ordinary-ball run. Neither controller writes HP, lives, targets, balls, charge or power state. Both have zero page errors. Final real-pointer/pause, staged-motion and mixed-power controller output is in `playtest-report.json`; staged wins do not count as earned clears.

The mixed-power controller wins Android at39.4s with three lives. Its iPhone attempt reaches the360s bound with two workers still locked,8 relay HP and three lives. That attempt is preserved as an incomplete run, not described as a clear or a balance pass. The separate ordinary-ball iPhone clear establishes reachability on the same artifact; differences between automated policies still warrant human playtesting.

Actual phone captures include `{ios,android}-opening.png`, `*-pointer-play.png`, `*-geometry.png`, `*-staged-cannon-warning.png`, `*-staged-cannon-shot.png`, `*-staged-worker-release.png`, `*-staged-boarding.png`, `*-staged-departure.png`, `*-staged-result.png` and `*-normal-won.png`. The release/boarding/result captures deliberately stage lock damage so that presentation can be inspected independently of the earned runs.

Exact SHA256:

| File | SHA256 |
|---|---|
|`src/relay.js`|`b22f40d27ccfee1da0bbe562bd141949bdf9a61b0a593adea4302fa069765a83`|
|`tests/relay.test.js`|`22ae6cc297dac7eb0175ac7373414a02cdb0c834c9b7459fffd21eae6ee1ccde`|
|`tools/relay-preview/art-info.json`|`9e814c5793c764a5a034d207233977763a0df8fe5e8bbab7bc22dca893e1b739`|
|`out/relay-next-final/relay.html`|`471b34570828f217cd88330d296aaedd0a7a647cb400480d781b0311ad60f718`|
|Active game, unchanged|`f4863dc5a87d6b46a8a1afdb702c264f432196b851b61b828946db8ab75a0423`|

The review HTML is20,344,209bytes. Part-source hashes are in `build-report.json`; independent findings are in `out/relay-review/REVIEW.md`. No commit, push, global handoff edit, active bundle replacement or new APK is performed by this prototype.

## Release limits

This is an isolated playable prototype, not part of the Carrier APK. Its original PNG proof is roughly20.34MB; a smaller isolated WebP candidate is evaluated below. Production texture memory, device frame time and native APK integration are not validated. The alpha contours intentionally retain source detail and need bounded performance measurement before release. The house assets remain the previously reviewed raster tranche; this work does not claim new editable3D ship models, new damage-frame renders or completed companion expression families. Browser phone simulation and an assisted win do not establish physical-device feel or human balance.

## Bounded Relay texture optimization

The separate `out/relay-optimized/` candidate applies the existing Carrier packing recipe: three source pixels per displayed world unit, never upsample the source, WebP quality96/method6, and keep the1024×1536 background at full resolution. All original PNGs, the gameplay source, pivots, measured art bounds, collision contours and placement data remain unchanged. It retains the same nineteen parts as the PNG proof rather than replacing the artwork or adding a different asset family.

| Budget | Original PNG proof | Sized WebP candidate | Reduction |
|---|---:|---:|---:|
|Self-contained review HTML|20,344,209bytes|3,540,176bytes|82.599%|
|Nineteen encoded part files|13,144,415bytes|541,372bytes|95.881%|
|RGBA decoded-pixel estimate|40,692,592bytes|9,011,780bytes|77.854%|

Decoded pixels are a texture budget estimate, not a measured process/GPU memory footprint or frame-rate result. The original source sizes, runtime sizes, hashes, per-part bytes and native-size comparisons are saved in `runtime-pack.json`. After sizing, all eighteen transparent parts retain their alpha channel exactly through WebP encoding. All nineteen source-versus-runtime part comparisons pass the Carrier mean absolute channel-error guard of less than4/255 at both phone sizes; the worst measured part is the cannon at2.0523/255 iPhone and2.0973/255 Android. Full-screen scene comparisons and independent visual review are still required to interpret those metrics.

```powershell
python tools/relay-preview/optimize.py out/relay-optimized
node tools/relay-preview/build.mjs out/relay-optimized out/relay-optimized/runtime-pack.json
node tools/relay-preview/playtest.mjs out/relay-optimized
node tools/relay-preview/normal-run.mjs out/relay-optimized
python tools/relay-preview/compare.py out/relay-optimized
```

The builder checks every runtime and source hash against the pack manifest before embedding bytes. Rebuilding without the optional runtime manifest reproduces the original PNG HTML byte for byte (`471b3457…f718`); the optimized HTML is SHA256 `637a028d12719b662cd9e9c6acbd9fe43230356f5c7dc67284df0f38e6d0fe9e`, and `runtime-pack.json` is `ad7cc244bd3058ad871b3bd7b80de420daec2bdfa7e08d2b63b6c9f7eb783527`. `src/relay.js` stays `b22f40d2…65a83`, and active Carrier `dist/breach.html` stays `f4863dc5…a0423`.

The optimized ordinary-policy suite has complete hash-bound phone clears with zero page errors: iPhone234.6s/three lives/zero capsules/no offensive power, Android86.3s/three lives/zero capsules/accidental earned TITAN, matching the source proof. The default phone suite also completes real-pointer, pause/paused-Space and staged iris/release/boarding/departure/results checks with zero page errors on both sizes. Its mixed-power controller outcomes retain the same bounded iPhone timeout and Android39.4s win as the source proof; no new balance claim follows from compression.

Fourteen full-phone source-versus-WebP comparisons are saved as `out/relay-optimized/*-comparison.png`, with metrics in `native-comparison.json`: worst whole-frame mean channel error1.4258/255, foreground mean2.4977/255 and p99 channel error15/255. Independent review passes this isolated candidate: all nineteen source/runtime hashes and all eighteen freshly resized alpha comparisons were checked, with exact alpha equality (`out/relay-review/alpha-check.json`). Native opening, worker-release and boarding sheets at both phone sizes retain readable chrome, iris states, rounded pod corners, worker faces, capsules and background; no clipping, halo or pivot shift was found. The verdict is recorded in `out/relay-review/REVIEW.md`; scalar averages alone are not the visual-quality verdict. Faster asynchronous asset decode exposed a test-harness readiness race: the deliberately frozen animation-frame clock also blocked the default readiness polling. Both harnesses now use50ms readiness polling, matching the existing Carrier suite; no gameplay/client change was needed.

This is an isolated packaging candidate. Production art admission, actual decoded memory/frame time, physical-device quality/performance and a Relay APK remain unverified. The original PNG proof and its performance caveats remain valid history.
