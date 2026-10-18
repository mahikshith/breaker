# Builds docs/BREACH-ChatGPT-handoff.md: one self-contained file for another assistant (e.g. a ChatGPT project).
# It concatenates the design brief, steering prompts, story plan, game plan and handoff docs 01-03, plus a repo file map,
# and writes the companion docs/BREACH-blender-scripts.md with every art script in full.
# Run from the repo root after editing any of those docs:  python3 tools/make_handoff.py
import subprocess

PARTS = [('A', 'Design brief for ChatGPT (start here)', 'docs/handoff/04-chatgpt-design-brief.md'),
         ('B', 'Steering prompts: project instructions, task prompts, corrections, checklists', 'docs/handoff/05-chatgpt-steering-prompts.md'),
         ('C', 'Story mode plan, research and roadmap', 'docs/STORY_PLAN.md'),
         ('D', 'Original game plan', 'docs/GAME_PLAN.md'),
         ('E', 'Status, owner rules, progress log, TODO, palette', 'docs/handoff/01-status-and-next-steps.md'),
         ('F', 'Architecture, art pipeline, build and test', 'docs/handoff/02-architecture-and-pipeline.md'),
         ('G', 'Environment, connections, skills, memory, UI/UX rules', 'docs/handoff/03-environment-skills-ux.md')]

# Companion file: every art script in full, so another assistant sees exactly how the art is built.
SCRIPTS = [
    ('art/render_vault_assets.py', 'Production', 'The Vault: background plate, iron cage bars layer, glazed brick sprites (5 colours x 2 widths x damage states, gold gem, granite), chrome ball/fire/titan balls, paddle, power-up capsules. Defines the shared look: glazed-ceramic and vinyl materials, key/fill/bounce area lights, softbox reflection plane, ortho camera, AgX Medium High Contrast.', 'python3 art/render_vault_assets.py all|plate|bars|sprites|post [--fast] [--threads N]', 'art/out/vault_raw/ then assets/vault/ (via vault_post.py)'),
    ('art/vault_post.py', 'Production (no Blender)', 'Pillow/numpy post-process for the Vault renders: glows, splits the paddle into stretchable caps and middle, builds atlas.json and preview sheets.', 'python3 art/vault_post.py', 'assets/vault/'),
    ('art/render_invasion_assets.py', 'Production', 'Invasion: hangar plate, candy/armour/power bricks, toy robot invaders (7 expressions x colours), the mothership with alien pilot (5 expressions and rim lights), bolt and bomb. Imports the Vault materials and light rig so both levels match.', 'python3 art/render_invasion_assets.py all|plate|static|ship|bots|sprites|post', 'art/out/invasion_raw/ then assets/invasion/'),
    ('art/invasion_post.py', 'Production (no Blender)', 'Pillow/numpy post-process for Invasion: LED and plasma glows, calm/dim passes, atlas.json, contact and composite sheets.', 'python3 art/invasion_post.py', 'assets/invasion/'),
    ('art/princess.py', 'Production, the model for every new character', 'Princess Lumi from the KayKit Rogue (CC0): atlas recolour, tiara, bell skirt, and the expressive face rig (glossy eyeballs with iris/pupil/catch-lights, skin lids with lash line, brows, reshaping mouth decal, blush) with per-animation expressions. Prince Kit should be built the same way from kk_Knight.glb.', 'python3 art/princess.py assets/princess Idle:16 Cheer:16 Running_A:12 ... [--face] [--samples N] [--threads N]', 'assets/princess/<Anim>_NN.png'),
    ('art/kit.py', 'Production, selected Knight 2', 'Open-helmet cobalt knight from KayKit Knight (CC0): continuous skin, fitted expressive face, hand-mounted heater shield and eight real rig animation families. Supersampled output is normalized to 168-pixel cells with fixed feet anchor; presentation portraits/turnaround are separate.', 'python3 art/kit.py assets/kit Idle:16 Focus:12 Grin:12 Shock:8 Worried:12 Cheer:16 Hurt:8 Laugh:16 [--face] [--yaw N] [--samples N] [--threads N]', 'assets/kit/<Clip>_NN.png; out/kit-proof/kit.blend'),
    ('art/snake.py', 'Production', 'Gnash and the jade warden variant: angular faceted viper head with brow plates, hinged jaw and expressive eyes, 13 expressions in left/right facings. The body is drawn in code with the matching palette.', 'python3 art/snake.py assets/snake-jade --palette jade --dirs r,l --samples 64 --px 4 --threads 2', 'assets/snake[-jade]/head_<expr>_<r|l>.png, meta.json'),
    ('art/char_preview.py', 'Utility', 'Quick lit preview of any rigged GLB at one frame of one animation; useful for checking KayKit parts and poses.', 'python3 art/char_preview.py model.glb out.png [action] [frame]', 'one PNG'),
    ('art/vault_tower.py', 'Look test (history)', 'The approved v3 look test: the Vault as a cutaway tower wall with big glazed bricks. The "shiny" target the production renders copy. (Its comments still mention an early fox character, later replaced by the princess.)', 'python3 art/vault_tower.py [out.png] [scale]', 'art/out/'),
    ('art/vault_side.py', 'Look test (history)', 'Earlier side-view look test of the Vault.', 'python3 art/vault_side.py [out.png] [scale]', 'art/out/'),
    ('art/vault_scene.py', 'Look test (history)', 'First top-down look test built from art/vault-grid.json.', 'python3 art/vault_scene.py [out.png] [scale]', 'art/out/'),
    ('art/vault-grid.json', 'Data', 'Grid used by the early look tests.', '-', '-'),
    ('tools/pack_art.py', 'Production', 'Packs all rendered PNGs into src/vault-art.js as WebP data URIs (3 px per game unit for sprites) so the game ships as one HTML file. Run after any render, then npm run build.', 'python3 tools/pack_art.py', 'src/vault-art.js'),
]
FRAMES = ['assets/princess', 'assets/kit', 'assets/snake', 'assets/snake-jade', 'assets/vault', 'assets/invasion']


