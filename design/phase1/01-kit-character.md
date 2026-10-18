# Prince Kit — new knight concept options

Status: the owner selected **B / Knight 2**, the Blue Helmet Guardian. The finished Blender model and 100-frame animation family are rendered and integrated. Both requested phone sizes passed Chromium playtests; the owner's final approval remains pending. The original three boards below remain as the decision record. The previous character direction was rejected in full. The current knight-and-shield direction supersedes the sports-bat interpretation of the earlier courtyard prop. Kit remains Lumi's childhood friend and an underdog; the prop is now an unmistakable medieval shield.

## Selected direction and concept record

The original three 1536 × 1024 boards remain below as appearance references. The selected B model is now built and rendered; the completed production deliverables are listed next.

| Option | Board | Personality | Silhouette and distinguishing feature |
|---|---|---|---|
| A — Teal Courtyard Knight | [01-kit-v2-1.png](img/01-kit-v2-1.png) | Brave, warm, stubborn | Bare head, swept dark hair, silver armor, teal split tabard, broad heater shield |
| B — Blue Helmet Guardian | [01-kit-v2-2.png](img/01-kit-v2-2.png) | Bold, loyal, exuberant | Open-faced silver helmet, compact armor, cobalt cape, broad pointed shield |
| C — Indigo Wayfarer | [01-kit-v2-3.png](img/01-kit-v2-3.png) | Quick, curious, resourceful | Copper swept hair, short half-cape, lighter asymmetric shoulders, long kite shield |

Selected: **B** has the clearest knight silhouette and the lowest source-model risk. The open helmet supports the existing Knight shape and leaves every facial feature visible. **A** is the strongest alternate if an uncovered hairstyle is preferred, with teal separating Kit from Lumi's rose outfit.

The boards show focused/worried (A), delighted/worried (B), and focused/delighted (C). Eye aperture, brow angle and mouth shape change together. No moustache, separate face patch, detached hair tubes, round sports prop or front-mounted stick grip is acceptable.

## Finished production deliverables

- [Finished model turnaround](../../assets/kit/turnaround.png): front, three quarter, side and back, actual 336 px Blender views assembled at 1440 × 480.
- [Eight expressions](../../assets/kit/expressions.png): actual 288 px face portraits assembled at 1200 × 744.
- [Animated preview](../../assets/kit/preview.gif): all eight real rig animations at approximately 14 fps, 1120 × 680.
- [All 100 frames](../../assets/kit/contact-sheet.png): 1880 × 1296 contact sheet.
- [Asset manifest](kit-asset-manifest.json): frame counts, hashes, alpha bounds, source, technical checks and pending owner approval.
- Production sprites: `assets/kit/<Clip>_NN.png`, 100 RGBA frames at 168 × 168; individual expression portraits are in `assets/kit/faces/`.
- Editable source scene: `out/kit-proof/kit.blend`, with the canonical reproducible source in `art/kit.py`.

The plain-skin front/quarter proof and representative guard/celebration animation poses passed review before the full batch. Every final frame has transparent margins, the same camera/scale contract, no PNG text metadata, and multiple distinct image hashes per animation. The held Focus guard intentionally ping-pongs through seven poses over twelve frames. Final browser QA at iPhone 393 × 852 and Android 412 × 915 covered both levels, all eight reactions, touch serve/drag, natural Focus catch/release, core titan, loss/continue and win flows with zero page errors. Kit stays clear of gameplay, instructions and HUD. Reports/captures are in `out/kit-final-qa/`; the manifest records the tested build hash. Physical devices, Safari and the owner's final approval remain pending.

## Palette targets

Hex values are production targets. Concept-board reflections vary with the light.

| Part | A | B | C |
|---|---|---|---|
| Tunic / shield enamel | deep teal `#148B8A` | cobalt `#356AB3` | indigo `#49478A` |
| Armor / shield bevel | silver `#8D97B3` | silver `#8D97B3` | silver `#8D97B3` |
| Hair | chocolate `#38252B` | charcoal `#253349` | chestnut `#7B3E2E` |
| Boots / gloves / dark cloth | navy `#303348` | navy `#26324D` | navy `#29324B` |
| Scarf / cloth tie | coral `#E76F71` | coral `#E76F71` | muted coral `#DE737B` |
| Additional shield rim | silver above | silver above | gunmetal `#39445E` |
| Skin | peach `#E7AB8B` | peach `#E7AB8B` | peach `#E7AB8B` |

