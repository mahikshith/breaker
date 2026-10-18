# Selected magnetic extraction and Quick Volley

**Latest correction (2026-10-19):** The owner rejected the4189 panel-destruction studies. Enemy cannon shots must bypass intact bricks to attack the player. Carrier's current enemy brick damage and Circuit/Forge's cover absorption are superseded requirements, not the intended new behaviour. The common Nix/power menu across all space levels is also rejected. Revised cannon, skiff and companion studies are tracked in [weapon-vfx-v3-review.md](weapon-vfx-v3-review.md); gameplay remains unchanged pending visual approval.

The owner selected ship effects **A: Magnetic funnel and plasma fire**, and Kit menu **B: Quick Volley, one row**. These selections are implemented. Subsequent feedback requests stronger distinct boss weapons, especially on Hard, and explicit companion power limits. The owner was viewing the older4186 build; that snapshot remains preserved. Current testing uses [the4188 hub](http://127.0.0.1:4188/), with Carrier, Circuit, Shutter Forge and Vault links in all modes.

## Implemented

Carrier extraction is a filled, tapered curved field with compression rings and inward particle flow. The actual worker follows the same curved path and remains clear of the raider until capture. Interrupting the raider returns the worker on that path. The field is cosmetic and retains the existing extraction timing, cover and rescue identities.

All three space bosses use shared `src/space-weapons.js`: a bright plasma collision core,28u directional wake,140ms muzzle bloom and compact real-impact feedback where supported. Actual muzzle positions and launch clocks drive it. Current normal bolts retain their existing3.5u collision radius and speed. This visual refresh does not constitute the subsequently requested stronger Hard weapon patterns. Cannon health appearance now uses the real HP ratio rather than an obsolete18HP divisor.

Kit retains his face at bottom left. A full charge opens the selected one-row four-card sheet: **Brick Ward, Arrows, Cosmic, Ball Fan**. The entire world pauses while choosing. Cancel/Escape/pause keep the charge and clear stale touches/Space. A selection spends once; keyboard1/2/3/4 matches the four cards.

Brick Ward remains the real spinning-shield/brick-armour protection against an eligible venom warning. Its card is disabled outside the actual casting window. The first-use coach now says to tap Kit, then Brick Ward. Choosing another power intentionally resumes the coach without inventing protection. Arrows uses twin physical shots from small paddle crossbows; shots break reachable bricks and sting the serpent, while granite/cage bars still block them. Cosmic uses the existing pulsing cosmic sprite, halo and motion ghosts, with the same breakable-brick piercing and approved protected granite/cage collision. Ball Fan adds ordinary balls without copying Cosmic. No full-body control replaces the persistent face.

Kit's charge still comes from12 ordinary brick breaks, preserving defensive Ward access. Arrow and active Cosmic breaks still count for score, combo and Focus but cannot recharge their own replacements. Space charge uses18/22/26 banked productive ordinary contacts on Easy/Medium/Hard and at least18/22/26 active update seconds; menus, pause and transitions stop it. It is earned credit, not passive regeneration.

## Current power limits

| Mode | Live balls | Simultaneous Cosmic balls | Selected power duration | Maximum remaining LASER / ARROWS / Cosmic time |
|---|---:|---:|---:|---:|
| Easy |12|2|10s|20s|
| Medium |9|2|10s|18s|
| Hard |5|1|10s|14s|

These limits apply to Kit and all three Nix space levels. SPLIT and BURST pickups use the same live-ball limit; they cannot bypass it. Repeated Laser/Arrows add time up to the mode ceiling. Cosmic powers another ordinary ball only below its simultaneous limit; otherwise it extends a live Cosmic ball up to that ceiling. A saturated card is disabled and a rejected choice keeps the charge. Existing WIDE still stacks actual width/time within the playfield; other non-companion pickups retain their existing rules. These settings are a testable tuning candidate, not approved human balance.

## Stronger Hard weapons: design gate

The owner's original rule requires two or three images and a pick before new visual designs are built. Two stronger weapon-family boards have been shown using the approved ship assets: [A: Charged laser strikes](img/space-hard-weapons-a.png) and [B: Break the battery](img/space-hard-weapons-b.png). Both boards were subsequently rejected as stale and inconsistent with the rendered motherships. They are retained as rejected history. Replacement moving visual studies are being prepared with the actual cannon materials and geometry; the owner explicitly withholds gameplay implementation approval until the visuals pass. Later selected attacks must have distinct Carrier/Circuit/Forge roles, true warning footprints and reachable counterplay with the current paddle width. A full-WIDE paddle may leave too little lateral travel: attacks must find a genuinely reachable safe pose or abort; a drawn narrow gap is not proof. Current SHIELD saves missed balls and must not silently be claimed to block enemy beams. No new Hard beam collision, cover erosion, extra shield defence or36s charge setting is live yet.

## Verification and boundaries

Current runtime tests cover mode caps, no-self-recharge, selected Kit choices, Ward target preservation and canonical Cosmic rules. Actual Main/CDP tests cover three space levels ×three modes ×two phone sizes, plus Kit on both phone sizes in every mode. The Kit checks stage earned charge/contact fixtures explicitly, then use actual arrow collision, incoming snake contact, venom targeting, warning, coach, shield protection and real touch input. Staged screenshots are labelled. These are lifecycle/render/counterplay proofs, not unassisted wins or physical phone performance measurements.

All196 unit tests and24 final phone/mode cases pass with zero page errors, including66 Kit check groups and the actual0.4 disabled Cosmic icon alpha. Final HTML hashes are Carrier `c404346220646c2f671987204710f190c031b08228990dd4778a2ff0d5fadcfd`, Circuit `31fd49e80d9e0299403914a2d8479e49d3d0e899818170538276639b3ccff08f`, Forge `144524ad1418c4439e518969378c3e662d5e1d885667a359c5f7fe86d2148202`; production is `6bbebeca0fde25cae39bbc440cebf919d20eaf7c5152be4e023a141606981e33`. Exact HTML/source hashes and receipts are sealed under `out/space-selected-review/final-report.json`. Native plasma captures are in `selected-proof.json`; Carrier suction media is under `carrier/beam/`; Kit proof is under `kit-phones/`. Required polish/layout and compact mobile UI use the production Carrier/Vault build. Earlier4186/4187 and the delivered APK remain unchanged. Permanent Circuit/Forge menu/progress admission, a new APK and new CI are not part of this local review checkpoint.

Update the handoff docs and run `python tools/make_handoff.py` at this milestone. New design artwork belongs in the permanent [artwork library](../../docs/ARTWORK_LIBRARY.md). The latest push instruction contains both immediate-push and wait-for-comment wording; no new gameplay commit or push is implied while the new Hard design pick/review remains open.


One existing coarse Easy attempt per phone/ship wins with3lives and no Retry/Continue or tuning: Carrier32.54/55.01s, Circuit34.89/52.76s, Forge42.89/49.90s. Their actual Nix casts are earned. A separate coarse Carrier Hard policy loses on both phones at18.125s before its first Nix cast; this is not proof of human impossibility, but does not justify a further charge delay. The final weapon boards retain26s. Older unselected36s boards are preserved under `img/history/space-hard-weapons-36s-unselected/`, and all670 artwork originals/records are verified in the permanent library.
