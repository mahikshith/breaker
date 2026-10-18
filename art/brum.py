# Brum frost porter: retained Yeti anatomy and animation, deforming source mouth and fitted lids.
# python3 art/brum.py out/brum-proof/front Neutral:1 Welcome:1 Protective:1 --samples 32 --threads 2
import argparse, hashlib, json, math
from pathlib import Path
import bpy, bmesh, addon_utils
from mathutils import Vector, Matrix, Quaternion
from mathutils.bvhtree import BVHTree
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
ap=argparse.ArgumentParser()
ap.add_argument('out');ap.add_argument('clips',nargs='*',default=['Neutral:1','Welcome:1','Protective:1'])
ap.add_argument('--source',default=str(ROOT/'out/cast/source-audit/Yeti.gltf'))
ap.add_argument('--samples',type=int,default=32);ap.add_argument('--threads',type=int,default=2)
ap.add_argument('--yaw',type=float,default=0);ap.add_argument('--face',action='store_true');ap.add_argument('--skin',action='store_true')
args=ap.parse_args();OUT=Path(args.out).resolve();OUT.mkdir(parents=True,exist_ok=True)
SOURCE=Path(args.source).resolve()
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()=='b9c088fbcd357b82f3cb9a3f33a6b5c5603d3e55958a695e2bd9e419cc6527fb'
addon_utils.enable('cycles',default_set=True)
bpy.ops.wm.read_factory_settings(use_empty=True);sc=bpy.context.scene
bpy.ops.import_scene.gltf(filepath=str(SOURCE))
arm=next(o for o in sc.objects if o.type=='ARMATURE');body=bpy.data.objects['Yeti']
arm.rotation_mode='XYZ'
for o in list(sc.objects):
    if o.type=='MESH' and o!=body:bpy.data.objects.remove(o,do_unlink=True)
arm.data.pose_position='REST';bpy.context.view_layer.update()
assert len(arm.data.bones)==43
# Source clips hold every finger channel at an open-hand identity. Remove those
# held channels so the retained finger chains can form a proper porter fist.
for action in bpy.data.actions:
    for layer in action.layers:
        for strip in layer.strips:
            for slot in action.slots:
                bag=strip.channelbag(slot)
                if bag:
                    for fc in list(bag.fcurves):
                        if any(f'pose.bones["{name}'in fc.data_path for name in ['Index','Middle','Pinky','Thumb']):bag.fcurves.remove(fc)

def lin(h):
    cs=[int(h[i:i+2],16)/255 for i in (1,3,5)]
    return tuple(c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4 for c in cs)
def smooth(a,b,x):
    t=max(0,min(1,(x-a)/(b-a)));return t*t*(3-2*t)
def mat(name,color,rough=.43,coat=.3):
    m=bpy.data.materials.new(name);m.use_nodes=True;b=m.node_tree.nodes.get('Principled BSDF')
    b.inputs['Base Color'].default_value=(*lin(color),1);b.inputs['Roughness'].default_value=rough
    b.inputs['Coat Weight'].default_value=coat;b.inputs['Coat Roughness'].default_value=.22
    return m
IVORY=mat('brum_ivory','#EAE1CE',.4,.3);BLUE=mat('brum_blue','#4B8DAD',.45,.3)
SLATE=mat('brum_belly','#496170',.5,.18);BROW=mat('brum_brow','#28536C',.48,.2)
TEETH=mat('brum_teeth','#E7DFC9',.38,.25);TONGUE=mat('brum_tongue','#B6677C',.5,.1)
DARK=mat('brum_cavity','#102333',.8,0)
CLAY=mat('continuity_clay','#AEB9C6',1,0)
claybs=CLAY.node_tree.nodes.get('Principled BSDF');claybs.inputs['Emission Color'].default_value=(*lin('#AEB9C6'),1);claybs.inputs['Emission Strength'].default_value=.3

# Material separation preserves the original skin hull and all armature weights.
bpy.context.view_layer.objects.active=body;body.select_set(True)
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.separate(type='MATERIAL');bpy.ops.object.mode_set(mode='OBJECT')
parts={o.data.materials[0].name:o for o in sc.objects if o.type=='MESH'}
main=parts['Yeti_Main'];skin=parts['Yeti_Secondary'];white=parts['Eye_White'];black=parts['Eye_Black'];teeth=parts['Yeti_Teeth'];tongue=parts['Tongue']
def components(bm):
    bm.faces.ensure_lookup_table();seen=set();out=[]
    for f in bm.faces:
        if f.index in seen:continue
        todo=[f];comp=[];seen.add(f.index)
        while todo:
            g=todo.pop();comp.append(g)
            for e in g.edges:
                for h in e.link_faces:
                    if h.index not in seen:todo.append(h);seen.add(h.index)
        out.append(comp)
    return out
