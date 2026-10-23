# BREACH prompt pack for Copilot

Ready-to-paste prompts. Run them in the **BREACH Design Studio** agent (setup in `03-copilot-studio-agent.md`). If the agent is not ready yet, use plain M365 Copilot chat and attach `01-context-brief.md` and `04-return-format.md` to your first message; the prompts work the same.

**Order:** P1 to P6 first; they matter most right now. P7 onwards when there is time. One prompt per chat keeps answers sharp.

**Each time:** fill the `[BRACKETS]` (or delete the line), paste, read the "Decisions for the owner", reply with your picks, then say `locked` and paste the final drop in the BREACH project chat as `Copilot drop: <file name>`.

---

## P1. Power-up rework (do first)

```
BREACH task P1: power-up rework. Use the BREACH context brief and return format (kind: powerups, slug: powerups-round2).

What I felt in the APK (may be blank):
[E.G. "capsules feel samey", "I never notice SLOW", "hero charge takes too long", "Ram is hard to trigger"]

Do this:
1. Audit every existing capsule (SPLIT, BURST, FIRE, WIDE, AIM, LASER, SHIELD, SLOW, TINY), every hero power (Kit, Lumi, space companions) and the Sweet-Spot Ram. For each one give: what the player feels, whether it creates a decision or a skill moment, and keep / tune / rework / remove.
2. Make power-ups feel like BALL x PIT: stacking, visible builds, satisfying combos. Propose a synergy table (at least 6 pairs: what happens when two are active together).
3. Fix the economy: drop chance per mode, a pity rule so a power appears after N breaks without one, how many capsules may fall at once, durations and caps per mode. Keep "no power-up is required to win".
4. Make each power's moment readable: the catch sound, the screen juice, and how the player knows it is about to end (last 1.5 s).
5. The Ram: should it feel bigger (owner asked for a "giant unstoppable ball from the paddle sweet spot")? Give the exact numbers if you change it.
Give 2 directions for the overall power-up feel in one paragraph each, recommend one, then write the full drop for the recommended one.
```

## P2. Difficulty curve and tuning (do second)

```
BREACH task P2: difficulty rework across all 11 chapters. Use the BREACH context brief and return format (kind: difficulty, slug: difficulty-round2). If a powerups drop is locked, list it in depends_on and use its numbers.

What I felt in the APK (may be blank):
[E.G. "Carrier too easy", "Vault still too hard on Medium", "levels feel the same length", "no urgency in chapter X"]

Do this:
1. For each chapter, write the target run length and the target first-try win rate on Easy, Medium and Hard. Easy is for everyone, Medium is the real game, Hard is for bragging.
2. Draw the curve across chapters 1 to 11 in words: where pressure rises, where a breather chapter sits, which chapter is the first real wall (the continue screen is the safety net there).
3. For each chapter give the values that change per mode as [easy, medium, hard] arrays (HP, tell length, hazard interval, speed, brick count, villain speed). Use the brief's real numbers as the starting point and say which ones you changed and why.
4. Urgency: for each chapter, name the one visible thing that is urgent (a meter, a march, water rising) and how the player can push it back by playing well.
5. Fairness: list every place a loss could feel cheap and the fix (longer tell, safer first showing, a forgiving first life).
6. A test plan Claude's bot can run to check each number (what to measure, the pass range).
Rules: difficulty changes numbers only, never hidden attacks or removed ordinary damage; every hazard keeps a 1.2 to 1.8 s tell.
```

## P3. New power-ups and builds

```
BREACH task P3: new power-ups. Use the BREACH context brief and return format (kind: powerups, slug: powerups-new). depends_on: [powerups-round2] if it exists.

Propose 6 new power-ups (capsules or hero powers) that fit a glossy toy castle-and-space world, for example a giant unstoppable ball from the paddle sweet spot, a magnet catch, a chain spark between bricks, a split that orbits the paddle. For each: id, label (8 letters or fewer), hex colour that does not clash with existing capsules, effect, numbers per mode, stacking, a counter-risk, the feel (sound and juice), and which existing power it combines with.
Rank them by fun-per-build-effort and mark the top 3 to build first.
Art requests: one image prompt for a 3x3 icon sheet of the top 3 plus 6 capsule variants, glossy glazed capsules on transparent background, house style.
```

## P4. Continue and unlock screen

```
BREACH task P4: the loss, continue and unlock flow. Use the BREACH context brief and return format (kind: ui-screen, slug: continue-screen).

Today: after a loss the player gets 2 continues per attempt, each after a 3 s placeholder rewarded ad, or a one-time $2.99 unlock makes continues free. Continue keeps earned progress; Retry starts fresh.
Design:
1. The continue panel for 393x852 and 412x915: what the player sees in the first 0.5 s (what they almost achieved, for example "Korr has 3 HP left"), the ad button, the unlock button, Retry and Menu, a countdown that creates urgency without feeling pushy.
2. The ad placeholder countdown card and the "you are back" moment (serve and a short shield).
3. The unlock offer: when it appears (never on the first loss), the copy, and what the player gets.
4. Exact layout per element (x, y, w, h, font, size, hex, states, animation) and the sound cues.
Art requests: two mock-up prompts in the game style: the panel at rest, and mid-animation.
```

## P5. Critique of APK screenshots

