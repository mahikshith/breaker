# Serpent venom and Kit ward

The owner selected **A: the left face orb** and approved the presented organic venom, manual ward and top-tunnel entrance. Native integration and the final packed phone checks are complete on SHA256 **3A6B8A8C5368364AFCFCE6BBF7B1994D4598C121C90B45B72FE5BD7E45285EC1**. No commit or push is approved.

The straight acid jet and compact puff comparisons were superseded when the owner requested a stronger, irregular spray. Their images and large GIFs are archived only in ignored `out/venom-prototype/history/`. The later standing Kit with a horizontal bar was also superseded. Current quiet state is an actual Kit face portrait inside a circular charge orb; full-body display is temporary.

## Selected behaviour

Two **separate incoming ball contact episodes** with the visible serpent queue fury. Head and body contacts both count. Repeated overlap, an outward-moving ball, a hidden tunnel segment and near-simultaneous contacts within0.35 seconds cannot fill the second hit. Lasers and falling bricks retain their existing reactions and do not build fury.

A head hit still gives its existing knockback and3-second stun, or5 seconds for a FIRE ball. A body hit retains its existing flinch and chewing setback. Fury waits for that earned reaction before warning; it does not replace the hit reward. There is no opening venom and no automatic rage from the entrance.

The serpent then locks the **nearest exposed useful partition** within68 world units. The preview uses the real planner and restores all grid data. A target must lower route cost; no useful target leaves fury visibly queued while ordinary crawling continues. The cage roof, frame sides and bars are protected. The1.4-second warning shows an angry head, coral timer, one lime target outline and a dotted directional marker.

The breath lasts0.55 seconds, with impact at0.32 seconds. Its visual uses a pulsing fan, irregular curved tendrils, moving droplets and impact splashes. It corrodes one selected partition brick and uses the existing crumble/collapse rules. The spray is not an area-damage simulation. A1.2-second visible recovery follows, then the fury counter resets. A single-brick limit does not by itself prove fair difficulty.

During the warning, a deliberate tap on the **full**52CSS-pixel left orb casts Kit's ward onto the marked target. The full12-break charge is spent once. The0.18-second cast must fit within the remaining warning; empty, late, missed and drag-through inputs cannot defend. The ward protects that target for this volley, with0.25 seconds of visible residue afterward. It does not create12 seconds of immunity. Vault reserves the charge for ward; Invasion retains its existing TITAN return.

Full charge opens one12-second expressive body display. A cast during that live window keeps the original expiry; a valid cast after receding starts one new12-second window. Ready, focus, shield success and continuing danger have different reactions. Ordinary play continues throughout. Receding leaves the charge and orb control intact. There is no body or horizontal charge bar in the quiet state.

The first eligible warning with an actually earned full charge pauses for contextual practice: **VENOM MELTS THIS WALL / Tap Kit to guard it**. The marked wall and orb remain visible. Gameplay time, ball positions, serpent movement, lives and warning timer stop; Kit's separate presentation clock keeps animating. A valid orb tap spends the existing charge, resumes the volley and saves one acknowledgment flag. The coach grants no charge, lives, power or head impacts. The ignored replay page is a separate owner demonstration, not this shipped first-use lesson.

## Native implementation and interface

- `src/serpent.js`: contact episodes, timing constants, protected frame geometry, safe streaming recoil, temporary route preview and useful target selection.
- `src/vault.js`: entrance, visible collision masks, fury state, native fan/ward drawing and existing crumble integration.
- Vault exposes `coreMode='ward'`, `canUseKitPower()` and `useKitPower()`. A successful cast sets `kitCastAt`; resolution sets `kitWardResult='held'|'missed'` and `kitReactionAt`.
- Arena/Kit/main own the face orb,52CSS-pixel deliberate tap,12-second presentation, normal drag control and charge reservation. Vault uses `kitAnchor()` for the transfer effect.
- `tests/serpent.test.js` adds six meaningful checks; all21 repository tests pass with the Kit/coach checks. `tools/playtest/venom.mjs` checks native controls, contact/ward outcomes, first-use practice and terminal/skip regressions. `tools/playtest/vault-v2.mjs` waits for continuous intro skipping, uses ward legally in its seeded rallies and seals the tested build hash.