def boundary_loops(me):
    bm=bmesh.new();bm.from_mesh(me);bm.verts.ensure_lookup_table()
    boundary={v for e in bm.edges if e.is_boundary for v in e.verts};seen=set();out=[]
    for v in boundary:
        if v in seen:continue
        todo=[v];seen.add(v);loop=[]
        while todo:
            k=todo.pop();loop.append((k.index,k.co.copy()))
            for edge in k.link_edges:
                if not edge.is_boundary:continue
                other=edge.other_vert(k)
                if other not in seen:todo.append(other);seen.add(other)
        out.append(loop)
    bm.free();return out
def jaw_loop(me):
    return next(loop for loop in boundary_loops(me)if min(p.z for _,p in loop)>1.7 and min(p.z for _,p in loop)<1.9 and max(p.z for _,p in loop)>2.5)
bm=bmesh.new();bm.from_mesh(black.data);kill=[]
for comp in components(bm):
    if len(comp)==24:kill.extend(comp)
assert len(kill)==48
bmesh.ops.delete(bm,geom=kill,context='FACES');bm.to_mesh(black.data);bm.free()
bm=bmesh.new();bm.from_mesh(teeth.data);kill=[]
for comp in components(bm):
    vs={v for f in comp for v in f.verts};c=sum((v.co for v in vs),Vector())/len(vs)
    if (c.z>1.99 and abs(c.x)>.18) or (c.z<1.99 and abs(c.x)>.075):kill.extend(comp)
bmesh.ops.delete(bm,geom=kill,context='FACES');bm.to_mesh(teeth.data);bm.free()
for o,m in [(main,IVORY),(skin,BLUE),(white,None),(black,DARK),(teeth,TEETH),(tongue,TONGUE)]:
    if m:o.data.materials.clear();o.data.materials.append(m)
    for p in o.data.polygons:p.use_smooth=True
for v in skin.data.vertices:
    p=v.co
    if abs(p.x)>1.50:
        p.x=math.copysign(1.50+(abs(p.x)-1.50)*.92,p.x);p.y=.16+(p.y-.16)*1.42;p.z=1.82+(p.z-1.82)*1.42

# A wider source coat/sleeve, with the same shoulder-to-hand length and source weights.
for v in main.data.vertices:
    p=v.co
    weights={main.vertex_groups[g.group].name:g.weight for g in v.groups}
    aw=sum(w for name,w in weights.items()if 'Arm'in name)
    if aw>.01:
        p.y=.16+(p.y-.16)*(1+.75*aw);p.z=1.82+(p.z-1.82)*(1+.65*aw)
    elif weights.get('Head',0)<.1 and abs(p.x)<.65 and 1.3<p.z<2.2:
        p.x*=1.23;p.y=.12+(p.y-.12)*1.10
    if abs(p.x)<.62 and p.y<-.20:
        neck=max(0,1-abs(p.z-1.84)/.20)*max(0,1-(abs(p.x)/.62)**6)
        p.y+=.16*neck;p.z-=.05*neck*(.5+.5*math.cos(p.x/.62*math.pi*3))
    if p.z>2.56 and abs(p.x)<.2:
        p.x*=1.45;p.y=-.47+(p.y+.47)*1.3
skin.data.materials.append(SLATE)
for p in skin.data.polygons:
    co=sum((skin.data.vertices[i].co for i in p.vertices),Vector())/len(p.vertices)
    if 1.0<co.z<1.65 and abs(co.x)<.5:p.material_index=1

HC=Vector((0,-.30,2.23));HEAD_SCALE=Vector((1.12,1,1.08))
for o in [main,skin,white,black,teeth,tongue]:
    headgroup=o.vertex_groups.get('Head')
    for v in o.data.vertices:
        weight=next((g.weight for g in v.groups if headgroup and g.group==headgroup.index),0)
        v.co += Vector((v.co[i]-HC[i])*(HEAD_SCALE[i]-1)*weight for i in range(3))
    bm=bmesh.new();bm.from_mesh(o.data);bmesh.ops.remove_doubles(bm,verts=bm.verts[:],dist=.00001);bmesh.ops.recalc_face_normals(bm,faces=bm.faces[:]);bm.to_mesh(o.data);bm.free()
    if o in [main,skin]:
        mod=o.modifiers.new('broad_surface','SUBSURF');mod.levels=1;mod.render_levels=1
