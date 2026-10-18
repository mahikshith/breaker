# Vesper first source-model proof: retained quadruped, fitted feline eyes and carved source mouth.
# python3 art/vesper.py out/relay-proof/vesper Curious:1 Focus:1 Alarm:1 --face
import argparse,hashlib,json,math
from pathlib import Path
import bpy,bmesh,addon_utils
from mathutils import Vector,Matrix
from mathutils.bvhtree import BVHTree
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
ap=argparse.ArgumentParser();ap.add_argument('out');ap.add_argument('clips',nargs='*',default=['Curious:1'])
ap.add_argument('--source',default=str(ROOT/'out/cast/anatomy-audit/Cat.blend'))
ap.add_argument('--face',action='store_true');ap.add_argument('--clay',action='store_true');ap.add_argument('--skiff',action='store_true')
ap.add_argument('--view',type=float,default=55);ap.add_argument('--samples',type=int,default=24);ap.add_argument('--threads',type=int,default=2)
args=ap.parse_args();OUT=Path(args.out).resolve();OUT.mkdir(parents=True,exist_ok=True);SOURCE=Path(args.source).resolve()
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()=='e9836027dc8591fd2da03e6d8d6575972bc5c7aebaa17a0762b82f7bc37264de'
addon_utils.enable('cycles',default_set=True);bpy.ops.wm.open_mainfile(filepath=str(SOURCE),load_ui=False,use_scripts=False)
sc=bpy.context.scene;arm=next(o for o in sc.objects if o.type=='ARMATURE');body=bpy.data.objects['Cat']
for o in list(sc.objects):
    if o not in [arm,body]:bpy.data.objects.remove(o,do_unlink=True)
arm.data.pose_position='REST';arm.animation_data.use_nla=False;arm.rotation_mode='XYZ';arm.scale=(1,1,1)
FOOT_BONES=['Bone.016','Bone.019','Bone.010','Bone.013']
# Preserve the authored paw orientations before shortening the rest legs. The
# lower-leg IK solution changes with those proportions, so its old local paw
# rotations cannot simply be reused without turning the soles sideways.
source_foot_rotations={};arm.data.pose_position='POSE';source_walk=bpy.data.actions['Walking'];arm.animation_data.action=source_walk
if source_walk.slots:arm.animation_data.action_slot=source_walk.slots[0]
for frame in range(41):
    sc.frame_set(frame);bpy.context.view_layer.update();source_foot_rotations[frame]=[arm.pose.bones[name].matrix.to_quaternion()for name in FOOT_BONES]
arm.data.pose_position='REST'
for mod in list(body.modifiers):body.modifiers.remove(mod)
bpy.context.view_layer.update()
SHIFT=.512
def short_leg_z(z):return z*.68 if z<1.6 else z-SHIFT
for v in body.data.vertices:v.co.z=short_leg_z(v.co.z)
bpy.ops.object.select_all(action='DESELECT');arm.select_set(True);bpy.context.view_layer.objects.active=arm;bpy.ops.object.mode_set(mode='EDIT')
for b in arm.data.edit_bones:b.head.z=short_leg_z(b.head.z);b.tail.z=short_leg_z(b.tail.z)
arm.data.edit_bones['Bone.002'].tail.x-=.40
for point in ['head','tail']:getattr(arm.data.edit_bones['Bone.003'],point).x-=.40
bpy.ops.object.mode_set(mode='OBJECT');arm.select_set(False);body.select_set(True)

def lin(h):
    cs=[int(h[i:i+2],16)/255 for i in (1,3,5)];return tuple(c/12.92 if c<=.04045 else((c+.055)/1.055)**2.4 for c in cs)
def mat(name,h,rough=.4,coat=.3):
    m=bpy.data.materials.new(name);m.use_nodes=True;b=m.node_tree.nodes.get('Principled BSDF')
    b.inputs['Base Color'].default_value=(*lin(h),1);b.inputs['Roughness'].default_value=rough;b.inputs['Coat Weight'].default_value=coat;b.inputs['Coat Roughness'].default_value=.23;return m
