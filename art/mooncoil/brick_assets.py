"""Mooncoil moonstone/silver brick family. Run from repo root with installed bpy5.2.
python art/mooncoil/brick_assets.py --seed  # representative 32×16u blue brick
python art/mooncoil/brick_assets.py         # complete nineteen-part family + manifest
"""
from pathlib import Path
import sys, json, hashlib, math
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'art'))
import render_vault_assets as rig
import bpy
from PIL import Image, ImageDraw, ImageFont
import numpy as np

HERE = Path(__file__).resolve().parent
OUT = ROOT / 'assets' / 'mooncoil'
PROOF = HERE / 'proof'
for d in (OUT, PROOF, HERE / 'source'): d.mkdir(parents=True, exist_ok=True)
rig.TMP = str(HERE / 'source')
rig.THREADS = 4
COLORS = {'b': (6, '#4b9be0'), 'c': (2, '#ee7c8a'), 't': (4, '#39b69d'), 'v': (3, '#9a73de')}

def polygon(w, h, cut):
    return [(-w/2+cut,h/2),(w/2-cut,h/2),(w/2,h/2-cut),(w/2,-h/2+cut),
            (w/2-cut,-h/2),(-w/2+cut,-h/2),(-w/2,-h/2+cut),(-w/2,h/2-cut)]

def stone(name, w, h, colour, damage, letter, width):
    crack = rig.crack_texture(letter, width, damage, (1,1)) if damage else None
    face = rig.glaze_mat(name+'_moonstone', colour, 43+width, crack, (w,h), gloss=True)
    p = face.node_tree.nodes['Principled BSDF']; p.inputs['Roughness'].default_value=.18
    p.inputs['Coat Weight'].default_value=.8; p.inputs['Metallic'].default_value=.12
    p.inputs['Subsurface Weight'].default_value=.045
    # A shallow eight-sided crown: broad, planar bevels rather than a rounded ceramic slab.
    outer=polygon(w,h,.24); inner=polygon(w-.32,h-.32,.18)
    x,_,z=rig.at(); verts=[(a,-1.06,b) for a,b in outer]+[(a,-1.30,b) for a,b in inner]
    verts += [(-.06,-1.34,.04)]
    faces=[]
    for i in range(8):
        j=(i+1)%8; faces.append((i,j,8+j,8+i)); faces.append((8+i,8+j,16))
    mesh=bpy.data.meshes.new(name+'_facets');mesh.from_pydata(verts,[],faces);mesh.update()
    obj=bpy.data.objects.new(name+'_facets',mesh);bpy.context.collection.objects.link(obj);obj.location=(x,0,z);obj.data.materials.append(face)
    return obj

def build(letter, width, damage):
    for o in list(bpy.context.scene.objects):
        if o.type in ('MESH','CURVE') and o.name!='softbox': bpy.data.objects.remove(o,do_unlink=True)
    w=width*1.6-.07; h=1.6-.07
    silver=rig.mat('moon_silver',rig.srgb('#c9d6e9'),rough=.17,metal=.95,coat=.25)
    dark=rig.mat('moon_recess',rig.srgb('#283b56'),rough=.32,metal=.75)
    objs=[rig.box('silver_setting',w,h,.92,.14,silver,rig.at(y=-.49),segs=3,local=True)]
    objs.append(rig.box('recess',w-.12,h-.12,.2,.12,dark,rig.at(y=-.99),segs=2,local=True))
    if letter=='slate':
        slate=rig.noisy(rig.mat('blue_slate',rig.srgb('#303d59'),rough=.38,metal=.3,coat=.3),scale=8,amount=.28,bump=.16)
        objs.append(rig.box('slate',w-.29,h-.29,.25,.12,slate,rig.at(y=-1.13),segs=2,local=True))
        for sx in (-1,1):
            for sy in (-1,1): objs.append(rig.cyl(.065,.06,rig.at(sx*(w/2-.23),sy*(h/2-.23),-1.30),silver,rot=(math.pi/2,0,0),verts=12))
    else:
        colour=COLORS[letter][1] if letter in COLORS else '#d8d7f3'
        objs.append(stone('moon_'+letter,w-.24,h-.24,colour,damage,letter if letter in COLORS else 'v',width))
        # Four chunky mounting prongs; their silhouette stays within the same physical brick.
        for sx in (-1,1):
            for sy in (-1,1):
                o=rig.box('mounting_prong',.12,.28,.19,.04,silver,rig.at(sx*(w/2-.19),sy*(h/2-.28),-1.22),segs=2,local=True)
                objs.append(o)
        if letter=='cache':
            moon=rig.mat('pearl_moon',rig.srgb('#dce8ff'),rough=.12,metal=.3,coat=.8)
            bpy.ops.mesh.primitive_torus_add(major_radius=.23,minor_radius=.055,major_segments=32,minor_segments=8,location=rig.at(y=-1.43),rotation=(math.pi/2,0,0))
            bpy.context.object.data.materials.append(moon);objs.append(bpy.context.object)
    objs.append(rig.gloss_card('moon_card',w,h,-1.3,strength=9,sheen=.10))
    rig.only(objs)

