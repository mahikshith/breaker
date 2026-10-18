# Menagerie cast directions

Status: **WITHDRAWN — CONCEPT HISTORY ONLY, 2026-10-18.** The owner rejected all six real cast proof images and asked to scratch and redesign the entire set, especially the last two creatures. The earlier selection of B and its production authorization are revoked for these builds. Ember/Mortar/Polaris are not approved production assets, and the descriptions, targets and proposed encounters below are historical references only. Their source/proofs were removed from active art/asset paths and preserved in ignored `out/rejected-cast-20261018/`. Knight 2 remains selected and is outside this rejection. See `03-cast-restart.md` for the replacement direction and feasibility audit; no replacement is selected yet.

## The two boards

| Direction | Image | Cast, left to right | What changes between encounters |
|---|---|---|---|
| A — Space Wardens | Historical board in ignored `out/rejected-cast-20261018/design/phase1/img/cast-a-space-wardens.png` | Warden Core; Comet Kraken; Stardock Snap | Stop a prison machine, release an ice captive, intercept a moving cargo shipment. |
| B — Castle to Cosmos | Historical board in ignored `out/rejected-cast-20261018/design/phase1/img/cast-b-castle-to-cosmos.png` | Ember; Mortar; Polaris | Shut down a furnace, dismantle a walking fortress, escort an airborne creature out of the prison. |

Both images are 1536 × 1024, RGB, opaque navy. The upper row shows three complete silhouettes; the lower row shows large alternative expressions of the same creatures. They are concept boards, not atlases or production sprites. The owner can choose a direction or individual creatures; selecting a board does not require building all three at once.

**Selected direction: B.** Ember carries the story plan's companion role; Mortar and Polaris expand the cast with a heavy ground creature and a flying silhouette. A remains unselected reference material.

## Visual contract

- Keep the existing top-left warm key, cool right fill, restrained pink bounce, orthographic camera and AgX Medium High Contrast. Background stays plain navy `#141831`; the environment behind a future fight stays dark and desaturated.
- Match Lumi's expressive eyes/lids/brows/changing mouth, Gnash's strong silhouette, and the Clanks' face/body value separation. These are different species with their own facial construction, not copies of the human head.
- Use broad satin-vinyl forms, glossy enamel and bevelled metal/stone. Reduce the concept's incidental scuffs, small suckers and tiny joints when it becomes a sprite. No realistic fur, strand hair, noisy cracks or particle halos.
- No recoloured serpents. The core is upright and angular; Kraken is wide/radial; crab is low/asymmetric; dragon is four-legged/winged; golem is heavy/blocky; manta is flat/kite-shaped.
- No repeated cage-and-princess ending for every encounter. Lumi and Kit remain the story cast; each new creature must introduce a different goal, reveal or relationship. Creature release is a story resolution, not permission to clone the existing Vault race.
- Yellow is limited to tiny reflected highlights; no yellow costume, fire wall or gold background.

## Palette and native footprint

All footprint dimensions are proposed **world units** on the 360-wide field, including appendages in the neutral pose. They are deliberately larger than the 42-unit humanoids so creature faces can remain readable. They are visual budgets, not collision boxes; exact shapes and safe placement follow the selected level.

| Creature | Body / secondary / accent hex | Intended display footprint | Face target and silhouette lock |
|---|---|---|---|
| Warden Core | Gunmetal `#39445E`; steel `#AEB8CF`; cyan `#2EC4B6`; coral tab `#FF6F61` | 88 × 96 | One inset eye about 14 units across; moving brow shutter and square mouth. Floating gate-shaped body, no orb. |
| Comet Kraken | Ice `#7FD6FF`; ivory `#E3ECF6`; violet tips `#8F5CF0`; indigo brows `#49478A` | 128 × 96 | Broad 48-unit face with two readable eyes. Six thick short arms in a low fan; no long snake-like ribbons. |
| Stardock Snap | Coral `#FF6F61`; teal `#22C4B0`; gunmetal `#39445E`; steel `#AEB8CF` | 112 × 72 | Eye-stalk pair stays short and thick; dark brows and mouth visible. One larger claw creates asymmetry. |
| Ember | Coral `#E96B65`; slate-violet `#5963A7`; cream-peach `#F5C5B0`; dark brow `#38252B` | 112 × 92 | Rounded-square face about 44 units wide, short muzzle, large eyes. Four legs, small wings, short tail. |
| Mortar | Stone `#4A4F6E`; enamel blue `#4F9DFF`; ivory edges `#D7DDED`; dark recess `#22284A` | 112 × 112 | Two inset eyes, moving block brows and rectangular mouth in one continuous central block. Broad shoulders/fists. |
| Polaris | Teal `#22C4B0`; blue `#356AB3`; ivory `#E3ECF6`; coral brow/cheek `#FF6F61`; steel `#AEB8CF` | 144 × 76 | Eyes and mouth occupy the central 48 units. Wide swept wings, short plated tail; no tentacles. |

