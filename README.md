# cordova-plugin-android-debug-ssl-bypass-disable

A Cordova plugin to disable the default SSL error bypass in Android debug builds

## Usage

Include this plugin in the `package.json` or `config.xml` of your Cordova project. It will automatically disable the SSL error bypass that normally happens for Android debug builds - that is certificate errors will be reported, rather than silently ignored.

This will have no effect on release builds, or platforms other than Android.
