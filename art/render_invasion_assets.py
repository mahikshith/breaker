# BREACH "Invasion" (level 1) production renders: hangar plate, glazed candy / armor / power bricks, the toy robot
# invaders (7 expressions x 5 body colours), the mothership with its alien pilot (5 expressions + blinking rim
# lights), the plasma bolt and the bomb.
#
# Same look as The Vault: it imports art/render_vault_assets.py for the materials, the light rig (key / cool fill /
# warm bounce area lights + softbox reflection plane), the ortho camera framing and AgX Medium High Contrast. Every
# sprite is rendered at the Vault's sprite spot P0 so the lighting is identical to the Vault bricks.
#
# Run from the repo root (Blender 5.2 as a Python module + Pillow + numpy):
#   python3 art/render_invasion_assets.py all             # plate + sprites + post   (~20 min on 4 cores)
#   python3 art/render_invasion_assets.py plate [--fast]  # just the plate (fast = 1 px/unit, few samples)
#   python3 art/render_invasion_assets.py sprites [name ...] [--fast] [--ppu N]
#   python3 art/render_invasion_assets.py post            # = python3 art/invasion_post.py
# Raw renders land in art/out/invasion_raw/, final assets in assets/invasion/ (see art/invasion_post.py).
#
# Coordinates: 1 game unit = 0.1 m; screen y grows downward; Blender (x, z) = (x * 0.1, -y * 0.1); the camera sits
# at y = -60 looking +Y. Plate covers screen x 0..360, y -40..780 at 2 px/unit: px = 2 * x, py = 2 * (y + 40).
import bpy, bmesh, math, random, sys, os, json
from mathutils import Vector, Matrix
from PIL import Image, ImageDraw, ImageFilter, ImageChops

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import render_vault_assets as V
from render_vault_assets import node, sock, feed, mixc, mth, maprange, mat, box, cyl, srgb, S, U

ROOT = os.path.dirname(HERE)
RAW = os.path.join(HERE, 'out', 'invasion_raw')
TMP = os.path.join(HERE, 'out', 'invasion_tmp')
os.makedirs(RAW, exist_ok=True); os.makedirs(TMP, exist_ok=True)
FAST = '--fast' in sys.argv
_ppu = [a for a in sys.argv if a.startswith('--ppu=')]
SPR_PPU = int(_ppu[0].split('=')[1]) if _ppu else 3
MARGIN = 4
CW, CH, COLS, ROWS = 28, 18, 11, 9
OX, OY = 26, 92
PLATE = dict(x0=0, y0=-40, w=360, h=820, ppu=2)
ROW_COLORS = ['#ff5d8f', '#ff8a3d', '#ffd23f', '#5ccf6a', '#2ec4b6', '#3fa8f5', '#7b6cf6', '#c46bf0', '#ff5d8f']
ARMOR, POWER = '#8d97b3', '#f4c542'
BOT_COLORS = {'white': '#f4f6fb', 'pink': '#ff5d8f', 'yellow': '#ffd23f', 'blue': '#3fa8f5'}
GAP = 1.4                                  # units of air between neighbouring bricks (no mortar here)


def at(dx=0.0, dz=0.0, y=0.0):
    """Blender location relative to the sprite spot (metres)."""
    x, z = S(*V.P0)
    return (x + dx, y, z + dz)


def lin(h, k=1.0):
    return tuple(c * k for c in srgb(h))


def hide_from_rays(o, camera=True):
    for a in ('visible_diffuse', 'visible_glossy', 'visible_transmission', 'visible_volume_scatter', 'visible_shadow'):
        setattr(o, a, False)
    o.visible_camera = camera


def new_obj(name, bm, m=None, smooth=True, parent=None):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    if smooth:
        for p in me.polygons: p.use_smooth = True
    o = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(o)
    if m: o.data.materials.append(m)
    if parent: o.parent = parent
    return o


def empty(name, loc=(0, 0, 0), parent=None):
    e = bpy.data.objects.new(name, None); bpy.context.scene.collection.objects.link(e)
    e.location = loc; e.parent = parent
    return e


def sgnpow(v, e):
    return math.copysign(abs(v) ** e, v)


def squircle(name, hx, hz, hy, m, ex=0.45, ez=0.45, ey=0.5, ez_top=None, taper=0.0, seg=96, rings=48, parent=None,
             loc=(0, 0, 0), dent=None):
    """Superellipsoid (rounded box / helmet) in metres: half extents hx (x), hz (z, up), hy (y, depth).
    ez_top: rounder exponent for the top half (dome). taper: narrows the top. dent: (x, z, radius, depth) push-in."""
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=rings, radius=1)
    for v in bm.verts:
        sx, sy, sz = v.co           # sphere poles along z -> make them the depth axis
        x, zz, y = sx, sy, sz
        e_z = ez_top if (ez_top and zz > 0) else ez
        X = hx * sgnpow(x, ex); Z = hz * sgnpow(zz, e_z); Y = hy * sgnpow(y, ey)
        if taper and Z > 0: X *= 1 - taper * (Z / hz) ** 2
        v.co = Vector((X, Y, Z))
        if dent:   # push the surface inward around a 3D point (dx, dy, dz)
            dx, dy, dz, r, d = dent
            g = math.exp(-((X - dx) ** 2 + (Y - dy) ** 2 + (Z - dz) ** 2) / (2 * r * r))
            v.co -= v.co.normalized() * d * g
    o = new_obj(name, bm, m, parent=parent); o.location = loc
    return o


def tube(name, pts, radius, m, parent=None, res=4, caps=True):
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = radius; cu.bevel_resolution = res
    cu.use_fill_caps = caps
    sp = cu.splines.new('POLY'); sp.points.add(len(pts) - 1)
    for p, c in zip(sp.points, pts): p.co = (*c, 1)
    o = bpy.data.objects.new(name, cu); bpy.context.scene.collection.objects.link(o); o.parent = parent
    o.data.materials.append(m)
    return o


def round_cap_tube(name, pts, radius, m, parent=None):
    """Stroke with rounded ends (tube + a sphere on each end) - LED strokes read better with round caps."""
    objs = [tube(name, pts, radius, m, parent)]
    for p in (pts[0], pts[-1]):
        bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=16, v_segments=8, radius=radius)
        s = new_obj(name + '_cap', bm, m, parent=parent); s.location = p; objs.append(s)
    return objs


def fill_shape(name, loops, m, depth=0.01, parent=None):
    """Filled flat 2D shape(s) (list of closed point loops in the local XY plane; nested loops make holes)."""
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '2D'; cu.fill_mode = 'BOTH'; cu.extrude = depth
    for loop in loops:
        sp = cu.splines.new('POLY'); sp.points.add(len(loop) - 1); sp.use_cyclic_u = True
        for p, c in zip(sp.points, loop): p.co = (c[0], c[1], 0, 1)
    o = bpy.data.objects.new(name, cu); bpy.context.scene.collection.objects.link(o); o.parent = parent
    o.data.materials.append(m)
    return o


def chaikin(pts, it=2, closed=True):
    for _ in range(it):
        out = []
        n = len(pts)
        rng = range(n) if closed else range(n - 1)
        if not closed: out.append(pts[0])
        for i in rng:
            a, b = pts[i], pts[(i + 1) % n]
            out.append((0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]))
            out.append((0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]))
        if not closed: out.append(pts[-1])
        pts = out
    return pts


def ellipse(cx, cz, rx, rz, n=48, a0=0.0, a1=math.tau):
    return [(cx + rx * math.cos(a0 + (a1 - a0) * i / n), cz + rz * math.sin(a0 + (a1 - a0) * i / n)) for i in range(n)]


def emission(name, color, strength):
    return V.emit_mat(name, color, strength)


def principled_mix_glass(name, tint=(0.8, 0.9, 1.0), refl=0.9, base=0.04, rough=0.02):
    """Clear 'fake glass' that keeps alpha: transparent where it faces the camera, glossy at grazing angles."""
    m = bpy.data.materials.new(name); nt = m.node_tree; nt.nodes.remove(nt.nodes['Principled BSDF'])
    lw = node(nt, 'ShaderNodeLayerWeight'); lw.inputs['Blend'].default_value = 0.25
    tr = node(nt, 'ShaderNodeBsdfTransparent'); tr.inputs['Color'].default_value = (*tint, 1)
    gl = node(nt, 'ShaderNodeBsdfGlossy'); gl.inputs['Roughness'].default_value = rough
    fac = mth(nt, 'ADD', mth(nt, 'MULTIPLY', lw.outputs['Fresnel'], refl), base, clamp=True)
    ms = node(nt, 'ShaderNodeMixShader'); nt.links.new(fac, ms.inputs[0]); nt.links.new(tr.outputs[0], ms.inputs[1]); nt.links.new(gl.outputs[0], ms.inputs[2])
    nt.links.new(ms.outputs[0], nt.nodes['Material Output'].inputs['Surface'])
    return m