PURPLE=mat('vesper_coat','#554681');PALE=mat('vesper_pale','#B3A9CB');PINK=mat('vesper_ear_nose','#B77DAB',.47,.2)
TIP=mat('vesper_tail_tip','#B29DE8');DARK=mat('vesper_cavity','#111526',.75,0);LID=mat('vesper_lid','#E4DCEB',.42,.3)
CLAY=mat('vesper_clay','#B5B9C8',.9,0)
SOURCE_MATERIALS=[p.material_index for p in body.data.polygons]
body.data.materials.clear()
for m in [PURPLE,PALE,PINK,DARK,TIP]:body.data.materials.append(m)
for p,index in zip(body.data.polygons,SOURCE_MATERIALS):p.material_index=index
DARK.node_tree.nodes['Principled BSDF'].inputs['Specular IOR Level'].default_value=0
HC=arm.data.bones['Bone.003'].head_local.copy();HEAD='Bone.003'
headgroup=body.vertex_groups[HEAD].index
for v in body.data.vertices:
    w=next((g.weight for g in v.groups if g.group==headgroup),0);p=v.co
    p.x-=.40*w
    p.x+= (p.x-HC.x)*.35*w;p.y*=1+1.20*w;p.z+=(p.z-HC.z)*.50*w
    if w>.75 and p.x>2.65:p.x=2.65+(p.x-2.65)*.60
    bw=sum(g.weight for g in v.groups if body.vertex_groups[g.group].name in ['Bone','Bone.001']);p.y*=1+.18*bw
    for foot in ['Bone.016','Bone.019','Bone.010','Bone.013']:
        idx=body.vertex_groups[foot].index;fw=next((g.weight for g in v.groups if g.group==idx),0)
        if fw>.01:
            c=arm.data.bones[foot].head_local;p.x=c.x+(p.x-c.x)*(1+.25*fw);p.y=c.y+(p.y-c.y)*(1+.70*fw)
    leg=[g for g in v.groups if body.vertex_groups[g.group].name in [f'Bone.{i:03}'for i in range(8,20)]]
    if leg:
        group=max(leg,key=lambda g:g.weight);b=arm.data.bones[body.vertex_groups[group.group].name];axis=b.tail_local-b.head_local
        t=max(0,min(1,(p-b.head_local).dot(axis)/axis.length_squared));center=b.head_local+axis*t
        p[:]=center+(p-center)*(1+.28*group.weight)
for p in body.data.polygons:
    p.use_smooth=True
    if sum(next((g.weight for g in body.data.vertices[i].groups if g.group==body.vertex_groups['Bone.007'].index),0)for i in p.vertices)/len(p.vertices)>.6:p.material_index=4
# Replace the blunt distal cap with a connected tapered steering leaf. It is
# bridged to the original tail tube and uses the fourth original tail joint.
bm=bmesh.new();bm.from_mesh(body.data);cut_z=3.44
bmesh.ops.bisect_plane(bm,geom=bm.verts[:]+bm.edges[:]+bm.faces[:],plane_co=(0,0,cut_z),plane_no=(0,0,1),clear_outer=True)
base={v for e in bm.edges if e.is_boundary and all(abs(v.co.z-cut_z)<.0001 for v in e.verts)for v in e.verts}
assert len(base)>=6;center=sum((v.co for v in base),Vector())/len(base);ring=sorted(base,key=lambda v:math.atan2(v.co.y-center.y,v.co.x-center.x));N=len(ring)
dl=bm.verts.layers.deform.active;tip_group=body.vertex_groups['Bone.007'].index
for z,rx,ry,dx in [(3.56,.065,.15,-.015),(3.77,.055,.25,-.025),(3.98,.025,.13,-.005)]:
    nxt=[]
    for k in range(N):
        angle=math.atan2(ring[k].co.y-center.y,ring[k].co.x-center.x)if z==3.56 else angles[k]
        nv=bm.verts.new((center.x+dx+rx*math.cos(angle),center.y+ry*math.sin(angle),z));nv[dl][tip_group]=1;nxt.append(nv)
    if z==3.56:angles=[math.atan2(v.co.y-center.y,v.co.x-center.x)for v in ring]
    for k in range(N):f=bm.faces.new((ring[k],ring[(k+1)%N],nxt[(k+1)%N],nxt[k]));f.material_index=4
    ring=nxt
tip=bm.verts.new((center.x+.02,center.y,4.10));tip[dl][tip_group]=1
for k in range(N):f=bm.faces.new((ring[k],ring[(k+1)%N],tip));f.material_index=4
bmesh.ops.recalc_face_normals(bm,faces=bm.faces[:]);bm.to_mesh(body.data);bm.free()
nose_raw={i for p in body.data.polygons if p.material_index==2 and abs(sum(body.data.vertices[i].co.y for i in p.vertices)/len(p.vertices))<.30 and sum(body.data.vertices[i].co.z for i in p.vertices)/len(p.vertices)<2.60 and sum(body.data.vertices[i].co.x for i in p.vertices)/len(p.vertices)>2.50 for i in p.vertices}
if nose_raw:
    nc=sum((body.data.vertices[i].co for i in nose_raw),Vector())/len(nose_raw)
    for i in nose_raw:
        p=body.data.vertices[i].co;p.y=nc.y+(p.y-nc.y)*.65;p.z=nc.z+(p.z-nc.z)*.65
