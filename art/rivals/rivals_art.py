"""Serpent Rivals art (BREACH, Kit castle chapter): rune lures, the Twin Seal door + ward plates, the Clash Chamber
floor plate, the shuttered window front and the clash impact burst.
Same ortho rig, lights and AgX look as the castle window kit / Vault (art/render_vault_assets.py).

Run from the repo root with bpy 5.2 as a Python module:
  python3 art/rivals/rivals_art.py                 # everything + manifest + proof sheets
  python3 art/rivals/rivals_art.py lure seal       # only some groups (manifest keeps the others)
  python3 art/rivals/rivals_art.py sheet           # proof / contact sheets only
Groups: lure, seal, plate, chamber, shutter, clash.  Add --fast for a quick low-sample look.
Coordinates: game units, u right / v up from the sprite centre; depth y in metres (negative = toward the camera).
"""
from pathlib import Path
import sys, json, hashlib, math, random, os
sys.dont_write_bytecode = True     # importing the window kit must not leave caches in art/castle
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'art')); sys.path.insert(0, str(ROOT / 'art' / 'castle'))
import render_vault_assets as rig
import window_kit as wk          # the castle window frame (exact same build_front, seed and materials)
import bpy, bmesh, mathutils
from PIL import Image, ImageDraw, ImageFilter, ImageChops
import numpy as np

HERE = Path(__file__).resolve().parent
OUT = ROOT / 'assets' / 'rivals'
PROOF = HERE / 'proof'
SRC = HERE / 'source'
for d in (OUT, PROOF, SRC): d.mkdir(parents=True, exist_ok=True)
rig.TMP = str(SRC)
rig.THREADS = 4
U = rig.U
FAST = '--fast' in sys.argv
PPU = 4                          # small props render at 4 px/unit (>= a 3x phone at 360u width)
MANIFEST = OUT / 'manifest.json'
TINT = {'gnash': dict(glaze='#18b892', deep='#0d4a45', glow='#2ef0a8', name='emerald'),
        'mooncoil': dict(glaze='#8c58f0', deep='#3a2170', glow='#a066ff', name='violet')}


