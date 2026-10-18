# Circuit skiff visual proposal

Open `http://127.0.0.1:4191/`. This is a separate, automatically moving proposal for a link/card in the4190 effects review. It does not edit production, the frozen4188 candidate, game rules or companion artwork.

## Actual source audit

- `src/relay.js:50` keeps the centre iris closed until `openedAt` is set. `targets()` at line62 combines the visible hull and its six physical blades into productive `circuit-hull` armour. There is no suction, ball attraction, gravity or portal-force mechanic.
- `draw()` at line189 paints a continuously rotating `bPortal` behind the blades. That painted field can imply a role it does not have. This proposal omits that field during combat, retaining the real closed metal hatch and broad damageable hull.
- `damageHull()` at line90 earns a once-only skiff burst at half main HP. `beginBurst()` at line98 stows surviving ball objects and clears the immediate enemy volley. Current mode duration is10/9/8 active seconds, with0.45s launch/return.
- `updateFlightShots()` at line146 fires alternating real measured muzzle positions every0.38s. Swept pulses move560u/s and hit the first actual obstacle; this is already damaging gameplay. `drawCraft()` at line202 currently substitutes a crossfade of the morph/flight rasters, with simple pulse lines. Its presentation is weaker than its actual role.
- `startReturn()`/`endBurst()` at lines159–160 preserve balls/powers and restore a safe caught serve. An enemy skiff hit ends the bonus rather than costing a surprise life. At final hull0, `finishCircuit()` opens the hatch; only an existing `endingCraft` flies toward it during the quiet ending. It is not suction.
- The original selected B direction in `design/phase1/space-mode-options.md` supplies Vesper/Latch roles. `carrier-companions.md` explicitly assigns Nix/Tick to Carrier. The current Circuit source intentionally inherits the shared Nix face picker through `Arena.drawDeck`; this is an implementation reuse, not a missing image. Companion selection/integration is outside this proposal. No invented replacement portrait is drawn.

## Motion and API

`skiff.js` exports `drawSkiffStudy(g, level, age, options)` and pure `skiffGeometry(level, age)`. It consumes actual decoded `level.parts`, `level.paddle` and the existing `drawPaddleArt` method. It draws only local deck/weapon components, returns muzzle/cannon geometry and never updates resources, physics or game state. `options.payload` supplies the decoded cyan player plasma texture for the dense muzzle discharge; `options.charge` remains an optional fallback. Crop coordinates are normalized from the512×384 source frame, so resized runtime textures retain the same UVs.

The approved craft art is cut into a body, two rail cannon assemblies and two hinged armour pieces. The paddle compresses into the deployment footprint; opaque covers pivot, cannon assemblies extend from their recesses, then lock. Each real muzzle separately uses a5u kick envelope at its illustrated shot, with a0.14s dense cyan source-raster muzzle discharge. The stored ball remains behind its measured foreground lip. The fire study uses the newer `design/phase1/weapon-vfx-v3/plasma-shot-runtime.png` in cyan and upward rotation, with its nose aligned to contact. The rejected pinecone payload is not used. Six jagged clipped regions of the actual panel raster break on contact; no rectangular quarter-fragment effect remains.

`SKIFF_STUDY` publishes a0.45s deployment, four alternating0.38s pulses, a shortened flight excerpt, and0.45s safe return. The full actual10/9/8s durations are recorded separately; this excerpt is not a gameplay retune. The latest firepower revision draws the256px source in a37u square: its94px-wide visible body is approximately13.6u, with the existing short dense textured wake. This replaces the previous9.5u study after owner feedback. It is not an admitted hitbox or damage change. Resting muzzle anchors, cadence, travel speed and illustrated contact remain unchanged. Previous tool/proof files are preserved under `out/weapon-vfx-v3-skiff/history/revision-1`.

## Reproduce and limits

Use installed Node22/Playwright with `PW_MODULE` and `PW_CHROMIUM` configured:

1. `node tools/weapon-vfx-v3-skiff/build.mjs`
2. `node tools/weapon-vfx-v3-skiff/serve.mjs`
3. `node tools/weapon-vfx-v3-skiff/check.mjs`
4. `python tools/weapon-vfx-v3-skiff/contact.py`

The builder freezes actual-Main Circuit HTML`31FD49E80D9E0299403914A2D8479E49D3D0E899818170538276639B3CCFF08F` and source`35C10FD3FF37D1187428355203854545F64DD06ABC7B8F12595A035E28367127`. Native static scenes are explicitly staged at half HP with four selected panel layers/deck hidden for composition; the other machinery, grid and full-screen background are actual source rendering. Nix is hidden only in this cast-pending proposal. No gameplay completion, frame performance, balance, collision admission or APK pass follows from these visuals.

The focused report is `out/weapon-vfx-v3-skiff/proof/report.json`: both393×852 and412×915, zero page errors, unchanged source/art hashes, unchanged paddle state, exact fully extended muzzle UVs, independent recoil,0.38s alternating cadence,560u/s illustrated travel and contact points on actual panel bounds. Native and detail stills accompany one contact sheet. Root owns review integration and any later production change.
