# BREACH return format (every Copilot answer follows this)

Claude reads Copilot's work cheaply only if every answer has the same shape. One task = one **drop**. A drop is a single Markdown document with a header, fixed sections and exactly one JSON block. A small finished example is in `examples/breach-powerups-example-v1.md`.

## 1. The drop

```
---
breach_drop: 1
kind: powerups            # powerups | difficulty | level | character | ui-screen | asset-sheet | critique | research
slug: powerups-round2     # lowercase-with-dashes, unique per topic
version: 1                # bump when you revise the same slug
date: 2026-10-23
status: proposal          # proposal | locked (locked only when the owner said "locked")
tool: Copilot Studio, <model name>
depends_on: []            # slugs of earlier drops this builds on
---
# <Title>

## Summary
At most 5 bullets: what changes and why it is more fun.

## Decisions for the owner
Numbered. Each: the question, 2 or 3 options in one line each, and [RECOMMENDED] on one. Write "None" if there are none.

## Spec
The human-readable design: tables, numbers in game units and seconds, hex colours, animations as "property from -> to, duration, easing".

## Data
Exactly one fenced ```json block that matches the schema for this kind (section 3). Valid JSON: no comments, no trailing commas.

## Art requests
Image prompts to run next, each one complete and self-contained (house style included). Write "None" if there are none.

## Rules check
Each rule in section 5 of the context brief: OK or VIOLATED, with one line. Fix violations before answering.

