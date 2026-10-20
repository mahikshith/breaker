from pathlib import Path
import importlib.util
import hashlib,json,math
import numpy as np
from PIL import Image,ImageDraw

ROOT=Path(__file__).resolve().parents[2]
SOURCE=Path(__file__).parent
OUT=ROOT/'assets/fantasy-machinery'
spec=importlib.util.spec_from_file_location('family_extract',SOURCE/'extract.py')
family=importlib.util.module_from_spec(spec);spec.loader.exec_module(family)


def disks(im,unit,pivot,limit=90):
    opaque=np.array(im.getchannel('A'))>=128
    inside=opaque.copy();inside[1:-1,1:-1]&=opaque[:-2,1:-1]&opaque[2:,1:-1]&opaque[1:-1,:-2]&opaque[1:-1,2:]
    by,bx=np.where(opaque&~inside);candidates=[]
    for y in range(3,im.height,6):
        for x in range(3,im.width,6):
            if not opaque[y,x]:continue
            r=math.sqrt(float(np.min((bx-x)**2+(by-y)**2)))-1
            if r>=3:candidates.append((r,x,y))
    a=np.array(candidates);rs,xs,ys=a[:,0],a[:,1],a[:,2]
    selected=[];gaps=np.full(len(rs),10000.)
    # Broad masses first, then ensure visible narrow anatomy is represented.
    for i in np.argsort(rs)[::-1]:
        r,x,y=a[i]
        if all(math.hypot(x-cx,y-cy)>max(r,cr)*.7 for cr,cx,cy in selected):
            selected.append((r,x,y));gaps=np.minimum(gaps,np.hypot(xs-x,ys-y)-r)
            if len(selected)>=20:break
    while len(selected)<limit:
        i=int(gaps.argmax())
        if gaps[i]<=2:break
        r,x,y=a[i];selected.append((r,x,y));gaps=np.minimum(gaps,np.hypot(xs-x,ys-y)-r)
    return [{'type':'circle','x':round((x/im.width-pivot[0])*unit[0],6),'y':round((y/im.height-pivot[1])*unit[1],6),'r':round(r*unit[0]/im.width,6)} for r,x,y in selected]