Background: `#141831`. Warm top-left key `#FFDBB8`, cool right fill `#8CA6FF`, pink lower bounce `#FF80A6`. Yellow is limited to A's small clasp and is optional; B/C need none.

## Source-model construction constraints

Inspected source: `assets/models/kk_Knight.glb` (KayKit Adventurers, CC0). Confirmed mesh nodes:

- Retain `Knight_Body`, `Knight_ArmLeft`, `Knight_ArmRight`, `Knight_LegLeft`, `Knight_LegRight`, and the original armature. The body and armor provide the construction basis.
- Retain `Knight_Head` as the starting head. Remove its two dark eye components and the separate hair-colored brow ridges. **Keep the skin-colored lower jaw, lip-strip and nose flange:** they close the source face hull, and deleting them leaves dark openings. Weld matching skin borders, reduce both nose sections together, and use per-face UV swatches for flat satin skin/hair materials. Never add a covering face mask or muzzle.
- For B, retain the original `Knight_Helmet` bone attachment and reprofile its closed visor geometry into one continuous open-face silver shell, rounded rim and narrow center ridge, with brows and mouth visible. The source hair is reduced to a neat fringe under the helmet; no separately piled hair ellipsoids.
- `Knight_Cape` keeps its original rig attachment and is recolored cobalt, with a simple broad silhouette.
- Use `Badge_Shield` as the attached source prop, rebuilding its mesh into the selected broad heater outline with a raised silver bolt over cobalt enamel. `Rectangle_Shield` is another verified source. Keep one shield and hide the other candidates: `Round_Shield`, `Spike_Shield`, and unused alternatives. Enlarge/reprofile the selected shield to match the chosen board. The grip stays behind it, attached to the hand / forearm.
- Hide `1H_Sword_Offhand`, `1H_Sword`, and `2H_Sword`. The selected shield is Kit's signature prop.
- Match Lumi's face construction in `art/princess.py`: skin-following eye/lid placement, procedural iris/pupil/catchlights, broad deforming brows, reshaping mouth and restrained blush. Tune to the Knight head surface; do not copy Rogue coordinates blindly.

Keep final character height about **42 world units**, head about **40% of height**, sprite box **56 × 56 world units** at **3 px per unit** (168 × 168 output cell), with one consistent bottom-center pivot. Close-up story portraits may use the existing 4× face mode. Full-body concepts have slightly longer legs and more hair/metal detail than the source rig; resolve these back to KayKit proportions rather than rebuilding a new anatomical character. Do not promise exact reproduction of the concept's microdetail.

At sprite scale, use broad clean forms. Drop tiny seams, grain, fine hair strands, decorative rivets and scratches. Preserve the chosen hair silhouette / helmet, face, shield outline, dominant cloth color and armor reflections.

## Production gates

1. Make a front / three-quarter / side / back turnaround of the selected option, keeping identity and proportions fixed.
2. Produce eight expression studies and a native-scale preview against the existing dark game backdrop.
3. Build one Blender proof with integrated face and shield. Show full-body and face closeups before rendering the complete set.
4. Render the approved family, integrate it, and playtest iPhone 393 × 852 (59/34 safe insets) and Android 412 × 915 (32/24 safe insets). Show screenshots.
5. Wait for the owner's OK before commit / push / next task.

Provisional mapping uses animation names verified in the Knight GLB. Timings, facial values and final frame counts follow the selected proof.

| Expression | Game moment | Source clip | Visible facial distinction |
|---|---|---|---|
| Determined | Serve | `Idle` | Inward brows, open alert eyes, firmly closed mouth |
| Focused | Catch and aim | `Blocking` | Lowered upper lids, tight asymmetric mouth |
| Grin | Combo | `Interact` | One raised brow, cheek lift, side grin |
| Shock | Life lost | `Hit_A` | Wide eyes, high brows, rounded open mouth |
| Worried | High danger | `Block` | High inner brows, raised lower lids, open downturned mouth |
| Cheer | Win | `Cheer` | Lifted brows, smiling eye arcs, open smile |
| Hurt | Hit | `Block_Hit` | One squeezed eye, uneven brows, tight grimace |
| Laugh | Titan | `Cheer` | Closed smiling lids, raised cheeks, wide open laugh |