BASE={o.name:[v.co.copy()for v in o.data.vertices]for o in [skin,black,teeth,tongue]}
FACE_BORDER={i for i,_ in jaw_loop(skin.data)}
MZ=HC.z+(1.985-HC.z)*HEAD_SCALE.z

# Procedural iris uses a stable rest-space UV on the retained source eyeballs.
eye_mat=mat('brum_eyes','#F0F4EC',.2,.45);nt=eye_mat.node_tree;nodes=nt.nodes;links=nt.links
uv=nodes.new('ShaderNodeUVMap');uv.uv_map='brum_eye'
sep=nodes.new('ShaderNodeSeparateXYZ');links.new(uv.outputs['UV'],sep.inputs[0])
def op(kind,a,b):
    n=nodes.new('ShaderNodeMath');n.operation=kind
    for i,x in enumerate([a,b]):
        if isinstance(x,(int,float)):n.inputs[i].default_value=x
        else:links.new(x,n.inputs[i])
    return n.outputs[0]
dx=op('SUBTRACT',sep.outputs[0],.5);dz=op('SUBTRACT',sep.outputs[1],.46)
dist=op('SQRT',op('ADD',op('MULTIPLY',dx,dx),op('MULTIPLY',dz,dz)),0)
ramp=nodes.new('ShaderNodeValToRGB');links.new(dist,ramp.inputs['Fac'])
cr=ramp.color_ramp;cr.interpolation='EASE';cr.elements[0].position=.15;cr.elements[0].color=(*lin('#071720'),1)
cr.elements[1].position=.34;cr.elements[1].color=(*lin('#F0F4EC'),1)
for pos,c in [(.19,'#0A1E2C'),(.22,'#2F6B88'),(.30,'#2F6B88'),(.32,'#193C54')]:cr.elements.new(pos).color=(*lin(c),1)
links.new(ramp.outputs[0],nodes.get('Principled BSDF').inputs['Base Color'])
white.data.materials.clear();white.data.materials.append(eye_mat)
EYE_X=.3081654*1.12;EYE_Z=HC.z+(2.2776755-HC.z)*1.08;EYE_Y=-.390347
RX=.163953*1.12;RZ=.163922*1.08;RY=.16612
# The source whites have rectangular apertures where the original black inserts sat.
# Replace only those two eye surfaces, at the audited source centres, with closed
# ellipsoids; the source head, sockets and facial skin remain intact.
bm=bmesh.new()
for side in [-1,1]:
    geo=bmesh.ops.create_uvsphere(bm,u_segments=40,v_segments=24,radius=1)
    center=Vector((side*EYE_X,EYE_Y,EYE_Z))
    for v in geo['verts']:v.co=center+Vector((v.co.x*RX,v.co.y*RY,v.co.z*RZ))
bm.to_mesh(white.data);bm.free()
white.data.shade_smooth();white.vertex_groups.clear();hg=white.vertex_groups.new(name='Head');hg.add(list(range(len(white.data.vertices))),1,'REPLACE')
lay=white.data.uv_layers.new(name='brum_eye')
for p in white.data.polygons:
    for j in p.loop_indices:
        co=white.data.vertices[white.data.loops[j].vertex_index].co;sgn=1 if co.x>0 else-1
        lay.data[j].uv=((co.x-sgn*EYE_X)/(RX*2)+.5,(co.z-EYE_Z)/(RZ*2)+.5)

def newobj(name,data=None):
    o=bpy.data.objects.new(name,data);sc.collection.objects.link(o);return o
def bone_parent(o):
    attach_bone(o,'Head')
def attach_bone(o,name):
    mw=o.matrix_world.copy();bone=arm.data.bones[name]
    rest=arm.matrix_world@bone.matrix_local@Matrix.Translation((0,bone.length,0))
    o.parent=arm;o.parent_type='BONE';o.parent_bone=name;o.matrix_parent_inverse=Matrix.Identity(4);o.matrix_basis=rest.inverted()@mw
