# BREACH "The Vault" production renders: background plate, registered bars layer, brick sprites and props.
# Same look as the approved look test art/vault_tower.py (materials, key/fill/bounce area lights, softbox
# reflection plane behind the camera, ortho camera looking +Y, AgX Medium High Contrast).
#
# Run from the repo root (Blender 5.2 as a Python module + Pillow):
#   python3 art/render_vault_assets.py all            # plate + bars + sprites + post   (~15 min, 4 cores)
#   python3 art/render_vault_assets.py plate [--fast] # just the plate (fast = half res, few samples)
#   python3 art/render_vault_assets.py bars | sprites [name ...] | post
# Raw renders land in art/out/vault_raw/, final assets in assets/vault/ (post writes atlas.json,
# contact.png and composite.png, see art/vault_post.py).
#
# Coordinates: 1 game unit = 0.1 m. Screen y grows downward; Blender (x, z) = (x * 0.1, -y * 0.1); wall face at
# y ~ 0, camera at y = -60. Plate covers screen x 0..360, y -40..780 at 2 px/unit: px = 2 * x, py = 2 * (y + 40).
import bpy, bmesh, math, random, sys, os, json, addon_utils
from PIL import Image, ImageDraw, ImageFilter, ImageChops

addon_utils.enable("cycles", default_set=True)
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
RAW = os.path.join(HERE, 'out', 'vault_raw')
TMP = os.path.join(HERE, 'out', 'vault_tmp')
os.makedirs(RAW, exist_ok=True); os.makedirs(TMP, exist_ok=True)
FAST = '--fast' in sys.argv
_thr = [a for a in sys.argv if a.startswith('--threads=')]
THREADS = int(_thr[0].split('=')[1]) if _thr else 0   # --threads=N: fixed Cycles thread count (0 = auto)

U = 0.1                                   # metres per game unit
CELL, COLS, ROWS = 16, 20, 20
OXU, OYU = 20, 96                         # board origin (top-left of cell 0,0) in screen units
MORTAR, DEPTH = 0.07, 1.2
BW, BH = COLS * CELL, ROWS * CELL         # 320 x 320 units
PLATE = dict(x0=0, y0=-40, w=360, h=820, ppu=2)
SPR_PPU, MARGIN = 3, 4
P0 = (180, 264)                           # screen spot where every sprite is rendered (board centre)
CH_X0, CH_Y0, CH_W, CH_H = OXU + 7 * CELL, OYU + 3 * CELL, 6 * CELL, 3 * CELL  # fox chamber 132,144 96x48
LANTERN = (CH_X0 + CH_W / 2 + 16, CH_Y0 + CH_H / 2 - 10)                        # (196, 158) as in the look test
TORCHES = [(180 - 140, 536), (180 + 140, 536)]                                     # sconce centres
COLORS = {'t': '#22c4b0', 'v': '#8f5cf0', 'c': '#ff6f61', 'y': '#ffc73d', 'b': '#4f9dff'}
CAPS = {'split': '#5ccf6a', 'fire': '#ff8a3d', 'wide': '#3fa8f5', 'focus': '#c46bf0', 'burst': '#f7c948',
        'laser': '#ff4d6d', 'shield': '#2ec4b6', 'slow': '#7fd6ff', 'shrink': '#5a5f78'}


def S(x, y):  # screen units (y down) -> Blender XZ (z up)
    return (x * U, -y * U)


srgb = lambda h: tuple(((int(h[i:i + 2], 16) / 255) ** 2.2) for i in (1, 3, 5))
CX, CZ = S(OXU + BW / 2, OYU + BH / 2)    # board centre (18, -25.6): the look test's light rig is relative to it


# ---------------------------------------------------------------- node helpers
def node(nt, t, **kw):
    n = nt.nodes.new(t)
    for k, v in kw.items(): setattr(n, k, v)
    return n


def sock(n, name, typ=None, outputs=False):
    for s in (n.outputs if outputs else n.inputs):
        if s.name == name and (typ is None or s.type == typ): return s
    raise KeyError(name)


def feed(nt, s, v):
    if isinstance(v, bpy.types.NodeSocket): nt.links.new(v, s)
    else: s.default_value = v


def mixc(nt, fac, a, b):
    m = node(nt, 'ShaderNodeMix', data_type='RGBA'); m.clamp_factor = True
    feed(nt, sock(m, 'Factor', 'VALUE'), fac)
    feed(nt, sock(m, 'A', 'RGBA'), a if isinstance(a, bpy.types.NodeSocket) else (*a[:3], 1))
    feed(nt, sock(m, 'B', 'RGBA'), b if isinstance(b, bpy.types.NodeSocket) else (*b[:3], 1))
    return sock(m, 'Result', 'RGBA', outputs=True)


def mth(nt, op, a, b=0.0, clamp=False):
    m = node(nt, 'ShaderNodeMath', operation=op); m.use_clamp = clamp
    feed(nt, m.inputs[0], a); feed(nt, m.inputs[1], b)
    return m.outputs[0]


def maprange(nt, v, a, b, c=0.0, d=1.0, smooth=True):
    if a > b: a, b, c, d = b, a, d, c
    m = node(nt, 'ShaderNodeMapRange', interpolation_type='SMOOTHSTEP' if smooth else 'LINEAR'); m.clamp = True
    feed(nt, m.inputs['Value'], v)
    m.inputs['From Min'].default_value = a; m.inputs['From Max'].default_value = b
    m.inputs['To Min'].default_value = c; m.inputs['To Max'].default_value = d
    return m.outputs['Result']


# ---------------------------------------------------------------- materials (look test, verbatim where possible)
def mat(name, color, rough=0.4, metal=0.0, coat=0.0, coat_rough=0.05, sss=0.0, emit=None, emit_str=0.0):
    m = bpy.data.materials.new(name); b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*color, 1); b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal; b.inputs['Coat Weight'].default_value = coat
    b.inputs['Coat Roughness'].default_value = coat_rough
    if sss: b.inputs['Subsurface Weight'].default_value = sss
    if emit: b.inputs['Emission Color'].default_value = (*emit, 1); b.inputs['Emission Strength'].default_value = emit_str
    return m


