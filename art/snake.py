# Serpent head sprites: an angular viper head (flat-topped wedge with crisp ridges, brow plates and a hinged jaw)
# with expressive eyes. Every expression is rendered in four facings so the key light always comes from the top-left.
# The body is drawn in the game as a tapered, lit ribbon that follows the head.
# Run: python3 art/snake.py <out_dir> [expr ...] [--dirs r,l,d,u] [--samples N] [--px N] [--threads N]
import bpy, bmesh, sys, os, math, json, addon_utils
from mathutils import Vector, Matrix

addon_utils.enable("cycles", default_set=True)
args = sys.argv[1:]
OUT = args[0] if args else 'assets/snake'
opt = lambda k, d: args[args.index(k) + 1] if k in args else d
DIRS = opt('--dirs', 'r,l').split(',')
SAMPLES = int(opt('--samples', '64'))
ONLY = [a for i, a in enumerate(args[1:], 1) if not a.startswith('--') and not args[i - 1].startswith('--')]
PX, BOX = int(opt('--px', '4')), 44          # px per game unit, square sprite size in game units
u = 0.1                  # one game unit in metres
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
srgb = lambda h: tuple(((int(h[i:i + 2], 16) / 255) ** 2.2) for i in (1, 3, 5))

def mat(name, color, rough=0.3, metal=0.0, coat=0.0, emit=None, es=0.6):
    m = bpy.data.materials.new(name); b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*color, 1); b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal; b.inputs['Coat Weight'].default_value = coat; b.inputs['Coat Roughness'].default_value = 0.1
    if emit: b.inputs['Emission Color'].default_value = (*emit, 1); b.inputs['Emission Strength'].default_value = es
    return m

def skin_mat():
    """Plum scales on top, a peach belly underneath, split by the object-space normal so it holds in every facing."""
    m = mat('skin', srgb('#7a3ccc'), rough=0.3, coat=0.7); nt = m.node_tree; b = nt.nodes['Principled BSDF']
    tc = nt.nodes.new('ShaderNodeTexCoord'); sep = nt.nodes.new('ShaderNodeSeparateXYZ')
    nt.links.new(tc.outputs['Normal'], sep.inputs[0])
    ramp = nt.nodes.new('ShaderNodeValToRGB'); e = ramp.color_ramp.elements
    e[0].position, e[1].position = 0.30, 0.36
    e[0].color = (*srgb('#f6b08a'), 1); e[1].color = (*srgb('#7a3ccc'), 1)
    top = e.new(0.78); top.color = (*srgb('#5a2aa6'), 1)          # darker crown so the brows and eyes pop
    mp = nt.nodes.new('ShaderNodeMapRange'); mp.inputs['From Min'].default_value = -1; mp.inputs['From Max'].default_value = 1
    nt.links.new(sep.outputs['Z'], mp.inputs['Value']); nt.links.new(mp.outputs['Result'], ramp.inputs['Fac'])
    nt.links.new(ramp.outputs['Color'], b.inputs['Base Color'])
    vo = nt.nodes.new('ShaderNodeTexVoronoi'); vo.inputs['Scale'].default_value = 26; vo.feature = 'DISTANCE_TO_EDGE'
    nt.links.new(tc.outputs['Object'], vo.inputs['Vector'])
    bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = 0.12; bp.inputs['Distance'].default_value = 0.004
    nt.links.new(vo.outputs['Distance'], bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    return m

SKIN = skin_mat()
PLATE = mat('plate', srgb('#1e0a40'), rough=0.2, coat=1.0)
BROW = mat('brow', srgb('#ff5fa2'), rough=0.22, coat=1.0, emit=srgb('#ff3f8a'), es=0.15)
LIDSKIN = mat('lidskin', srgb('#6a32b4'), rough=0.3, coat=0.7)
EDGE = mat('edge', srgb('#ff6fae'), rough=0.2, coat=1.0, emit=srgb('#ff4f9a'), es=0.25)
WHITE = mat('eyewhite', srgb('#fff6e8'), rough=0.08, coat=1.0)
IRIS = mat('iris', srgb('#b8f03a'), rough=0.08, coat=1.0, emit=srgb('#9be022'), es=0.5)
PUPIL = mat('pupil', (0.004, 0.002, 0.006), rough=0.05, coat=1.0)
SHINE = mat('shine', (1, 1, 1), rough=0.0, emit=(1, 1, 1), es=4.0)
LIDLINE = mat('lidline', srgb('#1c0838'), rough=0.4)
MOUTH = mat('mouth', srgb('#5a0b26'), rough=0.6)
GUM = mat('gum', srgb('#c23a62'), rough=0.35, coat=0.5)
FANG = mat('fang', srgb('#fffaf0'), rough=0.12, coat=1.0)
TONGUE = mat('tongue', srgb('#ff2f6a'), rough=0.25, coat=0.6)
NOSTRIL = mat('nostril', srgb('#14051f'), rough=0.5)
STAR = mat('star', srgb('#ffe27a'), rough=0.2, emit=srgb('#ffd34a'), es=1.5)

ROOT = bpy.data.objects.new('root', None); sc.collection.objects.link(ROOT)   # facing (direction) rotation
HEAD = bpy.data.objects.new('head', None); sc.collection.objects.link(HEAD); HEAD.parent = ROOT  # yaw toward camera

def link(o, parent=HEAD):
    o.parent = parent; return o

def new_mesh(name, bm, m, smooth=True):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    if smooth:
        for p in me.polygons: p.use_smooth = True
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o)
    if m: o.data.materials.append(m)
    return o

