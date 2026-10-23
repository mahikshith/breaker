# DIGEST: M365 Copilot drops, 2026-10-23 (BREACH)

Read: 7 docs in `m365/`, plus the Dragon kit README, level json, `src/sim.js`, `tests/bot_report_human_40runs.txt`. HTML/render.js ignored.
Compared against branch `codex/castle-chapters` (src/fantasy/ram.js, kit.js, difficulty.js, monetize.js, chapter.js, main.js, gfx.js), `design/phase2/dragons-hoard.md`, `docs/BACKLOG.md`, `docs/STORY_PLAN.md`, style bible, and `copilot/01-context-brief.md`.
Verdicts: BUILD NOW / LATER / SKIP. Judged on fun, urgency, stickiness, engine feasibility, fit with what exists. Repo untouched.

Two things to know before reading:
- `powerups-round2` is TWO answers pasted into one file (Opus 5.5 "Build Stack", then GPT "Bounded Builds"). They disagree on most numbers (see doc 1). The JSON block at the bottom is GPT's. `sim.js` implements Opus's.
- `assets/glaze2/` (52 PNGs, atlas.json, source "M365 Copilot glaze v2 sheet") and `art/glaze2/` are already in our working tree, untracked, so someone is already importing the brick sheet. It includes coin, chest, gold and granite bricks.

---------------------------------------------------------------------
## 1. powerups-round2 (Opus "Build Stack" + GPT "Bounded Builds")

Ideas and numbers (Opus / GPT where they differ):
- Drops in all 11 chapters via one shared manager. Chance per breakable brick 0.16 / 0.12 / 0.09 (E/M/H). Pity guaranteed good capsule after 8 / 10 / 12 dry breaks. Max falling 2/2/1, min gap 1.2 s, fall speed 110, spawn at least 180 above paddle (GPT). TINY never counts as pity. Duel floors with few bricks: villain-hit drops 0.25/0.2/0.15 (Opus) or a drop per 6/8/10 boss contacts, min 4 s apart (GPT).
- Build tray with levels. Opus: 3/3/2 slots, Lv1-3 (Hard Lv2), repeat catch = +1 Lv, timer cap 20/18/14, 8 named combos plus SAFE HARBOUR, drop chance x0.6 once two powers are Lv3 and x1.25 on an empty tray. GPT: 3 timed slots in every mode, max Lv2, repeat catch adds half the base duration, replace the shortest-remaining power when full, NO hidden drop penalties (bounded by caps instead).
- Per-power numbers (Opus): FIRE pierce limit 4 per paddle return (Hard 3), duration 8/7/6 s; WIDE 100 to 128/148/165; LASER 2 bolts per 0.5 s; SHIELD 2/2/1 saves; TINY 72/68/64 and Ram arms in 2. GPT: FIRE 2 brick dmg, shared 4-contact pierce budget (6 at Lv2); WIDE 128/148; LASER 0.65/0.5 s, bolt speed 520, 8 live bolts max, shared boss cap 2 HP/s.
- Rework SLOW to BUBBLE over the paddle, 0.55-0.65x (Opus), or a 120-unit lower-lane slow, 0.75x/0.65x (GPT). Rework AIM to SIGHT (13 dots, longer Focus hold 1.2 to 2.0 s). BURST becomes 3 balls along the Focus aim (Opus) or fixed -18/0/+18 degrees (GPT). SPLIT stays.
- Ram upsize: radius 13.2 to 22/20/18 (Opus) or 20 flat (GPT). Speed 400 (Opus) or unchanged (GPT). Time 3.2/3.0/2.6 s vs 3.0/2.7/2.4. Bricks 24/20/16 vs pierce contacts 12/10/8. Villain damage 5/5/4 vs 4. Breaks any brick of 3 HP or less on contact; centre zone fixed at 33-34 wide even with WIDE.
- Hero powers: full-width BRICK WARD (8 s) vs 3-4 s intercept of 2 projectiles; ARROWS 6 at the 6 lowest bricks; COSMIC arms the Ram at Lv2 size (Opus) or one 16-radius ball with 8 pierce contacts (GPT); BALL FAN 5 balls at 70 degrees; Starlight Notes capped to 6 (Opus) or 3 (GPT).
- Readability: 0.04 s hitstop per catch, icon flies to its slot, last 1.5 s blink and 3 rising ticks (Opus) vs ticks at 1.5/1.0/0.5 s and no hitstop (GPT). "HOLD TO AIM" ghost-thumb hint: first 2 balls of chapter 1, or after 30 s with no Focus; stops after 3 good Focus shots.
- Hero charge: Opus brick 1, villain hit 2, Ram/FIRE pierce 0.5. GPT only ordinary-ball brick damage (once per brick per return) or a boss contact (max 1/s); secondary effects give 0.

