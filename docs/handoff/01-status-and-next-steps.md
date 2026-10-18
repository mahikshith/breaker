# BREACH handoff 1/3: status and next steps

**Latest selection and tested candidate (2026-10-18):** Only A / Carrier Breakout is active; Nix/Tick appearances are selected, but their full expressive sprite/animation families and runtime cast integration are not built. B/Relay Raiders, C/Orbital Breakout and D/Eclipse Rescue are deferred. The playable Carrier web candidate is SHA256 `F4863DC5A87D6B46A8A1AFDB702C264F432196B851B61B828946DB8AB75A0423`. It passes 44 unit tests and both-phone bundled gameplay/visual checks. Independent final captures at 393×852 safe59/34 and 412×915 safe32/24 preserve the approved A art, continuous safe-edge starfield, aligned 125×17u paddle and clean settled results, with zero page errors. Public-input assisted deterministic simulated wins record 82.3s iPhone / 45.2s Android of game clock; these do not establish human balance or physical-device performance. Evidence: `out/carrier-playable-final/report.json` and `out/carrier-visual-final/REVIEW.md`. The owner has requested an APK; packaging/native CI and delivery remain pending. No APK pass is claimed. EA839F00… remains historical accepted baseline evidence; the older A/B Canvas tranche remains asset-only history.

**APK checkpoint authorization (2026-10-18):** The owner explicitly requests the APK. This authorizes the necessary checkpoint commit/push and CI on `codex/carrier-mobile-preview` in the existing isolated `breaker-mobile-preview` worktree, using the exact frozen Carrier/current Vault sources and native immersive fix. Primary `codex/phase1-kit` is preserved. No merge to `main` or pending Nix/Tick companion-family admission is authorized. APK/native CI remains pending; the earlier screenshot-approval notes do not block this specific APK checkpoint.

Read all three handoff docs before touching code: this one (status, rules, TODO with agreed designs), `02-architecture-and-pipeline.md` and `03-environment-skills-ux.md`. Keep them updated at the end of every session. Historical sections include the original `wip/polish-pass` snapshot (`main` @ b5df0eb); current work and the newest progress entries take precedence.

**Current work:** `codex/phase1-kit` holds the final tested Carrier web candidate. The owner requests an APK; root is packaging it on `codex/carrier-mobile-preview` in isolated `breaker-mobile-preview` and running native CI under the APK-only checkpoint authorization above. Final art/phone geometry/results checks pass; full Nix/Tick sprite/animation production and runtime cast integration remain pending. B/C/D stay deferred. Preserve Vault-only Kit and the established controls. Owner device play/review remains the next evidence after CI; no APK completion is asserted yet.

**Historical A/B asset milestone (2026-10-18):** real independent PNG parts and the isolated Canvas motion assembly are complete for the approved A/B left playfields. Final proof is under `out/space-assets-ab/final/`: `A-ios-reference.png`, `A-android-reference.png`, `B-ios-reference.png`, `B-android-reference.png`, `A-motion.gif`, `B-motion.gif` and `asset-report.json`. Actual 393×852/412×915 images and sampled launch/release/boarding/iris sequences pass independent visual review; all four capture runs report zero page errors, real alpha/metadata checks and approximately 126 CSS paddle reserve. A has five shallow captive windows; B has four large worker pods. This asset-only milestone contains no companions, pilots or portraits and predates the latest Nix/Tick selection. These are asset-motion proofs with a placement ball, not new gameplay: runtime admission/WebP sizing, actual-alpha collision alignment, input/combat/rescue/power rules, full playable phone runs, memory/performance and new APK checks remain. The proof milestone retains EA839F00… as its gameplay baseline; it does not cover later Carrier integration. Reproduction and limits: `art/space/ASSETS_AB.md`; inventory/contracts: `design/phase1/space-assets-ab-spec.md` and `space-assets-ab.json`.

## Progress log (newest first)

- **2026-10-18 (complete native preflight before third Carrier run).** Run39123471388 passed web/build/lint but failed a status-bar assertion after a one-frame hidden sample. Read-only independent review covered the complete Activity, native test, workflow and frozen packager. The test now waits500ms of focused/attached stable bar state, snapshots native geometry/insets on one UI turn, and asserts on its own thread with phase names. It captures failures before scenario close; the shell runner always preserves screenshots/logcat/window evidence and the original failure exit. The Activity detaches its WebView before destroy; a held-touch stop/resume case checks cancelled input, paused game time, same level and restored fullscreen. No bar/gameplay assertion is removed. The actual offline packaged HTML additionally passes both-phone Carrier suites locally (82.3/45.2s assisted earned wins),44 unit tests, source/packaged hash guards and native raster/font probe. Shell exit handling passes four failure/success combinations. CI will repeat the offline suite, compilation/lint and all native checks; no native pass or APK delivery is claimed yet. The same packaged build is served locally on127.0.0.1:4180/breach.html?level=1 and opened for owner play. Gameplay F4863DC5 and packaged4d5d7b5e remain unchanged.

- **2026-10-18 (native CI failure diagnosed; fresh run prepared).** Carrier run39122761324 passed44 unit tests, all browser suites, frozen packaging, Android compilation and lint (0 errors,9 preview warnings). Native input failed because an Android launcher ANR dialog owned the touch target: `InputDispatcher` records `Application Not Responding: com.google.android.apps.nexuslauncher`. No game/native assertion was removed. The test emulator now stops that background launcher and acknowledges the system immersive hint before instrumentation; the smoke test explicitly awaits document focus before native touches. F4863DC5 gameplay bytes and offline packaged4d5d7b5e hash are unchanged. APK publication remains gated on a fresh complete CI pass.

- **2026-10-18 (Carrier A playable candidate passes final web checks; APK requested).** Build `F4863DC5A87D6B46A8A1AFDB702C264F432196B851B61B828946DB8AB75A0423` passes 44 unit tests and real bundled two-phone gameplay checks. Public-input assisted deterministic simulated wins record 82.3s iPhone/two lives and 45.2s Android/three lives of game clock (`out/carrier-playable-final/report.json`), not human balance. Independent final captures in `out/carrier-visual-final/` confirm approved A hull/barrels/doors/fighters/panel bricks/paddle/ball, continuous top/bottom safe-area starfield, paddle alpha/collider alignment below 0.006 CSS px at both tips, and clean settled results with no frozen Carrier effects. All 147 images and both house fonts decode; zero page errors. Carrier uses 125×17u paddle, 7.5r ordinary ball and 10r TITAN; Vault keeps its prior dimensions and exclusive Kit. Nix/Tick appearances are selected, but full expressive sprite/animation families and live cast integration remain pending; B/C/D are deferred. The owner asks for an APK, authorizing its necessary checkpoint commit/push/CI on isolated `codex/carrier-mobile-preview` without merging to main. Packaging/native CI is underway; no passed APK or physical-device performance is claimed.

- **2026-10-18 (Carrier A cast Nix/Tick selected; gameplay integration pending).** After choosing only A / Carrier Breakout for current work, the owner explicitly selects its Nix/Tick character designs. This supersedes the same-day cast-open note below; B/C/D remain deferred. The appearances are approved, not completed expressive sprite/animation families or live cast integration. Build A from the actual reviewed assets, preserve their exact visual quality and validate robust physics/collision with playable iPhone/Android runs. Compare real gameplay captures beside the A board and asset-motion preview. EA839F00… remains the last accepted/tested baseline until the new candidate passes; no new gameplay/APK pass or commit/push authorization follows from this selection.

- **2026-10-18 (Carrier Breakout selected for current work).** The owner chooses A / Carrier Breakout for now and defers the other space directions. Its visual preview is accepted for continued implementation. Character artwork is liked, but the cast remains undecided; a ship/level choice must not automatically admit Nix/Tick or any other companion. Continue only the A playfield and machinery. Existing B assets/proofs are preserved as deferred work; C/D remain later possibilities. The A/B asset-motion milestone below remains valid history. No new runtime integration, phone gameplay/APK result or commit/push authorization follows from this direction choice.

- **2026-10-18 (A/B left assets and motion assembly complete).** Delivered the reference-matched independent PNG tranche and deterministic Canvas presentation proof for CarrierA and RelayB. Final `out/space-assets-ab/final/` includes both-phone reference PNGs, A/B motion GIFs and native release diagnostics. Independent image/sequence review confirms five shallow A captive cells versus four B pods, source-specific A panels/flat paddle, dim edge planets, clear header/lower paddle, bay launch and continuous side departure, front-door release/boarding and opened portal. No companion/pilot/portrait was added. The report covers 31 manifest part entries with no missing paths, zero page errors in all four 393×852/412×915 runs and~126 CSS reserve; metadata/alpha and natural-aspect checks are asset-only. Reference stencils still need alignment to actual alpha before gameplay. No new runtime encounter, WebP admission, gameplay balance, real-device performance or APK pass is claimed. Reproduction/limits are in `art/space/ASSETS_AB.md`; A/B data/spec and source records are saved. Active bundle remains EA839F00…; C/D follow and companions stay frozen.

