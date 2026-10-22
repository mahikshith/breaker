# Lumi (princess) face-orb portraits: the player-hero counterpart of assets/kit/faces/<Expr>_face_00.png.
# Reuses the model + expression rig of art/princess.py (everything above its "lights, camera" section is executed
# as-is: KayKit Rogue re-dressed, procedural eyes/lids/brows/mouth/blush parented to the head bone), then renders
# with Kit's face camera and light rig from art/kit.py (ortho 2.4, key #FFDBB8 top-left, fill #8CA6FF, bounce #FF80A6,
# AgX Medium High Contrast, 576 px Cycles render -> Lanczos -> 288 x 288 RGBA, no PNG metadata).
# Needs only assets/models/kk_Rogue.glb (no out/ files).
# Run from repo root:  python3 art/lumi_faces.py [out_dir=assets/princess/faces] [Idle Focus ...] [--samples N] [--threads N]
import sys, os, json, hashlib
HERE = os.path.dirname(os.path.abspath(__file__))
_argv = sys.argv[1:]
def _opt(flag, default):
    if flag in _argv:
        i = _argv.index(flag); v = int(_argv[i + 1]); del _argv[i:i + 2]; return v
    return default
SAMPLES_ = _opt('--samples', 48); THREADS_ = _opt('--threads', 4)
FACE_OUT = os.path.abspath(_argv[0]) if _argv and not _argv[0][0].isupper() else os.path.join(HERE, '..', 'assets', 'princess', 'faces')
ONLY = [a for a in _argv if a[0].isupper()]
EXPR_ORDER = ['Idle', 'Focus', 'Nervous', 'Panic', 'Cheer', 'Hurt']

# --- run the model/rig half of princess.py (up to its light + camera section) in this namespace
src = open(os.path.join(HERE, 'princess.py')).read()
cut = src.index('# ---------------------------------------------------------------- lights, camera (unchanged from v1)')
sys.argv = ['princess.py', FACE_OUT, '--face', '--samples', str(SAMPLES_), '--threads', str(THREADS_)]
# Face-only tweaks, patched in at run time so art/princess.py (the shipped sprite source) stays untouched:
#  - bolder brows (Kit's read at orb size; the sprite brows are too thin)
#  - a glossy sweat drop on the right temple for Nervous / Panic, built on the head surface and parented to the head bone
src = src.replace('ws = [0.036 * (1 - 0.55', 'ws = [0.052 * (1 - 0.50')
SWEAT_SRC = """
import bmesh as _bm
_b = _bm.new(); _bm.ops.create_uvsphere(_b, u_segments=20, v_segments=12, radius=1.0)
for _v in _b.verts:
    if _v.co.z > 0:
        _t = _v.co.z; _v.co.x *= (1 - 0.88 * _t); _v.co.y *= (1 - 0.88 * _t); _v.co.z = _t * 2.0
_m = bpy.data.meshes.new('sweat'); _b.to_mesh(_m); _b.free(); _m.shade_smooth()
SWEAT = new_obj('sweat', _m)
SWEAT.data.materials.append(mat('lumi_sweat', (0.45, 0.78, 1.0), 0.04, coat=1.0, **{'Transmission Weight': 0.35}))
_p, _n = surf(0.36, 1.80)
SWEAT.location = _p + _n * 0.03; SWEAT.scale = (0.062, 0.040, 0.062); SWEAT.rotation_euler = (0, 0, math.radians(-8))
bpy.context.view_layer.update(); bone_parent(SWEAT, 'head'); SWEAT.hide_render = True
"""
MARK = '# ---------------------------------------------------------------- back to pose; parent the face rig; scale'
assert MARK in src and 'ws = [0.052' in src
src = src.replace(MARK, SWEAT_SRC + MARK)
cut = src.index('# ---------------------------------------------------------------- lights, camera (unchanged from v1)')
exec(compile(src[:cut], os.path.join(HERE, 'princess.py'), 'exec'), globals())
from PIL import Image