## Open questions for Claude
At most 5, each with your recommended answer.
```

## 2. File name and how to send it

- File name: `breach-<kind>-<slug>-v<version>.md`, for example `breach-powerups-powerups-round2-v1.md`.
- Images: `breach-<slug>-<what>-<n>.png`, for example `breach-ember-turnaround-1.png`. PNG only, biggest size offered, transparent or flat magenta #FF00FF for sprites.
- Send: paste the drop (or attach the .md and PNGs) in the BREACH project chat, first line `Copilot drop: <file name>`. Claude takes it from there.

## 3. JSON schemas per kind

Use the existing ids where a thing already exists. Mark new things with `"new": true`. Units: game units (world is 360 wide), seconds, hex colours.

### powerups

```json
{
  "kind": "powerups",
  "capsules": [
    { "id": "split", "new": false, "label": "x3", "color": "#5CCF6A", "effect": "one line",
      "numbers": { "duration_s": 0, "count": 3, "stack": "adds | refreshes | none", "cap": 12 },
      "drop_weight": { "easy": 10, "medium": 8, "hard": 6 },
      "good": true, "counterplay_or_cost": "one line", "feel": "sound + juice in one line",
      "change": "keep | tune | rework | remove | add" }
  ],
  "hero_powers": [
    { "hero": "kit | lumi | space", "id": "titan", "new": false, "label": "COSMIC", "effect": "one line",
      "numbers": { "duration_s": 7, "damage": 4 }, "change": "keep | tune | rework | remove | add" }
  ],
  "charge": { "hits_to_fill": { "easy": 24, "medium": 30, "hard": 36 }, "what_counts": "one line" },
  "ram": { "streak_to_arm": 3, "radius": 13.2, "time_s": 2.5, "bricks": 14, "damage": 3, "change": "keep | tune | rework" },
  "drop_rules": { "base_chance": { "easy": 0.14, "medium": 0.11, "hard": 0.08 }, "pity_after_breaks": 10, "max_falling": 2 },
  "synergies": [ { "a": "fire", "b": "split", "result": "one line" } ]
}
```

### difficulty

```json
{
  "kind": "difficulty",
  "shared": { "easy": { "companionHits": 24, "maxBalls": 12, "maxCosmic": 2, "maxTimer_s": 20 },
              "medium": { "companionHits": 30, "maxBalls": 9, "maxCosmic": 2, "maxTimer_s": 18 },
              "hard": { "companionHits": 36, "maxBalls": 5, "maxCosmic": 1, "maxTimer_s": 14 } },
  "chapters": [
    { "chapter": 7, "name": "Bellforge Run", "target_minutes": { "easy": 2.5, "medium": 3.5, "hard": 4.5 },
      "target_first_try_win_rate": { "easy": 0.85, "medium": 0.55, "hard": 0.25 },
      "values": { "villainHP": [24, 32, 40], "tell_s": [1.8, 1.6, 1.4], "hazardInterval_s": [10, 8.5, 7.5] },
      "pressure": "what is urgent here in one line", "change": "keep | tune | rework" }
  ],
  "curve": "one paragraph: how pressure rises across chapters 1 to 11 and where the breathers are",
  "continue": { "ad_continues": 2, "what_continue_restores": "one line", "fail_screen_copy": "one line" },
  "test_plan": [ "what Claude's bot should measure to prove each number" ]
}
```

Per-chapter `values` are `[easy, medium, hard]` arrays. Use the value names the brief gives; invent clear new names only when needed.

### level

```json
{
  "kind": "level", "name": "Dragon's Hoard", "hero": "kit", "chapter_slot": 12,
  "floors": [ { "floor": 1, "goal": "one line", "hazard": "one line", "tell_s": 1.6, "bricks": 30, "seconds": [25, 40] } ],
  "hazards": [ { "id": "coin-avalanche", "tell": "what it looks like", "tell_s": 1.6, "counterplay": "one line", "cost": "one line" } ],
  "difficulty": { "villainHP": [24, 32, 40], "tell_s": [1.8, 1.6, 1.4], "hazardInterval_s": [10, 8.5, 7.5] },
  "grid": { "cols": 11, "rows": 9, "cell": [28, 18], "origin": [20, 96], "map": ["row strings, one char per cell, legend below"], "legend": { ".": "empty", "c": "coral 1HP" } },
  "reuse": [ "existing art or system" ], "new_art": [ { "need": "one line", "prompt_file": "10 | 20 | 30" } ]
}
```

### character

```json
{
  "kind": "character", "name": "Ember", "role": "villain | hero | companion | minion", "height_units": 64,
  "silhouette": "one line", "personality": ["three", "words", "only"],
  "materials": [ { "part": "body", "hex": "#B8402F", "finish": "glossy vinyl" } ],
  "expressions": [ { "id": "smug", "game_moment": "taunt", "eyes": "one line", "brows": "one line", "mouth": "one line" } ],
  "poses": [ { "id": "windup", "game_moment": "attack tell", "seconds": 1.6 } ],
  "collision": "how the hit shape follows the drawn art in one line",
  "sheets_needed": [ "turnaround", "expressions", "keyposes", "parts" ]
}
```

### ui-screen

```json
{
  "kind": "ui-screen", "screen": "continue",
  "phones": ["393x852", "412x915"],
  "elements": [ { "id": "ad-button", "x": 60, "y": 520, "w": 240, "h": 56, "font": "Lilita One", "size": 22,
                  "color": "#7BD88F", "text": "WATCH AD - CONTINUE", "states": ["idle", "pressed", "disabled"],
                  "anim": "scale 0.9 -> 1, 0.25 s, easeOutBack, delay 0.1 s" } ],
  "sounds": [ { "when": "panel opens", "sound": "one line" } ]
}
```

Coordinates are game units on the 360-wide grid, origin top-left, inside the safe area.

### asset-sheet

```json
{
  "kind": "asset-sheet", "family": "hoard-bricks",
  "cells": [ { "id": "gold-pile-1hp", "w": 32, "h": 16, "states": ["intact", "cracked", "breaking"], "colors": ["#F4C542"] } ],
  "grid": { "columns": 4, "rows": 3, "cell_px": 512, "background": "transparent" },
  "prompt": "the full image prompt"
}
```

### critique

```json
{
  "kind": "critique", "screens": ["file names"],
  "issues": [ { "screen": "file name", "where": "top-left HUD", "problem": "one line", "severity": "high | medium | low",
                "fix": "one line", "rule": "which brief rule, or none" } ],
  "keep": [ "what already works" ]
}
```

### research

```json
{
  "kind": "research", "question": "one line",
  "findings": [ { "game": "BALL x PIT", "mechanic": "one line", "why_it_works": "one line", "use_in_breach": "one line", "source": "url" } ],
  "recommendations": [ "one line each, most valuable first" ]
}
```

## 4. Before you hand it back

- One drop per task, one JSON block per drop, valid JSON.
- Numbers for everything: no "faster", say "345 -> 380 units/s".
- Existing ids reused; new things marked `"new": true`.
- Rules check filled in.
- Under about 1,200 words outside tables and JSON.