def metal_mat(name, hexc, rough=0.3, metal=0.85, coat=0.6, scratch=0.0):
    m = mat(name, srgb(hexc), rough=rough, metal=metal, coat=coat, coat_rough=0.04)
    if scratch:   # faint brushed grain
        nt = m.node_tree; b = nt.nodes['Principled BSDF']
        tc = node(nt, 'ShaderNodeTexCoord'); mp = node(nt, 'ShaderNodeMapping'); mp.inputs['Scale'].default_value = (1, 40, 40)
        nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])
        nz = node(nt, 'ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 3.0; nz.inputs['Detail'].default_value = 4
        nt.links.new(mp.outputs['Vector'], nz.inputs['Vector'])
        feed(nt, b.inputs['Roughness'], maprange(nt, nz.outputs['Fac'], 0.3, 0.7, rough - scratch, rough + scratch))
    return m


# =============================================================================================== robot invader
LED_STR = {'white': 2.6, 'red': 4.0, 'amber': 3.0}
LED = {'cyan': '#3ff0ff', 'red': '#ff1a30', 'amber': '#ffb02e', 'white': '#d8fbff', 'pink': '#ff6fd0', 'lime': '#b6ff5a'}

# expressions: eye shape, mouth shape, LED colour, antenna (control, tip), arm angles (deg, + = up), feet lift, bob,
# head roll (deg), extra flags
BOT_EXPR = {
    'march0': dict(eye='smug', mouth='smirk', led='cyan', ant=((0.6, 9.2), (2.6, 10.6)), arms=(38, -28), feet=(0.8, 0), bob=0.45, look=0.35, roll=-2),
    'march1': dict(eye='smug', mouth='smirk', led='cyan', ant=((-0.6, 9.2), (-2.6, 10.6)), arms=(-28, 38), feet=(0, 0.8), bob=0.0, look=-0.35, roll=2),
    'angry':  dict(eye='angry', mouth='grit', led='red', ant=((0.0, 9.3), (0.0, 10.7)), arms=(42, 42), feet=(0, 0), bob=0.2, roll=0, claw_open=1.0),
    'hurt':   dict(eye='hurt', mouth='wobble', led='cyan', ant=((-1.6, 9.6), (2.8, 9.4)), arms=(-48, 20), feet=(0.5, 0), bob=-0.3, roll=6, dent=True, crack=True),
    'dizzy':  dict(eye='spiral', mouth='wave', led='amber', ant=((2.4, 11.2), (5.4, 7.4)), arms=(-62, -62), feet=(0, 0), bob=-0.5, roll=-7, stars=True),
    'laugh':  dict(eye='happy', mouth='open', led='cyan', ant=((-1.4, 9.4), (-3.4, 10.0)), arms=(52, 30), feet=(0.6, 0.0), bob=0.7, roll=-8, claw_open=1.0),
    'shock':  dict(eye='wide', mouth='o', led='white', ant=((0.0, 9.4), (0.0, 10.4)), arms=(58, 58), feet=(0.4, 0.4), bob=0.6, roll=0, claw_open=1.0),
}

# head geometry, game units (x right, z up, origin at the cell centre)
HX, HZ, HY, HZC = 10.4, 7.2, 5.6, -0.4          # helmet half width / half height / half depth, centre z
EX, EZ, EY = 0.5, 0.5, 0.62                     # superellipsoid exponents (x, z bottom, depth)
EZ_TOP = 0.9                                    # rounder dome on top
TAPER = 0.18
VZ, VHX, VHZ = 1.3, 8.1, 3.55                    # visor centre z, half width, half height
MZ, MHX, MHZ = -4.55, 3.5, 1.35                  # mouth display
EYE_X = 4.05
BOT_SCALE = 1.08                                 # whole robot, so it fills the 28 x 18 cell like the bricks


def helmet_front(x, z):
    """Depth (game units, negative = toward camera) of the helmet's front surface at (x, z)."""
    zz = z - HZC; e_z = EZ_TOP if zz > 0 else EZ
    hx = HX * (1 - TAPER * (max(0, zz) / HZ) ** 2)
    s = 1 - abs(x / hx) ** (2 / EX) - abs(zz / HZ) ** (2 / e_z)
    return -HY * max(0.0, s) ** (EY / 2)


def eye_shapes(kind, side, look=0.0):
    """2D LED shapes for one eye (side -1 = screen left). Returns [('fill', pts) | ('stroke', pts, radius)]."""
    cx = side * EYE_X + look * 0.6
    cz = VZ - 0.1
    out = []
    if kind == 'smug':
        # heavy flat lids over the lower half of a tall oval; the lead eye (look side) sits lower and its brow arches up
        rx, rz = 1.75, 2.2
        lead = (side > 0) == (look >= 0)
        h = 0.05 if lead else 0.55
        lid = lambda x: cz + h + 0.10 * (x - cx) * side
        pts = [(x, min(z, lid(x) - 0.4)) for x, z in ellipse(cx, cz - 0.2, rx, rz, 64)]
        out.append(('fill', pts))
        out.append(('stroke', [(cx - 1.95, lid(cx - 1.95)), (cx + 1.95, lid(cx + 1.95))], 0.26))
        if not lead:   # raised, arched brow
            out.append(('stroke', chaikin([(cx - 1.7, cz + 2.0), (cx, cz + 2.75), (cx + 1.7, cz + 2.15)], 2, closed=False), 0.24))
    elif kind == 'angry':
        p = [(-2.0, 1.15), (1.85, -0.55), (1.65, -2.0), (-1.75, -1.75)]
        pts = chaikin([(cx + side * -x, cz + z) for x, z in p], 2)
        out.append(('fill', pts))
    elif kind == 'hurt':
        if side < 0:   # squeezed shut: a chevron pointing at the nose
            out.append(('stroke', [(cx - 1.4, cz + 1.5), (cx + 1.25, cz + 0.05), (cx - 1.4, cz - 1.4)], 0.42))
        else:          # the other eye open, small and worried, lid sloping up toward the nose
            lid = lambda x: cz + 0.75 + 0.35 * (cx - x)
            pts = [(x, min(z, lid(x) - 0.35)) for x, z in ellipse(cx + 0.2, cz - 0.3, 1.4, 1.75, 64)]
            out.append(('fill', pts))
            out.append(('stroke', [(cx - 1.6, lid(cx - 1.6) + 0.1), (cx + 1.8, lid(cx + 1.8) + 0.1)], 0.26))
    elif kind == 'spiral':
        pts = []
        turns = 2.3; n = 90
        for i in range(n + 1):
            t = i / n; a = side * t * turns * math.tau + (0.6 if side > 0 else 2.2)
            r = 0.15 + 1.85 * t
            pts.append((cx + r * math.cos(a), cz + r * math.sin(a)))
        out.append(('stroke', pts, 0.27))
    elif kind == 'happy':   # ^ ^
        p = chaikin([(cx - 1.85, cz - 1.0), (cx, cz + 1.25), (cx + 1.85, cz - 1.0)], 3, closed=False)
        out.append(('stroke', p, 0.5))
    elif kind == 'wide':
        out.append(('ring', (cx, cz, 2.05, 0.42)))
        out.append(('fill', ellipse(cx + 0.0, cz - 0.15, 0.62, 0.62, 32)))
    return out


def mouth_shapes(kind):
    cx, cz = 0.0, MZ
    out = []
    if kind == 'smirk':
        p = chaikin([(cx - 1.9, cz + 0.05), (cx + 0.3, cz - 0.35), (cx + 1.6, cz + 0.05), (cx + 2.0, cz + 0.6)], 2, closed=False)
        out.append(('stroke', p, 0.27))
    elif kind == 'grit':
        r = 0.55; w, h = 2.75, 0.85
        loop = []
        for (qx, qz, a0) in ((w - r, h - r, 0), (-w + r, h - r, 90), (-w + r, -h + r, 180), (w - r, -h + r, 270)):
            for i in range(9):
                a = math.radians(a0 + 90 * i / 8); loop.append((cx + qx + r * math.cos(a), cz + qz + r * math.sin(a)))
        out.append(('fill', loop))
    elif kind == 'wobble':
        p = [(cx - 2.2 + 4.4 * i / 30, cz - 0.2 + 0.35 * math.sin(i / 30 * math.tau * 1.5)) for i in range(31)]
        out.append(('stroke', p, 0.25))
    elif kind == 'wave':
        p = [(cx - 2.6 + 5.2 * i / 40, cz + 0.42 * math.sin(i / 40 * math.tau * 2.0)) for i in range(41)]
        out.append(('stroke', p, 0.25))
    elif kind == 'open':
        loop = [(cx + 2.7 * math.cos(a), cz + 0.75 + 2.0 * math.sin(a)) for a in [math.pi + math.pi * i / 40 for i in range(41)]]
        out.append(('fill', chaikin(loop, 1)))
    elif kind == 'o':
        out.append(('ring', (cx, cz - 0.05, 0.95, 0.3)))
    return out


class Robot:
    def __init__(self):
        self.root = empty('bot_root', at(dz=-0.5 * U, y=0.0)); self.root.scale = (BOT_SCALE,) * 3
        self.body_mat = V.glaze_mat('botbody', BOT_COLORS['white'], 3.0)
        self.gun = metal_mat('botgun', '#454d70', rough=0.3, metal=0.7, coat=0.8)
        self.dark = mat('botdark', srgb('#151a2c'), rough=0.35, metal=0.6, coat=0.6)
        self.chrome = V.MATS['CHROME']
        self.silver = mat('botsilver', srgb('#b4bcd6'), rough=0.3, metal=0.55, coat=0.8)
        self.visor_mats = {}; self.led_mats = {}; self.ball_mats = {}
        self.groups = {}           # expression -> objects only shown for it
        self.pivot = empty('bot_pivot', (0, 0, 0), self.root)    # bob / roll
        u = U
        # helmet (plus a dented copy for 'hurt')
        self.helmet = squircle('helmet', HX * u, HZ * u, HY * u, self.body_mat, ex=EX, ez=EZ, ey=EY, ez_top=EZ_TOP, taper=TAPER,
                               parent=self.pivot, loc=(0, 0, HZC * u))
        self.helmet_dent = squircle('helmet_dent', HX * u, HZ * u, HY * u, self.body_mat, ex=EX, ez=EZ, ey=EY, ez_top=EZ_TOP, taper=TAPER,
                                    parent=self.pivot, loc=(0, 0, HZC * u), dent=(-4.6 * u, -1.5 * u, 7.0 * u, 2.1 * u, 1.9 * u))
        squircle('collar', (HX - 0.6) * u, 1.25 * u, (HY - 0.5) * u, self.gun, ex=0.4, ez=0.5, ey=0.5, parent=self.pivot,
                 loc=(0, 0, (HZC - HZ + 0.9) * u), seg=64, rings=24)
        # visor: dark glowing glass in a gunmetal bezel, eyes on it, a clear shell over the eyes
        vy = helmet_front(0, VZ)
        self.vfront = (vy - 0.45) * u
        squircle('bezel', (VHX + 0.75) * u, (VHZ + 0.7) * u, 0.8 * u, self.gun, ex=0.28, ez=0.32, ey=0.6, parent=self.pivot,
                 loc=(0, (vy + 0.6) * u, VZ * u))
        self.visor = squircle('visor', VHX * u, VHZ * u, 0.9 * u, None, ex=0.28, ez=0.32, ey=0.35, parent=self.pivot,
                              loc=(0, (vy + 0.45) * u, VZ * u))
        self.shell = squircle('shell', (VHX - 0.25) * u, (VHZ - 0.25) * u, 0.12 * u, principled_mix_glass('shellglass', refl=1.0, base=0.03),
                              ex=0.28, ez=0.32, ey=0.6, parent=self.pivot, loc=(0, self.vfront - 0.012, VZ * u))
        self.shell_cracked = squircle('shell_cracked', (VHX - 0.25) * u, (VHZ - 0.25) * u, 0.12 * u, self.cracked_glass(),
                                      ex=0.28, ez=0.32, ey=0.6, parent=self.pivot, loc=(0, self.vfront - 0.012, VZ * u))
        # mouth display: small dark glass slot in a chrome rim, with grill teeth for the angry face
        my = helmet_front(0, MZ)
        self.mfront = (my - 0.55) * u
        squircle('mouthrim', (MHX + 0.55) * u, (MHZ + 0.5) * u, 0.8 * u, self.chrome, ex=0.3, ez=0.4, ey=0.6, parent=self.pivot,
                 loc=(0, (my + 0.45) * u, MZ * u))
        self.mouth = squircle('mouth', MHX * u, MHZ * u, 0.8 * u, None, ex=0.3, ez=0.4, ey=0.4, parent=self.pivot,
                              loc=(0, (my + 0.25) * u, MZ * u))
        self.teeth = []
        for i in range(5):
            x = (-2.2 + 1.1 * i) * u
            t = squircle('tooth', 0.17 * u, 1.05 * u, 0.15 * u, self.dark, ex=0.5, ez=0.3, ey=0.6, parent=self.pivot,
                         loc=(x, self.mfront - 0.03, MZ * u), seg=12, rings=8)
            self.teeth.append(t)
        # ear bolts
        for s in (-1, 1):
            x = s * (HX - 0.2) * u
            cyl(1.95 * u, 2.2 * u, (x + s * 0.4 * u, 0, VZ * u), self.gun, rot=(0, math.radians(90), 0), verts=40).parent = self.pivot
            cyl(1.35 * u, 0.6 * u, (x + s * 1.65 * u, 0, VZ * u), self.silver, rot=(0, math.radians(90), 0), verts=32).parent = self.pivot
            bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=24, v_segments=12, radius=0.85 * u)
            o = new_obj('boltcap', bm, self.silver, parent=self.pivot); o.location = (x + s * 1.9 * u, 0, VZ * u); o.scale = (0.5, 1, 1)
        # antenna base
        top = HZC + HZ
        bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=24, v_segments=12, radius=1.35 * u)
        o = new_obj('antbase', bm, self.gun, parent=self.pivot); o.location = (0, 0, (top - 0.25) * u); o.scale = (1, 1, 0.55)
        self.ant_base = (0.0, top + 0.2)
        self.ant = None; self.ant_ball = None
        # arms: shoulder pivots, a short capsule and an open pincer
        self.arms = []
        for s in (-1, 1):
            sh = empty('shoulder', (s * (HX + 0.2) * u, -0.6 * u, -3.6 * u), self.pivot)
            V.capsule('arm', 3.0 * u, 0.72 * u, (s * 1.5 * u, 0, 0), self.gun).parent = sh
            bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=20, v_segments=10, radius=1.0 * u)
            new_obj('elbowball', bm, self.chrome, parent=sh).location = (s * 0.1 * u, 0, 0)
            claw = empty('claw', (s * 3.1 * u, 0, 0), sh)
            bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=20, v_segments=10, radius=0.85 * u)
            new_obj('wrist', bm, self.chrome, parent=claw)
            jaws = []
            for k in (-1, 1):
                j = self.pincer(s, k); j.parent = claw; jaws.append(j)
            self.arms.append((s, sh, claw, jaws))
        # feet
        self.feet = []
        for s in (-1, 1):
            f = squircle('foot', 2.3 * u, 1.15 * u, 2.4 * u, self.gun, ex=0.45, ez=0.5, ey=0.5, parent=self.root,
                         loc=(s * 4.3 * u, 0.6 * u, -8.15 * u), seg=32, rings=16)
            self.feet.append(f)
        # dizzy stars
        self.stars = []
        star_m = mat('botstar', srgb('#ffe27a'), rough=0.2, emit=srgb('#ffd34a'), emit_str=2.0)
        for i in range(2):
            bm = bmesh.new(); pts = []
            for k in range(10):
                r = (1.0 if k % 2 == 0 else 0.45) * 1.35 * u; a = k / 10 * math.tau + math.pi / 2
                pts.append(bm.verts.new((math.cos(a) * r, 0, math.sin(a) * r)))
            bm.faces.new(pts); bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=0.4 * u)
            st = new_obj('star', bm, star_m, smooth=False, parent=self.root); self.stars.append(st)
        self.stars[0].location = (-7.4 * u, -4 * u, 9.4 * u); self.stars[0].rotation_euler = (0, 0.3, 0)
        self.stars[1].location = (8.6 * u, -4 * u, 8.8 * u); self.stars[1].rotation_euler = (0, -0.4, 0)
        # all expression face shapes
        for name, e in BOT_EXPR.items():
            self.groups[name] = self.face(name, e)

    def pincer(self, s, k):
        """One jaw of the claw: a thick hooked arc."""
        u = U
        pts = []
        for i in range(11):
            t = i / 10
            pts.append((s * (0.3 + 1.6 * t) * u, 0, k * (0.25 + 0.8 * math.sin(math.pi * 0.9 * t ** 0.85)) * u))
        objs = round_cap_tube('jaw', [(p[0], p[1], p[2]) for p in pts], 0.55 * u, self.gun)
        j = empty('jawpiv', (0, 0, 0)); j['k'] = k
        for o in objs: o.parent = j
        return j

    def cracked_glass(self):
        """Visor shell with a white crack star (hurt)."""
        Wu, Hu = 2 * VHX, 2 * VHZ; k = 40
        im = Image.new('L', (int(Wu * k), int(Hu * k)), 0); d = ImageDraw.Draw(im)
        rng = random.Random('visorcrack'); ox, oy = (VHX - 7.3) * k, (VHZ - 2.9) * k
        for i in range(5):
            a = -0.15 + i * 0.42 + rng.uniform(-0.12, 0.12); x, y = ox, oy; L = rng.uniform(2.5, 4.8)
            pts = [(x, y)]
            for j in range(6):
                a += rng.gauss(0, 0.35); x += math.cos(a) * L / 6 * k; y += math.sin(a) * L / 6 * k; pts.append((x, y))
            d.line(pts, fill=255, width=int(0.26 * k))
        for r in (1.0,):
            pts = []
            for j in range(7):
                a = -0.3 + j * 0.3; rr = r * k * rng.uniform(0.85, 1.15); pts.append((ox + math.cos(a) * rr, oy + math.sin(a) * rr))
            d.line(pts, fill=200, width=int(0.24 * k))
        im = im.filter(ImageFilter.GaussianBlur(1.2))
        path = os.path.join(TMP, 'visor_crack.png'); im.save(path)
        m = bpy.data.materials.new('crackglass'); nt = m.node_tree; nt.nodes.remove(nt.nodes['Principled BSDF'])
        tc = node(nt, 'ShaderNodeTexCoord'); mp = node(nt, 'ShaderNodeMapping')
        mp.inputs['Scale'].default_value = (1 / (Wu * U), 1, 1 / (Hu * U)); mp.inputs['Location'].default_value = (0.5, 0, 0.5)
        nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])
        sp = node(nt, 'ShaderNodeSeparateXYZ'); cb = node(nt, 'ShaderNodeCombineXYZ'); nt.links.new(mp.outputs['Vector'], sp.inputs[0])
        nt.links.new(sp.outputs['X'], cb.inputs['X']); nt.links.new(sp.outputs['Z'], cb.inputs['Y'])
        imn = node(nt, 'ShaderNodeTexImage', extension='CLIP'); imn.image = bpy.data.images.load(path); imn.image.colorspace_settings.name = 'Non-Color'
        nt.links.new(cb.outputs['Vector'], imn.inputs['Vector'])
        lw = node(nt, 'ShaderNodeLayerWeight'); lw.inputs['Blend'].default_value = 0.25
        tr = node(nt, 'ShaderNodeBsdfTransparent'); gl = node(nt, 'ShaderNodeBsdfGlossy'); gl.inputs['Roughness'].default_value = 0.02
        crack = principled_bsdf(nt, (0.85, 0.92, 1.0), 0.3, emit=(0.6, 0.85, 1.0), emit_str=0.6)
        g = mixs(nt, mth(nt, 'ADD', lw.outputs['Fresnel'], 0.03, clamp=True), tr.outputs[0], gl.outputs[0])
        g = mixs(nt, imn.outputs['Color'], g, crack)
        nt.links.new(g, nt.nodes['Material Output'].inputs['Surface'])
        return m

    def face(self, name, e):
        u = U; objs = []
        col = srgb(LED[e['led']])
        if e['led'] not in self.led_mats:
            self.led_mats[e['led']] = emission('led_' + e['led'], col, LED_STR.get(e['led'], 3.2))
            self.ball_mats[e['led']] = mat('ball_' + e['led'], col, rough=0.15, coat=1.0, emit=col, emit_str=1.6)
        lm = self.led_mats[e['led']]
        y = self.vfront + 0.004
        shapes = eye_shapes(e['eye'], -1, e.get('look', 0)) + eye_shapes(e['eye'], 1, e.get('look', 0))
        my = self.mfront + 0.004
        mshapes = mouth_shapes(e['mouth'])
        for sh, yy in [(s, y) for s in shapes] + [(s, my) for s in mshapes]:
            if sh[0] == 'fill':
                o = fill_shape('led', [[(x * u, z * u) for x, z in sh[1]]], lm, depth=0.004, parent=self.pivot)
                o.rotation_euler = (math.radians(90), 0, 0); o.location = (0, yy, 0); objs.append(o)
            elif sh[0] == 'ring':
                cx, cz, r, w = sh[1]
                o = fill_shape('ledring', [[(x * u, z * u) for x, z in ellipse(cx, cz, r + w / 2, r + w / 2, 64)],
                                           [(x * u, z * u) for x, z in ellipse(cx, cz, r - w / 2, r - w / 2, 64)]], lm, depth=0.004, parent=self.pivot)
                o.rotation_euler = (math.radians(90), 0, 0); o.location = (0, yy, 0); objs.append(o)
            else:
                pts = [(x * u, 0, z * u) for x, z in sh[1]]
                for o in round_cap_tube('ledstroke', pts, sh[2] * u, lm, self.pivot):
                    o.location.y = yy; o.scale.y = 0.15
                    objs.append(o)
        return objs

    def visor_mat(self, led, k=1.0):
        key = (led, k)
        if key in self.visor_mats: return self.visor_mats[key]
        c = srgb(LED[led])
        m = mat('visor_' + led, srgb('#070a18'), rough=0.12, coat=1.0, coat_rough=0.02); nt = m.node_tree; b = nt.nodes['Principled BSDF']
        tc = node(nt, 'ShaderNodeTexCoord'); sp = node(nt, 'ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['Object'], sp.inputs[0])
        q = mth(nt, 'ADD', mth(nt, 'POWER', mth(nt, 'DIVIDE', sp.outputs['X'], VHX * U), 2.0),
                mth(nt, 'POWER', mth(nt, 'DIVIDE', sp.outputs['Z'], VHZ * U), 2.0))
        glow = maprange(nt, q, 0.0, 1.1, 1.0, 0.0)
        b.inputs['Emission Color'].default_value = (*c, 1)
        feed(nt, b.inputs['Emission Strength'], mth(nt, 'MULTIPLY', mth(nt, 'POWER', glow, 1.5), 0.16 * k))
        self.visor_mats[key] = m
        return m

    def set_antenna(self, ctrl, tip, led_m, droop=False):
        u = U
        for o in (self.ant, self.ant_ball):
            if o: bpy.data.objects.remove(o)
        b0 = self.ant_base
        pts = []
        for i in range(17):
            t = i / 16
            x = (1 - t) ** 2 * b0[0] + 2 * (1 - t) * t * ctrl[0] + t * t * tip[0]
            z = (1 - t) ** 2 * b0[1] + 2 * (1 - t) * t * ctrl[1] + t * t * tip[1]
            pts.append((x * u, 0, (z) * u))
        self.ant = tube('antenna', pts, 0.32 * u, self.silver, self.pivot)
        bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=24, v_segments=12, radius=1.25 * u)
        self.ant_ball = new_obj('antball', bm, led_m, parent=self.pivot); self.ant_ball.location = (tip[0] * u, 0, tip[1] * u)

    def pose(self, name, body_hex):
        e = BOT_EXPR[name]; u = U
        # body colour
        V_set_glaze(self.body_mat, body_hex)
        for k, objs in self.groups.items():
            for o in objs: o.hide_render = k != name
        self.helmet.hide_render = bool(e.get('dent')); self.helmet_dent.hide_render = not e.get('dent')
        self.shell.hide_render = bool(e.get('crack')); self.shell_cracked.hide_render = not e.get('crack')
        vm = self.visor_mat(e['led'], 1.4 if e['led'] in ('red',) else 1.0)
        for o in (self.visor, self.mouth):
            o.data.materials.clear(); o.data.materials.append(vm)
        for t in self.teeth: t.hide_render = e['mouth'] != 'grit'
        self.set_antenna(*e['ant'], self.ball_mats[e['led']])
        self.pivot.location = (0, 0, e.get('bob', 0) * u)
        self.pivot.rotation_euler = (0, math.radians(e.get('roll', 0)), 0)
        for (s, sh, claw, jaws), ang in zip(self.arms, e['arms']):
            sh.rotation_euler = (0, -s * math.radians(ang), 0)
            op = e.get('claw_open', 0.4)
            for j in jaws:
                j.rotation_euler = (0, s * j['k'] * math.radians(-12 - 26 * op), 0)
        for f, lift in zip(self.feet, e['feet']):
            f.location.z = (-8.15 + lift) * u
        for st in self.stars: st.hide_render = not e.get('stars')
        return e


