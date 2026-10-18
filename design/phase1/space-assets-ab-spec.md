# Space A/B — approved left-playfield asset specification

**Latest selection and tested candidate (2026-10-18):** Only A / Carrier Breakout is active; Nix/Tick appearances are selected, but their full expressive sprite/animation families and runtime cast integration are not built. B/Relay Raiders, C/Orbital Breakout and D/Eclipse Rescue are deferred. The playable Carrier web candidate is SHA256 `F4863DC5A87D6B46A8A1AFDB702C264F432196B851B61B828946DB8AB75A0423`. It passes 44 unit tests and both-phone bundled gameplay/visual checks. Independent final captures at 393×852 safe59/34 and 412×915 safe32/24 preserve the approved A art, continuous safe-edge starfield, aligned 125×17u paddle and clean settled results, with zero page errors. Public-input assisted deterministic simulated wins record 82.3s iPhone / 45.2s Android of game clock; these do not establish human balance or physical-device performance. Evidence: `out/carrier-playable-final/report.json` and `out/carrier-visual-final/REVIEW.md`. The owner has requested an APK; packaging/native CI and delivery remain pending. No APK pass is claimed. EA839F00… remains historical accepted baseline evidence; the older A/B Canvas tranche remains asset-only history.

**APK checkpoint authorization (2026-10-18):** The owner explicitly requests the APK. This authorizes the necessary checkpoint commit/push and CI on `codex/carrier-mobile-preview` in the existing isolated `breaker-mobile-preview` worktree, using the exact frozen Carrier/current Vault sources and native immersive fix. Primary `codex/phase1-kit` is preserved. No merge to `main` or pending Nix/Tick companion-family admission is authorized. APK/native CI remains pending; the earlier screenshot-approval notes do not block this specific APK checkpoint.

The historical all-four approval produced the completed A/B left-playfield asset tranche below. The owner now selects only A / Carrier Breakout for current gameplay work and selects its Nix/Tick appearances. B/C/D are deferred; their boards, geometry and proof history remain preserved. Nix/Tick full expressive sprite/animation families and runtime integration are not built. This specification preserves delivered machinery/worker geometry and original draft mechanical intent. The separately tested Carrier web candidate is recorded above; it does not establish human balance or APK completion. EA839F00… remains historical baseline evidence.

References: [A](img/space-carrier-a.png), [B](img/space-relay-b.png), both 1536×1024. Preserve the actual left composition. The discarded native saucer-proxy 113/97-cell rescue studies, their HP and 100/110-second deadlines supply **no production coordinates or rules** here.

## Playable Carrier candidate — final web verification

The current F4863DC5… build admits the selected A textures into real gameplay, with authored cargo/captive targets, moving fighters and doors, cannons, visible payload marks, rescue completion and the existing earned core/powers. It passes 44 unit tests and the bundled two-phone gameplay suite. Deterministic public-input assisted simulated wins at game-clock 82.3s iPhone (two lives) and 45.2s Android (three lives) are recorded in `out/carrier-playable-final/report.json`; they are not human difficulty or real-device comfort proof. Independent `out/carrier-visual-final/` opening, staged launch, tip/collider and settled-result captures confirm the A art, continuous full-viewport starfield and no frozen Carrier effects behind the result card, with zero page errors. Visible paddle/collider discrepancy is below 0.006 CSS px at both travel extremes. Nix/Tick full sprite families remain unbuilt. APK native CI/delivery is pending. The A/B tranche below remains its original asset-only evidence, including deferred B.

## Reference and phone mapping

Measured rectangles are visual envelopes, approximately ±3 source pixels; they are not collision polygons. A crop is `(16,14,560,968)`; B crop is `(0,0,660,1024)`. B is 660 pixels wide, not 640: the rightmost bricks must remain included. Uniform horizontal reference scale `k=360/cropWidth`: `worldX=(sourceX-cropX)*k`, `worldY=72+(sourceY-cropY)*k`, `worldW/H=sourceW/H*k`. This preserves machinery proportions and leaves added phone height in the return lane instead of vertically stretching ships.

| Phone | Scene scale | CSS x | CSS y | Current paddle top |
|---|---:|---|---|---:|
| iPhone 393×852, safe 59/34 |1.0916667 |worldX×scale |59+(worldY−34+0.2290076)×scale |614u /692.42CSSpx |
| Android 412×915, safe 32/24 |1.14375 |(worldX+0.1092896)×scale |32+(worldY−34)×scale |675u /765.14CSSpx |

