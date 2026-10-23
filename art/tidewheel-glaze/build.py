"""Tidewheel glaze bricks: the glaze-v2 brick sheet (art/glaze2/source/bricks.png) re-glazed as sea materials for the
Tidewheel rafts, at the rafts' 34x18 footprint, with the same ppu, margin and lower-right contact shadow as assets/glaze2.

Materials: seaglass (wet sea-glass teal, a little light pooling in the lower body), coral (coral pink), pearl (shell cream
with a soft nacre sheen and a small barnacle cluster) and steel (blue-grey steel with two riveted brass bands and barnacles,
ready for unbreakable bars). Every material gets the source's own bevel, glaze band, star glint and crack lines (the
recolour is a luminance gradient map of the source frame, so light direction and gloss are unchanged), plus a few beaded
water drops and a wet sheen. States: 0 intact, 1 cracked, 2 breaking (the source's cracked and split frames).

Keys: tg_<material>_<state>. Run: python3 art/tidewheel-glaze/build.py
"""
import json, os, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'art', 'glaze2', 'source')
OUT = os.path.join(ROOT, 'assets', 'tidewheel-glaze')
PPU, MARGIN, FOOT = 3, 4, (34, 18)     # raft bricks are 34x18 units; ppu and margin as glaze v2
SS = 4                                 # work at 4x the shipped pixels, then downsample
FW, FH = FOOT[0] * PPU, FOOT[1] * PPU  # face pixels (102 x 54)
STATES = {0: 'intact', 1: 'cracked', 2: 'breaking'}

sheet = Image.open(os.path.join(SRC, 'bricks.png')).convert('RGBA')
frames = {k[:-4]: v['frame'] for k, v in json.load(open(os.path.join(SRC, 'bricks.json')))['frames'].items()}
def frame(name):
    f = frames[name]; return sheet.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))

def hexc(h): return [int(h[i:i + 2], 16) for i in (1, 3, 5)]
# Gradient-map ramps over normalised source luminance (0 = crack/shadow, ~.55 = body, 1 = glint).
RAMPS = {
    'seaglass': [(0, '#02161a'), (.22, '#0b4a4c'), (.42, '#1b7e78'), (.58, '#3aa596'), (.74, '#7fd0bd'), (.88, '#c6efe2'), (1, '#ffffff')],
    'coral':    [(0, '#22040b'), (.22, '#7c1630'), (.42, '#cc3f57'), (.58, '#f46a78'), (.74, '#ff9f9e'), (.88, '#ffd9d2'), (1, '#ffffff')],
    'pearl':    [(0, '#1f1913'), (.22, '#74624f'), (.42, '#c0ad96'), (.58, '#e8dcc9'), (.74, '#f6efe2'), (.88, '#fffbf3'), (1, '#ffffff')],
    'steel':    [(0, '#05080c'), (.22, '#1d2a34'), (.42, '#3f5361'), (.58, '#64798a'), (.74, '#97aab6'), (.88, '#d4e0e6'), (1, '#ffffff')],
}
BRASS = [(0, '#100902'), (.22, '#3e280c'), (.42, '#7a531e'), (.58, '#a67c38'), (.74, '#d2ab62'), (.88, '#f3dfa6'), (1, '#ffffff')]
TINT = {'seaglass': hexc('#0f5e5c'), 'coral': hexc('#a92a44'), 'pearl': hexc('#a8957f'), 'steel': hexc('#33444f')}
BASE = 'teal'   # one source hue for every material, so all four share the same tonal structure

def ramp_lut(stops):
    xs = np.array([s for s, _ in stops]); cs = np.array([hexc(c) for _, c in stops], float)
    t = np.linspace(0, 1, 256); return np.stack([np.interp(t, xs, cs[:, i]) for i in range(3)], 1)

def norm_lum(a):
    """Source luminance mapped so the body sits near .55, cracks near 0 and the star glint at 1."""
    L = .299 * a[..., 0] + .587 * a[..., 1] + .114 * a[..., 2]
    lo, mid, hi = 22.0, 133.0, 244.0
    n = np.where(L < mid, .55 * (L - lo) / (mid - lo), .55 + .45 * (L - mid) / (hi - mid))
    return np.clip(n, 0, 1)

def gmap(n, lut):
    return lut[np.clip((n * 255).astype(int), 0, 255)]

def soft_ellipse(size, box, fill, blur):
    im = Image.new('RGBA', size); ImageDraw.Draw(im).ellipse(box, fill=fill)
    return im.filter(ImageFilter.GaussianBlur(blur)) if blur else im

