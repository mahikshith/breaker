from pathlib import Path
import importlib.util
import hashlib,json,math
import numpy as np
from PIL import Image,ImageDraw

ROOT=Path(__file__).resolve().parents[2];SOURCE=Path(__file__).parent;OUT=ROOT/'assets/fantasy-machinery'
def load(name,path):
    s=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
f=load('reaction_family',SOURCE/'extract.py');v2=load('reaction_geometry',SOURCE/'extract-nerra-v2.py')


def main():
    source=SOURCE/'source/reactions-v1.png';im=Image.open(source).convert('RGBA');groups=f.components(np.array(im.getchannel('A')))
    manifest={'version':1,'status':'Source-faithful reactionkeyposes; independentnative/runtimeadmissionpending','source':source.relative_to(ROOT).as_posix(),'sourceSHA256':f.sha(source),'nerra':{},'korr':{},'geometry':{},'note':'Nerra is BODYONLY. Independentlargeclaws stay separate and use measured sockets. Dazed/defeat are terminalvictorypresentation, no combatauthority. Keyedrasters, not a skeletalrig.'}
    specs=[('nerra','fury',0,[269,515],1.13,{'crusher':[212,308],'gate':[460,341]},False),
           ('nerra','dazed',2,[768,522],1.13,{'crusher':[697,340],'gate':[951,379]},True),
           ('nerra','defeat',1,[265,1006],1.13,{'crusher':[207,911],'gate':[452,944]},True),
           ('korr','dazed',3,[765,1004],.83,{},True),
           ('korr','defeat',4,[283,1436],.83,{},True)]
    for family,name,group,foot,scale,sockets,terminal in specs:
        cell=[640,576] if family=='nerra' else [512,448]
        unit=[190.08,171.072] if family=='nerra' else [512/3,448/3]
        feet=[cell[0]/2,540 if family=='nerra' else 396];pivot=[feet[0]/cell[0],feet[1]/cell[1]]
        isolated=f.isolate(im,groups[group]);box=isolated.getchannel('A').getbbox();crop=isolated.crop(box);dims=[round(crop.width*scale),round(crop.height*scale)];crop=crop.resize(dims,Image.Resampling.LANCZOS)
        dx,dy=round(feet[0]+(box[0]-foot[0])*scale),round(feet[1]+(box[1]-foot[1])*scale)
        frame=Image.new('RGBA',cell);frame.alpha_composite(crop,(dx,dy));frame=f.clean(frame)
        def uv(point):return [(dx+(point[0]-box[0])*dims[0]/(box[2]-box[0]))/cell[0],(dy+(point[1]-box[1])*dims[1]/(box[3]-box[1]))/cell[1]]
        socket_uvs={k:uv(v) for k,v in sockets.items()};local={k:{'x':(v[0]-pivot[0])*unit[0],'y':(v[1]-pivot[1])*unit[1]} for k,v in socket_uvs.items()}
        e=f.entry(family+'-'+name+'-v1',frame,unit,pivot,source,list(box),{'feet':pivot,**{('socket'+k.capitalize()):u for k,u in socket_uvs.items()}},
            terminalOnly=terminal,footUV=pivot,sockets=local,socketUVs=socket_uvs,frame=0,frameRect=[0,0,*cell],
            sourceFeet=foot,sourceToCell=[scale,feet[0]-foot[0]*scale,feet[1]-foot[1]*scale])
        if not terminal:
            circles=v2.disks(frame,unit,pivot,90);e['circles']=circles
            manifest['geometry']['nerraFury']={'frame':0,'frameRect':[0,0,*cell],'unit':unit,'pivot':pivot,'footUV':pivot,'sockets':local,'circles':circles,'sourceSHA256':f.sha(source),'spriteSHA256':e['sha256']}
        manifest[family][name]=e
    module=SOURCE/'reactions-data.mjs';module.write_text('// Measured live fury anatomy, relative to the existing supporting feet.\nexport default '+json.dumps(manifest['geometry'],separators=(',',':'))+';\n',encoding='utf-8')
    manifest['geometryModule']={'path':module.relative_to(ROOT).as_posix(),'sha256':f.sha(module)}
    path=OUT/'reactions-manifest.json';path.write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'manifestSHA256':f.sha(path),'sourceSHA256':f.sha(source),'geometryModuleSHA256':f.sha(module),'furySockets':manifest['geometry']['nerraFury']['sockets'],'furyDisks':len(manifest['geometry']['nerraFury']['circles'])},indent=2))


if __name__=='__main__':main()
