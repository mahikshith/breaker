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
  'armour':mat('blackened machined titanium',(.045,.05,.075),.94,.18),
  'ceramic':mat('glossy dark ceramic',(.032,.018,.058),.48,.19),
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
def shellplate(name,angle,width,levels,key):
 # Separate thick armour segments keep real open channels; bevels catch the same softboxes as the cannons.
 verts=[];cols=5
 for z,r in levels:
  for k in range(cols):
   a=angle+(k/(cols-1)-.5)*width;verts.append((r*math.cos(a),r*math.sin(a),z))
 faces=[]
 for j in range(len(levels)-1):
  for k in range(cols-1):
   a=j*cols+k;faces.append((a,a+1,a+cols+1,a+cols))
 me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);me.update();o=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(o);meshmat(o,key)
 mod=o.modifiers.new('solid armour thickness','SOLIDIFY');mod.thickness=.075
 mod=o.modifiers.new('milled edge bevel','BEVEL');mod.width=.035;mod.segments=3
 o.modifiers.new('broad machined normals','WEIGHTED_NORMAL');return o
def fin(name,a,z):
 # A welded trapezoid fin, not an unconnected jewel floating beside the body.
 pts=[(.36,-.05,z+.33),(.89,-.05,z+.14),(.83,-.05,z-.32),(.44,-.05,z-.23),(.36,.05,z+.33),(.89,.05,z+.14),(.83,.05,z-.32),(.44,.05,z-.23)]
 verts=[(x*math.cos(a)-y*math.sin(a),x*math.sin(a)+y*math.cos(a),zz) for x,y,zz in pts]
 me=bpy.data.meshes.new(name);me.from_pydata(verts,[],[(0,1,2,3),(4,7,6,5),(0,4,5,1),(1,5,6,2),(2,6,7,3),(3,7,4,0)]);me.update()
 o=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(o);meshmat(o,'armour');mod=o.modifiers.new('fin machined bevel','BEVEL');mod.width=.035;mod.segments=3;o.modifiers.new('weighted fin highlights','WEIGHTED_NORMAL')
 tube('fin edge reflection',[(.52*math.cos(a),.52*math.sin(a)-.055,z+.25),(.83*math.cos(a),.83*math.sin(a)-.055,z+.13)],.018,'edge')
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
 cam.rotation_euler=(Vector((0,0,0))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=4.5 if phase=='impact' else 3.7 if phase=='flight' else 4.5
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
  sphere('dense interior plasma',(0,0,-.12),(.38,.38,.95),'violet',3)
  levels=[(.8,.35),(.58,.52),(-.25,.55),(-.7,.34),(-1.04,.055)]
  for j in range(6):
   a=j*TAU/6
   shellplate('segmented armoured lance',a,.88,levels,'armour' if j%2 else 'ceramic')
   # Etched dark tracks and thin reflected seams sit on armour rather than wrapping around the body.
   pts=[(r*math.cos(a),r*math.sin(a),z) for z,r in[(.48,.535),(.1,.565),(-.35,.51)]]
   tube('recessed etched track',pts,.021,'dark');tube('embedded cool seam',[(x*1.005,y*1.005,z) for x,y,z in pts],.008,'cyan')
   if j%2==0:fin('attached containment fin',a,.35)
   gap=a+.5
   pts=[((r-.04)*math.cos(gap),(r-.04)*math.sin(gap),z) for z,r in levels[:-1]]
   tube('irregular plasma inside armour gap',pts,.026,'pink')
  torus('rear milled accelerator collar',(0,0,.7),.42,.075,'edge',rot=(0,0,0))
  bpy.ops.mesh.primitive_cone_add(vertices=12,radius1=.03,radius2=.2,depth=.37,location=(0,0,-1.02));meshmat(bpy.context.object,'pink')
  sphere('irregular hot nose nucleus',(.025,-.055,-1.13),(.055,.05,.08),'hot',1,True)
  for j in range(3):
   pts=[]
   for k in range(25):
    q=k/24;z=.78+q*.68;a=j*2.2+q*1.8+t*TAU;r=.1+.05*math.sin(q*10+t*TAU+j)
    pts.append((r*math.cos(a),r*math.sin(a),z))
   o=tube('short turbulent exhaust filament',pts,.045,'pink' if j!=0 else 'cyan')
   for k,p in enumerate(o.data.splines[0].points):p.radius=(1-k/25)*(.6+.25*math.sin(k*.8+t*TAU+j))
  return
 impact(t,'helix')

def reactor(t,phase):
 if phase=='charge':aperture(t,'reactor');return
 if phase=='flight':
  sphere('fragmented dense reactor interior',(0,0,0),(.65,.65,.75),'violet',2)
  levels=[(.8,.22),(.62,.59),(.1,.76),(-.45,.66),(-.78,.29)]
  for j in range(8):
   a=j*TAU/8+.04*math.sin(t*TAU+j)
   shellplate('heavy fractured reactor armour',a,.62,levels,'armour' if j%3 else 'chrome')
   pts=[]
   for k,(z,r) in enumerate(levels):
    b=a+.36+.035*math.sin(k*2+j+t*TAU);pts.append(((r-.035)*math.cos(b),(r-.035)*math.sin(b),z))
   tube('emissive crack under cage',pts,.035,'pink')
   if j%2==0:
    box('attached containment block',(.73*math.cos(a),.73*math.sin(a),.05),(.19,.19,.34),'edge',(0,a,.2),.045)
  for z in[-.68,.65]:torus('heavy reactor collar',(0,0,z),.38,.09,'edge',rot=(0,0,0))
  for j in range(3):
   a=j*2.4+t*TAU;z=.91+j*.12
   sphere('short irregular ion wake',(.12*math.sin(a),.1*math.cos(a),z),(.07,.055,.16-.025*j),'pink',1,True)
  return
 impact(t,'reactor')

def impact(t,kind):
 q=1-(1-t)**2;fade=max(.005,1-t);rng=random.Random(419 if kind=='helix' else 991)
 if kind=='helix':
  # Lateral shear: broken milled armour is the read; the pressure flash is brief, never a full ring.
  flash=max(.005,1-t/.27)
  for j in range(5):
   a=j*2.1;r=.15+.25*math.sin(j*3)
   sphere('brief irregular pressure flash',(r*math.cos(a),-.15,.15*math.sin(a)),(.5*flash,.25*flash,.22*flash),'hot' if j%2 else 'pink',2)
  for j in range(10):
   side=-1 if j%2 else 1;x=side*(.2+q*(1.1+.1*(j%5)));z=(j//2-2)*.21*(.3+q)-.1*t*t;y=rng.uniform(-.2,.2)
   o=box('laterally sheared milled shell',(x,y,z),((.4+.04*(j%3))*fade,.19*fade,.22*fade),'armour' if j%3 else 'edge',(j*.4,t*3*side,j*.3+t),.025*fade)
   if j%2==0:tube('hot fracture edge',[(x-.13*fade,y-.11*fade,z),(x+.1*fade,y-.11*fade,z+.045)],.018*fade,'pink')
  for j in range(3):
   x=(-.3+j*.3)*fade
   sphere('residual compressed plasma',(x,-.02,.08*math.sin(j+t*8)),(.13*fade,.1*fade,.2*fade),'violet',1,True)
  return
 # A dense off-centre rupture has no radial symmetry and stays heavier/closer than the lance shear.
 sphere('ruptured black reactor mass',(-.14,.08,-.08),(.68*fade,.4*fade,.67*fade),'armour',2,True)
 for j in range(3):
  a=j*2.399;r=.2+.22*q;x=-.28+r*math.cos(a);z=.18+r*math.sin(a)
  s=(.45+.04*math.sin(j))*fade
  o=sphere('connected turbulent core rupture',(x,-.19+.07*math.sin(j),z),(s*1.15,s*.8,s),'pink' if j%2 else 'violet',3)
  tex=bpy.data.textures.new('rough plasma surface','CLOUDS');tex.noise_scale=.2
  d=o.modifiers.new('broken pressure volume','DISPLACE');d.texture=tex;d.strength=.22*fade;d.mid_level=.45
 sphere('small exposed hot fracture',(-.36,-.47,.27),(.12*fade,.055*fade,.13*fade),'hot',2)
 for j in range(8):
  a=j*2.399+.3;r=.28+q*(.65+.2*rng.random());x=r*math.cos(a)+.12;z=r*math.sin(a)-.1
  size=(.31+.05*rng.random())*fade
  o=box('heavy reactor containment fracture',(x,rng.uniform(-.16,.18),z),(size,.22*fade,size*.75),'chrome' if j%3 else 'armour',(a*.4,t*2+a,a+t*1.3),.04*fade)
  if j%2==0:sphere('hot crack at armour break',(x,-.2,z),(.075*fade,.04*fade,.14*fade),'pink',1,True)

def render(family,phase,frame,proof=False):
 sc=reset(phase);t=frame/(N if phase=='flight' else N-1);(helix if family=='helix' else reactor)(t,phase)
 dest=OUT/(f'proof/{proof}' if isinstance(proof,str) else 'proof' if proof else f'frames/{family}-{phase}')
 dest.mkdir(parents=True,exist_ok=True);path=dest/f'{family}-{phase}-{frame:02}.png'
 sc.render.filepath=str(path);bpy.ops.render.render(write_still=True)
 # Preserve raw geometry/shading output and strip PNG metadata; a tight luminance bloom is a derivative.
 im=Image.open(path).convert('RGBA');im.save(path)
 if proof:bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE/f'{family}-{phase}-{proof if isinstance(proof,str) else "hero"}.blend'))
 return path