## Reproducible production settings

Source: `art/kit.py`; editable proof scene: `out/kit-proof/kit.blend` (kept outside shipping assets). Render with Python 3.13 / bpy 5.2.2, Cycles CPU, 48 samples, denoising, AgX Medium High Contrast. Render at twice the output pixel size and downsample with Lanczos; strip PNG text metadata before saving. No princess or shared art code is changed.

```powershell
python3 art/kit.py assets/kit Idle:16 Focus:12 Grin:12 Shock:8 Worried:12 Cheer:16 Hurt:8 Laugh:16 --samples 48 --threads 4
```

Use `--face` for 288 × 288 expression portraits, `--proof` for crisp 336 × 336 full-body presentation renders, `--yaw 25|90|180` for alternate views, and `--skin` with `--face` for a face-surface diagnostic. A selective frame spec such as `Cheer:16:0,8,15` samples the real clip without changing its timing.

| Runtime clip | Frames | FPS | Playback | KayKit source |
|---|---:|---:|---|---|
| Idle / determined | 16 | 14 | loop | Idle |
| Focus | 12 | 14 | loop | Blocking, held middle range |
| Grin | 12 | 14 | loop | Interact |
| Shock | 8 | 14 | one shot, hold last frame | Hit_A |
| Worried | 12 | 14 | loop | Idle |
| Cheer | 16 | 14 | loop | Cheer |
| Hurt | 8 | 14 | one shot, hold last frame | Block_Hit |
| Laugh | 16 | 14 | loop | Cheer |

Reproduce the presentation sheets by rendering `Idle:1` with `--proof` to `out/kit-proof/turn-front`, `turn-quarter` (`--yaw 25`), `turn-side` (`--yaw 90`) and `turn-back` (`--yaw 180`); render one frame of every clip with `--face` to `assets/kit/faces`. Then run `python3 art/kit.py --deliverables` to verify all 100 sprites and rebuild the sheets, animated preview and manifest.

The shield follows the real left hand position with its protective face kept toward the viewer. A guard-arm layer keeps it below the mouth during Focus/Hurt; a Cheer/Laugh arm layer holds it outboard of the helmet. The underlying rig clip still drives body, head and spare-arm motion. This avoids the source Block_Hit wrist rolling the shield across the eyes.

The model, camera scale and pivot stay fixed across clips. `assets/kit/meta.json` defines the common sprite contract. The final renderer checks RGBA dimensions and transparent edge margins per frame, and verifies the expected head parts before editing the source mesh.

## Full concept prompts

### Option A

