---
breach_drop: 1
kind: difficulty
slug: difficulty-round2
version: 1
date: 2026-10-23
status: proposal
tool: Copilot Studio, Gemini 4 Argon
depends_on: ["powerups-round2"]
---
# BREACH P2: 11-Chapter Difficulty Curve & Tuning Rework

## Summary
- Retunes all 11 chapters from K01 baselines using a two-wave sawtooth pressure curve: Chapters 1–4 ramp into a first boss wall at Chapter 5 (Frost Warden), Chapters 6 and 10 act as shorter rhythmic breathers, and Chapters 7–9 and 11 deliver multi-floor castle duels where the Continue screen is the safety net.
- Fixes owner APK feedback directly: sharpens Chapter 1 Carrier Breakout (`raiderHP [2, 3, 4] -> [3, 4, 5]`, `extraction_s [8.0, 7.5, 8.5] -> [7.5, 6.8, 6.0]`) so Easy is brisk and Medium demands active rescues, while smoothing Chapter 2 The Vault on Medium (`serpentSpeedMult [0.6, 0.8, 1.0] -> [0.58, 0.74, 1.05]`) with a fierce head lunge tell (`[1.8, 1.5, 1.3] s`).
- Synchronises shared power caps with `powerups-round2`: `companionHits [22, 28, 34]` (from `[24, 30, 36]`), `maxBalls [12, 9, 5]`, `maxCosmic [2, 2, 1]`, `maxTimer_s [20, 18, 14]`, and Ram radius `15.6` dealing `4` boss HP.
- Gives every chapter one unmistakable visible urgency clock (extraction beam, chewing serpent, iris seal, furnace stabilisers, frost march, counterweight drop, bell ramp, rising tide, gate winch, window bite, twin-serpent clash) that skilled hits push back.
- Establishes a 7-metric automated bot test plan for Claude (`120 Hz` deterministic physics steps) to verify run length, win rate, and zero cheap losses before APK packaging.

## Decisions for the owner
1. First real difficulty wall (where Medium first-try win rate drops to `0.50` and Continue becomes the primary safety net): A Chapter 4 Shutter Forge / Chapter 5 Frost Warden transition [RECOMMENDED] [AUTO-PICKED] | B Chapter 2 The Vault | C Chapter 7 Bellforge Run.
2. Breather chapters after heavy walls: A Chapter 6 (Mooncoil Reliquary clash spectacle) and Chapter 10 (Lumi Breaks Out hero swap) [RECOMMENDED] [AUTO-PICKED] | B Chapter 3 and Chapter 8 | C Linear climb with no breathers.
3. Forgiving first-life grace rule: A First missed ball on Floor 1 rebounds once off a cracked safety lip on Easy (`100%`) and Medium (if lost within first `12 s`), disabled on Hard [RECOMMENDED] [AUTO-PICKED] | B Easy only | C No grace rebound.

## Spec

### 1. Pressure Curve Across Chapters 1 to 11

Chapters 1–2 hook the player with contrasting tempos: **Ch 1 Carrier Breakout** is a tightened `1.8–2.8 min` boarding sprint (`raiderHP [3, 4, 5]` up from `[2, 3, 4]`), while **Ch 2 The Vault** trims Medium serpent crawl speed from `0.80x` to `0.74x` so Gnash feels fierce in expression and lunge speed without choking Medium players before they unlock Lumi's story beat. **Ch 3 Circuit Breakout** (`1.6–2.4 min`) speeds the pace up with wide skiff bursts, setting up the first sustained mechanical test in **Ch 4 Shutter Forge** and the **first true boss wall in Ch 5 Frost Warden** (`Medium first-try win rate 0.50`), where the Continue panel makes its main debut. **Ch 6 Mooncoil Reliquary** rewards surviving Ch 5 with a shorter, high-spectacle breather where luring Gnash and Mooncoil into each other deals `6` mutual HP. Pressure climbs sharply through the castle siege trilogy—**Ch 7 Bellforge Run** (`villainHP [24, 34, 44]`), **Ch 8 Tidewheel Citadel** (rising water lane compression), and **Ch 9 Gatehouse Siege** (3-floor Korr duel, second major wall at `0.42` Medium win rate). **Ch 10 Lumi Breaks Out** provides a refreshing hero-swap breather (`2.0–3.0 min`) before **Ch 11 Serpent Rivals** closes the arc as the ultimate dual-serpent exam (`0.38` Medium / `0.18` Hard first-try win rate).

