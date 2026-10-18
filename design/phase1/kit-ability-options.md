# Kit's Ward â€” face-orb placement



Status: owner selected **A — left face orb**. Native source is integrated and the focused Kit input/motion checks passed on both phone sizes; the coordinated full-game checks and owner review remain separate gates. Right is retained as the unselected placement study.



The latest direction replaces the standing deck character and horizontal charge bar with **Kit's face inside one circular charge orb**. When ready, tap the orb at a venom warning: his full body appears for a proposed 12 s ready/cast/reaction window, channels a ward when tapped at warning, then recedes into the face icon. There is no permanent fullbody avatar, separate Ward button or second resource meter.



| | A â€” face orb on the left | B â€” face orb on the right |

|---|---|---|

| Location | Left deck corner, world x = 64 | Right deck corner, world x = 296 |

| Control | One deliberate 52 CSS px circular face control | Same control and mechanic |

| Charge | Ring around the actual Kit face portrait; eyes stay clear | Same ring |

| To evaluate | Open center/right thumb drag lane | Deliberate reach from a right thumb |



A is selected for production. Both must clear the paddle/drain region, the full moving grip envelope at both walls, lives, AIM and bottom safe inset. Required gap: at least 8 CSS px from the orb/cast envelope to the drain and moving grip. Real-device comfort remains to be tested.



## Shared proposed mechanic



1. **Break â†’ charge.** Twelve broken bricks fill the ring. Each break sends light toward Kit's shield/face orb. Twelve is a proposed starting value.

2. **Two hits â†’ warning.** Venom never fires on entrance. The current isolated proposal counts two distinct valid head or body ball contacts; repeated overlap counts once, with the existing 0.35 s global contact guard. Head hits keep their full stun/knockback; body hits keep their short flinch. Warning waits until the active earned stun/flinch ends. Contact scope remains a balance choice to approve.

3. **Read â†’ tap.** The serpent locks one useful destructible partition and gives a visible 1.4 s warning. Tap the full face orb with at least 0.18 s left for Kit's cast. No aim mode is needed: the marked partition is the target.

4. **Pop â†’ channel.** Consume the full ring once. The face recedes, Kit's fullbody pose appears, and shield light transfers visibly to the actual target. The ward protects this volley only; the separate 12 s character display does not extend protection. Current Focus sprites are pose proxies; the body currently uses the approved production sprite families while bespoke channel anatomy/motion refinement continues separately.

5. **Spray â†’ ward.** Organic venom strikes the reinforced target; this partition survives and this shortcut stays closed. Protection lasts through this volley plus 0.25 s. This is a local ward, not protection for the whole level.

6. **Empty or late â†’ melt.** Without a valid cast, venom can melt the real partition and shorten the serpent's route. It does not dissolve the cage frame or bars.



The selected implementation uses these timing and resource values as an initial tune, subject to integrated playtesting. The level prototype owns targeting, spray, destruction and success/failure checks. The boards reuse its actual captures, rather than a duplicate gameplay simulation.



## One resource tradeoff to approve



Recommended: **Serpent Vault reserves its existing core charge for Ward; Invasion keeps Titan.** A Vault center return would no longer spend that same charge on Titan. No second meter or free simultaneous Titan/Ward is proposed. The separate existing AIM pips keep their current purpose.



XP, hero levels, stores and new chapters are outside this proposal.



## Proposed 12 s presence



The transition from less than full to full charge starts one 12 s body-display window. A valid Ward tap inside it keeps the original expiry. A valid tap after the body has receded starts one new 12 s cast/reaction window; no per-frame refresh loop. Receding never spends charge or disables the ready face orb.



The display follows play: ready Grin/Idle, Focus during warning/channel, a 0.85 s success Cheer or missed-ward Worried, then the current normal reaction. Cast/success feedback outranks ordinary danger briefly; terminal and hurt reactions keep priority, and live tension returns after feedback. No nonstop celebration. Gameplay continues throughout; the display grants no invulnerability or pause. These are prototype timings, not approved balance.



The owner also requested expressive win/lose result appearances; using all eight expressions in those later screens is planned scope, not already implemented.



## Safe first-use practice



1. Demonstrate brick-break light filling the circular ring, without awarding run score or persistent currency.

2. Show the serpent entrance and normal movement, then two clearly separated ball hits. Let the earned stun finish before the warning; no opening venom.

3. Hold the ball safely and pause the first practice warning. Show **KIT CAN GUARD THIS WALL / Tap Kit while his shield is full.** Highlight the actual face orb.

4. Tap. Play Kit's cast, the transfer to the actual brick, and the organic volley. Show **WALL HELD! / Break bricks to refill his shield.** The ring is empty again and Kit's face is back.

