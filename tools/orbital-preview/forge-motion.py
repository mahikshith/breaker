"""Encode captured renderer frames; no generated or interpolated motion."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageChops
import json,hashlib
root=Path('out/orbital-forge/motion');report=json.loads((root/'report.json').read_text(encoding='utf-8'))
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',12)
for name,clip in report['clips'].items():
 frames=[]
 first=Image.open(clip['frames'][0]['path']).convert('RGB')
 for item in clip['frames']:
  im=Image.open(item['path']).convert('RGB')
  for region in [(0,0,393,45),(0,828,393,852)]:assert ImageChops.difference(first.crop(region),im.crop(region)).getbbox() is None
  cv=Image.new('RGB',(im.width,im.height+34),'#080d18');cv.paste(im,(0,34));d=ImageDraw.Draw(cv);d.text((9,3),'STAGED COMPOSITION · ACTUAL RENDERER',font=font,fill='#cddbe8');d.text((9,18),f"{name} · {item['clock']:.2f}s · {item['phase']} / {item['stage']}",font=font,fill='#9aaec3');frames.append(cv)
 clip['nativeTopBottomStable']=True
 # A small5fps viewing copy uses only captured frames; full native PNGs/contact remain authoritative.
 small=[im.resize((300,676),Image.Resampling.LANCZOS) for im in frames[::2]]
 sample=Image.new('RGB',(300,676*5))
 for j,i in enumerate([0,len(small)//4,len(small)//2,len(small)*3//4,len(small)-1]):sample.paste(small[i],(0,676*j))
 palette=sample.quantize(colors=160)
 small=[im.quantize(palette=palette,dither=Image.Dither.NONE) for im in small]
 small[0].save(root/f'{name}.gif',save_all=True,append_images=small[1:],duration=200,loop=0,optimize=True,disposal=2)
 # Selected native-size frames stay lossless for material/attachment inspection.
 wanted=['anticipate','opening','open','closing','warning'] if name=='cover' else ['collapse','projection','core','ending']
 picks=[]
 for state in wanted:
  matching=[i for i,f in enumerate(clip['frames']) if (f['stage'] if name=='cover' else f['phase'])==state]
  matching=next((matching[:j] for j in range(1,len(matching)) if matching[j]!=matching[j-1]+1),matching)
  index=matching[len(matching)//2] if matching else None
  if index is not None:picks.append(index)
 if name=='reward':
  release=next(i for i,f in enumerate(clip['frames']) if f['phase']=='core' and any(not b['caught'] for b in f['balls']));picks.insert(3,release)
 sheet=Image.new('RGB',(393*len(picks),886),'#080d18')
 for j,i in enumerate(picks):sheet.paste(frames[i],(j*393,0))
 sheet.save(root/f'{name}-contact.png')
report['exports']={p.name:{'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size} for p in root.glob('*') if p.suffix in ['.gif'] or p.name.endswith('-contact.png')}
report['clips']['cover']['hingeAnchorStable']=all((f['cover']['x'],f['cover']['y'])==(report['clips']['cover']['frames'][0]['cover']['x'],report['clips']['cover']['frames'][0]['cover']['y']) for f in report['clips']['cover']['frames'])
report['viewingCopies']='GIF300x676 at5fps selects everysecond actual10fps native frame, no interpolated frame; PNG/contact sheets remain native393x852.'
(root/'report.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report['exports'],indent=2))