Warm light target: `#FFDBB8`. Cool fill: `#8CA6FF`. Pink bounce: `#FF80A6`. Materials must distinguish skin/shell, cloth if present, enamel, metal and ice through broad reflection/roughness changes rather than added texture noise.

## Personality, expressions and animation intent

These are art targets. Their suggested timing is not implemented and is not a gameplay balance claim.

| Creature | Personality | Required emotional contrast | Motion to prove in a small asset test |
|---|---|---|---|
| Warden Core | Stern, officious, brittle | Suspicious narrow eye → shocked wide eye/square mouth → reluctant defeated droop | Idle levitation ±2 units over 1.6 s, sine easing. Halt gesture raises palm about 12 units in 0.30 s, easeOutQuad. Damage tilts brow +18° and opens mouth over 0.12 s. Hands remain outside the face. |
| Comet Kraken | Grumpy, captive, tender | Braced glare → startled fear → delighted relief with smiling eye arcs/open laugh | Mantle squash 1.00 → 0.95 → 1.00 over 1.2 s; arms move in two opposing broad groups. Warning raises two front arms 18° over 0.50 s. Freed wave curls one short arm over 0.45 s. No moving chain segments. |
| Stardock Snap | Cocky, busy, indignant | One-brow smirk → outraged open mouth → dizzy eyes and sagging claw | Two alternating leg groups produce a clean four-step scuttle. Large claw opens 0 → 30° over 0.45 s, holds visibly, then snaps shut in 0.10 s. Leg/claw action cannot obscure eye-stalks. |
| Ember | Stubborn, proud, loyal | Defiant glare → hurt/worried → bashful laugh and relaxed brows | Clear four-foot idle and weight shift. Breath warning draws chest back about 4 units and unfolds wings 12° over 0.65 s; exhale pose lasts about 0.25 s. Separate effects stay outside the face and require later gameplay work. |
| Mortar | Tired, dutiful, gentle | Heavy suspicious lids → startled raised brows/open mouth → relieved lopsided smile | Heavy torso settles 3 units over 0.8 s. Fist raises 16 units over 0.60 s and lands in 0.14 s; the camera shake is a separate future event. Face blocks move as intentional lids/brows, never loose rubble. |
| Polaris | Sly, skittish, hopeful | Confident grin → worried high inner brows → relieved open smile | Wings move in a broad 0° → +10° → −6° → 0° cycle over 1.4 s. Tail plates follow with a small delayed arc. Warning banks 12° over 0.55 s while the face stays visible. |

Every selected creature needs neutral, alert, attack warning, hurt, shocked, defeated and relieved states. The exact required set follows its chosen role; no full family is rendered before the source geometry and motion proof pass.

## Distinct encounter ideas and implementation boundary

The current game has coloured/armoured bricks, descending formations, robot bolts, a mothership HP fight, support collapse, Focus aim, existing power-ups and the Vault serpent/cage flow. None of the six new creatures or the objectives below exists in production. Existing building blocks reduce implementation work; they do not make a new objective a cosmetic reskin.