def subsurf(o, lv=2):
    md = o.modifiers.new('ss', 'SUBSURF'); md.levels = md.render_levels = lv; return o

def box_cage(cuts, fn, crease=None):
    """Subdivided cube deformed by fn(x, y, z) with x, y, z in [-1, 1]; crease(v1, v2) picks hard ridge edges."""
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=2)
    bmesh.ops.subdivide_edges(bm, edges=bm.edges[:], cuts=cuts, use_grid_fill=True)
    orig = {v: tuple(v.co) for v in bm.verts}
    if crease:
        cl = bm.edges.layers.float.get('crease_edge') or bm.edges.layers.float.new('crease_edge')
        for e in bm.edges: e[cl] = crease(orig[e.verts[0]], orig[e.verts[1]])
    for v in bm.verts: v.co = Vector(fn(*orig[v]))
    return bm

def lerp_profile(pts, x):
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        if x <= x1:
            t = (x - x0) / (x1 - x0); t = t * t * (3 - 2 * t); return y0 + (y1 - y0) * t
    return pts[-1][1]

# head geometry, in game units: back of the skull at x = -9, snout tip at x = +15
HX0, HX1 = -8.0, 12.0
WIDTH = [(-1, 5.0), (-0.5, 8.0), (0.0, 7.4), (0.5, 5.2), (1, 3.0)]            # half width along the head
TOP = [(-1, 3.4), (-0.5, 5.0), (0.0, 5.4), (0.4, 4.0), (0.8, 2.8), (1, 2.0)] # crown, sloping down to the snout
BOT = [(-1, -2.0), (-0.5, -2.8), (0.3, -1.9), (1, -1.1)]                         # lip line, heavy at the cheeks
hx = lambda x: HX0 + (x + 1) / 2 * (HX1 - HX0)
nx = lambda gx: (gx - HX0) / (HX1 - HX0) * 2 - 1

def skull(x, y, z):
    w = lerp_profile(WIDTH, x); top = lerp_profile(TOP, x); bot = lerp_profile(BOT, x)
    zz = z * top if z > 0 else -z * bot
    yy = y * w * (1 - 0.3 * max(0, z) ** 1.5)          # trapezoid section: a narrower flat crown over broad cheeks
    return (hx(x) * u, yy * u, zz * u)