def fur_lock(name,centers,radii,bone):
    verts=[];faces=[];N=12
    for k,(p,ry,rz)in enumerate(zip(centers,*radii)):
        for j in range(N):
            a=j/N*math.tau;verts.append((p[0],p[1]+math.cos(a)*ry,p[2]+math.sin(a)*rz))
    for k in range(len(centers)-1):
        for j in range(N):faces.append((k*N+j,k*N+(j+1)%N,(k+1)*N+(j+1)%N,(k+1)*N+j))
    faces.extend([tuple(range(N-1,-1,-1)),tuple((len(centers)-1)*N+j for j in range(N))])
    me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);me.materials.append(IVORY);me.shade_smooth();o=newobj(name,me)
    mod=o.modifiers.new('sculpted_lock','SUBSURF');mod.levels=mod.render_levels=1;attach_bone(o,bone)
for side in [-1,1]:
    for i,x in enumerate([.52,.82,1.12]):
        centers=[(side*x,.14,1.84),(side*(x+.12),.015,1.84),(side*(x+.31),-.035,1.72),(side*(x+.43),-.045,1.65)]
        fur_lock(f'coat_arm_{side}_{i}',centers,([.13,.22,.16,.008],[.18,.24,.18,.008]),'UpperArm.L'if side>0 else'UpperArm.R')
    for i,z in enumerate([2.48,2.28,2.07]):
        # Roots lie inside the retained head coat; only the broad outside scallop is exposed.
        centers=[(side*.39,-.12,z),(side*.51,-.18,z-.035),(side*.63,-.16,z-.16),(side*.66,-.12,z-.28)]
        fur_lock(f'coat_mane_{side}_{i}',centers,([.10,.19,.16,.005],[.16,.20,.14,.005]),'Head')
# A single coat surface joins the source neck, mane, shoulder and sleeve fur.
# The original face is a separate retained skin hull and is never remeshed.
bpy.context.view_layer.update();eo=skin.evaluated_get(bpy.context.evaluated_depsgraph_get());me=eo.to_mesh()
jaw=sorted([p for _,p in jaw_loop(me)if p.z<2.10],key=lambda p:p.x);eo.to_mesh_clear()
def jaw_edge(x):
    if x<=jaw[0].x:return jaw[0].copy()
    for a,b in zip(jaw,jaw[1:]):
        if a.x<=x<=b.x:return a.lerp(b,(x-a.x)/(b.x-a.x))
    return jaw[-1].copy()
def beard_tip(x):
    anchors=[(0,1.42),(.15,1.56),(.30,1.49),(.45,1.65),(.56,1.90)];x=abs(x)
    for(a,za),(b,zb)in zip(anchors,anchors[1:]):
        if a<=x<=b:
            t=(1-math.cos((x-a)/(b-a)*math.pi))/2;return za*(1-t)+zb*t
    return anchors[-1][1]
verts=[];faces=[];NX=40;NV=12
for back in [False,True]:
    for i in range(NX+1):
        x=-.56+1.12*i/NX;edge=jaw_edge(x);top=edge.z+.01;bottom=beard_tip(x)
        for j in range(NV+1):
            t=j/NV;z=top*(1-t)+bottom*t
            y=.14 if back else(edge.y+.035)*(1-t)-.32*t-.14*math.sin(math.pi*t)*(.8+.2*math.cos(x*math.pi/.15))
            verts.append((x,y,z))
count=(NX+1)*(NV+1)
for back in [0,1]:
    off=back*count
    for i in range(NX):
        for j in range(NV):
            a=off+i*(NV+1)+j;b=a+NV+1
            faces.append((a,a+1,b+1,b)if back else(a,b,b+1,a+1))
boundary=[i*(NV+1)for i in range(NX+1)]+[NX*(NV+1)+j for j in range(1,NV+1)]+[i*(NV+1)+NV for i in range(NX-1,-1,-1)]+[j for j in range(NV-1,0,-1)]
for k,a in enumerate(boundary):
    b=boundary[(k+1)%len(boundary)];faces.append((a,a+count,b+count,b))
