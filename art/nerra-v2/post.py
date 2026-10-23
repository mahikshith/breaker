"""Nerra v2 post-process: raw renders -> trimmed sprite frames, collision circles, manifest, review sheets.

Run from the repository root after render.py:
  python3 art/nerra-v2/post.py [review dir]     (default /mnt/project-files/breaker/review-2026-10-23/nerra-v2)

Every frame is rendered with one camera, one scale (3 px per game unit) and one pivot: the ground point under her body.
Frames are trimmed to their alpha bounds (+2 px) and the manifest records where that pivot lands in each trimmed frame, so a
frame drawn with its `pivot` on the villain's foot point lines up with every other frame. PNGs are written fresh (no text,
ICC or EXIF chunks) and fully transparent pixels carry zero RGB.

Collision (the game's rule: collision follows the drawn art): per frame, a compound of circles fitted INSIDE the opaque
silhouette (alpha >= 128), greedy largest-first on the distance transform until COVER of the solid area is covered or the
next circle would be thinner than MIN_R units. Circles are [x, y, r] in game units relative to the pivot (y down).
"""
import json, os, sys, glob
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
RAW = os.path.join(HERE, 'raw'); OUT = os.path.join(ROOT, 'assets', 'nerra-v2')
REVIEW = sys.argv[1] if len(sys.argv) > 1 else '/mnt/project-files/breaker/review-2026-10-23/nerra-v2'
PX = 3.0; COVER = .93; MIN_R = 3.0; MAX_CIRCLES = 40; PAD = 2

def render_consts():
    src = open(os.path.join(HERE, 'render.py')).read(); env = {}
    for line in src.splitlines():
        if line.startswith(('CANVAS_BU', 'PIVOT_BU', 'ELEVATION')): exec(line.split('#')[0], env)
    m = open(os.path.join(HERE, 'model.py')).read()
    env['UNITS'] = float(next(l for l in m.splitlines() if l.startswith('GAME_UNITS_PER_BU')).split('=')[1])
    return env

def clean(im):
    a = np.asarray(im.convert('RGBA')).copy(); a[a[:, :, 3] == 0] = 0
    return Image.fromarray(a, 'RGBA')

