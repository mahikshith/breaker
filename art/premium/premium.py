"""Premium pass art: brings the earlier chapters up to the Gatehouse Siege finish (glazed bricks, rendered crash
pieces, lit backdrop). Same ortho rig, lights, glaze and AgX look as the Vault bricks (art/render_vault_assets.py).

Run from the repo root with bpy 5.2:
  python3 art/premium/premium.py all             # every family + manifest + proof sheets
  python3 art/premium/premium.py bricks          # glazed brick families (Bellforge ceramic, Bellforge pin, Carrier enamel, Frost posts)
  python3 art/premium/premium.py shards          # glazed shards per palette, ice and hull shards, impact glints
  python3 art/premium/premium.py frost [--fast]  # Frost Warden backdrop plate (fast = 1 px/unit, few samples)
  python3 art/premium/premium.py post            # manifest + proof sheets only
Outputs: assets/premium/<family>/*.png and assets/premium/manifest.json; proofs in art/premium/proof/.
"""
from pathlib import Path
import sys, json, hashlib, math, random
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'art'))
import render_vault_assets as rig
import bpy, bmesh
from PIL import Image, ImageDraw, ImageFilter, ImageChops
import numpy as np

HERE = Path(__file__).resolve().parent
OUT = ROOT / 'assets' / 'premium'
PROOF = HERE / 'proof'
SRC = HERE / 'source'
for d in (OUT, PROOF, SRC): d.mkdir(parents=True, exist_ok=True)
rig.TMP = str(SRC)
rig.THREADS = 4
U = rig.U
FAST = '--fast' in sys.argv
REC = SRC / 'records.json'   # per-sprite metadata written by the render passes, read by post()


def record(key, **kw):
    data = json.loads(REC.read_text()) if REC.exists() else {}
    data[key] = kw; REC.write_text(json.dumps(data, indent=1))


def clear_meshes():
    for o in list(bpy.context.scene.objects):
        if o.type in ('MESH', 'CURVE') and o.name != 'softbox': bpy.data.objects.remove(o, do_unlink=True)


def strip(path, alpha=True):
    """Re-save without metadata; zero RGB under fully transparent pixels."""
    im = Image.open(path).convert('RGBA' if alpha else 'RGB')
    if alpha:
        a = np.asarray(im).copy(); a[a[:, :, 3] == 0, :3] = 0; im = Image.fromarray(a)
    clean = Image.frombytes(im.mode, im.size, im.tobytes())
    clean.save(path, optimize=True)
    return clean


def render_sprite(objs, key, family, w, h, ppu, samples=64, hook=None, **meta):
    rig.only(objs)
    path = OUT / family / f'{key}.png'; path.parent.mkdir(parents=True, exist_ok=True)
    rig.frame(bpy.context.scene, rig.P0[0] - w / 2, rig.P0[1] - h / 2, w, h, ppu, str(path), True, 24 if FAST else samples)
    if hook: hook(path)
    im = strip(path)
    b = im.getchannel('A').point(lambda a: 255 if a >= 16 else 0).getbbox()
    assert b and b[0] > 0 and b[1] > 0 and b[2] < im.width and b[3] < im.height, f'{key} touches the edge {b}'
    record(f'{family}/{key}', family=family, px=list(im.size), ppu=ppu, drawSize=[w, h], alphaBounds=list(b), **meta)


# ---------------------------------------------------------------- materials
def glaze(name, hexc, seed=1, crack=None, dims=None):
    return rig.glaze_mat(name, hexc, seed, crack, dims, gloss=True)


def principled(name, hexc, rough=.4, metal=0., coat=0., sss=0., ior=None, trans=0.):
    m = rig.mat(name, rig.srgb(hexc), rough=rough, metal=metal, coat=coat, sss=sss)
    b = m.node_tree.nodes['Principled BSDF']
    if ior: b.inputs['IOR'].default_value = ior
    if trans: b.inputs['Transmission Weight'].default_value = trans
    return m


def ice_mat(name='ice'):
    m = principled(name, '#d4ecff', rough=.08, coat=1., ior=1.31, trans=.35, sss=.35)
    return rig.noisy(m, scale=14, amount=.18, bump=.18, color2=rig.srgb('#7fb4e6'))


def iron_mat(name, hexc='#323844'):
    return rig.cage_iron_mat(hexc) if name is None else rig.noisy(principled(name, hexc, rough=.32, metal=.9, coat=.3), scale=11, amount=.18, bump=.08)


def brass_mat(name='brass'):
    return principled(name, '#c79a55', rough=.2, metal=1., coat=.2)


def card(name, W, H, y_face, d=2.5, strength=12.0, right=.3, window=True, sheen=.12, left=.35, top=1.0, win_top=.10):
    """rig.gloss_card with tunable glints: reflection-only softbox card in front of a sprite face. The window over the
    upper face gives the broad ceramic sheen, `top` the top-bevel glint, `left` the left-bevel column (kept soft here:
    the Gatehouse tiles read as pillowy, not chromed)."""
    mth, maprange, node, feed = rig.mth, rig.maprange, rig.node, rig.feed
    x0, _, z0 = rig.at()
    bpy.ops.mesh.primitive_plane_add(size=1, location=(x0, y_face - d, z0), rotation=(math.radians(90), 0, 0))
    o = bpy.context.object; o.name = name; o.scale = (W + 14, H + 14, 1); bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    for a in ('visible_camera', 'visible_diffuse', 'visible_transmission', 'visible_volume_scatter', 'visible_shadow'): setattr(o, a, False)
    m = bpy.data.materials.new(name); nt = m.node_tree; nt.nodes.remove(nt.nodes['Principled BSDF'])
    tc = node(nt, 'ShaderNodeTexCoord'); sep = node(nt, 'ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['Object'], sep.inputs['Vector'])
    X, Z = sep.outputs['X'], sep.outputs['Y']
    edge = mth(nt, 'SUBTRACT', Z, mth(nt, 'MULTIPLY', X, .10))
    win = maprange(nt, edge, H * win_top, H * win_top + .35)
    if window:
        win = mth(nt, 'MULTIPLY', win, maprange(nt, Z, H / 2 + 2.4, H / 2 + 3.2, 1, 0))
        win = mth(nt, 'MULTIPLY', win, mth(nt, 'ADD', .45, mth(nt, 'MULTIPLY', maprange(nt, Z, H * .1, H * .5), .55)))
    tp = mth(nt, 'MULTIPLY', maprange(nt, Z, H / 2 + .25, H / 2 + .6), maprange(nt, Z, H / 2 + 1.0, H / 2 + 4.5, 1, .1, smooth=False))
    lf = mth(nt, 'MULTIPLY', maprange(nt, X, -W / 2 - .2, -W / 2 - .7), maprange(nt, Z, -H / 2, H / 2 - .3, 0., 1., smooth=False))
    mask = mth(nt, 'MAXIMUM', mth(nt, 'MAXIMUM', mth(nt, 'MULTIPLY', win, sheen), mth(nt, 'MULTIPLY', tp, top)), mth(nt, 'MULTIPLY', lf, left))
    lum = mth(nt, 'MULTIPLY', mask, maprange(nt, X, -W / 2, W / 2 + .6, 1., right, smooth=False))
    em = node(nt, 'ShaderNodeEmission'); em.inputs['Color'].default_value = (1., .985, .97, 1)
    feed(nt, em.inputs['Strength'], mth(nt, 'MULTIPLY', lum, strength))
    tr = node(nt, 'ShaderNodeBsdfTransparent')
    nt.links.new(rig.mixs(nt, mth(nt, 'GREATER_THAN', lum, .002), tr.outputs[0], em.outputs[0]), nt.nodes['Material Output'].inputs['Surface'])
    o.data.materials.append(m)
    return o


def studio(front=1500.0, softbox_glossy=False):
    """Per-family tweak of the shared rig: a soft frontal fill from behind the camera lifts the glaze colour to the
    Gatehouse tiles' brightness, and the floor softbox is kept out of reflections (its stripe on the lower bevel
    read as a seam on the fatter ceramic bevel; the Gatehouse tiles have a dark lower lip)."""
    sb = bpy.data.objects.get('softbox')
    if sb: sb.visible_glossy = softbox_glossy
    for o in bpy.context.scene.objects:   # the warm bounce from below lit the lower bevel as a pale seam; keep it a dark lip
        if o.type == 'LIGHT' and o.name != 'frontfill' and abs(o.rotation_euler[0] - math.radians(140)) < .01:
            o.data['e0'] = o.data.get('e0', o.data.energy); o.data.energy = o.data['e0'] * (1.0 if softbox_glossy else 0.0)
    old = bpy.data.objects.get('frontfill')
    if old: bpy.data.objects.remove(old, do_unlink=True)
    if front:
        x, _, z = rig.at()
        bpy.ops.object.light_add(type='AREA', location=(x - 4, -24, z + 6), rotation=(math.radians(76), 0, math.radians(-9)))
        o = bpy.context.object; o.name = 'frontfill'; L = o.data; L.size = 18; L.energy = front; L.color = (1.0, .95, .9)
        o.visible_glossy = False


def env(name, y=-1.8, r=6.0):
    """Reflection-only surroundings for metal parts (rig.ball_env, re-centred on this sprite's face)."""
    o = rig.ball_env(name); o.location.y = y; o.scale = (r / 6, r / 6, r / 6)
    return o


# ---------------------------------------------------------------- crack texture (rig.crack_texture, any size)
def crack_texture(key, Wu, Hu, dmg, corner, n_hair=2, ppu=24, ss=3):
    k = ppu * ss
    big = Image.new('L', (round(Wu * k), round(Hu * k)), 0); d = ImageDraw.Draw(big)
    P = lambda x, y: (x * k, y * k)

    def walk(rng, x, y, ang, length, width, depth=0):
        seg = .8; n = max(3, int(length / seg)); pts = [(x, y)]
        for i in range(n):
            ang += rng.gauss(0, .30); x += math.cos(ang) * seg; y += math.sin(ang) * seg; pts.append((x, y))
            if not (-1 < x < Wu + 1 and -1 < y < Hu + 1): break
            if depth < 2 and i > 1 and rng.random() < .11:
                walk(rng, x, y, ang + rng.choice((-1, 1)) * rng.uniform(.6, 1.1), length * (1 - i / n) * rng.uniform(.35, .65), width * .6, depth + 1)
        for j in range(len(pts) - 1):
            t = j / (len(pts) - 1); wd = max(.12, width * (1 - t) ** .7)
            d.line([P(*pts[j]), P(*pts[j + 1])], fill=255, width=max(1, round(wd * k)))
            r = wd * k / 2; cx, cy = P(*pts[j + 1]); d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=255)

    def from_edge(rng, length, width):
        if rng.random() < .75:
            top = rng.random() < .5; x = rng.uniform(2.5, Wu - 2.5)
            walk(rng, x, .2 if top else Hu - .2, (math.pi / 2 if top else -math.pi / 2) + rng.uniform(-.7, .7), length, width)
        else:
            left = rng.random() < .5
            walk(rng, .2 if left else Wu - .2, rng.uniform(3, Hu - 3), (0 if left else math.pi) + rng.uniform(-.6, .6), length, width)

    r1 = random.Random(f'{key}-hairline')
    for _ in range(n_hair): from_edge(r1, r1.uniform(6, 9 + 0.15 * Wu), r1.uniform(.32, .42))
    if dmg >= 2:
        r2 = random.Random(f'{key}-shatter'); sx, sz = corner
        cx, cy = (Wu if sx > 0 else 0), (0 if sz > 0 else Hu)
        base = math.atan2(Hu / 2 - cy, Wu / 2 - cx)
        for i in range(4):
            a = base + (i - 1.5) * .42 + r2.uniform(-.15, .15)
            walk(r2, cx + math.cos(a) * 4.2, cy + math.sin(a) * 4.2, a, r2.uniform(7, 10 + .3 * max(Wu, Hu)), r2.uniform(.5, .65))
        from_edge(r2, r2.uniform(8, 10 + .2 * Wu), .45)
    size = (round(Wu * ppu), round(Hu * ppu))
    R = big.resize(size, Image.LANCZOS)
    halo = ImageChops.subtract(R.filter(ImageFilter.GaussianBlur(ppu * .9)).point(lambda v: min(255, v * 3)), R)
    Hh = R.filter(ImageFilter.GaussianBlur(ppu * .28)).point(lambda v: min(255, v * 1.6))
    path = SRC / f'crack_{key}_{dmg}.png'
    Image.merge('RGB', (R, halo, Hh)).save(path)
    return str(path)


