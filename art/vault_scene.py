# Blender look test for the Vault level: builds the board from art/vault-grid.json and renders a phone frame.
# Run: python3 art/vault_scene.py [out.png] [scale]
import bpy, json, math, random, sys, os, addon_utils

addon_utils.enable("cycles", default_set=True)
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'out', 'vault_look.png')
SCALE = float(sys.argv[2]) if len(sys.argv) > 2 else 0.5
G = json.load(open(os.path.join(HERE, 'vault-grid.json')))
COLS, ROWS = G['cols'], G['rows']
CW, CD, BH = 1.6, 1.2, 0.8           # cell width, cell depth (screen-up), brick height
TILT = math.radians(24)              # camera tilt from straight down: shows the bricks' front faces
random.seed(4)

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene

def mat(name, color, rough=0.4, metal=0.0, coat=0.0, coat_rough=0.05, sss=0.0, emit=None, emit_str=0.0):
    m = bpy.data.materials.new(name)
    nt = m.node_tree
    b = nt.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*color, 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    b.inputs['Coat Weight'].default_value = coat
    b.inputs['Coat Roughness'].default_value = coat_rough
    if sss:
        b.inputs['Subsurface Weight'].default_value = sss
        b.inputs['Subsurface Radius'].default_value = (0.4, 0.9, 0.7)
    if emit:
        b.inputs['Emission Color'].default_value = (*emit, 1); b.inputs['Emission Strength'].default_value = emit_str
    return m

def add_noise(m, scale=6.0, amount=0.25, bump=0.15, detail=6.0, color2=None):
    """Vary base color with noise and add a bump so surfaces don't read as flat CG."""
    nt = m.node_tree; b = nt.nodes['Principled BSDF']
    tc = nt.nodes.new('ShaderNodeTexCoord'); n = nt.nodes.new('ShaderNodeTexNoise')
    n.inputs['Scale'].default_value = scale; n.inputs['Detail'].default_value = detail
    nt.links.new(tc.outputs['Object'], n.inputs['Vector'])
    base = b.inputs['Base Color'].default_value[:]
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    c2 = color2 or tuple(max(0, c * (1 - amount)) for c in base[:3])
    ramp.color_ramp.elements[0].color = (*c2, 1); ramp.color_ramp.elements[1].color = base
    nt.links.new(n.outputs['Fac'], ramp.inputs['Fac']); nt.links.new(ramp.outputs['Color'], b.inputs['Base Color'])
    bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = bump; bp.inputs['Distance'].default_value = 0.05
    nt.links.new(n.outputs['Fac'], bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    return m

srgb = lambda h: tuple(((int(h[i:i + 2], 16) / 255) ** 2.2) for i in (1, 3, 5))
M = {
    1: add_noise(mat('sandstone', srgb('#e2ad6c'), rough=0.42, coat=0.35, coat_rough=0.25), scale=9, amount=0.22, bump=0.25),
    2: add_noise(mat('jade', srgb('#1aa392'), rough=0.16, coat=1.0, coat_rough=0.03, sss=0.15), scale=3, amount=0.3, bump=0.03, color2=srgb('#0d6e6a')),
    3: mat('gold', srgb('#ffc94a'), rough=0.16, metal=1.0),
    9: add_noise(mat('iron', srgb('#454c66'), rough=0.33, metal=0.85), scale=14, amount=0.25, bump=0.08),
}
RUBY = mat('ruby', srgb('#e02a52'), rough=0.05, coat=1.0, sss=0.3)
RIVET = mat('rivet', srgb('#9aa3bd'), rough=0.2, metal=1.0)
FLOOR = add_noise(mat('floor', srgb('#1d1a2c'), rough=0.7), scale=2.5, amount=0.45, bump=0.4, detail=10)
SLAB = add_noise(mat('slab', srgb('#2c2840'), rough=0.55, coat=0.2), scale=4, amount=0.35, bump=0.3)
TRIM = mat('trim', srgb('#d6a441'), rough=0.22, metal=1.0)
BARS = mat('bars', srgb('#ffcf6a'), rough=0.12, metal=1.0)

def brick_mesh(name, sx, sy, sz, bevel):
    bpy.ops.mesh.primitive_cube_add(size=1)
    o = bpy.context.object; o.name = name; o.scale = (sx, sy, sz)
    bpy.ops.object.transform_apply(scale=True)
    md = o.modifiers.new('bev', 'BEVEL'); md.width = bevel; md.segments = 5; md.limit_method = 'NONE'
    bpy.ops.object.modifier_apply(modifier='bev')
    bpy.ops.object.shade_smooth()
    return o

protos = {}
for v, m in M.items():
    o = brick_mesh(f'proto{v}', CW * 0.94, CD * 0.92, BH, 0.16 if v != 9 else 0.1)
    o.data.materials.append(m); o.hide_render = True; o.hide_viewport = True
    protos[v] = o

def place(v, c, r):
    p = protos[v]
    o = bpy.data.objects.new(f'b{c}_{r}', p.data)
    sc.collection.objects.link(o)
    x, y = c * CW + CW / 2, -(r * CD + CD / 2)
    jitter = 0 if v == 9 else 1
    o.location = (x + random.uniform(-0.03, 0.03) * jitter, y + random.uniform(-0.02, 0.02) * jitter, BH / 2 + random.uniform(0, 0.04) * jitter)
    o.rotation_euler = (0, 0, math.radians(random.uniform(-1.6, 1.6)) * jitter)
    if v == 3:  # ruby on the gold bricks
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.28, segments=8, ring_count=4, location=(x, y, BH + 0.05))
        g = bpy.context.object; g.scale = (1, 0.8, 0.55); g.data.materials.append(RUBY)
    if v == 9:
        for dx, dy in ((-0.55, -0.38), (0.55, -0.38), (-0.55, 0.38), (0.55, 0.38)):
            bpy.ops.mesh.primitive_uv_sphere_add(radius=0.09, segments=10, ring_count=6, location=(x + dx, y + dy, BH + 0.01))
            bpy.context.object.data.materials.append(RIVET)

