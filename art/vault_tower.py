# Blender look test v3, side view: the Vault as a cutaway tower wall with big glazed bricks. Bricks are laid in running bond,
# holes reveal the dark interior, the fox's chamber is lit by a lantern.
# Run: python3 art/vault_side.py [out.png] [scale] [fox.glb]
import bpy, json, math, random, sys, os, addon_utils

addon_utils.enable("cycles", default_set=True)
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'out', 'vault_side.png')
SCALE = float(sys.argv[2]) if len(sys.argv) > 2 else 0.5
FOX = sys.argv[3] if len(sys.argv) > 3 else None
G = json.load(open(os.path.join(HERE, 'vault-grid.json')))
COLS, ROWS = G['cols'], G['rows']
U = 0.1                                  # metres per game unit
CW, CH = G['cw'] * U, G['ch'] * U        # 1.6 x 1.2
MORTAR = 0.07
OX, OY = 20 * U, 84 * U                  # board origin on the 360 x 700 screen
PW, PH = 360, 700
random.seed(7)
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene

def S(x, y):  # screen units (y down) -> Blender XZ (z up); wall face at y=0, camera at -y
    return (x * U, -y * U)

def mat(name, color, rough=0.4, metal=0.0, coat=0.0, coat_rough=0.05, sss=0.0, emit=None, emit_str=0.0):
    m = bpy.data.materials.new(name); b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*color, 1); b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal; b.inputs['Coat Weight'].default_value = coat
    b.inputs['Coat Roughness'].default_value = coat_rough
    if sss: b.inputs['Subsurface Weight'].default_value = sss
    if emit: b.inputs['Emission Color'].default_value = (*emit, 1); b.inputs['Emission Strength'].default_value = emit_str
    return m

