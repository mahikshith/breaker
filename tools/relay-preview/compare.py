"""Compare real phone captures of the original PNG and sized WebP assemblies."""
import json
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

baseline = Path('out/relay-next-final')
out = Path(sys.argv[1] if len(sys.argv) > 1 else 'out/relay-optimized')
rows = []
for phone, native in [('ios', (393, 852)), ('android', (412, 915))]:
    for state in ['opening', 'staged-cannon-warning', 'staged-cannon-shot', 'staged-worker-release', 'staged-boarding', 'staged-departure', 'staged-result']:
        source = Image.open(baseline / f'{phone}-{state}.png').convert('RGB')
        runtime = Image.open(out / f'{phone}-{state}.png').convert('RGB')
        assert source.size == runtime.size == (native[0] * 2, native[1] * 2)
        a = source.resize(native, Image.Resampling.LANCZOS)
        b = runtime.resize(native, Image.Resampling.LANCZOS)
        delta = np.abs(np.asarray(a, dtype=np.float32) - np.asarray(b, dtype=np.float32))
        mean = float(delta.mean())
        assert mean < 4, f'Native frame error: {phone} {state}: {mean}'
        # An opaque full-screen starfield would otherwise dilute a foreground defect.
        field = delta[round(native[1] * .12):round(native[1] * .5)]
        assert float(field.mean()) < 4
        rows.append({'device': phone, 'state': state, 'nativeSize': list(native), 'meanAbsoluteChannelError': round(mean, 4), 'p99ChannelError': float(np.percentile(delta, 99)), 'foregroundMeanAbsoluteChannelError': round(float(field.mean()), 4)})
        sheet = Image.new('RGB', (native[0] * 2, native[1] + 24), '#080c18')
        sheet.paste(a, (0, 24)); sheet.paste(b, (native[0], 24))
        draw = ImageDraw.Draw(sheet)
        draw.text((10, 7), 'SOURCE PNG', fill='#c6d5e8')
        draw.text((native[0] + 10, 7), 'SIZED WEBP', fill='#c6d5e8')
        sheet.save(out / f'{phone}-{state}-comparison.png')
(out / 'native-comparison.json').write_text(json.dumps(rows, indent=2) + '\n', encoding='utf8')
print(f'{len(rows)} actual phone-state comparisons pass; worst mean error {max(r["meanAbsoluteChannelError"] for r in rows):.3f}/255')
