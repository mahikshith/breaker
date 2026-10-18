# BREACH: how to steer ChatGPT (prompts for the owner)

These are copy-paste prompts for running the design work in a ChatGPT project and keeping it on track. They cover the setup, the project instructions, one prompt per task, prompts to correct drift, image steering, and the package to bring back to Claude.

---

## 1. Set up the ChatGPT project (once)

1. In ChatGPT, create a **Project** called `BREACH design`.
2. Add these **files** to the project. They are all in the repo https://github.com/mahikshith/breaker:
   - `docs/BREACH-ChatGPT-handoff.md`: everything (rules, art bible, story, research, history, build docs);
   - `docs/BREACH-blender-scripts.md`: every Blender and art script, with an index explaining each one;
   - the images in `docs/reference/`, `docs/screens/` and `docs/drafts/` (optional, but helps a lot).
3. Optionally, connect **GitHub** (Settings → Connectors → GitHub) so ChatGPT can read the live repo.
4. Paste the block below into the project's **Instructions** field. Those instructions apply to every chat in the project.

### Project instructions (paste into the project's Instructions field)

```
ROLE
You are the lead game designer and art director for BREACH, a premium portrait brick breaker for
iOS and Android (repo: github.com/mahikshith/breaker). The owner is mykee. You do DESIGN ONLY.
An engineer (Claude) builds everything you design, in JavaScript/Canvas and in Blender 5.2 (Cycles),
using the existing scripts in BREACH-blender-scripts.md. You never write or change game code.

SOURCES OF TRUTH (read before every task, in this order)
1. BREACH-ChatGPT-handoff.md, Part A (design brief) and Part B (these steering prompts).
2. Part C (story plan, research), Part E (owner rules, palette, progress log), Part F (architecture
   and art pipeline), Part G (environment and UI/UX rules).
3. BREACH-blender-scripts.md: how the existing art is actually built. Every character or asset you
   design must be buildable the same way: KayKit chibi rig, the princess face-rig approach, the shared
   material and light rig of render_vault_assets.py.
If anything conflicts, the owner's rules (Part A section 2, Part E section 1) win.

NON-NEGOTIABLE ART AND UX RULES
- Premium, inventive, urgent, addictive. Nothing generic or "vibe-coded".
- Glossy rendered look: glazed-ceramic bricks, vinyl-toy characters, chrome paddle and ball, warm key
  light from the top-left, cool fill from the right, pink bounce from below, AgX Medium High Contrast.
- Expressions must say a lot: big eyes with lids, brows and a reshaping mouth on every character.
- Backgrounds stay calm, dark and desaturated, and never outshine the gameplay.
- Not too much yellow: gold and yellow are accents only. Cage bars are dark iron, not gold.
- Fonts: Lilita One for game text (dark outline 0.16 x size plus a drop shadow), Rubik for numbers.
- Only palette colours from Part A section 4 (hex), or new ones in the same family, stated as hex.
- Rejected forever: pixel art, wisps, jittery foxes, ball-chain snake bodies, round blob heads,
  flat clip-art, uniform faces.
- Mobile: 360 game units wide; iPhone 393x852 and Android 412x915; nothing inside the notch, status
  bar or home-indicator areas; 44 pt touch targets; paddle above the thumb.

HOW TO WORK
- One task at a time, in the order of Part A section 6. Don't start the next task until I say "locked".
- For every open choice, give 2-3 options in one short line each, with your recommendation marked.
- Make concept images with the style block in Part A section 4, then iterate with me.
- Every final deliverable follows Part A section 7 exactly: one Markdown file per task, hex colours,
  sizes in game units, times in seconds, animations as property from -> to, duration, easing, and
  dialogue as JSON. End each file with "Open questions for Claude".
- Before calling anything final, run the self-review checklist in Part B section 6 and fix what fails.
- Keep a running "Design lock" list (names, colours, proportions, decisions I approved). Repeat it at the
  top of each final file, and never change a locked item unless I ask.

NEVER
- Never invent features beyond the task. Put ideas under "Ideas for later" instead.
- Never change game rules or the story canon (Part C) without asking me first.
- Never write code for the game, and never ask for or handle tokens or passwords.
- Never add AI attribution text to anything meant for the repo.
```

---

## 2. Start the first chat

Paste the "First message" from Part A, section 1. Then paste the Task 1 prompt below.

---

## 3. Task prompts (one chat per task works best)

### Task 1: Prince Kit

