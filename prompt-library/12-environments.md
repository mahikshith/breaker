# 12 - Level environments (backgrounds)

Purpose: generate the **standalone environment layer** behind a level: castle, tower, reliquary or space. The result is a finished background only. Bricks, characters, machinery, power-ups, HUD and the ball are layered on top by the game, so none of them may be drawn in.

Use with `00-style-block.md` and references 19 and 4 from `references.md` (and 22 for space).

## The rules that matter most

1. **Background never outshines the foreground.** Calm, dark, desaturated, several stops below the bricks and characters. The white ball must be easy to find. (Brief, section 2.)
2. **No distractions.** The owner removed dungeon lights, lanterns, torches, bright planets, window bars and hazard stripes. Do not put them back. A small, very dim lunar window or a faint glow at the extreme edges is the most you get.
3. **Quiet upper half.** Where bricks and characters will sit, the wall is a tall, broad, flat, dark recessed surface with no objects or symbols. Structural detail (pillars, arches) lives only at the extreme left and right edges and in the lower floor.
4. **Lots of dark negative space in the lower half** so a white ball is visible. Floor is deep, dark, polished slate or stone with only faint inlay.
5. **Nothing that looks collidable** unless it truly is. "A decorative arch is not evidence of a playable route." Do not paint platforms, ledges, ramps, bars or cages that the player might mistake for physics. Those are separate game layers.
6. **No UI, text, icons, counters, frames, borders or mock-up.** The game draws the HUD, in the safe areas.
7. **Differentiate by theme, not by brightness.** Each level needs its own look (a moonlit obsidian reliquary is "distinctly different from a warm medieval castle corridor"), but each stays dark.
8. **Atmospheric depth, rich bevels and carved stone**; soft ambient occlusion; no glowing fog obscuring gameplay.

## Sizes and framing

| Item | Value |
|---|---|
| Aspect | Portrait. Ask for 9:19.5; if the tool only offers 9:16 or 1:2, use that and we extend or crop |
| Size | 1024 x 2048 or larger. Existing plates: Vault 720 x 1640 (2 px per unit, 360 x 820 units), Mooncoil 941 x 1672, Bellforge 631 x 1240, Starflight 1024 x 2048 |
| Full bleed | The picture stretches to the phone and runs under the notch and home bar. So no important detail at the top 8 percent or bottom 6 percent |
| Phones | 393 x 852 (safe insets 59 top, 34 bottom) and 412 x 915 (32 top, 24 bottom) |
| Foreground zone | Upper half: brick field. Lower quarter: the paddle and reaction lane, kept empty |
| Depth | Camera faces the wall straight on; mild depth cues only |

## Fields

| Field | Example |
|---|---|
| `[THEME]` | a moonlit underground reliquary carved from obsidian and pale silver stone |
| `[DIFFERENT FROM]` | a warm medieval castle corridor |
| `[PALETTE]` | restrained cool lavender and desaturated teal lighting; near-black navy upper wall |
| `[UPPER HALF]` | tall, broad, flat dark recessed stone wall, quiet and almost black navy |
| `[EDGES]` | thin silver structural pillars along the extreme left and right edges |
| `[LOWER HALF]` | deep dark polished slate floor with broken silver inlay circles; a few low crystal clusters only at the extreme edges |
| `[FAR DETAIL]` | a distant arched lunar window, reflected very subtly at the far edges, not bright at centre |
| `[ABSOLUTELY NOT]` | warm torches, red banners, glowing fog |
| `[REFERENCES ATTACHED]` | mooncoil/background.png, 07-vault-focus-aim.png |

## Template: level background

```text
[PASTE STYLE BLOCK]

Production background asset for a premium portrait mobile fantasy brick-breaker game, full-bleed portrait composition ([ASPECT]). [THEME], distinctly different from [DIFFERENT FROM]. Stylized polished 3D game art, lavish material quality, soft cinematic ambient occlusion, [PALETTE]. Camera faces a [UPPER HALF] in the UPPER HALF (where gameplay bricks and characters will be layered separately): this area must be quiet, empty, without objects or symbols. [EDGES]. In the LOWER HALF: [LOWER HALF]. [FAR DETAIL]. Atmospheric depth, rich bevels and carved stone, lots of dark negative space for an easily visible white ball. [ABSOLUTELY NOT].
NO characters, snakes, princesses, bricks, UI, text, logo, icons, counters, frames, borders, or mock-up. This is the finished standalone environment layer, not a game screenshot. Dark values, muted saturation; foreground gameplay must dominate. Render a complete high-quality portrait background.
Consistency: match the attached reference for darkness, material quality and composition; do not copy its architecture.
```

## Worked example 1: reliquary (the real production prompt)

This is the prompt that produced `art/mooncoil/reliquary-background-source.png` (941 x 1672), recorded in `art/mooncoil/BACKGROUND.md`. Reuse it as a model; change the theme words for a new level.

