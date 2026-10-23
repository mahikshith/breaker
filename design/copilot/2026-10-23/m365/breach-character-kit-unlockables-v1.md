---
breach_drop: 1
kind: character
slug: kit-unlockables
version: 1
date: 2026-10-23
status: proposal
tool: Copilot Studio
depends_on: ["dragons-hoard", "ember", "bricks-glaze-v2"]
---

# Kit unlockables: 4 paddle skins and 4 swords

## Summary
- There are 4 paddle skins and 4 swords, each tied to a chapter memory: space, serpents, the tide, the dragon, Gatehouse, Lumi.
- They are unlocked by playing only (stars, clears, Hard wins). They are never sold, and the $2.99 unlock does not include them.
- They are cosmetic only. A skin never changes the paddle's hit shape (100x14), and the Ram sweet spot stays visible.
- The sword shows in Kit's face orb, on the victory screen and as a short flourish when the Ram launches, so players actually see it.

## Decisions for the owner
1. Perks: A cosmetic only [RECOMMENDED]; B tiny perks (for example Gatebreaker +0.2 s Ram time, Lullaby Edge +1 aim dot).
2. Where the sword shows: A face orb, victory screen and Ram flourish [RECOMMENDED]; B face orb and victory screen only.
3. Selection: A an Armoury tab on the main menu next to Sound [RECOMMENDED]; B in the pause menu.

## Spec

### Paddle skins
Every skin keeps the chrome top highlight (the ball must stand out against it) and the 34-unit centre sweet-spot panel with its 3 Ram pips (locked P1).

| Skin | Look (hex) | How the paddle art changes | Unlock | Type |
|---|---|---|---|---|
| Starforged | white ceramic plates #EEF1F7 over gunmetal #3A3F55, cyan cockpit seam #3FE0FF (thin) | Endcaps become small ceramic thruster pods; the core stripe becomes a thin cyan glass seam | Clear every Starfighter chapter (1, 3, 4) on any mode | Cosmetic |
| Serpentscale | emerald scale plates #168F83 on the left half shading into violet #7A3CCC on the right, bone rims #D9CBB8 | Endcaps carved as two small serpent heads facing outward (Gnash left, Mooncoil right), eyes closed | 3 stars on The Vault, Mooncoil Reliquary and Serpent Rivals | Cosmetic |
| Tidewrought | sea-glass teal #2E9C93 glaze with oxidised copper bolts #5E8C7A and barnacle chips #E7DCC8 | Endcaps become rounded shell-shaped bumpers; the core is frosted sea glass | Clear Tidewheel Citadel on Hard | Cosmetic |
| Hoardbreaker | obsidian #1A1C2A with copper veins #E8743B and one tiny gold coin inlay at each end #F4C542 | Endcaps become small dragon-claw grips; copper veins run along the body | Clear Dragon's Hoard without waking Ember (its third star) | Cosmetic |

### Swords

| Sword | Look (hex) | Unlock | Type |
|---|---|---|---|
| Brickhaven Blade | steel #C9D2E3 blade, cobalt #2F5BD3 grip, lightning-bolt pommel matching Kit's shield | Earn 10 stars in total | Cosmetic |
| Gatebreaker | broad dark-steel #4A4F6E cleaver blade with brass rivets #B8892E, plum wrap #5A2A4E | Beat Korr in Gatehouse Siege on Hard | Cosmetic |
| Lullaby Edge | pearl #F4EEF2 blade with a rose #FF6FAE ribbon tied at the guard (Lumi's) | 3 stars on Lumi Breaks Out | Cosmetic |
| Wyrmfang | curved bone #D9CBB8 blade made from Ember's fang, obsidian grip #1A1C2A, copper #E8743B guard | Beat Ember on Hard | Cosmetic |

### Where they show
- **Face orb:** the sword's hilt appears over Kit's shoulder.
- **Victory screen:** Kit raises the sword. Scale 0.9 → 1 over 0.25 s, easeOutBack; one blade glint lasting 0.3 s.
- **Ram launch:** a 0.3 s sword-swing silhouette behind the paddle. It is rendered steel, not a light trail.
- **Menu chapter cards:** a small icon on the card of the chapter that unlocks the item.