def principled_bsdf(nt, color, rough, metal=0.0, coat=0.0, emit=None, emit_str=0.0):
    return V.principled(nt, color, rough, metal, coat, emit, emit_str)


def mixs(nt, fac, a, b):
    return V.mixs(nt, fac, a, b)


def V_set_glaze(m, hexc):
    """Recolour a material made by V.glaze_mat (its mottling ramp holds the colour)."""
    base = srgb(hexc)
    for n in m.node_tree.nodes:
        if n.type == 'VALTORGB':
            e = n.color_ramp.elements
            e[0].color = (*(c * 0.9 for c in base), 1); e[1].color = (*(min(1, c * 1.07) for c in base), 1)
        if n.type == 'BSDF_PRINCIPLED':
            n.inputs['Base Color'].default_value = (*base, 1)


# =============================================================================================== bricks
TEXPPU, SS = 24, 3
BW, BH = (CW - GAP) * U, (CH - GAP) * U     # brick body in metres (2.66 x 1.66)
BDEPTH = V.DEPTH


def crack_texture(key, dmg, corner, scale=2):
    """The Vault's crack generator, re-sized for 28 x 18 cells. R = crack, G = halo, B = height."""
    Wu, Hu = BW / U, BH / U
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
        if e < 0.75:
            top = rng.random() < 0.5; x = rng.uniform(2.5, Wu - 2.5)
            walk(rng, x, 0.2 if top else Hu - 0.2, (math.pi / 2 if top else -math.pi / 2) + rng.uniform(-0.7, 0.7), length, width)
        else:
            left = rng.random() < 0.5
            walk(rng, 0.2 if left else Wu - 0.2, rng.uniform(3, Hu - 3), (0 if left else math.pi) + rng.uniform(-0.6, 0.6), length, width)

    w = scale
    r1 = random.Random(f'{key}-hairline')
    for i in range(1 + w):
        from_edge(r1, r1.uniform(6, 9 + 4 * w), r1.uniform(0.32, 0.42))
    if dmg >= 2:
        r2 = random.Random(f'{key}-shatter')
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
    path = os.path.join(TMP, f'crack_{key}_{dmg}.png')
    Image.merge('RGB', (R, halo, Hh)).save(path)
    return path


def chip(o, rng, corner, W, H, bis, depth=BDEPTH):
    """The Vault's chipped corner: three tumbled cubes boolean-cut out of the front corner."""
    cx, _, cz = at(); cut = []
    ox, oz = cx + corner[0] * W / 2, cz + corner[1] * H / 2
    for k in range(3):
        s = rng.uniform(0.6, 0.75) * (1 if k == 0 else 0.7)
        bpy.ops.mesh.primitive_cube_add(size=s, location=(ox - corner[0] * rng.uniform(0.0, 0.22) * k,
                                                          -depth + rng.uniform(-0.05, 0.08),
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


def build_candy(ci, dmg):
    hexc = ROW_COLORS[ci]
    rng = random.Random(f'c{ci}-chip')
    corner = (rng.choice((-1, 1)), rng.choice((-1, 1)))
    crack = crack_texture(f'c{ci}', dmg, corner) if dmg else None
    m = V.glaze_mat(f'glaze_c{ci}{dmg}', hexc, ci * 7 + 3, crack, (BW, BH), gloss=True)
    o = box(f'brick_c_{ci}_{dmg}', BW, BH, BDEPTH, 0.3, m, at(y=-BDEPTH / 2), segs=8, local=True)
    if dmg >= 2:
        chip(o, rng, corner, BW, BH, V.biscuit_mat(f'biscuit_c{ci}', hexc))
    return [o, V.gloss_card(f'card_c{ci}{dmg}', BW, BH, -BDEPTH)]


def armor_texture(dmg):
    """R = crack, G = bright scratches, B = dent height (white = pushed in)."""
    Wu, Hu = BW / U, BH / U; k = 24
    Wp, Hp = round(Wu * k), round(Hu * k)
    rng = random.Random(f'armor{dmg}')
    crack = Image.open(crack_texture('armor', 1 if dmg == 1 else 2, (1, -1), scale=0 if dmg == 1 else 1)).convert('RGB').split()[0]
    crack = crack.resize((Wp, Hp), Image.LANCZOS)
    if dmg == 1: crack = crack.point(lambda v: v * 0.8)
    scr = Image.new('L', (Wp, Hp), 0); d = ImageDraw.Draw(scr)
    for i in range(4 if dmg == 1 else 8):
        x, y = rng.uniform(3, Wu - 3), rng.uniform(3, Hu - 3); a = rng.uniform(-0.6, 0.6) + (0 if rng.random() < 0.6 else 1.2)
        L = rng.uniform(3, 7)
        d.line([(x * k, y * k), ((x + math.cos(a) * L) * k, (y + math.sin(a) * L) * k)], fill=rng.randint(150, 255), width=max(1, int(0.18 * k)))
    scr = scr.filter(ImageFilter.GaussianBlur(0.6))
    yy, xx = [list(range(Hp)), list(range(Wp))]
    import numpy as np
    Y, X = np.mgrid[0:Hp, 0:Wp].astype(np.float32) / k
    dent = np.zeros((Hp, Wp), np.float32)
    spots = [(8.0, 6.0, 2.6, 0.9), (19.5, 11.5, 2.2, 0.7)] if dmg == 1 else \
            [(7.5, 6.0, 3.2, 1.0), (19.0, 11.0, 2.8, 1.0), (14.0, 4.0, 2.0, 0.8), (22.5, 4.5, 1.8, 0.7)]
    for (dx, dy, r, a) in spots:
        dent += a * np.exp(-((X - dx) ** 2 + (Y - dy) ** 2) / (2 * r * r))
    B = Image.fromarray(np.clip(dent * 255, 0, 255).astype(np.uint8), 'L')
    path = os.path.join(TMP, f'armor_{dmg}.png')
    Image.merge('RGB', (crack, scr, B)).save(path)
    return path


def armor_mat(name, tex=None):
    m = mat(name, srgb(ARMOR), rough=0.34, metal=0.28, coat=0.6, coat_rough=0.06); nt = m.node_tree; b = nt.nodes['Principled BSDF']
    tc = node(nt, 'ShaderNodeTexCoord')
    # brushed grain + faint mottling
    mp = node(nt, 'ShaderNodeMapping'); mp.inputs['Scale'].default_value = (1, 30, 30); nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])
    nz = node(nt, 'ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 4.0; nz.inputs['Detail'].default_value = 6
    nt.links.new(mp.outputs['Vector'], nz.inputs['Vector'])
    nz2 = node(nt, 'ShaderNodeTexNoise'); nz2.inputs['Scale'].default_value = 1.2; nz2.inputs['Detail'].default_value = 3
    nt.links.new(tc.outputs['Object'], nz2.inputs['Vector'])
    base = srgb(ARMOR)
    col = mixc(nt, maprange(nt, nz2.outputs['Fac'], 0.35, 0.65), tuple(c * 0.82 for c in base), tuple(min(1, c * 1.06) for c in base))
    rough = maprange(nt, nz.outputs['Fac'], 0.3, 0.7, 0.26, 0.4)
    height = None
    if tex:
        mp2 = node(nt, 'ShaderNodeMapping', vector_type='POINT')
        mp2.inputs['Scale'].default_value = (1 / BW, 1, 1 / BH); mp2.inputs['Location'].default_value = (0.5, 0, 0.5)
        nt.links.new(tc.outputs['Object'], mp2.inputs['Vector'])
        sep = node(nt, 'ShaderNodeSeparateXYZ'); cmb = node(nt, 'ShaderNodeCombineXYZ')
        nt.links.new(mp2.outputs['Vector'], sep.inputs['Vector'])
        nt.links.new(sep.outputs['X'], cmb.inputs['X']); nt.links.new(sep.outputs['Z'], cmb.inputs['Y'])
        im = node(nt, 'ShaderNodeTexImage', extension='EXTEND', interpolation='Cubic')
        im.image = bpy.data.images.load(tex); im.image.colorspace_settings.name = 'Non-Color'
        nt.links.new(cmb.outputs['Vector'], im.inputs['Vector'])
        sc_ = node(nt, 'ShaderNodeSeparateColor'); nt.links.new(im.outputs['Color'], sc_.inputs['Color'])
        cr, scr, dent = sc_.outputs[0], sc_.outputs[1], sc_.outputs[2]
        col = mixc(nt, mth(nt, 'MULTIPLY', scr, 0.7), col, (0.9, 0.92, 1.0))
        col = mixc(nt, mth(nt, 'MULTIPLY', dent, 0.35), col, tuple(c * 0.55 for c in base))
        col = mixc(nt, cr, col, (0.01, 0.01, 0.015))
        rough = mixc(nt, cr, rough, (0.8, 0.8, 0.8))
        feed(nt, b.inputs['Coat Weight'], mth(nt, 'SUBTRACT', 0.55, cr, clamp=True))
        height = mth(nt, 'ADD', mth(nt, 'MULTIPLY', dent, -1.0), mth(nt, 'MULTIPLY', cr, -0.6))
    nt.links.new(col, b.inputs['Base Color'])
    feed(nt, b.inputs['Roughness'], rough if not isinstance(rough, bpy.types.NodeSocket) or rough.type == 'VALUE' else
         node_val(nt, rough))
    if height is not None:
        bp = node(nt, 'ShaderNodeBump'); bp.inputs['Strength'].default_value = 1.0; bp.inputs['Distance'].default_value = 0.22
        nt.links.new(height, bp.inputs['Height'])
        nt.links.new(bp.outputs['Normal'], b.inputs['Normal']); nt.links.new(bp.outputs['Normal'], b.inputs['Coat Normal'])
    return m


def node_val(nt, rgba):
    sc_ = node(nt, 'ShaderNodeSeparateColor'); nt.links.new(rgba, sc_.inputs['Color']); return sc_.outputs[0]


def build_armor(dmg):
    tex = armor_texture(dmg) if dmg else None
    M = armor_mat(f'armor{dmg}', tex)
    o = box(f'armor_{dmg}', BW, BH, BDEPTH + 0.1, 0.16, M, at(y=-(BDEPTH + 0.1) / 2), segs=5, local=True)
    objs = [o]
    rng = random.Random(f'armor-chip{dmg}')
    if dmg >= 2:
        chip(o, rng, (1, -1), BW, BH, mat('armorcore', srgb('#666e8c'), rough=0.55, metal=0.5), depth=BDEPTH + 0.1)
    # raised centre ridge plate
    ridge = box('ridge', BW - 0.75, BH - 0.72, 0.16, 0.06, M, at(y=-(BDEPTH + 0.1) - 0.04), segs=3, local=True)
    objs.append(ridge)
    rv = mat('armorrivet', srgb('#c9d0e4'), rough=0.22, metal=1.0, coat=0.4)
    hole = mat('armorhole', srgb('#0b0c12'), rough=0.8)
    spots = [(-1, -1), (-1, 1), (1, -1), (1, 1), (0, 1), (0, -1)]
    for i, (sx, sz) in enumerate(spots):
        x = sx * (BW / 2 - 0.2); z = sz * (BH / 2 - 0.2)
        if dmg >= 2 and (sx, sz) == (1, -1): continue          # under the chip
        if dmg >= 2 and (sx, sz) == (-1, 1):                    # popped rivet: an empty hole
            objs.append(cyl(0.085, 0.05, at(x, z, -(BDEPTH + 0.1) - 0.005), hole, rot=(math.radians(90), 0, 0), verts=16)); continue
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.1, segments=20, ring_count=10, location=at(x, z, -(BDEPTH + 0.1)))
        r = bpy.context.object; r.scale = (1, 0.6, 1); bpy.ops.object.shade_smooth(); r.data.materials.append(rv); objs.append(r)
    objs.append(V.gloss_card(f'card_a{dmg}', BW, BH, -(BDEPTH + 0.1), strength=6.0, sheen=0.07))
    return objs