```text
Glossy 3D vinyl-toy render, Blender Cycles look, chibi proportions (head ~40% of height), soft warm key
light from the top-left, cool blue rim light from the right, gentle pink bounce from below, clean
reflections, saturated but not neon colours, minimal yellow, plain dark navy background (#141831),
orthographic front view, no text, no watermark.
Use case: stylized-concept. Asset type: premium mobile game hero design approval board, landscape 1536x1024 composition.
Create a NEW charming young male KNIGHT, Prince Kit, a brave underdog with a mischievous streak. He should feel like a lovingly sculpted collectible toy beside a rose-dressed princess, strong personality, subtle faceted structure rounded by soft bevels, NOT a generic featureless chibi. Body stubby but athletic, large sculpted rounded-square head and expressive eyes. Clean-shaven youthful face with warm peach skin, compact button nose sculpted into the face, soft cheeks and a small chin; skin is one continuous form, absolutely no separate faceplate.
DESIGN A, TEAL COURTYARD KNIGHT: coherent short dark chocolate hair (#38252B), one continuous fitted hair cap with three broad side-swept sculpted locks, neat tapered sides and a natural hairline. No spiky tufts, loose curls, strand spaghetti, pompadour, giant quiff or moustache. Keep eyebrows and entire eyes uncovered. Compact rounded steel pauldrons and breastplate (#8D97B3), substantial gauntlets, shin guards and chunky dark leather boots (#303348). Deep teal cloth tunic and short split tabard (#148B8A), one restrained coral scarf tuck (#E76F71). Silver edges, minimal gold only on a tiny belt clasp.
He holds a BROAD MEDIEVAL HEATER SHIELD, upper corners squared and a pointed lower tip, forearm-mounted, height from shoulder to knee and width about his torso. It has a teal enamel face, thick clean steel rim and ONE simple raised silver brick-shaped crest. Its body is broad and protective, clearly a shield. No stick handle visible, no bat, no racquet, no paddle, no sports equipment, no sword needed.
BOARD LAYOUT: left 52% is one full-body three-quarter-front hero pose, all feet and hair visible, shield forward at left of body and right hand in a compact confident fist. Right 48% contains TWO very large head-and-shoulder expression studies stacked vertically of EXACTLY this same boy, same hair and costume, no text, no frames. Top face is FOCUSED: low inward-angled eyebrows, half-lowered upper eyelids, pupils aimed at an imaginary incoming ball, mouth firmly compressed with an asymmetrical determined corner. Bottom face is SHOCKED/WORRIED: high inner brows, wide eyes, raised lower lids, open rounded mouth with visible inner dark shape, chin drawn in. These emotions must be strongly different and legible at a glance. Face details are integrated into head surface; broad brows and mouth shapes, glossy hazel irises with crisp catchlights. The character is brave and endearing, not a baby, not angry mean, not a middle-aged man.
Materials: satin vinyl skin and hair with subtle clearcoat, brushed silver metal with broad reflections, smooth matte woven cloth without noisy texture. Calm plain navy studio background, a subtle shadow under feet only, no scenery, no props other than shield. Precise clean shapes, beautiful coherent toy sculpture, all views consistent, no labels or typography, no watermark.
```

### Option B

```text
Glossy 3D vinyl-toy render, Blender Cycles look, chibi proportions (head ~40% of height), soft warm key
light from the top-left, cool blue rim light from the right, gentle pink bounce from below, clean
reflections, saturated but not neon colours, minimal yellow, plain dark navy background (#141831),
orthographic front view, no text, no watermark.
Use case: stylized-concept. Asset type: premium mobile game hero design approval board, landscape 1536x1024.
NEW Prince Kit, a brave young male KNIGHT, endearing, bold and exuberant. This is the compact OPEN-FACED HELMET option, visually distinct from bareheaded knights. A lovingly sculpted chunky collectible toy with a large rounded-square head, head ~40 percent of total full-body height, short strong limbs, broad compact body, not a baby. Clean-shaven young face, warm peach skin formed continuously over cheek/jaw/button nose; no mask-like patch, no muzzle, no mustache. Large glossy blue-grey eyes with natural eyelids and very expressive thick dark eyebrows. Face entirely visible.
DESIGN B, BLUE HELMET GUARDIAN: a simple rounded brushed-silver open-faced medieval helmet with a short nose-free brow rim and slim side plates, NO visor across the face, no bars, no mouth guard. Dark charcoal (#253349) hair appears only as a tiny coherent neat fringe beneath the helmet edge, eyebrows fully clear. NO plume, no spikes or horns. Blue cloth hood tucked at the back under the helmet, not around his eyes. Cobalt short shoulder cape and split surcoat (#356AB3), broad silver breastplate and rounded pauldrons (#8D97B3), steel gauntlets and chunky greaves, navy gloves/boots (#26324D). Only a small coral cloth knot (#E76F71) at right shoulder. No gold decoration.
A broad MEDIEVAL HEATER SHIELD on his left forearm, squared shoulders and a shallow pointed lower tip, wide as his torso and reaching from shoulder to mid-shin. Heavy but friendly simple cobalt enamel face with thick steel bevel rim, a single centered silver diagonal lightning-stripe insignia. No rod handle visible: the arm is held BEHIND the protective shield. This is a shield, not a racquet, not a paddle, not a bat, not a disc on a stick. Shield is unmistakably knight equipment. No sword.
BOARD: left 52% one full-body three-quarter-front standing guard pose, shield forward but keep face, helmet, both boots and silhouette clear. Right 48% TWO huge close-up face-and-shoulder studies stacked vertically of EXACTLY the same boy in this helmet, same eye/skin identity and lighting. Upper study is DELIGHTED VICTORY: eyebrows arched happily, eyes nearly closed in proud smiling crescents, wide open asymmetric laughing mouth showing one simple row of teeth, lifted cheeks. Lower study is WORRIED: inner eyebrows high, outer eyebrows drooping, eyes wide and looking upward, lower lids tight, mouth a small open inverted teardrop with dark inside, chin tucked. The happy and worried faces must be dramatically different and very legible, not just different pupils. The open helmet must never hide eyebrows or mouth.
Smooth bevelled shapes, satin vinyl skin, glossy coated armor with broad readable reflections and very limited surface detail, matte cloth, clean construction suitable for a chibi game model. No realism, photoreal humans, noisy metallic scratches or busy engravings. Plain navy studio backdrop with subtle contact shadow only. No scene, no text, no type, no labels or watermark.
```

