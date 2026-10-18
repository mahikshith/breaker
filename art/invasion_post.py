# Post-processing for the Invasion renders (Pillow + numpy only, no Blender needed).
# Run after art/render_invasion_assets.py has filled art/out/invasion_raw/:
#   python3 art/invasion_post.py
# Writes assets/invasion/: plate.png/.jpg, every sprite PNG, atlas.json, contact.png, composite.png.
# Adds what Cycles has no cheap equivalent for: halos around the plate's indicator lights and LED strips, a faint
# sheen on the window glass, LED bloom on the robots, the plasma glow of the bolt, the mothership's under-glow and
# rim-light halos. Robot tint masks are cut from the mask renders.
import json, os, hashlib, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
RAW = os.path.join(HERE, 'out', 'invasion_raw')
OUT = os.path.join(ROOT, 'assets', 'invasion')
VAULT = os.path.join(ROOT, 'assets', 'vault')
os.makedirs(OUT, exist_ok=True)

PLATE_X0, PLATE_Y0, PLATE_W, PLATE_H, PPU = 0, -40, 360, 820, 2
SPR_PPU, MARGIN = 3, 4
OX, OY, CW, CH, COLS, ROWS = 26, 92, 28, 18, 11, 9
LAYOUT = ['..bbbbbbb..', '.ccpcccpcc.', 'ccbcbcbcbcc', 'ccccccccccc', 'aacaaaaacaa', 'cbccbcbccbc', 'ccpccccpccc', '.ccccccccc.', '..c.c.c.c..']
ROW_COLORS = ['#ff5d8f', '#ff8a3d', '#ffd23f', '#5ccf6a', '#2ec4b6', '#3fa8f5', '#7b6cf6', '#c46bf0', '#ff5d8f']
BOT_KEY = {0: 'pink', 2: 'yellow', 5: 'blue'}
BOT_EXPR = ['march0', 'march1', 'angry', 'hurt', 'dizzy', 'laugh', 'shock']
BOT_COLORS = {'white': '#f4f6fb', 'pink': '#ff5d8f', 'yellow': '#ffd23f', 'blue': '#3fa8f5'}
SHIP_EXPR = ['smug', 'angry', 'hurt', 'panic', 'dizzy']
SHIP_SIZE = (108, 64)        # raw render size; post pads SHIP_PAD units above and below for the under-glow
SHIP_PAD = 8
SHIP_HULL_DY = -2.8         # centre of the ship body (dome top -22 .. hull bottom +16 units from the sprite centre), = hit ellipse centre
SHIP_UNDER_DY = 16.0         # the under-glow emitter, units below the sprite centre
WIN = dict(x0=14, y0=46, x1=346, y1=434, r=26)
PLANET = dict(x=266, y=356, r=98)
MOON = dict(x=58, y=82, r=12)
SILL_LED_Y = 434 + 14 + 15.1
TINT_JITTER = 0.04


def px(x, y):
    return round((x - PLATE_X0) * PPU), round((y - PLATE_Y0) * PPU)


def save_png(im, name):
    p = os.path.join(OUT, name); im.save(p, optimize=True); return p


def radial(w, h, cx, cy, sx, sy=None):
    sy = sx if sy is None else sy
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    return np.exp(-((xx - cx) ** 2 / (2 * sx ** 2) + (yy - cy) ** 2 / (2 * sy ** 2)))


def hexrgb(h):
    return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], np.float32)


def screen_add(im, g, color):
    """Screen-blend a glow (h, w) of the given rgb colour onto an RGB float image."""
    return 255 - (255 - im) * (1 - np.clip(g, 0, 1)[..., None] * (np.asarray(color, np.float32) / 255))


# ------------------------------------------------------------------------------------------------ plate
def rrect_mask(w, h, x0, y0, x1, y1, r, ss=4):
    m = Image.new('L', (w * ss, h * ss), 0)
    ImageDraw.Draw(m).rounded_rectangle([x0 * ss, y0 * ss, x1 * ss, y1 * ss], r * ss, fill=255)
    return np.asarray(m.resize((w, h), Image.LANCZOS)).astype(np.float32) / 255