def build_power():
    gold = mat('powergold', srgb(POWER), rough=0.26, metal=0.4, coat=1.0, coat_rough=0.03)
    o = box('power', BW, BH, BDEPTH, 0.14, gold, at(y=-BDEPTH / 2), segs=6, local=True)
    inner = box('powerinner', BW - 0.5, BH - 0.45, 0.14, 0.05, mat('powergold2', srgb('#e8ae2c'), rough=0.3, metal=0.6, coat=1.0, coat_rough=0.03),
                at(y=-BDEPTH - 0.02), segs=3, local=True)
    objs = [o, inner]
    # faceted gem: table + crown facets toward the camera, pavilion behind
    gem = mat('gem', srgb('#00b4f0'), rough=0.0, coat=1.0, emit=srgb('#00a8ff'), emit_str=0.5)
    b = gem.node_tree.nodes['Principled BSDF']; b.inputs['Transmission Weight'].default_value = 0.25; b.inputs['IOR'].default_value = 2.0
    r = 0.52
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=8, radius1=r, radius2=r * 0.58, depth=0.2)       # crown (top = table)
    for v in bm.verts: v.co.z += 0.1
    bm2 = bmesh.new(); bmesh.ops.create_cone(bm2, cap_ends=True, segments=8, radius1=0.02, radius2=r, depth=0.3)   # pavilion
    me2 = bpy.data.meshes.new('pav'); bm2.to_mesh(me2); bm2.free()
    for v in me2.vertices: v.co.z -= 0.15
    bm.from_mesh(me2)
    g = new_obj('gem', bm, gem, smooth=False)
    g.rotation_euler = (math.radians(-90), 0, math.radians(22.5)); g.location = at(y=-BDEPTH - 0.2); g.scale = (1.0, 1.0, 1.0)
    objs.append(g)
    bpy.ops.mesh.primitive_torus_add(major_radius=r + 0.04, minor_radius=0.06, location=at(y=-BDEPTH - 0.1), rotation=(math.radians(90), 0, 0),
                                     major_segments=48)
    t = bpy.context.object; bpy.ops.object.shade_smooth(); t.data.materials.append(gold); objs.append(t)
    # four tiny prongs
    for a in range(4):
        ang = math.pi / 4 + a * math.pi / 2
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.07, segments=12, ring_count=6, location=at(math.cos(ang) * (r + 0.02), math.sin(ang) * (r + 0.02), -BDEPTH - 0.24))
        pp = bpy.context.object; bpy.ops.object.shade_smooth(); pp.data.materials.append(gold); objs.append(pp)
    objs.append(V.gloss_card('card_p', BW, BH, -BDEPTH, strength=4.0, sheen=0.05))
    return objs


# =============================================================================================== bolt & bomb
def plasma_mat(name, strength=10):
    """Magenta plasma: white-pink core, magenta rim fading out."""
    m = bpy.data.materials.new(name); nt = m.node_tree; nt.nodes.remove(nt.nodes['Principled BSDF'])
    lw = node(nt, 'ShaderNodeLayerWeight'); lw.inputs['Blend'].default_value = 0.5
    edge = lw.outputs['Facing']
    col = mixc(nt, maprange(nt, edge, 0.05, 0.5), (1.0, 0.7, 0.95), srgb('#ff22c8'))
    em = node(nt, 'ShaderNodeEmission'); nt.links.new(col, em.inputs['Color'])
    feed(nt, em.inputs['Strength'], maprange(nt, edge, 0.2, 1.0, strength, strength * 0.4))
    tr = node(nt, 'ShaderNodeBsdfTransparent'); ms = node(nt, 'ShaderNodeMixShader')
    nt.links.new(maprange(nt, edge, 0.6, 1.0), ms.inputs[0]); nt.links.new(em.outputs[0], ms.inputs[1]); nt.links.new(tr.outputs[0], ms.inputs[2])
    nt.links.new(ms.outputs[0], nt.nodes['Material Output'].inputs['Surface'])
    return m


def build_bolt():
    m = plasma_mat('plasma', 3.2)
    o = V.flame('bolt', at(0, -0.12, -BDEPTH - 0.5), 0.36, m)    # teardrop: round head at the bottom, tail up
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.15, segments=24, ring_count=12, location=at(0, -0.1, -BDEPTH - 0.9))
    c = bpy.context.object; c.scale = (1, 1, 1.8); bpy.ops.object.shade_smooth(); c.data.materials.append(emission('boltcore', (1, 0.7, 0.95), 5))
    return [o, c]


def build_bomb():
    u = U; objs = []
    shell = mat('bombshell', srgb('#7a5cc0'), rough=0.22, metal=0.3, coat=1.0, coat_rough=0.02)
    band = mat('bombband', srgb('#ff5d8f'), rough=0.25, coat=1.0, sss=0.1)
    c0 = at(0, -1.0 * u, -BDEPTH - 0.6)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=5.6 * u, segments=64, ring_count=32, location=c0)
    b = bpy.context.object; bpy.ops.object.shade_smooth(); b.data.materials.append(shell); objs.append(b)
    bpy.ops.mesh.primitive_torus_add(major_radius=5.6 * u, minor_radius=0.75 * u, location=c0, rotation=(math.radians(12), 0, 0), major_segments=64, minor_segments=16)
    t = bpy.context.object; bpy.ops.object.shade_smooth(); t.data.materials.append(band); objs.append(t)
    # tail fins (up: it falls down)
    fin = mat('bombfin', srgb('#8d97b3'), rough=0.3, metal=0.8, coat=0.5)
    for a in (-1, 1):
        o = box('fin', 2.6 * u, 3.8 * u, 0.6 * u, 0.2 * u, fin, (c0[0] + a * 2.3 * u, c0[1], c0[2] + 5.6 * u), segs=3, local=True)
        o.rotation_euler = (0, math.radians(a * 32), 0); objs.append(o)
    objs.append(cyl(1.6 * u, 1.4 * u, (c0[0], c0[1], c0[2] + 5.3 * u), fin, verts=32))
    # glowing fuse light on the nose side
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.25 * u, segments=24, ring_count=12, location=(c0[0] - 1.6 * u, c0[1] - 5.0 * u, c0[2] - 1.4 * u))
    l = bpy.context.object; bpy.ops.object.shade_smooth(); l.data.materials.append(mat('bomblight', srgb('#ff4fb0'), rough=0.1, coat=1, emit=srgb('#ff3fa0'), emit_str=6)); objs.append(l)
    return objs


# =============================================================================================== mothership
SHIP_SIZE = (108, 64)          # sprite, game units (ship ~90 x 34, plus lights and the under-glow)
SHIP_TILT = -4                 # degrees the saucer is tipped toward the camera so the top and the dome read
SHIP_DZ = -5.0                 # model offset so the hull's visual middle sits on the sprite centre
RH = 6.8                       # pilot head radius (units)
HEAD_Z = 17.0
DOME_R, DOME_Z = 14.6, 9.4
BULB_COLORS = ['#3fe8ff', '#ff5d8f', '#b6ff5a', '#c46bf0']
N_BULBS = 14


def alien_eye_mat(name):
    """Snake-style painted eyeball: hot pink iris, big round pupil, spiral option (value nodes 'pw', 'spiral')."""
    m = mat(name, srgb('#fffaf2'), rough=0.06, coat=1.0); nt = m.node_tree; b = nt.nodes['Principled BSDF']; N = nt.nodes; L = nt.links.new
    def M(op, a, bb=None):
        n = N.new('ShaderNodeMath'); n.operation = op
        for i, v in enumerate((a, bb)):
            if v is None: continue
            if isinstance(v, (int, float)): n.inputs[i].default_value = v
            else: L(v, n.inputs[i])
        return n.outputs[0]
    def Vn(nm, v):
        n = N.new('ShaderNodeValue'); n.name = nm; n.outputs[0].default_value = v; return n.outputs[0]
    tc = N.new('ShaderNodeTexCoord'); sp = N.new('ShaderNodeSeparateXYZ'); L(tc.outputs['Object'], sp.inputs[0])
    x, y, z = sp.outputs['X'], sp.outputs['Y'], sp.outputs['Z']
    r = M('SQRT', M('ADD', M('MULTIPLY', x, x), M('MULTIPLY', y, y)))
    front = M('GREATER_THAN', z, 0.0)
    pw, spf, ir = Vn('pw', 0.36), Vn('spiral', 0.0), Vn('ir', 0.62)
    iris = M('MULTIPLY', M('LESS_THAN', r, ir), front)
    pupil = M('MULTIPLY', M('LESS_THAN', r, pw), iris)
    ramp = N.new('ShaderNodeValToRGB'); e = ramp.color_ramp.elements
    e[0].position, e[0].color = 0.0, (*srgb('#ffb3e0'), 1); e[1].position, e[1].color = 0.7, (*srgb('#e8308f'), 1)
    ring = e.new(0.92); ring.color = (*srgb('#5a0b4a'), 1)
    L(M('DIVIDE', r, ir), ramp.inputs['Fac'])
    ang = M('DIVIDE', M('ARCTAN2', y, x), 6.2832)
    spiral = M('MULTIPLY', M('LESS_THAN', M('FRACT', M('ADD', ang, M('MULTIPLY', r, 2.4))), 0.45), M('MULTIPLY', front, M('LESS_THAN', r, 0.86)))
    def mix(fac, a, bb):
        n = N.new('ShaderNodeMix'); n.data_type = 'RGBA'; L(fac, n.inputs[0])
        for sk, v in ((n.inputs[6], a), (n.inputs[7], bb)):
            if isinstance(v, tuple): sk.default_value = v
            else: L(v, sk)
        return n.outputs[2]
    no_sp = M('SUBTRACT', 1.0, spf)
    c1 = mix(M('MULTIPLY', iris, no_sp), (*srgb('#fffaf2'), 1), ramp.outputs['Color'])
    c2 = mix(M('MULTIPLY', pupil, no_sp), c1, (0.006, 0.003, 0.012, 1))
    c3 = mix(M('MULTIPLY', spiral, spf), c2, (*srgb('#3a0f6a'), 1))
    L(c3, b.inputs['Base Color'])
    em = mix(M('MULTIPLY', M('SUBTRACT', iris, pupil), no_sp), (0, 0, 0, 1), ramp.outputs['Color'])
    L(em, b.inputs['Emission Color']); b.inputs['Emission Strength'].default_value = 0.3
    return m


class AlienEye:
    def __init__(self, side, parent, skin, lidline, eye_m, shine_m, brow_m):
        u = U; R = 3.0; self.R = R; self.side = side
        piv = empty('aeye', (side * 3.0 * u, -(RH - 1.5) * u, 1.6 * u), parent)
        out = Vector((side * 0.32, -1.0, 0.12)).normalized(); up = Vector((0, 0, 1)); up = (up - out * up.dot(out)).normalized()
        xa = up.cross(out); piv.rotation_euler = Matrix((xa, up, out)).transposed().to_euler()
        self.piv = piv
        bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=48, v_segments=24, radius=1.0)   # unit sphere: shader coords in radii
        self.ball = new_obj('aball', bm, eye_m, parent=piv); self.ball.scale = (R * u,) * 3
        self.shines = []
        for (sx, sy, sr) in ((-0.34, 0.38, 0.2), (0.3, -0.3, 0.08)):
            bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=12, v_segments=6, radius=1)
            o = new_obj('ashine', bm, shine_m, parent=piv); o.location = (sx * R * u, sy * R * u, 0.98 * R * u); o.scale = (sr * R * u, sr * R * u, 0.05 * R * u)
            self.shines.append(o)
        self.lids = []
        for s in (1, -1):
            bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=48, v_segments=24, radius=R * 1.08 * u)
            bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.y * s < -1e-5], context='VERTS')
            lid = new_obj('alid', bm, skin, parent=piv); lid.data.materials.append(lidline)
            so = lid.modifiers.new('so', 'SOLIDIFY'); so.thickness = 0.14 * R * u; so.material_offset_rim = 1; so.use_rim = True
            lid['s'] = s; self.lids.append(lid)
        # brow: short thick arc
        pts = [((-1.7 + 3.4 * i / 10) * u, 0, (0.5 * math.sin(math.pi * i / 10)) * u) for i in range(11)]
        self.brow = tube('abrow', pts, 0.45 * u, brow_m, parent)
        self.brow_base = Vector((side * 3.2 * u, -(RH - 1.2) * u, (1.6 + R + 0.45) * u))

    def set(self, top=0.0, bot=0.0, look=(0, 0), pupil=1.0, brow=0.0, raise_=0.0, spiral=False):
        for lid in self.lids:
            s = lid['s']; amt = top if s > 0 else bot
            h = max(-1.0, min(1.0, 1 - amt))
            lid.rotation_euler = (-s * (math.asin(h) + math.radians(18) * h), 0, 0)
        lx, ly = look
        self.ball.rotation_euler = (math.radians(-ly * 28), math.radians(lx * 28), 0)
        nt = self.ball.data.materials[0].node_tree.nodes
        nt['pw'].outputs[0].default_value = 0.36 * pupil
        nt['spiral'].outputs[0].default_value = 1.0 if spiral else 0.0
        for o in self.shines: o.hide_render = top + bot > 1.4
        # brow: positive = inner end down (anger); negative = inner end up (worry)
        self.brow.location = self.brow_base + Vector((0, 0, raise_ * 1.2 * U))
        self.brow.rotation_euler = (0, math.radians(-self.side * brow), 0)