def noisy(m, scale=6.0, amount=0.25, bump=0.15, detail=6.0, color2=None, vor=False):
    nt = m.node_tree; b = nt.nodes['Principled BSDF']
    tc = nt.nodes.new('ShaderNodeTexCoord')
    n = nt.nodes.new('ShaderNodeTexVoronoi' if vor else 'ShaderNodeTexNoise'); n.inputs['Scale'].default_value = scale
    if not vor: n.inputs['Detail'].default_value = detail
    nt.links.new(tc.outputs['Object'], n.inputs['Vector'])
    out = n.outputs['Distance'] if vor else n.outputs['Fac']
    base = b.inputs['Base Color'].default_value[:]
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].color = (*(color2 or tuple(c * (1 - amount) for c in base[:3])), 1); ramp.color_ramp.elements[1].color = base
    nt.links.new(out, ramp.inputs['Fac']); nt.links.new(ramp.outputs['Color'], b.inputs['Base Color'])
    bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = bump; bp.inputs['Distance'].default_value = 0.04
    nt.links.new(out, bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    return m

srgb = lambda h: tuple(((int(h[i:i + 2], 16) / 255) ** 2.2) for i in (1, 3, 5))
SAND = noisy(mat('sand', srgb('#f0b46e'), rough=0.38, coat=0.5, coat_rough=0.18), scale=7, amount=0.2, bump=0.3)
JADE = noisy(mat('jade', srgb('#19b3a0'), rough=0.12, coat=1.0, coat_rough=0.02, sss=0.2), scale=2.5, amount=0.35, bump=0.02, color2=srgb('#0b6d68'))
GOLD = mat('gold', srgb('#ffc94a'), rough=0.14, metal=1.0)
RUBY = mat('ruby', srgb('#ff2f5e'), rough=0.04, coat=1.0, sss=0.3)
GRANITE = noisy(mat('granite', srgb('#4a4f6e'), rough=0.45, coat=0.3), scale=18, amount=0.35, bump=0.25)
IRON = mat('iron', srgb('#2a2e3e'), rough=0.3, metal=0.9)
RIVET = mat('rivet', srgb('#b8c0d6'), rough=0.2, metal=1.0)
INTERIOR = noisy(mat('interior', srgb('#2a1f2e'), rough=0.9), scale=3, amount=0.6, bump=0.6, vor=True)
MORT = noisy(mat('mortar', srgb('#3a3046'), rough=0.95), scale=40, amount=0.4, bump=0.3)
WOOD = noisy(mat('wood', srgb('#8a5a35'), rough=0.6), scale=1.5, amount=0.45, bump=0.2)
BARS = mat('bars', srgb('#ffd27a'), rough=0.1, metal=1.0)

def box(name, w, h, d, bevel, m, loc, segs=4):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.object; o.name = name; o.scale = (w, d, h); bpy.ops.object.transform_apply(scale=True)
    if bevel:
        md = o.modifiers.new('b', 'BEVEL'); md.width = bevel; md.segments = segs; md.limit_method = 'NONE'
        bpy.ops.object.modifier_apply(modifier='b')
    bpy.ops.object.shade_smooth(); o.data.materials.append(m)
    return o

LAYOUT = [  # 20 x 20 cells of 16 x 16 units; bricks are laid two cells wide in running bond
    "tttttttttttttttt....",
    "tttttttttttttttt....",
    "tttttt########tttttt",
    "tttttt#......#tttttt",
    "ttgttt#......#tttgtt",
    "tttttt#......#tttttt",
    "vvvvvvvvvvvvvvvvvvvv",
    "vvvvvvvvvvvvvvvvvvvv",
    "vvv##vvvvgvvvvvv##vv",
    "vvvvvvvvvvvvvvvvvvvv",
    "cccccccccccccccccccc",
    "ccccccccc..ccccccccc",
    "ccgcccccc..cccccgccc",
    "cccc###cc..cc###cccc",
    "yyyyyyyyy..yyyyyyyyy",
    "yyyyy......yyyyyyyyy",
    "yyyyy..yyyyyyyyyyyyy",
    "yyyyy..yyygyyyyyy..y",
    "yyyyy..yyyyyyyyyy..y",
    "yyyyy..yyyyyyyyyy..y",
]
COLS, ROWS = 20, 20
CELL = 16
OX, OY = 20 * U, 96 * U
CW = CH = CELL * U
cells = [list(row) for row in LAYOUT]
DEPTH = 1.2
GLAZE = {k: mat('glaze_' + k, srgb(h), rough=0.28, coat=1.0, coat_rough=0.02, sss=0.12)
         for k, h in {'t': '#22c4b0', 'v': '#8f5cf0', 'c': '#ff6f61', 'y': '#ffc73d'}.items()}
done = set()
for r in range(ROWS):
    for c in range(COLS):
        v = cells[r][c]
        if v in '.' or (c, r) in done: continue
        x0, y0 = OX / U + c * CELL, OY / U + r * CELL
        if v in GLAZE:
            w = CELL
            if (c + r) % 2 == 0 and c + 1 < COLS and cells[r][c + 1] == v: done.add((c + 1, r)); w = 2 * CELL
            done.add((c, r))
            cx, cz = S(x0 + w / 2, y0 + CELL / 2)
            o = box(f'b{c}_{r}', w * U - MORTAR, CH - MORTAR, DEPTH, 0.3, GLAZE[v], (cx, -DEPTH / 2 - random.uniform(0, 0.03), cz), segs=8)
        elif v == 'g':
            done.add((c, r)); cx, cz = S(x0 + CELL / 2, y0 + CELL / 2)
            box(f'g{c}_{r}', CW - MORTAR, CH - MORTAR, DEPTH, 0.12, GOLD, (cx, -DEPTH / 2 - 0.05, cz), segs=6)
            bpy.ops.mesh.primitive_ico_sphere_add(radius=0.42, subdivisions=1, location=(cx, -DEPTH - 0.14, cz))
            g = bpy.context.object; g.scale = (1, 0.5, 1); g.data.materials.append(RUBY)
        elif v == '#':
            done.add((c, r)); cx, cz = S(x0 + CELL / 2, y0 + CELL / 2)
            box(f'r{c}_{r}', CW - MORTAR * 0.5, CH - MORTAR * 0.5, DEPTH + 0.2, 0.08, GRANITE, (cx, -(DEPTH + 0.2) / 2, cz))
            for dx in (-0.48, 0.48):
                for dz in (-0.48, 0.48):
                    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.11, segments=10, ring_count=6, location=(cx + dx, -DEPTH - 0.24, cz + dz))
                    bpy.context.object.data.materials.append(RIVET)

