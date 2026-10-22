# 10 - Characters, villains and animals

Purpose: generate a character turnaround, an expression sheet, or a new creature design that can be rebuilt in Blender (or extracted) without redesign. Use with `00-style-block.md` and 1 to 3 references from `references.md` (section B).

## The cast (so new work stays consistent)

| Character | What they are | Look to keep |
|---|---|---|
| **Prince Kit** | Hero, Lumi's childhood friend, the courtyard bounce-game champion | Open-face silver helmet, compact armour, cobalt `#356AB3` cape and tunic, silver `#8D97B3`, navy `#26324D` boots and gloves, coral `#E76F71` scarf, peach skin `#E7AB8B`, blue eyes, broad pointed heater shield with a raised silver bolt over cobalt enamel. Never a moustache, beard, muzzle patch, bat-like shield or closed visor |
| **Princess Lumi** | The Keystone whose song keeps the bricks alive; playable in her own levels | Honey-blonde hair, rose dress with a flared bell skirt and lace petticoat, ivory gloves, white tights, rose shoes, gold filigree tiara with a faceted rose gem and pearl tips, big turquoise eyes, cheek blush |
| **Brum** | Friendly Yeti porter (an ally) | Friendly. A different character from the hostile Frost Warden |
| **Korr** | Armoured boar, the Bell Tyrant, holds the gatehouse | Four short hoofed legs, glossy ruby-plum plates with gold trim and crown emblems, black joints, ivory curved tusks, big pink snout, fierce mischievous amber eyes, small spikes on the head. He works a lever with a front hoof. **No human arms**, not an ape |
| **Nerra** | Castle-shell hermit-crab queen, Keeper of the Flood | Oxblood and coral glossy shell, black pearl joints, a ruined mini-fortress with red flags spiralling off the shell, big expressive eyes on short armoured stalks, one huge crusher claw and one slender gate claw, short articulated walking legs. **No human torso or arms** |
| **Gnash** | The emerald serpent, warden that chews through bricks toward Lumi | Angular faceted head (never round), teal-green scales, cream jaw, coral-pink brows, lime-yellow eyes with lids. Body is a continuous scaled form (never a chain of balls). 13 head expressions: idle, blink, taste, hunt, chew0, chew1, hiss, ouch, dizzy, grin, shock, snarl, strike |
| **Mooncoil** | Violet serpent for the Reliquary | A different skin on the same serpent kit: not a recolour of Gnash; keep the angular head |
| **Zorvax the Curator** | Alien collector in the saucer mothership, 36 HP boss | A saucer with an alien face and five expressions: smug, angry, hurt, panic, dizzy |
| **Frost Warden** | Hostile Yeti guardian | Frost-blue and slate palette, hostile expressions, own attack clips |
| **Clank robots** | Glossy toy robots in four colours (white, pink, yellow, blue) | Black faceplate separates large eye and mouth symbols from the shiny body; seven expressions |

Do **not** reuse Ember, Mortar, Polaris, Warden Core, Comet Kraken or Stardock Snap as new designs; those cast boards are withdrawn history (`design/phase1/02-menagerie-cast.md`).

## Design rules (from the owner's reviews)

1. **Silhouette first.** Different species have different silhouettes: serpent upright and angular; crab low and asymmetric; boar low, wide and four-legged; Yeti heavy and upright. Never a recolour of another creature.
2. **Faces are one continuous surface.** Eyes with lids, brows that move, a mouth that reshapes. Eye aperture, brow angle and mouth shape change together. No mask, muzzle patch, seam or floating eyes.
3. **Expressions must differ at a glance** with the labels removed. "The same smile with iris movement" fails.
4. **Heads are not round blobs.** Give the head planes, a jaw, brow ridges.
5. **Simple buildable satin-vinyl forms.** Broad bevels. No fur strands, hair strands, scratches, tiny suckers or tiny joints; they vanish at phone size.
6. **Humanoids** use the chibi KayKit proportions: head about 40 percent of height, about 42 units tall on a 360-unit screen. **Creatures** are larger so faces stay readable: about 72 to 144 units wide (for example Korr-class boss about 110 x 90).
7. **Pose names the rig can play.** Design moments around: Idle, Walking, Running, Jump, Dodge, Cheer, Interact, Block, Block_Hit, Hit, Death, Spellcast, Sit. For creatures: idle, wind-up (tell), release, stagger, hurt, dazed, defeat.
8. **Read it small.** Check your result at about 42 units tall (a 168 px cell) on navy `#141831`. It must still read.

