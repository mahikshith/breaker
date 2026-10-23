---
breach_drop: 1
kind: ui-screen
slug: continue-screen
version: 1
date: 2026-10-23
status: proposal
tool: Copilot Studio, Gemini 4 Argon
depends_on: ["difficulty-round2"]
---
# BREACH P4: Loss, Continue & $2.99 Unlock Flow

## Summary
- Shows the player what they almost achieved within the first `0.5 s` of a loss (`"SO CLOSE! KORR HAS 3 HP LEFT"` + live progress bar and staggered boss portrait) before revealing the Continue choices.
- Replaces pushy auto-fail timers with an `8.0 s` horizontal crystal fuse bar (`#2EC4B6 -> #FF4D5E`): continuing before it empties grants a bonus **3.0 s Brick Ward shield + armed Sweet-Spot**, and if it reaches `0.0 s` the buttons stay clickable instead of forcing a menu kick.
- Hides the `$2.99` Unlock Full Game card completely on the player's very first lifetime loss; from the 2nd loss onward, presents a clean one-time purchase card (`"FREE CONTINUES FOREVER • NO ADS — $2.99"`).
- Specifies the `3.0 s` placeholder rewarded-ad card (three faceted starglass gems lighting `3 -> 2 -> 1`) and the **"BACK IN ACTION!"** return moment (ball held on paddle in Focus aim + `3.0 s` teal Brick Ward barrier at `y = 716`).
- Places every interactive button at `48–58` game units tall (`>= 52 pt` on `393x852` and `412x915`) strictly inside the `y = 64..710` safe area.

## Decisions for the owner
1. What happens when the `8.0 s` countdown bar reaches `0.0 s`: A Soft urgency—the "Quick-Save Shield Bonus" expires, but Watch Ad, Retry, and Menu remain open so a distracted mobile player is never kicked out [RECOMMENDED] [AUTO-PICKED] | B Hard arcade timeout—auto-selects Retry | C No countdown bar at all.
2. When the `$2.99` Unlock card appears: A Never on the 1st lifetime loss; appears on the 2nd lifetime loss and on any loss where boss/floor progress `>= 60%` [RECOMMENDED] [AUTO-PICKED] | B Only after both ad continues are spent in a single run | C On every loss after Chapter 1.
3. "You are back" serve behaviour after Continue: A Ball spawns held on the paddle in Focus aim (`0.25x` time) with a `3.0 s` Brick Ward shield at `y = 716` and all 3 life balls restored [RECOMMENDED] [AUTO-PICKED] | B Ball launches upward immediately at `345 units/s` | C Restores only `1` life ball per continue.

## Spec

### 1. First `0.5 s` ("Almost Had It" Reveal) & Urgency Bar
- **`0.00–0.18 s`:** Playfield freezes in place and dims under a dark navy vignette (`#0A0C18` at `78%` opacity) so the player can still see the exact brick or villain they almost beat.
- **`0.10–0.45 s`:** The header plaque (`y = 88`) and "Almost Achieved" banner (`y = 148`) snap in first (`scale 0.85 -> 1.0, 0.28 s, easeOutBack`), displaying context-sensitive copy from `difficulty-round2`:
  - Boss floor: `"KORR HAS 3 HP LEFT!"` (or `"EMBER HAS 4 HP LEFT!"`) with the villain's `hurt` portrait on the right and Kit's `worried` portrait on the left.
  - Objective floor: `"1 CREW POD LEFT!"` or `"2 WINCH HITS TO CLEAR FLOOR 2!"`.
- **Urgency without pushiness (`8.0 s` Crystal Fuse Bar at `y = 266`):** A bevelled horizontal starglass bar drains `w: 264 -> 0` over `8.0 s` (`linear`), shifting from `#2EC4B6` to `#FF4D5E` in the last `2.0 s`. Label above reads `"QUICK CONTINUE BONUS: +3s SHIELD"`. If the player taps Continue within `8.0 s`, they start with the `3.0 s` Brick Ward shield AND `2/3` Sweet-Spot Ram pips pre-armed; if the bar hits `0.0 s`, they still keep the `3.0 s` shield and the screen waits calmly for their tap.

