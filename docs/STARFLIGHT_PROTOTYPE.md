# Starflight: Last Light

Updated 2026-10-20. Working branch: `codex/starship-run-prototype`.

The owner authorized a fast starship-versus-starship prototype with direct flight, scrolling environments, powerful readable weapons, new extracted artwork and parallel implementation. Design decisions, committing and pushing are delegated. This is a separate browser experiment; it does not silently replace the five existing chapters or enter their reviewed APK.

After playing it, the owner requested a single circular reactor, a lower/smaller hero, more enemy families, meaningful weapon variety, stronger resistance, no dotted aim paths, asteroids and gravity hazards. Those changes form the current combat checkpoint. The later request is **campaign design first**: [STARFLIGHT_CAMPAIGN.md](STARFLIGHT_CAMPAIGN.md) plans combat-first authored chapters and equipment choices. The owner clarified that rescue-earned progression was an example, not a required formula. Those campaign systems are proposed, not implemented by this combat checkpoint.

## Play and controls

Serve the repository root with `python -m http.server 4193 --bind 127.0.0.1`, then open `http://127.0.0.1:4193/prototypes/starflight/`. The previous chapters remain at `/dist/breach.html`. This development server must remain running.

Drag anywhere on the battlefield to steer relative to the ship's current position. It never snaps beneath the finger. Twin cannons fire automatically. Arrow keys or WASD steer on desktop. Tap the single lower-left ship/reactor icon or press E to open the seven-weapon arsenal. The ring displays earned charge. Choosing a weapon spends one full charge; keys 1–7 match the card numbers. The chooser freezes combat and cancels held input. Closing it resumes deliberately; it cannot become a free hidden slow-motion effect. Pause includes Resume, Retry, sound and briefing. Losing offers a fresh retry. Backgrounding pauses the simulation and requires Resume.

The small white ship core is the vulnerable hitbox. Wings are forgiving. Enemy hulls, including the guardian's wings, accept ordinary fire. Weapon trails and glow are visual; swept collision follows the payload. Every enemy barrel and engine uses measured anchors from its actual sprite. Left, right and paired volleys use local charging muzzle light before launch, with no dotted aiming paths. The hero begins at 90% of the combat field. A swept control-reserve circle measured from the actual reactor prevents the ship hiding behind that button while leaving the central/right lower flight lane available.

Shared display widths are now player 52, scout/interceptor 40, gunship/frigate 74 and guardian 196 world units. Model geometry and rendering shrink together. The top HUD is reserved; combat is clipped below it, and only one guardian HP bar is drawn. Rotation into a short landscape viewport pauses with a portrait prompt. Resize rebases player history while paused, preventing a fictitious swept collision on Resume.

## Story and distinct sectors

The crew has escaped Carrier Breakout. Their convoy cannot leave the system while three blockade transmitters remain active. The player pilots its escort and opens the evacuation corridor.

1. **Carrier Reach:** crossing scouts and banking gunships establish movement and interception; the Blockade Commander uses a narrow spread.
2. **Relay Drift:** opposing lanes and angled approaches make lateral positioning matter; the Relay Hunter aims at the pilot's locked warning position.
3. **Forge Belt:** denser mixed formations and the Forge Dreadnought's wider fan demand route selection and saved reactor charge.

Each sector currently has seven scheduled formations, a guardian at 45 seconds, then an eight-second danger-free convoy jump after the guardian falls. There are no numbered wave labels. Hostile shots clear at victory, the ship repairs one hull point on entering the next sector, and the environment changes tint. After three sectors, another cycle increases pressure. This is a playable endurance loop, not three finished campaign episodes. New beetle interceptors and missile frigates join the first sector from its later formations; the later sectors use the crescent guardian and different patterns. The convoy is narrative context and jump messaging, not a simulated escort object.

## Weapons, physics and balance

Seven reactor choices provide different roles: piercing Lance, guided Seekers, weaving Serpent shots, orbiting Wingmen, a radial Nova, five-barrel Hyper and Stasis. All consume a full charge and have bounded durations/counts. Productive ordinary damage banks reactor credits; they fill at capped Easy/Medium/Hard rates of 3.3/3/2.7 points per active second. Powered hits cannot refill their replacement. Repair, shield, rapid-fire and charge pickups use equipment artwork rather than plus/minus tokens. Exact durations and damage belong to the combat contract.

