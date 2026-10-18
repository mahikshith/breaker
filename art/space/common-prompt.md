# Common space foreground atlas

Approved references: design/phase1/img/space-carrier-a.png and space-relay-b.png, LEFT gameplay panes only. This atlas supplies independent common foreground parts, without characters or companions. The originals remain unchanged.

Use case: stylized-concept.
Asset type: transparent component atlas for a portrait mobile brick-breaker game.

Generate one coherent nine-part source atlas in a clean 3-column by 3-row layout on genuine transparency. Reference image1 is Carrier Breakout A; reference image2 is Relay Raiders B. Match the polished glossy cyan/violet enamel, crisp silver bevels, restrained small cyan lights and broad readable forms of their LEFT gameplay panes. Do not include any characters, creatures, workers, faces, portraits, ships, scenery, text, labels, letters, captions, borders, panels, UI, shadows on a ground plane or watermark.

Use the same front orthographic view for every part, with only a small visible upper bevel, and the same warm upper-left key/cool violet fill. Smooth toy-like enamel, polished dark silver metal, tiny restrained white highlights; avoid noisy scratches. Objects are isolated, whole and separate, with very generous transparent gutters. Every row and column contains exactly one listed object centered in its own cell; no extra icons or duplicates.

Row1, left: a horizontal glossy bright cyan beveled rectangular brick, visible aspect1.8:1, matching the rounded cyan bricks in reference2. Broad luminous cyan face, darker blue lower bevel, small pale top bevel; clean face, no text.
Row1, middle: the exact same horizontal beveled rectangular brick design, in glossy violet, visible aspect1.8:1, matching reference2 violet bricks; same view, bevel and highlight.
Row1, right: a square dark-silver armoured clamp brick matching reference2: thick solid graphite bevel perimeter, four raised diagonal silver X braces meeting at one round central rivet, readable as a heavy cross-braced metal obstacle. Aspect1:1, no cyan face, no lettering.

Row2, left: a horizontal dark-silver crew-lock mounting frame, aspect1.8:1, matching the dark lock tile in reference1. Rounded thick bevel perimeter with four small corner fasteners and a subtle violet status light at its top. A rectangular center aperture about45% of width and55% of height must be genuinely transparent all the way through, without glass, fill, worker, face or emblem; it will accept a separate payload behind the frame.
Row2, middle: a small horizontal cyan player paddle matching the paddle at the bottom of reference2. Visible aspect4.75:1, thick glossy cyan illuminated middle and short silver rounded metal end caps, restrained dark seams and clean silhouette. No lettering, no floor shadow, no long glow streak.
Row2, right: one circular white luminous pearl ball, visible aspect1:1, strong clean white center, subtle cool blue edge, very tight soft halo; no trailing streak, no tiny satellite objects.

Row3, left: one compact horizontal collectible capsule, aspect1.71:1, cyan/violet metal and clear glossy enamel with silver end caps. Its broad center contains only a simple bright white pictogram of two parallel laser bars, no letters.
Row3, middle: the exact same capsule housing, aspect1.71:1, but violet center with a bright white pictogram of three small balls branching apart; no letters.
Row3, right: the exact same capsule housing, aspect1.71:1, but cyan center with one bright white shield outline; no letters.

All glyphs must remain simple enough to identify on a24×14pixel collectible. No text is permitted. Preserve broad forms over ornate microdetail. Keep each component's glow inside its own area, leaving empty alpha between parts. Aim for a large square atlas, about1536×1536, with at least100 transparent pixels between all silhouettes and the outer canvas. The atlas is source material that will be cropped and normalized deterministically, so the nine silhouettes must never touch or overlap. Genuine transparent RGBA background, not checkerboard art.

## Canonical normalization contract

Three pixels per world unit, linear filtering, stable center pivots. Visible targets cyan/violet/crewlock36×20u; armour20×20u; paddle76×16u; ball12×12u; capsule24×14u. Add four world units of alpha gutter on all sides: final cells132×84,84×84,252×72,60×60 and96×66 pixels respectively. Aspect differences in generated parts must be recorded; do not distort them to fit.

Names: brick_cyan.png, brick_violet.png, brick_armour.png, brick_crew_lock.png, paddle.png, ball.png, capsule_laser.png, capsule_split.png, capsule_shield.png. Original returned atlas is preserved byte-for-byte, crops are lossless RGBA, and native normalized siblings contain no PNG text metadata. An open central crew aperture must be verified before admission.
