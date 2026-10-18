# Princess character: KayKit Rogue (CC0) re-dressed in Blender as a princess and rendered as sprite frames for the game.
#   - atlas recolour: rose dress, honey-blonde hair, ivory gloves, white tights, rose shoes, gold trims
#   - the painted/modelled dot eyes, ridge brows and mouth crease are removed and replaced by an expressive face rig:
#     glossy eyeballs with a procedural iris/pupil/catch-lights, skin eyelids with a lash line, brow strokes and a
#     mouth decal that is re-shaped every frame, plus cheek blush; all parented to the head bone
#   - a gold filigree tiara with a faceted rose gem and pearl tips, and a flared bell skirt with a lace petticoat
#   - per-animation facial expressions (see EXPRESSIONS) keyed over each loop
# Run:  python3 art/princess.py <out_dir> <anim:frames>...
#   e.g. python3 art/princess.py assets/princess Idle:16 Interact:12 Blocking:8 Cheer:16 Running_A:12 Jump_Full_Short:14 Scared:8
# Options: <anim:frames:i,j,...> renders only those frame indices; --face renders a 4x close-up of the face instead
#          (files <anim>_face_XX.png); --samples N overrides the Cycles sample count; --threads N fixes the CPU threads.
import bpy, bmesh, sys, os, math, colorsys, addon_utils, mathutils
import numpy as np
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree

addon_utils.enable("cycles", default_set=True)
HERE = os.path.dirname(os.path.abspath(__file__))
argv = sys.argv[1:]
FACE = '--face' in argv
SAMPLES = 48
if '--samples' in argv:
    i = argv.index('--samples'); SAMPLES = int(argv[i + 1]); del argv[i:i + 2]
THREADS = 0
if '--threads' in argv:
    i = argv.index('--threads'); THREADS = int(argv[i + 1]); del argv[i:i + 2]
argv = [a for a in argv if a != '--face']
OUT = os.path.abspath(argv[0]) if argv else os.path.join(HERE, 'out', 'princess')
ANIMS = [a.split(':') for a in argv[1:]] or [['Idle', '12']]
PX = 3            # pixels per game unit
BOX = 56          # sprite cell in game units (square); character ~42 units tall
HEIGHT = 42
SOURCE = {'Scared': ('Block', 0.30, 0.90),     # new animations: KayKit action and the part of it to loop
          'Nervous': ('Walking_B', 0.0, 1.0), 'Panic': ('Running_A', 0.0, 1.0)}
# The glTF armature uses quaternion rotation, so every v1/v2 animation is rendered facing the camera head-on.
# The pacing animations turn her toward screen right (the game mirrors the sprite for leftward movement); the
# head then turns back toward the camera (see POSE_FX) so the face still reads.
YAW = {'Nervous': 58, 'Panic': 62}

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
bpy.ops.import_scene.gltf(filepath=os.path.join(HERE, '..', 'assets', 'models', 'kk_Rogue.glb'))
arm = next(o for o in sc.objects if o.type == 'ARMATURE')
for o in sc.objects:
    if o.type == 'MESH' and o.name in ('Knife_Offhand', '1H_Crossbow', '2H_Crossbow', 'Knife', 'Throwable', 'Icosphere', 'Rogue_Cape'):
        o.hide_render = True; o.hide_viewport = True
head = bpy.data.objects['Rogue_Head']; body = bpy.data.objects['Rogue_Body']

# ---------------------------------------------------------------- scale reference (identical to the v1 sprites)
# v1 measured the character at frame 1 from the feet to the tip of its crown; keep that exact scale so the
# sprite still fits the cage in the game.
sc.frame_set(1); bpy.context.view_layer.update()
hb = [head.matrix_world @ Vector(c) for c in head.bound_box]
_top = max(p.z for p in hb); _hw = max(p.x for p in hb) - min(p.x for p in hb)
_meshes = [o for o in sc.objects if o.type == 'MESH' and not o.hide_render]
_pts = [o.matrix_world @ Vector(c) for o in _meshes for c in o.bound_box]
Z0 = min(p.z for p in _pts); Z1 = _top + _hw * 0.225
CX = (min(p.x for p in _pts) + max(p.x for p in _pts)) / 2

# ---------------------------------------------------------------- atlas recolour
img = bpy.data.images['rogue_texture']
W, H = img.size
px = np.array(img.pixels[:], dtype=np.float32).reshape(H, W, 4)
def swatch(col, row):  # atlas is 8 x 4 swatches of 128 x 256, row 0 at the top of the image
    y1 = H - row * 256; return px[y1 - 256:y1, col * 128:(col + 1) * 128]
def recolor(col, row, fn):
    s = swatch(col, row); flat = s[..., :3].reshape(-1, 3)
    for i, (r, g, b) in enumerate(flat):
        flat[i] = colorsys.hls_to_rgb(*fn(*colorsys.rgb_to_hls(r, g, b)))
    s[..., :3] = flat.reshape(s.shape[0], s.shape[1], 3)
for c in ((0, 1), (1, 1), (1, 2)):                      # tunic, sleeves, collar -> rose
    recolor(*c, lambda h, l, s: (0.935, min(0.85, l * 1.25 + 0.12), min(1, s * 0.95)))
recolor(1, 0, lambda h, l, s: (0.105, min(0.66, l * 1.1 + 0.09), min(1, s * 1.8 + 0.25)))  # hair -> honey blonde
recolor(5, 2, lambda h, l, s: (0.06, 0.90 + (l - 0.4) * 0.35, 0.50))                       # gloves -> ivory satin
recolor(5, 0, lambda h, l, s: (0.95, 0.70 + (l - 0.4) * 0.6, 0.75))                        # puff shoulders, sash -> pink
recolor(6, 0, lambda h, l, s: (0.95, 0.66 + (l - 0.4) * 0.6, 0.65))                        # belt pouches -> pink
recolor(3, 0, lambda h, l, s: (0.12, 0.35 + l * 0.4, 0.85))                                # buckle, earring -> gold
recolor(7, 1, lambda h, l, s: (0.08, 0.86 + (l - 0.4) * 0.3, 0.45))                        # trousers -> white tights
recolor(3, 2, lambda h, l, s: (0.93, 0.30 + l * 0.45, 0.72))                               # boots -> rose shoes
img.pixels[:] = px.ravel()

def srgb2lin(c):
    c = np.asarray(c, dtype=np.float64)
    return tuple(np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4))
def atlas_color(u, v):
    return srgb2lin(px[min(H - 1, int(v * H)), min(W - 1, int(u * W)), :3])

# ---------------------------------------------------------------- materials
def principled(m):
    return next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
for m in bpy.data.materials:
    b = principled(m); b.inputs['Coat Weight'].default_value = 0.35; b.inputs['Coat Roughness'].default_value = 0.25
    b.inputs['Roughness'].default_value = 0.45

def mat(name, color, rough, metal=0.0, coat=0.0, **kw):
    m = bpy.data.materials.new(name); b = principled(m)
    b.inputs['Base Color'].default_value = (*color, 1); b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal; b.inputs['Coat Weight'].default_value = coat
    b.inputs['Coat Roughness'].default_value = 0.1
    for k, v in kw.items():
        b.inputs[k].default_value = v if not isinstance(v, tuple) else (*v, 1)[:len(b.inputs[k].default_value)]
    return m

# ---------------------------------------------------------------- body clean-up (rest pose)
arm.data.pose_position = 'REST'; bpy.context.view_layer.update()
def loose_parts(bm):
    bm.faces.ensure_lookup_table(); seen = set(); parts = []
    for f in bm.faces:
        if f.index in seen: continue
        stack = [f]; comp = []; seen.add(f.index)
        while stack:
            g = stack.pop(); comp.append(g)
            for e in g.edges:
                for h2 in e.link_faces:
                    if h2.index not in seen: seen.add(h2.index); stack.append(h2)
        parts.append(comp)
    return parts
def part_swatch(bm, comp):
    uvl = bm.loops.layers.uv.active
    u = sum(l[uvl].uv[0] for f in comp for l in f.loops) / sum(len(f.loops) for f in comp)
    v = sum(l[uvl].uv[1] for f in comp for l in f.loops) / sum(len(f.loops) for f in comp)
    return int(u * 8), int((1 - v) * 4)
