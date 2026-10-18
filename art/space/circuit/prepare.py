"""Normalize the selected Circuit machinery/flight family; retain originals."""
import json, math, hashlib
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[3]; OUT=ROOT/'assets/relay-circuit'; OUT.mkdir(parents=True,exist_ok=True)
SOURCES=Path(__file__).parent/'source';SOURCES.mkdir(exist_ok=True)
craft=SOURCES/'craft-family.png';badge=SOURCES/'phase-badge.png'
if not craft.is_file() or not badge.is_file():raise FileNotFoundError('Preserved Circuit source plates are required')
parts={}
def save(im,name,display,pivot=(.5,.5),collision=False):
 path=OUT/(name+'.png');im.save(path)
 w,h=im.size;box=im.getchannel('A').point(lambda v:255 if v>=32 else 0).getbbox()
 p={'path':path.relative_to(ROOT).as_posix(),'size':[w,h],'display':display,'pivot':pivot,'artBounds':[box[0]/w,box[1]/h,(box[2]-box[0])/w,(box[3]-box[1])/h]}
 if collision:
  # A small raster contour uses the same measured-alpha pipeline as canonical B.
  source=(ROOT/'tools/relay-preview/art_info.py').read_text();ns={};exec(source[:source.index('manifest =')],ns)
  p['collision']=ns['contours'](im)
 parts[name]=p
im=Image.open(craft).convert('RGBA')
regions=[(0,60,697,570),(697,0,1374,570),(0,580,700,1145),(700,580,1374,1145)]
for name,region in zip(['craftMorph','craftFlight','craftLeft','craftRight'],regions):
 z=im.crop(region);box=z.getchannel('A').point(lambda v:255 if v>=16 else 0).getbbox();z=z.crop(box)
 z.thumbnail((448,352),Image.Resampling.LANCZOS);cell=Image.new('RGBA',(512,384));cell.alpha_composite(z,((512-z.width)//2,368-z.height));save(cell,name,[80,60],collision=True)
z=Image.open(badge).convert('RGBA');z=z.crop(z.getchannel('A').point(lambda v:255 if v>=16 else 0).getbbox());z.thumbnail((240,192),Image.Resampling.LANCZOS);cell=Image.new('RGBA',(256,208));cell.alpha_composite(z,((256-z.width)//2,(208-z.height)//2));save(cell,'phaseBadge',[18,14])
frame=Image.open(ROOT/'assets/space-b/pod_shell.png').convert('RGBA');w,h=frame.size;mid=w//2
save(frame.crop((0,0,mid,h)),'portLeft',[31.5,52.83374083129584],[1,.5],True)
save(frame.crop((mid,0,w,h)),'portRight',[31.5,52.83374083129584],[0,.5],True)
report={'status':'selected Circuit source family; native/runtime review pending','parts':parts,'contract':{'craftCradle':[0,-23],'flightEmitters':[[-22,-23],[22,-23]],'portTravel':18,'plateLeaves':['left','left','left','right'],'glyphs':['circle','triangle','diamond','square']},'sources':{'craft':{'path':'art/space/circuit/source/craft-family.png','sha256':hashlib.sha256(craft.read_bytes()).hexdigest()},'badge':{'path':'art/space/circuit/source/phase-badge.png','sha256':hashlib.sha256(badge.read_bytes()).hexdigest()},'port':'assets/space-b/pod_shell.png'}}
anchors={'craftFlight':{'muzzles':[[161.7/512,76.5/384],[350.5/512,76.5/384]],'cradle':[256/512,98/384],'cradleLip':[229,103,54,9]},'craftLeft':{'muzzles':[[112/512,73.2/384],[271.9/512,62.6/384]],'cradle':[225/512,94/384],'cradleLip':[201,99,54,10]},'craftRight':{'muzzles':[[231.9/512,54.7/384],[397/512,68.8/384]],'cradle':[281/512,92/384],'cradleLip':[255,97,55,10]}}
for key,values in anchors.items():parts[key].update(values);parts[key]['stowedRadius']=3
report['contract'].pop('craftCradle');report['contract'].pop('flightEmitters');report['contract']['anchors']='per-part UV measured from actual rail LEDs/U-recess; foreground source lip patch occludes the visual stowed icon only'
(OUT/'manifest.json').write_text(json.dumps(report,indent=2))
for p in OUT.glob('*.png'):
 q=Image.open(p);assert q.mode=='RGBA' and not q.info
print(json.dumps({k:{'size':v['size'],'display':v['display']} for k,v in parts.items()},indent=2))
