# BREACH: environment, connections, skills, memory, UI/UX rules

**Current implementation (2026-10-19):** The owner approved heavy rounds and three-shot salvos, per-ship colours, left/right/paired/rest batteries, stronger player fire, Vesper/Latch for Circuit, a new power chooser and difficulty tuning. These changes are implemented on `codex/space-combat-apk`. The owner subsequently delegated remaining design decisions and requested a new princess/Yeti encounter, full documentation, commit/push and an APK. Frost Warden is integrated and locally verified as the fifth chapter; Brum remains an ally. Read `docs/CONTINUE_HERE.md`, `docs/SPACE_COMBAT_HANDOFF.md`, `docs/BRUM_LEVEL_PLAN.md` and `docs/MOBILE_PREVIEW.md` for current mechanics and verified release status. Older review gates and localhost checkpoints below are historical. No new CI success is claimed until recorded in the release document.

**Historical cannon correction before implementation (2026-10-19):** The owner rejected the4189 weapon studies. Enemy cannon fire must cross the intact brick field and threaten the paddle/craft, without breaking bricks or releasing their rewards. Carrier currently damages enemy-hit panels; Circuit/Forge currently absorb shots on cover. These behaviours must change in the approved implementation, while preserving player brick collisions and keeping Carrier boarding threats active. Circuit's centre is an exit iris, with no suction mechanic; the replacement presentation keeps it quiet until departure. The revised cannon comparison is at4190, stronger friendly skiff deployment/fire at4191, and reference-backed distinct companion proposals are recorded alongside them. See `design/phase1/weapon-vfx-v3-review.md`. The4188 playable checkpoint remains unchanged; visual approval is still required before implementation, commit/push or APK work. The previous4189 quality receipts certify only that historical study, which is now rejected.

**Replacement weapon motion review (2026-10-19):** The rejected Hard boards are superseded by two moving visual candidates at <http://127.0.0.1:4189/>: A Magnetic breacher and B Reactor rupture. Both use original cannon/ship art, complete rendered charge clips and actual machined payload PNGs, with distinct launch/recoil/travel and staged source-panel impact. The initially regular B fracture was revised to five unequal jagged metal pieces. Independent review covers12 family/phone/cannon combinations,132 phase PNGs, controls and full cycles with zero browser/network errors. All14 protected source/build hashes and four served4188 routes remain unchanged. Final movies decode at1240x1000 /5.209s with distinct frames. See `design/phase1/weapon-vfx-v2-review.md`, permanent candidate media in `design/phase1/weapon-vfx-v2/review/`, and `out/weapon-vfx-v2/qa/final/QA.md`. The734-file archive preserves candidates and rejected drafts. These are visual studies; owner approval still gates gameplay, tuning, commit/push and APK work. Desktop timings/memory are not handset performance admission.

**Current selected effects and power limits (2026-10-18):** Ship A magnetic extraction/plasma and Kit B single-row Quick Volley are implemented in the4188 review hub. Kit offers real Brick Ward, Arrows, canonical Cosmic and Ball Fan while retaining the face control. All three space levels use slower18/22/26 banked hit/active-second charging. Companion casts and ball pickups now obey mode caps:12/9/5 live balls,2/2/1 simultaneous Cosmic,20/18/14 maximum remaining special seconds. Saturated choices keep charge. All196 units,24 actual Main phone/mode cases (including66 Kit check groups), required polish/layout and compact mobile UI pass with zero page errors. Six coarse earned Easy attempts win with3lives; they are not human balance. Exact builds, screenshots and receipts are sealed in `out/space-selected-review/final-report.json`. The owner rejected both subsequent Hard laser/lance/battery boards as stale and visually mismatched. Their replacement is an isolated moving weapon study using the original cannon art and new rendered payloads; gameplay implementation remains explicitly withheld until the owner approves the visuals. Current normal plasma still uses the existing3.5u collision core. See `design/phase1/space-selected-review.md`. Older4186/4187 and the delivered APK are unchanged; no new gameplay commit/push or APK is implied.

