"""Build review movies from the preview's native PNG frames; sources stay lossless."""
from pathlib import Path
import sys
from PIL import Image

root = Path(sys.argv[1] if len(sys.argv) > 1 else 'out/space-assets-ab/final')
for family in 'AB':
    paths = sorted((root / f'{family}-motion').glob('*.png'))
    assert paths, f'Missing native motion frames for {family}'
    frames = [Image.open(p).convert('RGB') for p in paths]
    width, height = frames[0].size
    assert all(f.size == (width, height) for f in frames)
    samples = [frames[min(len(frames)-1, round(i*(len(frames)-1)/7))] for i in range(8)]
    strip = Image.new('RGB', (width*4, height*2))
    for i, frame in enumerate(samples):
        strip.paste(frame, ((i % 4)*width, (i // 4)*height))
    palette = strip.quantize(colors=256)
    indexed = [f.quantize(palette=palette, dither=Image.Dither.NONE) for f in frames]
    indexed[0].save(root/f'{family}-motion.gif', save_all=True, append_images=indexed[1:], duration=83, loop=0, optimize=True, disposal=1)
    strip.save(root/f'{family}-motion-poses.png')
    print(f'{family}: {len(frames)} native frames at {width}x{height}; GIF is a review encoding, PNGs retain full quality.')