SHIP_EXPR = {
    'smug':  dict(eye=dict(top=0.8, bot=0.22, look=(0.15, -0.3), brow=4, raise_=-0.35), eye_r=dict(top=0.6, bot=0.2, look=(0.15, -0.3), brow=-16, raise_=0.35),
                  mouth='smirk', ant=(-14, 14)),
    'angry': dict(eye=dict(top=0.62, bot=0.32, look=(0, -0.3), pupil=0.85, brow=38, raise_=-0.75), mouth='grit', ant=(-34, 34), fire=True),
    'hurt':  dict(eye=dict(top=1.08, bot=1.0, brow=-26, raise_=0.2), mouth='wince', ant=(-50, 22), flash=True),
    'panic': dict(eye=dict(top=0.0, bot=0.0, pupil=0.55, brow=-30, raise_=0.9, look=(0.15, 0.1)), mouth='o', ant=(-8, 8), sweat=True, crack=True, smoke=True),
    'dizzy': dict(eye=dict(top=0.18, bot=0.08, brow=-14, raise_=0.4, spiral=True), mouth='tongue', ant=(-62, 70), stars=True, crack=True,
                  smoke=True, dead=True, roll=-11),
}


def lathe(name, prof, m, segs=96, parent=None):
    """Surface of revolution about z from a (r, z) profile in game units."""
    bm = bmesh.new()
    rings = []
    for (r, z) in prof:
        ring = [bm.verts.new((r * U * math.cos(a), r * U * math.sin(a), z * U)) for a in [i / segs * math.tau for i in range(segs)]]
        rings.append(ring)
    for r0, r1 in zip(rings, rings[1:]):
        for i in range(segs):
            j = (i + 1) % segs
            try: bm.faces.new((r0[i], r0[j], r1[j], r1[i]))
            except ValueError: pass
    bmesh.ops.remove_doubles(bm, verts=bm.verts[:], dist=1e-6)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    o = new_obj(name, bm, m, parent=parent)
    return o


def hull_mat(name, hexc, rough=0.22, metal=0.0, coat=1.0, grooves=12, ring_r=None):
    """Glossy hull with radial panel grooves (and optionally one concentric groove)."""
    m = mat(name, srgb(hexc), rough=rough, metal=metal, coat=coat, coat_rough=0.03); nt = m.node_tree; b = nt.nodes['Principled BSDF']
    tc = node(nt, 'ShaderNodeTexCoord'); sp = node(nt, 'ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['Object'], sp.inputs[0])
    ang = mth(nt, 'ARCTAN2', sp.outputs['Y'], sp.outputs['X'])
    f = mth(nt, 'ABSOLUTE', mth(nt, 'SUBTRACT', mth(nt, 'FRACT', mth(nt, 'MULTIPLY', ang, grooves / math.tau)), 0.5))
    rr = mth(nt, 'SQRT', mth(nt, 'ADD', mth(nt, 'MULTIPLY', sp.outputs['X'], sp.outputs['X']), mth(nt, 'MULTIPLY', sp.outputs['Y'], sp.outputs['Y'])))
    # groove width constant in metres: angular half-width = w / r
    g = maprange(nt, mth(nt, 'MULTIPLY', mth(nt, 'MULTIPLY', mth(nt, 'SUBTRACT', 0.5, f), math.tau / grooves), rr), 0.012, 0.03, 1, 0)
    if ring_r:
        g = mth(nt, 'MAXIMUM', g, maprange(nt, mth(nt, 'ABSOLUTE', mth(nt, 'SUBTRACT', rr, ring_r * U)), 0.012, 0.03, 1, 0))
    base = srgb(hexc)
    nt.links.new(mixc(nt, mth(nt, 'MULTIPLY', g, 0.7), base, tuple(c * 0.35 for c in base)), b.inputs['Base Color'])
    bp = node(nt, 'ShaderNodeBump'); bp.inputs['Strength'].default_value = 0.5; bp.inputs['Distance'].default_value = 0.02
    nt.links.new(mth(nt, 'MULTIPLY', g, -1.0), bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    return m


def dome_glass(name, crack=False):
    m = principled_mix_glass(name, tint=(0.82, 0.95, 1.0), refl=0.8, base=0.04, rough=0.09)
    if not crack: return m
    k = 60; Wd = 26
    im = Image.new('L', (Wd * k // 4 * 2, Wd * k // 4 * 2), 0); d = ImageDraw.Draw(im)
    rng = random.Random('domecrack'); ox, oy = im.size[0] * 0.86, im.size[1] * 0.42
    for i in range(5):
        a = rng.uniform(0, math.tau); x, y = ox, oy; L = rng.uniform(2.5, 5.0) * k / 4
        pts = [(x, y)]
        for j in range(7):
            a += rng.gauss(0, 0.3); x += math.cos(a) * L / 7; y += math.sin(a) * L / 7; pts.append((x, y))
        d.line(pts, fill=255, width=3)
    pts = [(ox + math.cos(a) * 18 * rng.uniform(0.8, 1.2), oy + math.sin(a) * 18 * rng.uniform(0.8, 1.2)) for a in [j * 0.5 for j in range(14)]]
    d.line(pts, fill=230, width=3)
    im = im.filter(ImageFilter.GaussianBlur(1.0)); path = os.path.join(TMP, 'dome_crack.png'); im.save(path)
    nt = m.node_tree; out = nt.nodes['Material Output']; prev = out.inputs['Surface'].links[0].from_socket
    tc = node(nt, 'ShaderNodeTexCoord'); mp = node(nt, 'ShaderNodeMapping')
    mp.inputs['Scale'].default_value = (1 / (Wd * U), 1, 1 / (Wd * U)); mp.inputs['Location'].default_value = (0.5, 0, 0.5)
    nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])
    sp = node(nt, 'ShaderNodeSeparateXYZ'); cb = node(nt, 'ShaderNodeCombineXYZ'); nt.links.new(mp.outputs['Vector'], sp.inputs[0])
    nt.links.new(sp.outputs['X'], cb.inputs['X']); nt.links.new(sp.outputs['Z'], cb.inputs['Y'])
    imn = node(nt, 'ShaderNodeTexImage', extension='CLIP'); imn.image = bpy.data.images.load(path); imn.image.colorspace_settings.name = 'Non-Color'
    nt.links.new(cb.outputs['Vector'], imn.inputs['Vector'])
    # only on the front half of the dome
    front = maprange(nt, sp.outputs['Y'], 0.5, 0.45, 0, 1, smooth=False)
    cr = principled_bsdf(nt, (0.9, 0.95, 1.0), 0.25, emit=(0.7, 0.85, 1.0), emit_str=0.4)
    nt.links.new(mixs(nt, mth(nt, 'MULTIPLY', imn.outputs['Color'], front), prev, cr), out.inputs['Surface'])
    return m


class Mothership:
    def __init__(self):
        u = U
        self.root = empty('ship_root', at(0, SHIP_DZ * u, -2.0))
        self.root.rotation_euler = (math.radians(SHIP_TILT), 0, 0)
        R = self.root
        upper = hull_mat('upperhull', '#e4e6f6', rough=0.2, grooves=12, ring_r=30)
        lower = hull_mat('lowerhull', '#6b70a8', rough=0.26, metal=0.35, grooves=16, ring_r=24)
        band = mat('rimband', srgb('#ff5d8f'), rough=0.24, coat=1.0, coat_rough=0.02, sss=0.12)
        silver = mat('shipsilver', srgb('#b9c1db'), rough=0.2, metal=0.7, coat=0.8)
        dark = mat('shipdark', srgb('#1b1f33'), rough=0.3, metal=0.5, coat=0.6)
        lathe('lower', [(0, -10.5), (5, -10.4), (9, -9.7), (14, -8.3), (22, -6.3), (30, -4.3), (37, -2.5), (42, -0.9), (44.6, 0.4)], lower, parent=R)
        lathe('upper', [(44.6, 0.4), (43.8, 2.0), (41, 3.5), (35, 5.4), (28, 7.1), (21, 8.4), (17, 9.1), (15.2, 9.4), (0, 9.4)], upper, parent=R)
        bm = bmesh.new(); bmesh.ops.create_circle(bm, cap_ends=False, segments=96, radius=1)
        tor = bpy.ops.mesh.primitive_torus_add(major_radius=44.2 * u, minor_radius=1.7 * u, major_segments=128, minor_segments=20)
        t = bpy.context.object; bpy.ops.object.shade_smooth(); t.data.materials.append(band); t.parent = R; t.location = (0, 0, 0.55 * u)
        t.scale = (1, 1, 0.9)
        bpy.ops.mesh.primitive_torus_add(major_radius=(DOME_R + 0.4) * u, minor_radius=1.2 * u, major_segments=96, minor_segments=16)
        t = bpy.context.object; bpy.ops.object.shade_smooth(); t.data.materials.append(silver); t.parent = R; t.location = (0, 0, (DOME_Z + 0.2) * u)
        # under-glow emitter + tiny portholes on the lower hull
        self.glow_m = emission('underglow', srgb('#5ff4ff'), 6.0)
        bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=48, v_segments=16, radius=1)
        g = new_obj('emitter', bm, self.glow_m, parent=R); g.location = (0, 0, -10.3 * u); g.scale = (7.0 * u, 7.0 * u, 1.1 * u)
        lathe('emitring', [(8.6, -9.4), (8.8, -10.4), (7.6, -11.0), (7.0, -10.6)], silver, parent=R)
        self.port_m = emission('porthole', srgb('#9ff7ff'), 2.2)
        self.ports = []
        for k in range(7):
            a = math.radians(-90 + (k - 3) * 19)
            x, y = 31.0 * math.cos(a), 31.0 * math.sin(a)
            bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=20, v_segments=10, radius=1)
            o = new_obj('port', bm, self.port_m, parent=R); o.location = (x * u, y * u, -3.7 * u); o.scale = (1.5 * u, 1.5 * u, 1.3 * u)
            o.rotation_euler = (0, 0, a); self.ports.append(o)
            bpy.ops.mesh.primitive_torus_add(major_radius=1.55 * u, minor_radius=0.4 * u, major_segments=24, minor_segments=8)
            rr = bpy.context.object; bpy.ops.object.shade_smooth(); rr.data.materials.append(silver); rr.parent = R
            rr.location = (x * 1.02 * u, y * 1.02 * u, -3.75 * u); rr.rotation_euler = (math.radians(90) - math.radians(16), 0, a + math.radians(90))
        # rim bulbs
        self.bulbs = []; self.bulb_on = {}; self.bulb_dim = {}
        for i in range(N_BULBS):
            a = i / N_BULBS * math.tau + math.radians(90 + 360 / N_BULBS / 2)
            hexc = BULB_COLORS[i % len(BULB_COLORS)]
            if hexc not in self.bulb_on:
                self.bulb_on[hexc] = emission('bulbon' + hexc, srgb(hexc), 7.0)
                self.bulb_dim[hexc] = mat('bulbdim' + hexc, srgb(hexc), rough=0.1, coat=1.0, emit=srgb(hexc), emit_str=1.4)
            bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=20, v_segments=10, radius=1.65 * u)
            o = new_obj('bulb', bm, self.bulb_dim[hexc], parent=R); o.location = (45.7 * u * math.cos(a), 45.7 * u * math.sin(a), 0.55 * u)
            o['hex'] = hexc; o['i'] = i; self.bulbs.append(o)
        self.bulb_off = mat('bulboff', srgb('#3a3550'), rough=0.15, coat=1.0)
        # dome
        for nm, gm in (('dome', dome_glass('domeglass')), ('domecr', dome_glass('domeglass_cr', crack=True))):
            bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=64, v_segments=32, radius=DOME_R * u)
            bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < -1e-5], context='VERTS')
            o = new_obj(nm, bm, gm, parent=R); o.location = (0, 0, DOME_Z * u); o.scale = (1, 1, 1.2)
            setattr(self, 'dome' if nm == 'dome' else 'dome_cr', o)
        # cockpit floor seen through the glass
        cyl(DOME_R * u, 0.4 * u, (0, 0, (DOME_Z + 0.1) * u), dark, verts=64).parent = R
        self.pilot()
        # ship-only lights: a soft lavender fill from below (the underside faces the player) and a cyan console glow
        # that lights the pilot's face from under the dome rim
        bx, by, bz = at(0, (SHIP_DZ - 30) * u, -8.0)
        bpy.ops.object.light_add(type='AREA', location=(bx, by, bz), rotation=(math.radians(-150), 0, 0))
        bpy.context.object.visible_camera = False
        L = bpy.context.object.data; L.energy = 1100; L.size = 12; L.color = (0.85, 0.7, 1.0)
        bpy.ops.object.light_add(type='POINT', location=(0, -(DOME_R - 4) * u, (DOME_Z + 1.5) * u))
        pl = bpy.context.object; pl.parent = R; pl.data.energy = 18; pl.data.color = (0.5, 0.95, 1.0); pl.data.shadow_soft_size = 0.3
        # smoke puffs + stars
        self.smoke = []
        self.stars = []
        star_m = mat('shipstar', srgb('#ffe27a'), rough=0.2, emit=srgb('#ffd34a'), emit_str=2.0)
        for i in range(3):
            bm = bmesh.new(); pts = []
            for k in range(10):
                r = (1.0 if k % 2 == 0 else 0.45) * 2.0 * u; a = k / 10 * math.tau + math.pi / 2
                pts.append(bm.verts.new((math.cos(a) * r, 0, math.sin(a) * r)))
            bm.faces.new(pts); bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=0.6 * u)
            st = new_obj('star', bm, star_m, smooth=False, parent=self.head); self.stars.append(st)
            a = i / 3 * math.tau + 0.5
            st.location = (math.cos(a) * 10.5 * u, math.sin(a) * 10.5 * u, 10.2 * u); st.rotation_euler = (math.radians(-SHIP_TILT), 0, 0)

    def pilot(self):
        u = U; R = self.root
        skin = mat('alienskin', srgb('#7ee05a'), rough=0.3, coat=0.8, sss=0.15)
        nt = skin.node_tree; b = nt.nodes['Principled BSDF']   # darker crown, lighter cheeks
        tc = node(nt, 'ShaderNodeTexCoord'); sp = node(nt, 'ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['Normal'], sp.inputs[0])
        nt.links.new(mixc(nt, maprange(nt, sp.outputs['Z'], -0.4, 0.9), srgb('#a6f27a'), srgb('#4fb83a')), b.inputs['Base Color'])
        lidline = mat('alienlidline', srgb('#173a10'), rough=0.4)
        browm = mat('alienbrow', srgb('#2a6a1c'), rough=0.35, coat=0.6)
        suit = mat('aliensuit', srgb('#7b6cf6'), rough=0.3, coat=1.0)
        self.mouth_m = mat('alienmouth', srgb('#3a0820'), rough=0.5)
        self.teeth_m = mat('alienteeth', srgb('#fffaf0'), rough=0.15, coat=1.0)
        self.tongue_m = mat('alientongue', srgb('#ff5d8f'), rough=0.3, coat=0.6)
        self.line_m = mat('alienline', srgb('#173a10'), rough=0.4)
        self.head = empty('alienhead', (0, 0, HEAD_Z * u), R)
        self.head.rotation_euler = (math.radians(-SHIP_TILT + 6), 0, 0)
        H = self.head
        # torso / collar
        bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=40, v_segments=20, radius=1)
        o = new_obj('torso', bm, suit, parent=R); o.location = (0, 0, (DOME_Z + 1.2) * u); o.scale = (7.0 * u, 5.2 * u, 3.8 * u)
        bpy.ops.mesh.primitive_torus_add(major_radius=3.3 * u, minor_radius=0.9 * u, major_segments=32, minor_segments=12)
        t = bpy.context.object; bpy.ops.object.shade_smooth(); t.data.materials.append(mat('collar', srgb('#c9d0e8'), rough=0.2, metal=0.7, coat=0.6))
        t.parent = R; t.location = (0, 0, (DOME_Z + 4.0) * u)
        # head: a broad, slightly pear-shaped bulb (wider at the top)
        bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=64, v_segments=32, radius=RH * u)
        for v in bm.verts:
            zz = v.co.z / (RH * u)
            k = 1 + 0.12 * zz
            v.co.x *= k * 1.08; v.co.y *= k * 0.95
        new_obj('alienhead_mesh', bm, skin, parent=H)
        # antennae
        self.ants = []
        for s in (-1, 1):
            piv = empty('antpiv', (s * 2.6 * u, 0, (RH - 0.9) * u), H)
            pts = [(0, 0, 0), (0, 0, 1.3 * u), (s * 0.4 * u, 0, 2.4 * u)]
            tube('aant', pts, 0.32 * u, skin, piv)
            bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=20, v_segments=10, radius=0.95 * u)
            new_obj('aantball', bm, mat('antball' + str(s), srgb('#ff5d8f'), rough=0.15, coat=1.0, emit=srgb('#ff3f8a'), emit_str=0.8), parent=piv).location = (s * 0.4 * u, 0, 2.7 * u)
            self.ants.append((s, piv))
        eye_m = [alien_eye_mat('aeye_l'), alien_eye_mat('aeye_r')]
        shine = mat('ashine', (1, 1, 1), rough=0.0, emit=(1, 1, 1), emit_str=4.0)
        self.eyes = [AlienEye(s, H, skin, lidline, eye_m[i], shine, browm) for i, s in enumerate((-1, 1))]
        # mouths
        fy = lambda x, z: -math.sqrt(max(0.0, (RH * 0.95) ** 2 - x * x - z * z))
        self.mouths = {}
        def mz(n): return -3.0
        smirk = [(x, fy(x, -2.7) - 0.15, -2.7 + 0.12 * (x + 1.6) ** 2 * (0.25 if x < 0 else 0.35) - 0.4) for x in [-1.8 + 3.9 * i / 14 for i in range(15)]]
        self.mouths['smirk'] = [tube('smirk', [(x * u, y * u, z * u) for x, y, z in smirk], 0.3 * u, self.line_m, H)]
        def rbox_(name, w, h, d, m, loc, ex=0.35, ez=0.35):
            return squircle(name, w * u, h * u, d * u, m, ex=ex, ez=ez, ey=0.6, parent=H, loc=(loc[0] * u, loc[1] * u, loc[2] * u), seg=32, rings=16)
        def teeth(name, w, h, z, skew=0.0):
            objs = [rbox_(name + 'o', w + 0.35, h + 0.35, 0.6, self.mouth_m, (0, fy(0, z) + 0.15, z)),
                    rbox_(name + 't', w, h, 0.6, self.teeth_m, (0, fy(0, z) + 0.0, z))]
            yy = fy(0, z) - 0.62
            for xx in (-w * 0.5, 0, w * 0.5):
                objs.append(tube(name + 'v', [(xx * u, yy * u, (z - h) * u), (xx * u, yy * u, (z + h) * u)], 0.09 * u, self.mouth_m, H))
            objs.append(tube(name + 'h', [(-w * u, yy * u, z * u), (w * u, yy * u, z * u)], 0.09 * u, self.mouth_m, H))
            if skew:
                for o in objs: o.rotation_euler = (0, math.radians(skew), 0)
            return objs
        self.mouths['grit'] = teeth('grit', 2.4, 0.9, -3.1)
        self.mouths['wince'] = teeth('wince', 2.0, 0.6, -3.1, skew=-8)
        o = squircle('omouth', 1.3 * u, 1.7 * u, 0.7 * u, self.mouth_m, ex=1, ez=1, ey=0.8, parent=H, loc=(0, (fy(0, -3.3) + 0.2) * u, -3.3 * u), seg=32, rings=16)
        tg = squircle('otongue', 0.8 * u, 0.5 * u, 0.4 * u, self.tongue_m, ex=1, ez=1, ey=1, parent=H, loc=(0.1 * u, (fy(0, -4.3) - 0.3) * u, -4.25 * u), seg=24, rings=12)
        self.mouths['o'] = [o, tg]
        o = squircle('dmouth', 2.1 * u, 1.0 * u, 0.7 * u, self.mouth_m, ex=1, ez=1, ey=0.8, parent=H, loc=(0, (fy(0, -3.1) + 0.2) * u, -3.1 * u), seg=32, rings=16)
        o.rotation_euler = (0, math.radians(10), 0)
        tg = V.capsule('dtongue', 2.6 * u, 0.75 * u, (1.0 * u, (fy(1.0, -4.0) - 0.4) * u, -4.3 * u), self.tongue_m); tg.parent = H
        tg.rotation_euler = (0, math.radians(70), 0); tg.scale = (1, 0.6, 1)
        self.mouths['tongue'] = [o, tg]
        # squeezed-shut creases for the wince
        self.squeeze = []
        for sd in (-1, 1):
            cx, cz = sd * 3.0, 1.6
            pts = [(cx - sd * 1.7, cz + 1.3), (cx + sd * 1.3, cz + 0.1), (cx - sd * 1.7, cz - 1.0)]
            pts = chaikin(pts, 2, closed=False)
            self.squeeze.append(tube('squeeze', [(x * u, (fy(x * 0.8, (z - 0.2) * 0.8) - 2.2) * u, z * u) for x, z in pts], 0.32 * u, self.line_m, H))
        # sweat drops
        drop_m = mat('sweat', srgb('#9fe6ff'), rough=0.02, coat=1.0, emit=srgb('#7fd8ff'), emit_str=0.25)
        self.sweat = []
        for (x, z, r) in ((-6.0, 4.0, 1.25), (6.2, 3.0, 1.05), (4.6, 6.0, 0.8)):
            o = V.flame('drop', (x * u, fy(x * 0.9, z * 0.9) * u - 0.05, z * u), r * u, drop_m)
            o.parent = H; o.location = (x * u, (fy(x * 0.85, z * 0.85) - 0.3) * u, z * u)
            o.rotation_euler = (0, math.pi, 0); o.visible_shadow = True; self.sweat.append(o)

    def pose(self, name, lights='dim'):
        e = SHIP_EXPR[name]; u = U
        for k, objs in self.mouths.items():
            for o in objs: o.hide_render = k != e['mouth']
        self.eyes[0].set(**e['eye']); self.eyes[1].set(**e.get('eye_r', e['eye']))
        for (s, piv), ang in zip(self.ants, e['ant']):
            piv.rotation_euler = (math.radians(-10), math.radians(ang), 0)
        for o in self.sweat: o.hide_render = not e.get('sweat')
        for o in self.squeeze: o.hide_render = e['mouth'] != 'wince'
        for o in self.smoke: o.hide_render = not e.get('smoke')
        for o in self.stars: o.hide_render = not e.get('stars')
        self.dome.hide_render = bool(e.get('crack')); self.dome_cr.hide_render = not e.get('crack')
        self.root.rotation_euler = (math.radians(SHIP_TILT), math.radians(e.get('roll', 0)), 0)
        dead = e.get('dead')
        for b in self.bulbs:
            b.data.materials.clear(); b.data.materials.append(self.bulb_off if dead else self.bulb_dim[b['hex']])
        en = self.glow_m.node_tree.nodes['Emission']
        en.inputs['Strength'].default_value = 0.0 if dead else (9.0 if e.get('fire') else 5.0)
        en.inputs['Color'].default_value = (*srgb('#ff4fd0' if e.get('fire') else '#5ff4ff'), 1)
        self.port_m.node_tree.nodes['Emission'].inputs['Strength'].default_value = 0.0 if dead else 2.2
        return e

    def lights_overlay(self, parity):
        """Only the lit bulbs of one parity; everything else is a holdout so the hull still occludes them."""
        self.pose('smug')
        for o in bpy.context.scene.objects:
            if o.type in ('MESH', 'CURVE') and o.name != 'softbox': o.is_holdout = True
        for b in self.bulbs:
            b.is_holdout = False
            b.hide_render = b['i'] % 2 != parity
            b.data.materials.clear(); b.data.materials.append(self.bulb_on[b['hex']])