me=bpy.data.meshes.new('coat_beard');me.from_pydata(verts,[],faces);me.materials.append(IVORY)
bm=bmesh.new();bm.from_mesh(me);bmesh.ops.recalc_face_normals(bm,faces=bm.faces[:]);bm.to_mesh(me);bm.free()
o=newobj('coat_beard',me);bone_parent(o)
bpy.context.view_layer.update();coat=[main]+[o for o in sc.objects if o.type=='MESH'and o.name.startswith(('coat_arm_','coat_mane_','coat_beard'))]
bpy.ops.object.select_all(action='DESELECT')
for o in coat:
    if o!=main:
        bone=o.parent_bone;mw=o.matrix_world.copy();o.parent=None;o.matrix_world=mw
        group=o.vertex_groups.new(name=bone);group.add(list(range(len(o.data.vertices))),1,'REPLACE')
    o.select_set(True)
bpy.context.view_layer.objects.active=main;bpy.ops.object.join()
for mod in list(main.modifiers):main.modifiers.remove(mod)
proxy=main.copy();proxy.data=main.data.copy();proxy.name='coat_weight_reference';sc.collection.objects.link(proxy)
proxy.hide_render=True;proxy.hide_set(True)
shell=main.modifiers.new('closed_coat_shell','SOLIDIFY');shell.thickness=.055;shell.offset=-1;shell.use_rim=True
bpy.ops.object.modifier_apply(modifier=shell.name)
main.data.remesh_voxel_size=.022;main.data.remesh_voxel_adaptivity=0;bpy.ops.object.voxel_remesh()
for g in proxy.vertex_groups:
    if not main.vertex_groups.get(g.name):main.vertex_groups.new(name=g.name)
dt=main.modifiers.new('source_coat_weights','DATA_TRANSFER');dt.object=proxy;dt.use_vert_data=True;dt.data_types_verts={'VGROUP_WEIGHTS'};dt.vert_mapping='POLYINTERP_NEAREST';dt.mix_mode='REPLACE'
bpy.ops.object.modifier_apply(modifier=dt.name)
coat_weight_sums=[sum(g.weight for g in v.groups)for v in main.data.vertices]
assert min(coat_weight_sums)>.99 and max(coat_weight_sums)<1.01
smooth_coat=main.modifiers.new('joined_coat_smooth','SMOOTH');smooth_coat.factor=.8;smooth_coat.iterations=8
soft=main.modifiers.new('coat_finish','SUBSURF');soft.levels=soft.render_levels=1
rig=main.modifiers.new('retained_source_rig','ARMATURE');rig.object=arm
main.data.materials.clear();main.data.materials.append(IVORY)
for p in main.data.polygons:p.material_index=0;p.use_smooth=True
print('Joined coat vertices:',len(main.data.vertices),flush=True)
def cap(name,upper):
    bm=bmesh.new();bmesh.ops.create_uvsphere(bm,u_segments=40,v_segments=24,radius=1.04)
    bmesh.ops.bisect_plane(bm,geom=bm.verts[:]+bm.edges[:]+bm.faces[:],plane_co=(0,0,0),plane_no=(0,0,1),clear_inner=upper,clear_outer=not upper)
    me=bpy.data.meshes.new(name);bm.to_mesh(me);bm.free();me.shade_smooth();o=newobj(name,me);me.materials.append(BLUE);return o
LIDS=[];BROWS=[];CLOSED=[]
SKIN_BVH=BVHTree.FromObject(skin,bpy.context.evaluated_depsgraph_get())
def surface_y(x,z):
    hit,_,_,_=SKIN_BVH.ray_cast(Vector((x,-4,z)),Vector((0,1,0)),8)
    return hit.y-.007 if hit else -.54
print('Eye surface / retained sphere front:',surface_y(EYE_X,EYE_Z),EYE_Y-RY,flush=True)
for side in [-1,1]:
    root=newobj('eye_mount_'+str(side));root.matrix_world=Matrix.Translation(Vector((side*EYE_X,EYE_Y,EYE_Z)))@Matrix.Diagonal((RX,RY,RZ,1));bone_parent(root)
    up=cap('upper_lid_'+str(side),True);low=cap('lower_lid_'+str(side),False)
    for o in [up,low]:o.parent=root;o.matrix_parent_inverse=Matrix.Identity(4)
    LIDS.append((side,up,low))
    cu=bpy.data.curves.new('brow_'+str(side),'CURVE');cu.dimensions='3D';cu.resolution_u=12;cu.bevel_depth=.042;cu.bevel_resolution=3;cu.use_fill_caps=True
    sp=cu.splines.new('BEZIER');sp.bezier_points.add(4)
    ob=newobj('brow_'+str(side),cu);cu.materials.append(BROW);bone_parent(ob);BROWS.append((side,sp))
    cu=bpy.data.curves.new('closed_eye_'+str(side),'CURVE');cu.dimensions='3D';cu.resolution_u=12;cu.bevel_depth=.021;cu.bevel_resolution=3;cu.use_fill_caps=True
    sp=cu.splines.new('BEZIER');sp.bezier_points.add(4)
    for i,b in enumerate(sp.bezier_points):
        u=i/4;x=side*EYE_X+(u-.5)*.25;z=EYE_Z+.015+math.sin(u*math.pi)*.065
        b.co=(x,surface_y(x,z),z);b.handle_left_type=b.handle_right_type='AUTO';b.radius=.5+math.sin(u*math.pi)*.5
    ob=newobj('happy_eye_'+str(side),cu);cu.materials.append(BROW);bone_parent(ob);CLOSED.append(ob)