### 2. Per-Chapter Targets, Tuned Arrays (`[Easy, Medium, Hard]`) & Changes from K01

| Ch | Chapter Name | Target Mins `[E, M, H]` | Target 1st-Try Win `[E, M, H]` | Tuned Mode Values `[Easy, Medium, Hard]` | What Changed from K01 Baseline & Why |
|---:|---|---|---|---|---|
| 1 | Carrier Breakout | `[1.6, 2.2, 2.8]` | `[0.92, 0.72, 0.42]` | `raiderHP: [3, 4, 5]`, `extraction_s: [7.5, 6.8, 6.0]`, `tell_s: [1.8, 1.6, 1.4]`, `bricks: [42, 54, 66]`, `hullHP: [18, 24, 32]` | Raised `raiderHP` from `[2, 3, 4]` and tightened `extraction_s` from `[8.0, 7.5, 8.5]` so Carrier is no longer trivial and Hard no longer gives extra time. |
| 2 | The Vault | `[2.0, 2.6, 3.2]` | `[0.88, 0.65, 0.35]` | `serpentSpeedMult: [0.58, 0.74, 1.05]`, `headStunBack_units: [48, 40, 32]`, `tell_s: [1.8, 1.5, 1.3]`, `bricks: [180, 220, 260]`, `venomInterval_s: [11.0, 9.0, 7.5]` | Tuned `serpentSpeedMult` from `[0.6, 0.8, 1.0]` to `[0.58, 0.74, 1.05]`: eases Medium frustration while making Hard 5% fiercer; added explicit `headStunBack_units`. |
| 3 | Circuit Breakout | `[1.5, 2.0, 2.5]` | `[0.90, 0.68, 0.38]` | `stationHP: [16, 22, 30]`, `irisClose_s: [55, 46, 38]`, `tell_s: [1.7, 1.5, 1.3]`, `salvoInterval_s: [9.5, 8.0, 6.8]`, `bricks: [48, 60, 72]` | Shorter target duration (`1.5–2.5 min`) so space chapters vary in rhythm; broadened station damage credit so every hull hit advances the iris. |
| 4 | Shutter Forge | `[2.2, 2.9, 3.6]` | `[0.85, 0.58, 0.30]` | `reactorHP: [22, 30, 40]`, `shutterCycle_s: [9.0, 7.5, 6.2]`, `tell_s: [1.8, 1.6, 1.4]`, `hazardInterval_s: [9.5, 8.0, 6.8]`, `bricks: [56, 70, 84]` | Cut long patience waits by allowing closed shutters to take `1` crack damage (`0.5` reactor transfer) from ordinary balls. |
| 5 | Frost Warden | `[2.5, 3.3, 4.0]` | `[0.82, 0.50, 0.24]` | `villainHP: [26, 36, 46]`, `tell_s: [1.7, 1.5, 1.3]`, `hazardInterval_s: [9.0, 7.5, 6.5]`, `frostRowAdvance_s: [14.0, 11.5, 9.5]`, `bricks: [60, 76, 92]` | First major wall (`0.50` Medium win rate); tuned frost advance and arrow volley intervals to encourage first Continue/unlock conversions. |
| 6 | Mooncoil Reliquary | `[1.8, 2.3, 2.9]` | `[0.88, 0.66, 0.36]` | `serpentSpeedMult: [0.60, 0.76, 0.96]`, `clashDamage: [8, 6, 5]`, `tell_s: [1.8, 1.6, 1.4]`, `weightDropInterval_s: [10.5, 9.0, 7.5]`, `bricks: [64, 78, 90]` | Designed as a post-boss breather: triggering a Gnash/Mooncoil clash chunks `[8, 6, 5]` HP and drops 2 guaranteed capsules. |
| 7 | Bellforge Run | `[2.4, 3.2, 4.0]` | `[0.84, 0.54, 0.25]` | `villainHP: [24, 34, 44]`, `tell_s: [1.8, 1.6, 1.4]`, `hazardInterval_s: [10.0, 8.5, 7.2]`, `bellSpeed_ups: [165, 195, 225]`, `bricks: [66, 82, 98]` | Raised Medium/Hard `villainHP` from `[24, 32, 40]` to `[24, 34, 44]` to match P1's stronger `4`-HP Ram (`15.6` radius) while keeping Easy at `24`. |
| 8 | Tidewheel Citadel | `[2.5, 3.4, 4.2]` | `[0.82, 0.50, 0.23]` | `villainHP: [28, 38, 48]`, `tell_s: [1.8, 1.5, 1.3]`, `hazardInterval_s: [9.5, 8.0, 6.8]`, `tideRise_ups: [2.2, 3.0, 3.8]`, `bricks: [70, 86, 104]` | Added explicit `tideRise_ups` and `36`-unit tide drop when Nerra's sluice wheel takes 3 hits. |
| 9 | Gatehouse Siege | `[2.8, 3.7, 4.5]` | `[0.80, 0.42, 0.20]` | `villainHP: [30, 42, 54]`, `tell_s: [1.7, 1.5, 1.3]`, `hazardInterval_s: [9.0, 7.5, 6.5]`, `winchHits: [6, 8, 10]`, `bricks: [78, 96, 114]` | Second major wall (3-floor castle showcase); returning a rolling bell up the ramp into Korr deals `6` HP and `2.5 s` stagger. |
| 10 | Lumi Breaks Out | `[2.0, 2.5, 3.1]` | `[0.88, 0.64, 0.34]` | `windowSerpentHP: [20, 28, 36]`, `tell_s: [1.8, 1.6, 1.4]`, `biteInterval_s: [10.0, 8.5, 7.2]`, `ropeRingsNeeded: [4, 5, 6]`, `bricks: [58, 72, 86]` | Fast, empowering hero-swap breather before the finale; Lumi's `Lullaby` calms window lunges for `[5.0, 4.0, 3.2] s`. |
| 11 | Serpent Rivals | `[3.0, 4.0, 4.8]` | `[0.76, 0.38, 0.18]` | `twinSealHP: [34, 46, 60]`, `serpentSpeedMult: [0.65, 0.85, 1.10]`, `tell_s: [1.7, 1.4, 1.2]`, `clashInterval_s: [9.0, 7.5, 6.2]`, `bricks: [88, 110, 132]` | Climax chapter: fastest legal tell on Hard (`1.2 s`), dual S-corridors, and a 90-unit central Clash Chamber. |