def jaw_shape(x, y, z):
    w = lerp_profile(WIDTH, x) * 0.9; bot = lerp_profile(BOT, x)
    zt, zb = bot + 0.3, bot - 1.8 * (1 - 0.45 * (x + 1) / 2)
    return (hx(x) * u * (0.96 if x > 0 else 1), y * w * u * (1 - 0.3 * max(0, -z)), (zb + (z + 1) / 2 * (zt - zb)) * u)

ridge = lambda a, b: 0.7 if (a[2] == 1 and b[2] == 1 and abs(a[1]) == 1 and abs(b[1]) == 1) else 0.0
lip = lambda a, b: 0.5 if (a[2] == -1 and b[2] == -1 and abs(a[1]) == 1 and abs(b[1]) == 1) else 0.0
head_obj = link(subsurf(new_mesh('skull', box_cage(4, skull, lambda a, b: max(ridge(a, b), lip(a, b))), SKIN)))
jaw = link(subsurf(new_mesh('jaw', box_cage(3, jaw_shape, lambda a, b: 0.5 if (a[2] == -1 and b[2] == -1 and abs(a[1]) == 1 and abs(b[1]) == 1) else 0), SKIN)))
jaw_pivot = bpy.data.objects.new('jaw_pivot', None); sc.collection.objects.link(jaw_pivot); link(jaw_pivot)
jaw_pivot.location = ((HX0 + 1.2) * u, 0, (BOT[0][1] + 0.2) * u)
jaw.parent = jaw_pivot; jaw.matrix_parent_inverse = Matrix.Translation(-jaw_pivot.location)
# the floor of the mouth rides on the jaw so the open jaw shows a pink mouth, not the jaw's crown

def ellipsoid(name, loc, scale, m, parent=HEAD, seg=24):
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=seg // 2, radius=1)
    o = new_mesh(name, bm, m); o.location = loc; o.scale = scale; o.parent = parent; return o

def tube(name, pts, radius, m, parent=HEAD):
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = radius; cu.bevel_resolution = 3
    cu.use_fill_caps = True
    sp = cu.splines.new('POLY'); sp.points.add(len(pts) - 1)
    for p, c in zip(sp.points, pts): p.co = (*c, 1)
    o = bpy.data.objects.new(name, cu); sc.collection.objects.link(o); o.parent = parent; o.data.materials.append(m); return o

# mouth lining, revealed as the jaw drops
mouth = ellipsoid('mouth', (1.5 * u, 0, -1.9 * u), (8.8 * u, 4.6 * u, 0.4 * u), MOUTH)
floor = ellipsoid('floor', (8.0 * u, 0, 0.05 * u), (7.6 * u, 4.0 * u, 0.3 * u), GUM, jaw_pivot)
gums = ellipsoid('gums', (2.5 * u, 0, -1.6 * u), (8.5 * u, 4.6 * u, 0.25 * u), GUM)
fangs = []
for s in (-1, 1):
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=12, radius1=0.8 * u, radius2=0.04 * u, depth=3.4 * u)
    bmesh.ops.translate(bm, verts=bm.verts, vec=(0, 0, 1.7 * u))   # root at the origin, so a longer fang grows out of the gum
    f = new_mesh('fang', bm, FANG); f.location = (8.07 * u, s * 3.2 * u, -0.87 * u); f.rotation_euler = (0, math.radians(196), 0); f.parent = HEAD; fangs.append(f)
# rows of small hooked teeth along both gums, bared only by the ferocious expressions ('teeth')
teeth = []
def tooth(loc, rot, size, parent):
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=8, radius1=0.42 * u * size, radius2=0.02 * u, depth=1.5 * u * size)
    bmesh.ops.translate(bm, verts=bm.verts, vec=(0, 0, 0.75 * u * size))
    t = new_mesh('tooth', bm, FANG); t.location = loc; t.rotation_euler = rot; t.parent = parent; teeth.append(t)
