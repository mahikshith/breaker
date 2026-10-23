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
2. **Start a new chat** and attach `01-context-brief.md` and `04-return-format.md` with the paperclip. Do this at the start of every new chat. (Notebooks did not work on the owner's licence, 2026-10-23.)
3. **Pick the model.** In the model menu, choose **Opus 5.5** (or the newest ChatGPT reasoning model) for design work.
4. **Run P1.** Copy prompt P1 from `02-prompt-pack.md`, fill in what felt wrong in the APK, paste it. Answer its "Decisions for the owner" with your picks, then type `locked`. Copy the final answer and paste it in the BREACH project chat, starting with `Copilot drop: breach-powerups-powerups-round2-v1.md`.
5. **Run P2** in a new chat, with the two files attached again, the same way. Then P5 with the two files plus 4 to 10 APK screenshots attached, and P6 in the **Researcher** agent.

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

## Part C: comparing models (same prompts, different models)

Goal: run the same prompt through several models and let Claude compare the answers. Fairness rules: same prompt text, same files, a fresh chat each time.

1. Set up the Copilot Studio agent once (Part B). It holds the instructions and files, so every model gets exactly the same context.
2. Pick one prompt to compare, for example P1. Use the **same filled-in prompt text** (including your APK notes) for every model; keep it in a note so you paste the identical text each time.
3. In Copilot Studio, open the agent's **Settings**, choose the model (for example Fable), and save.
4. In the test pane, start a **new conversation** (the refresh button), then type `Run P1` and paste your APK notes. Do not answer its decisions yet; copy the first answer exactly as it came.
5. Repeat steps 3 and 4 for each model you want to try. Then run the same prompt in M365 Copilot chat with Opus 5.5 (Part A).
6. Paste all the answers here in one message per answer, each starting with `Copilot drop: <file name>-<source>`, for example `breach-powerups-powerups-round2-v1-studio-fable.md` or `...-m365-opus55.md`.
7. Claude compares them: which numbers differ, which ideas only one model had, which broke a rule, which JSON is buildable. Then you lock the best one (or a mix) and Claude builds it.

Why one prompt per conversation, even with a big context window: answers get vaguer and start mixing tasks in very long chats, and a fresh chat is the only fair comparison. When a prompt builds on an earlier one (P8 uses the P7 level, P2 uses the P1 power-ups), paste the locked earlier answer into the new chat first.

## Every time

Copilot designs, you pick and say `locked`, you paste the answer here as `Copilot drop: <file name>`, and Claude builds it and sends screenshots.
