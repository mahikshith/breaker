#!/usr/bin/env python3
"""Compose the two phase-2 concept boards from existing game art.

    python3 tools/make_phase2_boards.py            # writes both boards
    python3 tools/make_phase2_boards.py gatehouse  # only one (gatehouse | lumi)

Output: design/phase2/img/kit-gatehouse-siege-v1.png and lumi-breaks-out-v1.png
(1536x1024 RGB, no metadata). Everything is cut from assets/ (plus Lumi's
face close-ups from the character sheet, when present) with simple drawn
shapes and text. Deterministic: same inputs give the same pixels.
"""
import math
import random
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
A = ROOT / "assets"
OUT = ROOT / "design" / "phase2" / "img"
# Lumi face close-ups live in the character sheet (not in the repo); optional.
SHEET_CANDIDATES = [
    Path("/mnt/project-files/breaker/characters/princess-v2-sheet.png"),
    Path("/mnt/attach/project-files/breaker/characters/princess-v2-sheet.png"),
]

KEY = (255, 219, 184)
FILL = (140, 166, 255)
NAVY = (20, 24, 49)
W, H = 1536, 1024
LRES = Image.LANCZOS

# ---------------------------------------------------------------- helpers
_cache = {}


def load(rel):
    if rel not in _cache:
        _cache[rel] = Image.open(A / rel).convert("RGBA")
    return _cache[rel]


def trim(im):
    bb = im.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    return im.crop(bb) if bb else im


def sc(im, s=None, w=None, h=None):
    if s is not None:
        w, h = max(1, round(im.width * s)), max(1, round(im.height * s))
    elif w is not None:
        h = max(1, round(im.height * w / im.width))
    else:
        w = max(1, round(im.width * h / im.height))
    return im.resize((max(1, round(w)), max(1, round(h))), LRES)


def font(name, size, weight=None):
    if name == "lilita":
        return ImageFont.truetype(str(A / "fonts" / "LilitaOne-Regular.ttf"), size)
    f = ImageFont.truetype(str(A / "fonts" / "Rubik.ttf"), size)
    f.set_variation_by_axes([weight or 500])
    return f


def shade(im, mult=1.0, sat=1.0, tint=None, tint_a=0.0):
    """Darken / desaturate an RGBA image, optional colour wash."""
    rgb = np.asarray(im.convert("RGB")).astype(np.float32)
    g = rgb.mean(axis=2, keepdims=True)
    rgb = g + (rgb - g) * sat
    rgb *= mult
    if tint is not None:
        rgb = rgb * (1 - tint_a) + np.array(tint, np.float32) * tint_a
    out = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), "RGB").convert("RGBA")
    out.putalpha(im.getchannel("A"))
    return out


def put(dst, im, x, y, anchor="c", rot=0, flip=False, alpha=1.0, shadow=0, sh_off=(0, 6)):
    """Alpha-composite `im` onto `dst` (RGBA) with anchor c/tl/bc/tr."""
    if flip:
        im = im.transpose(Image.FLIP_LEFT_RIGHT)
    if rot:
        im = im.rotate(rot, resample=Image.BICUBIC, expand=True)
    if alpha < 1:
        im = im.copy()
        im.putalpha(im.getchannel("A").point(lambda v: int(v * alpha)))
    w, h = im.size
    ox, oy = {"c": (w / 2, h / 2), "tl": (0, 0), "bc": (w / 2, h), "tr": (w, 0),
              "tc": (w / 2, 0), "cl": (0, h / 2), "cr": (w, h / 2)}[anchor]
    px, py = round(x - ox), round(y - oy)
    if shadow:
        sh = Image.new("RGBA", im.size, (0, 0, 0, 0))
        sh.putalpha(im.getchannel("A").point(lambda v: int(v * shadow)))
        pad = 24
        big = Image.new("RGBA", (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0))
        big.paste(sh, (pad, pad))
        big = big.filter(ImageFilter.GaussianBlur(max(3, min(w, h) * 0.04)))
        comp(dst, big, px - pad + sh_off[0] * (dst.width // 400 or 1), py - pad + sh_off[1] * (dst.width // 400 or 1))
    comp(dst, im, px, py)
    return px, py


def _clipped(dst, im, x, y):
    """Return (src_cropped, dest_xy) so alpha_composite never errors off-canvas."""
    sx0, sy0 = max(0, -x), max(0, -y)
    sx1, sy1 = min(im.width, dst.width - x), min(im.height, dst.height - y)
    if sx1 <= sx0 or sy1 <= sy0:
        return Image.new("RGBA", (1, 1), (0, 0, 0, 0)), (0, 0)
    return im.crop((sx0, sy0, sx1, sy1)), (x + sx0, y + sy0)


def comp(dst, im, x, y):
    s, d = _clipped(dst, im, x, y)
    dst.alpha_composite(s, d)


def glow(dst, cx, cy, r, color, a=0.8, ry=None, power=2.0, add=True):
    """Soft radial glow. add=True is additive (light), otherwise an alpha blob."""
    ry = ry or r
    x0, y0 = int(cx - r), int(cy - ry)
    w, h = int(2 * r) + 1, int(2 * ry) + 1
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    d = np.sqrt(((xx - r) / r) ** 2 + ((yy - ry) / ry) ** 2)
    f = np.clip(1 - d, 0, 1) ** power * a
    if add:
        layer = np.zeros((h, w, 4), np.uint8)
        layer[..., :3] = np.array(color, np.uint8)
        layer[..., 3] = (f * 255).astype(np.uint8)
        comp(dst, Image.fromarray(layer, "RGBA"), x0, y0)
    else:
        layer = np.zeros((h, w, 4), np.uint8)
        layer[..., :3] = np.array(color, np.uint8)
        layer[..., 3] = (f * 255).astype(np.uint8)
        comp(dst, Image.fromarray(layer, "RGBA"), x0, y0)


def screen_glow(dst, cx, cy, r, color, a=0.8, ry=None, power=2.0):
    """True 'screen' glow so it brightens instead of washing out."""
    ry = ry or r
    x0, y0 = int(cx - r), int(cy - ry)
    w, h = int(2 * r) + 1, int(2 * ry) + 1
    sx0, sy0 = max(0, x0), max(0, y0)
    sx1, sy1 = min(dst.width, x0 + w), min(dst.height, y0 + h)
    if sx1 <= sx0 or sy1 <= sy0:
        return
    yy, xx = np.mgrid[sy0 - y0:sy1 - y0, sx0 - x0:sx1 - x0].astype(np.float32)
    d = np.sqrt(((xx - r) / r) ** 2 + ((yy - ry) / ry) ** 2)
    f = (np.clip(1 - d, 0, 1) ** power * a)[..., None]
    reg = np.asarray(dst.crop((sx0, sy0, sx1, sy1))).astype(np.float32)
    col = np.array(color, np.float32)
    rgb = 255 - (255 - reg[..., :3]) * (1 - f * col / 255)
    reg[..., :3] = rgb
    dst.paste(Image.fromarray(np.clip(reg, 0, 255).astype(np.uint8), "RGBA"), (sx0, sy0))


def vgrad(w, h, top, bot):
    t = np.linspace(0, 1, h, dtype=np.float32)[:, None, None]
    a = np.array(top, np.float32)[None, None, :]
    b = np.array(bot, np.float32)[None, None, :]
    arr = np.repeat(a + (b - a) * t, w, axis=1)
    mode = "RGBA" if arr.shape[2] == 4 else "RGB"
    return Image.fromarray(arr.astype(np.uint8), mode).convert("RGBA")


def rmask(size, r, scale=4):
    w, h = size
    m = Image.new("L", (w * scale, h * scale), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, w * scale - 1, h * scale - 1), r * scale, fill=255)
    return m.resize(size, LRES)


def circ_mask(d, scale=4):
    m = Image.new("L", (d * scale, d * scale), 0)
    ImageDraw.Draw(m).ellipse((0, 0, d * scale - 1, d * scale - 1), fill=255)
    return m.resize((d, d), LRES)


def crop_cover(im, w, h, fx=0.5, fy=0.5):
    """Crop to aspect w:h around focal point (fx, fy), then resize."""
    ar = w / h
    if im.width / im.height > ar:
        cw, ch = round(im.height * ar), im.height
    else:
        cw, ch = im.width, round(im.width / ar)
    x0 = round((im.width - cw) * fx)
    y0 = round((im.height - ch) * fy)
    return im.crop((x0, y0, x0 + cw, y0 + ch)).resize((w, h), LRES)


def vignette(im, strength=0.55, power=2.2):
    w, h = im.size
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    d = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2) / 1.41
    f = 1 - np.clip(d, 0, 1) ** power * strength
    arr = np.asarray(im).astype(np.float32)
    arr[..., :3] *= f[..., None]
    return Image.fromarray(arr.astype(np.uint8), "RGBA")


