package org.apache.cordova.engine;

import android.net.http.SslError;
import android.webkit.SslErrorHandler;
import android.webkit.WebView;

public class SystemWebViewClient {
    @Override
    public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
        if (view.getContext() != null) {
            handler.proceed();
            return;
        }
        super.onReceivedSslError(view, handler, error);
    }

    @Override
    public void onPageFinished(WebView view, String url) {
        super.onPageFinished(view, url);
    }
}
