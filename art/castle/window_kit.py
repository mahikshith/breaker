"""Castle tower-window kit (BREACH, 'Lumi Breaks Out'): layered so a serpent can emerge from INSIDE the tower.
Layer order contract: window_back -> serpent clipped to the opening polygon -> window_front (or _cracked).
Run from repo root with installed bpy5.2:  python art/castle/window_kit.py
All three PNGs share one drawSize (60x72u, ppu 3, 180x216 px); the opening centre is the drawSize centre (30,36).
"""
from pathlib import Path
import sys, json, hashlib, math, random
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'art'))
import render_vault_assets as rig
import bpy, bmesh
from PIL import Image, ImageDraw, ImageFont, ImageChops, ImageFilter
import numpy as np

HERE = Path(__file__).resolve().parent
OUT = ROOT / 'assets' / 'castle'
PROOF = HERE / 'proof'
for d in (OUT, PROOF, HERE / 'source'): d.mkdir(parents=True, exist_ok=True)
rig.TMP = str(HERE / 'source')
rig.THREADS = 4

U = rig.U
PPU = 3
DRAW = (60, 72)                 # drawSize in units (52x64 frame + 4u margin)
ANCHOR = (30, 36)               # opening centre from drawSize top-left
OPEN_W, OPEN_H, R = 32, 44, 16  # opening
ZC = OPEN_H / 2 - R             # arch centre height above opening centre (6u)
ZB = -OPEN_H / 2                # sill top (-22u)
ROUT = 26                       # outer arch radius -> frame width 52
ZBOT = -32                      # frame bottom (frame height 64 = 32 + 32)
SAMPLES = 32
FILL_KEY, FILL_COOL = 2100, 800


def P(u, v, y=0.0):
    """unit coords relative to the opening centre (u right, v up) -> world metres at the render spot"""
    return rig.at(u * U, v * U, y)


def opening_polygon():
    """clip path in drawSize units (x right, y down from top-left): 2 bottom corners + 16 arch points"""
    pts = [(ANCHOR[0] - R, ANCHOR[1] - ZB)]
    for i in range(16):
        a = math.pi - math.pi * i / 15
        pts.append((ANCHOR[0] + R * math.cos(a), ANCHOR[1] - (ZC + R * math.sin(a))))
    pts.append((ANCHOR[0] + R, ANCHOR[1] - ZB))
    return [[round(x, 3), round(y, 3)] for x, y in pts]


# ---------------------------------------------------------------- geometry
def link(o):
    return o


