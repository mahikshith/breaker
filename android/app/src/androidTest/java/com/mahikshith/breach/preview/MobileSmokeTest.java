package com.mahikshith.breach.preview;

import android.graphics.Bitmap;
import android.os.SystemClock;
import android.os.ParcelFileDescriptor;
import android.view.MotionEvent;
import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import org.junit.Test;
import org.junit.runner.RunWith;
import java.io.File;
import java.io.FileOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import static org.junit.Assert.*;

@RunWith(AndroidJUnit4.class)
public class MobileSmokeTest {
    private MainActivity activity;

    private String js(String script) throws Exception {
        AtomicReference<String> result = new AtomicReference<>();
        CountDownLatch done = new CountDownLatch(1);
        InstrumentationRegistry.getInstrumentation().runOnMainSync(() ->
            activity.game.evaluateJavascript(script, value -> { result.set(value); done.countDown(); }));
        assertTrue("JavaScript callback timed out", done.await(10, TimeUnit.SECONDS));
        return result.get();
    }

    private void await(String condition) throws Exception {
        long until = SystemClock.uptimeMillis() + 30000;
        while (SystemClock.uptimeMillis() < until) {
            if ("true".equals(js("Boolean(" + condition + ")"))) return;
            Thread.sleep(100);
        }
        fail("Condition timed out: " + condition + "; page error: " + activity.pageError);
    }

    private void awaitCanvas() throws Exception {
        await("window.__breach && document.getElementById('game').width > 300");
        js("document.fonts.load('16px \"Lilita One\"'); document.fonts.load('600 16px Rubik'); true");
        await("document.fonts.status === 'loaded' && document.fonts.check('16px \"Lilita One\"') && document.fonts.check('600 16px Rubik')");
        await("(() => { const c=document.getElementById('game'),g=c.getContext('2d'),col=new Set(); for(let y=1;y<12;y++)for(let x=1;x<8;x++)col.add(g.getImageData(Math.floor(c.width*x/8),Math.floor(c.height*y/12),1,1).data.join(',')); return col.size>15; })()");
    }

    private void screenshot(String name) throws Exception {
        Bitmap image = InstrumentationRegistry.getInstrumentation().getUiAutomation().takeScreenshot();
        assertNotNull("Emulator screenshot", image);
        File folder = new File(activity.getExternalFilesDir(null), "screenshots");
        assertTrue(folder.isDirectory() || folder.mkdirs());
        File capture = new File(folder, name + ".png");
        try (FileOutputStream file = new FileOutputStream(capture)) {
            assertTrue(image.compress(Bitmap.CompressFormat.PNG, 100, file));
        }
        image.recycle();
        String destination = "/sdcard/Download/BreachPreviewScreenshots";
        File export = new File(folder, "export.sh");
        String command = "(mkdir -p '" + destination + "' && cp '" + capture.getAbsolutePath()
            + "' '" + destination + "/" + name + ".png' && echo CAPTURE_OK) 2>&1\n";
        try (FileOutputStream script = new FileOutputStream(export)) {
            script.write(command.getBytes(StandardCharsets.UTF_8));
        }
        try (InputStream result = new ParcelFileDescriptor.AutoCloseInputStream(
                InstrumentationRegistry.getInstrumentation().getUiAutomation().executeShellCommand("sh " + export.getAbsolutePath()))) {
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            byte[] buffer = new byte[1024];
            for (int n; (n = result.read(buffer)) != -1;) output.write(buffer, 0, n);
            assertEquals("Screenshot export: " + name, "CAPTURE_OK",
                new String(output.toByteArray(), StandardCharsets.UTF_8).trim());
        }
    }

    private void touch(int action, float x, float y, long down) {
        MotionEvent event = MotionEvent.obtain(down, SystemClock.uptimeMillis(), action, x, y, 0);
        InstrumentationRegistry.getInstrumentation().sendPointerSync(event);
        event.recycle();
    }

    @Test public void offlineCanvasTouchAndBothLevels() throws Exception {
        try (ActivityScenario<MainActivity> scenario = ActivityScenario.launch(MainActivity.class)) {
            scenario.onActivity(value -> activity = value);
            awaitCanvas();
            screenshot("01-menu");
            js("window.__breach.start(0)");
            await("window.__breach.level.t > 0.3");
            int[] origin = new int[2];
            AtomicReference<Integer> width = new AtomicReference<>(), height = new AtomicReference<>();
            scenario.onActivity(value -> { value.game.getLocationOnScreen(origin); width.set(value.game.getWidth()); height.set(value.game.getHeight()); });
            float x = origin[0] + width.get() * 0.5f, y = origin[1] + height.get() * 0.84f;
            long down = SystemClock.uptimeMillis();
            touch(MotionEvent.ACTION_DOWN, x, y, down);
            Thread.sleep(100);
            touch(MotionEvent.ACTION_MOVE, origin[0] + width.get() * 0.74f, y, down);
            await("window.__breach.level.aim && window.__breach.level.aim.angle > 0.1");
            touch(MotionEvent.ACTION_UP, origin[0] + width.get() * 0.74f, y, down);
            await("window.__breach.level.balls.some(b => !b.caught && !b.dead)");
            down = SystemClock.uptimeMillis();
            touch(MotionEvent.ACTION_DOWN, x, y, down);
            touch(MotionEvent.ACTION_MOVE, origin[0] + width.get() * 0.74f, y, down);
            await("window.__breach.level.paddle.x > 220");
            touch(MotionEvent.ACTION_UP, origin[0] + width.get() * 0.74f, y, down);
            screenshot("02-invasion-touch-serve");
            js("window.__breach.start(1)");
            await("window.__breach.level.phase !== 'intro'");
            assertEquals("true", js("window.__breach.level.bricksBroken === 0 && window.__breach.level.venom.contacts.hits === 0"));
            screenshot("03-vault-entry");
            assertNull("No errors before Activity recreation", activity.pageError);
            js("localStorage.setItem('breach.previewSmoke', 'true')");
            scenario.recreate();
            scenario.onActivity(value -> activity = value);
            awaitCanvas();
            assertEquals("\"true\"", js("localStorage.getItem('breach.previewSmoke')"));
            assertNull("No WebView console or load errors", activity.pageError);
            screenshot("04-restored-menu");
        }
    }
}
