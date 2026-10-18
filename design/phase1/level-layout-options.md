# The Vault: selected mixed design — Bastion Crossroads

Status: the owner selected a mix of the revised layouts on2026-10-18, then selected the left Kit orb, defensive ward, earned venom and streaming top entrance. The combined implementation passes native phone checks on SHA256 **3A6B8A8C5368364AFCFCE6BBF7B1994D4598C121C90B45B72FE5BD7E45285EC1**. It has not been committed or pushed. Earlier options and the original direct-route A pick are superseded; their records are preserved below.

[Selected mixed map board before the later entrance/ward changes](img/level-layout-mixed.png). Current motion and mechanics: [entrance](img/serpent-entry-native.gif), [venom/ward brief](venom-options.md).

## Final level

The rescue keeps Bastion Switchback's mandatory staggered granite bands. The player changes aiming sides between the lower blue courses, coral middle and reinforced violet floors. It adds the optional left hanging cache from Twin Keeps alongside the right hanging room. These are alternate tactical shots; neither opens a straight shaft to Lumi.

There are 219 brick objects, 245 normal-hit HP, and 19 deliberate gem targets. Early WIDE, SHIELD and SLOW support the rally. SPLIT, FIRE and LASER are earned deeper in the structure. The left support at (2,8) issues SPLIT and drops eight bricks; LASER at (3,10) inside that cache is available if deliberately hit before the collapse. The right support at (16,10) grants FIRE and drops eight bricks. Collapsed gems do not automatically issue powers. Falling bricks retain their real BONK risk at the paddle.

The jade serpent streams down from the top tunnel with twelve cells and grows up to twenty as it eats. Its granite spine forces a real detour: the current initial Dijkstra route has40 steps and65.46 base cost. Idle simulation reaches first attack55.083 seconds and loss59.767 seconds after active handover; the final harness reports55.250/59.933 including0.167 seconds of accelerated entry. This is an elapsed threat check, not a prescribed completion time. Earned two-contact venom can open one useful partition; charged Kit ward can hold it. The cage remains protected.

### Exact map

20 × 20 cells, 16 units each, origin (20,96). t teal / v violet: 2 HP. c coral / b blue / g gem: 1 HP. # granite, = cage, . empty. Two-cell running-bond bricks remain the normal construction. The cage stays at columns 7…12, rows 3…5 with the original roof and side frame.

```text
ttttttttttttt#......
ttttttttttttt#......
tttttt########......
tttttt#======#tttttt
ttgttt#======#tttgtt
tttttt#======#tttttt
vvvvvvvgvggvv#vvvvvv
########vvvvv#vvvvvv
..g...vv.gvvv#vvvvvv
.vvvv.vvvvgvv#gvvvvv
.ccgc.gcccccc#..g...
.cccc.cc######.cccc.
........ccccc#.cccc.
ccccccccccccc#.ccgc.
bbgbbbbbgbbbb#......
######bbbbbbb#bbbbbb
bbbbbbg.bbbbbbbbbbbb
bbbbbbbbbbbbbb..bbbb
bbbbgbbbbbbbgbbbbbbb
bbbbbbbbgbbbbbbbbbbb
```

### Deliberate gem powers

| Column | Row | Power |
|---:|---:|---|
| 2 | 4 | WIDE |
| 17 | 4 | SPLIT |
| 7 | 6 | LASER |
| 9 | 6 | FIRE |
| 10 | 6 | SHIELD |
| 2 | 8 | SPLIT |
| 9 | 8 | WIDE |
| 10 | 9 | SLOW |
| 14 | 9 | SPLIT |
| 3 | 10 | LASER |
| 6 | 10 | SHIELD |
| 16 | 10 | FIRE |
| 17 | 13 | SLOW |
| 2 | 14 | SHIELD |
| 8 | 14 | WIDE |
| 6 | 16 | WIDE |
| 4 | 18 | WIDE |
| 12 | 18 | SLOW |
| 8 | 19 | SHIELD |

All nineteen use the existing deterministic drop formula. No new power or random drop mechanism was added. The Invasion map, HP and armour remain unchanged.

## Declared solid materials

Vault declares grid.unpierceable = [GRANITE,BARS]. Generic circle/grid collision checks that optional list before allowing FIRE or TITAN to pierce. This keeps material IDs out of generic physics and preserves Invasion's pierceable armour because its grid declares no solid-material list. Ordinary breakable Vault bricks still pierce.

The aim grid's spread clone preserves the same rule. Its simulated ball carries current FIRE/TITAN state. The prediction can end early on piercing contacts under the existing preview limit; it must not show a false reflection from a pierced brick.

Physics regression checks cover high-speed FIRE/TITAN against two arbitrary declared material IDs and a breakable material, preservation of the shared rule through a preview-style grid clone, default armour piercing, exposed corners beside pierced neighbours, existing normal seam bounces, high-speed tunnelling, hit reporting, paddle angles and flood fill. All eight tests pass.

## Jade art family