bm = bmesh.new(); bm.from_mesh(body.data); kill = []
for comp in loose_parts(bm):          # hip pouch and belt buckles would poke out of the skirt
    c = sum((f.calc_center_median() for f in comp), Vector()) / len(comp)
    if part_swatch(bm, comp) in ((6, 0), (3, 0)) and c.z < 0.7: kill += comp
bmesh.ops.delete(bm, geom=kill, context='FACES'); bm.to_mesh(body.data); bm.free()
for side in ('Left', 'Right'):        # slimmer gloved hands
    o = bpy.data.objects[f'Rogue_Arm{side}']; bm = bmesh.new(); bm.from_mesh(o.data)
    hand = {v for comp in loose_parts(bm) if part_swatch(bm, comp) == (5, 2) for f in comp for v in f.verts}
    sx = 1 if side == 'Left' else -1
    piv = Vector((sx * 0.67, 0, sum(v.co.z for v in hand) / len(hand)))
    for v in hand: v.co = piv + (v.co - piv) * 0.84
    bm.to_mesh(o.data); bm.free()

# ---------------------------------------------------------------- head clean-up (rest pose, mesh space == world space)
arm.data.pose_position = 'REST'; bpy.context.view_layer.update()
me = head.data; bm = bmesh.new(); bm.from_mesh(me); bm.faces.ensure_lookup_table()
uvl = bm.loops.layers.uv.active
def swatch_of(f):
    u = sum(l[uvl].uv[0] for l in f.loops) / len(f.loops); v = sum(l[uvl].uv[1] for l in f.loops) / len(f.loops)
    return int(u * 8), int((1 - v) * 4)
seen = set(); parts = []
for f in bm.faces:
    if f.index in seen: continue
    stack = [f]; comp = []; seen.add(f.index)
    while stack:
        g = stack.pop(); comp.append(g)
        for e in g.edges:
            for h2 in e.link_faces:
                if h2.index not in seen: seen.add(h2.index); stack.append(h2)
    parts.append(comp)
kill = set(); nose = []
for comp in parts:
    vs = {v for f in comp for v in f.verts}; co = np.array([v.co[:] for v in vs])
    sw = swatch_of(comp[0]); lo, hi = co.min(0), co.max(0)
    if sw == (2, 0): kill |= set(comp)                                                     # dot eyes
    elif sw == (1, 0) and lo[2] > 1.68 and hi[2] < 1.78 and hi[1] < -0.3: kill |= set(comp)  # ridge brows
    elif sw == (0, 0) and len(comp) <= 6 and hi[1] < -0.4 and abs(lo[2] - 1.40) < 0.03: kill |= set(comp)  # mouth crease
    elif sw == (0, 0) and hi[1] < -0.3 and lo[1] < -0.49: nose.append(vs)                 # nose
nose_v = set().union(*nose)
base = Vector((0, -0.40, 1.485))
for v in nose_v:                                     # smaller, cuter button nose
    v.co = base + (v.co - base) * 0.62 + Vector((0, 0.035, 0))
bmesh.ops.delete(bm, geom=list(kill), context='FACES')
bm.to_mesh(me); bm.free(); me.update()

SKIN = atlas_color(0.06, 0.86)
BVH = BVHTree.FromObject(head, bpy.context.evaluated_depsgraph_get())

def surf(x, z):
    """frontmost point of the head (skin or hair) at face coords (x, z), and its normal"""
    hit = BVH.ray_cast(Vector((x, -2.0, z)), Vector((0, 1, 0)))
    if hit[0] is None: return Vector((x, -0.35, z)), Vector((0, -1, 0))
    n = hit[1] if hit[1].y < 0 else -hit[1]
    return hit[0], n

def bone_parent(o, bone):
    mw = o.matrix_world.copy(); o.parent = arm; o.parent_type = 'BONE'; o.parent_bone = bone; o.matrix_world = mw

def new_obj(name, mesh=None):
    o = bpy.data.objects.new(name, mesh); sc.collection.objects.link(o); return o

def mesh_obj(name, verts, faces, material=None, uvs=None, smooth=True):
    m = bpy.data.meshes.new(name); m.from_pydata(verts, [], faces)
    if uvs is not None:
        lay = m.uv_layers.new(name='UVMap')
        for poly in m.polygons:
            for li in poly.loop_indices: lay.data[li].uv = uvs[m.loops[li].vertex_index]
    if smooth: m.shade_smooth()
    o = new_obj(name, m)
    if material: m.materials.append(material)
    return o

def set_mesh(o, verts, faces, uvs=None):
    m = o.data; m.clear_geometry(); m.from_pydata(verts, [], faces)
    if uvs is not None:
        lay = m.uv_layers.get('UVMap') or m.uv_layers.new(name='UVMap')
        for poly in m.polygons:
            for li in poly.loop_indices: lay.data[li].uv = uvs[m.loops[li].vertex_index]
    m.shade_smooth(); m.update()

# ---------------------------------------------------------------- node helpers
class NT:
    def __init__(self, m):
        m.use_nodes = True; self.t = m.node_tree; self.n = self.t.nodes; self.l = self.t.links
    def node(self, kind, **props):
        nd = self.n.new(kind)
        for k, v in props.items(): setattr(nd, k, v)
        return nd
    def link(self, a, b): self.l.new(a, b)
    def math(self, op, a, b=None, clamp=False):
        nd = self.node('ShaderNodeMath', operation=op, use_clamp=clamp)
        for i, x in enumerate((a, b)):
            if x is None: continue
            if isinstance(x, (int, float)): nd.inputs[i].default_value = x
            else: self.link(x, nd.inputs[i])
        return nd.outputs[0]
    def smooth(self, x, e0, e1):   # 0 below e0, 1 above e1
        nd = self.node('ShaderNodeMapRange', interpolation_type='SMOOTHSTEP', clamp=True)
        self.link(x, nd.inputs['Value']); nd.inputs['From Min'].default_value = e0; nd.inputs['From Max'].default_value = e1
        return nd.outputs[0]
    def mix(self, fac, a, b):
        nd = self.node('ShaderNodeMix', data_type='RGBA', clamp_factor=True)
        for sock, x in ((nd.inputs[0], fac), (nd.inputs[6], a), (nd.inputs[7], b)):
            if isinstance(x, tuple): sock.default_value = (*x, 1) if len(x) == 3 else x
            elif isinstance(x, (int, float)): sock.default_value = x
            else: self.link(x, sock)
        return nd.outputs[2]
    def obj_radius(self, ob, sx=1.0, sz=1.0):  # distance in the X/Z plane of an empty's space
        tc = self.node('ShaderNodeTexCoord', object=ob)
        sep = self.node('ShaderNodeSeparateXYZ'); self.link(tc.outputs['Object'], sep.inputs[0])
        x = self.math('MULTIPLY', sep.outputs[0], sx); z = self.math('MULTIPLY', sep.outputs[2], sz)
        d = self.math('SQRT', self.math('ADD', self.math('MULTIPLY', x, x), self.math('MULTIPLY', z, z)))
        return d, sep
    def value(self, v):
        nd = self.node('ShaderNodeValue'); nd.outputs[0].default_value = v; return nd

# ---------------------------------------------------------------- eyes
EYE_X, EYE_Z = 0.208, 1.57          # eye centres on the face (head rest coords, +x = her left = screen right)
EYE_R = (0.105, 0.075, 0.137)        # half width, depth, half height
IRIS_TOP, IRIS_BOT = srgb2lin((0.03, 0.30, 0.36)), srgb2lin((0.25, 0.92, 0.85))
PUPIL = srgb2lin((0.05, 0.03, 0.10)); SCLERA = srgb2lin((0.98, 0.97, 1.0)); LASH = srgb2lin((0.16, 0.06, 0.08))
LIDSKIN = mat('lid_skin', SKIN, 0.45, coat=0.35)