### 2. Placeholder `3.0 s` Ad Card & "You Are Back" Moment
- **Placeholder Ad Card (`y = 180..540`):** Tapping `WATCH AD - CONTINUE` swaps the panel for a clean `280x260` dark slate card (`#141831`, brass rim `#F4C542`). Three faceted starglass gems light up left-to-right at `1.0 s`, `2.0 s`, and `3.0 s` (`scale 0.8 -> 1.15 -> 1.0, easeOutBack`) with a numeric Rubik counter `"AD PLACEHOLDER — 3s"`. No fake close `"X"` traps.
- **"You Are Back" Sequence (`0.8 s` total):**
  1. Panel scales down (`1.0 -> 0.85, alpha 1 -> 0, 0.20 s, easeInQuad`).
  2. Three chrome life balls pop into the top HUD (`0.10 s` stagger) and a `3.0 s` glazed teal **Brick Ward** barrier slides into `y = 716` (`y 736 -> 716, 0.22 s, easeOutBack`).
  3. Kit/Lumi switches to `determined` in the lower-left face orb; the chrome ball sits locked on the paddle's centre third with the lilac Focus aim arrow (`#E3B6FF`) ready—play resumes only when the player slides and lifts their finger.

### 3. The `$2.99` Unlock Offer Rules & Copy
- **Trigger:** Hidden (`visible: false`) on `lifetimeLosses == 1`. Shown from `lifetimeLosses >= 2` whenever `isFullGameUnlocked == false`.
- **Copy:** Header `"UNLOCK FULL GAME — $2.99"` (`Lilita One`, `20 px`, `#FFDBB8`), subcopy `"FREE CONTINUES FOREVER • NO 3s AD WAIT • ALL 11 CHAPTERS"` (`Rubik`, `12 px`, `#8CA6FF`).
- **What the player gets:** Immediately converts the `WATCH AD - CONTINUE (2 LEFT)` button into `FREE CONTINUE (2 LEFT)` (`#7BD88F`) for this run and all future runs, removes all placeholder ad waits, and unlocks every story chapter.

### 4. Exact Layout Table (`360`-Wide World Grid, Safe for `393x852` & `412x915`)

| Element ID | `x` | `y` | `w` | `h` | Font & Size | Hex Colour | States | Animation (`from -> to, duration, easing`) |
|---|---:|---:|---:|---:|---|---|---|---|
| `dim-backdrop` | `0` | `0` | `360` | `780` | None | `#0A0C18` (`0.78` alpha) | `open`, `closing` | `alpha 0.0 -> 0.78, 0.18 s, easeOutQuad` |
| `main-frame` | `24` | `76` | `312` | `616` | None | `#141831` (border `#4A4F6E`) | `rest`, `ad-mode` | `y 116 -> 76, scale 0.92 -> 1.0, 0.26 s, easeOutBack` |
| `title-banner` | `48` | `92` | `264` | `44` | `Lilita One`, `28` | `#FF4D5E` (stroke `#0A0C18`) | `idle` | `scale 0.80 -> 1.0, 0.22 s, easeOutBack, delay 0.05 s` |
| `almost-card` | `40` | `146` | `280` | `104` | `Lilita One`, `20` | `#22284A` (text `#FFD36B`) | `boss`, `goal` | `scale 0.88 -> 1.0, 0.25 s, easeOutBack, delay 0.10 s` |
| `progress-fill` | `56` | `216` | `248` | `18` | `Rubik`, `13` | `#22C4B0` (track `#0A0C18`) | `filling`, `pulse` | `width 0 -> 218, 0.35 s, easeOutCubic, delay 0.18 s` |
| `urgency-bar` | `48` | `266` | `264` | `16` | `Rubik`, `12` | `#2EC4B6` -> `#FF4D5E` | `draining`, `expired` | `width 264 -> 0, 8.0 s, linear, delay 0.45 s` |
| `ad-button` | `44` | `302` | `272` | `58` | `Lilita One`, `21` | `#7BD88F` (text `#0A0C18`) | `idle`, `pressed`, `disabled`, `free-unlocked` | `scale 0.90 -> 1.0, 0.25 s, easeOutBack, delay 0.22 s` |
| `continues-pips` | `124` | `366` | `112` | `20` | `Rubik`, `13` | `#FFDBB8` | `2-left`, `1-left`, `0-left` | `alpha 0 -> 1.0, 0.20 s, linear, delay 0.28 s` |
| `unlock-card` | `44` | `398` | `272` | `78` | `Lilita One`, `19` | `#4F9DFF` (trim `#F4C542`) | `idle`, `pressed`, `hidden-first-loss` | `y 418 -> 398, alpha 0 -> 1, 0.26 s, easeOutBack, delay 0.30 s` |
| `retry-button` | `44` | `494` | `130` | `52` | `Lilita One`, `18` | `#3A3F55` (text `#FFDBB8`) | `idle`, `pressed` | `scale 0.92 -> 1.0, 0.22 s, easeOutBack, delay 0.34 s` |
| `menu-button` | `186` | `494` | `130` | `52` | `Lilita One`, `18` | `#22284A` (text `#8CA6FF`) | `idle`, `pressed` | `scale 0.92 -> 1.0, 0.22 s, easeOutBack, delay 0.36 s` |
| `keep-note` | `48` | `560` | `264` | `28` | `Rubik`, `13` | `#7FD6FF` | `idle` | `alpha 0 -> 0.9, 0.25 s, linear, delay 0.38 s` |
| `ad-modal-card` | `40` | `210` | `280` | `240` | `Rubik`, `22` | `#141831` (gems `#2EC4B6`) | `hidden`, `counting-3s`, `done` | `scale 0.85 -> 1.0, 0.20 s, easeOutBack` |

