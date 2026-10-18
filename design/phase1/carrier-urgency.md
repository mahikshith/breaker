**Integrated browser review (2026-10-18):** Final HTML `BA5E851F3CFC844E566603C042504BBD885BBD8D5CE35D508E1992CF5B8F9145` includes actual Nix/Tick lossless atlases, manual touch/K input and true pause/background handling. All103 unit checks, nine integrated groups per phone, updated mobile UI, required layout/polish and exact-hash ordinary-only assisted clears pass with zero page errors. Ordinary clears40.708/36.783s retain three lives and use no capsules/Nix/TITAN/shield saves. Full live Nix clip and all five Tick placements/latches reviewed independently. Details: `out/boarding-review/REVIEW.md`, `out/boarding-next/report.json`, `carrier-companions.md`. Earlier mechanics-only receipts below remain historical. Owner play/screenshot OK still precedes new gameplay commit/push; the frozen APK checkpoint excludes this loop. Human balance and physical-device performance remain open.

# Carrier Breakout — Boarding Raid

2026-10-18. **Owner selected B / Boarding Raid.** Its mechanics milestone is implemented in `src/carrier.js`; approved Carrier A artwork, geometry and ball/paddle dimensions are retained. The earlier audit and unselected A / Jump Coil option are preserved below as history. Do not combine their pressure systems.

The selected loop gives a reachable villain a visible captive target, an ordinary-ball interrupt and a real capture consequence without adding a global HUD timer. The eight-second extraction is a tested mechanical window, not established human balance. No new gameplay commit, push or APK follows from this milestone.

## Implemented mechanics milestone

- Initial serve auto-launches after eight active seconds; replacement/Continue serves after three. Squads begin at least six seconds after launch. A squad has three 2 HP fighters, with one boarder active and the others queued above. The boarder emerges from the actual bay, banks above cover to the outside edge over 1.5 seconds, gives a one-second edge warning and re-enters over two seconds. Its 36×30 u body holds at paddleY−220; short layouts delay the approach until real clearance exists.
- Target selection uses a normal-ball-radius swept route. Another intact housing or closed machinery blocks eligibility; breakable panels can be breached. A fixed 1.2-second warning precedes one travelling 300 u/s shot, then at least 0.6 seconds recovery. Enemy-destroyed panels can drop their authored cache, but give no score, combo, Focus, broken-brick count or Nix charge. Intact housing absorbs enemy shots without losing HP.
- A clear route starts the full eight-second extraction. The worker remains inside for six seconds, then follows the connected pull during the final two. Two ordinary fighter contact episodes interrupt it; opening the target housing also interrupts it. Killing a raider returns a partially pulled worker continuously to its still-locked housing and does not count it as rescued. The next queued approach waits four seconds. No hostile paddle volley runs during extraction.
- At expiry, “Crew taken” freezes the failed capture. A direct hostile paddle hit instead costs one life and clears threats; it replaces the former stun penalty. Live/caught balls can intercept, and missed-ball SHIELD remains a ball save. Replacement launch grants at least three seconds enemy grace. Continue retains damage, consumed caches, charge and secured identities, restores only the current captured worker to its earned housing HP, clears threats/temporary TITAN and gives a protected fresh serve; the next squad waits six seconds after that launch.
- Each housing break starts Tick's 0.8-second secure state and the existing 1.95-second worker exit. The fifth legal break latches safe escape immediately, suppressing late ball loss, laser creation and power pickups during the release presentation. Victory needs all five secured exits, with no mandatory hull cleanup. The 18 HP hull / 4 HP guns are optional shutdown; actual gun HP removed also damages the hull once, recalls raiders and can earn the third star. Local optic segments show damage.
- Encounter pressure, fighter motion and hostile shots use active real time through Focus, replacement serves and visual hit-stop. Moving-target snapshots compensate for Focus×SLOW ball time. Real pause/background/offer handling belongs to the final integrated main-loop check below.

Nix's manual command uses the existing single twelve-break charge. It selects one caught-or-lowest live ball for seven seconds of TITAN at radius 10, rejects unavailable/active/terminal casts, and preserves ordinary SPLIT clones at configured radius 7.5. Manual centre returns do not auto-spend. Root owns the shared command input and companion renderer; the actual Nix/Tick source and native-size family proofs are documented in `carrier-companions.md`. Four-legged Tick's atlas is presentation only; Carrier owns secure/capture state.

### Verification receipts and boundaries