# The source body, muzzle, ears and paws remain one connected mesh.
bpy.context.view_layer.objects.active=body;body.select_set(True)
sub=body.modifiers.new('source_surface','SUBSURF');sub.levels=sub.render_levels=2;bpy.ops.object.modifier_apply(modifier=sub.name)

def newobj(name,data):
    o=bpy.data.objects.new(name,data);sc.collection.objects.link(o);return o
def bone_parent(o,bone=HEAD):
    mw=o.matrix_world.copy();b=arm.data.bones[bone];rest=arm.matrix_world@b.matrix_local@Matrix.Translation((0,b.length,0))
    o.parent=arm;o.parent_type='BONE';o.parent_bone=bone;o.matrix_parent_inverse=Matrix.Identity(4);o.matrix_basis=rest.inverted()@mw
def uv_sphere(name,center,radii,material):
    bm=bmesh.new();geo=bmesh.ops.create_uvsphere(bm,u_segments=40,v_segments=28,radius=1)
    for v in geo['verts']:v.co=Vector(center)+Vector(v.co[i]*radii[i]for i in range(3))
    me=bpy.data.meshes.new(name);bm.to_mesh(me);bm.free();me.shade_smooth();me.materials.append(material);return newobj(name,me)
def cylinder_cut(name,cy,cz,ry,rz,xfront,xback):
    verts=[];faces=[];N=64
    for x in [xback,xfront]:
        for i in range(N):
            a=i/N*math.tau;verts.append((x,cy+math.cos(a)*ry,cz+math.sin(a)*rz))
    for i in range(N):faces.append((i,(i+1)%N,N+(i+1)%N,N+i))
    faces.extend([tuple(range(N-1,-1,-1)),tuple(N+i for i in range(N))])
    me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces)
    for m in body.data.materials:me.materials.append(m)
    for p in me.polygons:p.material_index=3
    o=newobj(name,me);bm=bmesh.new();bm.from_mesh(me);bmesh.ops.recalc_face_normals(bm,faces=bm.faces[:]);bm.to_mesh(me);bm.free()
    bpy.context.view_layer.objects.active=body;mod=body.modifiers.new(name,'BOOLEAN');mod.operation='DIFFERENCE';mod.solver='EXACT';mod.object=o;bpy.ops.object.modifier_apply(modifier=mod.name);bpy.data.objects.remove(o,do_unlink=True)

bpy.context.view_layer.update();bvh=BVHTree.FromObject(body,bpy.context.evaluated_depsgraph_get())
def surf_x(y,z):
    hit,_,_,_=bvh.ray_cast(Vector((10,y,z)),Vector((-1,0,0)),20)
    assert hit,(y,z);return hit.x
EYES=[];LIDS=[]
EY=.59;EZ=3.08-SHIFT;ER=(.25,.34,.37)
for side in [-1,1]:
    sx=surf_x(side*EY,EZ);center=(sx-.17,side*EY,EZ)
    cylinder_cut('eye_socket_'+str(side),side*EY,EZ,.315,.345,sx+.5,sx-.40)
    EYES.append((side,center))
nose_faces=[p for p in body.data.polygons if p.material_index==2 and abs(p.center.y)<.20 and p.center.x>2.2]
if nose_faces:
    nose_center=max(nose_faces,key=lambda p:p.center.x).center.copy()
else:
    front=max(v.co.x for v in body.data.vertices);nose_points=[v.co for v in body.data.vertices if v.co.x>front-.04];nose_center=sum(nose_points,Vector())/len(nose_points)
MZ=nose_center.z-.32;MX=surf_x(0,MZ)
print('Nose / mouth centers:',list(nose_center),MZ,flush=True)
cylinder_cut('source_mouth',0,MZ,.25,.08,MX+.4,MX-.52)
# Boolean-created facial vertices stay on the source head bone; no face cover is added.
for v in body.data.vertices:
    if v.co.x>1.90 and v.co.z>1.9-SHIFT:
        for g in body.vertex_groups:g.remove([v.index])
        body.vertex_groups[HEAD].add([v.index],1,'REPLACE')
for p in body.data.polygons:p.use_smooth=True