def plate():
    im = np.asarray(Image.open(os.path.join(RAW, 'plate.png')).convert('RGB')).astype(np.float32)
    h, w, _ = im.shape
    # indicator light halos
    for (x, y, hx, r) in json.load(open(os.path.join(RAW, 'plate_lights.json'))):
        cx, cy = px(x, y)
        g = radial(w, h, cx, cy, 2.2 * r * PPU) * 0.28 + radial(w, h, cx, cy, 6 * r * PPU) * 0.05   # v3: quieter
        im = screen_add(im, g, hexrgb(hx))
    # LED strip glows (sill: cyan, deck edge: pink), soft horizontal bands
    yy = np.arange(h, dtype=np.float32)[:, None]; xx = np.arange(w, dtype=np.float32)[None, :]
    xfall = np.clip(np.minimum(xx - 10 * PPU, 350 * PPU - xx) / (30 * PPU), 0, 1)
    for (ly, col, a, s1, s2) in ((SILL_LED_Y, '#4fe9ff', 0.14, 1.5, 9), (434 + 14 + 24 + 196 + 3.7, '#ff5d8f', 0.10, 1.4, 8)):   # v3: quieter
        _, cy = px(0, ly)
        g = (np.exp(-(yy - cy) ** 2 / (2 * (s1 * PPU) ** 2)) * a + np.exp(-(yy - cy) ** 2 / (2 * (s2 * PPU) ** 2)) * a * 0.35) * xfall
        im = screen_add(im, g, hexrgb(col))
    # window glass: two faint diagonal sheen bands + a soft top-left reflection, only inside the opening
    win = rrect_mask(w, h, *(np.array(px(WIN['x0'], WIN['y0']))), *(np.array(px(WIN['x1'], WIN['y1']))), WIN['r'] * PPU)
    d = (xx * 0.62 + yy * 0.38) / PPU            # diagonal coordinate in units
    sheen = (np.exp(-((d - 120) / 16) ** 2) * 0.035 + np.exp(-((d - 300) / 22) ** 2) * 0.025)   # v3: soft only, no thin streak
    sheen += radial(w, h, *px(40, 60), 90 * PPU, 70 * PPU) * 0.03
    im = screen_add(im, sheen * win, (200, 215, 255))
    out = Image.fromarray(np.clip(im, 0, 255).astype(np.uint8), 'RGB')
    save_png(out, 'plate.png')
    out.save(os.path.join(OUT, 'plate.jpg'), quality=88, optimize=True, progressive=True)
    return out


# ------------------------------------------------------------------------------------------------ sprite effects
def to_premul(im):
    a = np.asarray(im.convert('RGBA')).astype(np.float32) / 255
    return a[..., :3] * a[..., 3:4], a[..., 3]


def from_premul(c, a):
    a = np.clip(a, 0, 1)
    rgb = np.where(a[..., None] > 1e-4, c / np.maximum(a[..., None], 1e-4), 0)
    return Image.fromarray((np.clip(np.dstack([rgb, a]), 0, 1) * 255 + 0.5).astype(np.uint8), 'RGBA')


def add_glow(im, glow_rgb, glow_a):
    """Additive glow (straight rgb + coverage) composited onto a straight-alpha sprite; extends into the margin."""
    c, a = to_premul(im)
    c = c + glow_rgb * glow_a[..., None] * (1 - 0.6 * a[..., None])
    a = a + glow_a * (1 - a)
    return from_premul(c, a)


def blur(arr, sigma):
    """Separable gaussian blur (numpy only), zero outside the image."""
    if arr.ndim == 3:
        return np.dstack([blur(arr[..., i], sigma) for i in range(arr.shape[2])])
    r = max(1, int(sigma * 3))
    k = np.exp(-np.arange(-r, r + 1) ** 2 / (2 * sigma * sigma)).astype(np.float32); k /= k.sum()
    a = np.pad(arr.astype(np.float32), r)
    a = sum(k[i] * a[:, i:i + a.shape[1] - 2 * r] for i in range(2 * r + 1))
    a = sum(k[i] * a[i:i + a.shape[0] - 2 * r, :] for i in range(2 * r + 1))
    return a