def text(dst, xy, s, fnt, fill=KEY, anchor="la", shadow=(0, 0, 0, 170), sh=2, stroke=0, stroke_fill=(0, 0, 0)):
    lay = Image.new("RGBA", dst.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    if shadow:
        d.text((xy[0] + sh, xy[1] + sh * 1.5), s, font=fnt, fill=shadow, anchor=anchor,
               stroke_width=stroke, stroke_fill=shadow)
    d.text(xy, s, font=fnt, fill=fill, anchor=anchor, stroke_width=stroke, stroke_fill=stroke_fill)
    dst.alpha_composite(lay)


def grad_text(dst, xy, s, fnt, top, bot, anchor="ma", shadow=True, outline=(20, 14, 30)):
    mask = Image.new("L", dst.size, 0)
    ImageDraw.Draw(mask).text(xy, s, font=fnt, fill=255, anchor=anchor)
    bb = mask.getbbox()
    if not bb:
        return
    if shadow:
        sh = Image.new("RGBA", dst.size, (0, 0, 0, 0))
        m2 = mask.filter(ImageFilter.MaxFilter(7))
        sh.paste((*outline, 255), (0, 0), m2)
        sh = sh.filter(ImageFilter.GaussianBlur(1))
        off = Image.new("RGBA", dst.size, (0, 0, 0, 0))
        off.alpha_composite(sh, (0, 4))
        dst.alpha_composite(off)
        ol = Image.new("RGBA", dst.size, (0, 0, 0, 0))
        ol.paste((*outline, 255), (0, 0), mask.filter(ImageFilter.MaxFilter(5)))
        dst.alpha_composite(ol)
    g = vgrad(dst.width, bb[3] - bb[1], top, bot)
    full = Image.new("RGBA", dst.size, (0, 0, 0, 0))
    full.paste(g, (0, bb[1]))
    full.putalpha(ImageChops.multiply(full.getchannel("A"), mask))
    dst.alpha_composite(full)


def panel_base(w, h, r=16, border=(140, 166, 255, 80)):
    """Empty rounded panel layer and its mask."""
    return Image.new("RGBA", (w, h), (0, 0, 0, 255)), rmask((w, h), r)


def finish_panel(dst, scene, x, y, r=16, border=(140, 166, 255, 90), glow_edge=None):
    w, h = scene.size
    m = rmask((w, h), r)
    scene = scene.copy()
    scene.putalpha(m)
    # soft drop shadow
    sh = Image.new("RGBA", (w + 40, h + 40), (0, 0, 0, 0))
    sh.paste((0, 0, 0, 150), (20, 24), m)
    sh = sh.filter(ImageFilter.GaussianBlur(10))
    comp(dst, sh, x - 20, y - 20)
    comp(dst, scene, x, y)
    bl = Image.new("RGBA", (w * 3, h * 3), (0, 0, 0, 0))
    ImageDraw.Draw(bl).rounded_rectangle((0, 0, w * 3 - 1, h * 3 - 1), r * 3, outline=border, width=3)
    comp(dst, bl.resize((w, h), LRES), x, y)


def caption(scene, label, sub=None, h=44):
    w, hh = scene.size
    g = vgrad(w, h + 30, (6, 8, 20, 0), (6, 8, 20, 235))
    comp(scene, g, 0, hh - h - 30)
    size = 21
    while size > 12 and ImageDraw.Draw(scene).textlength(label, font=font("lilita", size)) > w - 20:
        size -= 1
    text(scene, (w // 2, hh - 20), label, font("lilita", size), fill=KEY, anchor="mm", sh=1)


def pill(draw_im, box, fill, outline=None, r=None, width=2):
    d = ImageDraw.Draw(draw_im)
    r = r if r is not None else (box[3] - box[1]) // 2
    d.rounded_rectangle(box, r, fill=fill, outline=outline, width=width)


def heart(im, cx, cy, s, color=(255, 92, 140), hl=(255, 190, 210)):
    k = 4
    lay = Image.new("RGBA", (int(s * 2.2) * k, int(s * 2.2) * k), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    c = lay.width / 2
    r = s * 0.5 * k
    d.ellipse((c - 1.0 * r - r * 0.05, c - 1.15 * r, c - 0.05 * r + r * 0.0, c - 0.15 * r), fill=color)
    d.ellipse((c + 0.05 * r, c - 1.15 * r, c + 1.05 * r + r * 0.05, c - 0.15 * r), fill=color)
    d.polygon([(c - 1.02 * r, c - 0.55 * r), (c + 1.07 * r, c - 0.55 * r), (c, c + 1.15 * r)], fill=color)
    d.ellipse((c - 0.75 * r, c - 0.95 * r, c - 0.35 * r, c - 0.6 * r), fill=hl)
    lay = lay.resize((lay.width // k, lay.height // k), LRES)
    comp(im, lay, round(cx - lay.width / 2), round(cy - lay.height / 2))


def note_glyph(im, cx, cy, s, color=(255, 214, 236), outline=None):
    """Simple eighth-note glyph from primitives."""
    k = 4
    S = int(s * 1.6) * k
    lay = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    u = s * k
    head = (S * 0.22, S * 0.62, S * 0.22 + u * 0.55, S * 0.62 + u * 0.4)
    d.ellipse(head, fill=color, outline=outline)
    sx = head[2] - u * 0.06
    d.rectangle((sx - u * 0.07, S * 0.16, sx + u * 0.07, S * 0.62 + u * 0.2), fill=color)
    d.polygon([(sx - u * 0.07, S * 0.16), (sx + u * 0.5, S * 0.3), (sx + u * 0.42, S * 0.46), (sx - u * 0.07, S * 0.34)], fill=color)
    lay = lay.resize((S // k, S // k), LRES)
    comp(im, lay, round(cx - lay.width / 2), round(cy - lay.height / 2))


def sphere(d, color_hi, color_mid, color_lo, rim=(140, 166, 255), spec=True):
    """Glossy vinyl-toy sphere (RGBA, diameter d)."""
    k = 3
    D = d * k
    yy, xx = np.mgrid[0:D, 0:D].astype(np.float32)
    cx = cy = D / 2
    rr = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / (D / 2)
    lx, ly = -0.38, -0.42
    dist = np.sqrt(((xx - cx) / (D / 2) - lx) ** 2 + ((yy - cy) / (D / 2) - ly) ** 2)
    t = np.clip(dist / 1.25, 0, 1)[..., None]
    hi, mid, lo = (np.array(c, np.float32) for c in (color_hi, color_mid, color_lo))
    col = np.where(t < 0.5, hi + (mid - hi) * (t / 0.5), mid + (lo - mid) * ((t - 0.5) / 0.5))
    # blue fill-light rim on the lower right
    rimf = (np.clip((rr - 0.72) / 0.28, 0, 1) ** 1.5 * np.clip(((xx - cx) + (yy - cy)) / (D / 2) * 0.8, 0, 1))[..., None]
    col = col * (1 - rimf * 0.6) + np.array(rim, np.float32) * rimf * 0.6
    alpha = np.clip((1 - rr) * (D / 2) / 1.5, 0, 1)
    arr = np.dstack([col, alpha * 255]).astype(np.uint8)
    im = Image.fromarray(arr, "RGBA")
    if spec:
        d2 = ImageDraw.Draw(im)
        d2.ellipse((D * 0.2, D * 0.14, D * 0.46, D * 0.34), fill=(255, 255, 255, 230))
        d2.ellipse((D * 0.58, D * 0.7, D * 0.72, D * 0.78), fill=(255, 255, 255, 90))
    return im.resize((d, d), LRES)


def pearl(d):
    return sphere(d, (255, 255, 255), (222, 226, 240), (110, 118, 160))


def paddle(w, h, base_hi, base_lo, cap_hi, cap_lo, emblem=None):
    """Glossy capsule paddle with metal end caps."""
    k = 4
    W2, H2 = w * k, h * k
    body = vgrad(W2, H2, base_hi, base_lo)
    # shine strip
    dd = ImageDraw.Draw(body)
    dd.rounded_rectangle((H2 * 0.5, H2 * 0.12, W2 - H2 * 0.5, H2 * 0.34), H2 * 0.1, fill=(255, 255, 255, 80))
    # end caps
    cap_w = int(H2 * 0.78)
    for side in (0, 1):
        cap = vgrad(cap_w, H2, cap_hi, cap_lo)
        x0 = 0 if side == 0 else W2 - cap_w
        body.paste(cap, (x0, 0))
        lx = x0 + (cap_w if side == 0 else 0)
        ImageDraw.Draw(body).line([(lx, 0), (lx, H2)], fill=(60, 40, 20, 200), width=k * 2)
    m = Image.new("L", (W2, H2), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, W2 - 1, H2 - 1), H2 // 2, fill=255)
    body.putalpha(m)
    if emblem:
        emblem(body, W2 // 2, H2 // 2, H2, k)
    return body.resize((w, h), LRES)


def shield_emblem(im, cx, cy, hh, k):
    d = ImageDraw.Draw(im)
    s = hh * 0.62
    pts = [(cx - s * 0.55, cy - s * 0.5), (cx + s * 0.55, cy - s * 0.5), (cx + s * 0.55, cy + s * 0.05),
           (cx, cy + s * 0.62), (cx - s * 0.55, cy + s * 0.05)]
    d.polygon(pts, fill=(30, 48, 120, 255), outline=(255, 219, 184, 255))
    d.line(pts + [pts[0]], fill=(255, 219, 184, 255), width=max(2, int(k * 0.8)))
    bolt = [(cx + s * 0.08, cy - s * 0.4), (cx - s * 0.22, cy + s * 0.05), (cx - s * 0.02, cy + s * 0.05),
            (cx - s * 0.1, cy + s * 0.42), (cx + s * 0.24, cy - s * 0.12), (cx + s * 0.03, cy - s * 0.12)]
    d.polygon(bolt, fill=(255, 236, 200, 255))


def star_emblem(im, cx, cy, hh, k):
    d = ImageDraw.Draw(im)
    s = hh * 0.36
    pts = []
    for i in range(10):
        a = -math.pi / 2 + i * math.pi / 5
        r = s if i % 2 == 0 else s * 0.45
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    d.polygon(pts, fill=(255, 244, 214, 255), outline=(150, 70, 90, 255))


def kit_paddle(w, h):
    return paddle(w, h, (92, 140, 232), (28, 52, 130), (255, 232, 196), (150, 108, 62), shield_emblem)


def lumi_paddle(w, h):
    return paddle(w, h, (255, 150, 190), (196, 72, 130), (255, 236, 190), (178, 120, 70), star_emblem)


def ring_arc(layer, cx, cy, r, w, frac, color, track=(255, 255, 255, 40), k=4):
    big = Image.new("RGBA", (int((r + w) * 2 * k), int((r + w) * 2 * k)), (0, 0, 0, 0))
    d = ImageDraw.Draw(big)
    c = big.width / 2
    bb = (c - r * k, c - r * k, c + r * k, c + r * k)
    d.ellipse(bb, outline=track, width=int(w * k))
    d.arc(bb, -90, -90 + 360 * frac, fill=color, width=int(w * k))
    big = big.resize((big.width // k, big.height // k), LRES)
    comp(layer, big, round(cx - big.width / 2), round(cy - big.height / 2))


def orb(layer, cx, cy, r, face, crop, ring_col, frac=0.8, bg=(26, 34, 76)):
    """Round face button, cropped from a real render, with a charge ring."""
    d = int(r * 2 - 6)
    face = face.crop(crop)
    inner = Image.new("RGBA", (d, d), (*bg, 255))
    inner.alpha_composite(vgrad(d, d, (70, 90, 170, 255), (*bg, 255)))
    f = face.resize((d, d), LRES)
    inner.alpha_composite(f)
    inner.putalpha(circ_mask(d))
    glow(layer, cx, cy, r * 1.9, ring_col, 0.35)
    comp(layer, inner, round(cx - d / 2), round(cy - d / 2))
    ring_arc(layer, cx, cy, r - 1.5, 4, frac, (*ring_col, 255), track=(255, 255, 255, 50))
    # gloss
    gl = Image.new("RGBA", (d, d), (0, 0, 0, 0))
    ImageDraw.Draw(gl).ellipse((d * 0.1, d * 0.04, d * 0.7, d * 0.4), fill=(255, 255, 255, 40))
    gl.putalpha(ImageChops.multiply(gl.getchannel("A"), circ_mask(d)))
    comp(layer, gl, round(cx - d / 2), round(cy - d / 2))


def hud(layer, u, w, score="1,240", hearts=3, floor_txt="FLOOR 2 / 3", accent=FILL):
    """Phone HUD drawn straight onto the final-resolution screen (u = px per logical px)."""
    k = 3
    pb = Image.new("RGBA", (36 * k, 36 * k), (0, 0, 0, 0))
    d = ImageDraw.Draw(pb)
    d.rounded_rectangle((0, 0, 36 * k - 1, 36 * k - 1), 9 * k, fill=(38, 56, 120, 255), outline=(255, 219, 184, 230), width=2 * k)
    d.rounded_rectangle((11 * k, 9 * k, 15 * k, 27 * k), 2 * k, fill=(255, 236, 210))
    d.rounded_rectangle((21 * k, 9 * k, 25 * k, 27 * k), 2 * k, fill=(255, 236, 210))
    pb = pb.resize((round(36 * u), round(36 * u)), LRES)
    comp(layer, pb, round(16 * u), round(12 * u))
    for i in range(hearts):
        heart(layer, (74 + i * 27) * u, 30 * u, 15 * u)
    pill(layer, (round((w - 104) * u), round(14 * u), round((w - 14) * u), round(46 * u)), (14, 18, 40, 225), (255, 219, 184, 150), width=2)
    text(layer, ((w - 59) * u, 30 * u), score, font("lilita", round(20 * u)), anchor="mm", sh=1)
    pill(layer, (round((w / 2 - 54) * u), round(54 * u), round((w / 2 + 54) * u), round(77 * u)), (14, 18, 40, 220), (*accent, 170), width=1)
    text(layer, (w / 2 * u, 65.5 * u), floor_txt, font("rubik", round(12 * u), 800), fill=(200, 214, 255), anchor="mm", sh=1)


def sparks(layer, cx, cy, n, r0, r1, color=(255, 236, 200), seed=1, size=(1.5, 3.2)):
    rnd = random.Random(seed)
    d = ImageDraw.Draw(layer)
    for _ in range(n):
        a = rnd.uniform(0, math.tau)
        r = rnd.uniform(r0, r1)
        s = rnd.uniform(*size)
        x, y = cx + math.cos(a) * r, cy + math.sin(a) * r
        d.ellipse((x - s, y - s, x + s, y + s), fill=(*color, rnd.randint(150, 255)))


def trail(layer, pts, color, w0, w1, a0=0, a1=200):
    """Tapered glowing trail: soft circles stamped along the path (tail -> head)."""
    k = 2
    big = Image.new("RGBA", (layer.width * k, layer.height * k), (0, 0, 0, 0))
    d = ImageDraw.Draw(big)
    segs = len(pts) - 1
    total = 0
    lens = []
    for i in range(segs):
        L = math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1])
        lens.append(L)
        total += L
    steps = max(8, int(total / 1.5))
    for j in range(steps + 1):
        t = j / steps
        dist = t * total
        i = 0
        while i < segs - 1 and dist > lens[i]:
            dist -= lens[i]
            i += 1
        u = dist / (lens[i] or 1)
        x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u
        y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u
        r = (w0 + (w1 - w0) * t) * k / 2
        a = int(a0 + (a1 - a0) * t ** 1.3)
        d.ellipse((x * k - r, y * k - r, x * k + r, y * k + r), fill=(*color, max(2, a // 6)))
    big = big.filter(ImageFilter.GaussianBlur(k * 1.2)).resize(layer.size, LRES)
    layer.alpha_composite(big)


def bezier(p0, p1, p2, p3, n=24):
    out = []
    for i in range(n + 1):
        t = i / n
        a = (1 - t) ** 3
        b = 3 * (1 - t) ** 2 * t
        c = 3 * (1 - t) * t ** 2
        d = t ** 3
        out.append((a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]))
    return out


def snake_body(layer, pts, width, base=(18, 140, 126), dark=(8, 70, 72), light=(120, 214, 170), belly=(190, 226, 170)):
    """Emerald tube along a polyline, with outline, highlight and scale bands."""
    k = 2
    big = Image.new("RGBA", (layer.width * k, layer.height * k), (0, 0, 0, 0))
    d = ImageDraw.Draw(big)

    def stroke(col, wd, dx=0, dy=0):
        for i in range(len(pts) - 1):
            x0, y0 = pts[i][0] * k + dx * k, pts[i][1] * k + dy * k
            x1, y1 = pts[i + 1][0] * k + dx * k, pts[i + 1][1] * k + dy * k
            d.line([(x0, y0), (x1, y1)], fill=col, width=int(wd * k))
            r = wd * k / 2
            d.ellipse((x1 - r, y1 - r, x1 + r, y1 + r), fill=col)
    stroke((6, 40, 44, 255), width + 6)
    stroke((*dark, 255), width + 1)
    stroke((*base, 255), width - 4, -1, -1)
    stroke((*light, 255), width * 0.38, -width * 0.18, -width * 0.2)
    # scale bands
    for i in range(2, len(pts) - 1, 3):
        x, y = pts[i]
        nx, ny = pts[i + 1][0] - pts[i - 1][0], pts[i + 1][1] - pts[i - 1][1]
        L = math.hypot(nx, ny) or 1
        px, py = -ny / L, nx / L
        hw = width / 2 - 2
        d.line([((x - px * hw) * k, (y - py * hw) * k), ((x + px * hw) * k, (y + py * hw) * k)],
               fill=(*dark, 120), width=int(1.6 * k))
    big = big.resize(layer.size, LRES)
    layer.alpha_composite(big)


def window_arch(w, h, sky_top=(26, 40, 96), sky_bot=(70, 70, 130), moon=True, glow_a=0.0):
    """Stone-framed arched window (gateFrame art) with a night-sky opening."""
    fr = sc(load("fantasy-machinery/gateFrame.png"), w=w)
    im = Image.new("RGBA", fr.size, (0, 0, 0, 0))
    # opening: interior of gateFrame between x 42..307 / 352, from arch mid down to y~480/544
    ix0, ix1 = int(fr.width * 44 / 352), int(fr.width * 306 / 352)
    iy0, iy1 = int(fr.height * 60 / 544), int(fr.height * 486 / 544)
    sky = vgrad(ix1 - ix0, iy1 - iy0, (*sky_top, 255), (*sky_bot, 255))
    m = Image.new("L", sky.size, 255)
    mm = ImageDraw.Draw(m)
    # round the top of the opening
    mm.rectangle((0, 0, sky.width, int(sky.height * 0.18)), fill=0)
    mm.pieslice((0, 0, sky.width, int(sky.width)), 180, 360, fill=255)
    mm.rectangle((0, int(sky.width * 0.5), sky.width, sky.height), fill=255)
    sky.putalpha(m)
    if moon:
        dd = ImageDraw.Draw(sky)
        dd.ellipse((sky.width * 0.2, sky.height * 0.28, sky.width * 0.2 + 12, sky.height * 0.28 + 12), fill=(236, 238, 255, 230))
    im.alpha_composite(sky, (ix0, iy0))
    im.alpha_composite(fr)
    return im


# ---------------------------------------------------------------- phone shell
PW, PH = 393, 852  # logical phone px
K = 2              # supersample
SCR_W, SCR_H = 443, 960
SCR_X, SCR_Y = 46, 32


def phone_finish(board, scene):
    """Downsample the 2x scene into the phone bezel on the board."""
    scr = scene.resize((SCR_W, SCR_H), LRES)
    m = rmask((SCR_W, SCR_H), 36)
    scr.putalpha(m)
    bez = 9
    ox, oy = SCR_X - bez, SCR_Y - bez
    ow, oh = SCR_W + 2 * bez, SCR_H + 2 * bez
    # shadow + glow
    sh = Image.new("RGBA", (ow + 80, oh + 80), (0, 0, 0, 0))
    sh.paste((0, 0, 0, 170), (40, 48), rmask((ow, oh), 46))
    sh = sh.filter(ImageFilter.GaussianBlur(18))
    comp(board, sh, ox - 40, oy - 40)
    frame = Image.new("RGBA", (ow, oh), (0, 0, 0, 0))
    fm = rmask((ow, oh), 46)
    frame.paste(vgrad(ow, oh, (70, 80, 120, 255), (18, 22, 44, 255)), (0, 0), fm)
    inner = Image.new("RGBA", (ow, oh), (0, 0, 0, 0))
    inner.paste((8, 10, 22, 255), (bez - 3, bez - 3), rmask((SCR_W + 6, SCR_H + 6), 39))
    frame.alpha_composite(inner)
    comp(board, frame, ox, oy)
    comp(board, scr, SCR_X, SCR_Y)
    # island
    d = ImageDraw.Draw(board)
    d.rounded_rectangle((SCR_X + SCR_W // 2 - 34, SCR_Y + 8, SCR_X + SCR_W // 2 + 34, SCR_Y + 22), 7, fill=(6, 8, 16, 255))
    # glass edge highlight
    hl = Image.new("RGBA", (ow * 3, oh * 3), (0, 0, 0, 0))
    ImageDraw.Draw(hl).rounded_rectangle((0, 0, ow * 3 - 1, oh * 3 - 1), 46 * 3, outline=(200, 214, 255, 70), width=4)
    comp(board, hl.resize((ow, oh), LRES), ox, oy)


def board_background():
    """Dark calm navy base with soft key/fill glows."""
    bg = vgrad(W, H, (15, 18, 40, 255), (8, 10, 24, 255))
    screen_glow(bg, 250, 520, 420, (60, 80, 170), 0.22, ry=560, power=1.6)
    screen_glow(bg, 1180, 90, 520, (90, 70, 70), 0.16, ry=260, power=1.5)
    screen_glow(bg, 1300, 700, 520, (50, 64, 140), 0.14, ry=360, power=1.5)
    return bg


def title_block(board, title, sub_l, sub_r, cx=1020, y=24, size=96, top=(255, 238, 214), bot=(255, 176, 130)):
    f = font("lilita", size)
    grad_text(board, (cx, y), title.upper(), f, (*top, 255), (*bot, 255), anchor="ma")
    d = ImageDraw.Draw(board)
    fs = font("rubik", 23, 600)
    ty = y + size + 26
    s = f"{sub_l}   ·   {sub_r}"
    tw = d.textlength(s, font=fs)
    text(board, (cx, ty), s, fs, fill=(214, 224, 255), anchor="mm", sh=1)
    for sgn in (-1, 1):
        x1 = cx + sgn * (tw / 2 + 22)
        x2 = cx + sgn * (tw / 2 + 22 + 150)
        d.line([(x1, ty), (x2, ty)], fill=(140, 166, 255, 140), width=2)
        d.ellipse((x2 - 3, ty - 3, x2 + 3, ty + 3), fill=(255, 219, 184, 220))


def finish_board(board, name):
    OUT.mkdir(parents=True, exist_ok=True)
    rgb = board.convert("RGB")
    out = Image.fromarray(np.asarray(rgb))  # fresh image: no info/exif/text chunks
    path = OUT / name
    out.save(path, format="PNG", optimize=True)
    print("wrote", path.relative_to(ROOT), out.size)
    return path


# ---------------------------------------------------------------- shared art pieces
def brick_img(name, w):
    return sc(trim(load(f"fantasy-machinery/brick-{name}.png")), w=w)


def hall_bg(w, h, fx=0.5, fy=0.5, mult=0.42, sat=0.55, wash=(18, 22, 48), wash_a=0.35, blur=0):
    bg = crop_cover(load("fantasy-machinery/bellforge-background.png"), w, h, fx, fy)
    if blur:
        bg = bg.filter(ImageFilter.GaussianBlur(blur))
    return shade(bg, mult, sat, wash, wash_a)


def kit_face():
    return load("kit/faces/Idle_face_00.png")


def lumi_tiles():
    """Crop the ten face close-ups from the character sheet; None if absent."""
    for p in SHEET_CANDIDATES:
        if p.exists():
            sheet = Image.open(p).convert("RGBA")
            xs = [38, 334, 630, 926, 1222, 1518, 1814, 2110, 2406, 2702]
            names = ["idle", "glance", "blink", "pleading", "squeeze", "cheer_a", "cheer_b", "determined", "jump", "scared"]
            return {n: sheet.crop((x, 2546, x + 293, 2546 + 293)) for n, x in zip(names, xs)}
    return None


# ================================================================ BOARD 1
def gatehouse_phone():
    """Floor 2 (murder holes) in logical 393x852 phone px, drawn at K x."""
    S = Image.new("RGBA", (PW * K, PH * K), (0, 0, 0, 255))

    def P(im, x, y, **kw):
        return put(S, im, x * K, y * K, **kw)

    def sk(im, w=None, h=None, s_=None):
        return sc(im, s=s_ * K) if s_ else (sc(im, w=w * K) if w else sc(im, h=h * K))

    # backdrop: darkened Bellforge hall, cooled
    bg = hall_bg(PW * K, PH * K, fx=0.5, mult=0.8, sat=0.55, wash=(14, 20, 46), wash_a=0.28, blur=1.0)
    S.alpha_composite(bg)
    screen_glow(S, 290 * K, 200 * K, 150 * K, (255, 120, 60), 0.28, ry=110 * K)
    screen_glow(S, 150 * K, 390 * K, 150 * K, (255, 200, 140), 0.16, ry=120 * K)

    # gallery ledge (plinth) whose two arches are the murder holes
    pl = sk(trim(load("fantasy-machinery/plinth.png")), w=308)
    plx, ply = 196 - 154, 168
    sc_ = 308 / 714
    for hx in (plx + 150 * sc_ + 6, plx + 580 * sc_ - 6):
        hole = Image.new("RGBA", (70 * K, 64 * K), (0, 0, 0, 0))
        ImageDraw.Draw(hole).ellipse((0, 0, 70 * K - 1, 64 * K - 1), fill=(4, 4, 10, 255))
        comp(S, hole, round((hx - 35) * K), round((ply + 54) * K))
    hole_x = plx + 580 * sc_ - 6
    screen_glow(S, hole_x * K, (ply + 80) * K, 58 * K, (255, 110, 40), 0.9, ry=46 * K, power=1.4)
    P(pl, plx, ply, anchor="tl", shadow=0.7)
    # Korr peers down from the gallery, snout over the glowing hole
    kk = sk(trim(load("fantasy-machinery/korr-idle.png")), w=138)
    P(kk, hole_x + 8, ply + 20, anchor="bc", flip=True, shadow=0.6)
    # a bell appears in the glowing hole: the tell
    P(sk(trim(load("fantasy-machinery/bell.png")), w=32), hole_x, ply + 96, rot=6)

    # portcullis in its arch, 3 of 8 notches open; counterweight on the left rope
    gate_scene(S, 176 * K, 290 * K, 142 * K, open_frac=0.30)
    P(sk(trim(load("fantasy-machinery/chain-v2.png")), h=84), 56, 322)
    P(sk(trim(load("fantasy-machinery/counterweight.png")), w=54), 56, 396, shadow=0.6)

    # winch wheel with notch pips
    wx, wy = 322, 384
    P(sk(trim(load("fantasy-machinery/chain-v2.png")), h=46), 262, 372, rot=90, shadow=0.4)
    P(sk(trim(load("fantasy-machinery/wheel.png")), w=100), wx, wy, shadow=0.7, rot=-14)
    for i in range(8):
        a = math.radians(-215 + i * 26)
        cx_, cy_ = wx + math.cos(a) * 58, wy + math.sin(a) * 58
        on = i < 3
        d = ImageDraw.Draw(S)
        r = 4.4 * K
        d.ellipse((cx_ * K - r, cy_ * K - r, cx_ * K + r, cy_ * K + r), fill=(255, 226, 170, 255) if on else (40, 48, 90, 255), outline=(10, 12, 28, 255))
        if on:
            screen_glow(S, cx_ * K, cy_ * K, 10 * K, (255, 200, 120), 0.7)
    text(S, (wx * K, (wy + 66) * K), "3 / 8 TURNS", font("lilita", 14 * K), fill=(255, 226, 190), anchor="mm", sh=2)

    # coloured bricks
    cols, rows, bw = 8, 3, 41
    x0 = (PW - (cols * bw + (cols - 1) * 4)) / 2 + bw / 2
    y0 = 548
    pattern = ["coral", "sage", "ivory", "coral", "ivory", "sage", "coral", "ivory"]
    holes = {(1, 2), (2, 5), (2, 0), (2, 7), (0, 6)}
    bi = {n: sk(trim(load(f"fantasy-machinery/brick-{n}.png")), w=bw) for n in ("coral", "ivory", "sage")}
    for r in range(rows):
        for c in range(cols):
            if (r, c) in holes:
                continue
            name = pattern[(c + r * 3) % 8] if r % 2 == 0 else pattern[(c + r * 3 + 2) % 8]
            P(bi[name], x0 + c * (bw + 4), y0 + r * 27, shadow=0.45, sh_off=(0, 3))

    # ramps with a rolling bell
    ramp = trim(load("fantasy-machinery/ramp.png"))
    P(sk(ramp, w=176), 104, 664, rot=-10, shadow=0.7)
    P(sk(ramp, w=150), 306, 694, rot=10, shadow=0.7)
    st = Image.new("RGBA", S.size, (0, 0, 0, 0))
    trail(st, [(30 * K, 614 * K), (62 * K, 622 * K), (96 * K, 632 * K)], (255, 214, 160), 4 * K, 14 * K, 0, 150)
    S.alpha_composite(st)
    P(sk(trim(load("fantasy-machinery/bell.png")), w=54), 128, 636, rot=-22, shadow=0.7)

    # ball with trail
    tr = Image.new("RGBA", S.size, (0, 0, 0, 0))
    trail(tr, [(336 * K, 672 * K), (312 * K, 662 * K), (284 * K, 650 * K), (262 * K, 636 * K)], (190, 214, 255), 3 * K, 14 * K, 0, 210)
    S.alpha_composite(tr)
    screen_glow(S, 256 * K, 632 * K, 28 * K, (170, 200, 255), 0.5)
    P(pearl(18 * K), 256, 632)

    # paddle with sweet-spot ring (2 of 3 pips)
    pdx, pdy = 214, 770
    screen_glow(S, pdx * K, (pdy + 8) * K, 90 * K, (110, 150, 255), 0.4, ry=24 * K)
    P(kit_paddle(122 * K, 24 * K), pdx, pdy, shadow=0.7)
    ring = Image.new("RGBA", S.size, (0, 0, 0, 0))
    rd = ImageDraw.Draw(ring)
    for i, (wd, al) in enumerate([(10, 60), (6, 130), (3, 255)]):
        rd.rounded_rectangle(((pdx - 22) * K - i, (pdy - 17) * K - i, (pdx + 22) * K + i, (pdy + 17) * K + i), 12 * K, outline=(255, 226, 170, al), width=wd)
    S.alpha_composite(ring.filter(ImageFilter.GaussianBlur(1.2)))
    d = ImageDraw.Draw(S)
    for i in range(3):
        cx_, cy_ = pdx + (i - 1) * 16, pdy - 30
        r = 4.4 * K
        on = i < 2
        d.ellipse((cx_ * K - r, cy_ * K - r, cx_ * K + r, cy_ * K + r), fill=(255, 226, 170, 255) if on else (50, 58, 100, 255), outline=(10, 12, 28, 255))
        if on:
            screen_glow(S, cx_ * K, cy_ * K, 12 * K, (255, 210, 140), 0.7)
    screen_glow(S, 200 * K, 800 * K, 200 * K, (90, 110, 200), 0.12, ry=26 * K)

    # Kit's face orb, lower-left, with charge ring
    orb(S, 46 * K, 804 * K, 32 * K, kit_face(), (16, 0, 288, 230), (255, 219, 184), frac=0.68)
    return S


def gate_scene(layer, cx, ytop, fw, open_frac=0.3, light=(255, 190, 120)):
    """Portcullis raised `open_frac` inside its stone arch; light spills from beneath."""
    frame = sc(load("fantasy-machinery/gateFrame.png"), w=fw)
    fx0 = cx - fw / 2
    ix0, ix1 = fx0 + fw * 44 / 352, fx0 + fw * 306 / 352
    iy0, iy1 = ytop + frame.height * 90 / 544, ytop + frame.height * 486 / 544
    inner = vgrad(round(ix1 - ix0), round(iy1 - iy0), (14, 12, 26, 255), (*light, 255))
    comp(layer, inner, round(ix0), round(iy0))
    gate = sc(load("fantasy-machinery/gate.png"), w=(ix1 - ix0) + 8)
    gl_ = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    gy = iy1 - gate.height * 0.985 - (iy1 - iy0) * open_frac
    comp(gl_, gate, round(ix0 - 4), round(gy))
    mk = Image.new("L", layer.size, 0)
    ImageDraw.Draw(mk).rectangle((ix0, iy0, ix1, iy1), fill=255)
    gl_.putalpha(ImageChops.multiply(gl_.getchannel("A"), mk))
    layer.alpha_composite(gl_)
    put(layer, frame, cx, ytop, anchor="tc", shadow=0.7)
    return (ix0, iy0, ix1, iy1)


def steel_ball(d):
    im = sphere(d, (240, 246, 255), (140, 156, 196), (40, 50, 92), rim=(120, 160, 255))
    k = 3
    big = im.resize((d * k, d * k), LRES)
    band = Image.new("RGBA", big.size, (0, 0, 0, 0))
    bd = ImageDraw.Draw(band)
    bd.polygon([(0, d * k * 0.52), (d * k, d * k * 0.30), (d * k, d * k * 0.44), (0, d * k * 0.68)], fill=(196, 136, 70, 255))
    bd.polygon([(0, d * k * 0.55), (d * k, d * k * 0.33), (d * k, d * k * 0.37), (0, d * k * 0.59)], fill=(255, 214, 150, 255))
    band.putalpha(ImageChops.multiply(band.getchannel("A"), big.getchannel("A")))
    big.alpha_composite(band)
    bd2 = ImageDraw.Draw(big)
    for fx in (0.28, 0.5, 0.72):
        cx, cy = d * k * fx, d * k * (0.575 - (fx - 0.5) * 0.45)
        bd2.ellipse((cx - d * k * 0.035, cy - d * k * 0.035, cx + d * k * 0.035, cy + d * k * 0.035), fill=(70, 46, 26, 255))
    sp = ImageDraw.Draw(big)
    sp.ellipse((d * k * 0.2, d * k * 0.12, d * k * 0.44, d * k * 0.3), fill=(255, 255, 255, 190))
    return big.resize((d, d), LRES)


def song_ball(d):
    im = sphere(d, (255, 236, 244), (255, 150, 196), (150, 52, 118), rim=(160, 180, 255))
    k = 3
    big = im.resize((d * k, d * k), LRES)
    note_glyph(big, d * k * 0.5, d * k * 0.52, d * k * 0.36, color=(255, 244, 214), outline=(150, 70, 100, 255))
    sp = ImageDraw.Draw(big)
    sp.ellipse((d * k * 0.18, d * k * 0.1, d * k * 0.42, d * k * 0.26), fill=(255, 255, 255, 170))
    return big.resize((d, d), LRES)


def dust(layer, cx, cy, n, spread, rmin, rmax, color=(150, 142, 160), a=0.25, seed=3):
    rnd = random.Random(seed)
    for _ in range(n):
        x = cx + rnd.uniform(-spread, spread)
        y = cy + rnd.uniform(-spread * 0.35, spread * 0.35)
        r = rnd.uniform(rmin, rmax)
        glow(layer, x, y, r, color, a, power=1.2, add=False)


def debris(layer, cx, cy, n, spread, seed=5, cols=((92, 84, 108), (66, 60, 82), (170, 116, 62), (120, 110, 130))):
    rnd = random.Random(seed)
    d = ImageDraw.Draw(layer)
    for _ in range(n):
        x = cx + rnd.uniform(-spread, spread)
        y = cy + rnd.uniform(-spread * 0.6, spread * 0.6)
        s = rnd.uniform(4, 11)
        a = rnd.uniform(0, math.tau)
        pts = [(x + math.cos(a + i * 1.7) * s * rnd.uniform(0.6, 1.1), y + math.sin(a + i * 1.7) * s * rnd.uniform(0.6, 1.1)) for i in range(4)]
        c = rnd.choice(cols)
        d.polygon(pts, fill=(*c, 255), outline=(20, 18, 30, 255))
        d.line(pts[:2], fill=(255, 255, 255, 70), width=1)


def stars_ring(layer, cx, cy, rx, ry, n=5, size=7, seed=0, color=(255, 232, 150)):
    d = ImageDraw.Draw(layer)
    for i in range(n):
        a = i * math.tau / n + seed
        x, y = cx + math.cos(a) * rx, cy + math.sin(a) * ry * 0.5
        pts = []
        for j in range(10):
            aa = -math.pi / 2 + j * math.pi / 5
            r = size if j % 2 == 0 else size * 0.42
            pts.append((x + r * math.cos(aa), y + r * math.sin(aa)))
        d.polygon(pts, fill=(*color, 255), outline=(120, 80, 20, 255))


def mini_paddle_ring(layer, cx, cy, pips, lumi=False, w=104):
    pad = (lumi_paddle if lumi else kit_paddle)(w, 18)
    screen_glow(layer, cx, cy + 6, w * 0.7, (255, 150, 200) if lumi else (110, 150, 255), 0.3, ry=18)
    put(layer, pad, cx, cy, shadow=0.7)
    ring = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    rd = ImageDraw.Draw(ring)
    for i, (wd, al) in enumerate([(5, 50), (3, 120), (1.6, 255)]):
        rd.rounded_rectangle((cx - 18 - i, cy - 14 - i, cx + 18 + i, cy + 14 + i), 9, outline=(255, 226, 170, al), width=int(wd + 0.5))
    layer.alpha_composite(ring.filter(ImageFilter.GaussianBlur(0.8)))
    d = ImageDraw.Draw(layer)
    for i in range(3):
        px = cx + (i - 1) * 13
        on = i < pips
        d.ellipse((px - 4, cy - 29, px + 4, cy - 21), fill=(255, 226, 170, 255) if on else (50, 58, 100, 255), outline=(10, 12, 28, 255))
        if on:
            screen_glow(layer, px, cy - 25, 10, (255, 210, 140), 0.7)


def ram_burst(layer, x, y, d, ball, bricks, seed=7, dir_=1):
    """Giant ball ploughing a row of bricks: trail behind, bricks bursting ahead."""
    tr = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    trail(tr, [(x - dir_ * d * 1.5, y + d * 0.05), (x - dir_ * d * 1.0, y), (x - dir_ * d * 0.5, y - d * 0.02), (x, y)],
          (255, 214, 150), d * 0.25, d * 0.82, 0, 170)
    layer.alpha_composite(tr)
    screen_glow(layer, x, y, d * 1.0, (255, 190, 120), 0.45)
    rnd = random.Random(seed)
    for i, name in enumerate(bricks):
        bx = x + dir_ * (d * 0.75 + i * d * 0.34 + rnd.uniform(-4, 10))
        by = y + rnd.uniform(-d * 0.55, d * 0.55) * (0.4 + i * 0.3)
        b = brick_img(name, round(d * 0.5))
        put(layer, b, bx, by, rot=rnd.uniform(-50, 50) * dir_, shadow=0.5)
    put(layer, ball, x, y, shadow=0.6)
    sparks(layer, x + dir_ * d * 0.5, y, 14, d * 0.2, d * 1.0, seed=seed)


# ---- board 1 panels
def kit_hero(w, h):
    S = Image.new("RGBA", (w, h), (0, 0, 0, 255))
    bg = hall_bg(w, h, fx=0.5, fy=0.36, mult=0.62, sat=0.55, wash=(14, 20, 46), wash_a=0.38, blur=2.0)
    S.alpha_composite(bg)
    screen_glow(S, 760, 250, 330, (255, 140, 70), 0.16, ry=200)
    screen_glow(S, 250, 250, 250, (255, 196, 130), 0.2, ry=190)
    # winch wheel, gate behind the hero
    put(S, sc(trim(load("fantasy-machinery/wheel.png")), w=128), 104, 262, rot=-14, shadow=0.7)
    d_ = ImageDraw.Draw(S)
    for i in range(8):
        a = math.radians(-215 + i * 26)
        cx_, cy_ = 104 + math.cos(a) * 78, 262 + math.sin(a) * 78
        on = i < 3
        d_.ellipse((cx_ - 6, cy_ - 6, cx_ + 6, cy_ + 6), fill=(255, 226, 170, 255) if on else (40, 48, 90, 255), outline=(10, 12, 28, 255))
        if on:
            screen_glow(S, cx_, cy_, 14, (255, 200, 120), 0.7)
    gate_scene(S, 284, 40, 226, open_frac=0.22)
    # floor sheen
    fl = vgrad(w, 70, (20, 24, 52, 0), (10, 12, 28, 200))
    comp(S, fl, 0, h - 70)
    # Korr, facing the gate
    korr = trim(load("fantasy-machinery/korr-windup.png"))
    dust(S, 760, 392, 7, 190, 34, 60, a=0.18, seed=11)
    put(S, sc(korr, s=1.08), 740, 396, anchor="bc", flip=True, shadow=0.7, sh_off=(0, 4))
    # Kit, braced behind the shield
    kit = trim(load("kit/Idle_00.png"))
    screen_glow(S, 478, 360, 130, (120, 160, 255), 0.35, ry=34)
    put(S, sc(kit, s=2.05), 478, 392, anchor="bc", shadow=0.7)
    return S


def panel_drawbridge(w, h):
    S = Image.new("RGBA", (w, h), (0, 0, 0, 255))
    S.alpha_composite(hall_bg(w, h, fx=0.5, fy=0.62, mult=0.4, sat=0.45, wash=(14, 20, 46), wash_a=0.4, blur=2))
    screen_glow(S, 152, 120, 170, (255, 170, 100), 0.18, ry=110)
    # counterweights hanging from the top corners with chains to the bridge
    cw = trim(load("fantasy-machinery/counterweight.png"))
    chain = trim(load("fantasy-machinery/chain-v2.png"))
    for x, rot in ((52, 0), (252, 0)):
        put(S, sc(chain, h=96), x, 34, shadow=0.4)
        put(S, sc(cw, w=62), x, 104, rot=rot, shadow=0.6)
    # the bridge, mid-fall
    plinth = trim(load("fantasy-machinery/plinth.png"))
    put(S, sc(plinth, w=210), 154, 158, rot=-17, shadow=0.7)
    d = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    dust(d, 150, 206, 9, 100, 22, 42, a=0.30, seed=2)
    debris(d, 150, 168, 22, 98, seed=4)
    S.alpha_composite(d)
    # impact lines
    dd = ImageDraw.Draw(S)
    for x, y, a in ((48, 190, 200), (262, 190, -20), (80, 220, 230), (230, 224, -50)):
        dd.line([(x, y), (x + math.cos(math.radians(a)) * 20, y + math.sin(math.radians(a)) * 14)], fill=(255, 232, 190, 200), width=3)
    caption(S, "1 · DRAWBRIDGE CRASH")
    return S


def panel_holes(w, h):
    S = Image.new("RGBA", (w, h), (0, 0, 0, 255))
    S.alpha_composite(hall_bg(w, h, fx=0.5, fy=0.5, mult=0.4, sat=0.45, wash=(14, 20, 46), wash_a=0.4, blur=2))
    # gallery ledge across the top with a smouldering hole
    plinth = trim(load("fantasy-machinery/plinth.png"))
    hole = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(hole).ellipse((92, 34, 176, 84), fill=(4, 4, 10, 255))
    S.alpha_composite(hole)
    screen_glow(S, 134, 66, 64, (255, 110, 40), 0.9, ry=40, power=1.4)
    put(S, sc(plinth, w=300), 150, -30, anchor="tc", shadow=0.6)
    # falling bell with streaks
    bell = trim(load("fantasy-machinery/bell.png"))
    tr = Image.new("RGBA", S.size, (0, 0, 0, 0))
    trail(tr, [(134, 52), (136, 80), (138, 108)], (255, 214, 160), 3, 22, 0, 160)
    S.alpha_composite(tr)
    put(S, sc(bell, w=58), 138, 126, rot=-8, shadow=0.7)
    # ramp and winch wheel
    ramp = trim(load("fantasy-machinery/ramp.png"))
    put(S, sc(ramp, w=170), 108, 186, rot=-12, shadow=0.7)
    wheel = load("fantasy-machinery/wheel.png")
    put(S, sc(wheel, w=92), 252, 150, rot=-20, shadow=0.7)
    d = ImageDraw.Draw(S)
    for i in range(8):
        a = math.radians(-205 + i * 24)
        cx_, cy_ = 252 + math.cos(a) * 54, 146 + math.sin(a) * 54
        on = i < 3
        d.ellipse((cx_ - 3.5, cy_ - 3.5, cx_ + 3.5, cy_ + 3.5), fill=(255, 226, 170, 255) if on else (40, 48, 90, 255), outline=(10, 12, 28, 255))
        if on:
            screen_glow(S, cx_, cy_, 8, (255, 200, 120), 0.6)
    caption(S, "2 · MURDER HOLES")
    return S


def panel_duel(w, h):
    S = Image.new("RGBA", (w, h), (0, 0, 0, 255))
    S.alpha_composite(hall_bg(w, h, fx=0.5, fy=0.7, mult=0.42, sat=0.45, wash=(14, 20, 46), wash_a=0.4, blur=2))
    gate_scene(S, 70, 10, 110, open_frac=0.35)
    screen_glow(S, 200, 150, 150, (255, 140, 70), 0.14, ry=90)
    korr = trim(load("fantasy-machinery/korr-stagger.png"))
    put(S, sc(korr, s=0.5), 196, 186, anchor="bc", flip=True, shadow=0.7)
    d = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    stars_ring(d, 196, 64, 40, 36, n=5, size=6, seed=0.4)
    S.alpha_composite(d)
    ball = steel_ball(36)
    tr = Image.new("RGBA", S.size, (0, 0, 0, 0))
    trail(tr, [(290, 196), (268, 172), (246, 150)], (255, 214, 150), 6, 26, 0, 170)
    S.alpha_composite(tr)
    screen_glow(S, 244, 146, 40, (255, 200, 130), 0.5)
    put(S, ball, 244, 146, shadow=0.5)
    d2 = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    sparks(d2, 238, 144, 12, 14, 38, seed=3)
    S.alpha_composite(d2)
    caption(S, "3 · INNER GATE DUEL WITH KORR")
    return S


def kit_power(w, h):
    S = Image.new("RGBA", (w, h), (0, 0, 0, 255))
    S.alpha_composite(vgrad(w, h, (22, 28, 60, 255), (10, 12, 28, 255)))
    bg = hall_bg(w, h, fx=0.5, fy=0.75, mult=0.4, sat=0.4, wash=(14, 20, 46), wash_a=0.5, blur=3)
    bg.putalpha(90)
    S.alpha_composite(bg)
    kit = trim(load("kit/Idle_00.png"))
    screen_glow(S, 76, 138, 80, (120, 160, 255), 0.35, ry=18)
    put(S, sc(kit, s=1.0), 74, 150, anchor="bc", shadow=0.6)
    grad_text(S, (150, 18), "RAM BALL", font("lilita", 46), (255, 238, 214, 255), (255, 176, 130, 255), anchor="la", shadow=True)
    text(S, (152, 76), "Centre hit x3 lights the ring.", font("rubik", 17, 500), fill=(214, 224, 255), sh=1)
    text(S, (152, 100), "The next centre hit launches", font("rubik", 17, 500), fill=(214, 224, 255), sh=1)
    text(S, (152, 124), "a giant ball. 3 damage to Korr.", font("rubik", 17, 500), fill=(214, 224, 255), sh=1)
    # 1/3 2/3 3/3
    for i in range(3):
        cx = 440 + i * 92
        mini_paddle_ring(S, cx, 92, i + 1, w=80)
        text(S, (cx, 132), f"{i + 1}/3", font("lilita", 20), fill=(255, 226, 190), anchor="mm", sh=1)
    d = ImageDraw.Draw(S)
    d.polygon([(672, 80), (694, 92), (672, 104)], fill=(255, 219, 184, 230))
    ram_burst(S, 786, 80, 74, steel_ball(74), ["coral", "ivory", "sage", "coral"], seed=9)
    pill(S, (700, 134, 850, 156), (14, 18, 40, 225), (255, 219, 184, 160), width=1)
    text(S, (775, 145), "2.2x ball  \u00b7  14 bricks", font("rubik", 13, 700), fill=(255, 226, 190), anchor="mm", sh=1)
    return S


def build_gatehouse():
    board = board_background()
    # phone
    scene = gatehouse_phone()
    scr = scene.resize((SCR_W, SCR_H), LRES)
    hud(scr, SCR_W / PW, PW, score="1,240", floor_txt="FLOOR 2 / 3")
    # peek of floor 3 along the top edge is implied by the chip; vignette for focus
    scr = vignette(scr, 0.35, 2.0)
    phone_finish(board, scr.resize((SCR_W * K // 1, SCR_H * K // 1), LRES) if False else scr)
    cx0, cw = 548, 944
    title_block(board, "Gatehouse Siege", "Kit breaks in", "Korr holds the gate", cx=cx0 + cw // 2, y=18, size=92)
    finish_panel(board, kit_hero(cw, 392), cx0, 168, r=20)
    pw_, ph_ = 296, 224
    gap = (cw - 3 * pw_) // 2
    for i, fn in enumerate((panel_drawbridge, panel_holes, panel_duel)):
        finish_panel(board, fn(pw_, ph_), cx0 + i * (pw_ + gap), 582, r=16)
    finish_panel(board, kit_power(cw, 164), cx0, 830, r=18, border=(255, 219, 184, 120))
    return finish_board(board, "kit-gatehouse-siege-v1.png")


# ================================================================ BOARD 2
def wall_bg(w, h, mult=0.8, wash=(30, 22, 60), wash_a=0.18, seed_flip=True):
    """Tower-interior wall: vault wall bricks (plate.png), mirror-tiled to height."""
    plate = load("vault/plate.png")
    tile = plate.crop((0, 1000, 720, 1560))
    stack = Image.new("RGBA", (720, 560 * 4))
    for i in range(4):
        stack.paste(tile.transpose(Image.FLIP_TOP_BOTTOM) if i % 2 else tile, (0, 560 * i))
    bg = crop_cover(stack, w, h, 0.5, 0.0)
    return shade(bg, mult, 0.9, wash, wash_a)


def brick_sprite(color, wide, variant=0):
    """Vault glaze brick sprite (72x72 / 120x72), trimmed of its shadow margin."""
    name = f"vault/brick_{color}_{2 if wide else 1}_{variant}.png"
    return load(name)


def lumi_orb_face():
    tiles = lumi_tiles()
    if tiles:
        return tiles["glance"], (30, 22, 265, 257)
    f = load("princess/Idle_00.png")
    return f, (47, 26, 123, 102)


def moon_shaft(layer, x0, y0, x1, y1, spread, color=(150, 170, 255), a=0.14):
    """Soft slanted shaft of moonlight from a window into the room."""
    k = 1
    mask = Image.new("L", layer.size, 0)
    ImageDraw.Draw(mask).polygon([(x0, y0 - spread * 0.4), (x0, y0 + spread * 0.4), (x1, y1 + spread), (x1, y1 - spread)], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(spread * 0.25))
    col = Image.new("RGBA", layer.size, (*color, 255))
    col.putalpha(mask.point(lambda v: int(v * a)))
    layer.alpha_composite(col)


def lumi_phone():
    S = Image.new("RGBA", (PW * K, PH * K), (0, 0, 0, 255))

    def P(im, x, y, **kw):
        return put(S, im, x * K, y * K, **kw)

    S.alpha_composite(wall_bg(PW * K, PH * K, mult=0.85))
    S.alpha_composite(vgrad(PW * K, 300 * K, (10, 10, 30, 190), (10, 10, 30, 0)))
    # side walls (darker stone) frame the room
    for x0, flip in ((0, 0), (PW - 52, 1)):
        S.alpha_composite(wall_bg(52 * K, PH * K, mult=0.55, wash=(14, 12, 40), wash_a=0.3), (x0 * K, 0))
        ex = (x0 + (50 if not flip else 0)) * K
        S.alpha_composite(Image.new("RGBA", (2 * K, PH * K), (150, 140, 210, 38)), (ex, 0))
    # three windows on the side walls
    win = window_arch(78 * K, 0)
    wins = [(34, 205, False), (359, 395, True), (34, 585, False)]
    for cx_, cy_, snake in wins:
        screen_glow(S, cx_ * K, cy_ * K, 64 * K, (120, 150, 255), 0.30 if not snake else 0.12, ry=76 * K)
        P(win, cx_, cy_, shadow=0.6)
        if not snake:
            moon_shaft(S, (cx_ + 26) * K, cy_ * K, (cx_ + 170) * K, (cy_ + 100) * K, 36 * K, a=0.12)
    # lanterns on the walls
    lan = load("vault/lantern.png")
    for lx, ly in ((26, 440), (367, 560), (26, 700)):
        screen_glow(S, lx * K, ly * K, 56 * K, (255, 170, 90), 0.55, ry=56 * K)
        P(sc(lan, w=24 * K), lx, ly)

    # hatch above the stair bricks (floor-3 exit)
    bars = trim(load("vault/bars.png"))
    screen_glow(S, 196 * K, 205 * K, 120 * K, (255, 190, 220), 0.22, ry=70 * K)
    P(sc(bars, w=118 * K), 196, 205, shadow=0.7)
    text(S, (196 * K, 244 * K), "HATCH  3 / 12", font("lilita", 13 * K), fill=(255, 220, 232), anchor="mm", sh=2)

    # vault bricks: running bond, 15 cols x 19 u
    cell = 19.0
    x_left, y_top, rows = 63.0, 300.0, 10
    colors = ["t", "v", "c", "y", "b", "v", "c", "t", "v", "b"]
    rnd = random.Random(21)
    bite_row = 5
    for r in range(rows):
        col = colors[r]
        c = 0
        off = 0 if r % 2 == 0 else 1
        cells = 14
        while c < cells:
            wide = (c + off) % 2 == 0 and c + 1 < cells and not (off and c == 0)
            if off and c == 0:
                wide = False
            elif c == cells - 1:
                wide = False
            if wide:
                spr = brick_sprite(col, True, rnd.choice([0, 0, 0, 1, 2] if r > 1 else [0]))
                cx_ = x_left + (c + 1) * cell
                P(sc(spr, w=(32 + 8) * cell / 16 * K), cx_, y_top + r * cell + cell / 2, shadow=0.35, sh_off=(0, 2))
                c += 2
            else:
                spr = brick_sprite(col, False, 0)
                cx_ = x_left + (c + 0.5) * cell
                P(sc(spr, w=(16 + 8) * cell / 16 * K), cx_, y_top + r * cell + cell / 2, shadow=0.35, sh_off=(0, 2))
                c += 1
    # a couple of treasure/plate bricks
    for (r, c, kind) in ((2, 5, "gold"), (6, 9, "granite"), (1, 11, "gold"), (8, 3, "gold")):
        spr = load(f"vault/brick_{kind}_1_0.png")
        P(sc(spr, w=(16 + 8) * cell / 16 * K), x_left + (c + 0.5) * cell, y_top + r * cell + cell / 2)

    # bite lane: warned glow across one row, chevrons toward the window
    by = y_top + bite_row * cell
    band = Image.new("RGBA", S.size, (0, 0, 0, 0))
    bd = ImageDraw.Draw(band)
    bd.rectangle((54 * K, (by - 3) * K, (PW - 54) * K, (by + cell + 3) * K), fill=(255, 90, 70, 70))
    S.alpha_composite(band.filter(ImageFilter.GaussianBlur(5 * K)))
    edge = Image.new("RGBA", S.size, (0, 0, 0, 0))
    ed = ImageDraw.Draw(edge)
    for yy in (by - 2, by + cell + 2):
        ed.line([(56 * K, yy * K), ((PW - 56) * K, yy * K)], fill=(255, 150, 110, 230), width=2 * K)
    S.alpha_composite(edge.filter(ImageFilter.GaussianBlur(1.2 * K)))
    screen_glow(S, 190 * K, (by + cell / 2) * K, 160 * K, (255, 100, 70), 0.55, ry=22 * K, power=1.2)
    for i in range(6):
        cx_ = 86 + i * 30
        ch = Image.new("RGBA", S.size, (0, 0, 0, 0))
        ImageDraw.Draw(ch).polygon([((cx_ + 7) * K, (by + 3) * K), ((cx_ - 1) * K, (by + cell / 2) * K), ((cx_ + 7) * K, (by + cell - 3) * K),
                                    ((cx_ + 3) * K, (by + cell - 3) * K), ((cx_ - 5) * K, (by + cell / 2) * K), ((cx_ + 3) * K, (by + 3) * K)],
                                   fill=(255, 236, 190, 120 + i * 22))
        S.alpha_composite(ch)

    # Gnash lunging through the right window, head over the bite lane
    bodyL = Image.new("RGBA", S.size, (0, 0, 0, 0))
    pts = bezier((372 * K, 352 * K), (392 * K, 404 * K), (350 * K, 420 * K), (292 * K, 414 * K), n=40)
    snake_body(bodyL, pts, 40 * K)
    S.alpha_composite(bodyL)
    head = trim(load("snake-emerald/head_strike_l.png"))
    screen_glow(S, 262 * K, 412 * K, 76 * K, (255, 90, 70), 0.30, ry=50 * K)
    P(sc(head, w=140 * K), 256, 412, shadow=0.7)

    # ball with trail and the pink-gold paddle with sweet-spot ring
    tr = Image.new("RGBA", S.size, (0, 0, 0, 0))
    trail(tr, [(96 * K, 740 * K), (118 * K, 690 * K), (140 * K, 640 * K), (156 * K, 606 * K)], (255, 214, 236), 3 * K, 14 * K, 0, 210)
    S.alpha_composite(tr)
    screen_glow(S, 158 * K, 602 * K, 28 * K, (255, 200, 230), 0.5)
    P(pearl(18 * K), 158, 602)
    pdx, pdy = 214, 770
    screen_glow(S, pdx * K, (pdy + 8) * K, 90 * K, (255, 140, 190), 0.4, ry=24 * K)
    P(lumi_paddle(122 * K, 24 * K), pdx, pdy, shadow=0.7)
    ring = Image.new("RGBA", S.size, (0, 0, 0, 0))
    rd = ImageDraw.Draw(ring)
    for i, (wd, al) in enumerate([(10, 60), (6, 130), (3, 255)]):
        rd.rounded_rectangle(((pdx - 22) * K - i, (pdy - 17) * K - i, (pdx + 22) * K + i, (pdy + 17) * K + i), 12 * K, outline=(255, 226, 170, al), width=wd)
    S.alpha_composite(ring.filter(ImageFilter.GaussianBlur(1.2)))
    d = ImageDraw.Draw(S)
    for i in range(3):
        cx_, cy_ = pdx + (i - 1) * 16, pdy - 30
        r = 4.4 * K
        on = i < 1
        d.ellipse((cx_ * K - r, cy_ * K - r, cx_ * K + r, cy_ * K + r), fill=(255, 226, 170, 255) if on else (70, 50, 90, 255), outline=(10, 12, 28, 255))
        if on:
            screen_glow(S, cx_ * K, cy_ * K, 12 * K, (255, 210, 140), 0.7)

    # Lumi's face orb with song-charge ring
    face, crop = lumi_orb_face()
    orb(S, 46 * K, 804 * K, 32 * K, face, crop, (255, 170, 210), frac=0.55, bg=(40, 24, 70))
    return S


def lumi_hero(w, h):
    S = Image.new("RGBA", (w, h), (0, 0, 0, 255))
    S.alpha_composite(wall_bg(w, h, mult=0.7, wash=(24, 18, 56), wash_a=0.3))
    S.alpha_composite(vgrad(w, h, (8, 8, 24, 120), (8, 8, 24, 20)))
    screen_glow(S, 700, 200, 360, (110, 140, 255), 0.22, ry=220)
    screen_glow(S, 190, 210, 260, (255, 150, 200), 0.22, ry=200)
    # big arched window, snake pouring in
    win = window_arch(250, 0)
    screen_glow(S, 700, 200, 230, (120, 150, 255), 0.25, ry=210)
    put(S, win, 700, 4, anchor="tc", shadow=0.6)
    body = Image.new("RGBA", S.size, (0, 0, 0, 0))
    pts = bezier((790, 120), (790, 250), (700, 330), (520, 262), n=48)
    snake_body(body, pts, 56)
    S.alpha_composite(body)
    head = trim(load("snake-emerald/head_hiss_l.png"))
    screen_glow(S, 478, 238, 150, (255, 110, 90), 0.20, ry=100)
    put(S, sc(head, w=222), 480, 240, shadow=0.7)
    # Lumi portrait card
    tiles = lumi_tiles()
    card_w = 300
    if tiles:
        face = tiles["determined"].resize((card_w, card_w), LRES)
    else:
        face = sc(load("princess/Idle_00.png").crop((40, 30, 130, 160)), w=card_w)
        face = crop_cover(face, card_w, card_w)
    card = Image.new("RGBA", (card_w, card_w), (40, 24, 70, 255))
    card.alpha_composite(face)
    cm = rmask((card_w, card_w), 28)
    card.putalpha(cm)
    screen_glow(S, 190, 210, 230, (255, 150, 200), 0.3, ry=230)
    put(S, card, 190, 206, shadow=0.7)
    ring = Image.new("RGBA", (card_w + 12, card_w + 12), (0, 0, 0, 0))
    ImageDraw.Draw(ring).rounded_rectangle((0, 0, card_w + 11, card_w + 11), 34, outline=(255, 205, 160, 255), width=5)
    put(S, ring, 190, 206)
    for x, y, sz in ((350, 90, 30), (372, 140, 22), (60, 70, 24)):
        note_glyph(S, x, y, sz, color=(255, 214, 236), outline=(160, 70, 110, 255))
    return S


def panel_cell(w, h):
    S = Image.new("RGBA", (w, h), (0, 0, 0, 255))
    S.alpha_composite(wall_bg(w, h, mult=0.7))
    screen_glow(S, 150, 120, 150, (255, 150, 200), 0.24, ry=100)
    lumi = trim(load("princess/Idle_00.png"))
    put(S, sc(lumi, s=1.25), 150, 190, anchor="bc", shadow=0.6)
    bars = trim(load("vault/bars.png"))
    put(S, sc(bars, w=250), 150, 126, shadow=0.7)
    # bar bricks bursting
    d = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    rnd = random.Random(8)
    for i, (x, y) in enumerate(((60, 52), (100, 38), (200, 44), (246, 62))):
        spr = brick_sprite(["v", "c", "y", "t"][i], False, 0)
        put(d, sc(spr, w=40), x, y, rot=rnd.uniform(-40, 40), shadow=0.5)
    sparks(d, 150, 52, 10, 40, 110, seed=2)
    S.alpha_composite(d)
    caption(S, "1 \u00b7 THE CELL")
    return S


def panel_windows(w, h):
    S = Image.new("RGBA", (w, h), (0, 0, 0, 255))
    S.alpha_composite(wall_bg(w, h, mult=0.7))
    screen_glow(S, 230, 90, 140, (110, 140, 255), 0.22, ry=100)
    win = window_arch(104, 0)
    put(S, win, 238, 0, anchor="tc", shadow=0.6)
    # bite row glow
    band = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(band).rectangle((0, 112, w, 142), fill=(255, 90, 70, 90))
    S.alpha_composite(band.filter(ImageFilter.GaussianBlur(5)))
    screen_glow(S, 150, 126, 160, (255, 100, 70), 0.45, ry=24, power=1.2)
    for r, col in enumerate(["v", "c"]):
        for c in range(8):
            put(S, sc(brick_sprite(col, True, 0), w=48), 24 + c * 36 + (r % 2) * 18, 116 + r * 18 + 6 if r == 0 else 144, shadow=0.3)
    body = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    snake_body(body, bezier((330, 40), (310, 100), (290, 126), (212, 128), n=30), 24)
    S.alpha_composite(body)
    put(S, sc(trim(load("snake-emerald/head_strike_l.png")), w=104), 180, 128, shadow=0.7)
    ed = ImageDraw.Draw(S)
    for i in range(4):
        cx_ = 46 + i * 20
        ed.polygon([(cx_ + 6, 118), (cx_ - 1, 127), (cx_ + 6, 136), (cx_ + 3, 136), (cx_ - 4, 127), (cx_ + 3, 118)], fill=(255, 236, 190, 130 + i * 25))
    caption(S, "2 \u00b7 SERPENT WINDOWS")
    return S


def panel_roof(w, h):
    S = Image.new("RGBA", (w, h), (0, 0, 0, 255))
    plate = load("vault/plate.png")
    sky = crop_cover(plate.crop((0, 0, 720, 330)), w, h, 0.5, 0.2)
    S.alpha_composite(shade(sky, 0.85, 0.9, (20, 20, 60), 0.15))
    screen_glow(S, 40, 40, 90, (210, 220, 255), 0.25)
    # battlement floor strip
    ImageDraw.Draw(S).rectangle((0, h - 62, w, h), fill=(34, 30, 54, 255))
    cradle = trim(load("fantasy-machinery/bellCradle.png"))
    cr = sc(cradle, w=178)
    put(S, cr, 118, 150, anchor="bc", shadow=0.7)
    put(S, sc(trim(load("fantasy-machinery/bell.png")), w=66), 112, 118, rot=-6, shadow=0.7)
    d = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    screen_glow(d, 112, 118, 70, (255, 200, 130), 0.35)
    S.alpha_composite(d)
    # rescue rope drops from the top-right, Kit on the wall
    chain = trim(load("fantasy-machinery/chain-v2.png"))
    ImageDraw.Draw(S).rounded_rectangle((196, 106, 282, 126), 4, fill=(58, 52, 84, 255), outline=(120, 112, 160, 255))
    put(S, sc(chain, h=64), 222, 160, shadow=0.4)
    put(S, sc(trim(load("kit/Cheer_00.png")), s=0.85), 244, 110, anchor="bc", shadow=0.6)
    lum = trim(load("princess/Cheer_00.png"))
    put(S, sc(lum, s=1.1), 52, h - 40, anchor="bc", shadow=0.6)
    # ring counter 3/5
    dd = ImageDraw.Draw(S)
    for i in range(5):
        cx_ = 164 + i * 20
        on = i < 3
        dd.ellipse((cx_ - 6, 180 - 6, cx_ + 6, 180 + 6), fill=(255, 226, 170, 255) if on else (50, 58, 100, 255), outline=(10, 12, 28, 255))
        if on:
            screen_glow(S, cx_, 180, 12, (255, 210, 140), 0.7)
    caption(S, "3 \u00b7 ROOF RACE: BELL + ROPE")
    return S


def lumi_power(w, h):
    S = Image.new("RGBA", (w, h), (0, 0, 0, 255))
    S.alpha_composite(vgrad(w, h, (30, 24, 60, 255), (12, 12, 30, 255)))
    cw = w // 3
    for i in (1, 2):
        ImageDraw.Draw(S).line([(i * cw, 18), (i * cw, h - 18)], fill=(140, 166, 255, 70), width=1)
    heads = ["LULLABY", "STARLIGHT NOTES", "RAM BALL"]
    subs = [("Calms Gnash for 4 s.", "Cancels his lunge."),
            ("Next 6 broken bricks", "drop power-ups that", "drift to the paddle."),
            ("3 centre hits, then a", "giant song-note ball.", "3 damage to Gnash.")]
    for i in range(3):
        x0 = i * cw
        grad_text(S, (x0 + 18, 12), heads[i], font("lilita", 30), (255, 238, 214, 255), (255, 170, 205, 255), anchor="la", shadow=True)
        for j, line in enumerate(subs[i]):
            text(S, (x0 + 20, 62 + j * 22), line, font("rubik", 15, 500), fill=(214, 224, 255), sh=1)
    # 1: lullaby: sleepy snake, sound rings, notes
    x0 = 0
    d1 = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    for r in (22, 38, 54):
        ImageDraw.Draw(d1).arc((x0 + 232 - r, 112 - r, x0 + 232 + r, 112 + r), 140, 220, fill=(255, 190, 225, 230 - r * 2), width=3)
    S.alpha_composite(d1)
    put(S, sc(trim(load("snake-emerald/head_dizzy_l.png")), w=92), x0 + 262, 118, shadow=0.6)
    ImageDraw.Draw(S).text((x0 + 288, 70), "z", font=font("lilita", 24), fill=(200, 214, 255, 255))
    note_glyph(S, x0 + 190, 130, 24, outline=(160, 70, 110, 255))
    note_glyph(S, x0 + 214, 92, 18, outline=(160, 70, 110, 255))
    # 2: starlight notes: capsules drifting to the paddle
    x0 = cw
    tr = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    trail(tr, [(x0 + 196, 56), (x0 + 220, 90), (x0 + 252, 120), (x0 + 262, 140)], (255, 214, 236), 3, 8, 0, 120)
    S.alpha_composite(tr)
    for nm, cx_, cy_, ang in (("cap_wide", x0 + 200, 66, 12), ("cap_shield", x0 + 246, 98, -8), ("cap_split", x0 + 282, 76, 10)):
        screen_glow(S, cx_, cy_, 30, (255, 200, 230), 0.4)
        put(S, sc(trim(load(f"vault/{nm}.png")), w=48), cx_, cy_, rot=ang, shadow=0.6)
    for nx, ny in ((x0 + 224, 54), (x0 + 270, 118)):
        note_glyph(S, nx, ny, 16, outline=(160, 70, 110, 255))
    put(S, lumi_paddle(84, 16), x0 + 252, 146, shadow=0.6)
    # 3: ram ball with note skin
    x0 = 2 * cw
    ram_burst(S, x0 + 214, 108, 54, song_ball(54), ["coral", "ivory", "sage"], seed=4)
    return S


def build_lumi():
    board = board_background()
    scene = lumi_phone()
    scr = scene.resize((SCR_W, SCR_H), LRES)
    hud(scr, SCR_W / PW, PW, score="860", floor_txt="FLOOR 2 / 3", accent=(255, 170, 210))
    scr = vignette(scr, 0.35, 2.0)
    phone_finish(board, scr)
    cx0, cw = 548, 944
    title_block(board, "Lumi Breaks Out", "Lumi breaks out", "Gnash coils the tower", cx=cx0 + cw // 2, y=18, size=92,
                top=(255, 240, 226), bot=(255, 168, 200))
    finish_panel(board, lumi_hero(cw, 392), cx0, 168, r=20)
    pw_, ph_ = 296, 224
    gap = (cw - 3 * pw_) // 2
    for i, fn in enumerate((panel_cell, panel_windows, panel_roof)):
        finish_panel(board, fn(pw_, ph_), cx0 + i * (pw_ + gap), 582, r=16)
    finish_panel(board, lumi_power(cw, 164), cx0, 830, r=18, border=(255, 190, 220, 120))
    return finish_board(board, "lumi-breaks-out-v1.png")


if __name__ == "__main__":
    which = sys.argv[1] if len(sys.argv) > 1 else "all"
    if which in ("all", "gatehouse"):
        build_gatehouse()
    if which in ("all", "lumi"):
        build_lumi()
