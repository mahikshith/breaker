"""Nerra v2: the crab queen of Tidewheel Citadel as a glossy vinyl toy (model, rig and pose API).

Built entirely from code with bpy 5.2 (no .blend checked in). The character faces -Y; screen-left is -X; Z is up; the
ground point under her body is the world origin (the sprite pivot). 1 Blender unit (BU) is GAME_UNITS_PER_BU game units.

Rig: a hierarchy of empties ("rig.*") with rigid exoskeleton parts parented to them, which is how a crab is built: every
segment is a hard shell joined by a black pearl joint, so nothing needs skin weights. Legs are posed with a two-bone IK
solved in Python (feet stay planted on the ground), eyes, lids and brows have their own pivots, the mouth is one of several
boolean-carved face plates, and the root carries the squash and stretch.

Used by render.py; `build()` returns a Rig whose `pose(**params)` sets one frame.
"""
import math, random
import bpy, bmesh
from mathutils import Vector, Matrix, Euler

def srgb(h):
    """'#rrggbb' -> linear RGBA (Blender colour inputs are scene-linear)."""
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4 for x in c) + (1.0,)

def lerp(a, b, t): return tuple(x + (y - x) * t for x, y in zip(a, b))
def smooth(t): t = max(0., min(1., t)); return t * t * (3 - 2 * t)

PAL = {k: srgb(v) for k, v in dict(
    coral='#E8443A', coral_hi='#FF7A5E', oxblood='#7E1628', oxblood_dk='#4C0A17', cream='#F6DDBA', cream_dk='#E2B48E',
    pearl='#17121D', stone='#A39C9A', stone_dk='#6E6669', roof='#B3263A', flag='#D42E40', sclera='#F7F4EF', iris='#14C6CC',
    iris_dk='#0B5E68', mouth='#4E0815', tongue='#EE6A80', tooth='#FFF6E8', barnacle='#EED9C0', window='#FFB45E', moss='#5E7A4A',
    tip='#3A0F18', under='#F2A884', wine='#62091F', wine_dk='#22030C', band='#F2775C').items()}

# ---------------------------------------------------------------- scene helpers
COLL = None

def link(ob):
    COLL.objects.link(ob); return ob

def empty(name, parent=None, loc=(0, 0, 0), rot=(0, 0, 0)):
    ob = link(bpy.data.objects.new('rig.' + name, None)); ob.empty_display_size = .05
    ob.parent = parent; ob.location = loc; ob.rotation_euler = rot; return ob

def mesh_ob(name, bm, mat, parent, colour=None, smooth_shade=True):
    """bmesh -> object (identity transform under `parent`). `colour(v_co)` fills the 'col' attribute (per vertex)."""
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    if smooth_shade: me.shade_smooth()
    if colour:
        ca = me.color_attributes.new('col', 'FLOAT_COLOR', 'POINT')
        for i, v in enumerate(me.vertices): ca.data[i].color = colour(v.co)
    me.materials.append(mat)
    ob = link(bpy.data.objects.new(name, me)); ob.parent = parent; return ob

def solid_colour(c): return lambda co: c

def bm_sphere(center, radii, seg=48, rings=24, rot=None):
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=rings, radius=1.0)
    m = Matrix.Diagonal(Vector(radii)).to_4x4()
    if rot: m = rot.to_4x4() @ m
    bmesh.ops.transform(bm, matrix=Matrix.Translation(Vector(center)) @ m, verts=bm.verts); return bm