Background rectangles below preserve source composition only; the starfield itself must extend behind the whole viewport, including safe areas and the extra return lane. All table rectangles are `left, top, width, height`; sizes use the same scene scale. These are screenshot viewport CSS coordinates, not DPR pixels. Safe insets and aspect change require the normal game resize mapping. Preserve the 126 CSS paddle reserve, drain+20u and shield+18u. The last accepted baseline uses a 74u paddle and 6r ordinary ball; Vault keeps its 74x12u/default6r configuration. The verified Carrier-specific integration uses a 125u physical and visible base paddle, natural height about 17u, ordinary ball 7.5r and TITAN 10r. Both-phone visible/collider tip checks and radius restoration through serve/split/burst/TITAN expiry pass on the final web candidate. The broad reference paddles are appearance references; do not silently enlarge their hitboxes. A's lowest brick envelope ends~341.4u and B's~368.2u. Do not add lower bricks or foreground machinery just to fill the return lane. Current compact top HUD remains above the ship study; no reference titles or caption plates belong in play.

## Asset inventory and mechanical separation

| Family / visible instances | Unique purpose and required states | Collision / layering contract |
|---|---|---|
| A carrier shell, roof antennae, armour seams and magenta trim | Main opponent silhouette; separate reactor eye/glow supports calm, warning, damaged and disabled reads. Maintain trim alignment under movement. | Shell outline and actual vulnerable hardware must be declared at integration; central bay is a real aperture, never an invisible solid rectangle. Antennae/trim have no independent hitboxes. |
| A paired hangar shutters and bay interior | Closed → unlatch/retract → clear opening → launch → close. The left reference is open; closed leaves are a necessary mechanism state. | Door pivots/retraction tracks stay inside the frame. Interior, rear shadow, door leaves and foreground lip are separate so launch occlusion is possible. No invented timing/HP. |
| A two cannon mounts and two independent barrels | Track/anticipate → discharge → recoil → recover. Keep muzzle and recoil anchor local to the rotating mount. Magenta local flash/projectile is separate from barrel. | Visible geometry drives future weapon origin; a muzzle flash is not a continuous beam. Do not bake a projectile into the hull. Damage/cooldown remain unspecified. |
| A three white/orange/cyan fighters, three local cyan exhausts | One matching fighter family at three reference scales/angles. Start inside the open bay, move continuously through it and depart; thrust follows the engine. | Rear bay masks a fighter until it crosses the lip. No spawn pop; future enemy collision follows the visible ship rather than exhaust/glow. No path speed or attack schedule approved. |
| A 10 cyan + 6 pink glazed modules | Reusable intact, hit/readable damage and broken/removed material states. Wide and short dimensions preserve the reference rows. | These 16 modules are distinct from the five captive windows. Integration defines collision and damage; colour alone does not invent a new power. |
| A five shallow captive windows | Two upper + three lower brick-size housings; separate frame, latch/front hatch, clear window and purple worker insert. Locked → housing feedback → open → worker release/exit. | Friendly worker face/body is not the damage target. Hit housing/lock if that rule is implemented. Keep glass/front frame in front of worker; doorway occludes departure. Do not replace with B's tall pods. |
| B horseshoe relay, segmented iris and violet portal | Main escape machinery. Independent sectors unlock/retract while a bounded portal cycles behind them. Open sectors persist visibly where appropriate. | The portal is a non-solid visual interior, not an opaque disc; segment solids must match their actual state. No lock count/HP/timer inferred from appearance. |
| B paired cannon mounts/barrels, orange warning arc and local flash | Sweeping warning → locked firing lane → shot/recoil → visibly cooled recovery. Preserve warm-orange warning separation from cyan bricks. | Telegraph and dangerous shot are separate states. No hidden damage circle matching the arc. Future collision/telegraph timing requires gameplay proof. |
| B empty collection skiff | Friendly rescue destination: idle/bank/collect/depart. Keep silver hull, cyan panels and a clear entry lip. | Pilot/companion is excluded for now. Hull is not a friendly body damage target. Workers arrive through an actual opening, not disappear into a sprite. |
| B four large transparent pods + four white/cyan robot workers | Separate shell, latch, door/glass and worker layers. Locked → housing hit → door unlocks/opens → expressive worker exits → empty pod. | Player strikes housing/lock, never crew. Door and pod silhouette require state-specific collision later; no 2HP assumption is approved. |
| B 10 cyan + 6 violet + 14 X-braced modules | 30 visible brick modules, including short cyan endcaps, narrow braced connectors and isolated central brace. Intact/hit/removed states must stay identifiable. | A brace is visibly reinforced but its exact HP/piercing rule is an integration choice, not imported from the discarded layout. Do not replace the braced grid with generic equal-sized bricks. |
| A/B chrome ball and cyan sci-fi paddle | Keep current live ball/paddle behavior and native lower anchor. Subtle short ball ghosts only; cyan paddle has metallic end caps. | Preserve physics dimensions/speeds. No long opaque trail or decorative paddle width mistaken for collision. |
| A lower console rim / indicator dots | Optional decorative edge language only; the reference's large portrait housing is excluded. Dots do not imply a second resource meter. | Any admitted edge art stays dim and outside the ball/controls; no heavy lower deck restoration. |
| A/B space, planets, stars and asteroids | Full-bleed navy starfield. A small upper-right violet moon + large clipped lower-right violet planet; B upper-right blue limb + large lower-right blue planet. Dim near/far asteroid families frame edges. | Background only, no collision. Separate layers permit restrained drift; never put bright rim/glow under the chrome ball or fill open aim corridors with high-contrast rocks. |