STATES={
 'Neutral':dict(mouth=.18,corner=.012,lid=.28,low=.03,brow=.0,tilt=0,teeth=False),
 'Welcome':dict(mouth=1.12,corner=.065,lid=.84,low=.45,brow=.025,tilt=-.01,teeth=True),
 'Protective':dict(mouth=1.25,corner=-.018,lid=.40,low=.06,brow=-.018,tilt=.12,teeth=True)}
def face(state):
    p=STATES[state]
    for o in [skin,black,teeth,tongue]:
        for v,base in zip(o.data.vertices,BASE[o.name]):
            co=base.copy()
            if o==skin:
                weight=(1-smooth(.31,.46,abs(co.x)))*smooth(1.80,1.86,co.z)*(1-smooth(2.07,2.18,co.z))*(1-smooth(-.38,-.28,co.y))
                if v.index in FACE_BORDER:weight=0
            else:weight=1
            z=MZ+(co.z-MZ)*p['mouth']+p['corner']*(abs(co.x)/.3)**2
            co.z+=(z-co.z)*weight
            if o==tongue:co.y+=.17;co.z+=.025
            if o==teeth and base.z<MZ:co.y+=.13
            v.co=co
        o.data.update()
    teeth.hide_render=not p['teeth'];tongue.hide_render=state!='Welcome'
    white.hide_render=state=='Welcome'
    for ob in CLOSED:ob.hide_render=state!='Welcome'
    for side,up,low in LIDS:
        up.hide_render=low.hide_render=state=='Welcome'
        up.rotation_euler=(-math.asin(max(-1,min(1,1-2*p['lid']))),-side*p['tilt']*2.5,0)
        low.rotation_euler=(math.asin(max(-1,min(1,1-2*p['low']))),0,0)
    for side,sp in BROWS:
        for i,b in enumerate(sp.bezier_points):
            u=i/4;x=side*(.17+u*.30);z=EYE_Z+.17+p['brow']+math.sin(u*math.pi)*.022+p['tilt']*(u-.5)
            b.co=(x,surface_y(x,z),z);b.radius=.65+math.sin(u*math.pi)*.35;b.handle_left_type=b.handle_right_type='AUTO'
    if args.skin:
        white.hide_render=teeth.hide_render=tongue.hide_render=black.hide_render=True
        for _,up,low in LIDS:up.hide_render=low.hide_render=True
        for ob in sc.objects:
            if ob.type=='CURVE':ob.hide_render=True

if args.skin:
    for o in sc.objects:
        if o.type=='MESH':
            for i in range(len(o.data.materials)):o.data.materials[i]=CLAY
arm.data.pose_position='POSE'
sc.render.engine='CYCLES';sc.cycles.samples=args.samples;sc.cycles.use_denoising=True;sc.cycles.device='CPU'
sc.render.threads_mode='FIXED';sc.render.threads=args.threads;sc.render.film_transparent=True
sc.render.image_settings.file_format='PNG';sc.render.image_settings.color_mode='RGBA';sc.render.resolution_percentage=100
sc.view_settings.view_transform='AgX';sc.view_settings.look='AgX - Medium High Contrast'
def area(loc,energy,size,color):
    bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.data.energy=energy;o.data.size=size;o.data.color=color;o.rotation_euler=(Vector((0,0,1.6))-o.location).to_track_quat('-Z','Y').to_euler()
