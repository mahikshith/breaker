"""Normalize isolated equipment without repainting source pixels."""
from pathlib import Path
import hashlib
import json
import numpy as np
from PIL import Image

HERE = Path(__file__).parent
ROOT = HERE.parents[1]
OUT = ROOT / 'assets/starflight-equipment'
OUT.mkdir(parents=True, exist_ok=True)
source = HERE / 'source-v1.png'
sheet = Image.open(source).convert('RGBA')
assert sheet.size == (1254, 1254)
clean = np.array(sheet)
clean[clean[:, :, 3] < 3] = 0
sheet = Image.fromarray(clean)
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
specs = {
    'guided': ((0, 0, 627, 655), (128, 256), (17, 34)),
    'ricochet': ((627, 0, 1254, 700), (128, 256), (21, 42)),
    'shield': ((0, 655, 627, 1254), (256, 256), (79, 79)),
    'capsule': ((627, 700, 1254, 1254), (192, 192), (30, 30)),
}
parts = {}
for name, (region, size, display) in specs.items():
    crop = sheet.crop(region)
    a = np.array(crop.getchannel('A'))
    assert max(a[0].max(), a[-1].max(), a[:, 0].max(), a[:, -1].max()) < 3, name
    box = crop.getchannel('A').getbbox()
    crop = crop.crop(box)
    ratio = min((size[0]-24)/crop.width, (size[1]-24)/crop.height)
    fit = crop.resize((round(crop.width*ratio), round(crop.height*ratio)), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', size)
    at = ((size[0]-fit.width)//2, (size[1]-fit.height)//2)
    canvas.alpha_composite(fit, at)
    pixels = np.array(canvas)
    pixels[pixels[:, :, 3] == 0] = 0
    canvas = Image.fromarray(pixels)
    path = OUT / (name+'.png')
    canvas.save(path)
    pivot = [.5, .5]
    if name in ('guided', 'ricochet'):
        # The collision point sits just behind the bright solid nose, not amidships.
        alpha = pixels[:, :, 3]
        yy, xx = np.where(alpha > 220)
        top = int(yy.min())
        tipx = float(np.median(xx[yy <= top+5]))
        pivot = [tipx/size[0], (top+4)/size[1]]
    assert not Image.open(path).info
    assert not pixels[0, :, 3].any() and not pixels[-1, :, 3].any()
    assert not pixels[:, 0, 3].any() and not pixels[:, -1, 3].any()
    parts[name] = {'path': path.relative_to(ROOT).as_posix(), 'size': size, 'display': display,
                   'pivot': pivot, 'sourceRegion': region, 'sourceCrop': box,
                   'alphaBounds': canvas.getchannel('A').getbbox(), 'sha256': sha(path)}
manifest = {'version': 1, 'source': source.relative_to(ROOT).as_posix(), 'sourceSHA256': sha(source),
            'facing': 'up', 'filter': 'linear', 'parts': parts,
            'limits': 'Missile pivot is the nose contact point; rear body and glow are cosmetic. Shield is rendered on the ship only while actual shield charges exist. Capsule frame is equipment housing, not attraction radius.'}
(OUT/'manifest.json').write_text(json.dumps(manifest, indent=2)+'\n', encoding='utf-8')
print(json.dumps(manifest))
