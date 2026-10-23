---
breach_drop: 1
kind: character
slug: ember
version: 1
date: 2026-10-23
status: proposal
tool: Copilot Studio
depends_on: ["dragons-hoard"]
---

# Ember, the dragon of Dragon's Hoard

## Summary
- Ember is a vain, greedy and cowardly dragon. Pear-shaped, he sits upright on his hoard with big swept-back horns. He is chibi and funny asleep, and properly scary when angry.
- His colours are graphite-indigo scales with copper ember belly plates and ice-blue eyes. Every other villain is red, teal or violet, so he stands apart.
- His silhouette is tall and top-heavy (horns and wings). Gnash and Mooncoil are long lines and Korr is low and wide, so Ember reads as different even at 64 units.
- 8 expressions and 6 key poses map to the Dragon's Hoard greed stages and attacks. Every attack tell lasts 1.4 to 1.8 s.

## Decisions for the owner
1. Direction: A Vain Hoarder [RECOMMENDED]; B Lean Wyrm Duke; C Molten Toad-Drake.
2. Accessory: A a tiny lopsided crown of coins, worn because he is vain [RECOMMENDED]; B a sapphire earring only.

## Spec

### Three directions
**A. Vain Hoarder [RECOMMENDED].** Pear-bellied and upright, with a big horn crown, small wings and a thick tail coiled around his coin pile. His short arms hug a favourite coin. His colours are graphite-indigo scales and glowing copper belly plates, with ice-blue slit eyes. **Personality: vain, greedy, cowardly.** He preens when he wins and clutches his coins when he's hurt. This direction is the most readable at 64 units, the most different from the other villains, and the funniest.

**B. Lean Wyrm Duke.** A long elegant neck, sapphire and silver scales and a monocle. **Personality: snobbish, cold, scheming.** It looks classy, but the long neck makes a third snake-like line, too close to Gnash and Mooncoil.

**C. Molten Toad-Drake.** Squat and wide, with a lava crust and glowing magma cracks. **Personality: lazy, hot-headed, gluttonous.** It is memorable, but it adds red and orange next to Korr and Nerra, and the magma glow pushes toward neon, which breaks the look rules.

### Materials (Vain Hoarder)

| Part | Hex | Finish |
|---|---|---|
| Body scales | #2B2F4A | Glossy vinyl, faceted scale plates |
| Scale edge highlight | #4B5378 | Clear-coat edge |
| Belly plates (weak point) | #E8743B, inner warm #FFB27A (small) | Glazed ceramic, slightly translucent |
| Horns and spines | #D9CBB8 | Polished bone with darker tips #9C8C78 |
| Wing membrane | #3C4C7A | Satin vinyl |
| Wing struts and claws | #1A1C2A | Obsidian gloss |
| Eyes | iris #8FE3FF, pupil slit #0A0C18, 2 catch-lights | Wet glass |
| Brows | #1A1C2A | Thick scaly ridges that move |
| Mouth inside | #7A2E3A, teeth #F2EDE4 | Glossy |
| Coin crown and favourite coin | #F4C542 | Polished gold, small accent only |

Silhouette check at 64 units: horns and wings take the top 35%, the pear body the middle and the tail coil the base. **Duel display size is 112 units tall** (x1.75).

### Expressions

| Id | Game moment | Eyes | Brows | Mouth |
|---|---|---|---|---|
| idle | Asleep or one eye open (greed 0 to 6) | Closed, or one lid half open with the iris tracking | Relaxed and low | Closed smug smile, a smoke chip at the nostril |
| taunt | Player misses a ball | Half-lidded and rolling | One brow arched | Lopsided grin, one fang showing |
| windup | Breath or gust tell | Wide and pupils thin | Sharply down in a V | Jaw opening, cheeks puffed |
| attack | Breath or gust release | Squinting with effort | Pinched down | Wide open roar, tongue back |
| hurt | Head or belly hit | Squeezed shut, tear chip | Up in the middle | Wobbly "ow" grimace |
| stagger | Belly exposed for 2.5 s | Dizzy, pupils unaligned | Askew | Panting, tongue out |
| panic | Below 25% HP | Huge, pupils tiny | High and worried | Teeth clenched in a nervous smile, hugging coins |
| defeat | HP 0 | Teary, big | Fully up | Wailing, mouth open, coin slipping from his claws |

### Key poses

| Id | Game moment | Seconds |
|---|---|---|
| sleep-coil | Greed 0 to 3: curled on his coins, chest rising | Loop 2.4 |
| peek-lift | Greed 4 to threshold−1: head up, one eye open | Loop 1.6 |
| breath-windup | Hoard Roar tell: rears back, chest plates glow | 1.6 (Medium; 1.8 / 1.6 / 1.4) |
| wing-raise | Wing Gust tell: both wings high, claws dig in | 1.5 (Medium; 1.8 / 1.5 / 1.3) |
| belly-pant | After breath: slumped, belly plates exposed | 2.5 |
| defeat-flop | HP 0: flops back onto the hoard, coins scatter | 1.2 |

Every pose has anticipation, contact and recovery. There are no light trails.