- **2026-10-18 (all four space levels approved; A/B assets first).** The owner approves polished A/Carrier Breakout, B/Relay Raiders, C/Orbital Breakout and D/Eclipse Rescue as levels. Immediate work is the A/B LEFT playfields, with all companions/pilots/portraits frozen. Reference inventory records A's five shallow captive windows, 16 coloured bricks and three fighters; B's four large worker pods, 30 coloured/braced modules, relay/iris and empty skiff. Source-proportional display bounds are mapped to both phone sizes in `design/phase1/space-assets-ab-spec.md`; independent files/pivots and asset-only Canvas assembly motion belong in `space-assets-ab.json`. Production and native assembly review may proceed without another concept choice. The discarded 113/97-cell proxy maps, HP and deadlines do not carry forward. No new gameplay integration, balance, build or APK result is asserted; tested runtime EA839F00… is unchanged. Historical reopened-choice entries below remain history.

- **2026-10-18 (space visuals reopened; four-board review).** The owner rejected proceeding from the native saucer-proxy studies, referred back to the polished original space boards, then explicitly requested both originals plus two fresh same-theme designs before deciding. No fish theme is automatically selected; the prior Relay Raiders pick no longer authorizes current production. Re-shown A/Carrier Breakout and B/Relay Raiders. New C/Orbital Breakout shows Nova moon-hare, Pin maintenance drone and carrier/fighter rescue; new D/Eclipse Rescue shows Zuri gecko, Flit mechanical bird and crescent dreadnought/cannon/escape gate. All four are appearance/story concepts, not finished models, native runtime screenshots or animation proof. New1536×1024 PNGs `design/phase1/img/space-orbital-c-v1.png` and `space-eclipse-d-v1.png` have empty metadata; prompts and review state are saved in `space-options-cd-prompts.md` and `space-direction-review.md`. Await the owner's board or component choice before new production. Accepted mobile geometry/input rules remain requirements; source build EA839F00… is unchanged. No new commit/push/APK.

- **2026-10-18 (expanded Invasion requested; design gate).** After reviewing the mobile baseline, the owner asks for full-screen space graphics without the framed hangar window, more purposeful brick/power content across the midfield, moving attack ships and laser beams, and something concrete to save. Prepare two native layout proposals with explicit objective, win/fail rules, earned powers and warning/recovery windows. Use space-specific Clank crew/drone rescue; keep Kit/Lumi out of Invasion and preserve the lowered paddle/reaction lane. The selected Relay Raiders direction remains relevant; new mechanics/assets still require an image pick and proof. No rescue encounter, new fighter or laser system is silently implemented.

- **2026-10-18 (mobile A baseline complete, uncommitted).** Owner selected A, then removed stage captions and the entire lower track, requested a smaller game-font score and non-blue Kit ring, and restricted Kit to the princess/Vault theme. Invasion retains its earned paddle-core Titan with no hero draw or invisible Kit tap target. Saturn was first restored, then corrected to a near-black, desaturated backdrop so foreground pieces lead. Current build `EA839F00A4683BD3CFD05CB87BDE6DA4B79EDFFF0191621362FB90A75FF9FBAC` passes26 unit tests and both-phone mobile UI/score/once-only persistence/drag/Titan/shield, Vault face/two-finger/Focus/loss/Continue, venom/capture, layout and iOS/Android polish checks. Zero page errors. Reports are under ignored `out/mobile-*-final-v2/`; actual phone review boards are `out/mobile-ui-final-v2/review-{vault,invasion}.png`. Geometry is paddle126CSS reserve, drain+20u, shield+18u, with lower clipping/culling before controls. Independent256 shield/debris/bolt/zoom fixtures passed the same geometry on the preceding UI-only build; current focused shield cases also pass. Vesper v7 model/face/Walk source proof is ready, not production-admitted.

- **2026-10-18 (spaceship audit and next APK candidate).** Existing Invasion already triggers a36HP mothership after formation clearance, eases it into view, moves horizontally, fires bombs and adds wing guns below half health. Actual motion proof and labelled last-brick/HP fixtures are in `out/invasion-dark-final/`; they do not establish an earned whole-level clear. Original Phase1 prologue/intro/taunt/decoy-and-Lumi-beam story beats remain missing. No carrier/fighter-launch sequence is claimed. The isolated APK worktree exactly reproduces current EA839F00… Windows bundle, with canonical LF hash `9ec2bdc019c018ad5109c0497c2acf0ee0501ccc9c4ebfa794470c7918730382`, offline packaged HTML hash `5dde1b121b0e8009cfa3f049e419f55b7aabd7edaeac146fa0c2334192e2adf8`, version0.2-preview/code2, native immersive bar/cutout/gesture handling and stronger full-window/safe-inset/recreation/transient-bar assertions. Browser inset injection passed fractional-DPR stability checks; native compilation/emulator tests have not run. This candidate and CI updates are local, not committed/pushed/published. New space expansion is excluded until selected/built/reviewed.

- **2026-10-18 (physical-phone layout feedback; proposals only).** The owner found the paddle too close to bricks and the screen cluttered. Move the paddle/support as low as safely possible; move lives/AIM into the top HUD in both modes, retain only Kit at bottom left plus necessary paddle input, remove moon, heavy deck/top panels and repeated drag/slide/catch instructions, and use the game's playful score font. At most one short `Aim ready` on the first actual catch/press. Android must hide system bars while preserving cutout/gesture safety for controls. Two actual-asset Canvas layout proposals share a126-CSS-pixel paddle reserve. This lowers the paddle73.14px on393×852 iPhone and98.36px on412×915 Android; fastest vertical TITAN return from the Vault bottom row grows from.251→.403s and.346→.541s. These geometric windows do not establish human comfort. Measurements and128 passing native shield fixtures are in ignored `out/control-metrics/`; proposed shield+18u must remain inside drain+20u, with debris/drop/bolt control clipping. Invasion danger remains64u above its actual paddle, deliberately adding22.71/27.25s of untouched-formation march time. No speed or Vault clock retuning. Native immersive Activity/test changes are local in the APK worktree and still need Android CI. Image pick, implemented phone screenshots and owner OK still precede a new commit/push.

- **2026-10-18 (selected animation integration baseline).** Packed the selected16-frame spinning heater shield and12-frame unfolding brick armour, removed the connecting beam, and integrated connected patterned capture A with visible Lumi, mirrored approach anchoring and aligned grip cue. Build `CFEA2D6FF5A8FE13F2CF539FA9D9F9FDB0581EF6C4469C38961701202FC972EF` passes21 unit tests and the focused native venom suite on both phones (`out/combined-cast-capture-prelayout/report.json`): real contacts, valid/empty/missed/late/drag defence, protected cage, terminal immutability and first-use lesson. Capture has independent mirrored/defence/Continue checks; cast has early/latest/zoom and interruption checks. Final combined layout and screenshot approval remain pending. Brum's coat-v7 removes the grey band/detached fur pendants and retains continuous source face, fitted eyes and actual fists; its motion GIF is three labeled key poses, not a finished clip.