| Evidence | Result and exact scope |
|---|---|
| Focused mechanics tests | 35/35: `boarding.test.js` 12, `carrier.test.js` 8, `carrier-physics.test.js` 10 and independent `boarding-review.test.js` 5. Covers real contact episodes, final-lock/second-ball expiry ordering, nearest swept interception, radius-grazing friendly cover, Focus×SLOW trajectories, returned pulls, rewards, terminal freeze, grace and Continue |
| Manual command / companion helper tests | `core-command.test.js` 12/12 against real Arena, Carrier, Vault and helper imports, with only environment Image/prefs/cached-canvas stubs. Covers rejection/no-spend, one-ball ownership, repeated K, centre bounce, SPLIT/expiry, Vault Ward input, authored animation fps/loop/clamp and Nix reaction priority. SHA256 `80FFC1C9A141879B407806694B24516E828FD338EAA740F45E64FF6E541E3AA8` |
| First isolated browser mechanics proof | `out/boarding-next/report.json`, SHA256 `9A738B75272E54861BD81C10C590B96DF2AB1CC7C117201BF3782089918CFA19`. Actual browser pointer aim/release/drag passed at 393×852 safe59/34 and 412×915 safe32/24, with no page errors. Its staged breach/pull/interrupt/capture/Continue fixtures are explicitly separate from earned play |
| Earned ordinary-ball runs | Public level pointer/key methods plus fixed 120 Hz updates, with no ball/HP/charge/life writes: iPhone 40.708 seconds, Android 36.783 seconds; five crew safe, three lives, zero capsules, Nix/TITAN casts or shield saves on both. Actual raid encounters occur. These are input-assisted browser runs, not human reaction or physical-device performance measurements |
| Historical proof identity | The first mechanics report tested Carrier source `C340C09822C875C5445AE19BAB94E9C6887C0350EB4A1AC54FEA001E307F7DD2` and isolated HTML `6217863182B85009765DB545EB1A9348F58A26EAE57B1C7877E27A443FFD7BE4`. That bundle predates final companion packing/manual-corner input/pause integration. The working HTML path can be rebuilt; this report does not certify a later replacement at that path. A later source-only shortcut comment does not change mechanics |

**Final integrated companion/input/pause proof: pending root's sealed build and report.** The first proof does not establish actual corner-tap Nix activation, final Tick placement/green-latch rendering, pause/resume with held inputs, final global regression results or a new APK. Keep those claims separate until that integration is verified. Owner mobile play still needs to judge the eight-second warning and repeated raids. The earlier frozen APK is not this new gameplay milestone.

**Known visible-shell limit:** a released housing ceases ball collision and hostile cover entirely. Its moving split outer metal shells remain visible presentation and can be passed through. This inherited contract is retained deliberately so the already-tested ordinary routes and deadlines do not gain new obstacles. `src/carrier.js` marks the shortcut beside the crew-target loop; if shell contact becomes an authored rule, measure the moving hollow frame pieces and retest normal/TITAN routes and target eligibility rather than restoring a solid window blocker.

## Historical audit — before Boarding Raid

The following findings describe the previous Carrier APK behavior, not the implemented rules above. Audited Carrier, Arena, ball/target physics, main and monetize sources, plus the local level-design, game-feel and input guides.

- Carrier has 36 HP; guns 6 HP each; fighters 2 HP, three every 12 seconds; 16 one-hit panels; five 2 HP captive housings. Ordinary balls and LASER deal 1 ship/gun/fighter damage, FIRE 3, TITAN 4. Ordinary/TITAN housing hits deal 1; FIRE clears remaining housing HP. Gun damage does not weaken the carrier.
- Opaque hull and closed shutters take damage; the open bay and cannon sockets are empty. Live hull targets have no pierceable:false flag, so powered balls skip their solid response. The disabled body explicitly blocks powered passage. The ship is damageable, but empty-bay shots and weak 1 HP feedback make this unclear.
- The shared attack scheduler begins at 3.2 seconds, then checks every 4 seconds. It can select a fighter only at age 1.1–2.1 seconds; otherwise it selects a gun. A departing fighter can cancel before firing. Thus fighters can attack, but most movement has no guaranteed consequence.
- One warning lasts 1.1 seconds, then a 215 u/s shot fires. Intact panels, housings and closed shutters absorb it without damage. The ±0.25-radian aim clamp can miss the indicated target from moving sources. Paddle hits only stun for 0.7 seconds; they do not hurt crew or advance a failure.
- Only exhausted ball lives causes loss. Winning requires carrier HP 0 and all housings open, then completed worker exits. No crew abduction, jump or deadline exists. Keeping a ball alive permits indefinite progress.
- Caught serves freeze the encounter clock. Focus slows world time to 25%, with a 1.6-second earned catch. Twelve panel/housing breaks fill one paddle core, automatically spent on a centre-return TITAN. No Nix/Tick runtime command exists.

