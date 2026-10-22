# Review contact sheet: Kit's face portraits beside Lumi's (full size + 56 px orb), plus the paddle swap strips.
# Pillow only.  python3 art/lumi_sheet.py [out.png]
import sys, os
from PIL import Image, ImageDraw, ImageFont
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
OUT = sys.argv[1] if len(sys.argv) > 1 else '/mnt/project-files/breaker/review-2026-10-22/lumi-faces.png'
PAIRS = [('Idle', 'Idle', 'Idle - determined / serve'), ('Focus', 'Focus', 'Focus - aiming'), ('Worried', 'Nervous', 'Nervous / Worried - danger'),
         ('Shock', 'Panic', 'Panic / Shock - life lost'), ('Cheer', 'Cheer', 'Cheer - win'), ('Hurt', 'Hurt', 'Hurt - hit')]
F = lambda s: ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', s)
BG = (20, 24, 49)
def face(char, name):
    return Image.open(os.path.join(ROOT, 'assets', char, 'faces', f'{name}_face_00.png')).convert('RGBA')
def orb(im, d=56, scale=1):
    D = d * scale; m = Image.new('L', (D * 4, D * 4), 0); ImageDraw.Draw(m).ellipse((0, 0, D * 4 - 1, D * 4 - 1), fill=255)
    m = m.resize((D, D), Image.Resampling.LANCZOS)
    f = im.resize((D, D), Image.Resampling.LANCZOS); bgc = Image.new('RGBA', (D, D), (30, 36, 70, 255)); bgc.alpha_composite(f)
    out = Image.new('RGBA', (D, D), (0, 0, 0, 0)); out.paste(bgc, (0, 0), m)
    ring = Image.new('RGBA', (D * 4, D * 4), (0, 0, 0, 0)); ImageDraw.Draw(ring).ellipse((2, 2, D * 4 - 3, D * 4 - 3), outline=(160, 190, 255, 255), width=8)
    out.alpha_composite(ring.resize((D, D), Image.Resampling.LANCZOS)); return out
CELL, ROWH, PAD = 288, 330, 16
W = PAD + 2 * (CELL + PAD) + 2 * 160 + PAD
sheet = Image.new('RGB', (W + 0, 70 + ROWH * len(PAIRS) + 440), BG); d = ImageDraw.Draw(sheet)
d.text((PAD, 14), 'Lumi vs Kit face orbs - 288 px portraits and 56 px phone orbs (1x and 2x)', font=F(22), fill='white')
d.text((PAD, 44), 'left: Kit    right: Lumi', font=F(14), fill=(170, 180, 220))
for i, (k, l, label) in enumerate(PAIRS):
    y = 70 + i * ROWH
    for j, (ch, nm) in enumerate((('kit', k), ('princess', l))):
        im = face(ch, nm); x = PAD + j * (CELL + PAD)
        sheet.paste(im, (x, y), im)
    d.text((PAD, y + 296), label, font=F(15), fill='white')
    x0 = PAD + 2 * (CELL + PAD)
    for j, (ch, nm) in enumerate((('kit', k), ('princess', l))):
        im = face(ch, nm); x = x0 + j * 160
        o1 = orb(im, 56, 1); o2 = orb(im, 56, 2)
        sheet.paste(o1, (x + 20, y + 40), o1); sheet.paste(o2, (x + 20, y + 120), o2)
        d.text((x + 20, y + 20), 'Kit' if ch == 'kit' else 'Lumi', font=F(13), fill=(170, 180, 220))
# paddles
y = 70 + len(PAIRS) * ROWH + 10
d.text((PAD, y), 'Paddle: vault chrome (top) vs Lumi pink-gold (bottom) - identical slices, 3x', font=F(16), fill='white')
def strip(dirp):
    S = Image.new('RGBA', (246, 60), BG + (255,)); x = 0
    for n in 'lmr':
        im = Image.open(os.path.join(ROOT, dirp, f'paddle_{n}.png')).convert('RGBA'); S.alpha_composite(im, (x, 0)); x += im.size[0]
    return S
for r, dp in enumerate(('assets/vault', 'assets/princess/paddle')):
    s = strip(dp).resize((246 * 3, 180), Image.Resampling.LANCZOS) if False else strip(dp).resize((246 * 3, 60 * 3), Image.Resampling.LANCZOS)
    sheet.paste(s.convert('RGB'), (PAD, y + 30 + r * 200))
os.makedirs(os.path.dirname(OUT), exist_ok=True); sheet.save(OUT); print('wrote', OUT, sheet.size)
