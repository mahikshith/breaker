# Continue here

Last updated 2026-10-20. Active branch: `codex/space-combat-apk`.

The owner approved both heavy and salvo fire, differentiated ship colours, alternating/paired/rest batteries, stronger player shots, Circuit Vesper/Latch, a better power menu, difficulty tuning and a new APK through CI. The five-chapter release is complete: CI 39399653237 passes web, native compilation/lint and Android 15 touch/fullscreen/lifecycle instrumentation. The downloaded APK is verified at 9,596,473 bytes, SHA256 B44BC99FE10468DEF35E89F32B85900F8AAD3C16BB92C6C1040A04D850E7BA8E. Download and scope: `docs/MOBILE_PREVIEW.md`; permanent evidence: `docs/validation/space-combat/native-release.json`. Physical handset performance and human difficulty remain device testing.

1. Read `docs/SPACE_COMBAT_HANDOFF.md`: exact current mechanics, resources, files, physics, controls and verification limits.
2. Read `docs/MOBILE_PREVIEW.md`: package scope, release hashes, CI and installable artifact.
3. Read `docs/NEXT_LEVELS.md`: proposed next encounters, with future encounters clearly separated from the completed Frost Warden. Escort and Switch proposals remain deferred.
4. Read `docs/ARTWORK_LIBRARY.md` and the permanent `artwork-library/` catalogue before remaking any asset.
5. Then read the historical handoff set for the broader story and prior choices. Newest dated facts override historical review gates; do not erase earlier evidence.

Save slots remain Carrier 0 / Vault 1 / Circuit 2 / Forge 3; Frost Warden appends slot 4. Do not move Vault progress into a space slot. Nix/Tick belong to Carrier; Vesper/Latch to Circuit; Forge currently has neutral ship arsenal. Nova/Pin, Escort Run and Orbital Switch remain future proposals. The owner delegated design decisions and authorized a fifth Frost Warden princess encounter using the Yeti rig, preserving Brum as a hero. See `docs/BRUM_LEVEL_PLAN.md` for the implemented geometry, measured collision, pacing, powers and phone evidence.

Final canonical browser SHA256: `B06CDD969BCF5C420A74B3CF37A3EAC45FE3D46EABB2926F5E5D2B8A42E01770`. Offline Android HTML: `4071ACEE8BE6AB862A3CD9A0CE35680B99090B9E254D7B858F699668D949B90A`. `config/mobile-preview.json` pins the source bundle; `tools/prepare-android.mjs` refuses a mismatch. Current sources pass 231 unit tests. Detailed receipts and selected phone captures are versioned in `docs/validation/space-combat/`.

User emphasis: retain reference art quality in runtime, meaningful pressure with readable dodges, ordinary-ball progress, useful bounded powers, distinct level objectives, full-screen safe mobile layout and detailed reproducible handoffs. Enemy space shots must never destroy the player's bricks. Avoid a mandatory precision puzzle when the ball cannot be directly aimed at every contact.
