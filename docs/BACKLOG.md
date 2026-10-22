# BREACH backlog: everything Codex and ChatGPT left to do

Checked against the code on branch `codex/castle-chapters`, 2026-10-22. Status words: **done** (built and in the build), **partial** (some of it built), **not started**, **superseded** (a later decision or build replaced it). Size: S is under a day, M a few days, L a week or more. "Art?" means new rendered art is needed, not just code.

Built today, checked in `src/main.js`: ten levels (Carrier, Vault, Circuit, Forge, Frost Warden, Mooncoil, Bellforge, Tidewheel, Gatehouse, Lumi Breaks Out), the continue screen, power icons, Ram Ball. Lumi Breaks Out is still in progress (floors, windows, Lullaby/Starlight are in `src/fantasy/lumitower.js`).

Sources are short names: **H01** `docs/handoff/01-status-and-next-steps.md`, **H04** `docs/handoff/04-chatgpt-design-brief.md`, **NL** `docs/NEXT_LEVELS.md`, **SP** `docs/STORY_PLAN.md`, **GP** `docs/GAME_PLAN.md`, **P2a** `design/phase2/new-concepts.md`, **P2b** `design/phase2/kit-and-lumi-levels.md`, **P2c** `design/phase2/dragons-hoard.md`, **CH** `docs/CONTINUE_HERE.md`.

## Recommended next 5

Picked for: sticky, reuses finished art, harder but fair.

1. **Ram Ball in every castle chapter** (Vault, Mooncoil, Frost, Bellforge, Tidewheel). The owner asked for it, the ring art and both skins (`assets/power-icons/ram_steel.png`, `ram_song.png`) are finished, and today only Gatehouse and Lumi have it. Move the duplicate copy in `gatehouse.js` onto `src/fantasy/ram.js` at the same time. Size S to M, no art.
2. **Harder-but-fair pass on all ten levels.** The owner wants players to actually die, with the continue screen as the safety net. The deterministic sweep from the physics audit and the three difficulty modes already exist, so tune Hard and Medium and set a "usually lose once or twice, 3-star when skilled" target. Size M, no art.
3. **Heat streak** (P2a section 2). One module that makes every finished level stickier: a ball-tint ramp, an ember trail and "touch the paddle cools one step". It only needs a tint ramp, not new characters. Size M.
4. **Serpent Rivals** (P2a section 1, CH "two distinct snakes"). The owner asked for two snakes twice. Both skins, all 13 head expressions and the window kit already exist. The lane paths and the clash animation are code only. Size L, little art.
5. **Feel bundle: aim-hold coach, castle-chapter brick shine, single-brick vanish check.** Three small owner complaints that are cheap and visible on every level. The aim hint is currently a single one-second "Aim ready" text. Size S to M, brick re-render only if the castle bricks still look flat.

Next tier: Shine currency plus locked prince and sword teasers (the first rung of the roadmap), Daily Breach, Dragon's Hoard.

## 1. Levels and encounters

