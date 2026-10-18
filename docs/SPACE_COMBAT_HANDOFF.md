# Space combat — implementation handoff

Updated 2026-10-19. Branch `codex/space-combat-apk`. This document supersedes the old 4188/4189 approval gates for the selected cannon and Circuit companion work. The owner approved BOTH heavy/salvo patterns, distinct colours, left/right/paired/rest attacks, Vesper/Latch, stronger friendly fire, a redesigned power menu, difficulty tuning and an APK/CI push. Nova/Pin and the reserved Escort/Switch encounters are deferred. The later Frost Warden request is authorized and tracked separately in `docs/BRUM_LEVEL_PLAN.md`.

## Resume map

- Start with `docs/CONTINUE_HERE.md` for release state and open work.
- Exact tested bundle and package hashes: `config/mobile-preview.json`, generated `dist/mobile-preview.json`, and the successful CI artifact manifest.
- Install/build/native evidence: `docs/MOBILE_PREVIEW.md`.
- Future encounters: `docs/NEXT_LEVELS.md`, explicitly proposals/deferred concepts.
- Immutable art catalogue: `artwork-library/manifest.json`, `CATALOGUE.md`, `SPACE_BOARDS.md`; working/source locations: `docs/ARTWORK_LIBRARY.md`.
- Current playable browser: `http://127.0.0.1:4192/breach.html` while the local server is running. Query levels 1/2/3/4/5 mean Carrier/Vault/Circuit/Forge/Frost Warden; menu displays the three space levels before the two castle levels. Difficulty query accepts easy/medium/hard.

## Stable storage and transitions

`src/main.js` keeps storage indices Carrier 0, Vault 1, Circuit 2, Forge 3 and appends Frost Warden 4. Legacy best records map only to old Carrier Easy / Vault Hard slots; new slots start empty without erasing old results. Menu order is separate from storage: `[0,2,3,1,4]`; extend this explicit order when appending another chapter. Space Next follows 0→2→3 and castle Next follows 1→4. Pause has Resume/Retry/Menu; Retry reconstructs the same level and mode, clears held input, resets attempt clocks/Continue and preserves saved progress. Resize restarts only when play geometry changes; app resume stays paused until the real Resume action.

## Shared weapon contract

`src/space-weapons.js` draws the actual approved compact plasma and connected impact rasters. `tools/pack_art.py` packs `design/phase1/weapon-vfx-v3/plasma-shot-runtime.png` and `plasma-impact-runtime.png` losslessly into `ART.spaceWeapons`. Carrier is magenta; Circuit violet; Forge orange; friendly fire cyan. Colour variants preserve the same rendered material and highlight.

Heavy is one radius 9 round. Salvo is three radius 7.5 rounds spaced 0.14 seconds. A volley chooses left, right, both or quiet. Two-gun batteries stagger by 0.85 seconds and have separately locked warnings; repeated quiet or paired choices are bounded. Easy/Medium/Hard heavy speed is 440/520/600 u/s; salvo adds 40 u/s. Warnings are 1.35/1.20/1.10s; recovery is 3.8/3.1/2.5s. Current paddle width must leave a safe lane; otherwise the battery rests. Bloom/wake do not enlarge damage. Canonical geometry and timings live in `nextEnemyVolley` and `enemyEscapeLane`, not this prose.

Enemy shots are rendered above the field and never break, push, damage, stop against or award rewards from bricks. Player ball, Cosmic and friendly shots retain productive brick/ship damage. Swept collision resolves actual moving player contact; source destruction cancels unfired rounds but does not erase already launched fire. Terminal states, Retry and Continue clear the appropriate attack state. Friendly shared rounds use radius 6.8 and the approved 37 u sprite footprint; Kit keeps arrows and canonical Cosmic graphics.

## Power economy

`src/difficulty.js` is authoritative. Space charge needs productive ordinary contact credits AND active combat refill time: 24/30/36 on Easy/Medium/Hard. Shots, skiff pulses and active Cosmic cannot refill themselves. A full meter does not bank overflow for an instant next cast. The chooser freezes gameplay and all threat clocks; cancel preserves charge. A saturated choice remains disabled without spending.

| Space mode | Minimum active refill | Cast duration | Maximum remaining duration | Live balls | Cosmic balls |
|---|---:|---:|---:|---:|---:|
| Easy |24s|8s|12s|7|1|
| Medium |30s|7s|10s|6|1|
| Hard |36s|6s|8s|5|1|

Ball Fan adds four ordinary balls up to the cap, making five from a lone ball. Existing survivors are never deleted. Repeated positive pickups extend within their cap; WIDE stacks width and duration but stays inside the field. Kit's prior separate limits remain 12/9/5 balls, 2/2/1 Cosmic, 20/18/14 seconds. Carrier stores its difficulty object while the other levels store an id; `Arena.companionLimits` explicitly handles both so Carrier no longer silently falls back to Medium.

## Carrier Breakout

Sources: `src/carrier.js`, `src/carrier-physics.js`, A parts in `design/phase1/space-assets-ab.json`, `assets/space-a/` and shared capsules. Nix/Tick remain selected. Rescue five crew per manifest; Medium/Hard have two finite manifests with a 75-second active wave clock. Hull defeat stops its threats; cleanup/rescue and final retreat retain their existing states. Player hits on housings/fighters interrupt boarding.

