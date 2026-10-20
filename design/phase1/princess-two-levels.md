# Two new princess encounters

Status: both visual boards approved by the owner, 2026-10-20. Preserve their character identities, materials and atmosphere. Separate moving machinery, collision models and browser encounters are in production; approval of a board is not evidence of completed animation or playable balance. The existing snake Vault and Frost Warden remain separate encounters; Brum remains an ally. No new chapter number is assigned by this proposal.

## Latest owner revision and implementation pointers

The owner subsequently requested broader supports, more bricks, a smaller grounded crab, a real chain in its claw, lateral movement, hurt/anger responses and a distinct attack. These requirements supersede the preliminary counts and claw-on-wheel proposal below. Bellforge now has 30 coloured cells on both phone layouts and extended rolling ramps; Tidewheel has 24 cells on two moving rafts. The crab hauls a chain around a lower hoist, with warned stronger pulls after repeated hits and a separate interceptable water projectile. Keep the ordinary ball in the readable 2D foreground; buoyant rafts and bounded currents supply the water interaction. A parabolic aiming system is not implemented.

The authoritative numerical contracts, actual geometry, reproduction commands and evidence are [Bellforge physics](../../docs/BELLFORGE_PHYSICS.md) and [Tidewheel physics](../../docs/TIDEWHEEL_PHYSICS.md). Current browser entry points are `prototypes/fantasy/?level=bellforge` and `prototypes/fantasy/?level=tidewheel`. They are standalone previews, not new slots in the five-chapter APK. The remainder of this document preserves the approved visual direction and original design proposal; use the implementation documents when their measurements differ.

| Board | Main physical play | New villain | Kit signature |
| --- | --- | --- | --- |
| [A — Bellforge Run](img/princess-bellforge-a-v1.png) | Rolling iron bells, hinged ramps and momentum reversal | Korr, a four-legged armoured boar | Echo Guard redirects one live bell |
| [B — Tidewheel Citadel](img/princess-tidewheel-b-v1.png) | Buoyant brick rafts, counterweights and sluice flow | Nerra, a castle-shell crab with two different claws | Undertow Anchor reverses a surge |

Both preserve the actual blonde/pink/crowned Lumi and navy-armoured Kit reference identities. The lower-left control remains Kit's face orb. Large Kit poses on the right are presentation studies, not a full body under the paddle. Villains have their own anatomy and motion: Korr's short hoofed legs, tusks and heavy snout; Nerra's shell, stalk eyes, crusher claw, gate claw and articulated walking legs. There is no new ape, snake recolour or Yeti variant.

## Common controls and fairness contract

Keep one-finger paddle movement and the existing ball/aim language. Use the current 360-unit world, ordinary radius6, nominal speed345 and100×14 paddle as the first blockout baseline. No mode changes input sensitivity or secretly changes collision size. Equal36×18 coloured bricks give broad productive contacts; grey decoration must not become invisible blockers. Keep at least42-unit flank paths and32-unit gaps at every extreme moving pose. Those dimensions must admit the full normal and cosmic ball diameter with clearance, not only their centres.

Keep the lowest brick/physical obstacle at least210 units above the paddle on the shorter phone layout, plus the existing126CSS-pixel lower control reservation. At345u/s that is roughly0.61s of straight downward travel, or0.48s at the1.28 rally cap; these are travel estimates, not measured human reaction. Both393×852 and412×915 require an actual layout pass. The boards are art/composition studies rather than literal phone measurements; their HUD, type, object counts and perspective are not automatic runtime specifications. Use Lilita One/Rubik in production.

Broad villain body contacts always reduce HP, including during preparation/recovery. There is no compulsory tiny weak point, ordered symbol, narrow opening, purchased item or timed invulnerability wait. Environmental counters provide faster, more satisfying damage. A safe opening demonstrates each hazard before it can harm Lumi. Pause, background suspension, aim/serve and Continue must have explicit clocks: first serve starts pressure; replacement serves auto-launch after3 active seconds; Focus/SLOW do not freeze enemy threat time; true pause and the power picker do.

For these proposals, each Kit signature uses one existing orb resource, with provisional18/22/26 productive ordinary-hit credits banked at no more than one credit per active second. No second meter or free double spend. Enemy destruction, arrows and active cosmic contacts cannot recharge their own power. This is a proposed per-level charging contract, not a change to existing Vault/Frost rules. Usual pickups can remain optional. Saturated/unavailable casts keep charge.