def manifest():
 clips={}
 for fam in['helix','reactor']:
  clips[fam]={}
  for phase in['charge','flight','impact']:
   ready=(OUT/f'{fam}-{phase}.png').exists()
   clips[fam][phase]={'atlas':f'{fam}-{phase}.png','available':ready,'approval':'prototype only; native assessment pending' if ready else 'UNRENDERED — held for native assessment','cell':[256,256],'grid':[4,3],'frames':12,'frameRects':[[i%4*256,i//4*256,256,256]for i in range(12)],'fps':24,'pivot':[128,128],'displayUnits':{'charge':56,'flight':88 if fam=='helix' else 80,'impact':96}[phase],'loop':phase=='flight','blend':'source-over','direction':'down at rotation 0'}
  clips[fam]['discharge']={'alias':'flight','available':clips[fam]['flight']['available'],'indices':[0,1,2,3],'fps':24}
  clips[fam]['cool']={'alias':'charge','available':clips[fam]['charge']['available'],'indices':[3,2,1,0],'fps':24}
 m={'status':'prototype, unapproved, no gameplay integration; charge only is rendered','source':'art/space/weapons_v2.py','sourceSha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'sourceScenes':'art/space/weapons-v2','renderer':'Blender5.2.2 Cycles CPU,16samples,4threads,AgX Medium High Contrast,transparent RGBA','palette':['dark chrome','violet-magenta plasma','cyan reflection edges'],'families':clips,'collision':'visual studies only; no radius, damage, timing or rules admitted'}
 (OUT/'manifest.json').write_text(json.dumps(m,indent=2))

def pack(phase_only=None):
 report=json.loads((OUT/'render-report.json').read_text()) if (OUT/'render-report.json').exists() else {}
 for fam in['helix','reactor']:
  for phase in([phase_only] if phase_only else ['charge','flight','impact']):
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
 elif cmd=='proof-mechanical':
  for fam in['helix','reactor']:
   for phase in['flight','impact']:print('PROOF',render(fam,phase,8 if phase=='flight' else 4,'mechanical-v2'),flush=True)
 elif cmd=='render':
  fams=[sys.argv[2]] if len(sys.argv)>2 else ['helix','reactor']
  for fam in fams:
   for phase in['charge','flight','impact']:
    for i in range(N):print('FRAME',render(fam,phase,i),flush=True)
 elif cmd=='render-phase':
  fams=[sys.argv[2]] if sys.argv[2]!='all' else ['helix','reactor'];phase=sys.argv[3]
  for fam in fams:
   for i in range(N):print('FRAME',render(fam,phase,i),flush=True)
 elif cmd=='proof-impact-v3':
  for fam in['helix','reactor']:print('PROOF',render(fam,'impact',2 if fam=='helix' else 4,'impact-v3'),flush=True)
 elif cmd=='proof-impact-v4':
  for fam in['helix','reactor']:
   for i in[0,1,4,8]:print('PROOF',render(fam,'impact',i,'impact-v4'),flush=True)
 elif cmd=='pack':pack(sys.argv[2] if len(sys.argv)>2 else None)