### 3. Urgency Clocks & Skilled Pushback per Chapter

| Ch | Visible Urgency Element | How Skilled Play Pushes It Back |
|---:|---|---|
| 1 | Per-pod cyan extraction tractor beam (`7.5 / 6.8 / 6.0 s` clock) | Breaking 2 clamp panels around a pod snaps the beam and permanently archives that crew rescue. |
| 2 | Gnash chewing through the 20x20 grid toward Lumi's 96x48 cage | Direct ball hits to Gnash's faceted head stun him for `1.2 s` and drive him back `[48, 40, 32]` units along his chewed path. |
| 3 | Central exit iris closing ring (`55 / 46 / 38 s`) | Destroying any of the 4 phase station panels adds `+6.0 s` and widens the iris aperture by `25%`. |
| 4 | Three overheating furnace stabiliser gauges | Hitting an exposed stabiliser vents steam and resets its gauge by `40%`; breaking all 3 exposes the exterior reactor. |
| 5 | Frost Warden's creeping ice wall freezing the top brick row | Shattering a glowing hearth brick or hitting the Warden's chest shield melts 1 full frozen row immediately. |
| 6 | Twin counterweight blocks descending above side lanes | Breaking 2 gold lure runes steers Gnash and Mooncoil into the centre chamber, snapping the weight chains upward. |
| 7 | Korr's hoof lever dropping bronze bells down dual ramps | Hitting a rolling bell with a rising ball (`>345 units/s`) or Ram knocks it back up the ramp into Korr for `6` HP and stagger. |
| 8 | Nerra hauling the sluice chain to raise dark tidewater toward the paddle lane | Striking the winch wheel 3 times slips the ratchet and drops the water level by `36` units. |
| 9 | Floor 1 counterweight drop, Floor 2 murder-hole bells, Floor 3 Korr charge | Each winch hit (`6 / 8 / 10` total) raises the portcullis gate; bell rebounds stagger Korr for `2.5 s` of free hull hits. |
| 10 | Gnash peeking from 6 arched tower windows to bite across a brick row | Hitting Gnash's nose during his `1.8 / 1.6 / 1.4 s` hiss tell slams the window shutter for `8.0 s` and rings the roof rope bell. |
| 11 | Dual distance meter at top HUD (emerald left, violet right) racing to Lumi's cage | Breaking lure bricks pulls both heads into the 90-unit Clash Chamber where they collide, stunning both for `3.0 s`. |

