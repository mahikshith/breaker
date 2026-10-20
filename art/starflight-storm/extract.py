from pathlib import Path
import hashlib
import json
import runpy
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).parent
OUT = ROOT/'assets/starflight-storm'
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()


if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    reference = HERE/'player-reference.png'
    original = Image.open(reference).convert('RGBA')
    source = HERE/'source-v1.png'
    sheet = Image.open(source).convert('RGBA')
    # Preserve the shipped neutral silhouette exactly. The seam follows its central armour.
    ys = np.arange(original.height)
    left = np.interp(ys, [0,40,75,105,135,173,215,287], [160,137,132,122,122,133,136,139])
    xs = np.arange(original.width)[None,:]
    body_mask = (xs >= left[:,None]) & (xs < original.width-left[:,None])
    body_mask[ys<45] = True
    masks = {'body': body_mask, 'wing-left': (xs < left[:,None]) & (ys[:,None]>=45),
             'wing-right': (xs >= original.width-left[:,None]) & (ys[:,None]>=45)}
    assembled = Image.new('RGBA', original.size)
    entries = {}
    for name, mask in masks.items():
        pixels = np.array(original)
        pixels[~mask] = 0
        pixels[pixels[:,:,3] == 0] = 0
        image = Image.fromarray(pixels)
        path = OUT/(name+'.png')
        image.save(path)
        assembled.alpha_composite(image)
        pivot = {'body':[.5,.5], 'wing-left':[130/320,164/288], 'wing-right':[190/320,164/288]}[name]
        entries[name] = {'path':path.relative_to(ROOT).as_posix(), 'size':[320,288], 'display':[52,46.8],
            'pivot':pivot, 'neutralOffset':[(pivot[0]-.5)*52,(pivot[1]-.5)*46.8],
            'alphaBounds':image.getchannel('A').getbbox(), 'sha256':sha(path),
            'source':reference.relative_to(ROOT).as_posix(), 'sourceSHA256':sha(reference)}
    assert np.array_equal(np.array(assembled),np.array(original)), 'neutral assembly must preserve every source RGBA pixel'
    assembled.save(HERE/'assembled.png')
    helpers = runpy.run_path(str(ROOT/'art/starflight-v2/extract.py'))
    groups = helpers['components'](np.array(sheet.getchannel('A')))
    for name, index, size, width in [('storm-icon',0,[256,192],60),('ricochet',4,[128,256],12)]:
        image, box, uv = helpers['normalize'](sheet,groups[index],size)
        path = OUT/(name+'.png')
        image.save(path)
        pivot = [.5,.5] if name=='storm-icon' else uv([998,980])
        entries[name] = {'path':path.relative_to(ROOT).as_posix(),'size':size,'display':[width,width*size[1]/size[0]],
            'pivot':pivot,'alphaBounds':image.getchannel('A').getbbox(),'sha256':sha(path),
            'source':source.relative_to(ROOT).as_posix(),'sourceSHA256':sha(source),'sourceCrop':box}
        if name=='ricochet':
            entries[name]['noseUV']=uv([999,744]);entries[name]['engineUV']=uv([998,1100]);entries[name]['facing']='up'
    entries['body']['sockets']={'left':[131/320,164/288],'right':[189/320,164/288]}
    for name,muzzle,engine in [('wing-left',[.348125,.22790556900726391],[.314375,.842984934086629]),
                              ('wing-right',[.655625,.22790556900726391],[.665,.842984934086629])]:
        entries[name]['attachmentUV']=entries[name]['pivot']
        entries[name]['tipUV']=muzzle
        entries[name]['muzzleUV']=muzzle
        entries[name]['engineUV']=engine
        pivot=entries[name]['pivot']
        entries[name]['tipOffset']=[(muzzle[0]-pivot[0])*52,(muzzle[1]-pivot[1])*46.8]
        entries[name]['engineOffset']=[(engine[0]-pivot[0])*52,(engine[1]-pivot[1])*46.8]
    manifest={'version':1,'status':'Five-object detached-wing family; runtime motion/physics admission separate',
        'reference':reference.relative_to(ROOT).as_posix(),'referenceSHA256':sha(reference),
        'source':source.relative_to(ROOT).as_posix(),'sourceSHA256':sha(source),
        'filter':'linear','facing':'up','sharedCanvas':[320,288],'heroDisplay':[52,46.8],
        'pivotConvention':'Full canvas normalized UV. Wing pose coordinates represent the actual inner armour attachment, not image centre.',
        'neutralAssembly':'Body at player centre. Wing pose = body centre + rotated neutralOffset; draw each wing with its own pivot. Neutral composite is pixel-exact to the existing player.',
        'parts':entries,'limits':['Flight layers preserve the exact existing hero pixels instead of admitting the wider generated exploded proportions.',
            'Generated exposed socket studies remain retained in source-v1; they are not baked into neutral flight layers.',
            'No generic drone substitution. Each wing owns its original gun, nozzle and swept surface.',
            'Storm-icon is a menu raster, not a field-wide lightning or damage collider.']}
    (OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
    checks={}
    for name,part in entries.items():
        image=Image.open(ROOT/part['path']);a=np.array(image)
        assert image.mode=='RGBA' and not image.info
        assert not a[0,:,3].any() and not a[-1,:,3].any() and not a[:,0,3].any() and not a[:,-1,3].any()
        assert not a[a[:,:,3]==0,:3].any()
        checks[name]={'size':image.size,'bytes':(ROOT/part['path']).stat().st_size,'decodedRGBABytes':image.width*image.height*4,
            'metadataEmpty':True,'clearEdges':True}
        for key in ['tipUV','engineUV','attachmentUV']:
            if key in part:
                u,v=part[key];alpha=image.getpixel((round(u*image.width),round(v*image.height)))[3]
                checks[name][key+'Alpha']=alpha
                assert alpha>=128,(name,key,alpha)
    checks={'neutralRGBAErrorMax':0,'manifestSHA256':sha(OUT/'manifest.json'),'parts':checks,
        'runtimePNGBytes':sum(p['bytes']for p in checks.values()),'decodedRGBABytes':sum(p['decodedRGBABytes']for p in checks.values())}
    (HERE/'checks.json').write_text(json.dumps(checks,indent=2)+'\n')
    print(json.dumps(checks))
