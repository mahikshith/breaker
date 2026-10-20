# Lost Keeps: mobile layout, reactions and powers

2026-10-20. This revision follows the owner's Bellforge load-error report and Tidewheel playtest. It updates the standalone fantasy preview and the original Vault's presentation. It does not update the previously delivered APK.

## Bellforge loading

`prototypes/fantasy/layout.js` owns the conversion from the actual host rectangle to the 360-unit game world. The world is at least 700 units high; the paddle reserve is bounded to 90–120 units. The previous fixed 126-CSS-pixel reserve became too large in a short preview and violated Bellforge's `paddleY >= 580` requirement. The model guard remains intact. Retry adopts the current viewport; resizing an active encounter pauses it and preserves its existing world.

The face orb scales down with a short portrait playfield and retains safe-area insets. Short-window menus scroll, and the pause button keeps its touch area with a lighter visual treatment. Phone layouts retain the clear reaction lane.

## Clear defeats

The final hit immediately disables harmful work. Korr recoils, changes to a dazed face, slumps into a separate closed-eye pose, and settles on the same plinth before Lumi's lift rises. His full ending is 3.4 seconds. Nerra staggers, drops her independent claws into resting poses, faints on the sluice wall, and releases the chain while the basin drains; her ending is 3.6 seconds. Result overlays wait for these sequences.

Five new keyed reaction sprites are in `assets/fantasy-machinery/reactions-manifest.json`. The original sprite families remain unchanged. Nerra's live fury pose has its own measured opaque geometry and shoulder sockets. Dazed/fainted sprites are terminal presentation only; there is no active collider after defeat. These are keyed raster poses and articulated parts, not skeletal animation.

## Tidewheel: Kit's three choices

Tap Kit's lower-left face orb to pause and choose one power. Each choice requires and spends one complete meter. An unavailable choice stays disabled without spending anything.

| Power | Duration | Actual action |
|---|---:|---|
| Anchor | 8 seconds | Locks the hoist, cancels the current attack, drains water, and protects against new pulls while active. Usable outside the old narrow warning window. |
| Arrow Volley | 3 seconds | Deploys a paddle-mounted crossbow and fires five physical upward arrows, half a second apart. Obstacles can stop arrows. |
| Starfire | 6 seconds | Gives the existing ball the original cosmic/TITAN appearance and an 8-unit radius. It pierces ordinary breakable targets; permanent scenery remains physical. |

Easy/Medium/Hard use 12/15/18 productive credits and at least that many active refill seconds. Powered hits cannot refill the meter. A complete earned meter is snapped within numerical tolerance to 100; the old floating-point remainder could leave a visibly full meter unable to cast. There is no automatic free charge. A charged choice can be armed while the ball is caught; offensive duration waits for launch, while Anchor begins guarding immediately.

The power menu uses a single row of anchor, arrow and cosmic-ball icons. A short indicator underneath the paddle shows remaining active duration. Pause, Retry and Continue retain their established semantics.

## Nerra's machinery and attack

The right pincer grips the actual chain endpoint. Link travel and wheel rotation accumulate from the hand's physical haul distance. Recovery relaxes the arm without reversing the ratchet's earned rotation. The chain is released when Nerra faints.

The water attack comes from the measured tip of the animated left crusher claw. Water gathers there during the wind-up; the target lane is chosen once, and the shot is emitted from the actual firing pose toward that saved target. A landing ripple communicates danger without a connecting aim line. The earlier disconnected side outlets are removed. The projectile retains its swept collision, rounded water core, foam trail and ball-interception response; enemy shots do not break cargo bricks.

Anger raises the claws and changes the live facial pose. Getting hit uses the hurt pose, while defeat uses separate dazed and fainted expressions. The hauling wheel, rising basin, raft springs, breakable braces and descending refuge remain the encounter's physical cause-and-effect loop.

## Original Vault presentation

`src/vault.js` reuses the rendered Bellforge hall as the Vault's rear environment, with a dark recess behind the registered brick field, stone supports, a lower sill and a masonry entrance arch. The notch extension samples the same backdrop. `tools/pack_art.py` embeds this existing source as `keepBackdrop` so the canonical page remains self-contained.