# Cream face is a colour region on the continuous source surface.
head_attr=body.data.attributes.new('head_weight','FLOAT','POINT')
for v in body.data.vertices:
    head_attr.data[v.index].value=next((g.weight for g in v.groups if g.group==headgroup),0)
for name,axes in [('face_rest_yz',(1,2)),('face_rest_x',(0,0))]:
    lay=body.data.uv_layers.new(name=name)
    for p in body.data.polygons:
        for j in p.loop_indices:
            co=body.data.vertices[body.data.loops[j].vertex_index].co;lay.data[j].uv=(co[axes[0]],co[axes[1]])
def node_math(nt,kind,a,b=0):
    q=nt.nodes.new('ShaderNodeMath');q.operation=kind
    for i,value in enumerate([a,b]):
        if isinstance(value,(int,float)):q.inputs[i].default_value=value
        else:nt.links.new(value,q.inputs[i])
    return q.outputs[0]
def clamp01(nt,value):return node_math(nt,'MINIMUM',1,node_math(nt,'MAXIMUM',0,value))
for material in [PURPLE,PALE]:
    nt=material.node_tree;n=nt.nodes;lk=nt.links;bs=n['Principled BSDF'];uv=n.new('ShaderNodeUVMap');uv.uv_map='face_rest_yz';sep=n.new('ShaderNodeSeparateXYZ');lk.new(uv.outputs[0],sep.inputs[0])
    xu=n.new('ShaderNodeUVMap');xu.uv_map='face_rest_x';xs=n.new('ShaderNodeSeparateXYZ');lk.new(xu.outputs[0],xs.inputs[0])
    ay=node_math(nt,'ABSOLUTE',sep.outputs[0]);z=sep.outputs[1];top=node_math(nt,'ADD',3.05-SHIFT,node_math(nt,'MULTIPLY',.9,clamp01(nt,node_math(nt,'DIVIDE',ay,.80))))
    cream=clamp01(nt,node_math(nt,'DIVIDE',node_math(nt,'SUBTRACT',top,z),.055));gate=clamp01(nt,node_math(nt,'DIVIDE',node_math(nt,'SUBTRACT',xs.outputs[0],2.00),.30))
    ear=node_math(nt,'MULTIPLY',clamp01(nt,node_math(nt,'DIVIDE',node_math(nt,'SUBTRACT',z,3.16-SHIFT),.32)),clamp01(nt,node_math(nt,'DIVIDE',node_math(nt,'SUBTRACT',ay,.60),.20)))
    attr=n.new('ShaderNodeAttribute');attr.attribute_name='head_weight';fac=node_math(nt,'MULTIPLY',attr.outputs['Fac'],node_math(nt,'MULTIPLY',gate,node_math(nt,'MULTIPLY',cream,node_math(nt,'SUBTRACT',1,ear))))
    mix=n.new('ShaderNodeMixRGB');mix.inputs[1].default_value=bs.inputs['Base Color'].default_value;mix.inputs[2].default_value=(*lin('#E4DCEB'),1);lk.new(fac,mix.inputs[0]);lk.new(mix.outputs[0],bs.inputs['Base Color'])

EYE_MAT=mat('vesper_gold_eyes','#EEE5D8',.22,.45);nt=EYE_MAT.node_tree;n=nt.nodes;lk=nt.links
uv=n.new('ShaderNodeUVMap');uv.uv_map='eye_yz';sep=n.new('ShaderNodeSeparateXYZ');lk.new(uv.outputs['UV'],sep.inputs[0])
def mathnode(kind,a,b):
    q=n.new('ShaderNodeMath');q.operation=kind
    for i,x in enumerate([a,b]):
        if isinstance(x,(float,int)):q.inputs[i].default_value=x
        else:lk.new(x,q.inputs[i])
    return q.outputs[0]
