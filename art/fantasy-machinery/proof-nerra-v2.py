from pathlib import Path
import importlib.util
import hashlib,json,math
import numpy as np
from PIL import Image,ImageDraw

ROOT=Path(__file__).resolve().parents[2]
SOURCE=Path(__file__).parent
OUT=SOURCE/'proof/nerra-v2'
spec=importlib.util.spec_from_file_location('family_proof',SOURCE/'proof.py');p=importlib.util.module_from_spec(spec);spec.loader.exec_module(p)
BASE=json.loads((ROOT/'assets/fantasy-machinery/manifest.json').read_text())
MP=ROOT/'assets/fantasy-machinery/nerra-v2-manifest.json'
M=json.loads(MP.read_text())


def point(root,local,angle):
    co,si=math.cos(angle),math.sin(angle)
    return (root[0]+local['x']*co-local['y']*si,root[1]+local['x']*si+local['y']*co)


def render(name,width=393,height=852):
    scale=width/360;data=BASE['tidewheel'];body=M['nerraBody'];pose=body['poses'][name];foot=(180,232)
    canvas=Image.open(ROOT/data['background']['path']).convert('RGBA').resize((width,height),Image.Resampling.LANCZOS)
    p.sprite(canvas,data['sluiceWall'],(180,232),scale,factor=400/350)
    p.sprite(canvas,data['wheel'],(310,244),scale)
    p.sprite(canvas,data['refugeBalcony'],(310,148),scale,factor=.7)
    angle=-.55 if name=='pull' else .12
    rs=pose['sockets']['gate'];right=(foot[0]+rs['x'],foot[1]+rs['y'])
    hand=point(right,M['gateClawV2']['chainEnd'],angle)
    # Staged source-textured route; actual model owns haul amount and timing.
    route=[hand,(310,244),(330,244),(330,304)]
    chain=Image.open(ROOT/M['chain']['path']).convert('RGBA');top,bottom=M['chain']['anchors']['tileTop'],M['chain']['anchors']['tileBottom']
    y0,y1=round(top[1]*chain.height),round(bottom[1]*chain.height)
    tile=chain.crop((0,y0,chain.width,y1));tile_w=round(24*scale);tile_h=round((y1-y0)*24/chain.width*scale)
    tile=tile.resize((tile_w,tile_h),Image.Resampling.LANCZOS)
    for a,b in zip(route,route[1:]):
        dx,dy=b[0]-a[0],b[1]-a[1];length=math.hypot(dx,dy);n=max(1,math.ceil(length/(tile_h/scale*.8)))
        angle=math.atan2(-dx,dy)
        for i in range(n):
            u=(i+.5)/n;x=(a[0]+dx*u)*scale;y=(a[1]+dy*u)*scale
            rotated=tile.rotate(-math.degrees(angle),Image.Resampling.BICUBIC,expand=True)
            canvas.alpha_composite(rotated,(round(x-rotated.width/2),round(y-rotated.height/2)))
    lefts=pose['sockets']['crusher'];left=(foot[0]+lefts['x'],foot[1]+lefts['y'])
    p.sprite(canvas,data['crusherClaw'],left,scale,angle=-.12 if name=='pull' else .5,mirror=True,factor=.88)
    p.sprite(canvas,M['gateClawV2'],right,scale,angle=-.55 if name=='pull' else .12)
    p.sprite(canvas,body,foot,scale,frame=pose['frame'])
    ImageDraw.Draw(canvas).text((10,height-25),'STAGED ART / '+name+' / not earned play',fill='white')
    return canvas


