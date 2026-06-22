"use strict";

const fs = require("fs");
const path = require("path");

const LOG_PREFIX = "[ssl-bypass-disable]";
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

const SSL_ERROR_METHOD_SIGNATURE =
  /(^[ \t]*(?:@[\w$.]+(?:\([^)]*\))?[ \t]*\r?\n[ \t]*)*(?:(?:public|protected|private)[ \t]+)?(?:(?:static|final|synchronized)[ \t]+)*void[ \t]+onReceivedSslError[ \t]*\([^)]*\)[ \t]*\{)/gm;

function logInfo(logger, message) {
  const target = logger && typeof logger.log === "function" ? logger : console;
  target.log(`${LOG_PREFIX} ${message}`);
}

function logError(logger, message) {
  const target =
    logger && typeof logger.error === "function" ? logger : console;
  target.error(`${LOG_PREFIX} ${message}`);
}

function findMatchingBrace(source, openingBraceIndex) {
  let depth = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let index = openingBraceIndex; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    const previous = source[index - 1];

    if (inLineComment) {
      if (char === "\n") {
        inLineComment = false;
      }
      continue;
    }

    if (inBlockComment) {
      if (char === "*" && next === "/") {
        inBlockComment = false;
        index += 1;
      }
      continue;
    }

    if (inSingleQuote) {
      // Count preceding backslashes; quote is escaped only if odd number precede it
      if (char === "'") {
        let backslashCount = 0;
        for (let i = index - 1; i >= 0 && source[i] === "\\"; i -= 1) {
          backslashCount += 1;
        }
        if (backslashCount % 2 === 0) {
          inSingleQuote = false;
        }
      }
      continue;
    }

    if (inDoubleQuote) {
      // Count preceding backslashes; quote is escaped only if odd number precede it
      if (char === '"') {
        let backslashCount = 0;
        for (let i = index - 1; i >= 0 && source[i] === "\\"; i -= 1) {
          backslashCount += 1;
        }
        if (backslashCount % 2 === 0) {
          inDoubleQuote = false;
        }
      }
      continue;
    }

    if (char === "/" && next === "/") {
      inLineComment = true;
      index += 1;
      continue;
    }

    if (char === "/" && next === "*") {
      inBlockComment = true;
      index += 1;
      continue;
    }

    if (char === "'") {
      inSingleQuote = true;
      continue;
    }

    if (char === '"') {
      inDoubleQuote = true;
      continue;
    }

    if (char === "{") {
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
}

function removeSslErrorOverride(javaSource) {
  let source = javaSource;
  let removedMethods = 0;

  SSL_ERROR_METHOD_SIGNATURE.lastIndex = 0;

  while (true) {
    const match = SSL_ERROR_METHOD_SIGNATURE.exec(source);
    if (!match) {
      break;
    }

    const methodStart = match.index;
    const openingBraceIndex = source.indexOf("{", methodStart);
    if (openingBraceIndex < 0) {
      break;
    }

    const methodEnd = findMatchingBrace(source, openingBraceIndex);
    if (methodEnd < 0) {
      throw new Error(
        "Found onReceivedSslError signature but could not find method end",
      );
    }

    let removeEndExclusive = methodEnd + 1;
    while (
      removeEndExclusive < source.length &&
      (source[removeEndExclusive] === " " ||
        source[removeEndExclusive] === "\t")
    ) {
      removeEndExclusive += 1;
    }
    if (source.slice(removeEndExclusive, removeEndExclusive + 2) === "\r\n") {
      removeEndExclusive += 2;
    } else if (source[removeEndExclusive] === "\n") {
      removeEndExclusive += 1;
    }

    source = `${source.slice(0, methodStart)}${source.slice(removeEndExclusive)}`;
    removedMethods += 1;

    SSL_ERROR_METHOD_SIGNATURE.lastIndex = methodStart;
  }

  const normalizedSource = source.replace(/\r?\n\r?\n\r?\n+/g, "\n\n");

  return {
    changed: removedMethods > 0,
    removedMethods,
    source: normalizedSource,
  };
}

function runDisableSslBypass(projectRoot, logger) {
  const rootDir = projectRoot || process.cwd();
  const targetPath = path.join(rootDir, TARGET_RELATIVE_PATH);

  logInfo(logger, "Disabling Android debug SSL bypass override");
  logInfo(logger, `Target file: ${targetPath}`);

  if (!fs.existsSync(targetPath)) {
    throw new Error(`Required file not found: ${targetPath}`);
  }

  const original = fs.readFileSync(targetPath, "utf8");
  const result = removeSslErrorOverride(original);

  if (!result.changed) {
    logInfo(logger, "No onReceivedSslError override found; nothing to change");
    return result;
  }

  fs.writeFileSync(targetPath, result.source, "utf8");
  logInfo(
    logger,
    `Removed ${result.removedMethods} onReceivedSslError override(s)`,
  );
  logInfo(logger, "Android debug SSL bypass override is disabled");

  return result;
}

function cordovaHook(context) {
  try {
    const projectRoot =
      context &&
      context.opts &&
      typeof context.opts.projectRoot === "string" &&
      context.opts.projectRoot.length > 0
        ? context.opts.projectRoot
        : process.cwd();

    runDisableSslBypass(projectRoot, console);
  } catch (error) {
    logError(console, error.message);
    throw error;
  }
}

module.exports = cordovaHook;
module.exports.runDisableSslBypass = runDisableSslBypass;
module.exports.removeSslErrorOverride = removeSslErrorOverride;
