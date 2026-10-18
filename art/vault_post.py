# Post-processing for the Vault renders (Pillow + numpy only, no Blender needed).
# Run after art/render_vault_assets.py has filled art/out/vault_raw/:
#   python3 art/vault_post.py
# Writes assets/vault/: plate.png/.jpg, bars.png, every sprite PNG, atlas.json, contact.png, composite.png.
# Adds the light glows that Cycles has no cheap equivalent for (halo around the fire ball / torch flame / lantern), splits the paddle into stretchable caps + middle tile, and builds the previews.
import json, os, hashlib, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
RAW = os.path.join(HERE, 'out', 'vault_raw')
OUT = os.path.join(ROOT, 'assets', 'vault')
os.makedirs(OUT, exist_ok=True)

PLATE_X0, PLATE_Y0, PLATE_W, PLATE_H, PLATE_PPU = 0, -40, 360, 820, 2
SPR_PPU, MARGIN = 3, 4
OX, OY, CELL = 20, 96, 16
LANTERN = (196, 158)
TORCH_FLAMES = [(40, 527), (320, 527)]
PADDLE_CAP, PADDLE_MID = 12, 50

LAYOUT = [  # The Vault, 20 x 20 cells (rows 16-19 blue per the art-direction update)
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
    "bbbbb..bbbbbbbbbbbbb",
    "bbbbb..bbbgbbbbbb..b",
    "bbbbb..bbbbbbbbbb..b",
    "bbbbb..bbbbbbbbbb..b",
]
TINT_JITTER = 0.04


def px(x, y):
    """Screen units -> plate pixels."""
    return round((x - PLATE_X0) * PLATE_PPU), round((y - PLATE_Y0) * PLATE_PPU)


def save_png(im, name):
    p = os.path.join(OUT, name); im.save(p, optimize=True); return p


def radial(w, h, cx, cy, sigma):
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    return np.exp(-((xx - cx) ** 2 + (yy - cy) ** 2) / (2 * sigma ** 2))


def add_halo(im, color, sigma_px, strength, core=None):
    """Put a soft glow BEHIND a straight-alpha sprite (the glow is part of the sprite, centred)."""
    w, h = im.size
    g = radial(w, h, (w - 1) / 2 if core is None else core[0], (h - 1) / 2 if core is None else core[1], sigma_px) * strength
    glow = np.zeros((h, w, 4), np.float32); glow[..., :3] = color; glow[..., 3] = np.clip(g, 0, 1) * 255
    out = Image.fromarray(glow.astype(np.uint8), 'RGBA')
    out.alpha_composite(im)
    return out


def plate():
    im = np.asarray(Image.open(os.path.join(RAW, 'plate.png')).convert('RGB')).astype(np.float32)
    # v3: the wall torches are gone, so no torch halos; the plate is used as rendered
    out = Image.fromarray(np.clip(im, 0, 255).astype(np.uint8), 'RGB')
    save_png(out, 'plate.png')
    out.save(os.path.join(OUT, 'plate.jpg'), quality=88, optimize=True, progressive=True)
    return out


def bar_shadow(bars, dx=1.4, dy=2.2, blur_u=1.1, a=0.55):
    """v3: a soft contact shadow of the cage bars on the chamber's back wall, baked into the (plate-registered) bars layer."""
    from PIL import ImageFilter
    al = bars.split()[3]
    sh = Image.new('L', bars.size, 0); sh.paste(al, (round(dx * PLATE_PPU), round(dy * PLATE_PPU)))
    sh = sh.filter(ImageFilter.GaussianBlur(blur_u * PLATE_PPU)).point(lambda v: int(v * a))
    out = Image.merge('RGBA', (Image.new('L', bars.size, 4), Image.new('L', bars.size, 4), Image.new('L', bars.size, 8), sh))
    out.alpha_composite(bars)
    return out


