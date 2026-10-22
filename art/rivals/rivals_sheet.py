"""Proof / contact sheets for the Serpent Rivals art (art/rivals/rivals_art.py).
Writes art/rivals/proof/{mock,contact}.png and, when the review mount is present, copies them to
/mnt/project-files/breaker/review-2026-10-22/rivals-art/.
Mock = floor 3 and floor 1 laid out from RIVALS_LAYOUT (rivals.js numbers copied below) at a 393x852 @2x phone's pixel scale
(786 px for 360u, 2.183 px/u) on the in-game Lumi-tower wall, with the shipped window kit, vault bricks and serpent heads.
"""
from pathlib import Path
import json, math, base64, io, shutil, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
A = ROOT / 'assets'
PROOF = HERE / 'proof'
REVIEW = Path('/mnt/project-files/breaker/review-2026-10-22/rivals-art')
WALL_SHOT = Path('/mnt/project-files/breaker/review-2026-10-22/lumi/393x852-15L-strike-mid-row.png')
K = 786 / 360                                   # phone px per game unit (393 css px @2x)
WALL = (0x1d, 0x1a, 0x2b, 255)
# rivals.js RIVALS_LAYOUT / LUNGE (read-only copy for the mock)
COLS, PITCH, BW, BH, RP, GAP = 7, 36, 32, 18, 22, 190
ROWS = [9, 11, 12]
WINDOWS = [{'gnash': [1, 4, 7], 'mooncoil': []}, {'gnash': [2, 5], 'mooncoil': [5, 8]}, {'gnash': [1, 6, 9], 'mooncoil': [2, 6, 10]}]
CROSS, LANE, SHUTTERS = [None, 5, 6], [4, 5, 6], [[2, 6], [], []]
WALLX = 24
FONT = str(A / 'fonts' / 'Rubik.ttf')


def font(n):
    try: return ImageFont.truetype(FONT, n)
    except Exception: return ImageFont.load_default()


def load(p):
    return Image.open(p).convert('RGBA')


def vault_art():
    s = (ROOT / 'src' / 'vault-art.js').read_text()
    return json.loads(s[s.index('{'):s.rindex('}') + 1])


def data_img(url):
    return Image.open(io.BytesIO(base64.b64decode(url.split(',', 1)[1]))).convert('RGBA')


class Board:
    def __init__(self, floor, H=780):
        self.floor = floor; self.H = H
        paddle = H - 90; self.bottom = paddle - GAP; self.rows = ROWS[floor]
        self.x0 = (360 - (COLS * PITCH - (PITCH - BW))) / 2

    def rowTop(self, r): return self.bottom - (self.rows - r) * RP + 4
    def rowY(self, r): return self.rowTop(r) + BH / 2
    def colX(self, c): return self.x0 + c * PITCH


def man():
    return json.loads((A / 'rivals' / 'manifest.json').read_text())


def put(canvas, im, x, y, w, h, ox=0, oy=0):
    """place sprite with drawSize (w,h) units so its top-left lands at world (x, y); ox/oy = canvas offset (world)"""
    im = im.resize((max(1, round(w * K)), max(1, round(h * K))), Image.Resampling.LANCZOS)
    canvas.alpha_composite(im, (round((x - ox) * K), round((y - oy) * K)))


def sprite(M, name):
    s = M['sprites'][name]
    return load(ROOT / s['path']), s


def put_anchor(canvas, M, name, x, y, oy, scale=1.0):
    im, s = sprite(M, name)
    w, h = s['drawSize']; ax, ay = s['anchor']
    put(canvas, im, x - ax * scale, y - ay * scale, w * scale, h * scale, 0, oy)


def wall_bg(w, h):
    if WALL_SHOT.exists():
        band = load(WALL_SHOT).crop((0, 1040, 786, 1400))
        bg = Image.new('RGBA', (w, h))
        for y in range(0, h, band.height): bg.alpha_composite(band, (0, y)) if band.width == w else bg.alpha_composite(band.resize((w, band.height)), (0, y))
        return bg
    return Image.new('RGBA', (w, h), WALL)


