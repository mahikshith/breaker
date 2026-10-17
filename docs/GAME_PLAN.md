# BREACH — Game Design Plan (v0.1, draft for review)

> Working title: **BREACH**. A premium brick breaker where every level is a rescue against the clock.
> Status: phase 1 (research, plan, first screen drafts). Nothing is built yet; this document is what we review before building.

---

## 1. The one-line pitch

**Carve an escape tunnel through a living mosaic of thousands of micro-bricks to free a trapped creature before the threat reaches it, then watch the whole structure collapse.**

Three feelings we sell, in order:

1. **Urgency** — something is coming for the creature you are trying to save, and you can see it move.
2. **Skill under pressure** — threading a ball into a narrow channel is a deliberate, learnable shot, not luck.
3. **Catharsis** — once you breach, balls multiply, chunks of the structure break off and crash down, and thousands of tiles explode in seconds.

---

## 2. What the reference clips get right (your screenshots)

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

## 3. Market: what premium and top-grossing brick breakers look like

### 3.1 The landscape

| Segment | Examples | Model | What works | Gap we exploit |
|---|---|---|---|---|
| Classic paddle arcade | Arkanoid, Wizorb, Shatter, Super Brick Breaker, Real Brick Breaker | Premium or ads | Tight feel, power-up variety | Visually dated, no stakes, no reason to hurry |
| Swipe-aim "balls vs blocks" | Ballz (Ketchapp), Bricks n Balls, Bricks Breaker Quest | Hyper-casual, ads-first | One-thumb, short sessions, ball chain growth | Turn-based (no real-time skill), players hate the ad load (Ballz reviews: "excessive and intrusive advertising") |
| Roguelite brick breaker | **Ball x Pit** (Devolver, 2025; iPhone since Mar 2026) | Free to try, €17.99 unlock | Ball fusion, builds, 2M+ copies sold by Aug 2026 | Long roguelite runs, not a quick phone session; proves players *pay* for an evolved brick breaker |
| Pinball / brick RPG | World Flipper ($71M lifetime), PunBall ($39M) | Gacha, IAP | Deep meta | Revenue spikes and crashes; heavy monetization |
| Viral clip format | Brickmania, Many Bricks Breaker videos | Video content | Satisfying micro-brick erosion | Not a playable game with goals |

Market data (Sensor Tower via GameDev Reports, 2012–2023 pinball and brick breaker): 948M downloads, $296M IAP revenue. Hyper-casual took 62% of downloads but only 8% of revenue; **hybrid-casual took 28% of downloads and 63% of revenue**. Leaders hold D1 retention of 38–54%, and Bricks Breaker Quest reaches about 10% at D60 with 86% organic traffic. The genre retains well; it lacks a premium, fresh hook.

**Positioning:** "Ball x Pit proved people pay for a brick breaker that feels new. BREACH is the premium, one-thumb, phone-first version, built around the most-watched brick-breaker moment on the internet."

### 3.1b Competitor details (App Store, checked 2026-10-17)

