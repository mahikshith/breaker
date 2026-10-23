# Floor hooks: audit and the Gatehouse floor 1 fix

Owner complaint (2026-10-23): Gatehouse floor 1 "Drawbridge" is empty. You break bricks and two counterweight housings, the bridge drops, and there is nothing on it and nothing at stake. Empty floors make people uninstall.

## The rule (applies to every floor of every chapter from now on)

Every floor needs all three of these:

1. **Stake on screen.** A character, a captive, a treasure or a threat the player can see.
2. **Pressure.** A visible clock or threat that punishes waiting.
3. **Carry-over payoff.** What you do here changes the next floor or the boss, or banks something.

Verdicts: **OK** means all three are present. **WEAK** means one or two are present. **EMPTY** means none are present. The facts below come from the model code on `codex/castle-chapters` (2026-10-23).

## Multi-floor chapters

| Chapter / floor | Stake today | Pressure today | Carry-over today | Verdict | One-line fix |
|---|---|---|---|---|---|
| **Gatehouse 1: Drawbridge** | None. The bridge and two housings, with no character. | None. | None. Lives and score only. | **EMPTY** | **Built on `codex/floor-hooks`; see below.** Korr winches on the battlements, a winch clock heals housings, a par drop smashes his bell rack (slower floor 2 bells), and gem bricks bank loot. |
| Gatehouse 2: Murder holes | Korr on the gallery dropping bells. | Bells stun the paddle. Bug: after the teaching bell, the next bell was scheduled on the run clock, so floor 2 went almost bell-free. Fixed on this branch. | None into floor 3. | WEAK | Raise the gate before Korr's third bell and the portcullis jams one dais vent: floor 3 starts with one bell hole shut. |
| Gatehouse 3: Inner gate | Korr duel (boss). | Kicked bells and Korr's HP bar. | Chapter win leads into Lumi Breaks Out. | OK | None needed. Optionally show the floor 1/2 payoffs on the dais (wrecked rack, shut vent). |
| Lumi 1: The cell | Lumi herself (the player) behind bars. Nothing threatens her. | None. No windows and no serpent on this floor. | None. | WEAK (close to empty) | Gnash's eye at the door grate and a guard's lantern doing rounds (a visible clock). Break out before the lantern returns and Lumi pockets the key, so one floor 2 window starts shuttered. |
| Lumi 2: Serpent windows | Gnash lunging from six windows. | Hiss tell, then a bite that eats a brick row or swallows the ball. | None. Bites only count for stars. | WEAK | Every head hit cracks that window's frame. Cracked windows stay boarded on the roof floor. |
| Lumi 3: Roof race | The roof bell and Gnash. | Lunges while you ring the bell. | Chapter end (escape). | OK | None needed. |
| Rivals 1: Lure hall | Gnash and his rune lure. Mooncoil is shuttered scenery. | Gnash lunges. | None. The hatch resets the board. | WEAK | Baiting Gnash into eating his own bricks with the lure pre-cracks the floor 2 Seal: start it at -2 HP, with the crack drawn. |
| Rivals 2: The crossing | Both serpents and the Twin Seal (floor 2 HP). | Lunges, plus ward plates fed by their meals. | Clashes only count for stars. The Seal resets on floor 3. | WEAK | Each clash on floor 2 leaves that serpent dizzy for the first 8 s of floor 3, shown as a boarded window. |
| Rivals 3: Twin Seal | Twin Seal and both serpents (finale). | Lunges and ward plates. | Chapter end. | OK | None needed. |
| Bellforge Run (one encounter) | Lumi on Korr's lift. | Docked bells ratchet the lift down. The mistake allowance is the clock. | Single screen. The win frees Lumi. | OK | None needed. A later chapter could reuse the lift as a captive callback. |
| Tidewheel Citadel (one encounter) | Lumi on the refuge balcony, and Nerra. | Rising water, pulls and pulses. | Single screen. Stars track how close the flood came. | OK | None needed. |

**Counts for multi-floor chapters (9 floors, today):** 3 OK, 5 WEAK, 1 EMPTY. Bellforge and Tidewheel are single-encounter chapters and are both OK.

**Worst floors:** Gatehouse 1 (now fixed on this branch) and Lumi 1, which has no threat and no clock. Every middle floor (Gatehouse 2, Lumi 2, Rivals 1 and 2) has stake and pressure but nothing that carries forward.

## Single-screen chapters (note only)

These are one-screen chapters, so carry-over means "banks stars or score" rather than changing a next floor.