### Option C

```text
Glossy 3D vinyl-toy render, Blender Cycles look, chibi proportions (head ~40% of height), soft warm key
light from the top-left, cool blue rim light from the right, gentle pink bounce from below, clean
reflections, saturated but not neon colours, minimal yellow, plain dark navy background (#141831),
orthographic front view, no text, no watermark.
Use case: stylized-concept. Asset type: premium mobile game hero design approval board, landscape 1536x1024.
NEW Prince Kit, a brave young KNIGHT. Design C is the resourceful LIGHT-ARMORED WAYFARER knight: a quick, lively little hero with a stout toy body, very short limbs and sculpted head at 40 percent of total height. Expressive distinctive boyish angular-cheek rounded-square face, broad eyebrows, slightly off-center grin and curious wide hazel-green eyes; a young teen, clean-shaven, not a baby or middle-aged man. Warm continuous peach skin form with no separate muzzle, faceplate, rubber patch, cheek seams or mustache.
His copper chestnut hair (#7B3E2E) is a simple COHESIVE SCULPTURE, low short side-parted wave in three broad clumps connected to one snug cap. Tapered close sides and a clean hairline above the brows. Avoid enormous quiff, spikes, separated tubes, horns and curls. Hair softly catches warm light, not yellow or gold.
Costume: dark indigo tunic (#49478A), light brushed silver breastplate (#8D97B3), ONE larger rounded silver shoulder pauldron and smaller opposite shoulder plate for a nimble asymmetric silhouette, simple silver gauntlets and shin caps, heavy navy leather boots (#29324B), short dark navy half-cape ending at hip, a small muted coral scarf (#DE737B) tucked into collar. Big readable armor surfaces, simple broad bevels, no detailed engraving, no gold, no crown. A small patched hem hints underdog without shabby clothes.
His left arm carries a BROAD MEDIEVAL KITE SHIELD: broad shoulders, long downward point, about torso width and shoulder-to-mid-shin height, thick gunmetal beveled rim (#39445E), indigo enamel face and ONE large simple silver chevron crest, a tiny coral cloth tie tucked behind top corner. Clearly protective heraldic shield with arm grip hidden behind it; no front handle, no grip sticking down. No bat, paddle, racquet, skillet or sports equipment; no sword.
BOARD LAYOUT: left 52 percent a full-body three-quarter-front hero view, a lively lightly crouched ready stance with feet apart, entire body and shield clearly visible against navy. No giant foreshortening, no action trails. Right 48 percent contains TWO very large head-and-shoulder close-up studies stacked vertically, EXACTLY same boy and hairstyle/costume. Upper closeup FOCUSED: chin forward, eyes narrow with lids lowered, brows lowered strongly inward, determined tightly pressed lopsided mouth. Lower closeup JOYFUL RELIEF: eyebrows lifting asymmetrically, cheeks raised, wide delighted open-mouth laugh with one clean row of teeth, eyes smiling in unmistakably different apertures from focused. Expressions must read from eye shape, brows and mouth together, large clear forms, no tiny marks.
Materials: coherent satin vinyl collectible toy, sculpted hair and skin, broad glossy metal reflections, matte cloth, clean beautiful construction rather than realistic pores or scratches. Distinctive friendly expressive face, no hyperrealism. Only navy studio background with subtle contact shadow under feet. No labels, no type, no decorative framing, no watermark, no background scenery.
```

## Open question

- Owner review of the completed animated Knight 2 and both phone screenshots remains pending before commit / push.