for s in (-1, 1):
    for a, sz in ((0.30, 0.8), (0.48, 0.95), (0.95, 1.0), (1.12, 0.9), (1.28, 0.8), (1.42, 0.7)):   # upper: skips the fang
        tooth(((2.5 + 8.1 * math.cos(a)) * u, s * 4.3 * math.sin(a) * u, -1.55 * u), (0, math.radians(188), 0), sz, HEAD)
    for a, sz in ((0.25, 0.75), (0.45, 0.9), (0.68, 1.0), (0.9, 0.95), (1.1, 0.85), (1.3, 0.7)):     # lower, on the jaw
        tooth(((8.0 + 7.2 * math.cos(a)) * u, s * 3.7 * math.sin(a) * u, 0.15 * u), (0, math.radians(-8), 0), sz, jaw_pivot)
# forked tongue: a stalk and two prongs, built along +x from its root and scaled out per expression
tongue = bpy.data.objects.new('tongue', None); sc.collection.objects.link(tongue); link(tongue)
tongue.location = (4.5 * u, 0, -1.7 * u)
ellipsoid('stalk', (5 * u, 0, 0), (5.2 * u, 0.6 * u, 0.35 * u), TONGUE, tongue)
for s in (-1, 1):
    pr = ellipsoid('prong', (11.4 * u, s * 0.75 * u, 0.3 * s * u), (2.0 * u, 0.34 * u, 0.28 * u), TONGUE, tongue); pr.rotation_euler.z = math.radians(24 * s)
for s in (-1, 1):
    n = ellipsoid('nostril', (10.6 * u, s * 1.7 * u, 2.1 * u), (0.8 * u, 0.42 * u, 0.32 * u), NOSTRIL); n.rotation_euler.z = math.radians(-25 * s)
# dorsal marking: glossy rose diamonds inlaid down the crown, matching the body pattern
for gx, sz in ((-3.2, 1.9), (-6.2, 1.4)):
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=4, radius1=sz * u, radius2=sz * 0.7 * u, depth=0.6 * u)
    d = new_mesh('mark', bm, EDGE, smooth=False); d.location = (gx * u, 0, (lerp_profile(TOP, nx(gx)) - 0.1) * u)
    d.scale = (1.6, 0.8, 1); d.parent = HEAD
    bv = d.modifiers.new('bv', 'BEVEL'); bv.width = 0.15 * u; bv.segments = 2

# mouth corners: a short crease at the back of the lip line that curls up (smug, grin) or down (hurt, scared)
corners = []
for s in (-1, 1):
    pts = []
    for i in range(9):
        t = i / 8; gx = 2.5 - 6.0 * t; xx = nx(gx)
        pts.append((gx * u, s * (lerp_profile(WIDTH, xx) * 0.9 + 0.05) * u, (lerp_profile(BOT, xx) + 0.55) * u))
    c = tube('corner', pts, 0.42 * u, LIDLINE); c['base'] = [tuple(p) for p in pts]; c['s'] = s; corners.append(c)

def set_corners(k, hide):
    for c in corners:
        sp = c.data.splines[0]
        for i, (p, b) in enumerate(zip(sp.points, c['base'])):
            t = i / 8; p.co = (b[0], b[1], b[2] + k * 2.6 * u * t ** 2, 1)
        c.hide_render = hide