def body(canvas, pts, r0, r1, col, oy):
    """mock serpent body: shaded tapered tube (the game draws its own; this only places the heads in context)"""
    d = ImageDraw.Draw(canvas)
    n = len(pts)
    dark = tuple(int(c * 0.55) for c in col)
    for pass_, (cc, sh, k) in enumerate(((dark, 0.0, 1.0), (col, -0.18, 0.78), (tuple(min(255, int(c * 1.35)) for c in col), -0.38, 0.32))):
        for i in range(n):
            t = i / (n - 1); r = (r0 + (r1 - r0) * t) * k
            x, y = pts[i]; y += sh * (r0 + (r1 - r0) * t)
            d.ellipse([(x - r) * K, (y - oy - r) * K, (x + r) * K, (y - oy + r) * K], fill=cc + (255,))


def head(canvas, skin, expr, side, x, y, oy, scale=1.5):
    im = load(A / skin / f'head_{expr}_{side}.png')
    put(canvas, im, x - 22 * scale, y - 22 * scale, 44 * scale, 44 * scale, 0, oy)


def window(canvas, x, y, oy, front='window_front', inner=None, eyes=False, M=None):
    ws = 44 / 60
    cw = json.loads((A / 'castle' / 'window-manifest.json').read_text())['sprites']
    put(canvas, load(A / 'castle' / 'window_back.png'), x - 30 * ws, y - 36 * ws, 60 * ws, 72 * ws, 0, oy)
    if eyes: put(canvas, load(A / 'rivals' / 'shutter_eyes.png'), x - 30 * ws, y - 36 * ws, 60 * ws, 72 * ws, 0, oy)
    if inner: inner()
    src = A / 'rivals' / f'{front}.png' if front.endswith('shuttered') else A / 'castle' / f'{front}.png'
    put(canvas, load(src), x - 30 * ws, y - 36 * ws, 60 * ws, 72 * ws, 0, oy)


def mock_floor(M, art, floor, top, bottom, ward=0, seal_stage='seal_crack1', clash=True, lit=('gnash',)):
    b = Board(floor)
    W = round(360 * K); Hh = round((bottom - top) * K)
    cv = wall_bg(W, Hh)
    bricks = {c: data_img(art['sprites'][f'brick_{c}_2_0']['url']) for c in 'tvcyb'}
    cross = CROSS[floor]; mid = 3
    # chamber floor under everything
    if cross is not None:
        cx, cy = 180, b.rowY(cross)
        ch = M['sprites']['chamber_floor']
        put_anchor(cv, M, 'chamber_floor', b.colX(mid - 1) - 4 + 56, b.rowTop(cross - 1) - 2 + 33, top)
    win = WINDOWS[floor]
    mouth = lambda r, c: (c == 0 and r in win['gnash']) or (c == COLS - 1 and r in win['mooncoil'])
    def open_(r, c):
        return mouth(r, c) or (cross is not None and ((abs(r - cross) <= 1 and abs(c - mid) <= 1) or (r > cross + 1 and c == mid)))
    lane = LANE[floor]; colours = ['t', 'v', 'c', 'y', 'b', 'y']
    for r in range(b.rows):
        for c in range(COLS):
            if open_(r, c): continue
            x, y = b.colX(c), b.rowTop(r)
            lure = r == lane - 1 and ((c == 0 and lane in win['gnash']) or (c == COLS - 1 and lane in win['mooncoil']))
            if lure:
                snake = 'gnash' if c == 0 else 'mooncoil'
                put_anchor(cv, M, f'lure_{snake}_{"lit" if snake in lit else "dim"}', x + 16, y + 9, top); continue
            put(cv, bricks[colours[(r + c * 2) % 6]], x - 4, y - 3, 40, 24, 0, top)
    # seal / hatch
    if floor:
        sy = b.rowTop(0) - 56
        put_anchor(cv, M, seal_stage, 180, sy + 15, top)
        slots = M['sealWardSlots']['slots']; sp = M['sprites'][seal_stage]
        for i in range(ward):
            sx_, sy_ = slots[i]
            put_anchor(cv, M, 'ward_plate_iron' if i % 3 else 'ward_plate_gilt', 180 - sp['anchor'][0] + sx_, sy + 15 - sp['anchor'][1] + sy_, top)
    # windows (+ the clash on the crossing)
    for snake, rows in win.items():
        for r in rows:
            side = 0 if snake == 'gnash' else 1; x = WALLX if not side else 360 - WALLX; y = b.rowY(r)
            window(cv, x, y, top)
    for r in SHUTTERS[floor]:
        window(cv, 360 - WALLX, b.rowY(r), top, front='window_front_shuttered', eyes=True)
    if clash and cross is not None:
        y = b.rowY(cross)
        gcol, mcol = (0x16, 0x8f, 0x83), (0x6c, 0x44, 0xb8)
        body(cv, [(WALLX + 4 + (180 - 22 - WALLX - 4) * i / 30, y + 2.2 * math.sin(i * 0.5)) for i in range(31)], 3.5, 7.5, gcol, top)
        body(cv, [(360 - WALLX - 4 - (360 - WALLX - 4 - 180 - 22) * i / 30, y + 2.2 * math.sin(i * 0.5 + 1)) for i in range(31)], 3.5, 7.5, mcol, top)
        head(cv, 'snake-emerald', 'snarl', 'r', 180 - 17, y, top)
        head(cv, 'snake', 'snarl', 'l', 180 + 17, y, top)
        put_anchor(cv, M, 'clash_0', 180, y - 2, top)
        window(cv, WALLX, y, top); window(cv, 360 - WALLX, y, top)
    return cv


