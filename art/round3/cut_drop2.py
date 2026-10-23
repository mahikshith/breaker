"""Cut the second round-3 M365 drop (main commit e92a987, assets/Designer (5-8).png, notes in
assets/round3-copilot-responses.md) into named sprites under assets/round3/<set>/ with a manifest.json per set.

The sheets are on flat green (#0cf401) or black, not on a grid. Green is keyed out with a soft edge and the green
spill is pulled from the edges; black (effects) becomes alpha from brightness, so the sprites draw normally.
Character, brick and effect sheets are cut on their rows and columns; scene parts are found as blobs. The crab
(Designer 5) and the second Warden sheet are cut as nerra2 / warden2: extra moves and alternates next to the first
sheets (assets/round3/nerra, warden), which stay the main look.
Run: python3 art/round3/cut_drop2.py <dir holding d5.png d6.png d7.png d8.png>   (add --sheet=<dir> for labelled contact sheets)
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def key_green(rgb):
    a = rgb.astype(float); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    over = g - np.maximum(r, b)                       # how green a pixel is
    alpha = np.clip(1 - (over - 40) / 120, 0, 1)      # <=40 opaque, >=160 gone
    al = np.maximum(alpha, .05)[..., None]            # un-mix the green from soft edges and glows
    a = np.clip((a - (1 - al) * np.array([12., 244., 1.])) / al, 0, 255); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    g2 = np.minimum(g, np.maximum(r, b) + 12)         # despill what is left
    light = (a.min(2) > 150) & (g >= b)               # the pale divider lines M365 draws between rows
    for y in np.where(light.mean(1) > .4)[0]: alpha[max(0, y - 2):y + 3][light[max(0, y - 2):y + 3]] = 0
    out = np.dstack([r, np.where(alpha < 1, g2, g), b, alpha * 255])
    return np.clip(out, 0, 255).astype(np.uint8)

def key_black(rgb):
    a = rgb.astype(float); m = a.max(2)
    alpha = np.clip((m - 14) / 200, 0, 1)
    col = np.where(alpha[..., None] > 0, a / np.maximum(m, 1)[..., None] * 255, 0)
    return np.dstack([col, alpha * 255]).clip(0, 255).astype(np.uint8)

def blobs(rgba, grow, min_area):
    m = rgba[..., 3] > 90
    lab, n = nd.label(nd.binary_dilation(m, iterations=grow))
    out = []
    for i, sl in enumerate(nd.find_objects(lab)):
        own = (lab[sl] == i + 1) & m[sl]
        if own.sum() < min_area: continue
        ys, xs = np.where(own)
        y0, x0 = sl[0].start, sl[1].start
        out.append((y0 + ys.min(), x0 + xs.min(), y0 + ys.max() + 1, x0 + xs.max() + 1, sl, lab, i + 1))
    return out

def rows_of(bs, gap):
    bs = sorted(bs, key=lambda b: (b[0] + b[2]) / 2); rows = []
    for b in bs:
        cy = (b[0] + b[2]) / 2
        if rows and cy - rows[-1][-1][0] < gap: rows[-1].append((cy, b))
        else: rows.append([(cy, b)])
    return [[b for _, b in sorted(r, key=lambda t: t[1][1])] for r in rows]

def sprite(rgba, b, pad=2):
    y0, x0, y1, x1, sl, lab, i = b
    H, W = rgba.shape[:2]
    y0, x0, y1, x1 = max(0, y0 - pad), max(0, x0 - pad), min(H, y1 + pad), min(W, x1 + pad)
    sub = rgba[y0:y1, x0:x1].copy()
    mine = np.zeros(rgba.shape[:2], bool); mine[sl] = lab[sl] == i
    sub[..., 3] = np.where(mine[y0:y1, x0:x1], sub[..., 3], 0)
    return Image.fromarray(sub)

def grid(rgba, counts):
    """Effects rows: frames sit on an even grid across each row band."""
    m = rgba[..., 3] > 40; prof = nd.uniform_filter1d(m.sum(1).astype(float), 9)
    H = len(prof); n = len(counts); cuts = [0]
    for k in range(1, n):
        c = int(H * k / n); w = int(H / n * .3)
        cuts.append(c - w + int(np.argmin(prof[c - w:c + w])))
    cuts.append(H); out = []
    for r, k in enumerate(counts):
        band = rgba[cuts[r]:cuts[r + 1]]; W = band.shape[1]
        for c in range(k):
            out.append(main_part(band[:, W * c // k:W * (c + 1) // k], grow=18, solid=30))
    return out

# (set, source, crop box x0,y0,x1,y1, names per row). Rows and frames are cut at the emptiest lines between them,
# using the counts M365 reported (frames sit too close for blobs: walk cycles touch, dash streaks join frames).
R = lambda p, n: [f'{p}_{i}' for i in range(n)]
BRICK_ROW = ['chest', 'chest_cracked', 'coin', 'mine', 'key', 'armour', 'armour_cracked', 'steel']
JOBS = [
    ('nerra2', 'd5.png', (0, 0, 1536, 424), [R('walk_r', 9), R('walk_l', 9),
     ['turn_r_0', 'turn_r_1', 'turn_front', 'turn_l_0', 'turn_l_1', 'turn_l_2'],
     ['jump_crouch', 'jump_takeoff', 'jump_air', 'jump_land', 'jump_settle']]),
    ('nerra2', 'd5.png', (0, 430, 1536, 750), [['gaze_ul', 'gaze_u', 'gaze_ur', 'gaze_l', 'gaze_c', 'gaze_r', 'gaze_dl',
     'gaze_d', 'gaze_dr'], ['smug', 'furious', 'roar', 'hurt', 'dizzy'], R('idle', 4)]),
    ('nerra2', 'd5.png', (0, 758, 1536, 1024), [['snap_l_windup', 'snap_l_strike', 'gate_windup', 'gate_strike',
     'chain_yank_0', 'chain_yank_1'], ['flinch', 'dazed', 'knocked', 'defeated']]),
    ('warden2', 'd6.png', (0, 36, 766, 572), [R('idle', 4), ['pound_windup', 'pound_strike', 'pound_settle',
     'pound_recover'], ['flinch', 'dazed', 'recover', 'defeated']]),
    ('warden2', 'd6.png', (0, 612, 766, 1024), [['dash_r_crouch'] + R('dash_r', 5), ['dash_l_crouch'] + R('dash_l', 5),
     ['smash_l', 'dazed_l', 'smash_r', 'dazed_r']]),
    ('korr', 'd6.png', (772, 36, 1536, 572), [R('walk_r', 6), R('walk_l', 6), R('flee', 4),
     ['turn_side', 'turn_three_quarter', 'turn_front']]),
    ('korr', 'd6.png', (772, 612, 1536, 1024), [R('haul', 4), R('crank', 4),
     ['bell_windup', 'bell_throw', 'stomp_windup', 'stomp_impact']]),
    ('bricks', 'd8.png', (0, 0, 1536, 444), [[f'{t}_{n}' for n in BRICK_ROW] for t in ('sea', 'frost', 'castle')]),
]

def cuts(profile, k):
    """k even slots: each cut is the emptiest line within a third of a slot of where an even grid would put it."""
    s = nd.uniform_filter1d(profile, 9); L = len(s); w = max(1, L // k // 3); out = [0]
    for j in range(1, k):
        c = L * j // k; out.append(c - w + int(np.argmin(s[c - w:c + w])))
    return out + [L]

def main_part(sub, grow=8, solid=60):
    """Keep the cell's main sprite and whatever touches it (stars, chain, dust); drop strays from neighbours."""
    m = sub[..., 3] > solid; sub = sub.copy()
    pl, k = nd.label(m)                                  # bits of the pale divider lines: thin and flat
    for i, sl in enumerate(nd.find_objects(pl)):
        h, w = sl[0].stop - sl[0].start, sl[1].stop - sl[1].start
        if h <= 6 and w >= 3 * h: sub[sl][pl[sl] == i + 1, 3] = 0; m[sl][pl[sl] == i + 1] = False
    lab, n = nd.label(nd.binary_dilation(m, iterations=grow))
    if n > 1:
        sizes = nd.sum(m, lab, range(1, n + 1)); keep = lab == 1 + int(np.argmax(sizes))
        sub[..., 3] = np.where(keep, sub[..., 3], 0)
    ys, xs = np.where(sub[..., 3] > 20)
    return Image.fromarray(sub).crop((max(0, xs.min() - 2), max(0, ys.min() - 2), xs.max() + 3, ys.max() + 3))

