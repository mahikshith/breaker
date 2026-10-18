"""Measure delivered C alpha topology and ball clearance without changing gameplay/art."""
from pathlib import Path
from collections import deque
import hashlib
import json
import math
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'out/orbital-aperture-audit'
OUT.mkdir(exist_ok=True)
M = json.loads((ROOT / 'assets/space-c/machinery.json').read_text())
P = {p['id']: p for p in M['parts']}
hull = Image.open(ROOT / P['hull']['path']).convert('RGBA')
alpha = np.asarray(hull.getchannel('A'))
scale = M['assembly']['displayWidth'] / hull.width
top = M['assembly']['worldTop']
x0, y0, x1, y1 = M['assembly']['aperturePx']
cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
world = lambda x, y: {'x': x * scale, 'y': top + y * scale}
hashfile = lambda p: hashlib.sha256((ROOT / p).read_bytes()).hexdigest()


def component(threshold, diagonal=False):
    free = alpha < threshold
    seen = np.zeros(free.shape, dtype=np.uint8)
    q = deque([(round(cx), round(cy))])
    seen[q[0][1], q[0][0]] = 1
    steps = [(1, 0), (-1, 0), (0, 1), (0, -1)]
    if diagonal:
        steps += [(1, 1), (-1, 1), (1, -1), (-1, -1)]
    edge = False
    while q:
        x, y = q.popleft()
        if x in (0, hull.width - 1) or y in (0, hull.height - 1):
            edge = True
        for dx, dy in steps:
            xx, yy = x + dx, y + dy
            if 0 <= xx < hull.width and 0 <= yy < hull.height and free[yy, xx] and not seen[yy, xx]:
                seen[yy, xx] = 1
                q.append((xx, yy))
    yy, xx = np.where(seen)
    return {'alphaThreshold': threshold, 'neighbours': 8 if diagonal else 4,
            'areaPx': int(seen.sum()), 'boundsPx': [int(xx.min()), int(yy.min()), int(xx.max() + 1), int(yy.max() + 1)],
            'reachesExterior': edge}


def prefix(mask):
    return np.pad(np.cumsum(mask, axis=1, dtype=np.int32), ((0, 0), (1, 0)))


def overlap(p, radius, sums):
    # Pixel centres give a bounded raster diagnostic; final admitted contours remain separate work.
    x, y, r = p['x'] / scale - .5, (p['y'] - top) / scale - .5, radius / scale
    yy = np.arange(max(0, math.ceil(y - r)), min(hull.height - 1, math.floor(y + r)) + 1)
    half = np.sqrt(np.maximum(0, r * r - (yy - y) ** 2))
    lo = np.maximum(0, np.ceil(x - half).astype(int))
    hi = np.minimum(hull.width - 1, np.floor(x + half).astype(int))
    valid = lo <= hi
    yy, lo, hi = yy[valid], lo[valid], hi[valid]
    return int(np.sum(sums[yy, hi + 1] - sums[yy, lo]))


def shutter_alpha(opened):
    image = Image.new('RGBA', hull.size)
    k = max((x1 - x0) / M['assembly']['pairVisibleSize'][0], (y1 - y0) / M['assembly']['pairVisibleSize'][1]) * 1.1
    for name, sign in [('door_left', -1), ('door_right', 1)]:
        p = P[name]
        leaf = Image.open(ROOT / p['path']).convert('RGBA')
        w, h = leaf.width * k, leaf.height * k
        leaf = leaf.resize((round(w), round(h)), Image.Resampling.BILINEAR)
        at = (round(cx + sign * opened * M['assembly']['doorTravelPx'] - p['pivot'][0] * w), round(cy - p['pivot'][1] * h))
        image.alpha_composite(leaf, at)
    mask = np.asarray(Image.open(ROOT / P['bay_mask']['path']).getchannel('A'), dtype=float) / 255
    return np.asarray(image.getchannel('A'), dtype=float) * mask


