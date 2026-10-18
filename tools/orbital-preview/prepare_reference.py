"""Deterministic crops of the approved C board for machinery production."""
from pathlib import Path
import hashlib
import json
from PIL import Image

root=Path(__file__).resolve().parents[2]
source=root/'design/phase1/img/space-orbital-c-v1.png'
out=root/'art/space/source'
image=Image.open(source).convert('RGBA')
entries=[]
for name,box in [('orbital-reference-pane',(12,12,620,990)),('orbital-hull-reference',(12,14,620,270)),('orbital-hangar-reference',(214,156,435,258))]:
    target=out/(name+'.png')
    image.crop(box).save(target)
    assert not Image.open(target).info
    entries.append({'file':target.relative_to(root).as_posix(),'crop':list(box),'sha256':hashlib.sha256(target.read_bytes()).hexdigest()})
(out/'orbital-reference-crops.json').write_text(json.dumps({'source':source.relative_to(root).as_posix(),'sourceSHA256':hashlib.sha256(source.read_bytes()).hexdigest(),'crops':entries},indent=2)+'\n')
print(json.dumps(entries,indent=2))
