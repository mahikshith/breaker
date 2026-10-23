"""Collision shapes for round-3 character frames, measured from the art itself (assets/round3/<set>/*.png).
Per frame: up to N circles packed into the opaque body (largest connected part, so loose rubble, snow spray and stars
never collide), in source pixels relative to the frame's foot pivot (bottom centre), plus `lead`: a circle on the body's
leading edge (the fist or shoulder that lands a dash) for the given facing. Writes assets/round3/<set>/shapes.json.
Run: python3 art/round3/fit_shapes.py warden
"""
import json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def fit(path, n=14, cover=.92):
    a = np.array(Image.open(path).convert('RGBA'))[..., 3] > 200
    a = nd.binary_opening(a, iterations=2)
    lab, k = nd.label(a)
    if k > 1: a = lab == 1 + int(np.argmax(nd.sum(a, lab, range(1, k + 1))))
    H, W = a.shape; px, py = W / 2, H
    left = a.copy(); total = a.sum(); circles = []
    for _ in range(n):
        d = nd.distance_transform_edt(left)
        y, x = np.unravel_index(np.argmax(d), d.shape); r = d[y, x]
        if r < min(W, H) * .045: break
        circles.append([round(float(x - px), 1), round(float(y - py), 1), round(float(r * .97), 1)])
        yy, xx = np.ogrid[:H, :W]; left &= (xx - x) ** 2 + (yy - y) ** 2 > (r * 1.15) ** 2
        if 1 - left.sum() / total >= cover: break
    ys, xs = np.where(a)
    body = [float(xs.min() - px), float(ys.min() - py), float(xs.max() - xs.min()), float(ys.max() - ys.min())]
    # Lead: of the big circles (body, arms; not a rock or a toe), the one reaching furthest right. Frames face right.
    big = [c for c in circles if c[2] >= max(c[2] for c in circles) * .4]
    lead = max(big, key=lambda c: c[0] + c[2])
    return {'circles': circles, 'body': [round(v, 1) for v in body], 'lead': lead}

who = sys.argv[1]
d = os.path.join(ROOT, 'assets', 'round3', who)
frames = json.load(open(os.path.join(d, 'manifest.json')))['frames']
out = {k: fit(os.path.join(d, f['file'])) for k, f in frames.items()}
json.dump(out, open(os.path.join(d, 'shapes.json'), 'w'), indent=0)
print(who, len(out), 'frames;', 'circles per frame', sorted({len(v['circles']) for v in out.values()}))
