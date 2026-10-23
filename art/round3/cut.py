"""Cut the round-3 M365 character sheets (art/premium/{crab,yeti_1,yeti_2}.png on main, commit 97a87c6) into named
frames under assets/round3/<character>/ with a manifest: per-frame size and pivot (bottom centre = ground point).

The sheets are not on a fixed grid, so rows are found from the alpha's horizontal profile and frames from each row's
vertical profile, using the pose counts M365 reported. Faint background glow (alpha < 24) is dropped.
Run: python3 art/round3/cut.py <dir holding crab.png, yeti_1.png, yeti_2.png>
"""
import json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SHEETS = {
    'nerra': [('crab.png', [
        [f'walk_r_{i}' for i in range(8)], [f'walk_l_{i}' for i in range(8)],
        ['turn_r_0', 'turn_r_1', 'turn_r_2', 'turn_l_0', 'turn_l_1', 'turn_l_2'],
        ['jump_crouch', 'jump_takeoff', 'jump_land'],
        ['gaze_ul', 'gaze_u', 'gaze_ur', 'gaze_l', 'gaze_c', 'gaze_r', 'gaze_dl', 'gaze_d', 'gaze_dr'],
        ['smug', 'furious', 'roar', 'hurt', 'dizzy'],
        ['snap_l_windup', 'snap_l_strike', 'snap_r_windup', 'snap_r_strike', 'chain_yank'],
        ['flinch', 'stagger', 'dazed', 'knocked', 'defeated']])],
    'warden': [('yeti_1.png', [
        [f'idle_{i}' for i in range(4)], ['pound_windup', 'pound_strike', 'pound_recover'],
        ['flinch', 'dazed', 'recover', 'defeated']]),
        ('yeti_2.png', [
        ['dash_r_crouch'] + [f'dash_r_{i}' for i in range(4)], ['dash_l_crouch'] + [f'dash_l_{i}' for i in range(4)],
        ['smash_r', 'dazed_r', 'smash_l', 'dazed_l']])],
}

def cuts(profile, k, minsep):
    s = nd.uniform_filter1d(profile, 9); L = len(s); out = []
    for i in np.argsort(s):
        if minsep * .5 < i < L - minsep * .5 and all(abs(i - c) >= minsep for c in out): out.append(i)
        if len(out) == k - 1: break
    return [0] + sorted(out) + [L]

def cut_sheet(path, rows):
    im = Image.open(path).convert('RGBA'); a = np.array(im)
    a[..., 3][a[..., 3] < 24] = 0
    m = a[..., 3] > 100; H = m.shape[0]; frames = {}
    rb = cuts(m.sum(1).astype(float), len(rows), H / len(rows) * .55)
    for r, names in enumerate(rows):
        y0, y1 = rb[r], rb[r + 1]; band = m[y0:y1]
        xs = np.where(band.any(0))[0]; bx0, bx1 = xs.min(), xs.max() + 1
        cb = cuts(band[:, bx0:bx1].sum(0).astype(float), len(names), (bx1 - bx0) / len(names) * .6)
        for c, name in enumerate(names):
            x0, x1 = bx0 + cb[c], bx0 + cb[c + 1]
            sub = np.zeros_like(a[y0:y1, x0:x1]); keep = a[y0:y1, x0:x1, 3] > 0
            sub[keep] = a[y0:y1, x0:x1][keep]
            ys, xx = np.where(sub[..., 3] > 100)
            frames[name] = Image.fromarray(sub).crop((xx.min(), ys.min(), xx.max() + 1, ys.max() + 1))
    return frames

src = sys.argv[1]
for who, sheets in SHEETS.items():
    out = os.path.join(ROOT, 'assets', 'round3', who); os.makedirs(out, exist_ok=True); man = {}
    for file, rows in sheets:
        for name, fr in cut_sheet(os.path.join(src, file), rows).items():
            fr.save(os.path.join(out, name + '.png'))   # PIL writes no text chunks: no metadata
            man[name] = {'file': name + '.png', 'size': list(fr.size), 'pivot': [fr.width / 2, fr.height]}
    json.dump({'source': 'M365 round 3 sheets (art/premium on main, 97a87c6), cut by art/round3/cut.py', 'frames': man},
              open(os.path.join(out, 'manifest.json'), 'w'), indent=1)
    print(who, len(man), 'frames ->', out)