def eye_material(name, iris_e, pupil_e, glint1, glint2):
    m = bpy.data.materials.new(name); t = NT(m); b = principled(m)
    d_i, sep_i = t.obj_radius(iris_e)
    d_p, _ = t.obj_radius(pupil_e)
    d_g1, _ = t.obj_radius(glint1); d_g2, _ = t.obj_radius(glint2)
    iris_m = t.math('SUBTRACT', 1.0, t.smooth(d_i, 0.93, 1.0))
    pupil_m = t.math('SUBTRACT', 1.0, t.smooth(d_p, 0.88, 1.0))
    glint = t.math('MAXIMUM', t.math('SUBTRACT', 1.0, t.smooth(d_g1, 0.85, 1.0)), t.math('SUBTRACT', 1.0, t.smooth(d_g2, 0.8, 1.0)))
    grad = t.math('SUBTRACT', 1.0, t.smooth(sep_i.outputs[2], -0.85, 0.75))
    iris = t.mix(grad, IRIS_TOP, IRIS_BOT)
    iris = t.mix(t.math('MULTIPLY', t.smooth(d_i, 0.72, 0.97), 0.85), iris, srgb2lin((0.02, 0.16, 0.22)))  # limbal ring
    sclera_shade = t.smooth(sep_i.outputs[2], 0.2, 1.6)                                                 # lid shadow
    sclera = t.mix(t.math('MULTIPLY', sclera_shade, 0.35), SCLERA, srgb2lin((0.72, 0.70, 0.86)))
    col = t.mix(iris_m, sclera, iris)
    col = t.mix(pupil_m, col, PUPIL)
    col = t.mix(glint, col, (1, 1, 1))
    t.link(col, b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = 0.12; b.inputs['Coat Weight'].default_value = 1.0; b.inputs['Coat Roughness'].default_value = 0.03
    b.inputs['Emission Color'].default_value = (1, 1, 1, 1); t.link(t.math('MULTIPLY', glint, 6.0), b.inputs['Emission Strength'])
    return m

def lid_material(name):
    m = bpy.data.materials.new(name); t = NT(m); b = principled(m)
    tc = t.node('ShaderNodeTexCoord'); sep = t.node('ShaderNodeSeparateXYZ'); t.link(tc.outputs['Object'], sep.inputs[0])
    z = t.math('ABSOLUTE', sep.outputs[2])
    lash = t.math('SUBTRACT', 1.0, t.smooth(z, 0.24, 0.34))
    t.link(t.mix(lash, SKIN, LASH), b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = 0.45; b.inputs['Coat Weight'].default_value = 0.35
    return m

def sphere_mesh(name, r, zmin=-2.0, zmax=2.0, seg=40, ring=24):
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=ring, radius=r)
    if zmin > -r or zmax < r:
        if zmin > -r: bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=(0, 0, zmin), plane_no=(0, 0, 1), clear_inner=True)
        if zmax < r: bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=(0, 0, zmax), plane_no=(0, 0, 1), clear_outer=True)
    m = bpy.data.meshes.new(name); bm.to_mesh(m); bm.free(); m.shade_smooth(); return m

EYES = []
for side in (1, -1):
    s = 'L' if side > 0 else 'R'
    p, n = surf(side * EYE_X, EYE_Z)
    fwd = (Vector((0, -1, 0)) * 0.55 + n * 0.45).normalized(); fwd.z = 0; fwd.normalize()
    x_ax = Vector((-fwd.y, fwd.x, 0)).normalized()
    if x_ax.x < 0: x_ax = -x_ax
    ctr = p - fwd * (EYE_R[1] * 0.42)
    root = new_obj(f'eye_{s}'); root.empty_display_size = 0.1
    rot = Matrix((x_ax, -fwd, Vector((0, 0, 1)))).transposed()
    root.matrix_world = Matrix.Translation(ctr) @ rot.to_4x4() @ Matrix.Diagonal((*EYE_R, 1))
    def child(o, parent=root):
        o.parent = parent; o.matrix_parent_inverse = Matrix.Identity(4); return o
    iris_e = child(new_obj(f'iris_{s}')); iris_e.location = (0, -1, 0)
    pupil_e = child(new_obj(f'pupil_{s}'), iris_e)
    g1 = child(new_obj(f'glint1_{s}')); g1.location = (-0.30, -1, 0.36); g1.scale = (0.24, 1, 0.21)
    g2 = child(new_obj(f'glint2_{s}')); g2.location = (0.26, -1, -0.38); g2.scale = (0.11, 1, 0.10)
    ball = child(new_obj(f'eyeball_{s}', sphere_mesh(f'eyeball_{s}', 1.0)))
    ball.data.materials.append(eye_material(f'eye_{s}', iris_e, pupil_e, g1, g2))
    lid = child(new_obj(f'lid_{s}', sphere_mesh(f'lid_{s}', 1.09, zmin=0.0))); lid.data.materials.append(lid_material(f'lid_{s}'))
    lid.rotation_mode = 'XYZ'
    low = child(new_obj(f'lowlid_{s}', sphere_mesh(f'lowlid_{s}', 1.075, zmax=0.0))); low.data.materials.append(LIDSKIN)
    low.rotation_mode = 'XYZ'
    # outer lash flick: a small curved tapered wedge at the outer upper corner of the lid
    lv, lf = [], []
    for i in range(7):
        a = i / 6
        ang = math.radians(25 + 40 * a)
        r = 1.10 + 0.05 * a
        w = 0.16 * (1 - a) + 0.02
        cx, cz = math.cos(ang) * r, math.sin(ang) * r
        lv += [(cx, -0.25, cz), (cx + 0.18 * a + 0.05, -0.25, cz + w * 0.2 + 0.08 * a * a + w)]
    for i in range(6): lf.append((2 * i, 2 * i + 2, 2 * i + 3, 2 * i + 1))
    lmat = mat(f'lashmat_{s}', LASH, 0.5)
    flick = child(mesh_obj(f'lash_{s}', lv, lf, lmat), lid)
    sol = flick.modifiers.new('t', 'SOLIDIFY'); sol.thickness = 0.12; sol.offset = 0
    EYES.append(dict(side=side, root=root, iris=iris_e, pupil=pupil_e, g1=g1, g2=g2, ball=ball, lid=lid, low=low,
                     flick=flick, base=root.matrix_world.copy(), ctr=ctr, fwd=fwd))

# ---------------------------------------------------------------- decals: brows, mouth, blush, closed-eye strokes
BROW_C = srgb2lin((0.36, 0.17, 0.07)); LINE_C = srgb2lin((0.30, 0.06, 0.09))
def flat_mat(name, color, rough=0.5, emit=0.0):
    return mat(name, color, rough, coat=0.2, **({'Emission Color': color, 'Emission Strength': emit} if emit else {}))
BROW_M = flat_mat('brow', BROW_C, 0.6)
LINE_M = flat_mat('mouth_line', LINE_C, 0.4)
CLOSED_M = flat_mat('closed_eye', LASH, 0.4)

