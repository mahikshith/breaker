# Serpent top-tunnel entrance

Status: selected and integrated. Final native phone checks pass on SHA256 **3A6B8A8C5368364AFCFCE6BBF7B1994D4598C121C90B45B72FE5BD7E45285EC1**. The owner asked for a top tunnel, a head facing down as it emerges, and immediate normal crawling. This supersedes the fully preloaded coil presentation. The entrance itself earns no hits and triggers no venom. No level layout or cage geometry changes accompany it.

## Streaming entrance contract

- Mouth centre: world **(284,96)**, directly above grid column 16. Use a small dark arch, subdued blue-grey rim, and the existing jade head/body art. Keep the visible opening within the lair; no bright background tunnel.
- Head begins at cell **[16,-2]**, world(284,72), inside the hidden tunnel. It moves straight down to **[16,1]**, world(284,120), during intro1.7–2.5 seconds:48 units at60 units/second. Twelve body sample points remain16 units apart on the same vertical path behind it.
- The first rendered head faces **down**: rotate the left-facing sprite by−π/2. The existing±0.95radian head clamp is insufficient. Retain the full angle through its first turn, joining the ordinary clamp continuously once the desired angle lies within that range.
- At the end of emergence, collision cells are exactly `[[16,1],[16,0],[16,-1],[16,-2],[16,-3],[16,-4],[16,-5],[16,-6],[16,-7],[16,-8],[16,-9],[16,-10]]`, head first. Set `prog=1`, `dir=look=π/2`, `faceLeft=true`, empty history and no chewing target. Recompute `snakeStart` with the real planner.
- Begin the normal planner immediately. Its measured first cells are **[15,1]→[14,1]→[14,2]→[14,3]**. Use a steady whole-tower view so the tunnel and playfield remain readable together. There is no pause to display a complete coil and no visible body replacement.
- Clip serpent rendering to the playfield below y=96 plus the narrow tunnel aperture above y=96. The remaining tail stays occluded inside the tunnel and follows out naturally. Keep the clip after intro until no virtual tail remains. Do not expose a vertical ribbon over the HUD.
- While virtual tunnel segments exist, head/body ball contacts, falling-brick crush checks and laser checks must ignore sample points above y=96. Draw and planner points remain intact. The visible head remains sample 0, so collision masking must never reclassify a body point as a head.
- Intro skipping accelerates the same path by5×. A tap never reveals a fully populated coil in one frame. The old automatic hiss/growl is removed from entry; rage and venom remain separate earned behaviour. Recoil is capped before the active head would enter a negative row; virtual tail cells cannot become an invalid planner start.

The negative-row tail cells represent tunnel space, not additional level cells. Their body keys are all negative, so the current planner does not confuse them with a valid grid location. The head and every new planned move remain within the real20×20 grid. No tile, cage, power drop, wall material or rescue route changes.

## Measured in the actual current game

`out/snake-entrance/runtime-check.mjs` loads the frozen packed game, replaces only the initial serpent chain, and runs real level updates at1/120second without releasing the caught ball. Both phone geometries give the same results:

| Check | Streaming start | Current preloaded start |
|---|---:|---:|
| Intact-map planner steps |40|39|
| Base planner cost |65.45998|65.13998|
| First cage attack after active handover |55.0833s|54.292s|
| Loss after active handover |59.7667s|58.975s|

The streamed chain stays finite as it grows from12 to 20 cells. Its final virtual tail follows into the grid at29.9333 seconds in the no-contact run. No head contacts or page errors occur. These are elapsed threat and continuity checks, not human difficulty validation. Cinematic time before active handover is additional.

Detailed data: `out/snake-entrance/runtime-report.json`. Original layout/source snapshot and the rejected all-inside candidate's exact path checks are in `out/snake-entrance/audit.json` and `audit.py`. They are retained as audit history only. The all-inside candidate is withdrawn because its head visibly crossed the right pillar during a bend and its held coil did not satisfy the requested entrance.

## Final isolated-demo checks

The isolated phone proof remains at `out/venom-prototype/entry-final-{ios,android}-{mouth,down,handover,crawl}.png`. Final production stills are `out/venom-coach-final/{ios,android}-00-top-entry.png`; the actual motion crop is **`img/serpent-entry-native.gif`**, from1.5–4 seconds in the sealed final build. Its46 frames retain zero opening hits/fury. Detailed motion provenance is `out/venom-entry-final/report.json`.

The final native venom suite verifies hidden-contact rejection, separate body reactions, powered head stun and safe recoil. A250ms pointer hold or Space hold that finishes after accelerated entry no longer launches the un-aimed serve on release; the skip gesture is consumed through release/cancel. A loss during a venom warning stops serpent/grid mutations while Continue remains visible. The whole-tower presentation has no copied-background seam, pillar crossing or tail over HUD. No commit approval is implied by these checks.