Twenty-six actual Blender Cycles renders replace the preview hue filter: thirteen expressions × left/right facings, 176 × 176 RGBA, 64 samples. Existing assets/snake remains untouched. New files are assets/snake-jade/head_<expression>_<r|l>.png and meta.json; the registry key is ART.snakeJade with the existing cell/unit/expr/dir sheet contract.

Body #168f83, crown #0b5d59, lid #11726c, belly #c9e8d2, outline #052d31, marks #83e4c2, coral brows #ff8a9b. The continuous runtime ribbon matches those materials. The shared art/snake.py accepts --palette original|jade, retaining original as its default. PNG metadata was stripped and every frame passed dimensions, full-alpha-range, mode and family-coverage checks. The native head, snarl and strike and full family were inspected beside the actual gameplay.

Initial serpent cells:

```json
[[16,1],[16,0],[16,-1],[16,-2],[16,-3],[16,-4],[16,-5],[16,-6],[16,-7],[16,-8],[16,-9],[16,-10]]
```

Measured initial Dijkstra route:

```json
[[15,1],[14,1],[14,2],[14,3],[14,4],[14,5],[14,6],[14,7],[14,8],[14,9],[14,10],[14,11],[14,12],[14,13],[14,14],[14,15],[14,16],[13,16],[12,16],[11,16],[10,16],[9,16],[8,16],[7,16],[7,15],[7,14],[7,13],[7,12],[6,12],[5,12],[5,11],[5,10],[5,9],[5,8],[6,8],[7,8],[8,8],[8,7],[8,6],[8,5]]
```

## Playtest evidence

### Current combined build

`out/vault-ward-coach-final/report.json` seals the current hash above, both phone geometries, zero unsupported starting bricks, no initial free breach, both eight-brick support collapses and the declared granite/bars power-collision rule. All21 unit tests pass. `out/venom-coach-final/report.json` adds actual52CSS orb input, ward/melt outcomes, earned first-use practice, hidden tunnel and skip/loss regressions. There are no page errors.

The six baseline small-offset bots now all lose after charge became defensive. A varied-angle iPhone run earns a two-star rescue at30.042 seconds. An Android strategic policy earns a one-star rescue at43.817 seconds using121 brick breaks, ten real Focus catches and collected SPLIT/FIRE/LASER. Its copied-grid planner never edits the live grid, lives, charges or serpent; seed, all aim choices, real powers and cache states are recorded in `out/vault-strategic-android/report.json`. These establish recoverability, not human balance. No source tuning followed these results.

Current actual screenshots include `out/venom-coach-final/{ios,android}-coach-01-paused-practice.png`, `-ward-03-impact.png`, `-empty-03-impact.png`, `out/vault-ward-scout-final/ios-earned-win-6.png`, and `out/vault-strategic-android/android-20181024-won.png`.

### Historical pre-ward build

The following table and `out/vault-final-qa` captures belong to old hash00A6756B… and its offensive TITAN charge. They are retained as history and must not be presented as current difficulty results.

The focused suite uses actual source and the actual rendered jade sheet, at iPhone 393 × 852, safe 59,34 and Android 412 × 915, safe 32,24. The controller tracks falling balls using the normal paddle smoothing/drag mapping, with a small sine offset. It has perfect ball-state access and prevents automatic catch, so this is stronger than a first-time touch player. Its random seed is fixed per run. Test-injected power-combo and collapse checks are recorded separately from earned full runs.

| Phone | Serve radians | Elapsed s | Paddle returns | Bricks broken | Score | Outcome | Stars |
|---|---:|---:|---:|---:|---:|---|---:|
| ios | -0.5 | 64.767 | 84 | 115 | 8525 | lost | — |
| ios | 0.18 | 49.617 | 28 | 115 | 7462 | lost | — |
| ios | 0.5 | 45.125 | 121 | 133 | 7322 | won | 1 |
| android | -0.5 | 91.558 | 129 | 105 | 9336 | lost | — |
| android | 0.18 | 53.883 | 144 | 164 | 11791 | won | 2 |
| android | 0.5 | 67.742 | 165 | 132 | 8819 | won | 1 |

- 3 complete earned wins and 3 serpent losses across six sustained runs; no brick deletion, forced rescue or free power injection in those runs.
- No initial breach; zero unsupported starting bricks; finite legal serpent route and twelve-cell start at both phone geometries.
- The left and right support tests each release eight real rigid bricks and issue their intended SPLIT/FIRE capsule.
- FIRE+WIDE+SHIELD+SLOW and TITAN+WIDE+SHIELD+SLOW test setups both bounce from declared granite, leave it intact and retain the shield. These are injected collision/state checks, not earned-run evidence.
- Idle loss and the real Continue screen are captured on both phones. Earned win/results screenshots are captured on both phones. No page errors occurred.
- The existing 10,000-score bonus remains. An Android run earned 11,791 and two stars; fast rescues scored less. The danger-halfway star remains a separate skill goal. Three-star human difficulty is not validated.

### Screenshots

