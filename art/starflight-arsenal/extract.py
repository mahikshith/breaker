"""Preserve complete connected equipment silhouettes, including separated paired objects."""
from pathlib import Path
import importlib.util
import hashlib
import json
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("ship_extract", ROOT / "art/starflight/extract.py")
extract = importlib.util.module_from_spec(spec)
spec.loader.exec_module(extract)
source = Path(__file__).parent / "source.png"
image = Image.open(source).convert("RGBA")
groups = extract.components(np.array(image.getchannel("A")))
out = ROOT / "assets/starflight-arsenal"
out.mkdir(parents=True, exist_ok=True)
parts = {"laser": [5], "hyper": [3], "seeker": [8, 9], "spiral": [6],
         "drones": [7, 10], "nova": [1], "stasis": [2], "repair": [4], "shield": [0],
         "missile": [9], "drone": [10]}
manifest = {"source": source.relative_to(ROOT).as_posix(),
            "sourceSHA256": hashlib.sha256(source.read_bytes()).hexdigest(), "sprites": {}}
for name, ids in parts.items():
    rows = [row for i in ids for row in groups[i]]
    sprite, crop, uv = extract.normalize(image, rows, [192, 192])
    path = out / f"{name}.png"
    sprite.save(path)
    alpha = np.array(sprite.getchannel("A"))
    assert not alpha[0].any() and not alpha[-1].any() and not alpha[:, 0].any() and not alpha[:, -1].any()
    assert not Image.open(path).info
    manifest["sprites"][name] = {"path": path.relative_to(ROOT).as_posix(), "size": [192, 192],
                                "pivot": [.5, .5], "sourceCrop": crop,
                                "sha256": hashlib.sha256(path.read_bytes()).hexdigest()}
manifest["sprites"]["missile"]["forwardAngle"] = -.9
manifest["sprites"]["spiral"]["forwardAngle"] = 2.4
(out / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
print(f"Extracted {len(parts)} equipment sprites")