### 5. Sound Cues

| Trigger Moment | Sound Design Description |
|---|---|
| `panel opens (0.0 s)` | Low brass sigh followed by a crisp ceramic tile slide (`0.22 s`), never a harsh buzzer. |
| `almost-card fill (0.18 s)` | Rising marimba roll ending in a bright gold glint ping as remaining boss HP flashes (`3 HP LEFT`). |
| `urgency-bar last 2.0 s` | Two soft wooden clockwork ticks at `1.5 s` and `0.5 s` remaining. |
| `ad-button tap` | Chunky vinyl button click + upward emerald chord (`C5 -> G5`). |
| `ad-modal-card 3s ticks` | Three warm starglass chimes (`D5`, `F#5`, `A5`) at `1.0 s` intervals. |
| `you-are-back serve` | Heroic horn flourish + knight shield lock (`Brick Ward` deploy at `y = 716`). |
| `unlock-card purchase` | Royal trumpet fanfare + cascading starglass chime as button flips to `FREE CONTINUE`. |

## Data
```json
{
  "kind": "ui-screen",
  "screen": "continue",
  "phones": ["393x852", "412x915"],
  "elements": [
    {
      "id": "dim-backdrop",
      "x": 0,
      "y": 0,
      "w": 360,
      "h": 780,
      "font": "Rubik",
      "size": 12,
      "color": "#0A0C18",
      "text": "",
      "states": ["open", "closing"],
      "anim": "alpha 0 -> 0.78, 0.18 s, easeOutQuad"
    },
    {
      "id": "main-frame",
      "x": 24,
      "y": 76,
      "w": 312,
      "h": 616,
      "font": "Lilita One",
      "size": 20,
      "color": "#141831",
      "text": "",
      "states": ["rest", "ad-mode"],
      "anim": "y 116 -> 76, scale 0.92 -> 1.0, 0.26 s, easeOutBack"
    },
    {
      "id": "title-banner",
      "x": 48,
      "y": 92,
      "w": 264,
      "h": 44,
      "font": "Lilita One",
      "size": 28,
      "color": "#FF4D5E",
      "text": "SO CLOSE!",
      "states": ["idle"],
      "anim": "scale 0.8 -> 1.0, 0.22 s, easeOutBack, delay 0.05 s"
    },
    {
      "id": "almost-card",
      "x": 40,
      "y": 146,
      "w": 280,
      "h": 104,
      "font": "Lilita One",
      "size": 20,
      "color": "#FFD36B",
      "text": "KORR HAS 3 HP LEFT! (FLOOR 3/3)",
      "states": ["boss", "goal"],
      "anim": "scale 0.88 -> 1.0, 0.25 s, easeOutBack, delay 0.1 s"
    },
    {
      "id": "progress-fill",
      "x": 56,
      "y": 216,
      "w": 248,
      "h": 18,
      "font": "Rubik",
      "size": 13,
      "color": "#22C4B0",
      "text": "91% CLEARED",
      "states": ["filling", "pulse"],
      "anim": "width 0 -> 218, 0.35 s, easeOutCubic, delay 0.18 s"
    },
    {
      "id": "urgency-bar",
      "x": 48,
      "y": 266,
      "w": 264,
      "h": 16,
      "font": "Rubik",
      "size": 12,
      "color": "#2EC4B6",
      "text": "QUICK SHIELD BONUS: 8.0s",
      "states": ["draining", "expired"],
      "anim": "width 264 -> 0, 8.0 s, linear, delay 0.45 s"
    },
    {
      "id": "ad-button",
      "x": 44,
      "y": 302,
      "w": 272,
      "h": 58,
      "font": "Lilita One",
      "size": 21,
      "color": "#7BD88F",
      "text": "WATCH 3s AD - CONTINUE",
      "states": ["idle", "pressed", "disabled", "free-unlocked"],
      "anim": "scale 0.9 -> 1, 0.25 s, easeOutBack, delay 0.22 s"
    },
    {
      "id": "continues-pips",
      "x": 124,
      "y": 366,
      "w": 112,
      "h": 20,
      "font": "Rubik",
      "size": 13,
      "color": "#FFDBB8",
      "text": "2 OF 2 CONTINUES LEFT",
      "states": ["2-left", "1-left", "0-left"],
      "anim": "alpha 0 -> 1, 0.2 s, linear, delay 0.28 s"
    },
    {
      "id": "unlock-card",
      "x": 44,
      "y": 398,
      "w": 272,
      "h": 78,
      "font": "Lilita One",
      "size": 19,
      "color": "#4F9DFF",
      "text": "UNLOCK FULL GAME $2.99 - FREE CONTINUES",
      "states": ["idle", "pressed", "hidden-first-loss"],
      "anim": "y 418 -> 398, alpha 0 -> 1, 0.26 s, easeOutBack, delay 0.3 s"
    },
    {
      "id": "retry-button",
      "x": 44,
      "y": 494,
      "w": 130,
      "h": 52,
      "font": "Lilita One",
      "size": 18,
      "color": "#3A3F55",
      "text": "RETRY FLOOR",
      "states": ["idle", "pressed"],
      "anim": "scale 0.92 -> 1, 0.22 s, easeOutBack, delay 0.34 s"
    },
    {
      "id": "menu-button",
      "x": 186,
      "y": 494,
      "w": 130,
      "h": 52,
      "font": "Lilita One",
      "size": 18,
      "color": "#22284A",
      "text": "CHAPTERS",
      "states": ["idle", "pressed"],
      "anim": "scale 0.92 -> 1, 0.22 s, easeOutBack, delay 0.36 s"
    },
    {
      "id": "keep-note",
      "x": 48,
      "y": 560,
      "w": 264,
      "h": 28,
      "font": "Rubik",
      "size": 13,
      "color": "#7FD6FF",
      "text": "CONTINUE KEEPS FLOOR, BRICKS & BOSS HP",
      "states": ["idle"],
      "anim": "alpha 0 -> 0.9, 0.25 s, linear, delay 0.38 s"
    },
    {
      "id": "ad-modal-card",
      "x": 40,
      "y": 210,
      "w": 280,
      "h": 240,
      "font": "Rubik",
      "size": 22,
      "color": "#2EC4B6",
      "text": "REWARDED AD PLACEHOLDER - 3s",
      "states": ["hidden", "counting-3s", "done"],
      "anim": "scale 0.85 -> 1.0, 0.20 s, easeOutBack"
    }
  ],
  "sounds": [
    { "when": "panel opens", "sound": "Low brass sigh + crisp ceramic tile slide (0.22 s)" },
    { "when": "almost-card progress bar fills", "sound": "Rising marimba roll + bright gold glint ping" },
    { "when": "urgency bar last 2.0 s", "sound": "Two soft wooden clockwork ticks at 1.5 s and 0.5 s" },
    { "when": "ad-button pressed", "sound": "Chunky vinyl button click + upward emerald chord (C5 to G5)" },
    { "when": "placeholder ad 3s countdown", "sound": "Three warm starglass chimes (D5, F#5, A5) at 1.0 s intervals" },
    { "when": "you-are-back serve", "sound": "Short knight horn flourish + teal Brick Ward shield lock chime" },
    { "when": "unlock-card purchased", "sound": "Royal trumpet fanfare + cascading starglass chime" }
  ]
}
```