- out/vault-final-qa/{ios,android}-01-opening.png
- out/vault-final-qa/{ios,android}-02-left-collapse.png and -02-right-collapse.png
- out/vault-final-qa/{ios,android}-03-fire-shield-slow-wide.png and -03-titan-shield-slow-wide.png
- out/vault-final-qa/{ios,android}-04-rally-8s.png
- out/vault-final-qa/{ios,android}-05-earned-win.png
- out/vault-final-qa/{ios,android}-07-serpent-loss-continue.png
- out/level-design-v2/jade-family.png

Detailed measurements: out/vault-final-qa/report.json. Reproduce against the packed build with node tools/playtest/vault-v2.mjs <out> [html], using the configured PW_MODULE and PW_CHROMIUM. Final testing used dist/breach.html, SHA256 00A6756BDF0A3B8D0EE61AD6EC00ED6A5D3DE2D0A23A2383B9FA173634301BDB, checked unchanged before and after the suite. The temporary mixed.html and earlier samples are historical.

## Review limits

These are Chromium viewport simulations, not physical iPhone/Android testing or a human balance study. The final packed build passes function and recoverability checks; owner review, three-star balance and real touch feel remain. No later chapter, new cast mechanic or store is included. The selected Kit tap and first-use coach are included. Wait for the owner's completed-build OK before committing or pushing.

---

# Superseded round2 and round1 records — do not build

All choices, pending-pick wording and implementation statements below are archival and superseded by the selected mixed status above.

# Level 2 redesign, round 2

Status: NEW options awaiting the owner's image pick. The earlier Open Gate / Twin Fronts options and their A pick are withdrawn. Nothing from either round is integrated, committed or pushed. The original proposal record is preserved in the superseded appendix below.

The owner asked for a denser, more challenging Vault after rejecting the direct rescue shaft: more brick and power-up targets, a longer serpent with a genuinely longer route, alternate angles, reinforced gates, and satisfying collapses. These two castle layouts use the existing game art and mechanics plus one explicitly proposed collision rule. Invasion remains unchanged for this design round; later castle/space characters are a separate concept decision.

## Images and recommendation

- **V2-A — Bastion Switchback:** [image](img/level-layout-v2-a.png). Recommended for the stronger angled route, longer threat and greater challenge. Three defended turns, a right hanging reward room, jade serpent.
- **V2-B — Twin Keeps:** [image](img/level-layout-v2-b.png). The more open choice: a tight inner tower or wide outer balcony, a left hanging cache, rose serpent. Stronger power flow can make it faster than A.

Each 1280 × 1900 board contains actual native game renders at iPhone 393 × 852 (safe 59,34) and Android 412 × 915 (safe 32,24). These are isolated prototype captures, not a released implementation.

## Proposed rule shared by both choices

**Granite and cage bars stop FIRE and TITAN; breakable bricks still pierce.** This is a gameplay change for the owner to approve with the layout. It exists only in the candidate bundle.

Current production physics lets powered balls pass through every cell; Vault refuses to destroy granite but does not make it bounce. Staggered granite therefore cannot control powered shot routes under current rules. Initial dense-layout simulations still produced rescues around 9 seconds. Moving strong rewards deeper helped, but the shared wall rule is what makes the geometry meaningful while keeping powerful piercing rewards.

Six assert cases exercise FIRE and TITAN against granite, bars and an ordinary breakable cell: both powers bounce from the first two and retain their forward velocity through the breakable cell. The same modified physics module serves the runtime and aim predictor. No active source is edited.

## Fixed layout and safety contracts

- World width 360. Vault grid 20 × 20, 16-unit cells, origin (20,96).
- Normal ball diameter 12; titan diameter 20. Gate widths are measured in 16-unit cells; ordinary bricks remain one or two cells wide in running bond.
- Cage remains columns 7…12, rows 3…5, with its original granite roof and sides. The princess position, bars and escape animation contract are unchanged.
- Both snakes begin with 12 legal cells, compared with 5 in the original. The full ribbon and head are recoloured together in the preview, keeping the continuous body.
- Both maps start with zero unsupported bricks and no cage-to-bottom breach. The chosen route can be opened by ordinary hits and the real checkBreach() enters escape.
- Existing HUD, raised paddle, aim controls and thumb deck are retained. The normal collision/aim behaviour is measured at both phone sizes.

## What is measured

| Property | V2-A | V2-B |
|---|---:|---:|
| Brick objects | 226 | 238 |
| Guaranteed power bricks | 19 | 21 |
| Serpent starting cells | 12 | 12 |
| Dijkstra path steps | 35 | 26 |
| Base Dijkstra chew cost | 66.07 | 51.65 |
| Idle attack begins, after skipping intro | 55.217 s | 49.625 s |
| Static ordinary-hit dig proof | 14 hits | 15 hits |
| Hanging bricks released by one support | 8 | 7 |

The previous direct-route previews had 183–200 brick objects, four-hit dig proofs, ten planned serpent steps and a 25.175-second idle attack. Production Invasion has 84 occupied cells and 117 HP. These are structural progression differences; counts alone do not establish fun or player difficulty.

