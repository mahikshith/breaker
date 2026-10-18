# Brum: first source model, face and strong-arm proof

Status: the owner selected **Brum** from the castle anatomy board for this first proof. This is a bounded model and motion study, not a finished sprite family or a new playable encounter. The owner also asked that his strong arms eventually smash or bring down bricks in dedicated, escalating levels.

## Identity and model decisions

Brum is a **hero and ally**, a broad frost porter who will use his strong arms to break barriers and protect the others. His angry expression signals protection or effort; it does not make him a villain. He has an ivory coat, an ice-blue continuous face and hands, a dark slate belly and heavy long arms. His neutral, welcoming and protective expressions must read differently at phone size. Long arms belong to this character's lifting and striking role; this anatomy is not a template for the remaining cast. He is not yet playable.

`art/brum.py` retains the actual source body, shoulders, elbows, hands, face hull, mouth cavity and 43-joint body rig. The source coat and forearms are widened, hands thickened, fingers articulated into fists and a small number of broad coat locks added. The source face is deformed directly around its existing mouth opening. There is no covering cheek, lip, muzzle or jaw object.

The first proof's grey collar and three separate chin locks were rejected as a finish issue. **Coat-v7 replaces them with one joined fur coat**, including a broad beard fitted to the measured, subdivided source jaw rim. The original outer face boundary stays fixed during expressions; the beard is attached to the same head rig and the source face is never remeshed. The open source coat is closed as a thin shell, joined with its broad fur groups, smoothed and given transferred source bone weights. All 66,112 resulting coat vertices have normalized weights, measured range 0.99999980–1.00000019. This is render geometry, not a proposed live 3D mesh budget.

The original white eye surfaces have rectangular openings for their original pupil inserts. Removing those inserts exposed visible rectangular holes. Only the two eye surfaces are replaced with closed ellipsoids at the measured source centers, with procedural irises, fitted movable lids and brows. The original skin and eye sockets remain. The happy state closes the eyes with fitted arcs; the protective state narrows the lids and lowers the inner brows.

The source's animation channels hold all fingers open. Those identity finger channels are removed and the original finger chains form a fist for Idle, Walk and Punch. The Wave action retains open hands. Body motion remains based on the real source actions, rather than a static sprite bob.

## Provenance and reproducibility

The creator's [Ultimate Monsters pack](https://quaternius.com/packs/ultimatemonsters.html) is distributed under [CC0](https://creativecommons.org/publicdomain/zero/1.0/). The valid inspected copy is [Yeti.gltf at Castle Game Engine commit 60a49b3](https://raw.githubusercontent.com/castle-engine/castle-engine/60a49b33914135dbea5dbcd1c040a4bcf08db10e/examples/viewport_and_scenes/occlusion_culling/data/quaternius_ultimate_monsters/Yeti.gltf). The original Drive download was quota-blocked; byte equality with that blocked archive is not claimed.

- SHA256: `b9c088fbcd357b82f3cb9a3f33a6b5c5603d3e55958a695e2bd9e419cc6527fb`.
- Actual source: 43 joints, 14 body actions, embedded buffers, no external texture requirement.
- Actual face limitation: no supplied facial shape keys or jaw/eye bones. The fitted face controls in this proof are new.
- Audited source remains ignored at `out/cast/source-audit/Yeti.gltf`; it has not been admitted to production assets.
- Topology and evaluated clip evidence: `out/brum-proof/source-topology.json`, `source-motion.json`.

Run with the installed Python runtime containing Blender 5.2.2, Pillow and NumPy:

```powershell
$taskPython = Join-Path $env:LOCALAPPDATA 'Programs\breach-tools\python313\Scripts\python.exe'
& $taskPython art/brum.py out/brum-proof/final-body Neutral:1 Welcome:1 Protective:1 --samples 32 --threads 2
& $taskPython art/brum.py out/brum-proof/final-quarter Neutral:1 --yaw 30 --samples 32 --threads 2
& $taskPython art/brum.py out/brum-proof/face Neutral:1 Welcome:1 Protective:1 --face --samples 32 --threads 2
& $taskPython art/brum.py out/brum-proof/final-motion Punch:10 --yaw 65 --samples 24 --threads 2
& $taskPython art/brum.py out/brum-proof/final-gaits Idle:4 Walk:6 --yaw 30 --samples 24 --threads 2
```

Every run saves stripped RGBA PNGs, a reproducible `.blend` and a JSON report under its output directory. Full-body output is checked for nonempty alpha and clipping. Face portraits intentionally crop the body.

## Current review files

- `out/brum-proof/coat-v7/model-review.png`: the three revised expressions, front/quarter body, native body and face comparison beside Kit/Lumi.
- `out/brum-proof/coat-v7/motion-review.png`: actual revised-coat windup, measured contact and recovery.
- `out/brum-proof/coat-v7/continuity-review.png`: before/current quarter clay surfaces.
- `out/brum-proof/coat-v7/comparison.png`: first/current coat closeup.
- `out/brum-proof/coat-v7/key-poses.gif`: three actual key poses, explicitly a timing study rather than a finished animation loop.
- Original `out/brum-proof/{punch,idle,walk}.gif`: the first coat version's evaluated source motion, retained as versioned history.

The focused repair passed an independent visual review of the original collar/pendant blocker. Neutral, Welcome and Protective were also inspected for exposed coat through the mouth and changing jaw gaps; none was seen. These are first model proofs, not owner-approved finished assets.

## Technical proof contract

| Property | Current proof |
|---|---|
| Camera | Orthographic, frontal and genuine 30-degree quarter; Punch study at 65 degrees |
| Pixel density | 3 pixels per world unit |
| Full-body cell | 144 by 128 world units / 432 by 384 pixels |
| Ground pivot | 72,116 world units / 216,348 pixels |
| Character reference height | 80 world units, calibrated from evaluated Idle geometry |
| Face portrait | 512 by 512 pixels, consistent 1.48-model-unit camera span |
| Current families | Three still expressions; four Idle, six Walk and ten Punch samples only |
| Proposed eventual use | Small separate encounter family, not included in the current game bundle |
| Current collision role | None: no runtime integration |

Punch source range is frame 0–20.8: backswing around 20%, forward travel around 40%, maximum forward reach around 60%, recovery around 80–100%. These are measured pose phases. A contact target in the proof is a timing study, not implemented brick collision, damage, collapse or a completed level power.

## Review limits and next work

Inspect the native body beside actual Lumi and Kit, all three closeups, front/quarter clay continuity and the real arm motion. The source import and passing image checks do not establish finished visual quality. The focused coat repair is versioned at `out/brum-proof/coat-v7/`; the original first-proof boards remain unchanged. Remaining review should focus on hands remaining solid through the strike, eyes seated in their sockets and protective expression readability at native size. A full motion family has not been rendered for the revised coat.

No `assets/brum` family, gameplay behavior, new chapter, packer change, commit or push is part of this proof. A chosen future Brum encounter still needs its own level/objective design and hard-but-winnable playtests. The final screenshot approval before commit/push remains required.