```
Task 1: design Prince Kit (Part A section 6, Task 1).
Context: Kit is Lumi's childhood best friend, the courtyard bounce-game champion, an underdog the court
laughs at. His old courtyard paddle (battered wood + chrome, stitched grip) becomes the game paddle.
He is built from KayKit kk_Knight.glb with the same face rig as Princess Lumi (see princess.py in
BREACH-blender-scripts.md: glossy eyeballs, iris/pupil/two catch-lights, skin lids with lash line,
brow strokes, mouth decal, blush).
Steps:
1. Give 3 different directions for Kit (silhouette, outfit, dominant colour, personality in 3 words),
   each one paragraph, plus one concept image each. Recommend one.
2. After I pick, make the turnaround (front, 3/4, side, back) and the 8-expression sheet mapped to:
   determined (serve), focused (catch & aim), grin (combo), shock (life lost), worried (danger high),
   cheer (win), hurt (hit), laugh (titan).
3. Write build notes for Claude: which Knight parts to remove, keep or add, a hex colour for every
   material, the face-rig settings per expression (lids, brows, mouth shape, gaze), and which KayKit
   animation to use per game moment.
Rules: he must read differently from Lumi at 42 units tall; minimal yellow; chibi proportions with the
head about 40% of height.
```

### Task 2: Prologue

```
Task 2: write the prologue (Part A section 6, Task 2), skippable, about 60 seconds, 5-6 panels.
For each panel: shot/camera, characters, KayKit animation name, expression, background, lighting,
caption (12 words or fewer), speech bubbles (10 words or fewer), sound cue, duration in seconds, and the
transition. Beats: sunset courtyard game, the court scoffs, the sky darkens, the Clank toys turn, the
beam takes Lumi, Kit grabs his paddle, then straight into Invasion's first serve (the tutorial lives
inside the story).
Give two versions: "heartfelt" and "funny". Recommend one. Make one rough storyboard image per panel
for the version I pick. Deliver the panels as JSON too.
```

### Task 3: Story beats in the levels

```
Task 3: the in-level story beats (Part A section 6, Task 3). Each beat is 3-6 seconds: speaker,
expression name from that character's existing set (see Part F: robots, mothership, serpent,
princess), the line (10 words or fewer), 2 alternative lines, camera move, timing, and the sound.
Beats: Invasion intro, Zorvax mid-boss taunt, Invasion win (decoy reveal, beam takes Lumi), Invasion
lose, Vault intro (Gnash wakes, Lumi signals Kit), Lumi at 40% and 70% danger, Vault win ("My turn."),
Vault lose ("GOT HER!" already exists), and the "to be continued" Chapter 3 tease.
They must never block play for more than 2 seconds. Say which beats pause play and which play over it.
Output as a JSON array plus a readable table.
```

### Task 4: Results screen and Shine

```
Task 4: spec the new results screen (Part A section 6, Task 4) for iPhone 393x852 and Android 412x915,
in game units on the 360-wide grid. Include: score count-up, star pop-ins, Shine earned (1 per 100
points plus a star bonus), a short slot-machine Shine reveal (1.5 s or less, tap to skip), and a "next
unlock" progress bar. For every element give x, y, w, h, font, size, hex colour, states, and animation
(property from -> to, duration, easing, delay), plus the sound cues.
Make a mock-up image of the final screen in the game's style, plus a second image mid-animation.
```

### Task 5: Chapter select

```
Task 5: spec the chapter-select map (Part A section 6, Task 5): a vertical path from the Prologue to
Chapter 2, with Chapter 3 locked as a silhouette. Each node shows stars, best score and lock state.
Brickhaven's dark skyline sits at the bottom (it will light up in Phase 3). Same precision as Task 4.
Show it scrolling, a node being tapped, and the locked-node tap feedback. Mock-up images included.
```

### Task 6: Voice sheets

```
Task 6: voice sheets for Zorvax and Gnash (Part A section 6, Task 6). Personality, speech style, and 10
short lines each (taunts, hurt, panic), each with an expression name from the existing sprite set.
Zorvax is smug and theatrical, secretly lonely; hint at the twist exactly once. Gnash is hungry and
gleeful, short words, hissing. Also give 6 lines for Lumi (scared but brave) and 6 for Kit (underdog,
determined, a bit funny). Output as JSON.
```

---

## 4. Steering prompts (when the output drifts)