def chip_corner(o, W, H, D, corner, rng, bis):
    """Boolean a few tumbled cubes out of one corner (rig.make_brick's dmg 2 chip)."""
    cx, _, cz = rig.at(); cut = []
    ox, oz = cx + corner[0] * W / 2, cz + corner[1] * H / 2
    for k in range(3):
        s = rng.uniform(.6, .75) * (1 if k == 0 else .7)
        bpy.ops.mesh.primitive_cube_add(size=s, location=(ox - corner[0] * rng.uniform(0, .22) * k, -D + rng.uniform(-.05, .08), oz - corner[1] * rng.uniform(0, .18) * (2 - k)),
                                        rotation=(rng.uniform(0, 3), rng.uniform(0, 3), rng.uniform(0, 3)))
        c = bpy.context.object; c.data.materials.append(bis); cut.append(c)
    for c in cut:
        bpy.context.view_layer.objects.active = o
        md = o.modifiers.new('chip', 'BOOLEAN'); md.operation = 'DIFFERENCE'; md.object = c; md.solver = 'EXACT'; md.material_mode = 'TRANSFER'
        bpy.ops.object.modifier_apply(modifier='chip')
    for c in cut: bpy.data.objects.remove(c)
    bpy.context.view_layer.objects.active = o; o.select_set(True)
    bpy.ops.object.shade_smooth_by_angle(angle=math.radians(35))


# ---------------------------------------------------------------- brick families
CERAMIC = {  # Bellforge: one glazed ceramic family in the Gatehouse/Tidewheel tile shape (cyan/rose/plum slots)
    'teal': '#2bb7a2', 'coral': '#ff6b4c', 'plum': '#9a6ae0',
}
ENAMEL = {'cyan': '#18b6f6', 'pink': '#f23c98'}   # Carrier A panels


def ceramic(key, hexc, dmg, Wu=34, Hu=18, D=1.3, bevel=.56):
    W, H = Wu * U, Hu * U
    rng = random.Random(f'cer{key}'); corner = (rng.choice((-1, 1)), rng.choice((-1, 1)))
    crack = crack_texture(f'cer{key}', Wu, Hu, dmg, corner) if dmg else None
    m = glaze(f'cer_{key}{dmg}', hexc, seed=len(key) * 5 + 3, crack=crack, dims=(W, H))
    o = rig.box(f'cer_{key}_{dmg}', W, H, D, bevel, m, rig.at(y=-D / 2), segs=10, local=True)
    if dmg >= 2: chip_corner(o, W, H, D, corner, rng, rig.biscuit_mat(f'bis_{key}', hexc))
    return [o, card(f'card_cer{key}{dmg}', W, H, -D, strength=11.0, sheen=.16, left=.22, top=.75)]


def pin_plate(dmg, Wu=30, Hu=18, D=1.0):
    """Bellforge ramp pin: an enamelled steel plate (the Gatehouse armour-brick finish) in a brass frame with four brass
    rivets; at 1 hp the enamel is crazed from one corner and a rivet has popped. The ratchet badge stays drawn on top."""
    W, H = Wu * U, Hu * U; objs = []
    frame_ = rig.box('pinframe', W, H, D, .3, brass_mat('pinbrass'), rig.at(y=-D / 2), segs=8, local=True)
    fw, fh = W - .55, H - .55
    crack = crack_texture('pin', fw / U, fh / U, 2, (1, 1), n_hair=2) if dmg else None
    face = rig.box('pinface', fw, fh, .3, .14, glaze(f'pinface{dmg}', '#8d9bb0', seed=4, crack=crack, dims=(fw, fh)), rig.at(y=-D - .1), segs=6, local=True)
    objs += [frame_, face]
    rv = principled('pinrivet', '#3a3530', rough=.25, metal=.9)
    spots = [(-1, -1), (1, -1), (-1, 1), (1, 1)][:3 if dmg else 4]
    for sx, sz in spots:
        bpy.ops.mesh.primitive_uv_sphere_add(radius=.19, segments=20, ring_count=10, location=rig.at(sx * (W / 2 - .45), sz * (H / 2 - .45), -D - .22))
        r = bpy.context.object; r.scale = (1, .6, 1); bpy.ops.object.shade_smooth(); r.data.materials.append(rv); objs.append(r)
    if dmg: face.rotation_euler[1] = math.radians(2.0)
    objs.append(card(f'card_pin{dmg}', fw, fh, -D - .25, strength=10.0, sheen=.14, left=.2, top=.7))
    return objs + [env(f'pinenv{dmg}')]


