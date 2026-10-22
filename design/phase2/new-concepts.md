# New concepts for stickiness (proposal, 2026-10-22)

Status: ideas for the owner to pick from. Nothing here is built. Each one reuses finished art and adds at most one reusable part.

Owner rules that still apply: ordinary ball play always makes progress; every hazard is warned and shown safely first; no tiny weak points; Pause, Continue and Retry keep earned progress.

## 1. Serpent Rivals (the owner's two-snake idea, as a level)

Gnash (emerald) and Mooncoil (violet) live in two tunnels on opposite walls. Each hunts Lumi along its own lane. Where the lanes cross there is a shared chamber. If both heads enter it within 1 s, they snap at each other: both recoil, both are dizzy for 2 s, and a power-up drops.

- **The twist:** the player baits them. Breaking a lane's lure bricks pulls that snake forward, so a clever player times a collision instead of only fleeing.
- **Why it hooks:** a skill moment the player causes and can repeat, with a visible payoff (the snake fight) every time.
- **Reuse:** both snake skins, all 13 head expressions, the window kit for the tunnel mouths. New work: lane paths and the clash animation, in code only.

## 2. Heat streak (a shared mechanic for every level, inspired by BALL x PIT)

Each brick broken without the ball touching the paddle adds heat: x2, then x3, then **Molten**. A Molten ball pierces one brick row and leaves a short ember trail. Touching the paddle cools it one step instead of resetting it.

- **Why it hooks:** a run-within-the-run. Players chase long rebounds and you see the streak grow on the ball itself.
- **Reuse:** one ball-tint ramp and the existing trail and debris code. It is one module, like the floors module.

## 3. Duet swap (Kit and Lumi in one level)

When Lumi is free, both face orbs sit on the paddle. Tapping the inactive orb swaps hero in 0.3 s. Kit's paddle is wide and steel with knight powers. Lumi's is shorter and curved, so it can angle shots, and she has song powers. When both meters are full, a **Duet** fires: Kit's arrows ride Lumi's song wave across the whole row.

- **Why it hooks:** a real choice every few seconds, and a rare spectacular combo to chase.
- **Reuse:** both face-orb sets, both power-icon sets (now rendered), and the paddle skins.

## 4. Living mortar (urgency without unfair damage)

In some chambers the mortar is alive: every 4 s one missing brick regrows, with a glow tell 1 s before. Breaking the chamber's keystone, an ordinary-size brick with a clear rune, kills the mortar for good.

- **Why it hooks:** it creates pressure to finish a section rather than chip at it, and it gives one clear, fair priority target.
- **Reuse:** brick families as they are. New work: one keystone variant per brick family, rendered by the existing brick scripts.

## 5. Daily Breach (retention)

Each day has a fixed seed: three floors pulled from finished levels, each with a twist such as a mirrored layout, faster snakes or double Heat. There is one attempt for stars, plus unlimited practice runs.

- **Why it hooks:** a reason to open the game every day with almost no new content cost.
- **Reuse:** every finished level and the floors module.

## Suggested order

Heat streak (2) first, because it makes every existing level stickier. Then Serpent Rivals (1), because the owner already asked for two snakes. Duet (3) fits naturally once Lumi Breaks Out exists.