def mouth_material():
    m = bpy.data.materials.new('mouth_fill'); t = NT(m); b = principled(m)
    uv = t.node('ShaderNodeUVMap', uv_map='UVMap'); sep = t.node('ShaderNodeSeparateXYZ'); t.link(uv.outputs[0], sep.inputs[0])
    u, v = sep.outputs[0], sep.outputs[1]
    teeth_on = t.value(1.0); grim_on = t.value(0.0); tongue_on = t.value(1.0)
    # tongue: ellipse resting on the lower lip
    tu = t.math('DIVIDE', u, 0.62); tv = t.math('DIVIDE', t.math('SUBTRACT', v, -0.05), 0.52)
    tongue = t.math('MULTIPLY', t.math('SUBTRACT', 1.0, t.smooth(t.math('ADD', t.math('MULTIPLY', tu, tu), t.math('MULTIPLY', tv, tv)), 0.85, 1.0)), tongue_on.outputs[0])
    teeth = t.math('MULTIPLY', t.smooth(v, 0.70, 0.76), teeth_on.outputs[0])
    teeth = t.math('MULTIPLY', teeth, t.math('SUBTRACT', 1.0, t.smooth(t.math('ABSOLUTE', u), 0.78, 0.9)))
    # grimace: clenched teeth filling the mouth, a dark bite line and tooth gaps
    gin = t.math('MULTIPLY', t.smooth(v, 0.12, 0.17), t.math('SUBTRACT', 1.0, t.smooth(v, 0.83, 0.88)))
    gin = t.math('MULTIPLY', gin, t.math('SUBTRACT', 1.0, t.smooth(t.math('ABSOLUTE', u), 0.86, 0.93)))
    bite = t.math('SUBTRACT', 1.0, t.smooth(t.math('ABSOLUTE', t.math('SUBTRACT', v, 0.5)), 0.035, 0.06))
    gap = t.math('SUBTRACT', 1.0, t.smooth(t.math('ABSOLUTE', t.math('SUBTRACT', t.math('FRACT', t.math('MULTIPLY', t.math('ADD', u, 1.0), 2.5)), 0.5)), 0.42, 0.47))
    gap = t.math('SUBTRACT', 1.0, gap)
    grim = t.math('MULTIPLY', t.math('MULTIPLY', gin, t.math('MULTIPLY', t.math('SUBTRACT', 1.0, bite), t.math('SUBTRACT', 1.0, t.math('MULTIPLY', gap, 0.7)))), grim_on.outputs[0])
    col = t.mix(tongue, srgb2lin((0.33, 0.04, 0.10)), srgb2lin((0.98, 0.42, 0.52)))
    col = t.mix(teeth, col, (0.97, 0.95, 0.96))
    col = t.mix(grim, col, (0.97, 0.95, 0.96))
    t.link(col, b.inputs['Base Color']); b.inputs['Roughness'].default_value = 0.3; b.inputs['Coat Weight'].default_value = 0.6
    return m, teeth_on, grim_on, tongue_on
MOUTH_M, TEETH_ON, GRIM_ON, TONGUE_ON = mouth_material()

def blush_material():
    m = bpy.data.materials.new('blush'); t = NT(m); b = principled(m)
    uv = t.node('ShaderNodeUVMap', uv_map='UVMap'); sep = t.node('ShaderNodeSeparateXYZ'); t.link(uv.outputs[0], sep.inputs[0])
    r = t.math('SQRT', t.math('ADD', t.math('MULTIPLY', sep.outputs[0], sep.outputs[0]), t.math('MULTIPLY', sep.outputs[1], sep.outputs[1])))
    strength = t.value(0.6)
    a = t.math('MULTIPLY', t.math('SUBTRACT', 1.0, t.smooth(r, 0.0, 1.0)), strength.outputs[0])
    mixs = t.node('ShaderNodeMixShader'); tr = t.node('ShaderNodeBsdfTransparent')
    b.inputs['Base Color'].default_value = (*srgb2lin((1.0, 0.42, 0.55)), 1); b.inputs['Roughness'].default_value = 0.5
    out = next(n for n in t.n if n.type == 'OUTPUT_MATERIAL')
    t.link(a, mixs.inputs[0]); t.link(tr.outputs[0], mixs.inputs[1]); t.link(b.outputs[0], mixs.inputs[2]); t.link(mixs.outputs[0], out.inputs[0])
    return m, strength
BLUSH_M, BLUSH_K = blush_material()

def project(pts2d, off, flatten=False):
    out = []
    for (x, z) in pts2d:
        p, n = surf(x, z); out.append(p + n * off)
    if flatten:   # strokes that cross a hair edge: keep each column at its frontmost depth
        for i in range(0, len(out) - 1, 2):
            y = min(out[i].y, out[i + 1].y); out[i].y = out[i + 1].y = y
    return [tuple(v) for v in out]

def ribbon(center, widths, off=0.006, flatten=False):
    """a stroke along a 2D polyline: verts in pairs (left, right), quads between"""
    pts, uvs = [], []
    n = len(center)
    for i, ((x, z), w) in enumerate(zip(center, widths)):
        a = center[max(0, i - 1)]; b = center[min(n - 1, i + 1)]
        tx, tz = b[0] - a[0], b[1] - a[1]; L = math.hypot(tx, tz) or 1; nx, nz = -tz / L, tx / L
        pts += [(x + nx * w / 2, z + nz * w / 2), (x - nx * w / 2, z - nz * w / 2)]
        uvs += [(i / (n - 1) * 2 - 1, 1), (i / (n - 1) * 2 - 1, -1)]
    faces = [(2 * i, 2 * i + 1, 2 * i + 3, 2 * i + 2) for i in range(n - 1)]
    return project(pts, off, flatten), faces, uvs

def taper(n, w, head=0.25, tail=0.25, min_w=0.15):
    out = []
    for i in range(n):
        a = i / (n - 1)
        k = min(1.0, a / head if head else 1, (1 - a) / tail if tail else 1)
        out.append(w * (min_w + (1 - min_w) * math.sin(k * math.pi / 2)))
    return out

def filled(top, bot, xs, off=0.005):
    """a filled mouth between a top and bottom curve; uv = (x / half width, 0 at the bottom lip .. 1 at the top lip)"""
    pts, uvs, NV = [], [], 7
    w = max(abs(x) for x in xs) or 1
    for x in xs:
        zt, zb = top(x), bot(x)
        for j in range(NV):
            v = j / (NV - 1); pts.append((x, zb + (zt - zb) * v)); uvs.append((x / w, v))
    faces = [(i * NV + j, (i + 1) * NV + j, (i + 1) * NV + j + 1, i * NV + j + 1) for i in range(len(xs) - 1) for j in range(NV - 1)]
    return project(pts, off), faces, uvs

def decal_obj(name, material):
    o = mesh_obj(name, [(0, 0, 0)] * 3, [(0, 1, 2)], material, uvs=[(0, 0)] * 3)
    bone_parent(o, 'head'); return o
BROWS = {s: decal_obj(f'brow_{s}', BROW_M) for s in (1, -1)}
CLOSED = {s: decal_obj(f'closed_{s}', CLOSED_M) for s in (1, -1)}
MOUTH_LINE = decal_obj('mouth_line', LINE_M)
MOUTH_FILL = decal_obj('mouth_fill', MOUTH_M)
BLUSH = decal_obj('blush', BLUSH_M)
for o in BROWS.values(): o.visible_shadow = False

def ellipse_fill(cx, cz, rx, rz, off):
    pts, uvs, faces, N, R = [], [], [], 28, 4
    pts.append((cx, cz)); uvs.append((0, 0))
    for r in range(1, R + 1):
        for i in range(N):
            a = i / N * math.tau; pts.append((cx + math.cos(a) * rx * r / R, cz + math.sin(a) * rz * r / R))
            uvs.append((math.cos(a) * r / R, math.sin(a) * r / R))
    for i in range(N): faces.append((0, 1 + i, 1 + (i + 1) % N))
    for r in range(1, R):
        for i in range(N):
            a0 = 1 + (r - 1) * N; a1 = 1 + r * N
            faces.append((a0 + i, a1 + i, a1 + (i + 1) % N, a0 + (i + 1) % N))
    return project(pts, off), faces, uvs

bv, bf, bu = [], [], []
for s in (1, -1):
    v, f, u = ellipse_fill(s * 0.30, 1.445, 0.085, 0.048, 0.004)
    o = len(bv); bv += v; bf += [tuple(i + o for i in t) for t in f]; bu += u
set_mesh(BLUSH, bv, bf, bu)

# ---------------------------------------------------------------- tiara
GOLD = mat('tiara_gold', (1.0, 0.66, 0.24), 0.16, 1.0)
GOLD_DK = mat('tiara_gold_band', (1.0, 0.68, 0.28), 0.22, 1.0)
GEM = mat('tiara_gem', srgb2lin((1.0, 0.30, 0.56)), 0.0, 0, 0, **{'Transmission Weight': 1.0, 'IOR': 2.1,
          'Emission Color': srgb2lin((1.0, 0.25, 0.5)), 'Emission Strength': 0.6})
PEARL = mat('pearl', srgb2lin((1.0, 0.95, 0.94)), 0.22, 0, 1.0, **{'Sheen Weight': 0.6, 'Sheen Tint': srgb2lin((1.0, 0.75, 0.85))})

