"""Shared counter gems and breakage pieces, replacing code-drawn rings and dots in every level.
Pips: one iron socket with an empty or lit gem (streak counters, health, charge). Breakage: stone chips and a gold
spark streak for structural crashes; single bricks still vanish quietly (owner rule).
Run from repo root with bpy 5.2: python art/fx_kit/fx_kit.py
"""
from pathlib import Path
import sys, json, hashlib, math
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'art')); sys.path.insert(0, str(ROOT / 'art' / 'power_icons'))
import render_vault_assets as rig
import power_icons as pi
from power_icons import M, slab, sphere, torus, ring_pts, clean
import bpy
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
OUT = ROOT / 'assets' / 'fx-kit'
PROOF = HERE / 'proof'
for d in (OUT, PROOF, HERE / 'source'): d.mkdir(parents=True, exist_ok=True)
rig.TMP = str(HERE / 'source')
PPU = 6  # small parts render at double density so they stay crisp on 3x phones


def socket():
    iron, rim = M('socket_iron', '#3b4150', .3, .6, .5), M('socket_rim', '#b9a27a', .26, .55, .6)
    return [torus('socket', 2.9, .75, iron, y=-1.0, tilt=(math.pi / 2, 0, 0)), torus('rim', 3.55, .28, rim, y=-1.1, tilt=(math.pi / 2, 0, 0))]


def gem(hexc, glow, strength):
    m = M('gem_' + hexc, hexc, .08, 0, 1, emit=glow, strength=strength)
    return [slab('gem', ring_pts(2.35, 8)[:-1], 1.6, m, y=-1.6, bevel=.35, segs=1)]


def chip(seed):
    stone = rig.noisy(M('chip_stone', '#8b8478', .7, 0, .2), scale=9, amount=.35, bump=.3)
    pts = [((2.2 + .9 * math.sin(seed * 3.1 + i * 1.7)) * math.cos(i * math.pi / 3.5), (1.7 + .8 * math.cos(seed * 2.3 + i * 2.1)) * math.sin(i * math.pi / 3.5)) for i in range(7)]
    o = slab(f'chip{seed}', pts, 1.8, stone, y=-1.0, bevel=.18, segs=2)
    o.rotation_euler[0] = .35 * seed; o.rotation_euler[2] = .25 * seed
    return [o]


def spark():
    m = M('spark', '#ffb43a', .2, 0, 0, emit='#ff9a1f', strength=3)
    return [slab('streak', [(-6, 0), (-1, -.9), (6, 0), (-1, .9)], .6, m, y=-1.2, bevel=.25, segs=2)]


def arrow():  # Kit's arrow in flight, tip up: same steel bodkin, wood and coral fletching as the Arrows icon
    wood, steel, fletch = M('shaft', '#c08a5a', .4, 0, .5), M('bodkin', '#eef2fb', .22, .55, .8), M('fletch', '#ff6f61', .3, 0, .8)
    return [pi.rod('shaft', 19, .55, wood, 0, -1, -1.5), pi.cone('head', 1.9, 5, steel, 0, 9.5, -1.5, verts=4),
            slab('fl_a', [(0, 0), (2.2, -1.4), (2.2, -4.8), (0, -3.4)], .4, fletch, .4, -7.6, -1.55, bevel=.03),
            slab('fl_b', [(0, 0), (-2.2, -1.4), (-2.2, -4.8), (0, -3.4)], .4, fletch, -.4, -7.6, -1.55, bevel=.03)]


