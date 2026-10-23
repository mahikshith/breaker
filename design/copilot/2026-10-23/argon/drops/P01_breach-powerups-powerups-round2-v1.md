---
breach_drop: 1
kind: powerups
slug: powerups-round2
version: 1
date: 2026-10-23
status: proposal
tool: Copilot Studio, Gemini 4 Argon
depends_on: []
---
# BREACH P1: Power-Up Rework & Synergy System

## Summary
- Rebuilds all 9 capsules, 10 hero/companion powers, and the Sweet-Spot Ram around visible physical toy-stacking and 8 two-power synergies inspired by BALL x PIT.
- Replaces invisible global SLOW with a 96-unit glass **TIME BUBBLE** anchored over the paddle (`[0.55, 0.60, 0.65]` ball speed scale inside), turning passive slowness into an active catch-and-redirect tool.
- Upgrades Sweet-Spot Ram radius from `13.2` to `15.6` units (`2.6x` normal ball), duration from `2.5 s` to `3.0 s`, brick cap from `14` to `18`, and villain damage from `3` to `4` HP while cracking 2-HP armour on bounce.
- Fixes capsule economy with higher base drop rates (`[0.16, 0.13, 0.10]` from `[0.14, 0.11, 0.08]`), a hard pity drop after `[7, 8, 10]` dry brick breaks, and faster hero orb charging (`[22, 28, 34]` productive hits from `[24, 30, 36]`).
- Adds distinct 3D physical paddle attachments, colour-coded catch chimes, and a mandatory 1.5 s expiry warning (pulse + two-tick audio) on every timed effect.

## Decisions for the owner
1. Overall power-up direction: A Visible Toy-Stack Synergies (stacking physical attachments + automatic 2-power combo fusions) [RECOMMENDED] [AUTO-PICKED] | B Short Arcade Overdrive (single active slot that levels up 1-to-3 on repeat catches).
2. Reworked SLOW behaviour: A 96-unit glass Time Bubble above the paddle (`[0.55, 0.60, 0.65]` speed inside) [RECOMMENDED] [AUTO-PICKED] | B Global ball deceleration to `0.70x` for `6 s` | C Retire SLOW and replace with MAGNET.
3. Sweet-Spot Ram scale and armour interaction: A Radius `15.6` units (`3.0 s` / `18` bricks / `4` boss HP) and deals `1` damage to 2-HP armour before bouncing [RECOMMENDED] [AUTO-PICKED] | B Keep radius `13.2` units (`2.5 s` / `14` bricks / `3` boss HP) | C Radius `16.5` units (`2.2 s` / `16` bricks) piercing 2-HP armour outright.
4. Hero charge threshold tuning: A Lower to `[22, 28, 34]` productive hits (`[16, 20, 24]` in space chapters) [RECOMMENDED] [AUTO-PICKED] | B Keep `[24, 30, 36]` (`[18, 22, 26]` in space) | C Aggressive `[18, 24, 30]` across all chapters.

## Spec

### Two Directions for Overall Feel

**Direction A — Visible Toy-Stack Synergies [RECOMMENDED] [AUTO-PICKED]:** Every caught capsule snaps a glossy 3D toy part onto Kit's or Lumi's chrome paddle—twin brass blaster barrels for LASER, ceramic bumper wings for WIDE, a translucent cyan dome for BUBBLE—and any two active powers combine automatically into a named synergy with rendered gem/spark payoffs. Repeat catches stack width, add balls up to mode caps (`[12, 9, 5]`), or add `+4.0 s` up to the mode timer ceiling (`[20, 18, 14] s`), creating BALL x PIT build momentum inside a 3-minute mobile run without ever requiring a power-up to win.

**Direction B — Arcade Overdrive Tiers:** The paddle holds one active power at a time, and catching any capsule either swaps the active power or upgrades the current one from Tier 1 to Tier 3. While clean on the HUD, it discards the chaotic multi-power toy combinations that make brick-breaker roguelites sticky and punishes players for catching a different capsule mid-rally.

### 1. Audit of Existing Capsules, Hero Powers & Sweet-Spot Ram