# --- Lumi-as-player-hero expressions, mirroring Kit's set. Kit name -> Lumi name: Idle=Idle, Focus=Focus,
#     Worried=Nervous, Shock=Panic, Cheer=Cheer, Hurt=Hurt. Static single key (frame 00), like Kit's *_face_00.
FACE_EXPR = {
    # determined / ready to serve: brows pulled in and down, alert wide-ish eyes, small confident smirk
    'Idle':    F(btilt=-16, braise=-0.25, lid=0.17, low=0.05, mouth='smile', mw=1.0, mc=0.7, gx=0.08, gz=0.06, blush=0.6, glint=1.1),
    # lining up the ball: heavy upper lids, hard inward brows, eyes aimed up at the ball, tight flat mouth
    'Focus':   F(btilt=-30, braise=-0.5, lid=0.44, low=0.10, mouth='flat', mw=0.70, mc=0.0, gx=0.18, gz=0.42, blush=0.35, glint=1.0),
    # high danger: inner brows pushed up, eyes wide with small pupils glancing aside, wobbly mouth, flushed
    'Nervous': F(btilt=27, braise=0.75, lid=0.02, low=0.05, eye=1.07, iris=0.86, pupil=0.62, mouth='wavy', mw=0.95, wave=1.8, mc=0.35,
                 gx=-0.55, gz=0.12, blush=0.9, glint=1.15),
    # life lost: huge eyes, pinprick pupils, brows to the hairline, open scream
    'Panic':   F(btilt=22, braise=1.1, lid=0.0, low=0.0, eye=1.17, iris=0.62, pupil=0.40, mouth='O', mw=1.05, mh=1.3, gx=0.0, gz=0.10, blush=0.25, glint=0.9),
    # win: ^ ^ eyes, lifted brows, wide open laugh
    'Cheer':   F(eyes='happy', braise=0.85, btilt=-2, mouth='open', mw=1.40, mh=0.85, mc=0.8, blush=1.0),
    # hit: > < squeezed eyes, brows dropped, gritted grimace
    'Hurt':    F(eyes='squeeze', btilt=-18, braise=-0.45, mouth='grimace', mw=1.30, mh=0.32, mc=0.4, blush=0.7),
}
# body clip + clip fraction (sets head pose) and optional extra head rotation (axis, degrees) so the face stays front-on
POSE = {'Idle': ('Idle', 0.0, []),
        'Focus': ('Idle', 0.0, [((1, 0, 0), 5), ((0, 1, 0), 4)]),                  # chin tucked, head canted: aiming
        'Nervous': ('Idle', 0.0, [((0, 0, 1), -10), ((1, 0, 0), -4)]),
        'Panic': ('Idle', 0.0, [((0, 1, 0), -7), ((1, 0, 0), 5)]),
        'Cheer': ('Cheer', 0.0, []),
        'Hurt': ('Idle', 0.0, [((0, 1, 0), 8), ((1, 0, 0), -6)])}
SWEAT_ON = {'Nervous', 'Panic'}

# --- Kit's light rig (art/kit.py), world and face camera
def klight(loc, energy, size, color):
    bpy.ops.object.light_add(type='AREA', location=loc)
    o = bpy.context.object; o.rotation_euler = (Vector((0, 0, 2.2)) - o.location).to_track_quat('-Z', 'Y').to_euler()
    o.data.energy = energy; o.data.size = size; o.data.color = color
klight((-8, -10, 14), 1600, 7, (1, 0.82, 0.68))    # key  #FFDBB8, top-left
klight((7, -5, 7), 850, 6, (0.55, 0.68, 1))        # fill #8CA6FF
klight((0, -9, 3), 550, 7, (0.92, 0.94, 1))        # soft front
klight((2, 5, 8), 1100, 6, (0.62, 0.73, 1))        # cool rim from behind
klight((0, -3, -5), 220, 6, (1, 0.5, 0.65))        # bounce #FF80A6, below
w = bpy.data.worlds.new('lumi_world'); sc.world = w
w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.05, 0.04, 0.09, 1)
w.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.35
bpy.ops.object.camera_add(location=(0, -40, 2.2), rotation=(math.radians(90), 0, 0))
cam = bpy.context.object; sc.camera = cam; cam.data.type = 'ORTHO'; cam.data.ortho_scale = 2.4
sc.render.engine = 'CYCLES'; sc.cycles.samples = SAMPLES_; sc.cycles.use_denoising = True; sc.cycles.device = 'CPU'
sc.render.threads_mode = 'FIXED'; sc.render.threads = THREADS_
sc.render.film_transparent = True
sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_mode = 'RGBA'
sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast'
TARGET = 288
sc.render.resolution_x = sc.render.resolution_y = TARGET * 2
CAM_DX, CAM_DZ = float(os.environ.get('LUMI_CAM_DX', 0.0)), float(os.environ.get('LUMI_CAM_DZ', 0.62))   # tuned so the eyes sit where Kit's do
os.makedirs(FACE_OUT, exist_ok=True)