def main():
    source=SOURCE/'source/nerra-motion-v2.png';im=Image.open(source).convert('RGBA')
    groups=family.components(np.array(im.getchannel('A')))
    cell=[640,576];unit=[190.08,171.072];pivot=[.5,540/576];scale=1.13
    atlas=Image.new('RGBA',(cell[0]*4,cell[1]));poses={};frames=[]
    specs=[('idle',2,[274,498],{'crusher':[213,321],'gate':[451,326]}),
           ('step',3,[769,498],{'crusher':[718,321],'gate':[953,326]}),
           ('hurt',0,[274,989],{'crusher':[208,815],'gate':[454,830]}),
           ('pull',1,[779,985],{'crusher':[718,804],'gate':[968,826]})]
    for i,(name,group,foot,sockets) in enumerate(specs):
        isolated=family.isolate(im,groups[group]);box=isolated.getchannel('A').getbbox();crop=isolated.crop(box)
        dims=[round(crop.width*scale),round(crop.height*scale)];crop=crop.resize(dims,Image.Resampling.LANCZOS)
        dx=round(320+(box[0]-foot[0])*scale);dy=round(540+(box[1]-foot[1])*scale)
        frame=Image.new('RGBA',cell);frame.alpha_composite(crop,(dx,dy));frame=family.clean(frame)
        path=OUT/('nerra-v2-'+name+'.png');frame.save(path);family.audit(path)
        def uv(point):return [(dx+(point[0]-box[0])*dims[0]/(box[2]-box[0]))/cell[0],(dy+(point[1]-box[1])*dims[1]/(box[3]-box[1]))/cell[1]]
        socket_uvs={k:uv(v) for k,v in sockets.items()}
        local={k:{'x':(v[0]-pivot[0])*unit[0],'y':(v[1]-pivot[1])*unit[1]} for k,v in socket_uvs.items()}
        shapes=disks(frame,unit,pivot)
        atlas.alpha_composite(frame,(i*cell[0],0))
        poses[name]={'frame':i,'frameRect':[i*cell[0],0,*cell],'footUV':pivot,'sockets':local,'socketUVs':socket_uvs,'circles':shapes,'alphaBounds':list(frame.getchannel('A').getbbox()),'sourceCrop':list(box),'sourceFoot':foot,'sourceToCell':[scale,320-foot[0]*scale,540-foot[1]*scale],'path':path.relative_to(ROOT).as_posix(),'sha256':family.sha(path)}
        frames.append({'name':name,**poses[name]})
    atlas_path=OUT/'nerra-v2.png';atlas.save(atlas_path);family.audit(atlas_path)
    body={'path':atlas_path.relative_to(ROOT).as_posix(),'sha256':family.sha(atlas_path),'size':list(atlas.size),'cell':cell,'columns':4,'rows':1,'unit':unit,'pivot':pivot,'clips':{name:{'start':i,'n':1,'fps':1} for i,(name,*_) in enumerate(specs)},'poses':poses,'frames':frames}

    # Keep one clamped link, remove the lower dangling tail as a separate layer;
    # the runtime chain route, not the entire claw rotation, owns free links.
    isolated=family.isolate(im,groups[4]);cut=1328
    pixels=np.array(isolated);pixels[cut:,:,:]=0;isolated=Image.fromarray(pixels)
    claw,box,uv=family.fit(isolated,[448,448])
    cunit=[96,96];cpivot=uv([181,1058]);anchors={k:uv(v) for k,v in {'root':[181,1058],'chainGrip':[449,1250],'chainEnd':[462,1322],'mass':[360,1199]}.items()}
    claw_entry=family.entry('gateClawV2',claw,cunit,cpivot,source,box,anchors,
        note='Rightpincer closes around a real held chainlink. Free dangling links extracted from source; draw actualchain route from chainEnd. No decorativechain collision.')
    collision_im=claw.copy();c=np.array(collision_im);tail_y=round(uv([462,1316])[1]*claw.height);c[tail_y:,:,:]=0
    claw_entry['collision']=disks(Image.fromarray(c),cunit,cpivot,70)
    claw_entry['grip']={'x':(anchors['chainGrip'][0]-cpivot[0])*cunit[0],'y':(anchors['chainGrip'][1]-cpivot[1])*cunit[1]}
    claw_entry['chainEnd']={'x':(anchors['chainEnd'][0]-cpivot[0])*cunit[0],'y':(anchors['chainEnd'][1]-cpivot[1])*cunit[1]}

    chain,box,uv=family.fit(family.isolate(im,groups[5]),[128,576])
    chain_entry=family.entry('chain-v2',chain,[24,108],[.5,.5],source,box,
        {k:uv(v) for k,v in {'top':[795,1044],'bottom':[795,1492],'tileTop':[795,1144],'tileBottom':[795,1267]}.items()},
        note='Rendered interlocking steel links. Route in short overlapped segments between measured endpoints; do not stretch into one flat bar or give thisdecorativechain damage collision.')
    previous=json.loads((OUT/'manifest.json').read_text())
    left=previous['tidewheel']['crusherClaw'];claws=[{'side':-1,'partKey':'crusherClaw','scale':.88,'mirror':True,'circles':left['collision'],'grip':{'x':0,'y':0}},
        {'side':1,'partKey':'gateClawV2','scale':1,'mirror':False,'circles':claw_entry['collision'],'grip':claw_entry['grip'],'chainEnd':claw_entry['chainEnd']}]
    geometry={'unit':unit,'pivot':pivot,'poses':poses,'claws':claws,'sourceSHA256':family.sha(source)}
    manifest={'version':2,'status':'New smaller Nerra mechanical chainpull family; independentnative/runtimeadmissionpending','source':source.relative_to(ROOT).as_posix(),'sourceSHA256':family.sha(source),'baseManifest':{'path':'assets/fantasy-machinery/manifest.json','sha256':family.sha(OUT/'manifest.json')},'nerraBody':body,'gateClawV2':claw_entry,'chain':chain_entry,'geometry':geometry,'animationNote':'Four consistent rasterkeyposes with source-measured sockets; not a fullskeletalrig. Renderer owns rigidclaw rotation, realchainrouting and modelpatrol.'}
    path=OUT/'nerra-v2-manifest.json';path.write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
    module=SOURCE/'nerra-v2-data.mjs';module.write_text('// Source-relative measured anatomy; units already include the smaller body size.\nexport default '+json.dumps(geometry,separators=(',',':'))+';\n',encoding='utf-8')
    print(json.dumps({'manifestSHA256':family.sha(path),'sourceSHA256':family.sha(source),'moduleSHA256':family.sha(module),'poseCounts':{k:len(v['circles']) for k,v in poses.items()},'clawCircles':len(claw_entry['collision']),'grip':claw_entry['grip'],'chainEnd':claw_entry['chainEnd']}))


if __name__=='__main__':main()
