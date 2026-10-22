"""Size an isolated level family for phone rendering; preserve source geometry."""
import hashlib
import io
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
manifest_path, output = [Path(p).resolve() for p in sys.argv[1:]]
manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
output.mkdir(parents=True, exist_ok=True)
sha = lambda data: hashlib.sha256(data).hexdigest()
rows = []
for name, part in manifest['parts'].items():
    source = ROOT / part['path']
    raw = source.read_bytes()
    if part.get('sha256'):
        assert sha(raw) == part['sha256'], f'{name}: source changed'
    with Image.open(io.BytesIO(raw)) as image:
        assert not image.info, f'{name}: source metadata'
        assert list(image.size) == part['size'], f'{name}: dimensions changed'
        original = image.convert('RGBA')
    image = original.copy()
    display = part.get('display')
    if isinstance(display, list):
        ratio = min(1, max(display) * 3 / max(image.size))
        if ratio < 1:
            image = image.resize(tuple(max(1, round(n * ratio)) for n in image.size), Image.Resampling.LANCZOS)
    pixels = np.array(image)
    pixels[pixels[:, :, 3] == 0, :3] = 0
    image = Image.fromarray(pixels)
    encoded = io.BytesIO()
    # Large opaque plates may opt in to lossy colour ("encode": "lossy"); alpha must stay bit-exact so silhouettes
    # and collision never move, and the native-size guard below still bounds the visible error.
    lossy = part.get('encode') == 'lossy'
    if lossy: image.save(encoded, 'WEBP', quality=92, alpha_quality=100, method=6)
    else: image.save(encoded, 'WEBP', lossless=True, exact=True, method=6)
    data = encoded.getvalue()
    decoded = Image.open(io.BytesIO(data)).convert('RGBA')
    if lossy: assert decoded.getchannel('A').tobytes() == image.getchannel('A').tobytes(), f'{name}: alpha drift'
    else: assert decoded.tobytes() == image.tobytes(), f'{name}: lossless round trip drift'
    native_error = None
    if isinstance(display, list):
        size = tuple(max(1, round(n * 412 / 360)) for n in display)
        def native(im):
            backdrop = Image.new('RGBA', size, '#070c1e')
            backdrop.alpha_composite(im.resize(size, Image.Resampling.LANCZOS))
            return np.array(backdrop.convert('RGB'), dtype=np.float32)
        native_error = float(np.abs(native(original) - native(decoded)).mean())
        assert native_error < 4, (name, native_error)
    elif lossy:  # full-screen plates have no display size: bound the error at their own resolution
        native_error = float(np.abs(np.array(image.convert('RGB'), dtype=np.float32) - np.array(decoded.convert('RGB'), dtype=np.float32)).mean())
        assert native_error < 4, (name, native_error)
    path = output / f'{name}.webp'
    path.write_bytes(data)
    rows.append({'id': name, 'source': part['path'], 'sourceSHA256': sha(raw),
        'path': path.relative_to(ROOT).as_posix(), 'runtimeSHA256': sha(data),
        'sourceSize': part['size'], 'runtimeSize': list(image.size),
        'sourceBytes': len(raw), 'encodedBytes': len(data),
        'decodedRGBABytes': image.width * image.height * 4,
        'nativeMeanChannelError': native_error, 'losslessRoundTrip': not lossy, **({'encoding': 'lossy-q92-exact-alpha'} if lossy else {})})
report = {'scope': 'Isolated phone texture sizing; original normalized collision/anchors remain authoritative',
    'manifest': manifest_path.relative_to(ROOT).as_posix(), 'manifestSHA256': sha(manifest_path.read_bytes()),
    'parts': rows, 'encodedBytes': sum(p['encodedBytes'] for p in rows),
    'decodedRGBABytes': sum(p['decodedRGBABytes'] for p in rows)}
(output / 'report.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps({k: v for k, v in report.items() if k != 'parts'}, indent=2))