def bm_lathe(profile, seg=32, bend=None, squash=(1., 1.)):
    """Solid of revolution along local +X. profile: [(x, r)], first and last r may be 0 (closed tips) or the ends get caps.
    bend(x) -> (dy, dz) offsets the axis (curved fingers, tapered horns). squash scales the cross-section (y, z)."""
    bm = bmesh.new(); rings = []
    for x, r in profile:
        dy, dz = bend(x) if bend else (0, 0)
        if r <= 1e-6: rings.append([bm.verts.new((x, dy, dz))]); continue
        rings.append([bm.verts.new((x, dy + r * squash[0] * math.cos(a), dz + r * squash[1] * math.sin(a)))
                      for a in (2 * math.pi * i / seg for i in range(seg))])
    for a, b in zip(rings, rings[1:]):
        if len(a) == 1 and len(b) == 1: continue
        if len(a) == 1: [bm.faces.new((a[0], b[(i + 1) % seg], b[i])) for i in range(seg)]
        elif len(b) == 1: [bm.faces.new((a[i], a[(i + 1) % seg], b[0])) for i in range(seg)]
        else: [bm.faces.new((a[i], a[(i + 1) % seg], b[(i + 1) % seg], b[i])) for i in range(seg)]
    if len(rings[0]) > 1: bm.faces.new(list(reversed(rings[0])))
    if len(rings[-1]) > 1: bm.faces.new(rings[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces); return bm

def round_profile(length, r0, r1, n=14, cap0=True, cap1=True, bulge=0.):
    """Capsule-like profile from x=0 to x=length, radius r0 -> r1, rounded ends; `bulge` fattens the middle."""
    pts = []
    if cap0:
        for i in range(n // 2 + 1):
            a = math.pi / 2 * (1 - i / (n // 2)); pts.append((r0 * (1 - math.cos(a)) - r0 * 0, r0 * math.sin(math.pi / 2 - a) if i else 0.))
        pts = [(x - r0 * 0, r) for x, r in pts]
    mid = [(length * t, r0 + (r1 - r0) * t + bulge * math.sin(math.pi * t)) for t in (j / n for j in range(1, n))]
    pts += mid
    if cap1:
        for i in range(n // 2 + 1):
            a = math.pi / 2 * i / (n // 2); pts.append((length + r1 * math.sin(a) - 0, r1 * math.cos(a) if i < n // 2 else 0.))
    return pts

def transform_bm(bm, m): bmesh.ops.transform(bm, matrix=m, verts=bm.verts); return bm

def look_rot(direction, up=Vector((0, 0, 1))):
    """Rotation matrix taking local +X to `direction` (with local +Z as close to `up` as possible)."""
    x = Vector(direction).normalized(); y = up.cross(x)
    if y.length < 1e-6: y = Vector((0, 1, 0)).cross(x)
    y.normalize(); z = x.cross(y)
    return Matrix((x, y, z)).transposed()

# ---------------------------------------------------------------- materials
def principled(name, base=None, rough=.3, coat=1., coat_rough=.04, attr=False, metallic=0., emission=None, spec=.5, bump=0.):
    m = bpy.data.materials.new(name); nt = m.node_tree
    p = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    if bump:   # crab-shell tubercles: soft Voronoi dimples under the clear coat (the coat stays mirror-smooth)
        tc = nt.nodes.new('ShaderNodeTexCoord'); vo = nt.nodes.new('ShaderNodeTexVoronoi'); vo.feature = 'F1'
        vo.inputs['Scale'].default_value = 24.; nt.links.new(tc.outputs['Object'], vo.inputs['Vector'])
        bu = nt.nodes.new('ShaderNodeBump'); bu.inputs['Strength'].default_value = bump; bu.inputs['Distance'].default_value = .02
        nt.links.new(vo.outputs['Distance'], bu.inputs['Height']); nt.links.new(bu.outputs['Normal'], p.inputs['Normal'])
    p.inputs['Roughness'].default_value = rough; p.inputs['Metallic'].default_value = metallic
    p.inputs['Coat Weight'].default_value = coat; p.inputs['Coat Roughness'].default_value = coat_rough
    p.inputs['Specular IOR Level'].default_value = spec
    if base: p.inputs['Base Color'].default_value = base
    if attr:
        a = nt.nodes.new('ShaderNodeAttribute'); a.attribute_name = 'col'
        nt.links.new(a.outputs['Color'], p.inputs['Base Color'])
        if bump:   # the same tubercles tint the colour a touch darker at their centres (speckled crab shell)
            mr = nt.nodes.new('ShaderNodeMapRange'); mr.inputs['From Max'].default_value = .45; mr.inputs['To Min'].default_value = .9
            nt.links.new(vo.outputs['Distance'], mr.inputs['Value'])
            mx = nt.nodes.new('ShaderNodeMix'); mx.data_type = 'RGBA'; mx.blend_type = 'MULTIPLY'; mx.inputs[0].default_value = 1.
            nt.links.new(a.outputs['Color'], mx.inputs[6]); nt.links.new(mr.outputs[0], mx.inputs[7]); nt.links.new(mx.outputs[2], p.inputs['Base Color'])
    if emission:
        p.inputs['Emission Color'].default_value = emission[0]; p.inputs['Emission Strength'].default_value = emission[1]
    return m, p

def crab_material(name, seams=7., pits=.3, speckle=.45, fine=.5, ao=.55, rough=.32, coat_rough=.05, seam_dark=.42):
    """Glossy crab exoskeleton: the vertex colour is broken up by plate seams (Voronoi edges, darkened and grooved), small
    scale texture, pits and dark speckles, and crevice ambient occlusion; all of it lives in the base layer, while the clear
    coat keeps a smooth normal, which is what gives the thick vinyl gloss over a detailed surface."""
    m, p = principled(name, rough=rough, coat=1., coat_rough=coat_rough, attr=True); nt = m.node_tree; L = nt.links
    def node(t, **kw):
        n = nt.nodes.new(t)
        for k, v in kw.items():
            if k in n.inputs: n.inputs[k].default_value = v
            else: setattr(n, k, v)
        return n
    a = next(n for n in nt.nodes if n.type == 'ATTRIBUTE'); tc = node('ShaderNodeTexCoord'); co = tc.outputs['Object']
    v1 = node('ShaderNodeTexVoronoi', feature='DISTANCE_TO_EDGE', Scale=seams); L.new(co, v1.inputs['Vector'])
    seam = node('ShaderNodeMapRange', **{'From Max': .05}); L.new(v1.outputs['Distance'], seam.inputs['Value'])          # 0 on a seam
    v2 = node('ShaderNodeTexVoronoi', feature='F1', Scale=seams * 4.5); L.new(co, v2.inputs['Vector'])                       # fine scales
    v3 = node('ShaderNodeTexVoronoi', feature='F1', Scale=seams * 5.5); L.new(co, v3.inputs['Vector'])                    # speckles
    spd = node('ShaderNodeMapRange', **{'From Min': .05, 'From Max': .13, 'To Min': 1., 'To Max': 0.}); L.new(v3.outputs['Distance'], spd.inputs['Value'])
    sel = node('ShaderNodeSeparateColor'); L.new(v3.outputs['Color'], sel.inputs[0])
    gate = node('ShaderNodeMath', operation='GREATER_THAN'); gate.inputs[1].default_value = .55; L.new(sel.outputs[0], gate.inputs[0])
    spk = node('ShaderNodeMath', operation='MULTIPLY'); L.new(spd.outputs[0], spk.inputs[0]); L.new(gate.outputs[0], spk.inputs[1])
    nz = node('ShaderNodeTexNoise', Scale=seams * 4, Detail=2.); L.new(co, nz.inputs['Vector'])
    pit = node('ShaderNodeMapRange', **{'From Min': .6, 'From Max': .68}); L.new(nz.outputs['Fac'], pit.inputs['Value'])   # 1 inside a pit
    # height: grooves on seams, domed scales, sunken pits
    h1 = node('ShaderNodeMath', operation='MULTIPLY'); h1.inputs[1].default_value = -fine * .5; L.new(v2.outputs['Distance'], h1.inputs[0])
    h2 = node('ShaderNodeMath', operation='MULTIPLY'); h2.inputs[1].default_value = -pits * .6; L.new(pit.outputs[0], h2.inputs[0])
    h3 = node('ShaderNodeMath', operation='ADD'); L.new(seam.outputs[0], h3.inputs[0]); L.new(h1.outputs[0], h3.inputs[1])
    h4 = node('ShaderNodeMath', operation='ADD'); L.new(h3.outputs[0], h4.inputs[0]); L.new(h2.outputs[0], h4.inputs[1])
    bu = node('ShaderNodeBump', Strength=.45, Distance=.012); L.new(h4.outputs[0], bu.inputs['Height']); L.new(bu.outputs['Normal'], p.inputs['Normal'])
    # colour: seams and pits darker, speckles dark oxblood, crevice AO
    sd = node('ShaderNodeMapRange', **{'To Min': seam_dark}); L.new(v1.outputs['Distance'], sd.inputs['Value']); sd.inputs['From Max'].default_value = .06
    pd = node('ShaderNodeMapRange', **{'To Min': 1., 'To Max': 1 - pits * .8}); L.new(pit.outputs[0], pd.inputs['Value'])
    k0 = node('ShaderNodeMath', operation='MULTIPLY'); L.new(sd.outputs[0], k0.inputs[0]); L.new(pd.outputs[0], k0.inputs[1])
    dome = node('ShaderNodeMapRange', **{'From Max': .55, 'To Min': 1.12, 'To Max': .8}); L.new(v2.outputs['Distance'], dome.inputs['Value'])   # tubercle tops catch light
    k1 = node('ShaderNodeMath', operation='MULTIPLY'); L.new(k0.outputs[0], k1.inputs[0]); L.new(dome.outputs[0], k1.inputs[1])
    aon = node('ShaderNodeAmbientOcclusion', samples=8, Distance=.14); L.new(a.outputs['Color'], aon.inputs['Color'])
    aod = node('ShaderNodeMapRange', **{'To Min': 1 - ao}); L.new(aon.outputs['AO'], aod.inputs['Value'])
    k2 = node('ShaderNodeMath', operation='MULTIPLY'); L.new(k1.outputs[0], k2.inputs[0]); L.new(aod.outputs[0], k2.inputs[1])
    c1 = node('ShaderNodeMix', data_type='RGBA', blend_type='MULTIPLY'); c1.inputs[0].default_value = 1.
    L.new(a.outputs['Color'], c1.inputs[6]); L.new(k2.outputs[0], c1.inputs[7])
    c2 = node('ShaderNodeMix', data_type='RGBA'); c2.inputs[7].default_value = PAL['oxblood_dk']
    sk = node('ShaderNodeMath', operation='MULTIPLY'); sk.inputs[1].default_value = speckle; L.new(spk.outputs[0], sk.inputs[0])
    L.new(sk.outputs[0], c2.inputs[0]); L.new(c1.outputs[2], c2.inputs[6]); L.new(c2.outputs[2], p.inputs['Base Color'])
    return m

def torus_bm(R_, r, seg=24, rseg=10):
    bm = bmesh.new(); rings = []
    for i in range(seg):
        u = 2 * math.pi * i / seg; cu, su = math.cos(u), math.sin(u)
        rings.append([bm.verts.new(((R_ + r * math.cos(v)) * cu, (R_ + r * math.cos(v)) * su, r * math.sin(v))) for v in (2 * math.pi * j / rseg for j in range(rseg))])
    for i in range(seg):
        a, b = rings[i], rings[(i + 1) % seg]
        for j in range(rseg): bm.faces.new((a[j], b[j], b[(j + 1) % rseg], a[(j + 1) % rseg]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces); return bm

def merge_bms(parts):
    """Join several bmeshes into one (one object per cluster keeps the object count sane)."""
    out = bmesh.new()
    for b in parts:
        me = bpy.data.meshes.new('tmp'); b.to_mesh(me); b.free(); out.from_mesh(me); bpy.data.meshes.remove(me)
    return out

def merged_ob(name, parts, mat, parent):
    """Many small parts as one object. parts: [(bm_local, matrix, colour(co_local))]; colours are worked out in each
    part's own space (so a spike can darken toward its own tip), then the part is moved into place."""
    cols, bms = {}, []
    for bm, m, colfn in parts:
        for v in bm.verts:
            c = colfn(v.co); v.co = m @ v.co; cols[tuple(round(x, 5) for x in v.co)] = c
        bms.append(bm)
    return mesh_ob(name, merge_bms(bms), mat, parent, lambda co: cols.get(tuple(round(x, 5) for x in co), (1, 0, 1, 1)))

def spike_bm(r, h, seg=12, hook=0.):
    """A horn along local +X: fat base, sharp tip, optionally hooked toward +Z."""
    return bm_lathe([(0, r), (h * .3, r * .8), (h * .65, r * .42), (h, 0)], seg=seg, bend=(lambda x: (0, hook * (x / h) ** 2)) if hook else None)

def ell_frame(c, rad, el, az, out=0.):
    """Point on an ellipsoid (centre c, radii rad) at elevation/azimuth (deg, az 0 = front -Y, + = toward +X), its outward
    normal and the azimuthal tangent."""
    e, a = math.radians(el), math.radians(az)
    q = Vector((math.cos(e) * math.sin(a), -math.cos(e) * math.cos(a), math.sin(e)))
    p = Vector(c) + Vector((rad[0] * q.x, rad[1] * q.y, rad[2] * q.z))
    n = Vector((q.x / rad[0], q.y / rad[1], q.z / rad[2])).normalized()
    t = Vector((rad[0] * math.cos(a), rad[1] * math.sin(a), 0)).normalized()
    return p + n * out, n, t

def barnacle_bm(points, rnd, size=.04, placed=None):
    """A cluster of little barnacle cups (cone with a dark sunken mouth) standing on the surface points [(pos, normal)]."""
    parts = []; placed = [] if placed is None else placed   # pass one list to several clusters so no two cups ever coincide
    for pos, n in points:
        if any((Vector(pos) - q).length < size * 1.9 for q in placed): continue
        placed.append(Vector(pos))
        r = size * rnd.uniform(.6, 1.15); h = r * rnd.uniform(.9, 1.3)
        b = bm_lathe([(0, r), (h * .55, r * .8), (h, r * .52), (h * .93, r * .36), (h * .45, 0)], seg=14)
        transform_bm(b, Matrix.Translation(Vector(pos) - Vector(n).normalized() * r * .35) @ look_rot(Vector(n)).to_4x4()); parts.append(b)
    return merge_bms(parts)

def eye_material(name):
    """Glossy eyeball whose iris and pupil are drawn in the eye's object space around local -Y (so they turn with the eye).
    Values exposed for posing: 'iris' and 'pupil' (cosine thresholds) and 'spiral' (0/1, dizzy eyes)."""
    m, p = principled(name, rough=.12, coat=1., coat_rough=.015); nt = m.node_tree; L = nt.links
    def node(t, **kw):
        n = nt.nodes.new(t)
        for k, v in kw.items(): setattr(n, k, v)
        return n
    tc = node('ShaderNodeTexCoord'); norm = node('ShaderNodeVectorMath', operation='NORMALIZE'); L.new(tc.outputs['Object'], norm.inputs[0])
    sep = node('ShaderNodeSeparateXYZ'); L.new(norm.outputs[0], sep.inputs[0])
    fwd = node('ShaderNodeMath', operation='MULTIPLY'); fwd.inputs[1].default_value = -1; L.new(sep.outputs['Y'], fwd.inputs[0])
    vals = {}
    for key, v in (('iris', .80), ('pupil', .945), ('spiral', 0.), ('blood', 0.)):
        n = node('ShaderNodeValue', label=key, name=key); n.outputs[0].default_value = v; vals[key] = n
    # slit pupil: the pupil is measured on the eye direction squeezed sideways, so it is a tall predatory slit
    sq = node('ShaderNodeVectorMath', operation='MULTIPLY'); sq.inputs[1].default_value = (2.6, 1., 1.); L.new(tc.outputs['Object'], sq.inputs[0])
    sqn = node('ShaderNodeVectorMath', operation='NORMALIZE'); L.new(sq.outputs[0], sqn.inputs[0])
    sqs = node('ShaderNodeSeparateXYZ'); L.new(sqn.outputs[0], sqs.inputs[0])
    fwd_p = node('ShaderNodeMath', operation='MULTIPLY'); fwd_p.inputs[1].default_value = -1; L.new(sqs.outputs['Y'], fwd_p.inputs[0])
    def step(edge, soft=.012, src=None):     # smooth step of fwd (or src) across `edge`
        a = node('ShaderNodeMath', operation='SUBTRACT'); L.new((src or fwd).outputs[0], a.inputs[0]); L.new(edge, a.inputs[1])
        b = node('ShaderNodeMapRange', clamp=True); b.inputs['From Min'].default_value = -soft; b.inputs['From Max'].default_value = soft
        L.new(a.outputs[0], b.inputs['Value']); return b.outputs[0]
    iris_m = step(vals['iris'].outputs[0]); pupil_m = step(vals['pupil'].outputs[0], .008, fwd_p)
    limbal = node('ShaderNodeMath', operation='ADD'); limbal.inputs[1].default_value = .035; L.new(vals['iris'].outputs[0], limbal.inputs[0])
    inner = step(limbal.outputs[0], .03)
    # Iris: darker ring at the rim, brighter lower half (light pools in the bottom of a glossy eye)
    zgrad = node('ShaderNodeMapRange', clamp=True); zgrad.inputs['From Min'].default_value = .3; zgrad.inputs['From Max'].default_value = -.35
    L.new(sep.outputs['Z'], zgrad.inputs['Value'])
    irisc = node('ShaderNodeMix', data_type='RGBA'); irisc.inputs[6].default_value = PAL['iris_dk']; irisc.inputs[7].default_value = lerp(PAL['iris'], (1, 1, 1, 1), .25)
    L.new(zgrad.outputs[0], irisc.inputs[0])
    ring = node('ShaderNodeMix', data_type='RGBA'); ring.inputs[6].default_value = PAL['iris_dk']; L.new(inner, ring.inputs[0]); L.new(irisc.outputs[2], ring.inputs[7])
    # Dizzy spiral: bands of atan2 + radius in the iris disc
    ax = node('ShaderNodeMath', operation='ARCTAN2'); L.new(sep.outputs['Z'], ax.inputs[0]); L.new(sep.outputs['X'], ax.inputs[1])
    rad = node('ShaderNodeMath', operation='ARCCOSINE'); L.new(fwd.outputs[0], rad.inputs[0])
    sp1 = node('ShaderNodeMath', operation='MULTIPLY'); sp1.inputs[1].default_value = 34.; L.new(rad.outputs[0], sp1.inputs[0])
    sp2 = node('ShaderNodeMath', operation='ADD'); L.new(sp1.outputs[0], sp2.inputs[0]); L.new(ax.outputs[0], sp2.inputs[1])
    sp3 = node('ShaderNodeMath', operation='SINE'); L.new(sp2.outputs[0], sp3.inputs[0])
    sp4 = node('ShaderNodeMapRange', clamp=True); sp4.inputs['From Min'].default_value = -.25; sp4.inputs['From Max'].default_value = .25; L.new(sp3.outputs[0], sp4.inputs['Value'])
    spc = node('ShaderNodeMix', data_type='RGBA'); spc.inputs[6].default_value = PAL['sclera']; spc.inputs[7].default_value = PAL['iris_dk']; L.new(sp4.outputs[0], spc.inputs[0])
    spin = node('ShaderNodeMath', operation='GREATER_THAN'); spin.inputs[1].default_value = .62; L.new(fwd.outputs[0], spin.inputs[0])
    spm = node('ShaderNodeMath', operation='MULTIPLY'); L.new(spin.outputs[0], spm.inputs[0]); L.new(vals['spiral'].outputs[0], spm.inputs[1])
    # Compose sclera -> iris -> pupil, then spiral on top
    # bloodshot sclera: a red flush toward the lids when 'blood' is up (furious)
    bl = node('ShaderNodeMapRange', clamp=True); bl.inputs['From Min'].default_value = .8; bl.inputs['From Max'].default_value = .3; L.new(fwd.outputs[0], bl.inputs['Value'])
    blm = node('ShaderNodeMath', operation='MULTIPLY'); L.new(bl.outputs[0], blm.inputs[0]); L.new(vals['blood'].outputs[0], blm.inputs[1])
    scl = node('ShaderNodeMix', data_type='RGBA'); scl.inputs[6].default_value = PAL['sclera']; scl.inputs[7].default_value = srgb('#E2525E'); L.new(blm.outputs[0], scl.inputs[0])
    # bright ring around the pupil (the light pooling in a glossy toy eye)
    pr = node('ShaderNodeMath', operation='SUBTRACT'); L.new(vals['pupil'].outputs[0], pr.inputs[0]); pr.inputs[1].default_value = .03
    hi = step(pr.outputs[0], .012, fwd_p)
    ring2 = node('ShaderNodeMix', data_type='RGBA'); ring2.inputs[7].default_value = srgb('#A8FFF2'); L.new(ring.outputs[2], ring2.inputs[6])
    him = node('ShaderNodeMath', operation='MULTIPLY'); him.inputs[1].default_value = .55; L.new(hi, him.inputs[0]); L.new(him.outputs[0], ring2.inputs[0])
    c1 = node('ShaderNodeMix', data_type='RGBA'); L.new(scl.outputs[2], c1.inputs[6]); L.new(iris_m, c1.inputs[0]); L.new(ring2.outputs[2], c1.inputs[7])
    c2 = node('ShaderNodeMix', data_type='RGBA'); c2.inputs[7].default_value = srgb('#05070C'); L.new(pupil_m, c2.inputs[0]); L.new(c1.outputs[2], c2.inputs[6])
    nos = node('ShaderNodeMath', operation='SUBTRACT'); nos.inputs[0].default_value = 1.; L.new(vals['spiral'].outputs[0], nos.inputs[1])
    pm = node('ShaderNodeMath', operation='MULTIPLY'); L.new(nos.outputs[0], pm.inputs[0]); L.new(pupil_m, pm.inputs[1])
    c2b = node('ShaderNodeMix', data_type='RGBA'); c2b.inputs[7].default_value = srgb('#05070C'); L.new(pm.outputs[0], c2b.inputs[0]); L.new(c1.outputs[2], c2b.inputs[6])
    c3 = node('ShaderNodeMix', data_type='RGBA'); L.new(spm.outputs[0], c3.inputs[0]); L.new(c2b.outputs[2], c3.inputs[6]); L.new(spc.outputs[2], c3.inputs[7])
    L.new(c3.outputs[2], p.inputs['Base Color'])
    nt.nodes.remove(c2)
    return m, vals

def stone_material():
    m, p = principled('nerra.stone', rough=.42, coat=.55, coat_rough=.12, attr=True); nt = m.node_tree
    tc = nt.nodes.new('ShaderNodeTexCoord'); br = nt.nodes.new('ShaderNodeTexBrick')
    br.inputs['Scale'].default_value = 11.; br.inputs['Mortar Size'].default_value = .045; br.inputs['Mortar Smooth'].default_value = .85; br.inputs['Bias'].default_value = -.2
    br.inputs['Row Height'].default_value = .5; br.inputs['Brick Width'].default_value = 1.
    br.inputs['Color1'].default_value = (1, 1, 1, 1); br.inputs['Color2'].default_value = (.62, .6, .6, 1); br.inputs['Mortar'].default_value = (.12, .1, .1, 1)
    nt.links.new(tc.outputs['Object'], br.inputs['Vector'])
    bump = nt.nodes.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = .9; bump.inputs['Distance'].default_value = .012
    nt.links.new(br.outputs['Fac'], bump.inputs['Height']); nt.links.new(bump.outputs['Normal'], p.inputs['Normal'])
    a = next(n for n in nt.nodes if n.type == 'ATTRIBUTE'); mix = nt.nodes.new('ShaderNodeMix'); mix.data_type = 'RGBA'; mix.blend_type = 'MULTIPLY'
    mix.inputs[0].default_value = 1.; nt.links.new(a.outputs['Color'], mix.inputs[6]); nt.links.new(br.outputs['Color'], mix.inputs[7])
    nt.links.new(mix.outputs[2], p.inputs['Base Color']); return m

# ---------------------------------------------------------------- the character
GAME_UNITS_PER_BU = 70.0
EYE_R = .175
BODY_Z = .42                 # body origin height: a low, wide, crouching stance
# arm and claw sizes (BU): the crusher is the massive one, the gate claw holds the sluice chain
ARM = {'crusher': dict(merus=.38, carpus=.21, palm=(.84, .48), finger=(.82, .3)),
       'gate': dict(merus=.34, carpus=.19, palm=(.5, .25), finger=(.68, .13))}

class Rig:
    pass

def build():
    global COLL
    bpy.ops.wm.read_factory_settings(use_empty=True)
    COLL = bpy.data.collections.new('nerra'); bpy.context.scene.collection.children.link(COLL)
    R = Rig(); R.mouths = {}; R.legs = []; R.eye_vals = []
    vinyl, _ = principled('nerra.vinyl', rough=.3, coat=1., coat_rough=.05, attr=True)
    vinyl_soft, _ = principled('nerra.vinyl_soft', rough=.38, coat=.8, coat_rough=.06, attr=True)
    pearl, _ = principled('nerra.pearl', base=PAL['pearl'], rough=.16, coat=1., coat_rough=.02)
    mouth_m, _ = principled('nerra.mouth', base=PAL['mouth'], rough=.5, coat=.4, coat_rough=.2)
    tooth_m, _ = principled('nerra.tooth', base=PAL['tooth'], rough=.25, coat=1., coat_rough=.03)
    tongue_m, _ = principled('nerra.tongue', base=PAL['tongue'], rough=.3, coat=1., coat_rough=.05)
    flag_m, _ = principled('nerra.flag', base=PAL['flag'], rough=.45, coat=.5, coat_rough=.1)
    window_m, _ = principled('nerra.window', base=srgb('#3A1A10'), rough=.4, coat=.6, emission=(srgb('#FFA040'), 7.))
    stone = stone_material()
    crab = crab_material('nerra.crab', seams=10., seam_dark=.58, speckle=.6, fine=.8)
    shellm = crab_material('nerra.shellmat', seams=5.5, pits=.8, speckle=.35, fine=.7, ao=.75, seam_dark=.35)
    clawm = crab_material('nerra.claw', seams=12., pits=.25, speckle=.65, fine=.8, seam_dark=.55)
    barn_m, _ = principled('nerra.barnacle', base=PAL['barnacle'], rough=.55, coat=.35, coat_rough=.2)
    moss_m, _ = principled('nerra.moss', base=srgb('#4F7A3A'), rough=.7, coat=.2, coat_rough=.3)
    metal_m, _ = principled('nerra.chain', base=srgb('#4A5266'), rough=.28, metallic=1., coat=.4, coat_rough=.1)
    R.mats = dict(vinyl=vinyl, pearl=pearl)

    root = R.root = empty('root')
    body = R.body = empty('body', root, (0, 0, BODY_Z))

    # ---- carapace (body + face): coral below, oxblood on top and back
    def cara_col(co):
        t = min(1., smooth((co.z - .02) / .3 + co.y * 1.2) + .7 * smooth((abs(co.x) - .3) / .35))
        return lerp(lerp(PAL['coral'], PAL['oxblood'], t), PAL['under'], smooth((-.08 - co.z) / .14) * .9)
    CC, CR = (0, .02, .1), (.8, .5, .32)
    R.carapace = mesh_ob('nerra.carapace', bm_sphere(CC, CR), crab, body, cara_col)
    # brow ridge: a heavy oxblood plate over the front top, where the eye stalks come out
    R.ridge = mesh_ob('nerra.browRidge', bm_sphere((0, -.155, .352), (.44, .2, .088)), crab, body,
                      lambda co: lerp(PAL['oxblood'], PAL['coral'], smooth((.42 - co.z) / .14) * .6))
    # armour: overlapping scutes over the carapace (each one darker at its rim), and a row of jagged rim spikes
    def scute_col(co, a, b):
        e = min(1., math.sqrt((co.x / a) ** 2 + (co.y / b) ** 2))
        return lerp(lerp(PAL['coral'], PAL['oxblood'], .45), PAL['oxblood_dk'], smooth((e - .55) / .45) * .85)
    parts = []
    for el, azs, a, b in ((45, (-56, 56), .16, .12), (70, (-80, 0, 80), .15, .12), (22, (-128, -102, -76, 76, 102, 128), .16, .12),
                          (38, (-150, -98, 98, 150), .15, .12)):
        for az in azs:
            jr = random.Random(el * 1000 + az)   # each scute a little different: no two surfaces end up tangent by accident
            p_, n_, t_ = ell_frame(CC, CR, el, az, jr.uniform(.009, .014))
            m_ = Matrix.Translation(p_) @ look_rot(t_, n_).to_4x4() @ Matrix.Rotation(math.radians(jr.uniform(-7, 7)), 4, 'Z')
            parts.append((bm_sphere((0, 0, 0), (a * jr.uniform(.93, 1.05), b * jr.uniform(.93, 1.05), jr.uniform(.042, .05)), 32, 12), m_, lambda co, a=a, b=b: scute_col(co, a, b)))
    merged_ob('nerra.scutes', parts, crab, body)
    def spike_col(L, base=None, tip=None):
        return lambda co: lerp(base or PAL['oxblood'], tip or PAL['tip'], smooth(co.x / L * 1.4 - .2))
    parts = []
    for s in (-1, 1):
        for k, az in enumerate((42, 62, 82, 102, 122)):
            p_, n_, t_ = ell_frame(CC, CR, 4, s * az, -.02); L = .15 - .015 * abs(k - 1)
            d = (n_ + Vector((0, -.25, .18))).normalized()
            parts.append((spike_bm(.05, L, hook=.03), Matrix.Translation(p_) @ look_rot(d, Vector((0, 0, 1))).to_4x4(), spike_col(L)))
    merged_ob('nerra.rimSpikes', parts, crab, body)
    # cheeks: two soft coral lobes either side of the mouth (chibi face volume)
    for s in (-1, 1):
        mesh_ob(f'nerra.cheek{"LR"[s > 0]}', bm_sphere((s * .27, -.32, .02), (.14, .13, .12)), crab, body,
                lambda co: lerp(PAL['coral_hi'], PAL['coral'], smooth((co.z + .1) / .25)))

    # ---- face plates (one per mouth shape), cream, carved by a boolean cutter
    face_center, face_r = Vector((0, -.36, .09)), (.33, .2, .22)
    def face_col(co): return lerp(lerp(PAL['cream'], PAL['under'], .35), PAL['cream_dk'], smooth((-co.z - .02) / .2) * .8)
    def prism(name, outline, y0=-.66, y1=-.44):
        bm = bmesh.new(); f = [bm.verts.new((x, y0, z)) for x, z in outline]; b = [bm.verts.new((x, y1, z)) for x, z in outline]
        n = len(outline); bm.faces.new(f); bm.faces.new(list(reversed(b)))
        for i in range(n): bm.faces.new((f[i], b[i], b[(i + 1) % n], f[(i + 1) % n]))
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        ob = mesh_ob(name, bm, mouth_m, body, smooth_shade=False); ob.hide_render = True; ob.hide_viewport = True; return ob
    def arc_band(x0, x1, zc, top, bottom, n=24, lift=0.):
        """Crescent-ish outline: upper edge z=zc+top(t), lower edge z=zc+bottom(t), t in 0..1 across x0..x1."""
        up = [(x0 + (x1 - x0) * t, zc + top(t)) for t in (i / n for i in range(n + 1))]
        lo = [(x0 + (x1 - x0) * t, zc + bottom(t)) for t in (i / n for i in range(n, -1, -1))]
        return up + lo[1:-1]
    mz = .1
    shapes = {
        # menacing calm: a long closed line that dips at the corners (a confident, unimpressed queen)
        'calm': arc_band(-.19, .19, mz, lambda t: .026 - .045 * (2 * t - 1) ** 2, lambda t: .026 - .045 * (2 * t - 1) ** 2 - .016 - .05 * math.sin(math.pi * t)),
        # smug: lopsided smirk rising to her left (screen right)
        'smug': arc_band(-.15, .19, mz, lambda t: .0 - .02 * math.sin(math.pi * t) * (1 - t) + .06 * t * t,
                         lambda t: -.012 - .05 * math.sin(math.pi * t) - .01 * (1 - t) + .045 * t * t),
        # furious snarl: wide open, flat top lip, jaw pulled down at the corners
        'furious': arc_band(-.235, .235, mz, lambda t: .07 - .045 * (2 * t - 1) ** 4, lambda t: -.11 + .085 * (2 * t - 1) ** 2 - .015 * math.sin(math.pi * t)),
        # hurt: tight wobbly grimace
        'hurt': arc_band(-.15, .15, mz, lambda t: .022 + .012 * math.sin(6 * math.pi * t) - .02 * math.sin(math.pi * t),
                         lambda t: -.022 + .012 * math.sin(6 * math.pi * t) - .02 * math.sin(math.pi * t)),
        # dizzy: lopsided open mouth, tongue lolling out to screen right
        'dizzy': arc_band(-.13, .15, mz - .01, lambda t: .03 + .025 * t - .01 * math.sin(math.pi * t), lambda t: -.05 + .015 * t - .015 * math.sin(math.pi * t)),
        # defeated: open downturned frown
        'defeat': arc_band(-.14, .14, mz, lambda t: -.005 + .045 * math.sin(math.pi * t), lambda t: -.05 + .04 * math.sin(math.pi * t)),
        # roar (jump crouch, landing, attack): big open mouth
        'roar': arc_band(-.2, .2, mz - .01, lambda t: .075 - .03 * (2 * t - 1) ** 2, lambda t: -.13 + .08 * (2 * t - 1) ** 2),
    }
    for key, outline in shapes.items():
        cut = prism(f'nerra.mouthCut.{key}', outline)
        fp = mesh_ob(f'nerra.face.{key}', bm_sphere(face_center, face_r), vinyl_soft, body, face_col)
        fp.data.materials.append(mouth_m)
        mod = fp.modifiers.new('mouth', 'BOOLEAN'); mod.operation = 'DIFFERENCE'; mod.solver = 'EXACT'; mod.object = cut
        mod.material_mode = 'TRANSFER'
        parts = [fp]
        if key in ('furious', 'roar', 'smug', 'dizzy', 'calm'):
            # teeth: little ivory fangs rooted in the upper lip of the carved mouth, pointing down
            xs = {'furious': [-.17, -.1, -.035, .035, .1, .17], 'roar': [-.15, -.08, .08, .15], 'smug': [-.06, -.01, .04, .09, .14], 'dizzy': [-.08],
                  'calm': [-.135, -.09, -.045, 0., .045, .09, .135]}[key]
            for i, x in enumerate(xs):
                top = max(z for (ox, z) in outline if abs(ox - x) < .02) + .012
                h = {'furious': .05, 'calm': .042, 'smug': .036}.get(key, .05)
                cone = bm_lathe([(0, .024), (h * .6, .018), (h, 0)], seg=12)
                transform_bm(cone, Matrix.Translation((x, face_center.y - face_r[1] * math.sqrt(max(0, 1 - (x / face_r[0]) ** 2 - ((top - face_center.z) / face_r[2]) ** 2)) + .028, top)) @ Matrix.Rotation(math.pi / 2, 4, 'Y'))
                parts.append(mesh_ob(f'nerra.tooth.{key}{i}', cone, tooth_m, body))
            if key in ('furious', 'roar'):   # lower fangs
                for i, x in enumerate([-.14, .14] if key == 'furious' else [-.11, .11]):
                    bot = min(z for (ox, z) in outline if abs(ox - x) < .02) - .012
                    cone = bm_lathe([(0, .02), (.024, .014), (.04, 0)], seg=12)
                    transform_bm(cone, Matrix.Translation((x, face_center.y - face_r[1] * .8 + .035, bot)) @ Matrix.Rotation(-math.pi / 2, 4, 'Y'))
                    parts.append(mesh_ob(f'nerra.toothLow.{key}{i}', cone, tooth_m, body))
        if key in ('dizzy', 'roar', 'defeat', 'furious'):
            tz = {'dizzy': mz - .07, 'roar': mz - .085, 'defeat': mz - .055, 'furious': mz - .06}[key]
            tx = .07 if key == 'dizzy' else 0.
            ty = face_center.y - face_r[1] * .55 - (.06 if key == 'dizzy' else 0)
            parts.append(mesh_ob(f'nerra.tongue.{key}', bm_sphere((tx, ty, tz), (.075, .09 if key == 'dizzy' else .06, .035)),
                                 tongue_m, body))
        R.mouths[key] = parts

    # ---- the spiral shell (turban whorls) on her back
    R.shell = empty('shell', body, (0, .46, .2))
    shell_root = empty('shellTilt', R.shell, rot=(math.radians(-24), 0, 0))
    def shell_bm():
        bm = bmesh.new(); turns, N, M = 2.6, 260, 40; R0, r0, H = .52, .43, .64
        rings = []; band = []
        for i in range(N + 1):
            s = i / N; th = 2 * math.pi * turns * s - math.pi / 2 + .6
            k = (1 - s) ** 1.05; Rr, rr = R0 * k + .015, max(.01, r0 * (1 - .82 * s))
            c = Vector((Rr * math.cos(th), Rr * math.sin(th), H * (1 - (1 - s) ** 1.25)))
            radial = Vector((math.cos(th), math.sin(th), 0))
            ring = []
            for j in range(M):
                v = 2 * math.pi * j / M
                # growth ribs across the whorl and a raised keel that spirals up the shoulder of every whorl
                rib = 1 + .05 * (.5 + .5 * math.cos(s * 2 * math.pi * 17)) ** 3
                keel = .09 * math.exp(-(math.remainder(v - .75, 2 * math.pi) / .22) ** 2)
                ext = rr * (rib + keel); cv = math.cos(v)
                if cv < 0: cv *= min(1., (Rr - .03 - .06 * s) / ext) if Rr > .03 + .06 * s else 0.   # the columella: inner walls stop short of the axis
                p = c + ext * (cv * radial + math.sin(v) * Vector((0, 0, 1)) * 1.05)
                ring.append(bm.verts.new(p)); band.append((s, v))
            rings.append(ring)
        for a, b in zip(rings, rings[1:]):
            for j in range(M): bm.faces.new((a[j], a[(j + 1) % M], b[(j + 1) % M], b[j]))
        bm.faces.new(list(reversed(rings[0]))); tip = bm.verts.new(rings[-1][0].co * 0 + sum((v.co for v in rings[-1]), Vector()) / M + Vector((0, 0, .02)))
        for j in range(M): bm.faces.new((rings[-1][j], rings[-1][(j + 1) % M], tip))
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        return bm, band
    sb, band = shell_bm()
    sh = mesh_ob('nerra.shell', sb, shellm, shell_root)
    ca = sh.data.color_attributes.new('col', 'FLOAT_COLOR', 'POINT')
    for i, v in enumerate(sh.data.vertices):
        s, a = band[i] if i < len(band) else (1., 0.)
        crest = .5 + .5 * math.cos(a - .35)                    # outer crest of each whorl is lighter, the seams dark
        growth = .5 + .5 * math.cos(s * 2 * math.pi * 14)      # soft growth ribs across each whorl
        stripe = smooth(1.6 * (1 - abs(math.remainder(a + .15, 2 * math.pi)) / .13))   # the cream-coral suture stripe that spirals up
        c = lerp(PAL['wine_dk'], PAL['wine'], smooth(crest * 1.5) * (.8 + .2 * growth))
        c = lerp(c, PAL["band"], stripe)
        ca.data[i].color = c
    R.shell_mesh = sh
    # barnacle clusters on the shell rim and flanks (each cluster: a seed point and its neighbours)
    rnd = random.Random(7); verts = [v for v in sh.data.vertices if v.normal.y < -.2 and -.25 < v.co.z < .45 and abs(v.normal.z) < .8]
    keel = {}
    for i, (s_, v_) in enumerate(band):
        k_ = round(s_ * 260)
        if abs(math.remainder(v_ - .75, 2 * math.pi)) < math.pi / 40: keel[k_] = i
    parts = []; mv = sh.data.vertices
    for k_ in range(12, 200, 15):
        i = keel.get(k_)
        if i is None: continue
        s_ = k_ / 260; L = .2 * (1 - .55 * s_)
        d = (mv[i].normal + Vector((0, 0, .35))).normalized()
        parts.append((spike_bm(.06 * (1 - .5 * s_), L, hook=.04), Matrix.Translation(mv[i].co - mv[i].normal * .02) @ look_rot(d, Vector((0, 0, 1))).to_4x4(),
                      lambda co, L=L: lerp(PAL['wine'], PAL['tip'], smooth(co.x / L * 1.3 - .2))))
    merged_ob('nerra.shellSpikes', parts, shellm, shell_root)
    shell_cups = []
    for k, v in enumerate(rnd.sample(verts, 12)):
        near = [w for w in verts if (w.co - v.co).length < .12]
        pts = [(w.co.copy(), w.normal.copy()) for w in rnd.sample(near, min(len(near), rnd.randint(4, 7)))]
        mesh_ob(f'nerra.barnacles.shell{k}', barnacle_bm(pts, rnd, .042, shell_cups), barn_m, shell_root)

    # ---- the ruined fortress on the apex
    top = Vector((0., 0., 0.))
    for v in sh.data.vertices:
        if v.co.z > top.z: top = v.co.copy()
    fort = R.fort = empty('fort', shell_root, (top.x * .4, top.y * .4, top.z - .17)); fort.scale = (1.4,) * 3
    def stone_col(seed):
        rr = random.Random(seed)
        return lambda co: lerp(PAL['stone'], PAL['stone_dk'], smooth(.35 - co.z * 1.4) * .8 + rr.uniform(0, .1))
    def tower(name, x, y, r, h, roof=None, broken=False, base=-.12):
        prof = [(0, r * 1.08), (.02, r * 1.08), (.03, r), (h, r), (h, r * 1.18), (h + .055, r * 1.18)]
        bm = bm_lathe([(base, r * 1.12)] + prof[1:], seg=32); transform_bm(bm, Matrix.Rotation(-math.pi / 2, 4, 'Y'))
        transform_bm(bm, Matrix.Translation((x, y, 0)))
        t = mesh_ob(f'nerra.{name}', bm, stone, fort, stone_col(hash(name) % 99)); t.data.materials.append(window_m)
        # crenellations (merlons), some knocked off on a broken tower
        n = 8; rr = random.Random(len(name))
        for i in range(n):
            if broken and i in (1, 2, 5): continue
            a = 2 * math.pi * i / n; hh = .05 if not broken else rr.uniform(.02, .06)
            b = bmesh.new(); bmesh.ops.create_cube(b, size=1.)
            transform_bm(b, Matrix.Translation((x + r * 1.08 * math.cos(a), y + r * 1.08 * math.sin(a), h + .05 + hh / 2)) @
                         Matrix.Rotation(a, 4, 'Z') @ Matrix.Diagonal((r * .34, r * .5, hh + .01, 1)))
            bmesh.ops.bevel(b, geom=b.edges[:], offset=.006, segments=2, affect='EDGES')
            mesh_ob(f'nerra.{name}.merlon{i}', b, stone, fort, stone_col(i)).data.shade_smooth()
        # windows: dark arched slots with a warm glow, set into the wall facing the camera
        for wz in ([h * .55] if h < .3 else [h * .35, h * .72]):
            b = bmesh.new(); bmesh.ops.create_cube(b, size=1.)
            transform_bm(b, Matrix.Translation((x, y - r * .97, wz)) @ Matrix.Diagonal((r * .32, r * .2, r * .62, 1)))
            mesh_ob(f'nerra.{name}.window{wz:.2f}', b, window_m, fort, smooth_shade=False)
        if roof:
            bm = bm_lathe([(0, r * 1.3), (.015, r * 1.25), (roof, 0)], seg=28)
            transform_bm(bm, Matrix.Translation((x, y, h + .03)) @ Matrix.Rotation(-math.pi / 2, 4, 'Y'))
            mesh_ob(f'nerra.{name}.roof', bm, vinyl, fort, lambda co: lerp(PAL['roof'], PAL['oxblood'], smooth((co.z - h) / roof)))
            # pennant flag on a pole
            pole_h = .2; bm = bm_lathe([(0, .008), (pole_h, .008), (pole_h + .012, 0)], seg=10)
            transform_bm(bm, Matrix.Translation((x, y, h + .045 + roof - .03)) @ Matrix.Rotation(-math.pi / 2, 4, 'Y'))
            mesh_ob(f'nerra.{name}.pole', bm, pearl, fort)
            # tattered swallowtail banner: torn, uneven trailing edge and a ripple
            fb = bmesh.new(); W, Hh, nx, ny = .17, .085, 12, 4; tr = random.Random(name)
            rowlen = [W * (1 - .32 * (1 - abs(2 * j / ny - 1))) * tr.uniform(.8, 1.) for j in range(ny + 1)]
            ztop = h + .045 + roof - .03 + pole_h - .01
            vs = [[fb.verts.new((x + .006 + rowlen[j] * i / nx, y + .016 * math.sin(i / nx * 6 + j * .3), ztop - Hh * j / ny * (1 - .25 * i / nx)))
                   for j in range(ny + 1)] for i in range(nx + 1)]
            for i in range(nx):
                for j in range(ny):
                    if i > nx - 3 and tr.random() < .35: continue    # torn holes near the fly end
                    fb.faces.new((vs[i][j], vs[i + 1][j], vs[i + 1][j + 1], vs[i][j + 1]))
            bmesh.ops.delete(fb, geom=[v for v in fb.verts if not v.link_faces], context='VERTS')
            f = mesh_ob(f'nerra.{name}.flag', fb, flag_m, fort)
            sol = f.modifiers.new('thick', 'SOLIDIFY'); sol.thickness = .012; sol.offset = 0
        return t
    tower('keep', 0, .02, .12, .27, roof=.19)
    tower('towerL', -.3, -.02, .09, .16, broken=True, base=-.22)
    tower('towerR', .29, .05, .095, .2, roof=.15, base=-.22)
    tower('towerBL', -.16, .2, .08, .22, roof=.13, base=-.2)
    tower('towerBR', .15, .22, .075, .15, broken=True, base=-.2)
    tower('gate', -.13, -.15, .06, .09, broken=True, base=-.2)
    # curtain walls joining the towers, one of them broken
    for name, a, b, broken in (('wallL', (-.3, -.02), (-.07, .015), True), ('wallR', (.07, .025), (.29, .05), False),
                               ('wallBL', (-.3, .02), (-.18, .17), False), ('wallB', (-.1, .2), (.08, .22), True), ('wallBR', (.2, .18), (.28, .08), False)):
        A, B = Vector((*a, 0)), Vector((*b, 0)); d = B - A; L = d.length
        bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.)
        transform_bm(bm, Matrix.Translation((A + B) / 2 + Vector((0, 0, .03))) @ Matrix.Rotation(math.atan2(d.y, d.x), 4, 'Z') @ Matrix.Diagonal((L, .06, (.2 if not broken else .15) - .012 * (name == 'wallBR'), 1)))
        bmesh.ops.bevel(bm, geom=bm.edges[:], offset=.008, segments=2, affect='EDGES')
        mesh_ob(f'nerra.{name}', bm, stone, fort, stone_col(L))
    # moss tufts at the tower feet and along the wall tops
    mr = random.Random(11); tufts = []
    for (x, y, z, n) in ((-.3, -.1, .0, 6), (0, -.11, .0, 7), (.29, -.05, .0, 6), (-.16, .1, .0, 4), (-.2, -.02, .19, 4), (.18, .03, .23, 4), (-.13, -.21, .0, 4)):
        for _ in range(n):
            r = mr.uniform(.018, .034)
            tufts.append(bm_sphere((x + mr.uniform(-.06, .06), y + mr.uniform(-.03, .03), z + mr.uniform(-.01, .02)), (r, r, r * .8), 12, 6))
    mesh_ob('nerra.moss', merge_bms(tufts), moss_m, fort)

    # ---- eye stalks, eyes, lids, brows
    R.eyes = []
    eye_mat_ = {}
    for s in (-1, 1):
        side = 'LR'[s > 0]
        stalk = empty(f'stalk{side}', body, (s * .2, -.34, .2), (0, 0, 0))
        bm = bm_lathe([(0, .068), (.04, .072), (.05, .058), (.09, .062), (.11, 0)], seg=24)
        transform_bm(bm, Matrix.Rotation(-math.pi / 2, 4, 'Y'))
        mesh_ob(f'nerra.stalk{side}', bm, vinyl, stalk, lambda co: lerp(PAL['coral'], PAL['oxblood'], .35 + .3 * math.cos(co.z * 60)))
        er = EYE_R
        eye = empty(f'eye{side}', stalk, (s * .06, -.03, .16))
        m, vals = eye_material(f'nerra.eye{side}'); R.eye_vals.append(vals)
        ball = mesh_ob(f'nerra.eyeball{side}', bm_sphere((0, 0, 0), (er, er, er), 64, 32), m, eye)
        # fixed catch-lights (a big one and a small one, upper left), riding on the stalk not the turning eyeball
        cl, _ = principled(f'nerra.catch{side}', base=(1, 1, 1, 1), rough=.1, emission=((1, 1, 1, 1), 9.))
        lids = {}
        for part, (a0, a1) in (('up', (0, 90)), ('lo', (90, 180))):
            piv = empty(f'lid{part}{side}', eye)
            bm = bmesh.new(); seg, rings = 48, 20; rad = er * (1.06 if part == 'up' else 1.09)   # different radii: no coplanar overlap
            rows = []
            for i in range(rings + 1):
                pa = math.radians(a0 + (a1 - a0) * i / rings)
                if pa < 1e-6 or pa > math.pi - 1e-6: rows.append([bm.verts.new((0, 0, rad if pa < 1 else -rad))]); continue
                rows.append([bm.verts.new((rad * math.sin(pa) * math.cos(2 * math.pi * j / seg), rad * math.sin(pa) * math.sin(2 * math.pi * j / seg), rad * math.cos(pa))) for j in range(seg)])
            for a, b in zip(rows, rows[1:]):
                if len(a) == 1: [bm.faces.new((a[0], b[j], b[(j + 1) % seg])) for j in range(seg)]
                elif len(b) == 1: [bm.faces.new((a[j], b[0], a[(j + 1) % seg])) for j in range(seg)]
                else: [bm.faces.new((a[j], b[j], b[(j + 1) % seg], a[(j + 1) % seg])) for j in range(seg)]
            bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
            for f in bm.faces:   # outward
                if f.normal.dot(f.calc_center_median()) < 0: f.normal_flip()
            lid = mesh_ob(f'nerra.lid{part}{side}', bm, vinyl, piv, lambda co: lerp(PAL['oxblood'], PAL['oxblood_dk'], smooth(co.z / er * .8 + .2)))
            so = lid.modifiers.new('thick', 'SOLIDIFY'); so.thickness = .016; so.offset = 1.; so.use_rim = True
            lids[part] = piv
        # catch-lights sit just outside the cornea, up-left as seen from the key light
        for k, (dx, dz, r) in enumerate(((-.3, .2, .05), (.22, -.18, .02))):
            d = Vector((dx, -1, dz)).normalized() * (er + .002)
            mesh_ob(f'nerra.catch{side}{k}', bm_sphere(d, (r, r * .5, r), 16, 8, rot=look_rot(Vector((0, 0, 1)), Vector((0, -1, 0))).to_3x3() if False else None), cl, eye)
        # brow plate: a thick dark bean over the eye; pivots about the eye centre
        bpiv = empty(f'brow{side}', eye)
        bm = bm_lathe(round_profile(.27, .05, .028, bulge=.014), seg=24, bend=lambda x: (0, -1.2 * (x - .13) ** 2), squash=(1.5, 1.))
        transform_bm(bm, Matrix.Translation((-.135 - .018, 0, 0)))
        brow = mesh_ob(f'nerra.brow{side}', bm, vinyl, bpiv, lambda co: lerp(PAL['oxblood_dk'], PAL['oxblood'], .3))
        brow.location = (0, -.07, er + .045)
        # two short horns on each brow plate (outer end and middle), raked back: a crowned, armoured scowl
        merged_ob(f'nerra.browHorns{side}', [(spike_bm(.026, .09, 10, hook=.02), Matrix.Translation((s * .1, .01, 0.)) @ look_rot(Vector((s * .55, .35, 1)), Vector((0, -1, 0))).to_4x4(),
                                               lambda co: lerp(PAL['oxblood'], PAL['tip'], smooth(co.x / .09 * 1.4 - .2)))] +
                                             [(spike_bm(.02, .06, 10), Matrix.Translation((s * .01, .01, .03)) @ look_rot(Vector((s * .2, .4, 1)), Vector((0, -1, 0))).to_4x4(),
                                               lambda co: lerp(PAL['oxblood'], PAL['tip'], smooth(co.x / .06 * 1.4 - .2)))], vinyl, brow)
        R.eyes.append(dict(side=s, stalk=stalk, eye=eye, ball=ball, lids=lids, brow=bpiv, brow_mesh=brow, vals=vals))
        # a pearl collar where the stalk meets the eyeball
        mesh_ob(f'nerra.stalkPearl{side}', bm_sphere((s * .03, -.015, .1), (.066, .066, .045)), pearl, stalk)

    # ---- legs: four short pairs with black pearl joints
    L1, L2 = .3, .44
    hips = [(-.2, .3), (-.02, .33), (.16, .31), (.32, .27)]     # (y, z offset in body space; body origin at world z .5)
    for s in (-1, 1):
        for i, (hy, hz) in enumerate(hips):
            side = 'LR'[s > 0]
            hip = empty(f'hip{side}{i}', body, (s * (.52 - .05 * abs(i - 1.2)), hy, -.12 - .02 * i))
            mesh_ob(f'nerra.hipPearl{side}{i}', bm_sphere((0, 0, 0), (.097, .097, .097), 24, 12), pearl, hip)
            seg1 = empty(f'thigh{side}{i}', hip)
            bm = bm_lathe(round_profile(L1, .085, .075, bulge=.014), seg=24, squash=(1., 1.1))
            mesh_ob(f'nerra.thigh{side}{i}', bm, clawm, seg1, lambda co: lerp(lerp(PAL['oxblood'], PAL['coral'], smooth(co.x / L1 * 1.4)), PAL['under'], smooth(-co.z / .07) * .6))
            knee = empty(f'knee{side}{i}', seg1, (L1, 0, 0))
            merged_ob(f'nerra.thighSpike{side}{i}', [(spike_bm(.03, .08, 10, hook=.015), Matrix.Translation((L1 * .55, 0, .06)) @ look_rot(Vector((.45, 0, 1)), Vector((-1, 0, 0))).to_4x4(),
                                                       lambda co: lerp(PAL['oxblood'], PAL['tip'], smooth(co.x / .08 * 1.4 - .2)))], clawm, seg1)
            mesh_ob(f'nerra.kneePearl{side}{i}', bm_sphere((0, 0, 0), (.088, .088, .088), 24, 12), pearl, knee)
            bm = bm_lathe([(0, .07)] + [(L2 * t, .07 * (1 - t) ** .7 + .007) for t in (.2, .4, .6, .8, .92)] + [(L2, 0)], seg=24, bend=lambda x: (0, .04 * math.sin(math.pi * x / L2)))
            mesh_ob(f'nerra.shin{side}{i}', bm, clawm, knee, lambda co: lerp(lerp(PAL['coral'], PAL['under'], smooth(-co.z / .06) * .55), PAL['tip'], smooth((co.x / L2 - .6) * 3)))
            R.legs.append(dict(side=s, i=i, hip=hip, seg1=seg1, knee=knee, L1=L1, L2=L2,
                               rest=Vector((s * (1.12 + .05 * (1 - abs(i - 1.5))), hy * 1.5 - .02, 0.))))

    # ---- claws: the massive crusher on screen left, the slender gate claw on screen right
    R.arms = {}
    for s, kind in ((-1, 'crusher'), (1, 'gate')):
        big = kind == 'crusher'
        sh_ = empty(f'shoulder{kind}', body, (s * .52, -.2, -.06))
        mesh_ob(f'nerra.shoulderPearl{kind}', bm_sphere((0, 0, 0), (.1, .1, .1) if big else (.085,) * 3, 24, 12), pearl, sh_)
        ml = ARM[kind]['merus']
        bm = bm_lathe(round_profile(ml, .12 if big else .072, .11 if big else .066, bulge=.02), seg=28)
        mesh_ob(f'nerra.merus{kind}', bm, clawm, sh_, lambda co: lerp(lerp(PAL['coral'], PAL['oxblood'], .25 + .2 * math.cos(co.x * 25)), PAL['under'], smooth(-co.z / .1) * .55))
        elbow = empty(f'elbow{kind}', sh_, (ml, 0, 0))
        mesh_ob(f'nerra.elbowPearl{kind}', bm_sphere((0, 0, 0), (.125,) * 3 if big else (.08,) * 3, 24, 12), pearl, elbow)
        cl = ARM[kind]['carpus']
        bm = bm_lathe(round_profile(cl, .12 if big else .066, .15 if big else .072, bulge=.012), seg=28)
        mesh_ob(f'nerra.carpus{kind}', bm, clawm, elbow, lambda co: lerp(lerp(PAL['coral'], PAL['oxblood'], .3), PAL['under'], smooth(-co.z / .1) * .55))
        wrist = empty(f'wrist{kind}', elbow, (cl, 0, 0))
        mesh_ob(f'nerra.wristPearl{kind}', bm_sphere((0, 0, 0), (.163,) * 3 if big else (.085,) * 3, 24, 12), pearl, wrist)
        # palm (propodus): a big rounded mitt flattened across the pincer plane (local XZ, which faces the camera);
        # the fixed finger (pollex) grows out of its lower front, the movable dactyl hinges on its upper front
        pl, pw = ARM[kind]['palm']
        bm = bm_sphere((pl * .5, 0, 0), (pl * .56, pw * .78, pw))
        palm_col = lambda co, pl=pl, pw=pw: lerp(lerp(lerp(PAL['coral_hi'], PAL['coral'], smooth(co.z / pw * .8 + .5)), PAL['oxblood'], smooth(co.y / pw * 1.4 + .2) * .7),
                                                 PAL['under'], smooth((-co.z / pw - .35) * 3) * .75)
        mesh_ob(f'nerra.palm{kind}', bm, clawm, wrist, palm_col)
        fl, fr = ARM[kind]['finger']
        def finger(length, radius, curve):
            prof = [(0, radius)] + [(length * t, radius * (1 - t) ** .75 + .005) for t in (.2, .4, .6, .75, .87, .95)] + [(length, 0)]
            return bm_lathe(prof, seg=24, bend=lambda x: (0, curve * length * (x / length) ** 2), squash=(.8, 1.))
        def fcol(co, length=fl):
            return lerp(PAL['coral'], PAL['tip'], smooth((co.x / length - .58) * 2.8))
        bm = finger(fl, fr, .32); transform_bm(bm, Matrix.Translation((pl * .72, 0, -pw * .4)))
        mesh_ob(f'nerra.pollex{kind}', bm, clawm, wrist, lambda co, x0=pl * .72: fcol(co - Vector((x0, 0, 0))))
        dact = empty(f'dactyl{kind}', wrist, (pl * .78, 0, pw * .42))
        mesh_ob(f'nerra.dactylPearl{kind}', bm_sphere((0, 0, 0), (fr * .8,) * 3, 20, 10), pearl, dact)
        mesh_ob(f'nerra.dactyl{kind}', finger(fl * 1.06, fr * .95, -.32), clawm, dact, lambda co, L=fl * 1.06: fcol(co, L))
        # serrated ivory teeth along both cutting edges (rooted inside the finger, pointing at the opposite finger)
        def teeth(parent, x0, z0, length, radius, curve, sign, n, size, tag):
            parts = []
            for k in range(n):
                t = .1 + .72 * k / (n - 1); x = length * t; r = radius * (1 - t) ** .75 + .005
                sz = size * (1 - .45 * t); base = Vector((x0 + x, 0, z0 + curve * length * t * t + sign * (r - sz * .7)))
                cone = bm_lathe([(0, sz), (sz * .9, sz * .55), (sz * 1.9, 0)], seg=10)
                transform_bm(cone, Matrix.Translation(base) @ Matrix.Rotation(-sign * math.pi / 2, 4, 'Y')); parts.append(cone)
            mesh_ob(f'nerra.teeth.{kind}{tag}', merge_bms(parts), tooth_m, parent)
        teeth(wrist, pl * .72, -pw * .4, fl, fr, .32, 1, 8 if big else 5, .048 if big else .026, 'Pollex')
        teeth(dact, 0, 0, fl * 1.06, fr * .95, -.32, -1, 8 if big else 5, .044 if big else .024, 'Dactyl')
        # jagged ridge: a row of raked spikes along the top of the palm, and two on the merus
        parts = []
        for k in range(5 if big else 3):
            u = .15 + .6 * k / (4 if big else 2); x = pl * u
            zt = pw * math.sqrt(max(0., 1 - ((x - pl * .5) / (pl * .56)) ** 2)); L = (.12 if big else .07) * (1 - .25 * abs(u - .45))
            parts.append((spike_bm(.04 if big else .025, L, 10, hook=.02), Matrix.Translation((x, 0, zt - .03)) @ look_rot(Vector((.45, -.25, 1)), Vector((-1, 0, 0))).to_4x4(),
                          lambda co, L=L: lerp(PAL['oxblood'], PAL['tip'], smooth(co.x / L * 1.4 - .2))))
        merged_ob(f'nerra.palmSpikes.{kind}', parts, clawm, wrist)
        merged_ob(f'nerra.merusSpikes.{kind}', [(spike_bm(.03, .085 if big else .06, 10, hook=.015), Matrix.Translation((ml * u, 0, (.1 if big else .06))) @ look_rot(Vector((.5, 0, 1)), Vector((-1, 0, 0))).to_4x4(),
                                                 lambda co: lerp(PAL['oxblood'], PAL['tip'], smooth(co.x / .085 * 1.4 - .2))) for u in (.35, .7)], clawm, sh_)
        # barnacle clusters on the claw's outer faces
        br = random.Random(kind); pts = []
        for side_y in ((-1, 1) if big else (-1,)):
            for _ in range(9 if big else 5):
                d = Vector((br.uniform(-.55, .15), side_y, br.uniform(.0, .55))).normalized()
                rad = Vector((pl * .56, pw * .78, pw)); pos = Vector((pl * .5, 0, 0)) + Vector((d.x * rad.x, d.y * rad.y, d.z * rad.z))
                pts.append((pos, Vector((d.x / rad.x, d.y / rad.y, d.z / rad.z))))
        mesh_ob(f'nerra.barnacles.{kind}', barnacle_bm(pts, br, .05 if big else .03), barn_m, wrist)
        if not big:
            # the sluice chain: heavy gunmetal links clamped in the pincer, hanging under gravity, ending in a hook
            t = .3; gx = pl * .72 + fl * t; gz = -pw * .4 + .32 * fl * t * t + fr * (1 - t) ** .75 * .4
            chain = empty('chain', wrist, (gx, 0, gz)); links = []
            for i in range(3):
                lk = torus_bm(.058, .019, 20, 8)
                transform_bm(lk, Matrix.Translation((0, 0, -.088 * i)) @ (Matrix.Rotation(math.pi / 2, 4, 'X') if i % 2 == 0 else Matrix.Rotation(math.pi / 2, 4, 'Y')))
                links.append(mesh_ob(f'nerra.chainLink{i}', lk, metal_m, chain))
            hk = bm_lathe([(0, .026), (.05, .025), (.09, .021), (.13, .016), (.16, 0)], seg=12, bend=lambda x: (0, 14 * max(0, x - .04) ** 2))
            transform_bm(hk, Matrix.Translation((0, 0, -.088 * 3 + .04)) @ Matrix.Rotation(math.pi / 2, 4, 'Y'))
            links.append(mesh_ob('nerra.chainHook', hk, metal_m, chain))
            R.chain = (chain, links)
        R.arms[kind] = dict(side=s, shoulder=sh_, elbow=elbow, wrist=wrist, dactyl=dact, big=big)

    # ---- camera and lights
    scene = bpy.context.scene
    cam = bpy.data.objects.new('camera', bpy.data.cameras.new('camera')); scene.collection.objects.link(cam)
    cam.data.type = 'ORTHO'; scene.camera = cam
    R.cam = cam
    def area(name, loc, target, colour, power, size, size_y=None):
        l = bpy.data.lights.new(name, 'AREA'); l.energy = power; l.color = colour[:3]; l.size = size
        l.shape = 'DISK'   # round softboxes give the round, toy-like highlights of the reference renders
        ob = bpy.data.objects.new(name, l); scene.collection.objects.link(ob); ob.location = loc
        d = Vector(target) - Vector(loc); ob.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler(); return ob
    def hexc(h): return tuple(int(h[i:i + 2], 16) / 255 for i in (1, 3, 5))
    area('key', (-3.4, -3.6, 4.2), (0, 0, .7), hexc('#FFDBB8'), 600, 3.4)
    area('fill', (4.2, -2.2, 1.3), (0, 0, .7), hexc('#8CA6FF'), 170, 3.).visible_glossy = False   # fills light the form but leave no extra highlight dots
    area('bounce', (0, -2.4, -2.6), (0, 0, .6), hexc('#FF80A6'), 90, 3.5).visible_glossy = False
    area('rimL', (-2.6, 3.4, 2.6), (0, 0, .8), hexc('#FFC9A8'), 520, 2.2)
    area('rimR', (2.8, 3., 2.), (0, 0, .8), hexc('#9FB4FF'), 600, 2.2)
    area('rimCool', (1.6, 3.4, 3.6), (0, 0, .9), hexc('#7C9CFF'), 1100, 2.4)   # cool rim: separates her from the navy plate
    area('top', (0, -.8, 4.5), (0, 0, .8), hexc('#FFF2E6'), 80, 2.2, 1.2).visible_glossy = False
    w = bpy.data.worlds.new('world'); scene.world = w
    bg = next(n for n in w.node_tree.nodes if n.type == 'BACKGROUND'); bg.inputs[0].default_value = srgb('#1A2040'); bg.inputs[1].default_value = .6
    return R

# ---------------------------------------------------------------- posing
def solve_leg(leg, target_world):
    """Two-bone IK in the vertical plane through the hip: knee up (crab style), foot on `target_world`."""
    hip = leg['hip']; body = hip.parent
    bpy.context.view_layer.update()
    t = body.matrix_world.inverted() @ Vector(target_world) - hip.location
    phi = math.atan2(t.y, t.x); r = math.hypot(t.x, t.y); h = t.z
    L1, L2 = leg['L1'], leg['L2']; d = max(.05, min(L1 + L2 - 1e-3, math.hypot(r, h)))
    th_t = math.atan2(-h, r); beta = math.acos(max(-1, min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))))
    th1 = th_t - beta
    kx, kz = L1 * math.cos(th1), -L1 * math.sin(th1)
    th_seg2 = math.atan2(-(h - kz), r - kx)
    leg['seg1'].rotation_euler = (0, th1, 0); hip.rotation_euler = (0, 0, phi)
    leg['knee'].rotation_euler = (0, th_seg2 - th1, 0)

def set_arm(R, kind, shoulder, elbow, claw, open_, roll=0.):
    """shoulder (pitch up, yaw forward from straight out) and elbow (bend up) in degrees; claw = the claw's pointing
    direction in body space as (out, forward, up) (out is mirrored per side); open_ 0 (shut) .. 1 (gaping)."""
    a = R.arms[kind]; s = a['side']; sp, sy = shoulder
    az = -sy if s > 0 else 180 + sy
    a['shoulder'].rotation_euler = (Matrix.Rotation(math.radians(az), 4, 'Z') @ Matrix.Rotation(math.radians(-sp), 4, 'Y')).to_euler()
    a['elbow'].rotation_euler = (0, math.radians(-elbow), 0)
    a['dactyl'].rotation_euler = (0, math.radians(-4 - 50 * open_), 0)
    a['claw'] = (Vector((s * claw[0], -claw[1], claw[2])), roll)

def arm_low(R, kind):
    bpy.context.view_layer.update(); low = 9.
    def walk(ob):
        nonlocal low
        for c in ob.children:
            if c.name.endswith('chain'): continue      # the chain hangs free; links that would sink are hidden instead
            if c.type == 'MESH': low = min(low, min((c.matrix_world @ Vector(v)).z for v in c.bound_box))
            walk(c)
    walk(R.arms[kind]['shoulder']); return low

def clear_ground(R, kind, floor=.02):
    """Raise the shoulder and level the claw a little at a time until no part of this arm dips under the floor."""
    a = R.arms[kind]
    for _ in range(40):
        if arm_low(R, kind) >= floor: break
        a["shoulder"].rotation_euler = (a["shoulder"].matrix_basis.to_3x3() @ Matrix.Rotation(math.radians(-1.5), 3, "Y")).to_euler()
        d, roll = a["claw"]; d = d.normalized(); a["claw"] = (Vector((d.x, d.y, d.z + .05)), roll)   # and level the claw
        aim_claws(R)

def aim_claws(R):
    """Point each claw along its body-space direction (after the arm chain is posed)."""
    bpy.context.view_layer.update()
    body = R.body.matrix_world.to_3x3().normalized()
    for a in R.arms.values():
        d, roll = a['claw']; s = a['side']
        dz = abs(d.normalized().z)   # pincer plane: upright when the claw points sideways, facing the camera when it points up
        up = Matrix.Rotation(math.radians(roll), 3, d.normalized()) @ Vector((s * dz, 0, 1.1 - dz))
        want = body @ look_rot(d, up)
        parent = a['wrist'].parent.matrix_world.to_3x3().normalized()
        a['wrist'].rotation_euler = (parent.inverted() @ want).to_euler()

def set_eye(R, s, gaze=(0, 0), lid_up=.2, lid_lo=0., slant=0., brow=(0, 0, 0), stalk=(0, 0), iris=.80, pupil=.945, spiral=0., blood=0., lean=0.):
    """gaze (yaw, pitch) deg, + = screen right / up. lid_up 0 open .. 1 shut. slant deg: + tilts the upper lid down toward
    the nose (angry). brow (height, tilt deg + = inner end down, forward deg). stalk (lean out deg, lean back deg)."""
    e = next(x for x in R.eyes if x['side'] == s)
    e['stalk'].rotation_euler = (math.radians(-stalk[1]), math.radians(s * stalk[0] + lean), 0)
    e['eye'].rotation_euler = (0, 0, 0)
    e['ball'].rotation_euler = (math.radians(-gaze[1]), 0, math.radians(gaze[0]))
    e['lids']['up'].rotation_euler = Euler((math.radians(-62 + 150 * lid_up), math.radians(-s * slant), 0), 'XYZ')
    e['lids']['lo'].rotation_euler = Euler((math.radians(64 - 80 * lid_lo), math.radians(s * slant * .4), 0), 'XYZ')
    h, tilt, fwd = brow
    e['brow'].rotation_euler = Euler((math.radians(fwd - 8 * h), math.radians(-s * (tilt * .35)), 0), 'XYZ')
    e['brow_mesh'].rotation_euler = (0, math.radians(-s * tilt), 0)
    e['brow_mesh'].location = (0, -.07, EYE_R + .045 + .05 * h)
    v = e['vals']; v['iris'].outputs[0].default_value = iris; v['pupil'].outputs[0].default_value = pupil; v['spiral'].outputs[0].default_value = spiral; v['blood'].outputs[0].default_value = blood

FACES = {   # expression presets: (lid_up, lid_lo, slant, brow(h, tilt, fwd), stalk(out, back), mouth, pupil); a predator by default
    'calm':    dict(lid_up=.4, lid_lo=.36, slant=24, brow=(-.5, 30, 6), stalk=(3, 0), mouth='calm', pupil=.925, iris=.76),        # narrow, hard, watching
    'smug':    dict(lid_up=.46, lid_lo=.36, slant=16, brow=(-.3, 22, 4), stalk=(8, 3), mouth='smug', pupil=.925, iris=.76, asym=True),
    'furious': dict(lid_up=.18, lid_lo=.12, slant=38, brow=(-.9, 46, 12), stalk=(1, -6), mouth='furious', pupil=.945, iris=.78, blood=1.),
    'hurt':    dict(lid_up=.97, lid_lo=.55, slant=-14, brow=(.6, -22, 0), stalk=(16, 14), mouth='hurt', pupil=.93),
    'dizzy':   dict(lid_up=.18, lid_lo=.05, slant=-6, brow=(.85, -16, 0), stalk=(18, 6), mouth='dizzy', pupil=.93, spiral=1.),
    'defeat':  dict(lid_up=.99, lid_lo=.6, slant=-10, brow=(.2, -18, 0), stalk=(28, 22), mouth='defeat', pupil=.93),
    'roar':    dict(lid_up=.2, lid_lo=.14, slant=36, brow=(-.8, 42, 10), stalk=(0, -4), mouth='roar', pupil=.945, iris=.78, blood=.7),
    'focus':   dict(lid_up=.4, lid_lo=.34, slant=26, brow=(-.5, 32, 6), stalk=(2, 0), mouth='calm', pupil=.925, iris=.76),
    'surprise': dict(lid_up=.0, lid_lo=0, slant=-6, brow=(.8, -14, 0), stalk=(6, -10), mouth='defeat', pupil=.96),
}

def pose(R, face='calm', gaze=(0, 0), yaw=0., root=(0, 0, 0), squash=(1, 1, 1), body_rot=(0, 0, 0), body_off=(0, 0, 0),
         breathe=0., arms=None, feet=None, stalk_add=(0, 0), shell_rot=(0, 0, 0), stalk_lean=0.):
    """Set one frame. feet: dict leg-index -> world (dx, dy, dz) offsets added to the rest foot (in the root's frame),
    or callable(leg) -> world point."""
    f = dict(FACES[face]) if isinstance(face, str) else dict(face)
    R.root.location = root; R.root.rotation_euler = (0, 0, math.radians(yaw)); R.root.scale = squash
    R.body.location = Vector((0, 0, BODY_Z)) + Vector(body_off)
    R.body.rotation_euler = tuple(math.radians(x) for x in body_rot)
    R.body.scale = (1 + breathe * .4, 1 + breathe * .4, 1 + breathe)
    R.shell.rotation_euler = tuple(math.radians(x) for x in shell_rot)
    for key, parts in R.mouths.items():
        for ob in parts: ob.hide_render = ob.hide_viewport = key != f['mouth']
    for s in (-1, 1):
        st = f['stalk']; asym = f.get('asym') and s < 0
        set_eye(R, s, gaze=gaze, lid_up=f['lid_up'] - (.22 if asym else 0), lid_lo=f['lid_lo'] - (.2 if asym else 0),
                slant=f['slant'] + (8 if asym else 0), brow=(f['brow'][0] + (-.5 if asym else 0), f['brow'][1] + (14 if asym else 0), f['brow'][2]),
                stalk=(st[0] + stalk_add[0] + (-12 if asym else 0), st[1] + stalk_add[1]), iris=f.get('iris', .74), pupil=f['pupil'], spiral=f.get('spiral', 0.),
                blood=f.get('blood', 0.), lean=stalk_lean)
    arms = arms or {}
    set_arm(R, 'crusher', **arms.get('crusher', ARM_REST['crusher']))
    set_arm(R, 'gate', **arms.get('gate', ARM_REST['gate']))
    aim_claws(R)
    for kind in R.arms: clear_ground(R, kind)
    bpy.context.view_layer.update()
    chain, links = R.chain
    chain.rotation_euler = chain.parent.matrix_world.to_3x3().normalized().inverted().to_euler()
    bpy.context.view_layer.update(); sunk = False
    for lk in links:
        sunk = sunk or min((lk.matrix_world @ Vector(v)).z for v in lk.bound_box) < .02
        lk.hide_render = lk.hide_viewport = sunk
    for leg in R.legs:
        base = R.root.matrix_world @ leg['rest']
        if callable(feet): tgt = feet(leg, base)
        else: tgt = base + Vector((feet or {}).get((leg['side'], leg['i']), (0, 0, 0)))
        solve_leg(leg, tgt)
    bpy.context.view_layer.update()

ARM_REST = {
    'crusher': dict(shoulder=(-2, 32), elbow=35, claw=(.6, .72, .3), open_=.4),
    'gate':    dict(shoulder=(-8, 32), elbow=35, claw=(.6, .72, .05), open_=.5),
}