def led_bloom(im, sigma=2.4, gain=1.1, thr=0.72):
    """Bloom only saturated bright pixels (LED eyes, antenna ball), not white specular glints."""
    c, a = to_premul(im)
    rgb = np.where(a[..., None] > 1e-3, c / np.maximum(a[..., None], 1e-3), 0)
    mx = rgb.max(-1); mn = rgb.min(-1); sat = (mx - mn) / np.maximum(mx, 1e-3)
    m = np.clip((mx - thr) / 0.2, 0, 1) * np.clip((sat - 0.2) / 0.3, 0, 1) * a
    src = rgb * m[..., None]
    g = blur(src, sigma) + blur(src, sigma * 2.6) * 0.5
    ga = np.clip(g.max(-1) * gain, 0, 0.85)
    col = g / np.maximum(g.max(-1, keepdims=True), 1e-4)
    return add_glow(im, col, ga)


def halo(im, color, sx, sy, strength, cx=None, cy=None, behind=True):
    w, h = im.size
    g = radial(w, h, (w - 1) / 2 if cx is None else cx, (h - 1) / 2 if cy is None else cy, sx, sy) * strength
    glow = np.zeros((h, w, 4), np.float32); glow[..., :3] = color; glow[..., 3] = np.clip(g, 0, 1) * 255
    gi = Image.fromarray(glow.astype(np.uint8), 'RGBA')
    if behind:
        gi.alpha_composite(im); return gi
    return add_glow(im, np.ones((h, w, 3), np.float32) * np.asarray(color, np.float32) / 255, np.clip(g, 0, 1))


# ------------------------------------------------------------------------------------------------ sprites
def load_raw(name, size_units=None):
    im = Image.open(os.path.join(RAW, name + '.png')).convert('RGBA')
    if size_units: assert im.size == (size_units[0] * SPR_PPU, size_units[1] * SPR_PPU), (name, im.size)
    return im


def entry(name, im, foot, kind, margin=MARGIN, **extra):
    e = dict(file=name + '.png', px=list(im.size), ppu=SPR_PPU, anchor=[im.size[0] / 2, im.size[1] / 2], footprint=list(foot),
             drawSize=[im.size[0] / SPR_PPU, im.size[1] / SPR_PPU], margin=margin, kind=kind)
    e.update(extra); return e


def pad_v(im, p):
    out = Image.new('RGBA', (im.size[0], im.size[1] + 2 * p), (0, 0, 0, 0)); out.paste(im, (0, p)); return out