## Fields

| Field | Example |
|---|---|
| `[NAME]` | Korr |
| `[ROLE]` | gatehouse boss: heavy armoured boar who drops iron bells |
| `[SPECIES AND ANATOMY]` | four-legged boar, four short stout hoofed legs, no human arms |
| `[BODY COLOURS WITH HEX]` | plates ruby-plum #A0153E with gold #E0B040 trim, black joints #1B1A22, ivory #F2E8D0 tusks, pink #E2548A snout |
| `[FACE]` | amber eyes with heavy lids, thick dark brows, big expressive snout, small tusked mouth |
| `[SIGNATURE PROP]` | a hoof-operated bell lever |
| `[SIZE]` | about 110 x 90 game units |
| `[VIEWS]` | front, three-quarter, side, back |
| `[EXPRESSIONS]` | the list of states |
| `[REFERENCES ATTACHED]` | korr.png, kit-gatehouse-siege-v1.png |

Hex values here are approximations read from the existing renders; the attached reference wins.

## Template 1: turnaround sheet

```text
[PASTE STYLE BLOCK]

Character turnaround sheet for [NAME], [ROLE]. Anatomy: [SPECIES AND ANATOMY]. Colours: [BODY COLOURS WITH HEX]. Face: [FACE]. Signature prop: [SIGNATURE PROP]. Size on screen: [SIZE].
Layout: one image, 2048 x 1024, four views of the SAME character evenly spaced on a transparent background (or a flat [CHROMA COLOUR] background): front, three-quarter front, side, back. Same lighting in every view (warm key top-left, cool fill right, pink bounce below), same scale, feet on the same baseline, a clear gap between views, nothing cropped, no labels, no text.
Camera: front, side and back views orthographic; the three-quarter view is the hero view. Neutral, readable idle pose, weight on the feet.
Consistency: match the attached reference images exactly for materials, glossiness, proportions and finish. Do not redesign anything that appears in them.
[PASTE NEGATIVE LIST]
```

### Worked example: Korr turnaround

```text
Premium portrait mobile brick-breaker game art, "BREACH" house style. Polished 3D-rendered toy-scale look, as if rendered in Blender Cycles. Glossy vinyl-toy character with satin finish and a light clear coat. Lighting: a warm key light from the top-left (#FFDBB8), a cool blue fill from the right (#8CA6FF), a soft pink bounce from below (#FF80A6), a large softbox behind the camera for clean glossy reflections; saturated but never neon; medium-high contrast. Faces: big readable emotions, eyes with lids, brows that move, a mouth that changes shape. Yellow and gold are tiny accents only.

Character turnaround sheet for KORR, the Bell Tyrant, a heavy armoured boar who guards the castle gatehouse and drops iron bells. Anatomy: a real four-legged boar with four short stout hoofed legs, broad shoulders, big pink snout, curved ivory tusks, small ears, a few small brass spikes on the head. NO human arms, NOT an ape, no hands. Colours: glossy ruby-plum armour plates (#A0153E) with thin gold trim (#E0B040) and a small crown emblem on each shoulder plate, black blued-steel joints (#1B1A22), ivory tusks (#F2E8D0), pink snout (#E2548A), brass hooves. Face: fierce mischievous amber eyes with heavy lids and thick dark brows, an expressive broad snout, a small tusked mouth. Size: about 110 x 90 game units on a 360-unit-wide screen, chunky toy proportions.
Layout: one image, 2048 x 1024, four views of the SAME boar evenly spaced on a transparent background: front, three-quarter front, side, back. Same lighting in every view, same scale, hooves on the same baseline, clear gaps between views, nothing cropped, no labels, no text. Front, side and back views are orthographic; the three-quarter view is the hero view. Neutral idle stance, weight on all four legs.
Consistency: match the attached reference images exactly (the existing Korr renders and the Gatehouse Siege board) for plate shape, gloss, gold trim, tusks, snout and proportions. Do not redesign Korr.
Avoid: pixel art; flat vector clip-art; photoreal fur; fine scratches and tiny rivets; neon glow; human arms; text, logo, watermark, UI.
```

