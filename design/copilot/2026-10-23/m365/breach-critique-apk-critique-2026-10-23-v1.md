---
breach_drop: 1
kind: critique
slug: apk-critique-2026-10-23
version: 1
date: 2026-10-23
status: proposal
tool: Copilot Studio
depends_on: ["powerups-round2", "difficulty-round2"]
---

# APK critique, 5 screenshots (393x852)

Screens reviewed: `393x852-bellforge-1play.png`, `393x852-bellforge-6continue.png`, `393x852-menu.png`, `393x852-tidewheel-2power.png`, `393x852-24-floor3-korr-duel.png`. The screenshots are 723 px wide, about 2.0 px per game unit.

## Summary
- The characters (Korr, Nerra, Lumi, the Kit orb) are the strongest thing in the build. The backgrounds and UI chrome around them are what make it feel cheap.
- Castle backgrounds are too bright and too warm: torches, candles, glowing windows and a mirror floor all compete with a small grey ball.
- Plain circles and rings appear in 3 places (Korr's platform, the continue countdown, the face orb rim), which breaks a hard rule.
- The HUD sits in the status-bar area and the lives are hard to read. Power state and urgency are not visible at all.
- The menu needs the theme-first redesign the owner asked for; the order and numbering are confusing.

## Decisions for the owner
1. Castle backgrounds: A repaint them darker and calmer in the house style (one reusable hall, 3 lighting variants) [RECOMMENDED]; B keep the current paintings and darken them 60% in code.
2. Menu: A two-step flow (theme split → chapter list → difficulty on the chapter card) [RECOMMENDED]; B keep one list but add theme tabs.

## Spec

### Issues (most severe first)

| # | Screen | Where | Problem | Severity | Fix | Rule |
|---|---|---|---|---|---|---|
| 1 | bellforge-1play, korr-duel | Whole background | Torches, candles, lit gothic windows, orange haze and a glossy mirror floor are brighter and busier than the ball; the ball is lost near the floor's medallion | high | Repaint the hall in navy #22284A→#0A0C18 with no flames and a matte floor; drop background brightness about 55% under the playfield | Backgrounds calm, dark, never brighter than the ball |
| 2 | korr-duel | Under Korr | Korr stands on a flat ellipse with two plain black circles outlined in gold | high | Replace with a rendered gunmetal-and-brass siege platform with bolts and chains | Effects are rendered things, never plain circles or rings |
| 3 | all play screens | Top HUD (pause, lives, score at y about 16 units) | The HUD sits in the status-bar and Dynamic Island band on a 393x852 phone | high | Move the HUD below the safe-area inset (top 59 pt on iPhone, plus 8) | Nothing in the notch or status-bar area |
| 4 | bellforge-1play, korr-duel | Whole screen | No visible urgency: nothing advances, Lumi smiles calmly in her cage, and no tell is shown | high | Add the March from difficulty-round2 and Lumi's fear stages (calm → pacing → scared → panic) | Feel: urgent |
| 5 | bellforge-1play, tidewheel-2power, korr-duel | Play area and face orb | No power state anywhere: no build tray, no capsule falling, and no visible hero charge on the orb | high | Add the build tray (right of the control deck) and a charge fill on the orb, per powerups-round2 | Unclear power-up state |
| 6 | menu | Whole screen | Congested: difficulty is chosen before the chapter, space and castle are mixed, the numbering jumps (1, 2, 3, V, F, 6, 7, 8) and chapters 9 to 11 are below the fold | high | Theme split screen first (Starfighter vs Princess, dark lightning divider), then the chapter list, with difficulty chosen on the chapter card and changeable from pause | Feel: premium, instinctive |
| 7 | bellforge-1play, menu title, continue | Brass rig, bell, gears, cage, paddle core, BREACH logo, CONTINUE? | Yellow and gold dominate: almost every prop is brass and both titles are yellow-orange | medium | Turn the props to dark blued gunmetal with brass trims only; title gradient coral #FF6F61 → violet #8F5CF0; CONTINUE? in white with a coral outline | Very little yellow; gold is an accent only |
| 8 | bellforge-6continue | Countdown | The timer is a plain pink ring around a number | medium | Use a rendered hourglass, or a ceramic dial with 8 segment chips that crack off | No plain circles or rings |
| 9 | all play screens | Face orb, lower-left | The orb has a flat pink outline ring | medium | Use a chrome bezel with a bevel; the charge fills as glazed segments | No plain circles or rings |
| 10 | tidewheel-2power | Kit's Armoury panel | Flat line icons (anchor, arrows) look like clip-art. The names (ANCHOR, ARROWS, STARFIRE) don't match the brief (BRICK WARD, ARROWS, COSMIC, BALL FAN), and only 3 of 4 powers are shown | medium | Use glossy 3D icons in the house style; align the names with powerups-round2; show all 4 options with their effect in one line | Rejected: flat clip-art |
| 11 | bellforge-6continue | Panel text | "No balls remaining" says nothing about how close you were | medium | Use "So close! Korr has 3 HP left" with Korr's portrait and his HP bar | Continue screen urgency |
| 12 | bellforge-6continue | "No thanks" | A text-only link, about 13 px high, probably under 44 pt | medium | Make it a 44 pt pill button in a low-emphasis style | Touch targets at least 44 pt |
| 13 | bellforge-1play | Brick field | Only 24 small flat bricks in 4 thin columns; they look like plain coloured rectangles, not glazed ceramic | medium | Use more bricks per difficulty-round2 [52, 62, 72] and the glaze-v2 brick family (P9) | Glazed-ceramic bricks |
| 14 | korr-duel | Top two brick rows | Grey riveted metal bricks look like indestructible blocks, so the player can't tell what breaks | medium | Make breakable armour bricks plum #8D97B3 with a coloured inner layer; granite keeps a distinct stone shape | Breakable and indestructible differ by shape and material |
| 15 | bellforge-1play | Three brass boxes on the levers | The camera-like boxes are unreadable: are they targets, cannons or decoration? | low | Give each one a clear role (a hittable lever brick with a glazed face) or remove it | Readable at a glance |

### What already works (keep)
- Korr and Nerra: glossy, characterful, strong silhouettes and expressive faces; this is the target quality.
- The Kit face orb's scared expression on the continue screen is exactly the right emotional beat.
- The Lumi cage on chains (upper right) is a clear story anchor.
- The continue panel structure: one big ad button, a secondary unlock button, a quiet exit, and the dimmed game behind it.
- "FLOOR 3 / 3" pill and the boss HP bar at the top centre are clear and calm.
- Korr-duel bricks: even sizes, tidy grid, good gaps and lanes.
- Chrome ball and paddle, and the three aim dots under the paddle; the centre box on the paddle reads as the Ram sweet spot.
- Nerra's flooded hall is the right darkness level for the castle chapters.

## Data
```json
{
  "kind": "critique",
  "screens": ["393x852-bellforge-1play.png", "393x852-bellforge-6continue.png", "393x852-menu.png", "393x852-tidewheel-2power.png", "393x852-24-floor3-korr-duel.png"],
  "issues": [
    {"screen": "393x852-bellforge-1play.png", "where": "whole background", "problem": "torches, lit windows and a mirror floor are brighter and busier than the ball", "severity": "high", "fix": "repaint the hall in navy with no flames and a matte floor; drop brightness about 55%", "rule": "backgrounds calm, dark, never brighter than the ball"},
    {"screen": "393x852-24-floor3-korr-duel.png", "where": "under Korr", "problem": "flat ellipse and two plain gold-outlined circles", "severity": "high", "fix": "rendered gunmetal-and-brass siege platform", "rule": "effects are rendered things, never plain circles or rings"},
    {"screen": "393x852-bellforge-1play.png", "where": "top HUD", "problem": "pause, lives and score sit in the status-bar band", "severity": "high", "fix": "move the HUD below the safe-area inset plus 8", "rule": "nothing in the notch or status-bar area"},
    {"screen": "393x852-bellforge-1play.png", "where": "whole screen", "problem": "no visible urgency; Lumi is calm", "severity": "high", "fix": "add the March and Lumi's fear stages from difficulty-round2", "rule": "feel: urgent"},
    {"screen": "393x852-tidewheel-2power.png", "where": "play area and face orb", "problem": "no build tray, no capsules, no visible hero charge", "severity": "high", "fix": "add the build tray and an orb charge fill from powerups-round2", "rule": "unclear power-up state"},
    {"screen": "393x852-menu.png", "where": "whole screen", "problem": "congested; difficulty before chapter; mixed themes; numbering 1,2,3,V,F,6,7,8", "severity": "high", "fix": "theme split, then chapter list, difficulty on the chapter card and in pause", "rule": "feel: premium, instinctive"},
    {"screen": "393x852-bellforge-1play.png", "where": "brass props, paddle core, titles", "problem": "yellow and gold dominate the screen", "severity": "medium", "fix": "gunmetal props with brass trim; coral to violet title; white CONTINUE?", "rule": "very little yellow, gold accent only"},
    {"screen": "393x852-bellforge-6continue.png", "where": "countdown", "problem": "plain pink ring timer", "severity": "medium", "fix": "rendered hourglass or a ceramic dial losing 8 segment chips", "rule": "no plain circles or rings"},
    {"screen": "393x852-bellforge-1play.png", "where": "face orb lower-left", "problem": "flat pink outline ring", "severity": "medium", "fix": "chrome bevelled bezel with glazed charge segments", "rule": "no plain circles or rings"},
    {"screen": "393x852-tidewheel-2power.png", "where": "Kit's Armoury panel", "problem": "flat line icons; names don't match the brief; 3 of 4 powers shown", "severity": "medium", "fix": "glossy 3D icons, names from powerups-round2, all 4 options with a one-line effect", "rule": "rejected: flat clip-art"},
    {"screen": "393x852-bellforge-6continue.png", "where": "panel subtitle", "problem": "'No balls remaining' shows no near-win", "severity": "medium", "fix": "'So close! Korr has 3 HP left' with portrait and HP bar", "rule": "continue screen urgency"},
    {"screen": "393x852-bellforge-6continue.png", "where": "'No thanks' link", "problem": "text-only, likely under 44 pt", "severity": "medium", "fix": "44 pt low-emphasis pill button", "rule": "touch targets at least 44 pt"},
    {"screen": "393x852-bellforge-1play.png", "where": "brick field", "problem": "24 small flat bricks in thin columns, not glazed ceramic", "severity": "medium", "fix": "brick counts from difficulty-round2 and the glaze-v2 family", "rule": "glazed-ceramic bricks"},
    {"screen": "393x852-24-floor3-korr-duel.png", "where": "top two brick rows", "problem": "grey riveted bricks read as indestructible", "severity": "medium", "fix": "armour bricks #8D97B3 with a coloured inner layer; granite keeps a stone shape", "rule": "breakable vs indestructible differ by shape and material"},
    {"screen": "393x852-bellforge-1play.png", "where": "brass boxes on the levers", "problem": "unclear whether they are targets, cannons or decoration", "severity": "low", "fix": "make them hittable lever bricks with a glazed face, or remove them", "rule": "readable at a glance"}
  ],
  "keep": [
    "Korr and Nerra character quality and expressions",
    "Kit face orb scared expression on the continue screen",
    "Lumi cage on chains as the story anchor",
    "continue panel structure: big ad button, secondary unlock, quiet exit, dimmed game",
    "FLOOR 3 / 3 pill and the top-centre boss HP bar",
    "Korr-duel brick grid sizes and lanes",
    "chrome ball, paddle, three aim dots and the sweet-spot box",
    "Tidewheel flooded hall darkness level"
  ]
}
```

## Art requests
1. **Calm castle hall.** HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles; one soft warm key light from the top-left (#FFDBB8), cool blue fill from the right (#8CA6FF), faint pink bounce from below (#FF80A6). Asset type: portrait phone background, 9:19.5, for a brick breaker castle chapter. A dark gothic hall in navy and slate (#22284A to #141831 to #0A0C18) with soft vignette and light film grain, deep arches, two muted plum banners, a matte dark stone floor with no reflections. The whole image is calm, desaturated and several stops darker than the foreground; the lower third is nearly empty and dark. NOT: torches, candles, lanterns, glowing windows, light shafts, mirror floors, brass machinery, yellow, text, UI.
2. **Korr's siege platform.** Same house style. Transparent background, or flat pure magenta #FF00FF with no shadow on the ground, 10% margin. Asset type: a wide low siege platform for a chibi armoured boar to stand on, dark blued gunmetal with small brass bolts and two heavy chains hanging from the corners, chunky bevels, readable at 160x40 game units. NOT: circles, rings, discs, ellipses, glow, text.

## Rules check
- Backgrounds calm and darker than the ball: VIOLATED in the build (issue 1); fixed by art request 1.
- No plain circles or rings: VIOLATED in the build (issues 2, 8, 9); fixes listed.
- Very little yellow: VIOLATED in the build (issue 7); fix listed.
- Safe areas and 44 pt targets: VIOLATED in the build (issues 3, 12); fixes listed.
- Rejected flat clip-art: VIOLATED in the build (issue 10); fix listed.
- Breakable vs indestructible readable: VIOLATED in the build (issue 14); fix listed.
- Telegraphed hazards: not checkable from stills; no tell was visible in any screenshot.
- This drop itself adds no hazard, power or difficulty change: OK.

## Open questions for Claude
1. Is the gold box on the paddle the Ram sweet spot, and are the 3 dots the Ram pips or the aim dots? Recommended: dots = Ram pips (light one per centre hit); aim dots appear only while holding.
2. Is Bellforge's villain Korr? The menu says "Break Korr's armour" and Korr is also the Gatehouse duel. Recommended: give Bellforge its own villain, or rename Bellforge's goal so Korr belongs to Gatehouse only.
3. Is the "Full screen" button needed in the app build? Recommended: remove it on Android and iOS; keep Sound in a settings sheet.
4. Is the Armoury menu paused? Recommended: yes, the game pauses while it is open, per the brief's "short paused menu".
5. Is the ball trail a long light trail? Recommended: cap it at 3 ball-lengths with a fast fade.