# ---------- eyes: shader-painted iris and slit pupil, a catch light, two lids with a dark rim, and an arched brow ----------
def eye_material():
    m = mat('eyeball', srgb('#fff6e8'), rough=0.06, coat=1.0); nt = m.node_tree; b = nt.nodes['Principled BSDF']; N = nt.nodes; L = nt.links.new
    def M(op, a, bb=None, clamp=False):
        n = N.new('ShaderNodeMath'); n.operation = op; n.use_clamp = clamp
        for i, v in enumerate((a, bb)):
            if v is None: continue
            if isinstance(v, (int, float)): n.inputs[i].default_value = v
            else: L(v, n.inputs[i])
        return n.outputs[0]
    def V(name, v):
        n = N.new('ShaderNodeValue'); n.name = name; n.outputs[0].default_value = v; return n.outputs[0]
    tc = N.new('ShaderNodeTexCoord'); sep = N.new('ShaderNodeSeparateXYZ'); L(tc.outputs['Object'], sep.inputs[0])
    x, y, z = sep.outputs['X'], sep.outputs['Y'], sep.outputs['Z']
    r = M('SQRT', M('ADD', M('MULTIPLY', x, x), M('MULTIPLY', y, y)))
    front = M('GREATER_THAN', z, 0.0)
    pw, ph, spf = V('pw', 0.14), V('ph', 0.5), V('spiral', 0.0)
    iris = M('MULTIPLY', M('LESS_THAN', r, 0.66), front)
    pq = M('ADD', M('POWER', M('DIVIDE', x, pw), 2.0), M('POWER', M('DIVIDE', y, ph), 2.0))
    pupil = M('MULTIPLY', M('LESS_THAN', pq, 1.0), iris)
    # iris colour: bright lime centre to a deep green limbal ring
    ramp = N.new('ShaderNodeValToRGB'); e = ramp.color_ramp.elements
    e[0].position, e[0].color = 0.0, (*srgb('#e8ff7a'), 1); e[1].position, e[1].color = 0.62, (*srgb('#7fcf1a'), 1)
    ring = e.new(0.86); ring.color = (*srgb('#1f4a08'), 1)
    L(M('DIVIDE', r, 0.66), ramp.inputs['Fac'])
    # rage: the iris burns from lime to a molten amber with a blood-red ring, and glows hotter
    hot = N.new('ShaderNodeValToRGB'); e = hot.color_ramp.elements
    e[0].position, e[0].color = 0.0, (*srgb('#fff36a'), 1); e[1].position, e[1].color = 0.55, (*srgb('#ffa21a'), 1)
    e.new(0.86).color = (*srgb('#8a0a06'), 1)
    L(M('DIVIDE', r, 0.66), hot.inputs['Fac'])
    rage = V('rage', 0.0)
    # dizzy spiral: fract(angle / tau + r * 2.6)
    ang = M('DIVIDE', M('ARCTAN2', y, x), 6.2832)
    spiral = M('MULTIPLY', M('LESS_THAN', M('FRACT', M('ADD', ang, M('MULTIPLY', r, 2.6))), 0.42), M('MULTIPLY', front, M('LESS_THAN', r, 0.85)))
    def mix(fac, a, bb):
        n = N.new('ShaderNodeMix'); n.data_type = 'RGBA'; L(fac, n.inputs[0])
        for sock, v in ((n.inputs[6], a), (n.inputs[7], bb)):
            if isinstance(v, tuple): sock.default_value = v
            else: L(v, sock)
        return n.outputs[2]
    no_sp = M('SUBTRACT', 1.0, spf)
    icol = mix(rage, ramp.outputs['Color'], hot.outputs['Color'])
    rim = M('MULTIPLY', rage, M('POWER', M('MINIMUM', r, 1.0), 3.0))          # bloodshot toward the edge of the eyeball
    white = mix(M('MULTIPLY', rim, 0.55), (*srgb('#fff6e8'), 1), (*srgb('#ff6a5a'), 1))
    c1 = mix(M('MULTIPLY', iris, no_sp), white, icol)
    c2 = mix(M('MULTIPLY', pupil, no_sp), c1, (0.004, 0.002, 0.006, 1))
    c3 = mix(M('MULTIPLY', spiral, spf), c2, (*srgb('#2a0f55'), 1))
    L(c3, b.inputs['Base Color'])
    em = mix(M('MULTIPLY', M('SUBTRACT', iris, pupil), no_sp), (0, 0, 0, 1), icol)
    L(em, b.inputs['Emission Color']); L(M('ADD', 0.35, M('MULTIPLY', rage, 1.1)), b.inputs['Emission Strength'])
    return m
EYE = eye_material()

