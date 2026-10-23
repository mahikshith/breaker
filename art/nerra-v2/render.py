"""Render Nerra v2's sprite frames (transparent RGBA) with one fixed orthographic camera, scale and pivot.

Run from the repository root:
  python3 art/nerra-v2/render.py                 # every frame -> art/nerra-v2/raw/<key>.png (then run post.py)
  python3 art/nerra-v2/render.py idle_0 expr_*   # only matching keys (fnmatch patterns)
  python3 art/nerra-v2/render.py --samples 32 --scale 50 calm   # quick look-dev pass
The frame list and every pose live in frames() below; model.py holds the model, rig and expression presets.
"""
import fnmatch, math, os, sys, time
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import bpy
from mathutils import Vector
import model as M

RAW = os.path.join(HERE, 'raw')
PX = 3.0                                  # px per game unit (house rule)
PX_PER_BU = PX * M.GAME_UNITS_PER_BU
CANVAS_BU = (4.2, 3.4)                    # canvas width, height in BU (fixed for every frame)
PIVOT_BU = (2.1, 3.06)                   # where the ground point under her body lands, from the canvas top-left
ELEVATION = 12.                           # camera looks down 12 degrees (the game's slight top-down view)

def setup_render(samples=96, scale=100):
    sc = bpy.context.scene; r = sc.render
    r.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = samples
    sc.cycles.use_adaptive_sampling = True; sc.cycles.adaptive_threshold = .02
    sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
    sc.cycles.max_bounces = 6; sc.cycles.caustics_reflective = False; sc.cycles.caustics_refractive = False
    sc.cycles.blur_glossy = 1.
    r.film_transparent = True; r.image_settings.file_format = 'PNG'; r.image_settings.color_mode = 'RGBA'
    r.image_settings.color_depth = '8'; r.use_stamp = False
    r.resolution_x = round(CANVAS_BU[0] * PX_PER_BU); r.resolution_y = round(CANVAS_BU[1] * PX_PER_BU); r.resolution_percentage = scale
    sc.view_settings.view_transform = 'AgX'
    sc.view_settings.look = 'AgX - Punchy'
    sc.view_settings.exposure = 0.
    cam = sc.camera; e = math.radians(ELEVATION)
    cam.rotation_euler = (math.pi / 2 - e, 0, 0)
    d = Vector((0, math.cos(e), -math.sin(e))); up = Vector((0, math.sin(e), math.cos(e))); right = Vector((1, 0, 0))
    # the origin must land on PIVOT_BU: shift the camera centre in its own plane
    du = (PIVOT_BU[1] - CANVAS_BU[1] / 2); dr = (CANVAS_BU[0] / 2 - PIVOT_BU[0])
    cam.location = up * du + right * dr - d * 12
    cam.data.ortho_scale = CANVAS_BU[0]; cam.data.sensor_fit = 'HORIZONTAL'; cam.data.clip_start = .1; cam.data.clip_end = 30

def cyc(p, k=1.): return math.sin(2 * math.pi * p * k)

def A(shoulder, elbow, claw, open_, roll=0.):
    return dict(shoulder=shoulder, elbow=elbow, claw=claw, open_=open_, roll=roll)

REST = {'crusher': A((0, 5), 30, (-.05, .35, .95), .45), 'gate': A((0, 5), 30, (-.1, .35, .95), .55)}