| ID | Type | Player Feel Today | Decision / Skill Moment | Action | Change Summary (from K01 baseline) |
|---|---|---|---|---|---|
| `split` | Capsule (`#5CCF6A`) | Exciting instant board clutter | Banking a lone ball high in a vault shaft before catching `x3` | `tune` | Keep `x3` split; if already at `[12, 9, 5]` ball cap, converts extra spawns into `+2` hero charge hits per capped ball. |
| `burst` | Capsule (`#F7C948`) | Samey beside SPLIT; spawns from paddle | Timing catch when boss weak point or gate lane is open | `tune` | Launches 3 balls from paddle in a `24 deg` spread at `1.12x` speed (`386 units/s`) with gold star glints. |
| `fire` | Capsule (`#FF8A3D`) | Strong piercing, ends abruptly | Aiming through dense 1-HP columns to melt rows | `tune` | Duration `[9, 8, 7] s`; ploughs 1-HP bricks and scorches adjacent horizontal brick for `1` damage on every 3rd pierce. |
| `wide` | Capsule (`#3FA8F5`) | Safe, reliable comfort pickup | Easier centre-third alignment for Sweet-Spot Ram streaks | `tune` | Widens paddle `100 -> 132` units (`+16` on second stack up to `148` max); sweet-spot centre third scales proportionally (`44` units). |
| `aim` | Capsule (`#C46BF0`) | Redundant with manual Focus aim | Holding release for a high-velocity snipe through a gap | `rework` | Extends Focus aim slow-mo (`0.20x` time) and draws a 2-bounce dotted gem preview line; next release gains `+18%` speed (`407 units/s`) for `1.5 s`. |
| `laser` | Capsule (`#FF4D6D`) | Fun pew-pew, low impact feedback | Steering paddle under keystones/bosses while keeping ball live | `tune` | Duration `[8, 7, 6] s` (from flat `7 s`); fires twin ceramic bolts every `0.35 s` (`2` bricks or `0.5` boss HP per pair). |
| `shield` | Capsule (`#2EC4B6`) | Passive safety line at bottom | Letting a fast angled ball bounce off the ward to reposition | `tune` | Holds `2` missed-ball saves across the `360`-unit drain lane; each save rebounds ball at `360 units/s` toward the nearest brick cluster. |
| `slow` | Capsule (`#7FD6FF`) | Invisible; feels like frame drag | Choosing whether to catch inside the bubble or let ball bypass | `rework` | Becomes **BUBBLE**: a `96x44` unit glass dome over the paddle for `[9, 8, 7] s`; slows balls inside to `[0.55x, 0.60x, 0.65x]` (`190–224 units/s`). |
| `tiny` | Capsule (`#5A5F78`) | Pure punishment with no upside | Dodging a falling hazard capsule during a multi-ball rally | `rework` | Shrinks paddle `100 -> 74` units for `[6, 7, 8] s` but awards `1.5x` score (`+50%` Shine) and `+2` hero charge per brick while active. |
| `brick-ward` | Kit Hero | Solid defensive reset | Saving charge for a multi-hazard boss volley | `keep` | Spawns a 3-save royal cobalt barrier (`y: 716`) for `[12, 10, 8] s` and clears enemy projectiles in the lower quarter. |
| `arrows` | Kit Hero | Quick vertical burst | Firing when boss is unshielded or murder holes open | `tune` | Fires `[7, 6, 5]` copper-shafted steel arrows across `140` units width; each deals `2` brick damage or `1.5` boss HP (`9` boss HP cap per cast). |
| `titan` | Kit Hero (`COSMIC`) | High-impact unstoppable orb | Launching into a choked corridor or boss plinth | `tune` | Duration `[8, 7, 6] s` (from `7 s`), radius `10.5` units, deals `4` boss HP per hit, max simultaneous `[2, 2, 1]`. |
| `ball-fan` | Kit Hero | Chaotic screen filler | Triggering when side lanes are open to flood the upper board | `keep` | Spawns `[5, 4, 3]` chrome balls in a `50 deg` upward fan obeying `[12, 9, 5]` live ball cap. |
| `space-laser` | Space Companion | Good sustained hull pressure | Aligning skiff fire with exposed reactor panels | `tune` | Duration `[10, 9, 8] s` (tuned from `10 s` flat); twin cyan plasma bolts every `0.30 s`, never self-recharges orb. |
| `space-unstoppable` | Space Companion | Strong panel breaker | Punching through armored carrier shutters | `tune` | Duration `[10, 8.5, 7] s`, radius `10.0` units, ploughs 1-HP/2-HP panels, bounces off hull bulkheads for `3` HP. |
| `space-5balls` | Space Companion | Great panic board clear | Flooding carrier raiders before extraction clocks expire | `keep` | Fills live balls up to `5` immediately (`+2` bonus balls on Easy if already at `4+`, capped at `[12, 9, 5]`). |
| `lullaby` | Lumi Hero | Unique thematic crowd control | Casting right as Gnash/Mooncoil enters a `1.6 s` hiss tell | `tune` | Calms serpents and beasts for `[5.0, 4.0, 3.2] s` (from flat `4 s`) and slows hazard clocks to `0.4x`. |
| `starlight-notes` | Lumi Hero | Feeds the power-up loop | Triggering right before a multi-ball volley hits a brick bank | `keep` | Next `[7, 6, 5]` broken bricks are guaranteed to drop positive power-up capsules (ignores pity counter reset). |
| `song-shield` | Lumi Hero | Graceful defensive arc | Catching a fast return and converting enemy shots | `tune` | Rose-gold arched barrier (`2` saves, `[11, 9, 7] s`) that reflects harmlessly dissolved enemy shots as `1` hero charge pip. |
| `ram` | Sweet-Spot Ram | Satisfying skill shot, slightly small | Hitting 3 centre-third paddle shots in a row to arm, 4th to fire | `tune` | Radius `13.2 -> 15.6` units (`31.2` units across), duration `2.5 -> 3.0 s`, brick cap `14 -> 18`, villain damage `3 -> 4` HP, cracks 2-HP armour for `1` HP on bounce. |

