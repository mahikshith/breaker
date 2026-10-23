"""Render round 2, R05 and R06 (prompt-library/70-render-round-2.md): the glaze power-up capsules, the armoured crate bricks
and the Tidewheel water splash, cut from the owner's transparent sheets in art/round2/source (copied from main's art/R05.png
and art/R06.png) into assets/round2/ with a manifest for tools/pack_art.py. R02 and R03 (the Hoard eye and props) are cut by
art/hoard/build.py.

The sheets are not on an exact grid, so each sprite is the union of the connected alpha components (scipy.ndimage) whose
centre falls in its source box, trimmed to its alpha bounds, resized to PX px per game unit and saved without metadata.
Manifest per sprite: path, px, drawSize (units), anchor (units) and `body`: the rect (units, inside the sprite) of the solid
art (alpha > 160), which the game fits to an object's existing rect so the drawn body is the collider:
- cap/<power>: the nine capsules (R05, read in row order). Every chapter draws them on its existing capsule rect.
- crate/0..2: the armoured crate intact, dented, breaking (R06 row 1), 2:1; crate_sq/0..2 the same crate as a square panel
  (both end caps kept, the middle dropped, like the one-cell glaze bricks) for Circuit's square armour panels.
  The banded heavy crate (cell 4) is not cut: no chapter has an indestructible crate brick.
- splash/0..3: four splash frames (R06 row 2), anchored on the middle of the water line (the bottom of the art).
Run: python3 art/round2/build.py
"""
import json, os
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'art', 'round2', 'source')
OUT = os.path.join(ROOT, 'assets', 'round2')
PX = 3
POWERS = ['split', 'fire', 'wide', 'focus', 'burst', 'laser', 'shield', 'slow', 'shrink']   # R05 cells, row by row (POWER keys in src/gfx.js)
CAP_W = 44           # capsule art width in units (the Vault's capsule rect is 40x18; the game fits the body to each chapter's rect)
CRATE_W = 40         # 2:1 crate width in units (Forge armour panels are about 33x17)
SPLASH_W = 40        # splash frame width in units

def label(sheet):
    lab, _ = ndimage.label(np.asarray(sheet)[:, :, 3] > 8); return lab, ndimage.find_objects(lab)

def cut(sheet, comp, box):
    lab, objs = comp; x0, y0, x1, y1 = box
    keep = [i + 1 for i, o in enumerate(objs) if x0 <= (o[1].start + o[1].stop) / 2 < x1 and y0 <= (o[0].start + o[0].stop) / 2 < y1 and (lab[o] == i + 1).sum() >= 40]
    assert keep, f'Empty source box {box}'
    mask = ndimage.binary_dilation(np.isin(lab, keep), iterations=2)   # keep each piece's soft edge
    px = np.asarray(sheet).copy(); px[:, :, 3] = np.where(mask, px[:, :, 3], 0)
    ys, xs = np.nonzero(px[:, :, 3] > 8)
    return Image.fromarray(px).crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))

def clean(im):
    out = Image.new('RGBA', im.size); out.paste(im); return out   # a fresh image carries no text, ICC or exif chunks

def square(im):
    """A 2:1 crate as a square panel: the left and right end caps (each half the height wide) joined, the middle dropped."""
    h = im.height; half = h // 2; sq = Image.new('RGBA', (2 * half, h))
    sq.paste(im.crop((0, 0, half, h)), (0, 0)); sq.paste(im.crop((im.width - half, 0, im.width, h)), (half, 0)); return sq

def save(sprites, key, im, width, anchor='centre'):
    im = clean(im.resize((round(width * PX), round(im.height * width * PX / im.width)), Image.LANCZOS))
    file = key.replace('/', '__') + '.png'; im.save(os.path.join(OUT, file), optimize=True)
    w, h = im.width / PX, im.height / PX
    ys, xs = np.nonzero(np.asarray(im)[:, :, 3] > 160)
    body = [round(xs.min() / PX, 3), round(ys.min() / PX, 3), round((xs.max() + 1 - xs.min()) / PX, 3), round((ys.max() + 1 - ys.min()) / PX, 3)]
    sprites[key] = {'path': f'assets/round2/{file}', 'px': list(im.size), 'drawSize': [round(w, 3), round(h, 3)],
                    'anchor': [round(w / 2, 3), round(h if anchor == 'base' else h / 2, 3)], 'body': body}

def main():
    os.makedirs(OUT, exist_ok=True); sprites = {}
    caps = Image.open(os.path.join(SRC, 'R05.png')).convert('RGBA'); comp = label(caps); cw, ch = caps.width / 3, caps.height / 3
    for i, kind in enumerate(POWERS):
        c, r = i % 3, i // 3
        save(sprites, f'cap/{kind}', cut(caps, comp, (c * cw, r * ch, (c + 1) * cw, (r + 1) * ch)), CAP_W)
    sheet = Image.open(os.path.join(SRC, 'R06.png')).convert('RGBA'); comp = label(sheet)
    for i, box in enumerate([(0, 100, 450, 430), (450, 100, 890, 430), (890, 100, 1320, 430)]):
        crate = cut(sheet, comp, box)
        if i == 2:   # breaking: two halves with a gap; scale it like the intact crate so the plates stay the same size
            full = cut(sheet, comp, (0, 100, 450, 430)); crate = crate.resize((round(crate.width * full.height / crate.height), full.height), Image.LANCZOS)
        save(sprites, f'crate/{i}', crate, CRATE_W * crate.width / (crate.height * 2) if i == 2 else CRATE_W)
        save(sprites, f'crate_sq/{i}', square(crate), CRATE_W / 2)
    for i in range(4):
        save(sprites, f'splash/{i}', cut(sheet, comp, (i * 443, 430, (i + 1) * 443, 887)), SPLASH_W, 'base')
    json.dump({'source': 'Owner renders R05 (capsules) and R06 (crates, splash) 2026-10-23; art/round2/build.py', 'px': PX, 'sprites': sprites},
              open(os.path.join(OUT, 'manifest.json'), 'w'), indent=1)
    print(len(sprites), 'sprites ->', OUT)

if __name__ == '__main__':
    main()