### 4. Anti-Cheapness Fairness Audit & Fixes

| Cheap Loss Risk | Chapters Affected | Fairness Fix Applied |
|---|---|---|
| Off-screen or instant projectile hit | Ch 1, 3, 4, 5 | Every battery and bow lights a warm `#FFDBB8` / `#FF4D5E` physical wind-up tell for `1.2–1.8 s`, and the first shot of Floor 1 always lands harmlessly on a side bastion. |
| First-serve drain within `10 s` | All 11 chapters | First life on Floor 1 gets a one-time cracked stone safety lip on Easy (`100%`) and Medium (first `12 s` only) that rebounds a missed ball at `45 deg`. |
| Rolling bell or counterweight trapping ball | Ch 6, 7, 9 | Moving machinery uses swept capsule collision and pushes any overlapping ball outward along the contact normal (`>=345 units/s`), never pinching it against a wall. |
| Rising tide or frost compressing reaction lane | Ch 5, 8 | Hazard advance stops permanently at `y = 480`, preserving the full `60–74%` (`>=140` units) empty dark reaction lane above the paddle. |
| Continue restarting from scratch | All 11 chapters | Continue restores full 3 lives on the **current floor**, keeps all broken bricks and boss damage dealt, and serves with a `3.0 s` Brick Ward shield. |

### 5. Automated Bot Test Plan for Claude (`120 Hz` Headless Verification)

1. **Ordinary-Ball Progress Invariant:** Run a zero-pickup, zero-hero-power bot using simple centre-tracking + `+/-18 deg` wall banks across all 11 chapters x 3 modes; verify that every floor takes damage at least once every `6.0 s` (zero softlocks or invulnerable waits).
2. **Run Duration Envelope:** Measure median completion time across 50 seeded bot runs per chapter/mode; pass if Easy falls within `target_minutes.easy +/- 0.4 min`, Medium within `+/- 0.5 min`, and Hard within `+/- 0.6 min`.
3. **Win-Rate Calibration:** Run a noisy human-proxy bot (`35 ms` reaction lag, `+/-6` unit drag jitter) for 200 runs per chapter/mode; pass if first-try win rates sit within `+/-0.07` of `target_first_try_win_rate` (`[0.76–0.92]` Easy, `[0.38–0.72]` Medium, `[0.18–0.42]` Hard).
4. **Telegraph Lead-Time Check:** Log `t_release - t_tell_start` for every hazard event; assert `min >= 1.20 s` and `max <= 1.80 s`, and assert `hazard_event[0].canDamagePlayer == false` (first showing safe).
5. **Reaction Lane Clearance:** Sample lowest solid brick/hazard `y` coordinate every frame on `393x852` and `412x915`; assert `y_solid_max <= paddle.y - 135` units at all times.
6. **Enemy Friendly-Fire Prohibition:** Assert `bricksDestroyedByEnemyProjectiles == 0` across all 33 chapter-mode combinations.
7. **Continue & Pause State Integrity:** Simulate a loss at `90%` boss HP dealt on Floor 3, trigger Continue, and assert `floor == 3`, `bossHP == remainingHP`, `lives == 3`, and `brickWardTimer == 3.0 s`.