def sprites():
    atlas = {}
    cell = (CW + 2 * MARGIN, CH + 2 * MARGIN)
    for ci in range(9):
        for d in range(3):
            n = f'brick_c_{ci}_{d}'; im = load_raw(n, cell); save_png(im, n + '.png')
            atlas[n] = entry(n, im, (CW, CH), 'candy', color=ROW_COLORS[ci], dmg=d)
    for d in range(3):
        n = f'brick_a_{d}'; im = load_raw(n, cell); save_png(im, n + '.png')
        atlas[n] = entry(n, im, (CW, CH), 'armor', color='#8d97b3', dmg=d, hpLeft=3 - d)
    n = 'brick_p_0'; im = load_raw(n, cell); im = led_bloom(im, 2.0, 0.6, 0.8); save_png(im, n + '.png')
    atlas[n] = entry(n, im, (CW, CH), 'power', color='#f4c542')
    for ck in BOT_COLORS:
        for ex in BOT_EXPR:
            n = f'bot_{ck}_{ex}'; im = load_raw(n, cell); im = led_bloom(im)
            save_png(im, n + '.png')
            atlas[n] = entry(n, im, (CW, CH), 'bot', colorKey=ck, color=BOT_COLORS[ck], expr=ex,
                             **({'mask': f'bot_mask_{ex}.png'} if ck == 'white' else {}))
    for ex in BOT_EXPR:   # tint masks: the helmet shell's coverage, 0..255 alpha on white
        m = Image.open(os.path.join(RAW, f'botmask_{ex}.png')).convert('RGBA')
        a = np.asarray(m).astype(np.float32)
        cov = np.clip(a[..., :3].max(-1) * a[..., 3] / 255, 0, 255)
        out = np.zeros(a.shape, np.uint8); out[..., :3] = 255; out[..., 3] = cov.astype(np.uint8)
        im = Image.fromarray(out, 'RGBA'); n = f'bot_mask_{ex}'; save_png(im, n + '.png')
        atlas[n] = entry(n, im, (CW, CH), 'botmask', expr=ex)
    # bolt + bomb
    im = load_raw('bolt', (16, 24)); im = halo(im, (255, 60, 200), 3.2 * SPR_PPU, 6.0 * SPR_PPU, 0.75)
    save_png(im, 'bolt.png'); atlas['bolt'] = entry('bolt', im, (6, 14), 'projectile', margin=None)
    im = load_raw('bomb', (20, 24)); im = halo(im, (255, 70, 170), 5.5 * SPR_PPU, 5.5 * SPR_PPU, 0.45); im = led_bloom(im, 2.0, 0.9, 0.7)
    save_png(im, 'bomb.png'); atlas['bomb'] = entry('bomb', im, (12, 12), 'projectile', margin=None)
    # mothership: under-glow behind (cyan, or hot pink while firing), bloom on the rim bulbs
    for ex in SHIP_EXPR:
        n = f'mothership_{ex}'; im = pad_v(load_raw(n, SHIP_SIZE), SHIP_PAD * SPR_PPU)
        w, h = im.size; cy = h / 2 + SHIP_UNDER_DY * SPR_PPU
        if ex != 'dizzy':
            col = (255, 80, 210) if ex == 'angry' else (90, 240, 255)
            im = halo(im, col, 15 * SPR_PPU, 4.5 * SPR_PPU, 0.75 if ex == 'angry' else 0.6, cy=cy)
            im = halo(im, col, 26 * SPR_PPU, 8 * SPR_PPU, 0.18, cy=cy + 2 * SPR_PPU)
        im = led_bloom(im, 2.2, 0.8, 0.75)
        save_png(im, n + '.png')
        atlas[n] = entry(n, im, (94, 38), 'boss', margin=None, expr=ex, hitEllipse=[44, 18], hullCenter=[0, SHIP_HULL_DY])
    for par in (0, 1):
        n = f'mothership_lights_{par}'; im = pad_v(load_raw(n, SHIP_SIZE), SHIP_PAD * SPR_PPU)
        c, a = to_premul(im)
        g = blur(c, 2.0 * SPR_PPU) * 1.6 + blur(c, 5 * SPR_PPU) * 0.9
        ga = np.clip(g.max(-1), 0, 0.9); col = g / np.maximum(g.max(-1, keepdims=True), 1e-4)
        im = add_glow(im, col, ga); save_png(im, n + '.png')
        atlas[n] = entry(n, im, (94, 38), 'bossLights', margin=None, note='additive-friendly overlay; draw over mothership_* with the same rect, alternate 0/1')
    return atlas


# ------------------------------------------------------------------------------------------------ previews
def tint(im, k):
    a = np.asarray(im).astype(np.float32); a[..., :3] *= k
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA')


def place(canvas, im, cx, cy, ppu=PPU):
    k = ppu / SPR_PPU
    tw, th = round(im.size[0] * k), round(im.size[1] * k)
    s = im.resize((tw, th), Image.LANCZOS)
    x, y = round((cx - PLATE_X0) * ppu), round((cy - PLATE_Y0) * ppu)
    canvas.alpha_composite(s, (round(x - tw / 2), round(y - th / 2)))


def drop_shadow(canvas, im, cx, cy, ppu=PPU, dx=2.0, dy=3.0, a=0.35):
    k = ppu / SPR_PPU
    tw, th = round(im.size[0] * k), round(im.size[1] * k)
    al = np.asarray(im.resize((tw, th), Image.LANCZOS))[..., 3].astype(np.float32)
    al = blur(al, 1.5 * ppu / 2) * a
    sh = np.zeros((th, tw, 4), np.uint8); sh[..., 3] = np.clip(al, 0, 255).astype(np.uint8)
    x, y = round((cx + dx - PLATE_X0) * ppu), round((cy + dy - PLATE_Y0) * ppu)
    canvas.alpha_composite(Image.fromarray(sh, 'RGBA'), (round(x - tw / 2), round(y - th / 2)))