**Historical pacing revision before the selected FX/Kit build:** The owner finds the six-hit space-power revision too short. All three space levels now bank18/22/26 ordinary damage credits and fill the orb over at least18/22/26 active combat seconds; shots/cosmic balls cannot recharge themselves. WIDE stacks width and time, other positive durations add, ball fan adds ordinary survivors, and canonical cosmic artwork is restored. Actual paddle artwork now widens with its collider while preserving chrome ends. The pacing-only hub is127.0.0.1:4187; older4186 and the APK remain frozen. Three level owners supplied earned Easy routes and native render proofs; scripted durations are not human balance. All183 units, final18 Main phone/mode cases, required polish/layout and compact mobile UI pass with zero page errors; exact artifacts are sealed in `out/space-polish-review/final-report.json`. Two ship-effect proposals and two Kit menu proposals have been shown, with owner picks still pending. New suction/cannon FX and live Kit power choices are therefore not yet built. See `design/phase1/space-polish-review.md` for rules, receipts and limits. No commit/push: the latest message both authorizes push and then asks to wait; resolve that after the complete result is reviewable.

**Historical six-hit space revision (superseded by the current pacing revision):** The owner rejects the earlier Circuit/Forge Easy balance as a precision/patience grind. New review candidates retain the selected visual families but provide broad mothership damage, equal-sized coloured panels, fewer grey pieces and Nix in all three space levels. Six productive ordinary damage contacts earn a paused three-choice picker: ten-second LASER, ten-second UNSTOPPABLE, or fill the live set to5 ordinary balls. Shots/TITAN do not self-recharge. Closed Forge machinery takes damage; Circuit drops the ordered-symbol gate and retains an earned skiff burst; ordinary ship metal hits remain productive. Carrier retains crew urgency and uses a curved connected tractor beam and matching pull. Shared input resets prevent stale taps/Space from launching; pause Retry stays. New browser review hub is127.0.0.1:4186, with all three modes per level; older4184/4185 and the delivered native APK stay frozen. All171 tests and the local build pass. Final18 actual Main CDP cases cover three levels ×three modes ×both phones, with visible Nix, choice/cancel, frozen clocks, powers, pause and Retry; zero page errors. Required polish/layout and compact mobile UI pass. Exact final artifacts are Carrier9f772abdf382, Circuit983c8c0328d0, Forge7c8df65c5f23; sealed hashes, gallery and receipts are in `out/space-power-review/final-report.json`. Circuit/Forge coarse Easy public-input-assisted completions with earned choices are separate evidence, not human balance. Carrier curved-motion media is explicitly staged. Full rules and receipt links: `design/phase1/space-powers-review.md`. This supersedes earlier balance/target rules, not the approved artwork. No gameplay commit/push or new APK approval.

**Artwork preservation:** `artwork-library/` now preserves750 unique originals/asset records (770 source aliases/versions, 288042628 bytes), with a complete catalogue, full SHA256 manifest and preserved A/B/C/D space-board gallery. See `docs/ARTWORK_LIBRARY.md` and `artwork-library/README.md`; AGENTS.md links the folder and requires `python tools/archive_artwork.py` after adding artwork. Copies are byte-exact, duplicates share one copy, and changed sources create new versions; historical rejected concepts remain labelled. Working manifests/render scripts stay at their existing paths. The archive is local until an approved push or separate backup.

