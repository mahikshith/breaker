# DIGEST: Gemini "Argon" drops, 2026-10-23 (P01 to P10)

Read-only review on branch `codex/castle-chapters` (HEAD 8bde6e0). Verdict key: **BUILD NOW** / **LATER** / **SKIP**, judged on fun, urgency, stickiness, engine feasibility, and fit with what exists. "Arena levels" = Vault, Carrier, Circuit, Forge, Frost, Mooncoil (they use `src/arena.js`). Castle models (Bellforge, Gatehouse, Tidewheel) have their own loops and **no capsule system at all**; Rivals and Lumi have scripted capsule drops only.

Overall read: Argon is dense, well-formatted and mostly on-brief. Its strongest value is P04 (continue screen), P03 (new capsules) and the P02 test plan. Its biggest weakness is that it models our game from the context brief, not the code (see "Factual errors"). Image prompts in `argon/assets/*/*.prompt.txt` are verbatim copies of the "Art requests" blocks in each doc (checked P04); they use our house-style preamble correctly. Argon made no images.

## P01 Power-ups round 2 (toy-stack synergies)
- **Time Bubble**: SLOW becomes a 96x44 glass dome over the paddle, 9/8/7 s, balls inside run at 0.55/0.60/0.65x, bubble locks to paddle x with 0.04 s spring lag.
  - **BUILD NOW.** Today SLOW is a global 0.68x ball dt for 8 s (`arena.js:284,337`). A local dome turns a passive crutch into a catch-and-aim skill tool. Must be a rendered glass dome, not a ring.