def formation(cv, ppu=PPU, frame=0, dx=0.0, dy=0.0):
    L = lambda n: Image.open(os.path.join(OUT, n + '.png')).convert('RGBA')
    for r, row in enumerate(LAYOUT):
        for c, v in enumerate(row):
            if v == '.': continue
            cx, cy = OX + dx + c * CW + CW / 2, OY + dy + r * CH + CH / 2
            if v == 'b':
                ex = ['march0', 'march1'][(frame + c) % 2]
                im = L(f'bot_{BOT_KEY[r]}_{ex}')
            elif v == 'a': im = L('brick_a_0')
            elif v == 'p': im = L('brick_p_0')
            else:
                im = L(f'brick_c_{r}_0')
                hsh = int(hashlib.md5(f'{c},{r}'.encode()).hexdigest()[:8], 16) / 0xffffffff
                im = tint(im, 1 + TINT_JITTER * (2 * hsh - 1))
            drop_shadow(cv, im, cx, cy, ppu)
            place(cv, im, cx, cy, ppu)


def paddle(cv, y, cx=180, pw=74, ppu=PPU):
    lft, mid, rgt = [Image.open(os.path.join(VAULT, f'paddle_{k}.png')).convert('RGBA') for k in 'lmr']
    k = ppu / SPR_PPU
    lw, rw = round(lft.size[0] * k), round(rgt.size[0] * k); mw = round((pw - 24) * ppu); hh = round(lft.size[1] * k)
    x0, y0 = round((cx - pw / 2 - MARGIN) * ppu), round((y - 6 - MARGIN - PLATE_Y0) * ppu)
    cv.alpha_composite(lft.resize((lw, hh), Image.LANCZOS), (x0, y0))
    cv.alpha_composite(mid.resize((mw, hh), Image.LANCZOS), (x0 + lw, y0))
    cv.alpha_composite(rgt.resize((rw, hh), Image.LANCZOS), (x0 + lw + mw, y0))


def composite(plate_im):
    """Left: the formation at the start. Right: the boss phase (mothership hovering, a bolt and a bomb falling)."""
    L = lambda n: Image.open(os.path.join(OUT, n + '.png')).convert('RGBA')
    ball = Image.open(os.path.join(VAULT, 'ball.png')).convert('RGBA')
    H = 760; py = H - 104
    a = plate_im.convert('RGBA'); formation(a)
    paddle(a, py); place(a, ball, 196, py - 30)
    place(a, L('bolt'), 129, 420)
    b = plate_im.convert('RGBA')
    place(b, L('mothership_smug'), 180, 130); place(b, L('mothership_lights_0'), 180, 130)
    place(b, L('bomb'), 160, 300); place(b, L('bolt'), 230, 380)
    paddle(b, py, 150); place(b, ball, 214, 520)
    out = Image.new('RGB', (a.size[0] * 2 + 16, a.size[1]), (14, 14, 22))
    out.paste(a.convert('RGB'), (0, 0)); out.paste(b.convert('RGB'), (a.size[0] + 16, 0))
    return out