T_ZF, T_ZB, T_Y = 2.03, 2.13, 0.03   # band height at the front and back, head axis y
T_ARC = math.radians(100)
def band_point(th, extra=0.012):
    z = T_ZF + (T_ZB - T_ZF) * (1 - math.cos(th)) / 2
    d = Vector((math.sin(th), -math.cos(th), 0))
    c = Vector((0, T_Y, z))
    hit = BVH.ray_cast(c + d * 2.0, -d)
    p = hit[0] if hit[0] is not None else c + d * 0.45
    return p + d * extra, d
UPV = Vector((0, 0.12, 0.99)).normalized()
def dome(a, c, w, H, p=0.6):
    x = abs(a - c) / w
    return H * (1 - x * x) ** p if x < 1 else 0.0
def crest_h(th):
    a = abs(th)
    h = 0.022 + 0.012 * abs(math.sin(a * math.pi / 0.115))            # scalloped edge along the band
    h = max(h, 0.19 * max(0.0, 1 - a / 0.23) ** 0.6)                  # slim pointed centre arch holding the gem
    h = max(h, dome(a, 0.50, 0.15, 0.11))                             # side domes (pearls)
    h = max(h, dome(a, 0.88, 0.12, 0.07))                             # outer domes (pearls)
    fade = min(1.0, (T_ARC - 0.08 - a) / 0.3)
    return h * max(0.0, fade)
def crest_dir(th, d):
    return (UPV * 1.0 + d * 0.18).normalized()
def crest_pt(th, hh):
    p, d = band_point(th); up = crest_dir(th, d)
    return p + up * hh + d * (0.002 - 0.3 * max(0.0, hh) ** 2), d, up

NT_ = 181
BAND_H, BAND_T = 0.036, 0.022
band_v, band_f = [], []
prof = [(-BAND_T / 2, -BAND_H / 2), (BAND_T / 2, -BAND_H / 2), (BAND_T / 2 + 0.006, 0), (BAND_T / 2, BAND_H / 2), (-BAND_T / 2, BAND_H / 2)]
np_ = len(prof)
for i in range(NT_):
    th = -T_ARC + 2 * T_ARC * i / (NT_ - 1)
    p, d = band_point(th); up = crest_dir(th, d)
    for (a_, b_) in prof: band_v.append(tuple(p + d * a_ + up * b_))
for i in range(NT_ - 1):
    for k in range(np_):
        a_, b_ = i * np_ + k, i * np_ + (k + 1) % np_
        band_f.append((a_, b_, b_ + np_, a_ + np_))
band_f += [tuple(range(np_))[::-1], tuple(range((NT_ - 1) * np_, NT_ * np_))]
band = mesh_obj('tiara_band', band_v, band_f, GOLD_DK)
md = band.modifiers.new('sub', 'SUBSURF'); md.levels = 1; md.render_levels = 2

# crest: a thin gold plate between the band and the crest_h profile, with round filigree openings
HOLES = [(0.50, 0.060, 0.027), (-0.50, 0.060, 0.027), (0.88, 0.045, 0.017), (-0.88, 0.045, 0.017)]
T_C, NTC, NS = T_ARC - 0.13, 401, 34
R_AX = 0.42
cv, cf, ghh = [], [], []
for i in range(NTC):
    th = -T_C + 2 * T_C * i / (NTC - 1); h = crest_h(th)
    for j in range(NS):
        hh = -BAND_H * 0.2 + (h + BAND_H * 0.5) * j / (NS - 1)
        cv.append(tuple(crest_pt(th, hh)[0])); ghh.append((th, hh))
for i in range(NTC - 1):
    for j in range(NS - 1):
        q = (i * NS + j, i * NS + j + 1, (i + 1) * NS + j + 1, (i + 1) * NS + j)
        th = sum(ghh[k][0] for k in q) / 4; hh = sum(ghh[k][1] for k in q) / 4
        if any(((th - tc) * R_AX) ** 2 + (hh - hc) ** 2 < r * r for tc, hc, r in HOLES): continue
        cf.append(q)
crest = mesh_obj('tiara_crest', cv, cf, GOLD)
crest.data.validate()
md = crest.modifiers.new('sol', 'SOLIDIFY'); md.thickness = 0.013; md.offset = 0
# rounded wire rims: around each opening and along the scalloped top edge
rims = []
for tc, hc, r in HOLES:
    c, d, up = crest_pt(tc, hc)
    bpy.ops.mesh.primitive_torus_add(major_radius=r, minor_radius=0.0085, major_segments=28, minor_segments=8, location=c)
    t_ = bpy.context.object; t_.matrix_world = Matrix.Translation(c) @ Matrix((up.cross(d).normalized(), up, d)).transposed().to_4x4()
    t_.data.materials.append(GOLD); t_.data.shade_smooth(); rims.append(t_)
cu = bpy.data.curves.new('tiara_edge', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = 0.0075; cu.bevel_resolution = 3; cu.use_fill_caps = True
sp = cu.splines.new('POLY'); edge = [crest_pt(th, crest_h(th) + BAND_H * 0.3)[0] for th in np.linspace(-T_C, T_C, 241)]
sp.points.add(len(edge) - 1)
for pt, e in zip(sp.points, edge): pt.co = (*e, 1)
edge_o = new_obj('tiara_edge', cu); cu.materials.append(GOLD); rims.append(edge_o)
# centre gem: a round brilliant facing out of the crest, in a gold bezel
gem_c, d0, up0 = crest_pt(0.0, 0.088); gem_c = gem_c + d0 * 0.013
gv, gf = [], []
NG, RG = 10, 0.047
gv.append((0, 0, -RG * 0.85))                                            # culet (pointing into the crest)
for i in range(NG):
    a = (i + 0.5) / NG * math.tau; gv.append((math.cos(a) * RG, math.sin(a) * RG * 1.15, 0))
for i in range(NG):
    a = i / NG * math.tau; gv.append((math.cos(a) * RG * 0.58, math.sin(a) * RG * 0.58 * 1.15, RG * 0.42))
for i in range(NG):
    gf.append((0, 1 + (i + 1) % NG, 1 + i))
    gf.append((1 + i, 1 + (i + 1) % NG, 1 + NG + (i + 1) % NG))
    gf.append((1 + i, 1 + NG + (i + 1) % NG, 1 + NG + i))
gf.append(tuple(1 + NG + i for i in range(NG)))
gem = mesh_obj('tiara_gem', gv, gf, GEM, smooth=False)
gem.matrix_world = Matrix.Translation(gem_c) @ d0.to_track_quat('Z', 'Y').to_matrix().to_4x4()
bpy.ops.mesh.primitive_torus_add(major_radius=RG * 1.05, minor_radius=0.009, major_segments=32, minor_segments=10, location=gem_c - d0 * 0.004)
bezel = bpy.context.object; bezel.data.materials.append(GOLD)
bezel.matrix_world = Matrix.Translation(gem_c - d0 * 0.004) @ d0.to_track_quat('Z', 'Y').to_matrix().to_4x4() @ Matrix.Diagonal((1, 1.15, 1, 1))
# pearls on the side peaks, and a little pearl on the gem's tip
pearls = []
for th, r in ((0.50, 0.029), (-0.50, 0.029), (0.88, 0.023), (-0.88, 0.023), (0.0, 0.022)):
    c, d, up = crest_pt(th, BAND_H * 0.3 + crest_h(th) + r * 0.75)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, segments=24, ring_count=12, location=c)
    pe = bpy.context.object; pe.data.materials.append(PEARL); bpy.ops.object.shade_smooth(); pearls.append(pe)
for o in [band, crest, gem, bezel] + rims + pearls:
    bone_parent(o, 'head')
TIARA = bpy.data.collections.new('tiara_lit')
for o in [band, crest, gem, bezel] + rims + pearls: TIARA.objects.link(o)

