---
breach_drop: 1
kind: critique
slug: apk-critique-2026-10-23
version: 1
date: 2026-10-23
status: proposal
tool: Copilot Studio, Gemini 4 Argon
depends_on: ["powerups-round2", "difficulty-round2", "continue-screen"]
---
# BREACH P5: APK Screenshot Critique (5 Attached Captures)

## Summary
- Critiques all 5 attached APK captures (`gatehouse-floor3.png`, `bellforge-run.png`, `continue-modal.png`, `chapter-select-menu.png`, `tidewheel-armoury.png`), ordered from highest severity (`high`) to `low` across 14 concrete issues.
- Flags the biggest "vibe-coded" visual offenders: the pink radial ring timer on `continue-modal.png`, the flat 2D line icons and neon rings inside `KIT'S ARMOURY` (`tidewheel-armoury.png`), and the drawn wireframe ellipses under Korr (`gatehouse-floor3.png`).
- Catches direct K01/K05 style-bible violations: Lumi's bright yellow/gold cage in `bellforge-run.png` (already fixed to dark iron in `tidewheel-armoury.png`), glowing orange wall torches behind the bricks, and armour bricks that share the exact same rectangle silhouette as breakable bricks.
- Identifies mobile ergonomics and safe-area bugs: top HUD (`||`, life balls, `FLOOR 3/3`, score) and bottom-left Kit Face Orb sit inside the top notch and bottom home-indicator zones, while `"No thanks"` (`continue-modal.png`) and `"X"` (`tidewheel-armoury.png`) are well under `44 pt`.
- Preserves what already shines: the Blender-quality 3D renders of **Korr** and **Nerra**, the dark gothic depth of the castle halls, and the clean 3-mode selector pill layout.

## Decisions for the owner
1. Replacing `KIT'S ARMOURY` (`tidewheel-armoury.png`) icons and labels: A Replace flat 2D pictograms (`ANCHOR`, `ARROWS`, `STARFIRE`) with canonical 3D glossy toy icons from K07 (`BRICK WARD`, `ARROWS`, `COSMIC`, `BALL FAN`) [RECOMMENDED] [AUTO-PICKED] | B Keep `ANCHOR` and `STARFIRE` names and render 3D icons for them.
2. Replacing the `CONTINUE?` modal (`continue-modal.png`): A Replace with the P4 `continue-screen` spec ("Almost Achieved" boss HP bar, horizontal crystal fuse bar, 44 pt+ `RETRY`/`MENU` buttons, `$2.99` hidden on 1st loss) [RECOMMENDED] [AUTO-PICKED] | B Keep the current modal layout and only swap the pink ring for a horizontal bar.
3. Sweet-Spot Ram / Aim indicator on the paddle (`gatehouse-floor3.png`): A Replace the drawn gold wireframe rectangle over the paddle with 3 physical brass/chrome sweet-spot pips inlaid on the paddle's centre third plus a lilac `#E3B6FF` crystal aim prism [RECOMMENDED] [AUTO-PICKED] | B Keep the wireframe rectangle and reduce its opacity.

## Spec

### 1. Prioritised Issues (14 Issues, Most Severe First)

