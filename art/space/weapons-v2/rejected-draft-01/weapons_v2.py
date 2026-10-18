"""Bounded transparent 3D weapon motion studies. Not runtime-admitted.

python art/space/weapons_v2.py proof | render [helix|reactor] | pack
Sources and saved hero scenes stay in art/space/weapons-v2; cells/atlases in design/phase1/weapon-vfx-v2.
"""
import bpy, math, random, json, sys, hashlib
from mathutils import Vector
from pathlib import Path
from PIL import Image, ImageFilter, ImageChops, ImageDraw

ROOT=Path(__file__).resolve().parents[2]
SOURCE=ROOT/'art/space/weapons-v2'
OUT=ROOT/'design/phase1/weapon-vfx-v2'
for p in (SOURCE,OUT,OUT/'proof',OUT/'frames'):p.mkdir(parents=True,exist_ok=True)
N=12; SIZE=256; TAU=math.tau

def mat(name,color,metal=0.,rough=.2,emission=0.):
 m=bpy.data.materials.new(name);m.use_nodes=True;b=m.node_tree.nodes.get('Principled BSDF')
 b.inputs['Base Color'].default_value=(*color,1);b.inputs['Metallic'].default_value=metal
 b.inputs['Roughness'].default_value=rough;b.inputs['Coat Weight'].default_value=.65
 b.inputs['Coat Roughness'].default_value=.07
 b.inputs['Emission Color'].default_value=(*color,1);b.inputs['Emission Strength'].default_value=emission
 return m

def materials():
 global M
 M={
  'chrome':mat('polished dark violet chrome',(.14,.105,.21),.96,.15),
  'edge':mat('silver reflected bevel',(.48,.52,.67),1,.13),
  'dark':mat('recessed graphite',(.018,.012,.036),.8,.24),
  'violet':mat('faceted amethyst plasma',(.25,.025,.8),.45,.15,.45),
  'pink':mat('dense magenta current',(.36,.004,.12),.22,.18,1.35),
  'cyan':mat('cyan edge current',(.012,.25,.42),.55,.12,.65),
  'hot':mat('white violet energy',(.5,.12,.8),.25,.16,1.65),
 }
 # Turbulence creates material depth on solid plasma rather than a uniform emissive line.
 nt=M['violet'].node_tree;b=nt.nodes.get('Principled BSDF');tex=nt.nodes.new('ShaderNodeTexNoise')
 tex.inputs['Scale'].default_value=7;tex.inputs['Detail'].default_value=3
 ramp=nt.nodes.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].color=(.025,.002,.085,1)
 ramp.color_ramp.elements[1].color=(.55,.045,.85,1)
 nt.links.new(tex.outputs['Fac'],ramp.inputs['Fac']);nt.links.new(ramp.outputs['Color'],b.inputs['Base Color'])

def meshmat(o,key):o.data.materials.append(M[key]);return o
def smooth(o):
 if o.type=='MESH':
  for p in o.data.polygons:p.use_smooth=True
 return o
def sphere(name,loc,scale,key,sub=2,faceted=False):
 bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=sub,radius=1,location=loc);o=bpy.context.object;o.name=name;o.scale=scale
 if not faceted:smooth(o)
 return meshmat(o,key)
def box(name,loc,scale,key,rot=(0,0,0),bevel=.05):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc,rotation=rot);o=bpy.context.object;o.name=name;o.scale=scale
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 mod=o.modifiers.new('machined rounded bevel','BEVEL');mod.width=bevel;mod.segments=3
 o.modifiers.new('weighted reflections','WEIGHTED_NORMAL');return meshmat(o,key)
def tube(name,pts,r,key):
 c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.resolution_u=1;c.bevel_depth=r;c.bevel_resolution=3
 s=c.splines.new('POLY');s.points.add(len(pts)-1)
 for p,co in zip(s.points,pts):p.co=(*co,1)
 o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);return meshmat(o,key)
def torus(name,loc,r,thick,key,rot=(math.pi/2,0,0),scale=None):
 bpy.ops.mesh.primitive_torus_add(major_segments=48,minor_segments=10,location=loc,rotation=rot,major_radius=r,minor_radius=thick)
 o=bpy.context.object;o.name=name
 if scale:o.scale=scale
 return meshmat(smooth(o),key)