### Parts that move separately
Each part is cut separately so Claude can animate it:
- jaw (pivot at the hinge)
- head and neck (pivot at the base of the neck)
- left wing and right wing (pivot at the shoulder)
- tail in 3 segments
- left and right arm with the coin
- each eyelid and each brow
- each belly plate (for the glow)

### Collision (follows the drawn art)
Ember's hit shape is a set of circles placed on the drawing. At duel size (112 units):
- **Head:** 3 circles (r 12, 11, 9) along the snout, a 56x36 envelope. Always hittable, 1 damage.
- **Belly:** 2 circles (r 18). A 72x40 weak point while his plates are exposed, 2 damage. At other times it is armoured: it bounces the ball and deals 0 damage.
- **Horns:** 2 circles each (r 6). They bounce the ball.
- **Wings:** 3 circles each, solid only while raised.
- **Tail:** 6 circles along its curve. It bounces the ball and never deals damage.

## Data
```json
{
  "kind": "character",
  "name": "Ember",
  "role": "villain",
  "height_units": 64,
  "duel_height_units": 112,
  "silhouette": "tall pear-bellied upright dragon, horn crown and small wings on top, tail coiled at the base",
  "personality": [
    "vain",
    "greedy",
    "cowardly"
  ],
  "materials": [
    {
      "part": "body scales",
      "hex": "#2B2F4A",
      "finish": "glossy vinyl faceted plates"
    },
    {
      "part": "scale edges",
      "hex": "#4B5378",
      "finish": "clear-coat edge"
    },
    {
      "part": "belly plates",
      "hex": "#E8743B",
      "finish": "glazed ceramic, warm inner #FFB27A"
    },
    {
      "part": "horns and spines",
      "hex": "#D9CBB8",
      "finish": "polished bone, tips #9C8C78"
    },
    {
      "part": "wing membrane",
      "hex": "#3C4C7A",
      "finish": "satin vinyl"
    },
    {
      "part": "struts and claws",
      "hex": "#1A1C2A",
      "finish": "obsidian gloss"
    },
    {
      "part": "eyes",
      "hex": "#8FE3FF",
      "finish": "wet glass, slit pupil #0A0C18"
    },
    {
      "part": "mouth",
      "hex": "#7A2E3A",
      "finish": "glossy, teeth #F2EDE4"
    },
    {
      "part": "coin crown and coin",
      "hex": "#F4C542",
      "finish": "polished gold, accent only"
    }
  ],
  "expressions": [
    {
      "id": "idle",
      "game_moment": "asleep or one eye open, greed 0 to 6",
      "eyes": "closed, or one lid half open tracking the ball",
      "brows": "relaxed low",
      "mouth": "closed smug smile, smoke chip at nostril"
    },
    {
      "id": "taunt",
      "game_moment": "player misses a ball",
      "eyes": "half-lidded, rolling",
      "brows": "one arched",
      "mouth": "lopsided grin, one fang"
    },
    {
      "id": "windup",
      "game_moment": "breath or gust tell",
      "eyes": "wide, thin pupils",
      "brows": "sharp V",
      "mouth": "jaw opening, cheeks puffed"
    },
    {
      "id": "attack",
      "game_moment": "breath or gust release",
      "eyes": "squinting",
      "brows": "pinched down",
      "mouth": "wide roar"
    },
    {
      "id": "hurt",
      "game_moment": "head or belly hit",
      "eyes": "squeezed shut, tear chip",
      "brows": "up in the middle",
      "mouth": "wobbly grimace"
    },
    {
      "id": "stagger",
      "game_moment": "belly exposed 2.5 s",
      "eyes": "dizzy, unaligned",
      "brows": "askew",
      "mouth": "panting, tongue out"
    },
    {
      "id": "panic",
      "game_moment": "below 25% HP",
      "eyes": "huge, tiny pupils",
      "brows": "high, worried",
      "mouth": "nervous clenched smile, hugging coins"
    },
    {
      "id": "defeat",
      "game_moment": "HP 0",
      "eyes": "teary, big",
      "brows": "fully up",
      "mouth": "wailing, coin slipping"
    }
  ],
  "poses": [
    {
      "id": "sleep-coil",
      "game_moment": "greed 0 to 3",
      "seconds": 2.4
    },
    {
      "id": "peek-lift",
      "game_moment": "greed 4 to threshold-1",
      "seconds": 1.6
    },
    {
      "id": "breath-windup",
      "game_moment": "hoard-roar tell",
      "seconds": 1.6
    },
    {
      "id": "wing-raise",
      "game_moment": "wing-gust tell",
      "seconds": 1.5
    },
    {
      "id": "belly-pant",
      "game_moment": "belly exposed after breath",
      "seconds": 2.5
    },
    {
      "id": "defeat-flop",
      "game_moment": "HP 0",
      "seconds": 1.2
    }
  ],
  "parts": [
    "jaw",
    "head-neck",
    "wing-left",
    "wing-right",
    "tail-1",
    "tail-2",
    "tail-3",
    "arm-left-coin",
    "arm-right",
    "eyelid-left",
    "eyelid-right",
    "brow-left",
    "brow-right",
    "belly-plates"
  ],
  "collision": "compound circles on the drawn art at 112 units: head 3 circles (r 12, 11, 9; 56x36, always 1 dmg), belly 2 circles r 18 (72x40, 2 dmg while exposed, else armoured), horns 2 circles r 6 each, wings 3 each solid only when raised, tail 6 along the curve; all bounce",
  "sheets_needed": [
    "turnaround",
    "expressions",
    "keyposes",
    "parts"
  ]
}
```

