# Builds docs/BREACH-ChatGPT-handoff.md: one self-contained file for another assistant (e.g. a ChatGPT project).
# It concatenates the design brief, story plan, game plan and handoff docs 01-03, plus a repo file map.
# Run from the repo root after editing any of those docs:  python3 tools/make_handoff.py
import subprocess

PARTS = [('A', 'Design brief for ChatGPT (start here)', 'docs/handoff/04-chatgpt-design-brief.md'),
         ('B', 'Story mode plan, research and roadmap', 'docs/STORY_PLAN.md'),
         ('C', 'Original game plan', 'docs/GAME_PLAN.md'),
         ('D', 'Status, owner rules, progress log, TODO, palette', 'docs/handoff/01-status-and-next-steps.md'),
         ('E', 'Architecture, art pipeline, build and test', 'docs/handoff/02-architecture-and-pipeline.md'),
         ('F', 'Environment, connections, skills, memory, UI/UX rules', 'docs/handoff/03-environment-skills-ux.md')]
FRAMES = ['assets/princess', 'assets/snake', 'assets/vault', 'assets/invasion']


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


files = [f for f in sh('git ls-files').split('\n') if f and not (f.endswith('.png') and f.startswith(tuple(FRAMES)))]
counts = '\n'.join(f'{d}: {sh(f"git ls-files {d}").count(".png")} PNG renders' for d in FRAMES)
doc = f'''# BREACH: complete handoff for ChatGPT (single file)

This one file contains everything another assistant needs to design for, or take over, BREACH. Rebuild it with `python3 tools/make_handoff.py`.

- **Game:** BREACH, a premium portrait brick breaker for iOS and Android. Tagline: "Break in. Break out."
- **Owner:** mykee (GitHub `mahikshith`).
- **Repository:** https://github.com/mahikshith/breaker. `main` is the stable branch; `wip/polish-pass` is the working branch.
- **Assembled at:** repo commit `{sh("git rev-parse --short HEAD").strip()}`.

## How to read this file

- **For design work:** read Part A first. It says what to make and in which format. Then read B for the story, and D and F for the rules.
- **For execution work:** read D, E and F in full before touching anything.

| Part | Contents | Source file in the repo |
|---|---|---|
''' + ''.join(f'| {k} | {t} | `{p}` |\n' for k, t, p in PARTS) + '| G | Repository file map | `git ls-files` |\n'
for k, t, p in PARTS:
    doc += f'\n\n---\n\n# Part {k}: {t}\n\n*Source: `{p}`*\n\n' + demote(open(p).read())
doc += '\n\n---\n\n# Part G: Repository file map\n\nThese are all tracked files, except individual render frames, which are counted instead:\n\n```\n' + counts + '\n\n' + '\n'.join(files) + '\n```\n'
open('docs/BREACH-ChatGPT-handoff.md', 'w').write(doc)
print(f'docs/BREACH-ChatGPT-handoff.md: {len(doc)} chars')