| Creature / setting | Goal and reveal | Distinct pressure/attack beat | Existing pieces that help | New work required after selection |
|---|---|---|---|---|
| Warden Core / Break Out transfer gate | Disable three prison relays, then expose the core. Reveal that the Vault is one wing of the Menagerie. | The core marks one lane before closing a gate there; the player routes shots to the other relays. Defeat opens the exit rather than freeing another caged princess. | Brick HP, aim preview, robot warning timers, boss HP, collapse effects. | Relay-state objective, lane/gate telegraphs and collision rules, core hit windows, escape completion. No moving gate is implied by existing brick art. |
| Comet Kraken / tethered ice dock | Break the ice anchors holding the creature; it reveals a route or map when released. | A clear eye/arm warning precedes an ice pulse on one marked lane. The captive's anger gives way to relief when the last anchor breaks. | Armoured bricks as a blockout stand-in, existing split/slow pickups and hit feedback. | Distinct anchor tracking, non-lethal release state, pulse behavior. Frozen balls/slippery controls from the later story plan are future tuning decisions, not part of this concept pass. |
| Stardock Snap / salvage dock | Intercept three marked cargo crates before the shipment exits; Snap is a worker guarding the haul, not another princess captor. | One claw advertises its next side before it shoves a cargo row; covering a prize creates an aiming choice. | Formation movement, power-brick markers, warning timing and loss line. | Cargo identity/count, exit route and shove rule, crab interactions and resolution. Capturing every ordinary brick is not assumed to fulfil the cargo objective. |
| Ember / furnace wing | Shut down the furnace vents, then release Ember from the collector's restraint. The creature becomes a potential companion. | A chest inhale and wing spread precede a single marked breath lane. Early play teaches a safe vent before a combined sequence. | Tough bricks, existing FIRE effect and damage feedback. | Vent shutdown states, breath collision, safe-lane telegraph, restraint/release ending. Spreading or re-hardening lava is later gameplay work. |
| Mortar / walking storage fortress | Knock out supporting seals in a chosen order to expose a protected keystone. Reveal a weary guardian keeping the wing from collapsing. | One large fist winds up over a marked column; removing a support opens an angle but drops debris. | Vault support flood fill, rigid falling bricks, armour HP, paddle/debris feedback. | Golem hit regions, ordered seal/keystone state, moving arm collisions and recovery windows. Existing collapse mechanics do not supply these boss rules. |
| Polaris / magnetic transfer hall | Open sequential flight locks and escort the creature through; maintain an exit route instead of fighting another chaser. | A wing-tip charge points to an upcoming lane sweep. The player clears the next lock while the manta banks through the previous one. | Brick clearing, aiming, formation movement as a rough motion blockout. | Escort path/checkpoints, lock selection, warning/sweep behavior and non-combat victory. Magnetic force on balls is a separate physics change and is not included. |

These ideas are intentionally different in objective and pacing. They are not requests to build six chapters now. First select a cast direction, then choose one encounter and prove its short learn → practice → pressure loop with greybox art.

## Source, rights and feasibility audit

- The available local character bases are `assets/models/kk_Knight.glb`, `kk_Rogue.glb` and `kk_Mage.glb`, documented as KayKit Adventurers CC0 in the handoff. None is a suitable creature base for these six designs. No new third-party creature model, texture, rig or animation was acquired.
- Reuse the project's material/light functions from `art/render_vault_assets.py`, face-construction techniques from `art/princess.py` and `art/snake.py`, and the robot plate/lid/mouth approach in `art/render_invasion_assets.py`. Reuse methods, not a human body with an animal head attached.
- Warden Core and Mortar are practical custom meshes from bevelled blocks with pivoted hard-surface parts. Warden is the lowest modelling/rig risk. Mortar still needs a coherent heavy stance and face seams that read as stone construction.
- Snap needs an authored crab shell plus separate claw/leg hinge pivots; its mechanical rig is manageable, but every leg/claw clearance must be checked.
- Polaris needs a continuous kite-shaped mesh with two broad wing deformations and a short tail chain. Avoid trying to fake the face with floating spherical cheek patches.
- Kraken requires a custom continuous mantle and six-arm deformation rig. Ember requires an actual quadruped/wing rig, consistent feet and sculpted muzzle. They have the highest anatomy/animation risk; no existing KayKit clip proves their motion.
- The supplied boards are appearance references, dated 2026-10-18, and contain no shipped production geometry. Save future source meshes and material setup beside their sprite scripts. If a suitable external base is later proposed, verify its original source/license and preserve the proof before importing it; nothing here approves an unknown license.

## Proof and review before a full batch