| Chapter | Stake | Pressure | Verdict |
|---|---|---|---|
| Carrier Breakout | Crew pods to rescue. | JUMP clock, raiders. | OK |
| The Vault | Lumi in the tower. | The serpent chewing its way down. | OK |
| Circuit Breakout | The relay mothership. | Gun fire, but no clock. | WEAK (no visible clock) |
| Shutter Forge | Reactor core and stabilisers. | Shutter openings, but no clock. | WEAK (no visible clock) |
| Frost Warden | Lumi and her defences. | The siege on the defences. | OK |
| Mooncoil Reliquary | Lumi caged in moonstone. | Mooncoil and Gnash closing in, falling counterweights. | OK |

## Built: Gatehouse floor 1 hooks

Code: `src/fantasy/gatehouse.js` (rules in `GATEHOUSE_MODES`, plus `PARAPET`, `RACK` and `GEM_SCORE`). Art: `src/fantasy/render.js`, using only existing ART (Korr sheet, bellforge ratchet, bell cradle, bells, plinth, fx kit gems). Tests: `tests/gatehouse.test.js`.

- **Stake.** Korr stands on a battlement parapet above the raised bridge, cranking his winch, with his bell rack (stocked with bells) beside him. The left hoist chain runs over the rack's crossbar. The parapet is a solid, and the ball's ceiling is its underside (`PARAPET.bottom` = 72), so Korr, the winch and the rack are scenery the ball can never reach. Korr has no collider on this floor, so pose swaps cannot trap the ball. The bridge and housings moved down 24u to make room. Floor 1 is otherwise unchanged.
- **Pressure: the winch clock.** Five gems on a plaque under the winch fill while a damaged (not destroyed) housing stands and no housing has been hit for `crankIdle` seconds. When the gems are full, Korr cranks, which is the telegraph:
  - the gems burn;
  - the target housing turns red-hot, lifts and shakes, and its chain goes taut and spits sparks;
  - the gem it will regain glows;
  - "HIT IT!" shows under the housing.

  After `crankTell` seconds that housing regains 1 HP, Korr gloats, and the clock restarts. Hitting any housing during the telegraph jams the crank: Korr staggers, "JAMMED!" shows and the player gets +25. A destroyed housing is never healed. Korr gets at most `crankCap` cranks per floor, so ordinary play always progresses.
- **Payoff: par.** A chip under the floor chip counts down `PAR 0:xx`; it pulses in its last 6 s. Drop the bridge inside par and the falling bridge rips the hoist chain off the bell rack. The rack smashes into bronze and bell chunks, Korr reels, and the banner reads **BELL RACK SMASHED!** Floor 2 then shows the toppled rack on the gallery, a "RACK SMASHED · SLOW BELLS" chip and banner, and Korr's bells come `RACK.slow` (1.5x) slower, with the first one `RACK.delay` (4 s) later. If par runs out, Korr hauls the rack away along the walk ("TOO SLOW!"), and floor 2 has the stocked rack and normal bells.
- **Loot gems.** Six floor 1 bricks carry rendered gems (gold, blue, rose). Breaking one banks it: the gem flies up to the par chip. On the crash the banked gems shower out of the landing (+50 each, "+N LOOT").
- **Near-miss line.** While par is live it reads "N HITS TO CRUSH KORR'S BELL RACK", otherwise "N HITS TO DROP THE DRAWBRIDGE". The coach hooks are unchanged (serve, ram).

| Rule | Easy | Medium | Hard |
|---|---:|---:|---:|
| `crankIdle`: seconds with no housing hit before a crank | 7 | 6 | 5 |
| `crankTell`: telegraph length | 1.8 s | 1.5 s | 1.2 s |
| `crankCap`: most cranks per floor | 2 | 3 | 4 |
| `par`: drop inside this to smash the rack | 26 s | 30 s | 36 s |

**Calibration (seeded tracking bot, 48 seeds per mode, floor 1 only):**

| Mode | Median clear | Runs that beat par |
|---|---:|---:|
| Easy | 25.7 s | 24 / 48 |
| Medium | 28.9 s | 25 / 48 |
| Hard | 51.9 s | 18 / 48 |

Hard used 2 to 4 cranks in most runs. Every run cleared. The par is roughly a coin flip for a sloppy bot, which makes it a target worth chasing.

**Bug fixed alongside:** Gatehouse bells after the teaching bell were scheduled on the run clock (`time`) but checked against the floor clock (`floorTime`). On floors 2 and 3 the second bell therefore came only after a whole floor 1's worth of extra seconds. They now use the floor clock, and a test measures the bell gap.

Screenshots (393x852): `/mnt/project-files/breaker/review-2026-10-23/floor-hooks/`, made with `tools/playtest/floor-hooks.mjs`.