def bow():  # recurve bow aimed up: grip in front, limbs sweeping back to gold tips, string behind
    wood, leather = M('bow_wood', '#9b6a45', .38, 0, .6), M('grip', '#4a2f2a', .55, 0, .3)
    gold, string = M('tip_gold', '#ffc94a', .22, .6, .7), M('string', '#efe6d2', .5, 0, .2)
    cu = bpy.data.curves.new('limbs', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = .62 * rig.U; cu.bevel_resolution = 4
    sp = cu.splines.new('POLY'); pts = [i / 20 for i in range(-20, 21)]; sp.points.add(len(pts) - 1)
    for p, t in zip(sp.points, pts): p.co = (18 * t * rig.U, 0, (2 - 5 * t * t + 1.2 * max(0, abs(t) - .8) / .2) * rig.U, 1)
    limbs = bpy.data.objects.new('limbs', cu); bpy.context.collection.objects.link(limbs); cu.materials.append(wood)
    limbs.location = rig.at(0, 0, -1.2)
    objs = [limbs, pi.rod('grip', 5, .95, leather, 0, 2, -1.5, rot=math.pi / 2), pi.rod('string', 34.6, .16, string, 0, -1.8, -1.0, rot=math.pi / 2)]
    return objs + [sphere(f'tip{s}', .8, gold, s * 18, -1.8, -1.3) for s in (-1, 1)]


PARTS = {  # id -> (builder, frame units w, h, use)
    'arrow': (arrow, 8, 28, 'Kit arrow projectile, tip up; rotate along travel'),
    'bow': (bow, 42, 14, 'paddle-mounted bow while Arrows is active'),
    'pip_empty': (lambda: socket() + gem('#1a1f2b', '#000000', 0), 9, 9, 'counter socket, unlit'),
    'pip_gold': (lambda: socket() + gem('#ffb21f', '#ff9a10', .7), 9, 9, 'counter lit: streak, health, charge'),
    'pip_blue': (lambda: socket() + gem('#2f7cf0', '#3f8cff', .6), 9, 9, 'Kit-themed lit counter'),
    'pip_rose': (lambda: socket() + gem('#f0468f', '#ff4f97', .6), 9, 9, 'Lumi-themed lit counter'),
    'chip_a': (lambda: chip(1), 8, 8, 'stone chip for structural crashes'),
    'chip_b': (lambda: chip(2), 8, 8, 'stone chip variant'),
    'chip_c': (lambda: chip(3), 8, 8, 'stone chip variant'),
    'spark': (spark, 15, 5, 'gold spark streak; rotate along travel'),
}


def main():
    sc = rig.reset(); sc.cycles.seed = 17
    parts = {}
    for key, (build, w, h, use) in PARTS.items():
        for o in list(bpy.context.scene.objects):
            if o.type in ('MESH', 'CURVE') and o.name != 'softbox': bpy.data.objects.remove(o, do_unlink=True)
        objs = build(); rig.only(objs)
        path = OUT / f'{key}.png'
        rig.frame(sc, rig.P0[0] - w / 2, rig.P0[1] - h / 2, w, h, PPU, str(path), True, 48)
        im, _ = clean(path)
        parts[key] = {'path': path.relative_to(ROOT).as_posix(), 'use': use, 'px': list(im.size), 'ppu': PPU, 'drawSize': [w, h],
                      'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'encodedBytes': path.stat().st_size}
    (OUT / 'fx-manifest.json').write_text(json.dumps({'version': 1, 'source': 'art/fx_kit/fx_kit.py', 'rig': 'art/render_vault_assets.py',
        'scope': 'Shared counter gems and crash pieces. Draw at drawSize (game units), centred.', 'parts': parts}, indent=2) + '\n')
    sheet = Image.new('RGBA', (len(parts) * 110, 150), (29, 26, 43, 255)); d = ImageDraw.Draw(sheet)
    for i, (key, item) in enumerate(parts.items()):
        im = Image.open(ROOT / item['path']).convert('RGBA'); x = 10 + i * 110
        sheet.alpha_composite(im.resize((im.width * 90 // max(im.size), im.height * 90 // max(im.size)), Image.Resampling.LANCZOS), (x, 10))
        sheet.alpha_composite(im.resize((max(1, item['drawSize'][0] * 2), max(1, item['drawSize'][1] * 2)), Image.Resampling.LANCZOS), (x + 40, 108))
        d.text((x, 132), key, fill=(230, 220, 240, 255))
    sheet.convert('RGB').save(PROOF / 'fx.png', optimize=True)
    print(json.dumps({'parts': len(parts), 'bytes': sum(v['encodedBytes'] for v in parts.values())}), flush=True)


if __name__ == '__main__': main()