def noisy(m, scale=6.0, amount=0.25, bump=0.15, detail=6.0, color2=None, vor=False, stretch=None, rnd=False):
    nt = m.node_tree; b = nt.nodes['Principled BSDF']
    tc = nt.nodes.new('ShaderNodeTexCoord')
    n = nt.nodes.new('ShaderNodeTexVoronoi' if vor else 'ShaderNodeTexNoise'); n.inputs['Scale'].default_value = scale
    if not vor: n.inputs['Detail'].default_value = detail
    vec = tc.outputs['Object']
    if stretch or rnd:   # anisotropic grain / per-object offset (wood planks)
        mp = node(nt, 'ShaderNodeMapping'); nt.links.new(vec, mp.inputs['Vector'])
        if stretch: mp.inputs['Scale'].default_value = stretch
        if rnd:
            oi = node(nt, 'ShaderNodeObjectInfo'); nt.links.new(mth(nt, 'MULTIPLY', oi.outputs['Random'], 37.0), mp.inputs['Location'])
        vec = mp.outputs['Vector']
    nt.links.new(vec, n.inputs['Vector'])
    out = n.outputs['Distance'] if vor else n.outputs['Fac']
    base = b.inputs['Base Color'].default_value[:]
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].color = (*(color2 or tuple(c * (1 - amount) for c in base[:3])), 1); ramp.color_ramp.elements[1].color = base
    nt.links.new(out, ramp.inputs['Fac']); nt.links.new(ramp.outputs['Color'], b.inputs['Base Color'])
    bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = bump; bp.inputs['Distance'].default_value = 0.04
    nt.links.new(out, bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    return m


MATS = {}


def materials():
    MATS.update(
        GOLD=mat('gold', srgb('#ffc94a'), rough=0.14, metal=1.0),
        RUBY=mat('ruby', srgb('#ff2f5e'), rough=0.04, coat=1.0, sss=0.3),
        GRANITE=noisy(mat('granite', srgb('#4a4f6e'), rough=0.45, coat=0.3), scale=18, amount=0.35, bump=0.25),
        IRON=mat('iron', srgb('#2a2e3e'), rough=0.3, metal=0.9),
        RIVET=mat('rivet', srgb('#b8c0d6'), rough=0.2, metal=1.0),
        MORT=noisy(mat('mortar', srgb('#3a3046'), rough=0.95), scale=40, amount=0.4, bump=0.3),
        WOOD=noisy(mat('wood', srgb('#8a5a35'), rough=0.6), scale=1.5, amount=0.45, bump=0.2, stretch=(0.35, 1, 5), rnd=True),
        BARS=mat('bars', srgb('#ffd27a'), rough=0.1, metal=1.0),
        CHROME=mat('chrome', (0.9, 0.91, 0.94), rough=0.06, metal=1.0),
    )


WALL_LIGHT, CHAMBER_LIGHT = 1100, 25


def chamber_stone_mat():
    """Cool dark hewn stone for the cage chamber (v3, replaces the wood planks)."""
    m = mat('chamberstone', srgb('#222736'), rough=0.82, coat=0.15)
    return noisy(m, scale=7, amount=0.4, bump=0.35, detail=8, color2=srgb('#171b26'))


def cage_iron_mat(hexc='#555a66'):
    """Gunmetal for the cage: dark blued iron, fairly tight specular with a faint forged roughness variation."""
    m = mat('cageiron' + hexc, srgb(hexc), rough=0.22, metal=1.0, coat=0.35, coat_rough=0.08); nt = m.node_tree; b = nt.nodes['Principled BSDF']
    tc = node(nt, 'ShaderNodeTexCoord'); nz = node(nt, 'ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 9.0; nz.inputs['Detail'].default_value = 6
    nt.links.new(tc.outputs['Object'], nz.inputs['Vector'])
    feed(nt, b.inputs['Roughness'], maprange(nt, nz.outputs['Fac'], 0.35, 0.65, 0.2, 0.25))
    return m


def interior_mat():
    """Dark hewn stone of the hollow tower interior: big blocks (larger than the game bricks), deep mortar."""
    m = mat('interior', srgb('#2a1f2e'), rough=0.9); nt = m.node_tree; b = nt.nodes['Principled BSDF']
    tc = node(nt, 'ShaderNodeTexCoord')
    bk = node(nt, 'ShaderNodeTexBrick'); bk.offset = 0.5
    bk.inputs['Scale'].default_value = 1.0; bk.inputs['Brick Width'].default_value = 4.6; bk.inputs['Row Height'].default_value = 2.3
    bk.inputs['Mortar Size'].default_value = 0.12; bk.inputs['Mortar Smooth'].default_value = 0.4; bk.inputs['Bias'].default_value = 0.0
    bk.inputs['Color1'].default_value = (*srgb('#2e2232'), 1); bk.inputs['Color2'].default_value = (*srgb('#241a29'), 1)
    bk.inputs['Mortar'].default_value = (*srgb('#120c16'), 1)
    sep = node(nt, 'ShaderNodeSeparateXYZ'); cmb = node(nt, 'ShaderNodeCombineXYZ')
    nt.links.new(tc.outputs['Object'], sep.inputs['Vector'])
    nt.links.new(sep.outputs['X'], cmb.inputs['X']); nt.links.new(sep.outputs['Z'], cmb.inputs['Y'])
    nt.links.new(cmb.outputs['Vector'], bk.inputs['Vector'])
    vor = node(nt, 'ShaderNodeTexVoronoi'); vor.inputs['Scale'].default_value = 3.0
    nt.links.new(tc.outputs['Object'], vor.inputs['Vector'])
    nz = node(nt, 'ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 0.6; nz.inputs['Detail'].default_value = 4
    nt.links.new(tc.outputs['Object'], nz.inputs['Vector'])
    col = mixc(nt, maprange(nt, nz.outputs['Fac'], 0.3, 0.7, 0.0, 0.5), bk.outputs['Color'], srgb('#1a121d'))
    nt.links.new(col, b.inputs['Base Color'])
    h = mth(nt, 'ADD', mth(nt, 'MULTIPLY', bk.outputs['Fac'], -1.0), mth(nt, 'MULTIPLY', vor.outputs['Distance'], 0.35))
    bp = node(nt, 'ShaderNodeBump'); bp.inputs['Strength'].default_value = 0.7; bp.inputs['Distance'].default_value = 0.08
    nt.links.new(h, bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    return m


def glaze_mat(name, hexc, seed, crack=None, dims=None, gloss=False):
    """Glossy candy glaze of the look test + a faint mottling (per-sprite seed) + optional crack texture.
    gloss=True is the v3 brick glaze (glazed ceramic: tight base specular, mirror coat at a higher IOR, a touch less
    diffuse so the colour stays deep under the softbox highlight); the robots keep the original (gloss=False)."""
    base = srgb(hexc)
    r0 = GLAZE_ROUGH if gloss else 0.28
    m = mat(name, base, rough=r0, coat=1.0, coat_rough=0.008 if gloss else 0.02, sss=0.12); nt = m.node_tree; b = nt.nodes['Principled BSDF']
    if gloss:
        b.inputs['Coat IOR'].default_value = 1.65; b.inputs['IOR'].default_value = 1.6
    tc = node(nt, 'ShaderNodeTexCoord')
    mp = node(nt, 'ShaderNodeMapping'); mp.inputs['Location'].default_value = (seed * 3.1, seed * 1.7, seed * 2.3)
    nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])
    nz = node(nt, 'ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 0.8; nz.inputs['Detail'].default_value = 3
    nt.links.new(mp.outputs['Vector'], nz.inputs['Vector'])
    ramp = node(nt, 'ShaderNodeValToRGB'); e = ramp.color_ramp.elements
    e[0].position, e[1].position = 0.3, 0.7
    e[0].color = (*(c * 0.9 for c in base), 1); e[1].color = (*(min(1, c * 1.07) for c in base), 1)
    nt.links.new(nz.outputs['Fac'], ramp.inputs['Fac'])
    col = ramp.outputs['Color']
    if crack:
        W, H = dims
        mp2 = node(nt, 'ShaderNodeMapping', vector_type='POINT')
        mp2.inputs['Scale'].default_value = (1 / W, 1, 1 / H); mp2.inputs['Location'].default_value = (0.5, 0, 0.5)
        nt.links.new(tc.outputs['Object'], mp2.inputs['Vector'])
        sep = node(nt, 'ShaderNodeSeparateXYZ'); cmb = node(nt, 'ShaderNodeCombineXYZ')
        nt.links.new(mp2.outputs['Vector'], sep.inputs['Vector'])
        nt.links.new(sep.outputs['X'], cmb.inputs['X']); nt.links.new(sep.outputs['Z'], cmb.inputs['Y'])
        im = node(nt, 'ShaderNodeTexImage', extension='EXTEND', interpolation='Cubic')
        im.image = bpy.data.images.load(crack); im.image.colorspace_settings.name = 'Non-Color'
        nt.links.new(cmb.outputs['Vector'], im.inputs['Vector'])
        sc_ = node(nt, 'ShaderNodeSeparateColor'); nt.links.new(im.outputs['Color'], sc_.inputs['Color'])
        cr, halo, hgt = sc_.outputs[0], sc_.outputs[1], sc_.outputs[2]
        col = mixc(nt, mth(nt, 'MULTIPLY', halo, 0.35), col, tuple(min(1, c * 1.25 + 0.04) for c in base))
        col = mixc(nt, cr, col, tuple(c * 0.05 for c in base))
        feed(nt, b.inputs['Roughness'], maprange(nt, cr, 0, 1, r0, 0.8, smooth=False))
        feed(nt, b.inputs['Coat Weight'], mth(nt, 'SUBTRACT', 1.0, cr, clamp=True))
        bp = node(nt, 'ShaderNodeBump', invert=True); bp.inputs['Strength'].default_value = 0.55; bp.inputs['Distance'].default_value = 0.025
        nt.links.new(hgt, bp.inputs['Height'])
        nt.links.new(bp.outputs['Normal'], b.inputs['Normal']); nt.links.new(bp.outputs['Normal'], b.inputs['Coat Normal'])
    nt.links.new(col, b.inputs['Base Color'])
    return m


GLAZE_ROUGH = 0.12


def gloss_card(name, W, H, y_face, d=2.5, strength=14.0, right=0.2, window=True, sheen=0.09):
    """v3 brick shine: a reflection-only softbox card standing d metres in front of a sprite's face (glossy rays only,
    invisible to camera / diffuse / shadow, transparent where unlit). The ortho camera mirrors the card 1:1 onto a
    flat face, so its shape is the highlight: a bright window over the upper face that wraps over the top bevel, a
    hot strip far above (crisp top-bevel glint), a hot column on the left (left-bevel glint), dimmer toward the
    right, nothing below (dark lower bevel for depth). W, H = face size in metres."""
    x0, _, z0 = at()
    bpy.ops.mesh.primitive_plane_add(size=1, location=(x0, y_face - d, z0), rotation=(math.radians(90), 0, 0))
    o = bpy.context.object; o.name = name; o.scale = (W + 14, H + 14, 1); bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    for a in ('visible_camera', 'visible_diffuse', 'visible_transmission', 'visible_volume_scatter', 'visible_shadow'):
        setattr(o, a, False)
    m = bpy.data.materials.new(name); nt = m.node_tree; nt.nodes.remove(nt.nodes['Principled BSDF'])
    tc = node(nt, 'ShaderNodeTexCoord'); sep = node(nt, 'ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['Object'], sep.inputs['Vector'])
    X, Z = sep.outputs['X'], sep.outputs['Y']          # card local X = world x, local Y = world z (metres from the sprite centre)
    # slight tilt so the window's lower edge runs down-left -> up-right like a key from the upper left
    edge = mth(nt, 'SUBTRACT', Z, mth(nt, 'MULTIPLY', X, 0.10))
    win = maprange(nt, edge, H * 0.10, H * 0.10 + 0.07)                     # crisp lower edge of the window
    if window:
        win = mth(nt, 'MULTIPLY', win, maprange(nt, Z, H / 2 + 2.4, H / 2 + 3.2, 1, 0))
        win = mth(nt, 'MULTIPLY', win, mth(nt, 'ADD', 0.45, mth(nt, 'MULTIPLY', maprange(nt, Z, H * 0.1, H * 0.5), 0.55)))
    # top-bevel glint: hot right where the bevel starts to roll over, then a softer band across the rest of the bevel
    top = mth(nt, 'MULTIPLY', maprange(nt, Z, H / 2 + 0.25, H / 2 + 0.45),
              maprange(nt, Z, H / 2 + 1.0, H / 2 + 4.5, 1, 0.08, smooth=False))
    left = mth(nt, 'MULTIPLY', maprange(nt, X, -W / 2 - 0.2, -W / 2 - 0.45), maprange(nt, Z, -H / 2, H / 2 - 0.3, 0.0, 1.0, smooth=False))
    mask = mth(nt, 'MAXIMUM', mth(nt, 'MAXIMUM', mth(nt, 'MULTIPLY', win, sheen), top), mth(nt, 'MULTIPLY', left, 0.7))
    fall = maprange(nt, X, -W / 2, W / 2 + 0.6, 1.0, right, smooth=False)  # dimmer to the right
    lum = mth(nt, 'MULTIPLY', mask, fall)
    em = node(nt, 'ShaderNodeEmission'); em.inputs['Color'].default_value = (1.0, 0.985, 0.97, 1)
    feed(nt, em.inputs['Strength'], mth(nt, 'MULTIPLY', lum, strength))
    tr = node(nt, 'ShaderNodeBsdfTransparent')
    sh = mixs(nt, mth(nt, 'GREATER_THAN', lum, 0.002), tr.outputs[0], em.outputs[0])
    nt.links.new(sh, nt.nodes['Material Output'].inputs['Surface'])
    o.data.materials.append(m)
    return o


def biscuit_mat(name, hexc):
    """Exposed ceramic body where the glaze chipped off."""
    base = srgb(hexc); cream = srgb('#d9c7ae')
    c = tuple((0.45 * a + 0.55 * k) * 0.8 for a, k in zip(base, cream))
    return noisy(mat(name, c, rough=0.85), scale=60, amount=0.35, bump=0.5, vor=True)


def emit_mat(name, color, strength):
    m = bpy.data.materials.new(name); nt = m.node_tree; nt.nodes.remove(nt.nodes['Principled BSDF'])
    em = node(nt, 'ShaderNodeEmission'); em.inputs['Color'].default_value = (*color, 1); em.inputs['Strength'].default_value = strength
    nt.links.new(em.outputs['Emission'], nt.nodes['Material Output'].inputs['Surface'])
    return m


def flame_mat(name, strength=16):
    """Teardrop flame: white-yellow core, orange rim that fades out (soft alpha on transparent film)."""
    m = bpy.data.materials.new(name); nt = m.node_tree; nt.nodes.remove(nt.nodes['Principled BSDF'])
    lw = node(nt, 'ShaderNodeLayerWeight'); lw.inputs['Blend'].default_value = 0.5
    tc = node(nt, 'ShaderNodeTexCoord'); sep = node(nt, 'ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['Object'], sep.inputs['Vector'])
    up = maprange(nt, sep.outputs['Z'], -0.3, 0.7, 0, 1, smooth=False)               # 0 at the base, 1 at the tip
    edge = mth(nt, 'MAXIMUM', lw.outputs['Facing'], mth(nt, 'MULTIPLY', up, 0.8))
    col = mixc(nt, maprange(nt, edge, 0.15, 0.85), (1.0, 0.82, 0.45), (1.0, 0.32, 0.06))
    em = node(nt, 'ShaderNodeEmission'); nt.links.new(col, em.inputs['Color'])
    feed(nt, em.inputs['Strength'], maprange(nt, edge, 0.2, 1.0, strength, strength * 0.35))
    tr = node(nt, 'ShaderNodeBsdfTransparent'); ms = node(nt, 'ShaderNodeMixShader')
    nt.links.new(maprange(nt, edge, 0.55, 1.0), ms.inputs[0]); nt.links.new(em.outputs[0], ms.inputs[1]); nt.links.new(tr.outputs[0], ms.inputs[2])
    nt.links.new(ms.outputs[0], nt.nodes['Material Output'].inputs['Surface'])
    m.blend_method = 'BLEND' if hasattr(m, 'blend_method') else None
    return m


# ---------------------------------------------------------------- geometry helpers
def box(name, w, h, d, bevel, m, loc, segs=4, local=False):
    # local=False bakes the location like the look test (object coords = world, so noise differs per block);
    # local=True keeps the origin at the box centre (crack textures are mapped in local coordinates)
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.object; o.name = name; o.scale = (w, d, h); bpy.ops.object.transform_apply(location=not local, rotation=False, scale=True)
    if bevel:
        md = o.modifiers.new('b', 'BEVEL'); md.width = bevel; md.segments = segs; md.limit_method = 'NONE'
        bpy.ops.object.modifier_apply(modifier='b')
    bpy.ops.object.shade_smooth(); o.data.materials.append(m)
    return o


def capsule(name, length, radius, loc, m):
    """Capsule along X: total length `length`, radius `radius` (metres)."""
    bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32, radius=radius, location=(0, 0, 0))
    o = bpy.context.object; o.name = name
    bm = bmesh.new(); bm.from_mesh(o.data); half = length / 2 - radius
    for v in bm.verts:
        if v.co.x > 1e-5: v.co.x += half
        elif v.co.x < -1e-5: v.co.x -= half
    bm.to_mesh(o.data); bm.free()
    o.location = loc; bpy.ops.object.shade_smooth(); o.data.materials.append(m)
    return o


def flame(name, loc, r, m):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=20, radius=1, location=(0, 0, 0))
    o = bpy.context.object; o.name = name
    bm = bmesh.new(); bm.from_mesh(o.data)
    for v in bm.verts:
        z = v.co.z
        if z > 0:
            v.co.x *= (1 - 0.45 * z); v.co.y *= (1 - 0.45 * z); v.co.z = z * 2.3
    bm.to_mesh(o.data); bm.free()
    o.scale = (r * 0.8, r * 0.8, r); bpy.ops.object.transform_apply(scale=True)
    o.location = loc; bpy.ops.object.shade_smooth(); o.data.materials.append(m)
    o.visible_shadow = False
    return o


def cyl(r, depth, loc, m, rot=(0, 0, 0), verts=32):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=depth, location=loc, rotation=rot, vertices=verts)
    o = bpy.context.object; bpy.ops.object.shade_smooth(); o.data.materials.append(m)
    return o


# ---------------------------------------------------------------- scene / rig
def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    MATS.clear(); materials()
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.use_denoising = True
    sc.cycles.denoiser = 'OPENIMAGEDENOISE'
    sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast'
    sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_depth = '8'
    sc.render.resolution_percentage = 100
    if THREADS: sc.render.threads_mode = 'FIXED'; sc.render.threads = THREADS
    rig(sc)
    return sc


def area(loc, rot, energy, size, color):
    bpy.ops.object.light_add(type='AREA', location=loc, rotation=rot)
    l = bpy.context.object.data; l.energy = energy; l.size = size; l.color = color


def rig(sc):
    """World, three area lights and the softbox plane, exactly as in art/vault_tower.py."""
    w = bpy.data.worlds.new('w'); sc.world = w
    nt = w.node_tree; bg = nt.nodes['Background']
    tc = nt.nodes.new('ShaderNodeTexCoord'); sep = nt.nodes.new('ShaderNodeSeparateXYZ'); ramp = nt.nodes.new('ShaderNodeValToRGB')
    nt.links.new(tc.outputs['Generated'], sep.inputs['Vector']); nt.links.new(sep.outputs['Z'], ramp.inputs['Fac'])
    ramp.color_ramp.elements[0].position = 0.45; ramp.color_ramp.elements[0].color = (0.02, 0.015, 0.05, 1)
    ramp.color_ramp.elements[1].color = (0.25, 0.12, 0.3, 1)
    nt.links.new(ramp.outputs['Color'], bg.inputs['Color']); bg.inputs['Strength'].default_value = 0.8
    area((CX - 20, -9, CZ + 34), (math.radians(20), math.radians(-30), 0), 22000, 10, (1.0, 0.86, 0.72))   # key
    area((CX + 30, -25, CZ - 5), (math.radians(85), math.radians(50), 0), 2500, 14, (0.55, 0.65, 1.0))     # cool fill
    area((CX, -10, CZ - 45), (math.radians(140), 0, 0), 2500, 30, (1.0, 0.5, 0.65))                         # warm bounce
    PW, PH = 360, 700
    bpy.ops.mesh.primitive_plane_add(size=1, location=(PW / 2 * U, -40, -PH / 2 * U + 20), rotation=(math.radians(90), 0, 0))
    sb = bpy.context.object; sb.name = 'softbox'; sb.scale = (60, 50, 1); sb.visible_camera = False; sb.visible_shadow = False
    sm = bpy.data.materials.new('softbox'); nt = sm.node_tree; nt.nodes.remove(nt.nodes['Principled BSDF'])
    em = nt.nodes.new('ShaderNodeEmission'); tc = nt.nodes.new('ShaderNodeTexCoord'); sp = nt.nodes.new('ShaderNodeSeparateXYZ'); rp = nt.nodes.new('ShaderNodeValToRGB')
    nt.links.new(tc.outputs['Generated'], sp.inputs['Vector']); nt.links.new(sp.outputs['Y'], rp.inputs['Fac'])
    rp.color_ramp.elements[0].position = 0.55; rp.color_ramp.elements[0].color = (0, 0, 0, 1); rp.color_ramp.elements[1].color = (1, 0.95, 0.9, 1)
    nt.links.new(rp.outputs['Color'], em.inputs['Color']); em.inputs['Strength'].default_value = 1.6
    nt.links.new(em.outputs['Emission'], nt.nodes['Material Output'].inputs['Surface']); sb.data.materials.append(sm)
    bpy.ops.object.camera_add(); cam = bpy.context.object; cam.name = 'cam'; sc.camera = cam
    cam.data.type = 'ORTHO'; cam.rotation_euler = (math.radians(90), 0, 0)
    cam.data.clip_start = 1; cam.data.clip_end = 200


def frame(sc, x0, y0, w, h, ppu, out, transparent, samples):
    """Point the ortho camera at the screen rectangle (x0, y0, w, h) in game units and render it to `out`."""
    cam = sc.camera
    cam.location = ((x0 + w / 2) * U, -60, -(y0 + h / 2) * U)
    cam.data.ortho_scale = max(w, h) * U
    sc.render.resolution_x = round(w * ppu); sc.render.resolution_y = round(h * ppu)
    sc.render.film_transparent = transparent
    sc.render.image_settings.color_mode = 'RGBA' if transparent else 'RGB'
    sc.cycles.samples = samples
    sc.render.filepath = out
    bpy.ops.render.render(write_still=True)
    print('wrote', out, sc.render.resolution_x, 'x', sc.render.resolution_y, flush=True)


def only(objs):
    keep = set(o.name for o in objs)
    for o in bpy.context.scene.objects:
        if o.type in ('MESH', 'CURVE'): o.hide_render = o.name not in keep and o.name != 'softbox'


# ---------------------------------------------------------------- plate
def sky_backdrop():
    """Emissive backdrop far behind the tower (camera rays only): dusk gradient, stars, thin clouds, moon + glow."""
    x0, x1, y0, y1 = -40, 400, -80, 460
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 30, 0), rotation=(math.radians(90), 0, 0))
    o = bpy.context.object; o.name = 'sky'
    bm = bmesh.new(); bm.from_mesh(o.data)
    for v in bm.verts:   # local X = world x, local Y = world z
        v.co.x = (x1 if v.co.x > 0 else x0) * U; v.co.y = -(y0 if v.co.y > 0 else y1) * U
    bm.to_mesh(o.data); bm.free()
    for a in ('visible_diffuse', 'visible_glossy', 'visible_transmission', 'visible_volume_scatter', 'visible_shadow'):
        setattr(o, a, False)
    m = bpy.data.materials.new('sky'); nt = m.node_tree; nt.nodes.remove(nt.nodes['Principled BSDF'])
    tc = node(nt, 'ShaderNodeTexCoord'); sep = node(nt, 'ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['Object'], sep.inputs['Vector'])
    X, Z = sep.outputs['X'], sep.outputs['Y']            # metres; screen y = -Z / U
    g = node(nt, 'ShaderNodeValToRGB'); e = g.color_ramp.elements
    nt.links.new(maprange(nt, Z, -9.5, 4.0, 0, 1, smooth=False), g.inputs['Fac'])
    e[0].position = 0.0; e[0].color = (0.085, 0.04, 0.10, 1)          # horizon over the battlements: dusky violet
    e[1].position = 1.0; e[1].color = (0.008, 0.008, 0.028, 1)        # zenith: deep navy
    mid = g.color_ramp.elements.new(0.45); mid.color = (0.03, 0.02, 0.06, 1)
    col = g.outputs['Color']
    # thin horizontal clouds lit by the moon
    mp = node(nt, 'ShaderNodeMapping'); mp.inputs['Scale'].default_value = (0.18, 1.3, 1); nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])
    cn = node(nt, 'ShaderNodeTexNoise'); cn.inputs['Scale'].default_value = 0.9; cn.inputs['Detail'].default_value = 5; cn.inputs['Roughness'].default_value = 0.6
    nt.links.new(mp.outputs['Vector'], cn.inputs['Vector'])
    cloud = mth(nt, 'MULTIPLY', maprange(nt, cn.outputs['Fac'], 0.5, 0.72), maprange(nt, Z, -8.0, -1.0, 0.3, 1.0))
    col = mixc(nt, mth(nt, 'MULTIPLY', cloud, 0.55), col, (0.07, 0.05, 0.11))
    # stars: two voronoi layers, few bright, many faint; hidden by clouds and near the moon
    star = 0.0
    for scale, rad, gain in ((0.55, 0.075, 5.0), (1.4, 0.045, 1.6)):
        v = node(nt, 'ShaderNodeTexVoronoi'); v.inputs['Scale'].default_value = scale
        nt.links.new(tc.outputs['Object'], v.inputs['Vector'])
        r = node(nt, 'ShaderNodeSeparateColor'); nt.links.new(v.outputs['Color'], r.inputs['Color'])
        disc = maprange(nt, v.outputs['Distance'], rad * 0.3, rad, 1, 0)
        s = mth(nt, 'MULTIPLY', disc, mth(nt, 'MULTIPLY', mth(nt, 'POWER', r.outputs[0], 5.0), gain))
        star = mth(nt, 'ADD', star, s)
    MX, MZ = S(66, 4)
    dx = mth(nt, 'SUBTRACT', X, MX); dz = mth(nt, 'SUBTRACT', Z, MZ)
    d = mth(nt, 'SQRT', mth(nt, 'ADD', mth(nt, 'MULTIPLY', dx, dx), mth(nt, 'MULTIPLY', dz, dz)))
    star = mth(nt, 'MULTIPLY', star, mth(nt, 'MULTIPLY', mth(nt, 'SUBTRACT', 1.0, cloud, clamp=True), maprange(nt, d, 1.5, 4.0)))
    star = mth(nt, 'MULTIPLY', star, maprange(nt, Z, -8.5, -6.0))
    col = mixc(nt, mth(nt, 'MINIMUM', star, 1.0), col, (0.85, 0.85, 1.0))
    # moon: disc with faint maria, warm halo
    mn = node(nt, 'ShaderNodeTexNoise'); mn.inputs['Scale'].default_value = 2.2; mn.inputs['Detail'].default_value = 3
    nt.links.new(tc.outputs['Object'], mn.inputs['Vector'])
    disc = maprange(nt, d, 0.86, 0.9, 1, 0)
    mcol = mixc(nt, maprange(nt, mn.outputs['Fac'], 0.45, 0.65), (0.75, 0.68, 0.62), (1.0, 0.94, 0.84))
    glow = mth(nt, 'ADD', mth(nt, 'MULTIPLY', mth(nt, 'EXPONENT', mth(nt, 'MULTIPLY', d, -1.6)), 0.6),
               mth(nt, 'MULTIPLY', mth(nt, 'EXPONENT', mth(nt, 'MULTIPLY', d, -0.35)), 0.10))
    gcol = node(nt, 'ShaderNodeMix', data_type='RGBA', blend_type='ADD')
    sock(gcol, 'Factor', 'VALUE').default_value = 1.0
    nt.links.new(col, sock(gcol, 'A', 'RGBA')); sock(gcol, 'B', 'RGBA').default_value = (0.4, 0.3, 0.36, 1)
    col = mixc(nt, mth(nt, 'MINIMUM', glow, 1.0), col, sock(gcol, 'Result', 'RGBA', outputs=True))
    col = mixc(nt, disc, col, mcol)
    em = node(nt, 'ShaderNodeEmission'); nt.links.new(col, em.inputs['Color'])
    feed(nt, em.inputs['Strength'], maprange(nt, disc, 0, 1, 1.0, 2.2, smooth=False))
    nt.links.new(em.outputs[0], nt.nodes['Material Output'].inputs['Surface'])
    o.data.materials.append(m)


