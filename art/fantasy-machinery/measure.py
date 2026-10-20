from pathlib import Path
import json
import math
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT/'assets/fantasy-machinery'
PROOF = Path(__file__).parent/'proof'


def circles(image, count=16, min_radius=5, step=6):
    opaque = np.array(image.getchannel('A')) >= 128
    inside = opaque.copy()
    inside[1:-1, 1:-1] &= opaque[:-2, 1:-1] & opaque[2:, 1:-1] & opaque[1:-1, :-2] & opaque[1:-1, 2:]
    by, bx = np.where(opaque & ~inside)
    candidates = []
    for y in range(step//2, image.height, step):
        for x in range(step//2, image.width, step):
            if not opaque[y, x]:
                continue
            radius = math.sqrt(float(np.min((bx-x)**2+(by-y)**2))) - 1
            if radius >= min_radius:
                candidates.append((radius, x, y))
    candidates.sort(reverse=True)
    chosen = []
    for radius, x, y in candidates:
        # Keep broad original-mass disks and a modest overlap, no transparent gaps.
        if all(math.hypot(x-cx, y-cy) > max(cr, radius)*.70 for cr, cx, cy in chosen):
            chosen.append((radius, x, y))
            if len(chosen) >= count:
                break
    # Largest masses alone miss narrow tusks, walking legs and jaw tips. Re-arm
    # those with truly inscribed small disks, not a bounding box across gaps.
    for _ in range(80-len(chosen)):
        best, best_gap = None, 2.0
        for radius,x,y in candidates:
            gap=min(math.hypot(x-cx,y-cy)-cr for cr,cx,cy in chosen)
            if gap>best_gap:
                best,best_gap=(radius,x,y),gap
        if best is None:
            break
        chosen.append(best)
    return chosen


def geometry(image, unit, pivot, count=16, minimum=5, step=6):
    sx, sy = unit[0]/image.width, unit[1]/image.height
    assert abs(sx-sy) < .00001
    shapes = []
    for r, x, y in circles(image, count, minimum, step):
        shapes.append({'type': 'circle', 'x': round((x/image.width-pivot[0])*unit[0], 5),
                       'y': round((y/image.height-pivot[1])*unit[1], 5), 'r': round(r*sx, 5)})
    return shapes


def draw_shapes(im, shapes, unit, pivot):
    result = Image.new('RGBA', im.size, '#151b23')
    result.alpha_composite(im)
    d = ImageDraw.Draw(result)
    scale = im.width/unit[0]
    for i, s in enumerate(shapes):
        x=(s['x']/unit[0]+pivot[0])*im.width
        y=(s['y']/unit[1]+pivot[1])*im.height
        r=s['r']*scale
        d.ellipse((x-r,y-r,x+r,y+r),outline='#64ffb0',width=2)
        d.text((x,y),str(i),fill='white')
    return result


def main():
    PROOF.mkdir(parents=True, exist_ok=True)
    m=json.loads((OUT/'manifest.json').read_text())
    data={'contract': 'Each disk fully inscribed in alpha>=128, relative to normalized pivot at declared unit scale. Conservative union, never fills leg/jaw gaps. Shapes are not a traced rig.', 'bellforge':{},'tidewheel':{}}
    korr=m['bellforge']['korr']
    for f in korr['frames']:
        im=Image.open(ROOT/f['path']).convert('RGBA')
        shapes=geometry(im,korr['unit'],korr['pivot'],22,5,6)
        data['bellforge'][f['name']]=shapes
        f['collision'] = shapes
        draw_shapes(im,shapes,korr['unit'],korr['pivot']).save(PROOF/('korr-'+f['name']+'-collision.png'))
    for name,count,minimum in [('nerraBody',25,5),('crusherClaw',12,4),('gateClaw',14,3)]:
        e=m['tidewheel'][name];im=Image.open(ROOT/e['path']).convert('RGBA')
        shapes=geometry(im,e['unit'],e['pivot'],count,minimum,5)
        data['tidewheel'][name]=shapes
        e['collision'] = shapes
        draw_shapes(im,shapes,e['unit'],e['pivot']).save(PROOF/(name+'-collision.png'))
    (PROOF/'collision-measurements.json').write_text(json.dumps(data,indent=2)+'\n')
    korr['collisions'] = data['bellforge']
    m['collisionConvention'] = data['contract']
    (OUT/'manifest.json').write_text(json.dumps(m,indent=2)+'\n', encoding='utf-8')
    print(json.dumps(data))


if __name__=='__main__':
    main()