def main():
    OUT.mkdir(parents=True,exist_ok=True)
    assert hashlib.sha256((ROOT/M['source']).read_bytes()).hexdigest()==M['sourceSHA256']
    module=(SOURCE/'nerra-v2-data.mjs').read_text()
    assert json.loads(module.split('export default ',1)[1].strip().rstrip(';'))==M['geometry']
    poses=['idle','step','hurt','pull'];sheet=Image.new('RGB',(786,960),'#16212c');frames=[]
    for i,name in enumerate(poses):
        im=render(name);im.save(OUT/('ios-'+name+'.png'));sheet.paste(im.crop((0,0,393,480)),((i%2)*393,(i//2)*480));frames.append(im.convert('RGB'))
    sheet.save(OUT/'native-poses.png');frames[0].save(OUT/'keyposes.gif',save_all=True,append_images=frames[1:]+[frames[0]],duration=[700,350,500,850,700],loop=0)
    render('pull',412,915).save(OUT/'android-pull.png')
    report={'manifestSHA256':hashlib.sha256(MP.read_bytes()).hexdigest(),'baseManifestSHA256':hashlib.sha256((ROOT/'assets/fantasy-machinery/manifest.json').read_bytes()).hexdigest(),'sourceSHA256':M['sourceSHA256'],'geometryModuleSHA256':hashlib.sha256((SOURCE/'nerra-v2-data.mjs').read_bytes()).hexdigest(),'poses':{},'limits':['Four raster key poses, not a skeletal rig','Staged source-size/phone art assembly, not earned gameplay','Chain is rear-stage mechanical presentation; model/renderer must share actualhaulroute']}
    body=M['nerraBody'];unit=body['unit'];pivot=body['pivot'];all_extents=[]
    for name,pose in body['poses'].items():
        im=Image.open(ROOT/pose['path']);a=np.array(im.getchannel('A'));yy,xx=np.where(a>=128);xw=(xx/im.width-pivot[0])*unit[0];yw=(yy/im.height-pivot[1])*unit[1]
        gap=np.full(len(xx),1000.)
        for c in pose['circles']:
            gap=np.minimum(gap,np.maximum(0,np.hypot(xw-c['x'],yw-c['y'])-c['r']))
            x=(c['x']/unit[0]+pivot[0])*im.width;y=(c['y']/unit[1]+pivot[1])*im.height;r=c['r']*im.width/unit[0]
            l,rr=max(0,math.floor(x-r)),min(im.width,math.ceil(x+r)+1);t,b=max(0,math.floor(y-r)),min(im.height,math.ceil(y+r)+1);py,px=np.mgrid[t:b,l:rr]
            mask=(px-x)**2+(py-y)**2<=r*r;assert not np.any(a[t:b,l:rr][mask]<128)
        bounds=[float(xw.min()),float(yw.min()),float(xw.max()),float(yw.max())];all_extents.append(bounds)
        report['poses'][name]={'circles':len(pose['circles']),'allDisksOpaque':True,'normal6uCoverage':float(np.mean(gap<6)),'maximumGap':float(gap.max()),'localOpaqueBounds':bounds,'sockets':pose['sockets']}
    # Maximum limb extent over all authored angles/poses, in supporting-foot space.
    bounds=[]
    for desc in M['geometry']['claws']:
        e=BASE['tidewheel']['crusherClaw'] if desc['side']<0 else M['gateClawV2'];im=Image.open(ROOT/e['path']);a=np.array(im.getchannel('A'));yy,xx=np.where(a>=128);x=(xx/im.width-e['pivot'][0])*e['unit'][0]*desc['scale'];y=(yy/im.height-e['pivot'][1])*e['unit'][1]*desc['scale']
        if desc['mirror']:x=-x
        lo,hi=(-.12,.5) if desc['side']<0 else (-.55,.12)
        for pose in body['poses'].values():
            socket=pose['sockets']['crusher' if desc['side']<0 else 'gate']
            for angle in np.linspace(lo,hi,65):
                co,si=math.cos(angle),math.sin(angle);xr=x*co-y*si+socket['x'];yr=x*si+y*co+socket['y'];bounds.append([float(xr.min()),float(yr.min()),float(xr.max()),float(yr.max())])
    report['maximumAllPoseOpaqueExtents']=[min(v[0] for v in bounds+all_extents),min(v[1] for v in bounds+all_extents),max(v[2] for v in bounds+all_extents),max(v[3] for v in bounds+all_extents)]
    report['maximumOpaqueYAtFoot232']=232+report['maximumAllPoseOpaqueExtents'][3]
    report['minimumBrickTopFor32Gap']=32+report['maximumOpaqueYAtFoot232']
    e=M['gateClawV2'];im=Image.open(ROOT/e['path']);a=np.array(im.getchannel('A'))
    for c in e['collision']:
        x=(c['x']/e['unit'][0]+e['pivot'][0])*im.width;y=(c['y']/e['unit'][1]+e['pivot'][1])*im.height;r=c['r']*im.width/e['unit'][0]
        l,rr=max(0,math.floor(x-r)),min(im.width,math.ceil(x+r)+1);t,b=max(0,math.floor(y-r)),min(im.height,math.ceil(y+r)+1);yy,xx=np.mgrid[t:b,l:rr]
        mask=(xx-x)**2+(yy-y)**2<=r*r;assert not np.any(a[t:b,l:rr][mask]<128)
    report['rightClaw']={'circles':len(e['collision']),'allDisksOpaque':True,'rootAlpha':int(a[round(e['pivot'][1]*im.height),round(e['pivot'][0]*im.width)]),'chainGrip':e['grip'],'chainEnd':e['chainEnd'],'danglingChainCollision':False}
    files={}
    for path in [MP,ROOT/body['path'],ROOT/M['gateClawV2']['path'],ROOT/M['chain']['path']]+[ROOT/v['path'] for v in body['poses'].values()]:
        e={'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'bytes':path.stat().st_size}
        if path.suffix=='.png':
            im=Image.open(path);a=np.array(im);assert im.mode=='RGBA' and not im.info;assert not a[0,:,3].any() and not a[-1,:,3].any() and not a[:,0,3].any() and not a[:,-1,3].any();assert not a[a[:,:,3]==0,:3].any();e.update(size=list(im.size),metadata={},edgeAlpha=0)
        files[path.relative_to(ROOT).as_posix()]=e
    report['files']=files
    report['encodedPNGBytes']=sum(v['bytes'] for k,v in files.items() if k.endswith('.png'))
    report['decodedRGBABytes']=sum(v['size'][0]*v['size'][1]*4 for k,v in files.items() if k.endswith('.png'))
    (OUT/'verification.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({k:v for k,v in report.items() if k not in ['files','poses']},indent=2))


if __name__=='__main__':main()