def sh(cmd):
    return subprocess.run(cmd, shell=True, capture_output=True, text=True).stdout


def demote(text):
    """Push every Markdown heading down one level (outside code fences) so each doc nests under its Part."""
    out, fence = [], False
    for line in text.split('\n'):
        if line.startswith('```'):
            fence = not fence
        out.append('#' + line if not fence and line.startswith('#') else line)
    return '\n'.join(out)


files = [f for f in sh('git ls-files --cached --others --exclude-standard').split('\n') if f and not (f.endswith('.png') and f.startswith(tuple(FRAMES)))]
counts = '\n'.join(f'{d}: {sh(f"git ls-files --cached --others --exclude-standard {d}").count(".png")} PNG renders' for d in FRAMES)
doc = f'''# BREACH: complete handoff for ChatGPT (single file)

This one file contains everything another assistant needs to design for, or take over, BREACH. Rebuild it with `python3 tools/make_handoff.py`.

- **Game:** BREACH, a premium portrait brick breaker for iOS and Android. Tagline: "Break in. Break out."
- **Owner:** mykee (GitHub `mahikshith`).
- **Repository:** https://github.com/mahikshith/breaker. `main` is the stable branch; `{sh("git branch --show-current").strip()}` is this working branch.
- **Assembled at:** repo commit `{sh("git rev-parse --short HEAD").strip()}`.

## How to read this file

- **For design work:** read Part A first (what to make, and in which format) and Part B (how the owner steers you). Then read C for the story, and E and G for the rules.
- **For execution work:** read E, F and G in full before touching anything, plus `docs/BREACH-blender-scripts.md`.

| Part | Contents | Source file in the repo |
|---|---|---|
''' + ''.join(f'| {k} | {t} | `{p}` |\n' for k, t, p in PARTS) + '| H | Repository file map | `git ls-files` |\n\nCompanion file: `docs/BREACH-blender-scripts.md` has every Blender and art script in full.\n'
for k, t, p in PARTS:
    doc += f'\n\n---\n\n# Part {k}: {t}\n\n*Source: `{p}`*\n\n' + demote(open(p).read())
doc += '\n\n---\n\n# Part H: Repository file map\n\nThese are tracked and non-ignored working files, except individual render frames, which are counted instead:\n\n```\n' + counts + '\n\n' + '\n'.join(files) + '\n```\n'
open('docs/BREACH-ChatGPT-handoff.md', 'w').write(doc)
print(f'docs/BREACH-ChatGPT-handoff.md: {len(doc)} chars')

art = '''# BREACH: Blender and art scripts (reference for how every asset is built)

Companion to `docs/BREACH-ChatGPT-handoff.md`. Every script below is in the repo, https://github.com/mahikshith/breaker, at the path shown. They run headless with Blender 5.2 as a Python module:

- Python 3.13, then `pip install bpy==5.2.2 pillow numpy`;
- Cycles on the CPU.

The order of work is render, post-process, `python3 tools/pack_art.py`, then `npm run build`. Before committing, strip the PNG metadata (doc 02, section 3).

Design rule for anything new: reuse these materials, this light rig and this face rig, so new art matches the existing art.

## Index

| Script | Status | What it does | Run | Output |
|---|---|---|---|---|
''' + ''.join(f'| `{p}` | {st} | {what} | `{run}` | {out} |\n' for p, st, what, run, out in SCRIPTS)
for p, st, what, run, out in SCRIPTS:
    lang = 'json' if p.endswith('.json') else 'python'
    art += f'\n\n---\n\n## `{p}`\n\n{what}\n\n```{lang}\n' + open(p).read().rstrip() + '\n```\n'
open('docs/BREACH-blender-scripts.md', 'w').write(art)
print(f'docs/BREACH-blender-scripts.md: {len(art)} chars')
