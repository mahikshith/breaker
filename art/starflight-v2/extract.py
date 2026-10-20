from pathlib import Path
from collections import defaultdict
import hashlib
import json
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
SOURCE = Path(__file__).parent
OUT = ROOT / 'assets/starflight-v2'


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
    return sorted(groups.values(), key=lambda rows: sum(b-a for y, a, b in rows), reverse=True)


def normalize(im, rows, size):
    seed = Image.new('L', im.size)
    draw = ImageDraw.Draw(seed)
    for y, left, right in rows:
        draw.line((left, y, right-1, y), fill=255)
    support = seed.filter(ImageFilter.MaxFilter(25)).filter(ImageFilter.GaussianBlur(1.5))
    pixels = np.array(im)
    pixels[:, :, 3] = (pixels[:, :, 3].astype(np.uint16)*np.array(support)//255).astype(np.uint8)
    pixels[pixels[:, :, 3] < 2] = 0
    isolated = Image.fromarray(pixels)
    box = isolated.getchannel('A').getbbox()
    crop = isolated.crop(box)
    scale = min((size[0]-32)/crop.width, (size[1]-32)/crop.height)
    fitted = crop.resize((round(crop.width*scale), round(crop.height*scale)), Image.Resampling.LANCZOS)
    x = (size[0]-fitted.width)//2
    y = (size[1]-fitted.height)//2
    canvas = Image.new('RGBA', size)
    canvas.alpha_composite(fitted, (x, y))
    pixels = np.array(canvas)
    pixels[pixels[:, :, 3] == 0] = 0
    canvas = Image.fromarray(pixels)

    def uv(point):
        return [(x+(point[0]-box[0])*fitted.width/crop.width)/size[0],
                (y+(point[1]-box[1])*fitted.height/crop.height)/size[1]]

    return canvas, box, uv


def audit(path, im):
    a = np.array(im)
    assert im.mode == 'RGBA' and not Image.open(path).info
    assert not a[0, :, 3].any() and not a[-1, :, 3].any()
    assert not a[:, 0, 3].any() and not a[:, -1, 3].any()
    assert not a[a[:, :, 3] == 0, :3].any()
    return {'bytes': path.stat().st_size, 'metadata': {}, 'edgeAlphaMax': 0,
            'transparentFraction': float(np.mean(a[:, :, 3] == 0)),
            'decodedRGBABytes': im.width*im.height*4}


if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    source = SOURCE/'enemy-family-source-v1.png'
    im = Image.open(source).convert('RGBA')
    groups = components(np.array(im.getchannel('A')))
    source_sha = sha(source)
    specs = {
        'beetle': {'group': 5, 'size': [320, 288], 'displayWidth': 49,
                   'muzzles': [[263, 382], [455, 384]], 'engines': [[306, 36], [419, 36]],
                   'role': 'Armoured interceptor; paired downward barrel tips'},
        'frigate': {'group': 1, 'size': [448, 320], 'displayWidth': 88,
                    'muzzles': [[735, 351], [766, 345], [798, 340], [1048, 340], [1079, 346], [1111, 352]],
                    'batteries': [[766, 345], [1079, 346]],
                    'engines': [[806, 58], [877, 83], [968, 85], [1042, 58]],
                    'role': 'Broad missile frigate; two real three-tube launch racks'},
        'crescent': {'group': 3, 'size': [768, 544], 'displayWidth': 236,
                     'muzzles': [[143, 810], [367, 719], [591, 810]],
                     'engines': [[291, 441], [434, 442]],
                     'role': 'Crescent siege cruiser; three real barrels and open forward notch'},
        'asteroid': {'group': 4, 'size': [384, 384], 'displayWidth': 52,
                     'role': 'Ferric physical asteroid; detached far chips excluded from main mass'},
        'gravity': {'group': 0, 'size': [512, 448], 'displayWidth': 160,
                    'role': 'Gravity field source; soft volumetric image, no baked physical circle'},
        'wormhole': {'group': 2, 'size': [512, 448], 'displayWidth': 160,
                     'role': 'Folded dimensional tunnel source; visual effect, no implied teleport rule'},
    }
    manifest = {
        'version': 1, 'status': 'New sprite family; runtime admission and gameplay QA are separate',
        'source': source.relative_to(ROOT).as_posix(), 'sourceSHA256': source_sha,
        'pivotConvention': 'Normalized centre of full padded runtime canvas; anchors use that same UV space',
        'filter': 'linear', 'ships': {}, 'environment': {},
        'collisionNote': 'solidBounds are measured alpha bounds, not a collider. Preserve the crescent notch; do not use a full bounding rectangle.',
    }
    checks = {}
    for name, spec in specs.items():
        sprite, box, uv = normalize(im, groups[spec['group']], spec['size'])
        path = OUT/(name+'.png')
        sprite.save(path)
        solid = sprite.getchannel('A').point(lambda v: 255 if v >= 128 else 0).getbbox()
        entry = {'path': path.relative_to(ROOT).as_posix(), 'size': spec['size'], 'pivot': [.5, .5],
                 'display': [spec['displayWidth'], spec['displayWidth']*sprite.height/sprite.width],
                 'facing': 'down' if name in ['beetle', 'frigate', 'crescent'] else 'radial',
                 'role': spec['role'], 'sourceCrop': box, 'sourceSHA256': source_sha, 'sha256': sha(path),
                 'alphaBounds': sprite.getchannel('A').getbbox(),
                 'solidBounds': [solid[0]/sprite.width, solid[1]/sprite.height, solid[2]/sprite.width, solid[3]/sprite.height]}
        for key in ['muzzles', 'engines', 'batteries']:
            if key in spec:
                entry[key] = [uv(p) for p in spec[key]]
        manifest['ships' if name in ['beetle', 'frigate', 'crescent'] else 'environment'][name] = entry
        checks[name] = audit(path, sprite)
    (OUT/'manifest.json').write_text(json.dumps(manifest, indent=2)+'\n')
    (SOURCE/'asset-checks.json').write_text(json.dumps({'sourceSHA256': source_sha, 'assets': checks,
        'manifestSHA256': sha(OUT/'manifest.json'), 'totalBytes': sum(c['bytes'] for c in checks.values()),
        'totalDecodedRGBABytes': sum(c['decodedRGBABytes'] for c in checks.values())}, indent=2)+'\n')
    print(json.dumps({'manifestSHA256': sha(OUT/'manifest.json'), 'assets': list(specs)}))
