# Step by step: BREACH design in M365 Copilot and Copilot Studio

Two tools, two jobs:
- **M365 Copilot** (chat, images, docs; has Opus 5.5 and ChatGPT): start here today. No setup beyond adding files.
- **Copilot Studio** (agents): set up once, then use it for jobs you repeat (another power-up pass, another level, checking answers).

## Which tool for which prompt

| Prompt (in `02-prompt-pack.md`) | Tool |
|---|---|
| P1 to P10 in one batch, with images and saved files | Copilot Studio agent (`RUN ALL`) |
| P1 power-ups, P2 difficulty, one at a time | M365 Copilot chat |
| P3 new power-ups, P4 continue screen, P7 new level, P10 unlockables | Either; the agent saves pasting context |
| P5 critique of APK screenshots | M365 Copilot (attach the screenshots) |
| P6 research on other games | M365 Copilot, **Researcher** agent |
| Every image ("Art requests", P8, P9, `prompt-library/`) | The Studio agent makes them during its batch; M365 Copilot chat for extra variants or fixes |
| Level boards and mock-ups | M365 Copilot |

## Part A: M365 Copilot (do this first)

1. **Download** these files from the thread: `01-context-brief.md`, `02-prompt-pack.md`, `04-return-format.md`, `examples/breach-powerups-example-v1.md`, and `prompt-library/00-style-bible.md`.
2. **Start a new chat** and attach `01-context-brief.md` and `04-return-format.md` with the paperclip. Do this at the start of every new chat. (Notebooks did not work on the owner's licence, 2026-10-23.)
3. **Pick the model.** In the model menu, choose **Opus 5.5** (or the newest ChatGPT reasoning model) for design work.
4. **Run P1.** Copy prompt P1 from `02-prompt-pack.md`, fill in what felt wrong in the APK, paste it. Answer its "Decisions for the owner" with your picks, then type `locked`. Copy the final answer and paste it in the BREACH project chat, starting with `Copilot drop: breach-powerups-powerups-round2-v1.md`.
5. **Run P2** in a new chat, with the two files attached again, the same way. Then P5 with the two files plus 4 to 10 APK screenshots attached, and P6 in the **Researcher** agent.

**Images:** open a new chat, attach 2 or 3 pictures from `prompt-library/examples/` (see its `INDEX.md`), paste the image prompt from an answer's "Art requests" or from `prompt-library/`, ask for 3 variants. Download the best as PNG and send it in the project chat.

## Part B: Copilot Studio (one agent: designs, draws and saves P1 to P10)

Follow `studio/SETUP.md`: paste `studio/INSTRUCTIONS.txt`, upload the ten files in `studio/knowledge/`, turn on image generation, add the "Save BREACH file" tool, publish, then type `RUN ALL` and `next` after each reply. Each reply says which step it is on; answers go to `BREACH-Copilot/drops/` and images to `BREACH-Copilot/assets/`.

## Every time

Copilot designs, you pick and say `locked`, you paste the answer here as `Copilot drop: <file name>`, and Claude builds it and sends screenshots.
