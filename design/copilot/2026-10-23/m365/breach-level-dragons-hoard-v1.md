---
breach_drop: 1
kind: level
slug: dragons-hoard
version: 1
date: 2026-10-23
status: proposal
tool: Copilot Studio
depends_on: ["powerups-round2", "difficulty-round2", "apk-critique-2026-10-23"]
---

# Chapter 12: Dragon's Hoard

## Summary
- **Pitch 1:** a heist. Kit sneaks into Ember's cave to steal back the Brickhaven Crown while the dragon sleeps on his hoard.
- **Pitch 2:** greed is the twist. Gold bricks pay big (score, hero charge, double drop chance), but every gold brick stirs Ember.
- **Pitch 3:** three floors of 25 to 40 s each. Sneak, then grab, then a duel with a dragon whose starting mood depends on how greedy you were.
- **Greed is shown on Ember, not on a HUD bar.** You rolled back meters in P2, so greed reads through his eyes, smoke and posture.
- This uses the locked power-ups (gold boosts drops), the March from difficulty-round2 v2 (still a proposal) and the brick look from P9.

## Decisions for the owner
1. How greed is shown: A on Ember only (sleeping → one eye open → head up → awake) [RECOMMENDED]; B a small coin-pile bar under the floor label.
2. Lumi: A the heist is Kit alone, and Lumi appears in the ending wearing the recovered crown [RECOMMENDED]; B Lumi caged on the hoard (adds her fear stages).
3. Gold reward: A drop chance x2 [RECOMMENDED]; B x1.5 (gentler).

## Spec

### The twist: greed
Greed is a whole number from 0 up to a wake threshold of **[12, 10, 8]** (Easy / Medium / Hard). A coin brick `g` adds +1; a chest `G` adds +2.

| Greed | What Ember shows | Effect |
|---|---|---|
| 0 to 3 | Asleep, slow snore smoke chips from his nostrils | None |
| 4 to 6 | One ice-blue eye cracked open and tracking the ball | The March steps x0.9 faster |
| 7 to threshold−1 | Head lifted, nostril plates glow copper #E86A3A | March x0.8; a growl sound every 4 s |
| Threshold | **Wakes: Hoard Roar** (hazard 1) | Greed resets to 4 |

**Counterplay:** every 6 non-gold bricks broken lowers greed by 1. Hitting Ember's head while he is asleep is not allowed (he sits behind the formation on floors 1 and 2). The greedy route is faster and stronger; the careful route is slower and safer.

**Carry-over:** greed at the end of floor 2 sets Ember's starting rage on floor 3: 0 to 3 → stage 0, 4 to 6 → stage 1, 7 or more → stage 2.

**Third star:** clear the chapter without waking Ember on floors 1 and 2.

### Floors

| Floor | Goal | Hazard | Tell (s) | Bricks (gold) | Seconds |
|---|---|---|---|---|---|
| 1 Sleeping Hoard | Break the gem wall around the crown chest without waking Ember | Hoard Roar, only if greed hits the threshold | 1.6 | 44 (6) | 25 to 35 |
| 2 Coin Falls | Climb the treasure terraces; avalanches pour down the side chutes | Coin avalanche every [12, 10, 8] s, plus Hoard Roar on greed | 1.4 | 45 (7) | 30 to 40 |
| 3 Ember's Bed | Duel: break Ember's coin crust and beat him | Breath and Wing Gust, alternating | 1.6 / 1.5 | 24 (2) + Ember | 30 to 40 |

### Hazards

| Id | Tell | Tell (s) | Counterplay | Cost |
|---|---|---|---|---|
| hoard-roar | Ember inhales, his chest plates glow copper, and a scorched 72-wide stripe appears on the floor under the paddle's current x | [1.8, 1.6, 1.4] | Slide out of the stripe | Paddle scorched: width x0.75 for 3 s. It never breaks bricks or hits the ball. |
| coin-avalanche | The corner pile shivers, coins clink, and glints run down the 60-wide side chute | [1.6, 1.4, 1.2] | Move away; or break the `a` brick next to the chute to close it for 15 s | Up to 8 coin chips tumble for 1.2 s. They deflect the ball, and on the paddle drag speed drops to x0.7 for 1.5 s. They destroy no bricks. |
| wing-gust | Wings rise and dust chips lift off the hoard | [1.8, 1.5, 1.3] | Hold Focus aim (slow time) and re-aim | All balls pushed sideways 90 units/s for 0.8 s |

