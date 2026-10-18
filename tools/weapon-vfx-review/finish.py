from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import subprocess, hashlib, json, io
root=Path('out/weapon-vfx-v2')
ffmpeg=Path('C:/Users/mahik/AppData/Local/ms-playwright/ffmpeg-1013/ffmpeg-win64.exe')
title=ImageFont.truetype('out/brum-proof/LilitaOne-Regular.ttf',32)
small=ImageFont.truetype('out/brum-proof/Rubik.ttf',15)
for name,label in [('magnetic-breacher','A · Magnetic breacher'),('reactor-rupture','B · Reactor rupture')]:
    frames=sorted((root/'frames'/name).glob('*.png'))
    if len(frames)!=125: raise RuntimeError('Incomplete native motion sequence '+name)
    # The bundled decoder accepts MJPEG through image2pipe, not PNG image sequences.
    command=[str(ffmpeg),'-y','-loglevel','error','-nostats','-f','image2pipe','-c:v','mjpeg','-framerate','24','-i','pipe:0','-c:v','libvpx-vp9','-lossless','1','-pix_fmt','yuv444p','-threads','4','-row-mt','1',str(root/(name+'.webm'))]
    proc=subprocess.Popen(command,stdin=subprocess.PIPE,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
    try:
        for f in frames:
            b=io.BytesIO();Image.open(f).convert('RGB').save(b,format='JPEG',quality=100,subsampling=0);proc.stdin.write(b.getvalue())
        proc.stdin.close();error=proc.stderr.read().decode('utf8',errors='replace');code=proc.wait()
        if code: raise RuntimeError(error)
    except BrokenPipeError:
        raise RuntimeError(proc.stderr.read().decode('utf8',errors='replace'))
    board=Image.new('RGB',(1640,1390),'#090d19');d=ImageDraw.Draw(board)
    d.text((24,18),label,font=title,fill='#f0dce9');d.text((24,63),'ACTUAL ANIMATION FRAMES · ORIGINAL MACHINERY · STAGED ARMOUR IMPACT · NO GAMEPLAY ADMISSION',font=small,fill='#b59dbd')
    phases=['charge','discharge','travel','impact']
    for row,kind in enumerate(['carrier','circuit','forge']):
        y=105+row*420;d.text((24,y),{'carrier':'Carrier Breakout','circuit':'Circuit Breakout','forge':'Shutter Forge'}[kind],font=small,fill='#dfc8de')
        for col,phase in enumerate(phases):
            im=Image.open(root/'native'/name/f'ios-{kind}-{phase}.png').convert('RGB');im=im.resize((393,852),Image.Resampling.LANCZOS)
            # Native-width action crops preserve source scale; full phones remain beside this board.
            crop=im.crop((0,120 if kind=='carrier' else 100,393,490 if kind=='carrier' else 470))
            x=24+col*404;board.paste(crop,(x,y+26));d.text((x,y+394),phase.upper(),font=small,fill='#bdb0c8')
    board.save(root/(name+'-contact.png'))
    images=[]
    for f in frames[::3]:
        im=Image.open(f).convert('RGB');im.thumbnail((620,500),Image.Resampling.LANCZOS);images.append(im.quantize(colors=192))
    images[0].save(root/(name+'.gif'),save_all=True,append_images=images[1:],duration=125,loop=0,optimize=True,disposal=2)
files={p.name:{'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in root.iterdir() if p.suffix in ['.webm','.gif'] or p.name.endswith('-contact.png')}
(root/'exports.json').write_text(json.dumps({'scope':'Full-resolution VP9 motion uses a quality100/4:4:4 JPEG pipe into the bundled losslessVP9 encoder, because it lacks a PNG decoder. CompactGIF viewing copies and native source-frame contact boards are also provided. Native PNGs are authoritative.','files':files},indent=2))
print(json.dumps(files,indent=2))