## Art requests

### Image 1: `P04_continue-screen_panel-rest_1.png`
```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: stylized-concept.
Asset type: portrait phone UI mock-up (9:19.5 aspect ratio, 1080x2340 or tallest portrait available) showing the BREACH Continue & Unlock panel AT REST over a dimmed Gatehouse Siege playfield (#0A0C18 at 78% opacity).
Primary request: A chunky bevelled dark-navy ceramic modal frame (#141831 with slate #4A4F6E trim and brass corner rivets) centred inside the safe area:
- Top banner: glossy coral-red plaque (#FF4D5E) with rounded playful lettering "SO CLOSE!".
- Almost-achieved card (#22284A): on the left, chibi knight Kit's worried face in his cobalt open-face helmet; on the right, ruby-and-plum armoured boar Korr looking hurt with only a tiny sliver left on a glowing teal ceramic progress bar (#22C4B0) labelled "3 HP LEFT".
- Below the card: a slim horizontal teal crystal fuse bar (#2EC4B6).
- Primary CTA button: wide chunky glazed mint-green button (#7BD88F) with a small brass clapperboard icon and bold dark text "WATCH 3s AD - CONTINUE", with two small chrome life-ball pips underneath.
- Secondary Unlock card: royal blue glazed plaque (#4F9DFF) with thin brass trim (#F4C542) and a small knight crown emblem labelled "UNLOCK FULL GAME $2.99".
- Bottom row: two side-by-side bevelled slate buttons (#3A3F55 and #22284A) labelled "RETRY" and "MENU".
Quality checks: all buttons sit well inside top notch and bottom home-indicator safe zones; no plain circles or rings; minimal yellow.
```

