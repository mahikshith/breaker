"""Power-icon family for the face-orb menus: Kit's castle powers, Lumi's song powers and the shared Ram Ball.
Same ortho rig, lights and AgX look as the bricks (art/render_vault_assets.py). Run from repo root with bpy 5.2:
python art/power_icons/power_icons.py            # every icon + manifest + proof sheet
python art/power_icons/power_icons.py arrows     # selected icons only (manifest keeps the others)
Each icon is an emblem on transparency; the menu card behind it stays code-drawn.
"""
from pathlib import Path
import sys, json, hashlib, math
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'art'))
import render_vault_assets as rig
import bpy, bmesh
from PIL import Image, ImageDraw
import numpy as np

HERE = Path(__file__).resolve().parent
OUT = ROOT / 'assets' / 'power-icons'
PROOF = HERE / 'proof'
for d in (OUT, PROOF, HERE / 'source'): d.mkdir(parents=True, exist_ok=True)
rig.TMP = str(HERE / 'source')
rig.THREADS = 4
U = rig.U
SIZE = 40  # game units per icon frame (4-unit margin included)


def M(name, hexc, rough=.3, metal=0., coat=.6, emit=None, strength=0.):
    return rig.mat(name, rig.srgb(hexc), rough=rough, metal=metal, coat=coat,
                   emit=rig.srgb(emit) if emit else None, emit_str=strength)


def place(o, x=0., z=0., y=-1., rot=0.):
    o.location = rig.at(x * U, z * U, y); o.rotation_euler[1] = o.rotation_euler[1] + rot
    return o


def slab(name, pts, depth, m, x=0., z=0., y=-1., rot=0., bevel=.06, segs=3):
    """Extrude a 2D outline (game units, x right, z up) toward the camera, with soft bevelled edges."""
    bm = bmesh.new()
    vs = [bm.verts.new((px * U, 0, pz * U)) for px, pz in pts]
    face = bm.faces.new(vs)
    ext = bmesh.ops.extrude_face_region(bm, geom=[face])
    bmesh.ops.translate(bm, vec=(0, -depth * U, 0), verts=[v for v in ext['geom'] if isinstance(v, bmesh.types.BMVert)])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(o); o.data.materials.append(m)
    b = o.modifiers.new('bevel', 'BEVEL'); b.width = bevel; b.segments = segs; b.limit_method = 'ANGLE'
    for p in me.polygons: p.use_smooth = True
    w = o.modifiers.new('normals', 'WEIGHTED_NORMAL'); w.keep_sharp = True
    return place(o, x, z, y, rot)


def sphere(name, r, m, x=0., z=0., y=-1.5):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r * U, segments=48, ring_count=24)
    o = bpy.context.object; bpy.ops.object.shade_smooth(); o.data.materials.append(m)
    return place(o, x, z, y)


def torus(name, major, minor, m, x=0., z=0., y=-1.5, tilt=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=major * U, minor_radius=minor * U, major_segments=64, minor_segments=16)
    o = bpy.context.object; bpy.ops.object.shade_smooth(); o.data.materials.append(m)
    o.rotation_euler = tilt
    return place(o, x, z, y)


def rod(name, length, r, m, x=0., z=0., y=-1.5, rot=0., verts=16):
    bpy.ops.mesh.primitive_cylinder_add(radius=r * U, depth=length * U, vertices=verts)
    o = bpy.context.object; bpy.ops.object.shade_smooth(); o.data.materials.append(m)
    return place(o, x, z, y, rot)


def cone(name, r, length, m, x=0., z=0., y=-1.5, rot=0., verts=4):
    bpy.ops.mesh.primitive_cone_add(radius1=r * U, depth=length * U, vertices=verts)
    o = bpy.context.object; o.data.materials.append(m)
    return place(o, x, z, y, rot)


def ring_pts(r, n, start=0., end=2 * math.pi):
    return [(r * math.cos(start + (end - start) * i / n), r * math.sin(start + (end - start) * i / n)) for i in range(n + 1)]


def star_pts(r, inner, n=5, phase=math.pi / 2):
    return [((r if i % 2 == 0 else inner) * math.cos(phase + i * math.pi / n),
             (r if i % 2 == 0 else inner) * math.sin(phase + i * math.pi / n)) for i in range(2 * n)]


