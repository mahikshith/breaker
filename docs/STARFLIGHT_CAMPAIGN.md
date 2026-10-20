# Starflight campaign: combat, consequence and mastery

Updated 2026-10-20. **PROPOSED CAMPAIGN — design first; no campaign implementation, human balance certification or new APK is claimed.**

Implementation checkpoint: [Gatebreak](STARFLIGHT_MISSION.md) is now a separate finite browser mission using returning patrols, productive hull damage, capability loss, earned supplies and a final gate departure. It does not implement the six proposed chapters, persistent equipment or chapter saves below. The original endurance lab survives at `?lab=1`. Latest owner priority is enjoyable, readable pressure and spectacular but bounded powers; Stormwing must suppress all friendly gunfire until its wings reattach.

The owner's latest correction supersedes the earlier rescue-to-module proposal. The references inform design judgment; they are not a progression template. This campaign centres on distinct enemy behaviour, authored terrain and formations, weapon tradeoffs, meaningful destruction of combat capabilities and replay mastery. Rescue is an occasional optional mission type. There is **no rescue requirement per chapter, six-specialist reward chain or mandatory permanent attachment system**.

The current [combat lab](STARFLIGHT_PROTOTYPE.md) has direct flight, automatic twin fire, seven earned reactor choices, several actual ship families, asteroids and gravity. It remains a repeating three-sector endurance loop. Authored campaign objectives, ordinary loadouts, component-specific boss states, chapter saves and class-specific wreck sequences below are proposed. Its common explosion is a current limitation. Preserve the lab and the five-chapter breaker APK independently; neither implements this plan.

## 1. Reference evidence and our conclusions

Research on 2026-10-20 used publisher/developer descriptions and original manuals. It was **not hands-on play or measurement of reference-game timings/physics**. The applications below are our inferences, not claims that those games prove retention, addiction or a particular balance formula. Keep our story, art, audio, silhouettes and layouts original.