solid = prefix(alpha >= 128)
centre = world(cx, cy)
legacy = {'x': 181, 'y': 184, 'r': 14}
topology = [component(t) for t in [16, 64, 128, 192, 250]] + [component(128, True)]
assert all(not c['reachesExterior'] for c in topology), 'Unexpected exterior path: inspect the new alpha before drawing conclusions'

probes = []
for radius in [7.5, 10]:
    contact = None
    for y in np.arange(280, centre['y'] - .05, -.1):
        p = {'x': 181, 'y': float(y)}
        if overlap(p, radius, solid):
            contact = p
            break
    assert contact
    probes.append({'ballRadius': radius, 'fitsAtApertureCentreWhenAlreadyInside': overlap(centre, radius, solid) == 0,
                   'firstVerticalHullContactFromBelow': contact,
                   'legacyCoreContactCentreYWithoutHull': legacy['y'] + legacy['r'] + radius,
                   'externalEntryToInternalWindow': False})

poses = []
for opened in [0, .25, .5, .75, 1]:
    sums = prefix((alpha >= 128) | (shutter_alpha(opened) >= 128))
    poses.append({'open': opened, 'normalFitsAtCentreInsideWindow': overlap(centre, 7.5, sums) == 0,
                  'titanFitsAtCentreInsideWindow': overlap(centre, 10, sums) == 0,
                  'externalEntry': False})

lo, hi = 0., 20.
for _ in range(18):
    mid = (lo + hi) / 2
    if overlap(centre, mid, solid):
        hi = mid
    else:
        lo = mid

report = {
    'scope': 'Delivered C machinery alpha geometry diagnostic, not new gameplay, asset admission or a winnable final C level',
    'inputs': {p: hashfile(p) for p in ['assets/space-c/machinery.json', 'assets/space-c/hull.png', 'assets/space-c/door_left.png', 'assets/space-c/door_right.png', 'src/orbital.js']},
    'scaleWorldPerSourcePixel': scale, 'contactRasterUncertaintyWorld': scale,
    'alphaSolidThreshold': 128, 'hullWorldTop': top,
    'aperturePx': [x0, y0, x1, y1],
    'apertureWorld': {**world(x0, y0), 'w': (x1 - x0) * scale, 'h': (y1 - y0) * scale},
    'apertureCentre': centre, 'midpointClearRadiusApprox': lo,
    'legacyGreyboxBay': {'x': 128, 'y': 168, 'w': 109, 'h': 45},
    'legacyCore': {**legacy, 'opaqueHullPixelOverlap': overlap(legacy, legacy['r'], solid)},
    'topology': topology, 'ballProbes': probes, 'shutterPoses': poses,
    'blocker': 'The actual bay is an enclosed alpha window with an opaque lower lip. Neither a point nor either ball radius can enter from the exterior in a 2D solid-alpha hull. Smaller dimensions are not the main blocker.',
    'requiredBeforeGameplayAdmission': [
        'Author and review a visible exposed-reactor access state (e.g. retracting lower lip) or a visibly projected target outside the hull; do not erase collider pixels from intact visible metal.',
        'Re-measure and admit C cannon/barrel front collision and muzzles; the missing barrel family is not certified by old gun circles.',
        'Keep old greybox receipts historical; a primitive open-bottom notch is not proof of traversal through this closed raster lip.',
        'Re-run ordinary and TITAN approach/contact proofs and full no-power input-only completion after the visible access state is agreed and produced.'
    ],
    'limits': ['Bay backing is treated as decorative depth for this access diagnostic, not additional physical cover.',
               'Source-pixel occupancy and threshold sensitivity are measured; final polygon/alpha collision shapes are not admitted.',
               'Shutter poses use the existing pivot/scale/travel contract with bilinear raster registration; source-pixel uncertainty is reported.',
               'No src/orbital.js, core rules, active runtime, shared ART, packer or APK is changed.']
}
(OUT / 'report.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
