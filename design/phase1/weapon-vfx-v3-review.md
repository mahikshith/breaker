# Cannon fire and companion correction

**Current decision (2026-10-19):** Both heavy and salvo fire are approved and implemented. Vesper/Latch are selected for Circuit; Forge has a neutral arsenal until a cast is chosen. Remaining design decisions are delegated by the owner. Historical proposal/review text below is retained as evidence. Current runtime details: `docs/SPACE_COMBAT_HANDOFF.md`.

Status: replacement design study. The owner rejected the 4189 weapon studies and has not approved their gameplay implementation. Preserve those assets as rejected history. Current production and the 4188 playable checkpoint remain unchanged while the revised combat presentation is reviewed.

## Required combat rule

Enemy cannon projectiles travel above the brick field to threaten the paddle or deployed player craft. They do not damage, remove, push, release rewards from, or stop against the bricks. Player balls and player powers remain responsible for breaking bricks. A powerful appearance must come from the physical cannon discharge, recoil, compact projectile and player impact; it must not depend on breaking the player's targets or drawing a continuous stream.

The visual study must retain every brick, use the real original muzzle positions and show the whole travel path to the player. Full-field captures and before/after brick invariance replace the earlier cleared-corridor/panel-destruction fixture. Charge, discharge, travel and impact have distinct beats. Camera effects must not move colliders or conceal the ball. A future damaging footprint must match the visible projectile core; bloom and trailing exhaust do not silently enlarge collision.

## Actual code findings and implementation reach

- Carrier `updateBolts` currently decrements brick HP and can drop its payload. Remove that interaction when implementing the chosen attack. `coverTargets` also serves crew routing and extraction: do not globally delete or change that helper and accidentally alter rescues. Correct the projectile-specific collision and warning path.
- Carrier `updateRaid` also deliberately fires at `route.blocker` during its `breach` stage. Merely removing brick damage would leave that raider repeatedly attacking an unbreakable obstacle. The approved implementation must replace that breach dependency with an aerial approach/extraction route or clear-route repositioning, preserve an interruptible crew threat, and test that a raider cannot become stuck waiting for its own brick destruction. Do not claim the collision-only change completes Boarding Raid.
- Circuit `updateBolts` and Forge `updateBolts` currently stop enemy shots on cover without damaging it. Their projectile-specific collision and warning paths also need correction. Leave player ball/shot collisions with bricks intact.
- Carrier, Circuit and Forge use shared `drawEnemyBolt`; all three draw paths must place hostile shots visibly above the brick field. Keep source muzzle positions, moving-paddle sweeps, pause clocks, death/Retry cleanup and true first player/ball contact consistent.
- Existing cover-behaviour assertions in `tests/carrier.test.js`, `tests/relay-review.test.js`, `tests/orbital.test.js` and `tests/forge-review.test.js` encode the superseded rule. Replace them with full-field brick/reward/charge invariance and real paddle/craft hit/miss tests after approval. Verify large timesteps cannot tunnel through the player. Check warning reach in both phone layouts and at maximum WIDE.
- `src/space-companions.js` currently supplies the same Nix face and three-card menu to all three space levels. This is a real design mismatch. Restore level-specific companion identity and signature action after the corresponding cast/role selection. Preserve shared pause/input/charge/cap handling rather than duplicating it.

## Circuit centre and player craft

The centre is a mechanical exit iris, not a ball attractor. `irisPose` opens only after `finishCircuit` at zero hull HP. Its closed blades share the productive hull collision; ordinary hits there reduce ship HP. The rotating `bPortal` layer is decoration and exerts no force. Show a closed, quiet hatch during combat and reserve the bright aperture/opening for departure. Do not add an unexplained suction mechanic or reintroduce the rejected ordered-symbol precision gate.

The existing once-only skiff is earned at half hull HP and lasts10/9/8seconds by difficulty. Its current0.45second crossfade and thin pulses understate the action. The replacement study should visibly deploy armour and physical cannons, securely dock the ball, fire from the real paired muzzles with recoil, and fold back into the paddle. These timings are existing facts, not a newly approved balance change.

The owner additionally requests stronger friendly fire graphics. Increase the readable cyan core and bounded wake, physical muzzle flash and cannon kick at native phone size. The follow-up skiff study targets a roughly14u visible body rather than its earlier9.5u proposal. Do not equate larger glow with silently larger damage or collision. During approved integration, audit both Circuit's separate `drawCraft` pulses and shared space LASER rendering in `Arena.drawShots`; preserve Kit's distinct arrow branch and the canonical Cosmic ball. A single preview change must not be reported as a fix to all those production paths.

## Cast and power roles

See [space-companion-role-review.md](space-companion-role-review.md) for reference-backed cast status and proposed distinct roles. Carrier's selected Nix/Tick family must not silently become the companion for every ship. Common collectible powers may remain common; companion signature actions should solve each level's own threat.

## Review boundary

The cannon comparison is at <http://127.0.0.1:4190/>: A heavy shot and B three-shot salvo. Each uses the new compact plasma artwork, a separate connected plasma-impact raster and the actual original cannon/field artwork. A first pass illustrates a paddle hit and the second a dodge; dragging overrides the illustrated paddle movement. This is an isolated attack simulation using the existing swept collision helper, not a complete playable level or a difficulty test. The original production classes are not patched by this page. [A/B comparison](weapon-vfx-v3/review/cannon-comparison.png). The muzzle plane clips emerging fire behind the actual aperture. Final paddle/ball sizing uses the source alpha bounds; wrong Nix portraits are omitted from the Circuit/Forge review bases, and Circuit's decorative portal is omitted behind the closed metal iris.

The separate skiff study is at <http://127.0.0.1:4191/>. It cuts the approved ship raster into moving armour and cannon components; the illustrated player shots use the new plasma sprite in cyan, with real muzzle anchors and independent recoil. Its four-shot excerpt does not shorten the actual level's10/9/8second bonus. Player shots may break bricks; hostile shots may not. Two phone sizes pass its focused geometry/state/source checks with zero page errors. [Skiff contact sheet](weapon-vfx-v3/review/skiff-contact.png) and [receipt](weapon-vfx-v3/review/skiff-report.json). Exact mechanics and prototype limits are recorded in `tools/weapon-vfx-v3-skiff/README.md`.

The companion comparison is [the preserved A/B/C cast sheet](weapon-vfx-v3/cast-roles.png). Only Carrier Nix/Tick appearances are currently selected. Vesper/Latch and Nova/Pin are proposed from the original references, not newly admitted sprites. Their signature actions are design proposals; the shared power picker in the live levels remains unchanged until reviewed.

Independent cannon checks cover three ships ×two firing patterns ×two phone sizes. Each ray crosses two to four intact brick rectangles; heavy makes one paddle contact and salvo three, while automatic and real drag dodges avoid contact. The entire canvas returns byte-for-byte to its resting image after the effects, brick state signatures remain identical, and all14 protected source/build hashes match. Zero page, HTTP or network errors. The final rendered-impact run is `out/weapon-vfx-v3-qa/final-raster/report.json`; the preserved receipt is [cannon QA](weapon-vfx-v3/review/cannon-qa.json). Renderer SHA256: `ddc0a4e99d0a3b18e06d4f1cac375a762fc588742c8681257bb19bdd0d7d9b5e`.

New preview files are isolated from production. Phone-size presentation checks are not physical-device performance or a claim of balanced Hard gameplay. No new damage, companion balance, production bundle, APK, commit or push is admitted by the animation study. After visual selection, implement the chosen rule and test actual play before requesting gameplay approval.