def sprites(manifest):
    atlas = {}
    for name, m in manifest.items():
        if not os.path.exists(os.path.join(RAW, name + '.png')):   # declared but not rendered yet: leave it out of the atlas
            print('post: no raw render for', name, '- skipped'); continue
        im = Image.open(os.path.join(RAW, name + '.png')).convert('RGBA')
        sw, sh = m['size']
        assert im.size == (sw * SPR_PPU, sh * SPR_PPU), (name, im.size)
        if name == 'ball_fire': im = add_halo(im, (255, 120, 30), 5.0 * SPR_PPU / 2, 0.9)
        if name == 'torch_flame': im = add_halo(im, (255, 140, 50), 4.5 * SPR_PPU, 0.75)
        if name == 'lantern': im = add_halo(im, (255, 150, 60), 3.2 * SPR_PPU, 0.6)
        entry = dict(file=name + '.png', px=list(im.size), ppu=SPR_PPU, anchor=[im.size[0] / 2, im.size[1] / 2],
                     footprint=list(m['foot']), drawSize=[sw, sh], margin=MARGIN if name not in ('lantern', 'torch_flame') else None,
                     kind=m['kind'])
        if name == 'paddle':
            # left cap = margin + 12 units, middle = 50 units (stretch horizontally), right cap = 12 units + margin
            l = (MARGIN + PADDLE_CAP) * SPR_PPU; mid = PADDLE_MID * SPR_PPU
            parts = {'paddle_l': im.crop((0, 0, l, im.size[1])), 'paddle_m': im.crop((l, 0, l + mid, im.size[1])),
                     'paddle_r': im.crop((l + mid, 0, im.size[0], im.size[1]))}
            for pn, pim in parts.items():
                save_png(pim, pn + '.png')
                fw = {'paddle_l': PADDLE_CAP, 'paddle_m': PADDLE_MID, 'paddle_r': PADDLE_CAP}[pn]
                dw = pim.size[0] / SPR_PPU
                atlas[pn] = dict(file=pn + '.png', px=list(pim.size), ppu=SPR_PPU, anchor=[pim.size[0] / 2, pim.size[1] / 2],
                                 footprint=[fw, 12], drawSize=[dw, sh], margin=MARGIN, kind='paddle',
                                 note={'paddle_l': 'includes the 4-unit left margin; its right edge meets paddle_m',
                                       'paddle_m': 'no horizontal margin; stretch horizontally to (paddleWidth - 24) units',
                                       'paddle_r': 'includes the 4-unit right margin; its left edge meets paddle_m'}[pn])
            continue
        save_png(im, name + '.png')
        atlas[name] = entry
    return atlas


def cells():
    """Yield (col, row, kind, width) for the LAYOUT, bricks two cells wide in running bond."""
    done = set()
    for r, row in enumerate(LAYOUT):
        for c, v in enumerate(row):
            if v == '.' or (c, r) in done: continue
            w = 1
            if v not in 'g#' and (c + r) % 2 == 0 and c + 1 < len(row) and row[c + 1] == v and (c + 1, r) not in done: w = 2
            for k in range(w): done.add((c + k, r))
            yield c, r, v, w


def tint(im, k):
    a = np.asarray(im).astype(np.float32); a[..., :3] *= k
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA')


def place(canvas, im, cx, cy, scale=PLATE_PPU / SPR_PPU, size=None):
    """Draw sprite centred at screen (cx, cy)."""
    tw, th = size or (round(im.size[0] * scale), round(im.size[1] * scale))
    s = im.resize((tw, th), Image.LANCZOS)
    x, y = px(cx, cy)
    canvas.alpha_composite(s, (round(x - tw / 2), round(y - th / 2)))


def composite(plate_im):
    cv = plate_im.convert('RGBA')
    L = lambda n: Image.open(os.path.join(OUT, n + '.png')).convert('RGBA')
    cv.alpha_composite(L('bars'))
    rng = random.Random(5)
    for c, r, v, w in cells():
        x0, y0 = OX + c * CELL, OY + r * CELL
        cx, cy = x0 + w * CELL / 2, y0 + CELL / 2
        if v == 'g': name = 'brick_gold_1_0'
        elif v == '#': name = 'brick_granite_1_0'
        else:
            roll = rng.random(); d = 2 if roll < 0.05 else 1 if roll < 0.14 else 0
            name = f'brick_{v}_{w}_{d}'
        im = L(name)
        if v not in 'g#':   # deterministic per-cell tint jitter, as the game should do it
            hsh = int(hashlib.md5(f'{c},{r}'.encode()).hexdigest()[:8], 16) / 0xffffffff
            im = tint(im, 1 + TINT_JITTER * (2 * hsh - 1))
        place(cv, im, cx, cy)
    # paddle, 74 wide at y = 700 (caps + stretched middle), a serve-ready ball and a falling capsule
    pw, py_, pcx = 74, 700, 180
    lft, mid, rgt = L('paddle_l'), L('paddle_m'), L('paddle_r')
    k = PLATE_PPU / SPR_PPU
    lw, rw = round(lft.size[0] * k), round(rgt.size[0] * k); mw = (pw - 2 * PADDLE_CAP) * PLATE_PPU; hh = round(lft.size[1] * k)
    x0, y0 = px(pcx - pw / 2 - MARGIN, py_ - 6 - MARGIN)
    cv.alpha_composite(lft.resize((lw, hh), Image.LANCZOS), (x0, y0))
    cv.alpha_composite(mid.resize((mw, hh), Image.LANCZOS), (x0 + lw, y0))
    cv.alpha_composite(rgt.resize((rw, hh), Image.LANCZOS), (x0 + lw + mw, y0))
    place(cv, L('ball'), 214, 596)
    place(cv, L('cap_wide'), 92, 548)
    return cv.convert('RGB')


