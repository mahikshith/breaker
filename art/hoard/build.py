"""Dragon's Hoard kit (chapter 12): Ember's eight expression busts and the hoard props, cut from the M365 Copilot
dragon kit (2026-10-23, transparent renders) into assets/hoard/ with a manifest for tools/pack_art.py.

Each sprite is cropped to its alpha bounds, resized to 3 px per game unit at its drawn size and saved without metadata.
Manifest per sprite: path, px, drawSize (units), anchor (units, the model point the sprite is drawn on) and, where the
sprite is a collider, contact (the model rect inside the sprite). Ember's busts are scenery behind the cave ledge (no
collider in this chapter); their measured head and chest circles are recorded with solid: false for a later duel beat.

Run: python3 art/hoard/build.py [kit dir]   (default: the shared drop folder below)
"""
import json, os, sys
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
KIT = sys.argv[1] if len(sys.argv) > 1 else '/mnt/project-files/breaker/copilot/drops-2026-10-23/m365-dragon-kit'
OUT = os.path.join(ROOT, 'assets', 'hoard')
PX = 3
EXPRESSIONS = ['idle', 'taunt', 'windup', 'attack', 'hurt', 'stagger', 'panic', 'defeat']
BUST_H = 140          # every bust is scaled by one factor so the head stays the same size between expressions
# key: (source, drawn width in units, collider). A collider prop is fitted to its exact model rect (the Crown chest spans 3 columns
# by 3 rows: 100x52), so the drawn chest and its collider are the same rectangle in both damage states.
CHEST = (100, 52)
PROPS = {'crown_chest': ('sprites/props/chest-brick.png', 100, True), 'crown_chest_cracked': ('sprites/props/chest-brick-cracked.png', 100, True),
         'coin': ('sprites/props/coin-single.png', 12, False), 'coin_chips_a': ('sprites/props/coin-chips-a.png', 30, False),
         'coin_chips_b': ('sprites/props/coin-chips-b.png', 28, False)}

def crop(path):
    im = Image.open(os.path.join(KIT, path)).convert('RGBA')
    a = np.asarray(im)[:, :, 3]; ys, xs = np.nonzero(a > 8)
    return im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))

def clean(im):
    out = Image.new('RGBA', im.size); out.paste(im); return out   # a fresh image carries no text, ICC or exif chunks

def circles(im, k):
    """Largest inscribed circle in the top 55% (head) and the bottom 45% (chest) of the alpha mask, in units from the anchor."""
    small = im.resize((max(8, im.width // 6), max(8, im.height // 6)), Image.BILINEAR)
    m = np.asarray(small)[:, :, 3] > 128; h, w = m.shape; ys, xs = np.nonzero(m); oy, ox = np.nonzero(~m)
    edge = np.concatenate([np.stack([oy, ox], 1), [[y, -1] for y in range(h)], [[y, w] for y in range(h)], [[-1, x] for x in range(w)], [[h, x] for x in range(w)]])
    out = []
    for lo, hi in ((0, .55), (.55, 1)):
        sel = (ys >= lo * h) & (ys < hi * h); py, px = ys[sel], xs[sel]
        d = np.sqrt(((py[:, None] - edge[None, :, 0]) ** 2 + (px[:, None] - edge[None, :, 1]) ** 2).min(1)); i = int(d.argmax())
        s = im.width / w / PX * k
        out.append([round((px[i] + .5) * s - im.width / PX * k / 2, 1), round((py[i] + .5) * s - im.height / PX * k, 1), round(d[i] * s, 1)])
    return out

def main():
    os.makedirs(OUT, exist_ok=True)
    sprites = {}
    busts = {e: crop(f'sprites/ember/expr-{e}.png') for e in EXPRESSIONS}
    scale = BUST_H * PX / max(b.height for b in busts.values())
    for e, im in busts.items():
        im = clean(im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)); key = f'ember_{e}'
        im.save(os.path.join(OUT, key + '.png'), optimize=True)
        w, h = im.width / PX, im.height / PX
        # Anchored at the middle of the bust's base: the cave ledge and coin pile hide the cut, and swaps stay aligned.
        sprites[key] = {'path': f'assets/hoard/{key}.png', 'px': [im.width, im.height], 'drawSize': [round(w, 3), round(h, 3)],
                        'anchor': [round(w / 2, 3), round(h, 3)], 'circles': circles(im, 1), 'solid': False}
    for key, (src, width, solid) in PROPS.items():
        im = crop(src); px = round(width * PX)
        size = (CHEST[0] * PX, CHEST[1] * PX) if solid else (px, round(im.height * px / im.width))
        im = clean(im.resize(size, Image.LANCZOS))
        im.save(os.path.join(OUT, key + '.png'), optimize=True)
        w, h = im.width / PX, im.height / PX
        spec = {'path': f'assets/hoard/{key}.png', 'px': [im.width, im.height], 'drawSize': [round(w, 3), round(h, 3)], 'anchor': [round(w / 2, 3), round(h / 2, 3)]}
        if solid: spec['contact'] = [0, 0, round(w, 3), round(h, 3)]   # cropped to the art: the collider is the whole drawn rect
        sprites[key] = spec
    json.dump({'source': 'M365 Copilot dragon kit 2026-10-23 (sprites/ember, sprites/props), art/hoard/build.py', 'px': PX, 'sprites': sprites},
              open(os.path.join(OUT, 'manifest.json'), 'w'), indent=1)
    print(len(sprites), 'sprites ->', OUT)

if __name__ == '__main__':
    main()