area((-6,-5,9),1600,5,(1,.90,.80));area((7,-6,2),900,5,(.55,.65,1));area((2,6,6),1400,4,(.80,.85,1));area((0,-7,3),220,5,(1,.95,.95))
world=bpy.data.worlds.new('brum_world');sc.world=world;world.node_tree.nodes['Background'].inputs['Color'].default_value=(.05,.04,.09,1)
bpy.ops.object.camera_add(location=(0,-10,1.84),rotation=(math.pi/2,0,0));cam=bpy.context.object;sc.camera=cam;cam.data.type='ORTHO'
PX=3;CELL=(144,128);PIVOT=(72,116)
def pose_fingers(open_hand=False):
    for side in ['L','R']:
        sign=1 if side=='L'else-1
        for finger in ['Index','Middle','Pinky','Thumb']:
            for joint in range(1,3 if finger=='Thumb'else 4):
                pb=arm.pose.bones[f'{finger}{joint}.{side}'];pb.rotation_mode='QUATERNION'
                axis=pb.bone.matrix_local.to_3x3().inverted()@Vector((0,1,0))
                pb.rotation_quaternion=Quaternion()if open_hand else Quaternion(axis.normalized(),sign*math.radians(48 if joint==1 else 65))
arm.animation_data_create();ref_action=bpy.data.actions['Idle'];arm.animation_data.action=ref_action
if ref_action.slots:arm.animation_data.action_slot=ref_action.slots[0]
sc.frame_set(0);pose_fingers();face('Neutral');bpy.context.view_layer.update()
pts=[];dep=bpy.context.evaluated_depsgraph_get()
for o in sc.objects:
    if o.type!='MESH'or o.hide_render:continue
    eo=o.evaluated_get(dep);me=eo.to_mesh();pts.extend(eo.matrix_world@v.co for v in me.vertices);eo.to_mesh_clear()
Z0=min(p.z for p in pts);Z1=max(p.z for p in pts);UNITS_PER_MODEL=80/(Z1-Z0)
print('Reference feet/top:',Z0,Z1,'units/model:',UNITS_PER_MODEL,flush=True)
cam.location.z=Z0+(PIVOT[1]-CELL[1]/2)/UNITS_PER_MODEL
cam.data.ortho_scale=CELL[0]/UNITS_PER_MODEL;sc.render.resolution_x=CELL[0]*PX;sc.render.resolution_y=CELL[1]*PX
if args.face:sc.render.resolution_x=sc.render.resolution_y=512;cam.data.ortho_scale=1.48
report={'source':str(SOURCE),'sourceSHA256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'px':PX,'cell':CELL,'pivot':PIVOT,'nativeHeight':80,'coat':{'joinedVertices':len(main.data.vertices),'weightSumRange':[min(coat_weight_sums),max(coat_weight_sums)]},'clips':{},'renders':[]}
for spec in args.clips:
    bits=spec.split(':');name=bits[0];n=int(bits[1])if len(bits)>1 else 1
    only=[int(x)for x in bits[2].split(',')]if len(bits)>2 else range(n)
    state=name if name in STATES else 'Welcome'if name=='Wave'else'Protective'if name=='Punch'else'Neutral'
    action=bpy.data.actions['Idle'if name in STATES else name];arm.animation_data_create();arm.animation_data.action=action
    if action.slots:arm.animation_data.action_slot=action.slots[0]
    f0,f1=action.frame_range;arm.rotation_euler=(0,0,math.radians(args.yaw))
    report['clips'][name]={'source':action.name,'sourceRange':[f0,f1],'n':n,'state':state}
    for i in only:
        fr=f0+(f1-f0)*i/n;sc.frame_set(int(fr),subframe=fr-int(fr))
        pose_fingers(name=='Wave')
        face(state);bpy.context.view_layer.update()
        if args.face:
            hp=arm.matrix_world@arm.pose.bones['Head'].head;cam.location=(hp.x,-10,hp.z+.18)
        dest=OUT/f'{name}_{i:02d}.png';sc.render.filepath=str(dest);bpy.ops.render.render(write_still=True)
        with Image.open(dest)as im:
            im.load();assert im.mode=='RGBA';bounds=im.getchannel('A').getbbox();assert bounds
            if not args.face:assert bounds[0]>0 and bounds[1]>0 and bounds[2]<im.width and bounds[3]<im.height,(name,i,bounds)
            im.save(dest)
        report['renders'].append({'file':dest.name,'alphaBounds':bounds})
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'brum-proof.blend'))
(OUT/'proof.json').write_text(json.dumps(report,indent=2)+'\n')
print('Brum proof renders complete:',OUT)