Verdicts:
- BUILD NOW: shared drop manager with pity, caps, min gap, in Bellforge/Tidewheel/Gatehouse first. These three have no brick drops in code; only Arena-based levels have them. Cheap, fixes the "no power state" complaint. Use the GPT rule: no hidden chance penalties.
- BUILD NOW: visible power state. A small timer strip per active power above the control deck (non-interactive, 22-26 units) plus the last-1.5 s blink. Addresses critique #5. Skip the Lv pips until stacking lands.
- BUILD NOW: "HOLD TO AIM" coach. It is our backlog's recommended-5 item, and today it is a one-second "Aim ready" text.
- BUILD NOW (our numbers): Ram radius up to about 18-20 with a 3-HP-or-less rule. See factual error #1: whether it is needed depends on the level. Keep time/brick caps so it doesn't undo the "harder" goal; Hard 18.
- LATER: full build tray, levels and the 9 combos. The levels have different model classes (Arena, Carrier, Frost, FantasyChapter...) with different power sets, so a shared tray is a multi-week refactor. Prefer GPT's conservative version (max Lv2, shared pierce budget, boss damage caps) over Opus's Lv3 + x0.6 drop penalty. Pilot 3 combos only: FIRESTORM, RAMPART, METEOR.
- LATER: SIGHT/BUBBLE reworks. Fine ideas, but BUBBLE and the lane slow are two different designs; pick one after a phone test.
- LATER: BURST along Focus aim (nice skill hook) and the hero-power rebalance. The code already has a per-chapter hero menu (see error #4); don't pave over it.
- SKIP: hero charge point values (existing 24/30/36 productive-hit rule works); x0.6/x1.25 drop scaling (hidden, opaque); the Opus "COSMIC arms Ram" (would delete a working power).
- Duplicates: Ram, hero orb and charge, TINY, aim dots already exist. Contradiction: our `kit.js` ready pulse uses a pink glow halo plus a ring, which the same drops (critique #9) call a rule break. See doc 7.

---------------------------------------------------------------------
## 2. difficulty-round2 v2 ("The board fights back")

- Per-chapter targets (first-try win E/M/H, run minutes): 1: .95/.80/.50, 2-3 min; 2: .90/.65/.40; 3: .92/.75/.45 (breather); 4: .88/.60/.30; 5 Frost Warden: .85/.45/.20 (first real wall, Continue appears); 6: .85/.50/.25; 7: .88/.55/.25 (breather); 8: .85/.45/.20; 9 Gatehouse: .80/.35/.15 (second wall); 10: .85/.55/.25 (breather); 11: .80/.30/.12 (finale, 3.5/5/6 min).
- Ball speed 330/345/370 (Hard up 25 over today's 345; rally cap stays 1.28x). Tell 1.8/1.6/1.4 s everywhere (1.8/1.7/1.5 in ch 11). Villain HP and hazard intervals re-tabled per chapter, e.g. Bellforge HP 24/32/40 to 26/36/48, interval 10/8.5/7.5 to 9.5/8/6.5. Brick counts rise (Bellforge 24 to 52/62/72, Gatehouse 70/84/96). Only Bellforge's old numbers were known to the author; the rest are "proposed" with no code baseline.
- The March: whole formation steps down 18 units every `marchStep_s` (Medium 8-12 s; Easy x1.4, Hard x0.77), 1.4 s shudder tell, danger line 120 above the paddle, start 8 steps away (untouched run 60-96 s Medium). Push-back: 6 bricks in 4 s halts it 3 s; a villain hit lifts 1 step (max once per 3 s); a cleared row lifts 1. Reaching the line costs a life and lifts the formation 3 steps.
- Rage on duel floors: +1 stage per 30/22/16 s, up to 3, each stage -10% hazard interval, 3 villain hits in 5 s drop a stage. Shown on the face only.
- Fairness rules: first showing of each hazard is harmless; no hazard or march step within 0.6 s of a paddle return; stagger overlapping hazards 2 s; nudge a trapped ball after 8 s; TINY not spawned within 3 s of a tell. Free first lost ball with 2 s shield on Easy and Medium. First danger-line hit free on Easy and Medium.
- Continue: 2 ad continues, restores 1 life + 2 s shield, lifts 3 steps, keeps HP/bricks/floor. Copy "So close! Korr has 3 HP left."
- Lumi fear stages follow distance to the danger line (calm at 6+ steps, pacing 4, scared 2, panic 1) in chapters 2, 6, 8, 10, 11.
- Test plan: 200 runs per chapter per mode; median-skill bot (aim error 10 units, reaction 0.25 s) plus a zero-power bot that must win Easy at 0.70 or more.

Verdicts:
- BUILD NOW: the target curve (breathers at 3, 7, 10, walls at 5 and 9, finale 11). It matches the owner's "players actually die, continue is the safety net" and backlog item 2. Use it as a target, not as validated numbers.
- BUILD NOW: the tell/spacing fairness rules as audit checks in our deterministic sweep (first hazard harmless, 0.6 s window, 8 s trapped nudge).
- BUILD NOW: the March, as one shared module, for Hoard plus space chapters 1, 3, 4 first (they have no board pressure beyond raiders/iris). Reuse `src/invasion.js` march code (legacy but exists). Dedicated urgency, no HUD. Medium 9-12 s/step.
- LATER: March for 5, 6, 9, 10, 11. Frost needs its own level/art drop first. Do not stack it on levels that already have a pressure clock: Bellforge has Lumi's cage lowering per mistake (`lumi.steps`), Tidewheel has rising water, Vault has Gnash chewing, Carrier has extraction. For those, use Lumi fear stages and tighter existing numbers only.
- LATER: rage stages (face-driven escalation) once Ember's face art is wired; Gatehouse floor 3 Korr is the pilot.
- BUILD NOW (Hard only): Hard ball speed 370. Verify by the sweep; a 7% jump is cheap.
- SKIP / Easy-only: free first lost ball and free first danger-line hit on Medium. Two freebies on Medium fight the owner's wish that players lose; keep them on Easy.
- BUILD NOW: Carrier Hard extraction fix. The drop is right: `difficulty.js` has extractSeconds 8 / 7.5 / 8.5, so Hard is slower than Medium. Set Hard to 6.5 or so.
- Duplicate: Heat streak (backlog 3) and the March overlap in "urgency"; do March first, it has more design behind it.

---------------------------------------------------------------------
## 3. level: Dragon's Hoard (chapter 12)

- Pitch: Kit sneaks into the cave, steals the Brickhaven Crown while Ember sleeps. Heist; Kit alone; Lumi only in the ending wearing the crown.
- Greed counter, no HUD bar: coin brick +1, chest +2; wake threshold 12/10/8. Ember's body shows it: 0-3 asleep (snore smoke), 4-6 one ice-blue eye tracking the ball (March x0.9), 7+ head up, copper nostrils, growl every 4 s (March x0.8). At the threshold: Hoard Roar, greed resets to 4. Every 6 non-gold bricks lower greed by 1. Gold also gives drop chance x2, hero charge +3, score 50 (chest 150, guaranteed good capsule).
- Floors: 1) Sleeping Hoard, 44 bricks (6 gold), 25-35 s; 2) Coin Falls, 45 breakable plus 4 granite pillars, avalanche every 12/10/8 s, 30-40 s; 3) Ember's Bed duel, 24 bricks + Ember, 30-40 s. Greed at the end of floor 2 sets Ember's starting rage (0-3 stage 0, 4-6 stage 1, 7+ stage 2). Third star: never wake Ember on floors 1-2.
- Hazards: Hoard Roar (tell 1.8/1.6/1.4 s, 72-wide scorch stripe under the paddle, paddle x0.75 width for 3 s, breaks no bricks); coin avalanche (tell 1.6/1.4/1.2 s, 8 deflecting coin chips for 1.2 s, paddle drag x0.7; break the armour brick by the chute to close it for 15 s); Wing Gust (tell 1.8/1.5/1.3 s, balls pushed sideways 90 u/s for 0.8 s; answer with Focus). First showings harmless.
- Ember hit targets: head 56x36 1 dmg (always); belly 72x40 2 dmg, exposed 2.5 s after each breath; Ram 5. HP 30/42/56. Run 3.5/4.5/5.5 min, first-try win .80/.35/.15.
- Grids are 10-column maps with the legend (coral/violet/teal/blue 1 HP, gold g, chest G 2 HP, armour a, granite #). Gold is about 13% of bricks.

Verdicts:
- BUILD NOW: the greed mechanic. A visible risk/reward tied to the villain's face, no HUD, an obvious replay hook (greedy route vs 3rd star). It is the strongest new gameplay idea across all seven docs. It reuses our "eye slowly opening" concept from `design/phase2/dragons-hoard.md` but replaces the noise meter with opt-in gold, which is clearer to the player (they choose what to hit).
- BUILD NOW: the 3-floor structure and numbers as chapter 12 behind FantasyChapter (follow `gatehouse.js`, `tests/gatehouse.test.js`). 117 bricks and 3.5-5.5 min is a sensible length.
- BUILD NOW: hazard set (roar, avalanche, gust) plus the 3-touch coin-chip rule, with physics audit adapters. Chip and gust physics are the risk.
- LATER: rage stages and carry-over until the March exists.
- CONFLICTS with our own design (decide before building):
  - Treasure: Crown (M365) vs Sunstone (ours).
  - Dragon: Ember male, vain/greedy/cowardly (M365) vs "her", grumpy, half-asleep (ours). Backlog and brief already use "Ember" as the working name, so use M365's; our STORY_PLAN's Ember is a freed companion (sets the ball on fire every 8th hit), so Ember as chapter-12 villain should be softened into an ally after defeat if we want both.
  - Our "push-your-luck exit" (bank loot by escaping, x1.5 then x2 multiplier) and the third "escape" floor are dropped by M365. Cheap to keep as a post-duel bonus ("one more raid for double coin") but not needed.
  - Scale: ours is "about 200 coin bricks, the largest level"; M365's is 117.
  - Ours lists a 6-hit claw-of-gold floor; M365's has none.
- Verify: Kit's sim.js numbers diverge from the drop (see doc 8); gold at 13% of bricks is near the "yellow small accent only" rule, keep gold bricks under 15% like the sun brick.

---------------------------------------------------------------------
## 4. character: Ember

- Design A "Vain Hoarder": pear-bodied, upright, 2 heads tall, swept-back bone horns, small wings, tail coiled; graphite-indigo scales #2B2F4A, copper belly plates #E8743B (weak point), ice-blue slit eyes #8FE3FF, bone horns #D9CBB8, tiny lopsided coin crown (gold accent only).
- 8 expressions (idle, taunt, windup, attack, hurt, stagger, panic below 25% HP, defeat); 6 poses (sleep-coil 2.4 s loop, peek-lift 1.6 s, breath-windup 1.6 s, wing-raise 1.5 s, belly-pant 2.5 s, defeat-flop 1.2 s).
- 14 separate parts (jaw, head-neck, 2 wings, 3 tail segments, arms, eyelids, brows, belly plates) for animating in code.
- Duel height 112 units (sleeping version 64); collision as circles on the drawn art: head 3 circles (r 12, 11, 9), belly 2 x r 18, horns 2 x r 6 each (bounce), wings 3 each (solid only when raised), tail 6.
- Colour distinct from Gnash (emerald), Mooncoil (violet), Korr/Nerra (red/orange); silhouette tall/top-heavy vs long lines and Korr low/wide.

Verdicts:
- BUILD NOW: Ember is the best character in the drops and fits the style bible (glossy vinyl, big expressive faces, head ~40%, distinct silhouette). The kit has ember_body/ember_faces atlases ready.
- BUILD NOW: parts-based rig for jaw/head/wings/lids plus pre-rendered frames for the defeat flop (the drop's own recommendation).
- BUILD NOW: expression to game-moment map (stagger = belly open, panic below 25%) as the readable tell, the owner's "greed is shown on his face" idea.
- LATER: 112-unit duel size check against HUD safe area (drop suggests fallback 100).
- SKIP: reuse the rig for Zephyr and Grumble (drop itself says no).
- Check: belly "armoured otherwise" bounces and does 0 dmg; the head is always hittable, so we pass the "never invulnerable, no tiny weak points" rules.

---------------------------------------------------------------------
## 5. asset sheet: bricks-glaze-v2

- Glazed brick built in 32x16 units: radius 2.5, vertical gradient +10% / -18%, highlight band 3 units tall at 55% white fading to 0, 1-unit clear-coat rim top-left and cool rim right, 1-unit dark separator #0A0C18 at 60%.
- Glint: four-point star 4x4 units, one random brick every 0.8 s, 0.35 s long (never a circle or ring).
- States: intact; cracked (2-3 pale crack lines, drawn in 0.08 s, brick nudges 1 unit); breaking (3 shards, scale 1 to 0.94 and fade over 0.4 s, 3-5 chips fall 12 units, no debris piles); 2-HP shows a clear shell over a darker core, the first hit shatters the shell into 4 chips and leaves a normal 1-HP brick; granite = rough stone, 4 iron studs, no glaze, hit flashes 0.06 s.
- Palette: sun, coral, violet, teal, blue plus gold gem and granite, with body/highlight/shade hex for each. Sun brick max 15% of any board. Author at 4x (128x64).
- Open items: bake the band, draw the glint in code; replace #8D97B3 armour with the 2-HP shell version; Gatehouse brick-red, cream and sage need the same treatment.

Verdicts:
- BUILD NOW: all of it. It directly serves the owner's "shinier bricks" ask (backlog 3), "grey bricks look indestructible" (critique #14), "single bricks vanish quietly" (0.4 s crack and fade) and it is already half-imported at `assets/glaze2/`.
- BUILD NOW: the 2-HP shell/core read and granite-studs as the standard for breakable vs indestructible by material.
- BUILD NOW: glint in code (one star at a time, cheap on mobile). Watch art-pack size (backlog: 16 MB-class HTML bundle).
- LATER: re-run for Gatehouse's 3 colours.
- Duplicate: our premium-pass commit already glazed Vault/Invasion and ceramic Bellforge bricks; this replaces rather than adds.

---------------------------------------------------------------------
## 6. character: kit-unlockables

- 4 paddle skins: Starforged (clear chapters 1, 3, 4 on any mode), Serpentscale (3 stars on The Vault, Mooncoil, Serpent Rivals), Tidewrought (clear Tidewheel on Hard), Hoardbreaker (Hoard third star).
- 4 swords: Brickhaven Blade (10 stars total), Gatebreaker (beat Korr in Gatehouse on Hard), Lullaby Edge (3 stars on Lumi Breaks Out), Wyrmfang (beat Ember on Hard).
- Cosmetic only, never sold, not part of the $2.99 unlock. Skins keep the 100x14 hit shape and the 34-unit chrome centre panel with Ram pips. Swords show in the face orb, victory screen (scale 0.9 to 1, 0.25 s) and a 0.3 s steel swing on Ram launch.
- Unlock card after results: item spins 360 degrees over 0.8 s, EQUIP (44 pt) and Later; locked items are dark silhouettes with the condition in one line. Armoury tab on the main menu; skins and swords mix freely.

Verdicts:
- BUILD NOW (small): Hoardbreaker + 1-2 skins, using the existing 3-slice paddle skin system (`assets/paddle-skins/` l/m/r) and the existing 0-3 stars per chapter per difficulty (`bestByDifficulty`, so Hard-only conditions are checkable). Skip the sword render for now.
- LATER: swords, orb overlay, Ram flourish, Armoury tab, unlock card. Needs art (there is no sword art or code at all today).
- LATER: all-chapter skin set, once more chapters have 3 stars to earn.
- CONFLICT: "never sold" vs the owner's "monetization-ready (unlockables)" and our backlog (Shine currency, skins and boosters store). Keep earn-by-play as the default, but design the Armoury so a Shine purchase can also unlock a skin (cosmetic only, no pay-to-win).
- CONFLICT (minor): our backlog expects a locked prince and sword teaser; this drop fits it, but Kit is already the prince, so a locked-silhouette teaser is the right first rung.
- Check: Serpentscale's two-colour paddle must keep the chrome centre panel.

---------------------------------------------------------------------
## 7. critique: APK, 5 screenshots

- Characters (Korr, Nerra, Lumi, orb) are the strongest thing; backgrounds and UI chrome make it feel cheap.
- High: castle backgrounds too bright and warm (torches, candles, mirror floor, Bellforge/Gatehouse); repaint navy #22284A to #0A0C18, matte floor, about 55% darker under the playfield.
- High: Korr stands on a flat ellipse with two gold-outlined circles; replace with a rendered gunmetal siege platform (160x40).
- High: HUD sits in the status-bar band; move below the inset (top 59 pt + 8).
- High: no visible urgency, no power state, no charge on the orb. Menu is congested (difficulty before chapter, themes mixed, numbering 1,2,3,V,F,6...).
- Medium: yellow/gold dominates props and titles (title gradient coral to violet); countdown ring on the continue screen; flat ring on the face orb; flat line icons in the Armoury; "No balls remaining" says nothing; "No thanks" link under 44 pt; only 24 small flat bricks; grey armour reads as indestructible.
- Keep: Korr/Nerra quality, scared Kit orb on the continue screen, Lumi cage on chains, continue panel structure, FLOOR 3/3 pill and boss HP bar, even brick grid, chrome ball and paddle, three aim dots, Nerra's flooded hall darkness.
- Decisions: A repaint a calm hall (one hall, 3 lighting variants) vs B darken in code 60%; A two-step menu (theme split, chapter list, difficulty on the chapter card and in pause).
- Open questions: dots = Ram pips; is Bellforge's villain Korr?; remove "Full screen" button in the app build.

Verdicts:
- BUILD NOW: darken castle backgrounds. Use decision B (darken in code about 55-60%) as the quick fix, then repaint (A) later. This is the cheapest premium gain.
- BUILD NOW: replace the continue ring with a rendered hourglass or segment-chip dial; "No thanks" as a 44 pt pill; "So close! X has N HP left" with portrait. Monetization and urgency in one S/M change (see error #6 about per-level wording).
- BUILD NOW: HUD below the safe-area inset (check first; `main.js` has `inT/inB/LIFT`, so the APK screens may be older than the branch).
- BUILD NOW: replace the Korr platform circles, orb pink ring, and the READY pulse halo/ring in `kit.js` with rendered bezels. Our own pulse (owner-approved "doop doop" timing) must keep timing but lose the ring look.
- LATER: theme-split menu redesign (L, own drop), the calm hall repaint (needs art), gunmetal props instead of brass.
- SKIP: renaming the Armoury powers to the brief names. The code names (ECHO GUARD, WARD, ANCHOR, ARROWS, STARFIRE) are the real ones (error #4); fix the brief, not the game.
- Answer to Q2: the menu text does say "Break Korr's armour" for Bellforge and "Korr holds the gate" for Gatehouse, so the Korr overlap is real.

---------------------------------------------------------------------
## 8. Dragon kit (README, level json, sim.js, bot report)

- Playable sim, world 360x780, 120 Hz fixed step, swept circle-vs-box collision; every number from the drops; atlases for bricks, Ember body, Ember faces, hoard fx; level json holds brick coordinates, Ember's collision circles and per-mode numbers.
- sim.js diverges from the written level drop: Ember HP 30/36/44 (drop: 30/42/56); duel changed to head 2 dmg, belly 4, "crust" 1, belly window 3 s (drop: 1 / 2 / 0 / 2.5 s); the file labels this a "v2 proposal from bot test". Damage was raised, so the fight is shorter, not tougher.
- Known gaps in the kit: cave background not rendered (gradient stand-in), no Kit orb art, capsules/HUD drawn in code.

Bot report (40 runs per mode, "human" profile: aim error 14 units, reaction 0.3 s, 7% lapse):

| Mode | First-try win | Target | Median min | Target min | With continues | Ember wakes/run |
|---|---|---|---|---|---|---|
| Easy | 1.00 | 0.80 | 1.4 | 3.5 | 1.00 | 0.00 |
| Medium | 0.90 | 0.35 | 2.45 | 4.5 | 1.00 | 0.07 |
| Hard | 0.47 | 0.15 | 4.0 | 5.5 | 0.88 | 0.45 |

- The kit fails its own tests in every mode ("TUNING FLAGS" on all six checks): far too easy and too short. Medium is 55 points above target.
- Every run ended on floor 3 (40/40 in every mode); no run ever died on floors 1-2. Floors 1-2 take about 22-35 s each and are a free pass; all difficulty lives in the duel (20 s Easy, 72 s Medium, 145 s Hard).
- Wakes are near zero on Easy and Medium, so greed never bites and the "third star" is nearly automatic; the bot has no deliberate greedy profile, so the greed idea is untested.
- Capsules caught per run 10.15 (Easy and Medium identical, suspicious: same seeds). Most combos seen are defensive (RAMPART, SAFE HARBOUR, QUAD GUNS): stacking makes it easier, which is the opposite of the owner's goal.
- All tells in range (1.2-1.8 s), no cap exceeded, about 1.4-1.9 nudges per run (anti-trap fires often, which hints at ball-trap geometry on floor 2).
- Takeaway: do not trust the difficulty-drop win rates as validated. They are targets that the author's own prototype misses by a wide margin. Use our deterministic sweep with a skill profile and a greedy and a careful profile.

Verdicts:
- BUILD NOW: use `sim.js` as the spec for chapter 12 (greed counting, hazard spacing, swept collision for Ember circles, march/continue logic) and the level json for brick coordinates. Port into our Model class contract, not the HTML.
- BUILD NOW: add the nudge/trap stat to our physics audit for floor 2 granite pillars.
- LATER: take the bot's profile idea (human/perfect + zero-power + greedy) for the whole game's difficulty pass.
- SKIP: the prototype's capsule/HUD drawing and its numbers as final.

---------------------------------------------------------------------
## Top 8 ideas, ranked

1. Glaze-v2 bricks with 2-HP shell/core, granite studs, 0.4 s crack-and-fade, glint sweep (owner loves; half-imported already; fixes three critique items).
2. Ember (Vain Hoarder), parts rig, expressions mapped to greed/attack/stagger (owner loves; great silhouette).
3. Dragon's Hoard greed (gold bricks wake Ember, eye/posture readout, 3rd star = never woke him, floor 2 greed carries into duel).
4. Continue upgrade: "So close! X has N HP left" + portrait, segment-chip dial instead of the ring, 44 pt pill, lift/shield on continue.
5. The March (shared module; Hoard + Carrier, Circuit, Forge first; 1.4 s tell, push-back on combo/villain hit/row clear).
6. Drops in every chapter with pity (8/10/12) plus a visible power timer strip (not the full tray yet).
7. Ram upsize (radius 18-20, 3-HP-or-less break rule) tuned so Hard stays hard, plus the "HOLD TO AIM" coach.
8. Star-gated unlockables (Hoardbreaker plus 1-2 skins first; swords and Armoury later), with an optional Shine purchase path.

Honourable mentions (cheap): darken castle backgrounds in code, HUD below the safe area, remove ring/halo from the orb and READY pulse, Carrier Hard extraction fix, per-chapter win-rate target curve.

---------------------------------------------------------------------
## Factual errors the drops make about our game

1. Ram "ploughs 1-HP bricks only" (powerups, Today column): true only for Vault (`HP[cell]===1`) and Relay (`maxHP===1`). Tidewheel pierces any `kind==='brick'`; Arena levels pierce any non-`unpierceable` cell; Orbital excludes only armour; and a pierced brick is forced to 1 HP and broken in one contact, so multi-HP bricks die too. "The big ball doesn't break bricks" is level-specific (or a feel/bug), not a global mechanic.
2. "Drops are missing in chapters 6 to 11": mostly right for Bellforge, Tidewheel, Gatehouse (no capsule code), but Mooncoil (6) mentions capsule drops from the serpent clash, Lumi (10) only has Starlight Note capsules, and Rivals (11) defines clash capsule kinds (multi, ram, wide). Confirm before treating all six as "none".
3. Context brief vs code on Kit's hero powers: the drops assume every Kit chapter has BRICK WARD, ARROWS, COSMIC, BALL FAN. Real: Bellforge has ECHO GUARD only; Tidewheel has ANCHOR, ARROWS, STARFIRE; Gatehouse has WARD only; Rivals has WARD and ARROWS. BALL FAN is a space companion (`space-companions.js`). The critique calls these names a bug; they are the actual names.
4. Retry vs Continue: the drops' Rules check says "Pause/Continue/Retry keep progress" and the difficulty doc says "Retry starts fresh". Our brief says Continue keeps progress, Retry starts fresh (the GPT section noticed and flagged the conflict).
5. Continue copy "Korr has 3 HP left": only works where there is a villain HP (Frost, Bellforge, Gatehouse, Tidewheel, Rivals). Carrier, Vault, Circuit and Forge need a different near-miss line (crew left, Gnash route length, core HP).
6. Hero charge: Opus invents point values (villain hit 2, Ram 0.5); our model is "productive hits", 24/30/36 fixed.
7. Difficulty doc proposes Gnash "advancing one cell per step" in the Vault; our Vault already has Gnash chewing a route (`vaultSpeed` .6/.8/1.0), so that is existing behaviour; add nothing there.
8. Menu numbering "1,2,3,V,F,6,7,8" (critique #6): the build at HEAD has 11 clean entries in `LEVELS`; the screenshot is from the older APK (the delivered APK is the five-chapter build per backlog). Re-check against the new APK before spending time on it.
9. Hoard drop assumes "March from difficulty-round2" and "build tray" are locked/reuse items; neither exists in code. The level is not buildable as written until one of them exists (or the Hoard ships with its own local march).
10. Minor: STORY_PLAN's Ember is a freed companion; our `design/phase2/dragons-hoard.md` dragon is female with a Sunstone and noise meter. The drop treats those as non-existent.

Not an error: chapter count (11) and names/order in the drops match `LEVELS`; Carrier Hard extraction 8.5 > 7.5 (a real inconsistency in `difficulty.js`); Bellforge's 24/32/40 and 10/8.5/7.5 are correct; Vault speeds .6/.8/1.0, hero charge 24/30/36, caps 12/9/5, cosmic 2/2/1, timer 20/18/14 and 2 ad continues all match.