Existing ad Continue (two offers per attempt) / full unlock are optional local placeholders, not real SDK/payment integrations. Both proposals reuse that recovery interface; no new store product or SDK is in scope.

## Approved shared rules from the option brief

| Area | Rule |
|---|---|
| Readable ship damage | Carrier 18 HP; guns 4 HP. Actual HP removed from a gun also removes that amount from carrier HP, once. Opaque plates/closed leaves remain valid targets; empty bay remains empty. Local 60 ms impact flash, recoil/sound and three diminishing command-optic segments make damage visible without another large HUD bar |
| Nix | Keep exactly the existing single charge: 12 legal panel/housing breaks. One deliberate 52 CSS face tap spends it on ONE existing ball for 7 seconds of TITAN; prefer caught ball, otherwise lowest live ball. No ball means no spend; repeated active taps do nothing. Remove automatic centre-return TITAN for this loadout; SPLIT does not copy an active TITAN. No second meter or free double use |
| Tick | At housing HP 0, secure its latch over 0.8 seconds during worker release. A secured identity is permanent and cannot be rewarded/targeted twice. Worker exit still finishes before victory. The original option boards used outside-playfield role callouts; current companion family status is recorded above |
| Existing powers | LASER damages the nearest real target; SPLIT widens coverage; SHIELD retains its two missed-ball saves, not undisclosed bullet immunity. No paid power is required |
| Enemy cover damage | Ordinary panels lose 1 HP and absorb the shot. A marked cache still drops its capsule, requiring a catch. Enemy work gives no score/combo/Focus/Nix charge. Housing absorbs without damaging/freeing crew. Warning ends at real first cover; an opened window cannot remain invisible cover |
| Combat safety | Only one active lethal warning/projectile across guns/fighters. Fixed shown lane; 1.2-second warning; 300 u/s shot; at least 0.6 seconds recovery after it is gone. Live/caught balls intercept. Killing a shooter cancels wind-up. Exposed paddle hit costs one life/fresh serve, replacing stun-only; clear threats and give 3 seconds enemy grace after relaunch. No stun-plus-life double penalty or repeated loss from one overlap |

Keep approved art, 125×17 u paddle, 7.5 r ordinary / 10 r TITAN ball, current speed/rally ramp, full-screen background and 126 CSS lower reserve. No Kit, lower track, repeated coaching or invented finished companion sprites.

## Historical unselected option A — Jump Coil

**Rescue before the carrier jumps.** Each secured crew buys time; each gun hit also weakens the ship. Fighters erode cover, then threaten real lives.

| Beat | Exact starting rule |
|---|---|
| Start | First serve has an 8-active-second aim allowance, then auto-launches at its current angle. Jump time starts on manual or automatic first launch |
| Pressure | Start at 110 seconds. Use the existing thin-strip position for jump progress and compact game-font time; final 20 seconds pulses locally. Pressure runs on active real time through Focus |
| Rescue reward | A legal player housing break adds 6 seconds atomically, once per worker, before that tick's expiry check; capped at 110 remaining, at most 30 total bonus seconds. Tick's 0.8-second securing presentation does not delay the earned extension |
| Fighters | Three 2 HP craft each receive a guaranteed firing turn instead of the narrow age lottery. Hold visible flight pose until fired/killed; then depart continuously. First warning no earlier than 3.2 seconds. Cannons use the same shot rule when no fighter has the turn. Defer another squadron if three survivors remain |
| Counter | Two ordinary fighter hits cancel its shot. Also use cover, intercept the bolt, leave its fixed lane, or spend Nix's one earned TITAN. Ordinary ball/LASER gun hits advance carrier damage |
| Shutdown | Carrier HP 0 stops jump charge, recalls fighters and clears shots. This earns safe cleanup of remaining housings |
| End | Win when carrier is disabled, all five secured and exits finish. Jump time 0 with live carrier loses: “Carrier jumped”; zero ball lives also loses. Do not depict already secured crew as killed |

Finite ordinary work is at most 16 panel contacts + 10 housing contacts + 18 carrier damage points; gun damage counts toward those 18 rather than adding a compulsory second grind. This is a hit budget, not a validated time estimate.

**Continue:** freeze during loss/offer/ad. Preserve real HP, rescues, consumed caches and unspent charge. Clear attacks/balls and temporary TITAN without refund; give one caught ball plus existing two missed-ball shields for 10 seconds. Restore remaining=max(remaining,45), capped at 110; rescue bonuses stay spent. Re-serve auto-launches after 3 active seconds; enemy grace is at least 3 seconds after launch. Free Retry resets the ordinary attempt. If no-power play cannot meet the authored window, increase time/reduce HP instead of requiring payment.