def light(name,loc,power,size,color):
 bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.name=name;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.data.color=color
 o.rotation_euler=(Vector((0,0,0))-o.location).to_track_quat('-Z','Y').to_euler()

def reset(phase):
 bpy.ops.wm.read_factory_settings(use_empty=True);materials();sc=bpy.context.scene
 sc.render.engine='CYCLES';sc.cycles.device='CPU';sc.cycles.samples=16;sc.cycles.use_denoising=True
 sc.render.threads_mode='FIXED';sc.render.threads=4
 sc.render.resolution_x=SIZE;sc.render.resolution_y=SIZE;sc.render.resolution_percentage=100
 sc.render.film_transparent=True;sc.render.image_settings.file_format='PNG';sc.render.image_settings.color_mode='RGBA';sc.render.image_settings.color_depth='8'
 sc.view_settings.view_transform='AgX';sc.view_settings.look='AgX - Medium High Contrast'
 sc.world=bpy.data.worlds.new('violet reflection environment');sc.world.use_nodes=True
 sc.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.095,.07,.16,1)
 sc.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.5
 # Same soft key/cool fill/coloured bounce/reflection-card scheme as render_vault_assets.py, at local prop scale.
 light('large silver key',(-3,-4,5),650,4,(.83,.88,1))
 light('cyan edge strip',(4,-1,1),430,2,(.18,.75,1))
 light('magenta bounce',(-2,2,-2),370,3,(1,.12,.47))
 bpy.ops.mesh.primitive_plane_add(size=1,location=(0,-6,1),rotation=(math.pi/2,0,0))
 card=bpy.context.object;card.name='reflection-only softbox';card.scale=(4,5,1);card.visible_camera=False;card.visible_shadow=False
 cm=mat('softbox reflection',(.7,.83,1),0,.2,2.5);card.data.materials.append(cm)
 bpy.ops.object.camera_add(location=(0,-10,3.6));cam=bpy.context.object
 cam.rotation_euler=(Vector((0,0,0))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=5.6 if phase=='impact' else 4.5
 sc.camera=cam;return sc

def aperture(t,kind):
 # A three-dimensional segmented iris: substantial bevels, recessed seats and chromed jaws.
 spin=t*.55;radius=.77 if kind=='helix' else .9
 torus('aperture rear wall',(0,.18,0),radius,.15,'dark')
 torus('polished outer rim',(0,0,0),radius,.085,'edge')
 torus('emissive inner groove',(0,-.07,0),radius-.2,.032,'pink')
 for i in range(8):
  a=TAU*i/8+spin;x=radius*math.cos(a);z=radius*math.sin(a)
  box('bevelled magnetic jaw', (x,-.12,z),(.31,.3,.29),'chrome',(0,-a,0),.055)
  box('cyan reflection insert',(x*1.04,-.29,z*1.04),(.18,.018,.045),'cyan',(0,-a,0),.012)
  b=a+.23;rr=.5+.12*(1-t)
  box('moving iris blade',(rr*math.cos(b),-.05,rr*math.sin(b)),(.34,.12,.18),'edge',(0,-b+.6,0),.03)
 core=.19+.17*(t*t)
 sphere('suspended charging core',(0,-.06,0),(core,core,core),'violet',2,True)
 for j in range(3):
  r=.17+j*.12+.04*math.sin(t*TAU+j)
  pts=[(r*math.cos(a),-.14-.05*math.sin(a*3+t*5),r*math.sin(a)) for a in [TAU*k/64+t*(j+1) for k in range(65)]]
  tube('braided charge filament',pts,.018 if j else .026,'hot' if j==0 else 'pink')
 if kind=='reactor':
  for i in range(4):
   a=i*math.pi/2+t*1.1
   pts=[(.38*math.cos(a+u),-.4+.7*math.sin(u),.38*math.sin(a+u)) for u in [math.pi*k/24 for k in range(25)]]
   tube('suspended chrome cage rib',pts,.045,'chrome')

def helix(t,phase):
 if phase=='charge':aperture(t,'helix');return
 if phase=='flight':
  # Dense braided 3D plasma lance, with visible turns and a faceted leading payload.
  sphere('solid turbulent plasma mantle',(0,0,-.12),(.28,.26,1.12),'violet',3)
  sphere('leading amethyst payload',(0,-.06,-.73),(.32,.28,.45),'violet',2,True)
  sphere('small irregular white-hot nucleus',(.035,-.285,-.82),(.095,.07,.135),'hot',1,True)
  torus('rear chrome accelerator',(0,0,.78),.28,.055,'chrome',rot=(0,0,0))
  for j in range(3):
   pts=[]
   for k in range(97):
    q=k/96;z=-.92+1.9*q;a=q*TAU*(1.7+.12*j)+j*TAU/3+t*TAU+.15*math.sin(q*16+t*TAU+j)
    r=.15+.15*math.sin(math.pi*q)+.025*math.sin(q*23+j+t*TAU)
    pts.append((r*math.cos(a),r*math.sin(a),z))
   strand=tube('dense braided plasma strand',pts,.045 if j==0 else .06,'cyan' if j==0 else 'pink')
   for k,p in enumerate(strand.data.splines[0].points):p.radius=.7+.3*math.sin(k/96*math.pi)+.15*math.sin(k*.34+t*TAU+j)
  for j in range(5):
   a=j*2.4+t*TAU;z=-.65+j*.3
   sphere('irregular hot plasma knot',(.18*math.cos(a),-.14+.06*math.sin(a),z),(.07,.06,.13),'pink',1,True)
  for j in range(6):
   a=j*TAU/6+t*TAU
   sphere('accelerator shard',(.34*math.cos(a),.34*math.sin(a),.68),(.065,.07,.21),'edge',1,True)
  return
 impact(t,'helix')

def reactor(t,phase):
 if phase=='charge':aperture(t,'reactor');return
 if phase=='flight':
  sphere('faceted contained reactor',(0,0,0),(.48,.42,.52),'violet',2,True)
  sphere('reactor hot interior',(0,-.31,-.02),(.18,.12,.22),'hot',1,True)
  for j in range(6):
   a=j*TAU/6+t*TAU
   pts=[]
   for k in range(33):
    q=k/32;z=-.63+1.26*q;r=.54*math.sin(math.pi*q)+.12
    pts.append((r*math.cos(a),r*math.sin(a),z))
   tube('heavy magnetic cage rail',pts,.075,'chrome')
   tube('cyan cage seam',[(x*1.018,y*1.018,z) for x,y,z in pts],.012,'cyan')
   box('armoured cage shoulder',(.63*math.cos(a),.63*math.sin(a),0),(.15,.16,.3),'chrome',(0,a,.25),.035)
  for z in[-.54,.54]:torus('segmented containment collar',(0,0,z),.26,.07,'edge',rot=(0,0,0))
  for j in range(4):
   a=j*TAU/4-t*TAU
   sphere('suspended chrome stabiliser',(.67*math.cos(a),.67*math.sin(a),0),(.09,.09,.19),'chrome',1,True)
  # A tiny trailing faceted wake keeps the heavy body readable instead of a long flat streak.
  for j in range(5):
   a=j*2.4+t*TAU;z=.8+j*.13;r=.12+.018*j
   sphere('reactor ion fragment',(.1*math.sin(a),.1*math.cos(a),z),(r*.45,r*.45,r),'pink' if j%2 else 'cyan',1,True)
  return
 impact(t,'reactor')

def impact(t,kind):
 q=1-(1-t)**2;fade=max(.02,1-t);rng=random.Random(419 if kind=='helix' else 991)
 sphere('cracked energy pressure core',(0,0,0),(.6*fade+.04,.45*fade+.03,.55*fade+.04),'hot' if t<.25 else 'violet',2,True)
 # An actual tilted toroidal pressure shell has thickness, specular faces and foreshortening.
 for j in range(2):
  r=.3+q*(1.25+j*.28)
  torus('expanding pressure toroid',(0,.03*j,0),r,max(.012,.09*fade),'pink' if j==0 else 'cyan',rot=(math.pi/2+.35*j,.2,0),scale=(1,1,.8))
 for j in range(14 if kind=='reactor' else 10):
  a=TAU*j/(14 if kind=='reactor' else 10)+rng.uniform(-.12,.12);r=.2+q*rng.uniform(.8,1.65)
  v=(math.cos(a),rng.uniform(-.4,.4),math.sin(a));s=(.08+.05*rng.random())*fade
  o=sphere('pressure-driven cage fragment',(v[0]*r,v[1]*r,v[2]*r),(s,s*.8,s*2.6),'chrome' if j%3 else 'cyan',1,True)
  o.rotation_euler=(a+t*4,a*.7+t*3,t*2)
  if j%2==0:
   p1=(v[0]*(r-.16*fade),v[1]*r,v[2]*(r-.16*fade));p2=(v[0]*r,v[1]*r,v[2]*r)
   tube('short impact current',[p1,p2],.018*fade,'pink')

def render(family,phase,frame,proof=False):
 sc=reset(phase);t=frame/(N if phase=='flight' else N-1);(helix if family=='helix' else reactor)(t,phase)
 dest=OUT/('proof' if proof else f'frames/{family}-{phase}')
 dest.mkdir(parents=True,exist_ok=True);path=dest/f'{family}-{phase}-{frame:02}.png'
 sc.render.filepath=str(path);bpy.ops.render.render(write_still=True)
 # Preserve raw geometry/shading output and strip PNG metadata; a tight luminance bloom is a derivative.
 im=Image.open(path).convert('RGBA');im.save(path)
 if proof:bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE/f'{family}-{phase}-hero.blend'))
 return path

