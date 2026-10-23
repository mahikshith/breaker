"""Reskin the emerald serpent sprites by hue remapping (same frames, expressions and anchors).
python tools/recolor_serpent.py ember   -> assets/snake-ember
Greens/teals become fire (crimson shadows, orange mid, gold highlights); pink brows become gold."""
import json, os, sys
import numpy as np
from PIL import Image

SKINS = {'ember': {'scales': (6, 18, 36), 'brow': 44, 'colors': {'body': '#b8301a', 'belly': '#ffc46b', 'crown': '#5c1209', 'outline': '#220604', 'mark': '#ff9d2e', 'brow': '#ffcf3f'}}}


def remap(im, skin):
    a = np.asarray(im.convert('RGBA')).astype(np.float32) / 255
    hsv = np.asarray(Image.fromarray(np.uint8(a[..., :3] * 255)).convert('HSV')).astype(np.float32) / 255
    h, s, v = hsv[..., 0] * 360, hsv[..., 1], hsv[..., 2]
    dark, mid, bright = skin['scales']
    scales = (h > 55) & (h < 235) & (s > .12)
    tone = np.where(v < .42, dark, np.where(v < .72, mid, bright))
    brow = ((h > 320) | (h < 8)) & (s > .3) & (v > .55)
    h2 = np.where(scales, tone, np.where(brow, skin['brow'], h))
    s2 = np.where(scales, np.clip(s * 1.25 + .1, 0, 1), s)
    out = Image.merge('HSV', [Image.fromarray(np.uint8(np.clip(x, 0, 1) * 255)) for x in (h2 / 360, s2, v)]).convert('RGB')
    o = np.concatenate([np.asarray(out).astype(np.float32) / 255, a[..., 3:]], -1)
    o[o[..., 3] == 0, :3] = 0
    return Image.fromarray(np.uint8(np.round(o * 255)), 'RGBA')


def main(name):
    skin, src, dst = SKINS[name], 'assets/snake-emerald', f'assets/snake-{name}'
    os.makedirs(dst, exist_ok=True)
    for f in sorted(os.listdir(src)):
        if f.endswith('.png'): remap(Image.open(f'{src}/{f}'), skin).save(f'{dst}/{f}', optimize=True)
    meta = json.load(open(f'{src}/meta.json', encoding='utf-8'))
    meta.update(palette=name, colors={**meta.get('colors', {}), **skin['colors']}, derived=f'snake-emerald hue-remapped by tools/recolor_serpent.py {name}')
    json.dump(meta, open(f'{dst}/meta.json', 'w', encoding='utf-8'), indent=2)
    if os.path.exists(f'{src}/manifest.json'):
        json.dump(json.load(open(f'{src}/manifest.json', encoding='utf-8')), open(f'{dst}/manifest.json', 'w', encoding='utf-8'), indent=2)


if __name__ == '__main__': main(sys.argv[1] if len(sys.argv) > 1 else 'ember')