| Game | Model | Online / offline | Multiplayer | Update cadence and what changes |
|---|---|---|---|---|
| **BALL x PIT** (Kenny Sun, Devolver) | Free to try, full game €17.99 one-time unlock; no microtransactions. 4.8★ (290). Came to iPhone Mar 2026. | Not stated; single-player runs | Game Center leaderboards and achievements; no online multiplayer listed | Big free content drops about every 3 months (Regal Jan, Shadow Apr, Naturalist Aug 2026): new characters, 10+ balls, buildings, passives. Bug-fix patches between. |
| **Arkanoid vs Space Invaders+** (Taito) | Apple Arcade (subscription, no ads or IAP). 3.3★ (31). | Not stated | Game Center leaderboards, 2 ranking modes | 5 updates since Sep 2024, all fixes and language support; no new content. |
| **Ballz** (Ketchapp) | Free, ads, IAP (remove ads $2.99–$5.99, lives, rings). 4.3★ (71K). | Cloud save | Trophy Hunt leagues (Iron to Diamond), Game Center, friend challenges | Roughly monthly. 3.0 (Sep 2025) reworked UI, added haptics, a danger overlay and cloud save; Trophy Hunt leagues added Feb 2026. |
| **Bricks n Balls** (PeopleFun) | Free, heavy ads, ruby IAP $0.99–$29.99, remove ads $2.99. 4.2★ (78K). | Not stated | Tournaments | Every 2–6 weeks, nearly all "performance improvements"; dropped subscriptions in 2024; occasional level rebalancing. |
| **Bricks Breaker Quest** (Mobirix) | Free, ads, ruby IAP up to $99.99, weekly sub $9.99. 4.3★ (18K). | **Plays offline** | "Multi-play", Game Center, live events (Neon Burst) | Every 3–6 weeks, "minor issues fixed"; content comes through events, not app updates. |
| **Brick Breaker: Journeys** | Free, ads, remove ads $9.99, unlock balls $4.99. 4.6★ (1.2K). | **Offline** ("no Wi-Fi needed") | None | Frequent in year one (new brick types, ball shop, daily bonus), then 1–2 small updates a year. |

What this tells us: the only premium hit (BALL x PIT) keeps players with **large free content updates on a predictable roadmap**, while the free-to-play games ship small technical patches and keep players with events, leagues and currency. Offline play is a selling point that free games advertise. For BREACH: fully offline, a one-time unlock, and a public roadmap with a new world as a free update roughly every quarter after launch.

### 3.2 UI/UX teardown: why players stay

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

### 3.3 Why players pay, and our model

What makes players pay in this genre: removing friction (ads, waiting), progress acceleration, cosmetic identity (ball skins), and content they want more of. Premium iOS buyers pay for *respect*: no ads, no timers, lots of content, polish.

**Recommended model: "Free to try, pay once."**

- World 1 (20 levels) and the Daily Vault are free.
- One purchase (target **$4.99**) unlocks all worlds, Siege mode and the level editor. No ads anywhere, ever.
- Optional cosmetic packs later (ball trails, paddle skins, tile themes). Cosmetic only, never power.
- Apple Arcade is a strong alternative channel: the game has no IAP dependence, so it fits their rules as is.

What we deliberately do **not** copy: energy timers, pay-to-continue, loot boxes, ad walls. These lift short-term revenue but kill App Store ratings and editorial features, which is where a premium game gets discovered.

### 3.4 Growth hook: the game makes its own viral clips

The genre spreads through short videos, so we build that in. **Replay Reel** automatically keeps the best 8 seconds of each level (largest collapse, clutch save, biggest ball count) and exports a vertical 9:16 clip with one tap. Every player becomes a source of the exact content that inspired this game.

---

## 4. Core mechanics: three candidates and a recommendation

### 4.1 Candidate A — **Carve & Rescue** (recommended)

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

### 4.2 Candidate B — **Structural Collapse** (recommended as a core system with A)

Each structure has **anchor rivets** (indestructible studs on the frame). After every break we check which tiles are still connected to an anchor. Any island that is no longer connected **breaks loose, falls, and shatters**: hundreds of tiles in one moment.

- Cut the trunk of the tree and the whole crown crashes down.
- Falling chunks rain shards; catching shards with the paddle fills the Overdrive meter.
- A falling chunk can crush the serpent, or block a channel, so collapse is a tactic, not only spectacle.
- Some levels hang the Wisp's cage from a chain; cutting the chain drops the cage onto your side.

This is the "cut one thing and everything falls" satisfaction that Jenga and physics puzzle games own, applied to a brick breaker for the first time we could find.

### 4.3 Candidate C — **Spin & Curve** (recommended as the skill layer)

