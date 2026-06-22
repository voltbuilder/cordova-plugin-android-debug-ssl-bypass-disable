# cordova-plugin-android-debug-ssl-bypass-disable

A Cordova plugin to disable the default SSL error bypass in Android debug builds

## Usage

Include this plugin in the `package.json` or `config.xml` of your Cordova project. It will automatically disable the SSL error bypass that normally happens for Android debug builds - that is certificate errors will be reported, rather than silently ignored.

This will have no effect on release builds, or platforms other than Android.

## How it works

On `after_platform_add` for Android, the plugin hook updates this file in your project:

- `platforms/android/CordovaLib/src/org/apache/cordova/engine/SystemWebViewClient.java`

The hook removes the `onReceivedSslError` override from `SystemWebViewClient` so that certificate errors are not bypassed during debug builds.

- If the target file does not exist, the hook fails with an error.
- If the override is already absent, the hook succeeds as a no-op.
- The hook writes prefixed logs so users can see exactly what happened during platform add.

## Development

- Install dependencies: `npm ci`
- Check formatting: `npm test`
- Apply formatting: `npm run format`

## CI

GitHub Actions validates pull requests against `main` and pushes to `main` by running `npm test`.

## Dependency updates

Dependabot opens weekly pull requests for npm and GitHub Actions dependency updates.