def build_plate():
    G = MATS['GRANITE']
    sky_backdrop()
    # hollow tower interior, recessed 2 m behind the brick face so the cornice and pillar cast soft shadows into it
    cx, cz = S(180, (88 + 424) / 2)
    box('interior', (BW + 6) * U, (424 - 88) * U, 0.4, 0, interior_mat(), (cx, 2.2, cz))
    # chamber back wall (v3): dark, cool hewn stone in two staggered courses, so the princess reads against it
    hx, hz = S(CH_X0 + CH_W / 2, CH_Y0 + CH_H / 2)   # chamber centre
    CS = chamber_stone_mat()
    ch_h = (CH_H + 4) / 2
    for i in range(2):
        y0 = CH_Y0 - 2 + ch_h * i
        off = -14 if i % 2 else 0
        for k in range(-1, 5):
            x0 = CH_X0 - 2 + off + k * 34
            xa, xb = max(x0, CH_X0 - 2), min(x0 + 34, CH_X0 + CH_W + 2)
            if xb - xa < 1: continue
            px_, pz_ = S((xa + xb) / 2, y0 + ch_h / 2)
            box(f'cstone{i}_{k}', (xb - xa) * U - 0.08, ch_h * U - 0.08, 0.3, 0.06, CS, (px_, 0.62 + 0.03 * ((i + k) % 2), pz_), segs=2)
    box('chamberback', (CH_W + 8) * U, (CH_H + 8) * U, 0.1, 0, MATS['MORT'], (hx, 0.85, hz))
    # pillars: stacked granite courses, inner faces flush with the board edges (x = 20 and 340)
    for side in (-1, 1):
        xin = OXU if side < 0 else OXU + BW
        xout = xin + side * 22
        x = (xin + xout) / 2 * U
        top, bot = 66, 426
        n = 9; hh = (bot - top) / n
        for k in range(n):
            _, z = S(0, top + hh * (k + 0.5))
            box(f'pillar{side}_{k}', 22 * U, hh * U - 0.12, 1.8, 0.14, G, (x, -0.5 + random.uniform(-0.02, 0.02), z))
        _, z = S(0, (top + bot) / 2)
        box(f'pillarback{side}', 22 * U, (bot - top) * U, 0.2, 0, MATS['MORT'], (x, 0.6, z))
    for i in range(11):
        x = CX - BW * U / 2 - 0.8 + i * (BW * U + 1.6) / 10
        box(f'merlon{i}', 1.6, 1.4, 1.6, 0.15, G, (x, -0.5, CZ + BH * U / 2 + 1.3))
    box('cornice', BW * U + 4, 0.6, 2.0, 0.15, G, (CX, -0.5, CZ + BH * U / 2 + 0.4))
    # courtyard wall behind the paddle: big dark blocks set back from the play plane (v3: no torches, lit evenly and dimly)
    base = OYU + BH
    rnd = random.Random(11)
    for row in range(10):
        off = 40 if row % 2 else 0
        for i in range(-1, 6):
            x0 = i * 80 + off; y0 = base + 8 + row * 40
            bx, bz = S(x0 + 40, y0 + 20)
            box(f'cw{row}_{i}', 80 * U - 0.15, 40 * U - 0.15, 1.0, 0.18, G, (bx, 2.5 + rnd.uniform(0, 0.15), bz))
    box('courtback', 50, (900 - base) * U, 0.2, 0, MATS['MORT'], (CX, 3.4, S(0, (base + 900) / 2)[1]))
    box('plinth', BW * U + 4, 0.9, 2.2, 0.15, G, (CX, -0.5, -(base + 4) * U))
    # v3: no torches, no lantern. The lower dungeon wall gets one broad, dim, neutral-cool wash so it is lit evenly,
    # and the chamber a faint cool top light so its stone reads without drawing the eye.
    _, wz = S(0, (base + 780) / 2)
    bpy.ops.object.light_add(type='AREA', location=(CX, -22, wz), rotation=(math.radians(90), 0, 0)); L = bpy.context.object.data
    L.shape = 'RECTANGLE'; L.size = 46; L.size_y = 40; L.energy = WALL_LIGHT; L.color = (0.78, 0.8, 0.95)
    bpy.ops.object.light_add(type='AREA', location=(hx, -1.0, hz + CH_H * U * 0.45), rotation=(math.radians(50), 0, 0)); L = bpy.context.object.data
    L.shape = 'RECTANGLE'; L.size = CH_W * U; L.size_y = 0.6; L.energy = CHAMBER_LIGHT; L.color = (0.62, 0.72, 1.0)
    # cage bars (bars.png pass only), v3: dark gunmetal iron, five thin round bars between a flat top and bottom rail,
    # a rivet where each bar meets a rail and at the rail ends (same layout as the game's code-drawn cage)
    bars = []
    IRN, RAIL, RIV = cage_iron_mat(), cage_iron_mat('#3a3e48'), MATS['RIVET']
    yb = -DEPTH - 0.15
    for i in range(1, 6):
        x, _ = S(CH_X0 + CH_W * i / 6, 0)
        bars.append(cyl(0.1, CH_H * U - 0.2, (x, yb, hz), IRN, verts=32))
    for yy in (CH_Y0 + 1.75, CH_Y0 + CH_H - 1.75):
        _, z = S(0, yy)
        bars.append(box('rail', CH_W * U, 0.35, 0.22, 0.06, RAIL, (hx, yb - 0.14, z), segs=3))
        for i in range(0, 7):
            x, _ = S(CH_X0 + 1.6 + (CH_W - 3.2) * i / 6 if i in (0, 6) else CH_X0 + CH_W * i / 6, 0)
            bpy.ops.mesh.primitive_uv_sphere_add(radius=0.07, segments=20, ring_count=10, location=(x, yb - 0.26, z))
            r = bpy.context.object; r.scale = (1, 0.6, 1); bpy.ops.object.shade_smooth(); r.data.materials.append(RIV); bars.append(r)
    for b in bars: b.hide_render = True
    return bars