Hostile panel destruction was previously part of the raider's approach. That dependency is removed: a boarder takes an aerial route over panels to a reachable housing; another intact housing remains an obstruction. No repeated brick-breach shot can stall the raid. First squad is 20/16/12 s, extraction 14/11/9 s, recovery 6/4/3 s by mode. Carrier hull is 45/60/78 HP; housing locks 5/6/7 HP. These give an opening response interval, then real capture pressure. Read the route/tractor helpers before changing cover: `coverTargets` is still needed for non-projectile crew logic.

## Circuit Breakout

Source: `src/relay.js`; physical skiff renderer `src/skiff.js`; measured source `assets/relay-circuit/manifest.json`, B assembly and preserved runtime texture packs. Vesper is the face control; Latch is the visible one-cannon jammer. A successful selected power also jams one live cannon for 6 active seconds, cancels its pending shots, and leaves in-flight shots intact. It adds no extra meter.

Ordinary ship metal hits reduce hull; no ordered symbol puzzle or mandatory precise open-window sequence remains. Hull is 72/96/120 HP. Half health grants one physical skiff deployment. Its 12 alternating shots use real muzzle anchors, radius 6.8, speed 560 u/s and 0.38-second cadence. Armour pivots, cannons recoil, ball is safely stowed; return follows last projectile resolution with bounded 1.35 s fallback and a real caught serve. Existing time cap remains 10/9/8 s; the small burst strip displays the lower of ammo/time remaining. Do not duplicate or erase survivors during morph/return.

Physical port leaves now travel 24 u so radius 9 heavy ordnance actually clears the opening. Art/collision/velocity move together. Heavy/salvo player contact costs one life with a 3-second fresh-serve grace; a craft hit ends the burst safely. Circuit centre is a closed mechanical exit iris, not suction. The decorative rotating portal stays quiet during combat and the hatch opens at defeat/departure.

## Shutter Forge

Source: `src/orbital.js`, `assets/orbital-forge/manifest.json` and preserved runtime textures. Use a neutral ship arsenal control; Nova/Pin have not been selected. Broad hull and closed machinery damage remain productive; open windows give bonuses rather than being the only legal hits. 40 equal-sized slots include 38 colour panels and 2 breakable grey panels. Three stabilisers collapse before the external reactor finish; hull defeat also disables them. The lower hull lip remains solid and the reactor projects outside it; never invent an invisible hole through source metal.

Easy/Medium/Hard stabiliser HP 18/22/26; hull 54/66/78; open windows 10/9/7.5 s; gun HP 6/7/8; reactor 12/15/18. First teaching window stays harmless; stronger warned random batteries follow. Once-only ordinary ball reward and finite phase transitions remain. All shot colours/impacts now use the approved family.

## Presentation and touch

Full portrait canvas retains safe insets and dark planets/backgrounds. Bottom paddle remains 126 CSS pixels from the world bottom to reserve ball/gesture room and a 52 CSS companion control; no repeated drag/catch instructions or dark control slab. Top HUD holds pause, lives, aim and compact score. The chooser must keep 44 CSS minimum targets and house fonts, visibly distinguish disabled/capped choices and never leak its touch release into ball launch. Check iPhone 393×852 with 59/34 insets and Android 412×915 with 32/24 insets.

Vesper/Latch original generated sheets, prompts, normalization, alpha padding, hashes and runtime manifests are preserved under `art/space/circuit-companions/` and `assets/circuit-companions/`. They are raster expression/motion families, not claims of finished rigged 3D models. Enemy/player rasters, studies and rejected history stay versioned; do not overwrite original references.

## Verification and honest limits

Unit tests cover shared caps, enemy field invariance, actual paddle hit/dodge, port clearance, current-width escape, raid approach, projectile cleanup, paused clocks, jam, skiff ammo and safe return. `tools/playtest/combat.mjs` tests real Main/CDP touch across 18 space/mode/phone cases; charge is deliberately staged for modal/power lifecycle tests. `tools/playtest/frost.mjs` covers the six Warden mode/phone combinations, measured strikes and castle powers. `tools/playtest/layout.mjs` checks all five levels. `polish.mjs` retains Vault/Carrier regression coverage and fails on page errors.

`tools/playtest/combat-balance.mjs` is a bounded deterministic public-input assist, reading balls and visible bolts without target solver/HP/life/charge writes or Continue. It is not human difficulty or physical-phone performance. Preserve failed runs as well as successful routes. Current reruns show reachable Circuit Easy/Medium wins with earned powers and losses on Hard; Forge has earned powered wins. Carrier needs targeted rescue decisions and has both wins and losses in bounded policies. Exact final receipts and CI status belong in the release document.

Before another release: inspect actual phone captures, run current units/build/phone suites, record LF-canonical bundle hash, package offline fonts, run source and packaged browser checks, then native compilation/lint/emulator lifecycle. Download the passed APK, verify its zip payload/hash against the manifest, and only then claim delivery. No main merge or store publication is included.
