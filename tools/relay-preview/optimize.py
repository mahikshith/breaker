"""Size the reviewed Relay parts exactly like Carrier, without replacing sources."""
import hashlib
import json
import sys
from pathlib import Path
import numpy as np
from PIL import Image

out = Path(sys.argv[1] if len(sys.argv) > 1 else 'out/relay-optimized')
(out / 'parts').mkdir(parents=True, exist_ok=True)
manifest = json.loads(Path('design/phase1/space-assets-ab.json').read_text(encoding='utf8'))
info = json.loads(Path('tools/relay-preview/art-info.json').read_text(encoding='utf-8-sig'))
sha = lambda data: hashlib.sha256(data).hexdigest()
frozen = {p: sha(Path(p).read_bytes()) for p in ['src/relay.js', 'dist/breach.html']}
rows = []


def native(im, part, phone):
    width, height = phone
    if part == 'bBackground':
        ratio = max(width / im.width, height / im.height)
        im = im.resize((round(im.width * ratio), round(im.height * ratio)), Image.Resampling.LANCZOS)
        return im.crop((im.width - width, im.height - height, im.width, im.height))
    size = tuple(max(1, round(n * width / 360)) for n in manifest['parts'][part]['display'])
    return im.resize(size, Image.Resampling.LANCZOS)


for name in info:
    spec = manifest['parts'][name]
    source_path = Path(spec['path'])
    source_bytes = source_path.read_bytes()
    with Image.open(source_path) as image:
        assert not image.info, f'Unexpected source metadata: {name}'
        assert list(image.size) == spec['size'], name
        source = image.convert('RGB' if name == 'bBackground' else 'RGBA')
    runtime = source.copy()
    if isinstance(spec['display'], list):
        ratio = min(1, max(spec['display']) * 3 / max(runtime.size))
        if ratio < 1:
            runtime = runtime.resize(tuple(max(1, round(n * ratio)) for n in runtime.size), Image.Resampling.LANCZOS)
    path = out / 'parts' / (name + '.webp')
    runtime.save(path, 'WEBP', quality=96, method=6)
    packed = Image.open(path).convert(source.mode)
    assert packed.size == runtime.size
    alpha = None
    if source.mode == 'RGBA':
        assert packed.getchannel('A').getextrema()[0] == 0, f'Lost exterior alpha: {name}'
        delta = np.abs(np.asarray(runtime.getchannel('A'), dtype=np.int16) - np.asarray(packed.getchannel('A'), dtype=np.int16))
        assert int(delta.max()) == 0, f'WebP changed resized alpha: {name}'
        alpha = {'exactAfterSizing': True, 'maxChannelError': 0, 'exteriorAlpha': 0}
    comparisons = {}
    for device, phone in [('ios', (393, 852)), ('android', (412, 915))]:
        a = native(source.convert('RGBA'), name, phone)
        b = native(packed.convert('RGBA'), name, phone)
        bg = Image.new('RGBA', a.size, '#070c1e')
        ar, br = bg.copy(), bg.copy()
        ar.alpha_composite(a); br.alpha_composite(b)
        delta = np.abs(np.asarray(ar.convert('RGB'), dtype=np.float32) - np.asarray(br.convert('RGB'), dtype=np.float32))
        mean = float(delta.mean())
        assert mean < 4, f'Native-size pixel error too large: {name}, {device}, {mean}'
        comparisons[device] = {'nativeSize': list(a.size), 'meanAbsoluteChannelError': round(mean, 4), 'p99ChannelError': float(np.percentile(delta, 99))}
    rows.append({'id': name, 'path': path.as_posix(), 'source': spec['path'], 'sourceSHA256': sha(source_bytes), 'runtimeSHA256': sha(path.read_bytes()), 'sourceSize': list(source.size), 'runtimeSize': list(runtime.size), 'sourceEncodedBytes': len(source_bytes), 'encodedBytes': path.stat().st_size, 'sourceDecodedBytes': source.width * source.height * 4, 'decodedBytes': runtime.width * runtime.height * 4, 'quality': 96, 'alpha': alpha, 'nativeComparison': comparisons})

report = {'scope': 'Isolated Relay texture optimization, not runtime admission or a physical-device performance result', 'method': 'Carrier sizing:3 source pixels per displayed world unit, capped at source resolution; full-size background; WebP96/method6', 'frozenFiles': frozen, 'parts': rows}
for before, after in [('sourceEncodedBytes', 'encodedBytes'), ('sourceDecodedBytes', 'decodedBytes')]:
    report[before] = sum(p[before] for p in rows)
    report[after] = sum(p[after] for p in rows)
    report[after + 'ReductionPercent'] = round((1 - report[after] / report[before]) * 100, 3)
for path, digest in frozen.items():
    assert sha(Path(path).read_bytes()) == digest, path
assert all(sha(Path(p['source']).read_bytes()) == p['sourceSHA256'] for p in rows), 'Source PNG changed'
(out / 'runtime-pack.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf8')
print(f"{len(rows)} parts: encoded {report['sourceEncodedBytes']:,} -> {report['encodedBytes']:,} bytes; decoded RGBA budget {report['sourceDecodedBytes']:,} -> {report['decodedBytes']:,} bytes")
