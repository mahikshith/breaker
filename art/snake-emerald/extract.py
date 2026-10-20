from pathlib import Path
import hashlib,json,math
import numpy as np
from PIL import Image,ImageOps,ImageDraw

ROOT=Path(__file__).resolve().parents[2]
HERE=Path(__file__).parent
OUT=ROOT/'assets/snake-emerald'
SOURCE=HERE/'source/heads-v1.png'
EXPRESSIONS=['idle','blink','taste','hunt','chew0','chew1','hiss','ouch','dizzy','shock','snarl','strike','grin']
AUTHORED=['idle','blink','taste','hunt','chew0','chew1','hiss','ouch','dizzy','grin']
ALIASES={'shock':'idle','snarl':'hunt','strike':'hiss'}
CELL=256;UNIT=44;SCALE=.33
ROWS=[0,302,602,897,1205,1536]
CENTRES=[(285,154),(790,154),(285,448),(790,448),(285,744),(790,744),(285,1043),(790,1043),(285,1341),(790,1341)]
MOUTHS=[(440,227),(926,226),(434,519),(937,521),(380,790),(934,826),(365,1090),(916,1111),(400,1442),(921,1425)]

def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def clean(im):
    a=np.array(im.convert('RGBA'));a[a[:,:,3]<4]=0
    return Image.fromarray(a)

def main():
    OUT.mkdir(parents=True,exist_ok=True);proof=HERE/'proof';proof.mkdir(parents=True,exist_ok=True)
    im=Image.open(SOURCE).convert('RGBA');assert im.size==(1024,1536)
    unique={};mouths={};records={};parts={}
    for i,name in enumerate(AUTHORED):
        row,col=divmod(i,2);box=(col*512,ROWS[row],(col+1)*512,ROWS[row+1]);crop=im.crop(box)
        cx,cy=CENTRES[i];cx-=box[0];cy-=box[1]
        frame=clean(crop.transform((CELL,CELL),Image.Transform.AFFINE,(1/SCALE,0,cx-CELL/(2*SCALE),0,1/SCALE,cy-CELL/(2*SCALE)),Image.Resampling.BICUBIC))
        unique[name]=frame;mx,my=MOUTHS[i];dx=(mx-CENTRES[i][0])*SCALE*UNIT/CELL;dy=(my-CENTRES[i][1])*SCALE*UNIT/CELL
        mouths[name]={'r':[dx,dy],'l':[-dx,dy]};records[name]={'sourceCell':list(box),'sourceCore':list(CENTRES[i]),'sourceMouth':list(MOUTHS[i]),'scale':SCALE}
    for name in EXPRESSIONS:
        authored=ALIASES.get(name,name);right=unique[authored];mouths[name]=mouths[authored]
        for direction,frame in [('r',right),('l',ImageOps.mirror(right))]:
            path=OUT/f'head_{name}_{direction}.png';frame.save(path)
            a=np.array(frame);b=frame.getchannel('A').point(lambda n:255 if n>=128 else 0).getbbox();alpha=frame.getchannel('A').getbbox()
            assert min(alpha[:2])>8 and max(alpha[2:])<CELL-8
            assert not a[0,:,3].any() and not a[-1,:,3].any() and not a[:,0,3].any() and not a[:,-1,3].any()
            assert not a[a[:,:,3]==0,:3].any()
            parts[f'{name}_{direction}']={'path':path.relative_to(ROOT).as_posix(),'sha256':sha(path),'size':[CELL,CELL],'authoredExpression':authored,'mirrored':direction=='l','alphaBounds':list(alpha),'solidBounds':list(b),'nativeOpaqueSizeAt1_45':[(b[2]-b[0])*UNIT/CELL*1.45,(b[3]-b[1])*UNIT/CELL*1.45],'bytes':path.stat().st_size}
    meta={'px':CELL/UNIT,'cell':CELL,'box':UNIT,'pivot':[.5,.5],'expressions':EXPRESSIONS,'dirs':['r','l'],'palette':'emerald','colors':{'body':'#168f83','belly':'#c9e8d2','crown':'#0b5d59','outline':'#052d31','brow':'#ff8a9b','mark':'#83e4c2'},'mouths':mouths,'authoredExpressions':AUTHORED,'aliases':ALIASES,'mirroredDirections':{'l':'r'},'source':SOURCE.relative_to(ROOT).as_posix(),'sourceSHA256':sha(SOURCE),'collision':'presentation only; unchanged existing head core and route'}
    mp=OUT/'meta.json';mp.write_text(json.dumps(meta,indent=2)+'\n',encoding='utf-8')
    manifest={'version':1,'status':'New rendered expression keyposes; native runtime verification pending','source':meta['source'],'sourceSHA256':meta['sourceSHA256'],'meta':'assets/snake-emerald/meta.json','metaSHA256':sha(mp),'unit':UNIT,'cell':CELL,'pivot':[.5,.5],'authoredExpressions':AUTHORED,'aliases':ALIASES,'normalization':records,'parts':parts,'encodedBytes':sum(p['bytes'] for p in parts.values()),'packedDecodedRGBABytes':CELL*CELL*len(EXPRESSIONS)*2*4,'note':'Ten authored right-facing heads; exact mirrored left directions. Legacy aliases are explicit. No new skeletal rig or gameplay collider.'}
    manifestPath=OUT/'manifest.json';manifestPath.write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
    sheet=Image.new('RGB',(1280,960),'#122c2b');d=ImageDraw.Draw(sheet)
    for i,name in enumerate(AUTHORED):
        x=(i%5)*256;y=(i//5)*480;frame=unique[name];sheet.paste(frame,(x,y),frame);d.text((x+12,y+255),name,fill='white')
        native=frame.resize((70,70),Image.Resampling.LANCZOS);sheet.paste(native,(x+90,y+300),native);d.text((x+12,y+390),'393px phone / normal growth',fill='#a2c8bd')
    sheet.save(proof/'contact.png')
    report={'manifestSHA256':sha(manifestPath),'metaSHA256':sha(mp),'sourceSHA256':sha(SOURCE),'authoredHeads':len(AUTHORED),'legacyKeys':len(EXPRESSIONS),'directions':2,'cells':len(parts),'unit':UNIT,'cell':CELL,'aliases':ALIASES,'alphaEdges':0,'metadata':{},'allHiddenRGBZero':True,'encodedBytes':manifest['encodedBytes'],'packedDecodedRGBABytes':manifest['packedDecodedRGBABytes'],'normalOpaqueWidthRange':[min(p['nativeOpaqueSizeAt1_45'][0] for k,p in parts.items() if not k.startswith('taste')),max(p['nativeOpaqueSizeAt1_45'][0] for k,p in parts.items() if not k.startswith('taste'))],'note':'Native-sized source proof only; final integrated body/head seam and venom outlet are verified separately.'}
    (proof/'verification.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8');print(json.dumps(report,indent=2))

if __name__=='__main__':main()