### 2. Synergy Table (Active Pair Combos)

| Pair (`a` + `b`) | Combo Name | What Happens in Game Units & Seconds | Visual FX (No Plain Circles/Rings) |
|---|---|---|---|
| `fire` + `split` | **Cinder Scatter** | Every split ball ignites for `6.0 s`; each brick break throws 2 ember chips `28` units left/right for `1` damage. | Faceted orange-gold spark clusters (`#FF8A3D` / `#FFD36B`) and dark soot flakes. |
| `laser` + `wide` | **Broadside Battery** | Adds a 3rd centre brass barrel to the widened paddle; volley width spans `108` units at `0.30 s` interval. | Three stubby brass muzzles on the chrome paddle with four-pointed muzzle glints. |
| `fire` + `ram` | **Molten Ram** | Ram radius grows to `17.0` units, ploughs through 2-HP bricks without bouncing, and deals `6` HP to villains. | Heavy dark-chrome horned ball trailing irregular molten gold drips (`#F4C542`). |
| `slow` + `aim` | **Chrono Snipe** | Balls entering the `96`-unit BUBBLE auto-prime Focus aim without holding still and fire out at `425 units/s`. | Lilac crystal prisms (`#E3B6FF`) floating inside thefaceted cyan glass dome. |
| `burst` + `laser` | **Salvo Escort** | Each of the 3 BURST balls fires one upward bolt (`1` damage) every `4th` brick bounce for `6.0 s`. | Tiny copper dart sprites launching from the ball's top-left highlight. |
| `shield` + `wide` | **Fortress Wall** | Bottom Brick Ward thickens to `3` saves and rebounds saved balls straight toward the lowest remaining brick. | Interlocking teal ceramic shield tiles (`#2EC4B6`) along the save line. |
| `split` + `titan` | **Cosmic Echo** | While COSMIC is live, up to `2` ordinary split balls gain a violet star coat that deals `2` HP to armour bricks. | Faceted violet starlight shards (`#8F5CF0`) shedding behind secondary balls. |
| `slow` + `shield` | **Sanctuary Dome** | Missing a ball consumes `1` SHIELD save and pulls the rebounded ball directly into the paddle's BUBBLE at `0.5x` speed. | Teal-and-ice faceted crystal chips (`#7FD6FF`) rising from the bottom barrier. |

### 3. Economy, Drop Rules & Caps per Mode