def enamel(key, hexc):
    """Carrier A panel: glossy vinyl-toy enamel slab with a recessed inner field and four chrome screws; reads as the
    source panels' crate without their flat print. The payload capsule is still drawn on top by the game."""
    Wu, Hu, D = 36, 17.33, 1.2
    W, H = Wu * U, Hu * U
    m = glaze(f'en_{key}', hexc, seed=7 + len(key))
    body = rig.box(f'en_{key}', W, H, D, .42, m, rig.at(y=-D / 2), segs=10, local=True)
    pocket = rig.box('pocket', W - 1.5, H - 1.2, .5, .2, m, rig.at(y=-D - .05), segs=4, local=True)
    bpy.context.view_layer.objects.active = body
    md = body.modifiers.new('p', 'BOOLEAN'); md.operation = 'DIFFERENCE'; md.object = pocket; md.solver = 'EXACT'
    bpy.ops.object.modifier_apply(modifier='p'); bpy.data.objects.remove(pocket)
    deep = '#' + ''.join(f'{int(int(hexc[k:k + 2], 16) * .82):02x}' for k in (1, 3, 5))
    field = rig.box('field', W - 1.6, H - 1.3, .3, .14, glaze(f'en_in_{key}', deep, seed=11 + len(key)), rig.at(y=-D + .12), segs=6, local=True)
    chrome = principled('screwchrome', '#e6e8ee', rough=.08, metal=1.)
    objs = [body, field]
    for sx in (-1, 1):
        for sz in (-1, 1):
            bpy.ops.mesh.primitive_uv_sphere_add(radius=.17, segments=20, ring_count=10, location=rig.at(sx * (W / 2 - .42), sz * (H / 2 - .4), -D - .02))
            sc_ = bpy.context.object; sc_.scale = (1, .45, 1); bpy.ops.object.shade_smooth(); sc_.data.materials.append(chrome); objs.append(sc_)
    return objs + [card(f'card_en{key}', W, H, -D, strength=10.0, sheen=.05, left=.2, top=.6), env(f'enenv{key}')]


def frost_post(dmg, Wu=18, Hu=68, D=2.0):
    """Frost Warden ward post: a stack of four frosted granite blocks bound by two iron bands, rime on top."""
    W, H = Wu * U, Hu * U; objs = []
    rng = random.Random('post')
    stone = rig.noisy(principled('poststone', '#6880a0', rough=.42, coat=.45, sss=.05), scale=16, amount=.3, bump=.28, color2=rig.srgb('#3a4a62'))
    snow = principled('postsnow', '#e4edf7', rough=.55, sss=.3)
    bh = H / 4
    for i in range(4):
        dz = H / 2 - bh * (i + .5)
        crack = None
        if dmg and i in ((1,) if dmg == 1 else (0, 1, 2)):
            crack = crack_texture(f'post{i}{dmg}', Wu, Hu / 4, dmg, (rng.choice((-1, 1)), rng.choice((-1, 1))), n_hair=1)
        m = glaze(f'pg{i}{dmg}', '#6880a0', seed=i + 2, crack=crack, dims=(W - .1, bh - .1)) if crack else stone
        if crack:   # keep the stone's matte frost under the cracks
            bb = m.node_tree.nodes['Principled BSDF']; bb.inputs['Coat Weight'].default_value = .35
        tilt = (rng.uniform(-1, 1) * (2.5 if dmg >= 2 else .6))
        o = rig.box(f'pb{i}', W - .1, bh - .1, D, .14, m, rig.at(rng.uniform(-.04, .04) * (1 + 3 * (dmg >= 2)), dz, -D / 2), segs=4, local=True)
        o.rotation_euler[1] = math.radians(tilt); objs.append(o)
    band = brass_mat('postband')
    for dz in (H / 4, -H / 4):
        objs.append(rig.box('band', W + .14, .42, D + .14, .06, band, rig.at(0, dz, -D / 2), segs=3, local=True))
    cap = rig.box('cap', W + .1, .5, D + .1, .22, snow, rig.at(0, H / 2 + .1, -D / 2), segs=6, local=True)
    objs.append(cap)
    if dmg >= 2:   # chunks knocked out of the top block corner
        chip_corner(objs[0], W - .1, bh - .1, D, (1, 1), rng, rig.biscuit_mat('postbis', '#8098b3'))
    return objs + [card(f'card_post{dmg}', W, H, -D, strength=4.0, sheen=.06, left=.25, top=.5, window=False), env(f'postenv{dmg}', r=9)]


def bricks():
    sc = rig.reset(); sc.cycles.seed = 23
    studio(front=1500.0)
    for key, hexc in CERAMIC.items():
        clear_meshes()
        render_sprite(ceramic(key, hexc, 0), f'ceramic_{key}', 'bellforge', 38, 22, 8, samples=64,
                      contact=[34, 18], use=f'Bellforge glazed ceramic brick ({key}); same tile as the Gatehouse/Tidewheel bricks')
    for dmg in (0, 1):
        clear_meshes()
        render_sprite(pin_plate(dmg), f'pin_{2 - dmg}hp', 'bellforge', 34, 22, 8, samples=64, contact=[30, 18],
                      use=f'Bellforge ramp pin plate, {2 - dmg} hit(s) left; draw the ratchet badge on top as now')
    studio(front=850.0)
    for key, hexc in ENAMEL.items():
        clear_meshes()
        render_sprite(enamel(key, hexc), f'enamel_{key}', 'carrier', 44, 28, 6, samples=64, contact=[36, 17.33], hook=saturate(1.55),
                      use=f'Carrier A {key} panel, drop-in for assets/space-a/brick_{key}.png (same normalized frame and alpha bounds)')
    studio(front=500.0, softbox_glossy=True)
    for dmg in (0, 1, 2):
        clear_meshes()
        render_sprite(frost_post(dmg), f'post_{dmg}', 'frost', 26, 80, 4, samples=64, contact=[18, 68],
                      use=['Frost ward post intact', 'Frost ward post cracked (hp <= 2/3)', 'Frost ward post breaking (hp <= 1/3)'][dmg])


# ---------------------------------------------------------------- shards and glints
SHARD_GLAZE = {  # palette -> glaze colour (Vault/Frost/Mooncoil bricks, Carrier panels, fantasy ceramic)
    'teal': '#22c4b0', 'violet': '#8f5cf0', 'coral': '#ff6f61', 'gold': '#ffc73d', 'blue': '#4f9dff',
    'cyan': '#1aa6e0', 'pink': '#e2459b', 'sage': '#55876a', 'ivory': '#e8d1b3', 'ceramic': '#e8573f', 'plum': '#7d4fc4',
}


def shard_outline(seed, r=3.0):
    rng = random.Random(seed); n = rng.choice((4, 5, 5, 6))
    angs = sorted(rng.uniform(0, 2 * math.pi) for _ in range(n))
    angs = [i * 2 * math.pi / n + rng.uniform(-.35, .35) for i in range(n)]   # spread so no shard comes out a sliver
    pts = [(r * rng.uniform(.7, 1.05) * math.cos(a), r * rng.uniform(.7, 1.05) * math.sin(a) * .8) for a in angs]
    return pts


def shard(name, pts, depth, face_mat, side_mat, tilt):
    """Slab with the glazed face toward the camera and broken biscuit sides, tumbled so a side shows."""
    bm = bmesh.new()
    vs = [bm.verts.new((x * U, 0, z * U)) for x, z in pts]
    f = bm.faces.new(vs)
    ext = bmesh.ops.extrude_face_region(bm, geom=[f])
    bmesh.ops.translate(bm, vec=(0, depth * U, 0), verts=[v for v in ext['geom'] if isinstance(v, bmesh.types.BMVert)])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(o)
    o.data.materials.append(face_mat); o.data.materials.append(side_mat)
    for p in me.polygons:
        p.material_index = 0 if abs(p.normal.y) > .7 else 1
        p.use_smooth = True
    b = o.modifiers.new('bevel', 'BEVEL'); b.width = .022; b.segments = 2; b.limit_method = 'ANGLE'
    o.modifiers.new('wn', 'WEIGHTED_NORMAL').keep_sharp = True
    o.location = rig.at(y=-2.0); o.rotation_euler = tilt
    return o


