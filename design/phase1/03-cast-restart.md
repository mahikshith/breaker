# Cast restart: distinct anatomy options

Status: **Brum selected for first actual model/expression/motion proof; remaining creatures unselected**, 2026-10-18. The owner rejected the repeated long-arm body template in the previous boards. Those boards are withdrawn and archived under ignored `out/rejected-cast-20261018/design/phase1/img/`. The previous draft text is `out/cast/03-long-arm-history.md`. The rejected Ember/Mortar/Polaris production attempt also remains withdrawn, with no active art source or asset family. Knight 2 is unaffected.

## Two revised boards

| Direction | Image | Body plans |
|---|---|---|
| A — Castle Keepers | [Board A](img/cast-v2-anatomy-a.png) | Mosskeeper: short stem and four root feet, no arms. Fen: long-handed woodland courier. Brum: heavy ape-like frost porter. Fen and Brum retain their provisional directions; long arms are specific to those two creatures. |
| B — Orbit Wilds | [Board B](img/cast-v2-anatomy-b.png) | Vesper: low four-legged star cat with steering tail. Rook: genuine feather wings, fan tail, talons and beak. Latch: compact fish body with fins, forked tail and jaw. No humanoid arms or hands in this group. |

Each board includes an attentive/resting main face and two contrasting face studies, plus an honest source strip. The upper images are appearance and anatomy targets. The lower strip shows actual locally imported source geometry. The pictures are **not completed Blender meshes, face rigs, sprites or encounter mechanics**.

The strongest first production group would be three contrasting anatomies, selected individually if preferred. Rook, Vesper and one castle creature give more motion variety than producing six at once. No choice is assumed from that recommendation.

## Anatomy, motion and distinct roles

All roles below are later encounter ideas, not existing implemented systems. Native sizes are planning footprints on the 360-wide field, subject to actual motion bounds after a pick.

| Identity | Preserve / change | Motion and role idea | Face contrasts and planning size |
|---|---|---|---|
| Mosskeeper | Preserve the existing mushroom cap as a reference. Replace the biped stem/arms with a continuous short stem and four stout root feet. No hands, human arms or upright humanoid legs. | Sequential root lift and cap counter-lean; a rooted keeper whose support seals open an exit. It should plant and shuffle, not play a humanoid walk. | Attentive, suspicious squint, surprised gasp. About 80×68 units. The root body and rig are **new and unverified**. |
| Fen | Retain the actual woodland source's broad integrated muzzle, ears, long hands and little feet; periwinkle/dusty coral palette. | Forward hand-braced gait and ear/muzzle reactions; courier whose route offers an optional interception reward. | Resting, determined focus, worried. About 76×68 units. This is intentionally one of the two long-arm creatures. |
| Brum | Retain the yeti's broad shoulder/head mass, long heavy forearms and short legs; ivory with blue face/hands. Keep fur as broad sculpted groups. | Weight-bearing knuckle steps, planted stop, protective upper-body turn; helping it opens a blocked passage. | Resting, welcoming grin, protective anger. About 88×80 units. No shared motion assumption with Fen. |
| Vesper | Use the verified Cat quadruped body/rig rather than the former Alien biped. Preserve four weight-bearing legs and tail. Modestly reshape the tail tip/ear tips and continuous head into a star-cat identity. | Four-paw stalking/walking with counter-steering tail; a signal thief whose tail points toward a changing target. Do not substitute a floating body bob. | Attentive, sly, startled. About 96×54 units including tail. New tail-fin weighting, head shape and facial controls need proof. |
| Rook | Use the verified Eagle bird anatomy, not Birb's wing-arms. Preserve true feather wings, fan tail, talons and beak. Bound the restyle to broad feather groups, material and head/face changes. | Actual flap/glide/bank driven by the source flight rig; a flying courier that reveals a safe shot window. No human hands, shoulder-to-wrist arms or humanoid leg cycle. | Alert, stern, delighted open beak. About 120×72 units at full wingspan. Existing flight is verified; the enlarged readable face and beak expression are **not**. |
| Latch | Use the verified Piranha fish anatomy, replacing the former Cactoro biped. Keep a thick oval body, side fins, short dorsal, forked tail and continuous jaw/gill mass. No arms, roots, hands or manta silhouette. | Tail-driven swim and fin braking, then deliberate bite/jaw beat; an orbital lockfish around a moving relay. This is a compact buoyant sentinel rather than another rooted creature. | Curious, stern warning, joyful relief. About 76×60 units. Rounder body/cheek shapes, gill flare and friendly face still need real deformation checks. |

Existing brick support/collapse, movement, warnings and hit reactions offer reusable building blocks. They do not already implement the proposed objectives, flight positioning, tail targeting, relay state or new powers. This work adds no level, mechanics code, save state or production asset.

## Verified source and licence evidence

### True bird, fish and quadruped