def bead(layer, x, y, r, tint):
    """A beaded water drop on a glossy face: a soft refraction shadow below-right, a lens body a shade deeper than the
    glaze, a hard glint top-left and a caustic crescent on the lower lip (key light from the top-left, as the source)."""
    s = layer.size
    layer.alpha_composite(soft_ellipse(s, (x - r * .8 + r * .3, y - r * .62 + r * .5, x + r * .95 + r * .3, y + r * .7 + r * .5), (0, 8, 12, 80), r * .3))
    layer.alpha_composite(soft_ellipse(s, (x - r, y - r * .76, x + r, y + r * .76), (*tint, 130), r * .1))
    cres = soft_ellipse(s, (x - r * .7, y - r * .1, x + r * .75, y + r * .66), (255, 255, 255, 120), r * .12)
    cut = soft_ellipse(s, (x - r * .85, y - r * .55, x + r * .62, y + r * .4), (255, 255, 255, 255), r * .1).getchannel('A')
    cres.putalpha(Image.fromarray((np.asarray(cres.getchannel('A')).astype(float) * (1 - np.asarray(cut) / 255)).astype(np.uint8)))
    layer.alpha_composite(cres)
    layer.alpha_composite(soft_ellipse(s, (x - r * .62, y - r * .56, x - r * .08, y - r * .16), (255, 255, 255, 245), r * .07))

def barnacle(layer, x, y, r, rng):
    """A small acorn barnacle: a chalky cone lit from the top-left, shaded below-right, with a dark slit aperture and a
    contact shadow on the face."""
    s = layer.size; tone = rng.randint(-12, 8)
    layer.alpha_composite(soft_ellipse(s, (x - r * .7, y - r * .45, x + r * 1.3, y + r * 1.15), (0, 0, 0, 140), r * .35))
    layer.alpha_composite(soft_ellipse(s, (x - r, y - r * .85, x + r, y + r * .85), (150 + tone, 140 + tone, 122 + tone, 255), r * .06))
    layer.alpha_composite(soft_ellipse(s, (x - r * .95, y - r * .85, x + r * .25, y + r * .2), (246, 240, 224, 190), r * .3))
    layer.alpha_composite(soft_ellipse(s, (x - r * .05, y - r * .1, x + r * 1.0, y + r * .85), (52, 44, 34, 150), r * .3))
    layer.alpha_composite(soft_ellipse(s, (x - r * .32, y - r * .26, x + r * .28, y + r * .12), (20, 16, 13, 250), r * .05))
    layer.alpha_composite(soft_ellipse(s, (x - r * .22, y + r * .02, x + r * .3, y + r * .24), (255, 248, 230, 120), r * .06))