Foreground must lead: glossy cool enamel and brushed silver with warm upper-left key/cool fill, restrained magenta light; backgrounds stay near-black/desaturated, with planets and rings visible as silhouettes. No full-screen glow, bright lower wash, board border, title text or inset caption panel. The hero sheets, Nix/Tick, Vesper/Latch, tiny cockpit pilot, corner face controls and other companions are excluded from this tranche. The A deflector and B clamp illustrations are later mechanism-state references; they do not authorize new resource rules, costs or companion production. This exclusion describes the completed machinery tranche only; the latest Nix/Tick design approval is separate and does not claim finished character assets.

## Placement inventory

Every measured foreground instance is below. Repeated brick IDs are display modules, not gameplay cells. Hull envelopes overlap their removable parts deliberately; do not draw/flatten the whole reference crop and then add duplicate cannons over it. Ship/background PNGs need real RGBA transparency and clear apertures. Independent parts need declared pivots/muzzle anchors and consistent lighting; workers and doors cannot be baked together. [Property/assembly manifest](space-assets-ab.json) owns delivered paths/pivots and preview presentation motion; its asset-only clock is not a game timer.

| Instance | World rect (u) | iPhone rect (CSSpx) | Android rect (CSSpx) |
|---|---|---|---|
|aHull|0, 86.8, 360, 144.6|0, 116.9, 393, 157.9|0.1, 92.4, 411.8, 165.4|
|aCore|160.7, 110.6, 37.9, 39.2|175.4, 142.8, 41.4, 42.8|183.9, 119.6, 43.4, 44.9|
|aBay|115.1, 168.4, 125.4, 49.5|125.6, 206, 136.8, 54|131.7, 185.8, 143.4, 56.6|
|aDoorLeft|119.6, 172.3, 58.5, 41.8|130.5, 210.2, 63.9, 45.6|136.9, 190.2, 66.9, 47.8|
|aDoorRight|178.1, 172.3, 59.1, 41.8|194.4, 210.2, 64.6, 45.6|203.8, 190.2, 67.6, 47.8|
|aCannonMountLeft|17.4, 156.2, 75.9, 66.9|18.9, 192.7, 82.8, 73|20, 171.8, 86.8, 76.5|
|aCannonMountRight|262.9, 154.3, 79.7, 69.4|287, 190.6, 87, 75.8|300.9, 169.6, 91.2, 79.4|
|aCannonBarrelLeft|31.5, 176.8, 45.6, 43.7|34.4, 215.1, 49.8, 47.7|36.1, 195.3, 52.2, 50|
|aCannonBarrelRight|282.2, 177.4, 45.6, 42.4|308.1, 215.8, 49.8, 46.3|322.9, 196.1, 52.2, 48.5|
|aFighterLeft|122.1, 215.4, 30.9, 28.9|133.3, 257.2, 33.7, 31.6|139.8, 239.4, 35.3, 33.1|
|aFighterCentre|154.9, 235.9, 52.1, 39.9|169.1, 279.7, 56.8, 43.5|177.3, 263, 59.6, 45.6|
|aFighterRight|205.7, 220.5, 34.7, 27.6|224.6, 262.9, 37.9, 30.2|235.4, 245.3, 39.7, 31.6|
|aThruster0|126, 234, 18, 30.9|137.6, 277.6, 19.6, 33.7|144.2, 260.8, 20.6, 35.3|
|aThruster1|169.7, 266.1, 21.9, 32.8|185.3, 312.7, 23.9, 35.8|194.2, 297.5, 25, 37.5|
|aThruster2|217.9, 239.8, 18.6, 32.1|237.9, 283.9, 20.4, 35.1|249.4, 267.4, 21.3, 36.8|
|aBrickCyan0|3.2, 230.8, 54, 25.1|3.5, 274.1, 59, 27.4|3.8, 257.1, 61.8, 28.7|
|aBrickCyan1|306.6, 230.8, 52.7, 25.1|334.8, 274.1, 57.5, 27.4|350.9, 257.1, 60.3, 28.7|
|aBrickCyan2|3.2, 260.4, 52.1, 23.1|3.5, 306.4, 56.8, 25.3|3.8, 290.9, 59.6, 26.5|
|aBrickCyan3|59.1, 260.4, 41.1, 23.1|64.6, 306.4, 44.9, 25.3|67.8, 290.9, 47.1, 26.5|
|aBrickCyan4|263.6, 260.4, 41.1, 23.1|287.7, 306.4, 44.9, 25.3|301.6, 290.9, 47.1, 26.5|
|aBrickCyan5|309.9, 260.4, 49.5, 23.1|338.3, 306.4, 54, 25.3|354.5, 290.9, 56.6, 26.5|
|aBrickCyan6|3.2, 315, 47.6, 25.7|3.5, 366, 51.9, 28.1|3.8, 353.4, 54.4, 29.4|
|aBrickCyan7|104.1, 315, 46.9, 25.7|113.7, 366, 51.2, 28.1|119.2, 353.4, 53.7, 29.4|
|aBrickCyan8|206.4, 315, 47.6, 25.7|225.3, 366, 51.9, 28.1|236.2, 353.4, 54.4, 29.4|
|aBrickCyan9|308.6, 315, 50.8, 25.7|336.9, 366, 55.4, 28.1|353.1, 353.4, 58.1, 29.4|
|aBrickPink0|3.2, 288, 46.9, 22.5|3.5, 336.5, 51.2, 24.6|3.8, 322.5, 53.7, 25.7|
|aBrickPink1|54, 288, 46.3, 22.5|59, 336.5, 50.5, 24.6|61.9, 322.5, 52.9, 25.7|
|aBrickPink2|104.1, 288, 46.9, 22.5|113.7, 336.5, 51.2, 24.6|119.2, 322.5, 53.7, 25.7|
|aBrickPink3|208.3, 288, 46.9, 22.5|227.4, 336.5, 51.2, 24.6|238.3, 322.5, 53.7, 25.7|
|aBrickPink4|257.8, 288, 46.9, 22.5|281.4, 336.5, 51.2, 24.6|295, 322.5, 53.7, 25.7|
|aBrickPink5|308.6, 288, 50.8, 22.5|336.9, 336.5, 55.4, 24.6|353.1, 322.5, 58.1, 25.7|
|aCrewCell0|58.5, 230.8, 41.1, 25.7|63.9, 274.1, 44.9, 28.1|67, 257.1, 47.1, 29.4|
|aCrewCell1|263.6, 230.8, 40.5, 25.7|287.7, 274.1, 44.2, 28.1|301.6, 257.1, 46.3, 29.4|
|aCrewCell2|54, 315, 46.3, 26.4|59, 366, 50.5, 28.8|61.9, 353.4, 52.9, 30.1|
|aCrewCell3|155.6, 315, 46.3, 26.4|169.8, 366, 50.5, 28.8|178.1, 353.4, 52.9, 30.1|
|aCrewCell4|258.4, 315, 46.3, 26.4|282.1, 366, 50.5, 28.8|295.7, 353.4, 52.9, 30.1|
|aBallReference|163.9, 491.8, 21.9, 21.9|179, 559, 23.9, 23.9|187.6, 555.6, 25, 25|
|aPaddleReference|111.2, 570.2, 129.9, 21.9|121.4, 644.6, 141.8, 23.9|127.3, 645.3, 148.5, 25|
|aConsoleRim|0, 586.3, 360, 108|0, 662.2, 393, 117.9|0.1, 663.7, 411.8, 123.5|
|aStarfield|0, 72, 360, 622.3|0, 100.7, 393, 679.3|0.1, 75.5, 411.8, 711.7|
|aMoonUpperRight|303.4, 94.5, 35.4, 36.6|331.2, 125.3, 38.6, 40|347.2, 101.2, 40.4, 41.9|
|aPlanetLowerRight|312.4, 450, 47.6, 81|341.1, 513.4, 51.9, 88.4|357.5, 507.8, 54.4, 92.6|
|aAsteroidFamily|0.6, 360, 359.4, 206.4|0.7, 415.1, 392.3, 225.3|0.9, 404.9, 411, 236|
|bHull|24.5, 78.5, 313.6, 139.1|26.8, 107.9, 342.4, 151.8|28.2, 83, 358.7, 159.1|
|bPortal|135.3, 114, 89.5, 81.3|147.7, 146.6, 97.7, 88.7|154.8, 123.5, 102.3, 93|
|bIrisEnvelope|125.5, 105.8, 109.1, 109.6|136.9, 137.7, 119.1, 119.7|143.6, 114.1, 124.8, 125.4|
|bCannonMountLeft|28.9, 131.5, 102, 70.4|31.6, 165.6, 111.3, 76.8|33.2, 143.5, 116.7, 80.5|
|bCannonMountRight|225.8, 132, 108.5, 70.9|246.5, 166.2, 118.5, 77.4|258.4, 144.1, 124.2, 81.1|
|bCannonBarrelLeft|43.6, 165.3, 45.8, 46.4|47.6, 202.6, 50, 50.6|50, 182.1, 52.4, 53|
|bCannonBarrelRight|283.6, 168.5, 44.2, 39.8|309.6, 206.1, 48.2, 43.5|324.5, 185.9, 50.5, 45.5|
|bWarningArc|25.6, 156.5, 19.6, 52.4|28, 193, 21.4, 57.2|29.4, 172.2, 22.5, 59.9|
|bMuzzleFlash|323.5, 190.4, 25.6, 28.9|353.1, 229.9, 28, 31.6|370.1, 210.8, 29.3, 33.1|
|bSkiff|153.3, 180, 55.6, 28.9|167.3, 218.6, 60.7, 31.6|175.4, 199, 63.6, 33.1|
|bCrewPod0|32.2, 220.4, 63.3, 56.7|35.1, 262.7, 69.1, 61.9|36.9, 245.2, 72.4, 64.9|
|bCrewPod1|107.5, 220.4, 63.3, 56.7|117.3, 262.7, 69.1, 61.9|123, 245.2, 72.4, 64.9|
|bCrewPod2|194.2, 219.8, 62.7, 57.3|212, 262.1, 68.5, 62.5|222.2, 244.5, 71.7, 65.5|
|bCrewPod3|270.5, 220.9, 63.8, 56.2|295.4, 263.3, 69.7, 61.3|309.6, 245.8, 73, 64.3|
|bBrickCyan0|9.8, 262.4, 20.7, 13.6|10.7, 308.6, 22.6, 14.9|11.3, 293.2, 23.7, 15.6|
|bBrickCyan1|334.4, 262.4, 19.1, 13.6|365, 308.6, 20.8, 14.9|382.6, 293.2, 21.8, 15.6|
|bBrickCyan2|33.3, 278.2, 34.9, 19.1|36.3, 325.8, 38.1, 20.8|38.2, 311.3, 39.9, 21.8|
|bBrickCyan3|139.6, 278.2, 32.7, 19.1|152.4, 325.8, 35.7, 20.8|159.8, 311.3, 37.4, 21.8|
|bBrickCyan4|195.3, 278.2, 30.5, 19.1|213.2, 325.8, 33.4, 20.8|223.5, 311.3, 34.9, 21.8|
|bBrickCyan5|295.6, 278.2, 34.4, 19.1|322.7, 325.8, 37.5, 20.8|338.3, 311.3, 39.3, 21.8|
|bBrickCyan6|74.2, 321.8, 50.7, 20.2|81, 373.4, 55.4, 22|85, 361.2, 58, 23.1|
|bBrickCyan7|238.9, 321.8, 50.7, 20.7|260.8, 373.4, 55.4, 22.6|273.4, 361.2, 58, 23.7|
|bBrickCyan8|27.8, 345.3, 46.9, 22.9|30.4, 399.1, 51.2, 25|31.9, 388, 53.6, 26.2|
|bBrickCyan9|290.7, 345.3, 45.8, 22.9|317.4, 399.1, 50, 25|332.6, 388, 52.4, 26.2|
|bBrickViolet0|85.1, 278.2, 36, 19.1|92.9, 325.8, 39.3, 20.8|97.5, 311.3, 41.2, 21.8|
|bBrickViolet1|243.3, 278.2, 34.9, 19.1|265.6, 325.8, 38.1, 20.8|278.4, 311.3, 39.9, 21.8|
|bBrickViolet2|29.5, 300.5, 45.8, 22.4|32.1, 350.2, 50, 24.4|33.8, 336.9, 52.4, 25.6|
|bBrickViolet3|288.5, 300.5, 44.7, 22.4|315, 350.2, 48.8, 24.4|330.1, 336.9, 51.2, 25.6|
|bBrickViolet4|99.3, 345.3, 28.9, 22.9|108.4, 399.1, 31.6, 25|113.7, 388, 33.1, 26.2|
|bBrickViolet5|236.7, 345.3, 28.4, 22.9|258.4, 399.1, 31, 25|270.9, 388, 32.4, 26.2|
|bArmour0|9.3, 278.2, 20.7, 19.1|10.1, 325.8, 22.6, 20.8|10.7, 311.3, 23.7, 21.8|
|bArmour1|69.8, 278.2, 13.6, 19.1|76.2, 325.8, 14.9, 20.8|80, 311.3, 15.6, 21.8|
|bArmour2|123.3, 278.2, 14.2, 19.1|134.6, 325.8, 15.5, 20.8|141.1, 311.3, 16.2, 21.8|
|bArmour3|174.5, 278.2, 18.5, 19.1|190.6, 325.8, 20.3, 20.8|199.8, 311.3, 21.2, 21.8|
|bArmour4|228, 278.2, 14.2, 19.1|248.9, 325.8, 15.5, 20.8|260.9, 311.3, 16.2, 21.8|
|bArmour5|281.5, 278.2, 12.5, 19.1|307.3, 325.8, 13.7, 20.8|322, 311.3, 14.3, 21.8|
|bArmour6|334.4, 278.2, 19.1, 19.1|365, 325.8, 20.8, 20.8|382.6, 311.3, 21.8, 21.8|
|bArmour7|171.3, 299.5, 22.4, 22.9|187, 349, 24.4, 25|196, 335.6, 25.6, 26.2|
|bArmour8|9.8, 312.5, 16.9, 19.6|10.7, 363.3, 18.5, 21.4|11.3, 350.6, 19.3, 22.5|
|bArmour9|339.8, 313.1, 14.7, 20.2|371, 363.9, 16.1, 22|388.8, 351.2, 16.8, 23.1|
|bArmour10|33.8, 324.5, 36.5, 15.3|36.9, 376.4, 39.9, 16.7|38.8, 364.3, 41.8, 17.5|
|bArmour11|296.2, 325.1, 33.8, 14.7|323.3, 377, 36.9, 16.1|338.9, 364.9, 38.7, 16.8|
|bArmour12|78, 345.3, 19.1, 22.9|85.2, 399.1, 20.8, 25|89.3, 388, 21.8, 26.2|
|bArmour13|268.4, 345.3, 19.1, 22.9|293, 399.1, 20.8, 25|307.1, 388, 21.8, 26.2|
|bBallReference|160.4, 441.8, 16.4, 16.4|175.1, 504.4, 17.9, 17.9|183.5, 498.4, 18.7, 18.7|
|bPaddleReference|110.7, 548.2, 144, 30.5|120.9, 620.6, 157.2, 33.4|126.8, 620.1, 164.7, 34.9|
|bStarfield|0, 72, 360, 558.5|0, 100.7, 393, 609.8|0.1, 75.5, 411.8, 638.8|
|bPlanetUpperRight|266.7, 72, 77.5, 27.8|291.2, 100.7, 84.5, 30.4|305.2, 75.5, 88.6, 31.8|
|bPlanetLowerRight|262.4, 390.5, 97.6, 118.9|286.4, 448.5, 106.6, 129.8|300.2, 439.8, 111.7, 136|
|bAsteroidEdgeFamily|0, 72, 360, 461.5|0, 100.7, 393, 503.8|0.1, 75.5, 411.8, 527.8|