```text
Production background asset for a premium portrait mobile fantasy brick-breaker game, full-bleed 9:16 composition. A moonlit underground reliquary carved from obsidian and pale silver stone, distinctly different from a warm medieval castle corridor. Stylized polished 3D game art, lavish material quality, soft cinematic ambient occlusion, restrained cool lavender and desaturated teal lighting. Camera faces a tall broad flat dark recessed stone wall in the UPPER HALF (where gameplay bricks and characters will be layered separately): this area must be quiet, empty, almost black navy, without objects or symbols. Thin silver structural pillars along the extreme left and right edges. In the LOWER HALF, a deep dark polished slate floor with broken silver inlay circles and a few low crystal clusters ONLY at the extreme edges. A distant arched lunar window or small half moon reflected very subtly at the far edges, not bright at center. A quiet weathered silver reliquary dais faintly visible deep behind the lower center, lots of dark negative space for an easily visible white ball. Atmospheric depth, rich bevels and carved stone, no glowing fog obscuring gameplay. No warm torches, no red banners, no existing castle hallway look. NO characters, snakes, princesses, bricks, UI, text, logo, icons, counters, frames, borders, or mockup. This is the finished standalone environment layer, not a game screenshot. Dark values, muted saturation; foreground gameplay must dominate. Render a complete high quality portrait background.
```

Attach: `assets/mooncoil/background.png`.

## Worked example 2: castle gatehouse hall (for Gatehouse Siege)

```text
[style block, short version]

Production background asset for a premium portrait mobile fantasy brick-breaker game, full-bleed portrait composition (9:19.5, tall). A massive castle gatehouse interior hall at dusk, carved from dark granite blocks (#4A4F6E in shadow), distinctly different from the moonlit reliquary and from the foundry bell tower. Stylized polished 3D game art, soft cinematic ambient occlusion, restrained cool slate-blue and desaturated plum light, almost no warm colour. Camera faces a tall broad flat dark stone wall in the UPPER HALF (where gameplay bricks, a drawbridge, a portcullis and a boar boss will be layered separately): this area must be quiet, empty, near-black navy (#141831 to #0A0C18), with only faint block joints, no objects or symbols. Heavy stone buttresses and thick iron-banded oak beams only along the extreme left and right edges, fading into shadow. In the LOWER HALF, a deep dark flagstone floor with a faint worn cobble pattern, lots of dark negative space for an easily visible white ball. High in the far upper corners, one very small dim arched slit window with a cold blue glow, not bright, not centred. Atmospheric depth, rich bevels, no glowing fog.
No torches, no lanterns, no candles, no banners with bright colours, no fire, no hazard stripes. NO characters, bricks, bars, gates, bridges, UI, text, logo, icons, frames, borders or mock-up. Finished standalone environment layer, not a game screenshot. Dark values, muted saturation; gameplay foreground must dominate.
Consistency: match the attached references for darkness and material quality (the dark plate in the in-game screenshot; the quiet upper half of the Mooncoil background). Do not copy their architecture.
```

Attach: `assets/mooncoil/background.png`, `docs/screens/07-vault-focus-aim.png`.

## Worked example 3: tower shaft (for Lumi's tower)

```text
[style block, short version]

Production background asset for a premium portrait mobile fantasy brick-breaker game, full-bleed portrait composition (9:19.5, tall). The inside of a tall castle tower shaft seen side-on, dark plum-grey masonry (#2A2740 to #141831), night sky glimpsed as a very faint deep-blue gradient through a few small arched openings at the extreme left and right edges only. Camera faces a broad flat dark brick wall in the UPPER HALF (where gameplay bricks, a hatch, windows and a serpent will be layered separately): quiet, empty, with only faint mortar lines. Slim stone pilasters along the extreme left and right edges. LOWER HALF: deep dark stone floor and a faint stair landing edge at the far left, mostly empty dark negative space for a visible white ball. NO windows drawn inside the central area (windows are separate game layers), no torches, lanterns or candles, no bars, no glow.
NO characters, bricks, UI, text, logo, frames or mock-up. Finished standalone environment layer. Dark, muted, calm; foreground must dominate.
```

Attach: `assets/mooncoil/background.png`, `art/castle/proof/window.png` (to show the window kit that will be layered on top, so the model leaves the wall plain).

## Worked example 4: space (breaker levels; for starfighter backgrounds see `30-starflight.md`)

```text
[style block, short version]

Finished 1024 x 2048 portrait BACKGROUND for a premium portrait mobile brick-breaker set in space. Nearly black midnight navy (#0A0C18 to #141831), a few very dim desaturated violet and teal nebula clouds only at the far left and far right edges, sparse tiny distant stars, subtle faint dust with smooth gradients (not flat). The central 70 percent is calm, very dark open space so glossy bricks, a white ball and small ships stay clearly readable. At most one tiny, very dim, desaturated distant planet at an extreme top corner, never bright. No bright nebula, no sun, no ringed planet, no ships, no hangar, no characters, no bricks, no text, no HUD, no panels, no streaks or lines that resemble projectiles. Entire image opaque, professionally rendered, quiet and restrained; foreground gameplay must dominate.
```

Attach: `assets/starflight/background.png`.

## Output spec

| Output | Spec |
|---|---|
| Background | PNG, opaque, portrait, 1024 x 2048 or larger (9:19.5 if possible, else 9:16), no text, no UI |
| For vertical scrolling (space) | Top and bottom edges fade to the same near-black value so the image tiles seamlessly; say so in the prompt |
| Optional extras | A second version with the upper half even quieter; a left-edge and right-edge detail strip (pillars, buttresses) on transparency |
| Hand-back note | Intended level, aspect ratio used, any element that might read as collidable |

Filing: `art/<family>/` next to a `BACKGROUND.md` holding the exact prompt (pattern: `art/mooncoil/BACKGROUND.md`), runtime copy with empty PNG metadata, packed to WebP by `tools/pack_art.py`. The game places a subtle dark recess beneath the brick bounds and stretches the picture to the logical phone canvas.
