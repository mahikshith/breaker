from PIL import Image
import json
from pathlib import Path
data=json.loads(Path('design/phase1/space-assets-ab.json').read_text())
out={}
for name in ['aPaddle','paddle','ball']:
    spec=data['parts'][name];im=Image.open(spec['path']).convert('RGBA');b=im.getchannel('A').point(lambda a:255 if a>=16 else 0).getbbox()
    out[name]={'artBounds':[b[0]/im.width,b[1]/im.height,(b[2]-b[0])/im.width,(b[3]-b[1])/im.height],'threshold':16,'path':spec['path']}
Path('out/weapon-vfx-v3').mkdir(parents=True,exist_ok=True)
Path('out/weapon-vfx-v3/carrier-art-bounds.json').write_text(json.dumps(out,indent=2))