Source-image rectangles and the same mapping are reproducible in ignored `out/space-assets-ab/reference-map.mjs` / `reference-map.json`. Visual-envelope approximation must be checked against delivered alpha bounds; a stretched or overly padded asset must not silently change the composition. The table, role/state inventory and tracked manifest remain the portable handoff.

## Assembly review and next proof

Review actual transparent parts assembled at 393×852 and 412×915 before integrating an encounter. Compare silhouette, five shallow A windows versus four B pods, brick positions, empty apertures, three emerging fighters, local weapon origins, worker/front-door occlusion and the dark background hierarchy. Check closed/open states plus short cannon recoil and launch/iris motion; preview timings are presentation samples only. Main sources, packed art, physics, runtime, build and APK remain unchanged by this spec. Combat counters, HP, warning periods, rescue win/fail, rewards and movement rules still need explicit integration design and actual phone playtests; board approval is not a balance result. Only Carrier A continues into current integration; B/C/D are deferred. Nix/Tick appearances are selected, but full expressive families and runtime cast integration still need production and verification.

## Draft integration properties — initial tuning, not approved balance

These numeric contracts make the parts usable for a first playable integration; they are **new initial tuning proposals**, not owner-approved combat rules and not values carried from the discarded 113/97-cell studies. The current assembly has no damage/collision/payload dispatch. Geometry uses each measured visual envelope normalized 0..1; transform it with the part, then check it against actual alpha before admission. A compound hull is mandatory: one rectangle across the hangar/portal would invent invisible walls.