def render_ship(only=None):
    sc = V.reset()
    for o in sc.objects:   # round highlights on the glass dome instead of the square key-light glint
        if o.type == 'LIGHT' and o.data.type == 'AREA': o.data.shape = 'DISK'
    ship = Mothership()
    jobs = []
    for ex in SHIP_EXPR:
        n = 'mothership_' + ex
        if only and n not in only and ex not in only: continue
        jobs.append((n, SHIP_SIZE, (lambda ex=ex: ship.pose(ex))))
    render_set(sc, jobs, 24 if FAST else 64)
    if not only or 'lights' in only:
        for par in (0, 1):
            ship.lights_overlay(par)
            render_set(sc, [(f'mothership_lights_{par}', SHIP_SIZE, None)], 16 if FAST else 32)


# =============================================================================================== plate
WIN = dict(x0=14, y0=46, x1=346, y1=434, r=26)      # window opening (screen units)
FRAME_W = 14                                        # frame width around the opening
MULLIONS = ()                                        # v3: removed (were at x = 124, 236)
PLANET = dict(x=266, y=356, r=98)
MOON = dict(x=58, y=82, r=12)
SUN = Vector((-0.74, -0.2, 0.62)).normalized()     # light direction (towards the light) for the painted space bodies
PLATE_LIGHTS = []                                   # (x, y, hex, size) indicator lights, for halos in post
# v3 (backgrounds never outshine the play): no mullions across the window, a dim and muted planet / ring / nebula,
# and quieter neon strips, indicator lights and deck treads in the lower hangar
SPACE_GAIN, SPACE_SAT = 0.28, 0.42                  # planet, ring and moon emission gain / saturation kept
NEBULA_GAIN, NEBULA_SAT = 0.45, 0.55
NEON_K = 0.35                                       # LED strips and indicator lights, emission scale


def mute(hexc, sat=SPACE_SAT):
    """Hex colour pulled toward its own grey (keeps the luminance, drops saturation)."""
    r, g, b = (int(hexc[i:i + 2], 16) for i in (1, 3, 5))
    y = 0.2126 * r + 0.7152 * g + 0.0722 * b
    return '#%02x%02x%02x' % tuple(round(y + (c - y) * sat) for c in (r, g, b))


def mute_lin(c, sat):
    y = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
    return tuple(y + (k - y) * sat for k in c)


def vmath(nt, op, a, b=None, scale=None):
    n = node(nt, 'ShaderNodeVectorMath', operation=op)
    feed(nt, n.inputs[0], a)
    if b is not None: feed(nt, n.inputs[1], b)
    if scale is not None: n.inputs['Scale'].default_value = scale
    return n.outputs['Value'] if op in ('DOT_PRODUCT', 'LENGTH', 'DISTANCE') else n.outputs['Vector']


def camera_only(o):
    hide_from_rays(o, camera=True)


