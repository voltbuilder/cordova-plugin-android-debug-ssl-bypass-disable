# cordova-plugin-android-debug-ssl-bypass-disable

A Cordova plugin to disable the default SSL error bypass in Android debug builds.

## Installation

Add this plugin to your Cordova project using:

```bash
cordova plugin add npm:cordova-plugin-android-debug-ssl-bypass-disable@1.0.0
```

Or include it in your project's `package.json`:

```json
{
  "cordova": {
    "plugins": {
      "cordova-plugin-android-debug-ssl-bypass-disable": {}
    }
  }
}
```

## Compatibility

- **Platforms:** Android only
- **Cordova Android:** >=4.0.0
- **No effect on:** iOS, other platforms, or release builds

This plugin has no effect on release builds, iOS, or other Cordova platforms.

## Usage

Once installed, this plugin automatically disables the default SSL error bypass that normally occurs for Android debug builds. This means certificate errors will be reported to your application instead of being silently ignored.

Include this plugin in the `package.json` or `config.xml` of your Cordova project. It will automatically disable the SSL error bypass that normally happens for Android debug builds—that is, certificate errors will be reported, rather than silently ignored.

## How it works

On `after_platform_add` for Android, the plugin hook updates this file in your project:

- `platforms/android/CordovaLib/src/org/apache/cordova/engine/SystemWebViewClient.java`

The hook removes the `onReceivedSslError` override from `SystemWebViewClient` so that certificate errors are not bypassed during debug builds.

**Hook behavior:**

- If the target file does not exist, the hook fails with an error.
- If the override is already absent, the hook succeeds as a no-op (idempotent).
- The hook writes prefixed logs so users can see exactly what happened during platform add.

## Troubleshooting

### Error: "Required file not found"

This error occurs when the plugin cannot locate the `SystemWebViewClient.java` file. This typically means:

- The Android platform has not been added to your Cordova project yet
- The cordova-android version is older than 4.0.0

**Solution:** Ensure you're using cordova-android >=4.0.0, and that you've added the Android platform to your project:

```bash
cordova platform add android@latest
```

Then re-add this plugin or run `cordova prepare android`.

### No logs during `cordova platform add`

If the plugin hook doesn't produce any output, this is normal—the hook runs silently if it completes successfully. You can verify the hook is working by checking that the `onReceivedSslError` method has been removed from the `SystemWebViewClient.java` file.

## Development

- Install dependencies: `npm ci`
- Check formatting: `npm test`
- Apply formatting: `npm run format`

## CI

GitHub Actions validates pull requests against `main` and pushes to `main` by running `npm test`.

## Dependency updates

Dependabot opens weekly pull requests for npm and GitHub Actions dependency updates.