def prism(name, pts, y_front, y_back, m, bevel=0.0, segs=2):
    """convex-ish polygon (unit coords) extruded between two world y values; origin stays at world origin so
    procedural textures vary per location."""
    bm = bmesh.new()
    f = [bm.verts.new(P(u, v, y_front)) for u, v in pts]
    b = [bm.verts.new(P(u, v, y_back)) for u, v in pts]
    bm.faces.new(f[::-1]); bm.faces.new(b)
    n = len(pts)
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new((f[i], f[j], b[j], b[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(o)
    bpy.context.view_layer.objects.active = o; o.select_set(True)
    if bevel:
        md = o.modifiers.new('b', 'BEVEL'); md.width = bevel; md.segments = segs; md.limit_method = 'NONE'
        bpy.ops.object.modifier_apply(modifier='b')
    bpy.ops.object.shade_smooth()
    o.select_set(False)
    o.data.materials.append(m)
    return o


def shrink(pts, g):
    cx = sum(p[0] for p in pts) / len(pts); cz = sum(p[1] for p in pts) / len(pts)
    out = []
    for u, v in pts:
        d = math.hypot(cx - u, cz - v) or 1
        out.append((u + (cx - u) / d * g, v + (cz - v) / d * g))
    return out


def rad(a_deg, r):
    a = math.radians(a_deg)
    return (r * math.cos(a), ZC + r * math.sin(a))


def build_front(cracked, mats, rnd):
    stone, iron, mortar, crack = mats['stone'], mats['iron'], mats['mortar'], mats['crack']
    objs = []

    def block(name, pts, depth_front=-1.5, bevel=0.05, gap=0.3):
        m = stone[rnd.randrange(len(stone))]
        objs.append(prism(name + '_bk', pts, -0.72, -0.5, mortar))                  # exact footprint, dark mortar
        objs.append(prism(name, shrink(pts, gap), depth_front - rnd.uniform(0, 0.12), -0.55, m, bevel=bevel))

    # arch voussoirs, left springer -> right springer; centre one is the keystone
    cuts = [180, 158, 135, 112, 101, 79, 68, 45, 22, 0]
    for i in range(9):
        a0, a1 = cuts[i], cuts[i + 1]; am = (a0 + a1) / 2
        pts = [rad(a0, R), rad(a0, ROUT), rad(am, ROUT), rad(a1, ROUT), rad(a1, R), rad(am, R)]
        if cracked and i == 1:   # chip at the outer left corner
            pts = [rad(a0, R), rad(a0, 20.5), rad(a0 - 3.5, 22.5), rad(a0 - 2.0, 24.0), rad(a0 - 7.5, ROUT), rad(am, ROUT),
                   rad(a1, ROUT), rad(a1, R), rad(am, R)]
        if cracked and i == 6:   # chip at the outer right corner
            pts = [rad(a0, R), rad(a0, ROUT), rad(am, ROUT), rad(a1 + 8.0, ROUT), rad(a1 + 2.5, 23.4), rad(a1 + 4.5, 21.8),
                   rad(a1, 20.0), rad(a1, R), rad(am, R)]
        block(f'vous{i}', pts, depth_front=-1.62 if i == 4 else -1.5, bevel=0.06 if i == 4 else 0.05, gap=0.28)
    # jambs
    for sgn, tag in ((-1, 'L'), (1, 'R')):
        x0, x1 = (-ROUT, -R) if sgn < 0 else (R, ROUT)
        xm = (x0 + x1) / 2
        rows = [(ZC, ZC - 9.5), (ZC - 9.5, ZC - 19), (ZC - 19, ZB)]
        for k, (ta, tb) in enumerate(rows):
            if k == 1:
                for h, (xa, xb) in enumerate(((x0, xm), (xm, x1))):
                    block(f'jamb{tag}{k}{h}', [(xa, tb), (xb, tb), (xb, ta), (xa, ta)])
            else:
                pts = [(x0, tb), (x1, tb), (x1, ta), (x0, ta)]
                if cracked and tag == 'L' and k == 0:
                    pts = [(x0, tb), (x1, tb), (x1, ta), (x0 + 5.5, ta), (x0 + 4.2, ta - 1.8), (x0 + 2.0, ta - 1.2), (x0, ta - 4.6)]
                block(f'jamb{tag}{k}', pts)
    # protruding sill lip (3 blocks, nearer the camera than the jambs)
    for k, (xa, xb) in enumerate(((-ROUT, -5), (-5, 9), (9, ROUT))):
        m = stone[(k + 1) % len(stone)]
        pts = [(xa, ZBOT), (xb, ZBOT), (xb, ZB), (xa, ZB)]
        if cracked and k == 2:
            pts = [(xa, ZBOT), (xb - 6.0, ZBOT), (xb - 4.0, ZBOT + 2.0), (xb - 1.5, ZBOT + 1.0), (xb, ZBOT + 4.5), (xb, ZB), (xa, ZB)]
        objs.append(prism(f'sill{k}_bk', pts, -0.72, -0.5, mortar))
        objs.append(prism(f'sill{k}', shrink(pts, 0.3), -2.0, -0.55, m, bevel=0.12, segs=3))
    # iron keystone boss + ring
    kc = rad(90, (R + ROUT) / 2 + 0.2)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.30, minor_radius=0.085, major_segments=32, minor_segments=10,
                                     location=P(kc[0], kc[1], -1.78), rotation=(math.pi / 2, 0, 0))
    t = bpy.context.object; bpy.ops.object.shade_smooth(); t.data.materials.append(iron); objs.append(t)
    objs.append(rig.cyl(0.17, 0.2, P(kc[0], kc[1], -1.72), iron, rot=(math.pi / 2, 0, 0), verts=20))
    for sx in (-1, 1):
        # iron straps: springline band across each jamb, L strap at each outer bottom corner
        cx = sx * (R + ROUT) / 2
        objs.append(rig.box(f'band{sx}', 1.0, 0.32, 0.2, 0.03, iron, P(cx, ZC - 0.6, -1.64), segs=2, local=True))
        for rx in (-0.32, 0.32):
            objs.append(rig.cyl(0.045, 0.08, P(cx + rx * 10, ZC - 0.6, -1.78), iron, rot=(math.pi / 2, 0, 0), verts=10))
        objs.append(rig.box(f'lv{sx}', 0.32, 1.9, 0.2, 0.03, iron, P(sx * (ROUT - 1.6), ZBOT + 11.5, -2.12), segs=2, local=True))
        objs.append(rig.box(f'lh{sx}', 1.5, 0.32, 0.2, 0.03, iron, P(sx * (ROUT - 7.4), ZBOT + 1.8, -2.12), segs=2, local=True))
        for (ru, rv) in ((ROUT - 1.6, ZBOT + 5), (ROUT - 1.6, ZBOT + 16), (ROUT - 7.0, ZBOT + 1.8), (ROUT - 12.0, ZBOT + 1.8)):
            objs.append(rig.cyl(0.045, 0.08, P(sx * ru, rv, -2.26), iron, rot=(math.pi / 2, 0, 0), verts=10))
    if cracked:
        def seg(p, q, w=0.42, yf=-1.66):
            dx, dz = q[0] - p[0], q[1] - p[1]; L = math.hypot(dx, dz); nx, nz = -dz / L * w / 2, dx / L * w / 2
            return prism('crack', [(p[0] + nx, p[1] + nz), (q[0] + nx, q[1] + nz), (q[0] - nx, q[1] - nz), (p[0] - nx, p[1] - nz)], yf, -1.3, crack)
        line = [rad(63, ROUT + 0.5), rad(62, 23.2), rad(66, 21.5), rad(64.5, 19.2), rad(69.5, 17.6), rad(68.5, R - 0.2)]
        for a, b in zip(line, line[1:]): objs.append(seg(a, b))
        line = [(ROUT + 0.3, -9.0), (ROUT - 3.2, -10.2), (ROUT - 4.4, -13.0), (ROUT - 8.0, -14.0), (R + 0.2, -15.2)]
        for a, b in zip(line, line[1:]): objs.append(seg(a, b))
    return objs


def ring(hw, zc, zbot, n=16):
    pts = [(-hw, zbot)]
    for i in range(n + 1):
        a = math.pi - math.pi * i / n
        pts.append((hw * math.cos(a), zc + hw * math.sin(a)))
    pts.append((hw, zbot))
    return pts


def build_back(mats):
    """dark tower interior: sloped reveals (sides + vaulted top + floor) leading to a far back wall"""
    fr = ring(18.0, ZC, ZB - 2.0)
    bk = ring(12.0, ZC + 0.5, -15.0)
    y_f, y_b = -0.45, 1.0
    bm = bmesh.new()
    vf = [bm.verts.new(P(u, v, y_f)) for u, v in fr]
    vb = [bm.verts.new(P(u, v, y_b)) for u, v in bk]
    n = len(fr)
    for i in range(n):
        j = (i + 1) % n
        f = bm.faces.new((vf[i], vf[j], vb[j], vb[i]))
        f.material_index = 1 if i == n - 1 else 0     # last segment = bottom edge = sill floor
    bm.faces.new(vb[::-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new('recess'); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new('recess', me); bpy.context.collection.objects.link(o)
    bpy.context.view_layer.objects.active = o; o.select_set(True)
    bpy.ops.object.shade_smooth(); o.select_set(False)
    o.data.materials.append(mats['inner']); o.data.materials.append(mats['floor'])
    return [o]


# ---------------------------------------------------------------- post
def clean(path):
    im = Image.open(path).convert('RGBA'); a = np.asarray(im).copy(); a[a[:, :, 3] == 0, :3] = 0
    im = Image.fromarray(a); im.save(path, optimize=True)
    assert not Image.open(path).info, 'stripped PNG metadata required'
    bounds = im.getchannel('A').getbbox(); assert bounds
    return im, bounds


def opening_mask(scale=1, erode=0):
    m = Image.new('L', (DRAW[0] * PPU * scale, DRAW[1] * PPU * scale), 0)
    ImageDraw.Draw(m).polygon([(x * PPU * scale, y * PPU * scale) for x, y in opening_polygon()], fill=255)
    if erode: m = m.filter(ImageFilter.MinFilter(erode * 2 + 1))
    return m


def grade_back(path):
    """clamp the interior into the near-black violet band #120c16..#2a1f2e, darker toward the arch top"""
    im = Image.open(path).convert('RGBA'); a = np.asarray(im).astype(np.float32)
    h, w = a.shape[:2]
    lum = (a[:, :, 0] * .3 + a[:, :, 1] * .5 + a[:, :, 2] * .2) / 255.0
    lo = np.array([0x12, 0x0c, 0x16], np.float32); hi = np.array([0x2a, 0x1f, 0x2e], np.float32)
    ytop = (ANCHOR[1] - (ZC + R)) * PPU; ybot = (ANCHOR[1] - ZB) * PPU
    g = np.clip((np.arange(h) - ytop) / (ybot - ytop), 0, 1)[:, None] ** 0.8      # 0 at arch crown -> 1 at sill
    msk = a[:, :, 3] > 250
    p1, p99 = np.percentile(lum[msk], [2, 99.5])
    t = np.clip((lum - p1) / max(p99 - p1, 1e-4), 0, 1) ** 0.9 * (0.3 + 0.7 * g)
    rgb = lo + (hi - lo) * t[:, :, None]
    # keep the warm key/cool bounce hint: blend 30% of the rendered hue ratio
    out = a.copy(); out[:, :, :3] = np.clip(rgb, 0, 255)
    Image.fromarray(out.astype(np.uint8), 'RGBA').save(path, optimize=True)


# ---------------------------------------------------------------- main
def main():
    sc = rig.reset(); sc.cycles.seed = 23
    sw, sh = DRAW
    stone = []
    for i, (hexc, c2) in enumerate((('#222736', '#171b26'), ('#262b3b', '#1a1e2a'), ('#1f2433', '#151824'))):
        m = rig.mat(f'castlestone{i}', rig.srgb(hexc), rough=0.82, coat=0.15)
        stone.append(rig.noisy(m, scale=7 + i, amount=0.4, bump=0.35, detail=8, color2=rig.srgb(c2)))
    stone[0] = rig.chamber_stone_mat()
    inner = rig.interior_mat()
    for n in inner.node_tree.nodes:
        if n.bl_idname == 'ShaderNodeTexBrick':
            n.inputs['Brick Width'].default_value = 1.3; n.inputs['Row Height'].default_value = 0.65
    mats = dict(stone=stone, iron=rig.cage_iron_mat('#454a58'), mortar=rig.mat('castle_mortar', rig.srgb('#0d0b14'), rough=1.0),
                crack=rig.mat('castle_crack', rig.srgb('#0a0810'), rough=1.0), inner=inner,
                floor=rig.noisy(rig.mat('castle_floor', rig.srgb('#2f3446'), rough=0.8), scale=6, amount=0.35, bump=0.3, color2=rig.srgb('#1d2130')))
    # kit-specific fill: the shared rig key is almost vertical, which leaves a deep recess black
    import mathutils
    for loc, energy, size, col in (((-5.5, -9.0, 4.5), FILL_KEY, 6, (1.0, 0.88, 0.76)), ((6.0, -8.0, -2.0), FILL_COOL, 8, (0.62, 0.70, 1.0))):
        bpy.ops.object.light_add(type='AREA', location=rig.at(loc[0], loc[2], loc[1]))
        lo = bpy.context.object; lo.data.energy = energy; lo.data.size = size; lo.data.color = col
        d = mathutils.Vector(rig.at(0, 0, -1.0)) - lo.location
        lo.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler(); lo.name = 'kitlight'
    sprites = {}
    poly = opening_polygon()
    jobs = [('window_back', 'back', False), ('window_front', 'front', False), ('window_front_cracked', 'front', True)]
    for name, kind, cracked in jobs:
        for o in list(bpy.context.scene.objects):
            if o.type in ('MESH', 'CURVE') and o.name != 'softbox': bpy.data.objects.remove(o, do_unlink=True)
        rnd = random.Random(11)          # same block jitter in all three so the frames register
        frame_objs = build_front(cracked, mats, rnd)
        if kind == 'back':
            objs = build_back(mats)
            rig.only(objs + frame_objs)
            for o in frame_objs: o.visible_camera = False     # frame still casts its shadow into the recess
        else:
            rig.only(frame_objs)
        path = OUT / f'{name}.png'
        rig.frame(sc, rig.P0[0] - sw / 2, rig.P0[1] - sh / 2, sw, sh, PPU, str(path), True, SAMPLES)
        if kind == 'back':
            import shutil; shutil.copy(path, HERE / 'source' / 'window_back_raw.png'); grade_back(path)
        im, bounds = clean(path)
        if kind == 'front':
            al = np.asarray(im.getchannel('A')); inside = np.asarray(opening_mask(1, 2)) > 0
            assert al[inside].max() == 0, f'{name}: opening not transparent (max alpha {al[inside].max()})'
            assert bounds[0] >= 9 and bounds[1] >= 9 and bounds[2] <= im.width - 9 and bounds[3] <= im.height - 9, bounds
        sprites[name] = {'path': path.relative_to(ROOT).as_posix(), 'px': list(im.size), 'ppu': PPU, 'drawSize': list(DRAW),
                         'anchor': list(ANCHOR), 'opening': poly, 'alphaBounds': list(bounds),
                         'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'encodedBytes': path.stat().st_size}
    manifest = {'version': 1, 'source': 'art/castle/window_kit.py', 'rig': 'art/render_vault_assets.py',
                'scope': 'Layered tower window. Draw order: window_back, clipped serpent (clip = opening polygon), window_front. '
                         'All sprites share drawSize/anchor so they register pixel for pixel. Blender Cycles CPU4, %d samples, Vault ortho rig/AgX look.' % SAMPLES,
                'opening': {'width': OPEN_W, 'height': OPEN_H, 'archRadius': R, 'frame': [2 * ROUT, 64]},
                'order': ['window_back', 'serpent', 'window_front'], 'sprites': sprites}
    (OUT / 'window-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    proof(sprites)
    print(json.dumps({'bytes': {k: v['encodedBytes'] for k, v in sprites.items()}, 'total': sum(v['encodedBytes'] for v in sprites.values())}), flush=True)


def compose(back, front, head, head_xy, head_scale=1.0, flip=False):
    """back + head clipped to opening polygon + front; head_xy = head cell top-left in drawSize units"""
    comp = back.copy()
    layer = Image.new('RGBA', comp.size, (0, 0, 0, 0))
    hs = round(256 * (44 * PPU / 256) * head_scale)
    hh = head.resize((hs, hs), Image.Resampling.LANCZOS)
    layer.alpha_composite(hh, (round(head_xy[0] * PPU), round(head_xy[1] * PPU)))
    m = opening_mask(1)
    layer.putalpha(ImageChops.multiply(layer.getchannel('A'), m))
    comp.alpha_composite(layer); comp.alpha_composite(front)
    return comp


def proof(sprites):
    back = Image.open(ROOT / sprites['window_back']['path']).convert('RGBA')
    front = Image.open(ROOT / sprites['window_front']['path']).convert('RGBA')
    crk = Image.open(ROOT / sprites['window_front_cracked']['path']).convert('RGBA')
    head = Image.open(ROOT / 'assets' / 'snake-emerald' / 'head_hunt_r.png').convert('RGBA')
    wall = (0x1d, 0x1a, 0x2b, 255)
    cw, ch = back.size
    # head cell is 44u; its visible mass is centred ~(0.47,0.50). place so the head rises out of the dark, lower half hidden by sill
    c1 = compose(back, front, head, (30 - 22 + 4, 36 - 22 + 17))
    c2 = compose(back, crk, head, (30 - 22 - 2, 36 - 22 + 1))
    pad = 14; tile_w, tile_h = cw + pad, ch + 34
    W = pad + tile_w * 5 + 4; H = tile_h + 20 + 2 * (ch // 3 * 3) + 120
    sheet = Image.new('RGBA', (W, 560), (0x19, 0x17, 0x25, 255)); d = ImageDraw.Draw(sheet)
    try: font = ImageFont.truetype('arial.ttf', 12)
    except Exception: font = ImageFont.load_default()
    checker = Image.new('RGBA', back.size, (60, 60, 70, 255)); cd = ImageDraw.Draw(checker)
    for yy in range(0, ch, 12):
        for xx in range(0, cw, 12):
            if (xx // 12 + yy // 12) % 2: cd.rectangle([xx, yy, xx + 11, yy + 11], fill=(88, 88, 100, 255))
    items = [('(a) back', back, True), ('(b) front', front, True), ('(b2) front cracked', crk, True),
             ('(c) back+serpent+front', c1, False), ('(c2) cracked, higher', c2, False)]
    for i, (lab, im, chk) in enumerate(items):
        x = pad + i * tile_w; y = 28
        base = checker.copy() if chk else Image.new('RGBA', back.size, wall)
        base.alpha_composite(im); sheet.alpha_composite(base, (x, y)); d.text((x, 8), lab, fill=(210, 220, 235, 255), font=font)
    # opening outline overlay on the cracked/clipped proof is not drawn: the clip is shown by the composite
    y2 = 28 + ch + 22
    d.text((pad, y2 - 14), '(d) native game scale 60x72u (1 px = 1 u) on wall #1d1a2b, and 3x nearest zoom', fill=(210, 220, 235, 255), font=font)
    nat = c1.resize((cw // PPU, ch // PPU), Image.Resampling.LANCZOS)
    wallbg = Image.new('RGBA', (cw // PPU + 40, ch // PPU + 40), wall)
    for k, im in enumerate((c1, c2)):
        n_ = im.resize((cw // PPU, ch // PPU), Image.Resampling.LANCZOS)
        panel = Image.new('RGBA', (cw // PPU + 40, ch // PPU + 40), wall); panel.alpha_composite(n_, (20, 20))
        sheet.alpha_composite(panel, (pad + k * (panel.width + 10), y2))
        z = panel.resize((panel.width * 3, panel.height * 3), Image.Resampling.NEAREST)
        sheet.alpha_composite(z, (pad + 2 * (panel.width + 10) + k * (z.width + 10), y2))
    sheet = sheet.crop((0, 0, W, min(560, y2 + (ch // PPU + 40) * 3 + 10)))
    sheet.convert('RGB').save(PROOF / 'window.png', optimize=True)


if __name__ == '__main__': main()