def space_backdrop():
    """Emissive deep-space plane far behind the window: navy to violet, nebula, two star layers."""
    x0, x1, y0, y1 = -40, 400, -80, 480
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 40, 0), rotation=(math.radians(90), 0, 0))
    o = bpy.context.object; o.name = 'space'
    bm = bmesh.new(); bm.from_mesh(o.data)
    for v in bm.verts:
        v.co.x = (x1 if v.co.x > 0 else x0) * U; v.co.y = -(y0 if v.co.y > 0 else y1) * U
    bm.to_mesh(o.data); bm.free(); camera_only(o)
    m = bpy.data.materials.new('space'); nt = m.node_tree; nt.nodes.remove(nt.nodes['Principled BSDF'])
    tc = node(nt, 'ShaderNodeTexCoord'); sep = node(nt, 'ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['Object'], sep.inputs['Vector'])
    X, Z = sep.outputs['X'], sep.outputs['Y']          # metres; screen y = -Z / U
    g = node(nt, 'ShaderNodeValToRGB'); e = g.color_ramp.elements
    nt.links.new(maprange(nt, Z, -44.0, -4.0, 0, 1, smooth=False), g.inputs['Fac'])
    e[0].position = 0.0; e[0].color = (0.035, 0.016, 0.07, 1)        # low: violet haze around the planet
    e[1].position = 1.0; e[1].color = (0.004, 0.005, 0.02, 1)        # high: deep navy
    mid = g.color_ramp.elements.new(0.5); mid.color = (0.010, 0.008, 0.035, 1)
    col = g.outputs['Color']
    # nebula: two noise layers, magenta upper right and teal lower left, kept faint behind the formation
    for (cx, cy, rad, c, amt, sc_, seed) in ((300, 90, 150, (0.20, 0.035, 0.20), 0.9, 0.22, 1.0),
                                              (40, 300, 170, (0.02, 0.10, 0.15), 0.8, 0.25, 7.0),
                                              (170, 230, 220, (0.07, 0.03, 0.13), 0.5, 0.18, 3.0)):
        mp = node(nt, 'ShaderNodeMapping'); mp.inputs['Location'].default_value = (seed, seed * 2, 0)
        nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])
        nz = node(nt, 'ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = sc_; nz.inputs['Detail'].default_value = 7
        nz.inputs['Roughness'].default_value = 0.62; nz.inputs['Distortion'].default_value = 0.6
        nt.links.new(mp.outputs['Vector'], nz.inputs['Vector'])
        bx, bz = S(cx, cy)
        dx = mth(nt, 'SUBTRACT', X, bx); dz = mth(nt, 'SUBTRACT', Z, bz)
        d = mth(nt, 'SQRT', mth(nt, 'ADD', mth(nt, 'MULTIPLY', dx, dx), mth(nt, 'MULTIPLY', dz, dz)))
        fall = maprange(nt, d, rad * U, 0.0, 0.0, 1.0)
        cloud = mth(nt, 'MULTIPLY', maprange(nt, nz.outputs['Fac'], 0.42, 0.75), mth(nt, 'MULTIPLY', fall, amt * NEBULA_GAIN))
        c = mute_lin(c, NEBULA_SAT)
        add = node(nt, 'ShaderNodeMix', data_type='RGBA', blend_type='ADD'); sock(add, 'Factor', 'VALUE').default_value = 1.0
        nt.links.new(col, sock(add, 'A', 'RGBA'))
        cm = node(nt, 'ShaderNodeMix', data_type='RGBA'); feed(nt, sock(cm, 'Factor', 'VALUE'), cloud)
        sock(cm, 'A', 'RGBA').default_value = (0, 0, 0, 1); sock(cm, 'B', 'RGBA').default_value = (*c, 1)
        nt.links.new(sock(cm, 'Result', 'RGBA', outputs=True), sock(add, 'B', 'RGBA'))
        col = sock(add, 'Result', 'RGBA', outputs=True)
    # stars
    star = 0.0
    for scale, rad, gain in ((0.5, 0.06, 4.0), (1.3, 0.04, 1.4), (2.6, 0.03, 0.6)):
        v = node(nt, 'ShaderNodeTexVoronoi'); v.inputs['Scale'].default_value = scale
        nt.links.new(tc.outputs['Object'], v.inputs['Vector'])
        r = node(nt, 'ShaderNodeSeparateColor'); nt.links.new(v.outputs['Color'], r.inputs['Color'])
        disc = maprange(nt, v.outputs['Distance'], rad * 0.3, rad, 1, 0)
        s_ = mth(nt, 'MULTIPLY', disc, mth(nt, 'MULTIPLY', mth(nt, 'POWER', r.outputs[0], 6.0), gain))
        star = mth(nt, 'ADD', star, s_)
    # fewer stars right behind the formation's start position
    fx, fz = S(180, 170)
    dx = mth(nt, 'SUBTRACT', X, fx); dz = mth(nt, 'SUBTRACT', Z, fz)
    df = mth(nt, 'SQRT', mth(nt, 'ADD', mth(nt, 'MULTIPLY', mth(nt, 'MULTIPLY', dx, 0.6), mth(nt, 'MULTIPLY', dx, 0.6)), mth(nt, 'MULTIPLY', dz, dz)))
    star = mth(nt, 'MULTIPLY', star, maprange(nt, df, 4.0, 11.0, 0.35, 1.0))
    sc2 = node(nt, 'ShaderNodeMix', data_type='RGBA'); feed(nt, sock(sc2, 'Factor', 'VALUE'), mth(nt, 'MINIMUM', star, 1.0))
    nt.links.new(col, sock(sc2, 'A', 'RGBA')); sock(sc2, 'B', 'RGBA').default_value = (0.85, 0.88, 1.0, 1)
    col = sock(sc2, 'Result', 'RGBA', outputs=True)
    em = node(nt, 'ShaderNodeEmission'); nt.links.new(col, em.inputs['Color']); em.inputs['Strength'].default_value = 1.0
    nt.links.new(em.outputs[0], nt.nodes['Material Output'].inputs['Surface'])
    o.data.materials.append(m)


def body_mat(name, bands, centre, radius, spec=0.5, atmo=(0.55, 0.3, 1.0), atmo_str=0.9, band_scale=3.0, ring=None, night=0.03,
             crater=False):
    """Painted (emissive) planet / moon shading: lambert from SUN with a soft terminator, a glossy hotspot, a violet
    atmosphere rim, horizontal bands warped by noise, and optionally the shadow of the ring across it."""
    m = bpy.data.materials.new(name); nt = m.node_tree; nt.nodes.remove(nt.nodes['Principled BSDF'])
    geo = node(nt, 'ShaderNodeNewGeometry'); tc = node(nt, 'ShaderNodeTexCoord')
    N = geo.outputs['Normal']
    lam = vmath(nt, 'DOT_PRODUCT', N, tuple(SUN))
    lit = maprange(nt, lam, -0.12, 0.55, 0.0, 1.0)
    # bands along the object z (the planet is rotated so they tilt), warped by noise
    sep = node(nt, 'ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['Object'], sep.inputs['Vector'])
    nz = node(nt, 'ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 0.9 if not crater else 4.0; nz.inputs['Detail'].default_value = 3 if not crater else 6
    nz.inputs['Distortion'].default_value = 0.25
    nt.links.new(tc.outputs['Object'], nz.inputs['Vector'])
    bandv = mth(nt, 'ADD', mth(nt, 'MULTIPLY', sep.outputs['Z'], band_scale / radius), mth(nt, 'MULTIPLY', nz.outputs['Fac'], 0.3 if not crater else 1.2))
    ramp = node(nt, 'ShaderNodeValToRGB'); e = ramp.color_ramp.elements
    e[0].position, e[0].color = bands[0][0], (*srgb(mute(bands[0][1])), 1)
    e[1].position, e[1].color = bands[-1][0], (*srgb(mute(bands[-1][1])), 1)
    for pos, hx in bands[1:-1]:
        k = e.new(pos); k.color = (*srgb(mute(hx)), 1)
    atmo = mute_lin(atmo, SPACE_SAT)
    nt.links.new(mth(nt, 'FRACT', mth(nt, 'MULTIPLY', bandv, 0.5)), ramp.inputs['Fac'])
    col = ramp.outputs['Color']
    shade = mth(nt, 'ADD', night, mth(nt, 'MULTIPLY', lit, 1.0 - night))
    if ring:   # ring shadow: march from the surface point toward the sun to the ring plane
        cR, nR, r0, r1 = ring
        P = geo.outputs['Position']
        num = vmath(nt, 'DOT_PRODUCT', vmath(nt, 'SUBTRACT', tuple(cR), P), tuple(nR))
        den = float(SUN.dot(nR))
        t = mth(nt, 'DIVIDE', num, den)
        Q = vmath(nt, 'ADD', P, vmath(nt, 'SCALE', tuple(SUN), None, scale=1.0))
        sc_node = node(nt, 'ShaderNodeVectorMath', operation='SCALE'); sc_node.inputs[0].default_value = tuple(SUN)
        nt.links.new(t, sc_node.inputs['Scale'])
        Q = vmath(nt, 'ADD', P, sc_node.outputs['Vector'])
        rq = vmath(nt, 'DISTANCE', Q, tuple(cR))
        inring = mth(nt, 'MULTIPLY', maprange(nt, rq, r0, r0 + 0.3), maprange(nt, rq, r1, r1 - 0.3))
        inring = mth(nt, 'MULTIPLY', inring, mth(nt, 'GREATER_THAN', t, 0.0))
        shade = mth(nt, 'MULTIPLY', shade, mth(nt, 'SUBTRACT', 1.0, mth(nt, 'MULTIPLY', inring, 0.7)))
    sh = node(nt, 'ShaderNodeMix', data_type='RGBA', blend_type='MULTIPLY'); sock(sh, 'Factor', 'VALUE').default_value = 1.0
    nt.links.new(col, sock(sh, 'A', 'RGBA'))
    cmb = node(nt, 'ShaderNodeCombineColor'); nt.links.new(shade, cmb.inputs[0]); nt.links.new(shade, cmb.inputs[1]); nt.links.new(shade, cmb.inputs[2])
    nt.links.new(cmb.outputs[0], sock(sh, 'B', 'RGBA'))
    col = sock(sh, 'Result', 'RGBA', outputs=True)
    # the night side keeps a faint violet (ring-shine) instead of going muddy
    nadd = node(nt, 'ShaderNodeMix', data_type='RGBA', blend_type='ADD'); feed(nt, sock(nadd, 'Factor', 'VALUE'), mth(nt, 'SUBTRACT', 1.0, lit))
    nt.links.new(col, sock(nadd, 'A', 'RGBA')); sock(nadd, 'B', 'RGBA').default_value = (0.05, 0.022, 0.11, 1)
    col = sock(nadd, 'Result', 'RGBA', outputs=True)
    # glossy hotspot (half vector between sun and the camera at -Y)
    H = (SUN + Vector((0, -1, 0))).normalized()
    hs = mth(nt, 'POWER', mth(nt, 'MAXIMUM', vmath(nt, 'DOT_PRODUCT', N, tuple(H)), 0.0), 60.0)
    hs2 = mth(nt, 'POWER', mth(nt, 'MAXIMUM', vmath(nt, 'DOT_PRODUCT', N, tuple(H)), 0.0), 8.0)
    spec_v = mth(nt, 'ADD', mth(nt, 'MULTIPLY', hs, spec), mth(nt, 'MULTIPLY', hs2, spec * 0.12))
    col = mixc(nt, mth(nt, 'MINIMUM', spec_v, 1.0), col, (1.0, 0.95, 0.95))
    # atmosphere rim
    lw = node(nt, 'ShaderNodeLayerWeight'); lw.inputs['Blend'].default_value = 0.35
    rim = mth(nt, 'MULTIPLY', mth(nt, 'POWER', lw.outputs['Facing'], 3.0), mth(nt, 'ADD', 0.25, mth(nt, 'MULTIPLY', lit, 0.75)))
    col = mixc(nt, mth(nt, 'MULTIPLY', rim, atmo_str), col, atmo)
    em = node(nt, 'ShaderNodeEmission'); nt.links.new(col, em.inputs['Color']); em.inputs['Strength'].default_value = SPACE_GAIN
    nt.links.new(em.outputs[0], nt.nodes['Material Output'].inputs['Surface'])
    return m


def ring_mat(name, centre, R, r0, r1):
    m = bpy.data.materials.new(name); nt = m.node_tree; nt.nodes.remove(nt.nodes['Principled BSDF'])
    geo = node(nt, 'ShaderNodeNewGeometry')
    P = geo.outputs['Position']
    rr = vmath(nt, 'DISTANCE', P, tuple(centre))
    f = maprange(nt, rr, r0, r1, 0, 1, smooth=False)
    ramp = node(nt, 'ShaderNodeValToRGB'); e = ramp.color_ramp.elements    # colour (rgb) + density (alpha)
    stops = [(0.0, '#6a4a9a', 0.0), (0.06, '#9a7ad0', 0.55), (0.22, '#e8b0d0', 0.8), (0.34, '#f5c8c0', 0.95), (0.40, '#3a2850', 0.12),
             (0.47, '#ffb6a6', 0.85), (0.7, '#d891c0', 0.7), (0.82, '#a070c8', 0.45), (0.9, '#6a4aa0', 0.25), (1.0, '#40306a', 0.0)]
    e[0].position = stops[0][0]; e[0].color = (*srgb(mute(stops[0][1])), stops[0][2])
    e[1].position = stops[-1][0]; e[1].color = (*srgb(mute(stops[-1][1])), stops[-1][2])
    for pos, hx, a in stops[1:-1]:
        k = e.new(pos); k.color = (*srgb(mute(hx)), a)
    nt.links.new(f, ramp.inputs['Fac'])
    # fine ringlets
    wv = node(nt, 'ShaderNodeTexWave', wave_type='RINGS'); wv.inputs['Scale'].default_value = 1.0
    mpw = node(nt, 'ShaderNodeMapping'); mpw.inputs['Scale'].default_value = (14, 14, 14)
    nt.links.new(maprange(nt, rr, 0, 30, 0, 30, smooth=False), mpw.inputs['Vector'])
    nt.links.new(mpw.outputs['Vector'], wv.inputs['Vector'])
    dens = mth(nt, 'MULTIPLY', ramp.outputs['Alpha'], maprange(nt, wv.outputs['Fac'], 0.0, 1.0, 0.75, 1.0))
    # planet shadow on the ring (the far side, away from the sun)
    d = vmath(nt, 'SUBTRACT', P, tuple(centre))
    t = vmath(nt, 'DOT_PRODUCT', d, tuple(SUN))
    sc_node = node(nt, 'ShaderNodeVectorMath', operation='SCALE'); sc_node.inputs[0].default_value = tuple(SUN); nt.links.new(t, sc_node.inputs['Scale'])
    perp = vmath(nt, 'LENGTH', vmath(nt, 'SUBTRACT', d, sc_node.outputs['Vector']))
    shadow = mth(nt, 'MULTIPLY', maprange(nt, perp, R * 1.02, R * 0.94), mth(nt, 'LESS_THAN', t, 0.0))
    lit = mth(nt, 'SUBTRACT', 1.0, mth(nt, 'MULTIPLY', shadow, 0.85))
    em = node(nt, 'ShaderNodeEmission'); nt.links.new(ramp.outputs['Color'], em.inputs['Color']); feed(nt, em.inputs['Strength'], mth(nt, 'MULTIPLY', lit, 0.95 * SPACE_GAIN))
    tr = node(nt, 'ShaderNodeBsdfTransparent'); ms = node(nt, 'ShaderNodeMixShader')
    nt.links.new(dens, ms.inputs[0]); nt.links.new(tr.outputs[0], ms.inputs[1]); nt.links.new(em.outputs[0], ms.inputs[2])
    nt.links.new(ms.outputs[0], nt.nodes['Material Output'].inputs['Surface'])
    return m


def space_bodies():
    # ringed planet
    cx, cz = S(PLANET['x'], PLANET['y']); R = PLANET['r'] * U; Y = 30.0
    tilt = math.radians(-16)                                     # roll of the planet axis and the ring on screen
    ring_inc = math.radians(-15)                                 # ring plane tipped so its near side drops: a flat ellipse
    rot = Matrix.Rotation(tilt, 3, 'Y') @ Matrix.Rotation(ring_inc, 3, 'X')
    nR = rot @ Vector((0, 0, 1)); centre = Vector((cx, Y, cz))
    r0, r1 = R * 1.28, R * 2.2
    bands = [(0.0, '#ff8a70'), (0.14, '#ffb48c'), (0.27, '#f06a7e'), (0.4, '#c94a8c'), (0.52, '#ff9d7c'), (0.63, '#9a52c8'),
             (0.75, '#ff7f86'), (0.88, '#ffc2a0'), (1.0, '#ff8a70')]
    pm = body_mat('planet', bands, centre, R, spec=0.45, atmo=(0.75, 0.42, 1.0), atmo_str=1.0, band_scale=2.6, ring=(centre, nR, r0, r1), night=0.015)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=128, ring_count=64, radius=R, location=centre)
    p = bpy.context.object; p.name = 'planet'; bpy.ops.object.shade_smooth(); p.data.materials.append(pm)
    p.rotation_euler = rot.to_euler()
    camera_only(p)
    bm = bmesh.new()
    segs = 256
    outer = [bm.verts.new((r1 * math.cos(a), r1 * math.sin(a), 0)) for a in [i / segs * math.tau for i in range(segs)]]
    inner = [bm.verts.new((r0 * math.cos(a), r0 * math.sin(a), 0)) for a in [i / segs * math.tau for i in range(segs)]]
    for i in range(segs):
        j = (i + 1) % segs; bm.faces.new((inner[i], inner[j], outer[j], outer[i]))
    rg = new_obj('ring', bm, ring_mat('ring', centre, R, r0, r1)); rg.location = centre; rg.rotation_euler = rot.to_euler()
    camera_only(rg)
    # small cratered moon, upper left
    mx, mz = S(MOON['x'], MOON['y']); mr = MOON['r'] * U
    mm = body_mat('moon', [(0.0, '#9a93b8'), (0.4, '#c9c2de'), (0.7, '#8a83a8'), (1.0, '#b8b0d2')], Vector((mx, 34, mz)), mr,
                  spec=0.25, atmo=(0.6, 0.65, 1.0), atmo_str=0.5, band_scale=0.6, night=0.02, crater=True)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32, radius=mr, location=(mx, 34, mz))
    mo = bpy.context.object; bpy.ops.object.shade_smooth(); mo.data.materials.append(mm); camera_only(mo)


def rrect_loop(x0, y0, x1, y1, r, n=12):
    """Rounded rectangle in screen units -> list of (X, Z) metres, counter-clockwise."""
    pts = []
    for (cx, cy, a0) in ((x1 - r, y1 - r, 0), (x0 + r, y1 - r, 90), (x0 + r, y0 + r, 180), (x1 - r, y0 + r, 270)):
        for i in range(n + 1):
            a = math.radians(a0 + 90 * i / n)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return [(x * U, -y * U) for x, y in pts]


def ring_frame(name, outer, inner, depth, bevel, m, y):
    """Flat rounded-rect ring (outer / inner = (x0, y0, x1, y1, r) in screen units), extruded toward the camera."""
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '2D'; cu.fill_mode = 'BOTH'
    cu.extrude = depth; cu.bevel_depth = bevel; cu.bevel_resolution = 5
    for loop in (rrect_loop(*outer), rrect_loop(*inner)):
        sp = cu.splines.new('POLY'); sp.points.add(len(loop) - 1); sp.use_cyclic_u = True
        for p_, c in zip(sp.points, loop): p_.co = (c[0], c[1], 0, 1)
    o = bpy.data.objects.new(name, cu); bpy.context.scene.collection.objects.link(o)
    o.rotation_euler = (math.radians(90), 0, 0); o.location = (0, y, 0); o.data.materials.append(m)
    return o


def rivet(x, y, yy, m, r=1.3):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r * U, segments=20, ring_count=10, location=(x * U, yy, -y * U))
    o = bpy.context.object; o.scale = (1, 0.55, 1); bpy.ops.object.shade_smooth(); o.data.materials.append(m)
    return o


