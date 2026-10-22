# Lumi paddle skin: the shared Vault chrome paddle (art/render_vault_assets.py build_paddle) re-rendered with a
# pink chrome shell and a warm rose-gold inlay. Same capsule, camera, lights, margin, cap/mid split and sizes as
# assets/vault/paddle_{l,m,r}.png, so the three PNGs are a drop-in swap (same px sizes, anchors, alpha footprint).
# Run from repo root:  python3 art/lumi_paddle.py [out_dir=assets/princess/paddle] [--stock]   (--stock = original colours, for QA)
import sys, os
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
args = [a for a in sys.argv[1:] if not a.startswith('--')]
STOCK = '--stock' in sys.argv
OUT = os.path.abspath(args[0]) if args else os.path.join(HERE, '..', 'assets', 'princess', 'paddle')
import render_vault_assets as R
import bpy
from PIL import Image

SHELL = (0.9, 0.91, 0.94) if STOCK else R.srgb('#ff86b8')      # chrome shell (vault: cool silver)
INLAY = R.srgb('#ffc94a') if STOCK else R.srgb('#ffc933')       # inlay strip (vault: gold)
GROOVE = (0.03, 0.03, 0.045) if STOCK else (0.09, 0.03, 0.05)    # dark groove around the inlay

def build_paddle():
    m, nt = R.layered('paddle', None)
    tc = R.node(nt, 'ShaderNodeTexCoord'); sep = R.node(nt, 'ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['Object'], sep.inputs['Vector'])
    dist = R.strip_mask(nt, sep.outputs['X'], sep.outputs['Z'], 3.27, 0.17)
    gold = R.maprange(nt, dist, 0.008, -0.008)
    groove = R.mth(nt, 'MULTIPLY', R.maprange(nt, dist, -0.006, 0.006), R.maprange(nt, dist, 0.04, 0.055, 1, 0))
    sh = R.principled(nt, SHELL, 0.06, 1.0)
    sh = R.mixs(nt, gold, sh, R.principled(nt, INLAY, 0.13, 1.0))
    sh = R.mixs(nt, groove, sh, R.principled(nt, GROOVE, 0.45, 1.0))
    nt.links.new(sh, nt.nodes['Material Output'].inputs['Surface'])
    return [R.capsule('paddle', 7.4, 0.6, R.at(y=-R.DEPTH - 0.6), m), R.ball_env('paddleenv')]

os.makedirs(OUT, exist_ok=True)
sc = R.reset()
objs = build_paddle()
w, h = 74 + 2 * R.MARGIN, 12 + 2 * R.MARGIN
raw = os.path.join(OUT, '_raw.png')
R.frame(sc, R.P0[0] - w / 2, R.P0[1] - h / 2, w, h, R.SPR_PPU, raw, True, 64)
# slice exactly as art/vault_post.py: left cap = margin + 12 units, middle = 50 units, right cap = 12 units + margin
im = Image.open(raw).convert('RGBA'); os.remove(raw)
assert im.size == (w * R.SPR_PPU, h * R.SPR_PPU), im.size
l = (R.MARGIN + 12) * R.SPR_PPU; mid = 50 * R.SPR_PPU
for n, part in {'paddle_l': im.crop((0, 0, l, im.size[1])), 'paddle_m': im.crop((l, 0, l + mid, im.size[1])),
                'paddle_r': im.crop((l + mid, 0, im.size[0], im.size[1]))}.items():
    clean = Image.frombytes('RGBA', part.size, part.tobytes())   # fresh image: no PNG text/info chunks
    clean.save(os.path.join(OUT, n + '.png'), optimize=True)
print('wrote', OUT)