The dig proof finds a cheapest weighted cell route in the static map, charging each running-bond brick when entering it and not again when moving between its two cells. It then removes the resulting brick set using ordinary hitCell() calls plus the real collapse rule and confirms escape. This is a reproducible authored route and a static search result. It is not a proof of a global minimum that includes arbitrary off-path support cuts, powers, serpent excavation or multiball.

No human completion rate is claimed. The serpent's path cost is a planning weight, not elapsed seconds; its real idle timing includes chewing, travel, acceleration, whole-brick removal and collapse.

## V2-A — BASTION SWITCHBACK

The player enters through dense blue courses. WIDE at (4,18), SHIELD at (8,19) and SLOW at (12,18) support the opening rally. Granite at row 15 pushes the route toward the centre/right; row 11 blocks that side, requiring a left cut; row 7 then demands a right cut back under Lumi. Reinforced violet floors need deliberate repeat contacts. There is no uninterrupted centre rescue shaft.

The granite spine at column 13 reaches row 15. The jade serpent starts in the upper-right pocket, must descend below that spine, then climb through the same defended structure. This detour survives Dijkstra; it cannot take the original shortcut from the right directly to the cage. A hanging room at columns 15…18, rows 11…13 is held by the gem at (16,10). Hit it for FIRE and 8 bricks drop. The reward is substantial, with the existing BONK hazard below.

### Exact map

Legend: t teal (2 HP), v violet (2), c coral (1), b blue (1), g gem (1), # granite, = cage, . empty. Coordinates are zero-indexed.

```text
ttttttttttttt#......
ttttttttttttt#......
tttttt########......
tttttt#======#tttttt
ttgttt#======#tttgtt
tttttt#======#tttttt
vvvvvvvgvggvv#vvvvvv
########vvvvv#vvvvvv
vvvvvvvv.gvvv#vvvvvv
vvvvvvvvvvgvv#gvvvvv
ccccccgcccccc#..g...
cccccccc######.cccc.
ggcccc..ccccc#.cccc.
ccccccccccccc#.ccgc.
bbgbbbbbgbbbb#......
######bbbbbbb#bbbbbb
bbbbbbg.bbbbbbbbbbbb
bbbbbbbbbbbbbb..bbbb
bbbbgbbbbbbbgbbbbbbb
bbbbbbbbgbbbbbbbbbbb
```

### Guaranteed power positions

| Column | Row | Drop |
|---:|---:|---|
| 4 | 18 | WIDE |
| 8 | 19 | SHIELD |
| 6 | 16 | WIDE |
| 2 | 14 | SHIELD |
| 8 | 14 | WIDE |
| 1 | 12 | LASER |
| 0 | 12 | SPLIT |
| 6 | 10 | SHIELD |
| 10 | 9 | SLOW |
| 9 | 8 | WIDE |
| 7 | 6 | LASER |
| 10 | 6 | SHIELD |
| 9 | 6 | FIRE |
| 2 | 4 | WIDE |
| 17 | 4 | SPLIT |
| 14 | 9 | SPLIT |
| 17 | 13 | SLOW |
| 12 | 18 | SLOW |
| 16 | 10 | FIRE |

These use the unchanged deterministic Vault drop table. Every listed gem gives its stated power when hit. Collapse alone does not issue its gem power; normal brick drops are not added. No new random loot mechanism is introduced.

### Reproducible route data

Initial serpent cells:

```json
[[16,2],[17,2],[18,2],[19,2],[19,1],[19,0],[18,0],[17,0],[16,0],[15,0],[14,0],[14,1]]
```

Dijkstra route:

```json
[[15,2],[14,2],[14,3],[14,4],[14,5],[14,6],[14,7],[14,8],[14,9],[14,10],[14,11],[14,12],[14,13],[14,14],[14,15],[14,16],[13,16],[12,16],[11,16],[10,16],[9,16],[8,16],[7,16],[7,15],[7,14],[7,13],[7,12],[7,11],[7,10],[8,10],[8,9],[8,8],[8,7],[8,6],[8,5]]
```

Ordinary-hit brick coordinates used in the dig proof:

```json
[[7,19],[6,18],[7,17],[7,15],[6,14],[7,13],[7,11],[7,10],[7,9],[8,7],[8,6]]
```

The preview recolours the whole serpent draw with hue-rotate(-95deg), a temporary runtime proof rather than final production art. Starting direction is left. The rendered 12-cell silhouette, continuous ribbon and face remain the existing design; final palette/material work follows the chosen direction.

## V2-B — TWIN KEEPS

The player can commit to the 48-unit inner tower at columns 6…8 or work around the wider outer balcony to the right. The centre granite spine at columns 9…10 separates those approaches; the row-12 right buttress requires a bank around its end. Violet courses reinforce both upper approaches. WIDE, SHIELD and SLOW come early; FIRE, SPLIT and LASER sit deeper.

The rose serpent begins upper-left. Granite column 5 reaches row 13, so it must work down the left side before coming across and climbing to Lumi. The route is genuinely longer than the original even though this option has a shorter serpent deadline than A. A left hanging cache at columns 1…3, rows 12…14 is held by the LASER gem at (2,11). One support releases 7 bricks. The room is an optional tactical reward, not a required extra mechanic.

