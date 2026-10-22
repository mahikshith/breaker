# 15 - Full level concept boards

Purpose: generate one **concept board** for a level proposal: a phone-shaped playfield mock on the left and feature panels on the right, like the Gatehouse Siege board the owner loved (`design/phase2/img/kit-gatehouse-siege-v1.png`, copied to `examples/concept-board-gatehouse-siege.png`). A board is a **direction choice**, not production proof; it shows the owner what the level could look and feel like before anything is built.

Use with `00-style-block.md`, reference 1 (and 2) from `references.md`, plus the character and machinery images that appear in the level. Pair it with a level design from `20-game-design.md` so the board shows the real floors, hazards and powers.

## Anatomy of the board that worked (1536 x 1024, landscape)

| Zone | Size | Contents |
|---|---|---|
| **Phone playfield** (left) | About 45 percent of the width, one tall portrait panel with a thin rounded outline, no photoreal phone | Slim HUD: round pause button top-left, three hearts, a score pill top-right, a small "FLOOR 2 / 3" pill. Villain at the top on or beside a big structure; machinery below it; shaped rows of **equal-sized** glossy bricks; a physical hazard mid-flight (a bell rolling down a ramp); chrome ball and a Kit paddle near the bottom with a small 3-pip ring; **Kit's round face-only orb at the lower left**; the **lower quarter empty** for the reaction lane. Dark calm castle background behind all of it |
| **Title block** (top right) | Big title in a rounded display face, warm gradient with a dark outline; a one-line subtitle with thin rules either side | Short and punchy: "GATEHOUSE SIEGE", "Kit breaks in . Korr holds the gate" |
| **Hero panel** | A wide panel, the largest on the right | The level's main props, the hero (Kit with his heater shield) and a **large, premium render of the villain** (Korr in his armour). This is where the quality shows |
| **Three floor or beat panels** | Three small equal panels in a row | One physical moment each, each with a very short caption: "1 . DRAWBRIDGE CRASH", "2 . MURDER HOLES", "3 . INNER GATE DUEL WITH KORR" |
| **Power strip** | A wide panel along the bottom | The new power: the hero, a title ("RAM BALL"), a 2 to 3 line description, the 1/3, 2/3, 3/3 steps on the paddle, and the result (a giant ball scattering bricks) |

Why it worked: premium render quality, dark calm background with glossy foreground, metal-banded wood and stone machinery, an armoured boar villain with a strong expression, and every panel explained by a physical cause and effect rather than arrows and diagrams.

## The rules that matter most

1. **Board text is the only text allowed in any image**, and it must be short: title, subtitle, panel captions of 4 words or fewer, one short power description. If Copilot garbles letters, keep the layout and tell us; we re-letter or never ship it. No fine print, no paragraphs.
2. **Identical-sized coloured rectangular bricks.** No tiny required precision targets. Bricks are glazed ceramic with the usual palette.
3. **The lower quarter of the phone panel is empty** (the paddle sits almost at the bottom; the ball needs room). The central thumb lane is clear. Only the hero's small face orb at the lower left (warm copper or sage ring, not blue); no full body blocking controls, no bottom track.
4. **Keep rules visible.** Indestructible anchors look different by shape and material. A suggested ball route is physically open. Hazards show a clear warning pose (a snort, a glow).
5. **Backgrounds calm and dark**, no torches, no lanterns, no hazard stripes, no bright planets. Warm accents only on small foreground objects.
6. **Existing cast keeps its identity.** If Kit, Lumi, Korr, Nerra or Gnash appear, they must match the attached references; "do not redesign either hero".
7. **Villains have their own anatomy** and a different goal each time; no repeated cage-and-princess ending. No recoloured serpents.
8. **Phone layout honesty.** The HUD is slim and the safe areas (iPhone 393 x 852, insets 59 and 34; Android 412 x 915, insets 32 and 24) are respected. Boards are composition studies, not literal measurements; the real layout is checked later.
9. **Physical action studies**, not magic: three poses of a mechanical action (wind-up, contact, recovery) with clear cause and effect.
10. **No "generic dashboard".** Not crowded, not a flat vector info-graphic. Plenty of dark negative space and a clear hierarchy.

## Fields

