from pathlib import Path
import hashlib,json,math
import numpy as np
from PIL import Image

ROOT=Path(__file__).resolve().parents[2]
SOURCE=Path(__file__).parent
MANIFEST=ROOT/'assets/fantasy-machinery/manifest.json'


def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()


def main():
    m=json.loads(MANIFEST.read_text());checks={};shapes={}
    for key,e in m['sources'].items():
        p=ROOT/e['path'];assert sha(p)==e['sha256'];assert not Image.open(p).info
    def visit(value):
        if isinstance(value,list):
            for v in value:visit(v)
        elif isinstance(value,dict):
            if 'path' in value and 'sha256' in value and value['path'].endswith('.png'):
                p=ROOT/value['path'];assert sha(p)==value['sha256'],p
                im=Image.open(p);assert not im.info,p
                if im.mode=='RGBA':
                    a=np.array(im);assert not a[0,:,3].any() and not a[-1,:,3].any() and not a[:,0,3].any() and not a[:,-1,3].any(),p
                    assert not a[a[:,:,3]==0,:3].any(),p
                checks[value['path']]={'sha256':sha(p),'bytes':p.stat().st_size,'size':list(im.size),'metadata':{}}
            for key,v in value.items():
                if key!='sources':visit(v)
    visit(m)
    for family,name in [('bellforge','korr'),('tidewheel','nerraBody'),('tidewheel','crusherClaw'),('tidewheel','gateClaw')]:
        e=m[family][name]
        for f in e['frames'] if name=='korr' else [e]:
            im=Image.open(ROOT/f['path']);a=np.array(im.getchannel('A'));u=e['unit'];p=e['pivot'];g=f['collision']
            for circle in g:
                x=(circle['x']/u[0]+p[0])*im.width;y=(circle['y']/u[1]+p[1])*im.height;r=circle['r']*im.width/u[0]
                left,right=max(0,math.floor(x-r)),min(im.width,math.ceil(x+r)+1)
                top,bottom=max(0,math.floor(y-r)),min(im.height,math.ceil(y+r)+1)
                yy,xx=np.mgrid[top:bottom,left:right];mask=(xx-x)**2+(yy-y)**2<=r*r
                assert not np.any(a[top:bottom,left:right][mask]<128),(name,circle)
            yy,xx=np.where(a>=128);xw=(xx/im.width-p[0])*u[0];yw=(yy/im.height-p[1])*u[1];gap=np.full(len(xx),1000.)
            for c in g:gap=np.minimum(gap,np.maximum(0,np.hypot(xw-c['x'],yw-c['y'])-c['r']))
            shapes[name+'-'+f.get('name','')]=dict(disks=len(g),allDisksOpaque=True,normal6uCoverage=float(np.mean(gap<6)),maximumOpaqueGap=float(gap.max()))
    # These openings are real transparent holes, not painted dark pixels.
    holes={}
    for name,uv in [('sluiceWall',[.21,.65]),('gateFrame',[.49,.70])]:
        e=m['tidewheel'][name];im=Image.open(ROOT/e['path']);alpha=im.getchannel('A').getpixel((round(uv[0]*im.width),round(uv[1]*im.height)))
        assert alpha==0,(name,alpha);holes[name]=0
    e=m['bellforge']['bellCradle'];im=Image.open(ROOT/e['path']);a=np.array(im.getchannel('A'));yy,xx=np.where(a>=128);x,y=e['pivot'][0]*im.width,e['pivot'][1]*im.height
    clearance=float(np.sqrt(((xx-x)**2+(yy-y)**2).min())*e['unit'][0]/im.width)
    assert clearance>=14
    report={'manifestSHA256':sha(MANIFEST),'selectedSources':len(m['sources']),'runtimePNGs':len(checks),'files':checks,'geometry':shapes,'trueAlphaHoles':holes,'bellInitialClearance':clearance,'limits':['Keyed raster poses, not a skeletal rig','Rear-stage rack; full straight vertical aperture is not proved','Staged native art proof is not earned gameplay or human balance approval']}
    (SOURCE/'proof/verification.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({k:v for k,v in report.items() if k not in ['files','geometry']},indent=2))


if __name__=='__main__':main()
