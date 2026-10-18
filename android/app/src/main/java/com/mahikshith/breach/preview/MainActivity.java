package com.mahikshith.breach.preview;

import android.app.Activity;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;

public class MainActivity extends Activity {
    WebView game;
    volatile String pageError;
    private int safeTopPx, safeBottomPx;

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.rgb(7, 8, 15));
        getWindow().setNavigationBarColor(Color.rgb(7, 8, 15));
        FrameLayout frame = new FrameLayout(this);
        frame.setBackgroundColor(Color.rgb(7, 8, 15));
        game = new WebView(this);
        game.setBackgroundColor(Color.rgb(7, 8, 15));
        game.setOverScrollMode(View.OVER_SCROLL_NEVER);
        game.setFocusableInTouchMode(true);
        frame.setOnApplyWindowInsetsListener((view, insets) -> {
            safeTopPx = Build.VERSION.SDK_INT >= 28 && insets.getDisplayCutout() != null ? insets.getDisplayCutout().getSafeInsetTop() : 0;
            safeBottomPx = Build.VERSION.SDK_INT >= 29 ? insets.getMandatorySystemGestureInsets().bottom : 0;
            if (Build.VERSION.SDK_INT >= 28 && insets.getDisplayCutout() != null) safeBottomPx = Math.max(safeBottomPx, insets.getDisplayCutout().getSafeInsetBottom());
            applySafeArea();
            return Build.VERSION.SDK_INT >= 30 ? WindowInsets.CONSUMED : insets.consumeSystemWindowInsets();
        });
        game.getSettings().setJavaScriptEnabled(true);
        game.getSettings().setDomStorageEnabled(true);
        game.getSettings().setAllowFileAccess(false);
        game.getSettings().setAllowContentAccess(false);
        game.setWebViewClient(new WebViewClient() {
            @Override public void onPageFinished(WebView view, String url) {
                applySafeArea();
                // Recreation can preserve window focus while replacing its unfocused WebView.
                view.post(() -> {
                    if (view.isAttachedToWindow() && view.hasWindowFocus()) {
                        fullscreen();
                        view.requestFocus();
                        view.requestApplyInsets();
                    }
                });
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return !request.getUrl().toString().startsWith("file:///android_asset/");
            }
            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) pageError = error.getDescription().toString();
            }
        });
        game.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onConsoleMessage(ConsoleMessage message) {
                if (message.messageLevel() == ConsoleMessage.MessageLevel.ERROR) pageError = message.message();
                return true;
            }
        });
        frame.addView(game, new FrameLayout.LayoutParams(-1, -1));
        setContentView(frame);
        fullscreen();
        game.loadUrl("file:///android_asset/breach.html");
    }

    private void applySafeArea() {
        // Keep the canvas edge to edge; only controls use cutout/gesture safety.
        game.evaluateJavascript("(() => { const e=document.getElementById('safe'); if(!e)return; const t="
            + safeTopPx + "/devicePixelRatio, b=" + safeBottomPx
            + "/devicePixelRatio, s=getComputedStyle(e); if(Math.abs(parseFloat(s.paddingTop)-t)>.001 || Math.abs(parseFloat(s.paddingBottom)-b)>.001) { e.style.paddingTop=t+'px'; e.style.paddingBottom=b+'px'; window.dispatchEvent(new Event('resize')); } })()", null);
    }

    private void fullscreen() {
        if (Build.VERSION.SDK_INT >= 30) {
            if (Build.VERSION.SDK_INT == 35) {
                // Keep Android 15's preserved-decor compatibility applier from fitting content.
                View decor = getWindow().getDecorView();
                decor.setSystemUiVisibility(decor.getSystemUiVisibility() | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
            }
            getWindow().setDecorFitsSystemWindows(false);
            WindowManager.LayoutParams attributes = getWindow().getAttributes();
            attributes.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_ALWAYS;
            getWindow().setAttributes(attributes);
            WindowInsetsController controller = getWindow().getInsetsController();
            if (controller != null) {
                controller.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
                controller.hide(WindowInsets.Type.systemBars());
            }
        } else {
            if (Build.VERSION.SDK_INT >= 28) {
                WindowManager.LayoutParams attributes = getWindow().getAttributes();
                attributes.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
                getWindow().setAttributes(attributes);
            }
            getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
        }
    }

    @Override public void onWindowFocusChanged(boolean focused) {
        super.onWindowFocusChanged(focused);
        if (focused) {
            fullscreen();
            game.requestFocus();
        }
    }

    @Override protected void onPause() {
        game.evaluateJavascript("window.dispatchEvent(new Event('blur'))", null);
        game.onPause();
        game.pauseTimers();
        super.onPause();
    }
    @Override protected void onResume() {
        super.onResume();
        fullscreen();
        game.resumeTimers();
        game.onResume();
    }
    @Override protected void onDestroy() {
        if (game.getParent() instanceof ViewGroup) ((ViewGroup) game.getParent()).removeView(game);
        game.destroy();
        super.onDestroy();
    }
}