| When this happens | Paste this |
|---|---|
| It looks generic or templated | `This reads as generic. Push it 3 steps more distinctive: give the silhouette, colour and expression one memorable idea each, then redo it. Check it against the owner's "not vibe-coded" rule.` |
| Too much yellow or gold | `Too much yellow. Cut yellow and gold to accents under 10% of the frame and rebalance with the palette in Part A section 4. List the hex values you changed.` |
| The background is too busy | `The background competes with the gameplay. Darken and desaturate it (owner rule: calm, dark, never outshines the foreground) and remove decorative lights.` |
| Expressions are weak | `The expressions don't say enough. Exaggerate them toy-style: bigger lid and brow changes, mouth shapes that read at 42 units tall. Show each beside the neutral face.` |
| It invents extra features | `Stay inside this task. Move extras to "Ideas for later" and give me only what Task N asks for.` |
| Specs are vague | `Too vague for the engineer. Give every element x, y, w, h in game units, hex colours, font sizes, and animations as property from -> to, duration, easing.` |
| It contradicts the story or rules | `Check this against Part C (story canon) and Part E section 1 (owner rules). List every conflict, then fix them.` |
| Too many options | `Pick one. Give your single recommendation and one sentence of why.` |
| Images drift between versions | `Keep the character lock exactly: same proportions, hair, outfit colours and paddle. Change only what I asked.` |
| Before locking anything | `Act as a harsh senior art director for a premium iOS game. Critique this against the brief, list the top 5 problems, fix them, and show the revised version.` |
| To lock a decision | `Locked: <thing>. Add it to the Design lock list and never change it unless I ask.` |

---

## 5. Steering concept images

- **Start every image prompt with the style block** in Part A, section 4.
- **Character lock:** once you like a character, ask ChatGPT for a "character lock paragraph" covering proportions, colours with hex values, hair, outfit, props and face. Start every later image prompt for that character with that paragraph.
- **Change one thing at a time:** "same image, only change the scarf to teal `#22C4B0`".
- **Sheets:** ask for one sheet image (turnaround or expression grid) rather than separate images, so the lighting stays identical.
- **Backgrounds:** use a plain dark navy `#141831` for character art, so the colours read the same as in the game.
- **Concept art is reference only.** Claude re-renders the final art in Blender so it matches the rest of the game, so don't polish concept art for hours.

---

## 6. Self-review checklist (ChatGPT runs this before "final")

```
Before final, check and report pass/fail for each:
1. Follows every owner rule (Part A section 2)?
2. Colours only from the palette family, all as hex, yellow under 10%?
3. Expressions readable at 42 units tall (about 1 cm on a phone)?
4. Text: 6 words or fewer per pop, 12 or fewer per caption, Lilita One?
5. Nothing interactive in the notch, status bar or home-indicator areas; 44 pt targets?
6. Buildable with the existing pipeline (KayKit rig, princess face rig, shared light rig)?
7. Matches the story canon (Part C)?
8. Every number in game units, seconds or hex, with no "about" or "nice"?
9. File follows Part A section 7, starting with the Design lock list and ending with "Open questions
   for Claude"?
Fix every fail, then show me the final.
```

---

## 7. Package for Claude (end of each task)

```
Package Task N for Claude: one Markdown file named design/phase1/<NN>-<slug>.md following Part A
section 7 exactly (Design lock list at the top, then the spec, JSON blocks, image list, and "Open
questions for Claude" at the end), plus the final images named design/phase1/img/<NN>-<slug>-<n>.png.
Give me the Markdown as a downloadable file and list the images to download.
```

Then bring the file and images to the Claude Project thread and say **"build Task N"**. Claude builds it, playtests it at both phone sizes, and shows you screenshots.

---

## 8. Optional: using Codex for Blender work

Only use Codex for Blender work if you want ChatGPT's side to render art too. The recommendation is to let Claude render, so there is one consistent pipeline. If you do use Codex, run it on your computer in a clone of the repo, on its own branch, and never at the same time as Claude. Starter prompt:

```
You are working in the BREACH repo (github.com/mahikshith/breaker). Read docs/BREACH-ChatGPT-handoff.md
fully, especially Parts E-G, and docs/BREACH-blender-scripts.md. Work only on a new branch
named codex/<task>. Never commit to main.
Set the git identity first: git config user.name mahikshith; git config user.email mahikshith97@gmail.com.
Never add AI attribution to commits or files.
Render with Blender as a Python module (pip install bpy==5.2.2, Python 3.11), headless, reusing the existing
material/light rig from art/render_vault_assets.py and the face rig approach from art/princess.py.
Strip PNG metadata before committing (command in Part F section 3), run python3 tools/pack_art.py and
npm run build, then show me the rendered sheet images before committing.
Task: <paste the locked design file from design/phase1/>
```

**Watching Blender live:** the Blender MCP add-on lets an AI app drive a Blender window you can watch. It works with Claude Desktop, Claude Code, Cursor and VS Code, and with Codex through its MCP config; Part A, section 9 has the details. It's optional and not needed for the plan above.