def fit_circles(alpha, k=2):
    """Greedy inscribed circles on a k-times downsampled solid mask; returns [(x, y, r)] in full-res px."""
    m = alpha >= 128
    h, w = m.shape; sm = m[:h - h % k, :w - w % k].reshape(h // k, k, w // k, k).all(axis=(1, 3))
    edt = ndimage.distance_transform_edt(sm)
    yy, xx = np.mgrid[:sm.shape[0], :sm.shape[1]]
    covered = np.zeros_like(sm); total = sm.sum(); out = []
    while len(out) < MAX_CIRCLES and covered.sum() < COVER * total:
        cand = np.where(sm & ~covered, edt, 0)
        i = np.argmax(cand); y, x = divmod(i, sm.shape[1]); r = edt[y, x] - .5
        if r * k < MIN_R * PX: break
        covered |= (yy - y) ** 2 + (xx - x) ** 2 <= r * r
        out.append(((x + .5) * k, (y + .5) * k, r * k))
    return out, covered.sum() / max(1, total)

CLIPS = {   # playback suggestions for the integrator
    'idle': dict(frames=[f'idle_{i}' for i in range(4)], fps=4, loop=True),
    'walk_r': dict(frames=[f'walk_r_{i}' for i in range(8)], fps=12, loop=True, note='side-step moving screen-right; body turned 32 deg toward the travel'),
    'walk_l': dict(frames=[f'walk_l_{i}' for i in range(8)], fps=12, loop=True, note='rendered separately (not a mirror) so the key light stays top-left and the crusher stays on screen-left'),
    'turn_r': dict(frames=['turn_r_0', 'turn_r_1', 'turn_r_2'], fps=10, loop=False, note='from the walk_r heading to facing the screen; play reversed to turn away'),
    'turn_l': dict(frames=['turn_l_0', 'turn_l_1', 'turn_l_2'], fps=10, loop=False),
    'jump': dict(frames=['jump_crouch', 'jump_air', 'jump_land'], fps=8, loop=False, note='jump_air is rendered 0.42 BU (about 29 units) above the ground; the pivot stays on the ground point'),
    'snap_l': dict(frames=['snap_l_windup', 'snap_l_strike'], fps=6, loop=False, note='crusher claw (screen-left); hold windup as the 1.2-1.8 s tell'),
    'snap_r': dict(frames=['snap_r_windup', 'snap_r_strike'], fps=6, loop=False, note='slender gate claw (screen-right)'),
    'hurt': dict(frames=['hurt_flinch', 'hurt_stagger'], fps=6, loop=False),
    'defeat': dict(frames=['hurt_stagger', 'defeated'], fps=4, loop=False),
}

def main():
    C = render_consts(); bu_px = PX * C['UNITS']
    piv_raw = (C['PIVOT_BU'][0] * bu_px, C['PIVOT_BU'][1] * bu_px)
    os.makedirs(OUT, exist_ok=True); os.makedirs(REVIEW, exist_ok=True)
    for f in glob.glob(os.path.join(OUT, '*.png')): os.remove(f)
    keys = sorted(os.path.basename(p)[:-4] for p in glob.glob(os.path.join(RAW, '*.png')))
    frames = {}; sprites = {}
    for k in keys:
        im = clean(Image.open(os.path.join(RAW, k + '.png')))
        a = np.asarray(im)[:, :, 3]; ys, xs = np.nonzero(a > 0)
        assert xs.min() > 0 and ys.min() > 0 and xs.max() < a.shape[1] - 1 and ys.max() < a.shape[0] - 1, f'{k} touches the canvas edge'
        box = (max(0, xs.min() - PAD), max(0, ys.min() - PAD), min(a.shape[1], xs.max() + 1 + PAD), min(a.shape[0], ys.max() + 1 + PAD))
        sp = im.crop(box); sp = clean(sp)
        sp.save(os.path.join(OUT, k + '.png'), optimize=True)
        px, py = piv_raw[0] - box[0], piv_raw[1] - box[1]
        circ, cov = fit_circles(np.asarray(sp)[:, :, 3])
        sa = np.asarray(sp)[:, :, 3]; sy, sx = np.nonzero(sa >= 128)
        frames[k] = dict(path=f'assets/nerra-v2/{k}.png', px=[sp.width, sp.height], drawSize=[round(sp.width / PX, 3), round(sp.height / PX, 3)],
                         pivot=[round(px / sp.width, 5), round(py / sp.height, 5)], pivotPx=[round(px, 2), round(py, 2)],
                         solidBounds=[round((sx.min() - px) / PX, 2), round((sy.min() - py) / PX, 2), round((sx.max() + 1 - px) / PX, 2), round((sy.max() + 1 - py) / PX, 2)],
                         circles=[[round((x - px) / PX, 2), round((y - py) / PX, 2), round(r / PX, 2)] for x, y, r in circ], coverage=round(float(cov), 3))
        sprites[k] = sp
    gaze = {f'{ny}{nx}': f'gaze_{ny}{nx}' for ny in 'ucd' for nx in 'lcr'}
    manifest = dict(
        version=1, character='Nerra (Tidewheel Citadel), glossy vinyl-toy rebuild', status='review only: not wired into the game',
        source='art/nerra-v2 (model.py, render.py, post.py; Blender 5.2 bpy, Cycles CPU, AgX Punchy, transparent film)',
        pxPerUnit=PX, unitsPerBU=C['UNITS'],
        camera=dict(type='orthographic', elevationDeg=C['ELEVATION'], canvasUnits=[round(C['CANVAS_BU'][0] * C['UNITS'], 2), round(C['CANVAS_BU'][1] * C['UNITS'], 2)],
                    pivotUnitsFromCanvasTopLeft=[round(C['PIVOT_BU'][0] * C['UNITS'], 2), round(C['PIVOT_BU'][1] * C['UNITS'], 2)]),
        pivotConvention='pivot = the ground point under her body (her footprint centre). Draw a frame at its natural size drawSize (units) with pivot on the villain foot point (today footX, footY=232); never rescale per frame.',
        collisionConvention=f'circles: [x, y, r] game units relative to the pivot (y down), fitted inside alpha>=128, largest first, until {COVER:.0%} of the solid area is covered or r < {MIN_R}. Collision follows the drawn frame: swap circles with the frame.',
        clips=CLIPS, gaze=dict(frames=gaze, note='calm face with the eyes turned: first letter u/c/d = up/centre/down, second l/c/r = screen left/centre/right (about 26 deg yaw, 20 deg pitch). Pick the cell nearest the ball direction.'),
        expressions={e: f'expr_{e}' for e in ('calm', 'smug', 'furious', 'hurt', 'dizzy')},
        frames=frames)
    json.dump(manifest, open(os.path.join(OUT, 'manifest.json'), 'w'), indent=1)
    sheets(manifest, sprites)
    total = sum(os.path.getsize(os.path.join(OUT, k + '.png')) for k in keys)
    print(f'{len(keys)} frames, {total / 1e6:.1f} MB, circles {min(len(f["circles"]) for f in frames.values())}-{max(len(f["circles"]) for f in frames.values())}, '
          f'coverage min {min(f["coverage"] for f in frames.values()):.2f}')

def font(size):
    for p in ('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', os.path.join(ROOT, 'assets', 'fonts', 'Rubik-Regular.ttf')):
        if os.path.exists(p): return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def sheets(manifest, sprites):
    """Contact sheet (every frame, same scale, pivots aligned on a ground line) and the same with collision circles."""
    fr = manifest['frames']; scale = .4
    groups = [('idle', [f'idle_{i}' for i in range(4)]), ('walk right', [f'walk_r_{i}' for i in range(8)]), ('walk left', [f'walk_l_{i}' for i in range(8)]),
              ('turn to screen', ['turn_r_0', 'turn_r_1', 'turn_r_2', 'turn_l_0', 'turn_l_1', 'turn_l_2']),
              ('gaze (calm)', [f'gaze_{a}{b}' for a in 'ucd' for b in 'lcr']),
              ('expressions', [f'expr_{e}' for e in ('calm', 'smug', 'furious', 'hurt', 'dizzy')]),
              ('jump / snap', ['jump_crouch', 'jump_air', 'jump_land', 'snap_l_windup', 'snap_l_strike', 'snap_r_windup', 'snap_r_strike']),
              ('damage', ['hurt_flinch', 'hurt_stagger', 'defeated'])]
    up = max(f['pivotPx'][1] for f in fr.values()); down = max(f['px'][1] - f['pivotPx'][1] for f in fr.values())
    cw = int(max(f['px'][0] for f in fr.values()) * scale * .8) + 8; ch = int((up + down) * scale) + 26
    cols = 8; rows = sum((len(g) + cols - 1) // cols for _, g in groups)
    for overlay in (False, True):
        W, H = cw * cols + 170, ch * rows + 60
        sheet = Image.new('RGBA', (W, H), (20, 24, 49, 255)); d = ImageDraw.Draw(sheet); f12, f20 = font(13), font(22)
        d.text((12, 14), 'Nerra v2 - glossy vinyl rebuild (Blender 5.2 Cycles) - same camera, scale and pivot in every cell' + (' - collision circles' if overlay else ''), fill=(225, 228, 245, 255), font=f20)
        r = 0
        for title, keys in groups:
            for i, k in enumerate(keys):
                if i % cols == 0:
                    if i: r += 1
                    d.text((10, 60 + r * ch + ch // 2), title if i == 0 else '', fill=(170, 178, 210, 255), font=f12)
                x0, y0 = 170 + (i % cols) * cw, 50 + r * ch
                f = fr[k]; sp = sprites[k].resize((round(f['px'][0] * scale), round(f['px'][1] * scale)), Image.LANCZOS)
                gx, gy = x0 + cw // 2, y0 + 22 + int(up * scale)
                if overlay: d.line((x0 + 6, gy, x0 + cw - 6, gy), fill=(70, 80, 120, 255))
                sheet.alpha_composite(sp, (int(gx - f['pivotPx'][0] * scale), int(gy - f['pivotPx'][1] * scale)))
                if overlay:
                    od = ImageDraw.Draw(sheet)
                    for cx, cy, cr in f['circles']:
                        cx, cy, cr = gx + cx * PX * scale, gy + cy * PX * scale, cr * PX * scale
                        od.ellipse((cx - cr, cy - cr, cx + cr, cy + cr), outline=(90, 255, 200, 255), width=1)
                d.text((x0 + 4, y0 + 4), k, fill=(200, 205, 230, 255), font=f12)
            r += 1
        sheet.convert('RGB').save(os.path.join(REVIEW, 'nerra-v2-collision-sheet.png' if overlay else 'nerra-v2-contact-sheet.png'), optimize=True)
    ingame(manifest, sprites)
    vs_ember(sprites)

def ingame(manifest, sprites):
    """Frames at in-game scale (3 px per unit) on the Tidewheel plate and wall, next to the current Nerra from the live screenshot."""
    W, H = 360, 330                      # top of the playfield, game units
    bg = Image.open(os.path.join(ROOT, 'assets', 'fantasy-machinery', 'tidewheel-background.png')).convert('RGBA')
    bg = bg.resize((W * 3, round(bg.height * W * 3 / bg.width)), Image.LANCZOS).crop((0, 0, W * 3, H * 3))
    wall = Image.open(os.path.join(ROOT, 'assets', 'fantasy-machinery', 'sluiceWall.png')).convert('RGBA')
    wm = json.load(open(os.path.join(ROOT, 'assets', 'fantasy-machinery', 'manifest.json')))['tidewheel']['sluiceWall']
    ww = 390 * 3; wh = round(ww * wall.height / wall.width); wall = wall.resize((ww, wh), Image.LANCZOS)
    bg.alpha_composite(wall, (round(180 * 3 - wm['pivot'][0] * ww), round(232 * 3 - wm['pivot'][1] * wh)))
    live = Image.open(os.path.join(ROOT, 'docs', 'validation', 'fantasy-preview', 'tidewheel-live.png')).convert('RGBA')
    k = live.width / W; old = live.crop((0, 0, live.width, round(H * k))).resize((W * 3, H * 3), Image.LANCZOS)
    shots = []
    for key in ('idle_0', 'expr_furious', 'walk_r_3'):
        im = bg.copy(); f = manifest['frames'][key]; sp = sprites[key]
        sh = Image.new('RGBA', im.size); ImageDraw.Draw(sh).ellipse((180 * 3 - 70 * 3, 233 * 3 - 5 * 3, 180 * 3 + 70 * 3, 233 * 3 + 5 * 3), fill=(8, 20, 28, 110))
        im.alpha_composite(sh)
        im.alpha_composite(sp, (round(180 * 3 - f['pivotPx'][0]), round(232 * 3 - f['pivotPx'][1])))
        im.convert('RGB').save(os.path.join(REVIEW, f'ingame-{key}.png'), optimize=True); shots.append(im)
    gap = 24; comp = Image.new('RGBA', (W * 3 * 2 + gap, H * 3 + 50), (12, 14, 26, 255)); d = ImageDraw.Draw(comp)
    comp.alpha_composite(old, (0, 50)); comp.alpha_composite(shots[0], (W * 3 + gap, 50))
    d.text((12, 12), 'current Nerra (live build screenshot, upscaled)', fill=(220, 220, 235, 255), font=font(24))
    d.text((W * 3 + gap + 12, 12), 'Nerra v2 idle_0 at 3 px/unit, foot (180, 232)', fill=(220, 220, 235, 255), font=font(24))
    comp.convert('RGB').save(os.path.join(REVIEW, 'ingame-old-vs-new.png'), optimize=True)

EMBER = '/mnt/project-files/breaker/copilot/drops-2026-10-23/m365-dragon-kit/sheets'

def vs_ember(sprites):
    """Look check: Ember (the owner's reference renders) beside Nerra v2 at one height on navy."""
    try:
        refs = [Image.open(os.path.join(EMBER, 'ember_turnaround_sheet.png')).convert('RGBA').crop((0, 260, 420, 860)),
                Image.open(os.path.join(EMBER, 'ember_expressions_sheet.png')).convert('RGBA').crop((390, 40, 760, 480))]
    except OSError:
        return
    H = 560
    def fit(im):
        a = np.asarray(im)[:, :, 3]; ys, xs = np.nonzero(a > 8); im = im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
        return im.resize((round(im.width * H / im.height), H), Image.LANCZOS)
    ims = [fit(i) for i in refs] + [fit(sprites[k]) for k in ('idle_0', 'expr_furious', 'expr_dizzy', 'walk_r_3')]
    out = Image.new('RGBA', (sum(i.width for i in ims) + 30 * (len(ims) + 1), H + 90), (20, 24, 49, 255)); x = 30; d = ImageDraw.Draw(out)
    d.text((30, 14), 'Ember (reference, M365 renders)', fill=(220, 222, 240, 255), font=font(24))
    d.text((ims[0].width + ims[1].width + 90, 14), 'Nerra v2 (Blender Cycles): idle, furious, dizzy, walk', fill=(220, 222, 240, 255), font=font(24))
    for i in ims: out.alpha_composite(i, (x, 60)); x += i.width + 30
    out.convert('RGB').save(os.path.join(REVIEW, 'nerra-v2-vs-ember.png'), optimize=True)

if __name__ == '__main__':
    main()