dx=mathnode('SUBTRACT',sep.outputs[0],.5);dz=mathnode('SUBTRACT',sep.outputs[1],.5)
dist=mathnode('SQRT',mathnode('ADD',mathnode('MULTIPLY',dx,dx),mathnode('MULTIPLY',dz,dz)),0)
ramp=n.new('ShaderNodeValToRGB');lk.new(dist,ramp.inputs[0]);cr=ramp.color_ramp;cr.interpolation='EASE';cr.elements[0].position=.0;cr.elements[0].color=(*lin('#ECBA72'),1);cr.elements[1].position=.46;cr.elements[1].color=(*lin('#F3EEE7'),1)
for p,c in [(.31,'#E8A54F'),(.39,'#99532D'),(.425,'#2C1E2C'),(.44,'#F3EEE7')]:cr.elements.new(p).color=(*lin(c),1)
PUPIL_WIDTH=n.new('ShaderNodeValue');PUPIL_WIDTH.outputs[0].default_value=.11
pd=mathnode('ADD',mathnode('POWER',mathnode('DIVIDE',dx,PUPIL_WIDTH.outputs[0]),2),mathnode('POWER',mathnode('DIVIDE',dz,.31),2))
inside=mathnode('LESS_THAN',pd,1);mix=n.new('ShaderNodeMixRGB');mix.inputs[2].default_value=(*lin('#0F1421'),1);lk.new(inside,mix.inputs[0]);lk.new(ramp.outputs[0],mix.inputs[1]);lk.new(mix.outputs[0],n['Principled BSDF'].inputs['Base Color'])

def cap(name,upper):
    bm=bmesh.new();bmesh.ops.create_uvsphere(bm,u_segments=40,v_segments=28,radius=1.02)
    bmesh.ops.bisect_plane(bm,geom=bm.verts[:]+bm.edges[:]+bm.faces[:],plane_co=(0,0,0),plane_no=(0,0,1),clear_inner=upper,clear_outer=not upper)
    me=bpy.data.meshes.new(name);bm.to_mesh(me);bm.free();me.shade_smooth();me.materials.append(LID);return newobj(name,me)
for side,center in EYES:
    eye=uv_sphere('eye_'+str(side),center,ER,EYE_MAT);lay=eye.data.uv_layers.new(name='eye_yz')
    for p in eye.data.polygons:
        for j in p.loop_indices:
            co=eye.data.vertices[eye.data.loops[j].vertex_index].co;lay.data[j].uv=((co.y-center[1])/(ER[1]*2)+.5,(co.z-EZ)/(ER[2]*2)+.5)
    bone_parent(eye)
    root=newobj('lid_mount_'+str(side),None);root.matrix_world=Matrix.Translation(Vector(center))@Matrix.Diagonal((*ER,1));bone_parent(root)
    up=cap('upper_lid_'+str(side),True);low=cap('lower_lid_'+str(side),False)
    for o in [up,low]:o.parent=root;o.matrix_parent_inverse=Matrix.Identity(4)
    LIDS.append((side,up,low))

BASE=[v.co.copy()for v in body.data.vertices]
NOSE_VERTS={i for p in body.data.polygons if p.material_index==2 for i in p.vertices}
STATES={'Curious':dict(lid=.14,low=.025,tilt=0,mouth=.22,corner=.035,pupil=.13,ears=0),
        'Focus':dict(lid=.46,low=.07,tilt=.16,mouth=.13,corner=-.012,pupil=.075,ears=.07),
        'Alarm':dict(lid=.035,low=.01,tilt=-.05,mouth=1.45,corner=0,pupil=.19,ears=-.23)}
def smooth(a,b,x):
    t=max(0,min(1,(x-a)/(b-a)));return t*t*(3-2*t)
def face(name):
    p=STATES[name];PUPIL_WIDTH.outputs[0].default_value=p['pupil']
    for v,base in zip(body.data.vertices,BASE):
        co=base.copy();w=smooth(MX-.50,MX-.12,co.x)*(1-smooth(.26,.40,abs(co.y)))*(1-smooth(.09,.19,abs(co.z-MZ)))
        if v.index in NOSE_VERTS:w=0
        target=MZ+(co.z-MZ)*p['mouth']+p['corner']*(abs(co.y)/.28)**2;co.z+=(target-co.z)*w
        ear=smooth(3.35-SHIFT,3.72-SHIFT,co.z)*smooth(.45,.70,abs(co.y))*smooth(1.75,2.10,co.x)
        co.x+=p['ears']*ear;co.z+=min(0,p['ears'])*.4*ear
        v.co=co
    body.data.update()
    for side,up,low in LIDS:
        up.rotation_euler=(side*p['tilt'],-math.asin(1-2*p['lid']),0);low.rotation_euler=(0,math.asin(1-2*p['low']),0)