### Exact map

Legend: t teal (2 HP), v violet (2), c coral (1), b blue (1), g gem (1), # granite, = cage, . empty. Coordinates are zero-indexed.

```text
.....#tttttttttttttt
.....#tttttttttttttt
.....#########tttttt
ttttt##======#tttttt
ttgtt##======#tttgtt
ttttt##======#tttttt
vvvvv#vgv##gvvvvvvvv
vvvvv#vvg##v..vvvvvv
vvvvv#vvv##gvvvvvvvv
vvvvv#vvv##vvvgvvvgv
###cc#gvv##ccccccccc
..g..#c..##ccccccccc
.ccc.#cgc######cgccc
.ccc.#gcc##cccc..gcc
.bgb.b..g##bbbbbbbbb
.....bbbb##bbbbbbbbb
bbb..bgbbbbbbbbbbbbb
bbbbbbbbbbbbbbbbgbbb
bbbbgbbbbbbbgbbbbbbb
bbbbbbbbgbbbbbbbbbbb
```

### Guaranteed power positions

| Column | Row | Drop |
|---:|---:|---|
| 4 | 18 | WIDE |
| 8 | 19 | SHIELD |
| 6 | 16 | WIDE |
| 2 | 14 | SHIELD |
| 8 | 14 | WIDE |
| 6 | 13 | SLOW |
| 7 | 12 | SLOW |
| 6 | 10 | SHIELD |
| 7 | 6 | LASER |
| 11 | 6 | WIDE |
| 11 | 8 | SLOW |
| 8 | 7 | FIRE |
| 14 | 9 | SPLIT |
| 16 | 12 | WIDE |
| 17 | 13 | SLOW |
| 12 | 18 | SLOW |
| 16 | 17 | WIDE |
| 18 | 9 | SHIELD |
| 17 | 4 | SPLIT |
| 2 | 4 | WIDE |
| 2 | 11 | LASER |

These use the unchanged deterministic Vault drop table. Every listed gem gives its stated power when hit. Collapse alone does not issue its gem power; normal brick drops are not added. No new random loot mechanism is introduced.

### Reproducible route data

Initial serpent cells:

```json
[[2,2],[1,2],[0,2],[0,1],[0,0],[1,0],[2,0],[3,0],[4,0],[4,1],[3,1],[2,1]]
```

Dijkstra route:

```json
[[3,2],[4,2],[4,3],[4,4],[4,5],[4,6],[4,7],[4,8],[4,9],[4,10],[4,11],[4,12],[4,13],[4,14],[5,14],[6,14],[7,14],[7,13],[7,12],[7,11],[7,10],[7,9],[7,8],[7,7],[7,6],[7,5]]
```

Ordinary-hit brick coordinates used in the dig proof:

```json
[[3,19],[4,18],[3,17],[5,14],[7,13],[8,12],[8,10],[7,9],[8,8],[8,7],[8,6]]
```

The preview recolours the whole serpent draw with hue-rotate(55deg), a temporary runtime proof rather than final production art. Starting direction is right. The rendered 12-cell silhouette, continuous ribbon and face remain the existing design; final palette/material work follows the chosen direction.

## Sustained rally samples

The bot runs actual level updates at 1/120 second, using the normal paddle smoothing and 1.15 drag mapping. It tracks the lowest falling ball with a small sine error, releases caught balls at its assigned angle, and does not press powers or delete bricks. It deliberately prevents automatic catch to keep rallies moving. Randomness is seeded per run. This bot has perfect ball-state access and is much stronger than a new touch player.

| Layout | Phone | Serve radians | Elapsed s | Paddle returns | Bricks broken by player | Lives | Outcome |
|---|---|---:|---:|---:|---:|---:|---|
| V2-A | ios | -0.5 | 22.883 | 15 | 92 | 3 | escape |
| V2-A | ios | 0.18 | 26.342 | 28 | 115 | 3 | escape |
| V2-A | ios | 0.5 | 53.725 | 56 | 119 | 3 | Cage attack |
| V2-A | android | -0.5 | 16.992 | 11 | 78 | 3 | escape |
| V2-A | android | 0.18 | 47.883 | 115 | 128 | 3 | escape |
| V2-A | android | 0.5 | 25.125 | 25 | 76 | 3 | escape |
| V2-B | ios | -0.5 | 16.358 | 10 | 104 | 3 | escape |
| V2-B | ios | 0.18 | 11.850 | 13 | 67 | 3 | escape |
| V2-B | ios | 0.5 | 23.125 | 23 | 102 | 3 | escape |
| V2-B | android | -0.5 | 15.592 | 12 | 64 | 3 | escape |
| V2-B | android | 0.18 | 17.300 | 11 | 88 | 3 | escape |
| V2-B | android | 0.5 | 25.625 | 18 | 92 | 3 | escape |

