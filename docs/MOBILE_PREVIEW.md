# BREACH Android preview

This is the owner's requested pre-Brum gameplay checkpoint, distributed from the separate `coding/mobile-preview` branch. It includes Knight 2, the mixed harder Vault, the left Kit orb with the earlier 12-second body appearance, earned Ward, variable venom, the first-use lesson and the downward tunnel entrance. The current Invasion level is also playable.

It deliberately retains the earlier cast and princess-capture animations. Their replacements, Brum, new space characters and later levels are still in design and are not in this APK. The owner explicitly authorized committing and pushing this checkpoint and running its CI on a new branch; `main` remains unchanged.

## Install

1. Download the `BREACH-android-preview-<run>` artifact from the successful **Mobile preview** Actions run and unzip it.
2. Copy `BREACH-preview.apk` to an Android phone running Android 8.0 or newer.
3. Open the APK and permit installation from that browser or file manager when Android requests it. Launch **BREACH Preview**.

This is a debug-signed test app, not a Play Store release. A later build with a different disposable debug key may require uninstalling this preview first, which clears its local progress. It uses a separate preview application ID. The game and its Lilita One/Rubik fonts are bundled and require no network permission.

## Controls and test scope

Drag in the lower deck to steer. Release the opening held ball to serve. Hold briefly during play for a Focus catch, aim, then release. Break bricks to charge Kit; in the Vault, tap his left orb during the marked venom warning to shield the threatened partition. Invasion retains its charged centre-return Titan.

Ads and purchases remain the existing simulation: no real advertisement or payment service is connected and no money is charged. The fake unlock button only changes this preview's local state.

CI runs unit tests and browser checks on both phone sizes, then Android lint and an Android 15 emulator installation with network disabled. Its native smoke test checks bundled fonts, a nonempty canvas, touch aiming/serve/steering, both levels, a clean entrance and persistent local storage after recreation. Screenshots and test reports are separate evidence artifacts. These checks do not establish physical-phone performance, sound, thumb comfort, Safari behaviour or human difficulty balance.

## Reproduce

Use Node 22.23.3, Java 17, Gradle 8.11.1 and Android SDK 35:

```sh
npm ci
npm test
npm run build
node tools/prepare-android.mjs
gradle -p android assembleDebug lintDebug
```

`tools/prepare-android.mjs` rejects source changes that would silently alter the frozen checkpoint. Its SHA256 normalizes only line endings: `88d7c7f6b6703354d9ed08145bc21b6771b41b4a460281f2a212818fe2c1768c`. The original Windows build SHA256 is `3A6B8A8C5368364AFCFCE6BBF7B1994D4598C121C90B45B72FE5BD7E45285EC1`. Packaging replaces external font links with bundled OFL fonts and records the packaged HTML hash in `preview.json`.

The GitHub workflow is `.github/workflows/mobile-preview.yml`; it triggers on this branch's pushes and by manual dispatch. No Android SDK or Java installation is required on the owner's desktop to download the artifact.
