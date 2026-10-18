# BREACH Story Mode and Next Level Plan

**Latest selection and tested candidate (2026-10-18):** Only A / Carrier Breakout is active; Nix/Tick appearances are selected, but their full expressive sprite/animation families and runtime cast integration are not built. B/Relay Raiders, C/Orbital Breakout and D/Eclipse Rescue are deferred. The playable Carrier web candidate is SHA256 `F4863DC5A87D6B46A8A1AFDB702C264F432196B851B61B828946DB8AB75A0423`. It passes 44 unit tests and both-phone bundled gameplay/visual checks. Independent final captures at 393×852 safe59/34 and 412×915 safe32/24 preserve the approved A art, continuous safe-edge starfield, aligned 125×17u paddle and clean settled results, with zero page errors. Public-input assisted deterministic simulated wins record 82.3s iPhone / 45.2s Android of game clock; these do not establish human balance or physical-device performance. Evidence: `out/carrier-playable-final/report.json` and `out/carrier-visual-final/REVIEW.md`. The owner has requested an APK; packaging/native CI and delivery remain pending. No APK pass is claimed. EA839F00… remains historical accepted baseline evidence; the older A/B Canvas tranche remains asset-only history.

**APK checkpoint authorization (2026-10-18):** The owner explicitly requests the APK. This authorizes the necessary checkpoint commit/push and CI on `codex/carrier-mobile-preview` in the existing isolated `breaker-mobile-preview` worktree, using the exact frozen Carrier/current Vault sources and native immersive fix. Primary `codex/phase1-kit` is preserved. No merge to `main` or pending Nix/Tick companion-family admission is authorized. APK/native CI remains pending; the earlier screenshot-approval notes do not block this specific APK checkpoint.

**Current production scope (2026-10-18):** Carrier A is a playable tested web candidate, using the reviewed hull/hangar, cannons, three fighters, cyan/rose panel crates, five shallow captive windows, flat paddle, ball and Laser/Split/Shield payloads. The 125×17u Carrier paddle and 7.5r ordinary / 10r TITAN ball are verified; Vault retains 74×12u/default6r and exclusive Kit use. The final safe-inset starfield and results-effect repairs pass independent phone review. APK packaging/native CI is in progress, not delivered. Nix/Tick full families and live roles remain pending. B/C/D and Brum/Vesper production are deferred; their concept/source-proof history is preserved.

**Historical A/B asset milestone (2026-10-18):** real independent PNG parts and the isolated Canvas motion assembly are complete for the approved A/B left playfields. Final proof is under `out/space-assets-ab/final/`: `A-ios-reference.png`, `A-android-reference.png`, `B-ios-reference.png`, `B-android-reference.png`, `A-motion.gif`, `B-motion.gif` and `asset-report.json`. Actual 393×852/412×915 images and sampled launch/release/boarding/iris sequences pass independent visual review; all four capture runs report zero page errors, real alpha/metadata checks and approximately 126 CSS paddle reserve. A has five shallow captive windows; B has four large worker pods. This asset-only milestone contains no companions, pilots or portraits and predates the latest Nix/Tick selection. These are asset-motion proofs with a placement ball, not new gameplay: runtime admission/WebP sizing, actual-alpha collision alignment, input/combat/rescue/power rules, full playable phone runs, memory/performance and new APK checks remain. The proof milestone retains EA839F00… as its gameplay baseline; it does not cover later Carrier integration. Reproduction and limits: `art/space/ASSETS_AB.md`; inventory/contracts: `design/phase1/space-assets-ab-spec.md` and `space-assets-ab.json`.

Oct 18, 2026 · Live version: https://claude.ai/code/artifact/5278a4c8-b669-4235-972f-7814c32382d9

**Current direction (2026-10-18):** Phase 1 remains approved. Only Carrier Breakout A is active in space; its playable F4863DC5… candidate now passes web gameplay and independent native-size visual checks. The owner-requested APK is in packaging/native CI, not yet delivered. Nix/Tick appearances are selected; their full expressive families and runtime roles are still unbuilt. B/C/D remain deferred and the older A/B asset-only proofs remain history. Brum/Vesper keep their bounded source-proof status; later chapter/progression systems below are not implemented.

## The pitch

An alien collector steals the princess of a kingdom built from glossy bricks. The only one who can bring her back is the young prince everyone laughed at for playing the courtyard bounce game.