def rotate(o, angle, cx=0., cz=0.):
    """Rotate an object around the camera axis about the icon point (cx, cz) in game units."""
    x0, _, z0 = rig.at(cx * U, cz * U, 0)
    dx, dz = o.location.x - x0, o.location.z - z0
    c, s = math.cos(angle), math.sin(angle)
    o.location.x, o.location.z = x0 + dx * c - dz * s, z0 + dx * s + dz * c
    o.rotation_euler[1] -= angle
    return o


def note(prefix, m, x, z, s=1., y=-1.6):
    """An eighth note: tilted oval head, stem and flag. Reused by every song icon."""
    head = slab(prefix + '_head', [(4 * s * math.cos(a), 2.8 * s * math.sin(a)) for a in [i * math.pi / 12 for i in range(24)]],
                2 * s, m, x, z, y, rot=math.radians(20), bevel=.05)
    stem = slab(prefix + '_stem', [(-.7 * s, 0), (.7 * s, 0), (.7 * s, 13 * s), (-.7 * s, 13 * s)], 1.6 * s, m, x + 3.2 * s, z, y, bevel=.04)
    flag = slab(prefix + '_flag', [(0, 13 * s), (1.4 * s, 13 * s), (6 * s, 8 * s), (5 * s, 5.5 * s), (1.4 * s, 9.5 * s), (0, 10 * s)],
                1.6 * s, m, x + 2.5 * s, z, y, bevel=.04)
    return [head, stem, flag]


# ---------------------------------------------------------------- emblems
def shield():  # BRICK WARD: Kit's steel heater shield carrying a little wall of gold bricks
    steel, enamel, gold = M('steel', '#dfe6f4', .24, .55, .7), M('ward_enamel', '#3f6fd6', .2, 0, .9), M('gold', '#ffc73d', .22, .85, .5)
    rim = [(-13, 13), (13, 13), (13, 2)] + [(13 * (1 - t) ** 1.2, 2 - 17 * t ** .9) for t in [i / 10 for i in range(1, 11)]] + \
        [(-13 * t ** 1.2, 2 - 17 * (1 - t) ** .9) for t in [i / 10 for i in range(1, 10)]] + [(-13, 2)]
    face = [(px * .8, pz * .8 + .6) for px, pz in rim]
    objs = [slab('rim', rim, 2.4, steel, y=-1.0, bevel=.12), slab('face', face, 1.0, enamel, y=-1.24, bevel=.08)]
    for row, (z, xs) in enumerate([(-1, (-5.2, 0, 5.2)), (3.6, (-2.6, 2.6))]):
        for bx in xs: objs.append(slab(f'brick{row}{bx}', [(-2.3, -1.9), (2.3, -1.9), (2.3, 1.9), (-2.3, 1.9)], 1.2, gold, bx, z, -1.36, bevel=.06))
    return objs


def arrows():  # ARROWS: a fanned volley of three bodkin arrows with coral fletching
    wood, steel, fletch = M('shaft', '#c08a5a', .4, 0, .5), M('bodkin', '#eef2fb', .22, .55, .8), M('fletch', '#ff6f61', .3, 0, .8)
    objs = []
    # Three arrows in flight, staggered so each head and fletching reads on its own at menu size.
    for i, (dx, dz, ang) in enumerate(((-8.5, -3, .16), (0, 1.5, 0), (8.5, -3, -.16))):
        part = [rod(f'shaft{i}', 22, 1.05, wood, dx, dz - 2, -1.5),
                cone(f'head{i}', 3.3, 7.5, steel, dx, dz + 12, -1.5, verts=4),
                slab(f'fl{i}a', [(0, 0), (3.2, -2), (3.2, -6.6), (0, -4.6)], .6, fletch, dx + .7, dz - 7.5, -1.55, bevel=.03),
                slab(f'fl{i}b', [(0, 0), (-3.2, -2), (-3.2, -6.6), (0, -4.6)], .6, fletch, dx - .7, dz - 7.5, -1.55, bevel=.03)]
        for o in part: rotate(o, ang, dx, dz)
        objs += part
    return objs


def cosmic():  # COSMIC: violet starglass orb with a tilted silver ring and star specks
    orb = M('cosmic_orb', '#6d35d8', .1, 0, 1, emit='#9b6bff', strength=.45)
    silver, star = M('ring', '#eef1f9', .2, .55, .7), M('speck', '#ffffff', .2, 0, 0, emit='#fff4d6', strength=12)
    objs = [sphere('orb', 10.5, orb, y=-1.5), torus('ring', 14.5, .9, silver, y=-1.5, tilt=(math.radians(74), math.radians(-24), 0))]
    for i, (x, z, r) in enumerate([(-4, 4, .9), (3, 6, .6), (5, -2, .8), (-2, -5, .5), (1, 1, .45)]):
        objs.append(sphere(f'speck{i}', r, star, x, z, -2.75))
    return objs