| Field | Example |
|---|---|
| `[LEVEL TITLE]` | SERPENT RIVALS |
| `[SUBTITLE]` | Gnash and Mooncoil hunt Lumi |
| `[STORY PURPOSE, ONE LINE]` | two serpents hunt Lumi along opposite tunnels; bait them into a clash |
| `[SETTING AND PALETTE]` | a dark tower with two window tunnels on opposite walls; slate and plum; emerald and violet accents on the serpents |
| `[PHONE: TOP]` | Gnash (emerald) in the left tunnel mouth, Mooncoil (violet) in the right |
| `[PHONE: MIDDLE]` | two lures (bright brick rows), a shared chamber in the centre |
| `[PHONE: BRICKS]` | 4 short rows of equal glossy bricks in teal, coral, violet and ivory |
| `[PHONE: HERO AND CONTROLS]` | Lumi's face orb lower left; pink-gold paddle |
| `[HERO PANEL]` | both serpents rendered large, facing each other, snapping |
| `[PANEL 1, 2, 3 CAPTIONS]` | LURE / CLASH / DIZZY |
| `[POWER STRIP]` | Lullaby: a song wave calms one serpent for 4 s |
| `[REFERENCES ATTACHED]` | gatehouse board, lumi-breaks-out board, emerald contact sheet |

## Template

```text
[PASTE STYLE BLOCK]

Create one polished premium fantasy mobile game CONCEPT BOARD, landscape 1536 x 1024. This is a new BREACH level proposal, not a finished gameplay screenshot. Level: "[LEVEL TITLE]". Story purpose: [STORY PURPOSE, ONE LINE]. Setting and palette: [SETTING AND PALETTE].
LAYOUT. LEFT about 45 percent: one large edge-to-edge PORTRAIT PLAYFIELD panel with a thin rounded outline (no photoreal phone). Slim calm HUD at the top: round pause button at top-left, three hearts, a small score pill at top-right, a small floor pill. Top of the playfield: [PHONE: TOP]. Middle: [PHONE: MIDDLE]. Bricks: [PHONE: BRICKS], identical sizes, no tiny precision targets. Bottom: a chrome ball and a paddle almost at the bottom, [PHONE: HERO AND CONTROLS]; the lower quarter is EMPTY and dark; the centre lane is clear. Calm dark background, several stops darker than the foreground.
RIGHT about 55 percent: a large title "[LEVEL TITLE]" in a rounded playful display face with a warm gradient and a dark outline, with a thin subtitle line "[SUBTITLE]". Under it, one wide HERO PANEL: [HERO PANEL] rendered large and premium. Under that, three small equal panels, each one physical moment, captions "[PANEL 1, 2, 3 CAPTIONS]". At the bottom, one wide POWER STRIP: [POWER STRIP], with three small steps showing the charge and the result.
CHARACTERS. Use the attached references as precise local identity references: retain each character's design, colours and proportions; do not redesign them. Villains have their own anatomy and motion.
STYLE. Premium high-detail 3D-rendered toy quality, glazed ceramic tiles, real clearcoat reflections, polished metal, soft studio highlights, rich but restrained colours, readable silhouettes, expressive faces with visible eyelids, brows and mouths. Physical cause and effect in every panel (no arrows, no magic trails). Text is short and legible: title, subtitle, three captions and one short power description only; no paragraphs, no fine print. No torches, no lanterns, no hazard stripes, no bright planets.
Consistency: the finish, light and quality of the attached Gatehouse Siege board; different level, different layout.
[PASTE NEGATIVE LIST, EXCEPT the line about baked-in text and UI]
```

## Worked example: Serpent Rivals