armMod=body.modifiers.new('retained_quadruped_rig','ARMATURE');armMod.object=arm
arm.data.pose_position='POSE'
# Bake a sternward/sideways steering bias into a copy of the source tail-root
# motion. The other three articulated tail joints and the four-paw actions stay.
tail=arm.pose.bones['Bone.004'];restq=tail.bone.matrix_local.to_quaternion()
bias=restq.inverted()@(Matrix.Rotation(math.radians(45),4,'X')@Matrix.Rotation(math.radians(-36),4,'Y')).to_quaternion()@restq
for source_name in ['Idle','Walking']:
    source=bpy.data.actions[source_name];samples=[];arm.animation_data.action=source
    if source.slots:arm.animation_data.action_slot=source.slots[0]
    for frame in range(0,41,5):
        sc.frame_set(frame);bpy.context.view_layer.update();samples.append((frame,tail.matrix_basis.to_quaternion()@bias))
    action=source.copy();action.name='Vesper_'+source_name;action.use_fake_user=True
    for layer in action.layers:
        for strip in layer.strips:
            for slot in action.slots:
                bag=strip.channelbag(slot)
                if not bag:continue
                for fc in list(bag.fcurves):
                    if fc.data_path.startswith('pose.bones["Bone.004"].rotation'):bag.fcurves.remove(fc)
                for k in range(4):
                    fc=bag.fcurves.new('pose.bones["Bone.004"].rotation_quaternion',index=k)
                    for fr,q in samples:point=fc.keyframe_points.insert(fr,q[k]);point.interpolation='LINEAR'
tail.rotation_mode='QUATERNION';arm.scale=(.45,.60,.60)
if args.clay:
    for o in sc.objects:
        if o.type=='MESH':
            for i in range(len(o.data.materials)):o.data.materials[i]=CLAY
    for _,up,low in LIDS:up.hide_render=low.hide_render=True
    for o in sc.objects:
        if o.name.startswith('eye_'):o.hide_render=True

sc.render.engine='CYCLES';sc.cycles.samples=args.samples;sc.cycles.use_denoising=True;sc.cycles.device='CPU';sc.render.threads_mode='FIXED';sc.render.threads=args.threads
sc.render.film_transparent=True;sc.render.image_settings.file_format='PNG';sc.render.image_settings.color_mode='RGBA';sc.render.resolution_percentage=100
sc.view_settings.view_transform='AgX';sc.view_settings.look='AgX - Medium High Contrast'
def area(loc,en,size,color):
    bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.data.energy=en;o.data.size=size;o.data.color=color;o.rotation_euler=(Vector((0,0,1.5))-o.location).to_track_quat('-Z','Y').to_euler()
area((6,-5,8),1600,5,(1,.90,.80));area((6,6,2),900,5,(.55,.65,1));area((-4,1,6),1400,4,(.80,.85,1))
world=bpy.data.worlds.new('vesper_world');sc.world=world;world.node_tree.nodes['Background'].inputs['Color'].default_value=(.05,.04,.09,1)
act=bpy.data.actions['Vesper_Idle'];arm.animation_data.action=act
if act.slots:arm.animation_data.action_slot=act.slots[0]
sc.frame_set(0);face('Curious');bpy.context.view_layer.update()
dep=bpy.context.evaluated_depsgraph_get();eo=body.evaluated_get(dep);me=eo.to_mesh();pts=[eo.matrix_world@v.co for v in me.vertices];eo.to_mesh_clear()
lo=Vector(min(p[i]for p in pts)for i in range(3));hi=Vector(max(p[i]for p in pts)for i in range(3));UPM=48/(hi.z-lo.z)
PAW_VERTEX_IDS=[]
for name in FOOT_BONES:
    group=body.vertex_groups[name].index
    PAW_VERTEX_IDS.append([v.index for v in body.data.vertices if sum(g.weight for g in v.groups if g.group==group)>.6])
def paw_contacts():
    eo=body.evaluated_get(bpy.context.evaluated_depsgraph_get());me=eo.to_mesh();rows=[]
    for name,indices in zip(FOOT_BONES,PAW_VERTEX_IDS):
        pts=[eo.matrix_world@me.vertices[i].co for i in indices]
        assert pts;center=sum(pts,Vector())/len(pts)
        rows.append({'bone':name,'center':list(center),'floorOffsetWorldUnits':(min(p.z for p in pts)-lo.z)*UPM})
    eo.to_mesh_clear();return rows
PAW_REFERENCE=paw_contacts()
# The shorter rest legs need the source IK targets retargeted to their soles.
# Preserve each supplied foot's lift phase, correcting the contact geometry;
# this is a baked quadruped animation layer, not a body bob or runtime behavior.
IK_NAMES=['IKFrontRight','IKFrontLeft','IKBackLeft','IKBackRight']
walk=bpy.data.actions['Vesper_Walking'];arm.animation_data.action=walk
if walk.slots:arm.animation_data.action_slot=walk.slots[0]
target_heights={};source_positions={}
for frame in range(41):
    sc.frame_set(frame);bpy.context.view_layer.update();target_heights[frame]=[(arm.matrix_world@arm.pose.bones[name].head).z for name in IK_NAMES]
    source_positions[frame]=[arm.pose.bones[name].location.copy()for name in IK_NAMES]
