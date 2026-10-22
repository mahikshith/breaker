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
for key, directory in [('snake', 'snake'), ('snakeJade', 'snake-jade'), ('snakeEmerald', 'snake-emerald')]:
    meta_path = A(directory, 'meta.json')
    if not os.path.exists(meta_path): continue
    meta = json.load(open(meta_path)); px = meta['px']; cell = int(meta.get('cell', round(meta['box'] * px)))
    exprs, dirs = meta['expressions'], meta['dirs']
    sheet = Image.new('RGBA', (len(exprs) * cell, len(dirs) * cell))
    for r, d in enumerate(dirs):
        for c, e in enumerate(exprs): sheet.paste(Image.open(A(directory, f'head_{e}_{d}.png')), (c * cell, r * cell))
    art[key] = {'url': uri(sheet, 94 if key == 'snakeEmerald' else 86), 'cell': cell, 'unit': meta['box'],
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

out = os.path.join(ROOT, 'src', 'vault-art.js')
js = '// Rendered art for the Vault, generated by tools/pack_art.py from assets/. Do not edit by hand.\nexport const ART = ' + json.dumps(art) + ';\n'
open(out, 'w').write(js)
print(f'{out}: {len(js) / 1024:.0f} KB, sprites: {len(art["sprites"])}, princess: {"princess" in art}, snake: {"snake" in art}, plate: {"plate" in art}')