def five():  # BALL FAN: five chrome balls fanned from the paddle
    chrome = M('chrome', '#e3e9f5', .18, .5, .9)
    return [sphere(f'b{i}', 4.6 - abs(i - 2) * .5, chrome, 12.5 * math.sin(a), -9 + 15 * math.cos(a), -1.5)
            for i, a in enumerate([-1.05, -.52, 0, .52, 1.05])]


def lullaby():  # LULLABY: pearl crescent moon cradling a pink note
    pearl, pink = M('pearl', '#e9e4ff', .18, .1, 1, emit='#cbbcff', strength=.25), M('song_pink', '#ff7fb6', .2, 0, .9)
    outer, inner = ring_pts(13, 32, math.radians(60), math.radians(300)), ring_pts(10.5, 32, math.radians(300), math.radians(60))
    inner = [(x + 5.5, z) for x, z in inner]
    return [slab('moon', outer + inner, 2.6, pearl, -2, 0, -1.0, bevel=.14)] + note('n', pink, 3, -5, .95, -1.8)


def starlight():  # STARLIGHT NOTES: faceted gold star shedding two notes
    gold, pink, teal = M('star_gold', '#ffbf2e', .22, .45, .8, emit='#ffc04d', strength=.35), M('note_pink', '#ff7fb6', .2, 0, .9), M('note_teal', '#22c4b0', .2, 0, .9)
    return [slab('star', star_pts(12, 5.4), 3, gold, -3, 3, -1.0, bevel=.4, segs=2)] + note('a', pink, 7, -14, .7, -1.8) + note('b', teal, -13, -15, .55, -1.8)


def songshield():  # SONG SHIELD: a sung rose-glass arc over the paddle lane, gold rim
    glass, gold = M('rose_glass', '#ff6fae', .12, 0, 1, emit='#ff5fa2', strength=.45), M('rim_gold', '#ffcf6a', .24, .5, .7)
    band = ring_pts(15, 40, math.radians(15), math.radians(165)) + ring_pts(10, 40, math.radians(165), math.radians(15))
    lip = ring_pts(15.9, 40, math.radians(13), math.radians(167)) + ring_pts(14.4, 40, math.radians(167), math.radians(13))
    objs = [slab('band', [(x, z - 9) for x, z in band], 2.2, glass, y=-1.1, bevel=.12),
            slab('lip', [(x, z - 9) for x, z in lip], 2.8, gold, y=-1.0, bevel=.08)]
    return objs + note('s', gold, -1.5, -2, .7, -1.8)


def ram_steel():  # RAM BALL (Kit skin): chrome battering ball with curled gold horns
    chrome, horn = M('ram_chrome', '#d6deee', .2, .5, .9), M('horn', '#f0bd5c', .3, .5, .6)
    objs = [sphere('ram', 10, chrome, y=-1.5)]
    for sx in (-1, 1):
        objs.append(torus(f'horn{sx}', 4.2, 1.5, horn, sx * 10.5, 2, -1.8, tilt=(math.radians(90), 0, 0)))
    return objs


def ram_song():  # RAM BALL (Lumi skin): pink pearl song sphere with an inlaid gold note
    pearl, gold = M('song_pearl', '#ff8fc4', .12, .15, 1, emit='#ff7fb6', strength=.35), M('inlay', '#ffd77a', .24, .5, .7)
    return [sphere('song', 11, pearl, y=-1.2)] + note('i', gold, -2, -4, .75, -2.6)


def moonbind():  # MOONBIND (Mooncoil): violet moonstone crescent wrapped by a silver binding ring
    stone, silver = M('moonstone', '#9a73de', .14, .1, 1, emit='#b48cff', strength=.3), M('bind_silver', '#e6ecf8', .2, .55, .8)
    outer, inner = ring_pts(12.5, 32, math.radians(60), math.radians(300)), ring_pts(10, 32, math.radians(300), math.radians(60))
    inner = [(x + 5, z) for x, z in inner]
    return [slab('crescent', outer + inner, 3, stone, -2, 0, -1.0, bevel=.18),
            torus('bind', 11, .9, silver, -1, 0, -1.6, tilt=(math.radians(70), math.radians(35), 0))]