### Image 2: `P04_continue-screen_panel-anim_2.png`
```
HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo.

Use case: stylized-concept.
Asset type: portrait phone UI mock-up (9:19.5 aspect ratio, 1080x2340 or tallest portrait available) showing the BREACH Continue flow MID-ANIMATION during the "3s Ad Placeholder -> You Are Back!" transition.
Primary request: Split composition inside one tall portrait playfield:
- Upper-middle: the compact dark-navy 3-second placeholder card (#141831) folding away as three faceted teal starglass gems (#2EC4B6) finish lighting up (1, 2, 3) with four-pointed gold spark glints.
- Lower playfield (75% height): the chrome paddle sits above the dark control deck with a white chrome ball perched on its centre third and a lilac crystal Focus-aim arrow (#E3B6FF) pointing up toward the damaged boss.
- Directly below the paddle at the drain line: a newly deployed glazed teal Brick Ward barrier (#2EC4B6, three interlocked ceramic shield tiles) glowing with a 3-second protection sheen.
- Lower-left control deck: Kit's round face orb showing a big confident grin, and three restored chrome life balls gleaming in the top HUD.
Quality checks: no plain circles or rings; dark calm background; clear empty reaction lane above the paddle.
```

## Rules check
- Every hazard has a visible 1.2 to 1.8 s tell and is shown once safely first: **OK** — returning from Continue pauses enemy hazard clocks until the player releases the held Focus-aim serve.
- Ordinary ball play always makes progress; no tiny weak points (min 32x16 brick), no precision puzzles, no waiting on timers or invulnerable enemies: **OK** — UI flow only.
- Difficulty changes numbers only (harder but fair): **OK** — 2 continues per attempt apply equally across Easy, Medium, and Hard.
- No power-up, companion or purchase is required to win; Pause, Continue, Retry keep progress: **OK** — Continue is funded by a free 3 s placeholder ad (or $2.99 unlock) and preserves floor, broken bricks, rescued crew, and boss HP dealt.
- Enemy attacks never destroy the player's bricks to hand out rewards: **OK** — UI screen only.
- A single brick cracks and fades in about 0.4 s; only big crashes drop debris: **OK** — UI screen only.
- Effects are rendered gems, chips, sparks, dust or debris; never plain circles or rings: **OK** — countdown uses a horizontal starglass fuse bar and 3 faceted gems instead of a circular radial spinner.
- Mobile safe areas, 393x852 and 412x915, 44 pt touch targets, paddle above the thumb: **OK** — all elements sit inside `x: 24..336, y: 76..692`, and all 4 buttons are `52–58` units tall (`>48 pt` on both test phones).
- Glossy vinyl-toy / glazed-ceramic look, dark navy background, minimal yellow: **OK** — `#141831` and `#22284A` ceramic frames with `#7BD88F` and `#4F9DFF` buttons; gold `#F4C542` is a thin border accent only.

## Open questions for Claude
1. When `ad_continues` reaches `0` (after 2 continues used in one attempt), how should `ad-button` render on a 3rd loss? **Recommended:** Set `ad-button` to `disabled` (`#3A3F55`, `"0 CONTINUES LEFT"`) and promote `retry-button` (`"RETRY FLOOR"`) to primary green `#7BD88F` while keeping floor progress intact per the Floor checkpoint rule.
2. Should `RETRY FLOOR` on the loss screen restart the current floor (keeping earlier floors cleared) or the whole 3-floor chapter? **Recommended:** Restart the **current floor** on Easy/Medium and provide a secondary confirmation for full-chapter restart on Hard, matching K09's floor carry-over rule.
3. Where should the `isFullGameUnlocked` boolean live before native store billing is wired? **Recommended:** Persist `breach_full_unlock_v1: true` in `localStorage` so the owner can test both the 3 s ad flow and the instant Free Continue flow on the APK via a toggle on the title screen.
