# Pack rendered Blender art into src/vault-art.js as WebP data URIs (so the game stays a single file).
# Run: python3 tools/pack_art.py
import base64, io, json, os, glob, hashlib
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
A = lambda *p: os.path.join(ROOT, 'assets', *p)
PX = 3  # rendered pixels per game unit

def uri(im, q=88):
    b = io.BytesIO(); im.save(b, 'WEBP', quality=q, method=6); return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()

art = {'sprites': {}}

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
for key, directory in [('snake', 'snake'), ('snakeJade', 'snake-jade')]:
    meta_path = A(directory, 'meta.json')
    if not os.path.exists(meta_path): continue
    meta = json.load(open(meta_path)); px = meta['px']; cell = meta['box'] * px
    exprs, dirs = meta['expressions'], meta['dirs']
    sheet = Image.new('RGBA', (len(exprs) * cell, len(dirs) * cell))
    for r, d in enumerate(dirs):
        for c, e in enumerate(exprs): sheet.paste(Image.open(A(directory, f'head_{e}_{d}.png')), (c * cell, r * cell))
    art[key] = {'url': uri(sheet, 86), 'cell': cell, 'unit': meta['box'],
                'expr': {e: i for i, e in enumerate(exprs)}, 'dir': {d: i for i, d in enumerate(dirs)}}

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

out = os.path.join(ROOT, 'src', 'vault-art.js')
js = '// Rendered art for the Vault, generated by tools/pack_art.py from assets/. Do not edit by hand.\nexport const ART = ' + json.dumps(art) + ';\n'
open(out, 'w').write(js)
print(f'{out}: {len(js) / 1024:.0f} KB, sprites: {len(art["sprites"])}, princess: {"princess" in art}, snake: {"snake" in art}, plate: {"plate" in art}')
