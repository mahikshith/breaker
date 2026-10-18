"""Normalize the dedicated Carrier A panels without modifying the Relay/common family."""
from pathlib import Path
from collections import deque
import json,hashlib
import numpy as np
from PIL import Image,ImageFilter
ROOT=Path(__file__).resolve().parents[2];HERE=Path(__file__).resolve().parent;OUT=ROOT/'assets/space-a';CROPS=OUT/'source-crops';CROPS.mkdir(exist_ok=True)
r=json.loads((HERE/'carrier-panels-crops.json').read_text());source=ROOT/r['source'];assert hashlib.sha256(source.read_bytes()).hexdigest()==r['sourceSHA256'];atlas=Image.open(source).convert('RGBA')
manifest={'version':1,'status':'Dedicated Carrier A panel source; normalized and pending native assembly review','pxPerWorldUnit':3,'source':r['source'],'sourceSHA256':r['sourceSHA256'],'prompt':r['prompt'],'recipe':'art/space/carrier-panels-crops.json','parts':{}}
for name,spec in r['parts'].items():
 raw=atlas.crop(spec['region']);mask=np.array(raw.getchannel('A'))>16;h,w=mask.shape;seen=np.zeros_like(mask);best=[]
 for y,x in zip(*np.nonzero(mask)):
  if seen[y,x]:continue
  todo=deque([(int(x),int(y))]);seen[y,x]=True;component=[]
  while todo:
   xx,yy=todo.popleft();component.append((xx,yy))
   for nx,ny in [(xx-1,yy),(xx+1,yy),(xx,yy-1),(xx,yy+1)]:
    if 0<=nx<w and 0<=ny<h and mask[ny,nx]and not seen[ny,nx]:seen[ny,nx]=True;todo.append((nx,ny))
  if len(component)>len(best):best=component
 main=np.zeros_like(mask,dtype=np.uint8)
 for x,y in best:main[y,x]=255
 main=Image.fromarray(main);bb=main.getbbox();assert bb;bb=(max(0,bb[0]-4),max(0,bb[1]-4),min(w,bb[2]+4),min(h,bb[3]+4));raw.crop(bb).save(CROPS/(name+'.png'))
 a=np.array(raw);keep=np.array(main.filter(ImageFilter.MaxFilter(9)));a[:,:,3][(keep==0)|(a[:,:,3]<=3)]=0;a[a[:,:,3]==0,:3]=0;clean=Image.fromarray(a).crop(bb)
 target=[round(x*3)for x in spec['visibleTarget']];scale=min(target[0]/clean.width,target[1]/clean.height);size=[round(clean.width*scale),round(clean.height*scale)];clean=clean.resize(size,Image.Resampling.LANCZOS)
 cell=[round(x*3)for x in spec['cell']];im=Image.new('RGBA',cell);im.alpha_composite(clean,[(cell[i]-size[i])//2 for i in range(2)]);path=OUT/(name+'.png');im.save(path)
 bbout=im.getchannel('A').getbbox();solid=im.getchannel('A').point(lambda x:255 if x>16 else 0).getbbox();assert min(bbout[0],bbout[1],cell[0]-bbout[2],cell[1]-bbout[3])>=11,(name,bbout)
 with Image.open(path)as check:assert not check.info and check.mode=='RGBA'and check.getchannel('A').getextrema()==(0,255)
 manifest['parts'][name]={'path':path.relative_to(ROOT).as_posix(),'size':cell,'pivot':[x/2 for x in cell],'pivotNormalized':[.5,.5],'cellWorldUnits':spec['cell'],'actualAlphaBounds':bbout,'solidAlphaBounds':solid,'actualVisibleWorldUnits':[(solid[2]-solid[0])/3,(solid[3]-solid[1])/3],'collisionSuggestedWorldUnits':[(solid[2]-solid[0])/3,(solid[3]-solid[1])/3],'role':spec['role'],'states':['intact'],'sourceRegion':spec['region'],'sourceCropWithinRegion':bb,'sourceCrop':(CROPS/(name+'.png')).relative_to(ROOT).as_posix(),'uniformScale':scale,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'notes':'Use this dedicated A family instead of the rounded Relay/common bricks and tube paddle. Uniform contain preserves source aspect; do not collide against alpha gutters.'}
(OUT/'common-panels-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n');print(json.dumps(manifest['parts'],indent=2))
