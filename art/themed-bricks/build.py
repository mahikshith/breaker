"""Themed bricks: the glaze-v2 brick sheet (art/glaze2/source/bricks.png) re-glazed per princess chapter, the way
art/tidewheel-glaze/build.py made the Tidewheel sea set. One shared builder, one material recipe per chapter.

Every material is a luminance gradient map of the source's own frames (so the bevel, glaze band, star glint and crack
lines keep their light), plus that material's own details: rime and frost feathers, gilded enamel edges, verdigris and
forge-hot cracks, stone mottling, lit runes, serpent scales, moonstone sheen. States: 0 intact, 1 cracked, 2 breaking.
Every set also has a themed unbreakable bar with a polished glint stripe, at 1-cell (square) and 2-cell widths.

Output: assets/themed-bricks/<chapter>/<material>_<cells>_<state>.png and atlas.json (sprites plus a small FX palette per
material for the runtime break spray). Same ppu (3), margin (4 units) and lower-right contact shadow as glaze v2.
Run: python3 art/themed-bricks/build.py [chapter ...]
"""
import json, math, os, random, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'art', 'glaze2', 'source')
OUT = os.path.join(ROOT, 'assets', 'themed-bricks')
PPU, MARGIN, SS = 3, 4, 4          # shipped pixels per unit, transparent margin (units), supersample while building
STATES = {0: 'intact', 1: 'cracked', 2: 'breaking'}

sheet = Image.open(os.path.join(SRC, 'bricks.png')).convert('RGBA')
frames = {k[:-4]: v['frame'] for k, v in json.load(open(os.path.join(SRC, 'bricks.json')))['frames'].items()}
def frame(name):
    f = frames[name]; return sheet.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))

def hexc(h): return [int(h[i:i + 2], 16) for i in (1, 3, 5)]
def ramp_lut(stops):
    xs = np.array([s for s, _ in stops]); cs = np.array([hexc(c) for _, c in stops], float)
    t = np.linspace(0, 1, 256); return np.stack([np.interp(t, xs, cs[:, i]) for i in range(3)], 1)
def gmap(n, stops): return ramp_lut(stops)[np.clip((n * 255).astype(int), 0, 255)]
def ramp7(c0, c1, c2, c3, c4, c5, c6='#ffffff'):
    return [(0, c0), (.22, c1), (.42, c2), (.58, c3), (.74, c4), (.88, c5), (1, c6)]
def lum(a): return .299 * a[..., 0] + .587 * a[..., 1] + .114 * a[..., 2]
def norm_lum(L):
    """Source luminance mapped so the body sits near .55, cracks near 0 and the star glint at 1 (as tidewheel-glaze)."""
    lo, mid, hi = 22.0, 133.0, 244.0
    return np.clip(np.where(L < mid, .55 * (L - lo) / (mid - lo), .55 + .45 * (L - mid) / (hi - mid)), 0, 1)
