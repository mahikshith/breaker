#!/usr/bin/env bash
set -euo pipefail

status=0
gradle -p android --no-daemon connectedDebugAndroidTest || status=$?
mkdir -p out/android-screenshots
adb exec-out screencap -p > out/android-screenshots/last-screen.png || true
adb shell dumpsys window > out/android-window.txt || true
adb logcat -d > out/android-logcat.txt || true
adb pull /sdcard/Download/BreachPreviewScreenshots out/android-screenshots || {
  if [ "$status" -eq 0 ]; then status=1; fi
}
exit "$status"