```text
Premium portrait mobile brick-breaker game art, "BREACH" house style. Glossy 3D-rendered toy-scale look, as if rendered in Blender Cycles. Warm key light from the top-left (#FFDBB8), cool blue fill from the right (#8CA6FF), soft pink bounce from below (#FF80A6), medium-high contrast, saturated but never neon, minimal yellow. Dark calm backgrounds, expressive faces.

Create one polished premium fantasy mobile game CONCEPT BOARD, landscape 1536 x 1024. This is a new BREACH level proposal, not a finished gameplay screenshot. Level: "SERPENT RIVALS". Story purpose: two serpents, emerald Gnash and violet Mooncoil, hunt Lumi along opposite tunnels in a tower; the player baits them into a clash. Setting and palette: a dark tower interior, slate and plum walls (#2A2740 to #141831), two arched window tunnels on opposite walls; emerald (#22C4B0) and violet (#8F5CF0) accents on the serpents only.
LAYOUT. LEFT about 45 percent: one large edge-to-edge PORTRAIT PLAYFIELD panel with a thin rounded outline (no photoreal phone). Slim calm HUD: round pause button top-left, three hearts, a score pill top-right, a small "TOWER 1/3" pill. Top of the playfield: Gnash's emerald head emerging from an arched tunnel mouth at the upper left, Mooncoil's violet head from the tunnel at the upper right, both with different hunting faces. Middle: a shared chamber in the centre between the tunnels, with one bright lure brick row on each side. Bricks: four short rows of equal-sized glossy teal, coral, violet and ivory bricks, with a couple of small cache gems, no tiny precision targets. Bottom: a chrome ball and a pink-gold paddle almost at the bottom, Lumi's round face-only orb at the lower left with a warm copper ring; the lower quarter is EMPTY and dark; the centre lane is clear. Calm dark stone background, several stops darker than the foreground.
RIGHT about 55 percent: a large title "SERPENT RIVALS" in a rounded playful display face with a warm gradient and a dark outline, with a thin subtitle line "Gnash and Mooncoil hunt Lumi". Under it, one wide HERO PANEL: the two serpents rendered large and premium, facing each other in the shared chamber, snapping at the same moment, each with an angular faceted head, brow ridges, strong expressive eyes with lids, open mouths with fangs; they are completely different skins (emerald and violet) but both keep the angular head of the attached references. Under that, three small equal panels, each one physical moment: "LURE" (a bright lure brick breaks and Gnash leans toward it), "CLASH" (both heads meet in the chamber), "DIZZY" (both recoil, dizzy eyes, a power-up capsule drops). At the bottom, one wide POWER STRIP: "LULLABY: calms one serpent for 4 s", with Lumi's pearl crescent-and-note icon and a yawning, swaying serpent.
CHARACTERS. Use the attached references as precise local identity references: Gnash is the emerald angular-headed serpent with coral-pink brows and lime eyes; Lumi's pink-gold paddle and face orb match the Lumi board. Do not redesign them. No ball-chain bodies, no round heads.
STYLE. Premium high-detail 3D-rendered toy quality, glazed ceramic tiles, real clearcoat reflections, polished metal, soft studio highlights, rich but restrained colours. Physical cause and effect in every panel; no arrows, no magic trails. Text is short and legible: title, subtitle, three captions and the short power line only; no paragraphs. No torches, no lanterns, no hazard stripes, no bright planets, no pixel art.
Consistency: the finish, light and quality of the attached Gatehouse Siege and Lumi Breaks Out boards; a different level and layout.
```

Attach: `design/phase2/img/kit-gatehouse-siege-v1.png`, `design/phase2/img/lumi-breaks-out-v1.png`, `art/snake-emerald/proof/contact.png`.

## Iteration notes

- If the playfield panel gets crowded, remove one hazard before shrinking the bricks. Fewer, clearer things.
- If the villain is weak, regenerate **only the hero panel** as its own image ("a large premium render of [VILLAIN] in [POSE], same style as the attached board") and say we will composite it.
- If the text is wrong, ignore it and say so; do not spend iterations on spelling.
- Ask for **two** boards (A and B directions) so the owner can choose; label them "A" and "B" in the file names, not in the images.

## Output spec

| Output | Spec |
|---|---|
| Board | PNG, 1536 x 1024 landscape, opaque, short captions only |
| Extras | The hero villain panel alone on a plain dark navy background; the playfield panel alone (portrait crop) |
| Hand-back note | Which level doc it illustrates, the floors or beats shown, anything that disagrees with the design doc |

Filing: `design/phase2/img/<level>-v1.png` for review (this is how the earlier boards are stored), the prompt in a `.txt` beside the source image, and later archived in `artwork-library/`. Nothing on a board is built until the owner picks it.
