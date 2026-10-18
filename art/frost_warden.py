# Render the hostile Frost Warden using the retained, licensed Yeti rig.
from pathlib import Path
import hashlib,json,math

ROOT=Path(__file__).resolve().parents[1]
frost_base_path=ROOT/'art/brum.py'
assert hashlib.sha256(frost_base_path.read_bytes()).hexdigest()=='75968015af39eb6395d3f598f7f53f4a1db9cca2a21b83dbcab4c773dff45abd'
code=frost_base_path.read_text().split("report={'source':str(SOURCE)")[0]
replacements={
    "ROOT/'out/cast/source-audit/Yeti.gltf'":"ROOT/'art/frost-warden/source/Yeti.gltf'",
    "'#EAE1CE'":"'#444151'", "'#4B8DAD'":"'#91A8B5'", "'#496170'":"'#292D42'",
    "'#28536C'":"'#302537'", "'#E7DFC9'":"'#E5EEF0'", "'#B6677C'":"'#87617E'", "'#102333'":"'#121322'",
}
for old,new in replacements.items():
    assert old in code,old
    code=code.replace(old,new)
exec(compile(code,str(frost_base_path),'exec'),globals())
from bpy_extras.object_utils import world_to_camera_view
import numpy as np

assert not args.face and not args.skin
arm.rotation_euler=(0,0,math.radians(65))
STATES['Scowl']=dict(mouth=.45,corner=-.018,lid=.31,low=.03,brow=-.015,tilt=.11,teeth=True)
STATES['Stagger']=dict(mouth=.82,corner=-.025,lid=.20,low=.02,brow=.045,tilt=0,teeth=True)
STATES['Triumph']=dict(mouth=.75,corner=.04,lid=.35,low=.06,brow=-.01,tilt=.10,teeth=True)
track={}
for side,sign in [('L',1),('R',-1)]:
    group=skin.vertex_groups.new(name='frost_hand_'+side)
    group.add([v.index for v in skin.data.vertices if v.co.x*sign>1.50],1,'REPLACE');track[side]=group.index

def project(point):
    q=world_to_camera_view(sc,cam,point)
    return [q.x*CELL[0]-PIVOT[0],(1-q.y)*CELL[1]-PIVOT[1]]

def rect(points):
    xs=[p[0]for p in points];ys=[p[1]for p in points]
    return dict(x=min(xs),y=min(ys),w=max(xs)-min(xs),h=max(ys)-min(ys))

def anchors():
    dep=bpy.context.evaluated_depsgraph_get();eo=skin.evaluated_get(dep);me=eo.to_mesh(preserve_all_data_layers=True,depsgraph=dep);hands={}
    for side in ['L','R']:
        points=[project(eo.matrix_world@v.co)for v in me.vertices if any(g.group==track[side] and g.weight>.5 for g in v.groups)]
        box=rect(points);hands[side]={'x':box['x']+box['w']/2,'y':box['y']+box['h']/2,'r':min(box['w'],box['h'])*.46,'bounds':box}
    eo.to_mesh_clear()
    bones={side:{'shoulder':project(arm.matrix_world@arm.pose.bones['UpperArm.'+side].head),'elbow':project(arm.matrix_world@arm.pose.bones['LowerArm.'+side].head),'wrist':project(arm.matrix_world@arm.pose.bones['LowerArm.'+side].tail)}for side in ['L','R']}
    return {'hands':hands,'bones':bones}

specs=[
 ('idle','Idle',[0,.25,.5,.75],'Scowl',6,True),
 ('walk','Walk',[0,.25,.5,.75],'Scowl',8,True),
 ('windup','Punch',[0,.1,.2,.3],'Protective',10,False),
 ('strike','Punch',[.4,.5,.6,.7],'Protective',12,False),
 ('recover','Punch',[.8,.9,.97,1],'Scowl',10,False),
 ('hurt','HitReact',[0,.3,.6,.9],'Stagger',10,False),
 ('victory','Yes',[0,.25,.5,.75],'Triumph',8,False),
]
OUT.mkdir(exist_ok=True,parents=True)
meta={'source':'art/frost-warden/source/Yeti.gltf','sourceSHA256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'derivedScript':'art/brum.py','derivedScriptSHA256':hashlib.sha256(frost_base_path.read_bytes()).hexdigest(),'unit':[144,128],'pivot':[.5,.90625],'nativeHeight':80,'forward':'right','yaw':65,'anchorSpace':'world units relative to feet pivot; x right, y down','clips':{},'frames':[]}
for name,action_name,fractions,state,fps,loop in specs:
    action=bpy.data.actions[action_name];arm.animation_data.action=action
    if action.slots:arm.animation_data.action_slot=action.slots[0]
    start=len(meta['frames']);meta['clips'][name]={'start':start,'n':len(fractions),'frames':list(range(start,start+len(fractions))),'fps':fps,'loop':loop,'source':action_name,'fractions':fractions}
    f0,f1=action.frame_range
    for i,fraction in enumerate(fractions):
        frame=f0+(f1-f0)*fraction;sc.frame_set(int(frame),subframe=frame-int(frame));pose_fingers();face(state);bpy.context.view_layer.update()
        measured=anchors();dest=OUT/f'{name}_{i:02}.png';sc.render.filepath=str(dest)
        print('FROST RENDER',len(meta['frames'])+1,'/28',dest.name,flush=True)
        bpy.ops.render.render(write_still=True)
        with Image.open(dest)as im:
            im.load();assert im.mode=='RGBA';b=im.getchannel('A').getbbox();assert b and min(b[:2])>1 and b[2]<im.width-1 and b[3]<im.height-1,(name,i,b)
            im.save(dest)
            # A conservative measured torso box excludes empty arm/leg corners.
            alpha=np.array(im.getchannel('A'));rows=[]
            for y in range(round(PX*46),round(PX*78)):
                xs=np.where(alpha[y]>128)[0]
                if len(xs):rows.append((int(xs.min()),int(xs.max())))
            left=max(x[0]for x in rows);right=min(x[1]for x in rows)
            measured['body']={'x':left/PX-PIVOT[0],'y':46-PIVOT[1],'w':max(8,(right-left)/PX),'h':32}
        measured.update(index=len(meta['frames']),clip=name,pose=i,sourceFrame=frame,file=dest.name,alphaBounds=b)
        meta['frames'].append(measured);(OUT/'render-progress.json').write_text(json.dumps(meta,indent=2))
forward=max(['L','R'],key=lambda side:max(f['hands'][side]['x']+f['hands'][side]['r']for f in meta['frames']if f['clip']=='strike'))
meta['forwardHand']=forward
for f in meta['frames']:
    f['fist']={k:f['hands'][forward][k]for k in ['x','y','r']};f.update(f['bones'][forward])
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'frost-warden.blend'))
(OUT/'render.json').write_text(json.dumps(meta,indent=2))
print('FROST COMPLETE',forward,'forward hand',flush=True)
