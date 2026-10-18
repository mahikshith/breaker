"""Crop approved source components, preserve lossless crops, and normalize alpha cells."""
from pathlib import Path
from collections import deque
import json,hashlib
import numpy as np
from PIL import Image,ImageFilter

ROOT=Path(__file__).resolve().parents[2];HERE=Path(__file__).resolve().parent
recipe=json.loads((HERE/'common-crops.json').read_text());source=ROOT/recipe['source'];assert hashlib.sha256(source.read_bytes()).hexdigest()==recipe['sourceSHA256']
OUT=ROOT/'assets/space-common';CROPS=OUT/'source-crops';OUT.mkdir(parents=True,exist_ok=True);CROPS.mkdir(exist_ok=True)
atlas=Image.open(source).convert('RGBA');px=recipe['pxPerWorldUnit']

def largest_component(mask):
    h,w=mask.shape;seen=np.zeros_like(mask);best=[]
    for y,x in zip(*np.nonzero(mask)):
        if seen[y,x]:continue
        todo=deque([(int(x),int(y))]);seen[y,x]=True;component=[]
        while todo:
            xx,yy=todo.popleft();component.append((xx,yy))
            for nx,ny in [(xx-1,yy),(xx+1,yy),(xx,yy-1),(xx,yy+1)]:
                if 0<=nx<w and 0<=ny<h and mask[ny,nx]and not seen[ny,nx]:seen[ny,nx]=True;todo.append((nx,ny))
        if len(component)>len(best):best=component
    out=np.zeros_like(mask,dtype=np.uint8)
    for x,y in best:out[y,x]=255
    return Image.fromarray(out)

manifest={'version':1,'status':'generated intact common parts; normalized and pending native assembly review','source':recipe['source'],'sourceSHA256':recipe['sourceSHA256'],'prompt':'art/space/common-prompt.md','recipe':'art/space/common-crops.json','normalizer':'art/space/normalize_common.py','references':['design/phase1/img/space-carrier-a.png','design/phase1/img/space-relay-b.png'],'pxPerWorldUnit':px,'filter':'linear','sourcePreserved':'Returned original retained byte-for-byte. source-crops preserve original pixels in each lossless crop; canonical cells remove disconnected faint alpha flecks and resample uniformly. No painted geometry changes.','parts':{}}
for name,spec in recipe['parts'].items():
    partsource=ROOT/spec.get('source',recipe['source'])
    if 'sourceSHA256'in spec:assert hashlib.sha256(partsource.read_bytes()).hexdigest()==spec['sourceSHA256']
    partimage=Image.open(partsource).convert('RGBA')if 'source'in spec else atlas
    region=spec['region'];raw=partimage.crop(region);a=np.array(raw.getchannel('A'));main=largest_component(a>recipe['alphaMainThreshold']);bbox=main.getbbox();assert bbox,name
    e=recipe['softEdgeSourcePixels'];bbox=(max(0,bbox[0]-e),max(0,bbox[1]-e),min(raw.width,bbox[2]+e),min(raw.height,bbox[3]+e))
    crop=raw.crop(bbox);crop.save(CROPS/(name+'.png'))
    keep=np.array(main.filter(ImageFilter.MaxFilter(e*2+1)));clean=np.array(raw);clean[:,:,3][(keep==0)|(clean[:,:,3]<=recipe['alphaZeroThreshold'])]=0;clean[clean[:,:,3]==0,:3]=0
    clean=Image.fromarray(clean).crop(bbox);target=[round(x*px)for x in spec['visibleTarget']];scale=min(target[0]/clean.width,target[1]/clean.height);size=[max(1,round(clean.width*scale)),max(1,round(clean.height*scale))]
    clean=clean.resize(size,Image.Resampling.LANCZOS);cell=[round(x*px)for x in spec['cell']];im=Image.new('RGBA',cell);offset=[(cell[i]-size[i])//2 for i in range(2)];im.alpha_composite(clean,offset);path=OUT/(name+'.png');im.save(path)
    alpha=np.array(im.getchannel('A'));bb=im.getchannel('A').getbbox();solid=im.getchannel('A').point(lambda v:255 if v>16 else 0).getbbox()
    assert bb and all([bb[0]>=11,bb[1]>=11,cell[0]-bb[2]>=11,cell[1]-bb[3]>=11]),(name,bb,cell)
    row={'path':path.relative_to(ROOT).as_posix(),'size':cell,'pivot':[cell[0]/2,cell[1]/2],'pivotNormalized':[.5,.5],'cellWorldUnits':spec['cell'],'visibleTargetWorldUnits':spec['visibleTarget'],'actualAlphaBounds':bb,'solidAlphaBounds':solid,'actualVisibleWorldUnits':[(solid[2]-solid[0])/px,(solid[3]-solid[1])/px],'collisionSuggestedWorldUnits':[(solid[2]-solid[0])/px,(solid[3]-solid[1])/px],'sourceRegion':region,'sourceCropWithinRegion':bbox,'sourceCrop':(CROPS/(name+'.png')).relative_to(ROOT).as_posix(),'uniformScale':scale,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'role':spec['role'],'states':['intact'],'aperture':None,'notes':'Uniform contain normalization preserves the generated aspect. Collision should use measured visible art, not the larger transparent cell.'}
    row['source']=partsource.relative_to(ROOT).as_posix();row['sourceSHA256']=hashlib.sha256(partsource.read_bytes()).hexdigest()
    if name=='brick_pink':row['prompt']='art/space/brick-pink-prompt.md'
    if name=='brick_pink':row['supersededBy']='assets/space-a/brick_pink.png';row['notes']+=' Historical common-chassis rose variant. Carrier A uses the dedicated mechanical panel family.'
    if name=='ball':row['collisionSuggestedWorldUnits']=[10,10];row['notes']+=' Tight outer halo is decorative; opaque pearl core is about10u.'
    if name=='brick_crew_lock':
        cx,cy=cell[0]//2,cell[1]//2;assert alpha[cy,cx]==0
        xl=cx;xr=cx;yt=cy;yb=cy
        while xl>0 and alpha[cy,xl-1]==0:xl-=1
        while xr<cell[0]-1 and alpha[cy,xr+1]==0:xr+=1
        while yt>0 and alpha[yt-1,cx]==0:yt-=1
        while yb<cell[1]-1 and alpha[yb+1,cx]==0:yb+=1
        # Inset the center scan to avoid the opening's chamfered corners.
        rect=[xl+3,yt+3,xr-2,yb-2]
        while np.max(alpha[rect[1]:rect[3],rect[0]:rect[2]])>0:
            rect=[rect[0]+1,rect[1]+1,rect[2]-1,rect[3]-1];assert rect[2]>rect[0]and rect[3]>rect[1]
        row['aperture']={'safeTransparentPixels':rect,'safeTransparentNormalized':[rect[0]/cell[0],rect[1]/cell[1],(rect[2]-rect[0])/cell[0],(rect[3]-rect[1])/cell[1]],'layering':'Payload behind frame; this tile contains no worker or glass','mountCenterPixels':[cx,cy]}
    with Image.open(path)as check:assert check.mode=='RGBA'and not check.info and check.getchannel('A').getextrema()==(0,255),(name,check.info)
    manifest['parts'][name]=row
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n');print(json.dumps({k:{'size':v['size'],'alpha':v['actualAlphaBounds'],'visible':v['actualVisibleWorldUnits'],'aperture':v['aperture']}for k,v in manifest['parts'].items()},indent=2))
