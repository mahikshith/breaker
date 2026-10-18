"""Assert the exact bounded prototype state; do not promote missing clips or seed stills."""
from pathlib import Path
from PIL import Image, ImageChops
import hashlib,json
ROOT=Path(__file__).resolve().parents[3]
OUT=ROOT/'design/phase1/weapon-vfx-v2'
m=json.loads((OUT/'manifest.json').read_text())
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert m['sourceSha256']==sha(ROOT/m['source'])
report={'status':'PASS — two prototype charge atlases only; flight and impact held, no runtime admission','sourceSha256':m['sourceSha256'],'manifestSha256':sha(OUT/'manifest.json'),'atlases':{},'unrendered':[],'proofs':{},'flightCandidates':{}}
for fam in ['helix','reactor']:
 for phase in ['charge','flight','impact']:
  entry=m['families'][fam][phase];p=OUT/entry['atlas']
  assert entry['cell']==[256,256] and entry['grid']==[4,3] and entry['frames']==12
  assert entry['pivot']==[128,128] and entry['fps']==24 and entry['blend']=='source-over'
  if phase!='charge':
   assert not p.exists() and not entry['available'], f'Unapproved clip unexpectedly complete: {p}'
   report['unrendered'].append(f'{fam}/{phase}');continue
  assert p.exists() and entry['available']
  im=Image.open(p);assert im.mode=='RGBA' and im.size==(1024,768) and not im.info
  cells=[];decoded=im.width*im.height*4
  for i,rect in enumerate(entry['frameRects']):
   x,y,w,h=rect;cell=im.crop((x,y,x+w,y+h));frame=OUT/f'frames/{fam}-{phase}/{fam}-{phase}-{i:02}.png';source=Image.open(frame)
   assert source.mode=='RGBA' and source.size==(256,256) and not source.info
   assert cell.tobytes()==source.tobytes(), f'Atlas RGBA cell mismatch: {fam}/{i}'
   a=cell.getchannel('A');bounds=a.getbbox();assert bounds is not None
   x0,y0,x1,y1=bounds;assert min(x0,y0,256-x1,256-y1)>=4, f'Clipped alpha: {fam}/{i}'
   assert a.getextrema()==(0,255)
   cells.append({'frame':i,'alphaBounds':bounds,'minPadding':min(x0,y0,256-x1,256-y1),'sha256':sha(frame)})
  assert len({r['sha256']for r in cells})==12, f'Frozen duplicate frames: {fam}'
  report['atlases'][fam]={'path':str(p.relative_to(ROOT)),'sha256':sha(p),'encodedBytes':p.stat().st_size,'decodedRGBABytes':decoded,'frames':cells}
 for alias,source in [('cool','charge'),('discharge','flight')]:assert m['families'][fam][alias]['available']==m['families'][fam][source]['available']
for p in sorted((OUT/'proof').rglob('*.png')):
 im=Image.open(p);assert im.mode=='RGBA' and im.size==(256,256) and not im.info
 report['proofs'][str(p.relative_to(OUT))]={'status':'unapproved draft still, not an atlas','sha256':sha(p),'alphaBounds':im.getchannel('A').getbbox()}
for name,expected in [('payload-A.png','ab4dfc62bae61d1e232ad3c9667f493211ce595d1e9b0986b2d5b6581dfa510c'),('payload-B.png','99e9205b3e41fb91a37a57880b7fe11dd3f2550c7b339944f731ce1d2527ca85')]:
 p=OUT/name;im=Image.open(p)
 assert sha(p)==expected and im.size==(1254,1254) and im.mode=='RGBA' and not im.info
 a=im.getchannel('A');assert a.getextrema()==(0,255)
 solid=a.point(lambda value:255 if value>16 else 0).getbbox();assert solid is not None
 x0,y0,x1,y1=solid;assert min(x0,y0,1254-x1,1254-y1)>=16
 edge=max(a.crop(box).getextrema()[1]for box in[(0,0,1254,1),(0,1253,1254,1254),(0,0,1,1254),(1253,0,1254,1254)])
 assert edge<=1
 report['flightCandidates'][name]={'path':str(p.relative_to(ROOT)),'status':'single-frame flight artwork awaiting owner review; motion composed in preview','sha256':sha(p),'size':im.size,'mode':im.mode,'metadataKeys':list(im.info),'alphaExtrema':a.getextrema(),'alphaBounds':a.getbbox(),'alpha16Bounds':solid,'edgeAlphaMax':edge,'strictZeroAlphaPadding':edge==0,'encodedBytes':p.stat().st_size,'decodedRGBABytes':im.width*im.height*4}
report['totalEncodedBytes']=sum(a['encodedBytes']for a in report['atlases'].values())
report['totalDecodedRGBABytes']=sum(a['decodedRGBABytes']for a in report['atlases'].values())
(OUT/'asset-report.json').write_text(json.dumps(report,indent=2))
print(json.dumps({k:report[k]for k in ['status','sourceSha256','manifestSha256','totalEncodedBytes','totalDecodedRGBABytes','unrendered']},indent=2))
