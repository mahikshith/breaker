from pathlib import Path
import hashlib,json,math
from PIL import Image,ImageDraw
import numpy as np

ROOT=Path(__file__).resolve().parents[2];FAMILY=ROOT/'assets/frost-warden';OUT=ROOT/'out/frost-warden-proof';OUT.mkdir(parents=True,exist_ok=True)
m=json.loads((FAMILY/'manifest.json').read_text());atlas=Image.open(ROOT/m['atlas']).convert('RGBA')
assert atlas.size==(1792,912) and not atlas.info
assert hashlib.sha256((ROOT/m['atlas']).read_bytes()).hexdigest()==m['sha256']
assert len(m['anchors'])==28 and len(m['clips'])==7
native=Image.new('RGBA',(4*198,7*180),'#101729');overlay=native.copy();report={'atlasSHA256':m['sha256'],'frames':[]}
frames=[]
for i,f in enumerate(m['frames']):
    im=Image.open(ROOT/f['file']).convert('RGBA');assert im.size==(256,228) and not im.info
    assert hashlib.sha256((ROOT/f['file']).read_bytes()).hexdigest()==f['sha256']
    assert atlas.crop((i%7*256,i//7*228,i%7*256+256,i//7*228+228)).tobytes()==im.tobytes()
    a=np.array(im);assert not a[0,:,3].any() and not a[-1,:,3].any() and not a[:,0,3].any() and not a[:,-1,3].any()
    assert not a[a[:,:,3]==0,:3].any()
    anchor=m['anchors'][i];assert anchor['fist']['r']>0 and anchor['body']['w']>=8
    assert len(anchor['bodyShapes'])>=4
    col=i%4;row=i//4;x=col*198+12;y=row*180+21;s=1.2
    sprite=im.resize((round(144*s),round(128*s)),Image.Resampling.LANCZOS)
    native.alpha_composite(sprite,(x,y));overlay.alpha_composite(sprite,(x,y));d=ImageDraw.Draw(overlay)
    def point(px,py):return (x+(72+px)*s,y+(116+py)*s)
    for box in anchor['bodyShapes']:
        p=point(box['x'],box['y']);q=point(box['x']+box['w'],box['y']+box['h']);d.rectangle((*p,*q),outline='#8ee8b1',width=1)
    fist=anchor['fist'];cx,cy=point(fist['x'],fist['y']);r=fist['r']*s;d.ellipse((cx-r,cy-r,cx+r,cy+r),outline='#ff729f',width=1)
    d.line([point(*anchor[k])for k in ['shoulder','elbow','wrist']],fill='#f2c282',width=1)
    for canvas in [native,overlay]:ImageDraw.Draw(canvas).text((col*198+10,row*180+5),f"{anchor['clip']} {anchor['pose']+1} /4",fill='#d9e2ee')
    report['frames'].append({'index':i,'bodyWidth':anchor['body']['w'],'bodyShapes':len(anchor['bodyShapes']),'fist':fist,'alphaBounds':f['bounds']})
    frames.append(im)
native.convert('RGB').save(OUT/'native-clips.png');overlay.convert('RGB').save(OUT/'measured-overlays.png')
motion=[];durations=[]
for clip,seconds in [('windup',1.8),('strike',.48),('recover',3.5)]:
    c=m['clips'][clip]
    for i in c['frames']:
        bg=Image.new('RGBA',(256,250),'#101729');bg.alpha_composite(frames[i],(0,20));ImageDraw.Draw(bg).text((10,6),f'STAGED RIG MOTION: {clip}',fill='#d9e2ee');motion.append(bg.convert('RGB'));durations.append(round(seconds/4*1000))
motion[0].save(OUT/'punch-motion.gif',save_all=True,append_images=motion[1:],duration=durations,loop=0,disposal=2)
report['bodyWidthRange']=[min(f['bodyWidth']for f in report['frames']),max(f['bodyWidth']for f in report['frames'])]
report['maximumForwardFist']=max((f['fist']for f in report['frames'][12:16]),key=lambda v:v['x']+v['r'])
report['limits']='Source/native sprite and projected-anchor proof, not earned gameplay, human balance or device performance.'
(OUT/'report.json').write_text(json.dumps(report,indent=2));print(json.dumps({k:report[k]for k in ['atlasSHA256','bodyWidthRange','maximumForwardFist']}))
