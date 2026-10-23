"""Sprite sheet of each themed set beside the matching glaze-v2 bricks, for review (not shipped).
Run: python3 art/themed-bricks/preview.py <out dir> [chapter ...]   (writes <chapter>-sheet.jpg)"""
import json, os, sys
from PIL import Image, ImageDraw
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
K, BG = 3, (24, 22, 34)
def row(ims, label):
    h = max(i.height for i in ims) * K; w = sum(i.width * K + 12 for i in ims) + 150
    r = Image.new('RGB', (w, h + 8), BG); d = ImageDraw.Draw(r); d.text((8, h // 2 - 6), label, fill=(210, 205, 225)); x = 150
    for i in ims: r.paste(i.resize((i.width * K, i.height * K), Image.LANCZOS), (x, 4), i.resize((i.width * K, i.height * K), Image.LANCZOS)); x += i.width * K + 12
    return r
glaze = lambda k: Image.open(os.path.join(ROOT, 'assets', 'glaze2', k + '.png')).convert('RGBA')
for ch in sys.argv[2:] or sorted(os.listdir(os.path.join(ROOT, 'assets', 'themed-bricks'))):
    d = os.path.join(ROOT, 'assets', 'themed-bricks', ch); atlas = json.load(open(os.path.join(d, 'atlas.json')))
    rows = [row([glaze(f'brick_t_2_{s}') for s in (0, 1, 2)] + [glaze('brick_granite_2_0'), glaze('brick_granite_1_0')], 'glaze v2')]
    mats = {}
    for k, s in atlas['sprites'].items(): mats.setdefault(s['material'], []).append(k)
    for m, keys in mats.items():
        rows.append(row([Image.open(os.path.join(d, atlas['sprites'][k]['file'])).convert('RGBA') for k in sorted(keys, key=lambda k: (-atlas['sprites'][k]['cells'], atlas['sprites'][k]['state']))], f'{ch}: {m}'))
    W = max(r.width for r in rows); H = sum(r.height for r in rows)
    sheet = Image.new('RGB', (W, H), BG); y = 0
    for r in rows: sheet.paste(r, (0, y)); y += r.height
    sheet.save(os.path.join(OUT, f'{ch}-sheet.jpg'), quality=86); print(ch, sheet.size)