| # | Screen | Where | Problem | Severity | One-Line Fix | Rule Broken |
|---:|---|---|---|---|---|---|
| 1 | `continue-modal.png` | Centre countdown (`y ~ 43%`) | Uses a plain drawn pink circular ring (`O` around `8`) that reads as generic web/vibe-coded UI. | `high` | Replace the radial ring with P4's horizontal faceted starglass fuse bar (`264x16` units, `#2EC4B6 -> #FF4D5E`). | Effects are rendered things, never plain drawn circles or rings (K01 §5). |
| 2 | `tidewheel-armoury.png` | Bottom `KIT'S ARMOURY` card (`y ~ 78–92%`) | `ANCHOR` (`⚓`) and `ARROWS` (`↑↑`) are flat 2D vector line icons, and `STARFIRE` is a dark circle with two neon rings; names also drift from Kit's canonical powers. | `high` | Replace with K07's 3D rendered physical icons (`BRICK WARD` shield, copper-shaft `ARROWS`, violet glass `COSMIC` orb, `BALL FAN`). | Rejected forever: flat vector clip-art, neon glow, plain circle or ring effects (K01 §5, K05). |
| 3 | `gatehouse-floor3.png` | Under Korr's front and rear hooves (`y ~ 25–29%`) | Two thin drawn gold wireframe ellipses connected by a line sit beneath Korr like left-on debug collision or plinth guides. | `high` | Remove the wireframe ellipses and place Korr on a solid 3D bevelled dark-stone plinth (`144x24` units). | Never plain drawn circles or rings; collision follows drawn art (K01 §5). |
| 4 | `continue-modal.png` | Subtitle (`"No balls remaining"`) & bottom `"No thanks"` | Shows generic `"No balls remaining"` instead of what the player almost achieved, omits `Retry` / `Menu` buttons, and uses a tiny `~16 pt` `"No thanks"` text link. | `high` | Show `"SO CLOSE! KORR HAS X HP LEFT!"` in the first `0.5 s` and add `52`-unit tall (`>44 pt`) `RETRY FLOOR` and `CHAPTERS` buttons per P4. | Touch targets at least 44 pt; Continue/Retry clarity (K01 §4–5). |
| 5 | `bellforge-run.png` | Upper-right hanging cage (`x ~ 75–94%, y ~ 8–20%`) | Lumi's cage is rendered in bright saturated yellow-gold, and Lumi stands motionless instead of pacing nervously. | `high` | Swap to the dark blued-gunmetal cage already used in `tidewheel-armoury.png` and loop Lumi's nervous pacing/bar-gripping animation. | Very little yellow; the owner explicitly rejected a yellow cage (K01 §4–5, K05). |
| 6 | `gatehouse-floor3.png`, `bellforge-run.png`, `tidewheel-armoury.png` | Top HUD (`y ~ 1–3%`) & bottom-left Face Orb (`y ~ 93–98%`) | Pause `||`, life balls, `FLOOR 3/3`, score, and Kit's lower-left Face Orb sit right against the top status-bar/notch and bottom home-indicator edges, and the paddle at `y ~ 86%` sits too close to the bottom thumb zone. | `high` | Push top HUD down into the `5–9%` band (`y = 44..72`), raise paddle to `75%` height (`y = 585`), and lift Kit's Face Orb to `y = 636..692` inside the safe deck. | Nothing in notch, status bar or home-indicator areas; paddle above the thumb (K01 §5, K08). |
| 7 | `gatehouse-floor3.png` | Centre of paddle (`y ~ 86%`) | The Sweet-Spot / Aim-Hold zone is drawn as a flat gold vector rounded-rectangle stroke around the paddle with 3 blurry yellow dots below it. | `medium` | Replace the stroke box with 3 physical brass/teal gem pips inset into the paddle's chrome centre third and a 3D lilac `#E3B6FF` prism when Focus aim holds. | Never flat vector clip-art or generic vibe-coded UI boxes (K01 §4–5). |
| 8 | `gatehouse-floor3.png`, `bellforge-run.png`, `tidewheel-armoury.png` | Side pillars (`y ~ 18–55%`) & floor centre (`y ~ 70–85%`) | Lit orange wall torches and bright amber floor reflections compete with the bricks and make the small grey-chrome ball blend into the floor in `bellforge-run.png`. | `medium` | Extinguish or desaturate the wall torches into cool dim navy stone (`#141831`) and brighten the ball's white-chrome core (`#FFFFFF` top-left specular). | No torches behind the ball; background never brighter than the ball (K01 §5, K05). |
| 9 | `gatehouse-floor3.png` | Top two brick rows (`y ~ 43–49%`) | The 14 grey 4-rivet armour bricks have the exact same outer rounded-rectangle shape as the breakable red/cream/sage bricks below them. | `medium` | Give indestructible/armour blocks chamfered octagon corners and heavy notched iron rims so they differ by silhouette as well as colour (see P9). | Breakable bricks and indestructible blocks differ by shape and material, not only colour (K05, K08). |
| 10 | `gatehouse-floor3.png`, `bellforge-run.png`, `tidewheel-armoury.png` | Brick field (`y ~ 40–58%`) | Bricks have a soft satin horizontal gradient rather than a thick glazed-ceramic coat with a crisp top-edge highlight band. | `medium` | Upgrade brick sprites to the P9 `bricks-glaze-v2` spec (`3 px` `#FFDBB8` top highlight band, `2.5x` clear-coat gloss, visible inner core on 2-HP tiles). | Bricks should be shinier, like the Vault look-dev: glazed ceramic with real highlights (K01 §4–5). |
| 11 | `tidewheel-armoury.png` | Middle brick platforms (`y ~ 53%`) & top-right of Armoury card (`y ~ 79%`) | The rising floodwater urgency threat is only two faint 1 px cyan sine-wave lines, and the Armoury close `"X"` button is a tiny `~18 pt` target. | `medium` | Render rising tidewater as a dark translucent teal glazed water volume (`#0B5D59` with chunky white foam crest chips) and enlarge the close `"X"` button to a `44x44` unit bevelled badge. | Visible urgency; touch targets at least 44 pt (K01 §5, P2). |
| 12 | `bellforge-run.png` | Under Korr's platform and on both ramps (`y ~ 22%, 31%, 40%`) | Three flat brown-grey rectangular plaques with faint bell outlines float on top of the 3D brass ramps like pasted 2D stickers. | `medium` | Replace flat plaques with physical 3D brass ratchet latches and a glowing murder-hole ember tell (`1.6 s` before bell release). | Glossy 3D toy props; no flat clip-art overlays (K05, K07). |
| 13 | `chapter-select-menu.png` | Top logo, chapter badges (`1, 2, 3, V, F, 6, 7, 8`), and bottom bar | Logo uses a heavy yellow-orange fill with flat floating candy lozenges; badges mix numbers with letters (`V`, `F`) and omit Ch 9–11; bottom bar shows a web-wrapper `"Full screen"` button in the home-indicator zone. | `medium` | Render `"BREACH"` in starglass chrome/cobalt with 1 small gold spark, number chapters `1` to `11` sequentially in K01 order, darken left text backing on thumbnails, and remove `"Full screen"` on native APK builds. | Minimal yellow; 11 canonical chapters; nothing in home-indicator area (K01 §2, §5). |
| 14 | `gatehouse-floor3.png`, `bellforge-run.png`, `tidewheel-armoury.png` | Lower-left Kit Face Orb (`x ~ 3–16%, y ~ 93–98%`) | The thin pink circle around Kit's portrait gives no clear read of how many hits remain to fill the Hero Charge or when it is ready to tap. | `low` | Frame the orb in a chunky 3D brass-and-cobalt bezel that fills clockwise with glowing starglass segments (`22/28/34` hits) and pulses `"doop doop"` (`scale 1.0 -> 1.12`) with gold star glints when full. | Clear power-up and hero charge state readability (K01 §3, P1). |

