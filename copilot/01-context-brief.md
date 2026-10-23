# BREACH context brief (for Copilot)

Read this whole file before any BREACH task. It is everything you need; you cannot see the code and do not need to. Last checked against the game on 2026-10-23.

## 1. Your job and Claude's job

- **You (Copilot) design.** Level ideas, power-ups, difficulty numbers, characters, creatures, props, UI screens, image concepts, critiques of screenshots.
- **Claude builds.** Code (plain JavaScript, Canvas 2D), physics, Blender renders, packing art into the game, tests, the Android build.
- So write designs Claude can build without asking: numbers in game units and seconds, hex colours, tables, and the JSON block from the return format (`04-return-format.md`). Never write game code.

## 2. The game

BREACH is a premium portrait brick breaker for iOS and Android. Chunky glossy 3D toy look with big expressive faces. It must feel premium, instinctive, urgent and addictive: "one more run". References the owner likes: BALL x PIT (power stacking, juicy builds), Arkanoid crossed with Space Invaders (bricks that fight back).

Story: Prince **Kit** (knight, the paddle hero) breaks in; Princess **Lumi** breaks out ("Kit breaks in, Lumi breaks out"). Villains: **Zorvax** (smug mothership commander), **Gnash** (emerald serpent), **Mooncoil** (violet serpent), **Korr** (armoured boar), **Nerra** (crab queen), Clank robots. The kingdom is **Brickhaven**.

### The 11 chapters today

| # | Chapter | What happens |
|---|---|---|
| 1 | Carrier Breakout | Space. Break a carrier's panels to free crew before raiders extract them. Companions Nix (TITAN ball), Tick (rescue clamp). |
| 2 | The Vault | Gnash the serpent chews a path through a 20x20 brick grid toward caged Lumi. Break his route, hit his head. |
| 3 | Circuit Breakout | Space. Machine level with a closed exit iris. |
| 4 | Shutter Forge | Space. Forge with shutters and cannons. |
| 5 | Frost Warden | Ice rampart, a warden boss, arrows and bows. |
| 6 | Mooncoil Reliquary | Violet serpent plus Gnash; the two can clash. Falling counterweights. |
| 7 | Bellforge Run | Castle. Rolling bells on ramps, Korr as villain (HP 24/32/40). |
| 8 | Tidewheel Citadel | Nerra the crab hauls a chain; rising water threatens Lumi. |
| 9 | Gatehouse Siege | Three floors: drawbridge crash, murder holes and a bell, then a duel with Korr. The look standard for the whole game. |
| 10 | Lumi Breaks Out | Lumi is the player. Serpent windows, Lullaby, Starlight Notes, Song Shield. |
| 11 | Serpent Rivals | Gnash and Mooncoil from opposite walls, lure runes, clash chamber, Twin Seal. |

Chapter 12, **Dragon's Hoard** (heist and greed), is in progress, not in the menu yet. Its villain **Ember** the dragon is a comic villain: funny more than scary.

## 3. Shared systems and real numbers