Every brick you break in BREACH sends a spark of light home. That light is your score. It rebuilds the kingdom, and it buys the next weapon. One rule ties story, store and progression to the thing players already love doing.

Each session should end on three hooks, the pattern the research below keeps finding:

- **A cliffhanger:** the next chapter is teased.
- **Something visibly rebuilt:** the light earned in the run shows up on the home screen.
- **An unlock almost in reach:** a weapon or skin is only a short run away.

## What the research says

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

## Story bible

The whole story rests on one idea: **the bricks are alive with light, and the princess is the light.** That single rule explains why you break bricks, why she was taken, and why the serpent eats walls.

### The world

Brickhaven is a kingdom built entirely from starglass, glossy bricks that glow and hold together only while the Lightsong is sung. Princess Lumi is the Keystone, the one person in each generation born able to sing it. When a brick loses its light, it cracks and fades. That is why single bricks crumble in the game.

### Why she was taken, and why a space prison

Zorvax the Curator travels the galaxy in his mothership, collecting one-of-a-kind wonders for the Menagerie. The Menagerie is a moon-sized prison museum, and he built it from bricks stolen from a hundred worlds.

Stolen bricks go dark, so the Menagerie keeps crumbling. Zorvax needs a Keystone to hold it together, so he takes Lumi and locks her in its heart, the Vault. The prison is literally held up by her light. Every wall you break sets a little of it free.

### Why aliens, robots and creatures

- **The robots (Clanks)** are Brickhaven's own toy workers, hijacked by the mothership's signal. You never destroy them. A hit snaps them out of it, which is why they go dizzy and fall. Freed Clanks come home and help rebuild.
- **The serpent (Gnash)** is the Vault's warden. It is bred to eat starglass, with one order: if anyone frees the Keystone, swallow her first. That is why it chews toward her cage and grows as it eats.
- **The creatures** are the Menagerie's other exhibits, beasts stolen from other worlds. Each guards a wing of the prison: a dragon who melts bricks into lava, a kraken frozen in a comet, a phoenix in a solar furnace. Some can be freed and become companions.

### The hero

Prince Kit is Lumi's best friend from the neighbouring isle. As kids they invented the bounce game in the palace courtyard, and he never stopped playing it. The court calls it a waste of time. When the sky goes dark, his old courtyard paddle is the only weapon that can break starglass without shattering the light inside.

This gives players an underdog they relate to: the kid whose "useless" game turns out to be the one skill that matters.

### The princess is not waiting

Lumi is scared, and players see it, because she paces and panics in her cell. She is also brave. She taps signals through the walls, steers power-ups toward Kit with her song, and in Chapter 3 she becomes playable to break out alongside him. The tagline earns both halves: Kit breaks in, Lumi breaks out.

### The twist

In the final chapter, Zorvax's secret comes out. His own world went dark long ago, and he collects light so he never has to be in the dark again. Lumi chooses to share the Lightsong instead of taking revenge. Zorvax's world relights, and he reopens the Menagerie as a curio shop: the endgame store with the rarest skins.

### Cast

| Character | Who they are | What they want | In the game now |
| --- | --- | --- | --- |
| Prince Kit | Lumi's childhood friend and the courtyard bounce-game champion | To bring Lumi home and prove the game mattered | New: the playable hero, built from the KayKit Knight model |
| Princess Lumi | The Keystone, whose song keeps Brickhaven's bricks alive | To escape, and to protect Kit | Exists: nervous and panic animations in the Vault; playable from Chapter 3 |
| Zorvax the Curator | The alien collector on the mothership | Never to be in the dark again | Exists: the mothership boss with five expressions |
| The Clanks | Brickhaven's toy workers, hijacked | To be freed and go home | Exists: the 4-colour robot formation |
| Gnash | The Vault's brick-eating warden serpent | To swallow the Keystone before she escapes | Exists: the growing, accelerating serpent |
| Ember, the Kraken, the Phoenix | Exhibits guarding the Menagerie's other wings | Freedom, or revenge on whoever opens their cage | New: later chapter bosses |

## Chapter map

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

## Heroes, weapons and skins

Heroes change how a run feels, weapons change what the paddle does, and skins only change looks. Heroes and weapons are always earned through play. Skins can also be bought. That keeps BREACH fair and premium.

### Playable heroes