## Data
```json
{
  "kind": "difficulty",
  "shared": {
    "easy": { "companionHits": 22, "maxBalls": 12, "maxCosmic": 2, "maxTimer_s": 20 },
    "medium": { "companionHits": 28, "maxBalls": 9, "maxCosmic": 2, "maxTimer_s": 18 },
    "hard": { "companionHits": 34, "maxBalls": 5, "maxCosmic": 1, "maxTimer_s": 14 }
  },
  "chapters": [
    {
      "chapter": 1,
      "name": "Carrier Breakout",
      "target_minutes": { "easy": 1.6, "medium": 2.2, "hard": 2.8 },
      "target_first_try_win_rate": { "easy": 0.92, "medium": 0.72, "hard": 0.42 },
      "values": {
        "raiderHP": [3, 4, 5],
        "extraction_s": [7.5, 6.8, 6.0],
        "tell_s": [1.8, 1.6, 1.4],
        "hullHP": [18, 24, 32],
        "bricks": [42, 54, 66]
      },
      "pressure": "Per-pod cyan tractor beams extract crew on a 7.5/6.8/6.0 s clock unless clamp panels are broken",
      "change": "tune"
    },
    {
      "chapter": 2,
      "name": "The Vault",
      "target_minutes": { "easy": 2.0, "medium": 2.6, "hard": 3.2 },
      "target_first_try_win_rate": { "easy": 0.88, "medium": 0.65, "hard": 0.35 },
      "values": {
        "serpentSpeedMult": [0.58, 0.74, 1.05],
        "headStunBack_units": [48, 40, 32],
        "tell_s": [1.8, 1.5, 1.3],
        "venomInterval_s": [11.0, 9.0, 7.5],
        "bricks": [180, 220, 260]
      },
      "pressure": "Gnash chews a live S-path through the 20x20 grid toward Lumi's cage; head hits push him back 48/40/32 units",
      "change": "tune"
    },
    {
      "chapter": 3,
      "name": "Circuit Breakout",
      "target_minutes": { "easy": 1.5, "medium": 2.0, "hard": 2.5 },
      "target_first_try_win_rate": { "easy": 0.90, "medium": 0.68, "hard": 0.38 },
      "values": {
        "stationHP": [16, 22, 30],
        "irisClose_s": [55.0, 46.0, 38.0],
        "tell_s": [1.7, 1.5, 1.3],
        "salvoInterval_s": [9.5, 8.0, 6.8],
        "bricks": [48, 60, 72]
      },
      "pressure": "Central exit iris slowly seals over 55/46/38 s; breaking any of the 4 phase stations reopens it by +6 s",
      "change": "tune"
    },
    {
      "chapter": 4,
      "name": "Shutter Forge",
      "target_minutes": { "easy": 2.2, "medium": 2.9, "hard": 3.6 },
      "target_first_try_win_rate": { "easy": 0.85, "medium": 0.58, "hard": 0.30 },
      "values": {
        "reactorHP": [22, 30, 40],
        "shutterCycle_s": [9.0, 7.5, 6.2],
        "tell_s": [1.8, 1.6, 1.4],
        "hazardInterval_s": [9.5, 8.0, 6.8],
        "bricks": [56, 70, 84]
      },
      "pressure": "Three timed stabilisers overheat toward a forge volley; hitting stabilisers vents heat and exposes the reactor",
      "change": "tune"
    },
    {
      "chapter": 5,
      "name": "Frost Warden",
      "target_minutes": { "easy": 2.5, "medium": 3.3, "hard": 4.0 },
      "target_first_try_win_rate": { "easy": 0.82, "medium": 0.50, "hard": 0.24 },
      "values": {
        "villainHP": [26, 36, 46],
        "tell_s": [1.7, 1.5, 1.3],
        "hazardInterval_s": [9.0, 7.5, 6.5],
        "frostRowAdvance_s": [14.0, 11.5, 9.5],
        "bricks": [60, 76, 92]
      },
      "pressure": "First major wall: Warden freezes brick rows downward every 14/11.5/9.5 s; hearth bricks shatter a full ice row",
      "change": "tune"
    },
    {
      "chapter": 6,
      "name": "Mooncoil Reliquary",
      "target_minutes": { "easy": 1.8, "medium": 2.3, "hard": 2.9 },
      "target_first_try_win_rate": { "easy": 0.88, "medium": 0.66, "hard": 0.36 },
      "values": {
        "serpentSpeedMult": [0.60, 0.76, 0.96],
        "clashDamage": [8, 6, 5],
        "tell_s": [1.8, 1.6, 1.4],
        "weightDropInterval_s": [10.5, 9.0, 7.5],
        "bricks": [64, 78, 90]
      },
      "pressure": "Breather spectacle: descending counterweights compress side lanes unless Gnash and Mooncoil are lured into clashing",
      "change": "tune"
    },
    {
      "chapter": 7,
      "name": "Bellforge Run",
      "target_minutes": { "easy": 2.4, "medium": 3.2, "hard": 4.0 },
      "target_first_try_win_rate": { "easy": 0.84, "medium": 0.54, "hard": 0.25 },
      "values": {
        "villainHP": [24, 34, 44],
        "tell_s": [1.8, 1.6, 1.4],
        "hazardInterval_s": [10.0, 8.5, 7.2],
        "bellSpeed_ups": [165, 195, 225],
        "bricks": [66, 82, 98]
      },
      "pressure": "Bronze bells roll down dual ramps every 10/8.5/7.2 s; banking a fast ball or Ram knocks the bell back into the boss",
      "change": "tune"
    },
    {
      "chapter": 8,
      "name": "Tidewheel Citadel",
      "target_minutes": { "easy": 2.5, "medium": 3.4, "hard": 4.2 },
      "target_first_try_win_rate": { "easy": 0.82, "medium": 0.50, "hard": 0.23 },
      "values": {
        "villainHP": [28, 38, 48],
        "tell_s": [1.8, 1.5, 1.3],
        "hazardInterval_s": [9.5, 8.0, 6.8],
        "tideRise_ups": [2.2, 3.0, 3.8],
        "bricks": [70, 86, 104]
      },
      "pressure": "Nerra cranks her chain to raise floodwater at 2.2/3.0/3.8 units/s; 3 hits on the sluice wheel drop the tide by 36 units",
      "change": "tune"
    },
    {
      "chapter": 9,
      "name": "Gatehouse Siege",
      "target_minutes": { "easy": 2.8, "medium": 3.7, "hard": 4.5 },
      "target_first_try_win_rate": { "easy": 0.80, "medium": 0.42, "hard": 0.20 },
      "values": {
        "villainHP": [30, 42, 54],
        "tell_s": [1.7, 1.5, 1.3],
        "hazardInterval_s": [9.0, 7.5, 6.5],
        "winchHits": [6, 8, 10],
        "bricks": [78, 96, 114]
      },
      "pressure": "Three-floor siege climax against Korr: drawbridge counterweights, murder-hole bells, and a plinth duel",
      "change": "tune"
    },
    {
      "chapter": 10,
      "name": "Lumi Breaks Out",
      "target_minutes": { "easy": 2.0, "medium": 2.5, "hard": 3.1 },
      "target_first_try_win_rate": { "easy": 0.88, "medium": 0.64, "hard": 0.34 },
      "values": {
        "windowSerpentHP": [20, 28, 36],
        "tell_s": [1.8, 1.6, 1.4],
        "biteInterval_s": [10.0, 8.5, 7.2],
        "ropeRingsNeeded": [4, 5, 6],
        "bricks": [58, 72, 86]
      },
      "pressure": "Hero-swap breather: Gnash lunges from 6 arched tower windows while Lumi rings the rooftop bell to lower her escape rope",
      "change": "tune"
    },
    {
      "chapter": 11,
      "name": "Serpent Rivals",
      "target_minutes": { "easy": 3.0, "medium": 4.0, "hard": 4.8 },
      "target_first_try_win_rate": { "easy": 0.76, "medium": 0.38, "hard": 0.18 },
      "values": {
        "twinSealHP": [34, 46, 60],
        "serpentSpeedMult": [0.65, 0.85, 1.10],
        "tell_s": [1.7, 1.4, 1.2],
        "clashInterval_s": [9.0, 7.5, 6.2],
        "bricks": [88, 110, 132]
      },
      "pressure": "Gnash and Mooncoil race from opposite walls toward Lumi's cage; breaking lure runes forces a head-on Clash Chamber stun",
      "change": "tune"
    }
  ],
  "curve": "Pressure rises in two sawtooth waves across the 11 chapters: Chapters 1 to 4 build from a brisk 2.2-minute space boarding sprint into the first true boss wall at Chapter 5 (Frost Warden, 0.50 Medium win rate), followed immediately by a shorter high-spectacle breather in Chapter 6 (Mooncoil Reliquary). Chapters 7 to 9 climb steeply through the castle machinery trilogy into the 3-floor Korr duel in Gatehouse Siege (0.42 Medium win rate), pause for an empowering playable-Lumi breather in Chapter 10, and peak in the dual-serpent exam of Chapter 11 (Serpent Rivals, 0.38 Medium / 0.18 Hard win rate).",
  "continue": {
    "ad_continues": 2,
    "what_continue_restores": "Restores 3 lives on the current floor, keeps all broken bricks, rescued crew, and boss HP dealt, and spawns a 3.0 s Brick Ward shield",
    "fail_screen_copy": "SO CLOSE! {BOSS_OR_GOAL} HAS ONLY {REMAINING} LEFT — KEEP YOUR PROGRESS!"
  },
  "test_plan": [
    "Ordinary-ball progress invariant: run 0-powerup bot across all 33 chapter-mode pairs and assert brick or objective damage occurs at least once every 6.0 s",
    "Run-length envelope: run 50 seeded bot games per chapter/mode and assert median minutes sit within +/-0.5 min of target_minutes",
    "Human-proxy win rate: run 200 jittered bot runs (35 ms lag, +/-6 unit drag error) per chapter/mode and assert win rate within +/-0.07 of target_first_try_win_rate",
    "Telegraph lead-time audit: assert every hazard tell_s logs between 1.20 s and 1.80 s and hazard_event[0] deals 0 player damage",
    "Reaction lane clearance: assert lowest solid brick or hazard y <= paddle.y - 135 units on both 393x852 and 412x915 viewports",
    "Zero enemy brick reward check: assert bricksDestroyedByEnemyProjectiles == 0 across all 11 chapters",
    "Continue state persistence: trigger loss at 90% progress on Floor 3 and assert Continue keeps floor=3, bossHP, and spawns 3.0 s shield"
  ]
}
```