cells = [list(map(int, row.split(','))) for row in G['cells']]
for r in range(ROWS):
    for c in range(COLS):
        if cells[r][c]: place(cells[r][c], c, r)

bw, bd = COLS * CW, ROWS * CD
cx, cy = bw / 2, -bd / 2
# recessed floor of the vault and the stone slab it sits in
bpy.ops.mesh.primitive_plane_add(size=1, location=(cx, cy, 0.0)); f = bpy.context.object; f.scale = (bw, bd, 1); f.data.materials.append(FLOOR)
s = brick_mesh('slab', bw + 1.6, bd + 1.6, 0.6, 0.25); s.location = (cx, cy, -0.32); s.data.materials.append(SLAB)
t = brick_mesh('trim', bw + 2.2, bd + 2.2, 0.3, 0.12); t.location = (cx, cy, -0.6); t.data.materials.append(TRIM)
bpy.ops.mesh.primitive_plane_add(size=400, location=(cx, cy, -0.75)); g = bpy.context.object; g.data.materials.append(add_noise(mat('ground', srgb('#141224'), rough=0.8), scale=0.6, amount=0.5, bump=0.3))

# gold cage bars over the fox pocket (cols 8-11, rows 3-5)
for i in range(1, 6):
    x = 8 * CW + (4 * CW) * i / 6
    bpy.ops.mesh.primitive_cylinder_add(radius=0.09, depth=3 * CD + 0.2, location=(x, -(3 * CD + 1.5 * CD), BH + 0.3), rotation=(math.pi / 2, 0, 0))
    bpy.context.object.data.materials.append(BARS)

# lights: warm key from top-left, cool fill, rim, and a lantern glow inside the pocket
def area(loc, rot, energy, size, color):
    bpy.ops.object.light_add(type='AREA', location=loc, rotation=rot)
    l = bpy.context.object.data; l.energy = energy; l.size = size; l.color = color
area((cx - 22, cy + 20, 30), (math.radians(35), math.radians(-35), 0), 9000, 14, (1.0, 0.9, 0.78))
area((cx + 26, cy - 10, 18), (math.radians(50), math.radians(50), 0), 2500, 12, (0.6, 0.72, 1.0))
area((cx, cy + 40, 10), (math.radians(-70), 0, 0), 3000, 20, (0.9, 0.85, 1.0))
bpy.ops.object.light_add(type='POINT', location=(10 * CW, -4.5 * CD, 1.4))
pl = bpy.context.object.data; pl.energy = 220; pl.color = (1.0, 0.62, 0.3); pl.shadow_soft_size = 0.5

# world: dark indigo with a soft overhead glow so glossy tops pick up a highlight gradient
w = bpy.data.worlds.new('w'); sc.world = w
nt = w.node_tree; bg = nt.nodes['Background']
grad = nt.nodes.new('ShaderNodeTexGradient'); grad.gradient_type = 'SPHERICAL'
tc = nt.nodes.new('ShaderNodeTexCoord'); ramp = nt.nodes.new('ShaderNodeValToRGB')
ramp.color_ramp.elements[0].color = (0.012, 0.012, 0.03, 1); ramp.color_ramp.elements[1].color = (0.09, 0.08, 0.16, 1)
nt.links.new(tc.outputs['Generated'], grad.inputs['Vector']); nt.links.new(grad.outputs['Fac'], ramp.inputs['Fac']); nt.links.new(ramp.outputs['Color'], bg.inputs['Color'])
bg.inputs['Strength'].default_value = 1.0

# orthographic camera framing a 360 x 700 phone screen (1 game unit = 0.1 m)
PW, PH = 360, 700
bpy.ops.object.camera_add(); cam = bpy.context.object; sc.camera = cam
cam.data.type = 'ORTHO'; cam.data.ortho_scale = PH * 0.1
cam.rotation_euler = (TILT, 0, 0)
d = 60
look = (cx, cy - 2.0, 0)
cam.location = (look[0], look[1] - d * math.sin(TILT), d * math.cos(TILT))
sc.render.resolution_x = int(PW * 3 * SCALE); sc.render.resolution_y = int(PH * 3 * SCALE)
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = 96; sc.cycles.use_denoising = True
sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast'
sc.render.filepath = OUT
os.makedirs(os.path.dirname(OUT), exist_ok=True)
bpy.ops.render.render(write_still=True)
print('wrote', OUT)
