# Copilot Studio: one agent that designs, draws and saves P1 to P10

One paste for the instructions, one upload for the files, one tool for saving, then type `RUN ALL`. The agent writes each answer, generates the images, saves everything into folders, and tells you which step it is on.

Menu names in Copilot Studio move around. If a name below does not match exactly, look for the closest one, and tell Claude what you saw.

## 1. Create the agent (once)

1. Open **copilotstudio.microsoft.com**. Choose **Create**, then **New agent**, then the **Configure** tab.
2. **Name:** `BREACH Design Studio`
3. **Description:** `Lead game designer and art director for BREACH, a premium mobile brick breaker. Runs tasks P1 to P10, makes the images, saves every answer and asset.`
4. **Instructions:** open `INSTRUCTIONS.txt` (this folder), select all, copy, paste. About 7,000 characters, under the 8,000 limit.
5. **Knowledge:** **Add knowledge**, then **Upload file**, select all ten files in `knowledge/` (K01 to K10) at once. If a `.md` file is refused, rename it to `.txt`. Wait until each shows as ready.
6. **Model:** in **Settings**, pick your frontier model. Turn on general knowledge and, if allowed, web search (P6 uses it).
7. **Capabilities:** in Settings (or the agent's Overview), turn on **Image generation** and **Code interpreter** if they are offered. Image generation makes the art; code interpreter makes charts and can produce downloadable files.
8. Choose **Create** (or **Save**).

## 2. Add the save tool (once, about 5 minutes)

This lets the agent save each answer as its own file in your OneDrive.

1. In OneDrive, make a folder `BREACH-Copilot` with two folders inside: `drops` and `assets`.
2. In the agent, open **Tools**, choose **Add a tool**, search for **Create file**, and pick the **OneDrive for Business** one. Sign in when asked.
3. Rename the tool to `Save BREACH file`. Description: `Saves a BREACH answer or image prompt as a file in the owner's OneDrive BREACH-Copilot folder.`
4. Leave its inputs (**Folder path**, **File name**, **File content**) set to be filled in by the agent (the default, "dynamically fill with AI").
5. Save.

What lands where:

| Folder | Files |
|---|---|
| `BREACH-Copilot/drops/` | One Markdown file per task: `P01_breach-powerups-powerups-round2-v1.md`, `P02_...`, up to `P10_...` |
| `BREACH-Copilot/assets/P08_ember/` (one folder per task) | Each image's prompt as `.prompt.txt`, and the images if the agent can save them |

Generated images usually cannot be pushed into OneDrive by this tool. When an image appears in the chat, download it and save it into its task's `assets` folder with the name the agent gives under "Images:".

## 3. Publish (once)

**Publish**, then add the **Teams and Microsoft 365 Copilot** channel. The agent then appears in your M365 Copilot app, where image generation works best and chats are kept. If publishing is blocked by your org, use the test pane on the right instead.

## 4. Run

1. Open the agent (in M365 Copilot, or the test pane) and start a new chat.
2. Type `RUN ALL. Notes: <what felt wrong in the APK>`.
3. Each reply starts with `STEP P1/10 ... started` and ends with a STATUS block: what is done, what it saved, the images it made, and what comes next.
4. Type `next` after each reply until it says `Batch done` and shows a summary table.
5. Cut off mid-answer? Type `more`. Want to change a pick? Type for example `1: B, 2: A`; it saves a new version.

Other commands: `RUN P7` runs one task. `RUN FROM P4` continues a batch. Attach screenshots and type `RUN P5` for the critique.

## 5. Send it to Claude

Attach the files from `BREACH-Copilot/drops/` and the images from `assets/` in the BREACH project chat, with one line: `Copilot batch done`. If your OneDrive syncs to your laptop, tell Claude the folder path instead and it reads the files from there.

## What each knowledge file is

| File | Holds | Used by |
|---|---|---|
| K01-context-brief | The game, 11 chapters, real numbers, owner feedback, rules, palette | Every task |
| K02-prompt-pack | The full text of P1 to P10 | Every task |
| K03-return-format | Answer shape and JSON schema per kind | Every task |
| K04-example-drop | A small finished answer | Every task |
| K05-style-bible | House look and image prompt preamble | Every image |
| K06-characters-and-creatures | Cast and character sheet prompts | P8, P10 |
| K07-bricks-props-fx | Bricks, props, FX, power icons | P3, P9 |
| K08-level-concept-boards | Level board prompts, Dragon's Hoard | P7 |
| K09-game-design-and-physics | Level doc template, physics rules | P2, P7 |
| K10-story-plan | Story canon | P7, P8, P10 |

When Claude updates a file, delete the old one in Knowledge and upload the new one with the same name.