**Historical selected space reviews (superseded by later owner difficulty feedback):** Owner-selected Circuit Breakout Level2 and Shutter Forge Level3 are now actual-art playable isolated candidates. Circuit HTML `9115383E4F4963F86C11A7063A07A50B10FC1B7347F5425AC4C972D39202FDCE`, sourceEEB862BC…, is served at127.0.0.1:4184/circuit.html?level=1&difficulty=medium. Forge HTML `E8F06046E4B224C1EF790F59F4124661583ABC1F5D141583ED0B44A46118F97F`, source89B1E8A1…, is served at127.0.0.1:4185/forge.html?level=1&difficulty=medium. Both use fresh Main controls, house fonts, real Resume/Retry/Menu and semantic result titles; previews have no companion/pilot/captive art. All147 configured tests pass, including20 independent new-level regressions. Both packed previews pass actual Chromium phone-size touch, pause, Retry, geometry and visual checks with zero page errors. Circuit earned runs win50.2667s iPhone /28.0417s Android, three lives: both use the selected intrinsic flight burst, Android also naturally collects SPLIT/LASER. Forge strict ordinary completions are162.88s iPhone /260.0417s Android, three lives, no optional capsule/TITAN/Continue; Android uses a legitimate wall-bank input policy. Earlier failed policies remain retained. These are scripted route proofs, not human balance or physical-device performance. Actual motion fixtures are explicitly staged. Details: `design/phase1/relay-circuit.md`, `orbital-forge.md`; independent review: `out/next-level-review/REVIEW.md`; phone galleries: `out/selected-levels-review/`. Human screenshot/play OK is still required before gameplay commit/push, permanent registry admission or a new APK. Existing frozen F8EB pause-Retry checkpoint4183 and delivered APK remain unchanged. The final local `npm run build` also passes at `EB70331AD2A520D35E9DFB0EDF4F6539D68CD455ACF814D70920061D7B780547`; it includes the shared no-core charge guard but retains only the existing two menu levels. Phone review receipts belong to their exact frozen previews above, not an untested new APK.

**Pause Retry checkpoint (2026-10-18):** Owner explicitly requests Retry inside pause. Current Main uses the existing fresh constructor on the same level/difficulty; Continue/ad/result/input state and the frame origin reset while saved stars/preferences stay intact. Three stacked Resume/Retry/Menu buttons fit both phone safe areas. Two independent regressions and12 real CDP cases (Carrier/Vault ×three modes ×both phone sizes) pass with zero page errors on exact HTML SHA256 `F8EB9BE20BDD854546944BF941CBB139FE97887505094A46B33732FAA6ECB9E0`. Frozen review is `out/pause-retry/browser/breach.html`, served at127.0.0.1:4183/breach.html?difficulty=medium. Evidence: `out/retry-review/final/report.json` and `out/retry-review/REVIEW.md`. This proves the two existing menu levels; selected Circuit/Forge will need the same real-input checks after their isolated build is ready. No new gameplay commit/push or APK change.

**Owner human balance feedback (2026-10-18):** The owner finds earlier BA5E Carrier too easy and Vault too hard, then selects a MIX of boosted retreat and finite rebuilding siege. That choice is implemented in the new review candidate; the old pure A/B choice is closed. Easy/Medium/Hard share controls and the lower reaction lane. Vault locomotion/chew multipliers are0.60/0.80/1.00; warning, venom, cage and ball/input timing stay intact. Hard Carrier is a development setting pending calibration, not approved balance. No new gameplay commit/push approval has been given.

**Latest selection and tested candidate (2026-10-18):** Production HTML SHA256 `19376ED445F4D89CEA02CFF8733A5255DA14FD275DA3CAD9798155AA64516AA1` adds the selected hybrid to Boarding Raid: finite distinct manifests, active per-manifest jump clocks, permanent archived rescues, six-contact manual Nix, larger target-facing fighters, visible hull motion/engines, safe rebuilding and final boosted retreat or disabled cleanup. All128 units pass. Production two-phone real-input lifecycle checks, required polish/layout and compact mobile UI pass with zero page errors. Separately sealed isolated HTML `4F808C2A682885F6415325CBC89B064D63939FF277912ABD859D5AD048BC457D` uses identical gameplay source plus embedded fonts/read-only trajectory planning. At120Hz public level input, ordinary Easy wins40.400/42.700s; Medium ten-rescue wins109.725/125.600s, three lives, no pickups/Nix/Continue. These are scripted route proofs, not human balance, DOM routing or performance proof. Hard75s/8.5s has no strict ordinary full-clear admission; failed attempts and an unadopted90s/10s experiment are preserved. A separate bounded earned-Nix proof readies at8.667/12.325s with nine authored rescues remaining; iPhone cast run wins, Android cast run disables the hull then controller-times-out in cleanup, not a victory (`out/carrier-hybrid/nix-earned-report.json`). Primary changes remain uncommitted pending owner play/screenshot OK. Evidence: `out/carrier-hybrid/evidence.json`, `out/hybrid-review/production-decoded/report.json`, `out/carrier-hybrid/mobile-ui/report.json`. Earlier BA5E and4181 remain frozen history.