The original creator's [Animated Animales Low Poly upload](https://opengameart.org/content/animated-animales-low-poly) identifies Quaternius as the uploader, marks the pack CC0 and provides the public Animal Pack Vol.2 ZIP. [CC0 terms](https://creativecommons.org/publicdomain/zero/1.0/) permit modification and commercial use.

The exact archive was downloaded successfully, **2,069,972 bytes**, SHA256 `6d8f6789d65dbdb352ebad98a4209f26b41b384e87d81bc05e9ca76139db1248`. Its Eagle, Piranha and Cat `.blend` files were opened with embedded scripts disabled in the installed Blender runtime. Actual source geometry was rendered locally. Every listed clip was evaluated at two distinct poses and showed nonzero bone-pose changes.

| Model | Actual body joints | Actual clips | Mesh vertices / polygons | Important limit |
|---|---:|---|---:|---|
| Cat |24|Idle, Walking|406 /402|No facial shape keys; tail-fin and new face are not source features. |
| Eagle |24|Flying, Idle|768 /784|No supplied facial shape keys or expressive face proof. A clip named Flying is supported by real evaluated wing motion, but a new beak/face rig is not yet demonstrated. |
| Piranha |9|Bite, Swimming|700 /678|No facial shape keys. Generic bone names still need a jaw/fin ownership map before modifying anatomy. |

The legacy materials load as grey in the current Blender version. The new source strip is therefore explicitly labelled **actual geometry / clay**; it does not pretend the colour target is already built. Geometry is unchanged in these source renders. Full source hashes, mesh/material rosters, bone names, actions and evaluated deltas are in `out/cast/anatomy-audit/import-audit.json`. `inspect_anatomy.py` reproduces the audit; source HTML, original ZIP, creator preview, extracted files and source images remain ignored beside it.

### Provisional castle references

The [Ultimate Monsters creator page](https://quaternius.com/packs/ultimatemonsters.html) states CC0 and animated distribution. Valid MushroomKing, Monkroose and Yeti glTF copies were inspected from the [Castle Game Engine example at pinned commit60a49b3](https://github.com/castle-engine/castle-engine/tree/60a49b33914135dbea5dbcd1c040a4bcf08db10e/examples/viewport_and_scenes/occlusion_culling/data/quaternius_ultimate_monsters). The original Drive download is currently quota-blocked, so original-download byte equality is not claimed.

These sources have43 body joints and14 body clips: Death, Duck, HitReact, Idle, Jump, Jump_Idle, Jump_Land, No, Punch, Run, Walk, Wave, Weapon, Yes. Actual Idle/Punch poses were imported and rendered. They have no facial shape keys or jaw/eye bones. Their stock sleepy eyes fail the expression target. That shared rig is used provisionally only for Fen/Brum; **it is not the proposed Mosskeeper root rig**, and it is not reused for Vesper/Rook/Latch.

Detailed evidence remains in `out/cast/source-audit/model-audit.json` and `import-audit.json`. No downloaded model has been admitted to production paths. The [Easy Enemy creator pack](https://quaternius.com/packs/easyenemy.html) was also inspected: its Drive roster includes Rat, Spider, Wasp, Frog and two Snake variants. Rat/Spider/Frog bytes were quota-blocked; none is claimed as an imported or usable rig.

## Required proof after a pick

Before a large animation batch, use the selected actual source model and show one native full body, three visibly different face states and a short real motion proof. Preserve the animal's or root creature's own movement family. Check continuous cheeks/jaw, eyes seated in the surface, lid/brow/mouth changes readable at native size, weight/wing/tail articulation, alpha bounds and stable pivot. Resolve mesh or rig failures before spending time on many frames. Source import success and a polished concept image do not pass those checks by themselves.

For Mosskeeper, the first proof must establish its new root anatomy/rig. For Vesper, prove all four paws support the body and the tail tip follows the spine. For Rook, show genuine wing spread/fold, fan tail and beak continuity. For Latch, show fin/tail propulsion and jaw movement without an attached muzzle/lip. None of these checks is a new owner permission step; no cast production starts until the owner selects a direction, and the final screenshot OK remains required before commit/push.

## Reproduction and status

- Current choices: `design/phase1/img/cast-v2-anatomy-a.png`, `cast-v2-anatomy-b.png` (1536×1480).
- Exact image prompts, including neutral-face refinements: ignored `out/cast/anatomy-prompts.json`.
- Source-strip composition: ignored `out/cast/build_anatomy_boards.py`.
- Source assets/audits: ignored `out/cast/anatomy-audit/` and `out/cast/source-audit/`.
- Previous long-arm boards/text: ignored archive paths recorded above.

The owner selected **Brum** for the first real model, expression and strong-arm motion proof. See `04-brum-proof.md`. The remaining cast directions are unselected; no finished family, encounter integration, commit or push is implied.
