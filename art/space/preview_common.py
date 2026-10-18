"""Native-scale raster proof of delivered common pieces, not a gameplay screenshot."""
from pathlib import Path
import json,hashlib
from PIL import Image,ImageDraw,ImageFont
import numpy as np
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'out/space-common-proof';OUT.mkdir(parents=True,exist_ok=True)
AS=ROOT/'assets/space-common';manifest=json.loads((AS/'manifest.json').read_text());fonts=ROOT/'out/brum-proof'
def font(n,title=False):
 p=fonts/('LilitaOne-Regular.ttf'if title else'Rubik.ttf')
 if p.exists():return ImageFont.truetype(str(p),n)
 fallback=Path('C:/Windows/Fonts/arialbd.ttf'if title else'C:/Windows/Fonts/arial.ttf')
 return ImageFont.truetype(str(fallback),n)if fallback.exists()else ImageFont.load_default(size=n)
def text(im,xy,s,n=20,fill='#EAE8F4',title=False):ImageDraw.Draw(im).text(xy,s,font=font(n,title),fill=fill)
def sprite(im,name,center,scale,folder=AS):
 src=Image.open(folder/(name+'.png')).convert('RGBA');src=src.resize((round(src.width*scale/3),round(src.height*scale/3)),Image.Resampling.LANCZOS)
 im.alpha_composite(src,(round(center[0]-src.width/2),round(center[1]-src.height/2)))
