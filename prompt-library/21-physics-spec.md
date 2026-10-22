# 21 - Physics spec prompt (new mechanics)

Purpose: make a text model produce a **physics spec** for a new mechanic (a rolling bell, a swinging chain, a rising water level, a lunging serpent, a Ram Ball) that the builders can implement and test without guessing. It fixes the things that went wrong before: collision shapes that do not match the art, fast things tunnelling through thin ones, hazards that were not warned, and rules that depend on luck.

It is a text-only prompt. Paste the **facts block** first, then the **request**. Attach (or paste the relevant parts of) `docs/BELLFORGE_PHYSICS.md`, `docs/TIDEWHEEL_PHYSICS.md` and the level design from `20-game-design.md`.

## The rule above all others

> **Collision shapes must match the drawn art.** What the player sees is what the ball hits.

In practice (taken from the existing physics docs and reviews):

- Collision is built **from the actual rendered asset** (its alpha), not from the concept picture and not from the sprite's rectangle. "Retain the original boards and measure collision against the actual moving assets." (`design/phase1/princess-two-levels.md`)
- Use **conservative shapes inscribed in the visible alpha**. Korr's four poses use 49, 48, 51 and 49 circles measured at 3 px per unit from the retained raster, including head, torso and snout and separate hooves, **leaving leg gaps empty**. (`docs/BELLFORGE_PHYSICS.md`)
- **Transparent padding is never collision**, and **an open notch stays open**. "Terrain uses a forgiving actual hull outline, not transparent padding; notches stay empty." (`docs/STARFLIGHT_CAMPAIGN.md`)
- **A decorative arch is not a route.** A suggested ball corridor must be physically open. (`design/phase1/00-quality-target.md`)
- **Disabled or destroyed metal is physical only where it is still visible**; opened parts use their moved shapes. A dead sprite does not keep its old collider. After a break, no silent collider remains.
- **Every ball route admits the full ball diameter with clearance**, not just its centre. Ball radius 6 means a 12-unit ball; keep flank paths at least 42 units and gaps at least 32 units at every extreme pose of moving parts.
- **A moving part moves its collider with it** (ramp hinge, raft, claw), with the same pose and pivot the renderer uses. Render and collision share pose metadata. Rotation is about the real hinge, not the sprite centre.
- **Hit feedback must correspond to a real contact.** No glow, spark or damage number without the contact that earned it.

## Facts block (paste first)

```text
You are the physics designer for BREACH, a premium portrait brick breaker (plain JavaScript on Canvas 2D). You write specs, not code. The builders implement exactly what you write and will test every number.

World and constants: world 360 units wide; ordinary ball radius 6, nominal speed 345 units/s, paddle rallies cap at 1.28x speed, the vertical component cannot settle below 22 percent of total speed; paddle 100 x 14; the titan (cosmic) ball is larger (about radius 10 in the space levels; confirm per level); bricks 16 x 16 cells (Vault) or 36 x 18 (princess levels). Lowest solid object at least 210 units above the paddle on the short layout (393 x 852 phone). Physics model has no renderer or DOM dependency. Positions and colliders are model coordinates, independent of canvas scale. The update rejects nonfinite or nonpositive delta, bounds one call to 0.1 s, and divides it into steps of at most 1/240 s. True pause freezes every field, warning, credit, effect and physical body. Models are deterministic for a given seed and fixed inputs.

Rules you must respect:
1. Collision shapes must match the drawn art (measured from the real rendered alpha; conservative, inscribed; no padding; open notches stay open; moved parts move their colliders; broken parts leave no collider).
2. Ordinary ball play always makes progress. No tiny weak points, no forced precision, no waiting for invulnerability.
3. Every hazard is warned (a readable tell of at least 1.3 s, aim locked to the real moving port or origin) and shown once safely before it can hurt. No overlapping same-lane warnings. A safe interval must exist for the full ball and paddle footprint across the whole volley, or stagger or cancel the attack.
4. Fast things use swept (continuous) tests against moving geometry, never a single end-of-step overlap test. Reflect, then continue with only the remaining portion of the movement.
5. Pause, background, Continue and Retry have explicit clock rules. Continue keeps earned progress, clears live hazards and grants at least 3 s warning grace.
6. One contact earns one episode of damage; overlapping colliders of the same target cannot double-damage.
7. Enemy attacks never destroy the player's bricks to hand out free resources.
8. Single bricks vanish quietly; only big structural crashes drop debris, and routine debris is harmless unless the spec declares a separate authored hazard.
9. Ball and key objects stay in the foreground and are never hidden by effects.
```

## Request template