def ricochet():  # CRYSTALS (Mooncoil): two faceted teal crystal bolts crossing
    teal = M('crystal', '#39d6c2', .08, 0, 1, emit='#7ff5e4', strength=.5)
    shard = [(0, 12), (3.2, 4), (2.2, -10), (0, -13), (-2.2, -10), (-3.2, 4)]
    return [slab(f'shard{i}', shard, 3, teal, x, 0, -1.2 - i * .4, rot=a, bevel=.35, segs=1) for i, (x, a) in enumerate(((0, .55), (0, -.55)))]


ICONS = {  # id -> (builder, owner, label)
    'moonbind': (moonbind, 'kit', 'MOONBIND'), 'ricochet': (ricochet, 'kit', 'CRYSTALS'),
    'shield': (shield, 'kit', 'BRICK WARD'), 'arrows': (arrows, 'kit', 'ARROWS'), 'titan': (cosmic, 'kit', 'COSMIC'),
    'five': (five, 'kit', 'BALL FAN'), 'lullaby': (lullaby, 'lumi', 'LULLABY'), 'starlight': (starlight, 'lumi', 'STARLIGHT NOTES'),
    'songshield': (songshield, 'lumi', 'SONG SHIELD'), 'ram_steel': (ram_steel, 'kit', 'RAM BALL'), 'ram_song': (ram_song, 'lumi', 'RAM BALL'),
}


def clean(path):
    im = Image.open(path).convert('RGBA'); a = np.asarray(im).copy(); a[a[:, :, 3] == 0, :3] = 0
    im = Image.fromarray(a); im.save(path, optimize=True)
    bounds = im.getchannel('A').getbbox(); assert bounds and bounds[0] > 0 and bounds[1] > 0 and bounds[2] < im.width and bounds[3] < im.height, f'{path} touches the edge'
    return im, bounds


def main():
    pick = [a for a in sys.argv[1:] if a in ICONS] or list(ICONS)
    target = OUT / 'icons-manifest.json'
    icons = json.loads(target.read_text())['icons'] if target.exists() else {}
    sc = rig.reset(); sc.cycles.seed = 41
    for key in pick:
        for o in list(bpy.context.scene.objects):
            if o.type in ('MESH', 'CURVE') and o.name != 'softbox': bpy.data.objects.remove(o, do_unlink=True)
        build, owner, label = ICONS[key]
        objs = build(); rig.only(objs)
        path = OUT / f'{key}.png'
        rig.frame(sc, rig.P0[0] - SIZE / 2, rig.P0[1] - SIZE / 2, SIZE, SIZE, 3, str(path), True, 48)
        im, bounds = clean(path)
        icons[key] = {'path': path.relative_to(ROOT).as_posix(), 'owner': owner, 'label': label, 'px': list(im.size), 'ppu': 3,
                      'drawSize': [SIZE, SIZE], 'artBounds': [round(v / im.width, 4) for v in (bounds[0], bounds[1], bounds[2] - bounds[0], bounds[3] - bounds[1])],
                      'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'encodedBytes': path.stat().st_size}
    icons = {k: icons[k] for k in ICONS if k in icons}
    target.write_text(json.dumps({'version': 1, 'source': 'art/power_icons/power_icons.py', 'rig': 'art/render_vault_assets.py',
                                  'scope': 'Blender Cycles CPU4, 48 samples; shared Vault ortho rig and AgX look. Emblem only; menu cards stay code-drawn. Ids match level power ids.',
                                  'icons': icons}, indent=2) + '\n')
    # Proof: large renders on the Kit armoury card colour, then native menu size (about 30 px) beside each.
    sheet = Image.new('RGBA', (6 * 150, 2 * 170), (48, 35, 51, 255)); d = ImageDraw.Draw(sheet)
    for i, (key, item) in enumerate(icons.items()):
        x, y = 10 + (i % 6) * 150, 10 + (i // 6) * 170
        d.rounded_rectangle((x, y, x + 140, y + 158), 12, fill=(73, 52, 71, 255))
        im = Image.open(ROOT / item['path']).convert('RGBA'); sheet.alpha_composite(im, (x + 10, y + 6))
        sheet.alpha_composite(im.resize((30, 30), Image.Resampling.LANCZOS), (x + 105, y + 120))
        d.text((x + 8, y + 132), f"{item['label']}\n{item['owner']}", fill=(255, 241, 252, 255))
    sheet.convert('RGB').save(PROOF / 'icons.png', optimize=True)
    print(json.dumps({'icons': len(icons), 'bytes': sum(v['encodedBytes'] for v in icons.values())}), flush=True)


if __name__ == '__main__': main()