def build_face(material, state, seed):
    src = frame(f'{BASE}-{STATES[state]}').resize((FW * SS, FH * SS), Image.LANCZOS)
    a = np.asarray(src).astype(float); alpha = a[..., 3]; n = norm_lum(a)
    rgb = gmap(n, ramp_lut(RAMPS[material]))
    W, H = FW * SS, FH * SS; yy, xx = np.mgrid[0:H, 0:W] / np.array([H, W])[:, None, None]
    body = (n > .25) & (n < .8)
    if material == 'seaglass':
        # Light pooling inside the glass: the lower body glows a touch lighter and greener.
        pool = np.exp(-((yy - .72) / .16) ** 2) * np.exp(-((xx - .5) / .38) ** 2) * body
        rgb = rgb + pool[..., None] * (np.array(hexc('#9ff0d6')) - rgb) * .32
    if material == 'pearl':
        # Nacre: a soft shift of hue across the face on the mid-tones only.
        sheen = np.stack([np.sin(xx * 5.2 + yy * 2.1), np.sin(xx * 5.2 + yy * 2.1 + 2.1), np.sin(xx * 5.2 + yy * 2.1 + 4.2)], -1)
        rgb = rgb + (sheen * np.array([1, .55, .9])) * body[..., None] * 6
    if material == 'steel':
        # Two riveted brass bands mapped through the same bevel luminance.
        brass = gmap(n, ramp_lut(BRASS))
        for c in (.24, .76):
            band = np.clip(1 - np.abs(xx - c) / .055, 0, 1); band = np.clip(band * 6, 0, 1)
            u = np.clip((xx - c) / .055, -1, 1)   # across the band: lit on the left, rolling off to the right
            shade = 1.18 - .42 * (u + 1) / 2 + .25 * np.exp(-((u + .45) / .18) ** 2)
            rgb = rgb * (1 - band[..., None]) + np.clip(brass * shade[..., None], 0, 255) * band[..., None]
            for edge in (c - .055, c + .055):   # recessed seam at each band edge
                rgb = rgb * (1 - .45 * np.exp(-((xx - edge) / .006) ** 2)[..., None] * (alpha[..., None] > 0))
    face = Image.fromarray(np.dstack([np.clip(rgb, 0, 255), alpha]).astype(np.uint8), 'RGBA')
    over = Image.new('RGBA', face.size); rng = random.Random(seed)
    if material == 'steel':
        for c in (.24, .76):
            for ry in (.24, .78):
                x, y, r = c * W, ry * H, 2.2 * SS
                over.alpha_composite(soft_ellipse(face.size, (x - r + 2, y - r + 3, x + r + 2, y + r + 3), (0, 0, 0, 110), 3))
                over.alpha_composite(soft_ellipse(face.size, (x - r, y - r, x + r, y + r), (150, 104, 44, 255), 0))
                over.alpha_composite(soft_ellipse(face.size, (x - r * .7, y - r * .75, x + r * .1, y), (255, 236, 180, 220), 2))
    # Barnacles: a cluster on the steel's lower-left and upper-right, a small one on the shell's lower-right corner.
    clusters = {'steel': [(.09, .68, 3), (.92, .3, 2)], 'pearl': [(.9, .7, 2)]}.get(material, [])
    for cx, cy, k in clusters:
        for i in range(k):
            barnacle(over, (cx + (rng.random() - .5) * .07) * W, (cy + (rng.random() - .5) * .22) * H, (2.6 + rng.random() * 1.0) * SS * (1.35 if i == 0 else 1), rng)
    # Wet: a soft sheen streak across the upper body and a few beaded drops in the lower half.
    over.alpha_composite(soft_ellipse(face.size, (.18 * W, .2 * H, .66 * W, .34 * H), (255, 255, 255, 34), 3 * SS))
    for i in range(2 + rng.randint(0, 2)):
        bead(over, (.2 + .62 * rng.random()) * W, (.52 + .26 * rng.random()) * H, (2.2 + rng.random() * 1.4) * SS, TINT[material])
    # Bounce light off the water below: a cool rim on the lower bevel of every material.
    rows = np.nonzero(alpha.max(1) > 200)[0]; bottom = rows[-1] if len(rows) else H
    rim = np.exp(-((yy * H - (bottom - .06 * H)) / (.035 * H)) ** 2) * ((n > .18) & (n < .75)) * (alpha > 200)
    over.alpha_composite(Image.fromarray(np.dstack([np.full((H, W), 168), np.full((H, W), 236), np.full((H, W), 240), rim * 95]).astype(np.uint8), 'RGBA'))
    over.putalpha(Image.fromarray((np.asarray(over.getchannel('A')).astype(float) * (alpha > 200)).astype(np.uint8)))
    face.alpha_composite(over)
    return face.resize((FW, FH), Image.LANCZOS)

def seat(face):
    """Glaze v2's seat: the face on the margin canvas over a soft lower-right contact shadow."""
    m = MARGIN * PPU; cv = Image.new('RGBA', (face.width + 2 * m, face.height + 2 * m))
    a = face.getchannel('A').point(lambda v: v * 150 // 255)
    sh = Image.new('RGBA', cv.size); sh.paste(Image.new('RGBA', face.size, (2, 10, 16, 255)), (m + 2, m + 5), a)
    cv = Image.alpha_composite(cv, sh.filter(ImageFilter.GaussianBlur(3.2)))
    cv.alpha_composite(face, (m, m)); return cv

os.makedirs(OUT, exist_ok=True); sprites = {}
for mi, material in enumerate(RAMPS):
    for state in STATES:
        key = f'tg_{material}_{state}'
        im = seat(build_face(material, state, 1000 + mi * 7))
        Image.frombytes('RGBA', im.size, im.tobytes()).save(os.path.join(OUT, key + '.png'), optimize=True)   # no metadata
        sprites[key] = {'file': key + '.png', 'px': list(im.size), 'ppu': PPU, 'footprint': list(FOOT),
                        'drawSize': [FOOT[0] + 2 * MARGIN, FOOT[1] + 2 * MARGIN], 'margin': MARGIN, 'material': material, 'state': state}
json.dump({'source': 'art/tidewheel-glaze/build.py (re-glazed from art/glaze2/source/bricks.png)', 'sprites': sprites},
          open(os.path.join(OUT, 'atlas.json'), 'w'), indent=1)
print(len(sprites), 'sprites ->', OUT)
