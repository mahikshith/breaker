from pathlib import Path
from collections import defaultdict
import hashlib,json
import numpy as np
from PIL import Image,ImageDraw,ImageFilter

ROOT=Path(__file__).resolve().parents[2];SOURCE=Path(__file__).parent;OUT=ROOT/'assets/starflight'

def components(alpha,threshold=24):
    parent=[];runs=[];previous=[]
    def find(i):
        while parent[i]!=i:parent[i]=parent[parent[i]];i=parent[i]
        return i
    for y,row in enumerate(alpha):
        diff=np.diff(np.r_[False,row>threshold,False].astype(np.int8));current=[]
        for left,right in zip(np.where(diff==1)[0],np.where(diff==-1)[0]):
            hits=[i for a,b,i in previous if left<=b and right>=a]
            if hits:
                label=find(hits[0])
                for hit in hits[1:]:parent[find(hit)]=label
            else:label=len(parent);parent.append(label)
            current.append((int(left),int(right),label));runs.append((y,int(left),int(right),label))
        previous=current
    groups=defaultdict(list)
    for y,left,right,label in runs:groups[find(label)].append((y,left,right))
    return sorted(groups.values(),key=lambda rows:sum(b-a for y,a,b in rows),reverse=True)

def bounds(rows):return [min(a for y,a,b in rows),min(y for y,a,b in rows),max(b for y,a,b in rows),max(y for y,a,b in rows)+1]

def normalize(im,rows,size):
    seed=Image.new('L',im.size);draw=ImageDraw.Draw(seed)
    for y,left,right in rows:draw.line((left,y,right-1,y),fill=255)
    support=seed.filter(ImageFilter.MaxFilter(25)).filter(ImageFilter.GaussianBlur(1.5))
    pixels=np.array(im);pixels[:,:,3]=(pixels[:,:,3].astype(np.uint16)*np.array(support)//255).astype(np.uint8)
    pixels[pixels[:,:,3]<2]=0;isolated=Image.fromarray(pixels)
    box=isolated.getchannel('A').getbbox();assert box
    crop=isolated.crop(box);scale=min((size[0]-32)/crop.width,(size[1]-32)/crop.height)
    fitted=crop.resize((round(crop.width*scale),round(crop.height*scale)),Image.Resampling.LANCZOS)
    x=(size[0]-fitted.width)//2;y=(size[1]-fitted.height)//2
    canvas=Image.new('RGBA',size);canvas.alpha_composite(fitted,(x,y));a=np.array(canvas);a[a[:,:,3]==0]=0
    canvas=Image.fromarray(a)
    def uv(point):return [(x+(point[0]-box[0])*fitted.width/crop.width)/size[0],(y+(point[1]-box[1])*fitted.height/crop.height)/size[1]]
    return canvas,box,uv

if __name__=='__main__':
    OUT.mkdir(exist_ok=True,parents=True)
    source=SOURCE/'ships-source-v1.png';im=Image.open(source).convert('RGBA');groups=components(np.array(im.getchannel('A')))
    sourceSHA=hashlib.sha256(source.read_bytes()).hexdigest()
    specs={
      'player':{'group':2,'size':[320,288],'displayWidth':54,'facing':'up','muzzles':[[236,83],[400,83]],'engines':[[218,378],[405,378]]},
      'scout':{'group':3,'size':[256,288],'displayWidth':36,'facing':'down','muzzles':[[937,413]],'engines':[[883,83],[991,83]]},
      'gunship':{'group':1,'size':[448,384],'displayWidth':72,'facing':'down','muzzles':[[131,863],[493,865]],'engines':[[217,482],[412,483]]},
      'boss':{'group':0,'size':[768,576],'displayWidth':248,'facing':'down','muzzles':[[842,867],[935,890],[1022,867]],'engines':[[855,465],[1018,465]]},
      'playerBolt':{'group':7,'size':[64,192],'displayWidth':7,'facing':'up'},
      'enemyBolt':{'group':6,'size':[80,224],'displayWidth':12,'facing':'down'},
      'impact':{'group':4,'size':[256,256],'displayWidth':48,'facing':'radial'},
      'exhaust':{'group':5,'size':[128,224],'displayWidth':14,'facing':'down'},
    }
    manifest={'version':1,'status':'New shooter prototype raster family; actual gameplay/native review required','source':'art/starflight/ships-source-v1.png','sourceSHA256':sourceSHA,'pivotConvention':'normalized centre of runtime canvas; anchors normalized to same canvas','filter':'linear','ships':{},'effects':{}}
    for name,spec in specs.items():
        sprite,box,uv=normalize(im,groups[spec['group']],spec['size']);path=OUT/(name+'.png');sprite.save(path)
        a=np.array(sprite);assert not a[0,:,3].any() and not a[-1,:,3].any() and not a[:,0,3].any() and not a[:,-1,3].any()
        assert not Image.open(path).info and not a[a[:,:,3]==0,:3].any()
        solid=sprite.getchannel('A').point(lambda v:255 if v>=128 else 0).getbbox()
        entry={'path':path.relative_to(ROOT).as_posix(),'size':spec['size'],'pivot':[.5,.5],'display':[spec['displayWidth'],spec['displayWidth']*spec['size'][1]/spec['size'][0]],'facing':spec['facing'],'sourceCrop':box,'sourceSHA256':sourceSHA,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'solidBounds':[solid[0]/sprite.width,solid[1]/sprite.height,solid[2]/sprite.width,solid[3]/sprite.height],'alphaBounds':sprite.getchannel('A').getbbox()}
        for key in ['muzzles','engines']:
            if key in spec:entry[key]=[uv(p)for p in spec[key]]
        manifest['ships' if name in ['player','scout','gunship','boss']else'effects'][name]=entry
    backgroundSource=SOURCE/'background-source-v1.png';bg=Image.open(backgroundSource).convert('RGB').resize((768,1536),Image.Resampling.LANCZOS)
    pixels=np.array(bg).astype(np.float32);original=pixels.copy();edge=(pixels[0]+pixels[-1])/2
    for i in range(64):
        weight=(1+np.cos(np.pi*i/63))/2
        pixels[i]=(1-weight)*original[i]+weight*edge;pixels[-1-i]=(1-weight)*original[-1-i]+weight*edge
    bg=Image.fromarray(np.rint(pixels).astype(np.uint8));bg.save(OUT/'background.png')
    assert np.array_equal(np.array(bg)[0],np.array(bg)[-1])
    manifest['background']={'path':'assets/starflight/background.png','size':[768,1536],'source':'art/starflight/background-source-v1.png','sourceSHA256':hashlib.sha256(backgroundSource.read_bytes()).hexdigest(),'sha256':hashlib.sha256((OUT/'background.png').read_bytes()).hexdigest(),'scroll':'Top and bottom rows match exactly. Repeat vertically at any slow scroll rate. Only64px edge bands blend toward a shared row; the central1408px remain unchanged after resizing.','edgeBandPixels':64,'verticalEdgeMaxRGBDifference':0}
    (OUT/'manifest.json').write_text(json.dumps(manifest,indent=2))
    print(json.dumps({'ships':list(manifest['ships']),'effects':list(manifest['effects']),'manifestSHA256':hashlib.sha256((OUT/'manifest.json').read_bytes()).hexdigest()}))
