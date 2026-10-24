# BREACH: complete handoff for ChatGPT (single file)

This one file contains everything another assistant needs to design for, or take over, BREACH. Rebuild it with `python3 tools/make_handoff.py`.

- **Game:** BREACH, a premium portrait brick breaker for iOS and Android. Tagline: "Break in. Break out."
- **Owner:** mykee (GitHub `mahikshith`).
- **Repository:** https://github.com/mahikshith/breaker. `main` is the stable branch; `codex/overnight` is this working branch.
- **Assembled at:** repo commit `a68e217`.

## How to read this file

- **For design work:** read Part A first (what to make, and in which format) and Part B (how the owner steers you). Then read C for the story, and E and G for the rules.
- **For execution work:** read E, F and G in full before touching anything, plus `docs/BREACH-blender-scripts.md`.

| Part | Contents | Source file in the repo |
|---|---|---|
| AF | Mooncoil Reliquary and reuse contract | `docs/MOONCOIL_RELIQUARY.md` |
| AG | Fresh cross-level physics review | `docs/validation/physics-recheck/README.md` |
| M | Current continuation memory | `docs/CONTINUE_HERE.md` |
| AC | Latest keep playtest, powers and reactions | `docs/FANTASY_REFINEMENT.md` |
| Q | Approved new keep references | `design/phase1/princess-two-levels.md` |
| Y | Bellforge machinery and encounter | `docs/BELLFORGE_PHYSICS.md` |
| Z | Tidewheel machinery and encounter | `docs/TIDEWHEEL_PHYSICS.md` |
| AA | Keep artwork production and measured geometry | `art/fantasy-machinery/SOURCE.md` |
| AB | Nerra chain-pull artwork and anatomy | `art/fantasy-machinery/NERRA_V2.md` |
| AD | Keep reaction artwork and anchors | `art/fantasy-machinery/REACTIONS.md` |
| AE | Emerald serpent source and presentation contract | `art/snake-emerald/SOURCE.md` |
| W | Gatebreak mission implementation | `docs/STARFLIGHT_MISSION.md` |
| X | Distinct future flight powers | `docs/STARFLIGHT_POWER_EXPLORATION.md` |
| S | Starflight prototype and story | `docs/STARFLIGHT_PROTOTYPE.md` |
| T | Starflight combat contract | `docs/STARFLIGHT_COMBAT.md` |
| U | Starflight artwork pipeline | `docs/STARFLIGHT_ART.md` |
| V | Starflight campaign production plan | `docs/STARFLIGHT_CAMPAIGN.md` |
| N | Space combat implementation details | `docs/SPACE_COMBAT_HANDOFF.md` |
| O | Frost Warden encounter and physics | `docs/BRUM_LEVEL_PLAN.md` |
| P | Next encounters and physics proposals | `docs/NEXT_LEVELS.md` |
| R | Mobile release and evidence | `docs/MOBILE_PREVIEW.md` |
| A | Design brief for ChatGPT (start here) | `docs/handoff/04-chatgpt-design-brief.md` |
| B | Steering prompts: project instructions, task prompts, corrections, checklists | `docs/handoff/05-chatgpt-steering-prompts.md` |
| C | Story mode plan, research and roadmap | `docs/STORY_PLAN.md` |
| D | Original game plan | `docs/GAME_PLAN.md` |
| E | Status, owner rules, progress log, TODO, palette | `docs/handoff/01-status-and-next-steps.md` |
| F | Architecture, art pipeline, build and test | `docs/handoff/02-architecture-and-pipeline.md` |
| G | Environment, connections, skills, memory, UI/UX rules | `docs/handoff/03-environment-skills-ux.md` |
| H | Repository file map | `git ls-files` |

Companion file: `docs/BREACH-blender-scripts.md` has every Blender and art script in full.


---

# Part AF: Mooncoil Reliquary and reuse contract

*Source: `docs/MOONCOIL_RELIQUARY.md`*

## Mooncoil Reliquary — current cage-rescue revision

Updated2026-10-20. Sixth browser/Android chapter, appended at stable internal index5 (`?level=6`). Original indices0–4 are preserved. The final APK and CI run identity belong in `MOBILE_PREVIEW.md`; a source change does not update an earlier APK.

### Current goal and twist

**Break Lumi’s cage before Mooncoil reaches her.** There is no three-seal objective, quota, bank order, 1–2–3 counter or counterweight requirement. The owner rejected that earlier concept as confusing. Old model receipts under `docs/validation/mooncoil/model-*` remain historical and do not certify this revision.

The cage is a broad96×48-unit target in a left-side chamber. Each ordinary projectile contact damages it once; Cosmic contacts damage it twice. Cage health is6/8/10 on Easy/Medium/Hard. Impact flashes, chips and fractures appear on the actual bars. When the cage breaks, the left escape chute sheds its remaining masonry and the existing flood/escape logic takes over. The snake performs its tested head-first tunnel return before the result ends.

**Twist:** player-broken violet moonstone emits a visible92-unit frost burst. If any visible body sample lies within that radius, the serpent slows to35% for1.6seconds. It refreshes to the cap rather than adding unlimited time. Breaking armour both opens shot lanes and removes protection from the pursuing serpent; timely breaks buy time. Ordinary ball hits still recoil/stun the serpent. The snake itself does not earn frost bursts when chewing. This variant does not melt granite with venom.

### Authored layout

`src/mooncoil-layout.js` is the layout authority:20×20cells,16units/cell, origin(20,96). Pocket c1–6/r6–8; Lumi centre84, floor240. The original Vault keeps its old c7–12/r3–5 pocket and its original400-cell layout. Vault accepts optional `layout` and `pocket` constructor parameters; every cage/capture/venom/flood/Continue/render coordinate uses the instance pocket. The rendered bar layer is translated from its original registration, not redrawn at a mismatching position.

A narrow granite spine at column8 forces the tunnel entrant around its lower end. Violet checkpoints across the right gallery and the cage apron are chewable protective armour. Blue upper-right, coral middle-right and jade lower-left clusters are access cover and power-cache targets, not separate objectives. The bottom two rows form a clear return lane. The pure layout tests check a long accessible snake route, mandatory armour crossings, a protected off-axis cage, and radius6 progressive ball access. See the source for exact rows; do not recreate the map from this prose.

Mounted bricks retain the normal collision solver and physical break debris. Whole unsupported-bank collapse is disabled for this mounted reliquary field. No invisible moving platform or counterweight collision remains. Ball/paddle physics and original difficulty values in the other levels remain unchanged.

### Powers and input

The lower-left Kit face orb opens a paused single-row choice menu. Every choice spends one full meter. Normal productive brick/cage contacts earn charge; crystal/Cosmic hits cannot refill it. Core charge thresholds10/12/14 productive events. Gold caches keep their catchable drop behaviour. Pause, Resume and Retry follow Main; Retry reconstructs all cage/serpent/power state.

- Moonbind: seven simulation seconds of18% serpent speed; no refresh while already active.
- Crystals: two diagonal bolts atvx±235,vy−325,radius6. Real wall/brick reflections use the shared `stepBall` solver with maximum2-unit travel per additional substep; each substep tests serpent contact. Lifetime7seconds, drain below the paddle, no extra pair while one survives.
- Cosmic: existing unstoppable-ball rendering and difficulty-specific duration/count caps; two cage damage per valid contact.

The current power icons are still the existing small Canvas symbols. The owner requested richer rendered armour/weapon icons; this remains a named presentation follow-up, not a completed asset family.

### Art, tools and reproduction

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

### Future direction

The owner proposed two differently skinned snakes with distinct roles, separate approach lanes, a shared confrontation area and possible rivalry. Preserve the separate level and simple rescue goal; do not just put two snakes in the same single-file corridor. Combined attacks need readable counterplay and a winnable Easy mode. This rivalry is deferred until the owner tests the current encounter. It is not implemented or advertised in the current APK.

### Serpent Rivals (2026-10-22)

Codex's deferred two-snake item is now built. Gnash, the emerald serpent, follows violet Mooncoil from his own tunnel (column 10, beside Mooncoil's at column 16).

- **Warned entrance:** after `MODE[mode].rivalAt` seconds of rescue (12/9/6 s on easy/medium/hard), his eyes glow in his dark tunnel mouth and Lumi calls "Another one!" for `RIVAL.tell` (1.8 s) before he drops. He drops only once Mooncoil's body and its route ahead have cleared his mouth, so he follows in single file instead of landing on top of it.
- **Bodies are walls:** each serpent plans around the other's body, and around a one-cell bubble at its head, so they never overlap. A follower that is blocked waits or chews another way round (on hard he often takes a longer lane through the bricks).
- **Clash:** a fight starts only when the heads meet facing each other, or when a recoil drives one serpent onto the other. Both reel back 3 cells, are dizzy for 2.2 s, and a power-up drops (split, wide or fire in turn). There is a 6 s cooldown. Being blocked is not a clash, so idle play never earns one; hitting the leader's head to knock it back into the follower is the skill that does.
- **Shared rules:** Moonbind and the moonstone burst slow both serpents. Danger, heartbeat and the red vignette follow whichever serpent is closer. Breaking the cage sends both home head first, each to its own tunnel. Continue resets the cage and throws both back.
- **Code:** Vault gained small hooks (`newSnake`, `otherSnakeCells`, `tickSnakePose`, `beginRetreat` with each serpent's own tunnel, and `drawEntrance(g, x)`). Vault's own behaviour is unchanged. `Mooncoil.withSnake` runs the same proven serpent logic once per serpent. Tests: `tests/mooncoil-rivals.test.js`.
- **Checks:** 445/445 unit tests. `tools/playtest/mooncoil.mjs` passes on both phone sizes, including idle play losing within 240 s. `mooncoil-routes.mjs --all-modes` wins all six assisted routes in 41-50 s with three lives. Screens: `docs/validation/mooncoil/rivals/`.

### Evidence boundaries

`docs/validation/physics-recheck/` contains the fresh pig/crab/other-level audit and the Carrier Focus-laser fix. Earlier six-chapter hash6b21 receipts describe the rejected seal layout. Current cage-rescue/theme receipts must use a new build hash. Staged cage/power/ending checks are separate from earned routes. Browser-sized tests do not certify physical-phone frame rate or human enjoyment.


---

# Part AG: Fresh cross-level physics review

*Source: `docs/validation/physics-recheck/README.md`*

## Fresh physics review — 2026-10-20

This review was requested after approval of the Vault's new serpent presentation and tunnel return. Historical receipts are preserved; these folders contain newly executed checks. Read each report's source/build hash before comparing it with a later revision.

### Findings

- **Bellforge:** no new runtime defect reproduced.22 focused tests,18 maintained model routes,6 phone/mode controls cases and2 earned Easy phone-browser wins. Additional rotating-ramp stress exercised3,000 directions, including2,290 reference penetrations, with zero missed continuous contacts. Defeat, Continue and Retry fixtures are separate from earned routes.
- **Tidewheel:** no new runtime defect reproduced.40 focused tests,2,304 geometry poses and6 phone/mode cases passed.27 ordinary model routes produced22 wins and5 losses (Easy9/9,Medium8/9,Hard5/9). Actual Easy browser runs won with ordinary play and an earned Anchor cast. Power and chain/projectile fixtures passed. A stale harness wait assumed an old projectile travel time; it now waits for the actual flight ETA and full dodge-flight lifetime.
- **Carrier:** a real Focus-time laser/fighter collision defect was reproduced. A naturally moving fighter crossed the laser during the frame, but its velocity was supplied in the wrong clock. The corrected swept collision converts the actor velocity to the projectile's time scale. A focused regression uses the actual fighter polygon and laser dimensions and verifies one hit, one damage event and no companion charge.
- **Other chapters and flight:** the companion `other-levels/` report distinguishes fresh default-build phone checks, model tests, the pre-fix checkpoint and final Carrier verification. Passing a deterministic model route is not proof that every player can win.
- **Vault:** final-bundle iOS/Android retreat fixtures at three approach times pass (`vault-retreat.json`), including full body continuity, tunnel heading and ending completion. These are staged rescue corridors, not earned victories.
- **New Mooncoil:** see `../mooncoil/` and `../../MOONCOIL_RELIQUARY.md`. It reuses the approved serpent physics and art with new objectives/powers; it does not replace or silently retune the original Vault.

The full unit run passed375/375 (`unit-tests.txt`). Final browser HTML SHA256: `6b21de2363df6969a4996028ce236488dcd67c22e1a9a48d2b681f75a066c8eb`.

### Limits

The tests cover authored geometry, collision cases, logical phone viewports, input/lifecycle and deterministic routes. They do not certify every possible trajectory, human difficulty, native-device frame rate or the previously delivered APK. Failed policies and stale-harness failures are retained in the respective folders rather than erased.


---

# Part M: Current continuation memory

*Source: `docs/CONTINUE_HERE.md`*

## Continue here

Last updated 2026-10-24. Branch `codex/castle-chapters` = Android `0.8-princess-polish` (versionCode 8), APK from mobile-preview run 40045371055 (artifact `BREACH-eleven-chapter-android-28`). Not merged to `main`: the owner approves main merges.

### State in five lines

- 12 chapters are built (`LEVELS` in `src/main.js`; save slots never move): 0 Carrier, 1 Vault, 2 Circuit, 3 Forge, 4 Frost Warden, 5 Mooncoil Reliquary (with a second serpent, Gnash), 6 Bellforge Run, 7 Tidewheel Citadel, 8 Gatehouse Siege, 9 Lumi Breaks Out, 10 Serpent Rivals, 11 Dragon's Hoard (merged). Only the nine princess chapters show in the menu. `?level=N` is 1-based; menu keys 0, - and = start slots 9, 10 and 11.
- Home and chapter map: `src/home.js` (hero from `store/key-art.png` packed by `tools/pack_home_art.py` into `src/home-art.js`). The menu lists the nine princess chapters in story order (`STORY`); the space chapters keep slots 0, 2, 3 and `?level=N`. PLAY starts the first chapter with no star; a chapter opens one past the furthest cleared (seven quick taps on the wordmark, or `?unlock=1`, opens all). No Full screen button in the native app.
- Chapters 6 to 11 run through `src/fantasy/chapter.js`; Ram Ball (`src/fantasy/ram.js`), the power-ready pulse and `src/clearance.js` apply everywhere.
- Gates before anything ships: `npm test` (694 pass), `npm run audit:physics` (444 runs, zero failures), `node tools/playtest/physics-audit-checks.mjs --quick`.
- Ball radius is 7 everywhere (`BALL_R`, `src/fantasy/ram.js`). Added overnight: ball-control tutorial and purpose cards (`src/tutorial.js`, `src/purpose.js`), castle special bricks (`src/castle-specials.js`), villain purpose clocks on Gatehouse, Lumi, Rivals and Hoard plus Bellforge's lift meter (`src/fantasy/purpose.js`), power-ups v2, full-screen princess chapters, fire serpent Gnash (`SERPENT_SKINS`), M365 Yeti with dash and smash, Tidewheel four-stage Siege, audit fixes (`closeNotches`, `GATE_LIFT` 128). Playtests drive the home page.
- Owner direction (2026-10-23 night): quality bar is `store/key-art.png`; villains need a visible purpose like the snakes; reuse archetypes with new skins (`prompt-library/16-brute-reskin.md`); hard but beatable with the right power-ups; subagents on cheaper models; no goose chases.
- Release path: `npm run build` (dist/breach.html, about 14 MB), `node tools/pin-sha.mjs`, `node tools/prepare-android.mjs`, then one manual CI run (`workflow_dispatch` only). The 0.8 APK is built; the next release bumps the version code and name.
- Art: `python3 tools/pack_art.py` (about 4.5 min) builds `src/vault-art.js`; never hand-merge it. Blender bpy 5.2.2 runs headless from `art/`.

### Next

1. Owner playtests the 0.8 APK; tune from feedback.
2. Open polish: check the Tidewheel open gate panel (now parks 128 px up); the Hoard purpose plate is tight beside the loot pill; the Gatehouse floor-1 plate overlaps the parapet art.
3. New villain skins on existing archetypes as art arrives (yeti to bull, bison, ape).
4. Premium art wiring into the earlier levels.
5. Starflight in its own thread later (separate prototype, not in the game).

Pending owner decision: "compress the companions" saves about 2 MB but shifts faces by 4 to 7 out of 255.

### Where to read more

- `docs/handoff/01-status-and-next-steps.md`: full "Current state", owner rules, progress log.
- `docs/handoff/02-architecture-and-pipeline.md` and `03-environment-skills-ux.md`: code, art, build, tests, tools, UX.
- `docs/BACKLOG.md` and `design/phase2/*.md`: plans and to-dos.
- Per-chapter notes: `docs/MOONCOIL_RELIQUARY.md`, `docs/BRUM_LEVEL_PLAN.md`, `docs/BELLFORGE_PHYSICS.md`, `docs/TIDEWHEEL_PHYSICS.md`, `docs/FANTASY_REFINEMENT.md`.
- Older docs (`SPACE_COMBAT_HANDOFF.md`, `MOBILE_PREVIEW.md`, `NEXT_LEVELS.md`, `STARFLIGHT_*.md`) describe the five-chapter space release and the Starflight prototype. They are history for anything castle-related.

### Owner rules

Commits authored and committed as `mahikshith <mahikshith97@gmail.com>`; no AI attribution anywhere in the repo; strip PNG metadata from renders; show screenshots after anything finishes; short single-path instructions; physics first.


---

# Part AC: Latest keep playtest, powers and reactions

*Source: `docs/FANTASY_REFINEMENT.md`*

## Lost Keeps: mobile layout, reactions and powers

2026-10-20. This revision follows the owner's Bellforge load-error report and Tidewheel playtest. It updates the standalone fantasy preview and the original Vault's presentation. It does not update the previously delivered APK.

### Bellforge loading

`prototypes/fantasy/layout.js` owns the conversion from the actual host rectangle to the 360-unit game world. The world is at least 700 units high; the paddle reserve is bounded to 90–120 units. The previous fixed 126-CSS-pixel reserve became too large in a short preview and violated Bellforge's `paddleY >= 580` requirement. The model guard remains intact. Retry adopts the current viewport; resizing an active encounter pauses it and preserves its existing world.

The face orb scales down with a short portrait playfield and retains safe-area insets. Short-window menus scroll, and the pause button keeps its touch area with a lighter visual treatment. Phone layouts retain the clear reaction lane.

### Clear defeats

The final hit immediately disables harmful work. Korr recoils, changes to a dazed face, slumps into a separate closed-eye pose, and settles on the same plinth before Lumi's lift rises. His full ending is 3.4 seconds. Nerra staggers, drops her independent claws into resting poses, faints on the sluice wall, and releases the chain while the basin drains; her ending is 3.6 seconds. Result overlays wait for these sequences.

Five new keyed reaction sprites are in `assets/fantasy-machinery/reactions-manifest.json`. The original sprite families remain unchanged. Nerra's live fury pose has its own measured opaque geometry and shoulder sockets. Dazed/fainted sprites are terminal presentation only; there is no active collider after defeat. These are keyed raster poses and articulated parts, not skeletal animation.

### Tidewheel: Kit's three choices

Tap Kit's lower-left face orb to pause and choose one power. Each choice requires and spends one complete meter. An unavailable choice stays disabled without spending anything.

| Power | Duration | Actual action |
|---|---:|---|
| Anchor | 8 seconds | Locks the hoist, cancels the current attack, drains water, and protects against new pulls while active. Usable outside the old narrow warning window. |
| Arrow Volley | 3 seconds | Deploys a paddle-mounted crossbow and fires five physical upward arrows, half a second apart. Obstacles can stop arrows. |
| Starfire | 6 seconds | Gives the existing ball the original cosmic/TITAN appearance and an 8-unit radius. It pierces ordinary breakable targets; permanent scenery remains physical. |

Easy/Medium/Hard use 12/15/18 productive credits and at least that many active refill seconds. Powered hits cannot refill the meter. A complete earned meter is snapped within numerical tolerance to 100; the old floating-point remainder could leave a visibly full meter unable to cast. There is no automatic free charge. A charged choice can be armed while the ball is caught; offensive duration waits for launch, while Anchor begins guarding immediately.

The power menu uses a single row of anchor, arrow and cosmic-ball icons. A short indicator underneath the paddle shows remaining active duration. Pause, Retry and Continue retain their established semantics.

### Nerra's machinery and attack

The right pincer grips the actual chain endpoint. Link travel and wheel rotation accumulate from the hand's physical haul distance. Recovery relaxes the arm without reversing the ratchet's earned rotation. The chain is released when Nerra faints.

The water attack comes from the measured tip of the animated left crusher claw. Water gathers there during the wind-up; the target lane is chosen once, and the shot is emitted from the actual firing pose toward that saved target. A landing ripple communicates danger without a connecting aim line. The earlier disconnected side outlets are removed. The projectile retains its swept collision, rounded water core, foam trail and ball-interception response; enemy shots do not break cargo bricks.

Anger raises the claws and changes the live facial pose. Getting hit uses the hurt pose, while defeat uses separate dazed and fainted expressions. The hauling wheel, rising basin, raft springs, breakable braces and descending refuge remain the encounter's physical cause-and-effect loop.

### Original Vault presentation

`src/vault.js` reuses the rendered Bellforge hall as the Vault's rear environment, with a dark recess behind the registered brick field, stone supports, a lower sill and a masonry entrance arch. The notch extension samples the same backdrop. `tools/pack_art.py` embeds this existing source as `keepBackdrop` so the canonical page remains self-contained.

The original princess frames, serpent path, grid, cage, collisions and power rules are preserved. The owner then explicitly requested a snake graphics pass and deferred difficulty/black-block changes. A new emerald head family and matching curved scale/clearcoat body presentation replace the older faceted appearance. Breath, dazed sway and coherent hit recoil stay centred on the existing head core. The original head atlas and plate remain fallbacks. The atlas stores measured mouth outlets per expression and facing; venom uses the same rotation, bob and deformation as the head. The initial graphics-only audit against `8286cee9` confirmed all 55 non-draw methods unchanged. The subsequent capture request below explicitly revises presentation after the loss is committed. The complete 400-cell layout still retains all 45 granite cells and 18 bar cells. See [`art/snake-emerald/SOURCE.md`](../art/snake-emerald/SOURCE.md) for authored expressions and explicit aliases; this is a raster/presentation upgrade, not a change to the rescue rules or a new skeletal model.

### Head-led capture and visible laugh

The owner expanded the snake pass after the new atlas was ready. `src/serpent-capture.js` snapshots the complete existing smoothed body at the second strike (attack time1.22). The head then travels a continuous route around Lumi's waist, and every section follows that history. The centreline length is conserved, including the original tail extension; no set of control points is simply morphed into a ring. Capture samples are already smoothed and are not resmoothed or extended by the renderer.

The head wraps by2.55, turns toward Lumi, then alternates the new grin and open-mouth pose with a small tip/breath pulse from2.65. The attack timeline ends at4.2. The existing0.6 time scale makes the terminal choreography readable. This does not extend the pre-second-strike save window. Ball/laser collisions against the serpent are already disabled in `caught`, and `loseBall()` now returns in that terminal phase so a draining ball cannot replace the capture ending. All other phases retain their existing lost-ball behavior.

The lower/front portion of the same ribbon is drawn over Lumi's waist after her body; the rear portion remains behind her. Her existing animated scared pose is supported by an8-unit lift, a small body tilt and settling struggle. Her face remains visible. The head looks toward Lumi with bounded side-view roll (at most0.5 radians), rather than rolling upside down with the ellipse tangent. A small reusable256px scratch surface blends the two facing rows with preserved skin opacity; modest width compression suggests the yaw. The head is drawn behind Lumi during the rear half of the wrap. The final route passes through a rear-neck anchor18 units behind and6 units below the fixed head core before approaching the skull. `capturePose()` caches a pure sample by attack time; only this committed presentation uses the cache.

The venom spray still uses the measured moving mouth. A wet acid film gathers on the target, followed by falling drops and steam in the gap. Guarded targets do not show the melting overlay. Target selection, timing, brick removal, shielding and route changes remain the existing rules. Dungeon glazed bricks, chips and dust are preserved; no black blocks were removed.

### Evidence and next checks

Current receipts are under `docs/validation/fantasy-refinement/`; the Bellforge independent review is under `docs/validation/bellforge/`. Browser full-charge, attack and defeat captures are explicitly staged. Separately recorded earned model routes use actual public controls and do not inject health or resources.

The complete unit suite passes 365 tests. Phone-sized Chromium checks cover iPhone and Android layouts. Short desktop and rotated windows are checked for the reported load error and usable controls. These checks do not establish physical-handset performance or human difficulty. Ask the owner to replay both keeps and check whether the charge timing and threat rhythm now feel useful.

Preview:

- `http://127.0.0.1:4194/prototypes/fantasy/?level=bellforge`
- `http://127.0.0.1:4194/prototypes/fantasy/?level=tidewheel`
- `http://127.0.0.1:4194/dist/breach.html?level=2` — The Vault.

Future work must preserve the approved reference boards and source artwork, keep the mechanical origin of every attack visible, and update geometry whenever a live pose silhouette changes. Do not substitute a still-image assembly for runtime motion evidence.

Final capture review: [`snake-review.md`](validation/fantasy-refinement/snake-review.md) records the exact tested source/build, natural approach, mirrored fixture, mouth attachment checks and seven-second motion clip. Both 393×852 and 412×915 browser viewports passed with no page errors. The upright head, rear-neck connection and clear Lumi face were independently inspected.


### Successful rescue: head-first return to the tunnel (2026-10-20)

The owner approved the emerald capture sequence and requested one remaining change: after Lumi is saved, the serpent must turn toward its original tunnel and return head first. The old departure stepped the body backward through cell history and faded it in place. The new presentation snapshots the complete current body at `checkBreach`, turns the head, and lets the continuous ribbon follow the return route. `src/serpent-retreat.js` owns the pure motion sample; `Vault.retreatPose()` caches it by elapsed simulation time.

The successful-rescue branch clears an unfinished attack so its strike expression and camera cannot persist through the escape. The body is rendered from the prepared ribbon, the head faces its travel direction, and opacity remains one until the tail has entered the tunnel. The masonry entrance remains visible after departure. A cleared-board result waits for the departure to finish. Live rescue conditions, difficulty, dungeon bricks, damage, rewards and the approved failed-capture choreography are retained.

Validation and exact source/build hashes are recorded in `docs/validation/snake-retreat/`. Phone browser scenarios stage an opened rescue corridor at early, midway and last-moment rescue states; these exercise the actual successful-rescue transition but do not establish earned wins or physical-phone performance.

The retreat uses a compact forward-leading turn, then the already travelled body/history corridor. It lasts 4–5 simulation seconds depending on route length; the existing rescue slow motion still applies. The head retains one native facing on a straight vertical approach, with short transitions only when the direction changes. The full 374-test unit suite passes; the source audit preserves 51 of 55 previous non-draw Vault methods exactly, with only constructor, rescue transition, presentation point selection and level update changed. Capture motion, rescue rewards, all 400 layout cells and the 45 granite/18 initial bar counts remain exact.

Maintenance: the retreat is terminal presentation, not a new collision-driven snake controller. Its turn projects 6 units forward and 12 sideways, rejoins the previous body about 24 units behind the head, then follows reversed tail history into the original mouth at (284, 88). Corridor corners round within 3 units. Future layouts must leave clearance for this turn; the helper reports an incomplete history instead of drawing a direct shortcut through walls. Very long future routes may exceed the nominal 180-unit/second travel target because duration is capped at five seconds. The current authored encounter is the validated scope.

Final browser acceptance: all three rescue fixtures passed at 393×852 and 412×915 with zero page errors on HTML `CDFF74B582002029D5E4B2BF3B98099B69F3583AC6BA39EFEB994774436A85F7`. The late fixture cancels the first strike and applies six staged legal recoil cells before opening a body-free rescue corridor; it is not an earned win. Native portal frames show a single head facing inside, and the recorded Main loop completes the departure. The held ball applies existing slow motion, so the replay takes about 11.85 wall-clock seconds. See the receipt README for the complete scope.


---

# Part Q: Approved new keep references

*Source: `design/phase1/princess-two-levels.md`*

## Two new princess encounters

Status: both visual boards approved by the owner, 2026-10-20. Preserve their character identities, materials and atmosphere. Separate moving machinery, collision models and browser encounters are in production; approval of a board is not evidence of completed animation or playable balance. The existing snake Vault and Frost Warden remain separate encounters; Brum remains an ally. No new chapter number is assigned by this proposal.

### Latest owner revision and implementation pointers

The owner subsequently requested broader supports, more bricks, a smaller grounded crab, a real chain in its claw, lateral movement, hurt/anger responses and a distinct attack. These requirements supersede the preliminary counts and claw-on-wheel proposal below. Bellforge now has 30 coloured cells on both phone layouts and extended rolling ramps; Tidewheel has 24 cells on two moving rafts. The crab hauls a chain around a lower hoist, with warned stronger pulls after repeated hits and a separate interceptable water projectile. Keep the ordinary ball in the readable 2D foreground; buoyant rafts and bounded currents supply the water interaction. A parabolic aiming system is not implemented.

The authoritative numerical contracts, actual geometry, reproduction commands and evidence are [Bellforge physics](../../docs/BELLFORGE_PHYSICS.md) and [Tidewheel physics](../../docs/TIDEWHEEL_PHYSICS.md). Current browser entry points are `prototypes/fantasy/?level=bellforge` and `prototypes/fantasy/?level=tidewheel`. They are standalone previews, not new slots in the five-chapter APK. The remainder of this document preserves the approved visual direction and original design proposal; use the implementation documents when their measurements differ.

| Board | Main physical play | New villain | Kit signature |
| --- | --- | --- | --- |
| [A — Bellforge Run](img/princess-bellforge-a-v1.png) | Rolling iron bells, hinged ramps and momentum reversal | Korr, a four-legged armoured boar | Echo Guard redirects one live bell |
| [B — Tidewheel Citadel](img/princess-tidewheel-b-v1.png) | Buoyant brick rafts, counterweights and sluice flow | Nerra, a castle-shell crab with two different claws | Undertow Anchor reverses a surge |

Both preserve the actual blonde/pink/crowned Lumi and navy-armoured Kit reference identities. The lower-left control remains Kit's face orb. Large Kit poses on the right are presentation studies, not a full body under the paddle. Villains have their own anatomy and motion: Korr's short hoofed legs, tusks and heavy snout; Nerra's shell, stalk eyes, crusher claw, gate claw and articulated walking legs. There is no new ape, snake recolour or Yeti variant.

### Common controls and fairness contract

Keep one-finger paddle movement and the existing ball/aim language. Use the current 360-unit world, ordinary radius6, nominal speed345 and100×14 paddle as the first blockout baseline. No mode changes input sensitivity or secretly changes collision size. Equal36×18 coloured bricks give broad productive contacts; grey decoration must not become invisible blockers. Keep at least42-unit flank paths and32-unit gaps at every extreme moving pose. Those dimensions must admit the full normal and cosmic ball diameter with clearance, not only their centres.

Keep the lowest brick/physical obstacle at least210 units above the paddle on the shorter phone layout, plus the existing126CSS-pixel lower control reservation. At345u/s that is roughly0.61s of straight downward travel, or0.48s at the1.28 rally cap; these are travel estimates, not measured human reaction. Both393×852 and412×915 require an actual layout pass. The boards are art/composition studies rather than literal phone measurements; their HUD, type, object counts and perspective are not automatic runtime specifications. Use Lilita One/Rubik in production.

Broad villain body contacts always reduce HP, including during preparation/recovery. There is no compulsory tiny weak point, ordered symbol, narrow opening, purchased item or timed invulnerability wait. Environmental counters provide faster, more satisfying damage. A safe opening demonstrates each hazard before it can harm Lumi. Pause, background suspension, aim/serve and Continue must have explicit clocks: first serve starts pressure; replacement serves auto-launch after3 active seconds; Focus/SLOW do not freeze enemy threat time; true pause and the power picker do.

For these proposals, each Kit signature uses one existing orb resource, with provisional18/22/26 productive ordinary-hit credits banked at no more than one credit per active second. No second meter or free double spend. Enemy destruction, arrows and active cosmic contacts cannot recharge their own power. This is a proposed per-level charging contract, not a change to existing Vault/Frost rules. Usual pickups can remain optional. Saturated/unavailable casts keep charge.

### A — Bellforge Run

**Story and objective.** Korr has jammed Lumi's bell-lift above the foundry. Defeat his broad armoured body, stop the winch and open a bridge so Lumi can leave. The rear plinth/arches are clearly recessed scenery; only the foreground ramps, weights, bricks and measured actor silhouettes collide. The board's dramatic background bell is scenery unless explicitly admitted as a physical asset.

**Physical loop.** Korr lifts a hoof to cock a visible bell hopper; a1.3s minimum snort/lever tell previews the chosen ramp. A radius14 iron bell rolls through short, visibly hinged ramp sections under bounded gravity, angular motion and actual contact normals. Author its full route to a counterweight dock beside the lift; do not teleport between ramp endpoints. Ramp pins are broad optional30×18 breakable housings: breaking one rotates its connected ramp smoothly to its stop and opens a return lane. Both poses remain collidable. The safe teaching bell falls into an empty catch tray without moving Lumi.

A normal ball contact deals one bell HP and imparts a capped physical impulse. A bell has2HP: the first contact can slow/reverse it; a second shatters it. A returning bell that reaches Korr's broad shoulder deals4HP and staggers him for1.5s. Side/body hits by ordinary balls still deal1HP throughout. Broken bell fragments are visual, give no charge/drop farming and never damage Lumi or the paddle.

**Stakes.** A bell that physically reaches the dock turns the visible ratchet one tooth, lowering Lumi's lift by12u. Each mode starts with enough visible travel above a guarded danger stop for the misses below. The final approach gets a distinct ratchet clang, trembling chain and Lumi's worried face. Failure stops the lift and fades before any injury. The dock cannot double-trigger while a bell overlaps it. Lost player balls retain the usual life cost; a rescue failure and last-life miss resolve only once.

**Echo Guard.** On a charged tap during a live bell warning/route, Kit forms one solid shield deflector in its visibly previewed catch lane for3s. One bell makes real swept contact, rebounds up the open return ramp and can strike Korr; the shield then retracts. No long light trail, remote instant boss damage or invisible catch volume. A tap with no eligible bell holds charge. Normal ball defence remains sufficient.

| Provisional mode | Korr HP | Bell interval after first harmful release | Active bells | Lift mistakes allowed |
| --- | ---: | ---: | ---: | ---: |
| Easy | 24 | 10s | 1 | 8 |
| Medium | 32 | 8.5s | 1 | 6 |
| Hard | 40 | 7.5s | 2, staggered by≥3s | 5 |

First harmful release is no earlier than12s after launch. No overlapping same-lane warnings. After a successful reversal give a1.5s stagger/breather before preparing another bell. Last boss HP loss immediately latches safe rescue; subsequent ball drain or bell arrival cannot revoke it during the bridge/lift animation. Continue retains boss/ramp progress, restores two ratchet teeth up to the starting allowance, clears live bells and grants at least3s warning grace; it does not resurrect the boss or duplicate rewards.

### B — Tidewheel Citadel

**Story and objective.** Nerra holds the castle's sluices shut while Lumi shelters on a high refuge balcony. Defeat the crab and empty the basin. Lumi then opens the final manual gate, giving her an active rescue beat. This encounter has no cage or marching protector posts.

**Physical loop.** Two buoyant raft frames each carry a3×3 array of equal breakable bricks. Initial centres are approximately(94,300) and(266,300); each raft's full collision hull, brick cells and ropes must move together. Author bounded bobbing/tilt (≤8°) and horizontal drift so the minimum flank/gap contract survives all poses. Independent broad counterweight housings take2 ordinary hits and open their connected sluice for4s, draining24u of water. They are optional shortcuts: all ordinary shell/claw impacts still reduce Nerra HP.

Nerra's gate-handling claw pulls back for1.5s, water visibly gathers, then a low surge travels across the basin. A warned surge raises the waterline by24u and pushes raft mass; it is not an instant wall deletion. Water starts at y420 and failure is reaching Lumi's safe line at y190, leaving230u of initial headroom. Water affects raft buoyancy and applies a bounded, smoothly ramped horizontal current of at most25u/s to the ball; it never changes ball collision radius, reverses vertical velocity without contact, teleports the ball or hides it behind foam. Player balls and actors remain in the foreground. Refraction/foam stay faint around the bright ball. Prototype this simplified height/current system before any fluid effect production.

Two normal ball contacts on the preparing gate claw cancel that surge, but hitting its large shell is always productive damage. One claw can attack at a time; no simultaneous hidden surge. For teaching, the first pulse is contained below a harmless marked ledge. A released counterweight and active surge use swept tests against visible geometry; no unconnected rope or silent collider remains after destruction.

**Undertow Anchor.** A charged tap deploys a tangible anchor on the local sluice wheel, connected by a short visible chain. It reverses that wheel for4s, cancels the next preparing surge and drains one24u step. This is one local physical tool, not a beam from the corner portrait, a global time freeze or repeated free healing. While no gate/pulse is eligible, charge is retained.

| Provisional mode | Nerra HP | Harmful surge interval | Current cap | Warning |
| --- | ---: | ---: | ---: | ---: |
| Easy | 24 | 11s | 15u/s | 1.8s |
| Medium | 32 | 9.5s | 20u/s | 1.6s |
| Hard | 40 | 8s | 25u/s | 1.5s |

First harmful surge is no earlier than12s. A cancelled surge grants2s of calm water. Last32u of headroom triggers a visible waterline/face warning, not a new opaque HUD panel. Defeat latches success before any same-tick surge/life loss, opens both gates and freezes damage during Lumi's escape. Continue preserves boss damage and broken housings, lowers water48u, clears the active pulse and grants3s grace; it never rebuilds already broken score bricks or duplicates drops.

### Production and test gates

These values are starting hypotheses, not bot/human balance claims. Make one bounded ordinary-ball blockout for each before dressing the full level. Test whole-ball access around every moving ramp/raft pose; compound actor once-per-contact damage; angular/rising-water motion against the same drawn geometry; earliest swept contacts; no enemy-farmed charge; normal-ball wins with no optional power; earned signature before the encounter ends; no timing stall exploit; same-tick victory precedence; pause/Continue/save state and native touch/readability on both phone sizes. Preserve failures and adjust tuning from evidence.

Korr needs idle/snort/hoof lever/roll release/shoulder stagger/hurt/disabled clips, readable face expressions, separate bell/pivoted-ramp/lift-ratchet/bridge assets and real articulated hoof anchors. Nerra needs idle/claw grip/windup/surge/recoil/hurt/retreat clips, shell/claw/leg collision poses, separate raft/rope/counterweight/gate/water layers and measured joint anchors. Both reuse existing Lumi/Kit rigs and expression quality, but require finished source-faithful assets and in-engine comparison; these boards are not sprite sheets or finished models.

### Reference research and preservation

Nintendo describes the original arcade game as climbing through a construction site to rescue Lady while dealing with obstacles, barrels and the hammer. The useful abstraction is a visible goal above readable moving hazards—not Nintendo's characters or exact map. [Official Arcade Archives DONKEY KONG](https://www.nintendo.com/us/store/products/arcade-archives-donkey-kong-switch/).

Nintendo's Returns HD tips describe jumping, rolling, ground pounding, grasping objects and riding hazards, with a more forgiving mode offering additional health/recovery. Those are references for physical cause/effect, variety and explicit assistance; the bell momentum, sluice/raft rules, villains and Kit signatures here are original design proposals. [Official Returns HD controls/tips](https://www.nintendo.com/us/whatsnew/get-tips-to-start-your-barrel-blasting-adventure/).

Original local references: `assets/princess/Idle_00.png`, `assets/kit/Idle_00.png`, `assets/kit/faces/Idle_face_00.png`, `assets/vault/brick_b_1_0.png`. Both1536×1024 RGB boards were made with the built-in image tool and have empty PNG metadata. Prompts and reference paths: `princess-two-levels-prompts.json`. Image SHA256: A `53ef9248cd4bdc24dc8378c3ac014cd82491bff3869c7bbad0ea309a40a8aba5`; B `c2b5b6b26c8555374fe4dda98fde9d6764967e4b6667884f0aba064d8b2a7351`. Runtime, APK, shared handoffs and archive catalogue are untouched by this design task.


---

# Part Y: Bellforge machinery and encounter

*Source: `docs/BELLFORGE_PHYSICS.md`*

## Bellforge Run: physical encounter contract

Implemented as a standalone, DOM-free model in `src/fantasy/bellforge.js` on 2026-10-20. The shared browser at `prototypes/fantasy/?level=bellforge` supplies the actual art, touch controls and presentation. This is separate from the five-chapter Android release and from Starflight. APK status remains in `MOBILE_PREVIEW.md`.

Korr is the ruby/plum armoured boar selected in `design/phase1/img/princess-bellforge-a-v1.png`. He operates the bell hopper and ratchet lowering Lumi's lift. Defeating his broad physical body stops the winch and permits her escape. Brum remains an ally; no selected character was recast.

### Shared model interface

```js
new Bellforge({
  width: 360, height: 700, difficulty: 'easy',
  paddleY: 610, geometry: {},
});
game.setTarget(worldX);
game.launch(-Math.PI / 2); // absolute upward angle in radians
game.canActivate('echo', { ignorePause: true }); // menu eligibility only
game.activate('echo'); // strict: cannot cast while paused
game.pause(true);
game.update(seconds);
game.continue(); // once per encounter, after a loss
// Retry constructs a new Bellforge with the same level/mode/aspect.
```

Authored world width is360 units. Heights700/760 are model route fixtures; the browser measures its portrait aspect and reserves126CSS pixels beneath the paddle. The constructor also accepts a wider logical field, but requires width≥360, height≥700 and580≤paddleY≤height−30. The default paddle is at height−90; production callers explicitly pass their control reservation.

| Field | Coordinates / meaning |
| --- | --- |
| `paddle` | Centre `x`, previous `px`, top `y`, width100, height14, `targetX`, actual `vx` |
| `balls` | `id,x,y,px,py,vx,vy,r:6,caught,dead,contacts:Set`; one normal ball in this encounter |
| `bricks` | Top-left `x,y,w,h,hp,maxHP,colour`; six rows of equal36×18 colour cells; optional30×18 two-hit `type:'pin'` with `rampId` |
| `ramps` | Fixed actual `pivot`, local `contactOffset`, length, angle/previousAngle/targetAngle, `omega`, thickness8, actual top-face endpoints `a,b` |
| `bells` | Mass centre `x,y`, previous `px,py`, velocity, radius14, HP2, spin/angle, `teaching,returning,dead,docked,rampId` |
| `villain` | HP, maxHP, stage/stageAt/stageTime/until; world-space compound `body`; render foot at(88,161), visual centre(88,105) |
| `villain.defeat` | Null in combat; after final hit: age, stagger/slump/dazed stage, stage progress, fallback raster frame3, fixed-foot offset/angle/scale and daze intensity |
| `lumi` | Lift location, `baseY:105,targetY,steps,allowance,escape,worried`; y moves at≤30u/s |
| `dock` | Bell-only trigger rectangle(294,312,36,28); no invisible player-ball wall |
| `guard` | Actual deflecting segment `a,b`, remaining/age/used; null while absent |
| `effects` | World centre, kind, age/life; bounded80 entries; brick-break adds colour,w,h,vx,vy |
| `state` | `play`, `lost`, `won` |
| `phase` | `serve`, `play`, safe `rescue`, or final safe `breach` descent |
| Other | Active threat `time`, lives3, score, charge0–100, pending raw `chargeBank`, `continued` |
| Ending clocks | `rescueDelayRemaining` holds Lumi until Korr settles; `rescueRemaining` includes that delay plus escape |

All positions and colliders are model coordinates, independent of Canvas scale. Exports `rampPose` and `sweepMovingSegment` are pure helpers. `BELLFORGE_MODES` contains the mode hypotheses below. `BELLFORGE_ENDING` exposes the stagger/slump/settle/escape timings. Unknown mode falls back to Medium.

### Motion and collision

`update` rejects nonfinite/nonpositive delta and bounds one call to0.1s, divided into≤1/240s steps. The caller should pass regular animation deltas rather than expecting a multi-second call to catch up. True pause freezes every field, warning, credit, effect and physical body. The model has no renderer or DOM dependency.

A first ball reversal before a same-substep dock arrival replays only the remaining bell motion and supersedes that predicted arrival; a later hit cannot erase an already physical ratchet contact. Static rectangle and compound-circle queries reuse `sweepTarget`/`overlapsTarget` from `carrier-physics.js`. Rotating ramps use conservative advancement against an angular capsule, bounded by projectile travel plus the rotating arm's maximum travel. Each reflected remainder queries only the remaining portion of the ramp/bell/paddle movement; it does not replay the complete angular step. Contact response uses the actual angular surface velocity. A bell preserves gravity-driven momentum with low ramp restitution; a player ball preserves its established arcade speed after angular reflection. Normal speed starts345u/s and paddle rallies cap at1.28×; the vertical component cannot settle below22% of total speed.

Korr's four physical poses use49/48/51/49 conservative alpha-inscribed circles (idle/windup/release/stagger), measured at3pixels/unit from the retained raster. They include broad head/torso/snout and separate hooves, leaving leg gaps empty. All sectors share one target identity, so overlap cannot double-damage the same contact. Normal body hits always deal1HP in every attack/recovery stage. `geometry.korrBody` can supply fixed world-space shapes; `geometry.korrBodies` supplies per-pose local `[x,y,r]` triples relative to the supporting foot. The compiled defaults match the manifest's measured `korr.collisions`.

The full Korr atlas canvas is170.667×149.333u at its actual supporting-foot pivot, not136×112 stretched artwork. The latter numbers describe the approximate opaque footprint. A substantial support at y161 is scenery behind the separate rolling lane. Bells emerge from the exposed hopper outlet at(164,147), outside the old incorrect birth point inside Korr's body.

Initial top-face surfaces:

| Ramp | Contact start | Length | Angle | Broken-pin stop |
| --- | --- | ---: | ---: | ---: |
| 0 | (123,172) | 72 | .19rad | −.32rad |
| 1 | (174,240) | 78 | .17rad | −.32rad |
| 2 | (245,307) | 68 | −.12rad | −.32rad |

The source's measured top face is displaced from the hinge. `contactOffset/length` equals(.07088607594936712,−.08144244921989992), derived from manifest contactA/B and hinge. The model rotates around the actual hinge; the renderer maps contactA/B to `a/b`. The hinge therefore remains fixed instead of orbiting around an arbitrary image-box edge. Pin destruction approaches the stop at≤.85rad/s. Geometry overrides may supply ramps with actual `x,y` hinge coordinates or `contactStart`, plus a local `contactOffset`.

All mixed start/stop combinations retain≥32u of clear passage between physical ramp capsules and≥42u side clearance. The current phone layouts contain30 full colour bricks across six rows (formerly22 in four). The first two upper-right column pairs stay empty for the visible bell route/ratchet, and the broad middle opening remains. A conservative keepout omits cells overlapping pins, either ramp stop or the ratchet on a shorter synthetic field; the700u fixture has25 colour bricks. Both actual phone aspects retain the same30-cell plan. Colour-cluster spacing is breakable geometry rather than a claimed open passage. The lowest colour surface ends210u above the paddle. Bell-only dock/catch triggers do not become invisible player-ball blockers.

### Bell loop and readable stakes

Korr's sequence is idle→windup≥1.3s→release.45s→recover.85s→idle. A returning bell causes1.5s stagger and cancels a pending release. The first teaching windup starts1.5 active seconds after launch; its actual rolling bell touches all three authored surfaces and enters the empty catch without lowering Lumi. First harmful release is no earlier than12 active seconds. Active counts and warning stages prevent overlapping same-lane windups; Hard's releases are naturally separated by≥7.5s, exceeding the3s stagger requirement.

Bell gravity is220u/s² with a360u/s speed cap. Spin tracks actual horizontal rolling motion. Balls and bells use relative swept contacts. First ordinary hit removes one bell HP and imparts a150–290u/s capped impulse. A second separated contact shatters it; remaining overlap cannot farm HP. Fragments are presentation only. A returned bell physically reaching Korr's compound shoulder deals4HP and staggers; it cannot deal damage remotely. Bells that miss the ratchet fall to a harmless catch at y365 rather than reaching the paddle.

A physical dock arrival increments the ratchet exactly once and changes `lumi.targetY` by12u. The lift moves continuously at≤30u/s; the final two remaining teeth set her worried expression. A final dock latches `breach`, clears further hazards, and finishes the bounded descent before `lost`. There is no injury animation. A last legal Korr hit is resolved before pending dock/life losses and latches safe rescue immediately. Every live bell, queued dock, guard and pending warning is cleared; player balls park, and no further bell can be released. A final reflected bell also exits the current bell iterator immediately, so a later same-step ratchet arrival cannot survive the safe latch.

Korr's readable defeat takes3.4 active seconds. The first.45s recoils the stagger pose; the next.65s eases into a grounded slump; a.5s dazed hold precedes Lumi's1.8s escape. `phase` stays `rescue` and `villain.stage` stays `defeated` throughout. `villain.defeat.stage` distinguishes `stagger`, `slump` and `dazed`; its fallback frame is3, offsets remain zero, angle eases from0 through−.07rad to+.08rad, and scales settle at(1.04,.82). The renderer applies these transforms around the unchanged supporting foot(88,161), swaps to dedicated dazed art after.22s and collapsed defeat art after.9s, and fades `daze` to1 after the slump. This is authored keyed-raster presentation data, not a new skeletal kneeling rig. `lumi.escape` remains0 for1.6s, then advances0→1 over1.8s; the shared renderer eases Lumi and the lift upward28u with chain endpoints following. Pause freezes the complete sequence, and the settled dazed pose persists after `won`.

| Mode | Korr HP | Harmful release interval | Max active bells | Lift teeth | Echo credits |
| --- | ---: | ---: | ---: | ---: | ---: |
| Easy | 24 | 10s | 1 | 8 | 18 |
| Medium | 32 | 8.5s | 1 | 6 | 22 |
| Hard | 40 | 7.5s | 2 | 5 | 26 |

These remain starting balance hypotheses. The ordinary route never requires a tiny weak point, pin destruction, Echo or payment.

### Echo Guard and recovery

Every genuinely damaged ordinary brick/pin HP banks one credit, bounded by the remaining meter capacity. The meter drains that bank at no more than one credit per active second. Destroyed targets, Korr, bells, enemy/foreign objects, arrows and active cosmic contacts cannot refill replacements. There is no passive energy or second resource. With the finite authored grid, Echo cannot be spammed indefinitely.

A full charged tap during a harmful windup or early live bell route deploys the real segment(187,205)→(217,175) for3s, with a.12s visible deployment. One actual swept contact rebounds the bell up the open return lane and retracts the guard over.35s. The projectile still has to reach Korr. No eligible bell or saturated guard retains the charge. `canActivate(...,{ignorePause:true})` is only a safe menu predicate; `activate` still rejects pause.

Initial serve auto-launches at8s; replacement caught serves auto-launch at3s while active threat time keeps running. Continue is once only, preserves Korr/pin/ramp/score/credit progress, restores two ratchet teeth and at least two lives, clears live bells/guard and gives≥3s before another windup. It cannot resurrect a defeated boss or repeat rewards. Retry is a fresh constructor, with no held input owned by the model.

### Validation and limits

#### Fresh physics recheck — 2026-10-20

The owner requested a new pig/crab/all-level physics review. Bellforge required no runtime change: model SHA256 remains `A36418F1A40E5B95521065D27F80497C241BC30BAA4E1789DA3E9BE7CE3693CF`. All22 focused tests pass again. A separate fixed-seed ramp CCD stress audit checked3000 near-surface directions at345–5000u/s, the actual1/240s step and≤.85rad/s ramp motion. Of2290 reference cases penetrating the moving capsule by>.02u, none were missed. This bounded sampled audit does not prove exact grazing contacts or every possible trajectory.

Fresh ordinary and optional-earned-Echo model routes all finish with three lives and no Continue. The same maintained collision-forecast policy is used once per row/variant, without HP, position, resource or progress injection:

| Model height / paddle Y | Mode | Ordinary win | Earned Echo run | First cast |
| --- | --- | ---: | ---: | ---: |
| 700 /610 | Easy |43.54s |36.52s |30.72s |
| 700 /610 | Medium |65.60s |65.60s |31.07s |
| 700 /610 | Hard |73.54s |73.54s |52.29s |
| 780.458 /665.038 | Easy |58.36s |46.90s |20.72s |
| 780.458 /665.038 | Medium |79.45s |42.47s |27.72s |
| 780.458 /665.038 | Hard |71.78s |70.43s |33.22s |
| 799.515 /689.417 | Easy |63.28s |46.65s |30.72s |
| 799.515 /689.417 | Medium |66.23s |68.12s |36.23s |
| 799.515 /689.417 | Hard |100.37s |86.52s |40.73s |

All eighteen bounded attempts won. First ordinary brick damage is.60s; first broad Korr contact is3.76–4.02s. Echo is earned and cast once in each optional run, but can miss a bell already diverted by a broken pin. Equal/slower completion times are retained rather than presented as guaranteed power damage. A separate no-input attempt auto-serves and loses all balls at10.80 active seconds, Korr24HP; waiting does not rescue Lumi.

Fresh real-page Chromium checks pass all six phone/mode control cases at393×852 and412×915: genuine touch launch/drag, first Pause after drag, complete pause/chooser freeze, Resume, fresh same-mode Retry, staged full-charge Echo selection/consumption, and Home. Two earned browser Easy routes finish59.625s iOS /45.183s Android, three lives, no Echo or Continue. These rounded browser worlds are781/800u high; the unrounded aspect fixtures in the model table are intentionally reported separately. The browser policy reads geometry and uses public `launch/setTarget/update`, so these are assisted routes, not a claim of touch-only human play.

Both phones additionally pass explicitly staged loss/actual-touch Continue/Retry and physical bell-dock danger-stop fixtures. Continue preserves destroyed pins, actual ramp angle, Korr HP, score and unused credit, restores two lift teeth/at least two lives, and grants the warning grace. Terminal state remains frozen. Two staged defeat timelines verify immediate hazard cleanup, grounded stagger/slump/dazed art, delayed Lumi/lift escape and final result. All browser cases have zero page/HTTP errors and identical before/after dependencies. Viewed rolling-bell, Echo, collapsed Korr and Continue frames show no new alignment blocker.

Permanent compact reports, six selected native PNGs, reproducible audit scripts and hashes: [`validation/physics-recheck/bellforge/README.md`](validation/physics-recheck/bellforge/README.md). Full local output: `out/physics-recheck/bellforge/`. These checks establish bounded collision/state correctness and an assisted route through every mode; human difficulty, physical-phone performance and a new APK remain unclaimed. Earlier receipts below remain historical evidence for their original scopes.

`tests/bellforge.test.js` covers world metrics, ramp clearance, fast/static and angular-tip CCD, actual raster hinge/anatomy mapping, the full teaching/harmful route, pin rotation, physical bell momentum and damage episodes, banked charge exclusions, pause/delta/serve timing, physical Echo, animated ratchet/fragment metadata, last-hit precedence, the fixed-foot defeat/escape timeline, complete ending pause/cleanup, reflected-bell final-hit precedence, Continue and ordinary public-input Easy wins at both model heights. The defeat revision passes22 focused tests, including both ordinary model routes. The shared browser's six-aspect controls and final two-phone staged reaction/escape review pass with zero errors; final Main/render/reaction dependencies match before/after. The dedicated collapsed art and moving rescue lift were viewed at both primary phone sizes.

Defeat-revision model SHA256: `A36418F1A40E5B95521065D27F80497C241BC30BAA4E1789DA3E9BE7CE3693CF`; focused test-file SHA256: `3A9BF4078E2F6EF0B835177E4A8A0F34A3F065B149D03EFC772D547C4CC75432`. No encounter HP, brick layout, bell route or power budget changed.

Ignored deterministic receipts are under `out/bellforge-proof/`; browser receipts/screenshots are under `out/fantasy-bellforge-browser/`. The model-assisted policy reads geometry to forecast paddle angles and changes gameplay only through `launch`, `setTarget`, `update` and optional legitimate `activate`. This establishes an earned route, not human difficulty, touch skill, device performance or production admission. Historical route failures are retained with their exact pre-correction geometry and must not be presented as current pass results.

The art family contains four authored keyed Korr combat rasters plus separate dazed and collapsed reaction poses, not a full skeletal hoof/walk animation. The shared renderer supplies actual hopper/platform/ratchet layers, Lumi/Kit expressions, brass contact fragments and phone UI; their separate browser receipts determine visual admission. No new APK or campaign slot is implied by this standalone module.

#### Earlier six-row measured checkpoint

Pre-defeat-revision model SHA256: `46F6297072BAF87B7C8D2E88875B3E1E4A7E99EC90A48F0AB3F5CF4BE7AC65CF`. Focused tests at that checkpoint:19pass; test-file SHA256 `69DDB9CC7124EA73E7A4B13EEC27C46B8C74D45078685482DEF481770498F5C8`. Actual frozen art manifest: `B810545F1C1CABBE6252FBAE0ECE8B4CCC1637946FD4BCA35D97C3A09D41FF13`. The timings below include the former1.8s ending; the current readable ending adds1.6s of safe presentation and does not inherit a new browser completion claim from these receipts.

One bounded deterministic policy run per mode/height/ordinary-or-Echo variant, all with three lives and no Continue:

| World height | Mode | Ordinary win | Optional earned Echo run | First cast |
| ---: | --- | ---: | ---: | ---: |
| 700 | Easy | 41.95s | 34.93s | 30.72s |
| 700 | Medium | 64.01s | 64.01s | 31.07s |
| 700 | Hard | 71.94s | 71.94s | 52.29s |
| 760 | Easy | 36.01s | 36.01s | 21.13s |
| 760 | Medium | 72.69s | 72.69s | 27.72s |
| 760 | Hard | 98.26s | 98.26s | 40.73s |

These are read-only-forecast assisted model routes, not human balance. An eligible cast can miss a bell already diverted by a broken pin; identical completion times do not prove added damage. No ordinary completion depends on the optional ability. Full outcomes/resources/provenance are in `out/bellforge-proof/model-routes.json`; prior geometry results, including failures, remain in its `history/` folder.

Actual browser page checks at393×852 and412×915 passed all six mode/device combinations: real touch drag/launch, first Pause tap after drag, complete pause and Kit-chooser freeze, Resume, fresh same-mode Retry, real Kit menu eligibility/consumption and return to menu. The Kit UI fixture explicitly stages full charge; it is separate from earned routes. Final cases use fresh Chromium and retain strict readiness; the helper now polls explicitly at50ms while animation frames are captured. Historical readiness timeouts are not labelled as gameplay failures.

Earned browser Easy rescues use only `launch`, `setTarget`, `update` and read-only geometry: iOS56.7625s, three lives/four teeth; Android61.6833s, three lives/five teeth. Neither casts Echo nor uses Continue. Both show the actual windup, keyed release, rolling bell, ratchet, rescue and result. All cases have zero page/HTTP errors. Logical fields are780.458/799.515 high, with paddles665.038/689.417 and30 colour bricks. Permanent receipts, selected native PNGs and SHA256SUMS are in [validation/bellforge](validation/bellforge/README.md); full local gallery is `out/fantasy-bellforge-browser/`. The cyan palette refresh is identified separately and does not acquire an unearned mechanical completion claim. Native video and any later Nerra-only art/loading changes have separate root review receipts.

The final shared-loader/input refresh passed all six phone/mode UI cases with zero errors; Main changed during that run, so its receipt explicitly retains both hashes rather than claiming a fixed-source seal. A later renderer-only refresh sealed current Main/render/model and both manifests unchanged at both phone sizes. The Bellforge paddle's image centre now uses its physical top plus half-height, aligning the visible metal with the caught ball. Those final openings are `validation/bellforge/*-opening-final.png`; this visual refresh does not repeat or replace the earlier earned routes.

The repeatable browser harness and read-only forecast policy are maintained in `tools/playtest/bellforge.mjs` and `tools/playtest/bellforge-policy.mjs`; neither imports an ignored output file. Run `node tools/playtest/bellforge.mjs` against the repository static server, or append `--ui-only` for controls/readiness. `tools/playtest/fantasy-visual.mjs` captures the two source-aligned phone openings and staged Tidewheel poses. `BASE_URL`, `PW_MODULE`, `BROWSER_EXECUTABLE` and `OUT_DIR` are optional environment overrides; exact commands and proof scopes are in the validation README.

Responsive/defeat integration is repeatable with `node tools/playtest/bellforge-defeat.mjs` (`--phones` for393×852/412×915 only). It checks ordinary touch launch, the first Pause after a drag, complete model freeze, Resume, an uncharged Kit menu and fresh Retry at six aspect ratios. It then stages final HP on the two phones and captures the actual renderer at stagger/slump/dazed/escape/result times. At renderer `7C4519AD…E13F0C7`, all six cases were source-stable, with no page/HTTP errors; the orb clears the paddle by18.91–19.64CSS pixels on the main phones and≥8.35CSS pixels in short previews. That retained-raster intermediate presentation is recorded separately in `validation/bellforge/defeat-responsive-intermediate.json`; newer reaction art and the subsequent `lumi.escape` lift movement do not inherit its visual approval.

The final two-phone rerun uses Main `728BBC49ADB17A215F7FEBFEA85488185927819EE1210ACCE5D1EAEC89BE7542`, renderer `57D691A16ACD59680F60BBFFE698110245F3220369A8A01FC744029CF0DD148E` and reaction manifest `11B2958079F617C556B8D8155195A156DC08F10FC69AFE7F7E86F639A6317544`. Both pass real control/Retry checks and the staged ending, with zero errors and stable source/PNG dependencies. The viewed final closed-eye collapsed Korr is grounded; Lumi/lift move together and remain separate from the mechanism. Final receipts and four native PNGs are in `validation/bellforge/defeat-responsive-final*` and `*-final-staged.png`. This is bounded staged visual/control evidence, not a new earned completion or physical-device performance result.


---

# Part Z: Tidewheel machinery and encounter

*Source: `docs/TIDEWHEEL_PHYSICS.md`*

## Tidewheel Citadel — physical encounter contract

Current revision, 20 October 2026: the owner's power/source/defeat feedback supersedes the C216 checkpoint below. Anchor no longer requires a short warning window; Arrow Volley and Starfire are selectable earned powers. Water is emitted from the actual animated crusher claw. The full earned meter is numerically snapped to100 rather than getting stuck just below the availability threshold. The earlier C216 receipts remain historical; they do not prove the revised powers or live fury artwork. This separate browser encounter is not in the five-chapter Android APK.

### Objective and layout

Keep the ordinary ball alive and defeat Nerra before rising water reaches Lumi's balcony foundation. Any separate ordinary ball contact with the visible shell or either claw damages Nerra; there is no colour order, precision symbol gate or invulnerable pose. Optional gate locks drain water when broken. One full earned meter buys a choice of Anchor, Arrow Volley or Starfire; power-caused damage cannot fund its own refill.

World width is 360u. The paddle remains at the shared lower phone location supplied by the client; its model width/height are 100×14u and ordinary ball radius/speed are 6u/345u/s. Walls occupy x≤12 and x≥348; the upper ball boundary is y67. The 390u scenic rear wall extends beyond the viewport. It supports a smaller Nerra at feet y232; the wall and balcony scenery sit in a rear depth layer and do not pretend to be foreground ball obstacles.

Two physical rafts, centred at x102 and x258, carry twelve equal 34×18u bricks each. Local columns begin at −54/−17/+20 and rows at −51/−30/−9/+12. Bricks have 3u gaps. The front face spans local y34..48, rather than a rectangle behind the whole bank. Each visible central 70u brace (x−35..35) has2HP; its first hit cracks it and its second breaks it, opening a broad lower entry. Each real brace hit awards15score and one ordinary charge credit. The two side endcaps remain solid and grant no rewards. Rear support planks remain scenery after the foreground brace breaks. Collision and source-art masking use those exact bounds and follow raft translation/tilt. A thirty-brick layout was rejected because its extra upper row consumed the short-phone clearance beneath the claws.

This breakable brace corrects an observed playability defect: a plain centre-catch policy at H780/initial angle−.22 could rebound below an inert deck for25.75s without any productive contact. Intentional bank-shot policies already won, but that did not excuse the empty-feedback loop. The new brace gives genuine damage/crack feedback on that first underside contact; no hidden brick damage or automatic aim correction is used.

Raft initial height is min(380,paddleY−265), with a mechanical tether stop exactly 20u higher. Buoyancy seeks waterY−38 within that range, with a spring16/damping7, vertical speed capped28u/s, lateral drift±1.5u and tilt±.08rad. The renderer draws the stops and ropes. Final full-pose clearance measurements must include both tilt extremes, both tether extremes and Nerra's ±12u patrol.

### Anatomy and moving contact

The v2 body is 190.08×171.072u, with idle/step/hurt/pull raster keyposes sharing a supporting-foot pivot. Each pose owns its measured head, shell, legs and feet stencil and two shoulder sockets. The added live fury roar has its own90 measured disks and new shoulder sockets; `villain.pose==='fury'` selects both the new artwork and its exact anatomy. Do not choose fury art from the numeric anger alone while the model is using a hurt pose. Right claw geometry owns a real grip and a separate free-chain end. The left crusher reuses the original raster at explicit .88 scale. Decorative chain links are not hidden ball colliders.

The runtime imports `src/fantasy/tidewheel-v2-geometry.js`; the browser and Node model use this same data. The generated data SHA is BA6E1BDAB8034A9E9F6835A8DB20879738FC2824E07F278EA76ECEF194ED0F23; its exact equality with the final manifest DEFC7D7D75AF13B50560CBABD79D5115CBEEAFA997D9ABC5452F5C5E0418FC69 is tested. Each body pose has90 opaque disks; the .88-scaled left crusher has63 and the new right gripper37, for190 actor disks. Body keyposes are discrete artwork; patrol translation is swept, while unrelated stencil indices are never interpolated across empty space. Claws rotate rigidly about their measured moving shoulder roots, and each local disk is swept using its actual transformed previous/current centre.

The separate `src/fantasy/tidewheel-reaction-geometry.js` admits the live roar without modifying the previous v2 data. Its measured source module is A4F3EC81C4D50E17279AF8805AD30DA8EE8406E2ECD9DA28FED503ECC3E266AE, reaction manifest11B2958079F617C556B8D8155195A156DC08F10FC69AFE7F7E86F639A6317544, and generated runtime module36EE0A32FC06359E6E5D202244D27B8FDD8F40EEF9CB0185946773C7F4A0CFF7. Fury uses the same unit size/foot pivot, actual crusher socket(−19.0050,−69.3527) and gate socket(64.2454,−58.2678). Source/module equality, genuine ordinary contact and full-r6 short-phone clearance are regression tested. Dazed/faint artwork is terminal presentation, not a reused live collision stencil.

Ball simulation uses bounded 240Hz substeps and swept circles against the moving bricks, deck, gates and anatomy. Shell and both claws share one compound `nerra` contact episode, cleared only after the ball leaves the union by 2u. A .1s minimum interval additionally prevents a concave seam from farming damage. A later genuinely separate contact remains productive. Normal reflection resolves in the moving target's frame, then restores the ordinary ball speed and at least75u/s vertical travel.

### Pressure, reaction and counterplay

The initial caught ball does not advance machinery or launch an attack. First launch schedules the initial pull twelve active gameplay seconds later. Replacement serves launch after three seconds. True pause freezes the world, the warning and the earned charge clock.

| Rule | Easy | Medium | Hard |
|---|---:|---:|---:|
| Nerra HP | 24 | 32 | 40 |
| Pull warning | 2.00s | 1.80s | 1.65s |
| Normal water rise | 18u | 22u | 26u |
| Enraged water rise, maximum per pull | 30u | 36u | 42u |
| Normal idle gap after pull recovery | 11s | 9.5s | 8s |
| Water-current acceleration cap | 15u/s² | 20u/s² | 25u/s² |
| Water-pulse warning | 1.50s | 1.40s | 1.30s |
| Water-pulse speed | 200u/s | 230u/s | 260u/s |
| Pulse gap after firing | 18s | 16s | 14s |
| Productive contacts / minimum active fill time | 12 /12s | 15 /15s | 18 /18s |

These are implementation values, not human balance certification. Pull and pulse attacks share one state machine, so warnings do not overlap. The first normal pull teaches the mechanism before anger can strengthen it.

Every productive shell/claw contact causes a .4s hurt response and briefly stops the lateral patrol. The warning/attack clock continues, so repeated hits cannot freeze an attack forever. Three productive contacts bank anger. After the first pull, this can bring the next pull forward to a three-second idle warning opportunity. A normal pull has a full warning, then a one-second physical action and1.2s recovery. During warning the left crusher rises from−.12 to+.5rad; during action it drops back to−.12. The right gripping claw starts at+.12 and hauls upward to−.55rad over .55s. The real chain runs from its measured free end to the lower hoist wheel at(310,244), then onward in the scenic mechanism. The wheel turns with that pull.

Two distinct contacts on the active claw during a warning cancel it. Broad body damage is always legal but does not silently count as that directed interruption. The power interface is `canActivate(kind,{ignorePause})` / `activate(kind)`, with kinds `anchor|volley|cosmic`. All three can arm on a full meter during ordinary combat or a caught serve. Unknown powers, terminal/rescue state, pause, insufficient charge or an already active choice reject without spending. Offensive power clocks wait while the ball is caught; they start at launch. The menu's ignorePause query never permits an actual paused cast.

| Power | Physical effect | Bound |
|---|---|---|
| Anchor | Cancels the current chain/pulse threat, drains24u immediately, visibly clamps the wheel and prevents a new attack during protection |8 active seconds; available while idle, not a narrow warning-only input |
| Arrow Volley | Five upward r3 arrows from alternating paddle emitters at x±16/y−18, speed480u/s. Each swept arrow damages its first actual opaque target once and is consumed; braces/endcaps can block it | Five arrows, .5s spacing,3s deployment; each arrow life2s |
| Starfire (`cosmic`) | One existing ball becomes an r8 piercing ball. It can damage each destructible target/contact episode once per pass; walls/endcaps remain solid |6 active seconds; no repeated overlap damage |

Each choice spends the same full meter once and clears its credit bank. Arrows and Starfire cannot earn charge. Ordinary hits still bank at most one refill, and time only converts earned credit: there is no passive generation. A1e−7 rounding tolerance snaps a fully earned meter to exactly100; it does not turn a partially earned meter into a free cast. Power timers/maxima are exposed as `powerTimers`/`powerMaxTimes`; `anchor.time/maxTime` also drive the visible clamp. A miss or Continue clears active powers/projectiles, while the unspent meter and encounter progress remain.

Starfire restores the normal r6 ball at expiry. If expiry occurs inside an object it was already traversing, that ball only finishes leaving that already-held overlap, without more damage or charge. New surfaces are immediately solid; the exit exception clears beyond the union. This avoids a trapped, expired ball without extending the damage window.

The chain-hung refuge starts at baseY75 and an enraged pull lowers it by 6u, up to three steps/18u total (targetY93). It animates at at most20u/s. The visible flood limit is always `lumi.y+REFUGE_LIP_OFFSET`, initially122 and at most140. The exported offset47 matches the actual lower edge of the cropped hanging platform to within.1u; removed wall corbels no longer define an invisible failure line. The cropped platform stays visibly clear of the hauling claw. Raising the platform adds40u of flood headroom relative to the earlier baseY115 version, and matching its actual cropped edge adds another18u; earlier receipts are labelled by their source hashes. Water rises at at most28u/s and drains at at most20u/s. Neither a target change nor a refuge step teleports the encounter into failure.

The separate pulse locks the current paddle landing lane when its warning begins. Its source follows the measured crusher-tip anchor through the real claw's preparation and recoil; the firing origin is sampled from that exact transformed muzzle, not a sidewall. It does not retarget a later drag. `pulseWarning.source` is the moving visible source, its `target/targetX` are fixed, and `villain.emission={from,angle,at}` records actual discharge. Exactly one r10 water projectile is fired, with a maximum three-second lifetime (enough for the longest native claw-to-paddle flight). Ball/arrow and moving-paddle interception are swept in relative motion. A ball or arrow deflects it into a short harmless .45s splash, without free damage/charge. A paddle hit costs one life, clears the attack and makes a fresh serve with at least three seconds of threat grace. Enemy water never damages or rewards the bricks. There is no forced loss from being underwater and no unannounced ball-speed reduction; the bounded current is lateral acceleration, not a new aiming axis.

### Win, loss and reset ownership

The actual final legal Nerra contact immediately enters `rescue`, clears hostile/friendly power projectiles and active powers, releases the hauling chain, and opens both gate locks. That owns the same tick over flood, pulse or ball-miss failure. The harmless3.6s defeat/rescue sequence shows stagger (<.35s), faint (<1.2s) and slumped/dazed rest before `won`. `villain.defeat` exposes age/stage/offsetX/offsetY/angle/scaleX/scaleY/daze. The foot remains planted (offsetY0); compression and a slight rotation create the slump instead of sinking the actor below the platform. The released chain becomes slack scenery and no longer pretends to follow a transformed hand under tension.

Flood failure is tested against the current visible foundation. Out of balls or an actual pulse hit can exhaust lives. Terminal `update` is inert. One Continue preserves Nerra HP, cleared bricks, brace damage/openings, broken gates, refuge steps and earned resources. It clears threats, restores at least40u of visible flood headroom (normally48u drain), creates a caught ball and six seconds of warning grace; the replacement ball auto-launches after three seconds. Retry is a fresh model and resets all progress.

Renderer contract: `villain.stage` is idle/pullWindup/pull/recover/pulseWindup/pulse/defeated; `pose` is idle/step/hurt/pull/fury. `footX/footY`, `frame`, `anger`, `enraged`, `fury/furyPulse`, `emission`, `defeat`, `stunUntil`, `hp/maxHP` are public. Each claw exposes root/previousRoot/angle/previousAngle/scale/mirror/partKey/grip; the crusher also exposes `muzzle`. `chain` exposes hand/pulley/route/pull/haul/scroll/wheelAngle/tension/released. Haul/scroll accumulate only actual positive chain-length gain during the pull; the wheel retains that ratchet angle through recovery rather than unwinding each cycle. `pulseWarning` exposes source/from/fixed target/targetX/angle/age/life; `pulses` expose x/y/px/py/r/vx/vy/age/life/dealt/reflected/harmless. `shots` exposes the finite physical arrow list. `lumi` exposes baseY/targetY/y/steps, and `water.limit` is dynamic. The dimensional water raster is32×48u, rotated around its measured opaque core; its circle remainsr10. Transparent tail/glints add no extra collision area.

### Revision verification

The revised model has40 focused tests, including all previous seam/layout/flood invariants plus idle/serve power arming, actual charge completion, no self-funding, finite cover-limited arrows, one-pass Cosmic contact and safe expiry, measured claw emission, cumulative hoist, exact live fury anatomy and grounded3.6s defeat. Model SHA E2E14ED4BC09F91F6DDEDF0A7CE030B6B1C578B51686A67B2D42CD83BAEF33B7 is frozen for integrated browser review.

The final8-run logical-phone Easy policy completed all ordinary/Anchor/Volley/Starfire attempts without HP/resource/actor writes. It uses the measured logical dimensions of393×852 and412×915 viewports and their126CSS-pixel paddle reserve, a fixed ordinary opening, coarse20Hz/8u paddle prediction and visible pulse dodges. Every power policy genuinely charged and cast twice before the result; first casts were17.91s at the iPhone logical size and16.57s at Android. iPhone outcomes were60.18/39.12/39.53/53.18s; Android61.82/53.33/47.01/71.44s, retaining1–3 lives. Power damage produced no charge and the source hash stayed unchanged. These are bounded coarse controller results, not browser/art or human-fun validation. These results were freshly reproduced in `docs/validation/physics-recheck/tidewheel/earned-powers.json`; use the maintained `tools/playtest/tidewheel-power-routes.mjs` adapter. The earlier pre-fury receipt remains at `out/tidewheel-powers/first-routes/routes.json` as history; its different reflection paths are not current evidence.

### Fresh independent physics recheck — 20 October 2026

The model remains frozen at `E2E14ED4BC09F91F6DDEDF0A7CE030B6B1C578B51686A67B2D42CD83BAEF33B7`. No gameplay fix or difficulty retuning was required. Forty focused tests freshly pass, covering fast moving-raft contacts, the compound shell/claw episode, charge/power ownership, measured firing origins, cumulative chain haul, smooth refuge/water movement, final-hit precedence and Continue.

The fresh2304-pose geometry sweep reports no actor/brick overlaps, including the full ordinary-ball clearance. Minimum outer/central lanes remain28.97/33.93u and minimum deck-to-paddle gap212.84u. Nine simple centre-catch openings all produce a real contact in0.58–1.34s. Twenty-two of27 fixed ordinary model routes win: Easy9/9, Medium8/9, Hard5/9. All five losses, including their remaining HP/lives and failure causes, remain in the receipt. These fixed controller outcomes do not certify human balance or guarantee a Hard win.

The fresh actual-browser suite passes six mode/phone control cases at393×852 and412×915, two staged machinery sequences and four input-only earned Easy routes, with zero page/HTTP/network errors and unchanged source/art seals. Ordinary routes win in33.74/32.75s; the earned-Anchor routes win in24.18/26.60s, each with one genuine UI cast. All retain three lives. A separate eight-case staged power/UI check verifies the three choices, exact discharge origin and grounded defeat on both phones; its full-charge fixtures are not earned progression.

The review exposed one stale test assumption: a fixed1.5s post-launch wait could end before the Easy water shot traversed the taller current phone playfield. The maintained browser test now derives the remaining flight from the actual projectile position/velocity and observes the full warning/lifetime for the dodge. Life-loss, brick-immunity and counterplay assertions remain intact. An earlier startup timeout under concurrent review load and the stale-wait failure are retained, alongside a clean isolated loader probe and the final full pass; they are not silently discarded or called gameplay failures.

Permanent receipts, retained failures and five viewed native PNGs are in `docs/validation/physics-recheck/tidewheel/`. The existing main/renderer hashes are `728BBC49…BE7542` / `57D691A1…DD148E`. Commands below reproduce the review; append `node tools/playtest/tidewheel-power-routes.mjs out/tidewheel-power-routes` and run `tools/playtest/tidewheel-powers-ui.mjs` with `OUT_DIR` selecting a new folder. This remains a standalone browser encounter, separate from the Android APK. No physical-device performance or human-fun claim follows from the automated checks.

### Historical C216 verification checkpoint

The focused suite has 29 tests, including the exact historical concave seam, inert endcap reflection, actual two-hit brace opening without reward duplication, early centre-catch feedback, exact v2 data admission, all four body poses and short-phone r6 clearance, actual platform-crop/flood-contact equality, real last-hit precedence, warned fixed lanes, swept moving-ball interception, one-life pulse cleanup, one-spend Anchor and Continue headroom/progress.

Pre-brace checkpoints are retained under `out/tidewheel-review/v2-final-routes` and `out/fantasy-review/tide-v2-final`; their successful aimed routes did not resolve the later centre-catch finding. The A3EC post-brace/pre-refuge checkpoint is under `out/tidewheel-review/v2-braces-routes` and `out/fantasy-review/tide-v2-braces-final`. The44AE raised-platform/pre-lip checkpoint is under `out/tidewheel-review/v2-refuge-final-routes` and `out/fantasy-review/tide-v2-refuge-final`. The final mechanical model is C216F74972AE53D65D762969284D215561E84B5F64A144BF0DA101122183DBF1; generated geometry is BE9DBE700427FD3E5C89D72DBEE0328105D2C0FE54732D88EE17CFD7174D7CD8.

The final fixed27 ordinary model routes at H700/780/800 produced 20 wins and 7 losses: Easy9/9, Medium5/9, Hard6/9. Each run uses only public launch/setTarget/update, three predetermined initial angles, coarse quantized prediction and fixed-lane pulse dodging; it never writes HP/resources/actors/progression. Losses remain in the receipt. Opening-only centre-catch checks on the final model give first productive contact in 0.58–1.34s across all nine fixed openings; the former H780−.22 idle loop now hits a real brace in .6875s. This establishes recoverability and prompt feedback, not human balance or passive-win claims.

The final full browser fixture run at 393×852/412×915 passed all six mode/viewport controls cases, both staged mechanism sequences and four bounded Easy public-touch routes. Ordinary wins were35.20s/3lives on iPhone viewport and45.07s/2lives on Android viewport. The signature-enabled iPhone policy finished in20.14s/3lives before any Anchor was earned/cast; the Android policy won in75.66s/1life with two genuinely earned Anchor casts. Do not label the zero-cast iPhone run as power-assisted. These are coarse assisted browser controls, not physical-device/human play. The final run has zero page/HTTP/network errors and an unchanged all-source/art seal. Earlier renderer-crossed receipts remain historical.

Permanent compact receipts and four selected full-phone PNGs are in `docs/validation/tidewheel/`. `browser.json` SHA 0451299D2A33E50A9501DCB48F9786EB286D6BA54DB5149DA98437D521279BDD records real primary/secondary touch pause after drag, Resume without a ghost click, blur freeze, held-Space rejection, actual Kit cast from a labelled charge fixture, Retry, Continue preservation, fixed-lane water dodge and legal earned routes. `routes.json` retains every bounded win/loss; `centre-catch.json` proves opening feedback; `geometry.json` records 2304 conservative pose/raft fixtures with no actor/brick overlap even after expanding anatomy by the ordinary ball's6u radius. Minimum outer/central lanes are 28.97/33.93u; the lowest deck-to-paddle gap is 212.84u (about.58s at345u/s after allowing the ball radius and paddle half-height).

The four-second desktop Chromium readback at190 actor disks measured callback CPU medians 2.8/4.0ms and p95 5.3/7.5ms at the two viewports. A single33.3ms RAF interval appeared in the first viewport; the second maximum was17.2ms. These bounded initial-play samples are not worst-case attack, physical-phone, GPU-completion or sustained60fps guarantees. They do not justify a speculative collision rewrite.

Reproduction from a fresh checkout (Node22; browser commands require Playwright's module and Chromium executable in `PW_MODULE`/`PW_CHROMIUM`):

```powershell
node --test tests/tidewheel*.test.js
node tools/playtest/tidewheel-geometry.mjs out/tidewheel-geometry
node tools/playtest/tidewheel-centre-catch.mjs out/tidewheel-centre-catch
node tools/playtest/tidewheel-routes.mjs out/tidewheel-routes
node tools/playtest/tidewheel.mjs out/tidewheel-phones http://127.0.0.1:4194/prototypes/fantasy/ --earned
node tools/playtest/tidewheel-profile.mjs out/tidewheel-profile
```

Serve the repository root before browser checks. `--probe` is a single iPhone/Easy case. Routes use a fixed coarse prediction policy, not HP/resource/actor writes; staged mechanism/resources/terminal fixtures are labelled separately. Profile telemetry measures desktop Chromium callback CPU/submission and requestAnimationFrame cadence, not physical-phone GPU completion or sustained handset performance.


---

# Part AA: Keep artwork production and measured geometry

*Source: `art/fantasy-machinery/SOURCE.md`*

## Bellforge and Tidewheel production layers

The owner approved `design/phase1/img/princess-bellforge-a-v1.png` and `design/phase1/img/princess-tidewheel-b-v1.png` as the visual references. These files contain independent new raster layers derived from those references. The full boards are never used as gameplay backgrounds or actor rectangles. Existing Lumi and Kit assets remain separate.

The permanent source PNGs are in `source/`. Prompts are preserved in `prompts.json`, `production-prompts.json`, `final-prompts.json` and `grounding-prompts.json`. Raw source PNGs are retained byte-for-byte; their RGB under transparent pixels may contain an unused matte. Runtime PNGs clear all hidden RGB and alpha below3, contain no metadata, and have zero alpha on every outside edge.

Selected sources:

| Source | SHA256 | Purpose |
|---|---|---|
| bellforge-sheet-v2.png | 2688aec368b6f562069536ad334c1c2d6934d1b76bba199e8686dcec8453e855 | Four Korr key poses, bell, ramp, lift, ratchet |
| tidewheel-sheet-v1.png | 2fa3bcd1f1bec04cbab1dd582ca9788d331507597239010ebb24bd6a1a350179 | Nerra body, separate claws, wheel, raft, gate, weight |
| background-pair-v2.png | 8074e80015b505fb7507f18e19d4b3729911e52019f81672ff116f12755c9143 | Quiet static architectural plates, no gameplay objects |
| tidewheel-bricks-v1.png | c8061573b71f6ab633709ba4bad2e4037edb78979e1225de6152076c0bf1fbad | Equal coral, sage and ivory ceramic tiles |
| grounding-sheet-v1.png | 033a7daf69b1df7ddcce34455854e96d95e13cbbdbadb17f40db85b20cb50187 | Forge plinth, lever, sluice masonry, balcony, gate frame |
| bell-cradle-v1.png | 340d04e3bf4e3fae9cbcbd1a86b4b226a4be90a1b121b2d453f1f74447d49747 | Open-front rear-stage bell release rack |

`bellforge-sheet-v1.png` is preserved history: the rightmost release tusk clipped its edge. Version2 repairs the framing. `background-pair-v1.png` retained decorative bells that could be mistaken for gameplay objects; version2 removes them. The narrow-mouth hopper in the grounding source is a study only and is not suitable for a28u bell passing through its small outlet.

Rebuild from the repository root with the configured Python containing Pillow and NumPy:

```text
python art/fantasy-machinery/extract.py
python art/fantasy-machinery/measure.py
python art/fantasy-machinery/proof.py
python art/fantasy-machinery/verify.py
```

The extraction selects actual connected components, preserves soft alpha, normalizes deterministic pivots, and records source-to-cell transforms and hashes in `assets/fantasy-machinery/manifest.json`. Korr's four512×448 cells share one scale of3px/world unit and one supporting-foot baseline. The release hoof extends ahead of the supporting plane, so aligning each pose's bounding-box bottom would be wrong.

Korr is four raster key poses—idle, windup, release and stagger—not a skeletal rig or a complete interpolated walk animation. Nerra is a body with eight short legs and two independent short-arm claw layers. Its sockets, claw roots and geometry use the same normalized UVs and world units. Mirror the crusher at its root, then rotate the whole anatomical part. Do not stretch the body/claws independently to arbitrary rectangles or fill the open pincer gaps.

`measure.py` records conservative opaque-inscribed circle unions, relative to each part pivot. Additional small disks cover visible hooves, tusks, walking legs and pincer tips. They are measured collision proxies, not skeletal joints. The proof folder includes their overlays and coverage receipt; small banner/spike tips can remain decorative. Physics admission must consume the same per-pose transform as the renderer.

Grounding is a rear-stage composition. The forge plinth top anchors support Korr's feet; Tidewheel's substantial sluice wall supports Nerra with open arches behind the foreground ball. These scenery layers do not imply a full-width foreground collision wall. The separate release lever arm rotates about its brass bearing while its mounting foot stays fixed. Balcony `deck` supports Lumi; the front railing may be redrawn with an occlusion mask after her legs.

The bell rack's `outlet` maps to the actual release point. At authored116×87u canvas scale its initial aperture clearance is14.665u for the14u bell. Its lower side feet narrow a purely vertical image-plane sweep, so it is a rear-stage release rack: the bell emits forward into the foreground rolling lane. This is not evidence of a clear28u-wide vertical tube through the entire sprite. Keep the rack behind the bell/lane and do not add invisible rack collision.

The wheel is an oblique rendered face. Bounded rocking or an affine rotation within its own projected face is appropriate; rotating its full thick three-quarter raster through360degrees would not be a true3D wheel animation. Its axle anchor is offset from its overall image centre intentionally.

`proof/ios-assembly.png`, `android-assembly.png`, `parts-contact.png` and `keypose-assembly.gif` are explicitly staged art fixtures. They verify independent layers, fixed pivots, material consistency and native-size legibility. They are not earned gameplay, balance, collision-solver, device-performance or complete level-animation proofs. Actual browser scene integration and phone playtests are a separate receipt.

The frozen manifest is `b810545f1c1cabbe6252fbae0ece8b4ccc1637946fd4bca35d97c3a09d41ff13`. Its final Korr disk counts are49/48/51/49 for idle/windup/release/stagger. Nerra body/crusher/gate-claw counts are80/63/64. `verify.py` checks every disk against the actual opaque raster, all referenced hashes, alpha edges, hidden RGB, metadata, two real architecture holes and the initial bell aperture. Normal6u radius reaches all four Korr and both claw silhouettes and99.787% of Nerra's opaque pixels; the residual tiny castle/banner tips are decorative. It is a conservative union, so a ball can enter thin decorative alpha before reaching a disk.

The frozen B810 checkpoint contains29PNGs,9,009,729encodedbytes and27,514,104decodedbytes including the four individually preserved Korr frames and the unused narrow-mouth hopper study. A renderer needs the atlas rather than also loading its four duplicate frame PNGs. Its eight source PNGs have empty metadata and are below20MB each. No environment or actor is a full-board crop.

The owner's later smaller Nerra/chain-pull revision is a separate preserved override. See `NERRA_V2.md`; it does not rewrite B810 or its earlier geometry receipt.

The current water attack uses the independent `water-shot-manifest.json` and `water-shot.png` under `assets/fantasy-machinery/`. Reproduce extraction with `python art/fantasy-machinery/extract-water-shot.py`; the source and prompt are preserved alongside the other sheets. Its 32×48u image faces downward and rotates around the measured front-core pivot to follow actual projectile velocity. The physical circle has radius10; 97.35% of that disk overlaps visible water at alpha≥40, with a9.136u strictly inscribed core. Soft foam and the long spray tail are decorative, not extra damage. `proof/water-shot-native.png` is a staged size/collider study, not a gameplay result.


---

# Part AB: Nerra chain-pull artwork and anatomy

*Source: `art/fantasy-machinery/NERRA_V2.md`*

## Smaller Nerra and mechanical chain pull

The owner requested a smaller Nerra, a wider substantial support wall, a chain-holding right claw that operates the sluice hoist, more readable motion/expression, and more bricks. This family supplies the new art/anatomy; raft layout and gameplay timing remain the model owner's work.

The source keeps Nerra's approved coral/oxblood shell, barnacles, grey ruined castle, small red flags, short teal-iris eye stalks, cream underside, eight short legs and black pearl joints. Four distinct body key poses are idle, lateral step, hit-stunned and angry chain pull. These are raster key poses, not a complete skeletal rig. The right pincer visibly clamps a real steel link. Its free dangling tail was separated during extraction; runtime chain routing owns the extended free chain.

Permanent sources and prompt records:

- `source/nerra-motion-v1.png`: first six-object source, retained as history because the outer legs were crowded/clipped.
- `source/nerra-motion-v2.png`: repaired two-column/three-row source, complete six independent components. SHA256 `afecbfb234c1c4cddf331f6cfac44a6bea6fe2bc2ed22e9bdb47452fb2e3b876`.
- `nerra-v2-prompts.json`: original production request and targeted framing repair.

The override manifest is `assets/fantasy-machinery/nerra-v2-manifest.json`, SHA256 `defc7d7d75af13b50560cbabd79d5115cbeeafa997d9abc5452f5c5e0418fc69`. The original manifest remains `b810545f1c1cabbe6252fbae0ece8b4ccc1637946fd4bca35d97c3a09d41ff13` unchanged. Geometry module `nerra-v2-data.mjs` is `ba6e1bdab8034a9e9f6835a8db20879738fc2824e07f278ea76ecef194ed0f23`.

The override's canonical asset keys are `nerraBody`, `gateClawV2` and `chain`. Body atlas cells are640×576, four columns; the full cell is190.08×171.072world units. All poses share one source scale and supporting-foot pivot `[0.5,0.9375]`; anchor it at the actual foot position, currently `(180,232)`. They must not be scaled by0.88 again. Pose-specific `frameRect`, `footUV`, socket UVs, foot-local sockets and circle unions are included. The old separate crusher remains at explicit0.88scale with the original mirror convention.

The new right claw uses96×96world units and normalized pivot `[0.14074550128534705,0.23272729833258227]`. `chainGrip` is local `[61.41461623209696,43.99819738621001]` at the clamped link; the visible extension anchor `chainEnd` is `[64.39368343738525,60.49752140603875]`. The remaining source-held link and the routed chain should overlap naturally. Draw the free chain behind the pincer, not over its closed jaw. The split's lower metal cut is hidden by that real link connection; it is not a standalone end cap.

The separate chain strip is24×108world units at its full padded canvas size. Its metallic gauge matches the heavy held link. Use the measured `tileTop`/`tileBottom` subsection in short overlapping routed segments; compressing all seven links into a short line or stretching it into a flat bar loses the intended weight and link geometry. Chain is rear-stage mechanical presentation, not an extra damaging ball collider.

Right-arm rotation from `+0.12` to `-0.55` raises the actual grip. A taut hauling route therefore runs from the grip to the lower wall-mounted hoist near `(310,244)`, then onward to the sluice/pulley. Routing directly to a pulley above the grip would shorten that free chain leg as the hand rises. The model and renderer must share the actual route, haul amount and warning state; art supplies no independent timer or hidden force.

The measured conservative circle unions are90 per body pose and37 on the new right claw. Every disk is inside actual alpha>=128. Decorative routed chain has no collision. Across all four poses and authored arm-angle ranges, the opaque local assembly extents relative to feet are `[-128.968906,-146.421,159.967229,21.226855]`. At footY232, the deepest limb is253.226855; a brick top at or below285.226855 retains32world units of visible gap. With footX180 and patrol±12, the assembly stays withinX39.031..351.967. These are actual alpha extents, not just the disk bounds.

Rebuild and verify from the repository root:

```text
python art/fantasy-machinery/extract-nerra-v2.py
python art/fantasy-machinery/proof-nerra-v2.py
```

`proof/nerra-v2/verification.json` verifies source/runtime hashes, exact equality between manifest and importable geometry data, empty metadata, transparent image edges, cleared hidden RGB and all opaque-inscribed body/claw disks. The seven runtime PNGs total4,192,937encodedbytes and12,894,208decodedRGBAbytes including four individually preserved frames. Loading the atlas alone for those frames saves5,898,240decodedbytes. All source/runtime files are below20MB individually.

`native-poses.png`, `ios-idle/step/hurt/pull.png`, `android-pull.png` and `keyposes.gif` are labelled staged art assemblies. They show the actual raster family at phone size with attached claws, grounded feet, a larger masonry support and a textured chain. They are not earned gameplay, human difficulty approval, native-device performance or a finished full-rig animation claim. Final actual-browser integration and playtest evidence are separate.


---

# Part AD: Keep reaction artwork and anchors

*Source: `art/fantasy-machinery/REACTIONS.md`*

## Bellforge and Tidewheel reaction keyposes

The separate reaction family adds a live furious Nerra body and earned-victory dazed/fainted poses for Nerra and Korr. These are five raster keyposes with measured anchors, not a skeletal animation rig. The original base family, Nerra v2 family and water projectile remain unchanged.

### Source and reproduction

- Original sheet: `source/reactions-v1.png`, RGBA 1024×1536; SHA256 `67cefe6a3b15f485a2985d899fba7132c9f18bfc8777054ab4e3bcdc009a4606`.
- Exact prompt: `reactions-prompt.json`. Visual references were the existing `nerra-v2-idle.png`, `nerra-v2-pull.png` and `korr-idle.png` under `assets/fantasy-machinery/`.
- The sheet preserves the coral/oxblood castle-shell, teal eyes, cream jaw and eight short walking legs of Nerra; Korr retains the ruby/plum armour, ivory tusks, amber eyes and pink snout.
- Reproduce deterministic extraction from the repository root with `python art/fantasy-machinery/extract-reactions.py`, then verify and assemble the staged proofs with `python art/fantasy-machinery/proof-reactions.py`. Pillow and NumPy are required. Preserve the source sheet and prompt when cloning or archiving.
- The extractor isolates the five alpha-connected figures, normalizes each species to its existing supporting-foot pivot, applies measured shoulder anchors, clears transparent RGB and writes PNGs without metadata. The source remains intact.

### Runtime contract

Manifest: `assets/fantasy-machinery/reactions-manifest.json`, SHA256 `11b2958079f617c556b8d8155195a156dc08f10fc69afe7f7e86f639a6317544`.

| Manifest key | Runtime PNG | Canvas | World unit | Supporting-foot pivot | Use |
|---|---|---|---|---|---|
| `nerra.fury` | `nerra-fury-v1.png` | 640×576 | 190.08×171.072 | `[.5,.9375]` | Live fury, with the matching new geometry |
| `nerra.dazed` | `nerra-dazed-v1.png` | 640×576 | 190.08×171.072 | `[.5,.9375]` | Earned victory presentation only |
| `nerra.defeat` | `nerra-defeat-v1.png` | 640×576 | 190.08×171.072 | `[.5,.9375]` | Earned victory presentation only |
| `korr.dazed` | `korr-dazed-v1.png` | 512×448 | 170.6667×149.3333 | `[.5,.8839285714]` | Earned victory presentation only |
| `korr.defeat` | `korr-defeat-v1.png` | 512×448 | 170.6667×149.3333 | `[.5,.8839285714]` | Earned victory presentation only |

All paths in the manifest are repository relative. Each entry contains `path`, `size`, `unit`, `pivot`, `frame`, `frameRect`, `footUV`, `sha256`, source crop/transform, alpha/solid bounds, measured anchors and `terminalOnly`. Every image is a separate one-frame texture. No atlas row convention is needed.

Nerra is **body only**: the eight small walking legs are present, but the two large combat claws are separate parts. Draw the existing crusher and chain-gripping claw once, attached to the selected body's measured sockets. Terminal poses have lower shoulders and must use their own sockets. Their data has no live damage or collision authority.

Fury anatomy is exported by `reactions-data.mjs` as default `{nerraFury:{frame,frameRect,unit,pivot,footUV,sockets,circles,sourceSHA256,spriteSHA256}}`. Module SHA256: `a4f3ec81c4d50e17279af8805ad30da8ee8406e2ecd9da28fed503ecc3e266ae`. Coordinates and disk radii are world units relative to the supporting feet; do not scale them a second time.

Fury sockets are crusher `(-19.0050240481,-69.3527423581)` and gate `(64.2454448898,-58.2677685590)`. The new live silhouette must switch together with this geometry and these sockets. It must not inherit the idle/pull collider merely because the canvas and pivot match.

### Verification and limits

`proof/reactions/verification.json` SHA256 `7b1c18d29fbd7dae26b7469afa2491598593b8d4d5437e55023a05bb2704597c` records exact source, module and sprite hashes. All five PNGs have empty metadata, zero alpha on every outer edge and zero RGB beneath fully transparent pixels. Total: 1,899,108 encoded bytes and 6,258,688 decoded RGBA bytes.

The live fury body has 90 measured disk components, all inside alpha≥128. A 6-unit normal ball reaches 100% of the opaque silhouette; maximum opaque-to-proxy gap is 5.849546 units. Feet-local opaque bounds are `[-82.269,-151.767,82.863,0.297]`. The independent articulated claws retain their own measured geometry. This is a broad compound silhouette, with no padding rectangle across leg gaps.

The source contact sheet and native-sized assembled proofs are in `proof/reactions/`. They show a planted, open-mouth furious face, an uneven-eyed dazed reaction and a visibly lowered/fainted body. Korr's four hooves and armour settle onto the plinth; Nerra's folded legs and relaxed jaw rest on the rear coping. These are explicitly staged art assemblies. Runtime phase ordering, moving claw attachment, refuge clearance and actual earned victories require the integration owner's current native captures; source verification does not establish those gameplay results.

### Original Vault presentation recommendation

Keep the existing Lumi/princess animation cells, snake expression family and camera/alpha registrations. The cage, tower and brick coordinates are registered to the original plate. Repainting individual animation frames would introduce face and silhouette drift. The safe improvement for this pass is the integration owner's registered masonry entrance and environmental lighting/dressing around the original assets, while preserving the existing serpent body/head motion and princess face rig. No new Vault character asset or animation replacement is part of this reaction family.


---

# Part AE: Emerald serpent source and presentation contract

*Source: `art/snake-emerald/SOURCE.md`*

## Emerald serpent expression family

This versioned family replaces the simple rendered head presentation with richer emerald scales, broad soft reflections, shaded lower planes, pale mint lower jaw and larger readable eye/brow/mouth poses. It preserves the original serpent identity and runtime framing. The original `assets/snake-jade/` family remains intact.

### Source and preservation

- Reference-directed source sheet: `source/heads-v1.png`, RGBA1024×1536, SHA256 `ce924290a0c5cc2670d492d40eb75f0fb8241aa686af220a5c291b60833d3952`.
- Exact prompt and reference paths: `prompt.json`. The original jade idle/snarl heads establish identity, palette and view; Korr/Nerra establish material depth and lighting quality.
- Runtime manifest: `assets/snake-emerald/manifest.json`, SHA256 `d07cce6d9c7732be361cbe6b759831ad513597907871c318ad26815639aa704a`.
- Runtime metadata: `assets/snake-emerald/meta.json`, SHA256 `f8e9f9f937740e9096ba1c173de2ea378263572fed402c203a1bfad92ea12977`.
- Reproduce the deterministic normalization with `python art/snake-emerald/extract.py`; verify actual files with `python art/snake-emerald/verify.py`. Requires Pillow and NumPy. Preserve the source sheet before extraction; runtime copies have transparent RGB cleared and no metadata.

### Exact runtime contract

All26 canonical files are `assets/snake-emerald/head_<expression>_<r|l>.png`, each256×256 RGBA, `box`/worldunit44, centre pivot `[.5,.5]`. The packer can use explicit `cell:256`; `px` is256/44. All13 existing expression names and both facing rows remain present in their previous order.

Ten authored right-facing keyposes are `idle`, `blink`, `taste`, `hunt`, `chew0`, `chew1`, `hiss`, `ouch`, `dizzy`, `grin`. The left row is an exact pixel mirror. Three legacy keys intentionally reuse compatible artwork: `shock→idle` retains open alert eyes, `snarl→hunt` retains angry focus, and `strike→hiss` retains the open-fang attack mouth. These are explicit mappings, not13 separately authored faces. Runtime recoil, breathing, head rotation and expression timing remain separate presentation layers; the family is not a new skeletal rig or interpolated animation.

One common0.33 source-to-cell scale and measured source core anchors preserve skull volume. At normal existing1.45 draw scale, opaque non-tongue head widths are29.4078–31.1523 worldunits. The thin taste tongue extends beyond that base footprint and has no collision authority. All centre points remain visibly on the head. No grid, route, ball, bite/damage radius or other gameplay geometry changes are encoded here.

`meta.mouths[expression][direction]=[dx,dy]` records the visible mouth outlet in local worldunit44 coordinates relative to the sprite centre. Apply the same head translation, rotation, breathing scale and existing draw multiplier to this outlet as to the sprite. The left outlet mirrors X exactly. An annotated source proof is `proof/anchors.png`; warm circles mark mouth outlets and pale crosses mark the unchanged head centre. Mouths are measured per authored pose, then inherited by the three aliases.

Palette seam targets remain body `#168f83`, belly `#c9e8d2`, crown `#0b5d59`, outline `#052d31`, coral brow `#ff8a9b` and mint markings `#83e4c2`. The short rear skull is deliberately dark so it blends with the rendered body; no long neck or separate body sprite is baked in.

### Verification and admission

The source contact proof includes both256px cells and actual393px phone-scale heads. Every runtime image has empty metadata, transparent outer edges and zero RGB beneath alpha0. All left images mirror exactly; alias pixels match their named source; each head centre and measured mouth outlet lie on alpha≥128 pixels. Total encoded runtime PNGs575,649bytes; the13-column/two-row packed atlas decodes to6,815,744RGBAbytes.

`proof/verification.json` records extraction and native-scale measurements. `proof/source-verification.json` independently rereads the source/meta/runtime files and validates hashes, mirroring, alias ownership, alpha and anchors. These proofs establish the source family and registration. Final integrated native entrance rotation, body/head seam, venom origin and actual gameplay motion require the current browser receipts; a static contact sheet does not establish those results.


---

# Part W: Gatebreak mission implementation

*Source: `docs/STARFLIGHT_MISSION.md`*

## Gatebreak: authored Starflight mission

Implementation checkpoint2026-10-20. This is a separate finite mission layered over the preserved Starflight combat lab. `src/starflight/mission.js` exports `StarflightMission extends Starflight`; geometry and ordinary lab behaviour remain unchanged. The one approved base extension is `playerShotRadius()`, returning the normal7u core by default and sampled separately for each hostile projectile. The mission overrides it for a real charged shield. The prototype entry chooses mission versus lab. This document records implemented model behaviour and bounded model checks, not a delivered Android build, measured physical-phone performance or the entire proposed campaign.

The player opens an evacuation route through a visible gate blockade. Patrols teach direct flight, returning interceptors prevent empty fly-pasts, wreck corridors offer destructible cover/supplies, missile leaders and gate batteries lose firing capability under damage, and the command ship's defeat opens the route. The ending is finite. Enemy survival or running out a clock never awards completion.

### Public contract

```js
import { StarflightMission, MISSION_POWERS, STORM_WINGS, wingPoint, droneMuzzle } from './starflight/mission.js';
const game = new StarflightMission({ width:360, height:613, difficulty:'easy', seed:7 });
game.setControlReserve(actualReactorCircle); // Same measured control contract as the lab.
game.resize(360, newWorldHeight);            // Rebase the live mission before remeasuring its control.
game.setTarget(x, y);
game.update(1 / 120);
game.canActivate('storm');
game.canActivate('storm', { ignorePause:true }); // Read-only paused chooser eligibility.
game.activate('storm');                        // Always enforces the actual pause state.
```

Inherited fields remain renderer-compatible: player, enemies, shots, effects, pickups, hazards, drones, fields, timers, charge, chargeBank, score, time and difficulty. Movement, small player hurt core,27.04u wing-clearance edge, real hardpoints, relative swept ordinary shots and banked reactor economy remain intact. Restart constructs a fresh mission; it does not retain stocks, damage, clocks, held input or objective progress.

| Field | Meaning |
|---|---|
| `mission` | `{id:'gatebreak',beat,title,objective,group,progress,required,elapsed,restRemaining,kills,suppliesEarned}`. Group is−1 before first entry, then0–9; it is an internal authoring index, not HUD “Wave N”. |
| `mission.beat` | `approach`, `debris`, `battery`, `command`, `extraction`, `complete`. Use title/objective for the actual situation. |
| `phase` | `combat`, `boss`, `jump`, `complete`. `jump` is the harmless final extraction, not another endurance sector. |
| `state` | `play`, `lost`, `won`. Both lost and won freeze later updates. |
| `world.gate` | `{x,y,r,open,locked}`. Locked from mission start; command defeat unlocks it, extraction increases opening, victory sets open1. |
| `world.blockade` | `{remaining,batteries,disabled}`. Starts with three required batteries; actual battery identities are recorded at their encounter and permanently disabled on defeat. |
| `world.routeProgress` | Normalised authored-group/combat progress. It is a visual route cue, not a countdown or a collision wall. |
| `requiredEnemies` | Set of actual current required identities; only their accepted destruction advances the group. |
| `completedEnemies` | Archive of defeated required identities; no respawning or erasure. |
| `stocks` | All nine power IDs, integer0 or1 each, total at most3 through earned collection. |
| `storm` | Null or actual detached-wing motion/band state described below. |
| `combination` | Null or `{stage,ids,x,y,at,progress,sourcePoses,heavyId}`. Stages `warning/dock/merged/cancelled`; source poses are actual parent transforms. |
| `enemy.objectiveIds` | Original required identities represented by the current actor; a combined heavy retains both parent IDs. |
| `mission.events` | Bounded last12 records `{kind,at,ids,x,y,...}` for combine warning, docking, interruption and completed assembly. |

The model has no DOM, image decoding, audio or browser clock dependency. The caller retains fixed-step accumulation, native safe-area measurement, paused chooser handling and gesture cancellation. `canActivate(...,{ignorePause:true})` must only enable a paused menu; `activate` still rejects until the caller resumes. It does not provide a paused gameplay bypass.

Use `resize(width,height)`, not direct height mutation. It validates at least260×360 and rebases player targets, enemies/committed dive targets, real compound current/previous poses, warnings, projectile origins/history, pickups, hazards, drones, fields, effects, detached wings/band and docking state. Time, HP, stocks, bank and original required identities persist. Recompute the actual DOM control reservation afterward. This prevents a portrait shrink from putting an alive required scout beyond the inherited removal boundary and permanently blocking the mission.

### Finite authored encounters

The first patrol enters after.8s. Subsequent groups require every current required enemy to be defeated. A cleared group earns2.2s relief: hostile shots, leftover rocks and warnings clear; the player can move/collect earned supplies, while combat resource/ability clocks and new fire pause. Storm is the deliberate exception: any detached wings make a harmless.8s return to the current moving sockets during relief; its duration decreases and clears when reassembled. Its band cannot damage or generate charge/supplies in this return. A cleared Ricochet projectile is discarded without refund; its remaining anti-recast timer freezes during relief and resumes in the next encounter. These short rests are not survival gates, arbitrary invulnerability phases or a substitute for combat length.

| Internal group | Visible situation | Finite actors | Consequence |
|---:|---|---|---|
|0|The blocked gate|Two scouts|Learn a committed dive and ordinary fire. Second ordinary destruction can earn Storm.|
|1|Interceptors regroup|Four beetles|Crossing flanks return to fight instead of vanishing.|
|2|Missile escort|Two scouts, two missile frigates|Hold-position launchers require alignment, not merely waiting for a fly-past.|
|3|The crossing screen|Three beetles, two scouts|Combine fixed flanks with committed player-lane dives.|
|4|Wreck corridor|Two beetles, one frigate, three optional rocks|Destructible moving cover; ordinary rock destruction can earn a manual power.|
|5|Armed recovery tugs|Two beetles, two original gunships, two rocks|Distinct broad dual-gun bodies hold the route.|
|6|Recovery pocket|Two frigates, one beetle, three rocks|A second short terrain decision before the blockade.|
|7|Interdiction leaders|Two scouts, two heavier frigates|Damaging a rack removes its actual weapon sources.|
|8|Gate batteries|Three heavy frigate batteries|Destroy all three required blockade identities.|
|9|Command ship|One crescent command ship|Broad ordinary damage, progressive rack loss, then gate opening/extraction.|

At most five required enemies are alive at once; no infinite replacement spawns exist. Rocks are optional physical cover/supplies, not required identities. Enemy-caused rock destruction therefore cannot clear a mission gate. Optional rocks do not secretly block the ordinary victory route.

Two original scouts that remain at least65%healthy and unhit for10s can rally to combine once per group. The visible1.2s warning cancels their pending charges; already launched rounds remain. They then physically converge at an upper22%field docking point using their normal bounded motion. After at least1.8s docking and actual proximity, one gunship assembles with **sum of remaining parent HP plus8/10/12 armour** on Easy/Medium/Hard. It has real paired gunship barrels/fans and2s startup recovery. There is no full-health reset, repeated assembly loop, new body around the hero or free kill/score/loot/charge on merging.

Both original required IDs remain outstanding until the heavy is defeated: its `objectiveIds` carries them, and death awards both objective credits exactly once. The heavy is one actual ship kill. A legal parent hit/kill is processed before assembly at the end of the tick; a missing parent cancels the attempt. `comboSpent` prevents another attempt in the same group. Active early combat can prevent fusion entirely; waiting does not defeat those required identities.

The approximately150–210s pacing is a target for the full sequence, not a forced completion timer. Earlier smaller sequences completed approximately105s, then144–145s in bounded assists; those drafts are superseded. The final authored roles/cadence are measured below. Do not lengthen a future revision merely to hit a clock if the encounter stops being enjoyable.

### Enemy movement, attacks and capability loss

Ships have smooth entry, bounded acceleration/speed and wrapped shortest-angle turns. Required actors remain in view after entry. No teleport/wrap, offscreen firing or invisible replacement credits exist.

- **Scout:** rally, snapshot the player's lane, hold a.65s commitment, dive to55%field height, bank around a side and return to rally. The snapshot does not chase subsequent player motion. Flight stages are `entry/rally/commit/dive/return`, with `commitX/commitY` retained for inspection.
- **Beetle:** bank across a fixed opposing flank, regroup at the upper hold, then reverse. Its path is not the scout's player-lane dive. Stages are `entry/cross/regroup`.
- **Gunship/frigate:** hold their authored upper firing lane with modest drift. Their broad hulls remain vulnerable. They do not sweep past the player and disappear.
- **Command:** a broad slowly translating crescent, using its actual muzzle family and physically empty notch. Its movement is bounded by the rendered width.

Velocities cap68u/s command,80u/s gunships and132u/s small ships; turns cap2.8rad/s. Warnings lock aim once, remain on the actual moving barrel and cancel if the source leaves the visible combat region or a small craft turns away. Source coordinates are rechecked before launch. Early teaching allows one charging enemy, later groups at most two. No dotted warning path is required by the model; render the charged muzzle.

Missile racks use bounded-turn existing missiles; other sources use committed aim or finite fans. A gunship at half HP loses its real right rack (`disabledPorts`), cancels pending charge and provides1.8s recovery. It switches away from full missile capability to a smaller fan. The command loses right outer port at half HP and both outer ports at quarter HP, leaving its centre source. Already launched rounds remain real; destroying a source cancels future work, not every projectile in flight. Broad shared hull damage remains productive throughout—no mandatory pixel weak point, immunity wait or HP refill.

| Mode | Player hull | Hostile speed | Basic tell | Recovery | Hostile cap | Scout / beetle / frigate / leader / battery / command HP |
|---|---:|---:|---:|---:|---:|---|
|Easy|6|175u/s|1.4s|3.6s|18|12 /15 /36 /48 /64 /360|
|Medium|5|205u/s|1.2s|3.1s|24|14 /18 /44 /58 /78 /440|
|Hard|4|235u/s|1.05s|2.7s|30|17 /21 /52 /68 /92 /520|

Missiles add.3s warning. Damaged sources add.7s recovery. Original gunships use the frigate resistance column. These values are applied once, not multiplied again by the lab HP factor. The mission does not increase resistance forever or loop after victory.

### Earned supplies and nine manual powers

`MISSION_POWERS` contains the original seven compatibility IDs plus `storm` and `ricochet`. Durations remain Laser4s, Stasis4.5s, Hyper2.5s, Seeker6s, `spiral`5s, Drones6s and Nova.65s. **In the mission, `spiral` now means Trident guided salvos, not the lab's weaving projectile.** The lab keeps its original Spiral. Ordinary damage still banks reactor energy, drained at the lab's mode rate; powered damage cannot refill its own replacement.

`activate(id)` spends an earned stock first. This preserves existing reactor charge/bank. With no stock, it spends the full100-charge reactor and clears pending bank. It rejects an active same-power recast, unknown ID, paused/lost/won/extraction state, relief or insufficient resource. Different powers can overlap only using separately earned bounded resources, **except exclusive Stormwing**: any other active manual power blocks Storm, and detached Storm blocks every other manual cast. Rejected choices leave stocks, charge, bank and active durations unchanged. The paused eligibility query applies the same exclusivity. No capsule activates itself or erases another running power.

Laser and Hyper are also mutually exclusive so one primary cannot silently consume the other's useful duration. Seeker/Trident are independent secondary batteries; drones remain independent defenders. Payload eligibility requires real free slots before spending: one Ricochet, three Trident, two Seeker, normal primary capacity, and all20 Nova rounds after its bounded nearby-hostile clear. A full projectile budget cannot consume a stock and emit nothing. Same-active reactivation is rejected rather than extending timers without an explicit limit.

| Choice | Mission launch/motion/collision/expiry |
|---|---|
|Laser|Twin real barrel origins, r5 damage2/pierce2;4s primary, each target once per shot.|
|Hyper|Five real-port fan rounds/r4 damage1 at.10s cadence;2.5s primary; no Laser suppression.|
|Seekers|Two focused missiles per.85s, max6 live; real twin origins,420u/s,2.8rad/s guidance for4s, damage3.|
|Trident (`spiral`)|Three forward-fan r4.8 missiles from real alternating ports;540u/s,damage2.5, max9live. Each burst acquires distinct living forward targets where available; unavailable slots remain ballistic. Steering caps2.2rad/s for3.2s; each missile expires3.6s after launch. The rack waits at least.9s between bursts, quantised to primary firing updates. Ordinary primary continues.|
|Drones|Two r6 defenders,6s; real optic UV(.72,.55) at24u is local(+5.28,+1.20), rotated by `−π/2+sin(angle)*.12`. `droneMuzzle(d)` and `d.muzzle` match shot birth/from and banked direction. Orbit, two intercept HP and.6s powered pulses remain bounded.|
|Stasis|4.5s of actual enemy-projectile translation at.32× and rock drift at.45×; no slowed warning/spawn/mission clock.|
|Nova|20 real radial damage3/r5 projectiles, each piercing two identities; clears hostile rounds only within150u at cast. .65s presentation, no direct boss-HP deletion.|
|Stormwing|Thunder-only crossed-target sweep and safe return described below; exclusive with all other manual powers.|
|Ricochet|Real nose launch, bounded reflected piecewise collision and history described below.|

Drop eligibility counts productive **ordinary-player** enemy/rock destruction once. Powered kills, enemy shots, body-contact damage, zero damage and a repeated dead target do not earn these drops. Rules:

1. The second and third eligible destructions, then multiples of three, offer a manual power capsule. First ordinary rock also offers one if the budget permits. Support cadence takes precedence at multiples of four.
2. Power sequence is `Storm→Ricochet→Seeker→Spiral→Drones→Laser→Hyper→Stasis→Nova`, skipping a power already stocked or already on the field. The first eligible capsule is therefore Storm, the next is Ricochet. They are physical pickups and can be missed; guaranteed eligibility does not teleport a stock into inventory.
3. Every fourth eligible destruction offers one support pickup: Repair if hurt, otherwise Shield. No unavailable weapon capsule turns into an extra heal. Support field cap2; shield is one contact for12s, with no stacked shield HP.
4. Total field cap6, power capsule cap2. Stored stock cap1 per ID and3 total. An unavailable capsule remains uncollected until room exists or its22s lifetime expires. It never silently replaces a different power.
5. Pickups have **no attraction/magnet**. They inherit at most22u/s sideways momentum from the defeated object, damp at.4/s, begin falling50–80u/s and accelerate6u/s² up to100u/s. Visible fall and22s lifetime allow intentional interception; passing out of the field can still miss a reward without failing the mission. Collection uses the actual swept item12u/player7u contact only, with no extra7u reach. They score50 on collection. Support restores at most one hull or one shield; there is no passive regeneration.

A charged Shield has an actual31u hostile-projectile interception radius matching its visible armour. The ordinary hurt core and all body contacts stay7u. After one shield is consumed, the next projectile in the **same tick** immediately uses7u; it cannot be absorbed by a vanished outer shield. The brief hit grace remains. The shield impact effect uses the swept contact point rather than the hero centre.

These finite stocks make the new weapons available early without converting every kill into permanent safety. Actual pickup route matters. An automated route may miss the first Storm and collect the later Ricochet; do not report missed capsules as free starting equipment.

### Storm: real wing lightning sweep

`STORM_WINGS` matches `assets/starflight-storm/manifest.json`. Each raster remains52×46.8u on a shared320×288 canvas, but **model wing coordinates are actual inner attachment pivots**, not full image centres:

| Wing | Pivot UV | Neutral offset from rotated body | Tip/muzzle offset from rotated wing |
|---|---|---|---|
|Left|[.40625,.56944444]|[−4.875,+3.25]|[−3.0225,−15.98401937]|
|Right|[.59375,.56944444]|[+4.875,+3.25]|[+3.2175,−15.98401937]|

`wingPoint(pose,offset)` performs the shared rotation/translation. The left/right partial rasters plus central body reproduce the original neutral ship. Draw with each part's own pivot. Drawing a wing at its model attachment with centre pivot would detach the gun from its real source.

`storm={age,life:5.15,stage,origin,wings,band,hit}`. Each wing has `side,x,y,px,py,angle,tip`. Split lasts.45s, an upward sweep3.9s, return.8s. The wings spread toward attachment x30 andwidth−30, lifting42u to clear the reactor/exhaust lane, then rise to y45. The central body and its7u hurt core remain under control. **Thunder is the only friendly attack throughout split, sweep and return.** Activation clears existing friendly projectiles while retaining hostile shots; primary fire (including Hyper/Laser/Spiral), Seekers and drones cannot emit while detached. Any late friendly projectile is also discarded before motion/collision. The wing tip metadata anchors lightning, not simultaneous cannon bullets.

Manual-power exclusivity prevents stocks being spent on suppressed attacks or active paid-for timers silently expiring. A Rapid pickup's remaining duration pauses while detached and resumes after attachment; Shield remains active useful protection. The existing earned reactor bank may still fill during combat; thunder damage itself earns no new credit. On reattachment the primary delay resets to.16s and Seeker delay to.85s, preventing a negative cooldown or queued catch-up burst. Enemy fire and ordinary fire outside Storm are unchanged. A relief return follows the same no-bullet rule.

`band={x1,x2,y,px1,px2,py,r:8,active}` uses the **same actual tip endpoints** that draw lightning. It is a real moving horizontal capsule. Continuous strip and end-cap tests sweep against moving target hull circles/rocks. One upward pass destroys each physically crossed ordinary enemy/asteroid by removing its remaining HP, including Hard beetles and batteries; targets outside the crossed band remain untouched. Command damage is bounded80 per pass, approximately15–22% of its mode hull. The pass grants no energy/drop replacement, cannot repeatedly farm overlap and cannot erase a full guardian. Split and return are harmless.

Return targets the player's **current rotated sockets**, even after movement, rather than the original launch point. The two wings return individually and reconnect; null storm means draw the normal assembled hero. Command defeat forces a harmless return during extraction. Renderer effects may branch/flicker within the band but cannot imply a larger collider.

### Ricochet: physical reflected missile

One activation launches one powered r6 missile at740u/s from the real rotated central nose UV[.5,20/288], with `shot.from`, seeded ±.66rad around the player's upward bank. It lasts at most5.2s and8 wall reflections. Its collider reflects at x10..width−10 and y14..height−38; there is no screen teleport. Current `vx/vy` owns its nose orientation. The renderer anchors the actual projectile nose/core at its physical x/y, not the middle of a long decorative trail.

The shot retains `kind:'ricochet',life,bounces,maxBounces,hitTimes,damageByTarget,touching,segments,trail`. Each step's segment is `{x1,y1,x2,y2,t0,t1}`. Both enemy compound shapes and moving rocks use the segment's actual time fraction. Collision tests follow **each reflected leg**; the diagonal between the frame's starting/ending point is not a valid hit path.

Damage is3 per contact episode, requiring exit and at least.24s before another hit on that identity. Total per-activation damage caps18 per ordinary target and24 command. A stationary overlap cannot repeatedly farm. The projectile is powered, so it earns no replacement energy/loot. Trail is actual reflected history, at most80 points `{x,y,age}` and.55s old; renderers may soften it without inventing a smooth arc through walls.

### Terminal behaviour, effects and verification

Command HP0 immediately clears threats and sets `phase='jump'`, `mission.beat='extraction'`, gate unlocked. The3s harmless extraction allows an opening-gate presentation, then sets `state='won'`, `phase='complete'`, routeProgress1. No next sector or surprise cleanup spawns. The accepted final hit wins before same-tick lethal hostile fire. Loss remains hull0. Pause freezes encounter clocks, moving wings, lightning damage, ricochet legs/trail, warnings, pickups and extraction. A paused chooser must not leak time.

Kills emit harmless `wreck` effects with `ship,role,angle,vx,vy`; these are inherited pose/momentum for the renderer, not new damaging enemy bodies. Explosion/wreck visuals do not award additional score/energy. Root renderer owns differentiated cosmetic breakup using actual ship imagery.

`node --test tests/starflight-mission.test.js` passes28 focused checks. They cover mission/identity gating, passive blocked fusion, scout commitment, source-derived wing tips/return and thunder-only combat, actual crossed Hard hulls/rocks, nine-power resources/pause/expiry, real piecewise Ricochet/exit episodes, exact nonmagnetic pickup contact, guided distinct-target Trident/turn/cooldown/caps, fusion HP/identity/no-reward conservation and same-tick interruption, resize recovery from the formerly broken1000→360u portrait shrink, real drone birth/optic, true one-charge31u shield fallback, terminal ordering and both-height ordinary-input victory. Combined with the lab's35 checks,63 pass. Direct staged damage/resource setup in unit fixtures is not an earned gameplay claim.

Current checkpointE4768589 received one fixed seed7 public-input model assist per mode/height/policy, with no parameter search or resource/position writes. The same visible-target/nearby-drop steering and simple hostile crossing avoidance as the historical runs below was used; ordinary runs never activated a power. Natural contact-collected supplies remain allowed:

| Mode | Ordinary only:613u /656u | Earned powers:613u /656u |
|---|---|---|
|Easy|Won158.33s/167.31s, hull5/6|Won141.04s/152.26s, hull6/6|
|Medium|Won181.82s/187.30s, hull2/4|Won169.73s/158.10s, hull4/3|
|Hard|Won211.92s/213.89s, hull3/4|Won188.77s/185.70s, hull2/4|

Trident stocks were actually used in powered routes; first Ricochet stock casts were14.28/14.62s Easy,19.37/18.07s Medium and23.73/24.08s Hard. Active aiming prevented fusion in these runs; the separate passive comparison did fuse once without clearing a required identity. Model assists do not establish human challenge or browser/native rendering performance. Independent QA owns the final actual control, render and earned-browser receipts.

Historical fixed seed7 model-only input assists on checkpoint85B7068F used120Hz, forward visible-target tracking, simple visible-shot crossing avoidance and nearby physical-pickup steering. They preceded the harmless Storm return, thunder-only/exclusivity, stronger clearing band, nonmagnetic pickups, Trident and scout combination. These older timings must not be relabelled as a re-run of the current checkpoint. They called only public `setTarget`, optional `activate`, and `update`; they did not write position, hull, charge, stocks, timers or objectives. Natural Repair/Shield/manual stocks were allowed and therefore these were not pickup-free routes:

| Mode | No activated power:613u /656u | Earned stocks/reactor:613u /656u |
|---|---|---|
|Easy|Won162.02s/162.99s, hull6/6|Won158.30s/153.42s, hull6/6|
|Medium|Won182.30s/183.94s, hull3/5|Won168.22s/169.38s, hull2/4|
|Hard|Won210.78s/212.74s, hull4/4|Won190.93s/192.61s, hull2/4|

The assist's first reactor readiness was38.75–38.78s Easy,41.77–41.81s Medium and45.48–45.52s Hard. Its earliest collected/cast capsule was Ricochet12.83–13.19s Easy; it missed the first Storm. Powered runs legitimately used8/7,9/10 and9/9 casts respectively, from distinct stocks/reactor fills. These positive model results do not establish human difficulty, touchscreen enjoyment, actual browser rendering, physical-phone frame rate or APK admission. Independent browser controls/ordinary/powered/passive receipts must identify the final source and manifest; human play remains the next calibration step.

The base hook source/geometry hashes are `462E12C1C2FF3613F6E32749C43D65C9813CC89551DEAF167C601B832DDB82DB` / `D73C3F3C62B960749F0FD1AAA014AED70AF5E82EFEC70E7E85CE9E39A5B924DA`. Mission checkpoint is `E47685894361547E25121D04182CF3C9EC2EC9615419294C6BA3A87FA520F79F`; mission tests `FFBCCC31B6830CA4FAED6E2FA22A583CA852EAB0CABFDC22F644C6C3F3D8EB40`. Storm art manifest is `assets/starflight-storm/manifest.json`, finalf790294c…20074. Root owns final rendered-build hashes and browser/release receipts.


### Final independent browser recheck — 2026-10-20

Permanent receipts: `docs/validation/starflight-mission/QA.md` and `report.json` (SHA256 DCEA4F377A4C567515E94D74D44D94588B7B0D33C47FEA4577548835F3926E21). Six phone/mode UI cases and eight bounded Easy routes passed on stable source. All 748 newborn projectiles matched their actual launch origins. Nine powers, occupied Storm sweep/return, physical capsule collection, shield interception/depletion, paused clocks, held-touch resize and Retry passed with no page, HTTP or request errors.

Ordinary-control Easy routes won at 211.26s iOS and 197.37s Android, each with 4/6 hull and zero activated powers. Earned-stock routes won at 162.06s/172.81s with 11/12 casts and actual pickup collection; no resource or actor writes. Passive routes remained unfinished at 240s; idle routes lost. These are scripted browser witnesses, not human balance or physical-handset certification. Files containing `staged` are explicitly seeded effect checks, not earned play.


---

# Part X: Distinct future flight powers

*Source: `docs/STARFLIGHT_POWER_EXPLORATION.md`*

## Next flight powers: spectacle with a decision

Design proposals, 2026-10-20. These are not additional selectable powers in Gatebreak. The current playable nine remain documented in `STARFLIGHT_MISSION.md`. Do not count a concept or an image as a finished mechanic.

The owner asks for ideas beyond their Stormwing and Ricochet suggestions. A new power must change how the player handles a situation, have a recognisable silhouette at phone size, and finish with a clear recovery. More bullets with a different colour is not sufficient. Retain the glossy white ceramic, machined metal, violet reactor and controlled cyan emission of the current ship.

### Prism Bastion

Three curved armour petals unfold from the ship into a forward crescent. Incoming hostile rounds stop against those real plates and become visible luminous slugs in six recessed chambers. At the end of the capture window the plates rotate into a forward barrel crown and release the stored energy as a staggered counter-volley, then fold flush.

- Role: deliberately intercept a threatening volley and turn defence into offence.
- Initial prototype budget: 1.8 seconds capture, six caught rounds maximum, 0.6 seconds counter-fire, 0.5 seconds reassembly. No collection behind the ship and no whole-screen bullet deletion.
- The shields use three explicit swept capsule colliders matching visible plates. The vulnerable core remains exposed from the rear; an empty capture still gives a minimum three-shot return, so choosing it during a lull does not waste the entire charge.
- Each caught projectile is consumed once. Counter-fire is powered damage and earns no charge or drops. Reject overlapping transformation powers without spending resources.
- Visual sequence: mechanical deployment, impact ripples travelling along ceramic, chamber-by-chamber charge, a short staggered recoil, and physical closure. Never draw a permanent translucent bubble over the battlefield.
- Required proof: front/rear collision distinction, six-round cap, empty cast, interrupted victory, moving-bank attachment, shot-clear ownership, pause and both phone safe areas.

### Comet Loom

A rotating nose assembly winds three luminous tethers around nearby destructible asteroids. Their fragments become three visibly separate, molten-rimmed projectiles travelling in forward curved lanes. They smash through a formation and shed harmless grit rather than becoming another rapid-fire weapon.

- Role: exploit a dangerous debris corridor; choose between destroying cover normally for supplies or converting it into an immediate attack.
- Initial prototype budget: one cast claims at most three rocks within 140 world units, or fabricates one smaller ceramic comet if none are available. No invisible rocks or enemy bodies are pulled in.
- Claimed rocks stop using their old colliders immediately; one ownership record prevents duplicate loot/destruction. Comets use actual curved swept segments and can hit a target once. Boss damage has a per-cast cap.
- The gathering stage lasts 0.7 seconds, followed by three timed launches over 0.9 seconds. The player's movement remains responsive; enemy tells stay visible. It cannot capture hostile projectiles.
- Visual sequence: a short solid-looking nose spindle opens, rubble breaks along its actual silhouette, controlled filaments braid behind three hot cores, and a heavy forward release recoils the assembly. Decorative fragments never hurt the player.
- Required proof: empty terrain fallback, rock claim concurrency, curved collision, boss budget, no self-refill, no hidden force outside the shown reach, restart and terminal cleanup.

### Production order

Prototype Prism Bastion first because it adds a distinct defensive decision to the current offensive arsenal. Validate the collision/ownership budgets with simple placeholders, then produce a transparent assembly sheet with measured hinges, chambers and muzzle points. Inspect the assembled result at 393×852 and 412×915 before final effects. Comet Loom follows only after its terrain interaction adds a useful choice in playtests.

Neither proposal justifies making the ordinary route unwinnable. Easy keeps readable tells and recovery; Hard combines established threats and asks for better timing. Human play determines whether the result feels exciting, not an automated completion time alone.


---

# Part S: Starflight prototype and story

*Source: `docs/STARFLIGHT_PROTOTYPE.md`*

## Starflight: Last Light

Updated 2026-10-20. Working branch: `codex/starship-run-prototype`.

### Current default: Gatebreak

The default route now loads `StarflightMission` from `src/starflight/mission.js`. Read [the mission contract](STARFLIGHT_MISSION.md) for current rules and receipts. The previous seven-power repeating lab described below remains available at `?lab=1`; those historical sector timings do not describe Gatebreak.

Serve the repo and open `http://127.0.0.1:4194/prototypes/starflight/`. Nine weapon cards now include Stormwing (key 8) and Ricochet (key 9). Ordinary damage/destructions earn supplies; stored capsules spend before full reactor charge. Destroy required patrols, silence the batteries and defeat Veyr to open the gate. Enemy groups return rather than escaping to advance a timer. Brief relief windows separate encounters. Pause, Retry, the paused weapon bay, secondary-thumb buttons and both phone safe areas remain available. Nova has shot-following plasma petals and an iris pulse; Stasis uses a rotating ship emitter. Cosmetic effects do not enlarge damage shapes.

Gatebreak is a browser mission, not a new APK or the entire proposed campaign.

### Historical endurance lab

The owner authorized a fast starship-versus-starship prototype with direct flight, scrolling environments, powerful readable weapons, new extracted artwork and parallel implementation. Design decisions, committing and pushing are delegated. This is a separate browser experiment; it does not silently replace the five existing chapters or enter their reviewed APK.

After playing it, the owner requested a single circular reactor, a lower/smaller hero, more enemy families, meaningful weapon variety, stronger resistance, no dotted aim paths, asteroids and gravity hazards. Those changes form the current combat checkpoint. The later request is **campaign design first**: [STARFLIGHT_CAMPAIGN.md](STARFLIGHT_CAMPAIGN.md) plans combat-first authored chapters and equipment choices. The owner clarified that rescue-earned progression was an example, not a required formula. Those campaign systems are proposed, not implemented by this combat checkpoint.

### Play and controls

Serve the repository root with `python -m http.server 4193 --bind 127.0.0.1`, then open `http://127.0.0.1:4193/prototypes/starflight/`. The previous chapters remain at `/dist/breach.html`. This development server must remain running.

Drag anywhere on the battlefield to steer relative to the ship's current position. It never snaps beneath the finger. Twin cannons fire automatically. Arrow keys or WASD steer on desktop. Tap the single lower-left ship/reactor icon or press E to open the seven-weapon arsenal. The ring displays earned charge. Choosing a weapon spends one full charge; keys 1–7 match the card numbers. The chooser freezes combat and cancels held input. Closing it resumes deliberately; it cannot become a free hidden slow-motion effect. Pause includes Resume, Retry, sound and briefing. Losing offers a fresh retry. Backgrounding pauses the simulation and requires Resume.

The small white ship core is the vulnerable hitbox. Wings are forgiving. Enemy hulls, including the guardian's wings, accept ordinary fire. Weapon trails and glow are visual; swept collision follows the payload. Every enemy barrel and engine uses measured anchors from its actual sprite. Left, right and paired volleys use local charging muzzle light before launch, with no dotted aiming paths. The hero begins at 90% of the combat field. A swept control-reserve circle measured from the actual reactor prevents the ship hiding behind that button while leaving the central/right lower flight lane available.

Shared display widths are now player 52, scout/interceptor 40, gunship/frigate 74 and guardian 196 world units. Model geometry and rendering shrink together. The top HUD is reserved; combat is clipped below it, and only one guardian HP bar is drawn. Rotation into a short landscape viewport pauses with a portrait prompt. Resize rebases player history while paused, preventing a fictitious swept collision on Resume.

### Story and distinct sectors

The crew has escaped Carrier Breakout. Their convoy cannot leave the system while three blockade transmitters remain active. The player pilots its escort and opens the evacuation corridor.

1. **Carrier Reach:** crossing scouts and banking gunships establish movement and interception; the Blockade Commander uses a narrow spread.
2. **Relay Drift:** opposing lanes and angled approaches make lateral positioning matter; the Relay Hunter aims at the pilot's locked warning position.
3. **Forge Belt:** denser mixed formations and the Forge Dreadnought's wider fan demand route selection and saved reactor charge.

Each sector currently has seven scheduled formations, a guardian at 45 seconds, then an eight-second danger-free convoy jump after the guardian falls. There are no numbered wave labels. Hostile shots clear at victory, the ship repairs one hull point on entering the next sector, and the environment changes tint. After three sectors, another cycle increases pressure. This is a playable endurance loop, not three finished campaign episodes. New beetle interceptors and missile frigates join the first sector from its later formations; the later sectors use the crescent guardian and different patterns. The convoy is narrative context and jump messaging, not a simulated escort object.

### Weapons, physics and balance

Seven reactor choices provide different roles: piercing Lance, guided Seekers, weaving Serpent shots, orbiting Wingmen, a radial Nova, five-barrel Hyper and Stasis. All consume a full charge and have bounded durations/counts. Productive ordinary damage banks reactor credits; they fill at capped Easy/Medium/Hard rates of 3.3/3/2.7 points per active second. Powered hits cannot refill their replacement. Repair, shield, rapid-fire and charge pickups use equipment artwork rather than plus/minus tokens. Exact durations and damage belong to the combat contract.

Destructible drifting asteroids offer temporary cover and can be shot apart. Warned gravity pockets pull within a bounded radius; they do not teleport or instantly kill. The new missile frigate has six measured tubes; its launch pattern uses real tube origins. Broad hull damage remains available, including on the new crescent's physical lobes, while its open notch remains empty.

Easy/Medium/Hard vary hull, projectile speed, warning duration, guardian health and shot limits. See [the combat contract](STARFLIGHT_COMBAT.md) for exact values, collision equations, update rules, seeds and measured routes. Simulation uses a fixed frame accumulator and substeps, relative swept collision, bounded object lifetimes and capped counts. New physics is isolated from the existing breaker model.

Successful model-assisted routes prove reachability, not human difficulty. Human phone feedback should tune warning lead time, projectile density and charge cadence before adding more content. Preserve fair dodge gaps and ordinary-fire viability instead of making payment necessary to win. There is no ad, purchase, token economy or persistence in this prototype.

### Art and implementation

- `prototypes/starflight/`: HTML, mobile HUD, inputs, Canvas rendering and house audio.
- `src/starflight/model.js`: deterministic movement, collisions, waves, enemies, powers and progression.
- `src/starflight/geometry.js`: actual sprite dimensions, UV emitters and compound hulls.
- `art/starflight/`, `art/starflight-v2/`, `art/starflight-arsenal/`: permanent ship/environment/VFX/equipment sources, briefs, extraction scripts and proof.
- Matching folders under `assets/`: runtime sprites and manifests. [Art handoff](STARFLIGHT_ART.md) records source hashes, alpha, sizing and provenance.
- `prototypes/starflight/render-effects.js`: textured payloads, local cannon charging, asteroid/gravity and actual orbiting drone rendering.
- `tests/starflight.test.js`: collision, progression, power budget, timing and manifest agreement.
- `tools/playtest/starflight.mjs`: phone browser input and capture evidence.

The six VFX cells are extracted by `art/starflight/extract_weapons.py`; projectile contact pivots are measured inside their transparent frames. The arsenal extractor isolates connected silhouettes, including separated paired missiles/drones, instead of blindly clipping a uniform grid. Existing Lilita One/Rubik and `src/audio.js` are reused. No additional runtime dependency was introduced.

The environment scrolls a dark seamless nebula with quiet parallax. Cyan player fire, coral enemy rounds and violet Hyper remain readable. Effects use extracted raster glow, missiles, drones, muzzle and explosion artwork; engine plumes and local cannon charging use lightweight Canvas primitives. These are animated sprites and transforms, not new fully rigged 3D ship models. Per-class physical wreck breakup remains a campaign production task; the prototype has a common explosion family and cosmetic asteroid fragments.

High-level pacing references: [Sky Force Reloaded](https://www.idreams.pl/en/our-products/show/product/77-Sky-Force-Reloaded) and [Phoenix 2](https://firigames.com/phoenix2). The campaign document expands this with the owner's Gradius/Life Force/Galaga/TwinBee references, primary-source links and limits of the research. No artwork or layouts are copied.

### Integration gates

Keep this experiment outside the pinned five-chapter Android bundle until its own browser review is complete. Packaging it later requires a deliberate entry-point/build change, offline asset embedding, revised bundle pin, native instrumentation and a new APK. Do not label the earlier APK as containing Starflight.

Before adding more sectors: follow the ordered campaign plan, build its first complete combat-and-weapon-choice slice, play on physical phones and measure long-run performance/difficulty. The campaign needs save/checkpoint rules and story transitions. Portrait is the intended layout. Do not treat old larger-ship or three-power validation receipts as current evidence.

### Current verification

The complete branch passes 266 unit tests. Final source-sealed phone-browser evidence, staged power images, ordinary first-sector routes and normal-clock smoke are preserved in [validation/starflight](validation/starflight/README.md). Six mode/phone cases and 42 ability activations pass; actual alpha checks verify reactor and screen-edge clearance. These certify the browser combat lab, not future chapters, human balance or native device performance.


---

# Part T: Starflight combat contract

*Source: `docs/STARFLIGHT_COMBAT.md`*

## Starflight combat prototype

This is the standalone direct-flight shooter model on `codex/starship-run-prototype`. It is separate from the five BREACH breaker chapters and their delivered APK. `src/starflight/model.js` contains no DOM, renderer, asset or package dependency. The prototype interface and final art integration are separate work; the model-only checks below do not establish a new APK, human difficulty or physical-phone performance.

The player escorts an evacuation route through three guarded jump gates. Dragging steers the ship directly through the lower 65% of the portrait field. The ship fires automatically. The current revision adds seven earned weapon choices, slow banked reactor charging, new physical ship families and missile roles, destructible moving asteroids and temporary gravity fields. Defeating a gate guardian earns an eight-second danger-free jump, one point of repair and the next distinct formation. Three sectors loop indefinitely with modest per-cycle resistance/speed growth. There is no paid-power requirement or resource shop in this model.

### Interface and coordinates

```js
import { Starflight } from './starflight/model.js';
const game = new Starflight({ width: 360, height: 780, difficulty: 'medium', seed: 1 });
game.setTarget(worldX, worldY); // Also starts movement; finite coordinates only.
game.setMoving(false);        // Release: inertia damps; firing continues.
game.setControlReserve({ x: orbWorldX, y: orbWorldY, r: orbClearance });
game.activate('laser');       // stasis/hyper/seeker/spiral/drones/nova also supported.
game.pause(true);             // Every simulation clock freezes.
game.update(1 / 120);         // Caller owns fixed-step accumulation.
```

Restart by constructing a fresh model. The constructor rejects invalid or smaller-than-260×360 fields, so the actual guardian fits; an unknown difficulty uses Medium. All distances use the supplied logical canvas dimensions. The model does not resize a live encounter. Player starts at `.90×height` and targets clamp to `x=PLAYER_EDGE..width−PLAYER_EDGE`, `y=.35×height..height−38`. Shared `geometry.js` exports `PLAYER_EDGE=SHIPS.player.width*.52`, currently27.04u: this keeps the banked opaque wings inside the screen, exceeding their measured25.996u horizontal extent. Current position, boundary velocity and reactor-target feasibility all use that same player-only edge; enemy positions retain their own limits. The renderer reserves roughly 36 CSS pixels below its playfield and owns the single lower-left reactor control; the model owns neither HUD strip nor menu. Display the small central 7u player collision core instead of implying that transparent fins are vulnerable.

`controlReserve` is optional in the constructor and can be refreshed with `setControlReserve({x,y,r})`; `null` or no argument clears it. It is a circular ship-centre exclusion measured from the actual DOM reactor, not a second hostile hitbox. Convert the control centre to world coordinates using the rendered world origin/scale; include the control's half-width plus roughly24 CSS pixels of ship-hull clearance in `r`. The setter clones finite positive-radius input, returns false without replacing a valid reservation for malformed input, and never changes the ship's current position. Root UI owns measuring this after launch/resize. The model does not infer DOM safe areas.

| Field | Renderer contract |
|---|---|
| `player` | `x,y,px,py,vx,vy,r=7,hp,maxHP,invuln,angle,targetX,targetY,moving`; angle is a visual bank tilt. |
| `enemies` | `id,kind,ship,role,x,y,px,py,vx,vy,r,hp,maxHP,angle,hurt,bornAt,variant,warning`; physical classes remain `scout`, `gunship`, `boss`; `ship` selects scout/gunship/boss/beetle/frigate/crescent; variant is sector 1–3. |
| `enemy.warning` | Null or `{kind,age,life,sources:[{port,from:{x,y},angle,angles}],targetX,targetY}`. Draw every actual source. Top-level `from/angle/angles` remain first-source compatibility aliases. |
| `warnings` | Current enemy warning references for one overlay pass; draw once, not again if the ship renderer already draws it. |
| `shots` | `id,x,y,px,py,vx,vy,r,side,kind,damage,age,powered,pierce,heading,speed,from,owner,port`; `hit` is an internal Set of already-hit target IDs. Homing shots add `turnRate,homingTime,targetId`; spiral adds `wavePhase`. Derive rotation from the actual changing `atan2(vy,vx)`. |
| `hazards` | Moving `asteroid` objects: `id,x,y,px,py,vx,vy,r,hp,maxHP,angle,spin,hurt`; r is the solid body's radius, excluding image padding. |
| `fields` | `{id,kind:'gravity',visual:'wormhole',x,y,r,coreR,age,warning:2,life:7,strength:360}`; forces are model-owned, with no teleport or direct core damage. |
| `drones` | `{id,x,y,px,py,r:6,hp:2,maxHP:2,age,angle,fireAt}`; zero-HP drones are not rendered and are removed on the next update. |
| `pickups` | `id,x,y,r,kind,age`; kinds are `repair`, `shield`, `rapid`, `charge`. |
| `effects` | `{x,y,kind,age,life,seed}`. Kinds include `muzzle`, `enemyMuzzle`, `hit`, `explosion`, `shield`, `hurt`, `jump`, `pickup`, `rockHit`, `rockBreak` and ability IDs. Muzzles add `owner/port`; pickup adds `pickupKind`; rockBreak adds `size`. Drawing must not age or remove these. |
| Progress | `time,sectorTime,sector,cycle,completedSectors,score,kills,rocksBroken,charge,chargeBank,weapon,jumpRemaining`. Sector is 1–3; cycle starts at zero. |
| Status | `state='play'|'lost'`, `phase='combat'|'boss'|'jump'`, `paused` separately. `reason='Ship disabled'` on loss. |
| Timers | `timers={laser,stasis,hyper,seeker,spiral,drones,nova,rapid,shield}`, plus `shieldCharges`; seconds, never wall-clock timestamps. |

`width` and `height` are public, and the selected ID is `difficulty`. `rules` exposes the mode's fixed pressure data. The seeded random stream controls weave phase; the same seed and fixed inputs reproduce the same encounter. The model's substeps are at most 1/120s; one caller update is capped at .1s, and negative, zero, NaN and infinite deltas do nothing. A stalled frame therefore cannot teleport the ship or replay several seconds of enemy attacks.

### Flight and physical damage

Movement uses a damped positional spring: acceleration `140×target displacement−23×velocity`, speed capped at 480u/s. On release, velocity decays at `exp(−16×dt)`. Movement remains two-dimensional, with a small bank response to horizontal velocity. An interpolating renderer can use previous/current coordinates; interpolation must not write those positions back into the model.

Targets covered by `controlReserve` project to the nearest sampled valid circle-edge target within the field. Actual movement uses a swept collision against that circle: inward velocity is removed and remaining motion slides tangentially. If a world-edge clamp would cut the tangent through the control, the ship stays at the contact it actually reached. A newly measured control that already overlaps the ship applies bounded outward acceleration, rather than ejecting it in one frame; the usual480u/s cap remains. Bottom central/right movement remains available. The actor's enemy hurt core remains7u and is not enlarged by this UI clearance.

Projectiles and ships collide as swept circles in relative motion, including a target crossing a fast projectile. `src/starflight/geometry.js` is the shared rendering/physics source: `SHIPS` contains exact manifest UVs/aspects at widths52/40/74/196 for player/scout/gunship/boss; beetle/frigate/crescent keep widths40/74/196 with their own actual aspects and hardpoints. These are the smaller requested runtime sizes; full-resolution source sprites are preserved. `shipPoint(kind,x,y,angle,uv)` rotates hardpoints around the real canvas centre. `shipCircles` provides conservative compound hull bands fitted to delivered solid bounds. These approximate broad metal bodies, not pixel-perfect alpha; thin antennae remain decoration. The crescent's deep lower notch stays open around its real centre barrel. Outer wings and guns accept ordinary damage. `enemy.body/previousBody` are cached compound circles; `enemy.r` is a representative centre radius, not the whole hull.

An ordinary player shot stops at the first physical ship or asteroid encountered, with one HP/charge credit even where one ship's compound parts overlap. A laser can pierce two different targets, once each. Hit effects appear at swept contact. Hostile shots can be absorbed by a nearer asteroid or real orbiting drone before reaching the player; enemy damage never grants player reactor credit. There are no invisible brick barriers, pixel-perfect weak points or required transformations. A body collision costs one player HP and damages an ordinary enemy/asteroid by three without energy credit. A continuous overlap is one body-contact episode, not damage repeated every frame.

All hostile shots that touch the player are consumed, including hits during invulnerability. A real damaging hit gives 1.25s invulnerability, preventing simultaneous bullets from taking several HP. A shield pickup absorbs one contact and grants .35s protection. The player begins with 1.5s protection. The last legal boss hit clears the threat before an incoming same-step lethal shot; completed gates cannot be undone by a leftover projectile.

### Weapons, earnings and limits

| Weapon | Actual model behaviour |
|---|---|
| Twin auto-fire | Two r3.4 shots every .16s, 860u/s, damage 1 each. Always available while in combat. |
| LASER | 4s of twin r5 projectiles, damage 2, up to two distinct targets per shot; .14s cadence. |
| STASIS | 4.5s at .32× hostile-projectile translation and .45× asteroid drift. Enemy movement, warning duration, field lifetime and spawn clocks retain ordinary timing. |
| HYPER | 2.5s of five r4 shots per fan from the actual twin ports, .10s cadence, offsets −.24,−.12,0,.12,.24rad; damage 1 each. |
| SEEKER | 6s secondary battery: up to two guided r5 missiles every .85s, damage 3 each, max six live. Speed420u/s, capped2.8rad/s steering for at most4s; reacquires a live forward target if the old one is destroyed. Ordinary primary fire continues. |
| SPIRAL | 5s of twin r4 weaving rounds every .12s, damage1.4. Actual headings oscillate ±.38rad at9rad/s in opposite phases; visual trails cannot substitute for their physical paths. |
| DRONES | Two r6 orbiting defenders for6s; deploy over.25s to33u orbit, two projectile intercept HP each. Each fires one powered damage1 pulse every.6s. Destruction removes that drone; it does not respawn during the same activation. |
| NOVA | Instant20-round radial damage3/r5 burst at470u/s, piercing up to two targets. Clears only hostile rounds within150u when cast. .65s presentation timer; no global damage or arbitrary boss HP deletion. |

Every activated ability costs the entire100-charge meter and clears pending banked energy. Unknown choice, paused/lost/jump state, insufficient charge or same-active recast returns false and spends nothing. A paused UI chooser must unpause the model before applying a valid selection. A different ability can overlap only after another full meter has genuinely been earned. Hyper takes primary priority over Laser, then Spiral; other secondary abilities do not replace the ordinary primary. Unused timers are not deleted.

Only productive ordinary damage banks .8 energy per actual ship/asteroid HP removed. An ordinary ship kill banks four more, or twelve for a guardian. Visible charge fills from that bank at most3.3/3/2.7 points per active combat second on Easy/Medium/Hard: theoretical minimum refill30.30/33.33/37.04s after enough energy has been earned. Empty bank produces no passive charge. Both visible-plus-pending capacity and visible meter cap at100; no overflow survives spending. Pause/jump/loss freeze filling. Floating-point completion snaps cleanly to100 so the UI cannot strand a full meter at99%.

Destroyed targets, zero damage, body collisions, enemy fire and powered projectiles bank nothing. Seeker/Spiral/Drone/Nova rounds are explicitly powered. A charge pickup banks25 rather than bypassing the time limit. A powered kill that would have dropped charge instead drops Shield, preventing indirect self-refill through its own energy loot. Ordinary primary hits made while a defensive ability is active remain productive ordinary hits.

Each fifth non-boss kill drops the next item in a fixed `repair→rapid→shield→charge` cycle, with at most eight live pickups. Repair adds one HP up to the mode maximum; rapid adds six seconds of .105s twin cadence, capped at twelve; shield grants one hit for ten seconds. Pickups drift at 75u/s and expire after fourteen seconds. Natural pickups can help an otherwise unactivated-ability route and must be disclosed in test reports.

Total live projectiles from internal player/enemy emission are bounded at180; hostile volleys additionally obey the mode budget. Guided player missiles cap at six, drones at two, asteroids at six and gravity fields at one. A volley that would exceed its budget does not emit. At most two enemies charge concurrently. Effects cap at100. Gravity-bent projectile speed is bounded at1.35× its base speed. These are prototype budgets, not measured mobile-GPU limits.

### Authored route and pressure

Wave arrivals are at sector seconds `2,7,13,20,27,34,40`. Each wave contains three/four/five ships on Easy/Medium/Hard, with at most twelve regular ships present. The boss is introduced at 45s, so the first encounter cannot end before the guardian arrives. Existing surviving enemies remain physical during its entry.

1. **Outer approach:** existing scouts/batteries at2/7s teach the direct-flight loop. From13s, later formations mix actual beetle interceptors and missile frigates so first-play variety appears before the first guardian. The first guardian retains its original identity.
2. **Relay corridor:** beetles enter from alternating wings with deeper/faster weaving. Frigates send slower, bounded-turn guided rounds from actual launch tubes. The crescent guardian alternates targeted fans with three fixed-angle lane rays; a temporary gravity field appears at22s.
3. **Reactor perimeter:** mixed missile-frigate/interceptor groups apply sustained resistance. The crescent uses separated outer fans with a real centre gap. Its field arrives at16s; this is a different pattern/timing, not only recolouring/HP.

Warnings lock intended aim at their start and stay attached to each moving real muzzle. The UI uses physical muzzle charge/bloom, never dotted lines over the field. `sources[].angles` still defines actual launch directions for physics/QA. Beetles alternate their two real mandible guns. Existing gunships cycle left/right/paired fans; frigates cycle actual left/right/paired launch racks and all six measured tubes over successive volleys. Guided enemy missiles steer at most.9rad/s for1.8s, then remain ballistic; they are slower than basic rounds by35u/s and gain a longer charge tell. Guardians cycle left/right/paired/centre, with four total rays for paired fire rather than a continuous wall. Ships finish entry and blend into lateral motion before firing; scouts fire only above38%field height.

Asteroids arrive at9,18,29,38s: two per arrival in sector1, three later, with live cap6. Their solid radii16/21/26u have mode-scaled HP, drift74/83/92u/s by sector and bounded sideways motion. They physically block both sides' shots; breaking one awards30score plus actual-damage score, increments `rocksBroken`, and does not masquerade as a ship kill or grant infinite loot.

A field chooses a far candidate position with at least36u between the player's current core and its outer edge. Radius is at most80u, actual size visible in the renderer. Two seconds of warning precede a .4s force ramp, and the final .5s fades it out; total life7s. Bounded360u/s² pull falls to zero at the boundary and bends ships, shots and (more weakly) rocks. Player input/speed remains authoritative enough to escape. The core causes no direct damage, instant death, charge loss or forced teleport. Fields disappear on earned jump; pause freezes them.

| Mode | Player HP | Ordinary enemy HP multiplier | Hostile speed | Basic tell | Recovery/cooldown | Guardian HP | Hostile shot cap |
|---|---:|---:|---:|---:|---:|---:|---:|
| Easy | 5 | 1.15 | 185u/s | 1.15s | 2.8s | 220 | 30 |
| Medium | 4 | 1.5 | 220u/s | 1s | 2.4s | 280 | 38 |
| Hard | 3 | 1.8 | 250u/s | .9s | 2.1s | 340 | 48 |

Guardians and missile frigates add.3s to the tell; guardians use cooldown minus.6s, others plus.25s. Scout base HP is five, gunship fourteen, rounded up after mode/cycle scaling. Each complete three-sector cycle adds18%base resistance and8u/s hostile speed; scout descent adds5u/s. Interceptors additionally descend16u/s faster than ordinary scouts. This is an endless score chase, not a promise that an arbitrary later cycle remains equally forgiving.

### Gate, loss, pause and retry

On guardian HP zero: award the kill once, clear enemies/shots/warnings/rocks/fields, increment `completedSectors`, enter `jump` for eight seconds. Movement, existing drone orbits and surviving pickups can continue; new fire, bank filling and ability timers pause. At jump end—not its start—advance the sector, reset the authored schedule, repair one HP up to maximum and grant1.5s protection. Sector3 advances to sector1 with `cycle+1`.

On player HP zero: state becomes `lost`, movement stops and subsequent `update` calls freeze. No automatic revive, paid continue or hidden stat reset exists. The outer UI owns the loss screen and creates a new model for Retry. Pause returns before movement, animation clocks, warnings, shots, charge, drops or phase clocks; the UI should also stop its held input and pause button gestures must not steer the ship.

### Verification and current limits

`node --test tests/starflight.test.js` currently passes35 focused checks: responsive bounded motion; actual new/old manifest anchors; broad hull/crescent-notch collision; swept fast/moving target hits and cover; contact episodes; all seven power limits; homing steering; physical weaving; drone interception; bounded Nova; no self-refill; bank timing; pause of active fields/drones/rocks; gravity warning/escape margin; hazard destruction; deterministic subdivision; difficulty data; phase/terminal precedence; and a first-gate route. Five newer checks verify smaller ship sizes, cloned/validated reservation input, swept control avoidance at613/656u heights, maximum movement distance, the bottom central/right lane, gradual recovery from a newly overlapping control and pause. The shared wing edge is checked at260/360/412u widths for target clamp, every movement sample, outward velocity cancellation and reservation feasibility. The Easy input-only route uses no activated ability, with natural pickups allowed.

Final model/geometry checkpoint: `model.js` SHA256 `6AA76B7B6D7C54E91C369BCF845F418F7EC56E3F57499D226E2CB0276921CF4A`; `geometry.js` `D73C3F3C62B960749F0FD1AAA014AED70AF5E82EFEC70E7E85CE9E39A5B924DA`. Browser/native receipts must identify whether they include these smaller widths, wing clearance and actual DOM reservation. Earlier larger-ship runs do not automatically prove the final layout.

The following bounded seed-7 assists are retained for calibration, **before the final smaller geometry/reservation revision**. They used120Hz simulation, visible forward-target tracking, simple near-future visible-shot/asteroid avoidance and only public `setTarget`, `activate` and `update`. They never wrote HP, positions, charge, timers or boss state. The powered policy selected successive earned `seeker,spiral,drones,nova,laser,stasis,hyper` choices. One attempt per mode/height/policy was made; natural pickups are disclosed:

| World height / policy | Easy | Medium | Hard |
|---|---|---|---|
| 613u, no cast | Gate62.07s, HP2, repair | Lost58.97s; guardian110HP, repair+rapid | Lost52.16s; guardian258HP, repair |
| 613u, earned choices | Gate62.07s, HP2, one Seeker; repair | Lost58.97s; guardian100HP, one Seeker; repair+rapid | Lost60.14s; guardian154HP, one Seeker; repair |
| 656u, no cast | Gate62.27s, HP2, no pickups | Gate67.78s, HP1, repair | Lost60.28s; guardian156HP, no pickups |
| 656u, earned choices | Gate62.27s, HP2, one Seeker, no pickups | Gate67.15s, HP2, one Seeker; repair | Lost57.74s; guardian183HP, one Seeker, no pickups |

First earned readiness was32.66–32.86s Easy,35.54–35.65s Medium and39.67–39.71s Hard. This is the slow banked economy, replacing earlier rapid refills. These logical heights approximate the actual shorter phone fields; a default780u simulation alone is insufficient layout/balance evidence.

One additional bounded left-wing aiming tactic, saving Laser until the guardian, preserved the same failed cases:613u Medium lost62.07s with17 guardianHP;613u Hard lost52.16s with191HP;656u Hard lost60.28s with85HP. Matching no-cast wing attempts also lost, with79/264/167HP remaining. No further parameter/seed search or silent balance change followed. These are limitations of the tested policy/current pressure, not proof that a human cannot win. Medium on the shorter field and Hard remain pending calibration and human attempts.

Historical receipts at780u, before the late-sector1 family mix, also remain informative but superseded: no-cast first gates62.81/67.64/73.13s (Easy/Medium/Hard). Powered three-gate Easy completed203.47s/HP4/five casts; Medium218.69s/HP1/five casts; Hard lost188.13s in sector3 after two gates and four casts. These naturally collected pickups. Earlier three-choice economy/hardpoint receipts—first gates50.98/53.24/52.43s, powered50.25/50.41/49.40s, three gates165.04/165.18/167.79s—belong to the preceding weaker revision. Its10.51–16.30s recharge measurements are historical and do not describe the current bank. Centre-radius prototype receipts52.47/54.59/54.06s are older again.

The guardian first appears at approximately45.01s; final geometry's route/pacing must be measured rather than inferred from those historical wins. Model assists do not establish human challenge, touchscreen feel, native frame rate, screenshot quality, a pickup-free ordinary-only route, or APK admission. Before prototype release, the renderer owner must verify actual ship pivots/hitboxes and DOM control clearance at393×852 and412×915; readable moving muzzle/shot continuity; touch cancellation; all seven choices; projectile/effect budgets; pause/Retry with no stale input; three-sector transitions; font/decode readiness and page errors. Retain unsuccessful attempts with successful receipts.


---

# Part U: Starflight artwork pipeline

*Source: `docs/STARFLIGHT_ART.md`*

## Starflight prototype artwork

This new scrolling shooter family uses complete newly rendered starships, extracted from a coherent transparent sheet. It shares the glossy ceramic, machined dark metal, bevels and controlled emission of the approved space artwork. It contains no companions or princess imagery.

Originals and the complete production prompt are retained in `art/starflight/ships-source-v1.png`, `background-source-v1.png` and `production.json`. The source ship sheet is 1254×1254 RGBA with genuine transparency; the environment source is 887×1774 RGB. The source originals remain unchanged.

Run `python art/starflight/extract.py`, then `python art/starflight/proof.py`. Extraction labels actual connected alpha islands, retains bounded soft edges, isolates each sprite, and normalizes it without stretching. Runtime PNG metadata is empty, fully transparent RGB is zeroed, and every sprite has transparent outer padding. The background preserves the quiet dark centre; its top/bottom rows match exactly for vertical scrolling, with only 64-pixel edge bands normalized.

The runtime contract is `assets/starflight/manifest.json`. `ships`, `effects` and `background` entries provide paths, sizes, source/runtime hashes and dimensions. Ship `pivot:[.5,.5]`, `muzzles` and `engines` are normalized coordinates relative to the complete sprite canvas. Draw a sprite at its centre, using its full canvas aspect ratio; do not crop around the glow a second time. The white marker dots in `art/starflight/native-extraction-proof.png` show authored muzzle origins; they are proof annotations rather than baked sprite pixels.

| Sprite | Runtime pixels | Current world size | Direction |
|---|---:|---:|---|
| Player interceptor | 320×288 | 52×46.8 | Up |
| Scout | 256×288 | 40×45 | Down |
| Heavy gunship | 448×384 | 74×63.43 | Down |
| Dreadnought | 768×576 | 196×147 | Down |

`solidBounds` excludes faint outer glow and is a visual reference, not an automatically admitted damage shape. The gameplay model owns fair ship hit radii and projectile collision. Each muzzle is placed at its actual barrel tip. Enemy craft have one, two and three firing origins respectively; the player has two forward barrels. Separate cyan/coral pulse, impact and exhaust sprites are optional candidates; the dedicated weapon family may replace them. The exhaust includes a small nozzle collar and should sit behind the ship's existing rear hardware if used.

`native-extraction-proof.png` and `asset-checks.json` show deterministic raster/anchor checks and phone-scale composition. They are staged asset proofs. Actual scrolling, firing, impact motion, collision, input, performance and device testing belong to the integrated prototype review.

The integrated model and renderer share the sizes above through `src/starflight/geometry.js`; the earlier staged proof uses its original suggested sizes. Enemy compound hulls are explicitly authored, and player damage uses a forgiving seven-unit core.

The dedicated weapon source is `art/starflight/weapons-source.png` (1536×1024 RGBA). Its exact prompt is retained in `weapons-prompt.md`. Run `python art/starflight/extract_weapons.py` to recreate six 256×256 padded alpha sprites under `assets/starflight/weapons/`. The manifest records source hash, source cell rectangles and measured projectile contact pivots. Runtime maps plasma to ordinary cyan fire, enemy to coral plasma, hyper to violet barrage, and the other cells to muzzle/explosion/stasis feedback. Lance uses a rotated Canvas streak aligned to physical velocity. All 19 new source/runtime PNGs passed decoding and empty-metadata checks on 2026-10-20.

### Additional enemy and equipment families

`art/starflight-v2/` retains the transparent source sheet, prompt, deterministic extraction, anchor checks and staged proof. `assets/starflight-v2/manifest.json` records the beetle, frigate, crescent guardian, asteroid, gravity and wormhole sprites. Nineteen authored hardpoints lie on solid source pixels. Current beetle/frigate/crescent widths are 40/74/196 world units; `src/starflight/geometry.js` is authoritative. Earlier manifest suggestions and staged proof scales are historical. The open crescent notch has a matching open compound collision hull.

`art/starflight-arsenal/source.png`, `SOURCE.md` and `extract.py` preserve the equipment sheet and extraction. `assets/starflight-arsenal/` contains eleven 192×192 padded sprites: laser, hyper, seeker, spiral, drones, nova, stasis, repair, shield, missile and drone. The seven equipped powers use these actual icons in the circular reactor's chooser. Repair/shield artwork is preserved without implying an additional selectable ability. Manifests record orientation and source rectangles.

All three source families and runtime assets are preserved in `artwork-library/`. The prototype currently uses textured projectiles and explosions with procedural motion. The campaign's differentiated per-role breakup sequences, physical rescue pods and permanent ship attachments remain planned work in `docs/STARFLIGHT_CAMPAIGN.md`.

### Stormwing and Ricochet

`art/starflight-storm/` preserves the exploded design study, exact original player reference, prompts, extraction script, assembly and native-size proofs. The wider study is not substituted for the approved ship: the production body and left/right wings are isolated from the original hero and reconstruct its RGBA pixels exactly. `assets/starflight-storm/manifest.json` records five stripped transparent PNGs (204,385 bytes; 1,433,600 decoded bytes), source hashes and measured anchors. Its SHA256 is `f790294c4b77c56080238d8087a30a084f086d2694cc6c2d46aaacc2dd620074`.

Wing positions are inner attachment pivots, not sprite centres. At a 52×46.8 world draw size the neutral offsets are left [-4.875,3.25], right [4.875,3.25]. `STORM_WINGS` in `mission.js` defines the exact pivot, muzzle-tip and engine offsets; both collision and drawing use `wingPoint`. The thunder joins the measured tips through separation, sweeps as the moving damage band, then turns off while the wings return to the current rotating ship sockets. Ricochet is a real extracted missile with a short trail, not a continuous screen-wide beam. New Nova petals follow its actual radial projectiles. Wreck rendering inherits ship drift and uses delayed heavy cook-offs; these are sprite transforms, not newly fractured or rigged hull assets.


### Rechecked equipment family
`art/starflight-equipment/source-v1.png`, PROMPT.md and extract.py preserve the original sheet and deterministic extraction. `assets/starflight-equipment/manifest.json` records measured nose pivots and source/runtime hashes. Guided and Ricochet projectiles launch from actual rotating ship sockets. Shield transparent centre surrounds the ship; its visible outer31u ring matches hostile-projectile interception. Four PNGs have zero-alpha edges, no metadata and no hidden RGB. The permanent archive preserves these and the original Storm split-wing family.


---

# Part V: Starflight campaign production plan

*Source: `docs/STARFLIGHT_CAMPAIGN.md`*

## Starflight campaign: combat, consequence and mastery

Updated 2026-10-20. **PROPOSED CAMPAIGN — design first; no campaign implementation, human balance certification or new APK is claimed.**

Implementation checkpoint: [Gatebreak](STARFLIGHT_MISSION.md) is now a separate finite browser mission using returning patrols, productive hull damage, capability loss, earned supplies and a final gate departure. It does not implement the six proposed chapters, persistent equipment or chapter saves below. The original endurance lab survives at `?lab=1`. Latest owner priority is enjoyable, readable pressure and spectacular but bounded powers; Stormwing must suppress all friendly gunfire until its wings reattach.

The owner's latest correction supersedes the earlier rescue-to-module proposal. The references inform design judgment; they are not a progression template. This campaign centres on distinct enemy behaviour, authored terrain and formations, weapon tradeoffs, meaningful destruction of combat capabilities and replay mastery. Rescue is an occasional optional mission type. There is **no rescue requirement per chapter, six-specialist reward chain or mandatory permanent attachment system**.

The current [combat lab](STARFLIGHT_PROTOTYPE.md) has direct flight, automatic twin fire, seven earned reactor choices, several actual ship families, asteroids and gravity. It remains a repeating three-sector endurance loop. Authored campaign objectives, ordinary loadouts, component-specific boss states, chapter saves and class-specific wreck sequences below are proposed. Its common explosion is a current limitation. Preserve the lab and the five-chapter breaker APK independently; neither implements this plan.

### 1. Reference evidence and our conclusions

Research on 2026-10-20 used publisher/developer descriptions and original manuals. It was **not hands-on play or measurement of reference-game timings/physics**. The applications below are our inferences, not claims that those games prove retention, addiction or a particular balance formula. Keep our story, art, audio, silhouettes and layouts original.

| Primary evidence | Documented observation | Our application |
|---|---|---|
| [Konami: Gradius, Salamander and Life Force](https://www.konami.com/games/gradius/us/en/) | A fortress/core mission, different scrolling environments and a strategic power-up system; regional Life Force/Salamander versions differ. | Give the player a destination, different environmental problems and deliberate equipment choices. Do not copy stages or assume one version's rules apply to all. |
| [Nintendo publisher description: Galaga](https://www.nintendo.com/us/store/products/arcade-archives-galaga-switch/), [Bandai Namco description](https://www.bandainamcoent.co.jp/cs/list/nm_psp/galaga.php) | Captured-fighter rescue produces linked fire; Bandai also describes Challenging Stages. | Contrasting pressure/release can matter. An occasional rescue can have a consequence; this does **not** prescribe a rescue or upgrade every chapter. |
| [Nintendo: TwinBee](https://www.nintendo.com/en-gb/Games/Nintendo-3DS-download-software/3D-Classics-TwinBee-275152.html), [Nintendo-hosted manual](https://www.nintendo.co.jp/data/software/manual/man_sacj.pdf) | Visible changing bell rewards; different airborne/ground actions. | Readable weapon choices and enemy roles. Do not require tiny collectible juggling during phone crossfire. |
| [Gun-Nac original publisher manual, archived scan](https://www.thegameisafootarcade.com/wp-content/uploads/2017/02/Gun-Nac-Game-Manual.pdf), printed pages 10–11 | Numbered weapons, Wings and inter-stage supply choices change equipment. This is an original Nexoft/ASCII manual hosted by an archive, **not a current official publisher site**. | Distinct firing behaviours and calm selection between engagements; no imported cash grind or shop dependency. |
| [TimeSpace's Space Shooter X announcement](https://itch.io/t/2013327/space-shooter-x-release-announcement), [developer post](https://forum.gdevelop.io/t/space-shooter-x-now-on-itch-io-play-now-in-your-browser/38907) | A Web/Android shooter with enemies and asteroid avoidance; [another developer uses the same title](https://geymison.itch.io/spaceshooter-harushin). | **Exact SpaceShooterX identity unresolved.** These are candidates, not proof of the owner's intended app or its detailed mechanics. |
| [Official Play listing: Space Shooter: Galaxy Attack](https://play.google.com/store/apps/details?hl=en&id=com.space.shooter.alien.galaxyattack) | The developer uses Premium/VIP wording and describes drag steering, equipment and bosses. | **Exact VIP identity unresolved.** Use readable direct flight and a clear arsenal, without copying monetisation or claiming this is the exact app. |

### 2. Combat loop, story and replay

**Proposed original story:** Admiral Veyr has turned the jump network into a blockade supplying an automated foundry. The escort must break its combat systems, cross industrial approaches and remove the command ship's control. The evacuation convoy supplies context, not a compulsory fragile escort in every level. Three offset crimson slashes on batteries, relay hulls and the capital ship foreshadow the same commander. Existing Nix, Tick, Vesper, Latch, Kit, Lumi, Brum and Frost Warden identities remain intact.

Urgency is immediate and visible: an interceptor commits to a dive, a rack charges, a tug moves a rock into a passage, a shieldship rotates its protected face or a boss loses a gun and changes its attack. No invisible global deadline, forced grind or paid escape. Progress visibly removes a source, breaks a formation, changes a route or disables a capability.

The main loop is **read → position → commit fire → create an opening → exploit → recover**. An optional gun is a safer target than rushing the core; leaving it alive can permit a quicker but riskier clear. Every chapter teaches, develops, twists and tests one positioning problem, with a quiet passage before its peak. Do not repeat the same kill group with a colour change and larger HP.

Keep relative one-finger drag, automatic primary fire and one reactor orb. The seven-choice arsenal pauses deliberately and cancels held input. Ordinary loadouts change in the briefing or safe checkpoint, not through extra combat buttons. Pause, background, chooser and portrait correction freeze the simulation and require fresh input on return. Full opaque ship clearance includes screen edges and the reactor, not only its vulnerable core.

Use one short chapter title, then physical landmarks and small objective icons. No WAVE N labels or repetitive results interrupting flight. Camera, scrolling and music bridge encounters through 3–5 s harmless passages. An empty sky or broken gun can be the reward; new equipment is not required. One repair at a chapter checkpoint is sufficient and cannot refill the reactor for free.

#### A small ordinary weapon catalogue

Choose **one firing preset**, not stacked permanent modules. Existing real twin-barrel anchors remain the shot sources. Physical muzzle inserts can be added only if needed for an admitted weapon state; attachment production is not a campaign dependency.

| Preset | Proposed physical contract | Tradeoff | Availability |
|---|---|---|---|
| Needle | Existing twin damage 1 rounds every 0.16 s: ideal 12.5 HP/s before misses | Focused hull/gun damage; needs alignment with crossing fighters | First start |
| Fan | Three damage 0.75 rounds every 0.18 s over approximately±0.17 rad: ideal 12.5 HP/s only if all connect | Broad crossing coverage; distant single-target damage drops as outer rounds miss | First start; actual alternating twin ports |
| Rail | Two damage 2 rounds every 0.32 s, at most 2 different targets per round: ideal 12.5 HP/s on one target | Rewards aligning a formation; missed aim and fast reversals cost more | One ordinary chapter 2 clear; no rescue, rank, payment or repeated farming |

These are campaign proposals. Equal theoretical DPS is not proof of equal feel. Needle must complete every chapter/mode. Rail cannot repeatedly hit one compound actor or pass invisible solid walls. There is no base damage/health upgrade ladder, six-module inventory or reward-per-level promise. Later chapters may award a route dossier, mastery mark or simply story completion.

Keep all seven reactor choices as temporary tactics: Lance for alignment, Seekers for mobility, Spiral for coverage, Drones for interception, Nova for a local emergency, Hyper for a brief burst and Stasis for route management. Start from their real [combat contract](STARFLIGHT_COMBAT.md). Proposed campaign limit is one active choice, no duration stacking and one 100-credit meter/bank. Offensive specials replace ordinary preset output rather than multiply every barrel; Stasis allows ordinary fire and Drones still count as one ability.

Retain earned ordinary-damage banking and the lab's fill baseline: minimum approximately 30.30/33.33/37.04 active seconds on Easy/Medium/Hard when enough credit exists. Powered damage/kills, wrecks and enemy damage earn none. Pause, menus and safe passages do not fill it. Specials cannot fund their own replacements. All critical paths remain possible without casting.

#### Mastery and replay

A first clear opens the next chapter. Optional records track clean positioning, clear time, capability-removal decisions and alternate routes; they grant no combat-stat advantage. Chapter 2 allows different disarm orders, chapter 3 has two routes that rejoin, and bosses allow safe disarm versus faster hull pressure. Challenge variants may change authored entry sides only after the base route works; they cannot randomise away its guarantee.

Score each enemy/component once. A possible later score-only combo is 3 s between kills, capped×3 and reset on damage; defer it if it distracts from combat. It never changes energy, loot or difficulty. Compare weapons on the same seed/mode and retain failed attempts. Observe whether real players understand changed capabilities and voluntarily replay; do not claim this research has proved addiction or retention.

### 3. Six authored chapters

**Every number below is provisional.** Every objective has a Needle/no-reactor route. Start with 360 u width and an authored distance director at 32 u/s. Required actors hold in view. No forced 45 s boss wait, endless replacement wave or invulnerability timer manufactures length. Fast combat may shorten the climax.

#### 1 — Breakwater: interdict

Dark orbital wreck edge; destroy a command frigate directing the approach. **Win:** broad command hull disabled. **Fail:** player hull 0. Surviving scouts need not be killed.

Approximately 2800 u: isolated curved interceptor → paired cross-entry → gunship holding one side → quiet wreck vista → command frigate with crossing escort. Teach leading a moving target, then committed-dive avoidance, then source suppression. Escort members form briefly and peel off rather than sharing one sine wave. Nobody fires before completing visible entry.

Frigate starts near(180,0.24 H),74 u wide. Shared hull 90/110/130 HP; optional left/right rack pools 12/15/18 each. A rack hit reduces its pool and shared hull once; other opaque hull hits reduce shared hull. No double score/energy. Rack destruction cancels that future source, while launched rounds remain until success. Alternate fixed-aim fire with a short three-shot rack volley; Easy allows one charging source. The last legal hull hit clears harmful work and starts harmless sequential ammo cookoff.

**Decision:** safely disarm or exploit a crossing opening for faster hull damage. Needle/Fan must both work at different effective positions. No rescue/module grant. **Target80–110s; intensity0.15→0.45→0.10→0.65→0, then4s quiet exit.**

#### 2 — Relay Drift: sever coordination

Offset station pylons; emitter ships coordinate a shield formation around a relay. **Win:** relay hull disabled. **Fail:** player hull 0. Killing emitters is a tactical choice, not a mandatory ordered lock.

Approximately 3400 u: unprotected pair → turning shieldship → full formation. Three emitters have at least 44 u exposed width and 14/18/22 HP. They govern targeting coordination, shield rotation and paired fire respectively. Their destruction removes those behaviours permanently for this encounter. Relay hull 105/130/155 HP; frontal shield reduces damage to 50%, never 0. Flank or shield-disabled hits deal full damage. No symbol order or pinpoint weakpoint.

Physical pylon routes remain at least 112 u; the central lane is always legal and one optional flank rejoins. A split shieldship creates a real low-pressure opening. Paired warnings remain attached to moving ports; stagger or cancel a volley if no safe route exists.

**Decision:** remove shield coordination, suppress paired fire or accept longer frontal shooting to reduce movement. **Target100–135s; intensity0.20→0.55→0.15→0.75→0, then4s station coast.** One clear opens Rail as a sidegrade once, not a mandatory upgrade.

#### 3 — Glassbelt: traverse

Ferric asteroid channel with two authored routes. **Win:** cross the far gate after breaking its blocking rock OR disabling the tow reel moving it. **Fail:** player hull 0. No kill quota or compulsory civilian HP meter.

Approximately 3400 u. Left route: more breakable cover and slow gunships. Right: open space with fast interceptors. Both remain 112 u wide throughout actual motion and rejoin before the gate. Teach one slow rock, develop shooting versus bypassing it, then combine one obstacle with a committed interceptor. A broad 36 u reel has 10/13/16 HP; destroying reel or tug stops the tow and cancels future pulls. Gate rock has 22/28/34 HP as an ordinary-fire fallback. Other rocks have 6/8/10 HP and radii 16/21/26; their fragments are harmless.

At most one moving rock threatens the selected lane at once, with 1.5 s visible approach. A central quiet pocket separates the route tests. An **optional deferred** side alcove may later contain one stranded capsule for score/story acknowledgement. It grants no unique weapon, blocks no next chapter and creates no mainline failure; it is not first-slice work.

**Decision:** cover and longer sightlines versus a faster exposed route; shoot terrain or preserve reactor. **Target90–120s; intensity0.15→0.50→0.15→0.70→0.**

#### 4 — Fold Sea: outmanoeuvre

Sparse gravity shoals and alternating shelter pockets. **Win:** disable both broad drive pods OR defeat the hunter's shared hull, then cross the clear gate. **Fail:** player hull 0.

Approximately 3200 u: harmless gravity tell → beetle crossing its edge → crescent hunter. Fields retain 2 s warning, bounded force and no teleport/direct damage. The hunter visibly banks before changing glide direction, fires bounded-turn missiles and keeps its actual lower notch empty. Hull 120/150/180 HP; two drives 24/30/36 HP each. Drive hits reduce drive and hull once; all other opaque hull remains productive. One failed drive reduces lateral movement and removes its missile source; both cause controlled drift, not an additional full-HP cleanup.

Fields alternate with attacks rather than covering every route. Required openings stay 112 u. After a committed missile salvo, cooling lasts 1.8/1.5/1.2 s before reposition. A field expires into a quiet pocket before the next peak.

**Decision:** change the enemy's mobility, concentrate broad hull damage or save Stasis for bad positioning. **Target100–135s; intensity0.10→0.45→0.10→0.75→0, then5s open sky.** No equipment reward is required.

#### 5 — Foundry Crown: dismantle

Industrial trench opening onto a siege machine. **Win:** remove its armour banks, then destroy a genuinely external reactor. **Fail:** player hull 0. No captive/shuttle dependency.

Approximately 3900 u: destructible wall bank → gun-versus-structure decision → dead-machine shadow → foundry. Two banks 28/34/40 HP each, external core 48/60/72 HP. Before exposure, other broad hull impacts route damage to the nearest surviving bank with clear local feedback. Bank loss removes its source and visibly folds/breaks metal clear, creating a route. Optional gun destruction suppresses future warnings, not already launched shots.

Attack capability changes: alternating banks → one-bank aimed bursts → short reactor vent pulses. Do not merely accelerate one fan at HP thresholds. Actual raster topology decides exterior access: an enclosed lip cannot become an invisible passage. Deliver opened parts or use a genuinely exterior core. Collapse is harmless. Core exposure gives 1.5 s readable relief before its first warned vent.

**Decision:** suppress a gun, concentrate bank damage or align Rail through different parts. **Target120–165s; intensity0.25→0.60→0.15→0.85→0.**

#### 6 — Dawn Corridor: break command

Final jump causeway and Veyr's capital ship. **Win:** shared command hull 0 OR both engines disabled, then accepted gate crossing. **Fail:** player hull 0. Evacuation is background consequence, not a surprise compulsory escort system.

Approximately 4200 u, two defended crossings separated by a silent fleet vista. Capital shared hull 160/195/230 HP, engines 34/42/50 HP each. Broad metal always reduces hull; engine impacts also reduce that capability once. Engine loss removes a linked gun and visibly tilts the group. Both disabled produce wounded drift; hull 0 produces staged breakup. Either opens the gate with no fixed survival timer. Optional guns offer safety at a time cost.

Combine known roles in authored pairs: shieldship+interceptor, then frigate+moving cover. Never combine mandatory gravity, fast rock and full-width fan. The capital alternates aimed racks with formation command and readable recovery. No invisible last-second phase. Accepted shutdown clears threats before 6 s ending flight. End the campaign instead of silently inflating HP and looping.

**Decision:** broad engine disable, hull pressure or cautious disarm. **Target130–180s; intensity0.30→0.70→0.20→0.90→0.**

Combined target: approximately 10–14 active minutes, plus optional exploration/pauses. These are pacing goals, not forced waits. Distinct verbs are interdict, sever, traverse, outmanoeuvre, dismantle and break command.

### 4. Authoring, physics, difficulty and phone metrics

Future encounter data contains ID, authored distance, prerequisites, actors, completion, relief and checkpoint. Required actors hold in view; optional escaped interceptors affect score only. No unlimited replacement spawns. Seed variation changes entry sides/cosmetics while preserving the critical path. Keep collision, progression and rendering separate.

| Proposed mode | Hull | Ordinary enemy HP multiplier | Hostile speed ceiling | Basic muzzle tell | Hostile shot cap | Ships / charging sources / physical hazards |
|---|---:|---:|---:|---:|---:|---|
| Easy |6|1.00|175 u/s|1.30 s|22|4 /1 /2|
| Medium |5|1.15|210 u/s|1.15 s|32|6 /2 /3|
| Hard |4|1.30|240 u/s|1.00 s|42|8 /2 /4|

Chapter-specific HP already includes mode scaling; do not multiply twice. Early beats stay below caps. Hard adds a learned role or shorter recovery, not hidden fire, smaller controls or removed ordinary damage. These differ from the lab and need new calibration.

Use fixed steps and relative sweeps for fast rounds, moving guns, rocks and terrain. One round contacting compound parts earns one episode. A component/shared-hull hit may update both pools but earns energy once for configured shared damage, never their sum. Disabled metal is physical only where visible; opened parts use moved shapes. Render and collision share pose/UV metadata. Gravity changes actual velocity, which drives projectile rotation. Trails never collide.

Warnings lock aim at their real moving ports. Prove a reachable safe interval across the entire volley for the full ship footprint; stagger or abort otherwise. Active-real clocks advance together; pause/chooser/background freeze them. Stasis changes declared translation, not warning/spawn timing. Final accepted objective damage wins before same-step fatal incoming damage.

Keep current **52/40/74/196u player/scout/gunship/guardian widths** on 360 u; beetle/frigate/crescent use corresponding 40/74/196 u. Historical 65/49/88/236 source suggestions are not the baseline. Player 52×46.8 u keeps its visible 7 u hostile-shot core. Terrain uses a forgiving actual hull outline, not transparent padding; notches stay empty.

At 393/412 CSS width,52 u is approximately 56.8/59.5 CSSpx. Allow a 68 u maximum future equipped footprint without requiring modules now. Mandatory openings are 112 u minimum with swept banking/edge/control proof. Keep at least 55% typical field calm; guardian art should occupy no more than roughly 36% combat height. Do not obscure the lower response lane with explosions.

Derive height from real HUD/insets/control geometry: target at least 580/640 u at 393×852/412×915, then measure. Test 59/34 CSS and 32/24 CSS safe insets, zero insets and native transient bars. Reactor target is at least 48 CSSpx. Entire opaque ship clears screen edges/reactor by 8 CSSpx, not only its core; central/right low flight remains possible.

At 180 u launch distance with radii 3.5+7,169.5 u travel takes approximately 0.97/0.81/0.71 s at proposed mode ceilings, plus warning. This stationary straight-line calculation is not dodge proof. Measure accelerated lateral response before accepting an 80 u correction; candidate 320 u/s requires about 0.35 s including acceleration. The current lab 480 u/s is unchanged by this proposal.

Runtime derivative targets: player 192×172 px, scout 128 px, gunship 224 px, frigate 256 px, crescent 512 px, capital/foundry 640 px maximum width; most rounds 96–128 px, background 512×1024 px. Preserve aspect, originals, alpha and normalised UVs. Target≤24 MiB decoded RGBA chapter textures,≤48 MiB during transition; not whole-process memory. A 412×915 DPR 2 surface already costs about 5.75 MiB before copies. Start DPR 2, immutable decoding and chapter-exclusive eviction; avoid bundling every full texture as base 64. Compressed goals:≤4 MiB chapter additions,≤18 MiB shared campaign pack, measured after quality review.

Cosmetic caps:6 wrecks,48 particles,2 large breakups. Reduce dead FX before live threat visibility. On physical mid-range Android target 60 fps; require sustained 30 fps, frame-time p 95<33 ms and no growing allocation over 10 minutes. Desktop/emulator success is not native performance proof.

### 5. Differentiated destruction and source requirements

The current common explosion does not implement these states. Deliver purpose-built layered sources; no rectangular photo quarters or one enlarged universal blast.

| Role | Movement/counter | Death physics and source parts to produce |
|---|---|---|
| Interceptor | Curved entry, committed dive, banked exit; no unseen fire | Actual inherited velocity,0.65 s damped corkscrew, roughly 100° bounded spin. Three unequal chips. Left/neutral/right banks plus 3 wreck pieces. |
| Missile frigate | Slow bank/hold; independently charged racks can be suppressed | Cancel unfired work; ammo cookoffs at 0/0.18/0.42 s during 1.2 s wreck. Open bay,3 rack layers, torn plate. No new damaging death missiles. |
| Shieldship | Rotates protected face; broad flank and 50% frontal fallback | Shield collapse, unequal halves separate over 0.9 s with distinct angular momentum. Collar,2 broken halves, exposed centre. |
| Crescent hunter | Reduced turning after drive loss, bounded missiles | Failed collar, controlled drift or 1 s unequal lobe breakup. Failed drives, damaged centre,2 lobe parts; notch stays empty. |
| Asteroid | Consistent drift/spin; destroy or bypass | Four irregular rock pieces inherit velocity plus bounded outward impulse, damp over 0.7 s. No ship explosion. |
| Foundry/capital | Group hover with real gun/engine capability loss | Local shutdown then 2.2 s staged breakup OR disabled drift. Damaged core,4 irregular hull sections, failed engines/guns. No opaque field-wide blast. |

State: alive→destroying→harmlessWreck→removed. Award score/loot/energy once; dead wrecks stop HP contact immediately. Capture actual velocity/angle once and integrate at fixed steps, with renderer read-only. Destroyed gun warnings cancel; launched shots survive ordinary death. Mission success clears harmful work before its cinematic.

**All routine fragments, cookoffs and collapses are harmless.** First slice has no collidable death debris. Any later falling slab is a separate authored hazard: visible body/sweep,1.2 s tell, radius≥12 u, max one, life 2.5 s; never inside the player/control or across the sole route. Its collision is not inherited accidentally from a dead sprite. Pause freezes wreck lifetimes.

### 6. Exact asset checklist

Reuse actual sources: **art/starflight/ships-source-v1.png**, **background-source-v1.png**, **weapons-source.png**; **art/starflight-v2/enemy-family-source-v1.png**; **art/starflight-arsenal/source.png**. Their matching runtime manifests hold real pivots/alpha/hardpoints. Existing ships/rocks/fields/rounds support blockout; a tint is not a new encounter or disabled capability.

Proposed new source/runtime roots: **art/starflight-campaign/chNN/** and **assets/starflight-campaign/chNN/**. Preserve originals/prompts/extraction/hashes; empty runtime metadata, real alpha, glow padding, measured collisions/ports/masks and native motion proofs. Produce only an accepted slice's requirements.

| Chapter | Reuse | New family checklist |
|---|---|---|
|1 Breakwater|Player, scout/beetle, gunship/frigate, shots/exhaust; existing nebula for blockout|interceptor-bank-L/N/R + wreck-0..2 (6); frigate-open-bay/rack-0..2/torn-plate (5); rack-disabled-L/R (2); quiet wreck-L/R (2); background/edge-tile (2). No tender, crew or module family.|
|2 Relay Drift|Gunship/frigate/crescent materials and rounds|relay-hull/emitter/emitter-disabled (3); signal-link-active/off (2 FX); shieldship-hull/collar/broken-L/R/exposed-centre (5); pylon-L/R (2); background/edge-tile (2). Rail insert only if admitted hardware changes.|
|3 Glassbelt|Rocks, interceptor/gunship and shared FX|tug-hull/reel/reel-broken/cable (4); rock-fragment-0..3 (4); gate-rock-intact/broken (2); route-L/R tiles (2); background (1). Deferred optional capsule/open/pilot (3) is separate and grants no required unlock.|
|4 Fold Sea|Gravity/wormhole and crescent|failed-drive-L/R/damaged-centre/wreck-L/R (5); shelter-L/R landmarks (2); background/edge-tile (2). No research crew or stabiliser reward.|
|5 Foundry Crown|Boss/crescent for blockout; gun/engine material and shared FX|base/bank-L/R/bank-broken-L/R/reactor-external/reactor-disabled/rear-mask (8); wreck-0..3/failed-engine/failed-gun-L/R (7); trench-L/R/background (3). Exterior-access proof before final hull.|
|6 Dawn Corridor|Shared enemies/FX; convoy background reuse only after view/scale check|capital-hull/engine-L/R/disabled-hull/wreck-0..3 (8); command-core-intact/disabled (2); gate-L/R/open-rear-mask (3); background/edge-tile/safe-harbour (3). No sixth module or mandatory rescue launch.|

Shared: one Veyr crest, three ordinary-loadout icons derived from weapon art, component-disabled glows. Reuse seven arsenal icons, Lilita One/Rubik and coherent house audio. New cues: gun-disable, armour-fold, frigate-cookoff, gate-open, command-shutdown; three adaptive music layers. No mandatory portrait roster is needed. Disabled hardware requires a readable real state, not a glow over an unchanged intact gun.

### 7. Persistence and ordered implementation

Separate proposed save namespace: **starflight.campaign.v1**. Store unlocked chapter/checkpoint, completion by difficulty, available/selected preset, preferences and optional mastery records. No rescue inventory or attachment tree. Do not remap breaker stars or turn lab endurance score into campaign completion. Rail unlock is idempotent; repeat clears award no stats/currency. Optional future rescue flags are separate story records.

Success latches before incoming same-step loss and clears damaging work. Continue restores the safe checkpoint with chapter-entry hull, zero reactor, cleared volley and 3 s warning grace, retaining saved progression/preset access. Components restore the checkpoint's coherent snapshot, not mixed dead guns/resurrected hull. Retry reconstructs chapter entry, clearing temporary powers/charge/score/held input, retaining preferences/unlocks. Version and atomically validate saves. Reload cannot duplicate score or make removed guns fire. No required payment.

#### First complete slice: combat before expansion

1. **Metrics/contracts:** actual phone fields, opaque edge/reactor clearance, hardpoints, cadence and deterministic traces. Preserve lab. Future modules: campaign director, ordinary loadouts, chapter 1 data, campaign save; no new engine.
2. **Chapter1 blockout:** curved interceptor, cross-entry, side gunship, quiet pocket and disarmable frigate. Prove broad Needle damage and meaningful rack suppression. No rescue/docking/module/escort system.
3. **Weapon comparison:** Needle/Fan on the same seed; earned Lance/Drones/Nova as contrasting choices; state/budget/input checks for all seven. Log damage, misses, hull loss, target choices and failure; do not fit only a bot.
4. **Asset order:** small runtime derivatives/anchors → interceptor bank/wreck family → real frigate open/disabled racks/recoil/cookoff → quiet wreck landmarks → Breakwater background and five shared sounds. No attachment/crew budget yet.
5. **Full first-slice pass:** entry→charge→fire→hit→rack disabled→changed attack→distinct death→quiet exit; fixed wreck life, harmless debris and coherent Continue/Retry. Two phones/three modes with real touch, pause, background and arsenal. Review human feel before chapter 2.
6. **Chapter2 then3:** formation dependencies/nonzero shield fallback, then divergent terrain routes. Rail comes from one mission milestone; rescue remains optional/deferred.
7. **Chapter4 then5 then6:** gravity/hunter positioning, real bank/core topology, capital capability changes/alternate ending. Each adds a different combat question with recovery, not a recoloured schedule.
8. **Optimise/package deliberately:** chapter stream/cache/evict, physical Android profile, explicit offline entry/font/asset pin and native CI. Current APKs do not acquire campaign content from this plan.

#### Acceptance gates

- **Simulation:** ordinary-only route through every objective; actual moving sweeps/apertures; component/shared damage credited once; no notch filler; pause all clocks; no catch-up attack; final-hit priority; dead warning cancellation and correct live-shot lifetime.
- **Weapons/economy:** Needle always viable, Fan/Rail tradeoffs; correct cadence/ports/pierce, one reactor choice, no powered refill/overflow or permanent damage growth; fresh Retry/coherent Continue; no duplicate milestone/score.
- **Earned routes:** both phone heights/all modes, ordinary input route plus earned-power route, exact seeds/actions/hashes; disclose natural pickups/assists/staging and preserve losses. Measure threat removal, dodge space and relief, not only the result screen.
- **Input/art:** real relative touch, seven choices, pointer/key cancellation/repeat suppression, portrait/resize/background, safe-area variants, opaque edge/control clearance, full decode/fonts and zero errors. No shot hidden by glow/terrain, detached muzzle or rectangular breakup stamp.
- **Destruction:** inherited role motion/lifetimes, harmless routine wrecks, no damage/charge farming, bounded FX; attached guns/engines until deliberate separation. Actual native motion for every role, not only enlarged stills.
- **Human/performance:** physical Android response/heat/memory session; understandable Easy, recoverable Medium, counterable Hard. Ask what changed when a gun died and why a weapon was chosen. Observe voluntary replay without claiming proven addiction; automated wins do not certify balance.

This revision supersedes the mandatory rescue/attachment scheme. Next is **one complete combat slice with weapon tradeoffs, disarmable opposition and satisfying differentiated destruction**. All future campaign work remains proposed until its own implementation/review receipts exist.


---

# Part N: Space combat implementation details

*Source: `docs/SPACE_COMBAT_HANDOFF.md`*

## Space combat — implementation handoff

Updated 2026-10-20. Branch `codex/space-combat-apk`. This document supersedes the old 4188/4189 approval gates for the selected cannon and Circuit companion work. The owner approved BOTH heavy/salvo patterns, distinct colours, left/right/paired/rest attacks, Vesper/Latch, stronger friendly fire, a redesigned power menu, difficulty tuning and an APK/CI push. Nova/Pin and the reserved Escort/Switch encounters are deferred. The later Frost Warden request is authorized and tracked separately in `docs/BRUM_LEVEL_PLAN.md`.

Release completion: CI [39399653237](https://github.com/mahikshith/breaker/actions/runs/39399653237) passes both web and native jobs on `f2c5b78`. The APK is downloaded and checksum/payload/font/license/compiled-manifest verified: 9,596,473 bytes, SHA256 `B44BC99FE10468DEF35E89F32B85900F8AAD3C16BB92C6C1040A04D850E7BA8E`. Frozen game hashes remain B06CDD canonical / 4071ACEE offline. Native Android 15 touch, pause/resume, all five chapters, safe fullscreen and recreation pass, with actual screenshots reviewed. `docs/MOBILE_PREVIEW.md` links the artifact and records the immediate recreated-Nix still limitation. These are emulator/browser release checks, not physical-device or human-balance approval.


### Resume map

- Start with `docs/CONTINUE_HERE.md` for release state and open work.
- Exact tested bundle and package hashes: `config/mobile-preview.json`, generated `dist/mobile-preview.json`, and the successful CI artifact manifest.
- Install/build/native evidence: `docs/MOBILE_PREVIEW.md`.
- Future encounters: `docs/NEXT_LEVELS.md`, explicitly proposals/deferred concepts.
- Immutable art catalogue: `artwork-library/manifest.json`, `CATALOGUE.md`, `SPACE_BOARDS.md`; working/source locations: `docs/ARTWORK_LIBRARY.md`.
- Current playable browser: `http://127.0.0.1:4192/breach.html` while the local server is running. Query levels 1/2/3/4/5 mean Carrier/Vault/Circuit/Forge/Frost Warden; menu displays the three space levels before the two castle levels. Difficulty query accepts easy/medium/hard.

### Stable storage and transitions

`src/main.js` keeps storage indices Carrier 0, Vault 1, Circuit 2, Forge 3 and appends Frost Warden 4. Legacy best records map only to old Carrier Easy / Vault Hard slots; new slots start empty without erasing old results. Menu order is separate from storage: `[0,2,3,1,4]`; extend this explicit order when appending another chapter. Space Next follows 0→2→3 and castle Next follows 1→4. Pause has Resume/Retry/Menu; Retry reconstructs the same level and mode, clears held input, resets attempt clocks/Continue and preserves saved progress. Resize restarts only when play geometry changes; app resume stays paused until the real Resume action.

### Shared weapon contract

`src/space-weapons.js` draws the actual approved compact plasma and connected impact rasters. `tools/pack_art.py` packs `design/phase1/weapon-vfx-v3/plasma-shot-runtime.png` and `plasma-impact-runtime.png` losslessly into `ART.spaceWeapons`. Carrier is magenta; Circuit violet; Forge orange; friendly fire cyan. Colour variants preserve the same rendered material and highlight.

Heavy is one radius 9 round. Salvo is three radius 7.5 rounds spaced 0.14 seconds. A volley chooses left, right, both or quiet. Two-gun batteries stagger by 0.85 seconds and have separately locked warnings; repeated quiet or paired choices are bounded. Easy/Medium/Hard heavy speed is 440/520/600 u/s; salvo adds 40 u/s. Warnings are 1.35/1.20/1.10s; recovery is 3.8/3.1/2.5s. Current paddle width must leave a safe lane; otherwise the battery rests. Bloom/wake do not enlarge damage. Canonical geometry and timings live in `nextEnemyVolley` and `enemyEscapeLane`, not this prose.

Enemy shots are rendered above the field and never break, push, damage, stop against or award rewards from bricks. Player ball, Cosmic and friendly shots retain productive brick/ship damage. Swept collision resolves actual moving player contact; source destruction cancels unfired rounds but does not erase already launched fire. Terminal states, Retry and Continue clear the appropriate attack state. Friendly shared rounds use radius 6.8 and the approved 37 u sprite footprint; Kit keeps arrows and canonical Cosmic graphics.

### Power economy

`src/difficulty.js` is authoritative. Space charge needs productive ordinary contact credits AND active combat refill time: 24/30/36 on Easy/Medium/Hard. Shots, skiff pulses and active Cosmic cannot refill themselves. A full meter does not bank overflow for an instant next cast. The chooser freezes gameplay and all threat clocks; cancel preserves charge. A saturated choice remains disabled without spending.

| Space mode | Minimum active refill | Cast duration | Maximum remaining duration | Live balls | Cosmic balls |
|---|---:|---:|---:|---:|---:|
| Easy |24s|8s|12s|7|1|
| Medium |30s|7s|10s|6|1|
| Hard |36s|6s|8s|5|1|

Ball Fan adds four ordinary balls up to the cap, making five from a lone ball. Existing survivors are never deleted. Repeated positive pickups extend within their cap; WIDE stacks width and duration but stays inside the field. Kit's prior separate limits remain 12/9/5 balls, 2/2/1 Cosmic, 20/18/14 seconds. Carrier stores its difficulty object while the other levels store an id; `Arena.companionLimits` explicitly handles both so Carrier no longer silently falls back to Medium.

### Carrier Breakout

Sources: `src/carrier.js`, `src/carrier-physics.js`, A parts in `design/phase1/space-assets-ab.json`, `assets/space-a/` and shared capsules. Nix/Tick remain selected. Rescue five crew per manifest; Medium/Hard have two finite manifests with a 75-second active wave clock. Hull defeat stops its threats; cleanup/rescue and final retreat retain their existing states. Player hits on housings/fighters interrupt boarding.

Hostile panel destruction was previously part of the raider's approach. That dependency is removed: a boarder takes an aerial route over panels to a reachable housing; another intact housing remains an obstruction. No repeated brick-breach shot can stall the raid. First squad is 20/16/12 s, extraction 14/11/9 s, recovery 6/4/3 s by mode. Carrier hull is 45/60/78 HP; housing locks 5/6/7 HP. These give an opening response interval, then real capture pressure. Read the route/tractor helpers before changing cover: `coverTargets` is still needed for non-projectile crew logic.

### Circuit Breakout

Source: `src/relay.js`; physical skiff renderer `src/skiff.js`; measured source `assets/relay-circuit/manifest.json`, B assembly and preserved runtime texture packs. Vesper is the face control; Latch is the visible one-cannon jammer. A successful selected power also jams one live cannon for 6 active seconds, cancels its pending shots, and leaves in-flight shots intact. It adds no extra meter.

Ordinary ship metal hits reduce hull; no ordered symbol puzzle or mandatory precise open-window sequence remains. Hull is 72/96/120 HP. Half health grants one physical skiff deployment. Its 12 alternating shots use real muzzle anchors, radius 6.8, speed 560 u/s and 0.38-second cadence. Armour pivots, cannons recoil, ball is safely stowed; return follows last projectile resolution with bounded 1.35 s fallback and a real caught serve. Existing time cap remains 10/9/8 s; the small burst strip displays the lower of ammo/time remaining. Do not duplicate or erase survivors during morph/return.

Physical port leaves now travel 24 u so radius 9 heavy ordnance actually clears the opening. Art/collision/velocity move together. Heavy/salvo player contact costs one life with a 3-second fresh-serve grace; a craft hit ends the burst safely. Circuit centre is a closed mechanical exit iris, not suction. The decorative rotating portal stays quiet during combat and the hatch opens at defeat/departure.

### Shutter Forge

Source: `src/orbital.js`, `assets/orbital-forge/manifest.json` and preserved runtime textures. Use a neutral ship arsenal control; Nova/Pin have not been selected. Broad hull and closed machinery damage remain productive; open windows give bonuses rather than being the only legal hits. 40 equal-sized slots include 38 colour panels and 2 breakable grey panels. Three stabilisers collapse before the external reactor finish; hull defeat also disables them. The lower hull lip remains solid and the reactor projects outside it; never invent an invisible hole through source metal.

Easy/Medium/Hard stabiliser HP 18/22/26; hull 54/66/78; open windows 10/9/7.5 s; gun HP 6/7/8; reactor 12/15/18. First teaching window stays harmless; stronger warned random batteries follow. Once-only ordinary ball reward and finite phase transitions remain. All shot colours/impacts now use the approved family.

### Presentation and touch

Full portrait canvas retains safe insets and dark planets/backgrounds. Bottom paddle remains 126 CSS pixels from the world bottom to reserve ball/gesture room and a 52 CSS companion control; no repeated drag/catch instructions or dark control slab. Top HUD holds pause, lives, aim and compact score. The chooser must keep 44 CSS minimum targets and house fonts, visibly distinguish disabled/capped choices and never leak its touch release into ball launch. Check iPhone 393×852 with 59/34 insets and Android 412×915 with 32/24 insets.

Vesper/Latch original generated sheets, prompts, normalization, alpha padding, hashes and runtime manifests are preserved under `art/space/circuit-companions/` and `assets/circuit-companions/`. They are raster expression/motion families, not claims of finished rigged 3D models. Enemy/player rasters, studies and rejected history stay versioned; do not overwrite original references.

### Verification and honest limits

Unit tests cover shared caps, enemy field invariance, actual paddle hit/dodge, port clearance, current-width escape, raid approach, projectile cleanup, paused clocks, jam, skiff ammo and safe return. `tools/playtest/combat.mjs` tests real Main/CDP touch across 18 space/mode/phone cases; charge is deliberately staged for modal/power lifecycle tests. `tools/playtest/frost.mjs` covers the six Warden mode/phone combinations, measured strikes and castle powers. `tools/playtest/layout.mjs` checks all five levels. `polish.mjs` retains Vault/Carrier regression coverage and fails on page errors.

`tools/playtest/combat-balance.mjs` is a bounded deterministic public-input assist, reading balls and visible bolts without target solver/HP/life/charge writes or Continue. It is not human difficulty or physical-phone performance. Preserve failed runs as well as successful routes. Current reruns show reachable Circuit Easy/Medium wins with earned powers and losses on Hard; Forge has earned powered wins. Carrier needs targeted rescue decisions and has both wins and losses in bounded policies. Exact final receipts and CI status belong in the release document.

Before another release: inspect actual phone captures, run current units/build/phone suites, record LF-canonical bundle hash, package offline fonts, run source and packaged browser checks, then native compilation/lint/emulator lifecycle. Download the passed APK, verify its zip payload/hash against the manifest, and only then claim delivery. No main merge or store publication is included.


---

# Part O: Frost Warden encounter and physics

*Source: `docs/BRUM_LEVEL_PLAN.md`*

## Frost Warden: a separate princess siege

Current status: gameplay and packed browser verification, including the final menu-thumbnail crop, are complete and frozen, authorized by the owner's explicit delegation to choose and build the new level. This replaces the earlier proposal-only hold. `src/frost.js` is the independent Arena level at stable menu/save slot 4. Commit and APK delivery remain separate milestones. No current native delivery claim is made here.

### Identity and objective

Brum is still the friendly Yeti porter from the earlier proof. The Frost Warden is a distinct hostile frost guardian using the retained source Yeti anatomy and rig. Its new frost-blue/slate palette, hostile expressions and attack clips belong to a separate atlas. Neither Brum's source proof nor his ally role is overwritten.

Lumi shelters on the right of a cold castle chamber. The Warden approaches from the left, attacking three dedicated defensive posts in sequence. The player defeats the Warden through broad ordinary ball impacts before the last defence collapses. Player score bricks provide angles and optional powers; the Warden never destroys them. There is no required symbol order, narrow weak-point gate, purchase, power capsule or companion activation.

The unselected alternative, Brum carrying Lumi over a collapsing bridge, stays historical planning only. It is not implemented alongside this encounter.

### Authored geometry

All values are in the existing 360-unit portrait world. Both phone sizes share the map; Arena retains the 126 CSS-pixel lower reservation, 52 CSS-pixel Kit control and safe-area integration.

| Element | Geometry / ownership |
| --- | --- |
| Coloured score bricks | 36 equal 36×18 rectangles; columns x=54,96,138,180,222,264; rows y=266,292,318,344,370,396. All 1 HP. Lowest solid edge y=414. |
| Clear return routes | Left gap 42 units and right gap 48 units, wider than a 20-unit cosmic ball plus margin. Flank shots and wall banks reach the Warden. |
| Dedicated defence posts | x=148,192,236; y=146; width 18, height 68. Entire post remains physical while HP>0; visible cracks/pips show lost strength. At zero it crumbles and its collider disappears. |
| Warden | Actual rendered atlas at scale 1.2. Broad torso rectangle and attacking hand circle are measured from projected source geometry. Compound pieces share one contact ID to prevent overlap double damage. |
| Stances | Derived from each post and the measured maximum fist reach, rather than independently stretching an arm. The same raster transform places the measured body and hand. |
| Lumi | Foot anchor (299,202), existing expressive princess atlas. Non-damageable friendly figure, separate from the Warden. |
| Chamber ledge | Explicit physical rectangle x268,y202,w60,h12, drawn behind Lumi. |
| Back-wall promenade | Low-contrast perspective scenery: rear edge under the post bases (y=214), front edge/shadow at the real Warden foot baseline derived from the strike anchors. Balls cross in the foreground; this is not an invisible full-width collision slab. |
| Paddle | 100×14; shared ball radius 6, existing speed 345 and rally maximum 1.28. No speed change. |

The lower brick edge gives about 200 units of return space on the iPhone layout, approximately 0.58 seconds for a straight normal downward ball and 0.45 at the rally speed cap; Android is taller. These are vertical travel calculations, not human reaction or real-device measurements.

Six fixed optional caches are WIDE, SHIELD, SPLIT, SLOW, FIRE and LASER. The small pale diamond marks a cache; it is not a different required brick dimension. Existing effects and collection rules apply. Enemy post damage gives no score, combo, charge, drops or farming rewards.

### Arm physics and state machine

`idle → windup → strike → recover` repeats while a post stands. Destruction leads to `advance` along the upper path to the next post. Sufficient normal contact during windup gives `stun → idle`. A broad body or hand contact always lowers Warden HP, including outside the interruption window. Shots deal 1 damage; cosmic contacts deal 3. Ordinary productive contacts bank Kit credit; arrows and active cosmic contacts do not.

The visible arm follows actual source-rig frames. The atlas publishes a projected hand circle and torso bounds per frame, in world units relative to the feet pivot. Each fixed update sweeps the previous hand centre to the next centre with the measured radius against only the active defence rectangle. Contact damages that post once per strike. It is not a timed deletion, nearest-brick search, whole-wall removal or damage to player score bricks. The player ball uses the existing substepped circle solver against torso, hand, posts and coloured bricks; a stable actor ID deduplicates a continuous overlap episode.

Clip timing is separate from attack cooldown: windup holds readable preparation, then plays the backswing over the last 0.55 seconds. The real four-pose strike occupies the mode's short strike interval. The arm visibly retracts over 0.55 seconds, then loops actual idle breathing for the rest of recovery. Hurt reacts over 0.5 seconds before holding a stagger. The four rendered recovery poses are not spread into multi-second frozen extended fists.

Post metal is unpierceable for player FIRE/cosmic balls and absorbs friendly arrows without damage. This makes its protective purpose explicit; breaking player bricks and hitting the exposed Warden remain productive routes. The Warden hand is a local character attack with one dedicated friendly barrier target, separate from the new space-projectile brick-immunity rule.

First launch starts the siege clock. There is no opening attack while aiming the initial serve. The initial serve auto-launches after 8 active seconds; later fresh serves after 3. Warden warnings, movement and recovery use active real time, including Focus/SLOW and hit-stop. Moving actor velocities are converted into the ball's slowed physics clock. Pause, background suspension and the power chooser freeze the complete encounter through existing Main gating and the level's modal early return.

### Current initial mode values

These are implementation starting values, not a human-validated difficulty guarantee. The initial Easy pacing target was roughly 100–180 seconds without compulsory paid or precision powers; earned playtests record the actual result and natural combo variance.

| Value | Easy | Medium | Hard |
| --- | ---: | ---: | ---: |
| Warden HP | 40 | 52 | 66 |
| HP per defence post | 5 | 4 | 4 |
| First attack delay after launch | 7s | 5.5s | 4.5s |
| Windup | 1.8s | 1.5s | 1.25s |
| Strike | .48s | .42s | .36s |
| Recovery | 3.5s | 2.8s | 2.3s |
| Normal windup contacts to stagger | 1 | 2 | 2 |
| Stagger duration | 2.1s | 1.6s | 1.25s |
| Advance to next post | 1.35s | 1.15s | 1s |
| Earned Kit refill minimum | 18s | 22s | 26s |

Kit uses the existing four-choice Shield / Arrows / Cosmic / Fan menu. Actual productive contacts first bank credit; it fills at no more than one contact credit per active second. Spending clears unused bank overflow. No passive free energy or fast multiball self-refill is added. Existing castle power caps apply.

A full-charge Shield is usable during a real windup/strike before contact. It wards the threatened post for one actual punch, expiring after 10 active seconds if unused. A stagger preserves the earned ward until another actual contact or expiry. It spends once, does not repair posts and does not grant broad immunity. The real existing spinning Kit shield and armour art show cast/held state; no connecting beam is introduced.

### Outcomes and lifecycle

Warden HP 0 immediately latches `rescue`, parks all combat and clears arrows before any late drain or fist contact can defeat an earned win. Lumi cheers; the defeated Warden uses its actual hurt pose. After 1.6 seconds the level reports won. No overlapping new grab/eating animation is invented.

The last post's destruction latches a .95-second `breach` beat: the destroyed post is visible, Lumi reacts, and then loss reports “Chamber breached”. All gameplay mutation stops during results. Out-of-balls remains the other loss condition.

Continue preserves Warden HP, cleared score bricks, score and surviving post damage. If the final post had collapsed it restores only that failed post to at most 2 HP, gives the existing fresh serve/two ball shields, and adds an explicit recovery/grace so it cannot instantly refail. It does not reset player-earned progress or pretend that the encounter was won. Retry constructs a fresh same-mode level through shared Main. Stale pointer/key release cannot launch during terminal intermission.

### Art and integration contract

`ART.frostWarden` is a separate actual rendered family: `{url,cell:[256,228],columns:7,rows:4,unit:[144,128],pivot:[.5,.90625],clips,anchors}`. There are 28 real rig frames, four per idle/walk/windup/strike/recover/hurt/victory clip. Clips accept numeric global frame indices or start/n metadata. Anchors contain measured fist/body data relative to the foot pivot, with projected shoulder/elbow/wrist and both hands retained for audit. The figure faces right at source yaw 65°. No generic circle/box is drawn in place of missing character art; final admission requires that atlas to decode.

Existing castle plate, princess and Kit remain canonical. The Warden family producer owns new source files and normalization; root owns packing and fifth-card integration. This level owns no shared Main, Arena, renderer, packer, prior level or native file.

### Verification requirements and current status

All 15 focused tests in `tests/frost.test.js` pass. They cover initial non-attacking serve, equal map/radius clearances, high-speed broad contact and reentry, sweep/post-only damage, one-contact powered overlap, normal interruption, earned-credit/modal freeze, one-spend ward, physical protected posts, final-hit precedence, terminal freeze, Continue preservation and finite princess source rectangles. Two tests consume the final actual rig manifest: all 18 mode/phone/post combinations land exactly one punch on the correct post with no player-brick reward mutation, and a real 1200u/s incoming ordinary ball staggers before the warning deadline while a later hit remains productive without cancelling the strike. Earlier deterministic projection fixtures remain labelled as fixtures.

The maintained phone runner is `tools/playtest/frost.mjs`, owned by the independent reviewer. All six actual Main cases at 393×852 and 412×915 across Easy/Medium/Hard pass: initial decoded five-card menu, genuine CDP touch aim/drag, Kit's four choices and one-spend Ward, chooser freeze, swipe/cancel, pause, background-handler fixture, fresh same-mode Retry without browser reload/star loss, actual Continue preserving progress, and 18 measured live post/stance cases. There are zero page errors. Those power/phase/loss fixtures are explicitly staged; they are not earned victories or native OS suspension tests. Receipt: `out/frost-phones-final/report.json`.

Source freeze: `src/frost.js` SHA256 `9200DE93113D72A5C692D4F9270F4E3BEC6A5170C7746CDE2761305BD29EFB8D`; `tests/frost.test.js` `B622F3092A5FC7CDAEDBF6BE3A86000D4C16EE3FA2F1480E8FEBCAA0C6D6B813`. The previous source `8C21D183…A318D202` differs only in `previewRect`: the final crop is `{x:20,y:138,w:320,h:100}`, so the compact fifth card shows the Warden/Lumi/posts rather than sky. No gameplay, pacing, contact, art or power rule changed. Final actual family manifest is `F6114EEBCEB42D65547D5EEA78645916E603468941D1240696FA6EF9B2C2AD0E` (read the canonical file for full provenance and rig anchors).

A bounded public-input Node assist using those actual rig anchors cleared Easy at 104.8s iPhone geometry and 77.9s Android geometry without manual Kit. Natural capsules were SLOW on iPhone and FIRE/SLOW/SPLIT on Android, so these are not strict no-power wins. Earned Kit runs cleared at 73.9/53.7s. These read-only simulations under ignored `out/frost-review/coarse.json` changed no HP, lives, charge or phase through fixtures. They establish a recoverable route for that controller, not human balance or browser performance. No pacing change was made to fit those receipts.

### Packed browser and animation receipt

The initial Main phone, earned-gameplay and motion receipts use frozen HTML SHA256 `E49DDC6838759A687067EED5A4375A7FCBF5B1210111BCD55FCA96C37FCD30F4` before the menu-only crop above. Both start/end hashes match. The earlier four levels and their stable slots remain intact.

The final canonical HTML is `B06CDD969BCF5C420A74B3CF37A3EAC45FE3D46EABB2926F5E5D2B8A42E01770`. All six Frost cases were repeated on that exact build and passed with matching before/after hashes and zero page errors. Canonical receipt: `out/frost-phones-canonical/report.json`, SHA256 `0DA34BF33BDCBB3676323DBF6057DB25AD62481532E0E331710F871F6C37B44C`. Actual final review inspected the corrected first menu, pre-contact Ward armour, and settled three-star staged win. The fifth card now shows the real Warden/Lumi/post art rather than sky; armour is visible before the protected punch. Root additionally reports six offline-packaged Frost cases and 18 offline space cases passing; these are browser checks of packaged payloads, not native Android instrumentation.

The independent public-input Easy browser controller won on both devices with all 3 lives and no Continue: iPhone 39.79s, Android 97.81s. iPhone earned Fan at 22.66s and naturally caught LASER/FIRE/SPLIT/SHIELD; Android earned Ward at 21.67s and Fan at 60.57/81.31s, naturally catching FIRE/SLOW/WIDE. These are power-assisted controller wins, not strict ordinary-only proof or human difficulty validation. There were no HP/life/charge/phase fixture writes in those runs. The successful combo variance is retained; no artificial wait or HP inflation was added. Receipt: `out/frost-earned/final/report.json`.

Actual image review covered both `out/frost-phones-final/{ios,android}-01-opening.png`, all six `07-stance1/2/3-contact-staged.png` images, selected recovery stills, Ward result, rescue, breach/loss, and continued state. Feet/shadow and promenade agree; the fist remains attached and hits the intended post; all three approaches preserve Lumi's face/crown and separation. The pale ball, lower paddle and 52px Kit control stay legible and unobstructed. The background walkway is visibly in a separate depth layer and creates no hidden blocker. Continue visibly restores the last failed post and fresh serve while preserving earlier damage.

`out/frost-review/frost-punch.gif` is a 2.14-second actual Main Easy first-post motion witness, with 32 native cropped frames at 15fps. `out/frost-review/motion.json` records each stage, real atlas frame, fist position, post HP and matching HTML hashes. It shows late warning/backswing → actual measured punch contact → brisk retraction → idle recovery. An independent art review inspected the packed frames and found no atlas clipping, disconnected fist, floating feet or art substitution. This is a staged animation witness, not an earned run.

The earlier earned final screenshots were captured during star reveal; the explicitly staged canonical win screenshot shows all three settled stars. It does not pretend to be a new earned run. Human phone feel, sustained real-device performance and native APK delivery are still outside these browser receipts. The remaining frozen terminal capsules are cosmetic; this release retains that behavior. No new capture/grab animation is claimed.


---

# Part P: Next encounters and physics proposals

*Source: `docs/NEXT_LEVELS.md`*

## Next levels: reserved space ideas and a new princess encounter

Mooncoil Reliquary is now implemented as a sixth browser chapter (stable index5). It reuses the serpent with a violet skin, three broad seal banks, physical counterweights and a different Kit loadout. See [Mooncoil](MOONCOIL_RELIQUARY.md). Earlier five-chapter/APK references below describe historical checkpoints.

### 2026-10-20: direct-flight continuation

The owner has now authorized a fast scrolling starship combat prototype, then requested a proper campaign plan first. [Starflight: Last Light](STARFLIGHT_PROTOTYPE.md) is implemented separately at `prototypes/starflight/`: direct movement, automatic twin fire, seven earned reactor choices, varied ship families, asteroids/gravity and escalating repeat cycles. Its current story framing follows the freed crew's evacuation through Carrier Reach, Relay Drift and Forge Belt. It is not included in the pinned five-chapter APK. [The campaign production plan](STARFLIGHT_CAMPAIGN.md) now governs future combat-first authored chapters; those are not implemented by the combat loop.

The earlier proposals below remain reserved. Starflight does not claim to implement Relay Escort B or Orbital Switch B. Their breaker controls and ball rules apply to those future breaker encounters; Starflight uses the new direct-flight contract documented in [STARFLIGHT_COMBAT.md](STARFLIGHT_COMBAT.md).

The next implementation is the plan's first complete combat slice: authored attack roles, useful weapon tradeoffs, destructible enemy capabilities and differentiated wreck motion. Rescue is an occasional optional objective, not a required chapter-to-upgrade formula. The revised combat lab has more silhouettes and a bounded power budget, but needs human difficulty feedback. A complete campaign also needs checkpoint/save behavior and a deliberate Android packaging pass.

Updated 2026-10-19. This document separates the current five-level runtime from future proposals. Values labelled provisional are starting points, not balance results. The owner delegates design decisions and authorizes implementation/commit/push. The **Brum/Yeti-related Frost Warden princess encounter is integrated at stable slot4**, with complete dedicated rendered art, strong-arm physical defence destruction and separate Easy/Medium/Hard behavior. Local phone-size checks are described below; CI and APK delivery status belong to [MOBILE_PREVIEW.md](MOBILE_PREVIEW.md). Earlier crab/bat/boar adversary ideas remain deferred alternatives.

### 1. What exists, and what remains a proposal

The source tree and the exact release receipt are the authority for the current build. A design board, isolated preview, old APK and the latest working source can describe different checkpoints. Do not use an old screenshot or a scripted win to certify a later build.

| Track | Current source direction | Boundary |
|---|---|---|
| Carrier Breakout | Rescue captive workers, interrupt boarding raids, broad mothership damage, distinct Nix/Tick roles | Hybrid waves, encounter pressure and the latest heavy/salvo weapons require their current integrated receipts; old APKs do not acquire these changes |
| The Vault | Kit and Lumi; serpent enters from a tunnel, follows actual brick routes, reacts to ball hits and warns a venom shortcut | Existing serpent encounter. The new adversary below is a separate authored level, not a serpent reskin |
| Circuit Breakout | Broad relay-ship damage, optional stations/guns, once-earned physical paddle-to-skiff burst and an exit iris | Current revision gives it Vesper/Latch, stronger cyan skiff fire and distinct enemy weapons. The closed iris has **no suction**; it opens for departure |
| Shutter Forge | Productive closed machinery/hull damage, optional open bonus, collapse and an external reactor finish | Its reactor and machinery retain real exterior access; current companion/weapon presentation is tracked by its own release receipt |
| Relay Escort / Escort Run B | Prior direction retained for a later level | Reserved, unnumbered, unimplemented. Do not call it the current Circuit Level2 |
| Orbital Switch B | Prior direction retained for a later level | Reserved, unnumbered, unimplemented. Do not call it the current Forge Level3 |
| New princess encounter / Frost Warden | Brum/Yeti-related encounter in [BRUM_LEVEL_PLAN.md](BRUM_LEVEL_PLAN.md); `src/frost.js` and its complete28-frame dedicated Warden family | Integrated at stable internal index4. Six local phone/mode input/lifecycle cases and actual three-post contact fixtures pass; current CI/APK status is maintained in MOBILE_PREVIEW |

Main preserves storage indices Carrier0, Vault1, Circuit2 and Forge3, even though the menu displays the three space levels together before Vault. Frost Warden is appended at index4, preserving those old save identities. A future level must append a new internal slot or introduce an explicit versioned migration; rearranging these indices would mix earned stars. This document introduces no unlock price.

Read these alongside this proposal:

- [Story and roadmap](STORY_PLAN.md): the larger Brickhaven/Menagerie story, not a guarantee that every chapter or hero is implemented.
- [Selected variety directions](../design/phase1/level-variety-review.md): CircuitA / ForgeA selected first; both B ideas retained for later.
- [Relay variety draft](../design/phase1/relay-gameplay-variety.md): original Escort route, full-size cargo and measured station-opening constraint.
- [Orbital variety draft](../design/phase1/orbital-gameplay-variety.md): original Switch field/tag/receiver proposal and the real closed lower hull lip.
- [Circuit history](../design/phase1/relay-circuit.md) and [Forge history](../design/phase1/orbital-forge.md): preserve prior receipts; later owner feedback supersedes their historical rules where explicitly recorded.
- [Brum proof](../design/phase1/04-brum-proof.md): selected character work has a bounded proof status, not a shipped dedicated campaign.
- [Brum level plan](BRUM_LEVEL_PLAN.md): the authoritative new princess-level proposal for the latest owner steering. It supersedes the deferred adversary recommendation in earlier brainstorming.

### 2. Rules shared by every future level

Keep one-finger aim/launch/relative paddle drag, full-screen portrait play, compact top score/lives/pause and the appropriate corner character face. Preserve the existing lower thumb/reaction reserve (approximately126CSSpx in the space layouts); extra Android height should improve reaction distance. New enemies, fragments and controls must not occupy that reserve. Use Lilita One and Rubik, subdued dark scenery, glossy authored foregrounds and restrained yellow accents.

Every level needs a different player question. Carrier asks whom to protect and whether to disable the raider. Circuit changes the player briefly into a weapons platform. Forge creates a structural collapse and a reactor finish. Escort should ask **when to send and defend a moving objective**. Switch should ask **which physical route to choose**. The next Brum level must give his strong arms real brick-contact and rescue consequences, rather than repeat a crawling pursuit and venom shortcut.

Keep ordinary-ball completion possible with earned free progress. Optional powers should broaden a route, shorten dangerous exposure or help recover a mistake; they must not be mandatory purchased keys. Difficulty should add an understandable threat or reduce a forgiving margin, with a complete normal route retained. No claim that Hard is fair follows from a single controller success or failure. No new monetization rule is approved here.

All proposed hazard warnings, recovery windows and moving-object clocks use active real seconds: Focus, SLOW and hit-stop do not silently extend a visible enemy warning. Main pause, background suspension and a paused choice overlay freeze them. Ball motion continues to use the existing fixed-step physics and its own time scale. A moving collider's velocity must be expressed in the same time domain as each sweep. Aim prediction and live motion must agree.

For same-tick terminal events, an accepted final legal player hit latches success before a last-life miss or a new enemy attack. One hazard cannot cause both a life loss and an unavoidable objective loss in the same unresolved episode. Clearing an objective cancels remaining harmful work; the result does not keep hidden timers running. Continue retains earned irreversible progress and resets only the failed transient episode. Retry is a fresh same-level/same-mode constructor, with no carried balls, held input, menu, charge, timer or Continue count; saved stars and preferences remain.

The owner's latest delegation authorizes current design decisions, implementation and commit/push without another permission round. Continue showing concrete native-size results and completing real checks; authorization is not a finished animation, physics admission or APK receipt. The deferred ideas here remain proposals rather than automatic instructions to build every future level.

### 3. Reserved space directions

#### 3.1 Relay Escort: prepare, cross, dock

**Status:** the earlier B direction is retained. Its original numbers and source-alpha audit are design evidence only. It has no assigned campaign number and no current runtime implementation. Reconfirm the latest visual and enemy-fire contract before building it; the source has since changed its cannon behavior and companion identity.

**Story purpose:** ferry an empty repair cargo carrying a disabled gate component between service docks. It is cargo, not another princess or five workers. The player remains the paddle and ball; it never replaces Circuit's combat skiff burst. No new pilot or compulsory companion is specified. If Vesper/Latch appear, their role must be newly reviewed rather than copied automatically from Circuit.

**Critical path:** `shielded dock → clear first real blockers → exposed vertical crossing → safe dock → prepare central crossing → open whole station lane → quiet iris arrival`.

The earlier draft deliberately retains the actual32×20.149u cargo silhouette throughout. Its centre path is `(100,405)→(100,311)→(181.363,320)→(181.363,202)→(181.363,160.995)`. Seven identified real blockers require thirteen ordinary contacts under that old draft's HP table. Two inner station assemblies translate outward to create a42u lane, leaving5u per side before any safety inflation. See the source draft for their exact positions and panel identities. These are starting geometry, not permission to restore an obsolete whole field or shrink the cargo until it fits.

**Proposed event/state contract:**

| State | Entry and visible behavior | Exit / collision rule |
|---|---|---|
| Docked/preparation | Cargo is inside a visibly closed shield dock; the next obstruction group is marked locally once | Remain safe until the full cargo sweep to the next dock is clear and a minimum rest has elapsed |
| Station opening | Only when required for the final leg, both complete inner assemblies visibly move on rails | Move raster, frame, shadow, interior and collider together; rails/end stops stay outside the declared cargo lane |
| Departure cue | A short0.6s provisional dock release and cargo nose light | No hazard launches during the cue; no second input button is required |
| Crossing | Cargo travels the authored path over approximately5active seconds per exposed leg | Cargo is a moving physical friendly bumper to balls, without damage/charge farming; enemy contact belongs to exactly one swept first-hit episode |
| Arrival/rest | Whole cargo body reaches the dock, then clamps visibly engage | Mark the checkpoint permanent; only then grant safety and the next preparation window |
| Final arrival | Fully opened iris and a quiet clear corridor | Win only after the full cargo polygon crosses inside the gate; no invisible centre-line victory |

**Threat proposal:** one physically mounted gun locks one reviewed cargo-lane shot at a time; the player can intercept with a real ball or disable the broad gun body before launch. A docked cargo is never fired upon. The original gun needs a much wider aiming arc than Circuit's proven±0.2rad, so its old proposed±0.9rad is **not admitted**. Produce the articulated pose or change the route before promising a second exposed cross-board attack. Do not rotate a muzzle through its frame.

The latest approved space enemies bypass the field to threaten the paddle. Escort has a different moving-object objective. Decide explicitly whether a cargo-targeted shot also bypasses field panels, or whether the exposed route guarantees a physically empty line. Do not silently combine the old cover-absorption draft with the new bypass renderer. If bypass is retained, only the cargo/ball/active defense intercepts; it must never damage panels or produce free drops.

**Provisional tuning retained for first blockout:** cargo hull3/2/2 Easy/Medium/Hard, crossing time5s in all modes, dock minimum rest3/2.5/2s. A first warning of1.6/1.4/1.2s is only a starting value and must be reconsidered with the selected heavy/salvo projectile body and actual lane travel. Do not adopt the old220/250/280u/s merely because the table exists. Difficulty should add a second eligible crossing or shorter preparation grace, not make the cargo faster and accidentally less exposed.

**Powers and progress:** normal balls must clear every mandatory blocker. Cargo cannot award charge on every bounce. A generic power may clear cover or interrupt a gun, but no compulsory cargo heal is added. Preserve current charge/caps unless separately approved. Cargo hull0 or player lives0 loses. Continue restores the cargo to the last secured dock with at least2hull, capped by mode maximum, retaining cleared panels/guns and completed checkpoints. Clear bolts, start one fresh serve and full warning grace. Retry resets cargo, field and route.

**Production and proof gates:** actual continuous cargo-polygon sweeps against all moving frames/iris/barrels at native scale; inflated2u clearance; runtime rail art collision; contact ordering at a moving corner; no double hull hit from overlap; normal/TITAN ball rebound off the friendly body; pause mid-crossing; same-frame dock arrival and bolt; Continue/Retry; both phones through every leg. The old1345-sample alpha audit proves only a sampled blockout, not these gates.

#### 3.2 Orbital Switch: route, tag, overload

**Status:** the earlier B direction remains reserved and unnumbered. No field force, prediction, tagged-ball receiver, final ring or new character has been implemented. It is not a continuation of Forge's current stabiliser HP contract.

**Story purpose:** restore navigation to a disabled orbital gate by routing power through its two field projectors and neutral return. No captives or rescue count. The enemy controls the station; the player reclaims it through ball routing.

**Core proposal:** left field bends an upward ball clockwise, right field bends it counterclockwise, neutraliser clears the route tag. Speed magnitude remains unchanged. Descending returns, the paddle and the thumb lane remain outside all fields. The last entered field owns that flight's tag; each real paddle contact clears it. Route state uses a tiny cyan/violet/neutral shape cue plus a local trail, without replacing the canonical ball art.

The old draft activates one exterior receiver at a time: left-curl, right-curl, neutral. A matching ordinary contact earns permanent progress; a wrong route rebounds without erasing progress. To avoid reviving the rejected tiny-symbol precision grind, the next visual study should test a **broad36–44u receiver face** and clearly visible route trace. That size is a new recommendation, not an approved source asset. If that still reads as an arbitrary gate, present an alternate broad-hull route before implementation approval; do not quietly add one later.

**Provisional first-blockout limits:** left/right influence radii42u, neutral30u; at most0.32s influence per pass, with heading-rate caps40°/60°/75° per second, giving at most12.8°/19.2°/24° turn. Receiver exposure12/10/9s, progress1/2/2 contacts per receiver, and a quiet final ordinary core hit after all three segments. These values come from the retained draft and remain untested. They are not human calibration or a guarantee of three reachable paths.

**Teach/test sequence:** first left route with guns idle and no timeout punishment → visible right-route trial → neutralising pass with one warned weapon episode → three petals visibly fold away → fields cease → at least3s quiet straight-ball approach → one broad external core contact and2s success. A missed exposure repeats after a complete recovery and preserves earned segments; it never starts an automatic loss clock.

**Physics contract:** integrate heading change at the same fixed substeps in live motion and aim prediction; sweep every curved substep through actual art-derived metal. Limit influence once per pass, require exit before re-entry, and prohibit trapped or endlessly circulating trajectories. Neutralisation changes the tag only; it cannot teleport/stop the ball. Multiple balls keep independent tags. A continued/caught serve clears transient tags but not completed receivers. LASER clears real panels or disables guns; it does not invent a ball route. Cosmic can retain its approved damage benefits but cannot pretend to pass through closed receiver metal.

The actual C bay has a solid enclosing lower lip. The Switch receiver/core must be visibly projected outside it, with a genuinely open final approach after the petals move. Moving a glowing centre inside the closed bay does not create ball access. Keep that constraint even if the visual ring appears hollow.

**Weapon/power proposal boundary:** use one selected distinct ship weapon pattern at a time, with current-width safe escape or a rest adaptation. Original draft bolts absorbed by cover; latest source enemies bypass cover. Choose and document a coherent rule before the new study. A receiver timeout can trigger a warning but never an unavoidable shot while the player is trapped in a field. Preserve ordinary completion and distinct companion casting; do not add Kit to this space level or introduce a new meter by default.

**Continue/Retry and tests:** preserve completed receivers, partial progress, disabled guns and removed panels. Clear old bolts/tags, fresh serve/full window; no reward repetition. Test three strict ordinary routes at normal and enlarged radius, field-boundary tangency, multi-ball tags, re-entry reset, exact predictor/live agreement, combined Focus/SLOW/hit-stop, moving petals and full final access, terminal ties, pause, Continue and Retry. This has more physics risk than Escort; do a minimal field blockout before any full character/atlas commission.

### 4. New princess level: Brum first, alternatives preserved

The owner authorized the Brum/Yeti direction as a proper princess level and delegated the design/build decisions. Follow [BRUM_LEVEL_PLAN.md](BRUM_LEVEL_PLAN.md) for the integrated Frost Warden story, layout, punch/strong-arm triggers, physical contact and difficulty state plan. `src/frost.js` and its dedicated28-frame art family are complete and locally tested; shipping status remains a separate CI/APK receipt. Brum's selected friendly identity remains separate from the newly authored adversary. This is not a serpent route beneath new art. The anticipation, planted punch, actual hand/post impact, follow-through and recovery cycle have actual native-size captures and measured contact fixtures. Continue normal-ball play and Kit's meaningful role; exact responsibilities and charge settings belong to that specific plan.

This is a castle/Menagerie encounter, not a space chapter; Kit is its control and power identity. The menu/save slot is internal index4, appended after the existing four. Root owns the five-level CI/APK scope and current release receipts. The latest full plan takes precedence over the alternatives below; the owner delegation supersedes the earlier options-first implementation hold for this task.

**Current role/objective:** Frost Warden is a new hostile Yeti with a distinct material/raster family based on the retained anatomy and rig. **Brum remains the friendly frost porter.** Warden's broad body and arms always accept ordinary-ball resolve damage. He advances between authored safe stances and winds up actual fist strikes against a dedicated physical defence barrier above Lumi. He does not attack score/power bricks to generate free player resources. Break his resolve before the barrier collapses and the chamber breach completes. Kit Ward protects the threatened defence; the existing Arrows/Cosmic/Ball Fan choices retain meaningful ordinary combat effects. The actual fist sweep owns post damage; there is no invented overlapping grab/eating animation. Exact stances, limits, mode timings and tests are maintained in the linked plan. Both phone-size Easy earned-power attempts completed with real Kit choices, but their different durations and natural capsules are not ordinary-only or human difficulty calibration.

The following three concepts were drafted before that steering and are **deferred, unselected adversary ideas**. They keep Lumi and Kit in the castle/Menagerie story and remain useful for future variety. Each would need its own approved silhouette, expression and motion proof. Names below are working labels. None is an approved final character, a replacement for Gnash, or an enemy role assigned to the selected Brum.

| Proposal | Enemy anatomy and motive | Player's different question | Main physics work |
|---|---|---|---|
| A — Ironclaw's Broken Bridge (deferred) | A squat six-legged masonry crab, broad shell, two asymmetric stone-cutting pincers; it guards a bridge winch | Which structural brace should I free, and which enemy clamp should I interrupt? | Moving claw contacts, support/collapse ownership, controlled cage descent |
| B — Belfry Pursuit | A compact bat with true membrane wings, short legs, ears and a hanging perch; it carries a key bell for the warden | Where should I bank the ball to interrupt the next airborne interception? | Swept wing/body motion, perch-to-perch flight, bounded falling debris |
| C — Clockwork Boar | Four-legged armoured boar with a real snout, tusks and short tail; a wound-up gate ram | Which lane should I open to turn its charge into a gate-breaking opportunity? | Locked charge trajectory, moving-body sweep, physical gate impulse and recovery |

These do not share a humanoid long-arm template. The crab's pincers and six leg contacts, bat's wings/feet/ears, and boar's shoulder weight/tusks provide their identities. No fish/floating-orb substitute and no space ship art is labelled a finished castle enemy. Brum can later help move a collapsed support as a hero/ally, but that separate story and motion are not automatically approved here.

#### 4.1 Deferred A: Ironclaw's Broken Bridge

**Story and win condition:** Lumi is in an iron rescue cradle suspended above a broken bridge. Three visible chain-anchor housings retain the cradle. Break each broad housing using normal ball play; each destroyed housing permanently releases one brake and the cradle lowers a safe discrete step. After all3anchors are released, the cradle lands on the exit platform, opens and Lumi crosses to Kit. Ironclaw tries to clamp the remaining winch/bridge supports; it does not eat Lumi or snake through the bricks.

This is a rescue, not damage to Lumi. Balls rebound from cage rails and friendly characters without hurt or charge farming. Each anchor housing presents a broad reachable glazed surface rather than a tiny link hidden behind unbreakable rails. Ordinary body-shell hits also damage/stagger the crab, so aiming slightly away from an anchor still helps. Disabling it cancels future clamp attacks but never resurrects or resets anchors; there is no mandatory HP cleanup after the rescue.

**Provisional layout on a360u field:** enemy ceiling track x65–295,y110–165; three anchor housings centred aroundx72/180/288,y220–280, each approximately44×30u before real-art fitting; central rescue cradle begins near(180,325), then lowers toward a broad safe exit ledge near y430. Side brick banks aroundy290–420 create bank choices and breakable support routes. Keep the lowest solid gameplay piece at least110u above the actual paddle top at the shorter phone size, subject to ordinary-ball travel/response proof. Extra Android height extends the return lane rather than creating more HP rows. Exact cage/leg/anchor bounds remain blocked out until the selected art is measured; these are placement hypotheses.

**Finite state proposal:**

1. `teach`: enemy enters sideways onto two visibly planted legs. Its first clamp demonstration touches a harmless spare support; no lethal consequence. The first reachable anchor is highlighted once. Initial serve uses the existing teaching cadence, not repeated prose.
2. `patrol`: crab makes a short visible ceiling traverse; all normal shell/anchor contacts are productive. It selects only an intact legal support whose loss leaves a fair ball route and a reachable defensive counter.
3. `windup`: approximately1.8/1.6/1.4s Easy/Medium/Hard; the real pincer opens and locks one support. Local cracks/metal jaw pose show the target. It does not retarget after warning begins.
4. `clamp`: approximately0.35s moving jaw; collision and raster follow the same hinge. A separated normal ball contact with the exposed broad pincer interrupts this attempt. Kit's selected Ward can brace this one threatened support. No perfect instant counter is mandatory: the warning covers a meaningful ball trip, and the support can survive at least one unblocked attempt in the first blockout.
5. `break/recover`: one successful clamp removes or damages one enemy-owned support, never an already released anchor. Its attached brick group loses support and falls using bounded debris/collapse rules. Approximately2s recovery follows; no simultaneous second attack. The enemy cannot break the only remaining normal-ball route or the safe exit platform.
6. `anchor release`: final housing damage is permanent; cancel any clamp whose target no longer exists. For approximately0.65s, one visible winch step lowers the cradle along its actual chain. Live ball/paddle remain clear of the moving cradle or are safely stowed for a specifically bounded presentation; choose that treatment once the real geometry is blocked out, not by deleting balls.
7. `rescue`: last housing break latches safety before loss. All threats stop, cage lowers/opens with approximately1.2s of weight-bearing motion and0.8s of clear Lumi step/Kit response. No body overlap or disconnected grab. Then success.

**Threat and failure:** the first prototype uses player lives plus a visible finite bridge-support budget, not a new global countdown. Start with3support failures Easy/Medium and2Hard only if normal proofs show adequate recovery. Each loss of a support advances one authored hazard state; it cannot silently remove several through a chain reaction. The final exhausted support triggers a readable0.8s winch-jam/cage-danger sequence before loss, with any already accepted final rescue taking precedence. This is provisional and must be tested against a simpler life-only variant before final selection. Do not add both the support budget and an encounter deadline merely to increase difficulty.

**Kit's purpose:** keep the selected face control and the existing Ward/Arrows/Cosmic/Ball Fan choices. Ward physically locks a temporary brace around the warned support for that clamp; the jaw strikes the brace and recoils. Arrows can damage real housings/claw/shell; they stop at appropriate solid geometry. Cosmic retains its canonical art and productive break benefits. Ball Fan creates additional independent opportunities, bounded by the current mode policy. No new second resource, obligatory face tap or free repeated brace. The existing Vault12ordinary-brick Kit baseline is a source fact, not an instruction to copy space24/30/36 recharge into this new castle level; new charge tuning must be separately measured.

**Initial resistance hypothesis:** anchors3/4/5HP, crab shell18/24/30HP, one optional breakable armour ring at most. Broad anchor faces always take normal damage; no tiny required weak-point window. Regular coloured bricks remain normal sized. Clamp cadence begins around6/5/4.5s plus its tell/recovery, with only one harmful action active. These values are uncalibrated. Aim for a complete45–90s Easy route with at least one meaningful earned Kit choice, without making the player wait for an invulnerability window. Increase route/attack interaction before inflating every HP pool.

**Collision and collapse details:**

- One ball episode may damage one shell/overlapping claw assembly once, rearming only after leaving the complete body with a small separation skin. Real incoming contacts must still damage the correct visible part. Powered overlaps cannot farm unlimited replacement charge.
- A pincer sweep uses the same pivot, jaw angle and time as its art. Static endpoint tests cannot certify the moving jaw. Shell/legs are art-derived compound contours; gaps that look open remain open.
- Chain links may be visual only if clearly thin decoration; opaque rails, braces and the cradle are actual colliders. Never place a damageable anchor behind an unchanged solid cage rail.
- Falling enemy-created chunks are either noncolliding visual debris or individually swept actors with one declared consequence. Do not accidentally pass them through the paddle as physical-looking damage. Keep fragments outside the thumb lane, cap their lifetime/count and cull safely.
- Cage descent is controlled motion along the winch, not an unstable rigid body that can crush the ball or strand the run. Preserve every live ball identity/power if temporarily stowing it; return to a fresh caught/fan serve with stale-input protection. No implicit duplication or dead-ball resurrection.

**Animation family:** sideways6-leg walk with grounded foot contacts; stop/weight shift; pincer open/tell/clamp/recoil; shell hit with expressive eyes; stagger/disabled slump; distinct suspicious/angry/surprised/frustrated expressions; real support crack/fall; Kit brace command and held/failed expression; Lumi look/hope/relief plus cage step-down/open/exit. Show native52CSS face readability separately from a large hero render. Establish charge/contact/recovery timing in a short motion proof before rendering a full atlas. All transparent cell bounds, stable pivots, source/provenance and metadata requirements apply.

#### 4.2 B: Belfry Pursuit

Lumi waits behind a bell-gate while the bat moves between3large visible perches. Normal ball hits to its complete body progressively drop3gate keys; keys are automatically secured where they land on the gate mechanism, never a separate thumb collection chore. The player can also break broad perch supports to restrict the next flight. No snake route, cage swallowing or clone of Carrier's tractor rescue.

Provisional cycle:2.0/1.7/1.5s hanging tell →1.2s authored perch-to-perch flight above the brick band →0.4s bell strike releasing one warned falling brick →2s grounded/perched recovery. The flight can be interrupted by normal body/wing contact. Its wings must retain genuine open gaps and sweep continuously; no large invisible rectangle. Falling returns remain straight and the bat never dives into the lower reaction/control lane. A destroyed perch changes a clearly drawn flight destination, not a mid-flight teleport.

Kit Ward catches one warned bell-fall at its support, allowing the player to keep a useful bank. Arrows intercept the bat; Cosmic and Ball Fan help through persistent body progress. All3keys secured opens the gate; lives0 loses. Continue preserves keys/perches/damage and cancels airborne debris; Retry resets. First-blockout HP and key thresholds should be small enough for ordinary play and must not use airborne invulnerability. Production risk is wing/contact readability and expensive flight/face rigging. Its first proof must include a full normal-ball perch route and falling-brick/paddle collision, not only a beautiful bat turntable.

#### 4.3 C: Clockwork Boar

Lumi is behind a broad locked gate. The boar is a wound-up maintenance ram: clear one of2visible bank lanes and hit its broad shoulder during a tell to redirect its next locked charge toward the corresponding gate brace. Normal hits also wear down the gate through an accessible ordinary route, so a missed redirect never creates a paid or timing-only lock. Two destroyed braces release Lumi. This alternate broad route is an intentional proposed rule, not an existing physics feature.

Provisional cycle:1.8/1.6/1.4s hoof-scrape tell →0.8–1.1s fixed charge over a physically measured upper lane →0.4s gate/bumper impact →2.2s recoil/recovery. Never retarget after launch or accelerate into a newly occupied control lane. Only one charge/debris episode exists; show the actual path through cleared bricks. Bricks in a declared charge path either stop the boar and take bounded damage or are deliberately broken with visible impulse; choose one rule and use it for both prediction and live sweep.

Kit Ward plants a temporary broad bumper that redirects one warned charge; normal ball contact supplies the alternative. Powers damage broad armour/gate and reduce dangerous exposure, not a mandatory parry. Continue preserves destroyed braces, shoulder/gate damage and removed panels; returns the boar to a stable start with a full warning. Retry resets. Main risk is teaching intentional enemy redirection while preserving intuitive ball rebounds; reject it if players cannot understand a successful charge from the native animation alone.

### 5. Proof and production order

1. **Keep the encounter visually reviewable.** Use native-layout images with the actual approved Kit/Lumi and source-faithful bricks; label unfinished art honestly. Show a clear initial state, threat consequence and successful counter, with notes outside the play lane. Current Frost Warden implementation proceeds under the owner's delegated decisions; future alternative concepts remain proposed.
2. **Measure the critical route.** Block out only the chosen geometry at360u, record normal/enlarged ball radii and paddle dimensions from the intended base level, and prove full sweeps through every mandatory opening. Declare solid versus sensor versus decorative parts. No sprite resizing to conceal a bad route.
3. **Build one full enemy cycle.** Initial entrance, tell, motion/contact, interruption, recovery and one success/failure animation. Compare against the approved glossy material/light reference at393×852 and412×915. A large still is insufficient.
4. **Make the smallest playable encounter.** One initial teach, one developed challenge and a finite finish. Keep explicit state data, actor/collider poses and real-clock policy. Add new systems only where the selected mechanic requires them; reuse Arena, brick damage/collapse, fixed-step ball helpers and pause/Retry contracts.
5. **Regress actual edge cases.** Final hit versus last miss; destroyed target during its warning; simultaneous balls; powered overlap episodes; no hostile charge/drops; changing WIDE; moving-corner sweeps; Focus/SLOW/hit-stop timing; menu/background freeze; stale pointer/Space/orb after presentation; Continue before/after a permanent milestone; Retry with spent powers and live hazards; valid saved stars/mode isolation.
6. **Earn routes separately.** Both phone sizes: ordinary optional-power-free route and a real earned Kit/companion-choice route, without direct target/HP/resources/lives edits or compulsory Continue. Record all bounded failures as well as wins. Staged visual fixtures are separately labelled. Test capsule interactions naturally as a different assisted scope.
7. **Observe people.** Can a first-time player explain the goal, tell, counter and failure? Can they see the ball under the VFX and react above the thumb? Does an ordinary choice feel productive? Adjust before calling Easy/Medium/Hard calibrated. Controller timing alone does not answer these questions.
8. **Finish the artifact trail.** Manifest source hashes, frame cells/pivots, alpha/metadata/decoded budgets; exact build/start-end hashes; native screenshots/motion; tests and limitations; updated handoff/artwork archive. Current commit/push is authorized by the owner's latest delegation and is coordinated by root. A new APK needs its own packaging, CI/native evidence and downloadable artifact; a document or source change does not update an existing APK.

### 6. Recommended next decision

Consolidate the integrated five-level handoff/build/CI evidence and obtain mobile play feedback on the exact delivered APK before calling the difficulty calibrated. Keep Escort and Switch reserved as different later space experiences; crab/bat/boar remain deferred. Do not commission all3alternative adversaries or two new space physics systems simultaneously: the first complete native-size motion/collision cycle should decide whether each direction earns a full production family.


---

# Part R: Mobile release and evidence

*Source: `docs/MOBILE_PREVIEW.md`*

## Space combat Android preview

Branch: `codex/space-combat-apk`. Includes Carrier Breakout, Circuit Breakout, Shutter Forge, the existing Vault and the new Frost Warden. Carrier/Vault save slots remain unchanged; Circuit and Forge append their own progress. The space campaign advances Carrier → Circuit → Forge; the castle route advances Vault → Frost Warden. Frost appends save slot 4 without moving prior progress.

Both heavy cannon rounds and three-round salvos use actual rendered plasma, with different colours per ship. Left, right, staggered paired attacks and rest windows share visible warnings; enemy fire passes above intact bricks. Player fire retains its own brick damage. Vesper/Latch accompany Circuit; Forge uses a neutral arsenal control until its cast is selected.

Space companions earn charge through ordinary productive hits over at least 24/30/36 active seconds on Easy/Medium/Hard. Chosen specials last 8/7/6 seconds and obey live-ball 7/6/5, one-Cosmic and remaining-duration 12/10/8 seconds caps. Kit keeps its prior separate limits. Circuit's earned skiff has 12 rounds and returns safely after its last shots resolve. Carrier has a longer opening response window on Easy.

Frost Warden uses a separate 28-frame Yeti rig with measured fist/body collision, three defensive gate posts, broad ordinary-ball damage, Kit’s four castle powers and separate Easy/Medium/Hard timing. Brum remains an ally.

The workflow builds and checks the exact bundle in `config/mobile-preview.json`, packages both OFL fonts offline, then runs Android compilation, lint and Android 15 emulator touch/fullscreen/lifecycle checks. The APK is only published after those checks pass. The completed run and downloaded artifact verification are recorded below.

Install the resulting `BREACH-Space-combat.apk` on Android 8.0 or later. It is a debug preview, not a store release. The app uses no network permission; ads and purchases remain local simulations. If Android reports a signature conflict with an earlier preview, removing that older app also removes its local progress.

Physical-phone frame rate, touch comfort and human difficulty remain for device testing. Automated route proofs are not a claim that every player or difficulty has a calibrated win rate.

### Frozen release candidate

- Canonical browser SHA256: `B06CDD969BCF5C420A74B3CF37A3EAC45FE3D46EABB2926F5E5D2B8A42E01770`.
- Offline Android HTML SHA256: `4071ACEE8BE6AB862A3CD9A0CE35680B99090B9E254D7B858F699668D949B90A`.
- All 231 unit checks pass. The 18 space phone/mode cases passed on the preceding E49DDC build; the sole later gameplay-source change is Frost's menu thumbnail crop. Both iOS and Android Vault/Carrier polish regressions passed with no page errors. Final five-chapter layouts pass on both phone sizes.
- Final canonical and offline Frost each pass six phone/mode cases, all four Kit choices, pause/Retry/Continue and 18 measured post contacts. Staged resources and attacks are explicitly labelled.
- The final offline Android payload also passes all 18 space/mode/phone cases with zero page errors.
- Six ship/phone VFX fixtures verify warnings, heavy/salvo travel and contact without enemy brick destruction. Separate earned routes preserve wins and losses; Frost's powered Easy browser routes finish at 39.79/97.81 seconds.
- A separate LF source copy produces the identical canonical HTML. Both fonts are embedded in the browser and copied unchanged into APK-local files.
- Permanent receipts and selected images: `docs/validation/space-combat/`. The passed native run and downloaded APK verification are recorded below.

### Native verification correction

Run [39163110800](https://github.com/mahikshith/breaker/actions/runs/39163110800) passed the complete web job, Android compilation and lint, but failed its first native canvas-colour probe. The callback timed out at `MobileSmokeTest.java:54`, after readiness and font checks; its native screenshot showed the correctly rendered five-card menu. The probe made 77 separate pixel reads on the live canvas. It now draws one 8×12 offscreen copy and reads it once, retaining the colour assertion without repeatedly reading the live render surface. The exact new probe passes against the final browser menu with a guard that rejects any live-canvas pixel read. Runtime HTML and package hashes are unchanged. A fresh CI run must pass the native gate before APK delivery.

Run [39164503538](https://github.com/mahikshith/breaker/actions/runs/39164503538) passed the full web job, Android compilation/lint and the corrected pixel check. Native fullscreen and pause preservation passed, but the first aim after resuming timed out. Android explicitly dispatched a blur on pause without reliably pairing it with focus on return; a focused WebView could retain the game's suspended flag. The native wrapper now sends the matching focus signal on window focus and on resume when focus is already retained. The pause scene remains until the user chooses Resume. Instrumentation now checks advancing game time after Resume and pointer acceptance before dragging, and records state on timeout. The game bundle hashes remain unchanged. Native success is still required before delivery.


Run [39166153838](https://github.com/mahikshith/breaker/actions/runs/39166153838) passed the full web job, Android compilation/lint, native menu/fullscreen, held-touch pause/resume, real serving, fighter launch and Circuit checks. The emulator then disconnected before instrumentation could complete; the retained device log contains no application assertion or fatal exception establishing why it exited. An unbounded post-failure `adb logcat` waited for the missing device until the 35-minute job timeout. The release repair bounds Gradle and all evidence commands, preserves the original test exit status, continuously saves device logs and records host memory/process/kernel diagnostics. Native tests use two Gradle workers and a 1 GB heap; the software-rendered emulator starts without snapshots or Vulkan, which this Canvas game does not require. These are infrastructure safeguards, not a claim that the emulator's precise failure cause is proven. Shell syntax and five mocked success/failure/timeout status cases pass; every native assertion and both frozen HTML hashes remain unchanged. The next native run still gates APK delivery.


### Verified delivery — 2026-10-20

[CI 39399653237](https://github.com/mahikshith/breaker/actions/runs/39399653237) passes on commit `f2c5b78bd53a78355b2df573d816ec410faef1a7`. Both jobs are green: 231 unit checks, canonical/offline browser suites (36 space and 12 Frost phone/mode cases), five-chapter layouts, both polish runs, Android compilation/lint, and complete offline Android 15 instrumentation. Native JUnit reports 1 test, 0 failures and 0 errors in 122.273 seconds. Lint has 0 errors and 9 retained warnings.

Download [BREACH-space-combat-android-15](https://github.com/mahikshith/breaker/actions/runs/39399653237/artifacts/12254844344), unzip it, and install `BREACH-Space-combat.apk`. The downloaded APK is **9,596,473 bytes**, SHA256 **`B44BC99FE10468DEF35E89F32B85900F8AAD3C16BB92C6C1040A04D850E7BA8E`**. The artifact is retained until 2026-11-19. The local verified copy is `out/apk-delivery/39399653237/apk/BREACH-Space-combat.apk` in the release worktree.

ZIP integrity and the published checksum pass. Embedded game bytes are exactly the frozen 4071ACEE offline payload; release metadata identifies the reviewed B06CDD canonical build. Both font files and both OFL licenses match their repository originals byte for byte. The compiled Android manifest confirms package `com.mahikshith.breach.preview`, version 4 / `0.4-space-combat-preview`, minimum API 26, target API 35, debug mode, backup disabled and no declared permissions, including no INTERNET permission.

[Native evidence](https://github.com/mahikshith/breaker/actions/runs/39399653237/artifacts/12254769401) contains all 10 screenshots, JUnit, lint, live logcat and host diagnostics. Actual images were inspected for all five scenes, held-touch pause/resume, fighter launch and recreation. Nine native geometry phases show the WebView at `(0,0)` filling `1080×2400`, with focus, bar visibility and CSS safe-area assertions preserved. The immediate final recreated-Carrier still does not show Nix; initial/live native Carrier captures do. That single timing-limited still does not prove a persistent gameplay defect or a sustained post-recreation companion-readiness check. Physical handset performance and human balance remain outside this release proof.

Permanent receipts: `docs/validation/space-combat/native-release.json`, `native-pass.xml`, `apk-verification.json`, `native-manifest.json` and `ci-assets.json`. Earlier failed runs and their repairs remain above as history; the game HTML was unchanged during the release infrastructure repair.


---

# Part A: Design brief for ChatGPT (start here)

*Source: `docs/handoff/04-chatgpt-design-brief.md`*

## BREACH: design brief for ChatGPT (the design partner)

**Current implementation (2026-10-19):** The owner approved heavy rounds and three-shot salvos, per-ship colours, left/right/paired/rest batteries, stronger player fire, Vesper/Latch for Circuit, a new power chooser and difficulty tuning. These changes are implemented on `codex/space-combat-apk`. The owner subsequently delegated remaining design decisions and requested a new princess/Yeti encounter, full documentation, commit/push and an APK. Frost Warden is integrated and locally verified as the fifth chapter; Brum remains an ally. Read `docs/CONTINUE_HERE.md`, `docs/SPACE_COMBAT_HANDOFF.md`, `docs/BRUM_LEVEL_PLAN.md` and `docs/MOBILE_PREVIEW.md` for current mechanics and verified release status. Older review gates and localhost checkpoints below are historical. No new CI success is claimed until recorded in the release document.

**Historical cannon correction before implementation (2026-10-19):** The owner rejected the4189 weapon studies. Enemy cannon fire must cross the intact brick field and threaten the paddle/craft, without breaking bricks or releasing their rewards. Carrier currently damages enemy-hit panels; Circuit/Forge currently absorb shots on cover. These behaviours must change in the approved implementation, while preserving player brick collisions and keeping Carrier boarding threats active. Circuit's centre is an exit iris, with no suction mechanic; the replacement presentation keeps it quiet until departure. The revised cannon comparison is at4190, stronger friendly skiff deployment/fire at4191, and reference-backed distinct companion proposals are recorded alongside them. See `design/phase1/weapon-vfx-v3-review.md`. The4188 playable checkpoint remains unchanged; visual approval is still required before implementation, commit/push or APK work. The previous4189 quality receipts certify only that historical study, which is now rejected.

**Current selected effects and power limits (2026-10-18):** Ship A magnetic extraction/plasma and Kit B single-row Quick Volley are implemented in the4188 review hub. Kit offers real Brick Ward, Arrows, canonical Cosmic and Ball Fan while retaining the face control. All three space levels use slower18/22/26 banked hit/active-second charging. Companion casts and ball pickups now obey mode caps:12/9/5 live balls,2/2/1 simultaneous Cosmic,20/18/14 maximum remaining special seconds. Saturated choices keep charge. All196 units,24 actual Main phone/mode cases (including66 Kit check groups), required polish/layout and compact mobile UI pass with zero page errors. Six coarse earned Easy attempts win with3lives; they are not human balance. Exact builds, screenshots and receipts are sealed in `out/space-selected-review/final-report.json`. The owner rejected both subsequent Hard laser/lance/battery boards as stale and visually mismatched. Their replacement is an isolated moving weapon study using the original cannon art and new rendered payloads; gameplay implementation remains explicitly withheld until the owner approves the visuals. Current normal plasma still uses the existing3.5u collision core. See `design/phase1/space-selected-review.md`. Older4186/4187 and the delivered APK are unchanged; no new gameplay commit/push or APK is implied.

**Historical pacing revision before the selected FX/Kit build:** The owner finds the six-hit space-power revision too short. All three space levels now bank18/22/26 ordinary damage credits and fill the orb over at least18/22/26 active combat seconds; shots/cosmic balls cannot recharge themselves. WIDE stacks width and time, other positive durations add, ball fan adds ordinary survivors, and canonical cosmic artwork is restored. Actual paddle artwork now widens with its collider while preserving chrome ends. The pacing-only hub is127.0.0.1:4187; older4186 and the APK remain frozen. Three level owners supplied earned Easy routes and native render proofs; scripted durations are not human balance. All183 units, final18 Main phone/mode cases, required polish/layout and compact mobile UI pass with zero page errors; exact artifacts are sealed in `out/space-polish-review/final-report.json`. Two ship-effect proposals and two Kit menu proposals have been shown, with owner picks still pending. New suction/cannon FX and live Kit power choices are therefore not yet built. See `design/phase1/space-polish-review.md` for rules, receipts and limits. No commit/push: the latest message both authorizes push and then asks to wait; resolve that after the complete result is reviewable.

**Historical six-hit space revision (superseded by the current pacing revision):** The owner rejects the earlier Circuit/Forge Easy balance as a precision/patience grind. New review candidates retain the selected visual families but provide broad mothership damage, equal-sized coloured panels, fewer grey pieces and Nix in all three space levels. Six productive ordinary damage contacts earn a paused three-choice picker: ten-second LASER, ten-second UNSTOPPABLE, or fill the live set to5 ordinary balls. Shots/TITAN do not self-recharge. Closed Forge machinery takes damage; Circuit drops the ordered-symbol gate and retains an earned skiff burst; ordinary ship metal hits remain productive. Carrier retains crew urgency and uses a curved connected tractor beam and matching pull. Shared input resets prevent stale taps/Space from launching; pause Retry stays. New browser review hub is127.0.0.1:4186, with all three modes per level; older4184/4185 and the delivered native APK stay frozen. All171 tests and the local build pass. Final18 actual Main CDP cases cover three levels ×three modes ×both phones, with visible Nix, choice/cancel, frozen clocks, powers, pause and Retry; zero page errors. Required polish/layout and compact mobile UI pass. Exact final artifacts are Carrier9f772abdf382, Circuit983c8c0328d0, Forge7c8df65c5f23; sealed hashes, gallery and receipts are in `out/space-power-review/final-report.json`. Circuit/Forge coarse Easy public-input-assisted completions with earned choices are separate evidence, not human balance. Carrier curved-motion media is explicitly staged. Full rules and receipt links: `design/phase1/space-powers-review.md`. This supersedes earlier balance/target rules, not the approved artwork. No gameplay commit/push or new APK approval.

**Artwork preservation:** `artwork-library/` now preserves750 unique originals/asset records (770 source aliases/versions, 288042628 bytes), with a complete catalogue, full SHA256 manifest and preserved A/B/C/D space-board gallery. See `docs/ARTWORK_LIBRARY.md` and `artwork-library/README.md`; AGENTS.md links the folder and requires `python tools/archive_artwork.py` after adding artwork. Copies are byte-exact, duplicates share one copy, and changed sources create new versions; historical rejected concepts remain labelled. Working manifests/render scripts stay at their existing paths. The archive is local until an approved push or separate backup.

**Historical selected space reviews (superseded by later owner difficulty feedback):** Owner-selected Circuit Breakout Level2 and Shutter Forge Level3 are now actual-art playable isolated candidates. Circuit HTML `9115383E4F4963F86C11A7063A07A50B10FC1B7347F5425AC4C972D39202FDCE`, sourceEEB862BC…, is served at127.0.0.1:4184/circuit.html?level=1&difficulty=medium. Forge HTML `E8F06046E4B224C1EF790F59F4124661583ABC1F5D141583ED0B44A46118F97F`, source89B1E8A1…, is served at127.0.0.1:4185/forge.html?level=1&difficulty=medium. Both use fresh Main controls, house fonts, real Resume/Retry/Menu and semantic result titles; previews have no companion/pilot/captive art. All147 configured tests pass, including20 independent new-level regressions. Both packed previews pass actual Chromium phone-size touch, pause, Retry, geometry and visual checks with zero page errors. Circuit earned runs win50.2667s iPhone /28.0417s Android, three lives: both use the selected intrinsic flight burst, Android also naturally collects SPLIT/LASER. Forge strict ordinary completions are162.88s iPhone /260.0417s Android, three lives, no optional capsule/TITAN/Continue; Android uses a legitimate wall-bank input policy. Earlier failed policies remain retained. These are scripted route proofs, not human balance or physical-device performance. Actual motion fixtures are explicitly staged. Details: `design/phase1/relay-circuit.md`, `orbital-forge.md`; independent review: `out/next-level-review/REVIEW.md`; phone galleries: `out/selected-levels-review/`. Human screenshot/play OK is still required before gameplay commit/push, permanent registry admission or a new APK. Existing frozen F8EB pause-Retry checkpoint4183 and delivered APK remain unchanged. The final local `npm run build` also passes at `EB70331AD2A520D35E9DFB0EDF4F6539D68CD455ACF814D70920061D7B780547`; it includes the shared no-core charge guard but retains only the existing two menu levels. Phone review receipts belong to their exact frozen previews above, not an untested new APK.

**Pause Retry checkpoint (2026-10-18):** Owner explicitly requests Retry inside pause. Current Main uses the existing fresh constructor on the same level/difficulty; Continue/ad/result/input state and the frame origin reset while saved stars/preferences stay intact. Three stacked Resume/Retry/Menu buttons fit both phone safe areas. Two independent regressions and12 real CDP cases (Carrier/Vault ×three modes ×both phone sizes) pass with zero page errors on exact HTML SHA256 `F8EB9BE20BDD854546944BF941CBB139FE97887505094A46B33732FAA6ECB9E0`. Frozen review is `out/pause-retry/browser/breach.html`, served at127.0.0.1:4183/breach.html?difficulty=medium. Evidence: `out/retry-review/final/report.json` and `out/retry-review/REVIEW.md`. This proves the two existing menu levels; selected Circuit/Forge will need the same real-input checks after their isolated build is ready. No new gameplay commit/push or APK change.

**Owner human balance feedback (2026-10-18):** The owner finds earlier BA5E Carrier too easy and Vault too hard, then selects a MIX of boosted retreat and finite rebuilding siege. That choice is implemented in the new review candidate; the old pure A/B choice is closed. Easy/Medium/Hard share controls and the lower reaction lane. Vault locomotion/chew multipliers are0.60/0.80/1.00; warning, venom, cage and ball/input timing stay intact. Hard Carrier is a development setting pending calibration, not approved balance. No new gameplay commit/push approval has been given.

**Latest selection and tested candidate (2026-10-18):** Production HTML SHA256 `19376ED445F4D89CEA02CFF8733A5255DA14FD275DA3CAD9798155AA64516AA1` adds the selected hybrid to Boarding Raid: finite distinct manifests, active per-manifest jump clocks, permanent archived rescues, six-contact manual Nix, larger target-facing fighters, visible hull motion/engines, safe rebuilding and final boosted retreat or disabled cleanup. All128 units pass. Production two-phone real-input lifecycle checks, required polish/layout and compact mobile UI pass with zero page errors. Separately sealed isolated HTML `4F808C2A682885F6415325CBC89B064D63939FF277912ABD859D5AD048BC457D` uses identical gameplay source plus embedded fonts/read-only trajectory planning. At120Hz public level input, ordinary Easy wins40.400/42.700s; Medium ten-rescue wins109.725/125.600s, three lives, no pickups/Nix/Continue. These are scripted route proofs, not human balance, DOM routing or performance proof. Hard75s/8.5s has no strict ordinary full-clear admission; failed attempts and an unadopted90s/10s experiment are preserved. A separate bounded earned-Nix proof readies at8.667/12.325s with nine authored rescues remaining; iPhone cast run wins, Android cast run disables the hull then controller-times-out in cleanup, not a victory (`out/carrier-hybrid/nix-earned-report.json`). Primary changes remain uncommitted pending owner play/screenshot OK. Evidence: `out/carrier-hybrid/evidence.json`, `out/hybrid-review/production-decoded/report.json`, `out/carrier-hybrid/mobile-ui/report.json`. Earlier BA5E and4181 remain frozen history.

**Parallel levels authorized (2026-10-18):** The selected Circuit A and Forge A mechanics, source-faithful machinery families, actual moving collision and independent phone reviews are delivered as described above. Escort Run B and Orbital Switch B remain distinct later directions, numbers unassigned. Original B/C rescue prototypes are historical; selected design/source geometry and collision are authoritative now. The C lower hull lip remains physical: Forge uses its visibly deployed exterior reactor. Circuit uses four empty phase stations, real split-metal firing ports and one earned skiff burst; Forge uses three timed stabilisers, collapse, once-only ordinary three-ball reward and quiet external-reactor finish. No extra cast or permanent registry/progress migration is included. All new gameplay remains uncommitted pending owner approval.

**APK checkpoint delivered (2026-10-18):** Separate `codex/carrier-mobile-preview` CI [39129140498](https://github.com/mahikshith/breaker/actions/runs/39129140498) completed successfully on native fix47bc6b3. Actual APK artifact12137681701 is downloaded and verified at `../breaker-mobile-preview/out/carrier-apk-delivery/39129140498/apk/BREACH-Carrier-preview.apk` (2,431,097bytes, SHA256 `7F5468197BB6333BF5AACEBE4CF4226048D043634BCA8829B6644042C4F2E10D`). Web44units/six suites, native build/lint and lifecycle instrumentation pass; actual recreation captures show full1080×2400 content. Frozen gameplay F4863DC5… and packaged HTML4D5D7B5E… remain exact. Delivery documentation commitf72e7ccf follows tested47bc6b3 and is pushed as the owner. APK excludes Boarding Raid, Nix/Tick, difficulty/hybrid and B/C. Physical phone performance remains for owner testing. This checkpoint authorization does not approve primary gameplay commit/push or merging main.

**Current production scope (2026-10-18):** Carrier A retains its approved independent hull/hangar, guns, fighters, panel crates, five shallow captive windows, full-screen background and125×17u paddle/7.5r ordinary ball. Boarding Raid supplies the adversary/crew stakes and manual Nix; Tick secures real released identities in0.8s. Exact rules, ordinary completion and limits are in `design/phase1/carrier-urgency.md` and `carrier-companions.md`. Vault retains70×12u/default6r and exclusive Kit. Main now supports a real Resume overlay and freezes active clocks on pause/background without releasing held aim. New browser candidate is reviewable at127.0.0.1:4181/boarding.html?level=1; frozen checkpoint remains on4180. No new gameplay commit/push/APK inclusion before owner OK. B/C stay isolated, D and other cast/progression remain later work.

**Historical A/B asset milestone (2026-10-18):** real independent PNG parts and the isolated Canvas motion assembly are complete for the approved A/B left playfields. Final proof is under `out/space-assets-ab/final/`: `A-ios-reference.png`, `A-android-reference.png`, `B-ios-reference.png`, `B-android-reference.png`, `A-motion.gif`, `B-motion.gif` and `asset-report.json`. Actual 393×852/412×915 images and sampled launch/release/boarding/iris sequences pass independent visual review; all four capture runs report zero page errors, real alpha/metadata checks and approximately 126 CSS paddle reserve. A has five shallow captive windows; B has four large worker pods. This asset-only milestone contains no companions, pilots or portraits and predates the latest Nix/Tick selection. These are asset-motion proofs with a placement ball, not new gameplay: runtime admission/WebP sizing, actual-alpha collision alignment, input/combat/rescue/power rules, full playable phone runs, memory/performance and new APK checks remain. The proof milestone retains EA839F00… as its gameplay baseline; it does not cover later Carrier integration. Reproduction and limits: `art/space/ASSETS_AB.md`; inventory/contracts: `design/phase1/space-assets-ab-spec.md` and `space-assets-ab.json`.

**Current working agreement (2026-10-18):** Phase 1 design/build and layout-design options for the existing Invasion and Vault levels proceed with parallel helpers and separate file ownership. For each design track, show 2–3 image options and wait for the owner's pick before building. Playtest implemented changes at both phone sizes and show screenshots; wait for the owner's OK before committing or pushing. This agreement supersedes the original role split and sequential-preparation instructions below.

**Who this is for:** ChatGPT (or any assistant) doing the *design* work on BREACH: story scripts, dialogue, character design, concept art, UI/UX mock-ups, level layouts and balance tables.

**Who builds it:** Claude, in the owner's Claude Project, does the *execution*: code, Blender renders, playtests, commits. You hand designs over; Claude turns them into the game.

**Why split it:** the owner (mykee) has a ChatGPT Pro subscription with plenty of capacity. Claude's capacity is better spent building. So you design in depth, and Claude builds exactly what you specify.

---

### 0. How to use this brief (for the owner)

1. Start a new ChatGPT project called "BREACH design".
2. Add two files to the project's files:
   - **`docs/BREACH-ChatGPT-handoff.md`** holds everything:
     - this brief;
     - the steering prompts;
     - the story plan and research, and the original game plan;
     - all three handoff docs: status, rules and history; architecture and pipeline; environment, skills and UX;
     - a map of the repo's files.
   - **`docs/BREACH-blender-scripts.md`** holds every Blender and art script, with an index. Use it as the reference for how the art is built.

   Optionally, add the reference images from the repo (https://github.com/mahikshith/breaker): `docs/reference/`, `docs/screens/` and `docs/drafts/`. You can also connect GitHub in ChatGPT (Settings → Connectors → GitHub) so it can read the code.

   Then paste the project instructions from Part B, section 1 into the project's Instructions field.
3. Paste the "first message" in section 1.
4. Work through the tasks in section 6 one at a time. Review each in ChatGPT until you like it.
5. Bring the finished deliverables back to the Claude Project thread. Upload the files there, or paste the text, and say "build this". Claude will build them and show you screenshots.

> Keep design and build in separate tools. Don't ask ChatGPT to edit the game code while Claude is also working on it, or the two will overwrite each other.

---

### 1. First message to paste into ChatGPT

```
You are the lead game designer and art director for BREACH, a premium portrait brick breaker for
iOS and Android. The project file BREACH-ChatGPT-handoff.md holds everything: your design brief
(Part A), the steering prompts and checklists (Part B), the story plan and research (Part C), the
original game plan (Part D) and the full build handoff (Parts E-G). BREACH-blender-scripts.md shows
how all existing art is built in Blender. Read all of it before answering.

Your job is DESIGN ONLY: story scripts, dialogue, character design sheets, concept art, UI/UX
screen specs, level layouts and balance tables. Another engineer (Claude) builds everything in
code and Blender, so every deliverable must follow the exact formats in Part A section 7,
with exact colours (hex), sizes (in game units, 360 wide), timings (seconds) and file names.

Follow the art and UX rules in Part A sections 3-5 strictly. Never contradict the owner's rules in
Part A section 2. When something isn't specified, propose 2-3 options with a recommendation and ask me.
Start with Task 1 in Part A section 6.
```

---

### 2. The owner's rules (non-negotiable)

These come from many rounds of feedback. Breaking any of them means the work gets redone.

#### Feel

- **Premium, inventive, urgent, addictive.** Nothing may look "vibe-coded", meaning generic, template-like or default-looking.
- **Expressions must say a lot.** Every character needs big, readable emotions: eyes with lids and brows, and a mouth that changes. No uniform or blank faces.
- **Focus on gameplay.** The background must never outshine the foreground. The owner had us remove dungeon lights, lanterns, torches, bright planets, window bars and hazard stripes because they distracted from play. Backgrounds stay calm, dark and desaturated.
- **Not too much yellow.** Gold and yellow are accents only. The owner rejected a yellow cage chamber and gold cage bars; the cage is now dark iron.

#### Look

- **Keep the playful font and colours.** Lilita One for game text, Rubik for numbers.
- **Glossy, shiny, rendered.** Bricks look like glazed ceramic tiles with real reflections. Characters look like glossy vinyl toys.
- **Rejected styles:** pixel art, wisps or ghost blobs, jittery fox characters, ball-chain snake bodies, round "bally" blob heads, and flat vector clip-art.

#### Play

- **Readable at a glance on a phone.** Short words, big shapes, 44 pt touch targets.
- **Mobile edge to edge.** The scene fills behind the notch and home bar, but UI never sits inside them. It must not overlap the Android status bar.

#### Process

- **Show drafts.** Every finished piece (screen, character, asset) is shown to the owner as an image before it is final.

#### Repository rules (only if you ever touch the repo)

- Commits must be authored as `mahikshith <mahikshith97@gmail.com>`.
- No AI attribution anywhere: no "Co-Authored-By", no "Generated with…", no assistant names in files.
- Never ask for, paste or store the owner's tokens.

---

### 3. The game today (what exists)

BREACH plays in portrait. The world is 360 units wide and 640–880 tall depending on the phone. There are two finished levels:

#### Level 1, Invasion

Arkanoid crossed with Space Invaders.

- **Formation:** 11 × 9 bricks with glossy toy robots ("Clanks") in 4 colours (white, pink, yellow, blue), each with 7 expressions. The formation marches sideways and down, and the robots shoot back.
- **Boss:** the mothership (Zorvax) is a saucer with an alien face and 5 expressions: smug, angry, hurt, panic, dizzy. It has 36 HP.
- **Lose condition:** if the formation reaches the line, it lands. Robots laugh, a beam fires, and the continue screen appears.
- **Background:** a dark, calm hangar with a dim planet.

#### Level 2, The Vault

A rescue race.

- **Setting:** a side-view cutaway tower of glazed bricks. Princess Lumi is caged in a dark stone cell with iron bars.
- **Serpent (Gnash):** chews through bricks toward her, growing longer, wider and faster as it eats.
- **Danger:** a colour meter goes green → amber → red, and the camera zooms toward the cage as danger rises.
- **Lose:** the serpent rears and strikes the cage: "GOT HER!"
- **Win:** the princess runs the breach path, then FRENZY gives 12 balls for 7 s.

#### Shared systems

- **Paddle:** a chrome paddle raised above the thumb, with a dark control deck below it to drag on.
- **Catch & aim (Focus):** hold still as the ball lands to catch it; time slows, slide to aim, lift to fire.
- **Titan core:** a gem in the paddle fills as you break bricks. A dead-centre hit then makes a giant piercing ball.
- **Power-ups:** SPLIT ×3, BURST +3, FIRE, WIDE, AIM, LASER (paddle bullets), SHIELD, SLOW, and TINY (bad).
- **Continue screen:** watch an ad to continue, or unlock the full game for $2.99.

**Reference images:** `docs/reference/` (vault-top-down.png is the "shiny" target), `docs/screens/` and `docs/drafts/`. The playable build is shared by the owner.

---

### 4. Art bible (match this exactly)

#### Rendering

- Everything final is rendered in **Blender 5.2 (Cycles)** by Claude. Your concept art is reference, not the final asset.
- **Lighting:**
  - a warm key area light from the **top-left** (colour about `#FFDBB8`);
  - a cool blue fill from the right (`#8CA6FF`);
  - a soft warm-pink bounce from below (`#FF80A6`);
  - a big softbox behind the camera gives the glossy reflections on bricks.
- **Colour management:** AgX, look "Medium High Contrast". Colours are saturated but never neon.
- **Shadows:** drop shadows fall down-right (+3, +5 units).
- **Materials:**
  - bricks are glazed ceramic: a coloured body under a thick, clear, glossy coat with a crisp highlight band on the top edge and slightly rounded corners;
  - characters are vinyl toys, satin with a light clear coat;
  - metal is chrome for the paddle and ball, and dark blued gunmetal for cage bars.
- **Camera:** orthographic. Levels are side-on (the Vault) or front-on (Invasion).

#### Character proportions

- Characters use the **KayKit Adventurers** chibi rig (CC0, `assets/models/kk_Knight.glb`, `kk_Rogue.glb`, `kk_Mage.glb`).
  - The head is about 40% of total height, with stubby limbs.
  - A character is about 42 game units tall on screen.
- **Princess Lumi** (built from Rogue):
  - rose dress with a flared bell skirt and lace petticoat, honey-blonde hair, ivory gloves, white tights, rose shoes, gold trims;
  - a gold filigree tiara with a faceted rose gem and pearl tips;
  - big glossy eyes with iris, pupil and two catch-lights, skin eyelids with a lash line, brow strokes, a reshaping mouth and cheek blush.
- **Faces** are the most important part. Every new character gets the same face rig quality as Lumi.
- **Gnash the serpent:**
  - an angular, faceted head (never round);
  - pink brows, shader-painted iris with lids;
  - a purple body `#7A3CCC` with a peach belly `#FFC49A`, rose diamonds `#FF6FAE` and a dark outline `#1E0A40`.
- **Animations available on every KayKit character:**
  - **Idle and moving:** Idle, Unarmed_Idle, Walking_A/B/C, Running_A/B, Jump_Full_Short/Long, Dodge_*.
  - **Emotes:** Cheer, Interact, PickUp, Use_Item, Throw.
  - **Combat:** Block, Blocking, Block_Hit, Hit_A/B, Death_A/B, 1H/2H melee and ranged attacks, Spellcast_*.
  - **Rest:** Sit_*, Lie_*.

  Design character moments around these names so Claude can render them directly.

#### Palette (hex)

| Use | Colours |
|---|---|
| Backgrounds | deep navy/indigo gradient `#22284A` → `#141831` → `#0A0C18`, vignette, light film grain |
| Vault bricks | sun `#FFC73D`, coral `#FF6F61`, violet `#8F5CF0`, teal `#22C4B0`, blue `#4F9DFF`, gold gem `#F4C542`, granite `#4A4F6E` |
| Invasion rows | `#FF5D8F` `#FF8A3D` `#FFD23F` `#5CCF6A` `#2EC4B6` `#3FA8F5` `#7B6CF6` `#C46BF0`; armour `#8D97B3` |
| Level accents | Invasion pink `#FF5D8F`, Vault gold `#F4C542` |
| UI states | AIM lilac `#E3B6FF` / `#C46BF0`, danger `#FF4D5E`, success `#7BD88F`, combo text `#FFD36B` |
| Power-ups | SPLIT `#5CCF6A`, FIRE `#FF8A3D`, WIDE `#3FA8F5`, AIM `#C46BF0`, BURST `#F7C948`, LASER `#FF4D6D`, SHIELD `#2EC4B6`, SLOW `#7FD6FF`, TINY `#5A5F78` |

New colours must sit inside this family. Give every new colour as a hex value and name where it is used.

#### Image prompts (for ChatGPT image generation)

Start every concept-art prompt with this style block so the images stay consistent:

```
Glossy 3D vinyl-toy render, Blender Cycles look, chibi proportions (head ~40% of height), soft warm key
light from the top-left, cool blue rim light from the right, gentle pink bounce from below, clean
reflections, saturated but not neon colours, minimal yellow, plain dark navy background (#141831),
orthographic front view, no text, no watermark.
```

Then describe the subject. For character sheets, ask for "turnaround: front, three-quarter, side, back, same character, same lighting, evenly spaced on one image".

---

### 5. UI/UX bible

#### Screen layout (portrait, 360 units wide)

From top to bottom:

1. **Notch / Dynamic Island:** scene art only, no UI.
2. **Slim HUD bar:** pause (top-left), level meter, score (top-right).
3. **Playfield:** starts right under the HUD bar; no dead band.
4. **Paddle:** at `H − clamp(0.25·H, 150, 210)`, kept above the thumb.
5. **Shield line and drain line.**
6. **Control deck:** a dark panel to drag on, with a track and grip showing the paddle position, then lives, power timers and AIM pips.
7. **Home indicator:** scene art only.

Test sizes: iPhone 393 × 852 pt (safe insets 59 top, 34 bottom) and Android 412 × 915 dp (32 top, 24 bottom).

#### Text

- Lilita One for all game text, with a dark outline of 0.16 × the font size and a soft drop shadow.
- Rubik 600 for the score and other numbers.
- At most 2–6 words per pop. Big moments get big text: BREACH!, TITAN!, FRENZY!, GOT HER!

#### Feedback ("juice")

- Every hit gets a sound, a small shake and particles.
- Big moments add hit-stop, haptics, slow motion and big text.
- Single broken bricks crack and fade in about 0.4 s. Only big crashes leave physics debris.

#### Controls

- Relative drag anywhere (gain 1.15). The finger never covers the ball.
- To serve, slide to aim and lift to launch. A dotted path previews the first bounces.

#### Accessibility

- 44 pt minimum touch targets.
- Never rely on colour alone. The serpent meter uses colour plus the princess icon's expression.
- Text contrast at least 4.5:1.

#### Menus

- **Title:** a BREACH logo in Lilita One with a gradient and thick outline, over floating glossy bricks.
- **Level cards:** a live preview, a character peeking out, stars and a number badge.
- **Results card:** stars pop in with sound, plus Retry/Next.

When you spec a screen, give every element its position and size in world units (x, y, w, h on the 360-wide grid). Also give its font, size, colour hex, its states (normal, pressed, disabled, locked) and its animation (what moves, how far, for how long, and the easing).

---

### 6. Design tasks, in order (Phase 1 of STORY_PLAN.md)

The owner approved Phase 1 with the names Kit, Lumi, Zorvax, Gnash and Brickhaven and the current ads plus $2.99 model. Kit's original courtyard-kid appearance was rejected; the current direction is an underdog knight with a medieval shield. Parallel character and existing-level preparation is approved under the working agreement above; each design and completed implementation still needs the owner's OK.

**Current gate:** Review the selected B / Boarding Raid implementation within Carrier A, using its actual Nix/Tick clips and both-phone screenshots. Browser checks and ordinary-ball completion pass as recorded above; await owner OK before committing/pushing this gameplay. Keep the separate earlier APK checkpoint frozen and B/C isolated. No new concept choice is pending for this loop.

#### Task 1: Prince Kit character design

Deliverables:

1. A **design sheet** with:
   - silhouette notes and personality in 3 words;
   - outfit parts with a hex colour for each;
   - hair;
   - his signature prop, a broad medieval shield with a clear heraldic outline, thickness and a rear grip; no bat-like handle.
2. A **turnaround** concept image (front, ¾, side, back) using the style block.
3. An **expression sheet** of 8 faces, each mapped to a game moment:
   - determined (serve);
   - focused (catch & aim);
   - grin (combo);
   - shock (life lost);
   - worried (danger high);
   - cheer (win);
   - hurt (hit);
   - laugh (titan).
4. **Build notes:** how to make Kit from `kk_Knight.glb`.
   - Which armour pieces and shield to keep, how the selected hair or open helmet is constructed, and which small costume details to simplify at native size.
   - The face rig must match Lumi's.
   - Which KayKit animation to use for each moment.
5. Kit must read clearly as different from Lumi at 42 units tall: a different silhouette and a different dominant colour. Keep yellow minimal.

#### Task 2: Prologue script (skippable, about 60 s)

- 5–6 comic panels. For each panel give:
  - shot and camera;
  - characters, pose (a KayKit animation name) and expression;
  - background and lighting;
  - a caption of 12 words or fewer, and speech bubbles of 10 words or fewer;
  - a sound cue and a duration in seconds;
  - a transition into the next panel.
- The story: Kit and Lumi play the bounce game in the palace courtyard at sunset. The court scoffs. The sky goes dark, the Clank toys turn on them, and the mothership's beam takes Lumi. Kit grabs his old paddle.
- End on the first serve of Invasion: the tutorial starts inside the story.

#### Task 3: Story beats around the two levels

Short in-game beats of 3–6 s each, with no long cutscenes. Each needs who speaks, the line (10 words or fewer), the expression, the camera move and the timing:

- Invasion intro;
- Invasion mid-boss taunt from Zorvax;
- Invasion win (the decoy reveal and the tractor beam taking Lumi, a cliffhanger);
- Invasion lose (Clanks laugh);
- Vault intro (Gnash wakes; Lumi signals Kit);
- Vault danger lines from Lumi at 40% and 70% danger;
- Vault win (Lumi: "My turn.");
- Vault lose (Gnash: "GOT HER!", already in the game);
- a "to be continued" card teasing Chapter 3.

Give 2 alternative lines for each, so the owner can pick.

#### Task 4: Shine and the results screen

- Spec the new results card: score count-up, stars, Shine earned (1 per 100 points plus a star bonus), and a "chest reveal" moment for the Shine total, slot-machine style but short (1.5 s or less, tap to skip).
- Spec the "next unlock" progress bar that teases the next weapon or skin.
- Include layout, every animation timing, sound cues and both phone sizes.

#### Task 5: Chapter select screen

- A vertical map from the Prologue to Chapter 2, with Chapter 3 shown locked as a silhouette.
- Each node shows stars, a best score and a lock state.
- Brickhaven's dark skyline sits at the bottom, ready to light up later (Phase 3).
- Spec it the same way as Task 4.

#### Task 6: Zorvax and Gnash voice sheets

- Personality, speech style, and 10 short lines each (taunts, hurt, panic).
- Zorvax is smug and theatrical, secretly lonely (the final-chapter twist), so hint at it once.
- Gnash is hungry and gleeful; it hisses and talks in short words.

---

### 7. Deliverable formats (what Claude needs back)

Return each task as **one Markdown file** plus images:

- **File names:** `design/phase1/<task-number>-<slug>.md`, for example `design/phase1/01-kit-character.md`. Images go in `design/phase1/img/<task-number>-<slug>-<n>.png`, at 1024 px or larger, on a plain background.
- **Colours:** hex, always.
- **Positions and sizes:** in world units on the 360-wide grid, with y measured down from the top of the safe area.
- **Times:** in seconds.
- **Animations:** property, from → to, duration, easing (for example "scale 0.6 → 1.0, 0.25 s, easeOutBack").
- **Scripts and dialogue:** also as a JSON block Claude can paste into code:

  ```json
  { "beat": "invasion_win", "speaker": "zorvax", "expr": "smug", "line": "A decoy, little prince!", "alt": ["...","..."], "t": 3.5, "camera": "zoom 1.0→1.2 on boss, 0.4 s" }
  ```

- **Character build notes:** KayKit part names, animation names, and hex colours for each material.
- **Open questions:** end every file with a short list Claude should ask the owner about.

The owner uploads these files into the Claude Project thread, and Claude builds from them.

---

### 8. Tools, connections and where things live

| What | Where / how |
|---|---|
| Code repo | https://github.com/mahikshith/breaker (`main` is stable). Plain JS on Canvas 2D, bundled by esbuild into one HTML file. |
| Story and roadmap | `docs/STORY_PLAN.md`; the live editable copy is a Claude Doc in the owner's Claude account |
| Handoff docs | `docs/handoff/01`–`05` (this file is 04; 05 is the steering prompts). Single upload files: `docs/BREACH-ChatGPT-handoff.md` and `docs/BREACH-blender-scripts.md`, rebuilt with `python3 tools/make_handoff.py`. |
| Art scripts | `art/*.py`, Blender `bpy` 5.2.2 run headless with Python 3.13. `art/princess.py` (character + face rig), `art/snake.py` (serpent heads), `art/render_vault_assets.py`, `art/render_invasion_assets.py` (plates, bricks, sprites). |
| Packed art | `tools/pack_art.py` → `src/vault-art.js` (WebP data URIs) |
| Playtests | Playwright + Chromium scripts in `tools/playtest/`, at iOS and Android sizes |
| 3D models | KayKit Adventurers (CC0) in `assets/models/` |
| Fonts | Google Fonts: Lilita One, Rubik (OFL) |
| Playable build | A claude.ai Artifact in the owner's account. Any static host also works for `dist/breach.html`, for example GitHub Pages. |
| Claude memory | The Claude Project keeps a short project memory (rules, art direction, locations). Its content is mirrored in handoff docs 01 and 03, so nothing lives only there. |
| Shared files | The Claude Project's file area `/mnt/project-files/breaker/` (characters/, lookdev/, playtest/, plan/, handoff/). These are copies; the repo is the source of truth. |
| Game-dev skill guides | In the Claude Project at `/mnt/project-files/skills/gamedev/`: game-feel, game-ui-ux, level-design, create-game-assets, audio-design and others. They are plain Markdown; ask the owner for them if you want the checklists. |

---

### 9. Can ChatGPT drive Blender or the build directly?

Mostly no, and that is fine for design. The options, as of October 2026 (as far as we know):

- **ChatGPT chat (web or app):**
  - It can't run Blender or the game build.
  - Its image generation is great for concept art. Its code tool is a sandbox without Blender.
  - **Use it for design.**
- **Codex CLI** (OpenAI's coding agent, included with ChatGPT Plus and Pro):
  - It runs on the owner's computer, reads and edits the repo, and runs commands.
  - It could run the same headless Blender scripts (`python3 art/princess.py …`) and the build (`npm run build`).
  - It also supports MCP tool servers.
  - This is the route if you ever want ChatGPT to do execution work. If you do, follow sections 2 and 10 exactly, and don't run it on the repo at the same time as Claude.
- **Blender MCP** ([ahujasid/blender-mcp](https://playbooks.com/mcp/ahujasid-blender)):
  - A Blender add-on that lets an AI app control a *live* Blender window on the owner's computer: create objects, set materials, run Python.
  - It works with Claude Desktop, Claude Code, Cursor and VS Code, and with Codex through its MCP config.
  - It's useful for watching the scene being built.
- **ChatGPT "developer mode" connectors** ([setup guide](https://auth0.com/blog/add-remote-mcp-server-chatgpt/)):
  - They let ChatGPT call remote MCP servers by URL (Plus and Pro, beta).
  - A Blender on the owner's computer would need to be exposed through a tunnel first. That's not worth the setup for design work.

**Recommendation (owner's goal: save Claude usage):**

- The ChatGPT project designs.
- Codex builds, guided by `AGENTS.md` in the repo and Part B, section 8.
- Claude is used only for reviews or hard problems.

Keep one builder on the repo at a time.

---

### 10. If another tool must take over the execution (Codex or another agent)

Read handoff docs 01–03 first; they hold the details. Then:

1. **Set up:**
   - `git clone https://github.com/mahikshith/breaker`;
   - Node 22, then `npm install`;
   - Python 3.13, then `pip install bpy==5.2.2 pillow numpy`;
   - Playwright with Chromium.
2. **Set the repo identity before any commit:**
   ```
   git config user.name mahikshith
   git config user.email mahikshith97@gmail.com
   ```
   Never add AI trailers.
3. **Build:** `npm run build` writes `dist/breach.html`. Run the unit tests with `npm test`.
4. **Render art:** use the commands in doc 02, section 3. Run `python3 tools/pack_art.py`, then build again.
5. **Strip the render path** from PNGs before committing, because Blender embeds it:
   ```
   python3 -c "import glob;from PIL import Image;[Image.open(f).save(f) for f in glob.glob('assets/**/*.png',recursive=True)]"
   ```
6. **Playtest:**
   ```
   node tools/playtest/polish.mjs <out> ios|android
   node tools/playtest/layout.mjs <out>
   ```
   Check that there are no page errors, and share screenshots with the owner.
7. **Update** handoff docs 01–04 at every milestone and push.

---

### 11. How BREACH was made (the process to keep following)

1. **Plan:** `docs/GAME_PLAN.md` set the pillars (premium, urgent, addictive), the two levels and the references (BALL x PIT, Arkanoid, Space Invaders).
2. **Prototype:** plain JS and Canvas with a fixed 1/120 s physics step, custom ball physics, and planck.js for debris. The goal was something fast to change and one file to ship.
3. **Look development in Blender:** a top-down "Vault" lookdev set the shiny glazed-brick target. Everything after it matches that render.
4. **Characters, iterated with the owner:**
   - the princess built from the KayKit Rogue with a custom face rig;
   - the serpent's head redone until angular and expressive;
   - the robots and mothership given full expression sets.
5. **Playtests at phone sizes:** each round was screenshotted for iOS and Android and shown to the owner.
6. **Polish rounds** from the owner's feedback:
   - calmer backgrounds;
   - a raised paddle with a control deck;
   - catch & aim;
   - a titan core;
   - a serpent that grows and speeds up;
   - zoom on danger;
   - a full-screen, edge-to-edge layout;
   - a continue screen.
7. **Story plan:** research into addictive games produced `STORY_PLAN.md`. Now Phase 1 starts, with design by you (ChatGPT) and build by Claude.


---

# Part B: Steering prompts: project instructions, task prompts, corrections, checklists

*Source: `docs/handoff/05-chatgpt-steering-prompts.md`*

## BREACH: how to steer ChatGPT (prompts for the owner)

These are copy-paste prompts for running the design work in a ChatGPT project and keeping it on track. They cover the setup, the project instructions, one prompt per task, prompts to correct drift, image steering, and the package to bring back to Claude.

---

### 1. Set up the ChatGPT project (once)

1. In ChatGPT, create a **Project** called `BREACH design`.
2. Add these **files** to the project. They are all in the repo https://github.com/mahikshith/breaker:
   - `docs/BREACH-ChatGPT-handoff.md`: everything (rules, art bible, story, research, history, build docs);
   - `docs/BREACH-blender-scripts.md`: every Blender and art script, with an index explaining each one;
   - the images in `docs/reference/`, `docs/screens/` and `docs/drafts/` (optional, but helps a lot).
3. Optionally, connect **GitHub** (Settings → Connectors → GitHub) so ChatGPT can read the live repo.
4. Paste the block below into the project's **Instructions** field. Those instructions apply to every chat in the project.

#### Project instructions (paste into the project's Instructions field)

```
ROLE
You are the lead game designer and art director for BREACH, a premium portrait brick breaker for
iOS and Android (repo: github.com/mahikshith/breaker). The owner is mykee. You do DESIGN ONLY.
An engineer (Claude) builds everything you design, in JavaScript/Canvas and in Blender 5.2 (Cycles),
using the existing scripts in BREACH-blender-scripts.md. You never write or change game code.

SOURCES OF TRUTH (read before every task, in this order)
1. BREACH-ChatGPT-handoff.md, Part A (design brief) and Part B (these steering prompts).
2. Part C (story plan, research), Part E (owner rules, palette, progress log), Part F (architecture
   and art pipeline), Part G (environment and UI/UX rules).
3. BREACH-blender-scripts.md: how the existing art is actually built. Every character or asset you
   design must be buildable the same way: KayKit chibi rig, the princess face-rig approach, the shared
   material and light rig of render_vault_assets.py.
If anything conflicts, the owner's rules (Part A section 2, Part E section 1) win.

NON-NEGOTIABLE ART AND UX RULES
- Premium, inventive, urgent, addictive. Nothing generic or "vibe-coded".
- Glossy rendered look: glazed-ceramic bricks, vinyl-toy characters, chrome paddle and ball, warm key
  light from the top-left, cool fill from the right, pink bounce from below, AgX Medium High Contrast.
- Expressions must say a lot: big eyes with lids, brows and a reshaping mouth on every character.
- Backgrounds stay calm, dark and desaturated, and never outshine the gameplay.
- Not too much yellow: gold and yellow are accents only. Cage bars are dark iron, not gold.
- Fonts: Lilita One for game text (dark outline 0.16 x size plus a drop shadow), Rubik for numbers.
- Only palette colours from Part A section 4 (hex), or new ones in the same family, stated as hex.
- Rejected forever: pixel art, wisps, jittery foxes, ball-chain snake bodies, round blob heads,
  flat clip-art, uniform faces.
- Mobile: 360 game units wide; iPhone 393x852 and Android 412x915; nothing inside the notch, status
  bar or home-indicator areas; 44 pt touch targets; paddle above the thumb.

HOW TO WORK
- One task at a time, in the order of Part A section 6. Don't start the next task until I say "locked".
- For every open choice, give 2-3 options in one short line each, with your recommendation marked.
- Make concept images with the style block in Part A section 4, then iterate with me.
- Every final deliverable follows Part A section 7 exactly: one Markdown file per task, hex colours,
  sizes in game units, times in seconds, animations as property from -> to, duration, easing, and
  dialogue as JSON. End each file with "Open questions for Claude".
- Before calling anything final, run the self-review checklist in Part B section 6 and fix what fails.
- Keep a running "Design lock" list (names, colours, proportions, decisions I approved). Repeat it at the
  top of each final file, and never change a locked item unless I ask.

NEVER
- Never invent features beyond the task. Put ideas under "Ideas for later" instead.
- Never change game rules or the story canon (Part C) without asking me first.
- Never write code for the game, and never ask for or handle tokens or passwords.
- Never add AI attribution text to anything meant for the repo.
```

---

### 2. Start the first chat

Paste the "First message" from Part A, section 1. Then paste the Task 1 prompt below.

---

### 3. Task prompts (one chat per task works best)

#### Task 1: Prince Kit

```
Task 1: design Prince Kit (Part A section 6, Task 1).
Context: Kit is Lumi's childhood best friend, the courtyard bounce-game champion, an underdog the court
laughs at. His old courtyard paddle (battered wood + chrome, stitched grip) becomes the game paddle.
He is built from KayKit kk_Knight.glb with the same face rig as Princess Lumi (see princess.py in
BREACH-blender-scripts.md: glossy eyeballs, iris/pupil/two catch-lights, skin lids with lash line,
brow strokes, mouth decal, blush).
Steps:
1. Give 3 different directions for Kit (silhouette, outfit, dominant colour, personality in 3 words),
   each one paragraph, plus one concept image each. Recommend one.
2. After I pick, make the turnaround (front, 3/4, side, back) and the 8-expression sheet mapped to:
   determined (serve), focused (catch & aim), grin (combo), shock (life lost), worried (danger high),
   cheer (win), hurt (hit), laugh (titan).
3. Write build notes for Claude: which Knight parts to remove, keep or add, a hex colour for every
   material, the face-rig settings per expression (lids, brows, mouth shape, gaze), and which KayKit
   animation to use per game moment.
Rules: he must read differently from Lumi at 42 units tall; minimal yellow; chibi proportions with the
head about 40% of height.
```

#### Task 2: Prologue

```
Task 2: write the prologue (Part A section 6, Task 2), skippable, about 60 seconds, 5-6 panels.
For each panel: shot/camera, characters, KayKit animation name, expression, background, lighting,
caption (12 words or fewer), speech bubbles (10 words or fewer), sound cue, duration in seconds, and the
transition. Beats: sunset courtyard game, the court scoffs, the sky darkens, the Clank toys turn, the
beam takes Lumi, Kit grabs his paddle, then straight into Invasion's first serve (the tutorial lives
inside the story).
Give two versions: "heartfelt" and "funny". Recommend one. Make one rough storyboard image per panel
for the version I pick. Deliver the panels as JSON too.
```

#### Task 3: Story beats in the levels

```
Task 3: the in-level story beats (Part A section 6, Task 3). Each beat is 3-6 seconds: speaker,
expression name from that character's existing set (see Part F: robots, mothership, serpent,
princess), the line (10 words or fewer), 2 alternative lines, camera move, timing, and the sound.
Beats: Invasion intro, Zorvax mid-boss taunt, Invasion win (decoy reveal, beam takes Lumi), Invasion
lose, Vault intro (Gnash wakes, Lumi signals Kit), Lumi at 40% and 70% danger, Vault win ("My turn."),
Vault lose ("GOT HER!" already exists), and the "to be continued" Chapter 3 tease.
They must never block play for more than 2 seconds. Say which beats pause play and which play over it.
Output as a JSON array plus a readable table.
```

#### Task 4: Results screen and Shine

```
Task 4: spec the new results screen (Part A section 6, Task 4) for iPhone 393x852 and Android 412x915,
in game units on the 360-wide grid. Include: score count-up, star pop-ins, Shine earned (1 per 100
points plus a star bonus), a short slot-machine Shine reveal (1.5 s or less, tap to skip), and a "next
unlock" progress bar. For every element give x, y, w, h, font, size, hex colour, states, and animation
(property from -> to, duration, easing, delay), plus the sound cues.
Make a mock-up image of the final screen in the game's style, plus a second image mid-animation.
```

#### Task 5: Chapter select

```
Task 5: spec the chapter-select map (Part A section 6, Task 5): a vertical path from the Prologue to
Chapter 2, with Chapter 3 locked as a silhouette. Each node shows stars, best score and lock state.
Brickhaven's dark skyline sits at the bottom (it will light up in Phase 3). Same precision as Task 4.
Show it scrolling, a node being tapped, and the locked-node tap feedback. Mock-up images included.
```

#### Task 6: Voice sheets

```
Task 6: voice sheets for Zorvax and Gnash (Part A section 6, Task 6). Personality, speech style, and 10
short lines each (taunts, hurt, panic), each with an expression name from the existing sprite set.
Zorvax is smug and theatrical, secretly lonely; hint at the twist exactly once. Gnash is hungry and
gleeful, short words, hissing. Also give 6 lines for Lumi (scared but brave) and 6 for Kit (underdog,
determined, a bit funny). Output as JSON.
```

---

### 4. Steering prompts (when the output drifts)

| When this happens | Paste this |
|---|---|
| It looks generic or templated | `This reads as generic. Push it 3 steps more distinctive: give the silhouette, colour and expression one memorable idea each, then redo it. Check it against the owner's "not vibe-coded" rule.` |
| Too much yellow or gold | `Too much yellow. Cut yellow and gold to accents under 10% of the frame and rebalance with the palette in Part A section 4. List the hex values you changed.` |
| The background is too busy | `The background competes with the gameplay. Darken and desaturate it (owner rule: calm, dark, never outshines the foreground) and remove decorative lights.` |
| Expressions are weak | `The expressions don't say enough. Exaggerate them toy-style: bigger lid and brow changes, mouth shapes that read at 42 units tall. Show each beside the neutral face.` |
| It invents extra features | `Stay inside this task. Move extras to "Ideas for later" and give me only what Task N asks for.` |
| Specs are vague | `Too vague for the engineer. Give every element x, y, w, h in game units, hex colours, font sizes, and animations as property from -> to, duration, easing.` |
| It contradicts the story or rules | `Check this against Part C (story canon) and Part E section 1 (owner rules). List every conflict, then fix them.` |
| Too many options | `Pick one. Give your single recommendation and one sentence of why.` |
| Images drift between versions | `Keep the character lock exactly: same proportions, hair, outfit colours and paddle. Change only what I asked.` |
| Before locking anything | `Act as a harsh senior art director for a premium iOS game. Critique this against the brief, list the top 5 problems, fix them, and show the revised version.` |
| To lock a decision | `Locked: <thing>. Add it to the Design lock list and never change it unless I ask.` |

---

### 5. Steering concept images

- **Start every image prompt with the style block** in Part A, section 4.
- **Character lock:** once you like a character, ask ChatGPT for a "character lock paragraph" covering proportions, colours with hex values, hair, outfit, props and face. Start every later image prompt for that character with that paragraph.
- **Change one thing at a time:** "same image, only change the scarf to teal `#22C4B0`".
- **Sheets:** ask for one sheet image (turnaround or expression grid) rather than separate images, so the lighting stays identical.
- **Backgrounds:** use a plain dark navy `#141831` for character art, so the colours read the same as in the game.
- **Concept art is reference only.** Claude re-renders the final art in Blender so it matches the rest of the game, so don't polish concept art for hours.

---

### 6. Self-review checklist (ChatGPT runs this before "final")

```
Before final, check and report pass/fail for each:
1. Follows every owner rule (Part A section 2)?
2. Colours only from the palette family, all as hex, yellow under 10%?
3. Expressions readable at 42 units tall (about 1 cm on a phone)?
4. Text: 6 words or fewer per pop, 12 or fewer per caption, Lilita One?
5. Nothing interactive in the notch, status bar or home-indicator areas; 44 pt targets?
6. Buildable with the existing pipeline (KayKit rig, princess face rig, shared light rig)?
7. Matches the story canon (Part C)?
8. Every number in game units, seconds or hex, with no "about" or "nice"?
9. File follows Part A section 7, starting with the Design lock list and ending with "Open questions
   for Claude"?
Fix every fail, then show me the final.
```

---

### 7. Package for Claude (end of each task)

```
Package Task N for Claude: one Markdown file named design/phase1/<NN>-<slug>.md following Part A
section 7 exactly (Design lock list at the top, then the spec, JSON blocks, image list, and "Open
questions for Claude" at the end), plus the final images named design/phase1/img/<NN>-<slug>-<n>.png.
Give me the Markdown as a downloadable file and list the images to download.
```

Then bring the file and images to the Claude Project thread and say **"build Task N"**. Claude builds it, playtests it at both phone sizes, and shows you screenshots.

---

### 8. Codex as the builder (saves the most Claude usage)

Building is where most of the usage goes: rendering, coding, playtesting and fixing. To save Claude usage, let **Codex** build, and use Claude only for reviews or hard problems.

**How the pieces connect:** through the GitHub repo. Codex works on the repo directly and reads `AGENTS.md` at its root automatically. That file points it to every handoff doc and rule. ChatGPT Projects and Codex don't need to talk to each other: the design files go into the repo, and Codex builds from there.

1. **Design** in the ChatGPT project, then download the packaged files (section 7).
2. **Put them in the repo** under `design/phase1/`. Either upload them on github.com (Add file → Upload files), or give them to Codex and ask it to add them.
3. **Build:** open Codex and give it the prompt below. Use the Codex app, or the CLI in a local clone (`git clone https://github.com/mahikshith/breaker`).
   - Blender rendering needs Python 3.13 and `pip install bpy==5.2.2`.
   - A local clone on your computer is the safest place to run Blender. Cloud Codex may work too if its environment can install bpy, so test it with one small render first.
4. **Review** the screenshots it shows you. Merge only when you're happy.
5. **Don't run Codex and Claude on the repo at the same time.** If you do bring Claude back, say so, and Claude pulls the latest `main` first.

**The ChatGPT project does not start Codex or control Blender by itself.** You open Codex and give it the work. Codex runs Blender headless through the Python scripts, so the Blender app is not needed.

One-time setup on your computer:

1. Install Git, Node.js 22 and Python 3.13. bpy 5.2.2 needs Python 3.13.
2. Open Codex: in the ChatGPT desktop app, switch to the **Codex** view from the top-left menu (or use the CLI, `npm install -g @openai/codex`). Create a Codex project as **Local**, not Cloud, so it runs on your computer where Blender can run. A Codex project is a code folder, separate from a ChatGPT Project; the GitHub repo connects the two.
3. Run `git clone https://github.com/mahikshith/breaker` and open the folder in Codex. Codex reads `AGENTS.md` automatically.
4. Tell Codex: "Set up this repo exactly as AGENTS.md says (npm install, a Python 3.13 venv with bpy 5.2.2, pillow, numpy, Playwright), then run npm run build and npm test."
5. Tell Codex: "Render one test frame with `python3 art/princess.py out/test Idle:1` and show me the image." If you see the princess, Codex can drive Blender.

For each task:

6. Package the design in ChatGPT (section 7). Copy the files into `design/phase1/`.
7. Paste the starter prompt below, ending with `Task: design/phase1/<file>.md`. Steer Codex with the prompts in section 4.
8. When you approve, tell Codex to commit as mahikshith on `codex/<task>`, push, and merge. Open `dist/breach.html` in a browser to play.

Codex starter prompt:

```
You are working in the BREACH repo (github.com/mahikshith/breaker). Read docs/BREACH-ChatGPT-handoff.md
fully, especially Parts E-G, and docs/BREACH-blender-scripts.md. Work only on a new branch
named codex/<task>. Never commit to main.
Set the git identity first: git config user.name mahikshith; git config user.email mahikshith97@gmail.com.
Never add AI attribution to commits or files.
Render with Blender as a Python module (pip install bpy==5.2.2, Python 3.13), headless, reusing the existing
material/light rig from art/render_vault_assets.py and the face rig approach from art/princess.py.
Strip PNG metadata before committing (command in Part F section 3), run python3 tools/pack_art.py and
npm run build, then show me the rendered sheet images before committing.
Task: <paste the locked design file from design/phase1/>
```

**Steering Codex:** the drift prompts in section 4 work for Codex too. Also ask it to "show me the rendered sheet and in-game screenshots at iPhone and Android sizes before committing" after every asset.

**Watching Blender live:** the Blender MCP add-on lets an AI app drive a Blender window you can watch. It works with Claude Desktop, Claude Code, Cursor and VS Code, and with Codex through its MCP config; Part A, section 9 has the details. It's optional and not needed for the plan above.


---

# Part C: Story mode plan, research and roadmap

*Source: `docs/STORY_PLAN.md`*

## BREACH Story Mode and Next Level Plan

**Current implementation (2026-10-19):** The owner approved heavy rounds and three-shot salvos, per-ship colours, left/right/paired/rest batteries, stronger player fire, Vesper/Latch for Circuit, a new power chooser and difficulty tuning. These changes are implemented on `codex/space-combat-apk`. The owner subsequently delegated remaining design decisions and requested a new princess/Yeti encounter, full documentation, commit/push and an APK. Frost Warden is integrated and locally verified as the fifth chapter; Brum remains an ally. Read `docs/CONTINUE_HERE.md`, `docs/SPACE_COMBAT_HANDOFF.md`, `docs/BRUM_LEVEL_PLAN.md` and `docs/MOBILE_PREVIEW.md` for current mechanics and verified release status. Older review gates and localhost checkpoints below are historical. No new CI success is claimed until recorded in the release document.

**Historical cannon correction before implementation (2026-10-19):** The owner rejected the4189 weapon studies. Enemy cannon fire must cross the intact brick field and threaten the paddle/craft, without breaking bricks or releasing their rewards. Carrier currently damages enemy-hit panels; Circuit/Forge currently absorb shots on cover. These behaviours must change in the approved implementation, while preserving player brick collisions and keeping Carrier boarding threats active. Circuit's centre is an exit iris, with no suction mechanic; the replacement presentation keeps it quiet until departure. The revised cannon comparison is at4190, stronger friendly skiff deployment/fire at4191, and reference-backed distinct companion proposals are recorded alongside them. See `design/phase1/weapon-vfx-v3-review.md`. The4188 playable checkpoint remains unchanged; visual approval is still required before implementation, commit/push or APK work. The previous4189 quality receipts certify only that historical study, which is now rejected.

**Current selected effects and power limits (2026-10-18):** Ship A magnetic extraction/plasma and Kit B single-row Quick Volley are implemented in the4188 review hub. Kit offers real Brick Ward, Arrows, canonical Cosmic and Ball Fan while retaining the face control. All three space levels use slower18/22/26 banked hit/active-second charging. Companion casts and ball pickups now obey mode caps:12/9/5 live balls,2/2/1 simultaneous Cosmic,20/18/14 maximum remaining special seconds. Saturated choices keep charge. All196 units,24 actual Main phone/mode cases (including66 Kit check groups), required polish/layout and compact mobile UI pass with zero page errors. Six coarse earned Easy attempts win with3lives; they are not human balance. Exact builds, screenshots and receipts are sealed in `out/space-selected-review/final-report.json`. The owner rejected both subsequent Hard laser/lance/battery boards as stale and visually mismatched. Their replacement is an isolated moving weapon study using the original cannon art and new rendered payloads; gameplay implementation remains explicitly withheld until the owner approves the visuals. Current normal plasma still uses the existing3.5u collision core. See `design/phase1/space-selected-review.md`. Older4186/4187 and the delivered APK are unchanged; no new gameplay commit/push or APK is implied.

**Historical pacing revision before the selected FX/Kit build:** The owner finds the six-hit space-power revision too short. All three space levels now bank18/22/26 ordinary damage credits and fill the orb over at least18/22/26 active combat seconds; shots/cosmic balls cannot recharge themselves. WIDE stacks width and time, other positive durations add, ball fan adds ordinary survivors, and canonical cosmic artwork is restored. Actual paddle artwork now widens with its collider while preserving chrome ends. The pacing-only hub is127.0.0.1:4187; older4186 and the APK remain frozen. Three level owners supplied earned Easy routes and native render proofs; scripted durations are not human balance. All183 units, final18 Main phone/mode cases, required polish/layout and compact mobile UI pass with zero page errors; exact artifacts are sealed in `out/space-polish-review/final-report.json`. Two ship-effect proposals and two Kit menu proposals have been shown, with owner picks still pending. New suction/cannon FX and live Kit power choices are therefore not yet built. See `design/phase1/space-polish-review.md` for rules, receipts and limits. No commit/push: the latest message both authorizes push and then asks to wait; resolve that after the complete result is reviewable.

**Historical six-hit space revision (superseded by the current pacing revision):** The owner rejects the earlier Circuit/Forge Easy balance as a precision/patience grind. New review candidates retain the selected visual families but provide broad mothership damage, equal-sized coloured panels, fewer grey pieces and Nix in all three space levels. Six productive ordinary damage contacts earn a paused three-choice picker: ten-second LASER, ten-second UNSTOPPABLE, or fill the live set to5 ordinary balls. Shots/TITAN do not self-recharge. Closed Forge machinery takes damage; Circuit drops the ordered-symbol gate and retains an earned skiff burst; ordinary ship metal hits remain productive. Carrier retains crew urgency and uses a curved connected tractor beam and matching pull. Shared input resets prevent stale taps/Space from launching; pause Retry stays. New browser review hub is127.0.0.1:4186, with all three modes per level; older4184/4185 and the delivered native APK stay frozen. All171 tests and the local build pass. Final18 actual Main CDP cases cover three levels ×three modes ×both phones, with visible Nix, choice/cancel, frozen clocks, powers, pause and Retry; zero page errors. Required polish/layout and compact mobile UI pass. Exact final artifacts are Carrier9f772abdf382, Circuit983c8c0328d0, Forge7c8df65c5f23; sealed hashes, gallery and receipts are in `out/space-power-review/final-report.json`. Circuit/Forge coarse Easy public-input-assisted completions with earned choices are separate evidence, not human balance. Carrier curved-motion media is explicitly staged. Full rules and receipt links: `design/phase1/space-powers-review.md`. This supersedes earlier balance/target rules, not the approved artwork. No gameplay commit/push or new APK approval.

**Artwork preservation:** `artwork-library/` now preserves750 unique originals/asset records (770 source aliases/versions, 288042628 bytes), with a complete catalogue, full SHA256 manifest and preserved A/B/C/D space-board gallery. See `docs/ARTWORK_LIBRARY.md` and `artwork-library/README.md`; AGENTS.md links the folder and requires `python tools/archive_artwork.py` after adding artwork. Copies are byte-exact, duplicates share one copy, and changed sources create new versions; historical rejected concepts remain labelled. Working manifests/render scripts stay at their existing paths. The archive is local until an approved push or separate backup.

**Historical selected space reviews (superseded by later owner difficulty feedback):** Owner-selected Circuit Breakout Level2 and Shutter Forge Level3 are now actual-art playable isolated candidates. Circuit HTML `9115383E4F4963F86C11A7063A07A50B10FC1B7347F5425AC4C972D39202FDCE`, sourceEEB862BC…, is served at127.0.0.1:4184/circuit.html?level=1&difficulty=medium. Forge HTML `E8F06046E4B224C1EF790F59F4124661583ABC1F5D141583ED0B44A46118F97F`, source89B1E8A1…, is served at127.0.0.1:4185/forge.html?level=1&difficulty=medium. Both use fresh Main controls, house fonts, real Resume/Retry/Menu and semantic result titles; previews have no companion/pilot/captive art. All147 configured tests pass, including20 independent new-level regressions. Both packed previews pass actual Chromium phone-size touch, pause, Retry, geometry and visual checks with zero page errors. Circuit earned runs win50.2667s iPhone /28.0417s Android, three lives: both use the selected intrinsic flight burst, Android also naturally collects SPLIT/LASER. Forge strict ordinary completions are162.88s iPhone /260.0417s Android, three lives, no optional capsule/TITAN/Continue; Android uses a legitimate wall-bank input policy. Earlier failed policies remain retained. These are scripted route proofs, not human balance or physical-device performance. Actual motion fixtures are explicitly staged. Details: `design/phase1/relay-circuit.md`, `orbital-forge.md`; independent review: `out/next-level-review/REVIEW.md`; phone galleries: `out/selected-levels-review/`. Human screenshot/play OK is still required before gameplay commit/push, permanent registry admission or a new APK. Existing frozen F8EB pause-Retry checkpoint4183 and delivered APK remain unchanged. The final local `npm run build` also passes at `EB70331AD2A520D35E9DFB0EDF4F6539D68CD455ACF814D70920061D7B780547`; it includes the shared no-core charge guard but retains only the existing two menu levels. Phone review receipts belong to their exact frozen previews above, not an untested new APK.

**Pause Retry checkpoint (2026-10-18):** Owner explicitly requests Retry inside pause. Current Main uses the existing fresh constructor on the same level/difficulty; Continue/ad/result/input state and the frame origin reset while saved stars/preferences stay intact. Three stacked Resume/Retry/Menu buttons fit both phone safe areas. Two independent regressions and12 real CDP cases (Carrier/Vault ×three modes ×both phone sizes) pass with zero page errors on exact HTML SHA256 `F8EB9BE20BDD854546944BF941CBB139FE97887505094A46B33732FAA6ECB9E0`. Frozen review is `out/pause-retry/browser/breach.html`, served at127.0.0.1:4183/breach.html?difficulty=medium. Evidence: `out/retry-review/final/report.json` and `out/retry-review/REVIEW.md`. This proves the two existing menu levels; selected Circuit/Forge will need the same real-input checks after their isolated build is ready. No new gameplay commit/push or APK change.

**Owner human balance feedback (2026-10-18):** The owner finds earlier BA5E Carrier too easy and Vault too hard, then selects a MIX of boosted retreat and finite rebuilding siege. That choice is implemented in the new review candidate; the old pure A/B choice is closed. Easy/Medium/Hard share controls and the lower reaction lane. Vault locomotion/chew multipliers are0.60/0.80/1.00; warning, venom, cage and ball/input timing stay intact. Hard Carrier is a development setting pending calibration, not approved balance. No new gameplay commit/push approval has been given.

**Carrier pacing revision (2026-10-18):** Selected Boarding Raid is followed by the owner-selected boosted retreat/finite siege hybrid. The new browser candidate needs owner play/screenshot OK; Hard still needs calibration. The separately delivered APK remains the earlier frozen checkpoint.

**Latest selection and tested candidate (2026-10-18):** Production HTML SHA256 `19376ED445F4D89CEA02CFF8733A5255DA14FD275DA3CAD9798155AA64516AA1` adds the selected hybrid to Boarding Raid: finite distinct manifests, active per-manifest jump clocks, permanent archived rescues, six-contact manual Nix, larger target-facing fighters, visible hull motion/engines, safe rebuilding and final boosted retreat or disabled cleanup. All128 units pass. Production two-phone real-input lifecycle checks, required polish/layout and compact mobile UI pass with zero page errors. Separately sealed isolated HTML `4F808C2A682885F6415325CBC89B064D63939FF277912ABD859D5AD048BC457D` uses identical gameplay source plus embedded fonts/read-only trajectory planning. At120Hz public level input, ordinary Easy wins40.400/42.700s; Medium ten-rescue wins109.725/125.600s, three lives, no pickups/Nix/Continue. These are scripted route proofs, not human balance, DOM routing or performance proof. Hard75s/8.5s has no strict ordinary full-clear admission; failed attempts and an unadopted90s/10s experiment are preserved. A separate bounded earned-Nix proof readies at8.667/12.325s with nine authored rescues remaining; iPhone cast run wins, Android cast run disables the hull then controller-times-out in cleanup, not a victory (`out/carrier-hybrid/nix-earned-report.json`). Primary changes remain uncommitted pending owner play/screenshot OK. Evidence: `out/carrier-hybrid/evidence.json`, `out/hybrid-review/production-decoded/report.json`, `out/carrier-hybrid/mobile-ui/report.json`. Earlier BA5E and4181 remain frozen history.

**Parallel levels authorized (2026-10-18):** The selected Circuit A and Forge A mechanics, source-faithful machinery families, actual moving collision and independent phone reviews are delivered as described above. Escort Run B and Orbital Switch B remain distinct later directions, numbers unassigned. Original B/C rescue prototypes are historical; selected design/source geometry and collision are authoritative now. The C lower hull lip remains physical: Forge uses its visibly deployed exterior reactor. Circuit uses four empty phase stations, real split-metal firing ports and one earned skiff burst; Forge uses three timed stabilisers, collapse, once-only ordinary three-ball reward and quiet external-reactor finish. No extra cast or permanent registry/progress migration is included. All new gameplay remains uncommitted pending owner approval.

**APK checkpoint delivered (2026-10-18):** Separate `codex/carrier-mobile-preview` CI [39129140498](https://github.com/mahikshith/breaker/actions/runs/39129140498) completed successfully on native fix47bc6b3. Actual APK artifact12137681701 is downloaded and verified at `../breaker-mobile-preview/out/carrier-apk-delivery/39129140498/apk/BREACH-Carrier-preview.apk` (2,431,097bytes, SHA256 `7F5468197BB6333BF5AACEBE4CF4226048D043634BCA8829B6644042C4F2E10D`). Web44units/six suites, native build/lint and lifecycle instrumentation pass; actual recreation captures show full1080×2400 content. Frozen gameplay F4863DC5… and packaged HTML4D5D7B5E… remain exact. Delivery documentation commitf72e7ccf follows tested47bc6b3 and is pushed as the owner. APK excludes Boarding Raid, Nix/Tick, difficulty/hybrid and B/C. Physical phone performance remains for owner testing. This checkpoint authorization does not approve primary gameplay commit/push or merging main.

**Current production scope (2026-10-18):** Carrier/Vault remain the only production menu entries in the new review candidate, now with remembered difficulty and isolated best-star records. Carrier retains125×17u/7.5r ordinary/10r TITAN; Vault retains70×12u/6r and exclusive Kit. Existing legacy stars migrate only to corresponding baseline modes, without erasing saved mode progress. Input epochs consume stale paddle/Space/Nix gestures across serves/rebuilds. Real pause/background freezes active clocks. New Level2/3 directions are design proposals pending choices and have no live admission. Human approval remains required before new gameplay commit/push.

**Historical A/B asset milestone (2026-10-18):** real independent PNG parts and the isolated Canvas motion assembly are complete for the approved A/B left playfields. Final proof is under `out/space-assets-ab/final/`: `A-ios-reference.png`, `A-android-reference.png`, `B-ios-reference.png`, `B-android-reference.png`, `A-motion.gif`, `B-motion.gif` and `asset-report.json`. Actual 393×852/412×915 images and sampled launch/release/boarding/iris sequences pass independent visual review; all four capture runs report zero page errors, real alpha/metadata checks and approximately 126 CSS paddle reserve. A has five shallow captive windows; B has four large worker pods. This asset-only milestone contains no companions, pilots or portraits and predates the latest Nix/Tick selection. These are asset-motion proofs with a placement ball, not new gameplay: runtime admission/WebP sizing, actual-alpha collision alignment, input/combat/rescue/power rules, full playable phone runs, memory/performance and new APK checks remain. The proof milestone retains EA839F00… as its gameplay baseline; it does not cover later Carrier integration. Reproduction and limits: `art/space/ASSETS_AB.md`; inventory/contracts: `design/phase1/space-assets-ab-spec.md` and `space-assets-ab.json`.

Oct 18, 2026 · Live version: https://claude.ai/code/artifact/5278a4c8-b669-4235-972f-7814c32382d9

**Current direction (2026-10-18):** Phase1 remains approved. Carrier A now uses selected Boarding Raid in the tested browser candidate above; the earlier visual/control checkpoint alone is being packaged for APK. B/C prototypes remain isolated; D, Brum/Vesper and later progression retain their bounded status. New gameplay requires owner review before commit/push.

### The pitch

An alien collector steals the princess of a kingdom built from glossy bricks. The only one who can bring her back is the young prince everyone laughed at for playing the courtyard bounce game.

Every brick you break in BREACH sends a spark of light home. That light is your score. It rebuilds the kingdom, and it buys the next weapon. One rule ties story, store and progression to the thing players already love doing.

Each session should end on three hooks, the pattern the research below keeps finding:

- **A cliffhanger:** the next chapter is teased.
- **Something visibly rebuilt:** the light earned in the run shows up on the home screen.
- **An unlock almost in reach:** a weapon or skin is only a short run away.

### What the research says

The hits share three habits: runs never feel wasted, power grows every few seconds, and something new is always one run away. BREACH already has the moment-to-moment juice. What it lacks is the layer between runs.

| Game | What hooks players | What BREACH takes |
| --- | --- | --- |
| [BALL x PIT](https://gameinformer.com/review/ball-x-pit/breathtaking-brick-breaking) (8.75/10, Game Informer) | Ball fusions and evolutions, heroes that each change how you aim, and a town rebuilt between runs with blueprints. Runs last about 15 minutes. Its weak spot is having to beat every level several times before progressing. | Power-up fusions, a kingdom rebuilt with Shine, and heroes with different paddles. Unlike BALL x PIT, never force replays to progress. |
| [Arkanoid](https://strategywiki.org/wiki/Arkanoid/Gameplay) | Seven readable capsules: laser, enlarge, catch, slow, break (exit to the next stage), disruption (split into 3) and an extra life. | Keep capsules instantly readable. Add a BREAK-style escape hatch as a rare, thrilling drop. |
| [Holedown](https://www.macstories.net/reviews/game-day-holedown/) ($3.99 on iOS, no in-app purchases) | Crystals earned only by playing buy more balls and more shots. An endless Black Hole mode follows the story. You can quit any time without losing progress. | Proof that a paid iOS ball game can thrive on fair, earned upgrades. Add an endless mode after the story. |
| [Vampire Survivors](https://jboger.substack.com/p/the-secret-sauce-of-vampire-survivors) | A reward roughly every 23 seconds, slot-machine chests, and gold that carries over into permanent upgrades. You play the overpowered hero. | Frequent small rewards, a chest-like reveal on the results screen, and permanent but small upgrades. |
| [Archero](https://www.deconstructoroffun.com/blog/2019/8/9/why-archero-banked-25m-but-leaves-25m-hanging-hlx9n) and [Survivor.io](https://naavik.co/deep-dives/survivorio-archeros-footsteps/) | Pick 1 of 3 random skills at each level-up. Gear, talents and chapters unlock in order. Archero launched near 80% day-1 retention and settled in the mid-40s, about 10% by day 30. The critique: late upgrades felt too small and too slow. | A roguelite Raid mode with 1-of-3 picks between stages. Keep late upgrades meaningful. |
| [Peglin](https://adrianhon.substack.com/p/peglin) ($8.99 to $14.99, premium) | Orbs and relics that bend the rules. The critique: too many items, too early, for newcomers. | Introduce one new power-up per stage, with a codex, so nothing overwhelms. |

**Retention targets.** Puzzle games average about 32% of players returning on day 1, 12% on day 7 and 5% on day 30 ([Segwise, Mistplay data](https://segwise.ai/blog/mobile-gaming-app-user-retention-strategies)). Two other findings from the same source:

- Good onboarding can lift retention by up to 50%.
- About 60% of players quit when difficulty spikes too early.

BREACH should aim for 40% on day 1, 15% on day 7 and 6% on day 30. Those targets assume a strong first five minutes and an early story hook.

### Story bible

The whole story rests on one idea: **the bricks are alive with light, and the princess is the light.** That single rule explains why you break bricks, why she was taken, and why the serpent eats walls.

#### The world

Brickhaven is a kingdom built entirely from starglass, glossy bricks that glow and hold together only while the Lightsong is sung. Princess Lumi is the Keystone, the one person in each generation born able to sing it. When a brick loses its light, it cracks and fades. That is why single bricks crumble in the game.

#### Why she was taken, and why a space prison

Zorvax the Curator travels the galaxy in his mothership, collecting one-of-a-kind wonders for the Menagerie. The Menagerie is a moon-sized prison museum, and he built it from bricks stolen from a hundred worlds.

Stolen bricks go dark, so the Menagerie keeps crumbling. Zorvax needs a Keystone to hold it together, so he takes Lumi and locks her in its heart, the Vault. The prison is literally held up by her light. Every wall you break sets a little of it free.

#### Why aliens, robots and creatures

- **The robots (Clanks)** are Brickhaven's own toy workers, hijacked by the mothership's signal. You never destroy them. A hit snaps them out of it, which is why they go dizzy and fall. Freed Clanks come home and help rebuild.
- **The serpent (Gnash)** is the Vault's warden. It is bred to eat starglass, with one order: if anyone frees the Keystone, swallow her first. That is why it chews toward her cage and grows as it eats.
- **The creatures** are the Menagerie's other exhibits, beasts stolen from other worlds. Each guards a wing of the prison: a dragon who melts bricks into lava, a kraken frozen in a comet, a phoenix in a solar furnace. Some can be freed and become companions.

#### The hero

Prince Kit is Lumi's best friend from the neighbouring isle. As kids they invented the bounce game in the palace courtyard, and he never stopped playing it. The court calls it a waste of time. When the sky goes dark, his old courtyard paddle is the only weapon that can break starglass without shattering the light inside.

This gives players an underdog they relate to: the kid whose "useless" game turns out to be the one skill that matters.

#### The princess is not waiting

Lumi is scared, and players see it, because she paces and panics in her cell. She is also brave. She taps signals through the walls, steers power-ups toward Kit with her song, and in Chapter 3 she becomes playable to break out alongside him. The tagline earns both halves: Kit breaks in, Lumi breaks out.

#### The twist

In the final chapter, Zorvax's secret comes out. His own world went dark long ago, and he collects light so he never has to be in the dark again. Lumi chooses to share the Lightsong instead of taking revenge. Zorvax's world relights, and he reopens the Menagerie as a curio shop: the endgame store with the rarest skins.

#### Cast

| Character | Who they are | What they want | In the game now |
| --- | --- | --- | --- |
| Prince Kit | Lumi's childhood friend and the courtyard bounce-game champion | To bring Lumi home and prove the game mattered | New: the playable hero, built from the KayKit Knight model |
| Princess Lumi | The Keystone, whose song keeps Brickhaven's bricks alive | To escape, and to protect Kit | Exists: nervous and panic animations in the Vault; playable from Chapter 3 |
| Zorvax the Curator | The alien collector on the mothership | Never to be in the dark again | Exists: the mothership boss with five expressions |
| The Clanks | Brickhaven's toy workers, hijacked | To be freed and go home | Exists: the 4-colour robot formation |
| Gnash | The Vault's brick-eating warden serpent | To swallow the Keystone before she escapes | Exists: the growing, accelerating serpent |
| Ember, the Kraken, the Phoenix | Exhibits guarding the Menagerie's other wings | Freedom, or revenge on whoever opens their cage | New: later chapter bosses |

### Chapter map

The two finished levels become the climax stages of Chapters 1 and 2. Each chapter adds one new mechanic and ends on a cliffhanger that only the next chapter resolves.

| Chapter | Setting | New mechanic | Boss | Story beat that pulls you on | Status |
| --- | --- | --- | --- | --- | --- |
| Prologue | The palace courtyard at sunset | The basic bounce game, catch and aim | None | Kit and Lumi play their game, then the sky goes dark. Skippable comic panels, about 60 seconds. | New |
| 1. Invasion | Brickhaven's skies | A marching formation that shoots back | Zorvax's mothership | Kit wins, but the mothership was a decoy. A tractor beam lifts Lumi into the stars. | Built (climax stage) |
| 2. The Vault | The Menagerie's prison core | A rescue race against a brick-eating serpent | Gnash | Kit reaches the cage just in time. Lumi steps out and says "My turn." | Built (climax stage) |
| 3. Break Out | The collapsing prison corridors | Lumi playable; the stage scrolls down as walls fall (Holedown-style descent) | The Warden Core | They escape the Vault, only to find it is one wing of many. | New |
| 4. The Dragon Wing | A volcanic furnace wing | Lava bricks that re-harden; fire spreads | Ember the dragon | Ember is freed and joins as a companion. | New |
| 5. The Comet Dock | An ice comet tethered to the Menagerie | Frozen balls, cracked ice floors, slippery paddle | The Kraken | The map to Zorvax's gallery is found inside the ice. | New |
| 6. The Gallery | Zorvax's throne of stolen light | Every mechanic mixed together | Zorvax, three phases | Lumi shares the Lightsong, and Zorvax's world relights. | New |
| Endless | The Deep Vault | A procedural dig with a leaderboard | A rotating boss | Unlocked after the story; it keeps players coming back. | New |

Each chapter is 6 stages: 4 short stages of about 90 seconds, a mid-boss stage, then the climax. Each stage has 3 stars. Mobile sessions stay at 2 to 5 minutes, and a whole chapter fits a commute.

### Heroes, weapons and skins

Heroes change how a run feels, weapons change what the paddle does, and skins only change looks. Heroes and weapons are always earned through play. Skins can also be bought. That keeps BREACH fair and premium.

#### Playable heroes

| Hero | Passive ability | How to unlock |
| --- | --- | --- |
| Prince Kit | Balanced. Catch and aim gets one extra AIM pip. | From the start |
| Princess Lumi | Her song fills the titan core twice as fast. Power-ups drift toward the paddle. | Finish Chapter 2 |
| Pip the Clank | A freed robot. Its paddle fires a slow auto-bolt every 3 seconds. | Free 100 Clanks in total |
| Granny Mortar | The royal mason. Her ball hits armour bricks twice per bounce. | Rebuild the Masons' Hall |
| Ember | The freed dragon. Every 8th paddle hit sets the ball on fire. | Finish Chapter 4 |

#### Weapons (the paddle's special move)

Each hero equips one weapon. A weapon gives the paddle a tap or hold move with a cooldown. It is separate from the falling power-ups, so both can stack.

| Weapon | Move | Unlock |
| --- | --- | --- |
| Courtyard Shield | No move; a wider sweet spot | Start |
| Twin Blasters | Tap to fire two bullets, recharging | Chapter 1 boss blueprint |
| Magnet Gauntlet | Hold to pull the ball and capsules toward the paddle | 15 stars |
| Smash Hammer | Swing to send the ball back fast and piercing | Chapter 2 boss blueprint |
| Star Bow | Hold to charge and fire a piercing arrow ball | 40 stars |
| Lightsong Lute (Lumi only) | Hold to freeze every enemy for 2 seconds | Chapter 3 |
| Dragon Maw | Breathe a cone of fire that melts a row of bricks | Chapter 4 boss blueprint |

Locked weapons show as silhouettes in the armoury, each with a progress bar to its unlock. Players should always see the next unlock within reach. Weapons level up from 1 to 5 with Shine and blueprints, and each level gives a visible change, not just a few per cent.

#### Skins

Skins are cosmetic only: hero outfits, paddle skins, ball trails, and brick-break effects. Examples include Astronaut Kit, Pirate Lumi, the Candy paddle and a Neon trail. Each chapter adds a set. Some are earned from 3-star stages, some from daily challenges, and some are sold. Every skin is a Blender render, following the art rules already in place.

### Power-ups

BREACH already has 9 power-ups, including a multi-ball (SPLIT ×3, BURST +3) and paddle bullets (LASER). They drop rarely and look alike, which is probably why they go unnoticed. The plan adds 10 more, plus fusions, and introduces them one per stage so players are never overwhelmed.

#### Already in the game

SPLIT (×3 balls), BURST (+3 balls), FIRE (a piercing ball), WIDE (a wider paddle), AIM (catch and aim), LASER (paddle bullets), SHIELD (a safety line), SLOW (a slower ball), and TINY (a bad pickup that shrinks the paddle). The titan core is also there: a dead-centre hit makes a giant unstoppable ball.

#### New power-ups

| Power-up | Effect | Why it is fun |
| --- | --- | --- |
| MULTIPLY ×2 | Every ball on screen doubles, up to 24 | The multiplier you asked for. Catch two in a row for a screen full of balls. |
| GATLING | The paddle machine-guns bullets for 4 seconds | A louder, faster LASER for big walls |
| MAGNET | The paddle pulls the ball and capsules toward it | A safety net that feels skilful |
| BOMB | The next hit explodes a 3 × 3 area | Big physics crashes, the most satisfying moment in the game |
| LIGHTNING | The ball chains to every brick of the same colour | Rewards reading the wall |
| DRONE | A tiny Clank orbits the paddle and fires at enemies | A companion players get attached to |
| FREEZE | Enemies, bolts and the serpent stop for 3 seconds | A panic button in the Vault |
| PORTAL | Two portals open on the side walls | Wild new angles |
| ROCKETS | Six homing missiles hit the boss | Boss fights feel heroic |
| STAR | Bricks drop extra Shine for 6 seconds | Feeds the store loop directly |

Three new bad pickups keep tension: FAST (the ball speeds up), REVERSE (controls flip for 4 seconds), and DARK (fog covers the top half). Bad pickups keep the flashing red outline the game already uses.

#### Fusions

Catch two specific power-ups within 3 seconds and they fuse into something stronger, as in BALL x PIT and Vampire Survivors. Players discover fusions themselves, and a codex records each one the first time it happens.

| Fusion | Made from | Effect |
| --- | --- | --- |
| Firework | FIRE + SPLIT | Split balls explode on every hit |
| Bullet Storm | LASER + MULTIPLY | Every ball fires bullets upward |
| Gravity Well | MAGNET + BOMB | A black hole pulls bricks in, then bursts |
| Time Bubble | SHIELD + SLOW | Everything slows except you |
| Storm Titan | LIGHTNING + titan core | The giant ball arcs lightning as it pierces |
| Swarm | DRONE + BURST | Three drones join the paddle |

### Progression and store

Score turns into **Shine**, the one soft currency, at 1 Shine per 100 points, plus a bonus for each star. Shine rebuilds Brickhaven on the home screen, upgrades weapons, and buys skins. Boss stages also drop blueprints, which unlock weapons and buildings. There is no premium gem currency and no gacha.

```
Core loop: Break bricks in a run (score, stars, freed Clanks) -> Earn Shine and blueprints (paid out win or lose)
  -> Relight the kingdom (buildings, weapons, skins) -> Return stronger (new chapter, next cliffhanger) -> repeat
```

A loss still pays out Shine, so no run feels wasted, which is the Vampire Survivors lesson.

#### Rebuilding Brickhaven

The menu becomes the kingdom, dark and broken at first. Each building you relight gives one permanent perk, the BALL x PIT town idea in a lighter form.

| Building | Perk |
| --- | --- |
| Palace Bakery | +1 starting life |
| Forge | Weapon upgrades, levels 1 to 5 |
| Toy Workshop | Freed Clanks join as drones; unlocks Pip |
| Observatory | Power-up capsules drop 20% more often |
| Masons' Hall | Armour bricks start cracked; unlocks Granny Mortar |
| Lighthouse | +10% Shine from every run |
| Royal Wardrobe | The skin store |

#### Raid mode (the roguelite loop)

After Chapter 1, Raid mode opens. A raid chains 5 random stages from unlocked chapters. Between stages, you pick 1 of 3 upgrades, as in Archero: more balls, longer power-ups, stronger fusions. A raid lasts about 10 minutes. Losing still pays out Shine, so no run feels wasted.

#### Daily habits

- **Daily Breach:** one seeded stage, the same for everyone, with a leaderboard.
- **Daily chest:** free once a day, opened with the slot-machine reveal Vampire Survivors uses.
- **Weekly event:** a boss rush or a themed wall, with a skin as the prize.
- **Streaks:** gentle. A missed day pauses the streak instead of resetting it, so lapsed players are never punished.

#### Store and monetisation

The current model stays: watch an ad to continue, or unlock the full game for $2.99. On top of that:

| Item | Price |
| --- | --- |
| Skins | Shine, or $0.99 to $1.99 for premium sets |
| Boosters before a run (start with WIDE or SHIELD) | Shine, or watch an ad |
| Double Shine for one run | Watch an ad |
| Supporter pack (all chapter skins, no ads) | $4.99, optional |

Three fairness rules protect the premium feel:

1. No energy timers.
2. No weapon or hero can be bought with real money.
3. Ads are always opt-in and always reward the player.

Those rules also match the paid iOS hits in the research, Holedown and Peglin.

### What next

Start with Phase 1. It wraps the two finished levels in the story, adds Prince Kit, and makes every run earn Shine. Even before the store exists, the game then feels like the opening of an adventure rather than two demos.

```
Phase 1 · Story wrapper (start here): prologue comic, Prince Kit as the hero, story beats around Invasion and the Vault; Shine on results, saved progress, chapter select
  -- gate: owner playtests and approves --
Phase 2 · Power-ups and fusions: MULTIPLY, GATLING, MAGNET, BOMB, DRONE, FREEZE and four more, one per stage; six fusions with a codex
  -- gate --
Phase 3 · Brickhaven and the store: kingdom home screen rebuilt with Shine, Forge and weapons, skin wardrobe; Daily Breach, daily chest, opt-in ads
  -- gate --
Phase 4 · Chapter 3 and Raid mode: Lumi playable in the Break Out descent; Raid mode with 1-of-3 picks; Chapters 1-2 filled to 6 stages
  -- gate --
Phase 5 · The Menagerie and launch: Chapters 4-6 (Ember, Kraken, Zorvax), Endless Deep Vault; iOS/Android builds and store listing
```

Each phase ends with a build you play on your phone before the next one starts, the same rhythm as the polish rounds so far.

#### Decisions for you

1. **Names:** keep Kit, Lumi, Zorvax, Gnash and Brickhaven, or rename? Recommended: keep. They are short and easy to say.
2. **Kit's look:** an underdog courtyard kid with his old paddle, or an armoured knight? Recommended: the kid, because players relate to an underdog.
3. **Start:** begin Phase 1 now? Recommended: yes.
4. **Model:** keep watch-an-ad plus the $2.99 unlock, or charge upfront like Holedown? Recommended: keep the current model, since it lets more players in.

### Sources

Pages opened for the research, as of 18 October 2026:

- [Game Informer, BALL x PIT review](https://gameinformer.com/review/ball-x-pit/breathtaking-brick-breaking)
- [StrategyWiki, Arkanoid gameplay and capsules](https://strategywiki.org/wiki/Arkanoid/Gameplay)
- [MacStories, Game Day: Holedown](https://www.macstories.net/reviews/game-day-holedown/)
- [The Secret Sauce of Vampire Survivors](https://jboger.substack.com/p/the-secret-sauce-of-vampire-survivors)
- [Deconstructor of Fun, Archero analysis](https://www.deconstructoroffun.com/blog/2019/8/9/why-archero-banked-25m-but-leaves-25m-hanging-hlx9n)
- [Naavik, Survivor.io in Archero's footsteps](https://naavik.co/deep-dives/survivorio-archeros-footsteps/)
- [Adrian Hon on Peglin](https://adrianhon.substack.com/p/peglin)
- [GameAnalytics, six games that layer in meta mechanics](https://www.gameanalytics.com/blog/six-games-that-successfully-layer-in-meta-mechanics)
- [Segwise, mobile game retention benchmarks](https://segwise.ai/blog/mobile-gaming-app-user-retention-strategies)


---

# Part D: Original game plan

*Source: `docs/GAME_PLAN.md`*

## BREACH — Game Design Plan (v0.1, draft for review)

> Working title: **BREACH**. A premium brick breaker where every level is a rescue against the clock.
> Status: phase 1 (research, plan, first screen drafts). Nothing is built yet; this document is what we review before building.

---

### 1. The one-line pitch

**Carve an escape tunnel through a living mosaic of thousands of micro-bricks to free a trapped creature before the threat reaches it, then watch the whole structure collapse.**

Three feelings we sell, in order:

1. **Urgency** — something is coming for the creature you are trying to save, and you can see it move.
2. **Skill under pressure** — threading a ball into a narrow channel is a deliberate, learnable shot, not luck.
3. **Catharsis** — once you breach, balls multiply, chunks of the structure break off and crash down, and thousands of tiles explode in seconds.

---

### 2. What the reference clips get right (your screenshots)

The five screenshots show the "will the ball escape?" / brick-breaker brainrot format that has pulled tens of millions of views on Shorts, Reels and TikTok since 2022. We use them as a study of *why it is watchable*, not as a visual style.

| What is on screen | Why it hooks people | What we take | What we change |
|---|---|---|---|
| A huge field of **tiny bricks** (60×60+ cells) instead of 8 rows of fat bricks | Each hit removes a speck, so the field erodes like sand. Destruction looks *fluid*, and the count of things destroyed is enormous. | Micro-brick grid as the core material (around 48×72 cells on a phone). | Glossy glass and stone tiles with light and depth instead of flat squares; tiles chip and crumble instead of vanishing. |
| An **"impossible shape"**: a thin maze, ladder, cross or tree channel cut into the mass | Tension. The ball has to find the one narrow opening. Viewers lean in on every near miss. | Levels are *shapes* with channels, pockets and chokepoints. | The player can **aim and curve** into the channel (spin, see §4.3), so it is skill, not just a screensaver. |
| The **grey/yellow breach line** separating the mass from the open play area | A clear "inside vs outside". The moment the ball gets *inside* is the payoff. | Every level has a visible **Breach Line**. Getting a ball behind it triggers a frenzy. | The breach also opens a path for the creature to escape, so it has a story reason. |
| **x3 / +3 orbs** floating in the channels | Exponential growth is visible and easy to read. One ball becomes 3, 9, 27. | Multiplier gates placed *inside* channels as rewards for good shots. | Gates are tied to risk: the best multipliers sit next to the threat. |
| The **ball rattling inside a pocket**, eating everything around it | The "trapped ball goes wild" moment is the most satisfying beat in these clips. | **Frenzy**: a ball inside an enclosed pocket speeds up and shreds. | Pockets can hold the creature, so a frenzy near it is both exciting and dangerous. |
| Dead simple visuals, no UI, one paddle | Instantly readable in 1 second of scrolling. | Readability rule: any frame of the game must read in under 1 second. | Premium art direction on top of the same readability (see §8). |

**The insight:** these clips are addictive because of *anticipation → breach → cascade*. Nobody had built a real game whose whole structure is that loop, with a reason to care (a rescue) and a reason to hurry (a threat). That is BREACH.

---

### 3. Market: what premium and top-grossing brick breakers look like

#### 3.1 The landscape

| Segment | Examples | Model | What works | Gap we exploit |
|---|---|---|---|---|
| Classic paddle arcade | Arkanoid, Wizorb, Shatter, Super Brick Breaker, Real Brick Breaker | Premium or ads | Tight feel, power-up variety | Visually dated, no stakes, no reason to hurry |
| Swipe-aim "balls vs blocks" | Ballz (Ketchapp), Bricks n Balls, Bricks Breaker Quest | Hyper-casual, ads-first | One-thumb, short sessions, ball chain growth | Turn-based (no real-time skill), players hate the ad load (Ballz reviews: "excessive and intrusive advertising") |
| Roguelite brick breaker | **Ball x Pit** (Devolver, 2025; iPhone since Mar 2026) | Free to try, €17.99 unlock | Ball fusion, builds, 2M+ copies sold by Aug 2026 | Long roguelite runs, not a quick phone session; proves players *pay* for an evolved brick breaker |
| Pinball / brick RPG | World Flipper ($71M lifetime), PunBall ($39M) | Gacha, IAP | Deep meta | Revenue spikes and crashes; heavy monetization |
| Viral clip format | Brickmania, Many Bricks Breaker videos | Video content | Satisfying micro-brick erosion | Not a playable game with goals |

Market data (Sensor Tower via GameDev Reports, 2012–2023 pinball and brick breaker): 948M downloads, $296M IAP revenue. Hyper-casual took 62% of downloads but only 8% of revenue; **hybrid-casual took 28% of downloads and 63% of revenue**. Leaders hold D1 retention of 38–54%, and Bricks Breaker Quest reaches about 10% at D60 with 86% organic traffic. The genre retains well; it lacks a premium, fresh hook.

**Positioning:** "Ball x Pit proved people pay for a brick breaker that feels new. BREACH is the premium, one-thumb, phone-first version, built around the most-watched brick-breaker moment on the internet."

#### 3.1b Competitor details (App Store, checked 2026-10-17)

| Game | Model | Online / offline | Multiplayer | Update cadence and what changes |
|---|---|---|---|---|
| **BALL x PIT** (Kenny Sun, Devolver) | Free to try, full game €17.99 one-time unlock; no microtransactions. 4.8★ (290). Came to iPhone Mar 2026. | Not stated; single-player runs | Game Center leaderboards and achievements; no online multiplayer listed | Big free content drops about every 3 months (Regal Jan, Shadow Apr, Naturalist Aug 2026): new characters, 10+ balls, buildings, passives. Bug-fix patches between. |
| **Arkanoid vs Space Invaders+** (Taito) | Apple Arcade (subscription, no ads or IAP). 3.3★ (31). | Not stated | Game Center leaderboards, 2 ranking modes | 5 updates since Sep 2024, all fixes and language support; no new content. |
| **Ballz** (Ketchapp) | Free, ads, IAP (remove ads $2.99–$5.99, lives, rings). 4.3★ (71K). | Cloud save | Trophy Hunt leagues (Iron to Diamond), Game Center, friend challenges | Roughly monthly. 3.0 (Sep 2025) reworked UI, added haptics, a danger overlay and cloud save; Trophy Hunt leagues added Feb 2026. |
| **Bricks n Balls** (PeopleFun) | Free, heavy ads, ruby IAP $0.99–$29.99, remove ads $2.99. 4.2★ (78K). | Not stated | Tournaments | Every 2–6 weeks, nearly all "performance improvements"; dropped subscriptions in 2024; occasional level rebalancing. |
| **Bricks Breaker Quest** (Mobirix) | Free, ads, ruby IAP up to $99.99, weekly sub $9.99. 4.3★ (18K). | **Plays offline** | "Multi-play", Game Center, live events (Neon Burst) | Every 3–6 weeks, "minor issues fixed"; content comes through events, not app updates. |
| **Brick Breaker: Journeys** | Free, ads, remove ads $9.99, unlock balls $4.99. 4.6★ (1.2K). | **Offline** ("no Wi-Fi needed") | None | Frequent in year one (new brick types, ball shop, daily bonus), then 1–2 small updates a year. |

What this tells us: the only premium hit (BALL x PIT) keeps players with **large free content updates on a predictable roadmap**, while the free-to-play games ship small technical patches and keep players with events, leagues and currency. Offline play is a selling point that free games advertise. For BREACH: fully offline, a one-time unlock, and a public roadmap with a new world as a free update roughly every quarter after launch.

#### 3.2 UI/UX teardown: why players stay

Patterns from Candy Crush, Royal Match, Ballz, Bricks n Balls and Bricks Breaker Quest, and what we do with each.

| Pattern | How they use it | Copy / change / avoid |
|---|---|---|
| **Instant start** | Royal Match opens straight into a level; Ballz is playable in 1 tap. | **Copy.** First launch drops you into level 1 with the creature already in danger. No menus, no account. |
| **Short levels (≤ 5 min)** | Royal Match caps levels at about 5 minutes. | **Copy, shorter.** Rescue phase 45–90 s, frenzy 10 s. One level fits a red light. |
| **Teach by playing** | Early levels are the tutorial; one new mechanic at a time. | **Copy.** Levels 1–5 introduce paddle, channel, threat, multiplier, collapse, one each. |
| **Near-miss design** | Match-3 failure screens show "you were 1 move away". | **Copy, but honest.** Fail screen shows the creature, the threat, and how many tiles stood between them ("3 tiles from freedom"). Clutch saves get a slow-mo replay. |
| **Visible progress map** | Saga map with a path of nodes; castle renovation in Royal Match. | **Change.** A **Sanctuary**: every rescued creature lives in your sanctuary, which grows and glows. Progress you can see and care about, not just a node path. |
| **Streaks** | Win streaks give a starting booster. | **Copy.** Rescue streak starts the next level with a bonus ball type. |
| **Juice on every input** | Royal Match lets you keep moving during cascades; everything bounces and sparkles. | **Copy and push further.** Haptics on every chip, pitch ladder on combos, hit-stop on breaches. |
| **Daily reason to return** | Daily rewards, events, passes. | **Change.** One **Daily Vault**: a hand-picked level, same for everyone, global leaderboard, plus a shareable replay. No login-reward slot machine. |
| **Lives / energy** | Wait or pay when out of lives. | **Avoid.** Premium game: unlimited play. This is a selling point in our store listing. |
| **Out-of-moves offer** | Pay coins for +5 moves at the fail screen. | **Avoid for money.** We offer a free one-time "second wind" per level (watch the threat get pushed back 3 seconds), earned in play. |
| **Interstitial ads** | Ballz: ads after every few runs; the top complaint in its reviews. | **Avoid entirely.** No ads is a core promise. |

#### 3.3 Why players pay, and our model

What makes players pay in this genre: removing friction (ads, waiting), progress acceleration, cosmetic identity (ball skins), and content they want more of. Premium iOS buyers pay for *respect*: no ads, no timers, lots of content, polish.

**Recommended model: "Free to try, pay once."**

- World 1 (20 levels) and the Daily Vault are free.
- One purchase (target **$4.99**) unlocks all worlds, Siege mode and the level editor. No ads anywhere, ever.
- Optional cosmetic packs later (ball trails, paddle skins, tile themes). Cosmetic only, never power.
- Apple Arcade is a strong alternative channel: the game has no IAP dependence, so it fits their rules as is.

What we deliberately do **not** copy: energy timers, pay-to-continue, loot boxes, ad walls. These lift short-term revenue but kill App Store ratings and editorial features, which is where a premium game gets discovered.

#### 3.4 Growth hook: the game makes its own viral clips

The genre spreads through short videos, so we build that in. **Replay Reel** automatically keeps the best 8 seconds of each level (largest collapse, clutch save, biggest ball count) and exports a vertical 9:16 clip with one tap. Every player becomes a source of the exact content that inspired this game.

---

### 4. Core mechanics: three candidates and a recommendation

#### 4.1 Candidate A — **Carve & Rescue** (recommended)

The field is a dense micro-brick structure (a tree, a tower, a ship, a skull). Inside, in a sealed pocket, sits a **Wisp**: a small glowing creature. A **threat** is moving toward it. You win by carving a connected channel from the Wisp's pocket to the open area below the Breach Line. The moment the channel connects, the Wisp dashes out along it, leaps onto your paddle, and the level flips into **Frenzy**.

Why it is new: brick breakers have always been "clear all bricks". Here you **sculpt a path**, so *where* you break matters more than *how much*. Careless carving can open a highway for the threat.

The threat is per world, and every threat changes how you carve:

| World | Threat | Rule | Player tension |
|---|---|---|---|
| 1. Hollow Grove | **Void Serpent** | Burrows toward the Wisp along the cheapest path; moves 3× faster through cells you've already cleared. A ball hit on its head stuns it and knocks it back. | Every tunnel you dig, it can use. Do you race it or block it? |
| 2. The Forge | **Rising Magma** | Rises from below, turning bricks it touches into obsidian (unbreakable without Fireball). | Routes close over time; carve early and high. |
| 3. Rime Spire | **Frost Creep** | Spreads cell by cell; frozen tiles take 3 hits and slow balls. | Speed matters; frost "heals" the structure. |
| 4. Drowned Bell | **The Flood** | Water pours into cleared cells from above as a real fluid (cellular automaton). If it reaches the Wisp's pocket, fail. | Carving from the top is suicide; you must dig up from below. |
| 5. Eclipse | **The Dark** | Light shrinks; tiles are only visible near your balls. | Memory and nerve. |

Win: Wisp rescued. Fail: threat reaches the Wisp. Losing all balls costs a life (3 per level) but is not the main fail state.

#### 4.2 Candidate B — **Structural Collapse** (recommended as a core system with A)

Each structure has **anchor rivets** (indestructible studs on the frame). After every break we check which tiles are still connected to an anchor. Any island that is no longer connected **breaks loose, falls, and shatters**: hundreds of tiles in one moment.

- Cut the trunk of the tree and the whole crown crashes down.
- Falling chunks rain shards; catching shards with the paddle fills the Overdrive meter.
- A falling chunk can crush the serpent, or block a channel, so collapse is a tactic, not only spectacle.
- Some levels hang the Wisp's cage from a chain; cutting the chain drops the cage onto your side.

This is the "cut one thing and everything falls" satisfaction that Jenga and physics puzzle games own, applied to a brick breaker for the first time we could find.

#### 4.3 Candidate C — **Spin & Curve** (recommended as the skill layer)

Swiping the paddle as the ball hits imparts **spin**. A spinning ball **curves** (a Magnus-style sideways force that fades over about 1 second), drawn with a visible curved trail. Hit offset still sets the launch angle like classic Arkanoid; paddle velocity sets spin.

- Gives one-thumb players a real aiming skill for threading channels.
- Makes the near-misses in narrow shapes feel earned.
- Ceiling for mastery: experts curve shots around corners into pockets.

#### 4.3b How the player controls where the tunnel goes

There is no finger carving. The thumb only moves the paddle; only balls break tiles. Control over *where* the ball goes comes from five layers, from least to most deliberate:

1. **Paddle position**: where the ball lands on the paddle sets its outgoing angle (classic Arkanoid).
2. **Spin**: swiping the paddle at contact curves the ball (§4.3). The glowing curved streaks in the drafts are these ball trails.
3. **The level shape**: each structure ships with pre-built channels separated by thin walls, like the shapes in the reference clips. Once a ball enters a channel it rattles along it and does the carving for you; the skill is getting it in.
4. **Focus aim (new core ability)**: hold the thumb still as the ball comes down and it catches on the paddle for up to 1 second in slow motion, with a dotted line previewing the first two bounces. Slide to aim, release to fire. Uses a Focus meter that refills with combos, so it is for the shots that matter, not every hit.
5. **Power-ups**: Drill fires straight for 12 tiles, Seeker curves toward the Wisp, Laser paddle cuts exactly where you stand.

Some imprecision is deliberate: it is the "will it get in?" tension from the clips. Focus aim exists so a missed shot feels like your choice, never pure luck. The M0 prototype will tune how often Focus is available.

#### 4.4 Other ideas considered and parked

- **Gravity thumb** (hold to bend all balls toward your finger): powerful but conflicts with one-thumb paddle control. Kept as a power-up ("Attractor").
- **Rhythm hits** (bricks pulse to the beat; on-beat hits do double damage): fun, but splits attention away from the threat. Maybe a later mode.
- **Turn-based aim and shoot** (Ballz style): crowded, and loses real-time urgency.

**Recommendation: build A + B + C as one game.** Carve & Rescue is the goal, Collapse is the payoff, Spin and Focus aim are the skill (§4.3b). The first prototype tests only A with the Serpent (see §10).

---

### 5. Level flow (one level, about 60–100 seconds)

1. **Reveal (2 s).** Camera glides over the structure; the Wisp waves for help; the threat wakes up with a sound sting. HUD shows a "distance to Wisp" meter.
2. **Rescue phase (45–90 s).** Launch, carve, curve, grab power-ups. Music layers add as the threat gets closer (heartbeat, then percussion, then choir).
3. **Breach (1 s).** Channel connects. Hit-stop 120 ms, white flash, big haptic, the Wisp dashes out. If the threat was within 3 tiles: **CLUTCH** slow-mo.
4. **Frenzy (10 s).** Every ball becomes a fireball, multiplier gates spawn, all remaining structure is fair game. Score here sets your stars.
5. **Results (3 s).** Stars, Wisp joins the Sanctuary, Replay Reel button, "Next" in the thumb zone.

---

### 6. Urgency systems

| System | What the player sees and feels |
|---|---|
| Diegetic threat | The threat is on screen and moving; no abstract timer needed. |
| Distance meter | Top bar shrinks from green to red as the threat gets near. |
| Adaptive music | Vertical layers fade in by threat distance; the final 20% adds a heartbeat bass. |
| Wisp reactions | The Wisp looks at the threat, trembles, then presses against the wall it hopes you'll break. |
| Red vignette pulse | Pulses with the heartbeat when the threat is close (reduced in accessibility settings). |
| Clutch rewards | Saves under 3 tiles get slow-mo, a bonus, and a likely Replay Reel. |
| Second wind | Once per level, an earned free push-back of the threat (never sold). |
| Frenzy countdown | 10 seconds to shred for stars. |

---

### 7. Power-ups

Dropped from special tiles (glowing seams in the structure) and from collapses. Caught by the paddle unless noted.

**Ball count**
- **Split ×3**: every ball on screen splits into three.
- **Burst +3**: three new balls fire from the paddle.
- **Multiplier Gate** (field object, not caught): any ball passing through it doubles. Placed inside channels.

**Ball types (8 s)**
- **Fireball**: passes through tiles, melts obsidian.
- **Drill**: pierces in a straight line for 12 tiles.
- **Bomb**: explodes in a radius on first contact.
- **Seeker**: curves gently toward the nearest point of the Wisp's pocket.
- **Ghost**: passes through the threat without stopping (for when the serpent blocks your channel).
- **Chain Lightning**: arcs between nearby balls and breaks tiles along the arcs.

**Paddle (12 s)**
- **Wide**: paddle 1.6× wider.
- **Catch**: balls stick; release to aim.
- **Laser**: auto-fires two beams per second.
- **Twin**: a mirror paddle appears higher up.
- **Safety Net**: a one-time glowing floor that saves one ball drop.

**Threat control**
- **Freeze**: threat stops for 5 s.
- **Seal**: the next tile the ball hits becomes stone, to block a channel the threat is using.
- **Repel**: shockwave pushes the threat back 4 tiles.

**Field**
- **Quake**: shakes the structure; loose islands collapse immediately.
- **Black Hole**: a vortex eats tiles in a radius for 3 s.
- **Shockwave Row**: shatters a full row.

**Overdrive (meter, not a drop)**: filled by combos and shard catches. Tap to make every ball a fireball for 4 s.

Rarity and drop rates are data-driven (one JSON table) so we can tune them without code changes.

---

### 8. Art direction: "Glass and Ember"

Not the flat squares from the clips. A premium, dark, glowing look that stays readable.

- **Tiles**: small rounded glass or stone tiles with a soft bevel and inner light; each world has its own palette (Grove: jade and moss; Forge: obsidian and ember; Rime: ice and violet; Drowned: teal and bronze; Eclipse: gold on black).
- **Light**: balls emit light that brightens nearby tiles (cheap 2D light pass). Bloom on balls, gates and the Wisp only.
- **Destruction**: tiles crack, then pop into 3–6 shards with gravity and spin; shards fade, never pile up.
- **Wisp**: a soft round glowing creature with big eyes. The emotional anchor; it must be cute.
- **Threats**: readable silhouettes in a contrasting hue (the serpent is a dark void body with ember eyes).
- **Readability rules**: threat is always the highest-contrast thing; balls always white-hot; UI only at the very top and bottom.
- **Tools**: everything drawn in code or as small 2D sprites. No Blender, no Unreal.

Audio: each tile chip is a short glassy tick whose pitch climbs with the combo; breaches have a low boom plus choir; the threat has its own motif. Haptics on iOS: light tick per chip (rate-limited), medium on power-up, heavy on breach and collapse.

---

### 9. Technical plan

#### 9.1 Stack: TypeScript + PixiJS v8 + Vite, wrapped with Capacitor for iOS

| Option | Verdict |
|---|---|
| **PixiJS v8 + own physics** | **Chosen.** Fast WebGL/WebGPU 2D renderer, great for thousands of sprites and glow filters. Brick-breaker physics is simple enough that our own deterministic code beats a general engine, and it lets us handle micro-brick edge cases exactly. GDevelop's own runtime is built on PixiJS and ships to mobile through Cordova, which is good evidence this route works. |
| Phaser 4 | Good, but its Arcade physics is per-body AABB; we would bypass it for the grid anyway, and its scene system adds weight we don't need. |
| Godot 4 | Strong engine, but web builds are heavy and slower to iterate on in the browser, where you can review drafts. |
| Unity / Unreal | Overkill for a 2D game and against the "keep it simple" brief. |

iOS path: Capacitor app shell, native haptics plugin, Game Center leaderboards, 120 Hz ProMotion, safe-area aware layout. The same build runs on the web for playtests and on Android later.

#### 9.2 Ball and brick collision physics

Following the `physics-tuning` skill:

- **Fixed timestep** at 120 Hz with an accumulator; render interpolates between steps. Large frame hitches are clamped so nothing teleports.
- **Substeps** so a ball never moves more than 0.4 of a tile per substep. This prevents tunneling through one-tile walls without needing general CCD.
- **Circle vs grid**: each substep, test only the tiles the ball's bounding box overlaps (grid lookup, O(1) per ball). For each solid tile, take the closest point on the tile to the ball centre; penetration gives the contact normal.
- **Ghost-edge fix (the micro-brick problem)**: a flat wall made of many tiny tiles has seams, and a naive solver bounces off the seam corners at strange angles. When a contact is on a tile *corner* and the neighbouring tile on that side is solid, we treat it as a flat face and use the face normal. Walls feel perfectly flat; real corners still deflect.
- **Multiple contacts**: normals from all contacted tiles in a substep are summed and normalized, then the velocity is reflected once. Each tile hit is still damaged.
- **Paddle**: hit offset sets the outgoing angle (±65° from vertical); paddle velocity at contact sets spin. Spin adds a sideways force proportional to speed and decays with a 1 s half-life.
- **Anti-boring rules**: minimum vertical speed component (no endless horizontal loops); if a ball repeats the same bounce loop 6 times, apply a tiny random nudge.
- **Speed**: base speed rises 2% every 10 s of rescue, capped; Frenzy is +40%.
- **Many balls**: balls don't collide with each other (classic rule, and needed for 500+ balls in Frenzy). One flat array of ball structs, no per-ball objects.
- **Collapse**: after breaks, a flood fill from anchor tiles marks connected tiles (incremental, only around changed regions). Unconnected islands become one falling rigid chunk (simple gravity and rotation, no physics engine), which shatters into shards on impact.
- **Determinism**: seeded RNG plus fixed step means the same inputs give the same result, which powers Replay Reel and the Daily Vault leaderboard.

#### 9.3 Rendering budget (iPhone 12 class, 60 fps minimum, 120 fps target)

- Tiles: one instanced sprite batch (ParticleContainer) of about 3,500 tiles; dirty-flag updates only.
- Balls: up to 600 instanced sprites plus a shared trail texture.
- Shards: pooled, max 1,500 alive.
- Glow: one bloom pass on a dedicated layer.
- Budget: simulation ≤ 4 ms, render submit ≤ 4 ms per frame.

#### 9.4 Levels as data

Levels are authored as small PNG images (one pixel per tile, colour = tile type: normal, tough, anchor, gate, power-up seam, Wisp pocket, threat start). A converter turns them into JSON. This makes designing shapes like the reference clips (trees, crosses, mazes) as easy as drawing pixel art, and lets us hand-make or generate hundreds of levels.

---

### 10. Build plan and subtasks

Each workstream is sized for one subagent with a clear contract and a test.

| # | Workstream | Output | Depends on |
|---|---|---|---|
| 1 | **Project scaffold** | Vite + TS + PixiJS v8, lint, unit tests (Vitest), Playwright smoke test, CI | — |
| 2 | **Physics core** | Fixed-step sim, ball/grid collision with ghost-edge fix, paddle, spin; unit tests for flat walls, corners, tunneling, 600-ball stress | 1 |
| 3 | **Grid and level loader** | Tile types, PNG to JSON converter, 5 test levels | 1 |
| 4 | **Renderer** | Tile batch, ball instancing, trails, shards, bloom, camera shake | 1, 3 |
| 5 | **Rescue rules** | Wisp pocket, path-connected check, escape animation, win/fail states | 2, 3 |
| 6 | **Threat: Void Serpent** | Burrowing pathfinding (cheaper through cleared cells), stun, knockback | 5 |
| 7 | **Structural collapse** | Anchor flood fill, falling chunks, shatter | 2, 3 |
| 8 | **Power-ups** | Data-driven defs, drop table, the 20 effects in §7 (first 6 for the prototype) | 2, 4 |
| 9 | **Juice and audio** | Trauma shake, hit-stop, haptics bridge, pitch ladder, adaptive music layers | 4 |
| 10 | **UI and flow** | Title, level select, HUD, results, settings and accessibility | 4 |
| 11 | **Other threats** | Magma, Frost, Flood (fluid automaton), Dark | 6 |
| 12 | **Meta** | Sanctuary, streaks, Daily Vault, Replay Reel export | 10 |
| 13 | **iOS wrap** | Capacitor, haptics, Game Center, store build | 10 |
| 14 | **QA and perf** | Frame budget checks, device testing, playtest notes | ongoing |

#### Milestones

- **M0 — "Is it fun?" prototype** (workstreams 1–6 plus 3 power-ups): one Grove level, the Serpent, carve and rescue. Keep it if testers say "one more" and try to clutch; kill or rework if carving feels like chores.
- **M1 — Vertical slice**: World 1 complete (20 levels), collapse, 12 power-ups, full juice, polished art for one world.
- **M2 — Content**: Worlds 2–5, all power-ups, Sanctuary, Daily Vault, Replay Reel.
- **M3 — Ship**: iOS build, store page, TestFlight playtest.

---

### 11. Open questions for you

1. Working title **BREACH**, or do you have a name in mind?
2. Creature to save: a cute **Wisp** (our recommendation, works worldwide), or a human character like the princess in the Candy Crush ad?
3. Pricing: **free to try + $4.99 unlock** (our recommendation), or fully paid upfront?
4. Is the first prototype scope in M0 right, or do you want collapse in it from day one?

---

### Appendix: sources

- App Store listings: BALL x PIT https://apps.apple.com/de/app/ball-x-pit/id6738703497 · Arkanoid vs Space Invaders+ https://apps.apple.com/us/app/-/id6503027740 · Ballz https://apps.apple.com/app/1139609950 · Bricks n Balls https://apps.apple.com/app/id1331794412 · Bricks Breaker Quest https://apps.apple.com/us/app/-/id1288430163 · Brick Breaker: Journeys https://apps.apple.com/us/app/brick-breaker-journeys/id1619145707
- BALL x PIT 2026 update roadmap: https://www.pcgamesn.com/ball-x-pit/update-roadmap-2026

- Sensor Tower data on pinball and brick breaker subgenres, via GameDev Reports: https://gamedevreports.substack.com/p/sensor-tower-analysis-of-pinballbrick
- Ball x Pit at 2M sales: https://www.pushsquare.com/news/2026/08/devolvers-brilliant-roguelite-dopamine-factory-ball-x-pit-is-a-smash-hit-at-2-million-sales
- Brick Breaker Brainrot (origin of the viral format): https://knowyourmeme.com/memes/brick-breaker-brainrot
- Royal Match design decisions: https://www.cubix.co/blog/the-design-decisions-that-made-royal-match-a-top-grossing-game/
- Ballz review sentiment: https://marlvel.ai/apps/ballz
- Fake and rescue ads, retention data: https://segwise.ai/blog/fake-ads-and-mobile-gaming-how-studios-balance-clickbait-gameplay-integrity-and-profitability-cm7j2hc9s00bvip0l0r4k59lw
- Block breaker landscape 2026: https://www.soonlab.ai/blog/block-breaker-games/


---

# Part E: Status, owner rules, progress log, TODO, palette

*Source: `docs/handoff/01-status-and-next-steps.md`*

## BREACH handoff 1/3: status and next steps

Last updated 2026-10-24 (after the overnight run of 2026-10-23). Read "Current state" first. The progress log below it is history, newest first; an older entry never overrides this section. Sections 2 to 9 were checked on 2026-10-22: where a section is marked HISTORICAL it describes work that has since been replaced.

### Current state (2026-10-24)

**Branch:** `codex/castle-chapters` is the working branch and carries the Android 0.8 build described below (`codex/overnight` is the same commit). `main` is untouched: the owner approves every merge to `main` after reviewing screenshots.

**Android build:** `0.8-princess-polish`, `androidVersionCode` 8 (`config/mobile-preview.json`). APK built by the manual mobile-preview run 40045371055; artifact `BREACH-eleven-chapter-android-28`. It has not been playtested by the owner yet.

**Owner direction (2026-10-23 night):**
- quality bar is `store/key-art.png`;
- every villain needs a visible purpose, like the snakes (done as purpose clocks, below);
- reuse archetypes with new skins instead of new physics: yeti to bull, bison or ape (`prompt-library/16-brute-reskin.md`), snake to fire serpent;
- levels are hard but beatable with the right power-ups;
- use subagents on cheaper models where the work allows;
- no goose chases: do not spend time on side hunts that do not move the build.

**What the overnight run added (the 0.8 build; commit list is `git log --oneline ce95cb2..HEAD`)**
- **Ball radius 7 everywhere** (`BALL_R` in `src/fantasy/ram.js`; Vault and every princess level; Android smoke test updated).
- **Home page and chapter map** (`src/home.js`; key-art hero `src/home-art.js`, packed from `store/key-art.png` by `tools/pack_home_art.py`). Nine princess chapters in story order (`STORY = [1,4,5,6,7,8,9,10,11]`) with art, stars and locks. The space chapters (slots 0, 2, 3) are hidden from the menu but keep their slots and `?level=N`. `tests/home.test.js`.
- **Ball-control tutorial** (`src/tutorial.js`, `src/tutorial-draw.js`; How to play replays it) and **chapter purpose cards** (`src/purpose.js`, `src/portraits.js`) shown when a chapter opens. `tests/tutorial.test.js`.
- **Castle special bricks** (`src/castle-specials.js`, `src/castle-art.js`): armour, mines, chests and coins on the Vault, Mooncoil and the fantasy levels. `tests/castle-specials.test.js`.
- **Villain purpose clocks** (`src/fantasy/purpose.js`, `src/fantasy/purpose-render.js`): a visible clock that ends in losing Lumi on Gatehouse, Lumi Breaks Out, Serpent Rivals and Dragon's Hoard; Bellforge has a lift meter. `tests/purpose-clocks.test.js`.
- **Power-ups v2** (`tests/powers-v2.test.js`): 8 power-up physics fixes, stronger per-difficulty powers, villain HP up.
- **Laptop polish merged**: full-screen princess chapters (Hoard cave plate fills notch and home-bar areas), Lumi/Rivals tower walls, Frost and Vault backdrops; fire serpent skin (`SERPENT_SKINS.ember` in `src/vault.js`, `tools/recolor_serpent.py`) worn by Gnash in Mooncoil; the M365 Yeti redesign as the Frost Warden with a frost-crouch dash and wall smash (`tests/frost-dash.test.js`); the brute reskin recipe (`prompt-library/16-brute-reskin.md`).
- **Tidewheel Citadel is now a four-stage Siege** (`src/fantasy/tidewheel-siege.js`, `tidewheel-stages*.js`, `stage-ui.js`, `tide-scene.js`; round 3 art via `tools/pack_round3.py`): sea special bricks, shielded Nerra, flood clock. `tests/tidewheel-siege.test.js`, `tests/stage-ui.test.js`.
- **Physics audit fixes** (`tests/physics-audit-fixes.test.js`): the Warden's body notches are closed (`closeNotches` in `src/clearance.js`) and an open Tidewheel gate panel parks `GATE_LIFT` = 128 px up, clear of Nerra.
- **Playtests drive the new home page** (`tools/playtest/polish.mjs`, `layout.mjs`, `frost.mjs`, `mooncoil.mjs`, `audit-adapters.mjs`, `aim-bot.mjs`).

**Branches.** Laptop side branches `recovered/codex-2026-10-22`, `codex/castle-art` and `codex/mooncoil-rivals` are merged into it, except one docs-only commit on the recovered branch (3bcae82, the Mooncoil recheck record) that is not in this branch. `codex/wip-lumi-audit` is throwaway WIP snapshots and is safe to delete. The other local branches (`codex/starship-run-prototype`, `wip/polish-pass`) are old and already contained here.

**12 chapters in `LEVELS`** (the table below lists slots 0 to 10; slot 11 is Dragon's Hoard, `src/fantasy/hoard.js`, `?level=12`, key `=`, with a Wake eye, Hush Chimes and an avalanche escape). Only the nine princess chapters show in the menu (see the home page above). The registry is `LEVELS` in `src/main.js`. Save slots never move; new chapters only append. `?level=N` is 1-based. In the menu, keys 1 to 9 start slots 0 to 8 and key 0 starts slot 9 (Lumi Breaks Out). Serpent Rivals has no key: tap its card or use `?level=11`. Menu card order comes from `[0, 2, 3, 1, 4 ... 10]`, not slot order. Invasion (`src/invasion.js`) is still in the repo but is not in `LEVELS`.

| Slot | `?level=` | Chapter | Code |
|---|---|---|---|
| 0 | 1 | Carrier Breakout | `src/carrier.js` |
| 1 | 2 | The Vault | `src/vault.js` |
| 2 | 3 | Circuit Breakout | `src/relay.js` |
| 3 | 4 | Shutter Forge | `src/orbital.js` |
| 4 | 5 | Frost Warden | `src/frost.js` |
| 5 | 6 | Mooncoil Reliquary (now with a second serpent, Gnash, who can clash with Mooncoil) | `src/mooncoil.js`, `src/mooncoil-layout.js` |
| 6 | 7 | Bellforge Run | `src/fantasy/bellforge.js` |
| 7 | 8 | Tidewheel Citadel | `src/fantasy/tidewheel.js` |
| 8 | 9 | Gatehouse Siege (Kit) | `src/fantasy/gatehouse.js` |
| 9 | 10 | Lumi Breaks Out (Lumi is the player: layered serpent windows, Lullaby, Starlight, Song Shield) | `src/fantasy/lumitower.js` |
| 10 | 11 | Serpent Rivals (Gnash and Mooncoil from opposite walls, lure runes, clash chamber, Twin Seal) | `src/fantasy/rivals.js` |

Chapters 7 to 11 run through the `FantasyChapter` adapter in `src/fantasy/chapter.js`, which puts the standalone models behind the shared Arena contract (drag, Kit or Lumi orb, power menu, HUD, continue, results). Drawing is in `src/fantasy/render.js`, `lumi-render.js` and `rivals-render.js`.

**Shared mechanics added this week**
- **Ram Ball in every level** (`src/fantasy/ram.js`; Arena levels use the `ramPierce` hook in `src/arena.js`). Three centre-third paddle hits arm it; the next centre hit launches a giant ball that ploughs only 1-HP ordinary bricks (about 2.5 s or 14 bricks). Everything else takes a normal hit and the ram bounces. Owner-approved design.
- **Power-ready pulse** (`drawChargeReady` and a vibrate in `src/kit.js`): the face orb double-beats with a halo for 5 s, then glows until used. Android has the VIBRATE permission.
- **Clearance** (`src/clearance.js`): ejects a ball that a pose swap, knock-back or spawn dropped inside a solid. Added after the physics audit found six traps.
- Rendered gems, chips, sparks and glints (`ART.fxKit`) replace code-drawn rings and dots. Kit's arrows and bow are rendered, not line-drawn.

**Gates (all must pass before anything ships; physics is the owner's top concern)**
1. `npm test`: 694 tests, all pass (2026-10-24).
2. `npm run audit:physics` (`tools/playtest/physics-audit.mjs`): headless bot, idle and ram sweep of every level x easy/medium/hard x two phones; zero failures. Report: `docs/validation/physics-audit/report.json` (full audit 2026-10-24: 444 runs, 0 failures). Adapters are in `tools/playtest/audit-adapters.mjs` (including Lumi Breaks Out and the Hoard).
3. `node tools/playtest/physics-audit-checks.mjs --quick`: seeded Gatehouse checks (tunnelling, stuck hazards, ward vs bell, clearability). Passes (2026-10-24).
4. Screenshots of anything visual, shown to the owner.

**Release path**
1. Gates above, then `npm run build` (writes `dist/breach.html`, about 14 MB; `src/vault-art.js` is about 12.9 MB of it).
2. `node tools/pin-sha.mjs` re-pins `config/mobile-preview.json`; `node tools/prepare-android.mjs` must pass.
3. CI (`.github/workflows/mobile-preview.yml`) is manual only (`workflow_dispatch`), by owner rule. Run it once per release candidate after the local checks; the run must pass. Do not use it as a test loop.
4. The current APK is `0.8-princess-polish` (versionCode 8), built from `codex/castle-chapters` by run 40045371055 (artifact `BREACH-eleven-chapter-android-28`). `docs/MOBILE_PREVIEW.md` still describes the old five-chapter build and is history. The next release bumps `androidVersionCode` and `androidVersionName`, re-pins the SHA and runs CI once.

**Art**
- `python3 tools/pack_art.py` (about 4.5 min) packs `assets/` into `src/vault-art.js`. Never hand-merge that file: after a git conflict take one side and repack.
- Blender `bpy` 5.2.2 runs headless (Python 3.13). Scripts are in `art/` (for example `art/rivals`, `art/premium`, `art/fx_kit`).
- Look standard: the Gatehouse first-pass render. No bare stroked rings or dots as FX; use `ART.fxKit` gems, chips, sparks and glints.
- Strip PNG metadata before committing renders (doc 02, section 3).
- The owner generates art with M365 Copilot using `prompt-library/` (copy also at `/mnt/project-files/breaker/prompt-library/`) and posts renders back in the project chat.

**Where the plans are:** `docs/BACKLOG.md` (every saved to-do, checked against code), `design/phase2/` (`kit-and-lumi-levels.md`, `serpent-rivals.md`, `dragons-hoard.md`, `premium-pass.md`, `new-concepts.md`), `docs/MOONCOIL_RELIQUARY.md`, `docs/BELLFORGE_PHYSICS.md`, `docs/TIDEWHEEL_PHYSICS.md`.

**Owner rules (short; full list in section 1)**: commits authored and committed as `mahikshith <mahikshith97@gmail.com>`; no AI attribution anywhere in the repo; strip PNG metadata; show screenshots after anything finishes; short single-path instructions; physics first; harder but fair; premium look, never vibe-coded.

**Open items and next, in order**
1. Owner playtests the 0.8 APK; tune from feedback (harder but beatable with the right power-ups).
2. Check the Tidewheel open gate panel now parked 128 px up (`GATE_LIFT`): confirm it looks right beside Nerra.
3. Dragon's Hoard: the purpose plate is tight beside the loot pill; tidy the HUD spacing.
4. Gatehouse floor 1: the purpose plate overlaps the parapet art; move or shrink it.
5. Reskin archetypes for new villains (bull, bison, ape on the Yeti physics; fire serpent exists) as art arrives.
6. Premium art wiring into the earlier levels (`design/phase2/premium-pass.md`).
7. Merge to `main` only when the owner approves.
8. Starflight in its own thread later (`docs/STARFLIGHT_*.md`; separate browser prototype, not in the game).

**Pending owner decision:** "compress the companions" would save about 2 MB, but faces shift by 4 to 7 out of 255 per channel.

**Known stale or loose ends**
- `docs/CONTINUE_HERE.md` is the short pointer; `docs/SPACE_COMBAT_HANDOFF.md`, `docs/NEXT_LEVELS.md` and `docs/MOBILE_PREVIEW.md` describe the older five-chapter state and are historical for anything castle-related.
- The side branches in the progress log below (`codex/themed-bricks`, `codex/tidewheel-look`, `codex/floor-hooks`, `codex/art-round2`, `codex/coach`, `codex/dragons-hoard`) are all merged into `codex/castle-chapters`; their "not merged" notes are history.
- Doc 04 and 05 (ChatGPT brief and prompts) predate the castle chapters; use `prompt-library/` for new art prompts.

Read all three handoff docs before touching code: this one (status, rules, history), `02-architecture-and-pipeline.md` and `03-environment-skills-ux.md`. Keep them current at the end of every session.

### Progress log (newest first)

- **2026-10-23 night to 2026-10-24 — Overnight run: Android 0.8-princess-polish (branch `codex/castle-chapters`; not merged to `main`, the owner approves that).**
  - Integrated: tutorial and purpose cards, home page and chapter map, castle special bricks, villain purpose clocks, power-ups v2, laptop polish (full-screen chapters, fire serpent, M365 Yeti with dash and smash), Tidewheel four-stage Siege, ball radius 7. File-level list in "Current state" above; exact commits: `git log --oneline ce95cb2..HEAD`.
  - Audit fixes: `closeNotches` (`src/clearance.js`) fills sub-gap notches in the Warden's body so a ball cannot wedge; Tidewheel `GATE_LIFT` is 128 so an open panel clears Nerra. Tests in `tests/physics-audit-fixes.test.js`.
  - Playtests (`tools/playtest/*`) now start chapters through the home page and chapter map; the Android smoke test (`tools/test-android.sh`) expects the radius-7 Vault ball.
  - Gates: `npm test` 694 pass; full physics audit 444 runs, 0 failures; `physics-audit-checks.mjs --quick` pass. Release: versionCode 8, `0.8-princess-polish`, mobile-preview run 40045371055, artifact `BREACH-eleven-chapter-android-28`.
  - Open: owner playtest of the APK; Tidewheel gate panel look; Hoard purpose plate beside the loot pill; Gatehouse floor 1 plate over the parapet.

- **2026-10-23 — Themed bricks (branch `codex/themed-bricks`, from `codex/castle-chapters`; not merged). Visuals only; stages, HP and rules unchanged.**
  - One builder, `art/themed-bricks/build.py`, re-glazes the glaze v2 source sheet per chapter (a luminance gradient map keeps the source's bevel, glaze band, star glint and cracks, then each material adds its own detail) into `assets/themed-bricks/<set>/` with an `atlas.json` (sprites keyed `<material>_<cells>_<state>` plus an FX palette per material). Packed by one block in `tools/pack_art.py` as `ART.themedBricks` (~263 KB). `python3 art/themed-bricks/preview.py <dir>` writes review sheets.
  - Sets: **frost** (rime-frosted ice glass, frozen blue, frost violet; frost-rimed iron bar with icicle nubs), **gatehouse** (gules, argent and vert heraldic enamel with gilded bevels; armour is a gilt-edged riveted iron plate; portcullis-iron bar), **bellforge** (verdigris, bell bronze, rose bell-metal and the bronze ramp pins, all cracking forge-hot; forge-iron bar with bronze bands), **tower** for Lumi and Rivals (lilac, rose and slate stone-glaze, rune-lit jade, amber/emerald/amethyst serpent scale; tower-iron bar), **mooncoil** (moonstone, rose moonstone, lunar silver, starlit violet at 1 and 2 cells; dark lunar bar with a crescent), **vault** (the granite becomes a riveted vault-iron bar). Every set has an unbreakable bar with a glint stripe at 1-cell and 2-cell widths; `drawThemedBar` tiles any length (tall rects stack 1-cell blocks), for steel chambers in new stage layouts (`type: 'steel'`).
  - Runtime: `src/themed-bricks.js` (draw, Vault-art record, bar tiling, break and hit effects). Breaks cut the breaking frame into its three pieces, spin chips cut from the brick's own face and throw a material spray baked once (rime crystals, gilt flecks, forge embers, rune and moon glints, stone grit); closed-form, no per-frame allocation. Each chapter falls back to its current art when a sprite is missing; `?themed=0` turns the sets off for A/B shots. The Hoard keeps glaze v2 (it matches its coin and chest bricks); Tidewheel is untouched.
  - Review: `tools/playtest/themed-bricks.mjs <out> [html] [tag]` (boards with cracked bricks and breaks frozen mid-flight); shots in `review-2026-10-23/themed-bricks/`.

- **2026-10-23 — Tidewheel look (branch `codex/tidewheel-look`, from `codex/castle-chapters`; not merged). Visuals only; stages, HP and rules unchanged.**
  - Sea glaze bricks: `art/tidewheel-glaze/build.py` re-glazes the glaze v2 source sheet into sea-glass, coral, pearl and a brass-banded, barnacled steel bar (for future unbreakable bars, colour `'steel'`), each intact / cracked / breaking, at the rafts' 34x18 footprint (ppu 3, margin 4, glaze v2's contact shadow). Packed as `ART.tidewheelGlaze` (~45 KB). `render.js` draws raft bricks from them (cracked when `hp < maxHP`), falling back to the old sage/coral/ivory set if they are missing. Brick breaks show the breaking frame, its pieces cut along the frame's own gaps, glaze chips and a wet droplet spray.
  - Water FX (`src/fantasy/tide-fx.js`) replace the four cartoon splash frames, the dot muzzle, the pulse's glow beads and the stroked sluice lines: white water, a crown of spray sheets, motion-blurred droplets under gravity, foam flecks and a lit perspective ripple only where the water lands on water. Closed-form particles (no allocation per frame, at most 60 droplets drawn), sprites and gradients baked once, no shadowBlur. `water-hit` and `water-muzzle` effects live 0.6 s and 0.4 s (visual only) so the droplets can land.
  - Lumi: her cheer kept playing only while the model clock ran; it now runs on after the win, and the refuge chains run on up out of frame when the rescue hauls her above their blocks.
  - Review shots and notes: `review-2026-10-23/tidewheel-look/` (made by `tools/playtest/tidewheel-look.mjs`).

- **2026-10-23 — Floor hooks (branch `codex/floor-hooks`, from `codex/castle-chapters`; not merged).**
  - Rule from now on: every floor needs a stake on screen, pressure (a visible clock or threat) and a payoff that carries over. Audit of every floor and one-line fixes: `design/phase2/floor-hooks.md` (multi-floor chapters including Dragon's Hoard: 6 OK, 5 WEAK, 1 EMPTY; the worst were Gatehouse 1 and Lumi 1; all three Hoard floors are OK).
  - Gatehouse floor 1 rebuilt around the rule:
    - Korr winches on a battlement parapet above the bridge. The parapet is a solid and the ball's ceiling; Korr has no collider there.
    - A five-gem winch clock: after `crankIdle` s with no housing hit, Korr cranks. The telegraph lasts 1.2 to 1.8 s (red-hot housing, taut sparking chain, "HIT IT!"). Then the housing regains 1 HP. It never heals a destroyed housing and is capped per floor. A housing hit during the telegraph jams the crank.
    - A par chip: dropping the bridge inside par smashes Korr's bell rack ("BELL RACK SMASHED!"). Floor 2 then shows the wreck and its bells come 1.5x slower.
    - Six gem bricks bank loot that showers out of the crash.
    - Bridge and housings moved down 24u.
  - Fix: Gatehouse bells after the teaching bell were scheduled on the run clock, so floors 2 and 3 went nearly bell-free. They now use the floor clock (test measures the gap).
  - Fix: the physics audit caught a pre-existing ball orbit in the floor 2 pocket right of the gate (over 12 s with no contact). Ramp colliders now scale with the drawn beam (`RAMP_BODY` per 74u), the floor 2 ramp is shorter and steeper (278,224, 40u, .3 rad), and a ball that goes `DULL.after` (4 s) touching only scenery has each scenery bounce turned `DULL.turn` (.14 rad) toward the paddle, at the same speed. Worst escape went from 35 s to under 8 s over 3,200 random entries. Korr's pose-swap eject could also leave the ball in a crease between two body circles (112 of 17,202 swaps; the floor 3 ball then crawled out). It now falls back to pushing the ball straight out from his core circle, and a test sweeps every swap.
  - Tests: `tests/gatehouse.test.js` (winch tell, jam, never heals destroyed, cap, ceiling, bot always clears, par payoff, gems, ramp collider scale, pocket escape, anti-loop nudge, pose-swap eject sweep). Captures: `node tools/playtest/floor-hooks.mjs <out>`.

- **2026-10-23 — Render round 2 integrated (branch `codex/art-round2`, from `codex/castle-chapters`; not merged).**
  - Sources: the owner's R02, R03, R05, R06 sheets in `art/round2/source` (same files as main's `art/R0x.png`). Cut by connected components: `art/hoard/build.py` (R02 eye, R03 props, extended cave plate) and `art/round2/build.py` (R05 capsules, R06 crates and splash; `assets/round2/manifest.json`, packed as `ART.round2`).
  - Hoard: the Wake eye is Ember's rendered eye (5 stages, crossfading) over the meter bar; molten bricks (molten, cooling, hardened 2-hit) on their 32x16 colliders; the Hush Chime rings with the R03 bell; the floor-3 gate is the R03 portcullis fitted to the 140x62 gate span (dented past half, broken on the escape); coin and gem bursts on loot. The cave plate now runs the full playfield (pillars down both sides, dark floor). The Sunstone and the heavy banded crate are not cut (unused).
  - Capsules: `drawCapsule` (src/gfx.js) draws the glaze capsule, aspect kept, inside each chapter's existing capsule rect: Vault-family drops (arena), Carrier and Circuit drops and payload previews, castle chapters (Ram as Fire), the space arsenal's laser icon.
  - Crates: Circuit armour panels (square crate on the 17x17 collider) and Forge armour panels (2:1 crate on the armour art's bounds), dented at 1 HP, the breaking frame on the killing hit. Tidewheel: the water pulse's hit is the four-frame splash.
  - Review: `tools/playtest/art-round2.mjs`; screenshots in `/mnt/project-files/breaker/review-2026-10-23/art-round2/`.

- **2026-10-23 — Dragon's Hoard, chapter 12 (branch `codex/dragons-hoard`, from `codex/castle-chapters` with continue screen v2 merged in; not merged back).**
  - Spec: the merged one at the top of `design/phase2/dragons-hoard.md` (Ember he/him, the Crown, the Wake eye, Hush Chimes, Hoard Roar, molten gold, cash-out greed, the avalanche escape).
  - Slot 11 (`?level=12`, menu key `=`; `-` now starts slot 10). Rivals' `next` is 11. `config/mobile-preview.json` and `tools/prepare-android.mjs` list twelve slots; the reviewed SHA and the Android version are not bumped (owner's release step).
  - Model `src/fantasy/hoard.js` (DragonsHoard), renderer `src/fantasy/hoard-render.js`, chapter wiring in `src/fantasy/chapter.js` (greed card and RUN pill are model-space buttons; keys 1/R run, 2/S stay, R runs during a stay), `nearMiss()` and back-in-action like Rivals.
  - Ember runs on the new "big sitter" archetype (`src/fantasy/creatures/sitter.js`, skin `ember.js`): physics and pose state once per archetype, the creature is data.
  - Art: `art/hoard/build.py` takes the R01 full-body Ember poses (one scale, body circles fitted to the alpha), cuts the M365 dragon kit (8 busts kept as fallbacks, Crown chest fitted to its 100x52 collider, coins) and copies the owner's cave plate A to `assets/hoard`; `tools/pack_art.py` packs it as `ART.hoard`. R02 eye and R03 props slot in by name when they arrive (code fallbacks until then).
  - First-time coaching (merged from `codex/castle-chapters`) reaches the Hoard through the shared chapter hooks (serve, Ram pips, burn-in Ward); the greed card and the escape block it.
  - Tests: `tests/hoard.test.js` (17), `tests/sitter.test.js` (5, with a dummy solid skin); the chapter and continue-v2 tests cover the twelfth slot. Audit: adapter `hoard` (greed card answered at random). Review shots: `tools/playtest/hoard-review.mjs` (PERF=1 adds a frame-cost line).

- **2026-10-23 — First-time coaching (branch `codex/coach`, from `codex/castle-chapters`; not merged).**
  - `src/coach.js`: one glossy chip under the paddle (between the ram tray and the Kit orb), one at a time, hidden while play is blocked (continue panel, power menu, Vault Ward coach, back-in-action hold, intros). Progress persists in the store: `coachServes`, `coachCatches`, `coachRam`, `coachAimHud`.
  - Serve: "Slide to aim · Lift to serve" with a thumb and chevrons, every chapter, until 3 player serves (auto-serves do not count).
  - Focus (Arena chapters only): "HOLD STILL to catch & aim" when an AIM charge is stored and a ball will land within 0.8 s, then "Slide to aim · Lift to fire" once caught; stops after 2 Focus catches. The first time, the HUD AIM gems glow and a label reads "AIM charges: hold still to catch".
  - Ram: from the first lit pip, "Hit the MIDDLE ×3 → RAM BALL", then "Next middle hit launches the RAM!" when armed, until the first ram launch. The pips sit in a small enamel tray, pop in with a glint when lit, and the empty ones breathe while the coach is up (`drawRamPips` in `src/gfx.js`, now shared by the castle renderers).
  - Ward: the shield capsule sprite on the Ward line is gone; the line burns inward from both edges as its time runs out (embers at the ends, same last-1.2 s flicker). The Arena shield does the same and stays full while the serve is held. No gameplay numbers changed.
  - Tests: `tests/coach.test.js`. Captures: `node tools/playtest/coach.mjs <out>`.

- **2026-10-23 — Continue screen v2 (branch `codex/continue-v2`, from `codex/castle-chapters`; not merged).**
  - Loss panel: a chapter-aware "so close" card (every level has a `nearMiss()` hook; copy in `src/near-miss.js`), e.g. "KORR HAS 3 HP LEFT", "LUMI IS 3 BRICKS FROM FREEDOM", "2 WINCH HITS TO RAISE THE GATE", with a glossy progress bar and "FLOOR 3 / 3 · 96% CLEARED". The title says SO CLOSE! from 50% progress, else CONTINUE?.
  - The countdown ring is gone: an 8 s glazed fuse bar (teal to coral in the last 2 s) with a soft timeout. At 0 s it reads TAKE YOUR TIME and every button stays live; only No thanks declines.
  - Back in action: after Continue the ball waits on the paddle in the serve aim, a BACK IN ACTION! plaque shows, and the chapter's hazard clocks and auto-serve hold until the player releases (`backHold`). Arena chapters keep their existing 2-save, 10 s shield (its timer now starts at the serve); the castle chapters get a 3 s Ward at the paddle line (Gatehouse and Rivals reuse theirs; Bellforge, Tidewheel and Lumi got the same swept Ward).
  - $2.99 card: one rule, never on the player's first lifetime loss (`showUnlock` in `src/monetize.js`). Lives restored are unchanged.
  - Tests: `tests/continue-v2.test.js` (near-miss copy for all 11 chapters, Vault brick count agrees with the breach rule, soft timeout, unlock rule, hold and Ward per chapter). Captures: `node tools/playtest/continue-v2.mjs <out>`.

- **2026-10-22 (night) — Eleven chapters, Ram Ball everywhere, physics gates, handoff refresh.**
  - Shipped on `codex/castle-chapters`: Lumi Breaks Out (chapter 10), Serpent Rivals (chapter 11), a second serpent in Mooncoil, Ram Ball in every level, the power-ready pulse and buzz, and the premium pass on the castle chapters (rendered gems, chips and sparks, glazed and ceramic bricks, Frost rampart, Korr's dais, Kit and Lumi paddle skins, rendered arrows and bow).
  - Physics: the audit found and fixed six traps (pose swaps and spawns now eject the ball); Gatehouse bells, ramps, Ward and colliders were corrected; Lumi had its score-farming, post-Lullaby gap and collider fixes; Lumi Easy spits the ball back so the next serve cannot softlock. Gate commands are in "Current state".
  - Size: lossy colour with exact alpha for the Forge plates cut 3.6 MB; the build is about 14 MB.
  - Housekeeping: CI made manual only; Android smoke test has a startup JavaScript budget; laptop branches merged; `docs/BACKLOG.md`, `prompt-library/` and `design/phase2/` added.
  - Open: premium wiring into earlier levels, APK plus one CI run, owner playtest, Dragon's Hoard. The audit has no Lumi adapter. One docs-only commit (3bcae82) is still only on `origin/recovered/codex-2026-10-22`.

**Older log entries (2026-10-20 and earlier)** are kept as written. Where one calls something "current", "Await the owner" or "five-chapter", it is superseded by the entry above.

**2026-10-20 — Fresh physics audit and Mooncoil Reliquary:** Pig and crab were rechecked with new model routes and phone-browser checks. Carrier had a moving-fighter laser miss during Focus; its projectile/actor clock conversion is now corrected and regression-tested. A new browser chapter is appended at index5 (`?level=6`): violet Mooncoil, three broad masonry banks, falling counterweights, Moonbind/Crystals/Cosmic. Read `docs/MOONCOIL_RELIQUARY.md` and `docs/validation/physics-recheck/`. Original Vault difficulty/layout are unchanged. The prior APK is a separate checkpoint.


**Vault successful-rescue retreat (2026-10-20):** The owner approved the emerald snake/capture presentation. The final requested correction replaces backward cell stepping/fading with a head-led turn and return into the top tunnel, followed by the whole body and tail. The entrance remains visible, and the result cannot cut off departure. See `docs/FANTASY_REFINEMENT.md` and `docs/validation/snake-retreat/`. Difficulty and black-block removal remain deferred. The earlier capture receipts remain historical evidence for their pinned build.

**Snake presentation and capture steering (2026-10-20):** The owner deferred difficulty/black-block removal, requested richer emerald graphics, then expanded the request to the wrapping body, evil laugh, Lumi's body animation and venom melting. The initial graphics-only audit preserved all55 non-draw methods; the subsequent capture pass replaces post-second-strike pose morphing with length-conserving head-led motion, coordinated front/rear layering, a visible jaw laugh and a4.2-second attack-timeline ending. A fallen ball cannot interrupt an already committed capture. The entire400-cell field remains unchanged:45 granite/18 cage-bar cells. Existing dungeon brick art/dust and live combat rules remain. Final evidence is in `docs/validation/fantasy-refinement/`; the historical APK does not include these changes.

**Keep playtest revision (2026-10-20):** The owner reported Bellforge's portrait-playfield load error, unclear villain endings, unusable Tidewheel powers, disconnected water attacks/chains and a visual gap in the original Vault. Current implementation and receipt locations are in `docs/FANTASY_REFINEMENT.md`. The layout now bounds logical paddle space; both villains have staged grounded defeats and new reaction art; Tidewheel gains three earned choices, fixes the 99.999%-charge gate, emits water from the animated claw, and retains cumulative wheel/chain motion. The original Vault reuses the rendered castle hall with its established collision/grid. This revision changes the current canonical web build; B06CDD and APK references in earlier entries remain historical. The new standalone keeps are still outside the released APK. Autonomous branch commit/push remains authorized; no main merge.

**Grounded keep encounters (2026-10-20):** The owner approved Bellforge Run and Tidewheel Citadel, then requested extended supports, more bricks and a smaller crab that hauls a chain, becomes angry, attacks and threatens Lumi through rising water. Both standalone browser encounters now use actual separate scenery, keyed actor poses, moving machinery and swept ball collision. Bellforge has 30 phone-layout bricks and extended physical rolling ramps. Tidewheel has 24 raft bricks, a broad supporting sluice wall, a measured chain grip, lateral patrol, ordinary-hit stun/anger, warned stronger pulls, a descending refuge and an interceptable water shot. A reproduced 26-second centre-catch dead period led to two-hit central raft braces that visibly crack and open a broad lower entry. Numerical rules and final evidence are in `docs/BELLFORGE_PHYSICS.md`, `docs/TIDEWHEEL_PHYSICS.md` and their `docs/validation/` folders. Browser tests are not physical-device or human enjoyment certification. All342 unit tests and the canonical build pass; the released bundle stays B06CDD. Both previews, like Gatebreak, remain outside the five-chapter APK. The artwork archive verifies1,006 records/1,030 aliases/381,626,616bytes. Owner authorization permits design decisions, commit and push on the branch; no main merge.

**Gatebreak recheck and approved keeps (2026-10-20):** The owner clarified RECHECK, not reject. The mission now has nonmagnetic falling capsules, measured Ricochet/Trident launch points, visible shield interception, thunder-only Stormwing and physically combining ignored scouts. Final independent browser evidence is in `docs/validation/starflight-mission/`; all six phone/mode UI cases and eight bounded Easy routes passed on stable source. Ordinary Easy runs took197–211s; earned powers162–173s. Human enjoyment and physical-device performance remain unverified. Both Bellforge Run and Tidewheel Citadel reference boards are now approved and preserved; moving machinery and independent physics are being developed in a separate browser prototype. No new APK inclusion is claimed.

**Starflight campaign design and combat lab (2026-10-20):** Latest owner steering is a dedicated combat-first story/level/asset plan before campaign production. The owner clarified that rescue-to-module progression was an example and explicitly rejected treating it as a fixed formula. Read `docs/STARFLIGHT_CAMPAIGN.md` for reference-informed enemy roles, weapon tradeoffs, distinct encounter objectives, pressure/recovery beats and exact asset production order. Rescue is optional and occasional. Its campaign features are proposals, not implemented encounters. The separate browser lab at `prototypes/starflight/` implements direct flight, smaller ships, seven bounded reactor powers, a single circular chooser, additional enemy families, asteroids and warned gravity. Current branch is `codex/starship-run-prototype`; the green five-chapter release branch is incorporated. The branch passes 266 units; its older Android payload remains byte-identical B06CDD. Thirty-nine new Starflight PNGs decode with empty metadata; artwork archive now verifies 918 unique records / 940 aliases / 320,069,413 bytes. Final phone-browser receipts belong in `docs/validation/starflight/`. The existing APK does not contain Starflight; native packaging, physical-phone performance and human Hard balance remain separate work.

**Completed Android release (2026-10-20):** The five-chapter space/Vault/Frost preview is built, pushed and verified on `codex/space-combat-apk`. CI [39399653237](https://github.com/mahikshith/breaker/actions/runs/39399653237) passes 231 units, all canonical/offline phone suites, layout/polish, compilation/lint and complete Android 15 native touch/fullscreen/lifecycle checks. Downloaded APK: 9,596,473 bytes, SHA256 `B44BC99FE10468DEF35E89F32B85900F8AAD3C16BB92C6C1040A04D850E7BA8E`; payload B06CDD/4071ACEE and offline fonts/licenses are exact. Actual native screenshots were inspected, with the immediate recreated-Nix still explicitly timing-limited. Artifact, verification and remaining physical-phone/human-balance limits: `docs/MOBILE_PREVIEW.md` and `docs/validation/space-combat/native-release.json`. Earlier failed-run entries remain historical. No new prototype content is included in this APK.

**Release investigation (2026-10-20):** The isolated `codex/space-combat-apk` worktree retains canonical B06CDD and offline 4071AC. Native run 39166153838 passed the repaired resume/input gates but lost its emulator later; an unbounded diagnostic then caused the job timeout. CI now bounds test/evidence commands, preserves failing exit codes and retains live/host diagnostics, with a software-renderer safeguard. The emulator exit cause is unproven. No gameplay change or new APK success is claimed; see `docs/MOBILE_PREVIEW.md` for precise evidence and the next native gate.


- **2026-10-19 — Corrected cannon and stronger friendly-fire review:** The owner rejects enemy brick destruction, weak shots and identical space companions. New4190 heavy-shot/salvo attack studies cross complete intact fields and sweep only the paddle; hit/dodge, genuine drag, exact restored field pixels and14 unchanged production/build hashes pass12 phone/ship/pattern cases. Real rendered plasma replaces the rejected mechanical payloads and flat impact stamps. Separate4191 skiff study deploys armour/cannons and now fires roughly14u visible cyan rounds with stronger muzzle flash/recoil; both phone checks pass. Circuit's centre is a closed exit iris, not suction. Original Nix/Tick, Vesper/Latch and Nova/Pin cast status/roles are preserved in `design/phase1/space-companion-role-review.md`. Carrier's raider breach dependency must also change when enemy brick damage is removed, or boarding can stall. Review scope/receipts: `design/phase1/weapon-vfx-v3-review.md`. No production implementation, damage retune, commit, push or APK; visual selection remains pending.

- **2026-10-19 (rejected Hard art replaced; visual gate pending).** Built two isolated moving studies from original cannon art, real dimensional payload PNGs and24 rendered charge frames. Rejected ornamental/bead seeds remain preserved; B impact now breaks into five irregular pieces. Independent12-combination phone/control/full-cycle review passes with zero errors and all14 gameplay/build hashes plus four served4188 routes unchanged. Final movies decode correctly;734 artwork originals/records are verified. Full receipts and prototype limits: `design/phase1/weapon-vfx-v2-review.md`. No new weapon gameplay, commit/push or APK.

- **2026-10-18 (selected magnetic extraction / Quick Volley / mode caps).** Implemented shipFX A and Kit menu B; actual curved suction, shared plasma visuals, four Kit choices and themed physical arrows preserve canonical assets. Added explicit companion caps and no-offensive-self-recharge; saturation retains charge. All196 units and24 Main phone/mode cases pass, including66 Kit groups and actual Ward/cosmic proofs. Required polish/layout/mobile UI pass. One coarse Easy attempt per ship/phone wins; a separate non-targeting Carrier Hard policy loses before the first Nix cast, so no further refill delay is adopted. Stronger Hard beam/battery options are shown but unbuilt pending pick. Preserved670 unique artwork originals/records. Final receipts/screens: `out/space-selected-review/`. No commit/push/new APK.

- **2026-10-18 (Easy pacing, stacking and cosmic art correction; design gates pending).** Banked timed charge replaces instant six-hit refills across all space levels. WIDE grows on repeated pickups and now widens actual art with protected chrome caps. Positive timers and ordinary ball fans stack. All three cosmic balls use the canonical effect. Final18 phone cases and183 units pass; both-phone WIDE/cosmic native proofs, required polish/layout and compact mobile UI pass on sealed final artifacts. Earned Easy routes and four actual-asset design proposals are preserved. Live Kit choices and new cannon/suction effects await the owner's two picks; no new commit, push or APK. See the current pacing brief for exact receipts.

- **2026-10-18 (owner difficulty correction; shared powers and artwork library).** Three level owners reworked target access, panel proportions and productive mothership hits; shared Nix choice powers and input lifecycle checks are integrated. Curved Carrier extraction uses the same actual worker curve and emitter. All171 units pass, with18 final phone/mode/level control cases, visible Nix, zero page errors and separate earned Easy runs. Exact builds and gallery are sealed under `out/space-power-review/final-report.json`; old snapshots/APK remain unchanged. Preserved662 unique artwork originals/records, catalogue and hashes in `artwork-library/`; AGENTS.md and dedicated documentation record upkeep. Owner testing/approval remains required before gameplay commit/push.

- **2026-10-18 (selected Circuit/Forge playable; pause Retry proved).** Parallel selected A/A implementation is delivered with real source-faithful parts, alpha collision and physical poses. Circuit9115383E… and ForgeE8F06046… pass all147 configured tests,20 independent mechanics tests and both-phone actual Main input/pause/Retry/visual checks. Scripted Circuit wins include intrinsic burst (Android natural powers); Forge ordinary-only wins include a legal Android bank route without changing gameplay. Fixed own-door cannon obstruction, measured craft emitters/cradle, full-screen Forge crop seams and late-event state ties. Runtime families are sized/losslessly packed with source/manifest/pixel receipts. Actual galleries and explicitly staged motion are shown to owner. Later B/B variants remain reserved. No gameplay commit/push, main merge, permanent registry admission or APK change.

- **2026-10-18 (Circuit/Forge selected; pause Retry added).** Owner chooses Circuit Breakout and Shutter Forge now, retains Escort Run/Orbital Switch for later distinct levels, and requests pause Retry. Shared Main now has Resume/Retry/Menu; fresh same-mode/level restart clears attempt and frame carryover, preserves saved data. Two source regressions plus12 real-phone-size CDP cases pass onF8EB9BE2… (Carrier/Vault only). Selected-level machinery, gameplay and independent reviews are underway in isolated paths; no finished level/art/ordinary win is claimed yet. No primary commit/push or APK change.

- **2026-10-18 (selected Carrier hybrid; Level2/3 variety; APK delivered).** Owner chose boosted retreat plus finite rebuilding siege and asks different Level2/3 objectives with tension/release. New Carrier review build19376ED4… passes128units, both-phone production gestures/pause/transition input, required polish/layout and mobile UI; ordinary scripted Easy/Medium routes are separately sealed. Hard remains unadmitted after bounded failures. Level2/3 two-option design studies await picks; no new B/C live mechanics/assets claimed. Separate frozen APK CI39129140498 passes and verified artifact12137681701 is delivered. No primary gameplay commit/push or main merge.

- **2026-10-18 (human difficulty feedback; new proposal gate).** Owner finds Carrier too easy, its raiders trivial, Nix unavailable before completion, fighter facing wrong and the mothership inactive; current Vault is too hard. No commit/push approval. Requested three modes and active boss/retreat or rebuilding progression are now source-audited and shown in two actual-asset boards, pending pick. Current Carrier2HP/8s is proposed Easy; current Vault becomes Hard. Full-mode balance/transition implementation is unbuilt. Native APK47bc6b3 follows the distinct recreated top-inset failure; CI39129140498 still pending.

- **2026-10-18 (Boarding Raid selected and integrated; owner review pending).** Selected B supplies a2HP reachable boarding fighter, warned cover breach and an eight-second local extraction with connected final-two-second pull. Ordinary hits on the fighter or targeted housing interrupt; Tick secures actual rescue identities; hull18HP shutdown is optional. Nix uses the existing12-break charge for one manual7s TITAN, without automatic centre activation or SPLIT duplication. Independently reviewed Nix/Tick atlases pack losslessly with zero RGB error/exact alpha. All103 units, both-phone integrated touch/pause/background/Continue and updated mobile UI pass; strict ordinary assisted clears40.708/36.783s preserve three lives. Required polish/layout runs are recorded separately; no human balance/device-performance claim. Evidence and browser URLs above. New gameplay is uncommitted; the APK worker owns frozen checkpoint lifecycle CI39127870146 after the recreated-WebView focus failure in39126881472. No APK success is claimed.

- **2026-10-18 (Carrier browser play accepted visually; urgency redesign required).** Owner played the exact frozen Carrier web candidate at127.0.0.1:4180/breach.html?level=1, likes the artwork/graphics, but finds no rescue urgency, meaningful fighter adversary or useful companion role; slow cover-blocked bolts and hard-to-read hull damage do not create enough stakes. This is visual approval, not gameplay/balance approval. Prepare two image-backed urgency proposals with explicit rescue threat, warned fighter attacks, earned Nix/Tick counter and ordinary-ball completion, then wait for the owner choice before changing live gameplay. No Kit in space, fake finished companion art or real ad/payment/store integration. Current APK remains the exact visual/control checkpoint. Following full read-only native review, lifecycle/test/evidence corrections are pushed as `8618f4c`; [CI39124792121](https://github.com/mahikshith/breaker/actions/runs/39124792121) repeats44 frozen unit tests, both ordinary and offline-packaged browser suites, native compile/lint and expanded held-input stop/resume/recreation/fullscreen checks. Earlier two native failures remain documented; APK still pending.

- **2026-10-18 (parallel B/C isolated milestones reviewed).** Relay B uses real selected art and passes14 focused tests plus both-phone pointer/pause/escape checks. Strict ordinary-only iPhone clear234.6s uses no capsule/offensive power; Android86.3s includes earned TITAN, so it is not pure-normal evidence. Independent WebP/alpha review passes19parts; HTML20.34MB to3.54MB, decodedRGBA estimate40.69MB to9.01MB, with unchanged gameplay/source PNGs. Orbital C passes16 focused mechanics checks and both-phone powered assisted wins71.55/94.92s; strict full normal-only win is unverified. Its first separated C hull/bay/shutter family now has asset-only source/phone/motion proof, while the playable C prototype still uses labelled primitives and remaining C art is unbuilt. Full primary unit suite74/74 passes. No B/C menu/packer/production/APK admission, physical-device performance or human balance is implied. Details: `design/phase1/relay-gameplay.md`, `orbital-level3.md`; bounded review notes under ignored out/.

- **2026-10-18 (Carrier native CI repair; parallel level proof limits).** Initial Carrier CI39122761324 passed all web checks and native compilation/lint but native touch injection hit the Android launcher ANR system dialog. Checkpoint fix `e47d07e` stops that emulator background launcher, acknowledges the OS immersive hint and explicitly awaits app focus; no gameplay assertion or F4863DC5 payload changed. Fresh [CI39123471388](https://github.com/mahikshith/breaker/actions/runs/39123471388) is active and APK publication remains gated on success. Relay now has separately owned real-B-art gameplay plus independent collision tests and an earned ordinary-only iPhone clear, with strict Android/human balance still unproven. Orbital has C-specific mechanics and both-phone powered assisted wins but no production C art or strict normal-only full win; final independent preview UI fixes are underway. Detailed subtasks, reports, hashes and release gaps belong in `design/phase1/relay-gameplay.md` and `orbital-level3.md`. Neither prototype is included in the current APK or main registry.

- **2026-10-18 (Carrier checkpoint pushed; B/C task groups active).** Carrier/current Vault commit `250b266a002f2a691f6ec0c939d5c179d5884b9d` is pushed as mahikshith on new `codex/carrier-mobile-preview`. [Run 39122761324](https://github.com/mahikshith/breaker/actions/runs/39122761324) was triggered automatically by the push; GitHub currently lists this workflow under its existing **Mobile preview** name. Web checks pass and native build/emulator validation is running; APK delivery is not yet claimed. Separate Relay and Orbital owners plus a shared independent physics/playtest reviewer are implementing their task groups in new isolated files under this primary branch, preserving the Carrier payload. Neither later level has production runtime admission or APK inclusion.

- **2026-10-18 (Carrier A playable candidate passes final web checks; APK requested).** Build `F4863DC5A87D6B46A8A1AFDB702C264F432196B851B61B828946DB8AB75A0423` passes 44 unit tests and real bundled two-phone gameplay checks. Public-input assisted deterministic simulated wins record 82.3s iPhone/two lives and 45.2s Android/three lives of game clock (`out/carrier-playable-final/report.json`), not human balance. Independent final captures in `out/carrier-visual-final/` confirm approved A hull/barrels/doors/fighters/panel bricks/paddle/ball, continuous top/bottom safe-area starfield, paddle alpha/collider alignment below 0.006 CSS px at both tips, and clean settled results with no frozen Carrier effects. All 147 images and both house fonts decode; zero page errors. Carrier uses 125×17u paddle, 7.5r ordinary ball and 10r TITAN; Vault keeps its prior dimensions and exclusive Kit. Nix/Tick appearances are selected, but full expressive sprite/animation families and live cast integration remain pending; B/C/D are deferred. The owner asks for an APK, authorizing its necessary checkpoint commit/push/CI on isolated `codex/carrier-mobile-preview` without merging to main. Packaging/native CI is underway; no passed APK or physical-device performance is claimed.

- **2026-10-18 (Carrier A cast Nix/Tick selected; gameplay integration pending).** After choosing only A / Carrier Breakout for current work, the owner explicitly selects its Nix/Tick character designs. This supersedes the same-day cast-open note below; B/C/D remain deferred. The appearances are approved, not completed expressive sprite/animation families or live cast integration. Build A from the actual reviewed assets, preserve their exact visual quality and validate robust physics/collision with playable iPhone/Android runs. Compare real gameplay captures beside the A board and asset-motion preview. EA839F00… remains the last accepted/tested baseline until the new candidate passes; no new gameplay/APK pass or commit/push authorization follows from this selection.

- **2026-10-18 (Carrier Breakout selected for current work).** The owner chooses A / Carrier Breakout for now and defers the other space directions. Its visual preview is accepted for continued implementation. Character artwork is liked, but the cast remains undecided; a ship/level choice must not automatically admit Nix/Tick or any other companion. Continue only the A playfield and machinery. Existing B assets/proofs are preserved as deferred work; C/D remain later possibilities. The A/B asset-motion milestone below remains valid history. No new runtime integration, phone gameplay/APK result or commit/push authorization follows from this direction choice.

- **2026-10-18 (A/B left assets and motion assembly complete).** Delivered the reference-matched independent PNG tranche and deterministic Canvas presentation proof for CarrierA and RelayB. Final `out/space-assets-ab/final/` includes both-phone reference PNGs, A/B motion GIFs and native release diagnostics. Independent image/sequence review confirms five shallow A captive cells versus four B pods, source-specific A panels/flat paddle, dim edge planets, clear header/lower paddle, bay launch and continuous side departure, front-door release/boarding and opened portal. No companion/pilot/portrait was added. The report covers 31 manifest part entries with no missing paths, zero page errors in all four 393×852/412×915 runs and~126 CSS reserve; metadata/alpha and natural-aspect checks are asset-only. Reference stencils still need alignment to actual alpha before gameplay. No new runtime encounter, WebP admission, gameplay balance, real-device performance or APK pass is claimed. Reproduction/limits are in `art/space/ASSETS_AB.md`; A/B data/spec and source records are saved. Active bundle remains EA839F00…; C/D follow and companions stay frozen.

- **2026-10-18 (all four space levels approved; A/B assets first).** The owner approves polished A/Carrier Breakout, B/Relay Raiders, C/Orbital Breakout and D/Eclipse Rescue as levels. Immediate work is the A/B LEFT playfields, with all companions/pilots/portraits frozen. Reference inventory records A's five shallow captive windows, 16 coloured bricks and three fighters; B's four large worker pods, 30 coloured/braced modules, relay/iris and empty skiff. Source-proportional display bounds are mapped to both phone sizes in `design/phase1/space-assets-ab-spec.md`; independent files/pivots and asset-only Canvas assembly motion belong in `space-assets-ab.json`. Production and native assembly review may proceed without another concept choice. The discarded 113/97-cell proxy maps, HP and deadlines do not carry forward. No new gameplay integration, balance, build or APK result is asserted; tested runtime EA839F00… is unchanged. Historical reopened-choice entries below remain history.

- **2026-10-18 (space visuals reopened; four-board review).** The owner rejected proceeding from the native saucer-proxy studies, referred back to the polished original space boards, then explicitly requested both originals plus two fresh same-theme designs before deciding. No fish theme is automatically selected; the prior Relay Raiders pick no longer authorizes current production. Re-shown A/Carrier Breakout and B/Relay Raiders. New C/Orbital Breakout shows Nova moon-hare, Pin maintenance drone and carrier/fighter rescue; new D/Eclipse Rescue shows Zuri gecko, Flit mechanical bird and crescent dreadnought/cannon/escape gate. All four are appearance/story concepts, not finished models, native runtime screenshots or animation proof. New1536×1024 PNGs `design/phase1/img/space-orbital-c-v1.png` and `space-eclipse-d-v1.png` have empty metadata; prompts and review state are saved in `space-options-cd-prompts.md` and `space-direction-review.md`. Await the owner's board or component choice before new production. Accepted mobile geometry/input rules remain requirements; source build EA839F00… is unchanged. No new commit/push/APK.

- **2026-10-18 (expanded Invasion requested; design gate).** After reviewing the mobile baseline, the owner asks for full-screen space graphics without the framed hangar window, more purposeful brick/power content across the midfield, moving attack ships and laser beams, and something concrete to save. Prepare two native layout proposals with explicit objective, win/fail rules, earned powers and warning/recovery windows. Use space-specific Clank crew/drone rescue; keep Kit/Lumi out of Invasion and preserve the lowered paddle/reaction lane. The selected Relay Raiders direction remains relevant; new mechanics/assets still require an image pick and proof. No rescue encounter, new fighter or laser system is silently implemented.

- **2026-10-18 (mobile A baseline complete, uncommitted).** Owner selected A, then removed stage captions and the entire lower track, requested a smaller game-font score and non-blue Kit ring, and restricted Kit to the princess/Vault theme. Invasion retains its earned paddle-core Titan with no hero draw or invisible Kit tap target. Saturn was first restored, then corrected to a near-black, desaturated backdrop so foreground pieces lead. Current build `EA839F00A4683BD3CFD05CB87BDE6DA4B79EDFFF0191621362FB90A75FF9FBAC` passes26 unit tests and both-phone mobile UI/score/once-only persistence/drag/Titan/shield, Vault face/two-finger/Focus/loss/Continue, venom/capture, layout and iOS/Android polish checks. Zero page errors. Reports are under ignored `out/mobile-*-final-v2/`; actual phone review boards are `out/mobile-ui-final-v2/review-{vault,invasion}.png`. Geometry is paddle126CSS reserve, drain+20u, shield+18u, with lower clipping/culling before controls. Independent256 shield/debris/bolt/zoom fixtures passed the same geometry on the preceding UI-only build; current focused shield cases also pass. Vesper v7 model/face/Walk source proof is ready, not production-admitted.

- **2026-10-18 (spaceship audit and next APK candidate).** Existing Invasion already triggers a36HP mothership after formation clearance, eases it into view, moves horizontally, fires bombs and adds wing guns below half health. Actual motion proof and labelled last-brick/HP fixtures are in `out/invasion-dark-final/`; they do not establish an earned whole-level clear. Original Phase1 prologue/intro/taunt/decoy-and-Lumi-beam story beats remain missing. No carrier/fighter-launch sequence is claimed. The isolated APK worktree exactly reproduces current EA839F00… Windows bundle, with canonical LF hash `9ec2bdc019c018ad5109c0497c2acf0ee0501ccc9c4ebfa794470c7918730382`, offline packaged HTML hash `5dde1b121b0e8009cfa3f049e419f55b7aabd7edaeac146fa0c2334192e2adf8`, version0.2-preview/code2, native immersive bar/cutout/gesture handling and stronger full-window/safe-inset/recreation/transient-bar assertions. Browser inset injection passed fractional-DPR stability checks; native compilation/emulator tests have not run. This candidate and CI updates are local, not committed/pushed/published. New space expansion is excluded until selected/built/reviewed.

- **2026-10-18 (physical-phone layout feedback; proposals only).** The owner found the paddle too close to bricks and the screen cluttered. Move the paddle/support as low as safely possible; move lives/AIM into the top HUD in both modes, retain only Kit at bottom left plus necessary paddle input, remove moon, heavy deck/top panels and repeated drag/slide/catch instructions, and use the game's playful score font. At most one short `Aim ready` on the first actual catch/press. Android must hide system bars while preserving cutout/gesture safety for controls. Two actual-asset Canvas layout proposals share a126-CSS-pixel paddle reserve. This lowers the paddle73.14px on393×852 iPhone and98.36px on412×915 Android; fastest vertical TITAN return from the Vault bottom row grows from.251→.403s and.346→.541s. These geometric windows do not establish human comfort. Measurements and128 passing native shield fixtures are in ignored `out/control-metrics/`; proposed shield+18u must remain inside drain+20u, with debris/drop/bolt control clipping. Invasion danger remains64u above its actual paddle, deliberately adding22.71/27.25s of untouched-formation march time. No speed or Vault clock retuning. Native immersive Activity/test changes are local in the APK worktree and still need Android CI. Image pick, implemented phone screenshots and owner OK still precede a new commit/push.

- **2026-10-18 (selected animation integration baseline).** Packed the selected16-frame spinning heater shield and12-frame unfolding brick armour, removed the connecting beam, and integrated connected patterned capture A with visible Lumi, mirrored approach anchoring and aligned grip cue. Build `CFEA2D6FF5A8FE13F2CF539FA9D9F9FDB0581EF6C4469C38961701202FC972EF` passes21 unit tests and the focused native venom suite on both phones (`out/combined-cast-capture-prelayout/report.json`): real contacts, valid/empty/missed/late/drag defence, protected cage, terminal immutability and first-use lesson. Capture has independent mirrored/defence/Continue checks; cast has early/latest/zoom and interruption checks. Final combined layout and screenshot approval remain pending. Brum's coat-v7 removes the grey band/detached fur pendants and retains continuous source face, fitted eyes and actual fists; its motion GIF is three labeled key poses, not a finished clip.

- **2026-10-18 (separate pre-Brum APK delivered).** `coding/mobile-preview` is pushed and complete [CI run39108320738](https://github.com/mahikshith/breaker/actions/runs/39108320738) is green on code085a2c6. It passes all21 unit tests, phone/Ward/venom suites, exact frozen bundle check, Android build/lint and offline Android15 native input/fonts/levels/storage test, then exports screenshots and publishes the APK. Lint0errors/9nonfatal preview warnings are documented rather than suppressed. [APK artifact](https://github.com/mahikshith/breaker/actions/runs/39108320738/artifacts/12129462604), [native evidence](https://github.com/mahikshith/breaker/actions/runs/39108320738/artifacts/12129562329). Local downloaded APK: `C:\Users\mahik\Music\Breach\breaker-mobile-preview\out\apk-delivery\BREACH-preview.apk`,1,854,545bytes, SHA256 `3e34835d9bf44f5d9c82f5f1e0be292dc79019545bf80de8827df997763842a7`; its payload/font/hash/no-network-permission boundary and actual native screenshots were checked. `main` is unchanged; physical-phone comfort/performance/audio and human balance remain unchecked. New Kit/capture/Brum/Relay Raiders are excluded from this frozen preview and continue here.

- **2026-10-18 (new animation and space choices).** The owner selected Kit cast **A / spinning shield unfolds into brick armour**, capture **A / connected coil with visible Lumi**, and space **B / Relay Raiders** (Vesper quadruped pilot and Latch lockfish). Begin selected cast/capture production in parallel with Brum coat refinement; keep existing defence deadlines, collision/route and accepted level unchanged. Vesper/Latch need actual geometry/expression/motion proofs before full families or encounter integration. Brum is planned as a hero/ally whose strong arms open blocked routes and protect the team, not an implemented encounter. The pre-Brum APK checkpoint remains isolated from these new changes.

- **2026-10-18 (face-only control, cast/capture restart, space and mobile checkpoint).**
  - The owner confirms the level is playable and accepts its design. Kit's face must remain the control icon throughout; the old 12-second miniature body replacement and long connecting cast trail are rejected. Native face-only baseline is `485F921A73977C325E535A3500CEA967CB00B16A63042D15110F4D2D31073DF0`; it builds and all 21 unit tests pass. The face-only control subsequently passed both phone sizes (`out/face-always-qa/verification.json`): all eight expressions, touch/Focus/two fingers, charge/Titan/continue/completion, plus Ward/venom/coach/input outcomes; each device recorded 562 face draws and zero body draws. New animation integration still needs fresh final checks after picks.
  - Prepared two isolated real rendered cast studies in `design/phase1/kit-cast-options.md`: spinning heater shield/unfolding armour or separate short guard cast/rising armour. Prepared two capture studies in `capture-options.md`: visible connected-coil hold or cartoon intake/gulp. Neither is active production. Preserve the existing attack cancellation window, Continue and accepted geometry. The current capture defect is a head-centre/princess overlap with live pacing and lingering debris, not a missing level rule.
  - The owner requests parallel space story/cast/ship/cannon animations, plus Brum's dedicated strong-arm brick-smash levels and escalating difficulty. Two space boards are `img/space-carrier-a.png` and `img/space-relay-b.png`; selection is pending. Brum remains the selected first model proof, not a completed family or playable encounter. New difficulty and paid-power systems are proposals; levels should remain winnable with earned tools and readable counterplay.
  - The owner explicitly authorizes a new `coding/` branch, push and Actions APK artifact of the reviewed pre-Brum milestone while this work continues. Created `coding/mobile-preview` in an isolated sibling worktree and reproduced exact old Windows build `3A6B8A8C5368364AFCFCE6BBF7B1994D4598C121C90B45B72FE5BD7E45285EC1`. Its packaging/workflow and CI outcome are documented in that branch's `docs/MOBILE_PREVIEW.md`. This exception supersedes the usual prefix/commit gate only for this checkpoint; `main` is unchanged. New cast/capture production still needs picks and final screenshot OK.
  - Mobile checkpoint commit `bfe54b7` is now pushed with the owner's author/committer identity. Actions run: https://github.com/mahikshith/breaker/actions/runs/39106952788 . The web job passes all 21 unit tests, exact milestone packaging and phone/venom regressions; native Android compilation/emulator validation are still running. Do not claim an APK passed before that outcome. New branch: https://github.com/mahikshith/breaker/tree/coding/mobile-preview .
  - First native run stopped at a premature font-readiness assertion; the game compiled and lint passed. Fixed startup/recreation smoke readiness in checkpoint commit `8d10575`, kept font and canvas checks, and retriggered https://github.com/mahikshith/breaker/actions/runs/39107558744 . APK publication remains gated on the native pass. Current game bytes are unchanged. An existing Kit face is reused as the preview launcher icon.

- **2026-10-18 (A / left face orb integrated and tested; Brum proof selected; uncommitted).**
  - The owner selected the left face-orb board. Packed the eight existing 288-pixel face portraits and integrated a 52-CSS-pixel left orb, circular charge and 12-second expressive body windows. A valid timed Ward spends the existing Vault charge once; Invasion retains centre-return Titan. Paddle and Kit pointer IDs are independent.
  - Added the simple streaming top-tunnel entrance, masked hidden tail, real hit-triggered fury and variable spray, protected cage scope, real partition melt/collapse and actual guarded survival. A first eligible earned-full-charge warning pauses the world for a contextual tap lesson; only Kit's presentation clock advances, and the real charged cast resumes play/persists acknowledgement.
  - Independent checks found and fixed post-loss venom melting and held intro-skip release launching the serve. Tested build: `3A6B8A8C5368364AFCFCE6BBF7B1994D4598C121C90B45B72FE5BD7E45285EC1`, 2225.7 KB; all 21 unit tests pass.
  - **Final phone checks:** `out/kit-orb-final-qa/report.json` covers both levels, eight real face/body crops, touch/Focus, two-finger Kit/paddle ownership, charge preservation, Invasion Titan, presence expiry, loss/continue and seeded completion. Independent corner/cancel/out-and-back/ward-feedback checks pass in `out/kit-orb-independent/report.json`. Native venom checks in `out/venom-coach-final/report.json` cover ten full/empty/missed/late/drag outcomes, hidden/body/FIRE contacts, cage frame/18 bars, zero opening rage, terminal immutability, held pointer/Space skip and the first-use coach (five seconds frozen world, live Kit clock, real tap/resume/acknowledgement). Layout and iOS/Android polish regressions pass with no page errors. The exact build hash is unchanged after these runs.
  - **Recovery and difficulty:** the six baseline bots all lost after Vault charge became defensive. Broader aiming found a real iOS rescue at 30.04 seconds. A strategic Android run at 43.8167 seconds broke 121 bricks, used ten legally replenished Focus catches and collected SPLIT/FIRE/LASER/WIDE/SHIELD/SLOW, without grid/life/charge cheats. Its decisions are in `out/vault-strategic-android/report.json`. These prove recoverability, not tuned human difficulty; physical phones/Safari remain unchecked. Do not reuse the old three-win/three-loss result for these rules.
  - **Review media:** `out/final-review/phone-review.png` compares actual iPhone serve/tunnel and Android guarded impact; `out/kit-ability/kit-ward-motion.gif` shows actual channel, short Cheer/live response and return to face after 12 seconds. The animation uses an explicitly staged charged/two-hit fixture, not an unseeded earned run. A localhost copy of the exact build is `out/venom-prototype/game.html`.
  - **Brum selected:** new cast anatomy boards are `img/cast-v2-anatomy-a.png` and `img/cast-v2-anatomy-b.png`, documented in `03-cast-restart.md`. Mosskeeper has short root-feet, Vesper four paws/tail, Rook wings/fan tail and Latch fins/tail/jaw; Fen/Brum retain justified long arms. The owner selected **Brum** for the first actual model/expression/motion proof. Keep the verified Yeti rig/anatomy, prove continuous face and distinct neutral/welcome/protective states plus actual motion at native size before a full family. No new encounter or completed cast set is implied.
  - Commit/push still wait for the owner's OK after final screenshots. No later story/progression system is silently included.

- **2026-10-18 (Kit ward / variable venom direction; prototype only).**
  - The owner gave Kit a concrete defensive purpose: when his shield bar is full, he can empower threatened partition bricks so venom cannot open a shortcut to the cage. Prepare a first-use player demonstration showing charge, warning, shield cast and the defended outcome; show an empty-charge or missed-defence outcome too.
  - The latest layout request supersedes the standing-body/bar study too: show Kit's face inside a circular charge orb at the bottom left or right. On becoming powered, show his fullbody and real expressions/motion for about 10–15 seconds; the prototype starts at 12 seconds. He channels shield power on a valid charged tap, then braces/reacts and recedes. If the fullbody has receded before a later cast, it can appear for that cast; do not refresh the display every frame or consume an unused charge when he recedes. The display duration does not extend the ward beyond its volley. Use a shorter display only if the longer one obstructs play. The orb is the deliberate minimum-52-CSS-pixel control; there is no permanent fullbody avatar, horizontal charge bar or redundant centre button. Compare left/right placement with the same timed ward. Keep the central thumb-drag lane, lives/AIM and safe inset clear. Win/loss menu expressions are also desired in later result-screen work. Automatic defence remains only an unselected alternative.
  - This supersedes the earlier offensive powered-return versus aimed-attack comparison as the current design focus. Start the proposal from the existing 12-brick charge, with one visible resource; explicitly resolve its relationship to Titan rather than silently adding a second meter or free double spending. The proposed Vault charge serves the ward, while Invasion retains Titan. No permanent hero-level system is approved by this brainstorm.
  - The owner rejected the straight-line venom presentation. Use a changing directional spray with irregular strands, droplets, spread and impact splashes. The effect must still identify the threatened stone and leave the ball readable. Stronger appearance does not establish safe route balance.
  - The serpent must visibly crawl from a simple top tunnel, head facing down as it emerges, before following its normal route. Do not add an entrance meter or reconstruct the level for this. Do not open with a pre-filled static coil or venom attack. Venom requires two separate actual player-ball impacts after entry. Earlier effect boards used a staged two-hit setup near the top; they were not a proposed opening attack and are superseded by the combined entrance/ward demo. Verify continuous entry and body occupancy in the isolated proof.
  - These are isolated design/demo changes. The tested main build still has reaction-only Kit, the original Titan core and no venom or ward mechanic. New image/rule picks precede production; commit and push still require the owner's screenshot OK.
  - **Cast anatomy correction:** after seeing the source-backed Castle Oddities / Starbound Runaways boards, the owner objected that nearly every creature inherited the same long arms. Long arms make sense for Brum/Yeti and Fen/woodland courier; this is not a production selection. Redesign the others around distinct anatomy, tails/wings/root structures, motion and powers instead of the shared Big biped template. Those boards need revision before a new cast pick. Keep sources feasible without making source convenience the design.

- **2026-10-18 (finished Kit/mixed Vault; cast rejected; venom proposed; uncommitted).**
  - **Kit:** completed selected Knight 2/B with 100 real rig frames across eight expressions, continuous face, open helmet and hand-mounted medieval shield. Finished turnaround, eight face portraits, contact sheet, animated preview, source and manifest are under `assets/kit/`, `art/kit.py` and `design/phase1/01-kit-character.md`. Integrated the native-size hero above the control grip with reactions to serve/Focus/combo/loss/danger/win/hit/titan. Source and native/motion proofs passed independent review.
  - **Mixed Vault:** 219 brick objects / 245 HP / 19 deliberate power targets; defended aiming-side changes and two optional eight-brick hanging caches. Jade serpent starts at 12 cells, grows to 20 and takes an initial 39-step path. Its actual idle attack/loss times are 54.292/58.975 s. FIRE/TITAN pierce breakables but bounce from declared granite/bars; solid-corner handling and aim flags were corrected without changing Invasion armour piercing.
  - **Final verification:** build and all ten unit tests pass. Both phone sizes passed Kit touch/control/reaction checks (46 captures, all eight animated rows, no overlaps/errors) and the mixed Vault suite (six complete seeded rallies: three earned wins, three serpent losses; both caches, power combinations, no initial unsupported bricks/free breach, valid path, intro and settled-star result captures). Reports: `out/kit-final-qa/` and `out/vault-final-qa/`. Tested build SHA256: `00A6756BDF0A3B8D0EE61AD6EC00ED6A5D3DE2D0A23A2383B9FA173634301BDB`. Chromium phone emulation does not establish physical-device/Safari feel or human difficulty balance.
  - **Existing regression suites:** `layout.mjs` and both iOS/Android `polish.mjs` runs also pass against the same frozen build with no page errors; captures are in `out/final-layout/`, `out/final-polish-ios/` and `out/final-polish-android/`.
  - **Creature rejection:** the owner rejected the six Ember/Mortar/Polaris source proof images, especially the last pair, and requested the entire set be scratched and redesigned. No full batch shipped. Their source/assets/preview harness are removed from active paths and preserved in ignored `out/rejected-cast-20261018/`; `02-menagerie-cast.md` is withdrawn history. Knight 2 was outside this rejection. Prepare two genuinely new source-feasible cast directions in `03-cast-restart.md`; wait for a new image pick before production.
  - **Venom proposal:** the owner suggested two ball hits provoke a furious serpent into melting black partitions with venom breath. Prepare two isolated effect options with real jade art/crumble reuse. Proposed safeguards: distinct impacts, visible wind-up, one exposed partition target, protected cage frame/bars, recovery/cooldown and measured route/collapse changes. No venom/rage mechanic is in the tested build; image/rule choice comes first.
  - **Kit gameplay-purpose question:** the owner asked why Kit is standing in the UI and proposed earning power/levels through brick hits, then launching an attack or boosting the ball. Current Kit is only a reaction avatar; his special ability is not implemented. Prepare two concrete ability previews: reuse the existing charge/Titan cycle as a visible Shield Slam on a clean return, or spend earned charge with a deliberate aimed special. Make cause/effect, input, animation, snake impact and venom-rage interaction explicit. Do not add XP/store/chapter systems from this brainstorm without a separate decision.
  - **Gates:** no commit or push has occurred. Await the owner's OK for the finished Kit/mixed-level screenshots. New cast, venom and Kit-ability options need their own picks; later story tasks remain pending.

- **2026-10-18 (Knight 2 selected; level challenge and cast expansion; uncommitted).**
  - Build replacement Knight 2/B with a continuous expressive face, open helmet, cobalt armour/cape and a broad medieval shield with a rear grip. The owner explicitly wants a polished finished asset and real animation. First inspect actual Blender proofs beside Lumi, then finish the eight clip families and phone-size integration. No replacement render is approved merely by matching its concept image.
  - The owner initially picked level A, then explicitly rejected its direct rescue route. That pick is revoked; do not integrate the old Open Gate maps. Level 2 must progress beyond Level 1: more bricks, tougher non-direct gates, angled shots, deliberate power-up bricks, a differently coloured longer serpent and a longer measured serpent path. Present two revised image options before integrating a layout. Challenge must come from readable choices, rewards and timing, not just extra HP.
  - The owner also authorized a broader castle/space cast so later levels do not repeat Lumi and Gnash as their entire premise. Two image families were presented in `design/phase1/02-menagerie-cast.md`; **B/Castle to Cosmos was selected**: Ember, the brick golem and the magnetic manta. Build those expressive, animated asset families in parallel with Kit. The alternative space wardens remain unselected references. New asset production does not approve every later chapter system or enemy mechanic.
  - Parallel ownership: character production, revised level options, and new cast concepts. The lead integrates the selected Kit and reviews proofs. All commits/pushes still wait for the owner's OK after screenshots.
  - Two revised level boards were shown: V2-A/Bastion Switchback and V2-B/Twin Keeps. The owner selected **a mix of both**. Build A's defended turns and long jade-serpent detour with B's optional flank and hanging reward cache. Both shown options explicitly included granite/cage blocking FIRE and TITAN while breakable bricks still pierce; implement that declared per-grid rule and preserve it in the aim predictor. Re-measure the combined map rather than borrowing the separate proposals' balance results.
  - Knight source proofs now pass continuous plain-skin cheek/jaw, open helmet, distinct expressions, shield grip/face clearance during sampled Cheer/Hurt/Focus motion, and native scale beside Lumi. The full animation batch is in progress. This is internal source QA; final phone screenshots still require the owner's review.

- **2026-10-18 (design restart and parallel level design; uncommitted).**
  - The owner initially selected the teal courtyard concept, then rejected its Blender implementation: unreadable expressions, malformed hair, a face that looked patched on, and a prop resembling a table-tennis bat. That selection is revoked. The replacement direction is a knight with a proper medieval shield.
  - Removed the rejected character, shared-face refactoring, runtime integration and related tests from the active tree. The discarded work is preserved only in ignored `out/rejected-kit-20261018/`. The original game rebuilds and all five original tests pass. Setup fixes remain. No commits or pushes were made.
  - The owner explicitly requested parallel work: separate character-concept, level-design and independent-reference-review tracks. Prepare image options for both existing levels while character work proceeds; keep each track's files separate. This supersedes the earlier restriction on preparing only one task at a time.
  - **Gates:** show 2–3 image options for each design track and wait for the owner's pick before production changes. Playtest implemented changes at both phone sizes and show screenshots. Commit and push only after the owner's OK.
  - **Quality target:** follow the existing Lumi, serpent and robot art: coherent silhouette, uninterrupted facial surface, large readable eye/lid/brow/mouth changes, consistent light and stable animation anchors. Concept polish alone does not prove a Blender implementation is ready.
  - **Replacement character options:** `design/phase1/01-kit-character.md` and `img/01-kit-v2-1.png` through `01-kit-v2-3.png`. The new options are 1/A teal bareheaded, 2/B cobalt open helmet, and 3/C indigo wayfarer. Recommend 2/B for its clear laugh/worry contrast and credible Knight source mesh. No replacement is selected. First prove the selected face, shield grip, proportions and real animation beside Lumi before the full render batch; review criteria are in `design/phase1/00-quality-target.md`.
  - **Level options:** `design/phase1/level-layout-options.md` and `img/level-layout-a.png`, `img/level-layout-b.png`. A/Open Gate gives a clear opening target and central rescue shaft; B/Twin Fronts rewards angled shots into two flanks. Both are isolated candidate renders using the existing game art; active gameplay sources are unchanged. Recommend A for the first playtest.
  - **Level preflight:** iPhone 393 × 852 and Android 412 × 915 captures use the required fonts and safe insets. Cage preservation, no initial breach, supported starting bricks, legal march bounds and five serve contacts per level/device passed. An untouched serpent attacks at about 25.2 s; a four-hit possible rescue route proves reachability only. Sustained rallies, power-up outcomes and difficulty balance remain unvalidated. These are layout proposals, not completed production playtests.
  - **Next at that checkpoint:** wait for replacement picks. Superseded by the newer entry: Knight 2/B selected; direct-rescue A rejected; harder levels and broader cast requested. Nothing has been committed or pushed.

- **2026-10-18 (local setup and Phase 1, Task 1 concepts; uncommitted).**
  - Re-cloned the latest repo into `C:\Users\mahik\Music\Breach\breaker`; the initial checkout is preserved as `breaker-initial-clone`. Set the required commit identity and created `codex/phase1-kit`.
  - Installed Node 22.23.3 and Python 3.11.16 with owner approval. bpy 5.2.2 actually requires Python 3.13, so art uses a separate environment based on the existing Blender 5.2.2 / Python 3.13.13 installation. Corrected the incompatible setup instructions; local activation commands are in doc 03.
  - Rendered `python3 art/princess.py out/test Idle:1` successfully. Made the output path absolute because Blender resolved the relative render path outside the checkout on Windows. Verified the 168 × 168 RGBA image, stripped its PNG metadata, and made `out/test/princess-preview.png` for review.
  - `npm run build` and all five unit tests pass with Node 22. Baseline `layout.mjs` plus `polish.mjs` at iPhone 393 × 852 and Android 412 × 915 report no errors; screenshots are in `out/baseline/`. Planck's Node >=24 engine warning remains documented in doc 03.
  - The first character concepts and rejected build are archived under ignored `out/rejected-kit-20261018/`; they are not approved assets.
  - **Next:** follow the restart entry above. Review replacement knight and level-layout images, then build only the selected options.

- **2026-10-18 (round 3, merged to `main`).** Owner feedback: remove distractions so the focus is the snake, the princess, the gameplay and the power-ups.
  - **Removed:** torchlight, dust motes, the window bars across Saturn, and the WIDE/TINY HUD chips.
  - **Serpent meter:** a colour-only bar running green → amber → red, with no "% away".
  - **Serpent behaviour:**
    - it grows longer and thicker as it eats, and a swallow bulge travels down its body;
    - it starts sluggish and speeds up (`speedK` in `updateSnake`);
    - bites lunge harder and throw more chips.
  - **Camera:** it pushes in as danger rises (anchored on the paddle line), then zooms to 1.55× on the cage during the attack.
  - **Cage:** a dark stone cell with a cool light on the princess, and a rendered dark-iron `bars.png` (code fallback in `drawBars`).
  - **Full screen:** the canvas covers the whole phone screen, and the edges mirror out (`fillMargins`). The menu has a Full screen button where the browser supports it.
  - **Art v3:** glazed bricks, the new caps and titan ball, a torch-free Vault plate, a calmer Invasion plate, princess `Nervous`/`Panic`, serpent `snarl`/`strike`.
  - **PNG metadata:** Blender writes the .blend path, which contains the home folder name, into PNG metadata. Strip it before committing; see the snippet in doc 02.

- **2026-10-18 (edge-to-edge):** owner asked for a true full-screen layout with no dead band at the top. A dimmer Saturn followed: "the background must not outshine the foreground". They also wanted to actually see WIDE in play.
  - `main.js` `LIFT = 34`: each level is built `H + LIFT` tall, drawn shifted up by `LIFT`, and its pointer y is offset by `LIFT`.
  - The levels draw their top HUD at `this.hudY`. The deck fills into the home-indicator strip via `this.inB`.
  - Invasion `calm()` darkens and desaturates the plate further, and sinks the planet with a radial shade.
  - WIDE leads both drop tables.
  - Layout check: `node tools/playtest/layout.mjs <out>`.

- **2026-10-18 (ChatGPT split):** the owner approved Phase 1 with the recommended defaults. Design work (story scripts, character design, concept art, UI specs) moves to the owner's ChatGPT Pro project; Claude keeps execution.
  - The brief is `docs/handoff/04-chatgpt-design-brief.md`. The owner's steering prompts (ChatGPT project instructions, task prompts, corrections, checklists) are in `docs/handoff/05-chatgpt-steering-prompts.md`. Every art script, in full, is in `docs/BREACH-blender-scripts.md`.
  - The single file to upload to ChatGPT is `docs/BREACH-ChatGPT-handoff.md`: the brief, story plan, game plan, docs 01–03 and a file map. Rebuild it after editing any of those docs: `python3 tools/make_handoff.py`.
  - ChatGPT returns `design/phase1/*.md` and images. To save Claude usage, the owner may have **Codex** build them, guided by `AGENTS.md` at the repo root. Claude is then used only for reviews. Whoever builds pulls `main` first; only one builder works at a time.

- **2026-10-18 (story plan):** owner asked for a dedicated story mode, a prince, locked weapons, a store with skins, and more power-ups (multi-ball multiplier, paddle bullets), backed by research into addictive games.
  - Plan drafted, not built: `docs/STORY_PLAN.md` (live, editable copy: https://claude.ai/code/artifact/5278a4c8-b669-4235-972f-7814c32382d9; also `/mnt/project-files/breaker/plan/STORY_PLAN.md`).
  - Core idea: bricks are alive with light and Princess Lumi is the light; Zorvax the Curator holds her in the Menagerie space prison; Prince Kit is the underdog hero; score becomes Shine, which rebuilds Brickhaven.
  - Waiting on the owner's four decisions at the end of the plan (names, Kit's look, start Phase 1, business model). Nothing in section 9 is built until the owner approves.

- **2026-10-18 (later):** TODO items 1–7 in section 8 are implemented on `wip/polish-pass`:
  - level wiring, crumble vs. big crash, difficulty, continue screen, ferocious serpent with bite marks and the cage attack, nervous and panicking princess, and the Invasion calm-down with its landing beat.
  - Draft screens are in `/mnt/project-files/breaker/playtest/v3/`. Re-shoot them with `node tools/playtest/polish.mjs <out> ios|android`.
  - **Still open:** item 8 (shinier bricks, new capsules, titan ball, princess `Nervous`/`Panic` frames, serpent `snarl`/`strike` faces, all being rendered); then item 9 (playtest Android, tune difficulty) and item 10 (merge to `main`).

---

### 1. Rules from the owner (non-negotiable)

- **Repo:** https://github.com/mahikshith/breaker. `main` holds the last stable build and is merged only after the owner has seen screenshots. Day-to-day work is on `codex/castle-chapters`.
- **Commit identity:** every commit must be authored and committed as `mahikshith <mahikshith97@gmail.com>`. The repo-local config sets this: `git config user.name mahikshith; git config user.email mahikshith97@gmail.com`.
- **No AI attribution anywhere.** That means:
  - no "Co-Authored-By" lines;
  - no session links;
  - no "Generated with …" in commits, code comments, README or docs.
- **Never ask for or paste the owner's GitHub token.**
- **Physics is the top concern.** No chapter ships until the gates in "Current state" pass.
- **Short, single-path instructions.** When the owner has to do something, give one path, not a menu.
- **Strip PNG metadata** from every render before committing (doc 02, section 3).
- **Show screenshots after anything finishes** (screen drafts, character sheets, playtests), for iOS and Android sizes.
- **Quality bar:** the owner (mykee) wants a premium, inventive, addictive iOS/Android game, and nothing that looks "vibe-coded".
  - Favourite references: BALL x PIT, and Arkanoid crossed with Space Invaders.
  - Rejected in the past: pixel art, wisps, jittery foxes, ball-chain snake bodies, rounded blob heads, and uniform faces. Expressions must "say a lot".
- **Scope right now:** the 11 chapters in "Current state" are built. Open work is the "Next" list there and `docs/BACKLOG.md`. Anything in `docs/STORY_PLAN.md` beyond Phase 1 (store, Shine currency, unlockables) needs the owner's go-ahead first.

---

### 2. The game in one paragraph

BREACH is a brick breaker for phones in portrait. The world is 360 units wide and the height adapts to the screen. You drag your thumb to move a chrome paddle and bounce a chrome ball. The story is castle-and-space: Prince Kit and Princess Lumi against serpents, a warden and two keep villains, over 11 chapters (table in "Current state"). Each chapter has its own objective and villain: rescue a crew (Carrier), outpace a serpent (Vault, Mooncoil), break a siege (Frost Warden, Gatehouse), stop machinery (Forge, Bellforge, Tidewheel), play as Lumi (Lumi Breaks Out) or bait two serpents into each other (Serpent Rivals). Shared systems: Focus aim (hold still as the ball lands, slide to aim, lift to fire), the Kit or Lumi face orb that charges and opens a power menu, the Ram Ball, three difficulties (Easy, Medium, Hard in `src/difficulty.js`), a continue screen (placeholder ad and unlock, `src/monetize.js`) and stars per chapter and difficulty.

---

### 3. Tech stack and how to run

- **Code:** plain JavaScript ES modules with Canvas 2D. There is no framework.
- **Physics:** custom deterministic circle-vs-grid physics for the balls (`src/physics.js`), plus **planck.js** (Box2D) for brick debris (`src/debris.js`).
- **Build:** esbuild bundles everything into one self-contained HTML file.
  - `npm install`, then `npm run build`, produces:
    - `dist/breach.html`, the standalone page;
    - `dist/breach-artifact.html`, a body fragment for hosts that supply their own `<head>`.
  - The build is about 14 MB because every rendered image is inlined as a WebP data URI in `src/vault-art.js` (about 12.9 MB).
- **Run locally:** open `dist/breach.html`, or serve the repo root and open `index.html`, which loads `src/main.js` as a module.
- **URL params:**
  - `?level=N` (1-based, 1 to 11) jumps straight into a chapter;
  - `?safe=top,bottom` fakes notch and home-indicator insets in CSS px. iPhone 15 is `?safe=59,34`, a typical Android is `?safe=32,24`.
- **Test hook:** `window.__breach` exposes `{ start(i), level, scene }` (`i` is the 0-based slot) for automated playtests with Playwright and Chromium.
- **Unit tests:** `npm test` runs every `tests/*.test.js` with Node's test runner (506 tests on 2026-10-22). Physics audit: `npm run audit:physics`.
- **Fixed timestep:** 1/120 s (`STEP` in `main.js`).
- **Fonts:** Google Fonts **Lilita One** for game text and **Rubik 600** for numbers, loaded in `index.html`.

#### Art pipeline (Blender, optional to re-run)

All art is pre-rendered in Blender (bpy 5.2.2 from pip, Cycles on CPU, view transform AgX "Medium High Contrast").

- Light comes from a key area light at the **top-left**, and shadows fall down-right everywhere. Code-drawn shadows match: offset +3, +5.
- Scripts live in `art/`:
  - `render_vault_assets.py` and `vault_post.py` render the Vault plate, bars, bricks, ball, paddle, capsules, lantern and torch flame into `assets/vault/` plus `atlas.json`.
  - `render_invasion_assets.py` and `invasion_post.py` render the Invasion hangar plate, bricks, robots (7 expressions × 4 colours), mothership (5 expressions plus a light overlay), bolt and bomb into `assets/invasion/`.
  - `princess.py` restyles the KayKit Rogue model (`assets/models/kk_Rogue.glb`, CC0) into the princess: tiara, expressive eye rig, bell skirt. It renders animation frames to `assets/princess/<Anim>_NN.png`. The `--face` option renders face close-ups.
  - Later scripts (Kit, castle chapters, Rivals, premium pass, FX kit) are listed in `docs/BREACH-blender-scripts.md`; the newest are in `art/rivals`, `art/premium` and `art/fx_kit`.
  - `snake.py` renders the serpent's angular head. It has an `EXPR` dict of expressions (lids, brows, slit pupils, jaw, tongue, fangs) and two facings, `r` and `l`. Output goes to `assets/snake/head_<expr>_<r|l>.png` and `meta.json`.
- `tools/pack_art.py` packs everything into `src/vault-art.js` (`export const ART = {...}`, about 4.5 min). Re-run it after any render, then `npm run build`. Never hand-merge `vault-art.js`: on a conflict take one side and repack.
- **Sprite convention:**
  - sprites are 3 px per game unit, with a margin (usually 4 units) around the footprint;
  - plates are 2 px per unit and cover screen y from -40 to 780, drawn at (0, -40) with size 360 × 820.
- **Runtime registry:** `SPR` in `src/gfx.js`. Vault and shared sprites are keyed by file name (`ball`, `paddle_l`, `cap_split`, `brick_t_2_0`…). Invasion sprites are prefixed `inv_`. `ready(spr)` checks that an image has decoded.
- **Fallbacks:** every sprite has a code-drawn fallback, so the game runs without art.

---

### 4. Look and feel (keep this)

- **Style:** glossy "vinyl toy" pieces with real light, deep shadows, and saturated but not neon colours. Bricks should read like **glazed ceramic tiles**. See `docs/reference/vault-top-down.png`, the look the owner called "even shinier" and wants matched.
- **Not too much yellow.** Gold and yellow are accents only.
- **Ball:** chrome, a 12-unit ball drawn from a 20-unit sprite. The fire variant is molten orange. The titan variant (new) is dark gunmetal with magenta and cyan energy, plus a code-drawn pulsing halo.
- **Paddle:** chrome capsule made of three sprites (`paddle_l`, `paddle_m` stretched, `paddle_r`).
- **Fonts:**
  - Lilita One for all game text, always drawn with a dark outline and drop shadow via `text()` in `gfx.js`;
  - Rubik for the score.

#### Palette

| Use | Colours |
|---|---|
| Vault bricks | sun `#ffc73d`, coral `#ff6f61`, violet `#8f5cf0`, teal `#22c4b0`, blue `#4f9dff`, gold `#f4c542` (gem bricks), granite `#4a4f6e` (indestructible) |
| Invasion rows, top to bottom | `#ff5d8f`, `#ff8a3d`, `#ffd23f`, `#5ccf6a`, `#2ec4b6`, `#3fa8f5`, `#7b6cf6`, `#c46bf0`, `#ff5d8f`; armour `#8d97b3`; power brick `#f4c542` |
| Level accents | Invasion pink `#ff5d8f`, Vault gold `#f4c542` |
| AIM / Focus UI | lilac `#e3b6ff` / `#c46bf0` |
| Combo text | `#ffd36b` |
| Danger | `#ff4d5e` |
| Success | `#7bd88f` / `#7bf2c8` |
| Menu background | gradient `#22284a` → `#141831` → `#0a0c18`, with a vignette and film grain |
| Serpent body | purple `#7a3ccc`, peach belly `#ffc49a`, rose diamonds `#ff6fae`, outline `#1e0a40` |
| Power-ups | ×3 split `#5ccf6a`, FIRE `#ff8a3d`, WIDE `#3fa8f5`, AIM `#c46bf0`, +3 `#f7c948`; new: LASER `#ff4d6d`, SHIELD `#2ec4b6`, SLOW `#7fd6ff`, TINY `#5a5f78` (a bad power-up) |

#### Mobile UI/UX rules already applied

- **Safe areas:** the notch and home indicator are respected. The scene extends under them through `level.drawTopInset()`.
- **Pause:** top-left with a 44 pt touch target, away from the steering thumb.
- **Steering:** relative thumb drag anywhere on screen. The finger never covers the ball.
- **HUD:**
  - level meter top-left ("SERPENT x% away" or "FORMATION n left");
  - score top-right;
  - lives (small chrome balls) and AIM pips at the bottom.
- **Feedback:** haptics through `navigator.vibrate` on big hits, hit-stop, screen shake (trauma model), and pentatonic hit sounds that rise with the combo. All sound is synthesised in `src/audio.js`.

Reference screenshots of the current `main` build are in `docs/reference/`:

- `vault-v2-android.png`
- `invasion-v2-android.png`
- `snake-v2-sheet.png`
- `robot-expressions-ingame.png`

---

### 5. Code map

| File | What it does |
|---|---|
| `src/main.js` | Canvas sizing and safe insets, input mapping, the fixed-step loop (1/120 s), scenes (menu, level, pause, results, continue). `LEVELS` registry. Stars in localStorage per chapter and difficulty. |
| `src/arena.js` | Base class for the space chapters, Vault, Frost and Mooncoil: paddle, balls, serve and Focus aim, power-ups, lives, combo, score, shake, HUD base, the Ram Ball hooks (`ramPierce`). Levels override `hitCell`, `updateLevel`, `draw`, `result`, `continueRun`. |
| `src/fantasy/chapter.js` | `FantasyChapter`: wraps the standalone models (Bellforge, Tidewheel, Gatehouse, LumiTower, SerpentRivals) in the same contract as Arena. Per-chapter powers, preview rect and stars live in its `CHAPTERS` table. |
| `src/fantasy/*.js` models | `bellforge.js`, `tidewheel.js`, `gatehouse.js`, `lumitower.js`, `rivals.js`: pure game models (no drawing). `ram.js` is the shared Ram Ball. |
| `src/fantasy/render.js`, `lumi-render.js`, `rivals-render.js` | Drawing for those models. |
| `src/carrier.js`, `relay.js`, `orbital.js`, `frost.js`, `vault.js`, `mooncoil.js` | The six Arena chapters. `mooncoil-layout.js` is Mooncoil's authored field. `space-companions.js`, `space-weapons.js`, `carrier-physics.js` support the space chapters. |
| `src/physics.js` | Ball stepping with substeps, grid collision, paddle bounce. |
| `src/clearance.js` | `clearance()` and `ejectBall()`: push a ball out of solids dropped on it by pose swaps or spawns. |
| `src/kit.js` | Kit and Lumi face orb, presence window, tap rules, `drawChargeReady` pulse and vibrate. |
| `src/serpent.js`, `serpent-capture.js`, `serpent-retreat.js` | Vault and Mooncoil serpent rules, capture and retreat choreography. |
| `src/debris.js` | planck.js debris: `shatter`, `drop`, `crumble`, kinematic paddle. |
| `src/gfx.js` | Sprite registry `SPR`, `cached()` canvases, ball and FX drawing, `text()`, `POWER` table. |
| `src/difficulty.js`, `src/monetize.js`, `src/prefs.js`, `src/audio.js` | Difficulty table, continue offers (placeholder), localStorage wrapper, WebAudio synth. |
| `src/vault-art.js` | **Generated** by `tools/pack_art.py`. Never edit or merge by hand. |
| `src/invasion.js`, `src/characters.js` | Legacy Invasion level; no longer in `LEVELS`. Kept for reference. |
| `src/starflight/` | Separate flight prototype (not in the game or the APK). |

Full architecture, conventions and test list: doc 02.

---

### 6. Level details

Per-chapter rules live in the model files and these docs: Vault below and in `docs/FANTASY_REFINEMENT.md`; Mooncoil `docs/MOONCOIL_RELIQUARY.md`; Frost Warden `docs/BRUM_LEVEL_PLAN.md`; Bellforge `docs/BELLFORGE_PHYSICS.md`; Tidewheel `docs/TIDEWHEEL_PHYSICS.md`; Gatehouse, Lumi and Rivals `design/phase2/kit-and-lumi-levels.md` and `design/phase2/serpent-rivals.md`; space chapters `docs/SPACE_COMBAT_HANDOFF.md`.

#### The Vault (`src/vault.js`)

Original details below still hold (the later emerald snake presentation, Ward and venom are in doc 02 and `docs/FANTASY_REFINEMENT.md`).

- **Grid:** 20 × 20 cells of 16 units, origin (20, 96). Bricks are 2 cells wide in running bond. `LAYOUT` is an ASCII map:
  - `t` teal, `v` violet, `c` coral, `y` sun, `b` blue — glazed bricks;
  - `g` gold gem brick, which drops a power-up;
  - `#` granite;
  - `=` cage bars.
- **Cage (`POCKET`):** columns 7–12, rows 3–5. Bars are solid to the ball but open to the serpent.
- **Serpent:**
  - It plans a Dijkstra route to the cage, where each brick costs chewing seconds (`CHEW`).
  - Its body is a list of cells. It is drawn as a tapered Catmull-Rom ribbon in canvas, with the rendered head sprite on top.
  - `expression()` picks the face: mood timers first (ouch, hiss, shock), then dizzy, grin, chew, blink, taste, hunt or idle.
- **Ball vs serpent:**
  - hitting the head stuns it and knocks it back one cell; three quick hits knock it back four;
  - hitting the body costs it chewing progress;
  - a falling brick that lands on it crushes it: stun plus knockback.
- **Collapse rule:** bricks that lose their connection to granite, the side columns or the top row fall as planck rigid bodies (`collapse()`). Debris that hits the paddle stuns it ("BONK").
- **Breach:** when a flood fill from the cage reaches the bottom row, `checkBreach()` bursts the cage. The princess runs down the path (`Running_A`), then FRENZY runs for 7 s with 12 balls and permanent fire, then the level is won.
- **Princess:** a sprite sheet with these animations:

  | Animation | Frames |
  |---|---|
  | Idle | 16 |
  | Interact | 12 |
  | Blocking | 8 |
  | Cheer | 16 |
  | Running_A | 12 |
  | Jump_Full_Short | 14 |
  | Scared | 8 |

  She plays at 14 fps, with speech bubbles ("Help!", "Hurry!", "Eek!", "Yay!").
- **Intro camera:** about 3.4 s. It starts on the princess, pans to the serpent's lair, then pulls back. Tap to skip.
- **Stars:**
  - 1 for the rescue;
  - +1 if the serpent never got halfway (`peakDanger < 0.5`);
  - +1 if the score is over 10 000.

#### Invasion (HISTORICAL)

`src/invasion.js` is still in the repo (Arkanoid crossed with Space Invaders: a marching candy-and-robot formation, then a 36-HP mothership) but it is not in `LEVELS` and nothing ships it. Carrier Breakout replaced it. Do not extend it unless the owner asks.

---

### 7. Remaining work

The old TODO list (wire levels to the arena, crumble vs crash, difficulty, continue screen, ferocious serpent, nervous princess, Invasion polish, shinier bricks) is finished and removed. What is left:

- The ordered "Next" list in "Current state".
- `docs/BACKLOG.md`: every saved to-do from the Codex and ChatGPT plans, each marked done, partial, not started or superseded, with the code that proves it. Recommended next five are at its top.
- Owner round-2 feedback still partly open: a repeating aim-hold hint (only a one-time "Aim ready" text exists), and castle-chapter brick shine. Both are in the backlog.

---

### 8. Future, NOT to build now (keep the code extensible)

- **Story mode** chaining levels. The full plan (story bible, chapters, heroes, weapons, power-ups, fusions, store, roadmap) is in `docs/STORY_PLAN.md`; build only after the owner approves a phase. Its chapter map was replaced by the shipped castle chapters, so re-plan before building any of it.
- **Unlockables:** a locked prince or sword shown as "next time" teasers; dragons and mythical beasts as new creatures (first step is Dragon's Hoard).
- **Extensibility:**
  - levels are self-contained classes or models in the `LEVELS` registry in `main.js`; append, never reorder, so save slots stay put;
  - monetisation stays isolated in `monetize.js`;
  - persistent progress goes through `prefs.js`.


---

# Part F: Architecture, art pipeline, build and test

*Source: `docs/handoff/02-architecture-and-pipeline.md`*

## BREACH: architecture, art pipeline, build and test

Last checked against the code on 2026-10-24 (branch `codex/castle-chapters`, 12 chapters, 9 shown in the menu). Status and history: doc 01. Tools and UX: doc 03.

This document is the "how it is built" reference. For current status and next steps, see `01-status-and-next-steps.md`. For tools, connections, skills, memory and UX rules, see `03-environment-skills-ux.md`.

### 1. Aim and goal

- **Product:** BREACH, a premium brick breaker for iOS and Android, portrait only. The tagline is "Break in. Break out."
- **Current goal:** the 0.8-princess-polish APK (versionCode 8) exists; let the owner playtest and tune it (harder but beatable with the right power-ups). `main` is merged only when the owner approves.
- **Reference games:** BALL x PIT, Arkanoid, Space Invaders.
- **Business model (placeholder):** watch an ad to continue, or a one-time "Unlock full game" purchase. `MODE = 'free'` in `src/monetize.js` keeps a free game open. Ads and purchases are local simulations.
- **Later:** story mode and unlockables, planned in `docs/STORY_PLAN.md`. Not built.

### 2. Runtime architecture

```
index.html ── fonts (Lilita One, Rubik), #safe probe div (env(safe-area-inset-*)), <canvas id="game">
src/main.js ─ scenes: menu → level ↔ pause; level → continue → results
  │  resize(): W = 360 world units; H from the screen aspect minus safe insets
  │  input: pointer events → world coords → level.pointerDown/Move/Up; Kit/Lumi orb taps; keys (arrows, space, Esc, 0-9)
  │  loop: requestAnimationFrame, fixed step 1/120 s, draw once per frame
  │  LEVELS registry [{ make(W,H,scale), name, sub, color, next, victory }]  ← append new chapters at the END (save slots)
  ├─ src/arena.js  class Arena (shared gameplay for the Arena chapters)
  │     paddle, balls, serve + Focus aim, power-ups, shots, shield, lives, combo/score, shake, HUD base, Ram Ball hooks
  │     hooks a level overrides: hitCell(c,r,ball), updateLevel(dt,dtReal), shotHit(shot), draw(g), background(),
  │       previewRect(), result(), continueRun(), skipIntro(), ramPierce(brick)
  ├─ Arena chapters: carrier.js, vault.js, relay.js (Circuit), orbital.js (Forge), frost.js, mooncoil.js (+ mooncoil-layout.js)
  ├─ src/home.js, home-art.js  home page and chapter map (key-art hero from store/key-art.png via tools/pack_home_art.py); STORY lists the nine menu slots
  ├─ src/tutorial.js, tutorial-draw.js, purpose.js, portraits.js  ball-control tutorial and per-chapter purpose cards
  ├─ src/castle-specials.js, castle-art.js  armour, mine, chest and coin bricks on the castle chapters
  ├─ src/fantasy/chapter.js  FantasyChapter: adapter that gives the standalone models the Arena contract
  │     models (no drawing): bellforge.js, tidewheel.js (+ tidewheel-siege.js, tidewheel-stages*.js, stage-ui.js: four-stage Siege), gatehouse.js, lumitower.js, rivals.js, hoard.js; shared ram.js, purpose.js (villain purpose clocks; purpose-render.js draws them)
  │     drawing: render.js (all but Lumi and Rivals), lumi-render.js, rivals-render.js
  │     CHAPTERS table in chapter.js holds each chapter's powers, menu preview rect and star rule
  ├─ src/physics.js   makeGrid, makeBall, stepBall (substepped circle vs grid/walls/paddle), floodEmpty
  ├─ src/clearance.js clearance()/ejectBall(): shortest push that frees a ball from solids placed on it
  ├─ src/kit.js       face orb (Kit, or Lumi in her chapter), presence window, tap rules, drawChargeReady pulse + vibrate
  ├─ src/serpent*.js  Vault/Mooncoil serpent rules, capture, retreat
  ├─ src/debris.js    planck.js: shatter, drop, crumble (non-physics fade for single bricks), kinematic paddle, killY
  ├─ src/gfx.js       SPR registry, loadImg/artLoaded/ready, cached() canvases, drawBall, FX particles, text(), POWER table
  ├─ src/difficulty.js, audio.js (WebAudio synth), prefs.js (localStorage with fallback), monetize.js (continue offers)
  ├─ src/vault-art.js GENERATED by tools/pack_art.py: export const ART = { sprites, kit, snake*, lumiFaces, lumiPaddle, rivals, fxKit, ... } (see the end of tools/pack_art.py)
  ├─ src/invasion.js, characters.js  legacy Invasion level, not in LEVELS
  └─ src/starflight/  separate flight prototype, not in the game
```

#### Shared mechanics (all levels)

- **Ram Ball** (`src/fantasy/ram.js`): three centre-third paddle hits arm it; the next centre hit launches a giant ball (`RAM` radius 13.2, 2.5 s or 14 bricks). It ploughs only what the level's `ramPierce(brick)` allows (default: ordinary 1-HP bricks; Arena levels exclude `grid.unpierceable` kinds). Other contacts are normal hits and the ram bounces.
- **Ball radius 7** in every princess level: `BALL_R` in `src/fantasy/ram.js` (the Ram ball is larger and restores it).
- **Villain purpose clocks** (`src/fantasy/purpose.js`): Gatehouse, Lumi Breaks Out, Serpent Rivals and Dragon's Hoard show a clock that ends in losing Lumi; Bellforge shows a lift meter. Purpose cards (`src/purpose.js`) introduce each chapter.
- **Serpent and brute skins**: `SERPENT_SKINS` (`src/vault.js`) holds the snake skins (jade, emerald, ember fire serpent); the Frost Warden atlas builder takes any frames folder, so a new brute reuses the Yeti physics (`prompt-library/16-brute-reskin.md`).
- **Power-ready pulse** (`src/kit.js`): when the orb fills, it double-beats with a halo for 5 s, then glows until used; `navigator.vibrate` buzzes (Android VIBRATE permission in the manifest).
- **Clearance** (`src/clearance.js`): after any pose swap, knock-back, rebuilt cell or spawn, call `ejectBall` so no ball sits inside a solid.
- **FX kit** (`ART.fxKit`): rendered gems, chips, sparks and glints. Do not draw bare stroked rings or dots as effects.
- **Shared floors pattern** (Gatehouse, Lumi, Rivals): a climb transition between floors; lives, score and charge carry over; Continue keeps the floor.

#### Key conventions

- **Coordinates:** world units with y pointing down. The play area is 360 wide.
  - Everything in a level is drawn in world coordinates.
  - `main.js` translates the canvas by `inT`, so y = 0 is the top of the safe area.
- **Light and shadow:** light comes from the top-left, and shadows are offset (+3, +5) (`SHADOW` in gfx.js).
- **Balls:**
  - radius 7 in the Vault and every princess level (`BALL_R`), 7.5 in Carrier-family chapters (titan 10; set in each constructor);
  - speed 345 × `opt.speed` × the rally ramp (up to 1.28);
  - the ball is lost at `drainY = paddle.y + 20`; the missed-ball shield plane is `paddle.y + 18`.
- **Paddle:**
  - y is `paddleY(H, minY, uiScale) = round(max(minY, H - 126 / uiScale))`;
  - base width is per level (the Vault 70 to 74, Carrier 125); the paddle art has three stretchable slices (`ART.lumiPaddle` and the Kit skin follow the same contract);
  - no heavy lower deck/track; debris, drops and bolts are clipped/culled before `playClipY = H - 64 / uiScale`.
- **Grid cells:** a `Uint8Array` of kinds and a parallel `hp` array.
  - The Vault adds `bid` (cell → brick id) because its bricks span 2 cells.
  - The Vault declares `unpierceable = [GRANITE, BARS]`. FIRE/TITAN bounce from those kinds and pierce ordinary bricks. Other levels keep their original piercing behaviour. Solid-corner normals ignore neighbouring pierced cells.
  - Aim preview carries the caught ball's titan flag and current FIRE state and retains `unpierceable` when cloning the grid.
- **Fallbacks:** every rendered sprite has a code-drawn fallback, checked with `ready(spr)`.
- **Debris:** planck uses 16 world units = 1 m, gravity 34 m/s², and `MAX_PIECES` 140.

#### Invasion (`src/invasion.js`): HISTORICAL

Not in `LEVELS` any more; Carrier Breakout replaced it. The file and its `inv_*` sprites stay for reference. Original rules (11 x 9 formation, 36-HP mothership) are in git history and doc 01, section 6.

#### The Vault (`src/vault.js`, slot 1)

- **Grid:** 20 × 20 cells of 16 units, origin (20, 96). The ASCII `LAYOUT` is in the file. Glazed bricks are 2 cells wide in running bond.
- **Brick kinds:** SUN, CORAL, VIOLET, TEAL, BLUE, GOLD (gem, drops a power-up), GRANITE (indestructible anchor), BARS (cage).
- **Selected mixed layout:** 219 brick objects, 245 normal-hit HP and 19 deliberate gem targets. Staggered granite requires aiming-side changes. The left SPLIT support and right FIRE support each release eight hanging bricks; collapsed gems do not automatically issue powers.
- **Serpent state:** `{cells, hist, chew, chewing, prog, stun, dir, look, faceLeft, path, open, hits, flinch, mood, moodT, alpha, fleeT}`.
  - It plans with Dijkstra (`snakePlan`), with cost equal to chew seconds (`CHEW`) and granite blocked.
  - `expression()` chooses the head face.
  - The body is drawn by `drawSnakeBody()`, a Catmull-Rom tapered ribbon with belly, diamonds and gloss bands.
  - The head uses `ART.snakeJade` (cell 176, unit 44, `expr` and `dir` maps), drawn at 1.45×. Entry permits the full down-facing angle before joining normal turning. The body uses matching jade/ivory/mint colours; the original purple family is preserved.
  - Twelve segments stream down through a dark top tunnel; tail segments stay hidden above the grid and are excluded from ball/laser/debris contacts. Normal movement begins immediately after entry, with growth up to 20 cells. The untouched initial route is 40 steps / cost 65.45998. Measured idle attack/loss are 55.0833/59.7667 seconds after active handover; cinematic time is additional.
  - Two separate incoming ball contact episodes queue fury; lingering overlap and simultaneous volley contacts cannot instantly fill both hits. Head hits retain their existing stun/knockback; body hits retain flinch/chew setback. Those reactions finish before a 1.4-second marked wind-up, organic spray and 1.2-second recovery. No opening attack occurs without hits.
  - Venom chooses one exposed useful granite partition within 68 units, protecting the cage roof/frame/bars. Failed defence can melt the real brick and trigger support collapse; guarded defence preserves that target for this volley. The spray has irregular pulsing streams, droplets and splashes. Fury waits while moving if no useful target is available. World mutation stops after a loss.
  - First eligible full-charge warning pauses world time for the contextual Ward lesson. Kit's presentation clock keeps animating. A valid charged cast acknowledges `wardCoachAck` and resumes the real volley, with no practice currency or free charge. Intro-skip touches/Space are consumed through release.
- **Collapse:** a flood fill from anchors (granite, bars, the edge columns, the top row). Unanchored bricks are converted into `debris.drop` rigid bodies.
- **Phases:** `intro` (camera zoom), then `rescue`, then `escape` (princess runs the breach path), then `frenzy` (12 balls for 7 s), then won. Losing goes to `caught`.
- **Princess:** `PRINCESS` sheet (cell 168, unit 56, feet 4, `anims {name: {row, n}}`), played at 14 fps by `play(anim, loop)` and `updatePrincess()`.
- **Background:** calm dark castle plate; torches and lantern effects were removed in the earlier polish pass.

#### Prince Kit

- `art/kit.py` builds selected Knight 2 from `kk_Knight.glb`: continuous cheek/jaw skin, open silver helmet, cobalt costume, broad shield fitted behind the hand and a surface-fitted face rig.
- 100 frames across Idle, Focus, Grin, Shock, Worried, Cheer, Hurt and Laugh. 168 × 168 RGBA, 56-unit cell, roughly 42-unit character, feet margin 4, 14 fps. Shock/Hurt hold their final frame; the other clips loop.
- `tools/pack_art.py` validates clips against `assets/kit/meta.json` and packs `ART.kit`, including eight 288-pixel portraits in `faces` (columns match the animation row indices). `drawKit()` selects body frames; `drawKitFace()` selects portraits.
- Selected UI A is a 52 CSS pixel left face orb with circular charge. A full charge opens one 12-second expressive body window, fitted within the same corner footprint. A later cast can reopen a receded body; an active window does not continually refresh. Receding consumes no unused charge. Kit's presentation clock also runs during the paused first-use lesson.
- Vault reserves the existing 12-brick charge for Ward. During the marked warning, a deliberate orb tap starts a 0.18-second shield transfer and spends once; protection lasts for the volley, not the 12-second character display. Invasion retains centre-return Titan; its orb gives the corresponding hint. Hero levels, store and chapter progression are still plans.
- The native input layer owns paddle and Kit pointer IDs independently: crossing drags, out-and-back gestures and cancellation cannot cast, and a second-finger orb tap preserves the paddle drag. Orb and complete grip envelope have 8 CSS pixel separation on both requested phone sizes.
- Source proofs, eight portraits, a rendered turnaround and an animated preview are documented in `design/phase1/01-kit-character.md` and its manifest. Rejected creature production is archived outside active assets in ignored `out/rejected-cast-20261018/`.

### 3. Art pipeline (Blender, `art/`)

**Setup:**
- `python3 -m pip install bpy==5.2.2 pillow numpy`, which needs Python 3.13 and runs headless (works in the Linux session as well as Windows). Python 3.11 cannot install it.
- Look standard: the Gatehouse first-pass render. Newest scripts: `art/premium`, `art/fx_kit`, `art/rivals`, `art/power_icons`, `art/paddle_skins`.
- `art/princess.py` resolves its output directory to an absolute path before passing it to Blender, so relative command-line outputs stay inside the caller's working directory on Windows.
- Cycles on CPU. Set threads to 2 if running two jobs in parallel on 4 cores.
- Colour management: AgX, look "Medium High Contrast". Orthographic camera; key area light top-left.

#### Commands

| Command | What it produces |
|---|---|
| `python3 art/render_vault_assets.py all` | Vault plate, bars and sprites (args `all\|plate\|bars\|sprites\|post`, plus `--fast`) |
| `python3 art/render_invasion_assets.py all` | Invasion plate, bricks, ship and bots (`all\|plate\|static\|ship\|bots\|sprites\|post`) |
| `python3 art/princess.py assets/princess Idle:16 Interact:12 Blocking:8 Cheer:16 Running_A:12 Jump_Full_Short:14 Scared:8` | Princess frames; add `--face` for 4× face close-ups and `--samples N` to set samples |
| `python3 art/kit.py assets/kit Idle:16 Focus:12 Grin:12 Shock:8 Worried:12 Cheer:16 Hurt:8 Laugh:16` | Selected Knight 2's 100 real animation frames; `--face`, `--yaw`, `--samples`, `--threads` support proof renders |
| `python3 art/snake.py assets/snake [expr ...] --dirs r,l --samples N --px N` | Serpent head expressions |
| `python3 art/snake.py assets/snake-jade --palette jade --dirs r,l --samples 64 --px 4 --threads 2` | Matching jade head family, preserving original purple assets |
| `python3 art/premium/premium.py all` | Premium pass for earlier chapters: glazed and ceramic bricks, shards, glints, Frost backdrop |
| `python3 art/fx_kit/fx_kit.py` | Shared gems, stone chips, spark streaks (`ART.fxKit`) |
| `python3 art/rivals/rivals_art.py` | Serpent Rivals lure runes, Twin Seal, ward plates, chamber floor, shuttered window, clash burst |
| `python3 art/power_icons/power_icons.py`, `python3 art/paddle_skins/paddle_skins.py` | Power icon family and Kit and Lumi paddle skins |
| `python3 tools/pack_art.py` | Packs active rendered families into `src/vault-art.js` as WebP data URIs (quality about 86–90); about 4.5 min; `src/vault-art.js` is about 12.9 MB. Never hand-merge it: take one side and repack |
| `npm run build` | Builds `dist/breach.html` and `dist/breach-artifact.html` |

#### Output conventions

- **Sprites:**
  - 3 px per world unit, with the margin given in each `atlas.json` entry (usually 4 units);
  - `drawSize = px / 3`;
  - bricks are drawn at `(x - margin, y - margin)` with size `(w + 2·margin, h + 2·margin)`.
- **Plates:** 2 px per unit, covering y from -40 to 780; draw them at (0, -40) with size 360 × 820.
- **Asset folders:**

  | Folder | Contents |
  |---|---|
  | `assets/vault/` | `atlas.json`, `plate`, `bars`, `brick_<y\|c\|v\|t\|b>_<1\|2>_<dmg>`, `brick_gold_1_0`, `brick_granite_*`, `ball`, `ball_fire`, `ball_titan` (new), `paddle_l/m/r`, `cap_<split\|fire\|wide\|focus\|burst\|laser\|shield\|slow\|shrink>`, `lantern`, `torch_flame` |
  | `assets/invasion/` | `atlas.json` plus the sprites listed above |
  | `assets/princess/` | `<Anim>_NN.png` frames (168 px cells after packing) |
  | `assets/kit/` | 100 `<Clip>_NN.png` frames, `meta.json`, portraits, expression/turnaround/contact sheets and animated preview |
  | `assets/snake/` | `head_<expr>_<r\|l>.png` and `meta.json` |
  | `assets/snake-jade/` | 26 jade head renders and matching palette metadata |
  | `assets/models/` | KayKit CC0 GLBs (Knight, Mage, Rogue); the princess is built from Rogue |

#### Character rules

The owner has given feedback on several rounds of character drafts.

- **Serpent:**
  - an angular, faceted head, never round or "bally";
  - pink brows, so expressions read;
  - shader-painted iris with lids;
  - expressions: idle, blink, taste, hunt, chew0, chew1, hiss, ouch, dizzy, shock, grin; snarl and strike are being added.
- **Princess:**
  - a tiara with a rose gem, big expressive eyes with lids and brows, and a bell skirt;
  - every animation has a matching face.
- **Robots:** glossy toy robots in 4 colours with 7 expressions.
- **Mothership:** a saucer with an alien face and 5 expressions.

#### Before committing renders

Strip PNG text metadata, because Blender embeds the source .blend path:

```
python3 -c "import glob;from PIL import Image;[Image.open(f).save(f) for f in glob.glob('assets/**/*.png',recursive=True)]"
```

Then run `pack_art.py` and the build again.

### 4. Build, test, publish

- **Build:** `npm install`, then `npm run build` (esbuild, `tools/build.mjs`) writes `dist/breach.html` (about 14 MB, single file) and `dist/breach-artifact.html` (body fragment).
- **Unit tests:** `npm test` runs every `tests/*.test.js` (694 tests on 2026-10-24). Add a test beside any model or rule you change.
- **Physics gates (run before anything ships):**
  - `npm run audit:physics`: `tools/playtest/physics-audit.mjs` with adapters in `audit-adapters.mjs`. Headless bot, idle and ram variants over every adapter level x Easy/Medium/Hard x 393x852 and 412x915. Flags errors, NaN, out-of-bounds, tunnelling, stuck balls, flat or crawling balls. Writes `docs/validation/physics-audit/report.json`. Filters: `--level a,b`, `--difficulty`, `--phone`, `--variant`; add `--no-write` on any filtered run so it does not overwrite the full report. Full audit 2026-10-24: 444 runs, 0 failures.
  - `node tools/playtest/physics-audit-checks.mjs --quick`: seeded Gatehouse checks (details in `tools/playtest/physics-audit-checks.md`).
- **Playtests and screenshots** (Playwright with Chromium, driving `window.__breach`; `<outDir>/shots/` must exist for some):
  - `node tools/playtest/layout.mjs <out>` and `node tools/playtest/polish.mjs <out> ios|android`: layout and polish regressions.
  - Playtests now enter chapters through the home page and chapter map (`polish.mjs`, `layout.mjs`, `frost.mjs`, `mooncoil.mjs`; bot helpers in `aim-bot.mjs`). Others: `castle-premium.mjs`, `fantasy-visual.mjs`, `fantasy-responsive.mjs`, `rivals-review.mjs`, `mooncoil.mjs`, `bellforge.mjs`, `tidewheel.mjs`, `kit.mjs`, `venom.mjs`, `vault-v2.mjs`: per-chapter phone captures and routes. A bot win proves reachability, not human difficulty.
  - Device sizes: iPhone 393 x 852 with `?safe=59,34`; Android 412 x 915 with `?safe=32,24`; device scale factor 2.
  - Always check for page errors, and screenshot the serve, play, powers, loss/continue and win screens for both devices. Show them to the owner.
- **Release:** `npm run build`, then `node tools/pin-sha.mjs` (re-pins `config/mobile-preview.json`), then `node tools/prepare-android.mjs` (must pass; it refuses a hash mismatch). The mobile workflow is manual only (`workflow_dispatch`): run it once per release candidate after those pass. Current APK: 0.8-princess-polish, versionCode 8, mobile-preview run 40045371055, artifact `BREACH-eleven-chapter-android-28` (`docs/MOBILE_PREVIEW.md` still describes the old five-chapter build).
- **Publish the playable build:** the owner has used a claude.ai Artifact (doc 03). `dist/breach.html` works on any static host.
- **Mobile wrapping:** Capacitor WebView in `android/`; `viewport-fit=cover` and `env(safe-area-inset-*)` are handled.


---

# Part G: Environment, connections, skills, memory, UI/UX rules

*Source: `docs/handoff/03-environment-skills-ux.md`*

## BREACH: environment, connections, skills, memory, UI/UX rules

Last checked 2026-10-24. Status and history: doc 01. Code and build: doc 02.

This document covers where everything lives and how the work has been done. Any new session, from any assistant, should read all three handoff docs:

- `01-status-and-next-steps.md`: current state, owner rules, next steps and the progress log;
- `02-architecture-and-pipeline.md`: code architecture, art pipeline, build, test, publish;
- this document.

**Habit (owner's request, 2026-10-18):** keep these three documents current. Update them at the end of every work session, or whenever something meaningful lands, so another session or tool can take over at any time.

### 1. Owner and working agreement

- **Owner:** mykee (GitHub `mahikshith`, mahikshith97@gmail.com).
- **Commits:**
  - author and committer must be exactly `mahikshith <mahikshith97@gmail.com>`;
  - no AI or assistant attribution anywhere (commit trailers, code, docs, README);
  - never ask for, or paste, the owner's token.
- **Show drafts as you go.** The owner wants to see draft images whenever a piece is finished, especially UX screens, characters and assets. Post screenshots or sheets for iOS and Android sizes.
- **Product feedback rules:** premium, inventive, urgent, addictive; never "vibe-coded"; expressions must say a lot; not too much yellow; keep the playful font and colours.
- **Scope:** 12 chapters are built, nine shown in the menu (doc 01, "Current state"). Anything beyond Phase 1 of `docs/STORY_PLAN.md` needs the owner's go-ahead. Kit is the hero of the castle chapters except Lumi Breaks Out, where Lumi holds the paddle.
- **Owner direction (2026-10-23 night):** quality bar is `store/key-art.png`; villains need a visible purpose like the snakes; reuse archetypes with new skins (yeti to bull, bison or ape via `prompt-library/16-brute-reskin.md`; snake to fire serpent); levels hard but beatable with the right power-ups; use subagents on cheaper models; no goose chases.
- **Owner style:** short, single-path instructions; physics first; show screenshots after anything finishes; harder but fair; the owner posts renders back in the project chat and generates art with M365 Copilot from `prompt-library/`.
- **Work style:** the owner explicitly requests multiple parallel helpers with separate file ownership and independent review. Show progress with images. Parallel preparation must not bypass the concept-pick or commit/push approval gates.

### 2. Where things live (connections and locations)

| What | Where |
|---|---|
| Source repository | https://github.com/mahikshith/breaker. `main` is stable and merged only after the owner reviews screenshots; the working branch is `codex/castle-chapters` (Android 0.8-princess-polish; `main` merges need the owner's approval). `codex/wip-lumi-audit` is throwaway and safe to delete. Pushed through the Claude GitHub App installed on the repo (2026-10-17); any tool with push access can continue. |
| Playable build (current host) | claude.ai Artifact https://claude.ai/artifact/63xdvoxT6HPvo7rU8buR9s, published from `dist/breach-artifact.html`. Only the owner's Claude account can update it. Another tool should host `dist/breach.html` elsewhere (GitHub Pages, Netlify, itch.io…). |
| Project shared folder (Claude Projects only) | `/mnt/project-files/breaker/`: |
| | • `GAME_PLAN.md`, the original design plan, also copied to `docs/GAME_PLAN.md`; |
| | • `characters/`, character sheets and GIFs shown to the owner (snake-v2-sheet, princess-v2-sheet, robot-expressions-ingame…); |
| | • `playtest/`, playtest screenshots (v2 iOS and Android); |
| | • `lookdev/`, Blender lookdev renders: `vault-top-down.png` is the "shinier" reference, plus `vault-side-view.png`; |
| | • `drafts/`, the first screen drafts. |
| | The key reference images are copied into the repo at `docs/reference/` and `docs/drafts/` so other tools can see them. |
| Story and next-level plan | `docs/STORY_PLAN.md` in the repo. The live, editable version is a Claude Doc at https://claude.ai/code/artifact/5278a4c8-b669-4235-972f-7814c32382d9 (owner's account). A copy is in `/mnt/project-files/breaker/plan/`. |
| ChatGPT design partner | Brief: `docs/handoff/04-chatgpt-design-brief.md`. Steering prompts: `docs/handoff/05-chatgpt-steering-prompts.md`. Art scripts bundle: `docs/BREACH-blender-scripts.md`. Single upload file: `docs/BREACH-ChatGPT-handoff.md`, which concatenates the brief, `STORY_PLAN.md`, `GAME_PLAN.md`, docs 01–03 and a file map. Regenerate it after editing any of those: `python3 tools/make_handoff.py`. |
| Game-dev skills | In the repo at `skills/gamedev/` and `skills/ponytail/` (also `/mnt/project-files/skills/`). `AGENTS.md` says which skill to read for which kind of work. |
| Prompt library for the owner | `prompt-library/` in the repo (copy at `/mnt/project-files/breaker/prompt-library/`): copy-paste prompts for Copilot art and design. Start at its `README.md`. |
| Backlog and design notes | `docs/BACKLOG.md` (all to-dos), `design/phase2/*.md` (levels, Rivals, Dragon's Hoard, premium pass, new concepts) |
| Assistant memory (Claude Projects) | `/tmp/claude/memory/team/silo/MEMORY.md` (index) and `breaker-project.md` (project facts, rules, art direction). Their content is summarised in this document. |
| Third-party assets | KayKit Adventurers (CC0) GLB models in `assets/models/`. Fonts: Google Fonts Lilita One and Rubik (OFL). Everything else is original Blender renders or code. |
| Network notes | npm and raw.githubusercontent.com were reachable from the build container; many asset websites were blocked, which is why the art is rendered rather than downloaded. |

### 3. Tools and skills used

#### Tools

| Tool | Version / use |
|---|---|
| Node | 22, plus esbuild 0.28 (bundler) and planck 1.5 (Box2D debris physics) |
| Python | 3.13 for bpy 5.2.2 (Blender as a Python module, Cycles CPU), Pillow and numpy. Python 3.11 cannot install the pinned bpy release. |
| Playwright + Chromium | Automated playtests and screenshots at phone sizes |
| git / GitHub | Version control. Commits use the owner's identity. |
| claude.ai Artifact | Hosting the playable build for the owner |

#### Owner laptop (Windows) setup, 2026-10-18

The Linux cloud session works in `/home/claude/breaker` with Node, Python 3.13 and bpy 5.2.2 headless; no special setup is needed there. The notes below are for the owner's Windows laptop.

- Checkout: `C:\Users\mahik\Music\Breach\breaker` (started at `9c74978`; use the current working branch from doc 01). The initial checkout is preserved beside it as `breaker-initial-clone`.
- Git 2.55.0, Node 22.23.3 and Python 3.11.16 are installed. The existing Node 24 and other Python versions remain available.
- Art uses a separate Python 3.13.13 environment based on the installed Blender 5.2.2 runtime. bpy 5.2.2 requires Python 3.13 ([package metadata](https://pypi.org/project/bpy/5.2.2/)); Python 3.11 remains available for other tooling.
- Playwright and Chromium are installed outside the repo. No game dependencies were added or changed.
- Planck 1.5.0 declares Node >=24. Node 22 emits an engine warning, but the build, all five unit tests, and the baseline layout/polish checks on both phone sizes pass. Keep this warning visible when diagnosing future Node failures.

For a PowerShell session using the installed tools:

```powershell
$taskTools = Join-Path $env:LOCALAPPDATA 'Programs\breach-tools'
$env:Path = (Join-Path $taskTools 'node-v22.23.3-win-x64') + ';' + $env:Path
Set-Alias python3 (Join-Path $taskTools 'python313\Scripts\python.exe')
$env:PW_MODULE = ([Uri](Join-Path $taskTools 'playtest\node_modules\playwright\index.mjs')).AbsoluteUri
$env:PYTHONUTF8 = '1'
```

`PYTHONUTF8` lets the handoff generator read and write the Unicode Markdown correctly on Windows. Baseline screenshots are under `out/baseline/`.

#### Game-dev skills

These skill guides were saved in the project at `/mnt/project-files/skills/gamedev/`. They are plain Markdown and can be pasted into any assistant.

- **Used heavily:** `game-ui-ux`, `game-feel` (juice, hit-stop, shake, feedback), `input-systems`, `physics-tuning`, `level-design`, `create-game-assets` (art direction brief, asset manifest, preview sheets), `audio-design`, `prototype-fast`, `performance-optimization`.
- **Available but not used** (the stack is plain Canvas 2D): `phaser-core`, `phaser-arcade-physics`, `pixijs-rendering`, `shader-programming`, `procedural-gen`, `puzzle`.

**Ponytail** (`/mnt/project-files/skills/ponytail/`) is a lean-code guide: plain modules, no framework unless needed. That is why the game is vanilla JS and Canvas.

### 4. UI/UX layout and rules followed

#### Screen layout (portrait, world 360 units wide)

Entry flow: home page (key-art hero, one PLAY button) opens the chapter map (nine princess chapters in story order, stars and locks), then a purpose card, then play; How to play replays the tutorial. No Full screen button in the native app.

```
┌──────────────────────────────┐  ← notch / Dynamic Island: scene art continues underneath
│ [II]  LEVEL METER        SCORE│  slim bar under the status bar: pause, level meter, score (playfield lifted by LIFT=34)
│                    COMBO ×n   │
│   ┌──────────────────────┐   │
│   │   PLAYFIELD (bricks, │   │  castle chapters: windows, serpents, villains; space chapters: hull, panels, fighters
│   │   characters, ball)  │   │
│   └──────────────────────┘   │
│        ═══ PADDLE ═══         │  paddle at about H - 126/scale: above the thumb, no lower deck or track
│  (Kit/Lumi face orb, lower left; lives and power chips)  │
└──────────────────────────────┘  ← home indicator: scene extends underneath
```

#### Interaction and UX rules

- **Movement:** relative drag anywhere (gain 1.15). The finger never needs to touch the paddle or cover the ball.
- **Serve:** "Slide to aim · lift to launch", with a dotted predicted path that shows the first bounces.
- **Focus aim:**
  - holding the thumb still when a ball lands catches it, if there is an AIM pip;
  - "CATCH READY" brackets show that it is armed;
  - time slows to 0.25×; slide to aim, lift to fire; there is a 1.6 s limit, shown as a ring;
  - a coach bubble teaches it until it has been used 3 times.
- **Face orb and powers:** Kit's face (Lumi's in her chapter) sits in a 52 CSS px orb, lower left. It charges from productive hits, pulses and buzzes when ready (5 s double-beat with halo, then a steady glow), and a deliberate tap opens the power menu or casts. Where a chapter uses the Titan core, a centre return makes a TITAN ball.
- **Ram Ball:** three centre-third paddle hits in a row arm it ("RAM READY"); the next centre hit launches a giant ball that ploughs ordinary bricks. Same in every level.
- **Power-up capsules:** glossy pills with labels. A bad power-up (TINY) has a flashing red outline.
- **Feedback:** every hit gives sound, a small shake and particles. Big moments add hit-stop, haptics, slow motion and big text pops (BREACH!, TITAN!, FRENZY!).
- **Danger:**
  - a red pulsing vignette and heartbeat sound as the serpent closes in or the formation nears the line;
  - the HUD meter turns from green to amber to red.
- **Clarity:**
  - single broken bricks crack and fade in about 0.4 s;
  - only big crashes leave physics debris, so nothing is mistaken for the ball;
  - backgrounds stay calm and dark, because the owner found the Invasion hangar too flashy.
- **Edge to edge:** the scene art fills behind the status bar and home indicator. UI never sits inside the insets. The playfield starts directly under the slim HUD bar, with no dead band. Backgrounds must never outshine the foreground.
- **Safe areas and inputs:** safe areas respected; 44 pt minimum touch targets; nothing interactive in the top corners except pause.
- **Menu:**
  - a BREACH logo (gradient Lilita One with a thick outline) over floating glossy bricks;
  - Easy, Medium and Hard buttons, then 11 chapter cards (order 0, 2, 3, 1, 4 to 10) with live previews, star ratings and number badges; keys 1 to 9 and 0 start chapters 1 to 10 on desktop;
  - a sound toggle.
- **Results card:** title, stars that pop in with sound, score lines, and Retry/Next or Menu/Try again buttons.
- **Continue card (built):** reason for the loss, a countdown ring, watch ad then continue, unlock the full game, and "No thanks". Ads and purchases are placeholders in `src/monetize.js`. Each level's `continueRun()` undoes its own loss.

#### Typography and colour

- **Fonts:**
  - Lilita One for all game text, drawn via `text()` with a dark outline (0.16 × size) and drop shadow;
  - Rubik 600 for the score.
- **Palette:** the full table is in doc 01, section 4.
  - Backgrounds are deep navy and indigo (`#0a0c18` to `#22284a`).
  - Minimal yellow: gold is an accent only. Each chapter has its own accent colour in `LEVELS` (`src/main.js`).
  - AIM is lilac `#e3b6ff`, danger is `#ff4d5e`, success is `#7bd88f`.


---

# Part H: Repository file map

These are tracked and non-ignored working files, except individual render frames, which are counted instead:

```
assets/princess: 119 PNG renders
assets/kit: 111 PNG renders
assets/snake: 26 PNG renders
assets/snake-jade: 26 PNG renders
assets/vault: 53 PNG renders
assets/invasion: 78 PNG renders

.gitattributes
.github/workflows/mobile-preview.yml
.gitignore
AGENTS.md
README.md
android/.gitignore
android/app/build.gradle
android/app/src/androidTest/java/com/mahikshith/breach/preview/MobileSmokeTest.java
android/app/src/main/AndroidManifest.xml
android/app/src/main/java/com/mahikshith/breach/preview/MainActivity.java
android/app/src/main/res/drawable/app_icon.png
android/app/src/main/res/drawable/kit_face.png
android/build.gradle
android/gradle.properties
android/settings.gradle
art/brum.py
art/castle/README.md
art/castle/proof/window.png
art/castle/source/window_back_raw.png
art/castle/window_kit.py
art/char_preview.py
art/fantasy-machinery/NERRA_V2.md
art/fantasy-machinery/REACTIONS.md
art/fantasy-machinery/SOURCE.md
art/fantasy-machinery/WATER_SHOT.md
art/fantasy-machinery/extract-nerra-v2.py
art/fantasy-machinery/extract-reactions.py
art/fantasy-machinery/extract-water-shot.py
art/fantasy-machinery/extract.py
art/fantasy-machinery/final-prompts.json
art/fantasy-machinery/grounding-prompts.json
art/fantasy-machinery/measure.py
art/fantasy-machinery/nerra-v2-data.mjs
art/fantasy-machinery/nerra-v2-prompts.json
art/fantasy-machinery/production-prompts.json
art/fantasy-machinery/prompts.json
art/fantasy-machinery/proof-nerra-v2.py
art/fantasy-machinery/proof-reactions.py
art/fantasy-machinery/proof.py
art/fantasy-machinery/proof/android-assembly.png
art/fantasy-machinery/proof/asset-audit.json
art/fantasy-machinery/proof/collision-coverage.json
art/fantasy-machinery/proof/collision-measurements.json
art/fantasy-machinery/proof/crusherClaw-collision.png
art/fantasy-machinery/proof/gateClaw-collision.png
art/fantasy-machinery/proof/grounding-source-composite.png
art/fantasy-machinery/proof/ios-assembly.png
art/fantasy-machinery/proof/keypose-assembly.gif
art/fantasy-machinery/proof/korr-idle-collision.png
art/fantasy-machinery/proof/korr-release-collision.png
art/fantasy-machinery/proof/korr-stagger-collision.png
art/fantasy-machinery/proof/korr-windup-collision.png
art/fantasy-machinery/proof/measure-log.json
art/fantasy-machinery/proof/nerra-v2/android-pull.png
art/fantasy-machinery/proof/nerra-v2/ios-hurt.png
art/fantasy-machinery/proof/nerra-v2/ios-idle.png
art/fantasy-machinery/proof/nerra-v2/ios-pull.png
art/fantasy-machinery/proof/nerra-v2/ios-step.png
art/fantasy-machinery/proof/nerra-v2/keyposes.gif
art/fantasy-machinery/proof/nerra-v2/native-poses.png
art/fantasy-machinery/proof/nerra-v2/old-balcony-overlap.json
art/fantasy-machinery/proof/nerra-v2/verification.json
art/fantasy-machinery/proof/nerraBody-collision.png
art/fantasy-machinery/proof/parts-contact.png
art/fantasy-machinery/proof/reactions/contact.png
art/fantasy-machinery/proof/reactions/korr-dazed-ios.png
art/fantasy-machinery/proof/reactions/korr-defeat-ios.png
art/fantasy-machinery/proof/reactions/nerra-defeat-ios.png
art/fantasy-machinery/proof/reactions/nerra-fury-ios.png
art/fantasy-machinery/proof/reactions/verification.json
art/fantasy-machinery/proof/verification.json
art/fantasy-machinery/proof/water-shot-native.png
art/fantasy-machinery/reactions-data.mjs
art/fantasy-machinery/reactions-prompt.json
art/fantasy-machinery/source/background-pair-v1.png
art/fantasy-machinery/source/background-pair-v2.png
art/fantasy-machinery/source/bell-cradle-v1.png
art/fantasy-machinery/source/bellforge-sheet-v1.png
art/fantasy-machinery/source/bellforge-sheet-v2.png
art/fantasy-machinery/source/grounding-sheet-v1.png
art/fantasy-machinery/source/nerra-motion-v1.png
art/fantasy-machinery/source/nerra-motion-v2.png
art/fantasy-machinery/source/reactions-v1.png
art/fantasy-machinery/source/tidewheel-bricks-v1.png
art/fantasy-machinery/source/tidewheel-sheet-v1.png
art/fantasy-machinery/source/water-shot-v1.png
art/fantasy-machinery/verify.py
art/fantasy-machinery/water-shot-prompt.json
art/frost-warden/SOURCE.md
art/frost-warden/pack.py
art/frost-warden/proof.py
art/frost-warden/renders/frost-warden.blend
art/frost-warden/renders/hurt_00.png
art/frost-warden/renders/hurt_01.png
art/frost-warden/renders/hurt_02.png
art/frost-warden/renders/hurt_03.png
art/frost-warden/renders/idle_00.png
art/frost-warden/renders/idle_01.png
art/frost-warden/renders/idle_02.png
art/frost-warden/renders/idle_03.png
art/frost-warden/renders/recover_00.png
art/frost-warden/renders/recover_01.png
art/frost-warden/renders/recover_02.png
art/frost-warden/renders/recover_03.png
art/frost-warden/renders/render-progress.json
art/frost-warden/renders/render.json
art/frost-warden/renders/strike_00.png
art/frost-warden/renders/strike_01.png
art/frost-warden/renders/strike_02.png
art/frost-warden/renders/strike_03.png
art/frost-warden/renders/victory_00.png
art/frost-warden/renders/victory_01.png
art/frost-warden/renders/victory_02.png
art/frost-warden/renders/victory_03.png
art/frost-warden/renders/walk_00.png
art/frost-warden/renders/walk_01.png
art/frost-warden/renders/walk_02.png
art/frost-warden/renders/walk_03.png
art/frost-warden/renders/windup_00.png
art/frost-warden/renders/windup_01.png
art/frost-warden/renders/windup_02.png
art/frost-warden/renders/windup_03.png
art/frost-warden/source/Yeti.gltf
art/frost_warden.py
art/fx_kit/fx_kit.py
art/fx_kit/proof/fx.png
art/glaze2/build.py
art/glaze2/source/bricks.json
art/glaze2/source/bricks.png
art/hoard/build.py
art/invasion_post.py
art/kit.py
art/kit_cast.py
art/lumi_faces.py
art/lumi_paddle.py
art/lumi_sheet.py
art/mooncoil/BACKGROUND.md
art/mooncoil/README.md
art/mooncoil/brick_assets.py
art/mooncoil/brick_audit.py
art/mooncoil/proof-render.log
art/mooncoil/proof-seed.log
art/mooncoil/proof/asset-report.json
art/mooncoil/proof/family.png
art/mooncoil/proof/seed-brick-b-2-0.png
art/mooncoil/proof/seed-manifest.json
art/mooncoil/proof/seed.png
art/mooncoil/reliquary-background-source.png
art/mooncoil/source/crack_b_1_1.png
art/mooncoil/source/crack_b_2_1.png
art/mooncoil/source/crack_c_1_1.png
art/mooncoil/source/crack_c_2_1.png
art/mooncoil/source/crack_t_1_1.png
art/mooncoil/source/crack_t_2_1.png
art/mooncoil/source/crack_v_1_1.png
art/mooncoil/source/crack_v_2_1.png
art/paddle_skins/paddle_skins.py
art/paddle_skins/proof/skins.png
art/power_icons/README.md
art/power_icons/power_icons.py
art/power_icons/proof/icons.png
art/power_icons/proof/menu-frost.png
art/premium/premium.py
art/premium/proof/premium-in-context.png
art/premium/proof/premium-sprites.png
art/premium/source/records.json
art/princess.py
art/render_invasion_assets.py
art/render_vault_assets.py
art/rivals/proof/contact.png
art/rivals/proof/mock.png
art/rivals/rivals_art.py
art/rivals/rivals_sheet.py
art/round2/build.py
art/round2/source/R02.png
art/round2/source/R03.png
art/round2/source/R05.png
art/round2/source/R06.png
art/round3/build_warden_atlas.py
art/round3/cut.py
art/round3/cut_drop2.py
art/round3/fit_shapes.py
art/round3/parts-drop2.json
art/snake-emerald/SOURCE.md
art/snake-emerald/extract.py
art/snake-emerald/prompt.json
art/snake-emerald/proof/anchors.png
art/snake-emerald/proof/contact.png
art/snake-emerald/proof/source-verification.json
art/snake-emerald/proof/verification.json
art/snake-emerald/source/heads-v1.png
art/snake-emerald/verify.py
art/snake.py
art/space/ASSETS_AB.md
art/space/COMMON_ASSETS.md
art/space/background-a-footprint-prompt.md
art/space/background-a-prompt.md
art/space/background-b-footprint-prompt.md
art/space/background-b-prompt.md
art/space/background-b-repair-prompt.md
art/space/brick-pink-prompt.md
art/space/carrier-panels-crops.json
art/space/carrier-panels-prompt.md
art/space/circuit-companions/normalize.py
art/space/circuit-companions/production-prompts.json
art/space/circuit-companions/source/latch-original.png
art/space/circuit-companions/source/vesper-original.png
art/space/circuit/README.md
art/space/circuit/prepare.py
art/space/circuit/source/craft-family.png
art/space/circuit/source/phase-badge.png
art/space/common-crops.json
art/space/common-prompt.md
art/space/companions/normalize.py
art/space/companions/preview.mjs
art/space/companions/production-prompts.json
art/space/companions/source-receipts.json
art/space/companions/source/nix-expressions-reference.png
art/space/companions/source/nix-family-original.png
art/space/companions/source/nix-reference.png
art/space/companions/source/tick-reference.png
art/space/companions/source/tick-secure-original.png
art/space/export_backgrounds.py
art/space/forge/background-source.png
art/space/forge/cannon-source.png
art/space/forge/panel-family-source.png
art/space/forge/prepare.py
art/space/forge/projector-source.png
art/space/forge/provenance.json
art/space/forge/stabiliser-cover-source.png
art/space/forge/stabiliser-open-source.png
art/space/normalize_carrier.py
art/space/normalize_common.py
art/space/parts-report.json
art/space/parts-source.json
art/space/prepare_parts.py
art/space/preview_common.py
art/space/production-prompts.json
art/space/source/a-cyan-reference.png
art/space/source/a-paddle-reference.png
art/space/source/a-pink-reference.png
art/space/source/a_cannon.png
art/space/source/a_cannon_v2.png
art/space/source/a_doors.png
art/space/source/a_fighter.png
art/space/source/a_hull.png
art/space/source/a_worker.png
art/space/source/b_cannon.png
art/space/source/b_hull.png
art/space/source/b_iris.png
art/space/source/b_pod.png
art/space/source/b_portal.png
art/space/source/b_skiff.png
art/space/source/b_worker.png
art/space/source/background-a-footprint-original.png
art/space/source/background-a-original.png
art/space/source/background-b-footprint-original.png
art/space/source/background-b-original.png
art/space/source/background-b-repaired-original.png
art/space/source/brick-pink-original.png
art/space/source/carrier-panels-original.png
art/space/source/common-atlas-original.png
art/space/source/orbital-bay-original.png
art/space/source/orbital-doors-original.png
art/space/source/orbital-generation-receipts.json
art/space/source/orbital-hangar-reference.png
art/space/source/orbital-hull-original.png
art/space/source/orbital-hull-prompt.md
art/space/source/orbital-hull-reference.png
art/space/source/orbital-parts-report.json
art/space/source/orbital-production-prompts.json
art/space/source/orbital-reference-crops.json
art/space/source/orbital-reference-pane.png
art/space/source/plume.png
art/space/weapons-v2/rejected-draft-01/helix-charge-08.png
art/space/weapons-v2/rejected-draft-01/helix-flight-08.png
art/space/weapons-v2/rejected-draft-01/helix-impact-04.png
art/space/weapons-v2/rejected-draft-01/reactor-charge-08.png
art/space/weapons-v2/rejected-draft-01/reactor-flight-08.png
art/space/weapons-v2/rejected-draft-01/reactor-impact-04.png
art/space/weapons-v2/rejected-draft-01/weapons_v2.py
art/space/weapons-v2/seed-revision-1/helix-charge-08.png
art/space/weapons-v2/seed-revision-1/helix-flight-08.png
art/space/weapons-v2/seed-revision-1/reactor-charge-08.png
art/space/weapons-v2/seed-revision-1/reactor-flight-08.png
art/space/weapons-v2/validate.py
art/space/weapons_v2.py
art/starflight-arsenal/SOURCE.md
art/starflight-arsenal/extract.py
art/starflight-arsenal/source.png
art/starflight-equipment/PROMPT.md
art/starflight-equipment/extract.py
art/starflight-equipment/source-v1.png
art/starflight-storm/SOURCE.md
art/starflight-storm/assembled.png
art/starflight-storm/assembly-proof.png
art/starflight-storm/checks.json
art/starflight-storm/extract.py
art/starflight-storm/native-proof.png
art/starflight-storm/player-reference.png
art/starflight-storm/production.json
art/starflight-storm/prompt-v1.txt
art/starflight-storm/proof.py
art/starflight-storm/source-v1.png
art/starflight-v2/SOURCE.md
art/starflight-v2/asset-checks.json
art/starflight-v2/enemy-family-source-v1.png
art/starflight-v2/extract.py
art/starflight-v2/native-checks.json
art/starflight-v2/native-extraction-proof.png
art/starflight-v2/production.json
art/starflight-v2/prompt-v1.txt
art/starflight-v2/proof.py
art/starflight/asset-checks.json
art/starflight/background-source-v1.png
art/starflight/extract.py
art/starflight/extract_weapons.py
art/starflight/native-extraction-proof.png
art/starflight/production.json
art/starflight/proof.py
art/starflight/ships-source-v1.png
art/starflight/weapons-prompt.md
art/starflight/weapons-source.png
art/themed-bricks/build.py
art/themed-bricks/preview.py
art/tidewheel-glaze/build.py
art/vault-grid.json
art/vault_post.py
art/vault_scene.py
art/vault_side.py
art/vault_tower.py
art/vesper.py
artwork-library/CATALOGUE.md
artwork-library/PRECOMMIT_NORMALIZATION.json
artwork-library/README.md
artwork-library/SPACE_BOARDS.md
artwork-library/assets/circuit-companions/latch--ff5b9a5f8a80.png
artwork-library/assets/circuit-companions/latch_00--876d7e76963d.png
artwork-library/assets/circuit-companions/latch_01--cdab5b114225.png
artwork-library/assets/circuit-companions/latch_02--f5eb95ea0042.png
artwork-library/assets/circuit-companions/latch_03--6f3dd57adebb.png
artwork-library/assets/circuit-companions/latch_04--cf2ff9b72a5a.png
artwork-library/assets/circuit-companions/latch_05--1ee23cb5ca45.png
artwork-library/assets/circuit-companions/latch_06--c72a1d78cb58.png
artwork-library/assets/circuit-companions/latch_07--b1b1d9441bef.png
artwork-library/assets/circuit-companions/manifest--880fd8f27334.json
artwork-library/assets/circuit-companions/vesper--d20ca517d250.png
artwork-library/assets/circuit-companions/vesper_00--4ce37dce57a3.png
artwork-library/assets/circuit-companions/vesper_01--8ca66e541d54.png
artwork-library/assets/circuit-companions/vesper_02--a11de8e09cbb.png
artwork-library/assets/circuit-companions/vesper_03--5d7866ac6a75.png
artwork-library/assets/circuit-companions/vesper_04--e1ec030c13e6.png
artwork-library/assets/circuit-companions/vesper_05--9e30f9316c1d.png
artwork-library/assets/circuit-companions/vesper_06--c648158a0c02.png
artwork-library/assets/circuit-companions/vesper_07--93660dd68257.png
artwork-library/assets/circuit-companions/vesper_08--ef3fdd37caef.png
artwork-library/assets/fantasy-machinery/bell--f9ee6022f523.png
artwork-library/assets/fantasy-machinery/bellCradle--20cfb11d5e7c.png
artwork-library/assets/fantasy-machinery/bellforge-background--6189c80623fa.png
artwork-library/assets/fantasy-machinery/brick-coral--ccbed3518f64.png
artwork-library/assets/fantasy-machinery/brick-ivory--ccd4cc382b0f.png
artwork-library/assets/fantasy-machinery/brick-sage--4f7b5b5a1aa0.png
artwork-library/assets/fantasy-machinery/chain-v2--b9f662acef63.png
artwork-library/assets/fantasy-machinery/counterweight--07fb3238f63e.png
artwork-library/assets/fantasy-machinery/crusherClaw--3ce2ce1fea40.png
artwork-library/assets/fantasy-machinery/gate--04cab2d6c478.png
artwork-library/assets/fantasy-machinery/gateClaw--eca4a8c12a9f.png
artwork-library/assets/fantasy-machinery/gateClawV2--8233aae478bd.png
artwork-library/assets/fantasy-machinery/gateFrame--87dbdf9ca727.png
artwork-library/assets/fantasy-machinery/hopperStudy--bbc2d0f6d680.png
artwork-library/assets/fantasy-machinery/korr--e1f2ab4f5b58.png
artwork-library/assets/fantasy-machinery/korr-dazed-v1--b471614a2428.png
artwork-library/assets/fantasy-machinery/korr-defeat-v1--d2a054abc055.png
artwork-library/assets/fantasy-machinery/korr-idle--30e5da9d16d7.png
artwork-library/assets/fantasy-machinery/korr-release--eedd6b91a8d6.png
artwork-library/assets/fantasy-machinery/korr-stagger--a1743526bfaa.png
artwork-library/assets/fantasy-machinery/korr-windup--47c5e0598e4d.png
artwork-library/assets/fantasy-machinery/leverMount--9076a3a8c9ba.png
artwork-library/assets/fantasy-machinery/lift--b5c336570676.png
artwork-library/assets/fantasy-machinery/manifest--b810545f1c1c.json
artwork-library/assets/fantasy-machinery/nerra-dazed-v1--6f2c100dfa91.png
artwork-library/assets/fantasy-machinery/nerra-defeat-v1--49b8f352ee5f.png
artwork-library/assets/fantasy-machinery/nerra-fury-v1--6678778a9157.png
artwork-library/assets/fantasy-machinery/nerra-v2--0ef6a3017d29.png
artwork-library/assets/fantasy-machinery/nerra-v2-hurt--6098a9d7f4bd.png
artwork-library/assets/fantasy-machinery/nerra-v2-idle--3909b5ddfb3b.png
artwork-library/assets/fantasy-machinery/nerra-v2-manifest--defc7d7d75af.json
artwork-library/assets/fantasy-machinery/nerra-v2-pull--d5a5cbf8e51b.png
artwork-library/assets/fantasy-machinery/nerra-v2-step--19bcf7cd5881.png
artwork-library/assets/fantasy-machinery/nerraBody--ef5644f573d6.png
artwork-library/assets/fantasy-machinery/plinth--d9e3877ba5fa.png
artwork-library/assets/fantasy-machinery/raft--6382b5972389.png
artwork-library/assets/fantasy-machinery/ramp--d37022aa5f8e.png
artwork-library/assets/fantasy-machinery/ratchet--0578c721ec5d.png
artwork-library/assets/fantasy-machinery/reactions-manifest--11b2958079f6.json
artwork-library/assets/fantasy-machinery/refugeBalcony--df3dca5a3242.png
artwork-library/assets/fantasy-machinery/releaseLever--a4a0add6dcb1.png
artwork-library/assets/fantasy-machinery/sluiceWall--9603f5603b9a.png
artwork-library/assets/fantasy-machinery/tidewheel-background--c11ddbb3f2f5.png
artwork-library/assets/fantasy-machinery/water-shot--e9a23f6276be.png
artwork-library/assets/fantasy-machinery/water-shot-manifest--44172b349146.json
artwork-library/assets/fantasy-machinery/wheel--1ca697216202.png
artwork-library/assets/frost-warden/hurt_00--b3d34c0b08f6.png
artwork-library/assets/frost-warden/hurt_01--51fe5e686d49.png
artwork-library/assets/frost-warden/hurt_02--ce91e4c79429.png
artwork-library/assets/frost-warden/hurt_03--62d58f235602.png
artwork-library/assets/frost-warden/idle_00--ce8e40bbecf8.png
artwork-library/assets/frost-warden/idle_01--22e964cac627.png
artwork-library/assets/frost-warden/idle_02--34802cd3cef6.png
artwork-library/assets/frost-warden/idle_03--919509dfe2b7.png
artwork-library/assets/frost-warden/manifest--f6114eebceb4.json
artwork-library/assets/frost-warden/recover_00--cf14eb2888f7.png
artwork-library/assets/frost-warden/recover_01--6bff30c18de7.png
artwork-library/assets/frost-warden/recover_02--5d674e2cbc83.png
artwork-library/assets/frost-warden/strike_00--637819fd4185.png
artwork-library/assets/frost-warden/strike_01--655fb8e173fa.png
artwork-library/assets/frost-warden/strike_02--668825ce0cef.png
artwork-library/assets/frost-warden/strike_03--9f3c8da0e3d8.png
artwork-library/assets/frost-warden/victory_00--05871c13053f.png
artwork-library/assets/frost-warden/victory_01--104af417ccc2.png
artwork-library/assets/frost-warden/victory_02--d2354a635cf0.png
artwork-library/assets/frost-warden/victory_03--59f52e93dfe4.png
artwork-library/assets/frost-warden/walk_00--4ded11317d08.png
artwork-library/assets/frost-warden/walk_01--14cfa1878bb3.png
artwork-library/assets/frost-warden/walk_02--58d71eab0f8b.png
artwork-library/assets/frost-warden/walk_03--7d12988289af.png
artwork-library/assets/frost-warden/warden--ed5808d9e72c.png
artwork-library/assets/frost-warden/windup_00--7c8de15e910e.png
artwork-library/assets/frost-warden/windup_01--a3f8b7a3c770.png
artwork-library/assets/frost-warden/windup_02--97749b7092d8.png
artwork-library/assets/frost-warden/windup_03--ddd85921f2bd.png
artwork-library/assets/kit-cast/Armour_00--8ce04d98207a.png
artwork-library/assets/kit-cast/Armour_01--066c02816a84.png
artwork-library/assets/kit-cast/Armour_02--70b501621a83.png
artwork-library/assets/kit-cast/Armour_03--5eb9ec56edff.png
artwork-library/assets/kit-cast/Armour_04--f62637f7ed16.png
artwork-library/assets/kit-cast/Armour_05--1183e84ddbc7.png
artwork-library/assets/kit-cast/Armour_06--b4716ba59e76.png
artwork-library/assets/kit-cast/Armour_07--95adb37be9d5.png
artwork-library/assets/kit-cast/Armour_08--b1e2cbd15a88.png
artwork-library/assets/kit-cast/Armour_09--095ea6f1f10c.png
artwork-library/assets/kit-cast/Armour_10--5641cdd23962.png
artwork-library/assets/kit-cast/Armour_11--3191824bfc72.png
artwork-library/assets/kit-cast/Spin_00--9ccb3f5028e5.png
artwork-library/assets/kit-cast/Spin_01--fd525cc32686.png
artwork-library/assets/kit-cast/Spin_02--016baa262d8d.png
artwork-library/assets/kit-cast/Spin_03--663938c57538.png
artwork-library/assets/kit-cast/Spin_04--a1d66e52a04a.png
artwork-library/assets/kit-cast/Spin_05--ad2f95fd19e9.png
artwork-library/assets/kit-cast/Spin_06--0197332c3228.png
artwork-library/assets/kit-cast/Spin_07--eb2104214e41.png
artwork-library/assets/kit-cast/Spin_08--132b3a0298ee.png
artwork-library/assets/kit-cast/Spin_09--5e124feeb95e.png
artwork-library/assets/kit-cast/Spin_10--864401df4104.png
artwork-library/assets/kit-cast/Spin_11--72a06c48c6d0.png
artwork-library/assets/kit-cast/Spin_12--cd999acc4a86.png
artwork-library/assets/kit-cast/Spin_13--24a43287d27f.png
artwork-library/assets/kit-cast/Spin_14--e2b6ac19ba9f.png
artwork-library/assets/kit-cast/Spin_15--d19520e25e44.png
artwork-library/assets/kit-cast/meta--be62f2301a37.json
artwork-library/assets/kit/Cheer_00--1b31443283cd.png
artwork-library/assets/kit/Cheer_01--fe2835857483.png
artwork-library/assets/kit/Cheer_02--3686b8efadd7.png
artwork-library/assets/kit/Cheer_03--b6ca3772128d.png
artwork-library/assets/kit/Cheer_04--45d05234a2e2.png
artwork-library/assets/kit/Cheer_05--fea01ef6156b.png
artwork-library/assets/kit/Cheer_06--6e3f507e8e12.png
artwork-library/assets/kit/Cheer_07--e725a78d540e.png
artwork-library/assets/kit/Cheer_08--619d7ba6a0d8.png
artwork-library/assets/kit/Cheer_09--c34d2bfd220c.png
artwork-library/assets/kit/Cheer_10--25c441145a51.png
artwork-library/assets/kit/Cheer_11--339d59457557.png
artwork-library/assets/kit/Cheer_12--9ba2f93385b3.png
artwork-library/assets/kit/Cheer_13--715c6d08ac8f.png
artwork-library/assets/kit/Cheer_14--d4bb9b5962e2.png
artwork-library/assets/kit/Cheer_15--5ba4662a2b89.png
artwork-library/assets/kit/Focus_00--5ff797d25f7c.png
artwork-library/assets/kit/Focus_01--a6be3ae6a436.png
artwork-library/assets/kit/Focus_02--b4184dc22d17.png
artwork-library/assets/kit/Focus_03--34f4eb69b299.png
artwork-library/assets/kit/Focus_04--ece9c68d7ef1.png
artwork-library/assets/kit/Focus_05--dd7ab4e627cf.png
artwork-library/assets/kit/Focus_06--04f05a6d0162.png
artwork-library/assets/kit/Grin_00--f015f1dbe6e8.png
artwork-library/assets/kit/Grin_01--d2b4ed0e60f0.png
artwork-library/assets/kit/Grin_02--c6486a2ce51a.png
artwork-library/assets/kit/Grin_03--79049f6f8c5e.png
artwork-library/assets/kit/Grin_04--71288dc57c36.png
artwork-library/assets/kit/Grin_05--3b05bf26cfab.png
artwork-library/assets/kit/Grin_06--344a85a33d2e.png
artwork-library/assets/kit/Grin_07--1a2c68c526dc.png
artwork-library/assets/kit/Grin_08--161e3c9fd4b1.png
artwork-library/assets/kit/Grin_09--1eb037872c4c.png
artwork-library/assets/kit/Grin_10--13d81589e320.png
artwork-library/assets/kit/Grin_11--dd2f450c5269.png
artwork-library/assets/kit/Hurt_00--e0645ebf4db1.png
artwork-library/assets/kit/Hurt_01--b905e97a888b.png
artwork-library/assets/kit/Hurt_02--9cd3e3ebe1af.png
artwork-library/assets/kit/Hurt_03--b1e376392d14.png
artwork-library/assets/kit/Hurt_04--a60ea35a746e.png
artwork-library/assets/kit/Hurt_05--be29d2de1f96.png
artwork-library/assets/kit/Hurt_06--488d26784495.png
artwork-library/assets/kit/Hurt_07--aab8e9544e26.png
artwork-library/assets/kit/Idle_00--1dcb200d4644.png
artwork-library/assets/kit/Idle_01--49c92e8a18ac.png
artwork-library/assets/kit/Idle_02--61b5e9691097.png
artwork-library/assets/kit/Idle_03--7ac74048b4b2.png
artwork-library/assets/kit/Idle_04--aacf07757179.png
artwork-library/assets/kit/Idle_05--84488295001d.png
artwork-library/assets/kit/Idle_06--afc664b82ba0.png
artwork-library/assets/kit/Idle_07--f0df49f5f2d9.png
artwork-library/assets/kit/Idle_08--218ba7ec775a.png
artwork-library/assets/kit/Idle_09--7f0a02c6ed6a.png
artwork-library/assets/kit/Idle_10--344f182e51bc.png
artwork-library/assets/kit/Idle_11--d1f852428149.png
artwork-library/assets/kit/Idle_12--d8f12a675e9c.png
artwork-library/assets/kit/Idle_13--fef5b41537bf.png
artwork-library/assets/kit/Idle_14--e255aaa7757a.png
artwork-library/assets/kit/Idle_15--d57565dce136.png
artwork-library/assets/kit/Laugh_00--549cc256d552.png
artwork-library/assets/kit/Laugh_01--23fca45f7155.png
artwork-library/assets/kit/Laugh_02--0f6c03df9b18.png
artwork-library/assets/kit/Laugh_03--0d54d964b005.png
artwork-library/assets/kit/Laugh_04--aa161f678504.png
artwork-library/assets/kit/Laugh_05--72a6271f97ac.png
artwork-library/assets/kit/Laugh_06--ea561e0eb159.png
artwork-library/assets/kit/Laugh_07--7538fb386f30.png
artwork-library/assets/kit/Laugh_08--fb8796dac0a9.png
artwork-library/assets/kit/Laugh_09--a54b062dfdc5.png
artwork-library/assets/kit/Laugh_10--85b80399aacc.png
artwork-library/assets/kit/Laugh_11--777204fb84dd.png
artwork-library/assets/kit/Laugh_12--d71be558d593.png
artwork-library/assets/kit/Laugh_13--4357c32c3081.png
artwork-library/assets/kit/Laugh_14--1786885f7392.png
artwork-library/assets/kit/Laugh_15--a29ab34bf7c6.png
artwork-library/assets/kit/Shock_00--43b65598582c.png
artwork-library/assets/kit/Shock_01--6921a8749a1f.png
artwork-library/assets/kit/Shock_02--99cf5610a1fc.png
artwork-library/assets/kit/Shock_03--150487184cf1.png
artwork-library/assets/kit/Shock_04--c34741638e82.png
artwork-library/assets/kit/Shock_05--f71eeab393d9.png
artwork-library/assets/kit/Shock_06--7f4e2e2bc3f0.png
artwork-library/assets/kit/Shock_07--325053a57a52.png
artwork-library/assets/kit/Worried_00--a7da9f75ad26.png
artwork-library/assets/kit/Worried_01--e4045c06c664.png
artwork-library/assets/kit/Worried_02--278bb8be682e.png
artwork-library/assets/kit/Worried_03--dd5525d86bdc.png
artwork-library/assets/kit/Worried_04--dba7bea8311f.png
artwork-library/assets/kit/Worried_05--1373ed7df71b.png
artwork-library/assets/kit/Worried_06--e4fcd4d47e25.png
artwork-library/assets/kit/Worried_07--d51164133ee1.png
artwork-library/assets/kit/Worried_08--7aaec15f8443.png
artwork-library/assets/kit/Worried_09--0335f673bb84.png
artwork-library/assets/kit/Worried_10--e784fdf6d405.png
artwork-library/assets/kit/Worried_11--14410079e186.png
artwork-library/assets/kit/contact-sheet--716dd538ea67.png
artwork-library/assets/kit/expressions--1436ea464ca2.png
artwork-library/assets/kit/faces/Cheer_face_00--aff810e2797d.png
artwork-library/assets/kit/faces/Focus_face_00--5ee4686e2785.png
artwork-library/assets/kit/faces/Grin_face_00--3f5e4116a949.png
artwork-library/assets/kit/faces/Hurt_face_00--23ba4d00ec88.png
artwork-library/assets/kit/faces/Idle_face_00--8221372684e8.png
artwork-library/assets/kit/faces/Laugh_face_00--c8135eddbd00.png
artwork-library/assets/kit/faces/Shock_face_00--a0c47feea4ad.png
artwork-library/assets/kit/faces/Worried_face_00--7b23ba92f440.png
artwork-library/assets/kit/meta--cd1219eeb124.json
artwork-library/assets/kit/preview--98471d808d4a.gif
artwork-library/assets/kit/turnaround--c15e85e84cd3.png
artwork-library/assets/mooncoil/background--0a3e9117723a.png
artwork-library/assets/mooncoil/brick_b_1_0--cd93c9587c63.png
artwork-library/assets/mooncoil/brick_b_1_1--dfe10691f83f.png
artwork-library/assets/mooncoil/brick_b_2_0--88deebf9544e.png
artwork-library/assets/mooncoil/brick_b_2_1--7d0068394458.png
artwork-library/assets/mooncoil/brick_c_1_0--91aac0f1b6a4.png
artwork-library/assets/mooncoil/brick_c_1_1--38205a62ec74.png
artwork-library/assets/mooncoil/brick_c_2_0--a1590c6c80af.png
artwork-library/assets/mooncoil/brick_c_2_1--8b5853226916.png
artwork-library/assets/mooncoil/brick_cache_1_0--d78157e3e7cb.png
artwork-library/assets/mooncoil/brick_slate_1_0--f9f459763d01.png
artwork-library/assets/mooncoil/brick_slate_2_0--509b928147fd.png
artwork-library/assets/mooncoil/brick_t_1_0--fc1cb14bc314.png
artwork-library/assets/mooncoil/brick_t_1_1--881c84e90805.png
artwork-library/assets/mooncoil/brick_t_2_0--03163fb95792.png
artwork-library/assets/mooncoil/brick_t_2_1--aeb537b3f342.png
artwork-library/assets/mooncoil/brick_v_1_0--feff942f2a1e.png
artwork-library/assets/mooncoil/brick_v_1_1--2a4144682255.png
artwork-library/assets/mooncoil/brick_v_2_0--6d1093e73bad.png
artwork-library/assets/mooncoil/brick_v_2_1--cddf41260d77.png
artwork-library/assets/mooncoil/bricks-manifest--0d226ac13e88.json
artwork-library/assets/orbital-forge/armour--a8f27a75a186.png
artwork-library/assets/orbital-forge/background--8b0ef447970e.png
artwork-library/assets/orbital-forge/cannon--524b08b6c8f8.png
artwork-library/assets/orbital-forge/cyan--39ce1af0c967.png
artwork-library/assets/orbital-forge/manifest--5e0dbe523a6c.json
artwork-library/assets/orbital-forge/projector_arm--3db477f61d54.png
artwork-library/assets/orbital-forge/reactor--8cd74d7741bc.png
artwork-library/assets/orbital-forge/runtime/armour--15bd583141ae.webp
artwork-library/assets/orbital-forge/runtime/background--c954eec31a5c.webp
artwork-library/assets/orbital-forge/runtime/ball--9fa7ed4851e7.webp
artwork-library/assets/orbital-forge/runtime/bay_back--41377b1a6bf9.webp
artwork-library/assets/orbital-forge/runtime/bay_mask--9be48207ee38.webp
artwork-library/assets/orbital-forge/runtime/cannon--6974ab7bf53a.webp
artwork-library/assets/orbital-forge/runtime/cyan--6422c5e6fd40.webp
artwork-library/assets/orbital-forge/runtime/door_left--fb2f4e457156.webp
artwork-library/assets/orbital-forge/runtime/door_right--3dbf4f1f736c.webp
artwork-library/assets/orbital-forge/runtime/doors_pair--c55ccaabfd49.webp
artwork-library/assets/orbital-forge/runtime/hull--898c2c7c1ba6.webp
artwork-library/assets/orbital-forge/runtime/paddle--802deb3651c5.webp
artwork-library/assets/orbital-forge/runtime/projector_arm--afd497966b23.webp
artwork-library/assets/orbital-forge/runtime/reactor--3a7e781e0e96.webp
artwork-library/assets/orbital-forge/runtime/report--da7f42d9c282.json
artwork-library/assets/orbital-forge/runtime/station_body--8d37b97c37ae.webp
artwork-library/assets/orbital-forge/runtime/station_coil--e7ca40d1a431.webp
artwork-library/assets/orbital-forge/runtime/station_cover--ffb11bd7db72.webp
artwork-library/assets/orbital-forge/runtime/violet--623422fe1ce8.webp
artwork-library/assets/orbital-forge/station_body--998d26c30a99.png
artwork-library/assets/orbital-forge/station_coil--3b9be7ab3140.png
artwork-library/assets/orbital-forge/station_cover--a700916b13c1.png
artwork-library/assets/orbital-forge/violet--6e4c7913716f.png
artwork-library/assets/relay-circuit/craftFlight--3b4f122cbb36.png
artwork-library/assets/relay-circuit/craftLeft--4b18d236b3f6.png
artwork-library/assets/relay-circuit/craftMorph--7215b72eebfd.png
artwork-library/assets/relay-circuit/craftRight--366cffa088eb.png
artwork-library/assets/relay-circuit/manifest--1a719e78b2ba.json
artwork-library/assets/relay-circuit/phaseBadge--1905a75c4f1b.png
artwork-library/assets/relay-circuit/portLeft--f4ea282b0537.png
artwork-library/assets/relay-circuit/portRight--519c2e7933ea.png
artwork-library/assets/relay-circuit/runtime-base/bBackground--8aeb044a3119.webp
artwork-library/assets/relay-circuit/runtime-base/bCannonBarrel--ca30913e16b5.webp
artwork-library/assets/relay-circuit/runtime-base/bHull--8bd08bfaf0d8.webp
artwork-library/assets/relay-circuit/runtime-base/bIris--2ed5c5a7ea17.webp
artwork-library/assets/relay-circuit/runtime-base/bPod--dc5a6911a370.webp
artwork-library/assets/relay-circuit/runtime-base/bPortal--5269e9fc45a6.webp
artwork-library/assets/relay-circuit/runtime-base/bSkiff--babbc8c254e9.webp
artwork-library/assets/relay-circuit/runtime-base/bThruster--40aa7deb0c7b.webp
artwork-library/assets/relay-circuit/runtime-base/bWorker--2c512689f2dc.webp
artwork-library/assets/relay-circuit/runtime-base/ball--448106ce1610.webp
artwork-library/assets/relay-circuit/runtime-base/brick_armour--10ba2a7efa11.webp
artwork-library/assets/relay-circuit/runtime-base/brick_crew_lock--c2b2451f812f.webp
artwork-library/assets/relay-circuit/runtime-base/brick_cyan--2fd03e717599.webp
artwork-library/assets/relay-circuit/runtime-base/brick_pink--c3b52c9762aa.webp
artwork-library/assets/relay-circuit/runtime-base/brick_violet--6ceb0d8289ac.webp
artwork-library/assets/relay-circuit/runtime-base/capsule_laser--d80e41b7df44.webp
artwork-library/assets/relay-circuit/runtime-base/capsule_shield--118f0550fb2f.webp
artwork-library/assets/relay-circuit/runtime-base/capsule_split--09c4b6fc565d.webp
artwork-library/assets/relay-circuit/runtime-base/paddle--5016283d4907.webp
artwork-library/assets/relay-circuit/runtime-base/report--c9b8869f88c0.json
artwork-library/assets/relay-circuit/runtime-extra/craftFlight--13a721a418e0.webp
artwork-library/assets/relay-circuit/runtime-extra/craftLeft--02926205ae49.webp
artwork-library/assets/relay-circuit/runtime-extra/craftMorph--1ba23bf960eb.webp
artwork-library/assets/relay-circuit/runtime-extra/craftRight--5b12328a6fbe.webp
artwork-library/assets/relay-circuit/runtime-extra/phaseBadge--63c882585f14.webp
artwork-library/assets/relay-circuit/runtime-extra/portLeft--2115ce17adbe.webp
artwork-library/assets/relay-circuit/runtime-extra/portRight--443280f6188d.webp
artwork-library/assets/relay-circuit/runtime-extra/report--c9bd5829aa5a.json
artwork-library/assets/snake-emerald/head_blink_l--9b2efbad5858.png
artwork-library/assets/snake-emerald/head_blink_r--a8727a03f39e.png
artwork-library/assets/snake-emerald/head_chew0_l--2d7998b103f3.png
artwork-library/assets/snake-emerald/head_chew0_r--ea6fa44e5829.png
artwork-library/assets/snake-emerald/head_chew1_l--2146f18fc333.png
artwork-library/assets/snake-emerald/head_chew1_r--fdc3334ef374.png
artwork-library/assets/snake-emerald/head_dizzy_l--7ef9881e1613.png
artwork-library/assets/snake-emerald/head_dizzy_r--8cfbcb23aaf7.png
artwork-library/assets/snake-emerald/head_grin_l--27d566c7d398.png
artwork-library/assets/snake-emerald/head_grin_r--c77de439f8ca.png
artwork-library/assets/snake-emerald/head_hiss_l--abad076ecf05.png
artwork-library/assets/snake-emerald/head_hiss_r--e8621d8b20d2.png
artwork-library/assets/snake-emerald/head_hunt_l--fdd74495ea84.png
artwork-library/assets/snake-emerald/head_hunt_r--338e214613fb.png
artwork-library/assets/snake-emerald/head_idle_l--839ae0f9b8e8.png
artwork-library/assets/snake-emerald/head_idle_r--b8bafff43894.png
artwork-library/assets/snake-emerald/head_ouch_l--2237ccb3427c.png
artwork-library/assets/snake-emerald/head_ouch_r--2a3c05c963e3.png
artwork-library/assets/snake-emerald/head_taste_l--171ad06df1a1.png
artwork-library/assets/snake-emerald/head_taste_r--183617b5dab0.png
artwork-library/assets/snake-emerald/manifest--d07cce6d9c77.json
artwork-library/assets/snake-emerald/manifest--dae4b90943fb.json
artwork-library/assets/snake-emerald/meta--88d13673cd4f.json
artwork-library/assets/snake-emerald/meta--f8e9f9f93774.json
artwork-library/assets/snake-jade/head_blink_l--c75cd603f6fa.png
artwork-library/assets/snake-jade/head_blink_r--6c3addffc51e.png
artwork-library/assets/snake-jade/head_chew0_l--dbae15a3f6b5.png
artwork-library/assets/snake-jade/head_chew0_r--8c511caab035.png
artwork-library/assets/snake-jade/head_chew1_l--5fd43de4b8a6.png
artwork-library/assets/snake-jade/head_chew1_r--a81b2603d999.png
artwork-library/assets/snake-jade/head_dizzy_l--df3c7e81f321.png
artwork-library/assets/snake-jade/head_dizzy_r--e42c3f2e6664.png
artwork-library/assets/snake-jade/head_grin_l--cccf1b74b125.png
artwork-library/assets/snake-jade/head_grin_r--ac4ddbca43a3.png
artwork-library/assets/snake-jade/head_hiss_l--bfd7d11321e0.png
artwork-library/assets/snake-jade/head_hiss_r--1c4915922c52.png
artwork-library/assets/snake-jade/head_hunt_l--cdd794352b54.png
artwork-library/assets/snake-jade/head_hunt_r--a79a156ed574.png
artwork-library/assets/snake-jade/head_idle_l--b10ddc90c492.png
artwork-library/assets/snake-jade/head_idle_r--4b8794e62cd6.png
artwork-library/assets/snake-jade/head_ouch_l--77814f58753b.png
artwork-library/assets/snake-jade/head_ouch_r--f3664202bd7f.png
artwork-library/assets/snake-jade/head_shock_l--722bd34a6543.png
artwork-library/assets/snake-jade/head_shock_r--d7bafe0effda.png
artwork-library/assets/snake-jade/head_snarl_l--2d03c4d10cae.png
artwork-library/assets/snake-jade/head_snarl_r--a7194aa76198.png
artwork-library/assets/snake-jade/head_strike_l--b02fcf4bcbdc.png
artwork-library/assets/snake-jade/head_strike_r--7c7d84c1aad4.png
artwork-library/assets/snake-jade/head_taste_l--8ccd70768184.png
artwork-library/assets/snake-jade/head_taste_r--dab0fc1fbc44.png
artwork-library/assets/snake-jade/meta--d88e007157d7.json
artwork-library/assets/space-a/background--96125f702e2e.png
artwork-library/assets/space-a/brick_cyan--1924df6e3e6c.png
artwork-library/assets/space-a/brick_pink--fd66563e396d.png
artwork-library/assets/space-a/cannon_barrel--7aa333c33e80.png
artwork-library/assets/space-a/carrier_hull--9b1be2b66c47.png
artwork-library/assets/space-a/common-panels-manifest--c2acfecf2027.json
artwork-library/assets/space-a/door_left--143a85dec73f.png
artwork-library/assets/space-a/door_right--c64a4fc4cf2b.png
artwork-library/assets/space-a/doors--736218cc25b0.png
artwork-library/assets/space-a/fighter--f75025aa5786.png
artwork-library/assets/space-a/paddle--95d548c9cd0d.png
artwork-library/assets/space-a/source-crops/brick_cyan--c8271d8dd0e7.png
artwork-library/assets/space-a/source-crops/brick_pink--149870ac19be.png
artwork-library/assets/space-a/source-crops/paddle--3c2b16de3ceb.png
artwork-library/assets/space-a/thruster--c36266ea6681.png
artwork-library/assets/space-a/worker--93b2ca753032.png
artwork-library/assets/space-b/background--f41cbd9891bf.png
artwork-library/assets/space-b/cannon_barrel--9e53a947eeea.png
artwork-library/assets/space-b/iris_segment--099278e1baa3.png
artwork-library/assets/space-b/pod_shell--9a288792df91.png
artwork-library/assets/space-b/portal--65e4354713e3.png
artwork-library/assets/space-b/relay_hull--9c8f6bcfedf0.png
artwork-library/assets/space-b/skiff--1a09634bc06b.png
artwork-library/assets/space-b/worker--685d5d066e5c.png
artwork-library/assets/space-c/bay_back--206e2e2f33b6.png
artwork-library/assets/space-c/bay_mask--51f02118f2a7.png
artwork-library/assets/space-c/door_left--0efe3cf550cf.png
artwork-library/assets/space-c/door_right--31cddc13e703.png
artwork-library/assets/space-c/doors_pair--cf4eb410bc8e.png
artwork-library/assets/space-c/hull--c3b2123bebc0.png
artwork-library/assets/space-c/machinery--0f58ab61e2ac.json
artwork-library/assets/space-common/ball--249c2451d683.png
artwork-library/assets/space-common/brick_armour--cf43a70b894d.png
artwork-library/assets/space-common/brick_crew_lock--9541824d873f.png
artwork-library/assets/space-common/brick_cyan--6433636655ec.png
artwork-library/assets/space-common/brick_pink--fd6a94b4d17e.png
artwork-library/assets/space-common/brick_violet--4a6563431cac.png
artwork-library/assets/space-common/capsule_laser--1a6fb424897b.png
artwork-library/assets/space-common/capsule_shield--f8d4eb1d711f.png
artwork-library/assets/space-common/capsule_split--229cd3f1bde3.png
artwork-library/assets/space-common/manifest--8ae77fd2a666.json
artwork-library/assets/space-common/paddle--f90d9d8ab378.png
artwork-library/assets/space-common/source-crops/ball--58371d89131a.png
artwork-library/assets/space-common/source-crops/brick_armour--4aa4baf3a5cb.png
artwork-library/assets/space-common/source-crops/brick_crew_lock--482bb57d793e.png
artwork-library/assets/space-common/source-crops/brick_cyan--02a2ead9c74e.png
artwork-library/assets/space-common/source-crops/brick_pink--faba0b37be93.png
artwork-library/assets/space-common/source-crops/brick_violet--b09acda6ca15.png
artwork-library/assets/space-common/source-crops/capsule_laser--0d5f3ca13af1.png
artwork-library/assets/space-common/source-crops/capsule_shield--f6a68700e6b2.png
artwork-library/assets/space-common/source-crops/capsule_split--3bbb4df36046.png
artwork-library/assets/space-common/source-crops/paddle--b830ad43d30d.png
artwork-library/assets/space-companions/manifest--5fb0d488b68c.json
artwork-library/assets/space-companions/nix--5b97dcee8905.png
artwork-library/assets/space-companions/nix_calm--6184f751d437.png
artwork-library/assets/space-companions/nix_cheer--6a000a865c7a.png
artwork-library/assets/space-companions/nix_command_anticipate--6d74a03a9134.png
artwork-library/assets/space-companions/nix_command_blink--fd4143686a69.png
artwork-library/assets/space-companions/nix_command_release--70732736eb57.png
artwork-library/assets/space-companions/nix_command_rise--28e7ab6ff358.png
artwork-library/assets/space-companions/nix_command_settle--e5202d3a64dd.png
artwork-library/assets/space-companions/nix_focused--18be8288ad7f.png
artwork-library/assets/space-companions/nix_relieved--81f3922d0e8d.png
artwork-library/assets/space-companions/nix_sorrow--d99dca21caab.png
artwork-library/assets/space-companions/nix_surprised--5e797fa48819.png
artwork-library/assets/space-companions/nix_worried--dc634c7ee2ac.png
artwork-library/assets/space-companions/tick--b78910c17be3.png
artwork-library/assets/space-companions/tick_align--d99a07f1efa6.png
artwork-library/assets/space-companions/tick_clamp--bfd20fad85e1.png
artwork-library/assets/space-companions/tick_neutral--831d542215ca.png
artwork-library/assets/space-companions/tick_pleased--54d9039fea23.png
artwork-library/assets/space-companions/tick_reach--e985ebb37b7d.png
artwork-library/assets/space-companions/tick_retract--3b535c21df56.png
artwork-library/assets/space-companions/tick_secured--0e87e5c8290e.png
artwork-library/assets/space-companions/tick_turn--454fd3dce4b4.png
artwork-library/assets/starflight-arsenal/drone--d8e85a535f86.png
artwork-library/assets/starflight-arsenal/drones--39360de7e2eb.png
artwork-library/assets/starflight-arsenal/hyper--e79faab05825.png
artwork-library/assets/starflight-arsenal/laser--ff43623d991b.png
artwork-library/assets/starflight-arsenal/manifest--02c25c6d1437.json
artwork-library/assets/starflight-arsenal/missile--e492fe693c4a.png
artwork-library/assets/starflight-arsenal/nova--e17997780f99.png
artwork-library/assets/starflight-arsenal/repair--917534edf9f7.png
artwork-library/assets/starflight-arsenal/seeker--734bfe689de4.png
artwork-library/assets/starflight-arsenal/shield--1f89600c808e.png
artwork-library/assets/starflight-arsenal/spiral--6cc07b908d12.png
artwork-library/assets/starflight-arsenal/stasis--4d3b124967e9.png
artwork-library/assets/starflight-equipment/capsule--f55df7cc3aa3.png
artwork-library/assets/starflight-equipment/guided--48d631f219c0.png
artwork-library/assets/starflight-equipment/manifest--b08da785de7f.json
artwork-library/assets/starflight-equipment/ricochet--c9d89d07fc8c.png
artwork-library/assets/starflight-equipment/shield--42b8391921c3.png
artwork-library/assets/starflight-storm/body--ffae2e0e4759.png
artwork-library/assets/starflight-storm/manifest--f790294c4b77.json
artwork-library/assets/starflight-storm/ricochet--91d625b148e7.png
artwork-library/assets/starflight-storm/storm-icon--5f8a30e302b5.png
artwork-library/assets/starflight-storm/wing-left--ce7e3271c1b9.png
artwork-library/assets/starflight-storm/wing-right--98d1fcd23dec.png
artwork-library/assets/starflight-v2/asteroid--ce56450e8fd4.png
artwork-library/assets/starflight-v2/beetle--ec6d92ee04fa.png
artwork-library/assets/starflight-v2/crescent--82764e48f114.png
artwork-library/assets/starflight-v2/frigate--39b8f18aae4d.png
artwork-library/assets/starflight-v2/gravity--b3e605414885.png
artwork-library/assets/starflight-v2/manifest--54ee8471c06e.json
artwork-library/assets/starflight-v2/wormhole--1871dc8594d6.png
artwork-library/assets/starflight/background--192c9f540ae4.png
artwork-library/assets/starflight/boss--e913edb3f140.png
artwork-library/assets/starflight/enemyBolt--c50c4b8ac841.png
artwork-library/assets/starflight/exhaust--252f648d53c3.png
artwork-library/assets/starflight/gunship--2869c962612a.png
artwork-library/assets/starflight/impact--241edd763031.png
artwork-library/assets/starflight/manifest--f4160cdaeef7.json
artwork-library/assets/starflight/player--ad4c0f3c8024.png
artwork-library/assets/starflight/playerBolt--bb10f150b860.png
artwork-library/assets/starflight/scout--bbaacd73fa98.png
artwork-library/assets/starflight/weapons/enemy--ead0fd9230cc.png
artwork-library/assets/starflight/weapons/explosion--9d4349c550d1.png
artwork-library/assets/starflight/weapons/hyper--84ca75357a42.png
artwork-library/assets/starflight/weapons/manifest--bef45a3dfc3a.json
artwork-library/assets/starflight/weapons/muzzle--1bbbfb1e754a.png
artwork-library/assets/starflight/weapons/plasma--a2eccb22f9a4.png
artwork-library/assets/starflight/weapons/stasis--a257f356e0a5.png
artwork-library/assets/weapon-vfx-v2/asset-report--4d0a510d7149.json
artwork-library/assets/weapon-vfx-v2/frames/helix-charge/helix-charge-00--f4e71fcaacba.png
artwork-library/assets/weapon-vfx-v2/frames/helix-charge/helix-charge-01--4f049c9b81e4.png
artwork-library/assets/weapon-vfx-v2/frames/helix-charge/helix-charge-02--3355a8a80b59.png
artwork-library/assets/weapon-vfx-v2/frames/helix-charge/helix-charge-03--ab40ed1d857f.png
artwork-library/assets/weapon-vfx-v2/frames/helix-charge/helix-charge-04--3966d76a9971.png
artwork-library/assets/weapon-vfx-v2/frames/helix-charge/helix-charge-05--423705a8c5d6.png
artwork-library/assets/weapon-vfx-v2/frames/helix-charge/helix-charge-06--aa143a406bc7.png
artwork-library/assets/weapon-vfx-v2/frames/helix-charge/helix-charge-07--62ef2f3a1640.png
artwork-library/assets/weapon-vfx-v2/frames/helix-charge/helix-charge-09--cb85521856c2.png
artwork-library/assets/weapon-vfx-v2/frames/helix-charge/helix-charge-10--ee6e627f8768.png
artwork-library/assets/weapon-vfx-v2/frames/helix-charge/helix-charge-11--6f50550bb370.png
artwork-library/assets/weapon-vfx-v2/frames/reactor-charge/reactor-charge-00--c0cb9bbe44e5.png
artwork-library/assets/weapon-vfx-v2/frames/reactor-charge/reactor-charge-01--ac02b5bf6e58.png
artwork-library/assets/weapon-vfx-v2/frames/reactor-charge/reactor-charge-02--8a6f4e70ce49.png
artwork-library/assets/weapon-vfx-v2/frames/reactor-charge/reactor-charge-03--332f5d8fd2fa.png
artwork-library/assets/weapon-vfx-v2/frames/reactor-charge/reactor-charge-04--4f094848b39d.png
artwork-library/assets/weapon-vfx-v2/frames/reactor-charge/reactor-charge-05--d9b1c72e779b.png
artwork-library/assets/weapon-vfx-v2/frames/reactor-charge/reactor-charge-06--5548faa39c01.png
artwork-library/assets/weapon-vfx-v2/frames/reactor-charge/reactor-charge-07--18ef7b04af7e.png
artwork-library/assets/weapon-vfx-v2/frames/reactor-charge/reactor-charge-09--d2ac71358074.png
artwork-library/assets/weapon-vfx-v2/frames/reactor-charge/reactor-charge-10--0f4b426bde41.png
artwork-library/assets/weapon-vfx-v2/frames/reactor-charge/reactor-charge-11--531713812a57.png
artwork-library/assets/weapon-vfx-v2/helix-charge--cb7ad875b0b2.png
artwork-library/assets/weapon-vfx-v2/manifest--9c946badb34b.json
artwork-library/assets/weapon-vfx-v2/mechanical-seed-report--b6ebea68c773.json
artwork-library/assets/weapon-vfx-v2/payload-A--ab4dfc62bae6.png
artwork-library/assets/weapon-vfx-v2/payload-B--99e9205b3e41.png
artwork-library/assets/weapon-vfx-v2/payload-prompts--aafdbfe3c4f1.json
artwork-library/assets/weapon-vfx-v2/payload-source-receipt--535549856dd3.json
artwork-library/assets/weapon-vfx-v2/proof/impact-v3/helix-impact-02--ce6340f4f924.png
artwork-library/assets/weapon-vfx-v2/proof/impact-v3/reactor-impact-04--f8400c51432e.png
artwork-library/assets/weapon-vfx-v2/proof/impact-v4/helix-impact-00--8f013cfd1d72.png
artwork-library/assets/weapon-vfx-v2/proof/impact-v4/helix-impact-01--251164074e85.png
artwork-library/assets/weapon-vfx-v2/proof/impact-v4/helix-impact-04--3e8c6a5d87b0.png
artwork-library/assets/weapon-vfx-v2/proof/impact-v4/helix-impact-08--8f80199a89be.png
artwork-library/assets/weapon-vfx-v2/proof/impact-v4/reactor-impact-00--4ab8eeb36fb2.png
artwork-library/assets/weapon-vfx-v2/proof/impact-v4/reactor-impact-01--4beeb1a12e2e.png
artwork-library/assets/weapon-vfx-v2/proof/impact-v4/reactor-impact-04--abc8049f8870.png
artwork-library/assets/weapon-vfx-v2/proof/impact-v4/reactor-impact-08--30fab33b283d.png
artwork-library/assets/weapon-vfx-v2/proof/mechanical-v2/helix-flight-08--bb3ea0783d91.png
artwork-library/assets/weapon-vfx-v2/proof/mechanical-v2/helix-impact-04--a997c188bcc8.png
artwork-library/assets/weapon-vfx-v2/proof/mechanical-v2/reactor-flight-08--dc30280e37bb.png
artwork-library/assets/weapon-vfx-v2/proof/mechanical-v2/reactor-impact-04--45e29578d8cb.png
artwork-library/assets/weapon-vfx-v2/reactor-charge--b781323b9061.png
artwork-library/assets/weapon-vfx-v2/render-report--eab8360f1d3a.json
artwork-library/assets/weapon-vfx-v2/review/exports--ffe9acf84933.json
artwork-library/assets/weapon-vfx-v2/review/magnetic-breacher--2def9f228650.webm
artwork-library/assets/weapon-vfx-v2/review/magnetic-breacher--a9ac00129a2b.gif
artwork-library/assets/weapon-vfx-v2/review/magnetic-breacher-contact--8b6a5488bf0d.png
artwork-library/assets/weapon-vfx-v2/review/qa-seal--c076a9b77141.json
artwork-library/assets/weapon-vfx-v2/review/qa-validation--2cd1ff7b908b.json
artwork-library/assets/weapon-vfx-v2/review/reactor-rupture--54a504ef642f.gif
artwork-library/assets/weapon-vfx-v2/review/reactor-rupture--9fd74387e574.webm
artwork-library/assets/weapon-vfx-v2/review/reactor-rupture-contact--94f32e4b0f42.png
artwork-library/assets/weapon-vfx-v2/review/report--6d6725e00258.json
artwork-library/assets/weapon-vfx-v2/review/selection--99b74438144e.json
artwork-library/assets/weapon-vfx-v2/review/video-report--d4d782ae1769.json
artwork-library/assets/weapon-vfx-v3/asset-report--cfa000e1b7d4.json
artwork-library/assets/weapon-vfx-v3/cast-roles--08aca9f1febd.png
artwork-library/assets/weapon-vfx-v3/impact-report--87637c20abec.json
artwork-library/assets/weapon-vfx-v3/plasma-impact-prompt--d157f99be8dc.json
artwork-library/assets/weapon-vfx-v3/plasma-impact-runtime--39091b038f27.png
artwork-library/assets/weapon-vfx-v3/plasma-impact-source--314515005c18.png
artwork-library/assets/weapon-vfx-v3/plasma-shot--0dfce08d8280.png
artwork-library/assets/weapon-vfx-v3/plasma-shot-prompt--d4ab9a4a7679.json
artwork-library/assets/weapon-vfx-v3/plasma-shot-runtime--e50ca4d2e8b4.png
artwork-library/assets/weapon-vfx-v3/plasma-shot-source--041a0ed6b892.png
artwork-library/assets/weapon-vfx-v3/review/cannon-comparison--7eb95429194d.png
artwork-library/assets/weapon-vfx-v3/review/cannon-comparison--c032b02ca1d3.png
artwork-library/assets/weapon-vfx-v3/review/cannon-qa--28622965dfe8.json
artwork-library/assets/weapon-vfx-v3/review/history/skiff-before-friendly-firepower--c9ecc58db35e.png
artwork-library/assets/weapon-vfx-v3/review/skiff-contact--980f6288e83e.png
artwork-library/assets/weapon-vfx-v3/review/skiff-report--8f076e4e9ef8.json
artwork-library/concepts/img/01-kit-v2-1--e592f970ef9d.png
artwork-library/concepts/img/01-kit-v2-2--734f15353ac7.png
artwork-library/concepts/img/01-kit-v2-3--d07bf86b9df7.png
artwork-library/concepts/img/capture-option-a--731a16d6dd9a.png
artwork-library/concepts/img/capture-option-a--f3cd8a0199a3.gif
artwork-library/concepts/img/capture-option-b--4992994d7718.gif
artwork-library/concepts/img/capture-option-b--5dc417f5ffed.png
artwork-library/concepts/img/carrier-effects-study-a--0fed4f523a80.png
artwork-library/concepts/img/carrier-effects-study-b--2e61b0584518.png
artwork-library/concepts/img/carrier-progression-a--e7184c9b0be7.png
artwork-library/concepts/img/carrier-progression-b--c261d94be2f4.png
artwork-library/concepts/img/cast-v2-anatomy-a--e62d7cddab87.png
artwork-library/concepts/img/cast-v2-anatomy-b--8bcdc882e44c.png
artwork-library/concepts/img/history/space-hard-weapons-36s-unselected/option-a--806f5593f929.png
artwork-library/concepts/img/history/space-hard-weapons-36s-unselected/option-b--ecc3ceb27ef0.png
artwork-library/concepts/img/invasion-rescue-a--55947a6c5f44.png
artwork-library/concepts/img/invasion-rescue-b--97cbf9239a06.png
artwork-library/concepts/img/kit-ability-ward-left--7a8d19c9c56f.png
artwork-library/concepts/img/kit-ability-ward-right--4cb0e9fa871b.png
artwork-library/concepts/img/kit-cast-a--1753ac7ce9ea.png
artwork-library/concepts/img/kit-cast-b--1fd2f529c236.png
artwork-library/concepts/img/kit-powers-study-a--4cd02918607a.png
artwork-library/concepts/img/kit-powers-study-b--c9fdc0f26dcb.png
artwork-library/concepts/img/level-layout-a--38152772242e.png
artwork-library/concepts/img/level-layout-b--dc216692c193.png
artwork-library/concepts/img/level-layout-mixed--d887223c33ef.png
artwork-library/concepts/img/level-layout-v2-a--adf6f1285937.png
artwork-library/concepts/img/level-layout-v2-b--62164ebbfd7a.png
artwork-library/concepts/img/mobile-layout-a--b5b617132d23.png
artwork-library/concepts/img/mobile-layout-a-invasion--00e9a3114e4c.png
artwork-library/concepts/img/mobile-layout-b--d4901d334386.png
artwork-library/concepts/img/mobile-layout-b-invasion--40bb2ffc5f9a.png
artwork-library/concepts/img/orbital-variety-study-v1--65f7f6113ca9.png
artwork-library/concepts/img/orbital-variety-study-v2--f2a92d5ee619.png
artwork-library/concepts/img/orbital-variety-study-v3--278a52aac8f5.png
artwork-library/concepts/img/princess-bellforge-a-v1--53ef9248cd4b.png
artwork-library/concepts/img/princess-tidewheel-b-v1--c2b5b6b26c85.png
artwork-library/concepts/img/relay-variety-study-v1--cd1c2769e7bf.png
artwork-library/concepts/img/relay-variety-study-v2--4f7960833b2e.png
artwork-library/concepts/img/relay-variety-study-v3--98c5c46cd080.png
artwork-library/concepts/img/serpent-entry-native--e7130744531d.gif
artwork-library/concepts/img/space-carrier-a--1e2bd8383794.png
artwork-library/concepts/img/space-eclipse-d-v1--1e8a1e638098.png
artwork-library/concepts/img/space-hard-weapons-a--a3e91d7980e5.png
artwork-library/concepts/img/space-hard-weapons-b--58c72ef6968c.png
artwork-library/concepts/img/space-orbital-c-v1--8afa8c869f0d.png
artwork-library/concepts/img/space-relay-b--ebeb16a19ab9.png
artwork-library/concepts/img/venom-spray-ward-preview--2b2f7fd9a0e6.gif
artwork-library/manifest.json
artwork-library/renders/brum-proof/body/Neutral_00--46c5291bc565.png
artwork-library/renders/brum-proof/body/Protective_00--c8a565087ba3.png
artwork-library/renders/brum-proof/body/Welcome_00--9e07a091774e.png
artwork-library/renders/brum-proof/calibration/Neutral_00--e0b487c7e98b.png
artwork-library/renders/brum-proof/clay-front/Neutral_00--c47a94fd4674.png
artwork-library/renders/brum-proof/clay-quarter/Neutral_00--cdc1d5a47b64.png
artwork-library/renders/brum-proof/coat-v2/body/Neutral_00--3ac9590673df.png
artwork-library/renders/brum-proof/coat-v2/face/Neutral_00--c09abcd46cc8.png
artwork-library/renders/brum-proof/coat-v2/face/Protective_00--f50010323cc6.png
artwork-library/renders/brum-proof/coat-v2/face/Welcome_00--009069b4d60b.png
artwork-library/renders/brum-proof/coat-v3/body/Neutral_00--c18927bafc4b.png
artwork-library/renders/brum-proof/coat-v3/face/Neutral_00--732674da22f4.png
artwork-library/renders/brum-proof/coat-v3/face/Protective_00--1f25c047ee41.png
artwork-library/renders/brum-proof/coat-v4/body/Neutral_00--c8fd2793afd4.png
artwork-library/renders/brum-proof/coat-v4/face/Neutral_00--7a58c322dcfd.png
artwork-library/renders/brum-proof/coat-v4/face/Protective_00--be05c73f847c.png
artwork-library/renders/brum-proof/coat-v5/body/Neutral_00--2b4688f74b43.png
artwork-library/renders/brum-proof/coat-v5/face/Neutral_00--5aca45e8659b.png
artwork-library/renders/brum-proof/coat-v5/face/Protective_00--d4fa489f958b.png
artwork-library/renders/brum-proof/coat-v5/face/Welcome_00--46fa1a58fa13.png
artwork-library/renders/brum-proof/coat-v5/punch/Punch_02--06b3e65e1b43.png
artwork-library/renders/brum-proof/coat-v5/punch/Punch_06--9ff256fb5783.png
artwork-library/renders/brum-proof/coat-v5/punch/Punch_09--7a70a346dcd7.png
artwork-library/renders/brum-proof/coat-v6/body/Neutral_00--68078dd430ff.png
artwork-library/renders/brum-proof/coat-v6/face/Neutral_00--948f6cac1c3e.png
artwork-library/renders/brum-proof/coat-v6/face/Protective_00--e2b54157bafd.png
artwork-library/renders/brum-proof/coat-v7/body/Neutral_00--1a437ab402eb.png
artwork-library/renders/brum-proof/coat-v7/clay/Neutral_00--b7322b3d1de9.png
artwork-library/renders/brum-proof/coat-v7/comparison--f0ac92beac15.png
artwork-library/renders/brum-proof/coat-v7/contact-20--5d49c2e848d1.png
artwork-library/renders/brum-proof/coat-v7/contact-60--7946084bb698.png
artwork-library/renders/brum-proof/coat-v7/contact-90--0cb2dbe50714.png
artwork-library/renders/brum-proof/coat-v7/continuity-review--50d7b754b0c0.png
artwork-library/renders/brum-proof/coat-v7/face/Neutral_00--ea81cf139305.png
artwork-library/renders/brum-proof/coat-v7/face/Protective_00--15514445fb11.png
artwork-library/renders/brum-proof/coat-v7/face/Welcome_00--9b145dae5c41.png
artwork-library/renders/brum-proof/coat-v7/key-poses--c14233596ef8.gif
artwork-library/renders/brum-proof/coat-v7/model-review--2e93a91a142d.png
artwork-library/renders/brum-proof/coat-v7/motion-review--600521b69ffb.png
artwork-library/renders/brum-proof/coat-v7/punch/Punch_02--79c20871a619.png
artwork-library/renders/brum-proof/coat-v7/punch/Punch_06--d512797d0d43.png
artwork-library/renders/brum-proof/coat-v7/punch/Punch_09--e297e0fa9b64.png
artwork-library/renders/brum-proof/coat-v7/quarter/Neutral_00--7abb7fd56a71.png
artwork-library/renders/brum-proof/contact-20--ad6a1bfd3fc6.png
artwork-library/renders/brum-proof/contact-60--763a81cf5b2e.png
artwork-library/renders/brum-proof/contact-90--66684b301bf6.png
artwork-library/renders/brum-proof/continuity-review--225530bfae06.png
artwork-library/renders/brum-proof/face-front/Neutral_00--b11749f53b00.png
artwork-library/renders/brum-proof/face-front/Protective_00--7c4b5298c18b.png
artwork-library/renders/brum-proof/face-front/Welcome_00--d93494b7735c.png
artwork-library/renders/brum-proof/face/Neutral_00--de7a816cbfdb.png
artwork-library/renders/brum-proof/face/Protective_00--c0476a781e0a.png
artwork-library/renders/brum-proof/face/Welcome_00--5216a04e68e4.png
artwork-library/renders/brum-proof/final-body/Neutral_00--c6b436199a77.png
artwork-library/renders/brum-proof/final-body/Protective_00--eb5219ea741c.png
artwork-library/renders/brum-proof/final-body/Welcome_00--a5a889520238.png
artwork-library/renders/brum-proof/final-gaits/Idle_00--96df3599dca1.png
artwork-library/renders/brum-proof/final-gaits/Idle_01--f8fec1d3e1a4.png
artwork-library/renders/brum-proof/final-gaits/Idle_02--a506be3fc1e0.png
artwork-library/renders/brum-proof/final-gaits/Idle_03--d57305a36626.png
artwork-library/renders/brum-proof/final-gaits/Walk_00--c32447088485.png
artwork-library/renders/brum-proof/final-gaits/Walk_01--f5ae1302e91b.png
artwork-library/renders/brum-proof/final-gaits/Walk_02--b1c3cab4cb94.png
artwork-library/renders/brum-proof/final-gaits/Walk_03--6a36ce24e748.png
artwork-library/renders/brum-proof/final-gaits/Walk_04--1af8fcdb6e16.png
artwork-library/renders/brum-proof/final-gaits/Walk_05--ecc6ad460e45.png
artwork-library/renders/brum-proof/final-motion/Punch_00--06fb37f40364.png
artwork-library/renders/brum-proof/final-motion/Punch_01--2dbf612c85e2.png
artwork-library/renders/brum-proof/final-motion/Punch_02--d59dfb4e9401.png
artwork-library/renders/brum-proof/final-motion/Punch_03--3808a8f99a55.png
artwork-library/renders/brum-proof/final-motion/Punch_04--383517740784.png
artwork-library/renders/brum-proof/final-motion/Punch_05--7b65efdb778c.png
artwork-library/renders/brum-proof/final-motion/Punch_06--e0c4c80852ba.png
artwork-library/renders/brum-proof/final-motion/Punch_07--b90d7982f4c5.png
artwork-library/renders/brum-proof/final-motion/Punch_08--f34818c38883.png
artwork-library/renders/brum-proof/final-motion/Punch_09--e98c86e1ccf5.png
artwork-library/renders/brum-proof/final-quarter/Neutral_00--8c3d6948403a.png
artwork-library/renders/brum-proof/front/Neutral_00--88851e84a21a.png
artwork-library/renders/brum-proof/front/Protective_00--c864a0319382.png
artwork-library/renders/brum-proof/front/Welcome_00--4ee7d3a5064a.png
artwork-library/renders/brum-proof/gaits/Idle_00--d10ceb70f3e5.png
artwork-library/renders/brum-proof/gaits/Idle_01--650a1b2de833.png
artwork-library/renders/brum-proof/gaits/Idle_02--36d0bd66d503.png
artwork-library/renders/brum-proof/gaits/Idle_03--eb3354fba14a.png
artwork-library/renders/brum-proof/gaits/Walk_00--fc74ced86d58.png
artwork-library/renders/brum-proof/gaits/Walk_01--8d03c5567e89.png
artwork-library/renders/brum-proof/gaits/Walk_02--4b552588a880.png
artwork-library/renders/brum-proof/gaits/Walk_03--6305b2751eda.png
artwork-library/renders/brum-proof/gaits/Walk_04--cf3c59bd323a.png
artwork-library/renders/brum-proof/gaits/Walk_05--17d9659b1cdb.png
artwork-library/renders/brum-proof/idle--d49c649f4a96.gif
artwork-library/renders/brum-proof/isolated-brum_blue--bc137f2b3036.png
artwork-library/renders/brum-proof/isolated-brum_cavity--2c0727dc13ab.png
artwork-library/renders/brum-proof/isolated-brum_eyes--60e6b3a5b891.png
artwork-library/renders/brum-proof/isolated-matte-eyes--b5565431f3fb.png
artwork-library/renders/brum-proof/isolated-white-eyes--0b5a8f7481c1.png
artwork-library/renders/brum-proof/model-review--4e0ec9eeed12.png
artwork-library/renders/brum-proof/motion-review--100f61ac54d3.png
artwork-library/renders/brum-proof/motion/Punch_00--db9f1c1963a7.png
artwork-library/renders/brum-proof/motion/Punch_01--f245069ab6ed.png
artwork-library/renders/brum-proof/motion/Punch_02--4f3e93f5e8a5.png
artwork-library/renders/brum-proof/motion/Punch_03--c323af7c4fe2.png
artwork-library/renders/brum-proof/motion/Punch_04--24d19e208d14.png
artwork-library/renders/brum-proof/motion/Punch_05--aaaf3890d88a.png
artwork-library/renders/brum-proof/motion/Punch_06--84c5ced8e573.png
artwork-library/renders/brum-proof/motion/Punch_07--79b6003aa7cf.png
artwork-library/renders/brum-proof/motion/Punch_08--60d70a446aa9.png
artwork-library/renders/brum-proof/motion/Punch_09--42a95e97f869.png
artwork-library/renders/brum-proof/no-caps/Neutral_00--cf7e055417f7.png
artwork-library/renders/brum-proof/punch--41de77e8573a.gif
artwork-library/renders/brum-proof/punch/Punch_00--4b2583b46545.png
artwork-library/renders/brum-proof/punch/Punch_02--b314675c232d.png
artwork-library/renders/brum-proof/punch/Punch_04--2074df72ffdb.png
artwork-library/renders/brum-proof/punch/Punch_06--0fb275a9b22c.png
artwork-library/renders/brum-proof/punch/Punch_09--7a922404bf20.png
artwork-library/renders/brum-proof/quarter/Neutral_00--2b71adee7f9e.png
artwork-library/renders/brum-proof/skin-front-final/Neutral_00--14958d9c6ac9.png
artwork-library/renders/brum-proof/skin-front/Neutral_00--097230946b50.png
artwork-library/renders/brum-proof/skin-quarter/Neutral_00--fb2c1ddfa408.png
artwork-library/renders/brum-proof/thumb-contact--b9000fa42aad.png
artwork-library/renders/brum-proof/thumb-front--628a4ecbeae6.png
artwork-library/renders/brum-proof/v2-front/Neutral_00--39ce48eb5290.png
artwork-library/renders/brum-proof/v2-front/Protective_00--915a39f51121.png
artwork-library/renders/brum-proof/v2-front/Welcome_00--0f898923fd77.png
artwork-library/renders/brum-proof/v3-face/Neutral_00--99ab5a8450a4.png
artwork-library/renders/brum-proof/v3-face/Protective_00--dcde520b07a5.png
artwork-library/renders/brum-proof/v3-face/Welcome_00--61811cbc8973.png
artwork-library/renders/brum-proof/v4-face/Neutral_00--1c676d8e0653.png
artwork-library/renders/brum-proof/v4-face/Protective_00--46ad491d89f3.png
artwork-library/renders/brum-proof/v4-face/Welcome_00--93af5cb87a13.png
artwork-library/renders/brum-proof/v5-face/Neutral_00--90ff52657026.png
artwork-library/renders/brum-proof/v6-face/Neutral_00--ac15064441b7.png
artwork-library/renders/brum-proof/v6-face/Protective_00--3945ba1b9fe9.png
artwork-library/renders/brum-proof/v6-face/Welcome_00--e44e253ad6cf.png
artwork-library/renders/brum-proof/v7-body/Neutral_00--b558711f4e7b.png
artwork-library/renders/brum-proof/v7-body/Protective_00--c46daf20163b.png
artwork-library/renders/brum-proof/v7-body/Welcome_00--3038d6bc7a70.png
artwork-library/renders/brum-proof/v7-face/Neutral_00--276141db82e4.png
artwork-library/renders/brum-proof/v7-face/Protective_00--ba9cd9e2ed91.png
artwork-library/renders/brum-proof/v7-face/Welcome_00--76f0c048f883.png
artwork-library/renders/brum-proof/v8-fists/Neutral_00--299160dd9f00.png
artwork-library/renders/brum-proof/v9-body/Neutral_00--d647de58cfe1.png
artwork-library/renders/brum-proof/v9-body/Protective_00--26bf1078df40.png
artwork-library/renders/brum-proof/v9-body/Welcome_00--a3d6498d3589.png
artwork-library/renders/brum-proof/walk--83ffd286413b.gif
artwork-library/renders/cast/anatomy-a-direction--4c5ea7068104.png
artwork-library/renders/cast/anatomy-audit/Animal Pack Vol.2 by @Quaternius/Preview--e32d08a6b8e0.png
artwork-library/renders/cast/anatomy-audit/Cat-source--b055ff58a28d.png
artwork-library/renders/cast/anatomy-audit/Eagle-source--56bca3f78467.png
artwork-library/renders/cast/anatomy-audit/Piranha-source--9a88f3aef0b7.png
artwork-library/renders/cast/anatomy-audit/easyenemy-source--5a804bfd3667.jpg
artwork-library/renders/cast/anatomy-b-direction--776e9511ee4e.png
artwork-library/renders/cast/cast-restart-a-direction--a10556974c59.png
artwork-library/renders/cast/cast-restart-b-direction--f6c9f1d69184.png
artwork-library/renders/cast/source-audit/Alien-pose--0bcb8aee716c.png
artwork-library/renders/cast/source-audit/Alien-source--9f052d2c8f40.png
artwork-library/renders/cast/source-audit/Atlas_Monsters--51328c5226ce.html.txt
artwork-library/renders/cast/source-audit/Birb-pose--2d8eb5fd08a7.png
artwork-library/renders/cast/source-audit/Birb-source--726d3e136ba4.png
artwork-library/renders/cast/source-audit/Cactoro-pose--6c9bc81eaf82.png
artwork-library/renders/cast/source-audit/Cactoro-source--b9942ccec7e4.png
artwork-library/renders/cast/source-audit/Monkroose-pose--129b2ecad437.png
artwork-library/renders/cast/source-audit/Monkroose-source--024b8e0f0fe2.png
artwork-library/renders/cast/source-audit/MushroomKing-pose--900e341a00f3.png
artwork-library/renders/cast/source-audit/MushroomKing-source--583f18b5a772.png
artwork-library/renders/cast/source-audit/Yeti-pose--3d00abb6f7b3.png
artwork-library/renders/cast/source-audit/Yeti-source--04bb1f20d9ab.png
artwork-library/renders/cast/source-audit/source-models--d3043193dd1d.png
artwork-library/renders/cast/source-audit/ultimate-monsters-source--d4ce6d797699.jpg
artwork-library/renders/kit-cast-proof/android-early-flight--6b68d3af4c2d.png
artwork-library/renders/kit-cast-proof/android-early-late-impact--1096228f5b33.png
artwork-library/renders/kit-cast-proof/android-early-opening--bdac37f4def5.png
artwork-library/renders/kit-cast-proof/android-late-flight--55541d600b0b.png
artwork-library/renders/kit-cast-proof/android-late-late-impact--c207f43f23ee.png
artwork-library/renders/kit-cast-proof/android-late-opening--beac25661e4b.png
artwork-library/renders/kit-cast-proof/android-zoom-flight--9c1766fec49b.png
artwork-library/renders/kit-cast-proof/android-zoom-late-impact--6b18bfaeff10.png
artwork-library/renders/kit-cast-proof/android-zoom-opening--43cfc866dff0.png
artwork-library/renders/kit-cast-proof/cast-atlas--4dfef80e5ddd.png
artwork-library/renders/kit-cast-proof/contact-sheet--11b6b8ff4dac.png
artwork-library/renders/kit-cast-proof/ios-early-flight--acb030e0a3ac.png
artwork-library/renders/kit-cast-proof/ios-early-late-impact--9b28014d3883.png
artwork-library/renders/kit-cast-proof/ios-early-opening--1d853442d9be.png
artwork-library/renders/kit-cast-proof/ios-late-flight--7c1427a18b8e.png
artwork-library/renders/kit-cast-proof/ios-late-late-impact--91164687c50c.png
artwork-library/renders/kit-cast-proof/ios-late-opening--0c89d7772bb7.png
artwork-library/renders/kit-cast-proof/ios-zoom-flight--507c5410450e.png
artwork-library/renders/kit-cast-proof/ios-zoom-late-impact--dd8a7838b5a6.png
artwork-library/renders/kit-cast-proof/ios-zoom-opening--768b5b04d2c0.png
artwork-library/renders/kit-cast-proof/kit-cast-native--7dd9a72f7e8c.gif
artwork-library/renders/kit-cast-proof/motion/000--4d5dea144590.png
artwork-library/renders/kit-cast-proof/motion/001--a81054bcb539.png
artwork-library/renders/kit-cast-proof/motion/002--afab4b3993f4.png
artwork-library/renders/kit-cast-proof/motion/003--cf0138adbe4c.png
artwork-library/renders/kit-cast-proof/motion/004--288f7c2901ea.png
artwork-library/renders/kit-cast-proof/motion/005--fdcfb29e3119.png
artwork-library/renders/kit-cast-proof/motion/006--b73f10d529ae.png
artwork-library/renders/kit-cast-proof/motion/007--43d5698b0669.png
artwork-library/renders/kit-cast-proof/motion/008--73a5d0c4318e.png
artwork-library/renders/kit-cast-proof/motion/009--3295faf54150.png
artwork-library/renders/kit-cast-proof/motion/010--8e03be462048.png
artwork-library/renders/kit-cast-proof/motion/011--65482927881c.png
artwork-library/renders/kit-cast-proof/motion/012--f01086c69c6e.png
artwork-library/renders/kit-cast-proof/motion/013--6e8375f9e2fe.png
artwork-library/renders/kit-cast-proof/motion/014--8f728621e161.png
artwork-library/renders/kit-cast-proof/motion/015--b80f9437e2c1.png
artwork-library/renders/kit-cast-proof/motion/016--ea5a630aef31.png
artwork-library/renders/kit-cast-proof/motion/017--e34f9bbdf83a.png
artwork-library/renders/kit-cast-proof/motion/018--53ce36c03e7f.png
artwork-library/renders/kit-cast-proof/motion/019--7ab438437226.png
artwork-library/renders/kit-cast-proof/motion/020--6ff536922077.png
artwork-library/renders/kit-cast-proof/motion/021--d6b088d6bec5.png
artwork-library/renders/kit-cast-proof/motion/022--5bc3c5eb6dd6.png
artwork-library/renders/kit-cast-proof/motion/023--4919a2e3fece.png
artwork-library/renders/kit-cast-proof/motion/024--fa7937aad28a.png
artwork-library/renders/kit-cast-proof/motion/025--01b3174e6c09.png
artwork-library/renders/kit-cast-proof/motion/026--71f9b3978119.png
artwork-library/renders/kit-cast-proof/motion/027--ef5c4d1c5379.png
artwork-library/renders/kit-cast-proof/motion/028--dea985fb8cf5.png
artwork-library/renders/kit-cast-proof/motion/029--51ad1e77a8ef.png
artwork-library/renders/kit-cast-proof/motion/030--87e12308b95b.png
artwork-library/renders/kit-cast-proof/motion/031--05b5465dae8f.png
artwork-library/renders/kit-cast-proof/motion/032--15ee03ee6823.png
artwork-library/renders/kit-cast-proof/motion/033--fba06d3570ea.png
artwork-library/renders/kit-cast-proof/motion/034--a1a095de048b.png
artwork-library/renders/kit-cast-proof/motion/035--3c8789277ee2.png
artwork-library/renders/kit-cast-proof/motion/036--aef07a21f85e.png
artwork-library/renders/kit-cast-proof/motion/037--7e303224eabf.png
artwork-library/renders/kit-cast-proof/motion/038--9afe239b73a7.png
artwork-library/renders/kit-cast-proof/motion/039--038ea0d66331.png
artwork-library/renders/kit-cast-proof/motion/040--619f59a9999b.png
artwork-library/renders/kit-cast-proof/motion/041--22d74450e313.png
artwork-library/renders/kit-cast-proof/motion/042--6f2868bfa4c5.png
artwork-library/renders/kit-cast-proof/motion/043--4d60d919a6d2.png
artwork-library/renders/kit-cast-proof/motion/044--b36f337ed59b.png
artwork-library/renders/kit-cast-proof/motion/045--5721fbdf8712.png
artwork-library/renders/kit-cast-proof/motion/046--50411040073f.png
artwork-library/renders/kit-cast-proof/motion/047--edca8542eefe.png
artwork-library/renders/kit-cast-proof/motion/048--7203060a4afb.png
artwork-library/renders/kit-cast-proof/motion/049--d8fc1974dffd.png
artwork-library/renders/kit-cast-proof/motion/050--601fb000db3e.png
artwork-library/renders/kit-cast-proof/motion/051--4f23b93c5393.png
artwork-library/renders/kit-cast-proof/motion/052--baade5eeffc6.png
artwork-library/renders/kit-cast-proof/motion/053--dc379b710f9c.png
artwork-library/renders/kit-cast-proof/motion/054--54a92bfae126.png
artwork-library/renders/kit-cast-proof/motion/055--160196492a82.png
artwork-library/renders/kit-cast-proof/motion/056--ed11630ff2d3.png
artwork-library/renders/kit-cast-proof/motion/057--d73ff9fc9c64.png
artwork-library/renders/kit-cast-proof/motion/058--352587a45904.png
artwork-library/renders/kit-cast-proof/motion/059--3ae5bca96bb3.png
artwork-library/renders/kit-cast-proof/motion/060--884fe784785b.png
artwork-library/renders/kit-cast-proof/motion/061--c106fa5a8dff.png
artwork-library/renders/kit-cast-proof/motion/062--e5ca73544586.png
artwork-library/renders/kit-cast-proof/motion/063--e5d8f15246d7.png
artwork-library/renders/kit-cast-proof/motion/064--b278c719e13c.png
artwork-library/renders/kit-cast-proof/motion/065--f2b48e032172.png
artwork-library/renders/kit-cast-proof/motion/066--0305cdb214b1.png
artwork-library/renders/kit-cast-proof/motion/067--e06b3a0e5326.png
artwork-library/renders/kit-cast-proof/motion/068--300ad7d768b9.png
artwork-library/renders/kit-cast-proof/motion/069--d27927daed2b.png
artwork-library/renders/kit-cast-proof/motion/070--ebbdc328a378.png
artwork-library/renders/kit-cast-proof/motion/071--32cf1aa56e44.png
artwork-library/renders/kit-cast-proof/motion/072--7983207f22da.png
artwork-library/renders/kit-proof/face/Cheer_face_00--d980565ecc22.png
artwork-library/renders/kit-proof/face/Focus_face_00--5cd902a56fcc.png
artwork-library/renders/kit-proof/face/Idle_face_00--6f1040541c9a.png
artwork-library/renders/kit-proof/face/Worried_face_00--a19be18b60bb.png
artwork-library/renders/kit-proof/front/Idle_00--a2ffdb072de3.png
artwork-library/renders/kit-proof/motion-clearance--af65a0774b55.png
artwork-library/renders/kit-proof/motion-clearance-v2--d3fb3b5d9f4c.png
artwork-library/renders/kit-proof/motion/Cheer_00--80b2296909af.png
artwork-library/renders/kit-proof/motion/Cheer_08--c31fad8554b1.png
artwork-library/renders/kit-proof/motion/Cheer_15--7921ccda6987.png
artwork-library/renders/kit-proof/motion/Focus_00--8d1e17afbcda.png
artwork-library/renders/kit-proof/motion/Focus_06--a1fe481f3a25.png
artwork-library/renders/kit-proof/motion/Focus_11--e245a8d30202.png
artwork-library/renders/kit-proof/motion/Hurt_00--382f596893e7.png
artwork-library/renders/kit-proof/motion/Hurt_04--d078f7b41faa.png
artwork-library/renders/kit-proof/motion/Hurt_07--021517fdb2db.png
artwork-library/renders/kit-proof/proof-board--57aa6f7e5921.png
artwork-library/renders/kit-proof/quarter/Idle_00--83a3287d1749.png
artwork-library/renders/kit-proof/skin-front/Idle_face_00--92ea6cc8079b.png
artwork-library/renders/kit-proof/skin-quarter/Idle_face_00--130734b8a170.png
artwork-library/renders/kit-proof/turn-back/Idle_00--8e051dbc3af7.png
artwork-library/renders/kit-proof/turn-front/Idle_00--081c8ce484af.png
artwork-library/renders/kit-proof/turn-quarter/Idle_00--60488561be02.png
artwork-library/renders/kit-proof/turn-side/Idle_00--aec10658b7df.png
artwork-library/renders/rejected-cast-20261018/design/phase1/img/cast-a-space-wardens--6994f1ab5bbc.png
artwork-library/renders/rejected-cast-20261018/design/phase1/img/cast-b-castle-to-cosmos--479467a5f855.png
artwork-library/renders/rejected-cast-20261018/design/phase1/img/cast-v2-a--60f806ab2c53.png
artwork-library/renders/rejected-cast-20261018/design/phase1/img/cast-v2-b--20ac53015657.png
artwork-library/renders/rejected-kit-20261018/assets/kit/cheer--bbd2a83bd182.png
artwork-library/renders/rejected-kit-20261018/assets/kit/determined--d920ed0ed8f9.png
artwork-library/renders/rejected-kit-20261018/assets/kit/focused--baf7a959aba4.png
artwork-library/renders/rejected-kit-20261018/assets/kit/grin--9fc2a8ce4177.png
artwork-library/renders/rejected-kit-20261018/assets/kit/hurt--a269716edae6.png
artwork-library/renders/rejected-kit-20261018/assets/kit/laugh--469231a40d7a.png
artwork-library/renders/rejected-kit-20261018/assets/kit/shock--05f156710aa4.png
artwork-library/renders/rejected-kit-20261018/assets/kit/worried--1ff1f7db5c72.png
artwork-library/renders/rejected-kit-20261018/design/phase1/img/01-kit-character-1--6720dac1e38f.png
artwork-library/renders/rejected-kit-20261018/design/phase1/img/01-kit-character-2--94ecb2735883.png
artwork-library/renders/rejected-kit-20261018/design/phase1/img/01-kit-character-3--f42d5724d155.png
artwork-library/renders/rejected-kit-20261018/design/phase1/img/01-kit-character-4--3e2fcf91a070.png
artwork-library/renders/rejected-kit-20261018/design/phase1/img/01-kit-character-5--1e29405b38f6.png
artwork-library/sources/fantasy-machinery/proof/android-assembly--e8b2612b653e.png
artwork-library/sources/fantasy-machinery/proof/crusherClaw-collision--e00060eb3718.png
artwork-library/sources/fantasy-machinery/proof/gateClaw-collision--cb06931927a6.png
artwork-library/sources/fantasy-machinery/proof/grounding-source-composite--ba5d16712b83.png
artwork-library/sources/fantasy-machinery/proof/ios-assembly--36c9a1c42214.png
artwork-library/sources/fantasy-machinery/proof/keypose-assembly--f09e0b203e82.gif
artwork-library/sources/fantasy-machinery/proof/korr-idle-collision--84664ea09ecb.png
artwork-library/sources/fantasy-machinery/proof/korr-release-collision--1b8e6565a92c.png
artwork-library/sources/fantasy-machinery/proof/korr-stagger-collision--82bebafcbb85.png
artwork-library/sources/fantasy-machinery/proof/korr-windup-collision--70fbd4c26357.png
artwork-library/sources/fantasy-machinery/proof/nerra-v2/android-pull--34e0eb5311df.png
artwork-library/sources/fantasy-machinery/proof/nerra-v2/ios-hurt--9174cd18911c.png
artwork-library/sources/fantasy-machinery/proof/nerra-v2/ios-idle--e7ec8920c93c.png
artwork-library/sources/fantasy-machinery/proof/nerra-v2/ios-pull--d920642e6612.png
artwork-library/sources/fantasy-machinery/proof/nerra-v2/ios-step--330ec816eadf.png
artwork-library/sources/fantasy-machinery/proof/nerra-v2/keyposes--cf5aafa39019.gif
artwork-library/sources/fantasy-machinery/proof/nerra-v2/native-poses--e1c6dce1f25e.png
artwork-library/sources/fantasy-machinery/proof/nerraBody-collision--f2a3360e37fd.png
artwork-library/sources/fantasy-machinery/proof/parts-contact--32182804136d.png
artwork-library/sources/fantasy-machinery/proof/reactions/contact--5d7718562e1c.png
artwork-library/sources/fantasy-machinery/proof/reactions/korr-dazed-ios--2278680f91bf.png
artwork-library/sources/fantasy-machinery/proof/reactions/korr-defeat-ios--b690c16b84eb.png
artwork-library/sources/fantasy-machinery/proof/reactions/nerra-defeat-ios--a69599855552.png
artwork-library/sources/fantasy-machinery/proof/reactions/nerra-fury-ios--134338e2471b.png
artwork-library/sources/fantasy-machinery/proof/water-shot-native--c468062241e2.png
artwork-library/sources/fantasy-machinery/source/background-pair-v1--4ca8531182c0.png
artwork-library/sources/fantasy-machinery/source/background-pair-v2--8074e80015b5.png
artwork-library/sources/fantasy-machinery/source/bell-cradle-v1--340d04e3bf4e.png
artwork-library/sources/fantasy-machinery/source/bellforge-sheet-v1--c220fe54d83e.png
artwork-library/sources/fantasy-machinery/source/bellforge-sheet-v2--2688aec368b6.png
artwork-library/sources/fantasy-machinery/source/grounding-sheet-v1--033a7daf69b1.png
artwork-library/sources/fantasy-machinery/source/nerra-motion-v1--207638df8b6c.png
artwork-library/sources/fantasy-machinery/source/nerra-motion-v2--afecbfb234c1.png
artwork-library/sources/fantasy-machinery/source/reactions-v1--67cefe6a3b15.png
artwork-library/sources/fantasy-machinery/source/tidewheel-bricks-v1--c8061573b71f.png
artwork-library/sources/fantasy-machinery/source/tidewheel-sheet-v1--2fa3bcd1f1be.png
artwork-library/sources/fantasy-machinery/source/water-shot-v1--5339f2742b54.png
artwork-library/sources/frost-warden/renders/hurt_00--1b2857004e02.png
artwork-library/sources/frost-warden/renders/hurt_01--b34407fdb681.png
artwork-library/sources/frost-warden/renders/hurt_02--20dff0cf4608.png
artwork-library/sources/frost-warden/renders/hurt_03--1d33e6a8c343.png
artwork-library/sources/frost-warden/renders/idle_00--4a8000aefc55.png
artwork-library/sources/frost-warden/renders/idle_01--e8d57ba497c4.png
artwork-library/sources/frost-warden/renders/idle_02--e192a09fb04e.png
artwork-library/sources/frost-warden/renders/idle_03--1c1ac8485786.png
artwork-library/sources/frost-warden/renders/recover_00--adee5b55f042.png
artwork-library/sources/frost-warden/renders/recover_01--21e725b9834c.png
artwork-library/sources/frost-warden/renders/recover_02--0b12bdbd45c3.png
artwork-library/sources/frost-warden/renders/strike_00--b705c410e212.png
artwork-library/sources/frost-warden/renders/strike_01--f7158106a9bf.png
artwork-library/sources/frost-warden/renders/strike_02--42ea8615f53d.png
artwork-library/sources/frost-warden/renders/strike_03--d42e45cd6194.png
artwork-library/sources/frost-warden/renders/victory_00--97d05e1373f4.png
artwork-library/sources/frost-warden/renders/victory_01--96127eb4a5be.png
artwork-library/sources/frost-warden/renders/victory_02--9d8fdc7a7fe9.png
artwork-library/sources/frost-warden/renders/victory_03--20152ed8dc97.png
artwork-library/sources/frost-warden/renders/walk_00--2869415af38c.png
artwork-library/sources/frost-warden/renders/walk_01--852e9ab226a9.png
artwork-library/sources/frost-warden/renders/walk_02--f870348bdec6.png
artwork-library/sources/frost-warden/renders/walk_03--8bb285af90c1.png
artwork-library/sources/frost-warden/renders/windup_00--6b49e2e0f602.png
artwork-library/sources/frost-warden/renders/windup_01--deb83633bfd7.png
artwork-library/sources/frost-warden/renders/windup_02--abdff8c8d3b5.png
artwork-library/sources/frost-warden/renders/windup_03--12f4a4bf48a5.png
artwork-library/sources/mooncoil/proof/family--61c3610a5829.png
artwork-library/sources/mooncoil/proof/seed--26990b6cbebf.png
artwork-library/sources/mooncoil/proof/seed-brick-b-2-0--0d0b8ac9600a.png
artwork-library/sources/mooncoil/reliquary-background-source--becb8fe53186.png
artwork-library/sources/mooncoil/source/crack_b_1_1--2c013d7f6ad0.png
artwork-library/sources/mooncoil/source/crack_b_2_1--09f50d75655c.png
artwork-library/sources/mooncoil/source/crack_c_1_1--f921f3c740b6.png
artwork-library/sources/mooncoil/source/crack_c_2_1--f532f07c241d.png
artwork-library/sources/mooncoil/source/crack_t_1_1--ab28dd4c0642.png
artwork-library/sources/mooncoil/source/crack_t_2_1--0357f1a9bc1c.png
artwork-library/sources/mooncoil/source/crack_v_1_1--f1f915746b59.png
artwork-library/sources/mooncoil/source/crack_v_2_1--867e48c52fc7.png
artwork-library/sources/snake-emerald/proof/anchors--297e7be7221b.png
artwork-library/sources/snake-emerald/proof/contact--aa0966b7710c.png
artwork-library/sources/snake-emerald/source/heads-v1--ce924290a0c5.png
artwork-library/sources/space/circuit-companions/source/latch-original--80f2f3056437.png
artwork-library/sources/space/circuit-companions/source/vesper-original--e14168bb92fd.png
artwork-library/sources/space/circuit/source/craft-family--327c31dc8a3e.png
artwork-library/sources/space/circuit/source/phase-badge--6f02bd94ec47.png
artwork-library/sources/space/companions/source/nix-expressions-reference--c20e8b9804d0.png
artwork-library/sources/space/companions/source/nix-family-original--3a7c5a1e7a21.png
artwork-library/sources/space/companions/source/nix-reference--8b2c00350981.png
artwork-library/sources/space/companions/source/tick-reference--0962ec32df60.png
artwork-library/sources/space/companions/source/tick-secure-original--74c033e4a275.png
artwork-library/sources/space/forge/background-source--ec7664ab187b.png
artwork-library/sources/space/forge/cannon-source--ad9ec26913fd.png
artwork-library/sources/space/forge/panel-family-source--1c669924fde7.png
artwork-library/sources/space/forge/projector-source--4399f9f3fc91.png
artwork-library/sources/space/forge/stabiliser-cover-source--12a6a6d42c19.png
artwork-library/sources/space/forge/stabiliser-open-source--73fd4446654a.png
artwork-library/sources/space/source/a-cyan-reference--108353514ad1.png
artwork-library/sources/space/source/a-paddle-reference--33d921bfcbbb.png
artwork-library/sources/space/source/a-pink-reference--d1ede0d01c1b.png
artwork-library/sources/space/source/a_cannon--f9a2b088bb23.png
artwork-library/sources/space/source/a_cannon_v2--b192d9819b7b.png
artwork-library/sources/space/source/a_doors--616543f5cc9a.png
artwork-library/sources/space/source/a_fighter--fed1121c0f0d.png
artwork-library/sources/space/source/a_hull--d527b8d03e3a.png
artwork-library/sources/space/source/a_worker--9a2626c5e868.png
artwork-library/sources/space/source/b_cannon--9bdf39a2ecca.png
artwork-library/sources/space/source/b_hull--9d9037a91bac.png
artwork-library/sources/space/source/b_iris--be40709c9d1d.png
artwork-library/sources/space/source/b_pod--e5f493882d58.png
artwork-library/sources/space/source/b_portal--bd59a56f9916.png
artwork-library/sources/space/source/b_skiff--6b49e46b06ed.png
artwork-library/sources/space/source/b_worker--ae5ba795f91e.png
artwork-library/sources/space/source/background-a-footprint-original--f379b84271b7.png
artwork-library/sources/space/source/background-a-original--520132011ef6.png
artwork-library/sources/space/source/background-b-footprint-original--6e9ca342a6e2.png
artwork-library/sources/space/source/background-b-original--a3a2801ac3d3.png
artwork-library/sources/space/source/background-b-repaired-original--30f601e6f1aa.png
artwork-library/sources/space/source/brick-pink-original--3b3a2bd067b5.png
artwork-library/sources/space/source/carrier-panels-original--8e48c463f84b.png
artwork-library/sources/space/source/common-atlas-original--7183a7727a7f.png
artwork-library/sources/space/source/orbital-bay-original--dc094bc547ff.png
artwork-library/sources/space/source/orbital-doors-original--22f40ae50e97.png
artwork-library/sources/space/source/orbital-hangar-reference--76512e34872d.png
artwork-library/sources/space/source/orbital-hull-original--ba86b0d03ece.png
artwork-library/sources/space/source/orbital-hull-reference--e6655e12a9c4.png
artwork-library/sources/space/source/orbital-reference-pane--d0b0fbc43967.png
artwork-library/sources/space/source/plume--191c0e9525ca.png
artwork-library/sources/space/weapons-v2/rejected-draft-01/helix-charge-08--570e63a88454.png
artwork-library/sources/space/weapons-v2/rejected-draft-01/helix-flight-08--dcd8d0ad5f8d.png
artwork-library/sources/space/weapons-v2/rejected-draft-01/helix-impact-04--909a5bc1960e.png
artwork-library/sources/space/weapons-v2/rejected-draft-01/reactor-charge-08--bb1a81497622.png
artwork-library/sources/space/weapons-v2/rejected-draft-01/reactor-flight-08--4631e5d863ba.png
artwork-library/sources/space/weapons-v2/rejected-draft-01/reactor-impact-04--7e1f42866a00.png
artwork-library/sources/starflight-arsenal/source--05d3b21215bc.png
artwork-library/sources/starflight-equipment/source-v1--92b62ad01ffc.png
artwork-library/sources/starflight-storm/assembly-proof--b3924b6b2468.png
artwork-library/sources/starflight-storm/native-proof--a42d715de6f8.png
artwork-library/sources/starflight-storm/source-v1--8f9638ebe79a.png
artwork-library/sources/starflight-v2/enemy-family-source-v1--87ab2adfeb5e.png
artwork-library/sources/starflight-v2/native-extraction-proof--44de464d918f.png
artwork-library/sources/starflight/background-source-v1--c0227809c33e.png
artwork-library/sources/starflight/native-extraction-proof--11bf88dc03a3.png
artwork-library/sources/starflight/ships-source-v1--47ae97122b73.png
artwork-library/sources/starflight/weapons-source--aae9897b3521.png
assets/castle/window-manifest.json
assets/castle/window_back.png
assets/castle/window_front.png
assets/castle/window_front_cracked.png
assets/circuit-companions/latch.png
assets/circuit-companions/latch_00.png
assets/circuit-companions/latch_01.png
assets/circuit-companions/latch_02.png
assets/circuit-companions/latch_03.png
assets/circuit-companions/latch_04.png
assets/circuit-companions/latch_05.png
assets/circuit-companions/latch_06.png
assets/circuit-companions/latch_07.png
assets/circuit-companions/manifest.json
assets/circuit-companions/vesper.png
assets/circuit-companions/vesper_00.png
assets/circuit-companions/vesper_01.png
assets/circuit-companions/vesper_02.png
assets/circuit-companions/vesper_03.png
assets/circuit-companions/vesper_04.png
assets/circuit-companions/vesper_05.png
assets/circuit-companions/vesper_06.png
assets/circuit-companions/vesper_07.png
assets/circuit-companions/vesper_08.png
assets/fantasy-machinery/bell.png
assets/fantasy-machinery/bellCradle.png
assets/fantasy-machinery/bellforge-background.png
assets/fantasy-machinery/brick-coral.png
assets/fantasy-machinery/brick-ivory.png
assets/fantasy-machinery/brick-sage.png
assets/fantasy-machinery/chain-v2.png
assets/fantasy-machinery/counterweight.png
assets/fantasy-machinery/crusherClaw.png
assets/fantasy-machinery/gate.png
assets/fantasy-machinery/gateClaw.png
assets/fantasy-machinery/gateClawV2.png
assets/fantasy-machinery/gateFrame.png
assets/fantasy-machinery/hopperStudy.png
assets/fantasy-machinery/korr-dazed-v1.png
assets/fantasy-machinery/korr-defeat-v1.png
assets/fantasy-machinery/korr-idle.png
assets/fantasy-machinery/korr-release.png
assets/fantasy-machinery/korr-stagger.png
assets/fantasy-machinery/korr-windup.png
assets/fantasy-machinery/korr.png
assets/fantasy-machinery/leverMount.png
assets/fantasy-machinery/lift.png
assets/fantasy-machinery/manifest.json
assets/fantasy-machinery/nerra-dazed-v1.png
assets/fantasy-machinery/nerra-defeat-v1.png
assets/fantasy-machinery/nerra-fury-v1.png
assets/fantasy-machinery/nerra-v2-hurt.png
assets/fantasy-machinery/nerra-v2-idle.png
assets/fantasy-machinery/nerra-v2-manifest.json
assets/fantasy-machinery/nerra-v2-pull.png
assets/fantasy-machinery/nerra-v2-step.png
assets/fantasy-machinery/nerra-v2.png
assets/fantasy-machinery/nerraBody.png
assets/fantasy-machinery/plinth.png
assets/fantasy-machinery/raft.png
assets/fantasy-machinery/ramp.png
assets/fantasy-machinery/ratchet.png
assets/fantasy-machinery/reactions-manifest.json
assets/fantasy-machinery/refugeBalcony.png
assets/fantasy-machinery/releaseLever.png
assets/fantasy-machinery/sluiceWall.png
assets/fantasy-machinery/tidewheel-background.png
assets/fantasy-machinery/water-shot-manifest.json
assets/fantasy-machinery/water-shot.png
assets/fantasy-machinery/wheel.png
assets/fonts/LilitaOne-OFL.txt
assets/fonts/LilitaOne-Regular.ttf
assets/fonts/Rubik-OFL.txt
assets/fonts/Rubik.ttf
assets/frost-warden/hurt_00.png
assets/frost-warden/hurt_01.png
assets/frost-warden/hurt_02.png
assets/frost-warden/hurt_03.png
assets/frost-warden/idle_00.png
assets/frost-warden/idle_01.png
assets/frost-warden/idle_02.png
assets/frost-warden/idle_03.png
assets/frost-warden/manifest.json
assets/frost-warden/recover_00.png
assets/frost-warden/recover_01.png
assets/frost-warden/recover_02.png
assets/frost-warden/recover_03.png
assets/frost-warden/strike_00.png
assets/frost-warden/strike_01.png
assets/frost-warden/strike_02.png
assets/frost-warden/strike_03.png
assets/frost-warden/victory_00.png
assets/frost-warden/victory_01.png
assets/frost-warden/victory_02.png
assets/frost-warden/victory_03.png
assets/frost-warden/walk_00.png
assets/frost-warden/walk_01.png
assets/frost-warden/walk_02.png
assets/frost-warden/walk_03.png
assets/frost-warden/warden.png
assets/frost-warden/windup_00.png
assets/frost-warden/windup_01.png
assets/frost-warden/windup_02.png
assets/frost-warden/windup_03.png
assets/fx-kit/arrow.png
assets/fx-kit/bow.png
assets/fx-kit/chip_a.png
assets/fx-kit/chip_b.png
assets/fx-kit/chip_c.png
assets/fx-kit/fx-manifest.json
assets/fx-kit/pip_blue.png
assets/fx-kit/pip_empty.png
assets/fx-kit/pip_gold.png
assets/fx-kit/pip_rose.png
assets/fx-kit/spark.png
assets/glaze2/atlas.json
assets/glaze2/brick_b_1_0.png
assets/glaze2/brick_b_1_1.png
assets/glaze2/brick_b_1_2.png
assets/glaze2/brick_b_1_x.png
assets/glaze2/brick_b_2_0.png
assets/glaze2/brick_b_2_1.png
assets/glaze2/brick_b_2_2.png
assets/glaze2/brick_b_2_x.png
assets/glaze2/brick_c_1_0.png
assets/glaze2/brick_c_1_1.png
assets/glaze2/brick_c_1_2.png
assets/glaze2/brick_c_1_x.png
assets/glaze2/brick_c_2_0.png
assets/glaze2/brick_c_2_1.png
assets/glaze2/brick_c_2_2.png
assets/glaze2/brick_c_2_x.png
assets/glaze2/brick_chest_2_0.png
assets/glaze2/brick_chest_2_1.png
assets/glaze2/brick_coin_2_0.png
assets/glaze2/brick_gold_1_0.png
assets/glaze2/brick_gold_1_1.png
assets/glaze2/brick_gold_1_2.png
assets/glaze2/brick_gold_2_0.png
assets/glaze2/brick_gold_2_1.png
assets/glaze2/brick_gold_2_2.png
assets/glaze2/brick_granite_1_0.png
assets/glaze2/brick_granite_2_0.png
assets/glaze2/brick_t_1_0.png
assets/glaze2/brick_t_1_1.png
assets/glaze2/brick_t_1_2.png
assets/glaze2/brick_t_1_x.png
assets/glaze2/brick_t_2_0.png
assets/glaze2/brick_t_2_1.png
assets/glaze2/brick_t_2_2.png
assets/glaze2/brick_t_2_x.png
assets/glaze2/brick_v_1_0.png
assets/glaze2/brick_v_1_1.png
assets/glaze2/brick_v_1_2.png
assets/glaze2/brick_v_1_x.png
assets/glaze2/brick_v_2_0.png
assets/glaze2/brick_v_2_1.png
assets/glaze2/brick_v_2_2.png
assets/glaze2/brick_v_2_x.png
assets/glaze2/brick_y_1_0.png
assets/glaze2/brick_y_1_1.png
assets/glaze2/brick_y_1_2.png
assets/glaze2/brick_y_1_x.png
assets/glaze2/brick_y_2_0.png
assets/glaze2/brick_y_2_1.png
assets/glaze2/brick_y_2_2.png
assets/glaze2/brick_y_2_x.png
assets/hoard/cave.png
assets/hoard/coin.png
assets/hoard/coin_chips_a.png
assets/hoard/coin_chips_b.png
assets/hoard/crown_chest.png
assets/hoard/crown_chest_cracked.png
assets/hoard/ember__breath.png
assets/hoard/ember__defeat.png
assets/hoard/ember__sleep.png
assets/hoard/ember__stir.png
assets/hoard/ember__sweep.png
assets/hoard/ember__windup.png
assets/hoard/ember_attack.png
assets/hoard/ember_defeat.png
assets/hoard/ember_hurt.png
assets/hoard/ember_idle.png
assets/hoard/ember_panic.png
assets/hoard/ember_stagger.png
assets/hoard/ember_taunt.png
assets/hoard/ember_windup.png
assets/hoard/eye__0.png
assets/hoard/eye__1.png
assets/hoard/eye__2.png
assets/hoard/eye__3.png
assets/hoard/eye__4.png
assets/hoard/manifest.json
assets/hoard/prop__burst_coin.png
assets/hoard/prop__burst_gem.png
assets/hoard/prop__chime.png
assets/hoard/prop__chime_ring.png
assets/hoard/prop__gate_0.png
assets/hoard/prop__gate_1.png
assets/hoard/prop__gate_2.png
assets/hoard/prop__molten_0.png
assets/hoard/prop__molten_1.png
assets/hoard/prop__molten_2.png
assets/invasion/atlas.json
assets/invasion/plate.jpg
assets/kit-cast/meta.json
assets/kit/meta.json
assets/kit/preview.gif
assets/models/kk_Knight.glb
assets/models/kk_Mage.glb
assets/models/kk_Rogue.glb
assets/mooncoil/background.png
assets/mooncoil/brick_b_1_0.png
assets/mooncoil/brick_b_1_1.png
assets/mooncoil/brick_b_2_0.png
assets/mooncoil/brick_b_2_1.png
assets/mooncoil/brick_c_1_0.png
assets/mooncoil/brick_c_1_1.png
assets/mooncoil/brick_c_2_0.png
assets/mooncoil/brick_c_2_1.png
assets/mooncoil/brick_cache_1_0.png
assets/mooncoil/brick_slate_1_0.png
assets/mooncoil/brick_slate_2_0.png
assets/mooncoil/brick_t_1_0.png
assets/mooncoil/brick_t_1_1.png
assets/mooncoil/brick_t_2_0.png
assets/mooncoil/brick_t_2_1.png
assets/mooncoil/brick_v_1_0.png
assets/mooncoil/brick_v_1_1.png
assets/mooncoil/brick_v_2_0.png
assets/mooncoil/brick_v_2_1.png
assets/mooncoil/bricks-manifest.json
assets/orbital-forge/armour.png
assets/orbital-forge/background.png
assets/orbital-forge/cannon.png
assets/orbital-forge/cyan.png
assets/orbital-forge/manifest.json
assets/orbital-forge/projector_arm.png
assets/orbital-forge/reactor.png
assets/orbital-forge/runtime/armour.webp
assets/orbital-forge/runtime/background.webp
assets/orbital-forge/runtime/ball.webp
assets/orbital-forge/runtime/bay_back.webp
assets/orbital-forge/runtime/bay_mask.webp
assets/orbital-forge/runtime/cannon.webp
assets/orbital-forge/runtime/cyan.webp
assets/orbital-forge/runtime/door_left.webp
assets/orbital-forge/runtime/door_right.webp
assets/orbital-forge/runtime/doors_pair.webp
assets/orbital-forge/runtime/hull.webp
assets/orbital-forge/runtime/paddle.webp
assets/orbital-forge/runtime/projector_arm.webp
assets/orbital-forge/runtime/reactor.webp
assets/orbital-forge/runtime/report.json
assets/orbital-forge/runtime/station_body.webp
assets/orbital-forge/runtime/station_coil.webp
assets/orbital-forge/runtime/station_cover.webp
assets/orbital-forge/runtime/violet.webp
assets/orbital-forge/station_body.png
assets/orbital-forge/station_coil.png
assets/orbital-forge/station_cover.png
assets/orbital-forge/violet.png
assets/paddle-skins/kit_l.png
assets/paddle-skins/kit_m.png
assets/paddle-skins/kit_r.png
assets/paddle-skins/lumi_l.png
assets/paddle-skins/lumi_m.png
assets/paddle-skins/lumi_r.png
assets/paddle-skins/skins-manifest.json
assets/power-icons/arrows.png
assets/power-icons/five.png
assets/power-icons/icons-manifest.json
assets/power-icons/lullaby.png
assets/power-icons/moonbind.png
assets/power-icons/ram_song.png
assets/power-icons/ram_steel.png
assets/power-icons/ricochet.png
assets/power-icons/shield.png
assets/power-icons/songshield.png
assets/power-icons/starlight.png
assets/power-icons/titan.png
assets/premium/bellforge/ceramic_coral.png
assets/premium/bellforge/ceramic_plum.png
assets/premium/bellforge/ceramic_teal.png
assets/premium/bellforge/pin_1hp.png
assets/premium/bellforge/pin_2hp.png
assets/premium/carrier/enamel_cyan.png
assets/premium/carrier/enamel_pink.png
assets/premium/frost/backdrop.jpg
assets/premium/frost/backdrop.png
assets/premium/frost/post_0.png
assets/premium/frost/post_1.png
assets/premium/frost/post_2.png
assets/premium/glints/glint_cool.png
assets/premium/glints/glint_rose.png
assets/premium/glints/glint_warm.png
assets/premium/manifest.json
assets/premium/shards/blue_a.png
assets/premium/shards/blue_b.png
assets/premium/shards/blue_c.png
assets/premium/shards/ceramic_a.png
assets/premium/shards/ceramic_b.png
assets/premium/shards/ceramic_c.png
assets/premium/shards/coral_a.png
assets/premium/shards/coral_b.png
assets/premium/shards/coral_c.png
assets/premium/shards/cyan_a.png
assets/premium/shards/cyan_b.png
assets/premium/shards/cyan_c.png
assets/premium/shards/gold_a.png
assets/premium/shards/gold_b.png
assets/premium/shards/gold_c.png
assets/premium/shards/hull_a.png
assets/premium/shards/hull_b.png
assets/premium/shards/hull_c.png
assets/premium/shards/ice_a.png
assets/premium/shards/ice_b.png
assets/premium/shards/ice_c.png
assets/premium/shards/ivory_a.png
assets/premium/shards/ivory_b.png
assets/premium/shards/ivory_c.png
assets/premium/shards/pink_a.png
assets/premium/shards/pink_b.png
assets/premium/shards/pink_c.png
assets/premium/shards/plum_a.png
assets/premium/shards/plum_b.png
assets/premium/shards/plum_c.png
assets/premium/shards/sage_a.png
assets/premium/shards/sage_b.png
assets/premium/shards/sage_c.png
assets/premium/shards/teal_a.png
assets/premium/shards/teal_b.png
assets/premium/shards/teal_c.png
assets/premium/shards/violet_a.png
assets/premium/shards/violet_b.png
assets/premium/shards/violet_c.png
assets/previews/Mage.png
assets/previews/Rogue.png
assets/previews/mage_rogue.png
assets/previews/rogue_tex.png
assets/princess/faces/manifest.json
assets/relay-circuit/craftFlight.png
assets/relay-circuit/craftLeft.png
assets/relay-circuit/craftMorph.png
assets/relay-circuit/craftRight.png
assets/relay-circuit/manifest.json
assets/relay-circuit/phaseBadge.png
assets/relay-circuit/portLeft.png
assets/relay-circuit/portRight.png
assets/relay-circuit/runtime-base/bBackground.webp
assets/relay-circuit/runtime-base/bCannonBarrel.webp
assets/relay-circuit/runtime-base/bHull.webp
assets/relay-circuit/runtime-base/bIris.webp
assets/relay-circuit/runtime-base/bPod.webp
assets/relay-circuit/runtime-base/bPortal.webp
assets/relay-circuit/runtime-base/bSkiff.webp
assets/relay-circuit/runtime-base/bThruster.webp
assets/relay-circuit/runtime-base/bWorker.webp
assets/relay-circuit/runtime-base/ball.webp
assets/relay-circuit/runtime-base/brick_armour.webp
assets/relay-circuit/runtime-base/brick_crew_lock.webp
assets/relay-circuit/runtime-base/brick_cyan.webp
assets/relay-circuit/runtime-base/brick_pink.webp
assets/relay-circuit/runtime-base/brick_violet.webp
assets/relay-circuit/runtime-base/capsule_laser.webp
assets/relay-circuit/runtime-base/capsule_shield.webp
assets/relay-circuit/runtime-base/capsule_split.webp
assets/relay-circuit/runtime-base/paddle.webp
assets/relay-circuit/runtime-base/report.json
assets/relay-circuit/runtime-extra/craftFlight.webp
assets/relay-circuit/runtime-extra/craftLeft.webp
assets/relay-circuit/runtime-extra/craftMorph.webp
assets/relay-circuit/runtime-extra/craftRight.webp
assets/relay-circuit/runtime-extra/phaseBadge.webp
assets/relay-circuit/runtime-extra/portLeft.webp
assets/relay-circuit/runtime-extra/portRight.webp
assets/relay-circuit/runtime-extra/report.json
assets/rivals/chamber_floor.png
assets/rivals/clash_0.png
assets/rivals/clash_1.png
assets/rivals/clash_2.png
assets/rivals/lure_gnash_dim.png
assets/rivals/lure_gnash_lit.png
assets/rivals/lure_mooncoil_dim.png
assets/rivals/lure_mooncoil_lit.png
assets/rivals/manifest.json
assets/rivals/seal_crack1.png
assets/rivals/seal_crack2.png
assets/rivals/seal_intact.png
assets/rivals/seal_shattered.png
assets/rivals/shutter_eyes.png
assets/rivals/ward_plate_gilt.png
assets/rivals/ward_plate_iron.png
assets/rivals/window_front_shuttered.png
assets/round2/cap__burst.png
assets/round2/cap__fire.png
assets/round2/cap__focus.png
assets/round2/cap__laser.png
assets/round2/cap__shield.png
assets/round2/cap__shrink.png
assets/round2/cap__slow.png
assets/round2/cap__split.png
assets/round2/cap__wide.png
assets/round2/crate__0.png
assets/round2/crate__1.png
assets/round2/crate__2.png
assets/round2/crate_sq__0.png
assets/round2/crate_sq__1.png
assets/round2/crate_sq__2.png
assets/round2/manifest.json
assets/round2/splash__0.png
assets/round2/splash__1.png
assets/round2/splash__2.png
assets/round2/splash__3.png
assets/round3/backdrop-thumbs/frost_1.png
assets/round3/backdrop-thumbs/frost_2.png
assets/round3/backdrop-thumbs/frost_3.png
assets/round3/backdrop-thumbs/frost_4.png
assets/round3/backdrop-thumbs/gatehouse_1.png
assets/round3/backdrop-thumbs/manifest.json
assets/round3/backdrop-thumbs/tidewheel_1.png
assets/round3/backdrop-thumbs/tidewheel_2.png
assets/round3/backdrop-thumbs/tidewheel_3.png
assets/round3/backdrop-thumbs/tidewheel_4.png
assets/round3/bricks/castle_armour.png
assets/round3/bricks/castle_armour_cracked.png
assets/round3/bricks/castle_chest.png
assets/round3/bricks/castle_chest_cracked.png
assets/round3/bricks/castle_coin.png
assets/round3/bricks/castle_key.png
assets/round3/bricks/castle_mine.png
assets/round3/bricks/castle_steel.png
assets/round3/bricks/frost_armour.png
assets/round3/bricks/frost_armour_cracked.png
assets/round3/bricks/frost_chest.png
assets/round3/bricks/frost_chest_cracked.png
assets/round3/bricks/frost_coin.png
assets/round3/bricks/frost_key.png
assets/round3/bricks/frost_mine.png
assets/round3/bricks/frost_steel.png
assets/round3/bricks/manifest.json
assets/round3/bricks/sea_armour.png
assets/round3/bricks/sea_armour_cracked.png
assets/round3/bricks/sea_chest.png
assets/round3/bricks/sea_chest_cracked.png
assets/round3/bricks/sea_coin.png
assets/round3/bricks/sea_key.png
assets/round3/bricks/sea_mine.png
assets/round3/bricks/sea_steel.png
assets/round3/frost-parts/banner_0.png
assets/round3/frost-parts/banner_1.png
assets/round3/frost-parts/banner_2.png
assets/round3/frost-parts/banner_3.png
assets/round3/frost-parts/crack_0.png
assets/round3/frost-parts/crack_1.png
assets/round3/frost-parts/crack_2.png
assets/round3/frost-parts/crack_3.png
assets/round3/frost-parts/crumble_0.png
assets/round3/frost-parts/crumble_1.png
assets/round3/frost-parts/crumble_2.png
assets/round3/frost-parts/crumble_3.png
assets/round3/frost-parts/drift.png
assets/round3/frost-parts/manifest.json
assets/round3/frost-parts/torch_0.png
assets/round3/frost-parts/torch_1.png
assets/round3/frost-parts/torch_2.png
assets/round3/frost-parts/torch_3.png
assets/round3/frost-parts/torch_4.png
assets/round3/frost-parts/torch_5.png
assets/round3/fx/coins_0.png
assets/round3/fx/coins_1.png
assets/round3/fx/coins_2.png
assets/round3/fx/coins_3.png
assets/round3/fx/coins_4.png
assets/round3/fx/coins_5.png
assets/round3/fx/debris_0.png
assets/round3/fx/debris_1.png
assets/round3/fx/debris_2.png
assets/round3/fx/debris_3.png
assets/round3/fx/debris_4.png
assets/round3/fx/debris_5.png
assets/round3/fx/dust_0.png
assets/round3/fx/dust_1.png
assets/round3/fx/dust_2.png
assets/round3/fx/dust_3.png
assets/round3/fx/dust_4.png
assets/round3/fx/dust_5.png
assets/round3/fx/ice_0.png
assets/round3/fx/ice_1.png
assets/round3/fx/ice_2.png
assets/round3/fx/ice_3.png
assets/round3/fx/ice_4.png
assets/round3/fx/ice_5.png
assets/round3/fx/manifest.json
assets/round3/fx/splash_0.png
assets/round3/fx/splash_1.png
assets/round3/fx/splash_2.png
assets/round3/fx/splash_3.png
assets/round3/fx/splash_4.png
assets/round3/fx/splash_5.png
assets/round3/fx/splash_6.png
assets/round3/fx/splash_7.png
assets/round3/gatehouse-parts/banner_0.png
assets/round3/gatehouse-parts/banner_1.png
assets/round3/gatehouse-parts/banner_2.png
assets/round3/gatehouse-parts/banner_3.png
assets/round3/gatehouse-parts/cage_0.png
assets/round3/gatehouse-parts/cage_1.png
assets/round3/gatehouse-parts/cage_2.png
assets/round3/gatehouse-parts/cage_3.png
assets/round3/gatehouse-parts/manifest.json
assets/round3/gatehouse-parts/moat_0.png
assets/round3/gatehouse-parts/moat_1.png
assets/round3/gatehouse-parts/moat_2.png
assets/round3/gatehouse-parts/moat_3.png
assets/round3/gatehouse-parts/torch_0.png
assets/round3/gatehouse-parts/torch_1.png
assets/round3/gatehouse-parts/torch_2.png
assets/round3/gatehouse-parts/torch_3.png
assets/round3/gatehouse-parts/torch_4.png
assets/round3/gatehouse-parts/winch_0.png
assets/round3/gatehouse-parts/winch_1.png
assets/round3/gatehouse-parts/winch_2.png
assets/round3/korr/bell_throw.png
assets/round3/korr/bell_windup.png
assets/round3/korr/crank_0.png
assets/round3/korr/crank_1.png
assets/round3/korr/crank_2.png
assets/round3/korr/crank_3.png
assets/round3/korr/flee_0.png
assets/round3/korr/flee_1.png
assets/round3/korr/flee_2.png
assets/round3/korr/flee_3.png
assets/round3/korr/haul_0.png
assets/round3/korr/haul_1.png
assets/round3/korr/haul_2.png
assets/round3/korr/haul_3.png
assets/round3/korr/manifest.json
assets/round3/korr/stomp_impact.png
assets/round3/korr/stomp_windup.png
assets/round3/korr/turn_front.png
assets/round3/korr/turn_side.png
assets/round3/korr/turn_three_quarter.png
assets/round3/korr/walk_l_0.png
assets/round3/korr/walk_l_1.png
assets/round3/korr/walk_l_2.png
assets/round3/korr/walk_l_3.png
assets/round3/korr/walk_l_4.png
assets/round3/korr/walk_l_5.png
assets/round3/korr/walk_r_0.png
assets/round3/korr/walk_r_1.png
assets/round3/korr/walk_r_2.png
assets/round3/korr/walk_r_3.png
assets/round3/korr/walk_r_4.png
assets/round3/korr/walk_r_5.png
assets/round3/nerra/chain_yank.png
assets/round3/nerra/dazed.png
assets/round3/nerra/defeated.png
assets/round3/nerra/dizzy.png
assets/round3/nerra/flinch.png
assets/round3/nerra/furious.png
assets/round3/nerra/gaze_c.png
assets/round3/nerra/gaze_d.png
assets/round3/nerra/gaze_dl.png
assets/round3/nerra/gaze_dr.png
assets/round3/nerra/gaze_l.png
assets/round3/nerra/gaze_r.png
assets/round3/nerra/gaze_u.png
assets/round3/nerra/gaze_ul.png
assets/round3/nerra/gaze_ur.png
assets/round3/nerra/hurt.png
assets/round3/nerra/jump_crouch.png
assets/round3/nerra/jump_land.png
assets/round3/nerra/jump_takeoff.png
assets/round3/nerra/knocked.png
assets/round3/nerra/manifest.json
assets/round3/nerra/roar.png
assets/round3/nerra/smug.png
assets/round3/nerra/snap_l_strike.png
assets/round3/nerra/snap_l_windup.png
assets/round3/nerra/snap_r_strike.png
assets/round3/nerra/snap_r_windup.png
assets/round3/nerra/stagger.png
assets/round3/nerra/turn_l_0.png
assets/round3/nerra/turn_l_1.png
assets/round3/nerra/turn_l_2.png
assets/round3/nerra/turn_r_0.png
assets/round3/nerra/turn_r_1.png
assets/round3/nerra/turn_r_2.png
assets/round3/nerra/walk_l_0.png
assets/round3/nerra/walk_l_1.png
assets/round3/nerra/walk_l_2.png
assets/round3/nerra/walk_l_3.png
assets/round3/nerra/walk_l_4.png
assets/round3/nerra/walk_l_5.png
assets/round3/nerra/walk_l_6.png
assets/round3/nerra/walk_l_7.png
assets/round3/nerra/walk_r_0.png
assets/round3/nerra/walk_r_1.png
assets/round3/nerra/walk_r_2.png
assets/round3/nerra/walk_r_3.png
assets/round3/nerra/walk_r_4.png
assets/round3/nerra/walk_r_5.png
assets/round3/nerra/walk_r_6.png
assets/round3/nerra/walk_r_7.png
assets/round3/nerra2/chain_yank_0.png
assets/round3/nerra2/chain_yank_1.png
assets/round3/nerra2/dazed.png
assets/round3/nerra2/defeated.png
assets/round3/nerra2/dizzy.png
assets/round3/nerra2/flinch.png
assets/round3/nerra2/furious.png
assets/round3/nerra2/gate_strike.png
assets/round3/nerra2/gate_windup.png
assets/round3/nerra2/gaze_c.png
assets/round3/nerra2/gaze_d.png
assets/round3/nerra2/gaze_dl.png
assets/round3/nerra2/gaze_dr.png
assets/round3/nerra2/gaze_l.png
assets/round3/nerra2/gaze_r.png
assets/round3/nerra2/gaze_u.png
assets/round3/nerra2/gaze_ul.png
assets/round3/nerra2/gaze_ur.png
assets/round3/nerra2/hurt.png
assets/round3/nerra2/idle_0.png
assets/round3/nerra2/idle_1.png
assets/round3/nerra2/idle_2.png
assets/round3/nerra2/idle_3.png
assets/round3/nerra2/jump_air.png
assets/round3/nerra2/jump_crouch.png
assets/round3/nerra2/jump_land.png
assets/round3/nerra2/jump_settle.png
assets/round3/nerra2/jump_takeoff.png
assets/round3/nerra2/knocked.png
assets/round3/nerra2/manifest.json
assets/round3/nerra2/roar.png
assets/round3/nerra2/smug.png
assets/round3/nerra2/snap_l_strike.png
assets/round3/nerra2/snap_l_windup.png
assets/round3/nerra2/turn_front.png
assets/round3/nerra2/turn_l_0.png
assets/round3/nerra2/turn_l_1.png
assets/round3/nerra2/turn_l_2.png
assets/round3/nerra2/turn_r_0.png
assets/round3/nerra2/turn_r_1.png
assets/round3/nerra2/walk_l_0.png
assets/round3/nerra2/walk_l_1.png
assets/round3/nerra2/walk_l_2.png
assets/round3/nerra2/walk_l_3.png
assets/round3/nerra2/walk_l_4.png
assets/round3/nerra2/walk_l_5.png
assets/round3/nerra2/walk_l_6.png
assets/round3/nerra2/walk_l_7.png
assets/round3/nerra2/walk_l_8.png
assets/round3/nerra2/walk_r_0.png
assets/round3/nerra2/walk_r_1.png
assets/round3/nerra2/walk_r_2.png
assets/round3/nerra2/walk_r_3.png
assets/round3/nerra2/walk_r_4.png
assets/round3/nerra2/walk_r_5.png
assets/round3/nerra2/walk_r_6.png
assets/round3/nerra2/walk_r_7.png
assets/round3/nerra2/walk_r_8.png
assets/round3/tidewheel-parts/chain.png
assets/round3/tidewheel-parts/flag_0.png
assets/round3/tidewheel-parts/flag_1.png
assets/round3/tidewheel-parts/flag_2.png
assets/round3/tidewheel-parts/flag_3.png
assets/round3/tidewheel-parts/glow.png
assets/round3/tidewheel-parts/manifest.json
assets/round3/tidewheel-parts/ripple_0.png
assets/round3/tidewheel-parts/ripple_1.png
assets/round3/tidewheel-parts/ripple_2.png
assets/round3/tidewheel-parts/ripple_3.png
assets/round3/tidewheel-parts/sluice_0.png
assets/round3/tidewheel-parts/sluice_1.png
assets/round3/tidewheel-parts/sluice_2.png
assets/round3/tidewheel-parts/sluice_3.png
assets/round3/tidewheel-parts/sluice_4.png
assets/round3/tidewheel-parts/spray.png
assets/round3/tidewheel-parts/torch_0.png
assets/round3/tidewheel-parts/torch_1.png
assets/round3/tidewheel-parts/torch_2.png
assets/round3/tidewheel-parts/torch_3.png
assets/round3/tidewheel-parts/torch_4.png
assets/round3/tidewheel-parts/torch_5.png
assets/round3/tidewheel-parts/wheel.png
assets/round3/warden/dash_l_0.png
assets/round3/warden/dash_l_1.png
assets/round3/warden/dash_l_2.png
assets/round3/warden/dash_l_3.png
assets/round3/warden/dash_l_crouch.png
assets/round3/warden/dash_r_0.png
assets/round3/warden/dash_r_1.png
assets/round3/warden/dash_r_2.png
assets/round3/warden/dash_r_3.png
assets/round3/warden/dash_r_crouch.png
assets/round3/warden/dazed.png
assets/round3/warden/dazed_l.png
assets/round3/warden/dazed_r.png
assets/round3/warden/defeated.png
assets/round3/warden/flinch.png
assets/round3/warden/idle_0.png
assets/round3/warden/idle_1.png
assets/round3/warden/idle_2.png
assets/round3/warden/idle_3.png
assets/round3/warden/manifest.json
assets/round3/warden/pound_recover.png
assets/round3/warden/pound_strike.png
assets/round3/warden/pound_windup.png
assets/round3/warden/recover.png
assets/round3/warden/shapes.json
assets/round3/warden/smash_l.png
assets/round3/warden/smash_r.png
assets/round3/warden2/dash_l_0.png
assets/round3/warden2/dash_l_1.png
assets/round3/warden2/dash_l_2.png
assets/round3/warden2/dash_l_3.png
assets/round3/warden2/dash_l_4.png
assets/round3/warden2/dash_l_crouch.png
assets/round3/warden2/dash_r_0.png
assets/round3/warden2/dash_r_1.png
assets/round3/warden2/dash_r_2.png
assets/round3/warden2/dash_r_3.png
assets/round3/warden2/dash_r_4.png
assets/round3/warden2/dash_r_crouch.png
assets/round3/warden2/dazed.png
assets/round3/warden2/dazed_l.png
assets/round3/warden2/dazed_r.png
assets/round3/warden2/defeated.png
assets/round3/warden2/flinch.png
assets/round3/warden2/idle_0.png
assets/round3/warden2/idle_1.png
assets/round3/warden2/idle_2.png
assets/round3/warden2/idle_3.png
assets/round3/warden2/manifest.json
assets/round3/warden2/pound_recover.png
assets/round3/warden2/pound_settle.png
assets/round3/warden2/pound_strike.png
assets/round3/warden2/pound_windup.png
assets/round3/warden2/recover.png
assets/round3/warden2/smash_l.png
assets/round3/warden2/smash_r.png
assets/snake-ember/manifest.json
assets/snake-ember/meta.json
assets/snake-emerald/manifest.json
assets/snake-emerald/meta.json
assets/snake-jade/README.md
assets/snake-jade/meta.json
assets/snake/meta.json
assets/space-a/background.png
assets/space-a/brick_cyan.png
assets/space-a/brick_pink.png
assets/space-a/cannon_barrel.png
assets/space-a/carrier_hull.png
assets/space-a/common-panels-manifest.json
assets/space-a/door_left.png
assets/space-a/door_right.png
assets/space-a/doors.png
assets/space-a/fighter.png
assets/space-a/paddle.png
assets/space-a/source-crops/brick_cyan.png
assets/space-a/source-crops/brick_pink.png
assets/space-a/source-crops/paddle.png
assets/space-a/thruster.png
assets/space-a/worker.png
assets/space-b/background.png
assets/space-b/cannon_barrel.png
assets/space-b/iris_segment.png
assets/space-b/pod_shell.png
assets/space-b/portal.png
assets/space-b/relay_hull.png
assets/space-b/skiff.png
assets/space-b/worker.png
assets/space-c/bay_back.png
assets/space-c/bay_mask.png
assets/space-c/door_left.png
assets/space-c/door_right.png
assets/space-c/doors_pair.png
assets/space-c/hull.png
assets/space-c/machinery.json
assets/space-common/ball.png
assets/space-common/brick_armour.png
assets/space-common/brick_crew_lock.png
assets/space-common/brick_cyan.png
assets/space-common/brick_pink.png
assets/space-common/brick_violet.png
assets/space-common/capsule_laser.png
assets/space-common/capsule_shield.png
assets/space-common/capsule_split.png
assets/space-common/manifest.json
assets/space-common/paddle.png
assets/space-common/source-crops/ball.png
assets/space-common/source-crops/brick_armour.png
assets/space-common/source-crops/brick_crew_lock.png
assets/space-common/source-crops/brick_cyan.png
assets/space-common/source-crops/brick_pink.png
assets/space-common/source-crops/brick_violet.png
assets/space-common/source-crops/capsule_laser.png
assets/space-common/source-crops/capsule_shield.png
assets/space-common/source-crops/capsule_split.png
assets/space-common/source-crops/paddle.png
assets/space-companions/manifest.json
assets/space-companions/nix.png
assets/space-companions/nix_calm.png
assets/space-companions/nix_cheer.png
assets/space-companions/nix_command_anticipate.png
assets/space-companions/nix_command_blink.png
assets/space-companions/nix_command_release.png
assets/space-companions/nix_command_rise.png
assets/space-companions/nix_command_settle.png
assets/space-companions/nix_focused.png
assets/space-companions/nix_relieved.png
assets/space-companions/nix_sorrow.png
assets/space-companions/nix_surprised.png
assets/space-companions/nix_worried.png
assets/space-companions/tick.png
assets/space-companions/tick_align.png
assets/space-companions/tick_clamp.png
assets/space-companions/tick_neutral.png
assets/space-companions/tick_pleased.png
assets/space-companions/tick_reach.png
assets/space-companions/tick_retract.png
assets/space-companions/tick_secured.png
assets/space-companions/tick_turn.png
assets/starflight-arsenal/drone.png
assets/starflight-arsenal/drones.png
assets/starflight-arsenal/hyper.png
assets/starflight-arsenal/laser.png
assets/starflight-arsenal/manifest.json
assets/starflight-arsenal/missile.png
assets/starflight-arsenal/nova.png
assets/starflight-arsenal/repair.png
assets/starflight-arsenal/seeker.png
assets/starflight-arsenal/shield.png
assets/starflight-arsenal/spiral.png
assets/starflight-arsenal/stasis.png
assets/starflight-equipment/capsule.png
assets/starflight-equipment/guided.png
assets/starflight-equipment/manifest.json
assets/starflight-equipment/ricochet.png
assets/starflight-equipment/shield.png
assets/starflight-storm/body.png
assets/starflight-storm/manifest.json
assets/starflight-storm/ricochet.png
assets/starflight-storm/storm-icon.png
assets/starflight-storm/wing-left.png
assets/starflight-storm/wing-right.png
assets/starflight-v2/asteroid.png
assets/starflight-v2/beetle.png
assets/starflight-v2/crescent.png
assets/starflight-v2/frigate.png
assets/starflight-v2/gravity.png
assets/starflight-v2/manifest.json
assets/starflight-v2/wormhole.png
assets/starflight/background.png
assets/starflight/boss.png
assets/starflight/enemyBolt.png
assets/starflight/exhaust.png
assets/starflight/gunship.png
assets/starflight/impact.png
assets/starflight/manifest.json
assets/starflight/player.png
assets/starflight/playerBolt.png
assets/starflight/scout.png
assets/starflight/weapons/enemy.png
assets/starflight/weapons/explosion.png
assets/starflight/weapons/hyper.png
assets/starflight/weapons/manifest.json
assets/starflight/weapons/muzzle.png
assets/starflight/weapons/plasma.png
assets/starflight/weapons/stasis.png
assets/themed-bricks/bellforge/atlas.json
assets/themed-bricks/bellforge/bar_1_0.png
assets/themed-bricks/bellforge/bar_2_0.png
assets/themed-bricks/bellforge/bellmetal_2_0.png
assets/themed-bricks/bellforge/bellmetal_2_1.png
assets/themed-bricks/bellforge/bellmetal_2_2.png
assets/themed-bricks/bellforge/bronze_2_0.png
assets/themed-bricks/bellforge/bronze_2_1.png
assets/themed-bricks/bellforge/bronze_2_2.png
assets/themed-bricks/bellforge/pin_2_0.png
assets/themed-bricks/bellforge/pin_2_1.png
assets/themed-bricks/bellforge/pin_2_2.png
assets/themed-bricks/bellforge/verdigris_2_0.png
assets/themed-bricks/bellforge/verdigris_2_1.png
assets/themed-bricks/bellforge/verdigris_2_2.png
assets/themed-bricks/frost/atlas.json
assets/themed-bricks/frost/bar_1_0.png
assets/themed-bricks/frost/bar_2_0.png
assets/themed-bricks/frost/blue_2_0.png
assets/themed-bricks/frost/blue_2_1.png
assets/themed-bricks/frost/blue_2_2.png
assets/themed-bricks/frost/ice_2_0.png
assets/themed-bricks/frost/ice_2_1.png
assets/themed-bricks/frost/ice_2_2.png
assets/themed-bricks/frost/violet_2_0.png
assets/themed-bricks/frost/violet_2_1.png
assets/themed-bricks/frost/violet_2_2.png
assets/themed-bricks/gatehouse/argent_2_0.png
assets/themed-bricks/gatehouse/argent_2_1.png
assets/themed-bricks/gatehouse/argent_2_2.png
assets/themed-bricks/gatehouse/atlas.json
assets/themed-bricks/gatehouse/bar_1_0.png
assets/themed-bricks/gatehouse/bar_2_0.png
assets/themed-bricks/gatehouse/gules_2_0.png
assets/themed-bricks/gatehouse/gules_2_1.png
assets/themed-bricks/gatehouse/gules_2_2.png
assets/themed-bricks/gatehouse/iron_2_0.png
assets/themed-bricks/gatehouse/iron_2_1.png
assets/themed-bricks/gatehouse/iron_2_2.png
assets/themed-bricks/gatehouse/vert_2_0.png
assets/themed-bricks/gatehouse/vert_2_1.png
assets/themed-bricks/gatehouse/vert_2_2.png
assets/themed-bricks/mooncoil/atlas.json
assets/themed-bricks/mooncoil/bar_1_0.png
assets/themed-bricks/mooncoil/bar_2_0.png
assets/themed-bricks/mooncoil/moonstone_1_0.png
assets/themed-bricks/mooncoil/moonstone_1_1.png
assets/themed-bricks/mooncoil/moonstone_2_0.png
assets/themed-bricks/mooncoil/moonstone_2_1.png
assets/themed-bricks/mooncoil/rosemoon_1_0.png
assets/themed-bricks/mooncoil/rosemoon_1_1.png
assets/themed-bricks/mooncoil/rosemoon_2_0.png
assets/themed-bricks/mooncoil/rosemoon_2_1.png
assets/themed-bricks/mooncoil/silver_1_0.png
assets/themed-bricks/mooncoil/silver_1_1.png
assets/themed-bricks/mooncoil/silver_2_0.png
assets/themed-bricks/mooncoil/silver_2_1.png
assets/themed-bricks/mooncoil/starlit_1_0.png
assets/themed-bricks/mooncoil/starlit_1_1.png
assets/themed-bricks/mooncoil/starlit_2_0.png
assets/themed-bricks/mooncoil/starlit_2_1.png
assets/themed-bricks/tower/amber_2_0.png
assets/themed-bricks/tower/amber_2_1.png
assets/themed-bricks/tower/amber_2_2.png
assets/themed-bricks/tower/amethyst_2_0.png
assets/themed-bricks/tower/amethyst_2_1.png
assets/themed-bricks/tower/amethyst_2_2.png
assets/themed-bricks/tower/atlas.json
assets/themed-bricks/tower/bar_1_0.png
assets/themed-bricks/tower/bar_2_0.png
assets/themed-bricks/tower/emerald_2_0.png
assets/themed-bricks/tower/emerald_2_1.png
assets/themed-bricks/tower/emerald_2_2.png
assets/themed-bricks/tower/jade_2_0.png
assets/themed-bricks/tower/jade_2_1.png
assets/themed-bricks/tower/jade_2_2.png
assets/themed-bricks/tower/rose_2_0.png
assets/themed-bricks/tower/rose_2_1.png
assets/themed-bricks/tower/rose_2_2.png
assets/themed-bricks/tower/slate_2_0.png
assets/themed-bricks/tower/slate_2_1.png
assets/themed-bricks/tower/slate_2_2.png
assets/themed-bricks/tower/stone_2_0.png
assets/themed-bricks/tower/stone_2_1.png
assets/themed-bricks/tower/stone_2_2.png
assets/themed-bricks/vault/atlas.json
assets/themed-bricks/vault/bar_1_0.png
assets/themed-bricks/vault/bar_2_0.png
assets/tidewheel-glaze/atlas.json
assets/tidewheel-glaze/tg_coral_0.png
assets/tidewheel-glaze/tg_coral_1.png
assets/tidewheel-glaze/tg_coral_2.png
assets/tidewheel-glaze/tg_pearl_0.png
assets/tidewheel-glaze/tg_pearl_1.png
assets/tidewheel-glaze/tg_pearl_2.png
assets/tidewheel-glaze/tg_seaglass_0.png
assets/tidewheel-glaze/tg_seaglass_1.png
assets/tidewheel-glaze/tg_seaglass_2.png
assets/tidewheel-glaze/tg_steel_0.png
assets/tidewheel-glaze/tg_steel_1.png
assets/tidewheel-glaze/tg_steel_2.png
assets/vault/atlas.json
assets/vault/plate.jpg
config/mobile-preview.json
design/copilot/2026-10-23/DIGEST-argon.md
design/copilot/2026-10-23/DIGEST-m365.md
design/copilot/2026-10-23/argon/assets/P01_powerups-round2/P01_powerups-round2_synergy-chart_1.prompt.txt
design/copilot/2026-10-23/argon/assets/P02_difficulty-round2/P02_difficulty-round2_curve-chart_1.prompt.txt
design/copilot/2026-10-23/argon/assets/P03_powerups-new/P03_powerups-new_icon-sheet_1.prompt.txt
design/copilot/2026-10-23/argon/assets/P04_continue-screen/P04_continue-screen_panel-anim_2.prompt.txt
design/copilot/2026-10-23/argon/assets/P04_continue-screen/P04_continue-screen_panel-rest_1.prompt.txt
design/copilot/2026-10-23/argon/assets/P07_dragons-hoard/P07_dragons-hoard_level-board_1.prompt.txt
design/copilot/2026-10-23/argon/assets/P08_ember/P08_ember_expressions_2.prompt.txt
design/copilot/2026-10-23/argon/assets/P08_ember/P08_ember_turnaround_1.prompt.txt
design/copilot/2026-10-23/argon/assets/P09_bricks-glaze-v2/P09_bricks-glaze-v2_brick-sheet_1.prompt.txt
design/copilot/2026-10-23/argon/assets/P10_kit-unlockables/P10_kit-unlockables_skins-swords-sheet_1.prompt.txt
design/copilot/2026-10-23/argon/drops/P01_breach-powerups-powerups-round2-v1.md
design/copilot/2026-10-23/argon/drops/P02_breach-difficulty-difficulty-round2-v1.md
design/copilot/2026-10-23/argon/drops/P03_breach-powerups-powerups-new-v1.md
design/copilot/2026-10-23/argon/drops/P04_breach-ui-screen-continue-screen-v1.md
design/copilot/2026-10-23/argon/drops/P05_breach-critique-apk-critique-2026-10-23-v1.md
design/copilot/2026-10-23/argon/drops/P06_breach-research-research-powerups-difficulty-v1.md
design/copilot/2026-10-23/argon/drops/P07_breach-level-dragons-hoard-v1.md
design/copilot/2026-10-23/argon/drops/P08_breach-character-ember-v1.md
design/copilot/2026-10-23/argon/drops/P09_breach-asset-sheet-bricks-glaze-v2-v1.md
design/copilot/2026-10-23/argon/drops/P10_breach-character-kit-unlockables-v1.md
design/copilot/2026-10-23/m365/breach-asset-sheet-bricks-glaze-v2-v1.md
design/copilot/2026-10-23/m365/breach-character-ember-v1.md
design/copilot/2026-10-23/m365/breach-character-kit-unlockables-v1.md
design/copilot/2026-10-23/m365/breach-critique-apk-critique-2026-10-23-v1.md
design/copilot/2026-10-23/m365/breach-difficulty-difficulty-round2-v2.md
design/copilot/2026-10-23/m365/breach-level-dragons-hoard-v1.md
design/copilot/2026-10-23/m365/breach-powerups-powerups-round2-v1.md
design/phase1/00-quality-target.md
design/phase1/01-kit-character.md
design/phase1/02-menagerie-cast.md
design/phase1/03-cast-restart.md
design/phase1/04-brum-proof.md
design/phase1/brum-proof-manifest.json
design/phase1/capture-options.md
design/phase1/carrier-companions.md
design/phase1/carrier-hybrid-loop.md
design/phase1/carrier-progression-options.md
design/phase1/carrier-urgency.md
design/phase1/difficulty-modes.md
design/phase1/img/01-kit-v2-1.png
design/phase1/img/01-kit-v2-2.png
design/phase1/img/01-kit-v2-3.png
design/phase1/img/capture-option-a.gif
design/phase1/img/capture-option-a.png
design/phase1/img/capture-option-b.gif
design/phase1/img/capture-option-b.png
design/phase1/img/carrier-effects-study-a.png
design/phase1/img/carrier-effects-study-b.png
design/phase1/img/carrier-progression-a.png
design/phase1/img/carrier-progression-b.png
design/phase1/img/cast-v2-anatomy-a.png
design/phase1/img/cast-v2-anatomy-b.png
design/phase1/img/history/space-hard-weapons-36s-unselected/README.md
design/phase1/img/history/space-hard-weapons-36s-unselected/option-a.png
design/phase1/img/history/space-hard-weapons-36s-unselected/option-b.png
design/phase1/img/invasion-rescue-a.png
design/phase1/img/invasion-rescue-b.png
design/phase1/img/kit-ability-ward-left.png
design/phase1/img/kit-ability-ward-right.png
design/phase1/img/kit-cast-a.png
design/phase1/img/kit-cast-b.png
design/phase1/img/kit-powers-study-a.png
design/phase1/img/kit-powers-study-b.png
design/phase1/img/level-layout-a.png
design/phase1/img/level-layout-b.png
design/phase1/img/level-layout-mixed.png
design/phase1/img/level-layout-v2-a.png
design/phase1/img/level-layout-v2-b.png
design/phase1/img/mobile-layout-a-invasion.png
design/phase1/img/mobile-layout-a.png
design/phase1/img/mobile-layout-b-invasion.png
design/phase1/img/mobile-layout-b.png
design/phase1/img/orbital-variety-study-v1.png
design/phase1/img/orbital-variety-study-v2.png
design/phase1/img/orbital-variety-study-v3.png
design/phase1/img/princess-bellforge-a-v1.png
design/phase1/img/princess-tidewheel-b-v1.png
design/phase1/img/relay-variety-study-v1.png
design/phase1/img/relay-variety-study-v2.png
design/phase1/img/relay-variety-study-v3.png
design/phase1/img/serpent-entry-native.gif
design/phase1/img/space-carrier-a.png
design/phase1/img/space-eclipse-d-v1.png
design/phase1/img/space-hard-weapons-a.png
design/phase1/img/space-hard-weapons-b.png
design/phase1/img/space-orbital-c-v1.png
design/phase1/img/space-relay-b.png
design/phase1/img/venom-spray-ward-preview.gif
design/phase1/invasion-rescue-options.md
design/phase1/kit-ability-options.md
design/phase1/kit-asset-manifest.json
design/phase1/kit-cast-manifest.json
design/phase1/kit-cast-options.md
design/phase1/level-layout-options.md
design/phase1/level-variety-review.md
design/phase1/mobile-layout-options.md
design/phase1/orbital-forge.md
design/phase1/orbital-gameplay-variety.md
design/phase1/orbital-level3.md
design/phase1/princess-two-levels-prompts.json
design/phase1/princess-two-levels.md
design/phase1/relay-circuit.md
design/phase1/relay-gameplay-variety.md
design/phase1/relay-gameplay.md
design/phase1/snake-entrance.md
design/phase1/space-assets-ab-spec.md
design/phase1/space-assets-ab.json
design/phase1/space-board-prompts.md
design/phase1/space-companion-role-review.md
design/phase1/space-direction-review.md
design/phase1/space-mode-options.md
design/phase1/space-options-cd-prompts.md
design/phase1/space-polish-review.md
design/phase1/space-powers-review.md
design/phase1/space-selected-review.md
design/phase1/variety-image-prompts.json
design/phase1/variety-image-review.json
design/phase1/variety-refinement-prompts.json
design/phase1/venom-options.md
design/phase1/weapon-vfx-v2-review.md
design/phase1/weapon-vfx-v2/README.md
design/phase1/weapon-vfx-v2/asset-report.json
design/phase1/weapon-vfx-v2/frames/helix-charge/helix-charge-00.png
design/phase1/weapon-vfx-v2/frames/helix-charge/helix-charge-01.png
design/phase1/weapon-vfx-v2/frames/helix-charge/helix-charge-02.png
design/phase1/weapon-vfx-v2/frames/helix-charge/helix-charge-03.png
design/phase1/weapon-vfx-v2/frames/helix-charge/helix-charge-04.png
design/phase1/weapon-vfx-v2/frames/helix-charge/helix-charge-05.png
design/phase1/weapon-vfx-v2/frames/helix-charge/helix-charge-06.png
design/phase1/weapon-vfx-v2/frames/helix-charge/helix-charge-07.png
design/phase1/weapon-vfx-v2/frames/helix-charge/helix-charge-08.png
design/phase1/weapon-vfx-v2/frames/helix-charge/helix-charge-09.png
design/phase1/weapon-vfx-v2/frames/helix-charge/helix-charge-10.png
design/phase1/weapon-vfx-v2/frames/helix-charge/helix-charge-11.png
design/phase1/weapon-vfx-v2/frames/reactor-charge/reactor-charge-00.png
design/phase1/weapon-vfx-v2/frames/reactor-charge/reactor-charge-01.png
design/phase1/weapon-vfx-v2/frames/reactor-charge/reactor-charge-02.png
design/phase1/weapon-vfx-v2/frames/reactor-charge/reactor-charge-03.png
design/phase1/weapon-vfx-v2/frames/reactor-charge/reactor-charge-04.png
design/phase1/weapon-vfx-v2/frames/reactor-charge/reactor-charge-05.png
design/phase1/weapon-vfx-v2/frames/reactor-charge/reactor-charge-06.png
design/phase1/weapon-vfx-v2/frames/reactor-charge/reactor-charge-07.png
design/phase1/weapon-vfx-v2/frames/reactor-charge/reactor-charge-08.png
design/phase1/weapon-vfx-v2/frames/reactor-charge/reactor-charge-09.png
design/phase1/weapon-vfx-v2/frames/reactor-charge/reactor-charge-10.png
design/phase1/weapon-vfx-v2/frames/reactor-charge/reactor-charge-11.png
design/phase1/weapon-vfx-v2/helix-charge.png
design/phase1/weapon-vfx-v2/manifest.json
design/phase1/weapon-vfx-v2/mechanical-seed-report.json
design/phase1/weapon-vfx-v2/payload-A.png
design/phase1/weapon-vfx-v2/payload-B.png
design/phase1/weapon-vfx-v2/payload-prompts.json
design/phase1/weapon-vfx-v2/payload-source-receipt.json
design/phase1/weapon-vfx-v2/proof/helix-charge-08.png
design/phase1/weapon-vfx-v2/proof/helix-flight-08.png
design/phase1/weapon-vfx-v2/proof/helix-impact-04.png
design/phase1/weapon-vfx-v2/proof/impact-v3/helix-impact-02.png
design/phase1/weapon-vfx-v2/proof/impact-v3/reactor-impact-04.png
design/phase1/weapon-vfx-v2/proof/impact-v4/helix-impact-00.png
design/phase1/weapon-vfx-v2/proof/impact-v4/helix-impact-01.png
design/phase1/weapon-vfx-v2/proof/impact-v4/helix-impact-04.png
design/phase1/weapon-vfx-v2/proof/impact-v4/helix-impact-08.png
design/phase1/weapon-vfx-v2/proof/impact-v4/reactor-impact-00.png
design/phase1/weapon-vfx-v2/proof/impact-v4/reactor-impact-01.png
design/phase1/weapon-vfx-v2/proof/impact-v4/reactor-impact-04.png
design/phase1/weapon-vfx-v2/proof/impact-v4/reactor-impact-08.png
design/phase1/weapon-vfx-v2/proof/mechanical-v2/helix-flight-08.png
design/phase1/weapon-vfx-v2/proof/mechanical-v2/helix-impact-04.png
design/phase1/weapon-vfx-v2/proof/mechanical-v2/reactor-flight-08.png
design/phase1/weapon-vfx-v2/proof/mechanical-v2/reactor-impact-04.png
design/phase1/weapon-vfx-v2/proof/reactor-charge-08.png
design/phase1/weapon-vfx-v2/proof/reactor-flight-08.png
design/phase1/weapon-vfx-v2/proof/reactor-impact-04.png
design/phase1/weapon-vfx-v2/reactor-charge.png
design/phase1/weapon-vfx-v2/render-report.json
design/phase1/weapon-vfx-v2/review/exports.json
design/phase1/weapon-vfx-v2/review/magnetic-breacher-contact.png
design/phase1/weapon-vfx-v2/review/magnetic-breacher.gif
design/phase1/weapon-vfx-v2/review/magnetic-breacher.webm
design/phase1/weapon-vfx-v2/review/qa-seal.json
design/phase1/weapon-vfx-v2/review/qa-validation.json
design/phase1/weapon-vfx-v2/review/reactor-rupture-contact.png
design/phase1/weapon-vfx-v2/review/reactor-rupture.gif
design/phase1/weapon-vfx-v2/review/reactor-rupture.webm
design/phase1/weapon-vfx-v2/review/report.json
design/phase1/weapon-vfx-v2/review/selection.json
design/phase1/weapon-vfx-v2/review/video-report.json
design/phase1/weapon-vfx-v3-review.md
design/phase1/weapon-vfx-v3/README.md
design/phase1/weapon-vfx-v3/asset-report.json
design/phase1/weapon-vfx-v3/cast-roles.png
design/phase1/weapon-vfx-v3/impact-report.json
design/phase1/weapon-vfx-v3/plasma-impact-prompt.json
design/phase1/weapon-vfx-v3/plasma-impact-runtime.png
design/phase1/weapon-vfx-v3/plasma-impact-source.png
design/phase1/weapon-vfx-v3/plasma-shot-prompt.json
design/phase1/weapon-vfx-v3/plasma-shot-runtime.png
design/phase1/weapon-vfx-v3/plasma-shot-source.png
design/phase1/weapon-vfx-v3/plasma-shot.png
design/phase1/weapon-vfx-v3/review/cannon-comparison.png
design/phase1/weapon-vfx-v3/review/cannon-qa.json
design/phase1/weapon-vfx-v3/review/history/skiff-before-friendly-firepower.png
design/phase1/weapon-vfx-v3/review/skiff-contact.png
design/phase1/weapon-vfx-v3/review/skiff-report.json
design/phase2/dragons-hoard.md
design/phase2/floor-hooks.md
design/phase2/img/kit-gatehouse-siege-v1.png
design/phase2/img/lumi-breaks-out-v1.png
design/phase2/kit-and-lumi-levels.md
design/phase2/new-concepts.md
design/phase2/premium-pass.md
design/phase2/serpent-rivals.md
design/phase2/stages-v2.md
docs/ARTWORK_LIBRARY.md
docs/BACKLOG.md
docs/BELLFORGE_PHYSICS.md
docs/BREACH-ChatGPT-handoff.md
docs/BREACH-blender-scripts.md
docs/BRUM_LEVEL_PLAN.md
docs/CONTINUE_HERE.md
docs/FANTASY_REFINEMENT.md
docs/GAME_PLAN.md
docs/MOBILE_PREVIEW.md
docs/MOONCOIL_RELIQUARY.md
docs/NEXT_LEVELS.md
docs/SPACE_COMBAT_HANDOFF.md
docs/STARFLIGHT_ART.md
docs/STARFLIGHT_CAMPAIGN.md
docs/STARFLIGHT_COMBAT.md
docs/STARFLIGHT_MISSION.md
docs/STARFLIGHT_POWER_EXPLORATION.md
docs/STARFLIGHT_PROTOTYPE.md
docs/STORY_PLAN.md
docs/TIDEWHEEL_PHYSICS.md
docs/drafts/breach.png
docs/drafts/forge.png
docs/drafts/rescue.png
docs/drafts/results.png
docs/drafts/sanctuary.png
docs/drafts/title.png
docs/handoff/01-status-and-next-steps.md
docs/handoff/02-architecture-and-pipeline.md
docs/handoff/03-environment-skills-ux.md
docs/handoff/04-chatgpt-design-brief.md
docs/handoff/05-chatgpt-steering-prompts.md
docs/reference/invasion-v2-android.png
docs/reference/robot-expressions-ingame.png
docs/reference/snake-v2-sheet.png
docs/reference/vault-top-down.png
docs/reference/vault-v2-android.png
docs/screens/01-menu.png
docs/screens/03-invasion-multiball.png
docs/screens/04-invasion-mothership.png
docs/screens/07-vault-focus-aim.png
docs/screens/08-vault-breach.png
docs/screens/10-vault-results.png
docs/validation/bellforge/README.md
docs/validation/bellforge/SHA256SUMS
docs/validation/bellforge/android-dazed-final-staged.png
docs/validation/bellforge/android-defeat-intermediate-staged.png
docs/validation/bellforge/android-earned-result.png
docs/validation/bellforge/android-escape-final-staged.png
docs/validation/bellforge/android-opening-final.png
docs/validation/bellforge/android-rolling.png
docs/validation/bellforge/defeat-responsive-final-notes.json
docs/validation/bellforge/defeat-responsive-final.json
docs/validation/bellforge/defeat-responsive-intermediate.json
docs/validation/bellforge/defeat-responsive-notes.json
docs/validation/bellforge/historical-before-final-anatomy.json
docs/validation/bellforge/ios-dazed-final-staged.png
docs/validation/bellforge/ios-defeat-intermediate-staged.png
docs/validation/bellforge/ios-echo-staged.png
docs/validation/bellforge/ios-escape-final-staged.png
docs/validation/bellforge/ios-opening-final.png
docs/validation/bellforge/ios-opening.png
docs/validation/bellforge/model-routes.json
docs/validation/bellforge/palette-refresh.json
docs/validation/bellforge/phone-report.json
docs/validation/bellforge/shared-refresh-notes.json
docs/validation/bellforge/shared-ui-report.json
docs/validation/bellforge/short-desktop-intermediate.png
docs/validation/bellforge/visual-source-refresh.json
docs/validation/ember-serpent/mooncoil-rivals.png
docs/validation/fantasy-preview/README.md
docs/validation/fantasy-preview/all-tests.txt
docs/validation/fantasy-preview/art-audit.json
docs/validation/fantasy-preview/bellforge-live.png
docs/validation/fantasy-preview/bellforge-live.webm
docs/validation/fantasy-preview/motion-report.json
docs/validation/fantasy-preview/post-review-whitespace.json
docs/validation/fantasy-preview/tidewheel-live.png
docs/validation/fantasy-preview/tidewheel-live.webm
docs/validation/fantasy-refinement/README.md
docs/validation/fantasy-refinement/SHA256SUMS
docs/validation/fantasy-refinement/android-capture-2.2-natural.png
docs/validation/fantasy-refinement/android-capture-3.17-natural.png
docs/validation/fantasy-refinement/android-claw-shot-staged.png
docs/validation/fantasy-refinement/android-starfire-staged.png
docs/validation/fantasy-refinement/initial-responsive.json
docs/validation/fantasy-refinement/ios-capture-2.2-natural.png
docs/validation/fantasy-refinement/ios-capture-3-natural.png
docs/validation/fantasy-refinement/ios-capture-3.17-mirrored-staged.png
docs/validation/fantasy-refinement/ios-capture-3.17-natural.png
docs/validation/fantasy-refinement/ios-kit-menu-staged.png
docs/validation/fantasy-refinement/ios-nerra-defeat-staged.png
docs/validation/fantasy-refinement/ios-nerra-fury-staged.png
docs/validation/fantasy-refinement/ios-venom-breath-staged.png
docs/validation/fantasy-refinement/new-png-audit.json
docs/validation/fantasy-refinement/reaction-png-audit.json
docs/validation/fantasy-refinement/snake-body-cpu-before.json
docs/validation/fantasy-refinement/snake-body-cpu.json
docs/validation/fantasy-refinement/snake-final-browser.json
docs/validation/fantasy-refinement/snake-final-video.json
docs/validation/fantasy-refinement/snake-review.md
docs/validation/fantasy-refinement/snake-wrap-laugh-ios.webm
docs/validation/fantasy-refinement/tidewheel-earned-routes.json
docs/validation/fantasy-refinement/tidewheel-ui.json
docs/validation/fantasy-refinement/unit-tests.txt
docs/validation/fantasy-refinement/vault-capture-mechanics-audit.json
docs/validation/fantasy-refinement/vault-graphics-mechanics-audit.json
docs/validation/frost-finish/after.png
docs/validation/frost-finish/before.png
docs/validation/frost-yeti/frost-yeti-ingame.png
docs/validation/fullscreen/princess-chapters.jpg
docs/validation/mooncoil/android-play.png
docs/validation/mooncoil/android-powers.png
docs/validation/mooncoil/android-rescued.png
docs/validation/mooncoil/art-pack-compatibility.json
docs/validation/mooncoil/ios-play.png
docs/validation/mooncoil/ios-powers.png
docs/validation/mooncoil/ios-rescued.png
docs/validation/mooncoil/model-README.md
docs/validation/mooncoil/model-SHA256SUMS.txt
docs/validation/mooncoil/model-android-easy-combat.png
docs/validation/mooncoil/model-android-easy-won.png
docs/validation/mooncoil/model-android-hard-cosmic-lost.png
docs/validation/mooncoil/model-android-medium-cosmic-won.png
docs/validation/mooncoil/model-cage-android-combat.png
docs/validation/mooncoil/model-cage-android-passive-lost.png
docs/validation/mooncoil/model-cage-ios-combat.png
docs/validation/mooncoil/model-cage-passive.json
docs/validation/mooncoil/model-cage-precharge-passive.json
docs/validation/mooncoil/model-cage-precharge-routes.json
docs/validation/mooncoil/model-cage-review.md
docs/validation/mooncoil/model-cage-routes.json
docs/validation/mooncoil/model-cosmic-first.json
docs/validation/mooncoil/model-default.json
docs/validation/mooncoil/model-ios-easy-earned.png
docs/validation/mooncoil/model-ios-hard-cosmic-won.png
docs/validation/mooncoil/model-pre-tuning-easy.json
docs/validation/mooncoil/model-pre-tuning-mh.json
docs/validation/mooncoil/model-quota-bound.json
docs/validation/mooncoil/model-review.md
docs/validation/mooncoil/recheck-2026-10-22/android-play.png
docs/validation/mooncoil/recheck-2026-10-22/android-rescued.png
docs/validation/mooncoil/recheck-2026-10-22/ios-powers.png
docs/validation/mooncoil/recheck-2026-10-22/report.json
docs/validation/mooncoil/report.json
docs/validation/mooncoil/rivals/1-warning.png
docs/validation/mooncoil/rivals/2-both.png
docs/validation/mooncoil/rivals/3-clash.png
docs/validation/mooncoil/rivals/report.json
docs/validation/physics-audit/report.json
docs/validation/physics-recheck/README.md
docs/validation/physics-recheck/bellforge/README.md
docs/validation/physics-recheck/bellforge/SHA256SUMS.txt
docs/validation/physics-recheck/bellforge/android-dazed-staged.png
docs/validation/physics-recheck/bellforge/android-earned-result.png
docs/validation/physics-recheck/bellforge/android-echo-staged.png
docs/validation/physics-recheck/bellforge/browser.json
docs/validation/physics-recheck/bellforge/ccd-audit.mjs
docs/validation/physics-recheck/bellforge/ccd.json
docs/validation/physics-recheck/bellforge/defeat.json
docs/validation/physics-recheck/bellforge/ios-continue-staged.png
docs/validation/physics-recheck/bellforge/ios-earned-rolling.png
docs/validation/physics-recheck/bellforge/ios-loss-staged.png
docs/validation/physics-recheck/bellforge/model-routes.json
docs/validation/physics-recheck/bellforge/model-routes.mjs
docs/validation/physics-recheck/bellforge/state-browser.mjs
docs/validation/physics-recheck/bellforge/states.json
docs/validation/physics-recheck/bellforge/units.json
docs/validation/physics-recheck/other-levels/README.md
docs/validation/physics-recheck/other-levels/carrier-after.json
docs/validation/physics-recheck/other-levels/carrier-before.json
docs/validation/physics-recheck/other-levels/carrier-browser-final.json
docs/validation/physics-recheck/other-levels/carrier-focused.log
docs/validation/physics-recheck/other-levels/carrier-harness-preconsume.log
docs/validation/physics-recheck/other-levels/frost-baseline.json
docs/validation/physics-recheck/other-levels/kit-harness-timeout.json
docs/validation/physics-recheck/other-levels/kit-harness-timeout.log
docs/validation/physics-recheck/other-levels/screens/carrier-android-final-focus-staged.png
docs/validation/physics-recheck/other-levels/screens/carrier-ios-baseline.png
docs/validation/physics-recheck/other-levels/screens/circuit-android-baseline.png
docs/validation/physics-recheck/other-levels/screens/circuit-ios-baseline.png
docs/validation/physics-recheck/other-levels/screens/forge-android-baseline.png
docs/validation/physics-recheck/other-levels/screens/forge-ios-baseline.png
docs/validation/physics-recheck/other-levels/screens/frost-android-contact-staged.png
docs/validation/physics-recheck/other-levels/screens/frost-ios-ward-staged.png
docs/validation/physics-recheck/other-levels/screens/gatebreak-android-storm-staged.png
docs/validation/physics-recheck/other-levels/screens/gatebreak-ios-ricochet-staged.png
docs/validation/physics-recheck/other-levels/screens/vault-android-cosmic-staged.png
docs/validation/physics-recheck/other-levels/screens/vault-ios-ward-staged.png
docs/validation/physics-recheck/other-levels/space-baseline.json
docs/validation/physics-recheck/other-levels/starflight.json
docs/validation/physics-recheck/other-levels/summary.json
docs/validation/physics-recheck/other-levels/unit-baseline.log
docs/validation/physics-recheck/other-levels/vault-final.json
docs/validation/physics-recheck/tidewheel/README.md
docs/validation/physics-recheck/tidewheel/android-cosmic-staged.png
docs/validation/physics-recheck/tidewheel/android-ordinary-earned.png
docs/validation/physics-recheck/tidewheel/browser.json
docs/validation/physics-recheck/tidewheel/centre-catch.json
docs/validation/physics-recheck/tidewheel/earned-powers.json
docs/validation/physics-recheck/tidewheel/geometry-summary.json
docs/validation/physics-recheck/tidewheel/ios-anchor-earned.png
docs/validation/physics-recheck/tidewheel/ios-chain-pull-staged.png
docs/validation/physics-recheck/tidewheel/ios-claw-shot-staged.png
docs/validation/physics-recheck/tidewheel/powers-ui.json
docs/validation/physics-recheck/tidewheel/retained-review-failures.json
docs/validation/physics-recheck/tidewheel/routes.json
docs/validation/physics-recheck/tidewheel/tests.txt
docs/validation/physics-recheck/unit-tests.txt
docs/validation/physics-recheck/vault-retreat.json
docs/validation/snake-retreat/README.md
docs/validation/snake-retreat/SHA256SUMS
docs/validation/snake-retreat/android-halfway-mid-staged.png
docs/validation/snake-retreat/android-halfway-tunnel-staged.png
docs/validation/snake-retreat/android-late-turn-staged.png
docs/validation/snake-retreat/ios-early-turn-staged.png
docs/validation/snake-retreat/ios-halfway-mid-staged.png
docs/validation/snake-retreat/ios-halfway-tail-clear-staged.png
docs/validation/snake-retreat/ios-halfway-tunnel-staged.png
docs/validation/snake-retreat/ios-halfway-turn-staged.png
docs/validation/snake-retreat/ios-late-mid-staged.png
docs/validation/snake-retreat/png-audit.json
docs/validation/snake-retreat/report.json
docs/validation/snake-retreat/snake-head-first-retreat-ios.webm
docs/validation/snake-retreat/source-audit.json
docs/validation/snake-retreat/unit-tests.txt
docs/validation/space-combat/README.md
docs/validation/space-combat/apk-verification.json
docs/validation/space-combat/bounded-balance.json
docs/validation/space-combat/carrier-easy-routes.json
docs/validation/space-combat/ci-assets.json
docs/validation/space-combat/circuit-browser-routes.json
docs/validation/space-combat/frost-earned-routes.json
docs/validation/space-combat/frost-offline-controls.json
docs/validation/space-combat/frost-phone-controls.json
docs/validation/space-combat/frost-review.md
docs/validation/space-combat/lf-build.json
docs/validation/space-combat/native-emulator-disconnect.xml
docs/validation/space-combat/native-emulator-timeout.json
docs/validation/space-combat/native-initial-failure.xml
docs/validation/space-combat/native-manifest.json
docs/validation/space-combat/native-pass.xml
docs/validation/space-combat/native-release.json
docs/validation/space-combat/native-resume-failure.xml
docs/validation/space-combat/native-resume-witness.json
docs/validation/space-combat/phone-controls-pre-menu-crop.json
docs/validation/space-combat/screenshots/android-circuit-powers.png
docs/validation/space-combat/screenshots/ios-frost-contact-staged.png
docs/validation/space-combat/screenshots/ios-frost.png
docs/validation/space-combat/screenshots/ios-menu.png
docs/validation/space-combat/space-offline-controls.json
docs/validation/space-combat/weapon-vfx.json
docs/validation/starflight-mission/QA.md
docs/validation/starflight-mission/android-easy-power-spiral-staged.png
docs/validation/starflight-mission/android-easy-ricochet-staged.png
docs/validation/starflight-mission/android-supplies-earned-combat.png
docs/validation/starflight-mission/first-pause.json
docs/validation/starflight-mission/ios-easy-shield-incoming-staged.png
docs/validation/starflight-mission/ios-easy-storm-occupied-sweep-staged.png
docs/validation/starflight-mission/ios-supplies-earned-combat.png
docs/validation/starflight-mission/report.json
docs/validation/starflight/README.md
docs/validation/starflight/android-reactor-clearance.png
docs/validation/starflight/android-reactor-left-sweep.png
docs/validation/starflight/android-varied-field-staged.png
docs/validation/starflight/browser-report.json
docs/validation/starflight/ios-arsenal-full-staged.png
docs/validation/starflight/ios-earned-boss.png
docs/validation/starflight/real-clock-report.json
docs/validation/starflight/summary.json
docs/validation/tidewheel/QA.md
docs/validation/tidewheel/README.md
docs/validation/tidewheel/SHA256SUMS
docs/validation/tidewheel/android-chain-pull-staged.png
docs/validation/tidewheel/android-earned-ordinary-combat.png
docs/validation/tidewheel/browser.json
docs/validation/tidewheel/centre-catch.json
docs/validation/tidewheel/geometry.json
docs/validation/tidewheel/ios-opening.png
docs/validation/tidewheel/ios-water-pulse-staged.png
docs/validation/tidewheel/profile.json
docs/validation/tidewheel/routes.json
docs/validation/tidewheel/seal.json
index.html
package-lock.json
package.json
prompt-library/00-style-bible.md
prompt-library/10-characters-and-creatures.md
prompt-library/16-brute-reskin.md
prompt-library/20-bricks-props-and-fx.md
prompt-library/25-environments.md
prompt-library/26-ui-and-icons.md
prompt-library/30-level-concept-boards.md
prompt-library/40-game-design-and-physics.md
prompt-library/50-starflight.md
prompt-library/60-sprite-sheet-delivery.md
prompt-library/70-render-round-2.md
prompt-library/README.md
prompt-library/examples/INDEX.md
prompt-library/examples/MORE-EXAMPLES.md
prompt-library/examples/castle-window-proof.png
prompt-library/examples/concept-board-gatehouse-siege.png
prompt-library/examples/gatehouse-first-pass.png
prompt-library/examples/ingame-vault-focus-aim.png
prompt-library/examples/kit-sprite-and-face.png
prompt-library/examples/korr-boar.png
prompt-library/examples/lumi-breaks-out-board.png
prompt-library/examples/lumi-faces.png
prompt-library/examples/nerra-crab.png
prompt-library/examples/power-icons-proof.png
prompt-library/examples/power-icons.png
prompt-library/examples/serpent-window.png
prompt-library/examples/snake-emerald-heads.png
prompt-library/examples/starflight-ships.png
prompt-library/examples/vault-breach-screen.png
prompt-library/examples/vault-bricks.png
prompt-library/references.md
prototypes/fantasy/index.html
prototypes/fantasy/layout.js
prototypes/fantasy/main.js
prototypes/fantasy/style.css
prototypes/starflight/index.html
prototypes/starflight/main.js
prototypes/starflight/mission-render.js
prototypes/starflight/render-effects.js
prototypes/starflight/style.css
skills/blender/LICENSE
skills/blender/README.md
skills/blender/blender-asset-qa/SKILL.md
skills/blender/blender-asset-qa/scripts/_bpyx.py
skills/blender/blender-asset-qa/scripts/qa_check.py
skills/blender/blender-asset-qa/scripts/review_shots.py
skills/blender/blender-core/SKILL.md
skills/blender/blender-core/references/api-changes-5x.md
skills/blender/blender-core/references/bpy-patterns.md
skills/blender/blender-core/scripts/_bpyx.py
skills/blender/blender-core/scripts/env_report.py
skills/blender/blender-core/scripts/run_in_blender.py
skills/blender/blender-lighting-lookdev/SKILL.md
skills/blender/blender-lighting-lookdev/scripts/_bpyx.py
skills/blender/blender-lighting-lookdev/scripts/turntable.py
skills/blender/blender-pbr-materials/SKILL.md
skills/blender/blender-pbr-materials/references/pbr-values.md
skills/blender/blender-pbr-materials/scripts/_bpyx.py
skills/blender/blender-pbr-materials/scripts/build_pbr_material.py
skills/blender/blender-pipeline-automation/SKILL.md
skills/blender/blender-pipeline-automation/scripts/_bpyx.py
skills/blender/blender-pipeline-automation/scripts/batch_process.py
skills/blender/blender-rendering/SKILL.md
skills/blender/blender-rendering/scripts/_bpyx.py
skills/blender/blender-rendering/scripts/render_batch.py
skills/caveman/LICENSE
skills/caveman/NOTICE
skills/caveman/README.md
skills/caveman/agents/cavecrew-builder.md
skills/caveman/agents/cavecrew-investigator.md
skills/caveman/agents/cavecrew-reviewer.md
skills/caveman/cavecrew/SKILL.md
skills/caveman/caveman/SKILL.md
skills/caveman/ultracave/SKILL.md
skills/codex/platformer/SKILL.md
skills/codex/platformer/references/feel-tuning.md
skills/gamedev/LICENSE
skills/gamedev/NOTICE
skills/gamedev/README.md
skills/gamedev/ai-behavior-trees-utility-ai/SKILL.md
skills/gamedev/ai-behavior-trees-utility-ai/references/behavior-tree-core.md
skills/gamedev/ai-behavior-trees-utility-ai/references/best-practices-and-pitfalls.md
skills/gamedev/ai-behavior-trees-utility-ai/references/practical-examples.md
skills/gamedev/ai-behavior-trees-utility-ai/references/utility-ai-system.md
skills/gamedev/audio-design/SKILL.md
skills/gamedev/audio-design/references/adaptive-music.md
skills/gamedev/camera-systems/SKILL.md
skills/gamedev/camera-systems/references/follow-and-framing.md
skills/gamedev/create-game-assets/SKILL.md
skills/gamedev/create-game-assets/agents/openai.yaml
skills/gamedev/create-game-assets/assets/art-direction-brief.md
skills/gamedev/create-game-assets/assets/asset-manifest.json
skills/gamedev/create-game-assets/references/art-direction.md
skills/gamedev/create-game-assets/references/provenance.md
skills/gamedev/create-game-assets/references/raster-pipeline.md
skills/gamedev/create-game-assets/references/three-d-pipeline.md
skills/gamedev/create-game-assets/scripts/asset_report.py
skills/gamedev/create-game-assets/scripts/build_preview_sheet.py
skills/gamedev/create-game-assets/scripts/requirements.txt
skills/gamedev/game-ai/SKILL.md
skills/gamedev/game-ai/references/behavior-trees.md
skills/gamedev/game-ai/references/pathfinding.md
skills/gamedev/game-feel/SKILL.md
skills/gamedev/game-feel/references/feedback-recipes.md
skills/gamedev/game-ui-ux/SKILL.md
skills/gamedev/game-ui-ux/references/layout-and-flow.md
skills/gamedev/input-systems/SKILL.md
skills/gamedev/input-systems/references/buffering-and-accessibility.md
skills/gamedev/level-design/SKILL.md
skills/gamedev/level-design/references/pacing-and-flow.md
skills/gamedev/performance-optimization/SKILL.md
skills/gamedev/performance-optimization/references/profiling-and-budgets.md
skills/gamedev/phaser-arcade-physics/SKILL.md
skills/gamedev/phaser-arcade-physics/references/bodies-and-collision.md
skills/gamedev/phaser-core/SKILL.md
skills/gamedev/phaser-core/references/scene-flow.md
skills/gamedev/physics-tuning/SKILL.md
skills/gamedev/physics-tuning/references/timestep-and-ccd.md
skills/gamedev/pixijs-rendering/SKILL.md
skills/gamedev/pixijs-rendering/references/assets-and-display.md
skills/gamedev/procedural-gen/SKILL.md
skills/gamedev/procedural-gen/references/dungeon-generation.md
skills/gamedev/procedural-gen/references/noise.md
skills/gamedev/prototype-fast/SKILL.md
skills/gamedev/puzzle/SKILL.md
skills/gamedev/puzzle/references/board-and-resolution.md
skills/gamedev/roguelike/SKILL.md
skills/gamedev/roguelike/references/generation-fov-loot.md
skills/gamedev/save-systems/SKILL.md
skills/gamedev/save-systems/references/versioning-and-migration.md
skills/gamedev/shader-programming/SKILL.md
skills/gamedev/shader-programming/references/effects.md
skills/mobile/LICENSE
skills/mobile/README.md
skills/mobile/mobile-game-dev/SKILL.md
skills/ponytail/LICENSE
skills/ponytail/ponytail/SKILL.md
skills/retention/LICENSE
skills/retention/README.md
skills/retention/casual-game-ftue/SKILL.md
skills/retention/retention-monetization-loop/SKILL.md
src/arena.js
src/audio.js
src/carrier-physics.js
src/carrier.js
src/castle-art.js
src/castle-specials.js
src/castle-window.js
src/characters.js
src/clearance.js
src/coach.js
src/debris.js
src/difficulty.js
src/fantasy/bellforge.js
src/fantasy/chapter.js
src/fantasy/creatures/ember.js
src/fantasy/creatures/sitter.js
src/fantasy/gatehouse.js
src/fantasy/hoard-render.js
src/fantasy/hoard.js
src/fantasy/lumi-render.js
src/fantasy/lumitower.js
src/fantasy/purpose-render.js
src/fantasy/purpose.js
src/fantasy/r3.js
src/fantasy/ram.js
src/fantasy/reach.js
src/fantasy/render.js
src/fantasy/rivals-render.js
src/fantasy/rivals.js
src/fantasy/stage-ui.js
src/fantasy/stages.js
src/fantasy/tide-fx.js
src/fantasy/tide-scene.js
src/fantasy/tidewheel-geometry.js
src/fantasy/tidewheel-reaction-geometry.js
src/fantasy/tidewheel-siege.js
src/fantasy/tidewheel-stages-render.js
src/fantasy/tidewheel-stages.js
src/fantasy/tidewheel-v2-geometry.js
src/fantasy/tidewheel.js
src/frost.js
src/gfx.js
src/glow.js
src/home-art.js
src/home.js
src/invasion.js
src/kit.js
src/main.js
src/monetize.js
src/mooncoil-layout.js
src/mooncoil.js
src/near-miss.js
src/orbital.js
src/physics.js
src/portraits.js
src/prefs.js
src/purpose.js
src/relay.js
src/round3-art.js
src/serpent-capture.js
src/serpent-retreat.js
src/serpent.js
src/skiff.js
src/space-companions.js
src/space-weapons.js
src/starflight/geometry.js
src/starflight/mission.js
src/starflight/model.js
src/themed-bricks.js
src/tutorial-draw.js
src/tutorial.js
src/vault-art.js
src/vault.js
store/feature-1024x500.png
store/icon-512.png
store/key-art.png
tests/arena.test.js
tests/art-cache.test.js
tests/art-round2.test.js
tests/bellforge.test.js
tests/boarding-review.test.js
tests/boarding.test.js
tests/carrier-hybrid.test.js
tests/carrier-physics.test.js
tests/carrier.test.js
tests/castle-chapters.test.js
tests/castle-specials.test.js
tests/charge-ready.test.js
tests/circuit-review.test.js
tests/circuit-weapons.test.js
tests/coach.test.js
tests/companion-ui.test.js
tests/continue-v2.test.js
tests/core-command.test.js
tests/difficulty.test.js
tests/enemy-fire.test.js
tests/fantasy-layout.test.js
tests/forge-review.test.js
tests/frost-dash.test.js
tests/frost.test.js
tests/gatehouse.test.js
tests/hoard.test.js
tests/home.test.js
tests/hybrid-review.test.js
tests/kit.test.js
tests/lumitower.test.js
tests/mooncoil-layout.test.js
tests/mooncoil-rivals.test.js
tests/orbital-render.test.js
tests/orbital-review.test.js
tests/orbital-space-power.test.js
tests/orbital.test.js
tests/paddle-art.test.js
tests/pause-retry-review.test.js
tests/physics-audit-fixes.test.js
tests/physics-recheck-carrier.test.js
tests/physics.test.js
tests/powers-v2.test.js
tests/purpose-clocks.test.js
tests/ram.test.js
tests/reach.test.js
tests/relay-review.test.js
tests/relay.test.js
tests/rivals.test.js
tests/serpent-capture.test.js
tests/serpent-retreat.test.js
tests/serpent-skins.test.js
tests/serpent.test.js
tests/sitter.test.js
tests/space-plasma-integration.test.js
tests/space-powers.test.js
tests/space-weapons.test.js
tests/stage-ui.test.js
tests/stages.test.js
tests/starflight-mission.test.js
tests/starflight.test.js
tests/themed-bricks.test.js
tests/tidewheel-attacks.test.js
tests/tidewheel-powers.test.js
tests/tidewheel-seams.test.js
tests/tidewheel-siege.test.js
tests/tidewheel.test.js
tests/tutorial.test.js
tools/archive_artwork.py
tools/blender_mcp_host.py
tools/build.mjs
tools/carrier-difficulty-preview/build.mjs
tools/carrier-difficulty-preview/client.js
tools/carrier-urgency-preview/build.mjs
tools/carrier-urgency-preview/client.js
tools/kit-power-study/build.mjs
tools/kit-power-study/playtest.mjs
tools/make_handoff.py
tools/make_phase2_boards.py
tools/orbital-preview/README.md
tools/orbital-preview/aperture-audit.py
tools/orbital-preview/aperture-proof.mjs
tools/orbital-preview/art_media.py
tools/orbital-preview/asset-proof.mjs
tools/orbital-preview/build.mjs
tools/orbital-preview/check.mjs
tools/orbital-preview/forge-art-proof.mjs
tools/orbital-preview/forge-check.mjs
tools/orbital-preview/forge-geometry.mjs
tools/orbital-preview/forge-motion.mjs
tools/orbital-preview/forge-motion.py
tools/orbital-preview/forge-power-check.mjs
tools/orbital-preview/index.html
tools/orbital-preview/main.js
tools/orbital-preview/prepare_art.py
tools/orbital-preview/prepare_reference.py
tools/orbital-preview/render-proof.mjs
tools/pack_art.py
tools/pack_home_art.py
tools/pack_round3.py
tools/pin-sha.mjs
tools/playtest/aim-bot.mjs
tools/playtest/art-round2.mjs
tools/playtest/audit-adapters.mjs
tools/playtest/bellforge-defeat.mjs
tools/playtest/bellforge-policy.mjs
tools/playtest/bellforge.mjs
tools/playtest/boarding.mjs
tools/playtest/capture.mjs
tools/playtest/carrier.mjs
tools/playtest/castle-premium.mjs
tools/playtest/coach.mjs
tools/playtest/combat-balance.mjs
tools/playtest/combat.mjs
tools/playtest/continue-v2.mjs
tools/playtest/fantasy-motion.mjs
tools/playtest/fantasy-responsive.mjs
tools/playtest/fantasy-visual.mjs
tools/playtest/floor-hooks.mjs
tools/playtest/frost.mjs
tools/playtest/glaze-ab.mjs
tools/playtest/hoard-review.mjs
tools/playtest/kit.mjs
tools/playtest/l1.mjs
tools/playtest/layout.mjs
tools/playtest/mobile-ui.mjs
tools/playtest/mooncoil-routes.mjs
tools/playtest/mooncoil.mjs
tools/playtest/physics-audit-checks.md
tools/playtest/physics-audit-checks.mjs
tools/playtest/physics-audit.mjs
tools/playtest/physics-recheck-carrier-browser.mjs
tools/playtest/physics-recheck-kit.mjs
tools/playtest/physics-recheck-probes.mjs
tools/playtest/physics-recheck-seal.py
tools/playtest/polish.mjs
tools/playtest/rivals-review.mjs
tools/playtest/snake-body-bench.mjs
tools/playtest/snake-capture-video.mjs
tools/playtest/snake-retreat.mjs
tools/playtest/snake-source-audit.mjs
tools/playtest/snake-visual.mjs
tools/playtest/space-selected.mjs
tools/playtest/starflight-mission.mjs
tools/playtest/starflight.mjs
tools/playtest/themed-bricks.mjs
tools/playtest/tidewheel-centre-catch.mjs
tools/playtest/tidewheel-geometry.mjs
tools/playtest/tidewheel-look.mjs
tools/playtest/tidewheel-power-routes.mjs
tools/playtest/tidewheel-powers-ui.mjs
tools/playtest/tidewheel-profile.mjs
tools/playtest/tidewheel-routes.mjs
tools/playtest/tidewheel-siege-shots.mjs
tools/playtest/tidewheel-siege.mjs
tools/playtest/tidewheel.mjs
tools/playtest/vault-v2.mjs
tools/playtest/vault-visual.mjs
tools/playtest/vault.mjs
tools/playtest/venom.mjs
tools/prepare-android.mjs
tools/recolor_serpent.py
tools/relay-circuit/build.mjs
tools/relay-circuit/coarse.mjs
tools/relay-circuit/controller.mjs
tools/relay-circuit/data.mjs
tools/relay-circuit/menu-check.mjs
tools/relay-circuit/motion.mjs
tools/relay-circuit/motion_gif.py
tools/relay-circuit/playtest.mjs
tools/relay-circuit/serve.mjs
tools/relay-circuit/wide-check.mjs
tools/relay-preview/art-info.json
tools/relay-preview/art_info.py
tools/relay-preview/build.mjs
tools/relay-preview/client.js
tools/relay-preview/compare.py
tools/relay-preview/normal-run.mjs
tools/relay-preview/optimize.py
tools/relay-preview/playtest.mjs
tools/space-assets/check_runtime_art.py
tools/space-assets/motion_gif.py
tools/space-assets/pack-level-family.py
tools/space-assets/preview.mjs
tools/space-power-review/build.mjs
tools/space-power-review/check.mjs
tools/space-power-review/serve.mjs
tools/test-android.sh
tools/weapon-vfx-qa/profile.mjs
tools/weapon-vfx-qa/review.mjs
tools/weapon-vfx-qa/summarize.py
tools/weapon-vfx-review/capture.mjs
tools/weapon-vfx-review/export.mjs
tools/weapon-vfx-review/finish.py
tools/weapon-vfx-review/index.html
tools/weapon-vfx-review/proof.mjs
tools/weapon-vfx-review/review.js
tools/weapon-vfx-review/serve.mjs
tools/weapon-vfx-review/verify-video.mjs
tools/weapon-vfx-v3-review/capture.mjs
tools/weapon-vfx-v3-review/index.html
tools/weapon-vfx-v3-review/metadata.py
tools/weapon-vfx-v3-review/poster.mjs
tools/weapon-vfx-v3-review/poster.py
tools/weapon-vfx-v3-review/review.js
tools/weapon-vfx-v3-review/serve.mjs
tools/weapon-vfx-v3-skiff/README.md
tools/weapon-vfx-v3-skiff/build.mjs
tools/weapon-vfx-v3-skiff/check.mjs
tools/weapon-vfx-v3-skiff/contact.py
tools/weapon-vfx-v3-skiff/index.html
tools/weapon-vfx-v3-skiff/review.js
tools/weapon-vfx-v3-skiff/serve.mjs
tools/weapon-vfx-v3-skiff/skiff.js
```