```text
Write the physics spec for [MECHANIC NAME] in [LEVEL].

What it is (one paragraph, in terms of what the player sees): [DESCRIPTION].
Art it uses (file names and drawn sizes): [LIST OF ASSETS WITH PX AND UNITS, AND THEIR PIVOTS/HINGES].
What it does to the ball, the paddle and the bricks: [EFFECTS].
Its warning (the tell) and how it is shown safely first: [TELL].
Intended difficulty: [EASY / MEDIUM / HARD VALUES, IF KNOWN].

Output these sections, in this order, with numbers in game units and seconds:
1. Summary: three lines. What moves, what collides, what the player must understand.
2. Art-to-collider table: one row per drawn piece. Columns: piece | art file and px size | drawn size in units | pivot or hinge (units) | collider (circle, capsule, segment, rectangle or compound circles) with exact local dimensions | how the collider was derived from the alpha (inscribed, conservative) | what it must leave open (gaps, notches) | states (intact, damaged, broken, moved).
3. Constants: mass or speed values, gravity, restitution, friction, angular speed, caps, with a one-line reason each. Use the facts-block constants for the ball.
4. Integration: step size, substeps per frame, order of operations per step (move bodies, sweep ball, resolve, reflect remainder, apply damage, update state), and the exact rule for a ball that hits two colliders in one step.
5. Tunnelling analysis: for the fastest body, the thinnest collider and the worst relative speed (include moving collider speed plus ball speed), compute travel per step and compare it with half the smallest radius or half the thinnest thickness. State the swept test used, and the worst-case direction. If the margin is below 2x, require continuous collision detection and say how.
6. Warned hazards: for each hazard: tell pose and duration (Easy/Medium/Hard), what locks at the tell (aim, lane, origin), the safe teaching moment, the legal route width and minimum gaps at every extreme pose, the safe interval proof, and what cancels it.
7. Fairness invariants: a numbered list of statements that must always be true (for example "A ball can always reach the paddle", "the lowest solid is at least 210 units above the paddle", "no collider remains after its break").
8. State machine and clocks: states, transitions, timers, what freezes on pause, what happens on Continue and Retry, serve and auto-launch rules, damage episodes, and anything that must resolve only once.
9. Feedback map: for each contact, the sound, shake, particle and text trigger (so feedback follows real contacts).
10. Test cases: a table with columns | ID | setup | input | expected | pass criterion |. At least 12 cases, including: fastest ball into thinnest collider, ball into a collider's seam, ball at the extreme pose of every moving part, two colliders at once, pause mid-contact, Continue during a warning, and a long idle stall frame (a 3-second delta).
11. Failure modes: what could go wrong, how you would detect it, what to measure in a playtest (frame time, stuck-ball detection, impossible-route detection).
12. Open questions.

Do not write code. State every assumption. If a requirement conflicts with a rule in the facts block, say so and change the design, not the rule. Never leave "TBD" in a table cell.
```

## Worked example: a rolling iron bell on hinged ramps

```text
Write the physics spec for IRON BELL ROLL in Gatehouse Siege, floor 2 (murder holes).

What it is: Korr, after a 1.5 s snort, drops an iron bell through a murder hole. The bell rolls down two short hinged wooden-and-iron ramps toward the paddle lane. An ordinary ball hit slows or reverses it; a second hit shatters it. A returning bell that reaches Korr's shoulder deals 4 HP and staggers him for 1.5 s. A bell that reaches the bottom stuns the paddle for 0.8 s instead of costing a life.
Art it uses: assets/fantasy-machinery/bell.png (256 x 256 px, drawn about 28 to 30 units across, radius 14, with a hanging ring on top), assets/fantasy-machinery/ramp.png (512 x 128 px, drawn about 70 to 78 units long, pivot pin at the left end), korr-idle/windup/release/stagger (atlas 512 x 448 px each, pivot at the supporting foot; canvas about 170.667 x 149.333 units).
What it does to the ball, the paddle and the bricks: the bell has radius 14 and is the only moving dynamic body; the ball reflects off it with momentum transfer capped; the paddle is stunned 0.8 s on contact; no bricks are destroyed.
Its warning and how it is shown safely first: a 1.5 s snort and hoof lift previews the chosen ramp; the first bell is a teaching bell that falls into an empty catch tray without touching the paddle lane; first harmful release at 12 s or later.
Intended difficulty: Easy 1 bell every 10 s, Medium 1 every 8.5 s, Hard 2 staggered by at least 3 s every 7.5 s.
[then the 12-section output structure above]
```

Expected highlights in a good answer (use this to check the model's work):

- A ramp collider as a rotating capsule or segment with thickness 8 about the real hinge, with conservative advancement against it; not a rectangle covering the sprite.
- Bell collider radius 14, matching its drawn silhouette, not its sprite square; Korr's body as compound circles measured from the actual pose images, with the legs' gaps empty.
- Travel per step at 1/240 s: ball about 1.4 units (345 / 240); the bell and the ramp tip are computed from the speeds the model assumes. Each should stay under half the ball radius (3 units) per step; where it does not, continuous tests are required, and even where it does they remain the second line of defence.
- A statement that ball reflection off the rotating ramp uses its actual surface velocity.
- Test cases that include a ball squeezed between the bell and a ramp, a bell overlapping the dock while a hit reverses it, pause on the frame of contact, and a stall frame.

## Review prompt (use after the spec is written)

```text
Review this physics spec as a skeptical tester. For each of the 9 rules in the facts block, write PASS or FAIL with one line of evidence from the spec. Then list the five most likely bugs the builders will hit (tunnelling, double damage, a stuck ball, an unwinnable route, a collider that does not match the art), each with the test case from the table that would catch it, or write "no test case" and add one.
```

## Output spec

| Output | Spec |
|---|---|
| Spec | Markdown with the 12 headings, numbers in units and seconds, the art-to-collider table complete, 12 or more test cases, no "TBD" in tables |
| Save as | `docs/<MECHANIC>_PHYSICS.md` (pattern: `docs/BELLFORGE_PHYSICS.md`, `docs/TIDEWHEEL_PHYSICS.md`) |
| Starflight variant | Use step size 1/120 s, a forgiving 7-unit player core, hull outlines instead of padding, and the rule "warnings lock aim at the real moving ports"; see `30-starflight.md` |