- **Ram buff**: radius 13.2 to 15.6, 2.5 to 3.0 s, 14 to 18 bricks, villain damage 3 to 4, and the Ram deals 1 damage to a 2-HP armour brick before bouncing.
  - **BUILD NOW** radius/time/bricks (one-line change to `RAM` in `ram.js:6`; answers the owner's "can it feel bigger?"). Armour-crack on bounce also cheap and satisfying. **LATER** the 3 to 4 HP damage: it shifts every villain's HP maths, so change it only together with the P02 retune.
- **Eight synergies** (auto-fuse of two active powers): Cinder Scatter (fire+split), Broadside Battery (laser+wide), Molten Ram (fire+ram: r 17.0, pierces 2-HP, 6 boss HP), Chrono Snipe, Salvo Escort, Fortress Wall, Cosmic Echo, Sanctuary Dome.
  - **BUILD NOW** three: Molten Ram (hooks straight into `ram.js`), Cinder Scatter, Broadside Battery. These give the BALL x PIT build moment the owner asked for.
  - **LATER** Fortress Wall, Cosmic Echo, Sanctuary Dome (needs Bubble first).
  - **SKIP** Chrono Snipe (Focus aim already slows time to 0.25x, so auto-prime is redundant) and Salvo Escort (extra projectiles clutter the ball).
  - Duplicates: Cinder Scatter is STORY_PLAN's "Firework", Sanctuary Dome is its "Time Bubble". Reuse those plan names/codex.
- **Catch economy**: base drop 0.16/0.13/0.10 per brick, pity drop after 7/8/10 dry breaks, fall speed 105/118/130, hero orb 22/28/34 hits (from 24/30/36).
  - **LATER.** Our drops are level-authored `payload` bricks (`dropPower` calls in carrier/frost/relay/orbital), not a per-brick roll, so there is no pity hook. A "never more than ~15 s without a capsule" guard is still a good idea but needs a design choice (re-seat payloads vs add a roll). Orb 22/28/34 is a trivial **BUILD NOW** constant for arena levels only.
- **Stacking and caps**: repeat catches add +4 s up to 20/18/14 s; overflow beyond ball cap converts to +2 hero charge per ball.
  - **BUILD NOW** the overflow-to-charge (today excess is just sliced off, `arena.js:271`). Stacking is mostly there already (WIDE levels, LASER/SHIELD add time).
- **Last-1.5 s expiry warning on every timed power** (pulse + two ticks) and per-power catch juice (squash 0.82, chimes).
  - **BUILD NOW** the warning. No expiry telegraph found in the timer code (`arena.js:308-310`); cheap, fair, and adds urgency. Catch juice is **LATER** polish.
- **TINY rework**: 100 to 74 wide for 6/7/8 s, but 1.5x score and +2 hero charge per brick; catching WIDE within 3 s cancels it with a hiss and +250.
  - **BUILD NOW** the upside and cancel rule (risk/reward makes a dead pickup interesting). Keep our harsher shrink (0.62x for 9 s, `arena.js:280,308`); Argon's 74/6-8 s is a nerf.
- **Physical paddle attachments** (brass barrels, ceramic wings) per capsule: **LATER**, pure art load and the paddle already uses sliced l/m/r skins.
- Hero-power number tweaks (Arrows 7/6/5, Titan 8/7/6 s, Lullaby 5/4/3.2 s...): **SKIP** until a playtest; baselines are guessed.

## P02 Difficulty round 2
- Two-wave sawtooth: ramp 1 to 4, **wall at Ch5** (Medium first-try win 0.50), breather Ch6, climb 7 to 9, **wall at Ch9** (0.42), breather Ch10, finale Ch11 (0.38 Medium, 0.18 Hard). Easy 0.76 to 0.92, Hard 0.18 to 0.42 throughout.
  - **BUILD NOW** as the target curve. It is exactly BACKLOG "harder-but-fair pass" and matches the owner's "players should actually die". M365 agrees on walls at 5 and 9 (differs on breathers).
- Numbers that map to existing keys: Ch1 `raiderHP` [3,4,5] and `extraction_s` [7.5,6.8,6.0] (fixes Hard giving the most time, 8.5 s today); Ch2 `vaultSpeed` [.58,.74,1.05]; Ch7 villain HP [24,34,44].
  - **BUILD NOW** Ch1 and Ch2. Ch7 only if the Ram damage stays consistent with P01.
- Other chapter arrays (irisClose_s, headStunBack_units, twinSealHP, clashInterval_s, tideRise_ups, winchHits...): **LATER**. Parameter names do not match our rules objects (Rivals uses `hatch/seal/seal2/wardCap/clash/dizzyHit/interval/tell/lureTell/window/chain/coreHits`), so Claude must remap each, then confirm by sweep.
- Urgency clock table (extraction beam, chewing serpent, iris, stabilisers, frost march, weights, bells, tide, winch, window bite, twin race) with a skilled pushback each.
  - **SKIP** as new work; mostly describes shipped mechanics. Use it as a checklist: every chapter shows a clock and rewards skill by pushing it back. Bell knock-back into Korr already exists (`gatehouse.js` bell `returning`).
- Anti-cheap audit: one-time cracked "safety lip" that rebounds the first missed ball (Easy 100%, Medium first 12 s), reaction lane `y_solid_max <= paddle.y - 135`, hazards stop at y=480, first hazard shown harmlessly.
  - **SKIP** the safety lip: free lives on Easy/Medium cut against "harder levels" and add a collider. **BUILD NOW** the lane-clearance and first-showing asserts in the audit.
- **Seven-metric bot plan** (120 Hz): zero-pickup progress every 6 s, run-length envelope over 50 seeds, noisy human-proxy bot (35 ms lag, +/-6 unit jitter, 200 runs) calibrating win rates to +/-0.07, telegraph window 1.2 to 1.8 s with a harmless first hazard, lane clearance, zero enemy-broken bricks, continue-state integrity.
  - **BUILD NOW.** It extends `npm run audit:physics`; the human-proxy win-rate bot is the missing piece for tuning "usually lose once or twice".
- Continue = 3 lives, keeps bricks/crew/boss HP, 3.0 s Brick Ward; default Medium with an Easy offer after two early losses.
  - **LATER** (Easy offer is a nice retention nudge). Today `continueRun` gives `lives = max(2, lives)`; M365 says 1 life + 2 s shield. Owner should pick.

## P03 Six new power-ups (no M365 equivalent)
- **SPARK** `#4CE0B3`, 8/7/6 s: each brick hit arcs a 4-segment faceted bolt to 3/2/2 same-colour bricks within 64 units for 1 damage. Combo Prism Storm with SPLIT.
  - **BUILD NOW (#1).** Highest juice per line of code (nearest-neighbour on the brick grid), rewards reading colours, same as STORY_PLAN "LIGHTNING". Counter-risk (wasted on granite) is fair. Check chain damage obeys the quiet 0.4 s fade rule.
- **MAGNET** `#E85D9A`, 10/9/7 s: pulls positive capsules within 110 units (160 u/s) and bends descending balls within 72 units toward the centre third; also tugs TINY within 65.
  - **BUILD NOW** the capsule pull (fewer missed catches, feels skilful). **LATER** the ball bend: steering balls into the sweet spot trivialises the Ram streak and "collision follows the art" for the player's own aim.
- **COLOSSUS** `#B8336A`: catching it arms the centre third at once; the next centre hit launches a r=17.5 juggernaut for 4/3.5/3 s or 22/18/15 bricks, 5 boss HP, 0.88x speed (304 u/s), bounces off granite.
  - **BUILD NOW** as "instantly arm the Ram" (set `paddle.armed`, ~5 lines): it is the owner's requested bigger sweet-spot ball. **SKIP** a third giant ball: Ram (15.6) and Kit's Titan (10.5, smaller yet "unstoppable") already crowd the slot. **LATER** the 0.88x slowdown, which fights urgency.
- **QUAKE** `#C87D55`: next 3/2/2 impacts blast 48x48 (2 HP centre, 1 HP to 8 neighbours), real debris.
  - **LATER (first of wave 2).** Best "big crash" moment, equals STORY_PLAN BOMB, debris code exists. 48x48 assumes a 16-unit grid; castle bricks are 36x18, so size must be re-derived per level.
- **ORBIT** `#8E7CC3` (2 satellites r=4.5 on an 84x28 path, block shots, fire on Ram) and **PORTAL** `#3B6EF6` (wall portals at x 12/y 260 and x 348/y 140, exit 1.15x).
  - **SKIP** both for now. Few projectiles in the castle chapters for ORBIT to block; PORTAL hard-codes coordinates, needs a loop guard and a per-level layout, and speeds the ball into open lanes. Both duplicate STORY_PLAN DRONE and PORTAL.
- **Capsule colour clash (design bug):** SPARK mint vs SHIELD `#2EC4B6` vs teal bricks `#22C4B0`; MAGNET `#E85D9A`, COLOSSUS `#B8336A` and LASER `#FF4D6D` are three near-reds at 48 px; QUAKE next to FIRE; ORBIT next to AIM. Argon's own P06 stresses 0.2 s recognition, so this must be resolved with shape or symbol, not hue.
- Icon sheet prompt (3 hero-style icons + 6 capsules "no letters"): **LATER**. Our capsules are drawn in code with text labels (`gfx.js` `POWER`/`capsule`); a symbol-only set is a design change.
- Ranking Spark > Magnet > Colossus is sound; build order adopted above.

## P04 Continue screen (no M365 equivalent)
- **"Almost achieved" reveal** in the first 0.5 s: freeze + dim, "SO CLOSE!" plaque, context line ("KORR HAS 3 HP LEFT", "1 CREW POD LEFT", "2 WINCH HITS TO CLEAR FLOOR 2") with villain `hurt` and Kit `worried` portraits, and a "91% CLEARED" bar.
  - **BUILD NOW (top idea).** Near-miss framing is the strongest conversion and "one more try" lever, and it replaces today's `reason` text ("No balls remaining" in `gatehouse.js:129`). Needs one `almost()` accessor per level class (HP left, pods, hits).
- **8.0 s horizontal "crystal fuse" bar** (264x16, `#2EC4B6` to `#FF4D5E`, ticks at 1.5 s and 0.5 s). Continue inside 8 s grants a 3.0 s Brick Ward and 2/3 Ram pips pre-armed; at 0 s the buttons stay live (no kick to menu).
  - **BUILD NOW.** Today the countdown is a stroked ring (`main.js:~296`, the exact rejected ring) of 9 s that ends in auto-decline. Bar + quick-pick bonus keeps urgency without hostility.
- **"BACK IN ACTION" return**: panel folds (0.2 s), 3 life balls pop in, 3.0 s shield at y=716, ball held on paddle in Focus aim (0.25x), hazard clocks paused until the finger lifts.
  - **BUILD NOW.** Guards against instant re-death right after a paid continue, which kills ad conversion and reviews.
- **$2.99 card rules**: hidden on lifetime loss 1; shown from loss 2, or any loss with progress >= 60%. Copy "FREE CONTINUES FOREVER - NO ADS - ALL 11 CHAPTERS". Unlock turns the ad button into FREE CONTINUE.
  - **BUILD NOW.** Respectful timing, easy via `prefs.js` counter. Note "ALL 11 CHAPTERS" must match what is actually gated (currently nothing is).
- **Layout table** (360-wide grid, frame 312x616 at y=76, buttons 52 to 58 tall, Lilita One 18 to 28, Rubik 12 to 13) and 7 sound cues (low brass sigh, marimba roll, wooden ticks, C5-G5 chord...).
  - **BUILD NOW** the button sizes/hierarchy (fixes the 15 px "No thanks" link). **LATER** exact y values: they are fixed and assume a tall world, but our world height is 640 to 880 and the current panel centres itself.
- 3-gem placeholder ad card ("AD PLACEHOLDER 3s"): **SKIP**, a real SDK replaces it. Easy.
- Retry semantics: Argon's "RETRY FLOOR" keeps earlier floors; our brief says "Retry starts fresh" in one place and "Retry keeps earned progress" in another. If Retry keeps floor progress for free, Continue only sells boss HP/lives, which weakens monetisation. **Owner decision needed.**
- Persist `isFullGameUnlocked` as `breach_full_unlock_v1` with a title-screen test toggle: **LATER**; the flag already exists as `store.get('unlocked')` in `monetize.js`. Keep that key, add the debug toggle.

## P05 APK critique (14 issues)
Verified in code: ring countdown, "V"/"F" chapter badges and the "Full screen" button (`main.js:265,272`), "ANCHOR/ARROWS/STARFIRE" menu labels (`chapter.js:19`), "No balls remaining", 15 px "No thanks". Not verifiable from code: the gold wireframe under Korr (only filled shadow ellipses at `render.js:121,146`) and the sweet-spot "wireframe box": `render.js:556` already draws three gem sockets with "no drawn outline", so those findings may predate HEAD.
- Ring countdown, tiny touch targets (X ~18 pt, "No thanks"), HUD/face orb in notch and home-indicator zones, paddle too low (move HUD to y 44..72, paddle to ~75% / y 585), numbered 1 to 11 chapter list, hide "Full screen" on APK: **BUILD NOW** (owner-reported or rule violations, all small).
- Yellow Bellforge cage (swap to the dark gunmetal cage already used in Tidewheel), orange wall torches behind bricks, brighter-than-ball floor reflections: **BUILD NOW**. All are explicit owner or style-bible rejections.
- Armour bricks identical in silhouette to breakable bricks, satin bricks lacking the Vault gloss: **BUILD NOW** via P09.
- Flat Bellforge ramp plaques to 3D latches with a 1.6 s ember tell, tide as a glazed water volume with foam chips: **LATER** (art).
- Replace ANCHOR/ARROWS/STARFIRE with BRICK WARD/ARROWS/COSMIC/BALL FAN: **SKIP the rename.** Tidewheel's three powers are chapter-specific by design; swapping them changes gameplay. Do replace the flat icons with rendered ones (`assets/power-icons` has arrows/titan/shield already).
- Face-orb "segmented starglass ring" that fills 22/28/34: fine intent but it is itself a ring; **LATER**, keep it a 3D bezel with gems, not a stroked arc (the current `kit.js` halo uses `softRing`).
- "Keep" list (Korr/Nerra renders, dark castle depth, dark iron cage, difficulty pills) is correct.

## P06 Research (no M365 equivalent)
- Eight comparisons (BALL x PIT, Brick Breaker Hero, Arkanoid, Bricks Breaker Quest, Holedown, Ballz, Peglin, Vampire Survivors) with copy/avoid columns; recommendations: stack never overwrite, 20 s reward heartbeat (pity every 8 breaks ~12-15 s, orb every 22-34 hits ~20-25 s), pushback mechanics over HP inflation, painless failure with Shine paid on loss.
  - Verdict: **mostly confirmation, little new.** STORY_PLAN already holds fusions + codex, Shine (1 per 100 pts + star bonus, paid on loss), Peglin-style choice, and the Holedown premium model. Treat as validation.
- **Synergy Toast** (180x36 at y=68, 1.4 s, "SYNERGY! MOLTEN RAM") plus a Synergy Codex: **BUILD NOW** with the first synergies (cheap, makes fusions discoverable).
- **Shine**: 100% of brick Shine on loss, +25 per star on clear: **BUILD NOW** (BACKLOG "not started"; the foundation for unlockables, Brickhaven and monetisation).
- Guardrails (no forced replays, no paid boosters required for Hard, never single-slot capsule overwrite, no particle soup hiding the ball): **adopt as rules**, no work.
- Source quality: only 6 of the 9 links come from STORY_PLAN; two are bare `play.google.com/store` roots; the Ballz row cites an Archero article and Bricks Breaker Quest cites a generic retention blog. Holedown is "$2.99" in the table and "$3.99" in the data. Argon admits live browsing was unavailable. Do not quote it.

## P07 Dragon's Hoard (vs our `design/phase2/dragons-hoard.md`)
- **Greed meter**: gold coin bricks give 300 pts and +2 hero charge but raise the Wake Eye by 2.5/3.3/4.2%; at 100% Ember snorts (1.6 s tell), glazing 4 gold bricks to 2-HP and resetting to 40%. Two 64x16 teal **Hush Chime** pairs each drop it 25% and calm her 3 s.
  - **BUILD NOW (adopt over our noise meter).** Gold-only greed is a choice the player makes with each shot; ours taxes every brick. Keep our idea that the exit lets you cash out at x1.5/x2 (Argon dropped it), because it is the stickiest "one more run" hook.
- **Molten Gold**: breath glazes front tiles into 1-HP molten bricks; break them within 4/4/3.2 s for +500 pts and 3 splash HP to Ember (and a 2.5 s stagger), otherwise they cool to 2-HP armour.
  - **BUILD NOW.** Improves our "melt then harden" penalty into a risk/reward skill moment.
- Floors: (1) Coin Mound, dig to a 64x32 Sunstone, hit it 4x; (2) Molten Veins, break two 56x24 Brass Locks (4 HP each) with tail-sweep coin slides (nudge ball +/-90 u/s or paddle 0.65x for 1.2 s); (3) Awakened Duel, Ember HP 28/38/48. Totals 148/172/196 bricks, 25 to 40 s per floor.
  - **LATER, and merge not replace.** Our Floor 3 is an escape with a sliding avalanche (urgency, reuses Invasion march) and a gate; Argon's is a static duel. Keep the avalanche for urgency and add Molten Gold to it. Our Floor 2 (6-hit claw + tail lane) is close to Argon's locks. Run time (about 1.5 to 2 min) is shorter than every P02 chapter target.
- **Grid errors** (see below): maps are 11x9 cells of 28x18, but sizes quoted (64x16, 64x32, 128x64) do not equal the cell math, and Floor 1's right side lane is blocked in rows 3 to 4.
- Gold-heavy board (honey `#F4C542` coins everywhere) clashes with "yellow is an accent". Mute coins to bronze/copper with gold highlights (true of our own design too).
- Continue keeps floor and Ember HP: consistent with P04.

## P08 Ember character
- **Direction A "Cloaked Hoard Baron"**: 128x64 low four-legged mound, folded bat wings (flare 42 to 45 degrees, 86 units tall, in the 1.6 s tell), crescent ivory horns with brass caps, burnt orange `#B8402F`, charcoal `#2A2D3E`, cream belly `#F3E5AB`, plum membrane `#5C2434`, amber eyes `#FF9F1C`, 5 stuck coins that pop off on stagger.
  - **LATER (art-blocked), design approved.** Risk: at rest she is a low, wide, horned, four-legged red-brown body, close to Korr (ruby/plum boar); only the wing flare separates them. Push her colours warmer/darker and give the rest pose a visible wing silhouette.
- **12 expressions** (8 game moments + asleep, snort, greedy, fake-out snore), **panic below 25% HP** (switches idle to cowering, signals "two hits left"): **BUILD NOW** with the chapter. Good, distinct faces at 56 px.
- **Six keyposes + rotating jaw/wings/tail rig**, 36 inscribed circles (r 3.5 to 22), 0.15 s blend, outward push at >=345 u/s: the circle rule matches our physics standard; the **separate rotating parts rig** is new art/code burden. **LATER**: use keypose sheets like Korr/Gnash.
- Brass horn-cap circles (r=6) that bounce for 0 damage: **SKIP**, adds a confusing dead spot for no gain.
- Story: STORY_PLAN framed Ember as a freed exhibit/ally; Argon makes her the Hoard boss. Not contradictory if she is freed later, but owner should confirm.

## P09 Bricks glaze v2
- Seven families (sun `#FFC73D`, coral, violet, teal, blue, gold-gem, granite) with a 3 px `#FFDBB8` top band, 4 px under-bevel, 4-point corner glint, dark `#0A0C18` rim; three states (intact/cracked/breaking).
  - **BUILD NOW** the band, glint and states for castle bricks (BACKLOG item 5 "castle-chapter brick shine"). Partly done already (glazed Vault/Invasion; "ceramic Bellforge bricks" in HEAD~1), so diff against HEAD first.
- **2-HP recessed core plate** (20x8 inner lozenge, pops in 0.25 s on hit 1): **BUILD NOW.** Readable HP before the first hit.
- **Granite = chamfered octagon**, 4 rivets, no gloss band: **BUILD NOW.** Meets "shape and material, not only colour".
- Break animation: 0.12 s swap to breaking + glint, then scale 1.0 to 0.88 and fade in 0.28 s, no chips unless >=4 bricks fall at once: matches our rule; **verify** it is used in all castle chapters (BACKLOG says only Vault/Invasion confirmed).
- **Ambient shimmer**: a 0.35 s glint sweeps ~8% of intact bricks every 3 s: **BUILD NOW** (cheap, premium; cap the count so the ball stays the brightest thing).
- 24-cell 2048x3072 image sheet: **SKIP generating with an image model.** 24 consistent bricks will drift; render procedurally or from the Vault brick scripts. Treat the prompt as a spec.
- Nine-slice with 12 px caps for 16x16 cells: **LATER**, only for gem and granite.

## P10 Kit unlockables (4 paddle skins + 4 swords)
- Skins (cosmetic): Starglass Vanguard (clear Ch2), Gatehouse Bastion (clear Ch9 on Medium/Hard), Serpent Fang (24 stars), Hoard Baron (clear Ch12). Swords: Courtyard Gladius (start), Volt Rapier (15 stars, +3 units sweet spot), Bellbreaker Greatsword (3 Hard wins, +6 units knock-back), Drakefang Blade (Ch12 3 stars, +1 starting orb pip).
  - **BUILD NOW** Starglass Vanguard at Ch2 clear as the first unlock teaser with an "ARMOURY" button in place of "Full screen". The skin plumbing exists (`assets/paddle-skins` l/m/r + manifest, `gPaddle(skin)`), so it is art-only. Early unlock hook is the stickiest part.
  - **LATER** the rest; Hoard Baron and Drakefang wait on Ch12.
- **Sword perks** (+3 units on a ~34-unit sweet spot, +6 units knock-back, +1 starting pip): **SKIP.** Invisible to players, multiply the test matrix, blur the "cosmetic only" promise. M365 chose cosmetic-only; agree.
- Sword as crossguard inlay across the centre third with a 0.22 s slash on Ram/hero launch: **LATER**; flashy and on-brand, but must not hide the three gem pips (`render.js:556`).
- Monetisation: everything is earned, nothing sellable, no Shine. STORY_PLAN wants skins purchasable ($0.99 to $1.99 or Shine) and weapons earned. Add a Shine price path so unlockables are monetisation-ready.
- "Swords" overlap STORY_PLAN's weapons (Magnet Gauntlet, Smash Hammer, Star Bow), which are paddle moves; name these cosmetic items differently to avoid confusion.
- Ambiguity: stars are stored per difficulty (`bestByDifficulty`), so "24 stars across Chapters 1 to 11" needs a rule (max per mode? best of any mode?).

---

## Top 8 ideas, ranked
1. **P04 "SO CLOSE" near-miss reveal** with per-level remaining-goal line (replaces "No balls remaining").
2. **P04 "Back in action" return**: held Focus-aim ball, 3 s shield, Ram 2/3 pre-armed, hazards paused until release.
3. **Ram buff (15.6 / 3.0 s / 18 bricks, crack 2-HP armour) plus COLOSSUS as an instant-arm capsule** (owner's "bigger sweet-spot ball").
4. **SPARK and MAGNET (capsule pull)**: two cheap, high-juice capsules; fix their colour/shape clashes first.
5. **Time Bubble, 1.5 s expiry warnings, overflow-to-charge**: makes powers readable, skilful and never wasted.
6. **Three synergies (Molten Ram, Cinder Scatter, Broadside Battery) with Synergy Toast and codex.**
7. **P04 + P05 + P09 premium-look and mobile fixes**: ring to fuse bar, 52-unit buttons, HUD/paddle out of notch/thumb zones, 2-HP core bricks, octagon granite, remove yellow cage and torches, numbered chapter list.
8. **P02 bot harness** (human-proxy win-rate bot, telegraph and lane asserts) plus the mapped Ch1/Ch2/Ch7 number changes, aimed at the Ch5 and Ch9 "walls".
Next after these: Shine on loss + Ch2 skin teaser (P06/P10), QUAKE, and Molten Gold/gold-greed for the Hoard.

## Ideas unique to Argon
- Whole docs with no M365 counterpart: P03 (six capsules), P04 (continue screen), P06 (research). M365 powerups instead proposes a build tray with Lv1 to 3 and a Ram of r=20; Argon's toy-stack plus local Time Bubble is a different path.
- Not found in the M365 files I grepped (powerups, ember, unlockables, difficulty, critique, level, bricks): Time Bubble (M365 has a "bubble" mention only in powerups, not checked in depth), Hush Chime / gold-only greed and Molten Gold splash (M365 uses a Greed integer 12/10/8 and a march), octagon granite and recessed 2-HP core, first-life safety lip, soft-expiry fuse bar, hide-$2.99-on-first-loss rule, noisy human-proxy bot, paddle-skin nine-slice with centre pips, Starglass skin at Ch2.
- Convergent with M365 (not unique): walls at Ch5 and Ch9, sawtooth shape, pity rule, 8-synergy table, cosmetic skins unlocked by play.

## Factual errors and mismatches vs our game
1. **Paddle width**: assumed 100x14 everywhere. Actual: Arena default 74, Frost 100x14, Carrier/Circuit/Orbital 125x17 to 29. So "centre third = 33.3 units" and WIDE "100 to 132" are wrong; our WIDE is x(1 + 0.55 per level) for 12 s (`arena.js:279,308`), stronger than Argon's. Keep ours.
2. **Capsule model**: assumes a random per-brick drop rate and pity. Real: authored `payload` bricks. Castle chapters (Bellforge, Gatehouse, Tidewheel) have no capsule system; P01/P03 economy tables apply to Arena levels only.
3. **Hero orb "space chapters [18,22,26]" baseline** is invented; space chapters use 24/30/36 (`difficulty.js`). 18/22/26 is Gatehouse/Bellforge, 16/20/24 is Rivals. Argon's "16/20/24 in space" would make space the fastest charger.
4. **Continue today**: 9 s ring that auto-declines at 0 (Argon calls this "forcing a menu kick"; correct), `lives = max(2, lives)` on continue (Argon assumes it restores 3). Retry semantics contradict the brief itself.
5. **Bell knock-back into Korr** is presented as new (P02, P06) but the bell already has a `returning` state.
6. **Sweet-spot gem pips** are presented as a fix, but castle renderer already draws three gem sockets and notes "no drawn outline".
7. **`isFullGameUnlocked` in localStorage** is proposed as new; `monetize.js` already uses `store.get('unlocked')`.
8. **Brick size**: P09 treats all bricks as 32x16; castle bricks are 36x18, Vault cells ~16x16.
9. **Dragon's Hoard grid**: 28x18 cells are narrower than the 32x16 minimum it cites; 2 cells = 56x18, not the quoted 64x16 Hush Chime; 2x2 = 56x36, not the 64x32 Sunstone; Ember's 4x3 cells = 112x54, not 128x64. P07's text says "2-cell side lanes", the maps have 1-cell lanes, and Floor 1's right lane is blocked by `h`/`g` in rows 3 and 4 (violates the open-side-lane rule).
10. **P04 layout** uses fixed y up to 692 with a 780 backdrop, but the world is 640 to 880 tall.
11. **P05 renames** Tidewheel's ANCHOR/STARFIRE as if they were errors; they are intentional chapter powers.
12. **P03 QUAKE 48x48 and PORTAL coordinates** assume a fixed grid/layout that varies by chapter.
13. **P06**: citations mismatched or generic, Holedown price inconsistent ($2.99 vs $3.99).
14. Every Argon "Rules check" is self-stamped OK; several are not (P07 side lane, P02 safety lip vs harder levels, P03 colour clashes vs readability).
