"""Asset QA for Nerra v2 (skills/blender/blender-asset-qa): floating parts, normals, z-fighting, topology, per pose.

Run from the repository root:  python3 art/nerra-v2/qa.py [frame keys...]   (default: a rest pose and the extreme poses)
Writes art/nerra-v2/qa-report.json. Only the parts that render in that frame are checked (the unused mouth plates are hidden).
"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(ROOT, 'skills', 'blender', 'blender-asset-qa', 'scripts'))
import bpy
import model as M, render as RD
import qa_check

def main():
    keys = sys.argv[1:] or ['idle_0', 'expr_furious', 'jump_land', 'snap_l_strike', 'hurt_flinch', 'defeated', 'walk_r_2']
    R = M.build(); poses = dict(RD.frames()); report = {}
    for k in keys:
        M.pose(R, **poses[k])
        names = [o.name for o in bpy.data.objects if o.type == 'MESH' and not o.hide_render and o.name.startswith('nerra.')]
        res = qa_check.run(objects=names, profile='render', eps=.0008, tol=.004, uv=False)
        objs = res.get('objects', {})
        report[k] = dict(passed=res.get('pass'), errors=res.get('errors'), warnings=res.get('warnings'), objects=len(objs),
                         tris=sum(o.get('tris', 0) for o in objs.values()), zfighting=res.get('zfighting'), floating=res.get('floating'),
                         ground_z=res.get('ground_z'))
        print(k, 'pass' if res.get('pass') else 'FAIL', 'errors:', res.get('errors'), '\n  warnings:', [w[:160] for w in res.get('warnings', [])][:12], flush=True)
    json.dump(report, open(os.path.join(HERE, 'qa-report.json'), 'w'), indent=1, default=str)

if __name__ == '__main__':
    main()
