"""Dragon's Hoard kit (chapter 12): Ember's eight expression busts and the hoard props, cut from the M365 Copilot
dragon kit (2026-10-23, transparent renders) into assets/hoard/ with a manifest for tools/pack_art.py.

Each sprite is cropped to its alpha bounds, resized to 3 px per game unit at its drawn size and saved without metadata.
Manifest per sprite: path, px, drawSize (units), anchor (units, the model point the sprite is drawn on) and, where the
sprite is a collider, contact (the model rect inside the sprite). Ember's busts are scenery behind the cave ledge (no
collider in this chapter); their measured head and chest circles are recorded with solid: false for a later duel beat.

The cave backdrop (M365, 2026-10-23, option A "pillars": rock pillars down both sides, the raised dais with the chest at the
top) is extended (below) to 1024xCAVE_H as RGB and drawn 360 units wide from the top of the playfield; `floor` is the mean
colour of its bottom band, which the renderer extends down a taller phone instead of stretching the plate.

Round 2 (prompt-library/70-render-round-2.md). R01, Ember's six full-body poses, arrived already cut (trimmed, transparent)
as R01/ember-<pose>.png: every pose is scaled by ONE factor (the tallest, windup, is POSE_H units) so his head stays the same
size between poses, anchored on the middle of his body's footprint, and fitted with greedy body circles. R02 (Ember's eye in
five stages) and R03 (Hoard props) are transparent sheets in art/round2/source (copied from main's art/R02.png, R03.png).
They are not on a grid, so each sprite is the union of the sheet's connected alpha components whose centre falls in its
source box below (scipy.ndimage), trimmed to its alpha bounds. The manifest's `skins.ember` lists, per pose, the preferred
key first and the current bust as the fallback, so the game uses a new render as soon as it is packed.

The cave plate fades to flat navy below the dais; extend_cave() continues it to CAVE_H px: the flagstone band and the rock
pillars at both sides repeat down with soft crossfades under a darkening ramp, so the whole playfield reads as the cave.

Run: python3 art/hoard/build.py [kit dir] [cave png] [round2 dir] [R01 pose dir]   (defaults: the shared drop folders below)
"""
import json, os, sys
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
KIT = sys.argv[1] if len(sys.argv) > 1 else '/mnt/project-files/breaker/copilot/drops-2026-10-23/m365-dragon-kit'
CAVE = sys.argv[2] if len(sys.argv) > 2 else '/mnt/project-files/breaker/review-2026-10-23/hoard-cave/cave-a-pillars.png'
ROUND2 = sys.argv[3] if len(sys.argv) > 3 else os.path.join(ROOT, 'art', 'round2', 'source')
R01 = sys.argv[4] if len(sys.argv) > 4 else '/mnt/project-files/breaker/review-2026-10-23/hoard-art/R01-ember-poses'
POSE_H = 126          # drawn height of the tallest pose (windup: horns just under the lives row); the others keep their size relative to it
CAVE_H = 2400         # extended cave plate height in px (360 x 843 units: taller than any phone's playfield)
# Round-2 sheets: (file, [(key, source box x0 y0 x1 y1 in sheet px, fit, size, anchor)]). fit 'h': drawn height in units;
# 'w': drawn width; 'box': exactly (w, h) units (a collider-sized prop); 'k': `size` sheet px per unit (one scale for a set).
# anchor 'centre' = middle, 'top' = top centre, 'main' = middle of the largest component (the chime's stand, not its petals).
# The Sunstone (R03 cells 6-7) is not cut: the Crown chest was chosen as the hoard's goal.
GATE_K = 419 / 140    # the intact gate is fitted to the gate span (140x62, its collider); the dented and broken gates share its scale
R2 = [('R02.png', [(f'eye/{i}', (i * 2508 // 5, 0, (i + 1) * 2508 // 5, 627), 'h', 48, 'centre') for i in range(5)]),
      ('R03.png', [('prop/molten_0', (40, 60, 400, 290), 'box', (32, 16), 'centre'), ('prop/molten_1', (400, 60, 750, 290), 'box', (32, 16), 'centre'),
                   ('prop/molten_2', (750, 60, 1110, 290), 'box', (32, 16), 'centre'),
                   ('prop/chime', (1110, 0, 1448, 300), 'h', 20, 'centre'), ('prop/chime_ring', (60, 280, 470, 560), 'h', 20, 'main'),
                   ('prop/gate_0', (30, 545, 480, 800), 'box', (140, 62), 'top'), ('prop/gate_1', (500, 545, 945, 800), 'k', GATE_K, 'top'),
                   ('prop/gate_2', (950, 545, 1420, 800), 'k', GATE_K, 'top'),
                   ('prop/burst_coin', (180, 760, 680, 1086), 'w', 44, 'centre'), ('prop/burst_gem', (800, 760, 1220, 1086), 'w', 40, 'centre')])]
# Ember as a "big sitter" skin (src/fantasy/creatures/sitter.js): each pose's art keys, preferred first, current bust last.
# R01 has six poses; the three moods it has no pose for borrow the nearest one (a broken treasure gets his glare, a chime's
# lullaby his dizzy spirals, the greed card his puffed-up wind-up) so the full-body art never crossfades into a bust.
POSES = {'sleep': ['ember/sleep', 'ember_idle'], 'stir': ['ember/stir', 'ember_taunt'], 'windup': ['ember/windup', 'ember_windup'],
         'breath': ['ember/breath', 'ember_attack'], 'sweep': ['ember/sweep', 'ember_attack'], 'hurt': ['ember/stir', 'ember_hurt'],
         'dizzy': ['ember/defeat', 'ember_stagger'], 'panic': ['ember/windup', 'ember_panic'], 'defeat': ['ember/defeat', 'ember_defeat']}
R01_POSES = ['sleep', 'stir', 'windup', 'breath', 'sweep', 'defeat']
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

def body_circles(im, ax, ay, most=5, cover=.8, flame=False):
    """Greedy circles inside the drawn body: each is the largest circle that fits in the alpha mask, centred on a pixel no
    earlier circle covers, until `cover` of the body is covered or `most` circles. Units from the anchor (ax, ay in px)."""
    from scipy import ndimage
    d = 4; px = np.asarray(im); m = px[:, :, 3][::d, ::d] > 128
    if flame:   # the breath's fire puff (bright orange, right of the jaw) is drawn effect, not body
        f = (px[:, :, 0] > 200) & (px[:, :, 2] < 140) & (px[:, :, 1] > 90) & (px[:, :, 3] > 128); lab, n = ndimage.label(f)
        reach = ndimage.maximum(np.indices(f.shape)[1], lab, range(1, n + 1))   # keep only the blob that reaches the right edge
        m &= ~np.isin(lab, [i + 1 for i, x in enumerate(reach) if x > im.width * .9])[::d, ::d]
    dist = ndimage.distance_transform_edt(np.pad(m, 1))[1:-1, 1:-1]   # pad: the sprite edge is outside the body
    yy, xx = np.mgrid[:m.shape[0], :m.shape[1]]; left = m.copy(); out = []; total = m.sum()
    while len(out) < most and left.sum() > (1 - cover) * total:
        cand = np.where(left, dist, 0); i = np.unravel_index(cand.argmax(), cand.shape); r = dist[i]
        if r * d / PX < 6: break                                          # thinner than a ball: a tail tip or a claw
        left &= (yy - i[0]) ** 2 + (xx - i[1]) ** 2 > r * r
        out.append([round(((i[1] + .5) * d - ax) / PX, 1), round(((i[0] + .5) * d - ay) / PX, 1), round(r * d / PX, 1)])
    return out

def poses(sprites):
    """R01: Ember's full-body poses, cut by the art team. One scale for all; anchored at the centre of the body's footprint."""
    src = {k: Image.open(os.path.join(R01, f'ember-{k}.png')).convert('RGBA') for k in R01_POSES if os.path.exists(os.path.join(R01, f'ember-{k}.png'))}
    if not src: return
    scale = POSE_H * PX / max(im.height for im in src.values())
    for k, im in src.items():
        al = np.asarray(im)[:, :, 3]; ys, xs = np.nonzero(al > 8); im = im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
        im = clean(im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)); key = f'ember/{k}'; file = f'ember__{k}.png'
        im.save(os.path.join(OUT, file), optimize=True)
        # Footprint: the opaque columns of the bottom quarter (feet, tail, coins), not the flame or a wing tip.
        a = np.asarray(im)[:, :, 3] > 128; base = a[int(im.height * .75):]; cols = np.nonzero(base.any(0))[0]
        ax = (cols.min() + cols.max() + 1) / 2 if len(cols) else im.width / 2
        w, h = im.width / PX, im.height / PX
        sprites[key] = {'path': f'assets/hoard/{file}', 'px': list(im.size), 'drawSize': [round(w, 3), round(h, 3)], 'anchor': [round(ax / PX, 3), round(h, 3)],
                        'circles': body_circles(im, ax, im.height, flame=k == 'breath'), 'solid': False}

def cut(sheet, comp, box):
    """The union of the sheet's connected alpha components whose centre lies in `box` (specks under 40 px dropped), trimmed
    to its alpha bounds. Returns the sprite and the sprite-relative bbox of its largest component."""
    from scipy import ndimage
    lab, objs = comp; x0, y0, x1, y1 = box; keep = []
    for i, o in enumerate(objs):
        cy, cx = (o[0].start + o[0].stop) / 2, (o[1].start + o[1].stop) / 2
        if x0 <= cx < x1 and y0 <= cy < y1 and (lab[o] == i + 1).sum() >= 40: keep.append(i + 1)
    assert keep, f'Empty source box {box}'
    mask = ndimage.binary_dilation(np.isin(lab, keep), iterations=2)   # keep each piece's soft edge
    px = np.asarray(sheet).copy(); px[:, :, 3] = np.where(mask, px[:, :, 3], 0)
    ys, xs = np.nonzero(px[:, :, 3] > 8); bx, by = xs.min(), ys.min()
    main = objs[max(keep, key=lambda i: (lab[objs[i - 1]] == i).sum()) - 1]
    return Image.fromarray(px).crop((bx, by, xs.max() + 1, ys.max() + 1)), (main[1].start - bx, main[0].start - by, main[1].stop - bx, main[0].stop - by)

def round2(sprites):
    from scipy import ndimage
    for name, cells in R2:
        path = os.path.join(ROUND2, name)
        if not os.path.exists(path): continue
        sheet = Image.open(path).convert('RGBA'); lab, _ = ndimage.label(np.asarray(sheet)[:, :, 3] > 8); comp = (lab, ndimage.find_objects(lab))
        for key, box, fit, size, anchor in cells:
            cell, main = cut(sheet, comp, box)
            if fit == 'box': px = (size[0] * PX, size[1] * PX)
            elif fit == 'h': px = (round(cell.width * size * PX / cell.height), size * PX)
            elif fit == 'k': px = (round(cell.width * PX / size), round(cell.height * PX / size))
            else: px = (size * PX, round(cell.height * size * PX / cell.width))
            im = clean(cell.resize(px, Image.LANCZOS)); file = key.replace('/', '__') + '.png'
            im.save(os.path.join(OUT, file), optimize=True)
            w, h = im.width / PX, im.height / PX; ax = (main[0] + main[2]) / 2 * w / cell.width if anchor == 'main' else w / 2
            spec = {'path': f'assets/hoard/{file}', 'px': list(im.size), 'drawSize': [round(w, 3), round(h, 3)], 'anchor': [round(ax, 3), 0 if anchor == 'top' else round(h / 2, 3)]}
            if fit == 'box': spec['contact'] = [0, 0, size[0], size[1]]
            sprites[key] = spec

def extend_cave(cave):
    """Continue the plate below its dais to CAVE_H: the flagstone band and the side pillars repeat down with crossfaded seams
    (the right pillar out of step with the left) under a darkening ramp, blended into the original over 160 rows."""
    src = np.asarray(cave).astype(np.float32); H0, W = src.shape[:2]; top = 680; n = CAVE_H - top
    def tile(strip, overlap, phase=0):
        h = strip.shape[0]; out = np.zeros((n, strip.shape[1], 3), np.float32); ws = np.zeros((n, 1, 1), np.float32); y = -phase
        while y < n:
            a, b = max(0, y), min(n, y + h)
            if b > a:
                r = np.arange(a, b) - y; wt = np.minimum(1, np.minimum((r + 1) / overlap, (h - r) / overlap))[:, None, None]
                out[a:b] += strip[r] * wt; ws[a:b] += wt
            y += h - overlap
        return out / np.maximum(ws, 1e-3)
    low = tile(src[470:770], 90); L = tile(src[300:900, :300], 140); R = tile(src[300:900, W - 300:], 140, 230)
    m = np.clip((230 - np.arange(300, dtype=np.float32)) / 130, 0, 1)[None, :, None]
    low[:, :300] = L * m + low[:, :300] * (1 - m); low[:, W - 300:] = R * m[:, ::-1] + low[:, W - 300:] * (1 - m[:, ::-1])
    yy = np.arange(top, CAVE_H, dtype=np.float32); low *= (.95 - .4 * np.clip((yy - top) / n, 0, 1))[:, None, None]
    t = np.clip((yy - top) / 160, 0, 1)[:, None, None]; base = np.zeros_like(low); base[:H0 - top] = src[top:]
    out = np.zeros((CAVE_H, W, 3), np.float32); out[:top] = src[:top]; out[top:] = base * (1 - t) + low * t
    return Image.fromarray(np.clip(out + .5, 0, 255).astype(np.uint8))

def skin(sprites):
    """Ember's sitter skin: per pose its art keys (round-2 render first, current bust last) and the circles of the first one built."""
    poses = {}
    for pose, keys in POSES.items():
        have = [k for k in keys if k in sprites]   # the renderer draws the first key that is packed; circles come from it
        poses[pose] = {'art': keys, 'circles': sprites[have[0]]['circles']}
    return {'archetype': 'sitter', 'solid': False, 'poses': poses, 'eye': [f'eye/{i}' for i in range(5)],
            'props': {k: v for k, v in {'molten': ['prop/molten_0', 'prop/molten_1', 'prop/molten_2'], 'chime': ['prop/chime', 'prop/chime_ring'],
                      'gate': ['prop/gate_0', 'prop/gate_1', 'prop/gate_2'], 'burst': ['prop/burst_coin', 'prop/burst_gem']}.items()}}

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
    out = extend_cave(Image.open(CAVE).convert('RGB')); out.save(os.path.join(OUT, 'cave.png'), optimize=True)
    band = np.asarray(out)[-24:].reshape(-1, 3).mean(0)
    sprites['cave'] = {'path': 'assets/hoard/cave.png', 'px': list(out.size), 'drawSize': [360, round(360 * out.height / out.width, 3)], 'anchor': [0, 0],
                       'floor': '#%02x%02x%02x' % tuple(int(round(v)) for v in band)}
    poses(sprites); round2(sprites)
    json.dump({'source': 'M365 Copilot dragon kit 2026-10-23 (sprites/ember, sprites/props); R01 Ember poses, R02 eye and R03 props 2026-10-23; art/hoard/build.py', 'px': PX, 'sprites': sprites, 'skins': {'ember': skin(sprites)}},
              open(os.path.join(OUT, 'manifest.json'), 'w'), indent=1)
    print(len(sprites), 'sprites ->', OUT)

if __name__ == '__main__':
    main()
