# Step by step: BREACH design in M365 Copilot and Copilot Studio

Two tools, two jobs:
- **M365 Copilot** (chat, images, docs; has Opus 5.5 and ChatGPT): start here today. No setup beyond adding files.
- **Copilot Studio** (agents): set up once, then use it for jobs you repeat (another power-up pass, another level, checking answers).

## Which tool for which prompt

| Prompt (in `02-prompt-pack.md`) | Tool |
|---|---|
| P1 power-ups, P2 difficulty | M365 Copilot now; Copilot Studio agent for later rounds |
| P3 new power-ups, P4 continue screen, P7 new level, P10 unlockables | Either; the agent saves pasting context |
| P5 critique of APK screenshots | M365 Copilot (attach the screenshots) |
| P6 research on other games | M365 Copilot, **Researcher** agent |
| Every image ("Art requests", P8, P9, `prompt-library/`) | M365 Copilot |
| Level boards and mock-ups | M365 Copilot |
| Checking an answer before sending it to Claude | Copilot Studio, BREACH Critic agent (optional) |

## Part A: M365 Copilot (do this first)

1. **Download** these files from the thread: `01-context-brief.md`, `02-prompt-pack.md`, `04-return-format.md`, `examples/breach-powerups-example-v1.md`, and `prompt-library/00-style-bible.md`.
2. **Make a notebook.** In M365 Copilot open **Notebooks**, then **New notebook**, name it `BREACH`, and add the five files as references. Every chat in this notebook now knows the game. (No Notebooks in your app? Then attach `01-context-brief.md` and `04-return-format.md` to the first message of each new chat instead.)
3. **Pick the model.** In the model menu, choose **Opus 5.5** (or the newest ChatGPT reasoning model) for design work.
4. **Run P1.** Copy prompt P1 from `02-prompt-pack.md`, fill in what felt wrong in the APK, paste it. Answer its "Decisions for the owner" with your picks, then type `locked`. Copy the final answer and paste it in the BREACH project chat, starting with `Copilot drop: breach-powerups-powerups-round2-v1.md`.
5. **Run P2** in a new chat in the same notebook, the same way. Then P5 with 4 to 10 APK screenshots attached, and P6 in the **Researcher** agent.

**Images:** open a new chat, attach 2 or 3 pictures from `prompt-library/examples/` (see its `INDEX.md`), paste the image prompt from an answer's "Art requests" or from `prompt-library/`, ask for 3 variants. Download the best as PNG and send it in the project chat.

## Part B: Copilot Studio (set up once, about 10 minutes)

1. Open **copilotstudio.microsoft.com**, choose **Create**, then **New agent**, then the **Configure** tab.
2. **Name:** `BREACH Design Studio`. **Description:** copy it from `03-copilot-studio-agent.md`.
3. **Instructions:** paste the "Instructions" block from `03-copilot-studio-agent.md`.
4. **Knowledge:** choose **Add knowledge**, then **Upload file**, and add the files in its table (if a `.md` file is refused, rename it to `.txt`).
5. **Model:** in **Settings**, choose the strongest model offered (Opus or the newest ChatGPT reasoning model). Turn on general knowledge.
6. **Suggested prompts:** add the six from `03-copilot-studio-agent.md`.
7. Choose **Create**. In the test pane, type `What are the rules you must never break?` It should list BREACH's rules.
8. **Publish** to the **Teams and Microsoft 365 Copilot** channel. The agent then appears inside M365 Copilot, and you can just type `Run P3`.
9. Optional: make a second agent, **BREACH Critic**, with the short instructions at the end of `03-copilot-studio-agent.md`. Paste any answer into it before sending it to Claude. It replies PASS or FIX.

## Every time

Copilot designs, you pick and say `locked`, you paste the answer here as `Copilot drop: <file name>`, and Claude builds it and sends screenshots.