5. Offer an empty-ring replay: the same target melts and the route changes. Reset the practice scene afterward, with no life loss or permanent run mutation.

6. Continue into normal play with the normal charge state. Practice does not grant a free second resource. Entry/exit state and skip behavior need approval with production implementation.



The interactive board rehearses warning/tap/success using captured gameplay frames. It is a practice layout preview, not a shipped tutorial or a second collision simulation.



## Input, motion and readability



- The charge ring sits outside a circular crop of the actual 288 px Kit face portraits. It must not cover the eyes. No new face is substituted.

- Ward is one named action. Touch starts and ends inside the 52 CSS px orb with at most 8 CSS px travel. Pointer cancel does nothing. A paddle drag starting elsewhere cannot activate Ward by crossing the orb.

- The face orb has ready/spent shapes and charging motion as well as color. No tiny horizontal bar or beneath-bar state label is retained.

- Only the 12 s ready/cast/reaction window shows a fullbody sprite. Check orb/cast envelope and circular meter together at native size; the center drag lane stays open.

- Native input assigns separate pointer ownership to the orb and paddle. Orb movement over 8 CSS px cancels that tap; a crossing paddle drag cannot trigger it, and releasing an orb finger does not release the paddle/Focus. Pointer cancellation never fires Ward or launches a caught ball. Simultaneous touch handling still requires integrated browser tests and physical phone comfort checks.

- This defensive ward does not silently reset the serpent's hit counter, cancel fury, or erase earned stun. Any such balance rule requires a separate explicit choice.



## Deliverables and validation



- Two boards: img/kit-ability-ward-left.png and img/kit-ability-ward-right.png. Each shows native iPhone 393 Ã— 852 and Android 412 Ã— 915, idle/ready face orb, 12 s fullbody display/cast and first-use flow.

- Editable capture-based preview: ignored out/kit-ability/ward-board.html?side=left|right.

- Actual isolated gameplay and success/empty/late checks: out/venom-prototype/.

- Superseded offensive and fullbody/bar layouts remain only in ignored out/kit-ability/history/; they are not active choices.



The option boards were isolated previews. After the owner selected A, the native Arena/Kit/input implementation and packed face atlas were authorized and integrated; the Blender source and sprite family were not changed for this feature. Initial frozen baseline SHA-256: 00A6756BDF0A3B8D0EE61AD6EC00ED6A5D3DE2D0A23A2383B9FA173634301BDB. Final Kit QA candidate SHA-256: 3A6B8A8C5368364AFCFCE6BBF7B1994D4598C121C90B45B72FE5BD7E45285EC1; checked before and after capture.



Current verification: all 21 unit tests pass, including one-shot presence windows, live-window cast behavior, both phone-scale orb/body/drain/grip geometry, deliberate circular taps and brief ward feedback priority. The two 1720 × 1190 boards were visually inspected and PNG metadata stripped. The capture-based preview passed tap/crossing-drag checks with no page errors. Native production was packed and built. Independent iPhone/Android checks passed deliberate taps, corner rejection, out-and-back cancellation, real browser touch cancellation, retained caught-ball state, Invasion Titan hint without spending charge, and short success feedback returning to high-danger Worried. No page errors occurred. Physical-device comfort and difficulty tuning remain unverified.



Native contract: Vault sets coreMode=ward and implements canUseKitPower()/useKitPower(). A successful cast consumes its charge once and sets kitCastAt. Resolution sets kitWardResult and kitReactionAt. Arena owns kitAnchor(), the ring/body display and 12 s timing; main supplies the actual kitUIScale and routes each pointer. Invasion retains center-return Titan; tapping its orb gives the trigger hint without spending charge. The paddle gem is a ready cue, not a second progressive charge meter.


First-use implementation: the first eligible charged venom warning raises wardCoach. Gameplay t/balls/venom/life timers pause; kitTime alone advances the face/body display. Only a successful deliberate Ward cast dismisses and acknowledges this coach; no charge or life is granted. Outside taps or Space release cannot launch the held ball while coached. World-pause/restart coaching checks are tracked by the level/integration suite; the independent Kit edge suite bypasses coaching intentionally to isolate input behavior.

Final Kit evidence: out/kit-orb-independent/report.json and native/ phone captures; out/kit-ability/motion-report.json and kit-ward-motion.gif (16.6 s). The native motion capture uses a scripted full-charge fixture and two separate incoming head contacts, then real orb input and normal game updates. It shows Focus, short Cheer, live Idle, and return to the face orb after the 12 s body window. One ward held target [13,6], zero partitions melted, and route cost stayed 54.15. This is a controlled mechanic demonstration, not an unseeded completed run.
