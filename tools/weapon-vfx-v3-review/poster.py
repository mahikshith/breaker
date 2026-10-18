from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
import shutil,hashlib,json
root=Path('out/weapon-vfx-v3');canvas=Image.new('RGB',(1251,1500),'#080c17');d=ImageDraw.Draw(canvas)
title=ImageFont.truetype('out/brum-proof/LilitaOne-Regular.ttf',32);small=ImageFont.truetype('out/brum-proof/Rubik.ttf',16)
d.text((22,16),'Cannon fire crosses the intact field',font=title,fill='#f2dce9');d.text((22,60),'ANIMATION / PADDLE-COLLISION PROTOTYPE · NO PRODUCTION OR BALANCE APPROVAL',font=small,fill='#ae9eb8')
for row,(mode,label)in enumerate([('heavy','A · One heavy shot'),('salvo','B · Short three-shot salvo')]):
    y=98+row*694;d.text((22,y),label,font=title,fill='#ebc4df')
    for col,phase in enumerate(['MUZZLE DISCHARGE','ABOVE INTACT BRICKS','PADDLE IMPACT']):
        im=Image.open(root/'poster-frames'/f'{mode}-{col}.png').convert('RGB').resize((393,852),Image.Resampling.LANCZOS).crop((0,100,393,750));x=22+col*407;canvas.paste(im,(x,y+39));d.text((x,y+663),phase,font=small,fill='#c4b5cc')
canvas.save(root/'cannon-comparison.png')
target=Path('design/phase1/weapon-vfx-v3/review');target.mkdir(parents=True,exist_ok=True);shutil.copyfile(root/'cannon-comparison.png',target/'cannon-comparison.png')
print(hashlib.sha256((root/'cannon-comparison.png').read_bytes()).hexdigest())
