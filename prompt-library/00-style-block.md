# 00 - Master style block

Paste the **full block** at the start of every visual prompt (concept art, asset render, background, icon, effect). Then add the subject from the template. Paste the **negative list** at the end, as an "Avoid:" sentence (most image generators in Copilot have no separate negative field).

Where each rule comes from: `AGENTS.md`, `docs/handoff/04-chatgpt-design-brief.md` (sections 2 and 4), `design/phase1/00-quality-target.md`, `design/phase1/02-menagerie-cast.md`, `art/mooncoil/BACKGROUND.md`. If a template ever contradicts this file, this file wins.

## Full style block (paste first)

```text
Premium portrait mobile brick-breaker game art, "BREACH" house style. Polished 3D-rendered
toy-scale look, as if rendered in Blender Cycles. Characters are glossy vinyl toys: satin skin
with a light clear coat, chibi proportions (head about 40 percent of total height, stubby limbs),
a character is about 42 game units tall. Bricks are glazed ceramic tiles: a coloured body under a
thick clear glossy coat, a crisp highlight band along the top edge, slightly rounded corners,
dark separators. The ball and paddle are chrome. Hardware is dark blued gunmetal, aged iron,
brushed brass, carved stone and metal-banded wood.
Lighting: a warm key light from the top-left (#FFDBB8), a cool blue fill from the right (#8CA6FF),
a soft pink bounce from below (#FF80A6), and a large softbox behind the camera for clean glossy
reflections. Drop shadows fall down and to the right. Tone: medium-high contrast, saturated but
never neon.
Palette: sun #FFC73D, coral #FF6F61, violet #8F5CF0, teal #22C4B0, blue #4F9DFF, granite #4A4F6E,
on deep navy (#22284A to #141831 to #0A0C18). Yellow and gold are tiny accents only.
Faces: big, readable emotions. Eyes with lids, iris, pupil and catch-lights; brows that move;
a mouth that changes shape; never blank, never the same face twice. Heads are never round blobs;
faces are one continuous surface with no muzzle patch, mask or seam.
Backgrounds: calm, dark and desaturated, several stops darker than the foreground, so the
foreground and the white ball always dominate.
Feel: premium, inventive, urgent, sticky; nothing generic, template-like or "default-looking".
Be strictly consistent with the attached reference images: same materials, same light, same
proportions, same finish. Do not redesign any existing character that appears in a reference.
```

## Short style block (when the tool limits prompt length)

```text
BREACH style: glossy 3D vinyl-toy render, Blender Cycles look, chibi proportions (head ~40 percent
of height), glazed ceramic tile bricks, chrome ball and paddle. Warm key light top-left (#FFDBB8),
cool blue fill from the right (#8CA6FF), pink bounce from below (#FF80A6), soft glossy reflections,
medium-high contrast, saturated but not neon, minimal yellow. Dark calm desaturated backgrounds
(#141831). Large readable expressive faces. Match the attached references exactly.
```

## Negative list (paste last, as "Avoid:")

```text
Avoid: pixel art; wisps, ghost blobs or particle halos; flat vector clip-art; ball-chain or
bead-string snake bodies; round "bally" blob heads; uniform or identical faces; flashy hangars;
torches, lanterns, candles, hazard stripes, glowing window bars or bright planets in backgrounds;
yellow-dominant or gold-dominant scenes (a gold cage is rejected); photoreal skin or fur;
hyper-detailed collectible-figurine detail (fine hair strands, scratches, noise, tiny rivets);
neon glow; long magical light trails; mirror-chrome faces; round table-tennis shields; moustaches,
beards or muzzle patches on humans; long humanoid arms on animals; recoloured copies of one
creature; copied franchise characters; any text, letters, logo, watermark, UI, HUD, counters,
frames or phone mock-up baked into the image (except concept boards, see 15-concept-boards.md).
```

## Rules in plain English (the "why" behind the block)