The original princess frames, serpent path, grid, cage, collisions and power rules are preserved. The owner then explicitly requested a snake graphics pass and deferred difficulty/black-block changes. A new emerald head family and matching curved scale/clearcoat body presentation replace the older faceted appearance. Breath, dazed sway and coherent hit recoil stay centred on the existing head core. The original head atlas and plate remain fallbacks. The atlas stores measured mouth outlets per expression and facing; venom uses the same rotation, bob and deformation as the head. The initial graphics-only audit against `8286cee9` confirmed all 55 non-draw methods unchanged. The subsequent capture request below explicitly revises presentation after the loss is committed. The complete 400-cell layout still retains all 45 granite cells and 18 bar cells. See [`art/snake-emerald/SOURCE.md`](../art/snake-emerald/SOURCE.md) for authored expressions and explicit aliases; this is a raster/presentation upgrade, not a change to the rescue rules or a new skeletal model.

## Head-led capture and visible laugh

The owner expanded the snake pass after the new atlas was ready. `src/serpent-capture.js` snapshots the complete existing smoothed body at the second strike (attack time1.22). The head then travels a continuous route around Lumi's waist, and every section follows that history. The centreline length is conserved, including the original tail extension; no set of control points is simply morphed into a ring. Capture samples are already smoothed and are not resmoothed or extended by the renderer.

The head wraps by2.55, turns toward Lumi, then alternates the new grin and open-mouth pose with a small tip/breath pulse from2.65. The attack timeline ends at4.2. The existing0.6 time scale makes the terminal choreography readable. This does not extend the pre-second-strike save window. Ball/laser collisions against the serpent are already disabled in `caught`, and `loseBall()` now returns in that terminal phase so a draining ball cannot replace the capture ending. All other phases retain their existing lost-ball behavior.

The lower/front portion of the same ribbon is drawn over Lumi's waist after her body; the rear portion remains behind her. Her existing animated scared pose is supported by an8-unit lift, a small body tilt and settling struggle. Her face remains visible. The head looks toward Lumi with bounded side-view roll (at most0.5 radians), rather than rolling upside down with the ellipse tangent. A small reusable256px scratch surface blends the two facing rows with preserved skin opacity; modest width compression suggests the yaw. The head is drawn behind Lumi during the rear half of the wrap. The final route passes through a rear-neck anchor18 units behind and6 units below the fixed head core before approaching the skull. `capturePose()` caches a pure sample by attack time; only this committed presentation uses the cache.

The venom spray still uses the measured moving mouth. A wet acid film gathers on the target, followed by falling drops and steam in the gap. Guarded targets do not show the melting overlay. Target selection, timing, brick removal, shielding and route changes remain the existing rules. Dungeon glazed bricks, chips and dust are preserved; no black blocks were removed.

## Evidence and next checks

Current receipts are under `docs/validation/fantasy-refinement/`; the Bellforge independent review is under `docs/validation/bellforge/`. Browser full-charge, attack and defeat captures are explicitly staged. Separately recorded earned model routes use actual public controls and do not inject health or resources.

The complete unit suite passes 365 tests. Phone-sized Chromium checks cover iPhone and Android layouts. Short desktop and rotated windows are checked for the reported load error and usable controls. These checks do not establish physical-handset performance or human difficulty. Ask the owner to replay both keeps and check whether the charge timing and threat rhythm now feel useful.

Preview:

- `http://127.0.0.1:4194/prototypes/fantasy/?level=bellforge`
- `http://127.0.0.1:4194/prototypes/fantasy/?level=tidewheel`
- `http://127.0.0.1:4194/dist/breach.html?level=2` — The Vault.

Future work must preserve the approved reference boards and source artwork, keep the mechanical origin of every attack visible, and update geometry whenever a live pose silhouette changes. Do not substitute a still-image assembly for runtime motion evidence.

Final capture review: [`snake-review.md`](validation/fantasy-refinement/snake-review.md) records the exact tested source/build, natural approach, mirrored fixture, mouth attachment checks and seven-second motion clip. Both 393×852 and 412×915 browser viewports passed with no page errors. The upright head, rear-neck connection and clear Lumi face were independently inspected.