**Parallel levels authorized (2026-10-18):** The selected Circuit A and Forge A mechanics, source-faithful machinery families, actual moving collision and independent phone reviews are delivered as described above. Escort Run B and Orbital Switch B remain distinct later directions, numbers unassigned. Original B/C rescue prototypes are historical; selected design/source geometry and collision are authoritative now. The C lower hull lip remains physical: Forge uses its visibly deployed exterior reactor. Circuit uses four empty phase stations, real split-metal firing ports and one earned skiff burst; Forge uses three timed stabilisers, collapse, once-only ordinary three-ball reward and quiet external-reactor finish. No extra cast or permanent registry/progress migration is included. All new gameplay remains uncommitted pending owner approval.

**APK checkpoint delivered (2026-10-18):** Separate `codex/carrier-mobile-preview` CI [39129140498](https://github.com/mahikshith/breaker/actions/runs/39129140498) completed successfully on native fix47bc6b3. Actual APK artifact12137681701 is downloaded and verified at `../breaker-mobile-preview/out/carrier-apk-delivery/39129140498/apk/BREACH-Carrier-preview.apk` (2,431,097bytes, SHA256 `7F5468197BB6333BF5AACEBE4CF4226048D043634BCA8829B6644042C4F2E10D`). Web44units/six suites, native build/lint and lifecycle instrumentation pass; actual recreation captures show full1080×2400 content. Frozen gameplay F4863DC5… and packaged HTML4D5D7B5E… remain exact. Delivery documentation commitf72e7ccf follows tested47bc6b3 and is pushed as the owner. APK excludes Boarding Raid, Nix/Tick, difficulty/hybrid and B/C. Physical phone performance remains for owner testing. This checkpoint authorization does not approve primary gameplay commit/push or merging main.

**Current production scope (2026-10-18):** Carrier A retains its approved independent hull/hangar, guns, fighters, panel crates, five shallow captive windows, full-screen background and125×17u paddle/7.5r ordinary ball. Boarding Raid supplies the adversary/crew stakes and manual Nix; Tick secures real released identities in0.8s. Exact rules, ordinary completion and limits are in `design/phase1/carrier-urgency.md` and `carrier-companions.md`. Vault retains70×12u/default6r and exclusive Kit. Main now supports a real Resume overlay and freezes active clocks on pause/background without releasing held aim. New browser candidate is reviewable at127.0.0.1:4181/boarding.html?level=1; frozen checkpoint remains on4180. No new gameplay commit/push/APK inclusion before owner OK. B/C stay isolated, D and other cast/progression remain later work.

**Historical A/B asset milestone (2026-10-18):** real independent PNG parts and the isolated Canvas motion assembly are complete for the approved A/B left playfields. Final proof is under `out/space-assets-ab/final/`: `A-ios-reference.png`, `A-android-reference.png`, `B-ios-reference.png`, `B-android-reference.png`, `A-motion.gif`, `B-motion.gif` and `asset-report.json`. Actual 393×852/412×915 images and sampled launch/release/boarding/iris sequences pass independent visual review; all four capture runs report zero page errors, real alpha/metadata checks and approximately 126 CSS paddle reserve. A has five shallow captive windows; B has four large worker pods. This asset-only milestone contains no companions, pilots or portraits and predates the latest Nix/Tick selection. These are asset-motion proofs with a placement ball, not new gameplay: runtime admission/WebP sizing, actual-alpha collision alignment, input/combat/rescue/power rules, full playable phone runs, memory/performance and new APK checks remain. The proof milestone retains EA839F00… as its gameplay baseline; it does not cover later Carrier integration. Reproduction and limits: `art/space/ASSETS_AB.md`; inventory/contracts: `design/phase1/space-assets-ab-spec.md` and `space-assets-ab.json`.

This document covers where everything lives and how the work has been done. Any new session, from any assistant, should read all three handoff docs:

- `01-status-and-next-steps.md`: what is done, what is in progress, and the TODO list with the agreed designs;
- `02-architecture-and-pipeline.md`: code architecture, art pipeline, build, test, publish;
- this document.

**Habit (owner's request, 2026-10-18):** keep these three documents current. Update them at the end of every work session, or whenever something meaningful lands, so another session or tool can take over at any time.

## 1. Owner and working agreement

- **Owner:** mykee (GitHub `mahikshith`, mahikshith97@gmail.com).
- **Commits:**
  - author and committer must be exactly `mahikshith <mahikshith97@gmail.com>`;
  - no AI or assistant attribution anywhere (commit trailers, code, docs, README);
  - never ask for, or paste, the owner's token.
- **Show drafts as you go.** The owner wants to see draft images whenever a piece is finished, especially UX screens, characters and assets. Post screenshots or sheets for iOS and Android sizes.
- **Product feedback rules:** premium, inventive, urgent, addictive; never "vibe-coded"; expressions must say a lot; not too much yellow; keep the playful font and colours.
- **Scope:** Phase 1 is approved. EA839F00… is the last accepted/tested mixed Vault, Ward/venom/tunnel, capture/cast and compact mobile baseline; Kit remains a face-only Vault control and is absent from space. Current work is only A / Carrier Breakout with its selected Nix/Tick appearances. Character full sprite/animation families are not built; B/C/D are deferred. Preserve actual source art quality, the low paddle/reaction lane and safe areas while validating Carrier physics and both-phone gameplay. Existing A/B asset-motion proofs do not establish a new encounter/APK result. Physical-device/Safari feel and human balance remain unchecked. Parallel work uses separate ownership and independent review; new commit/push still needs owner screenshot OK.
- **Work style:** the owner explicitly requests multiple parallel helpers with separate file ownership and independent review. Show progress with images. Parallel preparation must not bypass the concept-pick or commit/push approval gates.

## 2. Where things live (connections and locations)

| What | Where |
|---|---|
| Source repository | https://github.com/mahikshith/breaker (`main` is stable; `wip/*` branches hold in-progress work). Pushed through the Claude GitHub App installed on the repo (installed 2026-10-17); any tool with push access can continue. |
| Playable build (current host) | claude.ai Artifact https://claude.ai/artifact/63xdvoxT6HPvo7rU8buR9s, published from `dist/breach-artifact.html`. Only the owner's Claude account can update it. Another tool should host `dist/breach.html` elsewhere (GitHub Pages, Netlify, itch.io…). |
| Project shared folder (Claude Projects only) | `/mnt/project-files/breaker/`: |
| | • `GAME_PLAN.md`, the original design plan, also copied to `docs/GAME_PLAN.md`; |
| | • `characters/`, character sheets and GIFs shown to the owner (snake-v2-sheet, princess-v2-sheet, robot-expressions-ingame…); |
| | • `playtest/`, playtest screenshots (v2 iOS and Android); |
| | • `lookdev/`, Blender lookdev renders: `vault-top-down.png` is the "shinier" reference, plus `vault-side-view.png`; |
| | • `drafts/`, the first screen drafts. |
| | The key reference images are copied into the repo at `docs/reference/` and `docs/drafts/` so other tools can see them. |
| Story and next-level plan | `docs/STORY_PLAN.md` in the repo. The live, editable version is a Claude Doc at https://claude.ai/code/artifact/5278a4c8-b669-4235-972f-7814c32382d9 (owner's account). A copy is in `/mnt/project-files/breaker/plan/`. |
| ChatGPT design partner | Brief: `docs/handoff/04-chatgpt-design-brief.md`. Steering prompts: `docs/handoff/05-chatgpt-steering-prompts.md`. Art scripts bundle: `docs/BREACH-blender-scripts.md`. Single upload file: `docs/BREACH-ChatGPT-handoff.md`, which concatenates the brief, `STORY_PLAN.md`, `GAME_PLAN.md`, docs 01–03 and a file map. Regenerate it after editing any of those: `python3 tools/make_handoff.py`. |
| Game-dev skills | In the repo at `skills/gamedev/` and `skills/ponytail/` (also `/mnt/project-files/skills/`). `AGENTS.md` says which skill to read for which kind of work. |
| Assistant memory (Claude Projects) | `/tmp/claude/memory/team/silo/MEMORY.md` (index) and `breaker-project.md` (project facts, rules, art direction). Their content is summarised in this document. |
| Third-party assets | KayKit Adventurers (CC0) GLB models in `assets/models/`. Fonts: Google Fonts Lilita One and Rubik (OFL). Everything else is original Blender renders or code. |
| Network notes | npm and raw.githubusercontent.com were reachable from the build container; many asset websites were blocked, which is why the art is rendered rather than downloaded. |

## 3. Tools and skills used

### Tools

| Tool | Version / use |
|---|---|
| Node | 22, plus esbuild 0.28 (bundler) and planck 1.5 (Box2D debris physics) |
| Python | 3.13 for bpy 5.2.2 (Blender as a Python module, Cycles CPU), Pillow and numpy. Python 3.11 cannot install the pinned bpy release. |
| Playwright + Chromium | Automated playtests and screenshots at phone sizes |
| git / GitHub | Version control. Commits use the owner's identity. |
| claude.ai Artifact | Hosting the playable build for the owner |

### Local Windows setup (2026-10-18)

- Fresh checkout: `C:\Users\mahik\Music\Breach\breaker`, starting at `9c74978`, branch `codex/phase1-kit`. The initial checkout is preserved beside it as `breaker-initial-clone`.
- Git 2.55.0, Node 22.23.3 and Python 3.11.16 are installed. The existing Node 24 and other Python versions remain available.
- Art uses a separate Python 3.13.13 environment based on the installed Blender 5.2.2 runtime. bpy 5.2.2 requires Python 3.13 ([package metadata](https://pypi.org/project/bpy/5.2.2/)); Python 3.11 remains available for other tooling.
- Playwright and Chromium are installed outside the repo. No game dependencies were added or changed.
- Planck 1.5.0 declares Node >=24. Node 22 emits an engine warning, but the build, all five unit tests, and the baseline layout/polish checks on both phone sizes pass. Keep this warning visible when diagnosing future Node failures.

For a PowerShell session using the installed tools:

```powershell
$taskTools = Join-Path $env:LOCALAPPDATA 'Programs\breach-tools'
$env:Path = (Join-Path $taskTools 'node-v22.23.3-win-x64') + ';' + $env:Path
Set-Alias python3 (Join-Path $taskTools 'python313\Scripts\python.exe')
$env:PW_MODULE = ([Uri](Join-Path $taskTools 'playtest\node_modules\playwright\index.mjs')).AbsoluteUri
$env:PYTHONUTF8 = '1'
```

`PYTHONUTF8` lets the handoff generator read and write the Unicode Markdown correctly on Windows. Baseline screenshots are under `out/baseline/`.

### Game-dev skills

These skill guides were saved in the project at `/mnt/project-files/skills/gamedev/`. They are plain Markdown and can be pasted into any assistant.

- **Used heavily:** `game-ui-ux`, `game-feel` (juice, hit-stop, shake, feedback), `input-systems`, `physics-tuning`, `level-design`, `create-game-assets` (art direction brief, asset manifest, preview sheets), `audio-design`, `prototype-fast`, `performance-optimization`.
- **Available but not used** (the stack is plain Canvas 2D): `phaser-core`, `phaser-arcade-physics`, `pixijs-rendering`, `shader-programming`, `procedural-gen`, `puzzle`.

**Ponytail** (`/mnt/project-files/skills/ponytail/`) is a lean-code guide: plain modules, no framework unless needed. That is why the game is vanilla JS and Canvas.

## 4. UI/UX layout and rules followed

### Screen layout (portrait, world 360 units wide)

```
┌──────────────────────────────┐  ← notch / Dynamic Island: scene art continues underneath (drawTopInset)
│ [II]  LEVEL METER        SCORE│  slim bar right under the status bar/notch: pause, level meter, score; the playfield is lifted (LIFT=34) to start just below it
│                    COMBO ×n   │
│   ┌──────────────────────┐   │
│   │   PLAYFIELD (bricks, │   │  Invasion: formation + mothership; Vault: tower, cage, serpent
│   │   characters, ball)  │   │
│   └──────────────────────┘   │
│        ═══ PADDLE ═══         │  paddle raised to H - clamp(0.25H,150,210): never under the thumb
│  ~ shield line ~ drain line ~ │
├──────────────────────────────┤  control deck (dark panel): drag here; track + grip shows paddle position
│   ─────────[ grip ]───────    │
│ ●●●  [FIRE][LASER]   AIM ▮▮▯ │  lives, active power timers, AIM pips
└──────────────────────────────┘  ← home indicator: scene extends underneath
```

### Interaction and UX rules

- **Movement:** relative drag anywhere (gain 1.15). The finger never needs to touch the paddle or cover the ball.
- **Serve:** "Slide to aim · lift to launch", with a dotted predicted path that shows the first bounces.
- **Focus aim:**
  - holding the thumb still when a ball lands catches it, if there is an AIM pip;
  - "CATCH READY" brackets show that it is armed;
  - time slows to 0.25×; slide to aim, lift to fire; there is a 1.6 s limit, shown as a ring;
  - a coach bubble teaches it until it has been used 3 times.
- **Titan core:** a gem in the paddle centre fills as you break bricks. When full it blazes, and a dead-centre hit makes a TITAN ball.
- **Power-up capsules:** glossy pills with labels. A bad power-up (TINY) has a flashing red outline.
- **Feedback:** every hit gives sound, a small shake and particles. Big moments add hit-stop, haptics, slow motion and big text pops (BREACH!, TITAN!, FRENZY!).
- **Danger:**
  - a red pulsing vignette and heartbeat sound as the serpent closes in or the formation nears the line;
  - the HUD meter turns from green to amber to red.
- **Clarity:**
  - single broken bricks crack and fade in about 0.4 s;
  - only big crashes leave physics debris, so nothing is mistaken for the ball;
  - backgrounds stay calm and dark, because the owner found the Invasion hangar too flashy.
- **Edge to edge:** the scene art fills behind the status bar and home indicator. UI never sits inside the insets. The playfield starts directly under the slim HUD bar, with no dead band. Backgrounds must never outshine the foreground.
- **Safe areas and inputs:** safe areas respected; 44 pt minimum touch targets; nothing interactive in the top corners except pause.
- **Menu:**
  - a BREACH logo (gradient Lilita One with a thick outline) over floating glossy bricks;
  - two level cards with live previews of the level, a character peeking out, star ratings and number badges;
  - a sound toggle.
- **Results card:** title, stars that pop in with sound, score lines, and Retry/Next or Menu/Try again buttons.
- **Continue card (to build):** reason for the loss, a countdown ring, "▶ Watch ad · Continue", "Unlock full game · $2.99", and "No thanks". See doc 01, item 4.

### Typography and colour

- **Fonts:**
  - Lilita One for all game text, drawn via `text()` with a dark outline (0.16 × size) and drop shadow;
  - Rubik 600 for the score.
- **Palette:** the full table is in doc 01, section 4.
  - Backgrounds are deep navy and indigo (`#0a0c18` to `#22284a`).
  - Accents per level: Invasion pink `#ff5d8f`, Vault gold `#f4c542`.
  - AIM is lilac `#e3b6ff`, danger is `#ff4d5e`, success is `#7bd88f`.
