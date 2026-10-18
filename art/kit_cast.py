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
