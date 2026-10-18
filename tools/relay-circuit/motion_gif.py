"""Crop an actual phone capture sequence; no generated frames."""
from pathlib import Path
from PIL import Image, ImageDraw
import json, sys
root=Path(__file__).resolve().parents[2]
base=root/(sys.argv[1] if len(sys.argv)>1 else 'out/relay-circuit/final-proof')
folder=base/'morph-motion'
report=json.loads((folder/'report.json').read_text())
frames=[]
poses=report['poses'][1:] # First staged contact precedes the next real Main tick; show rendered ticks only.
for p in poses:
    im=Image.open(folder/f"{p['frame']:03}.png").convert('RGB').crop((0,570,393,820))
    canvas=Image.new('RGB',(393,280),'#080b18');canvas.paste(im,(0,30))
    ImageDraw.Draw(canvas).text((10,10),f"STAGED CONTACT FIXTURE  |  {p['phase'].upper()}",fill='#c8d4ee')
    frames.append(canvas.quantize(colors=128))
frames[0].save(base/'circuit-morph-flight-return.gif',save_all=True,append_images=frames[1:],duration=167,loop=0,optimize=True)
indices=[0,1,4,11,23,len(poses)-3,len(poses)-1]
sheet=Image.new('RGB',(393*len(indices),280),'#080b18')
for x,index in enumerate(indices):sheet.paste(frames[index].convert('RGB'),(x*393,0))
sheet.save(base/'circuit-motion-sheet.png')
print({'frames':len(frames),'gifBytes':(base/'circuit-morph-flight-return.gif').stat().st_size})