## Art requests

### Image 1: `P02_difficulty-round2_curve-chart_1.png`
```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: stylized-concept.
Asset type: 3D diorama difficulty progression board across 11 chapters, landscape 1536x1024 on a plain calm dark navy #141831 background.
Primary request: Eleven stepped glazed-ceramic plinth columns arranged left to right in a sawtooth pressure wave representing Chapters 1 to 11 of BREACH. Each plinth stack shows three glossy colour-coded ceramic height bars: teal #22C4B0 for Easy, blue #4F9DFF for Medium, and coral-red #FF4D5E for Hard.
- Plinths 1 to 4 rise steadily from space gunmetal tiles into Plinth 5 (Frost Warden, ice-blue peak with a small silver boss crown).
- Plinth 6 dips into a violet breather pedestal (#8F5CF0).
- Plinths 7, 8 and 9 climb steeply in castle brick-red and bronze up to a tall three-tiered Gatehouse peak at Plinth 9 (with Korr's ruby-and-plum boar crest).
- Plinth 10 dips into a rose-pink breather pedestal (#FF80A6, Lumi's tiara motif).
- Plinth 11 towers highest with intertwined emerald (#168F83) and violet (#7A3CCC) serpent crests.
Quality checks: thick clear-coat ceramic sheen, crisp top-left highlights (#FFDBB8), no flat 2D chart lines, no plain circles or rings, no text.
```