All twelve sustained samples keep finite ball state. Each page reports zero page errors. The successful rescues show that the layouts can be played with sustained rallies; failed/unfinished samples show the controller is not guaranteed a win. They do not establish first-time difficulty or retention. V2-B's fastest powered runs are still a balance risk if the owner wants every rescue to last much longer.

The hanging room tests remove the actual support gem and invoke real collapse(): A drops 8 objects, B drops 7, consistently on both phone geometries. These are separate from the ordinary-hit route proof. Idle serpent timings match across phone sizes; rally outcomes differ because the raised paddle and return distance differ.

## Reproduction and review files

- design/phase1/img/level-layout-v2-a.png and level-layout-v2-b.png: owner image choices.
- out/level-design-v2/{A,B}-{ios,android}.png: four opening phone captures.
- out/level-design-v2/{A,B}-{ios,android}-play-8s.png: sustained-play snapshots.
- out/level-design-v2/{A,B}.html: isolated playable bundles with the proposed granite rule.
- out/level-design-v2/options.mjs: exact maps, guaranteed power list, serpent start and colour proof.
- out/level-design-v2/render.mjs: source injection, collision assertions, route/collapse/idle checks, sustained simulations and captures.
- out/level-design-v2/metrics.json: detailed measured results; boards.mjs and report.mjs reproduce the presentation.

All prototype code and bundles live under ignored out/. No production src/, assets, tests or dist/ file is modified. Use the already-configured Node 22 executable to run render.mjs, boards.mjs, play-captures.mjs and report.mjs from the repo root. No dependency is added.

**Owner decision:** choose V2-A or V2-B, including the stated granite/bar collision rule. Production integration, human phone playtests, final serpent art, stars/score tuning and the final difficulty pass remain pending. Approval of a direction is not approval to commit or push the implementation.

---

# Superseded round 1 — withdrawn, do not build

The following is an archival design record. Its choices, recommendation and old approval wording are superseded by the round-2 status above. The former A selection is revoked.

# Level layout options: Invasion and The Vault

Status: two review proposals, 2026-10-18. Neither layout is selected or integrated. The images show the actual candidate collision grids rendered with the existing game art, HUD, paddle and thumb deck. They are not new background illustrations.

The owner requested level work in parallel with the replacement knight design. Scope is the two existing levels, using existing brick kinds, robot behaviour, power-ups, serpent, cage and collapse rules. No later chapter or new mechanic is included.

## Image choices

- **A — Open Gate, recommended for the clearest opening.** [Board](img/level-layout-a.png). A low, aimable reward introduces Invasion; a broad centre shaft makes the Vault objective easy to read.
- **B — Twin Fronts, recommended if side-angle decisions matter more.** [Board](img/level-layout-b.png). Two Invasion wings carry different rewards; two Vault shafts meet below Lumi, with an optional central collapse.

Both boards are 1280 × 1820 PNGs. They use iPhone 393 × 852 captures. Matching raw captures also exist for Android 412 × 915; see verification below. Choose the layout family independently from Kit's character letter.

## Fixed contracts

| Metric | Value |
|---|---|
| World width | 360 units |
| Normal ball / titan diameter | 12 / 20 units |
| Invasion grid | 11 × 9, cells 28 × 18, initial origin (26, 92) |
| Invasion horizontal march envelope | grid x = 12…348, within play walls x = 10…350 |
| Vault grid | 20 × 20, 16-unit cells, origin (20, 96) |
| Vault cage | columns 7…12, rows 3…5; granite roof/side frame and top six rows unchanged |
| Serpent starting cells | (16,1), (17,1), (18,1), (19,1), (19,0), unchanged |
| A open shaft | columns 8…11, 64 units wide between authored gate rows |
| B open shafts | columns 4…7 and 12…15, each 64 units wide |
| Contact physics, brick HP, collapse, aim, bolt and march code | unchanged |

Maps below are zero-indexed from the top-left. Invasion: `c` = candy (1 HP), `a` = armour (3 HP), `p` = guaranteed power brick (1 HP), `b` = Clank (2 HP), `.` = empty. Vault: `t` = teal (2 HP), `v` = violet (2 HP), `c` = coral (1 HP), `b` = blue (1 HP), `g` = gem (1 HP), `#` = indestructible granite, `=` = cage bars. Glazed Vault bricks retain the existing two-cell running bond.

The 64-unit dimensions describe open shafts, not gaps through unbroken gates. Removing one ordinary two-cell gate brick opens 32 units. A normal ball's centre then has 20 units of clearance; the titan pierces the remaining gate. The exact flood-fill escape may also turn between staggered openings. These are aiming spaces, not an assertion that every shot can travel vertically through every row.

## A — Open Gate

### Intended experience

Invasion begins with a small three-target toe at the bottom. Aim a little left at its gem, column 4 row 8, to get WIDE. The target centre is (152,245); the review capture points the serve toward it. Clear the easy lower rows, then face two previously protected shooters at row 5. Side armour asks for a deliberate angle rather than forming a solid compulsory wall. The upper Clanks are the last formation beat, then the existing mothership arrives.