| Property | Proposed integration value | Source / limitation |
|---|---|---|
| Candy / X-braced armour / marked power | 1 / 3 / 1HP; inset rectangle4% horizontal,8% vertical on each side of its measured envelope |Existing Invasion HP family reused; exact reference-module shape, not an unrelated 28×18 cell. |
| Crew housing, each of A 5/B 4 |2HP; front frame only; locked → hit → open → released; open frame no longer blocks exit |New initial tuning. Worker body/window interior is not the damage target. Friendly worker, skiff and portal have no HP or collision. |
| Hull / cannon / fighter |36HP shared hull pool /6HP per cannon /2HP per fighter |Hull 36 reuses current boss baseline; detached cannon/fighter values are draft tuning, not an approved difficulty claim. No mandatory full-map clear is implied. |
| Moving actor damage |Normal 1, FIRE 3, TITAN 4, LASER 1 per distinct contact |Current mothership damage reused. Prevent repeated overlap damage until exit, including piercing balls. |
| Breakable brick damage |Normal/TITAN/LASER 1HP per hit; FIRE destroys |Current Invasion `hitCell` behavior; actor damage is a separate rule. |
| Cannon mount |Local pivot(.5,.45), ellipse collision centre(.5,.5), radii(.40,.36); max aim±.20rad; recoil5u opposite muzzle direction |Muzzle is the manifest's actual local barrel anchor, transformed with angle. Preview warning/fire/recovery times are not approved combat timings. |
| Crew-frame collision |Union of normalized rectangles(0,0,1,.15), (0,.85,1,.15), (0,.15,.13,.70), (.87,.15,.13,.70) |No full friendly-body hitbox; one lock/housing contact episode cannot count twice. Visible frame alpha must match before runtime use. |
| Shot/power payload |Only declared marked modules drop one existing-enum capsule; all others null, no random drops in the first prototype |This is an authored proposal, not a change to the current formation. Normal balls can open every required housing; no paid/key-only gate. |