def cover(src,w,h):
 s=max(w/src.width,h/src.height);im=src.resize((round(src.width*s),round(src.height*s)),Image.Resampling.LANCZOS)
 return im.crop((im.width-w,(im.height-h)//2,im.width,(im.height+h)//2)).convert('RGBA')

names=['brick_cyan','brick_violet','brick_pink','brick_armour','brick_crew_lock','paddle','ball','capsule_laser','capsule_split','capsule_shield']
sheet=Image.new('RGBA',(1440,790),'#101525')
text(sheet,(28,22),'SPACE COMMON / DELIVERED COMPONENTS',38,title=True)
text(sheet,(28,72),'Actual transparent PNGs. Upper view at3px/u; lower sample at phone scale (393/360).',21,'#BAC2D7')
for i,name in enumerate(names):
 x=24+(i%5)*283;y=122+(i//5)*316;ImageDraw.Draw(sheet).rounded_rectangle((x,y,x+266,y+296),18,fill='#1B2338')
 text(sheet,(x+14,y+13),name,18,title=True)
 src=Image.open(AS/(name+'.png')).convert('RGBA');sheet.alpha_composite(src,(x+(266-src.width)//2,y+61+(86-src.height)//2))
 sprite(sheet,name,(x+133,y+213),393/360)
 row=manifest['parts'][name];text(sheet,(x+13,y+260),f"{row['size'][0]}x{row['size'][1]}px / center pivot",15,'#BAC2D7')
text(sheet,(28,755),'Intact source parts only. Damage cracks are a separate preview overlay; power names stay outside sprites.',20,'#BAC2D7')
sheet.convert('RGB').save(OUT/'contact-sheet.png')
carrier=json.loads((ROOT/'assets/space-a/common-panels-manifest.json').read_text());aSheet=Image.new('RGBA',(960,430),'#101525');text(aSheet,(25,20),'CARRIER A / DEDICATED PANEL FAMILY',34,title=True)
for i,name in enumerate(['brick_cyan','brick_pink','paddle']):
 x=20+i*316;ImageDraw.Draw(aSheet).rounded_rectangle((x,83,x+300,389),18,fill='#1B2338');text(aSheet,(x+16,100),name,22,title=True)
 src=Image.open(ROOT/'assets/space-a'/(name+'.png')).convert('RGBA');aSheet.alpha_composite(src,(x+(300-src.width)//2,148+(90-src.height)//2))
 sprite(aSheet,name,(x+150,309),393/360,ROOT/'assets/space-a');text(aSheet,(x+16,353),'3px/u above / native below',16,'#BAC2D7')
text(aSheet,(25,402),'Four-corner center-X crate seams and flat metal paddle follow the approved A crop.',18,'#BAC2D7');aSheet.convert('RGB').save(OUT/'carrier-a-panels.png')

phone_paths=[]
for label,w,h in [('ios',393,852),('android',412,915)]:
 for variant in ['a','b']:
  bg=Image.open(ROOT/f'assets/space-{variant}/background.png').convert('RGB');im=cover(bg,w,h);s=w/360
  def at(name,x,y):sprite(im,name,(x*s,y*s),s,ROOT/'assets/space-a'if variant=='a'and name in ['brick_cyan','brick_pink','paddle']else AS)
  first='brick_pink'if variant=='a'else'brick_violet'
  for row in range(4):
   for col in range(8):at('brick_cyan'if row%2==0 else first,40+col*40,165+row*26)
  for x in [60,140,220,300]:at('brick_armour',x,288)
  at('brick_crew_lock',180,335)
  for name,x in [('capsule_laser',75),('capsule_split',180),('capsule_shield',285)]:at(name,x,420)
  at('ball',180,520);at('paddle',180,h/s-96)
  path=OUT/f'{label}-{variant}-native.png';im.convert('RGB').save(path);phone_paths.append((label,variant,path))
board=Image.new('RGB',(1024,1020),'#101525');text(board,(22,14),'COMMON PARTS / NATIVE CONTEXT PROOF',32,title=True)
text(board,(24,59),'Raster placement study only: no hulls, enemies, companions, HUD or active gameplay.',18,'#BAC2D7')
for i,(label,var,path)in enumerate(phone_paths):
 im=Image.open(path);im.thumbnail((236,875),Image.Resampling.LANCZOS);x=20+i*251;board.paste(im,(x,111));text(board,(x,88),f'{label.upper()} / {var.upper()}',19,title=True)
text(board,(24,981),'Phone files preserve their real393x852 /412x915 pixel sizes; this summary uses thumbnails.',18,'#BAC2D7')
board.save(OUT/'native-context-review.png')

checks={'status':'component alpha/crop and native raster context verified; Canvas assembly and owner screenshot review remain separate','parts':{},'carrierParts':{},'backgrounds':{}}
for name,row in manifest['parts'].items():
 p=ROOT/row['path'];im=Image.open(p);a=np.array(im.getchannel('A'));bb=im.getchannel('A').getbbox()
 assert im.mode=='RGBA'and not im.info and a.min()==0 and a.max()==255
 assert list(im.size)==row['size'];assert bb[0]>=11 and bb[1]>=11 and im.width-bb[2]>=11 and im.height-bb[3]>=11
 if row['aperture']:
  x0,y0,x1,y1=row['aperture']['safeTransparentPixels'];assert not np.any(a[y0:y1,x0:x1])
 checks['parts'][name]={'size':im.size,'alpha':bb,'metadataKeys':list(im.info),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'safeApertureVerified':bool(row['aperture'])}
for name,row in carrier['parts'].items():
 p=ROOT/row['path'];im=Image.open(p);bb=im.getchannel('A').getbbox();assert im.mode=='RGBA'and not im.info and list(im.size)==row['size']
 assert min(bb[0],bb[1],im.width-bb[2],im.height-bb[3])>=11
 checks['carrierParts'][name]={'size':im.size,'alpha':bb,'metadataKeys':list(im.info),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
for var,source,prompt in [('a','background-a-footprint-original.png','background-a-footprint-prompt.md'),('b','background-b-footprint-original.png','background-b-footprint-prompt.md')]:
 p=ROOT/f'assets/space-{var}/background.png';im=Image.open(p);assert im.mode=='RGB'and im.size==(1024,1536)and not im.info
 arr=np.array(im);lum=arr[:,:,0]*.2126+arr[:,:,1]*.7152+arr[:,:,2]*.0722;centre=lum[:,int(im.width*.25):int(im.width*.75)]
 checks['backgrounds'][var]={'path':p.relative_to(ROOT).as_posix(),'size':im.size,'mode':im.mode,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'source':f'art/space/source/{source}','prompt':f'art/space/{prompt}','centralLuminanceMean8bit':float(centre.mean()),'centralLuminanceP95_8bit':float(np.percentile(centre,95)),'fit':'uniform cover, right anchor; no extra wash or lower mask; rocks and planet are distant decoration with no collision'}
manifest['status']='Intact components normalized; alpha/crop and native raster context passed; Canvas assembly/owner review pending'
manifest['qa']='out/space-common-proof/checks.json';manifest['backgrounds']=checks['backgrounds']
manifest['carrierOverride']='assets/space-a/common-panels-manifest.json';carrier['status']='Dedicated Carrier A family; alpha/crop and native raster context passed; Canvas assembly/owner review pending';carrier['qa']='out/space-common-proof/checks.json';(ROOT/'assets/space-a/common-panels-manifest.json').write_text(json.dumps(carrier,indent=2)+'\n')
(AS/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n');(OUT/'checks.json').write_text(json.dumps(checks,indent=2)+'\n')
print('Native component proof:',OUT)
