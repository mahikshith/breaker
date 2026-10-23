# Copilot Studio: one agent that runs P1 to P10

One paste for the instructions, one upload for the files, then type `RUN ALL`.

## Set up (once, about 10 minutes)

1. Open **copilotstudio.microsoft.com**. Choose **Create**, then **New agent**, then the **Configure** tab.
2. **Name:** `BREACH Design Studio`
3. **Description:** `Lead game designer for BREACH, a premium mobile brick breaker. Runs design tasks P1 to P10 and returns drops Claude can build.`
4. **Instructions:** open `INSTRUCTIONS.txt` (in this folder), select all, copy, paste. It is about 6,000 characters, under the 8,000 limit.
5. **Knowledge:** choose **Add knowledge**, then **Upload file**, and select all ten files in the `knowledge/` folder (K01 to K10) at once. If a `.md` file is refused, rename it to `.txt` and upload it again. Wait until every file shows as ready.
6. **Model:** open **Settings** and pick the model to test (for example Fable). Turn on general knowledge. Turn on web search if your org allows it (P6 uses it).
7. Choose **Create** (or **Save**).

## Run

1. In the test pane on the right, start a new conversation (the refresh button).
2. Type `RUN ALL`. It answers P1.
3. Type `next` after each answer, nine times, until it says "Batch done".
4. If an answer stops with "Continued: type more", type `more`.
5. Copy each answer and paste it in the BREACH project chat, one answer per message. The first line of each answer is its file name.

Other commands: `RUN P4` runs one task. `RUN FROM P6` continues a batch. Attach screenshots and type `RUN P5` for the critique.

## Comparing models

For each model: **Settings**, pick the model, save, start a **new conversation**, `RUN ALL`. Each answer's file name ends with the model's name, so Claude can tell them apart and compare them with the M365 Copilot (Opus 5.5) answers.

## What each knowledge file is

| File | Holds | Used by |
|---|---|---|
| K01-context-brief | The game, 11 chapters, real numbers, owner feedback, rules, palette | Every task |
| K02-prompt-pack | The full text of P1 to P10 | Every task |
| K03-return-format | Answer shape and JSON schema per kind | Every task |
| K04-example-drop | A small finished answer | Every task |
| K05-style-bible | House look and image prompt preamble | All image prompts |
| K06-characters-and-creatures | Cast and character sheet prompts | P8, P10 |
| K07-bricks-props-fx | Bricks, props, FX, power icons | P3, P9 |
| K08-level-concept-boards | Level board prompts, Dragon's Hoard | P7 |
| K09-game-design-and-physics | Level doc template, physics rules | P2, P7 |
| K10-story-plan | Story canon | P7, P8, P10 |

When Claude updates a file, delete the old one in Knowledge and upload the new one with the same name.