def glint(name, hexc, rays=4, L=5.0, w=.45):
    em = rig.emit_mat(name, rig.srgb(hexc), 2.2)
    pts = []
    for i in range(rays * 2):
        a = i * math.pi / rays + math.pi / 2
        r = (L if i % 2 == 0 else w) * (1 if (i // 2) % 2 == 0 else .62)
        pts.append((r * math.cos(a), r * math.sin(a)))
    bm = bmesh.new(); vs = [bm.verts.new((x * U, 0, z * U)) for x, z in pts]; bm.faces.new(vs)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(o); o.data.materials.append(em)
    o.location = rig.at(y=-2.0)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.3 * U, segments=24, ring_count=12, location=rig.at(y=-2.1))
    core = bpy.context.object; core.data.materials.append(rig.emit_mat(name + 'c', (1, 1, 1), 4.0))
    return [o, core]


def saturate(k):
    """AgX rolls bright saturated glaze toward pastel; the Carrier panels must stay neon cyan/pink like the source set."""
    def run(path):
        from PIL import ImageEnhance
        im = Image.open(path).convert('RGBA'); a = im.getchannel('A')
        rgb = ImageEnhance.Color(im.convert('RGB')).enhance(k); rgb.putalpha(a); rgb.save(path)
    return run


def bloom(tint):
    """Soft halo for an emissive glint (Cycles has no glare here): blurred copies of the crisp star, tinted, under it."""
    def run(path):
        im = Image.open(path).convert('RGBA'); a = np.asarray(im).astype(np.float32) / 255
        out = np.zeros_like(a); t = np.array(rig.srgb(tint)) ** (1 / 2.2)
        for rad, gain in ((2, 1.6), (5, 1.1), (10, .7)):
            al = np.asarray(im.getchannel('A').filter(ImageFilter.GaussianBlur(rad))).astype(np.float32) / 255 * gain
            out[..., :3] += t * al[..., None]; out[..., 3] = np.maximum(out[..., 3], al)
        out[..., 3] = np.clip(out[..., 3], 0, 1)
        top = a[..., 3:4]; rgb = a[..., :3] * top + np.clip(out[..., :3], 0, 1) * (1 - top)
        alpha = top[..., 0] + out[..., 3] * (1 - top[..., 0])
        rgb = np.where(alpha[..., None] > 0, rgb / np.maximum(alpha[..., None], 1e-4), 0)
        Image.fromarray((np.dstack([np.clip(rgb, 0, 1), np.clip(alpha, 0, 1)]) * 255 + .5).astype(np.uint8)).save(path)
    return run


def shards():
    sc = rig.reset(); sc.cycles.seed = 31
    studio(front=1300.0)
    tilts = [(math.radians(24), math.radians(14), math.radians(10)), (math.radians(-18), math.radians(-22), math.radians(-14)),
             (math.radians(12), math.radians(28), math.radians(30))]
    for pal, hexc in SHARD_GLAZE.items():
        face = glaze(f'sh_{pal}', hexc, seed=len(pal)); side = rig.biscuit_mat(f'shb_{pal}', hexc)
        for i in range(3):
            clear_meshes()
            o = shard(f'sh{pal}{i}', shard_outline(f'{pal}{i}'), 1.6, face, side, tilts[i])
            render_sprite([o, env(f'shenv{pal}{i}', y=-2.0, r=4), card(f'shcard{pal}{i}', .6, .5, -2.3, d=2.0, strength=9.0, sheen=.3, left=.0, top=.0)], f'{pal}_{"abc"[i]}', 'shards', 8, 8, 6, samples=48,
                          use=f'glazed {pal} brick shard; spin while it falls')
    ice = ice_mat(); frostf = principled('icefrost', '#d8ecff', rough=.45, sss=.3)
    for i in range(3):
        clear_meshes()
        pts = [(x * 1.1, z * 1.3) for x, z in shard_outline(f'ice{i}', 2.4)]
        o = shard(f'ice{i}', pts, 1.4, ice, frostf, tilts[i])
        render_sprite([o, env(f'iceenv{i}', y=-2.0, r=4)], f'ice_{"abc"[i]}', 'shards', 8, 8, 6, samples=64, use='ice shard (Frost: Warden punch, post break, frozen bricks)')
    hull = rig.noisy(principled('hullplate', '#9aa3b6', rough=.28, metal=.75, coat=.4), scale=11, amount=.15, bump=.06); paint = principled('hullpaint', '#d8489c', rough=.25, coat=1.)
    for i in range(3):
        clear_meshes()
        o = shard(f'hull{i}', shard_outline(f'hull{i}', 2.8), .7, paint if i == 1 else hull, principled('hulledge', '#c9cfdb', rough=.2, metal=1.), tilts[i])
        render_sprite([o, env(f'hullenv{i}', y=-2.0, r=4)], f'hull_{"abc"[i]}', 'shards', 8, 8, 6, samples=48, use='gunmetal hull plate shard (Carrier, Circuit, Forge structural hits)')
    for key, hexc in (('warm', '#ffc477'), ('cool', '#9fd8ff'), ('rose', '#ff9cc8')):
        clear_meshes()
        render_sprite(glint(f'gl{key}', hexc), f'glint_{key}', 'glints', 16, 16, 6, samples=16, hook=bloom(hexc), use=f'{key} impact glint; replaces fx.ring on brick/armour hits (scale 0.6->1.2, fade 0.25 s)')


# ---------------------------------------------------------------- Frost backdrop plate
FROST = dict(x0=0, y0=0, w=360, h=800, ppu=2)
WALK_X0, WALK_X1, WALK_REAR, WALK_FRONT = 6, 264, 214, 238      # Warden's rampart walk (feet at y ~234)
LEDGE = (266, 202, 64, 14)                                      # Lumi's balcony slab (x, top y, w, h); her feet at (299, 202)
ALCOVE = (272, 134, 54, 68)                                     # arched window behind Lumi (x, y, w, h)


def snow_mix(nt, base_shader, threshold=.55, patch=True):
    """Mix toward snow on upward-facing surfaces."""
    geo = rig.node(nt, 'ShaderNodeNewGeometry'); sep = rig.node(nt, 'ShaderNodeSeparateXYZ')
    nt.links.new(geo.outputs['Normal'], sep.inputs['Vector'])
    up = rig.maprange(nt, sep.outputs['Z'], threshold, threshold + .25)
    if patch:
        tc = rig.node(nt, 'ShaderNodeTexCoord'); nz = rig.node(nt, 'ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 3.0; nz.inputs['Detail'].default_value = 6
        nt.links.new(tc.outputs['Object'], nz.inputs['Vector'])
        up = rig.mth(nt, 'MULTIPLY', up, rig.maprange(nt, nz.outputs['Fac'], .35, .55))
    snow = rig.principled(nt, rig.srgb('#e3ecf7'), .55)
    return rig.mixs(nt, up, base_shader, snow)


def frost_stone(name, hexc='#3a4a60', dark='#222c3c', scale=7, snow=True, rime=.35):
    m = bpy.data.materials.new(name); nt = m.node_tree; b = nt.nodes['Principled BSDF']
    b.inputs['Roughness'].default_value = .62; b.inputs['Coat Weight'].default_value = .2
    tc = rig.node(nt, 'ShaderNodeTexCoord'); nz = rig.node(nt, 'ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = scale; nz.inputs['Detail'].default_value = 8
    nt.links.new(tc.outputs['Object'], nz.inputs['Vector'])
    fr = rig.node(nt, 'ShaderNodeTexNoise'); fr.inputs['Scale'].default_value = 22; fr.inputs['Detail'].default_value = 4
    nt.links.new(tc.outputs['Object'], fr.inputs['Vector'])
    col = rig.mixc(nt, rig.maprange(nt, nz.outputs['Fac'], .3, .7), rig.srgb(dark), rig.srgb(hexc))
    col = rig.mixc(nt, rig.mth(nt, 'MULTIPLY', rig.maprange(nt, fr.outputs['Fac'], .55, .75), rime), col, rig.srgb('#9fb6cf'))   # rime speckle
    nt.links.new(col, b.inputs['Base Color'])
    bp = rig.node(nt, 'ShaderNodeBump'); bp.inputs['Strength'].default_value = .35; bp.inputs['Distance'].default_value = .05
    nt.links.new(nz.outputs['Fac'], bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    if snow:
        out = nt.nodes['Material Output']; nt.links.new(snow_mix(nt, b.outputs[0]), out.inputs['Surface'])
    return m


def S(x, y): return (x * U, -y * U)


def blk(name, x0, y0, w, h, d, yb, m, bevel=.12, segs=3):
    cx, cz = S(x0 + w / 2, y0 + h / 2)
    return rig.box(name, w * U, h * U, d, bevel, m, (cx, yb + d / 2, cz), segs=segs)


def frost_sky():
    x0, x1, y0, y1 = -40, 400, -60, 320
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 40, 0), rotation=(math.radians(90), 0, 0))
    o = bpy.context.object; o.name = 'sky'
    bm = bmesh.new(); bm.from_mesh(o.data)
    for v in bm.verts: v.co.x = (x1 if v.co.x > 0 else x0) * U; v.co.y = -(y0 if v.co.y > 0 else y1) * U
    bm.to_mesh(o.data); bm.free()
    for a in ('visible_diffuse', 'visible_glossy', 'visible_transmission', 'visible_volume_scatter', 'visible_shadow'): setattr(o, a, False)
    m = bpy.data.materials.new('fsky'); nt = m.node_tree; nt.nodes.remove(nt.nodes['Principled BSDF'])
    tc = rig.node(nt, 'ShaderNodeTexCoord'); sep = rig.node(nt, 'ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['Object'], sep.inputs['Vector'])
    X, Z = sep.outputs['X'], sep.outputs['Y']
    g = rig.node(nt, 'ShaderNodeValToRGB'); e = g.color_ramp.elements
    nt.links.new(rig.maprange(nt, Z, -21.0, -2.0, 0, 1, smooth=False), g.inputs['Fac'])
    e[0].position = 0; e[0].color = (.045, .07, .12, 1); e[1].position = 1; e[1].color = (.006, .009, .024, 1)
    mid = g.color_ramp.elements.new(.5); mid.color = (.018, .028, .058, 1)
    col = g.outputs['Color']
    mp = rig.node(nt, 'ShaderNodeMapping'); mp.inputs['Scale'].default_value = (.16, 1.4, 1); nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])
    cn = rig.node(nt, 'ShaderNodeTexNoise'); cn.inputs['Scale'].default_value = .8; cn.inputs['Detail'].default_value = 5; cn.inputs['Roughness'].default_value = .6
    nt.links.new(mp.outputs['Vector'], cn.inputs['Vector'])
    cloud = rig.mth(nt, 'MULTIPLY', rig.maprange(nt, cn.outputs['Fac'], .52, .74), rig.maprange(nt, Z, -19, -6, .9, .35))
    col = rig.mixc(nt, rig.mth(nt, 'MULTIPLY', cloud, .5), col, (.07, .09, .14))
    star = 0.0
    for scale, rad, gain in ((.5, .07, 4.0), (1.3, .04, 1.4)):
        v = rig.node(nt, 'ShaderNodeTexVoronoi'); v.inputs['Scale'].default_value = scale; nt.links.new(tc.outputs['Object'], v.inputs['Vector'])
        r = rig.node(nt, 'ShaderNodeSeparateColor'); nt.links.new(v.outputs['Color'], r.inputs['Color'])
        s = rig.mth(nt, 'MULTIPLY', rig.maprange(nt, v.outputs['Distance'], rad * .3, rad, 1, 0), rig.mth(nt, 'MULTIPLY', rig.mth(nt, 'POWER', r.outputs[0], 5.0), gain))
        star = rig.mth(nt, 'ADD', star, s)
    MX, MZ = S(40, 100)
    dx = rig.mth(nt, 'SUBTRACT', X, MX); dz = rig.mth(nt, 'SUBTRACT', Z, MZ)
    d = rig.mth(nt, 'SQRT', rig.mth(nt, 'ADD', rig.mth(nt, 'MULTIPLY', dx, dx), rig.mth(nt, 'MULTIPLY', dz, dz)))
    star = rig.mth(nt, 'MULTIPLY', star, rig.mth(nt, 'MULTIPLY', rig.mth(nt, 'SUBTRACT', 1.0, cloud, clamp=True), rig.maprange(nt, d, 1.6, 4.0)))
    col = rig.mixc(nt, rig.mth(nt, 'MINIMUM', star, 1.0), col, (.8, .86, 1.0))
    mn = rig.node(nt, 'ShaderNodeTexNoise'); mn.inputs['Scale'].default_value = 2.4; mn.inputs['Detail'].default_value = 3; nt.links.new(tc.outputs['Object'], mn.inputs['Vector'])
    disc = rig.maprange(nt, d, .98, 1.02, 1, 0)
    mcol = rig.mixc(nt, rig.maprange(nt, mn.outputs['Fac'], .45, .65), (.66, .72, .82), (.92, .95, 1.0))
    glow = rig.mth(nt, 'ADD', rig.mth(nt, 'MULTIPLY', rig.mth(nt, 'EXPONENT', rig.mth(nt, 'MULTIPLY', d, -1.4)), .5),
                   rig.mth(nt, 'MULTIPLY', rig.mth(nt, 'EXPONENT', rig.mth(nt, 'MULTIPLY', d, -.3)), .08))
    col = rig.mixc(nt, rig.mth(nt, 'MINIMUM', glow, 1.0), col, (.30, .38, .52))
    col = rig.mixc(nt, disc, col, mcol)
    em = rig.node(nt, 'ShaderNodeEmission'); nt.links.new(col, em.inputs['Color'])
    rig.feed(nt, em.inputs['Strength'], rig.maprange(nt, disc, 0, 1, 1.0, 2.0, smooth=False))
    nt.links.new(em.outputs[0], nt.nodes['Material Output'].inputs['Surface'])
    o.data.materials.append(m)


def mountains():
    """Two ranges of snow-capped peaks behind the rampart, faintly moonlit, emissive so they stay calm and soft."""
    for layer, (yb, top, amp, seed, c0, c1, strength) in enumerate(((30, 112, 62, 3, '#0b1220', '#7088aa', .5), (24, 150, 36, 8, '#0a0f1a', '#50648a', .42))):
        rng = random.Random(seed); pts = []
        x = -40
        while x < 400:
            pts.append((x, top + (rng.uniform(.65, 1.0) * amp if len(pts) % 2 else rng.uniform(0, .2) * amp))); x += rng.uniform(26, 52)
        for k in range(4):   # midpoint displacement: shoulders and sub-peaks instead of clean triangles
            out = []
            for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
                out.append((x0, y0)); out.append(((x0 + x1) / 2 + rng.uniform(-.15, .15) * (x1 - x0), (y0 + y1) / 2 + rng.uniform(-1, 1) * amp * .32 / (k + 1)))
            pts = out + [pts[-1]]
        pts.append((400, top + amp)); pts += [(400, 330), (-40, 330)]
        bm = bmesh.new(); vs = [bm.verts.new((px * U, 0, -py * U)) for px, py in pts]; bm.faces.new(vs)
        me = bpy.data.meshes.new(f'mtn{layer}'); bm.to_mesh(me); bm.free()
        o = bpy.data.objects.new(f'mtn{layer}', me); bpy.context.collection.objects.link(o); o.location = (0, yb, 0)
        for a in ('visible_diffuse', 'visible_glossy', 'visible_shadow'): setattr(o, a, False)
        m = bpy.data.materials.new(f'mtn{layer}'); nt = m.node_tree; nt.nodes.remove(nt.nodes['Principled BSDF'])
        tc = rig.node(nt, 'ShaderNodeTexCoord'); sep = rig.node(nt, 'ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['Object'], sep.inputs['Vector'])
        nz = rig.node(nt, 'ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = .9; nz.inputs['Detail'].default_value = 2.5; nz.inputs['Roughness'].default_value = .45
        nt.links.new(tc.outputs['Object'], nz.inputs['Vector'])
        h = rig.mth(nt, 'ADD', sep.outputs['Z'], rig.mth(nt, 'MULTIPLY', nz.outputs['Fac'], 1.4))
        snowline = rig.maprange(nt, h, -(top + amp * .9) * U + 1.1, -(top) * U + .6)
        ridge = rig.maprange(nt, rig.mth(nt, 'ABSOLUTE', rig.mth(nt, 'SUBTRACT', nz.outputs['Fac'], .5)), 0, .12, 1, 0)
        lit = rig.mth(nt, 'MULTIPLY', snowline, rig.mth(nt, 'ADD', .75, rig.mth(nt, 'MULTIPLY', ridge, .25)))
        col = rig.mixc(nt, lit, rig.srgb(c0), rig.srgb(c1))
        fade = rig.maprange(nt, sep.outputs['Z'], -(top + 90) * U, -(top + 20) * U, 0.0, 1.0)  # sink into haze toward the bottom
        col = rig.mixc(nt, rig.mth(nt, 'SUBTRACT', 1.0, fade), col, (.02, .03, .05))
        em = rig.node(nt, 'ShaderNodeEmission'); nt.links.new(col, em.inputs['Color']); em.inputs['Strength'].default_value = strength
        nt.links.new(em.outputs[0], nt.nodes['Material Output'].inputs['Surface']); o.data.materials.append(m)


def arch_slab(name, x0, y0, w, h, d, yb, m, bevel=.08):
    """Arched opening shape (flat bottom, round top) extruded d metres from yb toward +y."""
    r = w / 2; pts = [(x0, y0 + h), (x0 + w, y0 + h)]
    for i in range(25):
        a = i * math.pi / 24; pts.append((x0 + r + r * math.cos(a), y0 + r - r * math.sin(a)))
    bm = bmesh.new(); vs = [bm.verts.new((px * U, 0, -py * U)) for px, py in pts]; f = bm.faces.new(vs)
    ext = bmesh.ops.extrude_face_region(bm, geom=[f])
    bmesh.ops.translate(bm, vec=(0, d, 0), verts=[v for v in ext['geom'] if isinstance(v, bmesh.types.BMVert)])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(o); o.location = (0, yb, 0); o.data.materials.append(m)
    b = o.modifiers.new('b', 'BEVEL'); b.width = bevel; b.segments = 3; b.limit_method = 'ANGLE'
    for p in me.polygons: p.use_smooth = True
    return o


def build_frost():
    random.seed(5); rng = random.Random(5)
    frost_sky(); mountains()
    stone = frost_stone('fstone'); dstone = frost_stone('fdark', '#2a3546', '#151c28', snow=True, rime=.25)
    deep = frost_stone('fdeep', '#1d2533', '#0f141d', snow=False, rime=.15)
    brass = brass_mat('fbrass'); ice = ice_mat('fice')
    # --- rear parapet: crenellated wall behind the walk (gaps show the peaks)
    for i in range(0, 13):
        x = WALK_X0 - 2 + i * 21
        if x > WALK_X1: break
        blk(f'merlon{i}', x, 170 + rng.uniform(-1, 1), min(14, WALK_X1 + 2 - x), 18, 1.0, 1.2, stone, bevel=.2)
    for i in range(0, 8):
        x = WALK_X0 - 2 + i * 38
        blk(f'rear{i}', x, 186, min(38, WALK_X1 + 2 - x) - .4, 14, 1.0, 1.25 + rng.uniform(0, .05), stone, bevel=.12)
    blk('rearback', WALK_X0 - 2, 186, WALK_X1 - WALK_X0 + 4, 30, .3, 2.2, deep, bevel=0)
    walkm = frost_stone('fwalk', '#2a3547', '#171e2b', snow=False, rime=.22)
    # --- walk floor: a tilted flagstone strip so the ortho camera sees it (rear 214 at y=+1.2, front 238 at y=-1.6)
    for row in range(3):
        ya, yb_ = WALK_REAR + row * 8, WALK_REAR + (row + 1) * 8
        off = (row % 2) * 13
        for i in range(-1, 11):
            x = WALK_X0 + i * 26 + off
            xa, xb = max(x, WALK_X0), min(x + 26, WALK_X1)
            if xb - xa < 2: continue
            da = 1.2 - 2.8 * (ya - WALK_REAR) / 24; db = 1.2 - 2.8 * (yb_ - WALK_REAR) / 24
            cx, cz = S((xa + xb) / 2, (ya + yb_) / 2)
            L = math.hypot((yb_ - ya) * U, da - db)
            bpy.ops.mesh.primitive_cube_add(size=1, location=(cx, (da + db) / 2 + .05, cz))
            o = bpy.context.object; o.scale = ((xb - xa) * U - .1, .25, L - .08)
            o.rotation_euler[0] = -math.atan2(da - db, (yb_ - ya) * U)
            bpy.ops.object.transform_apply(rotation=False, scale=True)
            md = o.modifiers.new('b', 'BEVEL'); md.width = .06; md.segments = 2; md.limit_method = 'NONE'; bpy.ops.object.modifier_apply(modifier='b')
            bpy.ops.object.shade_smooth(); o.data.materials.append(walkm)
    # --- front lip of the walk with snow, icicles below
    blk('lip', WALK_X0 - 3, WALK_FRONT, WALK_X1 - WALK_X0 + 6, 12, 1.9, -1.7, stone, bevel=.22, segs=4)
    for i in range(int((WALK_X1 - WALK_X0) / 7)):
        x = WALK_X0 + 3 + i * 7 + rng.uniform(-2, 2); L = rng.choice((3, 4, 5, 7, 9)) * rng.uniform(.8, 1.2)
        bpy.ops.mesh.primitive_cone_add(radius1=rng.uniform(.9, 1.4) * U, radius2=0, depth=L * U, vertices=10, location=(x * U, -1.0, -(WALK_FRONT + 12 + L / 2) * U), rotation=(math.pi, 0, 0))
        c = bpy.context.object; bpy.ops.object.shade_smooth(); c.data.materials.append(ice)
    # --- rampart face under the lip: two courses and a machicolation of corbels
    for row in range(2):
        y0 = 250 + row * 22; off = 20 if row % 2 else 0
        for i in range(-1, 8):
            x0 = i * 40 + off; xa, xb = max(x0, -2), min(x0 + 40, 264)
            if xb - xa < 3: continue
            blk(f'face{row}_{i}', xa + .3, y0 + .3, xb - xa - .6, 21.4, 1.0, -.9 + rng.uniform(0, .05), dstone, bevel=.14)
    for i in range(12):
        blk(f'mach{i}', 4 + i * 22, 294, 9, 12, 1.3, -1.1, dstone, bevel=.2)
        blk(f'machgap{i}', 13 + i * 22, 294, 13, 8, .4, -.4, deep, bevel=.05)
    # --- inner courtyard seen past the rampart: a far arcade (cold moonlight beyond the arches) over dark frozen flags
    AR_Y0, AR_Y1, ARCH_W, PITCH = 300, 640, 50, 74
    arcade = frost_stone('farc', '#26303f', '#141a24', snow=True, rime=.2)
    for row in range(9):
        y0 = AR_Y0 + row * 38; off = 26 if row % 2 else 0
        for i in range(-1, 8):
            x0 = i * 52 + off
            blk(f'arc{row}_{i}', x0 + .3, y0 + .3, 51.4, 37.4, 1.0, 7.0 + rng.uniform(0, .1), arcade, bevel=.14)
    arches = []
    for k in range(5):
        x = 180 - 2 * PITCH + k * PITCH - ARCH_W / 2
        arches.append(arch_slab(f'archcut{k}', x, 372, ARCH_W, AR_Y1 - 372 + 4, 3.0, 6.5, deep))
    for o in list(bpy.context.scene.objects):
        if not (o.name.startswith('arc') and o.type == 'MESH' and not o.name.startswith('archcut')): continue
        for c in arches:
            bpy.context.view_layer.objects.active = o
            md = o.modifiers.new('a', 'BOOLEAN'); md.operation = 'DIFFERENCE'; md.object = c; md.solver = 'EXACT'
            bpy.ops.object.modifier_apply(modifier='a')
    for c in arches: bpy.data.objects.remove(c)
    for k in range(6):   # pilasters and capitals between the arches
        x = 180 - 2.5 * PITCH + k * PITCH
        blk(f'pil{k}', x - 9, 360, 18, AR_Y1 - 360, 1.2, 6.2, arcade, bevel=.2)
        blk(f'cap{k}', x - 12, 352, 24, 9, 1.6, 6.0, frost_stone('fcap', '#3a4a60'), bevel=.22)
    beyond = bpy.data.materials.new('beyond'); nt = beyond.node_tree; nt.nodes.remove(nt.nodes['Principled BSDF'])
    tc = rig.node(nt, 'ShaderNodeTexCoord'); sep = rig.node(nt, 'ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['Object'], sep.inputs['Vector'])
    X, Z = sep.outputs['X'], sep.outputs['Z']
    nz = rig.node(nt, 'ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = .7; nz.inputs['Detail'].default_value = 2; nz.inputs['Roughness'].default_value = .4; nt.links.new(tc.outputs['Object'], nz.inputs['Vector'])
    ridge = rig.mth(nt, 'ADD', -(560) * U, rig.mth(nt, 'MULTIPLY', rig.mth(nt, 'SUBTRACT', nz.outputs['Fac'], .5), 5.0))   # far tree line height
    trees = rig.mth(nt, 'MULTIPLY', rig.maprange(nt, rig.mth(nt, 'SUBTRACT', Z, ridge), -.2, .7, 1, 0), .8)        # 1 below the ridge
    sky = rig.mixc(nt, rig.maprange(nt, Z, -(560) * U, -(AR_Y0 + 40) * U), (.07, .1, .17), (.01, .016, .03))
    snowf = rig.mixc(nt, rig.maprange(nt, Z, -(AR_Y1) * U, -(590) * U), (.2, .26, .36), (.09, .12, .19))
    col = rig.mixc(nt, trees, sky, (.018, .026, .042))
    col = rig.mixc(nt, rig.maprange(nt, Z, -(585) * U, -(600) * U), col, snowf)
    em = rig.node(nt, 'ShaderNodeEmission'); nt.links.new(col, em.inputs['Color']); em.inputs['Strength'].default_value = 1.0
    nt.links.new(em.outputs[0], nt.nodes['Material Output'].inputs['Surface'])
    blk('beyond', -40, AR_Y0, 440, AR_Y1 - AR_Y0 + 10, .2, 10.0, beyond, bevel=0)
    for o in bpy.context.scene.objects:
        if o.name == 'beyond':
            for a in ('visible_diffuse', 'visible_glossy', 'visible_shadow'): setattr(o, a, False)
    # frozen flagstone floor: a camera-facing card whose shader projects flagstones in perspective (the ortho camera
    # cannot converge real geometry), with the arch openings mirrored as soft cold streaks on the polished ice
    flag = bpy.data.materials.new('flags'); nt = flag.node_tree; nt.nodes.remove(nt.nodes['Principled BSDF'])
    tc = rig.node(nt, 'ShaderNodeTexCoord'); sep = rig.node(nt, 'ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['Object'], sep.inputs['Vector'])
    X, Z = sep.outputs['X'], sep.outputs['Z']
    t = rig.mth(nt, 'ADD', .18, rig.mth(nt, 'DIVIDE', rig.mth(nt, 'SUBTRACT', -AR_Y1 * U, Z), 19.0))     # 0.18 far .. ~1.2 near
    depth = rig.mth(nt, 'DIVIDE', 1.0, t)
    wx = rig.mth(nt, 'MULTIPLY', rig.mth(nt, 'SUBTRACT', X, 18.0), depth)
    vec = rig.node(nt, 'ShaderNodeCombineXYZ'); nt.links.new(rig.mth(nt, 'MULTIPLY', wx, .22), vec.inputs['X']); nt.links.new(rig.mth(nt, 'MULTIPLY', depth, 1.25), vec.inputs['Y'])
    bk = rig.node(nt, 'ShaderNodeTexBrick'); bk.offset = .5
    bk.inputs['Scale'].default_value = 1.0; bk.inputs['Brick Width'].default_value = 1.5; bk.inputs['Row Height'].default_value = .62; bk.inputs['Mortar Size'].default_value = .02
    bk.inputs['Bias'].default_value = .2; bk.inputs['Mortar Smooth'].default_value = .6
    bk.inputs['Color1'].default_value = (.034, .046, .068, 1); bk.inputs['Color2'].default_value = (.02, .028, .044, 1); bk.inputs['Mortar'].default_value = (.05, .064, .09, 1)
    nt.links.new(vec.outputs[0], bk.inputs['Vector'])
    streak = 0.0
    for k in range(5):
        cx_ = (180 - 2 * PITCH + k * PITCH) * U
        dx = rig.mth(nt, 'ABSOLUTE', rig.mth(nt, 'SUBTRACT', X, cx_))
        streak = rig.mth(nt, 'MAXIMUM', streak, rig.maprange(nt, dx, ARCH_W * U * .45, ARCH_W * U * .1))
    streak = rig.mth(nt, 'MULTIPLY', streak, rig.maprange(nt, t, .18, .9, .55, 0))
    col = rig.mixc(nt, streak, bk.outputs['Color'], (.13, .17, .25))
    col = rig.mixc(nt, rig.maprange(nt, t, .18, .3, .5, 0), col, (.09, .12, .19))      # far haze at the arcade's foot
    em = rig.node(nt, 'ShaderNodeEmission'); nt.links.new(col, em.inputs['Color']); em.inputs['Strength'].default_value = 1.0
    nt.links.new(em.outputs[0], nt.nodes['Material Output'].inputs['Surface'])
    blk('floor', -40, AR_Y1, 440, 200, .2, 6.4, flag, bevel=0)
    # --- Lumi's tower on the right: stone face, snowy crenellation, arched alcove with warm light, balcony slab
    tx0 = 262
    for row in range(9):
        y0 = 126 + row * 20; off = 16 if row % 2 else 0
        for i in range(-1, 4):
            x0 = tx0 + i * 32 + off; xa, xb = max(x0, tx0), min(x0 + 32, 362)
            if xb - xa < 3: continue
            blk(f'tw{row}_{i}', xa + .3, y0 + .3, xb - xa - .6, 19.4, 1.2, .3 + rng.uniform(0, .08), stone if row < 8 else (dstone if row < 16 else deep), bevel=.12)
    blk('towerband', tx0 - 1, 300, 100, 6, 1.5, .05, stone, bevel=.2)
    blk('slit', 312, 238, 5, 24, .6, -.1, deep, bevel=.05)
    for k in range(3):   # bartizan: corbel courses stepping in under the turret
        w = 92 - 22 * k; blk(f'bcorbel{k}', tx0 + 4 + 11 * k, 306 + 9 * k, w, 9, 1.4 - .2 * k, .1 + .2 * k, dstone, bevel=.18)
    bpy.ops.mesh.primitive_cone_add(radius1=24 * U, radius2=1 * U, depth=34 * U, vertices=48, location=(*S(tx0 + 50, 333 + 17)[:1], .9, S(0, 333 + 17)[1]), rotation=(math.pi, 0, 0))
    c = bpy.context.object; c.scale = (1, .45, 1); bpy.ops.object.shade_smooth(); c.data.materials.append(dstone)
    for i in range(4):
        blk(f'tmerlon{i}', tx0 + 2 + i * 26, 106, 16, 20, 1.3, .25, stone, bevel=.22)
    ax, ay, aw, ah = ALCOVE
    # alcove: cut the tower blocks with a boolean arch, then a warm-lit recess behind
    cutter = arch_slab('alcovecut', ax, ay, aw, ah, 4.0, -1.0, deep)
    for o in list(bpy.context.scene.objects):
        if o.name.startswith('tw') and o.type == 'MESH':
            bb = [o.matrix_world @ v.co for v in o.data.vertices]
            xs = [v.x / U for v in bb]; zs = [-v.z / U for v in bb]
            if max(xs) < ax or min(xs) > ax + aw or max(zs) < ay or min(zs) > ay + ah: continue
            bpy.context.view_layer.objects.active = o
            md = o.modifiers.new('a', 'BOOLEAN'); md.operation = 'DIFFERENCE'; md.object = cutter; md.solver = 'EXACT'
            bpy.ops.object.modifier_apply(modifier='a')
    bpy.data.objects.remove(cutter)
    warm = bpy.data.materials.new('alcovewarm'); nt = warm.node_tree; b = nt.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*rig.srgb('#2c2026'), 1); b.inputs['Roughness'].default_value = .8
    b.inputs['Emission Color'].default_value = (*rig.srgb('#ff9a70'), 1); b.inputs['Emission Strength'].default_value = .06
    rig.noisy(warm, scale=9, amount=.35, bump=.3)
    arch_slab('alcoveback', ax - 2, ay - 2, aw + 4, ah + 2, .3, 2.0, warm)
    # voussoir ring around the alcove
    r_out, r_in = aw / 2 + 5, aw / 2
    cxa, cya = ax + aw / 2, ay + aw / 2
    for k in range(9):
        a0, a1 = math.pi * k / 9, math.pi * (k + 1) / 9
        pts = [(cxa + r_in * math.cos(a), cya - r_in * math.sin(a)) for a in (a0, a1)] + [(cxa + r_out * math.cos(a), cya - r_out * math.sin(a)) for a in (a1, a0)]
        bm = bmesh.new(); vs = [bm.verts.new((px * U, 0, -py * U)) for px, py in pts]; f = bm.faces.new(vs)
        ext = bmesh.ops.extrude_face_region(bm, geom=[f]); bmesh.ops.translate(bm, vec=(0, 1.4, 0), verts=[v for v in ext['geom'] if isinstance(v, bmesh.types.BMVert)])
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces); me = bpy.data.meshes.new(f'vous{k}'); bm.to_mesh(me); bm.free()
        o = bpy.data.objects.new(f'vous{k}', me); bpy.context.collection.objects.link(o); o.location = (0, -.15, 0); o.data.materials.append(stone)
        bv = o.modifiers.new('b', 'BEVEL'); bv.width = .1; bv.segments = 3; bv.limit_method = 'ANGLE'
    for side in (0, 1):   # jambs
        blk(f'jamb{side}', ax - 5 + side * (aw + 5), cya, 5, ay + ah - cya, 1.4, -.15, stone, bevel=.1)
    lx, ly, lw, lh = LEDGE
    blk('ledge', lx, ly, lw, lh, 2.4, -2.2, stone, bevel=.25, segs=4)
    blk('ledgetrim', lx + 1, ly + lh - 4, lw - 2, 2.2, .2, -2.32, brass, bevel=.05, segs=2)
    for i in range(3):   # corbels under the ledge
        blk(f'corbel{i}', lx + 6 + i * (lw - 18) / 2, ly + lh, 6, 9 - 2 * (i == 1), 1.6, -1.8, stone, bevel=.2)
    for i in range(int(lw / 6)):
        x = lx + 3 + i * 6 + rng.uniform(-1.5, 1.5); L = rng.choice((3, 4, 6)) * rng.uniform(.8, 1.2)
        bpy.ops.mesh.primitive_cone_add(radius1=rng.uniform(.8, 1.2) * U, radius2=0, depth=L * U, vertices=10, location=(x * U, -1.9, -(ly + lh + L / 2) * U), rotation=(math.pi, 0, 0))
        c = bpy.context.object; bpy.ops.object.shade_smooth(); c.data.materials.append(ice)
    # --- lights: moonlit key (cool), the alcove's warm spill on the ledge, a low cold wash on the wall
    for o in bpy.context.scene.objects:
        if o.type != 'LIGHT': continue
        L = o.data
        if L.energy > 20000: L.color = (.82, .88, 1.0); L.energy = 16000      # key -> moonlight
        elif L.color[0] > .9: L.color = (.55, .6, .95); L.energy = 900      # warm bounce -> cold violet bounce
    bpy.ops.object.light_add(type='POINT', location=(*S(cxa, ay + ah - 6)[:1], 1.4, S(0, ay + ah - 6)[1]))
    L = bpy.context.object.data; L.energy = 120; L.color = (1.0, .62, .36); L.shadow_soft_size = 1.2
    bpy.ops.object.light_add(type='AREA', location=(18, -20, -50), rotation=(math.radians(90), 0, 0))
    L = bpy.context.object.data; L.shape = 'RECTANGLE'; L.size = 40; L.size_y = 40; L.energy = 600; L.color = (.6, .7, 1.0)


def frost_post_grade(path):
    """Calm the lower wall: a vertical falloff and a soft edge vignette (keeps the brick field dark and quiet)."""
    im = Image.open(path).convert('RGB'); a = np.asarray(im).astype(np.float32) / 255
    h, w = a.shape[:2]; y = (np.arange(h) / FROST['ppu'])[:, None]; x = (np.arange(w) / FROST['ppu'])[None, :]
    fall = 1 - .42 * np.clip((y - 300) / 420, 0, 1) ** 1.2
    vig = 1 - .35 * np.clip(np.abs(x - 180) / 180, 0, 1) ** 3
    mist = np.clip(1 - np.abs(y - 700) / 90, 0, 1) ** 2 * .05
    a = a * (fall * vig)[..., None] + mist[..., None] * np.array([.45, .55, .75])
    Image.fromarray((np.clip(a, 0, 1) * 255 + .5).astype(np.uint8)).save(path)


def frost():
    sc = rig.reset(); sc.cycles.seed = 9
    build_frost()
    P = FROST; ppu = 1 if FAST else P['ppu']
    path = OUT / 'frost' / ('backdrop_fast.png' if FAST else 'backdrop.png'); path.parent.mkdir(parents=True, exist_ok=True)
    raw = SRC / path.name
    rig.frame(sc, P['x0'], P['y0'], P['w'], P['h'], ppu, str(raw), False, 24 if FAST else 128)
    Image.open(raw).save(path); frost_post_grade(path); im = strip(path, alpha=False)
    if not FAST:
        im.convert('RGB').save(path.with_suffix('.jpg'), quality=88, optimize=True)
        record('frost/backdrop', family='frost', px=list(im.size), ppu=ppu, drawSize=[P['w'], P['h']], screenRect=[P['x0'], P['y0'], P['w'], P['h']],
               anchors={'walk': [WALK_X0, WALK_REAR, WALK_X1 - WALK_X0, WALK_FRONT - WALK_REAR], 'ledge': list(LEDGE), 'alcove': list(ALCOVE)},
               use='Frost Warden backdrop: sky, peaks, crenellated rampart walk, Lumi tower and balcony baked in')


# ---------------------------------------------------------------- manifest + proofs
def post():
    rec = json.loads(REC.read_text())
    parts = {}
    for key, r in sorted(rec.items()):
        path = OUT / f'{key}.png'
        if not path.exists(): continue
        im = Image.open(path)
        assert not {k for k in im.info if k not in ('transparency',)}, f'metadata left in {path}: {im.info}'
        w, h = r['drawSize']; e = dict(path=path.relative_to(ROOT).as_posix(), use=r['use'], px=list(im.size), ppu=r['ppu'], drawSize=[w, h],
                                       pivot=[.5, .5], anchor=[w / 2, h / 2], alphaBounds=r.get('alphaBounds'))
        if 'contact' in r:
            cw, ch = r['contact']; e['contact'] = [cw, ch]
            e['anchors'] = {'contactTopLeft': [(w - cw) / 2 / w, (h - ch) / 2 / h], 'contactBottomRight': [1 - (w - cw) / 2 / w, 1 - (h - ch) / 2 / h]}
        if 'screenRect' in r:
            e.pop('pivot'); e.pop('anchor'); e.pop('alphaBounds'); e['screenRect'] = r['screenRect']; e['anchors'] = r['anchors']; e['jpg'] = path.with_suffix('.jpg').relative_to(ROOT).as_posix()
        e['sha256'] = hashlib.sha256(path.read_bytes()).hexdigest(); e['encodedBytes'] = path.stat().st_size
        parts[key] = e
    (OUT / 'manifest.json').write_text(json.dumps({
        'version': 1, 'source': 'art/premium/premium.py', 'rig': 'art/render_vault_assets.py (glaze, gloss card, key/fill/bounce, AgX Medium High Contrast)',
        'units': 'game units; sprites are centred on anchor and drawn at drawSize; contact anchors are normalized UV of the full image, like assets/fantasy-machinery bricks',
        'scope': 'Premium pass for chapters 1-8: glazed brick families, crash shards, impact glints, Frost backdrop. Transparent PNG, metadata stripped.',
        'parts': parts}, indent=2) + '\n')
    sheets(parts)
    print(json.dumps({'parts': len(parts), 'bytes': sum(p['encodedBytes'] for p in parts.values())}))


def sheets(parts):
    from PIL import ImageFont
    try: font = ImageFont.truetype(str(ROOT / 'assets/fonts/Rubik.ttf'), 13)
    except Exception: font = None
    groups = [('Bricks: Bellforge ceramic + pin, Carrier enamel (vs existing Tidewheel ceramic / Carrier panel)', [k for k in parts if k.startswith(('bellforge/', 'carrier/'))]),
              ('Frost ward post: intact / cracked / breaking', [k for k in parts if k.startswith('frost/post')]),
              ('Shards (glazed per palette, ice, hull) and glints', [k for k in parts if k.startswith(('shards/', 'glints/'))])]
    sheet = Image.new('RGBA', (1200, 1180), (16, 18, 28, 255))
    d = ImageDraw.Draw(sheet); y = 14
    for title, keys in groups:
        d.text((16, y), title, fill=(232, 226, 240, 255), font=font); y += 24
        x = 16; rowh = 0
        refs = []
        if title.startswith('Bricks'):
            refs = [ROOT / 'assets/fantasy-machinery/brick-coral.png', ROOT / 'assets/space-a/brick_cyan.png']
        for item in [*keys, *refs]:
            if isinstance(item, Path): im = Image.open(item).convert('RGBA'); scale = (152 if 'fantasy' in str(item) else 176) / im.width; label = 'existing: ' + item.stem
            else:
                p = parts[item]; im = Image.open(ROOT / p['path']).convert('RGBA'); scale = p['drawSize'][0] * 4 / im.width; label = item.split('/', 1)[1]
                if item.startswith(('shards/', 'glints/')): scale = 8 * 7 / im.width if item.startswith('shards/') else 16 * 5 / im.width
            big = im.resize((max(1, round(im.width * scale)), max(1, round(im.height * scale))), Image.Resampling.LANCZOS)
            if x + big.width > 1184: x = 16; y += rowh + 26; rowh = 0
            sheet.alpha_composite(big, (x, y)); d.text((x, y + big.height + 2), label, fill=(170, 176, 200, 255), font=font)
            x += big.width + 14; rowh = max(rowh, big.height)
        y += rowh + 40
    sheet.convert('RGB').save(PROOF / 'premium-sprites.png', optimize=True)
    # in-context strip: the new bricks at game size (2x) on their level backgrounds
    ctx = Image.new('RGBA', (1200, 360), (0, 0, 0, 255))
    bf = Image.open(ROOT / 'assets/fantasy-machinery/bellforge-background.png').convert('RGBA').resize((600, 1178)).crop((0, 300, 600, 660))
    ctx.alpha_composite(bf, (0, 0))
    sa = Image.open(ROOT / 'assets/space-a/background.png').convert('RGBA'); sa = sa.resize((600, round(sa.height * 600 / sa.width))).crop((0, 300, 600, 660)); ctx.alpha_composite(sa, (600, 0))
    def put(key, x, y, w):
        p = parts.get(key)
        if not p: return
        im = Image.open(ROOT / p['path']).convert('RGBA'); s = w / p['drawSize'][0]
        ctx.alpha_composite(im.resize((round(p['drawSize'][0] * s * 1.0), round(p['drawSize'][1] * s)), Image.Resampling.LANCZOS), (round(x), round(y)))
    for r in range(4):
        for c in range(5):
            k = ['bellforge/ceramic_teal', 'bellforge/ceramic_coral', 'bellforge/ceramic_plum'][(r + c) % 3]
            put(k, 40 + c * 106, 40 + r * 56, 38 * 2.4)
    put('bellforge/pin_2hp', 40, 270, 34 * 2.4); put('bellforge/pin_1hp', 140, 270, 34 * 2.4)
    for r in range(4):
        for c in range(4):
            put('carrier/enamel_' + ('pink' if r == 1 else 'cyan'), 640 + c * 130, 40 + r * 70, 44 * 2.6)
    ctx.convert('RGB').save(PROOF / 'premium-in-context.png', optimize=True)


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')] or ['all']
    what = args[0]
    if what in ('bricks', 'all'): bricks()
    if what in ('shards', 'all'): shards()
    if what in ('frost', 'all'): frost()
    if what in ('post', 'all') or what != 'frost': post()