| Primary evidence | Documented observation | Our application |
|---|---|---|
| [Konami: Gradius, Salamander and Life Force](https://www.konami.com/games/gradius/us/en/) | A fortress/core mission, different scrolling environments and a strategic power-up system; regional Life Force/Salamander versions differ. | Give the player a destination, different environmental problems and deliberate equipment choices. Do not copy stages or assume one version's rules apply to all. |
| [Nintendo publisher description: Galaga](https://www.nintendo.com/us/store/products/arcade-archives-galaga-switch/), [Bandai Namco description](https://www.bandainamcoent.co.jp/cs/list/nm_psp/galaga.php) | Captured-fighter rescue produces linked fire; Bandai also describes Challenging Stages. | Contrasting pressure/release can matter. An occasional rescue can have a consequence; this does **not** prescribe a rescue or upgrade every chapter. |
| [Nintendo: TwinBee](https://www.nintendo.com/en-gb/Games/Nintendo-3DS-download-software/3D-Classics-TwinBee-275152.html), [Nintendo-hosted manual](https://www.nintendo.co.jp/data/software/manual/man_sacj.pdf) | Visible changing bell rewards; different airborne/ground actions. | Readable weapon choices and enemy roles. Do not require tiny collectible juggling during phone crossfire. |
| [Gun-Nac original publisher manual, archived scan](https://www.thegameisafootarcade.com/wp-content/uploads/2017/02/Gun-Nac-Game-Manual.pdf), printed pages 10–11 | Numbered weapons, Wings and inter-stage supply choices change equipment. This is an original Nexoft/ASCII manual hosted by an archive, **not a current official publisher site**. | Distinct firing behaviours and calm selection between engagements; no imported cash grind or shop dependency. |
| [TimeSpace's Space Shooter X announcement](https://itch.io/t/2013327/space-shooter-x-release-announcement), [developer post](https://forum.gdevelop.io/t/space-shooter-x-now-on-itch-io-play-now-in-your-browser/38907) | A Web/Android shooter with enemies and asteroid avoidance; [another developer uses the same title](https://geymison.itch.io/spaceshooter-harushin). | **Exact SpaceShooterX identity unresolved.** These are candidates, not proof of the owner's intended app or its detailed mechanics. |
| [Official Play listing: Space Shooter: Galaxy Attack](https://play.google.com/store/apps/details?hl=en&id=com.space.shooter.alien.galaxyattack) | The developer uses Premium/VIP wording and describes drag steering, equipment and bosses. | **Exact VIP identity unresolved.** Use readable direct flight and a clear arsenal, without copying monetisation or claiming this is the exact app. |

## 2. Combat loop, story and replay

**Proposed original story:** Admiral Veyr has turned the jump network into a blockade supplying an automated foundry. The escort must break its combat systems, cross industrial approaches and remove the command ship's control. The evacuation convoy supplies context, not a compulsory fragile escort in every level. Three offset crimson slashes on batteries, relay hulls and the capital ship foreshadow the same commander. Existing Nix, Tick, Vesper, Latch, Kit, Lumi, Brum and Frost Warden identities remain intact.

Urgency is immediate and visible: an interceptor commits to a dive, a rack charges, a tug moves a rock into a passage, a shieldship rotates its protected face or a boss loses a gun and changes its attack. No invisible global deadline, forced grind or paid escape. Progress visibly removes a source, breaks a formation, changes a route or disables a capability.

The main loop is **read → position → commit fire → create an opening → exploit → recover**. An optional gun is a safer target than rushing the core; leaving it alive can permit a quicker but riskier clear. Every chapter teaches, develops, twists and tests one positioning problem, with a quiet passage before its peak. Do not repeat the same kill group with a colour change and larger HP.

Keep relative one-finger drag, automatic primary fire and one reactor orb. The seven-choice arsenal pauses deliberately and cancels held input. Ordinary loadouts change in the briefing or safe checkpoint, not through extra combat buttons. Pause, background, chooser and portrait correction freeze the simulation and require fresh input on return. Full opaque ship clearance includes screen edges and the reactor, not only its vulnerable core.

Use one short chapter title, then physical landmarks and small objective icons. No WAVE N labels or repetitive results interrupting flight. Camera, scrolling and music bridge encounters through 3–5 s harmless passages. An empty sky or broken gun can be the reward; new equipment is not required. One repair at a chapter checkpoint is sufficient and cannot refill the reactor for free.

### A small ordinary weapon catalogue

Choose **one firing preset**, not stacked permanent modules. Existing real twin-barrel anchors remain the shot sources. Physical muzzle inserts can be added only if needed for an admitted weapon state; attachment production is not a campaign dependency.

| Preset | Proposed physical contract | Tradeoff | Availability |
|---|---|---|---|
| Needle | Existing twin damage 1 rounds every 0.16 s: ideal 12.5 HP/s before misses | Focused hull/gun damage; needs alignment with crossing fighters | First start |
| Fan | Three damage 0.75 rounds every 0.18 s over approximately±0.17 rad: ideal 12.5 HP/s only if all connect | Broad crossing coverage; distant single-target damage drops as outer rounds miss | First start; actual alternating twin ports |
| Rail | Two damage 2 rounds every 0.32 s, at most 2 different targets per round: ideal 12.5 HP/s on one target | Rewards aligning a formation; missed aim and fast reversals cost more | One ordinary chapter 2 clear; no rescue, rank, payment or repeated farming |

These are campaign proposals. Equal theoretical DPS is not proof of equal feel. Needle must complete every chapter/mode. Rail cannot repeatedly hit one compound actor or pass invisible solid walls. There is no base damage/health upgrade ladder, six-module inventory or reward-per-level promise. Later chapters may award a route dossier, mastery mark or simply story completion.

Keep all seven reactor choices as temporary tactics: Lance for alignment, Seekers for mobility, Spiral for coverage, Drones for interception, Nova for a local emergency, Hyper for a brief burst and Stasis for route management. Start from their real [combat contract](STARFLIGHT_COMBAT.md). Proposed campaign limit is one active choice, no duration stacking and one 100-credit meter/bank. Offensive specials replace ordinary preset output rather than multiply every barrel; Stasis allows ordinary fire and Drones still count as one ability.

Retain earned ordinary-damage banking and the lab's fill baseline: minimum approximately 30.30/33.33/37.04 active seconds on Easy/Medium/Hard when enough credit exists. Powered damage/kills, wrecks and enemy damage earn none. Pause, menus and safe passages do not fill it. Specials cannot fund their own replacements. All critical paths remain possible without casting.

### Mastery and replay

A first clear opens the next chapter. Optional records track clean positioning, clear time, capability-removal decisions and alternate routes; they grant no combat-stat advantage. Chapter 2 allows different disarm orders, chapter 3 has two routes that rejoin, and bosses allow safe disarm versus faster hull pressure. Challenge variants may change authored entry sides only after the base route works; they cannot randomise away its guarantee.

Score each enemy/component once. A possible later score-only combo is 3 s between kills, capped×3 and reset on damage; defer it if it distracts from combat. It never changes energy, loot or difficulty. Compare weapons on the same seed/mode and retain failed attempts. Observe whether real players understand changed capabilities and voluntarily replay; do not claim this research has proved addiction or retention.

## 3. Six authored chapters

**Every number below is provisional.** Every objective has a Needle/no-reactor route. Start with 360 u width and an authored distance director at 32 u/s. Required actors hold in view. No forced 45 s boss wait, endless replacement wave or invulnerability timer manufactures length. Fast combat may shorten the climax.

### 1 — Breakwater: interdict

Dark orbital wreck edge; destroy a command frigate directing the approach. **Win:** broad command hull disabled. **Fail:** player hull 0. Surviving scouts need not be killed.

Approximately 2800 u: isolated curved interceptor → paired cross-entry → gunship holding one side → quiet wreck vista → command frigate with crossing escort. Teach leading a moving target, then committed-dive avoidance, then source suppression. Escort members form briefly and peel off rather than sharing one sine wave. Nobody fires before completing visible entry.

Frigate starts near(180,0.24 H),74 u wide. Shared hull 90/110/130 HP; optional left/right rack pools 12/15/18 each. A rack hit reduces its pool and shared hull once; other opaque hull hits reduce shared hull. No double score/energy. Rack destruction cancels that future source, while launched rounds remain until success. Alternate fixed-aim fire with a short three-shot rack volley; Easy allows one charging source. The last legal hull hit clears harmful work and starts harmless sequential ammo cookoff.

**Decision:** safely disarm or exploit a crossing opening for faster hull damage. Needle/Fan must both work at different effective positions. No rescue/module grant. **Target80–110s; intensity0.15→0.45→0.10→0.65→0, then4s quiet exit.**

### 2 — Relay Drift: sever coordination

Offset station pylons; emitter ships coordinate a shield formation around a relay. **Win:** relay hull disabled. **Fail:** player hull 0. Killing emitters is a tactical choice, not a mandatory ordered lock.

Approximately 3400 u: unprotected pair → turning shieldship → full formation. Three emitters have at least 44 u exposed width and 14/18/22 HP. They govern targeting coordination, shield rotation and paired fire respectively. Their destruction removes those behaviours permanently for this encounter. Relay hull 105/130/155 HP; frontal shield reduces damage to 50%, never 0. Flank or shield-disabled hits deal full damage. No symbol order or pinpoint weakpoint.

Physical pylon routes remain at least 112 u; the central lane is always legal and one optional flank rejoins. A split shieldship creates a real low-pressure opening. Paired warnings remain attached to moving ports; stagger or cancel a volley if no safe route exists.

**Decision:** remove shield coordination, suppress paired fire or accept longer frontal shooting to reduce movement. **Target100–135s; intensity0.20→0.55→0.15→0.75→0, then4s station coast.** One clear opens Rail as a sidegrade once, not a mandatory upgrade.

### 3 — Glassbelt: traverse

Ferric asteroid channel with two authored routes. **Win:** cross the far gate after breaking its blocking rock OR disabling the tow reel moving it. **Fail:** player hull 0. No kill quota or compulsory civilian HP meter.

Approximately 3400 u. Left route: more breakable cover and slow gunships. Right: open space with fast interceptors. Both remain 112 u wide throughout actual motion and rejoin before the gate. Teach one slow rock, develop shooting versus bypassing it, then combine one obstacle with a committed interceptor. A broad 36 u reel has 10/13/16 HP; destroying reel or tug stops the tow and cancels future pulls. Gate rock has 22/28/34 HP as an ordinary-fire fallback. Other rocks have 6/8/10 HP and radii 16/21/26; their fragments are harmless.

At most one moving rock threatens the selected lane at once, with 1.5 s visible approach. A central quiet pocket separates the route tests. An **optional deferred** side alcove may later contain one stranded capsule for score/story acknowledgement. It grants no unique weapon, blocks no next chapter and creates no mainline failure; it is not first-slice work.

**Decision:** cover and longer sightlines versus a faster exposed route; shoot terrain or preserve reactor. **Target90–120s; intensity0.15→0.50→0.15→0.70→0.**

### 4 — Fold Sea: outmanoeuvre

Sparse gravity shoals and alternating shelter pockets. **Win:** disable both broad drive pods OR defeat the hunter's shared hull, then cross the clear gate. **Fail:** player hull 0.

Approximately 3200 u: harmless gravity tell → beetle crossing its edge → crescent hunter. Fields retain 2 s warning, bounded force and no teleport/direct damage. The hunter visibly banks before changing glide direction, fires bounded-turn missiles and keeps its actual lower notch empty. Hull 120/150/180 HP; two drives 24/30/36 HP each. Drive hits reduce drive and hull once; all other opaque hull remains productive. One failed drive reduces lateral movement and removes its missile source; both cause controlled drift, not an additional full-HP cleanup.

Fields alternate with attacks rather than covering every route. Required openings stay 112 u. After a committed missile salvo, cooling lasts 1.8/1.5/1.2 s before reposition. A field expires into a quiet pocket before the next peak.

**Decision:** change the enemy's mobility, concentrate broad hull damage or save Stasis for bad positioning. **Target100–135s; intensity0.10→0.45→0.10→0.75→0, then5s open sky.** No equipment reward is required.

### 5 — Foundry Crown: dismantle

Industrial trench opening onto a siege machine. **Win:** remove its armour banks, then destroy a genuinely external reactor. **Fail:** player hull 0. No captive/shuttle dependency.

Approximately 3900 u: destructible wall bank → gun-versus-structure decision → dead-machine shadow → foundry. Two banks 28/34/40 HP each, external core 48/60/72 HP. Before exposure, other broad hull impacts route damage to the nearest surviving bank with clear local feedback. Bank loss removes its source and visibly folds/breaks metal clear, creating a route. Optional gun destruction suppresses future warnings, not already launched shots.

Attack capability changes: alternating banks → one-bank aimed bursts → short reactor vent pulses. Do not merely accelerate one fan at HP thresholds. Actual raster topology decides exterior access: an enclosed lip cannot become an invisible passage. Deliver opened parts or use a genuinely exterior core. Collapse is harmless. Core exposure gives 1.5 s readable relief before its first warned vent.

**Decision:** suppress a gun, concentrate bank damage or align Rail through different parts. **Target120–165s; intensity0.25→0.60→0.15→0.85→0.**

### 6 — Dawn Corridor: break command

Final jump causeway and Veyr's capital ship. **Win:** shared command hull 0 OR both engines disabled, then accepted gate crossing. **Fail:** player hull 0. Evacuation is background consequence, not a surprise compulsory escort system.

Approximately 4200 u, two defended crossings separated by a silent fleet vista. Capital shared hull 160/195/230 HP, engines 34/42/50 HP each. Broad metal always reduces hull; engine impacts also reduce that capability once. Engine loss removes a linked gun and visibly tilts the group. Both disabled produce wounded drift; hull 0 produces staged breakup. Either opens the gate with no fixed survival timer. Optional guns offer safety at a time cost.

Combine known roles in authored pairs: shieldship+interceptor, then frigate+moving cover. Never combine mandatory gravity, fast rock and full-width fan. The capital alternates aimed racks with formation command and readable recovery. No invisible last-second phase. Accepted shutdown clears threats before 6 s ending flight. End the campaign instead of silently inflating HP and looping.

**Decision:** broad engine disable, hull pressure or cautious disarm. **Target130–180s; intensity0.30→0.70→0.20→0.90→0.**

Combined target: approximately 10–14 active minutes, plus optional exploration/pauses. These are pacing goals, not forced waits. Distinct verbs are interdict, sever, traverse, outmanoeuvre, dismantle and break command.

## 4. Authoring, physics, difficulty and phone metrics

Future encounter data contains ID, authored distance, prerequisites, actors, completion, relief and checkpoint. Required actors hold in view; optional escaped interceptors affect score only. No unlimited replacement spawns. Seed variation changes entry sides/cosmetics while preserving the critical path. Keep collision, progression and rendering separate.

| Proposed mode | Hull | Ordinary enemy HP multiplier | Hostile speed ceiling | Basic muzzle tell | Hostile shot cap | Ships / charging sources / physical hazards |
|---|---:|---:|---:|---:|---:|---|
| Easy |6|1.00|175 u/s|1.30 s|22|4 /1 /2|
| Medium |5|1.15|210 u/s|1.15 s|32|6 /2 /3|
| Hard |4|1.30|240 u/s|1.00 s|42|8 /2 /4|

Chapter-specific HP already includes mode scaling; do not multiply twice. Early beats stay below caps. Hard adds a learned role or shorter recovery, not hidden fire, smaller controls or removed ordinary damage. These differ from the lab and need new calibration.

Use fixed steps and relative sweeps for fast rounds, moving guns, rocks and terrain. One round contacting compound parts earns one episode. A component/shared-hull hit may update both pools but earns energy once for configured shared damage, never their sum. Disabled metal is physical only where visible; opened parts use moved shapes. Render and collision share pose/UV metadata. Gravity changes actual velocity, which drives projectile rotation. Trails never collide.

Warnings lock aim at their real moving ports. Prove a reachable safe interval across the entire volley for the full ship footprint; stagger or abort otherwise. Active-real clocks advance together; pause/chooser/background freeze them. Stasis changes declared translation, not warning/spawn timing. Final accepted objective damage wins before same-step fatal incoming damage.

Keep current **52/40/74/196u player/scout/gunship/guardian widths** on 360 u; beetle/frigate/crescent use corresponding 40/74/196 u. Historical 65/49/88/236 source suggestions are not the baseline. Player 52×46.8 u keeps its visible 7 u hostile-shot core. Terrain uses a forgiving actual hull outline, not transparent padding; notches stay empty.

At 393/412 CSS width,52 u is approximately 56.8/59.5 CSSpx. Allow a 68 u maximum future equipped footprint without requiring modules now. Mandatory openings are 112 u minimum with swept banking/edge/control proof. Keep at least 55% typical field calm; guardian art should occupy no more than roughly 36% combat height. Do not obscure the lower response lane with explosions.

Derive height from real HUD/insets/control geometry: target at least 580/640 u at 393×852/412×915, then measure. Test 59/34 CSS and 32/24 CSS safe insets, zero insets and native transient bars. Reactor target is at least 48 CSSpx. Entire opaque ship clears screen edges/reactor by 8 CSSpx, not only its core; central/right low flight remains possible.

At 180 u launch distance with radii 3.5+7,169.5 u travel takes approximately 0.97/0.81/0.71 s at proposed mode ceilings, plus warning. This stationary straight-line calculation is not dodge proof. Measure accelerated lateral response before accepting an 80 u correction; candidate 320 u/s requires about 0.35 s including acceleration. The current lab 480 u/s is unchanged by this proposal.

Runtime derivative targets: player 192×172 px, scout 128 px, gunship 224 px, frigate 256 px, crescent 512 px, capital/foundry 640 px maximum width; most rounds 96–128 px, background 512×1024 px. Preserve aspect, originals, alpha and normalised UVs. Target≤24 MiB decoded RGBA chapter textures,≤48 MiB during transition; not whole-process memory. A 412×915 DPR 2 surface already costs about 5.75 MiB before copies. Start DPR 2, immutable decoding and chapter-exclusive eviction; avoid bundling every full texture as base 64. Compressed goals:≤4 MiB chapter additions,≤18 MiB shared campaign pack, measured after quality review.

Cosmetic caps:6 wrecks,48 particles,2 large breakups. Reduce dead FX before live threat visibility. On physical mid-range Android target 60 fps; require sustained 30 fps, frame-time p 95<33 ms and no growing allocation over 10 minutes. Desktop/emulator success is not native performance proof.

## 5. Differentiated destruction and source requirements

The current common explosion does not implement these states. Deliver purpose-built layered sources; no rectangular photo quarters or one enlarged universal blast.

| Role | Movement/counter | Death physics and source parts to produce |
|---|---|---|
| Interceptor | Curved entry, committed dive, banked exit; no unseen fire | Actual inherited velocity,0.65 s damped corkscrew, roughly 100° bounded spin. Three unequal chips. Left/neutral/right banks plus 3 wreck pieces. |
| Missile frigate | Slow bank/hold; independently charged racks can be suppressed | Cancel unfired work; ammo cookoffs at 0/0.18/0.42 s during 1.2 s wreck. Open bay,3 rack layers, torn plate. No new damaging death missiles. |
| Shieldship | Rotates protected face; broad flank and 50% frontal fallback | Shield collapse, unequal halves separate over 0.9 s with distinct angular momentum. Collar,2 broken halves, exposed centre. |
| Crescent hunter | Reduced turning after drive loss, bounded missiles | Failed collar, controlled drift or 1 s unequal lobe breakup. Failed drives, damaged centre,2 lobe parts; notch stays empty. |
| Asteroid | Consistent drift/spin; destroy or bypass | Four irregular rock pieces inherit velocity plus bounded outward impulse, damp over 0.7 s. No ship explosion. |
| Foundry/capital | Group hover with real gun/engine capability loss | Local shutdown then 2.2 s staged breakup OR disabled drift. Damaged core,4 irregular hull sections, failed engines/guns. No opaque field-wide blast. |

State: alive→destroying→harmlessWreck→removed. Award score/loot/energy once; dead wrecks stop HP contact immediately. Capture actual velocity/angle once and integrate at fixed steps, with renderer read-only. Destroyed gun warnings cancel; launched shots survive ordinary death. Mission success clears harmful work before its cinematic.

**All routine fragments, cookoffs and collapses are harmless.** First slice has no collidable death debris. Any later falling slab is a separate authored hazard: visible body/sweep,1.2 s tell, radius≥12 u, max one, life 2.5 s; never inside the player/control or across the sole route. Its collision is not inherited accidentally from a dead sprite. Pause freezes wreck lifetimes.

## 6. Exact asset checklist

Reuse actual sources: **art/starflight/ships-source-v1.png**, **background-source-v1.png**, **weapons-source.png**; **art/starflight-v2/enemy-family-source-v1.png**; **art/starflight-arsenal/source.png**. Their matching runtime manifests hold real pivots/alpha/hardpoints. Existing ships/rocks/fields/rounds support blockout; a tint is not a new encounter or disabled capability.

Proposed new source/runtime roots: **art/starflight-campaign/chNN/** and **assets/starflight-campaign/chNN/**. Preserve originals/prompts/extraction/hashes; empty runtime metadata, real alpha, glow padding, measured collisions/ports/masks and native motion proofs. Produce only an accepted slice's requirements.

| Chapter | Reuse | New family checklist |
|---|---|---|
|1 Breakwater|Player, scout/beetle, gunship/frigate, shots/exhaust; existing nebula for blockout|interceptor-bank-L/N/R + wreck-0..2 (6); frigate-open-bay/rack-0..2/torn-plate (5); rack-disabled-L/R (2); quiet wreck-L/R (2); background/edge-tile (2). No tender, crew or module family.|
|2 Relay Drift|Gunship/frigate/crescent materials and rounds|relay-hull/emitter/emitter-disabled (3); signal-link-active/off (2 FX); shieldship-hull/collar/broken-L/R/exposed-centre (5); pylon-L/R (2); background/edge-tile (2). Rail insert only if admitted hardware changes.|
|3 Glassbelt|Rocks, interceptor/gunship and shared FX|tug-hull/reel/reel-broken/cable (4); rock-fragment-0..3 (4); gate-rock-intact/broken (2); route-L/R tiles (2); background (1). Deferred optional capsule/open/pilot (3) is separate and grants no required unlock.|
|4 Fold Sea|Gravity/wormhole and crescent|failed-drive-L/R/damaged-centre/wreck-L/R (5); shelter-L/R landmarks (2); background/edge-tile (2). No research crew or stabiliser reward.|
|5 Foundry Crown|Boss/crescent for blockout; gun/engine material and shared FX|base/bank-L/R/bank-broken-L/R/reactor-external/reactor-disabled/rear-mask (8); wreck-0..3/failed-engine/failed-gun-L/R (7); trench-L/R/background (3). Exterior-access proof before final hull.|
|6 Dawn Corridor|Shared enemies/FX; convoy background reuse only after view/scale check|capital-hull/engine-L/R/disabled-hull/wreck-0..3 (8); command-core-intact/disabled (2); gate-L/R/open-rear-mask (3); background/edge-tile/safe-harbour (3). No sixth module or mandatory rescue launch.|

Shared: one Veyr crest, three ordinary-loadout icons derived from weapon art, component-disabled glows. Reuse seven arsenal icons, Lilita One/Rubik and coherent house audio. New cues: gun-disable, armour-fold, frigate-cookoff, gate-open, command-shutdown; three adaptive music layers. No mandatory portrait roster is needed. Disabled hardware requires a readable real state, not a glow over an unchanged intact gun.

## 7. Persistence and ordered implementation

Separate proposed save namespace: **starflight.campaign.v1**. Store unlocked chapter/checkpoint, completion by difficulty, available/selected preset, preferences and optional mastery records. No rescue inventory or attachment tree. Do not remap breaker stars or turn lab endurance score into campaign completion. Rail unlock is idempotent; repeat clears award no stats/currency. Optional future rescue flags are separate story records.

Success latches before incoming same-step loss and clears damaging work. Continue restores the safe checkpoint with chapter-entry hull, zero reactor, cleared volley and 3 s warning grace, retaining saved progression/preset access. Components restore the checkpoint's coherent snapshot, not mixed dead guns/resurrected hull. Retry reconstructs chapter entry, clearing temporary powers/charge/score/held input, retaining preferences/unlocks. Version and atomically validate saves. Reload cannot duplicate score or make removed guns fire. No required payment.

### First complete slice: combat before expansion

1. **Metrics/contracts:** actual phone fields, opaque edge/reactor clearance, hardpoints, cadence and deterministic traces. Preserve lab. Future modules: campaign director, ordinary loadouts, chapter 1 data, campaign save; no new engine.
2. **Chapter1 blockout:** curved interceptor, cross-entry, side gunship, quiet pocket and disarmable frigate. Prove broad Needle damage and meaningful rack suppression. No rescue/docking/module/escort system.
3. **Weapon comparison:** Needle/Fan on the same seed; earned Lance/Drones/Nova as contrasting choices; state/budget/input checks for all seven. Log damage, misses, hull loss, target choices and failure; do not fit only a bot.
4. **Asset order:** small runtime derivatives/anchors → interceptor bank/wreck family → real frigate open/disabled racks/recoil/cookoff → quiet wreck landmarks → Breakwater background and five shared sounds. No attachment/crew budget yet.
5. **Full first-slice pass:** entry→charge→fire→hit→rack disabled→changed attack→distinct death→quiet exit; fixed wreck life, harmless debris and coherent Continue/Retry. Two phones/three modes with real touch, pause, background and arsenal. Review human feel before chapter 2.
6. **Chapter2 then3:** formation dependencies/nonzero shield fallback, then divergent terrain routes. Rail comes from one mission milestone; rescue remains optional/deferred.
7. **Chapter4 then5 then6:** gravity/hunter positioning, real bank/core topology, capital capability changes/alternate ending. Each adds a different combat question with recovery, not a recoloured schedule.
8. **Optimise/package deliberately:** chapter stream/cache/evict, physical Android profile, explicit offline entry/font/asset pin and native CI. Current APKs do not acquire campaign content from this plan.

### Acceptance gates

- **Simulation:** ordinary-only route through every objective; actual moving sweeps/apertures; component/shared damage credited once; no notch filler; pause all clocks; no catch-up attack; final-hit priority; dead warning cancellation and correct live-shot lifetime.
- **Weapons/economy:** Needle always viable, Fan/Rail tradeoffs; correct cadence/ports/pierce, one reactor choice, no powered refill/overflow or permanent damage growth; fresh Retry/coherent Continue; no duplicate milestone/score.
- **Earned routes:** both phone heights/all modes, ordinary input route plus earned-power route, exact seeds/actions/hashes; disclose natural pickups/assists/staging and preserve losses. Measure threat removal, dodge space and relief, not only the result screen.
- **Input/art:** real relative touch, seven choices, pointer/key cancellation/repeat suppression, portrait/resize/background, safe-area variants, opaque edge/control clearance, full decode/fonts and zero errors. No shot hidden by glow/terrain, detached muzzle or rectangular breakup stamp.
- **Destruction:** inherited role motion/lifetimes, harmless routine wrecks, no damage/charge farming, bounded FX; attached guns/engines until deliberate separation. Actual native motion for every role, not only enlarged stills.
- **Human/performance:** physical Android response/heat/memory session; understandable Easy, recoverable Medium, counterable Hard. Ask what changed when a gun died and why a weapon was chosen. Observe voluntary replay without claiming proven addiction; automated wins do not certify balance.

This revision supersedes the mandatory rescue/attachment scheme. Next is **one complete combat slice with weapon tradeoffs, disarmable opposition and satisfying differentiated destruction**. All future campaign work remains proposed until its own implementation/review receipts exist.