def manifest():
 clips={}
 for fam in['helix','reactor']:
  clips[fam]={}
  for phase in['charge','flight','impact']:
   clips[fam][phase]={'atlas':f'{fam}-{phase}.png','cell':[256,256],'grid':[4,3],'frames':12,'fps':24,'pivot':[128,128],'displayUnits':{'charge':56,'flight':88 if fam=='helix' else 80,'impact':96}[phase],'loop':phase=='flight','blend':'source-over','direction':'down at rotation 0'}
  clips[fam]['discharge']={'alias':'flight','indices':[0,1,2,3],'fps':24}
  clips[fam]['cool']={'alias':'charge','indices':[3,2,1,0],'fps':24}
 m={'status':'prototype, unapproved, no gameplay integration','source':'art/space/weapons_v2.py','sourceScenes':'art/space/weapons-v2','renderer':'Blender5.2.2 Cycles CPU,16samples,4threads,AgX Medium High Contrast,transparent RGBA','palette':['dark chrome','violet-magenta plasma','cyan reflection edges'],'families':clips,'collision':'visual studies only; no radius, damage, timing or rules admitted'}
 (OUT/'manifest.json').write_text(json.dumps(m,indent=2))

def pack():
 report={}
 for fam in['helix','reactor']:
  for phase in['charge','flight','impact']:
   atlas=Image.new('RGBA',(1024,768));bounds=[]
   for i in range(N):
    p=OUT/f'frames/{fam}-{phase}/{fam}-{phase}-{i:02}.png';im=Image.open(p).convert('RGBA');atlas.paste(im,(i%4*256,i//4*256));bounds.append(im.getchannel('A').getbbox())
   p=OUT/f'{fam}-{phase}.png';atlas.save(p)
   report[f'{fam}-{phase}']={'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size,'alphaBounds':bounds}
 (OUT/'render-report.json').write_text(json.dumps(report,indent=2))

if __name__=='__main__':
 manifest();cmd=sys.argv[1] if len(sys.argv)>1 else 'proof'
 if cmd=='proof':
  for fam in['helix','reactor']:
   for phase in['charge','flight']:print('PROOF',render(fam,phase,8,True),flush=True)
 elif cmd=='proof-impact':
  for fam in['helix','reactor']:print('PROOF',render(fam,'impact',4,True),flush=True)
 elif cmd=='render':
  fams=[sys.argv[2]] if len(sys.argv)>2 else ['helix','reactor']
  for fam in fams:
   for phase in['charge','flight','impact']:
    for i in range(N):print('FRAME',render(fam,phase,i),flush=True)
 elif cmd=='pack':pack()