Destructible drifting asteroids offer temporary cover and can be shot apart. Warned gravity pockets pull within a bounded radius; they do not teleport or instantly kill. The new missile frigate has six measured tubes; its launch pattern uses real tube origins. Broad hull damage remains available, including on the new crescent's physical lobes, while its open notch remains empty.

Easy/Medium/Hard vary hull, projectile speed, warning duration, guardian health and shot limits. See [the combat contract](STARFLIGHT_COMBAT.md) for exact values, collision equations, update rules, seeds and measured routes. Simulation uses a fixed frame accumulator and substeps, relative swept collision, bounded object lifetimes and capped counts. New physics is isolated from the existing breaker model.

Successful model-assisted routes prove reachability, not human difficulty. Human phone feedback should tune warning lead time, projectile density and charge cadence before adding more content. Preserve fair dodge gaps and ordinary-fire viability instead of making payment necessary to win. There is no ad, purchase, token economy or persistence in this prototype.

## Art and implementation

- `prototypes/starflight/`: HTML, mobile HUD, inputs, Canvas rendering and house audio.
- `src/starflight/model.js`: deterministic movement, collisions, waves, enemies, powers and progression.
- `src/starflight/geometry.js`: actual sprite dimensions, UV emitters and compound hulls.
- `art/starflight/`, `art/starflight-v2/`, `art/starflight-arsenal/`: permanent ship/environment/VFX/equipment sources, briefs, extraction scripts and proof.
- Matching folders under `assets/`: runtime sprites and manifests. [Art handoff](STARFLIGHT_ART.md) records source hashes, alpha, sizing and provenance.
- `prototypes/starflight/render-effects.js`: textured payloads, local cannon charging, asteroid/gravity and actual orbiting drone rendering.
- `tests/starflight.test.js`: collision, progression, power budget, timing and manifest agreement.
- `tools/playtest/starflight.mjs`: phone browser input and capture evidence.

The six VFX cells are extracted by `art/starflight/extract_weapons.py`; projectile contact pivots are measured inside their transparent frames. The arsenal extractor isolates connected silhouettes, including separated paired missiles/drones, instead of blindly clipping a uniform grid. Existing Lilita One/Rubik and `src/audio.js` are reused. No additional runtime dependency was introduced.

The environment scrolls a dark seamless nebula with quiet parallax. Cyan player fire, coral enemy rounds and violet Hyper remain readable. Effects use extracted raster glow, missiles, drones, muzzle and explosion artwork; engine plumes and local cannon charging use lightweight Canvas primitives. These are animated sprites and transforms, not new fully rigged 3D ship models. Per-class physical wreck breakup remains a campaign production task; the prototype has a common explosion family and cosmetic asteroid fragments.

High-level pacing references: [Sky Force Reloaded](https://www.idreams.pl/en/our-products/show/product/77-Sky-Force-Reloaded) and [Phoenix 2](https://firigames.com/phoenix2). The campaign document expands this with the owner's Gradius/Life Force/Galaga/TwinBee references, primary-source links and limits of the research. No artwork or layouts are copied.

## Integration gates

Keep this experiment outside the pinned five-chapter Android bundle until its own browser review is complete. Packaging it later requires a deliberate entry-point/build change, offline asset embedding, revised bundle pin, native instrumentation and a new APK. Do not label the earlier APK as containing Starflight.

Before adding more sectors: follow the ordered campaign plan, build its first complete combat-and-weapon-choice slice, play on physical phones and measure long-run performance/difficulty. The campaign needs save/checkpoint rules and story transitions. Portrait is the intended layout. Do not treat old larger-ship or three-power validation receipts as current evidence.

## Current verification

The complete branch passes 266 unit tests. Final source-sealed phone-browser evidence, staged power images, ordinary first-sector routes and normal-clock smoke are preserved in [validation/starflight](validation/starflight/README.md). Six mode/phone cases and 42 ability activations pass; actual alpha checks verify reactor and screen-edge clearance. These certify the browser combat lab, not future chapters, human balance or native device performance.
