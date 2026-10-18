"""Normalize independent space sprites without repainting their source pixels."""
import json
import hashlib
import shutil
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
RECIPE = Path(__file__).with_name('parts-source.json')

def prepare(entries):
    report = []
    for entry in entries:
        source = Path(__file__).with_name('source') / (entry['key'] + '.png')
        if not source.exists():
            source.parent.mkdir(exist_ok=True)
            shutil.copyfile(entry['path'], source)
        original = Image.open(source).convert('RGBA')
        alpha = original.getchannel('A')
        assert alpha.getextrema()[0] == 0, f'{source.name}: no real transparency'
        # Ignore nearly invisible export speckles when locating the sprite, preserving pixels inside the crop.
        bounds = alpha.point(lambda value: 255 if value >= 16 else 0).getbbox()
        assert bounds, f'{source.name}: empty sprite'
        crop = original.crop(bounds)
        result = Image.new('RGBA', (crop.width + 8, crop.height + 8))
        result.paste(crop, (4, 4))
        target = ROOT / entry['target']
        target.parent.mkdir(parents=True, exist_ok=True)
        result.save(target)
        assert not Image.open(target).info, f'{target.name}: PNG metadata'
        report.append({'key': entry['key'], 'target': entry['target'], 'source': source.relative_to(ROOT).as_posix(), 'sha256': hashlib.sha256(target.read_bytes()).hexdigest(), 'sourceSize': list(original.size), 'cropAlphaThreshold': 16, 'crop': list(bounds), 'size': list(result.size), 'transparentFraction': round(alpha.histogram()[0] / (original.width * original.height), 4)})
        if entry['key'] == 'a_doors':
            for side, span in [('left', (0, result.width // 2)), ('right', (result.width // 2, result.width))]:
                half = result.crop((span[0], 0, span[1], result.height))
                padded = Image.new('RGBA', (half.width + 8, half.height + 8))
                padded.paste(half, (4, 4))
                door = target.with_name('door_' + side + '.png')
                padded.save(door)
                report.append({'key': 'a_door_' + side, 'target': door.relative_to(ROOT).as_posix(), 'size': list(padded.size), 'sha256': hashlib.sha256(door.read_bytes()).hexdigest(), 'sliceX': list(span)})
    return report

if __name__ == '__main__':
    entries = json.loads(RECIPE.read_text(encoding='utf-8'))
    report = prepare(entries)
    Path(__file__).with_name('parts-report.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(report, indent=2))