def indicator(x, y, yy, hexc, r=1.6, strength=5.0):
    m = mat('ind' + hexc, srgb(hexc), rough=0.1, coat=1.0, emit=srgb(hexc), emit_str=strength * NEON_K)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r * U, segments=20, ring_count=10, location=(x * U, yy, -y * U))
    o = bpy.context.object; o.scale = (1, 0.6, 1); bpy.ops.object.shade_smooth(); o.data.materials.append(m)
    PLATE_LIGHTS.append((x, y, hexc, r))
    return o


def sbox(name, x0, y0, x1, y1, depth, yfront, bevel, m, segs=4):
    """Box from screen rect (units) with its front face at Blender y = yfront."""
    cx, cz = S((x0 + x1) / 2, (y0 + y1) / 2)
    return box(name, (x1 - x0) * U, (y1 - y0) * U, depth, bevel, m, (cx, yfront + depth / 2, cz), segs=segs)


def build_plate():
    PLATE_LIGHTS.clear()
    space_backdrop(); space_bodies()
    W = WIN; fw = FRAME_W
    FRAME = metal_mat('frame', '#5a648e', rough=0.3, metal=0.5, coat=0.8)
    TRIM = mat('trim', srgb('#9aa3c4'), rough=0.2, metal=0.8, coat=0.6)
    WALL = noisy_panel('wall', '#2a3150')
    PANEL = noisy_panel('panel', '#3a4268')
    DARK = mat('darkmetal', srgb('#151a2e'), rough=0.45, metal=0.5, coat=0.3)
    RIV = mat('privet', srgb('#b9c1db'), rough=0.22, metal=1.0, coat=0.4)
    # back wall (everything outside the window), recessed
    for (x0, y0, x1, y1) in ((-20, -60, 380, W['y0'] - 4), (-20, W['y1'] + 4, 380, 820), (-20, -60, W['x0'] - 4, 820), (W['x1'] + 4, -60, 380, 820)):
        sbox('backwall', x0, y0, x1, y1, 0.3, 1.2, 0, WALL)
    # chunky rounded window frame + an inner chrome lip + mullions
    ring_frame('frame', (W['x0'] - fw, W['y0'] - fw, W['x1'] + fw, W['y1'] + fw, W['r'] + fw), (W['x0'], W['y0'], W['x1'], W['y1'], W['r']),
               0.35, 0.32, FRAME, -0.1)
    ring_frame('lip', (W['x0'] + 0.5, W['y0'] + 0.5, W['x1'] - 0.5, W['y1'] - 0.5, W['r'] - 0.5), (W['x0'] + 3, W['y0'] + 3, W['x1'] - 3, W['y1'] - 3, W['r'] - 3),
               0.08, 0.1, TRIM, 0.55)
    # v3: no mullions (nothing crosses the window)
    # rivets around the frame face
    yfr = -0.1 - 0.35 - 0.32
    cxm = (W['x0'] + W['x1']) / 2
    for i in range(15):
        x = W['x0'] + 22 + i * (W['x1'] - W['x0'] - 44) / 14
        for y in (W['y0'] - fw / 2, W['y1'] + fw / 2): rivet(x, y, yfr + 0.03, RIV)
    for i in range(13):
        y = W['y0'] + 30 + i * (W['y1'] - W['y0'] - 60) / 12
        for x in (W['x0'] - fw / 2, W['x1'] + fw / 2): rivet(x, y, yfr + 0.03, RIV)
    # header beam above the window, with a soft cool light strip
    sbox('header', -10, -60, 370, W['y0'] - fw - 6, 1.0, -0.2, 0.2, PANEL)
    for i in range(6):
        x = 30 + i * 60
        sbox('hseam', x - 0.6, -60, x + 0.6, W['y0'] - fw - 7, 0.05, -0.23, 0, DARK)
    # sill under the window: a protruding ledge with a cyan LED strip on its lip
    ys = W['y1'] + fw
    sbox('sill', -10, ys + 2, 370, ys + 18, 1.6, -0.9, 0.35, FRAME)
    strip = emission('sillstrip', mute_lin(srgb('#4fe9ff'), 0.7), 3.0 * NEON_K)
    sbox('sillled', 10, ys + 14.4, 350, ys + 15.8, 0.05, -0.95, 0, strip)
    # side columns (the walls the ball bounces off) below the window
    for (x0, x1) in ((-6, 12), (348, 366)):
        sbox('column', x0, ys + 18, x1, 820, 1.4, -0.6, 0.3, FRAME)
        for y in range(int(ys + 34), 800, 46):
            rivet((x0 + x1) / 2 + (2 if x0 < 0 else -2), y, -0.62, RIV, 1.2)
    # wall panels: two columns of tall panels with soft seams, a few vents and indicator clusters
    py0 = ys + 24; rows = [(py0, py0 + 92), (py0 + 96, py0 + 188)]
    cols = [(16, 126), (130, 230), (234, 344)]
    rng = random.Random(4)
    for ri, (y0, y1) in enumerate(rows):
        for ci, (x0, x1) in enumerate(cols):
            sbox(f'panel{ri}{ci}', x0, y0, x1, y1, 0.5, 0.05 + rng.uniform(-0.03, 0.03), 0.22, PANEL, segs=4)
            if (ri, ci) in ((0, 0), (1, 2)):
                for k in range(5):
                    yy = y0 + 18 + k * 7
                    sbox('vent', x0 + 18, yy, x1 - 18, yy + 3.2, 0.1, 0.0, 0.05, DARK, segs=2)
            if (ri, ci) == (0, 1):
                # small status console: three lights in a dark bezel
                sbox('console', (x0 + x1) / 2 - 22, y0 + 14, (x0 + x1) / 2 + 22, y0 + 28, 0.12, -0.03, 0.06, DARK, segs=2)
                for k, hx in enumerate(('#4fe9ff', '#4fe9ff', '#ff5d8f')):
                    indicator((x0 + x1) / 2 - 12 + 12 * k, y0 + 21, -0.08, hx, 1.9, 4.0)
            if (ri, ci) == (1, 0):
                for k, hx in enumerate(('#7dff9a', '#4fe9ff')):
                    indicator(x0 + 14 + 9 * k, y1 - 14, -0.03, hx, 1.5, 3.5)
            if (ri, ci) == (0, 2):
                indicator(x1 - 14, y0 + 14, -0.03, '#c46bf0', 1.5, 3.5)
            for (rx, ry) in ((x0 + 6, y0 + 6), (x1 - 6, y0 + 6), (x0 + 6, y1 - 6), (x1 - 6, y1 - 6)):
                rivet(rx, ry, -0.02, RIV, 0.9)
    # deck: a kick plate with horizontal treads and a soft pink edge light
    dy = py0 + 196
    TREAD = metal_mat('tread', '#2c3247', rough=0.45, metal=0.4, coat=0.2)
    sbox('deck', -10, dy, 370, 830, 1.8, -1.2, 0.3, DARK)
    edge = emission('deckedge', mute_lin(srgb('#ff5d8f'), 0.7), 2.2 * NEON_K)
    sbox('deckled', 12, dy + 3, 348, dy + 4.4, 0.05, -1.25, 0, edge)
    for k in range(9):
        yy = dy + 12 + k * 8
        sbox('tread', 12, yy, 348, yy + 4.5, 0.25, -1.4, 0.08, TREAD, segs=2)
    # lights: space light spilling through the window onto the frame's inner rim, planet bounce, sill glow
    wx, wz = S(cxm, (W['y0'] + W['y1']) / 2)
    bpy.ops.object.light_add(type='AREA', location=(wx, 6.0, wz), rotation=(math.radians(-90), 0, 0))
    bpy.context.object.visible_camera = False
    L = bpy.context.object.data; L.shape = 'RECTANGLE'; L.size = 30; L.size_y = 36; L.energy = 3000; L.color = (0.6, 0.5, 1.0)
    px_, pz_ = S(PLANET['x'], PLANET['y'] + 40)
    bpy.ops.object.light_add(type='AREA', location=(px_, 4.0, pz_), rotation=(math.radians(-90), 0, 0))
    bpy.context.object.visible_camera = False
    L = bpy.context.object.data; L.size = 14; L.energy = 6000 * SPACE_GAIN; L.color = (0.85, 0.65, 0.7)
    sx, sz = S(180, ys + 20)
    bpy.ops.object.light_add(type='AREA', location=(sx, -2.0, sz), rotation=(math.radians(-60), 0, 0))
    bpy.context.object.visible_camera = False
    L = bpy.context.object.data; L.shape = 'RECTANGLE'; L.size = 34; L.size_y = 1; L.energy = 1600 * NEON_K; L.color = (0.6, 0.85, 1.0)


def noisy_panel(name, hexc):
    m = mat(name, srgb(hexc), rough=0.42, metal=0.35, coat=0.45, coat_rough=0.08)
    return V.noisy(m, scale=3.0, amount=0.12, bump=0.05, detail=5)


def render_plate():
    sc = V.reset()
    build_plate()
    P = PLATE
    if FAST:
        V.frame(sc, P['x0'], P['y0'], P['w'], P['h'], 2 if '--mid' in sys.argv else 1, os.path.join(RAW, 'plate_fast.png'), False, 24)
    else:
        V.frame(sc, P['x0'], P['y0'], P['w'], P['h'], P['ppu'], os.path.join(RAW, 'plate.png'), False, 96)
    json.dump(PLATE_LIGHTS, open(os.path.join(RAW, 'plate_lights.json'), 'w'))


# =============================================================================================== render driver
SPRITES = {}


def render_set(sc, jobs, samples):
    """jobs: list of (out_name, (w, h) units, setup_fn or None)."""
    for name, (w, h), setup in jobs:
        if setup: setup()
        V.frame(sc, V.P0[0] - w / 2, V.P0[1] - h / 2, w, h, SPR_PPU, os.path.join(RAW, name + '.png'), True, samples)


def brick_jobs():
    J = {}
    for ci in range(9):
        for d in (0, 1, 2):
            J[f'brick_c_{ci}_{d}'] = (lambda ci=ci, d=d: build_candy(ci, d))
    for d in (0, 1, 2):
        J[f'brick_a_{d}'] = (lambda d=d: build_armor(d))
    J['brick_p_0'] = build_power
    return J


MISC = {'bolt': ((16, 24), build_bolt), 'bomb': ((20, 24), build_bomb)}


def render_static(only=None):
    """Bricks, bolt and bomb: built one by one into a fresh scene (as in the Vault)."""
    jobs = [(n, (CW + 2 * MARGIN, CH + 2 * MARGIN), f) for n, f in brick_jobs().items()] + [(n, sz, f) for n, (sz, f) in MISC.items()]
    sc = V.reset()
    for n, size, f in jobs:
        if only and n not in only: continue
        for o in list(sc.objects):
            if o.type in ('MESH', 'CURVE') and o.name != 'softbox': bpy.data.objects.remove(o)
        f()
        render_set(sc, [(n, size, None)], 24 if FAST else 56)


def render_bots(only=None, colors=None):
    sc = V.reset()
    bot = Robot()
    size = (CW + 2 * MARGIN, CH + 2 * MARGIN)
    jobs = []
    for ck in (colors or BOT_COLORS):
        for ex in BOT_EXPR:
            n = f'bot_{ck}_{ex}'
            if only and n not in only and ex not in only: continue
            jobs.append((n, size, (lambda ex=ex, ck=ck: bot.pose(ex, BOT_COLORS[ck]))))
    render_set(sc, jobs, 24 if FAST else 64)
    if colors and 'white' not in colors: return
    # tint masks: helmet shell as flat white emission, everything else a holdout (so the visor etc. cut it out)
    white = emission('maskwhite', (1, 1, 1), 1.0)
    for ex in BOT_EXPR:
        if only and ex not in only and f'bot_white_{ex}' not in only: continue
        bot.pose(ex, BOT_COLORS['white'])
        for o in sc.objects:
            if o.type in ('MESH', 'CURVE') and o.name != 'softbox': o.is_holdout = o.name not in ('helmet', 'helmet_dent')
        for h in (bot.helmet, bot.helmet_dent):
            h.data.materials.clear(); h.data.materials.append(white)
        sc.view_settings.view_transform = 'Standard'; sc.view_settings.look = 'None'; sc.cycles.use_denoising = False
        render_set(sc, [(f'botmask_{ex}', size, None)], 16)
        sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast'; sc.cycles.use_denoising = True
        for o in sc.objects: o.is_holdout = False
        for h in (bot.helmet, bot.helmet_dent):
            h.data.materials.clear(); h.data.materials.append(bot.body_mat)


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    what = args[0] if args else 'all'
    if what in ('plate', 'all'): render_plate()
    if what in ('static', 'sprites', 'all'): render_static(args[1:] or None)
    if what in ('ship', 'sprites', 'all'): render_ship(args[1:] or None)
    if what in ('bots', 'sprites', 'all'):
        cols = [a for a in args[1:] if a in BOT_COLORS]; rest = [a for a in args[1:] if a not in BOT_COLORS]
        render_bots(rest or None, cols or None)
    if what in ('post', 'all'):
        import subprocess
        subprocess.run([sys.executable, os.path.join(HERE, 'invasion_post.py')], check=True)
