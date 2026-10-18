from pathlib import Path
from collections import deque
import hashlib,json
import numpy as np
from PIL import Image,ImageFilter

ROOT=Path(__file__).resolve().parents[3]
OUT=ROOT/'assets/circuit-companions';OUT.mkdir(exist_ok=True)
SOURCE=Path(__file__).parent/'source'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()

def main_component(im):
    a=np.array(im.getchannel('A'));mask=a>16;seen=np.zeros(mask.shape,bool);best=[]
    for y,x in zip(*np.where(mask)):
        if seen[y,x]:continue
        q=deque([(int(y),int(x))]);seen[y,x]=True;component=[]
        while q:
            cy,cx=q.popleft();component.append((cy,cx))
            for ny,nx in [(cy-1,cx),(cy+1,cx),(cy,cx-1),(cy,cx+1)]:
                if 0<=ny<a.shape[0] and 0<=nx<a.shape[1] and mask[ny,nx] and not seen[ny,nx]:seen[ny,nx]=True;q.append((ny,nx))
        if len(component)>len(best):best=component
    assert len(best)>1000
    keep=np.zeros(a.shape,np.uint8)
    for y,x in best:keep[y,x]=255
    keep=np.array(Image.fromarray(keep).filter(ImageFilter.MaxFilter(7)))>0
    pixels=np.array(im);pixels[:,:,3]=np.where(keep,a,0);pixels[pixels[:,:,3]==0]=0
    return Image.fromarray(pixels)

families={}
for name,cols,rows in [('vesper',3,3),('latch',4,2)]:
    source=SOURCE/f'{name}-original.png';im=Image.open(source).convert('RGBA');frames=[];boxes=[]
    for i in range(cols*rows):
        x,y=i%cols,i//cols;box=(round(x*im.width/cols),round(y*im.height/rows),round((x+1)*im.width/cols),round((y+1)*im.height/rows))
        f=main_component(im.crop(box));b=f.getchannel('A').point(lambda a:255 if a>16 else 0).getbbox();assert b;frames.append(f);boxes.append(b)
    scale=min(224/max(b[2]-b[0] for b in boxes),224/max(b[3]-b[1] for b in boxes));atlas=Image.new('RGBA',(cols*256,rows*256));records=[]
    for i,(f,b)in enumerate(zip(frames,boxes)):
        crop=f.crop(b);crop=crop.resize((round(crop.width*scale),round(crop.height*scale)),Image.Resampling.LANCZOS)
        cell=Image.new('RGBA',(256,256));x=(256-crop.width)//2 if name=='vesper' else 236-crop.width;y=240-crop.height if name=='vesper' else 128-crop.height//2
        cell.paste(crop,(x,y));pixels=np.array(cell);pixels[pixels[:,:,3]==0]=0;cell=Image.fromarray(pixels)
        bounds=cell.getchannel('A').point(lambda a:255 if a>8 else 0).getbbox();assert bounds and min(bounds[:2])>=8 and max(bounds[2:])<=248
        path=OUT/f'{name}_{i:02}.png';cell.save(path);atlas.paste(cell,(i%cols*256,i//cols*256));records.append({'index':i,'path':path.relative_to(ROOT).as_posix(),'sha256':sha(path),'bounds':bounds})
    path=OUT/f'{name}.png';atlas.save(path)
    if name=='vesper':
        clips={k:{'frames':[v],'fps':1,'loop':True}for k,v in {'idle':0,'ready':1,'warning':2,'loss':3,'win':4,'secured':8,'surprise':2}.items()};clips['command']={'frames':[5,6,7,8,0],'fps':10,'loop':False};pivot=[.5,.5]
    else:
        clips={'idle':{'frames':[0],'fps':1,'loop':True},'approach':{'frames':[1,2],'fps':8,'loop':False},'clamp':{'frames':[3,4],'fps':4,'loop':True},'release':{'frames':[5,6,7],'fps':8,'loop':False}};pivot=[.921875,.59]
    families[name]={'atlas':path.relative_to(ROOT).as_posix(),'cell':[256,256],'columns':cols,'rows':rows,'pivot':pivot,'clips':clips,'source':source.relative_to(ROOT).as_posix(),'sourceSHA256':sha(source),'uniformScale':scale,'sha256':sha(path),'frames':records}
manifest={'version':1,'status':'Selected Circuit cast; normalized runtime raster family, native review required','reference':'design/phase1/img/space-relay-b.png','referenceSHA256':sha(ROOT/'design/phase1/img/space-relay-b.png'),'filter':'linear','collision':'presentation only; no ball or hostile collision','families':families}
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2));print(json.dumps({name:{'atlas':f['atlas'],'cell':f['cell'],'columns':f['columns'],'rows':f['rows'],'sha256':f['sha256']}for name,f in families.items()}))