| Rule / Parameter | Baseline (K01) | New Easy | New Medium | New Hard | Notes |
|---|---:|---:|---:|---:|---|
| Base capsule drop chance | `0.14 / 0.11 / 0.08` | `0.16` | `0.13` | `0.10` | Rolled per broken brick; Gem Cache bricks stay `1.00`. |
| Pity rule (dry breaks) | `10` | `7` | `8` | `10` | Guarantees a positive capsule on the Nth break without a drop. |
| Max capsules falling at once | `2` | `2` | `2` | `2` | Extra triggered drops bank for `1.5 s` until a slot clears. |
| Capsule fall speed (units/s) | `115` | `105` | `118` | `130` | Slight initial pop (`yVel: -45 -> +118 units/s`, `0.25 s`, `easeInQuad`). |
| Productive hits to fill Hero Orb | `24 / 30 / 36` | `22` | `28` | `34` | Space chapters use `[16, 20, 24]` ordinary damage credits. |
| Max live balls from powers | `12 / 9 / 5` | `12` | `9` | `5` | Overflow pickups grant `+2` hero charge pips instead of vanishing. |
| Max Cosmic balls at once | `2 / 2 / 1` | `2` | `2` | `1` | Hard mode strictly caps at `1` Cosmic ball. |
| Max power timer ceiling (s) | `20 / 18 / 14` | `20.0` | `18.0` | `14.0` | Repeat catches add `+4.0 s` capped at ceiling. |

### 4. Catch Juice & Last-1.5 s Expiry Readability

| Power | Catch Sound & Screen Juice (`0.0–0.25 s`) | Last `1.5 s` Expiry Warning (Property `from -> to`, Duration, Easing) |
|---|---|---|
| `split` / `burst` | Bright three-note xylophone chime; paddle squash `scaleY 1.0 -> 0.82 -> 1.0, 0.18 s, easeOutBack`; 6 gold star glints. | Instant spawn (no timer); excess balls above cap flash white once on merge. |
| `fire` | Furnace whoosh + crisp crackle; ball coat shifts chrome to `#FF8A3D` with 4 ember chips. | Flame coat flickers at `6 Hz`, `alpha 1.0 -> 0.35, 1.5 s, linear`, two low ember pops at `-1.0 s` and `-0.5 s`. |
| `wide` | Hydraulic brass clunk; paddle width `100 -> 132 units, 0.22 s, easeOutBack` with blue bevel flash (`#3FA8F5`). | Side extension caps pulse inward `xOffset 0 -> -4 -> 0 units, 0.35 s x 4, easeInOutSine` + two metallic ticks. |
| `aim` | Crystalline harp glissando; lilac sighting prism pops above paddle (`scale 0 -> 1.0, 0.20 s, easeOutBack`). | Sighting prism dims `alpha 1.0 -> 0.25, 1.5 s, easeInQuad` with two high glass chimes. |
| `laser` | Dual bolt-cocking click; twin `#FF4D6D` barrels rise `yOffset +8 -> 0 units, 0.18 s, easeOutBack`. | Barrels retract halfway and blink `#FF4D5E` (`scaleY 1.0 -> 0.65, 1.5 s, easeInQuad`) + two empty-clip clicks. |
| `shield` | Heavy knight-shield lock; teal ward bar slides in (`y 732 -> 716, 0.20 s, easeOutCubic`). | On last `1` save remaining, ward cracks and glints `#7FD6FF` (`alpha 0.9 -> 0.55` pulse at `4 Hz`). |
| `slow` (BUBBLE) | Soft glass bell chime; `96x44` cyan dome inflates `scale 0.2 -> 1.0, 0.24 s, easeOutBack`. | Dome glass thins `scale 1.0 -> 0.90, 1.5 s, easeInQuad` and ticks twice at `-1.0 s` and `-0.4 s` before popping into 5 ice chips. |
| `tiny` | Dull anvil thud; paddle clamps `100 -> 74 units, 0.18 s, easeInBack` while `#FFD36B` `1.5x` score badge pops. | Grey clamps shake `xOffset -2 -> +2 units, 1.5 s` and release with a bright spring boing (`74 -> 100 units, 0.20 s, easeOutBack`). |
| `ram` | On 3rd centre hit: brass ram horns snap out of paddle sides (`scale 0 -> 1.15 -> 1.0, 0.22 s, easeOutBack`) + horn blast. | Last `1.5 s` (or last `4` bricks of `18`): horned ball flashes `#FFDBB8` at `6 Hz` and shrinks `radius 15.6 -> 6.0, 0.25 s, easeInBack`. |