class Eye:
    R = 3.6
    def __init__(self, side):
        self.side = side; R = self.R
        ex = 1.0; xx = nx(ex)
        piv = bpy.data.objects.new('eye', None); sc.collection.objects.link(piv); link(piv)
        piv.location = (ex * u, side * lerp_profile(WIDTH, xx) * 0.5 * u, 3.9 * u)
        # local +Z looks out of the eye: sideways, a little forward and up; local +Y is the eye's "up"
        out = Vector((0.35, side * 1.0, 0.75)).normalized(); up = Vector((0, 0, 1)); up = (up - out * up.dot(out)).normalized()
        xa = up.cross(out); piv.rotation_euler = Matrix((xa, up, out)).transposed().to_euler()
        self.piv = piv
        self.ball = ellipsoid('ball', (0, 0, 0), (R * u,) * 3, EYE, piv, seg=48)
        self.shine = ellipsoid('shine', (-R * 0.32 * u, R * 0.38 * u, R * 0.97 * u), (R * 0.17 * u, R * 0.17 * u, R * 0.06 * u), SHINE, piv, seg=12)
        self.shine2 = ellipsoid('shine', (R * 0.3 * u, -R * 0.3 * u, R * 0.98 * u), (R * 0.07 * u, R * 0.07 * u, R * 0.03 * u), SHINE, piv, seg=8)
        self.lids = [self.make_lid(piv, R, +1), self.make_lid(piv, R, -1)]
        # brow: an arched, tapering plate sitting on the crown edge above the eye
        def arch(x, y, z):
            t = (x + 1) / 2
            return (x * 3.9, y * (1.5 - 0.6 * t), z * (0.75 - 0.3 * t) - 0.8 * x * x + 0.3)
        brow = new_mesh('brow', box_cage(3, arch, lambda a, b: 0.6 if (abs(a[1]) == 1 and abs(b[1]) == 1) else 0), BROW)
        subsurf(brow, 2); brow.parent = HEAD; brow.scale = (u, u, u)
        self.brow = brow; self.brow_base = Vector(((ex + 0.3) * u, side * lerp_profile(WIDTH, xx) * 0.46 * u, (3.9 + R * 0.92) * u))

    def make_lid(self, piv, R, s):
        bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=48, v_segments=24, radius=R * 1.1 * u)
        bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.y * s < -1e-5], context='VERTS')   # keep the half on the lid's side
        lid = new_mesh('lid', bm, LIDSKIN); lid.parent = piv; lid.data.materials.append(LIDLINE)
        so = lid.modifiers.new('so', 'SOLIDIFY'); so.thickness = 0.12 * R * u; so.material_offset_rim = 1; so.use_rim = True
        lid['s'] = s; return lid

    def set(self, top=0.0, bot=0.0, look=(0, 0), pupil=1.0, slit=1.0, brow=0.0, raise_=0.0, spiral=False, slant=0.0, rage=0.0, hood=0.0):
        # slant > 0 tips the upper lid down toward the snout (a glare), the lower lid half as much the other way;
        # hood > 0 pulls the brow plate out and down over the eyeball, rolled outward, so it overhangs the eye
        # lids rotate about the eye's local X: 0 = folded back (open), 1 = meeting across the middle
        for lid in self.lids:
            s = lid['s']; amt = top if s > 0 else bot
            h = max(-1.0, min(1.0, 1 - amt))   # where the lid edge crosses the front of the eye, in eye radii
            sl = math.radians(slant) * self.side * (1.0 if s > 0 else 0.5)
            lid.rotation_euler = (-s * (math.asin(h) + math.radians(18) * h), 0, sl)
        lx, ly = look   # look by turning the eyeball; the catch lights stay put
        self.ball.rotation_euler = (math.radians(-ly * 30), math.radians(lx * 30), 0)
        nt = EYE.node_tree.nodes
        nt['pw'].outputs[0].default_value = 0.14 * pupil * slit; nt['ph'].outputs[0].default_value = 0.52 * pupil
        nt['spiral'].outputs[0].default_value = 1.0 if spiral else 0.0
        nt['rage'].outputs[0].default_value = rage
        for o in (self.shine, self.shine2): o.hide_render = top + bot > 1.4
        # brow: positive tilts the snout end down (anger), negative lifts it (worry, fear)
        self.brow.location = self.brow_base + Vector((0.5 * hood, self.side * 1.9 * hood, raise_ * 1.3 - 0.9 * hood)) * u
        self.brow.rotation_euler = (math.radians(self.side * -(14 + 24 * hood)), math.radians(brow), math.radians(self.side * 6))

