# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

- add Android `after_platform_add` hook script to remove `onReceivedSslError` override from `SystemWebViewClient.java`
- add integration-style Node test suite and Java fixtures for canonical, variant, missing-file, and idempotent hook behavior
- add historical fixture coverage for cordova-android `SystemWebViewClient` shapes (4.x, 5.x, 7.x, 10.x)
- add Prettier formatting scripts and checks for package metadata and plugin docs
- add GitHub Actions CI on push and pull requests for main
- add Dependabot updates for npm and GitHub Actions dependencies