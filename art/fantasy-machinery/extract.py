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