# --- back wall (seen through holes) and mortar bed ---
bw, bh = COLS * CELL, ROWS * CELL
cx, cz = S(OX / U + bw / 2, OY / U + bh / 2)
box('interior', bw * U, bh * U, 0.4, 0, INTERIOR, (cx, 0.9, cz))
box('mortarbed', bw * U, bh * U, 0.2, 0, MORT, (cx, 0.05, cz))
# fox chamber: wooden planks on the back wall, a lantern and gold bars
pc, pr = 7, 3
px0, py0 = OX / U + pc * 16, OY / U + pr * 12
ccx, ccz = S(px0 + 48, py0 + 24)
box('chamber', 96 * U, 48 * U, 0.1, 0, WOOD, (ccx, 0.6, ccz))
for i in range(1, 6):
    bx, _ = S(px0 + 96 * i / 6, 0)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.07, depth=48 * U, location=(bx, -DEPTH - 0.1, ccz)); bpy.context.object.data.materials.append(BARS)
bpy.ops.object.light_add(type='POINT', location=(ccx + 1.6, -0.2, ccz + 1.0)); L = bpy.context.object.data; L.energy = 60; L.color = (1, 0.6, 0.28); L.shadow_soft_size = 0.3
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.18, location=(ccx + 1.6, -0.1, ccz + 1.0)); bpy.context.object.data.materials.append(mat('flame', (1, 0.6, 0.2), emit=(1, 0.55, 0.2), emit_str=30))
if FOX and os.path.exists(FOX):
    bpy.ops.import_scene.gltf(filepath=FOX)
    root = [o for o in bpy.context.selected_objects if o.parent is None][0]
    # scale to roughly two cells tall, sit on the chamber floor facing the camera
    import mathutils
    pts = [o.matrix_world @ mathutils.Vector(v) for o in bpy.context.selected_objects if o.type == 'MESH' for v in o.bound_box]
    hgt = max(p.z for p in pts) - min(p.z for p in pts)
    k = 2.6 / hgt; root.scale = [s * k for s in root.scale]
    root.rotation_euler = (0, 0, math.radians(-20))
    bpy.context.view_layer.update()
    pts = [o.matrix_world @ mathutils.Vector(v) for o in bpy.context.selected_objects if o.type == 'MESH' for v in o.bound_box]
    root.location.x += ccx - (max(p.x for p in pts) + min(p.x for p in pts)) / 2
    root.location.y += -0.2 - (max(p.y for p in pts) + min(p.y for p in pts)) / 2
    root.location.z += (ccz - 48 * U / 2) - min(p.z for p in pts)

# --- tower shell: big stone pillars left/right, battlements on top, ground at the bottom ---
for side in (-1, 1):
    x = cx + side * (bw * U / 2 + 0.9)
    box(f'pillar{side}', 1.8, bh * U + 4, 1.8, 0.2, GRANITE, (x, -0.5, cz + 1))
for i in range(11):
    x = cx - bw * U / 2 - 0.8 + i * (bw * U + 1.6) / 10
    box(f'merlon{i}', 1.6, 1.4, 1.6, 0.15, GRANITE, (x, -0.5, cz + bh * U / 2 + 1.3))
box('cornice', bw * U + 4, 0.6, 2.0, 0.15, GRANITE, (cx, -0.5, cz + bh * U / 2 + 0.4))
# courtyard wall behind the paddle: big dark blocks set back from the play plane, two torches
base = OY / U + bh
for row in range(9):
    off = 40 if row % 2 else 0
    for i in range(-1, 6):
        x0 = i * 80 + off; y0 = base + 8 + row * 40
        bx, bz = S(x0 + 40, y0 + 20)
        box(f'cw{row}_{i}', 80 * U - 0.15, 40 * U - 0.15, 1.0, 0.18, GRANITE, (bx, 2.5 + random.uniform(0, 0.15), bz))