# ---------------------------------------------------------------- bell skirt with a lace petticoat
DRESS_C = atlas_color(0.06, 0.62)
DRESS = mat('dress', DRESS_C, 0.32, 0, 0.8, **{'Sheen Weight': 0.5, 'Sheen Tint': srgb2lin((1.0, 0.8, 0.9))})
LACE = mat('lace', srgb2lin((1.0, 0.93, 0.95)), 0.5, 0, 0.3, **{'Sheen Weight': 0.8})
WAIST_Z, HEM_Z = 0.66, 0.27
prof = [(0.355, 0.66), (0.40, 0.60), (0.47, 0.52), (0.54, 0.43), (0.60, 0.35), (0.635, 0.30), (0.645, 0.275)]
NA = 96
sv, sf = [], []
for i in range(NA):
    a = i / NA * math.tau
    for j, (r, z) in enumerate(prof):
        t_ = j / (len(prof) - 1)
        rr = r * (1 + 0.045 * t_ ** 1.5 * math.cos(a * 12))           # soft pleats opening toward the hem
        sv.append((math.sin(a) * rr, -math.cos(a) * rr * 0.92 + 0.0, z))
NP = len(prof)
for i in range(NA):
    for j in range(NP - 1):
        a, b = i * NP + j, ((i + 1) % NA) * NP + j
        sf.append((a, b, b + 1, a + 1))
skirt = mesh_obj('skirt', sv, sf, DRESS)
md = skirt.modifiers.new('sol', 'SOLIDIFY'); md.thickness = 0.025; md.offset = 1
md = skirt.modifiers.new('sub', 'SUBSURF'); md.levels = 1; md.render_levels = 2
# petticoat ruffle peeking under the hem
lv_, lf_ = [], []
NR = 192
for i in range(NR):
    a = i / NR * math.tau
    wav = 0.012 * math.sin(a * 36)
    for (dr, dz) in ((-0.035, 0.035), (0.0 + wav, -0.012), (0.02 + wav, -0.045)):
        rr = 0.62 + dr + 0.045 * math.cos(a * 12) * 0.6
        lv_.append((math.sin(a) * rr, -math.cos(a) * rr * 0.92, HEM_Z + dz))
for i in range(NR):
    for j in range(2):
        a, b = i * 3 + j, ((i + 1) % NR) * 3 + j
        lf_.append((a, b, b + 1, a + 1))
lace = mesh_obj('petticoat', lv_, lf_, LACE)
md = lace.modifiers.new('sol', 'SOLIDIFY'); md.thickness = 0.012
md = lace.modifiers.new('sub', 'SUBSURF'); md.levels = 1
# gold trim along the waist
tv, tf = [], []
for i in range(NA):
    a = i / NA * math.tau
    for (dr, dz) in ((0.0, 0.025), (0.012, 0.0), (0.0, -0.025)):
        r = 0.36 + dr
        tv.append((math.sin(a) * r, -math.cos(a) * r * 0.92, WAIST_Z - 0.02 + dz))
for i in range(NA):
    for j in range(2):
        a, b = i * 3 + j, ((i + 1) % NA) * 3 + j
        tf.append((a, b, b + 1, a + 1))
trim = mesh_obj('waist_trim', tv, tf, GOLD)
md = trim.modifiers.new('sol', 'SOLIDIFY'); md.thickness = 0.01
# skirt and petticoat are skinned: rigid on the hips at the waist, following each thigh toward the hem so a
# lifted knee pushes the skirt forward instead of poking through it
def skin_skirt(o):
    vg = {n: o.vertex_groups.new(name=n) for n in ('hips', 'upperleg.l', 'upperleg.r')}
    for v in o.data.vertices:
        t = max(0.0, min(1.0, (WAIST_Z - v.co.z) / (WAIST_Z - HEM_Z + 0.05)))
        leg = 0.45 * t ** 2.0
        wl = max(0.0, min(1.0, 0.5 + v.co.x / 0.36))
        vg['hips'].add([v.index], 1 - leg, 'REPLACE')
        vg['upperleg.l'].add([v.index], leg * wl, 'REPLACE')
        vg['upperleg.r'].add([v.index], leg * (1 - wl), 'REPLACE')
    o.parent = arm
    md = o.modifiers.new('arm', 'ARMATURE'); md.object = arm
    o.modifiers.move(o.modifiers.find('arm'), 0)
for o in (skirt, lace): skin_skirt(o)
bone_parent(trim, 'hips')

# ---------------------------------------------------------------- back to pose; parent the face rig; scale
for e in EYES:
    bone_parent(e['root'], 'head'); e['scale0'] = e['root'].scale.copy()
arm.data.pose_position = 'POSE'; bpy.context.view_layer.update()
k = (HEIGHT * 0.1) / (Z1 - Z0)
arm.scale = [s * k for s in arm.scale]; arm.location.z -= Z0 * k; arm.location.x -= CX * k
arm.rotation_mode = 'XYZ'   # (the old 'three-quarter view' rotation never applied: the importer leaves it quaternion)
bpy.context.view_layer.update()

# ---------------------------------------------------------------- expressions
NEUTRAL = dict(gx=0.0, gz=0.0, lid=0.16, low=0.0, iris=1.0, pupil=1.0, eye=1.0, glint=1.0, eyes='open',
               braise=0.0, btilt=0.0, mouth='smile', mw=1.0, mh=0.0, mc=0.5, wave=0.0, blush=0.55)

def apply_face(P):
    for e in EYES:
        s = e['side']
        e['iris'].location = (P['gx'] * 0.36, -1, P['gz'] * 0.30)
        r = 0.66 * P['iris']; e['iris'].scale = (r, 1, r * 1.08)
        pr = 0.46 * P['pupil'] / P['iris']; e['pupil'].scale = (pr, 1, pr * 1.1)
        g = P['glint']; e['g1'].scale = (0.24 * g, 1, 0.21 * g); e['g2'].scale = (0.11 * g, 1, 0.10 * g)
        # lids are hemispheres rotated about the eye's x axis; e = height of the lid edge at the front of the eye
        e['lid'].rotation_euler = (-math.asin(max(-1, min(1, 1 - 2 * P['lid']))), 0, 0)
        e['low'].rotation_euler = (-math.asin(max(-1, min(1, -1 + 2 * P['low']))), 0, 0)
        e['root'].scale = e['scale0'] * P['eye']
        show = P['eyes'] == 'open'
        for key in ('ball', 'lid', 'low', 'flick'): e[key].hide_render = not show
        # closed-eye strokes
        cx, cz = s * EYE_X, EYE_Z
        o = CLOSED[s]
        if P['eyes'] == 'happy':          # ^ arcs
            pts = [(cx + (i / 14 * 2 - 1) * 0.10, cz - 0.02 + 0.06 * (1 - (i / 14 * 2 - 1) ** 2)) for i in range(15)]
            v, f, u = ribbon(pts, taper(15, 0.034, 0.3, 0.3, 0.25), off=0.006); set_mesh(o, v, f, u); o.hide_render = False
        elif P['eyes'] == 'squeeze':      # > <  pointing at the nose
            pts = [(cx + s * (0.075 - 0.15 * (1 - abs(2 * (i / 14) - 1)) ** 1.3), cz + 0.075 * (1 - 2 * i / 14)) for i in range(15)]
            v, f, u = ribbon(pts, taper(15, 0.032, 0.3, 0.3, 0.3), off=0.006); set_mesh(o, v, f, u); o.hide_render = False
        else:
            o.hide_render = True
        # brows: inner end at x 0.10, outer at 0.30; tilt > 0 lifts the inner end (worry), < 0 drops it (anger)
        rz = P['braise'] * 0.035
        tilt = math.radians(P['btilt'])
        pts = []
        for i in range(13):
            t_ = i / 12
            x = 0.105 + t_ * 0.19; z = 1.765 + 0.018 * math.sin(t_ * math.pi) - 0.006 * t_
            dx, dz = x - 0.2, z - 1.765
            x2 = 0.2 + dx * math.cos(tilt) + dz * math.sin(tilt)
            z2 = 1.765 - dx * math.sin(tilt) + dz * math.cos(tilt) + rz
            pts.append((s * x2, z2))
        ws = [0.036 * (1 - 0.55 * (i / 12)) * min(1, (i + 1) / 2.5) for i in range(13)]
        v, f, u = ribbon(pts, ws, off=0.010, flatten=True); set_mesh(BROWS[s], v, f, u)
    # mouth
    MZ = 1.383; w = 0.075 * P['mw']; kind = P['mouth']
    xs = [w * -math.cos(i / 20 * math.pi) for i in range(21)]
    if kind in ('smile', 'frown', 'flat', 'wavy'):
        c = {'smile': 1.0, 'frown': -1.0, 'flat': 0.0, 'wavy': 0.0}[kind] * P['mc'] * 0.035
        pts = [(x, MZ + c * ((x / w) ** 2 - 0.4) + P['wave'] * 0.012 * math.sin((x / w) * math.pi * 1.5)) for x in xs]
        v, f, u = ribbon(pts, taper(21, 0.026, 0.25, 0.25, 0.3), off=0.006)
        set_mesh(MOUTH_LINE, v, f, u); MOUTH_LINE.hide_render = False; MOUTH_FILL.hide_render = True
    else:
        h = 0.02 + 0.10 * P['mh']; c = P['mc'] * 0.03
        TEETH_ON.outputs[0].default_value = 1.0 if kind == 'open' else 0.0
        GRIM_ON.outputs[0].default_value = 1.0 if kind == 'grimace' else 0.0
        TONGUE_ON.outputs[0].default_value = 0.0 if kind == 'grimace' else 1.0
        if kind == 'open':     # D-shaped laugh: flat top lifted at the corners, deep round bottom
            top = lambda x: MZ + 0.012 + c * (abs(x / w) ** 2.2) * 0.4
            bot = lambda x: MZ + 0.012 + c * 0.4 - (h + c * 0.4) * (1 - abs(x / w) ** 2.2) ** 0.75
        elif kind == 'O':      # oval scream
            top = lambda x: MZ - h * 0.35 + h * 0.6 * (1 - (x / w) ** 2) ** 0.5
            bot = lambda x: MZ - h * 0.35 - h * 0.6 * (1 - (x / w) ** 2) ** 0.5
        else:                  # grimace: wide clenched box, corners pulled down
            top = lambda x: MZ + h * 0.5 - c * (abs(x / w) ** 3) * 0.6 - 0.004 * (1 - (1 - abs(x / w) ** 6) ** 0.5) * 8
            bot = lambda x: MZ - h * 0.5 - c * (abs(x / w) ** 3) * 0.6 + 0.004 * (1 - (1 - abs(x / w) ** 6) ** 0.5) * 8
        v, f, u = filled(top, bot, xs)
        set_mesh(MOUTH_FILL, v, f, u); MOUTH_FILL.hide_render = False; MOUTH_LINE.hide_render = True
    BLUSH_K.outputs[0].default_value = P['blush']

