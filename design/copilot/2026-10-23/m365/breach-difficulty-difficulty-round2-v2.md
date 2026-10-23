---
breach_drop: 1
kind: difficulty
slug: difficulty-round2
version: 2
date: 2026-10-23
status: proposal
tool: Copilot Studio
depends_on: ["powerups-round2"]
---

# Difficulty rework, round 2: "The board fights back"

## Summary
- Urgency lives inside the playfield, with no HUD bars: the brick formation (or the chapter's threat) **marches down** toward the paddle, Arkanoid crossed with Space Invaders. On duel floors the villain's **rage** shows on its face and speeds up its attacks.
- Chapters 4 to 11 get faster hazards, more HP and more bricks. Medium becomes the real game (first-try wins of 35 to 65% after chapter 3).
- Frost Warden (5) is rebuilt as the first real wall: an advancing frost line plus the Warden. Its look must be redone in the house style (separate level and art drops).
- Breathers sit at 3, 7 and 10, so pressure rises in waves, not as a flat wall.
- All modes keep the same attacks. Only numbers change, and every hazard has a 1.2 to 1.8 s tell and a safe first showing.

## Decisions for the owner
1. When the march reaches the danger line: A the bottom row shatters harmlessly, the player loses one life and the formation lifts 3 steps [RECOMMENDED]; B instant level loss; C the paddle shrinks to TINY for 8 s instead of losing a life.
2. First real wall: A chapter 5 Frost Warden (rebuilt) [RECOMMENDED]; B chapter 9 Gatehouse Siege.
3. Hard ball speed: A 370 units/s base [RECOMMENDED]; B 345 (same as Medium, Hard is harder only through hazards).
4. Forgiving first life: A the first lost ball per attempt on Easy and Medium is returned free, with 2 s of shield [RECOMMENDED]; B none.

## Spec

### 1. Targets per chapter

Run length is in minutes; win rate is first-try wins. Values are Easy / Medium / Hard.

| # | Chapter | Run length (min) | First-try win rate | Role |
|---|---|---|---|---|
| 1 | Carrier Breakout | 2 / 2.5 / 3 | 0.95 / 0.80 / 0.50 | Onboarding, teaches aim and drops |
| 2 | The Vault | 2.5 / 3 / 3.5 | 0.90 / 0.65 / 0.40 | First spike: a moving threat |
| 3 | Circuit Breakout | 2 / 2.5 / 3 | 0.92 / 0.75 / 0.45 | **Breather** |
| 4 | Shutter Forge | 2.5 / 3.5 / 4 | 0.88 / 0.60 / 0.30 | Pressure rises |
| 5 | Frost Warden | 3 / 4 / 4.5 | 0.85 / 0.45 / 0.20 | **First real wall** (Continue screen catches you) |
| 6 | Mooncoil Reliquary | 3 / 4 / 4.5 | 0.85 / 0.50 / 0.25 | Two threats at once |
| 7 | Bellforge Run | 2.5 / 3.5 / 4.5 | 0.88 / 0.55 / 0.25 | **Breather**, readable rhythm |
| 8 | Tidewheel Citadel | 3 / 4 / 5 | 0.85 / 0.45 / 0.20 | Rises again |
| 9 | Gatehouse Siege | 3.5 / 4.5 / 5.5 | 0.80 / 0.35 / 0.15 | **Second wall**, 3 floors |
| 10 | Lumi Breaks Out | 3 / 3.5 / 4.5 | 0.85 / 0.55 / 0.25 | **Breather**, hero change |
| 11 | Serpent Rivals | 3.5 / 5 / 6 | 0.80 / 0.30 / 0.12 | Finale |

### 2. The curve in words
Chapter 1 is a safe runway: drops are generous and the aim hint teaches Focus. The Vault (2) is the first spike, because Gnash is a threat that moves on its own. Circuit (3) is a short breather in space with simple rules. Pressure climbs through Shutter Forge (4) into the rebuilt Frost Warden (5), **the first real wall**. Medium players will usually see the Continue screen here for the first time, and that is intended. Mooncoil (6) keeps the pressure with two serpents. Bellforge (7) is a rhythm breather: hard numbers, but very readable bells. Tidewheel (8) brings back the rising-water panic. Gatehouse (9) is the **second wall** and the look standard: three floors with no full reset between them. Lumi Breaks Out (10) is a breather through novelty, because the hero swap changes the feel. Serpent Rivals (11) is the finale, with the highest pressure and both serpents at once.

### 3. Values per mode `[easy, medium, hard]`
Shared values (unchanged, from locked powerups-round2): hero charge 24 / 30 / 36, max balls 12 / 9 / 5, max cosmic 2 / 2 / 1, max power timer 20 / 18 / 14 s.

Base ball speed (all chapters): **[330, 345, 370]**. Medium stays at the real 345; the rally cap stays at 1.28x.

| # | villainHP | tell_s | hazardInterval_s | bricks | villainSpeed (x) | What changed and why |
|---|---|---|---|---|---|---|
| 1 | raider [2,3,4] | [1.8,1.6,1.4] | raid every [12,10,8] | [40,48,56] | raider [0.8,1.0,1.2] | Extraction [8,7.5,8.5] → [9,7.5,6.5]: Hard was slower than Medium, which looks like a bug |
| 2 | Gnash head [10,14,18] | [1.8,1.6,1.4] | lunge [11,9,7.5] | 20x20 grid | serpent [0.6,0.8,1.1] | Hard 1.0 → 1.1; the brief's Easy and Medium values are kept |
| 3 | iris core [8,12,16] | [1.8,1.6,1.4] | [12,10,8.5] | [44,52,60] | — | Proposed values |
| 4 | cannons x3 [4,6,8] each | [1.8,1.6,1.4] | cannon volley [10,8,6.5] | [50,60,70] | shutter drop [0.8,1.0,1.2] | Proposed; it felt too easy |
| 5 | Warden [28,38,50] | [1.8,1.6,1.4] | arrow volley [9,7.5,6] | [60,72,84] | frost line [0.7,1.0,1.3] | **Rebuild**: frost line plus Warden |
| 6 | Mooncoil [24,32,42] + Gnash stun [6,8,10] | [1.8,1.6,1.4] | counterweight [10,8,6.5] | [56,66,78] | serpents [0.7,0.9,1.15] | Proposed; it felt too easy |
| 7 | villain [26,36,48] | [1.8,1.6,1.4] | bell roll [9.5,8,6.5] | [52,62,72] | bells [0.85,1.0,1.2] | HP [24,32,40] → [26,36,48]; interval [10,8.5,7.5] → [9.5,8,6.5]: it felt too easy |
| 8 | Nerra [30,40,52] | [1.8,1.6,1.4] | claw slam [10,8,6.5] | [58,68,80] | water rise [0.7,1.0,1.3] | Proposed; it felt too easy |
| 9 | Korr [32,44,58] | [1.8,1.6,1.4] | F1 bridge [11,9,7.5] / F2 murder hole [9,7.5,6] / F3 charge [8,6.5,5.5] | [70,84,96] over 3 floors | Korr charge [0.8,1.0,1.25] | Proposed; second wall |
| 10 | serpent windows [—] | [1.8,1.6,1.4] | window glance [10,8.5,7] | [54,64,74] | glance sweep [0.8,1.0,1.2] | Proposed |
| 11 | Twin Seal [36,50,66] | [1.8,1.7,1.5] | [9,7.5,6] per serpent, staggered by half | [72,86,100] | serpents [0.75,1.0,1.25] | Tell is longer in 11 because two threats overlap |

Values marked "proposed" have no current number in the brief. Claude should read the real code values and apply the change as a ratio where the structure differs.

### 4. Urgency: the march and the rage

**Two directions considered.**
- **A. The March [RECOMMENDED].** The board itself advances. Every few seconds the whole brick formation (or the chapter's threat) steps down 18 units toward a danger line. Clearing fast and hitting the villain push it back. It is the owner's reference (Arkanoid x Space Invaders), needs no HUD, and every brick you break visibly buys space.
- **B. Villain Rage only.** The board stays still. The villain's face escalates through 3 rage stages over time, and each stage makes attacks 10% more frequent. Hits calm it. It is very character-driven, but chapters without a big villain on screen (1, 3, 4) have nothing to show.

**Recommended: A everywhere, plus B on duel floors** (chapter 9 floor 3, and any floor with fewer than 20 breakable bricks left), where there is no formation to march.

**March rules (all chapters)**
- Each step moves the formation down 18 units (one brick row plus gap), with easeInOutQuad over 0.3 s.
- Tell: 1.4 s before a step, the formation shudders ±1 unit and chains or engines clank. Every step is announced, never silent.
- Danger line: 120 units above the paddle top. The empty lower lane stays empty, so the ball always has room to return.
- Start position: 8 steps above the danger line.
- Push back: clearing 6 bricks within 4 s (a combo) **halts the march for 3 s**. A villain hit **lifts the formation 1 step**, at most once every 3 s. Clearing a full row lifts it 1 step.
- Reaching the line: decision 1.
- Step interval per mode = `marchStep_s` array below (Easy is Medium x1.4, Hard is Medium x0.77).

**Rage rules (duel floors)**
- The villain climbs 1 rage stage every `rageStep_s` [30, 22, 16] s, up to 3 stages. Each stage cuts the hazard interval by 10% (stage 3 = x0.73). Tells never shorten below the chapter's `tell_s`.
- 3 villain hits within 5 s drop 1 stage.
- It is shown by the face only: stage 1 brows down, stage 2 teeth bared and steam chips, stage 3 armour plates glow #FF4D5E at the seams.

| # | What marches (visible) | Medium step (s) | Steps to danger, untouched (Medium) | Push back, chapter twist |
|---|---|---|---|---|
| 1 | Carrier hull panels with the crew pods | 12 | 96 s | Freeing a pod lifts 1 step |
| 2 | Gnash himself, one cell per step along his chewed route | 1.8 per cell | his route length | A head hit stuns 2 s and pushes him back 2 cells |
| 3 | Circuit board with the closed iris | 11 | 88 s | A conduit brick lifts 1 step |
| 4 | The forge shutter wall | 10 | 80 s | A cannon destroyed lifts 2 steps |
| 5 | **Ice rampart and frost bricks** | 9 | 72 s | A Warden hit lifts 1 step and melts the lowest row |
| 6 | Reliquary rows, counterweights ride on top | 9.5 | 76 s | The serpent clash halts the march 4 s |
| 7 | Bell ramps and bricks | 9 | 72 s | A bell rolled into the villain lifts 2 steps |
| 8 | Rising water (the water rises, the bricks stay) | 8.5 | 68 s | A winch-chain hit drains 1 step |
| 9 | F1 drawbridge, F2 murder-hole gallery, F3 Korr rage | 8 / 8 / rage | 64 s per floor | Chain, bell rope or Korr hits |
| 10 | Guard wall closing in on Lumi | 9 | 72 s | Lullaby halts 4 s; lantern bricks lift 1 step |
| 11 | Both serpents from opposite walls, steps alternate | 7.5 | 60 s | Lure runes pull one back 2 steps; a clash stuns both 3 s |

**Lumi's fear** follows the distance to the danger line: calm at 6 or more steps, nervous pacing at 4, scared at 2, panic at 1. This applies in 2, 6, 8, 10 and 11.

### 5. Fairness: where a loss could feel cheap, and the fix
| Cheap moment | Fix |
|---|---|
| A hazard's first appearance kills | The first showing of each hazard per attempt is harmless and always has a 1.8 s tell, in every mode |
| Hazard and ball arrive together | No hazard lands within 0.6 s of the ball reaching the paddle lane; it is delayed to the next legal window |
| Two hazards overlap (6, 9, 11) | Stagger them by at least 2 s; never two tells at once |
| A march step lands while the ball is far away | The march pauses during the serve, Focus aim slow-mo and floor climbs; no step lands within 0.6 s of a paddle return |
| Ball trapped behind granite | After 8 s without a paddle touch, a nudge spawns a gap |
| TINY catch right before a hazard | TINY is never spawned within 3 s of a tell |
| The formation suddenly traps the ball | A step never moves a brick into the ball; the step waits until the ball is 24 or more units away |
| March reaches the line on the last life early | The first danger-line hit per attempt on Easy and Medium only lifts the formation 3 steps and costs no life |
| Frost Warden ice arrows hard to see | Arrows are ceramic darts, 10x24, high contrast against dark navy |
| Hard ball too fast to read | The rally cap stays at 1.28x; Focus is always available |
| First loss of an attempt | Easy and Medium: the first lost ball is returned free with a 2 s shield (decision 4) |

### 6. Continue
2 ad continues per attempt. A Continue gives back 1 life with a 2 s SHIELD, lifts the formation 3 steps (rage drops to stage 0), and keeps HP dealt, bricks broken and the floor reached. Retry starts fresh.
Fail screen copy: "So close! Korr has 3 HP left." The villain's name and HP are filled in live.

### 7. Test plan
Claude's bot plays 200 runs per chapter per mode with a "medium skill" profile (aim error ±10 units, reaction 0.25 s), plus a "zero-power" profile that never catches capsules.

| Measure | Pass range |
|---|---|
| Median run length | within ±20% of the target |
| First-try win rate (medium-skill bot) | within ±0.10 of the target |
| Zero-power profile wins on Easy | ≥ 0.70 in every chapter |
| Every tell duration measured | 1.2 to 1.8 s, never less |
| First showing of each hazard deals damage | 0 times |
| Hazard landing within 0.6 s of a paddle return | 0 times |
| March: untouched time to reach the danger line | within ±5% of the table |
| March push-back per action, rage drop per 3 hits | matches the spec exactly |
| March steps landing within 0.6 s of a paddle return, or into the ball | 0 times |
| Ball trapped without a paddle touch for more than 8 s | 0 times |
| Max balls / cosmic / power timer exceeded | 0 times |
| Hard is harder than Medium is harder than Easy, by win rate | true in all 11 chapters |
| Continue restores the stated values | 100% of runs |

## Data
```json
{
  "kind": "difficulty",
  "shared": {
    "easy": {
      "companionHits": 24,
      "maxBalls": 12,
      "maxCosmic": 2,
      "maxTimer_s": 20,
      "ballSpeed": 330,
      "freeFirstBall": true,
      "marchScale": 1.4,
      "rageStep_s": 30
    },
    "medium": {
      "companionHits": 30,
      "maxBalls": 9,
      "maxCosmic": 2,
      "maxTimer_s": 18,
      "ballSpeed": 345,
      "freeFirstBall": true,
      "marchScale": 1.0,
      "rageStep_s": 22
    },
    "hard": {
      "companionHits": 36,
      "maxBalls": 5,
      "maxCosmic": 1,
      "maxTimer_s": 14,
      "ballSpeed": 370,
      "freeFirstBall": false,
      "marchScale": 0.77,
      "rageStep_s": 16
    }
  },
  "chapters": [
    {
      "chapter": 1,
      "name": "Carrier Breakout",
      "target_minutes": {
        "easy": 2,
        "medium": 2.5,
        "hard": 3
      },
      "target_first_try_win_rate": {
        "easy": 0.95,
        "medium": 0.8,
        "hard": 0.5
      },
      "values": {
        "villainHP": [
          2,
          3,
          4
        ],
        "tell_s": [
          1.8,
          1.6,
          1.4
        ],
        "hazardInterval_s": [
          12,
          10,
          8
        ],
        "extraction_s": [
          9,
          7.5,
          6.5
        ],
        "bricks": [
          40,
          48,
          56
        ],
        "villainSpeed": [
          0.8,
          1.0,
          1.2
        ],
        "marchStep_s": [
          16.8,
          12,
          9.2
        ]
      },
      "pressure": "carrier hull panels march down; freeing a pod lifts 1 step",
      "change": "tune"
    },
    {
      "chapter": 2,
      "name": "The Vault",
      "target_minutes": {
        "easy": 2.5,
        "medium": 3,
        "hard": 3.5
      },
      "target_first_try_win_rate": {
        "easy": 0.9,
        "medium": 0.65,
        "hard": 0.4
      },
      "values": {
        "villainHP": [
          10,
          14,
          18
        ],
        "tell_s": [
          1.8,
          1.6,
          1.4
        ],
        "hazardInterval_s": [
          11,
          9,
          7.5
        ],
        "bricks": [
          400,
          400,
          400
        ],
        "villainSpeed": [
          0.6,
          0.8,
          1.1
        ],
        "marchStep_s": [
          2.5,
          1.8,
          1.4
        ]
      },
      "pressure": "Gnash advances one cell per step toward Lumi's cage",
      "change": "tune"
    },
    {
      "chapter": 3,
      "name": "Circuit Breakout",
      "target_minutes": {
        "easy": 2,
        "medium": 2.5,
        "hard": 3
      },
      "target_first_try_win_rate": {
        "easy": 0.92,
        "medium": 0.75,
        "hard": 0.45
      },
      "values": {
        "villainHP": [
          8,
          12,
          16
        ],
        "tell_s": [
          1.8,
          1.6,
          1.4
        ],
        "hazardInterval_s": [
          12,
          10,
          8.5
        ],
        "bricks": [
          44,
          52,
          60
        ],
        "marchStep_s": [
          15.4,
          11,
          8.5
        ]
      },
      "pressure": "circuit board marches down",
      "change": "tune"
    },
    {
      "chapter": 4,
      "name": "Shutter Forge",
      "target_minutes": {
        "easy": 2.5,
        "medium": 3.5,
        "hard": 4
      },
      "target_first_try_win_rate": {
        "easy": 0.88,
        "medium": 0.6,
        "hard": 0.3
      },
      "values": {
        "villainHP": [
          4,
          6,
          8
        ],
        "tell_s": [
          1.8,
          1.6,
          1.4
        ],
        "hazardInterval_s": [
          10,
          8,
          6.5
        ],
        "bricks": [
          50,
          60,
          70
        ],
        "villainSpeed": [
          0.8,
          1.0,
          1.2
        ],
        "marchStep_s": [
          14.0,
          10,
          7.7
        ]
      },
      "pressure": "forge shutter wall marches down",
      "change": "tune"
    },
    {
      "chapter": 5,
      "name": "Frost Warden",
      "target_minutes": {
        "easy": 3,
        "medium": 4,
        "hard": 4.5
      },
      "target_first_try_win_rate": {
        "easy": 0.85,
        "medium": 0.45,
        "hard": 0.2
      },
      "values": {
        "villainHP": [
          28,
          38,
          50
        ],
        "tell_s": [
          1.8,
          1.6,
          1.4
        ],
        "hazardInterval_s": [
          9,
          7.5,
          6
        ],
        "bricks": [
          60,
          72,
          84
        ],
        "villainSpeed": [
          0.7,
          1.0,
          1.3
        ],
        "marchStep_s": [
          12.6,
          9,
          6.9
        ]
      },
      "pressure": "ice rampart and frost bricks march down",
      "change": "rework"
    },
    {
      "chapter": 6,
      "name": "Mooncoil Reliquary",
      "target_minutes": {
        "easy": 3,
        "medium": 4,
        "hard": 4.5
      },
      "target_first_try_win_rate": {
        "easy": 0.85,
        "medium": 0.5,
        "hard": 0.25
      },
      "values": {
        "villainHP": [
          24,
          32,
          42
        ],
        "gnashStunHP": [
          6,
          8,
          10
        ],
        "tell_s": [
          1.8,
          1.6,
          1.4
        ],
        "hazardInterval_s": [
          10,
          8,
          6.5
        ],
        "bricks": [
          56,
          66,
          78
        ],
        "villainSpeed": [
          0.7,
          0.9,
          1.15
        ],
        "marchStep_s": [
          13.3,
          9.5,
          7.3
        ]
      },
      "pressure": "reliquary rows march down; the serpent clash halts the march",
      "change": "tune"
    },
    {
      "chapter": 7,
      "name": "Bellforge Run",
      "target_minutes": {
        "easy": 2.5,
        "medium": 3.5,
        "hard": 4.5
      },
      "target_first_try_win_rate": {
        "easy": 0.88,
        "medium": 0.55,
        "hard": 0.25
      },
      "values": {
        "villainHP": [
          26,
          36,
          48
        ],
        "tell_s": [
          1.8,
          1.6,
          1.4
        ],
        "hazardInterval_s": [
          9.5,
          8,
          6.5
        ],
        "bricks": [
          52,
          62,
          72
        ],
        "villainSpeed": [
          0.85,
          1.0,
          1.2
        ],
        "marchStep_s": [
          12.6,
          9,
          6.9
        ]
      },
      "pressure": "bell ramps and bricks march down",
      "change": "tune"
    },
    {
      "chapter": 8,
      "name": "Tidewheel Citadel",
      "target_minutes": {
        "easy": 3,
        "medium": 4,
        "hard": 5
      },
      "target_first_try_win_rate": {
        "easy": 0.85,
        "medium": 0.45,
        "hard": 0.2
      },
      "values": {
        "villainHP": [
          30,
          40,
          52
        ],
        "tell_s": [
          1.8,
          1.6,
          1.4
        ],
        "hazardInterval_s": [
          10,
          8,
          6.5
        ],
        "bricks": [
          58,
          68,
          80
        ],
        "villainSpeed": [
          0.7,
          1.0,
          1.3
        ],
        "marchStep_s": [
          11.9,
          8.5,
          6.5
        ]
      },
      "pressure": "water rises one step at a time toward Lumi",
      "change": "tune"
    },
    {
      "chapter": 9,
      "name": "Gatehouse Siege",
      "target_minutes": {
        "easy": 3.5,
        "medium": 4.5,
        "hard": 5.5
      },
      "target_first_try_win_rate": {
        "easy": 0.8,
        "medium": 0.35,
        "hard": 0.15
      },
      "values": {
        "villainHP": [
          32,
          44,
          58
        ],
        "tell_s": [
          1.8,
          1.6,
          1.4
        ],
        "hazardInterval_s_floor1": [
          11,
          9,
          7.5
        ],
        "hazardInterval_s_floor2": [
          9,
          7.5,
          6
        ],
        "hazardInterval_s_floor3": [
          8,
          6.5,
          5.5
        ],
        "bricks": [
          70,
          84,
          96
        ],
        "villainSpeed": [
          0.8,
          1.0,
          1.25
        ],
        "marchStep_s": [
          11.2,
          8,
          6.2
        ],
        "rageStep_s_floor3": [
          30,
          22,
          16
        ]
      },
      "pressure": "drawbridge, then murder-hole gallery march; floor 3 is Korr's rage",
      "change": "tune"
    },
    {
      "chapter": 10,
      "name": "Lumi Breaks Out",
      "target_minutes": {
        "easy": 3,
        "medium": 3.5,
        "hard": 4.5
      },
      "target_first_try_win_rate": {
        "easy": 0.85,
        "medium": 0.55,
        "hard": 0.25
      },
      "values": {
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
        "bricks": [
          54,
          64,
          74
        ],
        "villainSpeed": [
          0.8,
          1.0,
          1.2
        ],
        "marchStep_s": [
          12.6,
          9,
          6.9
        ]
      },
      "pressure": "guard wall closes in on Lumi",
      "change": "tune"
    },
    {
      "chapter": 11,
      "name": "Serpent Rivals",
      "target_minutes": {
        "easy": 3.5,
        "medium": 5,
        "hard": 6
      },
      "target_first_try_win_rate": {
        "easy": 0.8,
        "medium": 0.3,
        "hard": 0.12
      },
      "values": {
        "villainHP": [
          36,
          50,
          66
        ],
        "tell_s": [
          1.8,
          1.7,
          1.5
        ],
        "hazardInterval_s": [
          9,
          7.5,
          6
        ],
        "hazardStagger_s": 2,
        "bricks": [
          72,
          86,
          100
        ],
        "villainSpeed": [
          0.75,
          1.0,
          1.25
        ],
        "marchStep_s": [
          10.5,
          7.5,
          5.8
        ]
      },
      "pressure": "both serpents advance from opposite walls",
      "change": "tune"
    }
  ],
  "curve": "Chapter 1 is a safe runway and the Vault (2) is the first spike. Circuit (3) is a breather, then pressure climbs through Shutter Forge (4) into the rebuilt Frost Warden (5), the first real wall where Medium players meet the Continue screen. Mooncoil (6) holds the pressure, Bellforge (7) is a readable rhythm breather, Tidewheel (8) rises again, Gatehouse (9) is the second wall over three floors, Lumi Breaks Out (10) breathes through a hero swap, and Serpent Rivals (11) is the finale with the highest pressure.",
  "continue": {
    "ad_continues": 2,
    "what_continue_restores": "1 life with a 2 s shield, formation lifted 3 steps, rage to stage 0; keeps HP dealt, bricks broken and floor reached",
    "fail_screen_copy": "So close! [Villain] has [N] HP left."
  },
  "test_plan": [
    "200 runs per chapter per mode, medium-skill bot: median run length within 20% of target",
    "medium-skill bot first-try win rate within 0.10 of target",
    "zero-power bot wins Easy at 0.70 or more in every chapter",
    "every measured tell between 1.2 and 1.8 s",
    "first showing of each hazard deals 0 damage",
    "0 hazards landing within 0.6 s of a paddle return",
    "0 balls trapped without a paddle touch for more than 8 s",
    "win rate strictly falls Easy to Medium to Hard in all 11 chapters",
    "Continue restores exactly the stated values",
    "untouched march reaches the danger line within 5% of marchStep_s x 8",
    "0 march steps within 0.6 s of a paddle return or into the ball",
    "rage drops exactly 1 stage per 3 hits within 5 s"
  ],
  "march": {
    "stepUnits": 18,
    "stepAnim_s": 0.3,
    "tell_s": 1.4,
    "dangerLineAbovePaddle": 120,
    "startStepsAbove": 8,
    "comboHalt": {
      "bricks": 6,
      "within_s": 4,
      "halt_s": 3
    },
    "villainHitLiftSteps": 1,
    "villainHitLiftCooldown_s": 3,
    "rowClearLiftSteps": 1,
    "onDangerLine": "bottom row shatters harmlessly, lose 1 life, formation lifts 3 steps",
    "firstDangerHitFree": {
      "easy": true,
      "medium": true,
      "hard": false
    },
    "noStepNearPaddleReturn_s": 0.6,
    "minBallClearance": 24
  },
  "rage": {
    "stages": 3,
    "intervalScalePerStage": 0.9,
    "dropStageHits": 3,
    "dropStageWithin_s": 5,
    "appliesTo": "duel floors and floors with fewer than 20 breakable bricks"
  }
}
```

## Art requests
None in this drop. Frost Warden's visual rebuild (the ice rampart, the Warden and frost-line bricks in the house style, matching Gatehouse Siege) should be its own `level` drop plus an `asset-sheet` drop.

## Rules check
- Telegraphed hazards with a 1.2 to 1.8 s tell and a safe first showing: OK, minimum 1.4 s, first showing harmless.
- Ordinary play always makes progress: OK, every brick broken and villain hit pushes the march or rage back.
- Enemy attacks never destroy the player's bricks for rewards: OK.
- Difficulty changes numbers only: OK, same attacks, march and rage in all modes. The free first ball is a number (1 / 1 / 0).
- Pause / Continue / Retry keep progress: OK, the march pauses on pause, and Continue keeps progress.
- No power required to win: OK, tested with the zero-power bot.
- Effects are rendered, no rings: OK, the frost line is ice tiles and the arrows are ceramic darts.
- Mobile: OK, no new HUD; urgency is in the playfield.

## Open questions for Claude
1. The current code values for chapters 3 to 6 and 8 to 11 are not in the brief. Recommended: keep the structure and apply my numbers as targets, reporting the old values back.
2. Is the Carrier Hard extraction of 8.5 s a bug? Recommended: yes, set it to 6.5.
3. How does the march work with fixed set pieces (ramps, cages, iris)? Recommended: they ride with the formation; Lumi's cage and the paddle lane never move.
4. Frost Warden's layout and art need their own drop. Recommended: run a `level` drop for Frost Warden next, then the theme-split menu as a `ui-screen` drop.
5. Bot skill profile? Recommended: aim error ±10 units, reaction 0.25 s; tune targets after the first 200-run pass.
