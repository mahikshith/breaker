from pathlib import Path
import importlib.util
import hashlib,json,math
import numpy as np
from PIL import Image,ImageDraw

ROOT=Path(__file__).resolve().parents[2];SOURCE=Path(__file__).parent;OUT=ROOT/'assets/fantasy-machinery'
spec=importlib.util.spec_from_file_location('family',SOURCE/'extract.py');f=importlib.util.module_from_spec(spec);spec.loader.exec_module(f)


def main():
    source=SOURCE/'source/water-shot-v1.png';im=Image.open(source).convert('RGBA')
    # Remove unused ultra-soft ambient matte, retain real liquid and spray.
    groups=f.components(np.array(im.getchannel('A')),64)
    rows=[row for group in groups if sum(b-a for y,a,b in group)>=16 for row in group]
    sprite,box,uv=f.fit(f.isolate(im,rows),[192,288],8)
    # Search only the leading fluid mass, retaining the authored downward nose.
    a=np.array(sprite.getchannel('A'));solid=a>=40;inside=solid.copy();inside[1:-1,1:-1]&=solid[:-2,1:-1]&solid[2:,1:-1]&solid[1:-1,:-2]&solid[1:-1,2:]
    by,bx=np.where(solid&~inside);best=None
    for y in range(170,235):
        for x in range(70,125):
            if not solid[y,x]:continue
            r=math.sqrt(float(np.min((bx-x)**2+(by-y)**2)))
            score=r-.02*math.hypot(x-96,y-210)
            if best is None or score>best[0]:best=(score,x,y,r)
    _,x,y,r=best;pivot=[x/192,y/288]
    path=OUT/'water-shot.png';sprite.save(path);audit=f.audit(path)
    yy,xx=np.mgrid[:288,:192];core=(xx-x)**2+(yy-y)**2<=60**2
    e={'version':1,'path':path.relative_to(ROOT).as_posix(),'size':[192,288],'unit':[32,48],
       'pivot':pivot,'anchors':{'core':pivot,'nose':uv([524,1421]),'tail':uv([630,96])},
       'collision':{'type':'circle','r':10},'visibleCore':{'alphaThreshold':40,'inscribedRadius':r/6,'r10VisibleFraction':float(np.mean(a[core]>=40))},
       'source':source.relative_to(ROOT).as_posix(),'sourceCrop':box,'sourceSHA256':f.sha(source),'sha256':f.sha(path),
       'alphaBounds':list(sprite.getchannel('A').getbbox()),'audit':audit,'facing':'down',
       'note':'Independent dimensional translucent pressured-water raster. Pivot is measured frontmass centre; foam/spray outside collision circle are presentation. Root owns real velocity rotation and physical projectile.'}
    m=OUT/'water-shot-manifest.json';m.write_text(json.dumps(e,indent=2)+'\n',encoding='utf-8')
    proof=Image.new('RGB',(640,300),'#102131');d=ImageDraw.Draw(proof);large=sprite.copy();proof.paste(large,(10,5),large);d.ellipse((10+x-60,5+y-60,10+x+60,5+y+60),outline='#ffb95a',width=2)
    for i,scale in enumerate([1,393/360,412/360]):
        thumb=sprite.resize((round(32*scale),round(48*scale)),Image.Resampling.LANCZOS);px=260+i*100;proof.paste(thumb,(px,80),thumb);d.text((px-15,140),['32x48u','iOSnative','Androidnative'][i],fill='white')
    d.text((15,292),'Orange = physicalr10 | staged art sizes, not earnedgameplay',fill='white');proof.save(SOURCE/'proof/water-shot-native.png')
    print(json.dumps({'manifestSHA256':f.sha(m),'path':str(path),'pivot':pivot,'visibleCore':e['visibleCore'],'sourceSHA256':e['sourceSHA256'],'runtimeSHA256':e['sha256']}))


if __name__=='__main__':main()