def grid_rows(rgba, rows):
    m = rgba[..., 3] > 100; H = m.shape[0]; out = []
    rb = cuts(m.sum(1).astype(float), len(rows))
    for r, names in enumerate(rows):
        band = m[rb[r]:rb[r + 1]]; xs = np.where(band.any(0))[0]; bx0, bx1 = xs.min(), xs.max() + 1
        cb = cuts(band[:, bx0:bx1].sum(0).astype(float), len(names))
        for c, name in enumerate(names):
            out.append((name, main_part(rgba[rb[r]:rb[r + 1], bx0 + cb[c]:bx0 + cb[c + 1]])))
    return out

# Environment parts: blob order is checked on the labelled sheet and named in PARTS (index -> name; unnamed are dropped).
PART_JOBS = [('tidewheel', 'd7.png', (0, 364, 1024, 640)), ('frost', 'd7.png', (0, 957, 1024, 1148)),
             ('gatehouse', 'd7.png', (390, 1152, 1024, 1536))]
PARTS = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'parts-drop2.json'))) \
    if os.path.exists(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'parts-drop2.json')) else {}
FX = ('fx', 'd8.png', (0, 450, 1536, 1024), [8, 6, 6, 6, 6],
      [f'{n}_{i}' for n, k in (('splash', 8), ('ice', 6), ('debris', 6), ('coins', 6), ('dust', 6)) for i in range(k)])