Swiping the paddle as the ball hits imparts **spin**. A spinning ball **curves** (a Magnus-style sideways force that fades over about 1 second), drawn with a visible curved trail. Hit offset still sets the launch angle like classic Arkanoid; paddle velocity sets spin.

- Gives one-thumb players a real aiming skill for threading channels.
- Makes the near-misses in narrow shapes feel earned.
- Ceiling for mastery: experts curve shots around corners into pockets.

### 4.3b How the player controls where the tunnel goes

There is no finger carving. The thumb only moves the paddle; only balls break tiles. Control over *where* the ball goes comes from five layers, from least to most deliberate:

1. **Paddle position**: where the ball lands on the paddle sets its outgoing angle (classic Arkanoid).
2. **Spin**: swiping the paddle at contact curves the ball (§4.3). The glowing curved streaks in the drafts are these ball trails.
3. **The level shape**: each structure ships with pre-built channels separated by thin walls, like the shapes in the reference clips. Once a ball enters a channel it rattles along it and does the carving for you; the skill is getting it in.
4. **Focus aim (new core ability)**: hold the thumb still as the ball comes down and it catches on the paddle for up to 1 second in slow motion, with a dotted line previewing the first two bounces. Slide to aim, release to fire. Uses a Focus meter that refills with combos, so it is for the shots that matter, not every hit.
5. **Power-ups**: Drill fires straight for 12 tiles, Seeker curves toward the Wisp, Laser paddle cuts exactly where you stand.

Some imprecision is deliberate: it is the "will it get in?" tension from the clips. Focus aim exists so a missed shot feels like your choice, never pure luck. The M0 prototype will tune how often Focus is available.

### 4.4 Other ideas considered and parked

- **Gravity thumb** (hold to bend all balls toward your finger): powerful but conflicts with one-thumb paddle control. Kept as a power-up ("Attractor").
- **Rhythm hits** (bricks pulse to the beat; on-beat hits do double damage): fun, but splits attention away from the threat. Maybe a later mode.
- **Turn-based aim and shoot** (Ballz style): crowded, and loses real-time urgency.

**Recommendation: build A + B + C as one game.** Carve & Rescue is the goal, Collapse is the payoff, Spin and Focus aim are the skill (§4.3b). The first prototype tests only A with the Serpent (see §10).

---

## 5. Level flow (one level, about 60–100 seconds)

1. **Reveal (2 s).** Camera glides over the structure; the Wisp waves for help; the threat wakes up with a sound sting. HUD shows a "distance to Wisp" meter.
2. **Rescue phase (45–90 s).** Launch, carve, curve, grab power-ups. Music layers add as the threat gets closer (heartbeat, then percussion, then choir).
3. **Breach (1 s).** Channel connects. Hit-stop 120 ms, white flash, big haptic, the Wisp dashes out. If the threat was within 3 tiles: **CLUTCH** slow-mo.
4. **Frenzy (10 s).** Every ball becomes a fireball, multiplier gates spawn, all remaining structure is fair game. Score here sets your stars.
5. **Results (3 s).** Stars, Wisp joins the Sanctuary, Replay Reel button, "Next" in the thumb zone.

---

## 6. Urgency systems

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

## 7. Power-ups

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

## 8. Art direction: "Glass and Ember"

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

## 9. Technical plan

### 9.1 Stack: TypeScript + PixiJS v8 + Vite, wrapped with Capacitor for iOS

| Option | Verdict |
|---|---|
| **PixiJS v8 + own physics** | **Chosen.** Fast WebGL/WebGPU 2D renderer, great for thousands of sprites and glow filters. Brick-breaker physics is simple enough that our own deterministic code beats a general engine, and it lets us handle micro-brick edge cases exactly. GDevelop's own runtime is built on PixiJS and ships to mobile through Cordova, which is good evidence this route works. |
| Phaser 4 | Good, but its Arcade physics is per-body AABB; we would bypass it for the grid anyway, and its scene system adds weight we don't need. |
| Godot 4 | Strong engine, but web builds are heavy and slower to iterate on in the browser, where you can review drafts. |
| Unity / Unreal | Overkill for a 2D game and against the "keep it simple" brief. |