## Data
```json
{
  "kind": "powerups",
  "capsules": [
    {
      "id": "split",
      "new": false,
      "label": "x3",
      "color": "#5CCF6A",
      "effect": "Splits the highest live ball into 3 chrome balls at +/-18 deg; grants +2 hero charge per ball if at mode cap",
      "numbers": { "duration_s": 0, "count": 3, "stack": "adds", "cap": 12, "cap_per_mode": [12, 9, 5] },
      "drop_weight": { "easy": 12, "medium": 10, "hard": 7 },
      "good": true,
      "counterplay_or_cost": "Tracking multiple angles while dodging villain hazards",
      "feel": "Three-note emerald chime, paddle squash 0.82x, 6 faceted green ceramic sparks",
      "change": "tune"
    },
    {
      "id": "burst",
      "new": false,
      "label": "+3",
      "color": "#F7C948",
      "effect": "Fires 3 new chrome balls upward from the paddle in a 24 deg fan at 1.12x speed (386 units/s)",
      "numbers": { "duration_s": 0, "count": 3, "stack": "adds", "cap": 12, "cap_per_mode": [12, 9, 5] },
      "drop_weight": { "easy": 10, "medium": 8, "hard": 6 },
      "good": true,
      "counterplay_or_cost": "Immediate 3-ball volley from low screen requires fast thumb recovery",
      "feel": "Brass fanfare pop, gold star glints from paddle centre, crisp upward launch kick",
      "change": "tune"
    },
    {
      "id": "fire",
      "new": false,
      "label": "FIRE",
      "color": "#FF8A3D",
      "effect": "Coats live balls in glazed flame that ploughs 1-HP bricks and scorches 1 adjacent brick every 3rd pierce",
      "numbers": { "duration_s": 8, "duration_per_mode_s": [9, 8, 7], "count": 1, "stack": "adds", "cap": 20 },
      "drop_weight": { "easy": 10, "medium": 9, "hard": 7 },
      "good": true,
      "counterplay_or_cost": "Still bounces off 2-HP armour and granite blocks, altering expected pierce paths",
      "feel": "Furnace whoosh, chunky orange ember chips on impact, 6 Hz flicker + two pops in last 1.5 s",
      "change": "tune"
    },
    {
      "id": "wide",
      "new": false,
      "label": "WIDE",
      "color": "#3FA8F5",
      "effect": "Extends paddle width from 100 to 132 units (148 on second stack) and widens the centre-third Ram sweet spot",
      "numbers": { "duration_s": 10, "duration_per_mode_s": [12, 10, 8], "count": 1, "stack": "adds", "cap": 148, "width_units": [132, 132, 126] },
      "drop_weight": { "easy": 12, "medium": 10, "hard": 8 },
      "good": true,
      "counterplay_or_cost": "Wider profile is easier for enemy projectiles or falling TINY capsules to clip",
      "feel": "Hydraulic clunk, blue ceramic wing caps snap out (easeOutBack 0.22 s), two ticks in last 1.5 s",
      "change": "tune"
    },
    {
      "id": "aim",
      "new": false,
      "label": "AIM",
      "color": "#C46BF0",
      "effect": "Upgrades Focus aim with a 2-bounce gem trajectory line, 0.20x slow-mo, and +18% launch speed (407 units/s)",
      "numbers": { "duration_s": 9, "duration_per_mode_s": [10, 9, 7], "count": 1, "stack": "refreshes", "cap": 1 },
      "drop_weight": { "easy": 8, "medium": 8, "hard": 7 },
      "good": true,
      "counterplay_or_cost": "Holding still to aim leaves paddle stationary against incoming telegraphed hazards",
      "feel": "Crystalline harp chord, lilac sighting prism on paddle, two high glass chimes in last 1.5 s",
      "change": "rework"
    },
    {
      "id": "laser",
      "new": false,
      "label": "LASER",
      "color": "#FF4D6D",
      "effect": "Mounts twin red-ceramic blaster barrels on paddle ends firing 2 bolts every 0.35 s (0.5 boss HP per pair)",
      "numbers": { "duration_s": 7, "duration_per_mode_s": [8, 7, 6], "count": 2, "stack": "adds", "cap": 18 },
      "drop_weight": { "easy": 9, "medium": 8, "hard": 6 },
      "good": true,
      "counterplay_or_cost": "Laser hits do not fill the hero charge meter; lining up shots can pull thumb off ball path",
      "feel": "Dual mechanical lock click, crisp pew-clink on ceramic tiles, empty-clip clicks in last 1.5 s",
      "change": "tune"
    },
    {
      "id": "shield",
      "new": false,
      "label": "SHIELD",
      "color": "#2EC4B6",
      "effect": "Deploys a 2-save glazed teal barrier across the drain lane that rebounds missed balls toward bricks",
      "numbers": { "duration_s": 14, "duration_per_mode_s": [16, 14, 11], "count": 2, "stack": "refreshes", "cap": 3 },
      "drop_weight": { "easy": 10, "medium": 8, "hard": 6 },
      "good": true,
      "counterplay_or_cost": "Rebounded balls exit at full 360 units/s without counting toward Sweet-Spot Ram streak",
      "feel": "Knight shield lock chime, teal faceted barrier bar, cracks on final save and ticks in last 1.5 s",
      "change": "tune"
    },
    {
      "id": "slow",
      "new": false,
      "label": "BUBBLE",
      "color": "#7FD6FF",
      "effect": "Projects a 96x44 unit glass dome over the paddle that slows balls inside to 0.55x/0.60x/0.65x speed",
      "numbers": { "duration_s": 8, "duration_per_mode_s": [9, 8, 7], "count": 1, "stack": "refreshes", "cap": 1, "speed_scale": [0.55, 0.6, 0.65] },
      "drop_weight": { "easy": 8, "medium": 7, "hard": 6 },
      "good": true,
      "counterplay_or_cost": "Balls leaving the 96-unit bubble snap back to full 345+ units/s immediately",
      "feel": "Soft glass chime, translucent cyan dome with stretched ball trail, thins and ticks twice in last 1.5 s",
      "change": "rework"
    },
    {
      "id": "tiny",
      "new": false,
      "label": "TINY",
      "color": "#5A5F78",
      "effect": "Hazard pickup: shrinks paddle from 100 to 74 units for 6/7/8 s, but grants 1.5x score and +2 hero charge per hit",
      "numbers": { "duration_s": 7, "duration_per_mode_s": [6, 7, 8], "count": 1, "stack": "refreshes", "cap": 1, "width_units": [78, 74, 70] },
      "drop_weight": { "easy": 4, "medium": 6, "hard": 8 },
      "good": false,
      "counterplay_or_cost": "26% narrower paddle makes edge saves and Sweet-Spot Ram streaks much tighter",
      "feel": "Heavy iron clamp thud, flashing red-slate capsule rim, spring release boing after 1.5 s shake",
      "change": "rework"
    }
  ],
  "hero_powers": [
    {
      "hero": "kit",
      "id": "brick-ward",
      "new": false,
      "label": "BRICK WARD",
      "effect": "Summons a 3-save cobalt heraldic barrier at y=716 for 12/10/8 s and clears lower-lane enemy shots",
      "numbers": { "duration_s": 10, "damage": 0, "saves": 3, "duration_per_mode_s": [12, 10, 8] },
      "change": "keep"
    },
    {
      "hero": "kit",
      "id": "arrows",
      "new": false,
      "label": "ARROWS",
      "effect": "Launches a 7/6/5 volley of copper-and-steel arrows across 140 units dealing 2 brick damage or 1.5 boss HP each",
      "numbers": { "duration_s": 1.2, "damage": 2, "count_per_mode": [7, 6, 5], "boss_damage_cap": 9 },
      "change": "tune"
    },
    {
      "hero": "kit",
      "id": "titan",
      "new": false,
      "label": "COSMIC",
      "effect": "Transforms primary ball into a 10.5-radius violet starlight orb that ploughs bricks and deals 4 boss HP per hit",
      "numbers": { "duration_s": 7, "damage": 4, "duration_per_mode_s": [8, 7, 6], "radius": 10.5 },
      "change": "tune"
    },
    {
      "hero": "kit",
      "id": "ball-fan",
      "new": false,
      "label": "BALL FAN",
      "effect": "Launches 5/4/3 chrome balls in a 50 deg upward arc from the paddle, respecting mode ball caps",
      "numbers": { "duration_s": 0, "damage": 1, "count_per_mode": [5, 4, 3] },
      "change": "keep"
    },
    {
      "hero": "space",
      "id": "space-laser",
      "new": false,
      "label": "LASER",
      "effect": "Skiff companion fires twin cyan plasma bolts every 0.30 s for 10/9/8 s without self-recharging the orb",
      "numbers": { "duration_s": 9, "damage": 1, "duration_per_mode_s": [10, 9, 8] },
      "change": "tune"
    },
    {
      "hero": "space",
      "id": "space-unstoppable",
      "new": false,
      "label": "UNSTOPPABLE",
      "effect": "Launches a 10.0-radius TITAN core for 10/8.5/7 s that crushes ship panels and deals 3 hull HP on bulkhead bounce",
      "numbers": { "duration_s": 8.5, "damage": 3, "duration_per_mode_s": [10, 8.5, 7], "radius": 10.0 },
      "change": "tune"
    },
    {
      "hero": "space",
      "id": "space-5balls",
      "new": false,
      "label": "5 BALLS",
      "effect": "Fills active playfield to 5 live chrome balls immediately (+2 bonus on Easy up to cap)",
      "numbers": { "duration_s": 0, "damage": 1, "target_balls": 5 },
      "change": "keep"
    },
    {
      "hero": "lumi",
      "id": "lullaby",
      "new": false,
      "label": "LULLABY",
      "effect": "Sings a lilac-and-rose harmonic wave that calms serpents/beasts for 5.0/4.0/3.2 s and slows hazard timers to 0.4x",
      "numbers": { "duration_s": 4, "damage": 0, "duration_per_mode_s": [5.0, 4.0, 3.2] },
      "change": "tune"
    },
    {
      "hero": "lumi",
      "id": "starlight-notes",
      "new": false,
      "label": "STARLIGHT",
      "effect": "Marks the next 7/6/5 broken bricks with golden music notes that guarantee positive power-up capsule drops",
      "numbers": { "duration_s": 12, "damage": 0, "guaranteed_drops": [7, 6, 5] },
      "change": "keep"
    },
    {
      "hero": "lumi",
      "id": "song-shield",
      "new": false,
      "label": "SONG SHIELD",
      "effect": "Creates a 2-save rose-gold arched barrier for 11/9/7 s that converts enemy shots into +1 hero charge pip",
      "numbers": { "duration_s": 9, "damage": 0, "saves": 2, "duration_per_mode_s": [11, 9, 7] },
      "change": "tune"
    }
  ],
  "charge": {
    "hits_to_fill": { "easy": 22, "medium": 28, "hard": 34 },
    "what_counts": "Productive ordinary ball, Ram, or paddle deflections that damage a brick, boss, or objective (laser/cosmic hits do not self-charge; TINY grants +2 per hit)"
  },
  "ram": {
    "streak_to_arm": 3,
    "radius": 15.6,
    "time_s": 3.0,
    "bricks": 18,
    "damage": 4,
    "change": "tune"
  },
  "drop_rules": {
    "base_chance": { "easy": 0.16, "medium": 0.13, "hard": 0.10 },
    "pity_after_breaks": 8,
    "max_falling": 2
  },
  "synergies": [
    { "a": "fire", "b": "split", "result": "Cinder Scatter: all split balls ignite for 6 s and throw 2 lateral ember chips (28 units) per brick break" },
    { "a": "laser", "b": "wide", "result": "Broadside Battery: adds a 3rd centre brass blaster barrel across a 108-unit volley at 0.30 s fire rate" },
    { "a": "fire", "b": "ram", "result": "Molten Ram: Ram ball grows to radius 17.0, pierces 2-HP armour bricks without bouncing, and deals 6 boss HP" },
    { "a": "slow", "b": "aim", "result": "Chrono Snipe: balls inside the 96-unit BUBBLE auto-prime Focus aim and launch at 425 units/s" },
    { "a": "burst", "b": "laser", "result": "Salvo Escort: each of the 3 burst balls fires an upward ceramic dart every 4th brick bounce for 6 s" },
    { "a": "shield", "b": "wide", "result": "Fortress Wall: upgrades bottom ward to 3 saves and aims saved rebounds at the lowest remaining brick" },
    { "a": "split", "b": "titan", "result": "Cosmic Echo: coats up to 2 secondary split balls in violet starlight dealing 2 damage to armour bricks" },
    { "a": "slow", "b": "shield", "result": "Sanctuary Dome: a shield save guides the rebounded ball directly into the paddle's slow BUBBLE at 0.5x speed" }
  ]
}
```