### 2. What Already Works and Must Be Kept
- **Korr and Nerra 3D boss renders (`gatehouse-floor3.png`, `bellforge-run.png`, `tidewheel-armoury.png`):** Exceptional Blender Cycles vinyl-toy quality, expressive angry brows/eyes, and strong silhouettes that read immediately against the dark hall.
- **Dark gothic castle depth and floor framing:** The vaulted navy-plum arches and wide open reaction lane between the bricks and the paddle establish the exact mood of Gatehouse, Bellforge, and Tidewheel.
- **Dark iron cage in `tidewheel-armoury.png`:** Fixing Lumi's cage to dark gunmetal iron (compared to the yellow cage in `bellforge-run.png`) immediately stops the cage from competing with the ball and gold accents.
- **Clean 3-mode difficulty pills (`chapter-select-menu.png`):** The `Easy / Medium / Hard` top toggle and one-line chapter objective subtitles (`"Break Nerra's grip. Stop the flood."`) communicate chapter goals in under 2 seconds.

## Data
```json
{
  "kind": "critique",
  "screens": [
    "gatehouse-floor3.png",
    "bellforge-run.png",
    "continue-modal.png",
    "chapter-select-menu.png",
    "tidewheel-armoury.png"
  ],
  "issues": [
    {
      "screen": "continue-modal.png",
      "where": "Centre countdown timer (y ~ 43%)",
      "problem": "Uses a plain drawn pink circular ring around the number 8 that looks like generic web UI",
      "severity": "high",
      "fix": "Replace radial ring with P4's horizontal faceted starglass fuse bar (264x16 units, #2EC4B6 to #FF4D5E)",
      "rule": "Effects are rendered things (gems, chips, sparks, dust, debris), never plain drawn circles or rings"
    },
    {
      "screen": "tidewheel-armoury.png",
      "where": "Bottom KIT'S ARMOURY popup (y ~ 78-92%)",
      "problem": "ANCHOR and ARROWS use flat 2D vector line art and STARFIRE uses a black circle with neon rings; names do not match Kit's canonical powers",
      "severity": "high",
      "fix": "Replace with K07 3D glossy physical icons and canonical labels (BRICK WARD, ARROWS, COSMIC, BALL FAN)",
      "rule": "Rejected forever: flat clip-art, neon glow, plain circle or ring effects"
    },
    {
      "screen": "gatehouse-floor3.png",
      "where": "Beneath Korr's hooves (y ~ 25-29%)",
      "problem": "Two thin drawn gold wireframe ellipses connected by a line sit under Korr like debug collision circles",
      "severity": "high",
      "fix": "Remove wireframe ellipses and stand Korr on a solid 3D bevelled dark-stone plinth (144x24 units)",
      "rule": "Effects and props are rendered 3D objects, never plain drawn circles or rings"
    },
    {
      "screen": "continue-modal.png",
      "where": "Subtitle and bottom 'No thanks' link",
      "problem": "Says 'No balls remaining' instead of showing near-win progress, omits Retry/Menu buttons, and uses a tiny <44 pt 'No thanks' text link",
      "severity": "high",
      "fix": "Show 'KORR HAS X HP LEFT!' progress bar in first 0.5 s and add 52-unit tall RETRY FLOOR and CHAPTERS buttons per P4",
      "rule": "Touch targets at least 44 pt; Continue and Retry keep earned progress"
    },
    {
      "screen": "bellforge-run.png",
      "where": "Upper-right hanging cage (x ~ 75-94%, y ~ 8-20%)",
      "problem": "Lumi's cage is bright yellow-gold and Lumi stands static instead of pacing nervously",
      "severity": "high",
      "fix": "Use dark blued gunmetal for the cage (as in tidewheel-armoury.png) and play Lumi's nervous pacing animation",
      "rule": "Very little yellow (owner rejected a yellow cage); nervous princess pacing"
    },
    {
      "screen": "gatehouse-floor3.png",
      "where": "Top HUD (y ~ 1-3%), paddle (y ~ 86%), and bottom-left Face Orb (y ~ 95%)",
      "problem": "Pause, life balls, FLOOR 3/3, score, and Kit's Face Orb sit inside notch/home-indicator edges and paddle is too low in the thumb zone",
      "severity": "high",
      "fix": "Move top HUD to y=44..72 (5-9% height), raise paddle to y=585 (75% height), and lift Face Orb to y=636..692",
      "rule": "Nothing in notch, status bar or home-indicator areas; paddle above the thumb"
    },
    {
      "screen": "gatehouse-floor3.png",
      "where": "Paddle centre sweet-spot indicator (y ~ 86%)",
      "problem": "Sweet-Spot/Aim zone is drawn as a flat gold wireframe rectangle around the paddle with three blurry yellow dots",
      "severity": "medium",
      "fix": "Embed 3 physical brass/teal gem pips into the paddle's chrome centre third and pop a 3D lilac #E3B6FF prism on Focus aim",
      "rule": "Never generic or vibe-coded; clear aim-hold hint"
    },
    {
      "screen": "bellforge-run.png",
      "where": "Side wall pillars (y ~ 45-55%) and floor reflection above paddle",
      "problem": "Lit orange wall torches and bright floor reflections compete with the bricks and camouflage the small chrome ball",
      "severity": "medium",
      "fix": "Remove wall torch flames, darken floor reflection by 50%, and boost white-chrome specular highlight on the ball",
      "rule": "Backgrounds calm, dark navy, never brighter than the ball; no torches behind the ball"
    },
    {
      "screen": "gatehouse-floor3.png",
      "where": "Top two rows of grey armour bricks (y ~ 43-49%)",
      "problem": "Grey 4-rivet armour bricks have the exact same rounded-rectangle silhouette as breakable coloured bricks",
      "severity": "medium",
      "fix": "Give indestructible/armour bricks chamfered octagon corners and notched iron rims so silhouette differs from 1-HP tiles",
      "rule": "Breakable bricks and indestructible blocks differ by shape and material, not only by colour"
    },
    {
      "screen": "gatehouse-floor3.png",
      "where": "Coloured brick rows (y ~ 50-58%)",
      "problem": "Bricks have a flat satin sheen rather than the thick glazed-ceramic highlight band from the Vault look-dev",
      "severity": "medium",
      "fix": "Apply P9 bricks-glaze-v2 sprites with a crisp #FFDBB8 top-left highlight band, thick clear coat, and 4-pointed corner glint",
      "rule": "Bricks should be shinier, like the Vault look-dev (glazed ceramic with real highlights)"
    },
    {
      "screen": "tidewheel-armoury.png",
      "where": "Water line across brick platforms (y ~ 53%) and Armoury 'X' button (y ~ 79%)",
      "problem": "Rising flood urgency is only two thin 1 px cyan lines, and the Armoury close 'X' button is ~18 pt (<44 pt)",
      "severity": "medium",
      "fix": "Render a translucent dark-teal glazed water body with chunky white foam chips and enlarge 'X' to a 44x44 unit button",
      "rule": "Visible urgency; touch targets at least 44 pt"
    },
    {
      "screen": "bellforge-run.png",
      "where": "Three rectangular plaques on boss platform and ramps (y ~ 22%, 31%, 40%)",
      "problem": "Flat brown-grey rectangular boxes with faint icons float over the 3D brass ramps like 2D stickers",
      "severity": "medium",
      "fix": "Replace flat plaques with 3D brass ratchet housings and a warm ember glow tell (1.6 s) before a bell drops",
      "rule": "Glossy 3D toy props; every hazard has a visible 1.2 to 1.8 s tell"
    },
    {
      "screen": "chapter-select-menu.png",
      "where": "Top BREACH logo, chapter badges (V, F), and bottom Full screen button",
      "problem": "Heavy yellow-orange logo with flat candy lozenges, mixed number/letter badges missing Ch 9-11, and web 'Full screen' button in home bar zone",
      "severity": "medium",
      "fix": "Render BREACH in chrome/cobalt starglass, number all 11 chapters 1-11 in K01 order with dark text gradient backing, and hide 'Full screen' on APK",
      "rule": "Very little yellow; 11 chapters; nothing in home-indicator area"
    },
    {
      "screen": "gatehouse-floor3.png",
      "where": "Lower-left Kit Face Orb (x ~ 3-16%, y ~ 95%)",
      "problem": "Thin pink border around Kit's portrait does not clearly show charge progress or a full 'doop doop' ready state",
      "severity": "low",
      "fix": "Wrap Face Orb in a chunky segmented starglass ring that fills over 22/28/34 hits and pulses with gold glints when ready",
      "rule": "Readable HUD and Hero Orb charge state at phone size"
    }
  ],
  "keep": [
    "Korr and Nerra 3D Blender Cycles vinyl-toy renders: expressive brows, chunky armour plates, and unmistakable silhouettes",
    "Dark gothic castle architecture in Gatehouse, Bellforge, and Tidewheel with generous empty space above the paddle",
    "Dark blued-gunmetal cage in Tidewheel Citadel (use this exact cage material to replace the yellow cage in Bellforge Run)",
    "Top Easy / Medium / Hard pill selector and concise 6-word chapter goal subtitles on the menu screen"
  ]
}
```