eyes = [Eye(-1), Eye(1)]

# dizzy stars orbit the head when stunned
stars = []
for i in range(3):
    bm = bmesh.new(); pts = []
    for k in range(10):
        r = (1.0 if k % 2 == 0 else 0.45) * 1.5 * u; a = k / 10 * math.tau
        pts.append(bm.verts.new((math.cos(a) * r, 0, math.sin(a) * r)))
    bm.faces.new(pts); bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=0.5 * u)
    s = new_mesh('star', bm, STAR, smooth=False); stars.append(s)

# ---------- expressions ----------
EXPR = {
    'idle':   dict(jaw=0.0, corner=0.6, eye=dict(top=0.6, bot=0.1, brow=-4, raise_=0.3, look=(0.3, 0))),             # smug, half-lidded
    'blink':  dict(jaw=0.0, corner=0.7, eye=dict(top=1.05, bot=1.0, brow=10)),
    'taste':  dict(jaw=0.06, corner=0.5, tongue=1.0, eye=dict(top=0.32, bot=0.15, brow=14, look=(0.5, 0.1))),  # tongue flick
    'hunt':   dict(jaw=0.0, corner=-0.1, eye=dict(top=0.56, bot=0.42, slant=24, brow=26, raise_=-0.35, hood=0.35, slit=0.32, rage=0.45, look=(0.7, -0.3))),  # glaring at its prey
    'chew0':  dict(jaw=0.35, eye=dict(top=0.36, bot=0.35, brow=36, raise_=-0.2, slit=0.6, look=(0.5, -0.2))),
    'chew1':  dict(jaw=0.8, eye=dict(top=0.3, bot=0.42, brow=40, raise_=-0.2, slit=0.55, look=(0.5, -0.2))),
    'hiss':   dict(jaw=1.0, tongue=1.0, fangs=True, eye=dict(top=0.0, bot=0.1, brow=44, slit=0.4, raise_=0.1, look=(0.4, 0))),
    'ouch':   dict(jaw=0.22, corner=-1.0, eye=dict(top=1.08, bot=1.0, brow=-34, raise_=0.6)),               # squeezed shut
    'dizzy':  dict(jaw=0.4, tongue=0.8, droop=48, eye=dict(top=0.12, bot=0.05, brow=-14, raise_=0.3, spiral=True), stars=True),
    'shock':  dict(jaw=0.5, eye=dict(top=0.0, bot=0.0, brow=-36, raise_=1.4, pupil=0.6, slit=2.6)),        # bricks coming down on it
    # biting through bricks, closing on her: lips drawn back off every tooth, a low glare with burning eyes
    'snarl':  dict(jaw=0.5, fang=1.45, teeth=True, eye=dict(top=0.56, bot=0.5, slant=28, brow=26, raise_=-0.35, hood=0.35, slit=0.3, rage=0.8, look=(0.7, -0.2))),
    # the strike: jaws wide, fangs out, eyes blown wide and blazing under furious brows
    'strike': dict(jaw=1.25, fang=1.7, teeth=True, eye=dict(top=0.14, bot=0.04, slant=18, brow=34, raise_=-0.1, hood=0.3, pupil=0.62, slit=0.45, rage=1.0, look=(0.8, 0))),
    'grin':   dict(jaw=0.0, corner=1.4, tongue=0.0, eye=dict(top=0.35, bot=0.62, brow=30, slit=0.45, look=(0.5, -0.2))),  # it reached her
}

