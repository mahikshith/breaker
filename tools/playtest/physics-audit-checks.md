# Physics audit checks (single level, no browser)

`physics-audit-checks.mjs` is a small seeded, deterministic Node script (Gatehouse today). It is separate from
`physics-audit.mjs`, which is the all-levels sweep that writes `docs/validation/physics-audit/report.json`.

## What it checks
1. **tunnelling**: seeded free-air launches per floor, ball radius (6, ram 13.2) and speed (345-700); counts any step where the ball is >1.5u inside a brick, solid, housing, wheel, ramp or Korr. Expect 0.
2. **stuck-hazard**: kicked bells on each bell floor; alive >8 s or still >3 s (moves <2u) is stuck. Expect 0.
3. **ward-vs-bell**: Ward active, bell dropped on the paddle x; the paddle must not stun. Expect 0 stuns.
4. **clearable**: autoplay bot, easy and hard, must win all floors within 400 s sim time and never go 30 s without score or floor progress.

## Run
`node tools/playtest/physics-audit-checks.mjs` (about 25 s) or `--quick` (about 6 s). Prints JSON, then one PASS/FAIL line per check; exit 1 if any fail.

## Known failures (expected, game not fixed)
- stuck-hazard FAIL: floor 1 bell parks at about (346,227) at the foot of the right ramp, still for >3 s.
- ward-vs-bell FAIL: the ward line is `paddle.y + 24`, below the paddle, so the bell reaches the paddle first and stuns it.

## Add a level
1. Change `LEVEL` at the top (module path, class, `floors`, `bellFloors`).
2. If the new game API differs (bells, ward, targets), edit or replace the check functions; each is `() => ({ pass, ...details })`.
3. Register new ones in the `CHECKS` map near the bottom. Keep seeds fixed so runs stay reproducible.
