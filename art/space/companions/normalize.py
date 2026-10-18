"""Normalize approved-reference portrait/action families without changing their painted poses."""
from collections import deque
from hashlib import sha256
import json
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
OUT = ROOT / 'assets/space-companions'
PROOF = ROOT / 'out/carrier-companion-proof'
OUT.mkdir(parents=True, exist_ok=True)
PROOF.mkdir(parents=True, exist_ok=True)


def digest(path):
    return sha256(path.read_bytes()).hexdigest()


def main_component(mask):
    h, w = mask.shape
    seen = np.zeros_like(mask)
    best = []
    for y, x in zip(*np.nonzero(mask)):
        if seen[y, x]:
            continue
        todo = deque([(int(x), int(y))])
        seen[y, x] = True
        comp = []
        while todo:
            xx, yy = todo.popleft()
            comp.append((xx, yy))
            for nx, ny in ((xx-1, yy), (xx+1, yy), (xx, yy-1), (xx, yy+1)):
                if 0 <= nx < w and 0 <= ny < h and mask[ny, nx] and not seen[ny, nx]:
                    seen[ny, nx] = True
                    todo.append((nx, ny))
        if len(comp) > len(best):
            best = comp
    result = np.zeros_like(mask, dtype=np.uint8)
    for x, y in best:
        result[y, x] = 255
    return Image.fromarray(result)


def clean_frame(im):
    px = np.array(im)
    main = main_component(px[:, :, 3] > 100)
    bounds = main.getbbox()
    assert bounds
    keep = np.array(main.filter(ImageFilter.MaxFilter(7)))
    removed = int(np.count_nonzero((px[:, :, 3] > 3) & (keep == 0)))
    px[:, :, 3][(keep == 0) | ((np.array(main) == 0) & (px[:, :, 3] > 100)) | (px[:, :, 3] < 3)] = 0
    px[px[:, :, 3] == 0, :3] = 0
    return Image.fromarray(px), bounds, removed


families = {
    'nix': {'source': 'nix-family-original.png', 'grid': [4, 3], 'cell': 256, 'visibleWidth': 226,
            'regions': [[14,56,385,350],[378,58,728,348],[727,57,1082,349],[1074,55,1436,348],
                        [13,392,380,688],[376,392,726,680],[725,392,1083,680],[1085,397,1437,688],
                        [17,721,377,1015],[373,717,731,1008],[722,717,1085,1011],[1079,717,1439,1010]],
            'display': [52, 52], 'displaySpace': 'CSS pixels', 'pivot': [.5, .5],
            'names': ['calm', 'focused', 'worried', 'relieved', 'sorrow', 'surprised',
                      'command_anticipate', 'command_blink', 'command_release', 'command_rise', 'command_settle', 'cheer'],
            'clips': {'idle': {'frames': [0], 'fps': 1, 'loop': True}, 'ready': {'frames': [1], 'fps': 1, 'loop': True},
                      'warning': {'frames': [2], 'fps': 1, 'loop': True}, 'secured': {'frames': [3], 'fps': 1, 'loop': False},
                      'loss': {'frames': [4], 'fps': 1, 'loop': False}, 'surprise': {'frames': [5], 'fps': 1, 'loop': False},
                      'command': {'frames': [6, 7, 8, 9, 10, 0], 'fps': 10, 'loop': False},
                      'win': {'frames': [11], 'fps': 1, 'loop': False}}},
    'tick': {'source': 'tick-secure-original.png', 'grid': [4, 2], 'cell': 192, 'visibleWidth': 163,
             'display': [40, 40], 'displaySpace': 'world units', 'pivot': [.5, .84375],
             'names': ['neutral', 'reach', 'align', 'clamp', 'turn', 'retract', 'pleased', 'secured'],
             'clips': {'idle': {'frames': [0], 'fps': 1, 'loop': True},
                       'secure': {'frames': list(range(8)), 'fps': 10, 'duration': .8, 'loop': False},
                       'secured': {'frames': [7], 'fps': 1, 'loop': False}}}
}
manifest = {'version': 1, 'status': 'Native-size expression/action candidate; owner and runtime admission pending',
            'reference': 'design/phase1/img/space-carrier-a.png', 'referenceSHA256': digest(ROOT/'design/phase1/img/space-carrier-a.png'),
            'prompts': 'art/space/companions/production-prompts.json', 'normalizer': 'art/space/companions/normalize.py',
            'sourcePolicy': 'Returned original PNGs retained byte-for-byte. Final cells use connected-alpha cleanup, a shared family scale and measured registration only; poses are not repainted.',
            'filter': 'linear', 'collision': 'presentation only; no ball or hostile collision', 'families': {}}