- **First showings are harmless.** Ember's first roar is a yawn that fizzles to smoke. The first avalanche spills only 2 coins, away from the paddle.
- **Spacing:** no two tells overlap, and no hazard lands within 0.6 s of a paddle return (from P2).

**Ember's hit targets (floor 3)**
- **Head:** 56x36, always hittable, 1 damage.
- **Belly plates:** 72x40, exposed for 2.5 s after each breath while he pants, 2 damage.
- **Ram:** 5 damage, using the locked P1 numbers.
- Never invulnerable.

### Difficulty

| Value | Easy | Medium | Hard |
|---|---|---|---|
| Ember HP | 30 | 42 | 56 |
| Tell (s) | 1.8 | 1.6 | 1.4 |
| Hazard interval (s) | 10 | 8.5 | 7 |
| Greed to wake | 12 | 10 | 8 |
| March step, floors 1 and 2 (s) | 12.6 | 9 | 6.9 |
| Rage step, floor 3 (s) | 30 | 22 | 16 |
| Run length (min) | 3.5 | 4.5 | 5.5 |
| First-try win rate | 0.80 | 0.35 | 0.15 |


### Stickiness and urgency
- **Urgency:** the March pushes the hoard toward Kit, and Ember's eye opens as greed rises. The player can feel two pressures at once without any HUD.
- **One-more-run:** greedy runs score 2 to 3 times more and charge powers faster. A careful run gets the third star. Players will replay to try the other route.

### Physics notes
- **Moving parts:** the formation (March, 18 units per step), coin chips (at most 8 live; solid for 1.2 s, then they fade), Ember's head bob (±4 units) and wings (solid only while raised).
- **Trap risks:**
  - The granite `#` pillars on floor 2 next to the side lanes could cause a vertical loop. The P2 nudge after 8 s without a paddle touch fixes it.
  - Coin chips must never wedge the ball against a wall. If the ball touches the same chip 3 times, the chip turns non-solid.

### Brick grids (10 columns, cell 34x18, bricks drawn 32x16, columns 0 and 9 empty as side lanes)
Floor 1, origin [10, 150]:
```
.tt.tt.tt.
.vg.vv.gv.
..rr.aa.r.
.bb.GG.bb.
.tg.tt.gt.
..vv..vv..
.r.rr.r.r.
.tt.bb.tt.
```
Floor 2, origin [10, 130]:
```
..aa.aa...
.#r.vv.r#.
.tg.bb.gt.
.#v.GG.v#.
.rr.tt.rr.
.a.vgv.a..
.bt.rr.tb.
..g.vv.g..
.tt.aa.tt.
```
Floor 3, origin [10, 250] (Ember fills y 96 to 230):
```
.aa.aa.aa.
.tg.vv.gt.
..r.bb.r..
.v..tt..v.
.bb....bb.
```
The legend is in the JSON.

### Reuse versus new art

| Item | Reuse or new |
|---|---|
| Kit, paddle, ball, Ram, March, build tray | Reuse |
| Coloured, armour and granite bricks | Reuse bricks-glaze-v2 (P9) |
| Ember | New (P8 sheets) |
| Calm dark cave background with a few gold glints | New (art request 1) |
| Coin brick, chest brick, coin chips, side chute | New (art request 2) |

