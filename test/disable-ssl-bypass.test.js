"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { runDisableSslBypass } = require("../scripts/disable-ssl-bypass.js");

const FIXTURES_DIR = path.join(__dirname, "fixtures");
const TARGET_RELATIVE_PATH = path.join(
  "platforms",
  "android",
  "CordovaLib",
  "src",
  "org",
  "apache",
  "cordova",
  "engine",
  "SystemWebViewClient.java",
);

function createLoggerCapture() {
  const info = [];
  const errors = [];

  return {
    info,
    errors,
    logger: {
      log(message) {
        info.push(String(message));
      },
      error(message) {
        errors.push(String(message));
      },
    },
  };
}

function createTempProject() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "ssl-bypass-disable-"));
}

function targetPathFor(projectRoot) {
  return path.join(projectRoot, TARGET_RELATIVE_PATH);
}

function writeFixture(projectRoot, fixtureFileName) {
  const fixturePath = path.join(FIXTURES_DIR, fixtureFileName);
  const targetPath = targetPathFor(projectRoot);
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, fs.readFileSync(fixturePath, "utf8"), "utf8");
}

function cleanupProject(projectRoot) {
  fs.rmSync(projectRoot, { recursive: true, force: true });
}

test("fails when SystemWebViewClient.java does not exist", () => {
  const projectRoot = createTempProject();
  const { logger, info } = createLoggerCapture();

  assert.throws(
    () => runDisableSslBypass(projectRoot, logger),
    /Required file not found: .*SystemWebViewClient\.java/,
  );
  assert.ok(info.some((message) => message.includes("Target file:")));

  cleanupProject(projectRoot);
});

test("removes canonical onReceivedSslError override", () => {
  const projectRoot = createTempProject();
  writeFixture(projectRoot, "SystemWebViewClient.java");

  const { logger, info } = createLoggerCapture();
  const result = runDisableSslBypass(projectRoot, logger);

  assert.equal(result.changed, true);
  assert.equal(result.removedMethods, 1);

  const updated = fs.readFileSync(targetPathFor(projectRoot), "utf8");
  assert.equal(updated.includes("onReceivedSslError"), false);
  assert.equal(updated.includes("handler.proceed"), false);
  assert.ok(updated.includes("onPageFinished"));
  assert.ok(info.some((message) => message.includes("Removed 1")));

  cleanupProject(projectRoot);
});

test("removes variant override with extra leading logic", () => {
  const projectRoot = createTempProject();
  writeFixture(projectRoot, "SystemWebViewClient.variant.java");

  const { logger } = createLoggerCapture();
  const result = runDisableSslBypass(projectRoot, logger);

  assert.equal(result.changed, true);
  assert.equal(result.removedMethods, 1);

  const updated = fs.readFileSync(targetPathFor(projectRoot), "utf8");
  assert.equal(updated.includes("onReceivedSslError"), false);
  assert.ok(updated.includes("keepMe"));

  cleanupProject(projectRoot);
});

test("removes override from historical cordova-android tag fixtures", () => {
  const historicalFixtures = [
    "SystemWebViewClient.tag-4.0.0.java",
    "SystemWebViewClient.tag-5.1.0.java",
    "SystemWebViewClient.tag-7.0.0.java",
    "SystemWebViewClient.rel-10.1.2.java",
  ];

  for (const fixtureFile of historicalFixtures) {
    const projectRoot = createTempProject();
    writeFixture(projectRoot, fixtureFile);

    const { logger } = createLoggerCapture();
    const result = runDisableSslBypass(projectRoot, logger);

    assert.equal(result.changed, true, `expected change for ${fixtureFile}`);
    assert.equal(
      result.removedMethods,
      1,
      `expected one removal for ${fixtureFile}`,
    );

    const updated = fs.readFileSync(targetPathFor(projectRoot), "utf8");
    assert.equal(
      updated.includes("onReceivedSslError"),
      false,
      `method should be removed for ${fixtureFile}`,
    );
    assert.equal(
      updated.includes("handler.proceed"),
      false,
      `handler.proceed should be removed for ${fixtureFile}`,
    );

    cleanupProject(projectRoot);
  }
});

test("is idempotent when override has already been removed", () => {
  const projectRoot = createTempProject();
  writeFixture(projectRoot, "SystemWebViewClient.no-method.java");

  const { logger, info } = createLoggerCapture();
  const result = runDisableSslBypass(projectRoot, logger);

  assert.equal(result.changed, false);
  assert.equal(result.removedMethods, 0);
  assert.ok(
    info.some((message) =>
      message.includes("No onReceivedSslError override found"),
    ),
  );

  cleanupProject(projectRoot);
});

test("second run is a no-op after successful removal", () => {
  const projectRoot = createTempProject();
  writeFixture(projectRoot, "SystemWebViewClient.java");

  const first = createLoggerCapture();
  const second = createLoggerCapture();

  const firstRun = runDisableSslBypass(projectRoot, first.logger);
  const secondRun = runDisableSslBypass(projectRoot, second.logger);

  assert.equal(firstRun.changed, true);
  assert.equal(secondRun.changed, false);
  assert.ok(
    second.info.some((message) =>
      message.includes("No onReceivedSslError override found"),
    ),
  );

  cleanupProject(projectRoot);
});
