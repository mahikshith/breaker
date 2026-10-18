import json, math, hashlib, sys
from pathlib import Path
from PIL import Image, ImageDraw
import numpy as np

base=Path(sys.argv[1] if len(sys.argv)>1 else 'out/weapon-vfx-v2/qa/final')
report=json.loads((base/'report.json').read_text())
scenes=json.loads(Path('out/weapon-vfx-v2/scenes.json').read_text())
result=[]
for case in report['cases']:
    for boss in ['carrier','circuit','forge']:
        scene=scenes['scenes'][boss+'-'+case['device']]
        frames=[f for f in case['frames'] if f['boss']==boss]
        idle=np.array(Image.open(next(f['path'] for f in frames if f['name']=='idle')).convert('RGBA'))
        x0=int((scene['offsetX']+245*scene['scale'])*2);x1=int((scene['offsetX']+375*scene['scale'])*2)
        y0=int((scene['offsetY']+125*scene['scale'])*2);y1=int((scene['offsetY']+460*scene['scale'])*2)
        mask=np.ones(idle.shape[:2],bool)
        mask[max(y0,0):min(y1,idle.shape[0]),max(x0,0):min(x1,idle.shape[1])]=False
        outside=[];crops=[]
        for frame in frames:
            im=Image.open(frame['path']).convert('RGBA');cur=np.array(im)
            changed=np.any(cur!=idle,axis=2)
            outside.append({'phase':frame['name'],'changedOutsideEffectRegion':int((changed&mask).sum())})
            im=im.convert('RGB').resize((im.width//2,im.height//2),Image.Resampling.LANCZOS)
            crops.append(im.crop((170,130,im.width,545)))
        sheet=Image.new('RGB',(crops[0].width*len(crops),445),'#090c18');draw=ImageDraw.Draw(sheet)
        for i,(im,frame) in enumerate(zip(crops,frames)):
            sheet.paste(im,(i*im.width,26));draw.text((i*im.width+5,7),frame['name'],fill='white')
        sheet.save(base/f'{case["family"]}-{case["device"]}-{boss}-cycle.png')
        rect=scene['target']['rect'];mx,my=scene['muzzle']['x'],scene['muzzle']['y'];angle=scene['pose']['angle']
        cx=mx-math.tan(angle)*(rect['y']-my)
        result.append({'family':case['family'],'device':case['device'],'boss':boss,'surfaceContact':[cx,rect['y']],'targetXRange':[rect['x'],rect['x']+rect['w']],'contactInsideTargetTop':rect['x']<=cx<=rect['x']+rect['w'],'frames':outside})
assert all(x['contactInsideTargetTop'] for x in result)
assert max(f['changedOutsideEffectRegion'] for x in result for f in x['frames'])==0
(base/'geometry-and-stability.json').write_text(json.dumps(result,indent=2))
print(json.dumps({'nativeCases':len(result),'offEffectPixelChanges':0,'allContactPointsInsideTargetTop':True,'reportSHA256':hashlib.sha256((base/'report.json').read_bytes()).hexdigest()}))