def render_plate():
    sc = reset(); random.seed(7)
    bars = build_plate()
    P = PLATE
    if FAST:
        frame(sc, P['x0'], P['y0'], P['w'], P['h'], 1, os.path.join(RAW, 'plate_fast.png'), False, 24)
        return
    frame(sc, P['x0'], P['y0'], P['w'], P['h'], P['ppu'], os.path.join(RAW, 'plate.png'), False, 96)


def render_bars():
    sc = reset(); random.seed(7)
    bars = build_plate()
    for o in sc.objects:
        if o.type == 'MESH' and o.name != 'softbox': o.hide_render = True
    for b in bars: b.hide_render = False
    for o in sc.objects:   # v3: keep the iron's highlights cool grey: warm lights do not show in its reflections
        if o.type == 'LIGHT' and o.data.color[2] < 0.9: o.visible_glossy = False
    hx, hz = S(CH_X0 + CH_W / 2, CH_Y0 + CH_H / 2)
    bpy.ops.object.light_add(type='AREA', location=(hx - 4.0, -DEPTH - 6.0, hz + 2.0), rotation=(math.radians(78), 0, math.radians(-34)))
    L = bpy.context.object.data; L.shape = 'RECTANGLE'; L.size = 1.0; L.size_y = 14; L.energy = 5000; L.color = (0.8, 0.86, 1.0)
    bpy.ops.object.light_add(type='AREA', location=(hx + 5.0, -DEPTH - 5.0, hz + 1.0), rotation=(math.radians(80), 0, math.radians(45)))
    L = bpy.context.object.data; L.shape = 'RECTANGLE'; L.size = 0.6; L.size_y = 14; L.energy = 1500; L.color = (0.7, 0.8, 1.0)   # cool rim
    P = PLATE
    sc.render.use_border = True; sc.render.use_crop_to_border = False
    sc.render.border_min_x = (CH_X0 - 6 - P['x0']) / P['w']; sc.render.border_max_x = (CH_X0 + CH_W + 6 - P['x0']) / P['w']
    sc.render.border_min_y = 1 - (CH_Y0 + CH_H + 6 - P['y0']) / P['h']; sc.render.border_max_y = 1 - (CH_Y0 - 6 - P['y0']) / P['h']
    frame(sc, P['x0'], P['y0'], P['w'], P['h'], P['ppu'], os.path.join(RAW, 'bars.png'), True, 48)