This is a spatial teach → practise → test sequence. It does not force a scripted order: a skilled bank shot can reach upper rows early. No robot is the lowest occupied cell in its column at the start, so none has a clear shot until cover is broken. The current 0.45-second angry wind-up and 200-unit/second bolt remain.

The Vault presents one broad dark shaft directly below Lumi. The first coral gate is row 12; another coral gate is row 9; the final violet floor at row 6 needs two hits. A left-shoulder gem at (column 7,row 15) grants WIDE if deliberately hit. Breaking the centre route is faster; taking shoulder rewards or attacking Gnash trades rescue speed for safety or score. Side granite and edge connections keep the walls supported. This option emphasises opening a route over a large scripted collapse.

Suggested pacing targets, to test after selection: low gem in the first few returns; first exposed shooter after the player has seen candy and a capsule; a brief readable release when the formation clears; the existing boss as the climax. In the Vault, the three gates should be recognisable before the first return and the first successful rescue should still feel like a race. These are design targets, not measured human completion times.

### Exact Invasion layout

```text
...bbbbb...
..ccpccpc..
.ccbcccbcc.
ccccc.ccccc
.aaa...aaa.
.ccbcccbcc.
..cccccpc..
...ccccc...
....pcc....
```

61 occupied cells: 42 candy, 6 armour, 4 power bricks, 9 Clanks; 82 total normal-hit HP. Current production has 84 occupied cells and 117 HP. Guaranteed drops use the unchanged drop formula: (4,8) WIDE, (7,6) SHIELD, (4,1) WIDE, (7,1) SPLIT. Random Clank drops remain as currently implemented.

### Exact Vault layout

```text
tttttttttttttttt....
tttttttttttttttt....
tttttt########tttttt
tttttt#======#tttttt
ttgttt#======#tttgtt
tttttt#======#tttttt
vvvvvvvvvvvvvvvvvvvv
vvvvvvvv....vvvvvvvv
vvv##vvv....vvv##vvv
vvvvvvvvccccvvvvvvvv
cccccccc....cccccccc
cccccccc....cccccccc
cccccccccccccccccccc
cccccccc....cccccccc
bbbbbbbb....bbbbbbbb
bbbbbbbg....bbbbbbbb
bbbbbbbb....bbbbbbbb
bbgbbbbb....bbbbbgbb
bbbbbbbb....bbbbbbbb
bbbbbbbb....bbbbbbbb
```

200 rendered brick objects, 182 breakable. A deterministic reachability check removes the bricks containing (10,12), (10,9), (10,6), costing 1 + 1 + 2 normal hits; the real `checkBreach()` then enters `escape`. This proves a possible route. It does not prove those hits can be made on consecutive returns, nor that four hits is the right final difficulty.

## B — Twin Fronts

### Intended experience

Invasion uses the same low WIDE target, then divides into two readable wings. The left lower gem at (2,6) grants LASER; the right lower gem at (8,6) grants SPLIT. Lower candy shields both row-5 shooters. The space between wings offers a bank-shot route behind the formation; side armour and upper Clanks test aim as the march speeds up. The existing mothership remains the finishing beat.

The Vault makes a side choice visible immediately. A straight serve hits the centre blue pillar; a moderate left or right aim enters a 64-unit shaft and reaches the coral bridge at row 13. The shafts meet through the upper six-cell crosscut. Players aim into the crosscut and break the final violet floor to rescue Lumi. Left shoulder rewards are SLOW at (3,16) and FIRE at (3,12); right rewards are SPLIT at (16,16) and WIDE at (16,12).

The lower centre pillar has a deliberate support opportunity: remove the three coral bridge bricks containing (7,13), (9,13) and (11,13), then 15 blue brick objects below lose their anchor and fall under the existing collapse rule. The running bond means two bricks are insufficient: a third overlapping support still holds the pillar. The 24 blue cells form 15 objects because alternate rows include single-cell ends. The tradeoff is clear: a satisfying wider opening, plus real falling-brick BONK risk at the paddle. This should be shown during the build playtest, not silently removed as an effect.

Suggested pacing targets: low gem → choose a wing → a short power-up payoff → remaining wing and faster march → boss. In the Vault: choose a shaft → a coral gate → a crosscut/re-aim → final floor → rescue. There is more steering and angle management than A. Actual difficulty must be measured with the selected character/story presentation and human touch input.

### Exact Invasion layout

```text
..bbb.bbb..
.ccpc.ccpc.
ccbcb.bcbcc
.cccc.cccc.
.aaac.caaa.
.cbc...cbc.
.cpc...cpc.
.cc.....cc.
....pcc....
```

59 occupied cells: 36 candy, 6 armour, 5 power bricks, 12 Clanks; 83 total normal-hit HP. Guaranteed drops: (4,8) WIDE, (2,6) LASER, (8,6) SPLIT, (3,1) SLOW, (8,1) AIM. No guaranteed gem has TINY; existing random Clank drops remain unchanged.

### Exact Vault layout