def lerp_keys(keys, t):
    """keys: [(t, {param overrides})] sorted, each key inheriting the previous one; the loop wraps from the last key
    to the first. Numbers ease smoothly between keys, other values switch half way."""
    full, acc = [], dict(NEUTRAL)
    for kt, d in keys:
        acc = dict(acc); acc.update(d); full.append((kt, acc))
    idx = max([i for i, (kt, _) in enumerate(full) if kt <= t] or [len(full) - 1])
    t0, a = full[idx]; t1, b = full[(idx + 1) % len(full)]
    if t1 <= t0: t1 += 1.0
    tt = t if t >= t0 else t + 1.0
    u = (tt - t0) / (t1 - t0) if t1 > t0 else 0.0; u = u * u * (3 - 2 * u)
    return {k: (a[k] + (b[k] - a[k]) * u if isinstance(a[k], float) and isinstance(b[k], float) else (a[k] if u < 0.5 else b[k]))
            for k in a}

def F(**kw): return {k: (float(v) if isinstance(v, int) and not isinstance(v, bool) else v) for k, v in kw.items()}
WORRY = F(btilt=17, braise=0.35, mouth='wavy', mw=0.85, wave=1.0, mc=0.3, lid=0.2)
EXPRESSIONS = {
    # waiting in the cage: worried, glancing around, a peek up-right at the serpent, one blink
    'Idle': [(0.0, dict(WORRY, gx=-0.35, gz=-0.1)),
             (0.18, F(gx=-0.45, gz=-0.15)),
             (0.30, F(gx=0.55, gz=0.55, braise=0.6, btilt=20, mouth='flat', mw=0.7)),
             (0.48, F(gx=0.6, gz=0.6, lid=0.12)),
             (0.60, F(gx=0.0, gz=0.0, lid=0.2, mouth='wavy', mw=0.85)),
             (0.68, F(lid=1.0, braise=0.2)),
             (0.74, F(lid=0.2, braise=0.35)),
             (0.86, F(gx=-0.35, gz=-0.1))],
    # waving "Help!": pleading, scared, calling out
    'Interact': [(0.0, F(btilt=22, braise=0.7, lid=0.08, mouth='O', mw=0.9, mh=0.55, gx=0.35, gz=0.35, pupil=0.9, glint=1.25, blush=0.8)),
                 (0.30, F(mh=0.9, mw=1.0)),
                 (0.55, F(mh=0.5, mw=0.85, gx=0.25, gz=0.2)),
                 (0.80, F(mh=0.95, mw=1.0, gx=0.4, gz=0.4))],
    # ducking from the clang: eyes squeezed shut, grimace
    'Blocking': [(0.0, F(eyes='squeeze', btilt=-14, braise=-0.5, mouth='grimace', mw=1.25, mh=0.25, mc=0.6, blush=0.75)),
                 (0.5, F(mw=1.35, mh=0.3)),],
    # cage open / snake stunned: overjoyed ^ ^, wide open laugh
    'Cheer': [(0.0, F(eyes='happy', braise=0.8, btilt=-2, mouth='open', mw=1.25, mh=0.65, mc=0.8, blush=1.0)),
              (0.25, F(mh=0.9, mw=1.35)),
              (0.5, F(eyes='open', lid=0.05, low=0.18, glint=1.45, mh=0.8, gx=0.0, gz=0.15)),
              (0.75, F(eyes='happy', mh=0.95))],
    # escaping: determined but happy
    'Running_A': [(0.0, F(btilt=-9, braise=0.05, lid=0.24, low=0.12, mouth='open', mw=1.05, mh=0.45, mc=0.8, gx=-0.35, gz=0.05, glint=1.15, blush=0.75)),
                  (0.5, F(mh=0.55))],
    # hop out: excited, wide eyes, big smile
    'Jump_Full_Short': [(0.0, F(braise=0.6, btilt=-3, lid=0.10, mouth='open', mw=1.1, mh=0.5, mc=0.8, glint=1.3, blush=0.85)),
                        (0.35, F(eye=1.08, braise=1.0, lid=0.0, mh=0.85, mw=1.2, gz=0.25, glint=1.45)),
                        (0.7, F(eye=1.0, braise=0.7, mh=0.6))],
    # caught by the serpent: terrified, huge eyes, tiny pupils, scream
    'Scared': [(0.0, F(eye=1.14, lid=0.0, iris=0.62, pupil=0.42, glint=0.9, btilt=26, braise=1.0, mouth='O', mw=0.85, mh=0.95, gx=0.25, gz=0.25, blush=0.3)),
               (0.25, F(gx=0.32, gz=0.32, mh=1.0)),
               (0.5, F(gx=0.2, gz=0.28, mh=0.85, mw=0.8)),
               (0.75, F(gx=0.3, gz=0.22, mh=1.0, mw=0.9))],
}

# ---------------------------------------------------------------- pose layers on top of a KayKit clip (armature space:
# +x her left, -y forward, +z up). Applied after the clip is evaluated, with the action detached so the render keeps them.
def _rot(name, axis, deg):
    pb = arm.pose.bones[name]; M = pb.matrix.copy(); h = M.translation.copy()
    pb.matrix = Matrix.Translation(h) @ Matrix.Rotation(math.radians(deg), 4, Vector(axis)) @ Matrix.Translation(-h) @ M
    bpy.context.view_layer.update()
def _aim(name, d, roll=0.0):
    pb = arm.pose.bones[name]; M = pb.matrix.copy(); h = M.translation.copy()
    q = M.col[1].xyz.normalized().rotation_difference(Vector(d).normalized())
    R = Matrix.Rotation(math.radians(roll), 4, Vector(d).normalized()) @ q.to_matrix().to_4x4()
    pb.matrix = Matrix.Translation(h) @ R @ Matrix.Translation(-h) @ M
    bpy.context.view_layer.update()