1. **Premium, inventive, urgent, addictive.** Nothing may look generic. (Brief, section 2, Feel.)
2. **Expressions must say a lot.** Every character needs eyes with lids and brows and a mouth that changes. (Brief, section 2.)
3. **Gameplay first.** The owner removed dungeon lights, lanterns, torches, bright planets, window bars and hazard stripes from backgrounds because they distracted from play. Backgrounds stay calm, dark and desaturated.
4. **Not too much yellow.** Gold and yellow are accents. The cage is dark iron.
5. **Glossy and rendered.** Bricks are glazed ceramic with real reflections; characters are glossy vinyl toys. Rejected styles: pixel art, wisps or ghost blobs, jittery fox characters, ball-chain snake bodies, round "bally" blob heads, flat vector clip-art.
6. **Light rig.** Warm key top-left `#FFDBB8`, cool fill right `#8CA6FF`, soft pink bounce below `#FF80A6`, softbox behind camera. Colour management is AgX "Medium High Contrast". Shadows fall down-right (+3, +5 units).
7. **Camera.** Orthographic. Assets: front view (or side view for side-on levels). Characters: three-quarter front. Backgrounds: straight-on, no perspective drama.
8. **Native read.** A character is about 42 units tall on a 360-unit-wide screen. If an expression or silhouette is not clear at that size on dark navy, it is wrong, however good the large image looks. (`00-quality-target.md`, Native read.)
9. **Hierarchy.** Glossy bricks and characters lead; a moving chrome ball must stay findable. No ornamental scenery competing behind the ball.
10. **Simplify detail.** Broad clean forms win. Drop tiny seams, grain, fine hair strands, decorative rivets and scratches; they disappear at phone size and fight the vinyl-toy look.

## Fixed numbers worth repeating in prompts

| Item | Value |
|---|---|
| Screen | Portrait, about 9:19.5. World is 360 units wide. Test phones 393 x 852 (safe insets 59 top, 34 bottom) and 412 x 915 (32 top, 24 bottom) |
| Sprite scale | Characters and bricks 3 px per unit; background plates 2 px per unit; small counter gems 6 px per unit |
| Character cell | 56 x 56 units = 168 x 168 px, character about 42 units tall, one bottom-centre pivot |
| Brick grid | Vault 20 x 20 cells of 16 units; Invasion 11 x 9 cells of 28 x 18; princess levels equal 36 x 18 bricks |
| Ball and paddle | Ordinary ball radius 6; paddle 100 x 14 (Carrier space-level paddle 125 x 17) |
| Background | Dark plate; top half quiet; no bricks, characters or UI drawn in |
| Fonts (code draws all text) | Lilita One for game text, Rubik for numbers |

## Palette extras (all hex values are from the repo docs)

| Use | Hex |
|---|---|
| Invasion rows | `#FF5D8F` `#FF8A3D` `#FFD23F` `#5CCF6A` `#2EC4B6` `#3FA8F5` `#7B6CF6` `#C46BF0`; armour `#8D97B3` |
| UI states | AIM lilac `#E3B6FF` / `#C46BF0`; danger `#FF4D5E`; success `#7BD88F`; combo text `#FFD36B` |
| Power-ups | SPLIT `#5CCF6A`, FIRE `#FF8A3D`, WIDE `#3FA8F5`, AIM `#C46BF0`, BURST `#F7C948`, LASER `#FF4D6D`, SHIELD `#2EC4B6`, SLOW `#7FD6FF`, TINY `#5A5F78` |
| Kit (Blue Helmet Guardian) | tunic/shield enamel cobalt `#356AB3`; armour and rim silver `#8D97B3`; hair charcoal `#253349`; boots and dark cloth navy `#26324D`; scarf coral `#E76F71`; skin peach `#E7AB8B` |
| Creature palettes (earlier boards) | gunmetal `#39445E`, steel `#AEB8CF`, ice `#7FD6FF`, ivory `#E3ECF6`, indigo `#49478A`, slate-blue `#356AB3` |

New colours must sit inside this family. When you propose one, give its hex and where it is used.
