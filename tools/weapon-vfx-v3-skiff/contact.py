from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import hashlib,json
root=Path('out/weapon-vfx-v3-skiff/proof')
font=ImageFont.truetype('out/brum-proof/Rubik.ttf',16)
sheet=Image.new('RGB',(1395,1050),'#101320');d=ImageDraw.Draw(sheet)
d.text((16,12),'CIRCUIT SKIFF · COMPOSED MOTION PROPOSAL · NO GAMEPLAY CHANGE',font=font,fill='#ecc5e2')
for file,x,label in[('ios-left-fire.png',16,'iPhone 393×852'),('android-right-fire.png',425,'Android 412×915')]:
 im=Image.open(root/file).convert('RGB');sheet.paste(im,(x,68));d.text((x,43),label,font=font,fill='#c6b6d0')
for file,y,label in[('ios-open-detail.png',68,'Armour pivots / twin rails extend'),('android-right-fire-detail.png',465,'Independent cannon recoil / stowed ball')]:
 im=Image.open(root/file).convert('RGB');sheet.paste(im,(853,y));d.text((853,y-25),label,font=font,fill='#c6b6d0')
d.text((16,1020),'Actual approved rasters. 0.45s deployment; shortened flight excerpt. Companion casting remains pending.',font=font,fill='#b59cc4')
p=root/'contact.png';sheet.save(p)
report={'path':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'source':'Four existing exact native/detail proof PNGs; no interpolation or repainting.'}
(root/'contact-report.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