Compound hull sectors, normalized clockwise point arrays:

- A upper bridge: `[(0,.34),(.075,.16),(.28,.06),(.405,0),(.59,0),(.76,.12),(.91,.17),(1,.34),(1,.56),(0,.56)]`; left cheek `[(0,.57),(.31,.57),(.31,.97),(0,.97)]`; right cheek `[(.69,.57),(1,.57),(1,.97),(.69,.97)]`; lower lip `[(.31,.94),(.69,.94),(.69,1),(.31,1)]`. Excluded bay rectangle `(.31964,.56444,.34821,.34222)` remains clear except the actual closed/translated shutter leaves.
- B upper arch: `[(.28,0),(.72,0),(.82,.13),(.74,.23),(.26,.23),(.18,.13)]`; left arch `[(.14,.15),(.29,.16),(.34,.39),(.32,.80),(.22,1),(0,.71),(.01,.42)]`; right arch mirrors it `[(.86,.15),(.71,.16),(.66,.39),(.68,.80),(.78,1),(1,.71),(.99,.42)]`. Excluded portal rectangle `(.35304,.25490,.28522,.58431)`. Iris sectors follow their visible moving geometry; no fixed rectangle across the opening.
- Fighter moving polygon: `[(.5,.06),(.66,.25),(.94,.46),(.80,.72),(.62,.70),(.5,.91),(.38,.70),(.20,.72),(.06,.46),(.34,.25)]`; exhaust/glow are excluded. Transform the polygon by the exact launch path and bank angle.