# ---------------------------------------------------------------- cracks (deterministic, seeded per variant)
TEXPPU, SS = 24, 3


def crack_texture(col, w, dmg, corner):
    Wu, Hu = w * CELL - MORTAR / U, CELL - MORTAR / U
    k = TEXPPU * SS
    big = Image.new('L', (round(Wu * k), round(Hu * k)), 0); d = ImageDraw.Draw(big)
    P = lambda x, y: (x * k, y * k)

    def walk(rng, x, y, ang, length, width, depth=0):
        seg = 0.8; n = max(3, int(length / seg)); pts = [(x, y)]
        for i in range(n):
            ang += rng.gauss(0, 0.30)
            x += math.cos(ang) * seg; y += math.sin(ang) * seg
            pts.append((x, y))
            if not (-1 < x < Wu + 1 and -1 < y < Hu + 1): break
            if depth < 2 and i > 1 and rng.random() < 0.11:
                walk(rng, x, y, ang + rng.choice((-1, 1)) * rng.uniform(0.6, 1.1), length * (1 - i / n) * rng.uniform(0.35, 0.65), width * 0.6, depth + 1)
        for j in range(len(pts) - 1):
            t = j / (len(pts) - 1); wd = max(0.12, width * (1 - t) ** 0.7)
            d.line([P(*pts[j]), P(*pts[j + 1])], fill=255, width=max(1, round(wd * k)))
            r = wd * k / 2; cx, cy = P(*pts[j + 1]); d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=255)

    def from_edge(rng, length, width):
        e = rng.random()
        if e < 0.75:   # top or bottom edge, heading inward
            top = rng.random() < 0.5; x = rng.uniform(2.5, Wu - 2.5)
            walk(rng, x, 0.2 if top else Hu - 0.2, (math.pi / 2 if top else -math.pi / 2) + rng.uniform(-0.7, 0.7), length, width)
        else:          # a side
            left = rng.random() < 0.5
            walk(rng, 0.2 if left else Wu - 0.2, rng.uniform(3, Hu - 3), (0 if left else math.pi) + rng.uniform(-0.6, 0.6), length, width)

    r1 = random.Random(f'{col}{w}-hairline')
    for i in range(1 + w):
        from_edge(r1, r1.uniform(6, 9 + 4 * w), r1.uniform(0.32, 0.42))
    if dmg >= 2:
        r2 = random.Random(f'{col}{w}-shatter')
        sx, sz = corner
        cx, cy = (Wu if sx > 0 else 0), (0 if sz > 0 else Hu)
        base_ang = math.atan2((Hu / 2 - cy), (Wu / 2 - cx))
        for i in range(3 + w):
            a = base_ang + (i - (2 + w) / 2) * 0.42 + r2.uniform(-0.15, 0.15)
            walk(r2, cx + math.cos(a) * 4.2, cy + math.sin(a) * 4.2, a, r2.uniform(7, 12 + 6 * w), r2.uniform(0.5, 0.65))
        from_edge(r2, r2.uniform(8, 10 + 5 * w), 0.45)
    size = (round(Wu * TEXPPU), round(Hu * TEXPPU))
    R = big.resize(size, Image.LANCZOS)
    halo = ImageChops.subtract(R.filter(ImageFilter.GaussianBlur(TEXPPU * 0.9)).point(lambda v: min(255, v * 3)), R)
    Hh = R.filter(ImageFilter.GaussianBlur(TEXPPU * 0.28)).point(lambda v: min(255, v * 1.6))
    path = os.path.join(TMP, f'crack_{col}_{w}_{dmg}.png')
    Image.merge('RGB', (R, halo, Hh)).save(path)
    return path


