# 13 - UI art and icons

Purpose: generate **text-free art pieces** for the interface: power icons (emblems), counter gems (pips), face-orb rings, and HUD frame pieces. The game draws every letter and number in code (Lilita One for game text with a dark outline of 0.16 x the font size and a soft drop shadow; Rubik 600 for numbers), and draws the cards and buttons itself. You are making the shiny things that sit on them.

Use with `00-style-block.md` and references 16, 17 and 18 from `references.md`.

## The rules that matter most

1. **One emblem on transparency, no card, no label, no text.** The menu cards are code-drawn. (`art/power_icons/README.md`.)
2. **One idea per icon, strong silhouette.** It must be recognisable at 40 x 40 units (about 120 px) and at the tiny native size. Test by squinting.
3. **One family, one lighting, one finish.** Every icon in a set shares the Vault lighting and the glossy-toy finish, like the nine in `references.md` #16. Kit's set: steel, brass, blue, coral fletching. Lumi's set: pearl, rose, gold, a musical note motif shared by all of hers.
4. **Never rely on colour alone.** Danger or state must also change shape or expression (the serpent meter uses colour plus the princess icon's expression). Text contrast at least 4.5:1 where text sits on art.
5. **Minimal yellow.** Gold is a small accent. Level accents: Invasion pink `#FF5D8F`, Vault gold `#F4C542` (accent only).
6. **44 pt minimum touch targets**, so interactive art must be designed with a generous, clear shape.
7. **Safe areas.** Nothing interactive in the notch or home-bar regions. Test phones 393 x 852 (insets 59 top, 34 bottom) and 412 x 915 (32 top, 24 bottom).
8. **Layout lives in code.** HUD: slim bar (pause top-left, level meter, score top-right), playfield right under it, paddle raised above the thumb, a dark control deck below it with a track, lives, power timers and AIM pips. The face-only orb sits at the lower left. You supply pieces, not the screen.

## Sizes

| Piece | Size |
|---|---|
| Power icon | 120 x 120 px = 40 x 40 units (3 px per unit), centred, about 8 percent padding |
| Counter gem (pip) | 54 x 54 px = 9 x 9 units (6 px per unit): empty socket, gold, blue, rose |
| Face-orb ring | about 56 units across including ring; the face portrait is a separate asset (see `10-characters.md`) |
| Paddle skin | left, middle, right parts, each 16 x 20 units (48 x 60 px) |
| HUD frame pieces | small pieces we slice into 9 parts; ask for corner radius about 8 units, border 3 units |

Ask for **large** (1024 px or more) clean art. We downscale.

## Fields: power icon

| Field | Example |
|---|---|
| `[POWER NAME]` | Molten Ball |
| `[OWNER]` | Kit (steel set) or Lumi (pearl-and-rose set) |
| `[WHAT IT DOES, IN ONE LINE]` | the ball pierces one brick row and leaves a short ember trail |
| `[EMBLEM]` | one chrome ball with a glowing orange-coral crack pattern, a short ember tail |
| `[MATERIALS AND COLOURS WITH HEX]` | chrome ball, coral #FF6F61 and amber #FF8A3D heat glow (small), brass collar #C9A24A |
| `[SET SIBLINGS]` | Brick Ward, Arrows, Cosmic, Ball Fan |
| `[REFERENCES ATTACHED]` | icons.png, menu-frost.png |

### Template: power icon set

```text
[PASTE STYLE BLOCK]

A set of [N] power emblem icons for BREACH, one per power: [LIST: POWER NAME, EMBLEM, MATERIALS AND COLOURS WITH HEX]. Each icon is a single glossy 3D-rendered object in a strong, simple silhouette, centred, orthographic front view, lit by the warm top-left key with cool right fill, crisp highlights, clear coat, soft bevels, readable at 40 x 40 pixels. Same lighting, same scale and same finish across the whole set. Owner families: Kit = steel, brass, blue and coral; Lumi = pearl, rose, gold and a musical note.
Layout: one image, 2048 x 2048, transparent background, [GRID] equal cells, one icon per cell centred with at least 10 percent padding, no card, no frame, no label, no number, no text, no shadow on the background.
Consistency: match the attached reference icons exactly for finish, lighting, bevel size and level of detail. Do not add more detail than they have.
[PASTE NEGATIVE LIST]
```

### Worked example: Heat streak icons (from `design/phase2/new-concepts.md`)

```text
Premium portrait mobile brick-breaker game art, "BREACH" house style. Glossy 3D-rendered toy-scale emblems, as if rendered in Blender Cycles. Warm key light from the top-left (#FFDBB8), cool blue fill from the right (#8CA6FF), soft pink bounce from below (#FF80A6), medium-high contrast, saturated but not neon, minimal yellow.

A set of 4 power emblem icons for BREACH, the "Heat streak" family, one per cell: (1) HEAT x2: a polished chrome ball with a thin warm coral (#FF6F61) glow line around its equator; (2) HEAT x3: the same chrome ball, with a brighter amber (#FF8A3D) crack pattern across it and a short ember tail; (3) MOLTEN: the same ball glowing orange-coral from within through glazed cracks, a short bright ember trail, a small brass collar (#C9A24A); (4) COOL DOWN: the same chrome ball with a pale blue (#7FD6FF) frost rim and one small ice chip. Each icon is a single glossy 3D object in a strong, simple silhouette, centred, orthographic front view, readable at 40 x 40 pixels. Same lighting, scale and finish for all four; the ball is identical in all four so the heat steps read as one object getting hotter.
Layout: one image, 2048 x 2048, transparent background, a 2 x 2 grid of equal cells, one icon per cell, centred, at least 10 percent padding, no card, no frame, no label, no number, no text, no shadow on the background.
Consistency: match the attached reference icons exactly for finish, lighting, bevel size and level of detail (the Ram Ball and Cosmic icons are the closest). Do not add more detail than they have.
Avoid: pixel art, flat vector clip-art, neon glow, particle halos, long light trails, fire clip-art, text, numbers, logo, UI, card or frame.
```

Attach: `art/power_icons/proof/icons.png`, `art/power_icons/proof/menu-frost.png`.

## Counters and pips

Counters are tiny jewels in a socket: dark, glossy, readable at 9 units. Four states from one socket: empty, gold (streak, health, charge), blue (Kit-themed), rose (Lumi-themed).

```text
[PASTE STYLE BLOCK]

Production sprite sheet of counter gems for BREACH: a round dark gunmetal socket ring with a thin brass rim, a faceted octagonal jewel inside, orthographic front view, flat top-left key light, crisp highlight, readable at 9 x 9 pixels. Four variants in one row, transparent background, equal cells, identical socket and size: (1) EMPTY: black glossy dome, no jewel lit; (2) GOLD: amber-gold #F4C542 faceted jewel; (3) BLUE: #4F9DFF jewel; (4) ROSE: #FF5D8F jewel. Then a second row with the same four at a very small preview size. No text, no numbers, no card, no shadow on the background.
Consistency: match the attached counter-gem proof exactly. Do not enlarge or change the socket.
[PASTE NEGATIVE LIST]
```

Attach: `art/fx_kit/proof/fx.png`. Pip use: lives, charge, streak steps (1/3, 2/3, 3/3 on the Ram Ball ring), AIM pips.

## HUD frame pieces

Ask for pieces, never a full screen. They must be calm: the HUD sits on top of the game, so it is slim and dark.

| Piece | Description |
|---|---|
| Pill (score, floor) | Rounded dark-glass capsule with a thin brass or silver rim, empty inside, 9-slice friendly |
| Pause button | Round dark button, thin rim, no icon baked in (the code draws the bars) |
| Meter trough | Long dark inset channel with a glossy rim, empty |
| Face-orb ring | Round ring with a charge track and one gap-free circle; warm copper or sage charge colour, never yellow-dominant |
| Panel card | Dark rounded panel with rim, for power menus, no content |
| Paddle control track | Dark deck panel with a track groove and a grip knob |

```text
[PASTE STYLE BLOCK]

A small kit of empty HUD frame pieces for BREACH, flat front view, transparent background, one piece per cell in a [GRID] grid, equal cells with 10 percent padding: [PIECES AND COLOURS WITH HEX]. Material: dark blued gunmetal glass with a thin polished [BRASS / SILVER] rim, soft bevel, crisp highlight on the top edge, subtle pink bounce on the lower edge. Corner radius about 8 units and border about 3 units relative to piece height. The inside of every piece is EMPTY: no text, no number, no icon, no gradient fill that would clash with the content the game draws. Must stay calm and dark so it never outshines the playfield.
Consistency: match the attached reference UI (the Armoury card and the round face orb) for rim colour, darkness and gloss.
[PASTE NEGATIVE LIST]
```

Attach: `art/power_icons/proof/menu-frost.png`.

## Output spec

| Output | Spec |
|---|---|
| Icon set | 2048 x 2048 PNG, transparent, equal cells, one icon per cell, no text |
| Single icon | 1024 x 1024 PNG, transparent, centred |
| Pips | One row of 4 states plus a native-size row, transparent |
| HUD pieces | PNG, transparent, empty interiors |
| Hand-back note | Power name per cell (row, column), owner (Kit or Lumi), and any state variants |

Filing: `art/<family>/source/` as the style reference for a Blender rebuild (`art/power_icons/power_icons.py` builds every emblem from shared helpers `slab`, `sphere`, `torus`, `rod`, `cone`, `note`; ids match the level power ids), output to `assets/power-icons/<id>.png` (120 x 120). Counter parts follow `art/fx_kit/fx_kit.py`.
