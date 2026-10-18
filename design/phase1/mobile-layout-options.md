# Mobile HUD and lower controls — selected A

Status: **owner selected A with corrections; implemented and tested on both phone sizes; further Invasion expansion requested**. **Latest theme correction: Kit appears only in the princess/Vault mode. Invasion has no hero icon or placeholder; its earned paddle-core Titan remains.** The earlier boards below are selection history. The selected version removes all stage captions, the entire visible bottom track/grip and persistent lower copy; it uses a smaller Lilita One score and a warm rose Kit ring. The APK checkpoint remains separate.

The shared source now constructs the lower geometry using the native UI scale before serve creation. Lives (up to five), AIM and the 18CSSpx Lilita One score share a top row centred18CSSpx below the safe top. Level progress is a thin3CSSpx strip centred35CSSpx below it, without SERPENT/CLANKS/FORMATION/MOTHERSHIP text. In the Vault, the face is the only persistent bottom-left control; Invasion draws no bottom-left hero control, and relative drag remains invisible across the playable input area. Charge ring colours are muted rose `#6C3C55`, partial `#D37B9F`, full `#F2A6C4`. Active-power chips and repeated coaching are removed; collection FX and the actual ball/paddle/shield state retain power feedback.

| Option | Vault | Invasion | Difference |
|---|---|---|---|
| A — single toolbar | [Both phones](img/mobile-layout-a.png) | [Both phones](img/mobile-layout-a-invasion.png) | Status, life icons, AIM and score share one row; progress sits underneath. Short CLANKS / ZORVAX labels keep the row clear. |
| B — two rows | [Both phones](img/mobile-layout-b.png) | [Both phones](img/mobile-layout-b-invasion.png) | Status and score lead; explicit LIVES and AIM sit together underneath. Full FORMATION / MOTHERSHIP labels fit. **Recommended for readability.** |

The earlier selection boards contain native iPhone393×852 (safe59/34) and Android412×915 (safe32/24) views. B uses10CSSpx more vertical HUD space. Both reserve the top-right tunnel lane and leave the tower/formation geometry intact. Progress ends at width−116 instead of crossing the tunnel. Lilita One is used for the game text and displayed score, matching the owner’s latest request. Neither original option includes heavy bottom panels, persistent drag instructions or bottom lives/AIM. The selected corrections additionally remove the depicted support line/grip; Invasion retains its space plate/Saturn, while the Vault moon is removed.

## Shared proposed geometry

Let B be the CSS safe-content bottom and s the existing world-to-CSS scale. Keep integer world rounding and short-screen minimum-paddle guards. The common126CSSpx reserve is practical clearance, not a mathematical claim that every pixel is required.

| Element | Proposed geometry | iPhone / Android |
|---|---|---|
| Paddle top | `round(H−126/s)` in world layout | world614 /675; CSS692.42 /765.14 |
| Paddle lowering | Relative to current build |73.14 /98.36CSSpx |
| Drain / shield | paddle+20u /paddle+18u | Both remain below the paddle and above lower controls. |
| Vault-only Kit face orb |52CSSpx circle; x12..64, yB−56..B−4 | y762..814 /835..887 |
| Relative drag | Invisible; existing pointer ownership and gain are preserved | Full paddle travel at both walls, including WIDE. No drawn support line, grip or cylinder. |

The full last-live TITAN halo clears Kit by13.91 /11.52CSSpx. Collision-circle clearance alone is insufficient: the ball survives until its top crosses the drain and its decorative halo has21u radius. Reaction-distance measurements are in ignored `out/control-metrics/README.md`: a vertical normal ball from the Vault's bottom row has approximately0.345→0.539s /0.467→0.716s of free flight. These are simulation windows, not measured human reaction times.

Invasion retains `dangerY=paddle.y−64` and unchanged march speed. Lowering that line grants additional descents before landing; it does not increase the final formation-to-paddle warning gap. Vault snake route, timing, ball speed, touch gain and powers are not retuned by the proposal.