# Backdrops came back as small thumbnails (about 250x360): kept as references only.
BACKDROPS = [('tidewheel', [(0, 0, 245, 360), (247, 0, 510, 360), (512, 0, 775, 360), (777, 0, 1024, 360)]),
             ('frost', [(0, 643, 255, 952), (257, 643, 510, 952), (512, 643, 772, 952), (774, 643, 1024, 952)]),
             ('gatehouse', [(0, 1150, 385, 1536)])]

def save(set_, frames, src):
    out = os.path.join(ROOT, 'assets', 'round3', set_); os.makedirs(out, exist_ok=True)
    mp = os.path.join(out, 'manifest.json')
    man = json.load(open(mp)) if os.path.exists(mp) else {'source': [], 'frames': {}}
    if src not in man['source']: man['source'].append(src)
    for name, im in frames:
        im.save(os.path.join(out, name + '.png'))   # PIL writes no text chunks: no metadata
        man['frames'][name] = {'file': name + '.png', 'size': list(im.size), 'pivot': [im.size[0] // 2, im.size[1]]}
    json.dump(man, open(mp, 'w'), indent=1)

def contact(path, ims, labels):
    cw, ch = 150, 130; cols = 10; rows = (len(ims) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * cw, rows * ch), (40, 44, 54)); d = ImageDraw.Draw(sheet)
    for k, (im, lab) in enumerate(zip(ims, labels)):
        t = im.convert("RGBA"); t.thumbnail((cw - 8, ch - 22))
        x, y = k % cols * cw, k // cols * ch
        sheet.paste(t, (x + (cw - t.width) // 2, y + 4), t); d.text((x + 4, y + ch - 16), lab, fill=(255, 230, 120))
    sheet.save(path, quality=85)

def main():
    src = sys.argv[1]; sheets = next((a[8:] for a in sys.argv if a.startswith('--sheet=')), None)
    want_sheet = bool(sheets)
    if sheets: os.makedirs(sheets, exist_ok=True)
    img = {f: np.array(Image.open(os.path.join(src, f)).convert('RGB')) for f in ('d5.png', 'd6.png', 'd7.png', 'd8.png')}
    got = {}
    for set_, f, (x0, y0, x1, y1), rows in JOBS:
        got.setdefault(set_, []).extend(grid_rows(key_green(img[f][y0:y1, x0:x1]), rows))
    for set_, f, (x0, y0, x1, y1) in PART_JOBS:
        rgba = key_green(img[f][y0:y1, x0:x1])
        flat = [b for r in rows_of(blobs(rgba, 2, 150), 40) for b in r]
        ims = [sprite(rgba, b) for b in flat]
        if want_sheet: contact(os.path.join(sheets, f'parts-{set_}-index.jpg'), ims, [str(i) for i in range(len(ims))])
        names = PARTS.get(set_, {})
        got.setdefault(set_ + '-parts', []).extend((names[str(i)], im) for i, im in enumerate(ims) if str(i) in names)
    set_, f, (x0, y0, x1, y1), counts, names = FX
    got['fx'] = list(zip(names, grid(key_black(img[f][y0:y1, x0:x1]), counts)))
    for stage, boxes in BACKDROPS:
        got.setdefault('backdrop-thumbs', []).extend(
            (f'{stage}_{i + 1}', Image.fromarray(img['d7.png'][b[1]:b[3], b[0]:b[2]])) for i, b in enumerate(boxes))
    for set_, frames in got.items():
        if not frames: continue
        save(set_, frames, 'main e92a987')
        if want_sheet: contact(os.path.join(sheets, f'{set_}.jpg'), [im for _, im in frames], [n for n, _ in frames])
        print(set_, len(frames))

main()