## A — Bellforge Run

**Story and objective.** Korr has jammed Lumi's bell-lift above the foundry. Defeat his broad armoured body, stop the winch and open a bridge so Lumi can leave. The rear plinth/arches are clearly recessed scenery; only the foreground ramps, weights, bricks and measured actor silhouettes collide. The board's dramatic background bell is scenery unless explicitly admitted as a physical asset.

**Physical loop.** Korr lifts a hoof to cock a visible bell hopper; a1.3s minimum snort/lever tell previews the chosen ramp. A radius14 iron bell rolls through short, visibly hinged ramp sections under bounded gravity, angular motion and actual contact normals. Author its full route to a counterweight dock beside the lift; do not teleport between ramp endpoints. Ramp pins are broad optional30×18 breakable housings: breaking one rotates its connected ramp smoothly to its stop and opens a return lane. Both poses remain collidable. The safe teaching bell falls into an empty catch tray without moving Lumi.

A normal ball contact deals one bell HP and imparts a capped physical impulse. A bell has2HP: the first contact can slow/reverse it; a second shatters it. A returning bell that reaches Korr's broad shoulder deals4HP and staggers him for1.5s. Side/body hits by ordinary balls still deal1HP throughout. Broken bell fragments are visual, give no charge/drop farming and never damage Lumi or the paddle.

**Stakes.** A bell that physically reaches the dock turns the visible ratchet one tooth, lowering Lumi's lift by12u. Each mode starts with enough visible travel above a guarded danger stop for the misses below. The final approach gets a distinct ratchet clang, trembling chain and Lumi's worried face. Failure stops the lift and fades before any injury. The dock cannot double-trigger while a bell overlaps it. Lost player balls retain the usual life cost; a rescue failure and last-life miss resolve only once.

**Echo Guard.** On a charged tap during a live bell warning/route, Kit forms one solid shield deflector in its visibly previewed catch lane for3s. One bell makes real swept contact, rebounds up the open return ramp and can strike Korr; the shield then retracts. No long light trail, remote instant boss damage or invisible catch volume. A tap with no eligible bell holds charge. Normal ball defence remains sufficient.

| Provisional mode | Korr HP | Bell interval after first harmful release | Active bells | Lift mistakes allowed |
| --- | ---: | ---: | ---: | ---: |
| Easy | 24 | 10s | 1 | 8 |
| Medium | 32 | 8.5s | 1 | 6 |
| Hard | 40 | 7.5s | 2, staggered by≥3s | 5 |

First harmful release is no earlier than12s after launch. No overlapping same-lane warnings. After a successful reversal give a1.5s stagger/breather before preparing another bell. Last boss HP loss immediately latches safe rescue; subsequent ball drain or bell arrival cannot revoke it during the bridge/lift animation. Continue retains boss/ramp progress, restores two ratchet teeth up to the starting allowance, clears live bells and grants at least3s warning grace; it does not resurrect the boss or duplicate rewards.

## B — Tidewheel Citadel

**Story and objective.** Nerra holds the castle's sluices shut while Lumi shelters on a high refuge balcony. Defeat the crab and empty the basin. Lumi then opens the final manual gate, giving her an active rescue beat. This encounter has no cage or marching protector posts.

**Physical loop.** Two buoyant raft frames each carry a3×3 array of equal breakable bricks. Initial centres are approximately(94,300) and(266,300); each raft's full collision hull, brick cells and ropes must move together. Author bounded bobbing/tilt (≤8°) and horizontal drift so the minimum flank/gap contract survives all poses. Independent broad counterweight housings take2 ordinary hits and open their connected sluice for4s, draining24u of water. They are optional shortcuts: all ordinary shell/claw impacts still reduce Nerra HP.

Nerra's gate-handling claw pulls back for1.5s, water visibly gathers, then a low surge travels across the basin. A warned surge raises the waterline by24u and pushes raft mass; it is not an instant wall deletion. Water starts at y420 and failure is reaching Lumi's safe line at y190, leaving230u of initial headroom. Water affects raft buoyancy and applies a bounded, smoothly ramped horizontal current of at most25u/s to the ball; it never changes ball collision radius, reverses vertical velocity without contact, teleports the ball or hides it behind foam. Player balls and actors remain in the foreground. Refraction/foam stay faint around the bright ball. Prototype this simplified height/current system before any fluid effect production.

