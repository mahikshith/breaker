"""Frost Warden atlas from the M365 round-3 frames (assets/round3/warden, cut by art/round3/cut.py).
Same contract as the old rig atlas: 256x228 px cells, unit [144,128] world units, feet pivot [0.5, 0.90625],
7 columns, numeric clip frames, and per-frame anchors measured from each frame's own alpha so the ball
collides with what is drawn. Row 5 adds the dash moves (crouch, smash, dazed) and a defeated slump.
Run from repo root: python art/round3/build_warden_atlas.py [frames_dir] [out_dir]
Any brute (bull, bison, ape...) drawn with the same frame names reuses the Warden physics: point it at that folder.
"""
from pathlib import Path
import hashlib, json, sys
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / (sys.argv[1] if len(sys.argv) > 1 else 'assets/round3/warden')
OUT = ROOT / (sys.argv[2] if len(sys.argv) > 2 else 'assets/frost-warden')
CELL, UNIT, PIVOT, COLS = (256, 228), (144, 128), (0.5, 0.90625), 7
PPU = CELL[0] / UNIT[0]          # pixels per world unit inside a cell
SCALE = 0.5                      # one scale for every frame: the tallest pose (pound windup) still fits the cell
SLOTS = (['idle_0', 'idle_1', 'idle_2', 'idle_3'] + ['dash_r_0', 'dash_r_1', 'dash_r_2', 'dash_r_3']
         + ['idle_3', 'pound_windup', 'pound_windup', 'pound_windup'] + ['pound_windup', 'pound_strike', 'pound_strike', 'pound_strike']
         + ['pound_recover', 'pound_recover', 'recover', 'idle_0'] + ['flinch', 'dazed', 'dazed', 'recover']
         + ['idle_0', 'dash_r_2', 'dash_r_2', 'idle_0']
         + ['dash_r_crouch', 'smash_r', 'dazed_r', 'defeated', 'dash_l_crouch', 'smash_l', 'dazed_l'])
CLIPS = {'idle': ([0, 1, 2, 3], 6, True), 'walk': ([4, 5, 6, 7], 10, True), 'windup': ([8, 9, 10, 11], 10, False),
         'strike': ([12, 13, 14, 15], 12, False), 'recover': ([16, 17, 18, 19], 10, False), 'hurt': ([20, 21, 22, 23], 10, False),
         'victory': ([24, 25, 26, 27], 8, False), 'crouch': ([28], 1, False), 'dash': ([4, 5, 6, 7], 14, True),
         'smash': ([29], 1, False), 'dazed': ([30], 1, False), 'defeated': ([31], 1, False)}


def anchors(a, ox, oy):
    """a: alpha array of the placed frame in cell pixels; (ox, oy) feet pivot in cell pixels. World units, y down."""
    w = lambda px: (px - ox) / PPU
    h = lambda py: (py - oy) / PPU
    solid = a >= 192
    ys, xs = np.nonzero(solid)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    shapes, step = [], max(1, round(6 * PPU))
    for top in range(y0, y1 + 1, step):
        band = solid[top:top + step]
        cols = np.nonzero(band.sum(0) >= band.shape[0] * .5)[0]
        if len(cols) == 0: continue
        runs = np.split(cols, np.nonzero(np.diff(cols) > 1)[0] + 1)   # largest contiguous run: no gaps between fists
        run = max(runs, key=len)
        if len(run) * 1.0 / PPU < 2: continue
        shapes.append({'x': w(run[0]), 'y': h(top), 'w': (run[-1] - run[0] + 1) / PPU, 'h': band.shape[0] / PPU})
    def hand(side):  # extreme lower blob on one side: pixels within 14 units of that edge, in the lower 70%
        lo = y0 + (y1 - y0) * .3
        sel = (ys >= lo) & ((xs >= x1 - 14 * PPU) if side == 'R' else (xs <= x0 + 14 * PPU))
        cx, cy = xs[sel].mean(), ys[sel].mean()
        return {'x': w(cx), 'y': h(cy), 'r': 9.0}
    R, L = hand('R'), hand('L')
    reach = {'x': w(x1) - 9, 'y': R['y'], 'r': 9.0}           # forward fist touches the rightmost drawn pixel
    bw, bh = (x1 - x0) * .42, (y1 - y0) * .5
    body = {'x': w((x0 + x1) / 2 - bw / 2), 'y': h(y0 + (y1 - y0) * .22), 'w': bw / PPU, 'h': bh / PPU}
    return {'fist': reach, 'hands': {'R': R, 'L': L}, 'body': body, 'bodyShapes': shapes,
            'alphaBounds': [int(x0), int(y0), int(x1), int(y1)]}


