"""Glaze v2 bricks: cut the M365 Copilot brick sheet (design/copilot/2026-10-23) into drop-in
replacements for the Vault brick sprites (same keys, size, ppu and margin as assets/vault/brick_*).

Keys: brick_<y|c|v|t|b>_<1|2>_<dmg 0 intact, 1 cracked, 2 breaking>, brick_<L>_<n>_x (the glass-framed
two-hit look), brick_gold_<1|2>_<0|1|2>, brick_granite_<1|2>_0, plus coin and chest bricks for the Hoard.
Run: python3 art/glaze2/build.py
"""
import json, os
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'art', 'glaze2', 'source')
OUT = os.path.join(ROOT, 'assets', 'glaze2')
PPU, MARGIN, CELL = 3, 4, 16           # same as assets/vault/atlas.json
HUES = {'y': 'sun', 'c': 'coral', 'v': 'violet', 't': 'teal', 'b': 'blue'}
STATE = {0: 'intact', 1: 'cracked', 2: 'breaking', 'x': '2hp'}

sheet = Image.open(os.path.join(SRC, 'bricks.png')).convert('RGBA')
frames = {k[:-4]: v['frame'] for k, v in json.load(open(os.path.join(SRC, 'bricks.json')))['frames'].items()}
def frame(name):
    f = frames[name]; return sheet.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))

def fit(im, cells, centre=False):
    """Scale a 32x16-unit frame to the footprint; a one-cell brick keeps both end caps and drops the middle
    (centre=True lays the middle emblem, the gold gem, back over the join)."""
    h = CELL * PPU; im = im.resize((2 * CELL * PPU, h), Image.LANCZOS)
    if cells == 2: return im
    half = CELL * PPU // 2; sq = Image.new('RGBA', (CELL * PPU, h))
    sq.paste(im.crop((0, 0, half, h)), (0, 0)); sq.paste(im.crop((im.width - half, 0, im.width, h)), (half, 0))
    if centre: g = h * 5 // 8; c = (im.width - g) // 2; sq.alpha_composite(im.crop((c, (h - g) // 2, c + g, (h + g) // 2)), ((h - g) // 2, (h - g) // 2))
    return sq

def seat(face):
    """Put the brick on the margin canvas with the soft lower-right contact shadow the Vault sprites use."""
    m = MARGIN * PPU; cv = Image.new('RGBA', (face.width + 2 * m, face.height + 2 * m))
    a = face.getchannel('A').point(lambda v: v * 150 // 255)
    sh = Image.new('RGBA', cv.size); sh.paste(Image.new('RGBA', face.size, (8, 6, 20, 255)), (m + 2, m + 5), a)
    cv = Image.alpha_composite(cv, sh.filter(ImageFilter.GaussianBlur(3.2)))
    cv.alpha_composite(face, (m, m)); return cv

os.makedirs(OUT, exist_ok=True); sprites = {}
def save(key, im, cells, kind):
    seat(fit(im, cells, kind == 'gold')).save(os.path.join(OUT, key + '.png'))
    w = cells * CELL; sprites[key] = {'file': key + '.png', 'px': [(w + 2 * MARGIN) * PPU, (CELL + 2 * MARGIN) * PPU], 'ppu': PPU,
                                      'footprint': [w, CELL], 'drawSize': [w + 2 * MARGIN, CELL + 2 * MARGIN], 'margin': MARGIN, 'kind': kind}
for L, hue in HUES.items():
    for n in (1, 2):
        for d, st in STATE.items(): save(f'brick_{L}_{n}_{d}', frame(f'{hue}-{st}'), n, 'brick')
for n in (1, 2):
    for d, st in ((0, 'intact'), (1, 'cracked'), (2, 'breaking')): save(f'brick_gold_{n}_{d}', frame(f'gold-gem-{st}'), n, 'gold')
    save(f'brick_granite_{n}_0', frame('granite'), n, 'granite')
for key, name in (('brick_coin_2_0', 'coin-brick'), ('brick_chest_2_0', 'chest-brick'), ('brick_chest_2_1', 'chest-brick-cracked')):
    save(key, frame(name), 2, 'hoard')
json.dump({'source': 'art/glaze2/build.py (M365 Copilot glaze v2 sheet, 2026-10-23)', 'sprites': sprites},
          open(os.path.join(OUT, 'atlas.json'), 'w'), indent=1)
print(len(sprites), 'sprites ->', OUT)