1. Lock one creature's silhouette/palette and its intended native footprint. Test a flat grey silhouette beside Kit, Lumi, a 12-unit ball and representative bricks.
2. Build its actual mesh, face and key pivots. Render neutral, strong warning and relieved/hurt poses from front and the gameplay camera. Inspect a native-size view against both calm navy and the actual level.
3. Prove a short idle and a warning-to-recovery animation. Look for changing volume, detached eyes/brows, sliding feet, clipping and unstable sprite origin. A nice still image is insufficient.
4. Specify every collision shape separately from the artwork. Verify the creature cannot hide the ball, HUD, paddle or thumb area; only then wire a single greybox encounter.
5. Finish the selected sprite sets after internal proof checks and repairs. Capture iPhone 393 × 852 with safe insets 59/34 and Android 412 × 915 with 32/24 in the asset-preview harness. Show native screenshots and animation previews; the owner's final OK is required before commit or push.

No new source exports, runtime registry entries, packer keys, level classes or save-data fields were added in this concept pass. There are no additional dependencies or framework changes.

## Exact concept prompts

### A — Space Wardens

```text
Glossy 3D vinyl-toy render, Blender Cycles look, chunky stylized game proportions, soft warm key light from the top-left, cool blue fill from the right, gentle pink bounce from below, clean broad reflections, saturated but not neon colours, minimal yellow, plain dark navy background (#141831), orthographic three-quarter-front view, no text, no watermark.
Use case: stylized-concept. Asset type: landscape 1536x1024 cast-direction approval board for BREACH, a portrait glossy-brick action game. This is a coherent family of THREE completely different new expressive space creatures, not snakes, not recolors of one animal, not humanoid princes or princesses. Compose three equal clear columns with generous navy gaps. Top two-thirds: one complete creature per column, all appendages contained. Bottom third: one very large alternate-expression closeup matching the character directly above it. No labels or UI. These are simple buildable satin-vinyl sculptures with restrained bevelled geometry, NOT hyperdetailed figurines.
LEFT: WARDEN CORE, a floating architectural prison guardian. Chunky upright graphite hexagonal block body with two broad articulated blocky hands, an inset cyan glass eye on a black faceplate, a heavy pale-steel movable brow shutter and a small clearly expressive mouth slit; no legs, no round orb body. Two thick shoulder slabs flare outward like castle gate lintels. Body gunmetal #39445E, ivory steel edges #AEB8CF, restrained cyan #2EC4B6 lens, one coral warning tab #FF6F61. Main figure gives an imperious suspicious narrow-eyed squint with hand raised palm-out to halt escape. Bottom face study is SHOCKED: iris smaller, eye very wide, brow tilted up, mouth open into a dark squared O, cracked composure. Large simple shapes, no tiny circuit lines, no floating orbit rings.
CENTRE: COMET KRAKEN, a captive ice cephalopod with a broad pear-shaped ice-blue mantle, TWO big glossy expressive eyes, thick indigo eyebrows, small integrated dark mouth, and SIX SHORT THICK lobed arms spreading in a low fan. Clearly an octopus-like creature, a wide radial silhouette rather than a long snake. Mantle pale ice #7FD6FF, underside ivory #E3ECF6, arm tips violet #8F5CF0. One chunky translucent ice collar behind the head, with broad geometric facets and NO icicles covering the eyes. Main figure grumpy, brows down, arms braced. Bottom face study is DELIGHTED RELIEF with upward smiling eye arcs, lifted brows and a broad D-shaped open laugh; one short arm lifted by the cheek. No long thin tentacles, no tentacle chains, no full-body glow.
RIGHT: STARDock SNAP, a squat armored space crab salvage worker. Wide low coral shell #FF6F61 with teal #22C4B0 small side panels, four short chunky dark mechanical walking legs, two LARGE asymmetrical boxing-mitten claws, expressive round blue-grey eyes on very short stout stalks set into the shell, dark eyebrows and small sideways grin. Left claw larger than right creates an instantly different asymmetric silhouette. Steel hinge joints simple and few. Main figure cocky, one brow lifted, claw proudly raised. Bottom study is OUTRAGED, narrowed eyes and open horizontal protesting mouth, claws framing but never obscuring the face. No huge antennae or fine robot greebles.
LOCKS: share warm key, cool fill, satin skin/shell and moderately glossy metal; large dark/light face separation like toy robots, expressive lids and brows, mouth shape changes. Keep creatures visually distinct: upright angular floating block, wide soft radial cephalopod, low wide clawed crab. No scenery, no weapon projectiles, no bright background stars, no ground platforms, no captions, no humans, no yellow-heavy palette.
```

### B — Castle to Cosmos

