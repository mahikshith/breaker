# Mooncoil Reliquary — current cage-rescue revision

Updated2026-10-20. Sixth browser/Android chapter, appended at stable internal index5 (`?level=6`). Original indices0–4 are preserved. The final APK and CI run identity belong in `MOBILE_PREVIEW.md`; a source change does not update an earlier APK.

## Current goal and twist

**Break Lumi’s cage before Mooncoil reaches her.** There is no three-seal objective, quota, bank order, 1–2–3 counter or counterweight requirement. The owner rejected that earlier concept as confusing. Old model receipts under `docs/validation/mooncoil/model-*` remain historical and do not certify this revision.

The cage is a broad96×48-unit target in a left-side chamber. Each ordinary projectile contact damages it once; Cosmic contacts damage it twice. Cage health is6/8/10 on Easy/Medium/Hard. Impact flashes, chips and fractures appear on the actual bars. When the cage breaks, the left escape chute sheds its remaining masonry and the existing flood/escape logic takes over. The snake performs its tested head-first tunnel return before the result ends.

**Twist:** player-broken violet moonstone emits a visible92-unit frost burst. If any visible body sample lies within that radius, the serpent slows to35% for1.6seconds. It refreshes to the cap rather than adding unlimited time. Breaking armour both opens shot lanes and removes protection from the pursuing serpent; timely breaks buy time. Ordinary ball hits still recoil/stun the serpent. The snake itself does not earn frost bursts when chewing. This variant does not melt granite with venom.

## Authored layout

`src/mooncoil-layout.js` is the layout authority:20×20cells,16units/cell, origin(20,96). Pocket c1–6/r6–8; Lumi centre84, floor240. The original Vault keeps its old c7–12/r3–5 pocket and its original400-cell layout. Vault accepts optional `layout` and `pocket` constructor parameters; every cage/capture/venom/flood/Continue/render coordinate uses the instance pocket. The rendered bar layer is translated from its original registration, not redrawn at a mismatching position.

A narrow granite spine at column8 forces the tunnel entrant around its lower end. Violet checkpoints across the right gallery and the cage apron are chewable protective armour. Blue upper-right, coral middle-right and jade lower-left clusters are access cover and power-cache targets, not separate objectives. The bottom two rows form a clear return lane. The pure layout tests check a long accessible snake route, mandatory armour crossings, a protected off-axis cage, and radius6 progressive ball access. See the source for exact rows; do not recreate the map from this prose.

Mounted bricks retain the normal collision solver and physical break debris. Whole unsupported-bank collapse is disabled for this mounted reliquary field. No invisible moving platform or counterweight collision remains. Ball/paddle physics and original difficulty values in the other levels remain unchanged.

## Powers and input

The lower-left Kit face orb opens a paused single-row choice menu. Every choice spends one full meter. Normal productive brick/cage contacts earn charge; crystal/Cosmic hits cannot refill it. Core charge thresholds10/12/14 productive events. Gold caches keep their catchable drop behaviour. Pause, Resume and Retry follow Main; Retry reconstructs all cage/serpent/power state.

- Moonbind: seven simulation seconds of18% serpent speed; no refresh while already active.
- Crystals: two diagonal bolts atvx±235,vy−325,radius6. Real wall/brick reflections use the shared `stepBall` solver with maximum2-unit travel per additional substep; each substep tests serpent contact. Lifetime7seconds, drain below the paddle, no extra pair while one survives.
- Cosmic: existing unstoppable-ball rendering and difficulty-specific duration/count caps; two cage damage per valid contact.

The current power icons are still the existing small Canvas symbols. The owner requested richer rendered armour/weapon icons; this remains a named presentation follow-up, not a completed asset family.

## Art, tools and reproduction

New environment: `art/mooncoil/reliquary-background-source.png`; full production prompt and registration in `art/mooncoil/BACKGROUND.md`. It was produced with the built-in image-generation tool, preserved byte-for-byte, then stored as metadata-free runtime PNG. This is an environment layer only, with no baked UI/characters/bricks. Source image941×1672RGB. Runtime draws a quiet obsidian/silver lunar chamber behind the actors.

New bricks: `art/mooncoil/brick_assets.py` reuses the native `art/render_vault_assets.py` Blender camera/light/material convention, with faceted moonstone and silver mounts.19RGBA sprites cover blue/coral/jade/violet, widths1/2 and intact/cracked states, plus dark slate and a pearly cache. `assets/mooncoil/bricks-manifest.json` records hashes, exact collision footprints, alpha bounds and four-unit margins. `art/mooncoil/brick_audit.py` checks them. Actual contact sheet: `art/mooncoil/proof/family.png`.

