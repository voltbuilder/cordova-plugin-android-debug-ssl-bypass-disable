package org.apache.cordova.engine;

import android.net.http.SslError;
import android.os.Build;
import android.webkit.SslErrorHandler;
import android.webkit.WebView;

public class SystemWebViewClient {
    @Override
    public void onReceivedSslError(
            WebView view,
            SslErrorHandler handler,
            SslError error
    ) {
        final boolean canBypass = Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT;
        // Some Cordova versions added extra lines before handler.proceed().
        if (canBypass && view != null) {
            handler.proceed();
            return;
        }
        super.onReceivedSslError(view, handler, error);
    }

    protected void keepMe() {
        System.out.println("still here");
    }
}
