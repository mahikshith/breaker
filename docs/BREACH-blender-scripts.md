# BREACH: Blender and art scripts (reference for how every asset is built)

Companion to `docs/BREACH-ChatGPT-handoff.md`. Every script below is in the repo, https://github.com/mahikshith/breaker, at the path shown. They run headless with Blender 5.2 as a Python module:

- Python 3.13, then `pip install bpy==5.2.2 pillow numpy`;
- Cycles on the CPU.

The order of work is render, post-process, `python3 tools/pack_art.py`, then `npm run build`. Before committing, strip the PNG metadata (doc 02, section 3).

Design rule for anything new: reuse these materials, this light rig and this face rig, so new art matches the existing art.

## Index

| Script | Status | What it does | Run | Output |
|---|---|---|---|---|
| `art/fantasy-machinery/extract.py` | Keep machinery extraction | Extracts separate characters, ramps, gates, raft frames, architecture and bricks from preserved source sheets, normalizes pivots and strips image metadata. | `python art/fantasy-machinery/extract.py` | assets/fantasy-machinery/ |
| `art/fantasy-machinery/measure.py` | Keep collision measurement | Measures conservative opaque circle unions for Korr poses and the original Nerra parts; the frozen manifest records source-to-world transforms. | `python art/fantasy-machinery/measure.py` | assets/fantasy-machinery/manifest.json and art/fantasy-machinery/proof/ |
| `art/fantasy-machinery/extract-nerra-v2.py` | Smaller chain-pulling Nerra | Normalizes four supporting-foot poses, exact shoulder sockets, chain-holding claw and repeatable chain links in an independent versioned manifest. | `python art/fantasy-machinery/extract-nerra-v2.py` | assets/fantasy-machinery/nerra-v2-manifest.json and art/fantasy-machinery/nerra-v2-data.mjs |
| `art/fantasy-machinery/verify.py` | Frozen keep art verification | Verifies source/runtime hashes, opaque collision proxies, transparent holes, metadata and release aperture limits. | `python art/fantasy-machinery/verify.py` | Verification output; no asset mutation |
| `art/fantasy-machinery/extract-water-shot.py` | Tidewheel water projectile | Normalizes the dimensional water shot around its measured front-core pivot; preserves the source, strips metadata and records the soft foam collision approximation. | `python art/fantasy-machinery/extract-water-shot.py` | assets/fantasy-machinery/water-shot.png and water-shot-manifest.json |
| `art/fantasy-machinery/extract-reactions.py` | Keep reaction poses | Extracts separate fury, dazed and fainted poses with registered feet, shoulder sockets and measured live-fury geometry. | `python art/fantasy-machinery/extract-reactions.py` | assets/fantasy-machinery/reactions-manifest.json and reaction PNGs |
| `art/snake-emerald/extract.py` | Emerald snake expressions | Normalizes ten authored expressions, mirrors the left row, maps legacy aliases and records measured mouth outlets while preserving the gameplay core. | `python art/snake-emerald/extract.py` | assets/snake-emerald/ and art/snake-emerald/proof/ |
| `art/frost_warden.py` | Frost Warden runtime family | Separate hostile Yeti palette and seven real rig clips. Retains Brum ally source, measures projected hand and torso collision anchors, and renders 28 poses for the fifth princess encounter. | `python art/frost_warden.py art/frost-warden/renders --samples 16 --threads 4 --yaw 65` | art/frost-warden/renders/ and assets/frost-warden/ after packing |
| `art/frost-warden/pack.py` | Frost atlas normalization | Normalizes rendered poses to 256x228 with fixed pivots, strips PNG metadata, preserves actual measured anchors and records source/runtime hashes. | `python art/frost-warden/pack.py` | assets/frost-warden/warden.png and manifest.json |
| `art/space/weapons_v2.py` | Rejected historical study | Dimensional dark-metal charge clips and preserved flight/impact drafts for the replacement ship weapon review. Only charge atlases are complete; current single-frame payloads and Canvas motion remain outside gameplay. See design/phase1/weapon-vfx-v2-review.md and its asset report. | `python art/space/weapons-v2/validate.py` | design/phase1/weapon-vfx-v2/; saved scenes in art/space/weapons-v2/ |
| `tools/archive_artwork.py` | Artwork preservation | Verifies preserved originals, stores new versions byte-for-byte, deduplicates identical artwork and updates the reusable catalogue and space-board gallery. Scope and backup limits are in docs/ARTWORK_LIBRARY.md. | `python tools/archive_artwork.py` | artwork-library/manifest.json, CATALOGUE.md, SPACE_BOARDS.md and preserved files |
| `art/space/circuit/prepare.py` | Selected isolated review | Circuit skiff poses, measured emitters/cradle/lip and real B port leaves. Preserves original source family and emits stripped PNGs/normalized collision manifest; no permanent menu or APK admission. | `python art/space/circuit/prepare.py` | assets/relay-circuit/manifest.json and PNG family |
| `art/space/forge/prepare.py` | Selected isolated review | Forge frame/coil/hinged cover, real C hull, external reactor/arm, cannon, panels and dark Saturn. Source-alpha ownership and measured contours preserve actual physical openings. | `python art/space/forge/prepare.py` | assets/orbital-forge/manifest.json and PNG family |
| `tools/space-assets/pack-level-family.py` | Isolated runtime utility | Sizes selected level textures to phone resolution, writes lossless WebP and asserts exact resized-reference RGBA plus native-scale fidelity; source collision and anchors stay authoritative. | `python tools/space-assets/pack-level-family.py <manifest> <out>` | ignored runtime textures and report.json |
| `art/render_vault_assets.py` | Production | The Vault: background plate, iron cage bars layer, glazed brick sprites (5 colours x 2 widths x damage states, gold gem, granite), chrome ball/fire/titan balls, paddle, power-up capsules. Defines the shared look: glazed-ceramic and vinyl materials, key/fill/bounce area lights, softbox reflection plane, ortho camera, AgX Medium High Contrast. | `python3 art/render_vault_assets.py all|plate|bars|sprites|post [--fast] [--threads N]` | art/out/vault_raw/ then assets/vault/ (via vault_post.py) |
| `art/vault_post.py` | Production (no Blender) | Pillow/numpy post-process for the Vault renders: glows, splits the paddle into stretchable caps and middle, builds atlas.json and preview sheets. | `python3 art/vault_post.py` | assets/vault/ |
| `art/render_invasion_assets.py` | Production | Invasion: hangar plate, candy/armour/power bricks, toy robot invaders (7 expressions x colours), the mothership with alien pilot (5 expressions and rim lights), bolt and bomb. Imports the Vault materials and light rig so both levels match. | `python3 art/render_invasion_assets.py all|plate|static|ship|bots|sprites|post` | art/out/invasion_raw/ then assets/invasion/ |
| `art/invasion_post.py` | Production (no Blender) | Pillow/numpy post-process for Invasion: LED and plasma glows, calm/dim passes, atlas.json, contact and composite sheets. | `python3 art/invasion_post.py` | assets/invasion/ |
| `art/princess.py` | Production, the model for every new character | Princess Lumi from the KayKit Rogue (CC0): atlas recolour, tiara, bell skirt, and the expressive face rig (glossy eyeballs with iris/pupil/catch-lights, skin lids with lash line, brows, reshaping mouth decal, blush) with per-animation expressions. Prince Kit should be built the same way from kk_Knight.glb. | `python3 art/princess.py assets/princess Idle:16 Cheer:16 Running_A:12 ... [--face] [--samples N] [--threads N]` | assets/princess/<Anim>_NN.png |
| `art/kit.py` | Production, selected Knight 2 | Open-helmet cobalt knight from KayKit Knight (CC0): continuous skin, fitted expressive face, hand-mounted heater shield and eight real rig animation families. Supersampled output is normalized to 168-pixel cells with fixed feet anchor; presentation portraits/turnaround are separate. | `python3 art/kit.py assets/kit Idle:16 Focus:12 Grin:12 Shock:8 Worried:12 Cheer:16 Hurt:8 Laugh:16 [--face] [--yaw N] [--samples N] [--threads N]` | assets/kit/<Clip>_NN.png; out/kit-proof/kit.blend |
| `art/kit_cast.py` | Production, selected cast A | Spinning heater shield and unfolding brick armour. Sixteen Spin and twelve Armour frames deliver the existing timed Ward without a connecting light trail or changed defence deadlines. | `python3 art/kit_cast.py assets/kit-cast [--samples N] [--threads N]` | assets/kit-cast/Spin_NN.png and Armour_NN.png; ignored out/kit-cast-proof/ |
| `art/brum.py` | Proof only, selected Brum | Bounded Yeti model/expression/motion proof: continuous source mouth and face, repaired eye surfaces, fitted lids and real articulated fists. Uses the verified CC0 source hash documented in design/phase1/04-brum-proof.md. No finished sprite family or encounter is implied. | `python3 art/brum.py out/brum-proof/front Neutral:1 Welcome:1 Protective:1 [--face] [--yaw N] [--samples N] [--threads N]` | ignored out/brum-proof/ PNGs, proof.json and editable scene |
| `art/vesper.py` | Proof only, selected Relay Raiders | Bounded quadruped Cat source proof: continuous feline face, three expressions, four-paw skiff fit and retargeted Walk contact/loop checks. No finished sprite family, steering/flight system or playable encounter is implied. | `python3 art/vesper.py out/relay-proof/vesper/front Curious:1 Focus:1 Alarm:1 [--face] [--view N] [--samples N] [--threads N]` | ignored out/relay-proof/ PNGs, proof checks and editable scene |
| `art/snake.py` | Production | Gnash and the jade warden variant: angular faceted viper head with brow plates, hinged jaw and expressive eyes, 13 expressions in left/right facings. The body is drawn in code with the matching palette. | `python3 art/snake.py assets/snake-jade --palette jade --dirs r,l --samples 64 --px 4 --threads 2` | assets/snake[-jade]/head_<expr>_<r|l>.png, meta.json |
| `art/char_preview.py` | Utility | Quick lit preview of any rigged GLB at one frame of one animation; useful for checking KayKit parts and poses. | `python3 art/char_preview.py model.glb out.png [action] [frame]` | one PNG |
| `art/vault_tower.py` | Look test (history) | The approved v3 look test: the Vault as a cutaway tower wall with big glazed bricks. The "shiny" target the production renders copy. (Its comments still mention an early fox character, later replaced by the princess.) | `python3 art/vault_tower.py [out.png] [scale]` | art/out/ |
| `art/vault_side.py` | Look test (history) | Earlier side-view look test of the Vault. | `python3 art/vault_side.py [out.png] [scale]` | art/out/ |
| `art/vault_scene.py` | Look test (history) | First top-down look test built from art/vault-grid.json. | `python3 art/vault_scene.py [out.png] [scale]` | art/out/ |
| `art/vault-grid.json` | Data | Grid used by the early look tests. | `-` | - |
| `tools/pack_art.py` | Production | Packs all rendered PNGs into src/vault-art.js as WebP data URIs (3 px per game unit for sprites) so the game ships as one HTML file. Run after any render, then npm run build. | `python3 tools/pack_art.py` | src/vault-art.js |


---

## `art/fantasy-machinery/extract.py`

Extracts separate characters, ramps, gates, raft frames, architecture and bricks from preserved source sheets, normalizes pivots and strips image metadata.

```python
from pathlib import Path
from collections import defaultdict
import hashlib
import json
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[2]
SOURCE = Path(__file__).parent
OUT = ROOT / 'assets/fantasy-machinery'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def components(alpha, threshold=24):
    parent, runs, previous = [], [], []
    def find(i):
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i
    for y, row in enumerate(alpha):
        diff = np.diff(np.r_[False, row > threshold, False].astype(np.int8))
        current = []
        for left, right in zip(np.where(diff == 1)[0], np.where(diff == -1)[0]):
            hits = [i for a, b, i in previous if left <= b and right >= a]
            if hits:
                label = find(hits[0])
                for hit in hits[1:]:
                    parent[find(hit)] = label
            else:
                label = len(parent)
                parent.append(label)
            current.append((int(left), int(right), label))
            runs.append((y, int(left), int(right), label))
        previous = current
    groups = defaultdict(list)
    for y, left, right, label in runs:
        groups[find(label)].append((y, left, right))
    return sorted(groups.values(), key=lambda r: sum(b-a for y, a, b in r), reverse=True)


def isolate(im, rows):
    seed = Image.new('L', im.size)
    draw = ImageDraw.Draw(seed)
    for y, left, right in rows:
        draw.line((left, y, right-1, y), fill=255)
    support = seed.filter(ImageFilter.MaxFilter(15)).filter(ImageFilter.GaussianBlur(1))
    a = np.array(im)
    a[:, :, 3] = (a[:, :, 3].astype(np.uint16)*np.array(support)//255).astype(np.uint8)
    a[a[:, :, 3] < 3] = 0
    return Image.fromarray(a)


def clean(im):
    a = np.array(im.convert('RGBA'))
    a[a[:, :, 3] < 3] = 0
    return Image.fromarray(a)


def fit(im, size, padding=16):
    box = im.getchannel('A').getbbox()
    crop = im.crop(box)
    scale = min((size[0]-2*padding)/crop.width, (size[1]-2*padding)/crop.height)
    dims = [round(crop.width*scale), round(crop.height*scale)]
    fitted = crop.resize(dims, Image.Resampling.LANCZOS)
    x, y = (size[0]-dims[0])//2, (size[1]-dims[1])//2
    canvas = Image.new('RGBA', size)
    canvas.alpha_composite(fitted, (x, y))
    def uv(point):
        return [(x+(point[0]-box[0])*dims[0]/crop.width)/size[0],
                (y+(point[1]-box[1])*dims[1]/crop.height)/size[1]]
    return clean(canvas), list(box), uv


def audit(path, transparent=True):
    im = Image.open(path)
    assert not im.info, (path, im.info)
    result = {'bytes': path.stat().st_size, 'size': list(im.size), 'mode': im.mode, 'metadata': {}}
    if transparent:
        a = np.array(im)
        assert im.mode == 'RGBA'
        edge = int(max(a[0, :, 3].max(), a[-1, :, 3].max(), a[:, 0, 3].max(), a[:, -1, 3].max()))
        assert edge == 0, (path, edge)
        assert not a[a[:, :, 3] == 0, :3].any(), path
        result.update(edgeAlphaMax=edge, transparentFraction=float(np.mean(a[:, :, 3] == 0)))
    return result


def entry(name, im, unit, pivot, source, source_crop, anchors=None, **other):
    path = OUT/(name+'.png')
    im = clean(im)
    im.save(path)
    solid = im.getchannel('A').point(lambda v: 255 if v >= 128 else 0).getbbox()
    return {'path': path.relative_to(ROOT).as_posix(), 'size': list(im.size), 'unit': unit,
            'pivot': pivot, 'alphaBounds': list(im.getchannel('A').getbbox()), 'solidBounds': list(solid),
            'source': source.relative_to(ROOT).as_posix(), 'sourceCrop': source_crop,
            'sourceSHA256': sha(source), 'sha256': sha(path), 'anchors': anchors or {},
            'audit': audit(path), **other}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    sources = {k: SOURCE/'source'/v for k, v in {
        'bellforge': 'bellforge-sheet-v2.png', 'tidewheel': 'tidewheel-sheet-v1.png',
        'background': 'background-pair-v2.png', 'bricks': 'tidewheel-bricks-v1.png',
        'grounding': 'grounding-sheet-v1.png', 'cradle': 'bell-cradle-v1.png'}.items()}
    images = {k: Image.open(v).convert('RGBA') for k, v in sources.items() if k != 'background'}
    groups = {k: components(np.array(v.getchannel('A'))) for k, v in images.items()}
    manifest = {'version': 1, 'status': 'Approved visual references; independent production layers, native gameplay admission pending',
        'pivotConvention': 'Normalized UV of full padded image/cell. Anchors share that UV. unit gives full canvas world width/height; never stretch a character non-uniformly.',
        'collisionNote': 'alpha/solid bounds are measurements, not full rectangle colliders; holes and disconnected anatomy remain empty.',
        'filter': 'linear', 'bellforge': {}, 'tidewheel': {}, 'sources': {k: {'path': v.relative_to(ROOT).as_posix(), 'sha256': sha(v)} for k, v in sources.items()}}

    # Four authored key poses, one common pixel scale and planted-foot baseline.
    # Release front hoof extends lower than the supporting feet; do not align its bounding-box bottom.
    cell, baseline = [512, 448], 396
    pose_specs = [('idle', 1, 242, 483), ('windup', 3, 633.5, 482),
                  ('release', 2, 1043, 475), ('stagger', 0, 226.5, 840)]
    atlas = Image.new('RGBA', (cell[0]*4, cell[1]))
    frames = []
    for index, (name, group, cx, fy) in enumerate(pose_specs):
        isolated = isolate(images['bellforge'], groups['bellforge'][group])
        box = isolated.getchannel('A').getbbox()
        canvas = Image.new('RGBA', cell)
        canvas.alpha_composite(isolated.crop(box), (round(256-cx+box[0]), round(baseline-fy+box[1])))
        canvas = clean(canvas)
        atlas.alpha_composite(canvas, (index*cell[0], 0))
        path = OUT/('korr-'+name+'.png')
        canvas.save(path)
        frames.append({'name': name, 'index': index, 'sourceCrop': list(box), 'sourceFeet': [cx, fy],
                       'sourceToCell': [1, 256-cx, baseline-fy], 'alphaBounds': list(canvas.getchannel('A').getbbox()),
                       'path': path.relative_to(ROOT).as_posix(), 'sha256': sha(path), 'audit': audit(path)})
    manifest['bellforge']['korr'] = entry('korr', atlas, [512/3, 448/3], [.5, baseline/448],
        sources['bellforge'], [v['sourceCrop'] for v in frames], cell=cell, columns=4, rows=1,
        clips={v['name']: {'start': i, 'n': 1, 'fps': 1} for i, v in enumerate(frames)}, frames=frames,
        animationNote='Four keyed raster poses, not a skeletal rig or smooth full walk cycle. Shared scale 3px/world unit and supporting-foot baseline; release hoof extends in front of support plane.')

    specs = [
        ('bellforge', 'bell', 6, [256, 256], [32, 32], [594, 706], {'loop': [625, 581], 'mass': [594, 706], 'rimLeft': [460, 755], 'rimRight': [721, 790]}, {'physicalRadius': 14, 'note': '14u dome circle; top loop is decorative. Pivot at dome mass, not bounding-box centre.'}),
        ('bellforge', 'ramp', 7, [512, 128], [128, 32], [791, 718], {'hinge': [791, 718], 'axisEnd': [1202, 712], 'contactA': [819, 686], 'contactB': [1214, 686]}, {'note': 'Map the measured contact anchors to physics ramp endpoints; preserve cap/hinge aspect. Pin sits below the top face.'}),
        ('bellforge', 'lift', 5, [384, 384], [76.8, 76.8], [258, 1060], {'deck': [258, 1050], 'chainLeft': [159, 897], 'chainRight': [365, 897], 'feet': [258, 1060]}, {'note': 'Empty open railing; deck plane anchor supports Lumi, finial is presentation.'}),
        ('bellforge', 'ratchet', 4, [384, 416], [64, 69.333333], [691, 1005], {'axle': [691, 1005], 'base': [652, 1180]}, {'note': 'Static mounting base baked with wheel; rotate only wheel via masked/cropped layer if animated.'}),
        ('tidewheel', 'nerraBody', 0, [640, 576], [216, 194.4], [307, 294], {'socketCrusher': [225, 349], 'socketGate': [510, 350], 'feet': [307, 516], 'face': [421, 338]}, {'note': 'Body plus eight short legs, no large claws; use exact socket anchors for separate front claws.'}),
        ('tidewheel', 'crusherClaw', 4, [448, 416], [116, 107.714286], [575, 211], {'root': [575, 211], 'mass': [795, 366], 'tip': [945, 504]}, {'mirrorX': True, 'note': 'Mirror horizontally at its root for left/front socket; angle then applies to the whole anatomical part.'}),
        ('tidewheel', 'gateClaw', 6, [384, 416], [89.538462, 97], [946, 208], {'root': [946, 208], 'mass': [1103, 363], 'tip': [1201, 507]}, {'mirrorX': False, 'note': 'Right gate-handling short arm; root is real rear ball, not claw centre.'}),
        ('tidewheel', 'wheel', 1, [384, 416], [72, 78], [265, 742], {'axle': [265, 742], 'rimTop': [199, 578]}, {'note': 'Actual source wheel face is oblique; use affine rotation in its own plane or bounded rocking, not unexamined full-screen 2D spin.'}),
        ('tidewheel', 'raft', 2, [640, 256], [128, 51.2], [650, 767], {'deck': [650, 767], 'deckLeft': [452, 734], 'deckRight': [846, 734], 'ropeLeft': [406, 819], 'ropeRight': [892, 822]}, {'note': 'Empty deck, no baked bricks. Full width128u; map measured deck span for real code-placed cells.'}),
        ('tidewheel', 'gate', 3, [352, 416], [70.4, 83.2], [1088, 720], {'rope': [1089, 568], 'panelCentre': [1088, 748], 'panelTopLeft': [961, 618], 'panelBottomRight': [1227, 878]}, {'note': 'Opaque physical panel; do not draw balls through its visible area.'}),
        ('tidewheel', 'counterweight', 5, [320, 352], [48, 52.8], [183, 1082], {'rope': [179, 963], 'mass': [183, 1082]}, {'note': 'Stone/metal body; top eye remains transparent inside.'}),
    ]
    for family, name, group, size, unit, pivot, anchors, other in specs:
        sprite, box, uv = fit(isolate(images[family], groups[family][group]), size)
        manifest[family][name] = entry(name, sprite, unit, uv(pivot), sources[family], box,
                                      {k: uv(v) for k, v in anchors.items()}, **other)

    brick_groups = sorted(groups['bricks'][:3], key=lambda rows: min(a for y,a,b in rows))
    manifest['tidewheel']['bricks'] = {}
    for name, rows in zip(['coral', 'sage', 'ivory'], brick_groups):
        isolated = isolate(images['bricks'], rows)
        box = isolated.getchannel('A').getbbox()
        # All three physical tiles share exact 34:18 exterior sizing. Fixed ceramic
        # tiles permit this small aspect normalization; articulated characters do not.
        crop = isolated.crop(box).resize((272, 144), Image.Resampling.LANCZOS)
        sprite = Image.new('RGBA', (304, 176))
        sprite.alpha_composite(crop, (16, 16))
        manifest['tidewheel']['bricks'][name] = entry('brick-'+name, sprite, [38, 22], [.5,.5], sources['bricks'], list(box),
            {'contactTopLeft': [16/304,16/176], 'contactBottomRight': [288/304,160/176]},
            physicalSize=[34,18], note='Equal-sized glossy ceramic tile. Draw contact anchors to real34x18u brick; source aspect normalized consistently across the family.')

    grounded = [
        ('bellforge','plinth',1,[768,288],[168,63],[416,236],{'topLeft':[90,236],'topRight':[741,236],'stand':[416,236]},'Rear-stage load-bearing dais. Supporting feet sit on measured top plane; not a foreground full-width blocker.'),
        ('bellforge','hopperStudy',2,[416,432],[52,54],[1105,409],{'mount':[1018,441],'outlet':[1105,409]},'Historical narrow-mouth hopper study, NOT admitted for28u bells; use open bellCradle instead.'),
        ('tidewheel','sluiceWall',0,[1024,448],[350,153.125],[432,649],{'topLeft':[76,649],'topRight':[787,649],'stand':[432,649],'wheelMount':[760,678]},'Rear-stage masonry support and three true-alpha arch outlets. No full-width foreground collision barrier.'),
        ('tidewheel','refugeBalcony',3,[416,384],[83.2,76.8],[1046,751],{'deck':[1046,751],'wallMount':[904,657],'dangerLip':[1046,787]},'Lumi feet align to actual deck. Front railing may be occlusion-masked after Lumi; not a new cage.'),
        ('tidewheel','gateFrame',4,[352,544],[44,68],[1378,766],{'openingTopLeft':[1306,615],'openingBottomRight':[1448,919],'chain':[1378,519]},'Empty true-alpha aperture. Map opening corners to actual gatepanel; frame is rear-stage hardware, not an invisible full rectangle.'),
    ]
    for family,name,group,size,unit,pivot,anchors,note in grounded:
        sprite,box,uv=fit(isolate(images['grounding'],groups['grounding'][group]),size)
        manifest[family][name]=entry(name,sprite,unit,uv(pivot),sources['grounding'],box,{k:uv(v) for k,v in anchors.items()},note=note)

    # The lever's metal bearing foot stays fixed; the arm rotates about its actual
    # brass bearing. Both layers preserve identical source transform/pivot.
    lever=isolate(images['grounding'],groups['grounding'][5])
    lever_sprite,box,uv=fit(lever,[384,416])
    # Shared fitted plane at the underside of the large bearing, above the stand.
    cut=round(uv([1395,399])[1]*lever_sprite.height)
    arm=np.array(lever_sprite);arm[cut:,:,:]=0
    mount=np.array(lever_sprite);mount[:cut,:,:]=0
    for name,pixels in [('releaseLever',arm),('leverMount',mount)]:
        manifest['bellforge'][name]=entry(name,Image.fromarray(pixels),[38.4,41.6],uv([1395,345]),sources['grounding'],box,
            {'pivot':uv([1395,345]),'grip':uv([1240,144]),'stand':uv([1395,447])},note='Source-aligned arm/base split at bearing underside. Rotate releaseLever only; leverMount remains fixed.')

    cradle=images['cradle'];sprite,box,uv=fit(cradle,[768,576])
    source_open=[cradle.width*.54,cradle.height*.50]
    manifest['bellforge']['bellCradle']=entry('bellCradle',sprite,[116,87],uv(source_open),sources['cradle'],box,
        {'outlet':uv(source_open),'leftBearing':uv([cradle.width*.30,cradle.height*.24]),'rightBearing':uv([cradle.width*.83,cradle.height*.25])},
        note='Open-front release rack, not a narrow tube. Outlet is inside true-alpha opening, mapped to actualbell birth(164,147). Bell exits downfield without passing visible metal; source3D perspective remains baked.')

    # Remove the single separator pixel strip; no full concept board enters gameplay.
    pair = Image.open(sources['background']).convert('RGB')
    w, h = pair.size
    for family, box in [('bellforge', [0, 0, w//2-3, h]), ('tidewheel', [w//2+3, 0, w, h])]:
        image = pair.crop(box)
        path = OUT/(family+'-background.png')
        image.save(path)
        manifest[family]['background'] = {'path': path.relative_to(ROOT).as_posix(), 'size': list(image.size),
            'source': sources['background'].relative_to(ROOT).as_posix(), 'sourceCrop': box,
            'sourceSHA256': sha(sources['background']), 'sha256': sha(path), 'audit': audit(path, False),
            'role': 'Static quiet architectural plate only. No character, brick, bell, wheel, raft, UI or collision geometry.'}
    path = OUT/'manifest.json'
    path.write_text(json.dumps(manifest, indent=2)+'\n', encoding='utf-8')
    print(json.dumps({'manifest': str(path), 'sha256': sha(path), 'parts': len(specs)+3}, indent=2))


if __name__ == '__main__':
    main()
```


---

## `art/fantasy-machinery/measure.py`

Measures conservative opaque circle unions for Korr poses and the original Nerra parts; the frozen manifest records source-to-world transforms.

```python
from pathlib import Path
import json
import math
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT/'assets/fantasy-machinery'
PROOF = Path(__file__).parent/'proof'


def circles(image, count=16, min_radius=5, step=6):
    opaque = np.array(image.getchannel('A')) >= 128
    inside = opaque.copy()
    inside[1:-1, 1:-1] &= opaque[:-2, 1:-1] & opaque[2:, 1:-1] & opaque[1:-1, :-2] & opaque[1:-1, 2:]
    by, bx = np.where(opaque & ~inside)
    candidates = []
    for y in range(step//2, image.height, step):
        for x in range(step//2, image.width, step):
            if not opaque[y, x]:
                continue
            radius = math.sqrt(float(np.min((bx-x)**2+(by-y)**2))) - 1
            if radius >= min_radius:
                candidates.append((radius, x, y))
    candidates.sort(reverse=True)
    chosen = []
    for radius, x, y in candidates:
        # Keep broad original-mass disks and a modest overlap, no transparent gaps.
        if all(math.hypot(x-cx, y-cy) > max(cr, radius)*.70 for cr, cx, cy in chosen):
            chosen.append((radius, x, y))
            if len(chosen) >= count:
                break
    # Largest masses alone miss narrow tusks, walking legs and jaw tips. Re-arm
    # those with truly inscribed small disks, not a bounding box across gaps.
    for _ in range(80-len(chosen)):
        best, best_gap = None, 2.0
        for radius,x,y in candidates:
            gap=min(math.hypot(x-cx,y-cy)-cr for cr,cx,cy in chosen)
            if gap>best_gap:
                best,best_gap=(radius,x,y),gap
        if best is None:
            break
        chosen.append(best)
    return chosen


def geometry(image, unit, pivot, count=16, minimum=5, step=6):
    sx, sy = unit[0]/image.width, unit[1]/image.height
    assert abs(sx-sy) < .00001
    shapes = []
    for r, x, y in circles(image, count, minimum, step):
        shapes.append({'type': 'circle', 'x': round((x/image.width-pivot[0])*unit[0], 5),
                       'y': round((y/image.height-pivot[1])*unit[1], 5), 'r': round(r*sx, 5)})
    return shapes


def draw_shapes(im, shapes, unit, pivot):
    result = Image.new('RGBA', im.size, '#151b23')
    result.alpha_composite(im)
    d = ImageDraw.Draw(result)
    scale = im.width/unit[0]
    for i, s in enumerate(shapes):
        x=(s['x']/unit[0]+pivot[0])*im.width
        y=(s['y']/unit[1]+pivot[1])*im.height
        r=s['r']*scale
        d.ellipse((x-r,y-r,x+r,y+r),outline='#64ffb0',width=2)
        d.text((x,y),str(i),fill='white')
    return result


def main():
    PROOF.mkdir(parents=True, exist_ok=True)
    m=json.loads((OUT/'manifest.json').read_text())
    data={'contract': 'Each disk fully inscribed in alpha>=128, relative to normalized pivot at declared unit scale. Conservative union, never fills leg/jaw gaps. Shapes are not a traced rig.', 'bellforge':{},'tidewheel':{}}
    korr=m['bellforge']['korr']
    for f in korr['frames']:
        im=Image.open(ROOT/f['path']).convert('RGBA')
        shapes=geometry(im,korr['unit'],korr['pivot'],22,5,6)
        data['bellforge'][f['name']]=shapes
        f['collision'] = shapes
        draw_shapes(im,shapes,korr['unit'],korr['pivot']).save(PROOF/('korr-'+f['name']+'-collision.png'))
    for name,count,minimum in [('nerraBody',25,5),('crusherClaw',12,4),('gateClaw',14,3)]:
        e=m['tidewheel'][name];im=Image.open(ROOT/e['path']).convert('RGBA')
        shapes=geometry(im,e['unit'],e['pivot'],count,minimum,5)
        data['tidewheel'][name]=shapes
        e['collision'] = shapes
        draw_shapes(im,shapes,e['unit'],e['pivot']).save(PROOF/(name+'-collision.png'))
    (PROOF/'collision-measurements.json').write_text(json.dumps(data,indent=2)+'\n')
    korr['collisions'] = data['bellforge']
    m['collisionConvention'] = data['contract']
    (OUT/'manifest.json').write_text(json.dumps(m,indent=2)+'\n', encoding='utf-8')
    print(json.dumps(data))


if __name__=='__main__':
    main()
```


---

## `art/fantasy-machinery/extract-nerra-v2.py`

Normalizes four supporting-foot poses, exact shoulder sockets, chain-holding claw and repeatable chain links in an independent versioned manifest.

```python
from pathlib import Path
import importlib.util
import hashlib,json,math
import numpy as np
from PIL import Image,ImageDraw

ROOT=Path(__file__).resolve().parents[2]
SOURCE=Path(__file__).parent
OUT=ROOT/'assets/fantasy-machinery'
spec=importlib.util.spec_from_file_location('family_extract',SOURCE/'extract.py')
family=importlib.util.module_from_spec(spec);spec.loader.exec_module(family)


def disks(im,unit,pivot,limit=90):
    opaque=np.array(im.getchannel('A'))>=128
    inside=opaque.copy();inside[1:-1,1:-1]&=opaque[:-2,1:-1]&opaque[2:,1:-1]&opaque[1:-1,:-2]&opaque[1:-1,2:]
    by,bx=np.where(opaque&~inside);candidates=[]
    for y in range(3,im.height,6):
        for x in range(3,im.width,6):
            if not opaque[y,x]:continue
            r=math.sqrt(float(np.min((bx-x)**2+(by-y)**2)))-1
            if r>=3:candidates.append((r,x,y))
    a=np.array(candidates);rs,xs,ys=a[:,0],a[:,1],a[:,2]
    selected=[];gaps=np.full(len(rs),10000.)
    # Broad masses first, then ensure visible narrow anatomy is represented.
    for i in np.argsort(rs)[::-1]:
        r,x,y=a[i]
        if all(math.hypot(x-cx,y-cy)>max(r,cr)*.7 for cr,cx,cy in selected):
            selected.append((r,x,y));gaps=np.minimum(gaps,np.hypot(xs-x,ys-y)-r)
            if len(selected)>=20:break
    while len(selected)<limit:
        i=int(gaps.argmax())
        if gaps[i]<=2:break
        r,x,y=a[i];selected.append((r,x,y));gaps=np.minimum(gaps,np.hypot(xs-x,ys-y)-r)
    return [{'type':'circle','x':round((x/im.width-pivot[0])*unit[0],6),'y':round((y/im.height-pivot[1])*unit[1],6),'r':round(r*unit[0]/im.width,6)} for r,x,y in selected]


def main():
    source=SOURCE/'source/nerra-motion-v2.png';im=Image.open(source).convert('RGBA')
    groups=family.components(np.array(im.getchannel('A')))
    cell=[640,576];unit=[190.08,171.072];pivot=[.5,540/576];scale=1.13
    atlas=Image.new('RGBA',(cell[0]*4,cell[1]));poses={};frames=[]
    specs=[('idle',2,[274,498],{'crusher':[213,321],'gate':[451,326]}),
           ('step',3,[769,498],{'crusher':[718,321],'gate':[953,326]}),
           ('hurt',0,[274,989],{'crusher':[208,815],'gate':[454,830]}),
           ('pull',1,[779,985],{'crusher':[718,804],'gate':[968,826]})]
    for i,(name,group,foot,sockets) in enumerate(specs):
        isolated=family.isolate(im,groups[group]);box=isolated.getchannel('A').getbbox();crop=isolated.crop(box)
        dims=[round(crop.width*scale),round(crop.height*scale)];crop=crop.resize(dims,Image.Resampling.LANCZOS)
        dx=round(320+(box[0]-foot[0])*scale);dy=round(540+(box[1]-foot[1])*scale)
        frame=Image.new('RGBA',cell);frame.alpha_composite(crop,(dx,dy));frame=family.clean(frame)
        path=OUT/('nerra-v2-'+name+'.png');frame.save(path);family.audit(path)
        def uv(point):return [(dx+(point[0]-box[0])*dims[0]/(box[2]-box[0]))/cell[0],(dy+(point[1]-box[1])*dims[1]/(box[3]-box[1]))/cell[1]]
        socket_uvs={k:uv(v) for k,v in sockets.items()}
        local={k:{'x':(v[0]-pivot[0])*unit[0],'y':(v[1]-pivot[1])*unit[1]} for k,v in socket_uvs.items()}
        shapes=disks(frame,unit,pivot)
        atlas.alpha_composite(frame,(i*cell[0],0))
        poses[name]={'frame':i,'frameRect':[i*cell[0],0,*cell],'footUV':pivot,'sockets':local,'socketUVs':socket_uvs,'circles':shapes,'alphaBounds':list(frame.getchannel('A').getbbox()),'sourceCrop':list(box),'sourceFoot':foot,'sourceToCell':[scale,320-foot[0]*scale,540-foot[1]*scale],'path':path.relative_to(ROOT).as_posix(),'sha256':family.sha(path)}
        frames.append({'name':name,**poses[name]})
    atlas_path=OUT/'nerra-v2.png';atlas.save(atlas_path);family.audit(atlas_path)
    body={'path':atlas_path.relative_to(ROOT).as_posix(),'sha256':family.sha(atlas_path),'size':list(atlas.size),'cell':cell,'columns':4,'rows':1,'unit':unit,'pivot':pivot,'clips':{name:{'start':i,'n':1,'fps':1} for i,(name,*_) in enumerate(specs)},'poses':poses,'frames':frames}

    # Keep one clamped link, remove the lower dangling tail as a separate layer;
    # the runtime chain route, not the entire claw rotation, owns free links.
    isolated=family.isolate(im,groups[4]);cut=1328
    pixels=np.array(isolated);pixels[cut:,:,:]=0;isolated=Image.fromarray(pixels)
    claw,box,uv=family.fit(isolated,[448,448])
    cunit=[96,96];cpivot=uv([181,1058]);anchors={k:uv(v) for k,v in {'root':[181,1058],'chainGrip':[449,1250],'chainEnd':[462,1322],'mass':[360,1199]}.items()}
    claw_entry=family.entry('gateClawV2',claw,cunit,cpivot,source,box,anchors,
        note='Rightpincer closes around a real held chainlink. Free dangling links extracted from source; draw actualchain route from chainEnd. No decorativechain collision.')
    collision_im=claw.copy();c=np.array(collision_im);tail_y=round(uv([462,1316])[1]*claw.height);c[tail_y:,:,:]=0
    claw_entry['collision']=disks(Image.fromarray(c),cunit,cpivot,70)
    claw_entry['grip']={'x':(anchors['chainGrip'][0]-cpivot[0])*cunit[0],'y':(anchors['chainGrip'][1]-cpivot[1])*cunit[1]}
    claw_entry['chainEnd']={'x':(anchors['chainEnd'][0]-cpivot[0])*cunit[0],'y':(anchors['chainEnd'][1]-cpivot[1])*cunit[1]}

    chain,box,uv=family.fit(family.isolate(im,groups[5]),[128,576])
    chain_entry=family.entry('chain-v2',chain,[24,108],[.5,.5],source,box,
        {k:uv(v) for k,v in {'top':[795,1044],'bottom':[795,1492],'tileTop':[795,1144],'tileBottom':[795,1267]}.items()},
        note='Rendered interlocking steel links. Route in short overlapped segments between measured endpoints; do not stretch into one flat bar or give thisdecorativechain damage collision.')
    previous=json.loads((OUT/'manifest.json').read_text())
    left=previous['tidewheel']['crusherClaw'];claws=[{'side':-1,'partKey':'crusherClaw','scale':.88,'mirror':True,'circles':left['collision'],'grip':{'x':0,'y':0}},
        {'side':1,'partKey':'gateClawV2','scale':1,'mirror':False,'circles':claw_entry['collision'],'grip':claw_entry['grip'],'chainEnd':claw_entry['chainEnd']}]
    geometry={'unit':unit,'pivot':pivot,'poses':poses,'claws':claws,'sourceSHA256':family.sha(source)}
    manifest={'version':2,'status':'New smaller Nerra mechanical chainpull family; independentnative/runtimeadmissionpending','source':source.relative_to(ROOT).as_posix(),'sourceSHA256':family.sha(source),'baseManifest':{'path':'assets/fantasy-machinery/manifest.json','sha256':family.sha(OUT/'manifest.json')},'nerraBody':body,'gateClawV2':claw_entry,'chain':chain_entry,'geometry':geometry,'animationNote':'Four consistent rasterkeyposes with source-measured sockets; not a fullskeletalrig. Renderer owns rigidclaw rotation, realchainrouting and modelpatrol.'}
    path=OUT/'nerra-v2-manifest.json';path.write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
    module=SOURCE/'nerra-v2-data.mjs';module.write_text('// Source-relative measured anatomy; units already include the smaller body size.\nexport default '+json.dumps(geometry,separators=(',',':'))+';\n',encoding='utf-8')
    print(json.dumps({'manifestSHA256':family.sha(path),'sourceSHA256':family.sha(source),'moduleSHA256':family.sha(module),'poseCounts':{k:len(v['circles']) for k,v in poses.items()},'clawCircles':len(claw_entry['collision']),'grip':claw_entry['grip'],'chainEnd':claw_entry['chainEnd']}))


if __name__=='__main__':main()
```


---

## `art/fantasy-machinery/verify.py`

Verifies source/runtime hashes, opaque collision proxies, transparent holes, metadata and release aperture limits.

```python
from pathlib import Path
import hashlib,json,math
import numpy as np
from PIL import Image

ROOT=Path(__file__).resolve().parents[2]
SOURCE=Path(__file__).parent
MANIFEST=ROOT/'assets/fantasy-machinery/manifest.json'


def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()


def main():
    m=json.loads(MANIFEST.read_text());checks={};shapes={}
    for key,e in m['sources'].items():
        p=ROOT/e['path'];assert sha(p)==e['sha256'];assert not Image.open(p).info
    def visit(value):
        if isinstance(value,list):
            for v in value:visit(v)
        elif isinstance(value,dict):
            if 'path' in value and 'sha256' in value and value['path'].endswith('.png'):
                p=ROOT/value['path'];assert sha(p)==value['sha256'],p
                im=Image.open(p);assert not im.info,p
                if im.mode=='RGBA':
                    a=np.array(im);assert not a[0,:,3].any() and not a[-1,:,3].any() and not a[:,0,3].any() and not a[:,-1,3].any(),p
                    assert not a[a[:,:,3]==0,:3].any(),p
                checks[value['path']]={'sha256':sha(p),'bytes':p.stat().st_size,'size':list(im.size),'metadata':{}}
            for key,v in value.items():
                if key!='sources':visit(v)
    visit(m)
    for family,name in [('bellforge','korr'),('tidewheel','nerraBody'),('tidewheel','crusherClaw'),('tidewheel','gateClaw')]:
        e=m[family][name]
        for f in e['frames'] if name=='korr' else [e]:
            im=Image.open(ROOT/f['path']);a=np.array(im.getchannel('A'));u=e['unit'];p=e['pivot'];g=f['collision']
            for circle in g:
                x=(circle['x']/u[0]+p[0])*im.width;y=(circle['y']/u[1]+p[1])*im.height;r=circle['r']*im.width/u[0]
                left,right=max(0,math.floor(x-r)),min(im.width,math.ceil(x+r)+1)
                top,bottom=max(0,math.floor(y-r)),min(im.height,math.ceil(y+r)+1)
                yy,xx=np.mgrid[top:bottom,left:right];mask=(xx-x)**2+(yy-y)**2<=r*r
                assert not np.any(a[top:bottom,left:right][mask]<128),(name,circle)
            yy,xx=np.where(a>=128);xw=(xx/im.width-p[0])*u[0];yw=(yy/im.height-p[1])*u[1];gap=np.full(len(xx),1000.)
            for c in g:gap=np.minimum(gap,np.maximum(0,np.hypot(xw-c['x'],yw-c['y'])-c['r']))
            shapes[name+'-'+f.get('name','')]=dict(disks=len(g),allDisksOpaque=True,normal6uCoverage=float(np.mean(gap<6)),maximumOpaqueGap=float(gap.max()))
    # These openings are real transparent holes, not painted dark pixels.
    holes={}
    for name,uv in [('sluiceWall',[.21,.65]),('gateFrame',[.49,.70])]:
        e=m['tidewheel'][name];im=Image.open(ROOT/e['path']);alpha=im.getchannel('A').getpixel((round(uv[0]*im.width),round(uv[1]*im.height)))
        assert alpha==0,(name,alpha);holes[name]=0
    e=m['bellforge']['bellCradle'];im=Image.open(ROOT/e['path']);a=np.array(im.getchannel('A'));yy,xx=np.where(a>=128);x,y=e['pivot'][0]*im.width,e['pivot'][1]*im.height
    clearance=float(np.sqrt(((xx-x)**2+(yy-y)**2).min())*e['unit'][0]/im.width)
    assert clearance>=14
    report={'manifestSHA256':sha(MANIFEST),'selectedSources':len(m['sources']),'runtimePNGs':len(checks),'files':checks,'geometry':shapes,'trueAlphaHoles':holes,'bellInitialClearance':clearance,'limits':['Keyed raster poses, not a skeletal rig','Rear-stage rack; full straight vertical aperture is not proved','Staged native art proof is not earned gameplay or human balance approval']}
    (SOURCE/'proof/verification.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({k:v for k,v in report.items() if k not in ['files','geometry']},indent=2))


if __name__=='__main__':main()
```


---

## `art/fantasy-machinery/extract-water-shot.py`

Normalizes the dimensional water shot around its measured front-core pivot; preserves the source, strips metadata and records the soft foam collision approximation.

```python
from pathlib import Path
import importlib.util
import hashlib,json,math
import numpy as np
from PIL import Image,ImageDraw

ROOT=Path(__file__).resolve().parents[2];SOURCE=Path(__file__).parent;OUT=ROOT/'assets/fantasy-machinery'
spec=importlib.util.spec_from_file_location('family',SOURCE/'extract.py');f=importlib.util.module_from_spec(spec);spec.loader.exec_module(f)


def main():
    source=SOURCE/'source/water-shot-v1.png';im=Image.open(source).convert('RGBA')
    # Remove unused ultra-soft ambient matte, retain real liquid and spray.
    groups=f.components(np.array(im.getchannel('A')),64)
    rows=[row for group in groups if sum(b-a for y,a,b in group)>=16 for row in group]
    sprite,box,uv=f.fit(f.isolate(im,rows),[192,288],8)
    # Search only the leading fluid mass, retaining the authored downward nose.
    a=np.array(sprite.getchannel('A'));solid=a>=40;inside=solid.copy();inside[1:-1,1:-1]&=solid[:-2,1:-1]&solid[2:,1:-1]&solid[1:-1,:-2]&solid[1:-1,2:]
    by,bx=np.where(solid&~inside);best=None
    for y in range(170,235):
        for x in range(70,125):
            if not solid[y,x]:continue
            r=math.sqrt(float(np.min((bx-x)**2+(by-y)**2)))
            score=r-.02*math.hypot(x-96,y-210)
            if best is None or score>best[0]:best=(score,x,y,r)
    _,x,y,r=best;pivot=[x/192,y/288]
    path=OUT/'water-shot.png';sprite.save(path);audit=f.audit(path)
    yy,xx=np.mgrid[:288,:192];core=(xx-x)**2+(yy-y)**2<=60**2
    e={'version':1,'path':path.relative_to(ROOT).as_posix(),'size':[192,288],'unit':[32,48],
       'pivot':pivot,'anchors':{'core':pivot,'nose':uv([524,1421]),'tail':uv([630,96])},
       'collision':{'type':'circle','r':10},'visibleCore':{'alphaThreshold':40,'inscribedRadius':r/6,'r10VisibleFraction':float(np.mean(a[core]>=40))},
       'source':source.relative_to(ROOT).as_posix(),'sourceCrop':box,'sourceSHA256':f.sha(source),'sha256':f.sha(path),
       'alphaBounds':list(sprite.getchannel('A').getbbox()),'audit':audit,'facing':'down',
       'note':'Independent dimensional translucent pressured-water raster. Pivot is measured frontmass centre; foam/spray outside collision circle are presentation. Root owns real velocity rotation and physical projectile.'}
    m=OUT/'water-shot-manifest.json';m.write_text(json.dumps(e,indent=2)+'\n',encoding='utf-8')
    proof=Image.new('RGB',(640,300),'#102131');d=ImageDraw.Draw(proof);large=sprite.copy();proof.paste(large,(10,5),large);d.ellipse((10+x-60,5+y-60,10+x+60,5+y+60),outline='#ffb95a',width=2)
    for i,scale in enumerate([1,393/360,412/360]):
        thumb=sprite.resize((round(32*scale),round(48*scale)),Image.Resampling.LANCZOS);px=260+i*100;proof.paste(thumb,(px,80),thumb);d.text((px-15,140),['32x48u','iOSnative','Androidnative'][i],fill='white')
    d.text((15,292),'Orange = physicalr10 | staged art sizes, not earnedgameplay',fill='white');proof.save(SOURCE/'proof/water-shot-native.png')
    print(json.dumps({'manifestSHA256':f.sha(m),'path':str(path),'pivot':pivot,'visibleCore':e['visibleCore'],'sourceSHA256':e['sourceSHA256'],'runtimeSHA256':e['sha256']}))


if __name__=='__main__':main()
```


---

## `art/fantasy-machinery/extract-reactions.py`

Extracts separate fury, dazed and fainted poses with registered feet, shoulder sockets and measured live-fury geometry.

```python
from pathlib import Path
import importlib.util
import hashlib,json,math
import numpy as np
from PIL import Image,ImageDraw

ROOT=Path(__file__).resolve().parents[2];SOURCE=Path(__file__).parent;OUT=ROOT/'assets/fantasy-machinery'
def load(name,path):
    s=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
f=load('reaction_family',SOURCE/'extract.py');v2=load('reaction_geometry',SOURCE/'extract-nerra-v2.py')


def main():
    source=SOURCE/'source/reactions-v1.png';im=Image.open(source).convert('RGBA');groups=f.components(np.array(im.getchannel('A')))
    manifest={'version':1,'status':'Source-faithful reactionkeyposes; independentnative/runtimeadmissionpending','source':source.relative_to(ROOT).as_posix(),'sourceSHA256':f.sha(source),'nerra':{},'korr':{},'geometry':{},'note':'Nerra is BODYONLY. Independentlargeclaws stay separate and use measured sockets. Dazed/defeat are terminalvictorypresentation, no combatauthority. Keyedrasters, not a skeletalrig.'}
    specs=[('nerra','fury',0,[269,515],1.13,{'crusher':[212,308],'gate':[460,341]},False),
           ('nerra','dazed',2,[768,522],1.13,{'crusher':[697,340],'gate':[951,379]},True),
           ('nerra','defeat',1,[265,1006],1.13,{'crusher':[207,911],'gate':[452,944]},True),
           ('korr','dazed',3,[765,1004],.83,{},True),
           ('korr','defeat',4,[283,1436],.83,{},True)]
    for family,name,group,foot,scale,sockets,terminal in specs:
        cell=[640,576] if family=='nerra' else [512,448]
        unit=[190.08,171.072] if family=='nerra' else [512/3,448/3]
        feet=[cell[0]/2,540 if family=='nerra' else 396];pivot=[feet[0]/cell[0],feet[1]/cell[1]]
        isolated=f.isolate(im,groups[group]);box=isolated.getchannel('A').getbbox();crop=isolated.crop(box);dims=[round(crop.width*scale),round(crop.height*scale)];crop=crop.resize(dims,Image.Resampling.LANCZOS)
        dx,dy=round(feet[0]+(box[0]-foot[0])*scale),round(feet[1]+(box[1]-foot[1])*scale)
        frame=Image.new('RGBA',cell);frame.alpha_composite(crop,(dx,dy));frame=f.clean(frame)
        def uv(point):return [(dx+(point[0]-box[0])*dims[0]/(box[2]-box[0]))/cell[0],(dy+(point[1]-box[1])*dims[1]/(box[3]-box[1]))/cell[1]]
        socket_uvs={k:uv(v) for k,v in sockets.items()};local={k:{'x':(v[0]-pivot[0])*unit[0],'y':(v[1]-pivot[1])*unit[1]} for k,v in socket_uvs.items()}
        e=f.entry(family+'-'+name+'-v1',frame,unit,pivot,source,list(box),{'feet':pivot,**{('socket'+k.capitalize()):u for k,u in socket_uvs.items()}},
            terminalOnly=terminal,footUV=pivot,sockets=local,socketUVs=socket_uvs,frame=0,frameRect=[0,0,*cell],
            sourceFeet=foot,sourceToCell=[scale,feet[0]-foot[0]*scale,feet[1]-foot[1]*scale])
        if not terminal:
            circles=v2.disks(frame,unit,pivot,90);e['circles']=circles
            manifest['geometry']['nerraFury']={'frame':0,'frameRect':[0,0,*cell],'unit':unit,'pivot':pivot,'footUV':pivot,'sockets':local,'circles':circles,'sourceSHA256':f.sha(source),'spriteSHA256':e['sha256']}
        manifest[family][name]=e
    module=SOURCE/'reactions-data.mjs';module.write_text('// Measured live fury anatomy, relative to the existing supporting feet.\nexport default '+json.dumps(manifest['geometry'],separators=(',',':'))+';\n',encoding='utf-8')
    manifest['geometryModule']={'path':module.relative_to(ROOT).as_posix(),'sha256':f.sha(module)}
    path=OUT/'reactions-manifest.json';path.write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'manifestSHA256':f.sha(path),'sourceSHA256':f.sha(source),'geometryModuleSHA256':f.sha(module),'furySockets':manifest['geometry']['nerraFury']['sockets'],'furyDisks':len(manifest['geometry']['nerraFury']['circles'])},indent=2))


if __name__=='__main__':main()
```


---

## `art/snake-emerald/extract.py`

Normalizes ten authored expressions, mirrors the left row, maps legacy aliases and records measured mouth outlets while preserving the gameplay core.

```python
from pathlib import Path
import hashlib,json,math
import numpy as np
from PIL import Image,ImageOps,ImageDraw

ROOT=Path(__file__).resolve().parents[2]
HERE=Path(__file__).parent
OUT=ROOT/'assets/snake-emerald'
SOURCE=HERE/'source/heads-v1.png'
EXPRESSIONS=['idle','blink','taste','hunt','chew0','chew1','hiss','ouch','dizzy','shock','snarl','strike','grin']
AUTHORED=['idle','blink','taste','hunt','chew0','chew1','hiss','ouch','dizzy','grin']
ALIASES={'shock':'idle','snarl':'hunt','strike':'hiss'}
CELL=256;UNIT=44;SCALE=.33
ROWS=[0,302,602,897,1205,1536]
CENTRES=[(285,154),(790,154),(285,448),(790,448),(285,744),(790,744),(285,1043),(790,1043),(285,1341),(790,1341)]
MOUTHS=[(440,227),(926,226),(434,519),(937,521),(380,790),(934,826),(365,1090),(916,1111),(400,1442),(921,1425)]

def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def clean(im):
    a=np.array(im.convert('RGBA'));a[a[:,:,3]<4]=0
    return Image.fromarray(a)

def main():
    OUT.mkdir(parents=True,exist_ok=True);proof=HERE/'proof';proof.mkdir(parents=True,exist_ok=True)
    im=Image.open(SOURCE).convert('RGBA');assert im.size==(1024,1536)
    unique={};mouths={};records={};parts={}
    for i,name in enumerate(AUTHORED):
        row,col=divmod(i,2);box=(col*512,ROWS[row],(col+1)*512,ROWS[row+1]);crop=im.crop(box)
        cx,cy=CENTRES[i];cx-=box[0];cy-=box[1]
        frame=clean(crop.transform((CELL,CELL),Image.Transform.AFFINE,(1/SCALE,0,cx-CELL/(2*SCALE),0,1/SCALE,cy-CELL/(2*SCALE)),Image.Resampling.BICUBIC))
        unique[name]=frame;mx,my=MOUTHS[i];dx=(mx-CENTRES[i][0])*SCALE*UNIT/CELL;dy=(my-CENTRES[i][1])*SCALE*UNIT/CELL
        mouths[name]={'r':[dx,dy],'l':[-dx,dy]};records[name]={'sourceCell':list(box),'sourceCore':list(CENTRES[i]),'sourceMouth':list(MOUTHS[i]),'scale':SCALE}
    for name in EXPRESSIONS:
        authored=ALIASES.get(name,name);right=unique[authored];mouths[name]=mouths[authored]
        for direction,frame in [('r',right),('l',ImageOps.mirror(right))]:
            path=OUT/f'head_{name}_{direction}.png';frame.save(path)
            a=np.array(frame);b=frame.getchannel('A').point(lambda n:255 if n>=128 else 0).getbbox();alpha=frame.getchannel('A').getbbox()
            assert min(alpha[:2])>8 and max(alpha[2:])<CELL-8
            assert not a[0,:,3].any() and not a[-1,:,3].any() and not a[:,0,3].any() and not a[:,-1,3].any()
            assert not a[a[:,:,3]==0,:3].any()
            parts[f'{name}_{direction}']={'path':path.relative_to(ROOT).as_posix(),'sha256':sha(path),'size':[CELL,CELL],'authoredExpression':authored,'mirrored':direction=='l','alphaBounds':list(alpha),'solidBounds':list(b),'nativeOpaqueSizeAt1_45':[(b[2]-b[0])*UNIT/CELL*1.45,(b[3]-b[1])*UNIT/CELL*1.45],'bytes':path.stat().st_size}
    meta={'px':CELL/UNIT,'cell':CELL,'box':UNIT,'pivot':[.5,.5],'expressions':EXPRESSIONS,'dirs':['r','l'],'palette':'emerald','colors':{'body':'#168f83','belly':'#c9e8d2','crown':'#0b5d59','outline':'#052d31','brow':'#ff8a9b','mark':'#83e4c2'},'mouths':mouths,'authoredExpressions':AUTHORED,'aliases':ALIASES,'mirroredDirections':{'l':'r'},'source':SOURCE.relative_to(ROOT).as_posix(),'sourceSHA256':sha(SOURCE),'collision':'presentation only; unchanged existing head core and route'}
    mp=OUT/'meta.json';mp.write_text(json.dumps(meta,indent=2)+'\n',encoding='utf-8')
    manifest={'version':1,'status':'New rendered expression keyposes; native runtime verification pending','source':meta['source'],'sourceSHA256':meta['sourceSHA256'],'meta':'assets/snake-emerald/meta.json','metaSHA256':sha(mp),'unit':UNIT,'cell':CELL,'pivot':[.5,.5],'authoredExpressions':AUTHORED,'aliases':ALIASES,'normalization':records,'parts':parts,'encodedBytes':sum(p['bytes'] for p in parts.values()),'packedDecodedRGBABytes':CELL*CELL*len(EXPRESSIONS)*2*4,'note':'Ten authored right-facing heads; exact mirrored left directions. Legacy aliases are explicit. No new skeletal rig or gameplay collider.'}
    manifestPath=OUT/'manifest.json';manifestPath.write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
    sheet=Image.new('RGB',(1280,960),'#122c2b');d=ImageDraw.Draw(sheet)
    for i,name in enumerate(AUTHORED):
        x=(i%5)*256;y=(i//5)*480;frame=unique[name];sheet.paste(frame,(x,y),frame);d.text((x+12,y+255),name,fill='white')
        native=frame.resize((70,70),Image.Resampling.LANCZOS);sheet.paste(native,(x+90,y+300),native);d.text((x+12,y+390),'393px phone / normal growth',fill='#a2c8bd')
    sheet.save(proof/'contact.png')
    report={'manifestSHA256':sha(manifestPath),'metaSHA256':sha(mp),'sourceSHA256':sha(SOURCE),'authoredHeads':len(AUTHORED),'legacyKeys':len(EXPRESSIONS),'directions':2,'cells':len(parts),'unit':UNIT,'cell':CELL,'aliases':ALIASES,'alphaEdges':0,'metadata':{},'allHiddenRGBZero':True,'encodedBytes':manifest['encodedBytes'],'packedDecodedRGBABytes':manifest['packedDecodedRGBABytes'],'normalOpaqueWidthRange':[min(p['nativeOpaqueSizeAt1_45'][0] for k,p in parts.items() if not k.startswith('taste')),max(p['nativeOpaqueSizeAt1_45'][0] for k,p in parts.items() if not k.startswith('taste'))],'note':'Native-sized source proof only; final integrated body/head seam and venom outlet are verified separately.'}
    (proof/'verification.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8');print(json.dumps(report,indent=2))

if __name__=='__main__':main()
```


---

## `art/frost_warden.py`

Separate hostile Yeti palette and seven real rig clips. Retains Brum ally source, measures projected hand and torso collision anchors, and renders 28 poses for the fifth princess encounter.

```python
# Render the hostile Frost Warden using the retained, licensed Yeti rig.
from pathlib import Path
import hashlib,json,math

ROOT=Path(__file__).resolve().parents[1]
frost_base_path=ROOT/'art/brum.py'
assert hashlib.sha256(frost_base_path.read_bytes()).hexdigest()=='75968015af39eb6395d3f598f7f53f4a1db9cca2a21b83dbcab4c773dff45abd'
code=frost_base_path.read_text().split("report={'source':str(SOURCE)")[0]
replacements={
    "ROOT/'out/cast/source-audit/Yeti.gltf'":"ROOT/'art/frost-warden/source/Yeti.gltf'",
    "'#EAE1CE'":"'#444151'", "'#4B8DAD'":"'#91A8B5'", "'#496170'":"'#292D42'",
    "'#28536C'":"'#302537'", "'#E7DFC9'":"'#E5EEF0'", "'#B6677C'":"'#87617E'", "'#102333'":"'#121322'",
}
for old,new in replacements.items():
    assert old in code,old
    code=code.replace(old,new)
exec(compile(code,str(frost_base_path),'exec'),globals())
from bpy_extras.object_utils import world_to_camera_view
import numpy as np

assert not args.face and not args.skin
arm.rotation_euler=(0,0,math.radians(65))
STATES['Scowl']=dict(mouth=.45,corner=-.018,lid=.31,low=.03,brow=-.015,tilt=.11,teeth=True)
STATES['Stagger']=dict(mouth=.82,corner=-.025,lid=.20,low=.02,brow=.045,tilt=0,teeth=True)
STATES['Triumph']=dict(mouth=.75,corner=.04,lid=.35,low=.06,brow=-.01,tilt=.10,teeth=True)
track={}
for side,sign in [('L',1),('R',-1)]:
    group=skin.vertex_groups.new(name='frost_hand_'+side)
    group.add([v.index for v in skin.data.vertices if v.co.x*sign>1.50],1,'REPLACE');track[side]=group.index

def project(point):
    q=world_to_camera_view(sc,cam,point)
    return [q.x*CELL[0]-PIVOT[0],(1-q.y)*CELL[1]-PIVOT[1]]

def rect(points):
    xs=[p[0]for p in points];ys=[p[1]for p in points]
    return dict(x=min(xs),y=min(ys),w=max(xs)-min(xs),h=max(ys)-min(ys))

def anchors():
    dep=bpy.context.evaluated_depsgraph_get();eo=skin.evaluated_get(dep);me=eo.to_mesh(preserve_all_data_layers=True,depsgraph=dep);hands={}
    for side in ['L','R']:
        points=[project(eo.matrix_world@v.co)for v in me.vertices if any(g.group==track[side] and g.weight>.5 for g in v.groups)]
        box=rect(points);hands[side]={'x':box['x']+box['w']/2,'y':box['y']+box['h']/2,'r':min(box['w'],box['h'])*.46,'bounds':box}
    eo.to_mesh_clear()
    bones={side:{'shoulder':project(arm.matrix_world@arm.pose.bones['UpperArm.'+side].head),'elbow':project(arm.matrix_world@arm.pose.bones['LowerArm.'+side].head),'wrist':project(arm.matrix_world@arm.pose.bones['LowerArm.'+side].tail)}for side in ['L','R']}
    return {'hands':hands,'bones':bones}

specs=[
 ('idle','Idle',[0,.25,.5,.75],'Scowl',6,True),
 ('walk','Walk',[0,.25,.5,.75],'Scowl',8,True),
 ('windup','Punch',[0,.1,.2,.3],'Protective',10,False),
 ('strike','Punch',[.4,.5,.6,.7],'Protective',12,False),
 ('recover','Punch',[.8,.9,.97,1],'Scowl',10,False),
 ('hurt','HitReact',[0,.3,.6,.9],'Stagger',10,False),
 ('victory','Yes',[0,.25,.5,.75],'Triumph',8,False),
]
OUT.mkdir(exist_ok=True,parents=True)
meta={'source':'art/frost-warden/source/Yeti.gltf','sourceSHA256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'derivedScript':'art/brum.py','derivedScriptSHA256':hashlib.sha256(frost_base_path.read_bytes()).hexdigest(),'unit':[144,128],'pivot':[.5,.90625],'nativeHeight':80,'forward':'right','yaw':65,'anchorSpace':'world units relative to feet pivot; x right, y down','clips':{},'frames':[]}
for name,action_name,fractions,state,fps,loop in specs:
    action=bpy.data.actions[action_name];arm.animation_data.action=action
    if action.slots:arm.animation_data.action_slot=action.slots[0]
    start=len(meta['frames']);meta['clips'][name]={'start':start,'n':len(fractions),'frames':list(range(start,start+len(fractions))),'fps':fps,'loop':loop,'source':action_name,'fractions':fractions}
    f0,f1=action.frame_range
    for i,fraction in enumerate(fractions):
        frame=f0+(f1-f0)*fraction;sc.frame_set(int(frame),subframe=frame-int(frame));pose_fingers();face(state);bpy.context.view_layer.update()
        measured=anchors();dest=OUT/f'{name}_{i:02}.png';sc.render.filepath=str(dest)
        print('FROST RENDER',len(meta['frames'])+1,'/28',dest.name,flush=True)
        bpy.ops.render.render(write_still=True)
        with Image.open(dest)as im:
            im.load();assert im.mode=='RGBA';b=im.getchannel('A').getbbox();assert b and min(b[:2])>1 and b[2]<im.width-1 and b[3]<im.height-1,(name,i,b)
            im.save(dest)
            # A conservative measured torso box excludes empty arm/leg corners.
            alpha=np.array(im.getchannel('A'));rows=[]
            for y in range(round(PX*46),round(PX*78)):
                xs=np.where(alpha[y]>128)[0]
                if len(xs):rows.append((int(xs.min()),int(xs.max())))
            left=max(x[0]for x in rows);right=min(x[1]for x in rows)
            measured['body']={'x':left/PX-PIVOT[0],'y':46-PIVOT[1],'w':max(8,(right-left)/PX),'h':32}
        measured.update(index=len(meta['frames']),clip=name,pose=i,sourceFrame=frame,file=dest.name,alphaBounds=b)
        meta['frames'].append(measured);(OUT/'render-progress.json').write_text(json.dumps(meta,indent=2))
forward=max(['L','R'],key=lambda side:max(f['hands'][side]['x']+f['hands'][side]['r']for f in meta['frames']if f['clip']=='strike'))
meta['forwardHand']=forward
for f in meta['frames']:
    f['fist']={k:f['hands'][forward][k]for k in ['x','y','r']};f.update(f['bones'][forward])
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'frost-warden.blend'))
(OUT/'render.json').write_text(json.dumps(meta,indent=2))
print('FROST COMPLETE',forward,'forward hand',flush=True)
```


---

## `art/frost-warden/pack.py`

Normalizes rendered poses to 256x228 with fixed pivots, strips PNG metadata, preserves actual measured anchors and records source/runtime hashes.

```python
from pathlib import Path
import json,hashlib
from PIL import Image
import numpy as np
ROOT=Path(__file__).resolve().parents[2];SOURCE=Path(__file__).parent/'renders';OUT=ROOT/'assets/frost-warden';OUT.mkdir(parents=True,exist_ok=True)
meta=json.loads((SOURCE/'render.json').read_text());atlas=Image.new('RGBA',(1792,912));records=[]

def opaque_body_shapes(im):
    alpha=np.array(im.getchannel('A'))
    sx=im.width/144;sy=im.height/128;shapes=[]
    # Intersect real contiguous opaque runs in short horizontal bands. This
    # includes the head and lower belly without filling empty arm/leg corners.
    for top in range(36,103,6):
        rows=[];y0=round(top*sy);y1=round((top+6)*sy)
        for row in alpha[y0:y1]:
            occupied=row>=192
            edges=np.diff(np.r_[False,occupied,False].astype(np.int8));runs=list(zip(np.where(edges==1)[0],np.where(edges==-1)[0]))
            choices=[(l,r)for l,r in runs if l<=im.width*.5<=r]
            if not choices:
                choices=[(l,r)for l,r in runs if l<im.width*.64 and r>im.width*.36]
            if not choices:rows=[];break
            rows.append(max(choices,key=lambda p:p[1]-p[0]))
        if not rows:continue
        left=max(v[0]for v in rows);right=min(v[1]for v in rows)
        if (right-left)/sx>=10:
            shapes.append({'x':left/sx-72,'y':y0/sy-116,'w':(right-left)/sx,'h':(y1-y0)/sy})
    # Keep the two legs/feet separate; never bridge their transparent gap.
    for top in range(104,116,2):
        y0=round(top*sy);y1=round((top+2)*sy);common=None
        for row in alpha[y0:y1]:
            edges=np.diff(np.r_[False,row>=192,False].astype(np.int8));runs=list(zip(np.where(edges==1)[0],np.where(edges==-1)[0]))
            common=runs if common is None else [(max(a,c),min(b,d))for a,b in common for c,d in runs if min(b,d)>max(a,c)]
            if not common:break
        for left,right in common or []:
            if (right-left)/sx>=6:
                shapes.append({'x':left/sx-72,'y':y0/sy-116,'w':(right-left)/sx,'h':(y1-y0)/sy})
    assert shapes,'No measured opaque torso bands'
    return shapes

for i,f in enumerate(meta['frames']):
    im=Image.open(SOURCE/f['file']).convert('RGBA').resize((256,228),Image.Resampling.LANCZOS);a=np.array(im);a[a[:,:,3]==0]=0;im=Image.fromarray(a)
    f['bodyShapes']=opaque_body_shapes(im)
    bounds=im.getchannel('A').point(lambda a:255 if a>8 else 0).getbbox();assert bounds and min(bounds[:2])>1 and bounds[2]<255 and bounds[3]<227,(f['file'],bounds)
    path=OUT/f['file'];im.save(path);atlas.paste(im,(i%7*256,i//7*228));records.append({'index':i,'file':path.relative_to(ROOT).as_posix(),'bounds':bounds,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
path=OUT/'warden.png';atlas.save(path)
manifest={**{k:meta[k]for k in ['unit','pivot','nativeHeight','forward','yaw','anchorSpace','forwardHand','clips','source','sourceSHA256','derivedScript','derivedScriptSHA256']},'atlas':'assets/frost-warden/warden.png','sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'cell':[256,228],'columns':7,'rows':4,'anchors':meta['frames'],'frames':records,'size':[1792,912],'palette':{'coat':'#444151','skin':'#91A8B5','belly':'#292D42'},'provenance':{'creator':'Quaternius','license':'CC0-1.0','pack':'Ultimate Monsters','sourceURL':'https://raw.githubusercontent.com/castle-engine/castle-engine/60a49b33914135dbea5dbcd1c040a4bcf08db10e/examples/viewport_and_scenes/occlusion_culling/data/quaternius_ultimate_monsters/Yeti.gltf','externalTextures':[]},'collision':'Measured projected fist circle, conservative torso box and alpha>=192 contiguous opaque head/chest/belly bands; runtime placement and sweeps require native alignment review'}
manifest['render']={'script':'art/frost_warden.py','sha256':hashlib.sha256((ROOT/'art/frost_warden.py').read_bytes()).hexdigest(),'engine':'Blender 5.2.2 / Cycles CPU','samples':16,'sourceCell':[432,384],'sourcePixelsPerUnit':3,'runtimeFilter':'Lanczos, transparent RGB zeroed','normalizer':'art/frost-warden/pack.py','normalizerSHA256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest()}
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2));print(json.dumps({'atlas':str(path),'sha256':manifest['sha256'],'decodedRGBA':1792*912*4,'forwardHand':meta['forwardHand']}))
```


---

## `art/space/weapons_v2.py`

Dimensional dark-metal charge clips and preserved flight/impact drafts for the replacement ship weapon review. Only charge atlases are complete; current single-frame payloads and Canvas motion remain outside gameplay. See design/phase1/weapon-vfx-v2-review.md and its asset report.

```python
"""Bounded transparent 3D weapon motion studies. Not runtime-admitted.

python art/space/weapons_v2.py proof | render [helix|reactor] | pack
Sources and saved hero scenes stay in art/space/weapons-v2; cells/atlases in design/phase1/weapon-vfx-v2.
"""
import bpy, math, random, json, sys, hashlib
from mathutils import Vector
from pathlib import Path
from PIL import Image, ImageFilter, ImageChops, ImageDraw

ROOT=Path(__file__).resolve().parents[2]
SOURCE=ROOT/'art/space/weapons-v2'
OUT=ROOT/'design/phase1/weapon-vfx-v2'
for p in (SOURCE,OUT,OUT/'proof',OUT/'frames'):p.mkdir(parents=True,exist_ok=True)
N=12; SIZE=256; TAU=math.tau

def mat(name,color,metal=0.,rough=.2,emission=0.):
 m=bpy.data.materials.new(name);m.use_nodes=True;b=m.node_tree.nodes.get('Principled BSDF')
 b.inputs['Base Color'].default_value=(*color,1);b.inputs['Metallic'].default_value=metal
 b.inputs['Roughness'].default_value=rough;b.inputs['Coat Weight'].default_value=.65
 b.inputs['Coat Roughness'].default_value=.07
 b.inputs['Emission Color'].default_value=(*color,1);b.inputs['Emission Strength'].default_value=emission
 return m

def materials():
 global M
 M={
  'chrome':mat('polished dark violet chrome',(.14,.105,.21),.96,.15),
  'edge':mat('silver reflected bevel',(.48,.52,.67),1,.13),
  'dark':mat('recessed graphite',(.018,.012,.036),.8,.24),
  'armour':mat('blackened machined titanium',(.045,.05,.075),.94,.18),
  'ceramic':mat('glossy dark ceramic',(.032,.018,.058),.48,.19),
  'violet':mat('faceted amethyst plasma',(.25,.025,.8),.45,.15,.45),
  'pink':mat('dense magenta current',(.36,.004,.12),.22,.18,1.35),
  'cyan':mat('cyan edge current',(.012,.25,.42),.55,.12,.65),
  'hot':mat('white violet energy',(.5,.12,.8),.25,.16,1.65),
 }
 # Turbulence creates material depth on solid plasma rather than a uniform emissive line.
 nt=M['violet'].node_tree;b=nt.nodes.get('Principled BSDF');tex=nt.nodes.new('ShaderNodeTexNoise')
 tex.inputs['Scale'].default_value=7;tex.inputs['Detail'].default_value=3
 ramp=nt.nodes.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].color=(.025,.002,.085,1)
 ramp.color_ramp.elements[1].color=(.55,.045,.85,1)
 nt.links.new(tex.outputs['Fac'],ramp.inputs['Fac']);nt.links.new(ramp.outputs['Color'],b.inputs['Base Color'])

def meshmat(o,key):o.data.materials.append(M[key]);return o
def smooth(o):
 if o.type=='MESH':
  for p in o.data.polygons:p.use_smooth=True
 return o
def sphere(name,loc,scale,key,sub=2,faceted=False):
 bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=sub,radius=1,location=loc);o=bpy.context.object;o.name=name;o.scale=scale
 if not faceted:smooth(o)
 return meshmat(o,key)
def box(name,loc,scale,key,rot=(0,0,0),bevel=.05):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc,rotation=rot);o=bpy.context.object;o.name=name;o.scale=scale
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 mod=o.modifiers.new('machined rounded bevel','BEVEL');mod.width=bevel;mod.segments=3
 o.modifiers.new('weighted reflections','WEIGHTED_NORMAL');return meshmat(o,key)
def tube(name,pts,r,key):
 c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.resolution_u=1;c.bevel_depth=r;c.bevel_resolution=3
 s=c.splines.new('POLY');s.points.add(len(pts)-1)
 for p,co in zip(s.points,pts):p.co=(*co,1)
 o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);return meshmat(o,key)
def torus(name,loc,r,thick,key,rot=(math.pi/2,0,0),scale=None):
 bpy.ops.mesh.primitive_torus_add(major_segments=48,minor_segments=10,location=loc,rotation=rot,major_radius=r,minor_radius=thick)
 o=bpy.context.object;o.name=name
 if scale:o.scale=scale
 return meshmat(smooth(o),key)
def shellplate(name,angle,width,levels,key):
 # Separate thick armour segments keep real open channels; bevels catch the same softboxes as the cannons.
 verts=[];cols=5
 for z,r in levels:
  for k in range(cols):
   a=angle+(k/(cols-1)-.5)*width;verts.append((r*math.cos(a),r*math.sin(a),z))
 faces=[]
 for j in range(len(levels)-1):
  for k in range(cols-1):
   a=j*cols+k;faces.append((a,a+1,a+cols+1,a+cols))
 me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);me.update();o=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(o);meshmat(o,key)
 mod=o.modifiers.new('solid armour thickness','SOLIDIFY');mod.thickness=.075
 mod=o.modifiers.new('milled edge bevel','BEVEL');mod.width=.035;mod.segments=3
 o.modifiers.new('broad machined normals','WEIGHTED_NORMAL');return o
def fin(name,a,z):
 # A welded trapezoid fin, not an unconnected jewel floating beside the body.
 pts=[(.36,-.05,z+.33),(.89,-.05,z+.14),(.83,-.05,z-.32),(.44,-.05,z-.23),(.36,.05,z+.33),(.89,.05,z+.14),(.83,.05,z-.32),(.44,.05,z-.23)]
 verts=[(x*math.cos(a)-y*math.sin(a),x*math.sin(a)+y*math.cos(a),zz) for x,y,zz in pts]
 me=bpy.data.meshes.new(name);me.from_pydata(verts,[],[(0,1,2,3),(4,7,6,5),(0,4,5,1),(1,5,6,2),(2,6,7,3),(3,7,4,0)]);me.update()
 o=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(o);meshmat(o,'armour');mod=o.modifiers.new('fin machined bevel','BEVEL');mod.width=.035;mod.segments=3;o.modifiers.new('weighted fin highlights','WEIGHTED_NORMAL')
 tube('fin edge reflection',[(.52*math.cos(a),.52*math.sin(a)-.055,z+.25),(.83*math.cos(a),.83*math.sin(a)-.055,z+.13)],.018,'edge')
def light(name,loc,power,size,color):
 bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.name=name;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.data.color=color
 o.rotation_euler=(Vector((0,0,0))-o.location).to_track_quat('-Z','Y').to_euler()

def reset(phase):
 bpy.ops.wm.read_factory_settings(use_empty=True);materials();sc=bpy.context.scene
 sc.render.engine='CYCLES';sc.cycles.device='CPU';sc.cycles.samples=16;sc.cycles.use_denoising=True
 sc.render.threads_mode='FIXED';sc.render.threads=4
 sc.render.resolution_x=SIZE;sc.render.resolution_y=SIZE;sc.render.resolution_percentage=100
 sc.render.film_transparent=True;sc.render.image_settings.file_format='PNG';sc.render.image_settings.color_mode='RGBA';sc.render.image_settings.color_depth='8'
 sc.view_settings.view_transform='AgX';sc.view_settings.look='AgX - Medium High Contrast'
 sc.world=bpy.data.worlds.new('violet reflection environment');sc.world.use_nodes=True
 sc.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.095,.07,.16,1)
 sc.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.5
 # Same soft key/cool fill/coloured bounce/reflection-card scheme as render_vault_assets.py, at local prop scale.
 light('large silver key',(-3,-4,5),650,4,(.83,.88,1))
 light('cyan edge strip',(4,-1,1),430,2,(.18,.75,1))
 light('magenta bounce',(-2,2,-2),370,3,(1,.12,.47))
 bpy.ops.mesh.primitive_plane_add(size=1,location=(0,-6,1),rotation=(math.pi/2,0,0))
 card=bpy.context.object;card.name='reflection-only softbox';card.scale=(4,5,1);card.visible_camera=False;card.visible_shadow=False
 cm=mat('softbox reflection',(.7,.83,1),0,.2,2.5);card.data.materials.append(cm)
 bpy.ops.object.camera_add(location=(0,-10,3.6));cam=bpy.context.object
 cam.rotation_euler=(Vector((0,0,0))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=4.5 if phase=='impact' else 3.7 if phase=='flight' else 4.5
 sc.camera=cam;return sc

def aperture(t,kind):
 # A three-dimensional segmented iris: substantial bevels, recessed seats and chromed jaws.
 spin=t*.55;radius=.77 if kind=='helix' else .9
 torus('aperture rear wall',(0,.18,0),radius,.15,'dark')
 torus('polished outer rim',(0,0,0),radius,.085,'edge')
 torus('emissive inner groove',(0,-.07,0),radius-.2,.032,'pink')
 for i in range(8):
  a=TAU*i/8+spin;x=radius*math.cos(a);z=radius*math.sin(a)
  box('bevelled magnetic jaw', (x,-.12,z),(.31,.3,.29),'chrome',(0,-a,0),.055)
  box('cyan reflection insert',(x*1.04,-.29,z*1.04),(.18,.018,.045),'cyan',(0,-a,0),.012)
  b=a+.23;rr=.5+.12*(1-t)
  box('moving iris blade',(rr*math.cos(b),-.05,rr*math.sin(b)),(.34,.12,.18),'edge',(0,-b+.6,0),.03)
 core=.19+.17*(t*t)
 sphere('suspended charging core',(0,-.06,0),(core,core,core),'violet',2,True)
 for j in range(3):
  r=.17+j*.12+.04*math.sin(t*TAU+j)
  pts=[(r*math.cos(a),-.14-.05*math.sin(a*3+t*5),r*math.sin(a)) for a in [TAU*k/64+t*(j+1) for k in range(65)]]
  tube('braided charge filament',pts,.018 if j else .026,'hot' if j==0 else 'pink')
 if kind=='reactor':
  for i in range(4):
   a=i*math.pi/2+t*1.1
   pts=[(.38*math.cos(a+u),-.4+.7*math.sin(u),.38*math.sin(a+u)) for u in [math.pi*k/24 for k in range(25)]]
   tube('suspended chrome cage rib',pts,.045,'chrome')

def helix(t,phase):
 if phase=='charge':aperture(t,'helix');return
 if phase=='flight':
  sphere('dense interior plasma',(0,0,-.12),(.38,.38,.95),'violet',3)
  levels=[(.8,.35),(.58,.52),(-.25,.55),(-.7,.34),(-1.04,.055)]
  for j in range(6):
   a=j*TAU/6
   shellplate('segmented armoured lance',a,.88,levels,'armour' if j%2 else 'ceramic')
   # Etched dark tracks and thin reflected seams sit on armour rather than wrapping around the body.
   pts=[(r*math.cos(a),r*math.sin(a),z) for z,r in[(.48,.535),(.1,.565),(-.35,.51)]]
   tube('recessed etched track',pts,.021,'dark');tube('embedded cool seam',[(x*1.005,y*1.005,z) for x,y,z in pts],.008,'cyan')
   if j%2==0:fin('attached containment fin',a,.35)
   gap=a+.5
   pts=[((r-.04)*math.cos(gap),(r-.04)*math.sin(gap),z) for z,r in levels[:-1]]
   tube('irregular plasma inside armour gap',pts,.026,'pink')
  torus('rear milled accelerator collar',(0,0,.7),.42,.075,'edge',rot=(0,0,0))
  bpy.ops.mesh.primitive_cone_add(vertices=12,radius1=.03,radius2=.2,depth=.37,location=(0,0,-1.02));meshmat(bpy.context.object,'pink')
  sphere('irregular hot nose nucleus',(.025,-.055,-1.13),(.055,.05,.08),'hot',1,True)
  for j in range(3):
   pts=[]
   for k in range(25):
    q=k/24;z=.78+q*.68;a=j*2.2+q*1.8+t*TAU;r=.1+.05*math.sin(q*10+t*TAU+j)
    pts.append((r*math.cos(a),r*math.sin(a),z))
   o=tube('short turbulent exhaust filament',pts,.045,'pink' if j!=0 else 'cyan')
   for k,p in enumerate(o.data.splines[0].points):p.radius=(1-k/25)*(.6+.25*math.sin(k*.8+t*TAU+j))
  return
 impact(t,'helix')

def reactor(t,phase):
 if phase=='charge':aperture(t,'reactor');return
 if phase=='flight':
  sphere('fragmented dense reactor interior',(0,0,0),(.65,.65,.75),'violet',2)
  levels=[(.8,.22),(.62,.59),(.1,.76),(-.45,.66),(-.78,.29)]
  for j in range(8):
   a=j*TAU/8+.04*math.sin(t*TAU+j)
   shellplate('heavy fractured reactor armour',a,.62,levels,'armour' if j%3 else 'chrome')
   pts=[]
   for k,(z,r) in enumerate(levels):
    b=a+.36+.035*math.sin(k*2+j+t*TAU);pts.append(((r-.035)*math.cos(b),(r-.035)*math.sin(b),z))
   tube('emissive crack under cage',pts,.035,'pink')
   if j%2==0:
    box('attached containment block',(.73*math.cos(a),.73*math.sin(a),.05),(.19,.19,.34),'edge',(0,a,.2),.045)
  for z in[-.68,.65]:torus('heavy reactor collar',(0,0,z),.38,.09,'edge',rot=(0,0,0))
  for j in range(3):
   a=j*2.4+t*TAU;z=.91+j*.12
   sphere('short irregular ion wake',(.12*math.sin(a),.1*math.cos(a),z),(.07,.055,.16-.025*j),'pink',1,True)
  return
 impact(t,'reactor')

def impact(t,kind):
 q=1-(1-t)**2;fade=max(.005,1-t);rng=random.Random(419 if kind=='helix' else 991)
 if kind=='helix':
  # Lateral shear: broken milled armour is the read; the pressure flash is brief, never a full ring.
  flash=max(.005,1-t/.27)
  for j in range(5):
   a=j*2.1;r=.15+.25*math.sin(j*3)
   sphere('brief irregular pressure flash',(r*math.cos(a),-.15,.15*math.sin(a)),(.5*flash,.25*flash,.22*flash),'hot' if j%2 else 'pink',2)
  for j in range(10):
   side=-1 if j%2 else 1;x=side*(.2+q*(1.1+.1*(j%5)));z=(j//2-2)*.21*(.3+q)-.1*t*t;y=rng.uniform(-.2,.2)
   o=box('laterally sheared milled shell',(x,y,z),((.4+.04*(j%3))*fade,.19*fade,.22*fade),'armour' if j%3 else 'edge',(j*.4,t*3*side,j*.3+t),.025*fade)
   if j%2==0:tube('hot fracture edge',[(x-.13*fade,y-.11*fade,z),(x+.1*fade,y-.11*fade,z+.045)],.018*fade,'pink')
  for j in range(3):
   x=(-.3+j*.3)*fade
   sphere('residual compressed plasma',(x,-.02,.08*math.sin(j+t*8)),(.13*fade,.1*fade,.2*fade),'violet',1,True)
  return
 # A dense off-centre rupture has no radial symmetry and stays heavier/closer than the lance shear.
 sphere('ruptured black reactor mass',(-.14,.08,-.08),(.68*fade,.4*fade,.67*fade),'armour',2,True)
 for j in range(3):
  a=j*2.399;r=.2+.22*q;x=-.28+r*math.cos(a);z=.18+r*math.sin(a)
  s=(.45+.04*math.sin(j))*fade
  o=sphere('connected turbulent core rupture',(x,-.19+.07*math.sin(j),z),(s*1.15,s*.8,s),'pink' if j%2 else 'violet',3)
  tex=bpy.data.textures.new('rough plasma surface','CLOUDS');tex.noise_scale=.2
  d=o.modifiers.new('broken pressure volume','DISPLACE');d.texture=tex;d.strength=.22*fade;d.mid_level=.45
 sphere('small exposed hot fracture',(-.36,-.47,.27),(.12*fade,.055*fade,.13*fade),'hot',2)
 for j in range(8):
  a=j*2.399+.3;r=.28+q*(.65+.2*rng.random());x=r*math.cos(a)+.12;z=r*math.sin(a)-.1
  size=(.31+.05*rng.random())*fade
  o=box('heavy reactor containment fracture',(x,rng.uniform(-.16,.18),z),(size,.22*fade,size*.75),'chrome' if j%3 else 'armour',(a*.4,t*2+a,a+t*1.3),.04*fade)
  if j%2==0:sphere('hot crack at armour break',(x,-.2,z),(.075*fade,.04*fade,.14*fade),'pink',1,True)

def render(family,phase,frame,proof=False):
 sc=reset(phase);t=frame/(N if phase=='flight' else N-1);(helix if family=='helix' else reactor)(t,phase)
 dest=OUT/(f'proof/{proof}' if isinstance(proof,str) else 'proof' if proof else f'frames/{family}-{phase}')
 dest.mkdir(parents=True,exist_ok=True);path=dest/f'{family}-{phase}-{frame:02}.png'
 sc.render.filepath=str(path);bpy.ops.render.render(write_still=True)
 # Preserve raw geometry/shading output and strip PNG metadata; a tight luminance bloom is a derivative.
 im=Image.open(path).convert('RGBA');im.save(path)
 if proof:bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE/f'{family}-{phase}-{proof if isinstance(proof,str) else "hero"}.blend'))
 return path

def manifest():
 clips={}
 for fam in['helix','reactor']:
  clips[fam]={}
  for phase in['charge','flight','impact']:
   ready=(OUT/f'{fam}-{phase}.png').exists()
   clips[fam][phase]={'atlas':f'{fam}-{phase}.png','available':ready,'approval':'prototype only; native assessment pending' if ready else 'UNRENDERED — held for native assessment','cell':[256,256],'grid':[4,3],'frames':12,'frameRects':[[i%4*256,i//4*256,256,256]for i in range(12)],'fps':24,'pivot':[128,128],'displayUnits':{'charge':56,'flight':88 if fam=='helix' else 80,'impact':96}[phase],'loop':phase=='flight','blend':'source-over','direction':'down at rotation 0'}
  clips[fam]['discharge']={'alias':'flight','available':clips[fam]['flight']['available'],'indices':[0,1,2,3],'fps':24}
  clips[fam]['cool']={'alias':'charge','available':clips[fam]['charge']['available'],'indices':[3,2,1,0],'fps':24}
 m={'status':'prototype, unapproved, no gameplay integration; charge only is rendered','source':'art/space/weapons_v2.py','sourceSha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'sourceScenes':'art/space/weapons-v2','renderer':'Blender5.2.2 Cycles CPU,16samples,4threads,AgX Medium High Contrast,transparent RGBA','palette':['dark chrome','violet-magenta plasma','cyan reflection edges'],'families':clips,'collision':'visual studies only; no radius, damage, timing or rules admitted'}
 (OUT/'manifest.json').write_text(json.dumps(m,indent=2))

def pack(phase_only=None):
 report=json.loads((OUT/'render-report.json').read_text()) if (OUT/'render-report.json').exists() else {}
 for fam in['helix','reactor']:
  for phase in([phase_only] if phase_only else ['charge','flight','impact']):
   atlas=Image.new('RGBA',(1024,768));bounds=[]
   for i in range(N):
    p=OUT/f'frames/{fam}-{phase}/{fam}-{phase}-{i:02}.png';im=Image.open(p).convert('RGBA');atlas.paste(im,(i%4*256,i//4*256));bounds.append(im.getchannel('A').getbbox())
   p=OUT/f'{fam}-{phase}.png';atlas.save(p)
   report[f'{fam}-{phase}']={'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size,'alphaBounds':bounds}
 (OUT/'render-report.json').write_text(json.dumps(report,indent=2))

if __name__=='__main__':
 manifest();cmd=sys.argv[1] if len(sys.argv)>1 else 'proof'
 if cmd=='proof':
  for fam in['helix','reactor']:
   for phase in['charge','flight']:print('PROOF',render(fam,phase,8,True),flush=True)
 elif cmd=='proof-impact':
  for fam in['helix','reactor']:print('PROOF',render(fam,'impact',4,True),flush=True)
 elif cmd=='proof-mechanical':
  for fam in['helix','reactor']:
   for phase in['flight','impact']:print('PROOF',render(fam,phase,8 if phase=='flight' else 4,'mechanical-v2'),flush=True)
 elif cmd=='render':
  fams=[sys.argv[2]] if len(sys.argv)>2 else ['helix','reactor']
  for fam in fams:
   for phase in['charge','flight','impact']:
    for i in range(N):print('FRAME',render(fam,phase,i),flush=True)
 elif cmd=='render-phase':
  fams=[sys.argv[2]] if sys.argv[2]!='all' else ['helix','reactor'];phase=sys.argv[3]
  for fam in fams:
   for i in range(N):print('FRAME',render(fam,phase,i),flush=True)
 elif cmd=='proof-impact-v3':
  for fam in['helix','reactor']:print('PROOF',render(fam,'impact',2 if fam=='helix' else 4,'impact-v3'),flush=True)
 elif cmd=='proof-impact-v4':
  for fam in['helix','reactor']:
   for i in[0,1,4,8]:print('PROOF',render(fam,'impact',i,'impact-v4'),flush=True)
 elif cmd=='pack':pack(sys.argv[2] if len(sys.argv)>2 else None)
```


---

## `tools/archive_artwork.py`

Verifies preserved originals, stores new versions byte-for-byte, deduplicates identical artwork and updates the reusable catalogue and space-board gallery. Scope and backup limits are in docs/ARTWORK_LIBRARY.md.

```python
"""Preserve reusable artwork byte-for-byte; changed sources become new versions."""
from pathlib import Path
import hashlib
import json
import shutil

ROOT = Path(__file__).resolve().parents[1]
LIBRARY = ROOT / 'artwork-library'
MEDIA = {'.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.webm'}
SOURCES = [
    ('concepts', 'design/phase1/img'),
    ('sources', 'art/space'),
    ('sources', 'art/frost-warden'),
    ('sources', 'art/starflight'),
    ('sources', 'art/starflight-v2'),
    ('sources', 'art/starflight-arsenal'),
    ('sources', 'art/starflight-storm'),
    ('sources', 'art/starflight-equipment'),
    ('sources', 'art/fantasy-machinery'),
    ('sources', 'art/snake-emerald'),
    ('sources', 'art/mooncoil'),
    ('assets', 'design/phase1/weapon-vfx-v2'),
    ('assets', 'design/phase1/weapon-vfx-v3'),
    *[('assets', 'assets/' + name) for name in (
        'mooncoil', 'space-a', 'space-b', 'space-c', 'space-common', 'space-companions', 'circuit-companions',
        'relay-circuit', 'orbital-forge', 'frost-warden', 'kit', 'kit-cast', 'snake-jade', 'snake-emerald', 'starflight', 'starflight-v2', 'starflight-arsenal', 'starflight-storm', 'starflight-equipment', 'fantasy-machinery')],
    *[('renders', 'out/' + name) for name in (
        'brum-proof', 'kit-proof', 'kit-cast-proof', 'cast',
        'rejected-cast-20261018', 'rejected-kit-20261018')],
]


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    LIBRARY.mkdir(exist_ok=True)
    manifest_path = LIBRARY / 'manifest.json'
    manifest = json.loads(manifest_path.read_text('utf-8')) if manifest_path.exists() else {'version': 1, 'files': []}
    files = {item['sha256']: item for item in manifest['files']}
    for item in files.values():
        path = LIBRARY / item['archive']
        assert path.is_file() and digest(path) == item['sha256'], f"Archive changed: {path}"
    for category, source_root in SOURCES:
        base = ROOT / source_root
        if not base.exists():
            continue
        for source in sorted(base.rglob('*')):
            allowed = MEDIA | ({'.json'} if category == 'assets' else set())
            if not source.is_file() or source.suffix.lower() not in allowed:
                continue
            sha = digest(source)
            relative = source.relative_to(ROOT).as_posix()
            item = files.get(sha)
            if item is None:
                tail = source.relative_to(base)
                archived = Path(category) / base.name / tail.parent / f'{tail.stem}--{sha[:12]}{tail.suffix.lower()}'
                target = LIBRARY / archived
                target.parent.mkdir(parents=True, exist_ok=True)
                assert not target.exists(), f'Archive name collision: {target}'
                shutil.copyfile(source, target)
                assert digest(target) == sha, f'Copy mismatch: {source}'
                item = files[sha] = {'archive': archived.as_posix(), 'sha256': sha, 'bytes': source.stat().st_size, 'sources': []}
            if relative not in item['sources']:
                item['sources'].append(relative)
                item['sources'].sort()
    manifest['files'] = sorted(files.values(), key=lambda item: item['archive'])
    manifest_path.write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
    rows = ['# Artwork catalogue', '', 'Every link opens a preserved original. Identical files share one copy; source aliases and full SHA256 hashes are in [manifest.json](manifest.json).', '', '| Artwork | Working source / aliases |', '|---|---|']
    for item in manifest['files']:
        aliases = '<br>'.join(item['sources'])
        rows.append(f"| [{Path(item['archive']).stem.rsplit('--', 1)[0]}]({item['archive']}) | {aliases} |")
    (LIBRARY / 'CATALOGUE.md').write_text('\n'.join(rows) + '\n', encoding='utf-8')
    boards = ['# Space design boards', '', 'Preserved originals; these links remain usable if a working source changes. Carrier A, Circuit A and Forge A are selected directions. Eclipse D and the alternate later gameplay directions remain references.', '']
    for title, name in [('Carrier Breakout — A', 'space-carrier-a.png'), ('Relay Raiders — B', 'space-relay-b.png'), ('Orbital Breakout — C', 'space-orbital-c-v1.png'), ('Eclipse Rescue — D', 'space-eclipse-d-v1.png'), ('Circuit gameplay alternatives', 'relay-variety-study-v3.png'), ('Forge gameplay alternatives', 'orbital-variety-study-v3.png')]:
        alias = 'design/phase1/img/' + name
        match = next(item for item in files.values() if alias in item['sources'])
        boards += [f'## {title}', '', f"![{title}]({match['archive']})", '']
    (LIBRARY / 'SPACE_BOARDS.md').write_text('\n'.join(boards), encoding='utf-8')
    print(json.dumps({'folder': str(LIBRARY), 'uniqueFiles': len(files), 'sourceVersions': sum(len(i['sources']) for i in files.values()), 'bytes': sum(i['bytes'] for i in files.values()), 'verified': True}))


if __name__ == '__main__':
    main()
```


---

## `art/space/circuit/prepare.py`

Circuit skiff poses, measured emitters/cradle/lip and real B port leaves. Preserves original source family and emits stripped PNGs/normalized collision manifest; no permanent menu or APK admission.

```python
"""Normalize the selected Circuit machinery/flight family; retain originals."""
import json, math, hashlib
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[3]; OUT=ROOT/'assets/relay-circuit'; OUT.mkdir(parents=True,exist_ok=True)
SOURCES=Path(__file__).parent/'source';SOURCES.mkdir(exist_ok=True)
craft=SOURCES/'craft-family.png';badge=SOURCES/'phase-badge.png'
if not craft.is_file() or not badge.is_file():raise FileNotFoundError('Preserved Circuit source plates are required')
parts={}
def save(im,name,display,pivot=(.5,.5),collision=False):
 path=OUT/(name+'.png');im.save(path)
 w,h=im.size;box=im.getchannel('A').point(lambda v:255 if v>=32 else 0).getbbox()
 p={'path':path.relative_to(ROOT).as_posix(),'size':[w,h],'display':display,'pivot':pivot,'artBounds':[box[0]/w,box[1]/h,(box[2]-box[0])/w,(box[3]-box[1])/h]}
 if collision:
  # A small raster contour uses the same measured-alpha pipeline as canonical B.
  source=(ROOT/'tools/relay-preview/art_info.py').read_text();ns={};exec(source[:source.index('manifest =')],ns)
  p['collision']=ns['contours'](im)
 parts[name]=p
im=Image.open(craft).convert('RGBA')
regions=[(0,60,697,570),(697,0,1374,570),(0,580,700,1145),(700,580,1374,1145)]
for name,region in zip(['craftMorph','craftFlight','craftLeft','craftRight'],regions):
 z=im.crop(region);box=z.getchannel('A').point(lambda v:255 if v>=16 else 0).getbbox();z=z.crop(box)
 z.thumbnail((448,352),Image.Resampling.LANCZOS);cell=Image.new('RGBA',(512,384));cell.alpha_composite(z,((512-z.width)//2,368-z.height));save(cell,name,[80,60],collision=True)
z=Image.open(badge).convert('RGBA');z=z.crop(z.getchannel('A').point(lambda v:255 if v>=16 else 0).getbbox());z.thumbnail((240,192),Image.Resampling.LANCZOS);cell=Image.new('RGBA',(256,208));cell.alpha_composite(z,((256-z.width)//2,(208-z.height)//2));save(cell,'phaseBadge',[18,14])
frame=Image.open(ROOT/'assets/space-b/pod_shell.png').convert('RGBA');w,h=frame.size;mid=w//2
save(frame.crop((0,0,mid,h)),'portLeft',[31.5,52.83374083129584],[1,.5],True)
save(frame.crop((mid,0,w,h)),'portRight',[31.5,52.83374083129584],[0,.5],True)
report={'status':'selected Circuit source family; native/runtime review pending','parts':parts,'contract':{'craftCradle':[0,-23],'flightEmitters':[[-22,-23],[22,-23]],'portTravel':18,'plateLeaves':['left','left','left','right'],'glyphs':['circle','triangle','diamond','square']},'sources':{'craft':{'path':'art/space/circuit/source/craft-family.png','sha256':hashlib.sha256(craft.read_bytes()).hexdigest()},'badge':{'path':'art/space/circuit/source/phase-badge.png','sha256':hashlib.sha256(badge.read_bytes()).hexdigest()},'port':'assets/space-b/pod_shell.png'}}
anchors={'craftFlight':{'muzzles':[[161.7/512,76.5/384],[350.5/512,76.5/384]],'cradle':[256/512,98/384],'cradleLip':[229,103,54,9]},'craftLeft':{'muzzles':[[112/512,73.2/384],[271.9/512,62.6/384]],'cradle':[225/512,94/384],'cradleLip':[201,99,54,10]},'craftRight':{'muzzles':[[231.9/512,54.7/384],[397/512,68.8/384]],'cradle':[281/512,92/384],'cradleLip':[255,97,55,10]}}
for key,values in anchors.items():parts[key].update(values);parts[key]['stowedRadius']=3
report['contract'].pop('craftCradle');report['contract'].pop('flightEmitters');report['contract']['anchors']='per-part UV measured from actual rail LEDs/U-recess; foreground source lip patch occludes the visual stowed icon only'
(OUT/'manifest.json').write_text(json.dumps(report,indent=2))
for p in OUT.glob('*.png'):
 q=Image.open(p);assert q.mode=='RGBA' and not q.info
print(json.dumps({k:{'size':v['size'],'display':v['display']} for k,v in parts.items()},indent=2))
```


---

## `art/space/forge/prepare.py`

Forge frame/coil/hinged cover, real C hull, external reactor/arm, cannon, panels and dark Saturn. Source-alpha ownership and measured contours preserve actual physical openings.

```python
"""Slice the reference-guided Forge family and derive collision from its alpha."""
from pathlib import Path
from collections import defaultdict
import hashlib, json, math
import numpy as np
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[3]
SRC = Path(__file__).resolve().parent
OUT = ROOT / 'assets/orbital-forge'
OUT.mkdir(exist_ok=True)
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()

def area(points):
    return sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(points, points[1:]+points[:1]))/2

def simplify(points, eps=1):
    def rdp(p):
        if len(p)<3: return p
        a,b=p[0],p[-1]; dx,dy=b[0]-a[0],b[1]-a[1]; den=math.hypot(dx,dy)
        d=[abs(dx*(a[1]-q[1])-(a[0]-q[0])*dy)/den if den else math.hypot(q[0]-a[0],q[1]-a[1]) for q in p]
        i=max(range(len(p)),key=lambda i:d[i])
        return rdp(p[:i+1])[:-1]+rdp(p[i:]) if d[i]>eps else [a,b]
    i=max(range(1,len(points)),key=lambda i:(points[i][0]-points[0][0])**2+(points[i][1]-points[0][1])**2)
    return rdp(points[:i+1])[:-1]+rdp(points[i:]+points[:1])[:-1]

def contours(image):
    a=np.asarray(image.getchannel('A'))>=128
    edges=defaultdict(list)
    for y,x in zip(*np.nonzero(a)):
        if y==0 or not a[y-1,x]: edges[(int(x),int(y))].append((int(x+1),int(y)))
        if x==a.shape[1]-1 or not a[y,x+1]: edges[(int(x+1),int(y))].append((int(x+1),int(y+1)))
        if y==a.shape[0]-1 or not a[y+1,x]: edges[(int(x+1),int(y+1))].append((int(x),int(y+1)))
        if x==0 or not a[y,x-1]: edges[(int(x),int(y+1))].append((int(x),int(y)))
    loops=[]
    while edges:
        start=next(iter(edges)); p=start; points=[]
        while True:
            points.append(p); q=edges[p].pop()
            if not edges[p]: del edges[p]
            p=q
            if p==start: break
            if p not in edges: raise AssertionError('unclosed alpha boundary')
        if abs(area(points))>=12: loops.append(simplify(points,1.2))
    outer=[p for p in loops if area(p)>0]
    holes=[p for p in loops if area(p)<0]
    assert outer
    norm=lambda p:[[round(x/image.width,7),round(y/image.height,7)] for x,y in p]
    # Large disconnected pieces retain separate contours; tiny highlights are decoration.
    return [{'type':'polygon','points':norm(p),'holes':[norm(h) for h in holes if min(x for x,y in p)<=h[0][0]<=max(x for x,y in p) and min(y for x,y in p)<=h[0][1]<=max(y for x,y in p)]} for p in outer if area(p)>=image.width*image.height*.0005]

parts={}
def save(id,image,source,crop=None,display=None,shared=False,contour=True):
    image=image.convert('RGBA')
    if not shared:
        box=image.getchannel('A').point(lambda a:255 if a>=16 else 0).getbbox(); assert box
        crop=box if crop is None else crop
        image=image.crop(box)
        cv=Image.new('RGBA',(image.width+8,image.height+8));cv.alpha_composite(image,(4,4));image=cv
    if image.width>900 and id not in ['hull','bay_mask','bay_back','door_left','door_right']:
        image=image.resize((900,round(image.height*900/image.width)),Image.Resampling.LANCZOS)
    path=OUT/(id+'.png');image.save(path);assert not Image.open(path).info
    parts[id]={'path':path.relative_to(ROOT).as_posix(),'size':list(image.size),'pivot':[.5,.5], 'sha256':sha(path),'source':source.relative_to(ROOT).as_posix(),'sourceSHA256':sha(source),'crop':list(crop) if crop else None,'metadataEmpty':True}
    if display: parts[id]['display']=[display,display*image.height/image.width]
    bounds=image.getchannel('A').point(lambda a:255 if a>=128 else 0).getbbox()
    parts[id]['artBounds']=[bounds[0]/image.width,bounds[1]/image.height,(bounds[2]-bounds[0])/image.width,(bounds[3]-bounds[1])/image.height]
    if contour: parts[id]['shapes']=contours(image)
    return image

opened=Image.open(SRC/'stabiliser-open-source.png').convert('RGBA')
box=opened.getchannel('A').point(lambda a:255 if a>=16 else 0).getbbox()
opened=opened.crop(box)
opened=opened.resize((900,round(opened.height*900/opened.width)),Image.Resampling.LANCZOS)
# Part ownership separates the visible energy cartridge from its U-shaped metal frame.
mask=Image.new('L',opened.size); mask.paste(255,(round((432-box[0])*900/(box[2]-box[0])),round((360-box[1])*900/(box[2]-box[0])),round((832-box[0])*900/(box[2]-box[0])),round((928-box[1])*900/(box[2]-box[0]))))
coil=opened.copy();coil.putalpha(ImageChops.multiply(opened.getchannel('A'),mask))
body=opened.copy();body.putalpha(ImageChops.subtract(opened.getchannel('A'),coil.getchannel('A')))
save('station_body',body,SRC/'stabiliser-open-source.png',box,55,True)
save('station_coil',coil,SRC/'stabiliser-open-source.png',box,55,True)
save('station_cover',Image.open(SRC/'stabiliser-cover-source.png'),SRC/'stabiliser-cover-source.png',display=55)

projector=Image.open(SRC/'projector-source.png').convert('RGBA')
pbox=projector.getchannel('A').point(lambda a:255 if a>=16 else 0).getbbox()
projector=projector.crop(pbox)
mask=Image.new('L',projector.size)
from PIL import ImageDraw
ImageDraw.Draw(mask).ellipse((445-pbox[0],785-pbox[1],812-pbox[0],1127-pbox[1]),fill=255)
core=projector.copy();core.putalpha(ImageChops.multiply(projector.getchannel('A'),mask))
arm=projector.copy();arm.putalpha(ImageChops.subtract(projector.getchannel('A'),core.getchannel('A')))
save('projector_arm',arm,SRC/'projector-source.png',pbox,55,True)
save('reactor',core,SRC/'projector-source.png',pbox,55,True)
save('cannon',Image.open(SRC/'cannon-source.png'),SRC/'cannon-source.png',display=42)

atlas=Image.open(SRC/'panel-family-source.png').convert('RGBA')
rows=np.any(np.asarray(atlas.getchannel('A'))>=128,axis=1)
groups=[]; start=None
for y,on in enumerate(rows):
    if on and start is None:start=y
    if start is not None and (not on or y==len(rows)-1):
        end=y if not on else y+1
        if end-start>70:groups.append((start,end))
        start=None
assert len(groups)==3,groups
for id,(y0,y1) in zip(['cyan','violet','armour'],groups):save(id,atlas.crop((0,y0,atlas.width,y1)),SRC/'panel-family-source.png',crop=(0,y0,atlas.width,y1),display=40)

bg=Image.open(SRC/'background-source.png').convert('RGBA')
save('background',bg,SRC/'background-source.png',shared=True,contour=False)

machinery=json.loads((ROOT/'assets/space-c/machinery.json').read_text())
for p in machinery['parts']:
    im=Image.open(ROOT/p['path']).convert('RGBA')
    parts[p['id']]={**p,'display':[360,360*im.height/im.width]}
    if p['id']=='hull':parts[p['id']]['shapes']=contours(im)

ab=json.loads((ROOT/'design/phase1/space-assets-ab.json').read_text())
for id,source_id in [('paddle','aPaddle'),('ball','ball')]:
    p=ab['parts'][source_id]; im=Image.open(ROOT/p['path']).convert('RGBA'); bounds=im.getchannel('A').point(lambda a:255 if a>=128 else 0).getbbox(); parts[id]={**p,'size':list(im.size),'pivot':p.get('pivot',[.5,.5]),'sha256':sha(ROOT/p['path']),'artBounds':[bounds[0]/im.width,bounds[1]/im.height,(bounds[2]-bounds[0])/im.width,(bounds[3]-bounds[1])/im.height]}

result={'date':'2026-10-18','scope':'Selected Shutter Forge isolated art family; runtime admission pending','reference':'design/phase1/img/orbital-variety-study-v3.png','referenceSHA256':sha(ROOT/'design/phase1/img/orbital-variety-study-v3.png'),'generationReferences':['design/phase1/img/orbital-variety-study-v2.png','assets/space-c/hull.png'],'parts':parts,'machinery':machinery['assembly'],'source':{'directory':'art/space/forge/','method':'reference-guided raster parts; editable alpha decomposition and deterministic source contours in prepare.py'},'semantics':{'stationDisplayWidth':55,'stationCoilRegionOriginal':[432,360,832,928],'coreRegionOriginal':[445,785,812,1127],'gunPivot':[.5,.23],'gunMuzzle':[.5,.82],'hullWorldRect':[0,76,360,machinery['assembly']['displayHeight']]}}
(OUT/'manifest.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'parts':{k:{'size':v['size'],'display':v.get('display'),'shapes':len(v.get('shapes',[]))} for k,v in parts.items()},'manifestSHA256':sha(OUT/'manifest.json')},indent=2))
```


---

## `tools/space-assets/pack-level-family.py`

Sizes selected level textures to phone resolution, writes lossless WebP and asserts exact resized-reference RGBA plus native-scale fidelity; source collision and anchors stay authoritative.

```python
"""Size an isolated level family for phone rendering; preserve source geometry."""
import hashlib
import io
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
manifest_path, output = [Path(p).resolve() for p in sys.argv[1:]]
manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
output.mkdir(parents=True, exist_ok=True)
sha = lambda data: hashlib.sha256(data).hexdigest()
rows = []
for name, part in manifest['parts'].items():
    source = ROOT / part['path']
    raw = source.read_bytes()
    if part.get('sha256'):
        assert sha(raw) == part['sha256'], f'{name}: source changed'
    with Image.open(io.BytesIO(raw)) as image:
        assert not image.info, f'{name}: source metadata'
        assert list(image.size) == part['size'], f'{name}: dimensions changed'
        original = image.convert('RGBA')
    image = original.copy()
    display = part.get('display')
    if isinstance(display, list):
        ratio = min(1, max(display) * 3 / max(image.size))
        if ratio < 1:
            image = image.resize(tuple(max(1, round(n * ratio)) for n in image.size), Image.Resampling.LANCZOS)
    pixels = np.array(image)
    pixels[pixels[:, :, 3] == 0, :3] = 0
    image = Image.fromarray(pixels)
    encoded = io.BytesIO()
    # Large opaque plates may opt in to lossy colour ("encode": "lossy"); alpha must stay bit-exact so silhouettes
    # and collision never move, and the native-size guard below still bounds the visible error.
    lossy = part.get('encode') == 'lossy'
    if lossy: image.save(encoded, 'WEBP', quality=92, alpha_quality=100, method=6)
    else: image.save(encoded, 'WEBP', lossless=True, exact=True, method=6)
    data = encoded.getvalue()
    decoded = Image.open(io.BytesIO(data)).convert('RGBA')
    if lossy: assert decoded.getchannel('A').tobytes() == image.getchannel('A').tobytes(), f'{name}: alpha drift'
    else: assert decoded.tobytes() == image.tobytes(), f'{name}: lossless round trip drift'
    native_error = None
    if isinstance(display, list):
        size = tuple(max(1, round(n * 412 / 360)) for n in display)
        def native(im):
            backdrop = Image.new('RGBA', size, '#070c1e')
            backdrop.alpha_composite(im.resize(size, Image.Resampling.LANCZOS))
            return np.array(backdrop.convert('RGB'), dtype=np.float32)
        native_error = float(np.abs(native(original) - native(decoded)).mean())
        assert native_error < 4, (name, native_error)
    elif lossy:  # full-screen plates have no display size: bound the error at their own resolution
        native_error = float(np.abs(np.array(image.convert('RGB'), dtype=np.float32) - np.array(decoded.convert('RGB'), dtype=np.float32)).mean())
        assert native_error < 4, (name, native_error)
    path = output / f'{name}.webp'
    path.write_bytes(data)
    rows.append({'id': name, 'source': part['path'], 'sourceSHA256': sha(raw),
        'path': path.relative_to(ROOT).as_posix(), 'runtimeSHA256': sha(data),
        'sourceSize': part['size'], 'runtimeSize': list(image.size),
        'sourceBytes': len(raw), 'encodedBytes': len(data),
        'decodedRGBABytes': image.width * image.height * 4,
        'nativeMeanChannelError': native_error, 'losslessRoundTrip': not lossy, **({'encoding': 'lossy-q92-exact-alpha'} if lossy else {})})
report = {'scope': 'Isolated phone texture sizing; original normalized collision/anchors remain authoritative',
    'manifest': manifest_path.relative_to(ROOT).as_posix(), 'manifestSHA256': sha(manifest_path.read_bytes()),
    'parts': rows, 'encodedBytes': sum(p['encodedBytes'] for p in rows),
    'decodedRGBABytes': sum(p['decodedRGBABytes'] for p in rows)}
(output / 'report.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps({k: v for k, v in report.items() if k != 'parts'}, indent=2))
```


---

## `art/render_vault_assets.py`

The Vault: background plate, iron cage bars layer, glazed brick sprites (5 colours x 2 widths x damage states, gold gem, granite), chrome ball/fire/titan balls, paddle, power-up capsules. Defines the shared look: glazed-ceramic and vinyl materials, key/fill/bounce area lights, softbox reflection plane, ortho camera, AgX Medium High Contrast.

```python
# BREACH "The Vault" production renders: background plate, registered bars layer, brick sprites and props.
# Same look as the approved look test art/vault_tower.py (materials, key/fill/bounce area lights, softbox
# reflection plane behind the camera, ortho camera looking +Y, AgX Medium High Contrast).
#
# Run from the repo root (Blender 5.2 as a Python module + Pillow):
#   python3 art/render_vault_assets.py all            # plate + bars + sprites + post   (~15 min, 4 cores)
#   python3 art/render_vault_assets.py plate [--fast] # just the plate (fast = half res, few samples)
#   python3 art/render_vault_assets.py bars | sprites [name ...] | post
# Raw renders land in art/out/vault_raw/, final assets in assets/vault/ (post writes atlas.json,
# contact.png and composite.png, see art/vault_post.py).
#
# Coordinates: 1 game unit = 0.1 m. Screen y grows downward; Blender (x, z) = (x * 0.1, -y * 0.1); wall face at
# y ~ 0, camera at y = -60. Plate covers screen x 0..360, y -40..780 at 2 px/unit: px = 2 * x, py = 2 * (y + 40).
import bpy, bmesh, math, random, sys, os, json, addon_utils
from PIL import Image, ImageDraw, ImageFilter, ImageChops

addon_utils.enable("cycles", default_set=True)
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
RAW = os.path.join(HERE, 'out', 'vault_raw')
TMP = os.path.join(HERE, 'out', 'vault_tmp')
os.makedirs(RAW, exist_ok=True); os.makedirs(TMP, exist_ok=True)
FAST = '--fast' in sys.argv
_thr = [a for a in sys.argv if a.startswith('--threads=')]
THREADS = int(_thr[0].split('=')[1]) if _thr else 0   # --threads=N: fixed Cycles thread count (0 = auto)

U = 0.1                                   # metres per game unit
CELL, COLS, ROWS = 16, 20, 20
OXU, OYU = 20, 96                         # board origin (top-left of cell 0,0) in screen units
MORTAR, DEPTH = 0.07, 1.2
BW, BH = COLS * CELL, ROWS * CELL         # 320 x 320 units
PLATE = dict(x0=0, y0=-40, w=360, h=820, ppu=2)
SPR_PPU, MARGIN = 3, 4
P0 = (180, 264)                           # screen spot where every sprite is rendered (board centre)
CH_X0, CH_Y0, CH_W, CH_H = OXU + 7 * CELL, OYU + 3 * CELL, 6 * CELL, 3 * CELL  # fox chamber 132,144 96x48
LANTERN = (CH_X0 + CH_W / 2 + 16, CH_Y0 + CH_H / 2 - 10)                        # (196, 158) as in the look test
TORCHES = [(180 - 140, 536), (180 + 140, 536)]                                     # sconce centres
COLORS = {'t': '#22c4b0', 'v': '#8f5cf0', 'c': '#ff6f61', 'y': '#ffc73d', 'b': '#4f9dff'}
CAPS = {'split': '#5ccf6a', 'fire': '#ff8a3d', 'wide': '#3fa8f5', 'focus': '#c46bf0', 'burst': '#f7c948',
        'laser': '#ff4d6d', 'shield': '#2ec4b6', 'slow': '#7fd6ff', 'shrink': '#5a5f78'}


def S(x, y):  # screen units (y down) -> Blender XZ (z up)
    return (x * U, -y * U)


srgb = lambda h: tuple(((int(h[i:i + 2], 16) / 255) ** 2.2) for i in (1, 3, 5))
CX, CZ = S(OXU + BW / 2, OYU + BH / 2)    # board centre (18, -25.6): the look test's light rig is relative to it


# ---------------------------------------------------------------- node helpers
def node(nt, t, **kw):
    n = nt.nodes.new(t)
    for k, v in kw.items(): setattr(n, k, v)
    return n


def sock(n, name, typ=None, outputs=False):
    for s in (n.outputs if outputs else n.inputs):
        if s.name == name and (typ is None or s.type == typ): return s
    raise KeyError(name)


def feed(nt, s, v):
    if isinstance(v, bpy.types.NodeSocket): nt.links.new(v, s)
    else: s.default_value = v


def mixc(nt, fac, a, b):
    m = node(nt, 'ShaderNodeMix', data_type='RGBA'); m.clamp_factor = True
    feed(nt, sock(m, 'Factor', 'VALUE'), fac)
    feed(nt, sock(m, 'A', 'RGBA'), a if isinstance(a, bpy.types.NodeSocket) else (*a[:3], 1))
    feed(nt, sock(m, 'B', 'RGBA'), b if isinstance(b, bpy.types.NodeSocket) else (*b[:3], 1))
    return sock(m, 'Result', 'RGBA', outputs=True)


def mth(nt, op, a, b=0.0, clamp=False):
    m = node(nt, 'ShaderNodeMath', operation=op); m.use_clamp = clamp
    feed(nt, m.inputs[0], a); feed(nt, m.inputs[1], b)
    return m.outputs[0]


def maprange(nt, v, a, b, c=0.0, d=1.0, smooth=True):
    if a > b: a, b, c, d = b, a, d, c
    m = node(nt, 'ShaderNodeMapRange', interpolation_type='SMOOTHSTEP' if smooth else 'LINEAR'); m.clamp = True
    feed(nt, m.inputs['Value'], v)
    m.inputs['From Min'].default_value = a; m.inputs['From Max'].default_value = b
    m.inputs['To Min'].default_value = c; m.inputs['To Max'].default_value = d
    return m.outputs['Result']


# ---------------------------------------------------------------- materials (look test, verbatim where possible)
def mat(name, color, rough=0.4, metal=0.0, coat=0.0, coat_rough=0.05, sss=0.0, emit=None, emit_str=0.0):
    m = bpy.data.materials.new(name); b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*color, 1); b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal; b.inputs['Coat Weight'].default_value = coat
    b.inputs['Coat Roughness'].default_value = coat_rough
    if sss: b.inputs['Subsurface Weight'].default_value = sss
    if emit: b.inputs['Emission Color'].default_value = (*emit, 1); b.inputs['Emission Strength'].default_value = emit_str
    return m


def noisy(m, scale=6.0, amount=0.25, bump=0.15, detail=6.0, color2=None, vor=False, stretch=None, rnd=False):
    nt = m.node_tree; b = nt.nodes['Principled BSDF']
    tc = nt.nodes.new('ShaderNodeTexCoord')
    n = nt.nodes.new('ShaderNodeTexVoronoi' if vor else 'ShaderNodeTexNoise'); n.inputs['Scale'].default_value = scale
    if not vor: n.inputs['Detail'].default_value = detail
    vec = tc.outputs['Object']
    if stretch or rnd:   # anisotropic grain / per-object offset (wood planks)
        mp = node(nt, 'ShaderNodeMapping'); nt.links.new(vec, mp.inputs['Vector'])
        if stretch: mp.inputs['Scale'].default_value = stretch
        if rnd:
            oi = node(nt, 'ShaderNodeObjectInfo'); nt.links.new(mth(nt, 'MULTIPLY', oi.outputs['Random'], 37.0), mp.inputs['Location'])
        vec = mp.outputs['Vector']
    nt.links.new(vec, n.inputs['Vector'])
    out = n.outputs['Distance'] if vor else n.outputs['Fac']
    base = b.inputs['Base Color'].default_value[:]
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].color = (*(color2 or tuple(c * (1 - amount) for c in base[:3])), 1); ramp.color_ramp.elements[1].color = base
    nt.links.new(out, ramp.inputs['Fac']); nt.links.new(ramp.outputs['Color'], b.inputs['Base Color'])
    bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = bump; bp.inputs['Distance'].default_value = 0.04
    nt.links.new(out, bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    return m


MATS = {}


def materials():
    MATS.update(
        GOLD=mat('gold', srgb('#ffc94a'), rough=0.14, metal=1.0),
        RUBY=mat('ruby', srgb('#ff2f5e'), rough=0.04, coat=1.0, sss=0.3),
        GRANITE=noisy(mat('granite', srgb('#4a4f6e'), rough=0.45, coat=0.3), scale=18, amount=0.35, bump=0.25),
        IRON=mat('iron', srgb('#2a2e3e'), rough=0.3, metal=0.9),
        RIVET=mat('rivet', srgb('#b8c0d6'), rough=0.2, metal=1.0),
        MORT=noisy(mat('mortar', srgb('#3a3046'), rough=0.95), scale=40, amount=0.4, bump=0.3),
        WOOD=noisy(mat('wood', srgb('#8a5a35'), rough=0.6), scale=1.5, amount=0.45, bump=0.2, stretch=(0.35, 1, 5), rnd=True),
        BARS=mat('bars', srgb('#ffd27a'), rough=0.1, metal=1.0),
        CHROME=mat('chrome', (0.9, 0.91, 0.94), rough=0.06, metal=1.0),
    )


WALL_LIGHT, CHAMBER_LIGHT = 1100, 25


def chamber_stone_mat():
    """Cool dark hewn stone for the cage chamber (v3, replaces the wood planks)."""
    m = mat('chamberstone', srgb('#222736'), rough=0.82, coat=0.15)
    return noisy(m, scale=7, amount=0.4, bump=0.35, detail=8, color2=srgb('#171b26'))


def cage_iron_mat(hexc='#555a66'):
    """Gunmetal for the cage: dark blued iron, fairly tight specular with a faint forged roughness variation."""
    m = mat('cageiron' + hexc, srgb(hexc), rough=0.22, metal=1.0, coat=0.35, coat_rough=0.08); nt = m.node_tree; b = nt.nodes['Principled BSDF']
    tc = node(nt, 'ShaderNodeTexCoord'); nz = node(nt, 'ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 9.0; nz.inputs['Detail'].default_value = 6
    nt.links.new(tc.outputs['Object'], nz.inputs['Vector'])
    feed(nt, b.inputs['Roughness'], maprange(nt, nz.outputs['Fac'], 0.35, 0.65, 0.2, 0.25))
    return m


def interior_mat():
    """Dark hewn stone of the hollow tower interior: big blocks (larger than the game bricks), deep mortar."""
    m = mat('interior', srgb('#2a1f2e'), rough=0.9); nt = m.node_tree; b = nt.nodes['Principled BSDF']
    tc = node(nt, 'ShaderNodeTexCoord')
    bk = node(nt, 'ShaderNodeTexBrick'); bk.offset = 0.5
    bk.inputs['Scale'].default_value = 1.0; bk.inputs['Brick Width'].default_value = 4.6; bk.inputs['Row Height'].default_value = 2.3
    bk.inputs['Mortar Size'].default_value = 0.12; bk.inputs['Mortar Smooth'].default_value = 0.4; bk.inputs['Bias'].default_value = 0.0
    bk.inputs['Color1'].default_value = (*srgb('#2e2232'), 1); bk.inputs['Color2'].default_value = (*srgb('#241a29'), 1)
    bk.inputs['Mortar'].default_value = (*srgb('#120c16'), 1)
    sep = node(nt, 'ShaderNodeSeparateXYZ'); cmb = node(nt, 'ShaderNodeCombineXYZ')
    nt.links.new(tc.outputs['Object'], sep.inputs['Vector'])
    nt.links.new(sep.outputs['X'], cmb.inputs['X']); nt.links.new(sep.outputs['Z'], cmb.inputs['Y'])
    nt.links.new(cmb.outputs['Vector'], bk.inputs['Vector'])
    vor = node(nt, 'ShaderNodeTexVoronoi'); vor.inputs['Scale'].default_value = 3.0
    nt.links.new(tc.outputs['Object'], vor.inputs['Vector'])
    nz = node(nt, 'ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 0.6; nz.inputs['Detail'].default_value = 4
    nt.links.new(tc.outputs['Object'], nz.inputs['Vector'])
    col = mixc(nt, maprange(nt, nz.outputs['Fac'], 0.3, 0.7, 0.0, 0.5), bk.outputs['Color'], srgb('#1a121d'))
    nt.links.new(col, b.inputs['Base Color'])
    h = mth(nt, 'ADD', mth(nt, 'MULTIPLY', bk.outputs['Fac'], -1.0), mth(nt, 'MULTIPLY', vor.outputs['Distance'], 0.35))
    bp = node(nt, 'ShaderNodeBump'); bp.inputs['Strength'].default_value = 0.7; bp.inputs['Distance'].default_value = 0.08
    nt.links.new(h, bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    return m


def glaze_mat(name, hexc, seed, crack=None, dims=None, gloss=False):
    """Glossy candy glaze of the look test + a faint mottling (per-sprite seed) + optional crack texture.
    gloss=True is the v3 brick glaze (glazed ceramic: tight base specular, mirror coat at a higher IOR, a touch less
    diffuse so the colour stays deep under the softbox highlight); the robots keep the original (gloss=False)."""
    base = srgb(hexc)
    r0 = GLAZE_ROUGH if gloss else 0.28
    m = mat(name, base, rough=r0, coat=1.0, coat_rough=0.008 if gloss else 0.02, sss=0.12); nt = m.node_tree; b = nt.nodes['Principled BSDF']
    if gloss:
        b.inputs['Coat IOR'].default_value = 1.65; b.inputs['IOR'].default_value = 1.6
    tc = node(nt, 'ShaderNodeTexCoord')
    mp = node(nt, 'ShaderNodeMapping'); mp.inputs['Location'].default_value = (seed * 3.1, seed * 1.7, seed * 2.3)
    nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])
    nz = node(nt, 'ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 0.8; nz.inputs['Detail'].default_value = 3
    nt.links.new(mp.outputs['Vector'], nz.inputs['Vector'])
    ramp = node(nt, 'ShaderNodeValToRGB'); e = ramp.color_ramp.elements
    e[0].position, e[1].position = 0.3, 0.7
    e[0].color = (*(c * 0.9 for c in base), 1); e[1].color = (*(min(1, c * 1.07) for c in base), 1)
    nt.links.new(nz.outputs['Fac'], ramp.inputs['Fac'])
    col = ramp.outputs['Color']
    if crack:
        W, H = dims
        mp2 = node(nt, 'ShaderNodeMapping', vector_type='POINT')
        mp2.inputs['Scale'].default_value = (1 / W, 1, 1 / H); mp2.inputs['Location'].default_value = (0.5, 0, 0.5)
        nt.links.new(tc.outputs['Object'], mp2.inputs['Vector'])
        sep = node(nt, 'ShaderNodeSeparateXYZ'); cmb = node(nt, 'ShaderNodeCombineXYZ')
        nt.links.new(mp2.outputs['Vector'], sep.inputs['Vector'])
        nt.links.new(sep.outputs['X'], cmb.inputs['X']); nt.links.new(sep.outputs['Z'], cmb.inputs['Y'])
        im = node(nt, 'ShaderNodeTexImage', extension='EXTEND', interpolation='Cubic')
        im.image = bpy.data.images.load(crack); im.image.colorspace_settings.name = 'Non-Color'
        nt.links.new(cmb.outputs['Vector'], im.inputs['Vector'])
        sc_ = node(nt, 'ShaderNodeSeparateColor'); nt.links.new(im.outputs['Color'], sc_.inputs['Color'])
        cr, halo, hgt = sc_.outputs[0], sc_.outputs[1], sc_.outputs[2]
        col = mixc(nt, mth(nt, 'MULTIPLY', halo, 0.35), col, tuple(min(1, c * 1.25 + 0.04) for c in base))
        col = mixc(nt, cr, col, tuple(c * 0.05 for c in base))
        feed(nt, b.inputs['Roughness'], maprange(nt, cr, 0, 1, r0, 0.8, smooth=False))
        feed(nt, b.inputs['Coat Weight'], mth(nt, 'SUBTRACT', 1.0, cr, clamp=True))
        bp = node(nt, 'ShaderNodeBump', invert=True); bp.inputs['Strength'].default_value = 0.55; bp.inputs['Distance'].default_value = 0.025
        nt.links.new(hgt, bp.inputs['Height'])
        nt.links.new(bp.outputs['Normal'], b.inputs['Normal']); nt.links.new(bp.outputs['Normal'], b.inputs['Coat Normal'])
    nt.links.new(col, b.inputs['Base Color'])
    return m


GLAZE_ROUGH = 0.12


def gloss_card(name, W, H, y_face, d=2.5, strength=14.0, right=0.2, window=True, sheen=0.09):
    """v3 brick shine: a reflection-only softbox card standing d metres in front of a sprite's face (glossy rays only,
    invisible to camera / diffuse / shadow, transparent where unlit). The ortho camera mirrors the card 1:1 onto a
    flat face, so its shape is the highlight: a bright window over the upper face that wraps over the top bevel, a
    hot strip far above (crisp top-bevel glint), a hot column on the left (left-bevel glint), dimmer toward the
    right, nothing below (dark lower bevel for depth). W, H = face size in metres."""
    x0, _, z0 = at()
    bpy.ops.mesh.primitive_plane_add(size=1, location=(x0, y_face - d, z0), rotation=(math.radians(90), 0, 0))
    o = bpy.context.object; o.name = name; o.scale = (W + 14, H + 14, 1); bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    for a in ('visible_camera', 'visible_diffuse', 'visible_transmission', 'visible_volume_scatter', 'visible_shadow'):
        setattr(o, a, False)
    m = bpy.data.materials.new(name); nt = m.node_tree; nt.nodes.remove(nt.nodes['Principled BSDF'])
    tc = node(nt, 'ShaderNodeTexCoord'); sep = node(nt, 'ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['Object'], sep.inputs['Vector'])
    X, Z = sep.outputs['X'], sep.outputs['Y']          # card local X = world x, local Y = world z (metres from the sprite centre)
    # slight tilt so the window's lower edge runs down-left -> up-right like a key from the upper left
    edge = mth(nt, 'SUBTRACT', Z, mth(nt, 'MULTIPLY', X, 0.10))
    win = maprange(nt, edge, H * 0.10, H * 0.10 + 0.07)                     # crisp lower edge of the window
    if window:
        win = mth(nt, 'MULTIPLY', win, maprange(nt, Z, H / 2 + 2.4, H / 2 + 3.2, 1, 0))
        win = mth(nt, 'MULTIPLY', win, mth(nt, 'ADD', 0.45, mth(nt, 'MULTIPLY', maprange(nt, Z, H * 0.1, H * 0.5), 0.55)))
    # top-bevel glint: hot right where the bevel starts to roll over, then a softer band across the rest of the bevel
    top = mth(nt, 'MULTIPLY', maprange(nt, Z, H / 2 + 0.25, H / 2 + 0.45),
              maprange(nt, Z, H / 2 + 1.0, H / 2 + 4.5, 1, 0.08, smooth=False))
    left = mth(nt, 'MULTIPLY', maprange(nt, X, -W / 2 - 0.2, -W / 2 - 0.45), maprange(nt, Z, -H / 2, H / 2 - 0.3, 0.0, 1.0, smooth=False))
    mask = mth(nt, 'MAXIMUM', mth(nt, 'MAXIMUM', mth(nt, 'MULTIPLY', win, sheen), top), mth(nt, 'MULTIPLY', left, 0.7))
    fall = maprange(nt, X, -W / 2, W / 2 + 0.6, 1.0, right, smooth=False)  # dimmer to the right
    lum = mth(nt, 'MULTIPLY', mask, fall)
    em = node(nt, 'ShaderNodeEmission'); em.inputs['Color'].default_value = (1.0, 0.985, 0.97, 1)
    feed(nt, em.inputs['Strength'], mth(nt, 'MULTIPLY', lum, strength))
    tr = node(nt, 'ShaderNodeBsdfTransparent')
    sh = mixs(nt, mth(nt, 'GREATER_THAN', lum, 0.002), tr.outputs[0], em.outputs[0])
    nt.links.new(sh, nt.nodes['Material Output'].inputs['Surface'])
    o.data.materials.append(m)
    return o


def biscuit_mat(name, hexc):
    """Exposed ceramic body where the glaze chipped off."""
    base = srgb(hexc); cream = srgb('#d9c7ae')
    c = tuple((0.45 * a + 0.55 * k) * 0.8 for a, k in zip(base, cream))
    return noisy(mat(name, c, rough=0.85), scale=60, amount=0.35, bump=0.5, vor=True)


def emit_mat(name, color, strength):
    m = bpy.data.materials.new(name); nt = m.node_tree; nt.nodes.remove(nt.nodes['Principled BSDF'])
    em = node(nt, 'ShaderNodeEmission'); em.inputs['Color'].default_value = (*color, 1); em.inputs['Strength'].default_value = strength
    nt.links.new(em.outputs['Emission'], nt.nodes['Material Output'].inputs['Surface'])
    return m


def flame_mat(name, strength=16):
    """Teardrop flame: white-yellow core, orange rim that fades out (soft alpha on transparent film)."""
    m = bpy.data.materials.new(name); nt = m.node_tree; nt.nodes.remove(nt.nodes['Principled BSDF'])
    lw = node(nt, 'ShaderNodeLayerWeight'); lw.inputs['Blend'].default_value = 0.5
    tc = node(nt, 'ShaderNodeTexCoord'); sep = node(nt, 'ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['Object'], sep.inputs['Vector'])
    up = maprange(nt, sep.outputs['Z'], -0.3, 0.7, 0, 1, smooth=False)               # 0 at the base, 1 at the tip
    edge = mth(nt, 'MAXIMUM', lw.outputs['Facing'], mth(nt, 'MULTIPLY', up, 0.8))
    col = mixc(nt, maprange(nt, edge, 0.15, 0.85), (1.0, 0.82, 0.45), (1.0, 0.32, 0.06))
    em = node(nt, 'ShaderNodeEmission'); nt.links.new(col, em.inputs['Color'])
    feed(nt, em.inputs['Strength'], maprange(nt, edge, 0.2, 1.0, strength, strength * 0.35))
    tr = node(nt, 'ShaderNodeBsdfTransparent'); ms = node(nt, 'ShaderNodeMixShader')
    nt.links.new(maprange(nt, edge, 0.55, 1.0), ms.inputs[0]); nt.links.new(em.outputs[0], ms.inputs[1]); nt.links.new(tr.outputs[0], ms.inputs[2])
    nt.links.new(ms.outputs[0], nt.nodes['Material Output'].inputs['Surface'])
    m.blend_method = 'BLEND' if hasattr(m, 'blend_method') else None
    return m


# ---------------------------------------------------------------- geometry helpers
def box(name, w, h, d, bevel, m, loc, segs=4, local=False):
    # local=False bakes the location like the look test (object coords = world, so noise differs per block);
    # local=True keeps the origin at the box centre (crack textures are mapped in local coordinates)
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.object; o.name = name; o.scale = (w, d, h); bpy.ops.object.transform_apply(location=not local, rotation=False, scale=True)
    if bevel:
        md = o.modifiers.new('b', 'BEVEL'); md.width = bevel; md.segments = segs; md.limit_method = 'NONE'
        bpy.ops.object.modifier_apply(modifier='b')
    bpy.ops.object.shade_smooth(); o.data.materials.append(m)
    return o


def capsule(name, length, radius, loc, m):
    """Capsule along X: total length `length`, radius `radius` (metres)."""
    bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32, radius=radius, location=(0, 0, 0))
    o = bpy.context.object; o.name = name
    bm = bmesh.new(); bm.from_mesh(o.data); half = length / 2 - radius
    for v in bm.verts:
        if v.co.x > 1e-5: v.co.x += half
        elif v.co.x < -1e-5: v.co.x -= half
    bm.to_mesh(o.data); bm.free()
    o.location = loc; bpy.ops.object.shade_smooth(); o.data.materials.append(m)
    return o


def flame(name, loc, r, m):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=20, radius=1, location=(0, 0, 0))
    o = bpy.context.object; o.name = name
    bm = bmesh.new(); bm.from_mesh(o.data)
    for v in bm.verts:
        z = v.co.z
        if z > 0:
            v.co.x *= (1 - 0.45 * z); v.co.y *= (1 - 0.45 * z); v.co.z = z * 2.3
    bm.to_mesh(o.data); bm.free()
    o.scale = (r * 0.8, r * 0.8, r); bpy.ops.object.transform_apply(scale=True)
    o.location = loc; bpy.ops.object.shade_smooth(); o.data.materials.append(m)
    o.visible_shadow = False
    return o


def cyl(r, depth, loc, m, rot=(0, 0, 0), verts=32):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=depth, location=loc, rotation=rot, vertices=verts)
    o = bpy.context.object; bpy.ops.object.shade_smooth(); o.data.materials.append(m)
    return o


# ---------------------------------------------------------------- scene / rig
def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    MATS.clear(); materials()
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.use_denoising = True
    sc.cycles.denoiser = 'OPENIMAGEDENOISE'
    sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast'
    sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_depth = '8'
    sc.render.resolution_percentage = 100
    if THREADS: sc.render.threads_mode = 'FIXED'; sc.render.threads = THREADS
    rig(sc)
    return sc


def area(loc, rot, energy, size, color):
    bpy.ops.object.light_add(type='AREA', location=loc, rotation=rot)
    l = bpy.context.object.data; l.energy = energy; l.size = size; l.color = color


def rig(sc):
    """World, three area lights and the softbox plane, exactly as in art/vault_tower.py."""
    w = bpy.data.worlds.new('w'); sc.world = w
    nt = w.node_tree; bg = nt.nodes['Background']
    tc = nt.nodes.new('ShaderNodeTexCoord'); sep = nt.nodes.new('ShaderNodeSeparateXYZ'); ramp = nt.nodes.new('ShaderNodeValToRGB')
    nt.links.new(tc.outputs['Generated'], sep.inputs['Vector']); nt.links.new(sep.outputs['Z'], ramp.inputs['Fac'])
    ramp.color_ramp.elements[0].position = 0.45; ramp.color_ramp.elements[0].color = (0.02, 0.015, 0.05, 1)
    ramp.color_ramp.elements[1].color = (0.25, 0.12, 0.3, 1)
    nt.links.new(ramp.outputs['Color'], bg.inputs['Color']); bg.inputs['Strength'].default_value = 0.8
    area((CX - 20, -9, CZ + 34), (math.radians(20), math.radians(-30), 0), 22000, 10, (1.0, 0.86, 0.72))   # key
    area((CX + 30, -25, CZ - 5), (math.radians(85), math.radians(50), 0), 2500, 14, (0.55, 0.65, 1.0))     # cool fill
    area((CX, -10, CZ - 45), (math.radians(140), 0, 0), 2500, 30, (1.0, 0.5, 0.65))                         # warm bounce
    PW, PH = 360, 700
    bpy.ops.mesh.primitive_plane_add(size=1, location=(PW / 2 * U, -40, -PH / 2 * U + 20), rotation=(math.radians(90), 0, 0))
    sb = bpy.context.object; sb.name = 'softbox'; sb.scale = (60, 50, 1); sb.visible_camera = False; sb.visible_shadow = False
    sm = bpy.data.materials.new('softbox'); nt = sm.node_tree; nt.nodes.remove(nt.nodes['Principled BSDF'])
    em = nt.nodes.new('ShaderNodeEmission'); tc = nt.nodes.new('ShaderNodeTexCoord'); sp = nt.nodes.new('ShaderNodeSeparateXYZ'); rp = nt.nodes.new('ShaderNodeValToRGB')
    nt.links.new(tc.outputs['Generated'], sp.inputs['Vector']); nt.links.new(sp.outputs['Y'], rp.inputs['Fac'])
    rp.color_ramp.elements[0].position = 0.55; rp.color_ramp.elements[0].color = (0, 0, 0, 1); rp.color_ramp.elements[1].color = (1, 0.95, 0.9, 1)
    nt.links.new(rp.outputs['Color'], em.inputs['Color']); em.inputs['Strength'].default_value = 1.6
    nt.links.new(em.outputs['Emission'], nt.nodes['Material Output'].inputs['Surface']); sb.data.materials.append(sm)
    bpy.ops.object.camera_add(); cam = bpy.context.object; cam.name = 'cam'; sc.camera = cam
    cam.data.type = 'ORTHO'; cam.rotation_euler = (math.radians(90), 0, 0)
    cam.data.clip_start = 1; cam.data.clip_end = 200


def frame(sc, x0, y0, w, h, ppu, out, transparent, samples):
    """Point the ortho camera at the screen rectangle (x0, y0, w, h) in game units and render it to `out`."""
    cam = sc.camera
    cam.location = ((x0 + w / 2) * U, -60, -(y0 + h / 2) * U)
    cam.data.ortho_scale = max(w, h) * U
    sc.render.resolution_x = round(w * ppu); sc.render.resolution_y = round(h * ppu)
    sc.render.film_transparent = transparent
    sc.render.image_settings.color_mode = 'RGBA' if transparent else 'RGB'
    sc.cycles.samples = samples
    sc.render.filepath = out
    bpy.ops.render.render(write_still=True)
    print('wrote', out, sc.render.resolution_x, 'x', sc.render.resolution_y, flush=True)


def only(objs):
    keep = set(o.name for o in objs)
    for o in bpy.context.scene.objects:
        if o.type in ('MESH', 'CURVE'): o.hide_render = o.name not in keep and o.name != 'softbox'


# ---------------------------------------------------------------- plate
def sky_backdrop():
    """Emissive backdrop far behind the tower (camera rays only): dusk gradient, stars, thin clouds, moon + glow."""
    x0, x1, y0, y1 = -40, 400, -80, 460
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 30, 0), rotation=(math.radians(90), 0, 0))
    o = bpy.context.object; o.name = 'sky'
    bm = bmesh.new(); bm.from_mesh(o.data)
    for v in bm.verts:   # local X = world x, local Y = world z
        v.co.x = (x1 if v.co.x > 0 else x0) * U; v.co.y = -(y0 if v.co.y > 0 else y1) * U
    bm.to_mesh(o.data); bm.free()
    for a in ('visible_diffuse', 'visible_glossy', 'visible_transmission', 'visible_volume_scatter', 'visible_shadow'):
        setattr(o, a, False)
    m = bpy.data.materials.new('sky'); nt = m.node_tree; nt.nodes.remove(nt.nodes['Principled BSDF'])
    tc = node(nt, 'ShaderNodeTexCoord'); sep = node(nt, 'ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['Object'], sep.inputs['Vector'])
    X, Z = sep.outputs['X'], sep.outputs['Y']            # metres; screen y = -Z / U
    g = node(nt, 'ShaderNodeValToRGB'); e = g.color_ramp.elements
    nt.links.new(maprange(nt, Z, -9.5, 4.0, 0, 1, smooth=False), g.inputs['Fac'])
    e[0].position = 0.0; e[0].color = (0.085, 0.04, 0.10, 1)          # horizon over the battlements: dusky violet
    e[1].position = 1.0; e[1].color = (0.008, 0.008, 0.028, 1)        # zenith: deep navy
    mid = g.color_ramp.elements.new(0.45); mid.color = (0.03, 0.02, 0.06, 1)
    col = g.outputs['Color']
    # thin horizontal clouds lit by the moon
    mp = node(nt, 'ShaderNodeMapping'); mp.inputs['Scale'].default_value = (0.18, 1.3, 1); nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])
    cn = node(nt, 'ShaderNodeTexNoise'); cn.inputs['Scale'].default_value = 0.9; cn.inputs['Detail'].default_value = 5; cn.inputs['Roughness'].default_value = 0.6
    nt.links.new(mp.outputs['Vector'], cn.inputs['Vector'])
    cloud = mth(nt, 'MULTIPLY', maprange(nt, cn.outputs['Fac'], 0.5, 0.72), maprange(nt, Z, -8.0, -1.0, 0.3, 1.0))
    col = mixc(nt, mth(nt, 'MULTIPLY', cloud, 0.55), col, (0.07, 0.05, 0.11))
    # stars: two voronoi layers, few bright, many faint; hidden by clouds and near the moon
    star = 0.0
    for scale, rad, gain in ((0.55, 0.075, 5.0), (1.4, 0.045, 1.6)):
        v = node(nt, 'ShaderNodeTexVoronoi'); v.inputs['Scale'].default_value = scale
        nt.links.new(tc.outputs['Object'], v.inputs['Vector'])
        r = node(nt, 'ShaderNodeSeparateColor'); nt.links.new(v.outputs['Color'], r.inputs['Color'])
        disc = maprange(nt, v.outputs['Distance'], rad * 0.3, rad, 1, 0)
        s = mth(nt, 'MULTIPLY', disc, mth(nt, 'MULTIPLY', mth(nt, 'POWER', r.outputs[0], 5.0), gain))
        star = mth(nt, 'ADD', star, s)
    MX, MZ = S(66, 4)
    dx = mth(nt, 'SUBTRACT', X, MX); dz = mth(nt, 'SUBTRACT', Z, MZ)
    d = mth(nt, 'SQRT', mth(nt, 'ADD', mth(nt, 'MULTIPLY', dx, dx), mth(nt, 'MULTIPLY', dz, dz)))
    star = mth(nt, 'MULTIPLY', star, mth(nt, 'MULTIPLY', mth(nt, 'SUBTRACT', 1.0, cloud, clamp=True), maprange(nt, d, 1.5, 4.0)))
    star = mth(nt, 'MULTIPLY', star, maprange(nt, Z, -8.5, -6.0))
    col = mixc(nt, mth(nt, 'MINIMUM', star, 1.0), col, (0.85, 0.85, 1.0))
    # moon: disc with faint maria, warm halo
    mn = node(nt, 'ShaderNodeTexNoise'); mn.inputs['Scale'].default_value = 2.2; mn.inputs['Detail'].default_value = 3
    nt.links.new(tc.outputs['Object'], mn.inputs['Vector'])
    disc = maprange(nt, d, 0.86, 0.9, 1, 0)
    mcol = mixc(nt, maprange(nt, mn.outputs['Fac'], 0.45, 0.65), (0.75, 0.68, 0.62), (1.0, 0.94, 0.84))
    glow = mth(nt, 'ADD', mth(nt, 'MULTIPLY', mth(nt, 'EXPONENT', mth(nt, 'MULTIPLY', d, -1.6)), 0.6),
               mth(nt, 'MULTIPLY', mth(nt, 'EXPONENT', mth(nt, 'MULTIPLY', d, -0.35)), 0.10))
    gcol = node(nt, 'ShaderNodeMix', data_type='RGBA', blend_type='ADD')
    sock(gcol, 'Factor', 'VALUE').default_value = 1.0
    nt.links.new(col, sock(gcol, 'A', 'RGBA')); sock(gcol, 'B', 'RGBA').default_value = (0.4, 0.3, 0.36, 1)
    col = mixc(nt, mth(nt, 'MINIMUM', glow, 1.0), col, sock(gcol, 'Result', 'RGBA', outputs=True))
    col = mixc(nt, disc, col, mcol)
    em = node(nt, 'ShaderNodeEmission'); nt.links.new(col, em.inputs['Color'])
    feed(nt, em.inputs['Strength'], maprange(nt, disc, 0, 1, 1.0, 2.2, smooth=False))
    nt.links.new(em.outputs[0], nt.nodes['Material Output'].inputs['Surface'])
    o.data.materials.append(m)


def build_plate():
    G = MATS['GRANITE']
    sky_backdrop()
    # hollow tower interior, recessed 2 m behind the brick face so the cornice and pillar cast soft shadows into it
    cx, cz = S(180, (88 + 424) / 2)
    box('interior', (BW + 6) * U, (424 - 88) * U, 0.4, 0, interior_mat(), (cx, 2.2, cz))
    # chamber back wall (v3): dark, cool hewn stone in two staggered courses, so the princess reads against it
    hx, hz = S(CH_X0 + CH_W / 2, CH_Y0 + CH_H / 2)   # chamber centre
    CS = chamber_stone_mat()
    ch_h = (CH_H + 4) / 2
    for i in range(2):
        y0 = CH_Y0 - 2 + ch_h * i
        off = -14 if i % 2 else 0
        for k in range(-1, 5):
            x0 = CH_X0 - 2 + off + k * 34
            xa, xb = max(x0, CH_X0 - 2), min(x0 + 34, CH_X0 + CH_W + 2)
            if xb - xa < 1: continue
            px_, pz_ = S((xa + xb) / 2, y0 + ch_h / 2)
            box(f'cstone{i}_{k}', (xb - xa) * U - 0.08, ch_h * U - 0.08, 0.3, 0.06, CS, (px_, 0.62 + 0.03 * ((i + k) % 2), pz_), segs=2)
    box('chamberback', (CH_W + 8) * U, (CH_H + 8) * U, 0.1, 0, MATS['MORT'], (hx, 0.85, hz))
    # pillars: stacked granite courses, inner faces flush with the board edges (x = 20 and 340)
    for side in (-1, 1):
        xin = OXU if side < 0 else OXU + BW
        xout = xin + side * 22
        x = (xin + xout) / 2 * U
        top, bot = 66, 426
        n = 9; hh = (bot - top) / n
        for k in range(n):
            _, z = S(0, top + hh * (k + 0.5))
            box(f'pillar{side}_{k}', 22 * U, hh * U - 0.12, 1.8, 0.14, G, (x, -0.5 + random.uniform(-0.02, 0.02), z))
        _, z = S(0, (top + bot) / 2)
        box(f'pillarback{side}', 22 * U, (bot - top) * U, 0.2, 0, MATS['MORT'], (x, 0.6, z))
    for i in range(11):
        x = CX - BW * U / 2 - 0.8 + i * (BW * U + 1.6) / 10
        box(f'merlon{i}', 1.6, 1.4, 1.6, 0.15, G, (x, -0.5, CZ + BH * U / 2 + 1.3))
    box('cornice', BW * U + 4, 0.6, 2.0, 0.15, G, (CX, -0.5, CZ + BH * U / 2 + 0.4))
    # courtyard wall behind the paddle: big dark blocks set back from the play plane (v3: no torches, lit evenly and dimly)
    base = OYU + BH
    rnd = random.Random(11)
    for row in range(10):
        off = 40 if row % 2 else 0
        for i in range(-1, 6):
            x0 = i * 80 + off; y0 = base + 8 + row * 40
            bx, bz = S(x0 + 40, y0 + 20)
            box(f'cw{row}_{i}', 80 * U - 0.15, 40 * U - 0.15, 1.0, 0.18, G, (bx, 2.5 + rnd.uniform(0, 0.15), bz))
    box('courtback', 50, (900 - base) * U, 0.2, 0, MATS['MORT'], (CX, 3.4, S(0, (base + 900) / 2)[1]))
    box('plinth', BW * U + 4, 0.9, 2.2, 0.15, G, (CX, -0.5, -(base + 4) * U))
    # v3: no torches, no lantern. The lower dungeon wall gets one broad, dim, neutral-cool wash so it is lit evenly,
    # and the chamber a faint cool top light so its stone reads without drawing the eye.
    _, wz = S(0, (base + 780) / 2)
    bpy.ops.object.light_add(type='AREA', location=(CX, -22, wz), rotation=(math.radians(90), 0, 0)); L = bpy.context.object.data
    L.shape = 'RECTANGLE'; L.size = 46; L.size_y = 40; L.energy = WALL_LIGHT; L.color = (0.78, 0.8, 0.95)
    bpy.ops.object.light_add(type='AREA', location=(hx, -1.0, hz + CH_H * U * 0.45), rotation=(math.radians(50), 0, 0)); L = bpy.context.object.data
    L.shape = 'RECTANGLE'; L.size = CH_W * U; L.size_y = 0.6; L.energy = CHAMBER_LIGHT; L.color = (0.62, 0.72, 1.0)
    # cage bars (bars.png pass only), v3: dark gunmetal iron, five thin round bars between a flat top and bottom rail,
    # a rivet where each bar meets a rail and at the rail ends (same layout as the game's code-drawn cage)
    bars = []
    IRN, RAIL, RIV = cage_iron_mat(), cage_iron_mat('#3a3e48'), MATS['RIVET']
    yb = -DEPTH - 0.15
    for i in range(1, 6):
        x, _ = S(CH_X0 + CH_W * i / 6, 0)
        bars.append(cyl(0.1, CH_H * U - 0.2, (x, yb, hz), IRN, verts=32))
    for yy in (CH_Y0 + 1.75, CH_Y0 + CH_H - 1.75):
        _, z = S(0, yy)
        bars.append(box('rail', CH_W * U, 0.35, 0.22, 0.06, RAIL, (hx, yb - 0.14, z), segs=3))
        for i in range(0, 7):
            x, _ = S(CH_X0 + 1.6 + (CH_W - 3.2) * i / 6 if i in (0, 6) else CH_X0 + CH_W * i / 6, 0)
            bpy.ops.mesh.primitive_uv_sphere_add(radius=0.07, segments=20, ring_count=10, location=(x, yb - 0.26, z))
            r = bpy.context.object; r.scale = (1, 0.6, 1); bpy.ops.object.shade_smooth(); r.data.materials.append(RIV); bars.append(r)
    for b in bars: b.hide_render = True
    return bars


def render_plate():
    sc = reset(); random.seed(7)
    bars = build_plate()
    P = PLATE
    if FAST:
        frame(sc, P['x0'], P['y0'], P['w'], P['h'], 1, os.path.join(RAW, 'plate_fast.png'), False, 24)
        return
    frame(sc, P['x0'], P['y0'], P['w'], P['h'], P['ppu'], os.path.join(RAW, 'plate.png'), False, 96)


def render_bars():
    sc = reset(); random.seed(7)
    bars = build_plate()
    for o in sc.objects:
        if o.type == 'MESH' and o.name != 'softbox': o.hide_render = True
    for b in bars: b.hide_render = False
    for o in sc.objects:   # v3: keep the iron's highlights cool grey: warm lights do not show in its reflections
        if o.type == 'LIGHT' and o.data.color[2] < 0.9: o.visible_glossy = False
    hx, hz = S(CH_X0 + CH_W / 2, CH_Y0 + CH_H / 2)
    bpy.ops.object.light_add(type='AREA', location=(hx - 4.0, -DEPTH - 6.0, hz + 2.0), rotation=(math.radians(78), 0, math.radians(-34)))
    L = bpy.context.object.data; L.shape = 'RECTANGLE'; L.size = 1.0; L.size_y = 14; L.energy = 5000; L.color = (0.8, 0.86, 1.0)
    bpy.ops.object.light_add(type='AREA', location=(hx + 5.0, -DEPTH - 5.0, hz + 1.0), rotation=(math.radians(80), 0, math.radians(45)))
    L = bpy.context.object.data; L.shape = 'RECTANGLE'; L.size = 0.6; L.size_y = 14; L.energy = 1500; L.color = (0.7, 0.8, 1.0)   # cool rim
    P = PLATE
    sc.render.use_border = True; sc.render.use_crop_to_border = False
    sc.render.border_min_x = (CH_X0 - 6 - P['x0']) / P['w']; sc.render.border_max_x = (CH_X0 + CH_W + 6 - P['x0']) / P['w']
    sc.render.border_min_y = 1 - (CH_Y0 + CH_H + 6 - P['y0']) / P['h']; sc.render.border_max_y = 1 - (CH_Y0 - 6 - P['y0']) / P['h']
    frame(sc, P['x0'], P['y0'], P['w'], P['h'], P['ppu'], os.path.join(RAW, 'bars.png'), True, 48)


# ---------------------------------------------------------------- cracks (deterministic, seeded per variant)
TEXPPU, SS = 24, 3


def crack_texture(col, w, dmg, corner):
    Wu, Hu = w * CELL - MORTAR / U, CELL - MORTAR / U
    k = TEXPPU * SS
    big = Image.new('L', (round(Wu * k), round(Hu * k)), 0); d = ImageDraw.Draw(big)
    P = lambda x, y: (x * k, y * k)

    def walk(rng, x, y, ang, length, width, depth=0):
        seg = 0.8; n = max(3, int(length / seg)); pts = [(x, y)]
        for i in range(n):
            ang += rng.gauss(0, 0.30)
            x += math.cos(ang) * seg; y += math.sin(ang) * seg
            pts.append((x, y))
            if not (-1 < x < Wu + 1 and -1 < y < Hu + 1): break
            if depth < 2 and i > 1 and rng.random() < 0.11:
                walk(rng, x, y, ang + rng.choice((-1, 1)) * rng.uniform(0.6, 1.1), length * (1 - i / n) * rng.uniform(0.35, 0.65), width * 0.6, depth + 1)
        for j in range(len(pts) - 1):
            t = j / (len(pts) - 1); wd = max(0.12, width * (1 - t) ** 0.7)
            d.line([P(*pts[j]), P(*pts[j + 1])], fill=255, width=max(1, round(wd * k)))
            r = wd * k / 2; cx, cy = P(*pts[j + 1]); d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=255)

    def from_edge(rng, length, width):
        e = rng.random()
        if e < 0.75:   # top or bottom edge, heading inward
            top = rng.random() < 0.5; x = rng.uniform(2.5, Wu - 2.5)
            walk(rng, x, 0.2 if top else Hu - 0.2, (math.pi / 2 if top else -math.pi / 2) + rng.uniform(-0.7, 0.7), length, width)
        else:          # a side
            left = rng.random() < 0.5
            walk(rng, 0.2 if left else Wu - 0.2, rng.uniform(3, Hu - 3), (0 if left else math.pi) + rng.uniform(-0.6, 0.6), length, width)

    r1 = random.Random(f'{col}{w}-hairline')
    for i in range(1 + w):
        from_edge(r1, r1.uniform(6, 9 + 4 * w), r1.uniform(0.32, 0.42))
    if dmg >= 2:
        r2 = random.Random(f'{col}{w}-shatter')
        sx, sz = corner
        cx, cy = (Wu if sx > 0 else 0), (0 if sz > 0 else Hu)
        base_ang = math.atan2((Hu / 2 - cy), (Wu / 2 - cx))
        for i in range(3 + w):
            a = base_ang + (i - (2 + w) / 2) * 0.42 + r2.uniform(-0.15, 0.15)
            walk(r2, cx + math.cos(a) * 4.2, cy + math.sin(a) * 4.2, a, r2.uniform(7, 12 + 6 * w), r2.uniform(0.5, 0.65))
        from_edge(r2, r2.uniform(8, 10 + 5 * w), 0.45)
    size = (round(Wu * TEXPPU), round(Hu * TEXPPU))
    R = big.resize(size, Image.LANCZOS)
    halo = ImageChops.subtract(R.filter(ImageFilter.GaussianBlur(TEXPPU * 0.9)).point(lambda v: min(255, v * 3)), R)
    Hh = R.filter(ImageFilter.GaussianBlur(TEXPPU * 0.28)).point(lambda v: min(255, v * 1.6))
    path = os.path.join(TMP, f'crack_{col}_{w}_{dmg}.png')
    Image.merge('RGB', (R, halo, Hh)).save(path)
    return path


# ---------------------------------------------------------------- sprites
SPRITES = {}   # name -> dict(size=(w,h) units crop, foot=(w,h) units, build=fn)


def at(dx=0.0, dy=0.0, y=0.0):
    x, z = S(*P0)
    return (x + dx, y, z + dy)


def make_brick(col, w, dmg):
    def build():
        W, H = w * CELL * U - MORTAR, CELL * U - MORTAR
        rng = random.Random(f'{col}{w}-chip')
        corner = (rng.choice((-1, 1)), rng.choice((-1, 1)))
        seed = {'t': 1, 'v': 2, 'c': 3, 'y': 4, 'b': 5}[col] * 7 + w
        crack = crack_texture(col, w, dmg, corner) if dmg else None
        m = glaze_mat(f'glaze_{col}{w}{dmg}', COLORS[col], seed, crack, (W, H), gloss=True)
        o = box(f'brick_{col}_{w}_{dmg}', W, H, DEPTH, 0.3, m, at(y=-DEPTH / 2), segs=8, local=True)
        if dmg >= 2:
            bis = biscuit_mat(f'biscuit_{col}{w}', COLORS[col])
            cx, _, cz = at(); cut = []
            ox, oz = cx + corner[0] * W / 2, cz + corner[1] * H / 2
            for k in range(3):
                s = rng.uniform(0.6, 0.75) * (1 if k == 0 else 0.7)
                bpy.ops.mesh.primitive_cube_add(size=s, location=(ox - corner[0] * rng.uniform(0.0, 0.22) * k,
                                                                  -DEPTH + rng.uniform(-0.05, 0.08),
                                                                  oz - corner[1] * rng.uniform(0.0, 0.18) * (2 - k)),
                                                rotation=(rng.uniform(0, 3), rng.uniform(0, 3), rng.uniform(0, 3)))
                c = bpy.context.object; c.data.materials.append(bis); cut.append(c)
            for c in cut:
                bpy.context.view_layer.objects.active = o
                md = o.modifiers.new('chip', 'BOOLEAN'); md.operation = 'DIFFERENCE'; md.object = c; md.solver = 'EXACT'
                md.material_mode = 'TRANSFER'
                bpy.ops.object.modifier_apply(modifier='chip')
            for c in cut: bpy.data.objects.remove(c)
            bpy.context.view_layer.objects.active = o; o.select_set(True)
            bpy.ops.object.shade_smooth_by_angle(angle=math.radians(35))
        return [o, gloss_card(f'card_{col}{w}{dmg}', W, H, -DEPTH)]
    SPRITES[f'brick_{col}_{w}_{dmg}'] = dict(size=(w * CELL + 2 * MARGIN, CELL + 2 * MARGIN), foot=(w * CELL, CELL), build=build, kind='brick')


def build_gold():
    W = CELL * U - MORTAR
    o = box('gold', W, W, DEPTH, 0.12, MATS['GOLD'], at(y=-DEPTH / 2 - 0.05), segs=6)
    bpy.ops.mesh.primitive_ico_sphere_add(radius=0.42, subdivisions=1, location=at(y=-DEPTH - 0.14))
    g = bpy.context.object; g.scale = (1, 0.5, 1); g.data.materials.append(MATS['RUBY'])
    bpy.ops.mesh.primitive_torus_add(major_radius=0.46, minor_radius=0.05, location=at(y=-DEPTH - 0.1), rotation=(math.radians(90), 0, 0))
    t = bpy.context.object; bpy.ops.object.shade_smooth(); t.data.materials.append(MATS['GOLD'])
    return [o, g, t, gloss_card('card_gold', W, W, -DEPTH - 0.05, strength=2.5, window=False, sheen=0.0)]


def build_granite():
    W = CELL * U - MORTAR * 0.5
    o = box('granite', W, W, DEPTH + 0.2, 0.08, MATS['GRANITE'], at(y=-(DEPTH + 0.2) / 2))
    objs = [o]
    for dx in (-0.48, 0.48):
        for dz in (-0.48, 0.48):
            objs.append(box(f'washer{dx}{dz}', 0.28, 0.28, 0.05, 0.015, MATS['IRON'], at(dx, dz, -DEPTH - 0.225), segs=2))
            bpy.ops.mesh.primitive_uv_sphere_add(radius=0.11, segments=16, ring_count=8, location=at(dx, dz, -DEPTH - 0.24))
            r = bpy.context.object; bpy.ops.object.shade_smooth(); r.data.materials.append(MATS['RIVET']); objs.append(r)
    objs.append(gloss_card('card_granite', W, W, -DEPTH - 0.2, strength=3.0, sheen=0.10))
    return objs


def ball_env(name='ballenv'):
    """Reflection-only surroundings for the chrome hero ball (invisible to camera and shadows): the vault as the
    ball would see it, dark stone below with warm torch glints, a violet dusk horizon, the moon-lit sky above."""
    bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32, radius=6, location=at(y=-DEPTH - 0.6))
    o = bpy.context.object; o.name = name
    for a in ('visible_camera', 'visible_diffuse', 'visible_transmission', 'visible_volume_scatter', 'visible_shadow'):
        setattr(o, a, False)
    m = bpy.data.materials.new('ballenv'); nt = m.node_tree; nt.nodes.remove(nt.nodes['Principled BSDF'])
    tc = node(nt, 'ShaderNodeTexCoord'); sep = node(nt, 'ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['Object'], sep.inputs['Vector'])
    X, Y, Z = sep.outputs['X'], sep.outputs['Y'], sep.outputs['Z']
    g = node(nt, 'ShaderNodeValToRGB'); e = g.color_ramp.elements
    nt.links.new(maprange(nt, Z, -6, 6, 0, 1, smooth=False), g.inputs['Fac'])
    e[0].position = 0.0; e[0].color = (0.03, 0.02, 0.03, 1); e[1].position = 1.0; e[1].color = (0.75, 0.74, 0.95, 1)
    for p, c in ((0.38, (0.06, 0.035, 0.05)), (0.49, (0.30, 0.13, 0.22)), (0.53, (0.55, 0.30, 0.30)),
                 (0.57, (0.14, 0.10, 0.22)), (0.75, (0.36, 0.34, 0.55))):
        k = g.color_ramp.elements.new(p); k.color = (*c, 1)
    col = g.outputs['Color']
    # two warm torch glints low left/right and a cool rim strip high right
    for (cx_, cz_, r_, c_) in ((4.6, -1.4, 0.7, (6.0, 2.4, 0.7)), (-1.5, -5.2, 3.5, (0.16, 0.07, 0.05)),
                               (4.2, 3.0, 1.0, (1.4, 1.6, 2.6)), (-3.0, 3.6, 1.9, (4.0, 3.5, 3.0))):
        dx = mth(nt, 'SUBTRACT', X, cx_); dz = mth(nt, 'SUBTRACT', Z, cz_)
        d = mth(nt, 'SQRT', mth(nt, 'ADD', mth(nt, 'MULTIPLY', dx, dx), mth(nt, 'MULTIPLY', dz, dz)))
        col = mixc(nt, mth(nt, 'MULTIPLY', maprange(nt, d, r_, r_ * 0.3), maprange(nt, Y, 0.0, -2.0)), col, c_)
    em = node(nt, 'ShaderNodeEmission'); nt.links.new(col, em.inputs['Color']); em.inputs['Strength'].default_value = 1.4
    nt.links.new(em.outputs[0], nt.nodes['Material Output'].inputs['Surface'])
    o.data.materials.append(m)
    return o


def build_ball(fire=False):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=96, ring_count=48, radius=0.6, location=at(y=-DEPTH - 0.6))
    o = bpy.context.object; bpy.ops.object.shade_smooth()
    if not fire:
        steel = mat('steelball', (0.93, 0.93, 0.95), rough=0.035, metal=1.0, coat=0.6, coat_rough=0.0)
        o.data.materials.append(steel); return [o, ball_env()]
    m = mat('molten', (0.2, 0.035, 0.0), rough=0.35, coat=1.0, coat_rough=0.05); nt = m.node_tree; b = nt.nodes['Principled BSDF']
    tc = node(nt, 'ShaderNodeTexCoord')
    nz = node(nt, 'ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 3.2; nz.inputs['Detail'].default_value = 6; nz.inputs['Distortion'].default_value = 0.8
    nt.links.new(tc.outputs['Object'], nz.inputs['Vector'])
    ramp = node(nt, 'ShaderNodeValToRGB'); e = ramp.color_ramp.elements
    e[0].position = 0.42; e[0].color = (0.55, 0.03, 0.0, 1); e[1].position = 0.6; e[1].color = (1.0, 0.33, 0.02, 1)
    nt.links.new(nz.outputs['Fac'], ramp.inputs['Fac'])
    lw = node(nt, 'ShaderNodeLayerWeight'); lw.inputs['Blend'].default_value = 0.4
    nt.links.new(ramp.outputs['Color'], b.inputs['Emission Color'])
    feed(nt, b.inputs['Emission Strength'], maprange(nt, lw.outputs['Facing'], 0.0, 1.0, 1.7, 0.6))
    o.data.materials.append(m)
    return [o]


def build_titan():
    """Titan core: dark gunmetal chrome ball (same 12-unit ball in a 20-unit sprite) cut by two tilted great-circle
    seams that glow, one magenta and one cyan, each sunk in a thin dark groove; the vault reflection env as on the ball."""
    bpy.ops.mesh.primitive_uv_sphere_add(segments=128, ring_count=64, radius=0.6, location=at(y=-DEPTH - 0.6))
    o = bpy.context.object; bpy.ops.object.shade_smooth()
    m, nt = layered('titan', None)
    tc = node(nt, 'ShaderNodeTexCoord'); P = tc.outputs['Object']
    gun = principled(nt, srgb('#4c5368'), 0.06, 1.0, coat=0.8)
    sh, dist = gun, []
    for n_, hexc, strength in (((0.30, -0.35, 0.89), '#ff3fd0', 4.0), ((0.88, -0.30, -0.36), '#3ff0ff', 3.5),
                               ((-0.45, -0.55, 0.30), '#ff3fd0', 3.5)):
        ln = math.sqrt(sum(c * c for c in n_)); n_ = tuple(c / ln for c in n_)
        dp = node(nt, 'ShaderNodeVectorMath', operation='DOT_PRODUCT'); nt.links.new(P, dp.inputs[0]); dp.inputs[1].default_value = n_
        d = mth(nt, 'ABSOLUTE', dp.outputs['Value'])                   # metres from the seam plane
        groove = maprange(nt, d, 0.07, 0.055)                          # dark channel
        core = maprange(nt, d, 0.045, 0.02)                            # glowing seam inside it
        sh = mixs(nt, groove, sh, principled(nt, (0.02, 0.02, 0.03), 0.4, 0.8))
        c = srgb(hexc)
        sh = mixs(nt, core, sh, principled(nt, c, 0.2, 0.0, emit=c, emit_str=strength))
    nt.links.new(sh, nt.nodes['Material Output'].inputs['Surface'])
    o.data.materials.append(m)
    return [o, ball_env('titanenv')]


def strip_mask(nt, X, Z, half_len, half_h):
    """Signed distance (m) to a horizontal stadium |x|<half_len, |z|<half_h on the front view."""
    q = mth(nt, 'MAXIMUM', mth(nt, 'SUBTRACT', mth(nt, 'ABSOLUTE', X), half_len - half_h), 0.0)
    return mth(nt, 'SUBTRACT', mth(nt, 'SQRT', mth(nt, 'ADD', mth(nt, 'MULTIPLY', q, q), mth(nt, 'MULTIPLY', Z, Z))), half_h)


def layered(name, layers):
    """Material from a list of (shader node, factor socket or None) mixed in order."""
    m = bpy.data.materials.new(name); nt = m.node_tree; nt.nodes.remove(nt.nodes['Principled BSDF'])
    return m, nt


def principled(nt, color, rough, metal=0.0, coat=0.0, emit=None, emit_str=0.0):
    b = node(nt, 'ShaderNodeBsdfPrincipled')
    b.inputs['Base Color'].default_value = (*color, 1); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    b.inputs['Coat Weight'].default_value = coat; b.inputs['Coat Roughness'].default_value = 0.02
    if emit: b.inputs['Emission Color'].default_value = (*emit, 1); b.inputs['Emission Strength'].default_value = emit_str
    return b.outputs[0]


def mixs(nt, fac, a, b):
    ms = node(nt, 'ShaderNodeMixShader'); feed(nt, ms.inputs[0], fac); nt.links.new(a, ms.inputs[1]); nt.links.new(b, ms.inputs[2])
    return ms.outputs[0]


def build_paddle():
    m, nt = layered('paddle', None)
    tc = node(nt, 'ShaderNodeTexCoord'); sep = node(nt, 'ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['Object'], sep.inputs['Vector'])
    dist = strip_mask(nt, sep.outputs['X'], sep.outputs['Z'], 3.27, 0.17)
    gold = maprange(nt, dist, 0.008, -0.008)
    groove = mth(nt, 'MULTIPLY', maprange(nt, dist, -0.006, 0.006), maprange(nt, dist, 0.04, 0.055, 1, 0))
    sh = principled(nt, (0.9, 0.91, 0.94), 0.06, 1.0)
    sh = mixs(nt, gold, sh, principled(nt, srgb('#ffc94a'), 0.13, 1.0))
    sh = mixs(nt, groove, sh, principled(nt, (0.03, 0.03, 0.045), 0.45, 1.0))
    nt.links.new(sh, nt.nodes['Material Output'].inputs['Surface'])
    return [capsule('paddle', 7.4, 0.6, at(y=-DEPTH - 0.6), m), ball_env('paddleenv')]


def make_cap(key, hexc):
    def build():
        m, nt = layered('cap_' + key, None)
        tc = node(nt, 'ShaderNodeTexCoord'); sep = node(nt, 'ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['Object'], sep.inputs['Vector'])
        band = mth(nt, 'ABSOLUTE', mth(nt, 'SUBTRACT', mth(nt, 'ABSOLUTE', sep.outputs['X']), 1.3))
        chrome = maprange(nt, band, 0.085, 0.07)
        groove = mth(nt, 'MULTIPLY', maprange(nt, band, 0.07, 0.085), maprange(nt, band, 0.11, 0.125, 1, 0))
        c = srgb(hexc)
        b = node(nt, 'ShaderNodeBsdfPrincipled')
        b.inputs['Base Color'].default_value = (*c, 1); b.inputs['Roughness'].default_value = 0.25
        b.inputs['Coat Weight'].default_value = 1.0; b.inputs['Coat Roughness'].default_value = 0.02
        b.inputs['Subsurface Weight'].default_value = 0.12
        b.inputs['Emission Color'].default_value = (*c, 1); b.inputs['Emission Strength'].default_value = 0.12
        sh = mixs(nt, chrome, b.outputs[0], principled(nt, (0.9, 0.91, 0.94), 0.06, 1.0))
        sh = mixs(nt, groove, sh, principled(nt, (0.03, 0.03, 0.045), 0.45, 1.0))
        nt.links.new(sh, nt.nodes['Material Output'].inputs['Surface'])
        return [capsule('cap_' + key, 4.0, 0.9, at(y=-DEPTH - 0.9), m), ball_env('capenv_' + key)]
    SPRITES['cap_' + key] = dict(size=(40 + 2 * MARGIN, 18 + 2 * MARGIN), foot=(40, 18), build=build, kind='capsule')


def build_lantern():
    I = MATS['IRON']; objs = []
    y = -0.2   # same depth as the plate's lantern light
    glass = mat('lanternglass', (1, 0.7, 0.35), rough=0.1, coat=1.0, emit=(1, 0.5, 0.15), emit_str=5)
    objs.append(cyl(0.26, 0.56, at(0, 0, y), glass))
    objs.append(cyl(0.34, 0.07, at(0, -0.31, y), I))
    bpy.ops.mesh.primitive_cone_add(radius1=0.38, radius2=0.08, depth=0.24, location=at(0, 0.39, y), vertices=32)
    c = bpy.context.object; bpy.ops.object.shade_smooth(); c.data.materials.append(I); objs.append(c)
    for a in range(4):
        ang = math.pi / 4 + a * math.pi / 2
        objs.append(cyl(0.025, 0.62, at(0.28 * math.cos(ang), 0, y + 0.28 * math.sin(ang)), I, verts=8))
    bpy.ops.mesh.primitive_torus_add(major_radius=0.1, minor_radius=0.025, location=at(0, 0.6, y), rotation=(math.radians(90), 0, 0))
    t = bpy.context.object; bpy.ops.object.shade_smooth(); t.data.materials.append(I); objs.append(t)
    objs.append(cyl(0.02, 0.5, at(0, 0.92, y), I, verts=8))
    return objs


SPRITES['brick_gold_1_0'] = dict(size=(24, 24), foot=(16, 16), build=build_gold, kind='gold')
SPRITES['brick_granite_1_0'] = dict(size=(24, 24), foot=(16, 16), build=build_granite, kind='granite')
for _c in COLORS:
    for _w in (1, 2):
        for _d in (0, 1, 2):
            make_brick(_c, _w, _d)
SPRITES['ball'] = dict(size=(20, 20), foot=(12, 12), build=build_ball, kind='ball')
SPRITES['ball_titan'] = dict(size=(20, 20), foot=(12, 12), build=build_titan, kind='ball')
SPRITES['ball_fire'] = dict(size=(20, 20), foot=(12, 12), build=lambda: build_ball(True), kind='ball')
SPRITES['paddle'] = dict(size=(74 + 2 * MARGIN, 12 + 2 * MARGIN), foot=(74, 12), build=build_paddle, kind='paddle')
for _k, _h in CAPS.items(): make_cap(_k, _h)
SPRITES['lantern'] = dict(size=(16, 24), foot=(8, 13), build=build_lantern, kind='prop')
SPRITES['torch_flame'] = dict(size=(24, 32), foot=(6, 10), build=lambda: [flame('flame', at(y=-DEPTH - 0.5), 0.33, flame_mat('tf'))], kind='prop')


def render_sprites(names=None):
    sc = reset()
    names = names or list(SPRITES)
    built = {}
    for n in names:
        built[n] = SPRITES[n]['build']()
    for n in names:
        for k, objs in built.items():
            for o in objs: o.hide_render = k != n
        w, h = SPRITES[n]['size']
        frame(sc, P0[0] - w / 2, P0[1] - h / 2, w, h, SPR_PPU, os.path.join(RAW, n + '.png'), True, 32 if FAST else 64)
    manifest = {n: dict(size=s['size'], foot=s['foot'], kind=s['kind']) for n, s in SPRITES.items()}
    json.dump(manifest, open(os.path.join(RAW, 'manifest.json'), 'w'), indent=1)


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    what = args[0] if args else 'all'
    if what in ('plate', 'all'): render_plate()
    if what in ('bars', 'all'): render_bars()
    if what in ('sprites', 'all'): render_sprites(args[1:] or None)
    if what in ('post', 'all'):
        import subprocess
        subprocess.run([sys.executable, os.path.join(HERE, 'vault_post.py')], check=True)
```


---

## `art/vault_post.py`

Pillow/numpy post-process for the Vault renders: glows, splits the paddle into stretchable caps and middle, builds atlas.json and preview sheets.

```python
# Post-processing for the Vault renders (Pillow + numpy only, no Blender needed).
# Run after art/render_vault_assets.py has filled art/out/vault_raw/:
#   python3 art/vault_post.py
# Writes assets/vault/: plate.png/.jpg, bars.png, every sprite PNG, atlas.json, contact.png, composite.png.
# Adds the light glows that Cycles has no cheap equivalent for (halo around the fire ball / torch flame / lantern), splits the paddle into stretchable caps + middle tile, and builds the previews.
import json, os, hashlib, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
RAW = os.path.join(HERE, 'out', 'vault_raw')
OUT = os.path.join(ROOT, 'assets', 'vault')
os.makedirs(OUT, exist_ok=True)

PLATE_X0, PLATE_Y0, PLATE_W, PLATE_H, PLATE_PPU = 0, -40, 360, 820, 2
SPR_PPU, MARGIN = 3, 4
OX, OY, CELL = 20, 96, 16
LANTERN = (196, 158)
TORCH_FLAMES = [(40, 527), (320, 527)]
PADDLE_CAP, PADDLE_MID = 12, 50

LAYOUT = [  # The Vault, 20 x 20 cells (rows 16-19 blue per the art-direction update)
    "tttttttttttttttt....",
    "tttttttttttttttt....",
    "tttttt########tttttt",
    "tttttt#......#tttttt",
    "ttgttt#......#tttgtt",
    "tttttt#......#tttttt",
    "vvvvvvvvvvvvvvvvvvvv",
    "vvvvvvvvvvvvvvvvvvvv",
    "vvv##vvvvgvvvvvv##vv",
    "vvvvvvvvvvvvvvvvvvvv",
    "cccccccccccccccccccc",
    "ccccccccc..ccccccccc",
    "ccgcccccc..cccccgccc",
    "cccc###cc..cc###cccc",
    "yyyyyyyyy..yyyyyyyyy",
    "yyyyy......yyyyyyyyy",
    "bbbbb..bbbbbbbbbbbbb",
    "bbbbb..bbbgbbbbbb..b",
    "bbbbb..bbbbbbbbbb..b",
    "bbbbb..bbbbbbbbbb..b",
]
TINT_JITTER = 0.04


def px(x, y):
    """Screen units -> plate pixels."""
    return round((x - PLATE_X0) * PLATE_PPU), round((y - PLATE_Y0) * PLATE_PPU)


def save_png(im, name):
    p = os.path.join(OUT, name); im.save(p, optimize=True); return p


def radial(w, h, cx, cy, sigma):
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    return np.exp(-((xx - cx) ** 2 + (yy - cy) ** 2) / (2 * sigma ** 2))


def add_halo(im, color, sigma_px, strength, core=None):
    """Put a soft glow BEHIND a straight-alpha sprite (the glow is part of the sprite, centred)."""
    w, h = im.size
    g = radial(w, h, (w - 1) / 2 if core is None else core[0], (h - 1) / 2 if core is None else core[1], sigma_px) * strength
    glow = np.zeros((h, w, 4), np.float32); glow[..., :3] = color; glow[..., 3] = np.clip(g, 0, 1) * 255
    out = Image.fromarray(glow.astype(np.uint8), 'RGBA')
    out.alpha_composite(im)
    return out


def plate():
    im = np.asarray(Image.open(os.path.join(RAW, 'plate.png')).convert('RGB')).astype(np.float32)
    # v3: the wall torches are gone, so no torch halos; the plate is used as rendered
    out = Image.fromarray(np.clip(im, 0, 255).astype(np.uint8), 'RGB')
    save_png(out, 'plate.png')
    out.save(os.path.join(OUT, 'plate.jpg'), quality=88, optimize=True, progressive=True)
    return out


def bar_shadow(bars, dx=1.4, dy=2.2, blur_u=1.1, a=0.55):
    """v3: a soft contact shadow of the cage bars on the chamber's back wall, baked into the (plate-registered) bars layer."""
    from PIL import ImageFilter
    al = bars.split()[3]
    sh = Image.new('L', bars.size, 0); sh.paste(al, (round(dx * PLATE_PPU), round(dy * PLATE_PPU)))
    sh = sh.filter(ImageFilter.GaussianBlur(blur_u * PLATE_PPU)).point(lambda v: int(v * a))
    out = Image.merge('RGBA', (Image.new('L', bars.size, 4), Image.new('L', bars.size, 4), Image.new('L', bars.size, 8), sh))
    out.alpha_composite(bars)
    return out


def sprites(manifest):
    atlas = {}
    for name, m in manifest.items():
        if not os.path.exists(os.path.join(RAW, name + '.png')):   # declared but not rendered yet: leave it out of the atlas
            print('post: no raw render for', name, '- skipped'); continue
        im = Image.open(os.path.join(RAW, name + '.png')).convert('RGBA')
        sw, sh = m['size']
        assert im.size == (sw * SPR_PPU, sh * SPR_PPU), (name, im.size)
        if name == 'ball_fire': im = add_halo(im, (255, 120, 30), 5.0 * SPR_PPU / 2, 0.9)
        if name == 'torch_flame': im = add_halo(im, (255, 140, 50), 4.5 * SPR_PPU, 0.75)
        if name == 'lantern': im = add_halo(im, (255, 150, 60), 3.2 * SPR_PPU, 0.6)
        entry = dict(file=name + '.png', px=list(im.size), ppu=SPR_PPU, anchor=[im.size[0] / 2, im.size[1] / 2],
                     footprint=list(m['foot']), drawSize=[sw, sh], margin=MARGIN if name not in ('lantern', 'torch_flame') else None,
                     kind=m['kind'])
        if name == 'paddle':
            # left cap = margin + 12 units, middle = 50 units (stretch horizontally), right cap = 12 units + margin
            l = (MARGIN + PADDLE_CAP) * SPR_PPU; mid = PADDLE_MID * SPR_PPU
            parts = {'paddle_l': im.crop((0, 0, l, im.size[1])), 'paddle_m': im.crop((l, 0, l + mid, im.size[1])),
                     'paddle_r': im.crop((l + mid, 0, im.size[0], im.size[1]))}
            for pn, pim in parts.items():
                save_png(pim, pn + '.png')
                fw = {'paddle_l': PADDLE_CAP, 'paddle_m': PADDLE_MID, 'paddle_r': PADDLE_CAP}[pn]
                dw = pim.size[0] / SPR_PPU
                atlas[pn] = dict(file=pn + '.png', px=list(pim.size), ppu=SPR_PPU, anchor=[pim.size[0] / 2, pim.size[1] / 2],
                                 footprint=[fw, 12], drawSize=[dw, sh], margin=MARGIN, kind='paddle',
                                 note={'paddle_l': 'includes the 4-unit left margin; its right edge meets paddle_m',
                                       'paddle_m': 'no horizontal margin; stretch horizontally to (paddleWidth - 24) units',
                                       'paddle_r': 'includes the 4-unit right margin; its left edge meets paddle_m'}[pn])
            continue
        save_png(im, name + '.png')
        atlas[name] = entry
    return atlas


def cells():
    """Yield (col, row, kind, width) for the LAYOUT, bricks two cells wide in running bond."""
    done = set()
    for r, row in enumerate(LAYOUT):
        for c, v in enumerate(row):
            if v == '.' or (c, r) in done: continue
            w = 1
            if v not in 'g#' and (c + r) % 2 == 0 and c + 1 < len(row) and row[c + 1] == v and (c + 1, r) not in done: w = 2
            for k in range(w): done.add((c + k, r))
            yield c, r, v, w


def tint(im, k):
    a = np.asarray(im).astype(np.float32); a[..., :3] *= k
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA')


def place(canvas, im, cx, cy, scale=PLATE_PPU / SPR_PPU, size=None):
    """Draw sprite centred at screen (cx, cy)."""
    tw, th = size or (round(im.size[0] * scale), round(im.size[1] * scale))
    s = im.resize((tw, th), Image.LANCZOS)
    x, y = px(cx, cy)
    canvas.alpha_composite(s, (round(x - tw / 2), round(y - th / 2)))


def composite(plate_im):
    cv = plate_im.convert('RGBA')
    L = lambda n: Image.open(os.path.join(OUT, n + '.png')).convert('RGBA')
    cv.alpha_composite(L('bars'))
    rng = random.Random(5)
    for c, r, v, w in cells():
        x0, y0 = OX + c * CELL, OY + r * CELL
        cx, cy = x0 + w * CELL / 2, y0 + CELL / 2
        if v == 'g': name = 'brick_gold_1_0'
        elif v == '#': name = 'brick_granite_1_0'
        else:
            roll = rng.random(); d = 2 if roll < 0.05 else 1 if roll < 0.14 else 0
            name = f'brick_{v}_{w}_{d}'
        im = L(name)
        if v not in 'g#':   # deterministic per-cell tint jitter, as the game should do it
            hsh = int(hashlib.md5(f'{c},{r}'.encode()).hexdigest()[:8], 16) / 0xffffffff
            im = tint(im, 1 + TINT_JITTER * (2 * hsh - 1))
        place(cv, im, cx, cy)
    # paddle, 74 wide at y = 700 (caps + stretched middle), a serve-ready ball and a falling capsule
    pw, py_, pcx = 74, 700, 180
    lft, mid, rgt = L('paddle_l'), L('paddle_m'), L('paddle_r')
    k = PLATE_PPU / SPR_PPU
    lw, rw = round(lft.size[0] * k), round(rgt.size[0] * k); mw = (pw - 2 * PADDLE_CAP) * PLATE_PPU; hh = round(lft.size[1] * k)
    x0, y0 = px(pcx - pw / 2 - MARGIN, py_ - 6 - MARGIN)
    cv.alpha_composite(lft.resize((lw, hh), Image.LANCZOS), (x0, y0))
    cv.alpha_composite(mid.resize((mw, hh), Image.LANCZOS), (x0 + lw, y0))
    cv.alpha_composite(rgt.resize((rw, hh), Image.LANCZOS), (x0 + lw + mw, y0))
    place(cv, L('ball'), 214, 596)
    place(cv, L('cap_wide'), 92, 548)
    return cv.convert('RGB')


def contact(atlas, plate_im):
    font = ImageFont.load_default()
    names = [n for n in atlas if n not in ('plate', 'bars')]
    cellw, cellh, cols = 170, 112, 7
    rows = (len(names) + cols - 1) // cols
    W = 380 + cols * cellw + 20; H = max(850, rows * cellh + 40)
    sheet = Image.new('RGBA', (W, H), (24, 22, 30, 255)); d = ImageDraw.Draw(sheet)
    th = plate_im.resize((360, 820), Image.LANCZOS).convert('RGBA')
    bars = Image.open(os.path.join(OUT, 'bars.png')).resize((360, 820), Image.LANCZOS)
    th.alpha_composite(bars); sheet.alpha_composite(th, (10, 20)); d.text((10, 4), 'plate.png + bars.png (50%)', fill=(220, 220, 230, 255), font=font)
    for i, n in enumerate(names):
        cx = 380 + (i % cols) * cellw; cy = 20 + (i // cols) * cellh
        for yy in range(cy, cy + cellh - 18, 8):   # checker so alpha is visible
            for xx in range(cx, cx + cellw - 10, 8):
                if ((xx - cx) // 8 + (yy - cy) // 8) % 2: d.rectangle([xx, yy, xx + 7, yy + 7], fill=(44, 40, 54, 255))
                else: d.rectangle([xx, yy, xx + 7, yy + 7], fill=(36, 33, 45, 255))
        im = Image.open(os.path.join(OUT, atlas[n]['file'])).convert('RGBA')
        if im.size[0] > cellw - 14: im = im.resize((cellw - 14, round(im.size[1] * (cellw - 14) / im.size[0])), Image.LANCZOS)
        sheet.alpha_composite(im, (cx + (cellw - 10 - im.size[0]) // 2, cy + (cellh - 18 - im.size[1]) // 2))
        d.text((cx, cy + cellh - 16), f"{n} {atlas[n]['px'][0]}x{atlas[n]['px'][1]}", fill=(210, 210, 220, 255), font=font)
    sheet.convert('RGB').save(os.path.join(OUT, 'contact.png'), optimize=True)


def main():
    manifest = json.load(open(os.path.join(RAW, 'manifest.json')))
    pl = plate()
    bars = bar_shadow(Image.open(os.path.join(RAW, 'bars.png')).convert('RGBA'))
    assert bars.size == pl.size
    save_png(bars, 'bars.png')
    sp = sprites(manifest)
    atlas = {
        'version': 1,
        'units': 'game units (1 unit = 0.1 m in Blender); screen is 360 units wide',
        'board': dict(ox=OX, oy=OY, cols=20, rows=20, cell=CELL),
        'plate': dict(file='plate.png', jpg='plate.jpg', px=list(pl.size), ppu=PLATE_PPU, screenRect=[PLATE_X0, PLATE_Y0, PLATE_W, PLATE_H],
                      convention='pixel (px, py) <-> screen (x, y): px = 2*x, py = 2*(y + 40); draw plate at screen (0, -40) with size 360 x 820 units'),
        'bars': dict(file='bars.png', px=list(bars.size), ppu=PLATE_PPU, screenRect=[PLATE_X0, PLATE_Y0, PLATE_W, PLATE_H],
                     note='registered to the plate; draw over the fox with the same rect as the plate'),
        'spriteConvention': ('sprites are 3 px/unit; draw each centred on its anchor at the footprint centre, at size drawSize (units) = px / 3. '
                             'Bricks: drawSize = footprint + 2*margin, so a brick in cells (c..c+w-1, r) is drawn at '
                             'x = ox + c*16 - 4, y = oy + r*16 - 4, w = w*16 + 8, h = 24.'),
        'tintJitter': TINT_JITTER,
        'tintNote': 'multiply glazed brick RGB by 1 + tintJitter*(2*hash(c,r)-1) for per-brick variation (composite.png does this)',
        'anchors': {'chamber': [OX + 7 * CELL, OY + 3 * CELL, 6 * CELL, 3 * CELL]},
        'propsNote': 'v3 plate has no torches and no lantern; the lantern / torch_flame sprites are kept but unused',
        'sprites': sp,
    }
    json.dump(atlas, open(os.path.join(OUT, 'atlas.json'), 'w'), indent=1)
    composite(pl).save(os.path.join(OUT, 'composite.png'), optimize=True)
    contact(sp, pl)
    tot = 0
    for f in sorted(os.listdir(OUT)):
        s = os.path.getsize(os.path.join(OUT, f)); tot += s
    print('assets/vault total', round(tot / 1024), 'KB in', len(os.listdir(OUT)), 'files')


if __name__ == '__main__':
    main()
```


---

## `art/render_invasion_assets.py`

Invasion: hangar plate, candy/armour/power bricks, toy robot invaders (7 expressions x colours), the mothership with alien pilot (5 expressions and rim lights), bolt and bomb. Imports the Vault materials and light rig so both levels match.

```python
# BREACH "Invasion" (level 1) production renders: hangar plate, glazed candy / armor / power bricks, the toy robot
# invaders (7 expressions x 5 body colours), the mothership with its alien pilot (5 expressions + blinking rim
# lights), the plasma bolt and the bomb.
#
# Same look as The Vault: it imports art/render_vault_assets.py for the materials, the light rig (key / cool fill /
# warm bounce area lights + softbox reflection plane), the ortho camera framing and AgX Medium High Contrast. Every
# sprite is rendered at the Vault's sprite spot P0 so the lighting is identical to the Vault bricks.
#
# Run from the repo root (Blender 5.2 as a Python module + Pillow + numpy):
#   python3 art/render_invasion_assets.py all             # plate + sprites + post   (~20 min on 4 cores)
#   python3 art/render_invasion_assets.py plate [--fast]  # just the plate (fast = 1 px/unit, few samples)
#   python3 art/render_invasion_assets.py sprites [name ...] [--fast] [--ppu N]
#   python3 art/render_invasion_assets.py post            # = python3 art/invasion_post.py
# Raw renders land in art/out/invasion_raw/, final assets in assets/invasion/ (see art/invasion_post.py).
#
# Coordinates: 1 game unit = 0.1 m; screen y grows downward; Blender (x, z) = (x * 0.1, -y * 0.1); the camera sits
# at y = -60 looking +Y. Plate covers screen x 0..360, y -40..780 at 2 px/unit: px = 2 * x, py = 2 * (y + 40).
import bpy, bmesh, math, random, sys, os, json
from mathutils import Vector, Matrix
from PIL import Image, ImageDraw, ImageFilter, ImageChops

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import render_vault_assets as V
from render_vault_assets import node, sock, feed, mixc, mth, maprange, mat, box, cyl, srgb, S, U

ROOT = os.path.dirname(HERE)
RAW = os.path.join(HERE, 'out', 'invasion_raw')
TMP = os.path.join(HERE, 'out', 'invasion_tmp')
os.makedirs(RAW, exist_ok=True); os.makedirs(TMP, exist_ok=True)
FAST = '--fast' in sys.argv
_ppu = [a for a in sys.argv if a.startswith('--ppu=')]
SPR_PPU = int(_ppu[0].split('=')[1]) if _ppu else 3
MARGIN = 4
CW, CH, COLS, ROWS = 28, 18, 11, 9
OX, OY = 26, 92
PLATE = dict(x0=0, y0=-40, w=360, h=820, ppu=2)
ROW_COLORS = ['#ff5d8f', '#ff8a3d', '#ffd23f', '#5ccf6a', '#2ec4b6', '#3fa8f5', '#7b6cf6', '#c46bf0', '#ff5d8f']
ARMOR, POWER = '#8d97b3', '#f4c542'
BOT_COLORS = {'white': '#f4f6fb', 'pink': '#ff5d8f', 'yellow': '#ffd23f', 'blue': '#3fa8f5'}
GAP = 1.4                                  # units of air between neighbouring bricks (no mortar here)


def at(dx=0.0, dz=0.0, y=0.0):
    """Blender location relative to the sprite spot (metres)."""
    x, z = S(*V.P0)
    return (x + dx, y, z + dz)


def lin(h, k=1.0):
    return tuple(c * k for c in srgb(h))


def hide_from_rays(o, camera=True):
    for a in ('visible_diffuse', 'visible_glossy', 'visible_transmission', 'visible_volume_scatter', 'visible_shadow'):
        setattr(o, a, False)
    o.visible_camera = camera


def new_obj(name, bm, m=None, smooth=True, parent=None):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    if smooth:
        for p in me.polygons: p.use_smooth = True
    o = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(o)
    if m: o.data.materials.append(m)
    if parent: o.parent = parent
    return o


def empty(name, loc=(0, 0, 0), parent=None):
    e = bpy.data.objects.new(name, None); bpy.context.scene.collection.objects.link(e)
    e.location = loc; e.parent = parent
    return e


def sgnpow(v, e):
    return math.copysign(abs(v) ** e, v)


def squircle(name, hx, hz, hy, m, ex=0.45, ez=0.45, ey=0.5, ez_top=None, taper=0.0, seg=96, rings=48, parent=None,
             loc=(0, 0, 0), dent=None):
    """Superellipsoid (rounded box / helmet) in metres: half extents hx (x), hz (z, up), hy (y, depth).
    ez_top: rounder exponent for the top half (dome). taper: narrows the top. dent: (x, z, radius, depth) push-in."""
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=rings, radius=1)
    for v in bm.verts:
        sx, sy, sz = v.co           # sphere poles along z -> make them the depth axis
        x, zz, y = sx, sy, sz
        e_z = ez_top if (ez_top and zz > 0) else ez
        X = hx * sgnpow(x, ex); Z = hz * sgnpow(zz, e_z); Y = hy * sgnpow(y, ey)
        if taper and Z > 0: X *= 1 - taper * (Z / hz) ** 2
        v.co = Vector((X, Y, Z))
        if dent:   # push the surface inward around a 3D point (dx, dy, dz)
            dx, dy, dz, r, d = dent
            g = math.exp(-((X - dx) ** 2 + (Y - dy) ** 2 + (Z - dz) ** 2) / (2 * r * r))
            v.co -= v.co.normalized() * d * g
    o = new_obj(name, bm, m, parent=parent); o.location = loc
    return o


def tube(name, pts, radius, m, parent=None, res=4, caps=True):
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = radius; cu.bevel_resolution = res
    cu.use_fill_caps = caps
    sp = cu.splines.new('POLY'); sp.points.add(len(pts) - 1)
    for p, c in zip(sp.points, pts): p.co = (*c, 1)
    o = bpy.data.objects.new(name, cu); bpy.context.scene.collection.objects.link(o); o.parent = parent
    o.data.materials.append(m)
    return o


def round_cap_tube(name, pts, radius, m, parent=None):
    """Stroke with rounded ends (tube + a sphere on each end) - LED strokes read better with round caps."""
    objs = [tube(name, pts, radius, m, parent)]
    for p in (pts[0], pts[-1]):
        bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=16, v_segments=8, radius=radius)
        s = new_obj(name + '_cap', bm, m, parent=parent); s.location = p; objs.append(s)
    return objs


def fill_shape(name, loops, m, depth=0.01, parent=None):
    """Filled flat 2D shape(s) (list of closed point loops in the local XY plane; nested loops make holes)."""
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '2D'; cu.fill_mode = 'BOTH'; cu.extrude = depth
    for loop in loops:
        sp = cu.splines.new('POLY'); sp.points.add(len(loop) - 1); sp.use_cyclic_u = True
        for p, c in zip(sp.points, loop): p.co = (c[0], c[1], 0, 1)
    o = bpy.data.objects.new(name, cu); bpy.context.scene.collection.objects.link(o); o.parent = parent
    o.data.materials.append(m)
    return o


def chaikin(pts, it=2, closed=True):
    for _ in range(it):
        out = []
        n = len(pts)
        rng = range(n) if closed else range(n - 1)
        if not closed: out.append(pts[0])
        for i in rng:
            a, b = pts[i], pts[(i + 1) % n]
            out.append((0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]))
            out.append((0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]))
        if not closed: out.append(pts[-1])
        pts = out
    return pts


def ellipse(cx, cz, rx, rz, n=48, a0=0.0, a1=math.tau):
    return [(cx + rx * math.cos(a0 + (a1 - a0) * i / n), cz + rz * math.sin(a0 + (a1 - a0) * i / n)) for i in range(n)]


def emission(name, color, strength):
    return V.emit_mat(name, color, strength)


def principled_mix_glass(name, tint=(0.8, 0.9, 1.0), refl=0.9, base=0.04, rough=0.02):
    """Clear 'fake glass' that keeps alpha: transparent where it faces the camera, glossy at grazing angles."""
    m = bpy.data.materials.new(name); nt = m.node_tree; nt.nodes.remove(nt.nodes['Principled BSDF'])
    lw = node(nt, 'ShaderNodeLayerWeight'); lw.inputs['Blend'].default_value = 0.25
    tr = node(nt, 'ShaderNodeBsdfTransparent'); tr.inputs['Color'].default_value = (*tint, 1)
    gl = node(nt, 'ShaderNodeBsdfGlossy'); gl.inputs['Roughness'].default_value = rough
    fac = mth(nt, 'ADD', mth(nt, 'MULTIPLY', lw.outputs['Fresnel'], refl), base, clamp=True)
    ms = node(nt, 'ShaderNodeMixShader'); nt.links.new(fac, ms.inputs[0]); nt.links.new(tr.outputs[0], ms.inputs[1]); nt.links.new(gl.outputs[0], ms.inputs[2])
    nt.links.new(ms.outputs[0], nt.nodes['Material Output'].inputs['Surface'])
    return m


def metal_mat(name, hexc, rough=0.3, metal=0.85, coat=0.6, scratch=0.0):
    m = mat(name, srgb(hexc), rough=rough, metal=metal, coat=coat, coat_rough=0.04)
    if scratch:   # faint brushed grain
        nt = m.node_tree; b = nt.nodes['Principled BSDF']
        tc = node(nt, 'ShaderNodeTexCoord'); mp = node(nt, 'ShaderNodeMapping'); mp.inputs['Scale'].default_value = (1, 40, 40)
        nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])
        nz = node(nt, 'ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 3.0; nz.inputs['Detail'].default_value = 4
        nt.links.new(mp.outputs['Vector'], nz.inputs['Vector'])
        feed(nt, b.inputs['Roughness'], maprange(nt, nz.outputs['Fac'], 0.3, 0.7, rough - scratch, rough + scratch))
    return m


# =============================================================================================== robot invader
LED_STR = {'white': 2.6, 'red': 4.0, 'amber': 3.0}
LED = {'cyan': '#3ff0ff', 'red': '#ff1a30', 'amber': '#ffb02e', 'white': '#d8fbff', 'pink': '#ff6fd0', 'lime': '#b6ff5a'}

# expressions: eye shape, mouth shape, LED colour, antenna (control, tip), arm angles (deg, + = up), feet lift, bob,
# head roll (deg), extra flags
BOT_EXPR = {
    'march0': dict(eye='smug', mouth='smirk', led='cyan', ant=((0.6, 9.2), (2.6, 10.6)), arms=(38, -28), feet=(0.8, 0), bob=0.45, look=0.35, roll=-2),
    'march1': dict(eye='smug', mouth='smirk', led='cyan', ant=((-0.6, 9.2), (-2.6, 10.6)), arms=(-28, 38), feet=(0, 0.8), bob=0.0, look=-0.35, roll=2),
    'angry':  dict(eye='angry', mouth='grit', led='red', ant=((0.0, 9.3), (0.0, 10.7)), arms=(42, 42), feet=(0, 0), bob=0.2, roll=0, claw_open=1.0),
    'hurt':   dict(eye='hurt', mouth='wobble', led='cyan', ant=((-1.6, 9.6), (2.8, 9.4)), arms=(-48, 20), feet=(0.5, 0), bob=-0.3, roll=6, dent=True, crack=True),
    'dizzy':  dict(eye='spiral', mouth='wave', led='amber', ant=((2.4, 11.2), (5.4, 7.4)), arms=(-62, -62), feet=(0, 0), bob=-0.5, roll=-7, stars=True),
    'laugh':  dict(eye='happy', mouth='open', led='cyan', ant=((-1.4, 9.4), (-3.4, 10.0)), arms=(52, 30), feet=(0.6, 0.0), bob=0.7, roll=-8, claw_open=1.0),
    'shock':  dict(eye='wide', mouth='o', led='white', ant=((0.0, 9.4), (0.0, 10.4)), arms=(58, 58), feet=(0.4, 0.4), bob=0.6, roll=0, claw_open=1.0),
}

# head geometry, game units (x right, z up, origin at the cell centre)
HX, HZ, HY, HZC = 10.4, 7.2, 5.6, -0.4          # helmet half width / half height / half depth, centre z
EX, EZ, EY = 0.5, 0.5, 0.62                     # superellipsoid exponents (x, z bottom, depth)
EZ_TOP = 0.9                                    # rounder dome on top
TAPER = 0.18
VZ, VHX, VHZ = 1.3, 8.1, 3.55                    # visor centre z, half width, half height
MZ, MHX, MHZ = -4.55, 3.5, 1.35                  # mouth display
EYE_X = 4.05
BOT_SCALE = 1.08                                 # whole robot, so it fills the 28 x 18 cell like the bricks


def helmet_front(x, z):
    """Depth (game units, negative = toward camera) of the helmet's front surface at (x, z)."""
    zz = z - HZC; e_z = EZ_TOP if zz > 0 else EZ
    hx = HX * (1 - TAPER * (max(0, zz) / HZ) ** 2)
    s = 1 - abs(x / hx) ** (2 / EX) - abs(zz / HZ) ** (2 / e_z)
    return -HY * max(0.0, s) ** (EY / 2)


def eye_shapes(kind, side, look=0.0):
    """2D LED shapes for one eye (side -1 = screen left). Returns [('fill', pts) | ('stroke', pts, radius)]."""
    cx = side * EYE_X + look * 0.6
    cz = VZ - 0.1
    out = []
    if kind == 'smug':
        # heavy flat lids over the lower half of a tall oval; the lead eye (look side) sits lower and its brow arches up
        rx, rz = 1.75, 2.2
        lead = (side > 0) == (look >= 0)
        h = 0.05 if lead else 0.55
        lid = lambda x: cz + h + 0.10 * (x - cx) * side
        pts = [(x, min(z, lid(x) - 0.4)) for x, z in ellipse(cx, cz - 0.2, rx, rz, 64)]
        out.append(('fill', pts))
        out.append(('stroke', [(cx - 1.95, lid(cx - 1.95)), (cx + 1.95, lid(cx + 1.95))], 0.26))
        if not lead:   # raised, arched brow
            out.append(('stroke', chaikin([(cx - 1.7, cz + 2.0), (cx, cz + 2.75), (cx + 1.7, cz + 2.15)], 2, closed=False), 0.24))
    elif kind == 'angry':
        p = [(-2.0, 1.15), (1.85, -0.55), (1.65, -2.0), (-1.75, -1.75)]
        pts = chaikin([(cx + side * -x, cz + z) for x, z in p], 2)
        out.append(('fill', pts))
    elif kind == 'hurt':
        if side < 0:   # squeezed shut: a chevron pointing at the nose
            out.append(('stroke', [(cx - 1.4, cz + 1.5), (cx + 1.25, cz + 0.05), (cx - 1.4, cz - 1.4)], 0.42))
        else:          # the other eye open, small and worried, lid sloping up toward the nose
            lid = lambda x: cz + 0.75 + 0.35 * (cx - x)
            pts = [(x, min(z, lid(x) - 0.35)) for x, z in ellipse(cx + 0.2, cz - 0.3, 1.4, 1.75, 64)]
            out.append(('fill', pts))
            out.append(('stroke', [(cx - 1.6, lid(cx - 1.6) + 0.1), (cx + 1.8, lid(cx + 1.8) + 0.1)], 0.26))
    elif kind == 'spiral':
        pts = []
        turns = 2.3; n = 90
        for i in range(n + 1):
            t = i / n; a = side * t * turns * math.tau + (0.6 if side > 0 else 2.2)
            r = 0.15 + 1.85 * t
            pts.append((cx + r * math.cos(a), cz + r * math.sin(a)))
        out.append(('stroke', pts, 0.27))
    elif kind == 'happy':   # ^ ^
        p = chaikin([(cx - 1.85, cz - 1.0), (cx, cz + 1.25), (cx + 1.85, cz - 1.0)], 3, closed=False)
        out.append(('stroke', p, 0.5))
    elif kind == 'wide':
        out.append(('ring', (cx, cz, 2.05, 0.42)))
        out.append(('fill', ellipse(cx + 0.0, cz - 0.15, 0.62, 0.62, 32)))
    return out


def mouth_shapes(kind):
    cx, cz = 0.0, MZ
    out = []
    if kind == 'smirk':
        p = chaikin([(cx - 1.9, cz + 0.05), (cx + 0.3, cz - 0.35), (cx + 1.6, cz + 0.05), (cx + 2.0, cz + 0.6)], 2, closed=False)
        out.append(('stroke', p, 0.27))
    elif kind == 'grit':
        r = 0.55; w, h = 2.75, 0.85
        loop = []
        for (qx, qz, a0) in ((w - r, h - r, 0), (-w + r, h - r, 90), (-w + r, -h + r, 180), (w - r, -h + r, 270)):
            for i in range(9):
                a = math.radians(a0 + 90 * i / 8); loop.append((cx + qx + r * math.cos(a), cz + qz + r * math.sin(a)))
        out.append(('fill', loop))
    elif kind == 'wobble':
        p = [(cx - 2.2 + 4.4 * i / 30, cz - 0.2 + 0.35 * math.sin(i / 30 * math.tau * 1.5)) for i in range(31)]
        out.append(('stroke', p, 0.25))
    elif kind == 'wave':
        p = [(cx - 2.6 + 5.2 * i / 40, cz + 0.42 * math.sin(i / 40 * math.tau * 2.0)) for i in range(41)]
        out.append(('stroke', p, 0.25))
    elif kind == 'open':
        loop = [(cx + 2.7 * math.cos(a), cz + 0.75 + 2.0 * math.sin(a)) for a in [math.pi + math.pi * i / 40 for i in range(41)]]
        out.append(('fill', chaikin(loop, 1)))
    elif kind == 'o':
        out.append(('ring', (cx, cz - 0.05, 0.95, 0.3)))
    return out


class Robot:
    def __init__(self):
        self.root = empty('bot_root', at(dz=-0.5 * U, y=0.0)); self.root.scale = (BOT_SCALE,) * 3
        self.body_mat = V.glaze_mat('botbody', BOT_COLORS['white'], 3.0)
        self.gun = metal_mat('botgun', '#454d70', rough=0.3, metal=0.7, coat=0.8)
        self.dark = mat('botdark', srgb('#151a2c'), rough=0.35, metal=0.6, coat=0.6)
        self.chrome = V.MATS['CHROME']
        self.silver = mat('botsilver', srgb('#b4bcd6'), rough=0.3, metal=0.55, coat=0.8)
        self.visor_mats = {}; self.led_mats = {}; self.ball_mats = {}
        self.groups = {}           # expression -> objects only shown for it
        self.pivot = empty('bot_pivot', (0, 0, 0), self.root)    # bob / roll
        u = U
        # helmet (plus a dented copy for 'hurt')
        self.helmet = squircle('helmet', HX * u, HZ * u, HY * u, self.body_mat, ex=EX, ez=EZ, ey=EY, ez_top=EZ_TOP, taper=TAPER,
                               parent=self.pivot, loc=(0, 0, HZC * u))
        self.helmet_dent = squircle('helmet_dent', HX * u, HZ * u, HY * u, self.body_mat, ex=EX, ez=EZ, ey=EY, ez_top=EZ_TOP, taper=TAPER,
                                    parent=self.pivot, loc=(0, 0, HZC * u), dent=(-4.6 * u, -1.5 * u, 7.0 * u, 2.1 * u, 1.9 * u))
        squircle('collar', (HX - 0.6) * u, 1.25 * u, (HY - 0.5) * u, self.gun, ex=0.4, ez=0.5, ey=0.5, parent=self.pivot,
                 loc=(0, 0, (HZC - HZ + 0.9) * u), seg=64, rings=24)
        # visor: dark glowing glass in a gunmetal bezel, eyes on it, a clear shell over the eyes
        vy = helmet_front(0, VZ)
        self.vfront = (vy - 0.45) * u
        squircle('bezel', (VHX + 0.75) * u, (VHZ + 0.7) * u, 0.8 * u, self.gun, ex=0.28, ez=0.32, ey=0.6, parent=self.pivot,
                 loc=(0, (vy + 0.6) * u, VZ * u))
        self.visor = squircle('visor', VHX * u, VHZ * u, 0.9 * u, None, ex=0.28, ez=0.32, ey=0.35, parent=self.pivot,
                              loc=(0, (vy + 0.45) * u, VZ * u))
        self.shell = squircle('shell', (VHX - 0.25) * u, (VHZ - 0.25) * u, 0.12 * u, principled_mix_glass('shellglass', refl=1.0, base=0.03),
                              ex=0.28, ez=0.32, ey=0.6, parent=self.pivot, loc=(0, self.vfront - 0.012, VZ * u))
        self.shell_cracked = squircle('shell_cracked', (VHX - 0.25) * u, (VHZ - 0.25) * u, 0.12 * u, self.cracked_glass(),
                                      ex=0.28, ez=0.32, ey=0.6, parent=self.pivot, loc=(0, self.vfront - 0.012, VZ * u))
        # mouth display: small dark glass slot in a chrome rim, with grill teeth for the angry face
        my = helmet_front(0, MZ)
        self.mfront = (my - 0.55) * u
        squircle('mouthrim', (MHX + 0.55) * u, (MHZ + 0.5) * u, 0.8 * u, self.chrome, ex=0.3, ez=0.4, ey=0.6, parent=self.pivot,
                 loc=(0, (my + 0.45) * u, MZ * u))
        self.mouth = squircle('mouth', MHX * u, MHZ * u, 0.8 * u, None, ex=0.3, ez=0.4, ey=0.4, parent=self.pivot,
                              loc=(0, (my + 0.25) * u, MZ * u))
        self.teeth = []
        for i in range(5):
            x = (-2.2 + 1.1 * i) * u
            t = squircle('tooth', 0.17 * u, 1.05 * u, 0.15 * u, self.dark, ex=0.5, ez=0.3, ey=0.6, parent=self.pivot,
                         loc=(x, self.mfront - 0.03, MZ * u), seg=12, rings=8)
            self.teeth.append(t)
        # ear bolts
        for s in (-1, 1):
            x = s * (HX - 0.2) * u
            cyl(1.95 * u, 2.2 * u, (x + s * 0.4 * u, 0, VZ * u), self.gun, rot=(0, math.radians(90), 0), verts=40).parent = self.pivot
            cyl(1.35 * u, 0.6 * u, (x + s * 1.65 * u, 0, VZ * u), self.silver, rot=(0, math.radians(90), 0), verts=32).parent = self.pivot
            bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=24, v_segments=12, radius=0.85 * u)
            o = new_obj('boltcap', bm, self.silver, parent=self.pivot); o.location = (x + s * 1.9 * u, 0, VZ * u); o.scale = (0.5, 1, 1)
        # antenna base
        top = HZC + HZ
        bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=24, v_segments=12, radius=1.35 * u)
        o = new_obj('antbase', bm, self.gun, parent=self.pivot); o.location = (0, 0, (top - 0.25) * u); o.scale = (1, 1, 0.55)
        self.ant_base = (0.0, top + 0.2)
        self.ant = None; self.ant_ball = None
        # arms: shoulder pivots, a short capsule and an open pincer
        self.arms = []
        for s in (-1, 1):
            sh = empty('shoulder', (s * (HX + 0.2) * u, -0.6 * u, -3.6 * u), self.pivot)
            V.capsule('arm', 3.0 * u, 0.72 * u, (s * 1.5 * u, 0, 0), self.gun).parent = sh
            bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=20, v_segments=10, radius=1.0 * u)
            new_obj('elbowball', bm, self.chrome, parent=sh).location = (s * 0.1 * u, 0, 0)
            claw = empty('claw', (s * 3.1 * u, 0, 0), sh)
            bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=20, v_segments=10, radius=0.85 * u)
            new_obj('wrist', bm, self.chrome, parent=claw)
            jaws = []
            for k in (-1, 1):
                j = self.pincer(s, k); j.parent = claw; jaws.append(j)
            self.arms.append((s, sh, claw, jaws))
        # feet
        self.feet = []
        for s in (-1, 1):
            f = squircle('foot', 2.3 * u, 1.15 * u, 2.4 * u, self.gun, ex=0.45, ez=0.5, ey=0.5, parent=self.root,
                         loc=(s * 4.3 * u, 0.6 * u, -8.15 * u), seg=32, rings=16)
            self.feet.append(f)
        # dizzy stars
        self.stars = []
        star_m = mat('botstar', srgb('#ffe27a'), rough=0.2, emit=srgb('#ffd34a'), emit_str=2.0)
        for i in range(2):
            bm = bmesh.new(); pts = []
            for k in range(10):
                r = (1.0 if k % 2 == 0 else 0.45) * 1.35 * u; a = k / 10 * math.tau + math.pi / 2
                pts.append(bm.verts.new((math.cos(a) * r, 0, math.sin(a) * r)))
            bm.faces.new(pts); bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=0.4 * u)
            st = new_obj('star', bm, star_m, smooth=False, parent=self.root); self.stars.append(st)
        self.stars[0].location = (-7.4 * u, -4 * u, 9.4 * u); self.stars[0].rotation_euler = (0, 0.3, 0)
        self.stars[1].location = (8.6 * u, -4 * u, 8.8 * u); self.stars[1].rotation_euler = (0, -0.4, 0)
        # all expression face shapes
        for name, e in BOT_EXPR.items():
            self.groups[name] = self.face(name, e)

    def pincer(self, s, k):
        """One jaw of the claw: a thick hooked arc."""
        u = U
        pts = []
        for i in range(11):
            t = i / 10
            pts.append((s * (0.3 + 1.6 * t) * u, 0, k * (0.25 + 0.8 * math.sin(math.pi * 0.9 * t ** 0.85)) * u))
        objs = round_cap_tube('jaw', [(p[0], p[1], p[2]) for p in pts], 0.55 * u, self.gun)
        j = empty('jawpiv', (0, 0, 0)); j['k'] = k
        for o in objs: o.parent = j
        return j

    def cracked_glass(self):
        """Visor shell with a white crack star (hurt)."""
        Wu, Hu = 2 * VHX, 2 * VHZ; k = 40
        im = Image.new('L', (int(Wu * k), int(Hu * k)), 0); d = ImageDraw.Draw(im)
        rng = random.Random('visorcrack'); ox, oy = (VHX - 7.3) * k, (VHZ - 2.9) * k
        for i in range(5):
            a = -0.15 + i * 0.42 + rng.uniform(-0.12, 0.12); x, y = ox, oy; L = rng.uniform(2.5, 4.8)
            pts = [(x, y)]
            for j in range(6):
                a += rng.gauss(0, 0.35); x += math.cos(a) * L / 6 * k; y += math.sin(a) * L / 6 * k; pts.append((x, y))
            d.line(pts, fill=255, width=int(0.26 * k))
        for r in (1.0,):
            pts = []
            for j in range(7):
                a = -0.3 + j * 0.3; rr = r * k * rng.uniform(0.85, 1.15); pts.append((ox + math.cos(a) * rr, oy + math.sin(a) * rr))
            d.line(pts, fill=200, width=int(0.24 * k))
        im = im.filter(ImageFilter.GaussianBlur(1.2))
        path = os.path.join(TMP, 'visor_crack.png'); im.save(path)
        m = bpy.data.materials.new('crackglass'); nt = m.node_tree; nt.nodes.remove(nt.nodes['Principled BSDF'])
        tc = node(nt, 'ShaderNodeTexCoord'); mp = node(nt, 'ShaderNodeMapping')
        mp.inputs['Scale'].default_value = (1 / (Wu * U), 1, 1 / (Hu * U)); mp.inputs['Location'].default_value = (0.5, 0, 0.5)
        nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])
        sp = node(nt, 'ShaderNodeSeparateXYZ'); cb = node(nt, 'ShaderNodeCombineXYZ'); nt.links.new(mp.outputs['Vector'], sp.inputs[0])
        nt.links.new(sp.outputs['X'], cb.inputs['X']); nt.links.new(sp.outputs['Z'], cb.inputs['Y'])
        imn = node(nt, 'ShaderNodeTexImage', extension='CLIP'); imn.image = bpy.data.images.load(path); imn.image.colorspace_settings.name = 'Non-Color'
        nt.links.new(cb.outputs['Vector'], imn.inputs['Vector'])
        lw = node(nt, 'ShaderNodeLayerWeight'); lw.inputs['Blend'].default_value = 0.25
        tr = node(nt, 'ShaderNodeBsdfTransparent'); gl = node(nt, 'ShaderNodeBsdfGlossy'); gl.inputs['Roughness'].default_value = 0.02
        crack = principled_bsdf(nt, (0.85, 0.92, 1.0), 0.3, emit=(0.6, 0.85, 1.0), emit_str=0.6)
        g = mixs(nt, mth(nt, 'ADD', lw.outputs['Fresnel'], 0.03, clamp=True), tr.outputs[0], gl.outputs[0])
        g = mixs(nt, imn.outputs['Color'], g, crack)
        nt.links.new(g, nt.nodes['Material Output'].inputs['Surface'])
        return m

    def face(self, name, e):
        u = U; objs = []
        col = srgb(LED[e['led']])
        if e['led'] not in self.led_mats:
            self.led_mats[e['led']] = emission('led_' + e['led'], col, LED_STR.get(e['led'], 3.2))
            self.ball_mats[e['led']] = mat('ball_' + e['led'], col, rough=0.15, coat=1.0, emit=col, emit_str=1.6)
        lm = self.led_mats[e['led']]
        y = self.vfront + 0.004
        shapes = eye_shapes(e['eye'], -1, e.get('look', 0)) + eye_shapes(e['eye'], 1, e.get('look', 0))
        my = self.mfront + 0.004
        mshapes = mouth_shapes(e['mouth'])
        for sh, yy in [(s, y) for s in shapes] + [(s, my) for s in mshapes]:
            if sh[0] == 'fill':
                o = fill_shape('led', [[(x * u, z * u) for x, z in sh[1]]], lm, depth=0.004, parent=self.pivot)
                o.rotation_euler = (math.radians(90), 0, 0); o.location = (0, yy, 0); objs.append(o)
            elif sh[0] == 'ring':
                cx, cz, r, w = sh[1]
                o = fill_shape('ledring', [[(x * u, z * u) for x, z in ellipse(cx, cz, r + w / 2, r + w / 2, 64)],
                                           [(x * u, z * u) for x, z in ellipse(cx, cz, r - w / 2, r - w / 2, 64)]], lm, depth=0.004, parent=self.pivot)
                o.rotation_euler = (math.radians(90), 0, 0); o.location = (0, yy, 0); objs.append(o)
            else:
                pts = [(x * u, 0, z * u) for x, z in sh[1]]
                for o in round_cap_tube('ledstroke', pts, sh[2] * u, lm, self.pivot):
                    o.location.y = yy; o.scale.y = 0.15
                    objs.append(o)
        return objs

    def visor_mat(self, led, k=1.0):
        key = (led, k)
        if key in self.visor_mats: return self.visor_mats[key]
        c = srgb(LED[led])
        m = mat('visor_' + led, srgb('#070a18'), rough=0.12, coat=1.0, coat_rough=0.02); nt = m.node_tree; b = nt.nodes['Principled BSDF']
        tc = node(nt, 'ShaderNodeTexCoord'); sp = node(nt, 'ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['Object'], sp.inputs[0])
        q = mth(nt, 'ADD', mth(nt, 'POWER', mth(nt, 'DIVIDE', sp.outputs['X'], VHX * U), 2.0),
                mth(nt, 'POWER', mth(nt, 'DIVIDE', sp.outputs['Z'], VHZ * U), 2.0))
        glow = maprange(nt, q, 0.0, 1.1, 1.0, 0.0)
        b.inputs['Emission Color'].default_value = (*c, 1)
        feed(nt, b.inputs['Emission Strength'], mth(nt, 'MULTIPLY', mth(nt, 'POWER', glow, 1.5), 0.16 * k))
        self.visor_mats[key] = m
        return m

    def set_antenna(self, ctrl, tip, led_m, droop=False):
        u = U
        for o in (self.ant, self.ant_ball):
            if o: bpy.data.objects.remove(o)
        b0 = self.ant_base
        pts = []
        for i in range(17):
            t = i / 16
            x = (1 - t) ** 2 * b0[0] + 2 * (1 - t) * t * ctrl[0] + t * t * tip[0]
            z = (1 - t) ** 2 * b0[1] + 2 * (1 - t) * t * ctrl[1] + t * t * tip[1]
            pts.append((x * u, 0, (z) * u))
        self.ant = tube('antenna', pts, 0.32 * u, self.silver, self.pivot)
        bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=24, v_segments=12, radius=1.25 * u)
        self.ant_ball = new_obj('antball', bm, led_m, parent=self.pivot); self.ant_ball.location = (tip[0] * u, 0, tip[1] * u)

    def pose(self, name, body_hex):
        e = BOT_EXPR[name]; u = U
        # body colour
        V_set_glaze(self.body_mat, body_hex)
        for k, objs in self.groups.items():
            for o in objs: o.hide_render = k != name
        self.helmet.hide_render = bool(e.get('dent')); self.helmet_dent.hide_render = not e.get('dent')
        self.shell.hide_render = bool(e.get('crack')); self.shell_cracked.hide_render = not e.get('crack')
        vm = self.visor_mat(e['led'], 1.4 if e['led'] in ('red',) else 1.0)
        for o in (self.visor, self.mouth):
            o.data.materials.clear(); o.data.materials.append(vm)
        for t in self.teeth: t.hide_render = e['mouth'] != 'grit'
        self.set_antenna(*e['ant'], self.ball_mats[e['led']])
        self.pivot.location = (0, 0, e.get('bob', 0) * u)
        self.pivot.rotation_euler = (0, math.radians(e.get('roll', 0)), 0)
        for (s, sh, claw, jaws), ang in zip(self.arms, e['arms']):
            sh.rotation_euler = (0, -s * math.radians(ang), 0)
            op = e.get('claw_open', 0.4)
            for j in jaws:
                j.rotation_euler = (0, s * j['k'] * math.radians(-12 - 26 * op), 0)
        for f, lift in zip(self.feet, e['feet']):
            f.location.z = (-8.15 + lift) * u
        for st in self.stars: st.hide_render = not e.get('stars')
        return e


def principled_bsdf(nt, color, rough, metal=0.0, coat=0.0, emit=None, emit_str=0.0):
    return V.principled(nt, color, rough, metal, coat, emit, emit_str)


def mixs(nt, fac, a, b):
    return V.mixs(nt, fac, a, b)


def V_set_glaze(m, hexc):
    """Recolour a material made by V.glaze_mat (its mottling ramp holds the colour)."""
    base = srgb(hexc)
    for n in m.node_tree.nodes:
        if n.type == 'VALTORGB':
            e = n.color_ramp.elements
            e[0].color = (*(c * 0.9 for c in base), 1); e[1].color = (*(min(1, c * 1.07) for c in base), 1)
        if n.type == 'BSDF_PRINCIPLED':
            n.inputs['Base Color'].default_value = (*base, 1)


# =============================================================================================== bricks
TEXPPU, SS = 24, 3
BW, BH = (CW - GAP) * U, (CH - GAP) * U     # brick body in metres (2.66 x 1.66)
BDEPTH = V.DEPTH


def crack_texture(key, dmg, corner, scale=2):
    """The Vault's crack generator, re-sized for 28 x 18 cells. R = crack, G = halo, B = height."""
    Wu, Hu = BW / U, BH / U
    k = TEXPPU * SS
    big = Image.new('L', (round(Wu * k), round(Hu * k)), 0); d = ImageDraw.Draw(big)
    P = lambda x, y: (x * k, y * k)

    def walk(rng, x, y, ang, length, width, depth=0):
        seg = 0.8; n = max(3, int(length / seg)); pts = [(x, y)]
        for i in range(n):
            ang += rng.gauss(0, 0.30)
            x += math.cos(ang) * seg; y += math.sin(ang) * seg
            pts.append((x, y))
            if not (-1 < x < Wu + 1 and -1 < y < Hu + 1): break
            if depth < 2 and i > 1 and rng.random() < 0.11:
                walk(rng, x, y, ang + rng.choice((-1, 1)) * rng.uniform(0.6, 1.1), length * (1 - i / n) * rng.uniform(0.35, 0.65), width * 0.6, depth + 1)
        for j in range(len(pts) - 1):
            t = j / (len(pts) - 1); wd = max(0.12, width * (1 - t) ** 0.7)
            d.line([P(*pts[j]), P(*pts[j + 1])], fill=255, width=max(1, round(wd * k)))
            r = wd * k / 2; cx, cy = P(*pts[j + 1]); d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=255)

    def from_edge(rng, length, width):
        e = rng.random()
        if e < 0.75:
            top = rng.random() < 0.5; x = rng.uniform(2.5, Wu - 2.5)
            walk(rng, x, 0.2 if top else Hu - 0.2, (math.pi / 2 if top else -math.pi / 2) + rng.uniform(-0.7, 0.7), length, width)
        else:
            left = rng.random() < 0.5
            walk(rng, 0.2 if left else Wu - 0.2, rng.uniform(3, Hu - 3), (0 if left else math.pi) + rng.uniform(-0.6, 0.6), length, width)

    w = scale
    r1 = random.Random(f'{key}-hairline')
    for i in range(1 + w):
        from_edge(r1, r1.uniform(6, 9 + 4 * w), r1.uniform(0.32, 0.42))
    if dmg >= 2:
        r2 = random.Random(f'{key}-shatter')
        sx, sz = corner
        cx, cy = (Wu if sx > 0 else 0), (0 if sz > 0 else Hu)
        base_ang = math.atan2((Hu / 2 - cy), (Wu / 2 - cx))
        for i in range(3 + w):
            a = base_ang + (i - (2 + w) / 2) * 0.42 + r2.uniform(-0.15, 0.15)
            walk(r2, cx + math.cos(a) * 4.2, cy + math.sin(a) * 4.2, a, r2.uniform(7, 12 + 6 * w), r2.uniform(0.5, 0.65))
        from_edge(r2, r2.uniform(8, 10 + 5 * w), 0.45)
    size = (round(Wu * TEXPPU), round(Hu * TEXPPU))
    R = big.resize(size, Image.LANCZOS)
    halo = ImageChops.subtract(R.filter(ImageFilter.GaussianBlur(TEXPPU * 0.9)).point(lambda v: min(255, v * 3)), R)
    Hh = R.filter(ImageFilter.GaussianBlur(TEXPPU * 0.28)).point(lambda v: min(255, v * 1.6))
    path = os.path.join(TMP, f'crack_{key}_{dmg}.png')
    Image.merge('RGB', (R, halo, Hh)).save(path)
    return path


def chip(o, rng, corner, W, H, bis, depth=BDEPTH):
    """The Vault's chipped corner: three tumbled cubes boolean-cut out of the front corner."""
    cx, _, cz = at(); cut = []
    ox, oz = cx + corner[0] * W / 2, cz + corner[1] * H / 2
    for k in range(3):
        s = rng.uniform(0.6, 0.75) * (1 if k == 0 else 0.7)
        bpy.ops.mesh.primitive_cube_add(size=s, location=(ox - corner[0] * rng.uniform(0.0, 0.22) * k,
                                                          -depth + rng.uniform(-0.05, 0.08),
                                                          oz - corner[1] * rng.uniform(0.0, 0.18) * (2 - k)),
                                        rotation=(rng.uniform(0, 3), rng.uniform(0, 3), rng.uniform(0, 3)))
        c = bpy.context.object; c.data.materials.append(bis); cut.append(c)
    for c in cut:
        bpy.context.view_layer.objects.active = o
        md = o.modifiers.new('chip', 'BOOLEAN'); md.operation = 'DIFFERENCE'; md.object = c; md.solver = 'EXACT'
        md.material_mode = 'TRANSFER'
        bpy.ops.object.modifier_apply(modifier='chip')
    for c in cut: bpy.data.objects.remove(c)
    bpy.context.view_layer.objects.active = o; o.select_set(True)
    bpy.ops.object.shade_smooth_by_angle(angle=math.radians(35))


def build_candy(ci, dmg):
    hexc = ROW_COLORS[ci]
    rng = random.Random(f'c{ci}-chip')
    corner = (rng.choice((-1, 1)), rng.choice((-1, 1)))
    crack = crack_texture(f'c{ci}', dmg, corner) if dmg else None
    m = V.glaze_mat(f'glaze_c{ci}{dmg}', hexc, ci * 7 + 3, crack, (BW, BH), gloss=True)
    o = box(f'brick_c_{ci}_{dmg}', BW, BH, BDEPTH, 0.3, m, at(y=-BDEPTH / 2), segs=8, local=True)
    if dmg >= 2:
        chip(o, rng, corner, BW, BH, V.biscuit_mat(f'biscuit_c{ci}', hexc))
    return [o, V.gloss_card(f'card_c{ci}{dmg}', BW, BH, -BDEPTH)]


def armor_texture(dmg):
    """R = crack, G = bright scratches, B = dent height (white = pushed in)."""
    Wu, Hu = BW / U, BH / U; k = 24
    Wp, Hp = round(Wu * k), round(Hu * k)
    rng = random.Random(f'armor{dmg}')
    crack = Image.open(crack_texture('armor', 1 if dmg == 1 else 2, (1, -1), scale=0 if dmg == 1 else 1)).convert('RGB').split()[0]
    crack = crack.resize((Wp, Hp), Image.LANCZOS)
    if dmg == 1: crack = crack.point(lambda v: v * 0.8)
    scr = Image.new('L', (Wp, Hp), 0); d = ImageDraw.Draw(scr)
    for i in range(4 if dmg == 1 else 8):
        x, y = rng.uniform(3, Wu - 3), rng.uniform(3, Hu - 3); a = rng.uniform(-0.6, 0.6) + (0 if rng.random() < 0.6 else 1.2)
        L = rng.uniform(3, 7)
        d.line([(x * k, y * k), ((x + math.cos(a) * L) * k, (y + math.sin(a) * L) * k)], fill=rng.randint(150, 255), width=max(1, int(0.18 * k)))
    scr = scr.filter(ImageFilter.GaussianBlur(0.6))
    yy, xx = [list(range(Hp)), list(range(Wp))]
    import numpy as np
    Y, X = np.mgrid[0:Hp, 0:Wp].astype(np.float32) / k
    dent = np.zeros((Hp, Wp), np.float32)
    spots = [(8.0, 6.0, 2.6, 0.9), (19.5, 11.5, 2.2, 0.7)] if dmg == 1 else \
            [(7.5, 6.0, 3.2, 1.0), (19.0, 11.0, 2.8, 1.0), (14.0, 4.0, 2.0, 0.8), (22.5, 4.5, 1.8, 0.7)]
    for (dx, dy, r, a) in spots:
        dent += a * np.exp(-((X - dx) ** 2 + (Y - dy) ** 2) / (2 * r * r))
    B = Image.fromarray(np.clip(dent * 255, 0, 255).astype(np.uint8), 'L')
    path = os.path.join(TMP, f'armor_{dmg}.png')
    Image.merge('RGB', (crack, scr, B)).save(path)
    return path


def armor_mat(name, tex=None):
    m = mat(name, srgb(ARMOR), rough=0.34, metal=0.28, coat=0.6, coat_rough=0.06); nt = m.node_tree; b = nt.nodes['Principled BSDF']
    tc = node(nt, 'ShaderNodeTexCoord')
    # brushed grain + faint mottling
    mp = node(nt, 'ShaderNodeMapping'); mp.inputs['Scale'].default_value = (1, 30, 30); nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])
    nz = node(nt, 'ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 4.0; nz.inputs['Detail'].default_value = 6
    nt.links.new(mp.outputs['Vector'], nz.inputs['Vector'])
    nz2 = node(nt, 'ShaderNodeTexNoise'); nz2.inputs['Scale'].default_value = 1.2; nz2.inputs['Detail'].default_value = 3
    nt.links.new(tc.outputs['Object'], nz2.inputs['Vector'])
    base = srgb(ARMOR)
    col = mixc(nt, maprange(nt, nz2.outputs['Fac'], 0.35, 0.65), tuple(c * 0.82 for c in base), tuple(min(1, c * 1.06) for c in base))
    rough = maprange(nt, nz.outputs['Fac'], 0.3, 0.7, 0.26, 0.4)
    height = None
    if tex:
        mp2 = node(nt, 'ShaderNodeMapping', vector_type='POINT')
        mp2.inputs['Scale'].default_value = (1 / BW, 1, 1 / BH); mp2.inputs['Location'].default_value = (0.5, 0, 0.5)
        nt.links.new(tc.outputs['Object'], mp2.inputs['Vector'])
        sep = node(nt, 'ShaderNodeSeparateXYZ'); cmb = node(nt, 'ShaderNodeCombineXYZ')
        nt.links.new(mp2.outputs['Vector'], sep.inputs['Vector'])
        nt.links.new(sep.outputs['X'], cmb.inputs['X']); nt.links.new(sep.outputs['Z'], cmb.inputs['Y'])
        im = node(nt, 'ShaderNodeTexImage', extension='EXTEND', interpolation='Cubic')
        im.image = bpy.data.images.load(tex); im.image.colorspace_settings.name = 'Non-Color'
        nt.links.new(cmb.outputs['Vector'], im.inputs['Vector'])
        sc_ = node(nt, 'ShaderNodeSeparateColor'); nt.links.new(im.outputs['Color'], sc_.inputs['Color'])
        cr, scr, dent = sc_.outputs[0], sc_.outputs[1], sc_.outputs[2]
        col = mixc(nt, mth(nt, 'MULTIPLY', scr, 0.7), col, (0.9, 0.92, 1.0))
        col = mixc(nt, mth(nt, 'MULTIPLY', dent, 0.35), col, tuple(c * 0.55 for c in base))
        col = mixc(nt, cr, col, (0.01, 0.01, 0.015))
        rough = mixc(nt, cr, rough, (0.8, 0.8, 0.8))
        feed(nt, b.inputs['Coat Weight'], mth(nt, 'SUBTRACT', 0.55, cr, clamp=True))
        height = mth(nt, 'ADD', mth(nt, 'MULTIPLY', dent, -1.0), mth(nt, 'MULTIPLY', cr, -0.6))
    nt.links.new(col, b.inputs['Base Color'])
    feed(nt, b.inputs['Roughness'], rough if not isinstance(rough, bpy.types.NodeSocket) or rough.type == 'VALUE' else
         node_val(nt, rough))
    if height is not None:
        bp = node(nt, 'ShaderNodeBump'); bp.inputs['Strength'].default_value = 1.0; bp.inputs['Distance'].default_value = 0.22
        nt.links.new(height, bp.inputs['Height'])
        nt.links.new(bp.outputs['Normal'], b.inputs['Normal']); nt.links.new(bp.outputs['Normal'], b.inputs['Coat Normal'])
    return m


def node_val(nt, rgba):
    sc_ = node(nt, 'ShaderNodeSeparateColor'); nt.links.new(rgba, sc_.inputs['Color']); return sc_.outputs[0]


def build_armor(dmg):
    tex = armor_texture(dmg) if dmg else None
    M = armor_mat(f'armor{dmg}', tex)
    o = box(f'armor_{dmg}', BW, BH, BDEPTH + 0.1, 0.16, M, at(y=-(BDEPTH + 0.1) / 2), segs=5, local=True)
    objs = [o]
    rng = random.Random(f'armor-chip{dmg}')
    if dmg >= 2:
        chip(o, rng, (1, -1), BW, BH, mat('armorcore', srgb('#666e8c'), rough=0.55, metal=0.5), depth=BDEPTH + 0.1)
    # raised centre ridge plate
    ridge = box('ridge', BW - 0.75, BH - 0.72, 0.16, 0.06, M, at(y=-(BDEPTH + 0.1) - 0.04), segs=3, local=True)
    objs.append(ridge)
    rv = mat('armorrivet', srgb('#c9d0e4'), rough=0.22, metal=1.0, coat=0.4)
    hole = mat('armorhole', srgb('#0b0c12'), rough=0.8)
    spots = [(-1, -1), (-1, 1), (1, -1), (1, 1), (0, 1), (0, -1)]
    for i, (sx, sz) in enumerate(spots):
        x = sx * (BW / 2 - 0.2); z = sz * (BH / 2 - 0.2)
        if dmg >= 2 and (sx, sz) == (1, -1): continue          # under the chip
        if dmg >= 2 and (sx, sz) == (-1, 1):                    # popped rivet: an empty hole
            objs.append(cyl(0.085, 0.05, at(x, z, -(BDEPTH + 0.1) - 0.005), hole, rot=(math.radians(90), 0, 0), verts=16)); continue
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.1, segments=20, ring_count=10, location=at(x, z, -(BDEPTH + 0.1)))
        r = bpy.context.object; r.scale = (1, 0.6, 1); bpy.ops.object.shade_smooth(); r.data.materials.append(rv); objs.append(r)
    objs.append(V.gloss_card(f'card_a{dmg}', BW, BH, -(BDEPTH + 0.1), strength=6.0, sheen=0.07))
    return objs


def build_power():
    gold = mat('powergold', srgb(POWER), rough=0.26, metal=0.4, coat=1.0, coat_rough=0.03)
    o = box('power', BW, BH, BDEPTH, 0.14, gold, at(y=-BDEPTH / 2), segs=6, local=True)
    inner = box('powerinner', BW - 0.5, BH - 0.45, 0.14, 0.05, mat('powergold2', srgb('#e8ae2c'), rough=0.3, metal=0.6, coat=1.0, coat_rough=0.03),
                at(y=-BDEPTH - 0.02), segs=3, local=True)
    objs = [o, inner]
    # faceted gem: table + crown facets toward the camera, pavilion behind
    gem = mat('gem', srgb('#00b4f0'), rough=0.0, coat=1.0, emit=srgb('#00a8ff'), emit_str=0.5)
    b = gem.node_tree.nodes['Principled BSDF']; b.inputs['Transmission Weight'].default_value = 0.25; b.inputs['IOR'].default_value = 2.0
    r = 0.52
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=8, radius1=r, radius2=r * 0.58, depth=0.2)       # crown (top = table)
    for v in bm.verts: v.co.z += 0.1
    bm2 = bmesh.new(); bmesh.ops.create_cone(bm2, cap_ends=True, segments=8, radius1=0.02, radius2=r, depth=0.3)   # pavilion
    me2 = bpy.data.meshes.new('pav'); bm2.to_mesh(me2); bm2.free()
    for v in me2.vertices: v.co.z -= 0.15
    bm.from_mesh(me2)
    g = new_obj('gem', bm, gem, smooth=False)
    g.rotation_euler = (math.radians(-90), 0, math.radians(22.5)); g.location = at(y=-BDEPTH - 0.2); g.scale = (1.0, 1.0, 1.0)
    objs.append(g)
    bpy.ops.mesh.primitive_torus_add(major_radius=r + 0.04, minor_radius=0.06, location=at(y=-BDEPTH - 0.1), rotation=(math.radians(90), 0, 0),
                                     major_segments=48)
    t = bpy.context.object; bpy.ops.object.shade_smooth(); t.data.materials.append(gold); objs.append(t)
    # four tiny prongs
    for a in range(4):
        ang = math.pi / 4 + a * math.pi / 2
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.07, segments=12, ring_count=6, location=at(math.cos(ang) * (r + 0.02), math.sin(ang) * (r + 0.02), -BDEPTH - 0.24))
        pp = bpy.context.object; bpy.ops.object.shade_smooth(); pp.data.materials.append(gold); objs.append(pp)
    objs.append(V.gloss_card('card_p', BW, BH, -BDEPTH, strength=4.0, sheen=0.05))
    return objs


# =============================================================================================== bolt & bomb
def plasma_mat(name, strength=10):
    """Magenta plasma: white-pink core, magenta rim fading out."""
    m = bpy.data.materials.new(name); nt = m.node_tree; nt.nodes.remove(nt.nodes['Principled BSDF'])
    lw = node(nt, 'ShaderNodeLayerWeight'); lw.inputs['Blend'].default_value = 0.5
    edge = lw.outputs['Facing']
    col = mixc(nt, maprange(nt, edge, 0.05, 0.5), (1.0, 0.7, 0.95), srgb('#ff22c8'))
    em = node(nt, 'ShaderNodeEmission'); nt.links.new(col, em.inputs['Color'])
    feed(nt, em.inputs['Strength'], maprange(nt, edge, 0.2, 1.0, strength, strength * 0.4))
    tr = node(nt, 'ShaderNodeBsdfTransparent'); ms = node(nt, 'ShaderNodeMixShader')
    nt.links.new(maprange(nt, edge, 0.6, 1.0), ms.inputs[0]); nt.links.new(em.outputs[0], ms.inputs[1]); nt.links.new(tr.outputs[0], ms.inputs[2])
    nt.links.new(ms.outputs[0], nt.nodes['Material Output'].inputs['Surface'])
    return m


def build_bolt():
    m = plasma_mat('plasma', 3.2)
    o = V.flame('bolt', at(0, -0.12, -BDEPTH - 0.5), 0.36, m)    # teardrop: round head at the bottom, tail up
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.15, segments=24, ring_count=12, location=at(0, -0.1, -BDEPTH - 0.9))
    c = bpy.context.object; c.scale = (1, 1, 1.8); bpy.ops.object.shade_smooth(); c.data.materials.append(emission('boltcore', (1, 0.7, 0.95), 5))
    return [o, c]


def build_bomb():
    u = U; objs = []
    shell = mat('bombshell', srgb('#7a5cc0'), rough=0.22, metal=0.3, coat=1.0, coat_rough=0.02)
    band = mat('bombband', srgb('#ff5d8f'), rough=0.25, coat=1.0, sss=0.1)
    c0 = at(0, -1.0 * u, -BDEPTH - 0.6)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=5.6 * u, segments=64, ring_count=32, location=c0)
    b = bpy.context.object; bpy.ops.object.shade_smooth(); b.data.materials.append(shell); objs.append(b)
    bpy.ops.mesh.primitive_torus_add(major_radius=5.6 * u, minor_radius=0.75 * u, location=c0, rotation=(math.radians(12), 0, 0), major_segments=64, minor_segments=16)
    t = bpy.context.object; bpy.ops.object.shade_smooth(); t.data.materials.append(band); objs.append(t)
    # tail fins (up: it falls down)
    fin = mat('bombfin', srgb('#8d97b3'), rough=0.3, metal=0.8, coat=0.5)
    for a in (-1, 1):
        o = box('fin', 2.6 * u, 3.8 * u, 0.6 * u, 0.2 * u, fin, (c0[0] + a * 2.3 * u, c0[1], c0[2] + 5.6 * u), segs=3, local=True)
        o.rotation_euler = (0, math.radians(a * 32), 0); objs.append(o)
    objs.append(cyl(1.6 * u, 1.4 * u, (c0[0], c0[1], c0[2] + 5.3 * u), fin, verts=32))
    # glowing fuse light on the nose side
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.25 * u, segments=24, ring_count=12, location=(c0[0] - 1.6 * u, c0[1] - 5.0 * u, c0[2] - 1.4 * u))
    l = bpy.context.object; bpy.ops.object.shade_smooth(); l.data.materials.append(mat('bomblight', srgb('#ff4fb0'), rough=0.1, coat=1, emit=srgb('#ff3fa0'), emit_str=6)); objs.append(l)
    return objs


# =============================================================================================== mothership
SHIP_SIZE = (108, 64)          # sprite, game units (ship ~90 x 34, plus lights and the under-glow)
SHIP_TILT = -4                 # degrees the saucer is tipped toward the camera so the top and the dome read
SHIP_DZ = -5.0                 # model offset so the hull's visual middle sits on the sprite centre
RH = 6.8                       # pilot head radius (units)
HEAD_Z = 17.0
DOME_R, DOME_Z = 14.6, 9.4
BULB_COLORS = ['#3fe8ff', '#ff5d8f', '#b6ff5a', '#c46bf0']
N_BULBS = 14


def alien_eye_mat(name):
    """Snake-style painted eyeball: hot pink iris, big round pupil, spiral option (value nodes 'pw', 'spiral')."""
    m = mat(name, srgb('#fffaf2'), rough=0.06, coat=1.0); nt = m.node_tree; b = nt.nodes['Principled BSDF']; N = nt.nodes; L = nt.links.new
    def M(op, a, bb=None):
        n = N.new('ShaderNodeMath'); n.operation = op
        for i, v in enumerate((a, bb)):
            if v is None: continue
            if isinstance(v, (int, float)): n.inputs[i].default_value = v
            else: L(v, n.inputs[i])
        return n.outputs[0]
    def Vn(nm, v):
        n = N.new('ShaderNodeValue'); n.name = nm; n.outputs[0].default_value = v; return n.outputs[0]
    tc = N.new('ShaderNodeTexCoord'); sp = N.new('ShaderNodeSeparateXYZ'); L(tc.outputs['Object'], sp.inputs[0])
    x, y, z = sp.outputs['X'], sp.outputs['Y'], sp.outputs['Z']
    r = M('SQRT', M('ADD', M('MULTIPLY', x, x), M('MULTIPLY', y, y)))
    front = M('GREATER_THAN', z, 0.0)
    pw, spf, ir = Vn('pw', 0.36), Vn('spiral', 0.0), Vn('ir', 0.62)
    iris = M('MULTIPLY', M('LESS_THAN', r, ir), front)
    pupil = M('MULTIPLY', M('LESS_THAN', r, pw), iris)
    ramp = N.new('ShaderNodeValToRGB'); e = ramp.color_ramp.elements
    e[0].position, e[0].color = 0.0, (*srgb('#ffb3e0'), 1); e[1].position, e[1].color = 0.7, (*srgb('#e8308f'), 1)
    ring = e.new(0.92); ring.color = (*srgb('#5a0b4a'), 1)
    L(M('DIVIDE', r, ir), ramp.inputs['Fac'])
    ang = M('DIVIDE', M('ARCTAN2', y, x), 6.2832)
    spiral = M('MULTIPLY', M('LESS_THAN', M('FRACT', M('ADD', ang, M('MULTIPLY', r, 2.4))), 0.45), M('MULTIPLY', front, M('LESS_THAN', r, 0.86)))
    def mix(fac, a, bb):
        n = N.new('ShaderNodeMix'); n.data_type = 'RGBA'; L(fac, n.inputs[0])
        for sk, v in ((n.inputs[6], a), (n.inputs[7], bb)):
            if isinstance(v, tuple): sk.default_value = v
            else: L(v, sk)
        return n.outputs[2]
    no_sp = M('SUBTRACT', 1.0, spf)
    c1 = mix(M('MULTIPLY', iris, no_sp), (*srgb('#fffaf2'), 1), ramp.outputs['Color'])
    c2 = mix(M('MULTIPLY', pupil, no_sp), c1, (0.006, 0.003, 0.012, 1))
    c3 = mix(M('MULTIPLY', spiral, spf), c2, (*srgb('#3a0f6a'), 1))
    L(c3, b.inputs['Base Color'])
    em = mix(M('MULTIPLY', M('SUBTRACT', iris, pupil), no_sp), (0, 0, 0, 1), ramp.outputs['Color'])
    L(em, b.inputs['Emission Color']); b.inputs['Emission Strength'].default_value = 0.3
    return m


class AlienEye:
    def __init__(self, side, parent, skin, lidline, eye_m, shine_m, brow_m):
        u = U; R = 3.0; self.R = R; self.side = side
        piv = empty('aeye', (side * 3.0 * u, -(RH - 1.5) * u, 1.6 * u), parent)
        out = Vector((side * 0.32, -1.0, 0.12)).normalized(); up = Vector((0, 0, 1)); up = (up - out * up.dot(out)).normalized()
        xa = up.cross(out); piv.rotation_euler = Matrix((xa, up, out)).transposed().to_euler()
        self.piv = piv
        bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=48, v_segments=24, radius=1.0)   # unit sphere: shader coords in radii
        self.ball = new_obj('aball', bm, eye_m, parent=piv); self.ball.scale = (R * u,) * 3
        self.shines = []
        for (sx, sy, sr) in ((-0.34, 0.38, 0.2), (0.3, -0.3, 0.08)):
            bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=12, v_segments=6, radius=1)
            o = new_obj('ashine', bm, shine_m, parent=piv); o.location = (sx * R * u, sy * R * u, 0.98 * R * u); o.scale = (sr * R * u, sr * R * u, 0.05 * R * u)
            self.shines.append(o)
        self.lids = []
        for s in (1, -1):
            bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=48, v_segments=24, radius=R * 1.08 * u)
            bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.y * s < -1e-5], context='VERTS')
            lid = new_obj('alid', bm, skin, parent=piv); lid.data.materials.append(lidline)
            so = lid.modifiers.new('so', 'SOLIDIFY'); so.thickness = 0.14 * R * u; so.material_offset_rim = 1; so.use_rim = True
            lid['s'] = s; self.lids.append(lid)
        # brow: short thick arc
        pts = [((-1.7 + 3.4 * i / 10) * u, 0, (0.5 * math.sin(math.pi * i / 10)) * u) for i in range(11)]
        self.brow = tube('abrow', pts, 0.45 * u, brow_m, parent)
        self.brow_base = Vector((side * 3.2 * u, -(RH - 1.2) * u, (1.6 + R + 0.45) * u))

    def set(self, top=0.0, bot=0.0, look=(0, 0), pupil=1.0, brow=0.0, raise_=0.0, spiral=False):
        for lid in self.lids:
            s = lid['s']; amt = top if s > 0 else bot
            h = max(-1.0, min(1.0, 1 - amt))
            lid.rotation_euler = (-s * (math.asin(h) + math.radians(18) * h), 0, 0)
        lx, ly = look
        self.ball.rotation_euler = (math.radians(-ly * 28), math.radians(lx * 28), 0)
        nt = self.ball.data.materials[0].node_tree.nodes
        nt['pw'].outputs[0].default_value = 0.36 * pupil
        nt['spiral'].outputs[0].default_value = 1.0 if spiral else 0.0
        for o in self.shines: o.hide_render = top + bot > 1.4
        # brow: positive = inner end down (anger); negative = inner end up (worry)
        self.brow.location = self.brow_base + Vector((0, 0, raise_ * 1.2 * U))
        self.brow.rotation_euler = (0, math.radians(-self.side * brow), 0)


SHIP_EXPR = {
    'smug':  dict(eye=dict(top=0.8, bot=0.22, look=(0.15, -0.3), brow=4, raise_=-0.35), eye_r=dict(top=0.6, bot=0.2, look=(0.15, -0.3), brow=-16, raise_=0.35),
                  mouth='smirk', ant=(-14, 14)),
    'angry': dict(eye=dict(top=0.62, bot=0.32, look=(0, -0.3), pupil=0.85, brow=38, raise_=-0.75), mouth='grit', ant=(-34, 34), fire=True),
    'hurt':  dict(eye=dict(top=1.08, bot=1.0, brow=-26, raise_=0.2), mouth='wince', ant=(-50, 22), flash=True),
    'panic': dict(eye=dict(top=0.0, bot=0.0, pupil=0.55, brow=-30, raise_=0.9, look=(0.15, 0.1)), mouth='o', ant=(-8, 8), sweat=True, crack=True, smoke=True),
    'dizzy': dict(eye=dict(top=0.18, bot=0.08, brow=-14, raise_=0.4, spiral=True), mouth='tongue', ant=(-62, 70), stars=True, crack=True,
                  smoke=True, dead=True, roll=-11),
}


def lathe(name, prof, m, segs=96, parent=None):
    """Surface of revolution about z from a (r, z) profile in game units."""
    bm = bmesh.new()
    rings = []
    for (r, z) in prof:
        ring = [bm.verts.new((r * U * math.cos(a), r * U * math.sin(a), z * U)) for a in [i / segs * math.tau for i in range(segs)]]
        rings.append(ring)
    for r0, r1 in zip(rings, rings[1:]):
        for i in range(segs):
            j = (i + 1) % segs
            try: bm.faces.new((r0[i], r0[j], r1[j], r1[i]))
            except ValueError: pass
    bmesh.ops.remove_doubles(bm, verts=bm.verts[:], dist=1e-6)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    o = new_obj(name, bm, m, parent=parent)
    return o


def hull_mat(name, hexc, rough=0.22, metal=0.0, coat=1.0, grooves=12, ring_r=None):
    """Glossy hull with radial panel grooves (and optionally one concentric groove)."""
    m = mat(name, srgb(hexc), rough=rough, metal=metal, coat=coat, coat_rough=0.03); nt = m.node_tree; b = nt.nodes['Principled BSDF']
    tc = node(nt, 'ShaderNodeTexCoord'); sp = node(nt, 'ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['Object'], sp.inputs[0])
    ang = mth(nt, 'ARCTAN2', sp.outputs['Y'], sp.outputs['X'])
    f = mth(nt, 'ABSOLUTE', mth(nt, 'SUBTRACT', mth(nt, 'FRACT', mth(nt, 'MULTIPLY', ang, grooves / math.tau)), 0.5))
    rr = mth(nt, 'SQRT', mth(nt, 'ADD', mth(nt, 'MULTIPLY', sp.outputs['X'], sp.outputs['X']), mth(nt, 'MULTIPLY', sp.outputs['Y'], sp.outputs['Y'])))
    # groove width constant in metres: angular half-width = w / r
    g = maprange(nt, mth(nt, 'MULTIPLY', mth(nt, 'MULTIPLY', mth(nt, 'SUBTRACT', 0.5, f), math.tau / grooves), rr), 0.012, 0.03, 1, 0)
    if ring_r:
        g = mth(nt, 'MAXIMUM', g, maprange(nt, mth(nt, 'ABSOLUTE', mth(nt, 'SUBTRACT', rr, ring_r * U)), 0.012, 0.03, 1, 0))
    base = srgb(hexc)
    nt.links.new(mixc(nt, mth(nt, 'MULTIPLY', g, 0.7), base, tuple(c * 0.35 for c in base)), b.inputs['Base Color'])
    bp = node(nt, 'ShaderNodeBump'); bp.inputs['Strength'].default_value = 0.5; bp.inputs['Distance'].default_value = 0.02
    nt.links.new(mth(nt, 'MULTIPLY', g, -1.0), bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    return m


def dome_glass(name, crack=False):
    m = principled_mix_glass(name, tint=(0.82, 0.95, 1.0), refl=0.8, base=0.04, rough=0.09)
    if not crack: return m
    k = 60; Wd = 26
    im = Image.new('L', (Wd * k // 4 * 2, Wd * k // 4 * 2), 0); d = ImageDraw.Draw(im)
    rng = random.Random('domecrack'); ox, oy = im.size[0] * 0.86, im.size[1] * 0.42
    for i in range(5):
        a = rng.uniform(0, math.tau); x, y = ox, oy; L = rng.uniform(2.5, 5.0) * k / 4
        pts = [(x, y)]
        for j in range(7):
            a += rng.gauss(0, 0.3); x += math.cos(a) * L / 7; y += math.sin(a) * L / 7; pts.append((x, y))
        d.line(pts, fill=255, width=3)
    pts = [(ox + math.cos(a) * 18 * rng.uniform(0.8, 1.2), oy + math.sin(a) * 18 * rng.uniform(0.8, 1.2)) for a in [j * 0.5 for j in range(14)]]
    d.line(pts, fill=230, width=3)
    im = im.filter(ImageFilter.GaussianBlur(1.0)); path = os.path.join(TMP, 'dome_crack.png'); im.save(path)
    nt = m.node_tree; out = nt.nodes['Material Output']; prev = out.inputs['Surface'].links[0].from_socket
    tc = node(nt, 'ShaderNodeTexCoord'); mp = node(nt, 'ShaderNodeMapping')
    mp.inputs['Scale'].default_value = (1 / (Wd * U), 1, 1 / (Wd * U)); mp.inputs['Location'].default_value = (0.5, 0, 0.5)
    nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])
    sp = node(nt, 'ShaderNodeSeparateXYZ'); cb = node(nt, 'ShaderNodeCombineXYZ'); nt.links.new(mp.outputs['Vector'], sp.inputs[0])
    nt.links.new(sp.outputs['X'], cb.inputs['X']); nt.links.new(sp.outputs['Z'], cb.inputs['Y'])
    imn = node(nt, 'ShaderNodeTexImage', extension='CLIP'); imn.image = bpy.data.images.load(path); imn.image.colorspace_settings.name = 'Non-Color'
    nt.links.new(cb.outputs['Vector'], imn.inputs['Vector'])
    # only on the front half of the dome
    front = maprange(nt, sp.outputs['Y'], 0.5, 0.45, 0, 1, smooth=False)
    cr = principled_bsdf(nt, (0.9, 0.95, 1.0), 0.25, emit=(0.7, 0.85, 1.0), emit_str=0.4)
    nt.links.new(mixs(nt, mth(nt, 'MULTIPLY', imn.outputs['Color'], front), prev, cr), out.inputs['Surface'])
    return m


class Mothership:
    def __init__(self):
        u = U
        self.root = empty('ship_root', at(0, SHIP_DZ * u, -2.0))
        self.root.rotation_euler = (math.radians(SHIP_TILT), 0, 0)
        R = self.root
        upper = hull_mat('upperhull', '#e4e6f6', rough=0.2, grooves=12, ring_r=30)
        lower = hull_mat('lowerhull', '#6b70a8', rough=0.26, metal=0.35, grooves=16, ring_r=24)
        band = mat('rimband', srgb('#ff5d8f'), rough=0.24, coat=1.0, coat_rough=0.02, sss=0.12)
        silver = mat('shipsilver', srgb('#b9c1db'), rough=0.2, metal=0.7, coat=0.8)
        dark = mat('shipdark', srgb('#1b1f33'), rough=0.3, metal=0.5, coat=0.6)
        lathe('lower', [(0, -10.5), (5, -10.4), (9, -9.7), (14, -8.3), (22, -6.3), (30, -4.3), (37, -2.5), (42, -0.9), (44.6, 0.4)], lower, parent=R)
        lathe('upper', [(44.6, 0.4), (43.8, 2.0), (41, 3.5), (35, 5.4), (28, 7.1), (21, 8.4), (17, 9.1), (15.2, 9.4), (0, 9.4)], upper, parent=R)
        bm = bmesh.new(); bmesh.ops.create_circle(bm, cap_ends=False, segments=96, radius=1)
        tor = bpy.ops.mesh.primitive_torus_add(major_radius=44.2 * u, minor_radius=1.7 * u, major_segments=128, minor_segments=20)
        t = bpy.context.object; bpy.ops.object.shade_smooth(); t.data.materials.append(band); t.parent = R; t.location = (0, 0, 0.55 * u)
        t.scale = (1, 1, 0.9)
        bpy.ops.mesh.primitive_torus_add(major_radius=(DOME_R + 0.4) * u, minor_radius=1.2 * u, major_segments=96, minor_segments=16)
        t = bpy.context.object; bpy.ops.object.shade_smooth(); t.data.materials.append(silver); t.parent = R; t.location = (0, 0, (DOME_Z + 0.2) * u)
        # under-glow emitter + tiny portholes on the lower hull
        self.glow_m = emission('underglow', srgb('#5ff4ff'), 6.0)
        bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=48, v_segments=16, radius=1)
        g = new_obj('emitter', bm, self.glow_m, parent=R); g.location = (0, 0, -10.3 * u); g.scale = (7.0 * u, 7.0 * u, 1.1 * u)
        lathe('emitring', [(8.6, -9.4), (8.8, -10.4), (7.6, -11.0), (7.0, -10.6)], silver, parent=R)
        self.port_m = emission('porthole', srgb('#9ff7ff'), 2.2)
        self.ports = []
        for k in range(7):
            a = math.radians(-90 + (k - 3) * 19)
            x, y = 31.0 * math.cos(a), 31.0 * math.sin(a)
            bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=20, v_segments=10, radius=1)
            o = new_obj('port', bm, self.port_m, parent=R); o.location = (x * u, y * u, -3.7 * u); o.scale = (1.5 * u, 1.5 * u, 1.3 * u)
            o.rotation_euler = (0, 0, a); self.ports.append(o)
            bpy.ops.mesh.primitive_torus_add(major_radius=1.55 * u, minor_radius=0.4 * u, major_segments=24, minor_segments=8)
            rr = bpy.context.object; bpy.ops.object.shade_smooth(); rr.data.materials.append(silver); rr.parent = R
            rr.location = (x * 1.02 * u, y * 1.02 * u, -3.75 * u); rr.rotation_euler = (math.radians(90) - math.radians(16), 0, a + math.radians(90))
        # rim bulbs
        self.bulbs = []; self.bulb_on = {}; self.bulb_dim = {}
        for i in range(N_BULBS):
            a = i / N_BULBS * math.tau + math.radians(90 + 360 / N_BULBS / 2)
            hexc = BULB_COLORS[i % len(BULB_COLORS)]
            if hexc not in self.bulb_on:
                self.bulb_on[hexc] = emission('bulbon' + hexc, srgb(hexc), 7.0)
                self.bulb_dim[hexc] = mat('bulbdim' + hexc, srgb(hexc), rough=0.1, coat=1.0, emit=srgb(hexc), emit_str=1.4)
            bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=20, v_segments=10, radius=1.65 * u)
            o = new_obj('bulb', bm, self.bulb_dim[hexc], parent=R); o.location = (45.7 * u * math.cos(a), 45.7 * u * math.sin(a), 0.55 * u)
            o['hex'] = hexc; o['i'] = i; self.bulbs.append(o)
        self.bulb_off = mat('bulboff', srgb('#3a3550'), rough=0.15, coat=1.0)
        # dome
        for nm, gm in (('dome', dome_glass('domeglass')), ('domecr', dome_glass('domeglass_cr', crack=True))):
            bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=64, v_segments=32, radius=DOME_R * u)
            bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < -1e-5], context='VERTS')
            o = new_obj(nm, bm, gm, parent=R); o.location = (0, 0, DOME_Z * u); o.scale = (1, 1, 1.2)
            setattr(self, 'dome' if nm == 'dome' else 'dome_cr', o)
        # cockpit floor seen through the glass
        cyl(DOME_R * u, 0.4 * u, (0, 0, (DOME_Z + 0.1) * u), dark, verts=64).parent = R
        self.pilot()
        # ship-only lights: a soft lavender fill from below (the underside faces the player) and a cyan console glow
        # that lights the pilot's face from under the dome rim
        bx, by, bz = at(0, (SHIP_DZ - 30) * u, -8.0)
        bpy.ops.object.light_add(type='AREA', location=(bx, by, bz), rotation=(math.radians(-150), 0, 0))
        bpy.context.object.visible_camera = False
        L = bpy.context.object.data; L.energy = 1100; L.size = 12; L.color = (0.85, 0.7, 1.0)
        bpy.ops.object.light_add(type='POINT', location=(0, -(DOME_R - 4) * u, (DOME_Z + 1.5) * u))
        pl = bpy.context.object; pl.parent = R; pl.data.energy = 18; pl.data.color = (0.5, 0.95, 1.0); pl.data.shadow_soft_size = 0.3
        # smoke puffs + stars
        self.smoke = []
        self.stars = []
        star_m = mat('shipstar', srgb('#ffe27a'), rough=0.2, emit=srgb('#ffd34a'), emit_str=2.0)
        for i in range(3):
            bm = bmesh.new(); pts = []
            for k in range(10):
                r = (1.0 if k % 2 == 0 else 0.45) * 2.0 * u; a = k / 10 * math.tau + math.pi / 2
                pts.append(bm.verts.new((math.cos(a) * r, 0, math.sin(a) * r)))
            bm.faces.new(pts); bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=0.6 * u)
            st = new_obj('star', bm, star_m, smooth=False, parent=self.head); self.stars.append(st)
            a = i / 3 * math.tau + 0.5
            st.location = (math.cos(a) * 10.5 * u, math.sin(a) * 10.5 * u, 10.2 * u); st.rotation_euler = (math.radians(-SHIP_TILT), 0, 0)

    def pilot(self):
        u = U; R = self.root
        skin = mat('alienskin', srgb('#7ee05a'), rough=0.3, coat=0.8, sss=0.15)
        nt = skin.node_tree; b = nt.nodes['Principled BSDF']   # darker crown, lighter cheeks
        tc = node(nt, 'ShaderNodeTexCoord'); sp = node(nt, 'ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['Normal'], sp.inputs[0])
        nt.links.new(mixc(nt, maprange(nt, sp.outputs['Z'], -0.4, 0.9), srgb('#a6f27a'), srgb('#4fb83a')), b.inputs['Base Color'])
        lidline = mat('alienlidline', srgb('#173a10'), rough=0.4)
        browm = mat('alienbrow', srgb('#2a6a1c'), rough=0.35, coat=0.6)
        suit = mat('aliensuit', srgb('#7b6cf6'), rough=0.3, coat=1.0)
        self.mouth_m = mat('alienmouth', srgb('#3a0820'), rough=0.5)
        self.teeth_m = mat('alienteeth', srgb('#fffaf0'), rough=0.15, coat=1.0)
        self.tongue_m = mat('alientongue', srgb('#ff5d8f'), rough=0.3, coat=0.6)
        self.line_m = mat('alienline', srgb('#173a10'), rough=0.4)
        self.head = empty('alienhead', (0, 0, HEAD_Z * u), R)
        self.head.rotation_euler = (math.radians(-SHIP_TILT + 6), 0, 0)
        H = self.head
        # torso / collar
        bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=40, v_segments=20, radius=1)
        o = new_obj('torso', bm, suit, parent=R); o.location = (0, 0, (DOME_Z + 1.2) * u); o.scale = (7.0 * u, 5.2 * u, 3.8 * u)
        bpy.ops.mesh.primitive_torus_add(major_radius=3.3 * u, minor_radius=0.9 * u, major_segments=32, minor_segments=12)
        t = bpy.context.object; bpy.ops.object.shade_smooth(); t.data.materials.append(mat('collar', srgb('#c9d0e8'), rough=0.2, metal=0.7, coat=0.6))
        t.parent = R; t.location = (0, 0, (DOME_Z + 4.0) * u)
        # head: a broad, slightly pear-shaped bulb (wider at the top)
        bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=64, v_segments=32, radius=RH * u)
        for v in bm.verts:
            zz = v.co.z / (RH * u)
            k = 1 + 0.12 * zz
            v.co.x *= k * 1.08; v.co.y *= k * 0.95
        new_obj('alienhead_mesh', bm, skin, parent=H)
        # antennae
        self.ants = []
        for s in (-1, 1):
            piv = empty('antpiv', (s * 2.6 * u, 0, (RH - 0.9) * u), H)
            pts = [(0, 0, 0), (0, 0, 1.3 * u), (s * 0.4 * u, 0, 2.4 * u)]
            tube('aant', pts, 0.32 * u, skin, piv)
            bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=20, v_segments=10, radius=0.95 * u)
            new_obj('aantball', bm, mat('antball' + str(s), srgb('#ff5d8f'), rough=0.15, coat=1.0, emit=srgb('#ff3f8a'), emit_str=0.8), parent=piv).location = (s * 0.4 * u, 0, 2.7 * u)
            self.ants.append((s, piv))
        eye_m = [alien_eye_mat('aeye_l'), alien_eye_mat('aeye_r')]
        shine = mat('ashine', (1, 1, 1), rough=0.0, emit=(1, 1, 1), emit_str=4.0)
        self.eyes = [AlienEye(s, H, skin, lidline, eye_m[i], shine, browm) for i, s in enumerate((-1, 1))]
        # mouths
        fy = lambda x, z: -math.sqrt(max(0.0, (RH * 0.95) ** 2 - x * x - z * z))
        self.mouths = {}
        def mz(n): return -3.0
        smirk = [(x, fy(x, -2.7) - 0.15, -2.7 + 0.12 * (x + 1.6) ** 2 * (0.25 if x < 0 else 0.35) - 0.4) for x in [-1.8 + 3.9 * i / 14 for i in range(15)]]
        self.mouths['smirk'] = [tube('smirk', [(x * u, y * u, z * u) for x, y, z in smirk], 0.3 * u, self.line_m, H)]
        def rbox_(name, w, h, d, m, loc, ex=0.35, ez=0.35):
            return squircle(name, w * u, h * u, d * u, m, ex=ex, ez=ez, ey=0.6, parent=H, loc=(loc[0] * u, loc[1] * u, loc[2] * u), seg=32, rings=16)
        def teeth(name, w, h, z, skew=0.0):
            objs = [rbox_(name + 'o', w + 0.35, h + 0.35, 0.6, self.mouth_m, (0, fy(0, z) + 0.15, z)),
                    rbox_(name + 't', w, h, 0.6, self.teeth_m, (0, fy(0, z) + 0.0, z))]
            yy = fy(0, z) - 0.62
            for xx in (-w * 0.5, 0, w * 0.5):
                objs.append(tube(name + 'v', [(xx * u, yy * u, (z - h) * u), (xx * u, yy * u, (z + h) * u)], 0.09 * u, self.mouth_m, H))
            objs.append(tube(name + 'h', [(-w * u, yy * u, z * u), (w * u, yy * u, z * u)], 0.09 * u, self.mouth_m, H))
            if skew:
                for o in objs: o.rotation_euler = (0, math.radians(skew), 0)
            return objs
        self.mouths['grit'] = teeth('grit', 2.4, 0.9, -3.1)
        self.mouths['wince'] = teeth('wince', 2.0, 0.6, -3.1, skew=-8)
        o = squircle('omouth', 1.3 * u, 1.7 * u, 0.7 * u, self.mouth_m, ex=1, ez=1, ey=0.8, parent=H, loc=(0, (fy(0, -3.3) + 0.2) * u, -3.3 * u), seg=32, rings=16)
        tg = squircle('otongue', 0.8 * u, 0.5 * u, 0.4 * u, self.tongue_m, ex=1, ez=1, ey=1, parent=H, loc=(0.1 * u, (fy(0, -4.3) - 0.3) * u, -4.25 * u), seg=24, rings=12)
        self.mouths['o'] = [o, tg]
        o = squircle('dmouth', 2.1 * u, 1.0 * u, 0.7 * u, self.mouth_m, ex=1, ez=1, ey=0.8, parent=H, loc=(0, (fy(0, -3.1) + 0.2) * u, -3.1 * u), seg=32, rings=16)
        o.rotation_euler = (0, math.radians(10), 0)
        tg = V.capsule('dtongue', 2.6 * u, 0.75 * u, (1.0 * u, (fy(1.0, -4.0) - 0.4) * u, -4.3 * u), self.tongue_m); tg.parent = H
        tg.rotation_euler = (0, math.radians(70), 0); tg.scale = (1, 0.6, 1)
        self.mouths['tongue'] = [o, tg]
        # squeezed-shut creases for the wince
        self.squeeze = []
        for sd in (-1, 1):
            cx, cz = sd * 3.0, 1.6
            pts = [(cx - sd * 1.7, cz + 1.3), (cx + sd * 1.3, cz + 0.1), (cx - sd * 1.7, cz - 1.0)]
            pts = chaikin(pts, 2, closed=False)
            self.squeeze.append(tube('squeeze', [(x * u, (fy(x * 0.8, (z - 0.2) * 0.8) - 2.2) * u, z * u) for x, z in pts], 0.32 * u, self.line_m, H))
        # sweat drops
        drop_m = mat('sweat', srgb('#9fe6ff'), rough=0.02, coat=1.0, emit=srgb('#7fd8ff'), emit_str=0.25)
        self.sweat = []
        for (x, z, r) in ((-6.0, 4.0, 1.25), (6.2, 3.0, 1.05), (4.6, 6.0, 0.8)):
            o = V.flame('drop', (x * u, fy(x * 0.9, z * 0.9) * u - 0.05, z * u), r * u, drop_m)
            o.parent = H; o.location = (x * u, (fy(x * 0.85, z * 0.85) - 0.3) * u, z * u)
            o.rotation_euler = (0, math.pi, 0); o.visible_shadow = True; self.sweat.append(o)

    def pose(self, name, lights='dim'):
        e = SHIP_EXPR[name]; u = U
        for k, objs in self.mouths.items():
            for o in objs: o.hide_render = k != e['mouth']
        self.eyes[0].set(**e['eye']); self.eyes[1].set(**e.get('eye_r', e['eye']))
        for (s, piv), ang in zip(self.ants, e['ant']):
            piv.rotation_euler = (math.radians(-10), math.radians(ang), 0)
        for o in self.sweat: o.hide_render = not e.get('sweat')
        for o in self.squeeze: o.hide_render = e['mouth'] != 'wince'
        for o in self.smoke: o.hide_render = not e.get('smoke')
        for o in self.stars: o.hide_render = not e.get('stars')
        self.dome.hide_render = bool(e.get('crack')); self.dome_cr.hide_render = not e.get('crack')
        self.root.rotation_euler = (math.radians(SHIP_TILT), math.radians(e.get('roll', 0)), 0)
        dead = e.get('dead')
        for b in self.bulbs:
            b.data.materials.clear(); b.data.materials.append(self.bulb_off if dead else self.bulb_dim[b['hex']])
        en = self.glow_m.node_tree.nodes['Emission']
        en.inputs['Strength'].default_value = 0.0 if dead else (9.0 if e.get('fire') else 5.0)
        en.inputs['Color'].default_value = (*srgb('#ff4fd0' if e.get('fire') else '#5ff4ff'), 1)
        self.port_m.node_tree.nodes['Emission'].inputs['Strength'].default_value = 0.0 if dead else 2.2
        return e

    def lights_overlay(self, parity):
        """Only the lit bulbs of one parity; everything else is a holdout so the hull still occludes them."""
        self.pose('smug')
        for o in bpy.context.scene.objects:
            if o.type in ('MESH', 'CURVE') and o.name != 'softbox': o.is_holdout = True
        for b in self.bulbs:
            b.is_holdout = False
            b.hide_render = b['i'] % 2 != parity
            b.data.materials.clear(); b.data.materials.append(self.bulb_on[b['hex']])


def render_ship(only=None):
    sc = V.reset()
    for o in sc.objects:   # round highlights on the glass dome instead of the square key-light glint
        if o.type == 'LIGHT' and o.data.type == 'AREA': o.data.shape = 'DISK'
    ship = Mothership()
    jobs = []
    for ex in SHIP_EXPR:
        n = 'mothership_' + ex
        if only and n not in only and ex not in only: continue
        jobs.append((n, SHIP_SIZE, (lambda ex=ex: ship.pose(ex))))
    render_set(sc, jobs, 24 if FAST else 64)
    if not only or 'lights' in only:
        for par in (0, 1):
            ship.lights_overlay(par)
            render_set(sc, [(f'mothership_lights_{par}', SHIP_SIZE, None)], 16 if FAST else 32)


# =============================================================================================== plate
WIN = dict(x0=14, y0=46, x1=346, y1=434, r=26)      # window opening (screen units)
FRAME_W = 14                                        # frame width around the opening
MULLIONS = ()                                        # v3: removed (were at x = 124, 236)
PLANET = dict(x=266, y=356, r=98)
MOON = dict(x=58, y=82, r=12)
SUN = Vector((-0.74, -0.2, 0.62)).normalized()     # light direction (towards the light) for the painted space bodies
PLATE_LIGHTS = []                                   # (x, y, hex, size) indicator lights, for halos in post
# v3 (backgrounds never outshine the play): no mullions across the window, a dim and muted planet / ring / nebula,
# and quieter neon strips, indicator lights and deck treads in the lower hangar
SPACE_GAIN, SPACE_SAT = 0.28, 0.42                  # planet, ring and moon emission gain / saturation kept
NEBULA_GAIN, NEBULA_SAT = 0.45, 0.55
NEON_K = 0.35                                       # LED strips and indicator lights, emission scale


def mute(hexc, sat=SPACE_SAT):
    """Hex colour pulled toward its own grey (keeps the luminance, drops saturation)."""
    r, g, b = (int(hexc[i:i + 2], 16) for i in (1, 3, 5))
    y = 0.2126 * r + 0.7152 * g + 0.0722 * b
    return '#%02x%02x%02x' % tuple(round(y + (c - y) * sat) for c in (r, g, b))


def mute_lin(c, sat):
    y = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
    return tuple(y + (k - y) * sat for k in c)


def vmath(nt, op, a, b=None, scale=None):
    n = node(nt, 'ShaderNodeVectorMath', operation=op)
    feed(nt, n.inputs[0], a)
    if b is not None: feed(nt, n.inputs[1], b)
    if scale is not None: n.inputs['Scale'].default_value = scale
    return n.outputs['Value'] if op in ('DOT_PRODUCT', 'LENGTH', 'DISTANCE') else n.outputs['Vector']


def camera_only(o):
    hide_from_rays(o, camera=True)


def space_backdrop():
    """Emissive deep-space plane far behind the window: navy to violet, nebula, two star layers."""
    x0, x1, y0, y1 = -40, 400, -80, 480
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 40, 0), rotation=(math.radians(90), 0, 0))
    o = bpy.context.object; o.name = 'space'
    bm = bmesh.new(); bm.from_mesh(o.data)
    for v in bm.verts:
        v.co.x = (x1 if v.co.x > 0 else x0) * U; v.co.y = -(y0 if v.co.y > 0 else y1) * U
    bm.to_mesh(o.data); bm.free(); camera_only(o)
    m = bpy.data.materials.new('space'); nt = m.node_tree; nt.nodes.remove(nt.nodes['Principled BSDF'])
    tc = node(nt, 'ShaderNodeTexCoord'); sep = node(nt, 'ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['Object'], sep.inputs['Vector'])
    X, Z = sep.outputs['X'], sep.outputs['Y']          # metres; screen y = -Z / U
    g = node(nt, 'ShaderNodeValToRGB'); e = g.color_ramp.elements
    nt.links.new(maprange(nt, Z, -44.0, -4.0, 0, 1, smooth=False), g.inputs['Fac'])
    e[0].position = 0.0; e[0].color = (0.035, 0.016, 0.07, 1)        # low: violet haze around the planet
    e[1].position = 1.0; e[1].color = (0.004, 0.005, 0.02, 1)        # high: deep navy
    mid = g.color_ramp.elements.new(0.5); mid.color = (0.010, 0.008, 0.035, 1)
    col = g.outputs['Color']
    # nebula: two noise layers, magenta upper right and teal lower left, kept faint behind the formation
    for (cx, cy, rad, c, amt, sc_, seed) in ((300, 90, 150, (0.20, 0.035, 0.20), 0.9, 0.22, 1.0),
                                              (40, 300, 170, (0.02, 0.10, 0.15), 0.8, 0.25, 7.0),
                                              (170, 230, 220, (0.07, 0.03, 0.13), 0.5, 0.18, 3.0)):
        mp = node(nt, 'ShaderNodeMapping'); mp.inputs['Location'].default_value = (seed, seed * 2, 0)
        nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])
        nz = node(nt, 'ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = sc_; nz.inputs['Detail'].default_value = 7
        nz.inputs['Roughness'].default_value = 0.62; nz.inputs['Distortion'].default_value = 0.6
        nt.links.new(mp.outputs['Vector'], nz.inputs['Vector'])
        bx, bz = S(cx, cy)
        dx = mth(nt, 'SUBTRACT', X, bx); dz = mth(nt, 'SUBTRACT', Z, bz)
        d = mth(nt, 'SQRT', mth(nt, 'ADD', mth(nt, 'MULTIPLY', dx, dx), mth(nt, 'MULTIPLY', dz, dz)))
        fall = maprange(nt, d, rad * U, 0.0, 0.0, 1.0)
        cloud = mth(nt, 'MULTIPLY', maprange(nt, nz.outputs['Fac'], 0.42, 0.75), mth(nt, 'MULTIPLY', fall, amt * NEBULA_GAIN))
        c = mute_lin(c, NEBULA_SAT)
        add = node(nt, 'ShaderNodeMix', data_type='RGBA', blend_type='ADD'); sock(add, 'Factor', 'VALUE').default_value = 1.0
        nt.links.new(col, sock(add, 'A', 'RGBA'))
        cm = node(nt, 'ShaderNodeMix', data_type='RGBA'); feed(nt, sock(cm, 'Factor', 'VALUE'), cloud)
        sock(cm, 'A', 'RGBA').default_value = (0, 0, 0, 1); sock(cm, 'B', 'RGBA').default_value = (*c, 1)
        nt.links.new(sock(cm, 'Result', 'RGBA', outputs=True), sock(add, 'B', 'RGBA'))
        col = sock(add, 'Result', 'RGBA', outputs=True)
    # stars
    star = 0.0
    for scale, rad, gain in ((0.5, 0.06, 4.0), (1.3, 0.04, 1.4), (2.6, 0.03, 0.6)):
        v = node(nt, 'ShaderNodeTexVoronoi'); v.inputs['Scale'].default_value = scale
        nt.links.new(tc.outputs['Object'], v.inputs['Vector'])
        r = node(nt, 'ShaderNodeSeparateColor'); nt.links.new(v.outputs['Color'], r.inputs['Color'])
        disc = maprange(nt, v.outputs['Distance'], rad * 0.3, rad, 1, 0)
        s_ = mth(nt, 'MULTIPLY', disc, mth(nt, 'MULTIPLY', mth(nt, 'POWER', r.outputs[0], 6.0), gain))
        star = mth(nt, 'ADD', star, s_)
    # fewer stars right behind the formation's start position
    fx, fz = S(180, 170)
    dx = mth(nt, 'SUBTRACT', X, fx); dz = mth(nt, 'SUBTRACT', Z, fz)
    df = mth(nt, 'SQRT', mth(nt, 'ADD', mth(nt, 'MULTIPLY', mth(nt, 'MULTIPLY', dx, 0.6), mth(nt, 'MULTIPLY', dx, 0.6)), mth(nt, 'MULTIPLY', dz, dz)))
    star = mth(nt, 'MULTIPLY', star, maprange(nt, df, 4.0, 11.0, 0.35, 1.0))
    sc2 = node(nt, 'ShaderNodeMix', data_type='RGBA'); feed(nt, sock(sc2, 'Factor', 'VALUE'), mth(nt, 'MINIMUM', star, 1.0))
    nt.links.new(col, sock(sc2, 'A', 'RGBA')); sock(sc2, 'B', 'RGBA').default_value = (0.85, 0.88, 1.0, 1)
    col = sock(sc2, 'Result', 'RGBA', outputs=True)
    em = node(nt, 'ShaderNodeEmission'); nt.links.new(col, em.inputs['Color']); em.inputs['Strength'].default_value = 1.0
    nt.links.new(em.outputs[0], nt.nodes['Material Output'].inputs['Surface'])
    o.data.materials.append(m)


def body_mat(name, bands, centre, radius, spec=0.5, atmo=(0.55, 0.3, 1.0), atmo_str=0.9, band_scale=3.0, ring=None, night=0.03,
             crater=False):
    """Painted (emissive) planet / moon shading: lambert from SUN with a soft terminator, a glossy hotspot, a violet
    atmosphere rim, horizontal bands warped by noise, and optionally the shadow of the ring across it."""
    m = bpy.data.materials.new(name); nt = m.node_tree; nt.nodes.remove(nt.nodes['Principled BSDF'])
    geo = node(nt, 'ShaderNodeNewGeometry'); tc = node(nt, 'ShaderNodeTexCoord')
    N = geo.outputs['Normal']
    lam = vmath(nt, 'DOT_PRODUCT', N, tuple(SUN))
    lit = maprange(nt, lam, -0.12, 0.55, 0.0, 1.0)
    # bands along the object z (the planet is rotated so they tilt), warped by noise
    sep = node(nt, 'ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['Object'], sep.inputs['Vector'])
    nz = node(nt, 'ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 0.9 if not crater else 4.0; nz.inputs['Detail'].default_value = 3 if not crater else 6
    nz.inputs['Distortion'].default_value = 0.25
    nt.links.new(tc.outputs['Object'], nz.inputs['Vector'])
    bandv = mth(nt, 'ADD', mth(nt, 'MULTIPLY', sep.outputs['Z'], band_scale / radius), mth(nt, 'MULTIPLY', nz.outputs['Fac'], 0.3 if not crater else 1.2))
    ramp = node(nt, 'ShaderNodeValToRGB'); e = ramp.color_ramp.elements
    e[0].position, e[0].color = bands[0][0], (*srgb(mute(bands[0][1])), 1)
    e[1].position, e[1].color = bands[-1][0], (*srgb(mute(bands[-1][1])), 1)
    for pos, hx in bands[1:-1]:
        k = e.new(pos); k.color = (*srgb(mute(hx)), 1)
    atmo = mute_lin(atmo, SPACE_SAT)
    nt.links.new(mth(nt, 'FRACT', mth(nt, 'MULTIPLY', bandv, 0.5)), ramp.inputs['Fac'])
    col = ramp.outputs['Color']
    shade = mth(nt, 'ADD', night, mth(nt, 'MULTIPLY', lit, 1.0 - night))
    if ring:   # ring shadow: march from the surface point toward the sun to the ring plane
        cR, nR, r0, r1 = ring
        P = geo.outputs['Position']
        num = vmath(nt, 'DOT_PRODUCT', vmath(nt, 'SUBTRACT', tuple(cR), P), tuple(nR))
        den = float(SUN.dot(nR))
        t = mth(nt, 'DIVIDE', num, den)
        Q = vmath(nt, 'ADD', P, vmath(nt, 'SCALE', tuple(SUN), None, scale=1.0))
        sc_node = node(nt, 'ShaderNodeVectorMath', operation='SCALE'); sc_node.inputs[0].default_value = tuple(SUN)
        nt.links.new(t, sc_node.inputs['Scale'])
        Q = vmath(nt, 'ADD', P, sc_node.outputs['Vector'])
        rq = vmath(nt, 'DISTANCE', Q, tuple(cR))
        inring = mth(nt, 'MULTIPLY', maprange(nt, rq, r0, r0 + 0.3), maprange(nt, rq, r1, r1 - 0.3))
        inring = mth(nt, 'MULTIPLY', inring, mth(nt, 'GREATER_THAN', t, 0.0))
        shade = mth(nt, 'MULTIPLY', shade, mth(nt, 'SUBTRACT', 1.0, mth(nt, 'MULTIPLY', inring, 0.7)))
    sh = node(nt, 'ShaderNodeMix', data_type='RGBA', blend_type='MULTIPLY'); sock(sh, 'Factor', 'VALUE').default_value = 1.0
    nt.links.new(col, sock(sh, 'A', 'RGBA'))
    cmb = node(nt, 'ShaderNodeCombineColor'); nt.links.new(shade, cmb.inputs[0]); nt.links.new(shade, cmb.inputs[1]); nt.links.new(shade, cmb.inputs[2])
    nt.links.new(cmb.outputs[0], sock(sh, 'B', 'RGBA'))
    col = sock(sh, 'Result', 'RGBA', outputs=True)
    # the night side keeps a faint violet (ring-shine) instead of going muddy
    nadd = node(nt, 'ShaderNodeMix', data_type='RGBA', blend_type='ADD'); feed(nt, sock(nadd, 'Factor', 'VALUE'), mth(nt, 'SUBTRACT', 1.0, lit))
    nt.links.new(col, sock(nadd, 'A', 'RGBA')); sock(nadd, 'B', 'RGBA').default_value = (0.05, 0.022, 0.11, 1)
    col = sock(nadd, 'Result', 'RGBA', outputs=True)
    # glossy hotspot (half vector between sun and the camera at -Y)
    H = (SUN + Vector((0, -1, 0))).normalized()
    hs = mth(nt, 'POWER', mth(nt, 'MAXIMUM', vmath(nt, 'DOT_PRODUCT', N, tuple(H)), 0.0), 60.0)
    hs2 = mth(nt, 'POWER', mth(nt, 'MAXIMUM', vmath(nt, 'DOT_PRODUCT', N, tuple(H)), 0.0), 8.0)
    spec_v = mth(nt, 'ADD', mth(nt, 'MULTIPLY', hs, spec), mth(nt, 'MULTIPLY', hs2, spec * 0.12))
    col = mixc(nt, mth(nt, 'MINIMUM', spec_v, 1.0), col, (1.0, 0.95, 0.95))
    # atmosphere rim
    lw = node(nt, 'ShaderNodeLayerWeight'); lw.inputs['Blend'].default_value = 0.35
    rim = mth(nt, 'MULTIPLY', mth(nt, 'POWER', lw.outputs['Facing'], 3.0), mth(nt, 'ADD', 0.25, mth(nt, 'MULTIPLY', lit, 0.75)))
    col = mixc(nt, mth(nt, 'MULTIPLY', rim, atmo_str), col, atmo)
    em = node(nt, 'ShaderNodeEmission'); nt.links.new(col, em.inputs['Color']); em.inputs['Strength'].default_value = SPACE_GAIN
    nt.links.new(em.outputs[0], nt.nodes['Material Output'].inputs['Surface'])
    return m


def ring_mat(name, centre, R, r0, r1):
    m = bpy.data.materials.new(name); nt = m.node_tree; nt.nodes.remove(nt.nodes['Principled BSDF'])
    geo = node(nt, 'ShaderNodeNewGeometry')
    P = geo.outputs['Position']
    rr = vmath(nt, 'DISTANCE', P, tuple(centre))
    f = maprange(nt, rr, r0, r1, 0, 1, smooth=False)
    ramp = node(nt, 'ShaderNodeValToRGB'); e = ramp.color_ramp.elements    # colour (rgb) + density (alpha)
    stops = [(0.0, '#6a4a9a', 0.0), (0.06, '#9a7ad0', 0.55), (0.22, '#e8b0d0', 0.8), (0.34, '#f5c8c0', 0.95), (0.40, '#3a2850', 0.12),
             (0.47, '#ffb6a6', 0.85), (0.7, '#d891c0', 0.7), (0.82, '#a070c8', 0.45), (0.9, '#6a4aa0', 0.25), (1.0, '#40306a', 0.0)]
    e[0].position = stops[0][0]; e[0].color = (*srgb(mute(stops[0][1])), stops[0][2])
    e[1].position = stops[-1][0]; e[1].color = (*srgb(mute(stops[-1][1])), stops[-1][2])
    for pos, hx, a in stops[1:-1]:
        k = e.new(pos); k.color = (*srgb(mute(hx)), a)
    nt.links.new(f, ramp.inputs['Fac'])
    # fine ringlets
    wv = node(nt, 'ShaderNodeTexWave', wave_type='RINGS'); wv.inputs['Scale'].default_value = 1.0
    mpw = node(nt, 'ShaderNodeMapping'); mpw.inputs['Scale'].default_value = (14, 14, 14)
    nt.links.new(maprange(nt, rr, 0, 30, 0, 30, smooth=False), mpw.inputs['Vector'])
    nt.links.new(mpw.outputs['Vector'], wv.inputs['Vector'])
    dens = mth(nt, 'MULTIPLY', ramp.outputs['Alpha'], maprange(nt, wv.outputs['Fac'], 0.0, 1.0, 0.75, 1.0))
    # planet shadow on the ring (the far side, away from the sun)
    d = vmath(nt, 'SUBTRACT', P, tuple(centre))
    t = vmath(nt, 'DOT_PRODUCT', d, tuple(SUN))
    sc_node = node(nt, 'ShaderNodeVectorMath', operation='SCALE'); sc_node.inputs[0].default_value = tuple(SUN); nt.links.new(t, sc_node.inputs['Scale'])
    perp = vmath(nt, 'LENGTH', vmath(nt, 'SUBTRACT', d, sc_node.outputs['Vector']))
    shadow = mth(nt, 'MULTIPLY', maprange(nt, perp, R * 1.02, R * 0.94), mth(nt, 'LESS_THAN', t, 0.0))
    lit = mth(nt, 'SUBTRACT', 1.0, mth(nt, 'MULTIPLY', shadow, 0.85))
    em = node(nt, 'ShaderNodeEmission'); nt.links.new(ramp.outputs['Color'], em.inputs['Color']); feed(nt, em.inputs['Strength'], mth(nt, 'MULTIPLY', lit, 0.95 * SPACE_GAIN))
    tr = node(nt, 'ShaderNodeBsdfTransparent'); ms = node(nt, 'ShaderNodeMixShader')
    nt.links.new(dens, ms.inputs[0]); nt.links.new(tr.outputs[0], ms.inputs[1]); nt.links.new(em.outputs[0], ms.inputs[2])
    nt.links.new(ms.outputs[0], nt.nodes['Material Output'].inputs['Surface'])
    return m


def space_bodies():
    # ringed planet
    cx, cz = S(PLANET['x'], PLANET['y']); R = PLANET['r'] * U; Y = 30.0
    tilt = math.radians(-16)                                     # roll of the planet axis and the ring on screen
    ring_inc = math.radians(-15)                                 # ring plane tipped so its near side drops: a flat ellipse
    rot = Matrix.Rotation(tilt, 3, 'Y') @ Matrix.Rotation(ring_inc, 3, 'X')
    nR = rot @ Vector((0, 0, 1)); centre = Vector((cx, Y, cz))
    r0, r1 = R * 1.28, R * 2.2
    bands = [(0.0, '#ff8a70'), (0.14, '#ffb48c'), (0.27, '#f06a7e'), (0.4, '#c94a8c'), (0.52, '#ff9d7c'), (0.63, '#9a52c8'),
             (0.75, '#ff7f86'), (0.88, '#ffc2a0'), (1.0, '#ff8a70')]
    pm = body_mat('planet', bands, centre, R, spec=0.45, atmo=(0.75, 0.42, 1.0), atmo_str=1.0, band_scale=2.6, ring=(centre, nR, r0, r1), night=0.015)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=128, ring_count=64, radius=R, location=centre)
    p = bpy.context.object; p.name = 'planet'; bpy.ops.object.shade_smooth(); p.data.materials.append(pm)
    p.rotation_euler = rot.to_euler()
    camera_only(p)
    bm = bmesh.new()
    segs = 256
    outer = [bm.verts.new((r1 * math.cos(a), r1 * math.sin(a), 0)) for a in [i / segs * math.tau for i in range(segs)]]
    inner = [bm.verts.new((r0 * math.cos(a), r0 * math.sin(a), 0)) for a in [i / segs * math.tau for i in range(segs)]]
    for i in range(segs):
        j = (i + 1) % segs; bm.faces.new((inner[i], inner[j], outer[j], outer[i]))
    rg = new_obj('ring', bm, ring_mat('ring', centre, R, r0, r1)); rg.location = centre; rg.rotation_euler = rot.to_euler()
    camera_only(rg)
    # small cratered moon, upper left
    mx, mz = S(MOON['x'], MOON['y']); mr = MOON['r'] * U
    mm = body_mat('moon', [(0.0, '#9a93b8'), (0.4, '#c9c2de'), (0.7, '#8a83a8'), (1.0, '#b8b0d2')], Vector((mx, 34, mz)), mr,
                  spec=0.25, atmo=(0.6, 0.65, 1.0), atmo_str=0.5, band_scale=0.6, night=0.02, crater=True)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32, radius=mr, location=(mx, 34, mz))
    mo = bpy.context.object; bpy.ops.object.shade_smooth(); mo.data.materials.append(mm); camera_only(mo)


def rrect_loop(x0, y0, x1, y1, r, n=12):
    """Rounded rectangle in screen units -> list of (X, Z) metres, counter-clockwise."""
    pts = []
    for (cx, cy, a0) in ((x1 - r, y1 - r, 0), (x0 + r, y1 - r, 90), (x0 + r, y0 + r, 180), (x1 - r, y0 + r, 270)):
        for i in range(n + 1):
            a = math.radians(a0 + 90 * i / n)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return [(x * U, -y * U) for x, y in pts]


def ring_frame(name, outer, inner, depth, bevel, m, y):
    """Flat rounded-rect ring (outer / inner = (x0, y0, x1, y1, r) in screen units), extruded toward the camera."""
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '2D'; cu.fill_mode = 'BOTH'
    cu.extrude = depth; cu.bevel_depth = bevel; cu.bevel_resolution = 5
    for loop in (rrect_loop(*outer), rrect_loop(*inner)):
        sp = cu.splines.new('POLY'); sp.points.add(len(loop) - 1); sp.use_cyclic_u = True
        for p_, c in zip(sp.points, loop): p_.co = (c[0], c[1], 0, 1)
    o = bpy.data.objects.new(name, cu); bpy.context.scene.collection.objects.link(o)
    o.rotation_euler = (math.radians(90), 0, 0); o.location = (0, y, 0); o.data.materials.append(m)
    return o


def rivet(x, y, yy, m, r=1.3):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r * U, segments=20, ring_count=10, location=(x * U, yy, -y * U))
    o = bpy.context.object; o.scale = (1, 0.55, 1); bpy.ops.object.shade_smooth(); o.data.materials.append(m)
    return o


def indicator(x, y, yy, hexc, r=1.6, strength=5.0):
    m = mat('ind' + hexc, srgb(hexc), rough=0.1, coat=1.0, emit=srgb(hexc), emit_str=strength * NEON_K)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r * U, segments=20, ring_count=10, location=(x * U, yy, -y * U))
    o = bpy.context.object; o.scale = (1, 0.6, 1); bpy.ops.object.shade_smooth(); o.data.materials.append(m)
    PLATE_LIGHTS.append((x, y, hexc, r))
    return o


def sbox(name, x0, y0, x1, y1, depth, yfront, bevel, m, segs=4):
    """Box from screen rect (units) with its front face at Blender y = yfront."""
    cx, cz = S((x0 + x1) / 2, (y0 + y1) / 2)
    return box(name, (x1 - x0) * U, (y1 - y0) * U, depth, bevel, m, (cx, yfront + depth / 2, cz), segs=segs)


def build_plate():
    PLATE_LIGHTS.clear()
    space_backdrop(); space_bodies()
    W = WIN; fw = FRAME_W
    FRAME = metal_mat('frame', '#5a648e', rough=0.3, metal=0.5, coat=0.8)
    TRIM = mat('trim', srgb('#9aa3c4'), rough=0.2, metal=0.8, coat=0.6)
    WALL = noisy_panel('wall', '#2a3150')
    PANEL = noisy_panel('panel', '#3a4268')
    DARK = mat('darkmetal', srgb('#151a2e'), rough=0.45, metal=0.5, coat=0.3)
    RIV = mat('privet', srgb('#b9c1db'), rough=0.22, metal=1.0, coat=0.4)
    # back wall (everything outside the window), recessed
    for (x0, y0, x1, y1) in ((-20, -60, 380, W['y0'] - 4), (-20, W['y1'] + 4, 380, 820), (-20, -60, W['x0'] - 4, 820), (W['x1'] + 4, -60, 380, 820)):
        sbox('backwall', x0, y0, x1, y1, 0.3, 1.2, 0, WALL)
    # chunky rounded window frame + an inner chrome lip + mullions
    ring_frame('frame', (W['x0'] - fw, W['y0'] - fw, W['x1'] + fw, W['y1'] + fw, W['r'] + fw), (W['x0'], W['y0'], W['x1'], W['y1'], W['r']),
               0.35, 0.32, FRAME, -0.1)
    ring_frame('lip', (W['x0'] + 0.5, W['y0'] + 0.5, W['x1'] - 0.5, W['y1'] - 0.5, W['r'] - 0.5), (W['x0'] + 3, W['y0'] + 3, W['x1'] - 3, W['y1'] - 3, W['r'] - 3),
               0.08, 0.1, TRIM, 0.55)
    # v3: no mullions (nothing crosses the window)
    # rivets around the frame face
    yfr = -0.1 - 0.35 - 0.32
    cxm = (W['x0'] + W['x1']) / 2
    for i in range(15):
        x = W['x0'] + 22 + i * (W['x1'] - W['x0'] - 44) / 14
        for y in (W['y0'] - fw / 2, W['y1'] + fw / 2): rivet(x, y, yfr + 0.03, RIV)
    for i in range(13):
        y = W['y0'] + 30 + i * (W['y1'] - W['y0'] - 60) / 12
        for x in (W['x0'] - fw / 2, W['x1'] + fw / 2): rivet(x, y, yfr + 0.03, RIV)
    # header beam above the window, with a soft cool light strip
    sbox('header', -10, -60, 370, W['y0'] - fw - 6, 1.0, -0.2, 0.2, PANEL)
    for i in range(6):
        x = 30 + i * 60
        sbox('hseam', x - 0.6, -60, x + 0.6, W['y0'] - fw - 7, 0.05, -0.23, 0, DARK)
    # sill under the window: a protruding ledge with a cyan LED strip on its lip
    ys = W['y1'] + fw
    sbox('sill', -10, ys + 2, 370, ys + 18, 1.6, -0.9, 0.35, FRAME)
    strip = emission('sillstrip', mute_lin(srgb('#4fe9ff'), 0.7), 3.0 * NEON_K)
    sbox('sillled', 10, ys + 14.4, 350, ys + 15.8, 0.05, -0.95, 0, strip)
    # side columns (the walls the ball bounces off) below the window
    for (x0, x1) in ((-6, 12), (348, 366)):
        sbox('column', x0, ys + 18, x1, 820, 1.4, -0.6, 0.3, FRAME)
        for y in range(int(ys + 34), 800, 46):
            rivet((x0 + x1) / 2 + (2 if x0 < 0 else -2), y, -0.62, RIV, 1.2)
    # wall panels: two columns of tall panels with soft seams, a few vents and indicator clusters
    py0 = ys + 24; rows = [(py0, py0 + 92), (py0 + 96, py0 + 188)]
    cols = [(16, 126), (130, 230), (234, 344)]
    rng = random.Random(4)
    for ri, (y0, y1) in enumerate(rows):
        for ci, (x0, x1) in enumerate(cols):
            sbox(f'panel{ri}{ci}', x0, y0, x1, y1, 0.5, 0.05 + rng.uniform(-0.03, 0.03), 0.22, PANEL, segs=4)
            if (ri, ci) in ((0, 0), (1, 2)):
                for k in range(5):
                    yy = y0 + 18 + k * 7
                    sbox('vent', x0 + 18, yy, x1 - 18, yy + 3.2, 0.1, 0.0, 0.05, DARK, segs=2)
            if (ri, ci) == (0, 1):
                # small status console: three lights in a dark bezel
                sbox('console', (x0 + x1) / 2 - 22, y0 + 14, (x0 + x1) / 2 + 22, y0 + 28, 0.12, -0.03, 0.06, DARK, segs=2)
                for k, hx in enumerate(('#4fe9ff', '#4fe9ff', '#ff5d8f')):
                    indicator((x0 + x1) / 2 - 12 + 12 * k, y0 + 21, -0.08, hx, 1.9, 4.0)
            if (ri, ci) == (1, 0):
                for k, hx in enumerate(('#7dff9a', '#4fe9ff')):
                    indicator(x0 + 14 + 9 * k, y1 - 14, -0.03, hx, 1.5, 3.5)
            if (ri, ci) == (0, 2):
                indicator(x1 - 14, y0 + 14, -0.03, '#c46bf0', 1.5, 3.5)
            for (rx, ry) in ((x0 + 6, y0 + 6), (x1 - 6, y0 + 6), (x0 + 6, y1 - 6), (x1 - 6, y1 - 6)):
                rivet(rx, ry, -0.02, RIV, 0.9)
    # deck: a kick plate with horizontal treads and a soft pink edge light
    dy = py0 + 196
    TREAD = metal_mat('tread', '#2c3247', rough=0.45, metal=0.4, coat=0.2)
    sbox('deck', -10, dy, 370, 830, 1.8, -1.2, 0.3, DARK)
    edge = emission('deckedge', mute_lin(srgb('#ff5d8f'), 0.7), 2.2 * NEON_K)
    sbox('deckled', 12, dy + 3, 348, dy + 4.4, 0.05, -1.25, 0, edge)
    for k in range(9):
        yy = dy + 12 + k * 8
        sbox('tread', 12, yy, 348, yy + 4.5, 0.25, -1.4, 0.08, TREAD, segs=2)
    # lights: space light spilling through the window onto the frame's inner rim, planet bounce, sill glow
    wx, wz = S(cxm, (W['y0'] + W['y1']) / 2)
    bpy.ops.object.light_add(type='AREA', location=(wx, 6.0, wz), rotation=(math.radians(-90), 0, 0))
    bpy.context.object.visible_camera = False
    L = bpy.context.object.data; L.shape = 'RECTANGLE'; L.size = 30; L.size_y = 36; L.energy = 3000; L.color = (0.6, 0.5, 1.0)
    px_, pz_ = S(PLANET['x'], PLANET['y'] + 40)
    bpy.ops.object.light_add(type='AREA', location=(px_, 4.0, pz_), rotation=(math.radians(-90), 0, 0))
    bpy.context.object.visible_camera = False
    L = bpy.context.object.data; L.size = 14; L.energy = 6000 * SPACE_GAIN; L.color = (0.85, 0.65, 0.7)
    sx, sz = S(180, ys + 20)
    bpy.ops.object.light_add(type='AREA', location=(sx, -2.0, sz), rotation=(math.radians(-60), 0, 0))
    bpy.context.object.visible_camera = False
    L = bpy.context.object.data; L.shape = 'RECTANGLE'; L.size = 34; L.size_y = 1; L.energy = 1600 * NEON_K; L.color = (0.6, 0.85, 1.0)


def noisy_panel(name, hexc):
    m = mat(name, srgb(hexc), rough=0.42, metal=0.35, coat=0.45, coat_rough=0.08)
    return V.noisy(m, scale=3.0, amount=0.12, bump=0.05, detail=5)


def render_plate():
    sc = V.reset()
    build_plate()
    P = PLATE
    if FAST:
        V.frame(sc, P['x0'], P['y0'], P['w'], P['h'], 2 if '--mid' in sys.argv else 1, os.path.join(RAW, 'plate_fast.png'), False, 24)
    else:
        V.frame(sc, P['x0'], P['y0'], P['w'], P['h'], P['ppu'], os.path.join(RAW, 'plate.png'), False, 96)
    json.dump(PLATE_LIGHTS, open(os.path.join(RAW, 'plate_lights.json'), 'w'))


# =============================================================================================== render driver
SPRITES = {}


def render_set(sc, jobs, samples):
    """jobs: list of (out_name, (w, h) units, setup_fn or None)."""
    for name, (w, h), setup in jobs:
        if setup: setup()
        V.frame(sc, V.P0[0] - w / 2, V.P0[1] - h / 2, w, h, SPR_PPU, os.path.join(RAW, name + '.png'), True, samples)


def brick_jobs():
    J = {}
    for ci in range(9):
        for d in (0, 1, 2):
            J[f'brick_c_{ci}_{d}'] = (lambda ci=ci, d=d: build_candy(ci, d))
    for d in (0, 1, 2):
        J[f'brick_a_{d}'] = (lambda d=d: build_armor(d))
    J['brick_p_0'] = build_power
    return J


MISC = {'bolt': ((16, 24), build_bolt), 'bomb': ((20, 24), build_bomb)}


def render_static(only=None):
    """Bricks, bolt and bomb: built one by one into a fresh scene (as in the Vault)."""
    jobs = [(n, (CW + 2 * MARGIN, CH + 2 * MARGIN), f) for n, f in brick_jobs().items()] + [(n, sz, f) for n, (sz, f) in MISC.items()]
    sc = V.reset()
    for n, size, f in jobs:
        if only and n not in only: continue
        for o in list(sc.objects):
            if o.type in ('MESH', 'CURVE') and o.name != 'softbox': bpy.data.objects.remove(o)
        f()
        render_set(sc, [(n, size, None)], 24 if FAST else 56)


def render_bots(only=None, colors=None):
    sc = V.reset()
    bot = Robot()
    size = (CW + 2 * MARGIN, CH + 2 * MARGIN)
    jobs = []
    for ck in (colors or BOT_COLORS):
        for ex in BOT_EXPR:
            n = f'bot_{ck}_{ex}'
            if only and n not in only and ex not in only: continue
            jobs.append((n, size, (lambda ex=ex, ck=ck: bot.pose(ex, BOT_COLORS[ck]))))
    render_set(sc, jobs, 24 if FAST else 64)
    if colors and 'white' not in colors: return
    # tint masks: helmet shell as flat white emission, everything else a holdout (so the visor etc. cut it out)
    white = emission('maskwhite', (1, 1, 1), 1.0)
    for ex in BOT_EXPR:
        if only and ex not in only and f'bot_white_{ex}' not in only: continue
        bot.pose(ex, BOT_COLORS['white'])
        for o in sc.objects:
            if o.type in ('MESH', 'CURVE') and o.name != 'softbox': o.is_holdout = o.name not in ('helmet', 'helmet_dent')
        for h in (bot.helmet, bot.helmet_dent):
            h.data.materials.clear(); h.data.materials.append(white)
        sc.view_settings.view_transform = 'Standard'; sc.view_settings.look = 'None'; sc.cycles.use_denoising = False
        render_set(sc, [(f'botmask_{ex}', size, None)], 16)
        sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast'; sc.cycles.use_denoising = True
        for o in sc.objects: o.is_holdout = False
        for h in (bot.helmet, bot.helmet_dent):
            h.data.materials.clear(); h.data.materials.append(bot.body_mat)


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    what = args[0] if args else 'all'
    if what in ('plate', 'all'): render_plate()
    if what in ('static', 'sprites', 'all'): render_static(args[1:] or None)
    if what in ('ship', 'sprites', 'all'): render_ship(args[1:] or None)
    if what in ('bots', 'sprites', 'all'):
        cols = [a for a in args[1:] if a in BOT_COLORS]; rest = [a for a in args[1:] if a not in BOT_COLORS]
        render_bots(rest or None, cols or None)
    if what in ('post', 'all'):
        import subprocess
        subprocess.run([sys.executable, os.path.join(HERE, 'invasion_post.py')], check=True)
```


---

## `art/invasion_post.py`

Pillow/numpy post-process for Invasion: LED and plasma glows, calm/dim passes, atlas.json, contact and composite sheets.

```python
# Post-processing for the Invasion renders (Pillow + numpy only, no Blender needed).
# Run after art/render_invasion_assets.py has filled art/out/invasion_raw/:
#   python3 art/invasion_post.py
# Writes assets/invasion/: plate.png/.jpg, every sprite PNG, atlas.json, contact.png, composite.png.
# Adds what Cycles has no cheap equivalent for: halos around the plate's indicator lights and LED strips, a faint
# sheen on the window glass, LED bloom on the robots, the plasma glow of the bolt, the mothership's under-glow and
# rim-light halos. Robot tint masks are cut from the mask renders.
import json, os, hashlib, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
RAW = os.path.join(HERE, 'out', 'invasion_raw')
OUT = os.path.join(ROOT, 'assets', 'invasion')
VAULT = os.path.join(ROOT, 'assets', 'vault')
os.makedirs(OUT, exist_ok=True)

PLATE_X0, PLATE_Y0, PLATE_W, PLATE_H, PPU = 0, -40, 360, 820, 2
SPR_PPU, MARGIN = 3, 4
OX, OY, CW, CH, COLS, ROWS = 26, 92, 28, 18, 11, 9
LAYOUT = ['..bbbbbbb..', '.ccpcccpcc.', 'ccbcbcbcbcc', 'ccccccccccc', 'aacaaaaacaa', 'cbccbcbccbc', 'ccpccccpccc', '.ccccccccc.', '..c.c.c.c..']
ROW_COLORS = ['#ff5d8f', '#ff8a3d', '#ffd23f', '#5ccf6a', '#2ec4b6', '#3fa8f5', '#7b6cf6', '#c46bf0', '#ff5d8f']
BOT_KEY = {0: 'pink', 2: 'yellow', 5: 'blue'}
BOT_EXPR = ['march0', 'march1', 'angry', 'hurt', 'dizzy', 'laugh', 'shock']
BOT_COLORS = {'white': '#f4f6fb', 'pink': '#ff5d8f', 'yellow': '#ffd23f', 'blue': '#3fa8f5'}
SHIP_EXPR = ['smug', 'angry', 'hurt', 'panic', 'dizzy']
SHIP_SIZE = (108, 64)        # raw render size; post pads SHIP_PAD units above and below for the under-glow
SHIP_PAD = 8
SHIP_HULL_DY = -2.8         # centre of the ship body (dome top -22 .. hull bottom +16 units from the sprite centre), = hit ellipse centre
SHIP_UNDER_DY = 16.0         # the under-glow emitter, units below the sprite centre
WIN = dict(x0=14, y0=46, x1=346, y1=434, r=26)
PLANET = dict(x=266, y=356, r=98)
MOON = dict(x=58, y=82, r=12)
SILL_LED_Y = 434 + 14 + 15.1
TINT_JITTER = 0.04


def px(x, y):
    return round((x - PLATE_X0) * PPU), round((y - PLATE_Y0) * PPU)


def save_png(im, name):
    p = os.path.join(OUT, name); im.save(p, optimize=True); return p


def radial(w, h, cx, cy, sx, sy=None):
    sy = sx if sy is None else sy
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    return np.exp(-((xx - cx) ** 2 / (2 * sx ** 2) + (yy - cy) ** 2 / (2 * sy ** 2)))


def hexrgb(h):
    return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], np.float32)


def screen_add(im, g, color):
    """Screen-blend a glow (h, w) of the given rgb colour onto an RGB float image."""
    return 255 - (255 - im) * (1 - np.clip(g, 0, 1)[..., None] * (np.asarray(color, np.float32) / 255))


# ------------------------------------------------------------------------------------------------ plate
def rrect_mask(w, h, x0, y0, x1, y1, r, ss=4):
    m = Image.new('L', (w * ss, h * ss), 0)
    ImageDraw.Draw(m).rounded_rectangle([x0 * ss, y0 * ss, x1 * ss, y1 * ss], r * ss, fill=255)
    return np.asarray(m.resize((w, h), Image.LANCZOS)).astype(np.float32) / 255


def plate():
    im = np.asarray(Image.open(os.path.join(RAW, 'plate.png')).convert('RGB')).astype(np.float32)
    h, w, _ = im.shape
    # indicator light halos
    for (x, y, hx, r) in json.load(open(os.path.join(RAW, 'plate_lights.json'))):
        cx, cy = px(x, y)
        g = radial(w, h, cx, cy, 2.2 * r * PPU) * 0.28 + radial(w, h, cx, cy, 6 * r * PPU) * 0.05   # v3: quieter
        im = screen_add(im, g, hexrgb(hx))
    # LED strip glows (sill: cyan, deck edge: pink), soft horizontal bands
    yy = np.arange(h, dtype=np.float32)[:, None]; xx = np.arange(w, dtype=np.float32)[None, :]
    xfall = np.clip(np.minimum(xx - 10 * PPU, 350 * PPU - xx) / (30 * PPU), 0, 1)
    for (ly, col, a, s1, s2) in ((SILL_LED_Y, '#4fe9ff', 0.14, 1.5, 9), (434 + 14 + 24 + 196 + 3.7, '#ff5d8f', 0.10, 1.4, 8)):   # v3: quieter
        _, cy = px(0, ly)
        g = (np.exp(-(yy - cy) ** 2 / (2 * (s1 * PPU) ** 2)) * a + np.exp(-(yy - cy) ** 2 / (2 * (s2 * PPU) ** 2)) * a * 0.35) * xfall
        im = screen_add(im, g, hexrgb(col))
    # window glass: two faint diagonal sheen bands + a soft top-left reflection, only inside the opening
    win = rrect_mask(w, h, *(np.array(px(WIN['x0'], WIN['y0']))), *(np.array(px(WIN['x1'], WIN['y1']))), WIN['r'] * PPU)
    d = (xx * 0.62 + yy * 0.38) / PPU            # diagonal coordinate in units
    sheen = (np.exp(-((d - 120) / 16) ** 2) * 0.035 + np.exp(-((d - 300) / 22) ** 2) * 0.025)   # v3: soft only, no thin streak
    sheen += radial(w, h, *px(40, 60), 90 * PPU, 70 * PPU) * 0.03
    im = screen_add(im, sheen * win, (200, 215, 255))
    out = Image.fromarray(np.clip(im, 0, 255).astype(np.uint8), 'RGB')
    save_png(out, 'plate.png')
    out.save(os.path.join(OUT, 'plate.jpg'), quality=88, optimize=True, progressive=True)
    return out


# ------------------------------------------------------------------------------------------------ sprite effects
def to_premul(im):
    a = np.asarray(im.convert('RGBA')).astype(np.float32) / 255
    return a[..., :3] * a[..., 3:4], a[..., 3]


def from_premul(c, a):
    a = np.clip(a, 0, 1)
    rgb = np.where(a[..., None] > 1e-4, c / np.maximum(a[..., None], 1e-4), 0)
    return Image.fromarray((np.clip(np.dstack([rgb, a]), 0, 1) * 255 + 0.5).astype(np.uint8), 'RGBA')


def add_glow(im, glow_rgb, glow_a):
    """Additive glow (straight rgb + coverage) composited onto a straight-alpha sprite; extends into the margin."""
    c, a = to_premul(im)
    c = c + glow_rgb * glow_a[..., None] * (1 - 0.6 * a[..., None])
    a = a + glow_a * (1 - a)
    return from_premul(c, a)


def blur(arr, sigma):
    """Separable gaussian blur (numpy only), zero outside the image."""
    if arr.ndim == 3:
        return np.dstack([blur(arr[..., i], sigma) for i in range(arr.shape[2])])
    r = max(1, int(sigma * 3))
    k = np.exp(-np.arange(-r, r + 1) ** 2 / (2 * sigma * sigma)).astype(np.float32); k /= k.sum()
    a = np.pad(arr.astype(np.float32), r)
    a = sum(k[i] * a[:, i:i + a.shape[1] - 2 * r] for i in range(2 * r + 1))
    a = sum(k[i] * a[i:i + a.shape[0] - 2 * r, :] for i in range(2 * r + 1))
    return a


def led_bloom(im, sigma=2.4, gain=1.1, thr=0.72):
    """Bloom only saturated bright pixels (LED eyes, antenna ball), not white specular glints."""
    c, a = to_premul(im)
    rgb = np.where(a[..., None] > 1e-3, c / np.maximum(a[..., None], 1e-3), 0)
    mx = rgb.max(-1); mn = rgb.min(-1); sat = (mx - mn) / np.maximum(mx, 1e-3)
    m = np.clip((mx - thr) / 0.2, 0, 1) * np.clip((sat - 0.2) / 0.3, 0, 1) * a
    src = rgb * m[..., None]
    g = blur(src, sigma) + blur(src, sigma * 2.6) * 0.5
    ga = np.clip(g.max(-1) * gain, 0, 0.85)
    col = g / np.maximum(g.max(-1, keepdims=True), 1e-4)
    return add_glow(im, col, ga)


def halo(im, color, sx, sy, strength, cx=None, cy=None, behind=True):
    w, h = im.size
    g = radial(w, h, (w - 1) / 2 if cx is None else cx, (h - 1) / 2 if cy is None else cy, sx, sy) * strength
    glow = np.zeros((h, w, 4), np.float32); glow[..., :3] = color; glow[..., 3] = np.clip(g, 0, 1) * 255
    gi = Image.fromarray(glow.astype(np.uint8), 'RGBA')
    if behind:
        gi.alpha_composite(im); return gi
    return add_glow(im, np.ones((h, w, 3), np.float32) * np.asarray(color, np.float32) / 255, np.clip(g, 0, 1))


# ------------------------------------------------------------------------------------------------ sprites
def load_raw(name, size_units=None):
    im = Image.open(os.path.join(RAW, name + '.png')).convert('RGBA')
    if size_units: assert im.size == (size_units[0] * SPR_PPU, size_units[1] * SPR_PPU), (name, im.size)
    return im


def entry(name, im, foot, kind, margin=MARGIN, **extra):
    e = dict(file=name + '.png', px=list(im.size), ppu=SPR_PPU, anchor=[im.size[0] / 2, im.size[1] / 2], footprint=list(foot),
             drawSize=[im.size[0] / SPR_PPU, im.size[1] / SPR_PPU], margin=margin, kind=kind)
    e.update(extra); return e


def pad_v(im, p):
    out = Image.new('RGBA', (im.size[0], im.size[1] + 2 * p), (0, 0, 0, 0)); out.paste(im, (0, p)); return out


def sprites():
    atlas = {}
    cell = (CW + 2 * MARGIN, CH + 2 * MARGIN)
    for ci in range(9):
        for d in range(3):
            n = f'brick_c_{ci}_{d}'; im = load_raw(n, cell); save_png(im, n + '.png')
            atlas[n] = entry(n, im, (CW, CH), 'candy', color=ROW_COLORS[ci], dmg=d)
    for d in range(3):
        n = f'brick_a_{d}'; im = load_raw(n, cell); save_png(im, n + '.png')
        atlas[n] = entry(n, im, (CW, CH), 'armor', color='#8d97b3', dmg=d, hpLeft=3 - d)
    n = 'brick_p_0'; im = load_raw(n, cell); im = led_bloom(im, 2.0, 0.6, 0.8); save_png(im, n + '.png')
    atlas[n] = entry(n, im, (CW, CH), 'power', color='#f4c542')
    for ck in BOT_COLORS:
        for ex in BOT_EXPR:
            n = f'bot_{ck}_{ex}'; im = load_raw(n, cell); im = led_bloom(im)
            save_png(im, n + '.png')
            atlas[n] = entry(n, im, (CW, CH), 'bot', colorKey=ck, color=BOT_COLORS[ck], expr=ex,
                             **({'mask': f'bot_mask_{ex}.png'} if ck == 'white' else {}))
    for ex in BOT_EXPR:   # tint masks: the helmet shell's coverage, 0..255 alpha on white
        m = Image.open(os.path.join(RAW, f'botmask_{ex}.png')).convert('RGBA')
        a = np.asarray(m).astype(np.float32)
        cov = np.clip(a[..., :3].max(-1) * a[..., 3] / 255, 0, 255)
        out = np.zeros(a.shape, np.uint8); out[..., :3] = 255; out[..., 3] = cov.astype(np.uint8)
        im = Image.fromarray(out, 'RGBA'); n = f'bot_mask_{ex}'; save_png(im, n + '.png')
        atlas[n] = entry(n, im, (CW, CH), 'botmask', expr=ex)
    # bolt + bomb
    im = load_raw('bolt', (16, 24)); im = halo(im, (255, 60, 200), 3.2 * SPR_PPU, 6.0 * SPR_PPU, 0.75)
    save_png(im, 'bolt.png'); atlas['bolt'] = entry('bolt', im, (6, 14), 'projectile', margin=None)
    im = load_raw('bomb', (20, 24)); im = halo(im, (255, 70, 170), 5.5 * SPR_PPU, 5.5 * SPR_PPU, 0.45); im = led_bloom(im, 2.0, 0.9, 0.7)
    save_png(im, 'bomb.png'); atlas['bomb'] = entry('bomb', im, (12, 12), 'projectile', margin=None)
    # mothership: under-glow behind (cyan, or hot pink while firing), bloom on the rim bulbs
    for ex in SHIP_EXPR:
        n = f'mothership_{ex}'; im = pad_v(load_raw(n, SHIP_SIZE), SHIP_PAD * SPR_PPU)
        w, h = im.size; cy = h / 2 + SHIP_UNDER_DY * SPR_PPU
        if ex != 'dizzy':
            col = (255, 80, 210) if ex == 'angry' else (90, 240, 255)
            im = halo(im, col, 15 * SPR_PPU, 4.5 * SPR_PPU, 0.75 if ex == 'angry' else 0.6, cy=cy)
            im = halo(im, col, 26 * SPR_PPU, 8 * SPR_PPU, 0.18, cy=cy + 2 * SPR_PPU)
        im = led_bloom(im, 2.2, 0.8, 0.75)
        save_png(im, n + '.png')
        atlas[n] = entry(n, im, (94, 38), 'boss', margin=None, expr=ex, hitEllipse=[44, 18], hullCenter=[0, SHIP_HULL_DY])
    for par in (0, 1):
        n = f'mothership_lights_{par}'; im = pad_v(load_raw(n, SHIP_SIZE), SHIP_PAD * SPR_PPU)
        c, a = to_premul(im)
        g = blur(c, 2.0 * SPR_PPU) * 1.6 + blur(c, 5 * SPR_PPU) * 0.9
        ga = np.clip(g.max(-1), 0, 0.9); col = g / np.maximum(g.max(-1, keepdims=True), 1e-4)
        im = add_glow(im, col, ga); save_png(im, n + '.png')
        atlas[n] = entry(n, im, (94, 38), 'bossLights', margin=None, note='additive-friendly overlay; draw over mothership_* with the same rect, alternate 0/1')
    return atlas


# ------------------------------------------------------------------------------------------------ previews
def tint(im, k):
    a = np.asarray(im).astype(np.float32); a[..., :3] *= k
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA')


def place(canvas, im, cx, cy, ppu=PPU):
    k = ppu / SPR_PPU
    tw, th = round(im.size[0] * k), round(im.size[1] * k)
    s = im.resize((tw, th), Image.LANCZOS)
    x, y = round((cx - PLATE_X0) * ppu), round((cy - PLATE_Y0) * ppu)
    canvas.alpha_composite(s, (round(x - tw / 2), round(y - th / 2)))


def drop_shadow(canvas, im, cx, cy, ppu=PPU, dx=2.0, dy=3.0, a=0.35):
    k = ppu / SPR_PPU
    tw, th = round(im.size[0] * k), round(im.size[1] * k)
    al = np.asarray(im.resize((tw, th), Image.LANCZOS))[..., 3].astype(np.float32)
    al = blur(al, 1.5 * ppu / 2) * a
    sh = np.zeros((th, tw, 4), np.uint8); sh[..., 3] = np.clip(al, 0, 255).astype(np.uint8)
    x, y = round((cx + dx - PLATE_X0) * ppu), round((cy + dy - PLATE_Y0) * ppu)
    canvas.alpha_composite(Image.fromarray(sh, 'RGBA'), (round(x - tw / 2), round(y - th / 2)))


def formation(cv, ppu=PPU, frame=0, dx=0.0, dy=0.0):
    L = lambda n: Image.open(os.path.join(OUT, n + '.png')).convert('RGBA')
    for r, row in enumerate(LAYOUT):
        for c, v in enumerate(row):
            if v == '.': continue
            cx, cy = OX + dx + c * CW + CW / 2, OY + dy + r * CH + CH / 2
            if v == 'b':
                ex = ['march0', 'march1'][(frame + c) % 2]
                im = L(f'bot_{BOT_KEY[r]}_{ex}')
            elif v == 'a': im = L('brick_a_0')
            elif v == 'p': im = L('brick_p_0')
            else:
                im = L(f'brick_c_{r}_0')
                hsh = int(hashlib.md5(f'{c},{r}'.encode()).hexdigest()[:8], 16) / 0xffffffff
                im = tint(im, 1 + TINT_JITTER * (2 * hsh - 1))
            drop_shadow(cv, im, cx, cy, ppu)
            place(cv, im, cx, cy, ppu)


def paddle(cv, y, cx=180, pw=74, ppu=PPU):
    lft, mid, rgt = [Image.open(os.path.join(VAULT, f'paddle_{k}.png')).convert('RGBA') for k in 'lmr']
    k = ppu / SPR_PPU
    lw, rw = round(lft.size[0] * k), round(rgt.size[0] * k); mw = round((pw - 24) * ppu); hh = round(lft.size[1] * k)
    x0, y0 = round((cx - pw / 2 - MARGIN) * ppu), round((y - 6 - MARGIN - PLATE_Y0) * ppu)
    cv.alpha_composite(lft.resize((lw, hh), Image.LANCZOS), (x0, y0))
    cv.alpha_composite(mid.resize((mw, hh), Image.LANCZOS), (x0 + lw, y0))
    cv.alpha_composite(rgt.resize((rw, hh), Image.LANCZOS), (x0 + lw + mw, y0))


def composite(plate_im):
    """Left: the formation at the start. Right: the boss phase (mothership hovering, a bolt and a bomb falling)."""
    L = lambda n: Image.open(os.path.join(OUT, n + '.png')).convert('RGBA')
    ball = Image.open(os.path.join(VAULT, 'ball.png')).convert('RGBA')
    H = 760; py = H - 104
    a = plate_im.convert('RGBA'); formation(a)
    paddle(a, py); place(a, ball, 196, py - 30)
    place(a, L('bolt'), 129, 420)
    b = plate_im.convert('RGBA')
    place(b, L('mothership_smug'), 180, 130); place(b, L('mothership_lights_0'), 180, 130)
    place(b, L('bomb'), 160, 300); place(b, L('bolt'), 230, 380)
    paddle(b, py, 150); place(b, ball, 214, 520)
    out = Image.new('RGB', (a.size[0] * 2 + 16, a.size[1]), (14, 14, 22))
    out.paste(a.convert('RGB'), (0, 0)); out.paste(b.convert('RGB'), (a.size[0] + 16, 0))
    return out


def contact(atlas, plate_im):
    font = ImageFont.load_default()
    names = [n for n in atlas if not n.startswith('bot_mask')]
    cellw, cellh, cols = 170, 112, 8
    rows = (len(names) + cols - 1) // cols
    W = 380 + cols * cellw + 20; H = max(850, rows * cellh + 40)
    sheet = Image.new('RGBA', (W, H), (24, 22, 30, 255)); d = ImageDraw.Draw(sheet)
    th = plate_im.resize((360, 820), Image.LANCZOS).convert('RGBA')
    sheet.alpha_composite(th, (10, 20)); d.text((10, 4), 'plate.png (50%)', fill=(220, 220, 230, 255), font=font)
    for i, n in enumerate(names):
        cx = 380 + (i % cols) * cellw; cy = 20 + (i // cols) * cellh
        for yy in range(cy, cy + cellh - 18, 8):
            for xx in range(cx, cx + cellw - 10, 8):
                d.rectangle([xx, yy, xx + 7, yy + 7], fill=(44, 40, 54, 255) if ((xx - cx) // 8 + (yy - cy) // 8) % 2 else (36, 33, 45, 255))
        im = Image.open(os.path.join(OUT, atlas[n]['file'])).convert('RGBA')
        if im.size[0] > cellw - 14: im = im.resize((cellw - 14, round(im.size[1] * (cellw - 14) / im.size[0])), Image.LANCZOS)
        if im.size[1] > cellh - 22: im = im.resize((round(im.size[0] * (cellh - 22) / im.size[1]), cellh - 22), Image.LANCZOS)
        sheet.alpha_composite(im, (cx + (cellw - 10 - im.size[0]) // 2, cy + (cellh - 18 - im.size[1]) // 2))
        d.text((cx, cy + cellh - 16), f"{n} {atlas[n]['px'][0]}x{atlas[n]['px'][1]}", fill=(210, 210, 220, 255), font=font)
    sheet.convert('RGB').save(os.path.join(OUT, 'contact.png'), optimize=True)


def main():
    pl = plate()
    sp = sprites()
    atlas = {
        'version': 1,
        'units': 'game units (1 unit = 0.1 m in Blender); screen is 360 units wide',
        'board': dict(ox=OX, oy=OY, cols=COLS, rows=ROWS, cellW=CW, cellH=CH,
                      note='formation origin at the start; it marches +-14 sideways and steps down 14, so draw bricks relative to the live origin'),
        'plate': dict(file='plate.png', jpg='plate.jpg', px=list(pl.size), ppu=PPU, screenRect=[PLATE_X0, PLATE_Y0, PLATE_W, PLATE_H],
                      convention='pixel (px, py) <-> screen (x, y): px = 2*x, py = 2*(y + 40); draw plate at screen (0, -40) with size 360 x 820 units',
                      stretchNote='everything below y = 500 is generic wall / deck; stretch or tile that band for screens taller than 780'),
        'spriteConvention': ('sprites are 3 px/unit; draw each centred on its anchor at the footprint centre, at size drawSize (units) = px / 3. '
                             'Cell sprites (bricks, bots, masks): footprint 28 x 18 + a 4-unit transparent margin, so a cell (c, r) is drawn at '
                             'x = ox + c*28 - 4, y = oy + r*18 - 4, w = 36, h = 26. Mothership: drawSize 108 x 80 centred on the boss position; '
                             'its hit ellipse (radii 44 x 18) is centred hullCenter units from the sprite centre. bolt 16 x 24, bomb 20 x 24, centred.'),
        'tintJitter': TINT_JITTER,
        'tintNote': 'multiply glazed candy brick RGB by 1 + tintJitter*(2*hash(c,r)-1) for per-brick variation (composite.png does this)',
        'botTint': ('bot_white_<expr> has a near-white body (#f4f6fb). To tint to any colour T: draw bot_white, then draw it again into an '
                    'offscreen buffer, multiply by T, keep only bot_mask_<expr> (destination-in) and draw that over. pink / yellow / blue '
                    'are real renders for rows 0, 2, 5.'),
        'botColors': BOT_COLORS,
        'rowColors': ROW_COLORS,
        'anchors': {'window': [WIN['x0'], WIN['y0'], WIN['x1'] - WIN['x0'], WIN['y1'] - WIN['y0']], 'windowRadius': WIN['r'],
                    'planet': [PLANET['x'], PLANET['y'], PLANET['r']], 'moon': [MOON['x'], MOON['y'], MOON['r']],
                    'sillLed': SILL_LED_Y, 'mullionsX': [],
                    'indicatorLights': [[x, y, hx] for x, y, hx, r in json.load(open(os.path.join(RAW, 'plate_lights.json')))]},
        'sprites': sp,
    }
    json.dump(atlas, open(os.path.join(OUT, 'atlas.json'), 'w'), indent=1)
    composite(pl).save(os.path.join(OUT, 'composite.png'), optimize=True)
    contact(sp, pl)
    tot = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT))
    print('assets/invasion total', round(tot / 1024), 'KB in', len(os.listdir(OUT)), 'files')


if __name__ == '__main__':
    main()
```


---

## `art/princess.py`

Princess Lumi from the KayKit Rogue (CC0): atlas recolour, tiara, bell skirt, and the expressive face rig (glossy eyeballs with iris/pupil/catch-lights, skin lids with lash line, brows, reshaping mouth decal, blush) with per-animation expressions. Prince Kit should be built the same way from kk_Knight.glb.

```python
# Princess character: KayKit Rogue (CC0) re-dressed in Blender as a princess and rendered as sprite frames for the game.
#   - atlas recolour: rose dress, honey-blonde hair, ivory gloves, white tights, rose shoes, gold trims
#   - the painted/modelled dot eyes, ridge brows and mouth crease are removed and replaced by an expressive face rig:
#     glossy eyeballs with a procedural iris/pupil/catch-lights, skin eyelids with a lash line, brow strokes and a
#     mouth decal that is re-shaped every frame, plus cheek blush; all parented to the head bone
#   - a gold filigree tiara with a faceted rose gem and pearl tips, and a flared bell skirt with a lace petticoat
#   - per-animation facial expressions (see EXPRESSIONS) keyed over each loop
# Run:  python3 art/princess.py <out_dir> <anim:frames>...
#   e.g. python3 art/princess.py assets/princess Idle:16 Interact:12 Blocking:8 Cheer:16 Running_A:12 Jump_Full_Short:14 Scared:8
# Options: <anim:frames:i,j,...> renders only those frame indices; --face renders a 4x close-up of the face instead
#          (files <anim>_face_XX.png); --samples N overrides the Cycles sample count; --threads N fixes the CPU threads.
import bpy, bmesh, sys, os, math, colorsys, addon_utils, mathutils
import numpy as np
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree

addon_utils.enable("cycles", default_set=True)
HERE = os.path.dirname(os.path.abspath(__file__))
argv = sys.argv[1:]
FACE = '--face' in argv
SAMPLES = 48
if '--samples' in argv:
    i = argv.index('--samples'); SAMPLES = int(argv[i + 1]); del argv[i:i + 2]
THREADS = 0
if '--threads' in argv:
    i = argv.index('--threads'); THREADS = int(argv[i + 1]); del argv[i:i + 2]
argv = [a for a in argv if a != '--face']
OUT = os.path.abspath(argv[0]) if argv else os.path.join(HERE, 'out', 'princess')
ANIMS = [a.split(':') for a in argv[1:]] or [['Idle', '12']]
PX = 3            # pixels per game unit
BOX = 56          # sprite cell in game units (square); character ~42 units tall
HEIGHT = 42
SOURCE = {'Scared': ('Block', 0.30, 0.90),     # new animations: KayKit action and the part of it to loop
          'Nervous': ('Walking_B', 0.0, 1.0), 'Panic': ('Running_A', 0.0, 1.0)}
# The glTF armature uses quaternion rotation, so every v1/v2 animation is rendered facing the camera head-on.
# The pacing animations turn her toward screen right (the game mirrors the sprite for leftward movement); the
# head then turns back toward the camera (see POSE_FX) so the face still reads.
YAW = {'Nervous': 58, 'Panic': 62}

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
bpy.ops.import_scene.gltf(filepath=os.path.join(HERE, '..', 'assets', 'models', 'kk_Rogue.glb'))
arm = next(o for o in sc.objects if o.type == 'ARMATURE')
for o in sc.objects:
    if o.type == 'MESH' and o.name in ('Knife_Offhand', '1H_Crossbow', '2H_Crossbow', 'Knife', 'Throwable', 'Icosphere', 'Rogue_Cape'):
        o.hide_render = True; o.hide_viewport = True
head = bpy.data.objects['Rogue_Head']; body = bpy.data.objects['Rogue_Body']

# ---------------------------------------------------------------- scale reference (identical to the v1 sprites)
# v1 measured the character at frame 1 from the feet to the tip of its crown; keep that exact scale so the
# sprite still fits the cage in the game.
sc.frame_set(1); bpy.context.view_layer.update()
hb = [head.matrix_world @ Vector(c) for c in head.bound_box]
_top = max(p.z for p in hb); _hw = max(p.x for p in hb) - min(p.x for p in hb)
_meshes = [o for o in sc.objects if o.type == 'MESH' and not o.hide_render]
_pts = [o.matrix_world @ Vector(c) for o in _meshes for c in o.bound_box]
Z0 = min(p.z for p in _pts); Z1 = _top + _hw * 0.225
CX = (min(p.x for p in _pts) + max(p.x for p in _pts)) / 2

# ---------------------------------------------------------------- atlas recolour
img = bpy.data.images['rogue_texture']
W, H = img.size
px = np.array(img.pixels[:], dtype=np.float32).reshape(H, W, 4)
def swatch(col, row):  # atlas is 8 x 4 swatches of 128 x 256, row 0 at the top of the image
    y1 = H - row * 256; return px[y1 - 256:y1, col * 128:(col + 1) * 128]
def recolor(col, row, fn):
    s = swatch(col, row); flat = s[..., :3].reshape(-1, 3)
    for i, (r, g, b) in enumerate(flat):
        flat[i] = colorsys.hls_to_rgb(*fn(*colorsys.rgb_to_hls(r, g, b)))
    s[..., :3] = flat.reshape(s.shape[0], s.shape[1], 3)
for c in ((0, 1), (1, 1), (1, 2)):                      # tunic, sleeves, collar -> rose
    recolor(*c, lambda h, l, s: (0.935, min(0.85, l * 1.25 + 0.12), min(1, s * 0.95)))
recolor(1, 0, lambda h, l, s: (0.105, min(0.66, l * 1.1 + 0.09), min(1, s * 1.8 + 0.25)))  # hair -> honey blonde
recolor(5, 2, lambda h, l, s: (0.06, 0.90 + (l - 0.4) * 0.35, 0.50))                       # gloves -> ivory satin
recolor(5, 0, lambda h, l, s: (0.95, 0.70 + (l - 0.4) * 0.6, 0.75))                        # puff shoulders, sash -> pink
recolor(6, 0, lambda h, l, s: (0.95, 0.66 + (l - 0.4) * 0.6, 0.65))                        # belt pouches -> pink
recolor(3, 0, lambda h, l, s: (0.12, 0.35 + l * 0.4, 0.85))                                # buckle, earring -> gold
recolor(7, 1, lambda h, l, s: (0.08, 0.86 + (l - 0.4) * 0.3, 0.45))                        # trousers -> white tights
recolor(3, 2, lambda h, l, s: (0.93, 0.30 + l * 0.45, 0.72))                               # boots -> rose shoes
img.pixels[:] = px.ravel()

def srgb2lin(c):
    c = np.asarray(c, dtype=np.float64)
    return tuple(np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4))
def atlas_color(u, v):
    return srgb2lin(px[min(H - 1, int(v * H)), min(W - 1, int(u * W)), :3])

# ---------------------------------------------------------------- materials
def principled(m):
    return next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
for m in bpy.data.materials:
    b = principled(m); b.inputs['Coat Weight'].default_value = 0.35; b.inputs['Coat Roughness'].default_value = 0.25
    b.inputs['Roughness'].default_value = 0.45

def mat(name, color, rough, metal=0.0, coat=0.0, **kw):
    m = bpy.data.materials.new(name); b = principled(m)
    b.inputs['Base Color'].default_value = (*color, 1); b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal; b.inputs['Coat Weight'].default_value = coat
    b.inputs['Coat Roughness'].default_value = 0.1
    for k, v in kw.items():
        b.inputs[k].default_value = v if not isinstance(v, tuple) else (*v, 1)[:len(b.inputs[k].default_value)]
    return m

# ---------------------------------------------------------------- body clean-up (rest pose)
arm.data.pose_position = 'REST'; bpy.context.view_layer.update()
def loose_parts(bm):
    bm.faces.ensure_lookup_table(); seen = set(); parts = []
    for f in bm.faces:
        if f.index in seen: continue
        stack = [f]; comp = []; seen.add(f.index)
        while stack:
            g = stack.pop(); comp.append(g)
            for e in g.edges:
                for h2 in e.link_faces:
                    if h2.index not in seen: seen.add(h2.index); stack.append(h2)
        parts.append(comp)
    return parts
def part_swatch(bm, comp):
    uvl = bm.loops.layers.uv.active
    u = sum(l[uvl].uv[0] for f in comp for l in f.loops) / sum(len(f.loops) for f in comp)
    v = sum(l[uvl].uv[1] for f in comp for l in f.loops) / sum(len(f.loops) for f in comp)
    return int(u * 8), int((1 - v) * 4)
bm = bmesh.new(); bm.from_mesh(body.data); kill = []
for comp in loose_parts(bm):          # hip pouch and belt buckles would poke out of the skirt
    c = sum((f.calc_center_median() for f in comp), Vector()) / len(comp)
    if part_swatch(bm, comp) in ((6, 0), (3, 0)) and c.z < 0.7: kill += comp
bmesh.ops.delete(bm, geom=kill, context='FACES'); bm.to_mesh(body.data); bm.free()
for side in ('Left', 'Right'):        # slimmer gloved hands
    o = bpy.data.objects[f'Rogue_Arm{side}']; bm = bmesh.new(); bm.from_mesh(o.data)
    hand = {v for comp in loose_parts(bm) if part_swatch(bm, comp) == (5, 2) for f in comp for v in f.verts}
    sx = 1 if side == 'Left' else -1
    piv = Vector((sx * 0.67, 0, sum(v.co.z for v in hand) / len(hand)))
    for v in hand: v.co = piv + (v.co - piv) * 0.84
    bm.to_mesh(o.data); bm.free()

# ---------------------------------------------------------------- head clean-up (rest pose, mesh space == world space)
arm.data.pose_position = 'REST'; bpy.context.view_layer.update()
me = head.data; bm = bmesh.new(); bm.from_mesh(me); bm.faces.ensure_lookup_table()
uvl = bm.loops.layers.uv.active
def swatch_of(f):
    u = sum(l[uvl].uv[0] for l in f.loops) / len(f.loops); v = sum(l[uvl].uv[1] for l in f.loops) / len(f.loops)
    return int(u * 8), int((1 - v) * 4)
seen = set(); parts = []
for f in bm.faces:
    if f.index in seen: continue
    stack = [f]; comp = []; seen.add(f.index)
    while stack:
        g = stack.pop(); comp.append(g)
        for e in g.edges:
            for h2 in e.link_faces:
                if h2.index not in seen: seen.add(h2.index); stack.append(h2)
    parts.append(comp)
kill = set(); nose = []
for comp in parts:
    vs = {v for f in comp for v in f.verts}; co = np.array([v.co[:] for v in vs])
    sw = swatch_of(comp[0]); lo, hi = co.min(0), co.max(0)
    if sw == (2, 0): kill |= set(comp)                                                     # dot eyes
    elif sw == (1, 0) and lo[2] > 1.68 and hi[2] < 1.78 and hi[1] < -0.3: kill |= set(comp)  # ridge brows
    elif sw == (0, 0) and len(comp) <= 6 and hi[1] < -0.4 and abs(lo[2] - 1.40) < 0.03: kill |= set(comp)  # mouth crease
    elif sw == (0, 0) and hi[1] < -0.3 and lo[1] < -0.49: nose.append(vs)                 # nose
nose_v = set().union(*nose)
base = Vector((0, -0.40, 1.485))
for v in nose_v:                                     # smaller, cuter button nose
    v.co = base + (v.co - base) * 0.62 + Vector((0, 0.035, 0))
bmesh.ops.delete(bm, geom=list(kill), context='FACES')
bm.to_mesh(me); bm.free(); me.update()

SKIN = atlas_color(0.06, 0.86)
BVH = BVHTree.FromObject(head, bpy.context.evaluated_depsgraph_get())

def surf(x, z):
    """frontmost point of the head (skin or hair) at face coords (x, z), and its normal"""
    hit = BVH.ray_cast(Vector((x, -2.0, z)), Vector((0, 1, 0)))
    if hit[0] is None: return Vector((x, -0.35, z)), Vector((0, -1, 0))
    n = hit[1] if hit[1].y < 0 else -hit[1]
    return hit[0], n

def bone_parent(o, bone):
    mw = o.matrix_world.copy(); o.parent = arm; o.parent_type = 'BONE'; o.parent_bone = bone; o.matrix_world = mw

def new_obj(name, mesh=None):
    o = bpy.data.objects.new(name, mesh); sc.collection.objects.link(o); return o

def mesh_obj(name, verts, faces, material=None, uvs=None, smooth=True):
    m = bpy.data.meshes.new(name); m.from_pydata(verts, [], faces)
    if uvs is not None:
        lay = m.uv_layers.new(name='UVMap')
        for poly in m.polygons:
            for li in poly.loop_indices: lay.data[li].uv = uvs[m.loops[li].vertex_index]
    if smooth: m.shade_smooth()
    o = new_obj(name, m)
    if material: m.materials.append(material)
    return o

def set_mesh(o, verts, faces, uvs=None):
    m = o.data; m.clear_geometry(); m.from_pydata(verts, [], faces)
    if uvs is not None:
        lay = m.uv_layers.get('UVMap') or m.uv_layers.new(name='UVMap')
        for poly in m.polygons:
            for li in poly.loop_indices: lay.data[li].uv = uvs[m.loops[li].vertex_index]
    m.shade_smooth(); m.update()

# ---------------------------------------------------------------- node helpers
class NT:
    def __init__(self, m):
        m.use_nodes = True; self.t = m.node_tree; self.n = self.t.nodes; self.l = self.t.links
    def node(self, kind, **props):
        nd = self.n.new(kind)
        for k, v in props.items(): setattr(nd, k, v)
        return nd
    def link(self, a, b): self.l.new(a, b)
    def math(self, op, a, b=None, clamp=False):
        nd = self.node('ShaderNodeMath', operation=op, use_clamp=clamp)
        for i, x in enumerate((a, b)):
            if x is None: continue
            if isinstance(x, (int, float)): nd.inputs[i].default_value = x
            else: self.link(x, nd.inputs[i])
        return nd.outputs[0]
    def smooth(self, x, e0, e1):   # 0 below e0, 1 above e1
        nd = self.node('ShaderNodeMapRange', interpolation_type='SMOOTHSTEP', clamp=True)
        self.link(x, nd.inputs['Value']); nd.inputs['From Min'].default_value = e0; nd.inputs['From Max'].default_value = e1
        return nd.outputs[0]
    def mix(self, fac, a, b):
        nd = self.node('ShaderNodeMix', data_type='RGBA', clamp_factor=True)
        for sock, x in ((nd.inputs[0], fac), (nd.inputs[6], a), (nd.inputs[7], b)):
            if isinstance(x, tuple): sock.default_value = (*x, 1) if len(x) == 3 else x
            elif isinstance(x, (int, float)): sock.default_value = x
            else: self.link(x, sock)
        return nd.outputs[2]
    def obj_radius(self, ob, sx=1.0, sz=1.0):  # distance in the X/Z plane of an empty's space
        tc = self.node('ShaderNodeTexCoord', object=ob)
        sep = self.node('ShaderNodeSeparateXYZ'); self.link(tc.outputs['Object'], sep.inputs[0])
        x = self.math('MULTIPLY', sep.outputs[0], sx); z = self.math('MULTIPLY', sep.outputs[2], sz)
        d = self.math('SQRT', self.math('ADD', self.math('MULTIPLY', x, x), self.math('MULTIPLY', z, z)))
        return d, sep
    def value(self, v):
        nd = self.node('ShaderNodeValue'); nd.outputs[0].default_value = v; return nd

# ---------------------------------------------------------------- eyes
EYE_X, EYE_Z = 0.208, 1.57          # eye centres on the face (head rest coords, +x = her left = screen right)
EYE_R = (0.105, 0.075, 0.137)        # half width, depth, half height
IRIS_TOP, IRIS_BOT = srgb2lin((0.03, 0.30, 0.36)), srgb2lin((0.25, 0.92, 0.85))
PUPIL = srgb2lin((0.05, 0.03, 0.10)); SCLERA = srgb2lin((0.98, 0.97, 1.0)); LASH = srgb2lin((0.16, 0.06, 0.08))
LIDSKIN = mat('lid_skin', SKIN, 0.45, coat=0.35)

def eye_material(name, iris_e, pupil_e, glint1, glint2):
    m = bpy.data.materials.new(name); t = NT(m); b = principled(m)
    d_i, sep_i = t.obj_radius(iris_e)
    d_p, _ = t.obj_radius(pupil_e)
    d_g1, _ = t.obj_radius(glint1); d_g2, _ = t.obj_radius(glint2)
    iris_m = t.math('SUBTRACT', 1.0, t.smooth(d_i, 0.93, 1.0))
    pupil_m = t.math('SUBTRACT', 1.0, t.smooth(d_p, 0.88, 1.0))
    glint = t.math('MAXIMUM', t.math('SUBTRACT', 1.0, t.smooth(d_g1, 0.85, 1.0)), t.math('SUBTRACT', 1.0, t.smooth(d_g2, 0.8, 1.0)))
    grad = t.math('SUBTRACT', 1.0, t.smooth(sep_i.outputs[2], -0.85, 0.75))
    iris = t.mix(grad, IRIS_TOP, IRIS_BOT)
    iris = t.mix(t.math('MULTIPLY', t.smooth(d_i, 0.72, 0.97), 0.85), iris, srgb2lin((0.02, 0.16, 0.22)))  # limbal ring
    sclera_shade = t.smooth(sep_i.outputs[2], 0.2, 1.6)                                                 # lid shadow
    sclera = t.mix(t.math('MULTIPLY', sclera_shade, 0.35), SCLERA, srgb2lin((0.72, 0.70, 0.86)))
    col = t.mix(iris_m, sclera, iris)
    col = t.mix(pupil_m, col, PUPIL)
    col = t.mix(glint, col, (1, 1, 1))
    t.link(col, b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = 0.12; b.inputs['Coat Weight'].default_value = 1.0; b.inputs['Coat Roughness'].default_value = 0.03
    b.inputs['Emission Color'].default_value = (1, 1, 1, 1); t.link(t.math('MULTIPLY', glint, 6.0), b.inputs['Emission Strength'])
    return m

def lid_material(name):
    m = bpy.data.materials.new(name); t = NT(m); b = principled(m)
    tc = t.node('ShaderNodeTexCoord'); sep = t.node('ShaderNodeSeparateXYZ'); t.link(tc.outputs['Object'], sep.inputs[0])
    z = t.math('ABSOLUTE', sep.outputs[2])
    lash = t.math('SUBTRACT', 1.0, t.smooth(z, 0.24, 0.34))
    t.link(t.mix(lash, SKIN, LASH), b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = 0.45; b.inputs['Coat Weight'].default_value = 0.35
    return m

def sphere_mesh(name, r, zmin=-2.0, zmax=2.0, seg=40, ring=24):
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=ring, radius=r)
    if zmin > -r or zmax < r:
        if zmin > -r: bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=(0, 0, zmin), plane_no=(0, 0, 1), clear_inner=True)
        if zmax < r: bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=(0, 0, zmax), plane_no=(0, 0, 1), clear_outer=True)
    m = bpy.data.meshes.new(name); bm.to_mesh(m); bm.free(); m.shade_smooth(); return m

EYES = []
for side in (1, -1):
    s = 'L' if side > 0 else 'R'
    p, n = surf(side * EYE_X, EYE_Z)
    fwd = (Vector((0, -1, 0)) * 0.55 + n * 0.45).normalized(); fwd.z = 0; fwd.normalize()
    x_ax = Vector((-fwd.y, fwd.x, 0)).normalized()
    if x_ax.x < 0: x_ax = -x_ax
    ctr = p - fwd * (EYE_R[1] * 0.42)
    root = new_obj(f'eye_{s}'); root.empty_display_size = 0.1
    rot = Matrix((x_ax, -fwd, Vector((0, 0, 1)))).transposed()
    root.matrix_world = Matrix.Translation(ctr) @ rot.to_4x4() @ Matrix.Diagonal((*EYE_R, 1))
    def child(o, parent=root):
        o.parent = parent; o.matrix_parent_inverse = Matrix.Identity(4); return o
    iris_e = child(new_obj(f'iris_{s}')); iris_e.location = (0, -1, 0)
    pupil_e = child(new_obj(f'pupil_{s}'), iris_e)
    g1 = child(new_obj(f'glint1_{s}')); g1.location = (-0.30, -1, 0.36); g1.scale = (0.24, 1, 0.21)
    g2 = child(new_obj(f'glint2_{s}')); g2.location = (0.26, -1, -0.38); g2.scale = (0.11, 1, 0.10)
    ball = child(new_obj(f'eyeball_{s}', sphere_mesh(f'eyeball_{s}', 1.0)))
    ball.data.materials.append(eye_material(f'eye_{s}', iris_e, pupil_e, g1, g2))
    lid = child(new_obj(f'lid_{s}', sphere_mesh(f'lid_{s}', 1.09, zmin=0.0))); lid.data.materials.append(lid_material(f'lid_{s}'))
    lid.rotation_mode = 'XYZ'
    low = child(new_obj(f'lowlid_{s}', sphere_mesh(f'lowlid_{s}', 1.075, zmax=0.0))); low.data.materials.append(LIDSKIN)
    low.rotation_mode = 'XYZ'
    # outer lash flick: a small curved tapered wedge at the outer upper corner of the lid
    lv, lf = [], []
    for i in range(7):
        a = i / 6
        ang = math.radians(25 + 40 * a)
        r = 1.10 + 0.05 * a
        w = 0.16 * (1 - a) + 0.02
        cx, cz = math.cos(ang) * r, math.sin(ang) * r
        lv += [(cx, -0.25, cz), (cx + 0.18 * a + 0.05, -0.25, cz + w * 0.2 + 0.08 * a * a + w)]
    for i in range(6): lf.append((2 * i, 2 * i + 2, 2 * i + 3, 2 * i + 1))
    lmat = mat(f'lashmat_{s}', LASH, 0.5)
    flick = child(mesh_obj(f'lash_{s}', lv, lf, lmat), lid)
    sol = flick.modifiers.new('t', 'SOLIDIFY'); sol.thickness = 0.12; sol.offset = 0
    EYES.append(dict(side=side, root=root, iris=iris_e, pupil=pupil_e, g1=g1, g2=g2, ball=ball, lid=lid, low=low,
                     flick=flick, base=root.matrix_world.copy(), ctr=ctr, fwd=fwd))

# ---------------------------------------------------------------- decals: brows, mouth, blush, closed-eye strokes
BROW_C = srgb2lin((0.36, 0.17, 0.07)); LINE_C = srgb2lin((0.30, 0.06, 0.09))
def flat_mat(name, color, rough=0.5, emit=0.0):
    return mat(name, color, rough, coat=0.2, **({'Emission Color': color, 'Emission Strength': emit} if emit else {}))
BROW_M = flat_mat('brow', BROW_C, 0.6)
LINE_M = flat_mat('mouth_line', LINE_C, 0.4)
CLOSED_M = flat_mat('closed_eye', LASH, 0.4)

def mouth_material():
    m = bpy.data.materials.new('mouth_fill'); t = NT(m); b = principled(m)
    uv = t.node('ShaderNodeUVMap', uv_map='UVMap'); sep = t.node('ShaderNodeSeparateXYZ'); t.link(uv.outputs[0], sep.inputs[0])
    u, v = sep.outputs[0], sep.outputs[1]
    teeth_on = t.value(1.0); grim_on = t.value(0.0); tongue_on = t.value(1.0)
    # tongue: ellipse resting on the lower lip
    tu = t.math('DIVIDE', u, 0.62); tv = t.math('DIVIDE', t.math('SUBTRACT', v, -0.05), 0.52)
    tongue = t.math('MULTIPLY', t.math('SUBTRACT', 1.0, t.smooth(t.math('ADD', t.math('MULTIPLY', tu, tu), t.math('MULTIPLY', tv, tv)), 0.85, 1.0)), tongue_on.outputs[0])
    teeth = t.math('MULTIPLY', t.smooth(v, 0.70, 0.76), teeth_on.outputs[0])
    teeth = t.math('MULTIPLY', teeth, t.math('SUBTRACT', 1.0, t.smooth(t.math('ABSOLUTE', u), 0.78, 0.9)))
    # grimace: clenched teeth filling the mouth, a dark bite line and tooth gaps
    gin = t.math('MULTIPLY', t.smooth(v, 0.12, 0.17), t.math('SUBTRACT', 1.0, t.smooth(v, 0.83, 0.88)))
    gin = t.math('MULTIPLY', gin, t.math('SUBTRACT', 1.0, t.smooth(t.math('ABSOLUTE', u), 0.86, 0.93)))
    bite = t.math('SUBTRACT', 1.0, t.smooth(t.math('ABSOLUTE', t.math('SUBTRACT', v, 0.5)), 0.035, 0.06))
    gap = t.math('SUBTRACT', 1.0, t.smooth(t.math('ABSOLUTE', t.math('SUBTRACT', t.math('FRACT', t.math('MULTIPLY', t.math('ADD', u, 1.0), 2.5)), 0.5)), 0.42, 0.47))
    gap = t.math('SUBTRACT', 1.0, gap)
    grim = t.math('MULTIPLY', t.math('MULTIPLY', gin, t.math('MULTIPLY', t.math('SUBTRACT', 1.0, bite), t.math('SUBTRACT', 1.0, t.math('MULTIPLY', gap, 0.7)))), grim_on.outputs[0])
    col = t.mix(tongue, srgb2lin((0.33, 0.04, 0.10)), srgb2lin((0.98, 0.42, 0.52)))
    col = t.mix(teeth, col, (0.97, 0.95, 0.96))
    col = t.mix(grim, col, (0.97, 0.95, 0.96))
    t.link(col, b.inputs['Base Color']); b.inputs['Roughness'].default_value = 0.3; b.inputs['Coat Weight'].default_value = 0.6
    return m, teeth_on, grim_on, tongue_on
MOUTH_M, TEETH_ON, GRIM_ON, TONGUE_ON = mouth_material()

def blush_material():
    m = bpy.data.materials.new('blush'); t = NT(m); b = principled(m)
    uv = t.node('ShaderNodeUVMap', uv_map='UVMap'); sep = t.node('ShaderNodeSeparateXYZ'); t.link(uv.outputs[0], sep.inputs[0])
    r = t.math('SQRT', t.math('ADD', t.math('MULTIPLY', sep.outputs[0], sep.outputs[0]), t.math('MULTIPLY', sep.outputs[1], sep.outputs[1])))
    strength = t.value(0.6)
    a = t.math('MULTIPLY', t.math('SUBTRACT', 1.0, t.smooth(r, 0.0, 1.0)), strength.outputs[0])
    mixs = t.node('ShaderNodeMixShader'); tr = t.node('ShaderNodeBsdfTransparent')
    b.inputs['Base Color'].default_value = (*srgb2lin((1.0, 0.42, 0.55)), 1); b.inputs['Roughness'].default_value = 0.5
    out = next(n for n in t.n if n.type == 'OUTPUT_MATERIAL')
    t.link(a, mixs.inputs[0]); t.link(tr.outputs[0], mixs.inputs[1]); t.link(b.outputs[0], mixs.inputs[2]); t.link(mixs.outputs[0], out.inputs[0])
    return m, strength
BLUSH_M, BLUSH_K = blush_material()

def project(pts2d, off, flatten=False):
    out = []
    for (x, z) in pts2d:
        p, n = surf(x, z); out.append(p + n * off)
    if flatten:   # strokes that cross a hair edge: keep each column at its frontmost depth
        for i in range(0, len(out) - 1, 2):
            y = min(out[i].y, out[i + 1].y); out[i].y = out[i + 1].y = y
    return [tuple(v) for v in out]

def ribbon(center, widths, off=0.006, flatten=False):
    """a stroke along a 2D polyline: verts in pairs (left, right), quads between"""
    pts, uvs = [], []
    n = len(center)
    for i, ((x, z), w) in enumerate(zip(center, widths)):
        a = center[max(0, i - 1)]; b = center[min(n - 1, i + 1)]
        tx, tz = b[0] - a[0], b[1] - a[1]; L = math.hypot(tx, tz) or 1; nx, nz = -tz / L, tx / L
        pts += [(x + nx * w / 2, z + nz * w / 2), (x - nx * w / 2, z - nz * w / 2)]
        uvs += [(i / (n - 1) * 2 - 1, 1), (i / (n - 1) * 2 - 1, -1)]
    faces = [(2 * i, 2 * i + 1, 2 * i + 3, 2 * i + 2) for i in range(n - 1)]
    return project(pts, off, flatten), faces, uvs

def taper(n, w, head=0.25, tail=0.25, min_w=0.15):
    out = []
    for i in range(n):
        a = i / (n - 1)
        k = min(1.0, a / head if head else 1, (1 - a) / tail if tail else 1)
        out.append(w * (min_w + (1 - min_w) * math.sin(k * math.pi / 2)))
    return out

def filled(top, bot, xs, off=0.005):
    """a filled mouth between a top and bottom curve; uv = (x / half width, 0 at the bottom lip .. 1 at the top lip)"""
    pts, uvs, NV = [], [], 7
    w = max(abs(x) for x in xs) or 1
    for x in xs:
        zt, zb = top(x), bot(x)
        for j in range(NV):
            v = j / (NV - 1); pts.append((x, zb + (zt - zb) * v)); uvs.append((x / w, v))
    faces = [(i * NV + j, (i + 1) * NV + j, (i + 1) * NV + j + 1, i * NV + j + 1) for i in range(len(xs) - 1) for j in range(NV - 1)]
    return project(pts, off), faces, uvs

def decal_obj(name, material):
    o = mesh_obj(name, [(0, 0, 0)] * 3, [(0, 1, 2)], material, uvs=[(0, 0)] * 3)
    bone_parent(o, 'head'); return o
BROWS = {s: decal_obj(f'brow_{s}', BROW_M) for s in (1, -1)}
CLOSED = {s: decal_obj(f'closed_{s}', CLOSED_M) for s in (1, -1)}
MOUTH_LINE = decal_obj('mouth_line', LINE_M)
MOUTH_FILL = decal_obj('mouth_fill', MOUTH_M)
BLUSH = decal_obj('blush', BLUSH_M)
for o in BROWS.values(): o.visible_shadow = False

def ellipse_fill(cx, cz, rx, rz, off):
    pts, uvs, faces, N, R = [], [], [], 28, 4
    pts.append((cx, cz)); uvs.append((0, 0))
    for r in range(1, R + 1):
        for i in range(N):
            a = i / N * math.tau; pts.append((cx + math.cos(a) * rx * r / R, cz + math.sin(a) * rz * r / R))
            uvs.append((math.cos(a) * r / R, math.sin(a) * r / R))
    for i in range(N): faces.append((0, 1 + i, 1 + (i + 1) % N))
    for r in range(1, R):
        for i in range(N):
            a0 = 1 + (r - 1) * N; a1 = 1 + r * N
            faces.append((a0 + i, a1 + i, a1 + (i + 1) % N, a0 + (i + 1) % N))
    return project(pts, off), faces, uvs

bv, bf, bu = [], [], []
for s in (1, -1):
    v, f, u = ellipse_fill(s * 0.30, 1.445, 0.085, 0.048, 0.004)
    o = len(bv); bv += v; bf += [tuple(i + o for i in t) for t in f]; bu += u
set_mesh(BLUSH, bv, bf, bu)

# ---------------------------------------------------------------- tiara
GOLD = mat('tiara_gold', (1.0, 0.66, 0.24), 0.16, 1.0)
GOLD_DK = mat('tiara_gold_band', (1.0, 0.68, 0.28), 0.22, 1.0)
GEM = mat('tiara_gem', srgb2lin((1.0, 0.30, 0.56)), 0.0, 0, 0, **{'Transmission Weight': 1.0, 'IOR': 2.1,
          'Emission Color': srgb2lin((1.0, 0.25, 0.5)), 'Emission Strength': 0.6})
PEARL = mat('pearl', srgb2lin((1.0, 0.95, 0.94)), 0.22, 0, 1.0, **{'Sheen Weight': 0.6, 'Sheen Tint': srgb2lin((1.0, 0.75, 0.85))})

T_ZF, T_ZB, T_Y = 2.03, 2.13, 0.03   # band height at the front and back, head axis y
T_ARC = math.radians(100)
def band_point(th, extra=0.012):
    z = T_ZF + (T_ZB - T_ZF) * (1 - math.cos(th)) / 2
    d = Vector((math.sin(th), -math.cos(th), 0))
    c = Vector((0, T_Y, z))
    hit = BVH.ray_cast(c + d * 2.0, -d)
    p = hit[0] if hit[0] is not None else c + d * 0.45
    return p + d * extra, d
UPV = Vector((0, 0.12, 0.99)).normalized()
def dome(a, c, w, H, p=0.6):
    x = abs(a - c) / w
    return H * (1 - x * x) ** p if x < 1 else 0.0
def crest_h(th):
    a = abs(th)
    h = 0.022 + 0.012 * abs(math.sin(a * math.pi / 0.115))            # scalloped edge along the band
    h = max(h, 0.19 * max(0.0, 1 - a / 0.23) ** 0.6)                  # slim pointed centre arch holding the gem
    h = max(h, dome(a, 0.50, 0.15, 0.11))                             # side domes (pearls)
    h = max(h, dome(a, 0.88, 0.12, 0.07))                             # outer domes (pearls)
    fade = min(1.0, (T_ARC - 0.08 - a) / 0.3)
    return h * max(0.0, fade)
def crest_dir(th, d):
    return (UPV * 1.0 + d * 0.18).normalized()
def crest_pt(th, hh):
    p, d = band_point(th); up = crest_dir(th, d)
    return p + up * hh + d * (0.002 - 0.3 * max(0.0, hh) ** 2), d, up

NT_ = 181
BAND_H, BAND_T = 0.036, 0.022
band_v, band_f = [], []
prof = [(-BAND_T / 2, -BAND_H / 2), (BAND_T / 2, -BAND_H / 2), (BAND_T / 2 + 0.006, 0), (BAND_T / 2, BAND_H / 2), (-BAND_T / 2, BAND_H / 2)]
np_ = len(prof)
for i in range(NT_):
    th = -T_ARC + 2 * T_ARC * i / (NT_ - 1)
    p, d = band_point(th); up = crest_dir(th, d)
    for (a_, b_) in prof: band_v.append(tuple(p + d * a_ + up * b_))
for i in range(NT_ - 1):
    for k in range(np_):
        a_, b_ = i * np_ + k, i * np_ + (k + 1) % np_
        band_f.append((a_, b_, b_ + np_, a_ + np_))
band_f += [tuple(range(np_))[::-1], tuple(range((NT_ - 1) * np_, NT_ * np_))]
band = mesh_obj('tiara_band', band_v, band_f, GOLD_DK)
md = band.modifiers.new('sub', 'SUBSURF'); md.levels = 1; md.render_levels = 2

# crest: a thin gold plate between the band and the crest_h profile, with round filigree openings
HOLES = [(0.50, 0.060, 0.027), (-0.50, 0.060, 0.027), (0.88, 0.045, 0.017), (-0.88, 0.045, 0.017)]
T_C, NTC, NS = T_ARC - 0.13, 401, 34
R_AX = 0.42
cv, cf, ghh = [], [], []
for i in range(NTC):
    th = -T_C + 2 * T_C * i / (NTC - 1); h = crest_h(th)
    for j in range(NS):
        hh = -BAND_H * 0.2 + (h + BAND_H * 0.5) * j / (NS - 1)
        cv.append(tuple(crest_pt(th, hh)[0])); ghh.append((th, hh))
for i in range(NTC - 1):
    for j in range(NS - 1):
        q = (i * NS + j, i * NS + j + 1, (i + 1) * NS + j + 1, (i + 1) * NS + j)
        th = sum(ghh[k][0] for k in q) / 4; hh = sum(ghh[k][1] for k in q) / 4
        if any(((th - tc) * R_AX) ** 2 + (hh - hc) ** 2 < r * r for tc, hc, r in HOLES): continue
        cf.append(q)
crest = mesh_obj('tiara_crest', cv, cf, GOLD)
crest.data.validate()
md = crest.modifiers.new('sol', 'SOLIDIFY'); md.thickness = 0.013; md.offset = 0
# rounded wire rims: around each opening and along the scalloped top edge
rims = []
for tc, hc, r in HOLES:
    c, d, up = crest_pt(tc, hc)
    bpy.ops.mesh.primitive_torus_add(major_radius=r, minor_radius=0.0085, major_segments=28, minor_segments=8, location=c)
    t_ = bpy.context.object; t_.matrix_world = Matrix.Translation(c) @ Matrix((up.cross(d).normalized(), up, d)).transposed().to_4x4()
    t_.data.materials.append(GOLD); t_.data.shade_smooth(); rims.append(t_)
cu = bpy.data.curves.new('tiara_edge', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = 0.0075; cu.bevel_resolution = 3; cu.use_fill_caps = True
sp = cu.splines.new('POLY'); edge = [crest_pt(th, crest_h(th) + BAND_H * 0.3)[0] for th in np.linspace(-T_C, T_C, 241)]
sp.points.add(len(edge) - 1)
for pt, e in zip(sp.points, edge): pt.co = (*e, 1)
edge_o = new_obj('tiara_edge', cu); cu.materials.append(GOLD); rims.append(edge_o)
# centre gem: a round brilliant facing out of the crest, in a gold bezel
gem_c, d0, up0 = crest_pt(0.0, 0.088); gem_c = gem_c + d0 * 0.013
gv, gf = [], []
NG, RG = 10, 0.047
gv.append((0, 0, -RG * 0.85))                                            # culet (pointing into the crest)
for i in range(NG):
    a = (i + 0.5) / NG * math.tau; gv.append((math.cos(a) * RG, math.sin(a) * RG * 1.15, 0))
for i in range(NG):
    a = i / NG * math.tau; gv.append((math.cos(a) * RG * 0.58, math.sin(a) * RG * 0.58 * 1.15, RG * 0.42))
for i in range(NG):
    gf.append((0, 1 + (i + 1) % NG, 1 + i))
    gf.append((1 + i, 1 + (i + 1) % NG, 1 + NG + (i + 1) % NG))
    gf.append((1 + i, 1 + NG + (i + 1) % NG, 1 + NG + i))
gf.append(tuple(1 + NG + i for i in range(NG)))
gem = mesh_obj('tiara_gem', gv, gf, GEM, smooth=False)
gem.matrix_world = Matrix.Translation(gem_c) @ d0.to_track_quat('Z', 'Y').to_matrix().to_4x4()
bpy.ops.mesh.primitive_torus_add(major_radius=RG * 1.05, minor_radius=0.009, major_segments=32, minor_segments=10, location=gem_c - d0 * 0.004)
bezel = bpy.context.object; bezel.data.materials.append(GOLD)
bezel.matrix_world = Matrix.Translation(gem_c - d0 * 0.004) @ d0.to_track_quat('Z', 'Y').to_matrix().to_4x4() @ Matrix.Diagonal((1, 1.15, 1, 1))
# pearls on the side peaks, and a little pearl on the gem's tip
pearls = []
for th, r in ((0.50, 0.029), (-0.50, 0.029), (0.88, 0.023), (-0.88, 0.023), (0.0, 0.022)):
    c, d, up = crest_pt(th, BAND_H * 0.3 + crest_h(th) + r * 0.75)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, segments=24, ring_count=12, location=c)
    pe = bpy.context.object; pe.data.materials.append(PEARL); bpy.ops.object.shade_smooth(); pearls.append(pe)
for o in [band, crest, gem, bezel] + rims + pearls:
    bone_parent(o, 'head')
TIARA = bpy.data.collections.new('tiara_lit')
for o in [band, crest, gem, bezel] + rims + pearls: TIARA.objects.link(o)

# ---------------------------------------------------------------- bell skirt with a lace petticoat
DRESS_C = atlas_color(0.06, 0.62)
DRESS = mat('dress', DRESS_C, 0.32, 0, 0.8, **{'Sheen Weight': 0.5, 'Sheen Tint': srgb2lin((1.0, 0.8, 0.9))})
LACE = mat('lace', srgb2lin((1.0, 0.93, 0.95)), 0.5, 0, 0.3, **{'Sheen Weight': 0.8})
WAIST_Z, HEM_Z = 0.66, 0.27
prof = [(0.355, 0.66), (0.40, 0.60), (0.47, 0.52), (0.54, 0.43), (0.60, 0.35), (0.635, 0.30), (0.645, 0.275)]
NA = 96
sv, sf = [], []
for i in range(NA):
    a = i / NA * math.tau
    for j, (r, z) in enumerate(prof):
        t_ = j / (len(prof) - 1)
        rr = r * (1 + 0.045 * t_ ** 1.5 * math.cos(a * 12))           # soft pleats opening toward the hem
        sv.append((math.sin(a) * rr, -math.cos(a) * rr * 0.92 + 0.0, z))
NP = len(prof)
for i in range(NA):
    for j in range(NP - 1):
        a, b = i * NP + j, ((i + 1) % NA) * NP + j
        sf.append((a, b, b + 1, a + 1))
skirt = mesh_obj('skirt', sv, sf, DRESS)
md = skirt.modifiers.new('sol', 'SOLIDIFY'); md.thickness = 0.025; md.offset = 1
md = skirt.modifiers.new('sub', 'SUBSURF'); md.levels = 1; md.render_levels = 2
# petticoat ruffle peeking under the hem
lv_, lf_ = [], []
NR = 192
for i in range(NR):
    a = i / NR * math.tau
    wav = 0.012 * math.sin(a * 36)
    for (dr, dz) in ((-0.035, 0.035), (0.0 + wav, -0.012), (0.02 + wav, -0.045)):
        rr = 0.62 + dr + 0.045 * math.cos(a * 12) * 0.6
        lv_.append((math.sin(a) * rr, -math.cos(a) * rr * 0.92, HEM_Z + dz))
for i in range(NR):
    for j in range(2):
        a, b = i * 3 + j, ((i + 1) % NR) * 3 + j
        lf_.append((a, b, b + 1, a + 1))
lace = mesh_obj('petticoat', lv_, lf_, LACE)
md = lace.modifiers.new('sol', 'SOLIDIFY'); md.thickness = 0.012
md = lace.modifiers.new('sub', 'SUBSURF'); md.levels = 1
# gold trim along the waist
tv, tf = [], []
for i in range(NA):
    a = i / NA * math.tau
    for (dr, dz) in ((0.0, 0.025), (0.012, 0.0), (0.0, -0.025)):
        r = 0.36 + dr
        tv.append((math.sin(a) * r, -math.cos(a) * r * 0.92, WAIST_Z - 0.02 + dz))
for i in range(NA):
    for j in range(2):
        a, b = i * 3 + j, ((i + 1) % NA) * 3 + j
        tf.append((a, b, b + 1, a + 1))
trim = mesh_obj('waist_trim', tv, tf, GOLD)
md = trim.modifiers.new('sol', 'SOLIDIFY'); md.thickness = 0.01
# skirt and petticoat are skinned: rigid on the hips at the waist, following each thigh toward the hem so a
# lifted knee pushes the skirt forward instead of poking through it
def skin_skirt(o):
    vg = {n: o.vertex_groups.new(name=n) for n in ('hips', 'upperleg.l', 'upperleg.r')}
    for v in o.data.vertices:
        t = max(0.0, min(1.0, (WAIST_Z - v.co.z) / (WAIST_Z - HEM_Z + 0.05)))
        leg = 0.45 * t ** 2.0
        wl = max(0.0, min(1.0, 0.5 + v.co.x / 0.36))
        vg['hips'].add([v.index], 1 - leg, 'REPLACE')
        vg['upperleg.l'].add([v.index], leg * wl, 'REPLACE')
        vg['upperleg.r'].add([v.index], leg * (1 - wl), 'REPLACE')
    o.parent = arm
    md = o.modifiers.new('arm', 'ARMATURE'); md.object = arm
    o.modifiers.move(o.modifiers.find('arm'), 0)
for o in (skirt, lace): skin_skirt(o)
bone_parent(trim, 'hips')

# ---------------------------------------------------------------- back to pose; parent the face rig; scale
for e in EYES:
    bone_parent(e['root'], 'head'); e['scale0'] = e['root'].scale.copy()
arm.data.pose_position = 'POSE'; bpy.context.view_layer.update()
k = (HEIGHT * 0.1) / (Z1 - Z0)
arm.scale = [s * k for s in arm.scale]; arm.location.z -= Z0 * k; arm.location.x -= CX * k
arm.rotation_mode = 'XYZ'   # (the old 'three-quarter view' rotation never applied: the importer leaves it quaternion)
bpy.context.view_layer.update()

# ---------------------------------------------------------------- expressions
NEUTRAL = dict(gx=0.0, gz=0.0, lid=0.16, low=0.0, iris=1.0, pupil=1.0, eye=1.0, glint=1.0, eyes='open',
               braise=0.0, btilt=0.0, mouth='smile', mw=1.0, mh=0.0, mc=0.5, wave=0.0, blush=0.55)

def apply_face(P):
    for e in EYES:
        s = e['side']
        e['iris'].location = (P['gx'] * 0.36, -1, P['gz'] * 0.30)
        r = 0.66 * P['iris']; e['iris'].scale = (r, 1, r * 1.08)
        pr = 0.46 * P['pupil'] / P['iris']; e['pupil'].scale = (pr, 1, pr * 1.1)
        g = P['glint']; e['g1'].scale = (0.24 * g, 1, 0.21 * g); e['g2'].scale = (0.11 * g, 1, 0.10 * g)
        # lids are hemispheres rotated about the eye's x axis; e = height of the lid edge at the front of the eye
        e['lid'].rotation_euler = (-math.asin(max(-1, min(1, 1 - 2 * P['lid']))), 0, 0)
        e['low'].rotation_euler = (-math.asin(max(-1, min(1, -1 + 2 * P['low']))), 0, 0)
        e['root'].scale = e['scale0'] * P['eye']
        show = P['eyes'] == 'open'
        for key in ('ball', 'lid', 'low', 'flick'): e[key].hide_render = not show
        # closed-eye strokes
        cx, cz = s * EYE_X, EYE_Z
        o = CLOSED[s]
        if P['eyes'] == 'happy':          # ^ arcs
            pts = [(cx + (i / 14 * 2 - 1) * 0.10, cz - 0.02 + 0.06 * (1 - (i / 14 * 2 - 1) ** 2)) for i in range(15)]
            v, f, u = ribbon(pts, taper(15, 0.034, 0.3, 0.3, 0.25), off=0.006); set_mesh(o, v, f, u); o.hide_render = False
        elif P['eyes'] == 'squeeze':      # > <  pointing at the nose
            pts = [(cx + s * (0.075 - 0.15 * (1 - abs(2 * (i / 14) - 1)) ** 1.3), cz + 0.075 * (1 - 2 * i / 14)) for i in range(15)]
            v, f, u = ribbon(pts, taper(15, 0.032, 0.3, 0.3, 0.3), off=0.006); set_mesh(o, v, f, u); o.hide_render = False
        else:
            o.hide_render = True
        # brows: inner end at x 0.10, outer at 0.30; tilt > 0 lifts the inner end (worry), < 0 drops it (anger)
        rz = P['braise'] * 0.035
        tilt = math.radians(P['btilt'])
        pts = []
        for i in range(13):
            t_ = i / 12
            x = 0.105 + t_ * 0.19; z = 1.765 + 0.018 * math.sin(t_ * math.pi) - 0.006 * t_
            dx, dz = x - 0.2, z - 1.765
            x2 = 0.2 + dx * math.cos(tilt) + dz * math.sin(tilt)
            z2 = 1.765 - dx * math.sin(tilt) + dz * math.cos(tilt) + rz
            pts.append((s * x2, z2))
        ws = [0.036 * (1 - 0.55 * (i / 12)) * min(1, (i + 1) / 2.5) for i in range(13)]
        v, f, u = ribbon(pts, ws, off=0.010, flatten=True); set_mesh(BROWS[s], v, f, u)
    # mouth
    MZ = 1.383; w = 0.075 * P['mw']; kind = P['mouth']
    xs = [w * -math.cos(i / 20 * math.pi) for i in range(21)]
    if kind in ('smile', 'frown', 'flat', 'wavy'):
        c = {'smile': 1.0, 'frown': -1.0, 'flat': 0.0, 'wavy': 0.0}[kind] * P['mc'] * 0.035
        pts = [(x, MZ + c * ((x / w) ** 2 - 0.4) + P['wave'] * 0.012 * math.sin((x / w) * math.pi * 1.5)) for x in xs]
        v, f, u = ribbon(pts, taper(21, 0.026, 0.25, 0.25, 0.3), off=0.006)
        set_mesh(MOUTH_LINE, v, f, u); MOUTH_LINE.hide_render = False; MOUTH_FILL.hide_render = True
    else:
        h = 0.02 + 0.10 * P['mh']; c = P['mc'] * 0.03
        TEETH_ON.outputs[0].default_value = 1.0 if kind == 'open' else 0.0
        GRIM_ON.outputs[0].default_value = 1.0 if kind == 'grimace' else 0.0
        TONGUE_ON.outputs[0].default_value = 0.0 if kind == 'grimace' else 1.0
        if kind == 'open':     # D-shaped laugh: flat top lifted at the corners, deep round bottom
            top = lambda x: MZ + 0.012 + c * (abs(x / w) ** 2.2) * 0.4
            bot = lambda x: MZ + 0.012 + c * 0.4 - (h + c * 0.4) * (1 - abs(x / w) ** 2.2) ** 0.75
        elif kind == 'O':      # oval scream
            top = lambda x: MZ - h * 0.35 + h * 0.6 * (1 - (x / w) ** 2) ** 0.5
            bot = lambda x: MZ - h * 0.35 - h * 0.6 * (1 - (x / w) ** 2) ** 0.5
        else:                  # grimace: wide clenched box, corners pulled down
            top = lambda x: MZ + h * 0.5 - c * (abs(x / w) ** 3) * 0.6 - 0.004 * (1 - (1 - abs(x / w) ** 6) ** 0.5) * 8
            bot = lambda x: MZ - h * 0.5 - c * (abs(x / w) ** 3) * 0.6 + 0.004 * (1 - (1 - abs(x / w) ** 6) ** 0.5) * 8
        v, f, u = filled(top, bot, xs)
        set_mesh(MOUTH_FILL, v, f, u); MOUTH_FILL.hide_render = False; MOUTH_LINE.hide_render = True
    BLUSH_K.outputs[0].default_value = P['blush']

def lerp_keys(keys, t):
    """keys: [(t, {param overrides})] sorted, each key inheriting the previous one; the loop wraps from the last key
    to the first. Numbers ease smoothly between keys, other values switch half way."""
    full, acc = [], dict(NEUTRAL)
    for kt, d in keys:
        acc = dict(acc); acc.update(d); full.append((kt, acc))
    idx = max([i for i, (kt, _) in enumerate(full) if kt <= t] or [len(full) - 1])
    t0, a = full[idx]; t1, b = full[(idx + 1) % len(full)]
    if t1 <= t0: t1 += 1.0
    tt = t if t >= t0 else t + 1.0
    u = (tt - t0) / (t1 - t0) if t1 > t0 else 0.0; u = u * u * (3 - 2 * u)
    return {k: (a[k] + (b[k] - a[k]) * u if isinstance(a[k], float) and isinstance(b[k], float) else (a[k] if u < 0.5 else b[k]))
            for k in a}

def F(**kw): return {k: (float(v) if isinstance(v, int) and not isinstance(v, bool) else v) for k, v in kw.items()}
WORRY = F(btilt=17, braise=0.35, mouth='wavy', mw=0.85, wave=1.0, mc=0.3, lid=0.2)
EXPRESSIONS = {
    # waiting in the cage: worried, glancing around, a peek up-right at the serpent, one blink
    'Idle': [(0.0, dict(WORRY, gx=-0.35, gz=-0.1)),
             (0.18, F(gx=-0.45, gz=-0.15)),
             (0.30, F(gx=0.55, gz=0.55, braise=0.6, btilt=20, mouth='flat', mw=0.7)),
             (0.48, F(gx=0.6, gz=0.6, lid=0.12)),
             (0.60, F(gx=0.0, gz=0.0, lid=0.2, mouth='wavy', mw=0.85)),
             (0.68, F(lid=1.0, braise=0.2)),
             (0.74, F(lid=0.2, braise=0.35)),
             (0.86, F(gx=-0.35, gz=-0.1))],
    # waving "Help!": pleading, scared, calling out
    'Interact': [(0.0, F(btilt=22, braise=0.7, lid=0.08, mouth='O', mw=0.9, mh=0.55, gx=0.35, gz=0.35, pupil=0.9, glint=1.25, blush=0.8)),
                 (0.30, F(mh=0.9, mw=1.0)),
                 (0.55, F(mh=0.5, mw=0.85, gx=0.25, gz=0.2)),
                 (0.80, F(mh=0.95, mw=1.0, gx=0.4, gz=0.4))],
    # ducking from the clang: eyes squeezed shut, grimace
    'Blocking': [(0.0, F(eyes='squeeze', btilt=-14, braise=-0.5, mouth='grimace', mw=1.25, mh=0.25, mc=0.6, blush=0.75)),
                 (0.5, F(mw=1.35, mh=0.3)),],
    # cage open / snake stunned: overjoyed ^ ^, wide open laugh
    'Cheer': [(0.0, F(eyes='happy', braise=0.8, btilt=-2, mouth='open', mw=1.25, mh=0.65, mc=0.8, blush=1.0)),
              (0.25, F(mh=0.9, mw=1.35)),
              (0.5, F(eyes='open', lid=0.05, low=0.18, glint=1.45, mh=0.8, gx=0.0, gz=0.15)),
              (0.75, F(eyes='happy', mh=0.95))],
    # escaping: determined but happy
    'Running_A': [(0.0, F(btilt=-9, braise=0.05, lid=0.24, low=0.12, mouth='open', mw=1.05, mh=0.45, mc=0.8, gx=-0.35, gz=0.05, glint=1.15, blush=0.75)),
                  (0.5, F(mh=0.55))],
    # hop out: excited, wide eyes, big smile
    'Jump_Full_Short': [(0.0, F(braise=0.6, btilt=-3, lid=0.10, mouth='open', mw=1.1, mh=0.5, mc=0.8, glint=1.3, blush=0.85)),
                        (0.35, F(eye=1.08, braise=1.0, lid=0.0, mh=0.85, mw=1.2, gz=0.25, glint=1.45)),
                        (0.7, F(eye=1.0, braise=0.7, mh=0.6))],
    # caught by the serpent: terrified, huge eyes, tiny pupils, scream
    'Scared': [(0.0, F(eye=1.14, lid=0.0, iris=0.62, pupil=0.42, glint=0.9, btilt=26, braise=1.0, mouth='O', mw=0.85, mh=0.95, gx=0.25, gz=0.25, blush=0.3)),
               (0.25, F(gx=0.32, gz=0.32, mh=1.0)),
               (0.5, F(gx=0.2, gz=0.28, mh=0.85, mw=0.8)),
               (0.75, F(gx=0.3, gz=0.22, mh=1.0, mw=0.9))],
}

# ---------------------------------------------------------------- pose layers on top of a KayKit clip (armature space:
# +x her left, -y forward, +z up). Applied after the clip is evaluated, with the action detached so the render keeps them.
def _rot(name, axis, deg):
    pb = arm.pose.bones[name]; M = pb.matrix.copy(); h = M.translation.copy()
    pb.matrix = Matrix.Translation(h) @ Matrix.Rotation(math.radians(deg), 4, Vector(axis)) @ Matrix.Translation(-h) @ M
    bpy.context.view_layer.update()
def _aim(name, d, roll=0.0):
    pb = arm.pose.bones[name]; M = pb.matrix.copy(); h = M.translation.copy()
    q = M.col[1].xyz.normalized().rotation_difference(Vector(d).normalized())
    R = Matrix.Rotation(math.radians(roll), 4, Vector(d).normalized()) @ q.to_matrix().to_4x4()
    pb.matrix = Matrix.Translation(h) @ R @ Matrix.Translation(-h) @ M
    bpy.context.view_layer.update()

def nervous_pose(i, n):
    ph = i / n * math.tau
    _rot('chest', (1, 0, 0), 9)                                   # hunched, shoulders up
    _rot('head', (0, 0, 1), -34 - 16 * math.sin(ph))              # darting glances back over her shoulder
    _rot('head', (1, 0, 0), -5)
    tr = 3 * math.sin(ph * 3)                                     # trembling hands
    for s in (1, -1):                                             # hands wrung together under her chin
        _aim(f'upperarm.{"l" if s > 0 else "r"}', (s * 0.10, -0.62, -0.78))
        _aim(f'lowerarm.{"l" if s > 0 else "r"}', (-s * 0.62, -0.45, 0.64 + 0.04 * tr))
        _aim(f'hand.{"l" if s > 0 else "r"}', (-s * 0.75, -0.35, 0.55))

def panic_pose(i, n):
    ph = i / n * math.tau
    _rot('head', (0, 0, 1), -28 - 8 * math.sin(ph))               # face turned back toward the camera / the serpent
    _rot('head', (1, 0, 0), 6)
    # arms flung up and out, flailing forward and back out of phase. (Straight up they vanish behind the big head.)
    for s in (1, -1):
        w = math.sin(ph * 2 + (0 if s > 0 else math.pi))
        b = f'{"l" if s > 0 else "r"}'
        _aim('upperarm.' + b, (s * 0.55, -0.62 * w, 0.42 + 0.12 * w))
        _aim('lowerarm.' + b, (s * 0.45, -0.45 * w - 0.15, 0.85))
        _aim('hand.' + b, (s * 0.35, -0.3 * w - 0.2, 0.9))
POSE_FX = {'Nervous': nervous_pose, 'Panic': panic_pose}

# pacing in the cage: on edge, wide eyes darting back at the serpent, small anxious open mouth
EXPRESSIONS['Nervous'] = [
    (0.0, F(eye=1.06, lid=0.02, low=0.05, iris=0.84, pupil=0.66, glint=1.15, btilt=24, braise=0.7, mouth='O', mw=0.55, mh=0.22, gx=0.15, gz=0.05, blush=0.35)),
    (0.25, F(gx=-0.55, gz=0.1, mh=0.32, mw=0.6, braise=0.85)),
    (0.5, F(gx=-0.65, gz=0.15, mh=0.26)),
    (0.62, F(lid=0.9, braise=0.6)),                              # nervous blink
    (0.70, F(lid=0.02, braise=0.8, gx=0.0)),
    (0.85, F(gx=0.25, gz=0.0, mh=0.18, mw=0.5))]
# running in circles: terrified, huge eyes, pinprick pupils, screaming
EXPRESSIONS['Panic'] = [
    (0.0, F(eye=1.16, lid=0.0, low=0.0, iris=0.6, pupil=0.4, glint=0.95, btilt=28, braise=1.05, mouth='O', mw=1.0, mh=1.1, gx=-0.45, gz=0.2, blush=0.25)),
    (0.25, F(mh=1.2, mw=1.05, gx=-0.55, gz=0.25)),
    (0.5, F(mh=0.95, mw=0.95, gx=-0.35, gz=0.15)),
    (0.75, F(mh=1.2, mw=1.05, gx=-0.55, gz=0.28))]

# ---------------------------------------------------------------- lights, camera (unchanged from v1)
def area(loc, rot, energy, size, color):
    bpy.ops.object.light_add(type='AREA', location=loc, rotation=rot)
    l = bpy.context.object.data; l.energy = energy; l.size = size; l.color = color
area((-20, -9, 34), (math.radians(20), math.radians(-30), 0), 30000, 10, (1.0, 0.9, 0.8))
area((0, -30, 3), (math.radians(90), 0, 0), 2600, 16, (1.0, 0.95, 0.95))  # soft frontal fill so the face reads
area((30, -25, -5), (math.radians(85), math.radians(50), 0), 4000, 14, (0.55, 0.65, 1.0))
area((8, 20, 8), (math.radians(-70), 0, 0), 5000, 10, (0.8, 0.85, 1.0))  # rim from behind
area((0, -12, -30), (math.radians(140), 0, 0), 1400, 20, (1.0, 0.6, 0.45))
bpy.ops.object.light_add(type='POINT', location=(3, -2, 3)); L = bpy.context.object.data; L.energy = 120; L.color = (1, 0.65, 0.35)  # lantern
area((-8, -16, 14), (math.radians(50), 0, math.radians(-25)), 2500, 3, (1.0, 0.97, 0.9))   # jewellery light, tiara only
bpy.context.object.light_linking.receiver_collection = TIARA
w = bpy.data.worlds.new('w'); sc.world = w; w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.05, 0.04, 0.09, 1)
bpy.ops.object.camera_add(location=(0, -40, BOX * 0.1 / 2 - 0.4), rotation=(math.radians(90), 0, 0))
cam = bpy.context.object; sc.camera = cam; cam.data.type = 'ORTHO'; cam.data.ortho_scale = BOX * 0.1
sc.render.engine = 'CYCLES'; sc.cycles.samples = SAMPLES; sc.cycles.use_denoising = True; sc.cycles.device = 'CPU'
if THREADS: sc.render.threads_mode = 'FIXED'; sc.render.threads = THREADS
sc.render.resolution_x = sc.render.resolution_y = BOX * PX; sc.render.film_transparent = True
sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast'
FACE_SPAN = 2.4   # Blender units framed by the face close-up (4x the sprite's pixel density)
if FACE:
    sc.render.resolution_x = sc.render.resolution_y = int(round(FACE_SPAN * 10 * PX * 4))
    cam.data.ortho_scale = FACE_SPAN
os.makedirs(OUT, exist_ok=True)
if not FACE: bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, 'princess.blend'))

for spec in ANIMS:
    name, n = spec[0], int(spec[1])
    only = [int(x) for x in spec[2].split(',')] if len(spec) > 2 else range(n)
    src, r0, r1 = SOURCE.get(name, (name, 0.0, 1.0))
    act = bpy.data.actions[src]
    arm.animation_data_create(); arm.animation_data.action = act
    if hasattr(arm.animation_data, 'action_slot') and act.slots: arm.animation_data.action_slot = act.slots[0]
    a0, a1 = act.frame_range; f0, f1 = a0 + (a1 - a0) * r0, a0 + (a1 - a0) * r1
    x0 = arm.location.x
    arm.rotation_euler = (0, 0, math.radians(YAW.get(name, 0)))
    for i in only:
        for pb in arm.pose.bones:   # clear any pose layer left by the previous frame (POSE_FX) before the clip re-keys it
            pb.location = (0, 0, 0); pb.rotation_quaternion = (1, 0, 0, 0); pb.scale = (1, 1, 1)
        arm.animation_data.action = act
        if hasattr(arm.animation_data, 'action_slot') and act.slots: arm.animation_data.action_slot = act.slots[0]
        if r0 > 0 or r1 < 1:   # a held section of an action: ping-pong so the loop has no pop
            ph = 1 - abs(1 - 2 * i / n); sc.frame_set(round(f0 + (f1 - f0) * ph))
        else:
            fr = f0 + (f1 - f0) * i / n; sc.frame_set(int(fr), subframe=fr - int(fr))   # even steps on fractional clips
        arm.location.x = x0 + (0.035 * (1 if i % 2 else -1) if name == 'Scared' else 0.0)   # trembling
        if name in POSE_FX:
            bpy.context.view_layer.update(); arm.animation_data.action = None; POSE_FX[name](i, n)
        apply_face(lerp_keys(EXPRESSIONS.get(name, [(0.0, {})]), i / n))
        bpy.context.view_layer.update()
        if FACE:
            hp = arm.matrix_world @ arm.pose.bones['head'].head
            cam.location = (hp.x - 0.05, -40, hp.z + 0.62)
            sc.render.filepath = os.path.join(OUT, f'{name}_face_{i:02d}.png')
        else:
            sc.render.filepath = os.path.join(OUT, f'{name}_{i:02d}.png')
        bpy.ops.render.render(write_still=True)
    arm.location.x = x0; arm.rotation_euler = (0, 0, 0)
    print('rendered', name, len(only))
```


---

## `art/kit.py`

Open-helmet cobalt knight from KayKit Knight (CC0): continuous skin, fitted expressive face, hand-mounted heater shield and eight real rig animation families. Supersampled output is normalized to 168-pixel cells with fixed feet anchor; presentation portraits/turnaround are separate.

```python
# Prince Kit: open-helmet knight with a surface-fitted expression rig and real KayKit animation.
# Run: python3 art/kit.py <out_dir> <Idle:16> <Focus:12> ... [--face] [--yaw degrees] [--samples N] [--threads N]
import bpy, bmesh, sys, os, math, json, addon_utils
import numpy as np
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import hashlib
addon_utils.enable('cycles', default_set=True)
HERE = os.path.dirname(os.path.abspath(__file__))
argv = sys.argv[1:]

def build_deliverables():
    root=Path(HERE).parent; folder=root/'assets/kit'; proof=root/'out/kit-proof'
    meta=json.loads((folder/'meta.json').read_text()); clips=meta['anims']; report=[]; frames={}
    for name,clip in clips.items():
        paths=[folder/f'{name}_{i:02d}.png' for i in range(clip['frames'])]
        assert len(list(folder.glob(name+'_[0-9][0-9].png')))==len(paths), f'Wrong frame count: {name}'
        images=[]; hashes=[]; boxes=[]
        for path in paths:
            with Image.open(path) as im:
                assert im.mode=='RGBA' and im.size==(168,168), f'Wrong sprite format: {path}'
                assert not im.text, f'Unexpected PNG text metadata: {path}'
                bb=im.getchannel('A').point(lambda a:255 if a>8 else 0).getbbox()
                assert bb and min(bb[:2])>1 and max(bb[2:])<167, f'Clipped frame: {path} {bb}'
                images.append(im.copy());boxes.append(bb)
            hashes.append(hashlib.sha256(path.read_bytes()).hexdigest())
        assert len(set(hashes))>1, f'Static animation: {name}'
        frames[name]=images
        report.append({'id':'kit-'+name.lower(),'path_pattern':f'assets/kit/{name}_NN.png',
                       'frames':clip['frames'],'fps':14,'loop':clip['loop'],'unique_frames':len(set(hashes)),
                       'alpha_bounds':boxes,'sha256':hashes})
    assert sum(c['frames'] for c in clips.values())==100
    font_path='C:/Windows/Fonts/arial.ttf'
    font=ImageFont.truetype(font_path,24) if Path(font_path).exists() else ImageFont.load_default(size=24)
    small=ImageFont.truetype(font_path,18) if Path(font_path).exists() else ImageFont.load_default(size=18)
    def board(size,title):
        im=Image.new('RGB',size,'#141831');ImageDraw.Draw(im).text((24,16),title,font=font,fill='white');return im
    def paste(dst,source,xy,size):
        im=source.convert('RGBA').resize(size,Image.Resampling.LANCZOS);dst.paste(im,xy,im)
    sheet=board((1200,744),'Prince Kit | eight expressions — actual Blender renders')
    labels=['Determined / serve','Focused / aim','Grin / combo','Shock / life lost','Worried / danger','Cheer / win','Hurt / hit','Laugh / titan']
    for i,(name,label) in enumerate(zip(clips,labels)):
        x=(i%4)*300+6;y=64+(i//4)*336
        with Image.open(folder/'faces'/f'{name}_face_00.png') as im:paste(sheet,im,(x,y),(288,288))
        ImageDraw.Draw(sheet).text((x+8,y+292),label,font=small,fill='white')
    sheet.save(folder/'expressions.png')
    turn=board((1440,480),'Prince Kit | finished model turnaround')
    sources=[proof/'turn-front/Idle_00.png',proof/'turn-quarter/Idle_00.png',proof/'turn-side/Idle_00.png',proof/'turn-back/Idle_00.png']
    for i,(path,label) in enumerate(zip(sources,['Front','Three quarter','Side','Back'])):
        with Image.open(path) as im:paste(turn,im,(i*360+12,62),(336,336))
        ImageDraw.Draw(turn).text((i*360+24,416),label,font=font,fill='white')
    turn.save(folder/'turnaround.png')
    contact=board((1880,1296),'Prince Kit | all 100 normalized frames')
    for row,(name,images) in enumerate(frames.items()):
        ImageDraw.Draw(contact).text((12,100+row*148),name,font=small,fill='white')
        for i,im in enumerate(images):paste(contact,im,(140+i*108,64+row*148),(108,108))
    contact.save(folder/'contact-sheet.png')
    preview=[]
    for t in range(16):
        im=board((1120,680),'Prince Kit | real rig animations · 14 fps')
        for i,(name,images) in enumerate(frames.items()):
            frame=images[t%len(images) if clips[name]['loop'] else min(t,len(images)-1)]
            x=(i%4)*280+6;y=56+(i//4)*310
            paste(im,frame,(x,y),(268,268));ImageDraw.Draw(im).text((x+16,y+270),name,font=small,fill='white')
        preview.append(im)
    palette=preview[0].quantize(colors=256,method=Image.Quantize.MEDIANCUT)
    preview=[im.quantize(palette=palette,dither=Image.Dither.FLOYDSTEINBERG) for im in preview]
    preview[0].save(folder/'preview.gif',save_all=True,append_images=preview[1:],duration=[int(round((t+1)*100/14)-round(t*100/14))*10 for t in range(16)],loop=0,disposal=2)
    manifest={'schema_version':1,'selected_direction':'B / Knight 2 — Blue Helmet Guardian',
              'status':'rendered; awaiting owner playtest approval','created_at':'2026-10-18',
              'source':{'model':'assets/models/kk_Knight.glb','license':'CC0','renderer':'Blender 5.2.2 / Cycles',
                        'script':'art/kit.py','editable_scene':'out/kit-proof/kit.blend'},
              'technical':{'cell_px':168,'world_cell':56,'character_height':42,'feet':4,'alpha':True,'fps':14,
                           'samples':48,'supersampling':2,'downsample':'Lanczos','png_text_metadata':False},
              'verification':{'frame_count':100,'all_clips_animated':True,'all_transparent_edges':True,
                              'skin_front_and_quarter_reviewed':True,'motion_clearance_reviewed':True,
                              'native_scale_reviewed':True,'in_engine_reviewed':False,'owner_final_approval':False},
              'deliverables':['assets/kit/turnaround.png','assets/kit/expressions.png','assets/kit/contact-sheet.png','assets/kit/preview.gif'],
              'assets':report}
    (root/'design/phase1/kit-asset-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
    print('Validated 100 frames; built turnaround, eight expressions, contact sheet, animated preview and manifest.')

if '--deliverables' in argv:
    build_deliverables();sys.exit(0)
FACE = '--face' in argv; SKIN_PROOF = '--skin' in argv; PROOF = '--proof' in argv
argv = [a for a in argv if a not in ('--face','--skin','--proof')]
def option(flag, default, cast=int):
    if flag not in argv: return default
    i=argv.index(flag); value=cast(argv[i+1]); del argv[i:i+2]; return value
SAMPLES=option('--samples',48); THREADS=option('--threads',4); YAW=option('--yaw',0,float)
OUT=os.path.abspath(argv[0]) if argv else os.path.join(HERE,'..','assets','kit')
ANIMS=[a.split(':') for a in argv[1:]] or [['Idle','16']]
PX, BOX, HEIGHT = 3, 56, 42
SOURCE={'Idle':('Idle',0,1),'Focus':('Blocking',0.22,0.68),'Grin':('Interact',0.0,1.0),
        'Shock':('Hit_A',0.0,0.85),'Worried':('Idle',0,1),'Cheer':('Cheer',0,1),
        'Hurt':('Block_Hit',0,0.9),'Laugh':('Cheer',0,1)}
for spec in ANIMS:
    assert spec[0] in SOURCE, f'Unknown clip: {spec[0]}'
    assert 1 <= int(spec[1]) <= 120, 'Frame count must be 1..120'
bpy.ops.wm.read_factory_settings(use_empty=True)
sc=bpy.context.scene
bpy.ops.import_scene.gltf(filepath=os.path.join(HERE,'..','assets','models','kk_Knight.glb'))
arm=next(o for o in sc.objects if o.type=='ARMATURE')
for o in sc.objects:
    if o.type=='MESH' and o.name in ('1H_Sword_Offhand','1H_Sword','2H_Sword','Rectangle_Shield','Round_Shield','Spike_Shield'):
        o.hide_render=True; o.hide_viewport=True
head=bpy.data.objects['Knight_Head']
arm.data.pose_position='REST'; bpy.context.view_layer.update()
def srgb2lin(c):
    c=np.asarray(c,dtype=np.float64)
    return tuple(np.where(c<=0.04045,c/12.92,((c+0.055)/1.055)**2.4))
def hexcol(s): return srgb2lin(tuple(int(s[i:i+2],16)/255 for i in (1,3,5)))
def principled(m):
    return next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
for m in bpy.data.materials:
    b = principled(m); b.inputs['Coat Weight'].default_value = 0.35; b.inputs['Coat Roughness'].default_value = 0.25
    b.inputs['Roughness'].default_value = 0.45

def mat(name, color, rough, metal=0.0, coat=0.0, **kw):
    m = bpy.data.materials.new(name); b = principled(m)
    b.inputs['Base Color'].default_value = (*color, 1); b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal; b.inputs['Coat Weight'].default_value = coat
    b.inputs['Coat Roughness'].default_value = 0.1
    for k, v in kw.items():
        b.inputs[k].default_value = v if not isinstance(v, tuple) else (*v, 1)[:len(b.inputs[k].default_value)]
    return m


SKIN=hexcol('#E7AB8B')
M_SKIN=mat('kit_skin',SKIN,0.45,coat=0.35)
M_HAIR=mat('kit_hair',hexcol('#253349'),0.4,coat=0.25)
M_STEEL=mat('kit_silver',hexcol('#8D97B3'),0.24,0.72,0.4)
M_EDGE=mat('kit_silver_edge',hexcol('#BFC8DD'),0.19,0.8,0.3)
M_BLUE=mat('kit_cobalt',hexcol('#356AB3'),0.43,coat=0.18)
M_NAVY=mat('kit_navy',hexcol('#26324D'),0.5,coat=0.12)
M_CORAL=mat('kit_coral',hexcol('#E76F71'),0.48,coat=0.12)

def loose_parts(bm):
    bm.faces.ensure_lookup_table(); seen=set(); parts=[]
    for f in bm.faces:
        if f.index in seen: continue
        stack=[f]; comp=[]; seen.add(f.index)
        while stack:
            g=stack.pop(); comp.append(g)
            for e in g.edges:
                for h in e.link_faces:
                    if h.index not in seen: seen.add(h.index); stack.append(h)
        parts.append(comp)
    return parts

def part_swatch(bm,comp):
    uv=bm.loops.layers.uv.active; loops=[l[uv].uv for f in comp for l in f.loops]
    return int(sum(v[0] for v in loops)/len(loops)*8),int((1-sum(v[1] for v in loops)/len(loops))*4)

def bounds(comp):
    vs={v for f in comp for v in f.verts}
    return vs,np.min([v.co[:] for v in vs],axis=0),np.max([v.co[:] for v in vs],axis=0)

# The lower jaw is part of the face hull; retain and weld it instead of leaving a face opening.
bm=bmesh.new(); bm.from_mesh(head.data); kill=[]; removed={'eyes':0,'brows':0}
for comp in loose_parts(bm):
    sw=part_swatch(bm,comp); vs,lo,hi=bounds(comp)
    kind=None
    if sw==(2,0): kind='eyes'
    elif sw==(1,0) and lo[2]>1.67 and hi[2]<1.81: kind='brows'
    if kind: kill+=comp; removed[kind]+=1
    elif sw==(0,0) and lo[1]<-0.52 and lo[2]>1.43:
        base=Vector((0,-0.4,1.49))
        for v in vs: v.co=base+(v.co-base)*0.50+Vector((0,0.025,0))
    elif sw==(1,0):
        if hi[2]>2.2 or lo[2]>1.99: kill+=comp
        else:
            for v in vs: v.co.z=1.816+(v.co.z-1.836)*0.44
assert removed=={'eyes':2,'brows':8}, f'Reinspect changed Knight head topology: {removed}'
bmesh.ops.delete(bm,geom=kill,context='FACES')
bmesh.ops.remove_doubles(bm,verts=bm.verts[:],dist=0.0005)
bm.to_mesh(head.data); bm.free()

# Reprofile the source helmet as a continuous open shell; the original closed visor hides the brows.
helmet=bpy.data.objects['Knight_Helmet']
hv,hf=[],[]; NH, NV=64,20
for i in range(NH):
    ph=i/NH*math.tau; a=abs((ph+math.pi)%math.tau-math.pi)
    u=max(0,min(1,(a-math.radians(52))/math.radians(22)));u=u*u*(3-2*u)
    end=1.26+(2.25-1.26)*u
    for j in range(NV+1):
        th=end*j/NV
        hv.append((0.54*math.copysign(abs(math.sin(ph))**0.65,math.sin(ph))*math.sin(th),-0.57*math.copysign(abs(math.cos(ph))**0.65,math.cos(ph))*math.sin(th),1.70+0.55*math.cos(th)-1.215891))
for i in range(NH):
    for j in range(NV):
        a=i*(NV+1)+j;b=((i+1)%NH)*(NV+1)+j
        hf.append((a,b,b+1,a+1))
helmet.data=bpy.data.meshes.new('kit_open_helmet');helmet.data.from_pydata(hv,[],hf)
bm=bmesh.new();bm.from_mesh(helmet.data);bmesh.ops.remove_doubles(bm,verts=bm.verts[:],dist=0.0001)
bmesh.ops.recalc_face_normals(bm,faces=bm.faces[:]);bm.to_mesh(helmet.data);bm.free()
sol=helmet.modifiers.new('shell_thickness','SOLIDIFY');sol.thickness=0.035;sol.offset=-1
bev=helmet.modifiers.new('soft_helmet_edge','BEVEL');bev.width=0.012;bev.segments=3

for o in [o for o in sc.objects if o.type=='MESH' and not o.hide_render]:
    bm=bmesh.new();bm.from_mesh(o.data); mats=[M_SKIN,M_HAIR,M_STEEL,M_EDGE,M_BLUE,M_NAVY,M_CORAL]
    o.data.materials.clear()
    for m in mats:o.data.materials.append(m)
    for comp in [[f] for f in bm.faces]:
        sw=part_swatch(bm,comp) if bm.loops.layers.uv.active else None
        if o==head: material=M_HAIR if sw==(1,0) else M_SKIN
        elif o==helmet: material=M_STEEL
        elif o.name=='Knight_Cape': material=M_BLUE
        elif o.name=='Badge_Shield': material=M_BLUE if sw==(5,1) else M_STEEL
        elif sw==(3,0): material=M_STEEL
        elif sw==(7,0): material=M_EDGE
        elif sw in ((4,0),(7,1),(0,1)): material=M_BLUE
        else: material=M_NAVY
        for f in comp:f.material_index=mats.index(material)
    bm.to_mesh(o.data);bm.free()
    o.data.shade_smooth()

# Fit the broad shield to the hand in the actual idle pose, with its protective face toward the viewer.
act=bpy.data.actions['Idle'];arm.animation_data_create();arm.animation_data.action=act
if hasattr(arm.animation_data,'action_slot') and act.slots:arm.animation_data.action_slot=act.slots[0]
arm.data.pose_position='POSE';sc.frame_set(1);bpy.context.view_layer.update()
shield=bpy.data.objects['Badge_Shield']
shield.matrix_world=Matrix.Translation(Vector((0.60,-0.40,0.72)))@Matrix.Rotation(math.radians(-12),4,'Z')
# Preserve this fitted relation when the head/hand rig is evaluated again in rest space.
fit_matrix=shield.matrix_world.copy(); hand_matrix=arm.matrix_world@arm.pose.bones['hand.l'].matrix
shield_fit=hand_matrix.inverted()@fit_matrix
shield_offset=Vector((0.60,-0.40,0.72))-hand_matrix.translation
arm.data.pose_position='REST';bpy.context.view_layer.update()
shield.matrix_world=(arm.matrix_world@arm.pose.bones['hand.l'].matrix)@shield_fit

head.data.update()
BVH=BVHTree.FromObject(head,bpy.context.evaluated_depsgraph_get())
def surf(x,z):
    hit=BVH.ray_cast(Vector((x,-2,z)),Vector((0,1,0)))
    if hit[0] is None:return Vector((x,-0.35,z)),Vector((0,-1,0))
    n=hit[1] if hit[1].y<0 else -hit[1]
    return hit[0],n
def bone_parent(o, bone):
    mw = o.matrix_world.copy(); o.parent = arm; o.parent_type = 'BONE'; o.parent_bone = bone; o.matrix_world = mw

def new_obj(name, mesh=None):
    o = bpy.data.objects.new(name, mesh); sc.collection.objects.link(o); return o

def mesh_obj(name, verts, faces, material=None, uvs=None, smooth=True):
    m = bpy.data.meshes.new(name); m.from_pydata(verts, [], faces)
    if uvs is not None:
        lay = m.uv_layers.new(name='UVMap')
        for poly in m.polygons:
            for li in poly.loop_indices: lay.data[li].uv = uvs[m.loops[li].vertex_index]
    if smooth: m.shade_smooth()
    o = new_obj(name, m)
    if material: m.materials.append(material)
    return o

def set_mesh(o, verts, faces, uvs=None):
    m = o.data; m.clear_geometry(); m.from_pydata(verts, [], faces)
    if uvs is not None:
        lay = m.uv_layers.get('UVMap') or m.uv_layers.new(name='UVMap')
        for poly in m.polygons:
            for li in poly.loop_indices: lay.data[li].uv = uvs[m.loops[li].vertex_index]
    m.shade_smooth(); m.update()

# ---------------------------------------------------------------- node helpers
class NT:
    def __init__(self, m):
        m.use_nodes = True; self.t = m.node_tree; self.n = self.t.nodes; self.l = self.t.links
    def node(self, kind, **props):
        nd = self.n.new(kind)
        for k, v in props.items(): setattr(nd, k, v)
        return nd
    def link(self, a, b): self.l.new(a, b)
    def math(self, op, a, b=None, clamp=False):
        nd = self.node('ShaderNodeMath', operation=op, use_clamp=clamp)
        for i, x in enumerate((a, b)):
            if x is None: continue
            if isinstance(x, (int, float)): nd.inputs[i].default_value = x
            else: self.link(x, nd.inputs[i])
        return nd.outputs[0]
    def smooth(self, x, e0, e1):   # 0 below e0, 1 above e1
        nd = self.node('ShaderNodeMapRange', interpolation_type='SMOOTHSTEP', clamp=True)
        self.link(x, nd.inputs['Value']); nd.inputs['From Min'].default_value = e0; nd.inputs['From Max'].default_value = e1
        return nd.outputs[0]
    def mix(self, fac, a, b):
        nd = self.node('ShaderNodeMix', data_type='RGBA', clamp_factor=True)
        for sock, x in ((nd.inputs[0], fac), (nd.inputs[6], a), (nd.inputs[7], b)):
            if isinstance(x, tuple): sock.default_value = (*x, 1) if len(x) == 3 else x
            elif isinstance(x, (int, float)): sock.default_value = x
            else: self.link(x, sock)
        return nd.outputs[2]
    def obj_radius(self, ob, sx=1.0, sz=1.0):  # distance in the X/Z plane of an empty's space
        tc = self.node('ShaderNodeTexCoord', object=ob)
        sep = self.node('ShaderNodeSeparateXYZ'); self.link(tc.outputs['Object'], sep.inputs[0])
        x = self.math('MULTIPLY', sep.outputs[0], sx); z = self.math('MULTIPLY', sep.outputs[2], sz)
        d = self.math('SQRT', self.math('ADD', self.math('MULTIPLY', x, x), self.math('MULTIPLY', z, z)))
        return d, sep
    def value(self, v):
        nd = self.node('ShaderNodeValue'); nd.outputs[0].default_value = v; return nd

# ---------------------------------------------------------------- eyes
EYE_X, EYE_Z = 0.208, 1.57          # eye centres on the face (head rest coords, +x = her left = screen right)
EYE_R = (0.105, 0.075, 0.137)        # half width, depth, half height
IRIS_TOP, IRIS_BOT = hexcol('#263C66'), hexcol('#82A6D3')
PUPIL = srgb2lin((0.05, 0.03, 0.10)); SCLERA = srgb2lin((0.98, 0.97, 1.0)); LASH = srgb2lin((0.16, 0.06, 0.08))
LIDSKIN = mat('lid_skin', SKIN, 0.45, coat=0.35)

def eye_material(name, iris_e, pupil_e, glint1, glint2):
    m = bpy.data.materials.new(name); t = NT(m); b = principled(m)
    d_i, sep_i = t.obj_radius(iris_e)
    d_p, _ = t.obj_radius(pupil_e)
    d_g1, _ = t.obj_radius(glint1); d_g2, _ = t.obj_radius(glint2)
    iris_m = t.math('SUBTRACT', 1.0, t.smooth(d_i, 0.93, 1.0))
    pupil_m = t.math('SUBTRACT', 1.0, t.smooth(d_p, 0.88, 1.0))
    glint = t.math('MAXIMUM', t.math('SUBTRACT', 1.0, t.smooth(d_g1, 0.85, 1.0)), t.math('SUBTRACT', 1.0, t.smooth(d_g2, 0.8, 1.0)))
    grad = t.math('SUBTRACT', 1.0, t.smooth(sep_i.outputs[2], -0.85, 0.75))
    iris = t.mix(grad, IRIS_TOP, IRIS_BOT)
    iris = t.mix(t.math('MULTIPLY', t.smooth(d_i, 0.72, 0.97), 0.85), iris, srgb2lin((0.02, 0.16, 0.22)))  # limbal ring
    sclera_shade = t.smooth(sep_i.outputs[2], 0.2, 1.6)                                                 # lid shadow
    sclera = t.mix(t.math('MULTIPLY', sclera_shade, 0.35), SCLERA, srgb2lin((0.72, 0.70, 0.86)))
    col = t.mix(iris_m, sclera, iris)
    col = t.mix(pupil_m, col, PUPIL)
    col = t.mix(glint, col, (1, 1, 1))
    t.link(col, b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = 0.12; b.inputs['Coat Weight'].default_value = 1.0; b.inputs['Coat Roughness'].default_value = 0.03
    b.inputs['Emission Color'].default_value = (1, 1, 1, 1); t.link(t.math('MULTIPLY', glint, 6.0), b.inputs['Emission Strength'])
    return m

def lid_material(name):
    m = bpy.data.materials.new(name); t = NT(m); b = principled(m)
    tc = t.node('ShaderNodeTexCoord'); sep = t.node('ShaderNodeSeparateXYZ'); t.link(tc.outputs['Object'], sep.inputs[0])
    z = t.math('ABSOLUTE', sep.outputs[2])
    lash = t.math('SUBTRACT', 1.0, t.smooth(z, 0.24, 0.34))
    t.link(t.mix(lash, SKIN, LASH), b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = 0.45; b.inputs['Coat Weight'].default_value = 0.35
    return m

def sphere_mesh(name, r, zmin=-2.0, zmax=2.0, seg=40, ring=24):
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=ring, radius=r)
    if zmin > -r or zmax < r:
        if zmin > -r: bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=(0, 0, zmin), plane_no=(0, 0, 1), clear_inner=True)
        if zmax < r: bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=(0, 0, zmax), plane_no=(0, 0, 1), clear_outer=True)
    m = bpy.data.meshes.new(name); bm.to_mesh(m); bm.free(); m.shade_smooth(); return m

EYES = []
for side in (1, -1):
    s = 'L' if side > 0 else 'R'
    p, n = surf(side * EYE_X, EYE_Z)
    fwd = (Vector((0, -1, 0)) * 0.55 + n * 0.45).normalized(); fwd.z = 0; fwd.normalize()
    x_ax = Vector((-fwd.y, fwd.x, 0)).normalized()
    if x_ax.x < 0: x_ax = -x_ax
    ctr = p - fwd * (EYE_R[1] * 0.42)
    root = new_obj(f'eye_{s}'); root.empty_display_size = 0.1
    rot = Matrix((x_ax, -fwd, Vector((0, 0, 1)))).transposed()
    root.matrix_world = Matrix.Translation(ctr) @ rot.to_4x4() @ Matrix.Diagonal((*EYE_R, 1))
    def child(o, parent=root):
        o.parent = parent; o.matrix_parent_inverse = Matrix.Identity(4); return o
    iris_e = child(new_obj(f'iris_{s}')); iris_e.location = (0, -1, 0)
    pupil_e = child(new_obj(f'pupil_{s}'), iris_e)
    g1 = child(new_obj(f'glint1_{s}')); g1.location = (-0.30, -1, 0.36); g1.scale = (0.24, 1, 0.21)
    g2 = child(new_obj(f'glint2_{s}')); g2.location = (0.26, -1, -0.38); g2.scale = (0.11, 1, 0.10)
    ball = child(new_obj(f'eyeball_{s}', sphere_mesh(f'eyeball_{s}', 1.0)))
    ball.data.materials.append(eye_material(f'eye_{s}', iris_e, pupil_e, g1, g2))
    lid = child(new_obj(f'lid_{s}', sphere_mesh(f'lid_{s}', 1.09, zmin=0.0))); lid.data.materials.append(lid_material(f'lid_{s}'))
    lid.rotation_mode = 'XYZ'
    low = child(new_obj(f'lowlid_{s}', sphere_mesh(f'lowlid_{s}', 1.075, zmax=0.0))); low.data.materials.append(LIDSKIN)
    low.rotation_mode = 'XYZ'
    # outer lash flick: a small curved tapered wedge at the outer upper corner of the lid
    lv, lf = [], []
    for i in range(7):
        a = i / 6
        ang = math.radians(25 + 40 * a)
        r = 1.10 + 0.05 * a
        w = 0.16 * (1 - a) + 0.02
        cx, cz = math.cos(ang) * r, math.sin(ang) * r
        lv += [(cx, -0.25, cz), (cx + 0.18 * a + 0.05, -0.25, cz + w * 0.2 + 0.08 * a * a + w)]
    for i in range(6): lf.append((2 * i, 2 * i + 2, 2 * i + 3, 2 * i + 1))
    lmat = mat(f'lashmat_{s}', LASH, 0.5)
    flick = child(mesh_obj(f'lash_{s}', lv, lf, lmat), lid)
    sol = flick.modifiers.new('t', 'SOLIDIFY'); sol.thickness = 0.12; sol.offset = 0
    EYES.append(dict(side=side, root=root, iris=iris_e, pupil=pupil_e, g1=g1, g2=g2, ball=ball, lid=lid, low=low,
                     flick=flick, base=root.matrix_world.copy(), ctr=ctr, fwd=fwd))

# ---------------------------------------------------------------- decals: brows, mouth, blush, closed-eye strokes
BROW_C = hexcol('#253349'); LINE_C = srgb2lin((0.30, 0.06, 0.09))
def flat_mat(name, color, rough=0.5, emit=0.0):
    return mat(name, color, rough, coat=0.2, **({'Emission Color': color, 'Emission Strength': emit} if emit else {}))
BROW_M = flat_mat('brow', BROW_C, 0.6)
LINE_M = mat('mouth_line', LINE_C, 0.75, coat=0.0)
CLOSED_M = flat_mat('closed_eye', LASH, 0.4)

def mouth_material():
    m = bpy.data.materials.new('mouth_fill'); t = NT(m); b = principled(m)
    uv = t.node('ShaderNodeUVMap', uv_map='UVMap'); sep = t.node('ShaderNodeSeparateXYZ'); t.link(uv.outputs[0], sep.inputs[0])
    u, v = sep.outputs[0], sep.outputs[1]
    teeth_on = t.value(1.0); grim_on = t.value(0.0); tongue_on = t.value(1.0)
    # tongue: ellipse resting on the lower lip
    tu = t.math('DIVIDE', u, 0.62); tv = t.math('DIVIDE', t.math('SUBTRACT', v, -0.05), 0.52)
    tongue = t.math('MULTIPLY', t.math('SUBTRACT', 1.0, t.smooth(t.math('ADD', t.math('MULTIPLY', tu, tu), t.math('MULTIPLY', tv, tv)), 0.85, 1.0)), tongue_on.outputs[0])
    teeth = t.math('MULTIPLY', t.smooth(v, 0.70, 0.76), teeth_on.outputs[0])
    teeth = t.math('MULTIPLY', teeth, t.math('SUBTRACT', 1.0, t.smooth(t.math('ABSOLUTE', u), 0.78, 0.9)))
    # grimace: clenched teeth filling the mouth, a dark bite line and tooth gaps
    gin = t.math('MULTIPLY', t.smooth(v, 0.12, 0.17), t.math('SUBTRACT', 1.0, t.smooth(v, 0.83, 0.88)))
    gin = t.math('MULTIPLY', gin, t.math('SUBTRACT', 1.0, t.smooth(t.math('ABSOLUTE', u), 0.86, 0.93)))
    bite = t.math('SUBTRACT', 1.0, t.smooth(t.math('ABSOLUTE', t.math('SUBTRACT', v, 0.5)), 0.035, 0.06))
    gap = t.math('SUBTRACT', 1.0, t.smooth(t.math('ABSOLUTE', t.math('SUBTRACT', t.math('FRACT', t.math('MULTIPLY', t.math('ADD', u, 1.0), 2.5)), 0.5)), 0.42, 0.47))
    gap = t.math('SUBTRACT', 1.0, gap)
    grim = t.math('MULTIPLY', t.math('MULTIPLY', gin, t.math('MULTIPLY', t.math('SUBTRACT', 1.0, bite), t.math('SUBTRACT', 1.0, t.math('MULTIPLY', gap, 0.7)))), grim_on.outputs[0])
    col = t.mix(tongue, srgb2lin((0.33, 0.04, 0.10)), srgb2lin((0.98, 0.42, 0.52)))
    col = t.mix(teeth, col, (0.97, 0.95, 0.96))
    col = t.mix(grim, col, (0.97, 0.95, 0.96))
    t.link(col, b.inputs['Base Color']); b.inputs['Roughness'].default_value = 0.3; b.inputs['Coat Weight'].default_value = 0.6
    return m, teeth_on, grim_on, tongue_on
MOUTH_M, TEETH_ON, GRIM_ON, TONGUE_ON = mouth_material()

def blush_material():
    m = bpy.data.materials.new('blush'); t = NT(m); b = principled(m)
    uv = t.node('ShaderNodeUVMap', uv_map='UVMap'); sep = t.node('ShaderNodeSeparateXYZ'); t.link(uv.outputs[0], sep.inputs[0])
    r = t.math('SQRT', t.math('ADD', t.math('MULTIPLY', sep.outputs[0], sep.outputs[0]), t.math('MULTIPLY', sep.outputs[1], sep.outputs[1])))
    strength = t.value(0.6)
    a = t.math('MULTIPLY', t.math('SUBTRACT', 1.0, t.smooth(r, 0.0, 1.0)), strength.outputs[0])
    mixs = t.node('ShaderNodeMixShader'); tr = t.node('ShaderNodeBsdfTransparent')
    b.inputs['Base Color'].default_value = (*srgb2lin((1.0, 0.42, 0.55)), 1); b.inputs['Roughness'].default_value = 0.5
    out = next(n for n in t.n if n.type == 'OUTPUT_MATERIAL')
    t.link(a, mixs.inputs[0]); t.link(tr.outputs[0], mixs.inputs[1]); t.link(b.outputs[0], mixs.inputs[2]); t.link(mixs.outputs[0], out.inputs[0])
    return m, strength
BLUSH_M, BLUSH_K = blush_material()

def project(pts2d, off, flatten=False):
    out = []
    for (x, z) in pts2d:
        p, n = surf(x, z); out.append(p + n * off)
    if flatten:   # strokes that cross a hair edge: keep each column at its frontmost depth
        for i in range(0, len(out) - 1, 2):
            y = min(out[i].y, out[i + 1].y); out[i].y = out[i + 1].y = y
    return [tuple(v) for v in out]

def ribbon(center, widths, off=0.006, flatten=False):
    """a stroke along a 2D polyline: verts in pairs (left, right), quads between"""
    pts, uvs = [], []
    n = len(center)
    for i, ((x, z), w) in enumerate(zip(center, widths)):
        a = center[max(0, i - 1)]; b = center[min(n - 1, i + 1)]
        tx, tz = b[0] - a[0], b[1] - a[1]; L = math.hypot(tx, tz) or 1; nx, nz = -tz / L, tx / L
        pts += [(x + nx * w / 2, z + nz * w / 2), (x - nx * w / 2, z - nz * w / 2)]
        uvs += [(i / (n - 1) * 2 - 1, 1), (i / (n - 1) * 2 - 1, -1)]
    faces = [(2 * i, 2 * i + 1, 2 * i + 3, 2 * i + 2) for i in range(n - 1)]
    return project(pts, off, flatten), faces, uvs

def taper(n, w, head=0.25, tail=0.25, min_w=0.15):
    out = []
    for i in range(n):
        a = i / (n - 1)
        k = min(1.0, a / head if head else 1, (1 - a) / tail if tail else 1)
        out.append(w * (min_w + (1 - min_w) * math.sin(k * math.pi / 2)))
    return out

def filled(top, bot, xs, off=0.005):
    """a filled mouth between a top and bottom curve; uv = (x / half width, 0 at the bottom lip .. 1 at the top lip)"""
    pts, uvs, NV = [], [], 7
    w = max(abs(x) for x in xs) or 1
    for x in xs:
        zt, zb = top(x), bot(x)
        for j in range(NV):
            v = j / (NV - 1); pts.append((x, zb + (zt - zb) * v)); uvs.append((x / w, v))
    faces = [(i * NV + j, (i + 1) * NV + j, (i + 1) * NV + j + 1, i * NV + j + 1) for i in range(len(xs) - 1) for j in range(NV - 1)]
    return project(pts, off), faces, uvs

def decal_obj(name, material):
    o = mesh_obj(name, [(0, 0, 0)] * 3, [(0, 1, 2)], material, uvs=[(0, 0)] * 3)
    bone_parent(o, 'head'); return o
BROWS = {s: decal_obj(f'brow_{s}', BROW_M) for s in (1, -1)}
CLOSED = {s: decal_obj(f'closed_{s}', CLOSED_M) for s in (1, -1)}
MOUTH_LINE = decal_obj('mouth_line', LINE_M)
MOUTH_FILL = decal_obj('mouth_fill', MOUTH_M)
BLUSH = decal_obj('blush', BLUSH_M)
for o in BROWS.values(): o.visible_shadow = False

def ellipse_fill(cx, cz, rx, rz, off):
    pts, uvs, faces, N, R = [], [], [], 28, 4
    pts.append((cx, cz)); uvs.append((0, 0))
    for r in range(1, R + 1):
        for i in range(N):
            a = i / N * math.tau; pts.append((cx + math.cos(a) * rx * r / R, cz + math.sin(a) * rz * r / R))
            uvs.append((math.cos(a) * r / R, math.sin(a) * r / R))
    for i in range(N): faces.append((0, 1 + i, 1 + (i + 1) % N))
    for r in range(1, R):
        for i in range(N):
            a0 = 1 + (r - 1) * N; a1 = 1 + r * N
            faces.append((a0 + i, a1 + i, a1 + (i + 1) % N, a0 + (i + 1) % N))
    return project(pts, off), faces, uvs

bv, bf, bu = [], [], []
for s in (1, -1):
    v, f, u = ellipse_fill(s * 0.30, 1.445, 0.085, 0.048, 0.004)
    o = len(bv); bv += v; bf += [tuple(i + o for i in t) for t in f]; bu += u
set_mesh(BLUSH, bv, bf, bu)


# Give the source heraldic shield a clean enamel face and broad silver rim.
shield=bpy.data.objects['Badge_Shield']
profile=[(-0.43,0.49),(0.43,0.49),(0.43,0.12),(0.34,-0.27),(0,-0.60),(-0.34,-0.27),(-0.43,0.12)]
def shield_mesh(profile,front,back):
    n=len(profile);v=[(x,y,z) for y in (front,back) for x,z in profile]
    f=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    return v,f
v,f=shield_mesh(profile,-0.09,0.06)
shield.data=bpy.data.meshes.new('kit_heater');shield.data.from_pydata(v,[],f);shield.data.materials.append(M_EDGE)
bevel=shield.modifiers.new('soft_rim','BEVEL');bevel.width=0.025;bevel.segments=3
weighted=shield.modifiers.new('rim_normals','WEIGHTED_NORMAL')
panel=[(x*0.86,z*0.89+0.006) for x,z in profile]
v,f=shield_mesh(panel,-0.113,-0.087)
p=mesh_obj('shield_enamel',v,f,M_BLUE,smooth=False);p.parent=shield;p.matrix_parent_inverse=Matrix.Identity(4)
b=p.modifiers.new('panel_bevel','BEVEL');b.width=0.012;b.segments=3
bolt=[(0.08,0.34),(-0.20,-0.03),(-0.02,-0.03),(-0.12,-0.38),(0.20,0.06),(0.025,0.06)]
b=mesh_obj('shield_bolt',[(x,-0.126,z) for x,z in bolt],[tuple(range(len(bolt)))],M_EDGE,smooth=False)
b.parent=shield;b.matrix_parent_inverse=Matrix.Identity(4)
sol=b.modifiers.new('raised_crest','SOLIDIFY');sol.thickness=0.014
bev=b.modifiers.new('crest_bevel','BEVEL');bev.width=0.008;bev.segments=2

# Silver rim around the open face and a single broad helmet ridge.
cu=bpy.data.curves.new('helmet_trim','CURVE');cu.dimensions='3D';cu.bevel_depth=0.012;cu.bevel_resolution=3
sp=cu.splines.new('POLY');sp.points.add(NH)
for i,pt in enumerate(sp.points):
    x,y,z=hv[(i%NH)*(NV+1)+NV];pt.co=(x,y,z,1)
o=new_obj('helmet_rim',cu);cu.materials.append(M_EDGE);o.parent=helmet;o.matrix_parent_inverse=Matrix.Identity(4)
rv,rf=[],[]
for i in range(41):
    th=-2.25+(2.25+1.26)*i/40
    for x in (-0.025,0.025):rv.append((x,-0.585*math.sin(th),1.70+0.568*math.cos(th)-1.215891))
for i in range(40):rf.append((i*2,i*2+1,i*2+3,i*2+2))
o=mesh_obj('helmet_ridge',rv,rf,M_EDGE);o.parent=helmet;o.matrix_parent_inverse=Matrix.Identity(4)
sol=o.modifiers.new('ridge_thickness','SOLIDIFY');sol.thickness=0.012

# A simple split cobalt tabard leaves the original legs and their animation intact.
for s in (1,-1):
    x0,x1=(0.035,0.29) if s>0 else (-0.29,-0.035)
    v=[(x0,-0.34,0.60),(x1,-0.32,0.60),(x1*1.2,-0.30,0.24),(x0,-0.34,0.28)]
    o=mesh_obj('tabard_'+str(s),v,[(0,1,2,3)],M_BLUE,smooth=False)
    sol=o.modifiers.new('cloth_thickness','SOLIDIFY');sol.thickness=0.018
    bev=o.modifiers.new('soft_hem','BEVEL');bev.width=0.015;bev.segments=3
    bone_parent(o,'hips')

# Restrained coral tie, kept below the neck so it never hides the expression.
verts=[(-0.27,-0.32,1.10),(-0.18,-0.35,1.10),(-0.17,-0.35,0.83),(-0.24,-0.34,0.87)]
tie=mesh_obj('coral_tie',verts,[(0,1,2,3)],M_CORAL,smooth=False)
sol=tie.modifiers.new('cloth_thickness','SOLIDIFY');sol.thickness=0.015
bone_parent(tie,'chest')
for e in EYES:
    bone_parent(e['root'],'head');e['scale0']=e['root'].scale.copy()
arm.data.pose_position='POSE';bpy.context.view_layer.update()
# Use the same physical scale and feet placement for every clip and camera view.
sc.frame_set(1);bpy.context.view_layer.update()
Z0=0.0;Z1=2.268
k=(HEIGHT*0.1)/(Z1-Z0)
arm.scale=[s*k for s in arm.scale];arm.location.z-=Z0*k
arm.rotation_mode='XYZ'
bpy.context.view_layer.update()
NEUTRAL = dict(gx=0.0, gz=0.0, lid=0.16, low=0.0, iris=1.0, pupil=1.0, eye=1.0, glint=1.0, eyes='open',
               braise=0.0, btilt=0.0, mouth='smile', mw=1.0, mh=0.0, mc=0.5, wave=0.0, blush=0.55)

def apply_face(P):
    for e in EYES:
        s = e['side']
        e['iris'].location = (P['gx'] * 0.36, -1, P['gz'] * 0.30)
        r = 0.66 * P['iris']; e['iris'].scale = (r, 1, r * 1.08)
        pr = 0.46 * P['pupil'] / P['iris']; e['pupil'].scale = (pr, 1, pr * 1.1)
        g = P['glint']; e['g1'].scale = (0.24 * g, 1, 0.21 * g); e['g2'].scale = (0.11 * g, 1, 0.10 * g)
        # lids are hemispheres rotated about the eye's x axis; e = height of the lid edge at the front of the eye
        e['lid'].rotation_euler = (-math.asin(max(-1, min(1, 1 - 2 * P['lid']))), 0, 0)
        e['low'].rotation_euler = (-math.asin(max(-1, min(1, -1 + 2 * P['low']))), 0, 0)
        e['root'].scale = e['scale0'] * P['eye']
        show = P['eyes'] == 'open'
        for key in ('ball', 'lid', 'low', 'flick'): e[key].hide_render = not show
        # closed-eye strokes
        cx, cz = s * EYE_X, EYE_Z
        o = CLOSED[s]
        if P['eyes'] == 'happy':          # ^ arcs
            pts = [(cx + (i / 14 * 2 - 1) * 0.10, cz - 0.02 + 0.06 * (1 - (i / 14 * 2 - 1) ** 2)) for i in range(15)]
            v, f, u = ribbon(pts, taper(15, 0.034, 0.3, 0.3, 0.25), off=0.006); set_mesh(o, v, f, u); o.hide_render = False
        elif P['eyes'] == 'squeeze':      # > <  pointing at the nose
            pts = [(cx + s * (0.075 - 0.15 * (1 - abs(2 * (i / 14) - 1)) ** 1.3), cz + 0.075 * (1 - 2 * i / 14)) for i in range(15)]
            v, f, u = ribbon(pts, taper(15, 0.032, 0.3, 0.3, 0.3), off=0.006); set_mesh(o, v, f, u); o.hide_render = False
        else:
            o.hide_render = True
        # brows: inner end at x 0.10, outer at 0.30; tilt > 0 lifts the inner end (worry), < 0 drops it (anger)
        rz = P['braise'] * 0.035
        tilt = math.radians(P['btilt'])
        pts = []
        for i in range(13):
            t_ = i / 12
            x = 0.105 + t_ * 0.19; z = 1.765 + 0.018 * math.sin(t_ * math.pi) - 0.006 * t_
            dx, dz = x - 0.2, z - 1.765
            x2 = 0.2 + dx * math.cos(tilt) + dz * math.sin(tilt)
            z2 = 1.765 - dx * math.sin(tilt) + dz * math.cos(tilt) + rz
            pts.append((s * x2, z2))
        ws = [0.048 * (1 - 0.55 * (i / 12)) * min(1, (i + 1) / 2.5) for i in range(13)]
        v, f, u = ribbon(pts, ws, off=0.010, flatten=True); set_mesh(BROWS[s], v, f, u)
    # mouth
    MZ = 1.383; w = 0.075 * P['mw']; kind = P['mouth']
    xs = [w * -math.cos(i / 20 * math.pi) for i in range(21)]
    if kind in ('smile', 'frown', 'flat', 'wavy'):
        c = {'smile': 1.0, 'frown': -1.0, 'flat': 0.0, 'wavy': 0.0}[kind] * P['mc'] * 0.035
        pts = [(x, MZ + c * ((x / w) ** 2 - 0.4) + P['wave'] * 0.012 * math.sin((x / w) * math.pi * 1.5)) for x in xs]
        v, f, u = ribbon(pts, taper(21, 0.026, 0.25, 0.25, 0.3), off=0.006)
        set_mesh(MOUTH_LINE, v, f, u); MOUTH_LINE.hide_render = False; MOUTH_FILL.hide_render = True
    else:
        h = 0.02 + 0.10 * P['mh']; c = P['mc'] * 0.03
        TEETH_ON.outputs[0].default_value = 1.0 if kind == 'open' else 0.0
        GRIM_ON.outputs[0].default_value = 1.0 if kind == 'grimace' else 0.0
        TONGUE_ON.outputs[0].default_value = 0.0 if kind == 'grimace' else 1.0
        if kind == 'open':     # D-shaped laugh: flat top lifted at the corners, deep round bottom
            top = lambda x: MZ + 0.012 + c * (abs(x / w) ** 2.2) * 0.4
            bot = lambda x: MZ + 0.012 + c * 0.4 - (h + c * 0.4) * (1 - abs(x / w) ** 2.2) ** 0.75
        elif kind == 'O':      # oval scream
            top = lambda x: MZ - h * 0.35 + h * 0.6 * (1 - (x / w) ** 2) ** 0.5
            bot = lambda x: MZ - h * 0.35 - h * 0.6 * (1 - (x / w) ** 2) ** 0.5
        else:                  # grimace: wide clenched box, corners pulled down
            top = lambda x: MZ + h * 0.5 - c * (abs(x / w) ** 3) * 0.6 - 0.004 * (1 - (1 - abs(x / w) ** 6) ** 0.5) * 8
            bot = lambda x: MZ - h * 0.5 - c * (abs(x / w) ** 3) * 0.6 + 0.004 * (1 - (1 - abs(x / w) ** 6) ** 0.5) * 8
        v, f, u = filled(top, bot, xs)
        set_mesh(MOUTH_FILL, v, f, u); MOUTH_FILL.hide_render = False; MOUTH_LINE.hide_render = True
    BLUSH_K.outputs[0].default_value = P['blush']

def lerp_keys(keys, t):
    """keys: [(t, {param overrides})] sorted, each key inheriting the previous one; the loop wraps from the last key
    to the first. Numbers ease smoothly between keys, other values switch half way."""
    full, acc = [], dict(NEUTRAL)
    for kt, d in keys:
        acc = dict(acc); acc.update(d); full.append((kt, acc))
    idx = max([i for i, (kt, _) in enumerate(full) if kt <= t] or [len(full) - 1])
    t0, a = full[idx]; t1, b = full[(idx + 1) % len(full)]
    if t1 <= t0: t1 += 1.0
    tt = t if t >= t0 else t + 1.0
    u = (tt - t0) / (t1 - t0) if t1 > t0 else 0.0; u = u * u * (3 - 2 * u)
    return {k: (a[k] + (b[k] - a[k]) * u if isinstance(a[k], float) and isinstance(b[k], float) else (a[k] if u < 0.5 else b[k]))
            for k in a}

def F(**kw): return {k: (float(v) if isinstance(v, int) and not isinstance(v, bool) else v) for k, v in kw.items()}

EXPRESSIONS={
 'Idle':[(0,F(btilt=-23,braise=-0.35,lid=0.18,mouth='flat',mw=1.15,mc=0.2,gz=0.1)),(0.45,F(gx=0.12)),(0.78,F(lid=0.85)),(0.86,F(lid=0.18,gx=0))],
 'Focus':[(0,F(btilt=-30,braise=-0.45,lid=0.42,low=0.1,mouth='flat',mw=0.95,gx=0.1,gz=0.3)),(0.5,F(gx=-0.15,gz=0.15,lid=0.37))],
 'Grin':[(0,F(btilt=-4,braise=0.1,lid=0.16,low=0.13,mouth='open',mw=1.15,mh=0.24,mc=0.8)),(0.4,F(gx=0.2,mh=0.42)),(0.8,F(gx=0))],
 'Shock':[(0,F(btilt=18,braise=0.85,lid=0,iris=0.75,pupil=0.7,mouth='O',mw=1.0,mh=0.95)),(0.5,F(eye=1.05,mh=1.05,gz=0.15)),(0.95,F(eye=1.0,mh=0.75))],
 'Worried':[(0,F(btilt=25,braise=0.5,lid=0.04,low=0.03,mouth='O',mw=0.65,mh=0.30,gx=-0.3,gz=0.15,blush=0.35)),(0.4,F(gx=0.3,mh=0.38)),(0.75,F(gx=0.1,gz=0.3,mh=0.3))],
 'Cheer':[(0,F(eyes='happy',braise=0.6,btilt=-3,mouth='open',mw=1.45,mh=0.85,mc=0.8,blush=0.75)),(0.5,F(mh=1.0,mw=1.5)),(0.8,F(mh=0.8))],
 'Hurt':[(0,F(eyes='squeeze',btilt=-17,braise=-0.4,mouth='grimace',mw=1.35,mh=0.35,mc=0.3,blush=0.6)),(0.45,F(mw=1.2,mh=0.25)),(0.9,F(eyes='open',lid=0.65,mouth='frown',mw=1.1,mc=0.7))],
 'Laugh':[(0,F(eyes='open',lid=0.08,low=0.2,braise=0.85,btilt=4,mouth='open',mw=1.6,mh=1.1,mc=0.7,blush=0.9)),(0.3,F(eyes='open',lid=0.1,low=0.3,mh=1.0,gz=0.1)),(0.65,F(eyes='happy',mh=1.25))]
}

def aim_bone(name,d):
    pb=arm.pose.bones[name];m=pb.matrix.copy();h=m.translation.copy()
    q=m.col[1].xyz.normalized().rotation_difference(Vector(d).normalized())
    pb.matrix=Matrix.Translation(h)@q.to_matrix().to_4x4()@Matrix.Translation(-h)@m
    bpy.context.view_layer.update()

def pose_shield(name,phase):
    # Keep the protective prop below the face in guard poses and outboard during a cheer.
    if name in ('Focus','Hurt'):
        aim_bone('upperarm.l',(0.75,-0.2,-0.75))
        aim_bone('lowerarm.l',(0.1,-0.9,-0.4))
        aim_bone('hand.l',(-0.1,-0.8,-0.3))
    elif name in ('Cheer','Laugh'):
        pulse=math.sin(phase*math.tau)
        aim_bone('upperarm.l',(1,-0.1,0.15+0.1*pulse))
        aim_bone('lowerarm.l',(0.7,-0.3,0.35+0.1*pulse))
        aim_bone('hand.l',(0.6,-0.5,0.2))
    hand=arm.pose.bones['hand.l'].head
    position=arm.matrix_world@(hand+shield_offset)
    shield.matrix_world=Matrix.Translation(position)@Matrix.Rotation(math.radians(YAW-12),4,'Z')@Matrix.Diagonal((k,k,k,1))

def area(loc,energy,size,color):
    bpy.ops.object.light_add(type='AREA',location=loc)
    o=bpy.context.object;o.rotation_euler=(Vector((0,0,2.2))-o.location).to_track_quat('-Z','Y').to_euler()
    o.data.energy=energy;o.data.size=size;o.data.color=color
area((-8,-10,14),1600,7,(1,0.82,0.68))
area((7,-5,7),850,6,(0.55,0.68,1))
area((0,-9,3),550,7,(0.92,0.94,1))
area((2,5,8),1100,6,(0.62,0.73,1))
area((0,-3,-5),220,6,(1,0.5,0.65))
w=bpy.data.worlds.new('kit_world');sc.world=w
w.node_tree.nodes['Background'].inputs['Color'].default_value=(0.05,0.04,0.09,1)
w.node_tree.nodes['Background'].inputs['Strength'].default_value=0.35
bpy.ops.object.camera_add(location=(0,-40,BOX*0.1/2-0.4),rotation=(math.radians(90),0,0))
cam=bpy.context.object;sc.camera=cam;cam.data.type='ORTHO';cam.data.ortho_scale=BOX*0.1
sc.render.engine='CYCLES';sc.cycles.samples=SAMPLES;sc.cycles.use_denoising=True;sc.cycles.device='CPU'
sc.render.threads_mode='FIXED';sc.render.threads=THREADS
sc.render.resolution_x=sc.render.resolution_y=BOX*PX;sc.render.film_transparent=True
sc.render.image_settings.file_format='PNG';sc.render.image_settings.color_mode='RGBA'
sc.view_settings.view_transform='AgX';sc.view_settings.look='AgX - Medium High Contrast'
if FACE:
    sc.render.resolution_x=sc.render.resolution_y=288;cam.data.ortho_scale=2.4
if PROOF and not FACE:sc.render.resolution_x=sc.render.resolution_y=336
TARGET=sc.render.resolution_x
sc.render.resolution_x=sc.render.resolution_y=TARGET*2
os.makedirs(OUT,exist_ok=True)
proof_dir=os.path.join(HERE,'..','out','kit-proof');os.makedirs(proof_dir,exist_ok=True)
# Source scenes stay out of the shipping sprite directory.
for spec in ANIMS:
    name,n=spec[0],int(spec[1]);only=[int(x) for x in spec[2].split(',')] if len(spec)>2 else range(n)
    assert all(0<=i<n for i in only),'Frame index outside clip'
    src,r0,r1=SOURCE[name];act=bpy.data.actions[src]
    arm.animation_data_create();a0,a1=act.frame_range
    for i in only:
        for pb in arm.pose.bones:
            pb.location=(0,0,0);pb.rotation_quaternion=(1,0,0,0);pb.scale=(1,1,1)
        arm.animation_data.action=act
        if hasattr(arm.animation_data,'action_slot') and act.slots:arm.animation_data.action_slot=act.slots[0]
        ph=i/n
        if r0>0 or r1<1:ph=(i/max(1,n-1)) if name in ('Shock','Hurt') else 1-abs(1-2*ph)
        fr=a0+(a1-a0)*(r0+(r1-r0)*ph);sc.frame_set(int(fr),subframe=fr-int(fr))
        arm.rotation_euler=(0,0,math.radians(YAW))
        bpy.context.view_layer.update();arm.animation_data.action=None
        pose_shield(name,i/n)
        apply_face(lerp_keys(EXPRESSIONS[name],i/n))
        for e in EYES:
            e['flick'].hide_render=True
            if SKIN_PROOF:
                for key in ('ball','lid','low'):e[key].hide_render=True
        if SKIN_PROOF:
            for o in list(BROWS.values())+list(CLOSED.values())+[MOUTH_LINE,MOUTH_FILL,BLUSH]:o.hide_render=True
        bpy.context.view_layer.update()
        if FACE:
            hp=arm.matrix_world@arm.pose.bones['head'].head
            cam.location=(hp.x,-40,hp.z+0.66)
            path=os.path.join(OUT,f'{name}_face_{i:02d}.png')
        else:path=os.path.join(OUT,f'{name}_{i:02d}.png')
        if not FACE and not PROOF and not YAW and name=='Idle' and i==0:bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(os.path.join(proof_dir,'kit.blend')))
        sc.render.filepath=path;bpy.ops.render.render(write_still=True)
        with Image.open(path) as im:
            out=im.resize((TARGET,TARGET),Image.Resampling.LANCZOS)
            assert out.mode=='RGBA' and out.size==(TARGET,TARGET), 'Invalid sprite format'
            bb=out.getchannel('A').point(lambda a:255 if a>8 else 0).getbbox()
            assert bb and (FACE or (bb[0]>1 and bb[1]>1 and bb[2]<TARGET-1 and bb[3]<TARGET-1)), f'Clipped sprite: {name} {i} {bb}'
            out.save(path)
    print('rendered',name,len(only),flush=True)
```


---

## `art/kit_cast.py`

Spinning heater shield and unfolding brick armour. Sixteen Spin and twelve Armour frames deliver the existing timed Ward without a connecting light trail or changed defence deadlines.

```python
# Kit's selected spinning heater shield and unfolding brick armour.
# Run: python3 art/kit_cast.py [assets/kit-cast] [--samples 32] [--threads 6]
import argparse, hashlib, json, math
from pathlib import Path

import bpy
import addon_utils
from mathutils import Matrix, Vector
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('out', nargs='?', default=str(ROOT / 'assets/kit-cast'))
parser.add_argument('--samples', type=int, default=32)
parser.add_argument('--threads', type=int, default=6)
args = parser.parse_args()
OUT = Path(args.out).resolve()
PROOF = ROOT / 'out/kit-cast-proof'
OUT.mkdir(parents=True, exist_ok=True)
PROOF.mkdir(parents=True, exist_ok=True)
CELL, SUPER = 256, 2
TIMING = {'anticipation': 0.05, 'arrival': 0.30, 'settled': 0.46}
assert TIMING['settled'] < 0.18 + 0.32  # latest legal Ward still arrives before venom impact

addon_utils.enable('cycles', default_set=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene

def material(name, color, rough, metal=0, coat=0):
    rgb = [int(color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    rgb = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in rgb]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes.get('Principled BSDF')
    for key, value in {'Base Color': (*rgb, 1), 'Roughness': rough, 'Metallic': metal,
                       'Coat Weight': coat, 'Coat Roughness': 0.1}.items():
        b.inputs[key].default_value = value
    return m

silver = material('kit_silver_edge', '#BFC8DD', 0.19, 0.8, 0.3)
blue = material('kit_cobalt', '#356AB3', 0.43, coat=0.18)
enamel = material('ward_enamel', '#76BACD', 0.28, 0.25, 0.4)

def mesh(name, verts, faces, mat, bevel=0):
    data = bpy.data.meshes.new(name)
    data.from_pydata(verts, [], faces)
    data.materials.append(mat)
    o = bpy.data.objects.new(name, data)
    sc.collection.objects.link(o)
    if bevel:
        b = o.modifiers.new('Rounded enamel edges', 'BEVEL')
        b.width, b.segments = bevel, 3
        o.modifiers.new('Weighted normals', 'WEIGHTED_NORMAL')
    return o

def prism(name, profile, front, back, mat, bevel):
    n = len(profile)
    verts = [(x, y, z) for y in (front, back) for x, z in profile]
    faces = [tuple(range(n - 1, -1, -1)), tuple(range(n, 2 * n))]
    faces += [(i, (i + 1) % n, (i + 1) % n + n, i + n) for i in range(n)]
    return mesh(name, verts, faces, mat, bevel)

def half_profile(profile, side):
    out = []
    for a, b in zip(profile, profile[1:] + profile[:1]):
        inside_a, inside_b = side * a[0] >= 0, side * b[0] >= 0
        if inside_a:
            out.append(a)
        if inside_a != inside_b:
            u = -a[0] / (b[0] - a[0])
            out.append((0, a[1] + (b[1] - a[1]) * u))
    clean = []
    for p in out:
        if not clean or p != clean[-1]:
            clean.append(p)
    if clean[0] == clean[-1]:
        clean.pop()
    return clean

profile = [(-0.43, 0.49), (0.43, 0.49), (0.43, 0.12), (0.34, -0.27),
           (0, -0.60), (-0.34, -0.27), (-0.43, 0.12)]
panel = [(x * 0.86, z * 0.89 + 0.006) for x, z in profile]
bolt = [(0.08, 0.34), (-0.20, -0.03), (-0.02, -0.03), (-0.12, -0.38), (0.20, 0.06), (0.025, 0.06)]
halves = []
for side in (-1, 1):
    root = bpy.data.objects.new('heater_half_' + str(side), None)
    sc.collection.objects.link(root)
    for name, shape, front, back, mat, bevel in [
        ('rim', profile, -0.09, 0.06, silver, 0.025),
        ('enamel', panel, -0.113, -0.087, blue, 0.012),
        ('crest', bolt, -0.14, -0.126, silver, 0.008),
    ]:
        o = prism(name + str(side), half_profile(shape, side), front, back, mat, bevel)
        o.parent = root
    halves.append((root, side))

def cube(name, location, size, mat):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    o = bpy.context.object
    o.name, o.dimensions = name, size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(mat)
    b = o.modifiers.new('Rounded enamel edges', 'BEVEL')
    b.width, b.segments = 0.045, 3
    o.modifiers.new('Weighted normals', 'WEIGHTED_NORMAL')
    return o

plates = []
for side in (-1, 1):
    for name, p, size, mat in [
        ('side', (side * 0.68, 0, 0), (0.2, 0.3, 1.48), silver),
        ('enamel_side', (side * 0.68, -0.17, 0), (0.115, 0.065, 1.26), enamel),
        ('cross', (0, 0, side * 0.65), (1.46, 0.3, 0.18), silver),
        ('enamel_cross', (0, -0.17, side * 0.65), (1.25, 0.065, 0.1), blue),
    ]:
        plates.append((cube(name, p, size, mat), p, side))
for x in (-0.68, 0.68):
    for z in (-0.65, 0.65):
        p = (x, -0.23, z)
        plates.append((cube('corner_latch', p, (0.29, 0.15, 0.29), enamel), p, 1 if x > 0 else -1))

def area(location, energy, size, color):
    bpy.ops.object.light_add(type='AREA', location=location)
    o = bpy.context.object
    o.rotation_euler = (Vector((0, 0, 2.2)) - o.location).to_track_quat('-Z', 'Y').to_euler()
    o.data.energy, o.data.size, o.data.color = energy, size, color

for values in [((-8, -10, 14), 1600, 7, (1, 0.82, 0.68)), ((7, -5, 7), 850, 6, (0.55, 0.68, 1)),
               ((0, -9, 3), 550, 7, (0.92, 0.94, 1)), ((2, 5, 8), 1100, 6, (0.62, 0.73, 1)),
               ((0, -3, -5), 220, 6, (1, 0.5, 0.65))]:
    area(*values)
world = bpy.data.worlds.new('kit_world')
world.use_nodes = True
sc.world = world
world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.05, 0.04, 0.09, 1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.35
bpy.ops.object.camera_add(location=(0, -40, 0), rotation=(math.pi / 2, 0, 0))
cam = bpy.context.object
sc.camera, cam.data.type = cam, 'ORTHO'
sc.render.engine, sc.cycles.samples, sc.cycles.use_denoising = 'CYCLES', args.samples, True
sc.render.threads_mode, sc.render.threads = 'FIXED', args.threads
sc.render.resolution_x = sc.render.resolution_y = CELL * SUPER
sc.render.film_transparent = True
sc.render.image_settings.file_format, sc.render.image_settings.color_mode = 'PNG', 'RGBA'
sc.view_settings.view_transform, sc.view_settings.look = 'AgX', 'AgX - Medium High Contrast'

def smooth(t):
    t = max(0, min(1, t))
    return t * t * (3 - 2 * t)

def pose(clip, t):
    spin = clip == 'Spin'
    cam.data.ortho_scale = 2.8 if spin else 3.4
    for o, p, side in plates:
        o.hide_render = spin
        if not spin:
            u = smooth(min(1, t * 1.4))
            settle = 1 + 0.07 * math.sin(t * math.pi * 3) * (1 - t)
            o.location = (p[0] * u * settle, p[1], p[2] * u * settle)
            o.scale = (max(0.04, u), 1, max(0.04, u))
            o.rotation_euler = (0, 0, side * (1 - u) * math.pi * 0.47 if 'side' in o.name else 0)
    for root, side in halves:
        if spin:
            root.matrix_world = Matrix.Rotation(t * math.tau, 4, 'Z') @ Matrix.Rotation(math.radians(12 * math.sin(t * math.tau)), 4, 'Y') @ Matrix.Diagonal((1.85, 1.85, 1.85, 1))
        else:
            u = smooth(t)
            root.matrix_world = Matrix.Translation((side * 0.68 * u, 0.14 * u, 0)) @ Matrix.Rotation(side * u * math.pi * 0.5, 4, 'Z') @ Matrix.Diagonal((1.85 - 0.85 * u, 1.85, 1.85 - 0.75 * u, 1))
    bpy.context.view_layer.update()

metadata = {'cell': CELL, 'pivot': [128, 128], 'timing': TIMING, 'anims': {},
            'source': 'art/kit_cast.py; Kit heater profile/materials from art/kit.py',
            'collision': 'none; visual delivery only', 'renderer': 'Blender 5.2.2 / Cycles',
            'samples': args.samples, 'supersample': SUPER}
images = {}
for clip, count in [('Spin', 16), ('Armour', 12)]:
    frames, bounds, hashes = [], [], []
    for i in range(count):
        pose(clip, i / count if clip == 'Spin' else i / (count - 1))
        path = OUT / f'{clip}_{i:02d}.png'
        sc.render.filepath = str(path)
        bpy.ops.render.render(write_still=True)
        with Image.open(path) as raw:
            im = raw.resize((CELL, CELL), Image.Resampling.LANCZOS)
        im.info.clear()
        im.save(path)
        with Image.open(path) as check:
            assert check.mode == 'RGBA' and check.size == (CELL, CELL) and not check.text
            bb = check.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox()
            assert bb and min(bb[:2]) > 2 and max(bb[2:]) < CELL - 2, (path, bb)
            frames.append(check.copy())
        bounds.append(bb)
        hashes.append(hashlib.sha256(path.read_bytes()).hexdigest())
        print('rendered', clip, i, flush=True)
    assert len(set(hashes)) == count, f'Duplicate frames in {clip}'
    metadata['anims'][clip] = {'frames': count, 'loop': False, 'alpha_bounds': bounds, 'sha256': hashes}
    images[clip] = frames
(OUT / 'meta.json').write_text(json.dumps(metadata, indent=2), encoding='utf-8')
sheet = Image.new('RGB', (CELL * 8, CELL * 4 + 70), '#141831')
draw = ImageDraw.Draw(sheet)
font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 22)
draw.text((20, 18), 'Kit / selected physical shield cast / actual Blender frames', font=font, fill='white')
for row, frames in enumerate(images.values()):
    for i, im in enumerate(frames):
        xy = ((i % 8) * CELL, 70 + (row * 2 + i // 8) * CELL)
        sheet.paste(im, xy, im)
sheet.save(PROOF / 'contact-sheet.png')
pose('Armour', 1)
bpy.ops.wm.save_as_mainfile(filepath=str(PROOF / 'kit-cast.blend'))
print('Kit cast complete:', sum(a['frames'] for a in metadata['anims'].values()), 'frames', flush=True)
```


---

## `art/brum.py`

Bounded Yeti model/expression/motion proof: continuous source mouth and face, repaired eye surfaces, fitted lids and real articulated fists. Uses the verified CC0 source hash documented in design/phase1/04-brum-proof.md. No finished sprite family or encounter is implied.

```python
# Brum frost porter: retained Yeti anatomy and animation, deforming source mouth and fitted lids.
# python3 art/brum.py out/brum-proof/front Neutral:1 Welcome:1 Protective:1 --samples 32 --threads 2
import argparse, hashlib, json, math
from pathlib import Path
import bpy, bmesh, addon_utils
from mathutils import Vector, Matrix, Quaternion
from mathutils.bvhtree import BVHTree
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
ap=argparse.ArgumentParser()
ap.add_argument('out');ap.add_argument('clips',nargs='*',default=['Neutral:1','Welcome:1','Protective:1'])
ap.add_argument('--source',default=str(ROOT/'out/cast/source-audit/Yeti.gltf'))
ap.add_argument('--samples',type=int,default=32);ap.add_argument('--threads',type=int,default=2)
ap.add_argument('--yaw',type=float,default=0);ap.add_argument('--face',action='store_true');ap.add_argument('--skin',action='store_true')
args=ap.parse_args();OUT=Path(args.out).resolve();OUT.mkdir(parents=True,exist_ok=True)
SOURCE=Path(args.source).resolve()
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()=='b9c088fbcd357b82f3cb9a3f33a6b5c5603d3e55958a695e2bd9e419cc6527fb'
addon_utils.enable('cycles',default_set=True)
bpy.ops.wm.read_factory_settings(use_empty=True);sc=bpy.context.scene
bpy.ops.import_scene.gltf(filepath=str(SOURCE))
arm=next(o for o in sc.objects if o.type=='ARMATURE');body=bpy.data.objects['Yeti']
arm.rotation_mode='XYZ'
for o in list(sc.objects):
    if o.type=='MESH' and o!=body:bpy.data.objects.remove(o,do_unlink=True)
arm.data.pose_position='REST';bpy.context.view_layer.update()
assert len(arm.data.bones)==43
# Source clips hold every finger channel at an open-hand identity. Remove those
# held channels so the retained finger chains can form a proper porter fist.
for action in bpy.data.actions:
    for layer in action.layers:
        for strip in layer.strips:
            for slot in action.slots:
                bag=strip.channelbag(slot)
                if bag:
                    for fc in list(bag.fcurves):
                        if any(f'pose.bones["{name}'in fc.data_path for name in ['Index','Middle','Pinky','Thumb']):bag.fcurves.remove(fc)

def lin(h):
    cs=[int(h[i:i+2],16)/255 for i in (1,3,5)]
    return tuple(c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4 for c in cs)
def smooth(a,b,x):
    t=max(0,min(1,(x-a)/(b-a)));return t*t*(3-2*t)
def mat(name,color,rough=.43,coat=.3):
    m=bpy.data.materials.new(name);m.use_nodes=True;b=m.node_tree.nodes.get('Principled BSDF')
    b.inputs['Base Color'].default_value=(*lin(color),1);b.inputs['Roughness'].default_value=rough
    b.inputs['Coat Weight'].default_value=coat;b.inputs['Coat Roughness'].default_value=.22
    return m
IVORY=mat('brum_ivory','#EAE1CE',.4,.3);BLUE=mat('brum_blue','#4B8DAD',.45,.3)
SLATE=mat('brum_belly','#496170',.5,.18);BROW=mat('brum_brow','#28536C',.48,.2)
TEETH=mat('brum_teeth','#E7DFC9',.38,.25);TONGUE=mat('brum_tongue','#B6677C',.5,.1)
DARK=mat('brum_cavity','#102333',.8,0)
CLAY=mat('continuity_clay','#AEB9C6',1,0)
claybs=CLAY.node_tree.nodes.get('Principled BSDF');claybs.inputs['Emission Color'].default_value=(*lin('#AEB9C6'),1);claybs.inputs['Emission Strength'].default_value=.3

# Material separation preserves the original skin hull and all armature weights.
bpy.context.view_layer.objects.active=body;body.select_set(True)
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.separate(type='MATERIAL');bpy.ops.object.mode_set(mode='OBJECT')
parts={o.data.materials[0].name:o for o in sc.objects if o.type=='MESH'}
main=parts['Yeti_Main'];skin=parts['Yeti_Secondary'];white=parts['Eye_White'];black=parts['Eye_Black'];teeth=parts['Yeti_Teeth'];tongue=parts['Tongue']
def components(bm):
    bm.faces.ensure_lookup_table();seen=set();out=[]
    for f in bm.faces:
        if f.index in seen:continue
        todo=[f];comp=[];seen.add(f.index)
        while todo:
            g=todo.pop();comp.append(g)
            for e in g.edges:
                for h in e.link_faces:
                    if h.index not in seen:todo.append(h);seen.add(h.index)
        out.append(comp)
    return out
def boundary_loops(me):
    bm=bmesh.new();bm.from_mesh(me);bm.verts.ensure_lookup_table()
    boundary={v for e in bm.edges if e.is_boundary for v in e.verts};seen=set();out=[]
    for v in boundary:
        if v in seen:continue
        todo=[v];seen.add(v);loop=[]
        while todo:
            k=todo.pop();loop.append((k.index,k.co.copy()))
            for edge in k.link_edges:
                if not edge.is_boundary:continue
                other=edge.other_vert(k)
                if other not in seen:todo.append(other);seen.add(other)
        out.append(loop)
    bm.free();return out
def jaw_loop(me):
    return next(loop for loop in boundary_loops(me)if min(p.z for _,p in loop)>1.7 and min(p.z for _,p in loop)<1.9 and max(p.z for _,p in loop)>2.5)
bm=bmesh.new();bm.from_mesh(black.data);kill=[]
for comp in components(bm):
    if len(comp)==24:kill.extend(comp)
assert len(kill)==48
bmesh.ops.delete(bm,geom=kill,context='FACES');bm.to_mesh(black.data);bm.free()
bm=bmesh.new();bm.from_mesh(teeth.data);kill=[]
for comp in components(bm):
    vs={v for f in comp for v in f.verts};c=sum((v.co for v in vs),Vector())/len(vs)
    if (c.z>1.99 and abs(c.x)>.18) or (c.z<1.99 and abs(c.x)>.075):kill.extend(comp)
bmesh.ops.delete(bm,geom=kill,context='FACES');bm.to_mesh(teeth.data);bm.free()
for o,m in [(main,IVORY),(skin,BLUE),(white,None),(black,DARK),(teeth,TEETH),(tongue,TONGUE)]:
    if m:o.data.materials.clear();o.data.materials.append(m)
    for p in o.data.polygons:p.use_smooth=True
for v in skin.data.vertices:
    p=v.co
    if abs(p.x)>1.50:
        p.x=math.copysign(1.50+(abs(p.x)-1.50)*.92,p.x);p.y=.16+(p.y-.16)*1.42;p.z=1.82+(p.z-1.82)*1.42

# A wider source coat/sleeve, with the same shoulder-to-hand length and source weights.
for v in main.data.vertices:
    p=v.co
    weights={main.vertex_groups[g.group].name:g.weight for g in v.groups}
    aw=sum(w for name,w in weights.items()if 'Arm'in name)
    if aw>.01:
        p.y=.16+(p.y-.16)*(1+.75*aw);p.z=1.82+(p.z-1.82)*(1+.65*aw)
    elif weights.get('Head',0)<.1 and abs(p.x)<.65 and 1.3<p.z<2.2:
        p.x*=1.23;p.y=.12+(p.y-.12)*1.10
    if abs(p.x)<.62 and p.y<-.20:
        neck=max(0,1-abs(p.z-1.84)/.20)*max(0,1-(abs(p.x)/.62)**6)
        p.y+=.16*neck;p.z-=.05*neck*(.5+.5*math.cos(p.x/.62*math.pi*3))
    if p.z>2.56 and abs(p.x)<.2:
        p.x*=1.45;p.y=-.47+(p.y+.47)*1.3
skin.data.materials.append(SLATE)
for p in skin.data.polygons:
    co=sum((skin.data.vertices[i].co for i in p.vertices),Vector())/len(p.vertices)
    if 1.0<co.z<1.65 and abs(co.x)<.5:p.material_index=1

HC=Vector((0,-.30,2.23));HEAD_SCALE=Vector((1.12,1,1.08))
for o in [main,skin,white,black,teeth,tongue]:
    headgroup=o.vertex_groups.get('Head')
    for v in o.data.vertices:
        weight=next((g.weight for g in v.groups if headgroup and g.group==headgroup.index),0)
        v.co += Vector((v.co[i]-HC[i])*(HEAD_SCALE[i]-1)*weight for i in range(3))
    bm=bmesh.new();bm.from_mesh(o.data);bmesh.ops.remove_doubles(bm,verts=bm.verts[:],dist=.00001);bmesh.ops.recalc_face_normals(bm,faces=bm.faces[:]);bm.to_mesh(o.data);bm.free()
    if o in [main,skin]:
        mod=o.modifiers.new('broad_surface','SUBSURF');mod.levels=1;mod.render_levels=1
BASE={o.name:[v.co.copy()for v in o.data.vertices]for o in [skin,black,teeth,tongue]}
FACE_BORDER={i for i,_ in jaw_loop(skin.data)}
MZ=HC.z+(1.985-HC.z)*HEAD_SCALE.z

# Procedural iris uses a stable rest-space UV on the retained source eyeballs.
eye_mat=mat('brum_eyes','#F0F4EC',.2,.45);nt=eye_mat.node_tree;nodes=nt.nodes;links=nt.links
uv=nodes.new('ShaderNodeUVMap');uv.uv_map='brum_eye'
sep=nodes.new('ShaderNodeSeparateXYZ');links.new(uv.outputs['UV'],sep.inputs[0])
def op(kind,a,b):
    n=nodes.new('ShaderNodeMath');n.operation=kind
    for i,x in enumerate([a,b]):
        if isinstance(x,(int,float)):n.inputs[i].default_value=x
        else:links.new(x,n.inputs[i])
    return n.outputs[0]
dx=op('SUBTRACT',sep.outputs[0],.5);dz=op('SUBTRACT',sep.outputs[1],.46)
dist=op('SQRT',op('ADD',op('MULTIPLY',dx,dx),op('MULTIPLY',dz,dz)),0)
ramp=nodes.new('ShaderNodeValToRGB');links.new(dist,ramp.inputs['Fac'])
cr=ramp.color_ramp;cr.interpolation='EASE';cr.elements[0].position=.15;cr.elements[0].color=(*lin('#071720'),1)
cr.elements[1].position=.34;cr.elements[1].color=(*lin('#F0F4EC'),1)
for pos,c in [(.19,'#0A1E2C'),(.22,'#2F6B88'),(.30,'#2F6B88'),(.32,'#193C54')]:cr.elements.new(pos).color=(*lin(c),1)
links.new(ramp.outputs[0],nodes.get('Principled BSDF').inputs['Base Color'])
white.data.materials.clear();white.data.materials.append(eye_mat)
EYE_X=.3081654*1.12;EYE_Z=HC.z+(2.2776755-HC.z)*1.08;EYE_Y=-.390347
RX=.163953*1.12;RZ=.163922*1.08;RY=.16612
# The source whites have rectangular apertures where the original black inserts sat.
# Replace only those two eye surfaces, at the audited source centres, with closed
# ellipsoids; the source head, sockets and facial skin remain intact.
bm=bmesh.new()
for side in [-1,1]:
    geo=bmesh.ops.create_uvsphere(bm,u_segments=40,v_segments=24,radius=1)
    center=Vector((side*EYE_X,EYE_Y,EYE_Z))
    for v in geo['verts']:v.co=center+Vector((v.co.x*RX,v.co.y*RY,v.co.z*RZ))
bm.to_mesh(white.data);bm.free()
white.data.shade_smooth();white.vertex_groups.clear();hg=white.vertex_groups.new(name='Head');hg.add(list(range(len(white.data.vertices))),1,'REPLACE')
lay=white.data.uv_layers.new(name='brum_eye')
for p in white.data.polygons:
    for j in p.loop_indices:
        co=white.data.vertices[white.data.loops[j].vertex_index].co;sgn=1 if co.x>0 else-1
        lay.data[j].uv=((co.x-sgn*EYE_X)/(RX*2)+.5,(co.z-EYE_Z)/(RZ*2)+.5)

def newobj(name,data=None):
    o=bpy.data.objects.new(name,data);sc.collection.objects.link(o);return o
def bone_parent(o):
    attach_bone(o,'Head')
def attach_bone(o,name):
    mw=o.matrix_world.copy();bone=arm.data.bones[name]
    rest=arm.matrix_world@bone.matrix_local@Matrix.Translation((0,bone.length,0))
    o.parent=arm;o.parent_type='BONE';o.parent_bone=name;o.matrix_parent_inverse=Matrix.Identity(4);o.matrix_basis=rest.inverted()@mw
def fur_lock(name,centers,radii,bone):
    verts=[];faces=[];N=12
    for k,(p,ry,rz)in enumerate(zip(centers,*radii)):
        for j in range(N):
            a=j/N*math.tau;verts.append((p[0],p[1]+math.cos(a)*ry,p[2]+math.sin(a)*rz))
    for k in range(len(centers)-1):
        for j in range(N):faces.append((k*N+j,k*N+(j+1)%N,(k+1)*N+(j+1)%N,(k+1)*N+j))
    faces.extend([tuple(range(N-1,-1,-1)),tuple((len(centers)-1)*N+j for j in range(N))])
    me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);me.materials.append(IVORY);me.shade_smooth();o=newobj(name,me)
    mod=o.modifiers.new('sculpted_lock','SUBSURF');mod.levels=mod.render_levels=1;attach_bone(o,bone)
for side in [-1,1]:
    for i,x in enumerate([.52,.82,1.12]):
        centers=[(side*x,.14,1.84),(side*(x+.12),.015,1.84),(side*(x+.31),-.035,1.72),(side*(x+.43),-.045,1.65)]
        fur_lock(f'coat_arm_{side}_{i}',centers,([.13,.22,.16,.008],[.18,.24,.18,.008]),'UpperArm.L'if side>0 else'UpperArm.R')
    for i,z in enumerate([2.48,2.28,2.07]):
        # Roots lie inside the retained head coat; only the broad outside scallop is exposed.
        centers=[(side*.39,-.12,z),(side*.51,-.18,z-.035),(side*.63,-.16,z-.16),(side*.66,-.12,z-.28)]
        fur_lock(f'coat_mane_{side}_{i}',centers,([.10,.19,.16,.005],[.16,.20,.14,.005]),'Head')
# A single coat surface joins the source neck, mane, shoulder and sleeve fur.
# The original face is a separate retained skin hull and is never remeshed.
bpy.context.view_layer.update();eo=skin.evaluated_get(bpy.context.evaluated_depsgraph_get());me=eo.to_mesh()
jaw=sorted([p for _,p in jaw_loop(me)if p.z<2.10],key=lambda p:p.x);eo.to_mesh_clear()
def jaw_edge(x):
    if x<=jaw[0].x:return jaw[0].copy()
    for a,b in zip(jaw,jaw[1:]):
        if a.x<=x<=b.x:return a.lerp(b,(x-a.x)/(b.x-a.x))
    return jaw[-1].copy()
def beard_tip(x):
    anchors=[(0,1.42),(.15,1.56),(.30,1.49),(.45,1.65),(.56,1.90)];x=abs(x)
    for(a,za),(b,zb)in zip(anchors,anchors[1:]):
        if a<=x<=b:
            t=(1-math.cos((x-a)/(b-a)*math.pi))/2;return za*(1-t)+zb*t
    return anchors[-1][1]
verts=[];faces=[];NX=40;NV=12
for back in [False,True]:
    for i in range(NX+1):
        x=-.56+1.12*i/NX;edge=jaw_edge(x);top=edge.z+.01;bottom=beard_tip(x)
        for j in range(NV+1):
            t=j/NV;z=top*(1-t)+bottom*t
            y=.14 if back else(edge.y+.035)*(1-t)-.32*t-.14*math.sin(math.pi*t)*(.8+.2*math.cos(x*math.pi/.15))
            verts.append((x,y,z))
count=(NX+1)*(NV+1)
for back in [0,1]:
    off=back*count
    for i in range(NX):
        for j in range(NV):
            a=off+i*(NV+1)+j;b=a+NV+1
            faces.append((a,a+1,b+1,b)if back else(a,b,b+1,a+1))
boundary=[i*(NV+1)for i in range(NX+1)]+[NX*(NV+1)+j for j in range(1,NV+1)]+[i*(NV+1)+NV for i in range(NX-1,-1,-1)]+[j for j in range(NV-1,0,-1)]
for k,a in enumerate(boundary):
    b=boundary[(k+1)%len(boundary)];faces.append((a,a+count,b+count,b))
me=bpy.data.meshes.new('coat_beard');me.from_pydata(verts,[],faces);me.materials.append(IVORY)
bm=bmesh.new();bm.from_mesh(me);bmesh.ops.recalc_face_normals(bm,faces=bm.faces[:]);bm.to_mesh(me);bm.free()
o=newobj('coat_beard',me);bone_parent(o)
bpy.context.view_layer.update();coat=[main]+[o for o in sc.objects if o.type=='MESH'and o.name.startswith(('coat_arm_','coat_mane_','coat_beard'))]
bpy.ops.object.select_all(action='DESELECT')
for o in coat:
    if o!=main:
        bone=o.parent_bone;mw=o.matrix_world.copy();o.parent=None;o.matrix_world=mw
        group=o.vertex_groups.new(name=bone);group.add(list(range(len(o.data.vertices))),1,'REPLACE')
    o.select_set(True)
bpy.context.view_layer.objects.active=main;bpy.ops.object.join()
for mod in list(main.modifiers):main.modifiers.remove(mod)
proxy=main.copy();proxy.data=main.data.copy();proxy.name='coat_weight_reference';sc.collection.objects.link(proxy)
proxy.hide_render=True;proxy.hide_set(True)
shell=main.modifiers.new('closed_coat_shell','SOLIDIFY');shell.thickness=.055;shell.offset=-1;shell.use_rim=True
bpy.ops.object.modifier_apply(modifier=shell.name)
main.data.remesh_voxel_size=.022;main.data.remesh_voxel_adaptivity=0;bpy.ops.object.voxel_remesh()
for g in proxy.vertex_groups:
    if not main.vertex_groups.get(g.name):main.vertex_groups.new(name=g.name)
dt=main.modifiers.new('source_coat_weights','DATA_TRANSFER');dt.object=proxy;dt.use_vert_data=True;dt.data_types_verts={'VGROUP_WEIGHTS'};dt.vert_mapping='POLYINTERP_NEAREST';dt.mix_mode='REPLACE'
bpy.ops.object.modifier_apply(modifier=dt.name)
coat_weight_sums=[sum(g.weight for g in v.groups)for v in main.data.vertices]
assert min(coat_weight_sums)>.99 and max(coat_weight_sums)<1.01
smooth_coat=main.modifiers.new('joined_coat_smooth','SMOOTH');smooth_coat.factor=.8;smooth_coat.iterations=8
soft=main.modifiers.new('coat_finish','SUBSURF');soft.levels=soft.render_levels=1
rig=main.modifiers.new('retained_source_rig','ARMATURE');rig.object=arm
main.data.materials.clear();main.data.materials.append(IVORY)
for p in main.data.polygons:p.material_index=0;p.use_smooth=True
print('Joined coat vertices:',len(main.data.vertices),flush=True)
def cap(name,upper):
    bm=bmesh.new();bmesh.ops.create_uvsphere(bm,u_segments=40,v_segments=24,radius=1.04)
    bmesh.ops.bisect_plane(bm,geom=bm.verts[:]+bm.edges[:]+bm.faces[:],plane_co=(0,0,0),plane_no=(0,0,1),clear_inner=upper,clear_outer=not upper)
    me=bpy.data.meshes.new(name);bm.to_mesh(me);bm.free();me.shade_smooth();o=newobj(name,me);me.materials.append(BLUE);return o
LIDS=[];BROWS=[];CLOSED=[]
SKIN_BVH=BVHTree.FromObject(skin,bpy.context.evaluated_depsgraph_get())
def surface_y(x,z):
    hit,_,_,_=SKIN_BVH.ray_cast(Vector((x,-4,z)),Vector((0,1,0)),8)
    return hit.y-.007 if hit else -.54
print('Eye surface / retained sphere front:',surface_y(EYE_X,EYE_Z),EYE_Y-RY,flush=True)
for side in [-1,1]:
    root=newobj('eye_mount_'+str(side));root.matrix_world=Matrix.Translation(Vector((side*EYE_X,EYE_Y,EYE_Z)))@Matrix.Diagonal((RX,RY,RZ,1));bone_parent(root)
    up=cap('upper_lid_'+str(side),True);low=cap('lower_lid_'+str(side),False)
    for o in [up,low]:o.parent=root;o.matrix_parent_inverse=Matrix.Identity(4)
    LIDS.append((side,up,low))
    cu=bpy.data.curves.new('brow_'+str(side),'CURVE');cu.dimensions='3D';cu.resolution_u=12;cu.bevel_depth=.042;cu.bevel_resolution=3;cu.use_fill_caps=True
    sp=cu.splines.new('BEZIER');sp.bezier_points.add(4)
    ob=newobj('brow_'+str(side),cu);cu.materials.append(BROW);bone_parent(ob);BROWS.append((side,sp))
    cu=bpy.data.curves.new('closed_eye_'+str(side),'CURVE');cu.dimensions='3D';cu.resolution_u=12;cu.bevel_depth=.021;cu.bevel_resolution=3;cu.use_fill_caps=True
    sp=cu.splines.new('BEZIER');sp.bezier_points.add(4)
    for i,b in enumerate(sp.bezier_points):
        u=i/4;x=side*EYE_X+(u-.5)*.25;z=EYE_Z+.015+math.sin(u*math.pi)*.065
        b.co=(x,surface_y(x,z),z);b.handle_left_type=b.handle_right_type='AUTO';b.radius=.5+math.sin(u*math.pi)*.5
    ob=newobj('happy_eye_'+str(side),cu);cu.materials.append(BROW);bone_parent(ob);CLOSED.append(ob)

STATES={
 'Neutral':dict(mouth=.18,corner=.012,lid=.28,low=.03,brow=.0,tilt=0,teeth=False),
 'Welcome':dict(mouth=1.12,corner=.065,lid=.84,low=.45,brow=.025,tilt=-.01,teeth=True),
 'Protective':dict(mouth=1.25,corner=-.018,lid=.40,low=.06,brow=-.018,tilt=.12,teeth=True)}
def face(state):
    p=STATES[state]
    for o in [skin,black,teeth,tongue]:
        for v,base in zip(o.data.vertices,BASE[o.name]):
            co=base.copy()
            if o==skin:
                weight=(1-smooth(.31,.46,abs(co.x)))*smooth(1.80,1.86,co.z)*(1-smooth(2.07,2.18,co.z))*(1-smooth(-.38,-.28,co.y))
                if v.index in FACE_BORDER:weight=0
            else:weight=1
            z=MZ+(co.z-MZ)*p['mouth']+p['corner']*(abs(co.x)/.3)**2
            co.z+=(z-co.z)*weight
            if o==tongue:co.y+=.17;co.z+=.025
            if o==teeth and base.z<MZ:co.y+=.13
            v.co=co
        o.data.update()
    teeth.hide_render=not p['teeth'];tongue.hide_render=state!='Welcome'
    white.hide_render=state=='Welcome'
    for ob in CLOSED:ob.hide_render=state!='Welcome'
    for side,up,low in LIDS:
        up.hide_render=low.hide_render=state=='Welcome'
        up.rotation_euler=(-math.asin(max(-1,min(1,1-2*p['lid']))),-side*p['tilt']*2.5,0)
        low.rotation_euler=(math.asin(max(-1,min(1,1-2*p['low']))),0,0)
    for side,sp in BROWS:
        for i,b in enumerate(sp.bezier_points):
            u=i/4;x=side*(.17+u*.30);z=EYE_Z+.17+p['brow']+math.sin(u*math.pi)*.022+p['tilt']*(u-.5)
            b.co=(x,surface_y(x,z),z);b.radius=.65+math.sin(u*math.pi)*.35;b.handle_left_type=b.handle_right_type='AUTO'
    if args.skin:
        white.hide_render=teeth.hide_render=tongue.hide_render=black.hide_render=True
        for _,up,low in LIDS:up.hide_render=low.hide_render=True
        for ob in sc.objects:
            if ob.type=='CURVE':ob.hide_render=True

if args.skin:
    for o in sc.objects:
        if o.type=='MESH':
            for i in range(len(o.data.materials)):o.data.materials[i]=CLAY
arm.data.pose_position='POSE'
sc.render.engine='CYCLES';sc.cycles.samples=args.samples;sc.cycles.use_denoising=True;sc.cycles.device='CPU'
sc.render.threads_mode='FIXED';sc.render.threads=args.threads;sc.render.film_transparent=True
sc.render.image_settings.file_format='PNG';sc.render.image_settings.color_mode='RGBA';sc.render.resolution_percentage=100
sc.view_settings.view_transform='AgX';sc.view_settings.look='AgX - Medium High Contrast'
def area(loc,energy,size,color):
    bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.data.energy=energy;o.data.size=size;o.data.color=color;o.rotation_euler=(Vector((0,0,1.6))-o.location).to_track_quat('-Z','Y').to_euler()
area((-6,-5,9),1600,5,(1,.90,.80));area((7,-6,2),900,5,(.55,.65,1));area((2,6,6),1400,4,(.80,.85,1));area((0,-7,3),220,5,(1,.95,.95))
world=bpy.data.worlds.new('brum_world');sc.world=world;world.node_tree.nodes['Background'].inputs['Color'].default_value=(.05,.04,.09,1)
bpy.ops.object.camera_add(location=(0,-10,1.84),rotation=(math.pi/2,0,0));cam=bpy.context.object;sc.camera=cam;cam.data.type='ORTHO'
PX=3;CELL=(144,128);PIVOT=(72,116)
def pose_fingers(open_hand=False):
    for side in ['L','R']:
        sign=1 if side=='L'else-1
        for finger in ['Index','Middle','Pinky','Thumb']:
            for joint in range(1,3 if finger=='Thumb'else 4):
                pb=arm.pose.bones[f'{finger}{joint}.{side}'];pb.rotation_mode='QUATERNION'
                axis=pb.bone.matrix_local.to_3x3().inverted()@Vector((0,1,0))
                pb.rotation_quaternion=Quaternion()if open_hand else Quaternion(axis.normalized(),sign*math.radians(48 if joint==1 else 65))
arm.animation_data_create();ref_action=bpy.data.actions['Idle'];arm.animation_data.action=ref_action
if ref_action.slots:arm.animation_data.action_slot=ref_action.slots[0]
sc.frame_set(0);pose_fingers();face('Neutral');bpy.context.view_layer.update()
pts=[];dep=bpy.context.evaluated_depsgraph_get()
for o in sc.objects:
    if o.type!='MESH'or o.hide_render:continue
    eo=o.evaluated_get(dep);me=eo.to_mesh();pts.extend(eo.matrix_world@v.co for v in me.vertices);eo.to_mesh_clear()
Z0=min(p.z for p in pts);Z1=max(p.z for p in pts);UNITS_PER_MODEL=80/(Z1-Z0)
print('Reference feet/top:',Z0,Z1,'units/model:',UNITS_PER_MODEL,flush=True)
cam.location.z=Z0+(PIVOT[1]-CELL[1]/2)/UNITS_PER_MODEL
cam.data.ortho_scale=CELL[0]/UNITS_PER_MODEL;sc.render.resolution_x=CELL[0]*PX;sc.render.resolution_y=CELL[1]*PX
if args.face:sc.render.resolution_x=sc.render.resolution_y=512;cam.data.ortho_scale=1.48
report={'source':str(SOURCE),'sourceSHA256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'px':PX,'cell':CELL,'pivot':PIVOT,'nativeHeight':80,'coat':{'joinedVertices':len(main.data.vertices),'weightSumRange':[min(coat_weight_sums),max(coat_weight_sums)]},'clips':{},'renders':[]}
for spec in args.clips:
    bits=spec.split(':');name=bits[0];n=int(bits[1])if len(bits)>1 else 1
    only=[int(x)for x in bits[2].split(',')]if len(bits)>2 else range(n)
    state=name if name in STATES else 'Welcome'if name=='Wave'else'Protective'if name=='Punch'else'Neutral'
    action=bpy.data.actions['Idle'if name in STATES else name];arm.animation_data_create();arm.animation_data.action=action
    if action.slots:arm.animation_data.action_slot=action.slots[0]
    f0,f1=action.frame_range;arm.rotation_euler=(0,0,math.radians(args.yaw))
    report['clips'][name]={'source':action.name,'sourceRange':[f0,f1],'n':n,'state':state}
    for i in only:
        fr=f0+(f1-f0)*i/n;sc.frame_set(int(fr),subframe=fr-int(fr))
        pose_fingers(name=='Wave')
        face(state);bpy.context.view_layer.update()
        if args.face:
            hp=arm.matrix_world@arm.pose.bones['Head'].head;cam.location=(hp.x,-10,hp.z+.18)
        dest=OUT/f'{name}_{i:02d}.png';sc.render.filepath=str(dest);bpy.ops.render.render(write_still=True)
        with Image.open(dest)as im:
            im.load();assert im.mode=='RGBA';bounds=im.getchannel('A').getbbox();assert bounds
            if not args.face:assert bounds[0]>0 and bounds[1]>0 and bounds[2]<im.width and bounds[3]<im.height,(name,i,bounds)
            im.save(dest)
        report['renders'].append({'file':dest.name,'alphaBounds':bounds})
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'brum-proof.blend'))
(OUT/'proof.json').write_text(json.dumps(report,indent=2)+'\n')
print('Brum proof renders complete:',OUT)
```


---

## `art/vesper.py`

Bounded quadruped Cat source proof: continuous feline face, three expressions, four-paw skiff fit and retargeted Walk contact/loop checks. No finished sprite family, steering/flight system or playable encounter is implied.

```python
# Vesper first source-model proof: retained quadruped, fitted feline eyes and carved source mouth.
# python3 art/vesper.py out/relay-proof/vesper Curious:1 Focus:1 Alarm:1 --face
import argparse,hashlib,json,math
from pathlib import Path
import bpy,bmesh,addon_utils
from mathutils import Vector,Matrix
from mathutils.bvhtree import BVHTree
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
ap=argparse.ArgumentParser();ap.add_argument('out');ap.add_argument('clips',nargs='*',default=['Curious:1'])
ap.add_argument('--source',default=str(ROOT/'out/cast/anatomy-audit/Cat.blend'))
ap.add_argument('--face',action='store_true');ap.add_argument('--clay',action='store_true');ap.add_argument('--skiff',action='store_true')
ap.add_argument('--view',type=float,default=55);ap.add_argument('--samples',type=int,default=24);ap.add_argument('--threads',type=int,default=2)
args=ap.parse_args();OUT=Path(args.out).resolve();OUT.mkdir(parents=True,exist_ok=True);SOURCE=Path(args.source).resolve()
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()=='e9836027dc8591fd2da03e6d8d6575972bc5c7aebaa17a0762b82f7bc37264de'
addon_utils.enable('cycles',default_set=True);bpy.ops.wm.open_mainfile(filepath=str(SOURCE),load_ui=False,use_scripts=False)
sc=bpy.context.scene;arm=next(o for o in sc.objects if o.type=='ARMATURE');body=bpy.data.objects['Cat']
for o in list(sc.objects):
    if o not in [arm,body]:bpy.data.objects.remove(o,do_unlink=True)
arm.data.pose_position='REST';arm.animation_data.use_nla=False;arm.rotation_mode='XYZ';arm.scale=(1,1,1)
FOOT_BONES=['Bone.016','Bone.019','Bone.010','Bone.013']
# Preserve the authored paw orientations before shortening the rest legs. The
# lower-leg IK solution changes with those proportions, so its old local paw
# rotations cannot simply be reused without turning the soles sideways.
source_foot_rotations={};arm.data.pose_position='POSE';source_walk=bpy.data.actions['Walking'];arm.animation_data.action=source_walk
if source_walk.slots:arm.animation_data.action_slot=source_walk.slots[0]
for frame in range(41):
    sc.frame_set(frame);bpy.context.view_layer.update();source_foot_rotations[frame]=[arm.pose.bones[name].matrix.to_quaternion()for name in FOOT_BONES]
arm.data.pose_position='REST'
for mod in list(body.modifiers):body.modifiers.remove(mod)
bpy.context.view_layer.update()
SHIFT=.512
def short_leg_z(z):return z*.68 if z<1.6 else z-SHIFT
for v in body.data.vertices:v.co.z=short_leg_z(v.co.z)
bpy.ops.object.select_all(action='DESELECT');arm.select_set(True);bpy.context.view_layer.objects.active=arm;bpy.ops.object.mode_set(mode='EDIT')
for b in arm.data.edit_bones:b.head.z=short_leg_z(b.head.z);b.tail.z=short_leg_z(b.tail.z)
arm.data.edit_bones['Bone.002'].tail.x-=.40
for point in ['head','tail']:getattr(arm.data.edit_bones['Bone.003'],point).x-=.40
bpy.ops.object.mode_set(mode='OBJECT');arm.select_set(False);body.select_set(True)

def lin(h):
    cs=[int(h[i:i+2],16)/255 for i in (1,3,5)];return tuple(c/12.92 if c<=.04045 else((c+.055)/1.055)**2.4 for c in cs)
def mat(name,h,rough=.4,coat=.3):
    m=bpy.data.materials.new(name);m.use_nodes=True;b=m.node_tree.nodes.get('Principled BSDF')
    b.inputs['Base Color'].default_value=(*lin(h),1);b.inputs['Roughness'].default_value=rough;b.inputs['Coat Weight'].default_value=coat;b.inputs['Coat Roughness'].default_value=.23;return m
PURPLE=mat('vesper_coat','#554681');PALE=mat('vesper_pale','#B3A9CB');PINK=mat('vesper_ear_nose','#B77DAB',.47,.2)
TIP=mat('vesper_tail_tip','#B29DE8');DARK=mat('vesper_cavity','#111526',.75,0);LID=mat('vesper_lid','#E4DCEB',.42,.3)
CLAY=mat('vesper_clay','#B5B9C8',.9,0)
SOURCE_MATERIALS=[p.material_index for p in body.data.polygons]
body.data.materials.clear()
for m in [PURPLE,PALE,PINK,DARK,TIP]:body.data.materials.append(m)
for p,index in zip(body.data.polygons,SOURCE_MATERIALS):p.material_index=index
DARK.node_tree.nodes['Principled BSDF'].inputs['Specular IOR Level'].default_value=0
HC=arm.data.bones['Bone.003'].head_local.copy();HEAD='Bone.003'
headgroup=body.vertex_groups[HEAD].index
for v in body.data.vertices:
    w=next((g.weight for g in v.groups if g.group==headgroup),0);p=v.co
    p.x-=.40*w
    p.x+= (p.x-HC.x)*.35*w;p.y*=1+1.20*w;p.z+=(p.z-HC.z)*.50*w
    if w>.75 and p.x>2.65:p.x=2.65+(p.x-2.65)*.60
    bw=sum(g.weight for g in v.groups if body.vertex_groups[g.group].name in ['Bone','Bone.001']);p.y*=1+.18*bw
    for foot in ['Bone.016','Bone.019','Bone.010','Bone.013']:
        idx=body.vertex_groups[foot].index;fw=next((g.weight for g in v.groups if g.group==idx),0)
        if fw>.01:
            c=arm.data.bones[foot].head_local;p.x=c.x+(p.x-c.x)*(1+.25*fw);p.y=c.y+(p.y-c.y)*(1+.70*fw)
    leg=[g for g in v.groups if body.vertex_groups[g.group].name in [f'Bone.{i:03}'for i in range(8,20)]]
    if leg:
        group=max(leg,key=lambda g:g.weight);b=arm.data.bones[body.vertex_groups[group.group].name];axis=b.tail_local-b.head_local
        t=max(0,min(1,(p-b.head_local).dot(axis)/axis.length_squared));center=b.head_local+axis*t
        p[:]=center+(p-center)*(1+.28*group.weight)
for p in body.data.polygons:
    p.use_smooth=True
    if sum(next((g.weight for g in body.data.vertices[i].groups if g.group==body.vertex_groups['Bone.007'].index),0)for i in p.vertices)/len(p.vertices)>.6:p.material_index=4
# Replace the blunt distal cap with a connected tapered steering leaf. It is
# bridged to the original tail tube and uses the fourth original tail joint.
bm=bmesh.new();bm.from_mesh(body.data);cut_z=3.44
bmesh.ops.bisect_plane(bm,geom=bm.verts[:]+bm.edges[:]+bm.faces[:],plane_co=(0,0,cut_z),plane_no=(0,0,1),clear_outer=True)
base={v for e in bm.edges if e.is_boundary and all(abs(v.co.z-cut_z)<.0001 for v in e.verts)for v in e.verts}
assert len(base)>=6;center=sum((v.co for v in base),Vector())/len(base);ring=sorted(base,key=lambda v:math.atan2(v.co.y-center.y,v.co.x-center.x));N=len(ring)
dl=bm.verts.layers.deform.active;tip_group=body.vertex_groups['Bone.007'].index
for z,rx,ry,dx in [(3.56,.065,.15,-.015),(3.77,.055,.25,-.025),(3.98,.025,.13,-.005)]:
    nxt=[]
    for k in range(N):
        angle=math.atan2(ring[k].co.y-center.y,ring[k].co.x-center.x)if z==3.56 else angles[k]
        nv=bm.verts.new((center.x+dx+rx*math.cos(angle),center.y+ry*math.sin(angle),z));nv[dl][tip_group]=1;nxt.append(nv)
    if z==3.56:angles=[math.atan2(v.co.y-center.y,v.co.x-center.x)for v in ring]
    for k in range(N):f=bm.faces.new((ring[k],ring[(k+1)%N],nxt[(k+1)%N],nxt[k]));f.material_index=4
    ring=nxt
tip=bm.verts.new((center.x+.02,center.y,4.10));tip[dl][tip_group]=1
for k in range(N):f=bm.faces.new((ring[k],ring[(k+1)%N],tip));f.material_index=4
bmesh.ops.recalc_face_normals(bm,faces=bm.faces[:]);bm.to_mesh(body.data);bm.free()
nose_raw={i for p in body.data.polygons if p.material_index==2 and abs(sum(body.data.vertices[i].co.y for i in p.vertices)/len(p.vertices))<.30 and sum(body.data.vertices[i].co.z for i in p.vertices)/len(p.vertices)<2.60 and sum(body.data.vertices[i].co.x for i in p.vertices)/len(p.vertices)>2.50 for i in p.vertices}
if nose_raw:
    nc=sum((body.data.vertices[i].co for i in nose_raw),Vector())/len(nose_raw)
    for i in nose_raw:
        p=body.data.vertices[i].co;p.y=nc.y+(p.y-nc.y)*.65;p.z=nc.z+(p.z-nc.z)*.65
# The source body, muzzle, ears and paws remain one connected mesh.
bpy.context.view_layer.objects.active=body;body.select_set(True)
sub=body.modifiers.new('source_surface','SUBSURF');sub.levels=sub.render_levels=2;bpy.ops.object.modifier_apply(modifier=sub.name)

def newobj(name,data):
    o=bpy.data.objects.new(name,data);sc.collection.objects.link(o);return o
def bone_parent(o,bone=HEAD):
    mw=o.matrix_world.copy();b=arm.data.bones[bone];rest=arm.matrix_world@b.matrix_local@Matrix.Translation((0,b.length,0))
    o.parent=arm;o.parent_type='BONE';o.parent_bone=bone;o.matrix_parent_inverse=Matrix.Identity(4);o.matrix_basis=rest.inverted()@mw
def uv_sphere(name,center,radii,material):
    bm=bmesh.new();geo=bmesh.ops.create_uvsphere(bm,u_segments=40,v_segments=28,radius=1)
    for v in geo['verts']:v.co=Vector(center)+Vector(v.co[i]*radii[i]for i in range(3))
    me=bpy.data.meshes.new(name);bm.to_mesh(me);bm.free();me.shade_smooth();me.materials.append(material);return newobj(name,me)
def cylinder_cut(name,cy,cz,ry,rz,xfront,xback):
    verts=[];faces=[];N=64
    for x in [xback,xfront]:
        for i in range(N):
            a=i/N*math.tau;verts.append((x,cy+math.cos(a)*ry,cz+math.sin(a)*rz))
    for i in range(N):faces.append((i,(i+1)%N,N+(i+1)%N,N+i))
    faces.extend([tuple(range(N-1,-1,-1)),tuple(N+i for i in range(N))])
    me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces)
    for m in body.data.materials:me.materials.append(m)
    for p in me.polygons:p.material_index=3
    o=newobj(name,me);bm=bmesh.new();bm.from_mesh(me);bmesh.ops.recalc_face_normals(bm,faces=bm.faces[:]);bm.to_mesh(me);bm.free()
    bpy.context.view_layer.objects.active=body;mod=body.modifiers.new(name,'BOOLEAN');mod.operation='DIFFERENCE';mod.solver='EXACT';mod.object=o;bpy.ops.object.modifier_apply(modifier=mod.name);bpy.data.objects.remove(o,do_unlink=True)

bpy.context.view_layer.update();bvh=BVHTree.FromObject(body,bpy.context.evaluated_depsgraph_get())
def surf_x(y,z):
    hit,_,_,_=bvh.ray_cast(Vector((10,y,z)),Vector((-1,0,0)),20)
    assert hit,(y,z);return hit.x
EYES=[];LIDS=[]
EY=.59;EZ=3.08-SHIFT;ER=(.25,.34,.37)
for side in [-1,1]:
    sx=surf_x(side*EY,EZ);center=(sx-.17,side*EY,EZ)
    cylinder_cut('eye_socket_'+str(side),side*EY,EZ,.315,.345,sx+.5,sx-.40)
    EYES.append((side,center))
nose_faces=[p for p in body.data.polygons if p.material_index==2 and abs(p.center.y)<.20 and p.center.x>2.2]
if nose_faces:
    nose_center=max(nose_faces,key=lambda p:p.center.x).center.copy()
else:
    front=max(v.co.x for v in body.data.vertices);nose_points=[v.co for v in body.data.vertices if v.co.x>front-.04];nose_center=sum(nose_points,Vector())/len(nose_points)
MZ=nose_center.z-.32;MX=surf_x(0,MZ)
print('Nose / mouth centers:',list(nose_center),MZ,flush=True)
cylinder_cut('source_mouth',0,MZ,.25,.08,MX+.4,MX-.52)
# Boolean-created facial vertices stay on the source head bone; no face cover is added.
for v in body.data.vertices:
    if v.co.x>1.90 and v.co.z>1.9-SHIFT:
        for g in body.vertex_groups:g.remove([v.index])
        body.vertex_groups[HEAD].add([v.index],1,'REPLACE')
for p in body.data.polygons:p.use_smooth=True

# Cream face is a colour region on the continuous source surface.
head_attr=body.data.attributes.new('head_weight','FLOAT','POINT')
for v in body.data.vertices:
    head_attr.data[v.index].value=next((g.weight for g in v.groups if g.group==headgroup),0)
for name,axes in [('face_rest_yz',(1,2)),('face_rest_x',(0,0))]:
    lay=body.data.uv_layers.new(name=name)
    for p in body.data.polygons:
        for j in p.loop_indices:
            co=body.data.vertices[body.data.loops[j].vertex_index].co;lay.data[j].uv=(co[axes[0]],co[axes[1]])
def node_math(nt,kind,a,b=0):
    q=nt.nodes.new('ShaderNodeMath');q.operation=kind
    for i,value in enumerate([a,b]):
        if isinstance(value,(int,float)):q.inputs[i].default_value=value
        else:nt.links.new(value,q.inputs[i])
    return q.outputs[0]
def clamp01(nt,value):return node_math(nt,'MINIMUM',1,node_math(nt,'MAXIMUM',0,value))
for material in [PURPLE,PALE]:
    nt=material.node_tree;n=nt.nodes;lk=nt.links;bs=n['Principled BSDF'];uv=n.new('ShaderNodeUVMap');uv.uv_map='face_rest_yz';sep=n.new('ShaderNodeSeparateXYZ');lk.new(uv.outputs[0],sep.inputs[0])
    xu=n.new('ShaderNodeUVMap');xu.uv_map='face_rest_x';xs=n.new('ShaderNodeSeparateXYZ');lk.new(xu.outputs[0],xs.inputs[0])
    ay=node_math(nt,'ABSOLUTE',sep.outputs[0]);z=sep.outputs[1];top=node_math(nt,'ADD',3.05-SHIFT,node_math(nt,'MULTIPLY',.9,clamp01(nt,node_math(nt,'DIVIDE',ay,.80))))
    cream=clamp01(nt,node_math(nt,'DIVIDE',node_math(nt,'SUBTRACT',top,z),.055));gate=clamp01(nt,node_math(nt,'DIVIDE',node_math(nt,'SUBTRACT',xs.outputs[0],2.00),.30))
    ear=node_math(nt,'MULTIPLY',clamp01(nt,node_math(nt,'DIVIDE',node_math(nt,'SUBTRACT',z,3.16-SHIFT),.32)),clamp01(nt,node_math(nt,'DIVIDE',node_math(nt,'SUBTRACT',ay,.60),.20)))
    attr=n.new('ShaderNodeAttribute');attr.attribute_name='head_weight';fac=node_math(nt,'MULTIPLY',attr.outputs['Fac'],node_math(nt,'MULTIPLY',gate,node_math(nt,'MULTIPLY',cream,node_math(nt,'SUBTRACT',1,ear))))
    mix=n.new('ShaderNodeMixRGB');mix.inputs[1].default_value=bs.inputs['Base Color'].default_value;mix.inputs[2].default_value=(*lin('#E4DCEB'),1);lk.new(fac,mix.inputs[0]);lk.new(mix.outputs[0],bs.inputs['Base Color'])

EYE_MAT=mat('vesper_gold_eyes','#EEE5D8',.22,.45);nt=EYE_MAT.node_tree;n=nt.nodes;lk=nt.links
uv=n.new('ShaderNodeUVMap');uv.uv_map='eye_yz';sep=n.new('ShaderNodeSeparateXYZ');lk.new(uv.outputs['UV'],sep.inputs[0])
def mathnode(kind,a,b):
    q=n.new('ShaderNodeMath');q.operation=kind
    for i,x in enumerate([a,b]):
        if isinstance(x,(float,int)):q.inputs[i].default_value=x
        else:lk.new(x,q.inputs[i])
    return q.outputs[0]
dx=mathnode('SUBTRACT',sep.outputs[0],.5);dz=mathnode('SUBTRACT',sep.outputs[1],.5)
dist=mathnode('SQRT',mathnode('ADD',mathnode('MULTIPLY',dx,dx),mathnode('MULTIPLY',dz,dz)),0)
ramp=n.new('ShaderNodeValToRGB');lk.new(dist,ramp.inputs[0]);cr=ramp.color_ramp;cr.interpolation='EASE';cr.elements[0].position=.0;cr.elements[0].color=(*lin('#ECBA72'),1);cr.elements[1].position=.46;cr.elements[1].color=(*lin('#F3EEE7'),1)
for p,c in [(.31,'#E8A54F'),(.39,'#99532D'),(.425,'#2C1E2C'),(.44,'#F3EEE7')]:cr.elements.new(p).color=(*lin(c),1)
PUPIL_WIDTH=n.new('ShaderNodeValue');PUPIL_WIDTH.outputs[0].default_value=.11
pd=mathnode('ADD',mathnode('POWER',mathnode('DIVIDE',dx,PUPIL_WIDTH.outputs[0]),2),mathnode('POWER',mathnode('DIVIDE',dz,.31),2))
inside=mathnode('LESS_THAN',pd,1);mix=n.new('ShaderNodeMixRGB');mix.inputs[2].default_value=(*lin('#0F1421'),1);lk.new(inside,mix.inputs[0]);lk.new(ramp.outputs[0],mix.inputs[1]);lk.new(mix.outputs[0],n['Principled BSDF'].inputs['Base Color'])

def cap(name,upper):
    bm=bmesh.new();bmesh.ops.create_uvsphere(bm,u_segments=40,v_segments=28,radius=1.02)
    bmesh.ops.bisect_plane(bm,geom=bm.verts[:]+bm.edges[:]+bm.faces[:],plane_co=(0,0,0),plane_no=(0,0,1),clear_inner=upper,clear_outer=not upper)
    me=bpy.data.meshes.new(name);bm.to_mesh(me);bm.free();me.shade_smooth();me.materials.append(LID);return newobj(name,me)
for side,center in EYES:
    eye=uv_sphere('eye_'+str(side),center,ER,EYE_MAT);lay=eye.data.uv_layers.new(name='eye_yz')
    for p in eye.data.polygons:
        for j in p.loop_indices:
            co=eye.data.vertices[eye.data.loops[j].vertex_index].co;lay.data[j].uv=((co.y-center[1])/(ER[1]*2)+.5,(co.z-EZ)/(ER[2]*2)+.5)
    bone_parent(eye)
    root=newobj('lid_mount_'+str(side),None);root.matrix_world=Matrix.Translation(Vector(center))@Matrix.Diagonal((*ER,1));bone_parent(root)
    up=cap('upper_lid_'+str(side),True);low=cap('lower_lid_'+str(side),False)
    for o in [up,low]:o.parent=root;o.matrix_parent_inverse=Matrix.Identity(4)
    LIDS.append((side,up,low))

BASE=[v.co.copy()for v in body.data.vertices]
NOSE_VERTS={i for p in body.data.polygons if p.material_index==2 for i in p.vertices}
STATES={'Curious':dict(lid=.14,low=.025,tilt=0,mouth=.22,corner=.035,pupil=.13,ears=0),
        'Focus':dict(lid=.46,low=.07,tilt=.16,mouth=.13,corner=-.012,pupil=.075,ears=.07),
        'Alarm':dict(lid=.035,low=.01,tilt=-.05,mouth=1.45,corner=0,pupil=.19,ears=-.23)}
def smooth(a,b,x):
    t=max(0,min(1,(x-a)/(b-a)));return t*t*(3-2*t)
def face(name):
    p=STATES[name];PUPIL_WIDTH.outputs[0].default_value=p['pupil']
    for v,base in zip(body.data.vertices,BASE):
        co=base.copy();w=smooth(MX-.50,MX-.12,co.x)*(1-smooth(.26,.40,abs(co.y)))*(1-smooth(.09,.19,abs(co.z-MZ)))
        if v.index in NOSE_VERTS:w=0
        target=MZ+(co.z-MZ)*p['mouth']+p['corner']*(abs(co.y)/.28)**2;co.z+=(target-co.z)*w
        ear=smooth(3.35-SHIFT,3.72-SHIFT,co.z)*smooth(.45,.70,abs(co.y))*smooth(1.75,2.10,co.x)
        co.x+=p['ears']*ear;co.z+=min(0,p['ears'])*.4*ear
        v.co=co
    body.data.update()
    for side,up,low in LIDS:
        up.rotation_euler=(side*p['tilt'],-math.asin(1-2*p['lid']),0);low.rotation_euler=(0,math.asin(1-2*p['low']),0)
armMod=body.modifiers.new('retained_quadruped_rig','ARMATURE');armMod.object=arm
arm.data.pose_position='POSE'
# Bake a sternward/sideways steering bias into a copy of the source tail-root
# motion. The other three articulated tail joints and the four-paw actions stay.
tail=arm.pose.bones['Bone.004'];restq=tail.bone.matrix_local.to_quaternion()
bias=restq.inverted()@(Matrix.Rotation(math.radians(45),4,'X')@Matrix.Rotation(math.radians(-36),4,'Y')).to_quaternion()@restq
for source_name in ['Idle','Walking']:
    source=bpy.data.actions[source_name];samples=[];arm.animation_data.action=source
    if source.slots:arm.animation_data.action_slot=source.slots[0]
    for frame in range(0,41,5):
        sc.frame_set(frame);bpy.context.view_layer.update();samples.append((frame,tail.matrix_basis.to_quaternion()@bias))
    action=source.copy();action.name='Vesper_'+source_name;action.use_fake_user=True
    for layer in action.layers:
        for strip in layer.strips:
            for slot in action.slots:
                bag=strip.channelbag(slot)
                if not bag:continue
                for fc in list(bag.fcurves):
                    if fc.data_path.startswith('pose.bones["Bone.004"].rotation'):bag.fcurves.remove(fc)
                for k in range(4):
                    fc=bag.fcurves.new('pose.bones["Bone.004"].rotation_quaternion',index=k)
                    for fr,q in samples:point=fc.keyframe_points.insert(fr,q[k]);point.interpolation='LINEAR'
tail.rotation_mode='QUATERNION';arm.scale=(.45,.60,.60)
if args.clay:
    for o in sc.objects:
        if o.type=='MESH':
            for i in range(len(o.data.materials)):o.data.materials[i]=CLAY
    for _,up,low in LIDS:up.hide_render=low.hide_render=True
    for o in sc.objects:
        if o.name.startswith('eye_'):o.hide_render=True

sc.render.engine='CYCLES';sc.cycles.samples=args.samples;sc.cycles.use_denoising=True;sc.cycles.device='CPU';sc.render.threads_mode='FIXED';sc.render.threads=args.threads
sc.render.film_transparent=True;sc.render.image_settings.file_format='PNG';sc.render.image_settings.color_mode='RGBA';sc.render.resolution_percentage=100
sc.view_settings.view_transform='AgX';sc.view_settings.look='AgX - Medium High Contrast'
def area(loc,en,size,color):
    bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.data.energy=en;o.data.size=size;o.data.color=color;o.rotation_euler=(Vector((0,0,1.5))-o.location).to_track_quat('-Z','Y').to_euler()
area((6,-5,8),1600,5,(1,.90,.80));area((6,6,2),900,5,(.55,.65,1));area((-4,1,6),1400,4,(.80,.85,1))
world=bpy.data.worlds.new('vesper_world');sc.world=world;world.node_tree.nodes['Background'].inputs['Color'].default_value=(.05,.04,.09,1)
act=bpy.data.actions['Vesper_Idle'];arm.animation_data.action=act
if act.slots:arm.animation_data.action_slot=act.slots[0]
sc.frame_set(0);face('Curious');bpy.context.view_layer.update()
dep=bpy.context.evaluated_depsgraph_get();eo=body.evaluated_get(dep);me=eo.to_mesh();pts=[eo.matrix_world@v.co for v in me.vertices];eo.to_mesh_clear()
lo=Vector(min(p[i]for p in pts)for i in range(3));hi=Vector(max(p[i]for p in pts)for i in range(3));UPM=48/(hi.z-lo.z)
PAW_VERTEX_IDS=[]
for name in FOOT_BONES:
    group=body.vertex_groups[name].index
    PAW_VERTEX_IDS.append([v.index for v in body.data.vertices if sum(g.weight for g in v.groups if g.group==group)>.6])
def paw_contacts():
    eo=body.evaluated_get(bpy.context.evaluated_depsgraph_get());me=eo.to_mesh();rows=[]
    for name,indices in zip(FOOT_BONES,PAW_VERTEX_IDS):
        pts=[eo.matrix_world@me.vertices[i].co for i in indices]
        assert pts;center=sum(pts,Vector())/len(pts)
        rows.append({'bone':name,'center':list(center),'floorOffsetWorldUnits':(min(p.z for p in pts)-lo.z)*UPM})
    eo.to_mesh_clear();return rows
PAW_REFERENCE=paw_contacts()
# The shorter rest legs need the source IK targets retargeted to their soles.
# Preserve each supplied foot's lift phase, correcting the contact geometry;
# this is a baked quadruped animation layer, not a body bob or runtime behavior.
IK_NAMES=['IKFrontRight','IKFrontLeft','IKBackLeft','IKBackRight']
walk=bpy.data.actions['Vesper_Walking'];arm.animation_data.action=walk
if walk.slots:arm.animation_data.action_slot=walk.slots[0]
target_heights={};source_positions={}
for frame in range(41):
    sc.frame_set(frame);bpy.context.view_layer.update();target_heights[frame]=[(arm.matrix_world@arm.pose.bones[name].head).z for name in IK_NAMES]
    source_positions[frame]=[arm.pose.bones[name].location.copy()for name in IK_NAMES]
# Unlink the old IK curves before the solver pass; otherwise dependency updates
# re-evaluate those curves and discard the corrected target positions.
for layer in walk.layers:
    for strip in layer.strips:
        for slot in walk.slots:
            bag=strip.channelbag(slot)
            if bag:
                for fc in list(bag.fcurves):
                    if any(fc.data_path==f'pose.bones["{name}"].location'for name in IK_NAMES)or any(fc.data_path.startswith(f'pose.bones["{name}"].rotation')for name in FOOT_BONES):bag.fcurves.remove(fc)
for name in FOOT_BONES:arm.pose.bones[name].rotation_mode='QUATERNION'
def orient_paws(frame):
    for name,rotation in zip(FOOT_BONES,source_foot_rotations[frame]):
        pb=arm.pose.bones[name];parent=pb.parent
        relative_rest=parent.bone.matrix_local.inverted()@pb.bone.matrix_local
        basis=relative_rest.to_3x3().inverted()@parent.matrix.to_3x3().inverted()@rotation.to_matrix()
        pb.rotation_quaternion=basis.to_quaternion()
    bpy.context.view_layer.update()
base_heights=[min(h[i]for h in target_heights.values())for i in range(4)];corrected=[];max_residual=0
for frame in range(41):
    sc.frame_set(frame)
    for name,position in zip(IK_NAMES,source_positions[frame]):arm.pose.bones[name].location=position*.68
    bpy.context.view_layer.update();goals=[lo.z+max(0,h-base)*.68 for h,base in zip(target_heights[frame],base_heights)]
    for repeat in range(120):
        orient_paws(frame)
        contacts=paw_contacts()
        if max(abs(lo.z+row['floorOffsetWorldUnits']/UPM-goal)*UPM for row,goal in zip(contacts,goals))<.08:break
        for name,row,goal in zip(IK_NAMES,contacts,goals):
            pb=arm.pose.bones[name];actual=lo.z+row['floorOffsetWorldUnits']/UPM
            matrix=arm.matrix_world.to_3x3()@pb.bone.matrix_local.to_3x3();pb.location+=matrix.inverted()@Vector((0,0,(goal-actual)*.35))
        bpy.context.view_layer.update()
    residual=max(abs(lo.z+row['floorOffsetWorldUnits']/UPM-goal)*UPM for row,goal in zip(paw_contacts(),goals));max_residual=max(max_residual,residual)
    if residual>.5:print('Paw target residual',frame,residual,[round(row['floorOffsetWorldUnits'],3)for row in paw_contacts()],[round((g-lo.z)*UPM,3)for g in goals],flush=True)
    corrected.append((frame,[arm.pose.bones[name].location.copy()for name in IK_NAMES],[arm.pose.bones[name].rotation_quaternion.copy()for name in FOOT_BONES]))
assert max_residual<.5,('retargeted paw residual',max_residual)
for layer in walk.layers:
    for strip in layer.strips:
        for slot in walk.slots:
            bag=strip.channelbag(slot)
            if not bag:continue
            for fc in list(bag.fcurves):
                if any(fc.data_path==f'pose.bones["{name}"].location'for name in IK_NAMES):bag.fcurves.remove(fc)
            for i,name in enumerate(IK_NAMES):
                for k in range(3):
                    fc=bag.fcurves.new(f'pose.bones["{name}"].location',index=k)
                    for frame,positions,rotations in corrected:point=fc.keyframe_points.insert(frame,positions[i][k]);point.interpolation='LINEAR'
            for i,name in enumerate(FOOT_BONES):
                for k in range(4):
                    fc=bag.fcurves.new(f'pose.bones["{name}"].rotation_quaternion',index=k)
                    for frame,positions,rotations in corrected:point=fc.keyframe_points.insert(frame,rotations[i][k]);point.interpolation='LINEAR'
arm.animation_data.action=act
if act.slots:arm.animation_data.action_slot=act.slots[0]
sc.frame_set(0);bpy.context.view_layer.update()
print('Retargeted walk paw residual:',max_residual,flush=True)
if args.skiff:
    hullmat=mat('skiff_fit_steel','#AFBBD1',.32,.35);hullmat.node_tree.nodes['Principled BSDF'].inputs['Metallic'].default_value=.24
    deckmat=mat('skiff_fit_deck','#535A75',.55,.15);rim=mat('skiff_fit_rim','#3F416A',.35,.3);padmat=mat('paw_pressure_pad','#4FBDD0',.3,.3)
    cx=(lo.x+hi.x)/2;floor=lo.z
    def ellipse_rings(name,rings,material,close_top=True):
        verts=[];faces=[];N=64
        for rx,ry,z in rings:
            for j in range(N):
                angle=j/N*math.tau;verts.append((cx+rx/UPM*math.cos(angle),ry/UPM*math.sin(angle),floor+z/UPM))
        for k in range(len(rings)-1):
            for j in range(N):faces.append((k*N+j,k*N+(j+1)%N,(k+1)*N+(j+1)%N,(k+1)*N+j))
        if close_top:faces.extend([tuple(range(N-1,-1,-1)),tuple((len(rings)-1)*N+j for j in range(N))])
        me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);me.materials.append(material)
        bm=bmesh.new();bm.from_mesh(me);bmesh.ops.recalc_face_normals(bm,faces=bm.faces[:]);bm.to_mesh(me);bm.free();me.shade_smooth();o=newobj(name,me)
        bevel=o.modifiers.new('soft_hull_edges','BEVEL');bevel.width=.5/UPM;bevel.segments=3
        return o
    ellipse_rings('skiff_fit_hull',[(42,18,-1),(42,18,-5),(32,12,-12)],hullmat)
    ellipse_rings('skiff_fit_open_deck',[(35,13,0),(35,13,-1)],deckmat)
    ellipse_rings('skiff_fit_low_rim',[(42,18,-.5),(35,13,.15)],rim,False)
    for i,row in enumerate(PAW_REFERENCE[:2]):
        c=Vector(row['center']);c.z=floor+.03/UPM
        pad=uv_sphere('front_paw_pressure_pad_'+str(i),c,(2.7/UPM,2.2/UPM,.16/UPM),padmat)
CELL=(112,96);PIVOT=(56,74);PX=3;theta=math.radians(args.view)
target=Vector(((lo.x+hi.x)/2,0,lo.z+(PIVOT[1]-CELL[1]/2)/UPM))
bpy.ops.object.camera_add(location=target+Vector((10*math.cos(theta),-10*math.sin(theta),2.13 if args.skiff else 0)));cam=bpy.context.object;sc.camera=cam;cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=CELL[0]/UPM
sc.render.resolution_x=CELL[0]*PX;sc.render.resolution_y=CELL[1]*PX
if args.face:
    target=Vector((0,0,(3.0-SHIFT)*.60));cam.location=(12,0,target.z);cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=1.8;sc.render.resolution_x=sc.render.resolution_y=512
report={'source':str(SOURCE),'sourceSHA256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'bodyJoints':len(arm.data.bones),'cell':CELL,'pivot':PIVOT,'px':PX,'referenceHeight':48,'skiffFitFixture':args.skiff,'skiffWorldDimensions':[84,36,12]if args.skiff else None,'referencePawContacts':PAW_REFERENCE,'walkRetargetMaxResidualWorldUnits':max_residual,'newFace':'carved source muzzle and eye sockets; fitted feline eye controls','renders':[]}
for spec in args.clips:
    bits=spec.split(':');name=bits[0];count=int(bits[1])if len(bits)>1 else 1;only=[int(x)for x in bits[2].split(',')]if len(bits)>2 else range(count)
    state=name if name in STATES else'Curious';action=bpy.data.actions['Vesper_Walking'if name=='Walk'else'Vesper_Idle'];arm.animation_data.action=action
    if action.slots:arm.animation_data.action_slot=action.slots[0]
    f0,f1=action.frame_range
    for i in only:
        fr=f0+(f1-f0)*i/count;sc.frame_set(int(fr),subframe=fr-int(fr));face(state);bpy.context.view_layer.update()
        p=OUT/f'{name}_{i:02}.png';sc.render.filepath=str(p);bpy.ops.render.render(write_still=True)
        with Image.open(p)as im:
            im.load();assert im.mode=='RGBA';bb=im.getchannel('A').getbbox();assert bb
            if not args.face:assert bb[0]>0 and bb[1]>0 and bb[2]<im.width and bb[3]<im.height,(p,bb)
            im.save(p)
        report['renders'].append({'file':p.name,'alphaBounds':bb,'pawContacts':paw_contacts()})
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'vesper-proof.blend'));(OUT/'proof.json').write_text(json.dumps(report,indent=2)+'\n')
print('Vesper first source proof:',OUT)
```


---

## `art/snake.py`

Gnash and the jade warden variant: angular faceted viper head with brow plates, hinged jaw and expressive eyes, 13 expressions in left/right facings. The body is drawn in code with the matching palette.

```python
# Serpent head sprites: an angular viper head (flat-topped wedge with crisp ridges, brow plates and a hinged jaw)
# with expressive eyes. Every expression is rendered in four facings so the key light always comes from the top-left.
# The body is drawn in the game as a tapered, lit ribbon that follows the head.
# Run: python3 art/snake.py <out_dir> [expr ...] [--palette original|jade] [--dirs r,l] [--samples N] [--px N] [--threads N]
import bpy, bmesh, sys, os, math, json, addon_utils
from mathutils import Vector, Matrix

addon_utils.enable("cycles", default_set=True)
args = sys.argv[1:]
OUT = os.path.abspath(args[0] if args else 'assets/snake')
opt = lambda k, d: args[args.index(k) + 1] if k in args else d
DIRS = opt('--dirs', 'r,l').split(',')
SAMPLES = int(opt('--samples', '64'))
PALETTE = opt('--palette', 'original')
if PALETTE not in ('original', 'jade'): raise ValueError('palette must be original or jade')
COLORS = {'body': '#7a3ccc', 'belly': '#f6b08a', 'crown': '#5a2aa6', 'outline': '#1e0a40',
          'brow': '#ff5fa2', 'brow_emit': '#ff3f8a', 'lid': '#6a32b4', 'mark': '#ff6fae', 'mark_emit': '#ff4f9a'}
if PALETTE == 'jade':
    COLORS.update(body='#168f83', belly='#c9e8d2', crown='#0b5d59', outline='#052d31',
                  brow='#ff8a9b', brow_emit='#e95f86', lid='#11726c', mark='#83e4c2', mark_emit='#5acfb0')
ONLY = [a for i, a in enumerate(args[1:], 1) if not a.startswith('--') and not args[i - 1].startswith('--')]
PX, BOX = int(opt('--px', '4')), 44          # px per game unit, square sprite size in game units
u = 0.1                  # one game unit in metres
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
srgb = lambda h: tuple(((int(h[i:i + 2], 16) / 255) ** 2.2) for i in (1, 3, 5))

def mat(name, color, rough=0.3, metal=0.0, coat=0.0, emit=None, es=0.6):
    m = bpy.data.materials.new(name); b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*color, 1); b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal; b.inputs['Coat Weight'].default_value = coat; b.inputs['Coat Roughness'].default_value = 0.1
    if emit: b.inputs['Emission Color'].default_value = (*emit, 1); b.inputs['Emission Strength'].default_value = es
    return m

def skin_mat():
    """Scales and belly split by object-space normal so the palette holds in every facing."""
    m = mat('skin', srgb(COLORS['body']), rough=0.3, coat=0.7); nt = m.node_tree; b = nt.nodes['Principled BSDF']
    tc = nt.nodes.new('ShaderNodeTexCoord'); sep = nt.nodes.new('ShaderNodeSeparateXYZ')
    nt.links.new(tc.outputs['Normal'], sep.inputs[0])
    ramp = nt.nodes.new('ShaderNodeValToRGB'); e = ramp.color_ramp.elements
    e[0].position, e[1].position = 0.30, 0.36
    e[0].color = (*srgb(COLORS['belly']), 1); e[1].color = (*srgb(COLORS['body']), 1)
    top = e.new(0.78); top.color = (*srgb(COLORS['crown']), 1)          # darker crown so the brows and eyes pop
    mp = nt.nodes.new('ShaderNodeMapRange'); mp.inputs['From Min'].default_value = -1; mp.inputs['From Max'].default_value = 1
    nt.links.new(sep.outputs['Z'], mp.inputs['Value']); nt.links.new(mp.outputs['Result'], ramp.inputs['Fac'])
    nt.links.new(ramp.outputs['Color'], b.inputs['Base Color'])
    vo = nt.nodes.new('ShaderNodeTexVoronoi'); vo.inputs['Scale'].default_value = 26; vo.feature = 'DISTANCE_TO_EDGE'
    nt.links.new(tc.outputs['Object'], vo.inputs['Vector'])
    bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = 0.12; bp.inputs['Distance'].default_value = 0.004
    nt.links.new(vo.outputs['Distance'], bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    return m

SKIN = skin_mat()
PLATE = mat('plate', srgb(COLORS['outline']), rough=0.2, coat=1.0)
BROW = mat('brow', srgb(COLORS['brow']), rough=0.22, coat=1.0, emit=srgb(COLORS['brow_emit']), es=0.15)
LIDSKIN = mat('lidskin', srgb(COLORS['lid']), rough=0.3, coat=0.7)
EDGE = mat('edge', srgb(COLORS['mark']), rough=0.2, coat=1.0, emit=srgb(COLORS['mark_emit']), es=0.25)
WHITE = mat('eyewhite', srgb('#fff6e8'), rough=0.08, coat=1.0)
IRIS = mat('iris', srgb('#b8f03a'), rough=0.08, coat=1.0, emit=srgb('#9be022'), es=0.5)
PUPIL = mat('pupil', (0.004, 0.002, 0.006), rough=0.05, coat=1.0)
SHINE = mat('shine', (1, 1, 1), rough=0.0, emit=(1, 1, 1), es=4.0)
LIDLINE = mat('lidline', srgb(COLORS['outline'] if PALETTE == 'jade' else '#1c0838'), rough=0.4)
MOUTH = mat('mouth', srgb('#5a0b26'), rough=0.6)
GUM = mat('gum', srgb('#c23a62'), rough=0.35, coat=0.5)
FANG = mat('fang', srgb('#fffaf0'), rough=0.12, coat=1.0)
TONGUE = mat('tongue', srgb('#ff2f6a'), rough=0.25, coat=0.6)
NOSTRIL = mat('nostril', srgb('#14051f'), rough=0.5)
STAR = mat('star', srgb('#ffe27a'), rough=0.2, emit=srgb('#ffd34a'), es=1.5)

ROOT = bpy.data.objects.new('root', None); sc.collection.objects.link(ROOT)   # facing (direction) rotation
HEAD = bpy.data.objects.new('head', None); sc.collection.objects.link(HEAD); HEAD.parent = ROOT  # yaw toward camera

def link(o, parent=HEAD):
    o.parent = parent; return o

def new_mesh(name, bm, m, smooth=True):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    if smooth:
        for p in me.polygons: p.use_smooth = True
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o)
    if m: o.data.materials.append(m)
    return o

def subsurf(o, lv=2):
    md = o.modifiers.new('ss', 'SUBSURF'); md.levels = md.render_levels = lv; return o

def box_cage(cuts, fn, crease=None):
    """Subdivided cube deformed by fn(x, y, z) with x, y, z in [-1, 1]; crease(v1, v2) picks hard ridge edges."""
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=2)
    bmesh.ops.subdivide_edges(bm, edges=bm.edges[:], cuts=cuts, use_grid_fill=True)
    orig = {v: tuple(v.co) for v in bm.verts}
    if crease:
        cl = bm.edges.layers.float.get('crease_edge') or bm.edges.layers.float.new('crease_edge')
        for e in bm.edges: e[cl] = crease(orig[e.verts[0]], orig[e.verts[1]])
    for v in bm.verts: v.co = Vector(fn(*orig[v]))
    return bm

def lerp_profile(pts, x):
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        if x <= x1:
            t = (x - x0) / (x1 - x0); t = t * t * (3 - 2 * t); return y0 + (y1 - y0) * t
    return pts[-1][1]

# head geometry, in game units: back of the skull at x = -9, snout tip at x = +15
HX0, HX1 = -8.0, 12.0
WIDTH = [(-1, 5.0), (-0.5, 8.0), (0.0, 7.4), (0.5, 5.2), (1, 3.0)]            # half width along the head
TOP = [(-1, 3.4), (-0.5, 5.0), (0.0, 5.4), (0.4, 4.0), (0.8, 2.8), (1, 2.0)] # crown, sloping down to the snout
BOT = [(-1, -2.0), (-0.5, -2.8), (0.3, -1.9), (1, -1.1)]                         # lip line, heavy at the cheeks
hx = lambda x: HX0 + (x + 1) / 2 * (HX1 - HX0)
nx = lambda gx: (gx - HX0) / (HX1 - HX0) * 2 - 1

def skull(x, y, z):
    w = lerp_profile(WIDTH, x); top = lerp_profile(TOP, x); bot = lerp_profile(BOT, x)
    zz = z * top if z > 0 else -z * bot
    yy = y * w * (1 - 0.3 * max(0, z) ** 1.5)          # trapezoid section: a narrower flat crown over broad cheeks
    return (hx(x) * u, yy * u, zz * u)

def jaw_shape(x, y, z):
    w = lerp_profile(WIDTH, x) * 0.9; bot = lerp_profile(BOT, x)
    zt, zb = bot + 0.3, bot - 1.8 * (1 - 0.45 * (x + 1) / 2)
    return (hx(x) * u * (0.96 if x > 0 else 1), y * w * u * (1 - 0.3 * max(0, -z)), (zb + (z + 1) / 2 * (zt - zb)) * u)

ridge = lambda a, b: 0.7 if (a[2] == 1 and b[2] == 1 and abs(a[1]) == 1 and abs(b[1]) == 1) else 0.0
lip = lambda a, b: 0.5 if (a[2] == -1 and b[2] == -1 and abs(a[1]) == 1 and abs(b[1]) == 1) else 0.0
head_obj = link(subsurf(new_mesh('skull', box_cage(4, skull, lambda a, b: max(ridge(a, b), lip(a, b))), SKIN)))
jaw = link(subsurf(new_mesh('jaw', box_cage(3, jaw_shape, lambda a, b: 0.5 if (a[2] == -1 and b[2] == -1 and abs(a[1]) == 1 and abs(b[1]) == 1) else 0), SKIN)))
jaw_pivot = bpy.data.objects.new('jaw_pivot', None); sc.collection.objects.link(jaw_pivot); link(jaw_pivot)
jaw_pivot.location = ((HX0 + 1.2) * u, 0, (BOT[0][1] + 0.2) * u)
jaw.parent = jaw_pivot; jaw.matrix_parent_inverse = Matrix.Translation(-jaw_pivot.location)
# the floor of the mouth rides on the jaw so the open jaw shows a pink mouth, not the jaw's crown

def ellipsoid(name, loc, scale, m, parent=HEAD, seg=24):
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=seg // 2, radius=1)
    o = new_mesh(name, bm, m); o.location = loc; o.scale = scale; o.parent = parent; return o

def tube(name, pts, radius, m, parent=HEAD):
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = radius; cu.bevel_resolution = 3
    cu.use_fill_caps = True
    sp = cu.splines.new('POLY'); sp.points.add(len(pts) - 1)
    for p, c in zip(sp.points, pts): p.co = (*c, 1)
    o = bpy.data.objects.new(name, cu); sc.collection.objects.link(o); o.parent = parent; o.data.materials.append(m); return o

# mouth lining, revealed as the jaw drops
mouth = ellipsoid('mouth', (1.5 * u, 0, -1.9 * u), (8.8 * u, 4.6 * u, 0.4 * u), MOUTH)
floor = ellipsoid('floor', (8.0 * u, 0, 0.05 * u), (7.6 * u, 4.0 * u, 0.3 * u), GUM, jaw_pivot)
gums = ellipsoid('gums', (2.5 * u, 0, -1.6 * u), (8.5 * u, 4.6 * u, 0.25 * u), GUM)
fangs = []
for s in (-1, 1):
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=12, radius1=0.8 * u, radius2=0.04 * u, depth=3.4 * u)
    bmesh.ops.translate(bm, verts=bm.verts, vec=(0, 0, 1.7 * u))   # root at the origin, so a longer fang grows out of the gum
    f = new_mesh('fang', bm, FANG); f.location = (8.07 * u, s * 3.2 * u, -0.87 * u); f.rotation_euler = (0, math.radians(196), 0); f.parent = HEAD; fangs.append(f)
# rows of small hooked teeth along both gums, bared only by the ferocious expressions ('teeth')
teeth = []
def tooth(loc, rot, size, parent):
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=8, radius1=0.42 * u * size, radius2=0.02 * u, depth=1.5 * u * size)
    bmesh.ops.translate(bm, verts=bm.verts, vec=(0, 0, 0.75 * u * size))
    t = new_mesh('tooth', bm, FANG); t.location = loc; t.rotation_euler = rot; t.parent = parent; teeth.append(t)
for s in (-1, 1):
    for a, sz in ((0.30, 0.8), (0.48, 0.95), (0.95, 1.0), (1.12, 0.9), (1.28, 0.8), (1.42, 0.7)):   # upper: skips the fang
        tooth(((2.5 + 8.1 * math.cos(a)) * u, s * 4.3 * math.sin(a) * u, -1.55 * u), (0, math.radians(188), 0), sz, HEAD)
    for a, sz in ((0.25, 0.75), (0.45, 0.9), (0.68, 1.0), (0.9, 0.95), (1.1, 0.85), (1.3, 0.7)):     # lower, on the jaw
        tooth(((8.0 + 7.2 * math.cos(a)) * u, s * 3.7 * math.sin(a) * u, 0.15 * u), (0, math.radians(-8), 0), sz, jaw_pivot)
# forked tongue: a stalk and two prongs, built along +x from its root and scaled out per expression
tongue = bpy.data.objects.new('tongue', None); sc.collection.objects.link(tongue); link(tongue)
tongue.location = (4.5 * u, 0, -1.7 * u)
ellipsoid('stalk', (5 * u, 0, 0), (5.2 * u, 0.6 * u, 0.35 * u), TONGUE, tongue)
for s in (-1, 1):
    pr = ellipsoid('prong', (11.4 * u, s * 0.75 * u, 0.3 * s * u), (2.0 * u, 0.34 * u, 0.28 * u), TONGUE, tongue); pr.rotation_euler.z = math.radians(24 * s)
for s in (-1, 1):
    n = ellipsoid('nostril', (10.6 * u, s * 1.7 * u, 2.1 * u), (0.8 * u, 0.42 * u, 0.32 * u), NOSTRIL); n.rotation_euler.z = math.radians(-25 * s)
# dorsal marking: glossy rose diamonds inlaid down the crown, matching the body pattern
for gx, sz in ((-3.2, 1.9), (-6.2, 1.4)):
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=4, radius1=sz * u, radius2=sz * 0.7 * u, depth=0.6 * u)
    d = new_mesh('mark', bm, EDGE, smooth=False); d.location = (gx * u, 0, (lerp_profile(TOP, nx(gx)) - 0.1) * u)
    d.scale = (1.6, 0.8, 1); d.parent = HEAD
    bv = d.modifiers.new('bv', 'BEVEL'); bv.width = 0.15 * u; bv.segments = 2

# mouth corners: a short crease at the back of the lip line that curls up (smug, grin) or down (hurt, scared)
corners = []
for s in (-1, 1):
    pts = []
    for i in range(9):
        t = i / 8; gx = 2.5 - 6.0 * t; xx = nx(gx)
        pts.append((gx * u, s * (lerp_profile(WIDTH, xx) * 0.9 + 0.05) * u, (lerp_profile(BOT, xx) + 0.55) * u))
    c = tube('corner', pts, 0.42 * u, LIDLINE); c['base'] = [tuple(p) for p in pts]; c['s'] = s; corners.append(c)

def set_corners(k, hide):
    for c in corners:
        sp = c.data.splines[0]
        for i, (p, b) in enumerate(zip(sp.points, c['base'])):
            t = i / 8; p.co = (b[0], b[1], b[2] + k * 2.6 * u * t ** 2, 1)
        c.hide_render = hide

# ---------- eyes: shader-painted iris and slit pupil, a catch light, two lids with a dark rim, and an arched brow ----------
def eye_material():
    m = mat('eyeball', srgb('#fff6e8'), rough=0.06, coat=1.0); nt = m.node_tree; b = nt.nodes['Principled BSDF']; N = nt.nodes; L = nt.links.new
    def M(op, a, bb=None, clamp=False):
        n = N.new('ShaderNodeMath'); n.operation = op; n.use_clamp = clamp
        for i, v in enumerate((a, bb)):
            if v is None: continue
            if isinstance(v, (int, float)): n.inputs[i].default_value = v
            else: L(v, n.inputs[i])
        return n.outputs[0]
    def V(name, v):
        n = N.new('ShaderNodeValue'); n.name = name; n.outputs[0].default_value = v; return n.outputs[0]
    tc = N.new('ShaderNodeTexCoord'); sep = N.new('ShaderNodeSeparateXYZ'); L(tc.outputs['Object'], sep.inputs[0])
    x, y, z = sep.outputs['X'], sep.outputs['Y'], sep.outputs['Z']
    r = M('SQRT', M('ADD', M('MULTIPLY', x, x), M('MULTIPLY', y, y)))
    front = M('GREATER_THAN', z, 0.0)
    pw, ph, spf = V('pw', 0.14), V('ph', 0.5), V('spiral', 0.0)
    iris = M('MULTIPLY', M('LESS_THAN', r, 0.66), front)
    pq = M('ADD', M('POWER', M('DIVIDE', x, pw), 2.0), M('POWER', M('DIVIDE', y, ph), 2.0))
    pupil = M('MULTIPLY', M('LESS_THAN', pq, 1.0), iris)
    # iris colour: bright lime centre to a deep green limbal ring
    ramp = N.new('ShaderNodeValToRGB'); e = ramp.color_ramp.elements
    e[0].position, e[0].color = 0.0, (*srgb('#e8ff7a'), 1); e[1].position, e[1].color = 0.62, (*srgb('#7fcf1a'), 1)
    ring = e.new(0.86); ring.color = (*srgb('#1f4a08'), 1)
    L(M('DIVIDE', r, 0.66), ramp.inputs['Fac'])
    # rage: the iris burns from lime to a molten amber with a blood-red ring, and glows hotter
    hot = N.new('ShaderNodeValToRGB'); e = hot.color_ramp.elements
    e[0].position, e[0].color = 0.0, (*srgb('#fff36a'), 1); e[1].position, e[1].color = 0.55, (*srgb('#ffa21a'), 1)
    e.new(0.86).color = (*srgb('#8a0a06'), 1)
    L(M('DIVIDE', r, 0.66), hot.inputs['Fac'])
    rage = V('rage', 0.0)
    # dizzy spiral: fract(angle / tau + r * 2.6)
    ang = M('DIVIDE', M('ARCTAN2', y, x), 6.2832)
    spiral = M('MULTIPLY', M('LESS_THAN', M('FRACT', M('ADD', ang, M('MULTIPLY', r, 2.6))), 0.42), M('MULTIPLY', front, M('LESS_THAN', r, 0.85)))
    def mix(fac, a, bb):
        n = N.new('ShaderNodeMix'); n.data_type = 'RGBA'; L(fac, n.inputs[0])
        for sock, v in ((n.inputs[6], a), (n.inputs[7], bb)):
            if isinstance(v, tuple): sock.default_value = v
            else: L(v, sock)
        return n.outputs[2]
    no_sp = M('SUBTRACT', 1.0, spf)
    icol = mix(rage, ramp.outputs['Color'], hot.outputs['Color'])
    rim = M('MULTIPLY', rage, M('POWER', M('MINIMUM', r, 1.0), 3.0))          # bloodshot toward the edge of the eyeball
    white = mix(M('MULTIPLY', rim, 0.55), (*srgb('#fff6e8'), 1), (*srgb('#ff6a5a'), 1))
    c1 = mix(M('MULTIPLY', iris, no_sp), white, icol)
    c2 = mix(M('MULTIPLY', pupil, no_sp), c1, (0.004, 0.002, 0.006, 1))
    c3 = mix(M('MULTIPLY', spiral, spf), c2, (*srgb('#2a0f55'), 1))
    L(c3, b.inputs['Base Color'])
    em = mix(M('MULTIPLY', M('SUBTRACT', iris, pupil), no_sp), (0, 0, 0, 1), icol)
    L(em, b.inputs['Emission Color']); L(M('ADD', 0.35, M('MULTIPLY', rage, 1.1)), b.inputs['Emission Strength'])
    return m
EYE = eye_material()

class Eye:
    R = 3.6
    def __init__(self, side):
        self.side = side; R = self.R
        ex = 1.0; xx = nx(ex)
        piv = bpy.data.objects.new('eye', None); sc.collection.objects.link(piv); link(piv)
        piv.location = (ex * u, side * lerp_profile(WIDTH, xx) * 0.5 * u, 3.9 * u)
        # local +Z looks out of the eye: sideways, a little forward and up; local +Y is the eye's "up"
        out = Vector((0.35, side * 1.0, 0.75)).normalized(); up = Vector((0, 0, 1)); up = (up - out * up.dot(out)).normalized()
        xa = up.cross(out); piv.rotation_euler = Matrix((xa, up, out)).transposed().to_euler()
        self.piv = piv
        self.ball = ellipsoid('ball', (0, 0, 0), (R * u,) * 3, EYE, piv, seg=48)
        self.shine = ellipsoid('shine', (-R * 0.32 * u, R * 0.38 * u, R * 0.97 * u), (R * 0.17 * u, R * 0.17 * u, R * 0.06 * u), SHINE, piv, seg=12)
        self.shine2 = ellipsoid('shine', (R * 0.3 * u, -R * 0.3 * u, R * 0.98 * u), (R * 0.07 * u, R * 0.07 * u, R * 0.03 * u), SHINE, piv, seg=8)
        self.lids = [self.make_lid(piv, R, +1), self.make_lid(piv, R, -1)]
        # brow: an arched, tapering plate sitting on the crown edge above the eye
        def arch(x, y, z):
            t = (x + 1) / 2
            return (x * 3.9, y * (1.5 - 0.6 * t), z * (0.75 - 0.3 * t) - 0.8 * x * x + 0.3)
        brow = new_mesh('brow', box_cage(3, arch, lambda a, b: 0.6 if (abs(a[1]) == 1 and abs(b[1]) == 1) else 0), BROW)
        subsurf(brow, 2); brow.parent = HEAD; brow.scale = (u, u, u)
        self.brow = brow; self.brow_base = Vector(((ex + 0.3) * u, side * lerp_profile(WIDTH, xx) * 0.46 * u, (3.9 + R * 0.92) * u))

    def make_lid(self, piv, R, s):
        bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=48, v_segments=24, radius=R * 1.1 * u)
        bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.y * s < -1e-5], context='VERTS')   # keep the half on the lid's side
        lid = new_mesh('lid', bm, LIDSKIN); lid.parent = piv; lid.data.materials.append(LIDLINE)
        so = lid.modifiers.new('so', 'SOLIDIFY'); so.thickness = 0.12 * R * u; so.material_offset_rim = 1; so.use_rim = True
        lid['s'] = s; return lid

    def set(self, top=0.0, bot=0.0, look=(0, 0), pupil=1.0, slit=1.0, brow=0.0, raise_=0.0, spiral=False, slant=0.0, rage=0.0, hood=0.0):
        # slant > 0 tips the upper lid down toward the snout (a glare), the lower lid half as much the other way;
        # hood > 0 pulls the brow plate out and down over the eyeball, rolled outward, so it overhangs the eye
        # lids rotate about the eye's local X: 0 = folded back (open), 1 = meeting across the middle
        for lid in self.lids:
            s = lid['s']; amt = top if s > 0 else bot
            h = max(-1.0, min(1.0, 1 - amt))   # where the lid edge crosses the front of the eye, in eye radii
            sl = math.radians(slant) * self.side * (1.0 if s > 0 else 0.5)
            lid.rotation_euler = (-s * (math.asin(h) + math.radians(18) * h), 0, sl)
        lx, ly = look   # look by turning the eyeball; the catch lights stay put
        self.ball.rotation_euler = (math.radians(-ly * 30), math.radians(lx * 30), 0)
        nt = EYE.node_tree.nodes
        nt['pw'].outputs[0].default_value = 0.14 * pupil * slit; nt['ph'].outputs[0].default_value = 0.52 * pupil
        nt['spiral'].outputs[0].default_value = 1.0 if spiral else 0.0
        nt['rage'].outputs[0].default_value = rage
        for o in (self.shine, self.shine2): o.hide_render = top + bot > 1.4
        # brow: positive tilts the snout end down (anger), negative lifts it (worry, fear)
        self.brow.location = self.brow_base + Vector((0.5 * hood, self.side * 1.9 * hood, raise_ * 1.3 - 0.9 * hood)) * u
        self.brow.rotation_euler = (math.radians(self.side * -(14 + 24 * hood)), math.radians(brow), math.radians(self.side * 6))

eyes = [Eye(-1), Eye(1)]

# dizzy stars orbit the head when stunned
stars = []
for i in range(3):
    bm = bmesh.new(); pts = []
    for k in range(10):
        r = (1.0 if k % 2 == 0 else 0.45) * 1.5 * u; a = k / 10 * math.tau
        pts.append(bm.verts.new((math.cos(a) * r, 0, math.sin(a) * r)))
    bm.faces.new(pts); bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=0.5 * u)
    s = new_mesh('star', bm, STAR, smooth=False); stars.append(s)

# ---------- expressions ----------
EXPR = {
    'idle':   dict(jaw=0.0, corner=0.6, eye=dict(top=0.6, bot=0.1, brow=-4, raise_=0.3, look=(0.3, 0))),             # smug, half-lidded
    'blink':  dict(jaw=0.0, corner=0.7, eye=dict(top=1.05, bot=1.0, brow=10)),
    'taste':  dict(jaw=0.06, corner=0.5, tongue=1.0, eye=dict(top=0.32, bot=0.15, brow=14, look=(0.5, 0.1))),  # tongue flick
    'hunt':   dict(jaw=0.0, corner=-0.1, eye=dict(top=0.56, bot=0.42, slant=24, brow=26, raise_=-0.35, hood=0.35, slit=0.32, rage=0.45, look=(0.7, -0.3))),  # glaring at its prey
    'chew0':  dict(jaw=0.35, eye=dict(top=0.36, bot=0.35, brow=36, raise_=-0.2, slit=0.6, look=(0.5, -0.2))),
    'chew1':  dict(jaw=0.8, eye=dict(top=0.3, bot=0.42, brow=40, raise_=-0.2, slit=0.55, look=(0.5, -0.2))),
    'hiss':   dict(jaw=1.0, tongue=1.0, fangs=True, eye=dict(top=0.0, bot=0.1, brow=44, slit=0.4, raise_=0.1, look=(0.4, 0))),
    'ouch':   dict(jaw=0.22, corner=-1.0, eye=dict(top=1.08, bot=1.0, brow=-34, raise_=0.6)),               # squeezed shut
    'dizzy':  dict(jaw=0.4, tongue=0.8, droop=48, eye=dict(top=0.12, bot=0.05, brow=-14, raise_=0.3, spiral=True), stars=True),
    'shock':  dict(jaw=0.5, eye=dict(top=0.0, bot=0.0, brow=-36, raise_=1.4, pupil=0.6, slit=2.6)),        # bricks coming down on it
    # biting through bricks, closing on her: lips drawn back off every tooth, a low glare with burning eyes
    'snarl':  dict(jaw=0.5, fang=1.45, teeth=True, eye=dict(top=0.56, bot=0.5, slant=28, brow=26, raise_=-0.35, hood=0.35, slit=0.3, rage=0.8, look=(0.7, -0.2))),
    # the strike: jaws wide, fangs out, eyes blown wide and blazing under furious brows
    'strike': dict(jaw=1.25, fang=1.7, teeth=True, eye=dict(top=0.14, bot=0.04, slant=18, brow=34, raise_=-0.1, hood=0.3, pupil=0.62, slit=0.45, rage=1.0, look=(0.8, 0))),
    'grin':   dict(jaw=0.0, corner=1.4, tongue=0.0, eye=dict(top=0.35, bot=0.62, brow=30, slit=0.45, look=(0.5, -0.2))),  # it reached her
}

def pose(name, t=0.0):
    e = EXPR[name]; jw = e.get('jaw', 0)
    jaw_pivot.rotation_euler = (0, math.radians(30 * jw), 0)
    mouth.scale = (8.8 * u, 4.6 * u, (0.35 + 2.6 * jw) * u); mouth.location = (1.5 * u, 0, (-1.9 - 1.3 * jw) * u)
    fl = e.get('fang', 1.0)
    for f in fangs: f.hide_render = jw < 0.3; f.scale = (fl ** 0.5, fl ** 0.5, fl)
    for t in teeth: t.hide_render = jw < 0.3 or not e.get('teeth')
    tg = e.get('tongue', 0.0)
    for o in tongue.children: o.hide_render = tg <= 0
    tongue.scale = (max(0.01, tg), 1, 1); tongue.rotation_euler = (0, math.radians(e.get('droop', 6 + 22 * jw)), 0)
    set_corners(e.get('corner', 0.0), jw > 0.3)
    for ey in eyes: ey.set(**e['eye'])
    for i, s in enumerate(stars):
        s.hide_render = not e.get('stars')
        a = i / 3 * math.tau + 0.4
        s.location = (math.cos(a) * 9 * u, math.sin(a) * 9 * u, 8 * u); s.rotation_euler = (0, 0, a)

# ---------- lights and camera: the same rig as the tower ----------
def area(loc, rot, energy, size, color):
    bpy.ops.object.light_add(type='AREA', location=loc, rotation=rot)
    l = bpy.context.object.data; l.energy = energy; l.size = size; l.color = color
area((-20, -9, 34), (math.radians(20), math.radians(-30), 0), 40000, 10, (1.0, 0.9, 0.8))
area((0, -30, 3), (math.radians(90), 0, 0), 1700, 16, (1.0, 0.95, 0.95))
area((30, -25, -5), (math.radians(85), math.radians(50), 0), 4000, 14, (0.55, 0.65, 1.0))
area((8, 20, 8), (math.radians(-70), 0, 0), 6000, 10, (0.8, 0.85, 1.0))
w = bpy.data.worlds.new('w'); sc.world = w; w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.05, 0.04, 0.09, 1)
TILT = 0.35
bpy.ops.object.camera_add(location=(0, -40 * math.cos(TILT), 40 * math.sin(TILT)), rotation=(math.radians(90) - TILT, 0, 0))
cam = bpy.context.object; sc.camera = cam; cam.data.type = 'ORTHO'; cam.data.ortho_scale = BOX * u
sc.render.engine = 'CYCLES'; sc.cycles.samples = SAMPLES; sc.cycles.use_denoising = True
if '--threads' in args: sc.render.threads_mode = 'FIXED'; sc.render.threads = int(opt('--threads', '0'))
sc.render.resolution_x = sc.render.resolution_y = BOX * PX; sc.render.film_transparent = True
sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast'

# facings: r / l = snout to screen right / left; rd, ld = nosing down 60 degrees; ru, lu = nosing up 45 degrees.
# The head always turns a little toward the camera so both eyes read; the game rotates the nearest one the last few degrees.
P = math.pi
FACING = {'r': ((0, 0, 0), -36), 'l': ((0, 0, P), 36), 'rd': ((0, P / 3, 0), -36), 'ld': ((0, P / 3, P), 36),
          'ru': ((0, -P / 4, 0), -36), 'lu': ((0, -P / 4, P), 36)}
os.makedirs(OUT, exist_ok=True)
names = ONLY or list(EXPR)
for d in DIRS:
    rot, yaw = FACING[d]
    ROOT.rotation_euler = rot; HEAD.rotation_euler = (0, 0, math.radians(yaw))
    for n in names:
        pose(n); sc.render.filepath = os.path.join(OUT, f'head_{n}_{d}.png'); bpy.ops.render.render(write_still=True)
meta = {'px': PX, 'box': BOX, 'expressions': list(EXPR), 'dirs': DIRS}
if PALETTE == 'jade': meta.update(palette=PALETTE, colors=COLORS)
json.dump(meta, open(os.path.join(OUT, 'meta.json'), 'w'))
print('done')
```


---

## `art/char_preview.py`

Quick lit preview of any rigged GLB at one frame of one animation; useful for checking KayKit parts and poses.

```python
# Render a quick lit preview of a rigged GLB character at one frame of one animation.
# Run: python3 art/char_preview.py model.glb out.png [action] [frame]
import bpy, sys, math, addon_utils, mathutils
addon_utils.enable("cycles", default_set=True)
src, out = sys.argv[1], sys.argv[2]
act = sys.argv[3] if len(sys.argv) > 3 else 'Idle'
frame = int(sys.argv[4]) if len(sys.argv) > 4 else 10
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
bpy.ops.import_scene.gltf(filepath=src)
arm = next((o for o in sc.objects if o.type == 'ARMATURE'), None)
if arm and act in bpy.data.actions:
    arm.animation_data_create(); arm.animation_data.action = bpy.data.actions[act]
    # Blender 4.4+ slotted actions: bind the first slot
    if hasattr(arm.animation_data, 'action_slot') and bpy.data.actions[act].slots:
        arm.animation_data.action_slot = bpy.data.actions[act].slots[0]
sc.frame_set(frame)
meshes = [o for o in sc.objects if o.type == 'MESH']
print('meshes:', [(o.name, o.parent_bone if o.parent_type == 'BONE' else '', o.visible_get()) for o in meshes])
pts = [o.matrix_world @ mathutils.Vector(c) for o in meshes if o.visible_get() for c in o.bound_box]
mn = mathutils.Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
mx = mathutils.Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
ctr = (mn + mx) / 2; h = mx.z - mn.z
bpy.ops.object.camera_add(location=(ctr.x + h * 0.6, ctr.y - h * 2.2, ctr.z + h * 0.35))
cam = bpy.context.object; sc.camera = cam
d = ctr - cam.location; cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
cam.data.lens = 60
bpy.ops.object.light_add(type='AREA', location=(ctr.x - h, ctr.y - h * 1.5, ctr.z + h * 1.5)); L = bpy.context.object; L.data.energy = 300 * h * h; L.data.size = h
L.rotation_euler = (ctr - L.location).to_track_quat('-Z', 'Y').to_euler()
bpy.ops.object.light_add(type='AREA', location=(ctr.x + h * 1.2, ctr.y + h, ctr.z + h)); L = bpy.context.object; L.data.energy = 200 * h * h; L.data.size = h; L.data.color = (0.6, 0.7, 1)
L.rotation_euler = (ctr - L.location).to_track_quat('-Z', 'Y').to_euler()
w = bpy.data.worlds.new('w'); sc.world = w; w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.08, 0.07, 0.12, 1)
sc.render.engine = 'CYCLES'; sc.cycles.samples = 48; sc.cycles.use_denoising = True
sc.render.resolution_x = 360; sc.render.resolution_y = 480; sc.render.film_transparent = False
sc.view_settings.view_transform = 'AgX'
sc.render.filepath = out; bpy.ops.render.render(write_still=True)
```


---

## `art/vault_tower.py`

The approved v3 look test: the Vault as a cutaway tower wall with big glazed bricks. The "shiny" target the production renders copy. (Its comments still mention an early fox character, later replaced by the princess.)

```python
# Blender look test v3, side view: the Vault as a cutaway tower wall with big glazed bricks. Bricks are laid in running bond,
# holes reveal the dark interior, the fox's chamber is lit by a lantern.
# Run: python3 art/vault_side.py [out.png] [scale] [fox.glb]
import bpy, json, math, random, sys, os, addon_utils

addon_utils.enable("cycles", default_set=True)
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'out', 'vault_side.png')
SCALE = float(sys.argv[2]) if len(sys.argv) > 2 else 0.5
FOX = sys.argv[3] if len(sys.argv) > 3 else None
G = json.load(open(os.path.join(HERE, 'vault-grid.json')))
COLS, ROWS = G['cols'], G['rows']
U = 0.1                                  # metres per game unit
CW, CH = G['cw'] * U, G['ch'] * U        # 1.6 x 1.2
MORTAR = 0.07
OX, OY = 20 * U, 84 * U                  # board origin on the 360 x 700 screen
PW, PH = 360, 700
random.seed(7)
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene

def S(x, y):  # screen units (y down) -> Blender XZ (z up); wall face at y=0, camera at -y
    return (x * U, -y * U)

def mat(name, color, rough=0.4, metal=0.0, coat=0.0, coat_rough=0.05, sss=0.0, emit=None, emit_str=0.0):
    m = bpy.data.materials.new(name); b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*color, 1); b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal; b.inputs['Coat Weight'].default_value = coat
    b.inputs['Coat Roughness'].default_value = coat_rough
    if sss: b.inputs['Subsurface Weight'].default_value = sss
    if emit: b.inputs['Emission Color'].default_value = (*emit, 1); b.inputs['Emission Strength'].default_value = emit_str
    return m

def noisy(m, scale=6.0, amount=0.25, bump=0.15, detail=6.0, color2=None, vor=False):
    nt = m.node_tree; b = nt.nodes['Principled BSDF']
    tc = nt.nodes.new('ShaderNodeTexCoord')
    n = nt.nodes.new('ShaderNodeTexVoronoi' if vor else 'ShaderNodeTexNoise'); n.inputs['Scale'].default_value = scale
    if not vor: n.inputs['Detail'].default_value = detail
    nt.links.new(tc.outputs['Object'], n.inputs['Vector'])
    out = n.outputs['Distance'] if vor else n.outputs['Fac']
    base = b.inputs['Base Color'].default_value[:]
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].color = (*(color2 or tuple(c * (1 - amount) for c in base[:3])), 1); ramp.color_ramp.elements[1].color = base
    nt.links.new(out, ramp.inputs['Fac']); nt.links.new(ramp.outputs['Color'], b.inputs['Base Color'])
    bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = bump; bp.inputs['Distance'].default_value = 0.04
    nt.links.new(out, bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    return m

srgb = lambda h: tuple(((int(h[i:i + 2], 16) / 255) ** 2.2) for i in (1, 3, 5))
SAND = noisy(mat('sand', srgb('#f0b46e'), rough=0.38, coat=0.5, coat_rough=0.18), scale=7, amount=0.2, bump=0.3)
JADE = noisy(mat('jade', srgb('#19b3a0'), rough=0.12, coat=1.0, coat_rough=0.02, sss=0.2), scale=2.5, amount=0.35, bump=0.02, color2=srgb('#0b6d68'))
GOLD = mat('gold', srgb('#ffc94a'), rough=0.14, metal=1.0)
RUBY = mat('ruby', srgb('#ff2f5e'), rough=0.04, coat=1.0, sss=0.3)
GRANITE = noisy(mat('granite', srgb('#4a4f6e'), rough=0.45, coat=0.3), scale=18, amount=0.35, bump=0.25)
IRON = mat('iron', srgb('#2a2e3e'), rough=0.3, metal=0.9)
RIVET = mat('rivet', srgb('#b8c0d6'), rough=0.2, metal=1.0)
INTERIOR = noisy(mat('interior', srgb('#2a1f2e'), rough=0.9), scale=3, amount=0.6, bump=0.6, vor=True)
MORT = noisy(mat('mortar', srgb('#3a3046'), rough=0.95), scale=40, amount=0.4, bump=0.3)
WOOD = noisy(mat('wood', srgb('#8a5a35'), rough=0.6), scale=1.5, amount=0.45, bump=0.2)
BARS = mat('bars', srgb('#ffd27a'), rough=0.1, metal=1.0)

def box(name, w, h, d, bevel, m, loc, segs=4):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.object; o.name = name; o.scale = (w, d, h); bpy.ops.object.transform_apply(scale=True)
    if bevel:
        md = o.modifiers.new('b', 'BEVEL'); md.width = bevel; md.segments = segs; md.limit_method = 'NONE'
        bpy.ops.object.modifier_apply(modifier='b')
    bpy.ops.object.shade_smooth(); o.data.materials.append(m)
    return o

LAYOUT = [  # 20 x 20 cells of 16 x 16 units; bricks are laid two cells wide in running bond
    "tttttttttttttttt....",
    "tttttttttttttttt....",
    "tttttt########tttttt",
    "tttttt#......#tttttt",
    "ttgttt#......#tttgtt",
    "tttttt#......#tttttt",
    "vvvvvvvvvvvvvvvvvvvv",
    "vvvvvvvvvvvvvvvvvvvv",
    "vvv##vvvvgvvvvvv##vv",
    "vvvvvvvvvvvvvvvvvvvv",
    "cccccccccccccccccccc",
    "ccccccccc..ccccccccc",
    "ccgcccccc..cccccgccc",
    "cccc###cc..cc###cccc",
    "yyyyyyyyy..yyyyyyyyy",
    "yyyyy......yyyyyyyyy",
    "yyyyy..yyyyyyyyyyyyy",
    "yyyyy..yyygyyyyyy..y",
    "yyyyy..yyyyyyyyyy..y",
    "yyyyy..yyyyyyyyyy..y",
]
COLS, ROWS = 20, 20
CELL = 16
OX, OY = 20 * U, 96 * U
CW = CH = CELL * U
cells = [list(row) for row in LAYOUT]
DEPTH = 1.2
GLAZE = {k: mat('glaze_' + k, srgb(h), rough=0.28, coat=1.0, coat_rough=0.02, sss=0.12)
         for k, h in {'t': '#22c4b0', 'v': '#8f5cf0', 'c': '#ff6f61', 'y': '#ffc73d'}.items()}
done = set()
for r in range(ROWS):
    for c in range(COLS):
        v = cells[r][c]
        if v in '.' or (c, r) in done: continue
        x0, y0 = OX / U + c * CELL, OY / U + r * CELL
        if v in GLAZE:
            w = CELL
            if (c + r) % 2 == 0 and c + 1 < COLS and cells[r][c + 1] == v: done.add((c + 1, r)); w = 2 * CELL
            done.add((c, r))
            cx, cz = S(x0 + w / 2, y0 + CELL / 2)
            o = box(f'b{c}_{r}', w * U - MORTAR, CH - MORTAR, DEPTH, 0.3, GLAZE[v], (cx, -DEPTH / 2 - random.uniform(0, 0.03), cz), segs=8)
        elif v == 'g':
            done.add((c, r)); cx, cz = S(x0 + CELL / 2, y0 + CELL / 2)
            box(f'g{c}_{r}', CW - MORTAR, CH - MORTAR, DEPTH, 0.12, GOLD, (cx, -DEPTH / 2 - 0.05, cz), segs=6)
            bpy.ops.mesh.primitive_ico_sphere_add(radius=0.42, subdivisions=1, location=(cx, -DEPTH - 0.14, cz))
            g = bpy.context.object; g.scale = (1, 0.5, 1); g.data.materials.append(RUBY)
        elif v == '#':
            done.add((c, r)); cx, cz = S(x0 + CELL / 2, y0 + CELL / 2)
            box(f'r{c}_{r}', CW - MORTAR * 0.5, CH - MORTAR * 0.5, DEPTH + 0.2, 0.08, GRANITE, (cx, -(DEPTH + 0.2) / 2, cz))
            for dx in (-0.48, 0.48):
                for dz in (-0.48, 0.48):
                    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.11, segments=10, ring_count=6, location=(cx + dx, -DEPTH - 0.24, cz + dz))
                    bpy.context.object.data.materials.append(RIVET)

# --- back wall (seen through holes) and mortar bed ---
bw, bh = COLS * CELL, ROWS * CELL
cx, cz = S(OX / U + bw / 2, OY / U + bh / 2)
box('interior', bw * U, bh * U, 0.4, 0, INTERIOR, (cx, 0.9, cz))
box('mortarbed', bw * U, bh * U, 0.2, 0, MORT, (cx, 0.05, cz))
# fox chamber: wooden planks on the back wall, a lantern and gold bars
pc, pr = 7, 3
px0, py0 = OX / U + pc * 16, OY / U + pr * 12
ccx, ccz = S(px0 + 48, py0 + 24)
box('chamber', 96 * U, 48 * U, 0.1, 0, WOOD, (ccx, 0.6, ccz))
for i in range(1, 6):
    bx, _ = S(px0 + 96 * i / 6, 0)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.07, depth=48 * U, location=(bx, -DEPTH - 0.1, ccz)); bpy.context.object.data.materials.append(BARS)
bpy.ops.object.light_add(type='POINT', location=(ccx + 1.6, -0.2, ccz + 1.0)); L = bpy.context.object.data; L.energy = 60; L.color = (1, 0.6, 0.28); L.shadow_soft_size = 0.3
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.18, location=(ccx + 1.6, -0.1, ccz + 1.0)); bpy.context.object.data.materials.append(mat('flame', (1, 0.6, 0.2), emit=(1, 0.55, 0.2), emit_str=30))
if FOX and os.path.exists(FOX):
    bpy.ops.import_scene.gltf(filepath=FOX)
    root = [o for o in bpy.context.selected_objects if o.parent is None][0]
    # scale to roughly two cells tall, sit on the chamber floor facing the camera
    import mathutils
    pts = [o.matrix_world @ mathutils.Vector(v) for o in bpy.context.selected_objects if o.type == 'MESH' for v in o.bound_box]
    hgt = max(p.z for p in pts) - min(p.z for p in pts)
    k = 2.6 / hgt; root.scale = [s * k for s in root.scale]
    root.rotation_euler = (0, 0, math.radians(-20))
    bpy.context.view_layer.update()
    pts = [o.matrix_world @ mathutils.Vector(v) for o in bpy.context.selected_objects if o.type == 'MESH' for v in o.bound_box]
    root.location.x += ccx - (max(p.x for p in pts) + min(p.x for p in pts)) / 2
    root.location.y += -0.2 - (max(p.y for p in pts) + min(p.y for p in pts)) / 2
    root.location.z += (ccz - 48 * U / 2) - min(p.z for p in pts)

# --- tower shell: big stone pillars left/right, battlements on top, ground at the bottom ---
for side in (-1, 1):
    x = cx + side * (bw * U / 2 + 0.9)
    box(f'pillar{side}', 1.8, bh * U + 4, 1.8, 0.2, GRANITE, (x, -0.5, cz + 1))
for i in range(11):
    x = cx - bw * U / 2 - 0.8 + i * (bw * U + 1.6) / 10
    box(f'merlon{i}', 1.6, 1.4, 1.6, 0.15, GRANITE, (x, -0.5, cz + bh * U / 2 + 1.3))
box('cornice', bw * U + 4, 0.6, 2.0, 0.15, GRANITE, (cx, -0.5, cz + bh * U / 2 + 0.4))
# courtyard wall behind the paddle: big dark blocks set back from the play plane, two torches
base = OY / U + bh
for row in range(9):
    off = 40 if row % 2 else 0
    for i in range(-1, 6):
        x0 = i * 80 + off; y0 = base + 8 + row * 40
        bx, bz = S(x0 + 40, y0 + 20)
        box(f'cw{row}_{i}', 80 * U - 0.15, 40 * U - 0.15, 1.0, 0.18, GRANITE, (bx, 2.5 + random.uniform(0, 0.15), bz))
box('plinth', bw * U + 4, 0.9, 2.2, 0.15, GRANITE, (cx, -0.5, -(base + 4) * U))
for side in (-1, 1):
    tx, tz = S(180 + side * 140, base + 120)
    box(f'sconce{side}', 0.5, 1.2, 0.6, 0.1, IRON, (tx, 1.6, tz))
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.35, location=(tx, 1.3, tz + 0.9)); f = bpy.context.object; f.scale = (0.8, 0.8, 1.4)
    f.data.materials.append(mat('torch', (1, 0.5, 0.15), emit=(1, 0.45, 0.12), emit_str=40))
    bpy.ops.object.light_add(type='POINT', location=(tx, 0.6, tz + 1.2)); L = bpy.context.object.data; L.energy = 900; L.color = (1, 0.55, 0.25); L.shadow_soft_size = 0.4

# --- sky: dusk gradient world, a big warm moon light from the top-left ---
w = bpy.data.worlds.new('w'); sc.world = w
nt = w.node_tree; bg = nt.nodes['Background']
tc = nt.nodes.new('ShaderNodeTexCoord'); sep = nt.nodes.new('ShaderNodeSeparateXYZ'); ramp = nt.nodes.new('ShaderNodeValToRGB')
nt.links.new(tc.outputs['Generated'], sep.inputs['Vector']); nt.links.new(sep.outputs['Z'], ramp.inputs['Fac'])
ramp.color_ramp.elements[0].position = 0.45; ramp.color_ramp.elements[0].color = (0.02, 0.015, 0.05, 1)
ramp.color_ramp.elements[1].color = (0.25, 0.12, 0.3, 1)
nt.links.new(ramp.outputs['Color'], bg.inputs['Color']); bg.inputs['Strength'].default_value = 0.8

def area(loc, rot, energy, size, color):
    bpy.ops.object.light_add(type='AREA', location=loc, rotation=rot)
    l = bpy.context.object.data; l.energy = energy; l.size = size; l.color = color
area((cx - 20, -9, cz + 34), (math.radians(20), math.radians(-30), 0), 22000, 10, (1.0, 0.86, 0.72))   # key
area((cx + 30, -25, cz - 5), (math.radians(85), math.radians(50), 0), 2500, 14, (0.55, 0.65, 1.0))     # cool fill
area((cx, -10, cz - 45), (math.radians(140), 0, 0), 2500, 30, (1.0, 0.5, 0.65))                         # warm bounce from below

bpy.ops.mesh.primitive_plane_add(size=1, location=(PW / 2 * U, -40, -PH / 2 * U + 20), rotation=(math.radians(90), 0, 0))
sb = bpy.context.object; sb.scale = (60, 50, 1); sb.visible_camera = False; sb.visible_shadow = False
sm = bpy.data.materials.new('softbox'); nt = sm.node_tree; nt.nodes.remove(nt.nodes['Principled BSDF'])
em = nt.nodes.new('ShaderNodeEmission'); tc = nt.nodes.new('ShaderNodeTexCoord'); sp = nt.nodes.new('ShaderNodeSeparateXYZ'); rp = nt.nodes.new('ShaderNodeValToRGB')
nt.links.new(tc.outputs['Generated'], sp.inputs['Vector']); nt.links.new(sp.outputs['Y'], rp.inputs['Fac'])
rp.color_ramp.elements[0].position = 0.55; rp.color_ramp.elements[0].color = (0, 0, 0, 1); rp.color_ramp.elements[1].color = (1, 0.95, 0.9, 1)
nt.links.new(rp.outputs['Color'], em.inputs['Color']); em.inputs['Strength'].default_value = 1.6
nt.links.new(em.outputs['Emission'], nt.nodes['Material Output'].inputs['Surface']); sb.data.materials.append(sm)
bpy.ops.object.camera_add(); cam = bpy.context.object; sc.camera = cam
cam.data.type = 'ORTHO'; cam.data.ortho_scale = PH * U
cam.rotation_euler = (math.radians(90), 0, 0)
cam.location = (PW / 2 * U, -60, -PH / 2 * U)
sc.render.resolution_x = int(PW * 3 * SCALE); sc.render.resolution_y = int(PH * 3 * SCALE)
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = 96; sc.cycles.use_denoising = True
sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast'
sc.render.filepath = OUT; os.makedirs(os.path.dirname(OUT), exist_ok=True)
bpy.ops.render.render(write_still=True)
print('wrote', OUT)
```


---

## `art/vault_side.py`

Earlier side-view look test of the Vault.

```python
# Blender look test, side view: the Vault as a cutaway tower wall. Bricks are laid in running bond,
# holes reveal the dark interior, the fox's chamber is lit by a lantern.
# Run: python3 art/vault_side.py [out.png] [scale] [fox.glb]
import bpy, json, math, random, sys, os, addon_utils

addon_utils.enable("cycles", default_set=True)
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'out', 'vault_side.png')
SCALE = float(sys.argv[2]) if len(sys.argv) > 2 else 0.5
FOX = sys.argv[3] if len(sys.argv) > 3 else None
G = json.load(open(os.path.join(HERE, 'vault-grid.json')))
COLS, ROWS = G['cols'], G['rows']
U = 0.1                                  # metres per game unit
CW, CH = G['cw'] * U, G['ch'] * U        # 1.6 x 1.2
MORTAR = 0.1
OX, OY = 20 * U, 84 * U                  # board origin on the 360 x 700 screen
PW, PH = 360, 700
random.seed(7)
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene

def S(x, y):  # screen units (y down) -> Blender XZ (z up); wall face at y=0, camera at -y
    return (x * U, -y * U)

def mat(name, color, rough=0.4, metal=0.0, coat=0.0, coat_rough=0.05, sss=0.0, emit=None, emit_str=0.0):
    m = bpy.data.materials.new(name); b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*color, 1); b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal; b.inputs['Coat Weight'].default_value = coat
    b.inputs['Coat Roughness'].default_value = coat_rough
    if sss: b.inputs['Subsurface Weight'].default_value = sss
    if emit: b.inputs['Emission Color'].default_value = (*emit, 1); b.inputs['Emission Strength'].default_value = emit_str
    return m

def noisy(m, scale=6.0, amount=0.25, bump=0.15, detail=6.0, color2=None, vor=False):
    nt = m.node_tree; b = nt.nodes['Principled BSDF']
    tc = nt.nodes.new('ShaderNodeTexCoord')
    n = nt.nodes.new('ShaderNodeTexVoronoi' if vor else 'ShaderNodeTexNoise'); n.inputs['Scale'].default_value = scale
    if not vor: n.inputs['Detail'].default_value = detail
    nt.links.new(tc.outputs['Object'], n.inputs['Vector'])
    out = n.outputs['Distance'] if vor else n.outputs['Fac']
    base = b.inputs['Base Color'].default_value[:]
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].color = (*(color2 or tuple(c * (1 - amount) for c in base[:3])), 1); ramp.color_ramp.elements[1].color = base
    nt.links.new(out, ramp.inputs['Fac']); nt.links.new(ramp.outputs['Color'], b.inputs['Base Color'])
    bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = bump; bp.inputs['Distance'].default_value = 0.04
    nt.links.new(out, bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    return m

srgb = lambda h: tuple(((int(h[i:i + 2], 16) / 255) ** 2.2) for i in (1, 3, 5))
SAND = noisy(mat('sand', srgb('#f0b46e'), rough=0.38, coat=0.5, coat_rough=0.18), scale=7, amount=0.2, bump=0.3)
JADE = noisy(mat('jade', srgb('#19b3a0'), rough=0.12, coat=1.0, coat_rough=0.02, sss=0.2), scale=2.5, amount=0.35, bump=0.02, color2=srgb('#0b6d68'))
GOLD = mat('gold', srgb('#ffc94a'), rough=0.14, metal=1.0)
RUBY = mat('ruby', srgb('#ff2f5e'), rough=0.04, coat=1.0, sss=0.3)
GRANITE = noisy(mat('granite', srgb('#4a4f6e'), rough=0.45, coat=0.3), scale=18, amount=0.35, bump=0.25)
IRON = mat('iron', srgb('#2a2e3e'), rough=0.3, metal=0.9)
RIVET = mat('rivet', srgb('#b8c0d6'), rough=0.2, metal=1.0)
INTERIOR = noisy(mat('interior', srgb('#2a1f2e'), rough=0.9), scale=3, amount=0.6, bump=0.6, vor=True)
MORT = noisy(mat('mortar', srgb('#3a3046'), rough=0.95), scale=40, amount=0.4, bump=0.3)
WOOD = noisy(mat('wood', srgb('#8a5a35'), rough=0.6), scale=1.5, amount=0.45, bump=0.2)
BARS = mat('bars', srgb('#ffd27a'), rough=0.1, metal=1.0)

def box(name, w, h, d, bevel, m, loc, segs=4):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.object; o.name = name; o.scale = (w, d, h); bpy.ops.object.transform_apply(scale=True)
    if bevel:
        md = o.modifiers.new('b', 'BEVEL'); md.width = bevel; md.segments = segs; md.limit_method = 'NONE'
        bpy.ops.object.modifier_apply(modifier='b')
    bpy.ops.object.shade_smooth(); o.data.materials.append(m)
    return o

cells = [list(map(int, row.split(','))) for row in G['cells']]
DEPTH = 1.1
# --- bricks: sand and jade in running bond (two cells wide, odd rows offset by one cell) ---
done = set()
for r in range(ROWS):
    for c in range(COLS):
        v = cells[r][c]
        if not v or (c, r) in done: continue
        x0, y0 = OX / U + c * 16, OY / U + r * 12
        if v in (1, 2):
            # pair with the neighbour that completes this row's bond
            pair = c + 1 if (c + r) % 2 == 0 else None
            if pair is not None and pair < COLS and cells[r][pair] == v and (pair, r) not in done:
                done.add((pair, r)); w = 32
            else: w = 16
            done.add((c, r))
            cx, cz = S(x0 + w / 2, y0 + 6)
            o = box(f'b{c}_{r}', w * U - MORTAR, CH - MORTAR, DEPTH, 0.13, SAND if v == 1 else JADE,
                    (cx + random.uniform(-0.02, 0.02), -DEPTH / 2 - random.uniform(0, 0.06), cz + random.uniform(-0.015, 0.015)))
            o.rotation_euler = (0, math.radians(random.uniform(-1.2, 1.2)), 0)
        elif v == 3:
            done.add((c, r)); cx, cz = S(x0 + 8, y0 + 6)
            box(f'g{c}_{r}', CW - MORTAR, CH - MORTAR, DEPTH, 0.1, GOLD, (cx, -DEPTH / 2 - 0.04, cz))
            bpy.ops.mesh.primitive_ico_sphere_add(radius=0.3, subdivisions=1, location=(cx, -DEPTH - 0.12, cz))
            g = bpy.context.object; g.scale = (1, 0.5, 0.8); g.data.materials.append(RUBY)
        elif v == 9:
            done.add((c, r)); cx, cz = S(x0 + 8, y0 + 6)
            box(f'r{c}_{r}', CW - MORTAR * 0.6, CH - MORTAR * 0.6, DEPTH + 0.15, 0.06, GRANITE, (cx, -(DEPTH + 0.15) / 2, cz))
            for dx in (-0.5, 0.5):
                bpy.ops.mesh.primitive_uv_sphere_add(radius=0.1, segments=10, ring_count=6, location=(cx + dx, -DEPTH - 0.18, cz))
                bpy.context.object.data.materials.append(RIVET)

# --- back wall (seen through holes) and mortar bed ---
bw, bh = COLS * 16, ROWS * 12
cx, cz = S(OX / U + bw / 2, OY / U + bh / 2)
box('interior', bw * U, bh * U, 0.4, 0, INTERIOR, (cx, 0.9, cz))
box('mortarbed', bw * U, bh * U, 0.2, 0, MORT, (cx, 0.05, cz))
# fox chamber: wooden planks on the back wall, a lantern and gold bars
pc, pr = 8, 3
px0, py0 = OX / U + pc * 16, OY / U + pr * 12
ccx, ccz = S(px0 + 32, py0 + 18)
box('chamber', 64 * U, 36 * U, 0.1, 0, WOOD, (ccx, 0.6, ccz))
for i in range(1, 6):
    bx, _ = S(px0 + 64 * i / 6, 0)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.07, depth=36 * U, location=(bx, -DEPTH - 0.1, ccz)); bpy.context.object.data.materials.append(BARS)
bpy.ops.object.light_add(type='POINT', location=(ccx + 1.6, -0.2, ccz + 1.0)); L = bpy.context.object.data; L.energy = 60; L.color = (1, 0.6, 0.28); L.shadow_soft_size = 0.3
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.18, location=(ccx + 1.6, -0.1, ccz + 1.0)); bpy.context.object.data.materials.append(mat('flame', (1, 0.6, 0.2), emit=(1, 0.55, 0.2), emit_str=30))
if FOX and os.path.exists(FOX):
    bpy.ops.import_scene.gltf(filepath=FOX)
    root = [o for o in bpy.context.selected_objects if o.parent is None][0]
    # scale to roughly two cells tall, sit on the chamber floor facing the camera
    import mathutils
    pts = [o.matrix_world @ mathutils.Vector(v) for o in bpy.context.selected_objects if o.type == 'MESH' for v in o.bound_box]
    hgt = max(p.z for p in pts) - min(p.z for p in pts)
    k = 2.6 / hgt; root.scale = [s * k for s in root.scale]
    root.rotation_euler = (0, 0, math.radians(-20))
    bpy.context.view_layer.update()
    pts = [o.matrix_world @ mathutils.Vector(v) for o in bpy.context.selected_objects if o.type == 'MESH' for v in o.bound_box]
    root.location.x += ccx - (max(p.x for p in pts) + min(p.x for p in pts)) / 2
    root.location.y += -0.2 - (max(p.y for p in pts) + min(p.y for p in pts)) / 2
    root.location.z += (ccz - 36 * U / 2) - min(p.z for p in pts)

# --- tower shell: big stone pillars left/right, battlements on top, ground at the bottom ---
for side in (-1, 1):
    x = cx + side * (bw * U / 2 + 0.9)
    box(f'pillar{side}', 1.8, bh * U + 4, 1.8, 0.2, GRANITE, (x, -0.5, cz + 1))
for i in range(11):
    x = cx - bw * U / 2 - 0.8 + i * (bw * U + 1.6) / 10
    box(f'merlon{i}', 1.6, 1.4, 1.6, 0.15, GRANITE, (x, -0.5, cz + bh * U / 2 + 1.3))
box('cornice', bw * U + 4, 0.6, 2.0, 0.15, GRANITE, (cx, -0.5, cz + bh * U / 2 + 0.4))
# courtyard wall behind the paddle: big dark blocks set back from the play plane, two torches
base = OY / U + bh
for row in range(9):
    off = 40 if row % 2 else 0
    for i in range(-1, 6):
        x0 = i * 80 + off; y0 = base + 8 + row * 40
        bx, bz = S(x0 + 40, y0 + 20)
        box(f'cw{row}_{i}', 80 * U - 0.15, 40 * U - 0.15, 1.0, 0.18, GRANITE, (bx, 2.5 + random.uniform(0, 0.15), bz))
box('plinth', bw * U + 4, 0.9, 2.2, 0.15, GRANITE, (cx, -0.5, -(base + 4) * U))
for side in (-1, 1):
    tx, tz = S(180 + side * 140, base + 120)
    box(f'sconce{side}', 0.5, 1.2, 0.6, 0.1, IRON, (tx, 1.6, tz))
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.35, location=(tx, 1.3, tz + 0.9)); f = bpy.context.object; f.scale = (0.8, 0.8, 1.4)
    f.data.materials.append(mat('torch', (1, 0.5, 0.15), emit=(1, 0.45, 0.12), emit_str=40))
    bpy.ops.object.light_add(type='POINT', location=(tx, 0.6, tz + 1.2)); L = bpy.context.object.data; L.energy = 900; L.color = (1, 0.55, 0.25); L.shadow_soft_size = 0.4

# --- sky: dusk gradient world, a big warm moon light from the top-left ---
w = bpy.data.worlds.new('w'); sc.world = w
nt = w.node_tree; bg = nt.nodes['Background']
tc = nt.nodes.new('ShaderNodeTexCoord'); sep = nt.nodes.new('ShaderNodeSeparateXYZ'); ramp = nt.nodes.new('ShaderNodeValToRGB')
nt.links.new(tc.outputs['Generated'], sep.inputs['Vector']); nt.links.new(sep.outputs['Z'], ramp.inputs['Fac'])
ramp.color_ramp.elements[0].position = 0.45; ramp.color_ramp.elements[0].color = (0.02, 0.015, 0.05, 1)
ramp.color_ramp.elements[1].color = (0.25, 0.12, 0.3, 1)
nt.links.new(ramp.outputs['Color'], bg.inputs['Color']); bg.inputs['Strength'].default_value = 0.8

def area(loc, rot, energy, size, color):
    bpy.ops.object.light_add(type='AREA', location=loc, rotation=rot)
    l = bpy.context.object.data; l.energy = energy; l.size = size; l.color = color
area((cx - 25, -30, cz + 30), (math.radians(55), math.radians(-35), 0), 16000, 16, (1.0, 0.86, 0.72))   # key
area((cx + 30, -25, cz - 5), (math.radians(85), math.radians(50), 0), 5000, 14, (0.55, 0.65, 1.0))     # cool fill
area((cx, -10, cz - 45), (math.radians(140), 0, 0), 2500, 30, (1.0, 0.5, 0.65))                         # warm bounce from below

bpy.ops.object.camera_add(); cam = bpy.context.object; sc.camera = cam
cam.data.type = 'ORTHO'; cam.data.ortho_scale = PH * U
cam.rotation_euler = (math.radians(90), 0, 0)
cam.location = (PW / 2 * U, -60, -PH / 2 * U)
sc.render.resolution_x = int(PW * 3 * SCALE); sc.render.resolution_y = int(PH * 3 * SCALE)
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = 96; sc.cycles.use_denoising = True
sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast'
sc.render.filepath = OUT; os.makedirs(os.path.dirname(OUT), exist_ok=True)
bpy.ops.render.render(write_still=True)
print('wrote', OUT)
```


---

## `art/vault_scene.py`

First top-down look test built from art/vault-grid.json.

```python
# Blender look test for the Vault level: builds the board from art/vault-grid.json and renders a phone frame.
# Run: python3 art/vault_scene.py [out.png] [scale]
import bpy, json, math, random, sys, os, addon_utils

addon_utils.enable("cycles", default_set=True)
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'out', 'vault_look.png')
SCALE = float(sys.argv[2]) if len(sys.argv) > 2 else 0.5
G = json.load(open(os.path.join(HERE, 'vault-grid.json')))
COLS, ROWS = G['cols'], G['rows']
CW, CD, BH = 1.6, 1.2, 0.8           # cell width, cell depth (screen-up), brick height
TILT = math.radians(24)              # camera tilt from straight down: shows the bricks' front faces
random.seed(4)

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene

def mat(name, color, rough=0.4, metal=0.0, coat=0.0, coat_rough=0.05, sss=0.0, emit=None, emit_str=0.0):
    m = bpy.data.materials.new(name)
    nt = m.node_tree
    b = nt.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*color, 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    b.inputs['Coat Weight'].default_value = coat
    b.inputs['Coat Roughness'].default_value = coat_rough
    if sss:
        b.inputs['Subsurface Weight'].default_value = sss
        b.inputs['Subsurface Radius'].default_value = (0.4, 0.9, 0.7)
    if emit:
        b.inputs['Emission Color'].default_value = (*emit, 1); b.inputs['Emission Strength'].default_value = emit_str
    return m

def add_noise(m, scale=6.0, amount=0.25, bump=0.15, detail=6.0, color2=None):
    """Vary base color with noise and add a bump so surfaces don't read as flat CG."""
    nt = m.node_tree; b = nt.nodes['Principled BSDF']
    tc = nt.nodes.new('ShaderNodeTexCoord'); n = nt.nodes.new('ShaderNodeTexNoise')
    n.inputs['Scale'].default_value = scale; n.inputs['Detail'].default_value = detail
    nt.links.new(tc.outputs['Object'], n.inputs['Vector'])
    base = b.inputs['Base Color'].default_value[:]
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    c2 = color2 or tuple(max(0, c * (1 - amount)) for c in base[:3])
    ramp.color_ramp.elements[0].color = (*c2, 1); ramp.color_ramp.elements[1].color = base
    nt.links.new(n.outputs['Fac'], ramp.inputs['Fac']); nt.links.new(ramp.outputs['Color'], b.inputs['Base Color'])
    bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = bump; bp.inputs['Distance'].default_value = 0.05
    nt.links.new(n.outputs['Fac'], bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    return m

srgb = lambda h: tuple(((int(h[i:i + 2], 16) / 255) ** 2.2) for i in (1, 3, 5))
M = {
    1: add_noise(mat('sandstone', srgb('#e2ad6c'), rough=0.42, coat=0.35, coat_rough=0.25), scale=9, amount=0.22, bump=0.25),
    2: add_noise(mat('jade', srgb('#1aa392'), rough=0.16, coat=1.0, coat_rough=0.03, sss=0.15), scale=3, amount=0.3, bump=0.03, color2=srgb('#0d6e6a')),
    3: mat('gold', srgb('#ffc94a'), rough=0.16, metal=1.0),
    9: add_noise(mat('iron', srgb('#454c66'), rough=0.33, metal=0.85), scale=14, amount=0.25, bump=0.08),
}
RUBY = mat('ruby', srgb('#e02a52'), rough=0.05, coat=1.0, sss=0.3)
RIVET = mat('rivet', srgb('#9aa3bd'), rough=0.2, metal=1.0)
FLOOR = add_noise(mat('floor', srgb('#1d1a2c'), rough=0.7), scale=2.5, amount=0.45, bump=0.4, detail=10)
SLAB = add_noise(mat('slab', srgb('#2c2840'), rough=0.55, coat=0.2), scale=4, amount=0.35, bump=0.3)
TRIM = mat('trim', srgb('#d6a441'), rough=0.22, metal=1.0)
BARS = mat('bars', srgb('#ffcf6a'), rough=0.12, metal=1.0)

def brick_mesh(name, sx, sy, sz, bevel):
    bpy.ops.mesh.primitive_cube_add(size=1)
    o = bpy.context.object; o.name = name; o.scale = (sx, sy, sz)
    bpy.ops.object.transform_apply(scale=True)
    md = o.modifiers.new('bev', 'BEVEL'); md.width = bevel; md.segments = 5; md.limit_method = 'NONE'
    bpy.ops.object.modifier_apply(modifier='bev')
    bpy.ops.object.shade_smooth()
    return o

protos = {}
for v, m in M.items():
    o = brick_mesh(f'proto{v}', CW * 0.94, CD * 0.92, BH, 0.16 if v != 9 else 0.1)
    o.data.materials.append(m); o.hide_render = True; o.hide_viewport = True
    protos[v] = o

def place(v, c, r):
    p = protos[v]
    o = bpy.data.objects.new(f'b{c}_{r}', p.data)
    sc.collection.objects.link(o)
    x, y = c * CW + CW / 2, -(r * CD + CD / 2)
    jitter = 0 if v == 9 else 1
    o.location = (x + random.uniform(-0.03, 0.03) * jitter, y + random.uniform(-0.02, 0.02) * jitter, BH / 2 + random.uniform(0, 0.04) * jitter)
    o.rotation_euler = (0, 0, math.radians(random.uniform(-1.6, 1.6)) * jitter)
    if v == 3:  # ruby on the gold bricks
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.28, segments=8, ring_count=4, location=(x, y, BH + 0.05))
        g = bpy.context.object; g.scale = (1, 0.8, 0.55); g.data.materials.append(RUBY)
    if v == 9:
        for dx, dy in ((-0.55, -0.38), (0.55, -0.38), (-0.55, 0.38), (0.55, 0.38)):
            bpy.ops.mesh.primitive_uv_sphere_add(radius=0.09, segments=10, ring_count=6, location=(x + dx, y + dy, BH + 0.01))
            bpy.context.object.data.materials.append(RIVET)

cells = [list(map(int, row.split(','))) for row in G['cells']]
for r in range(ROWS):
    for c in range(COLS):
        if cells[r][c]: place(cells[r][c], c, r)

bw, bd = COLS * CW, ROWS * CD
cx, cy = bw / 2, -bd / 2
# recessed floor of the vault and the stone slab it sits in
bpy.ops.mesh.primitive_plane_add(size=1, location=(cx, cy, 0.0)); f = bpy.context.object; f.scale = (bw, bd, 1); f.data.materials.append(FLOOR)
s = brick_mesh('slab', bw + 1.6, bd + 1.6, 0.6, 0.25); s.location = (cx, cy, -0.32); s.data.materials.append(SLAB)
t = brick_mesh('trim', bw + 2.2, bd + 2.2, 0.3, 0.12); t.location = (cx, cy, -0.6); t.data.materials.append(TRIM)
bpy.ops.mesh.primitive_plane_add(size=400, location=(cx, cy, -0.75)); g = bpy.context.object; g.data.materials.append(add_noise(mat('ground', srgb('#141224'), rough=0.8), scale=0.6, amount=0.5, bump=0.3))

# gold cage bars over the fox pocket (cols 8-11, rows 3-5)
for i in range(1, 6):
    x = 8 * CW + (4 * CW) * i / 6
    bpy.ops.mesh.primitive_cylinder_add(radius=0.09, depth=3 * CD + 0.2, location=(x, -(3 * CD + 1.5 * CD), BH + 0.3), rotation=(math.pi / 2, 0, 0))
    bpy.context.object.data.materials.append(BARS)

# lights: warm key from top-left, cool fill, rim, and a lantern glow inside the pocket
def area(loc, rot, energy, size, color):
    bpy.ops.object.light_add(type='AREA', location=loc, rotation=rot)
    l = bpy.context.object.data; l.energy = energy; l.size = size; l.color = color
area((cx - 22, cy + 20, 30), (math.radians(35), math.radians(-35), 0), 9000, 14, (1.0, 0.9, 0.78))
area((cx + 26, cy - 10, 18), (math.radians(50), math.radians(50), 0), 2500, 12, (0.6, 0.72, 1.0))
area((cx, cy + 40, 10), (math.radians(-70), 0, 0), 3000, 20, (0.9, 0.85, 1.0))
bpy.ops.object.light_add(type='POINT', location=(10 * CW, -4.5 * CD, 1.4))
pl = bpy.context.object.data; pl.energy = 220; pl.color = (1.0, 0.62, 0.3); pl.shadow_soft_size = 0.5

# world: dark indigo with a soft overhead glow so glossy tops pick up a highlight gradient
w = bpy.data.worlds.new('w'); sc.world = w
nt = w.node_tree; bg = nt.nodes['Background']
grad = nt.nodes.new('ShaderNodeTexGradient'); grad.gradient_type = 'SPHERICAL'
tc = nt.nodes.new('ShaderNodeTexCoord'); ramp = nt.nodes.new('ShaderNodeValToRGB')
ramp.color_ramp.elements[0].color = (0.012, 0.012, 0.03, 1); ramp.color_ramp.elements[1].color = (0.09, 0.08, 0.16, 1)
nt.links.new(tc.outputs['Generated'], grad.inputs['Vector']); nt.links.new(grad.outputs['Fac'], ramp.inputs['Fac']); nt.links.new(ramp.outputs['Color'], bg.inputs['Color'])
bg.inputs['Strength'].default_value = 1.0

# orthographic camera framing a 360 x 700 phone screen (1 game unit = 0.1 m)
PW, PH = 360, 700
bpy.ops.object.camera_add(); cam = bpy.context.object; sc.camera = cam
cam.data.type = 'ORTHO'; cam.data.ortho_scale = PH * 0.1
cam.rotation_euler = (TILT, 0, 0)
d = 60
look = (cx, cy - 2.0, 0)
cam.location = (look[0], look[1] - d * math.sin(TILT), d * math.cos(TILT))
sc.render.resolution_x = int(PW * 3 * SCALE); sc.render.resolution_y = int(PH * 3 * SCALE)
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = 96; sc.cycles.use_denoising = True
sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast'
sc.render.filepath = OUT
os.makedirs(os.path.dirname(OUT), exist_ok=True)
bpy.ops.render.render(write_still=True)
print('wrote', OUT)
```


---

## `art/vault-grid.json`

Grid used by the early look tests.

```json
{"cols":20,"rows":28,"cw":16,"ch":12,"cells":["9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9","9,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,9","9,2,2,2,2,2,2,9,9,9,9,9,9,2,2,2,0,0,0,9","9,2,2,2,2,2,2,9,0,0,0,0,9,2,2,2,2,2,2,9","9,2,2,2,2,2,2,9,0,0,0,0,9,2,2,2,2,2,2,9","9,2,2,2,2,2,2,9,0,0,0,0,9,2,2,2,2,2,2,9","9,2,2,2,2,3,2,9,2,2,2,2,3,2,2,2,2,2,2,9","9,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,9","9,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,9","9,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9","9,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,1,9","9,1,1,1,1,1,9,1,1,1,1,1,1,9,1,1,1,1,1,9","9,1,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9","9,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9","9,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9","9,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,9","9,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,9","9,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,9,1,9","9,1,9,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,9","9,1,1,1,0,1,1,9,1,1,1,1,9,1,3,1,1,1,1,9","9,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9","9,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9","9,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,9","9,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,9","9,1,1,1,1,1,3,1,1,0,0,1,1,1,1,0,0,0,1,9","1,1,1,0,1,1,1,1,1,0,0,1,1,1,1,0,1,1,1,1","1,1,1,0,1,1,1,1,1,0,0,1,1,1,1,0,1,1,1,1","1,1,1,0,1,1,1,1,1,0,0,1,1,1,1,0,1,1,1,1"],"snake":[[17,1],[18,1],[18,2],[17,2],[16,2]]}
```


---

## `tools/pack_art.py`

Packs all rendered PNGs into src/vault-art.js as WebP data URIs (3 px per game unit for sprites) so the game ships as one HTML file. Run after any render, then npm run build.

```python
# Pack rendered Blender art into src/vault-art.js as WebP data URIs (so the game stays a single file).
# Run: python3 tools/pack_art.py
import base64, io, json, os, glob, hashlib
from PIL import Image, ImageChops, ImageStat

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
A = lambda *p: os.path.join(ROOT, 'assets', *p)
PX = 3  # rendered pixels per game unit

def uri(im, q=88, lossless=False):
    b = io.BytesIO(); im.save(b, 'WEBP', quality=q, method=6, lossless=lossless, exact=lossless); return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()

art = {'sprites': {}}
with Image.open(A('fantasy-machinery', 'bellforge-background.png')) as keep:
    art['keepBackdrop'] = uri(keep, 88)
art['mooncoil'] = {'bricks': {}}
moon_background = A('mooncoil', 'background.png')
if os.path.exists(moon_background):
    with Image.open(moon_background) as im:
        assert not im.info, 'Mooncoil background metadata must be stripped'
        art['mooncoil']['background'] = uri(im, 90)
moon_manifest = A('mooncoil', 'bricks-manifest.json')
if os.path.exists(moon_manifest):
    manifest = json.load(open(moon_manifest, encoding='utf-8'))
    for key, spec in manifest['sprites'].items():
        path = os.path.join(ROOT, spec['path'])
        with Image.open(path) as im:
            assert im.mode == 'RGBA' and not im.info, f'Invalid Mooncoil brick: {key}'
            assert list(im.size) == spec['px']
            art['mooncoil']['bricks'][key] = {'url': uri(im, 100, lossless=True),
                'margin': spec['margin'], 'uw': spec['drawSize'][0], 'uh': spec['drawSize'][1]}
icon_manifest = A('power-icons', 'icons-manifest.json')
if os.path.exists(icon_manifest):
    art['powerIcons'] = {}
    for key, spec in json.load(open(icon_manifest, encoding='utf-8'))['icons'].items():
        with Image.open(os.path.join(ROOT, spec['path'])) as im:
            assert im.mode == 'RGBA' and not im.info and list(im.size) == spec['px'], f'Invalid power icon: {key}'
            art['powerIcons'][key] = {'url': uri(im, 100, lossless=True), 'artBounds': spec['artBounds']}
# Castle window kit: back layer, clipped serpent, front layer (see art/castle/README.md).
window_manifest = A('castle', 'window-manifest.json')
if os.path.exists(window_manifest):
    art['castleWindow'] = {}
    for key, spec in json.load(open(window_manifest, encoding='utf-8'))['sprites'].items():
        with Image.open(os.path.join(ROOT, spec['path'])) as im:
            assert im.mode == 'RGBA' and not im.info and list(im.size) == spec['px'], f'Invalid window sprite: {key}'
            art['castleWindow'][key] = {'url': uri(im, 100, lossless=True), 'uw': spec['drawSize'][0], 'uh': spec['drawSize'][1],
                                        'anchor': spec['anchor'], 'opening': spec['opening']}
# Shared counter gems and crash pieces (see art/fx_kit/fx_kit.py); drawn centred at drawSize.
fx_manifest = A('fx-kit', 'fx-manifest.json')
if os.path.exists(fx_manifest):
    art['fxKit'] = {}
    for key, spec in json.load(open(fx_manifest, encoding='utf-8'))['parts'].items():
        with Image.open(os.path.join(ROOT, spec['path'])) as im:
            assert im.mode == 'RGBA' and not im.info and list(im.size) == spec['px'], f'Invalid fx part: {key}'
            art['fxKit'][key] = {'url': uri(im, 100, lossless=True), 'uw': spec['drawSize'][0], 'uh': spec['drawSize'][1]}
skin_manifest = A('paddle-skins', 'skins-manifest.json')
if os.path.exists(skin_manifest):
    art['paddleSkins'] = {}
    for key, parts in json.load(open(skin_manifest, encoding='utf-8'))['skins'].items():
        art['paddleSkins'][key] = {}
        for part, spec in parts.items():
            with Image.open(os.path.join(ROOT, spec['path'])) as im:
                assert im.mode == 'RGBA' and not im.info and list(im.size) == spec['px'], f'Invalid paddle skin: {key}_{part}'
                art['paddleSkins'][key][part] = {'url': uri(im, 100, lossless=True)}
art['spaceWeapons'] = {}
for name in ('shot', 'impact'):
    path = os.path.join(ROOT, 'design', 'phase1', 'weapon-vfx-v3', f'plasma-{name}-runtime.png')
    im = Image.open(path)
    assert im.mode == 'RGBA' and not im.info, f'Invalid weapon PNG: {name}'
    art['spaceWeapons'][name] = uri(im, 100, lossless=True)


# princess: one sheet, one row per animation
anims = ['Idle', 'Interact', 'Blocking', 'Cheer', 'Running_A', 'Jump_Full_Short', 'Scared', 'Nervous', 'Panic']
frames = {a: sorted(glob.glob(A('princess', f'{a}_*.png'))) for a in anims}
anims = [a for a in anims if frames[a]]; frames = {a: frames[a] for a in anims}
if 'Idle' in frames:
    cell = Image.open(frames['Idle'][0]).size[0]
    cols = max(len(f) for f in frames.values())
    sheet = Image.new('RGBA', (cols * cell, len(anims) * cell))
    for r, a in enumerate(anims):
        for c, f in enumerate(frames[a]): sheet.paste(Image.open(f), (c * cell, r * cell))
    art['princess'] = {'url': uri(sheet, 86), 'cell': cell, 'unit': cell / PX, 'feet': 4,
                       'anims': {a: {'row': r, 'n': len(frames[a])} for r, a in enumerate(anims)}}

# Kit: one row per expression clip, with the same cell and feet contract as Lumi.
kit_anims = ['Idle', 'Focus', 'Grin', 'Shock', 'Worried', 'Cheer', 'Hurt', 'Laugh']
kit_frames = {a: sorted(glob.glob(A('kit', f'{a}_*.png'))) for a in kit_anims}
if kit_frames['Idle']:
    assert all(kit_frames.values()), 'Kit needs all eight expression clips before packing'
    kit_meta = json.load(open(A('kit', 'meta.json')))
    cell = 168
    sheet = Image.new('RGBA', (max(map(len, kit_frames.values())) * cell, len(kit_anims) * cell))
    for r, a in enumerate(kit_anims):
        assert len(kit_frames[a]) == kit_meta['anims'][a]['frames'], f'Incomplete Kit clip: {a}'
        for c, f in enumerate(kit_frames[a]):
            with Image.open(f) as im:
                assert im.size == (cell, cell) and im.mode == 'RGBA', f'Invalid Kit frame: {f}'
                sheet.paste(im, (c * cell, r * cell))
    art['kit'] = {'url': uri(sheet, 90), 'cell': cell, 'unit': 56, 'feet': 4,
                  'anims': {a: {'row': r, 'n': len(kit_frames[a]), 'fps': kit_meta['anims'][a]['fps'], 'loop': kit_meta['anims'][a]['loop']} for r, a in enumerate(kit_anims)}}
    face_cell = 288
    faces = Image.new('RGBA', (len(kit_anims) * face_cell, face_cell))
    for c, a in enumerate(kit_anims):
        with Image.open(A('kit', 'faces', f'{a}_face_00.png')) as im:
            assert im.size == (face_cell, face_cell) and im.mode == 'RGBA', f'Invalid Kit portrait: {a}'
            faces.paste(im, (c * face_cell, 0))
    art['kit']['faces'] = {'url': uri(faces, 90), 'cell': face_cell}

# Selected Kit Ward: a physical spinning shield and its unfolding brick armour.
cast_meta = A('kit-cast', 'meta.json')
if os.path.exists(cast_meta):
    meta = json.load(open(cast_meta))
    cell = meta['cell']
    assert cell == 256 and meta['collision'].startswith('none'), 'Invalid Kit cast contract'
    timing = meta['timing']
    assert 0 < timing['anticipation'] < timing['arrival'] < timing['settled'] < 0.5, 'Kit cast must settle before the latest legal venom impact'
    sheet = Image.new('RGBA', (16 * cell, 2 * cell))
    clips = {}
    for row, (name, count) in enumerate([('Spin', 16), ('Armour', 12)]):
        paths = sorted(glob.glob(A('kit-cast', f'{name}_*.png')))
        assert len(paths) == count == meta['anims'][name]['frames'], f'Incomplete Kit cast: {name}'
        for col, path in enumerate(paths):
            assert os.path.basename(path) == f'{name}_{col:02d}.png', f'Unexpected Kit cast frame: {path}'
            with Image.open(path) as im:
                assert im.size == (cell, cell) and im.mode == 'RGBA' and not im.text, f'Invalid Kit cast frame: {path}'
                bounds = im.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox()
                assert bounds and min(bounds[:2]) > 2 and max(bounds[2:]) < cell - 2, f'Clipped Kit cast frame: {path}'
                sheet.paste(im, (col * cell, row * cell))
        clips[name] = {'row': row, 'n': count}
    art['kitCast'] = {'url': uri(sheet, 90), 'cell': cell, 'anims': clips, 'timing': timing}

# serpent: one sheet of head sprites, a row per facing and a column per expression (art/snake.py)
for key, directory in [('snake', 'snake'), ('snakeJade', 'snake-jade'), ('snakeEmerald', 'snake-emerald'), ('snakeEmber', 'snake-ember')]:
    meta_path = A(directory, 'meta.json')
    if not os.path.exists(meta_path): continue
    meta = json.load(open(meta_path)); px = meta['px']; cell = int(meta.get('cell', round(meta['box'] * px)))
    exprs, dirs = meta['expressions'], meta['dirs']
    sheet = Image.new('RGBA', (len(exprs) * cell, len(dirs) * cell))
    for r, d in enumerate(dirs):
        for c, e in enumerate(exprs): sheet.paste(Image.open(A(directory, f'head_{e}_{d}.png')), (c * cell, r * cell))
    art[key] = {'url': uri(sheet, 94 if key in ('snakeEmerald', 'snakeEmber') else 86), 'cell': cell, 'unit': meta['box'],
                'expr': {e: i for i, e in enumerate(exprs)}, 'dir': {d: i for i, d in enumerate(dirs)}}
    if 'mouths' in meta: art[key]['mouths'] = meta['mouths']

# vault plate, bricks and props from the Blender pipeline (art/render_vault_assets.py), when present
atlas = A('vault', 'atlas.json')
if os.path.exists(atlas):
    meta = json.load(open(atlas))
    items = meta['sprites'] if isinstance(meta, dict) and 'sprites' in meta else meta
    for name, s in (items.items() if isinstance(items, dict) else ((os.path.basename(s['file'])[:-4], s) for s in items)):
        path = A('vault', s.get('file', name + '.png'))
        if not os.path.exists(path) or name.startswith('plate'): continue
        im = Image.open(path)
        art['sprites'][name] = {'url': uri(im), 'uw': im.size[0] / PX, 'uh': im.size[1] / PX, 'margin': s.get('margin') if s.get('margin') is not None else 0}
    for p in ('plate.png', 'plate.jpg'):
        if os.path.exists(A('vault', p)):
            im = Image.open(A('vault', p)).convert('RGB'); b = io.BytesIO(); im.save(b, 'WEBP', quality=86)
            art['plate'] = 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode(); break
    if os.path.exists(A('vault', 'bars.png')):
        art['bars'] = uri(Image.open(A('vault', 'bars.png')))

# invasion: same atlas format, sprites prefixed inv_ so they never clash with the Vault's
inv = A('invasion', 'atlas.json')
if os.path.exists(inv):
    meta = json.load(open(inv))
    for name, s in meta['sprites'].items():
        path = A('invasion', s['file'])
        if not os.path.exists(path): continue
        im = Image.open(path)
        art['sprites']['inv_' + name] = {'url': uri(im), 'uw': im.size[0] / PX, 'uh': im.size[1] / PX, 'margin': s.get('margin') or 0}
    for p in ('plate.png', 'plate.jpg'):
        if os.path.exists(A('invasion', p)):
            im = Image.open(A('invasion', p)).convert('RGB'); b = io.BytesIO(); im.save(b, 'WEBP', quality=86)
            art['invPlate'] = 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode(); break

# Carrier Breakout: preserve the reviewed component geometry while sizing textures for phone rendering.
carrier_manifest = os.path.join(ROOT, 'design', 'phase1', 'space-assets-ab.json')
if os.path.exists(carrier_manifest):
    manifest = json.load(open(carrier_manifest, encoding='utf-8'))
    selected = {k: p for k, p in manifest['parts'].items() if k.startswith('a') or k in ('ball', 'capsule_laser', 'capsule_split', 'capsule_shield')}
    carrier = {'parts': {}, 'assembly': manifest['assemblies']['A'], 'motion': manifest['motion'], 'frame': manifest['frame'], 'payloads': manifest['draftIntegration']['payloads']['A']}
    packed = []
    for name, spec in selected.items():
        path = os.path.join(ROOT, spec['path'])
        with Image.open(path) as source:
            assert not source.info, f'Carrier PNG metadata: {path}'
            im = source.convert('RGB' if name == 'aBackground' else 'RGBA')
            assert list(im.size) == spec['size'], f'Carrier dimensions changed: {name}'
            bounds = im.getchannel('A').point(lambda a: 255 if a >= 16 else 0).getbbox() if im.mode == 'RGBA' else (0, 0, im.width, im.height)
            assert bounds, f'Empty Carrier part: {name}'
            art_bounds = [bounds[0] / im.width, bounds[1] / im.height, (bounds[2] - bounds[0]) / im.width, (bounds[3] - bounds[1]) / im.height]
            if isinstance(spec['display'], list):
                ratio = min(1, max(spec['display']) * PX / max(im.size))
                if ratio < 1:
                    im = im.resize((max(1, round(im.width * ratio)), max(1, round(im.height * ratio))), Image.Resampling.LANCZOS)
            url = uri(im, 96)
            part = {k: v for k, v in spec.items() if k not in ('path', 'size', 'collision', 'approval')}
            part.update({'url': url, 'width': im.width, 'height': im.height, 'artBounds': art_bounds})
            carrier['parts'][name] = part
            packed.append({'id': name, 'source': spec['path'], 'sourceSHA256': hashlib.sha256(open(path, 'rb').read()).hexdigest(), 'sourceSize': spec['size'], 'runtimeSize': list(im.size), 'encodedBytes': len(base64.b64decode(url.split(',', 1)[1])), 'decodedBytes': im.width * im.height * 4, 'quality': 96})
    assert len(carrier['assembly']['bricks']) == 16 and len(carrier['assembly']['pods']) == 5
    art['carrier'] = carrier
    os.makedirs(os.path.join(ROOT, 'out'), exist_ok=True)
    with open(os.path.join(ROOT, 'out', 'carrier-pack-report.json'), 'w', encoding='utf-8') as f:
        json.dump({'parts': packed, 'encodedBytes': sum(p['encodedBytes'] for p in packed), 'decodedBytes': sum(p['decodedBytes'] for p in packed)}, f, indent=2)

# Preserve the reviewed phone texture packs and original collision geometry for the two space encounters.
def runtime_parts(specs, report_path):
    report = json.load(open(os.path.join(ROOT, report_path), encoding='utf-8'))
    packed = {p['id']: p for p in report['parts']}
    result = {}
    for name, spec in specs.items():
        p = packed[name]
        source = os.path.join(ROOT, spec['path'])
        target = os.path.join(ROOT, p['path'])
        assert hashlib.sha256(open(source, 'rb').read()).hexdigest() == p['sourceSHA256'], f'Stale source: {name}'
        data = open(target, 'rb').read()
        assert hashlib.sha256(data).hexdigest() == p['runtimeSHA256'], f'Stale runtime: {name}'
        result[name] = {**spec, 'url': 'data:image/webp;base64,' + base64.b64encode(data).decode()}
    return result

base = json.load(open(os.path.join(ROOT, 'design/phase1/space-assets-ab.json'), encoding='utf-8'))
measured = json.load(open(os.path.join(ROOT, 'tools/relay-preview/art-info.json'), encoding='utf-8-sig'))
extra = json.load(open(A('relay-circuit', 'manifest.json'), encoding='utf-8'))
parts = {name: {**base['parts'][name], **p} for name, p in measured.items() if name != 'bWorker'}
parts = runtime_parts(parts, 'assets/relay-circuit/runtime-base/report.json')
parts.update(runtime_parts(extra['parts'], 'assets/relay-circuit/runtime-extra/report.json'))
art['relayCircuit'] = {'parts': parts, 'assembly': base['assemblies']['B'], 'motion': base['motion'], 'payloads': base['draftIntegration']['payloads']['B']}
forge = json.load(open(A('orbital-forge', 'manifest.json'), encoding='utf-8'))
forge['parts'] = runtime_parts(forge['parts'], 'assets/orbital-forge/runtime/report.json')
art['orbitalForge'] = forge

# Selected companion atlases; each cast keeps its own expression and motion clips.
art['spaceCompanions'] = {}; packed = []
for directory, expected in [('space-companions', {'nix', 'tick'}), ('circuit-companions', {'vesper', 'latch'})]:
    companion_manifest = A(directory, 'manifest.json')
    manifest = json.load(open(companion_manifest, encoding='utf-8'))
    assert set(manifest['families']) == expected, f'Unexpected cast: {directory}'
    for name, spec in manifest['families'].items():
        path = os.path.join(ROOT, spec['atlas'])
        digest = hashlib.sha256(open(path, 'rb').read()).hexdigest()
        assert digest == spec['sha256'], f'Companion source changed: {name}'
        with Image.open(path) as im:
            cw, ch = spec['cell']; count = spec['columns'] * spec['rows']
            assert im.mode == 'RGBA' and not im.info, f'Invalid companion PNG: {name}'
            assert im.size == (cw * spec['columns'], ch * spec['rows']) and len(spec['frames']) == count
            for n in range(count):
                bounds = im.crop((n % spec['columns'] * cw, n // spec['columns'] * ch, (n % spec['columns'] + 1) * cw, (n // spec['columns'] + 1) * ch)).getchannel('A').getbbox()
                assert bounds and bounds[0] > 2 and bounds[1] > 2 and bounds[2] < cw - 2 and bounds[3] < ch - 2, f'Clipped companion cell: {name}/{n}'
            for clip in spec['clips'].values():
                assert clip['fps'] > 0 and clip['frames'] and all(isinstance(n, int) and 0 <= n < count for n in clip['frames'])
            url = uri(im, 100, lossless=True); encoded = base64.b64decode(url.split(',', 1)[1])
            decoded = Image.open(io.BytesIO(encoded)).convert('RGBA')
            assert ImageChops.difference(im.getchannel('A'), decoded.getchannel('A')).getbbox() is None, f'Companion alpha changed: {name}'
            means = ImageStat.Stat(ImageChops.difference(im, decoded), im.getchannel('A')).mean[:3]
            assert max(means) == 0, f'Companion compression drift: {name}'
            art['spaceCompanions'][name] = {k: spec[k] for k in ('cell', 'columns', 'rows', 'pivot', 'clips')}
            art['spaceCompanions'][name]['url'] = url
            packed.append({'id': name, 'sourceSHA256': digest, 'encodedBytes': len(encoded), 'decodedBytes': im.width * im.height * 4, 'rgbMeanAbsoluteError': means, 'alphaExact': True, 'encoding': 'lossless WebP'})
    with open(os.path.join(ROOT, 'out', 'companion-pack-report.json'), 'w', encoding='utf-8') as f:
        json.dump({'families': packed}, f, indent=2)

frost_path = A('frost-warden', 'manifest.json')
if os.path.exists(frost_path):
    frost = json.load(open(frost_path, encoding='utf-8'))
    atlas_path = os.path.join(ROOT, frost['atlas'])
    assert hashlib.sha256(open(atlas_path, 'rb').read()).hexdigest() == frost['sha256'], 'Frost atlas changed'
    with Image.open(atlas_path) as im:
        cw, ch = frost['cell']; count = frost['columns'] * frost['rows']
        assert im.mode == 'RGBA' and not im.info, 'Frost requires stripped RGBA'
        assert im.size == (cw * frost['columns'], ch * frost['rows'])
        assert len(frost['anchors']) == count, 'Every physical pose needs measured anchors'
        for clip in frost['clips'].values():
            assert clip['frames'] and all(isinstance(n, int) and 0 <= n < count for n in clip['frames'])
        for n in range(count):
            bounds = im.crop((n % frost['columns'] * cw, n // frost['columns'] * ch, (n % frost['columns'] + 1) * cw, (n // frost['columns'] + 1) * ch)).getchannel('A').getbbox()
            assert bounds and bounds[0] > 0 and bounds[1] > 0 and bounds[2] < cw and bounds[3] < ch, f'Clipped Frost frame {n}'
        art['frostWarden'] = {k: v for k, v in frost.items() if k not in ('atlas', 'sha256')}
        art['frostWarden']['url'] = uri(im, 100, lossless=True)

# Bellforge Run and Tidewheel Citadel machinery: native-resolution WebP (alpha stays exact) plus the measured pivots/anchors the renderer uses.
# The Bellforge plate is art['keepBackdrop'] above; shared ball, paddle, brick and Lumi art comes from art['sprites'] and art['princess'].
fm = lambda f: A('fantasy-machinery', f)
def fm_part(spec, q=88):
    part = {k: spec[k] for k in ('size', 'unit', 'pivot', 'cell', 'columns', 'anchors', 'sockets', 'footUV', 'frame', 'frameRect') if k in spec}
    with Image.open(os.path.join(ROOT, spec['path'])) as im:
        assert list(im.size) == spec['size'] and im.mode == 'RGBA', f"Stale fantasy art: {spec['path']}"
        part['url'] = uri(im, q)
    return part
fantasy_manifest = json.load(open(fm('manifest.json'), encoding='utf-8'))
nerra_manifest = json.load(open(fm('nerra-v2-manifest.json'), encoding='utf-8'))
reactions = json.load(open(fm('reactions-manifest.json'), encoding='utf-8'))
fantasy = {'bellforge': {k: fm_part(fantasy_manifest['bellforge'][k]) for k in ('korr', 'bell', 'ramp', 'lift', 'ratchet', 'plinth', 'releaseLever', 'leverMount', 'bellCradle')},
           'tidewheel': {k: fm_part(fantasy_manifest['tidewheel'][k]) for k in ('crusherClaw', 'wheel', 'raft', 'gate', 'counterweight', 'sluiceWall', 'refugeBalcony', 'gateFrame')},
           'nerra': {k: fm_part(nerra_manifest[k]) for k in ('nerraBody', 'gateClawV2', 'chain')}}
fantasy['tidewheel']['bricks'] = {k: fm_part(fantasy_manifest['tidewheel']['bricks'][k]) for k in ('sage', 'coral', 'ivory')}
with Image.open(fm('tidewheel-background.png')) as im:
    fantasy['tidewheel']['background'] = {'size': list(im.size), 'url': uri(im.convert('RGB'), 86)}
fantasy['bellforge']['background'] = {'size': fantasy_manifest['bellforge']['background']['size']}
fantasy['reactions'] = {f: {k: fm_part(reactions[f][k]) for k in reactions[f]} for f in ('nerra', 'korr')}
fantasy['waterShot'] = fm_part(json.load(open(fm('water-shot-manifest.json'), encoding='utf-8')))
art['fantasy'] = fantasy

# Lumi Breaks Out: her face-orb set (Kit's mood names alias onto it) and the pink-gold paddle caps, both drop-ins for Kit's/the Vault's.
lumi_faces = A('princess', 'faces', 'manifest.json')
if os.path.exists(lumi_faces):
    order = json.load(open(lumi_faces, encoding='utf-8'))['order']; face_cell = 288
    faces = Image.new('RGBA', (len(order) * face_cell, face_cell))
    for c, a in enumerate(order):
        with Image.open(A('princess', 'faces', f'{a}_face_00.png')) as im:
            assert im.size == (face_cell, face_cell) and im.mode == 'RGBA' and not im.info, f'Invalid Lumi face: {a}'
            faces.paste(im, (c * face_cell, 0))
    expr = {a: i for i, a in enumerate(order)}; expr.update({'Worried': expr['Nervous'], 'Shock': expr['Panic'], 'Grin': expr['Cheer'], 'Laugh': expr['Cheer']})
    art['lumiFaces'] = {'url': uri(faces, 90), 'cell': face_cell, 'expr': expr}
if os.path.exists(A('princess', 'paddle', 'paddle_m.png')):
    art['lumiPaddle'] = {}
    for part in ('l', 'm', 'r'):
        with Image.open(A('princess', 'paddle', f'paddle_{part}.png')) as im:
            assert im.mode == 'RGBA' and not im.info and im.size == ((150 if part == 'm' else 48), 60), f'Invalid Lumi paddle: {part}'
            art['lumiPaddle'][part] = uri(im, 100, lossless=True)

# Serpent Rivals props (art/rivals/rivals_art.py): lure runes, Twin Seal stages, ward plates, chamber floor, clash burst, shuttered window.
# Each sprite is drawn at drawSize with `anchor` on its model point; `contact` is the model rect inside the sprite.
rivals_manifest = A('rivals', 'manifest.json')
if os.path.exists(rivals_manifest):
    rm = json.load(open(rivals_manifest, encoding='utf-8')); art['rivals'] = {'sprites': {}, 'wardSlots': rm['sealWardSlots']['slots']}
    for key, spec in rm['sprites'].items():
        with Image.open(os.path.join(ROOT, spec['path'])) as im:
            assert im.mode == 'RGBA' and not im.info and list(im.size) == spec['px'], f'Invalid rivals sprite: {key}'
            art['rivals']['sprites'][key] = {k: spec[k] for k in ('anchor', 'contact', 'opening') if k in spec}
            art['rivals']['sprites'][key].update({'url': uri(im, 100, lossless=True), 'uw': spec['drawSize'][0], 'uh': spec['drawSize'][1]})

# Premium pass (art/premium/premium.py): glazed crash shards and impact glints for every Arena chapter, the Bellforge
# ceramic and pin bricks (Tidewheel contact anchors), the Frost ward posts and the Frost rampart backdrop.
premium_manifest = A('premium', 'manifest.json')
if os.path.exists(premium_manifest):
    pm = json.load(open(premium_manifest, encoding='utf-8'))['parts']
    def premium_uri(key, q=92, lossless=False, rgb=False):
        spec = pm[key]; path = os.path.join(ROOT, spec['path'])
        assert hashlib.sha256(open(path, 'rb').read()).hexdigest() == spec['sha256'], f'Premium art changed: {key}'
        with Image.open(path) as im:
            assert list(im.size) == spec['px'] and not im.info and im.mode == ('RGB' if rgb else 'RGBA'), f'Invalid premium art: {key}'
            return uri(im, q, lossless=lossless)
    premium = {'shards': {}, 'glints': {}, 'bricks': {}, 'frost': {}}
    for key in sorted(pm):
        family, name = key.split('/'); spec = pm[key]
        if family == 'shards': premium['shards'].setdefault(name.rsplit('_', 1)[0], []).append(premium_uri(key, 100, True))
        elif family == 'glints': premium['glints'][name.split('_', 1)[1]] = premium_uri(key, 100, True)
        elif family == 'bellforge': premium['bricks'][name] = {'url': premium_uri(key), 'uw': spec['drawSize'][0], 'uh': spec['drawSize'][1], 'anchors': spec['anchors']}
        elif key == 'frost/backdrop': premium['frost']['backdrop'] = {'url': premium_uri(key, 86, rgb=True), 'screenRect': spec['screenRect'], 'anchors': spec['anchors']}
        elif family == 'frost': premium['frost'][name] = {'url': premium_uri(key), 'uw': spec['drawSize'][0], 'uh': spec['drawSize'][1], 'anchors': spec['anchors']}
    assert all(len(v) == 3 for v in premium['shards'].values()) and set(premium['glints']) == {'warm', 'cool', 'rose'}
    art['premium'] = premium

# Glaze v2 bricks (art/glaze2/build.py, from the M365 Copilot sheet): same keys and size as the Vault bricks above, which
# they replace at runtime (src/gfx.js), plus the two-hit glass frame (_x) and the Hoard coin and chest bricks.
glaze2_atlas = A('glaze2', 'atlas.json')
if os.path.exists(glaze2_atlas):
    art['glaze2'] = {}
    for name, s in json.load(open(glaze2_atlas, encoding='utf-8'))['sprites'].items():
        with Image.open(A('glaze2', s['file'])) as im:
            assert im.mode == 'RGBA' and list(im.size) == s['px'], f'Invalid glaze v2 brick: {name}'
            art['glaze2'][name] = {'url': uri(im, 92), 'uw': im.size[0] / PX, 'uh': im.size[1] / PX, 'margin': s['margin']}

# Tidewheel glaze bricks (art/tidewheel-glaze/build.py, re-glazed from the glaze v2 sheet): sea-glass, coral, pearl and
# brass-banded steel at the rafts' 34x18 footprint, intact / cracked / breaking. Small soft sprites, so lossy colour.
tg_atlas = A('tidewheel-glaze', 'atlas.json')
if os.path.exists(tg_atlas):
    art['tidewheelGlaze'] = {}
    for name, s in json.load(open(tg_atlas, encoding='utf-8'))['sprites'].items():
        with Image.open(A('tidewheel-glaze', s['file'])) as im:
            assert im.mode == 'RGBA' and not im.info and list(im.size) == s['px'], f'Invalid Tidewheel glaze brick: {name}'
            art['tidewheelGlaze'][name] = {'url': uri(im, 88), 'uw': s['drawSize'][0], 'uh': s['drawSize'][1], 'margin': s['margin']}

# Themed bricks (art/themed-bricks/build.py, re-glazed from the glaze v2 sheet): one set per princess chapter (frost, gatehouse,
# bellforge, tower for Lumi and Rivals, mooncoil, vault), keyed <material>_<cells>_<state>, plus each material's FX palette.
# Small soft sprites, so lossy colour (alpha stays lossless in WebP).
tb_root = A('themed-bricks')
if os.path.isdir(tb_root):
    art['themedBricks'] = {}
    for ch in sorted(os.listdir(tb_root)):
        tb_atlas = os.path.join(tb_root, ch, 'atlas.json')
        if not os.path.exists(tb_atlas): continue
        atlas = json.load(open(tb_atlas, encoding='utf-8')); art['themedBricks'][ch] = {'palette': atlas['palette'], 'sprites': {}}
        for name, s in atlas['sprites'].items():
            with Image.open(os.path.join(tb_root, ch, s['file'])) as im:
                assert im.mode == 'RGBA' and not im.info and list(im.size) == s['px'], f'Invalid themed brick: {ch}/{name}'
                art['themedBricks'][ch]['sprites'][name] = {'url': uri(im, 84), 'uw': s['drawSize'][0], 'uh': s['drawSize'][1], 'margin': s['margin']}

# Dragon's Hoard (art/hoard/build.py, from the M365 Copilot dragon kit): Ember's eight expression busts and the hoard props.
# Each sprite is drawn at drawSize with `anchor` on its model point; `contact` is the collider rect inside it (the Crown chest).
# Ember is scenery behind the cave ledge in this chapter: his measured circles travel with solid false for a later duel.
hoard_manifest = A('hoard', 'manifest.json')
if os.path.exists(hoard_manifest):
    hm = json.load(open(hoard_manifest, encoding='utf-8')); art['hoard'] = {}
    poses = {a for pose in hm['skins']['ember']['poses'].values() for a in pose['art'][:1]}
    for key, spec in hm['sprites'].items():
        # The eight M365 busts are only fallbacks behind the R01 full-body poses; ship them only if a pose render is missing.
        if key.startswith('ember_') and all(p in hm['sprites'] for p in poses): continue
        with Image.open(os.path.join(ROOT, spec['path'])) as im:
            assert im.mode == ('RGB' if key == 'cave' else 'RGBA') and not im.info and list(im.size) == spec['px'], f'Invalid hoard sprite: {key}'
            art['hoard'][key] = {k: spec[k] for k in ('anchor', 'contact', 'circles', 'solid', 'floor') if k in spec}
            # The cave plate is an opaque backdrop (lossy, like the keep plate); Ember and the larger props (gate, chest) are soft
            # renders (lossy colour, alpha stays lossless in WebP); small props stay lossless.
            url = uri(im, 84) if key == 'cave' else uri(im, 90) if key.startswith('ember') or im.width * im.height > 20000 else uri(im, 100, lossless=True)
            art['hoard'][key].update({'url': url, 'uw': spec['drawSize'][0], 'uh': spec['drawSize'][1]})

# Render round 2 (art/round2/build.py, owner renders R05 and R06): the glaze power-up capsules every chapter draws on its
# existing capsule rect, the armoured crate panels for Circuit and Forge and the Tidewheel splash frames. `body` is the solid
# art's rect inside the sprite (units), which the game fits to the object's collider.
round2_manifest = A('round2', 'manifest.json')
if os.path.exists(round2_manifest):
    art['round2'] = {}
    for key, spec in json.load(open(round2_manifest, encoding='utf-8'))['sprites'].items():
        with Image.open(os.path.join(ROOT, spec['path'])) as im:
            assert im.mode == 'RGBA' and not im.info and list(im.size) == spec['px'], f'Invalid round-2 sprite: {key}'
            art['round2'][key] = {'url': uri(im, 100, lossless=True), 'uw': spec['drawSize'][0], 'uh': spec['drawSize'][1], 'anchor': spec['anchor'], 'body': spec['body']}

out = os.path.join(ROOT, 'src', 'vault-art.js')
js = '// Rendered art for the Vault, generated by tools/pack_art.py from assets/. Do not edit by hand.\nexport const ART = ' + json.dumps(art) + ';\n'
open(out, 'w').write(js)
print(f'{out}: {len(js) / 1024:.0f} KB, sprites: {len(art["sprites"])}, princess: {"princess" in art}, snake: {"snake" in art}, plate: {"plate" in art}')
```