### Unlock moment
- When an item unlocks, a card appears after the results screen: "Unlocked: Wyrmfang".
- The item spins 0 → 360° on the Y axis over 0.8 s, easeOutCubic, with a ceramic chime.
- An "EQUIP" button (44 pt high, #7BD88F) and a "Later" button (44 pt) sit below it.
- Locked items show as dark silhouettes with the condition in one line, for example "Beat Ember on Hard".

### Kit (unchanged)
- His round cobalt open-face helmet, blue-grey eyes, dark blue armour and blue kite shield with the lightning emblem stay as they are.
- New expressions: **proud** for the unlock card and **heroic** for the victory with the sword.

## Data
```json
{
  "kind": "character",
  "name": "Kit",
  "role": "hero",
  "height_units": 42,
  "silhouette": "unchanged: round cobalt open-face helmet, dark blue armour, blue kite shield with a lightning emblem",
  "personality": [
    "brave",
    "scrappy",
    "kind"
  ],
  "materials": [
    {
      "part": "helmet",
      "hex": "#5A78B8",
      "finish": "cobalt steel"
    },
    {
      "part": "armour",
      "hex": "#24305E",
      "finish": "dark blue glossy plate"
    },
    {
      "part": "shield",
      "hex": "#2F5BD3",
      "finish": "glazed heraldic"
    }
  ],
  "expressions": [
    {
      "id": "proud",
      "game_moment": "unlock card",
      "eyes": "bright, slightly narrowed smile-eyes",
      "brows": "lifted",
      "mouth": "closed confident grin"
    },
    {
      "id": "heroic",
      "game_moment": "victory with sword",
      "eyes": "wide, sparkling",
      "brows": "up and firm",
      "mouth": "open shout of triumph"
    }
  ],
  "poses": [
    {
      "id": "victory-raise",
      "game_moment": "victory screen",
      "seconds": 0.25
    },
    {
      "id": "ram-flourish",
      "game_moment": "Ram launch",
      "seconds": 0.3
    }
  ],
  "collision": "skins never change the paddle hit shape (100x14 capsule, compound circles along the drawn art); the 34-unit centre sweet spot stays",
  "unlockables": [
    {
      "id": "starforged",
      "new": true,
      "name": "Starforged",
      "type": "paddle-skin",
      "look": "white ceramic plates #EEF1F7 over gunmetal #3A3F55, cyan cockpit seam #3FE0FF (thin)",
      "paddle_art": "Endcaps become small ceramic thruster pods; the core stripe becomes a thin cyan glass seam",
      "unlock": "Clear every Starfighter chapter (1, 3, 4) on any mode",
      "perk": null,
      "cosmetic": true
    },
    {
      "id": "serpentscale",
      "new": true,
      "name": "Serpentscale",
      "type": "paddle-skin",
      "look": "emerald scale plates #168F83 on the left half shading into violet #7A3CCC on the right, bone rims #D9CBB8",
      "paddle_art": "Endcaps carved as two small serpent heads facing outward (Gnash left, Mooncoil right), eyes closed",
      "unlock": "3 stars on The Vault, Mooncoil Reliquary and Serpent Rivals",
      "perk": null,
      "cosmetic": true
    },
    {
      "id": "tidewrought",
      "new": true,
      "name": "Tidewrought",
      "type": "paddle-skin",
      "look": "sea-glass teal #2E9C93 glaze with oxidised copper bolts #5E8C7A and barnacle chips #E7DCC8",
      "paddle_art": "Endcaps become rounded shell-shaped bumpers; the core is frosted sea glass",
      "unlock": "Clear Tidewheel Citadel on Hard",
      "perk": null,
      "cosmetic": true
    },
    {
      "id": "hoardbreaker",
      "new": true,
      "name": "Hoardbreaker",
      "type": "paddle-skin",
      "look": "obsidian #1A1C2A with copper veins #E8743B and one tiny gold coin inlay at each end #F4C542",
      "paddle_art": "Endcaps become small dragon-claw grips; copper veins run along the body",
      "unlock": "Clear Dragon's Hoard without waking Ember (its third star)",
      "perk": null,
      "cosmetic": true
    },
    {
      "id": "brickhaven-blade",
      "new": true,
      "name": "Brickhaven Blade",
      "type": "sword",
      "look": "steel #C9D2E3 blade, cobalt #2F5BD3 grip, lightning-bolt pommel matching Kit's shield",
      "unlock": "Earn 10 stars in total",
      "perk": null,
      "cosmetic": true,
      "shows_in": [
        "face orb",
        "victory screen",
        "Ram flourish",
        "menu chapter card"
      ]
    },
    {
      "id": "gatebreaker",
      "new": true,
      "name": "Gatebreaker",
      "type": "sword",
      "look": "broad dark-steel #4A4F6E cleaver blade with brass rivets #B8892E, plum wrap #5A2A4E",
      "unlock": "Beat Korr in Gatehouse Siege on Hard",
      "perk": null,
      "cosmetic": true,
      "shows_in": [
        "face orb",
        "victory screen",
        "Ram flourish",
        "menu chapter card"
      ]
    },
    {
      "id": "lullaby-edge",
      "new": true,
      "name": "Lullaby Edge",
      "type": "sword",
      "look": "pearl #F4EEF2 blade with a rose #FF6FAE ribbon tied at the guard (Lumi's)",
      "unlock": "3 stars on Lumi Breaks Out",
      "perk": null,
      "cosmetic": true,
      "shows_in": [
        "face orb",
        "victory screen",
        "Ram flourish",
        "menu chapter card"
      ]
    },
    {
      "id": "wyrmfang",
      "new": true,
      "name": "Wyrmfang",
      "type": "sword",
      "look": "curved bone #D9CBB8 blade made from Ember's fang, obsidian grip #1A1C2A, copper #E8743B guard",
      "unlock": "Beat Ember on Hard",
      "perk": null,
      "cosmetic": true,
      "shows_in": [
        "face orb",
        "victory screen",
        "Ram flourish",
        "menu chapter card"
      ]
    }
  ],
  "sheets_needed": [
    "unlockables-4x2",
    "kit-orb-with-swords",
    "victory-pose"
  ]
}
```

## Art requests
1. **Unlockables sheet.** Use case: stylized-concept. Asset type: unlockables sheet, 4 columns by 2 rows. HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo. BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers. Row 1: four chrome-based paddle skins, each a horizontal rounded capsule with a 7:1 width-to-height proportion, shown straight-on and identical in size, each keeping a clean bright chrome top highlight and a clearly visible centre panel one third of the width: 1) Starforged: white ceramic plates #EEF1F7 over gunmetal #3A3F55, cyan cockpit seam #3FE0FF (thin); Endcaps become small ceramic thruster pods; the core stripe becomes a thin cyan glass seam; 2) Serpentscale: emerald scale plates #168F83 on the left half shading into violet #7A3CCC on the right, bone rims #D9CBB8; Endcaps carved as two small serpent heads facing outward (Gnash left, Mooncoil right), eyes closed; 3) Tidewrought: sea-glass teal #2E9C93 glaze with oxidised copper bolts #5E8C7A and barnacle chips #E7DCC8; Endcaps become rounded shell-shaped bumpers; the core is frosted sea glass; 4) Hoardbreaker: obsidian #1A1C2A with copper veins #E8743B and one tiny gold coin inlay at each end #F4C542; Endcaps become small dragon-claw grips; copper veins run along the body. Row 2: four chibi-scale swords for a small knight, upright, same height, readable silhouettes: 1) Brickhaven Blade: steel #C9D2E3 blade, cobalt #2F5BD3 grip, lightning-bolt pommel matching Kit's shield; 2) Gatebreaker: broad dark-steel #4A4F6E cleaver blade with brass rivets #B8892E, plum wrap #5A2A4E; 3) Lullaby Edge: pearl #F4EEF2 blade with a rose #FF6FAE ribbon tied at the guard (Lumi's); 4) Wyrmfang: curved bone #D9CBB8 blade made from Ember's fang, obsidian grip #1A1C2A, copper #E8743B guard. NOT: neon, glow halos, light trails, rings, text, labels, a yellow-dominated palette.

## Rules check
- No purchase required to win; nothing is sold: OK. Every item is unlocked by play.
- Perks are tiny and fair: OK (cosmetic only by default).
- Paddle hit shape follows the drawn art and does not change: OK (100x14 for every skin).
- Effects are rendered: OK. The sword flourish is a rendered blade silhouette, with no light trails or rings.
- Very little yellow: OK. Gold appears only as coin inlays on Hoardbreaker.
- Touch targets of at least 44 pt: OK (EQUIP and Later).
- Kit is not redesigned: OK.

## Open questions for Claude
1. Does Serpentscale's two-colour paddle confuse the sweet spot? Recommended: no. The centre panel stays chrome on every skin.
2. Where is the selection saved? Recommended: locally, next to the stars.
3. Does Hoardbreaker exist before Dragon's Hoard ships? Recommended: show it locked with "Coming soon".
4. Can skins and swords mix? Recommended: yes, any skin with any sword.
5. Do space chapters show Kit's sword? Recommended: yes, in the orb only. The Ram flourish uses a ship-blade variant later.