# Unlink the old IK curves before the solver pass; otherwise dependency updates
# re-evaluate those curves and discard the corrected target positions.
for layer in walk.layers:
    for strip in layer.strips:
        for slot in walk.slots:
            bag=strip.channelbag(slot)
            if bag:
                for fc in list(bag.fcurves):
                    if any(fc.data_path==f'pose.bones["{name}"].location'for name in IK_NAMES)or any(fc.data_path.startswith(f'pose.bones["{name}"].rotation')for name in FOOT_BONES):bag.fcurves.remove(fc)
for name in FOOT_BONES:arm.pose.bones[name].rotation_mode='QUATERNION'
def orient_paws(frame):
    for name,rotation in zip(FOOT_BONES,source_foot_rotations[frame]):
        pb=arm.pose.bones[name];parent=pb.parent
        relative_rest=parent.bone.matrix_local.inverted()@pb.bone.matrix_local
        basis=relative_rest.to_3x3().inverted()@parent.matrix.to_3x3().inverted()@rotation.to_matrix()
        pb.rotation_quaternion=basis.to_quaternion()
    bpy.context.view_layer.update()
base_heights=[min(h[i]for h in target_heights.values())for i in range(4)];corrected=[];max_residual=0
for frame in range(41):
    sc.frame_set(frame)
    for name,position in zip(IK_NAMES,source_positions[frame]):arm.pose.bones[name].location=position*.68
    bpy.context.view_layer.update();goals=[lo.z+max(0,h-base)*.68 for h,base in zip(target_heights[frame],base_heights)]
    for repeat in range(120):
        orient_paws(frame)
        contacts=paw_contacts()
        if max(abs(lo.z+row['floorOffsetWorldUnits']/UPM-goal)*UPM for row,goal in zip(contacts,goals))<.08:break
        for name,row,goal in zip(IK_NAMES,contacts,goals):
            pb=arm.pose.bones[name];actual=lo.z+row['floorOffsetWorldUnits']/UPM
            matrix=arm.matrix_world.to_3x3()@pb.bone.matrix_local.to_3x3();pb.location+=matrix.inverted()@Vector((0,0,(goal-actual)*.35))
        bpy.context.view_layer.update()
    residual=max(abs(lo.z+row['floorOffsetWorldUnits']/UPM-goal)*UPM for row,goal in zip(paw_contacts(),goals));max_residual=max(max_residual,residual)
    if residual>.5:print('Paw target residual',frame,residual,[round(row['floorOffsetWorldUnits'],3)for row in paw_contacts()],[round((g-lo.z)*UPM,3)for g in goals],flush=True)
    corrected.append((frame,[arm.pose.bones[name].location.copy()for name in IK_NAMES],[arm.pose.bones[name].rotation_quaternion.copy()for name in FOOT_BONES]))
assert max_residual<.5,('retargeted paw residual',max_residual)
for layer in walk.layers:
    for strip in layer.strips:
        for slot in walk.slots:
            bag=strip.channelbag(slot)
            if not bag:continue
            for fc in list(bag.fcurves):
                if any(fc.data_path==f'pose.bones["{name}"].location'for name in IK_NAMES):bag.fcurves.remove(fc)
            for i,name in enumerate(IK_NAMES):
                for k in range(3):
                    fc=bag.fcurves.new(f'pose.bones["{name}"].location',index=k)
                    for frame,positions,rotations in corrected:point=fc.keyframe_points.insert(frame,positions[i][k]);point.interpolation='LINEAR'
            for i,name in enumerate(FOOT_BONES):
                for k in range(4):
                    fc=bag.fcurves.new(f'pose.bones["{name}"].rotation_quaternion',index=k)
                    for frame,positions,rotations in corrected:point=fc.keyframe_points.insert(frame,rotations[i][k]);point.interpolation='LINEAR'
