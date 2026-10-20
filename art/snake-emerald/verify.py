from pathlib import Path
import hashlib,json
import numpy as np
from PIL import Image,ImageOps,ImageDraw

ROOT=Path(__file__).resolve().parents[2];HERE=Path(__file__).parent;OUT=ROOT/'assets/snake-emerald'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    meta=json.loads((OUT/'meta.json').read_text());m=json.loads((OUT/'manifest.json').read_text());source=ROOT/m['source']
    assert sha(source)==m['sourceSHA256'] and not Image.open(source).info
    assert sha(OUT/'meta.json')==m['metaSHA256'];assert meta['box']==44 and meta['cell']==256 and meta['pivot']==[.5,.5]
    assert meta['expressions']==['idle','blink','taste','hunt','chew0','chew1','hiss','ouch','dizzy','shock','snarl','strike','grin'] and meta['dirs']==['r','l']
    checks=[];sheet=Image.new('RGB',(5*256,2*256),'#172322');d=ImageDraw.Draw(sheet)
    for index,name in enumerate(meta['authoredExpressions']):
        im=Image.open(OUT/f'head_{name}_r.png');x=index%5*256;y=index//5*256;sheet.paste(im,(x,y),im)
        mx,my=meta['mouths'][name]['r'];p=(x+128+mx/44*256,y+128+my/44*256);d.ellipse((p[0]-3,p[1]-3,p[0]+3,p[1]+3),outline='#ffbb55');d.line((x+122,y+128,x+134,y+128),fill='#b5f4df');d.line((x+128,y+122,x+128,y+134),fill='#b5f4df');d.text((x+8,y+225),name,fill='white')
    sheet.save(HERE/'proof/anchors.png')
    for name in meta['expressions']:
        right=Image.open(OUT/f'head_{name}_r.png');left=Image.open(OUT/f'head_{name}_l.png')
        assert np.array_equal(np.array(ImageOps.mirror(right)),np.array(left))
        if name in meta['aliases']:
            assert np.array_equal(np.array(right),np.array(Image.open(OUT/f"head_{meta['aliases'][name]}_r.png")))
        assert meta['mouths'][name]['l']==[-meta['mouths'][name]['r'][0],meta['mouths'][name]['r'][1]]
        for direction,im in [('r',right),('l',left)]:
            a=np.array(im);p=OUT/f'head_{name}_{direction}.png';assert im.size==(256,256) and im.mode=='RGBA' and not im.info;assert sha(p)==m['parts'][name+'_'+direction]['sha256']
            assert not a[0,:,3].any() and not a[-1,:,3].any() and not a[:,0,3].any() and not a[:,-1,3].any() and not a[a[:,:,3]==0,:3].any()
            mx,my=meta['mouths'][name][direction];px=round(128+mx/44*256);py=round(128+my/44*256)
            assert a[128,128,3]>=128 and a[py,px,3]>=128
            checks.append({'expression':name,'direction':direction,'hash':sha(p),'centreAlpha':int(a[128,128,3]),'mouthAlpha':int(a[py,px,3])})
    sheet.save(HERE/'proof/anchors.png')
    report={'manifestSHA256':sha(OUT/'manifest.json'),'metaSHA256':sha(OUT/'meta.json'),'sourceSHA256':sha(source),'checks':checks,'mirrorExact':True,'aliasesExact':True,'mouthsOnOpaqueHead':True,'metadataEmpty':True,'alphaEdgesZero':True,'hiddenRGBZero':True,'scope':'Source family, exact pixel mirroring, reference scale and mouth/core registration only. Integrated native motion, seam and venom alignment have separate runtime receipts.'}
    (HERE/'proof/source-verification.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items() if k!='checks'},indent=2))

if __name__=='__main__':main()