Background uses the image-generation skill. Bricks use create-game-assets and the established Blender rig. Layout uses level-design; collision checks use physics-tuning; touch/menu work uses game-ui-ux and input-systems. Repository implementation follows ponytail. Skill files live under `skills/` except the installed image-generation guide; the recorded prompts/scripts avoid requiring this conversation to reproduce the design intent.

Runtime uses Canvas2D, Planck debris, Node22/esbuild, Python3.13/bpy5.2.2/Pillow and Playwright/Chromium. `tools/pack_art.py` packs the new family under `ART.mooncoil` without replacing original Vault art. `tools/archive_artwork.py` includes both art/mooncoil and assets/mooncoil. No runtime asset may depend on a temporary or profile-only path.

Reproduction from repo root:

```text
python art/mooncoil/brick_assets.py
python art/mooncoil/brick_audit.py
python tools/pack_art.py
node tools/build.mjs
node --test tests/*.test.js
node tools/playtest/mooncoil.mjs out/mooncoil-current dist/breach.html
node tools/playtest/mooncoil-routes.mjs out/mooncoil-current-routes dist/breach.html --all-modes --cosmic-first
python tools/archive_artwork.py
python tools/make_handoff.py
```

Use the exact brick script CLI documented in its README if selecting a subset. Playwright helpers accept `PW_MODULE` and `BROWSER_EXECUTABLE`; final receipts record the actual build hash. `tools/build.mjs <directory>` supports an isolated preview while preserving a reviewed bundle. Android packaging freezes the reviewed HTML through `tools/prepare-android.mjs`; the workflow runs web, offline and native checks before publishing its APK artifact.

## Future direction

The owner proposed two differently skinned snakes with distinct roles, separate approach lanes, a shared confrontation area and possible rivalry. Preserve the separate level and simple rescue goal; do not just put two snakes in the same single-file corridor. Combined attacks need readable counterplay and a winnable Easy mode. This rivalry is deferred until the owner tests the current encounter. It is not implemented or advertised in the current APK.

## Serpent Rivals (2026-10-22)

Codex's deferred two-snake item is now built. Gnash, the emerald serpent, follows violet Mooncoil from his own tunnel (column 10, beside Mooncoil's at column 16).

- **Warned entrance:** after `MODE[mode].rivalAt` seconds of rescue (12/9/6 s on easy/medium/hard), his eyes glow in his dark tunnel mouth and Lumi calls "Another one!" for `RIVAL.tell` (1.8 s) before he drops. He drops only once Mooncoil's body and its route ahead have cleared his mouth, so he follows in single file instead of landing on top of it.
- **Bodies are walls:** each serpent plans around the other's body, and around a one-cell bubble at its head, so they never overlap. A follower that is blocked waits or chews another way round (on hard he often takes a longer lane through the bricks).
- **Clash:** a fight starts only when the heads meet facing each other, or when a recoil drives one serpent onto the other. Both reel back 3 cells, are dizzy for 2.2 s, and a power-up drops (split, wide or fire in turn). There is a 6 s cooldown. Being blocked is not a clash, so idle play never earns one; hitting the leader's head to knock it back into the follower is the skill that does.
- **Shared rules:** Moonbind and the moonstone burst slow both serpents. Danger, heartbeat and the red vignette follow whichever serpent is closer. Breaking the cage sends both home head first, each to its own tunnel. Continue resets the cage and throws both back.
- **Code:** Vault gained small hooks (`newSnake`, `otherSnakeCells`, `tickSnakePose`, `beginRetreat` with each serpent's own tunnel, and `drawEntrance(g, x)`). Vault's own behaviour is unchanged. `Mooncoil.withSnake` runs the same proven serpent logic once per serpent. Tests: `tests/mooncoil-rivals.test.js`.
- **Checks:** 445/445 unit tests. `tools/playtest/mooncoil.mjs` passes on both phone sizes, including idle play losing within 240 s. `mooncoil-routes.mjs --all-modes` wins all six assisted routes in 41-50 s with three lives. Screens: `docs/validation/mooncoil/rivals/`.

## Evidence boundaries

`docs/validation/physics-recheck/` contains the fresh pig/crab/other-level audit and the Carrier Focus-laser fix. Earlier six-chapter hash6b21 receipts describe the rejected seal layout. Current cage-rescue/theme receipts must use a new build hash. Staged cage/power/ending checks are separate from earned routes. Browser-sized tests do not certify physical-phone frame rate or human enjoyment.