def contact(atlas, plate_im):
    font = ImageFont.load_default()
    names = [n for n in atlas if n not in ('plate', 'bars')]
    cellw, cellh, cols = 170, 112, 7
    rows = (len(names) + cols - 1) // cols
    W = 380 + cols * cellw + 20; H = max(850, rows * cellh + 40)
    sheet = Image.new('RGBA', (W, H), (24, 22, 30, 255)); d = ImageDraw.Draw(sheet)
    th = plate_im.resize((360, 820), Image.LANCZOS).convert('RGBA')
    bars = Image.open(os.path.join(OUT, 'bars.png')).resize((360, 820), Image.LANCZOS)
    th.alpha_composite(bars); sheet.alpha_composite(th, (10, 20)); d.text((10, 4), 'plate.png + bars.png (50%)', fill=(220, 220, 230, 255), font=font)
    for i, n in enumerate(names):
        cx = 380 + (i % cols) * cellw; cy = 20 + (i // cols) * cellh
        for yy in range(cy, cy + cellh - 18, 8):   # checker so alpha is visible
            for xx in range(cx, cx + cellw - 10, 8):
                if ((xx - cx) // 8 + (yy - cy) // 8) % 2: d.rectangle([xx, yy, xx + 7, yy + 7], fill=(44, 40, 54, 255))
                else: d.rectangle([xx, yy, xx + 7, yy + 7], fill=(36, 33, 45, 255))
        im = Image.open(os.path.join(OUT, atlas[n]['file'])).convert('RGBA')
        if im.size[0] > cellw - 14: im = im.resize((cellw - 14, round(im.size[1] * (cellw - 14) / im.size[0])), Image.LANCZOS)
        sheet.alpha_composite(im, (cx + (cellw - 10 - im.size[0]) // 2, cy + (cellh - 18 - im.size[1]) // 2))
        d.text((cx, cy + cellh - 16), f"{n} {atlas[n]['px'][0]}x{atlas[n]['px'][1]}", fill=(210, 210, 220, 255), font=font)
    sheet.convert('RGB').save(os.path.join(OUT, 'contact.png'), optimize=True)


def main():
    manifest = json.load(open(os.path.join(RAW, 'manifest.json')))
    pl = plate()
    bars = bar_shadow(Image.open(os.path.join(RAW, 'bars.png')).convert('RGBA'))
    assert bars.size == pl.size
    save_png(bars, 'bars.png')
    sp = sprites(manifest)
    atlas = {
        'version': 1,
        'units': 'game units (1 unit = 0.1 m in Blender); screen is 360 units wide',
        'board': dict(ox=OX, oy=OY, cols=20, rows=20, cell=CELL),
        'plate': dict(file='plate.png', jpg='plate.jpg', px=list(pl.size), ppu=PLATE_PPU, screenRect=[PLATE_X0, PLATE_Y0, PLATE_W, PLATE_H],
                      convention='pixel (px, py) <-> screen (x, y): px = 2*x, py = 2*(y + 40); draw plate at screen (0, -40) with size 360 x 820 units'),
        'bars': dict(file='bars.png', px=list(bars.size), ppu=PLATE_PPU, screenRect=[PLATE_X0, PLATE_Y0, PLATE_W, PLATE_H],
                     note='registered to the plate; draw over the fox with the same rect as the plate'),
        'spriteConvention': ('sprites are 3 px/unit; draw each centred on its anchor at the footprint centre, at size drawSize (units) = px / 3. '
                             'Bricks: drawSize = footprint + 2*margin, so a brick in cells (c..c+w-1, r) is drawn at '
                             'x = ox + c*16 - 4, y = oy + r*16 - 4, w = w*16 + 8, h = 24.'),
        'tintJitter': TINT_JITTER,
        'tintNote': 'multiply glazed brick RGB by 1 + tintJitter*(2*hash(c,r)-1) for per-brick variation (composite.png does this)',
        'anchors': {'chamber': [OX + 7 * CELL, OY + 3 * CELL, 6 * CELL, 3 * CELL]},
        'propsNote': 'v3 plate has no torches and no lantern; the lantern / torch_flame sprites are kept but unused',
        'sprites': sp,
    }
    json.dump(atlas, open(os.path.join(OUT, 'atlas.json'), 'w'), indent=1)
    composite(pl).save(os.path.join(OUT, 'composite.png'), optimize=True)
    contact(sp, pl)
    tot = 0
    for f in sorted(os.listdir(OUT)):
        s = os.path.getsize(os.path.join(OUT, f)); tot += s
    print('assets/vault total', round(tot / 1024), 'KB in', len(os.listdir(OUT)), 'files')


if __name__ == '__main__':
    main()
