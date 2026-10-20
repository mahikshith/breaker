from pathlib import Path
import json
import hashlib
import numpy as np
from PIL import Image,ImageDraw,ImageFont

ROOT=Path(__file__).resolve().parents[2]
HERE=Path(__file__).parent
M=json.loads((ROOT/'assets/starflight-storm/manifest.json').read_text())
P=M['parts']
font=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',17)
small=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',13)


def layered(size, centre, scale, spread=0, rise=0):
    image=Image.new('RGBA',size)
    for name in ['body','wing-left','wing-right']:
        part=P[name]
        raster=Image.open(ROOT/part['path']).convert('RGBA')
        raster=raster.resize((round(320*scale),round(288*scale)),Image.Resampling.LANCZOS)
        offset=np.array(part['neutralOffset'])*320/52*scale
        if name!='body':offset+=np.array([(-1 if name=='wing-left' else 1)*spread,-rise])*scale
        pivot=part['pivot']
        image.alpha_composite(raster,(round(centre[0]+offset[0]-raster.width*pivot[0]),round(centre[1]+offset[1]-raster.height*pivot[1])))
    return image


proof=Image.new('RGBA',(1440,550),'#080e18')
d=ImageDraw.Draw(proof)
for col,title in enumerate(['Existing player','Three-layer neutral composite','Actual parts detached']):
    d.text((col*480+20,15),title,font=font,fill='#e4eff8')
    d.text((col*480+20,42),'Source pixels / original scale',font=small,fill='#9aafc1')
    if col==0:proof.alpha_composite(Image.open(HERE/'player-reference.png'),(80,70))
    else:proof.alpha_composite(layered((480,288),(240,144),1,spread=100 if col==2 else 0), (col*480,70))
    d.text((col*480+20,385),'393px viewport scale:52u =56.77px',font=small,fill='#9aafc1')
    scale=(52/320)*(393/360)
    if col==0:
        raster=Image.open(HERE/'player-reference.png').resize((round(320*scale),round(288*scale)),Image.Resampling.LANCZOS)
        proof.alpha_composite(raster,(col*480+240-raster.width//2,455-raster.height//2))
    else:proof.alpha_composite(layered((480,120),(240,60),scale,spread=165 if col==2 else 0,rise=55 if col==2 else 0),(col*480,395))
d.text((20,523),'Staged art proof only. Neutral RGBA composite is exact; runtime lightning, timing and collision are separate.',font=small,fill='#a4b9c9')
proof.convert('RGB').save(HERE/'assembly-proof.png')

native=Image.new('RGB',(865,1004),'#111924')
draw=ImageDraw.Draw(native)
draw.text((24,14),'DETACHABLE WINGS / NATIVE ART COMPOSITION',font=font,fill='#e4eff8')
draw.text((24,40),'Fixed body; actual wing-engine pieces. Staged parts only, no gameplay or lightning-field claim.',font=small,fill='#9aafc1')
for ox,width,height in [(24,393,852),(437,412,915)]:
    bg=Image.open(ROOT/'assets/starflight/background.png').convert('RGBA')
    bg=bg.resize((width,round(bg.height*width/bg.width)),Image.Resampling.LANCZOS)
    screen=Image.new('RGBA',(width,height),'#02040a')
    for y in range(0,height,bg.height):screen.alpha_composite(bg,(0,y))
    scale=width/360
    screen.alpha_composite(layered((width,height),(width/2,height*.79),(52/320)*scale,spread=480,rise=1500))
    for name,x in [('storm-icon',width*.35),('ricochet',width*.67)]:
        part=P[name];raster=Image.open(ROOT/part['path']);h=58;w=round(h*raster.width/raster.height)
        raster=raster.resize((w,h),Image.Resampling.LANCZOS);screen.alpha_composite(raster,(round(x-w/2),height-100))
    native.paste(screen.convert('RGB'),(ox,67))
    draw.text((ox+8,75),f'{width} × {height}',font=small,fill='#9aafc1')
native.save(HERE/'native-proof.png')
print(json.dumps({'assemblyProofSHA256':hashlib.sha256((HERE/'assembly-proof.png').read_bytes()).hexdigest(),
    'nativeProofSHA256':hashlib.sha256((HERE/'native-proof.png').read_bytes()).hexdigest()}))
