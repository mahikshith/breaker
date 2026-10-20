# Starflight weapon family

Source image: `weapons-source.png`. Raster production, 2026-10-20.
Style reference: `assets/space-a/carrier_hull.png`. The reference contributes metal,
lighting and colour language; no existing ship was replaced.

Prompt: Create a production weapon effects sprite sheet for a premium top-down
mobile space shooter. Exactly six isolated effects in a 3×2 grid with transparent
background and generous spacing: upward cyan heavy plasma, downward coral enemy
round, upward violet hyper round, cyan muzzle starburst, orange mechanical plasma
explosion, teal crystalline stasis burst. Glossy dimensional rendering, brilliant
cores, short turbulent tails, readable at 24–64 pixels. No text, labels, UI or ships.

Extraction: `python art/starflight/extract_weapons.py`. The actual alpha is retained,
all cells receive an 8-pixel transparent border, and PNG metadata is omitted.
The runtime adds translation, recoil, rotation and transient scaling to these
static sprites; this is not a rendered frame-by-frame animation atlas.
