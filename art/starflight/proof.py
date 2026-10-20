from pathlib import Path
import hashlib,json
import numpy as np
from PIL import Image,ImageDraw

ROOT=Path(__file__).resolve().parents[2];OUT=Path(__file__).parent;manifest=json.loads((ROOT/'assets/starflight/manifest.json').read_text())
bg=Image.open(ROOT/manifest['background']['path']).convert('RGB');sheet=Image.new('RGB',(720,1000),'#0a0e18');sheet.paste(bg.resize((720,1440)),(0,0));d=ImageDraw.Draw(sheet)
items=[('player',360,850,54),('scout',130,120,36),('gunship',550,230,72),('boss',360,500,248)]
report={'scope':'Native-size extracted raster proof; staged composition, not actual gameplay or collision proof','manifestSHA256':hashlib.sha256((ROOT/'assets/starflight/manifest.json').read_bytes()).hexdigest(),'assets':[]}
for name,cx,cy,width in items:
    part=manifest['ships'][name];im=Image.open(ROOT/part['path']);assert im.mode=='RGBA' and not im.info
    a=np.array(im);assert not a[0,:,3].any()and not a[-1,:,3].any()and not a[:,0,3].any()and not a[:,-1,3].any();assert not a[a[:,:,3]==0,:3].any()
    w=round(width*2);h=round(w*im.height/im.width);sprite=im.resize((w,h),Image.Resampling.LANCZOS)
    x=round(cx-w/2);y=round(cy-h/2);sheet.paste(sprite,(x,y),sprite);d.text((x,cy+h/2+8),name.upper(),fill='#dce6f1')
    for u,v in part['muzzles']:
        px=x+u*w;py=y+v*h;d.ellipse((px-2,py-2,px+2,py+2),outline='#eafaff')
    report['assets'].append({'id':name,'size':im.size,'sha256':hashlib.sha256((ROOT/part['path']).read_bytes()).hexdigest(),'transparentEdges':True,'metadataEmpty':True,'muzzles':part['muzzles']})
for part in manifest['effects'].values():
    im=Image.open(ROOT/part['path']);assert im.mode=='RGBA'and not im.info
assert not bg.info and np.array_equal(np.array(bg)[0],np.array(bg)[-1])
central=np.array(bg)[:,int(bg.width*.2):int(bg.width*.8)];lum=central.mean(axis=2);report['background']={'size':bg.size,'centreMeanRGB':float(central.mean()),'centreP95RGB':float(np.percentile(lum,95)),'verticalEdgeMaxRGBDifference':0}
sheet.save(OUT/'native-extraction-proof.png');(OUT/'asset-checks.json').write_text(json.dumps(report,indent=2));print(json.dumps(report['background']))