## Art requests
1. **Turnaround.** Use case: stylized-concept. Asset type: character turnaround sheet, 4 columns by 1 row: front, three-quarter, side and back of the same pose. HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo. BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers. Primary request: Ember, a chibi dragon villain, pear-bellied and sitting upright, about 2 heads tall. Big swept-back horns in polished bone #D9CBB8 with darker tips, small wings with a satin membrane #3C4C7A and obsidian struts #1A1C2A, a thick tail curled around his body. Glossy graphite-indigo faceted scales #2B2F4A with lighter edges #4B5378. Glazed copper belly plates #E8743B with a slight warm inner tone. Large ice-blue slit eyes #8FE3FF with two catch-lights, thick movable scaly brows, a wedge-shaped angular snout (not round). Short arms hugging one gold coin, and a tiny lopsided crown of coins as a small accent. A vain, smug expression. Every view must have the same proportions and colours, and be complete with no cropping. NOT: red or green or violet scales, long serpent neck, magma glow, neon, round blob head, long dangling arms.
2. **Expressions.** Use case: stylized-concept. Asset type: expression sheet, 4 columns by 2 rows, head and shoulders, three-quarter view, identical head design in every cell. HOUSE STYLE (match exactly): premium glossy 3D render, as if made in Blender Cycles. Characters are glossy vinyl toys; props and bricks are glazed ceramic or polished metal with a thick clear coat, crisp highlight bands and slightly rounded bevels. People use chibi proportions (head about 40% of total height, stubby limbs). One soft warm key light from the top-left (about #FFDBB8), a cool blue fill from the right (#8CA6FF), a faint pink bounce from below (#FF80A6); shadows fall down and to the right. Saturated but never neon colours, very little yellow (gold is a small accent only). Plain calm dark navy background (#141831) that never outshines the subject. Faces are the most important part: big glossy eyes with lids, brows and a mouth that clearly changes between expressions, never blank or identical faces. Orthographic camera, no perspective distortion. NOT: pixel art, flat vector clip art, cel-shaded anime, photorealism, wisps or ghost blobs, snake bodies made of ball chains, round blob heads, one face copied onto every character, long dangly-armed creatures. No text, no watermark, no logo. BACKGROUND: fully transparent (real alpha). If you cannot output transparency, use one flat solid pure magenta #FF00FF background with no gradient, no floor and no cast shadow on the ground, and no magenta anywhere in the subject. Leave an empty margin of at least 10% of the cell around every object; nothing may touch or cross a cell edge. No grid lines, no labels, no numbers. Primary request: the same Ember dragon (graphite-indigo scales #2B2F4A, bone horns #D9CBB8, ice-blue slit eyes #8FE3FF, copper belly #E8743B, tiny coin crown). Row 1: asleep with a smug smile and a smoke puff from the nostril; taunting lopsided grin with one fang and one brow up; windup with jaw opening, cheeks puffed and brows in a sharp V; roaring mouth wide with squinting eyes. Row 2: hurt, eyes squeezed shut with a small tear and a wobbly mouth; dizzy, pupils unaligned and tongue out; panic, huge eyes with tiny pupils and a nervous teeth smile while hugging a coin; defeat, wailing with teary eyes. Each face must be clearly different and readable at 100 px. The supplied images are precise local style references; attach the Korr and Gnash pictures as style references only, and do not copy their colours.

## Rules check
- Telegraphed hazards with a 1.2 to 1.8 s tell: OK (breath 1.8 / 1.6 / 1.4, gust 1.8 / 1.5 / 1.3).
- No tiny weak points; no invulnerable enemy: OK. Head 56x36 is always hittable; belly is 72x40.
- Faces differ, chibi, lids, brows and a reshaping mouth: OK.
- Look (glossy vinyl, house light, little yellow): OK. Gold is the coin crown only.
- Not a rejected template: OK. No blob head, no ball-chain body, no long arms.
- Effects are rendered: OK (smoke chips, tear chip, coins).

## Open questions for Claude
1. Duel scale 112 units: does it fit at y 96 to 230 with HUD safe areas? Recommended: yes. If not, use 100 units.
2. Rigging: sprite parts or a pre-rendered Blender frame sheet? Recommended: parts for the jaw, wings, tail and lids; frames for defeat-flop.
3. Belly glow during the windup: a rendered emissive texture, not a glow halo? Recommended: yes, bake 3 plate textures (off, warm, hot).
4. Does Ember appear asleep in the floor 1 and 2 background? Recommended: yes, as a 64-unit version at the top, non-colliding.
5. Reuse for Zephyr and Grumble? Recommended: no shared body. Only the rig approach is reused.