def contact(atlas, plate_im):
    font = ImageFont.load_default()
    names = [n for n in atlas if not n.startswith('bot_mask')]
    cellw, cellh, cols = 170, 112, 8
    rows = (len(names) + cols - 1) // cols
    W = 380 + cols * cellw + 20; H = max(850, rows * cellh + 40)
    sheet = Image.new('RGBA', (W, H), (24, 22, 30, 255)); d = ImageDraw.Draw(sheet)
    th = plate_im.resize((360, 820), Image.LANCZOS).convert('RGBA')
    sheet.alpha_composite(th, (10, 20)); d.text((10, 4), 'plate.png (50%)', fill=(220, 220, 230, 255), font=font)
    for i, n in enumerate(names):
        cx = 380 + (i % cols) * cellw; cy = 20 + (i // cols) * cellh
        for yy in range(cy, cy + cellh - 18, 8):
            for xx in range(cx, cx + cellw - 10, 8):
                d.rectangle([xx, yy, xx + 7, yy + 7], fill=(44, 40, 54, 255) if ((xx - cx) // 8 + (yy - cy) // 8) % 2 else (36, 33, 45, 255))
        im = Image.open(os.path.join(OUT, atlas[n]['file'])).convert('RGBA')
        if im.size[0] > cellw - 14: im = im.resize((cellw - 14, round(im.size[1] * (cellw - 14) / im.size[0])), Image.LANCZOS)
        if im.size[1] > cellh - 22: im = im.resize((round(im.size[0] * (cellh - 22) / im.size[1]), cellh - 22), Image.LANCZOS)
        sheet.alpha_composite(im, (cx + (cellw - 10 - im.size[0]) // 2, cy + (cellh - 18 - im.size[1]) // 2))
        d.text((cx, cy + cellh - 16), f"{n} {atlas[n]['px'][0]}x{atlas[n]['px'][1]}", fill=(210, 210, 220, 255), font=font)
    sheet.convert('RGB').save(os.path.join(OUT, 'contact.png'), optimize=True)


def main():
    pl = plate()
    sp = sprites()
    atlas = {
        'version': 1,
        'units': 'game units (1 unit = 0.1 m in Blender); screen is 360 units wide',
        'board': dict(ox=OX, oy=OY, cols=COLS, rows=ROWS, cellW=CW, cellH=CH,
                      note='formation origin at the start; it marches +-14 sideways and steps down 14, so draw bricks relative to the live origin'),
        'plate': dict(file='plate.png', jpg='plate.jpg', px=list(pl.size), ppu=PPU, screenRect=[PLATE_X0, PLATE_Y0, PLATE_W, PLATE_H],
                      convention='pixel (px, py) <-> screen (x, y): px = 2*x, py = 2*(y + 40); draw plate at screen (0, -40) with size 360 x 820 units',
                      stretchNote='everything below y = 500 is generic wall / deck; stretch or tile that band for screens taller than 780'),
        'spriteConvention': ('sprites are 3 px/unit; draw each centred on its anchor at the footprint centre, at size drawSize (units) = px / 3. '
                             'Cell sprites (bricks, bots, masks): footprint 28 x 18 + a 4-unit transparent margin, so a cell (c, r) is drawn at '
                             'x = ox + c*28 - 4, y = oy + r*18 - 4, w = 36, h = 26. Mothership: drawSize 108 x 80 centred on the boss position; '
                             'its hit ellipse (radii 44 x 18) is centred hullCenter units from the sprite centre. bolt 16 x 24, bomb 20 x 24, centred.'),
        'tintJitter': TINT_JITTER,
        'tintNote': 'multiply glazed candy brick RGB by 1 + tintJitter*(2*hash(c,r)-1) for per-brick variation (composite.png does this)',
        'botTint': ('bot_white_<expr> has a near-white body (#f4f6fb). To tint to any colour T: draw bot_white, then draw it again into an '
                    'offscreen buffer, multiply by T, keep only bot_mask_<expr> (destination-in) and draw that over. pink / yellow / blue '
                    'are real renders for rows 0, 2, 5.'),
        'botColors': BOT_COLORS,
        'rowColors': ROW_COLORS,
        'anchors': {'window': [WIN['x0'], WIN['y0'], WIN['x1'] - WIN['x0'], WIN['y1'] - WIN['y0']], 'windowRadius': WIN['r'],
                    'planet': [PLANET['x'], PLANET['y'], PLANET['r']], 'moon': [MOON['x'], MOON['y'], MOON['r']],
                    'sillLed': SILL_LED_Y, 'mullionsX': [],
                    'indicatorLights': [[x, y, hx] for x, y, hx, r in json.load(open(os.path.join(RAW, 'plate_lights.json')))]},
        'sprites': sp,
    }
    json.dump(atlas, open(os.path.join(OUT, 'atlas.json'), 'w'), indent=1)
    composite(pl).save(os.path.join(OUT, 'composite.png'), optimize=True)
    contact(sp, pl)
    tot = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT))
    print('assets/invasion total', round(tot / 1024), 'KB in', len(os.listdir(OUT)), 'files')


if __name__ == '__main__':
    main()