font = ImageFont.truetype(str(ROOT/'out/brum-proof/Rubik.ttf'), 15)
for name, spec in families.items():
    source = HERE/'source'/spec['source']
    original = Image.open(source).convert('RGBA')
    cols, rows = spec['grid']
    frames = []
    for i in range(cols*rows):
        x, y = i % cols, i // cols
        region = spec['regions'][i] if 'regions' in spec else [round(x*original.width/cols), round(y*original.height/rows), round((x+1)*original.width/cols), round((y+1)*original.height/rows)]
        cleaned, bounds, removed = clean_frame(original.crop(region))
        if name == 'nix':
            a = np.array(cleaned)
            orange = (a[:, :, 0] > 150) & (a[:, :, 1] > 65) & (a[:, :, 1] < 200) & (a[:, :, 2] < 90) & (a[:, :, 3] > 128)
            orange[:int(cleaned.height*.62)] = False
            yy, xx = np.nonzero(orange)
            assert len(xx) > 5
            anchor = [float(np.median(xx)), float(np.median(yy))]
        else:
            anchor = [(bounds[0]+bounds[2])/2, bounds[3]]
        frames.append({'im': cleaned, 'bounds': bounds, 'anchor': anchor, 'region': region, 'removed': removed})
    factor = spec['visibleWidth']/max(f['bounds'][2]-f['bounds'][0] for f in frames)
    size = spec['cell']
    target = [size*.5, size*.8625] if name == 'nix' else [size*.5, size*.84375]
    atlas = Image.new('RGBA', (cols*size, rows*size))
    sheet = Image.new('RGBA', (cols*(size+24), rows*(size+52)), '#101827')
    sheet_draw = ImageDraw.Draw(sheet)
    row = {'atlas': f'assets/space-companions/{name}.png', 'cell': [size, size], 'columns': cols, 'rows': rows,
           'display': spec['display'], 'displaySpace': spec['displaySpace'], 'pivot': spec['pivot'], 'clips': spec['clips'],
           'source': source.relative_to(ROOT).as_posix(), 'sourceSHA256': digest(source), 'uniformScale': factor, 'frames': []}
    native_sheet = Image.new('RGBA', (cols*140, rows*115), '#090f1d')
    nd = ImageDraw.Draw(native_sheet)
    final = []
    for i, frame in enumerate(frames):
        im = frame['im']
        resized = im.resize((round(im.width*factor), round(im.height*factor)), Image.Resampling.LANCZOS)
        offset = [round(target[j]-frame['anchor'][j]*factor) for j in range(2)]
        cell = Image.new('RGBA', (size, size))
        cell.alpha_composite(resized, offset)
        alpha = np.array(cell.getchannel('A'))
        solid = cell.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
        assert solid and min(solid[0], solid[1], size-solid[2], size-solid[3]) >= 4, (name, i, solid)
        px = np.array(cell);px[px[:, :, 3] == 0, :3] = 0;cell = Image.fromarray(px)
        path = OUT/f'{name}_{spec["names"][i]}.png'
        cell.save(path)
        with Image.open(path) as check:
            assert check.mode == 'RGBA' and not check.info and check.getchannel('A').getextrema() == (0, 255)
        atlas.alpha_composite(cell, ((i % cols)*size, (i // cols)*size))
        sx, sy = (i % cols)*(size+24)+12, (i // cols)*(size+52)+8
        sheet.alpha_composite(cell, (sx, sy));sheet_draw.text((sx, sy+size+9), spec['names'][i], fill='#dce5ef', font=font)
        native = cell.resize((52, 52) if name == 'nix' else (44, 44), Image.Resampling.LANCZOS)
        nx, ny = (i % cols)*140+44, (i // cols)*115+8
        native_sheet.alpha_composite(native, (nx, ny));nd.text(((i % cols)*140+8, ny+68), spec['names'][i].replace('command_', ''), fill='#dce5ef', font=font)
        row['frames'].append({'index': i, 'name': spec['names'][i], 'path': path.relative_to(ROOT).as_posix(),
                              'sha256': digest(path), 'sourceRegion': frame['region'], 'sourceBounds': frame['bounds'],
                              'sourceAnchor': frame['anchor'], 'registrationOffset': offset, 'alphaBounds': cell.getchannel('A').getbbox(),
                              'solidAlphaBounds': solid, 'removedDisconnectedAlphaPixels': frame['removed']})
        final.append(cell)
    atlas_path = ROOT/row['atlas'];atlas.save(atlas_path);row['sha256'] = digest(atlas_path)
    sheet.save(PROOF/f'{name}-working.png');native_sheet.save(PROOF/f'{name}-native.png')
    indices = spec['clips']['command' if name == 'nix' else 'secure']['frames']
    previews=[]
    for i in indices:
        bg=Image.new('RGBA',(size,size),'#0c1424');bg.alpha_composite(final[i]);previews.append(bg.convert('RGB'))
    previews[0].save(PROOF/f'{name}-motion.gif',save_all=True,append_images=previews[1:],duration=[100]*len(previews),loop=0,disposal=2)
    row['totalEncodedPNGBytes'] = sum((ROOT/f['path']).stat().st_size for f in row['frames'])+atlas_path.stat().st_size
    row['atlasRGBABytes'] = cols*rows*size*size*4
    manifest['families'][name]=row
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
alpha_report = {'scope': 'Canonical RGBA/source checks; not production admission', 'families': {}}
for name, row in manifest['families'].items():
    atlas_path = ROOT/row['atlas']
    assert digest(ROOT/row['source']) == row['sourceSHA256']
    with Image.open(atlas_path) as atlas_check:
        assert atlas_check.mode == 'RGBA' and not atlas_check.info
    bounds = [f['solidAlphaBounds'] for f in row['frames']]
    alpha_report['families'][name] = {'sourceSHA256': row['sourceSHA256'], 'atlasSHA256': row['sha256'],
        'encodedAtlasBytes': atlas_path.stat().st_size, 'decodedAtlasRGBABytes': row['atlasRGBABytes'],
        'minimumSolidPadding': min(min(b[0],b[1],row['cell'][0]-b[2],row['cell'][1]-b[3]) for b in bounds),
        'frameSolidBounds': bounds, 'metadataStripped': True, 'sourceUnchanged': True}
(PROOF/'alpha-report.json').write_text(json.dumps(alpha_report,indent=2)+'\n',encoding='utf-8')
print(json.dumps({name:{'frames':len(row['frames']),'cell':row['cell'],'atlas':row['atlas'],'sha256':row['sha256']} for name,row in manifest['families'].items()},indent=2))