def label(d, xy, text, size=18, fill=(236, 228, 248, 255)):
    d.text(xy, text, font=font(size), fill=fill)


def contact(M):
    """every sprite at phone scale (2.183 px/u) on the wall colour, plus a 1 px = 1 u strip"""
    items = [('lure_gnash_lit', 'lure emerald lit'), ('lure_gnash_dim', 'lure emerald dim'), ('lure_mooncoil_lit', 'lure violet lit'),
             ('lure_mooncoil_dim', 'lure violet dim'), ('ward_plate_iron', 'ward plate'), ('ward_plate_gilt', 'ward plate gilt'),
             ('clash_0', 'clash f0'), ('clash_1', 'clash f1'), ('clash_2', 'clash f2')]
    seals = ['seal_intact', 'seal_crack1', 'seal_crack2', 'seal_shattered']
    W = 1680; cv = Image.new('RGBA', (W, 1180), WALL); d = ImageDraw.Draw(cv)
    label(d, (24, 16), 'Serpent Rivals art, phone scale (393x852 @2x = 2.18 px/u) on wall #1d1a2b', 22)
    x, y = 24, 60
    for name, lab in items:
        im, s = sprite(M, name); w, h = s['drawSize']
        r = im.resize((round(w * K), round(h * K)), Image.Resampling.LANCZOS)
        cv.alpha_composite(r, (x, y + 28)); label(d, (x, y), lab, 15)
        x += max(r.width + 26, 130)
    y = 260; x = 24
    for i, name in enumerate(seals):
        im, s = sprite(M, name); w, h = s['drawSize']
        r = im.resize((round(w * K), round(h * K)), Image.Resampling.LANCZOS)
        px, py = 24 + (i % 2) * 830, y + (i // 2) * 140
        cv.alpha_composite(r, (px, py + 26)); label(d, (px, py), name.replace('_', ' '), 15)
    # seal with 3 and 6 plates
    y = 560
    for j, n in enumerate((3, 6)):
        im, s = sprite(M, 'seal_intact'); w, h = s['drawSize']
        base = im.resize((round(w * K), round(h * K)), Image.Resampling.LANCZOS)
        layer = Image.new('RGBA', base.size); layer.alpha_composite(base)
        for i in range(n):
            pim, ps = sprite(M, 'ward_plate_iron' if i % 3 else 'ward_plate_gilt'); pw, ph = ps['drawSize']
            sx, sy = M['sealWardSlots']['slots'][i]
            layer.alpha_composite(pim.resize((round(pw * K), round(ph * K)), Image.Resampling.LANCZOS),
                                  (round((sx - ps['anchor'][0]) * K), round((sy - ps['anchor'][1]) * K)))
        px = 24 + j * 830
        cv.alpha_composite(layer, (px, y + 26)); label(d, (px, y), f'seal + {n} ward plates', 15)
    # chamber + shutter composite (window drawn at the game's 44/60 scale) + 1:1 strip
    y = 720
    im, s = sprite(M, 'chamber_floor'); w, h = s['drawSize']
    cv.alpha_composite(im.resize((round(w * K), round(h * K)), Image.Resampling.LANCZOS), (24, y + 26)); label(d, (24, y), 'chamber floor', 15)
    ws = 44 / 60; x0 = 330
    for k, (front, eyes, lab) in enumerate((('window_front', False, 'window (kit)'), ('window_front_shuttered', False, 'shuttered'),
                                            ('window_front_shuttered', True, 'shuttered + eyes'))):
        comp = load(A / 'castle' / 'window_back.png')
        if eyes: comp.alpha_composite(load(A / 'rivals' / 'shutter_eyes.png'))
        comp.alpha_composite(load((A / 'rivals' if 'shutter' in front else A / 'castle') / f'{front}.png'))
        r = comp.resize((round(60 * ws * K), round(72 * ws * K)), Image.Resampling.LANCZOS)
        cv.alpha_composite(r, (x0 + k * 130, y + 26)); label(d, (x0 + k * 130, y), lab, 15)
    # 1 px = 1 unit strip
    y = 940; label(d, (24, y), 'native units (1 px = 1 u), and 3x nearest', 15)
    strip = Image.new('RGBA', (560, 60), WALL); x = 4
    for name in ['lure_gnash_lit', 'lure_mooncoil_dim', 'seal_crack2', 'ward_plate_iron', 'chamber_floor', 'clash_0']:
        im, s = sprite(M, name); w, h = s['drawSize']
        r = im.resize((round(w), round(h)), Image.Resampling.LANCZOS); strip.alpha_composite(r, (x, 2)); x += r.width + 6
        if x > 540: break
    cv.alpha_composite(strip, (24, y + 26))
    z = strip.crop((0, 0, 300, 60)).resize((900, 180), Image.Resampling.NEAREST)
    cv.alpha_composite(z.crop((0, 0, 900, 180)), (24 + 560 + 20, y - 6))
    return cv.crop((0, 0, W, 1140))


def main():
    PROOF.mkdir(parents=True, exist_ok=True)
    M = man(); art = vault_art()
    f3 = mock_floor(M, art, 2, 150, 520, ward=3, seal_stage='seal_crack1')
    f1 = mock_floor(M, art, 0, 180, 520, clash=False)
    f2 = mock_floor(M, art, 1, 170, 520, ward=5, seal_stage='seal_crack2', lit=('gnash', 'mooncoil'))
    gap = 24
    mock = Image.new('RGBA', (f3.width * 3 + gap * 4, max(f3.height, f1.height, f2.height) + 70), WALL)
    d = ImageDraw.Draw(mock)
    for i, (im, lab) in enumerate(((f1, 'floor 1 Lure hall: shuttered Mooncoil windows, Gnash lure lit'),
                                   (f2, 'floor 2 Crossing: both lures lit, seal crack2 + 5 plates'),
                                   (f3, 'floor 3 Twin Seal: clash in the chamber, crack1 + 3 plates'))):
        x = gap + i * (f3.width + gap)
        mock.alpha_composite(im, (x, 54)); label(d, (x, 16), lab, 19)
    mock.convert('RGB').save(PROOF / 'mock.png', optimize=True)
    contact(M).convert('RGB').save(PROOF / 'contact.png', optimize=True)
    try:
        REVIEW.mkdir(parents=True, exist_ok=True)
        for n in ('mock.png', 'contact.png'): shutil.copyfile(PROOF / n, REVIEW / n)
        print('review copies ->', REVIEW)
    except OSError as e:
        print('review mount not written:', e)


if __name__ == '__main__':
    main()