- **World:** 360 units wide; height adapts (about 600 to 880). Test phones 393x852 and 412x915. Physics step 1/120 s. Collision follows the drawn art.
- **Ball:** radius about 6 to 8 units. Base speed 345 units/s, rally speed-up capped at 1.28x.
- **Paddle:** low on screen above a dark control deck, one-finger relative drag, above the thumb. Width differs: Vault, Mooncoil 70; Frost and castle chapters (7 to 11) 100 x 14; Carrier, Circuit, Forge 125 (17 to 29 high); arena default 74. **WIDE** (arena chapters) is x(1 + 0.55 per stacked level) for 12 s; **TINY** is x0.62 for 9 s.
- **Focus aim exists only in arena chapters (1 to 6).** Hold still as the ball lands, time slows to 0.25x, slide to aim, lift to fire. you start with 2 charges (max 3), +1 per 14 bricks or an AIM capsule.
- **Sweet-Spot Ram:** three centre-third paddle hits in a row arm it (three pips); the next centre hit launches a giant ball (radius 13.2) for 2.5 s or 14 bricks, 3 damage to a villain. It ploughs ordinary bricks only: armour (Gatehouse too), bars, pins and hulls bounce it. Vault, Mooncoil and Circuit: 1-HP bricks only; elsewhere any ordinary brick breaks on contact. Owner-approved.
- **Capsule power-ups:** SPLIT x3, BURST +3 balls, FIRE (8 s), WIDE, AIM (+1 Focus charge), LASER (7 s), SHIELD (two missed-ball saves), SLOW (8 s), TINY (bad). Drops are **authored, not random**: payload bricks (a few in Carrier, Circuit, Forge, Frost; Vault gold bricks in a fixed cycle; one per Mooncoil clash). Rivals clashes and Lumi's Starlight Notes (next 6 bricks) drop MULTI, RAM or WIDE. **Bellforge, Tidewheel and Gatehouse have no capsules.**
- **Hero powers** sit behind a face orb at lower-left. One charge meter fills from productive hits; when full the orb pulses "doop doop", glows and buzzes, and a short paused menu opens on tap. Per chapter (real names):
  - Vault, Frost: BRICK WARD, ARROWS, COSMIC (unstoppable ball), BALL FAN. Mooncoil: MOONBIND, CRYSTALS, COSMIC.
  - Bellforge: ECHO GUARD only. Tidewheel: ANCHOR, ARROWS, STARFIRE. Gatehouse: WARD only. Rivals: WARD, ARROWS.
  - Space companions (Carrier, Circuit, Forge): LASER, UNSTOPPABLE, 5 BALLS. Lumi: Lullaby (calms a serpent 4 s), Starlight Notes, Song Shield.
  - Hits to fill (Easy/Medium/Hard): space 24/30/36; Frost, Bellforge, Gatehouse 18/22/26; Lumi, Rivals 16/20/24; Tidewheel 12/15/18; Mooncoil 10/12/14; Vault 12 always.
- **Difficulty modes** (player picks in the menu; each chapter has its own numbers too):

| Shared value | Easy | Medium | Hard |
|---|---:|---:|---:|
| Max live balls from powers | 12 | 9 | 5 |
| Max cosmic balls at once | 2 | 2 | 1 |
| Max power timer (s) | 20 | 18 | 14 |
| Vault serpent speed multiplier | 0.6 | 0.8 | 1.0 |
| Carrier raider HP / extraction time (s) | 2 / 8 | 3 / 7.5 | 4 / 8.5 |
| Gatehouse villain HP / tell (s) / hazard interval (s) | 24 / 1.8 / 10 | 32 / 1.6 / 8.5 | 40 / 1.4 / 7.5 |

Caps: Vault, Mooncoil, Frost. Space chapters: balls 7/6/5, cosmic 1, timer 12/10/8. Bellforge: Gatehouse's HP and interval. Tidewheel: HP 24/32/40, interval 11/9.5/8.

- **Continue (placeholder money):** after a loss a "SO CLOSE!" card ("CONTINUE?" under 50% cleared) says what is left, e.g. "Korr has 3 HP left". An 8 s fuse drains; spent, it waits and only "No thanks" declines. Options: a 3 s placeholder rewarded ad (2 per attempt) or the one-time $2.99 "unlock full game" card, **hidden on the first lifetime loss**; unlocked, Continue is free. Continue keeps earned progress; Retry starts fresh.
- **Back in action:** the ball waits on the paddle and hazards hold until the serve. Lives restored to at least 1 (arena, Tidewheel) or 2 (Bellforge, Gatehouse, Lumi, Rivals), plus a 2-save shield (arena) or 3 s Ward (castle).
- **Floors:** a level can be three floors; clearing a floor plays a 1.2 s camera climb and carries bricks, villain and lives.