# ---------------------------------------------------------------- sprites
SPRITES = {}   # name -> dict(size=(w,h) units crop, foot=(w,h) units, build=fn)


def at(dx=0.0, dy=0.0, y=0.0):
    x, z = S(*P0)
    return (x + dx, y, z + dy)


def make_brick(col, w, dmg):
    def build():
        W, H = w * CELL * U - MORTAR, CELL * U - MORTAR
        rng = random.Random(f'{col}{w}-chip')
        corner = (rng.choice((-1, 1)), rng.choice((-1, 1)))
        seed = {'t': 1, 'v': 2, 'c': 3, 'y': 4, 'b': 5}[col] * 7 + w
        crack = crack_texture(col, w, dmg, corner) if dmg else None
        m = glaze_mat(f'glaze_{col}{w}{dmg}', COLORS[col], seed, crack, (W, H), gloss=True)
        o = box(f'brick_{col}_{w}_{dmg}', W, H, DEPTH, 0.3, m, at(y=-DEPTH / 2), segs=8, local=True)
        if dmg >= 2:
            bis = biscuit_mat(f'biscuit_{col}{w}', COLORS[col])
            cx, _, cz = at(); cut = []
            ox, oz = cx + corner[0] * W / 2, cz + corner[1] * H / 2
            for k in range(3):
                s = rng.uniform(0.6, 0.75) * (1 if k == 0 else 0.7)
                bpy.ops.mesh.primitive_cube_add(size=s, location=(ox - corner[0] * rng.uniform(0.0, 0.22) * k,
                                                                  -DEPTH + rng.uniform(-0.05, 0.08),
                                                                  oz - corner[1] * rng.uniform(0.0, 0.18) * (2 - k)),
                                                rotation=(rng.uniform(0, 3), rng.uniform(0, 3), rng.uniform(0, 3)))
                c = bpy.context.object; c.data.materials.append(bis); cut.append(c)
            for c in cut:
                bpy.context.view_layer.objects.active = o
                md = o.modifiers.new('chip', 'BOOLEAN'); md.operation = 'DIFFERENCE'; md.object = c; md.solver = 'EXACT'
                md.material_mode = 'TRANSFER'
                bpy.ops.object.modifier_apply(modifier='chip')
            for c in cut: bpy.data.objects.remove(c)
            bpy.context.view_layer.objects.active = o; o.select_set(True)
            bpy.ops.object.shade_smooth_by_angle(angle=math.radians(35))
        return [o, gloss_card(f'card_{col}{w}{dmg}', W, H, -DEPTH)]
    SPRITES[f'brick_{col}_{w}_{dmg}'] = dict(size=(w * CELL + 2 * MARGIN, CELL + 2 * MARGIN), foot=(w * CELL, CELL), build=build, kind='brick')