def samples(n):
    return max(12, n // 4) if FAST else n


# ---------------------------------------------------------------- geometry helpers (units in, metres out)
def P(u, v, y=0.0):
    return rig.at(u * U, v * U, y)


def _link(name, bm, m):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(o)
    if isinstance(m, (list, tuple)):
        for mm in m: o.data.materials.append(mm)
    elif m is not None: o.data.materials.append(m)
    return o


def _finish(o, bevel=0.0, segs=2, smooth_angle=40, limit='ANGLE'):
    bpy.context.view_layer.objects.active = o
    for s in bpy.context.selected_objects: s.select_set(False)
    o.select_set(True)
    if bevel:
        md = o.modifiers.new('b', 'BEVEL'); md.width = bevel; md.segments = segs; md.limit_method = limit
        if limit == 'ANGLE': md.angle_limit = math.radians(30)
        md.harden_normals = False
        bpy.ops.object.modifier_apply(modifier='b')
    bpy.ops.object.shade_smooth_by_angle(angle=math.radians(smooth_angle))
    o.select_set(False)
    return o


def prism(name, pts, y_front, y_back, m, bevel=0.0, segs=2, smooth_angle=40):
    """Polygon (units, u right / v up) extruded between depths y_front (nearer the camera) and y_back (metres)."""
    bm = bmesh.new()
    f = [bm.verts.new(P(u, v, y_front)) for u, v in pts]
    b = [bm.verts.new(P(u, v, y_back)) for u, v in pts]
    bm.faces.new(f); bm.faces.new(b[::-1])
    n = len(pts)
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new((f[i], b[i], b[j], f[j]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    o = _link(name, bm, m)
    return _finish(o, bevel, segs, smooth_angle)


def rrect(w, h, r, n=5, cx=0.0, cy=0.0):
    """rounded rectangle outline, counter-clockwise"""
    pts = []
    for qx, qy, a0 in ((1, 1, 0), (-1, 1, 90), (-1, -1, 180), (1, -1, 270)):
        ox, oy = cx + qx * (w / 2 - r), cy + qy * (h / 2 - r)
        for i in range(n + 1):
            a = math.radians(a0 + 90 * i / n)
            pts.append((ox + r * math.cos(a), oy + r * math.sin(a)))
    return pts


def octagon(w, h, c, cx=0.0, cy=0.0):
    x, y = w / 2, h / 2
    return [(cx + x, cy - y + c), (cx + x, cy + y - c), (cx + x - c, cy + y), (cx - x + c, cy + y), (cx - x, cy + y - c),
            (cx - x, cy - y + c), (cx - x + c, cy - y), (cx + x - c, cy - y)]


def stroke_poly(path, widths):
    """thick polyline outline: path [(u,v)], widths per point (full width, units)"""
    left, right = [], []
    for i, (x, y) in enumerate(path):
        a = path[max(0, i - 1)]; b = path[min(len(path) - 1, i + 1)]
        tx, ty = b[0] - a[0], b[1] - a[1]; L = math.hypot(tx, ty) or 1
        nx, ny = -ty / L, tx / L; h = widths[i] / 2
        left.append((x + nx * h, y + ny * h)); right.append((x - nx * h, y - ny * h))
    return left + right[::-1]


def tube(name, path, radii, m, y_mid, flat=0.6, segs=18, cap_head=True):
    """relief tube along a 2D path (units); radii per point (units); flattened toward the wall by `flat`.
    Closed at both ends (tail tip collapses to a point when its radius is ~0)."""
    bm = bmesh.new(); rings = []
    for i, (x, y) in enumerate(path):
        a = path[max(0, i - 1)]; b = path[min(len(path) - 1, i + 1)]
        tx, ty = b[0] - a[0], b[1] - a[1]; L = math.hypot(tx, ty) or 1
        nx, ny = -ty / L, tx / L; r = max(radii[i], 0.02)
        ring = []
        for k in range(segs):
            t = 2 * math.pi * k / segs
            ring.append(bm.verts.new(P(x + nx * r * math.cos(t), y + ny * r * math.cos(t), y_mid - r * U * flat * math.sin(t))))
        rings.append(ring)
    for i in range(len(rings) - 1):
        for k in range(segs):
            j = (k + 1) % segs
            bm.faces.new((rings[i][k], rings[i][j], rings[i + 1][j], rings[i + 1][k]))
    bm.faces.new(rings[0][::-1]); bm.faces.new(rings[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    o = _link(name, bm, m)
    return _finish(o, 0, smooth_angle=80)


def blob(name, m, u, v, y, rx, ry, rz, rot=0.0, segs=40):
    """ellipsoid: rx along u, ry along v (units), rz depth (units); rot = in-plane rotation (radians, ccw)"""
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=segs, ring_count=segs // 2, location=P(u, v, y))
    o = bpy.context.object; o.name = name
    o.scale = (rx * U, rz * U, ry * U); o.rotation_euler = (0, -rot, 0)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    bpy.ops.object.shade_smooth(); o.data.materials.append(m); o.select_set(False)
    return o


def cut(o, cutter, remove=True, smooth=30):
    md = o.modifiers.new('cut', 'BOOLEAN'); md.operation = 'DIFFERENCE'; md.object = cutter; md.solver = 'EXACT'
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.modifier_apply(modifier='cut')
    if remove: bpy.data.objects.remove(cutter, do_unlink=True)
    for s in bpy.context.selected_objects: s.select_set(False)
    o.select_set(True); bpy.ops.object.shade_smooth_by_angle(angle=math.radians(smooth)); o.select_set(False)
    return o


def rivet(name, m, u, v, y, r=0.9):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r * U, segments=20, ring_count=10, location=P(u, v, y))
    o = bpy.context.object; o.name = name; o.scale = (1, 0.55, 1)
    bpy.ops.object.transform_apply(scale=True); bpy.ops.object.shade_smooth(); o.data.materials.append(m); o.select_set(False)
    return o


def clear_meshes():
    for o in list(bpy.context.scene.objects):
        if o.type in ('MESH', 'CURVE') and o.name != 'softbox': bpy.data.objects.remove(o, do_unlink=True)
    for o in list(bpy.context.scene.objects):
        if o.type == 'LIGHT' and o.name.startswith('fx_'): bpy.data.objects.remove(o, do_unlink=True)


def point_light(name, u, v, y, energy, color, radius=0.4):
    bpy.ops.object.light_add(type='POINT', location=P(u, v, y))
    lo = bpy.context.object; lo.name = 'fx_' + name; lo.data.energy = energy; lo.data.color = color
    lo.data.shadow_soft_size = radius
    return lo


def area_light(name, loc_uvy, target_uvy, energy, size, color):
    bpy.ops.object.light_add(type='AREA', location=P(*loc_uvy))
    lo = bpy.context.object; lo.name = 'fx_' + name; lo.data.energy = energy; lo.data.size = size; lo.data.color = color
    d = mathutils.Vector(P(*target_uvy)) - lo.location
    lo.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    return lo


# ---------------------------------------------------------------- materials
def M(name, hexc, rough=.4, metal=0., coat=0., coat_rough=.05, emit=None, strength=0.):
    return rig.mat(name, rig.srgb(hexc), rough=rough, metal=metal, coat=coat, coat_rough=coat_rough,
                   emit=rig.srgb(emit) if emit else None, emit_str=strength)


def stone_mat(name, hexc='#363b4f', c2='#23273a', scale=7, coat=0.25, bump=0.35, pits=0.0):
    """castle stone: the window kit's hewn blue-grey stone; pits > 0 adds a voronoi chisel grain"""
    m = M(name, hexc, rough=0.78, coat=coat, coat_rough=0.25)
    m = rig.noisy(m, scale=scale, amount=0.4, bump=bump, detail=8, color2=rig.srgb(c2))
    if pits:
        nt = m.node_tree; b = nt.nodes['Principled BSDF']
        old = b.inputs['Normal'].links[0].from_node      # the noise bump
        tc = rig.node(nt, 'ShaderNodeTexCoord'); v = rig.node(nt, 'ShaderNodeTexVoronoi'); v.inputs['Scale'].default_value = 26.0
        nt.links.new(tc.outputs['Object'], v.inputs['Vector'])
        bp = rig.node(nt, 'ShaderNodeBump'); bp.inputs['Strength'].default_value = pits; bp.inputs['Distance'].default_value = 0.02
        nt.links.new(v.outputs['Distance'], bp.inputs['Height']); nt.links.new(old.outputs['Normal'], bp.inputs['Normal'])
        nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    return m


def glaze(name, hexc, seed=1):
    return rig.glaze_mat(name, hexc, seed, gloss=True)


def iron_mat(hexc='#454a58'):
    return rig.cage_iron_mat(hexc)


def bronze_mat():
    return M('bronze', '#86683f', rough=0.34, metal=1.0, coat=0.3)


def steel_mat(name='steel', hexc='#5b6274'):
    """flat forged iron that still reads front-on: part metallic, so the diffuse key shows on broad faces"""
    return rig.noisy(M(name, hexc, rough=0.4, metal=0.7, coat=0.45, coat_rough=0.1), scale=14, amount=0.25, bump=0.2)


def rune_mat(name, hexc, emit_hex, strength):
    """glazed glass inlay; emissive when lit"""
    m = rig.mat(name, rig.srgb(hexc), rough=0.06, coat=1.0, coat_rough=0.02, sss=0.2)
    b = m.node_tree.nodes['Principled BSDF']
    if strength:
        b.inputs['Emission Color'].default_value = (*rig.srgb(emit_hex), 1); b.inputs['Emission Strength'].default_value = strength
    return m


def emission(name, hexc, strength):
    return rig.emit_mat(name, rig.srgb(hexc), strength)


# ---------------------------------------------------------------- render + post
def render(objs, name, draw, ppu=PPU, spp=64):
    rig.only(objs)
    w, h = draw
    path = OUT / f'{name}.png'
    rig.frame(SC, rig.P0[0] - w / 2, rig.P0[1] - h / 2, w, h, ppu, str(path), True, samples(spp))
    return path


def clean(path, margin_px=2):
    im = Image.open(path).convert('RGBA'); a = np.asarray(im).copy(); a[a[:, :, 3] == 0, :3] = 0
    im = Image.fromarray(a); im.save(path, optimize=True)
    assert not Image.open(path).info.get('Software') and 'parameters' not in Image.open(path).info
    bounds = im.getchannel('A').point(lambda v: 255 if v > 3 else 0).getbbox(); assert bounds, path
    assert bounds[0] >= margin_px and bounds[1] >= margin_px and bounds[2] <= im.width - margin_px and bounds[3] <= im.height - margin_px, f'{path} touches the edge {bounds}'
    return im, bounds


def bloom(path, mask, color, strength=0.55, radius=3.0, ppu=PPU, under=True):
    """soft glow from an emitter mask (L image at sprite px): blurred, tinted, composited under (or over) the sprite"""
    im = Image.open(path).convert('RGBA')
    g = mask.filter(ImageFilter.GaussianBlur(radius * ppu))
    g2 = mask.filter(ImageFilter.GaussianBlur(radius * ppu * 0.4))
    ga = np.clip(np.asarray(g, np.float32) * 1.6 * strength + np.asarray(g2, np.float32) * 0.5 * strength, 0, 255)
    col = np.array(rig.srgb(color)) ** (1 / 2.2) * 255
    glow = np.zeros((im.height, im.width, 4), np.float32); glow[:, :, :3] = col; glow[:, :, 3] = ga
    gl = Image.fromarray(glow.astype(np.uint8), 'RGBA')
    if under:
        out = gl.copy(); out.alpha_composite(im)
    else:
        out = im.copy(); add = np.asarray(out).astype(np.float32)
        a = ga[:, :, None] / 255
        add[:, :, :3] = np.clip(add[:, :, :3] + col * a * 0.6, 0, 255); add[:, :, 3] = np.maximum(add[:, :, 3], ga)
        out = Image.fromarray(add.astype(np.uint8), 'RGBA')
    out.save(path, optimize=True)


def saturate(path, mask, amount):
    """push chroma back into emissive areas (AgX rolls bright emitters toward white)"""
    im = Image.open(path).convert('RGBA'); a = np.asarray(im).astype(np.float32)
    m = np.asarray(mask.filter(ImageFilter.GaussianBlur(2)), np.float32)[:, :, None] / 255
    rgb = a[:, :, :3]; grey = rgb.mean(axis=2, keepdims=True)
    sat = np.clip(grey + (rgb - grey) * amount, 0, 255)
    a[:, :, :3] = rgb * (1 - m) + sat * m
    Image.fromarray(a.astype(np.uint8), 'RGBA').save(path, optimize=True)


def poly_mask(draw, polys, ppu=PPU, grow=0.0):
    m = Image.new('L', (round(draw[0] * ppu), round(draw[1] * ppu)), 0); d = ImageDraw.Draw(m)
    for pts in polys:
        d.polygon([((u + draw[0] / 2) * ppu, (draw[1] / 2 - v) * ppu) for u, v in pts], fill=255)
    if grow: m = m.filter(ImageFilter.MaxFilter(int(grow * ppu) * 2 + 1))
    return m


def entry(name, draw, ppu, anchor, **extra):
    path = OUT / f'{name}.png'
    im = Image.open(path)
    bounds = im.getchannel('A').point(lambda v: 255 if v > 3 else 0).getbbox()
    e = {'path': path.relative_to(ROOT).as_posix(), 'px': list(im.size), 'ppu': ppu, 'drawSize': list(draw),
         'anchor': [round(x, 3) for x in anchor], 'alphaBounds': list(bounds)}
    e.update(extra)
    e['sha256'] = hashlib.sha256(path.read_bytes()).hexdigest(); e['encodedBytes'] = path.stat().st_size
    return e


# ================================================================ 1. rune lure stones
LURE = (32, 18)                  # model rect (RIVALS_LAYOUT bw x bh)
LURE_DRAW = (42, 28)             # 5u margin for the glow
LURE_ANCHOR = (21, 14)           # rect centre


def rune_glyph(face_right=True):
    """serpent rune: an S-coil with a lozenge head, ~21x11u. Returns list of polygons (units, centred on the block)."""
    n = 26; path = []; widths = []
    for i in range(n):
        t = i / (n - 1)
        x = -10.6 + 14.2 * t
        y = 3.0 * math.sin(2 * math.pi * (0.95 * t) + 0.35) * (0.55 + 0.45 * t) - 0.2
        path.append((x, y)); widths.append(0.9 + 1.6 * min(1, t * 1.6))
    body = stroke_poly(path, widths)
    hx, hy = 7.4, path[-1][1] + 0.2
    head = [(hx + 4.0, hy), (hx + 0.6, hy + 2.9), (hx - 2.4, hy + 1.3), (hx - 2.4, hy - 1.3), (hx + 0.6, hy - 2.9)]
    polys = [body, head]
    # two rune nicks over and under the coil: the "two serpents" mark
    polys.append([(-2.2, 5.5), (-0.8, 5.5), (-1.1, 3.9), (-2.5, 3.9)])
    polys.append([(-5.6, -3.9), (-4.2, -3.9), (-3.9, -5.5), (-5.3, -5.5)])
    if not face_right:
        polys = [[(-u, v) for u, v in p][::-1] for p in polys]
    return polys


def build_lure(snake, lit):
    t = TINT[snake]
    stone = stone_mat(f'lurestone_{snake}{lit}', '#262b3c' if lit else '#20242f', '#13151e', scale=5, coat=0.12, bump=0.5, pits=0.35)
    W, H = LURE[0] - 0.6, LURE[1] - 0.6
    yf, yb = -1.25, 0.0
    block = prism('lure', rrect(W, H, 2.4, 5), yf, yb, stone, bevel=0.16, segs=5)
    glyph = rune_glyph(face_right=(snake == 'gnash'))
    groove_back = yf + 0.24
    for i, poly in enumerate(glyph):
        cut(block, prism(f'gcut{i}', poly, yf - 0.5, groove_back, stone))
    inlay = rune_mat(f'rune_{snake}{lit}', t['glaze'] if lit else t['deep'], t['glow'], 1.5 if lit else 0.0)
    objs = [block]
    for i, poly in enumerate(glyph):
        objs.append(prism(f'inlay{i}', wk.shrink(poly, 0.12), groove_back - 0.06, groove_back + 0.02, inlay, bevel=0.03, segs=1))
    # bevel accent: a thin iron band top and bottom edge is too busy at 32x18; instead two iron pins in the rim corners
    pin = iron_mat('#4a5062')
    for sx in (-1, 1):
        objs.append(rivet(f'pin{sx}', pin, sx * (W / 2 - 1.6), 0, yf - 0.02, r=0.75))
    if lit:   # the rune lights the stone around it
        point_light(f'rune{snake}', 0, 0, yf - 0.6, 40, tuple(c for c in rig.srgb(t['glow'])), 0.6)
    return objs, glyph


def do_lure(man):
    for snake in ('gnash', 'mooncoil'):
        for lit in (True, False):
            clear_meshes()
            name = f'lure_{snake}_{"lit" if lit else "dim"}'
            objs, glyph = build_lure(snake, lit)
            path = render(objs, name, LURE_DRAW, spp=96)
            if lit:
                saturate(path, poly_mask(LURE_DRAW, glyph, grow=1.0), 1.7)
                bloom(path, poly_mask(LURE_DRAW, glyph), TINT[snake]['glow'], strength=1.2, radius=2.6)
            clean(path)
            man[name] = entry(name, LURE_DRAW, PPU, LURE_ANCHOR, contact=[LURE_ANCHOR[0] - LURE[0] / 2, LURE_ANCHOR[1] - LURE[1] / 2, *LURE],
                              snake=snake, state='lit' if lit else 'dim',
                              use=f'{TINT[snake]["name"]} rune lure ({snake}); draw centred on the lure rect (anchor = rect centre). '
                                  f'{"Lit: lure.lit true, glows." if lit else "Dim: lure.lit false / cooling, cold."}')


def kit_lights():
    """the castle window kit's two soft fills (warm upper-left key fill, cool right fill) on top of the shared rig"""
    for loc, energy, size, col in (((-5.5, -9.0, 4.5), wk.FILL_KEY, 6, (1.0, 0.88, 0.76)), ((6.0, -8.0, -2.0), wk.FILL_COOL, 8, (0.62, 0.70, 1.0))):
        bpy.ops.object.light_add(type='AREA', location=rig.at(loc[0], loc[2], loc[1]))
        lo = bpy.context.object; lo.data.energy = energy; lo.data.size = size; lo.data.color = col
        d = mathutils.Vector(rig.at(0, 0, -1.0)) - lo.location
        lo.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler(); lo.name = 'kitlight'


# ================================================================ 2. the Twin Seal door + ward plates
SEAL = (140, 30)                 # model rect (m.seal w x h)
SEAL_DRAW = (152, 44)
SEAL_ANCHOR = (76, 22)           # rect centre
SKIN = {'gnash': '#168f83', 'mooncoil': '#7848c0'}
PLATE_SLOTS = [-24, 24, -42, 42, -60, 60]   # plate centres (u from the seal centre), filled in this order
PLATE = (15, 22)
PLATE_DRAW = (21, 28)


def jag(rng, x0, y0, ang, length, seg=1.6, wobble=0.45):
    pts = [(x0, y0)]; x, y = x0, y0
    for i in range(max(2, int(length / seg))):
        ang += rng.gauss(0, wobble); x += math.cos(ang) * seg; y += math.sin(ang) * seg
        pts.append((x, y))
    return pts


def crack_cutter(name, path, w0, w1, y_front, y_back):
    n = len(path); widths = [w0 + (w1 - w0) * i / (n - 1) for i in range(n)]
    return prism(name, stroke_poly(path, widths), y_front, y_back, None)


def serpent_relief(snake, sx, yf, mats):
    """a glazed serpent coiling along one leaf toward the medallion; sx = -1 (left leaf, head right) or 1"""
    skin, eye, pupil, brow = mats['skin_' + snake], mats['eye'], mats['pupil'], mats['brow']
    floor = yf + 0.14; n = 40; path = []; radii = []
    phase = 0.0 if snake == 'gnash' else 0.6
    for i in range(n):
        t = i / (n - 1)
        x = sx * (64 - 38 * t)
        y = 5.2 * math.sin(2 * math.pi * 1.1 * t + phase) * (1 - 0.6 * t) - 0.6
        path.append((x, y)); radii.append(0.7 + 2.9 * min(1, t * 1.4) ** 0.7)
    objs = [tube(f'body_{snake}', path, radii, skin, floor, flat=0.8)]
    hx, hy = sx * 21.5, path[-1][1] + 0.6
    d = -sx                                     # head points toward the centre
    objs.append(blob(f'head_{snake}', skin, hx, hy, floor - 0.02, 5.6, 4.4, 3.4))
    objs.append(blob(f'snout_{snake}', skin, hx + d * 3.6, hy - 0.9, floor - 0.04, 3.2, 2.7, 2.6))
    objs.append(blob(f'eye_{snake}', eye, hx + d * 1.1, hy + 1.6, floor - 0.32, 1.7, 1.6, 0.9))
    objs.append(blob(f'pupil_{snake}', pupil, hx + d * 1.5, hy + 1.6, floor - 0.39, 0.55, 1.25, 0.45))
    objs.append(blob(f'brow_{snake}', brow, hx + d * 0.5, hy + 3.4, floor - 0.32, 2.5, 0.85, 0.7, rot=d * 0.35))
    return objs


def build_seal(stage):
    rng = random.Random(77)
    stone = stone_mat('sealstone', '#30364a', '#1a1d2a', scale=6, coat=0.2, bump=0.45, pits=0.3)
    iron, bronze = steel_mat('sealiron', '#525a6c'), bronze_mat()
    mats = dict(skin_gnash=glaze('skin_g', SKIN['gnash'], 3), skin_mooncoil=glaze('skin_m', SKIN['mooncoil'], 5),
                eye=M('eye', '#e9f59a', rough=0.15, coat=1.0), pupil=M('pupil', '#101018', rough=0.2, coat=1.0),
                brow=glaze('brow', '#ff8a9b', 2))
    yf, yb = -1.3, 0.0
    leaves = []
    for sx in (-1, 1):
        lf = prism(f'leaf{sx}', rrect(69.2, 30, 2.6, 5, cx=sx * 35.4), yf, yb, stone, bevel=0.1, segs=4)
        cut(lf, prism('panel', rrect(47, 20.5, 2.0, 4, cx=sx * 40.5), yf - 0.5, yf + 0.14, None))
        leaves.append(lf)
    objs = list(leaves)
    # iron end bands (hinge straps) with rivets
    for sx in (-1, 1):
        objs.append(prism(f'band{sx}', rrect(5.2, 33, 1.2, 3, cx=sx * 66.6), yf - 0.22, yf + 0.3, iron, bevel=0.05, segs=3))
        for v in (-11, 0, 11):
            objs.append(rivet(f'bandriv{sx}{v}', iron, sx * 66.6, v, yf - 0.24, r=1.0))
        # thin iron straps across top and bottom of each leaf panel
    # medallion: iron octagon, bronze octagonal frame, split twin gem
    med = []
    med.append(prism('medbase', octagon(32, 32, 9.5), yf - 0.3, yf + 0.3, iron, bevel=0.08, segs=3))
    rim = prism('medrim', octagon(25, 25, 7.4), yf - 0.52, yf - 0.2, bronze, bevel=0.06, segs=3)
    cut(rim, prism('rimcut', octagon(19, 19, 5.6), yf - 1.0, yf - 0.25, None))
    med.append(rim)
    for a in range(4):
        ang = math.pi / 4 + a * math.pi / 2
        med.append(rivet(f'medriv{a}', bronze, 12.6 * math.cos(ang) * 0.86, 12.6 * math.sin(ang) * 0.86, yf - 0.34, r=0.95))
    for sx, key in ((-1, 'gnash'), (1, 'mooncoil')):
        half = [(sx * 0.35, 8.2), (sx * 7.4, 0), (sx * 0.35, -8.2)]
        gm = rune_mat(f'gem_{key}', TINT[key]['glaze'], TINT[key]['glow'], 0.25)
        med.append(prism(f'gem{key}', half, yf - 0.95, yf - 0.4, gm, bevel=0.1, segs=2))
    objs += med
    reliefs = serpent_relief('gnash', -1, yf, mats) + serpent_relief('mooncoil', 1, yf, mats)
    objs += reliefs
    # ---- damage: cumulative crack sets radiating from the seam (where clashes land)
    cracks = []
    if stage >= 1:
        cracks += [(jag(rng, -16, 6, math.radians(170), 26), 1.7, 0.35, 0.45), (jag(rng, 16, -5, math.radians(-15), 24), 1.6, 0.35, 0.45),
                   (jag(rng, -16, -9, math.radians(205), 10), 1.2, 0.3, 0.4)]
    if stage >= 2:
        cracks += [(jag(rng, -16, -3, math.radians(185), 34), 2.0, 0.4, 0.6), (jag(rng, 16, 8, math.radians(20), 32), 2.0, 0.4, 0.6),
                   (jag(rng, 40, 15, math.radians(-100), 14), 1.5, 0.3, 0.5), (jag(rng, -46, -15, math.radians(80), 13), 1.5, 0.3, 0.5)]
    if stage >= 3:
        cracks += [(jag(rng, -16, 1, math.radians(180), 44), 1.5, 0.3, 2.0), (jag(rng, 16, 0, math.radians(0), 44), 1.5, 0.3, 2.0),
                   (jag(rng, -30, 15, math.radians(-75), 16), 1.3, 0.3, 2.0), (jag(rng, 28, -15, math.radians(100), 16), 1.3, 0.3, 2.0),
                   (jag(rng, -16, -12, math.radians(200), 26), 1.1, 0.3, 0.6), (jag(rng, 16, 12, math.radians(15), 26), 1.1, 0.3, 0.6)]
    leak = stage >= 3
    for i, (path, w0, w1, depth) in enumerate(cracks):
        c = crack_cutter(f'crack{i}', path, w0, w1, yf - 1.5, yf + depth)
        for o in leaves + ([r for r in reliefs if r.name.startswith('body')] if depth < 1 else []):
            cut(o, c, remove=False)
        bpy.data.objects.remove(c, do_unlink=True)
    if stage >= 2:   # medallion splits along its seam / gem chipped
        c = crack_cutter('medcrack', jag(random.Random(5), 1.5, 16, math.radians(-95), 32, seg=1.4, wobble=0.35), 0.9 + 0.5 * (stage - 2), 0.5, yf - 1.5, yf + 0.5)
        for o in med:
            if o.name.startswith(('medbase', 'medrim', 'gem')): cut(o, c, remove=False)
        bpy.data.objects.remove(c, do_unlink=True)
    if stage >= 3:   # chunks knocked out at the seam edges, the medallion knocked askew
        for k, poly in enumerate(([(-17, 15.5), (-6, 15.5), (-10, 11.5), (-14, 12.5)], [(5, -15.5), (19, -15.5), (15, -12.0), (9, -11.0)],
                                  [(-69, 15.5), (-62, 15.5), (-66, 11)], [(62, -15.5), (69, -15.5), (68, -11)])):
            c = prism(f'chunk{k}', poly, yf - 1.5, yb + 0.5, None)
            for o in leaves: cut(o, c, remove=False)
            bpy.data.objects.remove(c, do_unlink=True)
        pivot = mathutils.Vector(P(0, 0, 0))
        R = mathutils.Matrix.Rotation(math.radians(7), 4, 'Y')
        for o in med:
            o.data.transform(mathutils.Matrix.Translation(pivot) @ R @ mathutils.Matrix.Translation(-pivot))
            o.data.transform(mathutils.Matrix.Translation((0.06, -0.12, -0.08)))
    if leak:         # warm exit light behind the door, seen only through the deepest cracks
        objs.append(prism('leak', rrect(136, 26, 2, 3), yb + 0.2, yb + 0.4, emission('leak', '#ff8a45', 1.1)))
    objs += [rig.gloss_card('sealcard', SEAL[0] * U, SEAL[1] * U, yf, strength=1.2, window=True, sheen=0.04)]
    return objs


def do_seal(man):
    names = ['seal_intact', 'seal_crack1', 'seal_crack2', 'seal_shattered']
    for stage, name in enumerate(names):
        clear_meshes()
        objs = build_seal(stage)
        path = render(objs, name, SEAL_DRAW, spp=96)
        clean(path)
        man[name] = entry(name, SEAL_DRAW, PPU, SEAL_ANCHOR, contact=[SEAL_ANCHOR[0] - SEAL[0] / 2, SEAL_ANCHOR[1] - SEAL[1] / 2, *SEAL],
                          stage=stage, use='Twin Seal door; anchor = centre of m.seal rect (x + w/2, y + h/2). '
                          'Stage by HP fraction: intact > 0.75, crack1 > 0.5, crack2 > 0.25, shattered otherwise (and under seal-open/seal-shatter).')
    LAYOUTS['sealWardSlots'] = {'note': 'ward plate centres in seal sprite units (from the seal sprite top-left), in fill order; '
                                'draw plate i < seal.ward at slot i with the plate anchor. Plate contact is visual only (the seal rect owns collision).',
                                'slots': [[SEAL_ANCHOR[0] + x, SEAL_ANCHOR[1] + (0.6 if i % 2 else -0.6)] for i, x in enumerate(PLATE_SLOTS)]}


def build_plate(variant):
    iron = steel_mat('plateiron', '#5d6578') if variant == 'iron' else M('gilt', '#8f7a5c', rough=0.32, metal=0.8, coat=0.45)
    trim = bronze_mat() if variant == 'iron' else steel_mat('platetrim', '#4c5364')
    w, h = PLATE
    outline = [(-w / 2 + 2, h / 2), (w / 2 - 2, h / 2), (w / 2, h / 2 - 2), (w / 2, -1), (0, -h / 2), (-w / 2, -1), (-w / 2, h / 2 - 2)]
    yf = -1.9
    plate = prism('plate', outline, yf, yf + 0.5, iron, bevel=0.07, segs=3)
    rim = prism('platerim', wk.shrink(outline, 0.0), yf - 0.18, yf + 0.05, trim, bevel=0.05, segs=3)
    cut(rim, prism('rimcut', wk.shrink(outline, 1.9), yf - 1, yf + 0.2, None))
    # embossed scale ridge down the middle
    ridge = prism('ridge', [(-1.2, 7.0), (1.2, 7.0), (1.6, -1.5), (0, -6.5), (-1.6, -1.5)], yf - 0.22, yf + 0.1, iron, bevel=0.1, segs=3)
    objs = [plate, rim, ridge]
    for sx in (-1, 1):
        objs.append(rivet(f'bolt{sx}', trim, sx * 4.3, h / 2 - 3.3, yf - 0.16, r=1.25))
    objs.append(rig.gloss_card('platecard', w * U, h * U, yf, strength=3.0, window=True, sheen=0.07))
    return objs, outline


def do_plate(man):
    for variant in ('iron', 'gilt'):
        clear_meshes()
        name = f'ward_plate_{variant}'
        objs, outline = build_plate(variant)
        path = render(objs, name, PLATE_DRAW, spp=96)
        clean(path)
        man[name] = entry(name, PLATE_DRAW, PPU, (PLATE_DRAW[0] / 2, PLATE_DRAW[1] / 2),
                          use='Seal ward plate (one per seal.ward), anchor at a sealWardSlots point. ' +
                              ('Default plate.' if variant == 'iron' else 'Optional gilt variant: alternate with iron, or use for the newest plate.'))


# ================================================================ 3. Clash Chamber floor plate
CHAMBER = (112, 66)              # model rect (m.chamber w x h)
CH_DRAW = (120, 74)
CH_ANCHOR = (60, 37)


def build_chamber():
    rng = random.Random(9)
    kerb = stone_mat('kerb', '#242939', '#161924', scale=6, coat=0.06, bump=0.45, pits=0.3)
    flag = [stone_mat(f'flag{i}', hx, c2, scale=5 + i, coat=0.12, bump=0.4, pits=0.25)
            for i, (hx, c2) in enumerate((('#20253a', '#13151f'), ('#22273b', '#141620'), ('#1f2336', '#12141d')))]
    W, H, K = CHAMBER[0], CHAMBER[1], 6.0
    yk, yfl = -1.0, 0.35
    objs = []
    # kerb: masonry blocks round the rim, bevelled, tops proud of the recessed floor
    xs = [-W / 2, -W / 2 + K, -20, 18, W / 2 - K, W / 2]
    for k in range(5):
        for vs, (y0, y1) in ((1, (H / 2 - K, H / 2)), (-1, (-H / 2, -H / 2 + K))):
            xa, xb = xs[k] + 0.25, xs[k + 1] - 0.25
            objs.append(prism(f'kerb{vs}{k}', [(xa, y0 + 0.25), (xb, y0 + 0.25), (xb, y1 - 0.25), (xa, y1 - 0.25)],
                              yk - rng.uniform(0, 0.05), 0.6, kerb, bevel=0.08, segs=3))
    for sx in (-1, 1):
        for k, (y0, y1) in enumerate(((-H / 2 + K, -2), (-2, H / 2 - K))):
            xa, xb = sorted((sx * W / 2, sx * (W / 2 - K)))
            objs.append(prism(f'kerbs{sx}{k}', [(xa + 0.25, y0 + 0.25), (xb - 0.25, y0 + 0.25), (xb - 0.25, y1 - 0.25), (xa + 0.25, y1 - 0.25)],
                              yk - rng.uniform(0, 0.05), 0.6, kerb, bevel=0.08, segs=3))
    objs.append(prism('mortar', rrect(W, H, 0.5, 1), 0.55, 0.8, M('ch_mortar', '#0d0b14', rough=1.0)))
    # recessed floor: big flagstones in two courses
    iw, ih = W - 2 * K, H - 2 * K
    for row, cuts_ in enumerate(((-iw / 2, -24, 3, 27, iw / 2), (-iw / 2, -12, 15, iw / 2))):
        y0 = -ih / 2 if row == 0 else 0; y1 = 0 if row == 0 else ih / 2
        for k in range(len(cuts_) - 1):
            xa, xb = cuts_[k] + 0.3, cuts_[k + 1] - 0.3
            objs.append(prism(f'flag{row}{k}', [(xa, y0 + 0.3), (xb, y0 + 0.3), (xb, y1 - 0.3), (xa, y1 - 0.3)],
                              yfl - rng.uniform(0, 0.04), yfl + 0.2, flag[(row + k) % 3], bevel=0.07, segs=2))
    # centre: a carved lozenge plate with the two serpent runes facing each other (dim inlay, no glow)
    loz = [(0, 15.5), (24, 0), (0, -15.5), (-24, 0)]
    plate = prism('lozenge', loz, yfl - 0.16, yfl + 0.05, kerb, bevel=0.1, segs=3)
    inner = []
    for snake, sx in (('gnash', -1), ('mooncoil', 1)):
        for poly in rune_glyph(face_right=(sx < 0)):
            q = [(u * 0.62 + sx * 8.6, v * 0.62) for u, v in poly]
            inner.append((snake, q)); cut(plate, prism('lgc', q, yfl - 0.5, yfl - 0.04, None))
    objs.append(plate)
    for i, (snake, q) in enumerate(inner):
        objs.append(prism(f'linlay{i}', wk.shrink(q, 0.08), yfl - 0.07, yfl - 0.0, rune_mat(f'chdim_{snake}', TINT[snake]['deep'], '#000000', 0.0)))
    return objs


def do_chamber(man):
    clear_meshes()
    objs = build_chamber()
    path = render(objs, 'chamber_floor', CH_DRAW, spp=96)
    clean(path)
    man['chamber_floor'] = entry('chamber_floor', CH_DRAW, PPU, CH_ANCHOR,
                                 contact=[CH_ANCHOR[0] - CHAMBER[0] / 2, CH_ANCHOR[1] - CHAMBER[1] / 2, *CHAMBER],
                                 use='Clash Chamber floor (scenery, floors 2-3): anchor = centre of m.chamber rect; draw under heads, balls, effects. '
                                     'No collision (the chamber is open space). Kerb inner edge = contact inset 6u.')


# ================================================================ 4. shuttered window front (window kit registered)
SH_PPU = wk.PPU
EYE_V = 4.2                      # eye line (units above the opening centre); the broken slat leaves a slot here


def arch_hw(v, inset=0.0):
    r = wk.R - inset
    return r if v <= wk.ZC else math.sqrt(max(0.0, r * r - (v - wk.ZC) ** 2))


def build_shutters():
    wood = rig.noisy(M('shutterwood', '#3d2a22', rough=0.55, coat=0.45, coat_rough=0.18), scale=1.5, amount=0.45, bump=0.25,
                     stretch=(1, 0.35, 5), rnd=True)
    iron = steel_mat('shutteriron', '#4d5466')
    objs = []
    yfw, ybw = -0.98, -0.62          # inside the reveal, behind the stone front
    # slats (top -> bottom), each split at the centre seam into two leaves; one slat at the eye line is broken away
    rows = [(22.0, 15.4), (14.2, 9.2), (8.0, 6.7), (2.0, -3.4), (-4.6, -9.8), (-11.0, -16.2), (-17.4, -22.6)]
    vmax = wk.ZC + math.sqrt((wk.R - 0.4) ** 2 - 1.2 ** 2)
    for r, (v1, v0) in enumerate(rows):
        v1 = min(v1, vmax)
        for sx in (-1, 1):
            n = 8 if v1 > wk.ZC else 1
            outer = [(sx * arch_hw(v0 + (v1 - v0) * i / n, 0.4), v0 + (v1 - v0) * i / n) for i in range(n + 1)]
            inner_u = 10.5 if r == 2 else 0.35            # the broken slat: a stub on the outer edge only
            pts = [(sx * inner_u, v0)] + outer + [(sx * inner_u, v1)]
            if sx < 0: pts = pts[::-1]
            objs.append(prism(f'slat{r}{sx}', pts, yfw - 0.03 * (r % 2), ybw, wood, bevel=0.09, segs=3))
    # iron: two straps across both leaves, a centre hasp, rivets
    for v in (-13.6, 11.6):
        hw = arch_hw(v + 1.2, 0.4)
        objs.append(prism(f'strap{v}', rrect(2 * hw - 0.6, 2.4, 0.5, 2, cy=v), yfw - 0.14, yfw + 0.05, iron, bevel=0.03, segs=2))
        for u in (-hw + 2.0, -4.0, 4.0, hw - 2.0):
            objs.append(rivet(f'sr{v}{u}', iron, u, v, yfw - 0.16, r=0.62))
    objs.append(prism('hasp', rrect(4.6, 8.0, 0.8, 3, cy=-0.8), yfw - 0.2, yfw + 0.05, iron, bevel=0.04, segs=2))
    objs.append(rivet('hasp_pin', bronze_mat(), 0, -1.8, yfw - 0.24, r=0.9))
    return objs


def build_eyes():
    """Mooncoil's eyes in the dark behind the slats (registered layer, drawn between window_back and the shutter front)"""
    glow = emission('eyeglow', '#d6ff7a', 3.0)
    slit = M('slit', '#080610', rough=0.3)
    objs = []
    for sx in (-1, 1):
        objs.append(blob(f'eye{sx}', glow, sx * 5.0, EYE_V, -0.2, 2.5, 1.35, 0.6, rot=-sx * 0.18))
        objs.append(blob(f'slit{sx}', slit, sx * 5.0 + 0.3 * sx, EYE_V, -0.27, 0.42, 1.25, 0.3))
    return objs


def do_shutter(man):
    clear_meshes()
    stone = []
    for i, (hexc, c2) in enumerate((('#222736', '#171b26'), ('#262b3b', '#1a1e2a'), ('#1f2433', '#151824'))):
        m = rig.mat(f'castlestone{i}', rig.srgb(hexc), rough=0.82, coat=0.15)
        stone.append(rig.noisy(m, scale=7 + i, amount=0.4, bump=0.35, detail=8, color2=rig.srgb(c2)))
    stone[0] = rig.chamber_stone_mat()
    mats = dict(stone=stone, iron=rig.cage_iron_mat('#454a58'), mortar=rig.mat('castle_mortar', rig.srgb('#0d0b14'), rough=1.0),
                crack=rig.mat('castle_crack', rig.srgb('#0a0810'), rough=1.0))
    frame_objs = wk.build_front(False, mats, random.Random(11))       # identical frame to window_front
    shut = build_shutters()
    path = render(frame_objs + shut, 'window_front_shuttered', wk.DRAW, ppu=SH_PPU, spp=64)
    clean(path)
    # the eyes: rendered with the frame + shutters casting nothing (eyes only), then clipped to the opening
    clear_meshes()
    eyes = build_eyes()
    path = render(eyes, 'shutter_eyes', wk.DRAW, ppu=SH_PPU, spp=48)
    m = Image.new('L', (wk.DRAW[0] * SH_PPU, wk.DRAW[1] * SH_PPU), 0)
    for sx in (-1, 1):
        cx, cy = (wk.ANCHOR[0] + sx * 5.0) * SH_PPU, (wk.ANCHOR[1] - EYE_V) * SH_PPU
        ImageDraw.Draw(m).ellipse([cx - 2.4 * SH_PPU, cy - 1.3 * SH_PPU, cx + 2.4 * SH_PPU, cy + 1.3 * SH_PPU], fill=255)
    bloom(path, m, '#9b6cff', strength=0.8, radius=3.2, ppu=SH_PPU)
    im = Image.open(path).convert('RGBA')
    im.putalpha(ImageChops.multiply(im.getchannel('A'), wk.opening_mask(1)))
    im.save(path, optimize=True); clean(path)
    common = dict(opening=wk.opening_polygon())
    man['window_front_shuttered'] = entry('window_front_shuttered', wk.DRAW, SH_PPU, wk.ANCHOR, **common,
        use='Floor-1 Mooncoil window, closed (m.shutters). Same drawSize/anchor/opening as assets/castle/window_front: '
            'draw window_back, then shutter_eyes (optional, blink by alpha), then this, at the window centre. Not a lunge window.')
    man['shutter_eyes'] = entry('shutter_eyes', wk.DRAW, SH_PPU, wk.ANCHOR, **common,
        use=f'Mooncoil eyes behind the shutter slats (registered with window kit, eye line {EYE_V}u above the opening centre). '
            'Visible through the broken slat and gaps; fade/blink with alpha.')


# ================================================================ 5. clash impact burst
CLASH_DRAW = (76, 76)
CLASH_FRAMES = 3


def build_clash(f):
    rng = random.Random(404)
    em = {'gnash': emission('spark_g', '#12d98a', 2.2), 'mooncoil': emission('spark_m', '#8a4dff', 2.6)}
    hot = emission('clash_core', '#fff1df', 5.0 if f == 0 else 2.6)
    chipm = rig.noisy(M('clash_chip', '#59586a', rough=0.7, coat=0.2), scale=9, amount=0.35, bump=0.3)
    objs = []
    grow = (0.55, 1.0, 1.35)[f]; fade = (1.0, 0.85, 0.5)[f]
    if f < 2:   # white-hot jagged star where the jaws met (never a ring)
        k = (1.0, 0.62)[f]
        pts = []
        for i in range(16):
            a = math.pi * i / 8 + 0.12
            r = (13 if i % 4 == 0 else 8.5 if i % 2 == 0 else 3.6) * k * (0.85 + 0.3 * rng.random())
            pts.append((r * math.cos(a), r * 0.82 * math.sin(a)))
        objs.append(prism('core', pts, -1.6, -1.4, hot, bevel=0.04, segs=1))
    # sparks: emerald streaks fly left-ish, violet right-ish (each serpent's colour thrown back its own way), a few cross over
    for i in range(14):
        snake = 'gnash' if i % 2 == 0 else 'mooncoil'
        base = math.pi if snake == 'gnash' else 0.0
        a = base + rng.uniform(-1.25, 1.25) + (math.pi if i in (5, 10) else 0)
        dist = rng.uniform(9, 18) * grow * 1.6 if f else rng.uniform(7, 12)
        L = rng.uniform(5, 9) * (1.0, 1.25, 0.7)[f]; wdt = rng.uniform(0.8, 1.3) * (1.0, 0.9, 0.7)[f]
        cx, cy = dist * math.cos(a), dist * math.sin(a) * 0.85
        ca, sa = math.cos(a), math.sin(a)
        local = [(-L / 2, 0), (-L * 0.1, -wdt), (L / 2, 0), (-L * 0.1, wdt)]
        pts = [(cx + x * ca - y * sa, cy + x * sa + y * ca) for x, y in local]
        objs.append(prism(f'spark{i}', pts, -1.9, -1.7, em[snake], bevel=0.03, segs=1))
    # stone chips knocked off the chamber
    for i in range(7):
        a = rng.uniform(0, 2 * math.pi); dist = (rng.uniform(4, 9), rng.uniform(13, 22), rng.uniform(22, 31))[f]
        cx, cy = dist * math.cos(a), dist * math.sin(a) * 0.8 - (0, 1.5, 5.0)[f]
        sz = rng.uniform(1.5, 2.6) * (1.0, 1.0, 0.85)[f]
        pts = [(cx + sz * (1 + 0.35 * math.sin(i * 3.1 + j * 1.9)) * math.cos(j * 2 * math.pi / 6 + i),
                cy + sz * 0.8 * (1 + 0.35 * math.cos(i * 2.3 + j * 2.1)) * math.sin(j * 2 * math.pi / 6 + i)) for j in range(6)]
        o = prism(f'chip{i}', pts, -2.2, -1.9, chipm, bevel=0.06, segs=2)
        objs.append(o)
    return objs, fade


def do_clash(man):
    for f in range(CLASH_FRAMES):
        clear_meshes()
        objs, fade = build_clash(f)
        name = f'clash_{f}'
        path = render(objs, name, CLASH_DRAW, spp=48)
        im = Image.open(path).convert('RGBA'); a = np.asarray(im).astype(np.float32)
        lum = (a[:, :, 0] * .3 + a[:, :, 1] * .5 + a[:, :, 2] * .2) * a[:, :, 3] / 255
        mask = Image.fromarray(np.clip((lum - 120) * 2.2, 0, 255).astype(np.uint8), 'L')
        saturate(path, Image.new('L', (CLASH_DRAW[0] * PPU, CLASH_DRAW[1] * PPU), 255), 1.6)
        bloom(path, mask, '#e6dcff', strength=(0.55, 0.4, 0.2)[f], radius=(3.2, 3.8, 3.0)[f])
        if fade < 1:
            im = Image.open(path).convert('RGBA'); al = np.asarray(im.getchannel('A')).astype(np.float32) * fade
            im.putalpha(Image.fromarray(al.astype(np.uint8))); im.save(path, optimize=True)
        clean(path)
        man[name] = entry(name, CLASH_DRAW, PPU, (CLASH_DRAW[0] / 2, CLASH_DRAW[1] / 2), frame=f,
                          use='Clash impact (effect `clash`), centred on the effect point (chamber cx, cy). Frames 0,1,2 over the '
                              'first ~0.3 s (e.g. 0.08/0.10/0.12 s), additive-free normal blending; scale 1.0-1.15 for punch.')


# ================================================================ main
GROUPS = {'lure': do_lure, 'seal': do_seal, 'plate': do_plate, 'chamber': do_chamber, 'shutter': do_shutter, 'clash': do_clash}


def main():
    global SC
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    picks = [a for a in args if a in GROUPS] or ([] if 'sheet' in args else list(GROUPS))
    old = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}
    man = old.get('sprites', {})
    for k, v in old.items():
        if k not in ('version', 'source', 'rig', 'scope', 'sprites'): LAYOUTS.setdefault(k, v)
    if picks:
        SC = rig.reset(); SC.cycles.seed = 31
        kit_lights()
        for g in picks: GROUPS[g](man)
        write_manifest(man)
    if 'sheet' in args or not args or picks:
        sys.path.insert(0, str(HERE)); import rivals_sheet; rivals_sheet.main()


def write_manifest(man):
    out = {'version': 1, 'source': 'art/rivals/rivals_art.py', 'rig': 'art/render_vault_assets.py',
           'scope': 'Serpent Rivals props. Every sprite: draw its drawSize (game units) with `anchor` (units from the sprite '
                    'top-left) on the model point named in `use`. `contact` = [x, y, w, h] in sprite units = the model rect, '
                    'so collision matches the drawing. Blender Cycles, Vault ortho rig, AgX Medium High Contrast.',
           'sprites': dict(sorted(man.items()))}
    out.update(LAYOUTS)
    MANIFEST.write_text(json.dumps(out, indent=1) + '\n')


LAYOUTS = {}

if __name__ == '__main__':
    main()