def pose(name, t=0.0):
    e = EXPR[name]; jw = e.get('jaw', 0)
    jaw_pivot.rotation_euler = (0, math.radians(30 * jw), 0)
    mouth.scale = (8.8 * u, 4.6 * u, (0.35 + 2.6 * jw) * u); mouth.location = (1.5 * u, 0, (-1.9 - 1.3 * jw) * u)
    fl = e.get('fang', 1.0)
    for f in fangs: f.hide_render = jw < 0.3; f.scale = (fl ** 0.5, fl ** 0.5, fl)
    for t in teeth: t.hide_render = jw < 0.3 or not e.get('teeth')
    tg = e.get('tongue', 0.0)
    for o in tongue.children: o.hide_render = tg <= 0
    tongue.scale = (max(0.01, tg), 1, 1); tongue.rotation_euler = (0, math.radians(e.get('droop', 6 + 22 * jw)), 0)
    set_corners(e.get('corner', 0.0), jw > 0.3)
    for ey in eyes: ey.set(**e['eye'])
    for i, s in enumerate(stars):
        s.hide_render = not e.get('stars')
        a = i / 3 * math.tau + 0.4
        s.location = (math.cos(a) * 9 * u, math.sin(a) * 9 * u, 8 * u); s.rotation_euler = (0, 0, a)

# ---------- lights and camera: the same rig as the tower ----------
def area(loc, rot, energy, size, color):
    bpy.ops.object.light_add(type='AREA', location=loc, rotation=rot)
    l = bpy.context.object.data; l.energy = energy; l.size = size; l.color = color
area((-20, -9, 34), (math.radians(20), math.radians(-30), 0), 40000, 10, (1.0, 0.9, 0.8))
area((0, -30, 3), (math.radians(90), 0, 0), 1700, 16, (1.0, 0.95, 0.95))
area((30, -25, -5), (math.radians(85), math.radians(50), 0), 4000, 14, (0.55, 0.65, 1.0))
area((8, 20, 8), (math.radians(-70), 0, 0), 6000, 10, (0.8, 0.85, 1.0))
w = bpy.data.worlds.new('w'); sc.world = w; w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.05, 0.04, 0.09, 1)
TILT = 0.35
bpy.ops.object.camera_add(location=(0, -40 * math.cos(TILT), 40 * math.sin(TILT)), rotation=(math.radians(90) - TILT, 0, 0))
cam = bpy.context.object; sc.camera = cam; cam.data.type = 'ORTHO'; cam.data.ortho_scale = BOX * u
sc.render.engine = 'CYCLES'; sc.cycles.samples = SAMPLES; sc.cycles.use_denoising = True
if '--threads' in args: sc.render.threads_mode = 'FIXED'; sc.render.threads = int(opt('--threads', '0'))
sc.render.resolution_x = sc.render.resolution_y = BOX * PX; sc.render.film_transparent = True
sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast'

# facings: r / l = snout to screen right / left; rd, ld = nosing down 60 degrees; ru, lu = nosing up 45 degrees.
# The head always turns a little toward the camera so both eyes read; the game rotates the nearest one the last few degrees.
P = math.pi
FACING = {'r': ((0, 0, 0), -36), 'l': ((0, 0, P), 36), 'rd': ((0, P / 3, 0), -36), 'ld': ((0, P / 3, P), 36),
          'ru': ((0, -P / 4, 0), -36), 'lu': ((0, -P / 4, P), 36)}
os.makedirs(OUT, exist_ok=True)
names = ONLY or list(EXPR)
for d in DIRS:
    rot, yaw = FACING[d]
    ROOT.rotation_euler = rot; HEAD.rotation_euler = (0, 0, math.radians(yaw))
    for n in names:
        pose(n); sc.render.filepath = os.path.join(OUT, f'head_{n}_{d}.png'); bpy.ops.render.render(write_still=True)
json.dump({'px': PX, 'box': BOX, 'expressions': list(EXPR), 'dirs': DIRS}, open(os.path.join(OUT, 'meta.json'), 'w'))
print('done')