def nervous_pose(i, n):
    ph = i / n * math.tau
    _rot('chest', (1, 0, 0), 9)                                   # hunched, shoulders up
    _rot('head', (0, 0, 1), -34 - 16 * math.sin(ph))              # darting glances back over her shoulder
    _rot('head', (1, 0, 0), -5)
    tr = 3 * math.sin(ph * 3)                                     # trembling hands
    for s in (1, -1):                                             # hands wrung together under her chin
        _aim(f'upperarm.{"l" if s > 0 else "r"}', (s * 0.10, -0.62, -0.78))
        _aim(f'lowerarm.{"l" if s > 0 else "r"}', (-s * 0.62, -0.45, 0.64 + 0.04 * tr))
        _aim(f'hand.{"l" if s > 0 else "r"}', (-s * 0.75, -0.35, 0.55))

def panic_pose(i, n):
    ph = i / n * math.tau
    _rot('head', (0, 0, 1), -28 - 8 * math.sin(ph))               # face turned back toward the camera / the serpent
    _rot('head', (1, 0, 0), 6)
    # arms flung up and out, flailing forward and back out of phase. (Straight up they vanish behind the big head.)
    for s in (1, -1):
        w = math.sin(ph * 2 + (0 if s > 0 else math.pi))
        b = f'{"l" if s > 0 else "r"}'
        _aim('upperarm.' + b, (s * 0.55, -0.62 * w, 0.42 + 0.12 * w))
        _aim('lowerarm.' + b, (s * 0.45, -0.45 * w - 0.15, 0.85))
        _aim('hand.' + b, (s * 0.35, -0.3 * w - 0.2, 0.9))
POSE_FX = {'Nervous': nervous_pose, 'Panic': panic_pose}

# pacing in the cage: on edge, wide eyes darting back at the serpent, small anxious open mouth
EXPRESSIONS['Nervous'] = [
    (0.0, F(eye=1.06, lid=0.02, low=0.05, iris=0.84, pupil=0.66, glint=1.15, btilt=24, braise=0.7, mouth='O', mw=0.55, mh=0.22, gx=0.15, gz=0.05, blush=0.35)),
    (0.25, F(gx=-0.55, gz=0.1, mh=0.32, mw=0.6, braise=0.85)),
    (0.5, F(gx=-0.65, gz=0.15, mh=0.26)),
    (0.62, F(lid=0.9, braise=0.6)),                              # nervous blink
    (0.70, F(lid=0.02, braise=0.8, gx=0.0)),
    (0.85, F(gx=0.25, gz=0.0, mh=0.18, mw=0.5))]
# running in circles: terrified, huge eyes, pinprick pupils, screaming
EXPRESSIONS['Panic'] = [
    (0.0, F(eye=1.16, lid=0.0, low=0.0, iris=0.6, pupil=0.4, glint=0.95, btilt=28, braise=1.05, mouth='O', mw=1.0, mh=1.1, gx=-0.45, gz=0.2, blush=0.25)),
    (0.25, F(mh=1.2, mw=1.05, gx=-0.55, gz=0.25)),
    (0.5, F(mh=0.95, mw=0.95, gx=-0.35, gz=0.15)),
    (0.75, F(mh=1.2, mw=1.05, gx=-0.55, gz=0.28))]

# ---------------------------------------------------------------- lights, camera (unchanged from v1)
def area(loc, rot, energy, size, color):
    bpy.ops.object.light_add(type='AREA', location=loc, rotation=rot)
    l = bpy.context.object.data; l.energy = energy; l.size = size; l.color = color
area((-20, -9, 34), (math.radians(20), math.radians(-30), 0), 30000, 10, (1.0, 0.9, 0.8))
area((0, -30, 3), (math.radians(90), 0, 0), 2600, 16, (1.0, 0.95, 0.95))  # soft frontal fill so the face reads
area((30, -25, -5), (math.radians(85), math.radians(50), 0), 4000, 14, (0.55, 0.65, 1.0))
area((8, 20, 8), (math.radians(-70), 0, 0), 5000, 10, (0.8, 0.85, 1.0))  # rim from behind
area((0, -12, -30), (math.radians(140), 0, 0), 1400, 20, (1.0, 0.6, 0.45))
bpy.ops.object.light_add(type='POINT', location=(3, -2, 3)); L = bpy.context.object.data; L.energy = 120; L.color = (1, 0.65, 0.35)  # lantern
area((-8, -16, 14), (math.radians(50), 0, math.radians(-25)), 2500, 3, (1.0, 0.97, 0.9))   # jewellery light, tiara only
bpy.context.object.light_linking.receiver_collection = TIARA
w = bpy.data.worlds.new('w'); sc.world = w; w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.05, 0.04, 0.09, 1)
bpy.ops.object.camera_add(location=(0, -40, BOX * 0.1 / 2 - 0.4), rotation=(math.radians(90), 0, 0))
cam = bpy.context.object; sc.camera = cam; cam.data.type = 'ORTHO'; cam.data.ortho_scale = BOX * 0.1
sc.render.engine = 'CYCLES'; sc.cycles.samples = SAMPLES; sc.cycles.use_denoising = True; sc.cycles.device = 'CPU'
if THREADS: sc.render.threads_mode = 'FIXED'; sc.render.threads = THREADS
sc.render.resolution_x = sc.render.resolution_y = BOX * PX; sc.render.film_transparent = True
sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast'
FACE_SPAN = 2.4   # Blender units framed by the face close-up (4x the sprite's pixel density)
if FACE:
    sc.render.resolution_x = sc.render.resolution_y = int(round(FACE_SPAN * 10 * PX * 4))
    cam.data.ortho_scale = FACE_SPAN
os.makedirs(OUT, exist_ok=True)
if not FACE: bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, 'princess.blend'))

for spec in ANIMS:
    name, n = spec[0], int(spec[1])
    only = [int(x) for x in spec[2].split(',')] if len(spec) > 2 else range(n)
    src, r0, r1 = SOURCE.get(name, (name, 0.0, 1.0))
    act = bpy.data.actions[src]
    arm.animation_data_create(); arm.animation_data.action = act
    if hasattr(arm.animation_data, 'action_slot') and act.slots: arm.animation_data.action_slot = act.slots[0]
    a0, a1 = act.frame_range; f0, f1 = a0 + (a1 - a0) * r0, a0 + (a1 - a0) * r1
    x0 = arm.location.x
    arm.rotation_euler = (0, 0, math.radians(YAW.get(name, 0)))
    for i in only:
        for pb in arm.pose.bones:   # clear any pose layer left by the previous frame (POSE_FX) before the clip re-keys it
            pb.location = (0, 0, 0); pb.rotation_quaternion = (1, 0, 0, 0); pb.scale = (1, 1, 1)
        arm.animation_data.action = act
        if hasattr(arm.animation_data, 'action_slot') and act.slots: arm.animation_data.action_slot = act.slots[0]
        if r0 > 0 or r1 < 1:   # a held section of an action: ping-pong so the loop has no pop
            ph = 1 - abs(1 - 2 * i / n); sc.frame_set(round(f0 + (f1 - f0) * ph))
        else:
            fr = f0 + (f1 - f0) * i / n; sc.frame_set(int(fr), subframe=fr - int(fr))   # even steps on fractional clips
        arm.location.x = x0 + (0.035 * (1 if i % 2 else -1) if name == 'Scared' else 0.0)   # trembling
        if name in POSE_FX:
            bpy.context.view_layer.update(); arm.animation_data.action = None; POSE_FX[name](i, n)
        apply_face(lerp_keys(EXPRESSIONS.get(name, [(0.0, {})]), i / n))
        bpy.context.view_layer.update()
        if FACE:
            hp = arm.matrix_world @ arm.pose.bones['head'].head
            cam.location = (hp.x - 0.05, -40, hp.z + 0.62)
            sc.render.filepath = os.path.join(OUT, f'{name}_face_{i:02d}.png')
        else:
            sc.render.filepath = os.path.join(OUT, f'{name}_{i:02d}.png')
        bpy.ops.render.render(write_still=True)
    arm.location.x = x0; arm.rotation_euler = (0, 0, 0)
    print('rendered', name, len(only))
