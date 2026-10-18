# Space cast and distinct companion roles

**Current decision (2026-10-19):** Both heavy and salvo fire are approved and implemented. Vesper/Latch are selected for Circuit; Forge has a neutral arsenal until a cast is chosen. Remaining design decisions are delegated by the owner. Historical proposal/review text below is retained as evidence. Current runtime details: `docs/SPACE_COMBAT_HANDOFF.md`.

2026-10-19. Reference audit and proposed next design only. The owner rejects the same companion and three identical powers in every space level. No character selection, new asset admission or gameplay change is made by this document. The tested 4188 build remains unchanged.

## What was actually selected

| Level | Exact original board | Evidence and approval status |
|---|---|---|
| Carrier Breakout | `design/phase1/img/space-carrier-a.png` | **Nix and Tick appearances explicitly selected.** `carrier-companions.md` records that pick and the later Boarding Raid selection. Real expressive atlases exist in `assets/space-companions/{nix,tick}.png`; inventory is `assets/space-companions/manifest.json`. This does not approve every new power proposed below. |
| Circuit / former Relay Raiders | `design/phase1/img/space-relay-b.png` | **Vesper and Latch are preserved concepts, not currently admitted Circuit characters.** Handoff 01's “new animation and space choices” entry records the earlier B pick; its later “space visuals reopened” entry and `space-direction-review.md` reopen that authority. Subsequent approval focused on the left playfields, then Nix/Tick were selected for Carrier. `relay-gameplay.md` explicitly excludes both pairs. Renewed cast confirmation is needed. |
| Shutter Forge / former Orbital Breakout | `design/phase1/img/space-orbital-c-v1.png` | **Nova and Pin are visible concepts, with no cast selection.** `orbital-level3.md` explicitly says “Nova and Pin have no cast selection”; `orbital-gameplay-variety.md` preserves that boundary. Selecting Shutter Forge A selected its machinery/activity, not these characters. No approved Forge companion exists. |

The original appearance prompts are preserved in `space-board-prompts.md` and `space-options-cd-prompts.md`. The canonical contact sheet `design/phase1/weapon-vfx-v3/cast-roles.png` uses crops from those exact boards, without repainting them; its working copy and crop/hash receipt remain under `out/weapon-vfx-v3-cast/`. A generic archive entry or a prompt is not approval. In particular, the reopened fish direction does not automatically authorize Latch production.

Nix is the compact lavender gill-finned pilot. Tick's actual selected appearance has **four walking legs**, plus separate pincer and driver; older six-leg prompt text is superseded by the actual reference/production contract. Vesper has four paws and a steering tail in a fitted skiff. Latch has fins, tail and jaw within a local water habitat. Nova is the four-pawed moon-hare with canopy clearance for long ears. Pin is the triangular maintenance drone with three folding magnetic feet. None should inherit a shared humanoid arm template.

The repetition is real in current source: Carrier, Relay and Orbital all set `spacePowers=true`; `Arena.drawDeck` renders Nix for that flag, and the shared `chooseSpacePower` supplies the same three actions. Carrier also explicitly calls `drawNixControl`. There are distinct reference casts, but the common control was extended to every level before those casts/actions were admitted. This audit does not change that frozen implementation.

## Proposed signature roles

These are small complete proposals to show beside the preserved characters. Keep one familiar face control and one earned resource, while changing its actual purpose per level. Replace the identical three-card companion menu; common LASER/Cosmic/ball pickups can remain authored collectibles with their current mode caps.

| Pair | Role and one signature action | Consequence, counterplay and limits |
|---|---|---|
| **Carrier: Nix + Tick** | **Tow Break.** Nix identifies the threatened worker; Tick physically clamps/cuts that housing's active boarding tether. | Cancel one real extraction and return a partially pulled worker continuously to its still-locked housing; protect that housing from retargeting for 6 active seconds. It does **not** open the housing, secure a worker or damage the whole ship. No eligible extraction means no spend. The ordinary two-hit boarder interruption and ball-hit housing rescue remain the baseline. Tick's new cancel clip must not show a false green secured latch. |
| **Circuit: Vesper + Latch — proposed** | **Relay Jam.** Vesper owns the existing earned skiff assault; Latch swims to and clamps one live cannon mechanism. | Hold that cannon's physically open firing port for 6 active seconds and cancel its unlaunched warning. A shot already in flight remains dangerous; other machinery/ball clocks continue. No live gun means no spend. Broad ordinary ship damage stays valid. The existing once-only half-HP skiff burst remains level progress, not a second charge meter or a purchased key. |
| **Forge: Nova + Pin — proposed** | **Forge Temper.** Nova aligns the forge tool; Pin attaches a short-lived tempered surface to one ordinary ball. | For up to 8 active seconds or three productive contacts, that ball deals 2 HP per legitimate armour/boss contact. No larger radius, structural piercing, extra balls or laser fire. The ship still rebounds physically and ordinary untempered hits still progress. One physical episode can consume only one temper contact; powered hits cannot recharge this cast. If no ordinary ball is eligible, retain charge. This is targeted forging support, distinct from general Cosmic. |

The existing banked 18/22/26 earned credits and minimum active seconds are a reusable starting resource, **not human balance approval for these new actions**. Pause, background and a choice overlay freeze its clock. Continue retains legitimate progress without replaying one-time rewards; rejected/unavailable actions retain charge. Avoid an additional bar or permanent full-body actor in the thumb lane.

Forge Temper needs a heavy physical forging beat: Pin seats a real split-metal tool, Nova commands the strike, and the contacted armour buckles with local directional fragments. A small glow or a number change alone would not establish that purpose. Its three-contact/2-HP sketch is a starting example, not a target for the requested ferocity or approved tuning; prove the armour bonus, impact clarity and useful encounter effect through actual play before setting strength.

## Smallest production and review gate

Carrier can reuse its approved face and tool family, but Tow Break needs an actual tether/contact/cancel sequence distinct from Tick's successful secure. Vesper's `art/vesper.py` and `out/relay-proof/vesper-v7/` are historical source/expression/walk proofs, not a finished reference-matching pilot family. No finished Latch, Nova or Pin runtime sprite family is present under `assets/`.

First confirm the proposed B/C appearances and roles from the original images. Then prove one face, three expressions and one native-size action/contact cycle for each selected pair before producing a full family. Require exact anatomy, source-quality materials, clear tool contact, no overlapping captive/ball, real current machinery anchors, ordinary-route winnability, no charge feedback loop, once-only spend, true pause, terminal/Continue ownership and both phone sizes. Do not silently paste Nix onto Circuit/Forge or claim Nova/Pin are approved because their board exists.
