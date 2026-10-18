package com.mahikshith.breach.preview;

import android.graphics.Bitmap;
import android.os.SystemClock;
import android.os.ParcelFileDescriptor;
import android.os.Build;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.util.Log;
import androidx.test.core.app.ActivityScenario;
import androidx.lifecycle.Lifecycle;
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

    private void awaitCarrierArt() throws Exception {
        // Inspect a real render without replacing any live renderer or image.
        await("(() => { const l=window.__breach.level,c=document.createElement('canvas'); c.width=l.W; c.height=l.H; const g=c.getContext('2d'),images=new Set(),p=new Proxy(g,{get:(t,k)=>k==='drawImage'?(image,...args)=>{if(image instanceof HTMLImageElement)images.add(image);return t.drawImage(image,...args);}:typeof t[k]==='function'?t[k].bind(t):t[k],set:(t,k,v)=>{t[k]=v;return true;}}); l.draw(p); return images.size>=15 && [...images].every(i=>i.complete && i.naturalWidth>0 && i.src.startsWith('data:image/')); })()");
    }

    private void awaitSystemBars(boolean visible) throws Exception {
        if (Build.VERSION.SDK_INT < 30) return;
        long until = SystemClock.uptimeMillis() + 5000;
        long matchedSince = 0;
        boolean[] ready = new boolean[1];
        while (SystemClock.uptimeMillis() < until) {
            InstrumentationRegistry.getInstrumentation().runOnMainSync(() -> {
                WindowInsets insets = activity.getWindow().getDecorView().getRootWindowInsets();
                ready[0] = activity.hasWindowFocus() && activity.game.hasWindowFocus()
                    && activity.game.isAttachedToWindow() && insets != null
                    && insets.isVisible(WindowInsets.Type.statusBars()) == visible
                    && insets.isVisible(WindowInsets.Type.navigationBars()) == visible;
            });
            // Wait through the show/hide animation, not its first matching frame.
            if (!ready[0]) matchedSince = 0;
            else if (matchedSince == 0) matchedSince = SystemClock.uptimeMillis();
            else if (SystemClock.uptimeMillis() - matchedSince >= 500) return;
            Thread.sleep(50);
        }
        fail("System bars did not become " + (visible ? "visible" : "hidden"));
    }

    private void assertFullscreenAndSafeArea(String phase) throws Exception {
        Log.i("BreachSmoke", phase + ": fullscreen and safe area");
        InstrumentationRegistry.getInstrumentation().runOnMainSync(() ->
            Log.i("BreachSmoke", phase + ": activityFocus=" + activity.hasWindowFocus()
                + ", webWindowFocus=" + activity.game.hasWindowFocus() + ", webFocus=" + activity.game.hasFocus()));
        await("document.hasFocus()");
        awaitSystemBars(false);
        int[] position = new int[2], expected = new int[4], decor = new int[2], window = new int[2];
        AtomicReference<WindowInsets> snapshot = new AtomicReference<>();
        InstrumentationRegistry.getInstrumentation().runOnMainSync(() -> {
            activity.game.getLocationOnScreen(position);
            expected[0] = activity.game.getWidth(); expected[1] = activity.game.getHeight();
            decor[0] = activity.getWindow().getDecorView().getWidth();
            decor[1] = activity.getWindow().getDecorView().getHeight();
            snapshot.set(activity.getWindow().getDecorView().getRootWindowInsets());
            if (Build.VERSION.SDK_INT >= 30) {
                window[0] = activity.getWindowManager().getCurrentWindowMetrics().getBounds().width();
                window[1] = activity.getWindowManager().getCurrentWindowMetrics().getBounds().height();
            }
            for (View ancestor = activity.game; ancestor != null;
                    ancestor = ancestor.getParent() instanceof View ? (View) ancestor.getParent() : null) {
                int[] at = new int[2]; ancestor.getLocationOnScreen(at);
                ViewGroup.LayoutParams layout = ancestor.getLayoutParams();
                String margins = "";
                if (layout instanceof ViewGroup.MarginLayoutParams) {
                    ViewGroup.MarginLayoutParams m = (ViewGroup.MarginLayoutParams) layout;
                    margins = ", margins=" + m.leftMargin + "," + m.topMargin + "," + m.rightMargin + "," + m.bottomMargin;
                }
                Log.i("BreachSmoke", phase + ": " + ancestor.getClass().getSimpleName()
                    + " at=" + at[0] + "," + at[1] + " size=" + ancestor.getWidth() + "x" + ancestor.getHeight()
                    + " fits=" + ancestor.getFitsSystemWindows() + " padding=" + ancestor.getPaddingLeft()
                    + "," + ancestor.getPaddingTop() + "," + ancestor.getPaddingRight() + "," + ancestor.getPaddingBottom()
                    + " ui=0x" + Integer.toHexString(ancestor.getSystemUiVisibility()) + margins);
            }
        });
        assertEquals(phase + ": canvas starts at screen left", 0, position[0]);
        assertEquals(phase + ": canvas starts at screen top", 0, position[1]);
        assertEquals(phase + ": canvas fills window width", decor[0], expected[0]);
        assertEquals(phase + ": canvas fills window height", decor[1], expected[1]);
        WindowInsets insets = snapshot.get();
        assertNotNull(phase + ": native window insets", insets);
        if (Build.VERSION.SDK_INT >= 28 && insets.getDisplayCutout() != null) {
            expected[2] = insets.getDisplayCutout().getSafeInsetTop();
            expected[3] = insets.getDisplayCutout().getSafeInsetBottom();
        }
        if (Build.VERSION.SDK_INT >= 29) expected[3] = Math.max(expected[3], insets.getMandatorySystemGestureInsets().bottom);
        if (Build.VERSION.SDK_INT >= 30) {
            assertEquals(phase + ": full screen width", window[0], expected[0]);
            assertEquals(phase + ": full screen height", window[1], expected[1]);
            assertFalse(phase + ": status bar hidden", insets.isVisible(WindowInsets.Type.statusBars()));
            assertFalse(phase + ": navigation bar hidden", insets.isVisible(WindowInsets.Type.navigationBars()));
        }
        await("(() => { const s=getComputedStyle(document.getElementById('safe')), r=document.getElementById('game').getBoundingClientRect(), d=devicePixelRatio; return Math.abs(parseFloat(s.paddingTop)-" + expected[2] + "/d)<.01 && Math.abs(parseFloat(s.paddingBottom)-" + expected[3] + "/d)<.01 && Math.abs(r.top)<1 && Math.abs(r.left)<1 && Math.abs(r.width*d-" + expected[0] + ")<2 && Math.abs(r.height*d-" + expected[1] + ")<2; })()");
    }

    private void screenshot(String name) throws Exception {
        Log.i("BreachSmoke", "capture " + name);
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
        String diagnostics = name.equals("00-failure") ? " && dumpsys window > '" + destination + "/failure-window.txt'" : "";
        String command = "(mkdir -p '" + destination + "' && cp '" + capture.getAbsolutePath()
            + "' '" + destination + "/" + name + ".png'" + diagnostics + " && echo CAPTURE_OK) 2>&1\n";
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

    @Test public void offlineCarrierTouchFullscreenAndVault() throws Exception {
        try (ActivityScenario<MainActivity> scenario = ActivityScenario.launch(MainActivity.class)) {
            try {
                scenario.onActivity(value -> activity = value);
                awaitCanvas();
                assertFullscreenAndSafeArea("menu");
                screenshot("01-menu");
                js("window.__breach.start(0)");
                await("window.__breach.level.t > 0.3");
                assertEquals("Carrier mechanics and actual art assembly", "true", js("(() => { const l=window.__breach.level; return l.name==='Carrier Breakout' && l.carrier.hp===36 && l.crew.length===5 && l.bricks.length===16 && l.guns.length===2 && l.paddle.baseW===125 && l.paddle.h===17 && l.ballRadius===7.5 && l.balls[0].r===7.5 && l.coreMode==='titan'; })()"));
                awaitCarrierArt();
                assertEquals("A held opening serve does not start enemy combat", "true", js("window.__breach.level.clock===0 && window.__breach.level.fighters.length===0"));
                assertFullscreenAndSafeArea("carrier");
                assertEquals("Lower paddle geometry", "true", js("Math.abs((window.__breach.level.H-window.__breach.level.paddle.y)*window.__breach.level.kitUIScale-126)<.6"));
                if (Build.VERSION.SDK_INT >= 30) {
                    js("window.__previewLevel=window.__breach.level");
                    scenario.onActivity(value -> value.getWindow().getInsetsController().show(WindowInsets.Type.systemBars()));
                    awaitSystemBars(true);
                    scenario.onActivity(value -> value.getWindow().getInsetsController().hide(WindowInsets.Type.systemBars()));
                    assertFullscreenAndSafeArea("transient bars restored");
                    assertEquals("Transient bars preserve the live level", "true", js("window.__breach.level===window.__previewLevel"));
                }
                await("document.hasFocus()");
                int[] origin = new int[2];
                AtomicReference<Integer> width = new AtomicReference<>(), height = new AtomicReference<>();
                scenario.onActivity(value -> { value.game.getLocationOnScreen(origin); width.set(value.game.getWidth()); height.set(value.game.getHeight()); });
                float x = origin[0] + width.get() * 0.5f, y = origin[1] + height.get() * 0.94f;
                long down = SystemClock.uptimeMillis();
                touch(MotionEvent.ACTION_DOWN, x, y, down);
                await("window.__breach.level.ptr.down");
                js("window.__previewLevel=window.__breach.level");
                scenario.moveToState(Lifecycle.State.CREATED);
                await("!window.__breach.level.ptr.down");
                String pausedTime = js("window.__breach.level.t");
                Thread.sleep(250);
                assertEquals("Stopped Activity does not advance game time", pausedTime, js("window.__breach.level.t"));
                scenario.moveToState(Lifecycle.State.RESUMED);
                assertFullscreenAndSafeArea("resumed carrier");
                assertEquals("Resume preserves the level and cancels held input", "true", js("window.__breach.level===window.__previewLevel && !window.__breach.level.ptr.down && window.__breach.level.balls[0].caught"));
                screenshot("02a-resumed-carrier");
                touch(MotionEvent.ACTION_CANCEL, x, y, down);
                down = SystemClock.uptimeMillis();
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
                assertEquals("First deliberate catch press acknowledged", "true", js("localStorage.getItem('breach.aimReadySeen')==='true'"));
                screenshot("02-carrier-touch-serve");
                await("window.__breach.level.clock>2.4 && window.__breach.level.fighters.filter(f=>window.__breach.level.clock>=f.born).length===3");
                assertEquals("The real hangar opens for its three fighters", "true", js("window.__breach.level.doorPose()>.99"));
                screenshot("03-carrier-fighter-launch");
                js("window.__breach.start(1)");
                await("window.__breach.level.phase !== 'intro'");
                assertFullscreenAndSafeArea("vault");
                assertEquals("true", js("window.__breach.level.bricksBroken === 0 && window.__breach.level.venom.contacts.hits === 0"));
                assertEquals("Vault name, original paddle, ball and Kit role", "[\"The Vault\",70,12,6,6,\"ward\"]", js("(() => { const l=window.__breach.level; return [l.name,l.paddle.baseW,l.paddle.h,l.ballRadius,l.balls[0].r,l.coreMode]; })()"));
                screenshot("04-vault-entry");
                assertNull("No errors before Activity recreation", activity.pageError);
                js("localStorage.setItem('breach.previewSmoke', 'true')");
                scenario.recreate();
                scenario.onActivity(value -> activity = value);
                awaitCanvas();
                assertFullscreenAndSafeArea("recreated menu");
                assertEquals("\"true\"", js("localStorage.getItem('breach.previewSmoke')"));
                assertEquals("Catch lesson acknowledgement survives recreation", "true", js("localStorage.getItem('breach.aimReadySeen')==='true'"));
                assertNull("No WebView console or load errors", activity.pageError);
                screenshot("05-restored-menu");
                js("window.__breach.start(0)");
                awaitCarrierArt();
                assertEquals("Recreated Carrier retains acknowledged controls", "true", js("window.__breach.level.aimReadySeen && window.__breach.level.ballRadius===7.5"));
                assertNull("No errors after recreated Carrier art decode", activity.pageError);
                screenshot("06-restored-carrier");
            } catch (Exception | AssertionError failure) {
                try { screenshot("00-failure"); }
                catch (Exception | AssertionError captureFailure) { failure.addSuppressed(captureFailure); }
                throw failure;
            }
        }
    }
}