def walk(direction):
    """8-frame crab side-step: body turned 32 deg toward the travel, alternating leg groups, bob, roll, secondary motion."""
    out = []
    S = .2
    for f in range(8):
        p = f / 8
        def feet(leg, base, p=p):
            grp = (leg['i'] + (leg['side'] > 0)) % 2
            q = (p + .5 * grp) % 1
            if q < .5: u = q / .5; off, lift = S * (.5 - u), 0.
            else: u = (q - .5) / .5; off, lift = S * (-.5 + u), .13 * math.sin(math.pi * u)
            return base + Vector((direction * off, 0, lift))
        bob = .025 * math.cos(4 * math.pi * p)
        sway = cyc(p)
        out.append((f'walk_{"r" if direction > 0 else "l"}_{f}', dict(
            face='focus', yaw=direction * 32, gaze=(direction * 14, -4), body_off=(direction * .02 * sway, 0, bob),
            body_rot=(2 * math.cos(4 * math.pi * p), -direction * 2.5 * sway, 2 * sway), shell_rot=(1.5 * math.cos(4 * math.pi * p - 1), -direction * 2 * cyc(p - .1), 0),
            stalk_add=(3 * cyc(p, 2), 4 * math.cos(4 * math.pi * p - .9)), feet=feet,
            arms={'crusher': A((6 * sway, -5 + 8 * sway), 30, (.3, .3 + .15 * sway, .9), .4 + .15 * (sway > 0)),
                  'gate': A((-6 * sway, -5 - 8 * sway), 30, (.25, .3 - .15 * sway, .9), .55)})))
    return out