## Art requests

### Image 1: `P01_powerups-round2_synergy-chart_1.png`
```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: stylized-concept.
Asset type: visual power-up synergy showcase board, landscape 1536x1024, 3 columns by 2 rows of dark slate-navy recessed showcase bays on a plain dark navy #141831 background.
Primary request: Six 3D glossy toy-stack synergy dioramas showing how two BREACH power-up capsules combine on the chrome paddle or chrome ball:
1. Top-left (Cinder Scatter): orange FIRE capsule (#FF8A3D) and green SPLIT capsule (#5CCF6A) beside three flaming glazed balls scattering faceted ember chips.
2. Top-centre (Broadside Battery): red LASER capsule (#FF4D6D) and blue WIDE capsule (#3FA8F5) above a widened chrome paddle with three brass blaster barrels firing chunky red ceramic bolts.
3. Top-right (Molten Ram): orange FIRE capsule (#FF8A3D) and dark-chrome horned RAM ball (radius 15.6 proportions) with brass curled horns ploughing through two cracked slate-granite armour bricks with molten gold drips (#F4C542).
4. Bottom-left (Chrono Snipe): light-blue BUBBLE capsule (#7FD6FF) and purple AIM capsule (#C46BF0) above a chrome paddle enclosed in a faceted translucent cyan glass dome with a lilac crystal prism arrow.
5. Bottom-centre (Salvo Escort): warm gold BURST capsule (#F7C948) and red LASER capsule (#FF4D6D) beside three rising chrome balls launching small copper darts upward.
6. Bottom-right (Fortress Wall): teal SHIELD capsule (#2EC4B6) and blue WIDE capsule (#3FA8F5) above a wide chrome paddle resting over a three-segment glazed teal shield wall.
Quality checks: thick clear-coat gloss on every capsule and ball; warm top-left key light #FFDBB8; NO plain circles, NO rings, NO text, NO grid lines.
```

