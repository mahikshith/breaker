from pathlib import Path
import json,hashlib
from PIL import Image
import numpy as np
ROOT=Path(__file__).resolve().parents[2];SOURCE=Path(__file__).parent/'renders';OUT=ROOT/'assets/frost-warden';OUT.mkdir(parents=True,exist_ok=True)
meta=json.loads((SOURCE/'render.json').read_text());atlas=Image.new('RGBA',(1792,912));records=[]

def opaque_body_shapes(im):
    alpha=np.array(im.getchannel('A'))
    sx=im.width/144;sy=im.height/128;shapes=[]
    # Intersect real contiguous opaque runs in short horizontal bands. This
    # includes the head and lower belly without filling empty arm/leg corners.
    for top in range(36,103,6):
        rows=[];y0=round(top*sy);y1=round((top+6)*sy)
        for row in alpha[y0:y1]:
            occupied=row>=192
            edges=np.diff(np.r_[False,occupied,False].astype(np.int8));runs=list(zip(np.where(edges==1)[0],np.where(edges==-1)[0]))
            choices=[(l,r)for l,r in runs if l<=im.width*.5<=r]
            if not choices:
                choices=[(l,r)for l,r in runs if l<im.width*.64 and r>im.width*.36]
            if not choices:rows=[];break
            rows.append(max(choices,key=lambda p:p[1]-p[0]))
        if not rows:continue
        left=max(v[0]for v in rows);right=min(v[1]for v in rows)
        if (right-left)/sx>=10:
            shapes.append({'x':left/sx-72,'y':y0/sy-116,'w':(right-left)/sx,'h':(y1-y0)/sy})
    # Keep the two legs/feet separate; never bridge their transparent gap.
    for top in range(104,116,2):
        y0=round(top*sy);y1=round((top+2)*sy);common=None
        for row in alpha[y0:y1]:
            edges=np.diff(np.r_[False,row>=192,False].astype(np.int8));runs=list(zip(np.where(edges==1)[0],np.where(edges==-1)[0]))
            common=runs if common is None else [(max(a,c),min(b,d))for a,b in common for c,d in runs if min(b,d)>max(a,c)]
            if not common:break
        for left,right in common or []:
            if (right-left)/sx>=6:
                shapes.append({'x':left/sx-72,'y':y0/sy-116,'w':(right-left)/sx,'h':(y1-y0)/sy})
    assert shapes,'No measured opaque torso bands'
    return shapes

for i,f in enumerate(meta['frames']):
    im=Image.open(SOURCE/f['file']).convert('RGBA').resize((256,228),Image.Resampling.LANCZOS);a=np.array(im);a[a[:,:,3]==0]=0;im=Image.fromarray(a)
    f['bodyShapes']=opaque_body_shapes(im)
    bounds=im.getchannel('A').point(lambda a:255 if a>8 else 0).getbbox();assert bounds and min(bounds[:2])>1 and bounds[2]<255 and bounds[3]<227,(f['file'],bounds)
    path=OUT/f['file'];im.save(path);atlas.paste(im,(i%7*256,i//7*228));records.append({'index':i,'file':path.relative_to(ROOT).as_posix(),'bounds':bounds,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
path=OUT/'warden.png';atlas.save(path)
manifest={**{k:meta[k]for k in ['unit','pivot','nativeHeight','forward','yaw','anchorSpace','forwardHand','clips','source','sourceSHA256','derivedScript','derivedScriptSHA256']},'atlas':'assets/frost-warden/warden.png','sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'cell':[256,228],'columns':7,'rows':4,'anchors':meta['frames'],'frames':records,'size':[1792,912],'palette':{'coat':'#444151','skin':'#91A8B5','belly':'#292D42'},'provenance':{'creator':'Quaternius','license':'CC0-1.0','pack':'Ultimate Monsters','sourceURL':'https://raw.githubusercontent.com/castle-engine/castle-engine/60a49b33914135dbea5dbcd1c040a4bcf08db10e/examples/viewport_and_scenes/occlusion_culling/data/quaternius_ultimate_monsters/Yeti.gltf','externalTextures':[]},'collision':'Measured projected fist circle, conservative torso box and alpha>=192 contiguous opaque head/chest/belly bands; runtime placement and sweeps require native alignment review'}
manifest['render']={'script':'art/frost_warden.py','sha256':hashlib.sha256((ROOT/'art/frost_warden.py').read_bytes()).hexdigest(),'engine':'Blender 5.2.2 / Cycles CPU','samples':16,'sourceCell':[432,384],'sourcePixelsPerUnit':3,'runtimeFilter':'Lanczos, transparent RGB zeroed','normalizer':'art/frost-warden/pack.py','normalizerSHA256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest()}
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2));print(json.dumps({'atlas':str(path),'sha256':manifest['sha256'],'decodedRGBA':1792*912*4,'forwardHand':meta['forwardHand']}))
