from pathlib import Path
import json
import math
import hashlib
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parents[2]
SOURCE=Path(__file__).parent
OUT=SOURCE/'proof'
M=json.loads((ROOT/'assets/fantasy-machinery/manifest.json').read_text())


def sprite(canvas, e, at, scale, angle=0, mirror=False, frame=None, factor=1):
    im=Image.open(ROOT/e['path']).convert('RGBA')
    if frame is not None:
        w,h=e['cell'];im=im.crop((frame*w,0,(frame+1)*w,h))
    ux,uy=e['unit'];sx=ux/im.width*scale*factor;sy=uy/im.height*scale*factor
    if mirror:sx=-sx
    co,si=math.cos(angle),math.sin(angle)
    px,py=e['pivot'][0]*im.width,e['pivot'][1]*im.height
    tx,ty=at[0]*scale,at[1]*scale
    # Inverse source->world affine, same normalized pivot used by physics.
    affine=(co/sx,si/sx,px-(co*tx+si*ty)/sx,-si/sy,co/sy,py-(-si*tx+co*ty)/sy)
    layer=im.transform(canvas.size,Image.Transform.AFFINE,affine,Image.Resampling.BICUBIC)
    canvas.alpha_composite(layer)


def label(canvas,text):
    d=ImageDraw.Draw(canvas);d.rectangle((0,canvas.height-30,canvas.width,canvas.height),fill='#111720')
    d.text((8,canvas.height-23),text,fill='#b4c5d3')


def native(family,width,height,pose=0):
    data=M[family];scale=width/360
    canvas=Image.open(ROOT/data['background']['path']).convert('RGBA').resize((width,height),Image.Resampling.LANCZOS)
    if family=='bellforge':
        sprite(canvas,data['plinth'],(89.5,161),scale)
        sprite(canvas,data['bellCradle'],(164,147),scale)
        sprite(canvas,data['leverMount'],(108,151),scale)
        sprite(canvas,data['releaseLever'],(108,151),scale,angle=[0,-.35,.25,0][pose])
        sprite(canvas,data['korr'],(88,161),scale,frame=pose)
        for x,y,angle,factor in [(123,172,.19,.63),(174,236,.17,.68),(245,299,-.12,.66)]:
            sprite(canvas,data['ramp'],(x,y),scale,angle,factor=factor)
        sprite(canvas,data['bell'],(205,210),scale,pose*.4)
        sprite(canvas,data['lift'],(306,137),scale)
        sprite(canvas,data['ratchet'],(303,307),scale,factor=.6)
    else:
        body=data['nerraBody'];at=(180,153)
        sprite(canvas,data['sluiceWall'],(180,232),scale)
        sprite(canvas,data['refugeBalcony'],(310,148),scale,factor=.7)
        sprite(canvas,data['wheel'],(314,238),scale,factor=.75)
        for side,key,anchor,angle in [(-1,'crusherClaw','socketCrusher',-.12-pose*.18),(1,'gateClaw','socketGate',.12+pose*.18)]:
            uv=body['anchors'][anchor];root=(at[0]+(uv[0]-body['pivot'][0])*body['unit'][0],at[1]+(uv[1]-body['pivot'][1])*body['unit'][1])
            sprite(canvas,data[key],root,scale,angle,mirror=side<0)
        sprite(canvas,body,at,scale)
        for x in [102,258]:
            sprite(canvas,data['raft'],(x,366),scale,angle=(-1 if x==102 else 1)*pose*.04,factor=166/128)
            for row in range(3):
                for col in range(3):
                    name=['coral','sage','ivory'][(row+col)%3]
                    sprite(canvas,data['bricks'][name],(x-37+col*37,300+row*21),scale)
        for x in [25,335]:sprite(canvas,data['gate'],(x,257),scale,factor=.5)
    label(canvas,'STAGED ART ASSEMBLY | not earned gameplay')
    return canvas


def main():
    OUT.mkdir(exist_ok=True)
    for width,height,name in [(393,852,'ios'),(412,915,'android')]:
        a=native('bellforge',width,height);b=native('tidewheel',width,height)
        sheet=Image.new('RGBA',(width*2,height),'#10151c');sheet.alpha_composite(a);sheet.alpha_composite(b,(width,0));sheet.save(OUT/(name+'-assembly.png'))
    frames=[]
    for pose in [0,1,2,3,0]:
        a=native('bellforge',393,852,pose);b=native('tidewheel',393,852,min(pose,2))
        sheet=Image.new('RGB',(786,852),'#111820');sheet.paste(a,(0,0));sheet.paste(b,(393,0));frames.append(sheet)
    frames[0].save(OUT/'keypose-assembly.gif',save_all=True,append_images=frames[1:],duration=[800,500,250,650,800],loop=0)
    # Source-size parts and the four exact keyframes, without a gameplay claim.
    sheet=Image.new('RGB',(1536,1790),'#141a22')
    d=ImageDraw.Draw(sheet)
    for i,f in enumerate(M['bellforge']['korr']['frames']):
        im=Image.open(ROOT/f['path']);im.thumbnail((384,336));sheet.paste(im,(i*384,25),im);d.text((i*384+12,8),f['name'],fill='white')
    items=[(family,key,e) for family in ['bellforge','tidewheel'] for key,e in M[family].items() if key not in ['korr','background','bricks']]
    for i,(family,key,e) in enumerate(items):
        im=Image.open(ROOT/e['path']);im.thumbnail((270,260));x=(i%5)*307;y=385+(i//5)*280
        sheet.paste(im,(x+(307-im.width)//2,y),im);d.text((x+12,y+260),key,fill='white')
    sheet.save(OUT/'parts-contact.png')
    checks={}
    for path in (ROOT/'assets/fantasy-machinery').glob('*.png'):
        im=Image.open(path);a=np.array(im)
        row={'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'size':list(im.size),'mode':im.mode,'metadata':im.info,'bytes':path.stat().st_size,'decodedBytes':im.width*im.height*len(im.getbands())}
        assert not im.info
        if im.mode=='RGBA':
            row['edgeAlphaMax']=int(max(a[0,:,3].max(),a[-1,:,3].max(),a[:,0,3].max(),a[:,-1,3].max()))
            row['hiddenRGBNonzero']=int(np.count_nonzero(a[a[:,:,3]==0,:3]));assert row['edgeAlphaMax']==row['hiddenRGBNonzero']==0
        checks[path.name]=row
    (OUT/'asset-audit.json').write_text(json.dumps({'assets':checks,'encodedBytes':sum(e['bytes'] for e in checks.values()),'decodedBytes':sum(e['decodedBytes'] for e in checks.values()),'scope':'Source/native staged art fixtures; actual gameplay QA is separate.'},indent=2)+'\n')


if __name__=='__main__':main()