Attach 4 to 10 screenshots first (from your phone, or from the project's `review-2026-10-22` folder).

```
BREACH task P5: critique the attached screenshots of the current APK. Use the BREACH context brief and return format (kind: critique, slug: apk-critique-[DATE]).
Look for: anything that reads as cheap or "vibe-coded", effects that are plain circles or rings, backgrounds brighter than the ball, too much yellow, unreadable HUD at phone size, touch targets under 44 pt, paddle too close to the thumb, text in the notch or home-indicator area, unclear power-up state, missing urgency.
For each issue: where, the problem, severity, the fix in one line and the rule it breaks. Then list what already works and must be kept. Most severe first, at most 15 issues.
```

## P6. Research: what makes power-ups and difficulty addictive (use the Researcher agent)

Run this one in M365 Copilot's **Researcher** agent, not the Design Studio agent.

```
Research for a premium mobile brick breaker called BREACH (portrait, glossy 3D toy style, castle and space chapters, villains that fight back). Question: what power-up systems and difficulty curves make the best brick breakers and brick-breaker roguelites sticky?
Study at least: BALL x PIT, Brick Breaker Hero, Arkanoid (and Arkanoid vs Space Invaders), Bricks Breaker Quest, Holedown, Ballz, and one more you find relevant.
For each game: the power-up system (stacking, rarity, synergy, choice moments), how difficulty rises, how failure is softened (continues, ads, boosts), and one thing BREACH should copy and one it should avoid.
Return a Markdown document that starts with this header and ends with one JSON block (kind research) as described:
---
breach_drop: 1
kind: research
slug: research-powerups-difficulty
version: 1
status: proposal
---
JSON: {"kind":"research","question":"...","findings":[{"game":"","mechanic":"","why_it_works":"","use_in_breach":"","source":"url"}],"recommendations":["most valuable first"]}
Cite sources with links.
```

---

## P7. Level design: Dragon's Hoard

```
BREACH task P7: design the next chapter, Dragon's Hoard. Use the BREACH context brief and return format (kind: level, slug: dragons-hoard).
Idea: a heist. Kit sneaks into a dragon's treasure cave. Greed is the twist: gold bricks give big score and power charge, but taking too much wakes Ember the dragon (a greed meter the player can see). Three floors, 20 to 40 s each, the last one a duel with Ember.
Write: pitch (3 bullets), the twist and its counterplay, a floors table, a hazards table with tells, difficulty per mode, stickiness and urgency, physics notes (what moves, what could trap a ball), a reuse-versus-new-art table, a rules check, open questions. For each floor include the brick grid as row strings with a legend. Keep it under 900 words outside tables and JSON.
```

## P8. Character design: Ember the dragon

```
BREACH task P8: design Ember, the dragon villain of Dragon's Hoard. Use the BREACH context brief and return format (kind: character, slug: ember).
Ember is greedy, vain and a little cowardly when hurt; chibi but properly scary when angry. Must read differently from Gnash, Mooncoil and Korr at 64 units tall.
1. Three directions (silhouette, colours, personality in 3 words), one paragraph each, recommend one.
2. For the recommended one: materials with hex, 8 expressions mapped to game moments (idle, taunt, windup, attack, hurt, stagger, panic, defeat), 6 key poses with the attack tell timing, which parts must rotate separately (wings, jaw, tail), and how the hit shape follows the drawn art.
Art requests: a turnaround prompt and an expression-sheet prompt, each complete with the house style and transparent background.
```

## P9. Shinier bricks

```
BREACH task P9: a shinier brick family. Use the BREACH context brief and return format (kind: asset-sheet, slug: bricks-glaze-v2).
The owner wants bricks shinier, like the Vault look-dev: thick glazed ceramic, a crisp highlight band, slightly rounded bevels, a little sparkle, while staying readable at 32x16 game units.
Specify the five colours (sun, coral, violet, teal, blue) plus gold gem and granite, each with 3 states (intact, cracked, breaking), and a 2-HP version with a visible inner layer. Say exactly how the highlight, crack and fade read at phone size.
Art requests: one sheet prompt (4 columns by 6 rows, transparent background, 10% margin per cell, nothing touching a cell edge).
```

## P10. Unlockables: prince skins and swords

```
BREACH task P10: unlockables for Kit. Use the BREACH context brief and return format (kind: character, slug: kit-unlockables).
Design 4 paddle skins and 4 swords for Kit that the player unlocks by playing (stars, chapter clears, Hard wins), never by paying only. For each: name, look (materials with hex), how it changes the paddle art, the unlock condition, and whether it is cosmetic only (preferred) or a small perk. Keep perks tiny and fair.
Art requests: one 4x2 sheet prompt for the skins and swords on transparent background.
```

---

## Images in M365 Copilot

For any "Art requests" prompt, or any prompt from the `prompt-library/` folder: open M365 Copilot chat, attach the reference images listed in `prompt-library/examples/INDEX.md`, paste the prompt, and ask for 3 variants. Fix small things with:

```
Keep everything about this image the same except: [ONE CHANGE]. Same style, same lighting, same background, same size.
```

Save the PNGs as `breach-<slug>-<what>-<n>.png` and send them in the project chat.

## Steering prompts (when an answer drifts)

**It ignored the format**
```
Rewrite your answer as a BREACH drop exactly as the return format says: the header, the sections in order, and exactly one valid JSON block for kind [KIND]. Do not change the design.
```

**Too generic**
```
This reads generic. Give each idea one thing no other brick breaker has, tied to BREACH's characters or chapters. Cut anything that could be in any game.
```

**It broke a rule**
```
Run the rules check from the context brief again, line by line. Fix every VIOLATED item, then give me the corrected drop with version bumped.
```

**Revise after my picks**
```
My picks: [1: B, 2: A, ...]. Update the drop with those choices, bump version, set status to locked, and keep everything else unchanged.
```

**Too long**
```
Cut this to the essentials: keep every number, table and the JSON; shorten prose to one line per point.
```
