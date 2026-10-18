"""Slice the reference-guided Forge family and derive collision from its alpha."""
from pathlib import Path
from collections import defaultdict
import hashlib, json, math
import numpy as np
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[3]
SRC = Path(__file__).resolve().parent
OUT = ROOT / 'assets/orbital-forge'
OUT.mkdir(exist_ok=True)
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()

def area(points):
    return sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(points, points[1:]+points[:1]))/2

def simplify(points, eps=1):
    def rdp(p):
        if len(p)<3: return p
        a,b=p[0],p[-1]; dx,dy=b[0]-a[0],b[1]-a[1]; den=math.hypot(dx,dy)
        d=[abs(dx*(a[1]-q[1])-(a[0]-q[0])*dy)/den if den else math.hypot(q[0]-a[0],q[1]-a[1]) for q in p]
        i=max(range(len(p)),key=lambda i:d[i])
        return rdp(p[:i+1])[:-1]+rdp(p[i:]) if d[i]>eps else [a,b]
    i=max(range(1,len(points)),key=lambda i:(points[i][0]-points[0][0])**2+(points[i][1]-points[0][1])**2)
    return rdp(points[:i+1])[:-1]+rdp(points[i:]+points[:1])[:-1]

def contours(image):
    a=np.asarray(image.getchannel('A'))>=128
    edges=defaultdict(list)
    for y,x in zip(*np.nonzero(a)):
        if y==0 or not a[y-1,x]: edges[(int(x),int(y))].append((int(x+1),int(y)))
        if x==a.shape[1]-1 or not a[y,x+1]: edges[(int(x+1),int(y))].append((int(x+1),int(y+1)))
        if y==a.shape[0]-1 or not a[y+1,x]: edges[(int(x+1),int(y+1))].append((int(x),int(y+1)))
        if x==0 or not a[y,x-1]: edges[(int(x),int(y+1))].append((int(x),int(y)))
    loops=[]
    while edges:
        start=next(iter(edges)); p=start; points=[]
        while True:
            points.append(p); q=edges[p].pop()
            if not edges[p]: del edges[p]
            p=q
            if p==start: break
            if p not in edges: raise AssertionError('unclosed alpha boundary')
        if abs(area(points))>=12: loops.append(simplify(points,1.2))
    outer=[p for p in loops if area(p)>0]
    holes=[p for p in loops if area(p)<0]
    assert outer
    norm=lambda p:[[round(x/image.width,7),round(y/image.height,7)] for x,y in p]
    # Large disconnected pieces retain separate contours; tiny highlights are decoration.
    return [{'type':'polygon','points':norm(p),'holes':[norm(h) for h in holes if min(x for x,y in p)<=h[0][0]<=max(x for x,y in p) and min(y for x,y in p)<=h[0][1]<=max(y for x,y in p)]} for p in outer if area(p)>=image.width*image.height*.0005]

parts={}
def save(id,image,source,crop=None,display=None,shared=False,contour=True):
    image=image.convert('RGBA')
    if not shared:
        box=image.getchannel('A').point(lambda a:255 if a>=16 else 0).getbbox(); assert box
        crop=box if crop is None else crop
        image=image.crop(box)
        cv=Image.new('RGBA',(image.width+8,image.height+8));cv.alpha_composite(image,(4,4));image=cv
    if image.width>900 and id not in ['hull','bay_mask','bay_back','door_left','door_right']:
        image=image.resize((900,round(image.height*900/image.width)),Image.Resampling.LANCZOS)
    path=OUT/(id+'.png');image.save(path);assert not Image.open(path).info
    parts[id]={'path':path.relative_to(ROOT).as_posix(),'size':list(image.size),'pivot':[.5,.5], 'sha256':sha(path),'source':source.relative_to(ROOT).as_posix(),'sourceSHA256':sha(source),'crop':list(crop) if crop else None,'metadataEmpty':True}
    if display: parts[id]['display']=[display,display*image.height/image.width]
    bounds=image.getchannel('A').point(lambda a:255 if a>=128 else 0).getbbox()
    parts[id]['artBounds']=[bounds[0]/image.width,bounds[1]/image.height,(bounds[2]-bounds[0])/image.width,(bounds[3]-bounds[1])/image.height]
    if contour: parts[id]['shapes']=contours(image)
    return image