## Data
```json
{
  "kind": "level",
  "name": "Dragon's Hoard",
  "hero": "kit",
  "chapter_slot": 12,
  "floors": [
    {
      "floor": 1,
      "goal": "break the gem wall around the crown chest without waking Ember",
      "hazard": "hoard-roar only when greed reaches the threshold",
      "tell_s": 1.6,
      "bricks": 44,
      "seconds": [
        25,
        35
      ]
    },
    {
      "floor": 2,
      "goal": "climb the treasure terraces past side-chute avalanches",
      "hazard": "coin-avalanche every [12,10,8] s plus hoard-roar on greed",
      "tell_s": 1.4,
      "bricks": 45,
      "seconds": [
        30,
        40
      ]
    },
    {
      "floor": 3,
      "goal": "duel Ember: head always hittable, belly exposed after breath",
      "hazard": "hoard-roar and wing-gust alternating",
      "tell_s": 1.6,
      "bricks": 24,
      "seconds": [
        30,
        40
      ]
    }
  ],
  "hazards": [
    {
      "id": "hoard-roar",
      "tell": "inhale, copper chest glow, scorched 72-wide stripe on the floor under the paddle",
      "tell_s": 1.6,
      "counterplay": "slide out of the stripe",
      "cost": "paddle width x0.75 for 3 s; breaks no bricks"
    },
    {
      "id": "coin-avalanche",
      "tell": "corner pile shivers, coins clink, glints run down the 60-wide side chute",
      "tell_s": 1.4,
      "counterplay": "move away, or break the armour brick by the chute to close it for 15 s",
      "cost": "up to 8 deflecting coin chips; paddle drag x0.7 for 1.5 s"
    },
    {
      "id": "wing-gust",
      "tell": "wings rise, dust chips lift",
      "tell_s": 1.5,
      "counterplay": "hold Focus aim and re-aim",
      "cost": "balls pushed sideways 90 units/s for 0.8 s"
    }
  ],
  "difficulty": {
    "villainHP": [
      30,
      42,
      56
    ],
    "tell_s": [
      1.8,
      1.6,
      1.4
    ],
    "hazardInterval_s": [
      10,
      8.5,
      7
    ],
    "greedToWake": [
      12,
      10,
      8
    ],
    "avalancheInterval_s": [
      12,
      10,
      8
    ],
    "marchStep_s": [
      12.6,
      9,
      6.9
    ],
    "rageStep_s": [
      30,
      22,
      16
    ],
    "target_minutes": [
      3.5,
      4.5,
      5.5
    ],
    "target_first_try_win_rate": [
      0.8,
      0.35,
      0.15
    ]
  },
  "greed": {
    "perCoin": 1,
    "perChest": 2,
    "reducePer6NonGold": 1,
    "stages": [
      {
        "range": [
          0,
          3
        ],
        "show": "asleep, snore smoke chips",
        "marchScale": 1.0
      },
      {
        "range": [
          4,
          6
        ],
        "show": "one eye open tracking the ball",
        "marchScale": 0.9
      },
      {
        "range": [
          7,
          "threshold-1"
        ],
        "show": "head up, copper nostril glow, growl every 4 s",
        "marchScale": 0.8
      }
    ],
    "onWake": "hoard-roar, then greed resets to 4",
    "carryToFloor3Rage": {
      "0-3": 0,
      "4-6": 1,
      "7+": 2
    },
    "thirdStar": "never wake Ember on floors 1 and 2"
  },
  "weak_points": [
    {
      "part": "head",
      "w": 56,
      "h": 36,
      "damage": 1,
      "always": true
    },
    {
      "part": "belly plates",
      "w": 72,
      "h": 40,
      "damage": 2,
      "window_s": 2.5,
      "after": "each breath"
    }
  ],
  "grid": {
    "cols": 10,
    "rows": 9,
    "cell": [
      34,
      18
    ],
    "brick_draw": [
      32,
      16
    ],
    "origin": [
      10,
      150
    ],
    "floor_origins": {
      "1": [
        10,
        150
      ],
      "2": [
        10,
        130
      ],
      "3": [
        10,
        250
      ]
    },
    "map": [
      ".tt.tt.tt.",
      ".vg.vv.gv.",
      "..rr.aa.r.",
      ".bb.GG.bb.",
      ".tg.tt.gt.",
      "..vv..vv..",
      ".r.rr.r.r.",
      ".tt.bb.tt."
    ],
    "maps": {
      "1": [
        ".tt.tt.tt.",
        ".vg.vv.gv.",
        "..rr.aa.r.",
        ".bb.GG.bb.",
        ".tg.tt.gt.",
        "..vv..vv..",
        ".r.rr.r.r.",
        ".tt.bb.tt."
      ],
      "2": [
        "..aa.aa...",
        ".#r.vv.r#.",
        ".tg.bb.gt.",
        ".#v.GG.v#.",
        ".rr.tt.rr.",
        ".a.vgv.a..",
        ".bt.rr.tb.",
        "..g.vv.g..",
        ".tt.aa.tt."
      ],
      "3": [
        ".aa.aa.aa.",
        ".tg.vv.gt.",
        "..r.bb.r..",
        ".v..tt..v.",
        ".bb....bb."
      ]
    },
    "legend": {
      ".": "empty",
      "r": "coral 1HP #FF6F61",
      "v": "violet 1HP #8F5CF0",
      "t": "teal 1HP #22C4B0",
      "b": "blue 1HP #4F9DFF",
      "g": "gold coin brick 1HP #F4C542, greed +1, score 50, hero charge +3, drop chance x2",
      "G": "treasure chest 2HP, dark wood #6B3F2A with gold trim #F4C542, greed +2, score 150, guaranteed good capsule",
      "a": "armour 2HP #8D97B3 with coloured inner layer (bricks-glaze-v2)",
      "#": "granite indestructible #4A4F6E, chunky stone shape"
    }
  },
  "reuse": [
    "Kit, paddle, ball, Sweet-Spot Ram (powerups-round2)",
    "build tray and drop rules (powerups-round2)",
    "March and rage (difficulty-round2)",
    "bricks-glaze-v2 coloured, armour and granite bricks"
  ],
  "new_art": [
    {
      "need": "Ember turnaround, expressions, key poses, parts",
      "prompt_file": "10"
    },
    {
      "need": "calm dark cave background",
      "prompt_file": "30"
    },
    {
      "need": "coin brick, chest brick, coin chips, chute",
      "prompt_file": "20"
    }
  ]
}
```