iOS path: Capacitor app shell, native haptics plugin, Game Center leaderboards, 120 Hz ProMotion, safe-area aware layout. The same build runs on the web for playtests and on Android later.

### 9.2 Ball and brick collision physics

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

### 9.3 Rendering budget (iPhone 12 class, 60 fps minimum, 120 fps target)

- Tiles: one instanced sprite batch (ParticleContainer) of about 3,500 tiles; dirty-flag updates only.
- Balls: up to 600 instanced sprites plus a shared trail texture.
- Shards: pooled, max 1,500 alive.
- Glow: one bloom pass on a dedicated layer.
- Budget: simulation ≤ 4 ms, render submit ≤ 4 ms per frame.

### 9.4 Levels as data

Levels are authored as small PNG images (one pixel per tile, colour = tile type: normal, tough, anchor, gate, power-up seam, Wisp pocket, threat start). A converter turns them into JSON. This makes designing shapes like the reference clips (trees, crosses, mazes) as easy as drawing pixel art, and lets us hand-make or generate hundreds of levels.

---

## 10. Build plan and subtasks

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

### Milestones

- **M0 — "Is it fun?" prototype** (workstreams 1–6 plus 3 power-ups): one Grove level, the Serpent, carve and rescue. Keep it if testers say "one more" and try to clutch; kill or rework if carving feels like chores.
- **M1 — Vertical slice**: World 1 complete (20 levels), collapse, 12 power-ups, full juice, polished art for one world.
- **M2 — Content**: Worlds 2–5, all power-ups, Sanctuary, Daily Vault, Replay Reel.
- **M3 — Ship**: iOS build, store page, TestFlight playtest.

---

## 11. Open questions for you

1. Working title **BREACH**, or do you have a name in mind?
2. Creature to save: a cute **Wisp** (our recommendation, works worldwide), or a human character like the princess in the Candy Crush ad?
3. Pricing: **free to try + $4.99 unlock** (our recommendation), or fully paid upfront?
4. Is the first prototype scope in M0 right, or do you want collapse in it from day one?

---

## Appendix: sources

- App Store listings: BALL x PIT https://apps.apple.com/de/app/ball-x-pit/id6738703497 · Arkanoid vs Space Invaders+ https://apps.apple.com/us/app/-/id6503027740 · Ballz https://apps.apple.com/app/1139609950 · Bricks n Balls https://apps.apple.com/app/id1331794412 · Bricks Breaker Quest https://apps.apple.com/us/app/-/id1288430163 · Brick Breaker: Journeys https://apps.apple.com/us/app/brick-breaker-journeys/id1619145707
- BALL x PIT 2026 update roadmap: https://www.pcgamesn.com/ball-x-pit/update-roadmap-2026

- Sensor Tower data on pinball and brick breaker subgenres, via GameDev Reports: https://gamedevreports.substack.com/p/sensor-tower-analysis-of-pinballbrick
- Ball x Pit at 2M sales: https://www.pushsquare.com/news/2026/08/devolvers-brilliant-roguelite-dopamine-factory-ball-x-pit-is-a-smash-hit-at-2-million-sales
- Brick Breaker Brainrot (origin of the viral format): https://knowyourmeme.com/memes/brick-breaker-brainrot
- Royal Match design decisions: https://www.cubix.co/blog/the-design-decisions-that-made-royal-match-a-top-grossing-game/
- Ballz review sentiment: https://marlvel.ai/apps/ballz
- Fake and rescue ads, retention data: https://segwise.ai/blog/fake-ads-and-mobile-gaming-how-studios-balance-clickbait-gameplay-integrity-and-profitability-cm7j2hc9s00bvip0l0r4k59lw
- Block breaker landscape 2026: https://www.soonlab.ai/blog/block-breaker-games/