box('plinth', bw * U + 4, 0.9, 2.2, 0.15, GRANITE, (cx, -0.5, -(base + 4) * U))
for side in (-1, 1):
    tx, tz = S(180 + side * 140, base + 120)
    box(f'sconce{side}', 0.5, 1.2, 0.6, 0.1, IRON, (tx, 1.6, tz))
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.35, location=(tx, 1.3, tz + 0.9)); f = bpy.context.object; f.scale = (0.8, 0.8, 1.4)
    f.data.materials.append(mat('torch', (1, 0.5, 0.15), emit=(1, 0.45, 0.12), emit_str=40))
    bpy.ops.object.light_add(type='POINT', location=(tx, 0.6, tz + 1.2)); L = bpy.context.object.data; L.energy = 900; L.color = (1, 0.55, 0.25); L.shadow_soft_size = 0.4

# --- sky: dusk gradient world, a big warm moon light from the top-left ---
w = bpy.data.worlds.new('w'); sc.world = w
nt = w.node_tree; bg = nt.nodes['Background']
tc = nt.nodes.new('ShaderNodeTexCoord'); sep = nt.nodes.new('ShaderNodeSeparateXYZ'); ramp = nt.nodes.new('ShaderNodeValToRGB')
nt.links.new(tc.outputs['Generated'], sep.inputs['Vector']); nt.links.new(sep.outputs['Z'], ramp.inputs['Fac'])
ramp.color_ramp.elements[0].position = 0.45; ramp.color_ramp.elements[0].color = (0.02, 0.015, 0.05, 1)
ramp.color_ramp.elements[1].color = (0.25, 0.12, 0.3, 1)
nt.links.new(ramp.outputs['Color'], bg.inputs['Color']); bg.inputs['Strength'].default_value = 0.8

def area(loc, rot, energy, size, color):
    bpy.ops.object.light_add(type='AREA', location=loc, rotation=rot)
    l = bpy.context.object.data; l.energy = energy; l.size = size; l.color = color
area((cx - 20, -9, cz + 34), (math.radians(20), math.radians(-30), 0), 22000, 10, (1.0, 0.86, 0.72))   # key
area((cx + 30, -25, cz - 5), (math.radians(85), math.radians(50), 0), 2500, 14, (0.55, 0.65, 1.0))     # cool fill
area((cx, -10, cz - 45), (math.radians(140), 0, 0), 2500, 30, (1.0, 0.5, 0.65))                         # warm bounce from below

bpy.ops.mesh.primitive_plane_add(size=1, location=(PW / 2 * U, -40, -PH / 2 * U + 20), rotation=(math.radians(90), 0, 0))
sb = bpy.context.object; sb.scale = (60, 50, 1); sb.visible_camera = False; sb.visible_shadow = False
sm = bpy.data.materials.new('softbox'); nt = sm.node_tree; nt.nodes.remove(nt.nodes['Principled BSDF'])
em = nt.nodes.new('ShaderNodeEmission'); tc = nt.nodes.new('ShaderNodeTexCoord'); sp = nt.nodes.new('ShaderNodeSeparateXYZ'); rp = nt.nodes.new('ShaderNodeValToRGB')
nt.links.new(tc.outputs['Generated'], sp.inputs['Vector']); nt.links.new(sp.outputs['Y'], rp.inputs['Fac'])
rp.color_ramp.elements[0].position = 0.55; rp.color_ramp.elements[0].color = (0, 0, 0, 1); rp.color_ramp.elements[1].color = (1, 0.95, 0.9, 1)
nt.links.new(rp.outputs['Color'], em.inputs['Color']); em.inputs['Strength'].default_value = 1.6
nt.links.new(em.outputs['Emission'], nt.nodes['Material Output'].inputs['Surface']); sb.data.materials.append(sm)
bpy.ops.object.camera_add(); cam = bpy.context.object; sc.camera = cam
cam.data.type = 'ORTHO'; cam.data.ortho_scale = PH * U
cam.rotation_euler = (math.radians(90), 0, 0)
cam.location = (PW / 2 * U, -60, -PH / 2 * U)
sc.render.resolution_x = int(PW * 3 * SCALE); sc.render.resolution_y = int(PH * 3 * SCALE)
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = 96; sc.cycles.use_denoising = True
sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast'
sc.render.filepath = OUT; os.makedirs(os.path.dirname(OUT), exist_ok=True)
bpy.ops.render.render(write_still=True)
print('wrote', OUT)
