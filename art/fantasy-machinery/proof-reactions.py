from pathlib import Path
import importlib.util
import hashlib,json,math
import numpy as np
from PIL import Image,ImageDraw

ROOT=Path(__file__).resolve().parents[2];SOURCE=Path(__file__).parent;OUT=SOURCE/'proof/reactions'
s=importlib.util.spec_from_file_location('reaction_proof',SOURCE/'proof.py');p=importlib.util.module_from_spec(s);s.loader.exec_module(p)
B=json.loads((ROOT/'assets/fantasy-machinery/manifest.json').read_text());V=json.loads((ROOT/'assets/fantasy-machinery/nerra-v2-manifest.json').read_text());MP=ROOT/'assets/fantasy-machinery/reactions-manifest.json';M=json.loads(MP.read_text())
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()


def native(family,reaction,width=393,height=852):
    scale=width/360;data=B['bellforge' if family=='korr' else 'tidewheel'];im=Image.open(ROOT/data['background']['path']).convert('RGBA').resize((width,height),Image.Resampling.LANCZOS)
    if family=='korr':
        p.sprite(im,data['plinth'],(89.5,161),scale);p.sprite(im,M[family][reaction],(88,161),scale)
    else:
        p.sprite(im,data['sluiceWall'],(180,232),scale,factor=400/350)
        e=M['nerra'][reaction];foot=(180,232)
        for side,key,socket,angle in [(-1,'crusherClaw','crusher',.85 if reaction=='fury' else -.1),(1,'gateClawV2','gate',-.8 if reaction=='fury' else -.6)]:
            root=(foot[0]+e['sockets'][socket]['x'],foot[1]+e['sockets'][socket]['y'])
            part=B['tidewheel'][key] if side<0 else V[key]
            p.sprite(im,part,root,scale,angle,mirror=side<0,factor=.88 if side<0 else 1)
        p.sprite(im,e,foot,scale)
    ImageDraw.Draw(im).text((10,height-25),'STAGED RASTER KEYPOSE / '+family+' '+reaction,fill='white')
    return im


def main():
    OUT.mkdir(parents=True,exist_ok=True);assert sha(ROOT/M['source'])==M['sourceSHA256'];assert not Image.open(ROOT/M['source']).info
    module=(ROOT/M['geometryModule']['path']).read_text();assert json.loads(module.split('export default ',1)[1].strip().rstrip(';'))==M['geometry'];assert sha(ROOT/M['geometryModule']['path'])==M['geometryModule']['sha256']
    report={'manifestSHA256':sha(MP),'sourceSHA256':M['sourceSHA256'],'geometryModuleSHA256':M['geometryModule']['sha256'],'files':{},'scope':'Source/native staged art verification; actual runtime/physics test belongs to integration.'}
    sheet=Image.new('RGB',(1280,1050),'#121c26');d=ImageDraw.Draw(sheet)
    for i,(family,name) in enumerate([('nerra','fury'),('nerra','dazed'),('nerra','defeat'),('korr','dazed'),('korr','defeat')]):
        e=M[family][name];path=ROOT/e['path'];assert sha(path)==e['sha256'];im=Image.open(path);a=np.array(im)
        assert im.mode=='RGBA' and not im.info;assert not a[0,:,3].any() and not a[-1,:,3].any() and not a[:,0,3].any() and not a[:,-1,3].any();assert not a[a[:,:,3]==0,:3].any()
        data={'sha256':sha(path),'bytes':path.stat().st_size,'decodedRGBABytes':im.width*im.height*4,'metadata':{},'edgeAlpha':0,'unit':e['unit'],'pivot':e['pivot'],'terminalOnly':e['terminalOnly']}
        if not e['terminalOnly']:
            unit,pivot=e['unit'],e['pivot'];yy,xx=np.where(a[:,:,3]>=128);wx=(xx/im.width-pivot[0])*unit[0];wy=(yy/im.height-pivot[1])*unit[1];gap=np.full(len(xx),1000.)
            for c in e['circles']:
                x=(c['x']/unit[0]+pivot[0])*im.width;y=(c['y']/unit[1]+pivot[1])*im.height;r=c['r']*im.width/unit[0]
                l,rr=max(0,math.floor(x-r)),min(im.width,math.ceil(x+r)+1);t,b=max(0,math.floor(y-r)),min(im.height,math.ceil(y+r)+1);py,px=np.mgrid[t:b,l:rr];mask=(px-x)**2+(py-y)**2<=r*r;assert not np.any(a[t:b,l:rr,3][mask]<128)
                gap=np.minimum(gap,np.maximum(0,np.hypot(wx-c['x'],wy-c['y'])-c['r']))
            data.update(circles=len(e['circles']),allDisksOpaque=True,normal6uCoverage=float(np.mean(gap<6)),maximumOpaqueGap=float(gap.max()),localOpaqueBounds=[float(wx.min()),float(wy.min()),float(wx.max()),float(wy.max())])
        report['files'][family+'-'+name]=data
        thumb=im.copy();thumb.thumbnail((400,480));x=(i%3)*426+(426-thumb.width)//2;y=(i//3)*520+20;sheet.paste(thumb,(x,y),thumb);d.text(((i%3)*426+10,(i//3)*520+495),family+' '+name+(' (terminal)' if e['terminalOnly'] else ' (livegeometry)'),fill='white')
    sheet.save(OUT/'contact.png')
    for family,reaction in [('nerra','fury'),('nerra','defeat'),('korr','dazed'),('korr','defeat')]:native(family,reaction).save(OUT/(family+'-'+reaction+'-ios.png'))
    report['encodedBytes']=sum(v['bytes'] for v in report['files'].values());report['decodedRGBABytes']=sum(v['decodedRGBABytes'] for v in report['files'].values())
    (OUT/'verification.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report,indent=2))


if __name__=='__main__':main()
