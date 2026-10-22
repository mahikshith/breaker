"""Read-only raster/registration audit for the dedicated Mooncoil bricks."""
from pathlib import Path
import json, hashlib
from PIL import Image, ImageChops
import numpy as np
ROOT=Path(__file__).resolve().parents[2]
manifest_path=ROOT/'assets/mooncoil/bricks-manifest.json'
m=json.loads(manifest_path.read_text());items=[]
assert len(m['sprites'])==19
for key,s in m['sprites'].items():
    path=ROOT/s['path'];raw=path.read_bytes();im=Image.open(path)
    assert im.mode=='RGBA' and not im.info
    width=s['width'];assert s['footprint']==[16*width,16]
    assert s['drawSize']==[16*width+8,24] and s['margin']==4 and s['ppu']==3
    assert list(im.size)==s['px']==[(16*width+8)*3,72]
    assert hashlib.sha256(raw).hexdigest()==s['sha256']
    a=np.asarray(im);alpha=a[:,:,3];bounds=im.getchannel('A').getbbox()
    assert list(bounds)==s['alphaBounds'] and alpha.max()==255 and alpha.min()==0
    assert not a[alpha==0,:3].any(),'hidden RGB must be zero'
    padding=min(bounds[0],bounds[1],im.width-bounds[2],im.height-bounds[3])
    assert padding>=10,'transparent registration margin retained'
    solid=im.getchannel('A').point(lambda v:255 if v>=128 else 0).getbbox()
    items.append({'key':key,'sha256':s['sha256'],'px':s['px'],'footprint':s['footprint'],'alphaBounds':list(bounds),'solidAlphaBounds':list(solid),'paddingPixels':padding,'bytes':len(raw),'metadata':dict(im.info)})
for kind in [6,2,4,3]:
    for width in [1,2]:
        a=Image.open(ROOT/m['sprites'][f'{kind}_{width}_0']['path'])
        b=Image.open(ROOT/m['sprites'][f'{kind}_{width}_1']['path'])
        assert ImageChops.difference(a,b).convert('RGB').getbbox(),'damaged face must differ'
report={'scope':'Source PNG/registration/metadata/alpha audit. Source and native-scale family sheet viewed; runtime admission remains separate. No collision/gameplay edits.','manifestSHA256':hashlib.sha256(manifest_path.read_bytes()).hexdigest(),'sourceSHA256':hashlib.sha256((ROOT/'art/mooncoil/brick_assets.py').read_bytes()).hexdigest(),'parts':len(items),'encodedBytes':sum(i['bytes'] for i in items),'decodedRGBABytes':sum(i['px'][0]*i['px'][1]*4 for i in items),'minimumTransparentPaddingPixels':min(i['paddingPixels'] for i in items),'items':items,'pass':True}
target=ROOT/'art/mooncoil/proof/asset-report.json';target.write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k!='items'}))