## Art requests
None

## Rules check
- Every hazard has a visible 1.2 to 1.8 s tell and is shown once safely first: **OK** — Issue #12 replaces static ramp stickers with a `1.6 s` physical lever + warm murder-hole tell.
- Ordinary ball play always makes progress; no tiny weak points (min 32x16 brick), no precision puzzles, no waiting on timers or invulnerable enemies: **OK** — verified across all 3 gameplay captures.
- Difficulty changes numbers only (harder but fair): **OK** — Easy/Medium/Hard toggle preserved.
- No power-up, companion or purchase is required to win; Pause, Continue, Retry keep progress: **OK** — Issue #4 fixes the Continue modal so `RETRY FLOOR` and progress preservation are explicit.
- Enemy attacks never destroy the player's bricks to hand out rewards: **OK** — preserved.
- A single brick cracks and fades in about 0.4 s; only big crashes drop debris: **OK** — preserved.
- Effects are rendered gems, chips, sparks, dust or debris; never plain circles or rings: **OK** — Issues #1, #2, and #3 eliminate all three plain-circle/ring violations found in the screenshots.
- Mobile safe areas, 393x852 and 412x915, 44 pt touch targets, paddle above the thumb: **OK** — Issues #4, #6, #11, and #13 fix all notch, home-indicator, paddle-height, and `<44 pt` button violations.
- Glossy vinyl-toy / glazed-ceramic look, dark navy background, minimal yellow: **OK** — Issues #5, #8, #10, and #13 remove the yellow cage, wall torches, flat brick sheen, and yellow-heavy title logo.

## Open questions for Claude
1. In `tidewheel-armoury.png`, why does the Hero Orb menu show `ANCHOR / ARROWS / STARFIRE` instead of Kit's canonical `BRICK WARD / ARROWS / COSMIC / BALL FAN`? **Recommended:** Unify Kit's orb menu to the 4 canonical powers from K01 §3 using the K07 3D icon sheet so chapter builds stay consistent.
2. In `chapter-select-menu.png`, should the chapter list scroll vertically to show all 11 chapters (`1` through `11` plus `12 Dragon's Hoard`), or group them by act? **Recommended:** Use a smooth vertical scroll list numbered `1` to `11` in K01's exact chapter order (`2 The Vault`, `3 Circuit Breakout`, `4 Shutter Forge`, `5 Frost Warden`, etc.) with the next locked chapter peeking at the bottom edge.
3. Can we replace the `"Full screen"` button at the bottom of `chapter-select-menu.png` with an **`ARMOURY / SKINS`** button (for P10 unlockables) when running inside the Android/iOS wrapper? **Recommended:** Yes—hide `"Full screen"` whenever `window.matchMedia('(display-mode: standalone)')` or native APK WebView is active, and place `ARMOURY` there at `52` units height inside the safe area.