## Rules check
- Every hazard has a visible 1.2 to 1.8 s tell and is shown once safely first: **OK** — all 11 chapters enforce `tell_s` between `1.2 s` (Ch 11 Hard) and `1.8 s` (Easy), with Floor 1's first hazard firing into a safe side bastion.
- Ordinary ball play always makes progress; no tiny weak points (min 32x16 brick), no precision puzzles, no waiting on timers or invulnerable enemies: **OK** — closed Ch 4 shutters take crack/transfer damage and Ch 3 stations share hull progress.
- Difficulty changes numbers only (harder but fair): **OK** — Easy, Medium, and Hard use identical patterns and weak points, scaling only `[easy, medium, hard]` numeric arrays.
- No power-up, companion or purchase is required to win; Pause, Continue, Retry keep progress: **OK** — Test Plan #1 verifies 0-powerup completion across all 11 chapters, and Continue preserves current floor and boss HP.
- Enemy attacks never destroy the player's bricks to hand out rewards: **OK** — Test Plan #6 asserts zero enemy-broken player bricks.
- A single brick cracks and fades in about 0.4 s; only big crashes drop debris: **OK** — unchanged across all 11 chapters.
- Effects are rendered gems, chips, sparks, dust or debris; never plain circles or rings: **OK** — urgency tells use physical levers, glowing window sills, and rising water/frost tiles.
- Mobile safe areas, 393x852 and 412x915, 44 pt touch targets, paddle above the thumb: **OK** — rising tide (Ch 8) and frost rows (Ch 5) hard-stop at `y = 480`, leaving `>=140` units of open reaction lane above the paddle.
- Glossy vinyl-toy / glazed-ceramic look, dark navy background, minimal yellow: **OK** — adheres to K05 palette.

## Open questions for Claude
1. Should the first-life safety lip on Easy (`100%`) and Medium (first `12 s` of Floor 1) appear visually as two small stone brackets at the bottom corners? **Recommended:** Yes, draw two `36x10` unit bevelled slate brackets at the drain corners that crack and fade (`0.4 s`) once triggered so the save never feels like a physics bug.
2. In Chapter 2 (The Vault), should hitting Gnash's head during his `1.5 s` venom tell cancel the venom spit in addition to pushing him back `40` units? **Recommended:** Yes, canceling the tell with a direct head hit rewards aggressive aim and makes the snake feel reactive.
3. For Chapter 11 (Serpent Rivals), when Gnash and Mooncoil collide in the 90-unit Clash Chamber, should both heads remain hittable during their `3.0 s` dizzy stun? **Recommended:** Yes, keep both head colliders active at `1.5x` damage so the player can cash in a Sweet-Spot Ram or multi-ball volley.
4. Should remembered difficulty mode in the menu default new installs to Easy or Medium? **Recommended:** Default to Medium ("the real game") with a non-intrusive one-tap switch to Easy on the Continue panel if the player loses twice on Chapter 1 or 2.
