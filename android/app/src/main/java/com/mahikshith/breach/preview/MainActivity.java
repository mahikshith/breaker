package com.mahikshith.breach.preview;

import android.app.Activity;
import android.graphics.Color;
import android.graphics.Insets;
import android.os.Build;
import android.os.Bundle;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.view.WindowInsets;
import android.widget.FrameLayout;

public class MainActivity extends Activity {
    WebView game;
    volatile String pageError;

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.rgb(7, 8, 15));
        getWindow().setNavigationBarColor(Color.rgb(7, 8, 15));
        FrameLayout frame = new FrameLayout(this);
        frame.setBackgroundColor(Color.rgb(7, 8, 15));
        if (Build.VERSION.SDK_INT >= 30) {
            getWindow().setDecorFitsSystemWindows(false);
            frame.setOnApplyWindowInsetsListener((view, insets) -> {
                Insets safe = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                view.setPadding(safe.left, safe.top, safe.right, safe.bottom);
                return insets;
            });
        }
        game = new WebView(this);
        game.setBackgroundColor(Color.rgb(7, 8, 15));
        game.getSettings().setJavaScriptEnabled(true);
        game.getSettings().setDomStorageEnabled(true);
        game.getSettings().setAllowFileAccess(false);
        game.getSettings().setAllowContentAccess(false);
        game.setWebViewClient(new WebViewClient() {
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
        game.loadUrl("file:///android_asset/breach.html");
    }

    @Override protected void onPause() {
        game.evaluateJavascript("window.dispatchEvent(new Event('blur'))", null);
        game.onPause();
        game.pauseTimers();
        super.onPause();
    }
    @Override protected void onResume() {
        super.onResume();
        game.resumeTimers();
        game.onResume();
    }
    @Override protected void onDestroy() {
        game.destroy();
        super.onDestroy();
    }
}
