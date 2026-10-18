"""Assemble review-only comparisons from rendered PNGs without repainting assets."""
from pathlib import Path
import json
from PIL import Image,ImageDraw,ImageFont

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'out/orbital-art-proof'
font=ImageFont.truetype(str(ROOT/'out/brum-proof/LilitaOne-Regular.ttf'),22)
reference=Image.open(ROOT/'art/space/source/orbital-hull-reference.png').convert('RGBA')
assembly=Image.open(OUT/'source-open.png').convert('RGBA')
width=912
board=Image.new('RGB',(width*2+24,450),'#060a13')
draw=ImageDraw.Draw(board)
for x,title,image in [(0,'APPROVED C · source crop',reference),(width+24,'ACTUAL C PARTS · open assembly',assembly)]:
    draw.text((x+14,12),title,font=font,fill='#c0d1df')
    size=(width,round(width*image.height/image.width))
    board.paste(image.resize(size,Image.Resampling.LANCZOS),(x,48),image.resize(size,Image.Resampling.LANCZOS))
board.save(OUT/'source-comparison.png')
for name in ['ios','android']:
    a=Image.open(OUT/f'{name}-reference.png').convert('RGB')
    b=Image.open(OUT/f'{name}-open.png').convert('RGB')
    target=Image.new('RGB',(a.width+b.width,a.height),'#060a13')
    target.paste(a,(0,0));target.paste(b,(a.width,0));target.save(OUT/f'{name}-comparison.png')

hull=Image.open(ROOT/'assets/space-c/hull.png').convert('RGBA')
checker=Image.new('RGB',hull.size)
d=ImageDraw.Draw(checker)
for y in range(0,hull.height,40):
    for x in range(0,hull.width,40):
        d.rectangle((x,y,x+39,y+39),fill='#263345' if (x//40+y//40)%2 else '#46546a')
checker.paste(hull,(0,0),hull)
checker.resize((996,398),Image.Resampling.LANCZOS).save(OUT/'hull-alpha-checker.png')
frames=[]
for i in range(36):
    frame=Image.open(OUT/f'motion-{i:02}.png').convert('RGB').crop((0,96,393,274))
    frames.append(frame.quantize(colors=256,method=Image.Quantize.MEDIANCUT))
frames[0].save(OUT/'shutter-motion.gif',save_all=True,append_images=frames[1:],duration=110,loop=0,disposal=2)

report=json.loads((OUT/'asset-report.json').read_text())
report['reviewMedia']=['source-comparison.png','ios-comparison.png','android-comparison.png','hull-alpha-checker.png','shutter-motion.gif']
report['limits']=['Hull/hangar family only; cannon barrels and remaining C families are missing.','No gameplay collision admission, runtime packing, memory/performance or APK validation.']
(OUT/'asset-report.json').write_text(json.dumps(report,indent=2)+'\n')
print('C source/native comparisons, alpha checker and36-frame shutter proof saved.')