opened=Image.open(SRC/'stabiliser-open-source.png').convert('RGBA')
box=opened.getchannel('A').point(lambda a:255 if a>=16 else 0).getbbox()
opened=opened.crop(box)
opened=opened.resize((900,round(opened.height*900/opened.width)),Image.Resampling.LANCZOS)
# Part ownership separates the visible energy cartridge from its U-shaped metal frame.
mask=Image.new('L',opened.size); mask.paste(255,(round((432-box[0])*900/(box[2]-box[0])),round((360-box[1])*900/(box[2]-box[0])),round((832-box[0])*900/(box[2]-box[0])),round((928-box[1])*900/(box[2]-box[0]))))
coil=opened.copy();coil.putalpha(ImageChops.multiply(opened.getchannel('A'),mask))
body=opened.copy();body.putalpha(ImageChops.subtract(opened.getchannel('A'),coil.getchannel('A')))
save('station_body',body,SRC/'stabiliser-open-source.png',box,55,True)
save('station_coil',coil,SRC/'stabiliser-open-source.png',box,55,True)
save('station_cover',Image.open(SRC/'stabiliser-cover-source.png'),SRC/'stabiliser-cover-source.png',display=55)

projector=Image.open(SRC/'projector-source.png').convert('RGBA')
pbox=projector.getchannel('A').point(lambda a:255 if a>=16 else 0).getbbox()
projector=projector.crop(pbox)
mask=Image.new('L',projector.size)
from PIL import ImageDraw
ImageDraw.Draw(mask).ellipse((445-pbox[0],785-pbox[1],812-pbox[0],1127-pbox[1]),fill=255)
core=projector.copy();core.putalpha(ImageChops.multiply(projector.getchannel('A'),mask))
arm=projector.copy();arm.putalpha(ImageChops.subtract(projector.getchannel('A'),core.getchannel('A')))
save('projector_arm',arm,SRC/'projector-source.png',pbox,55,True)
save('reactor',core,SRC/'projector-source.png',pbox,55,True)
save('cannon',Image.open(SRC/'cannon-source.png'),SRC/'cannon-source.png',display=42)

atlas=Image.open(SRC/'panel-family-source.png').convert('RGBA')
rows=np.any(np.asarray(atlas.getchannel('A'))>=128,axis=1)
groups=[]; start=None
for y,on in enumerate(rows):
    if on and start is None:start=y
    if start is not None and (not on or y==len(rows)-1):
        end=y if not on else y+1
        if end-start>70:groups.append((start,end))
        start=None
assert len(groups)==3,groups
for id,(y0,y1) in zip(['cyan','violet','armour'],groups):save(id,atlas.crop((0,y0,atlas.width,y1)),SRC/'panel-family-source.png',crop=(0,y0,atlas.width,y1),display=40)

bg=Image.open(SRC/'background-source.png').convert('RGBA')
save('background',bg,SRC/'background-source.png',shared=True,contour=False)

machinery=json.loads((ROOT/'assets/space-c/machinery.json').read_text())
for p in machinery['parts']:
    im=Image.open(ROOT/p['path']).convert('RGBA')
    parts[p['id']]={**p,'display':[360,360*im.height/im.width]}
    if p['id']=='hull':parts[p['id']]['shapes']=contours(im)

ab=json.loads((ROOT/'design/phase1/space-assets-ab.json').read_text())
for id,source_id in [('paddle','aPaddle'),('ball','ball')]:
    p=ab['parts'][source_id]; im=Image.open(ROOT/p['path']).convert('RGBA'); bounds=im.getchannel('A').point(lambda a:255 if a>=128 else 0).getbbox(); parts[id]={**p,'size':list(im.size),'pivot':p.get('pivot',[.5,.5]),'sha256':sha(ROOT/p['path']),'artBounds':[bounds[0]/im.width,bounds[1]/im.height,(bounds[2]-bounds[0])/im.width,(bounds[3]-bounds[1])/im.height]}

result={'date':'2026-10-18','scope':'Selected Shutter Forge isolated art family; runtime admission pending','reference':'design/phase1/img/orbital-variety-study-v3.png','referenceSHA256':sha(ROOT/'design/phase1/img/orbital-variety-study-v3.png'),'generationReferences':['design/phase1/img/orbital-variety-study-v2.png','assets/space-c/hull.png'],'parts':parts,'machinery':machinery['assembly'],'source':{'directory':'art/space/forge/','method':'reference-guided raster parts; editable alpha decomposition and deterministic source contours in prepare.py'},'semantics':{'stationDisplayWidth':55,'stationCoilRegionOriginal':[432,360,832,928],'coreRegionOriginal':[445,785,812,1127],'gunPivot':[.5,.23],'gunMuzzle':[.5,.82],'hullWorldRect':[0,76,360,machinery['assembly']['displayHeight']]}}
(OUT/'manifest.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'parts':{k:{'size':v['size'],'display':v.get('display'),'shapes':len(v.get('shapes',[]))} for k,v in parts.items()},'manifestSHA256':sha(OUT/'manifest.json')},indent=2))
