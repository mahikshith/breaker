"""Normalize the C machinery parts and measure its actual transparent aperture."""
from pathlib import Path
from collections import deque
import hashlib
import json
import numpy as np
from PIL import Image,ImageFilter

ROOT=Path(__file__).resolve().parents[2]
SOURCE=ROOT/'art/space/source'
OUT=ROOT/'assets/space-c'
OUT.mkdir(exist_ok=True)
hashfile=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
report=[]

def save(name,image,source,crop=None,pivot=(.5,.5)):
    target=OUT/(name+'.png')
    image.save(target)
    check=Image.open(target)
    assert not check.info,f'{name}: metadata'
    alpha=check.getchannel('A')
    assert alpha.getextrema()[0]==0 and alpha.getextrema()[1]>=250,f'{name}: missing useful alpha'
    for box in [(0,0,image.width,1),(0,0,1,image.height),(image.width-1,0,image.width,image.height),(0,image.height-1,image.width,image.height)]:
        assert alpha.crop(box).getextrema()[1]==0,f'{name}: no clear exterior padding'
    record={'id':name,'path':target.relative_to(ROOT).as_posix(),'size':list(image.size),'pivot':list(pivot),'alphaBounds':list(alpha.point(lambda v:255 if v>=16 else 0).getbbox()),'alphaRange':list(alpha.getextrema()),'transparentFraction':round(alpha.histogram()[0]/(image.width*image.height),5),'sha256':hashfile(target),'source':source.relative_to(ROOT).as_posix(),'sourceSHA256':hashfile(source),'crop':crop,'metadataEmpty':True}
    report.append(record)
    return record

def pad(image,n=4):
    target=Image.new('RGBA',(image.width+2*n,image.height+2*n))
    target.paste(image,(n,n))
    return target

hull_source=SOURCE/'orbital-hull-original.png'
original=Image.open(hull_source).convert('RGBA')
bounds=original.getchannel('A').point(lambda v:255 if v>=16 else 0).getbbox()
assert bounds
hull=pad(original.crop(bounds))
hull_record=save('hull',hull,hull_source,list(bounds))

alpha=np.asarray(hull.getchannel('A'))
seed=(round(hull.width*.50),round(hull.height*.78))
assert alpha[seed[1],seed[0]]<16,'seed is not inside the real bay aperture'
seen=np.zeros(alpha.shape,dtype=np.uint8)
queue=deque([seed]);seen[seed[1],seed[0]]=255
while queue:
    x,y=queue.popleft()
    assert 0<x<hull.width-1 and 0<y<hull.height-1,'bay aperture leaks into exterior transparency'
    for xx,yy in [(x-1,y),(x+1,y),(x,y-1),(x,y+1)]:
        if not seen[yy,xx] and alpha[yy,xx]<128:
            seen[yy,xx]=255;queue.append((xx,yy))
mask=Image.fromarray(seen).filter(ImageFilter.MaxFilter(5))
box=Image.fromarray(seen).getbbox()
assert box and box[2]-box[0]>hull.width*.20 and box[3]-box[1]>hull.height*.15,'bay opening collapsed'
mask_part=Image.new('RGBA',hull.size,(255,255,255,0));mask_part.putalpha(mask)
save('bay_mask',mask_part,hull_source,list(bounds))

door_source=SOURCE/'orbital-doors-original.png'
original=Image.open(door_source).convert('RGBA')
door_bounds=original.getchannel('A').point(lambda v:255 if v>=16 else 0).getbbox()
assert door_bounds
pair=pad(original.crop(door_bounds))
save('doors_pair',pair,door_source,list(door_bounds))
mid=pair.width//2
for name,span,pivot_x in [('door_left',(0,mid),mid+4),('door_right',(mid,pair.width),4)]:
    leaf=pad(pair.crop((span[0],0,span[1],pair.height)))
    save(name,leaf,door_source,[door_bounds[0]+span[0]-4,door_bounds[1]-4,door_bounds[0]+span[1]-4,door_bounds[3]+4],(pivot_x/leaf.width,.5))

bay_source=SOURCE/'orbital-bay-original.png'
bay_crop=(390,180,1690,610)
save('bay_back',pad(Image.open(bay_source).convert('RGBA').crop(bay_crop)),bay_source,list(bay_crop))

manifest={'date':'2026-10-18','status':'critical C hull/hangar asset proof; not runtime admitted','reference':'design/phase1/img/space-orbital-c-v1.png','referenceSHA256':hashfile(ROOT/'design/phase1/img/space-orbital-c-v1.png'),'prompts':'art/space/source/orbital-production-prompts.json','method':'reference-guided raster production, deterministic aspect-preserving alpha normalization','parts':report,'assembly':{'displayWidth':360,'displayHeight':360*hull.height/hull.width,'worldTop':76,'aperturePx':list(box),'pairVisibleSize':[pair.width-8,pair.height-8],'closedSeam':.5,'doorTravelPx':(box[2]-box[0])*.55,'drawOrder':['bay_back','door_left','door_right','hull'],'mask':'assets/space-c/bay_mask.png','notes':['Command optic and static cannon sockets belong to this hull proof.','Cannon barrels, fighters, pods and all other C families remain separate missing work.','Mask measures presentation aperture only, not a gameplay collision contour.']}}
(OUT/'machinery.json').write_text(json.dumps(manifest,indent=2)+'\n')
(SOURCE/'orbital-parts-report.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({'parts':[(r['id'],r['size']) for r in report],'assembly':manifest['assembly']},indent=2))