def build_gold():
    W = CELL * U - MORTAR
    o = box('gold', W, W, DEPTH, 0.12, MATS['GOLD'], at(y=-DEPTH / 2 - 0.05), segs=6)
    bpy.ops.mesh.primitive_ico_sphere_add(radius=0.42, subdivisions=1, location=at(y=-DEPTH - 0.14))
    g = bpy.context.object; g.scale = (1, 0.5, 1); g.data.materials.append(MATS['RUBY'])
    bpy.ops.mesh.primitive_torus_add(major_radius=0.46, minor_radius=0.05, location=at(y=-DEPTH - 0.1), rotation=(math.radians(90), 0, 0))
    t = bpy.context.object; bpy.ops.object.shade_smooth(); t.data.materials.append(MATS['GOLD'])
    return [o, g, t, gloss_card('card_gold', W, W, -DEPTH - 0.05, strength=2.5, window=False, sheen=0.0)]


def build_granite():
    W = CELL * U - MORTAR * 0.5
    o = box('granite', W, W, DEPTH + 0.2, 0.08, MATS['GRANITE'], at(y=-(DEPTH + 0.2) / 2))
    objs = [o]
    for dx in (-0.48, 0.48):
        for dz in (-0.48, 0.48):
            objs.append(box(f'washer{dx}{dz}', 0.28, 0.28, 0.05, 0.015, MATS['IRON'], at(dx, dz, -DEPTH - 0.225), segs=2))
            bpy.ops.mesh.primitive_uv_sphere_add(radius=0.11, segments=16, ring_count=8, location=at(dx, dz, -DEPTH - 0.24))
            r = bpy.context.object; bpy.ops.object.shade_smooth(); r.data.materials.append(MATS['RIVET']); objs.append(r)
    objs.append(gloss_card('card_granite', W, W, -DEPTH - 0.2, strength=3.0, sheen=0.10))
    return objs