## Prototype evidence and limits

The isolated prototype is reproducible at `out/venom-prototype/demo.html`. Default Play has no injected contacts. Full/Empty/Success replay modes visibly show the entrance and normal movement before two separately staged physical ball impacts; they are demonstrations, not human playtests. The short actual-game comparison is `img/venom-spray-ward-preview.gif`.

Across iPhone393×852 and Android412×915, ten focused full/empty/missed/late/drag scenarios passed. Full-charge centre taps spent once and held the real partition; empty/late/missed/drag inputs allowed one melt. Both side layouts were checked at both paddle extremes with8CSS-pixel drain/orb and orb/grip separation. All18 bars and the frame stayed intact at the breath impact; the example melt caused zero extra collapse. These measurements belong to the isolated proposal, not the forthcoming production hash.

With the streaming start, an early unguarded partition at[13,1] lowered measured planner cost61.69→51.04 and steps38→17. In a later state, protecting[13,6] held cost54.15; removing that partition in the earlier targeting audit lowered cost54.15→7.54. That severe late shortcut is why rage timing, charge economy and human phone feel still need tuning. Four hits, a route count, bot wins or one safe ward case are not difficulty validation.

The rendering work is moderate: existing head poses, Canvas paths and crumble already supply the pieces. The harder part is the gameplay contract—counting physical contacts once, respecting earned stuns, selecting a useful exposed opening, keeping virtual tunnel collisions safe and making charge timing fair. No fluid simulation or new character rig is required.

## Final combined build verification

The hash above is sealed before and after each final suite. Native screenshots and data:

- `out/venom-coach-final/report.json`: both phones, all ten actual orb-input outcomes;3-second head stun,5-second FIRE stun, separate body contacts, hidden tail masking, safe recoil, cage protection and route changes.
- `out/venom-coach-final/{ios,android}-coach-01-paused-practice.png`: twelve real brick breaks earn charge; five seconds of practice leave world snapshots identical while Kit's clock advances. Actual tap resumes, holds the target and persists acknowledgment from a verified false initial flag.
- The same suite holds a250ms intro skip through pointer-up and Space-up without launching the caught serve. Losing a ball during warning leaves target, grid, serpent and warning timer unchanged while Continue is shown.
- `out/vault-ward-coach-final/report.json`: six complete baseline rallies all lose to the serpent, despite five legal ward holds; both caches still drop eight bricks, solid-material power combinations pass, and idle loss is reachable. This is retained as a real difficulty limitation.
- `out/vault-ward-scout-final/report.json`: a wider-angle iPhone run wins in30.042 seconds,132 bricks, two stars; the eight additional Android fixed-offset trajectories all lose.
- `out/vault-strategic-android/report.json`: Android seed20181024 wins in43.817 seconds,121 bricks, one star, using ten legally replenished Focus catches and actual SPLIT/FIRE/LASER collection. A copied-grid simulation chooses aims; live changes use normal aim/drag/Space/ward controls, with no direct grid, lives, charge or boss edits. Every aim, seed, collected power and cache state is recorded. Screenshot: `android-20181024-won.png`.
- `img/serpent-entry-native.gif` and `out/venom-entry-final/report.json`: actual final-build downward entrance and normal handover, with zero contacts/fury throughout.

The earlier3-win/3-loss mixed-level result belongs to the old offensive-charge build and is historical. These new runs prove native function and recoverability on both geometries; they do not establish human completion rate, balanced difficulty or physical-device touch feel. No gameplay tuning followed the bot results.