- **2026-10-18 (separate pre-Brum APK delivered).** `coding/mobile-preview` is pushed and complete [CI run39108320738](https://github.com/mahikshith/breaker/actions/runs/39108320738) is green on code085a2c6. It passes all21 unit tests, phone/Ward/venom suites, exact frozen bundle check, Android build/lint and offline Android15 native input/fonts/levels/storage test, then exports screenshots and publishes the APK. Lint0errors/9nonfatal preview warnings are documented rather than suppressed. [APK artifact](https://github.com/mahikshith/breaker/actions/runs/39108320738/artifacts/12129462604), [native evidence](https://github.com/mahikshith/breaker/actions/runs/39108320738/artifacts/12129562329). Local downloaded APK: `C:\Users\mahik\Music\Breach\breaker-mobile-preview\out\apk-delivery\BREACH-preview.apk`,1,854,545bytes, SHA256 `3e34835d9bf44f5d9c82f5f1e0be292dc79019545bf80de8827df997763842a7`; its payload/font/hash/no-network-permission boundary and actual native screenshots were checked. `main` is unchanged; physical-phone comfort/performance/audio and human balance remain unchecked. New Kit/capture/Brum/Relay Raiders are excluded from this frozen preview and continue here.

- **2026-10-18 (new animation and space choices).** The owner selected Kit cast **A / spinning shield unfolds into brick armour**, capture **A / connected coil with visible Lumi**, and space **B / Relay Raiders** (Vesper quadruped pilot and Latch lockfish). Begin selected cast/capture production in parallel with Brum coat refinement; keep existing defence deadlines, collision/route and accepted level unchanged. Vesper/Latch need actual geometry/expression/motion proofs before full families or encounter integration. Brum is planned as a hero/ally whose strong arms open blocked routes and protect the team, not an implemented encounter. The pre-Brum APK checkpoint remains isolated from these new changes.

- **2026-10-18 (face-only control, cast/capture restart, space and mobile checkpoint).**
  - The owner confirms the level is playable and accepts its design. Kit's face must remain the control icon throughout; the old 12-second miniature body replacement and long connecting cast trail are rejected. Native face-only baseline is `485F921A73977C325E535A3500CEA967CB00B16A63042D15110F4D2D31073DF0`; it builds and all 21 unit tests pass. The face-only control subsequently passed both phone sizes (`out/face-always-qa/verification.json`): all eight expressions, touch/Focus/two fingers, charge/Titan/continue/completion, plus Ward/venom/coach/input outcomes; each device recorded 562 face draws and zero body draws. New animation integration still needs fresh final checks after picks.
  - Prepared two isolated real rendered cast studies in `design/phase1/kit-cast-options.md`: spinning heater shield/unfolding armour or separate short guard cast/rising armour. Prepared two capture studies in `capture-options.md`: visible connected-coil hold or cartoon intake/gulp. Neither is active production. Preserve the existing attack cancellation window, Continue and accepted geometry. The current capture defect is a head-centre/princess overlap with live pacing and lingering debris, not a missing level rule.
  - The owner requests parallel space story/cast/ship/cannon animations, plus Brum's dedicated strong-arm brick-smash levels and escalating difficulty. Two space boards are `img/space-carrier-a.png` and `img/space-relay-b.png`; selection is pending. Brum remains the selected first model proof, not a completed family or playable encounter. New difficulty and paid-power systems are proposals; levels should remain winnable with earned tools and readable counterplay.
  - The owner explicitly authorizes a new `coding/` branch, push and Actions APK artifact of the reviewed pre-Brum milestone while this work continues. Created `coding/mobile-preview` in an isolated sibling worktree and reproduced exact old Windows build `3A6B8A8C5368364AFCFCE6BBF7B1994D4598C121C90B45B72FE5BD7E45285EC1`. Its packaging/workflow and CI outcome are documented in that branch's `docs/MOBILE_PREVIEW.md`. This exception supersedes the usual prefix/commit gate only for this checkpoint; `main` is unchanged. New cast/capture production still needs picks and final screenshot OK.
  - Mobile checkpoint commit `bfe54b7` is now pushed with the owner's author/committer identity. Actions run: https://github.com/mahikshith/breaker/actions/runs/39106952788 . The web job passes all 21 unit tests, exact milestone packaging and phone/venom regressions; native Android compilation/emulator validation are still running. Do not claim an APK passed before that outcome. New branch: https://github.com/mahikshith/breaker/tree/coding/mobile-preview .
  - First native run stopped at a premature font-readiness assertion; the game compiled and lint passed. Fixed startup/recreation smoke readiness in checkpoint commit `8d10575`, kept font and canvas checks, and retriggered https://github.com/mahikshith/breaker/actions/runs/39107558744 . APK publication remains gated on the native pass. Current game bytes are unchanged. An existing Kit face is reused as the preview launcher icon.

- **2026-10-18 (A / left face orb integrated and tested; Brum proof selected; uncommitted).**
  - The owner selected the left face-orb board. Packed the eight existing 288-pixel face portraits and integrated a 52-CSS-pixel left orb, circular charge and 12-second expressive body windows. A valid timed Ward spends the existing Vault charge once; Invasion retains centre-return Titan. Paddle and Kit pointer IDs are independent.
  - Added the simple streaming top-tunnel entrance, masked hidden tail, real hit-triggered fury and variable spray, protected cage scope, real partition melt/collapse and actual guarded survival. A first eligible earned-full-charge warning pauses the world for a contextual tap lesson; only Kit's presentation clock advances, and the real charged cast resumes play/persists acknowledgement.
  - Independent checks found and fixed post-loss venom melting and held intro-skip release launching the serve. Tested build: `3A6B8A8C5368364AFCFCE6BBF7B1994D4598C121C90B45B72FE5BD7E45285EC1`, 2225.7 KB; all 21 unit tests pass.
  - **Final phone checks:** `out/kit-orb-final-qa/report.json` covers both levels, eight real face/body crops, touch/Focus, two-finger Kit/paddle ownership, charge preservation, Invasion Titan, presence expiry, loss/continue and seeded completion. Independent corner/cancel/out-and-back/ward-feedback checks pass in `out/kit-orb-independent/report.json`. Native venom checks in `out/venom-coach-final/report.json` cover ten full/empty/missed/late/drag outcomes, hidden/body/FIRE contacts, cage frame/18 bars, zero opening rage, terminal immutability, held pointer/Space skip and the first-use coach (five seconds frozen world, live Kit clock, real tap/resume/acknowledgement). Layout and iOS/Android polish regressions pass with no page errors. The exact build hash is unchanged after these runs.
  - **Recovery and difficulty:** the six baseline bots all lost after Vault charge became defensive. Broader aiming found a real iOS rescue at 30.04 seconds. A strategic Android run at 43.8167 seconds broke 121 bricks, used ten legally replenished Focus catches and collected SPLIT/FIRE/LASER/WIDE/SHIELD/SLOW, without grid/life/charge cheats. Its decisions are in `out/vault-strategic-android/report.json`. These prove recoverability, not tuned human difficulty; physical phones/Safari remain unchecked. Do not reuse the old three-win/three-loss result for these rules.
  - **Review media:** `out/final-review/phone-review.png` compares actual iPhone serve/tunnel and Android guarded impact; `out/kit-ability/kit-ward-motion.gif` shows actual channel, short Cheer/live response and return to face after 12 seconds. The animation uses an explicitly staged charged/two-hit fixture, not an unseeded earned run. A localhost copy of the exact build is `out/venom-prototype/game.html`.
  - **Brum selected:** new cast anatomy boards are `img/cast-v2-anatomy-a.png` and `img/cast-v2-anatomy-b.png`, documented in `03-cast-restart.md`. Mosskeeper has short root-feet, Vesper four paws/tail, Rook wings/fan tail and Latch fins/tail/jaw; Fen/Brum retain justified long arms. The owner selected **Brum** for the first actual model/expression/motion proof. Keep the verified Yeti rig/anatomy, prove continuous face and distinct neutral/welcome/protective states plus actual motion at native size before a full family. No new encounter or completed cast set is implied.
  - Commit/push still wait for the owner's OK after final screenshots. No later story/progression system is silently included.

- **2026-10-18 (Kit ward / variable venom direction; prototype only).**
  - The owner gave Kit a concrete defensive purpose: when his shield bar is full, he can empower threatened partition bricks so venom cannot open a shortcut to the cage. Prepare a first-use player demonstration showing charge, warning, shield cast and the defended outcome; show an empty-charge or missed-defence outcome too.
  - The latest layout request supersedes the standing-body/bar study too: show Kit's face inside a circular charge orb at the bottom left or right. On becoming powered, show his fullbody and real expressions/motion for about 10–15 seconds; the prototype starts at 12 seconds. He channels shield power on a valid charged tap, then braces/reacts and recedes. If the fullbody has receded before a later cast, it can appear for that cast; do not refresh the display every frame or consume an unused charge when he recedes. The display duration does not extend the ward beyond its volley. Use a shorter display only if the longer one obstructs play. The orb is the deliberate minimum-52-CSS-pixel control; there is no permanent fullbody avatar, horizontal charge bar or redundant centre button. Compare left/right placement with the same timed ward. Keep the central thumb-drag lane, lives/AIM and safe inset clear. Win/loss menu expressions are also desired in later result-screen work. Automatic defence remains only an unselected alternative.
  - This supersedes the earlier offensive powered-return versus aimed-attack comparison as the current design focus. Start the proposal from the existing 12-brick charge, with one visible resource; explicitly resolve its relationship to Titan rather than silently adding a second meter or free double spending. The proposed Vault charge serves the ward, while Invasion retains Titan. No permanent hero-level system is approved by this brainstorm.
  - The owner rejected the straight-line venom presentation. Use a changing directional spray with irregular strands, droplets, spread and impact splashes. The effect must still identify the threatened stone and leave the ball readable. Stronger appearance does not establish safe route balance.
  - The serpent must visibly crawl from a simple top tunnel, head facing down as it emerges, before following its normal route. Do not add an entrance meter or reconstruct the level for this. Do not open with a pre-filled static coil or venom attack. Venom requires two separate actual player-ball impacts after entry. Earlier effect boards used a staged two-hit setup near the top; they were not a proposed opening attack and are superseded by the combined entrance/ward demo. Verify continuous entry and body occupancy in the isolated proof.
  - These are isolated design/demo changes. The tested main build still has reaction-only Kit, the original Titan core and no venom or ward mechanic. New image/rule picks precede production; commit and push still require the owner's screenshot OK.
  - **Cast anatomy correction:** after seeing the source-backed Castle Oddities / Starbound Runaways boards, the owner objected that nearly every creature inherited the same long arms. Long arms make sense for Brum/Yeti and Fen/woodland courier; this is not a production selection. Redesign the others around distinct anatomy, tails/wings/root structures, motion and powers instead of the shared Big biped template. Those boards need revision before a new cast pick. Keep sources feasible without making source convenience the design.

- **2026-10-18 (finished Kit/mixed Vault; cast rejected; venom proposed; uncommitted).**
  - **Kit:** completed selected Knight 2/B with 100 real rig frames across eight expressions, continuous face, open helmet and hand-mounted medieval shield. Finished turnaround, eight face portraits, contact sheet, animated preview, source and manifest are under `assets/kit/`, `art/kit.py` and `design/phase1/01-kit-character.md`. Integrated the native-size hero above the control grip with reactions to serve/Focus/combo/loss/danger/win/hit/titan. Source and native/motion proofs passed independent review.
  - **Mixed Vault:** 219 brick objects / 245 HP / 19 deliberate power targets; defended aiming-side changes and two optional eight-brick hanging caches. Jade serpent starts at 12 cells, grows to 20 and takes an initial 39-step path. Its actual idle attack/loss times are 54.292/58.975 s. FIRE/TITAN pierce breakables but bounce from declared granite/bars; solid-corner handling and aim flags were corrected without changing Invasion armour piercing.
  - **Final verification:** build and all ten unit tests pass. Both phone sizes passed Kit touch/control/reaction checks (46 captures, all eight animated rows, no overlaps/errors) and the mixed Vault suite (six complete seeded rallies: three earned wins, three serpent losses; both caches, power combinations, no initial unsupported bricks/free breach, valid path, intro and settled-star result captures). Reports: `out/kit-final-qa/` and `out/vault-final-qa/`. Tested build SHA256: `00A6756BDF0A3B8D0EE61AD6EC00ED6A5D3DE2D0A23A2383B9FA173634301BDB`. Chromium phone emulation does not establish physical-device/Safari feel or human difficulty balance.
  - **Existing regression suites:** `layout.mjs` and both iOS/Android `polish.mjs` runs also pass against the same frozen build with no page errors; captures are in `out/final-layout/`, `out/final-polish-ios/` and `out/final-polish-android/`.
  - **Creature rejection:** the owner rejected the six Ember/Mortar/Polaris source proof images, especially the last pair, and requested the entire set be scratched and redesigned. No full batch shipped. Their source/assets/preview harness are removed from active paths and preserved in ignored `out/rejected-cast-20261018/`; `02-menagerie-cast.md` is withdrawn history. Knight 2 was outside this rejection. Prepare two genuinely new source-feasible cast directions in `03-cast-restart.md`; wait for a new image pick before production.
  - **Venom proposal:** the owner suggested two ball hits provoke a furious serpent into melting black partitions with venom breath. Prepare two isolated effect options with real jade art/crumble reuse. Proposed safeguards: distinct impacts, visible wind-up, one exposed partition target, protected cage frame/bars, recovery/cooldown and measured route/collapse changes. No venom/rage mechanic is in the tested build; image/rule choice comes first.
  - **Kit gameplay-purpose question:** the owner asked why Kit is standing in the UI and proposed earning power/levels through brick hits, then launching an attack or boosting the ball. Current Kit is only a reaction avatar; his special ability is not implemented. Prepare two concrete ability previews: reuse the existing charge/Titan cycle as a visible Shield Slam on a clean return, or spend earned charge with a deliberate aimed special. Make cause/effect, input, animation, snake impact and venom-rage interaction explicit. Do not add XP/store/chapter systems from this brainstorm without a separate decision.
  - **Gates:** no commit or push has occurred. Await the owner's OK for the finished Kit/mixed-level screenshots. New cast, venom and Kit-ability options need their own picks; later story tasks remain pending.

- **2026-10-18 (Knight 2 selected; level challenge and cast expansion; uncommitted).**
  - Build replacement Knight 2/B with a continuous expressive face, open helmet, cobalt armour/cape and a broad medieval shield with a rear grip. The owner explicitly wants a polished finished asset and real animation. First inspect actual Blender proofs beside Lumi, then finish the eight clip families and phone-size integration. No replacement render is approved merely by matching its concept image.
  - The owner initially picked level A, then explicitly rejected its direct rescue route. That pick is revoked; do not integrate the old Open Gate maps. Level 2 must progress beyond Level 1: more bricks, tougher non-direct gates, angled shots, deliberate power-up bricks, a differently coloured longer serpent and a longer measured serpent path. Present two revised image options before integrating a layout. Challenge must come from readable choices, rewards and timing, not just extra HP.
  - The owner also authorized a broader castle/space cast so later levels do not repeat Lumi and Gnash as their entire premise. Two image families were presented in `design/phase1/02-menagerie-cast.md`; **B/Castle to Cosmos was selected**: Ember, the brick golem and the magnetic manta. Build those expressive, animated asset families in parallel with Kit. The alternative space wardens remain unselected references. New asset production does not approve every later chapter system or enemy mechanic.
  - Parallel ownership: character production, revised level options, and new cast concepts. The lead integrates the selected Kit and reviews proofs. All commits/pushes still wait for the owner's OK after screenshots.
  - Two revised level boards were shown: V2-A/Bastion Switchback and V2-B/Twin Keeps. The owner selected **a mix of both**. Build A's defended turns and long jade-serpent detour with B's optional flank and hanging reward cache. Both shown options explicitly included granite/cage blocking FIRE and TITAN while breakable bricks still pierce; implement that declared per-grid rule and preserve it in the aim predictor. Re-measure the combined map rather than borrowing the separate proposals' balance results.
  - Knight source proofs now pass continuous plain-skin cheek/jaw, open helmet, distinct expressions, shield grip/face clearance during sampled Cheer/Hurt/Focus motion, and native scale beside Lumi. The full animation batch is in progress. This is internal source QA; final phone screenshots still require the owner's review.

- **2026-10-18 (design restart and parallel level design; uncommitted).**
  - The owner initially selected the teal courtyard concept, then rejected its Blender implementation: unreadable expressions, malformed hair, a face that looked patched on, and a prop resembling a table-tennis bat. That selection is revoked. The replacement direction is a knight with a proper medieval shield.
  - Removed the rejected character, shared-face refactoring, runtime integration and related tests from the active tree. The discarded work is preserved only in ignored `out/rejected-kit-20261018/`. The original game rebuilds and all five original tests pass. Setup fixes remain. No commits or pushes were made.
  - The owner explicitly requested parallel work: separate character-concept, level-design and independent-reference-review tracks. Prepare image options for both existing levels while character work proceeds; keep each track's files separate. This supersedes the earlier restriction on preparing only one task at a time.
  - **Gates:** show 2–3 image options for each design track and wait for the owner's pick before production changes. Playtest implemented changes at both phone sizes and show screenshots. Commit and push only after the owner's OK.
  - **Quality target:** follow the existing Lumi, serpent and robot art: coherent silhouette, uninterrupted facial surface, large readable eye/lid/brow/mouth changes, consistent light and stable animation anchors. Concept polish alone does not prove a Blender implementation is ready.
  - **Replacement character options:** `design/phase1/01-kit-character.md` and `img/01-kit-v2-1.png` through `01-kit-v2-3.png`. The new options are 1/A teal bareheaded, 2/B cobalt open helmet, and 3/C indigo wayfarer. Recommend 2/B for its clear laugh/worry contrast and credible Knight source mesh. No replacement is selected. First prove the selected face, shield grip, proportions and real animation beside Lumi before the full render batch; review criteria are in `design/phase1/00-quality-target.md`.
  - **Level options:** `design/phase1/level-layout-options.md` and `img/level-layout-a.png`, `img/level-layout-b.png`. A/Open Gate gives a clear opening target and central rescue shaft; B/Twin Fronts rewards angled shots into two flanks. Both are isolated candidate renders using the existing game art; active gameplay sources are unchanged. Recommend A for the first playtest.
  - **Level preflight:** iPhone 393 × 852 and Android 412 × 915 captures use the required fonts and safe insets. Cage preservation, no initial breach, supported starting bricks, legal march bounds and five serve contacts per level/device passed. An untouched serpent attacks at about 25.2 s; a four-hit possible rescue route proves reachability only. Sustained rallies, power-up outcomes and difficulty balance remain unvalidated. These are layout proposals, not completed production playtests.
  - **Next at that checkpoint:** wait for replacement picks. Superseded by the newer entry: Knight 2/B selected; direct-rescue A rejected; harder levels and broader cast requested. Nothing has been committed or pushed.

- **2026-10-18 (local setup and Phase 1, Task 1 concepts; uncommitted).**
  - Re-cloned the latest repo into `C:\Users\mahik\Music\Breach\breaker`; the initial checkout is preserved as `breaker-initial-clone`. Set the required commit identity and created `codex/phase1-kit`.
  - Installed Node 22.23.3 and Python 3.11.16 with owner approval. bpy 5.2.2 actually requires Python 3.13, so art uses a separate environment based on the existing Blender 5.2.2 / Python 3.13.13 installation. Corrected the incompatible setup instructions; local activation commands are in doc 03.
  - Rendered `python3 art/princess.py out/test Idle:1` successfully. Made the output path absolute because Blender resolved the relative render path outside the checkout on Windows. Verified the 168 × 168 RGBA image, stripped its PNG metadata, and made `out/test/princess-preview.png` for review.
  - `npm run build` and all five unit tests pass with Node 22. Baseline `layout.mjs` plus `polish.mjs` at iPhone 393 × 852 and Android 412 × 915 report no errors; screenshots are in `out/baseline/`. Planck's Node >=24 engine warning remains documented in doc 03.
  - The first character concepts and rejected build are archived under ignored `out/rejected-kit-20261018/`; they are not approved assets.
  - **Next:** follow the restart entry above. Review replacement knight and level-layout images, then build only the selected options.

- **2026-10-18 (round 3, merged to `main`).** Owner feedback: remove distractions so the focus is the snake, the princess, the gameplay and the power-ups.
  - **Removed:** torchlight, dust motes, the window bars across Saturn, and the WIDE/TINY HUD chips.
  - **Serpent meter:** a colour-only bar running green → amber → red, with no "% away".
  - **Serpent behaviour:**
    - it grows longer and thicker as it eats, and a swallow bulge travels down its body;
    - it starts sluggish and speeds up (`speedK` in `updateSnake`);
    - bites lunge harder and throw more chips.
  - **Camera:** it pushes in as danger rises (anchored on the paddle line), then zooms to 1.55× on the cage during the attack.
  - **Cage:** a dark stone cell with a cool light on the princess, and a rendered dark-iron `bars.png` (code fallback in `drawBars`).
  - **Full screen:** the canvas covers the whole phone screen, and the edges mirror out (`fillMargins`). The menu has a Full screen button where the browser supports it.
  - **Art v3:** glazed bricks, the new caps and titan ball, a torch-free Vault plate, a calmer Invasion plate, princess `Nervous`/`Panic`, serpent `snarl`/`strike`.
  - **PNG metadata:** Blender writes the .blend path, which contains the home folder name, into PNG metadata. Strip it before committing; see the snippet in doc 02.

- **2026-10-18 (edge-to-edge):** owner asked for a true full-screen layout with no dead band at the top. A dimmer Saturn followed: "the background must not outshine the foreground". They also wanted to actually see WIDE in play.
  - `main.js` `LIFT = 34`: each level is built `H + LIFT` tall, drawn shifted up by `LIFT`, and its pointer y is offset by `LIFT`.
  - The levels draw their top HUD at `this.hudY`. The deck fills into the home-indicator strip via `this.inB`.
  - Invasion `calm()` darkens and desaturates the plate further, and sinks the planet with a radial shade.
  - WIDE leads both drop tables.
  - Layout check: `node tools/playtest/layout.mjs <out>`.

- **2026-10-18 (ChatGPT split):** the owner approved Phase 1 with the recommended defaults. Design work (story scripts, character design, concept art, UI specs) moves to the owner's ChatGPT Pro project; Claude keeps execution.
  - The brief is `docs/handoff/04-chatgpt-design-brief.md`. The owner's steering prompts (ChatGPT project instructions, task prompts, corrections, checklists) are in `docs/handoff/05-chatgpt-steering-prompts.md`. Every art script, in full, is in `docs/BREACH-blender-scripts.md`.
  - The single file to upload to ChatGPT is `docs/BREACH-ChatGPT-handoff.md`: the brief, story plan, game plan, docs 01–03 and a file map. Rebuild it after editing any of those docs: `python3 tools/make_handoff.py`.
  - ChatGPT returns `design/phase1/*.md` and images. To save Claude usage, the owner may have **Codex** build them, guided by `AGENTS.md` at the repo root. Claude is then used only for reviews. Whoever builds pulls `main` first; only one builder works at a time.

- **2026-10-18 (story plan):** owner asked for a dedicated story mode, a prince, locked weapons, a store with skins, and more power-ups (multi-ball multiplier, paddle bullets), backed by research into addictive games.
  - Plan drafted, not built: `docs/STORY_PLAN.md` (live, editable copy: https://claude.ai/code/artifact/5278a4c8-b669-4235-972f-7814c32382d9; also `/mnt/project-files/breaker/plan/STORY_PLAN.md`).
  - Core idea: bricks are alive with light and Princess Lumi is the light; Zorvax the Curator holds her in the Menagerie space prison; Prince Kit is the underdog hero; score becomes Shine, which rebuilds Brickhaven.
  - Waiting on the owner's four decisions at the end of the plan (names, Kit's look, start Phase 1, business model). Nothing in section 9 is built until the owner approves.

- **2026-10-18 (later):** TODO items 1–7 in section 8 are implemented on `wip/polish-pass`:
  - level wiring, crumble vs. big crash, difficulty, continue screen, ferocious serpent with bite marks and the cage attack, nervous and panicking princess, and the Invasion calm-down with its landing beat.
  - Draft screens are in `/mnt/project-files/breaker/playtest/v3/`. Re-shoot them with `node tools/playtest/polish.mjs <out> ios|android`.
  - **Still open:** item 8 (shinier bricks, new capsules, titan ball, princess `Nervous`/`Panic` frames, serpent `snarl`/`strike` faces, all being rendered); then item 9 (playtest Android, tune difficulty) and item 10 (merge to `main`).

---

## 1. Rules from the owner (non-negotiable)

- **Repo:** https://github.com/mahikshith/breaker. `main` holds the last stable build. In-progress work is on `wip/polish-pass`.
- **Commit identity:** every commit must be authored and committed as `mahikshith <mahikshith97@gmail.com>`. The repo-local config sets this: `git config user.name mahikshith; git config user.email mahikshith97@gmail.com`.
- **No AI attribution anywhere.** That means:
  - no "Co-Authored-By" lines;
  - no session links;
  - no "Generated with …" in commits, code comments, README or docs.
- **Never ask for or paste the owner's GitHub token.**
- **Show the owner screen drafts and character sheets during playtests.** They want to see shots for iOS and Android sizes.
- **Quality bar:** the owner (mykee) wants a premium, inventive, addictive iOS/Android game, and nothing that looks "vibe-coded".
  - Favourite references: BALL x PIT, and Arkanoid crossed with Space Invaders.
  - Rejected in the past: pixel art, wisps, jittery foxes, ball-chain snake bodies, rounded blob heads, and uniform faces. Expressions must "say a lot".
- **Scope right now:** approved Phase 1 of `docs/STORY_PLAN.md`, finished Knight 2/B and mixed Vault review, replacement cast concepts after the rejected set, and isolated venom-effect and Kit-ability proposals. Independent work may run in parallel; concept-pick and post-playtest approval gates still apply. Later chapter systems still need their own implementation decision.

---

## 2. The game in one paragraph

BREACH is a brick breaker for phones in portrait. The world is 360 units wide, and the height adapts to the screen.

You drag your thumb to move a chrome paddle and bounce a chrome ball. The game has two levels:

1. **Invasion.** A marching Space-Invaders-style formation of glossy candy bricks and toy robots steps down toward you, and the robots fire bolts. If the formation reaches the hazard line, you lose. Clear the formation and a mothership boss arrives.
2. **The Vault.** This is a side-view cutaway of a castle tower. A princess is caged near the top, and a purple serpent chews its way through bricks toward her along a Dijkstra path. You break a path up to the cage to free her. That triggers BREACH: she runs out and a FRENZY multiball round plays as the win lap. If the serpent reaches her, you lose.

There is also a **Focus aim** mechanic. Hold your thumb still while a ball lands and the paddle catches it. Time slows to 0.25×, you slide to aim with a predicted path, and you lift to fire. This costs an AIM pip; pips refill as you break bricks.

---

## 3. Tech stack and how to run

- **Code:** plain JavaScript ES modules with Canvas 2D. There is no framework.
- **Physics:** custom deterministic circle-vs-grid physics for the balls (`src/physics.js`), plus **planck.js** (Box2D) for brick debris (`src/debris.js`).
- **Build:** esbuild bundles everything into one self-contained HTML file.
  - `npm install`, then `npm run build`, produces:
    - `dist/breach.html`, the standalone page;
    - `dist/breach-artifact.html`, a body fragment for hosts that supply their own `<head>`.
  - The build is about 1.2 MB because every rendered image is inlined as a WebP data URI in `src/vault-art.js`.
- **Run locally:** open `dist/breach.html`, or serve the repo root and open `index.html`, which loads `src/main.js` as a module.
- **URL params:**
  - `?level=1` or `?level=2` jumps straight into a level;
  - `?safe=top,bottom` fakes notch and home-indicator insets in CSS px. iPhone 15 is `?safe=59,34`, a typical Android is `?safe=32,24`.
- **Test hook:** `window.__breach` exposes `{ start(i), level, scene }` for automated playtests with Playwright and Chromium.
- **Unit tests:** `npm test` runs `tests/physics.test.js`.
- **Fixed timestep:** 1/120 s (`STEP` in `main.js`).
- **Fonts:** Google Fonts **Lilita One** for game text and **Rubik 600** for numbers, loaded in `index.html`.

### Art pipeline (Blender, optional to re-run)

All art is pre-rendered in Blender (bpy 5.2.2 from pip, Cycles on CPU, view transform AgX "Medium High Contrast").

- Light comes from a key area light at the **top-left**, and shadows fall down-right everywhere. Code-drawn shadows match: offset +3, +5.
- Scripts live in `art/`:
  - `render_vault_assets.py` and `vault_post.py` render the Vault plate, bars, bricks, ball, paddle, capsules, lantern and torch flame into `assets/vault/` plus `atlas.json`.
  - `render_invasion_assets.py` and `invasion_post.py` render the Invasion hangar plate, bricks, robots (7 expressions × 4 colours), mothership (5 expressions plus a light overlay), bolt and bomb into `assets/invasion/`.
  - `princess.py` restyles the KayKit Rogue model (`assets/models/kk_Rogue.glb`, CC0) into the princess: tiara, expressive eye rig, bell skirt. It renders animation frames to `assets/princess/<Anim>_NN.png`. The `--face` option renders face close-ups.
  - `snake.py` renders the serpent's angular head. It has an `EXPR` dict of expressions (lids, brows, slit pupils, jaw, tongue, fangs) and two facings, `r` and `l`. Output goes to `assets/snake/head_<expr>_<r|l>.png` and `meta.json`.
- `tools/pack_art.py` packs everything into `src/vault-art.js` (`export const ART = {...}`). Re-run it after any render, then `npm run build`.
- **Sprite convention:**
  - sprites are 3 px per game unit, with a margin (usually 4 units) around the footprint;
  - plates are 2 px per unit and cover screen y from -40 to 780, drawn at (0, -40) with size 360 × 820.
- **Runtime registry:** `SPR` in `src/gfx.js`. Vault and shared sprites are keyed by file name (`ball`, `paddle_l`, `cap_split`, `brick_t_2_0`…). Invasion sprites are prefixed `inv_`. `ready(spr)` checks that an image has decoded.
- **Fallbacks:** every sprite has a code-drawn fallback, so the game runs without art.

---

## 4. Look and feel (keep this)

- **Style:** glossy "vinyl toy" pieces with real light, deep shadows, and saturated but not neon colours. Bricks should read like **glazed ceramic tiles**. See `docs/reference/vault-top-down.png`, the look the owner called "even shinier" and wants matched.
- **Not too much yellow.** Gold and yellow are accents only.
- **Ball:** chrome, a 12-unit ball drawn from a 20-unit sprite. The fire variant is molten orange. The titan variant (new) is dark gunmetal with magenta and cyan energy, plus a code-drawn pulsing halo.
- **Paddle:** chrome capsule made of three sprites (`paddle_l`, `paddle_m` stretched, `paddle_r`).
- **Fonts:**
  - Lilita One for all game text, always drawn with a dark outline and drop shadow via `text()` in `gfx.js`;
  - Rubik for the score.

### Palette

| Use | Colours |
|---|---|
| Vault bricks | sun `#ffc73d`, coral `#ff6f61`, violet `#8f5cf0`, teal `#22c4b0`, blue `#4f9dff`, gold `#f4c542` (gem bricks), granite `#4a4f6e` (indestructible) |
| Invasion rows, top to bottom | `#ff5d8f`, `#ff8a3d`, `#ffd23f`, `#5ccf6a`, `#2ec4b6`, `#3fa8f5`, `#7b6cf6`, `#c46bf0`, `#ff5d8f`; armour `#8d97b3`; power brick `#f4c542` |
| Level accents | Invasion pink `#ff5d8f`, Vault gold `#f4c542` |
| AIM / Focus UI | lilac `#e3b6ff` / `#c46bf0` |
| Combo text | `#ffd36b` |
| Danger | `#ff4d5e` |
| Success | `#7bd88f` / `#7bf2c8` |
| Menu background | gradient `#22284a` → `#141831` → `#0a0c18`, with a vignette and film grain |
| Serpent body | purple `#7a3ccc`, peach belly `#ffc49a`, rose diamonds `#ff6fae`, outline `#1e0a40` |
| Power-ups | ×3 split `#5ccf6a`, FIRE `#ff8a3d`, WIDE `#3fa8f5`, AIM `#c46bf0`, +3 `#f7c948`; new: LASER `#ff4d6d`, SHIELD `#2ec4b6`, SLOW `#7fd6ff`, TINY `#5a5f78` (a bad power-up) |

### Mobile UI/UX rules already applied

- **Safe areas:** the notch and home indicator are respected. The scene extends under them through `level.drawTopInset()`.
- **Pause:** top-left with a 44 pt touch target, away from the steering thumb.
- **Steering:** relative thumb drag anywhere on screen. The finger never covers the ball.
- **HUD:**
  - level meter top-left ("SERPENT x% away" or "FORMATION n left");
  - score top-right;
  - lives (small chrome balls) and AIM pips at the bottom.
- **Feedback:** haptics through `navigator.vibrate` on big hits, hit-stop, screen shake (trauma model), and pentatonic hit sounds that rise with the combo. All sound is synthesised in `src/audio.js`.

Reference screenshots of the current `main` build are in `docs/reference/`:

- `vault-v2-android.png`
- `invasion-v2-android.png`
- `snake-v2-sheet.png`
- `robot-expressions-ingame.png`

---

## 5. Code map

| File | What it does |
|---|---|
| `src/main.js` | Canvas sizing and safe insets, input mapping, the fixed-step loop, scenes (menu with level cards and live previews; level; results with stars). `LEVELS` registry. `best` stars kept in localStorage. |
| `src/arena.js` | **Base class shared by both levels:** paddle, balls, serve and Focus aim, power-ups, lives, combo, score, shake, HUD base, aim-path preview. Levels extend `Arena` and override `hitCell`, `updateLevel`, `draw`, `background`, `result`… |
| `src/physics.js` | Ball stepping with substeps, grid collision with ghost-edge fix, paddle bounce (offset angle up to ±62° plus swipe spin), minimum vertical speed. |
| `src/debris.js` | planck world. It has five behaviours: |
| | • `shatter()`: Voronoi fragments from the brick image; |
| | • `drop()`: a whole brick falls as a rigid body and shatters on impact; |
| | • a kinematic paddle that debris can bonk; |
| | • `poke()`, which lets balls shove debris; |
| | • **new `crumble()`**: non-physics fragments that shrink and fade in about 0.4 s. |
| `src/gfx.js` | Sprite registry `SPR`, `cached()` offscreen canvases, the `brick()` fallback, `drawBall`, the `FX` particle system (shards, dust, rings, score pops), `text()`, `POWER` table, `capsule()` fallback. |
| `src/invasion.js` | Level 1 (details in section 6). |
| `src/vault.js` | Level 2 (details in section 6). |
| `src/characters.js` | Old code-drawn character fallbacks (invader, mothership, serpent). |
| `src/audio.js` | WebAudio synth SFX (`sfx.hit/tough/paddle/wall/power/lose/zap/hurt/boom/breach/beat/chew/win`). |
| `src/vault-art.js` | **Generated** by `tools/pack_art.py`. Never edit by hand. |
| `src/prefs.js` | **New.** A `store.get/set` wrapper over localStorage. |
| `src/monetize.js` | **New.** Continue-offer placeholders (section 8). |

---

## 6. Level details (as on `main`)

### The Vault (`src/vault.js`)

- **Grid:** 20 × 20 cells of 16 units, origin (20, 96). Bricks are 2 cells wide in running bond. `LAYOUT` is an ASCII map:
  - `t` teal, `v` violet, `c` coral, `y` sun, `b` blue — glazed bricks;
  - `g` gold gem brick, which drops a power-up;
  - `#` granite;
  - `=` cage bars.
- **Cage (`POCKET`):** columns 7–12, rows 3–5. Bars are solid to the ball but open to the serpent.
- **Serpent:**
  - It plans a Dijkstra route to the cage, where each brick costs chewing seconds (`CHEW`).
  - Its body is a list of cells. It is drawn as a tapered Catmull-Rom ribbon in canvas, with the rendered head sprite on top.
  - `expression()` picks the face: mood timers first (ouch, hiss, shock), then dizzy, grin, chew, blink, taste, hunt or idle.
- **Ball vs serpent:**
  - hitting the head stuns it and knocks it back one cell; three quick hits knock it back four;
  - hitting the body costs it chewing progress;
  - a falling brick that lands on it crushes it: stun plus knockback.
- **Collapse rule:** bricks that lose their connection to granite, the side columns or the top row fall as planck rigid bodies (`collapse()`). Debris that hits the paddle stuns it ("BONK").
- **Breach:** when a flood fill from the cage reaches the bottom row, `checkBreach()` bursts the cage. The princess runs down the path (`Running_A`), then FRENZY runs for 7 s with 12 balls and permanent fire, then the level is won.
- **Princess:** a sprite sheet with these animations:

  | Animation | Frames |
  |---|---|
  | Idle | 16 |
  | Interact | 12 |
  | Blocking | 8 |
  | Cheer | 16 |
  | Running_A | 12 |
  | Jump_Full_Short | 14 |
  | Scared | 8 |

  She plays at 14 fps, with speech bubbles ("Help!", "Hurry!", "Eek!", "Yay!").
- **Intro camera:** about 3.4 s. It starts on the princess, pans to the serpent's lair, then pulls back. Tap to skip.
- **Stars:**
  - 1 for the rescue;
  - +1 if the serpent never got halfway (`peakDanger < 0.5`);
  - +1 if the score is over 10 000.

### Invasion (`src/invasion.js`)

- **Grid:** 11 × 9 cells of 28 × 18 units, starting at y = 92.
- **Cell types:**

  | Type | Hit points | Notes |
  |---|---|---|
  | CANDY | 1 | |
  | ARMOR | 3 | |
  | POWERB | 1 | always drops a power-up |
  | BOT | 2 | a robot; 20% chance to drop a power-up |
- **March:** the formation steps sideways ±14 units, then drops 14. The step interval shrinks as fewer cells remain. `dangerY = paddle.y - 64` is the hazard line.
- **Robot shots:** the robot lowest in a column scowls (`angry`) for 0.45 s, then fires a bolt. A bolt stuns the paddle; then the shooter and about 35% of the robots laugh, and the boss looks smug. Balls can knock bolts out of the air.
- **Robot faces:** the `march0/1` cycle, `hurt` at 1 hp, `shock` when a ball is about to hit, `dizzy` when killed. A killed robot falls as a rigid body; catching it on the paddle gives +120 "CATCH!".
- **Mothership:** 30 HP, an elliptical hitbox. It drops bombs, and its expressions are smug, angry, hurt, panic and dizzy. Killing it drops the wreck.
- **Stars:** depend on lives left and best combo.

---

## 7. Work in progress on `wip/polish-pass` (what this branch already changes)

The owner's latest feedback, which is the current task list, is reproduced in section 8. The branch already contains the following.

### `src/arena.js` (rewritten; levels still need wiring)

- **Raised paddle.** `paddleY(H, minY)` puts it at `H - clamp(H*0.25, 150, 210)`, well above the thumb.
  - Below it is a **control deck** (`drawDeck(g)`): a dark panel, a grooved track with a grip that follows the paddle, and "Drag anywhere down here to move" for the first seconds.
  - `deckY = paddle.y + 34`, `shieldY = paddle.y + 28`, `drainY = paddle.y + 46`. The ball is lost at `drainY`, not at the screen bottom.
- **Smoother, snappier controls.**
  - The paddle maps 1:1.15 to thumb travel from where the press started.
  - It re-anchors when pinned against a wall, so it reverses instantly.
  - Smoothing went from rate 22 to rate 45.
- **Harder base game.**
  - Ball speed went from 330 to 345, scaled by `opt.speed` per level.
  - A rally ramp adds 1.2% per paddle hit, up to 1.28×.
- **Titan sweet spot.**
  - A diamond "core" gem sits in the centre of the paddle and fills as bricks break (`CORE_BRICKS = 12`).
  - When it is full it blazes. A ball hitting within ±7 units of the centre becomes a **TITAN**: radius 10, ploughs through bricks like fire, lasts 7 s.
  - Pops say "CORE READY · hit it dead centre" (for the first 3 times) and "TITAN!".
- **New power-ups:**
  - **LASER:** twin emitters on the paddle auto-fire every 0.3 s for 7 s. Shots call `hitCell`, and a level can consume them via `shotHit(shot)`, for example for the boss or the serpent.
  - **SHIELD:** a teal energy barrier under the paddle that saves 2 balls, or lasts 16 s.
  - **SLOW:** balls move at 0.68× for 8 s.
  - **TINY:** a bad power-up. The paddle shrinks to 0.62× for 9 s, and the capsule has a flashing red outline.
- **HUD chips:** active power timers show as small chips next to the lives.
- **Aim teaching** (the owner asked how aim works):
  - "CATCH READY" brackets appear over the paddle while the thumb is held still and a pip is available.
  - A coach bubble, "HOLD STILL as it lands to catch & aim", shows when a ball is falling toward the paddle. It stops after the player has used Focus 3 times (`store aimCoach`).
  - During aim: "Slide to aim · lift to fire". During serve: "Slide to aim · lift to launch".
- **Big crashes only.** `bigCrash(ball)` returns true when 4 or more bricks broke within 0.3 s, or the ball is fire or titan. Levels should use `debris.shatter` (physics) only then, and `debris.crumble` (subtle fade) for single bricks. This was requested because falling fragments were being mistaken for the ball.
- **`continueRun()`** puts the level back into play after a continue: at least 1 life, a fresh serve, a 2-hit shield for 10 s, and "BACK IN!".

### Other files

- **`src/debris.js`:**
  - `crumble(art, x, y, w, h, vx, vy, n)` creates a short-lived fade with a white flash;
  - new constructor option `killY` removes physics pieces that fall past the paddle into the deck.
- **`src/physics.js`:** `b.titan > 0` pierces like fire.
- **`src/gfx.js`:** titan ball drawing with halo; `POWER` entries for laser, shield, slow and shrink (`bad: true`).
- **`src/prefs.js`, `src/monetize.js`:** new (section 8).

### Art that was being rendered (may or may not be in the branch)

Two Blender jobs were running when the session ended. They write into `assets/` and re-run `tools/pack_art.py`:

1. **Shinier bricks** for both levels to match `docs/reference/vault-top-down.png`, with the same file names, sizes and atlas entries. Also new capsules `cap_laser`, `cap_shield`, `cap_slow` and `cap_shrink`, and a `ball_titan` sprite. Script edits are in progress in `art/render_vault_assets.py`.
2. **Characters:**
   - princess animations **`Nervous`** (worried walk, about 12 frames) and **`Panic`** (terrified run, about 12 frames), in profile facing like `Running_A`, added to the pack list;
   - serpent expressions **`snarl`** (fangs bared, low brows, narrowed eyes; the hunting face) and **`strike`** (jaw wide, fangs, furious wide eyes; for lunges and bites), in both facings, in `meta.json`.
   - Script edits are in progress in `art/princess.py`.

If those sprites are missing, the code must fall back gracefully:

- missing `cap_*` sprites already fall back to the code `capsule()`;
- a missing `ball_titan` falls back to the fire sprite;
- for the princess, check `PRINCESS.anims.Nervous` and fall back to `Running_A` at a slower frame rate;
- for the serpent, check `SNAKE.expr.snarl` and fall back to `hunt`.

---

## 8. Remaining work: the owner's latest feedback and the agreed design

Paraphrased owner feedback (2026-10-18):

> - Make the bricks shinier, like the Vault top-down render.
> - Add more powers, for example: hit a certain point and the ball becomes bigger and unstoppable.
> - Make it harder so players can actually die.
> - On losing, show a pop-up: watch an ad to continue, or pay to unlock the full game. (Maybe make the whole game free later.)
> - The paddle is too low and overlaps the thumb, and the controls feel sluggish.
> - Explain how aim works (does a long press trigger it?).
> - Single broken bricks should crack and subtly vanish. Only big crashes should drop debris, because falling pieces get confused with the ball.
> - The snake should be more ferocious, visibly bite through bricks with urgency, and have a dedicated animation when it reaches the cage (bite the cage, grab or take the princess).
> - The princess should walk nervously, and run in circles in panic, inside the cage as the snake nears.
> - Apply the same polish to Invasion.
> - Invasion's background is too flashy and distracting: the big planet, the neon, and the yellow-black hazard line and compartments at the bottom. Tone it down and make it darker, but keep the colours.
> - Later, not now: story mode, unlockables (princess, sword, prince), dragons and mythical beasts. Focus on one perfect level first.

### TODO, in order

#### 1. Wire both levels to the new arena

- **Constructors:** pass `minPaddleY`.
  - Vault: about `OY + 20*16 + 80 = 496`, so the paddle never sits on the tower.
  - Invasion: about 470.
- **Draw order:** call `this.drawDeck(g)` right after drawing the background, before the shake transform.
- **Debris:** create it with `floor: H + 200, killY: this.paddle.y + 70`, or similar, so nothing piles up in the deck.
- **Shots:** draw them. `drawBalls` already draws shots.
- **Vault `hintY`:** no longer used and can be removed.
- **Drop tables:** add the new kinds.
  - Vault `DROPS` example: `['split','fire','wide','focus','burst','laser','shield','slow','shrink']`.
  - Invasion: similar, with `laser` weighted a bit higher.

#### 2. Single brick versus big crash

- In `Vault.removeBrick(br, ball)` and `Invasion.hitCell`, use `this.bigCrash(ball) ? debris.shatter(...) : debris.crumble(...)`.
- Reduce the `fx.shatter` coloured shard counts for single breaks to 1–2.
- The Vault `collapse()` rigid-body drops stay as they are: that is the "major crash".

#### 3. Difficulty

**Vault:**
- Multiply `CHEW` by about 0.75 (2.8 → 2.1, 4.6 → 3.45).
- Make the serpent chew faster as danger rises: `need /= (1 + danger*0.5)`.
- Empty-cell travel goes from 0.42 to 0.32.

**Invasion:**
- March interval: `0.2 + 0.7*n/total`.
- Bolt interval: `0.9 + 1.4*n/total`.
- Bolt speed: 200.
- Boss HP: 36.
- In rage, the boss fires twin bolts.

**Both:** tune so a first-time player usually loses once or twice, and a skilled player can 3-star.

#### 4. Continue screen

Do this in `main.js`, with `src/monetize.js` already written.

- **When:** on `state === 'lost'`, if `continueOffer(used)` returns `'ad'` or `'free'`, show a **Continue?** card before the results.
- **Card content:**
  - the loss reason;
  - a 9-second countdown ring;
  - primary button "▶ Watch ad · Continue" (or "Continue" when unlocked or in free mode);
  - secondary button `Unlock full game · ${PRICE}`, hidden when `MODE === 'free'` or already unlocked;
  - a "No thanks" text link that goes to the results.
- **Watch ad:**
  - show a placeholder full-screen "Ad · 3…2…1" card while awaiting `watchAd()`;
  - then call `level.continueRun()`;
  - count `used++` per attempt and reset it in `start()`.
- **Unlock:** `buyFullGame()`, then continue.
- **Level-specific undo** goes in each level's `continueRun()`:
  - **Vault after the serpent reached her:** rebuild the BARS cells, set `cageGone = false`, `knockBack(6)`, stun 3 s, princess back to Idle, `phase = 'rescue'`.
  - **Invasion after the formation landed:** `grid.oy -= 42`; all robots look `shock`.
- **Swapping later:** keep all money logic inside `monetize.js`, so real ad and payment SDKs, or free mode, are a one-file change.

#### 5. Ferocious serpent (Vault)

- **Default face:** `snarl` when danger is over 0.15. Use `strike` on each bite.
- **Visible biting:** about 2.2 chomps per second. On each chomp:
  - the head lunges about 5 units toward the target cell (offset the head draw along `s.dir`);
  - the brick wobbles;
  - chips crumble off;
  - `sfx.chew()` plays louder;
  - bite-mark notches grow on the brick with chew progress, replacing the current thin crack lines in `drawChew`.
  - When finished, `crumble` the brick.
- **Cage attack:** replace the instant "caught". When the next planned cell is a cage cell, start an attack sequence in slow-mo (timeScale about 0.6):
  1. the head **rears back** with `strike` and a red "!" telegraph (0.7 s);
  2. **strike 1**: bars bend (big `barsWob`), sparks, shake, `sfx.boom`;
  3. rear back (0.5 s);
  4. **strike 2**: bars shatter (`burstCage`-style debris);
  5. the head lunges onto the princess; she cowers (`Scared`); `grin`; red flash; "GOT HER!".
  6. `fail('The serpent got the princess')` about 1 s later.
- **Last chance:** hitting the head before strike 2 interrupts the attack (stun plus `knockBack(3)`).

#### 6. Nervous princess (Vault)

Give her an x position inside the cage (about 140–220).

| Danger | Behaviour |
|---|---|
| below 0.3 | Idle at the centre, occasionally "Help!" |
| 0.3–0.6 | `Nervous` walk back and forth at about 22 u/s, pausing at the ends with a scared glance toward the snake |
| above 0.6 | `Panic` run "in circles": x = cx + 36·cos θ, with a slight scale and y bob from sin θ for depth, flipping on direction, biased away from the serpent |
| during the attack | `Scared`, cowering on the far side |

#### 7. Invasion polish

- **Calm the background:**
  - in `background()`, after drawing the plate, darken it with about rgba(6,8,20,0.35);
  - desaturate it about 30% (`globalCompositeOperation = 'saturation'` with grey at about 0.3 alpha);
  - darken the lower hangar (y above about 450) a further 25%.
- **Hazard line:** draw it thin and dim (about 0.3 alpha) until the formation is near, then brighten and flash it as a warning.
- **Landing beat:** when the formation lands, all robots `laugh`, the hazard line flashes red, and a beam zaps the paddle. Then "THEY LANDED" and `fail` after about 1.2 s.
- **Laser:** shots damage the boss through `shotHit`.
- Apply the same crumble, deck and continue behaviour as the Vault.

#### 8. Shinier bricks

Done by the art job above; verify it. If it is not finished, rerun the brick renders with:
- lower roughness and clearcoat;
- a softbox or emissive strip so the top faces catch a crisp highlight;
- the same sizes and names.

#### 9. Playtest and publish

- Playtest at iOS 393×852 with `?safe=59,34` and Android 412×915 with `?safe=32,24`.
- Check for no console errors, the deck clear of play, readable text, and a reachable continue flow.
- Share screenshots with the owner.

#### 10. Merge

Commit as mahikshith (no AI attribution) and merge `wip/polish-pass` into `main`.

---

## 9. Future, NOT to build now (keep the code extensible)

- **Story mode** chaining levels. The full plan (story bible, chapters, heroes, weapons, power-ups, fusions, store, roadmap) is in `docs/STORY_PLAN.md`; build only after the owner approves a phase.
- **Unlockables:** a locked princess, sword or prince shown as "next time" teasers; dragons and mythical beasts as new creatures.
- **Extensibility:**
  - levels are self-contained classes in the `LEVELS` registry in `main.js`, so new levels and creatures slot in the same way;
  - monetisation stays isolated in `monetize.js`;
  - persistent progress goes through `prefs.js`.
