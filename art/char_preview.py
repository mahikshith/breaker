# Render a quick lit preview of a rigged GLB character at one frame of one animation.
# Run: python3 art/char_preview.py model.glb out.png [action] [frame]
import bpy, sys, math, addon_utils, mathutils
addon_utils.enable("cycles", default_set=True)
src, out = sys.argv[1], sys.argv[2]
act = sys.argv[3] if len(sys.argv) > 3 else 'Idle'
frame = int(sys.argv[4]) if len(sys.argv) > 4 else 10
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
bpy.ops.import_scene.gltf(filepath=src)
arm = next((o for o in sc.objects if o.type == 'ARMATURE'), None)
if arm and act in bpy.data.actions:
    arm.animation_data_create(); arm.animation_data.action = bpy.data.actions[act]
    # Blender 4.4+ slotted actions: bind the first slot
    if hasattr(arm.animation_data, 'action_slot') and bpy.data.actions[act].slots:
        arm.animation_data.action_slot = bpy.data.actions[act].slots[0]
sc.frame_set(frame)
meshes = [o for o in sc.objects if o.type == 'MESH']
print('meshes:', [(o.name, o.parent_bone if o.parent_type == 'BONE' else '', o.visible_get()) for o in meshes])
pts = [o.matrix_world @ mathutils.Vector(c) for o in meshes if o.visible_get() for c in o.bound_box]
mn = mathutils.Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
mx = mathutils.Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
ctr = (mn + mx) / 2; h = mx.z - mn.z
bpy.ops.object.camera_add(location=(ctr.x + h * 0.6, ctr.y - h * 2.2, ctr.z + h * 0.35))
cam = bpy.context.object; sc.camera = cam
d = ctr - cam.location; cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
cam.data.lens = 60
bpy.ops.object.light_add(type='AREA', location=(ctr.x - h, ctr.y - h * 1.5, ctr.z + h * 1.5)); L = bpy.context.object; L.data.energy = 300 * h * h; L.data.size = h
L.rotation_euler = (ctr - L.location).to_track_quat('-Z', 'Y').to_euler()
bpy.ops.object.light_add(type='AREA', location=(ctr.x + h * 1.2, ctr.y + h, ctr.z + h)); L = bpy.context.object; L.data.energy = 200 * h * h; L.data.size = h; L.data.color = (0.6, 0.7, 1)
L.rotation_euler = (ctr - L.location).to_track_quat('-Z', 'Y').to_euler()
w = bpy.data.worlds.new('w'); sc.world = w; w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.08, 0.07, 0.12, 1)
sc.render.engine = 'CYCLES'; sc.cycles.samples = 48; sc.cycles.use_denoising = True
sc.render.resolution_x = 360; sc.render.resolution_y = 480; sc.render.film_transparent = False
sc.view_settings.view_transform = 'AgX'
sc.render.filepath = out; bpy.ops.render.render(write_still=True)