def smooth(e0, e1, x): t = np.clip((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t)
def blur(a, r):
    if r <= 0: return a
    im = Image.fromarray(np.clip(a * 255, 0, 255).astype(np.uint8)); return np.asarray(im.filter(ImageFilter.GaussianBlur(r))).astype(float) / 255
def noise(shape, scale, rng, octaves=3):
    """Seeded value noise in 0..1 (bicubic-upsampled random grids, summed over octaves)."""
    H, W = shape; acc = np.zeros(shape); amp, tot = 1.0, 0.0
    for o in range(octaves):
        gh, gw = max(2, int(H / scale * 2 ** o) + 2), max(2, int(W / scale * 2 ** o) + 2)
        g = Image.fromarray((rng.random((gh, gw)) * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)
        acc += amp * np.asarray(g).astype(float) / 255; tot += amp; amp *= .5
    acc /= tot; return (acc - acc.min()) / max(1e-6, acc.max() - acc.min())
def soft_ellipse(size, box, fill, r):
    im = Image.new('RGBA', size); ImageDraw.Draw(im).ellipse(box, fill=fill)
    return im.filter(ImageFilter.GaussianBlur(r)) if r else im
def layer_from(rgb, a):
    return Image.fromarray(np.dstack([np.clip(rgb, 0, 255), np.clip(a, 0, 255)]).astype(np.uint8), 'RGBA')
def over(dst, rgb, a):
    """Composite a colour (array or triple) at per-pixel strength a (0..1) over an rgb array."""
    return dst * (1 - a[..., None]) + np.asarray(rgb, float) * a[..., None]

def fit(im, cells, W, H):
    """The 2:1 source frame on the footprint; a one-cell brick keeps both end caps and drops the middle (as glaze v2)."""
    if cells == 2: return im.resize((W, H), Image.LANCZOS)
    full = im.resize((2 * W, H), Image.LANCZOS); half = W // 2; sq = Image.new('RGBA', (W, H))
    sq.paste(full.crop((0, 0, half, H)), (0, 0)); sq.paste(full.crop((full.width - (W - half), 0, full.width, H)), (half, 0)); return sq

class Face:
    """One brick face at SS x the shipped pixels: source alpha, normalised luminance, the intact hull, crack and gap masks."""
    def __init__(self, src, state, cells, foot, seed):
        self.W, self.H = foot[0] * PPU * SS, foot[1] * PPU * SS; self.state, self.cells, self.foot = state, cells, foot
        self.rng = random.Random(seed); self.nrng = np.random.default_rng(seed)
        load = lambda name: np.asarray(fit(frame(name), cells, self.W, self.H)).astype(float)
        a = load(f'{src}-{STATES[state]}'); base = load(f'{src}-intact') if state else a
        self.alpha = a[..., 3]; self.hull = base[..., 3] / 255; self.n = norm_lum(lum(a)); self.L0 = norm_lum(lum(base))
        yy, xx = np.mgrid[0:self.H, 0:self.W]; self.yy, self.xx = yy / self.H, xx / self.W
        self.solid = (self.alpha > 128).astype(float)
        self.depth = blur(self.hull, self.H * .07) * self.hull                    # ~.5 at the rim, 1 deep inside
        self.edge = np.clip((1 - self.depth) * 2.2, 0, 1) * (self.hull > .5)       # the bevel ring
        self.body = (self.n > .25) & (self.n < .8) & (self.depth > .85)
        self.crack = np.zeros_like(self.n); self.gap = np.zeros_like(self.n)
        if state == 1: self.crack = np.clip((np.abs(self.n - self.L0) - .06) * 5, 0, 1) * (self.depth > .7)
        if state == 2:
            self.gap = ((self.hull > .5) & (self.alpha < 100)).astype(float)
            self.crack = np.clip(blur(self.gap, SS * 1.6) * 3, 0, 1) * self.solid    # the lips of each split
    def u(self, k): return k * SS * PPU                                              # units -> work pixels

# ---------- shared material details ----------
def glint_stripe(f, rgb, strength=.55, at=.3):
    """The polished bar's glint: a soft diagonal stripe across the face with a fine second stripe beside it."""
    asp = f.W / f.H; s = f.xx * asp - f.yy * .55
    c = at * asp; w = .09
    st = np.exp(-((s - c) / w) ** 2) + .55 * np.exp(-((s - c - .2) / (w * .35)) ** 2)
    st *= f.depth > .6
    return rgb + (255 - rgb) * np.clip(st * strength, 0, 1)[..., None]
def rivets(f, layer, pts, r, metal=(150, 104, 44), light=(255, 236, 180)):
    for (px, py) in pts:
        x, y = px * f.W, py * f.H; R = f.u(r)
        layer.alpha_composite(soft_ellipse(layer.size, (x - R * 1.35, y - R * 1.3, x + R * 1.35, y + R * 1.4), (0, 0, 0, 90), SS * .9))
        layer.alpha_composite(soft_ellipse(layer.size, (x - R + SS, y - R + SS * 1.4, x + R + SS, y + R + SS * 1.4), (0, 0, 0, 150), SS * .8))
        layer.alpha_composite(soft_ellipse(layer.size, (x - R, y - R, x + R, y + R), (*metal, 255), 0))
        layer.alpha_composite(soft_ellipse(layer.size, (x - R * .7, y - R * .75, x + R * .15, y + R * .05), (*light, 220), SS * .5))
def rivet_points(f, inset=.12, rows=(.26, .74)):
    xs = (inset * f.H / f.W, 1 - inset * f.H / f.W) if f.cells == 1 else (inset * f.H / f.W * 1.1, 1 - inset * f.H / f.W * 1.1)
    return [(x, y) for x in xs for y in rows]
def sparkle(layer, x, y, r, a=230, col=(255, 255, 255)):
    """A tiny four-point star glint on the face (a lens sparkle, baked into the texture)."""
    im = Image.new('RGBA', layer.size); d = ImageDraw.Draw(im)
    d.polygon([(x - r, y), (x - r * .12, y - r * .12), (x, y - r), (x + r * .12, y - r * .12), (x + r, y), (x + r * .12, y + r * .12), (x, y + r), (x - r * .12, y + r * .12)], fill=(*col, a))
    layer.alpha_composite(im.filter(ImageFilter.GaussianBlur(r * .08)))
    layer.alpha_composite(soft_ellipse(layer.size, (x - r * .35, y - r * .35, x + r * .35, y + r * .35), (*col, a // 2), r * .2))
def emboss(f, mask, depth=.08):
    """Light from the top-left: a raised mask lifts its upper-left lip and shades its lower-right."""
    s = SS * 1.0; m = blur(mask, SS * .6)
    sh = np.roll(np.roll(m, int(s), 0), int(s), 1) - np.roll(np.roll(m, -int(s), 0), -int(s), 1)
    return -sh * depth
def forge_glow(f, rgb, over_layer, heat=1.0):
    """Forge-hot cracks: the crack (or split lips) glows orange to a pale hot core, with a soft ember halo."""
    c = f.crack
    if not c.any(): return rgb
    core = np.clip(c * 1.6, 0, 1) * np.clip(1.5 - blur(c, SS * 1.6) * 1.8, 0, 1); halo = np.clip(blur(c, SS * 2.4) * 2.2, 0, 1) * f.solid
    rgb = over(rgb, hexc('#ff6a1a'), np.clip(halo * .55 * heat, 0, 1) * np.clip(1.3 - blur(c, SS * 1.6), 0, 1))
    rgb = over(rgb, hexc('#ffb260'), np.clip(core * .9 * heat, 0, 1))
    rgb = over(rgb, hexc('#fff0d0'), np.clip((core - .55) * 2, 0, 1) * heat)
    return rgb
def rime(f, rng, amount=1.0, top=1.0):
    """Rime frost: fine crystalline crust that gathers along the rim (heaviest on the top lip and the corners)."""
    grain = noise((f.H, f.W), f.u(1.1), rng, 3); fine = noise((f.H, f.W), f.u(.35), rng, 2)
    corner = np.maximum(np.exp(-((f.xx - .0) ** 2 + (f.yy - .0) ** 2) / .05), np.exp(-((f.xx - 1) ** 2 + (f.yy - 1) ** 2) / .06))
    near = np.clip(f.edge ** 1.6 * (1.15 - .75 * f.yy) + corner * .9 + top * np.exp(-((f.yy - .1) / .08) ** 2) * .45, 0, 1)
    crust = smooth(.5, .74, grain * .62 + fine * .38 + near * .5 - .22) * near * amount
    return np.clip(crust, 0, 1) * (f.alpha > 128) * (f.n < .9), fine
def fern(layer, f, rng, x, y, ang, length, a=90, width=1.0):
    """A frost feather: a stem with short alternating barbs, drawn soft (baked into the face, not an effect)."""
    d = ImageDraw.Draw(layer); pts = [(x, y)]
    for i in range(1, 7):
        t = i / 6; ang += (rng.random() - .5) * .35; x += math.cos(ang) * length / 6; y += math.sin(ang) * length / 6; pts.append((x, y))
        for side in (-1, 1):
            b = ang + side * (.75 + rng.random() * .3); bl = length * (.16 - .1 * t)
            d.line([(x, y), (x + math.cos(b) * bl, y + math.sin(b) * bl)], fill=(245, 252, 255, int(a * .8)), width=max(1, int(SS * .55 * width)))
    d.line(pts, fill=(250, 254, 255, a), width=max(1, int(SS * .8 * width)))
def scales(f, size=2.6):
    """Overlapping serpent scales (rows offset by half a scale): a lit crown and a dark lip on each scale."""
    sw = f.u(size); sh = sw * .62
    X = f.xx * f.W; Y = f.yy * f.H
    row = np.floor(Y / sh); off = (row % 2) * sw / 2
    cx = (np.floor((X + off) / sw) + .5) * sw - off; cy = (row + 1) * sh
    dx = (X - cx) / (sw * .58); dy = (Y - cy) / (sh * 1.25)
    r = np.sqrt(dx * dx + dy * dy)
    # the scale whose lower lip is nearest dominates: shade rises up the scale, darkens at its lip
    col = np.floor((X + off) / sw); v = np.sin(row * 12.9898 + col * 78.233) * 43758.5453; v = v - np.floor(v)
    shade = np.clip(1 - r, 0, 1) * (.75 + .5 * v); lip = smooth(.78, 1.0, r) * (dy < .15)
    return shade, lip
def rune_layer(f, rng, n=2):
    """Engraved runes: angular stave glyphs as a groove mask, centred on the face."""
    m = Image.new('L', (f.W, f.H)); d = ImageDraw.Draw(m)
    gh = f.H * .5; gw = gh * .55; total = n * gw + (n - 1) * gw * .45; x0 = f.W / 2 - total / 2; y0 = f.H / 2 - gh / 2
    lw = max(1, int(SS * .8))
    for i in range(n):
        x = x0 + i * gw * 1.45; cx = x + gw / 2
        d.line([(cx, y0), (cx, y0 + gh)], fill=255, width=lw)          # stave
        kind = rng.randint(0, 4)
        if kind == 0: d.line([(cx, y0 + gh * .15), (x + gw, y0 + gh * .45)], fill=255, width=lw); d.line([(cx, y0 + gh * .45), (x + gw, y0 + gh * .75)], fill=255, width=lw)
        elif kind == 1: d.line([(x, y0 + gh * .2), (cx, y0 + gh * .5), (x + gw, y0 + gh * .2)], fill=255, width=lw)
        elif kind == 2: d.line([(cx, y0 + gh * .5), (x + gw, y0 + gh * .25), (cx, y0)], fill=255, width=lw); d.line([(cx, y0 + gh * .5), (x, y0 + gh * .8)], fill=255, width=lw)
        elif kind == 3: d.line([(x, y0 + gh * .3), (x + gw, y0 + gh * .7)], fill=255, width=lw); d.line([(x + gw, y0 + gh * .3), (x, y0 + gh * .7)], fill=255, width=lw)
        else: d.line([(cx, y0 + gh * .1), (x + gw, y0 + gh * .35), (cx, y0 + gh * .6)], fill=255, width=lw)
    return np.asarray(m).astype(float) / 255

# ---------- materials: each returns (rgb array, overlay layer) for one face ----------
def m_glaze(stops):
    def make(f):
        return gmap(f.n, stops), Image.new('RGBA', (f.W, f.H))
    return make

def m_ice(stops, bubbles=0, ferns=2):
    """Rime-frosted ice glass: the glaze map, light pooled deep in the lower body, faint refraction planes, rime crust
    on the rim, frost feathers from the corners and a few trapped air bubbles."""
    def make(f):
        rgb = gmap(f.n, stops)
        pool = np.exp(-((f.yy - .7) / .2) ** 2) * np.exp(-((f.xx - .55) / .4) ** 2) * f.body
        rgb = over(rgb, hexc(stops[4][1]), pool * .28)
        for k in range(2):                                   # refraction planes: soft bright slants inside the glass
            s = f.xx * f.W / f.H * .6 + f.yy * (1.2 - k * .5); c = .55 + k * .5 + f.rng.random() * .3
            rgb = over(rgb, (235, 250, 255), np.exp(-((s - c) / .035) ** 2) * f.body * .22)
        crust, fine = rime(f, f.nrng, 1.0)
        rgb = over(rgb, hexc('#cfe8f6'), np.clip(crust * 1.2, 0, 1) * .9)
        rgb = over(rgb, (255, 255, 255), np.clip((crust - .35) * 2, 0, 1) * smooth(.45, .8, fine) * .9)
        if f.crack.any(): rgb = over(rgb, (240, 252, 255), np.clip(f.crack * 1.3, 0, 1) * .85)
        layer = Image.new('RGBA', (f.W, f.H))
        for i in range(ferns):
            side = i % 2; x = f.W * (.03 if not side else .97); y = f.H * (.18 if not side else .8)
            fern(layer, f, f.rng, x, y, (.35 if not side else math.pi + .35) + (f.rng.random() - .5) * .3, f.W * (.16 if f.cells == 2 else .3), 80)
        for i in range(bubbles):
            x, y, r = (.25 + .55 * f.rng.random()) * f.W, (.45 + .3 * f.rng.random()) * f.H, f.u(.45 + .4 * f.rng.random())
            layer.alpha_composite(soft_ellipse(layer.size, (x - r, y - r, x + r, y + r), (210, 238, 255, 70), r * .25))
            layer.alpha_composite(soft_ellipse(layer.size, (x - r * .6, y - r * .65, x - r * .05, y - r * .15), (255, 255, 255, 220), r * .1))
        sparkle(layer, (.55 + .35 * f.rng.random()) * f.W, f.H * .14, f.u(1.1), 235)
        return rgb, layer
    return make

GOLD = ramp7('#1c0e02', '#5a3a10', '#9a6d2c', '#c99a4e', '#e9c983', '#fff1cc')
def gild(f, rgb):
    """A gilded bevel: the rim recoloured as gold through the same bevel light, with a dark seam where it meets the face."""
    band = smooth(.25, .6, f.edge) * f.solid
    rgb = over(rgb, gmap(f.n, GOLD), band)
    inner = np.exp(-((f.edge - .3) / .08) ** 2) * f.solid * (f.depth < .95)
    return rgb * (1 - .35 * inner[..., None])

def m_enamel(stops, gilt=True, diaper=True):
    """Heraldic enamel: a deep glossy tincture with a faint embossed diaper lattice, framed in a gilded bevel."""
    def make(f):
        n = f.n
        if diaper:
            asp = f.W / f.H; p = .34
            a = np.abs(((f.xx * asp + f.yy) / p) % 1 - .5); b = np.abs(((f.xx * asp - f.yy) / p) % 1 - .5)
            lattice = np.clip(1 - (.5 - np.maximum(a, b)) / .045, 0, 1) * f.body
            n = n + emboss(f, lattice, .07) - lattice * .03
        rgb = gmap(np.clip(n, 0, 1), stops)
        if gilt: rgb = gild(f, rgb)
        if f.crack.any(): rgb = over(rgb, (255, 240, 225), np.clip(f.crack, 0, 1) * .5)
        return rgb, Image.new('RGBA', (f.W, f.H))
    return make

def m_iron(stops, kind='plate', gilt=False, rivet_metal=(92, 98, 110), hot=False):
    """Iron for the armour plates and unbreakable bars. kind: plate (strap and four rivets), portcullis (slots, crossbar,
    rivets at the crossings), forge (two bronze bands), frost (rime cap and icicle nubs), vault (inset panel and rivets),
    lunar (silver with an embossed crescent moon), tower (banded stone-iron)."""
    BRONZE = ramp7('#120802', '#3d220c', '#74441c', '#a26a34', '#cf9a5c', '#f2d6a6')
    def make(f):
        n = f.n.copy(); layer = Image.new('RGBA', (f.W, f.H)); rng = f.rng
        grain = noise((f.H, f.W), f.u(.6), f.nrng, 2)
        n = n + (grain - .5) * .05 * f.body
        if kind == 'portcullis':
            asp = f.W / f.H; slots = np.zeros_like(n)
            nslot = 3 if f.cells == 2 else 1
            for i in range(nslot):
                c = (i + 1) / (nslot + 1); slots += np.exp(-((f.xx - c) * asp / .075) ** 2)
            cross = np.exp(-((f.yy - .5) / .09) ** 2)
            n = n + emboss(f, np.clip(cross, 0, 1) * (f.depth > .8), .14) - np.clip(slots, 0, 1) * (1 - cross) * .34 * (f.depth > .8)
        if kind == 'plate':
            strap = smooth(.0, .02, .09 - np.abs(f.yy - .5)) * (f.depth > .75)
            n = n + emboss(f, strap, .1) + strap * .04
        if kind == 'vault':
            inset = ((f.depth > .985)).astype(float); n = n + emboss(f, inset, -.09)
        if kind == 'lunar':   # an embossed crescent moon in the middle of the bar
            X = (f.xx - .5) * f.W / f.H; Y = f.yy - .5
            moon = (np.sqrt(X ** 2 + Y ** 2) < .27) & (np.sqrt((X - .11) ** 2 + (Y + .06) ** 2) > .23)
            n = n + emboss(f, moon.astype(float) * f.body, .12) + moon * .05
        rgb = gmap(np.clip(n, 0, 1), stops)
        if kind == 'forge':
            for c in ((.27, .73) if f.cells == 2 else (.5,)):
                bw = .06 if f.cells == 2 else .11
                band = np.clip((1 - np.abs(f.xx - c) / bw) * 6, 0, 1)
                u = np.clip((f.xx - c) / bw, -1, 1); sh = 1.15 - .4 * (u + 1) / 2 + .25 * np.exp(-((u + .45) / .18) ** 2)
                rgb = over(rgb, np.clip(gmap(f.n, BRONZE) * sh[..., None], 0, 255), band * f.solid)
        if kind != 'plate': rgb = glint_stripe(f, rgb, .5 if f.cells == 2 else .32)   # the unbreakable bars' polish
        if gilt: rgb = gild(f, rgb)
        if kind == 'frost':
            crust, fine = rime(f, f.nrng, .8, top=1.4)
            rgb = over(rgb, hexc('#d8ecf8'), np.clip(crust * 1.3, 0, 1) * .9)
            rgb = over(rgb, (255, 255, 255), np.clip((crust - .3) * 2, 0, 1) * smooth(.45, .8, fine) * .9)
        if hot: rgb = forge_glow(f, rgb, None)
        elif f.crack.any(): rgb = over(rgb, (210, 220, 230), np.clip(f.crack, 0, 1) * .45)
        # rivets
        if kind in ('plate', 'vault', 'frost', 'tower'):
            rivets(f, layer, rivet_points(f, .15), 1.25 if kind != 'vault' else 1.15, metal=(92, 98, 110) if kind != 'plate' else rivet_metal, light=(236, 242, 250))
        if kind == 'portcullis':
            nslot = 3 if f.cells == 2 else 1
            pts = [((i + 1) / (nslot + 1), .5) for i in range(nslot)] + rivet_points(f, .14, (.5,))
            rivets(f, layer, pts, 1.1, metal=(84, 88, 98), light=(228, 232, 240))
        if kind == 'forge':
            for c in ((.27, .73) if f.cells == 2 else (.5,)):
                rivets(f, layer, [(c, .24), (c, .78)], .95)
        return rgb, layer
    return make

def m_bronze(stops, patina=0.0, hammered=True):
    """Bell bronze: the glaze map over a faintly hammered face with a cast sound-bow line; patina adds verdigris crust
    in the recesses and along the rim. Cracked and breaking states glow forge-hot."""
    PATINA = ramp7('#0b2622', '#245e52', '#3f8d79', '#64b39b', '#a6dcc6', '#e2f6ec')
    def make(f):
        n = f.n.copy()
        if hammered:
            d = noise((f.H, f.W), f.u(1.3), f.nrng, 2); n = n + (d - .5) * .07 * f.body
        if f.cells == 2:
            for y in (.3, .36):
                n = n - np.exp(-((f.yy - y) / .012) ** 2) * .1 * (f.depth > .8)
        rgb = gmap(np.clip(n, 0, 1), stops)
        if patina:
            pn = noise((f.H, f.W), f.u(1.4), f.nrng, 3)
            mask = np.clip(.78 + (pn - .5) * .5 + f.edge * .15 - smooth(.66, .92, f.n) * .55, 0, 1) * patina * f.solid
            rgb = over(rgb, gmap(np.clip(f.n * .9, 0, 1), PATINA), mask)
        rgb = forge_glow(f, rgb, None)
        return rgb, Image.new('RGBA', (f.W, f.H))
    return make

def m_stone(stops, rune=None, scale_size=0.0, seedtint=None):
    """Tower stone-glaze: mottled stone fired under a clear glaze (the gloss rides over the mottling). rune: lit glyphs in
    that colour; scale_size: serpent scales instead of mottling."""
    def make(f):
        n = f.n.copy(); layer = Image.new('RGBA', (f.W, f.H))
        if scale_size:
            sh, lip = scales(f, scale_size)
            n = n + (sh - .45) * .13 * f.body - lip * .12 * (f.depth > .8)
        else:
            m1 = noise((f.H, f.W), f.u(2.2), f.nrng, 3); m2 = noise((f.H, f.W), f.u(.5), f.nrng, 2)
            n = n + ((m1 - .5) * .09 + (m2 - .5) * .04) * f.body
            pits = smooth(.86, .95, m2) * f.body; n = n - pits * .08
        rgb = gmap(np.clip(n, 0, 1), stops)
        if rune:
            g = rune_layer(f, f.rng, 2 if f.cells == 2 else 1) * f.body
            rgb = rgb * (1 - .5 * blur(g, SS * .5)[..., None])
            halo = np.clip(blur(g, SS * 2.6) * 2.2, 0, 1)
            rgb = over(rgb, hexc(rune[0]), halo * .55)
            rgb = over(rgb, hexc(rune[1]), np.clip(blur(g, SS * .35) * 1.4, 0, 1) * .9)
        if f.crack.any(): rgb = over(rgb, (255, 245, 235), np.clip(f.crack, 0, 1) * .4)
        return rgb, layer
    return make

def m_moon(stops, sheen=('#bfe0ff', '#f0d8ff'), stars=0):
    """Moonstone: milky stone with a soft blue-to-lilac adularescent sheen gliding across the upper body; stars adds a
    few tiny starlit flecks deep in the glaze."""
    def make(f):
        rgb = gmap(f.n, stops); layer = Image.new('RGBA', (f.W, f.H))
        band = np.exp(-((f.yy - .38 - .25 * (f.xx - .5)) / .16) ** 2) * f.body
        t = np.clip(f.xx, 0, 1)[..., None]
        col = np.array(hexc(sheen[0]), float) * (1 - t) + np.array(hexc(sheen[1]), float) * t
        rgb = rgb * (1 - band[..., None] * .35) + col * band[..., None] * .35
        cloud = noise((f.H, f.W), f.u(5), f.nrng, 2); rgb = over(rgb, (255, 255, 255), smooth(.35, 1, cloud) * f.body * .1)
        glow = np.exp(-((f.xx - .62) / .3) ** 2 - ((f.yy - .58) / .28) ** 2) * f.body
        rgb = over(rgb, hexc(sheen[0]), glow * .3)
        for i in range(stars):
            sparkle(layer, (.12 + .76 * f.rng.random()) * f.W, (.3 + .5 * f.rng.random()) * f.H, f.u(1.1 + .7 * f.rng.random()), 190 + f.rng.randint(0, 60), (246, 240, 255))
        if f.crack.any(): rgb = over(rgb, (250, 245, 255), np.clip(f.crack, 0, 1) * .5)
        return rgb, layer
    return make

def finish(f, rgb, layer):
    face = layer_from(rgb, f.alpha)
    layer.putalpha(Image.fromarray((np.asarray(layer.getchannel('A')).astype(float) * (f.alpha > 128)).astype(np.uint8)))
    face.alpha_composite(layer)
    return face.resize((f.W // SS, f.H // SS), Image.LANCZOS)

def seat(face, shade=(8, 6, 20)):
    """Glaze v2's seat: the face on the margin canvas over a soft lower-right contact shadow."""
    m = MARGIN * PPU; cv = Image.new('RGBA', (face.width + 2 * m, face.height + 2 * m))
    a = face.getchannel('A').point(lambda v: v * 150 // 255)
    sh = Image.new('RGBA', cv.size); sh.paste(Image.new('RGBA', face.size, (*shade, 255)), (m + 2, m + 5), a)
    cv = Image.alpha_composite(cv, sh.filter(ImageFilter.GaussianBlur(3.2)))
    cv.alpha_composite(face, (m, m)); return cv

def icicles(im, f, rng, n=4):
    """Short icicle nubs hanging from the frost-iron bar's lower lip into the margin (drawn after seating)."""
    d = Image.new('RGBA', im.size); dr = ImageDraw.Draw(d); m = MARGIN * PPU; k = 1
    y0 = m + f.foot[1] * PPU - 2
    for i in range(n):
        x = m + (.12 + .76 * (i + rng.random() * .6) / n) * f.foot[0] * PPU; L = (2.2 + rng.random() * 3.2) * PPU * .7; w = 1.4 + rng.random() * 1.2
        dr.polygon([(x - w, y0), (x + w, y0), (x + .2, y0 + L)], fill=(206, 232, 246, 235))
        dr.line([(x - w * .5, y0 + 1), (x - .1, y0 + L * .8)], fill=(255, 255, 255, 230), width=1)
    im.alpha_composite(d)
    return im

# ---------- chapter recipes ----------
# Each entry: material -> (source hue frame, maker, states, cells, FX palette [light, mid, dark, spray kind]).
ALL = (0, 1, 2)
CH = {}
CH['frost'] = dict(foot=(36, 18), shadow=(4, 10, 22), mats={
    'ice': ('teal', m_ice(ramp7('#04131d', '#1d4a63', '#4f8fb0', '#86c3dd', '#bfe6f4', '#eefaff')), ALL, (2,), ['#eefaff', '#86c3dd', '#1d4a63', 'ice']),
    'blue': ('blue', m_ice(ramp7('#030a22', '#0f2d6e', '#2457b4', '#3f7fdc', '#86b6f2', '#d8e9ff'), ferns=1), ALL, (2,), ['#d8e9ff', '#3f7fdc', '#0f2d6e', 'ice']),
    'violet': ('violet', m_ice(ramp7('#0b0622', '#2a1d6a', '#4f40a8', '#7466cc', '#aea4ea', '#e7e2ff'), ferns=1), ALL, (2,), ['#e7e2ff', '#7466cc', '#2a1d6a', 'ice']),
    'bar': ('teal', m_iron(ramp7('#04070b', '#18222d', '#33424f', '#566a7b', '#90a6b6', '#d6e4ee'), 'frost'), (0,), (1, 2), ['#d6e4ee', '#566a7b', '#18222d', 'ice']),
})
CH['gatehouse'] = dict(foot=(36, 18), mats={
    'gules': ('coral', m_enamel(ramp7('#1a0306', '#5e0d16', '#a01c2a', '#cf3842', '#ee7b7c', '#ffd8d0')), ALL, (2,), ['#ffd8d0', '#cf3842', '#5e0d16', 'enamel']),
    'argent': ('teal', m_enamel(ramp7('#1c1a17', '#5f5a52', '#a59e92', '#d6d0c4', '#efebe2', '#fffdf8')), ALL, (2,), ['#fffdf8', '#d6d0c4', '#5f5a52', 'enamel']),
    'vert': ('teal', m_enamel(ramp7('#03130b', '#0d4a2c', '#1f7a4c', '#3ea56c', '#86d3a2', '#d7f5e2')), ALL, (2,), ['#d7f5e2', '#3ea56c', '#0d4a2c', 'enamel']),
    'iron': ('teal', m_iron(ramp7('#050608', '#1b1f26', '#383f4a', '#5b6370', '#959daa', '#dde2ea'), 'plate', gilt=True, rivet_metal=(150, 112, 52)), ALL, (2,), ['#dde2ea', '#5b6370', '#1b1f26', 'iron']),
    'bar': ('teal', m_iron(ramp7('#040507', '#16191f', '#2e333c', '#4b525e', '#848c99', '#d2d8e2'), 'portcullis'), (0,), (1, 2), ['#d2d8e2', '#4b525e', '#16191f', 'iron']),
})
CH['bellforge'] = dict(foot=(36, 18), shadow=(14, 6, 2), mats={
    'verdigris': ('teal', m_bronze(ramp7('#140803', '#4a2610', '#82502a', '#ad7845', '#d6aa78', '#f5dfc0'), patina=1.0, hammered=False), ALL, (2,), ['#a6dcc6', '#3f8d79', '#245e52', 'forge']),
    'bronze': ('coral', m_bronze(ramp7('#170904', '#4f2410', '#8a4a22', '#b9743a', '#dca46a', '#f7dcb4')), ALL, (2,), ['#f7dcb4', '#b9743a', '#4f2410', 'forge']),
    'bellmetal': ('violet', m_bronze(ramp7('#14070a', '#4a1a22', '#7e3640', '#a85660', '#d08c90', '#f6d4d2')), ALL, (2,), ['#f6d4d2', '#a85660', '#4a1a22', 'forge']),
    'pin': ('teal', m_iron(ramp7('#0f0703', '#3a1e0c', '#683c1c', '#94602e', '#c69456', '#f0d6a8'), 'plate', rivet_metal=(70, 58, 50), hot=True), ALL, (2,), ['#f0d6a8', '#94602e', '#3a1e0c', 'forge']),
    'bar': ('teal', m_iron(ramp7('#050404', '#1a1615', '#332c29', '#544a44', '#8c8079', '#d8cdc4'), 'forge'), (0,), (1, 2), ['#d8cdc4', '#544a44', '#1a1615', 'forge']),
})
CH['tower'] = dict(foot=(36, 18), shadow=(10, 6, 20), mats={
    'stone': ('violet', m_stone(ramp7('#120a1e', '#3d2c5c', '#6a5594', '#8d78b8', '#bcaddc', '#ece5f8')), ALL, (2,), ['#e6ddf6', '#7d68a8', '#33244f', 'stone']),
    'rose': ('coral', m_stone(ramp7('#1e0a10', '#652637', '#a24d66', '#c76f88', '#e6a7ba', '#fde6ed')), ALL, (2,), ['#fbe0e8', '#bd627c', '#5a1f2d', 'stone']),
    'slate': ('blue', m_stone(ramp7('#07101e', '#1b3159', '#375a94', '#5479b6', '#93b0da', '#e0ebf9')), ALL, (2,), ['#dce8f8', '#4b70aa', '#16294d', 'stone']),
    'jade': ('teal', m_stone(ramp7('#03140d', '#0d4a33', '#1f7f57', '#3fae7e', '#8fe0b8', '#dcfaea'), rune=('#4dffc0', '#b8ffe4')), ALL, (2,), ['#dcfaea', '#3fae7e', '#0d4a33', 'rune']),
    'amber': ('sun', m_stone(ramp7('#150903', '#4a2510', '#7c4622', '#a2653a', '#cd9a70', '#f4dcc6'), scale_size=5.0), ALL, (2,), ['#f4dcc6', '#a2653a', '#4a2510', 'stone']),
    'emerald': ('teal', m_stone(ramp7('#02120a', '#0b4426', '#177544', '#2c9b5e', '#74cf96', '#d4f6e0'), scale_size=5.0), ALL, (2,), ['#d4f6e0', '#2c9b5e', '#0b4426', 'stone']),
    'amethyst': ('violet', m_stone(ramp7('#0e0520', '#371a63', '#5f36a0', '#8458c4', '#b896e4', '#ece0ff'), scale_size=5.0), ALL, (2,), ['#ece0ff', '#8458c4', '#371a63', 'stone']),
    'bar': ('teal', m_iron(ramp7('#05040a', '#1b1826', '#353147', '#575270', '#918aa8', '#dcd8ea'), 'tower'), (0,), (1, 2), ['#dcd8ea', '#575270', '#1b1826', 'iron']),
})
CH['mooncoil'] = dict(foot=(32, 16), shadow=(6, 6, 20), mats={
    'moonstone': ('blue', m_moon(ramp7('#060c1c', '#1d3256', '#3f6290', '#6e92bf', '#a9c3e2', '#e8f1fc')), (0, 1), (1, 2), ['#e8f1fc', '#6e92bf', '#1d3256', 'moon']),
    'rosemoon': ('coral', m_moon(ramp7('#1a080e', '#57263a', '#8f4d67', '#b77690', '#dbaabd', '#fae6ee'), sheen=('#ffd8e6', '#d8e4ff')), (0, 1), (1, 2), ['#fae6ee', '#b77690', '#57263a', 'moon']),
    'silver': ('teal', m_moon(ramp7('#080b10', '#2a323d', '#56616f', '#828d9b', '#b8c1cc', '#eef2f7'), sheen=('#d8f4ff', '#f4e8ff')), (0, 1), (1, 2), ['#eef2f7', '#828d9b', '#2a323d', 'moon']),
    'starlit': ('violet', m_moon(ramp7('#08041a', '#24135a', '#45289a', '#6a4cc0', '#a38ce2', '#e6dcff'), sheen=('#c8b8ff', '#ffd0f0'), stars=4), (0, 1), (1, 2), ['#e6dcff', '#6a4cc0', '#24135a', 'moon']),
    'bar': ('teal', m_iron(ramp7('#030308', '#0d0f1a', '#1d2134', '#343a52', '#6c7390', '#c8cee6'), 'lunar'), (0,), (1, 2), ['#c8cee6', '#343a52', '#0d0f1a', 'moon']),
})
CH['vault'] = dict(foot=(32, 16), mats={
    'bar': ('teal', m_iron(ramp7('#030307', '#0e0d18', '#1f1e2e', '#36354a', '#6d6c88', '#cfcfe2'), 'vault'), (0,), (1, 2), ['#dedbeb', '#59556f', '#1c1a28', 'iron']),
})

def build(chapter):
    R = CH[chapter]; out = os.path.join(OUT, chapter); os.makedirs(out, exist_ok=True)
    for f in os.listdir(out):
        if f.endswith('.png'): os.remove(os.path.join(out, f))
    sprites, palette = {}, {}
    foot2 = R['foot']
    for mi, (mat, (src, make, states, cells_list, pal)) in enumerate(R['mats'].items()):
        palette[mat] = pal
        for cells in cells_list:
            foot = foot2 if cells == 2 else (foot2[1], foot2[1])
            for state in states:
                f = Face(src, state, cells, foot, 7000 + mi * 31 + cells * 5 + sum(map(ord, chapter)) % 97)
                rgb, layer = make(f)
                im = seat(finish(f, rgb, layer), R.get('shadow', (8, 6, 20)))
                if chapter == 'frost' and mat == 'bar': im = icicles(im, f, random.Random(mi + cells))
                key = f'{mat}_{cells}_{state}'
                Image.frombytes('RGBA', im.size, im.tobytes()).save(os.path.join(out, key + '.png'), optimize=True)   # no metadata
                sprites[key] = {'file': key + '.png', 'px': list(im.size), 'ppu': PPU, 'footprint': list(foot),
                                'drawSize': [foot[0] + 2 * MARGIN, foot[1] + 2 * MARGIN], 'margin': MARGIN, 'material': mat, 'cells': cells, 'state': state}
    json.dump({'source': 'art/themed-bricks/build.py (re-glazed from art/glaze2/source/bricks.png)', 'chapter': chapter,
               'palette': palette, 'sprites': sprites}, open(os.path.join(out, 'atlas.json'), 'w'), indent=1)
    print(chapter, len(sprites), 'sprites ->', out)

if __name__ == '__main__':
    for ch in (sys.argv[1:] or list(CH)): build(ch)
