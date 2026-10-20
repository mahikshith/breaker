from pathlib import Path
import hashlib
import json
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).parent
ASSETS = ROOT/'assets/starflight-v2'
manifest = json.loads((ASSETS/'manifest.json').read_text())
font = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 17)
small = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 13)
proof = Image.new('RGB', (865, 1004), '#171a23')
draw = ImageDraw.Draw(proof)
draw.text((24, 12), 'STARFLIGHT / NEW ENEMY FAMILY', font=font, fill='#edf0f7')
draw.text((24, 38), 'Native-size extraction composition. Staged artwork proof; no gameplay or balance claim.', font=small, fill='#a9b0c0')
checks = {'type': 'staged native-scale extraction proof, not gameplay', 'hardpoints': {}, 'sourceMetadata': Image.open(ROOT/manifest['source']).info}


def sprite(screen, name, x, y, width, alpha=1):
    family = manifest['ships'] if name in manifest['ships'] else manifest['environment']
    part = family[name]
    image = Image.open(ROOT/part['path']).convert('RGBA')
    scale = screen.width/360
    size = (round(width*scale), round(width*scale*image.height/image.width))
    image = image.resize(size, Image.Resampling.LANCZOS)
    if alpha < 1:
        image.putalpha(image.getchannel('A').point(lambda p: round(p*alpha)))
    screen.alpha_composite(image, (round(x*scale-size[0]/2), round(y*scale-size[1]/2)))


for x0, width, height, name in [(24, 393, 852, '393 × 852'), (437, 412, 915, '412 × 915')]:
    background = Image.open(ROOT/'assets/starflight/background.png').convert('RGBA')
    background = background.resize((width, round(background.height*width/background.width)), Image.Resampling.LANCZOS)
    screen = Image.new('RGBA', (width, height), '#03040a')
    for offset in range(0, height, background.height):
        screen.alpha_composite(background, (0, offset))
    sprite(screen, 'crescent', 180, 121, 236)
    sprite(screen, 'frigate', 92, 293, 88)
    sprite(screen, 'beetle', 264, 291, 49)
    sprite(screen, 'gravity', 92, 449, 160, .48)
    sprite(screen, 'wormhole', 267, 473, 136, .48)
    sprite(screen, 'asteroid', 173, 375, 52)
    sprite(screen, 'asteroid', 64, 620, 40)
    sprite(screen, 'asteroid', 263, 642, 32)
    proof.paste(screen.convert('RGB'), (x0, 67))
    draw.text((x0+9, 73), name, font=small, fill='#a9b0c0')

for name, part in manifest['ships'].items():
    image = Image.open(ROOT/part['path'])
    checks['hardpoints'][name] = {}
    for kind in ['muzzles', 'engines']:
        values = []
        for u, v in part[kind]:
            x, y = round(u*image.width), round(v*image.height)
            values.append({'uv': [u, v], 'pixel': [x, y], 'alpha': image.getpixel((x, y))[3]})
        assert all(p['alpha'] >= 128 for p in values), (name, kind, values)
        checks['hardpoints'][name][kind] = values

proof.save(HERE/'native-extraction-proof.png')
checks['proofSHA256'] = hashlib.sha256((HERE/'native-extraction-proof.png').read_bytes()).hexdigest()
(HERE/'native-checks.json').write_text(json.dumps(checks, indent=2)+'\n')
print(json.dumps({'proof': 'art/starflight-v2/native-extraction-proof.png', 'checks': checks}))