arm.animation_data.action=act
if act.slots:arm.animation_data.action_slot=act.slots[0]
sc.frame_set(0);bpy.context.view_layer.update()
print('Retargeted walk paw residual:',max_residual,flush=True)
if args.skiff:
    hullmat=mat('skiff_fit_steel','#AFBBD1',.32,.35);hullmat.node_tree.nodes['Principled BSDF'].inputs['Metallic'].default_value=.24
    deckmat=mat('skiff_fit_deck','#535A75',.55,.15);rim=mat('skiff_fit_rim','#3F416A',.35,.3);padmat=mat('paw_pressure_pad','#4FBDD0',.3,.3)
    cx=(lo.x+hi.x)/2;floor=lo.z
    def ellipse_rings(name,rings,material,close_top=True):
        verts=[];faces=[];N=64
        for rx,ry,z in rings:
            for j in range(N):
                angle=j/N*math.tau;verts.append((cx+rx/UPM*math.cos(angle),ry/UPM*math.sin(angle),floor+z/UPM))
        for k in range(len(rings)-1):
            for j in range(N):faces.append((k*N+j,k*N+(j+1)%N,(k+1)*N+(j+1)%N,(k+1)*N+j))
        if close_top:faces.extend([tuple(range(N-1,-1,-1)),tuple((len(rings)-1)*N+j for j in range(N))])
        me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);me.materials.append(material)
        bm=bmesh.new();bm.from_mesh(me);bmesh.ops.recalc_face_normals(bm,faces=bm.faces[:]);bm.to_mesh(me);bm.free();me.shade_smooth();o=newobj(name,me)
        bevel=o.modifiers.new('soft_hull_edges','BEVEL');bevel.width=.5/UPM;bevel.segments=3
        return o
    ellipse_rings('skiff_fit_hull',[(42,18,-1),(42,18,-5),(32,12,-12)],hullmat)
    ellipse_rings('skiff_fit_open_deck',[(35,13,0),(35,13,-1)],deckmat)
    ellipse_rings('skiff_fit_low_rim',[(42,18,-.5),(35,13,.15)],rim,False)
    for i,row in enumerate(PAW_REFERENCE[:2]):
        c=Vector(row['center']);c.z=floor+.03/UPM
        pad=uv_sphere('front_paw_pressure_pad_'+str(i),c,(2.7/UPM,2.2/UPM,.16/UPM),padmat)
CELL=(112,96);PIVOT=(56,74);PX=3;theta=math.radians(args.view)
target=Vector(((lo.x+hi.x)/2,0,lo.z+(PIVOT[1]-CELL[1]/2)/UPM))
bpy.ops.object.camera_add(location=target+Vector((10*math.cos(theta),-10*math.sin(theta),2.13 if args.skiff else 0)));cam=bpy.context.object;sc.camera=cam;cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=CELL[0]/UPM
sc.render.resolution_x=CELL[0]*PX;sc.render.resolution_y=CELL[1]*PX
if args.face:
    target=Vector((0,0,(3.0-SHIFT)*.60));cam.location=(12,0,target.z);cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=1.8;sc.render.resolution_x=sc.render.resolution_y=512
report={'source':str(SOURCE),'sourceSHA256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'bodyJoints':len(arm.data.bones),'cell':CELL,'pivot':PIVOT,'px':PX,'referenceHeight':48,'skiffFitFixture':args.skiff,'skiffWorldDimensions':[84,36,12]if args.skiff else None,'referencePawContacts':PAW_REFERENCE,'walkRetargetMaxResidualWorldUnits':max_residual,'newFace':'carved source muzzle and eye sockets; fitted feline eye controls','renders':[]}
for spec in args.clips:
    bits=spec.split(':');name=bits[0];count=int(bits[1])if len(bits)>1 else 1;only=[int(x)for x in bits[2].split(',')]if len(bits)>2 else range(count)
    state=name if name in STATES else'Curious';action=bpy.data.actions['Vesper_Walking'if name=='Walk'else'Vesper_Idle'];arm.animation_data.action=action
    if action.slots:arm.animation_data.action_slot=action.slots[0]
    f0,f1=action.frame_range
    for i in only:
        fr=f0+(f1-f0)*i/count;sc.frame_set(int(fr),subframe=fr-int(fr));face(state);bpy.context.view_layer.update()
        p=OUT/f'{name}_{i:02}.png';sc.render.filepath=str(p);bpy.ops.render.render(write_still=True)
        with Image.open(p)as im:
            im.load();assert im.mode=='RGBA';bb=im.getchannel('A').getbbox();assert bb
            if not args.face:assert bb[0]>0 and bb[1]>0 and bb[2]<im.width and bb[3]<im.height,(p,bb)
            im.save(p)
        report['renders'].append({'file':p.name,'alphaBounds':bb,'pawContacts':paw_contacts()})
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'vesper-proof.blend'));(OUT/'proof.json').write_text(json.dumps(report,indent=2)+'\n')
print('Vesper first source proof:',OUT)
