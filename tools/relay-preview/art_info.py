"""Measure the real delivered alpha; preview-only data, no active art packing."""
import json
from pathlib import Path
from PIL import Image


def area(points):
    return sum(a[0] * b[1] - a[1] * b[0] for a, b in zip(points, points[1:] + points[:1])) / 2


def simplify(points, tolerance):
    if len(points) < 3:
        return points
    a, b = points[0], points[-1]
    dx, dy = b[0] - a[0], b[1] - a[1]
    den = dx * dx + dy * dy
    distances = []
    for p in points[1:-1]:
        t = max(0, min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / den)) if den else 0
        distances.append((p[0] - a[0] - t * dx) ** 2 + (p[1] - a[1] - t * dy) ** 2)
    if not distances or max(distances) <= tolerance * tolerance:
        return [a, b]
    i = distances.index(max(distances)) + 1
    return simplify(points[:i + 1], tolerance)[:-1] + simplify(points[i:], tolerance)


def contours(image):
    w = min(image.width, 240)
    h = round(image.height * w / image.width)
    mask = image.getchannel('A').resize((w, h), Image.Resampling.NEAREST)
    solid = {(x, y) for y in range(h) for x in range(w) if mask.getpixel((x, y)) >= 96}
    edges = {}
    for x, y in solid:
        for neighbour, a, b in [((x, y - 1), (x, y), (x + 1, y)), ((x + 1, y), (x + 1, y), (x + 1, y + 1)), ((x, y + 1), (x + 1, y + 1), (x, y + 1)), ((x - 1, y), (x, y + 1), (x, y))]:
            if neighbour not in solid:
                edges.setdefault(a, []).append(b)
    loops = []
    while edges:
        first = next(iter(edges))
        point, loop = first, []
        while True:
            loop.append(point)
            choices = edges.get(point)
            if not choices:
                break
            next_point = choices.pop()
            if not choices:
                del edges[point]
            point = next_point
            if point == first:
                break
        if len(loop) > 3:
            loops.append(loop)
    loops.sort(key=lambda p: abs(area(p)), reverse=True)
    assert loops and area(loops[0]) > 0, 'Clockwise outer alpha boundary required'
    useful = [loops[0]] + [p for p in loops[1:] if area(p) < -w * h * .002]
    result = []
    for loop in useful:
        i = max(range(len(loop)), key=lambda j: (loop[j][0] - loop[0][0]) ** 2 + (loop[j][1] - loop[0][1]) ** 2)
        pts = simplify(loop[:i + 1], .65)[:-1] + simplify(loop[i:] + [loop[0]], .65)[:-1]
        result.append([[round(x / w, 6), round(y / h, 6)] for x, y in pts])
    return {'points': result[0], 'holes': result[1:]}


manifest = json.loads(Path('design/phase1/space-assets-ab.json').read_text(encoding='utf8'))
info = {}
for key, part in manifest['parts'].items():
    if key.startswith('a') and key[1:2].isupper():
        continue
    image = Image.open(part['path']).convert('RGBA')
    box = image.getchannel('A').point(lambda value: 255 if value >= 32 else 0).getbbox()
    assert box and image.size == tuple(part['size']), key
    entry = {'artBounds': [box[0] / image.width, box[1] / image.height, (box[2] - box[0]) / image.width, (box[3] - box[1]) / image.height]}
    if key in ['bHull', 'bIris', 'bCannonBarrel', 'bPod']:
        entry['collision'] = contours(image)
    info[key] = entry
print(json.dumps(info, separators=(',', ':')))