## 4. What the owner said after testing the latest APK (2026-10-23)

Power-ups and difficulty need a real rework. Earlier owner feedback still open:
- New power-ups, for example a giant unstoppable ball from the paddle sweet spot (now the Ram; can it feel bigger?).
- Harder levels; the continue screen above is the safety net.
- Smoother paddle above the thumb zone; a clear aim-hold hint.
- A single brick vanishes subtly (crack and fade about 0.4 s); only big crashes drop debris.
- Fiercer snake, nervous princess pacing, calmer darker space backgrounds.
- Roadmap: locked prince and sword unlockables, story mode, more mythical beasts (Zephyr the griffin, Grumble the golem: working names).

## 5. Rules that never break

**Feel:** premium, inventive, urgent, addictive; never generic or "vibe-coded". Harder but fair.

**Play:**
- Every hazard is telegraphed with a visible tell of 1.2 to 1.8 s and shown once safely before it can hurt.
- Ordinary ball play always makes progress. No precision puzzles, no tiny weak points (a required target is at least a 32x16 brick), no waiting on a timer or an invulnerable enemy.
- Enemy attacks never destroy the player's bricks to hand out free rewards.
- Difficulty changes numbers (HP, tell length, hazard interval, speed), never hidden attacks or removed ordinary damage.
- Pause and Continue keep earned progress; Retry starts fresh.
- No power-up, companion or purchase is required to win.
- Effects are rendered things (gems, chips, sparks, dust, debris), never plain drawn circles or rings.

**Look:**
- Glossy 3D vinyl-toy characters, glazed-ceramic bricks, chrome paddle and ball. Glaze v2 (M365's sheet) is the standard brick set (live in Vault, Frost, Lumi, Rivals); unhit 2-HP bricks wear a glass frame.
- Warm key light top-left, cool fill right, soft pink bounce from below.
- Chibi proportions, head about 40% of height; big eyes with lids, brows and a reshaping mouth; every character's faces differ.
- Backgrounds calm, dark navy, desaturated; never brighter than the ball.
- Very little yellow; gold is an accent only.
- Fonts: Lilita One for game text (dark outline plus drop shadow), Rubik for numbers.
- Rejected forever: pixel art, wisps, jittery foxes, ball-chain snake bodies, round blob heads, flat clip-art, uniform faces, a repeated long-armed creature template.

**Mobile:** nothing in the notch, status bar or home-indicator areas; touch targets at least 44 pt; paddle above the thumb.

**Already exist, don't propose as new:** bell knock-back (Gatehouse bells fly back up toward Korr); three Ram pips; the full-game unlock flag; paddle skins (Kit's blue enamel, Lumi's rose pearl); the power-ready pulse; the so-close continue card.

## 6. Palette (hex)

| Use | Hex |
|---|---|
| Background gradient | #22284A to #141831 to #0A0C18, vignette, light film grain |
| Lights | warm key #FFDBB8 top-left, cool fill #8CA6FF right, pink bounce #FF80A6 below |
| Bricks | sun #FFC73D, coral #FF6F61, violet #8F5CF0, teal #22C4B0, blue #4F9DFF, gold gem #F4C542, granite (indestructible) #4A4F6E |
| Gnash (emerald serpent) | body #168F83, belly #C9E8D2, crown #0B5D59, outline #052D31 |
| Mooncoil (violet serpent) | purple #7A3CCC, peach belly #FFC49A, rose diamonds #FF6FAE, outline #1E0A40 |
| Power capsules | SPLIT #5CCF6A, FIRE #FF8A3D, WIDE #3FA8F5, AIM #C46BF0, BURST #F7C948, LASER #FF4D6D, SHIELD #2EC4B6, SLOW #7FD6FF, TINY #5A5F78 |
| UI states | danger #FF4D5E, success #7BD88F, AIM lilac #E3B6FF, combo text #FFD36B |

New colours are fine in the same family; always state them as hex and say where they are used.