def clean(path):
    im=Image.open(path).convert('RGBA'); a=np.asarray(im).copy(); a[a[:,:,3]==0,:3]=0
    im=Image.fromarray(a);im.save(path,optimize=True)
    assert not Image.open(path).info, 'stripped PNG metadata required'
    bounds=im.getchannel('A').getbbox(); assert bounds and all(v>0 for v in bounds[:2]) and bounds[2]<im.width and bounds[3]<im.height
    return im,bounds

def main():
    sc=rig.reset();sc.cycles.seed=79
    entries=[('b',2,0)] if '--seed' in sys.argv else [(c,w,d) for c in COLORS for w in (1,2) for d in (0,1)]+[('slate',w,0) for w in (1,2)]+[('cache',1,0)]
    sprites={}
    for letter,width,damage in entries:
        build(letter,width,damage)
        name=f'brick_{letter}_{width}_{damage}.png';path=OUT/name
        sw,sh=width*16+8,24
        rig.frame(sc,rig.P0[0]-sw/2,rig.P0[1]-sh/2,sw,sh,3,str(path),True,24)
        im,bounds=clean(path); kind=COLORS[letter][0] if letter in COLORS else 9 if letter=='slate' else 5
        sprites[f'{kind}_{width}_{damage}']={'path':path.relative_to(ROOT).as_posix(),'px':list(im.size),'ppu':3,'footprint':[width*16,16],'drawSize':[sw,sh],'margin':4,'kind':kind,'width':width,'damage':damage,'alphaBounds':list(bounds),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'encodedBytes':path.stat().st_size}
    manifest={'version':1,'source':'art/mooncoil/brick_assets.py','rig':'art/render_vault_assets.py','scope':'Blender Cycles CPU4,24samples; same Vault ortho rig/AgX look; dedicated faceted moonstone/silver setting. Exact existing collision footprints and four-unit transparent registration margin. Runtime admission is separate.','sprites':sprites}
    target=PROOF/'seed-manifest.json' if '--seed' in sys.argv else OUT/'bricks-manifest.json'
    target.write_text(json.dumps(manifest,indent=2)+'\n')
    sheet=Image.new('RGBA',(760,220 if '--seed' in sys.argv else 610),(13,20,36,255));draw=ImageDraw.Draw(sheet)
    for i,(key,item) in enumerate(sprites.items()):
        x=16+(i%4)*186;y=12+(i//4)*116;im=Image.open(ROOT/item['path']).convert('RGBA')
        sheet.alpha_composite(im,(x+20,y+10));draw.text((x,y+87),key+'  '+str(item['footprint']),fill='#d2dded')
        native=im.resize((round(im.width/3),round(im.height/3)),Image.Resampling.LANCZOS);sheet.alpha_composite(native,(x+136,y+30))
    sheet.convert('RGB').save(PROOF/('seed.png' if '--seed' in sys.argv else 'family.png'),optimize=True)
    print(json.dumps({'manifest':str(target),'parts':len(sprites),'bytes':sum(v['encodedBytes'] for v in sprites.values()),'decodedRGBA':sum(v['px'][0]*v['px'][1]*4 for v in sprites.values())}),flush=True)

if __name__=='__main__': main()