def main():
    rows = -(-len(SLOTS) // COLS)
    atlas = Image.new('RGBA', (CELL[0] * COLS, CELL[1] * rows))
    meta = json.loads((SRC / 'manifest.json').read_text(encoding='utf-8'))['frames']
    ox, oy = CELL[0] * PIVOT[0], CELL[1] * PIVOT[1]
    out = []
    for i, name in enumerate(SLOTS):
        im = Image.open(SRC / meta[name]['file']).convert('RGBA')
        px, py = meta[name]['pivot']
        im = im.resize((round(im.width * SCALE), round(im.height * SCALE)), Image.Resampling.LANCZOS)
        px, py = px * SCALE, py * SCALE
        cell = Image.new('RGBA', CELL)
        cell.alpha_composite(im, (round(ox - px), round(oy - py)))
        a = np.asarray(cell)[:, :, 3]
        bb = cell.getchannel('A').getbbox()
        assert bb and bb[0] > 0 and bb[1] > 0 and bb[2] < CELL[0] and bb[3] < CELL[1], f'{name} clipped in cell: {bb}'
        atlas.alpha_composite(cell, (i % COLS * CELL[0], i // COLS * CELL[1]))
        out.append({'index': i, 'file': meta[name]['file'], 'clip': next((k for k, (f, _, _) in CLIPS.items() if i in f), None), **anchors(a, ox, oy)})
    px = np.asarray(atlas).copy(); px[px[:, :, 3] == 0, :3] = 0; atlas = Image.fromarray(px)
    path = OUT / 'warden.png'; atlas.save(path, optimize=True)
    OUT.mkdir(parents=True, exist_ok=True)
    old = json.loads((OUT / 'manifest.json').read_text(encoding='utf-8')) if (OUT / 'manifest.json').exists() else {}
    manifest = {'unit': list(UNIT), 'pivot': list(PIVOT), 'nativeHeight': 72, 'forward': 'right', 'forwardHand': 'R',
                'anchorSpace': 'world units relative to feet pivot; x right, y down',
                'clips': {k: {'frames': f, 'n': len(f), 'start': f[0], 'fps': fps, 'loop': loop} for k, (f, fps, loop) in CLIPS.items()},
                'source': SRC.relative_to(ROOT).as_posix(), 'derivedScript': 'art/round3/build_warden_atlas.py',
                'atlas': path.relative_to(ROOT).as_posix(), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
                'cell': list(CELL), 'columns': COLS, 'rows': rows, 'size': list(atlas.size), 'anchors': out,
                'frames': [{'index': i, 'file': meta[n]['file']} for i, n in enumerate(SLOTS)],
                'palette': old.get('palette'), 'collision': 'Per-frame alpha>=192 contiguous bands (6 units), forward fist at the rightmost drawn pixel, conservative torso box',
                'provenance': {'previous': 'art/frost-warden rig render (Yeti.gltf via art/brum.py)', 'replacedBy': 'M365 round-3 Warden redesign'}}
    (OUT / 'manifest.json').write_text(json.dumps(manifest, indent=1) + '\n', encoding='utf-8')
    print(json.dumps({'frames': len(out), 'atlas': atlas.size, 'bytes': path.stat().st_size}))


if __name__ == '__main__': main()
