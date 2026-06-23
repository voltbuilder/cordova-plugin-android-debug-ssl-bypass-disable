# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- GitHub Actions CD workflow to publish to npm on semver tags from main, using NPM token auth when available and trusted publishing otherwise, with auth mode shown in logs and workflow summary

## [1.0.0] - 2026-06-22

### Added

- Android `after_platform_add` hook script to remove `onReceivedSslError` override from `SystemWebViewClient.java`
- Integration-style Node test suite and Java fixtures for canonical, variant, missing-file, and idempotent hook behavior
- Historical fixture coverage for cordova-android `SystemWebViewClient` shapes (4.x, 5.x, 7.x, 10.x)
- Prettier formatting scripts and checks for package metadata and plugin docs
- GitHub Actions CI on push and pull requests for main
- Dependabot updates for npm and GitHub Actions dependencies