These are initial sector stencils, not verified masks. Delivering a different silhouette requires revising them rather than stretching the visible art to a collision rectangle. Closed shutter leaves use their measured rectangles and translated open poses; they share hull state instead of adding a separate HP gate.

Proposed authored payloads (IDs from placement inventory): A `aBrickCyan2→laser`, `aBrickCyan5→split`, `aBrickPink4→shield`; B `bBrickCyan3→laser`, `bBrickViolet2→shield`, `bBrickViolet3→split`. These must receive a visible power mark before gameplay; ordinary cyan/pink/violet alone is not a payload cue. Exact payload/density remains tunable.

Existing `Arena.applyPower` / `gfx.POWER` contracts: `laser` gives 7s of paired −560u/s shots every .3s; `split` adds two ordinary balls at ±.35rad per live uncaught ball, at most 60 newly added balls per pickup; `shield` gives two missed-ball saves for 16s; `wide` gives 12s at 1.55× base width; `fire` gives 8s; `slow` gives 8s at .68× ball timestep; `focus` adds one catch up to the current cap of 3; `burst` adds three balls; `shrink` is the existing adverse 9s/.62× width pickup and is not proposed in the marked set. TITAN is the existing 12-break earned centre-return core, 7s/radius 10, not a new pickup enum. Existing SHIELD does **not** block enemy lasers/bolts; such interception would need a separately declared rule consuming the same charge. No encounter deadline is proposed by this asset contract.