## Art requests
1. **Cave background.** HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo. HOW THE GAME PLAYS (the picture must read as a playable board). This is a portrait phone brick breaker. A small chrome ball bounces off a low chrome paddle and breaks bricks. Bricks are glossy glazed tiles, all the same size within a row, never tiny. The ball is small (about 3% of screen width). The paddle is a chrome capsule about 28% of screen width, low on the screen, with a large EMPTY dark lower quarter above it so the ball has room to come back. Every brick, wall, ramp and enemy sits well above that empty lane. The ball must be able to reach every important target: leave open vertical lanes down both side walls and at least two broad gaps in every brick band; a decorative arch or door is never counted as a route. Breakable bricks and indestructible blocks (dark granite or iron) differ by shape and material, not only by colour. Any enemy weak point is a broad body part, never a tiny spot. A visible warning (a glow, a lit lamp, a raised arm) comes before any hazard; never draw a hazard hitting the player. HUD is minimal and calm: pause button top-left, three small chrome life balls, a short level label at top centre, score top-right; no instructions or paragraphs inside the playfield. The hero's small round face portrait (face orb) sits lower-left in the control area; the centre of the bottom area is a clear empty drag lane. The background is dark, calm and desaturated several stops below the foreground: no bright planets, torches, beams or light shafts competing with the ball. Glossy bricks and characters lead the eye and the white chrome ball is easy to find. Asset type: portrait phone background for chapter "Dragon's Hoard", 9:19.5. A deep calm cave in navy and slate (#22284A to #141831 to #0A0C18) with a soft vignette. Low rounded stone terraces at the top third, where the hoard sits, and two narrow stone chutes on the side walls. Only a few small, dim gold glints in the far distance. The lower half is nearly empty and dark. No bricks, no characters, no UI. NOT: torches, lava, glowing crystals, light shafts, bright gold piles.
2. **Hoard props sheet.** HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo. BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers. Asset type: 3x2 sprite sheet. Cell 1: a gold coin brick, 32x16 game-unit proportion, a glazed tile embossed with a stack of coins, gold #F4C542 with a darker rim. Cell 2: a treasure chest brick, same proportion, dark wood #6B3F2A with small gold trims. Cell 3: the same chest cracked. Cells 4 and 5: chunky coin chips, 3 different coins each, tumbling at different angles. Cell 6: a short curved stone chute segment in dark granite #4A4F6E. Gold stays small and controlled on a dark subject.

## Rules check
- Telegraphed hazards with a 1.2 to 1.8 s tell and a harmless first showing: OK.
- Ordinary ball play always makes progress, no tiny weak points: OK. Ember's head is 56x36, his belly 72x40, and he is never invulnerable.
- Enemy attacks never destroy the player's bricks for rewards: OK. Roar, coins and gust break nothing.
- Difficulty changes numbers only: OK.
- Pause, Continue and Retry keep progress: OK. Greed and floor carry over on Continue.
- No power-up required to win: OK. Gold is optional.
- Effects are rendered things, never plain circles or rings: OK (smoke chips, coin chips, scorch stripe).
- Look (dark calm background, little yellow): OK. Gold is 13% of bricks, and the background art request forbids bright gold.
- Mobile: OK. No new HUD.

## Open questions for Claude
1. Does a coin chip count as a "hazard hitting the player"? Recommended: no. It is a deflecting physics object with a 1.4 s tell.
2. Can capsules from the double drop chance overflow max falling? Recommended: no. Keep the P1 caps (2 / 2 / 1) and the pending-drop rule.
3. Greed during a Continue? Recommended: keep it, but cap it at threshold−3.
4. Can Lumi's Starlight Notes trigger greed? Recommended: no. Only ball hits on gold count.
5. Which theme does it go under? Recommended: Princess / castle theme, slot 12, after Serpent Rivals.
