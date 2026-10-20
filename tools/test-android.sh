#!/usr/bin/env bash
set -euo pipefail

mkdir -p out/android-screenshots

host_snapshot() {
  date -u
  free -m
  ps -eo pid,ppid,comm,rss,pcpu --sort=-rss | head -n 20 || true
  timeout --kill-after=2s 5s sudo -n dmesg -T | tail -n 120 || true
}
host_snapshot > out/android-host-before.txt 2>&1
# Keep the last device messages even if the emulator exits during the test.
timeout --kill-after=5s 13m adb logcat -v threadtime > out/android-logcat-live.txt 2>&1 &
log_pid=$!
status=0
timeout --kill-after=30s 12m gradle -p android --no-daemon --max-workers=2 \
  -Dorg.gradle.jvmargs='-Xmx1024m -Dfile.encoding=UTF-8' connectedDebugAndroidTest || status=$?
kill "$log_pid" 2>/dev/null || true
wait "$log_pid" 2>/dev/null || true
host_snapshot > out/android-host-after.txt 2>&1

# A disconnected emulator must fail promptly, not make adb wait until the job timeout.
timeout --kill-after=5s 15s adb devices -l > out/android-devices.txt 2>&1 || true
timeout --kill-after=5s 15s adb exec-out screencap -p > out/android-screenshots/last-screen.png || true
timeout --kill-after=5s 15s adb shell dumpsys window > out/android-window.txt 2>&1 || true
timeout --kill-after=5s 15s adb logcat -d > out/android-logcat.txt 2>&1 || true
timeout --kill-after=5s 30s adb pull /sdcard/Download/BreachPreviewScreenshots out/android-screenshots || {
  if [ "$status" -eq 0 ]; then status=1; fi
}
exit "$status"