| Item | Source | Status | Size | Art? | Note |
|---|---|---|---|---|---|
| Gatehouse Siege (Kit, 3 floors, drawbridge, murder holes, Korr duel) | P2b:33, NL | done | L | n | Chapter 9 in the menu; `src/fantasy/gatehouse.js`, `tests/gatehouse.test.js`. |
| Lumi Breaks Out (3 floors, Gnash from any window, Lullaby, Starlight) | P2b:47, P2b:90 | partial | L | y | `src/fantasy/lumitower.js` and `lumi-render.js` are in the menu but unfinished in the working tree. Lullaby, Starlight and Song Shield are coded. Still open: roof race polish, owner playtest, laptop art (window arch). |
| Mooncoil Reliquary (violet snake, three seal banks) | MOONCOIL_RELIQUARY.md, CH | done | M | n | Chapter 6. |
| Mooncoil: themed armour and rendered power icons | CH line 3 | not started | M | y | Deferred until the owner plays Mooncoil. |
| Serpent Rivals (two snakes, two lanes, clash chamber) | P2a:7, MOONCOIL_RELIQUARY.md:57 | not started | L | n | Same idea the owner proposed for Mooncoil. Must stay winnable on Easy and keep the single rescue goal. |
| Dragon's Hoard (about 200 coin bricks, noise meter, greed exit) | P2c | not started | L | y | New dragon character needed (6 poses). Comes after Serpent Rivals. |
| Living mortar (regrowing bricks, keystone) | P2a:29 | not started | M | y | One keystone variant per brick family, from the existing brick scripts. |
| Duet swap (Kit and Lumi on one paddle) | P2a:22 | not started | M | n | Needs Lumi Breaks Out finished first. Both face-orb sets exist. |
| Relay Escort B (send and defend a cargo) | NL:57 | not started | L | y | Reserved, unnumbered. Pairs with Starflight. Low priority. |
| Orbital Switch B (route, tag, overload) | NL:88 | not started | L | y | Reserved. Avoid the old tiny-symbol grind. |
| Ironclaw's Broken Bridge (crab) | NL:128 | superseded | L | y | The crab is now the Tidewheel Citadel villain (Nerra). |
| Belfry Pursuit (bat) | NL:162 | superseded | L | y | Not chosen. Bellforge took the slot. |
| Clockwork Boar | NL:170 | superseded | L | y | Not chosen. Korr and the Ram Ball cover the same idea. |
| Frost Warden / Brum encounter | NL:110, BRUM_LEVEL_PLAN.md | done | L | n | Chapter 5. |
| Invasion polish: calmer hangar, dim hazard line, landing beat | H01:571, owner round 2 | superseded | S | n | Code is in `src/invasion.js`, but Invasion is no longer in the `LEVELS` list; Carrier replaced it. Nothing to do unless it is brought back. |
| Chapters 3 to 6 of the story (Break Out, Dragon Wing, Comet Dock, Gallery, Endless) | SP:114 | superseded | L | y | The shipped castle chapters replaced this map. Re-plan before building any of it. |

## 2. Shared mechanics

| Item | Source | Status | Size | Art? | Note |
|---|---|---|---|---|---|
| Sweet-spot Ram Ball | P2b:23, owner round 2 | partial | S to M | n | Done in Gatehouse and Lumi only. Not in Vault, Mooncoil, Frost, Bellforge, Tidewheel. Gatehouse holds its own copy of the logic. |
| Floors module (shared stage climb, per-floor Continue) | P2b:15 | partial | M | n | Floors exist inside Gatehouse and Lumi, but not as one shared module as designed. Lets old chapters get a floor-based remix. |
| Heat streak / Molten ball | P2a:15 | not started | M | n | See recommended 3. |
| Fusions and codex (6 fusions) | SP:190 | not started | L | y | Needs the extra power-ups below first. |
| New power-ups: Multiply, Gatling, Magnet, Bomb, Lightning, Drone, Freeze, Portal, Rockets, Star | SP:173 | not started | L | y | Today's set is split, fire, wide, focus, burst, laser, shield, slow, shrink (`src/gfx.js` POWER) plus the Kit and Lumi face-orb powers. Pick 3 to 4, not all ten. |
| New bad pickups (Fast, Reverse, Dark) | SP:182 | not started | S | y | Reuse the flashing red outline of TINY. |
| Old GP power list (Drill, Seeker, Ghost, Twin, Quake, Black Hole, Overdrive) | GP:189 | superseded | L | y | GP describes the old Wisp and tile plan. Mine it for ideas only. |
| Urgency systems: heartbeat vignette, clutch slow-mo, second wind, distance meter | GP:174 | partial | M | n | Serpent has slow-mo and shake in the Vault. A shared red vignette and "second wind" are not built. |
| Adaptive music layers | GP:176 | not started | M | n | Audio is SFX only (`src/audio.js`). Use the audio-design skill. |
| Haptics | GP:175 | done | S | n | `navigator.vibrate` in `arena.js` bump. A Capacitor haptics bridge is not built. |
| Other threats from GP: Magma, Frost, Flood, Dark | GP:288 | superseded | L | y | Replaced by the shipped levels. |
| Gravity thumb, rhythm hits, turn-based aim | GP:154 | superseded | S | n | Parked on purpose. |
| Extra Kit powers: Vesper/Latch done; Nova/Pin | SPACE_COMBAT_HANDOFF.md:57 | not started | M | y | Forge uses a neutral arsenal. Not selected by the owner. |