## Selected option B — Boarding Raid

**Stop a visible fighter taking one captive.** Destroy it or open its target first. Every completed rescue permanently removes one possible target. No global deadline.

| Beat | Exact starting rule |
|---|---|
| Start/squad | Same 8-second initial auto-launch. First approach no earlier than 6 seconds after launch. Three existing craft form one squad: one active boarder, others queued in upper patrol. No new squad until all three are gone; then 6 seconds recovery |
| Route | Follow the real bay launch, bank around the screen edge, show 1-second edge warning, re-enter over 2 seconds. Never spawn in the return lane |
| Reachable attacker | 36×30 u / 2 HP boarder at paddleY−220 u: 394 u iPhone / 455 u Android, below A's 341.4 u lowest panel. Its visible body must have an ordinary-ball path. Never place below paddleY−200 or compress the lane on short screens; delay approach until safe space exists |
| Target/breach | Choose the nearest eligible unsecured, unfreed housing, then keep its identity fixed. Its route may contain breakable panels, never another intact friendly housing or an unclearable frame. Prefer the exposed lower housing before an upper one behind it. Mark the nearest breakable blocker for 1.2 seconds, shoot a travelling 300 u/s bolt, then recover 0.6 seconds; it removes 1 HP and absorbs. If no eligible route exists, hold/reselect after geometry changes, never start extraction or endlessly fire into friendly/unclearable cover. Open windows use their actual state. Exposed boarder can already be shot twice |
| Extraction | A ball-width clear route starts the entire advertised 8-second ring at the housing and a local tractor connection. Crew stays inside for first 6 seconds; last 2 seconds begin connected pull. Only one extraction; no simultaneous hostile paddle volley during it |
| Stop it | Two ordinary boarder hits kill/cancel immediately, OR clear that housing's 2 HP to cancel and start Tick securing. Killing the raider does not count still-locked crew as rescued. Interrupted partial pulls return to the housing |
| Consequence/recovery | At advertised 8 seconds, “Crew taken” freezes a readable captured-worker state. Zero ball lives also loses. After interruption/securing, wait 4 seconds before the next queued approach |
| Finish | All five secured + completed exits wins. Carrier 18 HP is optional shutdown: it recalls raiders/cancels extraction and can award the third star/bonus. No opaque-hull cleanup after rescue |

The exposed boarder is below cover before charging/capsules: two correct ordinary returns at 220 u distance take roughly 2 seconds without Focus. Confirm the actual moving-body/corner path; do not infer reachability from a thin laser ray.

**Continue:** preserve all secured identities, damage, caches and unspent charge. Undo only the current failed capture, restoring that unsecured worker and its previously earned housing HP; never reset every rescue or silently free it. Clear squad/tethers/bolts/temporary TITAN without refund. Give caught ball plus existing two shield saves for 10 seconds. Auto-launch after 3 active seconds; next squad waits at least 6 seconds after launch. Optional ad/unlock recovery and free Retry remain the existing choices.

## Retained acceptance rules

- Pressure advances during caught replacement serves and Focus; 3-second re-serve auto-launch prevents indefinite stalling. Physical movement can use existing slow time, but mission pressure and short hit-stop do not grant extra deadline time.
- True pause/background stop freezes every pressure, approach, warning, shot and release clock; resume never catches up hidden wall time. Loss/offer/ad screens freeze too. Paused pointer/Space cannot release aim.
- Resolve a legal player interrupt/rescue before a same-tick failure; freeze world mutations after loss/win. Stop pressure when entering successful escape, rather than losing during its presentation.
- A's direct-life 300 u/s fire is a new mobile risk. Enforce single-shot budget, readable lane, ball interception and relaunch grace. B's aircraft must stay at least 200 u above paddle and outside thumb reserve. Test both 393×852 safe59/34 and 412×915 safe32/24.
- The first isolated browser proof establishes ordinary-ball completion with no capsules, Nix or automatic TITAN; owner human play and the final integrated build remain separate gates. Old powered bot wins of 82.3/45.2 seconds do not validate these deadlines. Retain cover/empty-window, cancellation, same-tick, swept-intercept, Continue restoration and exactly-once reward checks.
- Selected work reaches Carrier state/goal/combat/Continue, single resource/input ownership, main pause/offer callers, selected-cast admission and two-phone tests. Preserve Vault/Kit. No backend, store/payment SDK or frozen APK edit follows from this milestone.