report = []
for name in (ONLY or EXPR_ORDER):
    clip, frac, head_fx = POSE[name]
    act = bpy.data.actions[SOURCE[clip][0] if clip in SOURCE else clip]   # e.g. Scared = KayKit Block
    for pb in arm.pose.bones:
        pb.location = (0, 0, 0); pb.rotation_quaternion = (1, 0, 0, 0); pb.scale = (1, 1, 1)
    arm.animation_data_create(); arm.animation_data.action = act
    if hasattr(arm.animation_data, 'action_slot') and act.slots: arm.animation_data.action_slot = act.slots[0]
    a0, a1 = act.frame_range
    fr = a0 + (a1 - a0) * (frac if clip != 'Scared' else 0.30 + 0.6 * frac); sc.frame_set(int(fr), subframe=fr - int(fr))
    arm.rotation_euler = (0, 0, 0)
    bpy.context.view_layer.update(); arm.animation_data.action = None
    for axis, deg in head_fx: _rot('head', axis, deg)
    apply_face(lerp_keys([(0.0, FACE_EXPR[name])], 0.0)); SWEAT.hide_render = name not in SWEAT_ON
    bpy.context.view_layer.update()
    hp = arm.matrix_world @ arm.pose.bones['head'].head
    cam.location = (hp.x + CAM_DX, -40, hp.z + CAM_DZ)
    path = os.path.join(FACE_OUT, f'{name}_face_00.png')
    sc.render.filepath = path; bpy.ops.render.render(write_still=True)
    with Image.open(path) as im:
        out = im.resize((TARGET, TARGET), Image.Resampling.LANCZOS)
    assert out.mode == 'RGBA' and out.size == (TARGET, TARGET)
    clean = Image.frombytes('RGBA', out.size, out.tobytes())      # fresh image: no PNG text/info chunks
    clean.save(path, optimize=True)
    print('rendered', name, flush=True)

if not ONLY:   # manifest, same shape as design/phase1/kit-asset-manifest.json (schema_version / source / technical / assets)
    assets = []
    for name in EXPR_ORDER:
        p = os.path.join(FACE_OUT, f'{name}_face_00.png')
        with Image.open(p) as im:
            assert im.mode == 'RGBA' and im.size == (TARGET, TARGET) and not im.text and not im.info.get('exif')
            bb = im.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox()
        assets.append({'id': 'lumi-' + name.lower() + '-face', 'expression': name, 'kit_equivalent': {'Nervous': 'Worried', 'Panic': 'Shock'}.get(name, name),
                       'path_pattern': f'assets/princess/faces/{name}_face_NN.png', 'frames': 1, 'alpha_bounds': [list(bb)],
                       'sha256': [hashlib.sha256(open(p, 'rb').read()).hexdigest()],
                       'body_clip': POSE[name][0]})
    manifest = {'schema_version': 1, 'character': 'Lumi (princess player hero)', 'status': 'rendered; awaiting owner review',
                'source': {'model': 'assets/models/kk_Rogue.glb', 'license': 'CC0', 'renderer': 'Blender 5.2.2 / Cycles',
                           'script': 'art/lumi_faces.py', 'rig': 'art/princess.py', 'paddle_script': 'art/lumi_paddle.py'},
                'technical': {'face_cell_px': TARGET, 'camera': 'orthographic, ortho_scale 2.4, centred on head bone + 0.62', 'alpha': True,
                              'samples': SAMPLES_, 'supersampling': 2, 'downsample': 'Lanczos', 'png_text_metadata': False,
                              'lights': 'key #FFDBB8 top-left, fill #8CA6FF, bounce #FF80A6 (art/kit.py rig)'},
                'order': EXPR_ORDER, 'assets': assets}
    json.dump(manifest, open(os.path.join(FACE_OUT, 'manifest.json'), 'w'), indent=2); open(os.path.join(FACE_OUT, 'manifest.json'), 'a').write('\n')
    print('manifest written')
