---
breach_drop: 1
kind: powerups
slug: example
version: 1
date: 2026-10-23
status: proposal
tool: example written by Claude to show the shape
depends_on: []
---
# Example drop: SLOW becomes TIME BUBBLE

## Summary
- SLOW is invisible today; it becomes a visible bubble around the paddle.
- Balls inside the bubble slow to 0.6x, so the player chooses when to use it.

## Decisions for the owner
1. Bubble size: A 90 units wide [RECOMMENDED], B 120 units wide, C whole lower third.

## Spec
| Power | Change | Easy | Medium | Hard |
|---|---|---:|---:|---:|
| SLOW to TIME BUBBLE | ball speed inside bubble | 0.55x | 0.6x | 0.65x |
| | duration (s) | 9 | 8 | 7 |

Last 1.5 s: the bubble glass thins and ticks twice, scale 1 -> 0.92, easeInQuad.

## Data
```json
{
  "kind": "powerups",
  "capsules": [
    { "id": "slow", "new": false, "label": "BUBBLE", "color": "#7FD6FF", "effect": "glass bubble over the paddle slows balls inside it",
      "numbers": { "duration_s": 8, "count": 1, "stack": "refreshes", "cap": 1, "speed_scale": [0.55, 0.6, 0.65] },
      "drop_weight": { "easy": 8, "medium": 7, "hard": 6 },
      "good": true, "counterplay_or_cost": "balls leaving the bubble return to full speed at once", "feel": "soft glass chime, ball trail stretches",
      "change": "rework" }
  ]
}
```

## Art requests
None

## Rules check
- Telegraphed hazards: OK, no new hazard.
- No power required to win: OK.

## Open questions for Claude
1. Does Focus aim stack with the bubble? Recommended: Focus wins while held.