Attach: `assets/fantasy-machinery/korr.png`, `design/phase2/img/kit-gatehouse-siege-v1.png`.

## Template 2: expression sheet

```text
[PASTE STYLE BLOCK]

Expression sheet for [NAME] ([ROLE]), the same character and the same design as the attached references. Colours: [BODY COLOURS WITH HEX]. Face: [FACE].
Layout: one image, 2048 x 1024, a grid of 4 columns x 2 rows, 8 head-and-shoulders portraits of the same character, same camera, same lighting, same scale, one portrait per cell, centred, equal cells with at least 10 percent padding, on a [transparent / flat CHROMA COLOUR] background, no labels, no text. Three-quarter front view, camera slightly above eye level.
The 8 expressions, left to right, top to bottom: [EXPRESSIONS]. Each expression must change the eyelids and eye aperture, the brow angle and the mouth shape together; each must be instantly distinguishable from the others with the labels removed. No two portraits may use the same smile or the same brows.
Consistency: match the attached references exactly. Do not redesign the face.
[PASTE NEGATIVE LIST]
```

Hero set (Kit's, a good default): Determined, Focused (lowered upper lids), Grin (one raised brow, side grin), Shock (wide eyes, high brows, round open mouth), Worried (high inner brows, small downturned open mouth), Cheer (closed smiling eye arcs, open smile), Hurt (squeezed eyes, tight grimace), Laugh (closed smiling lids, wide open laugh).
Creature set: Neutral, Alert, Attack warning (the tell), Hurt, Shocked, Dazed (dizzy), Defeated, Relieved.
Villain set (Zorvax style): Smug, Angry, Hurt, Panic, Dizzy, Triumphant, Sulking, Scheming.

### Worked example: Korr expression sheet

```text
[style block as in the turnaround example, plus:]

Expression sheet for KORR (the Bell Tyrant, armoured boar), the same design as the attached references: ruby-plum glossy plates (#A0153E) with gold trim (#E0B040), ivory tusks (#F2E8D0), pink snout (#E2548A), amber eyes with heavy lids, thick dark brows, no human arms. Layout: one image, 2048 x 1024, 4 columns x 2 rows, 8 head-and-shoulders portraits, same camera, lighting and scale, equal cells with 10 percent padding, transparent background, no labels, no text. Three-quarter front view, camera slightly above eye level.
The 8 expressions, left to right, top to bottom: 1 smug (one brow up, half-lidded, tusked grin); 2 snort tell (nostrils flared, brows slammed down, lower lip pushed out, eyes locked forward); 3 charging (wide eyes, teeth bared, brows steep); 4 hurt (one eye squeezed shut, brows crooked, mouth open in a wince); 5 startled (eyes huge, brows high, mouth round); 6 dazed (eyes spiralled and unfocused, tongue out); 7 defeated (heavy drooping lids, brows pulled up in the middle, mouth sagging); 8 sulking (eyes sliding sideways, brow low, pout). Each must differ in eyelids, brows and mouth together.
Consistency: match the attached Korr renders exactly. Do not redesign Korr.
Avoid: round blob head, identical faces, text, logo, UI, fur strands, neon, pixel art.
```

Attach: `assets/fantasy-machinery/korr.png`, `assets/kit/expressions.png` (to show the quality of the face rig), `assets/fantasy-machinery/korr-idle.png`.

## Template 3: new animal or creature design

Use when you want ideas. Ask for 3 options so the owner can choose; never build before the owner picks.

```text
[PASTE STYLE BLOCK]

Concept sheet for three different options of a NEW BREACH [ROLE: boss / ally / minion] creature: [ONE-LINE IDEA]. Species rule: it must be a [SPECIES] with a silhouette clearly different from the existing cast (serpent upright and angular, boar low and four-legged, crab low and asymmetric, Yeti heavy and upright). Goal in play: [WHAT IT DOES TO THE PLAYER: for example drops warned hazards, guards a gate]. Tell (the readable warning pose before an attack): [TELL]. Size on screen: [SIZE] game units.
Layout: 1536 x 1024. Three equal columns, one complete creature per column in three-quarter front view, all limbs contained, generous dark navy (#141831) gaps. Under each creature, one large alternate-expression close-up of the same head. No labels, no text, no scenery, no projectiles.
Colour per option: [COLOURS WITH HEX]. Faces: large, expressive eyes with lids, brows and a mouth that reshape; continuous face surface; no muzzle patch.
Consistency: same materials, light, glossiness and chunky-toy proportions as the attached references. Different species from them, same quality.
[PASTE NEGATIVE LIST]
```

### Worked example: Hollin the armoured owl

```text
[style block above]

Concept sheet for three different options of a NEW BREACH mini-boss creature: HOLLIN, an armoured owl bell-ringer who perches on a tower beam and drops iron bells. Species rule: a real owl, upright and winged, two feathered legs with talons, two broad wings, NO human arms; silhouette clearly different from a serpent, boar, crab or Yeti. Goal in play: swoops sideways along the top of the screen and drops a bell after a 1.5 second wing-spread tell. Tell: both wings lift and spread, head tilts down, eyes lock on the paddle lane. Size on screen: about 96 x 100 game units.
Layout: 1536 x 1024, three equal columns, one complete owl per column in three-quarter front view, all feathers and wings contained, generous dark navy (#141831) gaps. Under each owl, one large alternate-expression head close-up (smug, then startled). No labels, no text, no scenery.
Colours: option A slate-blue #356AB3 and ivory #E3ECF6 with copper #C27A3A plates; option B teal #22C4B0 and granite #4A4F6E with silver #AEB8CF plates; option C violet #8F5CF0 and cream #F5E6D0 with gunmetal #39445E plates. Large round amber eyes with heavy lids and thick brows, a short hooked beak that can open into a squawk.
Faces: continuous surface; expressions must change lids, brows and beak together. Feathers are broad glossy enamel plates, not individual strands.
Consistency: same materials, light, gloss and chunky-toy proportions as the attached Korr and Kit renders. Different species, same quality.
Avoid: pixel art, flat vector, photoreal feathers, fine texture noise, neon glow, round blob head, text, logo, UI, human hands.
```

Attach: `assets/fantasy-machinery/korr.png`, `assets/fantasy-machinery/nerra-v2-idle.png`, `assets/kit/expressions.png`.

## Species cards (fill these into `[SPECIES AND ANATOMY]`)

| Species | Anatomy rule to state | Pitfall to forbid |
|---|---|---|
| **Boar** (Korr) | Four short stout hoofed legs, heavy shoulders, tusks, big snout, lever worked with a front hoof | Human arms, an ape stance, a barrel body |
| **Crab** (Nerra) | Low wide shell with a built structure on it, eyes on short armoured stalks, two *different* claws (one crusher, one slender), several short articulated legs | A human torso or bow, symmetrical claws, tall stalks that hide the face |
| **Serpent** (Gnash, Mooncoil) | Angular faceted head with brow ridges and a jaw, one continuous scaled body tapering to the tail, heads built for 13 expressions | Round head, ball-chain or bead-string body, a recoloured copy |
| **Yeti** (Brum friendly, Frost Warden hostile) | Heavy upright body, broad shoulders, big hands and feet, face as one continuous plane; friendly uses a warm palette, hostile uses frost-blue and slate | Realistic fur, an ape face, reusing the same expressions for both |
| **New animal** | State the number of legs, wings and eyes, the one signature silhouette feature, and the tell pose | "Snake with wings", "dragon with a round head", recolours |

## Output spec

| Output | Spec |
|---|---|
| Turnaround | 2048 x 1024 PNG, transparent (or flat chroma), four views, one baseline, no text |
| Expression sheet | 2048 x 1024 PNG, 4 x 2 grid of 8 portraits, equal cells, no text. Name each cell in the hand-back note in reading order |
| Single pose or hero image | At least 1024 px on the long side, three-quarter front, transparent |
| Extras we may ask for next | The tell pose, hurt, defeat, and a native-size check (a 168 px cell on navy) |
| Hand-back | PNGs plus the `.txt` of each prompt; say which references were attached and any chroma colour used |

Filing: `art/<family>/source/` (for example `art/fantasy-machinery/source/`), then a Blender rebuild on the shared face rig (`art/princess.py` is the reference) or an extraction pass. Facial quality bar: `design/phase1/00-quality-target.md`.
