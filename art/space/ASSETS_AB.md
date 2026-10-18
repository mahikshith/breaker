# A/B playfield asset tranche

**Latest selection and tested candidate (2026-10-18):** Only A / Carrier Breakout is active; Nix/Tick appearances are selected, but their full expressive sprite/animation families and runtime cast integration are not built. B/Relay Raiders, C/Orbital Breakout and D/Eclipse Rescue are deferred. The playable Carrier web candidate is SHA256 `F4863DC5A87D6B46A8A1AFDB702C264F432196B851B61B828946DB8AB75A0423`. It passes 44 unit tests and both-phone bundled gameplay/visual checks. Independent final captures at 393×852 safe59/34 and 412×915 safe32/24 preserve the approved A art, continuous safe-edge starfield, aligned 125×17u paddle and clean settled results, with zero page errors. Public-input assisted deterministic simulated wins record 82.3s iPhone / 45.2s Android of game clock; these do not establish human balance or physical-device performance. Evidence: `out/carrier-playable-final/report.json` and `out/carrier-visual-final/REVIEW.md`. The owner has requested an APK; packaging/native CI and delivery remain pending. No APK pass is claimed. EA839F00… remains historical accepted baseline evidence; the older A/B Canvas tranche remains asset-only history.

**APK checkpoint authorization (2026-10-18):** The owner explicitly requests the APK. This authorizes the necessary checkpoint commit/push and CI on `codex/carrier-mobile-preview` in the existing isolated `breaker-mobile-preview` worktree, using the exact frozen Carrier/current Vault sources and native immersive fix. Primary `codex/phase1-kit` is preserved. No merge to `main` or pending Nix/Tick companion-family admission is authorized. APK/native CI remains pending; the earlier screenshot-approval notes do not block this specific APK checkpoint.

Historical tranche: the earlier all-four approval produced the completed A/B left playfields documented here, without companions, pilots or portraits. Current work is only Carrier A and its selected Nix/Tick appearances; B/C/D are deferred. Full Nix/Tick sprite/animation families and runtime cast integration are not built. Reproducing these asset proofs does not establish a new gameplay/APK pass.

The production components are RGBA PNGs for Canvas 2D, with independent pivots, mounts, drawing layers and presentation states in `design/phase1/space-assets-ab.json`. RGB far plates contain only distant decoration. The source boards remain appearance references, rather than a background screenshot with gameplay painted into it.

`assets/space-a/` contains the carrier, split shutters, bare movable magenta barrel, fighter, captive payload, exhaust and dedicated panel-brick/flat-paddle family. `assets/space-b/` contains the relay, movable barrel, sixfold iris blade, portal field, hollow pod frame, crew drone and empty skiff. B uses the rounded common brick/paddle family. Ball, X-armour, empty crew cells and Laser/Split/Shield capsules are shared under `assets/space-common/`.

## Playable Carrier candidate — final web verification

The current F4863DC5… build admits the selected A textures into real gameplay, with authored cargo/captive targets, moving fighters and doors, cannons, visible payload marks, rescue completion and the existing earned core/powers. It passes 44 unit tests and the bundled two-phone gameplay suite. Deterministic public-input assisted simulated wins at game-clock 82.3s iPhone (two lives) and 45.2s Android (three lives) are recorded in `out/carrier-playable-final/report.json`; they are not human difficulty or real-device comfort proof. Independent `out/carrier-visual-final/` opening, staged launch, tip/collider and settled-result captures confirm the A art, continuous full-viewport starfield and no frozen Carrier effects behind the result card, with zero page errors. Visible paddle/collider discrepancy is below 0.006 CSS px at both travel extremes. Nix/Tick full sprite families remain unbuilt. APK native CI/delivery is pending. The A/B tranche below remains its original asset-only evidence, including deferred B.

## Reproduce the delivered parts

Run from the repo root with the configured Python/Pillow/numpy environment:

```powershell
python art/space/prepare_parts.py
python art/space/normalize_common.py
python art/space/normalize_carrier.py
python art/space/export_backgrounds.py
```

Original pixels and all source versions are preserved in `art/space/source/`. Exact requests are in `production-prompts.json`, the common/carrier prompt files and the background repair prompt files. `parts-source.json`, `parts-report.json` and the common/carrier crop recipes record the selected version, crop and hashes. Exterior padding is transparent; normalization preserves aspect and strips PNG text metadata. A's two shutter leaves are deterministic slices from one matching pair. The earlier mounted A cannon is preserved as source history; the selected bare barrel fits the hull's existing static socket.

## Native assembly proof

```powershell
node tools/space-assets/preview.mjs --check
node tools/space-assets/preview.mjs --out=out/space-assets-ab/final --capture --motion
```

Set the same `PW_MODULE` and `PW_CHROMIUM` paths used by existing phone playtests. The proof embeds the cached house font from `out/brum-proof/LilitaOne-Regular.ttf`; parts and font are self-contained in the resulting HTML. Open `space-a.html` or `space-b.html`. Space pauses, arrows seek, H changes the mechanical damage overlay, and D shows developer geometry. The default view has no developer geometry or companion.

The assembly demonstrates shutter clearance and three continuous fighter launches, local cannon warning/recoil/shot states, separate exhaust, pod front-door release, B crew boarding and iris opening. A's captives leave continuously beyond the upper/right screen edge. Damage cracks and glass glints are separate Canvas effects, not painted damage-frame variants. Final reference PNGs, release diagnostics, motion GIFs and the hashed `asset-report.json` are under `out/space-assets-ab/final/`; earlier parent-folder captures are drafts.

This is an asset-motion proof. Its ball is a placement reference; collision, win/fail, combat tuning and power dispatch are not active. Numeric integration properties are draft starting values and require visible-alpha alignment and playable phone checks. High-resolution source textures still need runtime WebP sizing and mobile memory validation before APK admission. The tested game bundle remains separate from this tranche; no new APK result follows from these captures.