## Rules check
- Every hazard has a visible 1.2 to 1.8 s tell and is shown once safely first: **OK** — TINY capsule falls at `105–130 units/s` (`>4.0 s` fall across the board) with a flashing red-slate rim.
- Ordinary ball play always makes progress; no tiny weak points (min 32x16 brick), no precision puzzles, no waiting on timers or invulnerable enemies: **OK** — every brick and villain remains breakable with a single ordinary chrome ball.
- Difficulty changes numbers only (harder but fair): **OK** — Easy/Medium/Hard only adjust drop rates (`[0.16, 0.13, 0.10]`), durations, caps (`[12, 9, 5]`), and charge counts (`[22, 28, 34]`).
- No power-up, companion or purchase is required to win; Pause, Continue, Retry keep progress: **OK** — all synergies and the 15.6-unit Ram are accelerators; base ball speed (`345 units/s`) clears every floor alone.
- Enemy attacks never destroy the player's bricks to hand out rewards: **OK** — only player balls, Ram, and player powers break bricks.
- A single brick cracks and fades in about 0.4 s; only big crashes drop debris: **OK** — single bricks keep the `0.4 s` crack-and-fade; only multi-brick Ram ploughs drop chip sprites.
- Effects are rendered gems, chips, sparks, dust or debris; never plain circles or rings: **OK** — BUBBLE is a 3D faceted glass dome, AIM uses a crystal prism and gem dots, sparks are 4/5-pointed glints.
- Mobile safe areas, 393x852 and 412x915, 44 pt touch targets, paddle above the thumb: **OK** — Hero face orb at lower-left (`56x56` units, `>44 pt`) and BUBBLE dome stay above the dark control deck.
- Glossy vinyl-toy / glazed-ceramic look, dark navy background, minimal yellow: **OK** — BURST gold (`#F7C948`) is a small capsule accent only; background remains `#141831`.

## Open questions for Claude
1. When a player is already at the mode ball cap (`[12, 9, 5]`) and catches `SPLIT` or `BURST`, should excess balls convert into Hero Orb charge or score? **Recommended:** Grant `+2` Hero Orb charge hits per capped ball so multi-ball catches never feel wasted on Hard (`cap: 5`).
2. Should the Sweet-Spot Ram's 3-hit arming counter reset if a secondary multi-ball hits the paddle edges while the player tracks the main ball? **Recommended:** Only reset the streak if the paddle misses a ball or if `2.5 s` pass without a centre-third hit during single-ball play; during multi-ball, any centre-third hit advances the streak and edge hits do not reset it.
3. When `WIDE` and `TINY` are caught within `3 s` of each other, do they cancel out or overwrite? **Recommended:** They cancel back to the base `100`-unit paddle width with a crisp steam-hiss and `+250` bonus score, letting `WIDE` act as a cleanse for `TINY`.
4. Should the `96x44` unit `BUBBLE` move horizontally locked to the paddle's `x` centre? **Recommended:** Yes, lock `bubble.x = paddle.x` with a `0.04 s` spring lag so the glass dome tilts slightly (`+/-4 deg`) as the player drags.