```text
Glossy 3D vinyl-toy render, Blender Cycles look, chunky stylized game proportions, soft warm key light from the top-left, cool blue fill from the right, gentle pink bounce from below, clean broad reflections, saturated but not neon colours, minimal yellow, plain dark navy background (#141831), orthographic three-quarter-front view, no text, no watermark.
Use case: stylized-concept. Asset type: landscape 1536x1024 cast-direction approval board for BREACH, a portrait glossy-brick adventure game. THREE completely different expressive creatures that connect a toy castle to a cosmic menagerie. Three equal columns with generous plain navy gaps. Top two-thirds: one complete creature in each column, all limbs/wings contained. Bottom third: one very large alternate-expression closeup per creature, exactly matching its identity above. No text, no labels, no UI, no scenery. Buildable simple satin-vinyl forms and broad bevels, not detailed collectible figurines.
LEFT: EMBER, a stout juvenile quadruped DRAGON, broad short torso, four distinct powerful toy legs, compact upright chest, large rounded-square head with angular cheek planes, two short backward slate horns and TWO small thick folded wings. Wide pinkish-coral #E96B65 body, slate-violet #5963A7 back plates, cream-peach #F5C5B0 muzzle/underside. Short blunt tail ending at one big triangle, never long sinuous snake-like body. Eyes large amber-brown but no yellow body, strong dark brows, integrated button nostrils and mouth. Main body crouches in stubborn defiance, wings cracked open, brows down, small visible teeth. Bottom head study is BASHFUL HAPPY RELIEF: one raised inner eyebrow, half-smiling eyes, a broad genuine open-mouth laugh, blush, no flame effect. Dragon reads four-legged winged animal immediately, never a snake with wings.
CENTRE: MORTAR, an enormous broad-shouldered castle-brick GOLEM. Squat stacked rectangular starglass-stone body, two disproportionately large blocky fists and two short feet, VERY small thick waist and no neck; about twice as wide as Ember. Huge trapezoid shoulder blocks with clean beveled planes. Indigo-grey stone #4A4F6E, blue #4F9DFF glazed face and chest insets, ivory #D7DDED scuffed edges. Face carved into ONE central broad block with two warm ivory eyes, dark wide eyelid slabs, chunky raised brow blocks and expressive mouth opening, not a smooth robot visor. A single large square blue keystone is set in the chest, subtle reflective enamel not neon emission. Main figure weary suspicious guardian with low brows and heavy elbows. Bottom head study is STARTLED: lifted brow blocks, wide asymmetric eyes, open rectangular mouth, large clearly readable planes. No tiny cracks, moss, rubble scenery, overlaid runes or noisy gravel texture.
RIGHT: POLARIS, a MAGNETIC SPACE MANTA. Broad flattened diamond-kite body, two large swept triangular wing-fins, central raised head with huge glossy dark eyes, strong coral eyebrow ridges and a small dark grin. Three compact segmented tail plates taper to a short triangular fin, not a whip tail. Dominant teal #22C4B0 upper surface, deep-blue #356AB3 back, ivory #E3ECF6 belly, two small coral #FF6F61 cheek plates. A pair of thick steel crescent-like magnetic fin tips are integrated at the left/right wings, same body scale, no satellites. Main figure buoyant sly smirk, broad wings held in an easy glide. Bottom closeup is WORRIED: eyes opened wide, raised inner brow ridges, small inverted curved open mouth. Maintain friendly monster personality, simple toy sculpture, no realistic fish skin, no tentacles, no ice crystals, no particle trail.
LOCKS: creatures must have radically different silhouettes and faces: compact four-leg dragon, heavy block golem, flat flying kite-manta. All have coherent continuous face surfaces, large expressive eye/lid/brow/mouth changes and strong native-mobile-size silhouettes. Warm top-left key, cool right fill, pink bounce, navy backdrop. Materials use clean broad highlights and restrained detail consistent with glossy vinyl characters and glazed ceramic brick game pieces. No tiny hair/scales/textures, no photoreal pores, no extra creatures, no yellow fire, no snakes, no crown or princess, no text, no watermark.
```

## Historical production attempt — withdrawn

- The B attempt is rejected. Its new source and assets were removed from production paths; proof renders, source and `.blend` files are retained only under ignored `out/rejected-cast-20261018/`.
- No full animation batch was produced, no encounter behavior was built, and this cast has no active runtime or packer integration.
- New directions are options in `03-cast-restart.md`; no replacement is selected. Do not resume the rejected family under new names.

