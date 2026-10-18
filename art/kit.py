# Prince Kit: open-helmet knight with a surface-fitted expression rig and real KayKit animation.
# Run: python3 art/kit.py <out_dir> <Idle:16> <Focus:12> ... [--face] [--yaw degrees] [--samples N] [--threads N]
import bpy, bmesh, sys, os, math, json, addon_utils
import numpy as np
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import hashlib
addon_utils.enable('cycles', default_set=True)
HERE = os.path.dirname(os.path.abspath(__file__))
argv = sys.argv[1:]

def build_deliverables():
    root=Path(HERE).parent; folder=root/'assets/kit'; proof=root/'out/kit-proof'
    meta=json.loads((folder/'meta.json').read_text()); clips=meta['anims']; report=[]; frames={}
    for name,clip in clips.items():
        paths=[folder/f'{name}_{i:02d}.png' for i in range(clip['frames'])]
        assert len(list(folder.glob(name+'_[0-9][0-9].png')))==len(paths), f'Wrong frame count: {name}'
        images=[]; hashes=[]; boxes=[]
        for path in paths:
            with Image.open(path) as im:
                assert im.mode=='RGBA' and im.size==(168,168), f'Wrong sprite format: {path}'
                assert not im.text, f'Unexpected PNG text metadata: {path}'
                bb=im.getchannel('A').point(lambda a:255 if a>8 else 0).getbbox()
                assert bb and min(bb[:2])>1 and max(bb[2:])<167, f'Clipped frame: {path} {bb}'
                images.append(im.copy());boxes.append(bb)
            hashes.append(hashlib.sha256(path.read_bytes()).hexdigest())
        assert len(set(hashes))>1, f'Static animation: {name}'
        frames[name]=images
        report.append({'id':'kit-'+name.lower(),'path_pattern':f'assets/kit/{name}_NN.png',
                       'frames':clip['frames'],'fps':14,'loop':clip['loop'],'unique_frames':len(set(hashes)),
                       'alpha_bounds':boxes,'sha256':hashes})
    assert sum(c['frames'] for c in clips.values())==100
    font_path='C:/Windows/Fonts/arial.ttf'
    font=ImageFont.truetype(font_path,24) if Path(font_path).exists() else ImageFont.load_default(size=24)
    small=ImageFont.truetype(font_path,18) if Path(font_path).exists() else ImageFont.load_default(size=18)
    def board(size,title):
        im=Image.new('RGB',size,'#141831');ImageDraw.Draw(im).text((24,16),title,font=font,fill='white');return im
    def paste(dst,source,xy,size):
        im=source.convert('RGBA').resize(size,Image.Resampling.LANCZOS);dst.paste(im,xy,im)
    sheet=board((1200,744),'Prince Kit | eight expressions — actual Blender renders')
    labels=['Determined / serve','Focused / aim','Grin / combo','Shock / life lost','Worried / danger','Cheer / win','Hurt / hit','Laugh / titan']
    for i,(name,label) in enumerate(zip(clips,labels)):
        x=(i%4)*300+6;y=64+(i//4)*336
        with Image.open(folder/'faces'/f'{name}_face_00.png') as im:paste(sheet,im,(x,y),(288,288))
        ImageDraw.Draw(sheet).text((x+8,y+292),label,font=small,fill='white')
    sheet.save(folder/'expressions.png')
    turn=board((1440,480),'Prince Kit | finished model turnaround')
    sources=[proof/'turn-front/Idle_00.png',proof/'turn-quarter/Idle_00.png',proof/'turn-side/Idle_00.png',proof/'turn-back/Idle_00.png']
    for i,(path,label) in enumerate(zip(sources,['Front','Three quarter','Side','Back'])):
        with Image.open(path) as im:paste(turn,im,(i*360+12,62),(336,336))
        ImageDraw.Draw(turn).text((i*360+24,416),label,font=font,fill='white')
    turn.save(folder/'turnaround.png')
    contact=board((1880,1296),'Prince Kit | all 100 normalized frames')
    for row,(name,images) in enumerate(frames.items()):
        ImageDraw.Draw(contact).text((12,100+row*148),name,font=small,fill='white')
        for i,im in enumerate(images):paste(contact,im,(140+i*108,64+row*148),(108,108))
    contact.save(folder/'contact-sheet.png')
    preview=[]
    for t in range(16):
        im=board((1120,680),'Prince Kit | real rig animations · 14 fps')
        for i,(name,images) in enumerate(frames.items()):
            frame=images[t%len(images) if clips[name]['loop'] else min(t,len(images)-1)]
            x=(i%4)*280+6;y=56+(i//4)*310
            paste(im,frame,(x,y),(268,268));ImageDraw.Draw(im).text((x+16,y+270),name,font=small,fill='white')
        preview.append(im)
    palette=preview[0].quantize(colors=256,method=Image.Quantize.MEDIANCUT)
    preview=[im.quantize(palette=palette,dither=Image.Dither.FLOYDSTEINBERG) for im in preview]
    preview[0].save(folder/'preview.gif',save_all=True,append_images=preview[1:],duration=[int(round((t+1)*100/14)-round(t*100/14))*10 for t in range(16)],loop=0,disposal=2)
    manifest={'schema_version':1,'selected_direction':'B / Knight 2 — Blue Helmet Guardian',
              'status':'rendered; awaiting owner playtest approval','created_at':'2026-10-18',
              'source':{'model':'assets/models/kk_Knight.glb','license':'CC0','renderer':'Blender 5.2.2 / Cycles',
                        'script':'art/kit.py','editable_scene':'out/kit-proof/kit.blend'},
              'technical':{'cell_px':168,'world_cell':56,'character_height':42,'feet':4,'alpha':True,'fps':14,
                           'samples':48,'supersampling':2,'downsample':'Lanczos','png_text_metadata':False},
              'verification':{'frame_count':100,'all_clips_animated':True,'all_transparent_edges':True,
                              'skin_front_and_quarter_reviewed':True,'motion_clearance_reviewed':True,
                              'native_scale_reviewed':True,'in_engine_reviewed':False,'owner_final_approval':False},
              'deliverables':['assets/kit/turnaround.png','assets/kit/expressions.png','assets/kit/contact-sheet.png','assets/kit/preview.gif'],
              'assets':report}
    (root/'design/phase1/kit-asset-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
    print('Validated 100 frames; built turnaround, eight expressions, contact sheet, animated preview and manifest.')

if '--deliverables' in argv:
    build_deliverables();sys.exit(0)
FACE = '--face' in argv; SKIN_PROOF = '--skin' in argv; PROOF = '--proof' in argv
argv = [a for a in argv if a not in ('--face','--skin','--proof')]
def option(flag, default, cast=int):
    if flag not in argv: return default
    i=argv.index(flag); value=cast(argv[i+1]); del argv[i:i+2]; return value
SAMPLES=option('--samples',48); THREADS=option('--threads',4); YAW=option('--yaw',0,float)
OUT=os.path.abspath(argv[0]) if argv else os.path.join(HERE,'..','assets','kit')
ANIMS=[a.split(':') for a in argv[1:]] or [['Idle','16']]
PX, BOX, HEIGHT = 3, 56, 42
SOURCE={'Idle':('Idle',0,1),'Focus':('Blocking',0.22,0.68),'Grin':('Interact',0.0,1.0),
        'Shock':('Hit_A',0.0,0.85),'Worried':('Idle',0,1),'Cheer':('Cheer',0,1),
        'Hurt':('Block_Hit',0,0.9),'Laugh':('Cheer',0,1)}
for spec in ANIMS:
    assert spec[0] in SOURCE, f'Unknown clip: {spec[0]}'
    assert 1 <= int(spec[1]) <= 120, 'Frame count must be 1..120'
bpy.ops.wm.read_factory_settings(use_empty=True)
sc=bpy.context.scene
bpy.ops.import_scene.gltf(filepath=os.path.join(HERE,'..','assets','models','kk_Knight.glb'))
arm=next(o for o in sc.objects if o.type=='ARMATURE')
for o in sc.objects:
    if o.type=='MESH' and o.name in ('1H_Sword_Offhand','1H_Sword','2H_Sword','Rectangle_Shield','Round_Shield','Spike_Shield'):
        o.hide_render=True; o.hide_viewport=True
head=bpy.data.objects['Knight_Head']
arm.data.pose_position='REST'; bpy.context.view_layer.update()
def srgb2lin(c):
    c=np.asarray(c,dtype=np.float64)
    return tuple(np.where(c<=0.04045,c/12.92,((c+0.055)/1.055)**2.4))
def hexcol(s): return srgb2lin(tuple(int(s[i:i+2],16)/255 for i in (1,3,5)))
def principled(m):
    return next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
for m in bpy.data.materials:
    b = principled(m); b.inputs['Coat Weight'].default_value = 0.35; b.inputs['Coat Roughness'].default_value = 0.25
    b.inputs['Roughness'].default_value = 0.45

def mat(name, color, rough, metal=0.0, coat=0.0, **kw):
    m = bpy.data.materials.new(name); b = principled(m)
    b.inputs['Base Color'].default_value = (*color, 1); b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal; b.inputs['Coat Weight'].default_value = coat
    b.inputs['Coat Roughness'].default_value = 0.1
    for k, v in kw.items():
        b.inputs[k].default_value = v if not isinstance(v, tuple) else (*v, 1)[:len(b.inputs[k].default_value)]
    return m


SKIN=hexcol('#E7AB8B')
M_SKIN=mat('kit_skin',SKIN,0.45,coat=0.35)
M_HAIR=mat('kit_hair',hexcol('#253349'),0.4,coat=0.25)
M_STEEL=mat('kit_silver',hexcol('#8D97B3'),0.24,0.72,0.4)
M_EDGE=mat('kit_silver_edge',hexcol('#BFC8DD'),0.19,0.8,0.3)
M_BLUE=mat('kit_cobalt',hexcol('#356AB3'),0.43,coat=0.18)
M_NAVY=mat('kit_navy',hexcol('#26324D'),0.5,coat=0.12)
M_CORAL=mat('kit_coral',hexcol('#E76F71'),0.48,coat=0.12)

def loose_parts(bm):
    bm.faces.ensure_lookup_table(); seen=set(); parts=[]
    for f in bm.faces:
        if f.index in seen: continue
        stack=[f]; comp=[]; seen.add(f.index)
        while stack:
            g=stack.pop(); comp.append(g)
            for e in g.edges:
                for h in e.link_faces:
                    if h.index not in seen: seen.add(h.index); stack.append(h)
        parts.append(comp)
    return parts

def part_swatch(bm,comp):
    uv=bm.loops.layers.uv.active; loops=[l[uv].uv for f in comp for l in f.loops]
    return int(sum(v[0] for v in loops)/len(loops)*8),int((1-sum(v[1] for v in loops)/len(loops))*4)

def bounds(comp):
    vs={v for f in comp for v in f.verts}
    return vs,np.min([v.co[:] for v in vs],axis=0),np.max([v.co[:] for v in vs],axis=0)

# The lower jaw is part of the face hull; retain and weld it instead of leaving a face opening.
bm=bmesh.new(); bm.from_mesh(head.data); kill=[]; removed={'eyes':0,'brows':0}
for comp in loose_parts(bm):
    sw=part_swatch(bm,comp); vs,lo,hi=bounds(comp)
    kind=None
    if sw==(2,0): kind='eyes'
    elif sw==(1,0) and lo[2]>1.67 and hi[2]<1.81: kind='brows'
    if kind: kill+=comp; removed[kind]+=1
    elif sw==(0,0) and lo[1]<-0.52 and lo[2]>1.43:
        base=Vector((0,-0.4,1.49))
        for v in vs: v.co=base+(v.co-base)*0.50+Vector((0,0.025,0))
    elif sw==(1,0):
        if hi[2]>2.2 or lo[2]>1.99: kill+=comp
        else:
            for v in vs: v.co.z=1.816+(v.co.z-1.836)*0.44
assert removed=={'eyes':2,'brows':8}, f'Reinspect changed Knight head topology: {removed}'
bmesh.ops.delete(bm,geom=kill,context='FACES')
bmesh.ops.remove_doubles(bm,verts=bm.verts[:],dist=0.0005)
bm.to_mesh(head.data); bm.free()

# Reprofile the source helmet as a continuous open shell; the original closed visor hides the brows.
helmet=bpy.data.objects['Knight_Helmet']
hv,hf=[],[]; NH, NV=64,20
for i in range(NH):
    ph=i/NH*math.tau; a=abs((ph+math.pi)%math.tau-math.pi)
    u=max(0,min(1,(a-math.radians(52))/math.radians(22)));u=u*u*(3-2*u)
    end=1.26+(2.25-1.26)*u
    for j in range(NV+1):
        th=end*j/NV
        hv.append((0.54*math.copysign(abs(math.sin(ph))**0.65,math.sin(ph))*math.sin(th),-0.57*math.copysign(abs(math.cos(ph))**0.65,math.cos(ph))*math.sin(th),1.70+0.55*math.cos(th)-1.215891))
for i in range(NH):
    for j in range(NV):
        a=i*(NV+1)+j;b=((i+1)%NH)*(NV+1)+j
        hf.append((a,b,b+1,a+1))
helmet.data=bpy.data.meshes.new('kit_open_helmet');helmet.data.from_pydata(hv,[],hf)
bm=bmesh.new();bm.from_mesh(helmet.data);bmesh.ops.remove_doubles(bm,verts=bm.verts[:],dist=0.0001)
bmesh.ops.recalc_face_normals(bm,faces=bm.faces[:]);bm.to_mesh(helmet.data);bm.free()
sol=helmet.modifiers.new('shell_thickness','SOLIDIFY');sol.thickness=0.035;sol.offset=-1
bev=helmet.modifiers.new('soft_helmet_edge','BEVEL');bev.width=0.012;bev.segments=3

for o in [o for o in sc.objects if o.type=='MESH' and not o.hide_render]:
    bm=bmesh.new();bm.from_mesh(o.data); mats=[M_SKIN,M_HAIR,M_STEEL,M_EDGE,M_BLUE,M_NAVY,M_CORAL]
    o.data.materials.clear()
    for m in mats:o.data.materials.append(m)
    for comp in [[f] for f in bm.faces]:
        sw=part_swatch(bm,comp) if bm.loops.layers.uv.active else None
        if o==head: material=M_HAIR if sw==(1,0) else M_SKIN
        elif o==helmet: material=M_STEEL
        elif o.name=='Knight_Cape': material=M_BLUE
        elif o.name=='Badge_Shield': material=M_BLUE if sw==(5,1) else M_STEEL
        elif sw==(3,0): material=M_STEEL
        elif sw==(7,0): material=M_EDGE
        elif sw in ((4,0),(7,1),(0,1)): material=M_BLUE
        else: material=M_NAVY
        for f in comp:f.material_index=mats.index(material)
    bm.to_mesh(o.data);bm.free()
    o.data.shade_smooth()

# Fit the broad shield to the hand in the actual idle pose, with its protective face toward the viewer.
act=bpy.data.actions['Idle'];arm.animation_data_create();arm.animation_data.action=act
if hasattr(arm.animation_data,'action_slot') and act.slots:arm.animation_data.action_slot=act.slots[0]
arm.data.pose_position='POSE';sc.frame_set(1);bpy.context.view_layer.update()
shield=bpy.data.objects['Badge_Shield']
shield.matrix_world=Matrix.Translation(Vector((0.60,-0.40,0.72)))@Matrix.Rotation(math.radians(-12),4,'Z')
# Preserve this fitted relation when the head/hand rig is evaluated again in rest space.
fit_matrix=shield.matrix_world.copy(); hand_matrix=arm.matrix_world@arm.pose.bones['hand.l'].matrix
shield_fit=hand_matrix.inverted()@fit_matrix
shield_offset=Vector((0.60,-0.40,0.72))-hand_matrix.translation
arm.data.pose_position='REST';bpy.context.view_layer.update()
shield.matrix_world=(arm.matrix_world@arm.pose.bones['hand.l'].matrix)@shield_fit

head.data.update()
BVH=BVHTree.FromObject(head,bpy.context.evaluated_depsgraph_get())
def surf(x,z):
    hit=BVH.ray_cast(Vector((x,-2,z)),Vector((0,1,0)))
    if hit[0] is None:return Vector((x,-0.35,z)),Vector((0,-1,0))
    n=hit[1] if hit[1].y<0 else -hit[1]
    return hit[0],n
def bone_parent(o, bone):
    mw = o.matrix_world.copy(); o.parent = arm; o.parent_type = 'BONE'; o.parent_bone = bone; o.matrix_world = mw

def new_obj(name, mesh=None):
    o = bpy.data.objects.new(name, mesh); sc.collection.objects.link(o); return o

def mesh_obj(name, verts, faces, material=None, uvs=None, smooth=True):
    m = bpy.data.meshes.new(name); m.from_pydata(verts, [], faces)
    if uvs is not None:
        lay = m.uv_layers.new(name='UVMap')
        for poly in m.polygons:
            for li in poly.loop_indices: lay.data[li].uv = uvs[m.loops[li].vertex_index]
    if smooth: m.shade_smooth()
    o = new_obj(name, m)
    if material: m.materials.append(material)
    return o

def set_mesh(o, verts, faces, uvs=None):
    m = o.data; m.clear_geometry(); m.from_pydata(verts, [], faces)
    if uvs is not None:
        lay = m.uv_layers.get('UVMap') or m.uv_layers.new(name='UVMap')
        for poly in m.polygons:
            for li in poly.loop_indices: lay.data[li].uv = uvs[m.loops[li].vertex_index]
    m.shade_smooth(); m.update()

# ---------------------------------------------------------------- node helpers
class NT:
    def __init__(self, m):
        m.use_nodes = True; self.t = m.node_tree; self.n = self.t.nodes; self.l = self.t.links
    def node(self, kind, **props):
        nd = self.n.new(kind)
        for k, v in props.items(): setattr(nd, k, v)
        return nd
    def link(self, a, b): self.l.new(a, b)
    def math(self, op, a, b=None, clamp=False):
        nd = self.node('ShaderNodeMath', operation=op, use_clamp=clamp)
        for i, x in enumerate((a, b)):
            if x is None: continue
            if isinstance(x, (int, float)): nd.inputs[i].default_value = x
            else: self.link(x, nd.inputs[i])
        return nd.outputs[0]
    def smooth(self, x, e0, e1):   # 0 below e0, 1 above e1
        nd = self.node('ShaderNodeMapRange', interpolation_type='SMOOTHSTEP', clamp=True)
        self.link(x, nd.inputs['Value']); nd.inputs['From Min'].default_value = e0; nd.inputs['From Max'].default_value = e1
        return nd.outputs[0]
    def mix(self, fac, a, b):
        nd = self.node('ShaderNodeMix', data_type='RGBA', clamp_factor=True)
        for sock, x in ((nd.inputs[0], fac), (nd.inputs[6], a), (nd.inputs[7], b)):
            if isinstance(x, tuple): sock.default_value = (*x, 1) if len(x) == 3 else x
            elif isinstance(x, (int, float)): sock.default_value = x
            else: self.link(x, sock)
        return nd.outputs[2]
    def obj_radius(self, ob, sx=1.0, sz=1.0):  # distance in the X/Z plane of an empty's space
        tc = self.node('ShaderNodeTexCoord', object=ob)
        sep = self.node('ShaderNodeSeparateXYZ'); self.link(tc.outputs['Object'], sep.inputs[0])
        x = self.math('MULTIPLY', sep.outputs[0], sx); z = self.math('MULTIPLY', sep.outputs[2], sz)
        d = self.math('SQRT', self.math('ADD', self.math('MULTIPLY', x, x), self.math('MULTIPLY', z, z)))
        return d, sep
    def value(self, v):
        nd = self.node('ShaderNodeValue'); nd.outputs[0].default_value = v; return nd

# ---------------------------------------------------------------- eyes
EYE_X, EYE_Z = 0.208, 1.57          # eye centres on the face (head rest coords, +x = her left = screen right)
EYE_R = (0.105, 0.075, 0.137)        # half width, depth, half height
IRIS_TOP, IRIS_BOT = hexcol('#263C66'), hexcol('#82A6D3')
PUPIL = srgb2lin((0.05, 0.03, 0.10)); SCLERA = srgb2lin((0.98, 0.97, 1.0)); LASH = srgb2lin((0.16, 0.06, 0.08))
LIDSKIN = mat('lid_skin', SKIN, 0.45, coat=0.35)

def eye_material(name, iris_e, pupil_e, glint1, glint2):
    m = bpy.data.materials.new(name); t = NT(m); b = principled(m)
    d_i, sep_i = t.obj_radius(iris_e)
    d_p, _ = t.obj_radius(pupil_e)
    d_g1, _ = t.obj_radius(glint1); d_g2, _ = t.obj_radius(glint2)
    iris_m = t.math('SUBTRACT', 1.0, t.smooth(d_i, 0.93, 1.0))
    pupil_m = t.math('SUBTRACT', 1.0, t.smooth(d_p, 0.88, 1.0))
    glint = t.math('MAXIMUM', t.math('SUBTRACT', 1.0, t.smooth(d_g1, 0.85, 1.0)), t.math('SUBTRACT', 1.0, t.smooth(d_g2, 0.8, 1.0)))
    grad = t.math('SUBTRACT', 1.0, t.smooth(sep_i.outputs[2], -0.85, 0.75))
    iris = t.mix(grad, IRIS_TOP, IRIS_BOT)
    iris = t.mix(t.math('MULTIPLY', t.smooth(d_i, 0.72, 0.97), 0.85), iris, srgb2lin((0.02, 0.16, 0.22)))  # limbal ring
    sclera_shade = t.smooth(sep_i.outputs[2], 0.2, 1.6)                                                 # lid shadow
    sclera = t.mix(t.math('MULTIPLY', sclera_shade, 0.35), SCLERA, srgb2lin((0.72, 0.70, 0.86)))
    col = t.mix(iris_m, sclera, iris)
    col = t.mix(pupil_m, col, PUPIL)
    col = t.mix(glint, col, (1, 1, 1))
    t.link(col, b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = 0.12; b.inputs['Coat Weight'].default_value = 1.0; b.inputs['Coat Roughness'].default_value = 0.03
    b.inputs['Emission Color'].default_value = (1, 1, 1, 1); t.link(t.math('MULTIPLY', glint, 6.0), b.inputs['Emission Strength'])
    return m

def lid_material(name):
    m = bpy.data.materials.new(name); t = NT(m); b = principled(m)
    tc = t.node('ShaderNodeTexCoord'); sep = t.node('ShaderNodeSeparateXYZ'); t.link(tc.outputs['Object'], sep.inputs[0])
    z = t.math('ABSOLUTE', sep.outputs[2])
    lash = t.math('SUBTRACT', 1.0, t.smooth(z, 0.24, 0.34))
    t.link(t.mix(lash, SKIN, LASH), b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = 0.45; b.inputs['Coat Weight'].default_value = 0.35
    return m

def sphere_mesh(name, r, zmin=-2.0, zmax=2.0, seg=40, ring=24):
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=ring, radius=r)
    if zmin > -r or zmax < r:
        if zmin > -r: bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=(0, 0, zmin), plane_no=(0, 0, 1), clear_inner=True)
        if zmax < r: bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=(0, 0, zmax), plane_no=(0, 0, 1), clear_outer=True)
    m = bpy.data.meshes.new(name); bm.to_mesh(m); bm.free(); m.shade_smooth(); return m

EYES = []
for side in (1, -1):
    s = 'L' if side > 0 else 'R'
    p, n = surf(side * EYE_X, EYE_Z)
    fwd = (Vector((0, -1, 0)) * 0.55 + n * 0.45).normalized(); fwd.z = 0; fwd.normalize()
    x_ax = Vector((-fwd.y, fwd.x, 0)).normalized()
    if x_ax.x < 0: x_ax = -x_ax
    ctr = p - fwd * (EYE_R[1] * 0.42)
    root = new_obj(f'eye_{s}'); root.empty_display_size = 0.1
    rot = Matrix((x_ax, -fwd, Vector((0, 0, 1)))).transposed()
    root.matrix_world = Matrix.Translation(ctr) @ rot.to_4x4() @ Matrix.Diagonal((*EYE_R, 1))
    def child(o, parent=root):
        o.parent = parent; o.matrix_parent_inverse = Matrix.Identity(4); return o
    iris_e = child(new_obj(f'iris_{s}')); iris_e.location = (0, -1, 0)
    pupil_e = child(new_obj(f'pupil_{s}'), iris_e)
    g1 = child(new_obj(f'glint1_{s}')); g1.location = (-0.30, -1, 0.36); g1.scale = (0.24, 1, 0.21)
    g2 = child(new_obj(f'glint2_{s}')); g2.location = (0.26, -1, -0.38); g2.scale = (0.11, 1, 0.10)
    ball = child(new_obj(f'eyeball_{s}', sphere_mesh(f'eyeball_{s}', 1.0)))
    ball.data.materials.append(eye_material(f'eye_{s}', iris_e, pupil_e, g1, g2))
    lid = child(new_obj(f'lid_{s}', sphere_mesh(f'lid_{s}', 1.09, zmin=0.0))); lid.data.materials.append(lid_material(f'lid_{s}'))
    lid.rotation_mode = 'XYZ'
    low = child(new_obj(f'lowlid_{s}', sphere_mesh(f'lowlid_{s}', 1.075, zmax=0.0))); low.data.materials.append(LIDSKIN)
    low.rotation_mode = 'XYZ'
    # outer lash flick: a small curved tapered wedge at the outer upper corner of the lid
    lv, lf = [], []
    for i in range(7):
        a = i / 6
        ang = math.radians(25 + 40 * a)
        r = 1.10 + 0.05 * a
        w = 0.16 * (1 - a) + 0.02
        cx, cz = math.cos(ang) * r, math.sin(ang) * r
        lv += [(cx, -0.25, cz), (cx + 0.18 * a + 0.05, -0.25, cz + w * 0.2 + 0.08 * a * a + w)]
    for i in range(6): lf.append((2 * i, 2 * i + 2, 2 * i + 3, 2 * i + 1))
    lmat = mat(f'lashmat_{s}', LASH, 0.5)
    flick = child(mesh_obj(f'lash_{s}', lv, lf, lmat), lid)
    sol = flick.modifiers.new('t', 'SOLIDIFY'); sol.thickness = 0.12; sol.offset = 0
    EYES.append(dict(side=side, root=root, iris=iris_e, pupil=pupil_e, g1=g1, g2=g2, ball=ball, lid=lid, low=low,
                     flick=flick, base=root.matrix_world.copy(), ctr=ctr, fwd=fwd))

# ---------------------------------------------------------------- decals: brows, mouth, blush, closed-eye strokes
BROW_C = hexcol('#253349'); LINE_C = srgb2lin((0.30, 0.06, 0.09))
def flat_mat(name, color, rough=0.5, emit=0.0):
    return mat(name, color, rough, coat=0.2, **({'Emission Color': color, 'Emission Strength': emit} if emit else {}))
BROW_M = flat_mat('brow', BROW_C, 0.6)
LINE_M = mat('mouth_line', LINE_C, 0.75, coat=0.0)
CLOSED_M = flat_mat('closed_eye', LASH, 0.4)

def mouth_material():
    m = bpy.data.materials.new('mouth_fill'); t = NT(m); b = principled(m)
    uv = t.node('ShaderNodeUVMap', uv_map='UVMap'); sep = t.node('ShaderNodeSeparateXYZ'); t.link(uv.outputs[0], sep.inputs[0])
    u, v = sep.outputs[0], sep.outputs[1]
    teeth_on = t.value(1.0); grim_on = t.value(0.0); tongue_on = t.value(1.0)
    # tongue: ellipse resting on the lower lip
    tu = t.math('DIVIDE', u, 0.62); tv = t.math('DIVIDE', t.math('SUBTRACT', v, -0.05), 0.52)
    tongue = t.math('MULTIPLY', t.math('SUBTRACT', 1.0, t.smooth(t.math('ADD', t.math('MULTIPLY', tu, tu), t.math('MULTIPLY', tv, tv)), 0.85, 1.0)), tongue_on.outputs[0])
    teeth = t.math('MULTIPLY', t.smooth(v, 0.70, 0.76), teeth_on.outputs[0])
    teeth = t.math('MULTIPLY', teeth, t.math('SUBTRACT', 1.0, t.smooth(t.math('ABSOLUTE', u), 0.78, 0.9)))
    # grimace: clenched teeth filling the mouth, a dark bite line and tooth gaps
    gin = t.math('MULTIPLY', t.smooth(v, 0.12, 0.17), t.math('SUBTRACT', 1.0, t.smooth(v, 0.83, 0.88)))
    gin = t.math('MULTIPLY', gin, t.math('SUBTRACT', 1.0, t.smooth(t.math('ABSOLUTE', u), 0.86, 0.93)))
    bite = t.math('SUBTRACT', 1.0, t.smooth(t.math('ABSOLUTE', t.math('SUBTRACT', v, 0.5)), 0.035, 0.06))
    gap = t.math('SUBTRACT', 1.0, t.smooth(t.math('ABSOLUTE', t.math('SUBTRACT', t.math('FRACT', t.math('MULTIPLY', t.math('ADD', u, 1.0), 2.5)), 0.5)), 0.42, 0.47))
    gap = t.math('SUBTRACT', 1.0, gap)
    grim = t.math('MULTIPLY', t.math('MULTIPLY', gin, t.math('MULTIPLY', t.math('SUBTRACT', 1.0, bite), t.math('SUBTRACT', 1.0, t.math('MULTIPLY', gap, 0.7)))), grim_on.outputs[0])
    col = t.mix(tongue, srgb2lin((0.33, 0.04, 0.10)), srgb2lin((0.98, 0.42, 0.52)))
    col = t.mix(teeth, col, (0.97, 0.95, 0.96))
    col = t.mix(grim, col, (0.97, 0.95, 0.96))
    t.link(col, b.inputs['Base Color']); b.inputs['Roughness'].default_value = 0.3; b.inputs['Coat Weight'].default_value = 0.6
    return m, teeth_on, grim_on, tongue_on
MOUTH_M, TEETH_ON, GRIM_ON, TONGUE_ON = mouth_material()

def blush_material():
    m = bpy.data.materials.new('blush'); t = NT(m); b = principled(m)
    uv = t.node('ShaderNodeUVMap', uv_map='UVMap'); sep = t.node('ShaderNodeSeparateXYZ'); t.link(uv.outputs[0], sep.inputs[0])
    r = t.math('SQRT', t.math('ADD', t.math('MULTIPLY', sep.outputs[0], sep.outputs[0]), t.math('MULTIPLY', sep.outputs[1], sep.outputs[1])))
    strength = t.value(0.6)
    a = t.math('MULTIPLY', t.math('SUBTRACT', 1.0, t.smooth(r, 0.0, 1.0)), strength.outputs[0])
    mixs = t.node('ShaderNodeMixShader'); tr = t.node('ShaderNodeBsdfTransparent')
    b.inputs['Base Color'].default_value = (*srgb2lin((1.0, 0.42, 0.55)), 1); b.inputs['Roughness'].default_value = 0.5
    out = next(n for n in t.n if n.type == 'OUTPUT_MATERIAL')
    t.link(a, mixs.inputs[0]); t.link(tr.outputs[0], mixs.inputs[1]); t.link(b.outputs[0], mixs.inputs[2]); t.link(mixs.outputs[0], out.inputs[0])
    return m, strength
BLUSH_M, BLUSH_K = blush_material()

def project(pts2d, off, flatten=False):
    out = []
    for (x, z) in pts2d:
        p, n = surf(x, z); out.append(p + n * off)
    if flatten:   # strokes that cross a hair edge: keep each column at its frontmost depth
        for i in range(0, len(out) - 1, 2):
            y = min(out[i].y, out[i + 1].y); out[i].y = out[i + 1].y = y
    return [tuple(v) for v in out]

def ribbon(center, widths, off=0.006, flatten=False):
    """a stroke along a 2D polyline: verts in pairs (left, right), quads between"""
    pts, uvs = [], []
    n = len(center)
    for i, ((x, z), w) in enumerate(zip(center, widths)):
        a = center[max(0, i - 1)]; b = center[min(n - 1, i + 1)]
        tx, tz = b[0] - a[0], b[1] - a[1]; L = math.hypot(tx, tz) or 1; nx, nz = -tz / L, tx / L
        pts += [(x + nx * w / 2, z + nz * w / 2), (x - nx * w / 2, z - nz * w / 2)]
        uvs += [(i / (n - 1) * 2 - 1, 1), (i / (n - 1) * 2 - 1, -1)]
    faces = [(2 * i, 2 * i + 1, 2 * i + 3, 2 * i + 2) for i in range(n - 1)]
    return project(pts, off, flatten), faces, uvs

def taper(n, w, head=0.25, tail=0.25, min_w=0.15):
    out = []
    for i in range(n):
        a = i / (n - 1)
        k = min(1.0, a / head if head else 1, (1 - a) / tail if tail else 1)
        out.append(w * (min_w + (1 - min_w) * math.sin(k * math.pi / 2)))
    return out

def filled(top, bot, xs, off=0.005):
    """a filled mouth between a top and bottom curve; uv = (x / half width, 0 at the bottom lip .. 1 at the top lip)"""
    pts, uvs, NV = [], [], 7
    w = max(abs(x) for x in xs) or 1
    for x in xs:
        zt, zb = top(x), bot(x)
        for j in range(NV):
            v = j / (NV - 1); pts.append((x, zb + (zt - zb) * v)); uvs.append((x / w, v))
    faces = [(i * NV + j, (i + 1) * NV + j, (i + 1) * NV + j + 1, i * NV + j + 1) for i in range(len(xs) - 1) for j in range(NV - 1)]
    return project(pts, off), faces, uvs

def decal_obj(name, material):
    o = mesh_obj(name, [(0, 0, 0)] * 3, [(0, 1, 2)], material, uvs=[(0, 0)] * 3)
    bone_parent(o, 'head'); return o
BROWS = {s: decal_obj(f'brow_{s}', BROW_M) for s in (1, -1)}
CLOSED = {s: decal_obj(f'closed_{s}', CLOSED_M) for s in (1, -1)}
MOUTH_LINE = decal_obj('mouth_line', LINE_M)
MOUTH_FILL = decal_obj('mouth_fill', MOUTH_M)
BLUSH = decal_obj('blush', BLUSH_M)
for o in BROWS.values(): o.visible_shadow = False

def ellipse_fill(cx, cz, rx, rz, off):
    pts, uvs, faces, N, R = [], [], [], 28, 4
    pts.append((cx, cz)); uvs.append((0, 0))
    for r in range(1, R + 1):
        for i in range(N):
            a = i / N * math.tau; pts.append((cx + math.cos(a) * rx * r / R, cz + math.sin(a) * rz * r / R))
            uvs.append((math.cos(a) * r / R, math.sin(a) * r / R))
    for i in range(N): faces.append((0, 1 + i, 1 + (i + 1) % N))
    for r in range(1, R):
        for i in range(N):
            a0 = 1 + (r - 1) * N; a1 = 1 + r * N
            faces.append((a0 + i, a1 + i, a1 + (i + 1) % N, a0 + (i + 1) % N))
    return project(pts, off), faces, uvs

bv, bf, bu = [], [], []
for s in (1, -1):
    v, f, u = ellipse_fill(s * 0.30, 1.445, 0.085, 0.048, 0.004)
    o = len(bv); bv += v; bf += [tuple(i + o for i in t) for t in f]; bu += u
set_mesh(BLUSH, bv, bf, bu)


# Give the source heraldic shield a clean enamel face and broad silver rim.
shield=bpy.data.objects['Badge_Shield']
profile=[(-0.43,0.49),(0.43,0.49),(0.43,0.12),(0.34,-0.27),(0,-0.60),(-0.34,-0.27),(-0.43,0.12)]
def shield_mesh(profile,front,back):
    n=len(profile);v=[(x,y,z) for y in (front,back) for x,z in profile]
    f=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    return v,f
v,f=shield_mesh(profile,-0.09,0.06)
shield.data=bpy.data.meshes.new('kit_heater');shield.data.from_pydata(v,[],f);shield.data.materials.append(M_EDGE)
bevel=shield.modifiers.new('soft_rim','BEVEL');bevel.width=0.025;bevel.segments=3
weighted=shield.modifiers.new('rim_normals','WEIGHTED_NORMAL')
panel=[(x*0.86,z*0.89+0.006) for x,z in profile]
v,f=shield_mesh(panel,-0.113,-0.087)
p=mesh_obj('shield_enamel',v,f,M_BLUE,smooth=False);p.parent=shield;p.matrix_parent_inverse=Matrix.Identity(4)
b=p.modifiers.new('panel_bevel','BEVEL');b.width=0.012;b.segments=3
bolt=[(0.08,0.34),(-0.20,-0.03),(-0.02,-0.03),(-0.12,-0.38),(0.20,0.06),(0.025,0.06)]
b=mesh_obj('shield_bolt',[(x,-0.126,z) for x,z in bolt],[tuple(range(len(bolt)))],M_EDGE,smooth=False)
b.parent=shield;b.matrix_parent_inverse=Matrix.Identity(4)
sol=b.modifiers.new('raised_crest','SOLIDIFY');sol.thickness=0.014
bev=b.modifiers.new('crest_bevel','BEVEL');bev.width=0.008;bev.segments=2

# Silver rim around the open face and a single broad helmet ridge.
cu=bpy.data.curves.new('helmet_trim','CURVE');cu.dimensions='3D';cu.bevel_depth=0.012;cu.bevel_resolution=3
sp=cu.splines.new('POLY');sp.points.add(NH)
for i,pt in enumerate(sp.points):
    x,y,z=hv[(i%NH)*(NV+1)+NV];pt.co=(x,y,z,1)
o=new_obj('helmet_rim',cu);cu.materials.append(M_EDGE);o.parent=helmet;o.matrix_parent_inverse=Matrix.Identity(4)
rv,rf=[],[]
for i in range(41):
    th=-2.25+(2.25+1.26)*i/40
    for x in (-0.025,0.025):rv.append((x,-0.585*math.sin(th),1.70+0.568*math.cos(th)-1.215891))
for i in range(40):rf.append((i*2,i*2+1,i*2+3,i*2+2))
o=mesh_obj('helmet_ridge',rv,rf,M_EDGE);o.parent=helmet;o.matrix_parent_inverse=Matrix.Identity(4)
sol=o.modifiers.new('ridge_thickness','SOLIDIFY');sol.thickness=0.012

# A simple split cobalt tabard leaves the original legs and their animation intact.
for s in (1,-1):
    x0,x1=(0.035,0.29) if s>0 else (-0.29,-0.035)
    v=[(x0,-0.34,0.60),(x1,-0.32,0.60),(x1*1.2,-0.30,0.24),(x0,-0.34,0.28)]
    o=mesh_obj('tabard_'+str(s),v,[(0,1,2,3)],M_BLUE,smooth=False)
    sol=o.modifiers.new('cloth_thickness','SOLIDIFY');sol.thickness=0.018
    bev=o.modifiers.new('soft_hem','BEVEL');bev.width=0.015;bev.segments=3
    bone_parent(o,'hips')

# Restrained coral tie, kept below the neck so it never hides the expression.
verts=[(-0.27,-0.32,1.10),(-0.18,-0.35,1.10),(-0.17,-0.35,0.83),(-0.24,-0.34,0.87)]
tie=mesh_obj('coral_tie',verts,[(0,1,2,3)],M_CORAL,smooth=False)
sol=tie.modifiers.new('cloth_thickness','SOLIDIFY');sol.thickness=0.015
bone_parent(tie,'chest')
for e in EYES:
    bone_parent(e['root'],'head');e['scale0']=e['root'].scale.copy()
arm.data.pose_position='POSE';bpy.context.view_layer.update()
# Use the same physical scale and feet placement for every clip and camera view.
sc.frame_set(1);bpy.context.view_layer.update()
Z0=0.0;Z1=2.268
k=(HEIGHT*0.1)/(Z1-Z0)
arm.scale=[s*k for s in arm.scale];arm.location.z-=Z0*k
arm.rotation_mode='XYZ'
bpy.context.view_layer.update()
NEUTRAL = dict(gx=0.0, gz=0.0, lid=0.16, low=0.0, iris=1.0, pupil=1.0, eye=1.0, glint=1.0, eyes='open',
               braise=0.0, btilt=0.0, mouth='smile', mw=1.0, mh=0.0, mc=0.5, wave=0.0, blush=0.55)

def apply_face(P):
    for e in EYES:
        s = e['side']
        e['iris'].location = (P['gx'] * 0.36, -1, P['gz'] * 0.30)
        r = 0.66 * P['iris']; e['iris'].scale = (r, 1, r * 1.08)
        pr = 0.46 * P['pupil'] / P['iris']; e['pupil'].scale = (pr, 1, pr * 1.1)
        g = P['glint']; e['g1'].scale = (0.24 * g, 1, 0.21 * g); e['g2'].scale = (0.11 * g, 1, 0.10 * g)
        # lids are hemispheres rotated about the eye's x axis; e = height of the lid edge at the front of the eye
        e['lid'].rotation_euler = (-math.asin(max(-1, min(1, 1 - 2 * P['lid']))), 0, 0)
        e['low'].rotation_euler = (-math.asin(max(-1, min(1, -1 + 2 * P['low']))), 0, 0)
        e['root'].scale = e['scale0'] * P['eye']
        show = P['eyes'] == 'open'
        for key in ('ball', 'lid', 'low', 'flick'): e[key].hide_render = not show
        # closed-eye strokes
        cx, cz = s * EYE_X, EYE_Z
        o = CLOSED[s]
        if P['eyes'] == 'happy':          # ^ arcs
            pts = [(cx + (i / 14 * 2 - 1) * 0.10, cz - 0.02 + 0.06 * (1 - (i / 14 * 2 - 1) ** 2)) for i in range(15)]
            v, f, u = ribbon(pts, taper(15, 0.034, 0.3, 0.3, 0.25), off=0.006); set_mesh(o, v, f, u); o.hide_render = False
        elif P['eyes'] == 'squeeze':      # > <  pointing at the nose
            pts = [(cx + s * (0.075 - 0.15 * (1 - abs(2 * (i / 14) - 1)) ** 1.3), cz + 0.075 * (1 - 2 * i / 14)) for i in range(15)]
            v, f, u = ribbon(pts, taper(15, 0.032, 0.3, 0.3, 0.3), off=0.006); set_mesh(o, v, f, u); o.hide_render = False
        else:
            o.hide_render = True
        # brows: inner end at x 0.10, outer at 0.30; tilt > 0 lifts the inner end (worry), < 0 drops it (anger)
        rz = P['braise'] * 0.035
        tilt = math.radians(P['btilt'])
        pts = []
        for i in range(13):
            t_ = i / 12
            x = 0.105 + t_ * 0.19; z = 1.765 + 0.018 * math.sin(t_ * math.pi) - 0.006 * t_
            dx, dz = x - 0.2, z - 1.765
            x2 = 0.2 + dx * math.cos(tilt) + dz * math.sin(tilt)
            z2 = 1.765 - dx * math.sin(tilt) + dz * math.cos(tilt) + rz
            pts.append((s * x2, z2))
        ws = [0.048 * (1 - 0.55 * (i / 12)) * min(1, (i + 1) / 2.5) for i in range(13)]
        v, f, u = ribbon(pts, ws, off=0.010, flatten=True); set_mesh(BROWS[s], v, f, u)
    # mouth
    MZ = 1.383; w = 0.075 * P['mw']; kind = P['mouth']
    xs = [w * -math.cos(i / 20 * math.pi) for i in range(21)]
    if kind in ('smile', 'frown', 'flat', 'wavy'):
        c = {'smile': 1.0, 'frown': -1.0, 'flat': 0.0, 'wavy': 0.0}[kind] * P['mc'] * 0.035
        pts = [(x, MZ + c * ((x / w) ** 2 - 0.4) + P['wave'] * 0.012 * math.sin((x / w) * math.pi * 1.5)) for x in xs]
        v, f, u = ribbon(pts, taper(21, 0.026, 0.25, 0.25, 0.3), off=0.006)
        set_mesh(MOUTH_LINE, v, f, u); MOUTH_LINE.hide_render = False; MOUTH_FILL.hide_render = True
    else:
        h = 0.02 + 0.10 * P['mh']; c = P['mc'] * 0.03
        TEETH_ON.outputs[0].default_value = 1.0 if kind == 'open' else 0.0
        GRIM_ON.outputs[0].default_value = 1.0 if kind == 'grimace' else 0.0
        TONGUE_ON.outputs[0].default_value = 0.0 if kind == 'grimace' else 1.0
        if kind == 'open':     # D-shaped laugh: flat top lifted at the corners, deep round bottom
            top = lambda x: MZ + 0.012 + c * (abs(x / w) ** 2.2) * 0.4
            bot = lambda x: MZ + 0.012 + c * 0.4 - (h + c * 0.4) * (1 - abs(x / w) ** 2.2) ** 0.75
        elif kind == 'O':      # oval scream
            top = lambda x: MZ - h * 0.35 + h * 0.6 * (1 - (x / w) ** 2) ** 0.5
            bot = lambda x: MZ - h * 0.35 - h * 0.6 * (1 - (x / w) ** 2) ** 0.5
        else:                  # grimace: wide clenched box, corners pulled down
            top = lambda x: MZ + h * 0.5 - c * (abs(x / w) ** 3) * 0.6 - 0.004 * (1 - (1 - abs(x / w) ** 6) ** 0.5) * 8
            bot = lambda x: MZ - h * 0.5 - c * (abs(x / w) ** 3) * 0.6 + 0.004 * (1 - (1 - abs(x / w) ** 6) ** 0.5) * 8
        v, f, u = filled(top, bot, xs)
        set_mesh(MOUTH_FILL, v, f, u); MOUTH_FILL.hide_render = False; MOUTH_LINE.hide_render = True
    BLUSH_K.outputs[0].default_value = P['blush']

def lerp_keys(keys, t):
    """keys: [(t, {param overrides})] sorted, each key inheriting the previous one; the loop wraps from the last key
    to the first. Numbers ease smoothly between keys, other values switch half way."""
    full, acc = [], dict(NEUTRAL)
    for kt, d in keys:
        acc = dict(acc); acc.update(d); full.append((kt, acc))
    idx = max([i for i, (kt, _) in enumerate(full) if kt <= t] or [len(full) - 1])
    t0, a = full[idx]; t1, b = full[(idx + 1) % len(full)]
    if t1 <= t0: t1 += 1.0
    tt = t if t >= t0 else t + 1.0
    u = (tt - t0) / (t1 - t0) if t1 > t0 else 0.0; u = u * u * (3 - 2 * u)
    return {k: (a[k] + (b[k] - a[k]) * u if isinstance(a[k], float) and isinstance(b[k], float) else (a[k] if u < 0.5 else b[k]))
            for k in a}

def F(**kw): return {k: (float(v) if isinstance(v, int) and not isinstance(v, bool) else v) for k, v in kw.items()}

EXPRESSIONS={
 'Idle':[(0,F(btilt=-23,braise=-0.35,lid=0.18,mouth='flat',mw=1.15,mc=0.2,gz=0.1)),(0.45,F(gx=0.12)),(0.78,F(lid=0.85)),(0.86,F(lid=0.18,gx=0))],
 'Focus':[(0,F(btilt=-30,braise=-0.45,lid=0.42,low=0.1,mouth='flat',mw=0.95,gx=0.1,gz=0.3)),(0.5,F(gx=-0.15,gz=0.15,lid=0.37))],
 'Grin':[(0,F(btilt=-4,braise=0.1,lid=0.16,low=0.13,mouth='open',mw=1.15,mh=0.24,mc=0.8)),(0.4,F(gx=0.2,mh=0.42)),(0.8,F(gx=0))],
 'Shock':[(0,F(btilt=18,braise=0.85,lid=0,iris=0.75,pupil=0.7,mouth='O',mw=1.0,mh=0.95)),(0.5,F(eye=1.05,mh=1.05,gz=0.15)),(0.95,F(eye=1.0,mh=0.75))],
 'Worried':[(0,F(btilt=25,braise=0.5,lid=0.04,low=0.03,mouth='O',mw=0.65,mh=0.30,gx=-0.3,gz=0.15,blush=0.35)),(0.4,F(gx=0.3,mh=0.38)),(0.75,F(gx=0.1,gz=0.3,mh=0.3))],
 'Cheer':[(0,F(eyes='happy',braise=0.6,btilt=-3,mouth='open',mw=1.45,mh=0.85,mc=0.8,blush=0.75)),(0.5,F(mh=1.0,mw=1.5)),(0.8,F(mh=0.8))],
 'Hurt':[(0,F(eyes='squeeze',btilt=-17,braise=-0.4,mouth='grimace',mw=1.35,mh=0.35,mc=0.3,blush=0.6)),(0.45,F(mw=1.2,mh=0.25)),(0.9,F(eyes='open',lid=0.65,mouth='frown',mw=1.1,mc=0.7))],
 'Laugh':[(0,F(eyes='open',lid=0.08,low=0.2,braise=0.85,btilt=4,mouth='open',mw=1.6,mh=1.1,mc=0.7,blush=0.9)),(0.3,F(eyes='open',lid=0.1,low=0.3,mh=1.0,gz=0.1)),(0.65,F(eyes='happy',mh=1.25))]
}

def aim_bone(name,d):
    pb=arm.pose.bones[name];m=pb.matrix.copy();h=m.translation.copy()
    q=m.col[1].xyz.normalized().rotation_difference(Vector(d).normalized())
    pb.matrix=Matrix.Translation(h)@q.to_matrix().to_4x4()@Matrix.Translation(-h)@m
    bpy.context.view_layer.update()

def pose_shield(name,phase):
    # Keep the protective prop below the face in guard poses and outboard during a cheer.
    if name in ('Focus','Hurt'):
        aim_bone('upperarm.l',(0.75,-0.2,-0.75))
        aim_bone('lowerarm.l',(0.1,-0.9,-0.4))
        aim_bone('hand.l',(-0.1,-0.8,-0.3))
    elif name in ('Cheer','Laugh'):
        pulse=math.sin(phase*math.tau)
        aim_bone('upperarm.l',(1,-0.1,0.15+0.1*pulse))
        aim_bone('lowerarm.l',(0.7,-0.3,0.35+0.1*pulse))
        aim_bone('hand.l',(0.6,-0.5,0.2))
    hand=arm.pose.bones['hand.l'].head
    position=arm.matrix_world@(hand+shield_offset)
    shield.matrix_world=Matrix.Translation(position)@Matrix.Rotation(math.radians(YAW-12),4,'Z')@Matrix.Diagonal((k,k,k,1))

def area(loc,energy,size,color):
    bpy.ops.object.light_add(type='AREA',location=loc)
    o=bpy.context.object;o.rotation_euler=(Vector((0,0,2.2))-o.location).to_track_quat('-Z','Y').to_euler()
    o.data.energy=energy;o.data.size=size;o.data.color=color
area((-8,-10,14),1600,7,(1,0.82,0.68))
area((7,-5,7),850,6,(0.55,0.68,1))
area((0,-9,3),550,7,(0.92,0.94,1))
area((2,5,8),1100,6,(0.62,0.73,1))
area((0,-3,-5),220,6,(1,0.5,0.65))
w=bpy.data.worlds.new('kit_world');sc.world=w
w.node_tree.nodes['Background'].inputs['Color'].default_value=(0.05,0.04,0.09,1)
w.node_tree.nodes['Background'].inputs['Strength'].default_value=0.35
bpy.ops.object.camera_add(location=(0,-40,BOX*0.1/2-0.4),rotation=(math.radians(90),0,0))
cam=bpy.context.object;sc.camera=cam;cam.data.type='ORTHO';cam.data.ortho_scale=BOX*0.1
sc.render.engine='CYCLES';sc.cycles.samples=SAMPLES;sc.cycles.use_denoising=True;sc.cycles.device='CPU'
sc.render.threads_mode='FIXED';sc.render.threads=THREADS
sc.render.resolution_x=sc.render.resolution_y=BOX*PX;sc.render.film_transparent=True
sc.render.image_settings.file_format='PNG';sc.render.image_settings.color_mode='RGBA'
sc.view_settings.view_transform='AgX';sc.view_settings.look='AgX - Medium High Contrast'
if FACE:
    sc.render.resolution_x=sc.render.resolution_y=288;cam.data.ortho_scale=2.4
if PROOF and not FACE:sc.render.resolution_x=sc.render.resolution_y=336
TARGET=sc.render.resolution_x
sc.render.resolution_x=sc.render.resolution_y=TARGET*2
os.makedirs(OUT,exist_ok=True)
proof_dir=os.path.join(HERE,'..','out','kit-proof');os.makedirs(proof_dir,exist_ok=True)
# Source scenes stay out of the shipping sprite directory.
for spec in ANIMS:
    name,n=spec[0],int(spec[1]);only=[int(x) for x in spec[2].split(',')] if len(spec)>2 else range(n)
    assert all(0<=i<n for i in only),'Frame index outside clip'
    src,r0,r1=SOURCE[name];act=bpy.data.actions[src]
    arm.animation_data_create();a0,a1=act.frame_range
    for i in only:
        for pb in arm.pose.bones:
            pb.location=(0,0,0);pb.rotation_quaternion=(1,0,0,0);pb.scale=(1,1,1)
        arm.animation_data.action=act
        if hasattr(arm.animation_data,'action_slot') and act.slots:arm.animation_data.action_slot=act.slots[0]
        ph=i/n
        if r0>0 or r1<1:ph=(i/max(1,n-1)) if name in ('Shock','Hurt') else 1-abs(1-2*ph)
        fr=a0+(a1-a0)*(r0+(r1-r0)*ph);sc.frame_set(int(fr),subframe=fr-int(fr))
        arm.rotation_euler=(0,0,math.radians(YAW))
        bpy.context.view_layer.update();arm.animation_data.action=None
        pose_shield(name,i/n)
        apply_face(lerp_keys(EXPRESSIONS[name],i/n))
        for e in EYES:
            e['flick'].hide_render=True
            if SKIN_PROOF:
                for key in ('ball','lid','low'):e[key].hide_render=True
        if SKIN_PROOF:
            for o in list(BROWS.values())+list(CLOSED.values())+[MOUTH_LINE,MOUTH_FILL,BLUSH]:o.hide_render=True
        bpy.context.view_layer.update()
        if FACE:
            hp=arm.matrix_world@arm.pose.bones['head'].head
            cam.location=(hp.x,-40,hp.z+0.66)
            path=os.path.join(OUT,f'{name}_face_{i:02d}.png')
        else:path=os.path.join(OUT,f'{name}_{i:02d}.png')
        if not FACE and not PROOF and not YAW and name=='Idle' and i==0:bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(os.path.join(proof_dir,'kit.blend')))
        sc.render.filepath=path;bpy.ops.render.render(write_still=True)
        with Image.open(path) as im:
            out=im.resize((TARGET,TARGET),Image.Resampling.LANCZOS)
            assert out.mode=='RGBA' and out.size==(TARGET,TARGET), 'Invalid sprite format'
            bb=out.getchannel('A').point(lambda a:255 if a>8 else 0).getbbox()
            assert bb and (FACE or (bb[0]>1 and bb[1]>1 and bb[2]<TARGET-1 and bb[3]<TARGET-1)), f'Clipped sprite: {name} {i} {bb}'
            out.save(path)
    print('rendered',name,len(only),flush=True)