| Hero | Passive ability | How to unlock |
| --- | --- | --- |
| Prince Kit | Balanced. Catch and aim gets one extra AIM pip. | From the start |
| Princess Lumi | Her song fills the titan core twice as fast. Power-ups drift toward the paddle. | Finish Chapter 2 |
| Pip the Clank | A freed robot. Its paddle fires a slow auto-bolt every 3 seconds. | Free 100 Clanks in total |
| Granny Mortar | The royal mason. Her ball hits armour bricks twice per bounce. | Rebuild the Masons' Hall |
| Ember | The freed dragon. Every 8th paddle hit sets the ball on fire. | Finish Chapter 4 |

### Weapons (the paddle's special move)

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

### Skins

Skins are cosmetic only: hero outfits, paddle skins, ball trails, and brick-break effects. Examples include Astronaut Kit, Pirate Lumi, the Candy paddle and a Neon trail. Each chapter adds a set. Some are earned from 3-star stages, some from daily challenges, and some are sold. Every skin is a Blender render, following the art rules already in place.

## Power-ups

BREACH already has 9 power-ups, including a multi-ball (SPLIT ×3, BURST +3) and paddle bullets (LASER). They drop rarely and look alike, which is probably why they go unnoticed. The plan adds 10 more, plus fusions, and introduces them one per stage so players are never overwhelmed.

### Already in the game

SPLIT (×3 balls), BURST (+3 balls), FIRE (a piercing ball), WIDE (a wider paddle), AIM (catch and aim), LASER (paddle bullets), SHIELD (a safety line), SLOW (a slower ball), and TINY (a bad pickup that shrinks the paddle). The titan core is also there: a dead-centre hit makes a giant unstoppable ball.

### New power-ups

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

### Fusions

Catch two specific power-ups within 3 seconds and they fuse into something stronger, as in BALL x PIT and Vampire Survivors. Players discover fusions themselves, and a codex records each one the first time it happens.

| Fusion | Made from | Effect |
| --- | --- | --- |
| Firework | FIRE + SPLIT | Split balls explode on every hit |
| Bullet Storm | LASER + MULTIPLY | Every ball fires bullets upward |
| Gravity Well | MAGNET + BOMB | A black hole pulls bricks in, then bursts |
| Time Bubble | SHIELD + SLOW | Everything slows except you |
| Storm Titan | LIGHTNING + titan core | The giant ball arcs lightning as it pierces |
| Swarm | DRONE + BURST | Three drones join the paddle |

## Progression and store

Score turns into **Shine**, the one soft currency, at 1 Shine per 100 points, plus a bonus for each star. Shine rebuilds Brickhaven on the home screen, upgrades weapons, and buys skins. Boss stages also drop blueprints, which unlock weapons and buildings. There is no premium gem currency and no gacha.

```
Core loop: Break bricks in a run (score, stars, freed Clanks) -> Earn Shine and blueprints (paid out win or lose)
  -> Relight the kingdom (buildings, weapons, skins) -> Return stronger (new chapter, next cliffhanger) -> repeat
```

A loss still pays out Shine, so no run feels wasted, which is the Vampire Survivors lesson.

### Rebuilding Brickhaven

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

### Raid mode (the roguelite loop)

After Chapter 1, Raid mode opens. A raid chains 5 random stages from unlocked chapters. Between stages, you pick 1 of 3 upgrades, as in Archero: more balls, longer power-ups, stronger fusions. A raid lasts about 10 minutes. Losing still pays out Shine, so no run feels wasted.

### Daily habits

- **Daily Breach:** one seeded stage, the same for everyone, with a leaderboard.
- **Daily chest:** free once a day, opened with the slot-machine reveal Vampire Survivors uses.
- **Weekly event:** a boss rush or a themed wall, with a skin as the prize.
- **Streaks:** gentle. A missed day pauses the streak instead of resetting it, so lapsed players are never punished.

### Store and monetisation

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

## What next

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

### Decisions for you

1. **Names:** keep Kit, Lumi, Zorvax, Gnash and Brickhaven, or rename? Recommended: keep. They are short and easy to say.
2. **Kit's look:** an underdog courtyard kid with his old paddle, or an armoured knight? Recommended: the kid, because players relate to an underdog.
3. **Start:** begin Phase 1 now? Recommended: yes.
4. **Model:** keep watch-an-ad plus the $2.99 unlock, or charge upfront like Holedown? Recommended: keep the current model, since it lets more players in.

## Sources

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