## 3. Feel and polish

| Item | Source | Status | Size | Art? | Note |
|---|---|---|---|---|---|
| Shinier bricks (like the Vault top-down render) | H01:582, owner round 2 | partial | S to M | y | Glazed bricks landed for Vault and Invasion (commit 099e76d). Owner re-asked: check castle chapter bricks against the Vault look and re-render if flat. |
| Giant unstoppable ball from the paddle sweet spot | H01:466, owner round 2 | partial | S | n | Same item as Ram Ball in section 2. |
| Harder levels | H01:504 section 3, owner round 2 | partial | M | n | Easy, Medium and Hard exist (`src/difficulty.js`). Vault speed and chew tuning shipped. A full pass across the ten levels is open (recommended 2). |
| Continue screen with placeholder watch-ad and unlock | H01:520 | done | M | n | `src/main.js:278-326`, `src/monetize.js`. Ad and purchase are timers and a flag. |
| Per-level continue undo | H01:520 | done | S | n | `continueRun()` exists in every level class. |
| Paddle raised above the thumb zone, smoother control | H01:485 | done | M | n | `minPaddleY` and the control deck in `arena.js` and the levels. Smoothness needs a physical-phone check. |
| Clear aim-hold hint | H01:466, owner round 2 | partial | S | n | Only a one-time one-second "Aim ready" text (`arena.js:79`, `:516`). Add a short, repeating coach on the first serves of each chapter. |
| Single bricks vanish subtly, only big crashes drop debris | H01:498 | partial | S | n | Done in Vault and Invasion (`bigCrash`, `crumble`). Castle chapters should be checked; Lumi's bite already vanishes quietly. |
| Fiercer snake: snarl, bite wobble, cage attack, last-chance hit | H01:541 | done | M | n | `src/vault.js` startAttack and updateAttack. |
| Nervous princess: idle, pacing, panic circles, cower | H01:560 | done | S | n | `src/vault.js:130-156`. |
| Calmer darker Invasion background | H01:571 | superseded | S | n | See Invasion note above. |
| Power icons rendered | CH, commit 2c7e63e | done | M | y | `assets/power-icons/` (arrows, five, lullaby, ram, shield, songshield, starlight, titan). |
| Kit Arrows icon refresh | P2b:127 | not started | S | y | Laptop Blender job. |
| Expressive win and lose screens (eight Kit expressions) | `design/phase1/kit-ability-options.md:79` | not started | S | n | Face sets exist. Code only. |
| Prince Kit as the hero everywhere | H04:277 | done | M | y | Kit orb and rig are in use. |

## 4. Meta, retention and monetization