Two normal ball contacts on the preparing gate claw cancel that surge, but hitting its large shell is always productive damage. One claw can attack at a time; no simultaneous hidden surge. For teaching, the first pulse is contained below a harmless marked ledge. A released counterweight and active surge use swept tests against visible geometry; no unconnected rope or silent collider remains after destruction.

**Undertow Anchor.** A charged tap deploys a tangible anchor on the local sluice wheel, connected by a short visible chain. It reverses that wheel for4s, cancels the next preparing surge and drains one24u step. This is one local physical tool, not a beam from the corner portrait, a global time freeze or repeated free healing. While no gate/pulse is eligible, charge is retained.

| Provisional mode | Nerra HP | Harmful surge interval | Current cap | Warning |
| --- | ---: | ---: | ---: | ---: |
| Easy | 24 | 11s | 15u/s | 1.8s |
| Medium | 32 | 9.5s | 20u/s | 1.6s |
| Hard | 40 | 8s | 25u/s | 1.5s |

First harmful surge is no earlier than12s. A cancelled surge grants2s of calm water. Last32u of headroom triggers a visible waterline/face warning, not a new opaque HUD panel. Defeat latches success before any same-tick surge/life loss, opens both gates and freezes damage during Lumi's escape. Continue preserves boss damage and broken housings, lowers water48u, clears the active pulse and grants3s grace; it never rebuilds already broken score bricks or duplicates drops.

## Production and test gates

These values are starting hypotheses, not bot/human balance claims. Make one bounded ordinary-ball blockout for each before dressing the full level. Test whole-ball access around every moving ramp/raft pose; compound actor once-per-contact damage; angular/rising-water motion against the same drawn geometry; earliest swept contacts; no enemy-farmed charge; normal-ball wins with no optional power; earned signature before the encounter ends; no timing stall exploit; same-tick victory precedence; pause/Continue/save state and native touch/readability on both phone sizes. Preserve failures and adjust tuning from evidence.

Korr needs idle/snort/hoof lever/roll release/shoulder stagger/hurt/disabled clips, readable face expressions, separate bell/pivoted-ramp/lift-ratchet/bridge assets and real articulated hoof anchors. Nerra needs idle/claw grip/windup/surge/recoil/hurt/retreat clips, shell/claw/leg collision poses, separate raft/rope/counterweight/gate/water layers and measured joint anchors. Both reuse existing Lumi/Kit rigs and expression quality, but require finished source-faithful assets and in-engine comparison; these boards are not sprite sheets or finished models.

## Reference research and preservation

Nintendo describes the original arcade game as climbing through a construction site to rescue Lady while dealing with obstacles, barrels and the hammer. The useful abstraction is a visible goal above readable moving hazards—not Nintendo's characters or exact map. [Official Arcade Archives DONKEY KONG](https://www.nintendo.com/us/store/products/arcade-archives-donkey-kong-switch/).

Nintendo's Returns HD tips describe jumping, rolling, ground pounding, grasping objects and riding hazards, with a more forgiving mode offering additional health/recovery. Those are references for physical cause/effect, variety and explicit assistance; the bell momentum, sluice/raft rules, villains and Kit signatures here are original design proposals. [Official Returns HD controls/tips](https://www.nintendo.com/us/whatsnew/get-tips-to-start-your-barrel-blasting-adventure/).

Original local references: `assets/princess/Idle_00.png`, `assets/kit/Idle_00.png`, `assets/kit/faces/Idle_face_00.png`, `assets/vault/brick_b_1_0.png`. Both1536×1024 RGB boards were made with the built-in image tool and have empty PNG metadata. Prompts and reference paths: `princess-two-levels-prompts.json`. Image SHA256: A `53ef9248cd4bdc24dc8378c3ac014cd82491bff3869c7bbad0ea309a40a8aba5`; B `c2b5b6b26c8555374fe4dda98fde9d6764967e4b6667884f0aba064d8b2a7351`. Runtime, APK, shared handoffs and archive catalogue are untouched by this design task.
