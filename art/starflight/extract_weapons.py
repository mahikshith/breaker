"""Extract six VFX cells; preserve their alpha and record measured contact pivots."""
import hashlib
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "art/starflight/weapons-source.png"
OUT = ROOT / "assets/starflight/weapons"
OUT.mkdir(parents=True, exist_ok=True)
sheet = Image.open(SOURCE).convert("RGBA")
assert sheet.size == (1536, 1024), sheet.size
names = ["plasma", "enemy", "hyper", "muzzle", "explosion", "stasis"]
pivots = {"plasma": [.568, .36], "enemy": [.502, .672], "hyper": [.456, .599]}
manifest = {"source": str(SOURCE.relative_to(ROOT)), "sha256": hashlib.sha256(SOURCE.read_bytes()).hexdigest(), "sprites": {}}
for i, name in enumerate(names):
    x, y = i % 3 * 512, i // 3 * 512
    crop = sheet.crop((x, y, x + 512, y + 512))
    assert crop.getchannel("A").getextrema()[0] == 0
    # Preserve transparent space around each full cell rather than clipping the glow.
    crop.thumbnail((240, 240), Image.Resampling.LANCZOS)
    sprite = Image.new("RGBA", (256, 256))
    sprite.paste(crop, (8, 8))
    sprite.save(OUT / f"{name}.png")
    manifest["sprites"][name] = {"rect": [x, y, 512, 512], "size": [256, 256], "pivot": pivots.get(name, [.5, .5])}
(OUT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
print(f"Extracted {len(names)} alpha sprites")
