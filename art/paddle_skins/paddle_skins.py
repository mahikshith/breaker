"""Hero paddle skins (Kit, Lumi) sliced into the same three parts as the chrome paddle (paddle_l/m/r), so any level
can switch skin without new draw code. Run from repo root with bpy 5.2: python art/paddle_skins/paddle_skins.py
"""
from pathlib import Path
import sys, json, hashlib
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'art')); sys.path.insert(0, str(ROOT / 'art' / 'power_icons'))
import render_vault_assets as rig
from power_icons import M
import bpy
from PIL import Image, ImageDraw
import numpy as np

HERE = Path(__file__).resolve().parent
OUT = ROOT / 'assets' / 'paddle-skins'
PROOF = HERE / 'proof'
for d in (OUT, PROOF, HERE / 'source'): d.mkdir(parents=True, exist_ok=True)
rig.TMP = str(HERE / 'source')
U, PPU, MARGIN = rig.U, 3, 4
LEN, H = 100, 12  # rendered paddle in game units; the middle is uniform so it stretches to any width

SKINS = {  # body, caps, stripe; built after the scene reset, which clears materials
    'kit': lambda: (M('kit_enamel', '#2f6fd8', .16, 0, 1), M('kit_steel', '#dfe6f4', .2, .6, .8), M('kit_stripe', '#ffc94a', .2, .6, .7)),
    'lumi': lambda: (M('lumi_pearl', '#ff79b4', .14, .1, 1, emit='#ff5fa2', strength=.12), M('lumi_gold', '#ffcf6a', .2, .6, .8), M('lumi_stripe', '#fff1f8', .18, .2, .9)),
}


def build(body, caps, stripe):
    objs = [rig.capsule('body', LEN * U, H / 2 * U, rig.at(y=-1.0), body)]
    for s in (-1, 1):  # end caps: a short, slightly fatter capsule over each tip
        objs.append(rig.capsule(f'cap{s}', 14 * U, (H / 2 + .35) * U, rig.at(s * (LEN / 2 - 7) * U, 0, -1.0), caps))
    # Pinstripe along the face, stopping at the caps so the middle slice stays uniform.
    bpy.ops.mesh.primitive_cylinder_add(radius=.55 * U, depth=(LEN - 28) * U, vertices=24, rotation=(0, 1.5708, 0))
    o = bpy.context.object; bpy.ops.object.shade_smooth(); o.data.materials.append(stripe)
    o.location = rig.at(0, -.5 * U, -1.0 - H / 2 * U + .1 * U); objs.append(o)
    return objs


def main():
    sc = rig.reset(); sc.cycles.seed = 23
    w, h = LEN + 2 * MARGIN, H + 2 * MARGIN
    skins = {}
    for key, mats in SKINS.items():
        for o in list(bpy.context.scene.objects):
            if o.type in ('MESH', 'CURVE') and o.name != 'softbox': bpy.data.objects.remove(o, do_unlink=True)
        objs = build(*mats()); rig.only(objs)
        full = HERE / 'source' / f'{key}_full.png'
        rig.frame(sc, rig.P0[0] - w / 2, rig.P0[1] - h / 2, w, h, PPU, str(full), True, 48)
        im = Image.open(full).convert('RGBA'); a = np.asarray(im).copy(); a[a[:, :, 3] == 0, :3] = 0; im = Image.fromarray(a)
        cut = 16 * PPU  # arena draws 16-unit end parts (4 margin + 12 cap) and stretches the middle
        mid0 = im.width // 2 - cut // 2
        parts = {'l': im.crop((0, 0, cut, im.height)), 'm': im.crop((mid0, 0, mid0 + cut, im.height)), 'r': im.crop((im.width - cut, 0, im.width, im.height))}
        skins[key] = {}
        for part, pim in parts.items():
            path = OUT / f'{key}_{part}.png'; pim.save(path, optimize=True)
            skins[key][part] = {'path': path.relative_to(ROOT).as_posix(), 'px': list(pim.size), 'drawSize': [16, h],
                                'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'encodedBytes': path.stat().st_size}
    (OUT / 'skins-manifest.json').write_text(json.dumps({'version': 1, 'source': 'art/paddle_skins/paddle_skins.py', 'rig': 'art/render_vault_assets.py',
        'scope': 'Same slicing contract as SPR.paddle_l/m/r: draw l at x-4, m stretched from x+12 to x+w-12, r at x+w-12; all 16x20 units at y-4.',
        'skins': skins}, indent=2) + '\n')
    # Proof: each skin assembled at three widths on the dark floor colour.
    sheet = Image.new('RGBA', (560, 200), (20, 18, 30, 255)); d = ImageDraw.Draw(sheet)
    for row, key in enumerate(skins):
        parts = {p: Image.open(ROOT / skins[key][p]['path']).convert('RGBA') for p in 'lmr'}
        x = 10
        for width in (60, 100, 150):
            k = 1.2; pw = round(width * k); ph = round(20 * k); cap = round(16 * k)
            sheet.alpha_composite(parts['l'].resize((cap, ph), Image.Resampling.LANCZOS), (x, 20 + row * 90))
            sheet.alpha_composite(parts['m'].resize((pw - 2 * round(12 * k), ph), Image.Resampling.LANCZOS), (x + cap, 20 + row * 90))
            sheet.alpha_composite(parts['r'].resize((cap, ph), Image.Resampling.LANCZOS), (x + cap + pw - 2 * round(12 * k), 20 + row * 90))
            x += pw + 40
        d.text((10, 5 + row * 90), key, fill=(230, 220, 240, 255))
    sheet.convert('RGB').save(PROOF / 'skins.png', optimize=True)
    print(json.dumps({'skins': list(skins), 'bytes': sum(p['encodedBytes'] for s in skins.values() for p in s.values())}), flush=True)


if __name__ == '__main__': main()