def ball_env(name='ballenv'):
    """Reflection-only surroundings for the chrome hero ball (invisible to camera and shadows): the vault as the
    ball would see it, dark stone below with warm torch glints, a violet dusk horizon, the moon-lit sky above."""
    bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32, radius=6, location=at(y=-DEPTH - 0.6))
    o = bpy.context.object; o.name = name
    for a in ('visible_camera', 'visible_diffuse', 'visible_transmission', 'visible_volume_scatter', 'visible_shadow'):
        setattr(o, a, False)
    m = bpy.data.materials.new('ballenv'); nt = m.node_tree; nt.nodes.remove(nt.nodes['Principled BSDF'])
    tc = node(nt, 'ShaderNodeTexCoord'); sep = node(nt, 'ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['Object'], sep.inputs['Vector'])
    X, Y, Z = sep.outputs['X'], sep.outputs['Y'], sep.outputs['Z']
    g = node(nt, 'ShaderNodeValToRGB'); e = g.color_ramp.elements
    nt.links.new(maprange(nt, Z, -6, 6, 0, 1, smooth=False), g.inputs['Fac'])
    e[0].position = 0.0; e[0].color = (0.03, 0.02, 0.03, 1); e[1].position = 1.0; e[1].color = (0.75, 0.74, 0.95, 1)
    for p, c in ((0.38, (0.06, 0.035, 0.05)), (0.49, (0.30, 0.13, 0.22)), (0.53, (0.55, 0.30, 0.30)),
                 (0.57, (0.14, 0.10, 0.22)), (0.75, (0.36, 0.34, 0.55))):
        k = g.color_ramp.elements.new(p); k.color = (*c, 1)
    col = g.outputs['Color']
    # two warm torch glints low left/right and a cool rim strip high right
    for (cx_, cz_, r_, c_) in ((4.6, -1.4, 0.7, (6.0, 2.4, 0.7)), (-1.5, -5.2, 3.5, (0.16, 0.07, 0.05)),
                               (4.2, 3.0, 1.0, (1.4, 1.6, 2.6)), (-3.0, 3.6, 1.9, (4.0, 3.5, 3.0))):
        dx = mth(nt, 'SUBTRACT', X, cx_); dz = mth(nt, 'SUBTRACT', Z, cz_)
        d = mth(nt, 'SQRT', mth(nt, 'ADD', mth(nt, 'MULTIPLY', dx, dx), mth(nt, 'MULTIPLY', dz, dz)))
        col = mixc(nt, mth(nt, 'MULTIPLY', maprange(nt, d, r_, r_ * 0.3), maprange(nt, Y, 0.0, -2.0)), col, c_)
    em = node(nt, 'ShaderNodeEmission'); nt.links.new(col, em.inputs['Color']); em.inputs['Strength'].default_value = 1.4
    nt.links.new(em.outputs[0], nt.nodes['Material Output'].inputs['Surface'])
    o.data.materials.append(m)
    return o


def build_ball(fire=False):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=96, ring_count=48, radius=0.6, location=at(y=-DEPTH - 0.6))
    o = bpy.context.object; bpy.ops.object.shade_smooth()
    if not fire:
        steel = mat('steelball', (0.93, 0.93, 0.95), rough=0.035, metal=1.0, coat=0.6, coat_rough=0.0)
        o.data.materials.append(steel); return [o, ball_env()]
    m = mat('molten', (0.2, 0.035, 0.0), rough=0.35, coat=1.0, coat_rough=0.05); nt = m.node_tree; b = nt.nodes['Principled BSDF']
    tc = node(nt, 'ShaderNodeTexCoord')
    nz = node(nt, 'ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 3.2; nz.inputs['Detail'].default_value = 6; nz.inputs['Distortion'].default_value = 0.8
    nt.links.new(tc.outputs['Object'], nz.inputs['Vector'])
    ramp = node(nt, 'ShaderNodeValToRGB'); e = ramp.color_ramp.elements
    e[0].position = 0.42; e[0].color = (0.55, 0.03, 0.0, 1); e[1].position = 0.6; e[1].color = (1.0, 0.33, 0.02, 1)
    nt.links.new(nz.outputs['Fac'], ramp.inputs['Fac'])
    lw = node(nt, 'ShaderNodeLayerWeight'); lw.inputs['Blend'].default_value = 0.4
    nt.links.new(ramp.outputs['Color'], b.inputs['Emission Color'])
    feed(nt, b.inputs['Emission Strength'], maprange(nt, lw.outputs['Facing'], 0.0, 1.0, 1.7, 0.6))
    o.data.materials.append(m)
    return [o]


def build_titan():
    """Titan core: dark gunmetal chrome ball (same 12-unit ball in a 20-unit sprite) cut by two tilted great-circle
    seams that glow, one magenta and one cyan, each sunk in a thin dark groove; the vault reflection env as on the ball."""
    bpy.ops.mesh.primitive_uv_sphere_add(segments=128, ring_count=64, radius=0.6, location=at(y=-DEPTH - 0.6))
    o = bpy.context.object; bpy.ops.object.shade_smooth()
    m, nt = layered('titan', None)
    tc = node(nt, 'ShaderNodeTexCoord'); P = tc.outputs['Object']
    gun = principled(nt, srgb('#4c5368'), 0.06, 1.0, coat=0.8)
    sh, dist = gun, []
    for n_, hexc, strength in (((0.30, -0.35, 0.89), '#ff3fd0', 4.0), ((0.88, -0.30, -0.36), '#3ff0ff', 3.5),
                               ((-0.45, -0.55, 0.30), '#ff3fd0', 3.5)):
        ln = math.sqrt(sum(c * c for c in n_)); n_ = tuple(c / ln for c in n_)
        dp = node(nt, 'ShaderNodeVectorMath', operation='DOT_PRODUCT'); nt.links.new(P, dp.inputs[0]); dp.inputs[1].default_value = n_
        d = mth(nt, 'ABSOLUTE', dp.outputs['Value'])                   # metres from the seam plane
        groove = maprange(nt, d, 0.07, 0.055)                          # dark channel
        core = maprange(nt, d, 0.045, 0.02)                            # glowing seam inside it
        sh = mixs(nt, groove, sh, principled(nt, (0.02, 0.02, 0.03), 0.4, 0.8))
        c = srgb(hexc)
        sh = mixs(nt, core, sh, principled(nt, c, 0.2, 0.0, emit=c, emit_str=strength))
    nt.links.new(sh, nt.nodes['Material Output'].inputs['Surface'])
    o.data.materials.append(m)
    return [o, ball_env('titanenv')]


def strip_mask(nt, X, Z, half_len, half_h):
    """Signed distance (m) to a horizontal stadium |x|<half_len, |z|<half_h on the front view."""
    q = mth(nt, 'MAXIMUM', mth(nt, 'SUBTRACT', mth(nt, 'ABSOLUTE', X), half_len - half_h), 0.0)
    return mth(nt, 'SUBTRACT', mth(nt, 'SQRT', mth(nt, 'ADD', mth(nt, 'MULTIPLY', q, q), mth(nt, 'MULTIPLY', Z, Z))), half_h)


def layered(name, layers):
    """Material from a list of (shader node, factor socket or None) mixed in order."""
    m = bpy.data.materials.new(name); nt = m.node_tree; nt.nodes.remove(nt.nodes['Principled BSDF'])
    return m, nt


def principled(nt, color, rough, metal=0.0, coat=0.0, emit=None, emit_str=0.0):
    b = node(nt, 'ShaderNodeBsdfPrincipled')
    b.inputs['Base Color'].default_value = (*color, 1); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    b.inputs['Coat Weight'].default_value = coat; b.inputs['Coat Roughness'].default_value = 0.02
    if emit: b.inputs['Emission Color'].default_value = (*emit, 1); b.inputs['Emission Strength'].default_value = emit_str
    return b.outputs[0]


def mixs(nt, fac, a, b):
    ms = node(nt, 'ShaderNodeMixShader'); feed(nt, ms.inputs[0], fac); nt.links.new(a, ms.inputs[1]); nt.links.new(b, ms.inputs[2])
    return ms.outputs[0]


def build_paddle():
    m, nt = layered('paddle', None)
    tc = node(nt, 'ShaderNodeTexCoord'); sep = node(nt, 'ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['Object'], sep.inputs['Vector'])
    dist = strip_mask(nt, sep.outputs['X'], sep.outputs['Z'], 3.27, 0.17)
    gold = maprange(nt, dist, 0.008, -0.008)
    groove = mth(nt, 'MULTIPLY', maprange(nt, dist, -0.006, 0.006), maprange(nt, dist, 0.04, 0.055, 1, 0))
    sh = principled(nt, (0.9, 0.91, 0.94), 0.06, 1.0)
    sh = mixs(nt, gold, sh, principled(nt, srgb('#ffc94a'), 0.13, 1.0))
    sh = mixs(nt, groove, sh, principled(nt, (0.03, 0.03, 0.045), 0.45, 1.0))
    nt.links.new(sh, nt.nodes['Material Output'].inputs['Surface'])
    return [capsule('paddle', 7.4, 0.6, at(y=-DEPTH - 0.6), m), ball_env('paddleenv')]


def make_cap(key, hexc):
    def build():
        m, nt = layered('cap_' + key, None)
        tc = node(nt, 'ShaderNodeTexCoord'); sep = node(nt, 'ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['Object'], sep.inputs['Vector'])
        band = mth(nt, 'ABSOLUTE', mth(nt, 'SUBTRACT', mth(nt, 'ABSOLUTE', sep.outputs['X']), 1.3))
        chrome = maprange(nt, band, 0.085, 0.07)
        groove = mth(nt, 'MULTIPLY', maprange(nt, band, 0.07, 0.085), maprange(nt, band, 0.11, 0.125, 1, 0))
        c = srgb(hexc)
        b = node(nt, 'ShaderNodeBsdfPrincipled')
        b.inputs['Base Color'].default_value = (*c, 1); b.inputs['Roughness'].default_value = 0.25
        b.inputs['Coat Weight'].default_value = 1.0; b.inputs['Coat Roughness'].default_value = 0.02
        b.inputs['Subsurface Weight'].default_value = 0.12
        b.inputs['Emission Color'].default_value = (*c, 1); b.inputs['Emission Strength'].default_value = 0.12
        sh = mixs(nt, chrome, b.outputs[0], principled(nt, (0.9, 0.91, 0.94), 0.06, 1.0))
        sh = mixs(nt, groove, sh, principled(nt, (0.03, 0.03, 0.045), 0.45, 1.0))
        nt.links.new(sh, nt.nodes['Material Output'].inputs['Surface'])
        return [capsule('cap_' + key, 4.0, 0.9, at(y=-DEPTH - 0.9), m), ball_env('capenv_' + key)]
    SPRITES['cap_' + key] = dict(size=(40 + 2 * MARGIN, 18 + 2 * MARGIN), foot=(40, 18), build=build, kind='capsule')


def build_lantern():
    I = MATS['IRON']; objs = []
    y = -0.2   # same depth as the plate's lantern light
    glass = mat('lanternglass', (1, 0.7, 0.35), rough=0.1, coat=1.0, emit=(1, 0.5, 0.15), emit_str=5)
    objs.append(cyl(0.26, 0.56, at(0, 0, y), glass))
    objs.append(cyl(0.34, 0.07, at(0, -0.31, y), I))
    bpy.ops.mesh.primitive_cone_add(radius1=0.38, radius2=0.08, depth=0.24, location=at(0, 0.39, y), vertices=32)
    c = bpy.context.object; bpy.ops.object.shade_smooth(); c.data.materials.append(I); objs.append(c)
    for a in range(4):
        ang = math.pi / 4 + a * math.pi / 2
        objs.append(cyl(0.025, 0.62, at(0.28 * math.cos(ang), 0, y + 0.28 * math.sin(ang)), I, verts=8))
    bpy.ops.mesh.primitive_torus_add(major_radius=0.1, minor_radius=0.025, location=at(0, 0.6, y), rotation=(math.radians(90), 0, 0))
    t = bpy.context.object; bpy.ops.object.shade_smooth(); t.data.materials.append(I); objs.append(t)
    objs.append(cyl(0.02, 0.5, at(0, 0.92, y), I, verts=8))
    return objs


SPRITES['brick_gold_1_0'] = dict(size=(24, 24), foot=(16, 16), build=build_gold, kind='gold')
SPRITES['brick_granite_1_0'] = dict(size=(24, 24), foot=(16, 16), build=build_granite, kind='granite')
for _c in COLORS:
    for _w in (1, 2):
        for _d in (0, 1, 2):
            make_brick(_c, _w, _d)
SPRITES['ball'] = dict(size=(20, 20), foot=(12, 12), build=build_ball, kind='ball')
SPRITES['ball_titan'] = dict(size=(20, 20), foot=(12, 12), build=build_titan, kind='ball')
SPRITES['ball_fire'] = dict(size=(20, 20), foot=(12, 12), build=lambda: build_ball(True), kind='ball')
SPRITES['paddle'] = dict(size=(74 + 2 * MARGIN, 12 + 2 * MARGIN), foot=(74, 12), build=build_paddle, kind='paddle')
for _k, _h in CAPS.items(): make_cap(_k, _h)
SPRITES['lantern'] = dict(size=(16, 24), foot=(8, 13), build=build_lantern, kind='prop')
SPRITES['torch_flame'] = dict(size=(24, 32), foot=(6, 10), build=lambda: [flame('flame', at(y=-DEPTH - 0.5), 0.33, flame_mat('tf'))], kind='prop')


def render_sprites(names=None):
    sc = reset()
    names = names or list(SPRITES)
    built = {}
    for n in names:
        built[n] = SPRITES[n]['build']()
    for n in names:
        for k, objs in built.items():
            for o in objs: o.hide_render = k != n
        w, h = SPRITES[n]['size']
        frame(sc, P0[0] - w / 2, P0[1] - h / 2, w, h, SPR_PPU, os.path.join(RAW, n + '.png'), True, 32 if FAST else 64)
    manifest = {n: dict(size=s['size'], foot=s['foot'], kind=s['kind']) for n, s in SPRITES.items()}
    json.dump(manifest, open(os.path.join(RAW, 'manifest.json'), 'w'), indent=1)


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    what = args[0] if args else 'all'
    if what in ('plate', 'all'): render_plate()
    if what in ('bars', 'all'): render_bars()
    if what in ('sprites', 'all'): render_sprites(args[1:] or None)
    if what in ('post', 'all'):
        import subprocess
        subprocess.run([sys.executable, os.path.join(HERE, 'vault_post.py')], check=True)