## Copy and score

Show **“Aim ready” only on the first deliberate press while a ball is actually caught**. Merely spawning the initial serve is silent. This includes a caught serve or a Focus catch; no new Focus-only input rule is proposed. The message lasts at most1s of presentation time and disappears on release/cancel. Its implemented acknowledgement is prefs key `breach.aimReadySeen` (`store` key `aimReadySeen`), with level fields `aimReadySeen` and `aimReadyUntil` using `kitTime`. Constructors load the saved acknowledgement. It must not repeat on every catch, life or run. Remove the other drag/slide/launch/catch coaching strings while retaining shot dots and functional aim feedback. The existing first-use Ward demonstration remains independent.

The source has no hard score cap. The proposal displays grouped exact numbers through999,999 and compact notation thereafter, preserving readable Lilita One numerals instead of shrinking indefinitely. Stress fixtures include999,999,9,999,999 and `Number.MAX_SAFE_INTEGER`; these do not add a gameplay score cap. The selected source uses grouped exact scores below one million and compact notation thereafter, in the game font.

## Isolated proof and implementation checks

Source baseline SHA256: `CFEA2D6FF5A8FE13F2CF539FA9D9F9FDB0581EF6C4469C38961701202FC972EF`, unchanged after capture. `out/mobile-layout-options/capture-report.json` records the native layouts. `edge-report.json` records actual held input followed by a normal ball/paddle Focus collision: first caught+press shows the message; initial serve without press and the next catch do not. Normal/WIDE wall and last-live TITAN fixtures were captured on both phones for both options, with no page errors. The prototype acknowledgement is in-memory. Production persistence, release/cancel behavior, real Focus-catch entry, scaled lower geometry, five lives and score font are additionally covered by `tests/arena.test.js`; `tests/kit.test.js` covers the face-only layout and emotion/input contracts. All11 focused tests passed before shared source freeze.

Before shipping the selected layout, recompute geometry before serve/debris/camera setup and on relevant scale changes. Clip or cull bolts,26u drop sprites and large debris before they enter the now-transparent lower controls, preserving catches above the drain. Run shield+18u/drain+20u regression, actual corner taps and multi-touch drag, stage/boss HUDs, long scores, first-use persistence, and native fullscreen APK tests. Screenshots alone do not prove those gameplay integrations or physical-device comfort.

Reproduction files stay under `out/mobile-layout-options/`: `capture.mjs`, `boards.mjs`, `invasion-boards.mjs`, `edges.mjs`, `prototype.html`, raw native screenshots and reports. The selected UI source is implemented on the working branch; combined packed-game and physical APK QA remain the final checks. The shared render/input guard uses the existing `coreMode==='ward'`: Invasion does not draw Kit, accept the Kit hotkey or activate a Kit power. Its normal centre-return Titan and relative drag are preserved. No new art batch, commit, push or APK-worktree edit was performed by this UI track.

## Tested mobile baseline

Build `EA839F00A4683BD3CFD05CB87BDE6DA4B79EDFFF0191621362FB90A75FF9FBAC` passes26 unit tests, mobile UI/persistence/score/drag/Titan/shield checks, Vault expressions/two-finger/Focus/Continue, venom/capture, layout and both polish runs. Reports: ignored `out/mobile-ui-final-v2/`, `out/mobile-kit-final-v2/`, `out/mobile-venom-final-v2/`, `out/mobile-capture-final-v2/`, `out/mobile-layout-final-v2/`, `out/mobile-polish-{ios,android}-v2/`. No page errors. Current Invasion has zero Kit draws and no hidden Kit input target. Its Saturn is dark/desaturated; the owner now requests a separate fuller full-bleed rescue encounter. The native immersive APK remains an unpublished local candidate and needs Android CI. No commit/push approved.