| Item | Source | Status | Size | Art? | Note |
|---|---|---|---|---|---|
| Watch-ad / unlock full game, real SDK or free mode | H01:520, SP:239 | partial | M | n | Placeholder only (`monetize.js`). Swap to a real rewarded-ad SDK and store purchase later; one file. |
| Stars saved per level and difficulty | existing | done | S | n | `bestByDifficulty` in `main.js`. |
| Shine currency (1 per 100 points, paid on loss too) | SP:203, H04:330 | not started | M | n | Save slot via `prefs.js`. Foundation for everything below. |
| Locked prince, sword and princess teasers | H01:601, SP:131 | not started | M | y | Kit and Lumi art exist. A sword has no art yet (no sword code or assets). |
| Story mode: prologue comic, story beats, chapter select | H01:601, H04:302, H04:336, SP:258 | not started | L | y | Menu is a flat level list. Prologue needs panels; beats can be text over existing art. Wait for owner approval of each phase. |
| Zorvax and Gnash voice sheets | H04:343 | not started | S | n | Text only. |
| Brickhaven rebuild screen (Bakery, Forge, Masons' Hall...) | SP:214 | not started | L | y | Needs Shine first. |
| Raid mode (5 random stages, pick 1 of 3) | SP:228 | not started | L | n | Needs the floors module and level seeds. Use the roguelike skill. |
| Daily Breach (seeded, 3 floors, twist modifiers) | P2a:36, SP:232 | not started | M | n | Reuses every finished level. Needs a seed hook in the level classes. |
| Daily chest, weekly event, gentle streaks | SP:232 | not started | M | y | Streak that pauses, never resets. |
| Skins and boosters store | SP:239 | not started | L | y | Follows Shine. No real-money weapons or heroes. |
| Dragons and mythical beasts (new creatures) | H01:601 | not started | L | y | First step is Dragon's Hoard. |
| Replay Reel / viral clips | GP:97 | not started | M | n | Optional growth tool. |
| Endless "Deep Vault" with leaderboard | SP:121 | not started | L | n | After Raid and Daily. |

## 5. Starflight (separate prototype, not in the APK)

| Item | Source | Status | Size | Art? | Note |
|---|---|---|---|---|---|
| Gatebreak finite mission, nine powers, Stormwing, Ricochet | STARFLIGHT_MISSION.md | done | L | n | `prototypes/starflight/`. Passed browser checks; no physical-phone test. |
| Campaign slice 1: Breakwater (disarmable frigate, Needle/Fan, differentiated wrecks) | STARFLIGHT_CAMPAIGN.md:192 | not started | L | y | The plan's "next implementation". |
| Chapters 2 to 6 (Relay Drift, Glassbelt, Fold Sea, Foundry Crown, Dawn Corridor) | STARFLIGHT_CAMPAIGN.md:58 | not started | L | y | One at a time, each a new combat question. |
| Campaign save `starflight.campaign.v1`, checkpoints | STARFLIGHT_CAMPAIGN.md:186 | not started | M | n | Required before shipping any chapter. |
| Prism Bastion power | STARFLIGHT_POWER_EXPLORATION.md | not started | M | y | First of the two proposals. |
| Comet Loom power | STARFLIGHT_POWER_EXPLORATION.md | not started | M | y | After Prism Bastion. |
| Optional stranded-capsule rescue | STARFLIGHT_CAMPAIGN.md:88 | not started | S | y | Marked optional and deferred. |
| Fold Starflight into the main app and Android build | STARFLIGHT_CAMPAIGN.md:210, MOBILE_PREVIEW.md | not started | L | n | Packaging pass plus physical-phone profile. |

## 6. Tech and performance

| Item | Source | Status | Size | Art? | Note |
|---|---|---|---|---|---|
| Physical-phone test: frame rate, touch comfort, human difficulty | MOBILE_PREVIEW.md:15, H01:595, FANTASY_REFINEMENT.md:55 | not started | S | n | Browser and emulator only so far. Owner playtest needed. |
| Headless physics sweep of every level | commit 4992b7e | done | M | n | Rerun after each level or tuning change. |
| Android APK covering the ten levels | MOBILE_PREVIEW.md | partial | M | n | The delivered APK is the earlier five-chapter build. Needs a new CI build and native check. |
| Startup JavaScript budget in the Android smoke test | commit f420a10 | done | S | n | Keep an eye on it as levels grow (art is packed into the HTML). |
| Merge `wip/polish-pass` into `main` | H01:595 | superseded | S | n | Work moved to `codex/*` branches; the owner approves merges after screenshots. |
| Gatehouse duplicate Ram logic cleanup | `gatehouse.js:231-241` vs `ram.js` | not started | S | n | Do together with recommended 1. |
| Art pack size and load time as chapters are added | `tools/pack_art.py` | not started | M | n | Watch the 16 MB-class HTML bundle. Lazy-load per chapter if the smoke test budget is hit. |
| Apply `skills/gamedev` guidance (game-feel, performance, save-systems) | AGENTS.md skills table | partial | S | n | Skills are vendored. Use them for tasks above. |
| Real iOS wrapper (Capacitor, Game Center) | GP:246 | superseded | L | n | GP plans iOS first; the repo ships an Android APK. Decide platform order before doing it. |