## Historical first assembly review — reference target versus delivered art

The first-draft visual findings below are preserved as history and resolved in the final review. Actual-alpha collision alignment remains future integration work.

The measured table remains the reference target. The first actual independent-part Canvas captures adapt new PNGs at their natural aspect: A hull displays at 360×126.36u instead of the reference envelope 360×144.64u; B displays at 313.64×143.39u versus 313.64×139.09u. This is an adaptation, not a pixel-exact cutout. The asset manifest's actual A aperture is normalized `(.36,.60,.28,.22)` and B aperture `(.384,.336,.232,.508)`, different from the reference stencils above. Collision must be aligned to these actual alpha openings before gameplay, with no invisible armour across the bay/portal.

Initial iOS/Android stills show readable machines, correct captive counts, distinct coloured/braced modules, clear compact header and lower paddle, and no companion. Sampled door/fighter/cannon/pod/iris states establish an assembly study only. Review follow-through remains: reduce oversized/bright lower-right planets in the return lane; give A's released workers a continuous visible escape rather than fading at an empty midfield destination; inspect worker/frame occlusion throughout release. These are presentation findings, not collision/gameplay or completed-rescue proof. Final revised captures and motion should be inspected after changes; this note does not pass an unseen revision.

## Final asset-assembly review — passed

Final proof paths are `out/space-assets-ab/final/A-ios-reference.png`, `A-android-reference.png`, `B-ios-reference.png`, `B-android-reference.png`, `A-motion.gif`, `B-motion.gif`, native `*-release-{0,25,50,75,100}.png` diagnostics and `asset-report.json`. Earlier parent-folder captures are drafts. Actual view sizes are 393×852 and 412×915; presentation controls keep approximately 126 CSS reserve (125.54/125.81CSS after world rounding). The capture report records 31 manifest entries/no missing paths, real-alpha/metadata validation and zero page errors in all four runs.

Independent visual review inspected all four full-phone reference images, adjacent A emergence frames 1.42–2.00s and launch/departure samples through 5.33s, B timeline samples 0–10.92s, and both-phone A/B release diagnostics. The revised A panel family/flat paddle follows its own source; B retains rounded bricks. Planets are now dim narrow edge accents. Five A windows/four B pods, header/low paddle and frozen-companion scope remain clear. Fighters originate behind the bay lip and leave continuously without a midair alpha fade. A workers continue through the side instead of disappearing at a blank point. B workers emerge in front through opened glass, board behind the skiff lip and follow it into the opened portal. The earlier double-muzzle and empty-point/release-mask findings are resolved in these sampled final outputs; no new blocking visual defect is found.

This passes asset presentation only. The high-resolution PNGs are not packed into the live game; ball/paddle in the preview are placement references, including the broad source paddle appearance. At that asset-proof milestone, the live 74u collision was unchanged; the newer 125u Carrier contract above is separate pending integration work. Before shipping: size/encode runtime WebP assets and measure memory/performance; align collision sectors, apertures, moving hulls and closed/open states to actual alpha; implement/playtest legal combat, objective, powers and player input; verify full phone runs and APK admission. Fighter movement behind brick-layer occlusion in the presentation is not actor-versus-brick collision proof. Draft HP/payload/shape numbers remain initial tuning. Source reproduction is documented in `art/space/ASSETS_AB.md`. No new gameplay build or APK result is claimed; active SHA256 remains `EA839F00A4683BD3CFD05CB87BDE6DA4B79EDFFF0191621362FB90A75FF9FBAC`.