```text
tttttttttttttttt....
tttttttttttttttt....
tttttt########tttttt
tttttt#======#tttttt
ttgttt#======#tttgtt
tttttt#======#tttttt
vvvvvvvvvvvvvvvvvvvv
vvvvvvv......vvvvvvv
vvv##vv......vv##vvv
vvvvvvvccccccvvvvvvv
cccc....cccc....cccc
cccc....cccc....cccc
cccg....cccc....gccc
cccccccccccccccccccc
bbbb....bbbb....bbbb
bbbb....bbbb....bbbb
bbbg....bbbb....gbbb
bbbb....bbbb....bbbb
bbbb....bbbb....bbbb
bbbb....bbbb....bbbb
```

183 brick objects, 165 breakable. Removing the bricks containing (6,13), (7,9), (7,6), costing 1 + 1 + 2 normal hits, lets the real `checkBreach()` enter `escape`. This is a left-route connectivity check; angles, rebounds and the serpent make it a different task from A. The support test separately confirms 15 centre-pillar bricks fall after the three bridge supports are removed.

## Measured preflight

Candidate bundles are created only in ignored `out/level-design/` by replacing `LAYOUT` during an esbuild load. Production `src/`, active `dist/`, collision logic and tests are not edited. The candidate captures are design previews, not screenshots of an integrated release.

Checks run with the actual level classes at 1/120-second simulation steps:

- Exact grid dimensions; unchanged top six Vault rows, cage, and serpent start.
- Both starting Vaults remain in `rescue` after the breach check: no free cage-to-bottom win.
- Zero bricks fall on an initial `collapse()`: every starting brick has a valid support path.
- A legal finite serpent route exists in both options. Initial Dijkstra cost is **31.370 units of base chew cost**, with ten planned steps: (16,2) → (16,3) → (16,4) → (16,5) → (16,6) → (15,6) → (14,6) → (13,6) → (12,6) → (12,5). This cost is not a deadline; acceleration, travel, damage and stuns affect elapsed time.
- With the served ball held and no player interference, the actual update loop starts Gnash's cage attack at **25.175 simulated seconds** in both options and phone sizes, after skipping the intro. This is the measured idle deadline to first attack, not the final loss time.
- The unchanged formation reaches `landed` at **75.692 seconds on iPhone**, **89.317 seconds on Android**, with no hits or exposed shooters. Different paddle height causes this substantial timing difference; it needs a balance decision after selection. With fewer cells alive, the existing march accelerates, so these are not clear-time estimates.
- Zero initial exposed robot shooters in either option; both first row-5 shooters become possible only after their column's lower cover is removed. A row-5 bolt launched at the starting height has about 1.74 seconds of flight to the iPhone paddle or 1.95 seconds on Android, in addition to the 0.45-second wind-up. Descents shorten those flight times.
- Five actual normal-ball serves at angles −0.7, −0.3, 0, +0.3, +0.7 radians contact bricks with finite ball state in each candidate, each level, each phone size: 40 serve-angle cases. A's straight serve reaches row 12; B's moderate side serves reach row 13, while its straight serve hits the centre pillar. These are first-contact tests, not full-run playtests.
- No page errors across the four candidate/device pages. Lilita One and Rubik are explicitly loaded before captures.

| Phone | Viewport / fake safe insets | World height including existing lift | Paddle / deck world y |
|---|---|---:|---:|
| iPhone | 393 × 852 / 59,34 | 729 | 547 / 581 |
| Android | 412 × 915 / 32,24 | 785 | 589 / 623 |

The existing safe HUD, raised paddle and control deck fit both captures. No new interactive UI is introduced. Runtime palettes, materials, sprite sizes and fonts are reused; the boards add no new gameplay colours. Lower Vault yellow bands are replaced with existing blue/coral/violet bricks so yellow remains an accent.

Review files:

- `out/level-design/{A,B}-{ios,android}-{invasion,vault}.png`: eight full phone screenshots.
- `out/level-design/{A,B}.html`: isolated playable candidate bundles.
- `out/level-design/options.mjs`: exact candidate data.
- `out/level-design/render.mjs`: assertions and capture harness.
- `out/level-design/metrics.json`: detailed measurements and five-angle contacts.

To reproduce locally from the repo root, use the configured Node 22 executable with `out/level-design/render.mjs`, then `out/level-design/boards.mjs`. The harness imports the already-installed Playwright runtime and Chromium documented in the handoff. Nothing new is installed.

## Recommendation and remaining work

**Choose A for immediate route clarity; choose B for meaningful side aiming and the stronger collapse opportunity.** A is the safer first direction for the story opening. B is the more interesting skill layout once the player has learned catch and aim. Neither should be described as a finished, tuned climax stage yet.

After the owner's pick, integrate only the selected maps, play full runs with human-like steering on both phone sizes, show the opening/gates/robot fire/collapse/rescue/boss/loss screenshots, and tune the gates if the four-hit route makes the rescue trivial. Check the unchanged Vault 10,000-score star threshold against the smaller map and shorter route. The owner approves the played result before any commit or push.

**Open decision:** select level A or B. Full-run completion rates, touch-device feel, both B rescue branches, boss balance and the current score-star target are not yet validated; four-hit rescue reachability is the main difficulty risk.
