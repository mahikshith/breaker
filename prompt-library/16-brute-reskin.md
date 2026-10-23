# New brute on the Yeti's physics (bull, bison, great ape, ...)

The Frost Warden's moves (idle, ground pound, dash and wall smash, flinch, dazed, defeated) are code plus measured collision. A new four-legged or ape-like brute only needs new pictures in the same poses. Nothing about the physics is redone.

## The pipeline (one command after the art arrives)

1. Cut the sheet into frames with the same names as `assets/round3/warden/` (use `art/round3/cut.py`, which cuts by bounding box). Put them in `assets/round3/<name>/`.
2. Run `python art/round3/build_warden_atlas.py assets/round3/<name> assets/<name>`. It builds the 256x228-cell atlas and measures every frame's collision from its own pixels.
3. In a level, pass the new atlas as the Frost art: `new Frost(W, H, s, mode, ART.<name>)`. Pack it in `tools/pack_art.py` the same way as `frostWarden`.

## Frames needed (25, all facing right unless named _l)

| Row | Frames | File names |
|---|---|---|
| Idle breathing | 4 | idle_0 … idle_3 |
| Ground pound | 3 | pound_windup (fists or forelegs raised high), pound_strike (slam with a burst), pound_recover |
| Hurt | 4 | flinch, dazed (stars, facing viewer), recover, defeated (slumped) |
| Dash, right | 5 | dash_r_crouch (low, gathering power), dash_r_0 … dash_r_3 (charging run) |
| Dash, left | 5 | dash_l_crouch, dash_l_0 … dash_l_3 |
| Wall smash | 4 | smash_r, smash_l (shoulder or horns into a stone wall, debris), dazed_r, dazed_l |

## Prompt (paste once, attach the Yeti sheets as references)

Use the attached Frost Warden sheets as the exact template for pose, framing, scale and lighting. Draw a [BISON / BULL / GREAT APE] boss for a premium portrait brick-breaker game in the same glossy vinyl-toy 3D style: warm key light from the top left, cool fill from the right, soft contact shadow, no outline.

Give it a clear element and silhouette: [e.g. a storm bison with a heavy mane, iron horn caps and crackling blue sparks on its hooves].

Draw the same 25 poses in the same order and rows as the reference sheets: idle breathing (4), ground-pound windup, slam and recover (3), flinch, dazed with stars, recover and defeated (4), dash right with a low crouch plus 4 charging frames (5), the same dash facing left (5), then shoulder smash right, shoulder smash left, dazed right and dazed left (4).

Keep one consistent size and one ground line for every pose. Leave clear gaps between poses. Use a plain flat [#00B140 green] background. No text, no UI, no floor.