def frames():
    F = []
    # idle breathe (front, calm), 4 frames
    for f in range(4):
        b = math.sin(2 * math.pi * f / 4)
        F.append((f'idle_{f}', dict(face='calm', breathe=.018 * b, body_off=(0, 0, .012 * b), stalk_add=(1.5 * b, -2 * b), shell_rot=(-.8 * b, 0, 0),
                                    arms={'crusher': A((3 * b, 5), 30 + 3 * b, (-.05, .35, .95), .45 + .08 * b),
                                          'gate': A((3 * b, 5), 30 + 3 * b, (-.1, .35, .95), .55 - .08 * b)})))
    F += walk(1) + walk(-1)
    # turn from the walk heading to face the screen; the eyes lead and lock onto the player first
    for d, tag in ((1, 'r'), (-1, 'l')):
        for k, yaw in enumerate((22, 10, 0)):
            F.append((f'turn_{tag}_{k}', dict(face='focus' if k < 2 else 'calm', yaw=d * yaw, gaze=(-d * yaw * .7, -6), stalk_add=(-4 + 2 * k, 0))))
    # gaze grid on the calm face: x -1..1 (screen left..right), y -1..1 (down..up)
    for gy, ny in ((-1, 'd'), (0, 'c'), (1, 'u')):
        for gx, nx in ((-1, 'l'), (0, 'c'), (1, 'r')):
            F.append((f'gaze_{ny}{nx}', dict(face='calm', gaze=(gx * 26, gy * 20 - 3), stalk_add=(0, -gy * 4))))
    # expressions, front pose
    up = {'crusher': A((5, 45), 70, (-.2, .3, 1), .9), 'gate': A((5, 45), 70, (-.2, .3, 1), .95)}
    for face in ('calm', 'smug', 'furious', 'hurt', 'dizzy'):
        extra = {'smug': dict(body_rot=(0, 3, 0), arms={'crusher': A((-12, 5), 20, (.15, .35, .9), .15), 'gate': A((8, 10), 45, (-.25, .3, .95), .75)}),
                 'furious': dict(body_off=(0, -.02, -.01), stalk_add=(-2, -4), arms=up),
                 'hurt': dict(body_rot=(-4, 0, 0), arms={'crusher': A((-10, 30), 50, (.2, .3, .9), .7), 'gate': A((-10, 30), 50, (.2, .3, .9), .7)}),
                 'dizzy': dict(body_rot=(0, -4, 0), stalk_add=(4, 0), arms={'crusher': A((-40, 45), 25, (.3, .6, -.1), .5), 'gate': A((-30, 40), 40, (.1, .4, .6), .6)})}.get(face, {})
        F.append((f'expr_{face}', dict(face=face, gaze=(0, -3), **extra)))
    # jump: crouch wind-up, airborne, slam landing (squash)
    F.append(('jump_crouch', dict(face='roar', squash=(1.07, 1.07, .86), body_off=(0, 0, -.1), body_rot=(5, 0, 0), stalk_add=(0, 6),
                                  arms={'crusher': A((-45, 30), 30, (.3, .5, .3), .2), 'gate': A((-45, 30), 30, (.3, .5, .3), .3)})))
    F.append(('jump_air', dict(face='furious', root=(0, 0, .42), squash=(.95, .95, 1.07), body_rot=(-4, 0, 0), stalk_add=(0, 12),
                               feet=lambda leg, base: base + Vector((-leg['side'] * .1, 0, .14 + .05 * leg['i'])),
                               arms={'crusher': A((35, 25), 50, (.2, .2, 1), .95), 'gate': A((35, 25), 50, (.2, .2, 1), .95)})))
    F.append(('jump_land', dict(face='roar', squash=(1.16, 1.16, .78), body_off=(0, 0, -.13), body_rot=(6, 0, 0), stalk_add=(0, -8),
                                feet=lambda leg, base: base + Vector((leg['side'] * .1, 0, 0)),
                                arms={'crusher': A((-50, 45), 15, (.5, .6, -.3), .1), 'gate': A((-50, 45), 15, (.5, .6, -.3), .1)})))
    # claw snaps: wind-up (claw raised, pincer gaping) and strike (slammed down and out, snapped shut)
    for kind, tag, s in (('crusher', 'l', -1), ('gate', 'r', 1)):
        other = 'gate' if kind == 'crusher' else 'crusher'
        F.append((f'snap_{tag}_windup', dict(face='furious', gaze=(s * 18, 2), body_rot=(0, s * 6, s * 6), body_off=(-s * .03, 0, .02),
                  arms={kind: A((55, 20), 50, (.1, .1, 1), 1.), other: REST[other]})))
        F.append((f'snap_{tag}_strike', dict(face='roar', gaze=(s * 22, -14), body_rot=(5, -s * 8, -s * 4), body_off=(s * .05, -.03, -.03),
                  arms={kind: A((-35, 65), 15, (.35, .9, -.35), 0.), other: A((-15, 45), 65, (-.25, .3, .95), .5)})))
    # damage: flinch, stagger, defeated
    F.append(('hurt_flinch', dict(face='hurt', body_rot=(-8, 0, 3), body_off=(0, .05, .02), shell_rot=(-4, 0, 0), stalk_add=(6, 10),
                                  arms={'crusher': A((25, -5), 30, (1, 0, .4), .9), 'gate': A((25, -5), 30, (1, 0, .4), .9)})))
    F.append(('hurt_stagger', dict(face='dizzy', body_rot=(0, 10, -6), body_off=(.06, 0, -.03), shell_rot=(0, 5, 0), stalk_add=(6, 0),
                                   feet=lambda leg, base: base + Vector((.05, 0, .1 if (leg['side'] < 0 and leg['i'] in (0, 2)) else 0)),
                                   arms={'crusher': A((-40, 45), 15, (.4, .6, -.4), .5), 'gate': A((10, 30), 50, (.3, .3, .8), .7)})))
    F.append(('defeated', dict(face='defeat', body_off=(0, 0, -.2), body_rot=(10, 0, 0), shell_rot=(4, -7, 0),
                               feet=lambda leg, base: base + Vector((leg['side'] * .14, 0, 0)),
                               arms={'crusher': A((-45, 50), 5, (.5, .7, -.5), .4), 'gate': A((-45, 50), 5, (.5, .7, -.5), .5)})))
    return F

def main():
    args = sys.argv[1:]; samples, scale = 96, 100
    if '--samples' in args: i = args.index('--samples'); samples = int(args[i + 1]); del args[i:i + 2]
    if '--scale' in args: i = args.index('--scale'); scale = int(args[i + 1]); del args[i:i + 2]
    out = RAW
    if '--out' in args: i = args.index('--out'); out = args[i + 1]; del args[i:i + 2]
    R = M.build(); setup_render(samples, scale); os.makedirs(out, exist_ok=True)
    todo = [(k, p) for k, p in frames() if not args or any(fnmatch.fnmatch(k, a) for a in args)]
    t0 = time.time()
    for k, p in todo:
        t = time.time(); M.pose(R, **p)
        bpy.context.scene.render.filepath = os.path.join(out, k + '.png'); bpy.ops.render.render(write_still=True)
        print(f'{k}: {time.time() - t:.1f}s', flush=True)
    print(f'{len(todo)} frames in {time.time() - t0:.0f}s')

if __name__ == '__main__':
    main()
