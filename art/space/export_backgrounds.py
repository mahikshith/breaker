"""Export selected far-plate masters without altering pixels or geometry."""
from pathlib import Path
import hashlib
import numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
jobs=[('a','background-a-footprint-original.png','f379b84271b7b9d563d86f1c3d1c9e636d8e94c6b37bd3d4fbfca0f9cdf2490d'),('b','background-b-footprint-original.png','6e9ca342a6e239c8c1d2411cb78f32cce58abe95a237744f5c3f372622ca1ae2')]
for variant,name,digest in jobs:
 source=ROOT/'art/space/source'/name;assert hashlib.sha256(source.read_bytes()).hexdigest()==digest
 original=Image.open(source).convert('RGB');assert original.size==(1024,1536)
 out=ROOT/f'assets/space-{variant}/background.png';original.save(out)
 check=Image.open(out);assert not check.info and check.mode=='RGB'and np.array_equal(np.array(check),np.array(original))
 print(out.relative_to(ROOT).as_posix(),check.size,hashlib.sha256(out.read_bytes()).hexdigest())
