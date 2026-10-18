"""Compare packed Carrier pixels against the selected sources at phone scale."""
import base64
import io
import json
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
data = (ROOT / 'src/vault-art.js').read_text(encoding='utf-8')
art = json.loads(data.split('export const ART = ', 1)[1].rstrip(';\n'))['carrier']
manifest = json.loads((ROOT / 'design/phase1/space-assets-ab.json').read_text(encoding='utf-8'))
rows = []
for name, part in art['parts'].items():
    source = Image.open(ROOT / manifest['parts'][name]['path']).convert('RGBA')
    packed = Image.open(io.BytesIO(base64.b64decode(part['url'].split(',', 1)[1]))).convert('RGBA')
    assert list(packed.size) == [part['width'], part['height']]
    size = (393, 852) if name == 'aBackground' else tuple(max(1, round(n * 412 / 360)) for n in part['display'])
    def native(im):
        if name == 'aBackground':
            k = max(size[0] / im.width, size[1] / im.height)
            im = im.resize((round(im.width*k), round(im.height*k)), Image.Resampling.LANCZOS)
            im = im.crop((im.width-size[0], im.height-size[1], im.width, im.height))
        else:
            im = im.resize(size, Image.Resampling.LANCZOS)
        bg = Image.new('RGBA', size, '#070c1e')
        bg.alpha_composite(im)
        return np.array(bg.convert('RGB'), dtype=np.float32)
    delta = np.abs(native(source) - native(packed))
    error = float(delta.mean())
    assert error < 4, (name, error)
    rows.append({'id': name, 'nativeSize': list(size), 'meanAbsoluteChannelError': round(error, 4), 'p99ChannelError': float(np.percentile(delta, 99))})
out = ROOT / 'out/carrier-art-quality.json'
out.write_text(json.dumps(rows, indent=2) + '\n', encoding='utf-8')
print(f'{len(rows)} native art comparisons pass; worst mean channel error {max(r["meanAbsoluteChannelError"] for r in rows):.3f}/255')
